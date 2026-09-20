'use strict';

// Run: node --test tests/render-deck.test.js
// No browser or artifacts: exercise the real helpers with CDP/WebSocket stubs.
var assert = require('node:assert/strict');
var test = require('node:test');
var vm = require('node:vm');
var helpers = require('./render-deck.js');

function fixture(size, mutate, intercept) {
  var bytes = Buffer.alloc(size);
  for (var i = 0; i < size; i++) bytes[i] = i % 251;
  var value = {
    base64: bytes.toString('base64'), bytes: size,
    density: [{ kind: 'sparse', fill: 0.3, title: '测试', hint: 'Keep this' }],
    skipped: [{ src: 'local.png', reason: 'Fixture' }]
  };
  if (mutate) mutate(value);
  var calls = [];
  var frames = [];
  async function send(method, params) {
    calls.push({ method: method, params: params });
    if (intercept) {
      var override = intercept(method, params);
      if (override !== undefined) return override;
    }
    if (method === 'Runtime.evaluate') {
      assert.equal(params.returnByValue, false);
      assert.equal(params.awaitPromise, true);
      return { result: { type: 'object', objectId: 'export-1' } };
    }
    assert.equal(params.objectId, 'export-1');
    if (method === 'Runtime.releaseObject') return {};
    assert.equal(method, 'Runtime.callFunctionOn');
    assert.equal(params.returnByValue, true);
    var args = (params.arguments || []).map(function (a) { return a.value; });
    var fn = vm.runInNewContext('(' + params.functionDeclaration + ')');
    var response;
    try {
      var result = fn.apply(value, args);
      response = { result: { type: typeof result, value: result } };
    } catch (err) {
      response = { exceptionDetails: { text: err.message } };
    }
    var json = JSON.stringify(response);
    frames.push(Buffer.byteLength(json));
    assert.ok(Buffer.byteLength(json) <= 1024 * 1024 + 1024, 'bounded response frame');
    if (!params.arguments && response.result) {
      assert.equal(Object.hasOwn(response.result.value, 'base64'), false);
    }
    return JSON.parse(json);
  }
  return { bytes: bytes, value: value, send: send, calls: calls, frames: frames };
}

test('small, chunk boundaries and diagnosed >4 MiB payloads round-trip with metadata', async function () {
  for (var size of [1, 2, 3, 786431, 786432, 786433, 3329704, 3650713]) {
    var f = fixture(size);
    var result = await helpers.readExportResult(f.send);
    assert.ok(result.equals(f.bytes), 'byte equality for ' + size);
    assert.deepEqual(result.density, f.value.density);
    assert.deepEqual(result.skipped, f.value.skipped);
    var slices = f.calls.filter(function (c) { return c.params.arguments; });
    assert.equal(slices.length, Math.ceil(f.value.base64.length / (1024 * 1024)));
    assert.equal(f.calls.at(-1).method, 'Runtime.releaseObject');
    console.log('mock bytes=' + size + ' base64=' + f.value.base64.length +
      ' slices=' + slices.length + ' maxFrame=' + Math.max.apply(null, f.frames));
  }
});

test('missing/malformed payloads fail and always release the remote object', async function () {
  var mutations = [
    function (v) { delete v.base64; },
    function (v) { v.base64 = 123; },
    function (v) { v.base64 = ''; },
    function (v) { delete v.bytes; },
    function (v) { v.bytes++; },
    function (v) { delete v.density; },
    function (v) { v.skipped = null; },
    function (v) { v.base64 = '!!!!'; }
  ];
  for (var mutate of mutations) {
    var f = fixture(2, mutate);
    await assert.rejects(helpers.readExportResult(f.send), /export/);
    assert.equal(f.calls.at(-1).method, 'Runtime.releaseObject');
  }
  for (var response of [undefined, {}, { result: {} },
    { result: { type: 'object', value: {} } }, { exceptionDetails: { text: 'driver failed' } }]) {
    await assert.rejects(helpers.readExportResult(async function () { return response; }),
      /missing|no result object|driver failed/);
  }
});

test('bad slices, CDP exceptions and cleanup failures are not silently accepted', async function () {
  for (var bad of [
    {}, { result: { type: 'string', value: '' } },
    { result: { type: 'number', value: 1234 } },
    { exceptionDetails: { text: 'slice failed' } }
  ]) {
    var f = fixture(3, null, function (method, params) {
      if (params.arguments) return bad;
    });
    await assert.rejects(helpers.readExportResult(f.send), /slice/);
    assert.equal(f.calls.at(-1).method, 'Runtime.releaseObject');
  }
  var broken = fixture(3, null, function (method, params) {
    if (params.arguments) throw new Error('transport failed');
    if (method === 'Runtime.releaseObject') throw new Error('release failed');
  });
  await assert.rejects(helpers.readExportResult(broken.send), /transport failed/);
  assert.equal(broken.calls.at(-1).method, 'Runtime.releaseObject');
  var cleanup = fixture(3, null, function (method) {
    if (method === 'Runtime.releaseObject') throw new Error('release failed');
  });
  await assert.rejects(helpers.readExportResult(cleanup.send), /release failed/);
});

function mockSocket(t) {
  var original = global.WebSocket;
  var socket;
  global.WebSocket = class {
    constructor() { socket = this; this.sent = []; this.closes = 0; }
    send(text) {
      if (this.sendError) throw new Error('write failed');
      this.sent.push(JSON.parse(text));
    }
    close() { this.closes++; }
  };
  t.after(function () { global.WebSocket = original; });
  return function () { return socket; };
}

test('CDP normal replies, protocol errors and explicit close cleanup', { timeout: 1000 }, async function (t) {
  var socket = mockSocket(t);
  var connected = helpers.cdpConnect('ws://mock', 100);
  socket().onopen();
  var client = await connected;
  var reply = client.send('Runtime.enable', {}, 'session-1');
  assert.equal(socket().sent[0].sessionId, 'session-1');
  socket().onmessage({ data: JSON.stringify({ id: 1, result: { enabled: true } }) });
  assert.deepEqual(await reply, { enabled: true });
  var rejected = assert.rejects(client.send('Bad.method'), /unknown method/);
  socket().onmessage({ data: JSON.stringify({ id: 2, error: { message: 'unknown method' } }) });
  await rejected;
  var waiting = assert.rejects(client.send('Waiting'), /client closed/);
  client.close();
  client.close();
  await waiting;
  await assert.rejects(client.send('Future'), /client closed/);
  assert.equal(socket().closes, 1);
});

test('CDP close/error rejects all pending and future sends', { timeout: 1000 }, async function (t) {
  var socket = mockSocket(t);
  for (var mode of ['close', 'error', 'send']) {
    var connected = helpers.cdpConnect('ws://mock', 100);
    socket().onopen();
    var client = await connected;
    var expected = mode === 'close' ? /code 1006/ :
      mode === 'error' ? /Max decompressed message size exceeded/ : /send failed: write failed/;
    var one = assert.rejects(client.send('One'), expected);
    var two = assert.rejects(client.send('Two'), expected);
    if (mode === 'close') socket().onclose({ code: 1006, reason: 'abnormal' });
    else if (mode === 'error') socket().onerror({ error: new Error('Max decompressed message size exceeded') });
    else {
      socket().sendError = true;
      await assert.rejects(client.send('Three'), expected);
    }
    await Promise.all([one, two]);
    await assert.rejects(client.send('Future'), expected);
    client.close();
    assert.equal(socket().closes, 1);
  }
});

test('CDP startup failures and silent transport timeouts are bounded', { timeout: 1000 }, async function (t) {
  var socket = mockSocket(t);
  for (var mode of ['close', 'error', 'timeout']) {
    var connected = assert.rejects(helpers.cdpConnect('ws://mock', 20), /CDP websocket/);
    if (mode === 'close') socket().onclose({ code: 1006 });
    if (mode === 'error') socket().onerror({ message: 'startup failed' });
    await connected;
  }
  var connecting = helpers.cdpConnect('ws://mock', 20);
  socket().onopen();
  var client = await connecting;
  await assert.rejects(client.send('Never.answers'), /CDP call timed out: Never.answers/);
  await assert.rejects(client.send('Future'), /timed out/);
  client.close();
});

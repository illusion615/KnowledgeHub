'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var os = require('node:os');
var path = require('node:path');
var local = require('../scripts/jev-local-provider');

function setup(t, provider) {
  provider = provider || 'nanojev-4bit';
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jev-local-test-'));
  t.after(function () { fs.rmSync(dir, { recursive: true, force: true }); });
  var spec = local.MODELS[provider];
  var token = 'a'.repeat(64);
  var file = path.join(dir, 'connection-' + spec.variant + '.json');
  var record = { schema: 'study-room.nanojev-connection.v1', host: '127.0.0.1', port: 18766, token: token, pid: process.pid, model: spec.model, variant: spec.variant, weights_sha256: spec.sha };
  fs.writeFileSync(file, JSON.stringify(record), { mode: 0o600 });
  return { dir: dir, file: file, spec: spec, token: token, record: record, provider: provider, env: { NANOJEV_MLX_CONNECTION_DIR: dir } };
}
function health(spec) {
  return { backend: 'study-room-nanojev-mlx-v1', ready: true, model_loaded: true, model: spec.model, weights_sha256: spec.sha, network_model_calls: 0, device: 'mlx-metal-gpu', activation_dtype: 'float32', max_length: 512, model_memory_bytes: 1000 };
}
function response(spec) {
  return { schema_version: 'study-room-nanojev-mlx-v1', model: spec.model, checkpoint: { weights_sha256: spec.sha, strict_loading: true },
    states: [{ id: 'playground', answers: {
      team: { type: 'choice', choice: 'technical', probabilities: { technical: .8, billing: .1, other: .1 } },
      enough_info: { type: 'boolean', p_true: .9, probabilities: { false: .1, true: .9 } },
      severity: { type: 'score', score: 1.6, probabilities: { '0': .1, '1': .2, '2': .7 } }
    } }], execution: { runtime: 'mlx', device: 'metal-gpu', candidate_path_tokens: 300, network_model_calls: 0, autoregressive_decode_steps: 0, forward_passes: 1, activation_dtype: 'float32', evaluation_ms: 10, api_key: 'MUST-NOT-ESCAPE' } };
}

test('local connections require private, owned, regular files and fixed loopback endpoints', function (t) {
  var f = setup(t); assert.equal(local.connectionFor(f.provider, f.env).origin, 'http://127.0.0.1:18766');
  fs.chmodSync(f.file, 0o644); assert.throws(function () { local.connectionFor(f.provider, f.env); }, /local_service_unavailable/);
  fs.chmodSync(f.file, 0o600); f.record.host = 'evil.example'; fs.writeFileSync(f.file, JSON.stringify(f.record));
  assert.throws(function () { local.connectionFor(f.provider, f.env); }, /local_connection_invalid/);
});
test('connection tokens and private metadata never appear in status or receipts', async function (t) {
  var f = setup(t), calls = [];
  var runner = local.createLocalProvider({ env: f.env, localFetch: async function (address, opts) {
    calls.push(address); assert.ok(address.startsWith('http://127.0.0.1:18766/'));
    assert.equal(opts.redirect, 'error');
    if (address.endsWith('/api/health')) return Response.json(health(f.spec));
    assert.equal(opts.headers['X-NanoJev-Token'], f.token);
    var payload = JSON.parse(opts.body); assert.equal(payload.states[0].state, 'A synthetic request.'); assert.equal(payload.states[0].questions.enough_info.type, 'boolean');
    return Response.json(response(f.spec));
  } });
  var status = await runner.status(f.provider); assert.equal(status.ready, true); assert.equal(status.local, true);
  var result = await runner.evaluate(f.provider, 'A synthetic request.');
  assert.equal(result.response.answers.team.confidence, null); assert.equal(result.response.answers.enough_info.noul, .9);
  assert.equal(result.billing_usd, 0); assert.equal(result.local_execution.forward_passes, 1);
  var exported = JSON.stringify({ status: status, result: result }); assert.ok(!exported.includes(f.token)); assert.ok(!exported.includes('MUST-NOT-ESCAPE'));
  assert.equal(calls.filter(function (u) { return u.endsWith('/api/evaluate'); }).length, 1);
});
test('missing service files do not create a ready provider', async function (t) {
  var f = setup(t); fs.unlinkSync(f.file);
  var r = local.createLocalProvider({ env: f.env, localFetch: async function () { throw new Error('must not call'); } });
  assert.equal((await r.status(f.provider)).ready, false);
  await assert.rejects(r.evaluate(f.provider, 'x'), /local_service_unavailable/);
});
test('wrong model or weight identity is rejected before sending input', async function (t) {
  var f = setup(t), calls = 0;
  var r = local.createLocalProvider({ env: f.env, localFetch: async function () { calls++; var h = health(f.spec); h.weights_sha256 = 'wrong'; return Response.json(h); } });
  await assert.rejects(r.evaluate(f.provider, 'private input'), /local_connection_invalid/); assert.equal(calls, 1);
});
test('native format is adapted explicitly and missing distributions are not fabricated', function () {
  var spec = local.MODELS['nanojev-fp32'], r = response(spec), req = local.nativeRequest('test');
  assert.equal(req.states[0].questions.enough_info.type, 'boolean');
  var n = local.normalizeLocal(r, req, spec); assert.equal(n.model, 'C-Tianyu/NanoJev'); assert.equal(n.answers.severity.confidence, null);
  assert.deepEqual(n.usage, { input_tokens: 300, output_tokens: 0 });
  delete r.states[0].answers.team.probabilities;
  assert.throws(function () { local.normalizeLocal(r, req, spec); }, /local_invalid_response/);
});
test('inconsistent Boolean probabilities and unexpected generation are rejected', function () {
  var spec = local.MODELS['nanojev-4bit'], req = local.nativeRequest('test'), r = response(spec);
  r.states[0].answers.enough_info.probabilities.true = .2;
  assert.throws(function () { local.normalizeLocal(r, req, spec); }, /local_invalid_response/);
  r = response(spec); r.execution.autoregressive_decode_steps = 10;
  assert.throws(function () { local.normalizeLocal(r, req, spec); }, /local_invalid_response/);
});
test('model errors remain local errors and never trigger a cloud fallback', async function (t) {
  var f = setup(t);
  for (var status of [400, 401, 429, 500]) {
    var calls = [];
    var r = local.createLocalProvider({ env: f.env, localFetch: async function (address) { calls.push(address); return address.endsWith('/api/health') ? Response.json(health(f.spec)) : new Response('SECRET', { status: status }); } });
    await assert.rejects(r.evaluate(f.provider, 'test'), function (e) { return !e.message.includes('SECRET'); });
    assert.equal(calls.length, 2); assert.ok(calls.every(function (u) { return u.startsWith('http://127.0.0.1:18766/'); }));
  }
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough, Writable } = require('node:stream');
const { exchange, normalizeModels } = require('../scripts/jev-copilot-models');
const { createCopilotProvider } = require('../scripts/jev-copilot-provider');
const { createServer } = require('../scripts/jev-playground-server');
function framed(value) { const body = JSON.stringify(value); return Buffer.from('Content-Length: ' + Buffer.byteLength(body) + '\r\n\r\n' + body); }
function fixture(responses, received, settings = {}) {
  return (binary, args, options) => {
    assert.equal(options.shell, false); assert.ok(args.includes('--stdio')); assert.ok(args.includes('--headless'));
    assert.ok(!args.includes('-p')); assert.ok(!args.includes('--allow-all'));
    const child = new EventEmitter(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
    child.kill = () => { queueMicrotask(() => child.emit('close', 0)); return true; };
    let input = Buffer.alloc(0);
    child.stdin = new Writable({ write(chunk, encoding, done) {
      input = Buffer.concat([input, chunk]);
      const end = input.indexOf('\r\n\r\n');
      if (end >= 0) {
        const length = Number(/Content-Length: (\d+)/.exec(input.subarray(0, end).toString())[1]);
        if (input.length >= end + 4 + length) {
          const request = JSON.parse(input.subarray(end + 4, end + 4 + length)); input = input.subarray(end + 4 + length);
          received.push(request);
          const response = responses[request.method];
          if (response !== undefined) queueMicrotask(() => {
            const bytes = settings.malformed ? Buffer.from('BAD\r\n\r\n{}') : framed({ jsonrpc: '2.0', id: request.id, ...response });
            child.stdout.write(bytes.subarray(0, 11)); child.stdout.write(bytes.subarray(11));
          });
        }
      }
      done();
    } });
    return child;
  };
}
const replies = () => ({
  connect: { result: { protocolVersion: 3 } },
  'auth.getStatus': { result: { isAuthenticated: true, login: 'PRIVATE-LOGIN', statusMessage: 'PRIVATE-SECRET' } },
  'models.list': { result: { models: [
    { id: 'test-model', name: '测试模型', billing: { secret: 'PRIVATE-SECRET' }, policy: { state: 'enabled', terms: 'PRIVATE' } },
    { id: 'disabled', name: 'No', policy: { state: 'disabled' } }
  ] } }
});
test('catalog filters disabled/unconfigured/auto/invalid IDs, deduplicates and allowlists only id/name', () => {
  assert.deepEqual(normalizeModels({ models: [
    { id: 'test-model', name: 'Good', secret: 'PRIVATE' }, { id: 'test-model', name: 'Duplicate' },
    { id: '--allow-all' }, { id: 'auto' }, { id: 'a/b' }, { id: 'not-enabled', policy: { state: 'unconfigured' } },
    { id: 'enabled', policy: { state: 'enabled' } }
  ] }), [{ id: 'test-model', name: 'Good' }, { id: 'enabled', name: 'enabled' }]);
  assert.throws(() => normalizeModels({ models: {} }), /copilot_models_invalid/);
  assert.deepEqual(normalizeModels({ models: [] }), []);
});
test('stdio discovery sends only connect/auth.getStatus/models.list; framed UTF8 and private metadata are safe', async () => {
  const requests = [];
  const models = await exchange('fixture', { cwd: '/tmp', spawn: fixture(replies(), requests) });
  assert.deepEqual(requests.map(r => r.method), ['connect', 'auth.getStatus', 'models.list']);
  assert.ok(requests.every(r => Object.keys(r.params).length === 0));
  assert.deepEqual(models, [{ id: 'test-model', name: '测试模型' }]);
  assert.ok(!JSON.stringify(models).includes('PRIVATE'));
});
test('missing login blocks model discovery and exposes no account fields', async () => {
  const responses = replies(), requests = [];
  responses['auth.getStatus'].result.isAuthenticated = false;
  await assert.rejects(exchange('fixture', { cwd: '/tmp', spawn: fixture(responses, requests) }), /copilot_login_required/);
  assert.deepEqual(requests.map(r => r.method), ['connect', 'auth.getStatus']);
});
test('RPC errors, malformed frames, deadlines and cancellation are bounded and safe', async () => {
  const responses = replies(); responses['models.list'] = { error: { message: 'PRIVATE-TOKEN' } };
  await assert.rejects(exchange('fixture', { cwd: '/tmp', spawn: fixture(responses, []) }), e => e.code === 'copilot_models_failed' && !e.message.includes('PRIVATE'));
  await assert.rejects(exchange('fixture', { cwd: '/tmp', spawn: fixture(replies(), [], { malformed: true }) }), /copilot_models_invalid/);
  await assert.rejects(exchange('fixture', { cwd: '/tmp', timeoutMs: 10, spawn: fixture({}, []) }), /copilot_models_timeout/);
  const controller = new AbortController();
  const pending = exchange('fixture', { cwd: '/tmp', signal: controller.signal, spawn: fixture({}, []) });
  controller.abort(); await assert.rejects(pending, /cancelled/);
});
test('provider gates metadata discovery behind CLI opt-in and capability check; never evaluates', async () => {
  let calls = 0;
  const queryModels = async () => { calls++; return [{ id: 'fixture', name: 'Fixture' }]; };
  const runProcess = async (binary, args) => {
    assert.deepEqual(args, ['--no-auto-update', '--help']);
    return { code: 0, stdout: '--available-tools --no-custom-instructions --disable-builtin-mcps --usage-output-file --no-remote-export --max-ai-credits' };
  };
  await assert.rejects(createCopilotProvider({ queryModels, runProcess }).listModels(), /copilot_disabled/); assert.equal(calls, 0);
  const provider = createCopilotProvider({ enabled: true, queryModels, runProcess });
  const first = await provider.listModels(), second = await provider.listModels();
  assert.equal(calls, 2, 'Refresh must query again, not reuse a stale catalog');
  assert.equal(first.source, 'copilot-cli-models.list'); assert.deepEqual(first.models, second.models);
});
test('model endpoint needs same origin + CSRF + empty body, shares rate budget, and exposes safe failures', async t => {
  let calls = 0, shouldFail = false;
  const server = createServer({ maxCalls: 3, runner: { status: async () => ({}) }, copilot: {
    status: async () => ({ available: true }),
    listModels: async () => { calls++; if (shouldFail) throw new Error('PRIVATE-LOGIN'); return { models: [{ id: 'fixture', name: 'Fixture' }], source: 'copilot-cli-models.list', checked_at: new Date().toISOString() }; },
    evaluate: async () => assert.fail('Metadata must never evaluate a model')
  } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const status = await (await fetch(base + '/api/jev/benchmark/status')).json(); assert.equal(calls, 0);
  const send = (body = {}, headers = {}) => fetch(base + '/api/jev/benchmark/models', { method: 'POST', headers: { Origin: base, 'X-Jev-Csrf': status.csrf, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  assert.equal((await send({}, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await send({}, { 'X-Jev-Csrf': 'bad' })).status, 403);
  assert.equal((await send({ command: 'session.create' })).status, 400);
  assert.equal((await send({ token: 'secret' })).status, 400); assert.equal(calls, 0);
  assert.equal((await send()).status, 200); assert.equal(calls, 1);
  shouldFail = true;
  const failure = await (await send()).json(); assert.equal(failure.error.code, 'copilot_models_failed'); assert.ok(!JSON.stringify(failure).includes('PRIVATE'));
  assert.equal((await send()).status, 503);
  assert.equal((await send()).status, 429); assert.equal(calls, 3);
});

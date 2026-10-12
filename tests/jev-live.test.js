'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs/promises');
var path = require('node:path');
var os = require('node:os');
var core = require('../posts/jev-system-one-research/playground-core');
var providerModule = require('../scripts/jev-live-providers');
var providers = Object.assign({}, providerModule, {
  createProviderRunner: function (options) {
    return providerModule.createProviderRunner(Object.assign({}, options, {
      env: Object.assign({ NANOJEV_MLX_CONNECTION_DIR: path.join(os.tmpdir(), 'unavailable-jev-' + process.pid) }, options.env)
    }));
  }
});
var createServer = require('../scripts/jev-playground-server').createServer;

function gatewayResult() {
  return {
    answers: {
      team: { type: 'choice', choice: 'technical', probabilities: { technical: 0.96, billing: 0.02, other: 0.02 } },
      enough_info: { type: 'boolean', probability: 0.98 },
      severity: { type: 'score', score: 1.8, probabilities: { '0': 0, '1': 0.2, '2': 0.8 } }
    },
    providerMetadata: { typesafe: { confidence: { team: 0.7, severity: 0.8 } } },
    usage: { inputTokens: 123, outputTokens: 45 },
    response: { modelId: 'typesafe-ai/jev' }
  };
}
function controlledRunner(overrides) {
  return Object.assign({
    status: async function () { return { vercel: { ready: true, configured: true, sdk_ready: true }, typesafe: { ready: true, configured: true, sdk_ready: true } }; },
    evaluate: async function (provider, state) { return { request: core.buildRequest(state), response: core.fixtures()[0].response, transport: 'TEST-FIXTURE-NOT-LIVE-INFERENCE' }; }
  }, overrides);
}
async function fixtureServer(t, options) {
  var server = createServer(Object.assign({ runner: controlledRunner() }, options));
  await new Promise(function (resolve) { server.listen(0, '127.0.0.1', resolve); });
  t.after(function () { server.closeAllConnections(); return new Promise(function (resolve) { server.close(resolve); }); });
  var base = 'http://127.0.0.1:' + server.address().port;
  var status = await (await fetch(base + '/api/jev/status')).json();
  async function send(body, headers) {
    return fetch(base + '/api/jev/evaluate', { method: 'POST', headers: Object.assign({ 'Origin': base, 'Content-Type': 'application/json', 'X-Jev-Csrf': status.csrf }, headers), body: JSON.stringify(body) });
  }
  return { base: base, status: status, send: send };
}

test('Gateway request maps Noul to Boolean, requests ZDR, and preserves state', function () {
  var req = core.buildRequest('hello'), g = providers.gatewayRequest(req);
  assert.equal(req.questions.enough_info.type, 'noul');
  assert.equal(g.questions.enough_info.type, 'boolean');
  assert.equal(g.model, 'typesafe-ai/jev');
  assert.equal(g.providerOptions.gateway.zeroDataRetention, true);
  assert.deepEqual(g.state, req.state);
});
test('Gateway metadata confidence is preserved, never replaced with max probability', function () {
  var r = providers.normalizeGateway(gatewayResult(), core.buildRequest('hello'));
  assert.equal(r.answers.team.confidence, 0.7); assert.equal(r.answers.team.probabilities.technical, 0.96);
  assert.equal(r.answers.enough_info.noul, 0.98);
  assert.deepEqual(r.usage, { input_tokens: 123, output_tokens: 45 });
  assert.deepEqual(r.answers.severity.legend, { '0': 'Low impact', '1': 'Service degraded', '2': 'Critical outage' });
});
test('missing native confidence stays unknown and confidence gating reviews', function () {
  var data = gatewayResult(); delete data.providerMetadata;
  var r = providers.normalizeGateway(data, core.buildRequest('hello'));
  assert.equal(r.answers.team.confidence, null);
  assert.ok(core.policy(r, { confidence: 0.85, sufficiency: 0.9, severity: 1.4 }).reasons.includes('confidence_unavailable'));
  assert.equal(core.policy(r, { confidence: 0.85, sufficiency: 0.9, severity: 1.4, basis: 'probability' }).action, 'suggest_technical');
});
test('optional probabilities are not synthesized', function () {
  var data = gatewayResult(); delete data.answers.team.probabilities; delete data.answers.severity.probabilities;
  var r = providers.normalizeGateway(data, core.buildRequest('hello'));
  assert.equal(r.answers.team.probabilities, null); assert.equal(r.answers.severity.probabilities, null);
  assert.ok(core.policy(r, { confidence: 0.85, sufficiency: 0.9, severity: 1.4, basis: 'probability' }).reasons.includes('probability_unavailable'));
});
test('declared rounding is preserved without normalizing probabilities', function () {
  var data = gatewayResult(); data.rounding = { probabilityDecimals: 2, scoreDecimals: 2 };
  data.answers.team.probabilities = { technical: 0.33, billing: 0.33, other: 0.33 };
  var r = providers.normalizeGateway(data, core.buildRequest('hello'));
  assert.equal(r.answers.team.probabilities.technical, 0.33); assert.deepEqual(r.rounding, data.rounding);
});
test('partial answers, malformed metadata and invalid probabilities fail', function () {
  var data = gatewayResult(); delete data.answers.severity;
  assert.throws(function () { providers.normalizeGateway(data, core.buildRequest('hello')); }, /invalid_upstream/);
  data = gatewayResult(); data.providerMetadata.typesafe.confidence.team = '0.9';
  assert.throws(function () { providers.normalizeGateway(data, core.buildRequest('hello')); }, /invalid_upstream/);
  data = gatewayResult(); data.answers.team.probabilities.technical = 99;
  assert.throws(function () { providers.normalizeGateway(data, core.buildRequest('hello')); }, /invalid_upstream/);
});
test('missing keys prevent provider I/O; status contains no credential values', async function () {
  var calls = 0;
  var runner = providers.createProviderRunner({ env: {}, loadSdk: async function () { throw new Error('missing'); }, fetch: async function () { calls++; } });
  var status = await runner.status(); assert.equal(status.vercel.ready, false); assert.equal(status.typesafe.ready, false);
  await assert.rejects(runner.evaluate('vercel', 'hello'), /key_missing/);
  await assert.rejects(runner.evaluate('typesafe', 'hello'), /key_missing/); assert.equal(calls, 0);
});
test('direct adapter uses only the fixed URL and server key', async function () {
  var calls = 0, state = 'Synthetic test, not sent to a provider';
  var runner = providers.createProviderRunner({ env: { TYPESAFE_API_KEY: 'TEST-SECRET' }, fetch: async function (address, options) {
    calls++; assert.equal(address, 'https://api.typesafe.ai/v1/systemone'); assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer TEST-SECRET'); assert.equal(JSON.parse(options.body).state.request, state);
    return new Response(JSON.stringify(core.fixtures()[0].response), { status: 200 });
  } });
  var r = await runner.evaluate('typesafe', state); assert.equal(calls, 1); assert.ok(!JSON.stringify(r).includes('TEST-SECRET'));
});
test('provider failures are mapped to safe errors, not leaked or replaced by fixtures', async function () {
  for (var status of [401, 402, 403, 429, 500, 529]) {
    var runner = providers.createProviderRunner({ env: { TYPESAFE_API_KEY: 'TEST-SECRET' }, fetch: async function () { return new Response('TEST-SECRET private input', { status: status }); } });
    await assert.rejects(runner.evaluate('typesafe', 'private input'), function (e) { return e instanceof providers.LiveError && !e.message.includes('TEST-SECRET'); });
  }
});
test('actual installed SDK contract test with intercepted HTTP; no model request is sent', async function (t) {
  var sdk;
  try { sdk = await providers.loadGatewaySdk(); } catch (e) { t.skip('Optional SDK cache not installed; follow article setup to run this contract test'); return; }
  var calls = 0;
  var runner = providers.createProviderRunner({ env: { AI_GATEWAY_API_KEY: 'TEST-NOT-REAL' }, loadSdk: async function () { return sdk; }, gatewayFetch: async function (address, options) {
    calls++; var headers = new Headers(options.headers), body = JSON.parse(options.body);
    assert.equal(address, 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model');
    assert.equal(headers.get('ai-model-id'), 'typesafe-ai/jev'); assert.equal(headers.get('ai-evaluation-model-specification-version'), '4');
    assert.equal(body.questions.enough_info.type, 'boolean'); assert.equal(body.providerOptions.gateway.zeroDataRetention, true);
    return new Response(JSON.stringify(gatewayResult()), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } });
  var r = await runner.evaluate('vercel', 'Synthetic SDK transport test'); assert.equal(calls, 1); assert.equal(r.response.answers.team.confidence, 0.7);
});
test('actual SDK errors are not retried by this application', async function (t) {
  var sdk; try { sdk = await providers.loadGatewaySdk(); } catch (e) { t.skip('Optional SDK missing'); return; }
  var calls = 0;
  var runner = providers.createProviderRunner({ env: { AI_GATEWAY_API_KEY: 'TEST-NOT-REAL' }, loadSdk: async function () { return sdk; }, gatewayFetch: async function () { calls++; return new Response('{"error":"private TEST-NOT-REAL"}', { status: 500, headers: { 'Content-Type': 'application/json' } }); } });
  await assert.rejects(runner.evaluate('vercel', 'synthetic'), /upstream_error/); assert.equal(calls, 1);
});
test('local server requires same origin, CSRF token and explicit consent', async function (t) {
  var called = 0;
  var srv = await fixtureServer(t, { runner: controlledRunner({ evaluate: async function () { called++; throw new Error('should not execute'); } }) });
  var good = { provider: 'vercel', state: 'hello', consent: true };
  assert.equal((await srv.send(good, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await srv.send(good, { 'X-Jev-Csrf': 'wrong' })).status, 403);
  assert.equal((await srv.send({ provider: 'vercel', state: 'hello' })).status, 400);
  assert.equal((await srv.send(good, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal(called, 0);
});
test('local server rejects invalid provider, state size and custom endpoint injection', async function (t) {
  var srv = await fixtureServer(t);
  assert.equal((await srv.send({ provider: 'http://evil.example', state: 'x', consent: true })).status, 400);
  assert.equal((await srv.send({ provider: 'vercel', state: 'x'.repeat(12001), consent: true })).status, 400);
  assert.equal((await srv.send({ provider: 'vercel', state: 'x', consent: true, url: 'http://evil.example' })).status, 400);
  assert.equal((await srv.send({ provider: 'vercel', state: 'x'.repeat(66000), consent: true })).status, 413);
});
test('response receipts bind provider and input and measure elapsed time, not accuracy', async function (t) {
  var srv = await fixtureServer(t);
  var r = await (await srv.send({ provider: 'vercel', state: 'receipt test', consent: true })).json();
  assert.equal(r.mode, 'live'); assert.equal(r.provider, 'vercel'); assert.equal(r.request.state.request, 'receipt test');
  assert.equal(r.transport, 'TEST-FIXTURE-NOT-LIVE-INFERENCE'); assert.ok(r.latency_ms >= 0);
  assert.equal(r.billing_usd, null); assert.equal(r.underlying_model_revision_verified, false);
});
test('backend never returns raw exception messages or secrets', async function (t) {
  var srv = await fixtureServer(t, { runner: controlledRunner({ evaluate: async function () { throw new Error('TEST-SECRET and private input'); } }) });
  var r = await srv.send({ provider: 'vercel', state: 'x', consent: true });
  assert.equal(r.status, 502); assert.equal((await r.json()).error.code, 'upstream_error');
});
test('deadline cancels the upstream signal and never returns a synthetic answer', async function (t) {
  var signal;
  var srv = await fixtureServer(t, { timeoutMs: 30, runner: controlledRunner({ evaluate: async function (p, s, sig) { signal = sig; await new Promise(function () {}); } }) });
  var r = await srv.send({ provider: 'vercel', state: 'x', consent: true });
  assert.equal(r.status, 504); assert.equal(signal.aborted, true); assert.equal((await r.json()).error.code, 'upstream_timeout');
});
test('concurrent calls and minute budget are bounded', async function (t) {
  var release, entered;
  var ready = new Promise(function (r) { entered = r; });
  var base = controlledRunner();
  var srv = await fixtureServer(t, { maxCalls: 1, runner: controlledRunner({ evaluate: async function (p, s) { entered(); await new Promise(function (r) { release = r; }); return base.evaluate(p, s); } }) });
  var first = srv.send({ provider: 'vercel', state: 'a', consent: true }); await ready;
  var busy = await srv.send({ provider: 'vercel', state: 'b', consent: true }); assert.equal(busy.status, 429); assert.equal((await busy.json()).error.code, 'busy');
  release(); assert.equal((await first).status, 200);
  var limited = await srv.send({ provider: 'vercel', state: 'c', consent: true }); assert.equal(limited.status, 429); assert.equal((await limited.json()).error.code, 'local_rate_limit');
});
test('static server denies private paths, dotfiles, traversal and symlink escapes', async function (t) {
  var root = await fs.mkdtemp(path.join(os.tmpdir(), 'jev-static-'));
  t.after(function () { return fs.rm(root, { recursive: true, force: true }); });
  await fs.mkdir(path.join(root, 'posts')); await fs.mkdir(path.join(root, 'private'));
  await fs.writeFile(path.join(root, 'index.html'), 'public'); await fs.writeFile(path.join(root, '.env'), 'SECRET');
  await fs.writeFile(path.join(root, 'private', 'secret.json'), 'SECRET');
  await fs.symlink(path.join(root, '.env'), path.join(root, 'posts', 'escape.json'));
  var srv = await fixtureServer(t, { root: root });
  assert.equal((await fetch(srv.base + '/')).status, 200);
  for (var file of ['/.env', '/.git/config', '/private/secret.json', '/posts/escape.json', '/posts/%2e%2e/private/secret.json']) assert.ok((await fetch(srv.base + file)).status >= 400);
  var spoofedStatus = await new Promise(function (resolve, reject) {
    require('node:http').get(srv.base + '/api/jev/status', { headers: { Host: 'attacker.example' } }, function (res) { res.resume(); resolve(res.statusCode); }).on('error', reject);
  });
  assert.equal(spoofedStatus, 403);
});

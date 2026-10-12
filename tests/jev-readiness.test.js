'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var adapters = require('../scripts/jev-live-providers');
var keys = require('../scripts/jev-key-input');
var createServer = require('../scripts/jev-playground-server').createServer;
function runner(fetchImpl, key) {
  return adapters.createProviderRunner({ env: { AI_GATEWAY_API_KEY: key || 'TEST-KEY-NOT-REAL', NANOJEV_MLX_CONNECTION_DIR: require('node:path').join(require('node:os').tmpdir(), 'unavailable-jev-' + process.pid) }, fetch: fetchImpl, loadSdk: async function () { throw new Error('optional SDK not installed for this test'); } });
}
test('credential inspection returns categories, never values or fragments', function () {
  var cases = [
    [undefined, 'key_missing'], ['  ', 'key_missing'],
    ['export AI_GATEWAY_API_KEY', 'key_command'], ['node scripts/server.js', 'key_command'],
    ['AI_GATEWAY_API_KEY=PRIVATE', 'key_command'], ['Bearer PRIVATE', 'key_command'],
    ['"PRIVATE"', 'key_quotes'], ["'PRIVATE'", 'key_quotes'],
    ['PRIVATE\n', 'key_whitespace'], ['PRI VATE', 'key_whitespace'],
    ['your_api_key_here', 'key_placeholder'], ['AI_GATEWAY_API_KEY', 'key_placeholder'],
    ['TEST-PRIVATE-KEY-123', null], ['node-valid-looking-token', null]
  ];
  cases.forEach(function (pair) { assert.equal(keys.credentialIssue(pair[0]), pair[1]); });
});
test('obvious input mistakes block both probe and inference before provider I/O', async function () {
  var calls = 0;
  var r = runner(async function () { calls++; throw new Error('should not call'); }, 'export AI_GATEWAY_API_KEY');
  var status = await r.status(); assert.equal(status.vercel.configured, true); assert.equal(status.vercel.ready, false);
  assert.equal(status.vercel.credential_issue, 'key_command');
  var check = await r.checkAuthentication('vercel'); assert.equal(check.code, 'key_command'); assert.equal(check.authentication, 'not_checked');
  await assert.rejects(r.evaluate('vercel', 'synthetic'), /key_command/); assert.equal(calls, 0);
});
test('credits probe uses a fixed read-only endpoint and discards balances', async function () {
  var r = runner(async function (url, options) {
    assert.equal(url, 'https://ai-gateway.vercel.sh/v1/credits'); assert.equal(options.method, 'GET');
    assert.equal(options.headers.Authorization, 'Bearer TEST-KEY-NOT-REAL'); assert.equal(options.body, undefined); assert.equal(options.redirect, 'error');
    return new Response('{"balance":"12345.6789","total_used":"54321.9876","team_id":"PRIVATE-TEAM"}', { headers: { 'content-type': 'application/json' } });
  });
  var check = await r.checkAuthentication('vercel');
  assert.equal(check.authentication, 'verified'); assert.equal(check.model_access, 'not_tested'); assert.equal(check.model_inference_performed, false);
  var output = JSON.stringify(await r.status());
  ['12345.6789', '54321.9876', 'PRIVATE-TEAM', 'TEST-KEY-NOT-REAL', 'balance', 'total_used'].forEach(function (secret) { assert.ok(!output.includes(secret)); });
});
test('HTTP 200 login/challenge pages are not treated as authenticated', async function () {
  var r = runner(async function () { return new Response('<html>Login</html>', { headers: { 'content-type': 'text/html' } }); });
  var check = await r.checkAuthentication('vercel'); assert.equal(check.authentication, 'unknown'); assert.equal(check.code, 'invalid_upstream');
});
test('a malformed credits schema does not establish authentication', async function () {
  var r = runner(async function () { return Response.json({ success: true }); });
  assert.equal((await r.checkAuthentication('vercel')).authentication, 'unknown');
});
test('401 and 403 produce distinct authentication conclusions', async function () {
  for (var status of [401, 403]) {
    var r = runner(async function () { return new Response('{"error":{"code":"invalid_api_key","message":"PRIVATE KEY"}}', { status: status, headers: { 'Content-Type': 'application/json' } }); });
    var check = await r.checkAuthentication('vercel');
    assert.equal(check.authentication, status === 401 ? 'rejected' : 'unknown');
    assert.equal(check.code, status === 401 ? 'upstream_auth_401' : 'upstream_forbidden_403');
    assert.equal(check.diagnostic.upstream_status, status); assert.equal(check.diagnostic.response_format, 'json');
    assert.ok(!JSON.stringify(check).includes('PRIVATE KEY'));
  }
});
test('SDK wrapper diagnostics preserve the underlying HTTP status and safe enums only', function () {
  var error = { statusCode: 401, message: 'PRIVATE KEY', cause: { statusCode: 403, responseHeaders: { 'content-type': 'text/html', authorization: 'PRIVATE KEY' }, responseBody: '<html>PRIVATE KEY</html>' } };
  var safe = adapters.publicError(error);
  assert.equal(safe.code, 'upstream_forbidden_403'); assert.deepEqual(safe.diagnostic, { upstream_status: 403, response_format: 'html' });
  assert.ok(!JSON.stringify(safe).includes('PRIVATE KEY'));
});
test('unknown provider error codes, messages and headers never escape', function () {
  var error = { statusCode: 401, code: 'PRIVATE-SECRET', responseBody: '{"error":{"code":"PRIVATE-SECRET","message":"PRIVATE-SECRET"}}', responseHeaders: { 'content-type': 'application/json', 'x-secret': 'PRIVATE-SECRET' } };
  assert.deepEqual(adapters.publicError(error).diagnostic, { upstream_status: 401, response_format: 'json' });
  var safe = new adapters.LiveError('upstream_error', 502, { upstream_status: 401, reason_code: 'PRIVATE-SECRET', api_key: 'PRIVATE-SECRET' });
  assert.ok(!JSON.stringify(safe).includes('PRIVATE-SECRET'));
});
test('probe network failures expose no exception text', async function () {
  var r = runner(async function () { throw new Error('Bearer PRIVATE-SECRET'); });
  var check = await r.checkAuthentication('vercel'); assert.equal(check.code, 'upstream_error'); assert.equal(check.authentication, 'unknown');
  assert.ok(!JSON.stringify(check).includes('PRIVATE-SECRET'));
});
test('concurrent identical probes share one read-only request', async function () {
  var calls = 0;
  var r = runner(async function () { calls++; await new Promise(function (resolve) { setTimeout(resolve, 20); }); return Response.json({ balance: '0', total_used: '0' }); });
  var results = await Promise.all([r.checkAuthentication('vercel'), r.checkAuthentication('vercel')]);
  assert.equal(calls, 1); assert.deepEqual(results[0], results[1]); assert.equal(results[0].authentication, 'verified');
});
test('Gateway credit-card refusal is classified as payment verification, not key failure', function () {
  var message = 'AI Gateway requires a valid credit card on file to service requests. Please visit https://example.invalid/private to add a card and unlock your free credits.';
  var sdkError = { statusCode: 403, message: message, cause: { statusCode: 403, responseHeaders: { 'content-type': 'application/json' }, responseBody: JSON.stringify({ error: { message: message, type: 'authentication_error' } }) } };
  var safe = adapters.publicError(sdkError);
  assert.equal(safe.code, 'upstream_payment_method_required');
  assert.deepEqual(safe.diagnostic, { upstream_status: 403, response_format: 'json', reason_code: 'credit_card_required' });
  assert.ok(!JSON.stringify(safe).includes('example.invalid'));
});
test('unrelated 403 and insufficient-credit errors are not mislabeled as missing cards', function () {
  assert.equal(adapters.publicError({ statusCode: 403, message: 'Model access is forbidden.' }).code, 'upstream_forbidden_403');
  assert.equal(adapters.publicError({ statusCode: 402, message: 'Insufficient credits.' }).code, 'upstream_payment');
  assert.equal(adapters.publicError({ statusCode: 401, message: 'AI Gateway requires a valid credit card on file to service requests.' }).code, 'upstream_auth_401');
});
test('read-only probe preserves explicit payment-verification refusal without claiming model access', async function () {
  var r = runner(async function () { return Response.json({ error: { message: 'AI Gateway requires a valid credit card on file to service requests.', type: 'authentication_error' } }, { status: 403 }); });
  var check = await r.checkAuthentication('vercel');
  assert.equal(check.code, 'upstream_payment_method_required'); assert.equal(check.authentication, 'unknown');
  assert.equal(check.model_inference_performed, false); assert.equal(check.model_access, 'not_tested');
});
test('hidden prompt refuses non-interactive input instead of reading pasted command blocks', async function () {
  await assert.rejects(keys.promptSecret('API KEY', { isTTY: false }, { isTTY: false }), /interactive_terminal_required/);
});
test('readiness route requires Origin and CSRF and cannot carry model input', async function (t) {
  var calls = 0;
  var r = runner(async function () { calls++; return Response.json({ balance: '0', total_used: '0' }); });
  var server = createServer({ runner: r }); await new Promise(function (resolve) { server.listen(0, '127.0.0.1', resolve); });
  t.after(function () { server.closeAllConnections(); return new Promise(function (resolve) { server.close(resolve); }); });
  var base = 'http://127.0.0.1:' + server.address().port;
  var status = await (await fetch(base + '/api/jev/status')).json(); assert.equal(status.capabilities.authentication_check, true);
  async function post(body, override) { return fetch(base + '/api/jev/check', { method: 'POST', headers: Object.assign({ Origin: base, 'X-Jev-Csrf': status.csrf, 'Content-Type': 'application/json' }, override), body: JSON.stringify(body) }); }
  assert.equal((await post({ provider: 'vercel' }, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await post({ provider: 'vercel' }, { 'X-Jev-Csrf': 'wrong' })).status, 403);
  assert.equal((await post({ provider: 'vercel', state: 'must not be sent' })).status, 400);
  assert.equal(calls, 0);
  var result = await (await post({ provider: 'vercel' })).json(); assert.equal(result.check.authentication, 'verified'); assert.equal(calls, 1);
  assert.equal(result.check.model_inference_performed, false); assert.equal(result.providers.vercel.readiness.authentication, 'verified');
});

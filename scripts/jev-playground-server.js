#!/usr/bin/env node
'use strict';
// Optional loopback-only backend. Static GitHub Pages deployment stays unchanged.
var http = require('node:http');
var fs = require('node:fs/promises');
var path = require('node:path');
var crypto = require('node:crypto');
var performance = require('node:perf_hooks').performance;
var adapters = require('./jev-live-providers.js');
var core = require('../posts/jev-system-one-research/playground-core.js');
var ROOT = path.resolve(__dirname, '..');
var MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.py': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };

function json(res, status, body) {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin',
    'Connection': 'close'
  });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [], size = 0, done = false;
    req.on('data', function (chunk) {
      if (done) return;
      size += chunk.length;
      if (size > 65536) { done = true; chunks = []; reject(new adapters.LiveError('body_too_large', 413)); return; }
      chunks.push(chunk);
    });
    req.on('end', function () {
      if (done) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (error) { reject(new adapters.LiveError('invalid_input', 400)); }
    });
    req.on('error', function () { reject(new adapters.LiveError('invalid_input', 400)); });
    req.on('aborted', function () { reject(new adapters.LiveError('client_aborted', 400)); });
  });
}
function publicFile(relative) {
  return relative === 'index.html' || relative === 'settings.html' || relative === 'LICENSE' || relative.startsWith('assets/') || relative.startsWith('posts/');
}

function createServer(options) {
  options = options || {};
  var root = require('node:fs').realpathSync(options.root || ROOT);
  var runner = options.runner || adapters.createProviderRunner(options);
  var csrf = crypto.randomBytes(32).toString('hex');
  var active = 0, calls = [];
  var timeoutMs = options.timeoutMs || 30000;
  var maxCalls = options.maxCalls || 20;
  var server = http.createServer(function (req, res) {
    handle(req, res).catch(function () { json(res, 500, { error: { code: 'internal_error' } }); });
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  async function handle(req, res) {
    var port = server.address().port;
    var host = req.headers.host;
    var parsed, pathname, expectedOrigin, body, controller, timer, started, id, result;
    if (host !== '127.0.0.1:' + port && host !== 'localhost:' + port) return json(res, 403, { error: { code: 'invalid_host' } });
    expectedOrigin = 'http://' + host;
    try {
      parsed = new URL(req.url, expectedOrigin);
      pathname = decodeURIComponent(parsed.pathname);
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(function (p) { return p === '..' || p.startsWith('.'); })) throw new Error('path');
    } catch (error) { return json(res, 400, { error: { code: 'invalid_path' } }); }
    if (pathname.startsWith('/api/')) {
      if (req.headers.origin && req.headers.origin !== expectedOrigin || req.headers['sec-fetch-site'] === 'cross-site') return json(res, 403, { error: { code: 'invalid_origin' } });
      if (pathname === '/api/jev/status' && req.method === 'GET') {
        return json(res, 200, {
          backend: 'study-room-jev-live-v1', csrf: csrf,
          providers: await runner.status(),
          limits: { timeout_ms: timeoutMs, max_calls_per_minute: maxCalls, max_state_characters: core.maxState },
          capabilities: { authentication_check: typeof runner.checkAuthentication === 'function' }
        });
      }
      if (['/api/jev/evaluate', '/api/jev/check'].indexOf(pathname) < 0 || req.method !== 'POST') return json(res, 405, { error: { code: 'method_not_allowed' } });
      if (req.headers.origin !== expectedOrigin || req.headers['x-jev-csrf'] !== csrf) return json(res, 403, { error: { code: 'invalid_origin' } });
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return json(res, 415, { error: { code: 'json_required' } });
      if (Number(req.headers['content-length']) > 65536) return json(res, 413, { error: { code: 'body_too_large' } });
      try {
        body = await readBody(req);
        if (pathname === '/api/jev/check') {
          if (!body || Array.isArray(body) || Object.keys(body).some(function (k) { return k !== 'provider'; }) || typeof body.provider !== 'string' || !Object.prototype.hasOwnProperty.call(adapters.PROVIDERS, body.provider)) throw new adapters.LiveError('invalid_provider', 400);
          if (typeof runner.checkAuthentication !== 'function') throw new adapters.LiveError('check_unavailable', 503);
          if (active) throw new adapters.LiveError('busy', 429);
          active += 1;
          try { return json(res, 200, { check: await runner.checkAuthentication(body.provider), providers: await runner.status() }); }
          finally { active -= 1; }
        }
        if (!body || Array.isArray(body) || Object.keys(body).some(function (k) { return ['provider', 'state', 'consent'].indexOf(k) < 0; }) || body.consent !== true) throw new adapters.LiveError('consent_required', 400);
        if (typeof body.provider !== 'string' || !Object.prototype.hasOwnProperty.call(adapters.PROVIDERS, body.provider)) throw new adapters.LiveError('invalid_provider', 400);
        try { core.buildRequest(body.state); } catch (error) { throw new adapters.LiveError('invalid_input', 400); }
        if (active) { res.setHeader('Retry-After', '1'); throw new adapters.LiveError('busy', 429); }
        calls = calls.filter(function (t) { return Date.now() - t < 60000; });
        if (calls.length >= maxCalls) { res.setHeader('Retry-After', '60'); throw new adapters.LiveError('local_rate_limit', 429); }
      } catch (error) {
        return json(res, error.status || 400, { error: { code: error.code || 'invalid_input' } });
      }
      active += 1; calls.push(Date.now());
      controller = new AbortController();
      timer = setTimeout(function () { controller.abort(); }, timeoutMs);
      res.once('close', function () { if (!res.writableEnded) controller.abort(); });
      started = performance.now(); id = crypto.randomUUID();
      try {
        result = await Promise.race([
          runner.evaluate(body.provider, body.state, controller.signal),
          new Promise(function (_, reject) { controller.signal.addEventListener('abort', function () { reject(new adapters.LiveError('upstream_timeout', 504)); }, { once: true }); })
        ]);
        json(res, 200, {
          mode: 'live', provider: body.provider, request_id: id,
          completed_at: new Date().toISOString(), latency_ms: Math.round(performance.now() - started),
          request: result.request, response: result.response,
          transport: result.transport, sdk_versions: result.sdk_versions,
          confidence_source: result.confidence_source, score_legend_source: result.score_legend_source,
          underlying_model_revision_verified: false, billing_usd: result.billing_usd == null ? null : result.billing_usd,
          billing_scope: result.billing_scope,
          local_execution: result.local_execution,
          weights_sha256: result.weights_sha256,
          weights_integrity_verified: result.weights_integrity_verified
        });
      } catch (error) {
        // Never return upstream error messages, request bodies, headers, or keys.
        json(res, error.status || 502, { request_id: id, error: { code: error instanceof adapters.LiveError ? error.code : 'upstream_error', diagnostic: error instanceof adapters.LiveError ? error.diagnostic : {} } });
      } finally { clearTimeout(timer); active -= 1; }
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: { code: 'method_not_allowed' } });
    var relative = pathname.replace(/^\/+/, '');
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    if (!publicFile(relative) || !MIME[path.extname(relative)] && relative !== 'LICENSE') return json(res, 404, { error: { code: 'not_found' } });
    try {
      var file = await fs.realpath(path.resolve(root, relative));
      var resolvedRelative = path.relative(root, file).split(path.sep).join('/');
      if (resolvedRelative.startsWith('../') || path.isAbsolute(resolvedRelative) || !publicFile(resolvedRelative) || (!MIME[path.extname(file)] && resolvedRelative !== 'LICENSE') || resolvedRelative.split('/').some(function (p) { return p.startsWith('.'); })) return json(res, 404, { error: { code: 'not_found' } });
      var contents = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain', 'Content-Length': contents.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : contents);
    } catch (error) { json(res, 404, { error: { code: 'not_found' } }); }
  }
  return server;
}

async function main(argv) {
  var index = argv.indexOf('--port'), promptIndex = argv.indexOf('--prompt-key'), checkIndex = argv.indexOf('--check');
  var port = index >= 0 ? Number(argv[index + 1]) : 8000;
  var provider = promptIndex >= 0 ? argv[promptIndex + 1] : checkIndex >= 0 ? argv[checkIndex + 1] : null;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('invalid_port');
  if ((promptIndex >= 0 || checkIndex >= 0) && !Object.prototype.hasOwnProperty.call(adapters.PROVIDERS, provider)) throw new Error('choose_vercel_or_typesafe');
  if (promptIndex >= 0) {
    if (adapters.PROVIDERS[provider].local) throw new Error('local_provider_needs_no_key');
    var keys = require('./jev-key-input.js');
    var key = await keys.promptSecret(adapters.PROVIDERS[provider].key);
    var issue = keys.credentialIssue(key);
    if (issue) throw new Error(issue);
    process.env[adapters.PROVIDERS[provider].key] = key;
  }
  var runner = adapters.createProviderRunner();
  if (promptIndex >= 0 || checkIndex >= 0) {
    var check = await runner.checkAuthentication(provider);
    var status = (await runner.status())[provider];
    console.log(JSON.stringify({ check: check, sdk_ready: status.sdk_ready, sdk_versions: status.sdk_versions, credential_issue: status.credential_issue }, null, 2));
    if (checkIndex >= 0) { if (check.authentication !== 'verified') process.exitCode = 1; return; }
  }
  var server = createServer({ runner: runner });
  server.on('error', function (error) { console.error('Cannot start local server:', error.code); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', function () {
    console.log('Study Room: http://127.0.0.1:' + port + '/posts/jev-system-one-research/#playground');
    console.log('Keys stay in this process. Read-only authentication is not proof of Jev model access.');
    console.log('Loopback only. Not an authenticated public deployment. Inference requires explicit confirmation.');
  });
}
if (require.main === module) main(process.argv.slice(2)).catch(function (error) {
  // Only our own fixed CLI error codes are displayed; never SDK errors or key text.
  var safe = ['invalid_port', 'choose_vercel_or_typesafe', 'interactive_terminal_required', 'input_closed', 'cancelled', 'key_missing', 'key_command', 'key_quotes', 'key_whitespace', 'key_placeholder', 'local_provider_needs_no_key'];
  console.error('Startup failed:', safe.includes(error.message) ? error.message : 'startup_error');
  process.exitCode = 1;
});
module.exports = { createServer: createServer };

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
var registry = require('../posts/jev-system-one-research/model-registry');
var copilotModule = require('./jev-copilot-provider.js');
var arenaModule = require('./jev-arena.js');
var arenaProvider = require('./jev-arena-provider.js');
var supportModule = require('./jev-support.js');
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
  var copilot = options.copilot || copilotModule.createCopilotProvider({ enabled: options.enableCopilot === true });
  var csrf = crypto.randomBytes(32).toString('hex');
  var active = 0, calls = [];
  var timeoutMs = options.timeoutMs || 30000;
  var maxCalls = options.maxCalls || 20;
  var evaluateArena = options.arenaEvaluate || arenaProvider.createArenaProvider({ copilot: copilot });
  var archiveOptions = options.archiveArena === true ? { onSettled: record => require('./jev-arena-records').saveDiagnostic(record, options.arenaRecordDirectory) } : {};
  function isLocal(provider) { return adapters.PROVIDERS[provider]?.local === true; }
  function admitArena(team, config) {
    if (['attack-baseline','search-baseline'].includes(team.provider) || isLocal(team.provider)) return true; // Local compute never spends the external-call rate budget.
    if (config.max_decisions !== null) return true; // Legacy bounded API runs prepaid below.
    calls = calls.filter(t => Date.now() - t < 60000);
    if (calls.length >= maxCalls) return false;
    calls.push(Date.now());return true;
  }
  var arena = arenaModule.createArenaManager(Object.assign({}, archiveOptions, options.arenaOptions, { evaluate: evaluateArena, admit: admitArena }));
  var support = supportModule.createSupportManager(Object.assign({}, options.supportOptions, { copilot: copilot, nativeEvaluate: options.supportNativeEvaluate, admit: function () {
    calls = calls.filter(t => Date.now() - t < 60000);
    if(calls.length >= maxCalls)return false;
    calls.push(Date.now());return true;
  } }));
  var server = http.createServer(function (req, res) {
    handle(req, res).catch(function () { json(res, 500, { error: { code: 'internal_error' } }); });
  });
  server.on('close', function () { arena.close(); support.close(); });
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
          backend: 'study-room-jev-live-v1', csrf: csrf, arena_busy: arena.busy(), experiment_busy: active > 0 || support.busy(),
          providers: await runner.status(), model_catalog: registry.models,
          limits: { timeout_ms: timeoutMs, max_calls_per_minute: maxCalls, rate_limit_scope: 'external_calls_only', local_max_calls_per_minute: null, max_state_characters: core.maxState },
          capabilities: { authentication_check: typeof runner.checkAuthentication === 'function', arena_planner_revisions: ['legacy-v1','resource-terrain-v2','resource-tactics-v3','persistent-intent-v4','exchange-aware-v5'] }
        });
      }
      if (pathname === '/api/jev/benchmark/status' && req.method === 'GET') {
        var availability = await runner.status();
        return json(res, 200, { backend: 'study-room-jev-benchmark-v1', support_version: supportModule.version, csrf: csrf, arena_planner_revisions: ['legacy-v1','resource-terrain-v2','resource-tactics-v3','persistent-intent-v4','exchange-aware-v5'],
          local: Object.fromEntries(registry.models.map(m=>[m.id,availability[m.id]||{ready:false}])), model_catalog: registry.models,
          copilot: await copilot.status() });
      }
      if (['/api/jev/evaluate', '/api/jev/check', '/api/jev/benchmark/evaluate', '/api/jev/benchmark/models', '/api/jev/arena/start', '/api/jev/arena/state', '/api/jev/arena/stop', '/api/jev/arena/replay', '/api/jev/arena/latest', '/api/jev/arena/probe', '/api/jev/support/start', '/api/jev/support/state', '/api/jev/support/stop', '/api/jev/support/events'].indexOf(pathname) < 0 || req.method !== 'POST') return json(res, 405, { error: { code: 'method_not_allowed' } });
      if (req.headers.origin !== expectedOrigin || req.headers['x-jev-csrf'] !== csrf) return json(res, 403, { error: { code: 'invalid_origin' } });
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return json(res, 415, { error: { code: 'json_required' } });
      if (Number(req.headers['content-length']) > 65536) return json(res, 413, { error: { code: 'body_too_large' } });
      try {
        body = await readBody(req);
        if(pathname.startsWith('/api/jev/support/')){
          if(pathname!=='/api/jev/support/start'){
            if(!body||Array.isArray(body)||Object.keys(body).join()!=='id'||typeof body.id!=='string')throw new adapters.LiveError('invalid_input',400);
            if(pathname.endsWith('/events')){
              let ready=false,initial,unsubscribe,timer;
              const cleanup=()=>{clearInterval(timer);unsubscribe?.();};
              const send=event=>{
                if(!ready){initial=event;return;}if(res.destroyed||res.writableEnded)return;
                if(res.writableLength>524288){res.destroy();return;}
                res.write('data: '+JSON.stringify(event)+'\n\n');
                if(event.type==='snapshot'&&event.record.status!=='running'&&!event.record.pending){cleanup();res.end();}
              };
              unsubscribe=support.subscribe(body.id,send);
              res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Accel-Buffering':'no','Connection':'keep-alive'});
              res.once('close',cleanup);timer=setInterval(()=>{if(!res.destroyed&&!res.writableEnded)res.write(': heartbeat\n\n');},1000);
              ready=true;send(initial);return;
            }
            return json(res,200,pathname.endsWith('/stop')?support.stop(body.id):support.view(body.id));
          }
          var supportConfig=supportModule.validateConfig(body);
          if(active||arena.busy()||support.busy())throw new adapters.LiveError('busy',429);
          active++;
          try{
            var supportServices=await runner.status(),supportCli=await copilot.status();
            if(supportConfig.routing_mode==='native'&&!supportServices[supportConfig.local_provider]?.ready)throw new adapters.LiveError('local_service_unavailable',503);
            if(!supportCli.available)throw new adapters.LiveError(supportCli.code||'copilot_unavailable',503);
            if(res.destroyed)return;
            return json(res,200,support.start(supportConfig));
          }finally{active--;}
        }
        if (pathname.startsWith('/api/jev/arena/')) {
          if (pathname === '/api/jev/arena/probe') {
            // Explicit local-only fixed-state lab calls share the normal match
            // lock, but have no per-minute quota. A user starting a match between probes wins;
            // the next probe fails rather than colliding with their inference.
            if (!body || body.consent !== true || Object.keys(body).some(k => !['consent','jobs'].includes(k)) || !Array.isArray(body.jobs) || body.jobs.length < 1 || body.jobs.length > 2 || body.jobs.some(j => !j || !registry.isLocal(j.provider) || Object.keys(j).some(k => !['provider','request'].includes(k)) || !j.request || !Array.isArray(j.request.states) || j.request.states.length < 1 || j.request.states.length > 2 || j.request.states.some((s,i) => !s || s.id !== (i===0?'arena':'survival') || typeof s.state !== 'string' || !s.questions)) || new Set(body.jobs.map(j => j.provider)).size !== body.jobs.length) throw new adapters.LiveError('invalid_input', 400);
            if (active || arena.busy() || support.busy()) throw new adapters.LiveError('busy', 429);
            active++;
            var probeController = new AbortController(), probeTimer = setTimeout(() => probeController.abort(), timeoutMs);
            var probeClose = () => probeController.abort();res.once('close', probeClose);
            try {
              var probes = await Promise.allSettled(body.jobs.map(async j => {var beganProbe=performance.now();var answer=await evaluateArena({provider:j.provider}, j.request, probeController.signal);return {...answer,lab_elapsed_ms:performance.now()-beganProbe};}));
              return json(res, 200, {results:probes.map(r => r.status === 'fulfilled' ? r.value : {ok:false,error:probeController.signal.aborted?'local_probe_timeout':['busy','local_input_limit','local_inference_failed','local_invalid_response','local_service_unavailable','local_connection_invalid'].includes(r.reason?.code)?r.reason.code:'local_probe_failed'})});
            } finally {clearTimeout(probeTimer);res.removeListener('close',probeClose);active--;}
          }
          if (pathname === '/api/jev/arena/latest') {
            if (!body || Array.isArray(body) || Object.keys(body).length) throw new adapters.LiveError('invalid_input', 400);
            return json(res, 200, arena.latest()); // Read-only; no heartbeat renewal or inference.
          }
          if (pathname !== '/api/jev/arena/start') {
            if (!body || Array.isArray(body) || Object.keys(body).join() !== 'id' || typeof body.id !== 'string') throw new adapters.LiveError('invalid_input', 400);
            return json(res, 200, pathname.endsWith('/stop') ? arena.stop(body.id) : pathname.endsWith('/replay') ? arena.replay(body.id) : arena.view(body.id));
          }
          var config = arenaModule.validateConfig(body);
          if (active || arena.busy() || support.busy()) throw new adapters.LiveError('busy', 429);
          active += 1;
          try {
            var services = await runner.status(), cliStatus = config.teams.some(function (t) { return t.provider === 'copilot'; }) ? await copilot.status() : null;
            for (var team of config.teams) {
              if (['attack-baseline','search-baseline'].includes(team.provider)) continue;
              if (team.provider === 'copilot' ? !cliStatus.available : !services[team.provider] || !services[team.provider].ready) throw new adapters.LiveError(team.provider === 'copilot' ? cliStatus.code : 'local_service_unavailable', 503);
            }
            calls = calls.filter(function (t) { return Date.now() - t < 60000; });
            // Only cloud teams reserve bounded-run admission. Explicit experiment
            // decision caps remain; local inference has no rolling rate budget.
            var reserved = config.max_decisions === null ? 0 : config.max_decisions * config.teams.filter(t => t.provider === 'copilot').length;
            if (reserved && calls.length + reserved > maxCalls) throw new adapters.LiveError('local_rate_limit', 429);
            if (res.destroyed) return;
            for (var i = 0; i < reserved; i++) calls.push(Date.now());
            return json(res, 200, arena.start(config));
          } finally { active -= 1; }
        }
        if (arena.busy() || support.busy()) throw new adapters.LiveError('busy', 429);
        if (pathname === '/api/jev/benchmark/models') {
          if (!body || Array.isArray(body) || Object.keys(body).length) throw new adapters.LiveError('invalid_input', 400);
          if (active) throw new adapters.LiveError('busy', 429);
          calls = calls.filter(function (t) { return Date.now() - t < 60000; });
          if (calls.length >= maxCalls) throw new adapters.LiveError('local_rate_limit', 429);
          active += 1; calls.push(Date.now()); controller = new AbortController();
          timer = setTimeout(function () { controller.abort(); }, 30000);
          res.once('close', function () { if (!res.writableEnded) controller.abort(); });
          try {
            if (typeof copilot.listModels !== 'function') throw new Error('unsupported');
            return json(res, 200, await copilot.listModels(controller.signal));
          } catch (error) {
            var modelCodes = ['copilot_disabled', 'copilot_unavailable', 'copilot_incompatible', 'copilot_models_failed', 'copilot_models_timeout', 'copilot_models_invalid', 'copilot_login_required', 'cancelled'];
            return json(res, 503, { error: { code: modelCodes.includes(error.code) ? error.code : 'copilot_models_failed' } });
          } finally { clearTimeout(timer); active -= 1; }
        }
        if (pathname === '/api/jev/benchmark/evaluate') {
          if (!body || Array.isArray(body) || Object.keys(body).some(function (k) { return !['provider', 'model', 'state', 'consent'].includes(k); })) throw new adapters.LiveError('invalid_input', 400);
          if (!registry.isLocal(body.provider) && body.provider !== 'copilot') throw new adapters.LiveError('invalid_provider', 400);
          if (body.consent !== true) throw new adapters.LiveError('consent_required', 400);
          if (body.provider === 'copilot' && !copilotModule.validModel(body.model) || body.provider !== 'copilot' && body.model !== undefined) throw new adapters.LiveError('invalid_model', 400);
          try { core.buildRequest(body.state); } catch (_) { throw new adapters.LiveError('invalid_input', 400); }
          if (active) throw new adapters.LiveError('busy', 429);
          if (!isLocal(body.provider)) {
            calls = calls.filter(function (t) { return Date.now() - t < 60000; });
            if (calls.length >= maxCalls) throw new adapters.LiveError('local_rate_limit', 429);
            calls.push(Date.now());
          }
          active += 1;
          controller = new AbortController(); started = performance.now();
          var expired = false;
          timer = setTimeout(function () { expired = true; controller.abort(); }, options.benchmarkTimeoutMs || (body.provider === 'copilot' ? 190000 : timeoutMs));
          res.once('close', function () { if (!res.writableEnded) controller.abort(); });
          var record;
          try {
            if (body.provider === 'copilot') record = await copilot.evaluate(body.model, body.state, controller.signal);
            else {
              var localResult = await runner.evaluate(body.provider, body.state, controller.signal);
              var answer = localResult.response.answers;
              record = { ok: true, requested_model: localResult.response.model,
                decision: { team: answer.team.choice, enough_info: answer.enough_info.noul >= 0.5, severity: answer.severity.score },
                response: localResult.response, local_execution: localResult.local_execution,
                weights_sha256: localResult.weights_sha256, weights_integrity_verified: localResult.weights_integrity_verified,
                usage: { input_tokens: localResult.response.usage ? localResult.response.usage.input_tokens : null,
                  output_tokens: localResult.response.usage ? localResult.response.usage.output_tokens : null,
                  billing_usd: localResult.billing_usd == null ? null : localResult.billing_usd,
                  scope: localResult.local_execution?.token_count_scope || 'Local candidate-path tokens including repeated prefixes, NOT cloud billed tokens. Hardware, electricity and maintenance excluded.' } };
            }
          } catch (error) {
            var safeCodes = ['copilot_disabled', 'copilot_unavailable', 'copilot_incompatible', 'copilot_timeout', 'copilot_output_limit', 'cancelled', 'local_service_unavailable', 'local_connection_invalid', 'local_input_limit', 'local_inference_failed', 'local_invalid_response', 'busy', 'upstream_timeout'];
            record = { ok: false, error: expired ? 'benchmark_timeout' : safeCodes.includes(error.code) ? error.code : 'benchmark_failed', usage: null };
          } finally { clearTimeout(timer); active -= 1; }
          if (expired) record = {...record,ok:false,error:'benchmark_timeout',decision:null,response:null};
          return json(res, 200, { schema: 'study-room.jev-benchmark.v1', request_id: crypto.randomUUID(),
            completed_at: new Date().toISOString(), provider: body.provider, state: body.state,
            latency_ms: Math.round(performance.now() - started), result: record });
        }
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
        if (!isLocal(body.provider)) {
          calls = calls.filter(function (t) { return Date.now() - t < 60000; });
          if (calls.length >= maxCalls) { res.setHeader('Retry-After', '60'); throw new adapters.LiveError('local_rate_limit', 429); }
        }
      } catch (error) {
        return json(res, error.status || 400, { error: { code: error.code || 'invalid_input' } });
      }
      active += 1; if (!isLocal(body.provider)) calls.push(Date.now());
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
          weights_integrity_verified: result.weights_integrity_verified,
          raw_model_response: result.raw_response || null
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
  var server = createServer({ runner: runner, enableCopilot: argv.includes('--enable-copilot'), archiveArena: !argv.includes('--no-arena-archive') });
  server.on('error', function (error) { console.error('Cannot start local server:', error.code); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', function () {
    console.log('Study Room: http://127.0.0.1:' + port + '/posts/jev-system-one-research/#playground');
    console.log('Keys stay in this process. Read-only authentication is not proof of Jev model access.');
    console.log('Loopback only. Not an authenticated public deployment. Inference requires explicit confirmation.');
    if (!argv.includes('--no-arena-archive')) console.log('Finished arena diagnostics are saved privately: ' + require('./jev-arena-records').DEFAULT_DIRECTORY);
  });
}
if (require.main === module) main(process.argv.slice(2)).catch(function (error) {
  // Only our own fixed CLI error codes are displayed; never SDK errors or key text.
  var safe = ['invalid_port', 'choose_vercel_or_typesafe', 'interactive_terminal_required', 'input_closed', 'cancelled', 'key_missing', 'key_command', 'key_quotes', 'key_whitespace', 'key_placeholder', 'local_provider_needs_no_key'];
  console.error('Startup failed:', safe.includes(error.message) ? error.message : 'startup_error');
  process.exitCode = 1;
});
module.exports = { createServer: createServer };

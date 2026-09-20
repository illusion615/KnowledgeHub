'use strict';
// Server-only adapters. Keys never belong in page state or returned JSON.
var path = require('node:path');
var os = require('node:os');
var fs = require('node:fs');
var url = require('node:url');
var core = require('../posts/jev-system-one-research/playground-core.js');
var credentialIssue = require('./jev-key-input.js').credentialIssue;
var localModels = require('./jev-local-provider.js');
var SAFE_REASONS = ['invalid_api_key', 'invalid_token', 'unauthorized', 'authentication_error', 'permission_denied', 'access_denied', 'forbidden', 'model_not_allowed', 'model_not_found', 'insufficient_quota', 'insufficient_credits', 'insufficient_balance', 'credit_card_required'];
var DEFAULT_SDK_DIR = path.join(os.homedir(), '.cache', 'study-room', 'jev-sdk');
var PROVIDERS = {
  vercel: { model: 'typesafe-ai/jev', key: 'AI_GATEWAY_API_KEY', transport: 'ai-sdk-7-evaluation-v4' },
  typesafe: { model: 'jev-1.13.0', key: 'TYPESAFE_API_KEY', transport: 'typesafe-systemone-http' },
  'nanojev-4bit': { model: 'ZeroDegress/NanoJev-mlx-4bit', local: true, transport: 'local-mlx-decision-http' },
  'nanojev-fp32': { model: 'C-Tianyu/NanoJev', local: true, transport: 'local-mlx-decision-http' }
};
function safeDiagnostic(value) {
  var clean = {};
  if (!value) return clean;
  if (Number.isInteger(value.upstream_status) && value.upstream_status >= 100 && value.upstream_status <= 599) clean.upstream_status = value.upstream_status;
  if (['json', 'html', 'other'].includes(value.response_format)) clean.response_format = value.response_format;
  if (SAFE_REASONS.includes(value.reason_code)) clean.reason_code = value.reason_code;
  return clean;
}
function LiveError(code, status, diagnostic) {
  this.name = 'LiveError'; this.code = code; this.status = status || 502;
  this.message = code; this.diagnostic = safeDiagnostic(diagnostic);
}
LiveError.prototype = Object.create(Error.prototype);
LiveError.prototype.constructor = LiveError;

async function loadGatewaySdk(directory) {
  var base = directory || DEFAULT_SDK_DIR;
  var aiEntry = path.join(base, 'node_modules', 'ai', 'dist', 'index.js');
  var gatewayEntry = path.join(base, 'node_modules', '@ai-sdk', 'gateway', 'dist', 'index.js');
  try {
    var ai = await import(url.pathToFileURL(aiEntry).href);
    var gateway = await import(url.pathToFileURL(gatewayEntry).href);
    var aiVersion = JSON.parse(fs.readFileSync(path.join(base, 'node_modules', 'ai', 'package.json'), 'utf8')).version;
    var gatewayVersion = JSON.parse(fs.readFileSync(path.join(base, 'node_modules', '@ai-sdk', 'gateway', 'package.json'), 'utf8')).version;
    if (typeof ai.experimental_evaluate !== 'function' || typeof gateway.createGateway !== 'function') throw new Error('unsupported');
    return { evaluate: ai.experimental_evaluate, createGateway: gateway.createGateway, versions: { ai: aiVersion, gateway: gatewayVersion } };
  } catch (error) { throw new LiveError('sdk_unavailable', 503); }
}

function gatewayRequest(request) {
  var questions = JSON.parse(JSON.stringify(request.questions));
  questions.enough_info.type = 'boolean';
  return {
    model: PROVIDERS.vercel.model,
    state: request.state,
    questions: questions,
    providerOptions: { gateway: { zeroDataRetention: true } }
  };
}
function normalizeGateway(result, request) {
  var answers = result && result.answers;
  var confidence = result && result.providerMetadata && result.providerMetadata.typesafe && result.providerMetadata.typesafe.confidence;
  var usage = {}, normalized, levels = request.questions.severity.criteria;
  if (!answers || !answers.team || !answers.enough_info || !answers.severity || answers.enough_info.type !== 'boolean') throw new LiveError('invalid_upstream');
  function nativeConfidence(id) {
    return confidence && Object.prototype.hasOwnProperty.call(confidence, id) ? confidence[id] : null;
  }
  if (result.usage && result.usage.inputTokens != null) usage.input_tokens = result.usage.inputTokens;
  if (result.usage && result.usage.outputTokens != null) usage.output_tokens = result.usage.outputTokens;
  normalized = {
    model: result.response && typeof result.response.modelId === 'string' ? result.response.modelId : PROVIDERS.vercel.model,
    answers: {
      team: {
        type: answers.team.type,
        choice: answers.team.choice,
        probabilities: answers.team.probabilities,
        confidence: nativeConfidence('team')
      },
      enough_info: { type: 'noul', noul: answers.enough_info.probability },
      severity: {
        type: answers.severity.type,
        score: answers.severity.score,
        probabilities: answers.severity.probabilities,
        confidence: nativeConfidence('severity'),
        // Labels are copied from the request, not invented or attributed to the model.
        legend: { '0': levels[0], '1': levels[1], '2': levels[2] }
      }
    }
  };
  if (Object.keys(usage).length) normalized.usage = usage;
  if (result.rounding) normalized.rounding = result.rounding;
  try { return core.validateResponse(normalized); }
  catch (error) { throw new LiveError('invalid_upstream'); }
}
function diagnosticFromError(error) {
  var diagnostic = {}, seen = [], current = error, creditCardRequired = false;
  while (current && seen.length < 4 && !seen.includes(current)) {
    seen.push(current);
    var status = current.statusCode || current.status;
    var headers = current.responseHeaders;
    var contentType = headers && (typeof headers.get === 'function' ? headers.get('content-type') : headers['content-type']);
    var data = current.data;
    // Prefer the inner HTTP response when an SDK wrapper changes the outer status.
    if (Number.isInteger(status)) diagnostic.upstream_status = status;
    if (typeof contentType === 'string') diagnostic.response_format = /json/i.test(contentType) ? 'json' : /html/i.test(contentType) ? 'html' : 'other';
    if (!data && typeof current.responseBody === 'string' && current.responseBody.length <= 65536) {
      try { data = JSON.parse(current.responseBody); } catch (_) { /* Never return raw messages. */ }
    }
    // Gateway may encode payment-method verification as an authentication-shaped 403.
    // Recognize the observed, explicit refusal without returning its raw message or URL.
    if (status === 402 || status === 403) {
      var providerMessage = data && data.error && data.error.message || data && data.message;
      [current.message, providerMessage].forEach(function (message) {
        if (typeof message === 'string' && /^(?:Vercel )?AI Gateway requires a valid credit card on file to service requests\b/i.test(message.trim())) creditCardRequired = true;
      });
    }
    [current.code, data && data.code, data && data.error && data.error.code, data && data.error && data.error.type].some(function (code) {
      if (SAFE_REASONS.includes(code)) { diagnostic.reason_code = code; return true; } return false;
    });
    current = current.cause;
  }
  if (creditCardRequired && (diagnostic.upstream_status === 402 || diagnostic.upstream_status === 403)) diagnostic.reason_code = 'credit_card_required';
  return safeDiagnostic(diagnostic);
}
function publicError(error, signal) {
  var diagnostic, status;
  if (error instanceof LiveError) return error;
  if (signal && signal.aborted) return new LiveError('upstream_timeout', 504);
  diagnostic = diagnosticFromError(error); status = diagnostic.upstream_status;
  if ((status === 402 || status === 403) && diagnostic.reason_code === 'credit_card_required') return new LiveError('upstream_payment_method_required', 502, diagnostic);
  if (status === 401) return new LiveError('upstream_auth_401', 502, diagnostic);
  if (status === 403) return new LiveError('upstream_forbidden_403', 502, diagnostic);
  if (status === 402) return new LiveError('upstream_payment', 502, diagnostic);
  if (status === 429 || status === 529) return new LiveError('upstream_rate_limit', 503, diagnostic);
  return new LiveError('upstream_error', 502, diagnostic);
}

function createProviderRunner(options) {
  options = options || {};
  var env = options.env || process.env;
  var fetchImpl = options.fetch || globalThis.fetch;
  var local = localModels.createLocalProvider(options);
  var sdkLoader = options.loadSdk || function () { return loadGatewaySdk(env.JEV_SDK_DIR); };
  var sdkPromise;
  var readiness = {}, checks = {};
  function sdk() {
    if (!sdkPromise) sdkPromise = Promise.resolve().then(sdkLoader).catch(function (error) { sdkPromise = null; throw error; });
    return sdkPromise;
  }
  async function status() {
    var loaded = null;
    try { loaded = await sdk(); } catch (error) { /* Availability is reported, not fabricated. */ }
    function providerStatus(provider) {
      var key = env[PROVIDERS[provider].key], issue = credentialIssue(key), sdkReady = provider !== 'vercel' || Boolean(loaded);
      return { model: PROVIDERS[provider].model, configured: Boolean(key), credential_issue: issue, sdk_ready: sdkReady, ready: !issue && sdkReady, sdk_versions: provider === 'vercel' && loaded ? loaded.versions : null, readiness: readiness[provider] || null };
    }
    var localStatuses = await Promise.all([local.status('nanojev-4bit'), local.status('nanojev-fp32')]);
    return { vercel: providerStatus('vercel'), typesafe: providerStatus('typesafe'), 'nanojev-4bit': localStatuses[0], 'nanojev-fp32': localStatuses[1] };
  }
  async function checkAuthentication(provider) {
    if (!Object.prototype.hasOwnProperty.call(PROVIDERS, provider)) throw new LiveError('invalid_provider', 400);
    if (localModels.isLocal(provider)) {
      try { return await local.checkAuthentication(provider); } catch (error) { throw new LiveError(error.code || 'local_service_unavailable', error.status || 503); }
    }
    if (checks[provider]) return checks[provider];
    checks[provider] = (async function () {
      var issue = credentialIssue(env[PROVIDERS[provider].key]);
      var check = { provider: provider, checked_at: new Date().toISOString(), authentication: 'not_checked', model_access: 'not_tested', model_inference_performed: false, endpoint: provider === 'vercel' ? 'GET /v1/credits' : 'GET /v1/models', code: issue || 'checking' };
      if (issue) { readiness[provider] = check; return check; }
      var signal = AbortSignal.timeout(10000), response, body, parsed;
      try {
        response = await fetchImpl(provider === 'vercel' ? 'https://ai-gateway.vercel.sh/v1/credits' : 'https://api.typesafe.ai/v1/models', {
          method: 'GET', redirect: 'error', signal: signal,
          headers: { Authorization: 'Bearer ' + env[PROVIDERS[provider].key] }
        });
        body = await response.text();
        if (body.length > 65536) throw new LiveError('invalid_upstream');
        var diagnostic = diagnosticFromError({ status: response.status, responseHeaders: response.headers, responseBody: body });
        check.diagnostic = diagnostic;
        if (response.status === 200) {
          try { parsed = JSON.parse(body); } catch (_) { throw new LiveError('invalid_upstream', 502, diagnostic); }
          function numeric(v) { return (typeof v === 'number' || typeof v === 'string' && v.trim() !== '') && Number.isFinite(Number(v)); }
          if (provider === 'vercel' ? !parsed || !numeric(parsed.balance) || !numeric(parsed.total_used) : !parsed || !Array.isArray(parsed.models)) throw new LiveError('invalid_upstream', 502, diagnostic);
          check.authentication = 'verified'; check.code = 'authentication_verified';
          // Deliberately discard balances, team IDs, raw error messages and headers.
        } else {
          check.code = publicError({ statusCode: response.status, responseHeaders: response.headers, responseBody: body }).code;
          check.authentication = response.status === 401 ? 'rejected' : 'unknown';
        }
      } catch (error) {
        var safe = publicError(error, signal); check.code = safe.code; check.authentication = 'unknown'; check.diagnostic = safe.diagnostic;
      }
      readiness[provider] = check; return check;
    }()).finally(function () { delete checks[provider]; });
    return checks[provider];
  }
  async function evaluate(provider, state, signal) {
    var request, result, loaded, gateway, config, key, response, text, data;
    if (!Object.prototype.hasOwnProperty.call(PROVIDERS, provider)) throw new LiveError('invalid_provider', 400);
    if (localModels.isLocal(provider)) {
      try { return await local.evaluate(provider, state, signal); } catch (error) { throw new LiveError(error.code || 'local_service_unavailable', error.status || 503); }
    }
    config = PROVIDERS[provider]; key = env[config.key];
    var issue = credentialIssue(key);
    if (issue) throw new LiveError(issue, 503);
    try { request = core.buildRequest(state); }
    catch (error) { throw new LiveError('invalid_input', 400); }
    try {
      if (provider === 'vercel') {
        loaded = await sdk(); request = gatewayRequest(request);
        gateway = loaded.createGateway({ apiKey: key, ...(options.gatewayFetch ? { fetch: options.gatewayFetch } : {}) });
        if (typeof gateway.evaluationModel !== 'function') throw new LiveError('sdk_unavailable', 503);
        result = await loaded.evaluate({
          model: gateway.evaluationModel(config.model),
          state: request.state, questions: request.questions,
          providerOptions: request.providerOptions,
          maxRetries: 0,
          abortSignal: signal
        });
        data = normalizeGateway(result, request);
      } else {
        response = await fetchImpl('https://api.typesafe.ai/v1/systemone', {
          method: 'POST', redirect: 'error', signal: signal,
          headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        if (!response.ok) throw { statusCode: response.status, responseHeaders: response.headers };
        text = await response.text();
        try { data = core.parseResponse(text); }
        catch (error) { throw new LiveError('invalid_upstream'); }
      }
      return {
        request: request,
        response: data,
        transport: config.transport,
        sdk_versions: provider === 'vercel' ? loaded.versions : null,
        confidence_source: provider === 'vercel' ? 'providerMetadata.typesafe.confidence (if returned)' : 'answers.*.confidence (if returned)',
        score_legend_source: provider === 'vercel' ? 'request.questions.severity.criteria' : 'upstream response',
        underlying_model_revision_verified: false,
        billing_usd: null
      };
    } catch (error) { throw publicError(error, signal); }
  }
  return { status: status, evaluate: evaluate, checkAuthentication: checkAuthentication };
}
module.exports = { DEFAULT_SDK_DIR: DEFAULT_SDK_DIR, PROVIDERS: PROVIDERS, LiveError: LiveError, loadGatewaySdk: loadGatewaySdk, gatewayRequest: gatewayRequest, normalizeGateway: normalizeGateway, createProviderRunner: createProviderRunner, publicError: publicError, credentialIssue: credentialIssue };

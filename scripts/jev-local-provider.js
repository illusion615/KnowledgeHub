'use strict';
// Local-only transport. Operational tokens never enter browser JSON or cloud requests.
var fs = require('node:fs');
var path = require('node:path');
var os = require('node:os');
var core = require('../posts/jev-system-one-research/playground-core');
var MODELS = {
  'nanojev-4bit': { variant: '4bit', model: 'ZeroDegress/NanoJev-mlx-4bit', sha: '332d47eb23c81b0370f580e87e0e55ef737ba1baa206a8d300eadf9617307b62' },
  'nanojev-fp32': { variant: 'fp32', model: 'C-Tianyu/NanoJev', sha: 'fff62d1412685c1714eaa386acb603f9690371fb3cc8ad03dc41319302597c28' }
};
function failure(code, status) { var error = new Error(code); error.code = code; error.status = status || 503; return error; }
function isLocal(provider) { return typeof provider === 'string' && Object.prototype.hasOwnProperty.call(MODELS, provider); }
function connectionFor(provider, env) {
  if (!isLocal(provider)) throw failure('invalid_provider', 400);
  var spec = MODELS[provider];
  var directory = env.NANOJEV_MLX_CONNECTION_DIR || path.join(os.homedir(), '.cache', 'study-room', 'nanojev-mlx');
  var file = path.join(directory, 'connection-' + spec.variant + '.json');
  var stat, connection;
  try {
    stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 8192 || (stat.mode & 0o077) || typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw new Error('unsafe');
    connection = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) { throw failure('local_service_unavailable'); }
  if (connection.schema !== 'study-room.nanojev-connection.v1' || connection.host !== '127.0.0.1' || !Number.isInteger(connection.port) || connection.port < 1 || connection.port > 65535 || !/^[a-f0-9]{64}$/.test(connection.token || '') || connection.variant !== spec.variant || connection.model !== spec.model || connection.weights_sha256 !== spec.sha) throw failure('local_connection_invalid');
  return { origin: 'http://127.0.0.1:' + connection.port, token: connection.token, spec: spec };
}
function nativeRequest(state) {
  var request = core.buildRequest(state);
  request.questions.enough_info.type = 'boolean';
  return { states: [{ id: 'playground', state: request.state.request, questions: request.questions }] };
}
function validateHealth(health, spec) {
  if (!health || health.backend !== 'study-room-nanojev-mlx-v1' || health.ready !== true || health.model_loaded !== true || health.model !== spec.model || health.weights_sha256 !== spec.sha || health.network_model_calls !== 0 || health.device !== 'mlx-metal-gpu' || !['float32', 'float16', 'bfloat16'].includes(health.activation_dtype) || !Number.isInteger(health.max_length) || health.max_length < 1 || health.max_length > 40960 || !Number.isFinite(health.model_memory_bytes) || health.model_memory_bytes < 0) throw failure('local_connection_invalid');
  return health;
}
function normalizeLocal(data, payload, spec) {
  var row, answer, execution, normalized;
  if (!data || data.schema_version !== 'study-room-nanojev-mlx-v1' || data.model !== spec.model || !data.checkpoint || data.checkpoint.weights_sha256 !== spec.sha || !Array.isArray(data.states) || data.states.length !== 1) throw failure('local_invalid_response', 502);
  row = data.states[0];
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw failure('local_invalid_response', 502);
  answer = row.answers; execution = data.execution;
  if (row.id !== 'playground' || !answer || !answer.team || !answer.enough_info || !answer.severity || answer.team.type !== 'choice' || answer.severity.type !== 'score' || answer.enough_info.type !== 'boolean' || !execution || execution.runtime !== 'mlx' || execution.device !== 'metal-gpu' || data.checkpoint.strict_loading !== true || execution.network_model_calls !== 0 || execution.autoregressive_decode_steps !== 0 || !Number.isInteger(execution.candidate_path_tokens) || execution.candidate_path_tokens < 0 || execution.candidate_path_tokens > 16384) throw failure('local_invalid_response', 502);
  var levels = payload.states[0].questions.severity.criteria;
  normalized = {
    model: data.model,
    answers: {
      team: { type: 'choice', choice: answer.team.choice, probabilities: answer.team.probabilities, confidence: null },
      enough_info: { type: 'noul', noul: answer.enough_info.p_true },
      severity: { type: 'score', score: answer.severity.score, probabilities: answer.severity.probabilities, confidence: null, legend: { '0': levels[0], '1': levels[1], '2': levels[2] } }
    },
    usage: { input_tokens: execution.candidate_path_tokens, output_tokens: 0 }
  };
  var bp = answer.enough_info.probabilities;
  if (!answer.team.probabilities || !answer.severity.probabilities || !bp || !Number.isFinite(bp.true) || !Number.isFinite(bp.false) || bp.true < 0 || bp.true > 1 || bp.false < 0 || bp.false > 1 || Math.abs(bp.true + bp.false - 1) > 1e-5 || Math.abs(answer.enough_info.p_true - bp.true) > 1e-6) throw failure('local_invalid_response', 502);
  try { return core.validateResponse(normalized); } catch (error) { throw failure('local_invalid_response', 502); }
}
function createLocalProvider(options) {
  options = options || {};
  var env = options.env || process.env;
  var fetchImpl = options.localFetch || globalThis.fetch;
  async function health(connection) {
    var res = await fetchImpl(connection.origin + '/api/health', { redirect: 'error', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw failure('local_service_unavailable');
    return validateHealth(await res.json(), connection.spec);
  }
  async function status(provider) {
    var spec = MODELS[provider];
    try {
      var conn = connectionFor(provider, env), info = await health(conn);
      return { model: spec.model, local: true, configured: true, sdk_ready: true, ready: true, credential_issue: null,
        readiness: { authentication: 'local_runtime_loaded', model_access: 'loaded', model_inference_performed: false },
        runtime: { device: info.device, activation_dtype: info.activation_dtype, max_length: info.max_length, model_memory_bytes: info.model_memory_bytes, weights_sha256: spec.sha } };
    } catch (error) { return { model: spec.model, local: true, configured: false, sdk_ready: false, ready: false, credential_issue: null, local_error: ['local_service_unavailable', 'local_connection_invalid'].includes(error.code) ? error.code : 'local_service_unavailable' }; }
  }
  async function checkAuthentication(provider) {
    var conn = connectionFor(provider, env);
    await health(conn);
    var res = await fetchImpl(conn.origin + '/api/auth-check', { headers: { 'X-NanoJev-Token': conn.token }, redirect: 'error', signal: AbortSignal.timeout(2500) });
    var data = await res.json();
    if (!res.ok || data.backend !== 'study-room-nanojev-mlx-v1' || data.authenticated !== true) throw failure('local_connection_invalid');
    return { provider: provider, authentication: 'verified', model_access: 'local_model_loaded', model_inference_performed: false, code: 'authentication_verified', checked_at: new Date().toISOString(), diagnostic: { upstream_status: 200, response_format: 'json' } };
  }
  async function evaluate(provider, state, signal) {
    var conn, payload;
    try {
      conn = connectionFor(provider, env); await health(conn); payload = nativeRequest(state);
      var res = await fetchImpl(conn.origin + '/api/evaluate', {
        method: 'POST', redirect: 'error', signal: signal,
        headers: { 'Content-Type': 'application/json', 'X-NanoJev-Token': conn.token },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status === 400 || res.status === 413) throw failure('local_input_limit', 400);
        if (res.status === 429) throw failure('busy', 429);
        if (res.status === 401 || res.status === 403) throw failure('local_connection_invalid');
        throw failure('local_inference_failed', 502);
      }
      var raw = await res.json();
      var normalized = normalizeLocal(raw, payload, conn.spec);
      var execution = { runtime: 'mlx', device: 'metal-gpu', token_count_scope: 'candidate paths including repeated prefixes; not cloud-billed tokens' };
      ['states', 'questions', 'candidate_paths', 'candidate_path_tokens', 'forward_passes', 'path_batch_size', 'autoregressive_decode_steps', 'network_model_calls', 'persistent_model_load_count', 'inference_call_index', 'evaluation_ms', 'peak_memory_bytes', 'max_length', 'weights_bits'].forEach(function (key) {
        if (Number.isFinite(raw.execution[key]) && raw.execution[key] >= 0) execution[key] = raw.execution[key];
      });
      if (['float32', 'float16', 'bfloat16'].includes(raw.execution.activation_dtype)) execution.activation_dtype = raw.execution.activation_dtype;
      return {
        request: payload, response: normalized, transport: 'local-mlx-decision-http', sdk_versions: null,
        confidence_source: 'not returned by NanoJev; never synthesized', score_legend_source: 'request criteria',
        local_execution: execution, weights_sha256: conn.spec.sha,
        weights_integrity_verified: true, billing_usd: 0,
        billing_scope: 'no external model API charge; local compute costs excluded'
      };
    } catch (error) {
      if (signal && signal.aborted) throw failure('upstream_timeout', 504);
      if (error.code && ['local_service_unavailable', 'local_connection_invalid', 'local_invalid_response', 'local_input_limit', 'local_inference_failed', 'busy'].includes(error.code)) throw error;
      throw failure('local_service_unavailable');
    }
  }
  return { status: status, evaluate: evaluate, checkAuthentication: checkAuthentication };
}
module.exports = { MODELS: MODELS, isLocal: isLocal, connectionFor: connectionFor, nativeRequest: nativeRequest, normalizeLocal: normalizeLocal, createLocalProvider: createLocalProvider };

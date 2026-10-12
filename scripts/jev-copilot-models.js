'use strict';
// Read-only subset of the CLI's SDK stdio protocol. No session.create or prompt RPC.
const cp = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const fail = code => Object.assign(new Error(code), { code });
function normalizeModels(result) {
  if (!result || !Array.isArray(result.models) || result.models.length > 1000) throw fail('copilot_models_invalid');
  const seen = new Set();
  return result.models.filter(model => model && typeof model.id === 'string' && /^[a-z0-9][a-z0-9._-]{0,95}$/i.test(model.id) && model.id.toLowerCase() !== 'auto' && (!model.policy || model.policy.state === 'enabled') && !seen.has(model.id) && seen.add(model.id)).map(model => ({
    id: model.id,
    name: typeof model.name === 'string' && model.name.length <= 128 ? model.name.replace(/[\x00-\x1f\x7f]/g, '') : model.id
  }));
}
function exchange(binary, options) {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) return reject(fail('cancelled'));
    let child, buffer = Buffer.alloc(0), bytes = 0, outcome, error, stopping = false, killTimer;
    const group = process.platform !== 'win32';
    function kill(signal) { try { if (group && child.pid) process.kill(-child.pid, signal); else child.kill(signal); } catch (_) { /* exited */ } }
    function finish(value, code) {
      if (stopping) return;
      stopping = true; outcome = value; error = code;
      kill('SIGTERM'); killTimer = setTimeout(() => kill('SIGKILL'), 1000);
    }
    const abort = () => finish(null, 'cancelled');
    function send(id, method) {
      const data = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id, method, params: {} }));
      child.stdin.write('Content-Length: ' + data.length + '\r\n\r\n'); child.stdin.write(data);
    }
    let expected = 1;
    function receive(message) {
      if (message.jsonrpc !== '2.0') throw fail('copilot_models_invalid');
      // Notifications are ignored. Never honor server requests to run client tools.
      if (message.method) {
        if (message.id !== undefined) throw fail('copilot_models_invalid');
        return;
      }
      if (message.id !== expected) throw fail('copilot_models_invalid');
      if (message.error) throw fail('copilot_models_failed');
      if (expected === 1) {
        if (!Number.isInteger(message.result?.protocolVersion)) throw fail('copilot_models_invalid');
        expected = 2; send(2, 'auth.getStatus');
      } else if (expected === 2) {
        if (message.result?.isAuthenticated !== true) throw fail('copilot_login_required');
        expected = 3; send(3, 'models.list');
      } else finish(normalizeModels(message.result));
    }
    try {
      child = (options.spawn || cp.spawn)(binary, ['--headless', '--stdio', '--no-auto-update', '--log-level', 'none', '--log-dir', path.join(options.cwd, 'logs'), '--no-remote-export'], {
        cwd: options.cwd, env: options.env, shell: false, detached: group, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (_) { return reject(fail('copilot_unavailable')); }
    const timer = setTimeout(() => finish(null, 'copilot_models_timeout'), options.timeoutMs || 25000);
    function cleanup() { clearTimeout(timer); clearTimeout(killTimer); options.signal?.removeEventListener('abort', abort); }
    options.signal?.addEventListener('abort', abort, { once: true });
    child.stdin.on('error', () => { if (!stopping) finish(null, 'copilot_models_failed'); });
    child.stdout.on('data', chunk => {
      if (stopping) return;
      bytes += chunk.length;
      if (bytes > 2 * 1024 * 1024) return finish(null, 'copilot_models_invalid');
      buffer = Buffer.concat([buffer, chunk]);
      try {
        while (!stopping) {
          const end = buffer.indexOf('\r\n\r\n');
          if (end < 0) { if (buffer.length > 4096) throw fail('copilot_models_invalid'); break; }
          if (end > 4096) throw fail('copilot_models_invalid');
          const header = buffer.subarray(0, end).toString('ascii');
          const match = /(?:^|\r\n)Content-Length: (\d+)(?:\r\n|$)/i.exec(header);
          const length = match && Number(match[1]);
          if (!length || length > 1024 * 1024) throw fail('copilot_models_invalid');
          if (buffer.length < end + 4 + length) break;
          const message = JSON.parse(buffer.subarray(end + 4, end + 4 + length).toString('utf8'));
          buffer = buffer.subarray(end + 4 + length); receive(message);
        }
      } catch (e) { finish(null, ['copilot_login_required', 'copilot_models_failed'].includes(e.code) ? e.code : 'copilot_models_invalid'); }
    });
    // Do not expose CLI stderr (it may contain login/account information).
    child.stderr.on('data', chunk => { bytes += chunk.length; if (bytes > 2 * 1024 * 1024) finish(null, 'copilot_models_invalid'); });
    child.once('error', () => { cleanup(); reject(fail('copilot_unavailable')); });
    child.once('close', () => { cleanup(); if (error || !outcome) reject(fail(error || 'copilot_models_failed')); else resolve(outcome); });
    if (options.signal?.aborted) abort(); else send(1, 'connect');
  });
}
async function queryModels(binary, options = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'jev-copilot-models-'));
  try {
    await fs.chmod(directory, 0o700);
    return await exchange(binary, { ...options, cwd: directory });
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
module.exports = { queryModels, normalizeModels, exchange };

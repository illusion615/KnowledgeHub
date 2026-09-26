import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, sep, extname, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openRuntime, BridgeError, publicError } from './copilot-runtime.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BODY = 1024 * 1024;
export function validateChat(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
    Object.keys(body).some(k => !['model', 'messages', 'consent'].includes(k)))
    throw new BridgeError(400, 'INVALID_REQUEST', '请求字段不受支持。');
  if (body.consent !== true) throw new BridgeError(403, 'CONSENT_REQUIRED', '发送前请同意将文章和对话发送到GitHub及模型服务，可能消耗Copilot额度。');
  if (typeof body.model !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,99}$/.test(body.model))
    throw new BridgeError(400, 'INVALID_MODEL', '模型名称无效。');
  if (!Array.isArray(body.messages) || body.messages.length < 2 || body.messages.length > 101)
    throw new BridgeError(413, 'CONTEXT_LIMIT', '对话过长，未截断。请主动开始新对话。');
  body.messages.forEach((m, i) => {
    const role = i === 0 ? 'system' : i % 2 ? 'user' : 'assistant';
    if (!m || Object.keys(m).some(k => !['role', 'content'].includes(k)) || m.role !== role || typeof m.content !== 'string' || !m.content.length)
      throw new BridgeError(400, 'INVALID_MESSAGES', '仅支持文本文章和顺序排列的user/assistant对话。');
  });
  if (body.messages.at(-1).role !== 'user') throw new BridgeError(400, 'INVALID_MESSAGES', '最后一条必须是用户问题。');
  return body;
}
async function readJSON(req) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new BridgeError(415, 'CONTENT_TYPE', '需要JSON请求。');
  if (Number(req.headers['content-length']) > MAX_BODY) throw new BridgeError(413, 'CONTEXT_LIMIT', '全文超过1MiB请求上限，未裁剪。请主动减少内容。');
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new BridgeError(413, 'CONTEXT_LIMIT', '全文超过1MiB请求上限，未裁剪。');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new BridgeError(400, 'INVALID_JSON', 'JSON无效。'); }
}
const token = () => randomBytes(32).toString('hex');
const equal = (a, b) => typeof a === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
export function createBridge({ root = repo, runtimeFactory = openRuntime, timeoutMs = 120000, maxConcurrent = 2 } = {}) {
  const sessions = new Map(); let active = 0;
  const server = http.createServer(async (req, res) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    try {
      if (req.headers.host !== new URL(origin).host) throw new BridgeError(403, 'HOST', '仅接受本站loopback Host。');
      if ((req.headers.origin && req.headers.origin !== origin) || ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site']))
        throw new BridgeError(403, 'ORIGIN', '拒绝非同源请求。请直接打开测试站。');
      const url = new URL(req.url, origin);
      if (req.url.includes('..') || /%2e|%2f|%5c|\\/i.test(req.url)) throw new BridgeError(403, 'PATH', '路径不受支持。');
      const api = url.pathname.startsWith('/api/copilot/');
      if (!api) {
        if (req.method !== 'GET' && req.method !== 'HEAD') throw new BridgeError(405, 'METHOD', '方法不允许。');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        if (!/^\/(index\.html|settings\.html|copilot-test\.html|assets\/[^.].*|posts\/[^.].*)$/.test(pathname) || pathname.split('/').some(p => p.startsWith('.')))
          throw new BridgeError(404, 'NOT_FOUND', '页面不存在。');
        let file = resolve(root, '.' + pathname);
        if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
        file = await realpath(file);
        if (!file.startsWith(await realpath(root) + sep) || !mime[extname(file)]) throw new BridgeError(404, 'NOT_FOUND', '文件不公开。');
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': mime[extname(file)] });
        res.end(req.method === 'HEAD' ? undefined : data); return;
      }
      if (!['GET', 'POST'].includes(req.method)) throw new BridgeError(405, 'METHOD', '方法不允许。');
      const id = /(?:^|;\s*)kh_copilot=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      let browser = sessions.get(id);
      const now = Date.now();
      for (const [key, value] of sessions) if (!value.busy && value.expires < now) sessions.delete(key);
      if (browser && browser.expires < now) browser = null;
      if (url.pathname === '/api/copilot/bootstrap' && req.method === 'GET') {
        if (req.headers['x-kh-bootstrap'] !== '1') throw new BridgeError(403, 'CSRF', '需要同源页面初始化。');
        if (!browser) {
          if (sessions.size >= 128) throw new BridgeError(429, 'SESSION_LIMIT', '浏览器会话过多，请稍后重试。');
          const key = token(); browser = { csrf: token(), expires: now + 3600000, busy: false };
          sessions.set(key, browser);
          res.setHeader('Set-Cookie', `kh_copilot=${key}; HttpOnly; SameSite=Strict; Path=/api/copilot`);
        }
        browser.expires = now + 3600000;
        json(200, { csrf: browser.csrf, bridge: 'knowledge-hub-copilot', version: '1.0.83' }); return;
      }
      if (!browser || !equal(req.headers['x-kh-csrf'], browser.csrf)) throw new BridgeError(403, 'CSRF', '会话已过期，请刷新页面后重试。');
      browser.expires = now + 3600000;
      const isChat = url.pathname === '/api/copilot/chat' && req.method === 'POST';
      const isStatus = url.pathname === '/api/copilot/status' && req.method === 'GET';
      if (!isChat && !isStatus) throw new BridgeError(404, 'NOT_FOUND', '接口不存在。');
      if (isChat && req.headers.origin !== origin) throw new BridgeError(403, 'ORIGIN', '发送问题必须来自本站。');
      if (active >= maxConcurrent || browser.busy) throw new BridgeError(429, 'BUSY', '桥接正忙，请先取消当前请求或稍后重试。');
      browser.busy = true; active++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new BridgeError(504, 'TIMEOUT', 'Copilot超时，已取消本次请求。请检查网络后手动重试。')), timeoutMs);
      const onClose = () => { if (!res.writableEnded) controller.abort(new BridgeError(499, 'CANCELLED', '已取消请求。')); };
      res.on('close', onClose);
      let runtime; let streamStarted = false;
      function emit(chunk) {
        if (controller.signal.aborted) throw controller.signal.reason;
        if (!streamStarted) { res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'X-Accel-Buffering': 'no' }); streamStarted = true; }
        // Bound output buffering even when a client stops reading.
        if (res.writableLength > 1024 * 1024) { controller.abort(new BridgeError(503, 'SLOW_CLIENT', '客户端接收过慢，请重试。')); throw controller.signal.reason; }
        res.write('data: ' + JSON.stringify(chunk) + '\n\n');
      }
      try {
        const body = isChat ? validateChat(await readJSON(req)) : null;
        const operation = (async () => {
          runtime = await runtimeFactory(controller.signal);
          if (controller.signal.aborted) { await runtime.close(); throw controller.signal.reason; }
          if (isStatus) return runtime.status();
          await runtime.chat(body, emit);
        })();
        const aborted = new Promise((_, reject) => {
          if (controller.signal.aborted) reject(controller.signal.reason);
          else controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true });
        });
        const result = await Promise.race([operation, aborted]);
        if (isStatus) json(200, result);
        else { if (!streamStarted) emit({ choices: [] }); res.end('data: [DONE]\n\n'); }
      } catch (error) {
        const safe = publicError(controller.signal.aborted ? controller.signal.reason : error);
        if (!res.destroyed) {
          if (streamStarted) res.end('data: ' + JSON.stringify({ error: { code: safe.code, message: safe.message } }) + '\n\n');
          else json(safe.status, { error: { code: safe.code, message: safe.message } });
        }
      } finally {
        clearTimeout(timer); res.off('close', onClose);
        try { if (runtime) await runtime.close(); } finally { browser.busy = false; active--; }
      }
    } catch (error) {
      const safe = error.code === 'ENOENT' ? new BridgeError(404, 'NOT_FOUND', '页面不存在。') : publicError(error);
      if (!res.headersSent && !res.destroyed) json(safe.status, { error: { code: safe.code, message: safe.message } });
    }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.KH_COPILOT_PORT || 8767);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid port');
  const server = createBridge();
  server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? '端口已占用；请设置KH_COPILOT_PORT选择新端口，不停止旧服务。' : '测试站启动失败。'); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Knowledge Hub Copilot测试站：http://127.0.0.1:${port}/copilot-test.html（不自动登录或推理）`));
}

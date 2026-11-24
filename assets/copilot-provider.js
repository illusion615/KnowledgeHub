/* Loopback bridge client. Supports same-origin or local loopback fallback (127.0.0.1:8000). */
(function () {
  'use strict';
  var consented = false;
  var activeBase = null;
  var activeSession = null;
  var notice = 'GitHub Copilot通过本机CLI桥接调用云端，并非离线模型。当前文章全文和对话将发送给GitHub及其模型服务，可能消耗Copilot额度。仅纯问答，不开放文件、shell、Agent工具或MCP。是否同意本页面后续主动发送？';
  function isLoopbackPage() {
    return location.protocol === 'http:' && (location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.hostname === '[::1]');
  }
  function isSupportedPage() {
    return isLoopbackPage() || location.origin === 'https://illusion615.github.io';
  }
  function ensureLocal() {
    if (!isSupportedPage())
      throw new Error('当前为静态预览站，Copilot 仅在本机服务可用。请运行 node scripts/serve-knowledge-hub.mjs 并打开 http://127.0.0.1:8000/。');
  }
  async function checked(res) {
    if (!res.ok) {
      var data; try { data = await res.json(); } catch (_) { data = null; }
      if (res.status === 404 && (!data || !data.error)) {
        var notBridge = new Error('当前端口未启用本机 Copilot 桥接服务，请运行 node scripts/serve-knowledge-hub.mjs 并访问 http://127.0.0.1:8000/。');
        notBridge.code = 'BRIDGE_NOT_FOUND';
        throw notBridge;
      }
      throw new Error(data && data.error && data.error.message || '本机 Copilot 服务响应异常（HTTP ' + res.status + '），请确认 node scripts/serve-knowledge-hub.mjs 正常运行。');
    }
    return res;
  }
  function candidateBases() {
    var list = isLoopbackPage() ? [''] : [];
    var portInput = document.getElementById('studio-port');
    var preferredPort = portInput && Number(portInput.value) >= 1024 ? Number(portInput.value) : 8000;
    var fb = 'http://127.0.0.1:' + preferredPort;
    if (location.origin !== fb && location.origin !== 'http://localhost:' + preferredPort) list.push(fb);
    if (preferredPort !== 8000 && location.origin !== 'http://127.0.0.1:8000') list.push('http://127.0.0.1:8000');
    if (activeBase !== null && list.indexOf(activeBase) > 0) {
      list.splice(list.indexOf(activeBase), 1);
      list.unshift(activeBase);
    }
    return list;
  }
  async function tryBootstrapBase(base, signal) {
    var headers = { 'X-KH-Bootstrap': '1' };
    if (activeSession) headers['X-KH-Session'] = activeSession;
    var res = await fetch(base + '/api/copilot/bootstrap', {
      headers: headers, signal: signal, credentials: base ? 'include' : 'same-origin'
    });
    await checked(res);
    var data = await res.json();
    if (!data || data.bridge !== 'knowledge-hub-copilot') {
      var err = new Error('当前站点未启用 Copilot 桥接服务，请打开 http://127.0.0.1:8000/。');
      err.code = 'BRIDGE_NOT_FOUND';
      throw err;
    }
    activeBase = base;
    if (data.session) activeSession = data.session;
    return { csrf: data.csrf, base: base, session: activeSession };
  }
  async function bootstrapInfo(signal) {
    ensureLocal();
    var bases = candidateBases(), lastError = null, i;
    for (i = 0; i < bases.length; i++) {
      try {
        return await tryBootstrapBase(bases[i], signal);
      } catch (e) {
        if (e && e.name === 'AbortError') throw e;
        lastError = e;
      }
    }
    if (lastError && lastError.code === 'BRIDGE_NOT_FOUND') throw lastError;
    var offline = new Error('本机 Copilot 桥接服务未启动或连接已断开，请运行 node scripts/serve-knowledge-hub.mjs 后重试。');
    offline.code = 'BRIDGE_OFFLINE';
    throw offline;
  }
  async function bootstrap(signal) {
    return (await bootstrapInfo(signal)).csrf;
  }
  function buildHeaders(info, extra) {
    var headers = Object.assign({ 'X-KH-CSRF': info.csrf }, extra || {});
    if (info.session) headers['X-KH-Session'] = info.session;
    return headers;
  }
  window.KHCopilot = {
    notice: notice,
    isLoopback: isLoopbackPage,
    bootstrapInfo: bootstrapInfo,
    consent: function () { if (!consented) consented = window.confirm(notice); return consented; },
    status: async function (signal) {
      signal = signal || AbortSignal.timeout(30000);
      var info = await bootstrapInfo(signal);
      var res = await fetch(info.base + '/api/copilot/status', {
        headers: buildHeaders(info), signal: signal,
        credentials: info.base ? 'include' : 'same-origin'
      });
      return (await checked(res)).json();
    },
    chat: async function (model, messages, signal) {
      if (!consented) throw new Error('请先同意云端发送。');
      var info = await bootstrapInfo(signal);
      return checked(await fetch(info.base + '/api/copilot/chat', {
        method: 'POST', credentials: info.base ? 'include' : 'same-origin', signal: signal,
        headers: buildHeaders(info, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ model: model, messages: messages, consent: true })
      }));
    }
  };
})();

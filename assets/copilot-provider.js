/* Same-origin bridge only. No keys, external endpoint, background inference or fallback. */
(function () {
  'use strict';
  var consented = false;
  var notice = 'GitHub Copilot通过本机CLI桥接调用云端，并非离线模型。当前文章全文和对话将发送给GitHub及其模型服务，可能消耗Copilot额度。仅纯问答，不开放文件、shell、Agent工具或MCP。是否同意本页面后续主动发送？';
  function ensureLocal() {
    if (location.protocol !== 'http:' || location.hostname !== '127.0.0.1')
      throw new Error('Copilot仅在专用loopback测试站可用。请打开 http://127.0.0.1:8767/copilot-test.html（或你启动时指定的端口）；静态托管站不能直连。');
  }
  async function checked(res) {
    if (!res.ok) {
      var data; try { data = await res.json(); } catch (_) {}
      throw new Error(data && data.error && data.error.message || '桥接HTTP ' + res.status + '，请检查专用测试站。');
    }
    return res;
  }
  async function bootstrap(signal) {
    ensureLocal();
    var res;
    try { res = await fetch('/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' }, signal: signal, credentials: 'same-origin' }); }
    catch (e) { if (e.name === 'AbortError') throw e; throw new Error('桥接未启动或连接已断开，请启动专用测试站后重试。'); }
    var data = await (await checked(res)).json();
    if (data.bridge !== 'knowledge-hub-copilot') throw new Error('当前站点不是Copilot桥接，请打开专用测试站。');
    return data.csrf;
  }
  window.KHCopilot = {
    notice: notice,
    consent: function () { if (!consented) consented = window.confirm(notice); return consented; },
    status: async function (signal) {
      signal = signal || AbortSignal.timeout(30000);
      var csrf = await bootstrap(signal);
      return (await checked(await fetch('/api/copilot/status', { headers: { 'X-KH-CSRF': csrf }, signal: signal, credentials: 'same-origin' }))).json();
    },
    chat: async function (model, messages, signal) {
      if (!consented) throw new Error('请先同意云端发送。');
      var csrf = await bootstrap(signal);
      return checked(await fetch('/api/copilot/chat', {
        method: 'POST', credentials: 'same-origin', signal: signal,
        headers: { 'Content-Type': 'application/json', 'X-KH-CSRF': csrf },
        body: JSON.stringify({ model: model, messages: messages, consent: true })
      }));
    }
  };
})();

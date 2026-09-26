/**
 * Article Assistant — LLM-powered Q&A widget for Knowledge Hub articles.
 * Reads LLM connection settings from localStorage('llm-settings').
 * Extracts current article text content as context for answering questions.
 * Features: streamed safe Markdown/math, full-width assistant replies.
 */
(function () {
  'use strict';

  // ---- Check LLM settings availability ----
  var settings = null;
  try { settings = JSON.parse(localStorage.getItem('llm-settings')); } catch (e) {}
  if (!settings || settings.provider === 'none' || !settings.endpoint || !settings.model) return;

  // Resolve relative to this script, so existing article script tags need no changes.
  var assetBase = new URL('.', document.currentScript.src).href;
  var copilotReady = settings.provider === 'github-copilot'
    ? (window.KHCopilot ? Promise.resolve() : loadScript('copilot-provider.js')) : Promise.resolve();
  var requestController = null;
  var messageSources = new WeakMap();
  var messageViews = new WeakMap();
  var messageStats = new WeakMap();
  var mathEngine = null;
  function loadScript(path) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = assetBase + path;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  loadScript('vendor/markdown-it-14.1.0/markdown-it.min.js')
    .then(function () { return loadScript('assistant-markdown.js'); })
    .then(refreshMessages).catch(function () { /* Readable plain-text fallback. */ });

  // Use a pinned local copy, independent of the article's optional CDN math loader.
  var katexLink = document.createElement('link');
  katexLink.rel = 'stylesheet';
  katexLink.href = assetBase + 'vendor/katex-0.16.11/katex.min.css';
  var mathStylesReady = new Promise(function (resolve, reject) {
    katexLink.onload = resolve;
    katexLink.onerror = reject;
  });
  document.head.appendChild(katexLink);
  var mathScriptReady = loadScript('vendor/katex-0.16.11/katex.min.js').then(function () {
    return window.katex;
  });
  Promise.all([mathStylesReady, mathScriptReady]).then(function (loaded) {
    mathEngine = loaded[1];
    refreshMessages();
  }).catch(function () { /* Formula source stays visible if JS or CSS loading fails. */ });

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function keepScroll(update) {
    var pinned = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 48;
    var top = messagesEl.scrollTop;
    update();
    messagesEl.scrollTop = pinned ? messagesEl.scrollHeight : top;
  }

  function messageView(el) {
    if (messageViews.has(el)) return messageViews.get(el);
    var content = document.createElement('div');
    content.className = 'assistant-msg-content';
    while (el.firstChild) content.appendChild(el.firstChild);
    var footer = document.createElement('div');
    footer.className = 'assistant-msg-footer';
    footer.innerHTML = '<button type="button" class="assistant-copy" aria-label="复制回复原文" title="复制原文（Markdown / LaTeX）" disabled>' +
      '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button>' +
      '<time class="assistant-message-time"></time><span class="assistant-copy-status" role="status"></span>' +
      '<span class="assistant-request-model"></span>' +
      '<div class="assistant-message-metrics"></div>';
    var error = document.createElement('div');
    error.className = 'assistant-message-error';
    error.setAttribute('role', 'status');
    error.hidden = true;
    el.appendChild(content);
    el.appendChild(error);
    el.appendChild(footer);
    var view = { content: content, error: error, footer: footer, copy: footer.querySelector('button'),
      time: footer.querySelector('time'), feedback: footer.querySelector('[role="status"]'),
      metrics: footer.querySelector('.assistant-message-metrics'), copying: false };
    messageViews.set(el, view);
    view.copy.addEventListener('click', function () {
      // Snapshot only this reply's original source, not rendered math or footer text.
      var source = messageSources.get(el);
      if (!source || view.copying) return;
      view.copying = true;
      view.copy.disabled = true;
      view.feedback.textContent = '';
      Promise.resolve().then(function () {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
        return navigator.clipboard.writeText(source);
      }).catch(function () {
        // Legacy/insecure-context fallback; never read the existing clipboard.
        var active = document.activeElement;
        var textarea = document.createElement('textarea');
        textarea.value = source;
        textarea.readOnly = true;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(textarea);
        try {
          textarea.select();
          if (!document.execCommand('copy')) throw new Error('Copy denied');
        } finally {
          textarea.remove();
          if (active && active.focus) active.focus({ preventScroll: true });
        }
      }).then(function () {
        view.feedback.textContent = '已复制';
      }).catch(function () {
        view.feedback.textContent = '复制失败，请选择正文手动复制';
      }).finally(function () {
        view.copying = false;
        view.copy.disabled = !messageSources.get(el);
      });
    });
    return view;
  }

  function renderMessage(el, text) {
    messageSources.set(el, text);
    var view = messageView(el);
    var renderer = window.AssistantMarkdown;
    view.content.classList.toggle('assistant-plain-text', !renderer);
    if (!renderer) {
      view.content.textContent = text;
    } else {
      view.content.innerHTML = renderer.render(text);
      renderer.renderMath(view.content, mathEngine);
    }
    view.copy.disabled = view.copying || !text;
    updateMessageStats(el);
  }

  function seconds(ms) { return (ms / 1000).toFixed(2) + 's'; }

  function updateMessageStats(el) {
    var stats = messageStats.get(el);
    if (!stats) return;
    var view = messageView(el);
    var elapsed = Math.max(0, (stats.ended === null ? performance.now() : stats.ended) - stats.started);
    var date = stats.finishedAt || stats.startedAt;
    view.time.dateTime = date.toISOString();
    view.time.textContent = (stats.status === 'streaming' ? '开始于 ' : stats.status === 'error' ? '结束于 ' : '输出于 ') +
      date.toLocaleString('zh-CN', { hour12: false });
    view.time.title = '浏览器本地时间；完成时间以响应流结束为准';
    view.footer.dataset.state = stats.status;
    var attribution = view.footer.querySelector('.assistant-request-model');
    attribution.hidden = stats.hideModel;
    attribution.textContent = stats.hideModel ? '' : '请求模型：' + stats.model;
    attribution.title = stats.hideModel ? '' : '发送时的模型标识；auto由provider自动选择，后续切换不改变本条记录';
    var items = [];
    function metric(text, title) { items.push({ text: text, title: title }); }
    metric((stats.status === 'streaming' ? '输出中 · ' : stats.status === 'error' ? '失败 · ' : '') + '总耗时 ' + seconds(elapsed),
      '浏览器计时：从请求发起到响应流结束（含网络、排队和生成）');
    metric('输出时长 ' + (stats.first === null ? '—' : seconds(Math.max(0, (stats.ended === null ? performance.now() : stats.ended) - stats.first))),
      '浏览器计时：从首个非空内容片段到响应流结束，不等于服务端纯推理耗时');
    metric('首字延迟 ' + (stats.first === null ? '—' : seconds(stats.first - stats.started)),
      '浏览器观测 TTFT：请求发起到首个非空内容片段，忽略角色、usage 和空片段');
    if (stats.inputTokens !== null) metric('输入 ' + stats.inputTokens + ' token', '服务端报告的输入 token 数');
    if (stats.outputTokens !== null) metric('输出 ' + stats.outputTokens + ' token', '服务端报告的输出 token 数；可能包含推理 token，并非字数估算');
    if (stats.inputTokens === null && stats.outputTokens === null) {
      metric(stats.status === 'streaming' ? 'Token：等待服务端统计' : 'Token：服务端未提供', '不以字符数或流式分块数冒充 token 数');
    }
    var speed = null;
    var serverSpeed = stats.evalNs !== null && stats.evalNs > 0;
    if (stats.status === 'complete' && stats.outputTokens !== null) {
      var duration = serverSpeed ? stats.evalNs / 1e9 : elapsed / 1000;
      if (duration > 0) speed = stats.outputTokens / duration;
    }
    metric('吞吐 ' + (speed !== null && Number.isFinite(speed) ? speed.toFixed(1) + ' token/s' + (serverSpeed ? '（服务端）' : '（端到端）') : '—'),
      serverSpeed ? 'Ollama eval_count / eval_duration（纳秒换算秒），服务端生成速度' :
        '输出 token / 浏览器总耗时；含网络和等待，不等于模型解码速度。缺少 token 或失败时不估算');
    if (stats.promptEvalNs > 0 && stats.inputTokens !== null) {
      var prefill = stats.inputTokens / (stats.promptEvalNs / 1e9);
      if (Number.isFinite(prefill)) metric('预填充 ' + prefill.toFixed(1) + ' token/s', 'Ollama prompt_eval_count / prompt_eval_duration，服务端报告');
    }
    if (stats.loadNs !== null) metric('模型加载 ' + seconds(stats.loadNs / 1e6), 'Ollama load_duration，服务端报告');
    view.metrics.replaceChildren();
    items.forEach(function (item) {
      var span = document.createElement('span');
      span.textContent = item.text;
      span.title = item.title;
      view.metrics.appendChild(span);
    });
  }

  function captureUsage(el, chunk) {
    var stats = messageStats.get(el);
    function count(value) { return Number.isSafeInteger(value) && value >= 0 ? value : null; }
    function duration(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null; }
    function assign(key, value) { if (value !== null) stats[key] = value; }
    if (settings.provider === 'ollama') {
      assign('inputTokens', count(chunk.prompt_eval_count));
      assign('outputTokens', count(chunk.eval_count));
      assign('evalNs', duration(chunk.eval_duration));
      assign('promptEvalNs', duration(chunk.prompt_eval_duration));
      assign('loadNs', duration(chunk.load_duration));
    } else if (chunk.usage && typeof chunk.usage === 'object') {
      assign('inputTokens', count(chunk.usage.prompt_tokens));
      assign('outputTokens', count(chunk.usage.completion_tokens));
    }
  }

  function finishMessage(el, status) {
    var stats = messageStats.get(el);
    if (!stats || stats.ended !== null) return;
    stats.ended = performance.now();
    stats.finishedAt = new Date();
    stats.status = status;
    clearInterval(stats.timer);
    keepScroll(function () { updateMessageStats(el); });
  }

  function refreshMessages() {
    if (!messagesEl) return;
    keepScroll(function () {
      messagesEl.querySelectorAll('.assistant-msg-ai').forEach(function (el) {
        if (messageSources.has(el)) renderMessage(el, messageSources.get(el));
      });
    });
  }

  // ---- Inject CSS ----
  var style = document.createElement('style');
  style.textContent = [
    '.assistant-fab {',
    '  position: fixed; right: 28px; bottom: 28px; z-index: 900;',
    '  width: 52px; height: 52px; border-radius: 50%;',
    '  border: none; cursor: pointer;',
    '  background: var(--accent, #ff7a00); color: #fff;',
    '  box-shadow: 0 8px 28px rgba(255, 122, 0, 0.35);',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: transform 0.2s, box-shadow 0.2s;',
    '}',
    '.assistant-fab:hover { transform: scale(1.08); box-shadow: 0 12px 36px rgba(255, 122, 0, 0.45); }',
    '.assistant-fab svg { width: 24px; height: 24px; }',
    '',
    '.assistant-dialog {',
    '  position: fixed; right: 28px; bottom: 92px; z-index: 901;',
    '  width: min(420px, calc(100vw - 40px)); height: min(520px, calc(100vh - 140px));',
    '  border-radius: 20px;',
    '  border: 1px solid rgba(0,0,0,0.08);',
    '  background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72));',
    '  box-shadow: 0 20px 60px rgba(0,0,0,0.16);',
    '  -webkit-backdrop-filter: blur(28px) saturate(1.15);',
    '  backdrop-filter: blur(28px) saturate(1.15);',
    '  display: flex; flex-direction: column;',
    '  opacity: 0; transform: translateY(16px) scale(0.95);',
    '  pointer-events: none;',
    '  transition: opacity 0.25s ease, transform 0.25s ease;',
    '  overflow: hidden;',
    '}',
    '[data-theme="dark"] .assistant-dialog {',
    '  background: linear-gradient(180deg, rgba(18,22,30,0.92), rgba(12,16,24,0.85));',
    '  border-color: rgba(255,255,255,0.06);',
    '  box-shadow: 0 20px 60px rgba(0,0,0,0.5);',
    '}',
    '.assistant-dialog.is-open {',
    '  opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;',
    '}',
    '',
    '.assistant-header {',
    '  display: flex; align-items: center; justify-content: space-between; gap: 8px;',
    '  padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.06);',
    '  flex-shrink: 0;',
    '}',
    '[data-theme="dark"] .assistant-header { border-color: rgba(255,255,255,0.06); }',
    '.assistant-header h3 {',
    '  font-family: "Space Grotesk", "Noto Sans SC", sans-serif;',
    '  font-size: 0.92rem; font-weight: 700; color: var(--ink, #172430); margin: 0;',
    '}',
    '.assistant-header > div:first-child { min-width: 0; overflow-wrap: anywhere; }',
    '.assistant-header-meta { font-size: 0.72rem; color: var(--muted, #5d6c76); margin-top: 2px; }',
    '.assistant-model-toggle { display: block; max-width: 100%; min-height: 44px; padding: 4px 8px; border: 1px solid var(--line, #ccd0d4); border-radius: 6px; background: transparent; color: inherit; font: inherit; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }',
    '.assistant-model-panel { position: absolute; z-index: 5; box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; overflow: hidden; padding: 6px; border: 1px solid var(--line, #ccd0d4); border-radius: 10px; background: var(--paper, #fff); box-shadow: 0 8px 28px #0003; color: var(--ink, #172430); font: 0.78rem/1.4 system-ui; }',
    '.assistant-model-panel[hidden] { display: none; }',
    '.assistant-model-search { box-sizing: border-box; flex: 0 0 auto; width: 100%; min-width: 0; height: 34px; padding: 5px 8px; border: 1px solid var(--line, #ccd0d4); border-radius: 5px; background: transparent; color: inherit; font: inherit; }',
    '.assistant-model-list { flex: 0 1 auto; min-height: 0; max-height: 260px; overflow-y: auto; overscroll-behavior: contain; margin: 4px 0; padding: 0; }',
    '.assistant-model-option { box-sizing: border-box; display: flex; align-items: center; gap: 6px; width: 100%; height: 36px; padding: 0 8px; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }',
    '.assistant-model-option span:first-child { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
    '.assistant-model-option.is-active, .assistant-model-option:hover { background: var(--accent-soft, #ff7a0022); }',
    '.assistant-model-option[aria-selected="true"] { font-weight: 650; }',
    '.assistant-model-check { width: 16px; flex-shrink: 0; text-align: center; }',
    '.assistant-model-panel .assistant-model-status { flex: 0 0 auto; max-height: 64px; overflow: auto; margin: 4px 3px; overflow-wrap: anywhere; color: var(--muted, #5d6c76); font-size: 0.72rem; }',
    '.assistant-model-actions { display: flex; justify-content: space-between; flex: 0 0 auto; gap: 8px; }',
    '.assistant-model-actions button { min-height: 30px; padding: 3px 8px; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; cursor: pointer; }',
    '.assistant-model-toggle:disabled, .assistant-model-panel button:disabled { opacity: 0.5; cursor: default; }',
    '.assistant-model-toggle:focus-visible, .assistant-model-panel :focus-visible { outline: 2px solid var(--accent, #ff7a00); outline-offset: -2px; }',
    '[data-theme="dark"] .assistant-model-panel { background: #172430; color: #eee; }',
    '.assistant-close {',
    '  width: 28px; height: 28px; border-radius: 6px;',
    '  border: none; background: rgba(0,0,0,0.04); color: var(--muted, #5d6c76);',
    '  cursor: pointer; display: flex; align-items: center; justify-content: center;',
    '  transition: background 0.15s;',
    '}',
    '.assistant-close:hover { background: rgba(0,0,0,0.08); }',
    '[data-theme="dark"] .assistant-close { background: rgba(255,255,255,0.06); }',
    '[data-theme="dark"] .assistant-close:hover { background: rgba(255,255,255,0.1); }',
    '.assistant-expand {',
    '  width: 28px; height: 28px; border-radius: 6px;',
    '  border: none; background: rgba(0,0,0,0.04); color: var(--muted, #5d6c76);',
    '  cursor: pointer; display: flex; align-items: center; justify-content: center;',
    '  transition: background 0.15s;',
    '}',
    '.assistant-expand:hover { background: rgba(0,0,0,0.08); }',
    '[data-theme="dark"] .assistant-expand { background: rgba(255,255,255,0.06); }',
    '[data-theme="dark"] .assistant-expand:hover { background: rgba(255,255,255,0.1); }',
    '.assistant-header-actions { display: flex; flex-shrink: 0; gap: 6px; align-items: center; }',
    '',
    '/* Expanded overlay mode */',
    '.assistant-backdrop {',
    '  position: fixed; inset: 0; z-index: 950;',
    '  background: rgba(0,0,0,0.4);',
    '  opacity: 0; pointer-events: none;',
    '  transition: opacity 0.25s ease;',
    '}',
    '.assistant-backdrop.is-open { opacity: 1; pointer-events: auto; }',
    '.assistant-dialog.is-expanded {',
    '  right: 50%; bottom: 50%;',
    '  transform: translate(50%, 50%) scale(1);',
    '  width: min(720px, calc(100vw - 48px));',
    '  height: min(680px, calc(100vh - 80px));',
    '  z-index: 951;',
    '}',
    '.assistant-dialog.is-expanded.is-open {',
    '  transform: translate(50%, 50%) scale(1);',
    '}',
    '',
    '.assistant-messages {',
    '  flex: 1; min-height: 0; min-width: 0; overflow-y: auto; padding: 14px 16px;',
    '  display: flex; flex-direction: column; gap: 12px;',
    '}',
    '.assistant-msg {',
    '  box-sizing: border-box; min-width: 0; flex-shrink: 0;',
    '  font-size: 0.88rem; line-height: 1.7; overflow-wrap: anywhere;',
    '}',
    '.assistant-msg-user {',
    '  align-self: flex-end; max-width: 88%; padding: 10px 14px; border-radius: 14px;',
    '  background: var(--accent, #ff7a00); color: #fff;',
    '  border-bottom-right-radius: 4px;',
    '}',
    '.assistant-msg-ai {',
    '  align-self: stretch; width: 100%; max-width: none; padding: 4px 0;',
    '  background: transparent; color: var(--ink, #172430);',
    '  border: 0; border-radius: 0; box-shadow: none;',
    '}',
    '.assistant-plain-text { white-space: pre-wrap; }',
    '.assistant-msg-content { min-width: 0; }',
    '.assistant-msg-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-top: 12px; color: var(--muted, #5d6c76); font-size: 0.72rem; line-height: 1.6; }',
    '.assistant-copy { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 30px; height: 30px; padding: 0; border: 1px solid var(--line, #ccd0d4); border-radius: 6px; background: transparent; color: inherit; cursor: pointer; }',
    '.assistant-copy:hover { background: var(--accent-soft, rgba(255,122,0,0.14)); color: var(--ink, #172430); }',
    '.assistant-copy:focus-visible { outline: 2px solid var(--accent, #ff7a00); outline-offset: 2px; }',
    '.assistant-copy:disabled { opacity: 0.45; cursor: default; }',
    '.assistant-message-metrics { flex-basis: 100%; min-width: 0; display: flex; flex-wrap: wrap; gap: 2px 12px; font-variant-numeric: tabular-nums; }',
    '.assistant-message-error { color: #b91c1c; margin-top: 8px; white-space: pre-wrap; }',
    '[data-theme="dark"] .assistant-message-error { color: #fca5a5; }',
    '',
    '.assistant-msg-ai p { margin: 0 0 8px; }',
    '.assistant-msg-ai p:last-child { margin-bottom: 0; }',
    '.assistant-msg-ai ul { margin: 4px 0 8px 18px; padding: 0; }',
    '.assistant-msg-ai li { margin-bottom: 2px; }',
    '.assistant-msg-ai pre {',
    '  margin: 8px 0; padding: 10px 12px; border-radius: 8px;',
    '  background: rgba(0,0,0,0.06); overflow-x: auto; max-width: 100%; box-sizing: border-box;',
    '  white-space: pre; overflow-wrap: normal; word-break: normal;',
    '  font-size: 0.82rem; line-height: 1.5;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai pre { background: rgba(255,255,255,0.08); }',
    '.assistant-msg-ai :not(pre) > code {',
    '  padding: 1px 5px; border-radius: 4px;',
    '  background: rgba(0,0,0,0.06); font-size: 0.84em;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai :not(pre) > code { background: rgba(255,255,255,0.08); }',
    '.assistant-msg-ai pre code { padding: 0; background: transparent; color: inherit; font-size: inherit; }',
    '.assistant-msg-ai :is(h1,h2,h3,h4,h5,h6) { color: inherit; line-height: 1.4; margin: 12px 0 6px; }',
    '.assistant-msg-ai h1 { font-size: 1.4em; }',
    '.assistant-msg-ai h2 { font-size: 1.25em; }',
    '.assistant-msg-ai h3 { font-size: 1.15em; }',
    '.assistant-msg-ai :is(h4,h5,h6) { font-size: 1em; }',
    '.assistant-msg-ai blockquote { margin: 8px 0; padding: 0 12px; border-left: 3px solid var(--muted, #5d6c76); color: inherit; }',
    '.assistant-msg-ai a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }',
    '.assistant-table-scroll { max-width: 100%; overflow-x: auto; margin: 8px 0; }',
    '.assistant-msg-ai ol { margin: 4px 0 8px 18px; padding: 0; }',
    '.assistant-msg-ai hr { border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 10px 0; }',
    '[data-theme="dark"] .assistant-msg-ai hr { border-color: rgba(255,255,255,0.1); }',
    '.assistant-msg-ai .md-table {',
    '  width: max-content; min-width: 100%; border-collapse: collapse; margin: 0; font-size: 0.84em;',
    '  overflow-wrap: normal; word-break: normal;',
    '}',
    '.assistant-msg-ai .md-table th, .assistant-msg-ai .md-table td {',
    '  border: 1px solid rgba(0,0,0,0.12); padding: 5px 8px;',
    '}',
    '.assistant-msg-ai .md-table th {',
    '  background: rgba(0,0,0,0.04); font-weight: 600;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai .md-table th, [data-theme="dark"] .assistant-msg-ai .md-table td {',
    '  border-color: rgba(255,255,255,0.1);',
    '}',
    '[data-theme="dark"] .assistant-msg-ai .md-table th { background: rgba(255,255,255,0.06); }',
    '',
    '/* LaTeX math in chat */',
    '.assistant-math-display { display: block; max-width: 100%; text-align: center; margin: 10px 0; overflow-x: auto; overflow-y: hidden; }',
    '.assistant-math-inline { display: inline-block; max-width: 100%; overflow-x: auto; overflow-y: hidden; vertical-align: middle; }',
    '.assistant-msg-ai [data-assistant-math] { white-space: pre-wrap; text-align: left; }',
    '.assistant-msg-ai .katex-display { margin: 0; padding: 3px 0; }',
    '.assistant-msg-ai .katex-display > .katex { text-align: left; width: max-content; min-width: 100%; }',
    '',
    '.thinking-dots {',
    '  display: inline-flex; align-items: center; gap: 5px; padding: 6px 2px;',
    '}',
    '.thinking-dots span {',
    '  width: 7px; height: 7px; border-radius: 50%;',
    '  background: var(--muted, #5d6c76); opacity: 0.3;',
    '  animation: thinking-bounce 1.4s ease-in-out infinite;',
    '}',
    '.thinking-dots span:nth-child(2) { animation-delay: 0.16s; }',
    '.thinking-dots span:nth-child(3) { animation-delay: 0.32s; }',
    '@keyframes thinking-bounce {',
    '  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }',
    '  40% { opacity: 1; transform: scale(1.1); }',
    '}',
    '',
    '.assistant-input-bar {',
    '  display: flex; gap: 8px; padding: 12px 14px;',
    '  border-top: 1px solid rgba(0,0,0,0.06); flex-shrink: 0;',
    '}',
    '[data-theme="dark"] .assistant-input-bar { border-color: rgba(255,255,255,0.06); }',
    '.assistant-input {',
    '  flex: 1; min-width: 0; padding: 9px 12px; border-radius: 10px;',
    '  border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.6);',
    '  color: var(--ink, #172430); font-size: 0.88rem; font-family: inherit;',
    '  outline: none; resize: none;',
    '}',
    '[data-theme="dark"] .assistant-input { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }',
    '.assistant-input:focus { border-color: var(--accent, #ff7a00); }',
    '.assistant-send {',
    '  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;',
    '  border: none; background: var(--accent, #ff7a00); color: #fff;',
    '  cursor: pointer; display: flex; align-items: center; justify-content: center;',
    '  transition: opacity 0.15s;',
    '}',
    '.assistant-send:hover { opacity: 0.85; }',
    '.assistant-send:disabled { opacity: 0.4; cursor: default; }',
    '',
    '@media (max-width: 640px) {',
    '  .assistant-fab { right: 16px; bottom: 16px; width: 46px; height: 46px; }',
    '  .assistant-dialog { right: 8px; bottom: 72px; width: calc(100vw - 16px); height: calc(100vh - 100px); }',
    '}',
    '',
    '/* Raise z-index in presentation mode so dialog appears above presentation UI */',
    '.is-presentation-mode .assistant-dialog { z-index: 10004; }',
    '.is-presentation-mode .assistant-dialog.is-expanded { z-index: 10005; }',
    '.is-presentation-mode .assistant-backdrop { z-index: 10004; }'
  ].join('\n');
  document.head.appendChild(style);

  // ---- Extract article content ----
  function getArticleText() {
    var main = document.querySelector('main');
    if (!main) main = document.querySelector('.site');
    if (!main) main = document.body;
    // Work on a detached copy: collapsed details and modal articles are still
    // article content. innerText omits them and depends on the current layout.
    var copy = main.cloneNode(true);
    copy.querySelectorAll('script, style, noscript, .assistant-dialog, .assistant-fab, .assistant-backdrop, .knowledge-dialog-toolbar, [data-assistant-exclude]').forEach(function (el) {
      el.remove();
    });
    // Prefer author-owned LaTeX over KaTeX's duplicate visual/MathML trees.
    copy.querySelectorAll('[data-latex]').forEach(function (el) {
      var display = el.classList.contains('math-block');
      el.textContent = (display ? '\n$$' : '$') + el.getAttribute('data-latex') + (display ? '$$\n' : '$');
    });
    copy.querySelectorAll('.katex').forEach(function (el) {
      var source = el.querySelector('annotation[encoding="application/x-tex"]');
      if (!source) return;
      var display = el.parentElement && el.parentElement.classList.contains('katex-display');
      el.replaceWith(document.createTextNode((display ? '\n$$' : '$') + source.textContent + (display ? '$$\n' : '$')));
    });
    // Retain paragraph and table boundaries without needing to show hidden DOM.
    copy.querySelectorAll('p, div, section, article, h1, h2, h3, h4, h5, h6, li, blockquote, pre, table, tr, figure, figcaption, summary').forEach(function (el) {
      el.prepend(document.createTextNode('\n'));
      el.appendChild(document.createTextNode('\n'));
    });
    copy.querySelectorAll('td, th').forEach(function (el) { el.appendChild(document.createTextNode('\t')); });
    copy.querySelectorAll('br').forEach(function (el) { el.replaceWith(document.createTextNode('\n')); });
    return (copy.textContent || '').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  // ---- Build DOM ----
  var fab = document.createElement('button');
  fab.className = 'assistant-fab';
  fab.setAttribute('aria-label', 'AI Assistant');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var dialog = document.createElement('div');
  dialog.className = 'assistant-dialog';
  dialog.innerHTML = [
    '<div class="assistant-header">',
    '  <div>',
    '    <h3>AI Assistant</h3>',
    '    <div class="assistant-header-meta"><button type="button" class="assistant-model-toggle" aria-expanded="false" aria-controls="assistant-model-panel">选择模型 ▾</button></div>',
    '  </div>',
    '  <div class="assistant-header-actions">',
    '    <button class="assistant-expand" id="assistant-expand" aria-label="Expand">',
    '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    '    </button>',
    '    <button class="assistant-close" id="assistant-close-btn" aria-label="Close">',
    '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '    </button>',
    '  </div>',
    '</div>',
    '<section class="assistant-model-panel" id="assistant-model-panel" aria-label="模型选择" hidden>',
    '  <input type="search" class="assistant-model-search" role="combobox" aria-label="搜索模型" aria-autocomplete="list" aria-expanded="true" aria-controls="assistant-model-list" aria-describedby="assistant-model-status" placeholder="搜索模型…" autocomplete="off" />',
    '  <div class="assistant-model-list" id="assistant-model-list" role="listbox" aria-label="当前provider的模型"></div>',
    '  <p class="assistant-model-status" id="assistant-model-status" role="status" aria-live="polite"></p>',
    '  <div class="assistant-model-actions"><button type="button" class="assistant-model-refresh">重新读取</button>',
    '  <button type="button" class="assistant-model-close">关闭</button></div>',
    '</section>',
    '<div class="assistant-messages" id="assistant-messages"></div>',
    '<div class="assistant-input-bar">',
    '  <input class="assistant-input" id="assistant-input" type="text" placeholder="针对本文提问..." />',
    '  <button class="assistant-send" id="assistant-send" aria-label="Send">',
    '    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '  </button>',
    '</div>'
  ].join('\n');

  document.body.appendChild(fab);
  document.body.appendChild(dialog);

  var backdrop = document.createElement('div');
  backdrop.className = 'assistant-backdrop';
  document.body.appendChild(backdrop);

  var messagesEl = document.getElementById('assistant-messages');
  var inputEl = document.getElementById('assistant-input');
  var sendBtn = document.getElementById('assistant-send');
  var closeBtn = document.getElementById('assistant-close-btn');
  var expandBtn = document.getElementById('assistant-expand');
  var isOpen = false;
  var isExpanded = false;
  var isSending = false;
  var conversationHistory = [];

  // A compact anchored combobox overlays (never resizes) the conversation.
  // Discovery is user-triggered and never sends article content.
  var modelButton = dialog.querySelector('.assistant-model-toggle');
  var modelPanel = dialog.querySelector('.assistant-model-panel');
  var modelStatus = dialog.querySelector('.assistant-model-status');
  var modelSearch = dialog.querySelector('.assistant-model-search');
  var modelList = dialog.querySelector('.assistant-model-list');
  var filteredModels = [], activeModel = -1, modelNotice = '';
  var modelRefresh = dialog.querySelector('.assistant-model-refresh');
  var modelGeneration = 0, modelController = null, modelsReady = null, listedModels = [];
  function updateModelLabel() {
    modelButton.textContent = settings.showModelName === false ? '选择模型 ▾' : settings.model + ' ▾';
    modelButton.setAttribute('aria-label', settings.showModelName === false ? '选择模型' : '选择模型，当前请求模型：' + settings.model);
    modelButton.title = '仅更改下一条请求的模型；保留对话';
  }
  function connectionKey(value) {
    return JSON.stringify(['provider', 'endpoint', 'apikey', 'bearerToken', 'apiVersion', 'azureAuthType'].map(function (key) { return value[key] || ''; }));
  }
  function savedConnection() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem('llm-settings')); }
    catch (_) { throw new Error('无法读取连接设置，请检查浏览器存储权限或重新保存设置。'); }
    if (!saved || connectionKey(saved) !== connectionKey(settings))
      throw new Error('连接设置已在其他页面改变或清除。请先复制对话并刷新，避免把旧列表用于新provider。');
    return saved;
  }
  function positionModelPicker() {
    if (modelPanel.hidden) return;
    var box = dialog.getBoundingClientRect(), anchor = modelButton.getBoundingClientRect();
    var sx = box.width / dialog.offsetWidth || 1, sy = box.height / dialog.offsetHeight || 1;
    var viewport = window.visualViewport;
    var vx = viewport ? viewport.offsetLeft : 0, vy = viewport ? viewport.offsetTop : 0;
    var vw = viewport ? viewport.width : innerWidth, vh = viewport ? viewport.height : innerHeight;
    var leftEdge = Math.max(8, (vx - box.left) / sx + 8);
    var rightEdge = Math.min(dialog.clientWidth - 8, (vx + vw - box.left) / sx - 8);
    var topEdge = Math.max(8, (vy - box.top) / sy + 8);
    var bottomEdge = Math.min(dialog.clientHeight - 8, (vy + vh - box.top) / sy - 8);
    var below = (anchor.bottom - box.top) / sy + 4;
    var above = (anchor.top - box.top) / sy - 4;
    var upwards = bottomEdge - below < 140 && above - topEdge > bottomEdge - below;
    var top = upwards ? topEdge : Math.max(topEdge, Math.min(below, bottomEdge));
    var available = Math.max(0, (upwards ? above : bottomEdge) - top);
    var width = Math.max(0, Math.min(320, rightEdge - leftEdge));
    modelPanel.style.width = width + 'px';
    modelPanel.style.left = Math.max(leftEdge, Math.min((anchor.left - box.left) / sx, rightEdge - width)) + 'px';
    modelPanel.style.maxHeight = available + 'px';
    modelPanel.style.top = top + 'px';
    if (upwards) modelPanel.style.top = Math.max(topEdge, above - modelPanel.offsetHeight) + 'px';
  }
  function highlightModel(index) {
    activeModel = index;
    Array.from(modelList.children).forEach(function (option, i) { option.classList.toggle('is-active', i === index); });
    if (index < 0 || !modelList.children[index]) { modelSearch.removeAttribute('aria-activedescendant'); return; }
    var option = modelList.children[index];
    modelSearch.setAttribute('aria-activedescendant', option.id);
    // Scroll the list only, never the article or conversation behind the popup.
    var top = option.offsetTop - modelList.offsetTop;
    if (top < modelList.scrollTop) modelList.scrollTop = top;
    else if (top + option.offsetHeight > modelList.scrollTop + modelList.clientHeight)
      modelList.scrollTop = top + option.offsetHeight - modelList.clientHeight;
  }
  function filterModels() {
    var query = modelSearch.value.trim().toLocaleLowerCase();
    filteredModels = listedModels.filter(function (id) { return id.toLocaleLowerCase().indexOf(query) >= 0; });
    modelList.replaceChildren();
    filteredModels.forEach(function (id, index) {
      var option = document.createElement('button');
      option.type = 'button'; option.className = 'assistant-model-option'; option.tabIndex = -1;
      option.id = 'assistant-model-option-' + index; option.setAttribute('role', 'option');
      var current = settings.showModelName !== false && id === settings.model;
      option.setAttribute('aria-selected', current ? 'true' : 'false');
      var name = document.createElement('span'); name.textContent = id;
      var check = document.createElement('span'); check.className = 'assistant-model-check';
      check.setAttribute('aria-hidden', 'true'); check.textContent = current ? '✓' : '';
      option.append(name, check);
      option.addEventListener('mousedown', function (event) { event.preventDefault(); });
      option.addEventListener('click', function () { applyModel(id); });
      modelList.appendChild(option);
    });
    highlightModel(-1);
    if (listedModels.length) modelStatus.textContent = filteredModels.length
      ? filteredModels.length + ' 个模型 · 仅影响下一条请求' + (listedModels.indexOf(settings.model) < 0 ? '；当前模型未出现在列表，仍保留。' : '')
      : '没有匹配模型；试试其他关键词。';
    modelStatus.title = modelNotice;
    positionModelPicker();
  }
  function cancelModelList() {
    modelGeneration++;
    if (modelController) modelController.abort();
    modelController = null;
    listedModels = []; filteredModels = []; activeModel = -1;
    modelList.replaceChildren();
    modelSearch.removeAttribute('aria-activedescendant');
    modelNotice = ''; modelStatus.title = '';
    modelRefresh.disabled = false;
    modelPanel.removeAttribute('aria-busy');
  }
  function closeModelPicker(restoreFocus) {
    cancelModelList();
    modelPanel.hidden = true;
    modelButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus && !modelButton.disabled) modelButton.focus();
  }
  function loadModelList() {
    if (isSending || modelPanel.hidden) return;
    cancelModelList();
    var generation = modelGeneration;
    var snapshot = Object.assign({}, settings);
    modelController = new AbortController();
    var signal = modelController.signal;
    modelStatus.textContent = '读取模型列表中（不推理）…';
    positionModelPicker();
    modelPanel.setAttribute('aria-busy', 'true');
    modelRefresh.disabled = true;
    if (!modelsReady) modelsReady = window.KHModels ? Promise.resolve() : loadScript('llm-models.js').catch(function () {
      modelsReady = null; throw new Error('模型列表组件加载失败，请重新读取。');
    });
    Promise.all([modelsReady, copilotReady]).then(function () {
      if (generation !== modelGeneration || isSending || modelPanel.hidden) return;
      savedConnection();
      return window.KHModels.load(snapshot, { signal: signal });
    }).then(function (result) {
      if (!result || generation !== modelGeneration || isSending || modelPanel.hidden) return;
      savedConnection();
      listedModels = result.models;
      modelNotice = result.notice;
      modelStatus.textContent = listedModels.length ? '' : '没有可选模型，保留当前模型。' + result.notice;
      filterModels();
    }).catch(function (error) {
      if (generation === modelGeneration && !modelPanel.hidden) { modelStatus.textContent = error.message; positionModelPicker(); }
    }).finally(function () {
      if (generation === modelGeneration) { modelPanel.removeAttribute('aria-busy'); modelRefresh.disabled = false; modelController = null; }
    });
  }
  updateModelLabel();
  modelButton.addEventListener('click', function () {
    if (isSending) return;
    if (!modelPanel.hidden) { closeModelPicker(true); return; }
    modelPanel.hidden = false; modelButton.setAttribute('aria-expanded', 'true');
    modelSearch.value = ''; positionModelPicker();
    modelSearch.focus({ preventScroll: true }); loadModelList();
  });
  modelRefresh.addEventListener('click', loadModelList);
  modelSearch.addEventListener('input', filterModels);
  modelSearch.addEventListener('keydown', function (event) {
    if (event.isComposing || !filteredModels.length || isSending) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      highlightModel(event.key === 'ArrowDown' ? (activeModel + 1) % filteredModels.length : (activeModel < 0 ? filteredModels.length - 1 : (activeModel - 1 + filteredModels.length) % filteredModels.length));
    } else if ((event.key === 'Home' || event.key === 'End') && activeModel >= 0) {
      event.preventDefault(); highlightModel(event.key === 'Home' ? 0 : filteredModels.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault(); applyModel(filteredModels[activeModel < 0 ? 0 : activeModel]);
    }
  });
  function applyModel(selected) {
    if (isSending || modelPanel.hidden || listedModels.indexOf(selected) < 0) return;
    try {
      var saved = savedConnection();
      // Update exactly one field in the latest record, preserving unknown settings.
      saved.model = selected;
      localStorage.setItem('llm-settings', JSON.stringify(saved));
      settings.model = selected;
      updateModelLabel();
      closeModelPicker(true);
    } catch (error) { modelStatus.textContent = '未切换：' + error.message; positionModelPicker(); }
  }
  dialog.querySelector('.assistant-model-close').addEventListener('click', function () { closeModelPicker(true); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modelPanel.hidden) { event.preventDefault(); event.stopPropagation(); closeModelPicker(true); }
  });
  document.addEventListener('pointerdown', function (event) {
    if (!modelPanel.hidden && !modelPanel.contains(event.target) && !modelButton.contains(event.target)) closeModelPicker(true);
  }, true);
  modelPanel.addEventListener('focusout', function () {
    setTimeout(function () {
      if (!modelPanel.hidden && !modelPanel.contains(document.activeElement) && document.activeElement !== modelButton) closeModelPicker(false);
    }, 0);
  });
  window.addEventListener('resize', positionModelPicker);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', positionModelPicker);
    window.visualViewport.addEventListener('scroll', positionModelPicker);
  }
  if (window.ResizeObserver) new ResizeObserver(positionModelPicker).observe(dialog);
  dialog.addEventListener('transitionend', positionModelPicker);
  window.addEventListener('storage', function (event) {
    if ((event.key === 'llm-settings' || event.key === null) && !modelPanel.hidden) {
      cancelModelList();
      modelStatus.textContent = '连接设置已在其他页面更新，旧列表已作废。请重新读取；provider或端点改变时须刷新页面。';
    }
  });

  fab.addEventListener('click', function () {
    isOpen = !isOpen;
    dialog.classList.toggle('is-open', isOpen);
    if (!isOpen) closeModelPicker(false);
    if (isOpen) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', function () {
    closeModelPicker(false);
    isOpen = false;
    isExpanded = false;
    dialog.classList.remove('is-open', 'is-expanded');
    backdrop.classList.remove('is-open');
  });

  expandBtn.addEventListener('click', function () {
    isExpanded = !isExpanded;
    dialog.classList.toggle('is-expanded', isExpanded);
    backdrop.classList.toggle('is-open', isExpanded);
    // Update icon: expand ↔ collapse
    if (isExpanded) {
      expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    } else {
      expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
      backdrop.classList.remove('is-open');
    }
  });

  backdrop.addEventListener('click', function () {
    isExpanded = false;
    dialog.classList.remove('is-expanded');
    backdrop.classList.remove('is-open');
    expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  });

  function createThinkingDots() {
    var div = document.createElement('div');
    div.className = 'assistant-msg assistant-msg-ai';
    div.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(div);
    var stats = { model: settings.model, hideModel: settings.showModelName === false,
      started: performance.now(), startedAt: new Date(), first: null, ended: null,
      finishedAt: null, status: 'streaming', inputTokens: null, outputTokens: null,
      evalNs: null, promptEvalNs: null, loadNs: null, timer: null };
    messageStats.set(div, stats);
    updateMessageStats(div);
    stats.timer = setInterval(function () { keepScroll(function () { updateMessageStats(div); }); }, 250);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function appendMessage(role, content) {
    var div = document.createElement('div');
    div.className = 'assistant-msg ' + (role === 'user' ? 'assistant-msg-user' : 'assistant-msg-ai');
    if (role === 'user') {
      div.textContent = content;
    } else {
      renderMessage(div, content);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function buildMessages(userQuery) {
    // Refresh on every request so language/content changes do not leave stale context.
    // Provider context limits remain provider errors, never silent local truncation.
    var articleContext = getArticleText();
    var systemMsg = '你是一个知识文章助手。以下是当前文章的内容，请基于文章内容回答用户的问题。如果问题超出文章范围，请如实说明。回答时可使用 Markdown 格式，数学公式请使用 LaTeX 语法（行内公式用 $...$，独立公式用 $$...$$）。\n\n---\n' + articleContext + '\n---';
    var messages = [{ role: 'system', content: systemMsg }];
    conversationHistory.forEach(function (m) { messages.push(m); });
    messages.push({ role: 'user', content: userQuery });
    return messages;
  }

  function sendMessage() {
    var query = inputEl.value.trim();
    if (!query || isSending) return;

    if (settings.provider === 'github-copilot') {
      if (!window.KHCopilot) { copilotReady.then(sendMessage).catch(function () { alert('Copilot组件加载失败，请刷新专用测试站。'); }); return; }
      if (!window.KHCopilot.consent()) return;
    }
    appendMessage('user', query);
    inputEl.value = '';
    isSending = true;
    closeModelPicker(false);
    modelButton.disabled = true;
    sendBtn.disabled = settings.provider !== 'github-copilot';
    if (settings.provider === 'github-copilot') {
      sendBtn.setAttribute('aria-label', '取消请求');
      sendBtn.textContent = '停止';
      requestController = new AbortController();
    }

    var thinkingEl = createThinkingDots();

    var endpoint = settings.endpoint.replace(/\/+$/, '');
    var url, body;
    var headers = { 'Content-Type': 'application/json' };

    if (settings.provider === 'github-copilot') {
      var messages = buildMessages(query);
      window.KHCopilot.chat(settings.model, messages, requestController.signal)
        .then(function (res) { return handleStreamResponse(res, thinkingEl, query); })
        .catch(function (err) { handleSendError(err, thinkingEl); });
      return;
    }
    if (settings.provider === 'ollama') {
      url = endpoint + '/api/chat';
      body = { model: settings.model, messages: buildMessages(query), stream: true };
    } else if (settings.provider === 'azure-openai') {
      var apiVer = settings.apiVersion || '2024-12-01-preview';
      url = endpoint + '/openai/deployments/' + encodeURIComponent(settings.model) + '/chat/completions?api-version=' + apiVer;
      body = { messages: buildMessages(query), stream: true };
      if (settings.azureAuthType === 'bearer' && settings.bearerToken) {
        headers['Authorization'] = 'Bearer ' + settings.bearerToken;
      } else if (settings.apikey) {
        headers['api-key'] = settings.apikey;
      }
    } else {
      url = endpoint + '/chat/completions';
      body = { model: settings.model, messages: buildMessages(query), stream: true };
      if (settings.apikey) headers['Authorization'] = 'Bearer ' + settings.apikey;
    }

    if (settings.provider !== 'ollama') body.stream_options = { include_usage: true };
    function request() { return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) }); }
    request().then(function (res) {
      // Older compatible servers may explicitly reject usage options. Retry only that
      // validation error, before any stream, never auth/rate-limit/network/server errors.
      if (!body.stream_options || (res.status !== 400 && res.status !== 422)) return res;
      return res.clone().text().then(function (errorText) {
        if (/(stream_options|include_usage)/i.test(errorText) && /unknown|unsupported|unrecognized|unexpected|extra|not (supported|permitted|allowed)/i.test(errorText)) {
          delete body.stream_options;
          return request();
        }
        return res;
      });
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return handleStreamResponse(res, thinkingEl, query);
    })
    .catch(function (err) {
      handleSendError(err, thinkingEl);
    });
  }

  function resetSend() {
    isSending = false;
    modelButton.disabled = false;
    sendBtn.disabled = false;
    if (settings.provider === 'github-copilot') {
      requestController = null;
      sendBtn.textContent = '发送';
      sendBtn.setAttribute('aria-label', 'Send');
    }
  }

  function handleStreamResponse(res, thinkingEl, query) {
    var fullText = '';
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var renderTimer = null;
    var streamError = null;
    var streamDone = false;

    function paint() {
      keepScroll(function () { renderMessage(thinkingEl, fullText || '(无回复)'); });
    }
    function scheduleRender() {
      if (renderTimer) return;
      renderTimer = setTimeout(function () { renderTimer = null; paint(); }, 80);
    }
    function processLine(line) {
      line = line.trim();
      if (line === 'data: [DONE]') { streamDone = true; return; }
      if (!line) return;
      var token = '';
      try {
        if (settings.provider === 'ollama') {
          var obj = JSON.parse(line);
          captureUsage(thinkingEl, obj);
          token = obj.message && obj.message.content;
        } else if (line.indexOf('data:') === 0) {
          var chunk = JSON.parse(line.substring(5).trim());
          if (chunk.error && settings.provider === 'github-copilot') streamError = new Error(chunk.error.message || 'Copilot流式响应失败');
          captureUsage(thinkingEl, chunk);
          var delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
          token = delta && delta.content;
        }
      } catch (e) { /* Ignore keep-alives and non-content events. */ }
      if (typeof token === 'string' && token) {
        var stats = messageStats.get(thinkingEl);
        if (stats.first === null) stats.first = performance.now();
        fullText += token;
        scheduleRender();
      }
    }
    function processChunk(result) {
      buffer += result.done ? decoder.decode() : decoder.decode(result.value, { stream: true });
      var lines = buffer.split('\n');
      buffer = lines.pop();
      lines.forEach(processLine);
      if (streamError) throw streamError;
      if (result.done) {
        // Some SSE/NDJSON servers omit the trailing newline; don't drop that final token.
        processLine(buffer);
        if (streamError) throw streamError;
        if (settings.provider === 'github-copilot' && !streamDone) throw new Error('Copilot连接中断，回复不完整；未自动重试。');
        if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
        finishMessage(thinkingEl, 'complete');
        paint();
        conversationHistory.push({ role: 'user', content: query });
        conversationHistory.push({ role: 'assistant', content: fullText });
        resetSend();
        return;
      }
      return reader.read().then(processChunk);
    }
    return reader.read().then(processChunk).catch(function (err) {
      if (renderTimer) clearTimeout(renderTimer);
      if (fullText) paint();
      throw err;
    }).finally(function () { reader.releaseLock(); });
  }

  function handleSendError(err, thinkingEl) {
      var msg = err.name === 'AbortError' ? '已取消本次请求。部分输出不会加入下一轮对话。' : err.message;
      if (msg === 'Failed to fetch' && window.location.protocol === 'file:') {
        msg = '无法连接。从 file:// 协议访问时浏览器可能阻止跨域请求。\n建议：使用 python3 -m http.server 启动本地服务器。\nOllama 用户：确认已设置 OLLAMA_ORIGINS=*';
      }
      finishMessage(thinkingEl, 'error');
      keepScroll(function () {
        var view = messageView(thinkingEl);
        if (!messageSources.has(thinkingEl)) view.content.replaceChildren();
        view.error.hidden = false;
        view.error.textContent = '错误: ' + msg;
      });
      resetSend();
  }

  sendBtn.addEventListener('click', function () {
    if (isSending && requestController) { requestController.abort(); return; }
    sendMessage();
  });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(); }
  });
})();

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
    '.assistant-header-meta {',
    '  font-size: 0.72rem; color: var(--muted, #5d6c76); margin-top: 2px;',
    '}',
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
    var text = main.innerText || main.textContent || '';
    if (text.length > 6000) text = text.substring(0, 6000) + '\n...(内容已截断)';
    return text;
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
    (settings.showModelName === false
      ? ''
      : '    <div class="assistant-header-meta">' + escapeHtml(settings.model || '') + ' via ' + escapeHtml(settings.provider) + '</div>'),
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
  var articleContext = '';

  fab.addEventListener('click', function () {
    isOpen = !isOpen;
    dialog.classList.toggle('is-open', isOpen);
    if (isOpen) {
      inputEl.focus();
      if (!articleContext) articleContext = getArticleText();
    }
  });

  closeBtn.addEventListener('click', function () {
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
    var stats = { started: performance.now(), startedAt: new Date(), first: null, ended: null,
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
    var systemMsg = '你是一个知识文章助手。以下是当前文章的内容，请基于文章内容回答用户的问题。如果问题超出文章范围，请如实说明。回答时可使用 Markdown 格式，数学公式请使用 LaTeX 语法（行内公式用 $...$，独立公式用 $$...$$）。\n\n---\n' + articleContext + '\n---';
    var messages = [{ role: 'system', content: systemMsg }];
    conversationHistory.forEach(function (m) { messages.push(m); });
    messages.push({ role: 'user', content: userQuery });
    return messages;
  }

  function sendMessage() {
    var query = inputEl.value.trim();
    if (!query || isSending) return;

    appendMessage('user', query);
    conversationHistory.push({ role: 'user', content: query });
    inputEl.value = '';
    isSending = true;
    sendBtn.disabled = true;

    var thinkingEl = createThinkingDots();

    var endpoint = settings.endpoint.replace(/\/+$/, '');
    var url, body;
    var headers = { 'Content-Type': 'application/json' };

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
      return handleStreamResponse(res, thinkingEl);
    })
    .catch(function (err) {
      handleSendError(err, thinkingEl);
    });
  }

  function handleStreamResponse(res, thinkingEl) {
    var fullText = '';
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var renderTimer = null;

    function paint() {
      keepScroll(function () { renderMessage(thinkingEl, fullText || '(无回复)'); });
    }
    function scheduleRender() {
      if (renderTimer) return;
      renderTimer = setTimeout(function () { renderTimer = null; paint(); }, 80);
    }
    function processLine(line) {
      line = line.trim();
      if (!line || line === 'data: [DONE]') return;
      var token = '';
      try {
        if (settings.provider === 'ollama') {
          var obj = JSON.parse(line);
          captureUsage(thinkingEl, obj);
          token = obj.message && obj.message.content;
        } else if (line.indexOf('data:') === 0) {
          var chunk = JSON.parse(line.substring(5).trim());
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
      if (result.done) {
        // Some SSE/NDJSON servers omit the trailing newline; don't drop that final token.
        processLine(buffer);
        if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
        finishMessage(thinkingEl, 'complete');
        paint();
        conversationHistory.push({ role: 'assistant', content: fullText });
        isSending = false;
        sendBtn.disabled = false;
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
      var msg = err.message;
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
      isSending = false;
      sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(); }
  });
})();

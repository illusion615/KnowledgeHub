/**
 * Article Assistant — LLM-powered Q&A widget for Knowledge Hub articles.
 * Reads LLM connection settings from localStorage('llm-settings').
 * Extracts current article text content as context for answering questions.
 * Features: thinking dots animation, lightweight Markdown rendering.
 */
(function () {
  'use strict';

  // ---- Check LLM settings availability ----
  var settings = null;
  try { settings = JSON.parse(localStorage.getItem('llm-settings')); } catch (e) {}
  if (!settings || settings.provider === 'none' || !settings.endpoint || !settings.model) return;

  // ---- Lightweight Markdown to HTML ----
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    var html = text
      .replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
        return '<pre class="md-pre"><code>' + escapeHtml(code.replace(/\n$/, '')) + '</code></pre>';
      })
      .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<strong class="md-h3">$1</strong>')
      .replace(/^## (.+)$/gm, '<strong class="md-h2">$1</strong>')
      .replace(/^# (.+)$/gm, '<strong class="md-h1">$1</strong>')
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    html = html.replace(/((?:<li>.*?<\/li>(?:<br>)?)+)/g, '<ul>$1</ul>');
    html = html.replace(/<ul><br>/g, '<ul>').replace(/<br><\/ul>/g, '</ul>');
    return '<p>' + html + '</p>';
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
    '  display: flex; align-items: center; justify-content: space-between;',
    '  padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.06);',
    '  flex-shrink: 0;',
    '}',
    '[data-theme="dark"] .assistant-header { border-color: rgba(255,255,255,0.06); }',
    '.assistant-header h3 {',
    '  font-family: "Space Grotesk", "Noto Sans SC", sans-serif;',
    '  font-size: 0.92rem; font-weight: 700; color: var(--ink, #172430); margin: 0;',
    '}',
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
    '.assistant-header-actions { display: flex; gap: 6px; align-items: center; }',
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
    '  flex: 1; overflow-y: auto; padding: 14px 16px;',
    '  display: flex; flex-direction: column; gap: 12px;',
    '}',
    '.assistant-msg {',
    '  max-width: 88%; padding: 10px 14px; border-radius: 14px;',
    '  font-size: 0.88rem; line-height: 1.7; word-break: break-word;',
    '}',
    '.assistant-msg-user {',
    '  align-self: flex-end;',
    '  background: var(--accent, #ff7a00); color: #fff;',
    '  border-bottom-right-radius: 4px;',
    '}',
    '.assistant-msg-ai {',
    '  align-self: flex-start;',
    '  background: rgba(0,0,0,0.04); color: var(--ink, #172430);',
    '  border-bottom-left-radius: 4px;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai { background: rgba(255,255,255,0.06); }',
    '',
    '.assistant-msg-ai p { margin: 0 0 8px; }',
    '.assistant-msg-ai p:last-child { margin-bottom: 0; }',
    '.assistant-msg-ai ul { margin: 4px 0 8px 18px; padding: 0; }',
    '.assistant-msg-ai li { margin-bottom: 2px; }',
    '.assistant-msg-ai .md-pre {',
    '  margin: 8px 0; padding: 10px 12px; border-radius: 8px;',
    '  background: rgba(0,0,0,0.06); overflow-x: auto;',
    '  font-size: 0.82rem; line-height: 1.5;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai .md-pre { background: rgba(255,255,255,0.08); }',
    '.assistant-msg-ai .md-code {',
    '  padding: 1px 5px; border-radius: 4px;',
    '  background: rgba(0,0,0,0.06); font-size: 0.84em;',
    '}',
    '[data-theme="dark"] .assistant-msg-ai .md-code { background: rgba(255,255,255,0.08); }',
    '.assistant-msg-ai .md-h1 { font-size: 1.1em; display: block; margin: 8px 0 4px; }',
    '.assistant-msg-ai .md-h2 { font-size: 1.0em; display: block; margin: 6px 0 3px; }',
    '.assistant-msg-ai .md-h3 { font-size: 0.95em; display: block; margin: 4px 0 2px; }',
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
    '  flex: 1; padding: 9px 12px; border-radius: 10px;',
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
    '}'
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
    '    <div class="assistant-header-meta">' + escapeHtml(settings.model || '') + ' via ' + escapeHtml(settings.provider) + '</div>',
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
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function appendMessage(role, content) {
    var div = document.createElement('div');
    div.className = 'assistant-msg ' + (role === 'user' ? 'assistant-msg-user' : 'assistant-msg-ai');
    if (role === 'user') {
      div.textContent = content;
    } else {
      div.innerHTML = renderMarkdown(content);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function buildMessages(userQuery) {
    var systemMsg = '你是一个知识文章助手。以下是当前文章的内容，请基于文章内容回答用户的问题。如果问题超出文章范围，请如实说明。回答时可使用 Markdown 格式。\n\n---\n' + articleContext + '\n---';
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
    } else {
      url = endpoint + '/chat/completions';
      body = { model: settings.model, messages: buildMessages(query), stream: true };
      if (settings.apikey) headers['Authorization'] = 'Bearer ' + settings.apikey;
    }

    fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);

      var aiDiv = null;
      var fullText = '';
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var renderTimer = null;

      function scheduleRender() {
        if (renderTimer) return;
        renderTimer = setTimeout(function () {
          renderTimer = null;
          if (aiDiv) {
            aiDiv.innerHTML = renderMarkdown(fullText);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        }, 80);
      }

      function processChunk(result) {
        if (result.done) {
          if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
          if (!aiDiv) {
            if (thinkingEl.parentNode) messagesEl.removeChild(thinkingEl);
            aiDiv = document.createElement('div');
            aiDiv.className = 'assistant-msg assistant-msg-ai';
            messagesEl.appendChild(aiDiv);
          }
          aiDiv.innerHTML = renderMarkdown(fullText || '(无回复)');
          messagesEl.scrollTop = messagesEl.scrollHeight;
          conversationHistory.push({ role: 'assistant', content: fullText });
          isSending = false;
          sendBtn.disabled = false;
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        lines.forEach(function (line) {
          line = line.trim();
          if (!line) return;

          var token = '';

          if (settings.provider === 'ollama') {
            try {
              var obj = JSON.parse(line);
              if (obj.message && obj.message.content) {
                token = obj.message.content;
              }
            } catch (e) {}
          } else {
            if (line === 'data: [DONE]') return;
            if (line.indexOf('data: ') === 0) {
              try {
                var chunk = JSON.parse(line.substring(6));
                if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
                  token = chunk.choices[0].delta.content;
                }
              } catch (e) {}
            }
          }

          if (token) {
            if (!aiDiv) {
              if (thinkingEl.parentNode) messagesEl.removeChild(thinkingEl);
              aiDiv = document.createElement('div');
              aiDiv.className = 'assistant-msg assistant-msg-ai';
              messagesEl.appendChild(aiDiv);
            }
            fullText += token;
            scheduleRender();
          }
        });

        return reader.read().then(processChunk);
      }

      return reader.read().then(processChunk);
    })
    .catch(function (err) {
      var msg = err.message;
      if (msg === 'Failed to fetch' && window.location.protocol === 'file:') {
        msg = '无法连接。从 file:// 协议访问时浏览器可能阻止跨域请求。\n建议：使用 python3 -m http.server 启动本地服务器。\nOllama 用户：确认已设置 OLLAMA_ORIGINS=*';
      }
      if (thinkingEl.parentNode) messagesEl.removeChild(thinkingEl);
      var errDiv = appendMessage('ai', '错误: ' + msg);
      errDiv.style.color = '#dc2626';
      isSending = false;
      sendBtn.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(); }
  });
})();

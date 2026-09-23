/** Safe Markdown + math for article-assistant. No raw HTML or remote images.
 * markdown-it owns Markdown parsing; math rules run only outside code tokens.
 * Formula source lives in escaped text, never in an HTML attribute.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./vendor/markdown-it-14.1.0/markdown-it.min.js'));
  } else {
    root.AssistantMarkdown = factory(root.markdownit);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (MarkdownIt) {
  'use strict';
  var md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  var escape = md.utils.escapeHtml;

  function escapedAt(text, pos) {
    var slashes = 0;
    while (pos > 0 && text.charAt(--pos) === '\\') slashes++;
    return slashes % 2 === 1;
  }

  function delimiterAt(text, pos) {
    var pair = text.slice(pos, pos + 2);
    if (pair === '\\[') return { open: pair, close: '\\]', display: true };
    if (pair === '\\(') return { open: pair, close: '\\)', display: false };
    if (pair === '$$') return { open: pair, close: pair, display: true };
    if (text[pos] === '$' && !/[\s$]/.test(text[pos + 1] || ' ') &&
        !/[\w$]/.test(text[pos - 1] || ' ')) {
      return { open: '$', close: '$', display: false };
    }
    return null;
  }

  function closingAt(text, start, delimiter) {
    var pos = start;
    while ((pos = text.indexOf(delimiter.close, pos)) !== -1) {
      if (!delimiter.display && text.slice(start, pos).includes('\n')) return -1;
      if (!escapedAt(text, pos) && (delimiter.open !== '$' ||
          (!/\s/.test(text[pos - 1]) && text[pos + 1] !== '$' && !/\d/.test(text[pos + 1] || '')))) return pos;
      pos += delimiter.close.length;
    }
    return -1;
  }

  function mathInline(state, silent) {
    var start = state.pos;
    var delimiter = delimiterAt(state.src, start);
    if (!delimiter) return false;
    var end = closingAt(state.src, start + delimiter.open.length, delimiter);
    // Preserve unfinished formula source, not partially parsed TeX/Markdown. Currency
    // without a valid closing dollar is ordinary prose, not an unfinished formula.
    if (end < 0) {
      if (delimiter.open === '$' && /\d/.test(state.src[start + 1])) return false;
      if (!silent) state.pending += state.src.slice(start);
      state.pos = state.src.length;
      return true;
    }
    if (!silent) {
      var token = state.push('assistant_math', '', 0);
      token.content = state.src.slice(start, end + delimiter.close.length);
      token.meta = { display: delimiter.display };
    }
    state.pos = end + delimiter.close.length;
    return true;
  }

  function mathBlock(state, startLine, endLine, silent) {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    var start = state.bMarks[startLine] + state.tShift[startLine];
    var delimiter = delimiterAt(state.src, start);
    if (!delimiter || !delimiter.display) return false;
    // getLines removes list/blockquote indentation; never consume beyond this container.
    for (var next = startLine; next < endLine; next++) {
      if (next > startLine && state.sCount[next] < state.blkIndent && !state.isEmpty(next)) break;
      if (!state.src.slice(state.bMarks[next], state.eMarks[next]).includes(delimiter.close)) continue;
      var source = state.getLines(startLine, next + 1, state.blkIndent, false).trim();
      var end = closingAt(source, delimiter.open.length, delimiter);
      if (end < 0) continue;
      if (source.slice(end + delimiter.close.length).trim()) return false;
      if (silent) return true;
      var token = state.push('assistant_math', '', 0);
      token.block = true;
      token.content = source;
      token.meta = { display: true };
      token.map = [startLine, next + 1];
      state.line = next + 1;
      return true;
    }
    return false;
  }

  md.inline.ruler.before('escape', 'assistant_math', mathInline);
  md.block.ruler.before('fence', 'assistant_math', mathBlock, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.renderer.rules.assistant_math = function (tokens, idx) {
    var token = tokens[idx];
    var tag = token.block ? 'div' : 'span';
    return '<' + tag + ' class="assistant-math-' + (token.meta.display ? 'display' : 'inline') +
      '" data-assistant-math="' + (token.meta.display ? 'display' : 'inline') + '">' +
      escape(token.content) + '</' + tag + '>' + (token.block ? '\n' : '');
  };
  // Suppress even data: images. Alt text remains readable, with no automatic requests.
  md.renderer.rules.image = function (tokens, idx) {
    return '<span class="assistant-image-alt">[图片：' + escape(tokens[idx].content) + ']</span>';
  };
  md.renderer.rules.table_open = function () { return '<div class="assistant-table-scroll" tabindex="0" role="region" aria-label="表格"><table class="md-table">\n'; };
  md.renderer.rules.table_close = function () { return '</table></div>\n'; };
  var linkOpen = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrSet('rel', 'noopener noreferrer');
    return linkOpen(tokens, idx, options, env, self);
  };

  function renderMath(element, katex) {
    if (!katex || typeof katex.render !== 'function') return;
    element.querySelectorAll('[data-assistant-math]').forEach(function (node) {
      var original = node.textContent;
      var delimiter = delimiterAt(original, 0);
      if (!delimiter) return;
      try {
        katex.render(original.slice(delimiter.open.length, -delimiter.close.length).trim(), node, {
          displayMode: delimiter.display, throwOnError: true, trust: false,
          strict: 'ignore', maxExpand: 1000, maxSize: 20
        });
        node.removeAttribute('data-assistant-math');
      } catch (error) {
        node.textContent = original;
        node.classList.add('assistant-math-error');
      }
    });
  }

  return { render: function (text) { return md.render(String(text)); }, renderMath: renderMath };
});

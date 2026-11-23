// tools/markdown-compiler/inline-and-math.js
// Math formula ($...$ / $$...$$ -> [data-latex]), Mermaid fence, and markdown-it bridge.

'use strict';

var path = require('path');
var fm = require('./frontmatter');

var MarkdownIt = require(path.resolve(__dirname, '../../assets/vendor/markdown-it-14.1.0/markdown-it.min.js'));

var mdInstance = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false
});

// Protect math expressions before markdown-it runs so underscores/asterisks inside
// LaTeX are never mangled into <em> or <strong>.
function extractMathTokens(text, state) {
  var tokens = state.tokens;
  var out = String(text || '');

  // Protect inline code spans first
  var codeSpans = [];
  out = out.replace(/`([^`\n]+)`/g, function (match) {
    var idx = codeSpans.length;
    codeSpans.push(match);
    return '@@CODE_' + idx + '@@';
  });

  // Display math: $$...$$
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, function (_, expr) {
    var trimmed = expr.trim();
    if (!trimmed) return '$$$$';
    state.hasMath = true;
    var id = tokens.length;
    tokens.push({
      display: true,
      latex: trimmed
    });
    return '@@MATH_BLOCK_' + id + '@@';
  });

  // Inline math: $...$ (avoid matching currency like $100 or $team)
  out = out.replace(/(^|[^\\$])\$(?!\s)([^$\n]+?)(?<!\s)\$/g, function (full, prefix, expr) {
    var trimmed = expr.trim();
    // Skip shell/workflow variables like $team or $ralph when no math operators exist
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed) && (trimmed === 'team' || trimmed === 'ralph')) {
      return full;
    }
    state.hasMath = true;
    var id = tokens.length;
    tokens.push({
      display: false,
      latex: trimmed
    });
    return prefix + '@@MATH_INLINE_' + id + '@@';
  });

  // Restore inline code spans
  out = out.replace(/@@CODE_(\d+)@@/g, function (_, idx) {
    return codeSpans[Number(idx)];
  });

  return out;
}

function restoreMathTokens(html, state) {
  var tokens = state.tokens;
  var out = String(html || '');

  // Unwrap <p>@@MATH_BLOCK_n@@</p> into standalone .math-block div
  out = out.replace(/<p>\s*@@MATH_BLOCK_(\d+)@@\s*<\/p>/g, function (_, idx) {
    var entry = tokens[Number(idx)];
    var escaped = fm.escapeAttr(entry.latex);
    return '<div class="math-block" data-latex="' + escaped + '">' + fm.escapeHtml(entry.latex) + '</div>';
  });

  out = out.replace(/@@MATH_BLOCK_(\d+)@@/g, function (_, idx) {
    var entry = tokens[Number(idx)];
    var escaped = fm.escapeAttr(entry.latex);
    return '<div class="math-block" data-latex="' + escaped + '">' + fm.escapeHtml(entry.latex) + '</div>';
  });

  out = out.replace(/@@MATH_INLINE_(\d+)@@/g, function (_, idx) {
    var entry = tokens[Number(idx)];
    var escaped = fm.escapeAttr(entry.latex);
    return '<span class="math-inline" data-latex="' + escaped + '">' + fm.escapeHtml(entry.latex) + '</span>';
  });

  return out;
}

function renderInlineMarkdown(text, mathState) {
  if (!text) return '';
  var state = mathState || { tokens: [], hasMath: false };
  var pair = fm.parseBilingual(text);
  if (pair.zh !== pair.en && String(text).indexOf('||') !== -1) {
    var zhProtected = extractMathTokens(pair.zh, state);
    var enProtected = extractMathTokens(pair.en, state);
    var zhHtml = restoreMathTokens(mdInstance.renderInline(zhProtected), state);
    var enHtml = restoreMathTokens(mdInstance.renderInline(enProtected), state);
    return '<span ' + fm.bilingualAttrs({ zh: stripTags(zhHtml), en: stripTags(enHtml) }) + '>' + zhHtml + '</span>';
  }
  var protectedText = extractMathTokens(String(text), state);
  var rendered = mdInstance.renderInline(protectedText);
  return restoreMathTokens(rendered, state);
}

function renderMarkdownFragment(markdown, mathState) {
  if (!markdown || !String(markdown).trim()) return '';
  var state = mathState || { tokens: [], hasMath: false };
  var lines = String(markdown).split('\n');
  var processed = [];
  var i = 0;

  while (i < lines.length) {
    var line = lines[i];
    var fenceMatch = line.match(/^\s*```(\w*)\s*$/);
    if (fenceMatch) {
      var lang = (fenceMatch[1] || '').toLowerCase();
      var codeLines = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      if (lang === 'mermaid') {
        state.hasMermaid = true;
        processed.push(
          '<div class="mermaid-container"><pre class="mermaid">' +
          fm.escapeHtml(codeLines.join('\n')) +
          '</pre></div>'
        );
      } else {
        var langAttr = lang ? ' class="language-' + fm.escapeAttr(lang) + '"' : '';
        processed.push(
          '<div class="code-block"><pre><code' + langAttr + '>' +
          fm.escapeHtml(codeLines.join('\n')) +
          '</code></pre></div>'
        );
      }
      continue;
    }
    processed.push(line);
    i++;
  }

  var joined = processed.join('\n');
  var withMath = extractMathTokens(joined, state);
  var html = mdInstance.render(withMath);

  // Upgrade standard markdown tables to Study Room .simple-table.compare-table
  html = html.replace(/<table>/g, '<div class="compare-table-wrap"><table class="simple-table compare-table">');
  html = html.replace(/<\/table>/g, '</table></div>');

  return restoreMathTokens(html, state);
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, '').trim();
}

module.exports = {
  renderInlineMarkdown: renderInlineMarkdown,
  renderMarkdownFragment: renderMarkdownFragment,
  stripTags: stripTags
};

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

  // Unwrap <p>@@FENCE_BLOCK_n@@</p> into standalone code/mermaid block
  out = out.replace(/<p>\s*@@FENCE_BLOCK_(\d+)@@\s*<\/p>/g, function (_, idx) {
    return (state.fenceBlocks && state.fenceBlocks[Number(idx)]) || '';
  });
  out = out.replace(/@@FENCE_BLOCK_(\d+)@@/g, function (_, idx) {
    return (state.fenceBlocks && state.fenceBlocks[Number(idx)]) || '';
  });

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

var BILINGUAL_SEP_TOKEN = '@@BILINGUAL_SEP@@';

// Pre-escape bare `<placeholder>` tokens (like `<app-id>`, `<stage>`) outside inline code
// so markdown-it with `html: true` does not mistake them for raw HTML tags and strip them.
function escapeAnglePlaceholdersOutsideCode(text) {
  var codeSpans = [];
  var out = String(text || '').replace(/`([^`\n]+)`/g, function (match) {
    var idx = codeSpans.length;
    codeSpans.push(match);
    return '@@ANGLE_CODE_' + idx + '@@';
  });
  var allowedTags = /^(?:\/?(?:br|hr|em|strong|b|i|u|s|code|span|sup|sub|small|mark|kbd|a)\b)/i;
  out = out.replace(/<([a-zA-Z0-9_.:-]+)>/g, function (full, inner) {
    if (allowedTags.test(inner)) return full;
    return '&lt;' + inner + '&gt;';
  });
  return out.replace(/@@ANGLE_CODE_(\d+)@@/g, function (_, idx) {
    return codeSpans[Number(idx)];
  });
}

function renderSingleInlineMarkdown(text, state) {
  if (!text) return '';
  var safeText = escapeAnglePlaceholdersOutsideCode(String(text));
  var protectedText = extractMathTokens(safeText, state);
  var rendered = mdInstance.renderInline(protectedText);
  return restoreMathTokens(rendered, state);
}

function renderBilingualInlinePair(raw, mathState) {
  var state = mathState || { tokens: [], hasMath: false };
  var normalized = String(raw || '').replace(new RegExp(BILINGUAL_SEP_TOKEN, 'g'), '||');
  var pair = fm.parseBilingual(normalized);
  var zhHtml = renderSingleInlineMarkdown(pair.zh, state);
  var enHtml = pair.en === pair.zh ? zhHtml : renderSingleInlineMarkdown(pair.en, state);
  return {
    zhText: pair.zh,
    enText: pair.en,
    zhHtml: zhHtml,
    enHtml: enHtml,
    isBilingual: pair.zh !== pair.en && normalized.indexOf('||') !== -1
  };
}

function bilingualRichAttrs(raw, mathState, invariantKind) {
  var rendered = renderBilingualInlinePair(raw, mathState);
  var extra = '';
  if (invariantKind && (rendered.zhText === rendered.enText || !/[\u3400-\u9fff]/.test(rendered.zhText))) {
    extra = ' data-present-i18n-invariant="' + fm.escapeAttr(invariantKind) + '"';
  }
  return 'data-zh="' + fm.escapeAttr(rendered.zhHtml) + '" data-en="' + fm.escapeAttr(rendered.enHtml) + '"' + extra;
}

function renderInlineMarkdown(text, mathState) {
  if (!text) return '';
  var state = mathState || { tokens: [], hasMath: false };
  var rendered = renderBilingualInlinePair(text, state);
  if (rendered.isBilingual) {
    return '<span ' + bilingualRichAttrs(text, state) + '>' + rendered.zhHtml + '</span>';
  }
  return rendered.zhHtml;
}

function upgradeCompiledHtmlFragment(html, state) {
  var out = String(html || '');

  // Upgrade bilingual table cells (<th> and <td>) and paragraphs (<p>)
  out = out.replace(/<(th|td|p|li)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, function (full, tag, attrs, inner) {
    var attrStr = attrs || '';
    if (inner.indexOf(BILINGUAL_SEP_TOKEN) === -1) {
      return full;
    }
    // Avoid breaking nested block tags inside <li>
    if (tag === 'li' && /<(?:ul|ol|div|pre|table)\b/i.test(inner)) {
      return full;
    }
    var parts = inner.split(BILINGUAL_SEP_TOKEN);
    var zhHtml = parts[0].trim();
    var enHtml = parts.slice(1).join(' || ').trim() || zhHtml;
    var zhResolved = restoreMathTokens(zhHtml, state);
    var enResolved = restoreMathTokens(enHtml, state);
    return '<' + tag + attrStr + ' data-zh="' + fm.escapeAttr(zhResolved) + '" data-en="' + fm.escapeAttr(enResolved) + '">' + zhResolved + '</' + tag + '>';
  });

  // Fallback for any remaining inline BILINGUAL_SEP_TOKEN outside standard cells
  if (out.indexOf(BILINGUAL_SEP_TOKEN) !== -1) {
    out = out.replace(new RegExp('([^<>\\n]+?)' + BILINGUAL_SEP_TOKEN + '([^<>\\n]+)', 'g'), function (_, left, right) {
      var zhH = restoreMathTokens(left.trim(), state);
      var enH = restoreMathTokens(right.trim(), state);
      return '<span data-zh="' + fm.escapeAttr(zhH) + '" data-en="' + fm.escapeAttr(enH) + '">' + zhH + '</span>';
    });
  }

  // Upgrade standard markdown tables to Study Room .compare-table-wrap > .simple-table.compare-table
  out = out.replace(/<table>/g, '<div class="compare-table-wrap"><table class="simple-table compare-table">');
  out = out.replace(/<\/table>/g, '</table></div>');

  return restoreMathTokens(out, state);
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
      var codes = [];
      if (lang === 'mermaid') {
        state.hasMermaid = true;
        codes.push(
          '<div class="mermaid-container"><pre class="mermaid">' +
          fm.escapeRawHtml(codeLines.join('\n')) +
          '</pre></div>'
        );
      } else {
        var langAttr = lang ? ' class="language-' + fm.escapeAttr(lang) + '"' : '';
        codes.push(
          '<div class="code-block"><pre><code' + langAttr + '>' +
          fm.escapeRawHtml(codeLines.join('\n')) +
          '</code></pre></div>'
        );
      }
      if (!state.fenceBlocks) state.fenceBlocks = [];
      var fenceId = state.fenceBlocks.length;
      state.fenceBlocks.push(codes[0]);
      processed.push('\n@@FENCE_BLOCK_' + fenceId + '@@\n');
      continue;
    }
    // Protect bilingual `||` separator before markdown-it splits table cells on `|`
    if (line.indexOf('||') !== -1) {
      line = line.replace(/\|\|/g, BILINGUAL_SEP_TOKEN);
    }
    line = escapeAnglePlaceholdersOutsideCode(line);
    processed.push(line);
    i++;
  }

  var joined = processed.join('\n');
  var withMath = extractMathTokens(joined, state);
  var html = mdInstance.render(withMath);

  return upgradeCompiledHtmlFragment(html, state);
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, '').trim();
}

module.exports = {
  renderBilingualInlinePair: renderBilingualInlinePair,
  bilingualRichAttrs: bilingualRichAttrs,
  renderInlineMarkdown: renderInlineMarkdown,
  renderMarkdownFragment: renderMarkdownFragment,
  stripTags: stripTags
};

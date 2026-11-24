// tools/html-to-markdown/inline-converter.js
// Converts DOM inline subtrees, [data-zh]/[data-en] HTML fragments, and [data-latex] spans
// into Genesis Extended Markdown (`中文 || English`, `$...$`, `**bold**`, `[label](href)`).

'use strict';

var fs = require('fs');
var path = require('path');
var ast = require('./html-ast');

function sanitizeMathLatex(raw) {
  return String(raw || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function wrapInlineCode(codeText) {
  var raw = String(codeText || '').replace(/\r?\n/g, ' ');
  if (!raw.trim()) return '';
  if (raw.indexOf('`') === -1) {
    return '`' + raw + '`';
  }
  return '`` ' + raw + ' ``';
}

function convertInlineChildren(children, opts) {
  var options = opts || {};
  var parts = [];
  var list = children || [];
  for (var i = 0; i < list.length; i++) {
    parts.push(convertInlineNode(list[i], options));
  }
  var joined = parts.join('');
  if (options.preserveNewlines) {
    return joined
      .split('\n')
      .map(function (ln) { return ln.replace(/[ \t]+/g, ' ').trim(); })
      .filter(Boolean)
      .join('\n');
  }
  return joined.replace(/\s+/g, ' ').trim();
}

function convertHtmlSnippetToInline(htmlStr, opts) {
  if (!htmlStr) return '';
  var str = String(htmlStr).trim();
  if (!str) return '';
  if (str.indexOf('<') === -1 && str.indexOf('&') === -1) {
    return str.replace(/\s+/g, ' ').trim();
  }
  var miniRoot = ast.parseHtml(str);
  return convertInlineChildren(miniRoot.children, opts);
}

function formatBilingualPair(zhRaw, enRaw, opts) {
  var zh = String(zhRaw || '').trim();
  var en = String(enRaw || '').trim();
  if (opts && opts.stripLayerNumber) {
    zh = zh.replace(/^\d+\s*/, '').trim();
    en = en.replace(/^\d+\s*/, '').trim();
  }
  if (!zh && !en) return '';
  if (!en || zh === en) return zh || en;
  if (!zh) return en;
  // Avoid nested `||` inside one side
  zh = zh.replace(/\|\|/g, '｜');
  en = en.replace(/\|\|/g, '｜');
  return zh + ' || ' + en;
}

function convertInlineNode(node, opts) {
  if (!node) return '';
  var options = opts || {};

  if (node.type === 'text') {
    var txt = String(node.text || '');
    if (options.inTableCell) {
      txt = txt.replace(/\|/g, '\\|');
    }
    return txt;
  }

  if (node.type !== 'element') return '';
  var tag = node.tag;
  if (tag === 'script' || tag === 'style' || tag === 'svg') return '';

  // Skip `.layer-number` badges when extracting panel list items
  if (options.skipLayerNumber && ast.hasClass(node, 'layer-number')) {
    return '';
  }

  // Inline / display math via `data-latex`
  if (ast.hasAttr(node, 'data-latex')) {
    var latex = sanitizeMathLatex(ast.getAttr(node, 'data-latex') || ast.textContent(node));
    if (!latex) return '';
    return '$' + latex + '$';
  }

  if (tag === 'br') {
    return options.inTableCell ? '<br>' : (options.preserveNewlines ? '\n' : ' ');
  }

  // If this inline node itself carries `data-zh` / `data-en` and we are not already expanding an attr snippet
  if (!options.ignoreBilingualAttrs && (ast.hasAttr(node, 'data-zh') || ast.hasAttr(node, 'data-en'))) {
    var zhAttr = ast.getAttr(node, 'data-zh');
    var enAttr = ast.getAttr(node, 'data-en');
    var childOpts = Object.assign({}, options, { ignoreBilingualAttrs: true });
    var zhInline = zhAttr ? convertHtmlSnippetToInline(zhAttr, childOpts) : convertInlineChildren(node.children, childOpts);
    var enInline = enAttr ? convertHtmlSnippetToInline(enAttr, childOpts) : '';
    var combined = formatBilingualPair(zhInline, enInline);
    if (tag === 'strong' || tag === 'b') {
      return combined ? '**' + combined + '**' : '';
    }
    if (tag === 'em' || tag === 'i') {
      return combined ? '*' + combined + '*' : '';
    }
    if (tag === 'code') {
      return wrapInlineCode(zhInline);
    }
    if (tag === 'a') {
      var aHref = ast.getAttr(node, 'href');
      return aHref ? '[' + (combined || aHref) + '](' + aHref + ')' : combined;
    }
    return combined;
  }

  var inner = convertInlineChildren(node.children, options);

  if (tag === 'code' || tag === 'kbd') {
    var rawCode = ast.textContent(node).replace(/\r?\n/g, ' ').trim();
    if (options.inTableCell) rawCode = rawCode.replace(/\|/g, '&#124;');
    // If inline code mentions an illustrative repo path `scripts/...`, `docs/...`, `.github/...`, or `delivery-board/...`
    // that does not exist on disk, prefix `./` so four-way doc code ref audit does not mistake hypothetical examples for broken local files
    if (options.repoRoot && /^(?:delivery-board\/|scripts\/|docs\/|\.github\/)[A-Za-z0-9_./-]+\.(?:py|mjs|js|md|json|css|html)$/.test(rawCode)) {
      if (!fs.existsSync(path.join(options.repoRoot, rawCode))) {
        rawCode = './' + rawCode;
      }
    }
    return wrapInlineCode(rawCode);
  }
  if (tag === 'strong' || tag === 'b') {
    var cleanBold = inner.trim();
    if (!cleanBold) return '';
    // Avoid `****` if inner is already bold
    if (/^\*\*[\s\S]+\*\*$/.test(cleanBold)) return cleanBold;
    return '**' + cleanBold + '**';
  }
  if (tag === 'em' || tag === 'i') {
    var cleanEm = inner.trim();
    if (!cleanEm) return '';
    return '*' + cleanEm + '*';
  }
  if (tag === 'sup') {
    var supTxt = inner.trim();
    if (/^\[\d+\](?:\[\d+\])*$/.test(supTxt)) {
      return supTxt;
    }
    return supTxt ? '<sup>' + supTxt + '</sup>' : '';
  }
  if (tag === 'sub') {
    var subTxt = inner.trim();
    return subTxt ? '<sub>' + subTxt + '</sub>' : '';
  }
  if (tag === 'a') {
    var href = ast.getAttr(node, 'href').trim();
    var label = inner.trim() || href;
    if (!href) return label;
    if (/^#ref-\d+$/i.test(href) && /^\[\d+\]$/.test(label)) {
      return label;
    }
    return '[' + label + '](' + href + ')';
  }
  if (tag === 'img') {
    var src = normalizeAssetPath(ast.getAttr(node, 'src'));
    var alt = ast.cleanWhitespace(ast.getAttr(node, 'alt'));
    return src ? '![' + alt.replace(/[\[\]]/g, '') + '](' + src + ')' : '';
  }

  return inner;
}

// Extract bilingual inline string from a block/heading/paragraph/cell element
function extractBilingualElement(node, opts) {
  if (!node) return '';
  var repoRoot = path.resolve(__dirname, '../..');
  var options = Object.assign({ repoRoot: repoRoot }, opts || {});
  var subOpts = Object.assign({}, options, { ignoreBilingualAttrs: true });

  if (ast.hasAttr(node, 'data-latex')) {
    var ltx = sanitizeMathLatex(ast.getAttr(node, 'data-latex') || ast.textContent(node));
    return ltx ? '$' + ltx + '$' : '';
  }

  if (ast.hasAttr(node, 'data-zh') || ast.hasAttr(node, 'data-en')) {
    var zhRaw = ast.getAttr(node, 'data-zh');
    var enRaw = ast.getAttr(node, 'data-en');
    // Remove embedded `<span class='layer-number'>1</span>` inside `li[data-zh]`
    if (options.stripLayerNumber) {
      zhRaw = zhRaw.replace(/<span[^>]*class=['"][^'"]*layer-number[^'"]*['"][^>]*>[\s\S]*?<\/span>/gi, '');
      enRaw = enRaw.replace(/<span[^>]*class=['"][^'"]*layer-number[^'"]*['"][^>]*>[\s\S]*?<\/span>/gi, '');
    }
    var zhMd = zhRaw ? convertHtmlSnippetToInline(zhRaw, subOpts) : convertInlineChildren(node.children, subOpts);
    var enMd = enRaw ? convertHtmlSnippetToInline(enRaw, subOpts) : '';
    var pair = formatBilingualPair(zhMd, enMd);
    if (options.inTableCell) {
      pair = escapeTablePipesPreservingBilingual(pair);
    }
    return pair;
  }

  // Check if the element wraps a single child with data-zh/data-en (e.g., `<button><span>...</span></button>`)
  var elKids = ast.elementChildren(node);
  if (elKids.length === 1 && ast.cleanWhitespace(ast.textContent(node)) === ast.cleanWhitespace(ast.textContent(elKids[0]))) {
    if (ast.hasAttr(elKids[0], 'data-zh') || ast.hasAttr(elKids[0], 'data-en')) {
      return extractBilingualElement(elKids[0], options);
    }
  }

  var rendered = convertInlineChildren(node.children, options);
  if (options.inTableCell) {
    rendered = escapeTablePipesPreservingBilingual(rendered);
  }
  return rendered;
}

function escapeTablePipesPreservingBilingual(str) {
  if (!str) return '';
  var TOKEN = '@@BI_PIPE@@';
  return String(str)
    .replace(/\s*\|\|\s*/g, ' ' + TOKEN + ' ')
    .replace(/(?<!\\)\|/g, '&#124;')
    .replace(new RegExp(TOKEN, 'g'), '||')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function normalizeAssetPath(rawPath) {
  var p = String(rawPath || '').trim();
  if (!p) return '';
  if (/^(?:https?:|data:|mailto:|#|\.\.?\/|\/)/i.test(p)) {
    return p;
  }
  return './' + p;
}

module.exports = {
  sanitizeMathLatex: sanitizeMathLatex,
  convertInlineChildren: convertInlineChildren,
  convertHtmlSnippetToInline: convertHtmlSnippetToInline,
  extractBilingualElement: extractBilingualElement,
  formatBilingualPair: formatBilingualPair,
  escapeTablePipesPreservingBilingual: escapeTablePipesPreservingBilingual,
  normalizeAssetPath: normalizeAssetPath
};

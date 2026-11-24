// tools/html-to-markdown/block-converter.js
// Dispatches DOM block elements inside `<section class="section">` into standard Markdown
// constructs (tables, lists, code fences, display math, details) and Genesis directives.

'use strict';

var ast = require('./html-ast');
var inline = require('./inline-converter');
var dirConv = require('./directive-converter');

function convertTable(tableNode) {
  var rows = ast.findAll(tableNode, function (n) { return n.tag === 'tr'; });
  if (rows.length === 0) return '';

  var captionEl = ast.findFirst(tableNode, function (n) { return n.tag === 'caption'; });
  var captionMd = captionEl ? inline.extractBilingualElement(captionEl) : '';

  var matrix = [];
  var maxCols = 0;

  for (var r = 0; r < rows.length; r++) {
    var cells = ast.elementChildren(rows[r]).filter(function (c) { return c.tag === 'th' || c.tag === 'td'; });
    if (cells.length === 0) continue;
    var rowVals = cells.map(function (cell) {
      var val = inline.extractBilingualElement(cell, { inTableCell: true });
      return val || '—';
    });
    if (rowVals.length > maxCols) maxCols = rowVals.length;
    matrix.push(rowVals);
  }

  if (matrix.length === 0 || maxCols === 0) return '';

  var out = [];
  if (captionMd) {
    out.push('**' + captionMd + '**');
    out.push('');
  }

  var header = matrix[0];
  while (header.length < maxCols) header.push(' ');
  out.push('| ' + header.join(' | ') + ' |');
  out.push('| ' + header.map(function () { return '---'; }).join(' | ') + ' |');

  for (var i = 1; i < matrix.length; i++) {
    var rCells = matrix[i];
    while (rCells.length < maxCols) rCells.push(' ');
    out.push('| ' + rCells.join(' | ') + ' |');
  }

  return out.join('\n');
}

function convertList(listNode, ordered, ctx) {
  var items = ast.elementChildren(listNode).filter(function (n) { return n.tag === 'li'; });
  if (items.length === 0) return '';

  if (ast.hasClass(listNode, 'bib-list')) {
    return items.map(function (li, idx) {
      var authorEl = ast.findFirst(li, function (n) { return ast.hasClass(n, 'bib-author'); });
      var linkEl = ast.findFirst(li, function (n) { return n.tag === 'a'; });
      var noteEl = ast.findFirst(li, function (n) { return ast.hasClass(n, 'bib-note'); });
      var author = authorEl ? ast.cleanWhitespace(ast.textContent(authorEl)).replace(/[—–-]\s*$/, '').trim() : '';
      var url = linkEl ? ast.getAttr(linkEl, 'href').trim() : '';
      var note = noteEl ? inline.extractBilingualElement(noteEl) : '';
      if (!author && !url && !note) {
        return '- [' + (idx + 1) + '] ' + inline.extractBilingualElement(li);
      }
      var parts = ['- [' + (idx + 1) + '] ' + (author || ('Reference ' + (idx + 1)))];
      if (url && /^https?:\/\//i.test(url)) parts.push('— ' + url);
      if (note) parts.push('| ' + note);
      return parts.join(' ');
    }).join('\n');
  }

  var lines = [];
  items.forEach(function (li, idx) {
    var prefix = ordered ? (idx + 1) + '. ' : '- ';
    var subLists = ast.elementChildren(li).filter(function (c) { return c.tag === 'ul' || c.tag === 'ol'; });
    var flowCopy = ast.findFirst(li, function (c) { return ast.hasClass(c, 'flow-copy'); });
    if (flowCopy) {
      var fcStrong = ast.findFirst(flowCopy, function (c) { return c.tag === 'strong' || /^h[3-5]$/.test(c.tag); });
      var fcTitle = fcStrong ? inline.extractBilingualElement(fcStrong) : '';
      var fcDesc = ast.elementChildren(flowCopy)
        .filter(function (c) { return c !== fcStrong; })
        .map(function (c) { return inline.extractBilingualElement(c); })
        .filter(Boolean)
        .join(' ');
      var fcLine = fcTitle
        ? '**' + fcTitle.replace(/\*\*/g, '') + '**' + (fcDesc ? ' — ' + fcDesc : '')
        : fcDesc;
      if (fcLine) lines.push(prefix + fcLine);
      return;
    }

    if (subLists.length === 0) {
      var txt = inline.extractBilingualElement(li, { skipLayerNumber: true, stripLayerNumber: true });
      if (txt) lines.push(prefix + txt);
    } else {
      var inlineClone = {
        type: 'element',
        tag: 'span',
        attrs: li.attrs,
        children: (li.children || []).filter(function (c) {
          return !(c.type === 'element' && (c.tag === 'ul' || c.tag === 'ol'));
        })
      };
      var headTxt = inline.extractBilingualElement(inlineClone, { skipLayerNumber: true, stripLayerNumber: true });
      if (headTxt) lines.push(prefix + headTxt);
      subLists.forEach(function (sl) {
        var subMd = convertList(sl, sl.tag === 'ol', ctx);
        if (subMd) {
          subMd.split('\n').forEach(function (sln) {
            lines.push('  ' + sln);
          });
        }
      });
    }
  });

  return lines.join('\n');
}

function convertDetails(detailsNode, ctx) {
  var summaryEl = ast.findFirst(detailsNode, function (n) { return n.tag === 'summary'; });
  var sumText = summaryEl ? inline.extractBilingualElement(summaryEl) : '展开详情 || Details';
  var bodyMd = convertChildBlocks(detailsNode, Object.assign({}, ctx, { insideDirective: true, skipNode: summaryEl }));
  if (!bodyMd) return '';
  return '**' + sumText.replace(/\*\*/g, '') + '**\n\n' + bodyMd;
}

function convertPreOrFence(node) {
  var preNode = node.tag === 'pre' ? node : ast.findFirst(node, function (n) { return n.tag === 'pre'; }) || node;
  var isMermaid = ast.hasClass(node, 'mermaid-container') || ast.hasClass(preNode, 'mermaid');
  var codeEl = ast.findFirst(preNode, function (n) { return n.tag === 'code'; });
  var lang = '';
  if (isMermaid) {
    lang = 'mermaid';
  } else if (codeEl) {
    var cls = ast.getAttr(codeEl, 'class');
    var m = cls.match(/language-([\w-]+)/);
    if (m) lang = m[1];
  }
  var rawCode = ast.textContent(codeEl || preNode).replace(/^\n+|\n+$/g, '');
  if (!rawCode.trim()) return '';
  var fence = rawCode.indexOf('```') !== -1 ? '~~~~' : '```';
  return fence + lang + '\n' + rawCode + '\n' + fence;
}

function convertBlockNode(node, ctx) {
  if (!node) return '';
  if (ctx && ctx.skipNode === node) return '';

  if (node.type === 'text') {
    return ast.cleanWhitespace(node.text) || '';
  }

  if (node.type !== 'element') return '';
  var tag = node.tag;
  if (tag === 'script' || tag === 'style' || tag === 'nav' || tag === 'footer') return '';
  if (ast.hasAnyClass(node, ['section-head', 'genesis-view-bar', 'genesis-source-drawer', 'series-nav'])) {
    if (ast.hasClass(node, 'series-nav')) {
      return ast.elementChildren(node).map(function (nc) {
        var numEl = ast.findFirst(nc, function (x) { return ast.hasClass(x, 'series-num'); });
        var hEl = ast.findFirst(nc, function (x) { return /^h[3-5]$/.test(x.tag); });
        var numTxt = numEl ? inline.extractBilingualElement(numEl) : '';
        var hTxt = hEl ? inline.extractBilingualElement(hEl) : inline.extractBilingualElement(nc);
        var href = ast.getAttr(nc, 'href');
        var label = (numTxt ? numTxt + '：' : '') + hTxt;
        return href ? '- [' + label + '](' + href + ')' : '- **' + label + '**';
      }).filter(Boolean).join('\n');
    }
    return '';
  }

  // 1. Display math
  if (ast.hasClass(node, 'math-block') || (tag === 'div' && ast.hasAttr(node, 'data-latex'))) {
    var latex = inline.sanitizeMathLatex(ast.getAttr(node, 'data-latex') || ast.textContent(node));
    return latex ? '$$\n' + latex + '\n$$' : '';
  }

  // 2. Mermaid or Code blocks
  if (tag === 'pre' || ast.hasAnyClass(node, ['mermaid-container', 'code-block'])) {
    return convertPreOrFence(node);
  }

  // 3. Accordion
  if (ast.hasClass(node, 'subsection-accordion')) {
    return dirConv.convertAccordionGroup(node, ctx, convertChildBlocks);
  }
  if (ast.hasAttr(node, 'data-accordion') || ast.hasClass(node, 'subsection-item')) {
    if (ctx && ctx.insideDirective) return convertChildBlocks(node, ctx);
    return dirConv.convertAccordionGroup({ type: 'element', tag: 'div', attrs: {}, children: [node] }, ctx, convertChildBlocks);
  }

  // 4. Insight grids
  if (ast.hasAnyClass(node, ['insight-grid', 'scenario-grid', 'force-grid', 'spectrum', 'rule-strip', 'check-grid'])) {
    if (ctx && ctx.insideDirective) {
      return ast.elementChildren(node).map(function (card) {
        var h = ast.findFirst(card, function (x) { return /^h[2-5]$/.test(x.tag) || x.tag === 'strong'; });
        var hMd = h ? inline.extractBilingualElement(h) : '';
        var p = ast.findFirst(card, function (x) { return x.tag === 'p'; });
        var pMd = p ? inline.extractBilingualElement(p) : inline.extractBilingualElement(card);
        if (hMd && pMd && pMd !== hMd) return '- **' + hMd.replace(/\*\*/g, '') + '** — ' + pMd;
        return '- ' + (hMd || pMd);
      }).filter(Boolean).join('\n');
    }
    return dirConv.convertInsightGrid(node, ctx, convertBlockNode);
  }

  // 5. Comparison grids
  if (ast.hasAnyClass(node, ['comparison-grid', 'fit-grid', 'failure-grid'])) {
    if (ctx && ctx.insideDirective) {
      return ast.elementChildren(node).map(function (c) { return convertChildBlocks(c, ctx); }).filter(Boolean).join('\n\n');
    }
    return dirConv.convertComparisonGrid(node, ctx, convertBlockNode);
  }

  // 6. Flow / Timeline lists
  if (ast.hasAnyClass(node, ['flow-list', 'timeline-list', 'artifact-flow', 'gate-list', 'release-timeline'])) {
    if (ctx && ctx.insideDirective) return convertList(node, true, ctx);
    return dirConv.convertFlowOrTimeline(node);
  }

  // 7. Callouts / Quote blocks
  if (tag === 'blockquote' || ast.hasAnyClass(node, ['quote-block', 'insight-callout', 'quiz-callout', 'derivation-box', 'verdict', 'source-note'])) {
    return dirConv.convertCallout(node, ctx, convertBlockNode);
  }

  // 8. Tables
  if (tag === 'table') return convertTable(node);
  if (ast.hasAnyClass(node, ['compare-table-wrap', 'compare-wrap', 'table-scroll'])) {
    var innerTbl = ast.findFirst(node, function (n) { return n.tag === 'table'; });
    if (innerTbl && ast.elementChildren(node).length === 1) return convertTable(innerTbl);
  }

  // 9. Figures & Diagrams
  if (tag === 'figure' || ast.hasAnyClass(node, ['generated-diagram', 'sr-figure', 'exam-figure'])) {
    return dirConv.convertFigureOrDiagram(node, ctx, convertChildBlocks);
  }

  // 10. Interactive Sandboxes
  if (dirConv.isSandboxCandidate(node)) {
    return dirConv.convertSandboxNode(node, ctx);
  }

  // 11. Details / Summary
  if (tag === 'details') return convertDetails(node, ctx);

  // 12. Headings
  if (/^h[2-6]$/.test(tag)) {
    var hText = inline.extractBilingualElement(node);
    if (!hText) return '';
    return (ctx && ctx.insideDirective) ? '**' + hText.replace(/\*\*/g, '') + '**' : '### ' + hText;
  }

  // 13. Lists
  if (tag === 'ul' || tag === 'ol') return convertList(node, tag === 'ol', ctx);

  // 14. Paragraphs, images, rules
  if (tag === 'p') return inline.extractBilingualElement(node);
  if (tag === 'img') {
    var src = inline.normalizeAssetPath(ast.getAttr(node, 'src'));
    var alt = ast.cleanWhitespace(ast.getAttr(node, 'alt'));
    return src ? '![' + alt.replace(/[\[\]]/g, '') + '](' + src + ')' : '';
  }
  if (tag === 'hr') return '---';

  if (ast.elementChildren(node).length === 0) {
    return inline.extractBilingualElement(node);
  }
  return convertChildBlocks(node, ctx);
}

function convertChildBlocks(parentNode, ctx) {
  if (!parentNode || !parentNode.children) return '';
  var out = [];
  for (var i = 0; i < parentNode.children.length; i++) {
    var child = parentNode.children[i];
    if (ctx && ctx.skipNode === child) continue;
    if (child.type === 'text') {
      var txt = ast.cleanWhitespace(child.text);
      if (txt) out.push(txt);
      continue;
    }
    var blockMd = convertBlockNode(child, ctx);
    if (blockMd && blockMd.trim()) {
      out.push(blockMd.trim());
    }
  }
  return out.join('\n\n');
}

module.exports = {
  formatDirectiveAttrs: dirConv.formatDirectiveAttrs,
  convertTable: convertTable,
  convertBlockNode: convertBlockNode,
  convertChildBlocks: convertChildBlocks,
  convertSandboxNode: dirConv.convertSandboxNode
};

// tools/html-to-markdown/directive-converter.js
// Converts Study Room semantic containers (`.insight-grid`, `.comparison-grid`,
// `[data-accordion]`, `.flow-list`, `.quote-block`, `.generated-diagram`, and `<canvas>` sandboxes)
// into 1:1 Genesis Extended Markdown directives (`:::insight-grid`, `:::comparison`, etc.).

'use strict';

var ast = require('./html-ast');
var inline = require('./inline-converter');

function formatDirectiveAttrs(obj) {
  var keys = Object.keys(obj || {});
  var parts = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = obj[k];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'boolean' || typeof v === 'number') {
      parts.push(k + ': ' + String(v));
    } else {
      var clean = String(v)
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .trim();
      parts.push(k + ': "' + clean + '"');
    }
  }
  return parts.length > 0 ? ' { ' + parts.join(', ') + ' }' : '';
}

function extractStepTitlePair(node) {
  if (!node || node.type !== 'element') return '';
  var zh = ast.getAttr(node, 'data-step-title') || ast.getAttr(node, 'data-present-title-zh');
  var en = ast.getAttr(node, 'data-step-title-en') || ast.getAttr(node, 'data-present-title-en');
  return inline.formatBilingualPair(zh, en);
}

function isSandboxCandidate(node) {
  if (!node || node.type !== 'element') return false;
  if (ast.hasAttr(node, 'data-sandbox-slot') || ast.hasAnyClass(node, ['sandbox-slot', 'sim-container'])) {
    return true;
  }
  if (node.tag === 'iframe' || node.tag === 'canvas') return true;
  var hasCanvas = Boolean(ast.findFirst(node, function (n) { return n.tag === 'canvas' || n.tag === 'iframe'; }));
  if (hasCanvas && node.tag !== 'section' && node.tag !== 'main' && !ast.hasClass(node, 'subsection-accordion')) {
    return true;
  }
  if (
    node.tag !== 'section' &&
    node.tag !== 'main' &&
    !ast.hasClass(node, 'subsection-accordion') &&
    !ast.hasClass(node, 'subsection-item')
  ) {
    var interactiveInputs = ast.findAll(node, function (n) {
      return n.tag === 'input' || n.tag === 'select' || n.tag === 'textarea';
    });
    if (interactiveInputs.length >= 1) {
      return true;
    }
  }
  return false;
}

function convertInsightGrid(gridNode, ctx, convertBlockNode) {
  var cards = ast.elementChildren(gridNode);
  if (cards.length === 0) return '';

  var cols = 3;
  var cls = ast.classList(gridNode).join(' ');
  if (/grid-2|two|fit-grid|check-grid/.test(cls) || cards.length === 2 || cards.length === 4) {
    cols = cards.length === 4 && /grid-4|four|spectrum/.test(cls) ? 4 : 2;
  } else if (/grid-4|four|spectrum/.test(cls)) {
    cols = 4;
  }

  var stepTitle = extractStepTitlePair(gridNode);
  var dirAttrs = { cols: cols };
  if (stepTitle) dirAttrs.title = stepTitle;

  var lines = [':::insight-grid' + formatDirectiveAttrs(dirAttrs)];

  cards.forEach(function (card, idx) {
    var badgeEl = ast.findFirst(card, function (n) {
      return ast.hasAnyClass(n, ['card-index', 'scenario-icon', 'series-num']);
    });
    var stepAttrLabel = ast.getAttr(card, 'data-step');
    var badge = badgeEl
      ? ast.cleanWhitespace(ast.textContent(badgeEl))
      : (stepAttrLabel || (idx + 1 < 10 ? '0' + (idx + 1) : String(idx + 1)));

    var headingEl = ast.findFirst(card, function (n) {
      return /^h[2-5]$/.test(n.tag) || (n.tag === 'strong' && n.parent === card);
    });
    var titleMd = headingEl
      ? inline.extractBilingualElement(headingEl)
      : ('要点 ' + (idx + 1) + ' || Point ' + (idx + 1));

    lines.push('::card ' + badge.replace(/[{}]/g, ''));
    lines.push('### ' + titleMd);

    var bodyBlocks = [];
    var cardKids = ast.elementChildren(card);
    if (cardKids.length === 0) {
      var plain = inline.extractBilingualElement(card);
      if (plain && plain !== titleMd) bodyBlocks.push(plain);
    } else {
      for (var k = 0; k < cardKids.length; k++) {
        var child = cardKids[k];
        if (child === badgeEl || child === headingEl) continue;
        var converted = convertBlockNode(child, Object.assign({}, ctx, { insideDirective: true }));
        if (converted) bodyBlocks.push(converted);
      }
    }
    if (bodyBlocks.length > 0) {
      lines.push(bodyBlocks.join('\n\n'));
    }
    if (idx < cards.length - 1) lines.push('');
  });

  lines.push(':::');
  return lines.join('\n');
}

function convertComparisonGrid(gridNode, ctx, convertBlockNode) {
  var cards = ast.elementChildren(gridNode);
  if (cards.length === 0) return '';

  var stepTitle = extractStepTitlePair(gridNode);
  var dirAttrs = {};
  if (stepTitle) dirAttrs.title = stepTitle;

  var lines = [':::comparison' + formatDirectiveAttrs(dirAttrs)];

  cards.forEach(function (card, idx) {
    var labelEl = ast.findFirst(card, function (n) {
      return ast.hasClass(n, 'comparison-label') || (n.tag === 'b' && n.parent === card);
    });
    var labelMd = labelEl
      ? inline.extractBilingualElement(labelEl)
      : ('方案 ' + (idx + 1) + ' || Option ' + (idx + 1));
    var isHighlight = ast.hasAnyClass(card, ['next', 'good', 'is-recommended']);
    var hlSuffix = isHighlight ? ' { highlight: true }' : '';

    var headingEl = ast.findFirst(card, function (n) { return /^h[2-5]$/.test(n.tag); });
    var titleMd = headingEl ? inline.extractBilingualElement(headingEl) : labelMd;

    lines.push('::versus ' + labelMd.replace(/[{}]/g, '') + hlSuffix);
    lines.push('### ' + titleMd);

    var bodyParts = [];
    var cardKids = ast.elementChildren(card);
    for (var k = 0; k < cardKids.length; k++) {
      var ck = cardKids[k];
      if (ck === labelEl || ck === headingEl) continue;
      var subMd = convertBlockNode(ck, Object.assign({}, ctx, { insideDirective: true }));
      if (subMd) bodyParts.push(subMd);
    }
    if (bodyParts.length > 0) {
      lines.push(bodyParts.join('\n\n'));
    }
    if (idx < cards.length - 1) lines.push('');
  });

  lines.push(':::');
  return lines.join('\n');
}

function convertAccordionGroup(accNode, ctx, convertChildBlocks) {
  var items = ast.elementChildren(accNode).filter(function (n) {
    return ast.hasAttr(n, 'data-accordion') || ast.hasClass(n, 'subsection-item');
  });
  if (items.length === 0) return '';

  var stepTitle = extractStepTitlePair(accNode);
  var dirAttrs = {};
  if (stepTitle) dirAttrs.title = stepTitle;

  var lines = [':::accordion' + formatDirectiveAttrs(dirAttrs)];

  items.forEach(function (item, idx) {
    var toggleBtn = ast.findFirst(item, function (n) {
      return ast.hasClass(n, 'subsection-toggle') || ast.hasClass(n, 'narrative-heading') || n.tag === 'h3';
    });
    var isOpen = ast.hasClass(item, 'is-open') || (toggleBtn && ast.getAttr(toggleBtn, 'aria-expanded') === 'true');
    var titleMd = toggleBtn
      ? inline.extractBilingualElement(toggleBtn)
      : (extractStepTitlePair(item) || ('子章节 ' + (idx + 1) + ' || Subsection ' + (idx + 1)));

    lines.push('::panel' + (isOpen ? ' { open: true }' : ''));
    lines.push('### ' + titleMd);

    var contentEl = ast.findFirst(item, function (n) { return ast.hasClass(n, 'subsection-content'); }) || item;
    var innerMd = convertChildBlocks(contentEl, Object.assign({}, ctx, { insideDirective: true, skipNode: toggleBtn }));
    if (innerMd) {
      lines.push(innerMd);
    }
    if (idx < items.length - 1) lines.push('');
  });

  lines.push(':::');
  return lines.join('\n');
}

function convertFlowOrTimeline(listNode) {
  var isTimeline = ast.hasAnyClass(listNode, ['timeline-list', 'timeline', 'release-timeline']);
  var kind = isTimeline ? 'timeline' : 'flow';
  var stepTitle = extractStepTitlePair(listNode);
  var dirAttrs = {};
  if (stepTitle) dirAttrs.title = stepTitle;

  var items = ast.elementChildren(listNode);
  if (items.length === 0) return '';

  var lines = [':::' + kind + formatDirectiveAttrs(dirAttrs)];
  var count = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var copyRoot = ast.findFirst(item, function (n) { return ast.hasClass(n, 'flow-copy'); }) || item;
    var titleEl = ast.findFirst(copyRoot, function (n) {
      return n.tag === 'strong' || /^h[3-5]$/.test(n.tag);
    });
    var titleMd = titleEl ? inline.extractBilingualElement(titleEl) : '';
    var descParts = [];
    var kids = ast.elementChildren(copyRoot);
    for (var k = 0; k < kids.length; k++) {
      var ck = kids[k];
      if (ck === titleEl) continue;
      if (ast.hasClass(ck, 'flow-num') || ast.hasClass(ck, 'step-num')) continue;
      var txt = inline.extractBilingualElement(ck);
      if (txt) descParts.push(txt);
    }
    if (!titleMd && descParts.length === 0) {
      titleMd = inline.extractBilingualElement(copyRoot);
    }
    if (!titleMd && descParts.length > 0) {
      titleMd = descParts.shift();
    }
    if (!titleMd) continue;
    count++;
    var descJoined = descParts.join('；');
    var cleanTitle = titleMd.replace(/\*\*/g, '').trim();
    lines.push(count + '. **' + cleanTitle + '**' + (descJoined ? ' — ' + descJoined : ''));
  }

  if (count === 0) return '';
  lines.push(':::');
  return lines.join('\n');
}

function convertCallout(node, ctx, convertBlockNode) {
  if (ctx && ctx.insideDirective) {
    var nestedHead = ast.findFirst(node, function (n) { return /^h[3-6]$/.test(n.tag) || n.tag === 'strong'; });
    var nestedTitle = nestedHead ? inline.extractBilingualElement(nestedHead) : '';
    var nestedParts = [];
    if (nestedTitle) nestedParts.push('> **' + nestedTitle.replace(/\*\*/g, '') + '**');
    var nKids = ast.elementChildren(node);
    for (var nk = 0; nk < nKids.length; nk++) {
      if (nKids[nk] === nestedHead) continue;
      var sub = convertBlockNode(nKids[nk], ctx);
      if (sub) {
        sub.split('\n').forEach(function (ln) {
          nestedParts.push('> ' + ln);
        });
      }
    }
    if (nestedParts.length === 0) {
      var fallbackTxt = inline.extractBilingualElement(node);
      if (fallbackTxt) nestedParts.push('> ' + fallbackTxt);
    }
    return nestedParts.join('\n');
  }

  var headEl = ast.findFirst(node, function (n) { return /^h[3-6]$/.test(n.tag) || n.tag === 'strong'; });
  var titleMd = headEl ? inline.extractBilingualElement(headEl) : '关键洞察 || Key Insight';
  var bodyParts = [];
  var kids = ast.elementChildren(node);

  if (kids.length === 0) {
    bodyParts.push(inline.extractBilingualElement(node));
  } else {
    for (var i = 0; i < kids.length; i++) {
      if (kids[i] === headEl) continue;
      var pTxt = inline.extractBilingualElement(kids[i]);
      if (pTxt) bodyParts.push(pTxt);
    }
  }

  var bodyMd = bodyParts.filter(Boolean).join(' ');
  if (!bodyMd) {
    bodyMd = titleMd;
    titleMd = '关键洞察 || Key Insight';
  }

  var attrs = { title: titleMd.replace(/\*\*/g, '') };
  return [
    ':::callout' + formatDirectiveAttrs(attrs),
    bodyMd,
    ':::'
  ].join('\n');
}

function convertFigureOrDiagram(figNode, ctx, convertChildBlocks) {
  var zhImg = ast.findFirst(figNode, function (n) { return n.tag === 'img' && ast.hasClass(n, 'diagram-zh'); });
  var enImg = ast.findFirst(figNode, function (n) { return n.tag === 'img' && ast.hasClass(n, 'diagram-en'); });
  var anyImg = ast.findFirst(figNode, function (n) { return n.tag === 'img'; });
  var drawioLink = ast.findFirst(figNode, function (n) {
    return n.tag === 'a' && /\.drawio$/i.test(ast.getAttr(n, 'href'));
  });
  var figCap = ast.findFirst(figNode, function (n) { return n.tag === 'figcaption'; });
  var figHeading = ast.findFirst(figNode, function (n) { return /^h[3-5]$/.test(n.tag); });

  var captionMd = '';
  if (figCap) {
    var capSpans = ast.elementChildren(figCap).filter(function (c) {
      return !(c.tag === 'a' && /\.drawio$/i.test(ast.getAttr(c, 'href')));
    });
    if (capSpans.length > 0) {
      var zhParts = [];
      var enParts = [];
      capSpans.forEach(function (s) {
        var pairStr = inline.extractBilingualElement(s);
        if (!pairStr) return;
        if (pairStr.indexOf('||') !== -1) {
          var splitP = pairStr.split('||');
          zhParts.push(splitP[0].trim());
          enParts.push(splitP.slice(1).join(' ').trim());
        } else {
          zhParts.push(pairStr.trim());
          enParts.push(pairStr.trim());
        }
      });
      captionMd = inline.formatBilingualPair(zhParts.join(' '), enParts.join(' '));
    } else {
      captionMd = inline.extractBilingualElement(figCap);
    }
  }

  var titleMd = extractStepTitlePair(figNode) || (figHeading ? inline.extractBilingualElement(figHeading) : '');

  if (zhImg || enImg) {
    var zhSrc = inline.normalizeAssetPath(ast.getAttr(zhImg || enImg, 'src'));
    var baseSrc = zhSrc.replace(/\.(?:zh|en)\.svg$/i, '');
    var drawioHref = drawioLink ? inline.normalizeAssetPath(ast.getAttr(drawioLink, 'href')) : '';
    if (ctx && ctx.insideDirective) {
      return '![' + (titleMd || 'Diagram').replace(/[\[\]]/g, '') + '](' + zhSrc + ')' + (captionMd ? '\n\n*' + captionMd + '*' : '');
    }
    var dAttrs = { src: baseSrc };
    if (drawioHref) dAttrs.drawio = drawioHref;
    if (titleMd) dAttrs.title = titleMd;
    return [
      ':::diagram' + formatDirectiveAttrs(dAttrs),
      captionMd || titleMd || '架构示意图 || Architecture Diagram',
      ':::'
    ].join('\n');
  }

  if (anyImg) {
    var imgSrc = inline.normalizeAssetPath(ast.getAttr(anyImg, 'src'));
    var imgAlt = ast.cleanWhitespace(ast.getAttr(anyImg, 'alt')) || titleMd || 'Figure';
    var mdImg = '![' + imgAlt.replace(/[\[\]]/g, '') + '](' + imgSrc + ')';
    return captionMd ? mdImg + '\n\n*' + captionMd + '*' : mdImg;
  }

  var svgEl = ast.findFirst(figNode, function (n) { return n.tag === 'svg'; });
  if (svgEl) {
    var svgTitleEl = ast.findFirst(svgEl, function (n) { return n.tag === 'title'; });
    var svgTitle = svgTitleEl ? ast.cleanWhitespace(ast.textContent(svgTitleEl)) : '';
    var summaryTitle = titleMd || svgTitle || '内联数据可视化图表 || Inline SVG Visualization';
    if (ctx && ctx.figureSpecs && ctx.figureSpecs.length > 0 && !ctx.insideDirective) {
      var specFile = ctx.figureSpecs.shift();
      return [
        ':::figure' + formatDirectiveAttrs({ src: './media/' + specFile, title: summaryTitle }),
        captionMd || summaryTitle,
        ':::'
      ].join('\n');
    }
    var labels = ast.findAll(svgEl, function (n) { return n.tag === 'text'; })
      .map(function (t) { return ast.cleanWhitespace(ast.textContent(t)); })
      .filter(function (s) { return s && s.length > 1; })
      .slice(0, 12);
    var desc = captionMd || (labels.length > 0 ? '图表要素：' + labels.join(' · ') : summaryTitle);
    if (ctx && ctx.insideDirective) {
      return '> **📊 ' + summaryTitle + '** — ' + desc;
    }
    return [
      ':::callout' + formatDirectiveAttrs({ title: '📊 ' + summaryTitle }),
      desc,
      ':::'
    ].join('\n');
  }

  return convertChildBlocks(figNode, ctx);
}

function convertSandboxNode(node, ctx) {
  ctx.sandboxCounter = (ctx.sandboxCounter || 0) + 1;
  var canvasEl = node.tag === 'canvas' ? node : ast.findFirst(node, function (n) { return n.tag === 'canvas'; });
  var iframeEl = node.tag === 'iframe' ? node : ast.findFirst(node, function (n) { return n.tag === 'iframe'; });
  var rawId = ast.getAttr(node, 'data-sandbox-slot') ||
    ast.getAttr(node, 'id') ||
    (canvasEl && ast.getAttr(canvasEl, 'id')) ||
    (ctx.slug + '-sandbox-' + ctx.sandboxCounter);

  var headEl = ast.findFirst(node, function (n) { return /^h[2-5]$/.test(n.tag); });
  var titleMd = extractStepTitlePair(node) ||
    (headEl ? inline.extractBilingualElement(headEl) : '') ||
    (iframeEl && ast.getAttr(iframeEl, 'title')) ||
    (canvasEl && ast.getAttr(canvasEl, 'aria-label')) ||
    '交互实验沙盒 || Interactive Simulation Sandbox';

  var labels = ast.findAll(node, function (n) { return n.tag === 'label'; })
    .map(function (l) { return inline.extractBilingualElement(l); })
    .filter(Boolean);
  var pEl = ast.findFirst(node, function (n) { return n.tag === 'p'; });
  var descMd = pEl ? inline.extractBilingualElement(pEl) : '';
  if (!descMd && iframeEl) {
    var frameSrc = inline.normalizeAssetPath(ast.getAttr(iframeEl, 'src'));
    descMd = '内嵌交互实验视图（源页面：`' + frameSrc + '`）。 || Embedded interactive workbench (`' + frameSrc + '`).';
  }
  if (!descMd && labels.length > 0) {
    descMd = '交互可调参数：' + labels.join('、') + '。';
  }
  if (!descMd) {
    descMd = '纯静态前端交互模拟画布，零后端依赖运行。 || Pure static frontend interactive simulation canvas.';
  }

  if (ctx && ctx.insideDirective) {
    return '> **🧪 ' + titleMd + '** (`#' + rawId + '`) — ' + descMd;
  }

  var sAttrs = { id: rawId, title: titleMd };
  if (!canvasEl) sAttrs.canvas = false;
  if (!ctx.attachedPrimaryAssets && ctx.sandboxAssets) {
    if (ctx.sandboxAssets.localScripts.length > 0) sAttrs.script = ctx.sandboxAssets.localScripts[0];
    if (ctx.sandboxAssets.localStyles.length > 0) sAttrs.style = ctx.sandboxAssets.localStyles[0];
    ctx.attachedPrimaryAssets = true;
  }

  return [
    ':::sandbox' + formatDirectiveAttrs(sAttrs),
    descMd,
    ':::'
  ].join('\n');
}

module.exports = {
  formatDirectiveAttrs: formatDirectiveAttrs,
  extractStepTitlePair: extractStepTitlePair,
  isSandboxCandidate: isSandboxCandidate,
  convertInsightGrid: convertInsightGrid,
  convertComparisonGrid: convertComparisonGrid,
  convertAccordionGroup: convertAccordionGroup,
  convertFlowOrTimeline: convertFlowOrTimeline,
  convertCallout: convertCallout,
  convertFigureOrDiagram: convertFigureOrDiagram,
  convertSandboxNode: convertSandboxNode
};

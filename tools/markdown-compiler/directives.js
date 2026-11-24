// tools/markdown-compiler/directives.js
// Implements the 9 canonical Study Room visual & interactive component directives:
// 1. ## Section (.section + .section-head + presentation step contracts)
// 2. ### / :::accordion ([data-accordion] + .subsection-toggle + .subsection-content)
// 3. :::insight-grid (2/3/4 column symmetrical .insight-card grid)
// 4. :::comparison & Markdown tables (.comparison-grid / .compare-table)
// 5. :::flow / :::timeline (.flow-list / .timeline-list)
// 6. :::callout / :::quote / > blockquote (.quote-block / .insight-callout)
// 7. $...$ / $$...$$ ([data-latex]) & ```mermaid
// 8. :::diagram (bilingual .zh.svg / .en.svg figure with drawio download)
// 9. :::sandbox (declarative pure-static interactive slot with .js / .css mounting)

'use strict';

var fm = require('./frontmatter');
var inline = require('./inline-and-math');

function buildStepAttrs(attrs, fallbackTitlePair, fallbackLabelPair, defaultSurface) {
  if (!attrs && !fallbackTitlePair) return '';
  var stepFlag = attrs && (attrs.step === false || attrs.step === 'false') ? false : true;
  if (!stepFlag) return '';

  var titlePair = fm.parseBilingual(
    (attrs && (attrs.step_title || attrs.title)) ||
    (fallbackTitlePair ? fallbackTitlePair.zh + ' || ' + fallbackTitlePair.en : '')
  );
  var labelPair = fm.parseBilingual(
    (attrs && (attrs.step_label || attrs.label)) ||
    (fallbackLabelPair ? fallbackLabelPair.zh + ' || ' + fallbackLabelPair.en : '')
  );

  var surface = (attrs && attrs.surface) || defaultSurface || '';
  var parts = ['data-present-step'];
  if (surface) {
    parts.push('data-present-surface="' + fm.escapeAttr(surface) + '"');
  }
  if (titlePair.zh) {
    parts.push('data-step-title="' + fm.escapeAttr(titlePair.zh) + '"');
    parts.push('data-step-title-en="' + fm.escapeAttr(titlePair.en || titlePair.zh) + '"');
    parts.push('data-present-title-zh="' + fm.escapeAttr(titlePair.zh) + '"');
    parts.push('data-present-title-en="' + fm.escapeAttr(titlePair.en || titlePair.zh) + '"');
  }
  if (labelPair.zh) {
    parts.push('data-step-label="' + fm.escapeAttr(labelPair.zh) + '"');
    parts.push('data-step-label-en="' + fm.escapeAttr(labelPair.en || labelPair.zh) + '"');
  }

  var invTokens = [];
  if (titlePair.zh && (titlePair.zh === titlePair.en || !/[\u3400-\u9fff]/.test(titlePair.zh))) {
    invTokens.push('title');
  }
  if (labelPair.zh && (labelPair.zh === labelPair.en || !/[\u3400-\u9fff]/.test(labelPair.zh))) {
    invTokens.push('label');
  }
  if (invTokens.length > 0) {
    parts.push('data-present-i18n-invariant="' + invTokens.join(' ') + '"');
  }

  return ' ' + parts.join(' ');
}

// Split sub-items inside a container directive by `::item`, `::card`, `::panel`, `::versus`, or `###` / `####`
function splitContainerItems(lines) {
  var items = [];
  var current = null;
  var inFence = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      if (!current) {
        current = {
          kind: 'auto',
          label: '',
          title: '',
          attrs: {},
          bodyLines: [line]
        };
      } else {
        current.bodyLines.push(line);
      }
      continue;
    }

    if (inFence) {
      if (!current) {
        current = {
          kind: 'auto',
          label: '',
          title: '',
          attrs: {},
          bodyLines: [line]
        };
      } else {
        current.bodyLines.push(line);
      }
      continue;
    }

    var subDirective = line.match(/^\s*::([a-zA-Z][\w-]*)(?:\s+(.*))?$/);
    if (subDirective) {
      if (current) items.push(current);
      var rest = (subDirective[2] || '').trim();
      var itemAttrs = {};
      var labelText = '';
      if (rest.charAt(0) === '{') {
        itemAttrs = fm.parseInlineAttrs(rest);
      } else if (rest) {
        var bracePos = rest.indexOf('{');
        if (bracePos !== -1) {
          labelText = rest.slice(0, bracePos).trim();
          itemAttrs = fm.parseInlineAttrs(rest.slice(bracePos));
        } else {
          labelText = rest;
        }
      }
      current = {
        kind: subDirective[1],
        label: labelText || itemAttrs.label || '',
        title: itemAttrs.title || '',
        attrs: itemAttrs,
        bodyLines: []
      };
      continue;
    }

    var headingMatch = line.match(/^\s*(#{3,4})\s+(.+)$/);
    if (headingMatch && (!current || current.title || current.bodyLines.length > 0)) {
      if (current && !current.title && current.bodyLines.length === 0) {
        current.title = headingMatch[2].trim();
        continue;
      }
      if (current) items.push(current);
      current = {
        kind: 'heading-item',
        label: '',
        title: headingMatch[2].trim(),
        attrs: {},
        bodyLines: []
      };
      continue;
    }

    if (current && !current.title && headingMatch) {
      current.title = headingMatch[2].trim();
      continue;
    }

    if (!current) {
      if (!line.trim()) continue;
      current = {
        kind: 'auto',
        label: '',
        title: '',
        attrs: {},
        bodyLines: [line]
      };
    } else {
      current.bodyLines.push(line);
    }
  }

  if (current) items.push(current);
  return items;
}

function renderInsightGrid(attrs, lines, sectionCtx, state) {
  var items = splitContainerItems(lines);
  var count = items.length;
  var cols = Number(attrs.cols) || (count === 4 ? 2 : count === 2 ? 2 : 3);
  var colClass = cols === 2 ? ' insight-grid-2' : cols === 4 ? ' insight-grid-4' : ' insight-grid-3';
  var stepAttrs = buildStepAttrs(
    attrs,
    {
      zh: (attrs.title ? fm.parseBilingual(attrs.title).zh : sectionCtx.title.zh + '：核心洞察'),
      en: (attrs.title ? fm.parseBilingual(attrs.title).en : sectionCtx.title.en + ': Key Insights')
    },
    sectionCtx.kicker,
    'unframed'
  );

  var cardsHtml = items.map(function (item, idx) {
    var indexBadge = item.label || (idx + 1 < 10 ? '0' + (idx + 1) : String(idx + 1));
    var titleRaw = item.title || ('要点 ' + (idx + 1) + ' || Point ' + (idx + 1));
    var titleRendered = inline.renderBilingualInlinePair(titleRaw, state);
    var bodyRaw = item.bodyLines.join('\n').trim();
    var bodyHtml;
    if (bodyRaw.indexOf('||') !== -1 && bodyRaw.split('\n').length <= 3) {
      var bodyRendered = inline.renderBilingualInlinePair(bodyRaw, state);
      bodyHtml = '<p ' + inline.bilingualRichAttrs(bodyRaw, state) + '>' + bodyRendered.zhHtml + '</p>';
    } else {
      bodyHtml = inline.renderMarkdownFragment(bodyRaw, state);
    }

    return [
      '            <article class="insight-card">',
      '              <span class="card-index">' + fm.escapeHtml(indexBadge) + '</span>',
      '              <h3 ' + inline.bilingualRichAttrs(titleRaw, state) + '>' + titleRendered.zhHtml + '</h3>',
      '              ' + bodyHtml.trim(),
      '            </article>'
    ].join('\n');
  }).join('\n');

  return [
    '          <div class="insight-grid' + colClass + '"' + stepAttrs + '>',
    cardsHtml,
    '          </div>'
  ].join('\n');
}

function renderComparisonGrid(attrs, lines, sectionCtx, state) {
  var items = splitContainerItems(lines);
  var stepAttrs = buildStepAttrs(
    attrs,
    {
      zh: (attrs.title ? fm.parseBilingual(attrs.title).zh : sectionCtx.title.zh + '：方案对比'),
      en: (attrs.title ? fm.parseBilingual(attrs.title).en : sectionCtx.title.en + ': Comparison')
    },
    sectionCtx.kicker,
    'unframed'
  );

  var cardsHtml = items.map(function (item, idx) {
    var isNext = item.attrs.highlight || item.attrs.next || (idx === items.length - 1 && items.length === 2);
    var cardClass = 'comparison-card' + (isNext ? ' next' : '');
    var labelRaw = item.label || item.attrs.tag || ('方案 ' + (idx + 1) + ' || Option ' + (idx + 1));
    var labelPair = fm.parseBilingual(labelRaw);
    var titleRaw = item.title || labelPair.zh;
    var titleRendered = inline.renderBilingualInlinePair(titleRaw, state);
    var bodyRaw = item.bodyLines.join('\n').trim();
    var bodyHtml;
    if (bodyRaw.indexOf('||') !== -1 && bodyRaw.split('\n').length <= 3) {
      var bodyRendered = inline.renderBilingualInlinePair(bodyRaw, state);
      bodyHtml = '<p ' + inline.bilingualRichAttrs(bodyRaw, state) + '>' + bodyRendered.zhHtml + '</p>';
    } else {
      bodyHtml = inline.renderMarkdownFragment(bodyRaw, state);
    }

    return [
      '            <article class="' + cardClass + '">',
      '              <span class="comparison-label" ' + fm.bilingualAttrs(labelPair) + '>' + fm.escapeHtml(labelPair.zh) + '</span>',
      '              <h3 ' + inline.bilingualRichAttrs(titleRaw, state) + '>' + titleRendered.zhHtml + '</h3>',
      '              ' + bodyHtml.trim(),
      '            </article>'
    ].join('\n');
  }).join('\n');

  return [
    '          <div class="comparison-grid section-grid-spaced"' + stepAttrs + '>',
    cardsHtml,
    '          </div>'
  ].join('\n');
}

function renderAccordionGroup(attrs, lines, sectionCtx, state) {
  var items = splitContainerItems(lines);
  var stepAttrs = buildStepAttrs(
    attrs,
    {
      zh: (attrs.title ? fm.parseBilingual(attrs.title).zh : sectionCtx.title.zh + '：展开详解'),
      en: (attrs.title ? fm.parseBilingual(attrs.title).en : sectionCtx.title.en + ': Deep Dive')
    },
    sectionCtx.kicker,
    'unframed'
  );

  var panelsHtml = items.map(function (item, idx) {
    var isOpen = item.attrs.open === true || item.attrs.open === 'true' || (idx === 0 && attrs.open_first !== false);
    var itemClass = 'subsection-item' + (isOpen ? ' is-open' : '');
    var expanded = isOpen ? 'true' : 'false';
    var titleRaw = item.title || item.label || ('子项 ' + (idx + 1) + ' || Item ' + (idx + 1));
    var titleRendered = inline.renderBilingualInlinePair(titleRaw, state);
    var bodyRaw = item.bodyLines.join('\n').trim();
    var bodyHtml;
    if (bodyRaw.indexOf('||') !== -1 && bodyRaw.split('\n').length <= 2 && !/^\s*[|`>-]/m.test(bodyRaw)) {
      var bodyRendered = inline.renderBilingualInlinePair(bodyRaw, state);
      bodyHtml = '<p ' + inline.bilingualRichAttrs(bodyRaw, state) + '>' + bodyRendered.zhHtml + '</p>';
    } else {
      bodyHtml = inline.renderMarkdownFragment(bodyRaw, state);
    }

    return [
      '            <article class="' + itemClass + '" data-accordion>',
      '              <button class="subsection-toggle" type="button" aria-expanded="' + expanded + '">',
      '                <span ' + inline.bilingualRichAttrs(titleRaw, state) + '>' + titleRendered.zhHtml + '</span>',
      '              </button>',
      '              <div class="subsection-content">',
      '                ' + bodyHtml.trim(),
      '              </div>',
      '            </article>'
    ].join('\n');
  }).join('\n');

  return [
    '          <div class="subsection-accordion"' + stepAttrs + '>',
    panelsHtml,
    '          </div>'
  ].join('\n');
}

function renderFlowOrTimeline(kind, attrs, lines, sectionCtx, state) {
  var isTimeline = kind === 'timeline';
  var listClass = isTimeline ? 'flow-list timeline-list' : 'flow-list';
  var stepAttrs = buildStepAttrs(
    attrs,
    {
      zh: (attrs.title ? fm.parseBilingual(attrs.title).zh : sectionCtx.title.zh + (isTimeline ? '：演进时间轴' : '：执行流程')),
      en: (attrs.title ? fm.parseBilingual(attrs.title).en : sectionCtx.title.en + (isTimeline ? ': Timeline' : ': Execution Flow'))
    },
    sectionCtx.kicker,
    'unframed'
  );

  // Parse numbered list items `1. **Title** — Desc` or sub-directives
  var entries = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var listMatch = line.match(/^(?:\d+[.)]|[-*+])\s+(.+)$/);
    var text = listMatch ? listMatch[1] : line;
    var titleText = '';
    var descText = '';

    var boldMatch = text.match(/^\*\*([^*]+)\*\*\s*(?:[—–:-]\s*)?(.*)$/);
    if (boldMatch) {
      titleText = boldMatch[1].trim();
      descText = boldMatch[2].trim();
    } else {
      var dashIdx = text.indexOf(' — ');
      if (dashIdx !== -1) {
        titleText = text.slice(0, dashIdx).trim();
        descText = text.slice(dashIdx + 3).trim();
      } else {
        titleText = text;
      }
    }
    entries.push({ title: titleText, desc: descText });
  }

  var itemsHtml = entries.map(function (entry, idx) {
    var titleRendered = inline.renderBilingualInlinePair(entry.title, state);
    var descRendered = entry.desc ? inline.renderBilingualInlinePair(entry.desc, state) : null;
    var descHtml = entry.desc
      ? '<p ' + inline.bilingualRichAttrs(entry.desc, state) + '>' + descRendered.zhHtml + '</p>'
      : '';
    return [
      '            <li class="flow-step">',
      '              <div class="flow-copy">',
      '                <strong ' + inline.bilingualRichAttrs(entry.title, state) + '>' + titleRendered.zhHtml + '</strong>',
      descHtml ? '                ' + descHtml : '',
      '              </div>',
      '            </li>'
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    '          <ol class="' + listClass + '"' + stepAttrs + '>',
    itemsHtml,
    '          </ol>'
  ].join('\n');
}

function renderCallout(attrs, lines, sectionCtx, state) {
  var titleRaw = attrs.title || '';
  var titlePair = fm.parseBilingual(titleRaw);
  var bodyLines = lines.slice();

  if (!titlePair.zh && bodyLines.length > 0) {
    var firstTrimmed = bodyLines[0].trim();
    var boldHead = firstTrimmed.match(/^\*\*([^*]+)\*\*$/);
    if (boldHead) {
      titleRaw = boldHead[1];
      titlePair = fm.parseBilingual(titleRaw);
      bodyLines.shift();
    } else if (bodyLines.length > 1 && firstTrimmed.length <= 36 && !/[。！？.!?]$/.test(firstTrimmed)) {
      titleRaw = firstTrimmed;
      titlePair = fm.parseBilingual(titleRaw);
      bodyLines.shift();
    }
  }

  if (!titlePair.zh) {
    titleRaw = '关键洞察 || Key Insight';
    titlePair = fm.parseBilingual(titleRaw);
  }

  var bodyRaw = bodyLines.join('\n').trim();
  var titleRendered = inline.renderBilingualInlinePair(titleRaw, state);
  var bodyRendered = inline.renderBilingualInlinePair(bodyRaw, state);
  var variantClass = attrs.variant === 'callout' ? 'quote-block insight-callout' : 'quote-block';

  return [
    '          <div class="' + variantClass + '">',
    '            <strong ' + inline.bilingualRichAttrs(titleRaw, state) + '>' + titleRendered.zhHtml + '</strong>',
    '            <span ' + inline.bilingualRichAttrs(bodyRaw, state) + '>' + bodyRendered.zhHtml + '</span>',
    '          </div>'
  ].join('\n');
}

function renderDiagram(attrs, lines, sectionCtx, state) {
  var baseSrc = String(attrs.src || '').replace(/\.(?:zh|en)\.svg$/i, '').replace(/\.svg$/i, '');
  var zhSrc = attrs.zh || (baseSrc ? baseSrc + '.zh.svg' : '');
  var enSrc = attrs.en || (baseSrc ? baseSrc + '.en.svg' : zhSrc);
  var drawioHref = attrs.drawio || (baseSrc ? baseSrc + '.drawio' : '');
  var altPair = fm.parseBilingual(attrs.alt || attrs.title || sectionCtx.title.zh + ' || ' + sectionCtx.title.en);
  var captionRaw = lines.join(' ').trim() || attrs.caption || (altPair.zh + ' || ' + altPair.en);
  var captionRendered = inline.renderBilingualInlinePair(captionRaw, state);

  var stepAttrs = buildStepAttrs(
    attrs,
    {
      zh: (attrs.title ? fm.parseBilingual(attrs.title).zh : sectionCtx.title.zh + '：架构图解'),
      en: (attrs.title ? fm.parseBilingual(attrs.title).en : sectionCtx.title.en + ': Architecture Diagram')
    },
    sectionCtx.kicker,
    'unframed'
  );

  var downloadLink = drawioHref
    ? '<a href="' + fm.escapeAttr(drawioHref) + '" download data-zh="下载 .drawio" data-en="Download .drawio">下载 .drawio</a>'
    : '';

  return [
    '          <figure class="generated-diagram"' + stepAttrs + '>',
    '            <img class="diagram-zh" src="' + fm.escapeAttr(zhSrc) + '" alt="' + fm.escapeAttr(altPair.zh) + '" />',
    '            <img class="diagram-en" src="' + fm.escapeAttr(enSrc) + '" alt="' + fm.escapeAttr(altPair.en) + '" />',
    '            <figcaption class="diagram-caption"><span ' + inline.bilingualRichAttrs(captionRaw, state) + '>' + captionRendered.zhHtml + '</span>' + downloadLink + '</figcaption>',
    '          </figure>'
  ].join('\n');
}

function renderSandbox(attrs, lines, sectionCtx, state) {
  var sandboxId = attrs.id || 'sandbox-' + String(state.sandboxes.length + 1);
  var titlePair = fm.parseBilingual(attrs.title || (sectionCtx.title.zh + '：交互实验沙盒 || ' + sectionCtx.title.en + ': Interactive Sandbox'));
  var descPair = fm.parseBilingual(attrs.desc || lines.join(' ').trim() || '纯静态前端实时推演画布，零后端依赖运行。 || Pure static interactive simulation canvas running with zero backend dependency.');

  if (attrs.style) {
    state.sandboxStyles.push(String(attrs.style));
  }
  if (attrs.script) {
    state.sandboxScripts.push(String(attrs.script));
  }
  state.sandboxes.push({ id: sandboxId, attrs: attrs });

  var stepAttrs = buildStepAttrs(
    attrs,
    titlePair,
    sectionCtx.kicker,
    'board'
  );

  var mountTag = attrs.canvas !== false
    ? '<canvas id="' + fm.escapeAttr(sandboxId) + '-canvas" class="sandbox-canvas" width="760" height="280" aria-label="' + fm.escapeAttr(titlePair.zh) + '"></canvas>'
    : '';

  return [
    '          <div id="' + fm.escapeAttr(sandboxId) + '" class="sandbox-slot" data-sandbox-slot="' + fm.escapeAttr(sandboxId) + '"' + stepAttrs + '>',
    '            <div class="sandbox-header">',
    '              <div class="sandbox-title-group">',
    '                <span class="comparison-label" data-zh="纯静态交互沙盒" data-en="Static Interactive Sandbox">纯静态交互沙盒</span>',
    '                <h3 ' + fm.bilingualAttrs(titlePair) + '>' + fm.escapeHtml(titlePair.zh) + '</h3>',
    '                <p ' + fm.bilingualAttrs(descPair) + '>' + fm.escapeHtml(descPair.zh) + '</p>',
    '              </div>',
    '              <div class="sandbox-controls" data-sandbox-controls="' + fm.escapeAttr(sandboxId) + '"></div>',
    '            </div>',
    '            <div class="sandbox-stage" data-sandbox-stage="' + fm.escapeAttr(sandboxId) + '">',
    mountTag ? '              ' + mountTag : '',
    '            </div>',
    '          </div>'
  ].join('\n');
}

module.exports = {
  buildStepAttrs: buildStepAttrs,
  renderInsightGrid: renderInsightGrid,
  renderComparisonGrid: renderComparisonGrid,
  renderAccordionGroup: renderAccordionGroup,
  renderFlowOrTimeline: renderFlowOrTimeline,
  renderCallout: renderCallout,
  renderDiagram: renderDiagram,
  renderSandbox: renderSandbox
};

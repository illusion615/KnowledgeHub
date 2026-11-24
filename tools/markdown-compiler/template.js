// tools/markdown-compiler/template.js
// Generates self-contained, 100% GitHub Pages static HTML pages with full Study Room runtimes,
// zero backend dependencies, validate.js 14-gate compliance, and built-in Progressive / Linear / Markdown Source dual-view switching.

'use strict';

var fm = require('./frontmatter');
var inline = require('./inline-and-math');

function buildHeroHtml(meta, chaptersData, state) {
  var titlePair = fm.parseBilingual(meta.title || '未命名文章 || Untitled Article');
  var eyebrowPair = fm.parseBilingual(meta.eyebrow || 'Study Room Genesis');
  var brandPair = fm.parseBilingual(meta.brand || 'Study Room');
  var leadRaw = meta.lead || chaptersData.introLead || '';
  var leadPair = fm.parseBilingual(leadRaw);

  // Nav links from chapters
  var navLinksHtml = chaptersData.chapters.map(function (c) {
    return '            <a href="#' + fm.escapeAttr(c.ctx.id) + '" ' + fm.bilingualAttrs(c.ctx.nav) + '>' + fm.escapeHtml(c.ctx.nav.zh) + '</a>';
  }).join('\n');

  // Hero actions
  var actionsHtml = '';
  if (Array.isArray(meta.hero_actions) && meta.hero_actions.length > 0) {
    var actionItems = meta.hero_actions.map(function (act, idx) {
      if (typeof act === 'string') {
        var parts = act.split(/(?<!\|)\|(?!\|)/).map(function (s) { return s.trim(); });
        var labelP = fm.parseBilingual(parts[0]);
        var href = parts[1] || ('#' + (chaptersData.chapters[idx] ? chaptersData.chapters[idx].ctx.id : 'overview'));
        var btnCls = idx === 0 ? 'button button-primary' : 'button button-secondary';
        return '              <a class="' + btnCls + '" href="' + fm.escapeAttr(href) + '" ' + fm.bilingualAttrs(labelP) + '>' + fm.escapeHtml(labelP.zh) + '</a>';
      }
      var lPair = fm.parseBilingual(act.label || '查看章节 || Explore');
      var hRef = act.href || '#';
      var bClass = act.primary || idx === 0 ? 'button button-primary' : 'button button-secondary';
      return '              <a class="' + bClass + '" href="' + fm.escapeAttr(hRef) + '" ' + fm.bilingualAttrs(lPair) + '>' + fm.escapeHtml(lPair.zh) + '</a>';
    }).join('\n');
    actionsHtml = '\n            <div class="hero-actions">\n' + actionItems + '\n            </div>';
  } else if (chaptersData.chapters.length > 0) {
    var firstChap = chaptersData.chapters[0].ctx;
    var secondChap = chaptersData.chapters[1] ? chaptersData.chapters[1].ctx : null;
    var defaultBtns = [
      '              <a class="button button-primary" href="#' + fm.escapeAttr(firstChap.id) + '" data-zh="阅读核心章节" data-en="Explore Core Chapters">阅读核心章节</a>'
    ];
    if (secondChap) {
      defaultBtns.push(
        '              <a class="button button-secondary" href="#' + fm.escapeAttr(secondChap.id) + '" ' + fm.bilingualAttrs(secondChap.nav) + '>' + fm.escapeHtml(secondChap.nav.zh) + '</a>'
      );
    }
    actionsHtml = '\n            <div class="hero-actions">\n' + defaultBtns.join('\n') + '\n            </div>';
  }

  // Hero right panel
  var panelLabelPair = fm.parseBilingual(meta.panel_label || '核心架构摘要 || Architecture Brief');
  var panelTitlePair = fm.parseBilingual(meta.panel_title || (chaptersData.introQuote[0] || titlePair.zh));
  var panelDescPair = fm.parseBilingual(meta.panel_desc || '');
  var panelItems = Array.isArray(meta.panel) ? meta.panel : [];
  if (panelItems.length === 0 && chaptersData.introQuote.length > 1) {
    panelItems = chaptersData.introQuote.slice(1).map(function (line) {
      return line.replace(/^[-*+]\s+/, '');
    });
  }

  var panelListHtml = '';
  if (panelItems.length > 0) {
    var liHtml = panelItems.map(function (item, idx) {
      var renderedItem = inline.renderBilingualInlinePair(item, state);
      return '              <li><span class="layer-number">' + (idx + 1) + '</span><span ' + inline.bilingualRichAttrs(item, state) + '>' + renderedItem.zhHtml + '</span></li>';
    }).join('\n');
    panelListHtml = '\n            <ul class="layer-list">\n' + liHtml + '\n            </ul>';
  }

  var panelDescRendered = panelDescPair.zh ? inline.renderBilingualInlinePair(meta.panel_desc || '', state) : null;
  var panelDescHtml = panelDescPair.zh
    ? '\n            <p ' + inline.bilingualRichAttrs(meta.panel_desc || '', state) + '>' + panelDescRendered.zhHtml + '</p>'
    : '';

  // Hero metrics
  var metricsHtml = '';
  if (Array.isArray(meta.metrics) && meta.metrics.length > 0) {
    var metricCards = meta.metrics.map(function (m) {
      var labelP, valueStr, descRaw;
      if (typeof m === 'string') {
        var segs = m.split(/(?<!\|)\|(?!\|)/).map(function (s) { return s.trim(); });
        labelP = fm.parseBilingual(segs[0] || '');
        valueStr = segs[1] || '';
        descRaw = segs[2] || '';
      } else {
        labelP = fm.parseBilingual(m.label || '');
        valueStr = String(m.value || '');
        descRaw = String(m.desc || '');
      }
      var descRendered = inline.renderBilingualInlinePair(descRaw, state);
      return [
        '          <div class="metric">',
        '            <div class="metric-label" ' + fm.bilingualAttrs(labelP) + '>' + fm.escapeHtml(labelP.zh) + '</div>',
        '            <strong>' + fm.escapeHtml(valueStr) + '</strong>',
        '            <span ' + inline.bilingualRichAttrs(descRaw, state) + '>' + descRendered.zhHtml + '</span>',
        '          </div>'
      ].join('\n');
    }).join('\n');

    metricsHtml = [
      '',
      '        <div class="hero-metrics load-in">',
      metricCards,
      '        </div>'
    ].join('\n');
  }

  var leadRendered = inline.renderBilingualInlinePair(leadRaw, state);

  return [
    '      <header class="hero">',
    '        <div class="topbar load-in">',
    '          <a class="home-link" href="../../" data-zh="←" data-en="←" aria-label="返回首页">←</a>',
    '          <div class="brand">',
    '            <span class="brand-mark"></span>',
    '            <span ' + fm.bilingualAttrs(brandPair) + '>' + fm.escapeHtml(brandPair.zh) + '</span>',
    '          </div>',
    '          <nav class="nav-links" aria-label="页面章节导航">',
    navLinksHtml,
    '          </nav>',
    '        </div>',
    '',
    '        <div class="hero-grid">',
    '          <div class="hero-copy load-in">',
    '            <span class="eyebrow" ' + fm.bilingualAttrs(eyebrowPair) + '>' + fm.escapeHtml(eyebrowPair.zh) + '</span>',
    '            <h1 ' + fm.bilingualAttrs(titlePair) + '>' + fm.escapeHtml(titlePair.zh) + '</h1>',
    '            <p ' + inline.bilingualRichAttrs(leadRaw, state) + '>' + leadRendered.zhHtml + '</p>' + actionsHtml,
    '          </div>',
    '',
    '          <aside class="hero-panel load-in">',
    '            <span class="panel-label" ' + fm.bilingualAttrs(panelLabelPair) + '>' + fm.escapeHtml(panelLabelPair.zh) + '</span>',
    '            <h2 ' + fm.bilingualAttrs(panelTitlePair) + '>' + fm.escapeHtml(panelTitlePair.zh) + '</h2>' + panelDescHtml + panelListHtml,
    '          </aside>',
    '        </div>' + metricsHtml,
    '      </header>'
  ].join('\n');
}

function buildStaticStyles(meta) {
  var customTokens = [];
  if (meta.style && typeof meta.style === 'object') {
    Object.keys(meta.style).forEach(function (k) {
      var cssVar = k.indexOf('--') === 0 ? k : '--' + k.replace(/_/g, '-');
      customTokens.push('      ' + cssVar + ': ' + meta.style[k] + ';');
    });
  }
  var rootOverride = customTokens.length > 0 ? '    :root {\n' + customTokens.join('\n') + '\n    }\n' : '';

  return [
    '  <style>',
    rootOverride + '    html.is-presentation-mode .section:has([data-present-step]) > .section-head {',
    '      display: none;',
    '    }',
    '    .hero-copy h1 {',
    '      font-size: clamp(2.1rem, 5vw, 3.8rem);',
    '      line-height: 1.08;',
    '      letter-spacing: -0.03em;',
    '      max-width: 20ch;',
    '    }',
    '    .hero-panel .layer-list { position: relative; margin-top: 18px; }',
    '    .insight-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
    '    .insight-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }',
    '    .insight-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }',
    '    @media (max-width: 980px) {',
    '      .insight-grid-3, .insight-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
    '    }',
    '    @media (max-width: 680px) {',
    '      .insight-grid-2, .insight-grid-3, .insight-grid-4 { grid-template-columns: 1fr; }',
    '    }',
    '    .compare-table-wrap {',
    '      margin-top: 18px;',
    '      overflow-x: auto;',
    '      border-radius: var(--radius-md);',
    '      border: 1px solid var(--line);',
    '      background: var(--panel);',
    '      padding: 6px 14px;',
    '      box-shadow: var(--shadow);',
    '    }',
    '    .compare-table-wrap .compare-table {',
    '      width: 100%;',
    '      min-width: 680px;',
    '      border-collapse: collapse;',
    '      margin-top: 0;',
    '      font-size: 0.9rem;',
    '    }',
    '    .compare-table-wrap .compare-table th {',
    '      text-align: left;',
    '      padding: 12px 14px;',
    '      background: rgba(15, 23, 42, 0.04);',
    '      border-bottom: 2px solid rgba(15, 23, 42, 0.1);',
    '      font-family: "Space Grotesk", "Noto Sans SC", sans-serif;',
    '      font-weight: 700;',
    '      font-size: 0.8rem;',
    '      letter-spacing: 0.04em;',
    '      text-transform: none;',
    '      color: var(--ink);',
    '      vertical-align: bottom;',
    '    }',
    '    .compare-table-wrap .compare-table td {',
    '      padding: 12px 14px;',
    '      border-bottom: 1px solid rgba(15, 23, 42, 0.07);',
    '      line-height: 1.65;',
    '      color: var(--ink);',
    '      vertical-align: top;',
    '    }',
    '    .compare-table-wrap .compare-table tbody tr:last-child td {',
    '      border-bottom: none;',
    '    }',
    '    .compare-table-wrap .compare-table td:first-child {',
    '      font-weight: 600;',
    '      min-width: 150px;',
    '    }',
    '    .compare-table-wrap .compare-table code,',
    '    .section p code,',
    '    .flow-copy code,',
    '    .insight-card code,',
    '    .comparison-card code,',
    '    .quote-block code,',
    '    .subsection-toggle code,',
    '    .subsection-content p code,',
    '    .bib-list code {',
    '      font-family: "SF Mono", "Fira Code", "Consolas", monospace;',
    '      font-size: 0.84em;',
    '      padding: 2px 6px;',
    '      border-radius: 5px;',
    '      background: rgba(15, 23, 42, 0.06);',
    '      color: var(--ink);',
    '    }',
    '    [data-theme="dark"] .compare-table-wrap {',
    '      background: rgba(22, 29, 38, 0.9);',
    '      border-color: rgba(255, 255, 255, 0.12);',
    '    }',
    '    [data-theme="dark"] .compare-table-wrap .compare-table th {',
    '      background: rgba(255, 255, 255, 0.05);',
    '      border-color: rgba(255, 255, 255, 0.12);',
    '      color: var(--ink);',
    '    }',
    '    [data-theme="dark"] .compare-table-wrap .compare-table td {',
    '      border-color: rgba(255, 255, 255, 0.07);',
    '      color: var(--ink);',
    '    }',
    '    [data-theme="dark"] .compare-table-wrap .compare-table code,',
    '    [data-theme="dark"] .section p code,',
    '    [data-theme="dark"] .flow-copy code,',
    '    [data-theme="dark"] .insight-card code,',
    '    [data-theme="dark"] .comparison-card code,',
    '    [data-theme="dark"] .quote-block code,',
    '    [data-theme="dark"] .subsection-toggle code,',
    '    [data-theme="dark"] .subsection-content p code,',
    '    [data-theme="dark"] .bib-list code {',
    '      background: rgba(255, 255, 255, 0.1);',
    '      color: #e2e8f0;',
    '    }',
    '    .timeline-list > .flow-step::before {',
    '      background: linear-gradient(135deg, var(--teal), #14b8a6);',
    '    }',
    '    .insight-callout {',
    '      border-left: 4px solid var(--teal);',
    '    }',
    '    .code-block {',
    '      margin: 18px 0;',
    '      border-radius: 14px;',
    '      overflow: hidden;',
    '    }',
    '    .code-block pre {',
    '      margin: 0;',
    '      padding: 20px 22px;',
    '      background: rgba(16, 31, 43, 0.95);',
    '      color: #cdd6e0;',
    '      font-family: "SF Mono", "Fira Code", "Consolas", monospace;',
    '      font-size: 0.82rem;',
    '      line-height: 1.68;',
    '      overflow-x: auto;',
    '      border: 1px solid rgba(255, 255, 255, 0.08);',
    '      border-radius: 14px;',
    '    }',
    '    [data-theme="dark"] .code-block pre {',
    '      background: rgba(0, 0, 0, 0.46);',
    '      border-color: rgba(255, 255, 255, 0.1);',
    '    }',
    '    .mermaid-container {',
    '      margin: 22px 0;',
    '      padding: 24px 18px;',
    '      border-radius: var(--radius-md);',
    '      background: var(--panel);',
    '      border: 1px solid var(--line);',
    '      text-align: center;',
    '      overflow-x: auto;',
    '    }',
    '    .generated-diagram {',
    '      margin-top: 22px;',
    '      padding: 18px;',
    '      border: 1px solid var(--line);',
    '      border-radius: var(--radius-md);',
    '      background: var(--panel);',
    '      box-shadow: var(--shadow);',
    '    }',
    '    .generated-diagram img {',
    '      display: block;',
    '      width: 100%;',
    '      height: auto;',
    '      object-fit: contain;',
    '    }',
    '    html[lang="en"] .diagram-zh,',
    '    html:not([lang="en"]) .diagram-en { display: none; }',
    '    .diagram-caption {',
    '      display: flex;',
    '      align-items: baseline;',
    '      justify-content: space-between;',
    '      gap: 12px;',
    '      margin-top: 12px;',
    '      color: var(--muted);',
    '      font-size: 0.84rem;',
    '    }',
    '    .diagram-caption a { color: var(--teal); font-weight: 600; white-space: nowrap; }',
    '    [data-theme="dark"] .generated-diagram {',
    '      background: rgba(22, 29, 38, 0.9);',
    '      border-color: rgba(255, 255, 255, 0.12);',
    '    }',
    '    .sandbox-slot {',
    '      margin-top: 22px;',
    '      padding: 22px;',
    '      border-radius: var(--radius-lg);',
    '      background: var(--panel);',
    '      border: 1px solid var(--line);',
    '      box-shadow: var(--shadow);',
    '    }',
    '    .sandbox-header {',
    '      display: flex;',
    '      flex-wrap: wrap;',
    '      align-items: flex-start;',
    '      justify-content: space-between;',
    '      gap: 16px;',
    '      margin-bottom: 16px;',
    '    }',
    '    .sandbox-title-group h3 { margin: 10px 0 6px; font-size: 1.18rem; }',
    '    .sandbox-title-group p { margin: 0; color: var(--muted); font-size: 0.9rem; }',
    '    .sandbox-controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }',
    '    .sandbox-stage {',
    '      border-radius: var(--radius-md);',
    '      background: rgba(16, 31, 43, 0.04);',
    '      border: 1px solid var(--line);',
    '      padding: 14px;',
    '      overflow: hidden;',
    '    }',
    '    [data-theme="dark"] .sandbox-stage {',
    '      background: rgba(0, 0, 0, 0.28);',
    '    }',
    '    .sandbox-canvas {',
    '      display: block;',
    '      width: 100%;',
    '      max-height: 300px;',
    '      border-radius: 10px;',
    '    }',
    '    /* Dual-view switcher bar (Progressive / Linear / Markdown Source) */',
    '    .genesis-view-bar {',
    '      display: flex;',
    '      align-items: center;',
    '      justify-content: space-between;',
    '      flex-wrap: wrap;',
    '      gap: 12px;',
    '      margin: 18px 0 8px;',
    '      padding: 10px 16px;',
    '      border-radius: 999px;',
    '      background: var(--panel);',
    '      border: 1px solid var(--line);',
    '      font-size: 0.82rem;',
    '    }',
    '    .genesis-view-status {',
    '      color: var(--muted);',
    '      font-weight: 600;',
    '    }',
    '    .genesis-view-buttons {',
    '      display: inline-flex;',
    '      gap: 6px;',
    '    }',
    '    .genesis-view-btn {',
    '      appearance: none;',
    '      border: 1px solid transparent;',
    '      background: transparent;',
    '      color: var(--muted);',
    '      font: inherit;',
    '      font-size: 0.78rem;',
    '      font-weight: 700;',
    '      padding: 5px 12px;',
    '      border-radius: 999px;',
    '      cursor: pointer;',
    '      transition: background 0.18s ease, color 0.18s ease;',
    '    }',
    '    .genesis-view-btn.is-active {',
    '      background: linear-gradient(135deg, var(--accent), #ff9340);',
    '      color: #fff;',
    '    }',
    '    .genesis-source-drawer {',
    '      display: none;',
    '      margin: 18px 0 28px;',
    '      padding: 20px;',
    '      border-radius: var(--radius-lg);',
    '      background: rgba(16, 31, 43, 0.96);',
    '      color: #dbe4ee;',
    '      border: 1px solid rgba(255, 255, 255, 0.12);',
    '      overflow-x: auto;',
    '    }',
    '    .genesis-source-drawer.is-open { display: block; }',
    '    .genesis-source-drawer pre {',
    '      margin: 0;',
    '      font-family: "SF Mono", "Fira Code", "Consolas", monospace;',
    '      font-size: 0.8rem;',
    '      line-height: 1.65;',
    '      white-space: pre-wrap;',
    '      word-break: break-word;',
    '    }',
    '    body.is-linear-reading .subsection-content {',
    '      max-height: none !important;',
    '      opacity: 1 !important;',
    '      overflow: visible !important;',
    '      padding: 0 24px 24px !important;',
    '    }',
    '    .is-presentation-mode .genesis-view-bar,',
    '    .is-presentation-mode .genesis-source-drawer {',
    '      display: none !important;',
    '    }',
    '  </style>'
  ].join('\n');
}

function buildDualViewHtml(rawMarkdown) {
  return [
    '      <div class="genesis-view-bar load-in" role="region" aria-label="Genesis 视图模式切换">',
    '        <span class="genesis-view-status" data-zh="Genesis 纯静态编译产物 · 零后端依赖 · 支持渐进披露与源稿对照" data-en="Genesis Static Compiled Artifact · Zero Backend · Progressive &amp; Source View">Genesis 纯静态编译产物 · 零后端依赖 · 支持渐进披露与源稿对照</span>',
    '        <div class="genesis-view-buttons">',
    '          <button type="button" class="genesis-view-btn is-active" data-genesis-mode="progressive" data-zh="渐进披露视图" data-en="Progressive View">渐进披露视图</button>',
    '          <button type="button" class="genesis-view-btn" data-genesis-mode="linear" data-zh="线性展开视图" data-en="Linear View">线性展开视图</button>',
    '          <button type="button" class="genesis-view-btn" data-genesis-mode="source" data-zh="Markdown 源稿对照" data-en="Markdown Source">Markdown 源稿对照</button>',
    '        </div>',
    '      </div>',
    '      <section class="genesis-source-drawer" id="genesis-source-drawer" aria-label="Markdown 源稿">',
    '        <pre><code>' + fm.escapeRawHtml(rawMarkdown) + '</code></pre>',
    '      </section>'
  ].join('\n');
}

function buildDualViewInlineScript(hasMermaid) {
  // Strictly ES5 — zero arrow functions (`=>`) to satisfy validate.js Test 4!
  var mermaidBoot = hasMermaid ? [
    '      if (typeof mermaid !== "undefined" && mermaid.initialize) {',
    '        mermaid.initialize({ startOnLoad: true, theme: "neutral" });',
    '      }'
  ].join('\n') : '';

  return [
    '  <script>',
    '    (function () {',
    '      var buttons = document.querySelectorAll("[data-genesis-mode]");',
    '      var drawer = document.getElementById("genesis-source-drawer");',
    '      var i;',
    '      function setMode(mode) {',
    '        for (var j = 0; j < buttons.length; j++) {',
    '          var btn = buttons[j];',
    '          var active = btn.getAttribute("data-genesis-mode") === mode;',
    '          if (active) {',
    '            btn.classList.add("is-active");',
    '          } else {',
    '            btn.classList.remove("is-active");',
    '          }',
    '        }',
    '        if (mode === "linear") {',
    '          document.body.classList.add("is-linear-reading");',
    '          if (drawer) drawer.classList.remove("is-open");',
    '        } else if (mode === "source") {',
    '          document.body.classList.remove("is-linear-reading");',
    '          if (drawer) drawer.classList.add("is-open");',
    '        } else {',
    '          document.body.classList.remove("is-linear-reading");',
    '          if (drawer) drawer.classList.remove("is-open");',
    '        }',
    '      }',
    '      for (i = 0; i < buttons.length; i++) {',
    '        (function (btn) {',
    '          btn.addEventListener("click", function () {',
    '            setMode(btn.getAttribute("data-genesis-mode"));',
    '          });',
    '        })(buttons[i]);',
    '      }',
    mermaidBoot,
    '    })();',
    '  </script>'
  ].filter(Boolean).join('\n');
}

function buildFullHtmlDocument(meta, chaptersData, rawMarkdown, state, options) {
  var opts = options || {};
  var assetPrefix = opts.assetPrefix || '../../assets';
  var titlePair = fm.parseBilingual(meta.title || 'Study Room Article');
  var strictI18n = meta.strict_i18n === true || meta.present_i18n === 'strict';
  var strictDensity = meta.strict_density !== false;

  var htmlAttrs = ['lang="zh-CN"'];
  if (strictDensity) htmlAttrs.push('data-section-density="strict"');
  if (strictI18n) htmlAttrs.push('data-present-i18n="strict"');
  if (meta.cite_links !== false) htmlAttrs.push('data-cite-links');

  var sandboxStyleLinks = state.sandboxStyles.map(function (href) {
    return '  <link rel="stylesheet" href="' + fm.escapeAttr(href) + '" />';
  }).join('\n');

  var heroHtml = buildHeroHtml(meta, chaptersData, state);
  var dualViewHtml = buildDualViewHtml(rawMarkdown);
  var sectionsHtml = chaptersData.chapters.map(function (c) { return c.html; }).join('\n\n');

  // Required scripts in exact validate.js Test 2 order:
  // article-common.js -> article-presentation.js -> scrollbar.js -> article-lightbox.js -> article-assistant.js
  // Plus optional article-math.js, pptx-export.js, article-narration.js, and sandbox scripts.
  var extraHeadScripts = [];
  if (state.hasMermaid) {
    extraHeadScripts.push('  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>');
  }

  var tailScripts = [
    '  <script src="' + assetPrefix + '/article-common.js"></script>',
    '  <script src="' + assetPrefix + '/article-presentation.js"></script>',
    '  <script src="' + assetPrefix + '/article-narration.js"></script>',
    '  <script src="' + assetPrefix + '/pptx-export.js"></script>',
    '  <script src="' + assetPrefix + '/article-math.js"></script>',
    '  <script src="' + assetPrefix + '/scrollbar.js"></script>',
    '  <script src="' + assetPrefix + '/article-lightbox.js"></script>',
    '  <script src="' + assetPrefix + '/article-assistant.js"></script>'
  ];

  state.sandboxScripts.forEach(function (src) {
    tailScripts.push('  <script src="' + fm.escapeAttr(src) + '"></script>');
  });

  tailScripts.push(buildDualViewInlineScript(state.hasMermaid));

  return [
    '<!DOCTYPE html>',
    '<html ' + htmlAttrs.join(' ') + '>',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + fm.escapeHtml(titlePair.zh) + '</title>',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />',
    '  <link rel="stylesheet" href="' + assetPrefix + '/article.css" />',
    '  <link rel="stylesheet" href="' + assetPrefix + '/scrollbar.css" />',
    '  <link rel="stylesheet" href="' + assetPrefix + '/article-narration.css" />',
    '  <link rel="stylesheet" href="' + assetPrefix + '/article-diagram.css" />',
    sandboxStyleLinks,
    buildStaticStyles(meta),
    '</head>',
    '<body>',
    '  <div class="page-shell">',
    '    <div class="backdrop" aria-hidden="true">',
    '      <span class="orb orb-a"></span>',
    '      <span class="orb orb-b"></span>',
    '      <span class="orb orb-c"></span>',
    '    </div>',
    '',
    '    <div class="site">',
    heroHtml,
    '',
    dualViewHtml,
    '',
    '      <main>',
    sectionsHtml,
    '      </main>',
    '',
    '      <footer class="site-footer" data-reveal>',
    '        <p data-zh="© 2026 Knowledge Hub · Genesis 纯静态 Markdown 编译管线生成" data-en="© 2026 Knowledge Hub · Generated by Genesis Static Markdown Compiler">© 2026 Knowledge Hub · Genesis 纯静态 Markdown 编译管线生成</p>',
    '      </footer>',
    '    </div>',
    '  </div>',
    '',
    extraHeadScripts.join('\n'),
    tailScripts.join('\n'),
    '</body>',
    '</html>',
    ''
  ].filter(function (line) { return line !== null && line !== undefined; }).join('\n');
}

module.exports = {
  buildFullHtmlDocument: buildFullHtmlDocument
};

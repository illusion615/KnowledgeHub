// tools/html-to-markdown/hero-extractor.js
// Extracts YAML Frontmatter fields from `<header class="hero">`, `<head>`, `<style>`,
// local `.css` / `.js` assets, and Knowledge Tree metadata when available.

'use strict';

var ast = require('./html-ast');
var inline = require('./inline-converter');

function quoteYamlScalar(val) {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'boolean' || typeof val === 'number') return String(val);
  var str = String(val).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!str) return '""';
  // Quote if contains YAML special chars (`:`, `#`, `[`, `]`, `{`, `}`, `&`, `*`, `!`, `|`, `>`, `'`, `"`, `%`, `@`, `` ` ``)
  if (/[:#\[\]{}&*!|>'"%@`]|^\s|\s$|^[-?]/.test(str)) {
    return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return str;
}

function extractCssRootTokens(root) {
  var styles = ast.findAll(root, function (n) { return n.tag === 'style'; });
  var tokens = {};
  for (var i = 0; i < styles.length; i++) {
    var cssText = ast.textContent(styles[i]);
    // Strip `[data-theme="dark"] { ... }` blocks so we capture light-mode root tokens
    var lightCss = cssText.replace(/\[data-theme=["']dark["']\][\s\S]*?\}/g, '');
    var accMatch = lightCss.match(/--accent\s*:\s*([^;}\n]+)/);
    var tealMatch = lightCss.match(/--teal\s*:\s*([^;}\n]+)/);
    if (accMatch && !tokens.accent) {
      var av = accMatch[1].trim();
      if (av.indexOf('var(') === -1) tokens.accent = av;
    }
    if (tealMatch && !tokens.teal) {
      var tv = tealMatch[1].trim();
      if (tv.indexOf('var(') === -1) tokens.teal = tv;
    }
  }
  return tokens;
}

function extractLocalSandboxAssets(root) {
  var links = ast.findAll(root, function (n) { return n.tag === 'link' && ast.getAttr(n, 'rel') === 'stylesheet'; });
  var scripts = ast.findAll(root, function (n) { return n.tag === 'script'; });
  var localStyles = [];
  var localScripts = [];
  var inlineScriptSnippets = [];

  for (var i = 0; i < links.length; i++) {
    var href = ast.getAttr(links[i], 'href').split('?')[0].trim();
    if (!href || /^https?:\/\//i.test(href) || href.indexOf('assets/') !== -1) continue;
    localStyles.push(inline.normalizeAssetPath(href));
  }

  for (var j = 0; j < scripts.length; j++) {
    var sNode = scripts[j];
    var src = ast.getAttr(sNode, 'src').split('?')[0].trim();
    if (src) {
      if (/^https?:\/\//i.test(src) || src.indexOf('assets/') !== -1) continue;
      localScripts.push(inline.normalizeAssetPath(src));
    } else {
      var code = ast.textContent(sNode).trim();
      if (code && code.indexOf('data-genesis-mode') === -1) {
        inlineScriptSnippets.push(code);
      }
    }
  }

  return {
    localStyles: localStyles,
    localScripts: localScripts,
    hasInlineScript: inlineScriptSnippets.length > 0,
    inlineScriptCount: inlineScriptSnippets.length
  };
}

function inferDateFromText(text, fallbackDate) {
  if (fallbackDate) return fallbackDate;
  var m = String(text || '').match(/\b(202\d-\d{2}-\d{2})\b/);
  return m ? m[1] : '2026-01-01';
}

function extractHeroMeta(root, options) {
  var opts = options || {};
  var treeMeta = opts.treeMeta || {};
  var htmlEl = ast.findFirst(root, function (n) { return n.tag === 'html'; });
  var titleEl = ast.findFirst(root, function (n) { return n.tag === 'title'; });
  var descMeta = ast.findFirst(root, function (n) {
    return n.tag === 'meta' && ast.getAttr(n, 'name').toLowerCase() === 'description';
  });

  var hero = ast.findFirst(root, function (n) {
    return (n.tag === 'header' || n.tag === 'section' || n.tag === 'div') && ast.hasClass(n, 'hero');
  });

  var meta = {
    title: '',
    eyebrow: '',
    brand: '',
    date: treeMeta.date || '',
    strict_i18n: Boolean(htmlEl && ast.getAttr(htmlEl, 'data-present-i18n') === 'strict'),
    strict_density: htmlEl ? ast.getAttr(htmlEl, 'data-section-density') !== 'relaxed' : true,
    lead: '',
    hero_actions: [],
    panel_label: '',
    panel_title: '',
    panel_desc: '',
    panel: [],
    metrics: [],
    style: extractCssRootTokens(root)
  };

  if (!meta.style.accent && treeMeta.color) {
    meta.style.accent = treeMeta.color;
  }

  if (hero) {
    var brandEl = ast.findFirst(hero, function (n) { return ast.hasClass(n, 'brand'); });
    if (brandEl) {
      var brandSpan = ast.findFirst(brandEl, function (n) {
        return n.tag === 'span' && !ast.hasClass(n, 'brand-mark');
      });
      meta.brand = brandSpan
        ? inline.extractBilingualElement(brandSpan)
        : ast.cleanWhitespace(ast.textContent(brandEl));
    }

    var heroCopy = ast.findFirst(hero, function (n) { return ast.hasClass(n, 'hero-copy'); }) || hero;
    var eyebrowEl = ast.findFirst(heroCopy, function (n) { return ast.hasClass(n, 'eyebrow'); });
    if (eyebrowEl) {
      meta.eyebrow = inline.extractBilingualElement(eyebrowEl);
      meta.date = inferDateFromText(meta.eyebrow, meta.date);
    }

    var h1El = ast.findFirst(heroCopy, function (n) { return n.tag === 'h1'; });
    if (h1El) {
      meta.title = inline.extractBilingualElement(h1El);
    }

    // Lead paragraph: first `<p>` inside `.hero-copy` that is not `.eyebrow` or `.hero-note`
    var copyKids = ast.elementChildren(heroCopy);
    for (var c = 0; c < copyKids.length; c++) {
      var ck = copyKids[c];
      if (ck.tag === 'p' && !ast.hasClass(ck, 'eyebrow') && !ast.hasClass(ck, 'hero-note') && !ast.hasClass(ck, 'section-kicker')) {
        meta.lead = inline.extractBilingualElement(ck);
        break;
      }
    }

    var actionsWrap = ast.findFirst(heroCopy, function (n) { return ast.hasClass(n, 'hero-actions'); });
    if (actionsWrap) {
      var actionLinks = ast.findAll(actionsWrap, function (n) { return n.tag === 'a'; });
      for (var a = 0; a < actionLinks.length; a++) {
        var aLabel = inline.extractBilingualElement(actionLinks[a]).replace(/(?<!\|)\|(?!\|)/g, '｜');
        var aHref = ast.getAttr(actionLinks[a], 'href').trim();
        if (aLabel && aHref) {
          meta.hero_actions.push(aLabel + ' | ' + aHref);
        }
      }
    }

    var heroPanel = ast.findFirst(hero, function (n) { return ast.hasClass(n, 'hero-panel'); });
    if (heroPanel) {
      var pLabelEl = ast.findFirst(heroPanel, function (n) { return ast.hasClass(n, 'panel-label'); });
      if (pLabelEl) meta.panel_label = inline.extractBilingualElement(pLabelEl);

      var pTitleEl = ast.findFirst(heroPanel, function (n) { return n.tag === 'h2' || n.tag === 'h3'; });
      if (pTitleEl) meta.panel_title = inline.extractBilingualElement(pTitleEl);

      var panelKids = ast.elementChildren(heroPanel);
      for (var pk = 0; pk < panelKids.length; pk++) {
        var pChild = panelKids[pk];
        if (pChild.tag === 'p' && !ast.hasClass(pChild, 'panel-label')) {
          meta.panel_desc = inline.extractBilingualElement(pChild);
          break;
        }
      }

      var layerList = ast.findFirst(heroPanel, function (n) { return n.tag === 'ul' || n.tag === 'ol'; });
      if (layerList) {
        var liNodes = ast.elementChildren(layerList).filter(function (n) { return n.tag === 'li'; });
        for (var liIdx = 0; liIdx < liNodes.length; liIdx++) {
          var liNode = liNodes[liIdx];
          var liText = inline.extractBilingualElement(liNode, { skipLayerNumber: true, stripLayerNumber: true });
          if (liText) {
            meta.panel.push(liText);
          }
        }
      }
    }

    var metricsWrap = ast.findFirst(hero, function (n) {
      return ast.hasAnyClass(n, ['hero-metrics', 'metric-row', 'metrics-grid']);
    });
    if (metricsWrap) {
      var metricCards = ast.findAll(metricsWrap, function (n) { return ast.hasClass(n, 'metric'); });
      for (var m = 0; m < metricCards.length; m++) {
        var mc = metricCards[m];
        var mLabelEl = ast.findFirst(mc, function (n) { return ast.hasClass(n, 'metric-label'); });
        var mStrongEl = ast.findFirst(mc, function (n) { return n.tag === 'strong' || ast.hasClass(n, 'metric-value'); });
        var mNoteEl = ast.findFirst(mc, function (n) {
          return (n.tag === 'span' || n.tag === 'p') && !ast.hasClass(n, 'metric-label') && n !== mStrongEl;
        });
        var mLabel = mLabelEl ? inline.extractBilingualElement(mLabelEl) : '';
        var mVal = mStrongEl ? inline.extractBilingualElement(mStrongEl) : '';
        var mNote = mNoteEl ? inline.extractBilingualElement(mNoteEl) : '';
        mLabel = mLabel.replace(/(?<!\|)\|(?!\|)/g, '｜');
        mVal = mVal.replace(/(?<!\|)\|(?!\|)/g, '｜');
        mNote = mNote.replace(/(?<!\|)\|(?!\|)/g, '｜');
        if (mLabel || mVal) {
          meta.metrics.push(mLabel + ' | ' + mVal + ' | ' + mNote);
        }
      }
    }
  }

  // Fallbacks for non-hero standalone prototype/arena pages
  if (!meta.title) {
    if (treeMeta.title && treeMeta.title.zh) {
      meta.title = inline.formatBilingualPair(treeMeta.title.zh, treeMeta.title.en);
    } else if (titleEl) {
      meta.title = ast.cleanWhitespace(ast.textContent(titleEl));
    } else {
      meta.title = opts.slug || 'Study Room Article';
    }
  }
  if (!meta.lead) {
    if (treeMeta.summary && treeMeta.summary.zh) {
      meta.lead = inline.formatBilingualPair(treeMeta.summary.zh, treeMeta.summary.en);
    } else if (descMeta) {
      meta.lead = ast.cleanWhitespace(ast.getAttr(descMeta, 'content'));
    }
  }
  if (!meta.brand) {
    meta.brand = treeMeta.topicLabel || 'Study Room';
  }
  if (!meta.eyebrow) {
    meta.eyebrow = (treeMeta.tags && treeMeta.tags.length > 0) ? treeMeta.tags.slice(0, 3).join(' · ') : 'Study Room Knowledge';
  }
  if (!meta.date) {
    meta.date = '2026-01-01';
  }

  return meta;
}

function serializeFrontmatter(meta, sandboxMeta) {
  var lines = ['---'];
  lines.push('title: ' + quoteYamlScalar(meta.title));
  if (meta.eyebrow) lines.push('eyebrow: ' + quoteYamlScalar(meta.eyebrow));
  if (meta.brand) lines.push('brand: ' + quoteYamlScalar(meta.brand));
  if (meta.date) lines.push('date: ' + quoteYamlScalar(meta.date));
  lines.push('strict_i18n: ' + (meta.strict_i18n ? 'true' : 'false'));
  lines.push('strict_density: ' + (meta.strict_density ? 'true' : 'false'));
  if (meta.lead) lines.push('lead: ' + quoteYamlScalar(meta.lead));

  if (Array.isArray(meta.hero_actions) && meta.hero_actions.length > 0) {
    lines.push('hero_actions:');
    meta.hero_actions.forEach(function (act) {
      lines.push('  - ' + quoteYamlScalar(act));
    });
  }

  if (meta.panel_label) lines.push('panel_label: ' + quoteYamlScalar(meta.panel_label));
  if (meta.panel_title) lines.push('panel_title: ' + quoteYamlScalar(meta.panel_title));
  if (meta.panel_desc) lines.push('panel_desc: ' + quoteYamlScalar(meta.panel_desc));
  if (Array.isArray(meta.panel) && meta.panel.length > 0) {
    lines.push('panel:');
    meta.panel.forEach(function (item) {
      lines.push('  - ' + quoteYamlScalar(item));
    });
  }

  if (Array.isArray(meta.metrics) && meta.metrics.length > 0) {
    lines.push('metrics:');
    meta.metrics.forEach(function (m) {
      lines.push('  - ' + quoteYamlScalar(m));
    });
  }

  if (meta.style && (meta.style.accent || meta.style.teal)) {
    lines.push('style:');
    if (meta.style.accent) lines.push('  accent: ' + quoteYamlScalar(meta.style.accent));
    if (meta.style.teal) lines.push('  teal: ' + quoteYamlScalar(meta.style.teal));
  }

  if (sandboxMeta && (sandboxMeta.localScripts.length > 0 || sandboxMeta.localStyles.length > 0 || sandboxMeta.hasInlineScript)) {
    if (sandboxMeta.localScripts.length > 0) {
      lines.push('custom_scripts:');
      sandboxMeta.localScripts.forEach(function (s) {
        lines.push('  - ' + quoteYamlScalar(s));
      });
    }
    if (sandboxMeta.localStyles.length > 0) {
      lines.push('custom_styles:');
      sandboxMeta.localStyles.forEach(function (s) {
        lines.push('  - ' + quoteYamlScalar(s));
      });
    }
  }

  lines.push('---');
  return lines.join('\n');
}

module.exports = {
  quoteYamlScalar: quoteYamlScalar,
  extractHeroMeta: extractHeroMeta,
  extractLocalSandboxAssets: extractLocalSandboxAssets,
  serializeFrontmatter: serializeFrontmatter
};

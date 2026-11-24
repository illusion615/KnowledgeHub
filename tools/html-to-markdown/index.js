// tools/html-to-markdown/index.js
// Orchestrates reverse compilation of Study Room `<section class="section">` articles
// (plus standalone prototype/arena workbenches) into 100% Genesis-compatible Extended Markdown.

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var ast = require('./html-ast');
var inline = require('./inline-converter');
var heroExtractor = require('./hero-extractor');
var blockConverter = require('./block-converter');

var PROTECTED_NATIVE_SLUGS = {
  'markdown-genesis-lab': true,
  'copilot-studio-managed-runtime-alm': true,
  'local-music-song-models': true,
  'claw-code-analysis': true
};

function loadKnowledgeTreeMap(repoRoot) {
  var ktPath = path.join(repoRoot, 'assets', 'knowledge-data.js');
  if (!fs.existsSync(ktPath)) return {};
  var code = fs.readFileSync(ktPath, 'utf8');
  var sandbox = {};
  vm.runInNewContext(code, sandbox);
  var tree = sandbox.knowledgeTree || [];
  var topicsById = {};
  var articlesBySlug = {};

  tree.forEach(function (node) {
    if (node.type === 'topic') {
      topicsById[node.id] = node;
    }
  });

  tree.forEach(function (node) {
    if (node.type === 'article' && node.url) {
      var parts = String(node.url).split('/');
      var slug = parts[0] === 'posts' ? parts[1] : node.id;
      var parentTopic = topicsById[node.parentId];
      var topicLabel = parentTopic && parentTopic.label
        ? inline.formatBilingualPair(parentTopic.label.zh, parentTopic.label.en)
        : '';
      articlesBySlug[slug] = Object.assign({}, node, {
        slug: slug,
        topicLabel: topicLabel
      });
    }
  });

  return articlesBySlug;
}

function discoverMediaFigureSpecs(articleDir) {
  if (!articleDir) return [];
  var mediaDir = path.join(articleDir, 'media');
  if (!fs.existsSync(mediaDir)) return [];
  return fs.readdirSync(mediaDir)
    .filter(function (f) { return /\.(?:figure|diagram)\.json$/i.test(f); })
    .sort();
}

function formatSectionHeadingLine(secNode, secIdx) {
  var numStr = secIdx < 10 ? '0' + secIdx : String(secIdx);
  var rawId = ast.getAttr(secNode, 'id').trim();
  // Ensure section ID matches Genesis `#([a-zA-Z][\w-]*)` rule
  var validId = '';
  if (rawId && /^[a-zA-Z][\w-]*$/.test(rawId)) {
    validId = rawId;
  } else if (rawId) {
    validId = 'sec-' + rawId.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '');
  } else {
    validId = 'section-' + secIdx;
  }

  var headEl = ast.findFirst(secNode, function (n) { return ast.hasClass(n, 'section-head'); });
  var kickerEl = headEl ? ast.findFirst(headEl, function (n) { return ast.hasClass(n, 'section-kicker'); }) : null;
  var h2El = (headEl && ast.findFirst(headEl, function (n) { return n.tag === 'h2'; })) ||
    ast.findFirst(secNode, function (n) { return n.tag === 'h2' || n.tag === 'h1'; });

  var kickerText = '';
  if (kickerEl) {
    // Prefer English kicker when available, or clean single-string kicker without `||`
    var kEn = ast.getAttr(kickerEl, 'data-en');
    var kZh = ast.getAttr(kickerEl, 'data-zh') || ast.cleanWhitespace(ast.textContent(kickerEl));
    kickerText = ast.cleanWhitespace(kEn || kZh).replace(/::/g, ' - ').replace(/\|\|/g, ' / ');
  }

  var titlePair = '';
  if (h2El) {
    var zhAttr = ast.getAttr(h2El, 'data-zh');
    var enAttr = ast.getAttr(h2El, 'data-en');
    if (zhAttr || enAttr) {
      var zhClean = inline.convertHtmlSnippetToInline(zhAttr || ast.textContent(h2El)).replace(/^\d+\.\s+/, '').trim();
      var enClean = enAttr ? inline.convertHtmlSnippetToInline(enAttr).replace(/^\d+\.\s+/, '').trim() : '';
      titlePair = inline.formatBilingualPair(zhClean, enClean);
    } else {
      titlePair = inline.extractBilingualElement(h2El).replace(/^\d+\.\s+/, '').trim();
    }
  }

  if (!titlePair) {
    titlePair = inline.formatBilingualPair(
      ast.getAttr(secNode, 'data-present-title-zh') || ast.getAttr(secNode, 'data-step-title') || ('章节 ' + secIdx),
      ast.getAttr(secNode, 'data-present-title-en') || ast.getAttr(secNode, 'data-step-title-en') || ('Section ' + secIdx)
    );
  }

  if (validId === 'references' && !/参考|reference|bibliography|来源/i.test(titlePair)) {
    titlePair = '参考来源 || References';
  }

  if (!kickerText) {
    var enSide = titlePair.indexOf('||') !== -1 ? titlePair.split('||')[1].trim() : titlePair;
    kickerText = numStr + ' / ' + enSide;
  } else if (!/^\d+\s*\//.test(kickerText)) {
    kickerText = numStr + ' / ' + kickerText;
  }

  // Extract section lead `<p>` inside `.section-head`
  var leadMd = '';
  if (headEl) {
    var headKids = ast.elementChildren(headEl);
    for (var i = 0; i < headKids.length; i++) {
      var hk = headKids[i];
      if (hk.tag === 'p' && !ast.hasClass(hk, 'section-kicker')) {
        leadMd = inline.extractBilingualElement(hk);
        break;
      }
    }
  }

  return {
    id: validId,
    headingLine: '## #' + validId + ' ' + kickerText + ' :: ' + titlePair,
    leadMd: leadMd
  };
}

function sanitizeReverseMarkdownForGenesis(mdText) {
  // Ensure any stray bare `---` inside list/paragraph does not split unexpected slide breaks,
  // and collapse >2 consecutive blank lines into double newlines.
  return String(mdText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function convertHtmlArticleToMarkdown(htmlString, options) {
  var opts = options || {};
  var slug = opts.slug || 'article';
  var root = ast.parseHtml(htmlString);
  var sandboxAssets = heroExtractor.extractLocalSandboxAssets(root);
  var meta = heroExtractor.extractHeroMeta(root, {
    slug: slug,
    treeMeta: opts.treeMeta || {}
  });

  var frontmatterText = heroExtractor.serializeFrontmatter(meta, sandboxAssets);
  var sections = ast.findAll(root, function (n) {
    return n.tag === 'section' && (ast.hasClass(n, 'section') || ast.hasClass(n, 'resource-section'));
  });

  var ctx = {
    slug: slug,
    sandboxAssets: sandboxAssets,
    attachedPrimaryAssets: false,
    sandboxCounter: 0,
    figureSpecs: discoverMediaFigureSpecs(opts.articleDir)
  };

  var chapterBlocks = [];

  if (sections.length > 0) {
    sections.forEach(function (secNode, idx) {
      var secInfo = formatSectionHeadingLine(secNode, idx + 1);
      var parts = [secInfo.headingLine];
      if (secInfo.leadMd) {
        parts.push(secInfo.leadMd);
      }

      if (secInfo.id === 'references') {
        var bibList = ast.findFirst(secNode, function (n) { return ast.hasClass(n, 'bib-list') || n.tag === 'ol' || n.tag === 'ul'; });
        if (bibList) {
          var bibMd = blockConverter.convertBlockNode(bibList, ctx);
          if (bibMd) parts.push(bibMd);
        } else {
          var refBody = blockConverter.convertChildBlocks(secNode, ctx);
          if (refBody) parts.push(refBody);
        }
      } else {
        var bodyMd = blockConverter.convertChildBlocks(secNode, ctx);
        if (bodyMd) parts.push(bodyMd);
      }

      chapterBlocks.push(parts.join('\n\n'));
    });
  } else {
    // Full-viewport interactive prototype / app workbench without `<section class="section">`
    var titlePlain = meta.title.split('||')[0].trim();
    var demoHeading = '## #interactive-workbench 01 / Interactive Workbench :: ' + meta.title;
    var sAttrs = {
      id: slug + '-workbench',
      canvas: Boolean(ast.findFirst(root, function (n) { return n.tag === 'canvas'; })),
      title: meta.title
    };
    if (sandboxAssets.localScripts.length > 0 || sandboxAssets.localStyles.length > 0) {
      if (sandboxAssets.localScripts.length > 0) sAttrs.script = sandboxAssets.localScripts[0];
      if (sandboxAssets.localStyles.length > 0) sAttrs.style = sandboxAssets.localStyles[0];
      ctx.attachedPrimaryAssets = true;
    }

    var bodyEl = ast.findFirst(root, function (n) { return n.tag === 'body'; }) || root;
    var headingsFound = ast.findAll(bodyEl, function (n) { return /^h[1-4]$/.test(n.tag); })
      .map(function (h) { return inline.extractBilingualElement(h); })
      .filter(Boolean)
      .slice(0, 8);

    var summaryItems = headingsFound.length > 0
      ? headingsFound.map(function (h) { return '- ' + h; }).join('\n')
      : '';

    var sandboxBlock = [
      ':::sandbox' + blockConverter.formatDirectiveAttrs(sAttrs),
      meta.lead || (titlePlain + ' 全视口交互原型与动态工作台。 || Full-viewport interactive prototype workbench.'),
      ':::'
    ].join('\n');

    chapterBlocks.push(
      [demoHeading, meta.lead || '', sandboxBlock, summaryItems].filter(Boolean).join('\n\n')
    );
  }

  // Ensure if external scripts exist in `<head>`/`<body>` and no sandbox slot consumed them yet,
  // attach a declarative sandbox slot at the end of the relevant or final non-reference chapter
  if (!ctx.attachedPrimaryAssets && (sandboxAssets.localScripts.length > 0 || sandboxAssets.localStyles.length > 0)) {
    var attachIdx = chapterBlocks.length - 1;
    if (attachIdx > 0 && /^## #references\b/.test(chapterBlocks[attachIdx])) {
      attachIdx = attachIdx - 1;
    }
    if (attachIdx >= 0) {
      var extraAttrs = {
        id: slug + '-interactive-module',
        canvas: false,
        title: '页面交互增强模块 || Interactive Enhancement Module'
      };
      if (sandboxAssets.localScripts.length > 0) extraAttrs.script = sandboxAssets.localScripts[0];
      if (sandboxAssets.localStyles.length > 0) extraAttrs.style = sandboxAssets.localStyles[0];
      chapterBlocks[attachIdx] += '\n\n' + [
        ':::sandbox' + blockConverter.formatDirectiveAttrs(extraAttrs),
        '挂载同目录静态交互脚本与定制样式资源。 || Mounts sibling static interactive scripts and custom stylesheets.',
        ':::'
      ].join('\n');
      ctx.attachedPrimaryAssets = true;
    }
  }

  var fullMarkdown = sanitizeReverseMarkdownForGenesis(frontmatterText + '\n\n' + chapterBlocks.join('\n\n'));
  return {
    markdown: fullMarkdown,
    meta: meta,
    sectionCount: chapterBlocks.length,
    sandboxAssets: sandboxAssets
  };
}

module.exports = {
  PROTECTED_NATIVE_SLUGS: PROTECTED_NATIVE_SLUGS,
  loadKnowledgeTreeMap: loadKnowledgeTreeMap,
  convertHtmlArticleToMarkdown: convertHtmlArticleToMarkdown
};

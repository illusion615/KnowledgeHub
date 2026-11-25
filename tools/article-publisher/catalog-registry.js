// tools/article-publisher/catalog-registry.js
// Validates and idempotently registers/updates single-article entries in `assets/knowledge-data.js`.

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var fm = require('../markdown-compiler/frontmatter');
var navMeta = require('../docs-navigation-meta');

function stripInlineRefs(text) {
  return String(text || '')
    .replace(/\[(\d{1,3})\](?:\[(\d{1,3})\])*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampText(text, maxChars) {
  var clean = stripInlineRefs(text);
  if (clean.length <= maxChars) return clean;
  var sliced = clean.slice(0, maxChars - 1).replace(/[,;，；、\s]+$/, '');
  return sliced + '…';
}

function jsQuote(val) {
  return "'" + String(val || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ') + "'";
}

function deterministicPhase(slug) {
  var hash = 0;
  var s = String(slug || '');
  for (var i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  var normalized = (Math.abs(hash) % 60) / 10; // 0.0 .. 5.9
  return Number((normalized + 0.1).toFixed(1));
}

function loadKnowledgeCatalog(knowledgeDataPath) {
  var rawCode = fs.readFileSync(knowledgeDataPath, 'utf8');
  var sandbox = {};
  vm.runInNewContext(rawCode, sandbox);
  var tree = Array.isArray(sandbox.knowledgeTree) ? sandbox.knowledgeTree : [];
  var topics = {};
  var articlesBySlug = {};
  var articlesById = {};

  tree.forEach(function (node) {
    if (!node || !node.id) return;
    if (node.type === 'topic') {
      topics[node.id] = node;
    } else if (node.type === 'article') {
      articlesById[node.id] = node;
      var urlMatch = String(node.url || '').match(/^posts\/([^/]+)\//);
      var slug = urlMatch ? urlMatch[1] : node.id;
      articlesBySlug[slug] = node;
    }
  });

  return {
    rawCode: rawCode,
    tree: tree,
    topics: topics,
    articlesBySlug: articlesBySlug,
    articlesById: articlesById
  };
}

function deriveNodeFromFrontmatter(slug, meta, options, catalog) {
  var opts = options || {};
  var m = meta || {};
  var titlePair = fm.parseBilingual(m.title || slug);
  var leadPair = fm.parseBilingual(m.summary || m.lead || titlePair.zh);

  var topicCandidate = opts.topic || m.topic || m.parentId || navMeta.UNMAPPED_TOPIC_ROUTING[slug] || 'knowledge-hub-design-docs';
  if (!catalog.topics[topicCandidate]) {
    topicCandidate = catalog.topics['knowledge-hub-design-docs']
      ? 'knowledge-hub-design-docs'
      : Object.keys(catalog.topics)[0] || 'ai-project-practice';
  }

  var parentTopic = catalog.topics[topicCandidate] || {};
  var accentColor = (m.style && m.style.accent) || m.color || parentTopic.color || '#0d8f8c';
  var rawTags = Array.isArray(m.tags) && m.tags.length > 0
    ? m.tags.map(function (t) { return String(t).trim(); }).filter(Boolean)
    : ['Knowledge Hub', 'Study Room'];
  var rawRelations = Array.isArray(m.relations)
    ? m.relations.map(function (r) { return String(r).trim(); }).filter(Boolean)
    : [];
  var isoDate = /^\d{4}-\d{2}-\d{2}$/.test(String(m.date || '').trim())
    ? String(m.date).trim()
    : new Date().toISOString().slice(0, 10);

  return {
    id: slug,
    parentId: topicCandidate,
    type: 'article',
    title: {
      zh: stripInlineRefs(titlePair.zh || slug),
      en: stripInlineRefs(titlePair.en || titlePair.zh || slug)
    },
    summary: {
      zh: clampText(leadPair.zh || titlePair.zh, 96),
      en: clampText(leadPair.en || leadPair.zh || titlePair.en, 154)
    },
    tags: rawTags,
    date: isoDate,
    url: 'posts/' + slug + '/index.html',
    color: String(accentColor),
    phase: deterministicPhase(slug),
    speed: 0.84,
    relations: rawRelations
  };
}

function serializeArticleNode(node) {
  var lines = [
    '  {',
    '    id: ' + jsQuote(node.id) + ',',
    '    parentId: ' + jsQuote(node.parentId) + ',',
    "    type: 'article',",
    '    title: {',
    '      zh: ' + jsQuote(node.title.zh) + ',',
    '      en: ' + jsQuote(node.title.en),
    '    },',
    '    summary: {',
    '      zh: ' + jsQuote(node.summary.zh) + ',',
    '      en: ' + jsQuote(node.summary.en),
    '    },',
    '    tags: [' + (node.tags || []).map(jsQuote).join(', ') + '],',
    '    date: ' + jsQuote(node.date) + ',',
    '    url: ' + jsQuote(node.url) + ',',
    '    color: ' + jsQuote(node.color) + ',',
    '    phase: ' + node.phase + ', speed: ' + node.speed + (node.relations && node.relations.length ? ',' : '')
  ];
  if (node.relations && node.relations.length > 0) {
    lines.push('    relations: [' + node.relations.map(jsQuote).join(', ') + ']');
  }
  lines.push('  }');
  return lines.join('\n');
}

function appendNodeToKnowledgeCode(rawCode, node) {
  var normalized = String(rawCode).replace(/\r\n/g, '\n');
  var closingMatch = normalized.match(/\n\];\s*$/);
  if (!closingMatch) {
    throw new Error('Cannot locate closing `];` in assets/knowledge-data.js');
  }
  var prefix = normalized.slice(0, closingMatch.index).replace(/\s+$/, '');
  var needsComma = prefix.slice(-1) !== '[' && prefix.slice(-1) !== ',';
  var block = serializeArticleNode(node);
  return prefix + (needsComma ? ',' : '') + '\n' + block + '\n];\n';
}

function replaceExistingObjectFields(rawCode, nodeId, updates) {
  var idPattern = new RegExp("(\\{[\\s\\S]*?\\bid\\s*:\\s*['\"]" + nodeId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + "['\"][\\s\\S]*?\\n  \\})", 'm');
  var match = rawCode.match(idPattern);
  if (!match) return { updated: false, code: rawCode };

  var block = match[1];
  var nextBlock = block;
  if (updates.parentId) {
    nextBlock = nextBlock.replace(/(\bparentId\s*:\s*)(['"])([^'"]*)(\2)/, '$1' + jsQuote(updates.parentId));
  }
  if (updates.titleZh) {
    nextBlock = nextBlock.replace(/(title\s*:\s*\{\s*zh\s*:\s*)(['"])(?:\\.|(?!\2).)*(\2)/, '$1' + jsQuote(updates.titleZh));
  }
  if (updates.titleEn) {
    nextBlock = nextBlock.replace(/(title\s*:\s*\{[\s\S]*?\ben\s*:\s*)(['"])(?:\\.|(?!\2).)*(\2)/, '$1' + jsQuote(updates.titleEn));
  }
  if (updates.date) {
    nextBlock = nextBlock.replace(/(\bdate\s*:\s*)(['"])([^'"]*)(\2)/, '$1' + jsQuote(updates.date));
  }
  if (nextBlock === block) return { updated: false, code: rawCode };
  return {
    updated: true,
    code: rawCode.slice(0, match.index) + nextBlock + rawCode.slice(match.index + block.length)
  };
}

function ensureCatalogRegistration(repoRoot, slug, meta, options) {
  var opts = options || {};
  var kdPath = path.join(repoRoot, 'assets', 'knowledge-data.js');
  var catalog = loadKnowledgeCatalog(kdPath);

  if (opts.topic && !catalog.topics[opts.topic]) {
    return {
      ok: false,
      action: 'invalid_topic',
      error: 'Unknown topic id "' + opts.topic + '" in assets/knowledge-data.js',
      node: null,
      changed: false
    };
  }

  var existing = catalog.articlesBySlug[slug] || catalog.articlesById[slug] || null;
  if (existing) {
    var desiredUpdates = {};
    if (opts.topic && existing.parentId !== opts.topic) {
      desiredUpdates.parentId = opts.topic;
    }
    if (opts.syncMetadata && meta && meta.title) {
      var tp = fm.parseBilingual(meta.title);
      if (tp.zh && existing.title && existing.title.zh !== stripInlineRefs(tp.zh)) {
        desiredUpdates.titleZh = stripInlineRefs(tp.zh);
      }
      if (tp.en && existing.title && existing.title.en !== stripInlineRefs(tp.en)) {
        desiredUpdates.titleEn = stripInlineRefs(tp.en);
      }
    }
    if (Object.keys(desiredUpdates).length > 0) {
      var patched = replaceExistingObjectFields(catalog.rawCode, existing.id, desiredUpdates);
      if (patched.updated) {
        if (!opts.dryRun && !opts.statusOnly) {
          fs.writeFileSync(kdPath, patched.code, 'utf8');
        }
        return {
          ok: true,
          action: 'updated',
          changed: true,
          node: Object.assign({}, existing, desiredUpdates.parentId ? { parentId: desiredUpdates.parentId } : {})
        };
      }
    }
    return {
      ok: true,
      action: 'unchanged',
      changed: false,
      node: existing
    };
  }

  if (opts.skipRegister) {
    return {
      ok: true,
      action: 'skipped',
      changed: false,
      node: null
    };
  }

  var derivedNode = deriveNodeFromFrontmatter(slug, meta, opts, catalog);
  var nextCode = appendNodeToKnowledgeCode(catalog.rawCode, derivedNode);
  if (!opts.dryRun && !opts.statusOnly) {
    fs.writeFileSync(kdPath, nextCode, 'utf8');
  }
  return {
    ok: true,
    action: 'registered',
    changed: true,
    node: derivedNode
  };
}

module.exports = {
  loadKnowledgeCatalog: loadKnowledgeCatalog,
  deriveNodeFromFrontmatter: deriveNodeFromFrontmatter,
  serializeArticleNode: serializeArticleNode,
  ensureCatalogRegistration: ensureCatalogRegistration
};

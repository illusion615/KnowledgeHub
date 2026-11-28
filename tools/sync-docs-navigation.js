#!/usr/bin/env node
// tools/sync-docs-navigation.js
// Generates `docs/navigation.json` directly from Study Room's native `assets/knowledge-data.js`
// knowledge graph (Domains -> Topic Series -> `posts/<slug>/article.md`), plus unmapped specialty
// articles and platform engineering/governance docs, 100% aligned with Delivery Board's navigation contract.

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var navMeta = require('./docs-navigation-meta');

var REPO_ROOT = path.resolve(__dirname, '..');
var OUTPUT_PATH = path.join(REPO_ROOT, 'docs', 'navigation.json');

var IGNORED_DIRS = {
  node_modules: true, vendor: true, dist: true, build: true, coverage: true,
  __pycache__: true, venv: true, target: true, bin: true, obj: true, logs: true,
  backups: true, 'execution-traces': true, credentials: true, secrets: true,
  private: true, data: true, uploads: true, attachments: true, shards: true, tmp: true
};

function sanitizeNodeId(prefix, raw, usedIds) {
  var base = (prefix ? prefix + '-' : '') + String(raw || 'node')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!/^[a-z]/.test(base)) base = 'n-' + base;
  base = base.slice(0, 56).replace(/-+$/g, '');
  var candidate = base;
  var seq = 2;
  while (usedIds.has(candidate)) {
    var suffix = '-' + seq++;
    candidate = base.slice(0, 63 - suffix.length) + suffix;
  }
  usedIds.add(candidate);
  return candidate;
}

function walkWorkspaceMarkdownFiles(rootDir) {
  var found = [];

  function walk(curDir, depth) {
    if (depth > 6) return;
    var entries = fs.readdirSync(curDir, { withFileTypes: true }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    for (var i = 0; i < entries.length; i++) {
      var ent = entries[i];
      if (ent.name.charAt(0) === '.' || IGNORED_DIRS[ent.name]) continue;
      var abs = path.join(curDir, ent.name);
      var lstat = fs.lstatSync(abs);
      if (lstat.isSymbolicLink()) continue;
      if (lstat.isDirectory()) {
        walk(abs, depth + 1);
      } else if (lstat.isFile()) {
        var ext = path.extname(ent.name).toLowerCase();
        if (ext === '.md' || ext === '.mdx' || ext === '.rst' || ext === '.adoc') {
          var rel = path.relative(rootDir, abs).split(path.sep).join('/');
          if (rel !== 'docs/navigation.json') found.push(rel);
        }
      }
    }
  }

  walk(rootDir, 0);
  return found;
}

function resolveCommonGitRoot(repoRoot) {
  try {
    var dotGit = path.join(repoRoot, '.git');
    if (fs.existsSync(dotGit) && fs.lstatSync(dotGit).isFile()) {
      var gitdirLine = fs.readFileSync(dotGit, 'utf8').trim();
      var m = gitdirLine.match(/^gitdir:\s*(.+)$/i);
      if (m) {
        var absGitDir = path.resolve(repoRoot, m[1].trim());
        var commondirFile = path.join(absGitDir, 'commondir');
        if (fs.existsSync(commondirFile)) {
          var commonGitDir = path.resolve(absGitDir, fs.readFileSync(commondirFile, 'utf8').trim());
          if (path.basename(commonGitDir) === '.git') {
            return path.dirname(commonGitDir);
          }
        }
      }
    }
  } catch (_err) {
    // Ignore worktree discovery errors and stay local
  }
  return null;
}

function loadExistingLeafCatalog(navPath) {
  var byPath = new Map();
  if (!fs.existsSync(navPath)) return byPath;
  try {
    var parsed = JSON.parse(fs.readFileSync(navPath, 'utf8'));
    var visit = function (nodes, chain) {
      (nodes || []).forEach(function (n) {
        if (!n) return;
        if (n.path) {
          byPath.set(n.path, { leaf: n, parentIds: chain.slice() });
        }
        if (Array.isArray(n.children)) {
          visit(n.children, chain.concat(n.id || ''));
        }
      });
    };
    visit(parsed.nodes, []);
  } catch (err) {
    if (process.env.DEBUG) {
      console.warn('loadExistingLeafCatalog fallback:', err && err.message ? err.message : err);
    }
  }
  return byPath;
}

function loadKnownGoals() {
  var candidates = [path.join(REPO_ROOT, '.project-data', 'delivery-board', 'assets.json')];
  var mainRepoRoot = resolveCommonGitRoot(REPO_ROOT);
  if (mainRepoRoot && mainRepoRoot !== REPO_ROOT) {
    candidates.push(path.join(mainRepoRoot, '.project-data', 'delivery-board', 'assets.json'));
  }
  var assetsPath = candidates.find(function (p) { return fs.existsSync(p); });
  var known = new Set();
  if (!assetsPath) return known;
  try {
    var assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    var domains = (assets.business_model && assets.business_model.domains) || assets.domains || [];
    domains.forEach(function (dom) {
      if (dom && dom.id) known.add(dom.id);
      (dom.modules || []).forEach(function (mod) {
        if (mod && mod.id) known.add(mod.id);
        (mod.requirements || []).forEach(function (req) {
          if (req && req.id) known.add(req.id);
        });
      });
    });
  } catch (err) {
    if (process.env.DEBUG) {
      console.warn('loadKnownGoals fallback:', err && err.message ? err.message : err);
    }
  }
  return known;
}

function buildNavigationManifest(options) {
  var opts = options || {};
  var repoRoot = path.resolve(opts.repoRoot || REPO_ROOT);
  var outputPath = opts.outputPath || path.join(repoRoot, 'docs', 'navigation.json');
  var ktCode = fs.readFileSync(path.join(repoRoot, 'assets', 'knowledge-data.js'), 'utf8');
  var sandbox = {};
  vm.runInNewContext(ktCode, sandbox);
  var tree = (sandbox.knowledgeTree || []).slice();

  tree.push(
    {
      id: 'edu-admissions-planning',
      parentId: 'education-planning',
      type: 'topic',
      label: { zh: '升学政策与自招规划', en: 'Admissions & Planning' }
    },
    {
      id: 'edu-asset-strategy',
      parentId: 'education-planning',
      type: 'topic',
      label: { zh: '空间规划与资产策略', en: 'Spatial & Asset Strategy' }
    }
  );

  var topicsById = {};
  var childrenByParent = {};
  var mappedSlugs = new Set();

  tree.forEach(function (node) {
    if (node.type === 'topic') topicsById[node.id] = node;
    var pid = node.parentId || '__ROOT__';
    if (!childrenByParent[pid]) childrenByParent[pid] = [];
    childrenByParent[pid].push(node);
    if (node.type === 'article' && node.url) {
      var segs = String(node.url).split('/');
      if (segs[0] === 'posts' && segs[1]) mappedSlugs.add(segs[1]);
    }
  });

  var existingCatalog = loadExistingLeafCatalog(outputPath);
  var mainRepoRoot = repoRoot === REPO_ROOT ? resolveCommonGitRoot(repoRoot) : null;

  var postSlugsSet = new Set(fs.readdirSync(path.join(repoRoot, 'posts')).filter(function (d) {
    return fs.existsSync(path.join(repoRoot, 'posts', d, 'article.md'));
  }));
  Object.keys(navMeta.UNMAPPED_TOPIC_ROUTING).forEach(function (privSlug) {
    var relMd = 'posts/' + privSlug + '/article.md';
    if (existingCatalog.has(relMd) || (mainRepoRoot && fs.existsSync(path.join(mainRepoRoot, relMd)))) {
      postSlugsSet.add(privSlug);
    }
  });
  var postSlugs = Array.from(postSlugsSet).sort();

  function inferUnmappedTopic(slug) {
    if (
      slug.indexOf('ignite-2026-') === 0 ||
      slug === 'copilot-studio-ignite-2026-whats-new' ||
      slug === 'from-build-to-production-harness-managed-runtime'
    ) {
      return 'ignite-2026';
    }
    return navMeta.UNMAPPED_TOPIC_ROUTING[slug] || 'knowledge-hub-design-docs';
  }

  postSlugs.forEach(function (slug) {
    if (mappedSlugs.has(slug)) return;
    var targetTopic = inferUnmappedTopic(slug);
    if (!childrenByParent[targetTopic]) childrenByParent[targetTopic] = [];
    var relMd = 'posts/' + slug + '/article.md';
    var preserved = existingCatalog.get(relMd);
    var resolvedTitle = fs.existsSync(path.join(repoRoot, relMd))
      ? navMeta.extractCleanMarkdownTitle(repoRoot, relMd)
      : (mainRepoRoot && fs.existsSync(path.join(mainRepoRoot, relMd))
        ? navMeta.extractCleanMarkdownTitle(mainRepoRoot, relMd)
        : (preserved && preserved.leaf && preserved.leaf.title ? preserved.leaf.title : slug));
    childrenByParent[targetTopic].push({
      id: slug,
      parentId: targetTopic,
      type: 'article',
      url: 'posts/' + slug + '/index.html',
      title: { zh: resolvedTitle }
    });
  });

  var allMdFilesSet = new Set(walkWorkspaceMarkdownFiles(repoRoot));
  existingCatalog.forEach(function (_entry, relPath) {
    if (!allMdFilesSet.has(relPath)) {
      var segs = relPath.split('/');
      var privSlug = segs[0] === 'posts' ? segs[1] : null;
      var existsLocallyOrMain = fs.existsSync(path.join(repoRoot, relPath)) ||
        Boolean(mainRepoRoot && fs.existsSync(path.join(mainRepoRoot, relPath)));
      if (privSlug && navMeta.UNMAPPED_TOPIC_ROUTING[privSlug]) {
        allMdFilesSet.add(relPath);
      } else if (relPath === 'shanghai-zhongkao-data-report.md' && (repoRoot === REPO_ROOT || existsLocallyOrMain)) {
        allMdFilesSet.add(relPath);
      }
    }
  });
  var allMdFiles = Array.from(allMdFilesSet).sort(function (a, b) { return a.localeCompare(b); });
  var availableSet = new Set(allMdFiles);
  var supportDocsBySlug = {};
  allMdFiles.forEach(function (relPath) {
    if (relPath.indexOf('posts/') !== 0) return;
    var segs = relPath.split('/');
    var slug = segs[1];
    if (!slug || relPath === 'posts/' + slug + '/article.md') return;
    if (!supportDocsBySlug[slug]) supportDocsBySlug[slug] = [];
    supportDocsBySlug[slug].push(relPath);
  });
  var registeredPaths = new Set();
  var usedIds = new Set();
  var knownGoals = repoRoot === REPO_ROOT ? loadKnownGoals() : new Set();

  var DOMAIN_ICONS = {
    'ai-engineering-practice': '🧠 ',
    'microsoft-ai': '☁️ ',
    'ai-project-practice': '🚀 ',
    'education-planning': '📐 '
  };

  function buildTopicChain(topicId) {
    var chain = [];
    var cur = topicId;
    while (cur && topicsById[cur]) {
      chain.unshift(cur);
      cur = topicsById[cur].parentId;
    }
    return chain;
  }

  function buildTopicSubtree(topicNode, orderIdx, isRootDomain) {
    var rawKids = childrenByParent[topicNode.id] || [];
    var navChildren = [];
    var childOrder = 1;

    rawKids.filter(function (k) { return k.type === 'topic'; }).forEach(function (subTopic) {
      var builtSub = buildTopicSubtree(subTopic, childOrder, false);
      if (builtSub) {
        navChildren.push(builtSub);
        childOrder++;
      }
    });

    rawKids.filter(function (k) { return k.type === 'article'; }).forEach(function (art) {
      var slug = String(art.url || '').split('/')[1] || art.id;
      var mdRel = 'posts/' + slug + '/article.md';
      if (!availableSet.has(mdRel) || registeredPaths.has(mdRel)) return;
      registeredPaths.add(mdRel);

      var topicChain = buildTopicChain(topicNode.id);
      var zhTitle = (art.title && art.title.zh)
        ? art.title.zh
        : navMeta.extractCleanMarkdownTitle(repoRoot, mdRel);
      var goalIds = navMeta.resolveGoalIds(slug, topicChain, knownGoals);
      var supportPaths = (supportDocsBySlug[slug] || []).filter(function (sp) {
        return !registeredPaths.has(sp);
      });

      if (supportPaths.length === 0) {
        navChildren.push({
          id: sanitizeNodeId('art', slug, usedIds),
          title: zhTitle,
          order: childOrder++,
          path: mdRel,
          audience: 'human',
          doc_class: 'high_level_design',
          diataxis: ['explanation'],
          component_ids: ['markdown-article', 'knowledge-catalog'],
          goal_ids: goalIds
        });
        return;
      }

      var bundleChildren = [{
        id: sanitizeNodeId('art', slug, usedIds),
        title: zhTitle,
        order: 1,
        path: mdRel,
        audience: 'human',
        doc_class: 'high_level_design',
        diataxis: ['explanation'],
        component_ids: ['markdown-article', 'knowledge-catalog'],
        goal_ids: goalIds
      }];

      supportPaths.forEach(function (supRel, supIdx) {
        registeredPaths.add(supRel);
        var supRoot = fs.existsSync(path.join(repoRoot, supRel))
          ? repoRoot
          : (mainRepoRoot && fs.existsSync(path.join(mainRepoRoot, supRel)) ? mainRepoRoot : repoRoot);
        var supMeta = navMeta.inferArticleSupportMeta(supRoot, supRel, slug, topicChain, knownGoals);
        var preservedSup = existingCatalog.get(supRel);
        if (!fs.existsSync(path.join(supRoot, supRel)) && preservedSup && preservedSup.leaf && preservedSup.leaf.title) {
          supMeta.title = preservedSup.leaf.title;
        }
        var relInsideSlug = supRel.slice(('posts/' + slug + '/').length).replace(/\.[^.]+$/, '');
        bundleChildren.push({
          id: sanitizeNodeId('sup', slug + '-' + relInsideSlug, usedIds),
          title: supMeta.title,
          order: supIdx + 2,
          path: supRel,
          audience: supMeta.audience,
          doc_class: supMeta.doc_class,
          diataxis: supMeta.diataxis,
          component_ids: supMeta.component_ids,
          goal_ids: supMeta.goal_ids
        });
      });

      navChildren.push({
        id: sanitizeNodeId('bundle', slug, usedIds),
        title: zhTitle,
        order: childOrder++,
        children: bundleChildren
      });
    });

    if (navChildren.length === 0) return null;

    var prefix = isRootDomain ? (DOMAIN_ICONS[topicNode.id] || '📚 ') : '';
    var labelZh = (topicNode.label && topicNode.label.zh) ? topicNode.label.zh : topicNode.id;
    var labelEn = (topicNode.label && topicNode.label.en && topicNode.label.en !== labelZh)
      ? ' (' + topicNode.label.en + ')'
      : '';

    return {
      id: sanitizeNodeId('topic', topicNode.id, usedIds),
      title: prefix + labelZh + (isRootDomain ? labelEn : ''),
      order: orderIdx,
      children: navChildren
    };
  }

  var rootNodes = [];
  var rootOrder = 1;

  (childrenByParent['__ROOT__'] || []).forEach(function (domTopic) {
    if (domTopic.type !== 'topic') return;
    var domNode = buildTopicSubtree(domTopic, rootOrder, true);
    if (domNode) {
      rootNodes.push(domNode);
      rootOrder++;
    }
  });

  var remainingFiles = allMdFiles.filter(function (p) { return !registeredPaths.has(p); });
  var engBuckets = [
    {
      id: 'eng-overview-entry',
      title: '项目总览与核心入口',
      match: function (p) { return p === 'README.md' || p === 'RELEASE.md' || (p.indexOf('/') === -1 && p !== 'AGENTS.md' && p !== 'CLAUDE.md'); },
      items: []
    },
    {
      id: 'eng-arch-specs',
      title: '平台架构规范与专项技术评估 (docs/)',
      match: function (p) { return p.indexOf('docs/') === 0 || p.indexOf('scripts/') === 0; },
      items: []
    },
    {
      id: 'eng-governance-contracts',
      title: '智能体协作宪章与创作反馈归档',
      match: function (p) { return p === 'AGENTS.md' || p === 'CLAUDE.md' || p.indexOf('authoring/') === 0; },
      items: []
    },
    {
      id: 'eng-test-benchmarks',
      title: '验证门禁、模型评测与实验记录 (tests/)',
      match: function () { return true; },
      items: []
    }
  ];

  remainingFiles.forEach(function (relPath) {
    registeredPaths.add(relPath);
    for (var b = 0; b < engBuckets.length; b++) {
      if (engBuckets[b].match(relPath)) {
        engBuckets[b].items.push(relPath);
        break;
      }
    }
  });

  var engChildren = [];
  var engSubOrder = 1;
  engBuckets.forEach(function (bucket) {
    if (bucket.items.length === 0) return;
    var leafNodes = bucket.items.map(function (relPath, idx) {
      var metaRoot = fs.existsSync(path.join(repoRoot, relPath))
        ? repoRoot
        : (mainRepoRoot && fs.existsSync(path.join(mainRepoRoot, relPath)) ? mainRepoRoot : repoRoot);
      var info = navMeta.inferEngineeringMeta(metaRoot, relPath, knownGoals);
      var preserved = existingCatalog.get(relPath);
      if (!fs.existsSync(path.join(metaRoot, relPath)) && preserved && preserved.leaf && preserved.leaf.title) {
        info.title = preserved.leaf.title;
      }
      return {
        id: sanitizeNodeId('doc', relPath.replace(/\.[^.]+$/, ''), usedIds),
        title: info.title,
        order: idx + 1,
        path: relPath,
        audience: info.audience,
        doc_class: info.doc_class,
        diataxis: info.diataxis,
        component_ids: info.component_ids,
        goal_ids: info.goal_ids
      };
    });
    engChildren.push({
      id: sanitizeNodeId('grp', bucket.id, usedIds),
      title: bucket.title,
      order: engSubOrder++,
      children: leafNodes
    });
  });

  if (engChildren.length > 0) {
    rootNodes.push({
      id: sanitizeNodeId('domain', 'platform-engineering-docs', usedIds),
      title: '🛠️ 平台工程与架构文档 (Platform & Architecture Docs)',
      order: rootOrder++,
      children: engChildren
    });
  }

  return {
    manifest: {
      version: 1,
      nodes: rootNodes
    },
    stats: {
      totalRegistered: registeredPaths.size,
      articleCount: postSlugs.length,
      articleSupportCount: Object.keys(supportDocsBySlug).reduce(function (acc, k) {
        return acc + supportDocsBySlug[k].length;
      }, 0),
      engineeringCount: remainingFiles.length,
      domainCount: rootNodes.length
    }
  };
}

function main(argv, options) {
  var opts = options || {};
  var checkOnly = argv.indexOf('--check') !== -1;
  var repoRoot = path.resolve(opts.repoRoot || REPO_ROOT);
  var outputPath = opts.outputPath || path.join(repoRoot, 'docs', 'navigation.json');
  var built = buildNavigationManifest({ repoRoot: repoRoot, outputPath: outputPath });
  var serialized = JSON.stringify(built.manifest, null, 2) + '\n';

  if (checkOnly) {
    if (!fs.existsSync(outputPath)) {
      console.error('docs/navigation.json does not exist.');
      return 1;
    }
    var current = fs.readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      console.error('docs/navigation.json is out of sync. Run `node tools/sync-docs-navigation.js`.');
      return 1;
    }
    console.log('OK: docs/navigation.json is in sync (' + built.stats.totalRegistered + ' documents).');
    return 0;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, 'utf8');
  console.log(
    'Synced docs/navigation.json: ' +
    built.stats.totalRegistered + ' total documents (' +
    built.stats.articleCount + ' Study Room articles + ' +
    built.stats.articleSupportCount + ' co-located support docs + ' +
    built.stats.engineeringCount + ' engineering docs across ' +
    built.stats.domainCount + ' top-level groups).'
  );
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = {
  buildNavigationManifest: buildNavigationManifest,
  main: main
};

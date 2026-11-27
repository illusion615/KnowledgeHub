'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const catalogTool = require('../tools/fetch-ignite-2026-catalog');
const catalogRegistry = require('../tools/article-publisher/catalog-registry');
const navMeta = require('../tools/docs-navigation-meta');
const syncNav = require('../tools/sync-docs-navigation');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_JSON_PATH = path.join(REPO_ROOT, 'docs', 'ignite-2026-session-catalog.json');
const CATALOG_MD_PATH = path.join(REPO_ROOT, 'docs', 'ignite-2026-session-catalog.md');

test('fetch-ignite-2026-catalog helper functions normalize URLs, slugs, and Medius embeds', () => {
  assert.equal(
    catalogTool.cleanUrl('https:\\/\\/medius.microsoft.com\\/video\\/asset\\/PPT\\/93a9a81e-ba1c-4cdd-a0b8-557097cf52ab'),
    'https://medius.microsoft.com/video/asset/PPT/93a9a81e-ba1c-4cdd-a0b8-557097cf52ab'
  );
  assert.equal(catalogTool.stripHtml('<p>What&#x27;s&nbsp;new in <strong>Copilot Studio</strong><\\/p>'), "What's new in Copilot Studio");

  const slug = catalogTool.buildTargetSlug('BRK259', 'See how the Microsoft Copilot harness powers Copilot Studio');
  assert.match(slug, /^ignite-2026-brk259-/);
  assert.ok(slug.length <= 64);

  const sampleEmbed = [
    '<script>',
    'const captionsConfiguration = {"languageList":[{"src":"https://mediusdl.event.microsoft.com/v/Caption_en-US.vtt?sv=2025-01-05\\u0026sp=r","srclang":"en"},{"src":"https://mediusdl.event.microsoft.com/v/Caption_zh-Hans.vtt?sv=2025-01-05","srclang":"zh-HANS"}]};',
    'let coreConfiguration = {"manifests":{"main":[{"manifest":"https://stream.event.microsoft.com/prodwe/Content/HLS/VOD/1/master.m3u8"}]}};',
    '</script>'
  ].join('\n');
  const parsed = catalogTool.parseEmbedHtml(sampleEmbed);
  assert.equal(parsed.captionVttUrl, 'https://mediusdl.event.microsoft.com/v/Caption_en-US.vtt?sv=2025-01-05&sp=r');
  assert.equal(parsed.captionZhHansVttUrl, 'https://mediusdl.event.microsoft.com/v/Caption_zh-Hans.vtt?sv=2025-01-05');
  assert.equal(parsed.hlsManifestUrl, 'https://stream.event.microsoft.com/prodwe/Content/HLS/VOD/1/master.m3u8');
});

test('generated ignite-2026-session-catalog.json and .md satisfy swarm authoring contract', () => {
  assert.ok(fs.existsSync(CATALOG_JSON_PATH), 'docs/ignite-2026-session-catalog.json must exist');
  assert.ok(fs.existsSync(CATALOG_MD_PATH), 'docs/ignite-2026-session-catalog.md must exist');

  const catalog = JSON.parse(fs.readFileSync(CATALOG_JSON_PATH, 'utf8'));
  const md = fs.readFileSync(CATALOG_MD_PATH, 'utf8');

  assert.equal(catalog.schema, 'study_room.ignite_2026_session_catalog.v1');
  assert.ok(catalog.summary.totalUpstreamSessionsScanned >= 1500);
  assert.equal(catalog.sessions.length, catalog.summary.totalActionableSessions);
  assert.equal(catalog.summary.completedSkipCount, 1);
  assert.equal(catalog.summary.completedCount, catalog.sessions.length - 1);
  assert.equal(catalog.summary.pendingProductionCount, 0);

  const seenCodes = new Set();
  const seenSlugs = new Set();

  for (const s of catalog.sessions) {
    assert.ok(s.sessionCode && !seenCodes.has(s.sessionCode), `duplicate or empty sessionCode: ${s.sessionCode}`);
    seenCodes.add(s.sessionCode);

    assert.ok(s.targetSlug && !seenSlugs.has(s.targetSlug), `duplicate or empty targetSlug: ${s.targetSlug}`);
    seenSlugs.add(s.targetSlug);

    assert.equal(s.recommendedTopicId, 'ignite-2026', `expected recommendedTopicId ignite-2026 for ${s.sessionCode}`);
    assert.match(s.sessionUrl, /^https:\/\/ignite\.microsoft\.com\/en-US\/sessions\//);
    assert.match(s.videoUrl, /^https:\/\/medius\.microsoft\.com\/Embed\/video-nc\//);
    assert.match(s.captionVttUrl, /^https:\/\/mediusdl\.event\.microsoft\.com\/.*\.vtt/);
    assert.ok(md.includes('`' + s.sessionCode + '`'), `Markdown table missing ${s.sessionCode}`);

    if (s.sessionCode === 'BRK267') {
      assert.equal(s.alreadyProduced, true);
      assert.equal(s.status, 'completed_skip');
      assert.equal(s.targetSlug, 'copilot-studio-ignite-2026-whats-new');
      assert.ok(fs.existsSync(path.join(REPO_ROOT, s.targetArticlePath)));
    } else {
      assert.equal(s.alreadyProduced, true);
      assert.equal(s.status, 'completed');
      assert.match(s.targetSlug, /^ignite-2026-[a-z0-9]+-/);
      assert.ok(fs.existsSync(path.join(REPO_ROOT, s.targetArticlePath)), `Missing produced article: ${s.targetArticlePath}`);
    }
  }

  for (const mustHave of ['BRK258', 'BRK259', 'BRK261', 'BRK262', 'BRK264', 'BRK265', 'BRK267', 'BRK378', 'BRK379', 'BRK382', 'BRK386', 'BRK570', 'THR887', 'THR964', 'THR977']) {
    assert.ok(seenCodes.has(mustHave), `Expected core session ${mustHave} in catalog`);
  }
});

test('all 53 Ignite 2026 articles are grouped under microsoft-ai -> ignite-2026 in knowledge-data.js and navigation.json', async () => {
  const kdPath = path.join(REPO_ROOT, 'assets', 'knowledge-data.js');
  const navPath = path.join(REPO_ROOT, 'docs', 'navigation.json');
  const catalog = catalogRegistry.loadKnowledgeCatalog(kdPath);

  const igniteTopic = catalog.topics['ignite-2026'];
  assert.ok(igniteTopic, 'ignite-2026 topic node must exist in assets/knowledge-data.js');
  assert.equal(igniteTopic.parentId, 'microsoft-ai');
  assert.equal(igniteTopic.label.zh, 'Microsoft Ignite 2026');
  assert.equal(igniteTopic.label.en, 'Microsoft Ignite 2026');

  const isIgniteArticle = (id) =>
    id.startsWith('ignite-2026-') ||
    id === 'copilot-studio-ignite-2026-whats-new' ||
    id === 'from-build-to-production-harness-managed-runtime';

  const igniteArticles = catalog.tree.filter((n) => n.type === 'article' && isIgniteArticle(n.id));
  assert.equal(igniteArticles.length, 53, 'Expected all 53 Ignite 2026 articles in knowledgeTree');
  for (const art of igniteArticles) {
    assert.equal(art.parentId, 'ignite-2026', `Expected ${art.id} parentId to be ignite-2026, got ${art.parentId}`);
  }

  // Zero leftover Ignite 2026 articles under copilot-studio or power-platform
  const leftover = catalog.tree.filter(
    (n) => n.type === 'article' && (n.parentId === 'copilot-studio' || n.parentId === 'power-platform') && isIgniteArticle(n.id)
  );
  assert.equal(leftover.length, 0);

  // Verify enrichRecordedEntry & deriveNodeFromFrontmatter default topic routing
  const sampleEnriched = await catalogTool.enrichRecordedEntry(
    {
      session: {
        sessionCode: 'BRK378',
        sessionInstanceId: 'inst-378',
        title: 'Host apps from anywhere with the new Copilot Managed Runtime',
        description: 'Power Platform and Copilot Managed Runtime',
        onDemand: 'https://medius.microsoft.com/Embed/video-nc/c5c8ac76-0384-4a0c-acf5-83488136a4f1'
      },
      relevance: { reason: 'title:copilot managed runtime' }
    },
    false
  );
  assert.equal(sampleEnriched.recommendedTopicId, 'ignite-2026');

  const derived = catalogRegistry.deriveNodeFromFrontmatter('ignite-2026-brk999-sample', { title: 'Sample || Sample' }, {}, catalog);
  assert.equal(derived.parentId, 'ignite-2026');

  // Verify docs-navigation-meta goal resolution & navigation.json sync parity
  assert.deepEqual(
    navMeta.resolveGoalIds('ignite-2026-brk259-sample', ['microsoft-ai', 'ignite-2026'], new Set(['topic-ignite-2026', 'topic-copilot-studio'])),
    ['topic-ignite-2026']
  );
  assert.deepEqual(
    navMeta.resolveGoalIds('ignite-2026-brk259-sample', ['microsoft-ai', 'ignite-2026'], new Set(['topic-copilot-studio'])),
    ['topic-copilot-studio']
  );

  assert.equal(syncNav.main(['node', 'sync-docs-navigation.js', '--check']), 0, 'docs/navigation.json must be in sync');
  const nav = JSON.parse(fs.readFileSync(navPath, 'utf8'));
  const msDomain = nav.nodes.find((n) => n.id === 'topic-microsoft-ai');
  assert.ok(msDomain, 'topic-microsoft-ai must exist in docs/navigation.json');
  const navIgniteTopic = (msDomain.children || []).find((n) => n.id === 'topic-ignite-2026');
  assert.ok(navIgniteTopic, 'topic-ignite-2026 must exist under topic-microsoft-ai');
  assert.equal(navIgniteTopic.title, 'Microsoft Ignite 2026');
  assert.equal((navIgniteTopic.children || []).length, 53);

  // Verify private/unmapped education & property paths remain preserved in navigation.json
  const allNavPaths = new Set();
  (function walk(nodes) {
    for (const n of nodes || []) {
      if (n.path) allNavPaths.add(n.path);
      if (n.children) walk(n.children);
    }
  })(nav.nodes);
  assert.ok(allNavPaths.has('posts/four-schools-profile/article.md'));
  assert.ok(allNavPaths.has('posts/leshan-jiading-103-property-strategy/article.md'));
  assert.ok(allNavPaths.has('shanghai-zhongkao-data-report.md'));
});

test('ignite-showcase.js links session tabs to sibling Ignite 2026 topic articles, switches language, and exits safely when DOM is absent', () => {
  const showcasePath = path.join(REPO_ROOT, 'posts', 'copilot-studio-ignite-2026-whats-new', 'ignite-showcase.js');
  const code = fs.readFileSync(showcasePath, 'utf8');

  // Safe no-op when sandbox containers are absent
  assert.doesNotThrow(() => {
    vm.runInNewContext(code, {
      document: {
        readyState: 'complete',
        documentElement: { getAttribute: () => 'zh-CN' },
        querySelector: () => null,
        addEventListener: () => {}
      },
      MutationObserver: function () { return { observe: () => {} }; }
    });
  });

  function makeEl(tag) {
    return {
      tagName: String(tag || 'div').toUpperCase(),
      className: '',
      type: '',
      textContent: '',
      _html: '',
      children: [],
      listeners: {},
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      addEventListener(evt, fn) {
        this.listeners[evt] = fn;
      },
      get innerHTML() {
        return this._html;
      },
      set innerHTML(val) {
        this._html = String(val || '');
        if (val === '') this.children = [];
      }
    };
  }

  let currentLang = 'zh-CN';
  let observerCb = null;
  const controlsEl = makeEl('div');
  const stageEl = makeEl('div');

  vm.runInNewContext(code, {
    document: {
      readyState: 'complete',
      documentElement: { getAttribute: (k) => (k === 'lang' ? currentLang : '') },
      createElement: makeEl,
      querySelector(sel) {
        if (sel === '[data-sandbox-controls="ignite-session-theater"]') return controlsEl;
        if (sel === '[data-sandbox-stage="ignite-session-theater"]') return stageEl;
        return null;
      },
      addEventListener: () => {}
    },
    MutationObserver: function (cb) {
      observerCb = cb;
      return { observe: () => {} };
    }
  });

  const tabs = controlsEl.children[0].children;
  assert.equal(tabs.length, 5);
  assert.ok(stageEl.innerHTML.includes('Microsoft Ignite 2026'));
  assert.equal(stageEl.innerHTML.includes('../copilot-studio-ignite-2026-whats-new/index.html'), false, 'Current BRK267 article should not self-link');

  // Switch to BRK259 tab -> renders direct link to sibling Ignite 2026 topic article
  tabs[1].listeners.click();
  assert.ok(stageEl.innerHTML.includes('../ignite-2026-brk259-copilot-harness-powers-copilot-studio/index.html'));
  assert.ok(stageEl.innerHTML.includes('阅读本专题深解'));

  // Switch document lang to English
  currentLang = 'en';
  observerCb([{ attributeName: 'lang' }]);
  assert.ok(stageEl.innerHTML.includes('Read Topic Article'));
});

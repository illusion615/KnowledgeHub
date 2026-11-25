'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const childProcess = require('node:child_process');

const publisher = require('../tools/article-publisher');
const cli = require('../tools/publish-article');

const REPO_ROOT = path.resolve(__dirname, '..');

function createIsolatedWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kh-publish-article-'));
  fs.mkdirSync(path.join(root, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });

  const seedKnowledge = [
    'var knowledgeTree = [',
    '  {',
    "    id: 'ai-project-practice',",
    '    parentId: null,',
    "    type: 'topic',",
    "    label: { zh: 'AI项目实践', en: 'AI Project Practice' },",
    "    color: '#0f766e',",
    '    orbitIndex: 2, phase: 5.1, speed: 0.5',
    '  },',
    '  {',
    "    id: 'knowledge-hub-design-docs',",
    "    parentId: 'ai-project-practice',",
    "    type: 'topic',",
    "    label: { zh: '知识库架构设计', en: 'Knowledge Hub Design' },",
    "    color: '#0d8f8c',",
    '    phase: 1.2, speed: 0.85',
    '  }',
    '];',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(root, 'assets', 'knowledge-data.js'), seedKnowledge, 'utf8');
  fs.writeFileSync(path.join(root, 'docs', 'navigation.json'), JSON.stringify({ version: 1, nodes: [] }, null, 2) + '\n', 'utf8');
  return root;
}

function writeSampleMarkdown(root, slug, titleZh = '单篇发布测试', titleEn = 'Single Article Publish Test') {
  const articleDir = path.join(root, 'posts', slug);
  fs.mkdirSync(path.join(articleDir, 'media'), { recursive: true });
  const md = [
    '---',
    `title: ${titleZh} || ${titleEn}`,
    'eyebrow: Publish Pipeline || Publish Pipeline',
    'date: 2026-11-25',
    'strict_i18n: true',
    'strict_density: true',
    'lead: 验证从唯一 Markdown 源稿到自包含静态 HTML 与图谱注册的确定性流水线 [1]。 || Validates deterministic compilation from Markdown source to static HTML and catalog registration [1].',
    'tags: [Publishing, Static Hub]',
    'style:',
    '  accent: "#0d8f8c"',
    '---',
    '',
    '## #overview 01 / Overview :: 发布闭环验证 || Publishing Loop Verification',
    '',
    '公开阅读页零后端依赖直出静态展厅 [1]。 || Public reading pages ship to the static gallery with zero backend dependencies [1].',
    '',
    '## #references References :: 参考资料 || References',
    '',
    '1. **Study Room Architecture Spec** — Deterministic Genesis Static Pipeline (2026).'
  ].join('\n');
  fs.writeFileSync(path.join(articleDir, 'article.md'), md, 'utf8');
  return articleDir;
}

test('resolveArticleTarget accepts bare slug, relative article.md path, and posts/<slug> directory', () => {
  const fromSlug = publisher.resolveArticleTarget('copilot-studio-ignite-2026-whats-new', REPO_ROOT);
  assert.equal(fromSlug.ok, true);
  assert.equal(fromSlug.slug, 'copilot-studio-ignite-2026-whats-new');
  assert.equal(fromSlug.relMarkdownPath, 'posts/copilot-studio-ignite-2026-whats-new/article.md');

  const fromMd = publisher.resolveArticleTarget('posts/markdown-genesis-lab/article.md', REPO_ROOT);
  assert.equal(fromMd.ok, true);
  assert.equal(fromMd.slug, 'markdown-genesis-lab');

  const invalid = publisher.resolveArticleTarget('', REPO_ROOT);
  assert.equal(invalid.ok, false);
});

test('full lifecycle: unpublished -> dry-run -> published -> idempotent rerun -> modified_pending_sync', () => {
  const root = createIsolatedWorkspace();
  try {
    const slug = 'sample-pipeline-post';
    writeSampleMarkdown(root, slug);

    // 1. Initial status is unpublished
    const st1 = publisher.publishArticle(slug, { repoRoot: root, statusOnly: true });
    assert.equal(st1.ok, true);
    assert.equal(st1.state, 'unpublished');
    assert.equal(st1.hasMarkdown, true);
    assert.equal(st1.hasHtml, false);
    assert.equal(st1.catalogRegistered, false);

    // 2. Dry-run previews modifications without mutating disk
    const dry = publisher.publishArticle(`posts/${slug}/article.md`, {
      repoRoot: root,
      topic: 'knowledge-hub-design-docs',
      dryRun: true
    });
    assert.equal(dry.ok, true);
    assert.equal(dry.mode, 'dry-run');
    assert.equal(dry.state, 'dry_run_ready');
    assert.equal(fs.existsSync(path.join(root, 'posts', slug, 'index.html')), false);
    assert.ok(dry.releaseEngineerPayload.filesModified.includes(`posts/${slug}/index.html`));
    assert.ok(dry.releaseEngineerPayload.filesModified.includes('assets/knowledge-data.js'));

    // 3. Real publish compiles HTML, registers catalog node, and syncs navigation
    const pub1 = publisher.publishArticle(slug, {
      repoRoot: root,
      topic: 'knowledge-hub-design-docs'
    });
    assert.equal(pub1.ok, true);
    assert.equal(pub1.state, 'published');
    assert.equal(pub1.article.catalogAction, 'registered');
    assert.equal(pub1.article.topicId, 'knowledge-hub-design-docs');
    assert.ok(fs.existsSync(path.join(root, 'posts', slug, 'index.html')));
    assert.ok(pub1.releaseEngineerPayload.gitAddPaths.includes(`posts/${slug}/article.md`));
    assert.ok(pub1.releaseEngineerPayload.gitAddPaths.includes(`posts/${slug}/index.html`));
    assert.ok(pub1.releaseEngineerPayload.gitAddPaths.includes('assets/knowledge-data.js'));

    // Verify knowledge-data.js syntax and single node registration
    const kdCode = fs.readFileSync(path.join(root, 'assets', 'knowledge-data.js'), 'utf8');
    const sb = {};
    vm.runInNewContext(kdCode, sb);
    const matchingNodes = sb.knowledgeTree.filter(n => n.id === slug);
    assert.equal(matchingNodes.length, 1);
    assert.equal(matchingNodes[0].url, `posts/${slug}/index.html`);

    // 4. Status now reports published
    const st2 = publisher.publishArticle(slug, { repoRoot: root, statusOnly: true });
    assert.equal(st2.state, 'published');
    assert.equal(st2.htmlInSync, true);
    assert.equal(st2.catalogRegistered, true);

    // 5. Idempotent second run makes zero duplicate catalog entries or file writes
    const pub2 = publisher.publishArticle(slug, {
      repoRoot: root,
      topic: 'knowledge-hub-design-docs'
    });
    assert.equal(pub2.ok, true);
    assert.equal(pub2.article.catalogAction, 'unchanged');
    assert.deepEqual(pub2.releaseEngineerPayload.filesModified, []);

    // 6. Modifying article.md transitions state to modified_pending_sync and --check catches drift
    writeSampleMarkdown(root, slug, '单篇发布测试（修订版）', 'Single Article Publish Test (Revised)');
    const st3 = publisher.publishArticle(slug, { repoRoot: root, statusOnly: true });
    assert.equal(st3.state, 'modified_pending_sync');
    assert.equal(st3.htmlInSync, false);

    const checkFail = publisher.publishArticle(slug, { repoRoot: root, checkOnly: true });
    assert.equal(checkFail.ok, false);
    assert.equal(checkFail.stage, 'drift_check');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('media-guard blocks >25MB uncompressed studio master .wav files before static publication', () => {
  const root = createIsolatedWorkspace();
  try {
    const slug = 'heavy-audio-post';
    const articleDir = writeSampleMarkdown(root, slug);
    const wavPath = path.join(articleDir, 'media', 'raw-studio-master.wav');

    // Create a sparse/allocated 26 MiB .wav file (> 25 MiB limit)
    const fd = fs.openSync(wavPath, 'w');
    fs.ftruncateSync(fd, 26 * 1024 * 1024);
    fs.closeSync(fd);

    const res = publisher.publishArticle(slug, { repoRoot: root });
    assert.equal(res.ok, false);
    assert.equal(res.stage, 'media_guard');
    assert.equal(res.mediaAudit.violations.length, 1);
    assert.equal(res.mediaAudit.violations[0].code, 'oversized_uncompressed_master');
    assert.match(res.error, /raw-studio-master\.wav/);
    assert.equal(fs.existsSync(path.join(articleDir, 'index.html')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('CLI integration runs all 14 validate.js checks on real workspace article in --dry-run mode', () => {
  const proc = childProcess.spawnSync(
    process.execPath,
    [path.join(REPO_ROOT, 'tools', 'publish-article.js'), 'copilot-studio-ignite-2026-whats-new', '--dry-run'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.equal(proc.status, 0, proc.stderr);
  const payload = JSON.parse(proc.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.validation.ok, true);
  assert.equal(payload.validation.checksCount, 14);
  assert.equal(payload.article.topicId, 'copilot-studio');

  const helpCode = cli.main(['node', 'publish-article.js', '--help']);
  assert.equal(helpCode, 0);
});

test('assets/article-common.js decouples public reader view from Video Studio while keeping ?studio=1 / ?authoring=1 / Captain Docs host', () => {
  const code = fs.readFileSync(path.join(REPO_ROOT, 'assets', 'article-common.js'), 'utf8');

  function runTopbarBoot({ pathname = '/posts/markdown-genesis-lab/index.html', search = '', hostAttr = null, inCaptainFrame = false, referrer = '' } = {}) {
    const appendedButtons = [];
    const actionsEl = {
      appendChild(el) { appendedButtons.push(el); }
    };
    const topbarEl = {
      querySelector(sel) {
        if (sel === '.topbar-actions') return actionsEl;
        return null;
      }
    };
    const rootAttrs = { 'data-theme': 'light', lang: 'zh-CN' };
    if (hostAttr) rootAttrs['data-authoring-host'] = hostAttr;

    const documentStub = {
      readyState: 'complete',
      referrer,
      documentElement: {
        lang: 'zh-CN',
        style: { setProperty() {} },
        setAttribute(k, v) { rootAttrs[k] = v; },
        getAttribute(k) { return Object.prototype.hasOwnProperty.call(rootAttrs, k) ? rootAttrs[k] : null; },
        hasAttribute(k) { return Object.prototype.hasOwnProperty.call(rootAttrs, k); }
      },
      body: {
        hasAttribute() { return false; }
      },
      head: { appendChild() {} },
      querySelector(sel) {
        if (sel === '.topbar') return topbarEl;
        if (sel === '[data-video-studio]') return appendedButtons[0] || null;
        return null;
      },
      querySelectorAll() { return []; },
      createElement(tag) {
        const attrs = {};
        const span = { textContent: '' };
        return {
          tagName: tag.toUpperCase(),
          className: '',
          type: '',
          title: '',
          innerHTML: '',
          style: {},
          setAttribute(k, v) { attrs[k] = v; },
          getAttribute(k) { return attrs[k] || null; },
          addEventListener() {},
          querySelector() { return span; }
        };
      },
      addEventListener() {}
    };

    const topWindow = {};
    const selfWindow = inCaptainFrame ? {} : topWindow;
    const windowStub = Object.assign(selfWindow, {
      self: selfWindow,
      top: topWindow,
      frameElement: inCaptainFrame ? { classList: { contains: c => c === 'docs-rich-html-stage' } } : null,
      location: { pathname, search, href: 'https://example.github.io' + pathname + search, origin: 'https://example.github.io' },
      localStorage: {
        getItem() { return null; },
        setItem() {}
      },
      matchMedia() { return { matches: false }; },
      addEventListener() {},
      setTimeout(fn) { fn(); return 1; },
      URLSearchParams
    });
    windowStub.window = windowStub;

    const sandbox = {
      window: windowStub,
      document: documentStub,
      localStorage: windowStub.localStorage,
      URLSearchParams,
      setTimeout: windowStub.setTimeout,
      console
    };
    vm.runInNewContext(code, sandbox);
    return appendedButtons;
  }

  // 1. Default public static reader view (e.g. GitHub Pages): NO Video Studio button injected
  const publicButtons = runTopbarBoot({ search: '' });
  assert.equal(publicButtons.length, 0);

  // 2. Explicit ?studio=1 query param: mounts Video Studio button
  const studioButtons = runTopbarBoot({ search: '?studio=1' });
  assert.equal(studioButtons.length, 1);
  assert.equal(studioButtons[0].getAttribute('data-video-studio'), 'markdown-genesis-lab');

  // 3. Explicit ?authoring=1 query param: mounts Video Studio button
  const authoringButtons = runTopbarBoot({ search: '?authoring=1' });
  assert.equal(authoringButtons.length, 1);

  // 4. Embedded inside Captain Docs `.docs-rich-html-stage` iframe: mounts Video Studio button
  const captainFrameButtons = runTopbarBoot({ inCaptainFrame: true });
  assert.equal(captainFrameButtons.length, 1);

  // 5. Explicit ?studio=0 overrides host attribute
  const forcedOffButtons = runTopbarBoot({ search: '?studio=0', hostAttr: 'captain-docs' });
  assert.equal(forcedOffButtons.length, 0);
});

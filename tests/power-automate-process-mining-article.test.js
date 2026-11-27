'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { resolveArticleTarget, inspectArticleStatus } = require('../tools/article-publisher/status-inspector');
const figureEngine = require('../tools/figure-engine');

const REPO_ROOT = path.resolve(__dirname, '..');
const SLUG = 'power-automate-process-mining';
const ARTICLE_DIR = path.join(REPO_ROOT, 'posts', SLUG);

test('power-automate-process-mining article covers methodology, 6-stage project flow, tooling combinations, GitHub ecosystem, and best practices without over-engineering', () => {
  const mdPath = path.join(ARTICLE_DIR, 'article.md');
  const htmlPath = path.join(ARTICLE_DIR, 'index.html');
  const figPath = path.join(ARTICLE_DIR, 'media', 'process-mining-architecture.figure.json');

  for (const p of [mdPath, htmlPath, figPath]) {
    assert.ok(fs.existsSync(p), `Expected file to exist: ${p}`);
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const fig = JSON.parse(fs.readFileSync(figPath, 'utf8'));

  // 1. Genre-native sections covering methodology, project lifecycle, tool combinations, GitHub community, best practices, and references
  for (const heading of [
    '#methodology',
    '#project-lifecycle',
    '#tool-ecosystem',
    '#github-community',
    '#best-practices',
    '#references'
  ]) {
    assert.ok(md.includes(heading), `Expected section ${heading} in article.md`);
    assert.ok(html.includes(`id="${heading.slice(1)}"`), `Expected compiled section ${heading} in index.html`);
  }

  // 2. Anti-over-engineering contract: clean single-column hero (no hero-panel / hero-metrics), zero decorative equations, zero contrived sandboxes
  assert.equal(html.includes('class="hero-panel'), false, 'Should use adaptive single-column hero without padded .hero-panel');
  assert.equal(html.includes('class="hero-metrics'), false, 'Should omit decorative .hero-metrics');
  assert.equal(md.includes('$$'), false, 'Non-quantitative guide must not contain decorative $$ equations');
  assert.equal(md.includes(':::sandbox'), false, 'Guide must not contain contrived :::sandbox widgets');

  // 3. Key C0-C2 facts from Microsoft Learn & official GitHub community
  for (const fact of [
    'HEAT',
    'OCPM',
    'Task Mining',
    'Case Level Attribute (first event)',
    'Self-loop',
    'BKPF',
    'api/data/v9.2',
    'dad3c6de-ed58-42ef-989f-9c0303aaeedc',
    'get_bottleneck_analysis',
    'get_correlation',
    '50 MB',
    '100 GB',
    '$5,000',
    '14 天',
    '28 天',
    'MicrosoftDocs/power-automate-docs',
    'microsoft/coe-starter-kit',
    'microsoft/powercat-automation-kit',
    'microsoft/powerplatform-actions',
    'microsoft/PowerPlatformConnectors',
    'microsoft/power-platform-skills',
    'microsoft/Dataverse-skills'
  ]) {
    assert.ok(md.includes(fact), `Expected verified domain fact in article.md: ${fact}`);
  }

  // 4. Architecture figure compiles cleanly via Figure Engine v2
  assert.equal(fig.type, 'architecture');
  const compiledFig = figureEngine.compileFigure(fig, { lang: 'bilingual' });
  assert.equal(compiledFig.kind, 'topology');
  assert.ok(compiledFig.svg.includes('<svg'), 'Expected valid inline SVG from figure spec');

  // 5. No raw compiler placeholder leaks
  assert.equal(html.includes('@@BILINGUAL_SEP@@'), false);
  assert.equal(html.includes('@@CODE_'), false);

  // 6. Publication & catalog/navigation sync contract
  const target = resolveArticleTarget(SLUG, REPO_ROOT);
  assert.equal(target.ok, true);
  const status = inspectArticleStatus(target);
  assert.equal(status.ok, true);
  assert.equal(status.htmlInSync, true);
  assert.equal(status.catalogRegistered, true);
  assert.equal(status.topicId, 'power-platform');
  assert.equal(status.navigationRegistered, true);
  assert.equal(status.contractOk, true);
  assert.equal(status.mediaAudit.ok, true);

  // 7. Catalog summary stays within validate.js length thresholds (zh <= 100, en <= 160) without ellipsis truncation
  const kdCode = fs.readFileSync(path.join(REPO_ROOT, 'assets', 'knowledge-data.js'), 'utf8');
  const sb = {};
  vm.runInNewContext(kdCode, sb);
  const node = sb.knowledgeTree.find((n) => n.id === SLUG);
  assert.ok(node, 'Expected knowledgeTree node for power-automate-process-mining');
  assert.equal(node.parentId, 'power-platform');
  assert.ok(node.summary.zh.length <= 100, `Expected summary.zh <= 100 chars, got ${node.summary.zh.length}`);
  assert.ok(node.summary.en.length <= 160, `Expected summary.en <= 160 chars, got ${node.summary.en.length}`);
  assert.equal(node.summary.en.endsWith('…'), false, 'Expected clean summary.en without truncation ellipsis');
});

test('status-inspector handles invalid targets and preserves existing private/unmapped navigation entries', () => {
  const badTarget = resolveArticleTarget('posts/non-existent-process-mining-slug/article.md', REPO_ROOT);
  assert.equal(badTarget.ok, true);
  const missingStatus = inspectArticleStatus(badTarget);
  assert.equal(missingStatus.state, 'missing');

  const navJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'docs', 'navigation.json'), 'utf8'));
  const navText = JSON.stringify(navJson);
  assert.ok(navText.includes('posts/power-automate-process-mining/article.md'), 'Expected new article in docs/navigation.json');
  assert.ok(navText.includes('edu-admissions-planning'), 'Expected unmapped admissions entries preserved in docs/navigation.json');
});

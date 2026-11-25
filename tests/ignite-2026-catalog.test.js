'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalogTool = require('../tools/fetch-ignite-2026-catalog');

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
  assert.equal(catalog.summary.pendingProductionCount, catalog.sessions.length - 1);

  const seenCodes = new Set();
  const seenSlugs = new Set();

  for (const s of catalog.sessions) {
    assert.ok(s.sessionCode && !seenCodes.has(s.sessionCode), `duplicate or empty sessionCode: ${s.sessionCode}`);
    seenCodes.add(s.sessionCode);

    assert.ok(s.targetSlug && !seenSlugs.has(s.targetSlug), `duplicate or empty targetSlug: ${s.targetSlug}`);
    seenSlugs.add(s.targetSlug);

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
      assert.equal(s.alreadyProduced, false);
      assert.equal(s.status, 'pending_production');
      assert.match(s.targetSlug, /^ignite-2026-[a-z0-9]+-/);
    }
  }

  for (const mustHave of ['BRK258', 'BRK259', 'BRK261', 'BRK262', 'BRK264', 'BRK265', 'BRK267', 'BRK378', 'BRK379', 'BRK382', 'BRK386', 'BRK570', 'THR887', 'THR964', 'THR977']) {
    assert.ok(seenCodes.has(mustHave), `Expected core session ${mustHave} in catalog`);
  }
});

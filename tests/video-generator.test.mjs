import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import vgCatalog from '../assets/video-studio-templates.js';
import composition from '../assets/video-studio-composition.js';
import { validateBrief, defaultBrief } from '../scripts/video-studio-model.mjs';
import { selfCheck, consumeEvents, makeCaptions, srtTime, generateVolcengineTts } from '../scripts/video-generator-tts.mjs';
import { createBridge } from '../scripts/copilot-bridge-server.mjs';

test('Video-Generator catalog exposes dual scenarios, 11 Adu style packs, and 9 TPL scene presets', () => {
  assert.equal(vgCatalog.upstreamInfo.repository, 'zaz8848/Video-Generator');
  assert.equal(vgCatalog.upstreamInfo.version, '0.2.0');
  assert.equal(vgCatalog.scenarios.length, 2);
  assert.deepEqual(vgCatalog.scenarios.map(item => item.id), ['presenter', 'product']);
  assert.equal(vgCatalog.stylePacks.length, 11);
  assert.equal(vgCatalog.scenePresets.length, 9);

  for (const pack of vgCatalog.stylePacks) {
    assert.match(pack.id, /^0[1-6]-[A-E]$/);
    assert.ok(pack.selection.includes('@'));
    assert.match(pack.palette.background, /^#[0-9A-F]{6}$/i);
    assert.match(pack.palette.accent, /^#[0-9A-F]{6}$/i);
  }
});

test('all 9 TPL scene choreographies compile into valid KHVideoComposition trees across style packs', () => {
  const sampleScene = {
    id: 'bench-scene',
    title: '架构吞吐提升 3.5 倍',
    narration: '先定位瓶颈。再通过异步队列解耦。最终把端到端延迟降低 62%。',
    screenText: '吞吐提升 3.5 倍 · 延迟降低 62%',
    visual: 'Clean dark console architecture diagram.'
  };

  for (const preset of vgCatalog.scenePresets) {
    for (const packId of ['01-A', '03-A', '04-A', '06-A']) {
      const built = vgCatalog.buildTemplateComposition(preset.id, sampleScene, packId);
      const validated = composition.validate(built);
      assert.equal(validated.background, built.background);
      assert.ok(validated.layers.length >= 2, `${preset.id} on ${packId} has layers`);
      const startState = composition.state(validated.layers[0], 0);
      const midState = composition.state(validated.layers[0], 0.5);
      assert.ok(Number.isFinite(startState.x) && Number.isFinite(midState.y));
    }
  }
});

test('containBounds and toManifest follow Video-Generator 0.2 safe frame and subtitle band rules', () => {
  const bounds = vgCatalog.containBounds(1600, 1200, { width: 1920, height: 1080, inset: 24, captionBand: 108 });
  assert.equal(bounds.width % 2, 0);
  assert.equal(bounds.height % 2, 0);
  assert.ok(bounds.width <= 1920 - 48);
  assert.ok(bounds.height <= 1080 - 48 - 108);

  const manifest = vgCatalog.toManifest({
    source: { slug: 'study-room-design', title: 'Knowledge Hub 设计文档' },
    brief: { ...defaultBrief(), scenario: 'product', stylePack: '03-A', music: 'bright' },
    scenes: [
      {
        id: 'opening',
        title: '开场架构',
        narration: '第一段解说。',
        artifacts: {
          image: { file: 'a'.repeat(64) + '.png', width: 1536, height: 864 },
          voice: { file: 'b'.repeat(64) + '.wav', duration: 4.2, sha256: 'c'.repeat(64), cues: [{ text: '第一段解说。', start: 0.4, duration: 3.1 }] }
        }
      }
    ]
  });
  assert.equal(manifest.schema, 'video-generator-bridge/v0.2');
  assert.equal(manifest.scenario, 'product');
  assert.equal(manifest.stylePack.id, '03-A');
  assert.equal(manifest.clips.length, 1);
  assert.equal(manifest.narration.length, 1);
  assert.equal(manifest.captions.length, 1);
  assert.equal(manifest.captions[0].text, '第一段解说。');
});

test('validateBrief accepts Video-Generator scenarios, style packs, and Volcengine voices', () => {
  const valid = validateBrief({
    ...defaultBrief(),
    voice: 'zh_female_cancan_uranus_bigtts',
    scenario: 'product',
    stylePack: '04-A'
  });
  assert.equal(valid.voice, 'zh_female_cancan_uranus_bigtts');
  assert.equal(valid.scenario, 'product');
  assert.equal(valid.stylePack, '04-A');

  assert.throws(() => validateBrief({ ...defaultBrief(), scenario: 'invalid-mode' }), /presenter.*product/);
  assert.throws(() => validateBrief({ ...defaultBrief(), stylePack: '99-Z' }), /风格编号无效/);
});

test('Volcengine Seed-TTS 2.0 stream parser, caption builder, and mock SSE synthesis pass', async () => {
  const check = selfCheck();
  assert.equal(check.offlineCheck, 'PASS');
  assert.equal(check.networkCalled, false);
  assert.equal(srtTime(3661.5), '01:01:01,500');

  const envRoot = await mkdtemp(join(tmpdir(), 'kh-vg-tts-'));
  try {
    const envFile = join(envRoot, 'tts.local.env');
    await writeFile(envFile, 'VOLCENGINE_TTS_API_KEY=volc_test_key_12345678901234567890\nVOLCENGINE_TTS_RESOURCE_ID=seed-tts-2.0\n');
    const ssePayload = [
      'event: 352\r\ndata: {"code":0,"data":"' + Buffer.from('mock-mp3-audio').toString('base64') + '","sentence":{"words":[{"word":"清晰","startTime":0.1,"endTime":0.5},{"word":"直接","startTime":0.5,"endTime":0.9}]}}\r\n\r\n',
      'event: 152\r\ndata: {"code":20000000,"usage":{"characters":4}}\r\n\r\n'
    ];
    const result = await generateVolcengineTts({
      text: '清晰直接',
      speaker: 'zh_female_cancan_uranus_bigtts',
      rate: 0,
      envFile,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: new Map([['x-tt-logid', 'log-123']]),
        body: (async function* () {
          for (const chunk of ssePayload) yield new TextEncoder().encode(chunk);
        })()
      })
    });
    assert.equal(result.bytes.toString(), 'mock-mp3-audio');
    assert.equal(result.metadata.successCode, 20000000);
    assert.deepEqual(result.captions, [{ start: 0.1, end: 0.9, text: '清晰直接' }]);
  } finally {
    await rm(envRoot, { recursive: true, force: true });
  }
});

test('Studio HTTP API serves /catalog and /:id/manifest with persisted Video-Generator fields', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-vg-api-'));
  const dataRoot = join(root, 'private/video-studio');
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><main><section id="intro"><p>测试正文内容。</p></section></main>');
  const server = createBridge({
    root,
    runtimeFactory: async () => ({ status: async () => ({ authenticated: true, models: [] }), chat: async () => {}, close: async () => {} }),
    studioOptions: { dataRoot }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const boot = await fetch(base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' } });
    const cookie = boot.headers.get('set-cookie').split(';')[0];
    const { csrf } = await boot.json();
    const headers = { Cookie: cookie, Origin: base, 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' };

    const catalogRes = await fetch(base + '/api/copilot/studio/catalog', { headers });
    assert.equal(catalogRes.status, 200);
    const catalog = await catalogRes.json();
    assert.equal(catalog.stylePacks.length, 11);
    assert.equal(catalog.scenePresets.length, 9);

    const openRes = await fetch(base + '/api/copilot/studio/open', {
      method: 'POST', headers, body: JSON.stringify({ article: 'example' })
    });
    const project = await openRes.json();

    const draftRes = await fetch(base + `/api/copilot/studio/${project.id}/draft`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        revision: project.revision,
        brief: { ...project.brief, scenario: 'product', stylePack: '03-A' },
        scenes: [{
          id: 'intro-shot',
          title: '产品概览',
          narration: '展示完整产品窗口。',
          visual: '',
          screenText: '产品概览',
          camera: 'static',
          anchors: ['intro'],
          composition: vgCatalog.buildTemplateComposition('demo', { title: '产品概览', narration: '展示完整产品窗口。', screenText: '产品概览' }, '03-A')
        }],
        confirmBrief: true
      })
    });
    assert.equal(draftRes.status, 200);
    const updated = await draftRes.json();
    assert.equal(updated.brief.scenario, 'product');
    assert.equal(updated.brief.stylePack, '03-A');

    const manifestRes = await fetch(base + `/api/copilot/studio/${project.id}/manifest`, { headers });
    assert.equal(manifestRes.status, 200);
    const manifest = await manifestRes.json();
    assert.equal(manifest.scenario, 'product');
    assert.equal(manifest.stylePack.id, '03-A');
    assert.equal(manifest.clips.length, 1);
  } finally {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    await rm(root, { recursive: true, force: true });
  }
});

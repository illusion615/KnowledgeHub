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

    await mkdir(join(root, 'posts/auto-article'), { recursive: true });
    await writeFile(join(root, 'posts/auto-article/index.html'), '<h1>自动口播测试文章</h1><main><section id="overview"><h2>1. 架构总览</h2><p>吞吐提升 3.5 倍，延迟下降 62%。</p></section><section id="steps"><h2>2. 落地步骤</h2><p>第一步解析，第二步编译，第三步验证对比。</p></section></main>');
    const autoOpenRes = await fetch(base + '/api/copilot/studio/open', {
      method: 'POST', headers, body: JSON.stringify({ article: 'auto-article', autoDraft: true })
    });
    assert.equal(autoOpenRes.status, 200);
    const autoProject = await autoOpenRes.json();
    assert.equal(autoProject.cursor, 2, 'opening from article modal with autoDraft jumps directly to Scene Workbench');
    assert.ok(autoProject.scenes.length >= 3, 'autoDraft populates opening, body, and outro scenes');
    assert.ok(autoProject.scenes.every(sc => sc.narration && sc.composition && sc.composition.layers.length >= 2));

    const regenRes = await fetch(base + `/api/copilot/studio/${autoProject.id}/auto-narration`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        revision: autoProject.revision,
        brief: { ...autoProject.brief, scenario: 'product', stylePack: '04-A' }
      })
    });
    assert.equal(regenRes.status, 200);
    const regenProject = await regenRes.json();
    assert.equal(regenProject.brief.stylePack, '04-A');
    assert.match(regenProject.creativeDirection, /04-A/);
    assert.ok(regenProject.scenes.length >= 3);
  } finally {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    await rm(root, { recursive: true, force: true });
  }
});

test('One-click pipeline endpoint /:id/one-click auto-populates TPL scenes, approves plan, and produces MP4 without manual brief confirmation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-vg-oneclick-'));
  const dataRoot = join(root, 'private/video-studio');
  const calls = { voice: 0, clip: 0, export: 0, image: 0 };
  await mkdir(join(root, 'posts/oneclick-article'), { recursive: true });
  await writeFile(join(root, 'posts/oneclick-article/index.html'), '<h1>一键生成测试文章</h1><main><section id="overview"><h2>1. 核心痛点</h2><p>传统配置步骤繁琐，操作耗时降低 80%。</p></section><section id="action"><h2>2. 一键流水线</h2><p>第一步提取口播，第二步合成语音，第三步渲染成片。</p></section></main>');
  const server = createBridge({
    root,
    runtimeFactory: async () => ({ status: async () => ({ authenticated: true, models: [] }), chat: async () => {}, close: async () => {} }),
    studioOptions: {
      dataRoot,
      engine: {
        status: async () => ({ image: true, voice: true, renderer: true }),
        run: async (kind, input) => {
          calls[kind] = (calls[kind] || 0) + 1;
          await writeFile(input.output, 'mock-' + kind);
          return { frames: 150, duration: 5, cues: [{ text: input.scene?.narration || '旁白', start: 0.4, duration: 3.2 }] };
        }
      }
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const boot = await fetch(base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' } });
    const cookie = boot.headers.get('set-cookie').split(';')[0];
    const { csrf } = await boot.json();
    const headers = { Cookie: cookie, Origin: base, 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' };

    const openRes = await fetch(base + '/api/copilot/studio/open', {
      method: 'POST', headers, body: JSON.stringify({ article: 'oneclick-article' })
    });
    const opened = await openRes.json();
    assert.equal(opened.scenes.length, 0, 'initially empty when opened without autoDraft');

    const oneClickRes = await fetch(base + `/api/copilot/studio/${opened.id}/one-click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        revision: opened.revision,
        brief: { ...opened.brief, scenario: 'presenter', stylePack: '01-A', seconds: 60 }
      })
    });
    assert.equal(oneClickRes.status, 202);
    let current = await oneClickRes.json();
    assert.ok(current.scenes.length >= 3, 'one-click automatically populates TPL storyboard scenes when empty');
    assert.equal(current.planApproved, true, 'one-click automatically approves the storyboard');

    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const pollRes = await fetch(base + `/api/copilot/studio/${opened.id}`, { headers });
      current = await pollRes.json();
      if (!current.jobs.some(j => ['queued', 'running'].includes(j.status))) break;
      await new Promise(r => setTimeout(r, 15));
    }
    assert.equal(current.jobs.at(-1).status, 'done');
    assert.equal(current.cursor, 5, 'one-click advances project cursor to export stage upon completion');
    assert.ok(current.currentExport, 'final MP4 export is ready');
    assert.equal(calls.image, 0, 'TPL dynamic scenes require zero slow AI image generation');
    assert.equal(calls.voice, current.scenes.length);
    assert.equal(calls.clip, current.scenes.length);
    assert.equal(calls.export, 1);
  } finally {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    await rm(root, { recursive: true, force: true });
  }
});

test('index.html has no standalone Video Studio links and article-common.js mounts in-page overlay modal', async () => {
  const { readFile } = await import('node:fs/promises');
  const indexHtml = await readFile(join(process.cwd(), 'index.html'), 'utf8');
  assert.doesNotMatch(indexHtml, /video-studio-home-btn|videoStudioSettingsLink/);

  const articleCommon = await readFile(join(process.cwd(), 'assets/article-common.js'), 'utf8');
  assert.equal(articleCommon.includes('article-video-modal.js'), true);
  assert.match(articleCommon, /KHArticleVideoModal/);
  assert.doesNotMatch(articleCommon, /link\.href\s*=\s*['"]\.\.\/\.\.\/video-studio\.html/);
  assert.match(articleCommon, /createElement\(['"]button['"]\)/);
});

test('procedural dynamic BGM engine synthesizes 4 styles with non-zero stereo waveforms, no NaN/clipping, and automatic voice ducking', async () => {
  const { synthesizeStereoBuffer, bgmStyles, SAMPLE_RATE } = await import('../scripts/video-studio-bgm.mjs');
  const { writeWave, assembleAudio } = await import('../scripts/video-studio-audio.mjs');
  assert.equal(bgmStyles.length, 4);
  const styleIds = ['ambient-tech', 'upbeat-pulse', 'dynamic-drive', 'elegant-minimal'];

  for (const styleId of styleIds) {
    const frames = SAMPLE_RATE * 2; // 2 seconds
    const { stereo, bpm } = synthesizeStereoBuffer(frames, styleId, SAMPLE_RATE);
    assert.equal(stereo.length, frames * 2);
    assert.ok(bpm >= 60 && bpm <= 160);
    let energy = 0, peak = 0;
    for (let i = 0; i < stereo.length; i++) {
      assert.ok(Number.isFinite(stereo[i]), `no NaN/Infinity in ${styleId}`);
      const abs = Math.abs(stereo[i]);
      energy += abs;
      if (abs > peak) peak = abs;
    }
    assert.ok(energy > 50, `${styleId} produces audible non-zero music waveform`);
    assert.ok(peak <= 1.0, `${styleId} does not clip`);
  }

  // Test assembleAudio sidechain ducking when voice is active vs silent
  const dir = await mkdtemp(join(tmpdir(), 'kh-bgm-duck-'));
  try {
    const silentVoice = new Float32Array(SAMPLE_RATE * 2);
    const activeVoice = new Float32Array(SAMPLE_RATE * 2);
    for (let i = 0; i < activeVoice.length; i++) activeVoice[i] = 0.25 * Math.sin(2 * Math.PI * 220 * (i / SAMPLE_RATE));
    const silentFile = join(dir, 'silent.wav');
    const activeFile = join(dir, 'active.wav');
    const outSilent = join(dir, 'out-silent.wav');
    const outActive = join(dir, 'out-active.wav');
    await writeWave(silentFile, silentVoice, 1);
    await writeWave(activeFile, activeVoice, 1);
    const resSilent = await assembleAudio([{ file: silentFile, frames: 60 }], outSilent, 'upbeat-pulse');
    const resActive = await assembleAudio([{ file: activeFile, frames: 60 }], outActive, 'upbeat-pulse');
    assert.equal(resSilent.musicStyle, 'upbeat-pulse');
    assert.equal(resActive.musicStyle, 'upbeat-pulse');
    assert.ok(resSilent.peak > 0.02 && resSilent.peak <= 0.99);
    assert.ok(resActive.peak > 0.15 && resActive.peak <= 0.99);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('all 4 visual themes (professional, vibrant, dynamic, elegant) compile valid compositions and draw onto 1920x1080 canvas context', () => {
  assert.deepEqual(vgCatalog.visualThemes.map(t => t.id), ['professional', 'vibrant', 'dynamic', 'elegant']);
  const sampleScene = {
    id: 'theme-scene',
    title: '双环境错觉与生命周期',
    narration: '顶栏切到开发环境后资产消失。通过双轨治理彻底消除配置漂移。',
    screenText: '双环境错觉 · 双轨治理架构',
    visual: ''
  };
  for (const vt of vgCatalog.visualThemes) {
    for (const presetId of ['hero', 'compare', 'steps', 'outro']) {
      const comp = vgCatalog.buildTemplateComposition(presetId, sampleScene, vt.defaultPack, vt.id);
      const valid = composition.validate(comp);
      assert.equal(valid.visualTheme, vt.id);
      const ops = [];
      const mockCtx = {
        save() { ops.push('save'); },
        restore() { ops.push('restore'); },
        translate() {},
        rotate() {},
        scale() {},
        beginPath() {},
        closePath() {},
        moveTo() {},
        lineTo() {},
        arc() {},
        ellipse() {},
        rect() {},
        roundRect() { ops.push('roundRect'); },
        clip() {},
        fill() { ops.push('fill'); },
        stroke() { ops.push('stroke'); },
        fillRect() { ops.push('fillRect'); },
        fillText(txt) { ops.push('text:' + txt); },
        setLineDash() {},
        measureText(txt) { return { width: String(txt).length * 18 }; },
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; }
      };
      composition.draw(mockCtx, { ...sampleScene, composition: valid }, 0.5, null, [{ text: '字幕测试', start: 0, duration: 5 }], 5);
      assert.ok(ops.includes('fillRect'), `${vt.id}/${presetId} renders fluid gradient background`);
      assert.ok(ops.some(o => o.startsWith('text:')), `${vt.id}/${presetId} renders foreground typography`);
    }
  }
});

test('applyVisualThemeToScenes non-destructively restyles existing scenes while preserving custom narration, screenText, and detected TPL presets', () => {
  const customScenes = [
    {
      id: 'custom-shot-1',
      title: '自定义第一镜标题',
      narration: '这是用户手工修改过的第一镜旁白文案，绝不能被覆盖。',
      screenText: '手工主文案 A',
      visual: '',
      camera: 'push',
      anchors: ['overview'],
      composition: vgCatalog.buildTemplateComposition('compare', { title: '自定义第一镜标题', narration: '这是用户手工修改过的第一镜旁白文案，绝不能被覆盖。', screenText: '手工主文案 A' }, '01-A', 'professional')
    },
    {
      id: 'custom-shot-2',
      title: '自定义第二镜步骤',
      narration: '第一步收集，第二步校验，第三步发布。',
      screenText: '手工主文案 B',
      visual: '',
      camera: 'static',
      anchors: ['steps'],
      composition: vgCatalog.buildTemplateComposition('steps', { title: '自定义第二镜步骤', narration: '第一步收集，第二步校验，第三步发布。', screenText: '手工主文案 B' }, '01-A', 'professional')
    }
  ];

  assert.equal(vgCatalog.detectScenePreset(customScenes[0], 0, 2), 'compare');
  assert.equal(vgCatalog.detectScenePreset(customScenes[1], 1, 2), 'steps');

  const restyled = vgCatalog.applyVisualThemeToScenes(customScenes, 'elegant', '01-D');
  assert.equal(restyled.length, 2);
  assert.equal(restyled[0].id, 'custom-shot-1');
  assert.equal(restyled[0].narration, '这是用户手工修改过的第一镜旁白文案，绝不能被覆盖。');
  assert.equal(restyled[0].screenText, '手工主文案 A');
  assert.equal(restyled[0].composition.visualTheme, 'elegant');
  assert.equal(vgCatalog.detectScenePreset(restyled[0], 0, 2), 'compare');
  assert.equal(restyled[1].narration, '第一步收集，第二步校验，第三步发布。');
  assert.equal(restyled[1].composition.visualTheme, 'elegant');
  assert.equal(vgCatalog.detectScenePreset(restyled[1], 1, 2), 'steps');
});

test('captions layer renders active cue, stays empty during cue gaps/tail when real cues exist, and falls back to narration only when cues are absent', () => {
  const scene = {
    id: 'cap-scene',
    title: '字幕空档测试',
    narration: '默认回退旁白摘要文本',
    screenText: '主标题',
    composition: {
      background: '#0F172A',
      visualTheme: 'professional',
      layers: [
        { type: 'captions', x: 0.5, y: 0.91, width: 0.86, height: 0.12, fontSize: 40, weight: 700, fill: '#FFFFFF', align: 'center' }
      ]
    }
  };
  const cues = [
    { text: '第一句真实字幕', start: 0.5, duration: 1.5 },
    { text: '第二句真实字幕', start: 3.0, duration: 1.0 }
  ];
  const runDraw = (progress, cueList) => {
    const texts = [];
    const mockCtx = {
      save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
      beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, ellipse() {}, rect() {}, roundRect() {}, clip() {},
      fill() {}, stroke() {}, fillRect() {}, setLineDash() {},
      fillText(txt) { texts.push(txt); },
      measureText(txt) { return { width: String(txt).length * 18 }; },
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    };
    composition.draw(mockCtx, scene, progress, null, cueList, 5);
    return texts;
  };

  // Active cue window (t = 1.0s -> progress = 0.2)
  const activeTexts = runDraw(0.2, cues);
  assert.ok(activeTexts.some(t => t.includes('第一句真实字幕')), 'renders active cue when inside cue window');

  // Gap between cue 1 and cue 2 (t = 2.5s -> progress = 0.5)
  const gapTexts = runDraw(0.5, cues);
  assert.equal(gapTexts.length, 0, 'gap between cues renders no caption');

  // Tail after last cue (t = 4.5s -> progress = 0.9)
  const tailTexts = runDraw(0.9, cues);
  assert.equal(tailTexts.length, 0, 'tail after cues renders no caption');

  // No cues yet (pre-TTS preview): falls back to narration slice
  const fallbackTexts = runDraw(0.5, []);
  assert.ok(fallbackTexts.some(t => t.includes('默认回退旁白摘要文本')), 'without cues falls back to narration preview');
});

test('startPreviewBgm awaits AudioContext.resume() and propagates errors instead of swallowing them', async () => {
  const bgmModule = await import('../assets/video-studio-bgm.js');
  const bgm = bgmModule.default || bgmModule;
  const prevWindow = globalThis.window;
  try {
    globalThis.window = {
      AudioContext: class {
        constructor() { this.state = 'suspended'; this.sampleRate = 48000; }
        resume() { return Promise.reject(new Error('AudioContext autoplay blocked')); }
      }
    };
    await assert.rejects(
      () => bgm.startPreviewBgm('ambient-tech', true),
      /AudioContext autoplay blocked/
    );
  } finally {
    bgm.stopPreviewBgm();
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
  }
});




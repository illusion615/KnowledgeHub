import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createBridge } from '../scripts/copilot-bridge-server.mjs';
import { BridgeError, publicError } from '../scripts/copilot-runtime.mjs';
import { keys, planKey, exportKey, extractSource, defaultBrief, validateScenes, needsImage } from '../scripts/video-studio-model.mjs';
import composition from '../assets/video-studio-composition.js';

const artworkLayout = { background: '#182b36', layers: [
  { type: 'image', x: .5, y: .5, width: 1, height: 1 },
  { type: 'text', bind: 'screenText', x: .68, y: .3, width: .5, height: .4, fill: '#ffffff', fontSize: 64,
    keyframes: [{ at: 0, opacity: 0, y: .4 }, { at: .2, opacity: 1, y: .3 }] }
] };
const scene = { id: 'opening', title: '现场拜访', narration: '先核对事实，再确认行动。', visual: 'Refined paper collage, adult sales professional, navy and cream, blank left margin.',
  screenText: '先核对，再行动', camera: 'push', anchors: ['challenge'] };
test('dependency fingerprints isolate narration, camera, order and music changes', () => {
  const project = { brief: defaultBrief(), source: { hash: 'source' }, scenes: [scene, { ...scene, id: 'closing', narration: '下一步由你确认。' }] };
  const original = keys(project, scene);
  const narration = keys(project, { ...scene, narration: '换一句旁白。' });
  assert.equal(original.image, narration.image);
  assert.notEqual(original.voice, narration.voice);
  const camera = keys(project, { ...scene, camera: 'pull' });
  assert.equal(original.image, camera.image); assert.equal(original.voice, camera.voice);
  assert.equal(original.approval, camera.approval); assert.notEqual(original.clip, camera.clip);
  const order = { ...project, scenes: [...project.scenes].reverse() };
  assert.equal(keys(order, scene).clip, original.clip); assert.notEqual(exportKey(project), exportKey(order));
  const music = { ...project, brief: { ...project.brief, music: 'none' } };
  assert.equal(planKey(music), planKey(project)); assert.notEqual(exportKey(music), exportKey(project));
});
test('article extraction keeps translated facts, anchors and values without executable content', () => {
  const source = extractSource('<h1 data-zh="标题 &amp; 边界" data-en="Title">Old</h1><nav>ignore</nav><main><section id="challenge"><h2>挑战</h2><p data-zh="12 台 &lt; 20 台">stale English</p><input id="roi" value="600"><script>steal()</script></section></main>');
  assert.equal(source.title, '标题 & 边界'); assert.deepEqual(source.anchors, ['challenge', 'roi']);
  assert.match(source.text, /12 台 < 20 台/); assert.match(source.text, /roi=600/);
  assert.doesNotMatch(source.text, /steal|stale English|ignore/);
});
async function fixture(root, dataRoot, counters) {
  const server = createBridge({ root, runtimeFactory: async () => ({
    status: async () => ({ authenticated: true, models: [{ id: 'test-model', name: 'Test' }] }),
    chat: async (body, emit, options) => {
      counters.timeoutMs = options.timeoutMs;
      const request = JSON.parse(body.messages[1].content), directing = !!request.scenes;
      if (directing) { counters.direct = (counters.direct || 0) + 1; counters.feedback = request.feedback; }
      else counters.plan++;
      const invalid = counters.invalidPlan || counters.invalidOnce;
      counters.invalidOnce = false;
      emit({ choices: [{ delta: { content: invalid ? 'invalid JSON' : JSON.stringify({ creativeDirection: '以现场问题组织叙事，用景别与文字位置区分解释和行动。', scenes: directing ?
        request.scenes.map(item => ({ id: item.id, composition: artworkLayout })) : [{ ...scene, composition: artworkLayout }] }) } }] });
    },
    close: async () => {}
  }), studioOptions: { dataRoot, engine: {
    status: async () => ({ image: true, voice: true, renderer: true }),
    run: async (kind, input) => {
      counters[kind] = (counters[kind] || 0) + 1;
      if (counters.blockKind === kind && counters.blockScene === input.scene?.id) {
        counters.blocked = true;
        await new Promise((resolve, reject) => input.signal.addEventListener('abort', () => reject(input.signal.reason), { once: true }));
      }
      if (counters.failKind === kind && counters.failScene === input.scene?.id)
        throw new BridgeError(502, 'FIXTURE_MEDIA_FAILURE', '固定夹具素材失败，已保留完成项。');
      await writeFile(input.output, kind);
      return { frames: 150, duration: 5, cues: [{ text: scene.narration, start: .4, duration: 3 }] };
    }
  } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const boot = await fetch(base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' } });
  const cookie = boot.headers.get('set-cookie').split(';')[0], csrf = (await boot.json()).csrf;
  const headers = { Cookie: cookie, Origin: base, 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' };
  const call = async (path, body) => {
    const result = await fetch(base + '/api/copilot/studio/' + path, { method: body ? 'POST' : 'GET', headers, body: body && JSON.stringify(body) });
    return { status: result.status, data: await result.json() };
  };
  return { server, call, base, headers, close: () => new Promise(resolve => {server.close(resolve); server.closeAllConnections();}) };
}
async function wait(f, id, expected = 'done') {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const { data } = await f.call(id);
    if (!data.jobs.some(job => ['queued', 'running'].includes(job.status))) {
      assert.equal(data.jobs.at(-1).status, expected, data.jobs.at(-1).message);
      return data;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.fail('Studio job did not finish');
}
async function waitForBlock(counters) {
  const deadline = Date.now() + 30000;
  while (!counters.blocked && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(counters.blocked, true);
}
test('brief/storyboard approvals, direct rendering, cache reuse and interrupted recovery persist across servers', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-test-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0 };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><main><section id="challenge"><p>方案的证据与限制。</p></section></main>');
  let f = await fixture(root, dataRoot, counters);
  try {
    const opened = await Promise.all([f.call('open', { article: 'example' }), f.call('open', { article: 'example' })]);
    assert.ok(opened.every(result => result.status === 200));
    assert.equal(opened[0].data.id, opened[1].data.id);
    let response = opened[0], p = response.data;
    assert.equal(response.status, 200); assert.equal(counters.plan, 0);
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'plan', model: 'test-model', consent: true })).status, 409);
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: [], confirmBrief: true })).data;
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'plan', model: 'test-model', consent: false })).status, 403);
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'plan', model: 'test-model', consent: true })).status, 202);
    p = await wait(f, p.id);
    assert.equal(counters.plan, 1);
    assert.ok(counters.timeoutMs > 115000, 'long-form Studio design is not cut off by the Q&A request deadline');
    assert.match(p.creativeDirection, /叙事/);
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'image', sceneId: scene.id })).status, 409);
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    const missing = await f.call(p.id + '/jobs', { revision: p.revision, kind: 'clip', sceneId: scene.id });
    assert.equal(missing.status, 409); assert.equal(missing.data.error.code, 'ASSETS_MISSING');
    for (const kind of ['image', 'voice', 'image']) {
      assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind, sceneId: scene.id })).status, 202);
      p = await wait(f, p.id);
    }
    assert.equal(counters.image, 1, 'same image input uses persistent cache');
    assert.equal(p.scenes[0].assetsReady, true);
    assert.deepEqual(p.assetApprovals, {});
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'clip', sceneId: scene.id })).status, 202);
    p = await wait(f, p.id); assert.equal(p.canExport, true);
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'export' });
    p = await wait(f, p.id); assert.ok(p.currentExport);
    const oldRevision = p.revision, beforeVoice = p.scenes[0].artifacts.voice.key;
    p.scenes[0].composition.layers[0].x = .55;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: p.scenes })).data;
    assert.equal(p.scenes[0].artifacts.voice.key, beforeVoice); assert.equal(p.scenes[0].assetsReady, true);
    assert.equal(p.scenes[0].artifacts.clip, undefined); assert.equal(p.currentExport, null);
    assert.equal(p.planApproved, true, 'visual-only editing does not require narrative reapproval');
    assert.equal((await f.call(p.id + '/draft', { revision: oldRevision, brief: p.brief, scenes: p.scenes })).status, 409);
    counters.invalidPlan = true;
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'plan', model: 'test-model', consent: true });
    p = await wait(f, p.id, 'failed');
    assert.equal(p.scenes[0].composition.layers[0].x, .55, 'failed model output cannot replace the saved draft');
    assert.equal(counters.plan, 3, 'one bounded format repair, never an unlimited retry');
    p = (await f.call(p.id + '/cursor', { step: 4 })).data;
    const id = p.id;
    await f.close();
    const file = join(dataRoot, id, 'project.json'), stored = JSON.parse(await readFile(file, 'utf8'));
    stored.jobs.push({ id: 'j-interrupted', kind: 'image', status: 'running' });
    await writeFile(file, JSON.stringify(stored));
    f = await fixture(root, dataRoot, counters);
    p = (await f.call('open', { article: 'example' })).data;
    assert.equal(p.cursor, 4); assert.equal(p.jobs.at(-1).status, 'interrupted');
    assert.equal(counters.image, 1); assert.equal(counters.plan, 3, 'resume never automatically calls Copilot');
    await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">新版来源</section>');
    p = (await f.call(id)).data;
    assert.equal(p.stale, true);
    assert.equal((await f.call(id + '/jobs', { revision: p.revision, kind: 'plan', model: 'test-model', consent: true })).status, 409);
    assert.equal((await fetch(f.base + '/api/copilot/studio/' + id)).status, 403);
    const malicious = await fetch(f.base + '/api/copilot/studio/open', { method: 'POST',
      headers: { ...f.headers, Origin: 'https://evil.example' }, body: JSON.stringify({ article: 'example' }) });
    assert.equal(malicious.status, 403);
    assert.equal((await f.call('open', { article: '../secret' })).status, 400);
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});
test('one production action resumes through assets, rendering and export without further confirmations', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-produce-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0, blockKind: 'clip', blockScene: scene.id };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">制作依据</section>');
  const f = await fixture(root, dataRoot, counters);
  try {
    let p = (await f.call('open', { article: 'example' })).data;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: { ...p.brief, idea: '用人物处境而非技术名词开场' },
      scenes: [scene], confirmBrief: true })).data;
    const produce = () => f.call(p.id + '/jobs', { revision: p.revision, kind: 'produce' });
    assert.equal((await produce()).data.error.code, 'PLAN_APPROVAL');
    assert.equal(p.brief.idea, '用人物处境而非技术名词开场');
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    assert.equal((await produce()).status, 202);
    await waitForBlock(counters);
    assert.equal(counters.blocked, true, JSON.stringify((await f.call(p.id)).data.jobs.at(-1)));
    p = (await f.call(p.id)).data;
    await f.call(p.id + '/cancel', { jobId: p.jobs.at(-1).id });
    p = await wait(f, p.id, 'cancelled');
    assert.equal(p.jobs.at(-1).progress.completed, 2);
    counters.blockKind = null;
    assert.equal((await produce()).status, 202);
    p = await wait(f, p.id);
    assert.ok(p.currentExport);
    assert.equal(p.jobs.at(-1).progress.completed, 4);
    assert.equal(p.jobs.at(-1).progress.reused, 2);
    assert.equal(counters.image, 1); assert.equal(counters.voice, 1);
    assert.equal(counters.export, 1); assert.equal(counters.plan, 0);
    assert.deepEqual(p.assetApprovals, {});
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});
test('free compositions reject executable data and interpolate authored motion without imposing layouts', () => {
  const directed = composition.validate(artworkLayout);
  const start = composition.state(directed.layers[1], 0), end = composition.state(directed.layers[1], .2);
  assert.equal(start.opacity, 0); assert.equal(end.opacity, 1);
  assert.equal(composition.state(directed.layers[1], .1).y, .35);
  const source = { anchors: ['challenge'] };
  assert.equal(validateScenes([{ ...scene, screenText: '', composition: directed }], source)[0].screenText, '');
  assert.throws(() => composition.validate({ ...directed, script: 'fetch("/")' }), /无效字段/);
  assert.throws(() => composition.validate({ ...directed, layers: [{ ...directed.layers[0], src: 'https://remote.test/art.png' }] }), /无效字段/);
  assert.throws(() => composition.validate({ ...directed, layers: [{ ...directed.layers[0], x: NaN }] }), /范围/);
  assert.throws(() => composition.validate({ ...directed, layers: [{ ...directed.layers[0], keyframes: [{ at: .5 }, { at: .2 }] }] }), /递增/);
  const project = { brief: defaultBrief(), source: { hash: 'source' }, scenes: [scene] };
  const before = keys(project, scene), after = keys(project, { ...scene, composition: directed });
  assert.equal(before.image, after.image); assert.equal(before.voice, after.voice); assert.notEqual(before.clip, after.clip);
  const graphic = { ...scene, visual: '', composition: { background: '#ffffff', layers: [directed.layers[1]] } };
  assert.equal(validateScenes([graphic], source)[0].visual, '');
});
test('native groups, vector paths and camera motion do not require generated images or image prompts', () => {
  const graph = composition.validate({ background: '#ffffff', camera: { keyframes: [{ at: 0, scale: 1 }, { at: 1, scale: 1.4, x: .6 }] },
    layers: [{ type: 'group', x: .5, y: .5, width: .8, height: .8, children: [
      { type: 'path', x: .5, y: .5, width: .6, height: .3, fill: '#00000000', stroke: '#182b36', strokeWidth: 8,
        path: 'M0 500 H900 M700 300 L900 500 L700 700', keyframes: [{ at: 0, reveal: 0 }, { at: .5, reveal: 1 }] },
      { type: 'text', x: .5, y: .2, width: .8, height: .2, text: '请求 → 执行 → 返回', fontSize: 64, fill: '#182b36' }
    ] }] });
  const normalized = validateScenes([{ ...scene, visual: undefined, screenText: undefined, composition: graph }], { anchors: ['challenge'] })[0];
  assert.equal(normalized.visual, ''); assert.equal(normalized.screenText, ''); assert.equal(needsImage(normalized), false);
  assert.equal(composition.state(graph.camera, 1).scale, 1.4);
  assert.equal(composition.state(composition.nodes(graph)[1], .25).reveal, .5);
  graph.layers[0].children.push({ type: 'image', x: .5, y: .5, width: .2, height: .2 });
  assert.equal(needsImage({ composition: graph }), true, 'nested image assets are still generated when deliberately requested');
  assert.throws(() => composition.validate({ ...graph, layers: [{ ...graph.layers[0].children[0], path: '<svg onload="bad()">' }] }), /路径/);
  const timeout = publicError(new Error('Timeout after 115000ms waiting for session.idle at /private/sdk/path'));
  assert.equal(timeout.code, 'COPILOT_TIMEOUT'); assert.equal(timeout.status, 504);
  assert.doesNotMatch(timeout.message, /private|sdk|115000/);
});
test('AI redesign preserves existing content, media and narrative approval; graphics skip unused images', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-direct-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0 };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">证据</section>');
  const f = await fixture(root, dataRoot, counters);
  try {
    let p = (await f.call('open', { article: 'example' })).data;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, confirmBrief: true, scenes: [scene] })).data;
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'assets', assetKinds: ['image', 'voice'] });
    p = await wait(f, p.id);
    const before = keys(p, p.scenes[0]);
    const direct = { revision: p.revision, kind: 'direct', model: 'test-model', consent: false, direction: '不要固定左侧标题卡' };
    assert.equal((await f.call(p.id + '/jobs', direct)).status, 403);
    counters.invalidOnce = true;
    assert.equal((await f.call(p.id + '/jobs', { ...direct, consent: true })).status, 202);
    p = await wait(f, p.id);
    assert.equal(counters.direct, 2, 'the agent repairs invalid composition output once before applying it');
    assert.equal(counters.feedback, direct.direction);
    assert.equal(p.planApproved, true);
    assert.equal(p.scenes[0].narration, scene.narration);
    assert.equal(p.scenes[0].visual, scene.visual);
    assert.equal(p.scenes[0].artifacts.image.key, before.image);
    assert.equal(p.scenes[0].artifacts.voice.key, before.voice);
    assert.ok(p.scenes[0].composition);
    const version = p.revision;
    counters.invalidPlan = true;
    await f.call(p.id + '/jobs', { ...direct, revision: p.revision, consent: true });
    p = await wait(f, p.id, 'failed');
    assert.equal(p.revision, version); assert.ok(p.scenes[0].composition);
    p.scenes[0].composition.layers = [p.scenes[0].composition.layers[1]];
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: p.scenes })).data;
    assert.equal(p.scenes[0].imageRequired, false);
    assert.equal(p.scenes[0].assetsReady, true);
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'assets', assetKinds: ['image', 'voice'] });
    p = await wait(f, p.id);
    assert.equal(p.jobs.at(-1).progress.total, 1);
    assert.equal(counters.image, 1); assert.equal(counters.voice, 1);
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'clips' })).status, 202);
    p = await wait(f, p.id); assert.equal(p.canExport, true);
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});
test('batch assets save partial progress, resume after restart, cancel and reuse unchanged kinds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-batch-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0 };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">素材依据</section>');
  let f = await fixture(root, dataRoot, counters);
  try {
    let p = (await f.call('open', { article: 'example' })).data;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, confirmBrief: true,
      scenes: [scene, { ...scene, id: 'closing', narration: '确认以后再推进。', visual: 'A different original closing illustration.' }] })).data;
    const batch = assetKinds => ({ revision: p.revision, kind: 'assets', assetKinds });
    assert.equal((await f.call(p.id + '/jobs', batch(['image', 'voice']))).status, 409);
    assert.equal((await f.call(p.id + '/jobs', batch(['clip']))).status, 400);
    assert.equal((await f.call(p.id + '/jobs', batch(['voice', 'voice']))).status, 400);
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    counters.failKind = 'voice'; counters.failScene = 'closing';
    await f.call(p.id + '/jobs', batch(['image', 'voice']));
    p = await wait(f, p.id, 'failed');
    assert.equal(p.jobs.at(-1).progress.completed, 3);
    assert.equal(p.jobs.at(-1).progress.total, 4);
    assert.ok(p.scenes[0].artifacts.image && p.scenes[0].artifacts.voice);
    assert.ok(p.scenes[1].artifacts.image);
    assert.equal(p.scenes[1].artifacts.voice, undefined);
    assert.ok(p.scenes.every(item => !item.approved), 'batch must not approve assets');
    await f.close();
    counters.failKind = null;
    f = await fixture(root, dataRoot, counters);
    p = (await f.call('open', { article: 'example' })).data;
    assert.equal(p.jobs.at(-1).progress.completed, 3, 'partial progress persisted across service restart');
    await f.call(p.id + '/jobs', batch(['image', 'voice']));
    p = await wait(f, p.id);
    assert.equal(p.jobs.at(-1).progress.generated, 1);
    assert.equal(p.jobs.at(-1).progress.reused, 3);
    assert.equal(counters.image, 2);
    assert.equal(counters.voice, 3, 'only failed voice is generated again');
    p.scenes[1].visual = 'Revised closing artwork.';
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: p.scenes })).data;
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    counters.blockKind = 'image'; counters.blockScene = 'closing';
    await f.call(p.id + '/jobs', batch(['image']));
    await waitForBlock(counters);
    assert.equal(counters.blocked, true);
    p = (await f.call(p.id)).data;
    await f.call(p.id + '/cancel', { jobId: p.jobs.at(-1).id });
    p = await wait(f, p.id, 'cancelled');
    assert.equal(p.jobs.at(-1).progress.completed, 1);
    counters.blockKind = null;
    await f.call(p.id + '/jobs', batch(['image']));
    p = await wait(f, p.id);
    assert.equal(p.jobs.at(-1).progress.total, 2);
    assert.equal(p.jobs.at(-1).progress.reused, 1);
    assert.equal(p.jobs.at(-1).progress.generated, 1);
    const voiceCount = counters.voice;
    await f.call(p.id + '/jobs', batch(['voice']));
    p = await wait(f, p.id);
    assert.equal(counters.voice, voiceCount);
    assert.equal(p.jobs.at(-1).progress.reused, 2);
    assert.equal(counters.plan, 0); assert.equal(counters.clip || 0, 0); assert.equal(counters.export || 0, 0);
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});
test('render all needs current media, not approvals, and resumes partial renders with cache reuse', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-clips-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0 };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">渲染依据</section>');
  let f = await fixture(root, dataRoot, counters);
  try {
    let p = (await f.call('open', { article: 'example' })).data;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, confirmBrief: true,
      scenes: [scene, { ...scene, id: 'closing', narration: '另一段讲解。' }] })).data;
    const renderAll = () => f.call(p.id + '/jobs', { revision: p.revision, kind: 'clips' });
    assert.equal((await renderAll()).data.error.code, 'PLAN_APPROVAL');
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    assert.equal((await renderAll()).data.error.code, 'ASSETS_MISSING');
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'assets', assetKinds: ['image', 'voice'] });
    p = await wait(f, p.id);
    assert.ok(p.scenes.every(item => item.assetsReady));
    assert.deepEqual(p.assetApprovals, {});
    counters.failKind = 'clip'; counters.failScene = 'closing';
    assert.equal((await renderAll()).status, 202);
    p = await wait(f, p.id, 'failed');
    assert.equal(p.jobs.at(-1).progress.completed, 1);
    assert.equal(p.jobs.at(-1).progress.total, 2);
    assert.ok(p.scenes[0].artifacts.clip);
    assert.equal(p.canExport, false);
    await f.close();
    counters.failKind = null;
    f = await fixture(root, dataRoot, counters);
    assert.equal((await renderAll()).status, 202);
    p = await wait(f, p.id);
    assert.equal(p.jobs.at(-1).progress.generated, 1);
    assert.equal(p.jobs.at(-1).progress.reused, 1);
    assert.equal(p.canExport, true, 'all rendered clips can export without per-scene approval');
    const count = counters.clip;
    p.scenes[1].camera = 'pull';
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: p.scenes })).data;
    assert.equal(p.canExport, false);
    assert.equal((await renderAll()).data.error.code, 'PLAN_APPROVAL');
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    assert.equal((await renderAll()).status, 202);
    p = await wait(f, p.id);
    assert.equal(counters.clip, count + 1, 'only changed clips render again');
    assert.equal(p.jobs.at(-1).progress.reused, 1);
    assert.equal(p.canExport, true);
    assert.deepEqual(p.assetApprovals, {});
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'export' })).status, 202);
    p = await wait(f, p.id);
    assert.ok(p.currentExport);
    p.scenes[0].narration = '修改后的讲解需要重新配音。';
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, scenes: p.scenes })).data;
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    assert.equal(p.scenes[0].assetsReady, false);
    assert.equal((await renderAll()).data.error.code, 'ASSETS_MISSING', 'stale audio cannot pass readiness');
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});
test('explicit regeneration replaces successful items, retains failed or cancelled items and invalidates dependent video', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-studio-regenerate-'));
  const dataRoot = join(root, 'private/video-studio'), counters = { plan: 0 };
  await mkdir(join(root, 'posts/example'), { recursive: true });
  await writeFile(join(root, 'posts/example/index.html'), '<h1>Example</h1><section id="challenge">素材依据</section>');
  const f = await fixture(root, dataRoot, counters);
  try {
    let p = (await f.call('open', { article: 'example' })).data;
    p = (await f.call(p.id + '/draft', { revision: p.revision, brief: p.brief, confirmBrief: true,
      scenes: [scene, { ...scene, id: 'constructor' }] })).data;
    p = (await f.call(p.id + '/approve', { revision: p.revision, stage: 'plan' })).data;
    const assets = (force, kinds = ['image', 'voice']) =>
      f.call(p.id + '/jobs', { revision: p.revision, kind: 'assets', assetKinds: kinds, force });
    await assets(false); p = await wait(f, p.id);
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'clips' }); p = await wait(f, p.id);
    await f.call(p.id + '/jobs', { revision: p.revision, kind: 'export' }); p = await wait(f, p.id);
    const originals = p.scenes.map(item => ({ image: item.artifacts.image, voice: item.artifacts.voice }));
    const originalExport = p.currentExport.key;
    assert.equal((await assets('true')).status, 400);
    assert.equal((await f.call(p.id + '/jobs', { revision: p.revision, kind: 'clip', sceneId: scene.id, force: true })).status, 400);
    counters.blockKind = 'image'; counters.blockScene = scene.id;
    const queued = await assets(true);
    assert.equal(queued.status, 202);
    assert.equal(queued.data.jobs.at(-1).progress.total, 4, 'accepted task has a known total before media tools finish');
    assert.equal(queued.data.jobs.at(-1).progress.completed, 0);
    await waitForBlock(counters);
    p = (await f.call(p.id)).data;
    assert.equal(p.scenes[0].artifacts.image.key, originals[0].image.key, 'old material stays current until replacement succeeds');
    await f.call(p.id + '/cancel', { jobId: p.jobs.at(-1).id });
    p = await wait(f, p.id, 'cancelled');
    assert.equal(p.currentExport.key, originalExport, 'cancelling before replacement does not invalidate the current film');
    counters.blockKind = null;
    const before = { image: counters.image, voice: counters.voice };
    assert.equal((await assets(true)).status, 202);
    p = await wait(f, p.id);
    assert.equal(counters.image - before.image, 2, 'every requested scene actually regenerates, including identical inputs');
    assert.equal(counters.voice - before.voice, 2);
    assert.equal(p.jobs.at(-1).progress.generated, 4);
    assert.equal(p.jobs.at(-1).progress.reused, 0);
    assert.equal(p.planApproved, true);
    assert.equal(p.canExport, false); assert.equal(p.currentExport, null);
    assert.ok(p.scenes.every(item => !item.artifacts.clip));
    p.scenes.forEach((item, index) => {
      assert.notEqual(item.artifacts.image.key, originals[index].image.key);
      assert.notEqual(item.artifacts.voice.key, originals[index].voice.key);
    });
    assert.notEqual(p.scenes[0].artifacts.image.key, p.scenes[1].artifacts.image.key);
    assert.equal(await readFile(join(dataRoot, p.id, 'cache', originals[0].image.file), 'utf8'), 'image', 'old cached files are not destructively overwritten');
    const current = p.scenes.map(item => ({ image: item.artifacts.image.key, voice: item.artifacts.voice.key }));
    const counts = { image: counters.image, voice: counters.voice };
    await assets(false); p = await wait(f, p.id);
    assert.equal(counters.image, counts.image); assert.equal(counters.voice, counts.voice);
    assert.equal(p.jobs.at(-1).progress.reused, 4, 'fill-missing keeps the incremental cache behavior');
    counters.failKind = 'voice'; counters.failScene = 'constructor';
    await assets(true, ['voice']); p = await wait(f, p.id, 'failed');
    assert.equal(p.jobs.at(-1).progress.completed, 1);
    assert.equal(p.jobs.at(-1).progress.total, 2);
    assert.equal(p.scenes[0].artifacts.image.key, current[0].image);
    assert.notEqual(p.scenes[0].artifacts.voice.key, current[0].voice);
    assert.equal(p.scenes[1].artifacts.voice.key, current[1].voice, 'failed replacements retain the prior valid material');
  } finally { await f.close(); await rm(root, { recursive: true, force: true }); }
});

import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBridge } from '../scripts/copilot-bridge-server.mjs';
import { createRequire } from 'node:module';
import { runtimeRoot } from '../scripts/setup-video-studio.mjs';
import { openRuntime } from '../scripts/copilot-runtime.mjs';

if (process.env.KH_STUDIO_AGENT_CHECK !== '1' || !process.env.KH_STUDIO_AGENT_MODEL)
  throw new Error('This check uses real Copilot with at most one format repair. Set KH_STUDIO_AGENT_CHECK=1 and KH_STUDIO_AGENT_MODEL explicitly.');
const dataRoot = await mkdtemp(join(tmpdir(), 'kh-studio-agent-'));
let requests = 0, lastOutput = '';
const server = createBridge({ studioOptions: { dataRoot }, runtimeFactory: async signal => {
  const runtime = await openRuntime(signal);
  return { ...runtime, async chat(body, emit, options) {
    requests++; lastOutput = '';
    console.log('Real Copilot request:', requests);
    return runtime.chat(body, chunk => { lastOutput += chunk.choices?.[0]?.delta?.content || ''; emit(chunk); }, options);
  } };
} });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let project, browser, call;
try {
  const boot = await fetch(base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' } });
  const cookie = boot.headers.get('set-cookie').split(';')[0], csrf = (await boot.json()).csrf;
  const headers = { Cookie: cookie, Origin: base, 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' };
  call = async function (path, body) {
    const response = await fetch(base + '/api/copilot/studio/' + path, { method: body ? 'POST' : 'GET', headers,
      body: body && JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    const value = await response.json();
    assert.ok(response.ok, JSON.stringify(value.error));
    return value;
  };
  project = await call('open', { article: process.env.KH_STUDIO_AGENT_ARTICLE || 'obscura-headless-browser' });
  project = await call(project.id + '/draft', { revision: project.revision, scenes: [], confirmBrief: true,
    brief: { ...project.brief, seconds: 30, music: 'none',
      idea: '以30秒左右的简洁说明视频解释原文中的一个关键机制。请根据要传递的信息自主组织文字、图形、对象运动和运镜，不使用图像素材，不调用文生图。不要堆满屏幕，不追求形式种类数量；原文没有的数据不要编造。' } });
  console.log('Starting real Copilot design check (one bounded format repair allowed); original Studio projects are not modified.');
  project = await call(project.id + '/jobs', { revision: project.revision, kind: 'plan',
    model: process.env.KH_STUDIO_AGENT_MODEL, consent: true });
  const deadline = Date.now() + 10 * 60 * 1000;
  while (project.jobs.some(job => ['queued', 'running'].includes(job.status))) {
    if (Date.now() > deadline) {
      await call(project.id + '/cancel', { jobId: project.jobs.at(-1).id });
      throw new Error('Agent check exceeded its deadline.');
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    project = await call(project.id);
  }
  if (project.jobs.at(-1).status !== 'done' && process.env.KH_STUDIO_AGENT_OUTPUT)
    await writeFile(process.env.KH_STUDIO_AGENT_OUTPUT + '.failed.json', JSON.stringify({ error: project.jobs.at(-1).message, lastOutput }, null, 2), { flag: 'wx' });
  assert.equal(project.jobs.at(-1).status, 'done', project.jobs.at(-1).message);
  assert.ok(requests <= 2);
  assert.ok(project.scenes.length > 0);
  assert.ok(project.scenes.every(scene => !scene.imageRequired), 'Agent must respect the no-image creative brief');
  assert.ok(project.creativeDirection);
  const require = createRequire(join(runtimeRoot(), 'package.json'));
  const { chromium } = require('playwright');
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const page = await browser.newPage();
  await page.goto(base + '/video-studio.html');
  await page.addScriptTag({ url: base + '/assets/video-studio-composition.js' });
  await page.evaluate(scenes => {
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
    canvas.width = 1920; canvas.height = 1080;
    for (const scene of scenes) {
      const sentences = scene.narration.match(/[^。！？；]+[。！？；]?/g);
      const cues = sentences.map((text, index) => ({ text, start: index * 30 / sentences.length, duration: 30 / sentences.length }));
      for (const time of [0, .1, .25, .5, .75, .99])
        window.KHVideoComposition.draw(context, scene, time, null, cues, 30);
    }
  }, project.scenes);
  if (process.env.KH_STUDIO_AGENT_OUTPUT)
    await writeFile(process.env.KH_STUDIO_AGENT_OUTPUT, JSON.stringify({ creativeDirection: project.creativeDirection, scenes: project.scenes }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ realCopilot: true, requests, model: process.env.KH_STUDIO_AGENT_MODEL, scenes: project.scenes.length,
    generatedImages: 0, sampledCanvasFrames: project.scenes.length * 6, creativeDirection: project.creativeDirection }));
} finally {
  try {
    if (project?.jobs.some(job => ['queued', 'running'].includes(job.status))) {
      await call(project.id + '/cancel', { jobId: project.jobs.at(-1).id });
      const deadline = Date.now() + 30000;
      do {
        await new Promise(resolve => setTimeout(resolve, 100));
        project = await call(project.id);
      } while (project.jobs.some(job => ['queued', 'running'].includes(job.status)) && Date.now() < deadline);
      assert.ok(!project.jobs.some(job => ['queued', 'running'].includes(job.status)), 'Test job still stopping; temporary data retained at ' + dataRoot);
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    if (!project?.jobs.some(job => ['queued', 'running'].includes(job.status))) await rm(dataRoot, { recursive: true, force: true });
  }
}

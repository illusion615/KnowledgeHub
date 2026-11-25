import test from 'node:test';
import http from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createBridge, validateChat } from '../scripts/copilot-bridge-server.mjs';
import { sessionConfig, conversationPrompt, publicError, BridgeError, runtimeEnv } from '../scripts/copilot-runtime.mjs';
const body = { model: 'auto', consent: true, messages: [{ role: 'system', content: '全文'.repeat(5000) }, { role: 'user', content: '问题' }] };
async function fixture(options = {}) {
  let calls = [], closed = 0;
  const server = createBridge({ runtimeFactory: async signal => ({
    status: async () => ({ authenticated: false, models: [] }),
    chat: async (body, emit) => { calls.push(body); emit({ choices: [{ delta: { content: '你好 $x$' } }] }); },
    close: async () => { closed++; }
  }), ...options });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const boot = await fetch(base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' } });
  const cookie = boot.headers.get('set-cookie').split(';')[0], csrf = (await boot.json()).csrf;
  const headers = { Origin: base, Cookie: cookie, 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' };
  return { base, headers, calls, server, closed: () => closed, close: () => new Promise(r => { server.close(r); server.closeAllConnections(); }) };
}
test('strict text schema, role order, consent, no injection/attachments/config', () => {
  assert.equal(validateChat(body), body);
  for (const patch of [{ model: '--allow-all' }, { model: 'a\n--yolo' }, { consent: false }, { tools: [] }, { endpoint: 'http://evil' }, { cwd: '/' }, { messages: [{ role: 'system', content: 'a' }, { role: 'user', content: 'b', attachments: [] }] }])
    assert.throws(() => validateChat({ ...body, ...patch }));
  const config = sessionConfig('/isolated', 'auto', body.messages);
  assert.deepEqual(config.availableTools, []); assert.deepEqual(config.tools, []);
  assert.equal(config.enableFileHooks, false); assert.equal(config.enableSkills, false);
  assert.equal(config.onPermissionRequest().kind, 'denied-interactively-by-user');
  assert.equal(config.hooks.onPreToolUse().permissionDecision, 'deny');
  assert.equal(config.systemMessage.content, body.messages[0].content);
  assert.ok(conversationPrompt(body.messages).includes('问题'));
  assert.equal(runtimeEnv('/isolated').COPILOT_ALLOW_ALL, undefined);
  assert.equal(runtimeEnv('/isolated').GH_TOKEN, undefined);
  assert.equal(runtimeEnv('/isolated').COPILOT_DISABLE_KEYTAR, '1');
  const reused = runtimeEnv('/isolated', '/approved/bin/gh');
  assert.equal(reused.HOME, homedir(), 'Official gh may resolve the existing credential store');
  assert.equal(reused.COPILOT_HOME, '/isolated/state', 'Programming config remains isolated');
  assert.equal(reused.GH_PROMPT_DISABLED, '1');
  assert.equal(reused.PATH, '/approved/bin:/usr/bin:/bin');
  for (const key of ['GH_TOKEN', 'GITHUB_TOKEN', 'COPILOT_GITHUB_TOKEN', 'COPILOT_ALLOW_ALL', 'BASH_ENV', 'COPILOT_CUSTOM_INSTRUCTIONS_DIRS', 'NODE_OPTIONS'])
    assert.equal(reused[key], undefined);
  assert.equal(publicError(new Error('401 PRIVATE-TOKEN')).message.includes('PRIVATE'), false);
});
test('same-origin CSRF, static allowlist, models/status, full-context SSE', async () => {
  const f = await fixture();
  try {
    assert.equal((await fetch(f.base + '/api/copilot/bootstrap')).status, 403);
    assert.equal((await fetch(f.base + '/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1', Origin: 'https://evil.example' } })).status, 403);
    assert.equal((await fetch(f.base + '/api/copilot/status')).status, 403);
    const badHost = await new Promise(resolve => {
      http.get(f.base + '/api/copilot/status', { headers: { ...f.headers, Host: 'evil.test' } }, res => { res.resume(); resolve(res.statusCode); });
    });
    assert.equal(badHost, 403);
    const status = await fetch(f.base + '/api/copilot/status', { headers: f.headers });
    assert.deepEqual(await status.json(), { authenticated: false, models: [] });
    for (const path of ['/scripts/copilot-runtime.mjs', '/.git/config', '/assets/%2fetc/passwd', '/docs/copilot-provider-investigation.md'])
      assert.notEqual((await fetch(f.base + path)).status, 200);
    assert.equal((await fetch(f.base + '/copilot-test.html')).status, 200);
    const res = await fetch(f.base + '/api/copilot/chat', { method: 'POST', headers: f.headers, body: JSON.stringify(body) });
    assert.equal(res.status, 200); const text = await res.text(); assert.match(text, /你好/); assert.match(text, /\[DONE\]/);
    assert.equal(f.calls[0].messages[0].content, body.messages[0].content);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
    assert.equal((await fetch(f.base + '/api/copilot/chat', { method: 'POST', headers: f.headers, body: JSON.stringify({ ...body, consent: false }) })).status, 403);
    assert.equal((await fetch(f.base + '/api/copilot/chat', { method: 'POST', headers: f.headers, body: 'x'.repeat(1048577) })).status, 413);
    assert.equal(f.calls.length, 1);
    const crossBoot = await fetch(f.base + '/api/copilot/bootstrap', {
      headers: { 'X-KH-Bootstrap': '1', Origin: 'http://127.0.0.1:5000', 'Sec-Fetch-Site': 'same-site' }
    });
    assert.equal(crossBoot.status, 200);
    assert.equal(crossBoot.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5000');
    const crossData = await crossBoot.json();
    assert.ok(crossData.csrf && crossData.session);
    const crossStatus = await fetch(f.base + '/api/copilot/status', {
      headers: { Origin: 'http://127.0.0.1:5000', 'X-KH-CSRF': crossData.csrf, 'X-KH-Session': crossData.session, 'Sec-Fetch-Site': 'same-site' }
    });
    assert.equal(crossStatus.status, 200);
    const localhostBoot = await new Promise(resolve => {
      http.get(f.base + '/api/copilot/bootstrap', {
        headers: { Host: `localhost:${f.server.address().port}`, Origin: `http://localhost:${f.server.address().port}`, 'X-KH-Bootstrap': '1', 'Sec-Fetch-Site': 'cross-site' }
      }, res => { res.resume(); resolve(res.statusCode); });
    });
    assert.equal(localhostBoot, 200);
    const pnaOptions = await fetch(f.base + '/api/copilot/bootstrap', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://illusion615.github.io',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-kh-bootstrap',
        'Access-Control-Request-Private-Network': 'true'
      }
    });
    assert.equal(pnaOptions.status, 204);
    assert.equal(pnaOptions.headers.get('access-control-allow-origin'), 'https://illusion615.github.io');
    assert.equal(pnaOptions.headers.get('access-control-allow-private-network'), 'true');
    const pagesBoot = await fetch(f.base + '/api/copilot/bootstrap', {
      headers: { Origin: 'https://illusion615.github.io', 'X-KH-Bootstrap': '1', 'Sec-Fetch-Site': 'cross-site' }
    });
    assert.equal(pagesBoot.status, 200);
    const pagesData = await pagesBoot.json();
    assert.ok(pagesData.csrf && pagesData.session);
    const pagesStatus = await fetch(f.base + '/api/copilot/status', {
      headers: { Origin: 'https://illusion615.github.io', 'X-KH-CSRF': pagesData.csrf, 'X-KH-Session': pagesData.session, 'Sec-Fetch-Site': 'cross-site' }
    });
    assert.equal(pagesStatus.status, 200);
    const crossSiteIframeGet = await fetch(f.base + '/video-studio.html', {
      headers: { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Dest': 'iframe', 'Sec-Fetch-Mode': 'navigate' }
    });
    assert.equal(crossSiteIframeGet.status, 200);
    assert.match(crossSiteIframeGet.headers.get('content-security-policy') || '', /frame-ancestors.*https:\/\/illusion615\.github\.io/);
  } finally { await f.close(); }
});
test('timeout, busy, cancellation release own runtime and sanitize stream failure', async () => {
  let closes = 0;
  const f = await fixture({ timeoutMs: 150, runtimeFactory: async signal => ({
    chat: async (_body, emit) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
    close: async () => { closes++; }
  }) });
  try {
    const pending = fetch(f.base + '/api/copilot/chat', { method: 'POST', headers: f.headers, body: JSON.stringify(body) });
    await new Promise(r => setTimeout(r, 40));
    assert.equal((await fetch(f.base + '/api/copilot/status', { headers: f.headers })).status, 429);
    assert.equal((await pending).status, 504);
    assert.equal(closes, 1);
    const controller = new AbortController();
    const cancelled = fetch(f.base + '/api/copilot/chat', { method: 'POST', headers: f.headers, body: JSON.stringify(body), signal: controller.signal });
    await new Promise(r => setTimeout(r, 30)); controller.abort();
    await assert.rejects(cancelled); await new Promise(r => setTimeout(r, 30)); assert.equal(closes, 2);
  } finally { await f.close(); }
  const fail = await fixture({ runtimeFactory: async () => ({ chat: async (_b, emit) => { emit({ choices: [] }); throw new Error('429 private article token=secret'); }, close: async () => {} }) });
  try {
    const res = await fetch(fail.base + '/api/copilot/chat', { method: 'POST', headers: fail.headers, body: JSON.stringify(body) });
    const text = await res.text(); assert.match(text, /RATE_LIMIT/); assert.ok(!text.includes('private')); assert.ok(!text.includes('[DONE]'));
  } finally { await fail.close(); }
});
test('readonly local-music track routes support meta, Range 206, download headers, and block traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kh-music-test-'));
  const musicDir = join(root, 'private', 'minimax-music3');
  const postMediaDir = join(root, 'posts', 'demo-post', 'media');
  await mkdir(musicDir, { recursive: true });
  await mkdir(postMediaDir, { recursive: true });
  await writeFile(join(root, 'music-preview.html'), '<!doctype html><title>Preview</title>');
  await writeFile(join(postMediaDir, 'anim.gif'), Buffer.from('GIF89a'));
  await writeFile(join(postMediaDir, 'clip.mp4'), Buffer.from('0000ftypmp42'));
  await writeFile(join(musicDir, 'demo-track.meta.json'), JSON.stringify({ slug: 'demo-track', bpm: 100 }));
  await writeFile(join(musicDir, 'demo-track.wav'), Buffer.from('RIFF0000WAVEfmt '));
  const f = await fixture({ root });
  try {
    assert.equal((await fetch(f.base + '/music-preview.html')).status, 200);
    const gifRes = await fetch(f.base + '/posts/demo-post/media/anim.gif');
    assert.equal(gifRes.status, 200);
    assert.equal(gifRes.headers.get('content-type'), 'image/gif');
    const mp4RangeRes = await fetch(f.base + '/posts/demo-post/media/clip.mp4', { headers: { Range: 'bytes=4-7' } });
    assert.equal(mp4RangeRes.status, 206);
    assert.equal(await mp4RangeRes.text(), 'ftyp');
    const listRes = await fetch(f.base + '/api/local-music/tracks');
    assert.equal(listRes.status, 200);
    const listPayload = await listRes.json();
    assert.equal(listPayload.tracks.length, 1);
    assert.equal(listPayload.tracks[0].slug, 'demo-track');
    assert.equal(listPayload.tracks[0].hasWav, true);
    const metaRes = await fetch(f.base + '/api/local-music/tracks/demo-track.meta.json');
    assert.equal(metaRes.status, 200);
    assert.equal((await metaRes.json()).bpm, 100);
    const rangeRes = await fetch(f.base + '/api/local-music/tracks/demo-track.wav', { headers: { Range: 'bytes=0-3' } });
    assert.equal(rangeRes.status, 206);
    assert.equal(await rangeRes.text(), 'RIFF');
    const dlRes = await fetch(f.base + '/api/local-music/tracks/demo-track.wav?download=1');
    assert.equal(dlRes.status, 200);
    assert.match(dlRes.headers.get('content-disposition') || '', /attachment; filename="demo-track\.wav"/);
    assert.equal((await fetch(f.base + '/api/local-music/tracks/demo-track.wav', { method: 'POST' })).status, 405);
    assert.equal((await fetch(f.base + '/api/local-music/tracks/..%2fsecret.wav')).status, 403);
    assert.equal((await fetch(f.base + '/api/local-music/tracks/missing.wav')).status, 404);
  } finally {
    await f.close();
    await rm(root, { recursive: true, force: true });
  }
});

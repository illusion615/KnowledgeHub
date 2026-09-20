/* Optional Playwright regression. Default: intercepted fixtures, not model evidence.
   --live additionally runs four explicitly local NanoJev calls. Never calls cloud models.
   JEV_TEST_BASE_URL selects a loopback website backend (default http://127.0.0.1:8000).
   PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally selects an installed Chromium binary. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const core = require('../posts/jev-system-one-research/playground-core');
const { nativeRequest } = require('../scripts/jev-local-provider');
const base = process.env.JEV_TEST_BASE_URL || 'http://127.0.0.1:8000';
assert.equal(new URL(base).hostname, '127.0.0.1');
const provider = 'nanojev-fp32';
const status = { backend: 'study-room-jev-live-v1', csrf: 'c'.repeat(64), capabilities: { authentication_check: true }, providers: {
  vercel: { configured: true, ready: true, sdk_ready: true }, typesafe: { configured: true, ready: true, sdk_ready: true },
  [provider]: { local: true, model: 'BROWSER-TEST-FIXTURE', configured: true, ready: true, sdk_ready: true }
} };
async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    let calls = 0, mode = 'success', release, sent;
    await page.route('**/api/jev/status', route => route.fulfill({ json: status }));
    await page.route('**/api/jev/check', route => route.fulfill({ json: { check: { provider, authentication: 'verified', model_inference_performed: false }, providers: status.providers } }));
    await page.route('**/api/jev/evaluate', async route => {
      calls++;
      const request = route.request().postDataJSON();
      if (mode === 'failure') return route.fulfill({ status: 400, json: { error: { code: 'local_input_limit' } } });
      const response = core.fixtures()[0].response;
      response.model = 'BROWSER-TEST-FIXTURE'; response.answers.team.confidence = null; response.answers.severity.confidence = null;
      response.usage = { input_tokens: 390, output_tokens: 0 };
      if (mode === 'deferred') { const gate = new Promise(resolve => { release = resolve; }); sent(); await gate; }
      try { await route.fulfill({ json: { mode: 'live', provider, request: nativeRequest(request.state), response, latency_ms: 12, transport: 'browser-test-fixture', request_id: 'fixture-only' } }); } catch (_) { /* Cancelled browser request. */ }
    });
    await page.goto(base + '/posts/jev-system-one-research/?lang=zh');
    await page.waitForFunction(() => document.getElementById('jev-provider').value === 'nanojev-fp32');
    const phase = value => page.waitForFunction(v => document.getElementById('jev-result-panel').dataset.runState === v, value);
    assert.equal(await page.locator('#jev-result-panel').isVisible(), true);
    await phase('idle'); assert.equal(calls, 0);
    await page.locator('#jev-check-auth').click();
    await page.waitForFunction(() => document.getElementById('jev-feedback').textContent.includes('令牌检查通过'));
    await phase('idle'); assert.equal(calls, 0);
    async function run() {
      assert.equal(await page.locator('#jev-consent').isVisible(), false);
      assert.equal(await page.locator('#jev-run').isEnabled(), true);
      await page.locator('#jev-run').click();
    }
    mode = 'deferred'; let waiting = new Promise(resolve => { sent = resolve; });
    await run(); await waiting; await phase('running'); assert.equal(await page.locator('#jev-result-json').textContent(), '');
    release(); await phase('completed');
    let displayed = JSON.parse(await page.locator('#jev-result-json').textContent());
    assert.equal(displayed.answers.team.choice, 'technical'); assert.equal(displayed.answers.team.confidence, null);
    assert.equal(displayed.usage.output_tokens, 0); assert.match(await page.locator('#jev-result-team').textContent(), /technical/);
    assert.ok(!(await page.locator('#jev-policy').getAttribute('class')).includes('is-open'));
    const priorCalls = calls;
    await page.locator('#jev-policy .subsection-toggle').click();
    await page.locator('#jev-confidence').evaluate(e => { e.value = '0.2'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal(calls, priorCalls); assert.deepEqual(JSON.parse(await page.locator('#jev-result-json').textContent()), displayed);
    await page.locator('#jev-state').fill('Edited input'); await phase('invalidated');
    assert.equal(await page.locator('#jev-result-json').textContent(), ''); assert.equal(await page.locator('#jev-result-values').isVisible(), false);
    mode = 'failure'; await run(); await phase('failed');
    assert.match(await page.locator('#jev-result-note').textContent(), /512 tokens/);
    await page.locator('#jev-download-request').click(); await phase('failed');
    assert.match(await page.locator('#jev-result-note').textContent(), /512 tokens/);
    mode = 'deferred'; waiting = new Promise(resolve => { sent = resolve; }); await run(); await waiting;
    await page.locator('#jev-state').fill('New input while waiting'); release(); await page.waitForTimeout(150);
    await phase('invalidated'); assert.equal(await page.locator('#jev-result-json').textContent(), '');
    waiting = new Promise(resolve => { sent = resolve; }); await run(); await waiting;
    await page.locator('#jev-cancel').click(); release(); await page.waitForTimeout(150); await phase('cancelled');
    await page.locator('#jev-demo').click(); await phase('demo'); assert.match(await page.locator('#jev-run-status').textContent(), /没有运行模型/);
    await page.locator('[data-accordion]').filter({ has: page.locator('#jev-matches') }).locator('.subsection-toggle').click();
    await page.locator('#jev-matches').check(); await page.locator('#jev-import').click(); await phase('imported');
    assert.match(await page.locator('#jev-run-status').textContent(), /未验证/);
    await page.locator('#jev-provider').selectOption('typesafe'); await phase('invalidated');
    assert.equal(await page.locator('#jev-result-values').isVisible(), false);
    // Mock routes only: no cloud inference is performed by these approval checks.
    const localCalls = calls;
    assert.equal(await page.locator('#jev-consent').isVisible(), true);
    assert.equal(await page.locator('#jev-run').isDisabled(), true);
    await page.locator('#jev-consent').check();
    await page.locator('#jev-state').fill('Another input on the same cloud route');
    assert.equal(await page.locator('#jev-consent').isChecked(), true);
    assert.equal(await page.locator('#jev-run').isEnabled(), true);
    await page.locator('#jev-provider').selectOption('vercel');
    assert.equal(await page.locator('#jev-consent').isChecked(), false);
    assert.equal(await page.locator('#jev-run').isDisabled(), true);
    await page.locator('#jev-provider').selectOption('typesafe');
    assert.equal(await page.locator('#jev-consent').isChecked(), true);
    await page.locator('#jev-consent').uncheck();
    assert.equal(await page.locator('#jev-run').isDisabled(), true);
    await page.locator('#jev-consent').check();
    await page.reload();
    await page.waitForFunction(() => document.getElementById('jev-provider').value === 'nanojev-fp32');
    await page.locator('#jev-provider').selectOption('typesafe');
    assert.equal(await page.locator('#jev-consent').isChecked(), false);
    assert.equal(await page.locator('#jev-run').isDisabled(), true);
    assert.equal(calls, localCalls);
    assert.deepEqual(errors, []); await page.close();
    console.log('PASS fixture UI states: idle, auth-only, running, complete, failure, stale, cancelled, demo, import; policy never replaces model output');

    if (process.argv.includes('--live')) {
      for (const lang of ['zh', 'en']) for (const mobile of [false, true]) {
        const p = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
        const failures = []; p.on('pageerror', e => failures.push(e.message));
        await p.goto(base + '/posts/jev-system-one-research/?lang=' + lang + '&theme=' + (lang === 'en' ? 'dark' : 'light'));
        await p.waitForFunction(() => document.getElementById('jev-provider').value === 'nanojev-fp32');
        if (mobile) await p.locator('#jev-provider').selectOption('nanojev-4bit');
        assert.equal(await p.locator('#jev-result-panel').isVisible(), true);
        assert.equal(await p.locator('#jev-consent').isVisible(), false);
        assert.equal(await p.locator('#jev-run').isEnabled(), true);
        const got = p.waitForResponse(r => r.url().endsWith('/api/jev/evaluate'));
        await p.locator('#jev-run').click(); const reply = await got; assert.equal(reply.status(), 200); const data = await reply.json();
        await p.waitForFunction(() => document.getElementById('jev-result-panel').dataset.runState === 'completed');
        assert.deepEqual(JSON.parse(await p.locator('#jev-result-json').textContent()), data.response);
        assert.match(await p.locator('#jev-result-team').textContent(), new RegExp(data.response.answers.team.choice));
        assert.equal(data.local_execution.network_model_calls, 0); assert.equal(data.local_execution.autoregressive_decode_steps, 0);
        const bounds = await p.locator('#jev-result-panel').evaluate(e => ({ top: e.getBoundingClientRect().top, width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(bounds.scroll <= bounds.width + 1); if (mobile) assert.ok(bounds.top >= 0 && bounds.top < 160, JSON.stringify(bounds));
        const sections = p.locator('main > section');
        for (let i = 0; i < await sections.count(); i++) { await sections.nth(i).scrollIntoViewIfNeeded(); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
        if (process.env.JEV_SCREENSHOT_DIR) {
          await p.locator(mobile ? '#jev-result-panel' : '#jev-workspace').evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await p.screenshot({ path: process.env.JEV_SCREENSHOT_DIR + '/output-' + lang + '-' + (mobile ? 'mobile' : 'desktop') + '.png' });
        }
        assert.deepEqual(failures, []); await p.close();
      }
      console.log('PASS four real local calls: bilingual desktop/mobile, matching visible JSON, mobile result reveal, no cloud inference');
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

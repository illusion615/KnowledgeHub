// Real browser + production HTTP bridge, fake runtime only. No accounts or inference.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const { createBridge } = await import('../scripts/copilot-bridge-server.mjs');
  const { BridgeError } = await import('../scripts/copilot-runtime.mjs');
  const calls = []; let cancelCount = 0;
  const server = createBridge({ runtimeFactory: async signal => ({
    status: async () => ({ authenticated: true, models: [{ id: 'fixture-model', name: 'Fixture model' }] }),
    chat: async (body, emit) => {
      calls.push(body);
      const query = body.messages.at(-1).content;
      if (query === 'error') throw new BridgeError(413, 'CONTEXT_LIMIT', '上下文超限，未截断');
      if (query === 'cancel') return new Promise((_, reject) => { signal.addEventListener('abort', () => { cancelCount++; reject(signal.reason); }); });
      for (const content of ['## 固定回复\n\n', '你好，', '公式 $x^2$。\n\n', '|甲|乙|\n|-|-|\n|1|2|']) {
        emit({ choices: [{ delta: { content } }] }); await new Promise(r => setTimeout(r, 30));
      }
    }, close: async () => {}
  }) });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const context = await browser.newContext();
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  try {
    await page.goto(base + '/');
    await page.locator('#settings-toggle').click();
    await page.locator('#llm-provider').selectOption('github-copilot');
    assert.equal(await page.locator('#field-apikey').isHidden(), true);
    assert.equal(await page.locator('#field-endpoint').isHidden(), true);
    await page.locator('#llm-test').click();
    await page.waitForFunction(() => document.getElementById('llm-status').textContent.includes('官方登录有效'));
    await page.locator('#llm-model-select').selectOption('fixture-model');
    await page.locator('#llm-save').click();
    await page.reload(); await page.locator('#settings-toggle').click();
    assert.equal(await page.locator('#llm-provider').inputValue(), 'github-copilot');
    assert.equal(await page.locator('#llm-model').inputValue(), 'fixture-model');
    assert.equal(calls.length, 0, 'status does not infer');
    await page.goto(base + '/copilot-test.html');
    await page.locator('#save').click();
    await page.waitForSelector('.assistant-dialog.is-open');
    await page.evaluate(() => { document.querySelector('main').appendChild(document.createTextNode('全'.repeat(8000) + '全文末尾证据')); });
    page.once('dialog', d => d.dismiss());
    await page.locator('.assistant-input').fill('first'); await page.locator('.assistant-send').click();
    assert.equal(calls.length, 0, 'declining consent blocks request');
    page.once('dialog', d => d.accept()); await page.locator('.assistant-send').click();
    await page.waitForFunction(() => document.querySelector('.assistant-msg-footer')?.dataset.state === 'complete');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].messages.length, 2, 'current question occurs only once');
    assert.ok(calls[0].messages[0].content.includes('全文末尾证据'));
    assert.ok(calls[0].messages[0].content.includes('概率为零'));
    assert.ok(!calls[0].messages[0].content.includes('node scripts/copilot-login'));
    await page.waitForSelector('.assistant-msg-ai .katex');
    assert.equal(await page.locator('.assistant-table-scroll').count(), 1);
    await page.locator('.assistant-expand').click();
    await page.locator('.assistant-input').fill('second'); await page.locator('.assistant-send').click();
    await page.waitForFunction(() => document.querySelectorAll('.assistant-msg-footer[data-state="complete"]').length === 2);
    assert.deepEqual(calls[1].messages.map(m => m.role), ['system', 'user', 'assistant', 'user']);
    await page.locator('.assistant-input').fill('error'); await page.locator('.assistant-send').click();
    await page.waitForSelector('.assistant-msg-footer[data-state="error"]');
    assert.match(await page.locator('.assistant-message-error').last().textContent(), /未截断/);
    await page.locator('.assistant-input').fill('cancel'); await page.locator('.assistant-send').click();
    await page.waitForFunction(() => document.querySelector('.assistant-send').textContent === '停止');
    await page.waitForTimeout(100); await page.locator('.assistant-send').click();
    await page.waitForFunction(() => document.querySelectorAll('.assistant-msg-footer[data-state="error"]').length === 2);
    await page.waitForTimeout(100); assert.equal(cancelCount, 1);
    await page.locator('.assistant-input').fill('recovery'); await page.locator('.assistant-send').click();
    await page.waitForFunction(() => document.querySelectorAll('.assistant-msg-footer[data-state="complete"]').length === 3);
    assert.deepEqual(calls.at(-1).messages.map(m => m.role), ['system', 'user', 'assistant', 'user', 'assistant', 'user']);
    assert.equal(calls.at(-1).messages.some(m => m.content === 'cancel' || m.content === 'error'), false);
    assert.deepEqual(errors, []);
    console.log('PASS browser: settings/model restore, no inference on status, consent, full context, multi-turn, streamed Markdown/math, error, cancel, recovery');
  } finally { await context.close(); await browser.close(); await new Promise(r => { server.close(r); server.closeAllConnections(); }); }
})().catch(e => { console.error(e); process.exitCode = 1; });

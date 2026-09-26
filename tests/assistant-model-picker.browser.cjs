/* Isolated Chromium contexts, fake model endpoints and byte streams only.
 * Exercises the real shared widget and the homepage settings; no login/cloud calls.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const evidence = path.join(__dirname, '../.tmp/copilot-evidence');
fs.mkdirSync(evidence, { recursive: true });
(async () => {
  const { createBridge } = await import('../scripts/copilot-bridge-server.mjs');
  let unexpectedRuntime = 0;
  const server = createBridge({ runtimeFactory: async () => { unexpectedRuntime++; throw new Error('No real runtime allowed'); } });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const settingsFor = (provider, hidden = false) => ({ provider,
    endpoint: provider === 'github-copilot' ? '/api/copilot' : base + '/mock/' + provider,
    model: hidden ? 'secret-current-model' : 'old-model', apikey: 'FAKE-KEY', bearerToken: 'FAKE-BEARER',
    apiVersion: '2024-12-01-preview', azureAuthType: 'apikey', showModelName: !hidden,
    extraFutureSetting: { preserve: true } });
  async function make(provider, hidden = false, mobile = false) {
    const settings = settingsFor(provider, hidden);
    const context = await browser.newContext({ viewport: mobile ? { width: 320, height: 740 } : { width: 1280, height: 900 } });
    await context.addInitScript(({ settings }) => {
      if (!localStorage.getItem('llm-settings')) localStorage.setItem('llm-settings', JSON.stringify(settings));
      window.modelLists = []; window.chatCalls = []; window.listMode = 'normal';
      const actualFetch = window.fetch.bind(window);
      window.fetch = async (input, init = {}) => {
        const url = new URL(input, location.href), path = url.pathname;
        const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
        if (path === '/api/copilot/status' || path.endsWith('/models') || path.endsWith('/api/tags')) {
          window.modelLists.push({ path, method: init.method || 'GET', headers: init.headers });
          let ids = ['old-model', 'next-model', 'third-model'];
          if (window.listMode === 'deferred') ids = await new Promise(resolve => { window.resolveList = resolve; }); // deliberately ignores abort: stale guard must still win
          if (window.listMode === 'error') return json({ error: { message: '固定列表错误，未切换' } }, 503);
          if (window.listMode === 'network') throw new TypeError('Failed to fetch');
          if (window.listMode === 'empty') ids = [];
          if (window.listMode === 'many') ids = ['old-model', ...Array.from({ length: 90 }, (_, i) => 'model-' + String(i).padStart(3, '0')), 'a-very-long-model-name-'.repeat(6)];
          if (window.listMode === 'unauth') return json({ authenticated: false, models: [] });
          if (path === '/api/copilot/status') return json({ authenticated: true, models: ids.map(id => ({ id })) });
          if (path.endsWith('/api/tags')) return json({ models: ids.map(name => ({ name })) });
          return json({ data: ids.map(id => ({ id })) });
        }
        if (path.endsWith('/chat/completions') || path.endsWith('/api/chat') || path === '/api/copilot/chat') {
          window.chatCalls.push({ path, body: JSON.parse(init.body), headers: init.headers });
          const ollama = path.endsWith('/api/chat');
          const encoder = new TextEncoder();
          return new Response(new ReadableStream({ start(controller) {
            window.finishModelReply = () => {
              const text = ollama ? JSON.stringify({ message: { content: '固定回复 $x^2$' }, done: true }) + '\n'
                : 'data: ' + JSON.stringify({ choices: [{ delta: { content: '固定回复 $x^2$' } }] }) + '\n\ndata: [DONE]\n\n';
              for (const byte of encoder.encode(text)) controller.enqueue(new Uint8Array([byte]));
              controller.close();
            };
          } }), { headers: { 'Content-Type': 'text/event-stream' } });
        }
        return actualFetch(input, init);
      };
    }, { settings });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === '/posts/model-picker-fixture/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文章夹具</title><body><main><h1>模型切换文章</h1><p>正文与公式 $x^2$。</p></main><script src="/assets/article-assistant.js"></script></body></html>' });
      return route.continue();
    });
    await page.goto(base + '/posts/model-picker-fixture/'); await page.locator('.assistant-fab').click();
    return { page, context, settings, errors };
  }
  async function open(page) {
    await page.locator('.assistant-model-toggle').click();
    await page.waitForFunction(() => !document.querySelector('.assistant-model-panel').hasAttribute('aria-busy'));
  }
  async function select(page, model) {
    await page.locator('.assistant-model-search').fill(model);
    await page.getByRole('option', { name: model, exact: true }).click();
  }
  async function send(page, query, count) {
    await page.locator('.assistant-input').fill(query); await page.locator('.assistant-send').click();
    await page.waitForFunction(n => window.chatCalls.length === n, count);
  }
  async function finish(page, count) {
    await page.evaluate(() => window.finishModelReply());
    await page.waitForFunction(n => document.querySelectorAll('.assistant-msg-footer[data-state="complete"]').length === n, count);
  }
  try {
    for (const provider of ['github-copilot', 'ollama', 'openai-compat']) {
      const t = await make(provider); const { page } = t;
      let consents = 0; page.on('dialog', async dialog => { consents++; await dialog.accept(); });
      assert.equal(await page.evaluate(() => window.modelLists.length), 0, 'no discovery until clicked');
      await send(page, '第一问', 1);
      assert.equal(await page.locator('.assistant-model-toggle').isDisabled(), true, 'stream locks switch');
      await page.locator('.assistant-model-toggle').dispatchEvent('click');
      assert.equal(await page.locator('.assistant-model-panel').isHidden(), true);
      assert.equal(await page.evaluate(() => window.modelLists.length), 0);
      await finish(page, 1);
      const stamp = await page.locator('.assistant-request-model').first().textContent(); assert.match(stamp, /old-model/);
      await page.waitForTimeout(280); // Let the dialog's existing opening transition settle.
      const before = await page.locator('.assistant-messages').boundingBox();
      await open(page);
      assert.deepEqual(await page.locator('.assistant-messages').boundingBox(), before, 'popup never squeezes chat');
      assert.equal(await page.locator('[role="option"][aria-selected="true"]').count(), 1);
      assert.match(await page.locator('[role="option"][aria-selected="true"]').textContent(), /old-model.*✓/);
      const list = await page.evaluate(() => window.modelLists[0]);
      assert.equal(list.method, 'GET');
      assert.equal(list.path, provider === 'github-copilot' ? '/api/copilot/status' : provider === 'ollama' ? '/mock/ollama/api/tags' : '/mock/openai-compat/models');
      if (provider === 'openai-compat') assert.equal(list.headers.Authorization, 'Bearer FAKE-KEY');
      await select(page, 'next-model');
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('llm-settings'))), { ...t.settings, model: 'next-model' });
      assert.equal(await page.evaluate(() => window.chatCalls.length), 1, 'switch never infers');
      assert.equal(await page.locator('.assistant-request-model').first().textContent(), stamp, 'history attribution frozen');
      await send(page, '第二问', 2); await finish(page, 2);
      const requests = await page.evaluate(() => window.chatCalls);
      assert.equal(requests[0].body.model, 'old-model'); assert.equal(requests[1].body.model, 'next-model');
      assert.deepEqual(requests[1].body.messages.map(m => m.role), ['system', 'user', 'assistant', 'user']);
      assert.equal(requests[1].body.messages[1].content, '第一问');
      assert.match(requests[1].body.messages[2].content, /固定回复/);
      assert.equal(requests[1].body.messages[3].content, '第二问');
      assert.match(await page.locator('.assistant-request-model').last().textContent(), /next-model/);
      assert.equal(consents, provider === 'github-copilot' ? 1 : 0, 'existing consent boundary unchanged');
      assert.deepEqual(t.errors, []); await t.context.close();
      console.log('PASS list source / model-only persistence / history / stream lock:', provider);
    }
    // Hidden model names, absent current model, native keyboard/focus and narrow mobile.
    const hidden = await make('openai-compat', true, true); const p = hidden.page;
    assert.equal(await p.locator('.assistant-model-toggle').getAttribute('aria-label'), '选择模型');
    await p.locator('.assistant-model-toggle').focus(); await p.keyboard.press('Enter');
    await p.waitForSelector('.assistant-model-option');
    assert.match(await p.locator('.assistant-model-status').textContent(), /未出现在列表/);
    assert.equal(await p.locator('[role="option"][aria-selected="true"]').count(), 0, 'no selected-name disclosure');
    assert.equal(await p.locator('.assistant-model-check').allTextContents().then(v => v.join('')), '');
    assert.ok(!(await p.locator('.assistant-dialog').evaluate(el => el.outerHTML)).includes('secret-current-model'));
    assert.equal(await p.locator('.assistant-model-search').evaluate(el => el === document.activeElement), true);
    assert.ok(await p.locator('.assistant-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('.assistant-model-toggle').evaluate(el => el === document.activeElement), true);
    await open(p); await p.locator('.assistant-model-search').fill('NEXT');
    assert.equal(await p.locator('.assistant-model-option').count(), 1);
    await p.keyboard.press('ArrowDown');
    assert.ok(await p.locator('.assistant-model-search').getAttribute('aria-activedescendant'));
    await p.keyboard.press('Enter');
    assert.equal(await p.locator('.assistant-model-toggle').textContent(), '选择模型 ▾');
    await send(p, '隐藏名称', 1); await finish(p, 1);
    assert.equal(await p.locator('.assistant-request-model').textContent(), '');
    assert.equal(await p.locator('.assistant-request-model').getAttribute('title'), '');
    assert.deepEqual(hidden.errors, []); await hidden.context.close();
    console.log('PASS hidden names, current missing, 320px, keyboard and focus');

    const stale = await make('github-copilot'); const q = stale.page;
    await q.evaluate(() => { window.listMode = 'deferred'; });
    await q.locator('.assistant-model-toggle').click();
    await q.waitForFunction(() => window.resolveList);
    assert.equal(await q.locator('.assistant-model-panel').getAttribute('aria-busy'), 'true');
    assert.equal(await q.locator('.assistant-model-option').count(), 0);
    await q.evaluate(() => { window.oldResolve = window.resolveList; });
    await q.locator('.assistant-model-close').click();
    await q.evaluate(() => { window.listMode = 'normal'; }); await open(q); await select(q, 'next-model');
    await q.evaluate(() => window.oldResolve(['stale-model'])); await q.waitForTimeout(100);
    assert.equal(await q.locator('.assistant-model-panel').isHidden(), true);
    assert.equal(await q.evaluate(() => JSON.parse(localStorage.getItem('llm-settings')).model), 'next-model');
    for (const mode of ['error', 'empty', 'unauth', 'network']) {
      await q.evaluate(mode => { window.listMode = mode; }, mode); await open(q);
      assert.equal(await q.locator('.assistant-model-option').count(), 0);
      assert.match(await q.locator('.assistant-model-status').textContent(), mode === 'empty' ? /没有可选模型/ : mode === 'unauth' ? /未登录/ : /错误|失败|无法读取/);
      assert.equal(await q.evaluate(() => JSON.parse(localStorage.getItem('llm-settings')).model), 'next-model');
      await q.locator('.assistant-model-close').click();
    }
    await q.evaluate(() => { window.listMode = 'normal'; }); await open(q);
    await q.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('llm-settings')); saved.endpoint = '/other-provider';
      localStorage.setItem('llm-settings', JSON.stringify(saved));
      window.dispatchEvent(new StorageEvent('storage', { key: 'llm-settings' }));
    });
    assert.equal(await q.locator('.assistant-model-option').count(), 0);
    await q.locator('.assistant-model-refresh').click();
    await q.waitForFunction(() => !document.querySelector('.assistant-model-panel').hasAttribute('aria-busy'));
    assert.match(await q.locator('.assistant-model-status').textContent(), /连接设置已在其他页面改变/);
    assert.equal(await q.evaluate(() => window.chatCalls.length), 0);
    assert.deepEqual(stale.errors, []); await stale.context.close();
    console.log('PASS loading, stale completion, errors, empty/unauthenticated, changed connection');

    const pending = await make('github-copilot'); const s = pending.page;
    s.on('dialog', d => d.accept());
    await s.evaluate(() => { window.listMode = 'deferred'; });
    await s.locator('.assistant-model-toggle').click(); await s.waitForFunction(() => window.resolveList);
    await send(s, '列表未完成时发问', 1);
    assert.equal(await s.locator('.assistant-model-toggle').isDisabled(), true);
    await s.evaluate(() => window.resolveList(['must-not-switch'])); await s.waitForTimeout(100);
    assert.equal(await s.locator('.assistant-model-panel').isHidden(), true);
    assert.equal(await s.locator('.assistant-model-option').count(), 0);
    assert.equal(await s.evaluate(() => window.chatCalls[0].body.model), 'old-model');
    await finish(s, 1); assert.equal(await s.locator('.assistant-model-toggle').isEnabled(), true);
    await pending.context.close(); console.log('PASS sending invalidates pending discovery; late response cannot unlock/switch');

    const azure = await make('azure-openai'); await open(azure.page);
    assert.equal(await azure.page.evaluate(() => window.modelLists.length), 0, 'Azure assistant must not equate catalog and deployments');
    assert.match(await azure.page.locator('.assistant-model-status').textContent(), /部署列表/);
    assert.equal(await azure.page.locator('.assistant-model-option').count(), 0);
    await azure.page.locator('.assistant-model-close').click();
    await send(azure.page, '部署不改', 1); await finish(azure.page, 1);
    assert.match(await azure.page.evaluate(() => window.chatCalls[0].path), /deployments\/old-model\/chat\/completions/);
    assert.deepEqual(await azure.page.evaluate(() => JSON.parse(localStorage.getItem('llm-settings'))), azure.settings);
    await azure.context.close(); console.log('PASS Azure deployment boundary and unchanged chat route');

    // Compact anchored popup, many rows, search, current check, available-height
    // shrink, list-only scrolling and keyboard navigation in all panel sizes.
    const compact = await make('openai-compat'); const v = compact.page;
    await v.evaluate(() => { window.listMode = 'many'; });
    for (const layout of ['normal', 'expanded', 'mobile', 'short']) {
      if (layout === 'expanded') await v.locator('.assistant-expand').click();
      if (layout === 'mobile') { await v.locator('.assistant-expand').click(); await v.setViewportSize({ width: 320, height: 740 }); }
      if (layout === 'short') await v.setViewportSize({ width: 390, height: 360 });
      await v.waitForTimeout(280);
      const prior = await v.locator('.assistant-messages').boundingBox();
      await open(v); await v.waitForTimeout(60);
      const metrics = await v.evaluate(() => {
        const panel = document.querySelector('.assistant-model-panel'), list = document.querySelector('.assistant-model-list');
        const rect = e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height }; };
        const before = document.querySelector('.assistant-messages').scrollTop;
        list.scrollTop = 100;
        return { panel: rect(panel), dialog: rect(document.querySelector('.assistant-dialog')), list: rect(list),
          rows: list.children.length, rowHeight: rect(list.firstChild).height, internalScroll: list.scrollTop,
          chatScrollUnchanged: before === document.querySelector('.assistant-messages').scrollTop,
          viewport: { width: innerWidth, height: innerHeight }, nativeSelects: panel.querySelectorAll('select').length,
          horizontalOverflow: panel.scrollWidth - panel.clientWidth };
      });
      assert.equal(metrics.nativeSelects, 0); assert.equal(metrics.rows, 92);
      assert.ok(metrics.list.height <= 260 && metrics.list.height > 0, JSON.stringify(metrics));
      assert.ok(metrics.internalScroll > 0 && metrics.chatScrollUnchanged);
      assert.equal(metrics.rowHeight, 36); assert.ok(metrics.horizontalOverflow <= 1);
      assert.ok(metrics.panel.left >= metrics.dialog.left && metrics.panel.right <= metrics.dialog.right + 1);
      assert.ok(metrics.panel.top >= Math.max(0, metrics.dialog.top) && metrics.panel.bottom <= Math.min(metrics.viewport.height, metrics.dialog.bottom) + 1, JSON.stringify(metrics));
      assert.deepEqual(await v.locator('.assistant-messages').boundingBox(), prior);
      await v.locator('.assistant-model-search').fill('no-such-model');
      assert.equal(await v.locator('.assistant-model-option').count(), 0);
      assert.match(await v.locator('.assistant-model-status').textContent(), /没有匹配/);
      await v.locator('.assistant-model-search').fill('model-');
      await v.keyboard.press('ArrowDown'); await v.keyboard.press('End');
      assert.equal(await v.locator('.assistant-model-search').getAttribute('aria-activedescendant'), 'assistant-model-option-90');
      await v.keyboard.press('Home');
      assert.equal(await v.locator('.assistant-model-search').getAttribute('aria-activedescendant'), 'assistant-model-option-0');
      await v.screenshot({ path: path.join(evidence, 'model-popup-' + layout + '.png') });
      await v.keyboard.press('Escape');
      assert.equal(await v.locator('.assistant-model-toggle').evaluate(e => e === document.activeElement), true);
      await open(v); await v.locator('.assistant-header h3').click();
      assert.equal(await v.locator('.assistant-model-panel').isHidden(), true, 'outside click closes');
    }
    await compact.context.close(); console.log('PASS compact overlay: 92 rows, 260px cap, single lines, internal scroll, search, keyboard, normal/expanded/mobile/short');

    // Homepage uses the shared adapter; obsolete settings requests cannot fill another provider.
    for (const provider of ['ollama', 'openai-compat', 'azure-openai']) {
      const t = await make(provider); const r = t.page;
      await r.goto(base + '/'); await r.locator('#settings-toggle').click(); await r.locator('#llm-test').click();
      await r.waitForFunction(() => !document.getElementById('llm-test').disabled);
      const call = await r.evaluate(() => window.modelLists[0]);
      assert.ok(call.path.endsWith(provider === 'ollama' ? '/api/tags' : '/models'));
      if (provider === 'azure-openai') { assert.equal(await r.locator('#llm-model-select').isHidden(), true); assert.match(await r.locator('#llm-status').textContent(), /部署列表/); }
      else {
        await r.locator('#llm-model-select').selectOption('third-model');
        assert.equal(await r.locator('#llm-model').inputValue(), 'third-model');
        await r.evaluate(() => { window.listMode = 'deferred'; }); await r.locator('#llm-test').click();
        await r.waitForFunction(() => window.resolveList);
        await r.locator('#llm-provider').selectOption('azure-openai');
        await r.evaluate(() => window.resolveList(['stale-model'])); await r.waitForTimeout(100);
        assert.equal(await r.locator('#llm-model-select').isHidden(), true);
      }
      await r.locator('#llm-provider').selectOption('none'); await r.locator('#llm-test').click();
      assert.match(await r.locator('#llm-status').textContent(), /请先选择/);
      assert.equal(await r.evaluate(() => window.chatCalls.length), 0); assert.deepEqual(t.errors, []); await t.context.close();
    }
    console.log('PASS shared settings adapter, Azure catalog-only check and stale provider change');
    assert.equal(unexpectedRuntime, 0);
  } finally { await browser.close(); await new Promise(r => { server.close(r); server.closeAllConnections(); }); }
})().catch(error => { console.error(error); process.exitCode = 1; });

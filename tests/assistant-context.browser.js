/* Full-context request contracts, isolated Chromium contexts and mock responses only.
 * Defaults to a temporary loopback server serving this checkout. An existing loopback
 * preview is optional; its assistant asset must match this checkout byte-for-byte.
 * No real model calls, credentials, screenshots, or existing-service changes.
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const mathIntegration = process.env.ASSISTANT_TEST_MATH === '1';
const externalBase = process.env.ASSISTANT_TEST_BASE_URL;
const sha256 = data => createHash('sha256').update(data).digest('hex');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

async function main() {
  let server, browser;
  try {
    assert.ok(!mathIntegration || externalBase, 'Optional math integration requires ASSISTANT_TEST_BASE_URL');
    let base = externalBase;
    if (!base) {
      server = http.createServer((req, res) => {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        if (req.method !== 'GET' || !/^\/(assets\/|tests\/fixtures\/)/.test(pathname)) { res.writeHead(404).end(); return; }
        const file = path.resolve(root, '.' + pathname);
        if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        fs.readFile(file, (err, data) => {
          if (err) res.writeHead(404).end();
          else res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(data);
        });
      });
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
      base = 'http://127.0.0.1:' + server.address().port;
    }
    const parsed = new URL(base);
    assert.equal(parsed.protocol, 'http:');
    assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname), 'loopback preview required');
    assert.ok(!parsed.username && !parsed.password && !parsed.search && !parsed.hash);
    assert.equal(parsed.pathname, '/', 'preview origin, not an article URL, required');
    base = parsed.origin;
    browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    const probe = await browser.newContext();
    const asset = await probe.request.get(base + '/assets/article-assistant.js', { maxRedirects: 0 });
    assert.equal(asset.status(), 200);
    const hash = sha256(await asset.body());
    assert.equal(hash, sha256(fs.readFileSync(path.join(root, 'assets/article-assistant.js'))), 'preview must serve the tested checkout version');
    console.log(JSON.stringify({ assetStatus: asset.status(), assistantSha256: hash, temporaryServer: !externalBase }));
    await probe.close();

    for (const provider of ['openai-compatible', 'ollama', 'azure-openai']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
      await page.goto(`${base}/tests/fixtures/assistant-preview.html?manual=1&provider=${provider}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.katex && document.querySelector('.assistant-fab'));
      await page.evaluate(() => {
        const main = document.querySelector('main');
        main.innerHTML = '<h1>CONTEXT_START</h1><p id="long"></p>' +
          '<p id="current-language">CURRENT_ZH</p><article hidden><h2>HIDDEN_DETAIL</h2><p>HIDDEN_BODY</p></article>' +
          '<details><summary>SUMMARY</summary><p>COLLAPSED_BODY</p></details><dialog><p>CLOSED_DIALOG_BODY</p></dialog>' +
          '<div class="math-block" data-latex="x^2+1"></div><span id="rendered-math"></span>' +
          '<table><tr><th>COLUMN_A</th><th>COLUMN_B</th></tr><tr><td>CELL_A</td><td>CELL_B</td></tr></table>' +
          '<script>EXCLUDED_SCRIPT</script><style>/* EXCLUDED_STYLE */</style>' +
          '<div data-assistant-exclude>EXCLUDED_UI</div><p>CONTEXT_END</p>';
        document.getElementById('long').textContent = '完整正文'.repeat(25000);
        katex.render('x^2+1', main.querySelector('[data-latex]'), { displayMode: true });
        katex.render('z^2', document.getElementById('rendered-math'));
      });
      await page.locator('.assistant-fab').click();
      async function send() {
        await page.locator('.assistant-input').fill('CONTEXT_TEST_QUESTION');
        await page.locator('.assistant-send').click();
        await page.waitForFunction(() => window.fixtureController);
        const text = await page.evaluate(() => window.fixtureBodies.at(-1).messages[0].content);
        await page.evaluate(() => {
          fixturePush('MOCK_RESPONSE_SENTINEL', true);
          fixtureController.close();
          window.fixtureController = null;
        });
        await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
        return text;
      }
      const text = await send();
      assert.ok(text.length > 100000);
      for (const marker of ['CONTEXT_START', 'CONTEXT_END', 'HIDDEN_DETAIL', 'HIDDEN_BODY', 'COLLAPSED_BODY', 'CLOSED_DIALOG_BODY', 'CURRENT_ZH']) assert.ok(text.includes(marker), marker);
      assert.equal(text.split('完整正文').length - 1, 25000);
      assert.equal(text.split('x^2+1').length - 1, 1);
      assert.equal(text.split('z^2').length - 1, 1);
      assert.ok(text.includes('$$x^2+1$$') && text.includes('$z^2$'));
      assert.match(text, /CELL_A\tCELL_B/);
      assert.doesNotMatch(text, /内容已截断|EXCLUDED_SCRIPT|EXCLUDED_STYLE|EXCLUDED_UI/);
      assert.equal(await page.locator('article[hidden]').count(), 1, 'live DOM is untouched');
      assert.ok(await page.locator('.math-block .katex').count() > 0);
      await page.evaluate(() => {
        document.documentElement.lang = 'en';
        document.getElementById('current-language').textContent = 'UPDATED_EN';
      });
      const updated = await send();
      assert.ok(updated.includes('UPDATED_EN'));
      assert.doesNotMatch(updated, /CURRENT_ZH|MOCK_RESPONSE_SENTINEL|CONTEXT_TEST_QUESTION/);
      for (const root of ['site', 'body']) {
        await page.evaluate(root => {
          const main = document.querySelector('main, .site');
          if (root === 'site') {
            const site = document.createElement('div'); site.className = 'site';
            site.append(...main.childNodes); main.replaceWith(site);
          } else main.replaceWith(...main.childNodes);
        }, root);
        const fallback = await send();
        assert.ok(fallback.includes('CONTEXT_END') && fallback.includes('HIDDEN_BODY'));
        assert.doesNotMatch(fallback, /MOCK_RESPONSE_SENTINEL|CONTEXT_TEST_QUESTION/);
      }
      // Exercise the production HTTP failure path, not a real model endpoint.
      // The only allowed compatibility retry removes stream_options, never text.
      for (const status of [413, 400, 422]) {
        await page.evaluate(status => {
          window.limitBodies = [];
          window.fetch = async (_url, options) => {
            limitBodies.push(JSON.parse(options.body));
            return new Response(JSON.stringify({ error: { code: 'context_length_exceeded', message: 'Input exceeds model context window' } }), { status });
          };
        }, status);
        await page.locator('.assistant-input').fill('LIMIT_TEST');
        await page.locator('.assistant-send').click();
        await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
        const error = page.locator('.assistant-message-error').last();
        assert.equal(await error.isVisible(), true);
        assert.match(await error.textContent(), new RegExp('HTTP ' + status));
        const bodies = await page.evaluate(() => window.limitBodies);
        assert.equal(bodies.length, 1, 'no automatic retry on a context-limit error');
        assert.equal(bodies[0].messages[0].content.split('完整正文').length - 1, 25000);
        assert.ok(bodies[0].messages[0].content.includes('CONTEXT_END'));
      }
      if (provider !== 'ollama') {
        await page.evaluate(() => {
          window.retryBodies = [];
          window.fetch = async (_url, options) => {
            retryBodies.push(JSON.parse(options.body));
            if (retryBodies.length === 1) return new Response('Unknown parameter: stream_options', { status: 400 });
            return new Response('data: {"choices":[{"delta":{"content":"MOCK_RETRY"}}]}\n\ndata: [DONE]\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
          };
        });
        await page.locator('.assistant-input').fill('COMPAT_TEST');
        await page.locator('.assistant-send').click();
        await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
        const bodies = await page.evaluate(() => window.retryBodies);
        assert.equal(bodies.length, 2);
        assert.deepEqual(bodies[0].messages, bodies[1].messages, 'usage-option retry preserves the full context and history');
        assert.ok(bodies[0].stream_options);
        assert.equal(bodies[1].stream_options, undefined);
        assert.equal(await page.locator('.assistant-message-error').last().isVisible(), false);
      }
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ provider, articleCharacters: text.length, completeText: true, hiddenDetails: true, formulaDeduplication: true, refreshAndFallbacks: true, visibleLimitErrors: [413, 400, 422], noLimitRetry: true }));
      await context.close();
    }
    if (mathIntegration) {
      const context = await browser.newContext();
      await context.addInitScript(() => {
        localStorage.setItem('llm-settings', JSON.stringify({ provider: 'openai-compatible', endpoint: location.origin + '/__context_mock', model: 'MOCK_ONLY' }));
      });
      const page = await context.newPage();
      let payload;
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== base) return route.abort();
        if (url.pathname === '/__context_mock/chat/completions') {
          payload = route.request().postDataJSON();
          return route.fulfill({ contentType: 'text/event-stream', body: 'data: {"choices":[{"delta":{"content":"MOCK_ONLY"}}]}\n\ndata: [DONE]\n\n' });
        }
        return route.continue();
      });
      await page.goto(`${base}/posts/exam-performance-modeling/?lang=zh`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelectorAll('.knowledge-detail[hidden]').length === 11);
      const titles = await page.locator('.knowledge-detail h3').allTextContents();
      const tail = await page.locator('main').evaluate(main => main.textContent.trim().slice(-80));
      await page.locator('.assistant-fab').click();
      await page.locator('.assistant-input').fill('核对全文上下文（模拟请求）');
      await page.locator('.assistant-send').click();
      await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
      const full = payload.messages[0].content;
      for (const title of titles) assert.ok(full.includes(title), title);
      assert.ok(full.includes(tail));
      assert.ok(full.includes('a:=A-bt_0-cd_0'));
      assert.ok(full.length > 6000);
      assert.doesNotMatch(full, /内容已截断/);
      assert.equal(await page.locator('.knowledge-detail[hidden]').count(), 11);
      console.log(JSON.stringify({ article: 'exam-performance-modeling', articleCharacters: full.length, knowledgeDetails: titles.length, tailIncluded: true }));
      await context.close();
    } else console.log('Optional math-article integration: not requested');
  } finally {
    try { if (browser) await browser.close(); }
    finally { if (server && server.listening) await new Promise(resolve => server.close(resolve)); }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

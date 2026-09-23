/* Real Chromium, isolated origin/context, intercepted byte-split responses only.
 * No credentials or model calls. Optional Playwright is supplied by NODE_PATH.
 * Screenshots/logs stay in ignored .tmp/assistant-evidence/.
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, '.tmp/assistant-evidence');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/assistant-response.md'), 'utf8');
fs.mkdirSync(evidence, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!/^\/(assets\/|tests\/fixtures\/|posts\/high-school-complex-numbers\/)/.test(pathname)) { res.writeHead(404).end(); return; }
  const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => { if (err) res.writeHead(404).end(); else res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(data); });
});

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const results = [];
  async function makePage(query = '', viewport = { width: 1280, height: 900 }, intercept) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', async route => {
      if (new URL(route.request().url()).origin !== base) { external.push(route.request().url()); return route.abort(); }
      if (intercept && await intercept(route)) return;
      return route.continue();
    });
    await page.goto(base + '/tests/fixtures/assistant-preview.html?manual=1&' + query, { waitUntil: 'domcontentloaded' });
    await page.locator('.assistant-fab').click();
    return { page, context, errors, external };
  }
  async function start(page) {
    await page.evaluate(() => { window.fixtureController = null; });
    await page.locator('.assistant-input').fill('渲染验收（固定夹具，不调用模型）');
    await page.locator('.assistant-send').click();
    await page.waitForFunction(() => window.fixtureController);
  }
  async function push(page, text, final = false) {
    await page.evaluate(({ text, final }) => { window.fixturePush(text, final); if (final) window.fixtureController.close(); }, { text, final });
    if (final) await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
    else await page.waitForTimeout(120);
  }
  async function ready(page) { await page.waitForFunction(() => window.AssistantMarkdown && window.katex); }
  async function cleanup(test) {
    assert.deepEqual(test.errors, []);
    assert.deepEqual(test.external, [], 'no automatic external resource loads from output');
    await test.context.close();
  }
  try {
    for (const mobile of [false, true]) for (const theme of ['light', 'dark']) for (const expanded of [false, true]) {
      const label = `${mobile ? 'mobile' : 'desktop'}-${theme}-${expanded ? 'expanded' : 'normal'}`;
      const test = await makePage('theme=' + theme, mobile ? { width: 390, height: 844 } : undefined);
      const { page } = test;
      await ready(page); if (expanded) await page.locator('.assistant-expand').click();
      await start(page); await push(page, fixture, true);
      await page.waitForFunction(() => document.querySelectorAll('.assistant-msg-ai .katex').length >= 7);
      await page.waitForTimeout(300); // Dialog open/expand CSS transition, not model timing.
      const layout = await page.evaluate(() => {
        const ai = document.querySelector('.assistant-msg-ai'), messages = ai.parentElement;
        const user = document.querySelector('.assistant-msg-user'), dialog = document.querySelector('.assistant-dialog');
        const style = getComputedStyle(ai), parentStyle = getComputedStyle(messages), bounds = dialog.getBoundingClientRect();
        return { width: ai.getBoundingClientRect().width, available: messages.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight),
          background: style.backgroundColor, radius: style.borderRadius, shadow: style.boxShadow, maxWidth: style.maxWidth,
          userBackground: getComputedStyle(user).backgroundColor, userRadius: getComputedStyle(user).borderRadius,
          overflow: messages.scrollWidth - messages.clientWidth, inputOverflow: dialog.scrollWidth - dialog.clientWidth,
          bounds: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }, viewport: { width: innerWidth, height: innerHeight },
          wideBlocks: [...ai.querySelectorAll('pre, .assistant-table-scroll, .assistant-math-display')].filter(e => e.scrollWidth > e.clientWidth + 2).map(e => ({ tag: e.tagName, overflow: getComputedStyle(e).overflowX })),
          images: ai.querySelectorAll('img,script,iframe,svg[onload]').length, xss: !!window.__assistantXSS,
          inlineCode: [...ai.querySelectorAll('code')].some(e => e.textContent.includes('\\(x\\) $$y$$')),
          invalid: ai.querySelector('.assistant-math-error').textContent,
          bottom: messages.scrollHeight - messages.scrollTop - messages.clientHeight };
      });
      assert.ok(Math.abs(layout.width - layout.available) < 1, JSON.stringify(layout));
      assert.equal(layout.background, 'rgba(0, 0, 0, 0)'); assert.equal(layout.radius, '0px');
      assert.equal(layout.shadow, 'none'); assert.equal(layout.maxWidth, 'none');
      assert.notEqual(layout.userBackground, 'rgba(0, 0, 0, 0)'); assert.notEqual(layout.userRadius, '0px');
      assert.ok(layout.overflow <= 1 && layout.inputOverflow <= 1, JSON.stringify(layout));
      assert.ok(layout.bounds.left >= 0 && layout.bounds.right <= layout.viewport.width + 1, label + ' ' + JSON.stringify(layout));
      assert.ok(layout.bounds.top >= 0 && layout.bounds.bottom <= layout.viewport.height + 1, label + ' ' + JSON.stringify(layout));
      assert.ok(layout.wideBlocks.length >= 2); assert.ok(layout.wideBlocks.every(e => e.overflow === 'auto'));
      assert.ok(await page.locator('.assistant-msg-ai').evaluate(ai => {
        return [...ai.querySelectorAll('pre, .assistant-table-scroll, .assistant-math-display')]
          .filter(e => e.scrollWidth > e.clientWidth + 2).every(e => {
            e.scrollLeft = 30; const moved = e.scrollLeft > 0; e.scrollLeft = 0; return moved;
          });
      }), 'wide blocks actually scroll independently');
      assert.equal(layout.images, 0); assert.equal(layout.xss, false); assert.equal(layout.inlineCode, true);
      assert.equal(layout.invalid, String.raw`\(\notARealCommand{x}\)`); assert.ok(layout.bottom < 2);
      assert.equal(await page.locator('.assistant-copy').count(), 1);
      assert.match(await page.locator('.assistant-message-metrics').textContent(), /服务端未提供/);
      await page.locator('.assistant-msg-footer').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(evidence, label + '-footer.png') });
      await page.locator('.assistant-messages').evaluate(e => { e.scrollTop = 0; });
      await page.screenshot({ path: path.join(evidence, label + '.png') });
      if ((mobile && theme === 'dark' && !expanded) || (!mobile && theme === 'light' && expanded)) {
        await page.locator('.assistant-msg-ai pre').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(evidence, label + '-code.png') });
      }
      // Close/reopen, input and expansion controls remain usable.
      await page.locator('.assistant-close').click(); assert.equal(await page.locator('.assistant-dialog').evaluate(e => e.classList.contains('is-open')), false);
      await page.locator('.assistant-fab').click(); assert.equal(await page.locator('.assistant-input').isEnabled(), true);
      results.push({ label, layout }); await cleanup(test);
    }
    console.log('PASS 8 layout/theme/viewport combinations, math DOM, user bubbles, local block scrolling, controls');

    for (const provider of ['openai-compatible', 'ollama']) {
      const test = await makePage('provider=' + provider); const { page } = test;
      await ready(page); await start(page);
      for (const piece of ['\\', '[\\frac{a_1}', '{b^2}', '\\']) await push(page, piece);
      assert.ok((await page.locator('.assistant-msg-ai').textContent()).includes(String.raw`\[\frac{a_1}{b^2}` + '\\'));
      for (const piece of [']\n\n**bo', 'ld**\n\n```js\nconst literal = "\\\\[x\\\\]";', '\n``', '`\n\n| a | b |\n| -', '-- | --- |\n| | c |\n\n']) await push(page, piece);
      assert.equal(await page.locator('.assistant-msg-ai strong').textContent(), 'bold');
      assert.equal(await page.locator('.assistant-msg-ai pre code').textContent(), 'const literal = "\\\\[x\\\\]";\n');
      assert.equal(await page.locator('.assistant-msg-ai td').first().textContent(), '');
      await push(page, '阅读段落。\n\n'.repeat(100));
      assert.equal(await page.locator('.assistant-msg-ai .katex').count(), 1);
      await page.locator('.assistant-messages').evaluate(e => { e.scrollTop = 0; });
      await push(page, '新内容\n\n'.repeat(20));
      assert.equal(await page.locator('.assistant-messages').evaluate(e => e.scrollTop), 0, 'reader position preserved');
      await push(page, '尾部中文（无换行的最后数据帧）', true);
      assert.match(await page.locator('.assistant-msg-ai').textContent(), /尾部中文（无换行的最后数据帧）/);
      assert.equal(await page.locator('.assistant-messages').evaluate(e => e.scrollTop), 0);
      assert.doesNotMatch(await page.locator('.assistant-msg-ai').textContent(), /LATEX\d|CODE\d|\x00/);
      assert.equal(await page.evaluate(() => window.fixtureRequests), 1);
      await cleanup(test);
    }
    console.log('PASS SSE + NDJSON: delimiter/chunk/UTF-8 byte splits, unfinished formulas, final non-newline frame, reading scroll');

    for (const asset of ['katex.min.js', 'katex.min.css', 'assistant-markdown.js', 'markdown-it.min.js']) {
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      const test = await makePage('', undefined, async route => {
        if (!route.request().url().endsWith('/' + asset)) return false;
        await gate; await route.continue(); return true;
      });
      const { page } = test; await start(page);
      await push(page, String.raw`公式 \[x^2\]` + '\n\n' + '阅读段落\n\n'.repeat(80), true);
      assert.ok((await page.locator('.assistant-msg-ai').textContent()).includes(String.raw`\[x^2\]`));
      assert.equal(await page.locator('.assistant-msg-ai .katex').count(), 0);
      await page.locator('.assistant-messages').evaluate(e => { e.scrollTop = 0; });
      release(); await page.waitForSelector('.assistant-msg-ai .katex');
      assert.equal(await page.locator('.assistant-messages').evaluate(e => e.scrollTop), 0);
      await cleanup(test);
    }
    console.log('PASS delayed KaTeX/parser/module: source visible first, automatic backfill, reading scroll preserved');

    for (const asset of ['katex.min.js', 'katex.min.css', 'assistant-markdown.js', 'markdown-it.min.js']) {
      const test = await makePage('', undefined, async route => {
        if (!route.request().url().endsWith('/' + asset)) return false;
        await route.abort(); return true;
      });
      const { page } = test; await start(page);
      await push(page, String.raw`\[x" onmouseover="alert(1)\] <img src=x onerror=alert(1)>`, true);
      assert.match(await page.locator('.assistant-msg-ai').textContent(), /onmouseover/);
      assert.equal(await page.locator('.assistant-msg-ai img, .assistant-msg-ai [onmouseover]').count(), 0);
      assert.equal(await page.locator('.assistant-msg-ai .katex').count(), 0);
      await cleanup(test);
    }
    console.log('PASS failed assets: safe readable source (no blank output or attribute injection)');

    const security = await makePage(); await ready(security.page); await start(security.page);
    await push(security.page, String.raw`<script>window.__assistantXSS=true</script>

<svg onload="window.__assistantXSS=true"></svg>

[x](jav&#x61;script:alert(1)) ![pixel](https://tracker.invalid/pixel)

\[x" onmouseover="alert(1)\]

\(\href{javascript:alert(1)}{x}\)

\(\includegraphics{https://tracker.invalid/pixel}\)

\(\htmlClass{evil}{x}\)

` + '`<img src=x onerror=alert(1)> $x$`', true);
    assert.equal(await security.page.locator('.assistant-msg-content img, .assistant-msg-content script, .assistant-msg-content svg, .assistant-msg-content [onmouseover], .assistant-msg-content .evil, .assistant-msg-content a').count(), 0);
    assert.equal(await security.page.evaluate(() => !!window.__assistantXSS), false);
    await cleanup(security);
    console.log('PASS real DOM security: HTML/attribute/URL injection, code protection, KaTeX trust=false, no image/network loads');

    const test = await makePage(); const { page } = test; await ready(page); await start(page);
    await push(page, '已收到的部分内容');
    await page.evaluate(() => window.fixtureController.error(new Error('fixture stream failure')));
    await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
    assert.match(await page.locator('.assistant-messages').textContent(), /已收到的部分内容/);
    assert.match(await page.locator('.assistant-messages').textContent(), /错误:/);
    assert.equal(await page.locator('.assistant-msg-footer').getAttribute('data-state'), 'error');
    const errorFooter = await page.locator('.assistant-msg-footer').textContent();
    await page.waitForTimeout(350); assert.equal(await page.locator('.assistant-msg-footer').textContent(), errorFooter);
    await page.locator('.assistant-input').fill('仍可输入'); await cleanup(test);
    console.log('PASS stream rejection: partial content retained, readable error, send restored');

    // Per-reply timing/usage: deterministic monotonic clock, fictional counters only.
    for (const provider of ['openai-compatible', 'azure-openai', 'ollama']) {
      const test = await makePage('provider=' + provider + (provider === 'ollama' ? '&theme=dark' : ''),
        provider === 'ollama' ? { width: 320, height: 740 } : undefined);
      const { page } = test; await ready(page);
      await page.evaluate(() => {
        window.fixtureNow = 1000;
        Object.defineProperty(performance, 'now', { value: () => window.fixtureNow, configurable: true });
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.fixtureCopied = text; } }, configurable: true });
      });
      await start(page);
      assert.equal(await page.locator('.assistant-copy').isDisabled(), true);
      await page.evaluate(() => window.fixtureFrame({ choices: [{ delta: { role: 'assistant', content: '' } }] }));
      await page.waitForTimeout(300);
      assert.match(await page.locator('.assistant-message-metrics').textContent(), /首字延迟 —/);
      await page.evaluate(() => { window.fixtureNow = 1500; });
      const source = '`raw` ' + String.raw`\(x\)` + '\n\n已完成';
      await push(page, source);
      await page.locator('.assistant-copy').click();
      await page.waitForFunction(() => window.fixtureCopied);
      assert.equal(await page.evaluate(() => window.fixtureCopied), source, 'copies original source during streaming');
      await page.evaluate(provider => {
        window.fixtureNow = 3500;
        window.fixtureFrame(provider === 'ollama' ? {
          done: true, prompt_eval_count: 100, eval_count: 50, eval_duration: 2000000000,
          prompt_eval_duration: 500000000, load_duration: 100000000
        } : { choices: [], usage: { prompt_tokens: 100, completion_tokens: 50 } }, true);
        window.fixtureController.close();
      }, provider);
      await page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
      const metrics = await page.locator('.assistant-message-metrics').textContent();
      assert.match(metrics, /总耗时 2\.50s/); assert.match(metrics, /输出时长 2\.00s/);
      assert.match(metrics, /首字延迟 0\.50s/); assert.match(metrics, /输入 100 token/); assert.match(metrics, /输出 50 token/);
      assert.ok(metrics.includes(provider === 'ollama' ? '25.0 token/s（服务端）' : '20.0 token/s（端到端）'));
      if (provider === 'ollama') { assert.match(metrics, /预填充 200\.0 token\/s/); assert.match(metrics, /模型加载 0\.10s/); }
      const body = await page.evaluate(() => window.fixtureBodies[0]);
      assert.deepEqual(body.stream_options, provider === 'ollama' ? undefined : { include_usage: true });
      assert.equal(await page.locator('.assistant-msg-footer').getAttribute('data-state'), 'complete');
      assert.match(await page.locator('.assistant-message-time').textContent(), /^输出于 /);
      assert.ok(Number.isFinite(Date.parse(await page.locator('.assistant-message-time').getAttribute('datetime'))));
      const finalFooter = await page.locator('.assistant-msg-footer').textContent();
      await page.waitForTimeout(350); assert.equal(await page.locator('.assistant-msg-footer').textContent(), finalFooter, 'completed timing is frozen');
      assert.ok(await page.locator('.assistant-messages').evaluate(e => e.scrollWidth <= e.clientWidth + 1));
      await page.locator('.assistant-msg-footer').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(evidence, 'metrics-' + provider + '.png') });
      // Second reply must have independent source/counters/timers; first copy still works.
      await start(page); await push(page, '第二条回复', true);
      assert.match(await page.locator('.assistant-message-metrics').nth(1).textContent(), /服务端未提供/);
      await page.locator('.assistant-copy').nth(1).click(); await page.waitForFunction(() => window.fixtureCopied === '第二条回复');
      await page.locator('.assistant-copy').first().click(); await page.waitForFunction(value => window.fixtureCopied === value, source);
      assert.equal(await page.locator('.assistant-message-metrics').first().textContent(), metrics);
      await cleanup(test);
    }
    console.log('PASS per-message copy, timestamps, exact timing, OpenAI/Azure usage-only frames and Ollama nanosecond rates; independent replies');

    const clipboard = await makePage(); await ready(clipboard.page); await start(clipboard.page); await push(clipboard.page, '复制原文', true);
    await clipboard.page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      document.execCommand = command => { window.fixtureFallbackCopy = document.querySelector('textarea').value; return command === 'copy'; };
    });
    await clipboard.page.locator('.assistant-copy').click();
    await clipboard.page.waitForFunction(() => window.fixtureFallbackCopy === '复制原文');
    assert.equal(await clipboard.page.locator('textarea').count(), 0);
    assert.equal(await clipboard.page.locator('.assistant-copy-status').textContent(), '已复制');
    await clipboard.page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } }, configurable: true });
      document.execCommand = () => false;
    });
    await clipboard.page.locator('.assistant-copy').click();
    await clipboard.page.waitForFunction(() => document.querySelector('.assistant-copy-status').textContent.includes('复制失败'));
    assert.equal(await clipboard.page.locator('.assistant-copy').isEnabled(), true);
    assert.equal(await clipboard.page.locator('textarea').count(), 0);
    await cleanup(clipboard);
    console.log('PASS clipboard API/fallback/denied paths; no existing clipboard reads, no stale textarea');

    for (const provider of ['openai-compatible', 'ollama']) {
      const test = await makePage('provider=' + provider); await ready(test.page); await start(test.page);
      await test.page.evaluate(provider => {
        window.fixtureFrame(provider === 'ollama' ? { prompt_eval_count: -1, eval_count: '50', eval_duration: -1 } :
          { choices: [], usage: { prompt_tokens: -1, completion_tokens: '50' } });
        window.fixtureController.close();
      }, provider);
      await test.page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
      const metrics = await test.page.locator('.assistant-message-metrics').textContent();
      assert.match(metrics, /服务端未提供/); assert.match(metrics, /首字延迟 —/); assert.match(metrics, /吞吐 —/);
      assert.doesNotMatch(metrics, /NaN|Infinity|50 token|-1/);
      await test.page.evaluate(() => Object.defineProperty(performance, 'now', { value: () => 1000, configurable: true }));
      await start(test.page);
      await test.page.evaluate(provider => {
        window.fixtureFrame(provider === 'ollama' ? { done: true, eval_count: 0, eval_duration: 0, prompt_eval_count: 0, prompt_eval_duration: 0 } :
          { choices: [], usage: { prompt_tokens: 0, completion_tokens: 0 } });
        window.fixtureController.close();
      }, provider);
      await test.page.waitForFunction(() => !document.querySelector('.assistant-send').disabled);
      const zero = await test.page.locator('.assistant-message-metrics').last().textContent();
      assert.match(zero, /总耗时 0\.00s/); assert.match(zero, /输出 0 token/); assert.match(zero, /吞吐 —/);
      assert.doesNotMatch(zero, /NaN|Infinity/);
      await cleanup(test);
    }
    const compat = await makePage('reject-usage=1'); await ready(compat.page); await start(compat.page); await push(compat.page, '兼容降级成功', true);
    assert.equal(await compat.page.evaluate(() => window.fixtureRequests), 2);
    assert.equal(await compat.page.evaluate(() => 'stream_options' in window.fixtureBodies[1]), false);
    assert.match(await compat.page.locator('.assistant-message-metrics').textContent(), /服务端未提供/);
    await cleanup(compat);
    for (const status of [400, 401, 429, 500]) {
      const test = await makePage('http-error=' + status); await ready(test.page);
      await test.page.locator('.assistant-input').fill('HTTP failure'); await test.page.locator('.assistant-send').click();
      await test.page.waitForSelector('.assistant-message-error:not([hidden])');
      assert.equal(await test.page.evaluate(() => window.fixtureRequests), 1, 'no generic retry');
      assert.equal(await test.page.locator('.assistant-msg-footer').getAttribute('data-state'), 'error');
      assert.match(await test.page.locator('.assistant-message-metrics').textContent(), /吞吐 —/);
      const footer = await test.page.locator('.assistant-msg-footer').textContent();
      await test.page.waitForTimeout(350); assert.equal(await test.page.locator('.assistant-msg-footer').textContent(), footer);
      await cleanup(test);
    }
    console.log('PASS missing/invalid metrics, empty output, explicit unsupported-usage fallback only, frozen error timers');

    // Real article integration, with all non-loopback resources blocked and a fake fetch.
    const context = await browser.newContext({ viewport: { width: 320, height: 740 } });
    const article = await context.newPage();
    await article.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    await article.addInitScript(text => {
      localStorage.setItem('llm-settings', JSON.stringify({ provider: 'openai-compatible', endpoint: location.origin + '/fixture', model: 'MOCK' }));
      window.fetch = async () => new Response('data: ' + JSON.stringify({ choices: [{ delta: { content: text } }] }) + '\n');
    }, fixture);
    await article.goto(base + '/posts/high-school-complex-numbers/'); await ready(article);
    await article.locator('.assistant-fab').click(); await article.locator('.assistant-input').fill('测试'); await article.locator('.assistant-send').click();
    await article.waitForSelector('.assistant-msg-ai .katex');
    for (const expanded of [false, true]) {
      if (expanded) await article.locator('.assistant-expand').click();
      await article.waitForTimeout(300);
      assert.ok(await article.locator('.assistant-messages').evaluate(e => e.scrollWidth <= e.clientWidth + 1));
      assert.ok(await article.locator('.assistant-dialog').evaluate(e => e.getBoundingClientRect().right <= innerWidth + 1));
    }
    await article.screenshot({ path: path.join(evidence, 'real-article-320-expanded.png') });
    await context.close();
    console.log('PASS real article integration at 320px, normal/expanded, existing script tag unchanged');
    fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify({ browser: browser.version(), base, modelCalls: 0, results }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());

'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_TIME_PROXY_EVIDENCE || '/tmp/exam-time-proxy-browser';
fs.mkdirSync(out, { recursive: true });
const scope = '#stage-proxy-variable, #stage-proxy-rationale, #time-proxy-check';
async function settledAnchor(page, id) {
  await page.waitForFunction(id => {
    const top = document.getElementById(id).getBoundingClientRect().top;
    const nav = document.querySelector('.topbar').getBoundingClientRect(), now = performance.now();
    const prior = window.__timeProxyAnchorProbe;
    if (!prior || prior.id !== id || Math.abs(prior.top - top) > 1) {
      window.__timeProxyAnchorProbe = { id, top, since: now }; return false;
    }
    return now - prior.since > 250 && top >= (nav.top < 100 ? nav.bottom : 0) && top < 350;
  }, id);
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}#stage-proxy-rationale`, { waitUntil: 'networkidle' });
        for (let pass = 0; pass < 2; pass++) {
          const current = (await page.locator('html').getAttribute('lang')).startsWith('zh') ? 'zh' : 'en';
          assert.match(await page.locator('#stage-proxy-rationale h3').innerText(), current === 'zh' ? /为什么把考试阶段/ : /Why Include/);
          assert.match(await page.locator('#time-proxy-check-scope').innerText(), current === 'zh' ? /新增一项回顾性分析/ : /additional retrospective analysis/);
          const math = await page.locator(scope).locator('[data-latex]').evaluateAll(ns => ns.map(n => ({
            source: n.dataset.latex, inTable: !!n.closest('table'), html: n.querySelectorAll('.katex-html').length, mathml: n.querySelectorAll('.katex-mathml math').length,
            text: n.querySelector('annotation')?.textContent, font: parseFloat(getComputedStyle(n.querySelector('.katex')).fontSize),
            width: n.getBoundingClientRect().width, parentWidth: n.parentElement.getBoundingClientRect().width,
          })));
          assert.ok(math.length >= 5);
          math.forEach(m => { assert.equal(m.html, 1); assert.equal(m.mathml, 1); assert.equal(m.text, m.source); assert.ok(m.font >= (m.inTable ? 15 : 16)); assert.ok(m.width <= m.parentWidth + 2); });
          assert.deepEqual(await page.locator('#time-proxy-results tbody tr').evaluateAll(ns => ns.map(n => [...n.querySelectorAll('td')].map(c => c.textContent))), [['3.89', '3.15'], ['9.78', '6.60']]);
          assert.deepEqual(await page.locator('main > .section').evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id)), []);
          if (!pass) {
            await page.locator('#stage-proxy-rationale').screenshot({ path: path.join(out, `${lang}-${width}-rationale.png`), animations: 'disabled', style: '.topbar { visibility: hidden !important; }' });
            await page.locator('#time-proxy-check').screenshot({ path: path.join(out, `${lang}-${width}-check.png`), animations: 'disabled', style: '.topbar { visibility: hidden !important; }' });
          }
          await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
        }
        const link = page.locator('#stage-proxy-overview a');
        await link.focus(); await page.keyboard.press('Enter');
        await settledAnchor(page, 'stage-proxy-rationale');
        await page.locator('#stage-proxy-rationale a[href="#time-proxy-check"]').focus();
        await page.keyboard.press('Enter');
        await settledAnchor(page, 'time-proxy-check');
        await page.emulateMedia({ media: 'print' });
        assert.ok(await page.locator('#stage-proxy-rationale').isVisible());
        assert.ok(await page.locator('#time-proxy-results').isVisible());
        assert.equal(await page.locator(scope).locator('[data-math-error], .katex-error').count(), 0);
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, bilingualMathDOM: true, matchedTable: true, keyboardAnchors: true, print: true, overflow: false, errors }));
      } finally { await context.close(); }
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    try {
      const page = await context.newPage(); await page.goto(`${base}#stage-proxy-rationale`);
      assert.match(await page.locator('#stage-proxy-rationale').innerText(), /为什么把考试阶段/);
      assert.ok(await page.locator(scope).locator('[data-latex]').evaluateAll(ns => ns.every(n => n.textContent.trim().length)));
      assert.equal(await page.locator('#time-proxy-results tbody tr').count(), 2);
      await page.locator('#stage-proxy-rationale a').focus(); await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#time-proxy-check');
      console.log('No JS: rationale, readable formula sources, table, and native links preserved.');
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

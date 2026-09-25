'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.getElementById('least-squares-demo').dataset.lsReady === 'true');
      const observedBefore = await page.locator('[data-ls-observed]').evaluateAll(nodes => nodes.map(n => n.outerHTML));
      const scores = await page.locator('#source-year-1 tbody tr').first().locator('td').allTextContents();
      assert.deepEqual(scores.slice(0, 2), ['80', '78']);
      for (const c of [78, 79, 80, 76.2, 81.7]) {
        if (Number.isInteger(c)) await page.locator(`button[data-ls-c="${c}"]`).click();
        else await page.locator('#ls-c-slider').evaluate((e, value) => { e.value = value; e.dispatchEvent(new Event('input', { bubbles: true })); }, String(c));
        const state = await page.locator('#least-squares-demo').evaluate(f => ({
          total: Number(f.querySelector('[data-ls-total]').textContent),
          squares: [...f.querySelectorAll('[data-ls-square]')].map(e => Number(e.textContent)),
          c: Number(f.dataset.lsC),
          errors: [...f.querySelectorAll('[data-ls-error]')].map(e => Number(e.textContent.replace('−', '-'))),
          cursor: { x: Number(f.querySelector('[data-ls-cursor]').getAttribute('cx')), y: Number(f.querySelector('[data-ls-cursor]').getAttribute('cy')) },
          residualEnds: [...f.querySelectorAll('[data-ls-residual]')].map(e => Number(e.getAttribute('y2')))
        }));
        assert.equal(state.c, c);
        assert.ok(Math.abs(state.total - ((80 - c) ** 2 + (78 - c) ** 2)) < 1e-8);
        assert.ok(Math.abs(state.squares[0] + state.squares[1] - state.total) < 1e-8);
        state.errors.forEach((e, i) => assert.ok(Math.abs(e - ([80, 78][i] - c)) < 1e-8));
        assert.ok(Math.abs(state.cursor.x - (580 + (c - 76) / 6 * 360)) < 1e-8);
        assert.ok(Math.abs(state.cursor.y - (430 - state.total / 22 * 300)) < 1e-8);
        assert.ok(state.residualEnds.every(y => Math.abs(y - (430 - (c - 76) / 6 * 300)) < 1e-8));
        assert.deepEqual(await page.locator('[data-ls-observed]').evaluateAll(nodes => nodes.map(n => n.outerHTML)), observedBefore);
      }
      await page.locator('button[data-ls-c="79"]').click();
      assert.ok((await page.locator('.ls-explanation').innerText()).includes(lang === 'zh' ? '达到最小值' : 'minimum of 2'));
      await page.locator('#ls-c-slider').focus(); await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#ls-c-slider').inputValue(), '79.1');
      const layout = await page.locator('#least-squares-demo').evaluate(f => ({
        overflow: f.scrollWidth > f.clientWidth + 1,
        fonts: [...new Set([...f.querySelectorAll('svg text')].map(e => { const m = e.getScreenCTM(); return +(parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.c, m.d)).toFixed(3); }))],
        clipped: [...f.querySelectorAll('svg text')].filter(e => { const b = e.getBBox(); return b.x < -1 || b.y < -1 || b.x + b.width > 1001 || b.y + b.height > 531; }).map(e => e.textContent),
        curveFill: getComputedStyle(f.querySelector('.ls-loss-curve')).fill
      }));
      assert.equal(layout.overflow, false); assert.deepEqual(layout.clipped, []); assert.deepEqual(layout.fonts, [16]); assert.equal(layout.curveFill, 'none');
      await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
      assert.equal(await page.locator('#ls-c-slider').inputValue(), '79.1');
      assert.ok((await page.locator('.ls-explanation').innerText()).includes(lang === 'zh' ? 'squared-error' : '平方和'));
      assert.equal(await page.locator('.katex-error').count(), 0); assert.deepEqual(errors, []);
      console.log(JSON.stringify({ lang, width, theme, parameters: 5, observedScoresUnchanged: true, keyboardAndLanguage: true, layout }));
      await context.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('#least-squares-demo noscript').isVisible());
    assert.equal(await page.locator('#least-squares-demo .ls-controls').isVisible(), false);
    console.log('No-JavaScript fallback: source example and proof remain readable.');
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

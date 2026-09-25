'use strict';

// Uses an existing preview only. Supply playwright via NODE_PATH if external.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.knowledge-detail[hidden]').count(), 11);
      const links = await page.locator('.knowledge-card > a').evaluateAll(nodes => nodes.map(node => node.hash));
      for (const [index, hash] of links.entries()) {
        // The whole card is clickable; the title is the native keyboard link.
        const link = page.locator(`.knowledge-card > a[href="${hash}"]`);
        if (index === 0) await link.locator('..').locator('p').click();
        else await link.click();
        await page.waitForFunction(() => document.getElementById('knowledge-dialog').open);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(50);
        const state = await page.evaluate(() => {
          const dialog = document.getElementById('knowledge-dialog');
          const rect = dialog.getBoundingClientRect();
          return {
            visible: dialog.querySelectorAll('.knowledge-detail:not([hidden])').length,
            hidden: document.querySelectorAll('.knowledge-detail[hidden]').length,
            labeled: !!document.getElementById(dialog.getAttribute('aria-labelledby')),
            focusInside: dialog.contains(document.activeElement),
            contained: rect.left >= 0 && rect.right <= innerWidth + 1 && rect.top >= 0 && rect.bottom <= innerHeight + 1,
            overflow: dialog.scrollWidth > dialog.clientWidth + 1,
            mathErrors: dialog.querySelectorAll('.katex-error,[data-math-error],.katex .katex').length,
            uniqueNotation: document.querySelectorAll('#notation-guide').length,
            closeText: dialog.querySelector('button').textContent,
            locked: document.documentElement.classList.contains('exam-knowledge-open')
          };
        });
        assert.equal(state.visible, 1); assert.equal(state.hidden, 10);
        assert.ok(state.labeled && state.focusInside && state.contained && state.locked);
        assert.equal(state.overflow, false); assert.equal(state.mathErrors, 0); assert.equal(state.uniqueNotation, 1);
        assert.equal(state.closeText, lang === 'zh' ? '关闭 ×' : 'Close ×');
        for (let n = 0; n < 8; n++) {
          await page.keyboard.press(n % 2 ? 'Shift+Tab' : 'Tab');
          assert.ok(await page.locator('#knowledge-dialog').evaluate(d => d.contains(document.activeElement)));
        }
        if (index % 3 === 0) await page.keyboard.press('Escape');
        else if (index % 3 === 1) await page.locator('[data-knowledge-close]').click();
        else await page.mouse.click(2, 2);
        await page.waitForFunction(() => !document.getElementById('knowledge-dialog').open);
        assert.equal(await page.locator('.knowledge-detail[hidden]').count(), 11);
        assert.ok(await link.evaluate(a => a === document.activeElement));
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('exam-knowledge-open')), false);
      }
      // A link inside a detail must close the modal and reach the real solution.
      await page.locator('.knowledge-card > a[href="#toolkit-errors"]').click();
      await page.locator('#knowledge-dialog a[href="#coefficients"]').click();
      assert.equal(await page.evaluate(() => location.hash), '#coefficients');
      assert.equal(await page.locator('#knowledge-dialog').evaluate(d => d.open), false);
      // Browser Back/Forward and direct old aliases remain usable.
      await page.locator('.knowledge-card > a[href="#toolkit-symbols"]').click();
      await page.goBack();
      await page.waitForFunction(() => !document.getElementById('knowledge-dialog').open);
      await page.goForward();
      await page.waitForFunction(() => document.getElementById('knowledge-dialog').open);
      await page.goto(`${base}?lang=${lang}&theme=${theme}#notation-guide`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#knowledge-dialog #notation-guide').count(), 1);
      // Exercise the actual language control programmatically while background is inert.
      await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#knowledge-dialog .katex-error,#knowledge-dialog .katex .katex').count(), 0);
      assert.ok(await page.locator('#knowledge-dialog .katex').count() > 0);
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ lang, width, theme, topics: links.length, modalGeometry: 'PASS', keyboardAndHistory: 'PASS', errors }));
      await context.close();
    }
    // Without JS, original articles and anchor links are the readable fallback.
    for (const mode of ['no-js', 'no-dialog']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js' });
      if (mode === 'no-dialog') await context.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined; });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.knowledge-detail[hidden]').count(), 0);
      assert.ok(await page.locator('#toolkit-rates').isVisible());
      await page.locator('.knowledge-card a[href="#toolkit-rates"]').click();
      assert.equal(await page.evaluate(() => location.hash), '#toolkit-rates');
      console.log(JSON.stringify({ fallback: mode, result: 'PASS' }));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

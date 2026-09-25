/* Reuse an existing loopback preview with fresh browser contexts; no model calls. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const origin = new URL(base).origin;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.extension-detail[hidden]').count(), 12);
      assert.equal(await page.locator('.knowledge-detail[hidden]').count(), 11);
      assert.equal(await page.locator('main [data-accordion]').count(), 0);
      assert.ok(await page.locator('#matched-score-results').isVisible());
      assert.ok(await page.locator('#bounded-scenario-results').isVisible());
      assert.ok(await page.locator('#learning-check > .exam-copy > ol').first().isVisible());
      const source = await page.locator('.extension-detail').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.id, node.textContent])));
      const hrefs = await page.locator('.extension-card-trigger').evaluateAll(nodes => nodes.map(node => node.hash));
      const countColumns = await page.locator('.knowledge-cards').first().evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(countColumns, width >= 1100 ? 4 : width >= 700 ? 2 : 1);
      for (const [i, href] of hrefs.entries()) {
        const link = page.locator(`.extension-card-trigger[href="${href}"]`);
        await link.scrollIntoViewIfNeeded();
        const scrollBefore = await page.evaluate(() => scrollY);
        if (i === 0) { await link.focus(); await page.keyboard.press('Enter'); }
        else await link.click();
        await page.waitForFunction(() => document.getElementById('knowledge-dialog').open);
        await page.waitForTimeout(40);
        const state = await page.evaluate(() => {
          const dialog = document.getElementById('knowledge-dialog');
          const node = dialog.querySelector('.extension-detail');
          const bounds = dialog.getBoundingClientRect();
          return {
            id: node.id, text: node.textContent,
            openDialogs: document.querySelectorAll('dialog[open]').length,
            hidden: document.querySelectorAll('.extension-detail[hidden]').length,
            hiddenKnowledge: document.querySelectorAll('.knowledge-detail[hidden]').length,
            overflow: dialog.scrollWidth > dialog.clientWidth + 1,
            withinViewport: bounds.left >= 0 && bounds.right <= innerWidth + 1 && bounds.top >= 0 && bounds.bottom <= innerHeight + 1,
            label: document.getElementById(dialog.getAttribute('aria-labelledby')).textContent,
            sourceLabel: node.querySelector('h3').textContent,
            mathErrors: dialog.querySelectorAll('.katex-error,[data-math-error],.katex .katex').length,
            focusInside: dialog.contains(document.activeElement)
          };
        });
        assert.equal(state.id, href.slice(1)); assert.equal(state.text, source[state.id]);
        assert.equal(state.openDialogs, 1); assert.equal(state.hidden, 11); assert.equal(state.hiddenKnowledge, 11);
        assert.equal(state.overflow, false); assert.ok(state.withinViewport && state.focusInside);
        assert.equal(state.mathErrors, 0); assert.equal(state.label, state.sourceLabel);
        // Long derivations remain scrollable and the current title/close stay visible.
        assert.ok(await page.locator('#knowledge-dialog').evaluate(dialog => {
          dialog.scrollTop = dialog.scrollHeight;
          const top = dialog.getBoundingClientRect(), bar = dialog.querySelector('.knowledge-dialog-toolbar').getBoundingClientRect();
          return Math.abs(bar.top - top.top) < 3;
        }));
        await page.locator('[data-knowledge-close]').focus();
        await page.keyboard.press('Shift+Tab');
        assert.ok(await page.locator('#knowledge-dialog').evaluate(d => d.contains(document.activeElement)));
        if (i % 3 === 0) await page.keyboard.press('Escape');
        else if (i % 3 === 1) await page.locator('[data-knowledge-close]').click();
        else await page.mouse.click(2, 2);
        await page.waitForFunction(() => !document.getElementById('knowledge-dialog').open);
        assert.equal(await page.locator('.extension-detail[hidden]').count(), 12);
        assert.ok(await link.evaluate(a => document.activeElement === a));
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) < 2);
      }
      // Existing article aliases now open the matching content directly.
      await page.locator('#process-model a[href="#model-selection-guide"]').click();
      assert.equal(await page.locator('#knowledge-dialog .extension-detail').getAttribute('id'), 'model-selection-details-content');
      await page.locator('#knowledge-dialog a[href="#matched-review"]').click();
      assert.equal(await page.evaluate(() => location.hash), '#matched-review');
      assert.equal(await page.locator('dialog[open]').count(), 0);
      await page.locator('#process-model a[href="#ability-mindset"]').click();
      assert.equal(await page.locator('#knowledge-dialog .extension-detail').getAttribute('id'), 'proxy-model-extension-content');
      await page.goBack(); await page.waitForFunction(() => !document.getElementById('knowledge-dialog').open);
      await page.goForward(); await page.waitForFunction(() => document.getElementById('knowledge-dialog').open);
      await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
      await page.waitForTimeout(80);
      assert.ok(await page.locator('#reader-dialog-title').evaluate(e => e.textContent === e.getAttribute(document.documentElement.lang.startsWith('en') ? 'data-en' : 'data-zh')));
      assert.equal(await page.locator('#knowledge-dialog .katex-error,#knowledge-dialog .katex .katex').count(), 0);
      await page.keyboard.press('Escape');
      // Direct fragment within a long optional body opens and scrolls the one modal.
      await page.goto(`${base}?lang=${lang}&theme=${theme}#feedback-validation`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#knowledge-dialog #feedback-validation').count(), 1);
      assert.ok(await page.locator('#knowledge-dialog').evaluate(d => d.scrollTop > 0));
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ lang, width, theme, cards: hrefs.length, completeBodies: true, geometry: 'PASS', keyboardHistoryAndAliases: 'PASS' }));
      await context.close();
    }
    for (const mode of ['no-js', 'no-dialog']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js' });
      if (mode === 'no-dialog') await context.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined; });
      const page = await context.newPage(); await page.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.extension-detail[hidden]').count(), 0);
      assert.ok(await page.locator('#coefficient-derivation-extension-content').isVisible());
      await page.locator('#coefficient-derivation-extension > a').click();
      assert.equal(await page.evaluate(() => location.hash), '#coefficient-derivation-extension-content');
      console.log(JSON.stringify({ fallback: mode, fullTextAccessible: true }));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

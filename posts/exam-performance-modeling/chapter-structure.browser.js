'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_CHAPTER_EVIDENCE || '/tmp/exam-chapter-split';
fs.mkdirSync(out, { recursive: true });
const expected = ['problem', 'readiness', 'modeling-overview', 'math-toolkit', 'objectives', 'variables', 'exploration', 'models', 'coefficients', 'validation', 'iteration', 'scenarios', 'results', 'checklist', 'references'];
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}#readiness`, { waitUntil: 'networkidle' });
        const sections = page.locator('main > .section:not(.exam-defense-slide)');
        assert.deepEqual(await sections.evaluateAll(ns => ns.map(n => n.id)), expected);
        assert.deepEqual(await sections.evaluateAll(ns => ns.map(n => Number(n.querySelector('.section-kicker').textContent.match(/^\d+/)[0]))), Array.from({ length: 15 }, (_, i) => i + 1));
        const method = page.locator('#readiness'), overview = page.locator('#modeling-overview');
        assert.equal(await method.locator('.modeling-process-node').count(), 6);
        assert.equal(await method.locator('#model-walkthrough, #model-evolution, [data-latex], input').count(), 0);
        assert.doesNotMatch(await method.innerText(), /本题例|Exam example|132\.64|24次|心态/);
        assert.ok(await page.locator('a[href="#modeling-overview"]').count());
        assert.equal(await overview.locator('#model-walkthrough').count(), 1);
        assert.equal(await overview.locator('#model-evolution').count(), 1);
        assert.equal(await overview.locator('.modeling-case-link').count(), 9);
        const targets = await overview.locator('.modeling-case-link').evaluateAll(ns => ns.map(n => ({ href: n.getAttribute('href'), valid: Boolean(document.querySelector(n.getAttribute('href'))) })));
        assert.ok(targets.every(t => t.valid));
        if (width === 1440) {
          await method.screenshot({ path: path.join(out, 'method-chapter.png') });
          await overview.locator('.section-head').screenshot({ path: path.join(out, 'overview-heading.png') });
        }
        await overview.locator('button[data-walk-stage="2"]').click();
        assert.equal(await overview.locator('#model-evolution').isVisible(), true);
        assert.equal(await overview.locator('#walk-chart').isVisible(), false);
        await overview.locator('button[data-evolution-stage="linear"]').click();
        assert.match(await overview.locator('[data-evolution-score]').innerText(), /127\.72/);
        assert.equal(await overview.locator('.evolution-formula .katex-mathml math').count(), 1);
        await overview.locator('[data-walk-action="next"]').click();
        assert.equal(await overview.locator('#model-walkthrough').getAttribute('data-walk-stage'), '3');
        assert.equal(await overview.locator('#walk-chart').isVisible(), true);
        await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
        assert.equal(await overview.locator('#model-walkthrough').getAttribute('data-walk-stage'), '3');
        assert.match(await overview.locator('.section-kicker').innerText(), /^03 /);
        const overflow = await sections.evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id));
        assert.deepEqual(overflow, []);
        const ids = await page.locator('[id]').evaluateAll(ns => ns.map(n => n.id));
        assert.equal(new Set(ids).size, ids.length);
        assert.equal(await page.locator('[data-math-error], .katex-error').count(), 0); assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, readingChapters: 15, methodOnly: true, overviewAfterMethod: true, solutionLinks: targets.length, interactionAndLanguage: true, duplicateIds: false, overflow, errors }));
      } finally { await context.close(); }
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage(); await page.goto(base + '#modeling-overview', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('main > .section').count(), 15);
      assert.equal(await page.locator('#readiness .modeling-process-node').count(), 6);
      assert.ok(await page.locator('#modeling-overview .walk-fallback').isVisible());
      assert.equal(await page.locator('#modeling-overview .walk-fallback li').count(), 6);
      assert.equal(await page.locator('#modeling-overview .modeling-case-link').count(), 9);
      console.log('No-JavaScript: methodology and the separate problem overview remain complete.');
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

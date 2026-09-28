'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_SCALE_EVIDENCE || '/tmp/exam-score-scale';
const expected = ['\\frac{80}{100}=0.80', '\\frac{130}{150}\\approx0.867'];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}#score-scale-comparison`, { waitUntil: 'networkidle' });
        const paragraph = page.locator('#score-scale-comparison');
        await paragraph.scrollIntoViewIfNeeded();
        await page.evaluate(() => document.fonts.ready);
        const checks = [];
        for (let pass = 0; pass < 3; pass++) {
          const state = await paragraph.evaluate(p => {
            const box = p.getBoundingClientRect(), nodes = [...p.querySelectorAll('[data-latex]')];
            return {
              lang: document.documentElement.lang,
              sources: nodes.map(n => n.dataset.latex),
              annotations: nodes.map(n => n.querySelector('annotation')?.textContent),
              visual: p.querySelectorAll('.katex-html').length,
              math: p.querySelectorAll('.katex-mathml math').length,
              nested: p.querySelectorAll('.katex .katex').length,
              proseMath: p.querySelectorAll(':scope > [data-zh] .katex').length,
              prose: [...p.querySelectorAll(':scope > [data-zh]')].map(n => n.textContent).join(''),
              fonts: nodes.map(n => parseFloat(getComputedStyle(n.querySelector('.katex')).fontSize)),
              overflow: p.scrollWidth > p.clientWidth + 1,
              clipped: nodes.some(n => { const r = n.querySelector('.katex-html').getBoundingClientRect(); return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 2 || r.bottom > box.bottom + 2; })
            };
          });
          assert.deepEqual(state.sources, expected); assert.deepEqual(state.annotations, expected);
          assert.equal(state.visual, 2); assert.equal(state.math, 2); assert.equal(state.nested, 0); assert.equal(state.proseMath, 0);
          assert.match(state.prose, state.lang.startsWith('en') ? /Year 1's score of 80 and Year 3's 130/ : /高一80分与高三130分/);
          assert.match(state.prose, state.lang.startsWith('en') ? /does not remove differences in difficulty or content/ : /不会自动消除试卷难度和知识范围的差异/);
          assert.ok(state.fonts.every(size => size >= 16)); assert.equal(state.overflow, false); assert.equal(state.clipped, false);
          checks.push({ lang: state.lang, math: state.math, visual: state.visual, fonts: state.fonts, overflow: state.overflow, clipped: state.clipped });
          if (pass === 0) await paragraph.screenshot({ path: path.join(out, `${lang}-${width}-${theme}.png`) });
          if (pass < 2) await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
        }
        const sectionOverflow = await page.locator('main > .section').evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id));
        assert.deepEqual(sectionOverflow, []); assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, checks, sectionOverflow, pageErrors: errors }));
      } finally { await context.close(); }
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(base + '#score-scale-comparison', { waitUntil: 'networkidle' });
      const p = page.locator('#score-scale-comparison');
      assert.ok(await p.isVisible());
      assert.deepEqual(await p.locator('[data-latex]').allTextContents(), ['80÷100=0.80', '130÷150≈0.867']);
      console.log('No-JavaScript: both arithmetic strings and original comparison remain readable.');
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

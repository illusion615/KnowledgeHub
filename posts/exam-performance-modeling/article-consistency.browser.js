'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_CONSISTENCY_EVIDENCE || '/tmp/exam-full-review-browser';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
        const logic = page.locator('#model-development-logic');
        assert.match(await logic.innerText(), lang === 'zh' ? /二次|平方项/ : /squared difficulty/);
        assert.match(await logic.innerText(), lang === 'zh' ? /按统一协议评价/ : /evaluated under a matched protocol/);
        assert.match(await page.locator('#historical-evaluation-scope').innerText(), lang === 'zh' ? /已知24条历史记录/ : /24 known historical records/);
        assert.match(await page.locator('#bounded-model-method').innerText(), lang === 'zh' ? /logistic映射给出条件均值/ : /logistic mapping specifies its conditional mean/);
        assert.match(await page.locator('#ref-8').innerText(), /GAIMME/);
        assert.match(await page.locator('#ref-1').innerText(), lang === 'zh' ? /题目照片/ : /Problem Photograph/);
        await logic.scrollIntoViewIfNeeded();
        if (lang === 'zh' && width === 1440) await logic.screenshot({ path: path.join(out, 'development-logic.png') });
        await page.locator('#proxy-model-extension .extension-card-trigger').click();
        await page.waitForFunction(() => document.getElementById('knowledge-dialog').open);
        const scope = page.locator('#proxy-identifiability-scope');
        assert.ok(await scope.isVisible());
        assert.match(await scope.innerText(), lang === 'zh' ? /完整设计矩阵的列秩/ : /column rank of the complete design matrix/);
        const equation = scope.locator('xpath=following-sibling::div[1]');
        assert.ok((await equation.getAttribute('data-latex')).includes('\\kappa'));
        assert.equal(await equation.locator('.katex-mathml math').count(), 1);
        assert.equal(await equation.locator('.katex-html').count(), 1);
        await equation.scrollIntoViewIfNeeded();
        const dimensions = await equation.evaluate(n => ({ width: n.clientWidth, parent: n.parentElement.clientWidth, mathFont: parseFloat(getComputedStyle(n.querySelector('.katex')).fontSize), overflow: n.scrollWidth > n.clientWidth + 2, scrollable: ['auto', 'scroll'].includes(getComputedStyle(n).overflowX) }));
        assert.ok(dimensions.width <= dimensions.parent + 1); assert.ok(dimensions.mathFont >= 16);
        assert.ok(!dimensions.overflow || dimensions.scrollable);
        if (lang === 'zh' && width === 1440) await equation.screenshot({ path: path.join(out, 'proxy-identification.png') });
        const explanation = equation.locator('xpath=following-sibling::p[1]');
        assert.match(await explanation.innerText(), lang === 'zh' ? /能力代理本身也依赖难度系数/ : /ability proxy itself depends on the difficulty coefficient/);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#knowledge-dialog').evaluate(n => n.open), false);
        const overflow = await page.locator('main > .section').evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id));
        assert.deepEqual(overflow, []);
        assert.equal(await page.locator('[data-math-error]').count(), 0); assert.equal(await page.locator('.katex-error').count(), 0); assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, narrativeBoundaries: true, distinctReferences: true, proxyFormulaMathML: true, dimensions, overflow, errors }));
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

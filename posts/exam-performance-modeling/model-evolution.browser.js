/* Interactive model comparison against an existing preview; no model service or new server. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const model = require('./model-evolution.js');
const contextModels = model.trainingModels(require('./model-walkthrough-results.json'));
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}?lang=${lang}&theme=${theme}#model-evolution`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.getElementById('model-evolution').dataset.evolutionReady === 'true');
      await page.locator('#model-evolution').scrollIntoViewIfNeeded();
      const snapshot = await page.locator('#model-evolution-chart [data-exam]').evaluateAll(nodes => nodes.map(node => node.outerHTML));
      assert.equal(snapshot.length, 20);
      const { original, review, referenceTime } = contextModels;
      assert.equal(await page.locator('#model-walkthrough').getAttribute('data-walk-stage'), '2');
      assert.equal(await page.locator('#walk-chart').isVisible(), false);
      const geometry = await page.evaluate(() => {
        const points = [...document.querySelectorAll('#model-evolution-chart [data-exam]')];
        return points.every(point => {
          const t = Number(point.dataset.exam), year = Math.floor((t - 1) / 8) + 1, column = (t - 1) % 8;
          const rows = document.querySelectorAll('#source-year-' + year + ' tbody tr');
          const score = Number(rows[0].querySelectorAll('td')[column].textContent);
          const d = Number(rows[1].querySelectorAll('td')[column].textContent);
          const y = score / (year === 3 ? 150 : 100);
          let cx, cy;
          if (point.tagName.toLowerCase() === 'circle') { cx = Number(point.getAttribute('cx')); cy = Number(point.getAttribute('cy')); }
          else if (point.tagName.toLowerCase() === 'rect') { cx = Number(point.getAttribute('x')) + 5; cy = Number(point.getAttribute('y')) + 5; }
          else { const xy = point.getAttribute('d').match(/^M([\d.]+) ([\d.]+)/); cx = Number(xy[1]); cy = Number(xy[2]) + 6; }
          return Math.abs(Number(point.dataset.rate) - y) < 1e-12 && Number(point.dataset.difficulty) === d &&
            Math.abs(cx - (90 + (d - .1) / .3 * 840)) < 1e-6 && Math.abs(cy - (455 - (y - .5) / .55 * 325)) < 1e-6;
        });
      });
      assert.ok(geometry);
      assert.equal(await page.locator('#evolution-difficulty').isDisabled(), false);
      assert.equal(await page.locator('#model-evolution').getAttribute('data-evolution-stage'), 'baseline');
      assert.equal(await page.locator('#modeling-overview #model-evolution').count(), 1);
      assert.equal(await page.locator('#model-evolution button[data-evolution-stage]').count(), 3);
      async function setDifficulty(d) {
        await page.locator('#evolution-difficulty').evaluate((input, value) => {
          input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
        }, String(d));
      }
      const shapes = {};
      for (const stage of ['baseline', 'linear', 'bounded']) {
        await page.locator(`button[data-evolution-stage="${stage}"]`).click();
        assert.equal(await page.locator(`button[data-evolution-stage="${stage}"]`).getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('.evolution-formula .katex-mathml math').count(), 1);
        assert.equal(await page.locator('.evolution-formula .katex-html').count(), 1);
        shapes[stage] = await page.locator('#model-evolution [data-curve="observed-difficulty-range"]').getAttribute('d');
        const ys = [...shapes[stage].matchAll(/[ML][\d.-]+ ([\d.-]+)/g)].map(m => +m[1]);
        if (stage === 'baseline') assert.ok(ys.every(y => y === ys[0]));
        const secondDifference = ys[50] - 2 * ys[25] + ys[0];
        if (stage === 'linear') assert.ok(Math.abs(secondDifference) < 1e-4);
        if (stage === 'bounded') assert.ok(Math.abs(secondDifference) > 1);
        for (const d of [.1, .2, .4]) {
          await setDifficulty(d);
          let expected;
          if (stage === 'baseline') expected = original.targets.y.candidates.mean3.full_refit_coefficients.mean;
          else if (stage === 'linear') {
            const b = original.targets.y.candidates.linear.full_refit_coefficients;
            expected = b.intercept + referenceTime * b.time + b.difficulty * d;
          } else {
            const b = review.full_fit.y.beta;
            expected = 1 / (1 + Math.exp(-(b[0] + b[1] * (referenceTime - 16) / 8 + b[2] * (d - .2) / .1)));
          }
          const actual = Number((await page.locator('[data-evolution-score]').innerText()).match(/[\d.]+/)[0]);
          assert.equal(actual.toFixed(2), (150 * expected).toFixed(2));
          const rate = Number(await page.locator('[data-prediction]').getAttribute('data-rate'));
          assert.ok(Math.abs(rate - expected) < 1e-12);
          assert.deepEqual(await page.locator('#model-evolution-chart [data-exam]').evaluateAll(nodes => nodes.map(node => node.outerHTML)), snapshot, 'observations never move');
          if (stage === 'linear' && d === .1) assert.equal(actual.toFixed(2), '146.81');
          if (stage === 'bounded') assert.ok(actual < 150 && actual > 0);
        }
      }
      assert.equal(new Set(Object.values(shapes)).size, 3);
      const axes = await page.locator('#model-evolution .evolution-formula').evaluate(n => ({ width: n.clientWidth, parent: n.parentElement.clientWidth, math: n.querySelector('.katex').getBoundingClientRect().width, font: parseFloat(getComputedStyle(n.querySelector('.katex')).fontSize) }));
      assert.ok(axes.width <= axes.parent + 1); assert.ok(axes.font >= 16);
      await page.locator('#evolution-difficulty').focus();
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('#evolution-difficulty').inputValue(), '0.39');
      const layout = await page.locator('#model-evolution').evaluate(figure => ({
        overflow: figure.scrollWidth > figure.clientWidth + 1,
        fonts: [...new Set([...figure.querySelectorAll('svg text')].map(text => {
          const matrix = text.getScreenCTM(); return +(parseFloat(getComputedStyle(text).fontSize) * Math.hypot(matrix.c, matrix.d)).toFixed(3);
        }))],
        clipped: [...figure.querySelectorAll('svg text')].some(text => {
          const b = text.getBBox(), v = text.ownerSVGElement.viewBox.baseVal;
          return b.x < -1 || b.y < -1 || b.x + b.width > v.width + 1 || b.y + b.height > v.height + 1;
        }),
        lineFills: [...figure.querySelectorAll('.evolution-model-line')].map(e => getComputedStyle(e).fill)
      }));
      assert.equal(layout.overflow, false); assert.equal(layout.clipped, false); assert.deepEqual(layout.fonts, [16]);
      assert.ok(layout.lineFills.every(fill => fill === 'none'));
      if (width === 390) {
        assert.ok(await page.locator('#model-evolution .exam-chart-scroll').evaluate(e => { e.scrollLeft = 100; return e.scrollLeft > 0; }));
      }
      await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
      assert.equal(await page.locator('#model-evolution').getAttribute('data-evolution-stage'), 'bounded');
      assert.equal(await page.locator('#evolution-difficulty').inputValue(), '0.39');
      const switched = await page.locator('.evolution-description').innerText();
      assert.ok(switched.includes(lang === 'zh' ? 'quasi-likelihood' : '准似然'));
      assert.equal(await page.locator('.evolution-formula .katex-mathml math').count(), 1);
      assert.equal(await page.locator('.katex-error').count(), 0); assert.deepEqual(errors, []);
      console.log(JSON.stringify({ lang, width, theme, stages: 3, records: 20, referenceTime: 20, geometry: 'PASS', interaction: 'PASS', layout }));
      await context.close();
    }
    const context = await browser.newContext(); const page = await context.newPage();
    await page.route('**/robustness-review-results.json', route => route.fulfill({ status: 503, body: 'Test failure' }));
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#model-evolution-chart [data-exam]').count(), 20);
    assert.equal(await page.locator('#model-evolution .evolution-controls').isVisible(), false);
    assert.ok((await page.locator('#model-evolution .evolution-status').textContent()).includes('暂未加载'));
    assert.equal(await page.locator('[data-evolution-score]').textContent(), '—');
    console.log('Model-result failure: observed data retained, no fabricated forecast.');
    await context.close();
    const fallback = await browser.newContext({ javaScriptEnabled: false }); const fallbackPage = await fallback.newPage();
    await fallbackPage.goto(base, { waitUntil: 'networkidle' });
    assert.ok(await fallbackPage.locator('#model-walkthrough .walk-fallback').isVisible());
    assert.match(await fallbackPage.locator('#model-walkthrough .walk-fallback').innerText(), /有界修订/);
    assert.ok(await fallbackPage.locator('#source-year-1').isVisible());
    await fallback.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

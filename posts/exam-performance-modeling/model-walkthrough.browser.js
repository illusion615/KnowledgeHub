'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const original = require('./model-results.json');
const walk = require('./model-walkthrough.js');
const shared = require('./model-evolution.js');
const training = require('./model-walkthrough-results.json');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const screenshots = process.env.EXAM_WALK_SCREENSHOTS || '/tmp/exam-model-walkthrough';
fs.mkdirSync(screenshots, { recursive: true });
// SVG getBBox uses float32 geometry; model-rate comparisons keep double precision.
const nearly = (a, b, tolerance = 1e-3) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
async function observations(page) {
  return page.locator('#model-walkthrough [data-observed]').evaluateAll(nodes => nodes.map(n => {
    const b = n.getBBox();
    return { t: +n.dataset.observed, year: +n.dataset.year, score: +n.dataset.score, maximum: +n.dataset.maximum, rate: +n.dataset.rate, d: +n.dataset.difficulty, x: b.x + b.width / 2, y: b.y + b.height / 2 + (n.tagName === 'path' ? .5 : 0) };
  }).sort((a, b) => a.t - b.t));
}
async function layout(page) {
  return page.locator('#model-walkthrough').evaluate(f => {
    const svg = f.querySelector(f.dataset.walkStage === '2' ? '#model-evolution-chart' : '#walk-chart');
    const ns = [...svg.querySelectorAll('text')], box = svg.viewBox.baseVal;
    return {
      overflow: f.scrollWidth > f.clientWidth + 1,
      fonts: [...new Set(ns.map(e => { const m = e.getScreenCTM(); return +(parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.c, m.d)).toFixed(3); }))],
      clipped: ns.filter(e => { const b = e.getBBox(); return b.x < 0 || b.y < 0 || b.x + b.width > box.width + 1 || b.y + b.height > box.height + 1; }).map(e => e.textContent),
      labelsOverlap: (() => { const bad = []; for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const a = ns[i].getBBox(), b = ns[j].getBBox(); if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1) bad.push([ns[i].textContent, ns[j].textContent]); } return bad; })()
    };
  });
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if (/\/(model-results|robustness-review-results)\.json$/.test(r.url())) requests.push(r.url().split('/').pop()); });
      await page.goto(`${base}?lang=${lang}&theme=${theme}#model-walkthrough`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('#model-walkthrough').dataset.walkReady === 'true');
      const f = page.locator('#model-walkthrough');
      assert.equal(await f.locator('[data-walk-action="play"], [data-walk-action="reset"], [data-walk-progress]').count(), 0);
      const raw = await observations(page), source = await page.evaluate(() => [1, 2, 3].flatMap(year => {
        const rows = document.querySelectorAll('#source-year-' + year + ' tbody tr');
        const scores = [...rows[0].querySelectorAll('td')].map(n => +n.textContent), d = [...rows[1].querySelectorAll('td')].map(n => +n.textContent);
        return scores.map((score, i) => ({ t: (year - 1) * 8 + i + 1, year, score, maximum: year === 3 ? 150 : 100, rate: score / (year === 3 ? 150 : 100), d: d[i] }));
      }));
      assert.equal(raw.length, 24);
      const fingerprints = [], mathChecks = [];
      let normalizedCoordinates, conditionalCoordinates;
      for (let stage = 0; stage < 6; stage++) {
        await f.locator(`[data-walk-stage="${stage}"]`).click();
        assert.equal(await f.getAttribute('data-walk-stage'), String(stage));
        assert.equal(await f.locator(`[data-walk-stage="${stage}"]`).getAttribute('aria-pressed'), 'true');
        assert.equal(await f.locator('[aria-current="step"]').count(), 1);
        const process = await f.locator('.walk-stages button').evaluateAll(ns => ns.map(n => n.getBoundingClientRect().top));
        assert.ok(process.every(top => Math.abs(top - process[0]) < 1), 'all six stages stay in one process row');
        const arrows = await f.locator('.walk-chart-frame').evaluate(frame => {
          const before = frame.querySelector('.walk-arrow-previous').getBoundingClientRect();
          const after = frame.querySelector('.walk-arrow-next').getBoundingClientRect();
          const chart = frame.querySelector(frame.closest('#model-walkthrough').dataset.walkStage === '2' ? '#model-evolution-chart' : '#walk-chart').getBoundingClientRect();
          const scroller = frame.querySelector(frame.closest('#model-walkthrough').dataset.walkStage === '2' ? '#model-evolution .exam-chart-scroll' : '.walk-chart-scroll').getBoundingClientRect();
          return { before: before.right <= scroller.left + 1, after: after.left >= scroller.right - 1, aligned: Math.abs((before.top + before.height / 2) - (chart.top + chart.height / 2)) < 1 };
        });
        assert.deepEqual(arrows, { before: true, after: true, aligned: true });
        assert.equal((await f.locator('.walk-arrow').allTextContents()).join('').trim(), '');
        assert.ok(await f.locator('.walk-arrow-previous').getAttribute('aria-label'));
        const values = await f.locator('.walk-numbers tbody tr').evaluateAll(ns => ns.map(n => [...n.cells].map(c => c.textContent)));
        if (stage === 0) assert.deepEqual(values.map(row => row[2]), [0, 8, 16].map(start => source.slice(start, start + 8).map(r => r.score).join(', ')));
        if (stage === 1) assert.equal(values[1][3], '0.8667');
        if (stage === 2) assert.deepEqual(values.map(row => row[1]), ['1.070835476', '0.001756078', '-1.272539739']);
        if (stage === 3) assert.deepEqual(values[0], ['1', '80', '75.45', '4.55']);
        if (stage === 4) assert.deepEqual(values.map(row => row[2]), ['108.89', '114.88', '128.51', '138.32']);
        if (stage === 5) assert.deepEqual(values.map(row => row[2]), ['9.82', '17.19', '13.51']);
        assert.equal(await f.locator('#model-evolution').isVisible(), stage === 2);
        assert.equal(await f.locator('#walk-chart').isVisible(), stage !== 2);
        assert.equal(await f.locator('.walk-number-scroll').isVisible(), stage !== 2);
        if (stage === 2) assert.equal(await f.locator('#model-evolution-chart [data-exam]').count(), 20);
        const now = stage === 2 ? normalizedCoordinates : await observations(page);
        now.forEach((r, i) => {
          const { x, y, ...data } = r;
          assert.deepEqual(data, source[i]);
          nearly(x, stage >= 3 ? shared.x(r.d) : 80 + (r.t - 1) / 24 * 860);
          const min = stage === 0 ? 0 : .5, max = stage === 0 ? 160 : 1.05;
          nearly(y, stage >= 3 ? shared.y(r.rate) : 420 - ((stage === 0 ? r.score : r.rate) - min) / (max - min) * 280);
        });
        if (stage === 1) normalizedCoordinates = now;
        if (stage === 3) conditionalCoordinates = now;
        if (stage >= 3) assert.deepEqual(now, conditionalCoordinates, 'all 24 observations retain their difficulty/rate coordinates');
        assert.equal(await f.locator('[data-observed="25"]').count(), 0);
        assert.equal(await f.locator('[data-error-exam]').count(), stage === 3 || stage === 4 ? 1 : 0);
        if (stage >= 3) {
          assert.equal(await f.getAttribute('data-inspection-exam'), String(stage === 3 ? 20 : stage === 4 ? 21 : 25));
          assert.equal(await f.getAttribute('data-coefficient-cutoff'), stage === 5 ? '24' : '20');
          assert.equal(await f.locator('.walk-selected-observation').count(), stage === 5 ? 0 : 1);
        }
        const estimates = await f.locator('[data-estimate-kind]').evaluateAll(ns => ns.map(n => { const b = n.getBBox(); return { t: +n.dataset.exam, rate: +n.dataset.rate, kind: n.dataset.estimateKind, x: b.x + b.width / 2, y: b.y + b.height / 2 }; }));
        assert.equal(estimates.length, stage >= 3 ? 1 : 0);
        const b = original.targets.y.candidates.linear.full_refit_coefficients;
        estimates.forEach(p => {
          const rate = p.kind === 'training-fit' ? training.fitted[p.t - 1].predicted_rate
            : p.kind === 'holdout' ? original.targets.y.candidates.linear.final_test.observations[p.t - 21].predicted_rate
            : p.kind === 'full-fit' ? b.intercept + p.t * b.time + source[p.t - 1].d * b.difficulty : b.intercept + 25 * b.time + .2 * b.difficulty;
          nearly(p.rate, rate, 1e-12);
          nearly(p.y, shared.y(rate));
          nearly(p.x, shared.x(stage === 5 ? .2 : source[p.t - 1].d));
        });
        if (stage === 4) { assert.equal(await f.locator('#walk-exam option').count(), 4); assert.match(await f.locator('.walk-readout').innerText(), /6\.60/); }
        if (stage === 5) {
          assert.match(await f.locator('.walk-readout').innerText(), /132\.64/);
          assert.equal(await f.locator('.walk-model').first().evaluate(n => getComputedStyle(n).fill), 'none');
          const fullLine = await f.locator('[data-process-curve="supported-difficulty"]').getAttribute('d');
          await f.locator('[data-walk-case="0.1"]').click();
          assert.equal(await f.locator('[data-process-curve="supported-difficulty"]').getAttribute('d'), fullLine);
          assert.match(await f.locator('.walk-readout').innerText(), /151\.19/);
          assert.ok(+(await f.locator('[data-estimate-kind="scenario"]').getAttribute('data-rate')) > 1);
        }
        const curves = await f.locator('[data-process-curve]').evaluateAll(ns => ns.map(n => ({ kind: n.dataset.processCurve, d: n.getAttribute('d'), fill: getComputedStyle(n).fill })));
        const expectedCurves = walk.paths(stage, source.map(r => ({ ...r, difficulty: r.d })), original, shared, training, stage === 5 ? .1 : .2);
        if (stage !== 2) assert.deepEqual(curves, expectedCurves.map(p => ({ kind: p.kind, d: p.d, fill: 'none' })));
        // Check actual rendered math in both languages at every stage, not just source strings.
        for (let languagePass = 0; languagePass < 2; languagePass++) {
          const math = await f.evaluate(figure => {
            const formulas = [...figure.querySelectorAll('[data-latex]')].filter(n => !n.closest('[hidden]') && n.getBoundingClientRect().width > 0);
            return {
              count: formulas.length,
              rendered: formulas.filter(n => n.querySelector('.katex-html') && n.querySelector('.katex-mathml math')).length,
              nested: figure.querySelectorAll('.katex .katex').length,
              readout: [...figure.querySelectorAll('.walk-readout [data-latex]')].map(n => n.dataset.latex),
              caption: [...figure.querySelectorAll('.walk-numbers caption [data-latex]')].map(n => n.dataset.latex),
              numericCellsMath: figure.querySelectorAll('.walk-numbers tbody .katex').length,
              sizes: formulas.map(n => ({ width: n.getBoundingClientRect().width, available: n.parentElement.clientWidth, scrollWidth: n.scrollWidth, font: parseFloat(getComputedStyle(n.querySelector('.katex')).fontSize), accentWidths: [...n.querySelectorAll('svg')].map(s => s.getBoundingClientRect().width) }))
            };
          });
          assert.equal(math.rendered, math.count); assert.equal(math.nested, 0); assert.equal(math.numericCellsMath, 0);
          math.sizes.forEach(s => { assert.ok(s.font >= 16, JSON.stringify(s)); assert.ok(s.width <= s.available + 1, JSON.stringify(s)); assert.ok(s.scrollWidth <= s.width + 4, JSON.stringify(s)); s.accentWidths.forEach(w => assert.ok(w < 40, JSON.stringify(s))); });
          if (stage === 1) assert.ok(math.readout.includes('\\frac{80}{100}=0.8000'));
          if (stage === 2) {
            assert.ok(math.rendered >= 2);
            assert.equal(await f.locator('.evolution-formula .katex-mathml math').count(), 1);
            const c = shared.trainingModels(training);
            assert.equal(await f.locator('.evolution-formula').getAttribute('data-latex'), shared.formula('baseline', c.original, c.review, c.referenceTime));
          }
          if (stage === 5) assert.ok(math.readout.includes('G(d)\\approx24.56-73.72d'));
          mathChecks.push({ stage, languagePass, mathDOM: math.rendered, readoutMath: math.readout.length, captionMath: math.caption.length, minFont: math.sizes.length ? Math.min(...math.sizes.map(s => s.font)) : null });
          await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
          assert.equal(await f.getAttribute('data-walk-stage'), String(stage));
        }
        fingerprints.push(await f.locator(stage === 2 ? '#model-evolution-chart' : '[data-walk-view]').innerHTML());
        const fit = await layout(page);
        assert.equal(fit.overflow, false); assert.deepEqual(fit.clipped, []); assert.deepEqual(fit.labelsOverlap, []); assert.deepEqual(fit.fonts, [16]);
        if (width > 900) {
          await f.locator(stage === 2 ? '#model-evolution-chart' : '#walk-chart').screenshot({ path: path.join(screenshots, `${lang}-${stage}.png`) });
          if ([1, 5].includes(stage)) await f.locator('.walk-readout').screenshot({ path: path.join(screenshots, `${lang}-${stage}-math.png`) });
          if (stage === 2) await f.locator('.evolution-formula').screenshot({ path: path.join(screenshots, `${lang}-${stage}-table.png`) });
        }
      }
      assert.equal(new Set(fingerprints).size, 6);
      await f.locator('[data-walk-action="revise"]').click(); assert.equal(await f.getAttribute('data-walk-stage'), '2');
      await f.locator('[data-walk-action="next"]').focus(); await page.keyboard.press('Enter'); assert.equal(await f.getAttribute('data-walk-stage'), '3');
      await f.locator('[data-walk-stage="4"]').focus(); await page.keyboard.press('Space'); assert.equal(await f.getAttribute('data-walk-stage'), '4');
      if (width < 700) {
        const scroller = f.locator('.walk-chart-scroll'); await scroller.focus(); await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('#model-walkthrough .walk-chart-scroll').scrollLeft > 0);
      }
      if (lang === 'zh' && width === 1440) await f.screenshot({ path: path.join(screenshots, 'overview-process-layout.png') });
      const geometryBefore = await observations(page);
      await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
      assert.equal(await f.getAttribute('data-walk-stage'), '4'); assert.deepEqual(await observations(page), geometryBefore);
      assert.equal(await f.locator('.walk-arrow-next').getAttribute('aria-label'), lang === 'zh' ? 'Next Step' : '下一步');
      assert.equal(await f.locator('.walk-step-number').count(), 6);
      assert.match(await f.locator('.walk-description').innerText(), lang === 'zh' ? /Keep the exam-20 parameters frozen/ : /保持前20次参数冻结/);
      await page.emulateMedia({ media: 'print' });
      assert.ok(await f.locator('.walk-fallback').isVisible()); assert.equal(await f.locator('.walk-fallback li').count(), 6);
      assert.equal(await f.locator('.walk-controls').isVisible(), false);
      const staticMath = await f.locator('.walk-fallback [data-latex]').count();
      assert.ok(staticMath >= 16); assert.equal(await f.locator('.walk-fallback [data-latex] .katex-mathml math').count(), staticMath);
      await page.emulateMedia({ media: 'screen' });
      const sections = await page.locator('main > .section').evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id));
      assert.deepEqual(sections, []);
      assert.equal(requests.filter(n => n === 'model-results.json').length, 1); assert.equal(requests.filter(n => n === 'robustness-review-results.json').length, 1);
      assert.equal(await page.locator('.katex-error').count(), 0); assert.deepEqual(errors, []);
      console.log(JSON.stringify({ lang, width, theme, views: 6, observations: 24, immutableData: true, coordinatesChecked: true, savedHoldout: true, distinctGraphics: true, fontPixels: 16, mathChecks, staticMath, keyboardLanguagePrint: true, sectionOverflow: sections, sharedResultRequests: requests }));
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(); await page.goto(base + '#model-walkthrough', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#model-walkthrough').dataset.walkReady === 'true');
    const f = page.locator('#model-walkthrough');
    await page.clock.install();
    await page.clock.fastForward(60000); assert.equal(await f.getAttribute('data-walk-stage'), '0');
    assert.equal(await f.locator('[data-walk-action="play"]').count(), 0);
    for (let i = 1; i <= 5; i++) { await f.locator('[data-walk-action="next"]').click(); assert.equal(await f.getAttribute('data-walk-stage'), String(i)); }
    assert.ok(await f.locator('[data-walk-action="next"]').isDisabled());
    await page.evaluate(() => { for (let i = 0; i < 60; i++) document.querySelector(`[data-walk-stage="${i % 6}"]`).click(); });
    await page.clock.fastForward(60000); assert.equal(await f.getAttribute('data-walk-stage'), '5');
    await f.locator('[data-walk-stage="2"]').click();
    await f.locator('button[data-evolution-stage="bounded"]').click();
    await f.locator('[data-walk-action="next"]').click();
    assert.equal(await f.getAttribute('data-walk-stage'), '3');
    assert.equal(await f.locator('#model-evolution').isVisible(), false);
    assert.ok((await f.locator('.walk-fit-equation').innerText()).includes('1.070835476'));
    await f.locator('[data-walk-stage="2"]').click();
    assert.equal(await f.locator('#model-evolution').getAttribute('data-evolution-stage'), 'bounded');
    await f.locator('[data-walk-stage="0"]').click(); assert.equal(await f.getAttribute('data-walk-stage'), '0');
    assert.ok(await f.locator('[data-walk-action="previous"]').isDisabled());
    await page.locator('#references').scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.clock.fastForward(60000);
    assert.equal(await f.getAttribute('data-walk-stage'), '0');
    await page.evaluate(() => document.querySelector('[data-presentation-toggle]').click());
    await page.locator('.launch-play-btn').click();
    await page.waitForFunction(() => document.documentElement.classList.contains('is-presentation-mode'));
    assert.ok(await page.locator('.exam-defense-slide').count() > 20);
    assert.equal(await page.locator('.exam-defense-slide').evaluateAll(ns => ns.filter(n => !n.textContent.trim()).length), 0);
    assert.equal(await page.locator('#readiness').getAttribute('data-present-exclude'), '');
    assert.equal(await page.locator('#modeling-overview').getAttribute('data-present-exclude'), '');
    console.log('Manual only: no autoplay control, no time-driven advancement, arrows/endpoints/direct selection/rapid switching verified; dedicated static defense deck preserved.');
    await context.close();
    for (const failure of ['no-js', 'result-fetch', 'source-mismatch', 'invalid-holdout', 'training-fetch', 'training-coefficients']) {
      const context = await browser.newContext({ javaScriptEnabled: failure !== 'no-js' }); const page = await context.newPage();
      if (failure === 'result-fetch') await page.route('**/model-results.json', r => r.abort());
      if (failure === 'training-fetch') await page.route('**/model-walkthrough-results.json*', r => r.abort());
      if (failure === 'training-coefficients') await page.route('**/model-walkthrough-results.json*', r => r.fulfill({ json: { ...training, coefficients: { ...training.coefficients, time: 99 } } }));
      if (failure === 'source-mismatch') await page.route('**/model-results.json', r => r.fulfill({ json: { ...original, source_sha256: 'invalid' } }));
      if (failure === 'invalid-holdout') await page.route('**/model-results.json', r => {
        const invalid = structuredClone(original); invalid.targets.y.candidates.linear.final_test.mae_points_150 = 0;
        return r.fulfill({ json: invalid });
      });
      await page.goto(base + '#model-walkthrough', { waitUntil: 'networkidle' });
      const f = page.locator('#model-walkthrough');
      assert.ok(await f.locator('.walk-fallback').isVisible()); assert.equal(await f.locator('.walk-fallback li').count(), 6);
      assert.equal(await f.locator('.walk-controls').isVisible(), false);
      assert.equal(await f.locator('[data-estimate-kind]').count(), 0);
      if (failure !== 'no-js') { assert.equal(await f.locator('[data-observed]').count(), 24); assert.match(await f.locator('.walk-status').innerText(), /未能加载|could not be loaded/); }
      console.log(`${failure}: all static steps preserved, no unchecked predictions.`); await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

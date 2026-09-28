'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const original = require('./model-results.json');
const training = require('./model-walkthrough-results.json');
const model = require('./model-evolution.js');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_SLICE_EVIDENCE || '/tmp/exam-conditional-curves';
fs.mkdirSync(out, { recursive: true });
const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
async function fingerprint(f) {
  return f.locator('#walk-chart [data-observed]').evaluateAll(ns => ns.map(n => {
    const b = n.getBBox();
    return { t: +n.dataset.observed, d: +n.dataset.difficulty, rate: +n.dataset.rate, score: +n.dataset.score, max: +n.dataset.maximum,
      x: b.x + b.width / 2, y: b.y + b.height / 2 + (n.tagName === 'path' ? .5 : 0) };
  }).sort((a, b) => a.t - b.t));
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}#modeling-overview`, { waitUntil: 'networkidle' });
        const f = page.locator('#model-walkthrough');
        await page.waitForFunction(() => document.querySelector('#model-walkthrough').dataset.walkReady === 'true');
        await f.locator('button[data-walk-stage="3"]').click();
        const observations = await fingerprint(f); assert.equal(observations.length, 24);
        observations.forEach(r => { near(r.x, model.x(r.d)); near(r.y, model.y(r.rate)); assert.equal(r.rate, r.score / r.max); });
        const params = await f.locator('.walk-fit-equation [data-latex]').evaluateAll(ns => ns.map(n => n.dataset.latex));
        for (let t = 1; t <= 24; t++) {
          if (t === 21) await f.locator('button[data-walk-stage="4"]').click();
          await f.locator('#walk-exam').selectOption(String(t));
          assert.equal(await f.getAttribute('data-inspection-exam'), String(t));
          assert.equal(await f.getAttribute('data-coefficient-cutoff'), '20');
          assert.equal(await f.locator('#walk-exam option').count(), t <= 20 ? 20 : 4);
          assert.deepEqual(await f.locator('.walk-fit-equation [data-latex]').evaluateAll(ns => ns.map(n => n.dataset.latex)), params);
          assert.deepEqual(await fingerprint(f), observations, 'observed points do not move when the stage condition changes');
          const r = observations[t - 1], rate = t <= 20 ? training.fitted[t - 1].predicted_rate : original.targets.y.candidates.linear.final_test.observations[t - 21].predicted_rate;
          const shape = await f.locator('#walk-chart').evaluate(svg => {
            const p = svg.querySelector('[data-estimate-kind]'), b = p.getBBox(), e = svg.querySelector('[data-error-exam]');
            return { t: +p.dataset.exam, d: +p.dataset.difficulty, rate: +p.dataset.rate, x: b.x + b.width / 2, y: b.y + b.height / 2,
              selected: [...svg.querySelectorAll('.walk-selected-observation')].map(n => +n.dataset.observed),
              residuals: svg.querySelectorAll('[data-error-exam]').length, x1: +e.getAttribute('x1'), x2: +e.getAttribute('x2'), y1: +e.getAttribute('y1'), y2: +e.getAttribute('y2'),
              curves: [...svg.querySelectorAll('[data-process-curve]')].map(n => ({ t: +n.dataset.referenceExam, cutoff: +n.dataset.coefficientCutoff, d: n.getAttribute('d') })) };
          });
          assert.equal(shape.t, t); assert.equal(shape.d, r.d); near(shape.rate, rate, 1e-12);
          near(shape.x, model.x(r.d)); near(shape.y, model.y(rate));
          assert.deepEqual(shape.selected, [t]); assert.equal(shape.residuals, 1);
          assert.equal(await f.locator('#walk-chart [data-observed]').last().getAttribute('data-observed'), String(t));
          near(shape.x1, shape.x2); near(shape.x1, model.x(r.d)); near(shape.y1, model.y(r.rate)); near(shape.y2, model.y(rate));
          shape.curves.forEach((curve, segment) => {
            assert.equal(curve.t, t); assert.equal(curve.cutoff, 20);
            const start = segment === 0 ? .1 : .15, end = segment === 0 ? .15 : .4;
            const vertices = [...curve.d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)]; assert.equal(vertices.length, 51);
            vertices.forEach((v, i) => {
              const d = start + (end - start) * i / 50, b = training.coefficients;
              near(+v[1], model.x(d), 1e-9); near(+v[2], model.y(b.intercept + b.time * t + b.difficulty * d), 1e-9);
            });
          });
          const source = await f.locator('.walk-readout [data-latex]').getAttribute('data-latex');
          assert.equal(source, `e_{${t}}=y_{${t}}-\\widehat y_{${t}}\\approx${(r.rate - rate).toFixed(6)}`);
          assert.equal(await f.locator('.walk-readout .katex-mathml math').count(), 1);
          assert.equal(await f.locator('.walk-numbers tr[aria-current="true"] td').first().textContent(), String(t));
          if (t <= 20) assert.ok(await f.locator('.walk-number-scroll').evaluate(n => {
            const row = n.querySelector('[aria-current="true"]').getBoundingClientRect(), container = n.getBoundingClientRect(), header = n.querySelector('thead').getBoundingClientRect();
            return row.top >= container.top + header.height - 1 && row.bottom <= container.bottom + 1;
          }), 'selected row stays visible below the sticky header');
          if (width > 900 && (t === 1 || t === 21)) await f.locator('#walk-chart').screenshot({ path: path.join(out, `${lang}-exam-${t}.png`) });
        }
        await f.locator('button[data-walk-stage="3"]').click();
        await page.emulateMedia({ media: 'print' });
        assert.equal(await f.locator('.walk-numbers tbody tr').count(), 20);
        assert.equal(await f.locator('.walk-number-scroll').evaluate(n => n.scrollHeight > n.clientHeight + 1), false);
        assert.equal(await f.locator('#walk-exam').isVisible(), false);
        await page.emulateMedia({ media: 'screen' });
        await f.locator('button[data-walk-stage="4"]').click();
        await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
        assert.equal(await f.locator('#walk-exam').inputValue(), '24'); assert.deepEqual(await fingerprint(f), observations);
        await f.locator('button[data-walk-stage="3"]').click(); assert.equal(await f.locator('#walk-exam').inputValue(), '20');
        await f.locator('#walk-exam').selectOption('1'); await f.locator('#walk-exam').focus(); await page.keyboard.press('ArrowDown');
        assert.equal(await f.locator('#walk-exam').inputValue(), '2');
        await f.locator('button[data-walk-stage="4"]').click(); assert.equal(await f.locator('#walk-exam').inputValue(), '24');
        await f.locator('button[data-walk-stage="5"]').click();
        assert.equal(await f.getAttribute('data-inspection-exam'), '25'); assert.equal(await f.getAttribute('data-coefficient-cutoff'), '24');
        assert.equal(await f.locator('#walk-exam').isVisible(), false); assert.equal(await f.locator('[data-error-exam], .walk-selected-observation, [data-observed="25"]').count(), 0);
        const curves = await f.locator('[data-process-curve]').evaluateAll(ns => ns.map(n => n.getAttribute('d')));
        for (const d of [.2, .1]) {
          await f.locator(`[data-walk-case="${d}"]`).click();
          const p = f.locator('[data-estimate-kind="scenario"]');
          near(+(await p.getAttribute('data-rate')), model.linearAt(25, d, original), 1e-12);
          near(+(await p.getAttribute('data-x')), model.x(d)); near(+(await p.getAttribute('data-y')), model.y(model.linearAt(25, d, original)));
          assert.deepEqual(await f.locator('[data-process-curve]').evaluateAll(ns => ns.map(n => n.getAttribute('d'))), curves);
          assert.deepEqual(await fingerprint(f), observations);
        }
        assert.ok(+(await f.locator('[data-estimate-kind="scenario"]').getAttribute('data-rate')) > 1);
        assert.equal(await f.evaluate(n => n.scrollWidth > n.clientWidth + 1), false);
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, inspectedExams: 24, verticesPerCurve: 51, fixedObservationCoordinates: true, oneMatchedResidual: true, frozenThrough20: true, refitAt25: true, keyboardLanguageState: true, noObserved25: true, unclippedExtrapolation: true, errors }));
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

/* Formula fallback is independent of model-data readiness. Uses an existing preview. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const model = require('./model-evolution.js');
const { original, review, referenceTime } = model.trainingModels(require('./model-walkthrough-results.json'));
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const records = page => page.locator('#model-evolution-chart [data-exam]').evaluateAll(ns => ns.map(n => ({
  exam: n.dataset.exam, rate: n.dataset.rate, difficulty: n.dataset.difficulty,
  cx: n.getAttribute('cx'), cy: n.getAttribute('cy'), x: n.getAttribute('x'), y: n.getAttribute('y'), d: n.getAttribute('d')
})));
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const mode of ['blocked-katex', 'render-throws']) {
      for (const [lang, width, theme] of [['en', 390, 'dark'], ['zh', 1440, 'light']]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        try {
          if (mode === 'blocked-katex') await context.route('**/vendor/katex/katex.min.js', route => route.abort());
          const page = await context.newPage(), errors = [];
          page.on('pageerror', e => errors.push(e.message));
          await page.goto(`${base}?lang=${lang}&theme=${theme}#model-evolution`, { waitUntil: 'networkidle' });
          await page.waitForFunction(() => document.querySelector('#model-evolution').dataset.evolutionReady === 'true');
          const f = page.locator('#model-evolution'), formula = f.locator('.evolution-formula');
          const before = await records(page); assert.equal(before.length, 20);
          if (mode === 'render-throws') await page.evaluate(() => {
            const render = window.katex.render;
            window.__restoreEvolutionRenderer = () => { window.katex.render = render; };
            window.katex.render = (latex, target, options) => {
              if (target.classList.contains('evolution-formula')) {
                target.textContent = 'Partial, stale renderer output';
                throw new Error('Deliberate formula-render failure');
              }
              return render(latex, target, options);
            };
          });
          let count = 0;
          for (const stage of ['baseline', 'linear', 'bounded']) {
            await f.locator(`button[data-evolution-stage="${stage}"]`).click();
            for (let pass = 0; pass < 2; pass++) {
              const state = await f.evaluate(figure => {
                const output = figure.querySelector('.evolution-formula');
                const source = output.querySelector('.evolution-formula-source');
                const status = figure.querySelector('.evolution-math-status');
                return {
                  lang: document.documentElement.lang, stage: figure.dataset.evolutionStage,
                  ready: figure.dataset.evolutionReady, controlsHidden: figure.querySelector('.evolution-controls').hidden,
                  formulaHidden: output.hidden, state: output.dataset.mathState, error: output.dataset.mathError,
                  latex: output.dataset.latex, renderedLatex: output.dataset.renderedLatex || null,
                  source: source && source.textContent, mathDOM: output.querySelectorAll('.katex').length,
                  statusHidden: status.hidden, statusText: status.textContent, role: status.getAttribute('role'),
                  describedBy: output.getAttribute('aria-describedby'), statusId: status.id,
                  curves: [...figure.querySelectorAll('[data-curve]')].map(n => n.getAttribute('d')),
                  rate: +figure.querySelector('[data-prediction]').dataset.rate,
                  figureOverflow: figure.scrollWidth > figure.clientWidth + 1,
                  formulaOverflow: output.scrollWidth > output.clientWidth + 1,
                  sourceFont: source ? parseFloat(getComputedStyle(source).fontSize) : 0
                };
              });
              assert.equal(state.stage, stage); assert.equal(state.ready, 'true');
              assert.equal(state.controlsHidden, false); assert.equal(state.formulaHidden, false);
              assert.equal(state.state, 'source-fallback');
              assert.equal(state.error, mode === 'blocked-katex' ? 'renderer-unavailable' : 'render-failed');
              assert.equal(state.latex, model.formula(stage, original, review, referenceTime));
              assert.equal(state.source, state.latex); assert.ok(state.source.length > 20);
              assert.equal(state.renderedLatex, null); assert.equal(state.mathDOM, 0);
              assert.equal(state.statusHidden, false); assert.equal(state.role, 'status');
              assert.equal(state.describedBy, state.statusId);
              assert.match(state.statusText, state.lang.startsWith('en') ? /LaTeX source.*curves and numerical values remain available/ : /LaTeX 公式源，曲线和数值仍可使用/);
              assert.doesNotMatch(state.source, /Partial, stale/);
              assert.equal(state.figureOverflow, false); assert.equal(state.formulaOverflow, false); assert.ok(state.sourceFont >= 16);
              assert.deepEqual(state.curves, [model.curve(stage, .1, .15, original, review, referenceTime), model.curve(stage, .15, .4, original, review, referenceTime)]);
              const difficulty = Number(await f.locator('input[type="range"]').inputValue());
              assert.ok(Math.abs(state.rate - model.forecast(stage, difficulty, original, review, referenceTime)) < 1e-12);
              assert.deepEqual(await records(page), before);
              count++;
              await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
            }
          }
          // Difficulty changes remain usable even though typesetting is unavailable.
          await f.locator('button[data-evolution-stage="linear"]').click();
          await f.locator('input[type="range"]').evaluate(n => { n.value = '.1'; n.dispatchEvent(new Event('input', { bubbles: true })); });
          assert.match(await f.locator('[data-evolution-score]').innerText(), /146\.81/);
          assert.equal(await formula.getAttribute('data-math-state'), 'source-fallback');
          assert.equal(await f.locator('.evolution-math-status').isVisible(), true);
          await page.emulateMedia({ media: 'print' });
          assert.ok(await f.locator('.evolution-formula-source').isVisible());
          assert.ok(await f.locator('.evolution-math-status').isVisible());
          await page.emulateMedia({ media: 'screen' });
          // A later successful render must remove the failure indication and old source.
          if (mode === 'render-throws') await page.evaluate(() => window.__restoreEvolutionRenderer());
          else await page.addScriptTag({ path: path.join(__dirname, 'vendor/katex/katex.min.js') });
          await f.locator('button[data-evolution-stage="bounded"]').click();
          assert.equal(await formula.getAttribute('data-math-state'), 'rendered');
          assert.equal(await formula.getAttribute('data-math-error'), null);
          assert.equal(await formula.locator('.evolution-formula-source').count(), 0);
          assert.equal(await formula.locator('.katex-html').count(), 1);
          assert.equal(await formula.locator('.katex-mathml math').count(), 1);
          assert.equal(await formula.getAttribute('data-rendered-latex'), model.formula('bounded', original, review, referenceTime));
          assert.equal(await f.locator('.evolution-math-status').isVisible(), false);
          assert.equal(await f.locator('.evolution-math-status').textContent(), '');
          assert.deepEqual(await records(page), before); assert.deepEqual(errors, []);
          console.log(JSON.stringify({ mode, lang, width, theme, stageLanguageStates: count, sourceMatches: true, explicitStatus: true, numericalSemanticsUnchanged: true, sourceFontAtLeast16: true, overflow: false, print: true, recovery: true }));
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

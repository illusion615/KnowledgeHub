'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const model = require('./model-evolution.js');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const original = JSON.parse(read('model-results.json'));
const review = JSON.parse(read('robustness-review-results.json'));

test('four display stages use preserved results without fitting new models', () => {
  assert.deepEqual(model.stages, ['observations', 'baseline', 'linear', 'bounded']);
  assert.equal(model.forecast('observations', .2, original, review), null);
  assert.equal((150 * model.forecast('baseline', .2, original, review)).toFixed(2), '133.00');
  assert.equal((150 * model.forecast('linear', .2, original, review)).toFixed(2), '132.64');
  assert.equal((150 * model.forecast('bounded', .2, original, review)).toFixed(2), '132.58');
  assert.equal(model.forecast('baseline', .1, original, review), model.forecast('baseline', .4, original, review));
  assert.equal((150 * model.forecast('linear', .1, original, review)).toFixed(2), '151.19');
  assert.ok(model.forecast('linear', .1, original, review) > 1, 'do not clip invalid linear predictions');
  for (const row of review.bounded_grid.rows) {
    assert.ok(Math.abs(150 * model.forecast('bounded', row.d, original, review) - row.score_points) < 1e-9);
  }
  assert.throws(() => model.forecast('unknown', .2, original, review));
});

test('horizontal, straight and curved models have distinct rates of change and real LaTeX formulas', () => {
  const katex = require('./vendor/katex/katex.min.js');
  const values = stage => [.15, .2, .25].map(d => model.forecast(stage, d, original, review));
  const baseline = values('baseline'), linear = values('linear'), bounded = values('bounded');
  assert.equal(baseline[0], baseline[1]); assert.equal(baseline[1], baseline[2]);
  assert.ok(Math.abs(linear[2] - 2 * linear[1] + linear[0]) < 1e-12);
  assert.ok(Math.abs(bounded[2] - 2 * bounded[1] + bounded[0]) > 1e-3);
  for (const stage of model.stages.slice(1)) assert.match(katex.renderToString(model.formula(stage, original, review), { throwOnError: true, strict: 'error' }), /katex-mathml/);
});

test('curves have fixed coordinates and explicit observed/extrapolated difficulty segments', () => {
  assert.equal(model.x(.1), 90);
  assert.ok(Math.abs(model.x(.4) - 930) < 1e-9);
  assert.equal(model.y(.5), 455);
  assert.ok(Math.abs(model.y(1.05) - 130) < 1e-9);
  for (const stage of model.stages.slice(1)) {
    const pathData = model.curve(stage, .15, .4, original, review);
    assert.ok(pathData.startsWith('M230.000000 '));
    assert.equal((pathData.match(/L/g) || []).length, 50);
    assert.doesNotMatch(pathData, /NaN|Infinity/);
  }
});

test('step-three candidates share the first-20 training scope without changing full-data defaults', () => {
  const training = JSON.parse(read('model-walkthrough-results.json'));
  const c = model.trainingModels(training);
  assert.equal(c.referenceTime, 20);
  assert.deepEqual(c.original.baseline_exams, [18, 19, 20]);
  assert.deepEqual(c.original.targets.y.candidates.linear.full_refit_coefficients, training.coefficients);
  assert.equal((150 * model.forecast('baseline', .2, c.original, c.review, 20)).toFixed(2), '113.67');
  assert.equal((150 * model.forecast('linear', .2, c.original, c.review, 20)).toFixed(2), '127.72');
  assert.equal((150 * model.forecast('bounded', .2, c.original, c.review, 20)).toFixed(2), '128.00');
  const katex = require('./vendor/katex/katex.min.js');
  for (const stage of model.stages.slice(1)) assert.match(katex.renderToString(model.formula(stage, c.original, c.review, 20), { throwOnError: true, strict: 'error' }), /katex-mathml/);
  assert.ok(model.formula('baseline', c.original, c.review, 20).includes('y_{18}+y_{19}+y_{20}'));
  assert.equal((150 * model.forecast('linear', .2, original, review)).toFixed(2), '132.64');
  assert.throws(() => model.trainingModels({ ...training, candidate_comparison: null }));
});

test('interactive assets and the training JSON use matching content versions', () => {
  const crypto = require('node:crypto');
  const hash = name => crypto.createHash('sha256').update(read(name)).digest('hex').slice(0, 12);
  const html = read('index.html');
  for (const name of ['model-evolution.js', 'model-walkthrough.js', 'model-evolution.css', 'model-walkthrough.css', 'presentation-plan.js', 'process-flow.css']) assert.ok(html.includes(name + '?v=' + hash(name)), name);
  assert.ok(read('model-evolution.js').includes('model-walkthrough-results.json?v=' + hash('model-walkthrough-results.json')));
});

test('candidate template belongs to step three and preserves the ordinary article fallback', () => {
  const html = read('index.html');
  const figure = html.match(/<template id="candidate-model-template"[\s\S]*?<\/template>/)[0];
  assert.equal((figure.match(/data-evolution-stage=/g) || []).length, 3);
  assert.match(figure, /data-latex="t=20"/);
  const overview = html.match(/<section id="modeling-overview"[\s\S]*?<\/section>/)[0];
  assert.ok(overview.includes('id="model-evolution"'));
  assert.ok(overview.includes('id="candidate-model-slot"'));
  assert.doesNotMatch(overview, /模型总览[AB]|Overview [AB]/);
  assert.match(figure, /共同信息截止为第20次/);
  assert.match(figure, /均值只用其中第18—20次/);
  assert.match(figure, /其余使用第1—20次/);
  assert.equal((html.match(/id="model-evolution"/g) || []).length, 1);
  assert.match(figure, /data-model-origin="original-comparison"/);
  assert.match(figure, /data-model-origin="retrospective-revision"/);
  assert.match(html, /原比较包括近期均值、线性和二次模型/);
  assert.match(figure, /纵轴得分率0.50—1.05/);
  assert.match(figure, /min="0.10" max="0.40" step="0.01"/);
  assert.match(html, /图 5｜拟合模型给出的优势曲线/);
  assert.match(html, /<script src="model-evolution\.js\?v=[a-f0-9]+"><\/script>/);
  const source = read('model-evolution.js');
  assert.doesNotMatch(source, /innerHTML|eval\(|localStorage|apikey/);
  assert.match(source, /source_sha256 !== review.source_sha256/);
  const css = read('model-evolution.css');
  assert.match(css, /\.evolution-model-line \{ fill: none;/);
  assert.match(css, /:focus-visible/);
});

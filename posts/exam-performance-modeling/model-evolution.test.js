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

test('published figure specifies the conditional slice and preserves the ordinary article fallback', () => {
  const html = read('index.html');
  const figure = html.match(/<figure id="model-evolution"[\s\S]*?<\/figure>/)[0];
  assert.equal((figure.match(/data-evolution-stage=/g) || []).length, 4);
  assert.match(figure, /固定目标阶段 t=25/);
  assert.match(figure, /不是原模型的拟合残差/);
  assert.match(figure, /纵轴从0.50开始/);
  assert.match(figure, /<noscript>/);
  assert.match(figure, /min="0.10" max="0.40" step="0.01"/);
  assert.match(html, /图 6｜拟合模型给出的优势曲线/);
  assert.match(html, /<script src="model-evolution.js"><\/script>/);
  const source = read('model-evolution.js');
  assert.doesNotMatch(source, /innerHTML|eval\(|localStorage|apikey/);
  assert.match(source, /source_sha256 !== review.source_sha256/);
  const css = read('model-evolution.css');
  assert.match(css, /\.evolution-model-line \{ fill: none;/);
  assert.match(css, /:focus-visible/);
});

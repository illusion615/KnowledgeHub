'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const section = id => html.match(new RegExp(`<section id="${id}"[^>]*>[\\s\\S]*?<\\/section>`))[0];
const result = JSON.parse(fs.readFileSync(path.join(__dirname, 'model-results.json'), 'utf8'));

test('the reading path completes baseline, equation, estimation and evaluation before the bounded revision', () => {
  const models = section('models');
  assert.ok(models.indexOf('79.67') < models.indexOf('id="baseline-to-equation"'));
  assert.ok(models.includes('难度是0.15还是0.30'));
  assert.ok(models.includes('平均得分率＝参照水平＋阶段调整＋难度调整'));
  assert.ok(!models.includes('id="bounded-model"'));
  assert.doesNotMatch(models, /下面会把这种反馈|显式能力—反馈/);
  const iteration = section('iteration');
  assert.ok(iteration.includes('id="bounded-model"'));
  assert.ok(iteration.indexOf('id="bounded-model"') < iteration.indexOf('id="matched-review"'));
  assert.ok(html.indexOf('<section id="coefficients"') < html.indexOf('<section id="validation"'));
  assert.ok(html.indexOf('<section id="validation"') < html.indexOf('id="bounded-model"'));
});

test('examples connect scale, residuals, chronological fitting and conditional predictions', () => {
  assert.ok(section('objectives').includes('得分率是分数除以该次满分'));
  assert.ok(section('variables').includes('80÷100=0.80'));
  assert.ok(section('variables').includes('130÷150≈0.867'));
  const coefficients = section('coefficients');
  assert.ok(coefficients.includes('如果 C=79，两次误差是1和−1'));
  assert.ok(coefficients.includes('预测第17次只能用前16次'));
  assert.ok(coefficients.includes('不是未来准确性的证明'));
  const validation = section('validation');
  assert.ok(validation.includes('本文的原计算采用以下方案'));
  assert.ok(validation.includes('131.89'));
  assert.ok(validation.includes('不能看完这四次结果后反选模型'));
  assert.ok(section('results').includes('为计算第25次的情景'));
});

test('coefficient interpretation preserves numerical precision and avoids causal or probability guarantees', () => {
  const b = result.targets.y.candidates.linear.full_refit_coefficients;
  assert.equal((150 * b.time).toFixed(2), '0.48');
  assert.equal((-150 * b.difficulty * .01).toFixed(2), '1.86');
  assert.equal((150 * (b.intercept + 25 * b.time + .2 * b.difficulty)).toFixed(2), '132.64');
  assert.ok(section('results').includes('不是已经证明能力进步或难度的因果作用'));
  assert.ok(section('results').includes('代入使用未舍入系数'));
  assert.doesNotMatch(html, /黄金系数|验证了小金在进步|大概率能考/);
});

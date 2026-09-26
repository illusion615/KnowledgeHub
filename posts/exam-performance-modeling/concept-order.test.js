'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const plan = require('./presentation-plan.js');

test('bounded construction defines terms before using g and the mean equations', () => {
  const start = html.indexOf('<article id="bounded-model"');
  const end = html.indexOf('<article id="bounded-estimation-extension"', start);
  const main = html.slice(start, end);
  const ids = ['bounded-function-definition', 'bounded-function-formula', 'bounded-function-range', 'bounded-mean-definition', 'bounded-model-formula'];
  let previous = -1;
  for (const id of ids) {
    const at = main.indexOf(`id="${id}"`);
    assert.ok(at > previous, id); previous = at;
  }
  assert.ok(main.includes('不是本题模型已经预测出 75 分'));
  assert.ok(main.includes('这个输入加权和叫线性预测子'));
  assert.doesNotMatch(main, /第三章介绍的有界函数/);
  const equation = main.slice(main.indexOf('id="bounded-model-formula"'));
  assert.ok(equation.includes('不是') || equation.includes('不能由此计算获胜概率'));
});

test('technical estimation and transformation terms are explained where needed', () => {
  const estimation = html.slice(html.indexOf('id="bounded-estimation-extension-content"'), html.indexOf('id="matched-review"'));
  assert.ok(estimation.indexOf('称为损失') < estimation.indexOf('data-latex="J='));
  assert.ok(estimation.includes('数值迭代指反复更新系数'));
  assert.ok(estimation.includes('收敛检查则判断'));
  const proof = html.slice(html.indexOf('id="coefficient-derivation-extension-content"'));
  assert.ok(proof.indexOf('先说明中心化的含义') < proof.indexOf('data-latex='));
  const models = html.slice(html.indexOf('<section id="models"'), html.indexOf('<section id="coefficients"'));
  assert.ok(models.indexOf('称为训练集') < models.indexOf('data-latex="\\widehat{y}'));
  const iteration = html.slice(html.indexOf('<section id="iteration"'), html.indexOf('<section id="scenarios"'));
  assert.ok(iteration.indexOf('称为外推') < iteration.indexOf('低难度外推'));
});

test('presentation definitions precede formula rendering without adding an optional prerequisite', () => {
  const bounded = plan.find(item => item.id === 'bounded-revision');
  assert.ok(bounded.columns[0].intro[0].includes('有界指'));
  assert.ok(bounded.columns[0].math[0].startsWith('g(z)='));
  assert.ok(bounded.columns[1].intro[0].includes('μ表示'));
  assert.ok(bounded.columns[1].math[0].includes('\\mu_y='));
  const fitting = plan.find(item => item.id === 'bounded-estimation');
  assert.ok(fitting.columns[0].intro[0].includes('损失J'));
  const source = fs.readFileSync(path.join(__dirname, 'presentation.js'), 'utf8');
  assert.ok(source.indexOf('if (spec.intro)') < source.indexOf('(spec.math || [])'));
  assert.equal(1 / (1 + Math.exp(0)), .5);
  assert.equal(150 / (1 + Math.exp(0)), 75);
});

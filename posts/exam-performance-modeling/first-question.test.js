'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'model-results.json'), 'utf8'));
const start = html.indexOf('<article id="first-question-answer"');
const end = html.indexOf('<h3 data-zh="第二问：', start);
const first = html.slice(start, end);
const main = first.slice(0, first.indexOf('<div class="extension-card-slot"'));

test('main first-question answer uses the previously fitted time–difficulty equation', () => {
  assert.ok(start > 0 && end > start);
  assert.ok(main.includes('id="first-question-components"'));
  assert.ok(main.includes('132.64'));
  assert.ok(main.includes('t*=25') && main.includes('d*=0.20'));
  assert.ok(main.includes('真实能力和心理状态'));
  assert.doesNotMatch(main, /代理|反馈|K₂₅|F₂₅|B₂₅|α|γ|λ|136\.82|约为 137/);
  const beta = results.targets.y.candidates.linear.full_refit_coefficients;
  const estimate = 150 * (beta.intercept + 25 * beta.time + .2 * beta.difficulty);
  assert.equal(estimate.toFixed(2), '132.64');
  assert.equal(Math.round(estimate), 133);
});

test('methods for ability and mindset are optional and occur after the main answer', () => {
  const card = first.indexOf('id="ability-mindset-methods-extension"');
  const detail = first.indexOf('id="ability-mindset-methods-extension-content"');
  assert.ok(card > first.indexOf('第一问的条件答案'));
  assert.ok(detail > card);
  const body = first.slice(detail);
  assert.ok(body.includes('方法一：补充独立测量'));
  assert.ok(body.includes('方法二：只有历史记录'));
  assert.ok(body.includes('href="#ability-mindset"'));
  assert.ok(body.includes('预测前可得，估计与检验分开'));
});

test('proxy scenario numbers stay in the end-of-article extension rather than the results mainline', () => {
  const resultSection = html.match(/<section id="results"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(resultSection, /id="ability-mindset-components"|136\.82|约为 137/);
  const extension = html.slice(html.indexOf('id="proxy-model-extension-content"'), html.indexOf('<article id="learning-check"'));
  assert.ok(extension.includes('id="proxy-forecast-components"'));
  assert.ok(extension.includes('id="ability-mindset-components"'));
  assert.ok(extension.includes('136.82'));
  assert.ok(extension.includes('这不是第一问的主线答案'));
});

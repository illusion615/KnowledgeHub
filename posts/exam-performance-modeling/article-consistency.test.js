'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const original = require('./model-results.json');
const review = require('./robustness-review-results.json');
const model = require('./model-evolution.js');
const plan = require('./presentation-plan.js');
const section = id => html.match(new RegExp('<section id="' + id + '"[\\s\\S]*?<\\/section>'))[0];

test('public prose states results without repeated winner disclaimers', () => {
  const visibleSources = [html, ...['model-evolution.js', 'model-walkthrough.js', 'presentation-plan.js'].map(name => fs.readFileSync(path.join(__dirname, name), 'utf8'))].join('\n');
  assert.doesNotMatch(visibleSources, /赢家|胜出|已经选定的最终答案|selected final answer|selection winner|new winner|the original winner/);
});

test('original model selection and later bounded revision remain distinct in both narratives', () => {
  for (const target of ['y', 'r']) {
    const result = original.targets[target];
    assert.deepEqual(Object.keys(result.candidates), ['mean3', 'linear', 'quadratic']);
    const ranked = Object.entries(result.candidates).sort((a, b) => a[1].selection.mae_points_150 - b[1].selection.mae_points_150);
    assert.equal(ranked[0][0], result.selected); assert.equal(result.selected, 'linear');
  }
  assert.match(section('modeling-overview'), /原比较包括近期均值、线性和二次模型/);
  assert.match(section('modeling-overview'), /data-evolution-stage="bounded" data-model-origin="retrospective-revision"/);
  assert.match(section('models'), /id="model-development-logic"/);
  assert.match(section('models'), /三个参数由同一训练集联合估计/);
  assert.match(section('models'), /二次方案仍然对待估系数线性/);
  assert.match(section('models'), /id="whole-rule-comparison"/);
  assert.match(section('models'), /误差差异不能单独归因于/);
  assert.ok(JSON.stringify(plan.find(s => s.id === 'selection')).includes('Add squared difficulty'));
  assert.ok(review.score_checks.bounded.mae_17_24 > review.score_checks.linear.mae_17_24);
});

test('bounded mean is not a binary probability model or a logistic transform of the fitted OLS rate', () => {
  const iteration = section('iteration');
  assert.match(iteration, /id="bounded-model-method"/);
  assert.match(iteration, /响应为0—1之间的得分率/);
  assert.match(iteration, /logistic映射给出条件均值/);
  assert.match(iteration, /参数按准似然估计/);
  assert.match(iteration, /在函数形式固定后/);
  const linear = model.forecast('linear', .2, original, review);
  const bounded = model.forecast('bounded', .2, original, review);
  assert.ok(Math.abs(bounded - 1 / (1 + Math.exp(-linear))) > .1);
  assert.equal((150 * linear).toFixed(2), '132.64');
  assert.equal((150 * bounded).toFixed(2), '132.58');
  assert.match(JSON.stringify(plan.find(s => s.id === 'bounded-revision')), /not binary pass probabilities/);
});

test('historical reconstruction is not advertised as preregistration or genuinely unseen author data', () => {
  assert.match(section('validation'), /id="historical-evaluation-scope"/);
  assert.match(section('validation'), /基于已知24条历史记录按信息截止点回算/);
  assert.doesNotMatch(html, /协议在看最终留出结果前固定|The protocol is fixed before final holdout inspection|genuine out-of-sample errors|此前的检查误差仍来自当时没看过/);
  assert.match(section('references'), /研究设计为历史回算/);
  assert.match(section('results'), /检验误差仍按原训练截止点报告/);
});

test('method cards keep proxies optional and references do not reuse the photograph number for GAIMME', () => {
  const cards = html.match(/<figure class="modeling-process"[\s\S]*?<\/figure>/)[0];
  assert.doesNotMatch(cards, /本题例|心态|得分率/);
  assert.match(section('checklist'), /选读拓展｜能力与心态代理模型/);
  assert.match(section('models'), /data-latex="y_t=a\+bt\+cd_t\+\\varepsilon_t"/);
  assert.match(html, /<p>\[8\] Garfunkel/);
  const refs = section('references');
  assert.match(refs, /id="ref-1"[\s\S]*?用户提供的题目照片/);
  assert.match(refs, /id="ref-8"[\s\S]*?GAIMME/);
  assert.equal((refs.match(/class="bib-id"/g) || []).length, 8);
});

test('proxy identifiability statement checks actual input columns and keeps causal claims separate', () => {
  const extension = section('checklist');
  assert.match(extension, /id="proxy-identifiability-scope"/);
  assert.match(extension, /本文能力代理本身也依赖难度系数/);
  assert.match(extension, /统计参数可估性与心理因果识别分别评价/);
  assert.doesNotMatch(extension, /相加后只剩 \(γ\+μ\)|would combine with the difficulty term into/);
  assert.ok(extension.includes('\\gamma(d_t-\\bar d_t)+\\kappa(d_t-\\bar d_t)'));
  assert.ok(extension.includes('F_{25}=\\frac{3}{25}-\\frac{1}{15}=\\frac{4}{75}'));
  assert.ok(JSON.stringify(plan.find(s => s.id === 'notation-observations')).includes('S̄ₜ'));
  assert.ok(section('variables').includes('m_t=\\frac{\\overline S_t}{M_t}'));
  assert.doesNotMatch(section('variables'), /A_t|Aₜ/);
});

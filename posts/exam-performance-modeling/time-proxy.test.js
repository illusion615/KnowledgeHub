'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const result = require('./time-proxy-results.json');
const section = id => html.match(new RegExp(`<section id="${id}"[^>]*>[\\s\\S]*?</section>`))[0];

test('stage is defined before modeling; rationale precedes the equation construction', () => {
  assert.match(section('variables'), /id="stage-proxy-variable"/);
  assert.match(section('variables'), /考试阶段序号（时间代理）/);
  assert.match(section('variables'), /高一1—8；高二9—16；高三17—24/);
  const models = section('models');
  assert.ok(models.indexOf('id="stage-proxy-rationale"') < models.indexOf('id="baseline-to-equation"'));
  assert.match(models, /同样难度的高一与高三考试会得到相同的预测/);
  assert.match(models, /一周或三个月/);
  assert.match(models, /相应调整模型截距/);
  assert.match(models, /不是规定多考一次就能提高成绩/);
  assert.match(models, /href="#time-proxy-check"/);
  assert.match(section('modeling-overview'), /href="#stage-proxy-rationale"/);
});

test('additional refitted ablation is distinct from original model selection', () => {
  const validation = section('validation');
  assert.ok(validation.indexOf('id="time-proxy-check"') > validation.indexOf('id="holdout-results"'));
  assert.match(validation, /两者均在同一批训练记录上/);
  assert.match(validation, /估计各自全部系数/);
  assert.match(validation, /新增一项回顾性分析/);
  assert.match(validation, /不属于原先三种候选/);
  assert.match(validation, /没有在此检验系数的统计显著性/);
  for (const [protocol, models] of Object.entries(result.protocols)) {
    const row = validation.match(new RegExp(`<tr data-time-protocol="${protocol}">([\\s\\S]*?)</tr>`))[1];
    assert.deepEqual([...row.matchAll(/<td>([\d.]+)<\/td>/g)].map(m => m[1]),
      ['difficulty_only', 'stage_and_difficulty'].map(k => models[k].mae_points.toFixed(2)));
  }
});

test('new formulas have explicit LaTeX; independent evidence links resolve', () => {
  const rationale = html.match(/<article id="stage-proxy-rationale"[\s\S]*?<\/article>/)[0];
  const check = html.match(/<article id="time-proxy-check"[\s\S]*?<\/article>/)[0];
  assert.match(rationale, /data-latex="\\widehat y=\\alpha\+\\gamma d"/);
  assert.match(check, /data-latex="\\widehat y=a\+bt\+cd"/);
  for (const file of ['time-proxy-calculation.py', 'time-proxy-results.json']) {
    assert.ok(check.includes(`href="${file}"`));
    assert.ok(fs.existsSync(path.join(__dirname, file)));
  }
  for (const [name, hash] of Object.entries(result.original_result_sha256)) {
    assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname, name))).digest('hex'), hash);
  }
});

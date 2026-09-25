'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const models = html.match(/<section id="models"[^>]*>[\s\S]*?<\/section>/)[0];

test('baseline-to-equation explanation distinguishes new assumptions from algebra', () => {
  const steps = ['① 水平参照', '② 阶段调整', '③ 难度调整', '④ 整理方程'];
  let previous = -1;
  for (const step of steps) {
    const at = models.indexOf(step);
    assert.ok(at > previous, step);
    previous = at;
  }
  assert.ok(models.includes('不是把均值公式化简成另一个公式'));
  assert.ok(models.includes('滚动均值会随新成绩更新'));
  assert.ok(models.includes('以下只做代数整理'));
  assert.ok(models.includes('本文没有新增它们的单独拟合结果'));
  assert.ok(models.includes('参数由整组训练记录共同估计'));
  assert.ok(models.includes('不是真实备考时长，也不等于数学能力'));
  assert.ok(models.includes('href="#coefficients"') && models.includes('href="#validation"'));
});

test('expansion and regrouping precede the new definition and shortened equation', () => {
  const formulas = [...models.matchAll(/data-latex="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
  const stages = [
    '\\begin{aligned}&A+b(t-t_0)+c(d-d_0)\\\\&=A+bt-bt_0+cd-cd_0.\\end{aligned}',
    '\\begin{aligned}&A+bt-bt_0+cd-cd_0\\\\&=(A-bt_0-cd_0)+bt+cd.\\end{aligned}',
    'a:=A-bt_0-cd_0',
    'f(t,d)\\approx a+bt+cd'
  ];
  let previous = -1;
  for (const stage of stages) {
    const at = formulas.indexOf(stage);
    assert.ok(at > previous, stage);
    previous = at;
  }
  assert.ok(models.includes('移动的是带着正负号的整项'));
  assert.ok(models.includes('目前还不知道参数值'));
  assert.ok(models.includes('a 是这里新定义的简写'));
  assert.ok(models.includes('没有增加第四个自由参数'));
  assert.doesNotMatch(models, /熟悉的|the familiar/);
});

test('reference-level, stage and difficulty adjustments collect to the same equation', () => {
  assert.ok(models.includes('data-latex="f_0(t,d)=A"'));
  assert.ok(models.includes('data-latex="f_1(t,d)=A+b(t-t_0)"'));
  for (const A of [0.6, 0.8]) for (const b of [-0.01, 0.02]) for (const c of [-1.2, 0.4]) {
    for (const t of [4, 17, 25]) for (const d of [0.15, 0.2, 0.3]) {
      const t0 = 12, d0 = 0.2;
      const a = A - b * t0 - c * d0;
      assert.ok(Math.abs(A + b * (t - t0) + c * (d - d0) - (a + b * t + c * d)) < 1e-12);
      assert.ok(Math.abs((a + b * t + c * (d + 0.01)) - (a + b * t + c * d) - 0.01 * c) < 1e-12);
    }
  }
});

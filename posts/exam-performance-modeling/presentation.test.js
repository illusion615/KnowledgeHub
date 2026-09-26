'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const slides = require('./presentation-plan.js');
const katex = require('./vendor/katex/katex.min.js');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const original = JSON.parse(read('model-results.json'));
const review = JSON.parse(read('robustness-review-results.json'));
const slide = id => slides.find(item => item.id === id);

test('defense narrative is finite, bilingual, and separate from optional reading content', () => {
  assert.equal(slides.length, 26);
  assert.equal(new Set(slides.map(item => item.id)).size, 26);
  slides.forEach(item => {
    const keys = item.layout === 'problem' ? ['label', 'title'] : item.layout === 'outline' ? ['label', 'title', 'lead', 'source'] : ['label', 'title', 'lead', 'takeaway', 'source'];
    for (const key of keys) {
      assert.equal(item[key].length, 2, `${item.id}/${key}`);
      assert.ok(item[key].every(text => typeof text === 'string' && text.trim()));
    }
    if (item.layout === 'problem') {
      assert.equal(item.sourceSection, 'problem');
      assert.deepEqual(item.sourceTables, ['source-year-1', 'source-year-2', 'source-year-3']);
    } else if (item.layout === 'outline') {
      assert.equal(item.chapters.length, 4);
    } else {
      assert.equal(item.columns.length, 2);
      item.columns.forEach(column => (column.list || []).forEach(text => assert.equal(text.split('|').length, 2)));
    }
  });
  assert.doesNotMatch(JSON.stringify(slides), /proxy-model|Fₜ|Kₜ|136\.82|136\.816|accordion|参考答案|进阶证明/);
  const source = read('presentation.js');
  assert.match(source, /data-assistant-exclude/);
  assert.match(source, /data-present-exclude/);
  assert.match(source, /data-step-title-en/);
  assert.match(source, /data-step-label-en/);
  assert.doesNotMatch(source, /innerHTML|fetch\(/);
});

test('defense wording uses formal topics and findings rather than rhetorical prompts', () => {
  const prose = JSON.stringify(slides);
  assert.doesNotMatch(prose, /必须击败|凭什么可信|缺口在哪里|先说清|最漂亮|偷偷|赢家|每段都赢|守住的边界|已经预测准了|怎样解释这个答案/);
  for (const item of slides) {
    assert.doesNotMatch(item.title.join(' '), /[？?]/);
    for (const column of item.columns || []) assert.doesNotMatch(column.heading.join(' '), /[？?]/);
  }
  assert.equal(slides[0].id, 'problem-statement');
  assert.equal(slides[0].title[0], '1.1 成绩');
  assert.equal(slide('defense-summary').title[0], '4.1 主要结论与研究局限');
});

test('the deck follows four chapters with explicit subsections rather than one slide per chapter', () => {
  assert.equal(slides[1].id, 'outline');
  const chapters = slides.filter(item => item.chapter).map(item => item.chapter);
  assert.deepEqual([...new Set(chapters)], [1, 2, 3, 4]);
  assert.deepEqual(chapters, [...chapters].sort((a, b) => a - b));
  assert.deepEqual(slides[1].chapters.map(item => item.title[0]), ['问题重述', '数学符号说明', '问题求解及分析', '结论与展望']);
  assert.equal(slides.filter(item => item.chapter === 2).length, 2);
  assert.ok(slides.filter(item => item.chapter === 3).length > 10);
  assert.equal(slides.filter(item => item.chapter === 4).length, 2);
  assert.deepEqual([...new Set(slides.filter(item => item.chapter === 3).map(item => item.subsection.split('.').slice(0, 2).join('.')))],
    ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8']);
  for (const item of slides.filter(item => item.chapter)) {
    assert.ok(item.title.every(title => title.startsWith(item.subsection + ' ')));
    assert.ok(item.label[0].includes(['', '问题重述', '数学符号说明', '问题求解及分析', '结论与展望'][item.chapter]));
  }
});

test('every display formula keeps raw LaTeX and renders with strict KaTeX', () => {
  let count = 0;
  slides.forEach(item => (item.columns || []).forEach(column => (column.math || []).forEach(latex => {
    assert.doesNotMatch(latex, /[\u0000-\u001f]/, `${item.id}: JavaScript escape corruption`);
    const rendered = katex.renderToString(latex, { displayMode: true, throwOnError: true, strict: 'error', trust: false });
    assert.ok(rendered.includes('katex-mathml'));
    count++;
  })));
  assert.equal(count, 38);
  const algebra = slide('algebra').columns[0].math.join('\n');
  assert.ok(algebra.includes('A+bt-bt_0+cd-cd_0'));
  assert.ok(algebra.includes('a:=A-bt_0-cd_0'));
});

test('coefficient-solving slide uses the stored centered training sums', () => {
  const sums = original.targets.y.full_refit_centered_sums;
  const beta = original.targets.y.candidates.linear.full_refit_coefficients;
  const text = JSON.stringify(slide('solve-coefficients'));
  for (const value of [String(sums.P), String(sums.Q), String(sums.U), sums.R.toFixed(7), sums.V.toFixed(7),
    beta.intercept.toFixed(6), beta.time.toFixed(6), beta.difficulty.toFixed(6)]) assert.ok(text.includes(value), value);
  assert.ok(Math.abs(sums.P * beta.time + sums.Q * beta.difficulty - sums.U) < 1e-9);
  assert.ok(Math.abs(sums.Q * beta.time + sums.R * beta.difficulty - sums.V) < 1e-9);
});

test('professor-review gaps are addressed without implying full identification or a new winner', () => {
  const ids = slides.map(item => item.id);
  assert.ok(ids.indexOf('protocol') < ids.indexOf('solve-coefficients'));
  assert.ok(ids.indexOf('evaluation') < ids.indexOf('solve-coefficients'));
  assert.ok(ids.indexOf('exploration') < ids.indexOf('selection'));
  assert.ok(ids.indexOf('bounded-estimation') < ids.indexOf('matched-evaluation'));
  assert.ok(!ids.includes('least-squares'));
  assert.ok(JSON.stringify(slide('scope')).includes('两目标不等价'));
  assert.ok(JSON.stringify(slide('defense-summary')).includes('第一问未完全识别'));
  for (const [i, key] of ['linear', 'bounded'].entries()) {
    const values = slide('error-profile').columns[0].chart[key];
    assert.deepEqual(values, review.score_checks[key].observations.map(row => Number(Math.abs(row.error_points).toFixed(4))));
  }
  const estimate = slide('bounded-estimation');
  for (const b of review.full_fit.y.beta) assert.ok(JSON.stringify(estimate).includes(b.toFixed(6)));
  assert.ok(estimate.columns[0].math[0].includes(String.raw`q_t\log\mu_t`));
});

test('reported old errors remain separated by selection and batch evaluation', () => {
  for (const [column, key] of [[0, 'selection'], [1, 'final_test']]) {
    const values = slide('evaluation').columns[column].table.rows.map(row => row[1]);
    assert.deepEqual(values, ['mean3', 'linear', 'quadratic'].map(kind => original.targets.y.candidates[kind][key].mae_points_150.toFixed(2)));
  }
  assert.ok(slide('protocol').columns[0].list[2].includes('一次预测四场'));
});

test('new comparisons, scenario answers and grid sensitivity match preserved results', () => {
  const rows = slide('matched-evaluation').columns[0].table.rows;
  ['mean3', 'linear', 'quadratic', 'bounded'].forEach((kind, i) => {
    assert.equal(rows[i][1], review.score_checks[kind].mae_17_24.toFixed(2));
    assert.equal(rows[i][2], review.margin_checks[kind === 'bounded' ? 'bounded_pair' : kind].mae_17_24.toFixed(2));
  });
  assert.ok(JSON.stringify(slide('score-answer')).includes(original.targets.y.candidates.linear.forecast_points_150.toFixed(2)));
  assert.ok(JSON.stringify(slide('margin-answer')).includes(original.difficulty_comparison.grid[0].expected_margin_points.toFixed(2)));
  assert.deepEqual(slide('stability').columns[1].table.rows,
    review.stability.bounded.window_checks.map(row => [String(row.last_n), row.forecast_points.toFixed(2), row.best_grid_d.toFixed(2)]));
  assert.ok(slide('stability').takeaway[0].includes('不是连续精确最优'));
  assert.ok(slide('matched-evaluation').lead[0].includes('回顾性'));
});

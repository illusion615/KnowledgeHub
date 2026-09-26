/* Data-driven model evolution, using the original records and preserved fit results.
 * No fitting, model calls or generated observations occur in the browser. */
(function (root) {
  'use strict';
  var STAGES = ['observations', 'baseline', 'linear', 'bounded'];
  function forecast(stage, difficulty, original, review) {
    if (stage === 'observations') return null;
    if (stage === 'baseline') return original.targets.y.candidates.mean3.full_refit_coefficients.mean;
    if (stage === 'linear') {
      var b = original.targets.y.candidates.linear.full_refit_coefficients;
      return b.intercept + 25 * b.time + b.difficulty * difficulty;
    }
    if (stage === 'bounded') {
      var beta = review.full_fit.y.beta;
      var z = beta[0] + beta[1] * (25 - 16) / 8 + beta[2] * (difficulty - .2) / .1;
      return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
    }
    throw new Error('Unknown evolution stage');
  }
  var X = function (d) { return 90 + (d - .1) / .3 * 840; };
  var Y = function (rate) { return 455 - (rate - .5) / .55 * 325; };
  function curve(stage, from, to, original, review) {
    return Array.from({ length: 51 }, function (_, i) {
      var d = from + (to - from) * i / 50;
      return (i ? 'L' : 'M') + X(d).toFixed(6) + ' ' + Y(forecast(stage, d, original, review)).toFixed(6);
    }).join('');
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { forecast: forecast, curve: curve, x: X, y: Y, stages: STAGES };
    return;
  }
  function init() {
    var figure = document.getElementById('model-evolution');
    if (!figure) return;
    var svg = figure.querySelector('svg');
    var buttons = Array.from(figure.querySelectorAll('[data-evolution-stage]'));
    var input = figure.querySelector('input[type="range"]');
    var controls = figure.querySelector('.evolution-controls');
    var status = figure.querySelector('.evolution-status');
    var description = figure.querySelector('.evolution-description');
    var rateOutput = figure.querySelector('[data-evolution-rate]');
    var scoreOutput = figure.querySelector('[data-evolution-score]');
    var difficultyOutput = figure.querySelector('[data-evolution-difficulty]');
    var warning = figure.querySelector('.evolution-warning');
    var stage = 'observations', original = null, review = null;
    var records = [];
    function english() { return document.documentElement.lang.indexOf('en') === 0; }
    function text(pair) { return pair[english() ? 1 : 0]; }
    function el(tag, attributes, label) {
      var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
      if (label) {
        node.setAttribute('data-zh', label[0]); node.setAttribute('data-en', label[1]);
        node.textContent = text(label);
      }
      return node;
    }
    var grid = el('g'), lines = el('g'), points = el('g'), target = el('g');
    // Keep data behind axes/marks; no area under a model curve implies uncertainty.
    grid.appendChild(el('rect', { x: 90, y: 130, width: 140, height: 325, class: 'evolution-extrapolation' }));
    grid.appendChild(el('rect', { x: 90, y: 130, width: 840, height: Y(1) - 130, class: 'evolution-overmaximum' }));
    [.5, .6, .7, .8, .9, 1, 1.05].forEach(function (v) {
      grid.appendChild(el('line', { x1: 90, x2: 930, y1: Y(v), y2: Y(v), class: v === 1 ? 'evolution-limit' : 'chart-grid' }));
      grid.appendChild(el('text', { x: 76, y: Y(v) + 5, 'text-anchor': 'end' }, [v.toFixed(2), v.toFixed(2)]));
    });
    [.1, .15, .2, .25, .3, .35, .4].forEach(function (v) {
      grid.appendChild(el('text', { x: X(v), y: 485, 'text-anchor': 'middle' }, [v.toFixed(2), v.toFixed(2)]));
    });
    grid.appendChild(el('path', { d: 'M90 130V455H930', class: 'chart-axis' }));
    grid.appendChild(el('line', { x1: X(.15), x2: X(.15), y1: 130, y2: 455, class: 'evolution-support-edge' }));
    grid.appendChild(el('text', { x: 90, y: 110 }, ['个人得分率 y', 'Student Score Rate y']));
    grid.appendChild(el('text', { x: 930, y: 110, 'text-anchor': 'end' }, ['水平虚线：满分 y=1', 'Horizontal Dashes: Full Marks y=1']));
    grid.appendChild(el('text', { x: 930, y: 528, 'text-anchor': 'end' }, ['难度 d（难题分值占比）', 'Difficulty d (Hard-Question Share)']));
    function mark(x, y, year, attrs) {
      var node;
      var common = { class: 'evolution-observation evolution-year-' + year };
      Object.assign(common, attrs || {});
      if (year === 1) node = el('circle', Object.assign(common, { cx: x, cy: y, r: 5 }));
      else if (year === 2) node = el('rect', Object.assign(common, { x: x - 5, y: y - 5, width: 10, height: 10 }));
      else node = el('path', Object.assign(common, { d: 'M' + x + ' ' + (y - 6) + 'l6 11h-12z' }));
      return node;
    }
    [1, 2, 3].forEach(function (year, i) {
      grid.appendChild(mark(100 + i * 150, 26, year));
      grid.appendChild(el('text', { x: 117 + i * 150, y: 32 }, [['高一', 'Year 1'], ['高二', 'Year 2'], ['高三', 'Year 3']][i]));
      var rows = document.querySelectorAll('#source-year-' + year + ' tbody tr');
      for (var j = 0; j < 8; j++) {
        var score = Number(rows[0].querySelectorAll('td')[j].textContent);
        var d = Number(rows[1].querySelectorAll('td')[j].textContent);
        var rate = score / (year === 3 ? 150 : 100);
        var t = i * 8 + j + 1;
        var point = mark(X(d), Y(rate), year, { 'data-exam': t, 'data-difficulty': d, 'data-rate': rate, tabindex: '0', role: 'img' });
        var labels = ['第' + t + '次：难度' + d.toFixed(2) + '，得分率' + rate.toFixed(4),
          'Exam ' + t + ': difficulty ' + d.toFixed(2) + ', score rate ' + rate.toFixed(4)];
        point.appendChild(el('title', {}, labels));
        records.push({ point: point, labels: labels });
        points.appendChild(point);
      }
    });
    var legendLine = el('line', { x1: 555, x2: 597, y1: 26, y2: 26, class: 'evolution-model-line' });
    var legendLabel = el('text', { x: 610, y: 32 });
    grid.appendChild(legendLine); grid.appendChild(legendLabel);
    grid.appendChild(el('rect', { x: 90, y: 63, width: 22, height: 16, class: 'evolution-extrapolation' }));
    grid.appendChild(el('text', { x: 125, y: 77 }, ['底色：低于历史难度范围', 'Shading: Below Observed Difficulty']));
    var targetLabel = el('text', { x: 560, y: 77 });
    grid.appendChild(targetLabel);
    var outside = el('path', { class: 'evolution-model-line evolution-dashed', 'data-curve': 'extrapolation' });
    var supported = el('path', { class: 'evolution-model-line', 'data-curve': 'observed-difficulty-range' });
    lines.appendChild(outside); lines.appendChild(supported);
    var guide = el('line', { class: 'evolution-target-guide', y2: 455 });
    var diamond = el('path', { class: 'evolution-target', 'data-prediction': 'true' });
    target.appendChild(guide); target.appendChild(diamond);
    svg.appendChild(grid); svg.appendChild(lines); svg.appendChild(points); svg.appendChild(target);
    var stageText = {
      observations: ['先观察24次真实记录：横轴是难度，纵轴是分数除以满分后的得分率。此时没有模型曲线。相同难度下仍有不同成绩，说明难度不能解释全部差异。', 'Start with the 24 observed exams: difficulty horizontally and score divided by maximum vertically. No model curve is drawn yet. Different scores at the same difficulty show that difficulty alone is insufficient.'],
      baseline: ['先用最近三次得分率的均值作基线，得到133分。曲线是水平线：拖动目标难度，预测不变，因为这条规则没有使用难度输入。', 'The last three score rates give a baseline of 133 points. Its horizontal line does not change the prediction when you move difficulty, because difficulty is not an input to this rule.'],
      linear: ['加入考试阶段与难度，使用已由24条记录拟合的方程；固定t=25后，得到图中的直线。拖动难度可见预测随之变化；在d=0.10处会超过满分，暴露边界问题。', 'Add exam stage and difficulty using the equation already fitted on all 24 records. Fixing t=25 gives this line. Moving difficulty changes the forecast; at d=0.10 it exceeds full marks, exposing a missing bound.'],
      bounded: ['把阶段—难度的加权和送入有界函数，曲线不再超过满分。但合理的范围不等于更好的预测：同协议一步回顾性MAE为4.71分，线性模型为4.02分。', 'Pass the stage–difficulty weighted sum through the bounded function so the curve stays within full marks. Valid bounds do not guarantee better forecasts: matched one-step retrospective MAE is 4.71 points versus 4.02 for the line.']
    };
    function render() {
      var d = Number(input.value);
      var hasModel = stage !== 'observations' && original && review;
      figure.dataset.evolutionStage = stage;
      buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.evolutionStage === stage)); });
      input.disabled = !hasModel;
      difficultyOutput.textContent = d.toFixed(2);
      description.textContent = text(stageText[stage]);
      records.forEach(function (r) { r.point.setAttribute('aria-label', text(r.labels)); });
      lines.style.display = target.style.display = legendLine.style.display = hasModel ? '' : 'none';
      legendLabel.textContent = hasModel ? text(stage === 'baseline' ? ['近期均值基线', 'Recent-Mean Baseline'] : stage === 'linear' ? ['回归线（固定 t=25）', 'Regression Line (t=25)'] : ['有界曲线（固定 t=25）', 'Bounded Curve (t=25)']) : '';
      if (!hasModel) {
        targetLabel.textContent = '';
        rateOutput.textContent = scoreOutput.textContent = '—';
        warning.textContent = text(['选择后续步骤查看模型预测；历史散点始终保留。', 'Select a later stage to see predictions; the observed points remain unchanged.']);
        return;
      }
      var estimate = forecast(stage, d, original, review);
      outside.setAttribute('d', curve(stage, .1, .15, original, review));
      supported.setAttribute('d', curve(stage, .15, .4, original, review));
      guide.setAttribute('x1', X(d)); guide.setAttribute('x2', X(d)); guide.setAttribute('y1', Y(estimate));
      diamond.setAttribute('d', 'M' + X(d) + ' ' + (Y(estimate) - 9) + 'l9 9-9 9-9-9z');
      diamond.setAttribute('data-difficulty', d); diamond.setAttribute('data-rate', estimate);
      targetLabel.textContent = text(['菱形：d=' + d.toFixed(2) + '，预测率=' + estimate.toFixed(4), 'Diamond: d=' + d.toFixed(2) + ', rate=' + estimate.toFixed(4)]);
      rateOutput.textContent = estimate.toFixed(4);
      scoreOutput.textContent = (150 * estimate).toFixed(2) + text([' 分', ' points']);
      input.setAttribute('aria-valuetext', text(['目标难度' + d.toFixed(2), 'Target difficulty ' + d.toFixed(2)]));
      warning.textContent = text(estimate > 1 || estimate < 0
        ? ['该预测超出0—150分范围，是模型的可行性问题，未作截断。', 'This prediction is outside 0–150 points: a feasibility failure, shown without clipping.']
        : d < .15 ? ['该难度低于历史最小值0.15，仍是外推；分数合法不代表证据充分。', 'Difficulty is below the observed minimum of 0.15: this is extrapolation even when the score is feasible.']
        : ['难度落在历史范围内，但t=25仍是未来情景；图中数值不是确定成绩或概率区间。', 'Difficulty is within its observed range, but t=25 remains a future scenario; the value is neither a guaranteed score nor a probability interval.']);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () { stage = button.dataset.evolutionStage; render(); });
    });
    input.addEventListener('input', render);
    document.addEventListener('langChanged', render);
    render();
    Promise.all(['model-results.json', 'robustness-review-results.json'].map(function (name) {
      return fetch(new URL(name, document.baseURI)).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      });
    })).then(function (data) {
      original = data[0]; review = data[1];
      if (original.source_sha256 !== review.source_sha256 || !original.source_sha256) throw new Error('Source mismatch');
      STAGES.slice(1).forEach(function (kind) {
        if (!Number.isFinite(forecast(kind, .2, original, review))) throw new Error('Invalid model values');
      });
      if (Math.abs(forecast('linear', .2, original, review) * 150 - original.targets.y.candidates.linear.forecast_points_150) > 1e-6) throw new Error('Prediction mismatch');
      controls.hidden = false;
      status.hidden = true;
      figure.dataset.evolutionReady = 'true';
      render();
    }).catch(function () {
      stage = 'observations'; original = null; review = null;
      controls.hidden = true;
      status.setAttribute('data-zh', '模型结果暂未加载，已保留24个真实散点；请刷新后再切换模型。');
      status.setAttribute('data-en', 'Model results could not be loaded. The 24 observed points remain; refresh to enable model comparisons.');
      status.textContent = text([status.dataset.zh, status.dataset.en]);
      status.hidden = false;
      render();
    });
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window === 'undefined' ? globalThis : window);

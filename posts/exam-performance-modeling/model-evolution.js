/* Data-driven model evolution, using the original records and preserved fit results.
 * No fitting, model calls or generated observations occur in the browser. */
(function (root) {
  'use strict';
  var STAGES = ['observations', 'baseline', 'linear', 'bounded'];
  function linearAt(t, difficulty, original) {
    var b = original.targets.y.candidates.linear.full_refit_coefficients;
    return b.intercept + t * b.time + b.difficulty * difficulty;
  }
  function readRecords(doc) {
    var records = [];
    [1, 2, 3].forEach(function (year) {
      var rows = doc.querySelectorAll('#source-year-' + year + ' tbody tr');
      var scores = rows[0].querySelectorAll('td'), difficulties = rows[1].querySelectorAll('td');
      if (scores.length !== 8 || difficulties.length !== 8) throw new Error('Expected eight exams per year');
      for (var j = 0; j < 8; j++) {
        var score = Number(scores[j].textContent), d = Number(difficulties[j].textContent);
        var maximum = year === 3 ? 150 : 100;
        if (!Number.isFinite(score) || score < 0 || score > maximum || !Number.isFinite(d) || d < 0 || d > 1) throw new Error('Invalid observation');
        records.push(Object.freeze({ t: (year - 1) * 8 + j + 1, year: year, score: score, maximum: maximum, difficulty: d, rate: score / maximum }));
      }
    });
    return Object.freeze(records);
  }
  // One static-result request per document, shared by the overview and detailed chart.
  var resultsPromise;
  function loadResults() {
    if (!resultsPromise) resultsPromise = Promise.all(['model-results.json', 'robustness-review-results.json'].map(function (name) {
      return fetch(new URL(name, document.baseURI)).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      });
    }));
    return resultsPromise;
  }
  var trainingPromise;
  function loadTrainingResults() {
    if (!trainingPromise) trainingPromise = fetch(new URL('model-walkthrough-results.json?v=75b6a3f1fbba', document.baseURI)).then(function (response) {
      if (!response.ok) throw new Error('Training results unavailable'); return response.json();
    });
    return trainingPromise;
  }
  function trainingModels(training) {
    var c = training.candidate_comparison, b = training.coefficients;
    if (JSON.stringify(training.training_range) !== '[1,20]' || !c || c.reference_t !== 20 || !Number.isFinite(c.baseline_mean) || !b || !['intercept', 'time', 'difficulty'].every(function (k) { return Number.isFinite(b[k]); }) || !c.bounded || !Array.isArray(c.bounded.beta) || c.bounded.beta.length !== 3 || !c.bounded.beta.every(Number.isFinite) || !(c.bounded.gradient_max_abs < 1e-8)) throw new Error('Invalid training candidate results');
    return {
      original: { source_sha256: training.source_sha256, baseline_exams: [18, 19, 20], reference_t: 20, targets: { y: { candidates: {
        mean3: { full_refit_coefficients: { mean: c.baseline_mean } },
        linear: { full_refit_coefficients: b, forecast_points_150: 150 * (b.intercept + 20 * b.time + .2 * b.difficulty) }
      } } } },
      review: { source_sha256: training.source_sha256, full_fit: { y: c.bounded } },
      referenceTime: 20
    };
  }
  function forecast(stage, difficulty, original, review, t) {
    if (t == null) t = 25;
    if (stage === 'observations') return null;
    if (stage === 'baseline') return original.targets.y.candidates.mean3.full_refit_coefficients.mean;
    if (stage === 'linear') {
      return linearAt(t, difficulty, original);
    }
    if (stage === 'bounded') {
      var beta = review.full_fit.y.beta;
      var z = beta[0] + beta[1] * (t - 16) / 8 + beta[2] * (difficulty - .2) / .1;
      return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
    }
    throw new Error('Unknown evolution stage');
  }
  function formula(stage, original, review, t) {
    if (t == null) t = 25;
    if (stage === 'observations') return '';
    if (stage === 'baseline') {
      var indices = original.baseline_exams || [22, 23, 24];
      return '\\begin{aligned}\\widehat y(d)&=\\frac{' + indices.map(function (i) { return 'y_{' + i + '}'; }).join('+') + '}{3}\\\\&\\approx' + forecast('baseline', .2, original, review, t).toFixed(9) + '\\end{aligned}';
    }
    if (stage === 'linear') {
      var b = original.targets.y.candidates.linear.full_refit_coefficients;
      return '\\begin{aligned}\\widehat y(d)&=(a+' + t + 'b)+cd\\\\&\\approx' + (b.intercept + t * b.time).toFixed(9) + (b.difficulty < 0 ? '-' : '+') + Math.abs(b.difficulty).toFixed(9) + 'd\\end{aligned}';
    }
    if (stage === 'bounded') {
      var beta = review.full_fit.y.beta, slope = beta[2] / .1;
      var intercept = beta[0] + beta[1] * (t - 16) / 8 - .2 * slope;
      return '\\begin{aligned}z(d)&\\approx' + intercept.toFixed(9) + (slope < 0 ? '-' : '+') + Math.abs(slope).toFixed(9) + 'd\\\\\\widehat y(d)&=\\frac{1}{1+\\exp(-z(d))}\\end{aligned}';
    }
    throw new Error('Unknown evolution stage');
  }
  var X = function (d) { return 90 + (d - .1) / .3 * 840; };
  var Y = function (rate) { return 455 - (rate - .5) / .55 * 325; };
  function curve(stage, from, to, original, review, t) {
    return Array.from({ length: 51 }, function (_, i) {
      var d = from + (to - from) * i / 50;
      return (i ? 'L' : 'M') + X(d).toFixed(6) + ' ' + Y(forecast(stage, d, original, review, t)).toFixed(6);
    }).join('');
  }
  var api = { forecast: forecast, formula: formula, curve: curve, x: X, y: Y, stages: STAGES, linearAt: linearAt, readRecords: readRecords, loadResults: loadResults, loadTrainingResults: loadTrainingResults, trainingModels: trainingModels };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.ExamModelEvolution = api;
  // Mount the single candidate panel inside step 3 before typography/DOMContentLoaded.
  var candidateTemplate = document.getElementById('candidate-model-template');
  var candidateSlot = document.getElementById('candidate-model-slot');
  if (candidateTemplate && candidateSlot) { candidateSlot.appendChild(candidateTemplate.content); candidateTemplate.remove(); }
  function init() {
    var figure = document.getElementById('model-evolution');
    if (!figure) return;
    var svg = figure.querySelector('#model-evolution-chart');
    var mathOutput = figure.querySelector('.evolution-formula');
    var mathStatus = figure.querySelector('.evolution-math-status');
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
    var referenceTime = 20;
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
    grid.appendChild(el('text', { x: 930, y: 110, 'text-anchor': 'end' }, ['水平虚线：满分，得分率1', 'Horizontal Dashes: Full Marks, Rate 1']));
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
      grid.appendChild(el('text', { x: 117 + i * 150, y: 32 }, [['高一/100', 'Y1/100'], ['高二/100', 'Y2/100'], ['高三/150', 'Y3/150']][i]));
    });
    readRecords(document).slice(0, 20).forEach(function (record) {
        var year = record.year, d = record.difficulty, rate = record.rate, t = record.t;
        var point = mark(X(d), Y(rate), year, { 'data-exam': t, 'data-difficulty': d, 'data-rate': rate, tabindex: '0', role: 'img' });
        var labels = ['第' + t + '次：难度' + d.toFixed(2) + '，得分率' + rate.toFixed(4),
          'Exam ' + t + ': difficulty ' + d.toFixed(2) + ', score rate ' + rate.toFixed(4)];
        point.appendChild(el('title', {}, labels));
        records.push({ point: point, labels: labels });
        points.appendChild(point);
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
      observations: ['这里仅显示前20次训练记录，正在读取同口径候选参数。', 'Only the first 20 training records are shown here while matched candidate parameters load.'],
      baseline: ['均值基线取第18—20次得分率的平均值，与目标难度无关，图像为水平线。', 'The mean baseline averages score rates from exams 18–20. It is constant across difficulty, giving a horizontal line.'],
      linear: ['使用前20次联合估计截距、阶段与难度系数。在参照阶段20，得分率随难度按固定斜率变化。', 'Estimate the intercept, stage and difficulty coefficients jointly from exams 1–20. At reference stage 20, the score rate changes with difficulty at a constant slope.'],
      bounded: ['有界修订按准似然估计参数，再通过logistic函数将线性预测子映射为0—1之间的平均得分率。', 'The bounded revision estimates parameters by quasi-likelihood and maps the linear predictor to a mean score rate between 0 and 1 through the logistic function.']
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
      mathOutput.hidden = !hasModel;
      mathStatus.hidden = true;
      mathStatus.textContent = ''; // Also clear the aria-describedby text after recovery.
      if (hasModel) {
        // The formula source is independent of the optional typesetting engine.
        var latex = formula(stage, original, review, referenceTime);
        mathOutput.dataset.latex = latex;
        mathOutput.removeAttribute('data-rendered-latex');
        mathOutput.removeAttribute('data-math-error');
        mathOutput.setAttribute('tabindex', '0'); mathOutput.setAttribute('role', 'region');
        mathOutput.setAttribute('aria-label', text(['当前模型公式；窄屏可横向滚动', 'Current model formula; scroll horizontally if needed']));
        var rendererAvailable = root.katex && typeof root.katex.render === 'function';
        try {
          if (!rendererAvailable) throw new Error('renderer-unavailable');
          root.katex.render(latex, mathOutput, { displayMode: true, output: 'htmlAndMathml', throwOnError: true, strict: 'error', trust: false });
          mathOutput.dataset.renderedLatex = latex;
          mathOutput.dataset.mathState = 'rendered';
        } catch (_) {
          // Replace even partially written markup: never keep a stale prior formula.
          var source = document.createElement('code');
          source.className = 'evolution-formula-source';
          source.setAttribute('translate', 'no');
          source.textContent = latex;
          mathOutput.replaceChildren(source);
          mathOutput.dataset.mathState = 'source-fallback';
          mathOutput.dataset.mathError = rendererAvailable ? 'render-failed' : 'renderer-unavailable';
          mathStatus.textContent = text(rendererAvailable
            ? ['公式排版失败：下方保留当前模型的 LaTeX 公式源，曲线和数值仍可使用。', 'Formula typesetting failed. LaTeX source for the current model is shown below; curves and numerical values remain available.']
            : ['数学排版组件未加载：下方显示当前模型的 LaTeX 公式源，曲线和数值仍可使用。', 'The math typesetting component did not load. LaTeX source for the current model is shown below; curves and numerical values remain available.']);
          mathStatus.hidden = false;
        }
      }
      lines.style.display = target.style.display = legendLine.style.display = hasModel ? '' : 'none';
      legendLabel.textContent = hasModel ? text(stage === 'baseline' ? ['近期均值基线', 'Recent-Mean Baseline'] : stage === 'linear' ? ['回归直线（参照20）', 'Regression Line (Reference 20)'] : ['有界曲线（参照20）', 'Bounded Curve (Reference 20)']) : '';
      if (!hasModel) {
        targetLabel.textContent = '';
        rateOutput.textContent = scoreOutput.textContent = '—';
        warning.textContent = text(['选择候选查看估计曲线；前20次训练散点保留原位置。', 'Select a candidate to inspect its estimates; the 20 training observations retain their positions.']);
        return;
      }
      var estimate = forecast(stage, d, original, review, referenceTime);
      outside.setAttribute('d', curve(stage, .1, .15, original, review, referenceTime));
      supported.setAttribute('d', curve(stage, .15, .4, original, review, referenceTime));
      guide.setAttribute('x1', X(d)); guide.setAttribute('x2', X(d)); guide.setAttribute('y1', Y(estimate));
      diamond.setAttribute('d', 'M' + X(d) + ' ' + (Y(estimate) - 9) + 'l9 9-9 9-9-9z');
      diamond.setAttribute('data-difficulty', d); diamond.setAttribute('data-rate', estimate);
      targetLabel.textContent = text(['菱形：难度' + d.toFixed(2) + '，估计率' + estimate.toFixed(4), 'Diamond: difficulty ' + d.toFixed(2) + ', rate ' + estimate.toFixed(4)]);
      rateOutput.textContent = estimate.toFixed(4);
      scoreOutput.textContent = (150 * estimate).toFixed(2) + text([' 分', ' points']);
      input.setAttribute('aria-valuetext', text(['参照难度' + d.toFixed(2), 'Reference difficulty ' + d.toFixed(2)]));
      warning.textContent = text(estimate > 1 || estimate < 0
        ? ['当前估计超出0—150分的可行范围。', 'The current estimate lies outside the feasible range of 0–150 points.']
        : d < .15 ? ['该难度低于训练记录下限0.15，属于外推。', 'This difficulty is below the training-data minimum of 0.15 and requires extrapolation.']
        : ['曲线固定参照阶段20；散点对应各次考试。逐次残差按各次实际阶段和难度计算，见下一步。', 'The curve fixes reference stage 20; points represent individual exams. The next step computes residuals using the actual stage and difficulty of each exam.']);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () { stage = button.dataset.evolutionStage; render(); });
    });
    input.addEventListener('input', render);
    document.addEventListener('langChanged', render);
    render();
    Promise.all([loadResults(), loadTrainingResults()]).then(function (data) {
      var saved = data[0], training = data[1];
      if (!training.source_sha256 || training.source_sha256 !== saved[0].source_sha256 || training.source_sha256 !== saved[1].source_sha256) throw new Error('Training source mismatch');
      var context = trainingModels(training); original = context.original; review = context.review; referenceTime = context.referenceTime;
      if (original.source_sha256 !== review.source_sha256 || !original.source_sha256) throw new Error('Source mismatch');
      STAGES.slice(1).forEach(function (kind) {
        if (!Number.isFinite(forecast(kind, .2, original, review, referenceTime))) throw new Error('Invalid model values');
      });
      if (Math.abs(forecast('linear', .2, original, review, referenceTime) * 150 - original.targets.y.candidates.linear.forecast_points_150) > 1e-6) throw new Error('Prediction mismatch');
      stage = 'baseline';
      controls.hidden = false;
      status.hidden = true;
      figure.dataset.evolutionReady = 'true';
      render();
    }).catch(function () {
      stage = 'observations'; original = null; review = null;
      controls.hidden = true;
      status.setAttribute('data-zh', '模型结果暂未加载，已保留前20次训练散点；请刷新后再切换候选。');
      status.setAttribute('data-en', 'Model results could not be loaded. The 20 training points remain; refresh to enable candidate comparisons.');
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

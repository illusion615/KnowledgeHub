/* Six views of the same observations; saved fits/predictions only, never refitting. */
(function (root) {
  'use strict';
  var COUNT = 6;
  // Manual navigation only: no clock, autoplay, visibility observer or scheduled advancement.
  function createNavigator(notify) {
    var state = { stage: 0, ready: false, difficulty: .2, trainingExam: 20, holdoutExam: 21 };
    function snapshot() { return Object.assign({}, state); }
    function emit() { notify(snapshot()); }
    function go(stage) {
      if (!state.ready || !Number.isInteger(stage) || stage < 0 || stage >= COUNT) return;
      state.stage = stage; emit();
    }
    return {
      state: snapshot, go: go,
      next: function () { go(Math.min(COUNT - 1, state.stage + 1)); },
      previous: function () { go(Math.max(0, state.stage - 1)); },
      setReady: function (ready) { state.ready = Boolean(ready); emit(); },
      scenario: function (d) { if (!state.ready || (d !== .1 && d !== .2)) return; state.difficulty = d; emit(); },
      inspect: function (t) {
        if (!state.ready || !Number.isInteger(t)) return;
        if (state.stage === 3 && t >= 1 && t <= 20) state.trainingExam = t;
        else if (state.stage === 4 && t >= 21 && t <= 24) state.holdoutExam = t;
        else return;
        emit();
      }
    };
  }
  function math(latex) { return '\\(' + latex + '\\)'; }
  // Only explicit, author-owned LaTeX delimiters are parsed; ordinary numeric cells stay text.
  function mathParts(text) {
    var parts = [], end = 0;
    text.replace(/\\\(([\s\S]*?)\\\)/g, function (match, latex, index) {
      if (index > end) parts.push({ text: text.slice(end, index) });
      parts.push({ latex: latex }); end = index + match.length; return match;
    });
    if (end < text.length) parts.push({ text: text.slice(end) });
    return parts;
  }
  function inspection(state, records, original, training) {
    if (state.stage < 3) return null;
    var future = state.stage === 5, t = future ? 25 : state.stage === 3 ? state.trainingExam : state.holdoutExam;
    var b = future ? original.targets.y.candidates.linear.full_refit_coefficients : training.coefficients;
    var r = future ? null : records[t - 1];
    var difficulty = future ? state.difficulty : r.difficulty;
    var rate = future ? b.intercept + t * b.time + difficulty * b.difficulty
      : state.stage === 3 ? training.fitted[t - 1].predicted_rate : original.targets.y.candidates.linear.final_test.observations[t - 21].predicted_rate;
    return { t: t, difficulty: difficulty, predicted_rate: rate, observed: r, coefficients: b,
      cutoff: future ? 24 : 20, kind: future ? 'scenario' : state.stage === 3 ? 'training-fit' : 'holdout' };
  }
  function paths(stage, records, original, shared, training, difficulty, exam) {
    function path(points) { return points.map(function (p, i) { return (i ? 'L' : 'M') + x(p[0], stage) + ' ' + y(p[1], stage); }).join(''); }
    if (stage < 2) {
      // Do not bridge the 100→150 maximum change in raw scores.
      var groups = stage === 0 ? [records.slice(0, 16), records.slice(16)] : [records];
      return groups.map(function (rs) { return { kind: 'observed-trend', d: path(rs.map(function (r) { return [r.t, stage === 0 ? r.score : r.rate]; })) }; });
    }
    var t = stage === 5 ? 25 : exam == null ? (stage === 4 ? 21 : 20) : exam;
    var b = stage === 5 ? original.targets.y.candidates.linear.full_refit_coefficients : training.coefficients;
    return [[.1, .15, 'extrapolated'], [.15, .4, 'supported-difficulty']].map(function (segment) {
      return { kind: segment[2], t: t, d: path(Array.from({ length: 51 }, function (_, i) {
        var d = segment[0] + (segment[1] - segment[0]) * i / 50;
        return [d, b.intercept + b.time * t + b.difficulty * d];
      })) };
    });
  }
  function x(v, stage) { return stage >= 2 ? 90 + (v - .1) / .3 * 840 : 80 + (v - 1) / 24 * 860; }
  function y(v, stage) {
    if (stage >= 2) return 455 - (v - .5) / .55 * 325;
    var min = stage === 0 ? 0 : .5, max = stage === 0 ? 160 : 1.05;
    return 420 - (v - min) / (max - min) * 280;
  }
  function estimates(stage, records, original, shared, training) {
    if (stage < 2) return [];
    if (stage === 5) return records.map(function (r) { return { t: r.t, predicted_rate: shared.linearAt(r.t, r.difficulty, original), kind: 'full-fit' }; });
    var values = training.fitted.map(function (p) { return { t: p.t, predicted_rate: p.predicted_rate, kind: 'training-fit' }; });
    if (stage === 4) values = values.concat(original.targets.y.candidates.linear.final_test.observations.map(function (r) {
      return { t: r.t, predicted_rate: r.predicted_rate, kind: 'holdout' };
    }));
    return values;
  }
  // Numeric evidence for every step; all values come from the original tables or saved results.
  function evidence(stage, records, original, shared, training) {
    var literal = function (v) { return [String(v), String(v)]; };
    var selected = [records[0], records[16], records[23]];
    if (stage === 0) return {
      caption: ['24次原始成绩（各行按时间先后）', 'All 24 Original Scores (Chronological Within Each Row)'],
      headers: [['年份', 'Year'], ['满分', 'Maximum'], ['8次实测分数', 'Eight Observed Scores']],
      rows: [1, 2, 3].map(function (year) { var group = records.filter(function (r) { return r.year === year; });
        return [['高' + ['一', '二', '三'][year - 1], 'Year ' + year], literal(group[0].maximum), literal(group.map(function (r) { return r.score; }).join(', '))]; })
    };
    if (stage === 1) return {
      caption: ['本题第1、17、24次：各用自己的满分换算', 'Exams 1, 17, 24: Divide by the Respective Maximum'],
      headers: [['考试编号', 'Exam'], ['实测分数', 'Observed Score'], ['满分', 'Maximum'], ['得分率', 'Score Rate']],
      rows: selected.map(function (r) { return [literal(r.t), literal(r.score), literal(r.maximum), literal(r.rate.toFixed(4))]; })
    };
    if (!original) return { caption: ['', ''], headers: [], rows: [] };
    if (stage === 2) {
      var b = training.coefficients;
      return { caption: ['仅用前20次求得的系数：' + math('\\widehat y=a+bt+cd'), 'Coefficients from Exams 1–20 Only: ' + math('\\widehat y=a+bt+cd')],
        headers: [['参数', 'Parameter'], ['本题数值', 'Value'], ['在式中的作用', 'Role in the Equation']],
        rows: [ [literal('a'), literal(b.intercept.toFixed(9)), ['基准项；不单独解释为能力', 'Intercept; not a measure of ability']],
          [literal('b'), literal(b.time.toFixed(9)), ['乘考试编号t', 'Multiplies exam order t']],
          [literal('c'), literal(b.difficulty.toFixed(9)), ['乘难度d', 'Multiplies difficulty d']] ] };
    }
    if (stage === 3 || stage === 4) {
      var points = stage === 3 ? training.fitted : original.targets.y.candidates.linear.final_test.observations;
      return { caption: stage === 3 ? ['前20次训练误差（各次原分制）', 'All 20 Training Errors (Original Score Scales)']
          : ['全部四次最终留出：预测时未使用21—24次成绩（150分制）', 'All Four Final Holdouts: Scores 21–24 Were Unused for Prediction (150-Point Scale)'],
        headers: [['考试编号', 'Exam'], ['实测（分）', 'Observed (Points)'], stage === 3 ? ['拟合（分）', 'Fitted (Points)'] : ['预测（分）', 'Forecast (Points)'], ['实测 − 估计（分）', 'Observed − Estimate (Points)']],
        rows: points.map(function (p) { var r = records[p.t - 1], fitted = r.maximum * p.predicted_rate;
          return [literal(p.t), literal(r.score), literal(fitted.toFixed(2)), literal((r.score - fitted).toFixed(2))]; }) };
    }
    var comparison = original.difficulty_comparison;
    return { caption: ['两问的数值对照：下一场' + math('t=25') + '，满分150', 'Both Questions: Next Exam ' + math('t=25') + ', Maximum 150'],
      headers: [['难度d', 'Difficulty d'], ['个人预测（分）', 'Score Forecast'], ['领先均分G（分）', 'Margin G (Points)'], ['适用边界', 'Scope']],
      rows: [.2, comparison.formal_maximizer, comparison.supported_interval_maximizer].map(function (d, i) {
        var rate = shared.linearAt(25, d, original);
        return [literal(d.toFixed(2)), literal((150 * rate).toFixed(2)), literal((comparison.G_intercept_points + comparison.G_slope_points_per_unit_d * d).toFixed(2)),
          i === 0 ? ['题设条件；不是保证', 'Given condition; not guaranteed'] : i === 1 ? ['外推且个人分数越界', 'Extrapolation; score exceeds maximum'] : ['两难度区间交集的端点', 'Endpoint of the overlapping difficulty ranges']]; }) };
  }
  var api = { createNavigator: createNavigator, x: x, y: y, estimates: estimates, evidence: evidence, paths: paths, inspection: inspection, mathParts: mathParts };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  function init() {
    var figure = document.getElementById('model-walkthrough'), shared = root.ExamModelEvolution;
    if (!figure || !shared) return;
    var records, original, review, training;
    var svg = figure.querySelector('#walk-chart'), controls = figure.querySelector('.walk-controls');
    var fallback = figure.querySelector('.walk-fallback'), steps = Array.from(fallback.querySelectorAll('li'));
    var description = figure.querySelector('.walk-description'), readout = figure.querySelector('.walk-readout');
    var status = figure.querySelector('.walk-status');
    var examSelect = figure.querySelector('#walk-exam');
    var link = figure.querySelector('[data-walk-link]'), caseControls = figure.querySelector('.walk-cases');
    var nav = Array.from(figure.querySelectorAll('[data-walk-stage]'));
    function text(pair) { return pair[document.documentElement.lang.startsWith('en') ? 1 : 0]; }
    function local(node, pair) {
      node.dataset.zh = pair[0]; node.dataset.en = pair[1];
      if (node.namespaceURI === 'http://www.w3.org/2000/svg') { node.textContent = text(pair); return; }
      node.replaceChildren();
      mathParts(text(pair)).forEach(function (part) {
        if (!part.latex) { node.appendChild(document.createTextNode(part.text || '')); return; }
        var span = document.createElement('span'); span.className = 'math-inline';
        span.dataset.latex = part.latex; span.textContent = part.latex;
        if (root.katex) {
          root.katex.render(part.latex, span, { output: 'htmlAndMathml', throwOnError: true, strict: 'error', trust: false });
          span.dataset.renderedLatex = part.latex;
        }
        node.appendChild(span);
      });
    }
    function localizeStatic() {
      figure.querySelectorAll('[data-zh][data-en]').forEach(function (n) {
        if (!n.closest('.katex')) local(n, [n.dataset.zh, n.dataset.en]);
      });
    }
    function node(tag, attrs, label) {
      var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (label) local(n, label);
      return n;
    }
    function draw(state) {
      var stage = state.stage;
      if (stage === 2) return; // The candidate component owns the visible chart in this step.
      var current = inspection(state, records, original, training), conditional = Boolean(current);
      var left = conditional ? 90 : 80, right = conditional ? 930 : 940;
      var top = conditional ? 130 : 140, bottom = conditional ? 455 : 420;
      var g = node('g', { 'data-walk-view': stage, 'data-horizontal-axis': conditional ? 'difficulty' : 'exam-order' });
      function add(tag, attrs, label) { var n = node(tag, attrs, label); g.appendChild(n); return n; }
      function mark(px, py, year, attrs) {
        var n = year === 1 ? node('circle', { cx: px, cy: py, r: 5 }) : year === 2
          ? node('rect', { x: px - 5, y: py - 5, width: 10, height: 10 })
          : node('path', { d: 'M' + px + ' ' + (py - 6) + 'l6 11h-12z' });
        n.setAttribute('class', 'walk-observed walk-year-' + year);
        Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        g.appendChild(n); return n;
      }
      [1, 2, 3].forEach(function (year, i) {
        var px = 90 + i * 295;
        mark(px, 22, year);
        add('text', { x: px + 18, y: 28 }, ['实测：高' + ['一', '二', '三'][i] + '（满分' + (year === 3 ? 150 : 100) + '）', 'Observed: Y' + year + ' (max ' + (year === 3 ? 150 : 100) + ')']);
      });
      add('text', { x: left, y: 65 }, conditional
        ? stage === 5 ? ['浅色：历史观测；◇：第25次预测', 'Pale marks: historical observations; ◇: exam-25 forecast']
          : ['深色：当前实测；◇：模型估计；竖线：本次误差', 'Strong mark: selected observation; ◇: estimate; vertical gap: error']
        : ['细线：历史走势；虚线：满分', 'Thin lines: historical scores; dashed lines: full marks']);
      if (conditional) {
        add('text', { x: left, y: 94 }, ['系数使用记录：1—' + current.cutoff, 'Coefficient data: exams 1–' + current.cutoff]);
        add('text', { x: right, y: 94, 'text-anchor': 'end' }, ['当前阶段：第' + current.t + '次', 'Current stage: exam ' + current.t]);
        add('text', { x: left, y: 121 }, ['个人得分率', 'Student score rate']);
        add('text', { x: right, y: 121, 'text-anchor': 'end' }, ['横虚线：满分', 'Horizontal dashes: full marks']);
        add('rect', { x: left, y: top, width: x(.15, stage) - left, height: bottom - top, class: 'walk-extrapolation' });
        add('rect', { x: left, y: top, width: right - left, height: y(1, stage) - top, class: 'walk-overmaximum' });
        add('line', { x1: x(.15, stage), x2: x(.15, stage), y1: top, y2: bottom, class: 'walk-support-edge' });
      } else {
        add('text', { x: left, y: 110 }, stage === 0 ? ['分数（分）', 'Score (points)'] : ['得分率', 'Score rate']);
      }
      (stage === 0 ? [0, 50, 100, 150] : [.5, .6, .7, .8, .9, 1, 1.05]).forEach(function (v) {
        add('line', { x1: left, x2: right, y1: y(v, stage), y2: y(v, stage), class: stage > 0 && v === 1 ? 'walk-limit' : 'chart-grid' });
        add('text', { x: left - 14, y: y(v, stage) + 5, 'text-anchor': 'end' }, [stage === 0 ? String(v) : v.toFixed(2), stage === 0 ? String(v) : v.toFixed(2)]);
      });
      if (stage === 0) {
        add('line', { x1: left, x2: x(16.5, stage), y1: y(100, stage), y2: y(100, stage), class: 'walk-limit' });
        add('line', { x1: x(16.5, stage), x2: right, y1: y(150, stage), y2: y(150, stage), class: 'walk-limit' });
      }
      (conditional ? [.1, .15, .2, .25, .3, .35, .4] : [1, 8, 16, 20, 24, 25]).forEach(function (v) {
        var label = conditional ? v.toFixed(2) : String(v);
        add('text', { x: x(v, stage), y: bottom + 30, 'text-anchor': 'middle' }, [label, label]);
      });
      add('path', { d: 'M' + left + ' ' + top + 'V' + bottom + 'H' + right, class: 'chart-axis' });
      add('text', { x: right, y: conditional ? 529 : 489, 'text-anchor': 'end' }, conditional
        ? ['难度（难题分值占比）', 'Difficulty (hard-question share)'] : ['考试编号', 'Exam order']);
      if (conditional) add('text', { x: left, y: 529 }, ['左侧底色：难度外推', 'Left shading: difficulty extrapolation']);
      paths(stage, records, original, shared, training, state.difficulty, current && current.t).forEach(function (p) {
        add('path', { d: p.d, class: p.kind === 'observed-trend' ? 'walk-history' : 'walk-model' + (p.kind === 'extrapolated' ? ' walk-dashed' : ''),
          'data-process-curve': p.kind, 'data-reference-exam': p.t || '', 'data-coefficient-cutoff': current ? current.cutoff : '' });
      });
      if (current && current.observed) add('line', {
        x1: x(current.difficulty, stage), x2: x(current.difficulty, stage),
        y1: y(current.observed.rate, stage), y2: y(current.predicted_rate, stage), class: 'walk-error', 'data-error-exam': current.t
      });
      var selectedObservation;
      records.forEach(function (r) {
        var px = x(conditional ? r.difficulty : r.t, stage), py = y(stage === 0 ? r.score : r.rate, stage);
        var p = mark(px, py, r.year, { 'data-observed': r.t, 'data-year': r.year, 'data-score': r.score, 'data-maximum': r.maximum,
          'data-rate': r.rate, 'data-difficulty': r.difficulty, 'data-x': px, 'data-y': py });
        if (conditional) {
          var selected = current.observed && r.t === current.t;
          p.classList.add(selected ? 'walk-selected-observation' : 'walk-background-observation');
          if (selected) selectedObservation = p;
        }
        p.appendChild(node('title', {}, ['高' + ['一', '二', '三'][r.year - 1] + '，第' + r.t + '次：' + r.score + '/' + r.maximum + '分；难度' + r.difficulty + '；得分率' + r.rate.toFixed(4),
          'Year ' + r.year + ', exam ' + r.t + ': ' + r.score + '/' + r.maximum + ' points; difficulty ' + r.difficulty + '; rate ' + r.rate.toFixed(4)]));
      });
      if (selectedObservation) g.appendChild(selectedObservation); // Keep coincident reference points behind the selected observation.
      if (current) {
        var px = x(current.difficulty, stage), py = y(current.predicted_rate, stage);
        add('path', { d: 'M' + px + ' ' + (py - 8) + 'l8 8-8 8-8-8z', class: 'walk-estimate', 'data-estimate-kind': current.kind,
          'data-exam': current.t, 'data-difficulty': current.difficulty, 'data-rate': current.predicted_rate, 'data-x': px, 'data-y': py });
      }
      var old = svg.querySelector('[data-walk-view]');
      if (old) old.replaceWith(g); else svg.appendChild(g);
      local(svg.querySelector('title'), conditional ? ['固定考试阶段的难度—得分率回归曲线', 'Difficulty–Score-Rate Regression at a Fixed Exam Stage'] : ['按考试编号排列的原始记录', 'Original Records by Exam Order']);
      local(svg.querySelector('desc'), conditional
        ? ['横轴难度0.10—0.40，纵轴得分率0.50—1.05；当前阶段为第' + current.t + '次，系数使用第1—' + current.cutoff + '次记录。浅色为其他历史观测。',
          'Difficulty 0.10–0.40 horizontally and score rate 0.50–1.05 vertically; current stage is exam ' + current.t + ', with coefficients estimated on exams 1–' + current.cutoff + '. Pale marks are other historical observations.']
        : ['按考试顺序绘制原始记录。', 'Observed records plotted in exam order.']);
    }
    function render(state) {
      if (!records) return;
      figure.dataset.walkStage = state.stage; figure.dataset.walkReady = state.ready;
      var current = inspection(state, records, original, training);
      var candidatesVisible = state.stage === 2;
      figure.dataset.inspectionExam = current ? current.t : '';
      figure.dataset.coefficientCutoff = current ? current.cutoff : '';
      figure.querySelector('.walk-inspection').hidden = state.stage !== 3 && state.stage !== 4;
      var conditionOutput = figure.querySelector('.walk-condition'); conditionOutput.hidden = !current;
      if (current) {
        if (state.stage === 3 || state.stage === 4) {
          var first = state.stage === 3 ? 1 : 21, last = state.stage === 3 ? 20 : 24;
          examSelect.replaceChildren();
          for (var t = first; t <= last; t++) {
            var option = document.createElement('option'); option.value = t;
            option.textContent = text(['第' + t + '次（满分' + records[t - 1].maximum + '）', 'Exam ' + t + ' (max ' + records[t - 1].maximum + ')']);
            examSelect.appendChild(option);
          }
          examSelect.value = String(current.t);
        }
        local(conditionOutput, ['当前曲线：' + math('\\widehat y(d\\mid t=' + current.t + ')=a+' + current.t + 'b+cd') + '；所选难度' + math('d=' + current.difficulty.toFixed(2)),
          'Current curve: ' + math('\\widehat y(d\\mid t=' + current.t + ')=a+' + current.t + 'b+cd') + '; selected difficulty ' + math('d=' + current.difficulty.toFixed(2))]);
      }
      figure.querySelector('#model-evolution').hidden = !candidatesVisible;
      figure.querySelector('#candidate-model-slot').hidden = !candidatesVisible;
      figure.querySelector('.walk-chart-scroll').hidden = candidatesVisible;
      figure.querySelector('.walk-scroll-hint').hidden = candidatesVisible;
      figure.querySelector('.walk-number-scroll').hidden = candidatesVisible;
      figure.querySelector('.walk-line-note').hidden = candidatesVisible;
      readout.hidden = candidatesVisible;
      nav.forEach(function (b, i) {
        b.setAttribute('aria-pressed', String(i === state.stage));
        if (i === state.stage) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      var rail = figure.querySelector('.walk-process-scroll'), active = nav[state.stage];
      var railRect = rail.getBoundingClientRect(), activeRect = active.getBoundingClientRect();
      if (activeRect.left < railRect.left || activeRect.right > railRect.right) rail.scrollLeft += activeRect.left - railRect.left - (rail.clientWidth - activeRect.width) / 2;
      ['previous', 'next'].forEach(function (action, i) {
        var button = figure.querySelector('[data-walk-action="' + action + '"]');
        button.hidden = !state.ready;
        button.disabled = i === 0 ? state.stage === 0 : state.stage === COUNT - 1;
        button.setAttribute('aria-label', text(i === 0 ? ['上一步', 'Previous Step'] : ['下一步', 'Next Step']));
        button.setAttribute('aria-controls', candidatesVisible ? 'model-evolution-chart' : 'walk-chart');
      });
      var p = steps[state.stage].querySelector('p');
      local(description, [p.dataset.zh, p.dataset.en]);
      var a = steps[state.stage].querySelector('a');
      link.href = a.getAttribute('href'); local(link, [a.dataset.zh, a.dataset.en]);
      caseControls.hidden = state.stage !== 5;
      figure.querySelectorAll('[data-walk-case]').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.walkCase) === state.difficulty)); });
      figure.querySelector('.walk-chart-scroll').setAttribute('aria-label', text(['建模过程图，可横向滚动', 'Modeling chart, horizontally scrollable']));
      var value = [
        ['24次真实成绩：高一、高二满分100；高三满分150。', '24 observed exams: maxima are 100 in Years 1–2 and 150 in Year 3.'],
        [math('\\frac{80}{100}=0.8000') + '；' + math('\\frac{130}{150}\\approx0.8667') + '。', math('\\frac{80}{100}=0.8000') + '; ' + math('\\frac{130}{150}\\approx0.8667') + '.'],
        ['', ''],
        ['使用前20次估计的线性模型，按考试顺序检查拟合误差。', 'Inspect errors in exam order using the linear model fitted on exams 1–20.'],
        original ? ['后四次平均绝对误差：' + original.targets.y.candidates.linear.final_test.mae_points_150.toFixed(2) + '分（按150分制）；即四次误差绝对值的平均数。', 'Final-four mean absolute error: ' + original.targets.y.candidates.linear.final_test.mae_points_150.toFixed(2) + ' points on a 150-point scale: the average absolute error.'] : ['', ''],
        ['', '']
      ][state.stage];
      if (current && current.observed) {
        var r = current.observed, estimatePoints = current.predicted_rate * r.maximum;
        var rateError = r.rate - current.predicted_rate, pointsError = r.score - estimatePoints;
        var errorFormula = math('e_{' + r.t + '}=y_{' + r.t + '}-\\widehat y_{' + r.t + '}\\approx' + rateError.toFixed(6));
        value = ['第' + r.t + '次：实测' + r.score + '分，' + (state.stage === 3 ? '拟合' : '预测') + estimatePoints.toFixed(2) + '分（满分' + r.maximum + '）；' + errorFormula + '，折合' + pointsError.toFixed(2) + '分。',
          'Exam ' + r.t + ': observed ' + r.score + ', ' + (state.stage === 3 ? 'fitted ' : 'forecast ') + estimatePoints.toFixed(2) + ' points (max ' + r.maximum + '); ' + errorFormula + ', equivalent to ' + pointsError.toFixed(2) + ' points.'];
        if (state.stage === 4) {
          var mae = original.targets.y.candidates.linear.final_test.mae_points_150.toFixed(2);
          value[0] += ' 四次留出MAE：' + mae + '分。'; value[1] += ' Four-exam holdout MAE: ' + mae + ' points.';
        }
      }
      if (state.stage === 5) {
        var prediction = shared.forecast('linear', state.difficulty, original, review) * 150;
        var condition = math('t=25,\\quad d=' + state.difficulty.toFixed(2));
        var result = math('\\widehat S=150\\widehat y\\approx' + prediction.toFixed(2));
        value = [condition + '：' + result + '分（满分150）。' + (prediction > 150 ? '该估计超过满分。' : ''), condition + ': ' + result + ' points (maximum 150). ' + (prediction > 150 ? 'The estimate exceeds full marks.' : '')];
      }
      if (state.stage === 2 && original) {
        var means = training.means;
        var averages = math('\\bar t=' + means.t_mean) + ', ' + math('\\bar d\\approx' + means.d_mean.toFixed(6)) + ', ' + math('\\bar y\\approx' + means.output_mean.toFixed(6));
        value = ['前20次的平均值：' + averages + '；先沿用原文已经选出的线性形式，仅用前20次估计参数，最小化这20次的误差平方和。',
          'Means across exams 1–20: ' + averages + '; use the linear form already selected in the original analysis, estimating parameters only from these 20 records.'];
      }
      if (state.stage === 5) {
        var g = original.difficulty_comparison;
        var equation = math('G(d)\\approx' + g.G_intercept_points.toFixed(2) + '-' + Math.abs(g.G_slope_points_per_unit_d).toFixed(2) + 'd');
        var interval = math('[0.10,0.30]'), formal = math('d=' + g.formal_maximizer.toFixed(2)), supported = math('d=' + g.supported_interval_maximizer.toFixed(2));
        value[0] += ' 第二问用领先均分衡量优势：' + equation + '，区间' + interval + '形式最优为' + formal + '；与历史区间取交集后为' + supported + '。';
        value[1] += ' For question 2, advantage means the margin above the cohort mean: ' + equation + '. The formal optimum on ' + interval + ' is ' + formal + '; restricting to the overlap with observed difficulties gives ' + supported + '.';
      }
      var table = figure.querySelector('.walk-numbers'), data = evidence(state.stage, records, original, shared, training);
      local(table.querySelector('caption'), data.caption);
      var head = document.createElement('tr');
      data.headers.forEach(function (pair) { var cell = document.createElement('th'); cell.scope = 'col'; local(cell, pair); head.appendChild(cell); });
      table.querySelector('thead').replaceChildren(head);
      table.querySelector('tbody').replaceChildren.apply(table.querySelector('tbody'), data.rows.map(function (row) {
        var tr = document.createElement('tr');
        if (current && current.observed && Number(row[0][0]) === current.t) tr.setAttribute('aria-current', 'true');
        row.forEach(function (pair) { var cell = document.createElement('td'); local(cell, pair); tr.appendChild(cell); }); return tr;
      }));
      figure.querySelector('.walk-number-scroll').setAttribute('aria-label', text(['本题当前步骤的数值，可横向滚动', 'Values for the current step, horizontally scrollable']));
      local(readout, value);
      if (current && current.observed) {
        var scroller = figure.querySelector('.walk-number-scroll'), selectedRow = table.querySelector('[aria-current="true"]');
        if (selectedRow) {
          var sr = selectedRow.getBoundingClientRect(), container = scroller.getBoundingClientRect();
          var visibleTop = container.top + table.tHead.getBoundingClientRect().height;
          if (sr.bottom > container.bottom) scroller.scrollTop += sr.bottom - container.bottom;
          else if (sr.top < visibleTop) scroller.scrollTop += sr.top - visibleTop;
        }
      }
      var stamp = figure.querySelector('.walk-fit-equation'); stamp.hidden = state.stage < 3;
      if (state.stage >= 2) {
        var coeff = state.stage === 5 ? original.targets.y.candidates.linear.full_refit_coefficients : training.coefficients;
        var parameters = math('a\\approx' + coeff.intercept.toFixed(9)) + ', ' + math('b\\approx' + coeff.time.toFixed(9)) + ', ' + math('c\\approx' + coeff.difficulty.toFixed(9));
        local(stamp, [ (state.stage === 5 ? '已切换为全24次重估参数：' : '保持前20次的参数：') + parameters,
          (state.stage === 5 ? 'Switched to the all-24 refit: ' : 'Parameters from exams 1–20: ') + parameters ]);
      }
      var lineNotes = [
        ['细折线按时间连接实测分数，在满分由100变为150处断开。', 'Thin lines connect observed scores in time order, with a break where the maximum changes from 100 to 150.'],
        ['细折线连接24个实测得分率，表示标准化后的历史走势。', 'The thin line joins the 24 observed score rates to show the normalized historical pattern.'],
        ['第三步固定参照阶段20，以难度为横轴比较模型结构。', 'Step 3 compares model structures against difficulty at reference stage 20.'],
        ['曲线采用所选考试的实际阶段；竖线仅连接该次实测点与拟合点。其他历史点以浅色保留。下表列出全部20次训练误差。', 'The curve uses the actual stage of the selected exam. The vertical segment connects only that observation and its fitted point; other historical observations remain pale. The table lists all 20 training errors.'],
        ['四次预测使用同一组前20次系数；切换考试只改变阶段和该次难度。下表保留四次批量预测的完整误差。', 'All four forecasts use the same exam-20 coefficients. Selecting an exam changes its stage and difficulty; the table retains the complete batch forecast errors.'],
        ['用全部24次重估参数，曲线固定' + math('t=25') + '。空心菱形为目标难度下的预测；左侧虚线段表示难度低于历史下限0.15。', 'Refit on all 24 exams and fix the curve at ' + math('t=25') + '. The hollow diamond marks the forecast at the target difficulty; the dashed segment lies below the historical difficulty minimum of 0.15.']
      ];
      local(figure.querySelector('.walk-line-note'), lineNotes[state.stage]);
      draw(state); positionArrows();
    }
    function positionArrows() {
      var frame = figure.querySelector('.walk-chart-frame');
      var chart = figure.querySelector(player.state().stage === 2 ? '#model-evolution-chart' : '#walk-chart');
      var r = chart.getBoundingClientRect(), f = frame.getBoundingClientRect();
      if (r.height) frame.style.setProperty('--walk-arrow-mid', (r.top - f.top + r.height / 2) + 'px');
    }
    var player = createNavigator(render);
    localizeStatic();
    try { records = shared.readRecords(document); } catch (_) { return; }
    figure.querySelector('.walk-live').hidden = false;
    render(player.state());
    nav.forEach(function (b) { b.addEventListener('click', function () { player.go(Number(b.dataset.walkStage)); }); });
    examSelect.addEventListener('change', function () { player.inspect(Number(examSelect.value)); });
    examSelect.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      var state = player.state();
      if (state.stage !== 3 && state.stage !== 4) return;
      event.preventDefault();
      var first = state.stage === 3 ? 1 : 21, last = state.stage === 3 ? 20 : 24;
      var selected = state.stage === 3 ? state.trainingExam : state.holdoutExam;
      player.inspect(event.key === 'Home' ? first : event.key === 'End' ? last : Math.max(first, Math.min(last, selected + (event.key === 'ArrowDown' ? 1 : -1))));
    });
    figure.querySelectorAll('[data-walk-action]').forEach(function (b) {
      b.addEventListener('click', function () {
        var action = b.dataset.walkAction;
        if (action === 'revise') player.go(2);
        else player[action]();
      });
    });
    figure.querySelectorAll('[data-walk-case]').forEach(function (b) { b.addEventListener('click', function () { player.scenario(Number(b.dataset.walkCase)); }); });
    document.addEventListener('langChanged', function () { localizeStatic(); render(player.state()); });
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(positionArrows).observe(figure.querySelector('.walk-chart-frame'));
    window.addEventListener('resize', positionArrows);
    function followCandidateLink() {
      if (player.state().ready && ['#model-evolution', '#candidate-model-details'].includes(location.hash)) {
        player.go(2); figure.querySelector('#model-evolution').scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    }
    window.addEventListener('hashchange', followCandidateLink);
    document.addEventListener('click', function (event) {
      if (player.state().ready && event.target.closest('a[href="#model-evolution"], a[href="#candidate-model-details"]')) {
        event.preventDefault(); event.stopPropagation();
        history.pushState(null, '', '#model-evolution'); followCandidateLink();
      }
    }, true);
    Promise.all([shared.loadResults(), shared.loadTrainingResults()]).then(function (loaded) {
      var data = loaded[0]; original = data[0]; review = data[1]; training = loaded[1];
      if (training.source_sha256 !== original.source_sha256 || JSON.stringify(training.training_range) !== '[1,20]' || training.fitted.length !== 20) throw new Error('Training source mismatch');
      var b = training.coefficients;
      if (!b || !['intercept', 'time', 'difficulty'].every(function (key) { return Number.isFinite(b[key]); }) || !training.means || !['t_mean', 'd_mean', 'output_mean'].every(function (key) { return Number.isFinite(training.means[key]); })) throw new Error('Invalid training parameters');
      training.fitted.forEach(function (p, i) {
        var r = records[i];
        if (p.t !== i + 1 || !Number.isFinite(p.predicted_rate) || Math.abs(p.predicted_rate - (b.intercept + b.time * r.t + b.difficulty * r.difficulty)) > 1e-10) throw new Error('Training fit mismatch');
      });
      if (!original.source_sha256 || original.source_sha256 !== review.source_sha256) throw new Error('Source mismatch');
      if (!Number.isFinite(shared.forecast('linear', .2, original, review)) || Math.abs(shared.forecast('linear', .2, original, review) * 150 - original.targets.y.candidates.linear.forecast_points_150) > 1e-6) throw new Error('Invalid forecast');
      var held = original.targets.y.candidates.linear.final_test;
      if (held.observations.length !== 4 || !Number.isFinite(held.mae_points_150)) throw new Error('Invalid holdout');
      held.observations.forEach(function (p, i) {
        if (p.t !== i + 21 || !Number.isFinite(p.actual_rate) || Math.abs(p.actual_rate - records[p.t - 1].rate) > 1e-12 || !Number.isFinite(p.predicted_rate)) throw new Error('Holdout source mismatch');
      });
      held.observations.forEach(function (p) {
        var r = records[p.t - 1];
        if (Math.abs(p.predicted_rate - (b.intercept + b.time * r.t + b.difficulty * r.difficulty)) > 1e-10) throw new Error('Frozen coefficients differ from original predictions');
      });
      var mae = held.observations.reduce(function (sum, p) { return sum + Math.abs(p.actual_rate - p.predicted_rate) * 150; }, 0) / 4;
      if (Math.abs(mae - held.mae_points_150) > 1e-8) throw new Error('Holdout metric mismatch');
      var comparison = original.difficulty_comparison;
      if (!comparison || !['G_intercept_points', 'G_slope_points_per_unit_d', 'formal_maximizer', 'supported_interval_maximizer'].every(function (key) { return Number.isFinite(comparison[key]); })) throw new Error('Invalid margin results');
      controls.hidden = false; fallback.hidden = true; status.hidden = true;
      player.setReady(true); followCandidateLink();
    }).catch(function () {
      original = null; review = null;
      local(status, ['模型结果未能加载：保留原始成绩图和完整静态步骤，不显示未核对的预测。', 'Model results could not be loaded. Original observations and all static steps remain; no unchecked forecasts are shown.']);
      status.hidden = false; player.setReady(false);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window === 'undefined' ? globalThis : window);

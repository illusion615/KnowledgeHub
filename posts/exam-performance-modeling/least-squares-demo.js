/* One-parameter least-squares illustration, not a fit of the full 24-exam model. */
(function () {
  'use strict';
  function calculate(c) {
    if (!Number.isFinite(c)) throw new Error('C must be finite');
    var errors = [80 - c, 78 - c];
    var squares = errors.map(function (e) { return e * e; });
    return { c: c, errors: errors, squares: squares, total: squares[0] + squares[1] };
  }
  var scoreY = function (score) { return 430 - (score - 76) / 6 * 300; };
  var lossX = function (c) { return 580 + (c - 76) / 6 * 360; };
  var lossY = function (loss) { return 430 - loss / 22 * 300; };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculate: calculate, scoreY: scoreY, lossX: lossX, lossY: lossY };
    return;
  }
  function init() {
    var figure = document.getElementById('least-squares-demo');
    if (!figure) return;
    var svg = figure.querySelector('svg');
    var input = figure.querySelector('input');
    var buttons = Array.from(figure.querySelectorAll('[data-ls-c]'));
    function english() { return document.documentElement.lang.indexOf('en') === 0; }
    function text(pair) { return pair[english() ? 1 : 0]; }
    function el(tag, attrs, labels) {
      var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      if (labels) {
        node.setAttribute('data-zh', labels[0]); node.setAttribute('data-en', labels[1]);
        node.textContent = text(labels);
      }
      return node;
    }
    svg.appendChild(el('text', { x: 70, y: 30 }, ['① 共同估计与两次偏差', '1. One Estimate, Two Errors']));
    svg.appendChild(el('text', { x: 580, y: 30 }, ['② 比较误差平方和', '2. Compare Squared-Error Sums']));
    svg.appendChild(el('circle', { cx: 80, cy: 65, r: 5, class: 'ls-observed' }));
    svg.appendChild(el('text', { x: 96, y: 71 }, ['实际分数', 'Observed']));
    svg.appendChild(el('line', { x1: 250, x2: 280, y1: 65, y2: 65, class: 'ls-estimate-line' }));
    svg.appendChild(el('text', { x: 290, y: 71 }, ['共同估计 C', 'Estimate C']));
    svg.appendChild(el('text', { x: 580, y: 71 }, ['曲线：J(C)=(80−C)²+(78−C)²', 'Curve: J(C)=(80−C)²+(78−C)²']));
    svg.appendChild(el('text', { x: 70, y: 110 }, ['分数', 'Score / Points']));
    svg.appendChild(el('text', { x: 580, y: 110 }, ['平方和 J（分²）', 'Squared Sum J (Points²)']));
    for (var score = 76; score <= 82; score++) {
      svg.appendChild(el('line', { x1: 70, x2: 430, y1: scoreY(score), y2: scoreY(score), class: 'chart-grid' }));
      svg.appendChild(el('text', { x: 55, y: scoreY(score) + 5, 'text-anchor': 'end' }, [String(score), String(score)]));
      svg.appendChild(el('text', { x: lossX(score), y: 459, 'text-anchor': 'middle' }, [String(score), String(score)]));
    }
    [0, 5, 10, 15, 20].forEach(function (value) {
      svg.appendChild(el('line', { x1: 580, x2: 940, y1: lossY(value), y2: lossY(value), class: 'chart-grid' }));
      svg.appendChild(el('text', { x: 565, y: lossY(value) + 5, 'text-anchor': 'end' }, [String(value), String(value)]));
    });
    svg.appendChild(el('path', { d: 'M70 130V430H430 M580 130V430H940', class: 'chart-axis' }));
    svg.appendChild(el('text', { x: 160, y: 459, 'text-anchor': 'middle' }, ['第1次：80分', 'Exam 1: 80']));
    svg.appendChild(el('text', { x: 340, y: 459, 'text-anchor': 'middle' }, ['第2次：78分', 'Exam 2: 78']));
    svg.appendChild(el('text', { x: 940, y: 503, 'text-anchor': 'end' }, ['候选参数 C（分）', 'Candidate C / Points']));
    svg.appendChild(el('text', { x: 70, y: 503 }, ['竖线长度表示偏差大小', 'Vertical Length = Error Magnitude']));
    var estimateLine = el('line', { x1: 70, x2: 430, class: 'ls-estimate-line' });
    svg.appendChild(estimateLine);
    var residuals = [], estimates = [];
    [80, 78].forEach(function (actual, index) {
      var x = index ? 340 : 160;
      var residual = el('line', { x1: x, x2: x, y1: scoreY(actual), class: 'ls-residual', 'data-ls-residual': index });
      residuals.push(residual); svg.appendChild(residual);
      var estimate = el('rect', { x: x - 6, width: 12, height: 12, class: 'ls-estimated-point', 'data-ls-estimate': index });
      estimates.push(estimate); svg.appendChild(estimate);
      svg.appendChild(el('circle', { cx: x, cy: scoreY(actual), r: 5, class: 'ls-observed', 'data-ls-observed': actual }));
    });
    var path = '';
    for (var i = 0; i <= 120; i++) {
      var c = 76 + i / 20;
      path += (i ? 'L' : 'M') + lossX(c).toFixed(6) + ' ' + lossY(calculate(c).total).toFixed(6);
    }
    svg.appendChild(el('path', { d: path, class: 'ls-loss-curve', id: 'least-squares-loss-curve' }));
    svg.appendChild(el('circle', { cx: lossX(79), cy: lossY(2), r: 5, class: 'ls-minimum', 'data-ls-minimum': 'true' }));
    var cursor = el('circle', { r: 9, class: 'ls-loss-cursor', 'data-ls-cursor': 'true' });
    svg.appendChild(cursor);
    var signed = function (v) { return Math.abs(v) < 1e-10 ? '0.0' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1); };
    function render() {
      var result = calculate(Number(input.value));
      figure.dataset.lsC = result.c.toFixed(1);
      figure.querySelector('[data-ls-value]').textContent = result.c.toFixed(1);
      result.errors.forEach(function (error, index) {
        figure.querySelector('[data-ls-error="' + index + '"]').textContent = signed(error);
        figure.querySelector('[data-ls-square="' + index + '"]').textContent = result.squares[index].toFixed(2);
        residuals[index].setAttribute('y2', scoreY(result.c));
        estimates[index].setAttribute('y', scoreY(result.c) - 6);
      });
      figure.querySelector('[data-ls-total]').textContent = result.total.toFixed(2);
      estimateLine.setAttribute('y1', scoreY(result.c)); estimateLine.setAttribute('y2', scoreY(result.c));
      cursor.setAttribute('cx', lossX(result.c)); cursor.setAttribute('cy', lossY(result.total));
      cursor.setAttribute('data-c', result.c); cursor.setAttribute('data-loss', result.total);
      buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(Math.abs(Number(button.dataset.lsC) - result.c) < 1e-9)); });
      input.setAttribute('aria-valuetext', text(['共同估计分数' + result.c.toFixed(1), 'Common score estimate ' + result.c.toFixed(1)]));
      figure.querySelector('.ls-explanation').textContent = text(Math.abs(result.c - 79) < 1e-9
        ? ['C=79时，两次误差为+1和−1；平方后都是1，总和为2，达到最小值。正负误差相加为0，并不表示两次都预测正确。', 'At C=79, the errors are +1 and −1. Each square is 1, so the total reaches its minimum of 2. Signed errors sum to zero, but neither estimate is exact.']
        : ['当前误差平方和为' + result.total.toFixed(2) + '，比最小值2大' + (result.total - 2).toFixed(2) + '。把C向79移动，观察两条偏差线和右图位置如何变化。', 'The current squared-error sum is ' + result.total.toFixed(2) + ', which is ' + (result.total - 2).toFixed(2) + ' above the minimum of 2. Move C toward 79 to compare the two errors and the position on the loss curve.']);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () { input.value = button.dataset.lsC; render(); });
    });
    input.addEventListener('input', render);
    document.addEventListener('langChanged', render);
    figure.querySelector('.ls-controls').hidden = false;
    figure.dataset.lsReady = 'true';
    render();
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();

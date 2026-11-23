// posts/markdown-genesis-lab/genesis-sandbox.js
// Pure static client-side interactive canvas simulation mounted into `:::sandbox` slot.
// Zero backend dependencies — runs 100% on GitHub Pages static hosting.

(function () {
  'use strict';

  function mountGenesisSandbox() {
    var slot = document.getElementById('genesis-wave-sandbox');
    if (!slot) return;

    var controls = slot.querySelector('[data-sandbox-controls="genesis-wave-sandbox"]');
    var stage = slot.querySelector('[data-sandbox-stage="genesis-wave-sandbox"]');
    var canvas = document.getElementById('genesis-wave-sandbox-canvas');
    if (!canvas || !stage) return;

    var freq = 2;
    var damping = 0.35;

    if (controls) {
      controls.innerHTML = [
        '<div class="genesis-sim-toolbar">',
        '  <button type="button" class="genesis-sim-chip is-active" data-freq="2" data-zh="低频谐波 (k=2)" data-en="Low Harmonic (k=2)">低频谐波 (k=2)</button>',
        '  <button type="button" class="genesis-sim-chip" data-freq="4" data-zh="中频叠加 (k=4)" data-en="Mid Harmonic (k=4)">中频叠加 (k=4)</button>',
        '  <button type="button" class="genesis-sim-chip" data-freq="7" data-zh="高频包络 (k=7)" data-en="High Harmonic (k=7)">高频包络 (k=7)</button>',
        '</div>'
      ].join('\n');
    }

    var readout = document.createElement('div');
    readout.className = 'genesis-sim-readout';
    readout.innerHTML = '<span id="genesis-sim-formula">f(x) = exp(-0.35x) · cos(2π·2x)</span><span data-zh="状态：纯静态 Canvas 渲染就绪" data-en="Status: Pure Static Canvas Ready">状态：纯静态 Canvas 渲染就绪</span>';
    stage.appendChild(readout);

    function drawWave() {
      var ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) return;
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Baseline grid
      ctx.strokeStyle = 'rgba(13, 143, 140, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, h / 2);
      ctx.lineTo(w - 24, h / 2);
      ctx.stroke();

      // Envelope curve
      ctx.strokeStyle = 'rgba(255, 122, 0, 0.45)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      var x, normX, envY;
      for (x = 24; x <= w - 24; x += 2) {
        normX = (x - 24) / (w - 48);
        envY = (h / 2) - Math.exp(-damping * normX * 4) * (h * 0.36);
        if (x === 24) ctx.moveTo(x, envY);
        else ctx.lineTo(x, envY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Harmonic wave
      ctx.strokeStyle = '#0d8f8c';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (x = 24; x <= w - 24; x += 2) {
        normX = (x - 24) / (w - 48);
        var amp = Math.exp(-damping * normX * 4) * Math.cos(2 * Math.PI * freq * normX);
        var y = (h / 2) - amp * (h * 0.36);
        if (x === 24) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      var formulaEl = document.getElementById('genesis-sim-formula');
      if (formulaEl) {
        formulaEl.textContent = 'f(x) = exp(-' + damping.toFixed(2) + '·4x) · cos(2π·' + freq + 'x)';
      }
    }

    if (controls) {
      var buttons = controls.querySelectorAll('[data-freq]');
      for (var i = 0; i < buttons.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            freq = Number(btn.getAttribute('data-freq')) || 2;
            for (var j = 0; j < buttons.length; j++) {
              buttons[j].classList.remove('is-active');
            }
            btn.classList.add('is-active');
            drawWave();
          });
        })(buttons[i]);
      }
    }

    drawWave();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGenesisSandbox);
  } else {
    mountGenesisSandbox();
  }
})();

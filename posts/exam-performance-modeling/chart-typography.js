/* Keep this article's SVG text at the prose's 1rem in screen CSS pixels. */
(function () {
  'use strict';

  const charts = Array.from(document.querySelectorAll('.exam-figure svg'));
  if (!charts.length) return;

  const previousScales = new WeakMap();
  function update(svg) {
    // Includes the viewBox's preserveAspectRatio scaling (and its pixel rounding).
    // All text in these charts is unscaled within the SVG, including translated groups.
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const scale = Math.hypot(matrix.c, matrix.d);
    if (!Number.isFinite(scale) || scale <= 0) return;
    if (Math.abs(scale - (previousScales.get(svg) || 0)) < 0.000001) return;
    previousScales.set(svg, scale);
    svg.style.setProperty('--exam-chart-scale', String(scale));
  }

  function updateAll() { charts.forEach(update); }
  // Run immediately at the article footer, without hiding text or waiting a frame.
  updateAll();
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => update(entry.target));
    });
    charts.forEach(svg => observer.observe(svg));
  }
  // Also provides a viewport-resize fallback without ResizeObserver.
  window.addEventListener('resize', updateAll, { passive: true });
  // Only a font custom property is written: SVG dimensions stay viewBox-driven,
  // so the observer cannot recursively resize the chart. CSS rem handles text zoom.
})();

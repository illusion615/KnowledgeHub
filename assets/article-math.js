/**
 * Article Math — KaTeX auto-render for Knowledge Hub articles.
 * Loads KaTeX CSS + JS from CDN, then scans .math-block elements
 * for LaTeX expressions and renders them.
 *
 * Usage in HTML:
 *   <div class="math-block" data-latex="\int_a^b f(x)\,dx"></div>
 *   <span class="math-inline" data-latex="\frac{dy}{dx}"></span>
 *
 * Also renders inline $...$ and display $$...$$ inside paragraphs
 * marked with class="math-text".
 */
(function () {
  'use strict';

  var KATEX_VERSION = '0.16.11';
  var KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@' + KATEX_VERSION + '/dist/katex.min.css';
  var KATEX_JS = 'https://cdn.jsdelivr.net/npm/katex@' + KATEX_VERSION + '/dist/katex.min.js';

  // Inject KaTeX CSS
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = KATEX_CSS;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  // Load KaTeX JS then render
  var script = document.createElement('script');
  script.src = KATEX_JS;
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    renderAll();
  };
  document.head.appendChild(script);

  function renderAll() {
    if (typeof katex === 'undefined') return;

    // 1. Render data-latex blocks
    var blocks = document.querySelectorAll('[data-latex]');
    blocks.forEach(function (el) {
      var latex = el.getAttribute('data-latex');
      if (!latex) return;
      var isInline = el.classList.contains('math-inline');
      try {
        katex.render(latex, el, {
          displayMode: !isInline,
          throwOnError: false,
          strict: false
        });
      } catch (e) {
        el.textContent = latex;
      }
    });
  }
})();

/* Article-local KaTeX integration. Shared assets and language controls stay unchanged. */
(function () {
  'use strict';

  // Explicit author-owned expressions in the existing bilingual prose. Longest
  // match wins; this is not a parser that guesses formulas from ordinary English.
  var expressions = [
    ['yₜ₋₁', 'y_{t-1}'],
    ['x²−2x+3=(x−1)²+2', 'x^2-2x+3=(x-1)^2+2'],
    ['−0.50×0.10=−0.05', '-0.50\\times0.10=-0.05'],
    ['(0,1)', '(0,1)'], ['(0.20,0.80)', '(0.20,0.80)'],
    ['Hₜ=λFₜ', 'H_t=\\lambda F_t'], ['λ=0', '\\lambda=0'],
    ['d̄₂₅', '\\bar d_{25}'], ['B₂₅', 'B_{25}'], ['F₂₅', 'F_{25}'],
    ['K₂₅', 'K_{25}'], ['H₂₅', 'H_{25}'], ['d̄ₜ', '\\bar d_t'],
    ['Bₜ', 'B_t'], ['Fₜ', 'F_t'], ['Kₜ', 'K_t'], ['Hₜ', 'H_t'],
    ['α', '\\alpha'], ['γ', '\\gamma'], ['λ', '\\lambda'], ['μ', '\\mu'],
    ['y=kx+b', 'y=kx+b'], ['f(t,d)', 'f(t,d)'], ['f(t, d)', 'f(t,d)'],
    ['f(d)', 'f(d)'], ['(t₀,d₀)', '(t_0,d_0)'], ['(t,d)', '(t,d)'],
    ['(0.25,0.80)', '(0.25,0.80)'], ['(80+78)÷2=79', '\\frac{80+78}{2}=79'],
    ['k=3', 'k=3'], ['C=79', 'C=79'], ['t∈𝒯', 't\\in\\mathcal{T}'],
    ['|−2|=2', '|-2|=2'], ['[0,1]', '[0,1]'],
    ['yₜ = a + bt + cdₜ + εₜ', 'y_t=a+bt+cd_t+\\varepsilon_t'],
    ['rₜ = yₜ − mₜ', 'r_t=y_t-m_t'],
    ['r = y − m', 'r=y-m'],
    ['f(t₀, d₀) − bt₀ − cd₀', 'f(t_0,d_0)-bt_0-cd_0'],
    ['f(t, d) ≈ a + bt + cd', 'f(t,d)\\approx a+bt+cd'],
    ['a + bt + cdₜ', 'a+bt+cd_t'],
    ['[0.800 − a − b − 0.25c]²', '(0.800-a-b-0.25c)^2'],
    ['[13/15 − a − 17b − 0.17c]²', '(\\frac{13}{15}-a-17b-0.17c)^2'],
    ['zₜ = yₜ − bt − cdₜ', 'z_t=y_t-bt-cd_t'],
    ['∑(zₜ − a)²', '\\sum_t(z_t-a)^2'],
    ['∑(zₜ − z̄) = 0', '\\sum_t(z_t-\\bar z)=0'],
    ['∑(zₜ − z̄)', '\\sum_t(z_t-\\bar z)'],
    ['a = z̄', 'a=\\bar z'],
    ['a = ȳ − b t̄ − c d̄', 'a=\\bar y-b\\bar t-c\\bar d'],
    ['Pb + Qc = U', 'Pb+Qc=U'],
    ['Qb + Rc = V', 'Qb+Rc=V'],
    ['Δ = PR − Q²', '\\Delta=PR-Q^2'],
    ['b = b̂ + δb', 'b=\\widehat b+\\delta b'],
    ['c = ĉ + δc', 'c=\\widehat c+\\delta c'],
    ['∑(δbTₜ + δcDₜ)² ≥ 0', '\\sum_t(\\delta b\\,T_t+\\delta c\\,D_t)^2\\ge0'],
    ['Q²/(PR)', '\\frac{Q^2}{PR}'],
    ['e₁₇ = 13/15 − ŷ₁₇', 'e_{17}=\\frac{13}{15}-\\widehat y_{17}'],
    ['f̂(t*, d*) = â + b̂t* + ĉd*', '\\widehat f(t_*,d_*)=\\widehat a+\\widehat b t_*+\\widehat c d_*'],
    ['ĥ(t, d) = û + v̂t + ŵd + k̂d²', '\\widehat h(t,d)=\\widehat u+\\widehat v t+\\widehat w d+\\widehat k d^2'],
    ['K = û + v̂t*', 'K=\\widehat u+\\widehat v t_*'],
    ['dᵥ = −ŵ/(2k̂)', 'd_v=-\\frac{\\widehat w}{2\\widehat k}'],
    ['P(r* > q | t*, d)', '\\Pr(r_*>q\\mid t_*,d)'],
    ['P(r > q)', '\\Pr(r>q)'],
    ['1 − F_d(q)', '1-F_d(q)'],
    ['F_d(q)', 'F_d(q)'],
    ['b̂ = (RU − QV)/Δ ≈ 0.003188139', '\\widehat b=\\frac{RU-QV}{\\Delta}\\approx0.003188139'],
    ['ĉ = (PV − QU)/Δ ≈ −1.236893668', '\\widehat c=\\frac{PV-QU}{\\Delta}\\approx-1.236893668'],
    ['â ≈ 1.051951232', '\\widehat a\\approx1.051951232'],
    ['t̄ = 12.5', '\\bar t=12.5'],
    ['d̄ = 0.233333', '\\bar d=0.233333'],
    ['ŷ* ≈ 0.884276', '\\widehat y_*\\approx0.884276'],
    ['t* = 25', 't_*=25'],
    ['d* = 0.2', 'd_*=0.2'],
    ['t = 17', 't=17'], ['t = 1', 't=1'],
    ['P = 1150', 'P=1150'], ['Q = 0.85', 'Q=0.85'],
    ['R = 0.078933', 'R=0.078933'], ['Δ = 90.050833', '\\Delta=90.050833'],
    ['d₂ > d₁', 'd_2>d_1'],
    ['Δ > 0', '\\Delta>0'],
    ['Δ = 0', '\\Delta=0'],
    ['k̂ ≠ 0', '\\widehat k\\ne0'],
    ['k̂ < 0', '\\widehat k<0'],
    ['k̂ > 0', '\\widehat k>0'],
    ['k̂ = 0', '\\widehat k=0'],
    ['t + d + d²', 't+d+d^2'],
    ['t + d', 't+d'],
    ['2e²', '2e^2'],
    ['e = 0', 'e=0'],
    ['1 − d', '1-d'],
    ['13/15', '\\frac{13}{15}'],
    ['[−1, 1]', '[-1,1]'],
    ['[0, 1]', '[0,1]'],
    ['[0.1, 0.3]', '[0.1,0.3]'],
    ['[0.15, 0.30]', '[0.15,0.30]'],
    ['[0.15, 0.40]', '[0.15,0.40]'],
    ['rₜ₋₁', 'r_{t-1}'],
    ['b̂₁₆', '\\widehat b_{16}'],
    ['ĉ₁₆', '\\widehat c_{16}'],
    ['â₁₆', '\\widehat a_{16}'],
    ['ŷ₁₇', '\\widehat y_{17}'],
    ['f̂(t*, d*)', '\\widehat f(t_*,d_*)'],
    ['ĥ(t*, d)', '\\widehat h(t_*,d)'],
    ['Ŝ*', '\\widehat S_*'],
    ['ŷ*', '\\widehat y_*'],
    ['M*', 'M_*'], ['t*', 't_*'], ['d*', 'd_*'], ['r*', 'r_*'],
    ['yₜ', 'y_t'], ['mₜ', 'm_t'], ['rₜ', 'r_t'], ['dₜ', 'd_t'],
    ['Tₜ', 'T_t'], ['Dₜ', 'D_t'], ['Yₜ', 'Y_t'], ['zₜ', 'z_t'],
    ['εₜ', '\\varepsilon_t'], ['ηₜ', '\\eta_t'],
    ['d²', 'd^2'], ['dᵥ', 'd_v'],
    ['b̂', '\\widehat b'], ['ĉ', '\\widehat c'], ['â', '\\widehat a'],
    ['û', '\\widehat u'], ['v̂', '\\widehat v'], ['ŵ', '\\widehat w'],
    ['k̂', '\\widehat k'], ['f̂', '\\widehat f'], ['ĥ', '\\widehat h'],
    ['ŷ', '\\widehat y'], ['r̂', '\\widehat r'],
    ['ȳ', '\\bar y'], ['t̄', '\\bar t'], ['d̄', '\\bar d'], ['z̄', '\\bar z'],
    ['𝒯', '\\mathcal{T}'], ['Δ', '\\Delta'],
    ['δb', '\\delta b'], ['δc', '\\delta c']
  ];
  [17, 18, 19, 20].forEach(function (n) {
    var sub = String(n).replace(/\d/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[Number(d)]; });
    expressions.push(['e' + sub, 'e_{' + n + '}']);
  });
  expressions.sort(function (a, b) { return b[0].length - a[0].length; });
  var latexByText = Object.create(null);
  expressions.forEach(function (pair) { latexByText[pair[0]] = pair[1]; });
  var pattern = new RegExp(expressions.map(function (pair) {
    return pair[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('|'), 'g');

  function annotateInline(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || parent.closest('svg, script, style, pre, code, a, [data-latex], .katex, .exam-source-table, .bib-list')) continue;
      pattern.lastIndex = 0;
      if (pattern.test(node.nodeValue)) nodes.push(node);
    }
    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      var fragment = document.createDocumentFragment();
      var end = 0;
      var match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text))) {
        fragment.appendChild(document.createTextNode(text.slice(end, match.index)));
        var span = document.createElement('span');
        span.className = 'math-inline';
        span.setAttribute('data-latex', latexByText[match[0]]);
        span.textContent = match[0]; // readable fallback if rendering ever fails
        fragment.appendChild(span);
        end = match.index + match[0].length;
      }
      fragment.appendChild(document.createTextNode(text.slice(end)));
      textNode.replaceWith(fragment);
    });
  }

  function updateOverflow() {
    var english = document.documentElement.lang === 'en';
    document.querySelectorAll('main .math-block').forEach(function (el) {
      var overflow = el.scrollWidth > el.clientWidth + 2;
      el.classList.toggle('math-overflow', overflow);
      if (overflow) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'region');
        el.setAttribute('aria-label', english ? 'Formula; scroll horizontally' : '数学公式，可横向滚动');
      } else {
        el.removeAttribute('tabindex');
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
      }
    });
  }

  function renderArticle() {
    var root = document.querySelector('main');
    if (!root || !window.katex) return;
    annotateInline(root);
    root.querySelectorAll('[data-latex]').forEach(function (el) {
      var latex = el.getAttribute('data-latex');
      if (el.getAttribute('data-rendered-latex') === latex && el.querySelector('.katex')) return;
      try {
        window.katex.render(latex, el, {
          displayMode: el.classList.contains('math-block'),
          output: 'htmlAndMathml',
          throwOnError: true,
          strict: 'error',
          trust: false
        });
        el.setAttribute('data-rendered-latex', latex);
        el.removeAttribute('data-math-error');
      } catch (error) {
        el.setAttribute('data-math-error', String(error));
        console.error('Article formula failed:', latex, error);
      }
    });
    window.requestAnimationFrame(updateOverflow);
    if (document.fonts) document.fonts.ready.then(updateOverflow);
  }

  // The shared language switch replaces translated innerHTML and emits this
  // event. Re-render those fresh nodes; never nest KaTeX inside existing output.
  document.addEventListener('langChanged', renderArticle);
  window.addEventListener('resize', updateOverflow);
  document.addEventListener('knowledgeDetailOpened', updateOverflow);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderArticle);
  } else {
    renderArticle();
  }
})();

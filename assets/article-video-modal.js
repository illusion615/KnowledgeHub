/* Article In-Page Video Studio Modal Bridge (Lazy-loaded on first click) */
(function (root) {
  'use strict';

  var modalOverlay = null;
  var modalIframe = null;
  var currentSlug = '';
  var savedOverflow = '';
  var savedScrollY = 0;

  function ensureStyles() {
    if (document.getElementById('kh-video-modal-style')) return;
    var style = document.createElement('style');
    style.id = 'kh-video-modal-style';
    style.textContent = [
      '.kh-video-modal-backdrop {',
      '  position: fixed; inset: 0; z-index: 9998;',
      '  display: flex; align-items: center; justify-content: center;',
      '  padding: clamp(8px, 1.8vw, 22px);',
      '  background: rgba(12, 16, 23, 0.72);',
      '  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);',
      '  opacity: 0; pointer-events: none;',
      '  transition: opacity 0.22s ease;',
      '}',
      '.kh-video-modal-backdrop.is-open {',
      '  opacity: 1; pointer-events: auto;',
      '}',
      '.kh-video-modal-shell {',
      '  position: relative; width: min(1580px, 96vw); height: min(960px, 94dvh);',
      '  border-radius: 18px; overflow: hidden;',
      '  background: var(--panel, #1e2430);',
      '  border: 1px solid rgba(255, 255, 255, 0.16);',
      '  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);',
      '  display: flex; flex-direction: column;',
      '  transform: translateY(10px) scale(0.985);',
      '  transition: transform 0.22s ease;',
      '}',
      '.kh-video-modal-backdrop.is-open .kh-video-modal-shell {',
      '  transform: translateY(0) scale(1);',
      '}',
      '.kh-video-modal-frame {',
      '  flex: 1; width: 100%; height: 100%; border: 0; display: block; background: transparent;',
      '}',
      '@media (max-width: 760px) {',
      '  .kh-video-modal-backdrop { padding: 0; }',
      '  .kh-video-modal-shell { width: 100vw; height: 100dvh; border-radius: 0; border: 0; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function extractArticleDomSource(slug) {
    var h1 = document.querySelector('h1');
    var title = h1 ? (h1.getAttribute('data-zh') || h1.textContent || '').trim() : (document.title || slug);
    var anchors = [];
    var sections = [];
    var textParts = [title];

    var heroP = document.querySelector('.hero-copy p');
    var lead = heroP ? (heroP.getAttribute('data-zh') || heroP.textContent || '').trim() : '';
    if (lead) textParts.push(lead);

    var secNodes = document.querySelectorAll('main section[id], section.section[id]');
    Array.prototype.forEach.call(secNodes, function (sec) {
      var id = sec.getAttribute('id');
      if (!id || id === 'references') return;
      anchors.push(id);
      var h2 = sec.querySelector('h2');
      var secTitle = h2 ? (h2.getAttribute('data-zh') || h2.textContent || '').trim() : id;
      var bodyLines = [];
      var paras = sec.querySelectorAll('p, h3, h4, li');
      Array.prototype.forEach.call(paras, function (node) {
        if (bodyLines.length >= 6) return;
        var line = (node.getAttribute('data-zh') || node.textContent || '').replace(/\s+/g, ' ').trim();
        if (line && line.length >= 8 && bodyLines.indexOf(line) === -1) {
          bodyLines.push(line);
        }
      });
      var joined = bodyLines.join('。');
      textParts.push(secTitle + '\n' + joined);
      sections.push({
        id: id,
        title: secTitle,
        body: joined || secTitle,
        hasCompare: Boolean(sec.querySelector('.comparison-grid, .compare-table-wrap, table')) || /对比|vs|区别/i.test(joined),
        hasSteps: Boolean(sec.querySelector('.timeline-list, .flow-step, ol')) || /步骤|阶段|流程/i.test(joined),
        hasMetric: Boolean(sec.querySelector('.metric, .dash-num-value')) || /\d+(?:\.\d+)?\s*(%|倍|ms|秒|类|项)/.test(joined)
      });
    });

    if (!anchors.length) anchors.push('overview');
    return {
      slug: slug,
      title: title,
      lead: lead,
      anchors: anchors,
      sections: sections,
      text: textParts.join('\n\n')
    };
  }

  function sendArticleContext() {
    if (!modalIframe || !modalIframe.contentWindow || !currentSlug) return;
    try {
      var source = extractArticleDomSource(currentSlug);
      modalIframe.contentWindow.postMessage({
        type: 'kh-article-context',
        source: source
      }, window.location.origin);
    } catch (err) {
      console.warn('[video-modal] context postMessage skipped:', err);
    }
  }

  function resolveStudioUrl(slug) {
    var theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    var url = new URL('../../video-studio.html', window.location.href);
    url.searchParams.set('article', slug);
    url.searchParams.set('embed', '1');
    url.searchParams.set('autoDraft', '1');
    url.searchParams.set('scoutTheme', theme);
    return url.toString();
  }

  function closeModal() {
    if (!modalOverlay || !modalOverlay.classList.contains('is-open')) return;
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = savedOverflow;
    window.scrollTo(0, savedScrollY);
    var trigger = document.querySelector('[data-video-studio]');
    if (trigger) trigger.focus();
  }

  function ensureModalDom(slug) {
    ensureStyles();
    if (!modalOverlay) {
      modalOverlay = document.getElementById('kh-video-studio-modal') || document.createElement('div');
      modalOverlay.className = 'kh-video-modal-backdrop';
      modalOverlay.id = 'kh-video-studio-modal';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Video Studio' : '视频工作室');
      modalOverlay.setAttribute('aria-hidden', 'true');

      var shell = modalOverlay.querySelector('.kh-video-modal-shell') || document.createElement('div');
      shell.className = 'kh-video-modal-shell';

      modalIframe = modalOverlay.querySelector('#kh-video-studio-iframe') || document.createElement('iframe');
      modalIframe.className = 'kh-video-modal-frame';
      modalIframe.id = 'kh-video-studio-iframe';
      modalIframe.title = 'Video Studio Workspace';
      modalIframe.setAttribute('allow', 'autoplay; clipboard-write');

      modalIframe.addEventListener('load', function () {
        sendArticleContext();
      });

      if (!modalIframe.parentNode) shell.appendChild(modalIframe);
      if (!shell.parentNode) modalOverlay.appendChild(shell);

      modalOverlay.addEventListener('click', function (ev) {
        if (ev.target === modalOverlay) closeModal();
      });

      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
          ev.preventDefault();
          closeModal();
        }
      });

      window.addEventListener('message', function (ev) {
        if (ev.origin !== window.location.origin || !ev.data) return;
        if (ev.data.type === 'kh-studio-close-modal') closeModal();
        if (ev.data.type === 'kh-studio-request-context') sendArticleContext();
      });

      if (!modalOverlay.parentNode) document.body.appendChild(modalOverlay);
    }

    var targetUrl = resolveStudioUrl(slug);
    if (currentSlug !== slug || !modalIframe.getAttribute('src')) {
      currentSlug = slug;
      modalIframe.setAttribute('src', targetUrl);
    }
  }

  function openModal(slug) {
    if (!slug) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    savedOverflow = document.body.style.overflow || '';
    ensureModalDom(slug);
    document.body.style.overflow = 'hidden';
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalOverlay.classList.add('is-open');
  }

  root.KHArticleVideoModal = {
    open: openModal,
    close: closeModal,
    extractArticleDomSource: extractArticleDomSource
  };
}(typeof globalThis === 'object' ? globalThis : this));

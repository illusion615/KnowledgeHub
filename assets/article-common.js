/**
 * article-common.js — Shared initialization for all article pages.
 * Handles: scroll-reveal, nav highlighting, accordion toggle, localStorage sync.
 * Loaded BEFORE article-presentation.js to ensure base behavior is ready.
 */
(function () {
  'use strict';

  // ── Scroll-reveal (load-in + data-reveal) ──
  var revealTargets = document.querySelectorAll('.load-in, [data-reveal]');
  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(function (target) { revealObserver.observe(target); });

  // ── Nav link active highlighting ──
  var sectionTargets = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');

  if (sectionTargets.length && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute('id');
        var matchingLink = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (!matchingLink) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) { link.removeAttribute('aria-current'); });
          matchingLink.setAttribute('aria-current', 'true');
        }
      });
    }, { threshold: 0.4 });

    sectionTargets.forEach(function (section) { navObserver.observe(section); });
  }

  // ── Load-in stagger delay ──
  document.querySelectorAll('.load-in').forEach(function (element, index) {
    element.style.transitionDelay = (index * 120) + 'ms';
  });

  // ── Accordion toggle ──
  var syncAccordionState = function (targetItem, expanded) {
    var targetButton = targetItem.querySelector('.subsection-toggle');
    var targetContent = targetItem.querySelector('.subsection-content');
    if (!targetButton || !targetContent) return;
    targetButton.setAttribute('aria-expanded', String(expanded));
    targetItem.classList.toggle('is-open', expanded);
    targetContent.setAttribute('aria-hidden', String(!expanded));
  };

  document.querySelectorAll('[data-accordion]').forEach(function (item) {
    var button = item.querySelector('.subsection-toggle');
    var content = item.querySelector('.subsection-content');
    if (!button || !content) return;

    syncAccordionState(item, item.classList.contains('is-open'));

    button.addEventListener('click', function () {
      var isExpanded = item.classList.contains('is-open');
      if (!isExpanded) {
        document.querySelectorAll('[data-accordion]').forEach(function (otherItem) {
          if (otherItem === item) return;
          syncAccordionState(otherItem, false);
        });
      }
      syncAccordionState(item, !isExpanded);
    });
  });

  // ── Apply homepage preferences from localStorage ──
  var root = document.documentElement;
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);

  var lang = localStorage.getItem('lang') || 'zh';
  root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
    var val = el.getAttribute('data-' + lang);
    if (val !== null) el.innerHTML = val;
  });

  var savedFont = localStorage.getItem('readingFontFamily');
  if (savedFont) root.style.setProperty('--reading-font', savedFont);
})();

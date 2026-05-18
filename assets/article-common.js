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
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

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

  // ── Mobile nav toggle (event delegation — button may be created later by article-presentation.js) ──
  var navEl = document.querySelector('.nav-links');
  if (navEl) {
    // Create toggle if not yet present (pages without article-presentation.js)
    if (!document.querySelector('.nav-toggle')) {
      var navToggle = document.createElement('button');
      navToggle.className = 'nav-toggle';
      navToggle.setAttribute('aria-label', 'Toggle navigation');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
      navEl.parentNode.insertBefore(navToggle, navEl);
    }

    var closeMobileNav = function () {
      var btn = document.querySelector('.nav-toggle');
      navEl.classList.remove('is-mobile-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    };

    document.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('.nav-toggle');
      if (toggleBtn) {
        e.stopPropagation();
        var isOpen = navEl.classList.toggle('is-mobile-open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        return;
      }
      if (e.target.closest('.nav-links a')) {
        closeMobileNav();
        return;
      }
      if (navEl.classList.contains('is-mobile-open')) {
        if (!navEl.contains(e.target)) {
          closeMobileNav();
        }
      }
    });
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
      var topBefore = button.getBoundingClientRect().top;
      if (!isExpanded) {
        document.querySelectorAll('[data-accordion]').forEach(function (otherItem) {
          if (otherItem === item) return;
          syncAccordionState(otherItem, false);
        });
      }
      syncAccordionState(item, !isExpanded);
      var topAfter = button.getBoundingClientRect().top;
      if (topAfter !== topBefore) {
        window.scrollBy(0, topAfter - topBefore);
      }
    });
  });

  // ── Apply homepage preferences from localStorage ──
  var root = document.documentElement;
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);

  // Apply article style preset
  var stylePreset = localStorage.getItem('article-style') || localStorage.getItem('article-decor') || 'clean';
  // Migrate old decor values
  if (stylePreset === 'minimal') stylePreset = 'clean';
  if (stylePreset === 'rich') stylePreset = 'warm';
  if (stylePreset !== 'clean') root.setAttribute('data-style', stylePreset);

  var lang = localStorage.getItem('lang') || 'zh';
  root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
    var val = el.getAttribute('data-' + lang);
    if (val !== null) el.innerHTML = val;
  });

  var savedFont = localStorage.getItem('readingFontFamily');
  if (savedFont) root.style.setProperty('--reading-font', savedFont);

  // ── Hide home-link when articles are opened in new tab ──
  var openMode = localStorage.getItem('openMode') || 'same';
  if (openMode === 'new') {
    var homeLink = document.querySelector('.home-link');
    if (homeLink) homeLink.style.display = 'none';
  }

  // ── In-place chapter-nav pager (opt-in via data-nav-pager) ──
  // Single nav that never scrolls horizontally: items that don't fit are
  // hidden and replaced with clickable "…" prev/next links. Renders on load,
  // resize, font-load, and a few delayed ticks (covers presentation.js shifts).
  var pagerNav = document.querySelector('nav.nav-links[data-nav-pager]');
  if (pagerNav) {
    var pagerItems = Array.prototype.slice.call(pagerNav.children).filter(function (el) {
      return el.tagName === 'A';
    });
    if (pagerItems.length) {
      var pagerStack = [0];

      var pagerMakeEllipsis = function (label, onClick) {
        var a = document.createElement('a');
        a.href = '#';
        a.className = 'nav-ellipsis';
        a.textContent = '…';
        a.setAttribute('aria-label', label);
        a.addEventListener('click', function (e) {
          e.preventDefault();
          onClick();
        });
        return a;
      };

      var pagerFits = function () {
        return pagerNav.scrollWidth <= pagerNav.clientWidth + 1;
      };

      var pagerRender = function () {
        var start = pagerStack[pagerStack.length - 1];
        while (pagerNav.firstChild) pagerNav.removeChild(pagerNav.firstChild);

        if (start > 0) {
          pagerNav.appendChild(pagerMakeEllipsis('Previous', function () {
            if (pagerStack.length > 1) pagerStack.pop();
            else pagerStack.length = 1;
            pagerRender();
          }));
        }

        var i = start;
        var overflow = false;
        for (; i < pagerItems.length; i++) {
          pagerNav.appendChild(pagerItems[i]);
          if (!pagerFits()) {
            pagerNav.removeChild(pagerItems[i]);
            overflow = true;
            break;
          }
        }

        if (overflow) {
          var fwd = pagerMakeEllipsis('Next', function () {});
          pagerNav.appendChild(fwd);
          var nextStart = i;
          var minChildren = (start > 0 ? 2 : 1) + 1;
          while (!pagerFits() && pagerNav.children.length > minChildren) {
            var trimmed = pagerNav.children[pagerNav.children.length - 2];
            if (!trimmed || trimmed === fwd) break;
            pagerNav.removeChild(trimmed);
            nextStart--;
          }
          if (nextStart < start + 1) nextStart = start + 1;
          var clone = fwd.cloneNode(true);
          fwd.parentNode.replaceChild(clone, fwd);
          clone.addEventListener('click', function (e) {
            e.preventDefault();
            pagerStack.push(nextStart);
            pagerRender();
          });
        }
      };

      var pagerReset = function () {
        pagerStack = [0];
        pagerRender();
      };

      window.addEventListener('resize', pagerReset);
      pagerReset();
      setTimeout(pagerReset, 0);
      setTimeout(pagerReset, 200);
      setTimeout(pagerReset, 600);
      if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(pagerReset);
      }
    }
  }
})();

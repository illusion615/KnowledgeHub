/**
 * article-common.js — Shared initialization for all article pages.
 * Handles: scroll-reveal, nav highlighting, accordion toggle, localStorage sync.
 * Loaded BEFORE article-presentation.js to ensure base behavior is ready.
 */
(function () {
  'use strict';

  // ── Scroll-reveal (load-in + data-reveal) ──
  // Content must remain readable even if IntersectionObserver misses a section
  // during reload, hash navigation, or long-page screenshot capture. The observer
  // adds the animation class when possible; the fallback reveals any remaining
  // targets after initial load so CSS opacity never leaves real content hidden.
  var revealTargets = document.querySelectorAll('.load-in, [data-reveal]');
  var revealAllTargets = function () {
    revealTargets.forEach(function (target) { target.classList.add('is-visible'); });
  };

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (target) { revealObserver.observe(target); });
    window.addEventListener('load', function () { window.setTimeout(revealAllTargets, 300); });
  } else {
    revealAllTargets();
  }

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
  var setAccordionContentHeight = function (content, expanded) {
    if (!content) return;
    if (!expanded) {
      content.style.maxHeight = '0px';
      content.style.overflow = 'hidden';
      return;
    }
    content.style.maxHeight = (content.scrollHeight + 48) + 'px';
    content.style.overflow = 'visible';
  };

  var syncAccordionState = function (targetItem, expanded) {
    var targetButton = targetItem.querySelector('.subsection-toggle');
    var targetContent = targetItem.querySelector('.subsection-content');
    if (!targetButton || !targetContent) return;
    targetButton.setAttribute('aria-expanded', String(expanded));
    targetItem.classList.toggle('is-open', expanded);
    targetContent.setAttribute('aria-hidden', String(!expanded));
    setAccordionContentHeight(targetContent, expanded);
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

  window.addEventListener('resize', function () {
    document.querySelectorAll('[data-accordion].is-open .subsection-content').forEach(function (content) {
      setAccordionContentHeight(content, true);
    });
  });

  // ── Apply homepage preferences from localStorage ──
  var root = document.documentElement;

  // Shared-link state: a copied share URL carries ?lang/?theme/?style so the
  // reader opens in the sharer's selection; seed localStorage so the toggles
  // and the load-time init below stay consistent.
  try {
    var shareParams = new URLSearchParams(window.location.search);
    var pLang = shareParams.get('lang');
    if (pLang === 'zh' || pLang === 'en') localStorage.setItem('lang', pLang);
    var pTheme = shareParams.get('theme');
    if (pTheme === 'dark' || pTheme === 'light') localStorage.setItem('theme', pTheme);
    var pStyle = shareParams.get('style');
    if (pStyle && ['clean', 'warm', 'academic', 'vivid'].indexOf(pStyle) !== -1) localStorage.setItem('article-style', pStyle);
  } catch (e) {}

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
  // Default to 'new' so a directly-shared single-article link (visitor never
  // set openMode on the homepage) renders its header in "new page" mode.
  var openMode = localStorage.getItem('openMode') || 'new';
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

  // ── Inline citation linking (opt-in via [data-cite-links] on <html>/<body>) ──
  // Converts bare [n] / [n][m] citation markers in article prose into compact,
  // clickable superscripts that jump to the matching reference (#ref-n) and show
  // the source title on hover. References are auto-anchored from their [n] bib-id,
  // so no per-article markup is required. Runs after the initial i18n swap and
  // re-runs on langChanged (the innerHTML swap restores raw [n] text each time).
  var citeEscAttr = function (s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  var citeAnchor = function (num, label, title, targetId) {
    if (!targetId) return '<span class="cite-nolink">' + label + '</span>';
    return '<a href="#' + targetId + '" class="cite-link" data-ref="' + num +
      '" title="' + citeEscAttr(title) + '">' + label + '</a>';
  };

  var citeBuildSup = function (nums, titles, refMap) {
    // Split the cluster into consecutive runs; runs of 3+ collapse to "a–b"
    // (linked to the first source), shorter runs list each number individually.
    var groups = [];
    var i = 0;
    while (i < nums.length) {
      var start = i;
      while (i + 1 < nums.length && nums[i + 1] === nums[i] + 1) i += 1;
      groups.push(nums.slice(start, i + 1));
      i += 1;
    }
    var parts = [];
    groups.forEach(function (g) {
      if (g.length >= 3) {
        var a = g[0];
        var b = g[g.length - 1];
        parts.push(citeAnchor(a, a + '\u2013' + b, 'Sources [' + a + ']\u2013[' + b + ']', refMap[a]));
      } else {
        g.forEach(function (n) {
          parts.push(citeAnchor(n, String(n), titles[n] || ('Reference [' + n + ']'), refMap[n]));
        });
      }
    });
    return '<sup class="cite">' + parts.join('<span class="cite-sep">,</span>') + '</sup>';
  };

  var applyCitationLinks = function () {
    // Opt-out escape hatch; otherwise auto-enabled for any article that has a
    // bibliography (.bib-list). Articles without references are left untouched.
    if (document.documentElement.hasAttribute('data-no-cite') ||
        (document.body && document.body.hasAttribute('data-no-cite'))) return;
    var scope = document.querySelector('.page-shell') || document.body;
    if (!scope) return;

    // 1) Auto-anchor references and collect source titles + real anchor ids.
    //    Keys are normalized to integers so inline [1] matches a [01] bib-id,
    //    and refMap points to each reference's actual id (possibly pre-authored).
    var titles = {};
    var refMap = {};
    var bibItems = document.querySelectorAll('.bib-list li');
    if (!bibItems.length) return;
    Array.prototype.forEach.call(bibItems, function (li) {
      var idSpan = li.querySelector('.bib-id');
      if (!idSpan) return;
      var m = (idSpan.textContent || '').match(/\d+/);
      if (!m) return;
      var num = parseInt(m[0], 10);
      if (!li.id) li.id = 'ref-' + num;
      refMap[num] = li.id;
      var author = li.querySelector('.bib-author');
      titles[num] = author ? (author.textContent || '').replace(/\s+/g, ' ').trim() : '';
    });

    // 2) Linkify [n] clusters in prose, skipping refs/links/code/existing cites.
    var SKIP = { A: 1, CODE: 1, PRE: 1, SCRIPT: 1, STYLE: 1, SUP: 1, BUTTON: 1 };
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf('[') === -1) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        while (p && p !== scope) {
          if (p.nodeType === 1) {
            if (SKIP[p.tagName]) return NodeFilter.FILTER_REJECT;
            if (p.id === 'references') return NodeFilter.FILTER_REJECT;
            if (p.classList && p.classList.contains('bib-list')) return NodeFilter.FILTER_REJECT;
            if (typeof p.className === 'string' && p.className.indexOf('present-page') !== -1) return NodeFilter.FILTER_REJECT;
          }
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var targets = [];
    var walked;
    while ((walked = walker.nextNode())) targets.push(walked);

    var clusterRe = /(?:\[\d{1,3}\])+/g;
    targets.forEach(function (textNode) {
      var text = textNode.nodeValue;
      clusterRe.lastIndex = 0;
      if (!clusterRe.test(text)) return;
      clusterRe.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0;
      var match;
      while ((match = clusterRe.exec(text))) {
        if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        var nums = [];
        var numRe = /\d{1,3}/g;
        var nm;
        while ((nm = numRe.exec(match[0]))) {
          var v = parseInt(nm[0], 10);
          if (nums.indexOf(v) === -1) nums.push(v);
        }
        nums.sort(function (a, b) { return a - b; });
        var allHaveRef = nums.length && nums.every(function (v) { return refMap.hasOwnProperty(v); });
        if (allHaveRef) {
          var holder = document.createElement('span');
          holder.innerHTML = citeBuildSup(nums, titles, refMap);
          while (holder.firstChild) frag.appendChild(holder.firstChild);
        } else {
          frag.appendChild(document.createTextNode(match[0]));
        }
        last = match.index + match[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });

    // 3) Upgrade pre-authored citation anchors (<a href="#ref-n">[n]</a>) to the
    //    same superscript style, so hand-linked articles match the auto-linked
    //    ones. Idempotent: anchors we already own carry .cite-link and are skipped.
    var anchors = scope.querySelectorAll('a[href^="#ref-"]');
    Array.prototype.forEach.call(anchors, function (a) {
      if (a.classList.contains('cite-link')) return;
      var pa = a.parentNode;
      while (pa && pa !== scope) {
        if (pa.nodeType === 1) {
          if (pa.id === 'references') return;
          if (pa.classList && pa.classList.contains('bib-list')) return;
          if (typeof pa.className === 'string' && pa.className.indexOf('present-page') !== -1) return;
        }
        pa = pa.parentNode;
      }
      var mm = (a.textContent || '').trim().match(/^\[?(\d{1,3})\]?$/);
      if (!mm) return;
      var num = parseInt(mm[1], 10);
      a.textContent = String(num);
      a.classList.add('cite-link');
      a.setAttribute('data-ref', num);
      if (!a.getAttribute('title') && titles.hasOwnProperty(num)) a.setAttribute('title', titles[num]);
      var prev = a.previousSibling;
      if (prev && prev.nodeType === 1 && prev.tagName === 'SUP' && prev.classList.contains('cite')) {
        var sep = document.createElement('span');
        sep.className = 'cite-sep';
        sep.textContent = ',';
        prev.appendChild(sep);
        prev.appendChild(a);
      } else {
        var q = a.parentNode;
        var inSup = null;
        while (q && q !== scope) { if (q.tagName === 'SUP') { inSup = q; break; } q = q.parentNode; }
        if (inSup) {
          inSup.classList.add('cite');
        } else {
          var sup = document.createElement('sup');
          sup.className = 'cite';
          a.parentNode.insertBefore(sup, a);
          sup.appendChild(a);
        }
      }
    });
  };

  var citeScrollTo = function (id) {
    var target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var prev = document.querySelector('.bib-list li.bib-hit');
    if (prev) prev.classList.remove('bib-hit');
    void target.offsetWidth;
    target.classList.add('bib-hit');
    if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + id);
    return true;
  };

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document && !(el.tagName === 'A' && typeof el.className === 'string' && el.className.indexOf('cite-link') !== -1)) {
      el = el.parentNode;
    }
    if (!el || el === document) return;
    var href = el.getAttribute('href') || '';
    var id = href.charAt(0) === '#' ? href.slice(1) : '';
    if (id && citeScrollTo(id)) e.preventDefault();
  });

  applyCitationLinks();
  document.addEventListener('langChanged', applyCitationLinks);
})();

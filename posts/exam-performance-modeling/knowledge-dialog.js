/* Article-local reading dialogs. Knowledge and extension cards share one modal;
 * original detail nodes remain the only source, including without JavaScript. */
(function () {
  'use strict';

  function init() {
    var main = document.querySelector('main');
    var section = document.getElementById('math-toolkit');
    var dialog = document.getElementById('knowledge-dialog');
    if (!main || !section || !dialog || typeof dialog.showModal !== 'function') return;
    var content = dialog.querySelector('.knowledge-dialog-content');
    var closeButton = dialog.querySelector('[data-knowledge-close]');
    var toolbarTitle = dialog.querySelector('.knowledge-dialog-toolbar > span');
    toolbarTitle.id = 'reader-dialog-title';
    var entries = [];
    var active = null;
    var opener = null;
    var returnHash = '';
    var returnPosition = { left: 0, top: 0 };

    function targetFromHash(hash) {
      try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch (_) { return null; }
    }
    function entryFor(target) {
      if (!target) return null;
      return entries.find(function (entry) {
        return entry.article === target || entry.article.contains(target) || entry.aliases.indexOf(target) !== -1;
      });
    }
    function setHash(hash, replace) {
      history[replace ? 'replaceState' : 'pushState'](history.state, '', location.pathname + location.search + hash);
    }
    function restoreArticle() {
      if (!active) return;
      active.article.hidden = true;
      active.marker.after(active.article);
      active = null;
    }
    function close(options) {
      if (!active) return;
      options = options || {};
      restoreArticle();
      if (dialog.open) dialog.close();
      document.documentElement.classList.remove('exam-knowledge-open');
      if (options.restoreHash !== false) setHash(returnHash, true);
      if (options.restoreFocus !== false) {
        window.scrollTo({ left: returnPosition.left, top: returnPosition.top, behavior: 'instant' });
        if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      }
      opener = null;
    }
    function syncTitle() {
      var closeLabel = document.documentElement.lang.indexOf('en') === 0 ? 'Close' : '关闭';
      closeButton.setAttribute('aria-label', closeLabel);
      closeButton.setAttribute('title', closeLabel);
      if (!active) return;
      var zh = active.title.getAttribute('data-zh') || active.title.textContent;
      var en = active.title.getAttribute('data-en') || active.title.textContent;
      toolbarTitle.setAttribute('data-zh', zh);
      toolbarTitle.setAttribute('data-en', en);
      toolbarTitle.textContent = document.documentElement.lang.indexOf('en') === 0 ? en : zh;
    }
    function open(entry, target, trigger, updateHash) {
      var changed = active !== entry;
      if (!active) {
        opener = trigger || entry.link;
        if (!trigger) entry.link.scrollIntoView({ block: 'center' });
        returnPosition = { left: window.scrollX, top: window.scrollY };
        returnHash = entryFor(targetFromHash(location.hash)) ? '#' + entry.section.id : location.hash;
      }
      if (changed) {
        restoreArticle();
        active = entry;
        content.appendChild(entry.article);
        entry.article.hidden = false;
      }
      syncTitle();
      dialog.setAttribute('aria-labelledby', toolbarTitle.id);
      if (!dialog.open) dialog.showModal();
      document.documentElement.classList.add('exam-knowledge-open');
      if (updateHash && location.hash !== '#' + target.id) setHash('#' + target.id, false);
      if (changed) dialog.scrollTop = 0;
      closeButton.focus({ preventScroll: true });
      requestAnimationFrame(function () {
        if (active !== entry || !dialog.open) return;
        // Re-measure formulas now visible; don't rebuild their content.
        dialog.style.setProperty('--reader-toolbar-height', toolbarTitle.parentElement.getBoundingClientRect().height + 'px');
        document.dispatchEvent(new CustomEvent('knowledgeDetailOpened'));
        if (target !== entry.article && target !== entry.title && entry.article.contains(target)) {
          target.scrollIntoView({ block: 'start' });
        }
      });
    }
    function register(link, article, kind, aliases) {
      var title = article && article.querySelector('h3');
      if (!title || entries.some(function (entry) { return entry.article === article; })) return;
      var sourceSection = article.closest('section');
      if (!sourceSection || !sourceSection.id) return;
      if (!title.id) title.id = article.id + '-detail-title';
      var marker = document.createComment('reading detail: ' + article.id);
      article.before(marker);
      if (kind === 'knowledge') article.classList.add('knowledge-detail');
      entries.push({ article: article, title: title, marker: marker, link: link,
        aliases: aliases || [], section: sourceSection });
    }

    var knowledgeLinks = Array.from(section.querySelectorAll('.knowledge-card > a'));
    knowledgeLinks.forEach(function (link) {
      var target = targetFromHash(link.hash);
      var article = target && target.closest('article.exam-prose');
      if (article && section.contains(article) && article.id !== 'toolkit-essential') register(link, article, 'knowledge');
    });
    var extensionCards = Array.from(main.querySelectorAll('.extension-card'));
    extensionCards.forEach(function (card) {
      var link = card.querySelector('.extension-card-trigger');
      var article = link && targetFromHash(link.hash);
      var aliases = [card];
      (card.getAttribute('data-extension-alias') || '').split(/\s+/).filter(Boolean).forEach(function (id) {
        var alias = document.getElementById(id);
        if (alias) aliases.push(alias);
      });
      if (article && card.contains(article) && article.classList.contains('extension-detail')) register(link, article, 'extension', aliases);
    });
    // Incomplete mapping leaves every detail readable rather than hiding content.
    if (!entries.length || entries.length !== knowledgeLinks.length + extensionCards.length) return;

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest('a[href^="#"]');
      var card = event.target.closest('.knowledge-card');
      if (!link && card) {
        if (window.getSelection().toString()) return;
        link = card.querySelector('a');
      }
      if (!link) return;
      var target = targetFromHash(link.hash);
      var entry = entryFor(target);
      if (entry) {
        event.preventDefault();
        event.stopImmediatePropagation();
        open(entry, target, link, true);
      } else if (active && dialog.contains(link) && target) {
        event.preventDefault();
        event.stopImmediatePropagation();
        close({ restoreHash: false, restoreFocus: false });
        setHash(link.hash, false);
        target.scrollIntoView({ block: 'start' });
        var hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (!hadTabindex) target.addEventListener('blur', function () { target.removeAttribute('tabindex'); }, { once: true });
      }
    }, true);
    dialog.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return;
      var focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
        .filter(function (element) { return element.getClientRects().length > 0; });
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    closeButton.addEventListener('click', function () { close(); });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
    dialog.addEventListener('close', function () { if (!dialog.open) close(); });
    var backdropDown = false;
    function outside(event) {
      var rect = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    }
    dialog.addEventListener('pointerdown', function (event) { backdropDown = outside(event); });
    dialog.addEventListener('click', function (event) {
      if (backdropDown && outside(event)) close();
      backdropDown = false;
    });
    function followHash() {
      var target = targetFromHash(location.hash);
      var entry = entryFor(target);
      if (entry) open(entry, target, null, false);
      else close({ restoreHash: false });
    }
    window.addEventListener('hashchange', followHash);
    window.addEventListener('popstate', followHash);
    document.addEventListener('langChanged', syncTitle);
    entries.forEach(function (entry) {
      entry.article.hidden = true;
      entry.link.setAttribute('aria-haspopup', 'dialog');
      entry.link.setAttribute('aria-controls', dialog.id);
    });
    section.classList.add('knowledge-dialog-ready');
    main.classList.add('article-details-ready');
    followHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

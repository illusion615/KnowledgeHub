// ======================================
// article-mobile-present.js — Mobile presentation mode behavior
// ======================================
// Lazy-loaded by article-presentation.js when mobile mode is entered
// Exposes: window.StudyRoomMobilePresent

(function () {
  'use strict';

  var instance = null;

  /**
   * Create a mobile presentation controller.
   * @param {Object} deps
   * @param {HTMLElement} deps.root - document.documentElement
   * @param {Function} deps.getLang - returns 'zh' or 'en'
   * @param {Function} deps.goToPrev - navigate to previous step
   * @param {Function} deps.goToNext - navigate to next step
   * @param {Function} deps.getState - returns { enabled, index }
   * @param {Function} deps.getPresentSteps - returns presentSteps array
   * @returns {Object} controller { destroy }
   */
  function createController(deps) {
    var navBar = null;
    var navCounter = null;
    var navProgressFill = null;
    var navPrevBtn = null;
    var navNextBtn = null;
    var touchStartX = 0;
    var touchStartY = 0;
    var isSwiping = false;
    var observer = null;
    var siteEl = deps.root.querySelector('.site') || document.body;

    // ── Touch swipe navigation ──
    function onTouchStart(e) {
      if (!deps.getState().enabled) return;
      var touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isSwiping = false;
    }

    function onTouchMove(e) {
      if (!deps.getState().enabled) return;
      var touch = e.touches[0];
      var deltaX = touch.clientX - touchStartX;
      var deltaY = touch.clientY - touchStartY;

      // Determine dominant axis — only act on horizontal swipes
      if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        isSwiping = true;
      }
    }

    function onTouchEnd(e) {
      if (!deps.getState().enabled || !isSwiping) return;
      var touch = e.changedTouches[0];
      var deltaX = touch.clientX - touchStartX;

      if (Math.abs(deltaX) >= 50) {
        if (deltaX < 0) {
          deps.goToNext();
        } else {
          deps.goToPrev();
        }
      }
      isSwiping = false;
    }

    siteEl.addEventListener('touchstart', onTouchStart, { passive: true });
    siteEl.addEventListener('touchmove', onTouchMove, { passive: true });
    siteEl.addEventListener('touchend', onTouchEnd, { passive: true });

    // ── Bottom navigation bar ──
    function buildNavBar() {
      var floating = document.querySelector('.present-floating');
      if (!floating) return;

      navBar = document.createElement('div');
      navBar.className = 'mobile-nav-bar';

      // Prev button
      navPrevBtn = document.createElement('button');
      navPrevBtn.className = 'mobile-nav-btn';
      navPrevBtn.type = 'button';
      navPrevBtn.setAttribute('aria-label', deps.getLang() === 'zh' ? '上一页' : 'Previous');
      navPrevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 5.5L8 12L14.5 18.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      navBar.appendChild(navPrevBtn);

      // Center: counter + progress
      var center = document.createElement('div');
      center.className = 'mobile-nav-center';

      navCounter = document.createElement('span');
      navCounter.className = 'mobile-nav-counter';
      center.appendChild(navCounter);

      var progress = document.createElement('div');
      progress.className = 'mobile-nav-progress';
      navProgressFill = document.createElement('div');
      navProgressFill.className = 'mobile-nav-progress-fill';
      progress.appendChild(navProgressFill);
      center.appendChild(progress);

      navBar.appendChild(center);

      // Next button
      navNextBtn = document.createElement('button');
      navNextBtn.className = 'mobile-nav-btn';
      navNextBtn.type = 'button';
      navNextBtn.setAttribute('aria-label', deps.getLang() === 'zh' ? '下一页' : 'Next');
      navNextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9.5 5.5L16 12L9.5 18.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      navBar.appendChild(navNextBtn);

      floating.appendChild(navBar);

      // Wire button clicks
      navPrevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deps.goToPrev();
      });
      navNextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deps.goToNext();
      });

      // Initial sync
      syncNavBar();
    }

    function syncNavBar() {
      if (!navBar) return;
      var steps = deps.getPresentSteps();
      var st = deps.getState();
      var total = steps.length;
      var current = st.index;

      navCounter.textContent = String(current + 1) + ' / ' + String(total);

      var pct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;
      navProgressFill.style.width = pct + '%';

      navPrevBtn.disabled = current <= 0;
      navNextBtn.disabled = current >= total - 1;
    }

    // Observe the existing counter element for changes (sync from setPresentationStep)
    function observeCounter() {
      var counterEl = document.querySelector('[data-present-counter]');
      if (!counterEl) return;

      observer = new MutationObserver(function () {
        syncNavBar();
      });
      observer.observe(counterEl, { childList: true, characterData: true, subtree: true });
    }

    buildNavBar();
    observeCounter();

    // ── Content density guard ──
    function scanContentDensity() {
      var steps = deps.getPresentSteps();
      var viewportHeight = window.innerHeight;

      steps.forEach(function (step) {
        // Skip hero and end slides
        if (step.classList.contains('hero') || step.classList.contains('present-end-slide')) return;

        // Temporarily make visible to measure
        var wasActive = step.classList.contains('is-active');
        var origDisplay = step.style.display;
        var origHeight = step.style.height;
        var origMaxHeight = step.style.maxHeight;
        var origMinHeight = step.style.minHeight;

        if (!wasActive) {
          step.style.display = 'block';
          step.style.height = 'auto';
          step.style.maxHeight = 'none';
          step.style.minHeight = '0';
        }

        var contentHeight = step.scrollHeight;

        if (!wasActive) {
          step.style.display = origDisplay;
          step.style.height = origHeight;
          step.style.maxHeight = origMaxHeight;
          step.style.minHeight = origMinHeight;
        }

        if (contentHeight > viewportHeight * 1.5) {
          step.setAttribute('data-mobile-scrollable', '');
        } else {
          step.removeAttribute('data-mobile-scrollable');
        }
      });
    }

    // Run after a short delay to allow fonts + layout to settle
    setTimeout(scanContentDensity, 300);

    // ── Destroy ──
    function destroy() {
      // Remove touch listeners
      siteEl.removeEventListener('touchstart', onTouchStart);
      siteEl.removeEventListener('touchmove', onTouchMove);
      siteEl.removeEventListener('touchend', onTouchEnd);

      // Remove nav bar
      if (navBar && navBar.parentNode) {
        navBar.parentNode.removeChild(navBar);
      }
      navBar = null;

      // Disconnect observer
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      // Clean up scrollable markers
      var steps = deps.getPresentSteps();
      steps.forEach(function (step) {
        step.removeAttribute('data-mobile-scrollable');
      });

      instance = null;
    }

    return { destroy: destroy, syncNavBar: syncNavBar, scanContentDensity: scanContentDensity };
  }

  window.StudyRoomMobilePresent = {
    init: function (deps) {
      if (instance) {
        instance.destroy();
      }
      instance = createController(deps);
      return instance;
    },
    destroy: function () {
      if (instance) {
        instance.destroy();
      }
    }
  };
})();

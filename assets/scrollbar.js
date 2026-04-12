(function () {
  var hideTimers = new WeakMap();
  var HIDE_DELAY = 520;

  function getScroller(target) {
    if (!target || target === window || target === document) {
      return document.scrollingElement || document.documentElement;
    }

    if (target === document.body || target === document.documentElement) {
      return document.scrollingElement || document.documentElement;
    }

    if (target.nodeType === 1) {
      return target;
    }

    return document.scrollingElement || document.documentElement;
  }

  function hideScroller(scroller) {
    if (!scroller || !scroller.removeAttribute) {
      return;
    }

    scroller.removeAttribute('data-scrollbar-active');
    hideTimers.delete(scroller);
  }

  function markScrollerActive(scroller) {
    var timerId;

    if (!scroller || !scroller.setAttribute) {
      return;
    }

    scroller.setAttribute('data-scrollbar-active', 'true');
    timerId = hideTimers.get(scroller);
    if (timerId) {
      window.clearTimeout(timerId);
    }

    timerId = window.setTimeout(function () {
      hideScroller(scroller);
    }, HIDE_DELAY);

    hideTimers.set(scroller, timerId);
  }

  function handleScroll(event) {
    markScrollerActive(getScroller(event.target));
  }

  window.addEventListener('scroll', handleScroll, true);
})();
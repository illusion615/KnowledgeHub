document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var site = document.querySelector('.site') || document.body;
  var topbar = document.querySelector('.topbar');
  var hero = document.querySelector('.hero');
  var main = document.querySelector('main');
  var footer = site.querySelector('footer');
  var state = {
    enabled: false,
    index: 0
  };
  var autoAssignedSteps = [];
  var topLevelContainers = [];
  var presentSteps = [];
  var topbarActions;
  var presentationToggle;
  var presentationFloating;
  var presentationExit;
  var presentationPrev;
  var presentationNext;
  var presentationDeckLabel;
  var presentationDeckTitle;
  var presentationCounter;
  var presentationTitle;
  var presentationTip;
  var stepScrollTimer = 0;

  if (!site || !topbar || !hero || !main) return;

  var labels = {
    zh: {
      enter: '进入演示',
      exit: '退出演示',
      prev: '上一页',
      next: '下一页',
      tip: '键盘 ← → 切换 · Esc 退出',
      fallbackHero: '文章总览',
      fallbackStep: '内容页'
    },
    en: {
      enter: 'Present mode',
      exit: 'Exit presentation',
      prev: 'Previous',
      next: 'Next',
      tip: 'Use ← → to navigate · Esc to exit',
      fallbackHero: 'Overview',
      fallbackStep: 'Step'
    }
  };

  var getLang = function () {
    var stored = localStorage.getItem('lang');
    var htmlLang = root.getAttribute('lang') || '';

    if (stored === 'zh' || stored === 'en') {
      return stored;
    }

    if (htmlLang.toLowerCase().indexOf('zh') === 0) {
      return 'zh';
    }

    return 'en';
  };

  var getLabel = function (key) {
    var lang = getLang();
    var pack = labels[lang] || labels.zh;
    return pack[key] || '';
  };

  var ensureTopbarActions = function () {
    var existing = topbar.querySelector('.topbar-actions');
    var navLinks = topbar.querySelector('.nav-links');
    var actions = existing;

    if (actions) {
      return actions;
    }

    actions = document.createElement('div');
    actions.className = 'topbar-actions';
    topbar.appendChild(actions);

    if (navLinks && navLinks.parentNode === topbar) {
      actions.appendChild(navLinks);
    }

    return actions;
  };

  var ensureToggle = function () {
    var toggle = topbar.querySelector('[data-presentation-toggle]');

    if (toggle) {
      return toggle;
    }

    toggle = document.createElement('button');
    toggle.className = 'present-toggle';
    toggle.type = 'button';
    toggle.setAttribute('data-presentation-toggle', '');
    topbarActions.appendChild(toggle);

    return toggle;
  };

  var createNavButton = function (direction, labelText) {
    var button = document.createElement('button');
    var icon = document.createElement('span');
    var text = document.createElement('span');
    var path = direction === 'prev'
      ? '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 5.5L8 12L14.5 18.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 5.5L16 12L9.5 18.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    button.className = 'present-nav present-nav-' + direction;
    button.type = 'button';
    button.setAttribute('data-present-' + direction, '');

    icon.className = 'present-nav-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = path;

    text.className = 'visually-hidden';
    text.textContent = labelText;

    button.appendChild(icon);
    button.appendChild(text);

    return button;
  };

  var ensureFloating = function () {
    var floating = document.querySelector('.present-floating');
    var deck;
    var status;

    if (floating) {
      return floating;
    }

    floating = document.createElement('div');
    floating.className = 'present-floating';
    floating.setAttribute('aria-live', 'polite');

    deck = document.createElement('div');
    deck.className = 'present-deck';

    presentationDeckLabel = document.createElement('span');
    presentationDeckLabel.className = 'present-deck-label';
    presentationDeckLabel.setAttribute('data-present-deck-label', '');
    deck.appendChild(presentationDeckLabel);

    presentationDeckTitle = document.createElement('strong');
    presentationDeckTitle.className = 'present-deck-title';
    presentationDeckTitle.setAttribute('data-present-deck-title', '');
    deck.appendChild(presentationDeckTitle);

    floating.appendChild(deck);

    presentationExit = document.createElement('button');
    presentationExit.className = 'present-exit';
    presentationExit.type = 'button';
    presentationExit.setAttribute('data-present-exit', '');
    floating.appendChild(presentationExit);

    presentationPrev = createNavButton('prev', getLabel('prev'));
    floating.appendChild(presentationPrev);

    presentationNext = createNavButton('next', getLabel('next'));
    floating.appendChild(presentationNext);

    status = document.createElement('div');
    status.className = 'present-status';

    presentationCounter = document.createElement('span');
    presentationCounter.className = 'present-counter';
    presentationCounter.setAttribute('data-present-counter', '');
    status.appendChild(presentationCounter);

    presentationTitle = document.createElement('strong');
    presentationTitle.className = 'present-status-title';
    presentationTitle.setAttribute('data-present-title', '');
    status.appendChild(presentationTitle);

    presentationTip = document.createElement('span');
    presentationTip.className = 'present-status-tip';
    status.appendChild(presentationTip);

    floating.appendChild(status);

    if (footer && footer.parentNode === site) {
      site.insertBefore(floating, footer);
    } else {
      site.appendChild(floating);
    }

    return floating;
  };

  var normalizeTitle = function (value) {
    if (!value) return '';
    return value.trim();
  };

  var deriveStepTitle = function (step, index) {
    var explicit = step.getAttribute('data-step-title');
    var heading;

    if (explicit) {
      return explicit;
    }

    if (step.classList.contains('hero')) {
      heading = step.querySelector('h1');
      return heading ? normalizeTitle(heading.textContent) : getLabel('fallbackHero');
    }

    heading = step.querySelector('.section-head h2, h1, h2, h3');
    if (heading) {
      return normalizeTitle(heading.textContent);
    }

    return getLabel('fallbackStep') + ' ' + String(index + 1);
  };

  var deriveStepLabel = function (step, index) {
    var explicit = step.getAttribute('data-step-label');
    var heading;

    if (explicit) {
      return explicit;
    }

    if (step.classList.contains('hero')) {
      heading = step.querySelector('.eyebrow, .section-kicker');
      return heading ? normalizeTitle(heading.textContent) : getLabel('fallbackHero');
    }

    heading = step.querySelector('.section-kicker, .eyebrow');
    if (heading) {
      return normalizeTitle(heading.textContent);
    }

    return getLabel('fallbackStep') + ' ' + String(index + 1);
  };

  var getNestedStepCandidates = function (container) {
    var result = [];
    var candidates = container.querySelectorAll('[data-present-step]');

    candidates.forEach(function (candidate) {
      var parentStep = candidate.parentElement ? candidate.parentElement.closest('[data-present-step]') : null;
      if (parentStep && container.contains(parentStep)) {
        return;
      }
      result.push(candidate);
    });

    return result;
  };

  var collectPresentationSteps = function () {
    var sections = main.querySelectorAll('.section');

    topLevelContainers = [];
    presentSteps = [];

    if (hero) {
      topLevelContainers.push(hero);
    }

    sections.forEach(function (section) {
      topLevelContainers.push(section);
    });

    topLevelContainers.forEach(function (container) {
      var nestedSteps;

      if (container.hasAttribute('data-present-step')) {
        presentSteps.push(container);
        return;
      }

      nestedSteps = getNestedStepCandidates(container);

      if (nestedSteps.length > 0) {
        nestedSteps.forEach(function (step) {
          presentSteps.push(step);
        });
        return;
      }

      container.setAttribute('data-present-step', '');
      autoAssignedSteps.push(container);
      presentSteps.push(container);
    });

    presentSteps.forEach(function (step, index) {
      if (!step.getAttribute('data-step-title')) {
        step.setAttribute('data-step-title', deriveStepTitle(step, index));
      }
    });
  };

  var updatePresentationLabels = function () {
    var prevLabel = getLabel('prev');
    var nextLabel = getLabel('next');

    presentationToggle.textContent = state.enabled ? getLabel('exit') : getLabel('enter');
    presentationToggle.setAttribute('aria-pressed', String(state.enabled));
    presentationToggle.classList.toggle('is-active', state.enabled);

    if (presentationExit) {
      presentationExit.textContent = getLabel('exit');
    }

    if (presentationPrev) {
      presentationPrev.setAttribute('aria-label', prevLabel);
      if (presentationPrev.lastElementChild) {
        presentationPrev.lastElementChild.textContent = prevLabel;
      }
    }

    if (presentationNext) {
      presentationNext.setAttribute('aria-label', nextLabel);
      if (presentationNext.lastElementChild) {
        presentationNext.lastElementChild.textContent = nextLabel;
      }
    }

    if (presentationTip) {
      presentationTip.textContent = getLabel('tip');
    }
  };

  var syncContainerVisibility = function (activeStep) {
    topLevelContainers.forEach(function (container) {
      var shouldShow;

      if (!state.enabled) {
        container.classList.remove('is-presentation-hidden');
        return;
      }

      shouldShow = container === activeStep || container.contains(activeStep);
      container.classList.toggle('is-presentation-hidden', !shouldShow);
    });
  };

  var syncStepOverflowState = function (activeStep) {
    presentSteps.forEach(function (step) {
      step.classList.remove('is-step-overflowing');
      step.classList.remove('is-step-scrolling');
    });

    if (stepScrollTimer) {
      window.clearTimeout(stepScrollTimer);
      stepScrollTimer = 0;
    }

    if (presentationFloating) {
      presentationFloating.classList.toggle('is-hero-step', !!(activeStep && activeStep.classList.contains('hero')));
    }

    if (!state.enabled || !activeStep) {
      return;
    }

    window.requestAnimationFrame(function () {
      var isOverflowing = activeStep.scrollHeight > activeStep.clientHeight + 24;

      activeStep.classList.toggle('is-step-overflowing', isOverflowing);
    });
  };

  var setPresentationStep = function (index) {
    var safeIndex;
    var activeStep;
    var stepLabel;
    var stepTitle;

    if (!presentSteps.length) return;

    safeIndex = Math.max(0, Math.min(index, presentSteps.length - 1));
    activeStep = presentSteps[safeIndex];
    state.index = safeIndex;

    presentSteps.forEach(function (step, stepIndex) {
      var isActive = state.enabled && stepIndex === safeIndex;

      step.classList.toggle('is-active', isActive);

      if (state.enabled) {
        step.setAttribute('aria-hidden', String(!isActive));
      } else {
        step.removeAttribute('aria-hidden');
      }
    });

    syncContainerVisibility(activeStep);

    if (state.enabled) {
      window.scrollTo(0, 0);
      if (activeStep) {
        activeStep.scrollTop = 0;
      }
    }

    stepLabel = activeStep ? deriveStepLabel(activeStep, safeIndex) : '';
    stepTitle = activeStep ? deriveStepTitle(activeStep, safeIndex) : '';

    if (presentationCounter) {
      presentationCounter.textContent = String(safeIndex + 1) + ' / ' + String(presentSteps.length);
    }

    if (presentationDeckLabel) {
      presentationDeckLabel.textContent = stepLabel;
    }

    if (presentationDeckTitle) {
      presentationDeckTitle.textContent = stepTitle;
    }

    if (presentationTitle) {
      presentationTitle.textContent = stepTitle;
    }

    if (presentationPrev) {
      presentationPrev.disabled = safeIndex === 0;
    }

    if (presentationNext) {
      presentationNext.disabled = safeIndex === presentSteps.length - 1;
    }

    syncStepOverflowState(activeStep);
  };

  var resolvePresentationStepIndex = function () {
    var hash = window.location.hash;
    var bestIndex = 0;
    var bestDistance = Number.POSITIVE_INFINITY;
    var targetOffset = window.scrollY + (window.innerHeight * 0.35);

    if (hash) {
      var target = document.querySelector(hash);
      if (target) {
        var hashIndex = -1;

        presentSteps.forEach(function (step, index) {
          if (hashIndex !== -1) return;
          if (step === target || step.contains(target) || target.contains(step)) {
            hashIndex = index;
          }
        });

        if (hashIndex !== -1) {
          return hashIndex;
        }
      }
    }

    presentSteps.forEach(function (step, index) {
      var rect = step.getBoundingClientRect();
      var absoluteTop = rect.top + window.scrollY;
      var distance = Math.abs(absoluteTop - targetOffset);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  var enterPresentation = function () {
    state.enabled = true;
    root.classList.add('is-presentation-mode');
    setPresentationStep(resolvePresentationStepIndex());
    updatePresentationLabels();
  };

  var exitPresentation = function () {
    var activeStep = presentSteps[state.index];

    state.enabled = false;
    root.classList.remove('is-presentation-mode');
    setPresentationStep(state.index);
    updatePresentationLabels();

    if (activeStep) {
      activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  var goToPreviousStep = function () {
    if (!state.enabled || state.index <= 0) return;
    setPresentationStep(state.index - 1);
  };

  var goToNextStep = function () {
    if (!state.enabled || state.index >= presentSteps.length - 1) return;
    setPresentationStep(state.index + 1);
  };

  var scheduleStepScrollingClear = function (step, delay) {
    if (stepScrollTimer) {
      window.clearTimeout(stepScrollTimer);
    }

    stepScrollTimer = window.setTimeout(function () {
      clearStepScrolling(step);
    }, delay);
  };

  var clearStepScrolling = function (step) {
    if (!step) {
      return;
    }

    step.classList.remove('is-step-scrolling');

    if (stepScrollTimer) {
      window.clearTimeout(stepScrollTimer);
      stepScrollTimer = 0;
    }
  };

  var markStepScrolling = function (step) {
    if (!state.enabled || !step || !step.classList.contains('is-active')) {
      return;
    }

    step.classList.add('is-step-scrolling');
    scheduleStepScrollingClear(step, 720);
  };

  var isBlockedTarget = function (target) {
    if (!target) return false;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
    if (target.closest('.tab-list, .subsection-toggle, [data-presentation-toggle]')) return true;
    return false;
  };

  topbarActions = ensureTopbarActions();
  presentationToggle = ensureToggle();
  presentationFloating = ensureFloating();
  presentationExit = presentationFloating.querySelector('[data-present-exit]');
  presentationPrev = presentationFloating.querySelector('[data-present-prev]');
  presentationNext = presentationFloating.querySelector('[data-present-next]');
  presentationDeckLabel = presentationFloating.querySelector('[data-present-deck-label]');
  presentationDeckTitle = presentationFloating.querySelector('[data-present-deck-title]');
  presentationCounter = presentationFloating.querySelector('[data-present-counter]');
  presentationTitle = presentationFloating.querySelector('[data-present-title]');
  presentationTip = presentationFloating.querySelector('.present-status-tip');

  collectPresentationSteps();
  presentSteps.forEach(function (step) {
    step.addEventListener('scroll', function () {
      markStepScrolling(step);
    }, { passive: true });

    step.addEventListener('scrollend', function () {
      scheduleStepScrollingClear(step, 160);
    }, { passive: true });
  });
  updatePresentationLabels();
  setPresentationStep(0);

  presentationToggle.addEventListener('click', function () {
    if (state.enabled) {
      exitPresentation();
      return;
    }

    enterPresentation();
  });

  presentationExit.addEventListener('click', function () {
    exitPresentation();
  });

  presentationPrev.addEventListener('click', function () {
    goToPreviousStep();
  });

  presentationNext.addEventListener('click', function () {
    goToNextStep();
  });

  document.addEventListener('keydown', function (event) {
    if (!state.enabled) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      exitPresentation();
      return;
    }

    if (isBlockedTarget(event.target)) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      goToNextStep();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goToPreviousStep();
    }
  });

  window.addEventListener('resize', function () {
    if (!state.enabled) return;
    syncStepOverflowState(presentSteps[state.index]);
  });
});
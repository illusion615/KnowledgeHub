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
  var topbarStart;
  var topbarCenter;
  var topbarEnd;
  var presentationToggle;
  var shareWrapper;
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
  var pptxgenLoader = null;
  var pptxExportLoader = null;
  var exportInProgress = false;

  if (!site || !topbar || !hero || !main) return;

  var labels = {
    zh: {
      enter: '开始演示',
      exit: '退出演示',
      share: '分享',
      copyUrl: '复制链接',
      shareWechat: '分享到微信',
      wechatScanTip: '请使用微信扫码分享当前页面。',
      copied: '已复制',
      export: '导出PPT',
      exporting: '导出中...',
      exportPdf: '导出PDF',
      exportingPdf: '导出中...',
      exportError: 'PPT 导出失败，请重试。',
      exportPdfError: 'PDF 导出失败，请重试。',
      prev: '上一页',
      next: '下一页',
      tip: '键盘 ← → 切换 · Esc 退出',
      fallbackHero: '文章总览',
      fallbackStep: '内容页'
    },
    en: {
      enter: 'Start presentation',
      exit: 'Exit presentation',
      share: 'Share',
      copyUrl: 'Copy URL',
      shareWechat: 'Share to WeChat',
      wechatScanTip: 'Use WeChat to scan and share this page.',
      copied: 'Copied',
      export: 'Export PPT',
      exporting: 'Exporting...',
      exportPdf: 'Export PDF',
      exportingPdf: 'Exporting...',
      exportError: 'PowerPoint export failed. Please try again.',
      exportPdfError: 'PDF export failed. Please try again.',
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

  var ensureTopbarLayout = function () {
    var existingStart = topbar.querySelector('.topbar-slot-start');
    var existingCenter = topbar.querySelector('.topbar-slot-center');
    var existingEnd = topbar.querySelector('.topbar-slot-end');
    var homeLink;
    var brand;
    var navLinks;
    var actions;

    if (existingStart && existingCenter && existingEnd) {
      topbarStart = existingStart;
      topbarCenter = existingCenter;
      topbarEnd = existingEnd;
      return;
    }

    homeLink = topbar.querySelector('.home-link');
    brand = topbar.querySelector('.brand');
    navLinks = topbar.querySelector('.nav-links');
    actions = topbar.querySelector('.topbar-actions');

    topbarStart = document.createElement('div');
    topbarStart.className = 'topbar-slot topbar-slot-start';

    topbarCenter = document.createElement('div');
    topbarCenter.className = 'topbar-slot topbar-slot-center';

    topbarEnd = document.createElement('div');
    topbarEnd.className = 'topbar-slot topbar-slot-end';

    while (topbar.firstChild) {
      topbar.removeChild(topbar.firstChild);
    }

    topbar.appendChild(topbarStart);
    topbar.appendChild(topbarCenter);
    topbar.appendChild(topbarEnd);

    if (homeLink) {
      topbarStart.appendChild(homeLink);
    }

    if (brand) {
      topbarStart.appendChild(brand);
    }

    if (navLinks) {
      topbarCenter.appendChild(navLinks);
    }

    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'topbar-actions';
    }

    while (actions.firstChild) {
      if (actions.firstChild !== navLinks) {
        topbarEnd.appendChild(actions.firstChild);
      } else {
        actions.removeChild(actions.firstChild);
      }
    }

    topbarEnd.appendChild(actions);
  };

  var ensureTopbarActions = function () {
    var existing = topbarEnd ? topbarEnd.querySelector('.topbar-actions') : null;
    var actions = existing;

    if (actions) {
      return actions;
    }

    actions = document.createElement('div');
    actions.className = 'topbar-actions';
    if (topbarEnd) {
      topbarEnd.appendChild(actions);
    } else {
      topbar.appendChild(actions);
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
    toggle.innerHTML = '<svg class="present-toggle-icon" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.5 10l2.5-2.5L14.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    topbarActions.appendChild(toggle);

    return toggle;
  };

  var ensureShareDropdown = function () {
    var wrapper = topbar.querySelector('.share-wrapper');
    if (wrapper) return wrapper;

    wrapper = document.createElement('div');
    wrapper.className = 'share-wrapper';

    var btn = document.createElement('button');
    btn.className = 'share-btn';
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    wrapper.appendChild(btn);

    var menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.setAttribute('role', 'menu');

    // Copy URL item
    var copyItem = document.createElement('button');
    copyItem.className = 'share-menu-item';
    copyItem.type = 'button';
    copyItem.setAttribute('role', 'menuitem');
    copyItem.setAttribute('data-share-copy-url', '');
    copyItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="share-item-label"></span>';
    menu.appendChild(copyItem);

    // WeChat share item
    var wechatItem = document.createElement('button');
    wechatItem.className = 'share-menu-item';
    wechatItem.type = 'button';
    wechatItem.setAttribute('role', 'menuitem');
    wechatItem.setAttribute('data-share-wechat', '');
    wechatItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9.5 5C5.91 5 3 7.55 3 10.69c0 1.83.98 3.45 2.5 4.49L5 19l3.49-1.73c.33.05.67.08 1.01.08 3.59 0 6.5-2.55 6.5-5.66S13.09 5 9.5 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.9 9.05c2.26.32 4.1 1.98 4.1 4.01 0 1.24-.7 2.37-1.84 3.14L19.5 19l-2.57-1.26c-.17.02-.34.03-.51.03-2.53 0-4.58-1.64-4.58-3.66 0-.12.01-.25.03-.37" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor"/><circle cx="11.5" cy="10.5" r="1" fill="currentColor"/></svg><span class="share-item-label"></span>';
    menu.appendChild(wechatItem);

    // WeChat QR panel (inline in dropdown)
    var wechatPanel = document.createElement('div');
    wechatPanel.className = 'share-wechat-qr';
    wechatPanel.style.display = 'none';
    wechatPanel.innerHTML = '<img class="share-wechat-qr-img" alt="QR Code" /><span class="share-wechat-qr-tip"></span>';
    menu.appendChild(wechatPanel);

    // Export PPT item
    var pptItem = document.createElement('button');
    pptItem.className = 'share-menu-item';
    pptItem.type = 'button';
    pptItem.setAttribute('role', 'menuitem');
    pptItem.setAttribute('data-share-export-ppt', '');
    pptItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="share-item-label"></span>';
    menu.appendChild(pptItem);

    // Export PDF item
    var pdfItem = document.createElement('button');
    pdfItem.className = 'share-menu-item';
    pdfItem.type = 'button';
    pdfItem.setAttribute('role', 'menuitem');
    pdfItem.setAttribute('data-share-export-pdf', '');
    pdfItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="share-item-label"></span>';
    menu.appendChild(pdfItem);

    wrapper.appendChild(menu);
    topbarActions.appendChild(wrapper);

    // Toggle menu open/close — auto-show QR when opening
    var showWechatQr = function () {
      var qrImg = wechatPanel.querySelector('.share-wechat-qr-img');
      var qrTip = wechatPanel.querySelector('.share-wechat-qr-tip');
      var url = window.location.href;
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=' + encodeURIComponent(url);
      qrTip.textContent = getLabel('wechatScanTip');
      wechatPanel.style.display = 'flex';
    };

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = wrapper.classList.contains('is-open');
      wrapper.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        wechatPanel.style.display = 'none';
      } else {
        showWechatQr();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        wechatPanel.style.display = 'none';
      }
    });

    var shareToWeChat = function () {
      // QR is auto-shown when dropdown opens; this toggles visibility
      var isVisible = wechatPanel.style.display !== 'none';
      if (isVisible) {
        wechatPanel.style.display = 'none';
      } else {
        showWechatQr();
      }
    };

    // Copy URL handler
    copyItem.addEventListener('click', function () {
      var url = window.location.href;
      var label = copyItem.querySelector('.share-item-label');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          var orig = label.textContent;
          label.textContent = getLabel('copied');
          label.classList.add('share-copied-tip');
          setTimeout(function () { label.textContent = orig; label.classList.remove('share-copied-tip'); }, 1500);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        var origText = label.textContent;
        label.textContent = getLabel('copied');
        label.classList.add('share-copied-tip');
        setTimeout(function () { label.textContent = origText; label.classList.remove('share-copied-tip'); }, 1500);
      }
    });

    // WeChat share handler
    wechatItem.addEventListener('click', function () {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      shareToWeChat();
    });

    // Export PPT handler
    pptItem.addEventListener('click', function () {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      exportPresentationDeck();
    });

    // Export PDF handler
    pdfItem.addEventListener('click', function () {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      exportPdf();
    });

    return wrapper;
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

  var sanitizeFileName = function (value) {
    var source = value || 'presentation';
    var invalidChars = '\\/:*?"<>|';
    var result = '';
    var wasDash = false;
    var i, ch;
    for (i = 0; i < source.length; i++) {
      ch = source.charAt(i);
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') { if (!wasDash) { result += '-'; wasDash = true; } continue; }
      if (invalidChars.indexOf(ch) !== -1) { if (!wasDash) { result += '-'; wasDash = true; } continue; }
      result += ch; wasDash = false;
    }
    result = result.trim();
    while (result.charAt(0) === '-') result = result.slice(1);
    while (result.charAt(result.length - 1) === '-') result = result.slice(0, -1);
    return result || 'presentation';
  };

  var resolvePresentationAssetUrl = function (fileName) {
    var nodes = document.querySelectorAll('script[src]');
    var resolved = '';
    nodes.forEach(function (n) {
      var src = n.getAttribute('src') || '';
      if (!resolved && src.indexOf('article-presentation.js') !== -1) {
        resolved = src.replace('article-presentation.js', fileName);
      }
    });
    var base = resolved || fileName;
    // Cache-bust lazily loaded scripts with a version stamp
    return base + (base.indexOf('?') === -1 ? '?' : '&') + 'v=20260411c';
  };

  var ensurePptxGenJS = function () {
    var ctor = window.PptxGenJS || window.PptxgenJS;
    if (ctor) return Promise.resolve(ctor);
    if (pptxgenLoader) return pptxgenLoader;
    pptxgenLoader = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('pptxgen.bundle.js');
      s.async = true;
      s.onload = function () {
        var c = window.PptxGenJS || window.PptxgenJS;
        if (c) { resolve(c); return; }
        reject(new Error('PptxGenJS constructor unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load PptxGenJS.')); };
      document.head.appendChild(s);
    });
    return pptxgenLoader;
  };

  var ensurePptxExport = function () {
    if (pptxExportLoader) return pptxExportLoader;
    pptxExportLoader = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('pptx-export.js');
      s.async = true;
      s.onload = function () {
        if (window.StudyRoomPptxExport) { resolve(window.StudyRoomPptxExport); return; }
        reject(new Error('pptx-export.js loaded but unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load pptx-export.js.')); };
      document.head.appendChild(s);
    });
    return pptxExportLoader;
  };

  var capturePresentationSnapshot = function () {
    var activeStep = presentSteps[state.index];
    return { enabled: state.enabled, index: state.index, pageScrollY: window.scrollY, stepScrollTop: activeStep ? activeStep.scrollTop : 0 };
  };

  var restorePresentationSnapshot = function (snapshot) {
    if (snapshot.enabled) {
      state.enabled = true;
      root.classList.add('is-presentation-mode');
      setPresentationStep(snapshot.index);
      var activeStep = presentSteps[snapshot.index];
      if (activeStep) { activeStep.scrollTop = snapshot.stepScrollTop; syncStepOverflowState(activeStep); }
      updatePresentationLabels();
      return;
    }
    state.enabled = false;
    root.classList.remove('is-presentation-mode');
    restoreAccordionStates();
    setPresentationStep(snapshot.index);
    updatePresentationLabels();
    window.scrollTo(0, snapshot.pageScrollY);
  };

  var exportWithNativeObjects = function () {
    var snapshot = capturePresentationSnapshot();
    return Promise.all([ensurePptxGenJS(), ensurePptxExport()]).then(function (results) {
      var PptxGenJS = results[0];
      var exporter = results[1];
      var palette = exporter.getPalette();
      var pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Study Room';
      pptx.company = 'Study Room';
      pptx.subject = document.title || 'Presentation';
      pptx.title = document.title || 'Presentation';
      pptx.lang = getLang() === 'zh' ? 'zh-CN' : 'en-US';
      if (exporter.setupMasters) exporter.setupMasters(pptx, palette);
      if (!snapshot.enabled) enterPresentation();
      presentSteps.forEach(function (step, stepIndex) {
        setPresentationStep(stepIndex);
        exporter.renderStep(pptx, step, stepIndex, stepIndex, presentSteps.length, palette, deriveStepLabel, deriveStepTitle);
      });
      restorePresentationSnapshot(snapshot);
      return pptx.write({ outputType: 'blob' });
    }, function (error) {
      restorePresentationSnapshot(snapshot);
      throw error;
    });
  };

  var exportPresentationDeck = function () {
    if (exportInProgress) return Promise.resolve();
    exportInProgress = true;
    updatePresentationLabels();
    return exportWithNativeObjects().then(function (blob) {
      var fileName = sanitizeFileName(document.title || 'presentation') + '.pptx';
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }).catch(function (error) {
      console.error(error);
      window.alert(getLabel('exportError'));
    }).then(function () {
      exportInProgress = false;
      updatePresentationLabels();
    });
  };

  var pdfExportInProgress = false;

  var exportPdf = function () {
    if (pdfExportInProgress) return;
    pdfExportInProgress = true;
    updatePresentationLabels();

    // Expand all accordions so PDF captures full content
    var accordions = main.querySelectorAll('[data-accordion]');
    var savedStates = [];
    accordions.forEach(function (item) {
      var btn = item.querySelector('.subsection-toggle');
      var content = item.querySelector('.subsection-content');
      savedStates.push({ item: item, wasOpen: item.classList.contains('is-open') });
      item.classList.add('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (content) content.setAttribute('aria-hidden', 'false');
    });

    // Allow layout to settle then trigger browser print
    window.setTimeout(function () {
      window.print();

      // Restore accordion states after print dialog closes
      savedStates.forEach(function (entry) {
        var btn = entry.item.querySelector('.subsection-toggle');
        var content = entry.item.querySelector('.subsection-content');
        if (entry.wasOpen) {
          entry.item.classList.add('is-open');
          if (btn) btn.setAttribute('aria-expanded', 'true');
          if (content) content.setAttribute('aria-hidden', 'false');
        } else {
          entry.item.classList.remove('is-open');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (content) content.setAttribute('aria-hidden', 'true');
        }
      });

      pdfExportInProgress = false;
      updatePresentationLabels();
    }, 300);
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
      return normalizeTitle(heading.textContent).replace(/^\d+\.\s*/, '');
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

  /* ══════════════════════════════════════════════════════
     Accordion presentation support
     — Extracts subsection title (without number prefix)
     — Reads section kicker + h2 for deck label/title
     — Manages expand/collapse state across enter/exit
     ══════════════════════════════════════════════════════ */
  var getAccordionTitle = function (item) {
    var toggle = item.querySelector('.subsection-toggle');
    if (!toggle) return '';
    var span = toggle.querySelector('span:not(.subsection-number)');
    if (span) return normalizeTitle(span.textContent);
    return normalizeTitle(toggle.textContent).replace(/^\d+(\.\d+)?\s*/, '');
  };

  var savedAccordionStates = [];

  var expandAllAccordions = function () {
    savedAccordionStates = [];
    var items = main.querySelectorAll('[data-accordion]');
    items.forEach(function (item) {
      var btn = item.querySelector('.subsection-toggle');
      var content = item.querySelector('.subsection-content');
      savedAccordionStates.push({ item: item, wasOpen: item.classList.contains('is-open') });
      item.classList.add('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (content) content.setAttribute('aria-hidden', 'false');
    });
  };

  var restoreAccordionStates = function () {
    savedAccordionStates.forEach(function (entry) {
      var btn = entry.item.querySelector('.subsection-toggle');
      var content = entry.item.querySelector('.subsection-content');
      if (entry.wasOpen) {
        entry.item.classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (content) content.setAttribute('aria-hidden', 'false');
      } else {
        entry.item.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('aria-hidden', 'true');
      }
    });
    savedAccordionStates = [];
  };

  /* ══════════════════════════════════════════════════════ */

  var collectPresentationSteps = function () {
    var sections = main.querySelectorAll('.section');
    var postMainSections = site.querySelectorAll('main ~ .section');

    topLevelContainers = [];
    presentSteps = [];

    if (hero) {
      topLevelContainers.push(hero);
    }

    sections.forEach(function (section) {
      topLevelContainers.push(section);
    });

    postMainSections.forEach(function (section) {
      topLevelContainers.push(section);
    });

    topLevelContainers.forEach(function (container) {
      var nestedSteps;
      var accordionItems;

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

      // Accordion split: overview step (section-head + collapsed toggles) + each [data-accordion] as its own step
      accordionItems = container.querySelectorAll('[data-accordion]');
      if (accordionItems.length > 0) {
        var sHead = container.querySelector('.section-head');
        var sKicker = sHead ? sHead.querySelector('.section-kicker') : null;
        var sH2 = sHead ? sHead.querySelector('h2') : null;
        var kickerStr = sKicker ? normalizeTitle(sKicker.textContent) : '';
        var h2Str = sH2 ? normalizeTitle(sH2.textContent).replace(/^\d+\.\s*/, '') : '';

        // Overview step: the section itself shows head + collapsed accordion list
        container.setAttribute('data-present-step', '');
        container.setAttribute('data-present-overview', '');
        if (kickerStr) container.setAttribute('data-step-label', kickerStr);
        container.setAttribute('data-step-title', h2Str || '');
        autoAssignedSteps.push(container);
        presentSteps.push(container);

        accordionItems.forEach(function (item) {
          var subTitle = getAccordionTitle(item);
          if (kickerStr) item.setAttribute('data-step-label', kickerStr);
          item.setAttribute('data-step-title', subTitle || h2Str || '');
          item.setAttribute('data-present-step', '');
          autoAssignedSteps.push(item);
          presentSteps.push(item);
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

    presentationToggle.setAttribute('aria-label', state.enabled ? getLabel('exit') : getLabel('enter'));
    presentationToggle.setAttribute('aria-pressed', String(state.enabled));
    presentationToggle.classList.toggle('is-active', state.enabled);

    if (presentationExit) {
      presentationExit.textContent = getLabel('exit');
    }

    // Update share dropdown labels
    if (shareWrapper) {
      var copyLabel = shareWrapper.querySelector('[data-share-copy-url] .share-item-label');
      var wechatLabel = shareWrapper.querySelector('[data-share-wechat] .share-item-label');
      var pptLabel = shareWrapper.querySelector('[data-share-export-ppt] .share-item-label');
      var pdfLabel = shareWrapper.querySelector('[data-share-export-pdf] .share-item-label');
      var pptBtn = shareWrapper.querySelector('[data-share-export-ppt]');
      var pdfBtn = shareWrapper.querySelector('[data-share-export-pdf]');

      if (copyLabel && !copyLabel.classList.contains('share-copied-tip')) {
        copyLabel.textContent = getLabel('copyUrl');
      }
      if (wechatLabel) {
        wechatLabel.textContent = getLabel('shareWechat');
      }
      if (pptLabel) {
        pptLabel.textContent = exportInProgress ? getLabel('exporting') : getLabel('export');
      }
      if (pptBtn) {
        pptBtn.disabled = exportInProgress;
      }
      if (pdfLabel) {
        pdfLabel.textContent = pdfExportInProgress ? getLabel('exportingPdf') : getLabel('exportPdf');
      }
      if (pdfBtn) {
        pdfBtn.disabled = pdfExportInProgress;
      }
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
        container.classList.remove('is-present-container-passthrough');
        return;
      }

      shouldShow = container === activeStep || container.contains(activeStep);
      container.classList.toggle('is-presentation-hidden', !shouldShow);

      // When an overview container holds the active child step,
      // mark it as passthrough so CSS can show it without the is-active grid sizing
      var isPassthrough = shouldShow && container !== activeStep
        && container.hasAttribute('data-present-overview');
      container.classList.toggle('is-present-container-passthrough', isPassthrough);
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
    expandAllAccordions();
    setPresentationStep(0);
    updatePresentationLabels();
  };

  var exitPresentation = function () {
    var activeStep = presentSteps[state.index];

    state.enabled = false;
    root.classList.remove('is-presentation-mode');
    restoreAccordionStates();
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

  ensureTopbarLayout();
  topbarActions = ensureTopbarActions();
  presentationToggle = ensureToggle();
  shareWrapper = ensureShareDropdown();
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
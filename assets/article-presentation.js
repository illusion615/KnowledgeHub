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
  var styleToggle;
  var styleWrapper;
  var shareWrapper;
  var topbarOverlayBackdrop;
  var presentationFloating;
  var presentationExit;
  var presentationPrev;
  var presentationNext;
  var presentationDeckLabel;
  var presentationDeckTitle;
  var presentationCounter;
  var presentationTitle;
  var presentationTip;
  var prefetchBar;
  var stepScrollTimer = 0;
  var pptxgenLoader = null;
  var pptxExportLoader = null;
  var exportInProgress = false;
  var narrationLoader = null;
  var narrationController = null;
  var presentationAutoPlay;
  var narrationIndicator;
  var narrationSubtitle;
  var narrationState = 'idle';
  var narrationStartTime = 0;
  var mediaRecorder = null;
  var recordedChunks = [];
  var recordingStream = null;
  var focusModeEnabled = localStorage.getItem('present-focus-mode') !== 'false'; // default ON
  var recordAspectRatio = localStorage.getItem('present-record-ratio') || '16:9';
  var mobilePresentEnabled = localStorage.getItem('present-mobile-mode') === 'true';
  var mobilePresentLoader = null;
  var mobilePresentController = null;

  if (!site || !topbar || !hero || !main) return;

  // Phase 2: Listen for focus mode toggle from narration-ui settings panel
  document.addEventListener('focusModeChanged', function (e) {
    focusModeEnabled = e.detail.enabled;
    if (!focusModeEnabled) {
      exitFocusMode();
    } else if (narrationState === 'playing') {
      enterFocusMode();
    }
  });

  // Phase 3: Listen for record ratio change from narration-ui settings panel
  document.addEventListener('recordRatioChanged', function (e) {
    recordAspectRatio = e.detail.ratio;
  });

  // Phase 4: Listen for mobile present mode toggle
  document.addEventListener('mobilePresentChanged', function (e) {
    mobilePresentEnabled = e.detail.enabled;
    localStorage.setItem('present-mobile-mode', mobilePresentEnabled ? 'true' : 'false');
    if (state.enabled) {
      if (mobilePresentEnabled) {
        root.classList.add('is-mobile-present');
        ensureMobilePresent();
      } else {
        root.classList.remove('is-mobile-present');
        if (mobilePresentController) {
          mobilePresentController.destroy();
          mobilePresentController = null;
        }
      }
    }
  });

  var labels = {
    zh: {
      enter: '开始演示',
      style: '风格',
      exit: '退出演示',
      share: '分享',
      transitions: '过渡风格',
      transitionFade: '淡入',
      transitionMorph: '变形',
      transitionSlide: '滑动',
      transitionZoom: '缩放',
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
      emailNewsletter: '邮件分享',
      emailCopied: '内容已复制到剪贴板，请粘贴到邮件正文',
      prev: '上一页',
      next: '下一页',
      tip: '键盘 ← → 切换 · Esc 退出',
      fallbackHero: '文章总览',
      fallbackStep: '内容页',
      autoPlay: '自动讲解',
      pauseNarration: '暂停讲解',
      resumeNarration: '继续讲解',
      narrationComplete: '讲解完成',
      narrationError: '讲解生成失败',
      narrationGenerating: '正在生成讲解…',
      narrationDuration: '总时长',
      record: '录制视频',
      recording: '录制中…',
      recordStop: '停止录制',
      recordSaved: '视频已保存'
    },
    en: {
      enter: 'Start presentation',
      style: 'Style',
      exit: 'Exit presentation',
      share: 'Share',
      transitions: 'Transition',
      transitionFade: 'Fade',
      transitionMorph: 'Morph',
      transitionSlide: 'Slide',
      transitionZoom: 'Zoom',
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
      emailNewsletter: 'Email',
      emailCopied: 'Content copied to clipboard — paste into your email body',
      prev: 'Previous',
      next: 'Next',
      tip: 'Use ← → to navigate · Esc to exit',
      fallbackHero: 'Overview',
      fallbackStep: 'Step',
      autoPlay: 'Auto narrate',
      pauseNarration: 'Pause',
      resumeNarration: 'Resume',
      narrationComplete: 'Narration complete',
      narrationError: 'Narration failed',
      narrationGenerating: 'Generating narration…',
      narrationDuration: 'Duration',
      record: 'Record Video',
      recording: 'Recording…',
      recordStop: 'Stop Recording',
      recordSaved: 'Video Saved'
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

  var applyLanguageToDocument = function (lang) {
    var targetLang = lang === 'en' ? 'en' : 'zh';
    var htmlLang = targetLang === 'zh' ? 'zh-CN' : 'en';

    localStorage.setItem('lang', targetLang);
    root.setAttribute('lang', htmlLang);

    document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + targetLang);
      if (val !== null) {
        el.innerHTML = val;
      }
    });

    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: targetLang } }));
  };

  var applyPresentationTransitionStyle = function (style) {
    var normalized = style || 'fade';
    var classes = [
      'present-transition-fade',
      'present-transition-morph',
      'present-transition-slide',
      'present-transition-zoom'
    ];

    classes.forEach(function (cls) {
      document.body.classList.remove(cls);
    });

    document.body.classList.add('present-transition-' + normalized);
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

    // Ensure mobile nav-toggle exists in center slot
    if (navLinks && !topbarCenter.querySelector('.nav-toggle')) {
      var mobileToggle = document.createElement('button');
      mobileToggle.className = 'nav-toggle';
      mobileToggle.setAttribute('aria-label', 'Toggle navigation');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
      topbarCenter.insertBefore(mobileToggle, navLinks);
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
    // Settings/gear icon — clicking opens the panel; the panel's play button starts the presentation
    toggle.innerHTML = '<svg class="present-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 16.5v4"/><path d="M10.5 7.5l4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none"/></svg><span class="topbar-action-label" data-present-toggle-label></span>';

    // Wrap toggle in a launch-wrapper for hover dropdown
    var launchWrapper = document.createElement('div');
    launchWrapper.className = 'present-launch-wrapper';
    launchWrapper.appendChild(toggle);
    topbarActions.appendChild(launchWrapper);

    return toggle;
  };

  var ensureStyleToggle = function () {
    var btn = topbar.querySelector('[data-style-toggle]');

    if (btn) {
      return btn;
    }

    btn = document.createElement('button');
    btn.className = 'present-toggle present-style-toggle';
    btn.type = 'button';
    btn.setAttribute('data-style-toggle', '');
    btn.innerHTML = '<svg class="present-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5a9.5 9.5 0 1 0 0 19c1 0 1.6-.6 1.6-1.4 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H16a5.5 5.5 0 0 0 5.5-5.5C21.5 6.7 17.2 2.5 12 2.5z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="11" cy="7" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="17.5" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg><span class="topbar-action-label" data-style-toggle-label></span>';

    styleWrapper = document.createElement('div');
    styleWrapper.className = 'present-style-wrapper';
    styleWrapper.appendChild(btn);
    topbarActions.appendChild(styleWrapper);

    return btn;
  };

  /* ── Topbar inline toggles: theme (light/dark) + lang (zh/en) ──
     Replace the legacy palette panel: theme & lang flip directly from the topbar,
     no dropdown panel. */
  var ensureThemeToggle = function () {
    var btn = topbar.querySelector('[data-theme-toggle]');
    if (btn) return btn;
    btn = document.createElement('button');
    btn.className = 'present-toggle topbar-theme-toggle';
    btn.type = 'button';
    btn.setAttribute('data-theme-toggle', '');
    btn.setAttribute('aria-label', getLang() === 'zh' ? '切换深浅色' : 'Toggle theme');
    btn.innerHTML = ''
      + '<svg class="present-toggle-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      + '<svg class="present-toggle-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    topbarActions.appendChild(btn);
    return btn;
  };

  var ensureLangToggle = function () {
    var btn = topbar.querySelector('[data-lang-toggle]');
    if (btn) return btn;
    btn = document.createElement('button');
    btn.className = 'present-toggle topbar-lang-toggle';
    btn.type = 'button';
    btn.setAttribute('data-lang-toggle', '');
    btn.setAttribute('aria-label', 'Toggle language');
    btn.innerHTML = '<span class="topbar-lang-label">' + (getLang() === 'zh' ? 'EN' : '中') + '</span>';
    topbarActions.appendChild(btn);
    return btn;
  };

  /* ── Pre-launch settings panel (hover dropdown) ── */
  var launchPanelBuilt = false;

  var buildLaunchPanel = function () {
    if (launchPanelBuilt) return;
    launchPanelBuilt = true;

    var wrapper = topbar.querySelector('.present-launch-wrapper');
    if (!wrapper) return;

    var lang = getLang();
    var panel = document.createElement('div');
    panel.className = 'present-launch-panel';

    // Load saved settings
    var savedSettings = {};
    try { savedSettings = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
    var autoNarrate = localStorage.getItem('narration-autostart') === 'true';

    // Build panel HTML
    var zhMode = lang === 'zh';
    panel.innerHTML = [
      '<div class="launch-section">',
      '<h4 class="launch-section-title">' + (zhMode ? '语音讲解' : 'Narration') + '</h4>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '自动语音讲解' : 'Auto narration') + '</span>',
      '  <button type="button" class="launch-switch" data-launch="autoNarrate" aria-label="' + (zhMode ? '自动语音讲解' : 'Auto narration') + '"></button>',
      '</div>',
      '<div class="launch-voice-settings">',
      '  <div class="launch-divider"></div>',
      '  <div class="launch-row">',
      '    <span>' + (zhMode ? '引擎' : 'Engine') + '</span>',
      '    <select class="launch-select" data-launch="ttsProvider">',
      '      <option value="browser">' + (zhMode ? '浏览器内置' : 'Browser') + '</option>',
      '      <option value="vibevoice">VibeVoice (EN)</option>',
      '      <option value="moss-tts-nano">Qwen3-TTS (MLX)</option>',
      '      <option value="fish-s2">Fish Audio S2 (MLX)</option>',
      '    </select>',
      '  </div>',
      '  <div class="launch-row launch-moss-row" style="display:none;">',
      '    <span>' + (zhMode ? '音色' : 'Voice') + '</span>',
      '    <select class="launch-select" data-launch="mossTtsVoice">',
      '      <option value="vivian">vivian (' + (zhMode ? '活泼女声' : 'Female ZH') + ')</option>',
      '      <option value="serena">serena (' + (zhMode ? '温柔女声' : 'Female ZH') + ')</option>',
      '      <option value="uncle_fu">uncle_fu (' + (zhMode ? '成熟男声' : 'Male ZH') + ')</option>',
      '      <option value="dylan">dylan (' + (zhMode ? '京腔男声' : 'Male Beijing') + ')</option>',
      '      <option value="ryan">ryan (' + (zhMode ? '英文男声' : 'Male EN') + ')</option>',
      '      <option value="aiden">aiden (' + (zhMode ? '美式男声' : 'Male US') + ')</option>',
      '    </select>',
      '    <button type="button" class="launch-voice-test launch-clone-record" title="' + (zhMode ? '录制新声音' : 'Record new clone') + '" aria-label="' + (zhMode ? '录制新声音' : 'Record new clone') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '</button>',
      '    <button type="button" class="launch-voice-test launch-clone-delete" style="display:none;" title="' + (zhMode ? '删除当前克隆' : 'Delete current clone') + '" aria-label="' + (zhMode ? '删除' : 'Delete') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        '</button>',
      '  </div>',
      '  <div class="launch-row launch-moss-row launch-clone-quality-row" style="display:none;">',
      '    <span>' + (zhMode ? '克隆质量' : 'Clone quality') + '</span>',
      '    <select class="launch-select" data-launch="mossCloneQuality">',
      '      <option value="8bit">' + (zhMode ? '快速（8bit）' : 'Fast (8bit)') + '</option>',
      '      <option value="bf16">' + (zhMode ? '高质（bf16）' : 'High quality (bf16)') + '</option>',
      '    </select>',
      '  </div>',
      '  <div class="launch-row launch-fish-row" style="display:none;">',
      '    <span>' + (zhMode ? '音色' : 'Voice') + '</span>',
      '    <input type="text" class="launch-select" data-launch="fishTtsVoice" placeholder="' + (zhMode ? '留空 = 默认音色' : 'blank = default') + '" />',
      '  </div>',
      '  <div class="launch-row launch-tts-emotion-row" style="display:none;">',
      '    <span>' + (zhMode ? '情绪' : 'Emotion') + '</span>',
      '    <select class="launch-select" data-launch="ttsEmotion">',
      '      <option value="default">' + (zhMode ? '默认讲解' : 'Default narrator') + '</option>',
      '      <option value="passionate">' + (zhMode ? '充满激情' : 'Passionate') + '</option>',
      '      <option value="inspiring">' + (zhMode ? '激励鼓舞' : 'Inspiring') + '</option>',
      '      <option value="warm">' + (zhMode ? '温暖亲切' : 'Warm') + '</option>',
      '      <option value="cheerful">' + (zhMode ? '轻松愉快' : 'Cheerful') + '</option>',
      '      <option value="serious">' + (zhMode ? '严肃权威' : 'Serious') + '</option>',
      '      <option value="storytelling">' + (zhMode ? '娓娓道来' : 'Storytelling') + '</option>',
      '      <option value="urgent">' + (zhMode ? '紧迫急切' : 'Urgent') + '</option>',
      '    </select>',
      '  </div>',
      '  <div class="launch-row">',
      '    <span>' + (zhMode ? '音色' : 'Voice') + '</span>',
      '    <select class="launch-voice-select" data-launch="voiceName">',
      '      <option value="">' + (zhMode ? '自动' : 'Auto') + '</option>',
      '    </select>',
      '    <button type="button" class="launch-voice-test" aria-label="' + (zhMode ? '试听' : 'Preview') + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>' +
          '</button>',
      '  </div>',
      '  <div class="launch-row">',
      '    <span>' + (zhMode ? '语速' : 'Speed') + '</span>',
      '    <input type="range" class="launch-range" data-launch="rate" min="0.5" max="1.5" step="0.1" value="0.92" />',
      '    <span class="launch-rate-val">0.92</span>',
      '  </div>',
      '</div>',
      '</div>',
      '<div class="launch-section">',
      '<h4 class="launch-section-title">' + (zhMode ? '显示' : 'Display') + '</h4>',
      '<div class="launch-section-grid">',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '焦点模式' : 'Focus mode') + '</span>',
      '  <button type="button" class="launch-switch" data-launch="focusMode" aria-label="' + (zhMode ? '焦点模式：突出当前段落并虚化其他内容' : 'Focus mode: highlight active block, dim others') + '"></button>',
      '</div>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '手机优化' : 'Mobile optimized') + '</span>',
      '  <button type="button" class="launch-switch" data-launch="mobilePresent" aria-label="' + (zhMode ? '手机优化' : 'Mobile optimized') + '"></button>',
      '</div>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '左下角 Logo' : 'Bottom-left logo') + '</span>',
      '  <button type="button" class="launch-switch" data-launch="showLogo" aria-label="' + (zhMode ? '显示左下角 Logo' : 'Show bottom-left logo') + '"></button>',
      '</div>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '右下角按钮' : 'Bottom-right buttons') + '</span>',
      '  <button type="button" class="launch-switch" data-launch="showFab" aria-label="' + (zhMode ? '显示右下角按钮' : 'Show bottom-right buttons') + '"></button>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="launch-section">',
      '<h4 class="launch-section-title">' + (zhMode ? '外观' : 'Appearance') + '</h4>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '背景' : 'Background') + '</span>',
      '  <div class="launch-toggle-group" role="group" data-launch="presentBg">',
      '    <button type="button" class="launch-toggle" data-value="default">' + (zhMode ? '默认' : 'Default') + '</button>',
      '    <button type="button" class="launch-toggle" data-value="white">' + (zhMode ? '纯白' : 'White') + '</button>',
      '    <button type="button" class="launch-toggle" data-value="black">' + (zhMode ? '纯黑' : 'Black') + '</button>',
      '    <button type="button" class="launch-toggle" data-value="gray">' + (zhMode ? '浅灰' : 'Gray') + '</button>',
      '  </div>',
      '</div>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '字体' : 'Font') + '</span>',
      '  <select class="launch-select" data-launch="presentFont"></select>',
      '</div>',
      '</div>',
      '<div class="launch-section">',
      '<h4 class="launch-section-title">' + getLabel('transitions') + '</h4>',
      '<div class="launch-transition-options" data-launch="transitionOptions">',
      '  <button type="button" class="launch-transition-option" data-transition-style="fade">',
      '    <span class="launch-transition-preview is-fade"></span>',
      '    <span>' + getLabel('transitionFade') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-transition-option" data-transition-style="morph">',
      '    <span class="launch-transition-preview is-morph"></span>',
      '    <span>' + getLabel('transitionMorph') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-transition-option" data-transition-style="slide">',
      '    <span class="launch-transition-preview is-slide"></span>',
      '    <span>' + getLabel('transitionSlide') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-transition-option" data-transition-style="zoom">',
      '    <span class="launch-transition-preview is-zoom"></span>',
      '    <span>' + getLabel('transitionZoom') + '</span>',
      '  </button>',
      '</div>',
      '</div>',
      '<div class="launch-hero">',
      '  <button type="button" class="launch-play-btn" aria-label="' + (zhMode ? '开始演示' : 'Start Presentation') + '">',
      '    <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10 8l5 3-5 3V8z" fill="currentColor"/></svg>',
      '  </button>',
      '  <span class="launch-hero-label">' + (zhMode ? '开始演示' : 'Start Presentation') + '</span>',
      '</div>'
    ].join('\n');

    // Portal to topbar's parent so the panel sits in the same stacking context as the topbar,
    // above the backdrop and free from the topbar's transform / backdrop-filter containing block.
    var __launchHost = (topbar && topbar.parentElement) || document.body;
    __launchHost.appendChild(panel);
    wrapper._panel = panel;

    // DOM references
    // Lang select removed from launch panel — language now lives on the topbar toggle.
    // Provide a proxy so legacy narration code keeps reading the current page language.
    var langSelect = {
      get value() { return getLang(); },
      set value(v) {},
      addEventListener: function () {}
    };
    var autoNarrateBtn = panel.querySelector('[data-launch="autoNarrate"]');
    var voiceSection = panel.querySelector('.launch-voice-settings');
    var ttsSelect = panel.querySelector('[data-launch="ttsProvider"]');
    var voiceSelect = panel.querySelector('[data-launch="voiceName"]');
    var voiceTestBtn = panel.querySelector('.launch-voice-test');
    var rateInput = panel.querySelector('[data-launch="rate"]');
    var rateVal = panel.querySelector('.launch-rate-val');
    var mossRows = panel.querySelectorAll('.launch-moss-row');
    var mossTtsVoiceSelect = panel.querySelector('[data-launch="mossTtsVoice"]');
    var fishRows = panel.querySelectorAll('.launch-fish-row');
    var fishVoiceInput = panel.querySelector('[data-launch="fishTtsVoice"]');
    var emotionRow = panel.querySelector('.launch-tts-emotion-row');
    var emotionSelect = panel.querySelector('[data-launch="ttsEmotion"]');

    // VibeVoice preset voices
    var vibeVoices = [
      { value: 'en-Emma_woman', label: 'Emma (Woman)' },
      { value: 'en-Grace_woman', label: 'Grace (Woman)' },
      { value: 'en-Carter_man', label: 'Carter (Man)' },
      { value: 'en-Davis_man', label: 'Davis (Man)' },
      { value: 'en-Frank_man', label: 'Frank (Man)' },
      { value: 'en-Mike_man', label: 'Mike (Man)' }
    ];

    // Apply saved values
    if (savedSettings.ttsProvider) ttsSelect.value = savedSettings.ttsProvider;
    if (savedSettings.rate) { rateInput.value = savedSettings.rate; rateVal.textContent = parseFloat(savedSettings.rate).toFixed(2); }
    if (savedSettings.mossTtsVoice) mossTtsVoiceSelect.value = savedSettings.mossTtsVoice;
    if (savedSettings.fishTtsVoice && fishVoiceInput) fishVoiceInput.value = savedSettings.fishTtsVoice;
    var launchCloneQualitySelect = panel.querySelector('[data-launch="mossCloneQuality"]');
    if (launchCloneQualitySelect && savedSettings.mossCloneQuality) launchCloneQualitySelect.value = savedSettings.mossCloneQuality;
    if (emotionSelect && savedSettings.ttsEmotion) emotionSelect.value = savedSettings.ttsEmotion;
    if (autoNarrate) autoNarrateBtn.classList.add('is-on');

    // Mobile present toggle
    var mobilePresentBtn = panel.querySelector('[data-launch="mobilePresent"]');
    if (mobilePresentEnabled) mobilePresentBtn.classList.add('is-on');

    // ── Display options: logo / fab / transition style ──
    // (Theme / background / font live in the Style panel — keep them out of the launch panel.)
    var showLogoBtn = panel.querySelector('[data-launch="showLogo"]');
    var showFabBtn = panel.querySelector('[data-launch="showFab"]');
    var transitionOptions = panel.querySelectorAll('[data-transition-style]');

    var showLogo = localStorage.getItem('present-show-logo') !== 'false'; // default true
    var showFab = localStorage.getItem('present-show-fab') !== 'false';   // default true
    var presentTransition = localStorage.getItem('present-transition-style') || 'fade';

    var applyShowLogo = function (on) {
      document.body.classList.toggle('present-hide-logo', !on);
    };
    var applyShowFab = function (on) {
      document.body.classList.toggle('present-hide-fab', !on);
    };

    if (showLogo) showLogoBtn.classList.add('is-on');
    if (showFab) showFabBtn.classList.add('is-on');
    transitionOptions.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-transition-style') === presentTransition);
    });
    // Apply on load
    applyShowLogo(showLogo);
    applyShowFab(showFab);
    applyPresentationTransitionStyle(presentTransition);

    showLogoBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      showLogoBtn.classList.toggle('is-on');
      var on = showLogoBtn.classList.contains('is-on');
      localStorage.setItem('present-show-logo', on ? 'true' : 'false');
      applyShowLogo(on);
    });
    showFabBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      showFabBtn.classList.toggle('is-on');
      var on = showFabBtn.classList.contains('is-on');
      localStorage.setItem('present-show-fab', on ? 'true' : 'false');
      applyShowFab(on);
    });
    transitionOptions.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var style = btn.getAttribute('data-transition-style') || 'fade';
        transitionOptions.forEach(function (item) {
          item.classList.toggle('is-active', item === btn);
        });
        localStorage.setItem('present-transition-style', style);
        applyPresentationTransitionStyle(style);
      });
    });

    // Track last known browser/vibe voice selections separately
    var lastBrowserVoice = savedSettings.voiceName || '';
    var lastVibeVoice = savedSettings.vibeVoice || 'en-Emma_woman';

    // Sync voice section visibility
    var syncVoiceExpanded = function () {
      var needsVoice = autoNarrateBtn.classList.contains('is-on');
      if (needsVoice) {
        voiceSection.classList.add('is-expanded');
      } else {
        voiceSection.classList.remove('is-expanded');
      }
    };
    syncVoiceExpanded();

    // Populate browser voices into voiceSelect
    var populateBrowserVoices = function () {
      if (!window.speechSynthesis) return;
      var allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || !allVoices.length) return;

      var filterLang = langSelect.value;
      if (filterLang === 'auto') filterLang = getLang();
      var langPrefix = (filterLang === 'zh') ? 'zh' : 'en';

      while (voiceSelect.options.length > 1) {
        voiceSelect.removeChild(voiceSelect.lastChild);
      }
      voiceSelect.options[0].textContent = zhMode ? '自动' : 'Auto';

      var dialectMap = {
        'zh-CN': '普通话', 'zh-TW': '台湾', 'zh-HK': '粤语',
        'en-US': 'US', 'en-GB': 'UK', 'en-AU': 'AU', 'en-IN': 'IN'
      };

      allVoices.forEach(function (v) {
        if (v.lang.indexOf(langPrefix) !== 0) return;
        var opt = document.createElement('option');
        opt.value = v.name;
        var coreName = v.name.replace(/\s*\(.*\)\s*$/, '');
        var dialectLabel = dialectMap[v.lang] || v.lang;
        opt.textContent = coreName + ' · ' + dialectLabel;
        voiceSelect.appendChild(opt);
      });

      if (lastBrowserVoice) voiceSelect.value = lastBrowserVoice;
    };

    // Populate VibeVoice presets into voiceSelect
    var populateVibeVoices = function () {
      while (voiceSelect.options.length) {
        voiceSelect.removeChild(voiceSelect.lastChild);
      }

      vibeVoices.forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v.value;
        opt.textContent = v.label;
        voiceSelect.appendChild(opt);
      });

      voiceSelect.value = lastVibeVoice;
    };

    // Sync voice list based on current TTS provider
    var syncVoiceList = function () {
      var provider = ttsSelect.value;
      var isMoss = provider === 'moss-tts-nano';
      var isVibe = provider === 'vibevoice';
      var isFish = provider === 'fish-s2';
      // Show/hide MOSS rows
      mossRows.forEach(function (row) { row.style.display = isMoss ? '' : 'none'; });
      // Show/hide Fish rows
      fishRows.forEach(function (row) { row.style.display = isFish ? '' : 'none'; });
      // Emotion row applies to both Qwen and Fish (any local TTS that accepts `instructions`)
      if (emotionRow) emotionRow.style.display = (isMoss || isFish) ? '' : 'none';
      // Show/hide voice select row (hide for MOSS / Fish since they manage their own voice)
      var voiceRow = voiceSelect.closest('.launch-row');
      if (voiceRow) voiceRow.style.display = (isMoss || isFish) ? 'none' : '';
      if (isVibe) {
        populateVibeVoices();
      } else {
        populateBrowserVoices();
      }
    };
    syncVoiceList();

    // Save all settings
    var articleSlug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
    var articleKey = articleSlug ? ('narration-settings:' + articleSlug) : '';

    var saveLaunchSettings = function () {
      var isVibe = ttsSelect.value === 'vibevoice';
      var isMoss = ttsSelect.value === 'moss-tts-nano';
      var isFish = ttsSelect.value === 'fish-s2';
      // Update tracked selections
      if (isVibe) {
        lastVibeVoice = voiceSelect.value;
      } else if (!isMoss && !isFish) {
        lastBrowserVoice = voiceSelect.value;
      }

      var s = {
        lang: langSelect.value === 'auto' ? '' : langSelect.value,
        rate: parseFloat(rateInput.value),
        voiceName: isVibe ? lastBrowserVoice : voiceSelect.value,
        vibeVoice: isVibe ? voiceSelect.value : lastVibeVoice,
        ttsProvider: ttsSelect.value,
        ttsEngine: isMoss ? 'moss-tts-nano' : (isFish ? 'fish-s2' : ''),
        mossTtsVoice: mossTtsVoiceSelect.value,
        fishTtsVoice: fishVoiceInput ? fishVoiceInput.value.trim() : '',
        mossCloneQuality: launchCloneQualitySelect ? launchCloneQualitySelect.value : '8bit',
        ttsEmotion: emotionSelect ? emotionSelect.value : 'default'
      };
      localStorage.setItem('narration-settings', JSON.stringify(s));
      // Also write per-article key so narration controller picks it up
      if (articleKey) {
        localStorage.setItem(articleKey, JSON.stringify(s));
      }
      localStorage.setItem('narration-autostart', autoNarrateBtn.classList.contains('is-on') ? 'true' : 'false');

      // Sync existing narration settings panel from storage
      var existingPanel = document.querySelector('.narration-settings-panel');
      if (existingPanel && existingPanel._refreshFromStorage) {
        existingPanel._refreshFromStorage();
      }
    };

    // Toggle switches
    autoNarrateBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      autoNarrateBtn.classList.toggle('is-on');
      syncVoiceExpanded();
      saveLaunchSettings();
    });

    mobilePresentBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      mobilePresentBtn.classList.toggle('is-on');
      var isOn = mobilePresentBtn.classList.contains('is-on');
      localStorage.setItem('present-mobile-mode', isOn ? 'true' : 'false');
      document.dispatchEvent(new CustomEvent('mobilePresentChanged', { detail: { enabled: isOn } }));
    });

    // Focus mode toggle
    var focusModeBtn = panel.querySelector('[data-launch="focusMode"]');
    if (focusModeBtn) {
      if (focusModeEnabled) focusModeBtn.classList.add('is-on');
      focusModeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        focusModeBtn.classList.toggle('is-on');
        var isOn = focusModeBtn.classList.contains('is-on');
        localStorage.setItem('present-focus-mode', isOn ? 'true' : 'false');
        document.dispatchEvent(new CustomEvent('focusModeChanged', { detail: { enabled: isOn } }));
      });
    }

    /* ── Appearance: background + font (migrated from style panel) ── */
    var bgGroup = panel.querySelector('[data-launch="presentBg"]');
    var fontSelect = panel.querySelector('[data-launch="presentFont"]');

    var FONT_PRESETS = {
      zh: [
        { value: 'default', label: '默认（Noto Sans SC）', stack: '' },
        { value: 'noto-serif-sc', label: '思源宋体', stack: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif' },
        { value: 'pingfang', label: '苹方 PingFang', stack: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif' },
        { value: 'yahei', label: '微软雅黑', stack: '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif' },
        { value: 'heiti', label: '黑体', stack: '"Heiti SC", "黑体", "STHeiti", "PingFang SC", sans-serif' },
        { value: 'kaiti', label: '楷体', stack: '"Kaiti SC", "STKaiti", "楷体", "KaiTi", serif' },
        { value: 'songti', label: '宋体', stack: '"Songti SC", "STSong", "宋体", "SimSun", serif' },
        { value: 'fangsong', label: '仿宋', stack: '"FangSong", "STFangsong", "仿宋", serif' }
      ],
      en: [
        { value: 'default', label: 'Default (Noto Sans)', stack: '' },
        { value: 'helvetica', label: 'Helvetica', stack: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
        { value: 'arial', label: 'Arial', stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
        { value: 'calibri', label: 'Calibri', stack: 'Calibri, Candara, Segoe, "Segoe UI", Optima, sans-serif' },
        { value: 'segoe', label: 'Segoe UI', stack: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
        { value: 'roboto', label: 'Roboto', stack: 'Roboto, "Helvetica Neue", Arial, sans-serif' },
        { value: 'inter', label: 'Inter', stack: 'Inter, "Segoe UI", Roboto, sans-serif' },
        { value: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", Times, serif' },
        { value: 'times', label: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
        { value: 'garamond', label: 'Garamond', stack: 'Garamond, "EB Garamond", Georgia, serif' }
      ]
    };

    var applyPresentBg = function (val) {
      var classes = ['present-bg-white', 'present-bg-black', 'present-bg-gray'];
      classes.forEach(function (c) { document.body.classList.remove(c); });
      if (val === 'white') document.body.classList.add('present-bg-white');
      else if (val === 'black') document.body.classList.add('present-bg-black');
      else if (val === 'gray') document.body.classList.add('present-bg-gray');
    };

    var applyPresentFont = function (langKey, value) {
      var list = FONT_PRESETS[langKey] || FONT_PRESETS.en;
      var entry = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) { entry = list[i]; break; }
      }
      if (!entry || !entry.stack) {
        document.documentElement.style.removeProperty('--present-font');
        document.body.classList.remove('present-custom-font');
      } else {
        document.documentElement.style.setProperty('--present-font', entry.stack);
        document.body.classList.add('present-custom-font');
      }
    };

    var populatePresentFontOptions = function (langKey) {
      if (!fontSelect) return;
      var list = FONT_PRESETS[langKey] || FONT_PRESETS.en;
      while (fontSelect.options.length) {
        fontSelect.removeChild(fontSelect.lastChild);
      }
      list.forEach(function (item) {
        var opt = document.createElement('option');
        opt.value = item.value;
        opt.textContent = item.label;
        if (item.stack) opt.style.fontFamily = item.stack;
        fontSelect.appendChild(opt);
      });
      var saved = localStorage.getItem('present-font:' + langKey) || 'default';
      fontSelect.value = saved;
      applyPresentFont(langKey, saved);
    };

    if (bgGroup) {
      var initialBg = localStorage.getItem('present-bg') || 'default';
      bgGroup.querySelectorAll('.launch-toggle').forEach(function (btn) {
        if (btn.getAttribute('data-value') === initialBg) btn.classList.add('is-active');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var v = btn.getAttribute('data-value');
          bgGroup.querySelectorAll('.launch-toggle').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          localStorage.setItem('present-bg', v);
          applyPresentBg(v);
        });
      });
      applyPresentBg(initialBg);
    }

    if (fontSelect) {
      populatePresentFontOptions(getLang() === 'zh' ? 'zh' : 'en');
      fontSelect.addEventListener('change', function () {
        var langKey = getLang() === 'zh' ? 'zh' : 'en';
        localStorage.setItem('present-font:' + langKey, fontSelect.value);
        applyPresentFont(langKey, fontSelect.value);
      });
    }

    langSelect.addEventListener('change', function () {
      // Stub — lang now switches via the topbar toggle; the langChanged listener below
      // handles voice/font refresh.
    });

    document.addEventListener('langChanged', function () {
      var selectedLang = getLang();
      if (ttsSelect.value !== 'vibevoice') {
        lastBrowserVoice = '';
        syncVoiceList();
      }
      populatePresentFontOptions(selectedLang === 'zh' ? 'zh' : 'en');
      if (state.enabled) {
        setPresentationStep(state.index);
      }
      saveLaunchSettings();
    });

    ttsSelect.addEventListener('change', function () {
      syncVoiceList();
      saveLaunchSettings();
    });

    mossTtsVoiceSelect.addEventListener('change', function () {
      updateLaunchCloneUI();
      saveLaunchSettings();
    });
    if (launchCloneQualitySelect) launchCloneQualitySelect.addEventListener('change', saveLaunchSettings);
    var launchCloneRecordBtn = panel.querySelector('.launch-clone-record');
    var launchCloneDeleteBtn = panel.querySelector('.launch-clone-delete');
    var launchCloneQualityRow = panel.querySelector('.launch-clone-quality-row');

    var refreshLaunchCloneOptions = function (selectId) {
      var clones = loadVoiceClones();
      // Remove existing clone options
      var toRemove = [];
      for (var i = 0; i < mossTtsVoiceSelect.options.length; i++) {
        if (mossTtsVoiceSelect.options[i].value.indexOf('clone:') === 0) {
          toRemove.push(mossTtsVoiceSelect.options[i]);
        }
      }
      toRemove.forEach(function (o) { o.remove(); });
      // Prepend (newest first)
      clones.slice().reverse().forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = 'clone:' + c.id;
        var dur = c.duration ? c.duration.toFixed(1) + 's' : '';
        opt.textContent = '🎙 ' + c.name + (dur ? ' · ' + dur : '');
        mossTtsVoiceSelect.insertBefore(opt, mossTtsVoiceSelect.firstChild);
      });
      var want = selectId || mossTtsVoiceSelect.value;
      if (want && Array.prototype.some.call(mossTtsVoiceSelect.options, function (o) { return o.value === want; })) {
        mossTtsVoiceSelect.value = want;
      }
      updateLaunchCloneUI();
    };

    var updateLaunchCloneUI = function () {
      var isClone = mossTtsVoiceSelect.value.indexOf('clone:') === 0;
      if (launchCloneDeleteBtn) launchCloneDeleteBtn.style.display = isClone ? '' : 'none';
      if (launchCloneQualityRow) launchCloneQualityRow.style.display = isClone ? '' : 'none';
    };

    refreshLaunchCloneOptions(savedSettings.mossTtsVoice || null);

    if (launchCloneRecordBtn) {
      launchCloneRecordBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openVoiceCloneModal(function (entry) {
          refreshLaunchCloneOptions('clone:' + entry.id);
          saveLaunchSettings();
        });
      });
    }
    if (launchCloneDeleteBtn) {
      launchCloneDeleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var current = mossTtsVoiceSelect.value;
        if (current.indexOf('clone:') !== 0) return;
        var id = current.slice(6);
        var clones = loadVoiceClones();
        var entry = null;
        for (var i = 0; i < clones.length; i++) { if (clones[i].id === id) { entry = clones[i]; break; } }
        var name = entry ? entry.name : '';
        var msg = (zhMode ? '确定删除克隆声音 “' : 'Delete cloned voice “') + name + (zhMode ? '” 吗？此操作不可恢复。' : '”? This cannot be undone.');
        if (!window.confirm(msg)) return;
        var remaining = clones.filter(function (c) { return c.id !== id; });
        saveVoiceClones(remaining);
        mossTtsVoiceSelect.value = 'vivian';
        refreshLaunchCloneOptions('vivian');
        saveLaunchSettings();
      });
    }
    if (fishVoiceInput) {
      fishVoiceInput.addEventListener('input', saveLaunchSettings);
      fishVoiceInput.addEventListener('change', saveLaunchSettings);
    }
    if (emotionSelect) {
      emotionSelect.addEventListener('change', saveLaunchSettings);
    }

    rateInput.addEventListener('input', function () {
      rateVal.textContent = parseFloat(rateInput.value).toFixed(2);
      saveLaunchSettings();
    });

    voiceSelect.addEventListener('change', function () {
      saveLaunchSettings();
    });

    // Initial voice list population
    syncVoiceList();
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', function () {
        if (ttsSelect.value !== 'vibevoice') {
          populateBrowserVoices();
        }
      });
    }

    // Voice test button — handles both browser and VibeVoice
    voiceTestBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var isVibe = ttsSelect.value === 'vibevoice';

      if (isVibe) {
        // VibeVoice preview via API
        var vibeSettings = {
          endpoint: 'http://127.0.0.1:8191/v1',
          voice: voiceSelect.value || 'en-Emma_woman'
        };
        var testText = 'This is a voice preview. You can hear how the selected voice sounds.';
        voiceTestBtn.classList.add('is-testing');

        fetch(vibeSettings.endpoint + '/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer dummy' },
          body: JSON.stringify({
            model: 'VibeVoice-Realtime-0.5B-4bit',
            input: testText,
            voice: vibeSettings.voice,
            speed: parseFloat(rateInput.value) || 1.0
          })
        })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(function (buf) {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          return ctx.decodeAudioData(buf).then(function (audioBuf) {
            var src = ctx.createBufferSource();
            src.buffer = audioBuf;
            src.connect(ctx.destination);
            src.onended = function () { voiceTestBtn.classList.remove('is-testing'); };
            src.start(0);
          });
        })
        .catch(function (err) {
          voiceTestBtn.classList.remove('is-testing');
          console.error('VibeVoice preview error:', err);
          window.alert(getLang() === 'zh' ? 'VibeVoice 试听失败，请确认服务已启动' : 'VibeVoice preview failed. Ensure the service is running.');
        });
        return;
      }

      // Browser TTS preview
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      var filterLang = langSelect.value;
      if (filterLang === 'auto') filterLang = getLang();
      var browserTestText = (filterLang === 'zh')
        ? '这是一段语音测试，你可以听到当前选择的语音效果。'
        : 'This is a voice preview. You can hear how the selected voice sounds.';

      var utt = new SpeechSynthesisUtterance(browserTestText);
      utt.lang = (filterLang === 'zh') ? 'zh-CN' : 'en-US';
      utt.rate = parseFloat(rateInput.value) || 0.92;

      if (voiceSelect.value) {
        var allV = window.speechSynthesis.getVoices();
        var match = allV.filter(function (v) { return v.name === voiceSelect.value; });
        if (match.length) utt.voice = match[0];
      }

      voiceTestBtn.classList.add('is-testing');
      utt.onend = function () { voiceTestBtn.classList.remove('is-testing'); };
      utt.onerror = function () { voiceTestBtn.classList.remove('is-testing'); };
      window.speechSynthesis.speak(utt);
    });

    // Prevent panel clicks from triggering presentation start
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Launch play button — starts presentation from inside the panel
    var launchPlayBtn = panel.querySelector('.launch-play-btn');
    if (launchPlayBtn) {
      launchPlayBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        // Close the panel
        closeTopbarPanels();
        // Enter presentation directly (do not route through toggle to avoid the no-op toggle handler)
        if (state.enabled) return;
        enterPresentation();
        if (hasNarrationSupport() && localStorage.getItem('narration-autostart') === 'true') {
          startAutoNarration();
        }
      });
    }
  };

  var stylePanelBuilt = false;

  var buildStylePanel = function () {
    if (stylePanelBuilt) return;
    stylePanelBuilt = true;

    var wrapper = topbar.querySelector('.present-style-wrapper');
    if (!wrapper) return;

    var STYLE_PANEL_COPY = {
      langLabel: { zh: '语言', en: 'Language' },
      themeLabel: { zh: '明暗模式', en: 'Theme' },
      backgroundLabel: { zh: '背景', en: 'Background' },
      fontLabel: { zh: '字体', en: 'Font' },
      themeLight: { zh: '浅色', en: 'Light' },
      themeDark: { zh: '深色', en: 'Dark' },
      bgDefault: { zh: '默认', en: 'Default' },
      bgWhite: { zh: '纯白', en: 'White' },
      bgBlack: { zh: '纯黑', en: 'Black' },
      bgGray: { zh: '浅灰', en: 'Gray' }
    };
    var getStylePanelCopy = function (key) {
      var langKey = getLang() === 'zh' ? 'zh' : 'en';
      var entry = STYLE_PANEL_COPY[key];
      return entry && entry[langKey] ? entry[langKey] : '';
    };
    var panel = document.createElement('div');
    panel.className = 'present-style-panel';
    panel.innerHTML = [
      '<div class="style-panel-header">',
      '  <strong data-style-panel-title>' + getLabel('style') + '</strong>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="langLabel">' + getStylePanelCopy('langLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <div class="style-panel-toggle-group" role="group" data-style-panel="lang" data-style-panel-group-label="langLabel" aria-label="' + getStylePanelCopy('langLabel') + '">',
      '      <button type="button" class="style-panel-toggle" data-value="zh">中文</button>',
      '      <button type="button" class="style-panel-toggle" data-value="en">English</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="themeLabel">' + getStylePanelCopy('themeLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <div class="style-panel-toggle-group" role="group" data-style-panel="theme" data-style-panel-group-label="themeLabel" aria-label="' + getStylePanelCopy('themeLabel') + '">',
      '      <button type="button" class="style-panel-toggle" data-value="light" data-style-panel-copy="themeLight">' + getStylePanelCopy('themeLight') + '</button>',
      '      <button type="button" class="style-panel-toggle" data-value="dark" data-style-panel-copy="themeDark">' + getStylePanelCopy('themeDark') + '</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="backgroundLabel">' + getStylePanelCopy('backgroundLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <div class="style-panel-toggle-group" role="group" data-style-panel="presentBg" data-style-panel-group-label="backgroundLabel" aria-label="' + getStylePanelCopy('backgroundLabel') + '">',
      '      <button type="button" class="style-panel-toggle" data-value="default" data-style-panel-copy="bgDefault">' + getStylePanelCopy('bgDefault') + '</button>',
      '      <button type="button" class="style-panel-toggle" data-value="white" data-style-panel-copy="bgWhite">' + getStylePanelCopy('bgWhite') + '</button>',
      '      <button type="button" class="style-panel-toggle" data-value="black" data-style-panel-copy="bgBlack">' + getStylePanelCopy('bgBlack') + '</button>',
      '      <button type="button" class="style-panel-toggle" data-value="gray" data-style-panel-copy="bgGray">' + getStylePanelCopy('bgGray') + '</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="fontLabel">' + getStylePanelCopy('fontLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <select class="style-panel-select" data-style-panel="presentFont"></select>',
      '  </div>',
      '</div>'
    ].join('\n');

    // Portal to topbar's parent so the panel sits in the same stacking context as the topbar.
    var __styleHost = (topbar && topbar.parentElement) || document.body;
    __styleHost.appendChild(panel);
    wrapper._panel = panel;

    var langGroup = panel.querySelector('[data-style-panel="lang"]');
    var themeGroup = panel.querySelector('[data-style-panel="theme"]');
    var bgGroup = panel.querySelector('[data-style-panel="presentBg"]');
    var fontSelect = panel.querySelector('[data-style-panel="presentFont"]');

    var FONT_PRESETS = {
      zh: [
        { value: 'default', label: '默认（Noto Sans SC）', stack: '' },
        { value: 'noto-serif-sc', label: '思源宋体', stack: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif' },
        { value: 'pingfang', label: '苹方 PingFang', stack: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif' },
        { value: 'yahei', label: '微软雅黑', stack: '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif' },
        { value: 'heiti', label: '黑体', stack: '"Heiti SC", "黑体", "STHeiti", "PingFang SC", sans-serif' },
        { value: 'kaiti', label: '楷体', stack: '"Kaiti SC", "STKaiti", "楷体", "KaiTi", serif' },
        { value: 'songti', label: '宋体', stack: '"Songti SC", "STSong", "宋体", "SimSun", serif' },
        { value: 'fangsong', label: '仿宋', stack: '"FangSong", "STFangsong", "仿宋", serif' }
      ],
      en: [
        { value: 'default', label: 'Default (Noto Sans)', stack: '' },
        { value: 'helvetica', label: 'Helvetica', stack: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
        { value: 'arial', label: 'Arial', stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
        { value: 'calibri', label: 'Calibri', stack: 'Calibri, Candara, Segoe, "Segoe UI", Optima, sans-serif' },
        { value: 'segoe', label: 'Segoe UI', stack: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
        { value: 'roboto', label: 'Roboto', stack: 'Roboto, "Helvetica Neue", Arial, sans-serif' },
        { value: 'inter', label: 'Inter', stack: 'Inter, "Segoe UI", Roboto, sans-serif' },
        { value: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", Times, serif' },
        { value: 'times', label: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
        { value: 'garamond', label: 'Garamond', stack: 'Garamond, "EB Garamond", Georgia, serif' }
      ]
    };

    var applyPresentBg = function (val) {
      var classes = ['present-bg-white', 'present-bg-black', 'present-bg-gray'];
      classes.forEach(function (c) { document.body.classList.remove(c); });
      if (val === 'white') document.body.classList.add('present-bg-white');
      else if (val === 'black') document.body.classList.add('present-bg-black');
      else if (val === 'gray') document.body.classList.add('present-bg-gray');
    };

    var syncStylePanelCopy = function () {
      var title = panel.querySelector('[data-style-panel-title]');
      if (title) {
        title.textContent = getLabel('style');
      }

      panel.querySelectorAll('[data-style-panel-copy]').forEach(function (el) {
        var key = el.getAttribute('data-style-panel-copy');
        el.textContent = getStylePanelCopy(key);
      });

      panel.querySelectorAll('[data-style-panel-group-label]').forEach(function (group) {
        var key = group.getAttribute('data-style-panel-group-label');
        group.setAttribute('aria-label', getStylePanelCopy(key));
      });
    };

    var setToggleGroupValue = function (group, value) {
      if (!group) return;

      group.setAttribute('data-selected', value);
      group.querySelectorAll('.style-panel-toggle').forEach(function (button) {
        var isActive = button.getAttribute('data-value') === value;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    var bindToggleGroup = function (group, onChange) {
      if (!group) return;

      group.querySelectorAll('.style-panel-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-value');
          if (group.getAttribute('data-selected') === value) {
            return;
          }

          setToggleGroupValue(group, value);
          onChange(value);
        });
      });
    };

    var applyPresentFont = function (langKey, value) {
      var list = FONT_PRESETS[langKey] || FONT_PRESETS.en;
      var entry = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) {
          entry = list[i];
          break;
        }
      }
      if (!entry || !entry.stack) {
        document.documentElement.style.removeProperty('--present-font');
        document.body.classList.remove('present-custom-font');
      } else {
        document.documentElement.style.setProperty('--present-font', entry.stack);
        document.body.classList.add('present-custom-font');
      }
    };

    var populatePresentFontOptions = function (langKey) {
      var list = FONT_PRESETS[langKey] || FONT_PRESETS.en;
      while (fontSelect.options.length) {
        fontSelect.removeChild(fontSelect.lastChild);
      }

      list.forEach(function (item) {
        var opt = document.createElement('option');
        opt.value = item.value;
        opt.textContent = item.label;
        if (item.stack) opt.style.fontFamily = item.stack;
        fontSelect.appendChild(opt);
      });

      var saved = localStorage.getItem('present-font:' + langKey) || 'default';
      fontSelect.value = saved;
      applyPresentFont(langKey, saved);
    };

    var syncPanelState = function () {
      var lang = getLang();
      var currentTheme = root.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
      var bg = localStorage.getItem('present-bg') || 'default';
      var langKey = lang === 'zh' ? 'zh' : 'en';

      syncStylePanelCopy();
      setToggleGroupValue(langGroup, lang);
      setToggleGroupValue(themeGroup, currentTheme === 'dark' ? 'dark' : 'light');
      setToggleGroupValue(bgGroup, bg);
      populatePresentFontOptions(langKey);
      applyPresentBg(bg);
    };

    bindToggleGroup(langGroup, function (value) {
      applyLanguageToDocument(value);
      syncPanelState();
      updatePresentationLabels();
    });

    bindToggleGroup(themeGroup, function (value) {
      root.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
    });

    bindToggleGroup(bgGroup, function (value) {
      localStorage.setItem('present-bg', value);
      applyPresentBg(value);
    });

    fontSelect.addEventListener('change', function () {
      var langKey = getLang() === 'zh' ? 'zh' : 'en';
      localStorage.setItem('present-font:' + langKey, fontSelect.value);
      applyPresentFont(langKey, fontSelect.value);
    });

    document.addEventListener('langChanged', function () {
      syncPanelState();
    });

    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    syncPanelState();
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
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="topbar-action-label" data-share-toggle-label></span>';
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

    // Email newsletter item
    var emailItem = document.createElement('button');
    emailItem.className = 'share-menu-item';
    emailItem.type = 'button';
    emailItem.setAttribute('role', 'menuitem');
    emailItem.setAttribute('data-share-email', '');
    emailItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M22 7l-10 7L2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="share-item-label"></span>';
    menu.appendChild(emailItem);

    // Record video item
    var recordItem = document.createElement('button');
    recordItem.className = 'share-menu-item';
    recordItem.type = 'button';
    recordItem.setAttribute('role', 'menuitem');
    recordItem.setAttribute('data-share-record', '');
    recordItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span class="share-item-label"></span>';
    menu.appendChild(recordItem);

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
      closeTopbarPanels();
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

    // Email newsletter handler
    emailItem.addEventListener('click', function () {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      shareEmailNewsletter();
    });

    // Record video handler
    recordItem.addEventListener('click', function () {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      toggleRecording();
    });

    return wrapper;
  };

  var ensureTopbarOverlayBackdrop = function () {
    if (topbarOverlayBackdrop) {
      return topbarOverlayBackdrop;
    }

    topbarOverlayBackdrop = document.createElement('button');
    topbarOverlayBackdrop.className = 'topbar-overlay-backdrop';
    topbarOverlayBackdrop.type = 'button';
    topbarOverlayBackdrop.setAttribute('aria-label', 'Close panel');
    topbarOverlayBackdrop.addEventListener('click', function () {
      closeTopbarPanels();
    });
    // Append into topbar's parent so the backdrop shares the same stacking context as the topbar
    // (the .site wrapper has z-index:1, which would otherwise trap the topbar below a body-level backdrop).
    var host = (topbar && topbar.parentElement) || document.body;
    host.appendChild(topbarOverlayBackdrop);

    return topbarOverlayBackdrop;
  };

  var closeTopbarPanels = function () {
    var launchWrapper = topbar && topbar.querySelector('.present-launch-wrapper');
    var stylePanelWrapper = topbar && topbar.querySelector('.present-style-wrapper');

    if (launchWrapper) {
      launchWrapper.classList.remove('is-open');
      if (launchWrapper._panel) launchWrapper._panel.classList.remove('is-open');
    }
    if (stylePanelWrapper) {
      stylePanelWrapper.classList.remove('is-open');
      if (stylePanelWrapper._panel) stylePanelWrapper._panel.classList.remove('is-open');
    }
    if (topbarOverlayBackdrop) topbarOverlayBackdrop.classList.remove('is-open');
    root.classList.remove('has-topbar-overlay');
  };

  var openTopbarPanel = function (wrapperSelector) {
    var wrapper = topbar && topbar.querySelector(wrapperSelector);

    if (!wrapper) {
      return;
    }

    closeTopbarPanels();
    ensureTopbarOverlayBackdrop();
    wrapper.classList.add('is-open');
    if (wrapper._panel) wrapper._panel.classList.add('is-open');
    topbarOverlayBackdrop.classList.add('is-open');
    root.classList.add('has-topbar-overlay');
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
    presentationExit.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
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

    // Narration prefetch progress bar
    prefetchBar = document.createElement('div');
    prefetchBar.className = 'present-prefetch-bar';
    prefetchBar.innerHTML = '<div class="present-prefetch-fill"></div><div class="present-prefetch-pointer"></div>';
    prefetchBar.style.display = 'none';
    status.appendChild(prefetchBar);

    floating.appendChild(status);

    // Bottom-left brand logo
    var brandLogo = document.createElement('div');
    brandLogo.className = 'present-brand-logo';
    brandLogo.innerHTML = '<span class="present-brand-dot"></span><span class="present-brand-text"><span class="present-brand-owner">illusion615\'s</span><span class="present-brand-name">Knowledge Hub</span></span>';
    floating.appendChild(brandLogo);

    // Narration subtitle overlay (outside floating for independent positioning)
    narrationSubtitle = document.createElement('div');
    narrationSubtitle.className = 'narration-subtitle';
    narrationSubtitle.setAttribute('aria-live', 'polite');

    if (footer && footer.parentNode === site) {
      site.insertBefore(floating, footer);
      site.insertBefore(narrationSubtitle, footer);
    } else {
      site.appendChild(floating);
      site.appendChild(narrationSubtitle);
    }

    return floating;
  };

  /* ── Narration FAB — takes over assistant-fab in presentation mode ── */
  var NARRATION_SVG_PLAY = '<span class="narration-indicator"><span></span><span></span><span></span></span>';
  var NARRATION_SVG_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  var NARRATION_SVG_STOP = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  var NARRATION_SVG_WAVE = '<span class="narration-indicator is-active"><span></span><span></span><span></span></span>';
  var NARRATION_SVG_GENERATING = '<span class="narration-generating-spinner"></span>';
  var NARRATION_SVG_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var SVG_SETTINGS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';
  var SVG_RECORD = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';

  var narrationCapsuleSettingsBtn = null;
  var narrationCapsuleRecordBtn = null;
  var narrationCapsuleChatBtn = null;

  var ensureNarrationFab = function () {
    // Reuse existing assistant-fab or create a new one
    var fab = document.querySelector('.assistant-fab');
    if (!fab) {
      fab = document.createElement('button');
      fab.className = 'assistant-fab';
      fab.setAttribute('aria-label', 'AI');
      // Show narration indicator icon by default; assistant.js overrides with chat icon if LLM is configured
      fab.innerHTML = NARRATION_SVG_PLAY;
      document.body.appendChild(fab);
    }
    presentationAutoPlay = fab;
    return fab;
  };

  /** Build capsule structure inside the FAB (only in presentation mode) */
  var buildCapsuleStructure = function () {
    var fab = presentationAutoPlay;
    if (!fab) return;

    // Build capsule inner structure if not already built
    if (!fab.querySelector('.narration-capsule-actions')) {
      // Save original HTML to restore on exit
      fab.setAttribute('data-original-html', fab.innerHTML);

      var actions = document.createElement('div');
      actions.className = 'narration-capsule-actions';

      // Settings button
      narrationCapsuleSettingsBtn = document.createElement('button');
      narrationCapsuleSettingsBtn.className = 'narration-capsule-btn';
      narrationCapsuleSettingsBtn.type = 'button';
      narrationCapsuleSettingsBtn.setAttribute('aria-label', getLang() === 'zh' ? '讲解设置' : 'Settings');
      narrationCapsuleSettingsBtn.innerHTML = SVG_SETTINGS;
      actions.appendChild(narrationCapsuleSettingsBtn);

      // Record button
      narrationCapsuleRecordBtn = document.createElement('button');
      narrationCapsuleRecordBtn.className = 'narration-capsule-btn';
      narrationCapsuleRecordBtn.type = 'button';
      narrationCapsuleRecordBtn.setAttribute('aria-label', getLang() === 'zh' ? '录制视频' : 'Record');
      narrationCapsuleRecordBtn.innerHTML = SVG_RECORD;
      actions.appendChild(narrationCapsuleRecordBtn);

      // Chat button — only if assistant dialog exists (LLM configured)
      var hasAssistant = !!document.querySelector('.assistant-dialog');
      narrationCapsuleChatBtn = document.createElement('button');
      narrationCapsuleChatBtn.className = 'narration-capsule-btn';
      narrationCapsuleChatBtn.type = 'button';
      narrationCapsuleChatBtn.setAttribute('aria-label', getLang() === 'zh' ? 'AI 助手' : 'AI Chat');
      narrationCapsuleChatBtn.innerHTML = NARRATION_SVG_CHAT;
      if (!hasAssistant) {
        narrationCapsuleChatBtn.style.display = 'none';
      }
      actions.appendChild(narrationCapsuleChatBtn);

      var divider = document.createElement('div');
      divider.className = 'narration-capsule-divider';
      actions.appendChild(divider);

      var mainArea = document.createElement('div');
      mainArea.className = 'narration-capsule-main';
      // Will be populated by updateAutoPlayButton

      fab.innerHTML = '';
      fab.appendChild(actions);
      fab.appendChild(mainArea);

      // Adjust expanded height based on visible buttons
      var visibleBtnCount = hasAssistant ? 3 : 2;
      fab.style.setProperty('--capsule-expanded-height', (visibleBtnCount * 44 + 1 + 52) + 'px');
    }

    return fab;
  };

  /**
   * Voice clones are stored as 'narration-clones' = [{ id, name, audio, text, sampleRate, duration, savedAt }, ...].
   * Used by Qwen3-TTS Base model as ref_audio + ref_text.
   * Legacy single-clone key 'narration-clone-voice' is auto-migrated on first read.
   */
  var REF_TEXT_ZH = '今天天气真不错，我想去公园里散散步，听听鸟鸣，看看花朵。';
  var REF_TEXT_EN = 'The quick brown fox jumps over the lazy dog, while bright sunshine warms the morning air.';

  function loadVoiceClones() {
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem('narration-clones')) || []; } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    // Migrate legacy single-clone key
    if (!arr.length) {
      try {
        var legacy = JSON.parse(localStorage.getItem('narration-clone-voice'));
        if (legacy && legacy.audio && legacy.text) {
          arr.push({
            id: 'c' + legacy.savedAt,
            name: getLang() === 'zh' ? '我的声音' : 'My Voice',
            audio: legacy.audio, text: legacy.text,
            sampleRate: legacy.sampleRate, duration: legacy.duration,
            savedAt: legacy.savedAt
          });
          try { localStorage.setItem('narration-clones', JSON.stringify(arr)); } catch (e) {}
          localStorage.removeItem('narration-clone-voice');
        }
      } catch (e) {}
    }
    return arr;
  }

  function saveVoiceClones(arr) {
    try { localStorage.setItem('narration-clones', JSON.stringify(arr)); return true; } catch (e) { return false; }
  }

  function encodeWav(samples, sampleRate) {
    // 16-bit PCM mono WAV encoder
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);
    var writeStr = function (offset, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);   // PCM
    view.setUint16(22, 1, true);   // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    var offset = 44;
    for (var i = 0; i < samples.length; i++) {
      var s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return buffer;
  }

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function openVoiceCloneModal(onSaved) {
    var zh = getLang() === 'zh';
    var refText = zh ? REF_TEXT_ZH : REF_TEXT_EN;
    var existing = loadVoiceClones();
    var defaultName = (zh ? '我的声音 ' : 'My Voice ') + (existing.length + 1);

    var overlay = document.createElement('div');
    overlay.className = 'voice-clone-overlay';
    overlay.innerHTML = [
      '<div class="voice-clone-modal" role="dialog" aria-modal="true">',
      '  <div class="voice-clone-header">',
      '    <strong>' + (zh ? '克隆我的声音' : 'Clone My Voice') + '</strong>',
      '    <button type="button" class="voice-clone-close" aria-label="Close">×</button>',
      '  </div>',
      '  <div class="voice-clone-name-row">',
      '    <label for="voice-clone-name-input">' + (zh ? '声音名称' : 'Voice Name') + '</label>',
      '    <input id="voice-clone-name-input" type="text" class="voice-clone-name" value="' + defaultName + '" maxlength="24" placeholder="' + (zh ? '为这个声音起个名字' : 'Name this voice') + '" />',
      '  </div>',
      '  <p class="voice-clone-instr">' + (zh ? '请用自然语速朗读下面这句话（约 5 秒）：' : 'Please read the sentence below at a natural pace (about 5 seconds):') + '</p>',
      '  <blockquote class="voice-clone-text">' + refText + '</blockquote>',
      '  <div class="voice-clone-controls">',
      '    <button type="button" class="voice-clone-record">' + (zh ? '● 开始录制' : '● Start') + '</button>',
      '    <span class="voice-clone-timer">0.0s</span>',
      '  </div>',
      '  <audio class="voice-clone-preview" controls style="display:none;width:100%;margin-top:12px;"></audio>',
      '  <div class="voice-clone-msg" style="display:none;"></div>',
      '  <div class="voice-clone-actions">',
      '    <button type="button" class="voice-clone-cancel">' + (zh ? '取消' : 'Cancel') + '</button>',
      '    <button type="button" class="voice-clone-save" disabled>' + (zh ? '保存' : 'Save') + '</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    var recordBtn = overlay.querySelector('.voice-clone-record');
    var timerEl = overlay.querySelector('.voice-clone-timer');
    var previewEl = overlay.querySelector('.voice-clone-preview');
    var msgEl = overlay.querySelector('.voice-clone-msg');
    var saveBtn = overlay.querySelector('.voice-clone-save');
    var cancelBtn = overlay.querySelector('.voice-clone-cancel');
    var closeBtn = overlay.querySelector('.voice-clone-close');

    var stream = null;
    var audioCtx = null;
    var processor = null;
    var sourceNode = null;
    var chunks = [];
    var recording = false;
    var startTime = 0;
    var timerHandle = null;
    var capturedWavBuffer = null;
    var capturedDuration = 0;
    var capturedSampleRate = 0;

    var showMsg = function (text, isError) {
      msgEl.style.display = '';
      msgEl.textContent = text;
      msgEl.style.color = isError ? '#e85a5a' : '';
    };

    var teardownStream = function () {
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
      if (processor) { try { processor.disconnect(); } catch (e) {} processor = null; }
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} sourceNode = null; }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    };

    var stopRecording = function () {
      if (!recording) return;
      recording = false;
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
      if (processor) { try { processor.disconnect(); } catch (e) {} }
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }

      // Concatenate chunks
      var totalLen = 0;
      chunks.forEach(function (c) { totalLen += c.length; });
      if (totalLen === 0 || !audioCtx) {
        showMsg(zh ? '没有捕获到音频，请重试。' : 'No audio captured. Please try again.', true);
        recordBtn.textContent = zh ? '● 开始录制' : '● Start';
        recordBtn.disabled = false;
        if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
        return;
      }
      var samples = new Float32Array(totalLen);
      var off = 0;
      chunks.forEach(function (c) { samples.set(c, off); off += c.length; });
      capturedSampleRate = audioCtx.sampleRate;
      capturedDuration = totalLen / capturedSampleRate;
      capturedWavBuffer = encodeWav(samples, capturedSampleRate);
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;

      // Preview
      var blob = new Blob([capturedWavBuffer], { type: 'audio/wav' });
      previewEl.src = URL.createObjectURL(blob);
      previewEl.style.display = '';
      saveBtn.disabled = false;
      recordBtn.textContent = zh ? '● 重新录制' : '● Re-record';
      recordBtn.disabled = false;
      var sizeKB = Math.round(capturedWavBuffer.byteLength / 1024);
      showMsg((zh ? '录制完成 ' : 'Recorded ') + capturedDuration.toFixed(1) + 's · ' + sizeKB + ' KB');
    };

    var startRecording = function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMsg(zh ? '当前浏览器不支持录音。' : 'Recording not supported in this browser.', true);
        return;
      }
      chunks = [];
      capturedWavBuffer = null;
      saveBtn.disabled = true;
      previewEl.style.display = 'none';
      msgEl.style.display = 'none';
      recordBtn.disabled = true;

      navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(function (s) {
        stream = s;
        var Ctor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctor();
        sourceNode = audioCtx.createMediaStreamSource(stream);
        // ScriptProcessorNode is deprecated but universally supported and good enough here
        processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = function (e) {
          if (!recording) return;
          var input = e.inputBuffer.getChannelData(0);
          // Copy because the buffer is reused
          var copy = new Float32Array(input.length);
          copy.set(input);
          chunks.push(copy);
        };
        sourceNode.connect(processor);
        processor.connect(audioCtx.destination);
        recording = true;
        startTime = Date.now();
        recordBtn.textContent = zh ? '■ 停止' : '■ Stop';
        recordBtn.disabled = false;
        timerHandle = setInterval(function () {
          var elapsed = (Date.now() - startTime) / 1000;
          timerEl.textContent = elapsed.toFixed(1) + 's';
          // Auto-stop at 15 seconds
          if (elapsed >= 15) stopRecording();
        }, 100);
      }).catch(function (err) {
        showMsg((zh ? '麦克风访问失败：' : 'Microphone access failed: ') + err.message, true);
        recordBtn.disabled = false;
      });
    };

    recordBtn.addEventListener('click', function () {
      if (recording) stopRecording();
      else startRecording();
    });

    var close = function () {
      teardownStream();
      if (previewEl.src) URL.revokeObjectURL(previewEl.src);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
    cancelBtn.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    saveBtn.addEventListener('click', function () {
      if (!capturedWavBuffer) return;
      var nameInput = overlay.querySelector('.voice-clone-name');
      var name = (nameInput && nameInput.value.trim()) || defaultName;
      var b64 = arrayBufferToBase64(capturedWavBuffer);
      var entry = {
        id: 'c' + Date.now(),
        name: name,
        audio: b64,
        text: refText,
        sampleRate: capturedSampleRate,
        duration: capturedDuration,
        savedAt: Date.now()
      };
      var clones = loadVoiceClones();
      clones.push(entry);
      if (!saveVoiceClones(clones)) {
        showMsg(zh ? '保存失败（可能超出存储配额）' : 'Save failed (storage quota?)', true);
        return;
      }
      if (typeof onSaved === 'function') onSaved(entry);
      close();
    });
  }

  var ensureNarrationSettingsPanel = function () {
    var existing = document.querySelector('.narration-settings-panel');
    if (existing) return existing;

    var panel = document.createElement('div');
    panel.className = 'narration-settings-panel';
    panel.innerHTML = [
      '<div class="narration-settings-header">',
      '  <strong>' + (getLang() === 'zh' ? '讲解设置' : 'Narration Settings') + '</strong>',
      '  <button class="narration-settings-close" type="button" aria-label="Close">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>',
      '</div>',
      '<label class="narration-setting-row">',
      '  <span>' + (getLang() === 'zh' ? '语言' : 'Language') + '</span>',
      '  <select class="narration-select" data-narration-setting="lang">',
      '    <option value="auto">' + (getLang() === 'zh' ? '跟随页面' : 'Follow page') + '</option>',
      '    <option value="zh">中文</option>',
      '    <option value="en">English</option>',
      '  </select>',
      '</label>',
      '<label class="narration-setting-row">',
      '  <span>' + (getLang() === 'zh' ? '语速' : 'Speed') + '</span>',
      '  <input type="range" class="narration-range" data-narration-setting="rate" min="0.5" max="1.5" step="0.1" value="0.92" />',
      '  <span class="narration-rate-value">0.92</span>',
      '</label>',
      '<div class="narration-setting-row narration-voice-row">',
      '  <span>' + (getLang() === 'zh' ? '语音' : 'Voice') + '</span>',
      '  <select class="narration-select narration-voice-select" data-narration-setting="voiceName">',
      '    <option value="">' + (getLang() === 'zh' ? '自动' : 'Auto') + '</option>',
      '  </select>',
      '  <button class="narration-voice-test" type="button" aria-label="' + (getLang() === 'zh' ? '试听' : 'Preview') + '" title="' + (getLang() === 'zh' ? '试听' : 'Preview') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' +
        '</button>',
      '</div>',
      '<label class="narration-setting-row">',
      '  <span>' + (getLang() === 'zh' ? 'TTS' : 'TTS') + '</span>',
      '  <select class="narration-select" data-narration-setting="ttsProvider">',
      '    <option value="browser">' + (getLang() === 'zh' ? '浏览器内置' : 'Browser') + '</option>',
      '    <option value="vibevoice">VibeVoice (EN)</option>',
      '    <option value="moss-tts-nano">Qwen3-TTS (MLX)</option>',
      '    <option value="fish-s2">Fish Audio S2 (MLX)</option>',
      '  </select>',
      '</label>',
      '<div class="narration-moss-settings" style="display:none;">',
      '  <label class="narration-setting-row">',
      '    <span>' + (getLang() === 'zh' ? '音色' : 'Voice') + '</span>',
      '    <select class="narration-select" data-narration-setting="mossTtsVoice">',
      '      <option value="vivian">vivian (' + (getLang() === 'zh' ? '活泼女声' : 'Female ZH') + ')</option>',
      '      <option value="serena">serena (' + (getLang() === 'zh' ? '温柔女声' : 'Female ZH') + ')</option>',
      '      <option value="uncle_fu">uncle_fu (' + (getLang() === 'zh' ? '成熟男声' : 'Male ZH') + ')</option>',
      '      <option value="dylan">dylan (' + (getLang() === 'zh' ? '京腔男声' : 'Male Beijing') + ')</option>',
      '      <option value="ryan">ryan (' + (getLang() === 'zh' ? '英文男声' : 'Male EN') + ')</option>',
      '      <option value="aiden">aiden (' + (getLang() === 'zh' ? '美式男声' : 'Male US') + ')</option>',
      '      <option value="ono_anna">ono_anna (' + (getLang() === 'zh' ? '日语女声' : 'Female JA') + ')</option>',
      '      <option value="sohee">sohee (' + (getLang() === 'zh' ? '韩语女声' : 'Female KO') + ')</option>',
      '      <option value="eric">eric (' + (getLang() === 'zh' ? '英文男声' : 'Male EN') + ')</option>',
      '    </select>',
      '    <button class="narration-voice-test narration-moss-voice-test" type="button" aria-label="' + (getLang() === 'zh' ? '试听' : 'Preview') + '" title="' + (getLang() === 'zh' ? '试听' : 'Preview') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' +
        '</button>',
      '    <button class="narration-voice-test narration-clone-record-btn" type="button" title="' + (getLang() === 'zh' ? '录制新声音' : 'Record new clone') + '" aria-label="' + (getLang() === 'zh' ? '录制新声音' : 'Record new clone') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '</button>',
      '    <button class="narration-voice-test narration-clone-delete-btn" type="button" style="display:none;" title="' + (getLang() === 'zh' ? '删除当前克隆声音' : 'Delete current clone') + '" aria-label="' + (getLang() === 'zh' ? '删除' : 'Delete') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        '</button>',
      '  </label>',
      '  <label class="narration-setting-row narration-clone-quality-row" style="display:none;">',
      '    <span>' + (getLang() === 'zh' ? '克隆质量' : 'Clone quality') + '</span>',
      '    <select class="narration-select" data-narration-setting="mossCloneQuality">',
      '      <option value="8bit">' + (getLang() === 'zh' ? '快速（8bit，推荐）' : 'Fast (8bit, recommended)') + '</option>',
      '      <option value="bf16">' + (getLang() === 'zh' ? '高质（bf16，较慢）' : 'High quality (bf16, slower)') + '</option>',
      '    </select>',
      '  </label>',
      '</div>',
      '<div class="narration-fish-settings" style="display:none;">',
      '  <label class="narration-setting-row">',
      '    <span>' + (getLang() === 'zh' ? '音色' : 'Voice') + '</span>',
      '    <input type="text" class="narration-select" data-narration-setting="fishTtsVoice" placeholder="' + (getLang() === 'zh' ? '留空 = 默认音色' : 'blank = default voice') + '" />',
      '  </label>',
      '  <div class="narration-setting-hint">' + (getLang() === 'zh' ? '支持 [whisper]、[laughing] 等情感标签。' : 'Inline tags like [whisper], [laughing] are supported.') + '</div>',
      '</div>',
      '<label class="narration-setting-row narration-tts-emotion-row" style="display:none;">',
      '  <span>' + (getLang() === 'zh' ? '情绪' : 'Emotion') + '</span>',
      '  <select class="narration-select" data-narration-setting="ttsEmotion">',
      '    <option value="default">' + (getLang() === 'zh' ? '默认讲解' : 'Default narrator') + '</option>',
      '    <option value="passionate">' + (getLang() === 'zh' ? '充满激情' : 'Passionate') + '</option>',
      '    <option value="inspiring">' + (getLang() === 'zh' ? '激励鼓舞' : 'Inspiring') + '</option>',
      '    <option value="warm">' + (getLang() === 'zh' ? '温暖亲切' : 'Warm') + '</option>',
      '    <option value="cheerful">' + (getLang() === 'zh' ? '轻松愉快' : 'Cheerful') + '</option>',
      '    <option value="serious">' + (getLang() === 'zh' ? '严肃权威' : 'Serious') + '</option>',
      '    <option value="storytelling">' + (getLang() === 'zh' ? '娓娓道来' : 'Storytelling') + '</option>',
      '    <option value="urgent">' + (getLang() === 'zh' ? '紧迫急切' : 'Urgent') + '</option>',
      '  </select>',
      '</label>',
      '<div class="narration-setting-row narration-voice-row narration-vibe-row">',
      '  <span>' + (getLang() === 'zh' ? 'AI语音' : 'AI Voice') + '</span>',
      '  <select class="narration-select" data-narration-setting="vibeVoice">',
      '    <option value="en-Emma_woman">Emma (Woman)</option>',
      '    <option value="en-Grace_woman">Grace (Woman)</option>',
      '    <option value="en-Carter_man">Carter (Man)</option>',
      '    <option value="en-Davis_man">Davis (Man)</option>',
      '    <option value="en-Frank_man">Frank (Man)</option>',
      '    <option value="en-Mike_man">Mike (Man)</option>',
      '  </select>',
      '  <button class="narration-voice-test narration-vibe-test" type="button" aria-label="' + (getLang() === 'zh' ? '试听' : 'Preview') + '" title="' + (getLang() === 'zh' ? '试听' : 'Preview') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' +
        '</button>',
      '</div>',
      '<label class="narration-setting-row">',
      '  <span>' + (getLang() === 'zh' ? '结尾二维码' : 'End QR Code') + '</span>',
      '  <input type="checkbox" class="narration-checkbox" data-narration-setting="showEndQR" />',
      '</label>'
    ].join('\n');

    document.body.appendChild(panel);

    // Settings keys: global = 'narration-settings', per-article = 'narration-settings:' + slug
    var articleSlug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
    var globalKey = 'narration-settings';
    var articleKey = articleSlug ? ('narration-settings:' + articleSlug) : '';

    // Load: per-article overrides global
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(globalKey)) || {}; } catch (e) {}
    if (articleKey) {
      try {
        var articleSaved = JSON.parse(localStorage.getItem(articleKey));
        if (articleSaved) {
          // Merge: article settings override global
          Object.keys(articleSaved).forEach(function (k) { if (articleSaved[k] !== undefined && articleSaved[k] !== '') saved[k] = articleSaved[k]; });
        }
      } catch (e) {}
    }

    var langSelect = panel.querySelector('[data-narration-setting="lang"]');
    var rateInput = panel.querySelector('[data-narration-setting="rate"]');
    var rateValue = panel.querySelector('.narration-rate-value');
    var voiceSelect = panel.querySelector('[data-narration-setting="voiceName"]');
    var voiceTestBtn = panel.querySelector('.narration-voice-test');
    var ttsProviderSelect = panel.querySelector('[data-narration-setting="ttsProvider"]');
    var vibeVoiceSelect = panel.querySelector('[data-narration-setting="vibeVoice"]');
    var vibeRow = panel.querySelector('.narration-vibe-row');
    var mossSettingsDiv = panel.querySelector('.narration-moss-settings');
    var mossDemoIdInput = panel.querySelector('[data-narration-setting="mossTtsVoice"]');
    var mossVoiceTestBtn = panel.querySelector('.narration-moss-voice-test');
    var fishSettingsDiv = panel.querySelector('.narration-fish-settings');
    var fishVoiceInput = panel.querySelector('[data-narration-setting="fishTtsVoice"]');
    var browserVoiceRow = panel.querySelector('.narration-voice-row:not(.narration-vibe-row)');

    if (saved.lang) langSelect.value = saved.lang;
    if (saved.rate) { rateInput.value = saved.rate; rateValue.textContent = saved.rate; }
    if (saved.ttsProvider) ttsProviderSelect.value = saved.ttsProvider;
    if (saved.vibeVoice) vibeVoiceSelect.value = saved.vibeVoice;
    if (saved.mossTtsVoice) mossDemoIdInput.value = saved.mossTtsVoice;
    if (saved.fishTtsVoice && fishVoiceInput) fishVoiceInput.value = saved.fishTtsVoice;
    var cloneQualitySelect = panel.querySelector('[data-narration-setting="mossCloneQuality"]');
    var emotionSelectIn = panel.querySelector('[data-narration-setting="ttsEmotion"]');
    var emotionRowIn = panel.querySelector('.narration-tts-emotion-row');
    if (cloneQualitySelect && saved.mossCloneQuality) cloneQualitySelect.value = saved.mossCloneQuality;

    // Show/hide provider-specific rows based on TTS provider selection
    var syncProviderVisibility = function () {
      var provider = ttsProviderSelect.value;
      browserVoiceRow.style.display = provider === 'browser' ? '' : 'none';
      vibeRow.style.display = provider === 'vibevoice' ? '' : 'none';
      mossSettingsDiv.style.display = provider === 'moss-tts-nano' ? '' : 'none';
      if (fishSettingsDiv) fishSettingsDiv.style.display = provider === 'fish-s2' ? '' : 'none';
      if (emotionRowIn) emotionRowIn.style.display = (provider === 'moss-tts-nano' || provider === 'fish-s2') ? '' : 'none';
    };
    syncProviderVisibility();
    ttsProviderSelect.addEventListener('change', syncProviderVisibility);

    // Populate voices directly from browser Speech API
    var voicesPopulated = false;
    var populateVoices = function () {
      if (!window.speechSynthesis) return;
      var allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || !allVoices.length) return;
      voicesPopulated = true;

      // Determine which language to filter by
      var filterLang = langSelect.value;
      if (filterLang === 'auto') filterLang = getLang();
      var langPrefix = (filterLang === 'zh') ? 'zh' : 'en';

      // Remember current selection
      var currentVal = voiceSelect.value;

      // Clear all except "Auto"
      while (voiceSelect.options.length > 1) {
        voiceSelect.removeChild(voiceSelect.lastChild);
      }

      // Add matching voices
      allVoices.forEach(function (v) {
        if (v.lang.indexOf(langPrefix) !== 0) return;
        var opt = document.createElement('option');
        opt.value = v.name;
        // Format: extract dialect from lang tag, show as "Name · Dialect"
        var dialect = v.lang;
        // Map common lang codes to short readable labels
        var dialectMap = {
          'zh-CN': '普通话', 'zh-TW': '台湾', 'zh-HK': '粤语',
          'en-US': 'US', 'en-GB': 'UK', 'en-AU': 'AU', 'en-IN': 'IN', 'en-IE': 'IE', 'en-ZA': 'ZA'
        };
        var dialectLabel = dialectMap[v.lang] || v.lang;
        // Extract core name — strip parenthetical region info since we show dialect separately
        var coreName = v.name.replace(/\s*\(.*\)\s*$/, '');
        opt.textContent = coreName + ' · ' + dialectLabel;
        opt.title = v.name + ' (' + v.lang + ')';
        voiceSelect.appendChild(opt);
      });

      // Restore selection
      if (currentVal) voiceSelect.value = currentVal;
      if (saved.voiceName && !currentVal) voiceSelect.value = saved.voiceName;
      panel.removeAttribute('data-voices-pending');
    };

    // Try immediately
    populateVoices();

    // Listen for async voice loading
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
    }

    // Re-populate when language changes
    langSelect.addEventListener('change', function () {
      // Reset voice selection when language changes
      voiceSelect.value = '';
      populateVoices();
    });

    var saveSettings = function () {
      var s = {
        lang: langSelect.value === 'auto' ? '' : langSelect.value,
        rate: parseFloat(rateInput.value),
        voiceName: voiceSelect.value,
        ttsProvider: ttsProviderSelect.value,
        ttsEngine: ttsProviderSelect.value === 'moss-tts-nano' ? 'moss-tts-nano' : (ttsProviderSelect.value === 'fish-s2' ? 'fish-s2' : ''),
        mossTtsVoice: mossDemoIdInput.value,
        fishTtsVoice: fishVoiceInput ? fishVoiceInput.value.trim() : '',
        vibeVoice: vibeVoiceSelect.value,
        mossCloneQuality: cloneQualitySelect ? cloneQualitySelect.value : '8bit',
        ttsEmotion: emotionSelectIn ? emotionSelectIn.value : 'default'
      };
      localStorage.setItem(globalKey, JSON.stringify(s));
      if (articleKey) {
        localStorage.setItem(articleKey, JSON.stringify(s));
      }
    };

    langSelect.addEventListener('change', saveSettings);
    ttsProviderSelect.addEventListener('change', saveSettings);
    vibeVoiceSelect.addEventListener('change', saveSettings);
    if (emotionSelectIn) emotionSelectIn.addEventListener('change', saveSettings);

    // End QR toggle
    var showEndQRCheckbox = panel.querySelector('[data-narration-setting="showEndQR"]');
    if (showEndQRCheckbox) {
      var qrSaved = false;
      try { qrSaved = JSON.parse(localStorage.getItem('narration-showEndQR') || 'false'); } catch (e) {}
      showEndQRCheckbox.checked = qrSaved;
      showEndQRCheckbox.addEventListener('change', function () {
        localStorage.setItem('narration-showEndQR', JSON.stringify(showEndQRCheckbox.checked));
        var endQr = document.querySelector('.present-end-qr');
        if (endQr) endQr.style.display = showEndQRCheckbox.checked ? '' : 'none';
      });
    }
    // mossDemoIdInput change handler is registered below (in the clone section) to also toggle UI
    if (fishVoiceInput) {
      fishVoiceInput.addEventListener('input', saveSettings);
      fishVoiceInput.addEventListener('change', saveSettings);
    }

    // ── Voice clones (Qwen3-TTS Base) ──
    // Populate dropdown with saved clones (prepended) and wire record/delete buttons.
    var cloneRecordBtn = panel.querySelector('.narration-clone-record-btn');
    var cloneDeleteBtn = panel.querySelector('.narration-clone-delete-btn');
    var cloneQualityRow = panel.querySelector('.narration-clone-quality-row');

    var refreshCloneOptions = function (selectId) {
      var clones = loadVoiceClones();
      // Remove existing clone-* options
      var toRemove = [];
      for (var i = 0; i < mossDemoIdInput.options.length; i++) {
        if (mossDemoIdInput.options[i].value.indexOf('clone:') === 0 || mossDemoIdInput.options[i].dataset.cloneGroup === '1') {
          toRemove.push(mossDemoIdInput.options[i]);
        }
      }
      toRemove.forEach(function (o) { o.remove(); });
      // Prepend clones
      var zh2 = getLang() === 'zh';
      clones.slice().reverse().forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = 'clone:' + c.id;
        opt.dataset.cloneGroup = '1';
        var dur = c.duration ? c.duration.toFixed(1) + 's' : '';
        opt.textContent = '🎙 ' + c.name + (dur ? ' · ' + dur : '');
        mossDemoIdInput.insertBefore(opt, mossDemoIdInput.firstChild);
      });
      // Restore selection if requested or current
      var want = selectId || mossDemoIdInput.value;
      if (want && Array.prototype.some.call(mossDemoIdInput.options, function (o) { return o.value === want; })) {
        mossDemoIdInput.value = want;
      }
      updateCloneUI();
    };

    var updateCloneUI = function () {
      var isClone = mossDemoIdInput.value.indexOf('clone:') === 0;
      if (cloneDeleteBtn) cloneDeleteBtn.style.display = isClone ? '' : 'none';
      if (cloneQualityRow) cloneQualityRow.style.display = isClone ? '' : 'none';
    };

    refreshCloneOptions(saved.mossTtsVoice || null);

    if (cloneRecordBtn) {
      cloneRecordBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openVoiceCloneModal(function (entry) {
          // Auto-select the new clone
          refreshCloneOptions('clone:' + entry.id);
          saveSettings();
        });
      });
    }
    if (cloneDeleteBtn) {
      cloneDeleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var current = mossDemoIdInput.value;
        if (current.indexOf('clone:') !== 0) return;
        var id = current.slice(6);
        var clones = loadVoiceClones();
        var entry = null;
        for (var i = 0; i < clones.length; i++) { if (clones[i].id === id) { entry = clones[i]; break; } }
        var name = entry ? entry.name : '';
        var zh2 = getLang() === 'zh';
        var msg = (zh2 ? '确定删除克隆声音 “' : 'Delete cloned voice “') + name + (zh2 ? '” 吗？此操作不可恢复。' : '”? This cannot be undone.');
        if (!window.confirm(msg)) return;
        var remaining = clones.filter(function (c) { return c.id !== id; });
        saveVoiceClones(remaining);
        // Fallback to first preset (vivian)
        mossDemoIdInput.value = 'vivian';
        refreshCloneOptions('vivian');
        saveSettings();
      });
    }
    mossDemoIdInput.addEventListener('change', function () {
      updateCloneUI();
      saveSettings();
    });
    if (cloneQualitySelect) cloneQualitySelect.addEventListener('change', saveSettings);
    rateInput.addEventListener('input', function () {
      rateValue.textContent = parseFloat(rateInput.value).toFixed(2);
      saveSettings();
    });
    voiceSelect.addEventListener('change', saveSettings);

    // Voice test/preview button
    var testUtterance = null;
    voiceTestBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!window.speechSynthesis) return;
      // Cancel any ongoing test
      window.speechSynthesis.cancel();

      var testText = (getLang() === 'zh' || langSelect.value === 'zh')
        ? '这是一段语音测试，你可以听到当前选择的语音效果。'
        : 'This is a voice preview. You can hear how the selected voice sounds.';

      var utt = new SpeechSynthesisUtterance(testText);
      var filterLang = langSelect.value;
      if (filterLang === 'auto') filterLang = getLang();
      utt.lang = (filterLang === 'zh') ? 'zh-CN' : 'en-US';
      utt.rate = parseFloat(rateInput.value) || 0.92;

      // Pick selected voice
      if (voiceSelect.value) {
        var allV = window.speechSynthesis.getVoices();
        var match = allV.filter(function (v) { return v.name === voiceSelect.value; });
        if (match.length) utt.voice = match[0];
      }

      voiceTestBtn.classList.add('is-testing');
      utt.onend = function () { voiceTestBtn.classList.remove('is-testing'); };
      utt.onerror = function () { voiceTestBtn.classList.remove('is-testing'); };
      window.speechSynthesis.speak(utt);
    });

    // VibeVoice preview button
    var vibeTestBtn = panel.querySelector('.narration-vibe-test');
    if (vibeTestBtn) {
      vibeTestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var vibeSettings = {
          endpoint: 'http://127.0.0.1:8191/v1',
          voice: vibeVoiceSelect.value || 'en-Emma_woman'
        };
        var testText = 'This is a voice preview. You can hear how the selected voice sounds.';
        vibeTestBtn.classList.add('is-testing');

        fetch(vibeSettings.endpoint + '/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer dummy' },
          body: JSON.stringify({
            model: 'VibeVoice-Realtime-0.5B-4bit',
            input: testText,
            voice: vibeSettings.voice,
            speed: parseFloat(rateInput.value) || 1.0
          })
        })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(function (buf) {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          return ctx.decodeAudioData(buf).then(function (audioBuf) {
            var src = ctx.createBufferSource();
            src.buffer = audioBuf;
            src.connect(ctx.destination);
            src.onended = function () { vibeTestBtn.classList.remove('is-testing'); };
            src.start(0);
          });
        })
        .catch(function (err) {
          vibeTestBtn.classList.remove('is-testing');
          console.error('VibeVoice preview error:', err);
          window.alert(getLang() === 'zh' ? 'VibeVoice 试听失败，请确认服务已启动' : 'VibeVoice preview failed. Ensure the service is running.');
        });
      });
    }

    // Qwen3-TTS voice preview (reuses LLM endpoint)
    if (mossVoiceTestBtn) {
      mossVoiceTestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var llm = null;
        try { llm = JSON.parse(localStorage.getItem('llm-settings')); } catch (ex) {}
        if (!llm || !llm.endpoint) return;
        var ep = llm.endpoint.replace(/\/+$/, '');
        var voice = (mossDemoIdInput.value || 'vivian').toLowerCase();
        var testText = (getLang() === 'zh' || langSelect.value === 'zh')
          ? '你好，这是一段语音试听。'
          : 'Hello, this is a voice preview.';
        var headers = { 'Content-Type': 'application/json' };
        if (llm.apikey) headers['Authorization'] = 'Bearer ' + llm.apikey;
        mossVoiceTestBtn.classList.add('is-testing');
        fetch(ep + '/audio/speech', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: 'Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit',
            input: testText,
            voice: voice
          })
        })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(function (buf) {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          return ctx.decodeAudioData(buf).then(function (audioBuf) {
            var src = ctx.createBufferSource();
            src.buffer = audioBuf;
            src.connect(ctx.destination);
            src.onended = function () { mossVoiceTestBtn.classList.remove('is-testing'); };
            src.start(0);
          });
        })
        .catch(function (err) {
          mossVoiceTestBtn.classList.remove('is-testing');
          console.error('Qwen3-TTS preview error:', err);
        });
      });
    }

    panel.querySelector('.narration-settings-close').addEventListener('click', function () {
      panel.classList.remove('is-open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('is-open') && !panel.contains(e.target) && !e.target.closest('.present-settings') && !e.target.closest('.narration-capsule-btn') && !e.target.closest('.assistant-fab')) {
        panel.classList.remove('is-open');
      }
    });

    // Refresh all panel fields from localStorage (called before entering presentation)
    panel._refreshFromStorage = function () {
      var fresh = {};
      try { fresh = JSON.parse(localStorage.getItem(globalKey)) || {}; } catch (e) {}
      if (articleKey) {
        try {
          var articleFresh = JSON.parse(localStorage.getItem(articleKey));
          if (articleFresh) {
            Object.keys(articleFresh).forEach(function (k) { if (articleFresh[k] !== undefined && articleFresh[k] !== '') fresh[k] = articleFresh[k]; });
          }
        } catch (e) {}
      }

      if (fresh.lang) { langSelect.value = fresh.lang; } else { langSelect.value = 'auto'; }
      if (fresh.rate) { rateInput.value = fresh.rate; rateValue.textContent = parseFloat(fresh.rate).toFixed(2); }
      if (fresh.ttsProvider) { ttsProviderSelect.value = fresh.ttsProvider; } else { ttsProviderSelect.value = 'browser'; }
      if (fresh.vibeVoice) { vibeVoiceSelect.value = fresh.vibeVoice; }
      if (fresh.mossTtsVoice) { mossDemoIdInput.value = fresh.mossTtsVoice; }
      if (cloneQualitySelect && fresh.mossCloneQuality) { cloneQualitySelect.value = fresh.mossCloneQuality; }
      if (emotionSelectIn) { emotionSelectIn.value = fresh.ttsEmotion || 'default'; }
      syncProviderVisibility();
      populateVoices();
      if (fresh.voiceName) { voiceSelect.value = fresh.voiceName; }
    };

    return panel;
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

  var hasNarrationSupport = function () {
    try {
      var s = JSON.parse(localStorage.getItem('llm-settings'));
      return !!(s && s.provider !== 'none' && s.endpoint && s.model &&
               window.speechSynthesis && window.SpeechSynthesisUtterance);
    } catch (e) { return false; }
  };

  /** Lazy-load mobile presentation module. */
  var ensureMobilePresent = function () {
    if (mobilePresentLoader) {
      mobilePresentLoader.then(function () {
        if (!mobilePresentController && window.StudyRoomMobilePresent) {
          mobilePresentController = window.StudyRoomMobilePresent.init({
            root: root,
            getLang: getLang,
            goToPrev: goToPreviousStep,
            goToNext: goToNextStep,
            getState: function () { return { enabled: state.enabled, index: state.index }; },
            getPresentSteps: function () { return presentSteps; }
          });
        }
      });
      return mobilePresentLoader;
    }
    mobilePresentLoader = new Promise(function (resolve, reject) {
      if (window.StudyRoomMobilePresent) { resolve(); return; }
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('article-mobile-present.js');
      s.async = true;
      s.onload = function () {
        if (window.StudyRoomMobilePresent) { resolve(); return; }
        reject(new Error('article-mobile-present.js loaded but unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load article-mobile-present.js.')); };
      document.head.appendChild(s);
    });
    mobilePresentLoader.then(function () {
      mobilePresentController = window.StudyRoomMobilePresent.init({
        root: root,
        getLang: getLang,
        goToPrev: goToPreviousStep,
        goToNext: goToNextStep,
        getState: function () { return { enabled: state.enabled, index: state.index }; },
        getPresentSteps: function () { return presentSteps; }
      });
    });
    return mobilePresentLoader;
  };

  var ensureNarration = function () {
    if (narrationLoader) return narrationLoader;
    narrationLoader = new Promise(function (resolve, reject) {
      if (window.StudyRoomNarration) { resolve(window.StudyRoomNarration); return; }
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('article-narration.js');
      s.async = true;
      s.onload = function () {
        if (window.StudyRoomNarration) { resolve(window.StudyRoomNarration); return; }
        reject(new Error('article-narration.js loaded but unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load article-narration.js.')); };
      document.head.appendChild(s);
    });
    return narrationLoader;
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
    exitBrowserFullscreen();
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

      // Pre-capture SVG diagrams as PNG data URLs
      var svgCaptures = [];
      var svgContainers = document.querySelectorAll('.slide-mockup, .demo-block');
      svgContainers.forEach(function (container) {
        var svg = container.querySelector('svg');
        if (!svg) return;
        svgCaptures.push(new Promise(function (resolve) {
          var serializer = new XMLSerializer();
          var svgStr = serializer.serializeToString(svg);
          var svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
          var blobUrl = URL.createObjectURL(svgBlob);
          var img = new Image();
          img.onload = function () {
            var vb = svg.viewBox && svg.viewBox.baseVal;
            var cw = (vb && vb.width) ? vb.width * 2 : img.naturalWidth || 960;
            var ch = (vb && vb.height) ? vb.height * 2 : img.naturalHeight || 540;
            var canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FCF6EE';
            ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, cw, ch);
            container.setAttribute('data-svg-png', canvas.toDataURL('image/png'));
            URL.revokeObjectURL(blobUrl);
            resolve();
          };
          img.onerror = function () {
            URL.revokeObjectURL(blobUrl);
            resolve();
          };
          img.src = blobUrl;
        }));
      });

      return Promise.all(svgCaptures).then(function () {
        presentSteps.forEach(function (step, stepIndex) {
          setPresentationStep(stepIndex);
          exporter.renderStep(pptx, step, stepIndex, stepIndex, presentSteps.length, palette, deriveStepLabel, deriveStepTitle);
        });
        restorePresentationSnapshot(snapshot);
        return pptx.write({ outputType: 'blob' });
      });
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

  var shareEmailNewsletter = function () {
    var lang = getLang();
    var title = document.title || 'Newsletter';

    // Build full-page clone preserving all original styles
    var docClone = document.documentElement.cloneNode(true);

    // Expand all accordions so deep-dives are visible
    docClone.querySelectorAll('[data-accordion]').forEach(function (item) {
      item.classList.add('is-open');
      var btn = item.querySelector('.subsection-toggle');
      var content = item.querySelector('.subsection-content');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (content) {
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = 'none';
        content.style.overflow = 'visible';
      }
    });

    // Strip interactive / non-email elements
    var removeSelectors = [
      '.topbar', '.present-floating', '.backdrop', 'script', 'footer',
      '.ai-assistant-entry', '.ai-assistant-panel',
      '[data-presentation-toggle]', '.share-wrapper',
      '.present-nav', '.present-exit', '.present-status'
    ];
    removeSelectors.forEach(function (sel) {
      docClone.querySelectorAll(sel).forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    });

    // Force light theme for email readability
    docClone.setAttribute('data-theme', 'light');

    // Remove all scroll-reveal opacity so content is visible immediately
    docClone.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    docClone.querySelectorAll('.load-in').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // Convert external CSS links to absolute URLs so the preview window can load them
    var origin = window.location.origin;
    var basePath = window.location.pathname.replace(/[^\/]*$/, '');
    docClone.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.indexOf('http') !== 0) {
        if (href.indexOf('/') === 0) {
          link.setAttribute('href', origin + href);
        } else {
          link.setAttribute('href', origin + basePath + href);
        }
      }
    });

    // Convert Google Fonts links to absolute (already absolute usually, but be safe)
    docClone.querySelectorAll('link[href*="fonts.googleapis"]').forEach(function (link) {
      // already absolute, no change needed
    });

    // Inject newsletter-specific overrides
    var overrideStyle = docClone.querySelector('head').appendChild(document.createElement('style'));
    overrideStyle.textContent = ''
      + 'body { overflow: auto !important; }'
      + '.page-shell { min-height: auto !important; }'
      + '.backdrop, .orb { display: none !important; }'
      + '.site { max-width: 780px; margin: 0 auto; padding: 24px 32px; }'
      + '.subsection-content[aria-hidden="false"] { max-height: none !important; overflow: visible !important; }'
      + '.newsletter-banner { position: sticky; top: 0; z-index: 9999; background: #2563eb; color: #fff;'
      + '  padding: 10px 20px; text-align: center; font-size: 14px; line-height: 1.5;'
      + '  border-radius: 0 0 8px 8px; font-family: -apple-system, sans-serif; }'
      + '.newsletter-banner a { color: #fff; text-decoration: underline; margin-left: 12px; cursor: pointer; }'
      + '@media print { .newsletter-banner { display: none; } }';

    // Add helper banner at top of body
    var body = docClone.querySelector('body');
    var banner = document.createElement('div');
    banner.className = 'newsletter-banner';
    var bannerText = lang === 'zh'
      ? '全选 (⌘A) → 复制 (⌘C) → 粘贴到邮件正文'
      : 'Select All (⌘A) → Copy (⌘C) → Paste into email body';
    var mailtoLabel = lang === 'zh' ? '打开邮件客户端' : 'Open email client';
    banner.innerHTML = bannerText + '<a data-mailto-trigger>' + mailtoLabel + '</a>';
    body.insertBefore(banner, body.firstChild);

    // Append source link at bottom
    var sourceFooter = document.createElement('div');
    sourceFooter.style.cssText = 'max-width:780px;margin:32px auto 24px;padding:16px 32px;border-top:1px solid #e5e7eb;font-size:13px;color:#9ca3af;';
    sourceFooter.innerHTML = 'Source: <a href="' + window.location.href + '" style="color:#2563eb;">' + title + '</a>';
    body.appendChild(sourceFooter);

    var fullHtml = '<!DOCTYPE html>\n' + docClone.outerHTML;

    // Open preview window with full-styled content
    var win = window.open('', '_blank');
    if (win) {
      win.document.write(fullHtml);
      win.document.close();
      win.document.title = '✉ ' + title;

      // Wire up the mailto link inside the preview window
      var mailtoTrigger = win.document.querySelector('[data-mailto-trigger]');
      if (mailtoTrigger) {
        mailtoTrigger.addEventListener('click', function (e) {
          e.preventDefault();
          var subject = encodeURIComponent(title);
          var mailBody = encodeURIComponent(title + '\n\n' + window.location.href);
          win.location.href = 'mailto:?subject=' + subject + '&body=' + mailBody;
        });
      }
    }
  };

  var deriveStepTitle = function (step, index) {
    var lang = getLang();
    var localized = step.getAttribute('data-step-title-' + lang);
    var explicit = localized || step.getAttribute('data-step-title');
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
    var lang = getLang();
    var localized = step.getAttribute('data-step-label-' + lang);
    var explicit = localized || step.getAttribute('data-step-label');
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
      // Substep expansion: if this candidate has [data-present-substep] descendants,
      // replace it with the substeps so each one becomes its own slide.
      var subs = candidate.querySelectorAll('[data-present-substep]');
      if (subs.length > 0) {
        var pTitle = candidate.getAttribute('data-step-title') || '';
        var pLabel = candidate.getAttribute('data-step-label') || '';
        // Drop the parent's step status so it's not double-counted.
        candidate.removeAttribute('data-present-step');
        subs.forEach(function (sub, idx) {
          if (!sub.hasAttribute('data-step-title')) {
            sub.setAttribute('data-step-title', pTitle + (subs.length > 1 ? ' (' + (idx + 1) + '/' + subs.length + ')' : ''));
          }
          if (pLabel && !sub.hasAttribute('data-step-label')) {
            sub.setAttribute('data-step-label', pLabel);
          }
          sub.setAttribute('data-present-step', '');
          autoAssignedSteps.push(sub);
          result.push(sub);
        });
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
          // Substep expansion: if accordion item contains [data-present-substep],
          // promote each substep instead of the item itself.
          var subs = item.querySelectorAll('[data-present-substep]');
          if (subs.length > 0) {
            subs.forEach(function (sub, idx) {
              if (!sub.hasAttribute('data-step-title')) {
                sub.setAttribute('data-step-title', subTitle + (subs.length > 1 ? ' (' + (idx + 1) + '/' + subs.length + ')' : ''));
              }
              if (kickerStr && !sub.hasAttribute('data-step-label')) {
                sub.setAttribute('data-step-label', kickerStr);
              }
              sub.setAttribute('data-present-step', '');
              autoAssignedSteps.push(sub);
              presentSteps.push(sub);
            });
          } else {
            item.setAttribute('data-present-step', '');
            autoAssignedSteps.push(item);
            presentSteps.push(item);
          }
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

    // Add ending slide with thank-you + QR code
    var endSlide = document.querySelector('.present-end-slide');
    if (!endSlide) {
      endSlide = document.createElement('div');
      endSlide.className = 'present-end-slide';
      endSlide.setAttribute('data-present-step', '');
      endSlide.setAttribute('data-step-title', '');
      endSlide.setAttribute('data-step-label', '');
      autoAssignedSteps.push(endSlide);

      var endInner = document.createElement('div');
      endInner.className = 'present-end-inner';

      var endTitle = document.createElement('h2');
      endTitle.className = 'present-end-title';
      endTitle.textContent = getLang() === 'zh' ? '感谢收看' : 'Thank You';
      endInner.appendChild(endTitle);

      var showQR = false;
      try { showQR = JSON.parse(localStorage.getItem('narration-showEndQR') || 'false'); } catch (e) {}

      var endQrWrap = document.createElement('div');
      endQrWrap.className = 'present-end-qr';
      endQrWrap.style.display = showQR ? '' : 'none';
      var endQrImg = document.createElement('img');
      endQrImg.alt = 'QR Code';
      endQrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=' + encodeURIComponent(window.location.href);
      endQrWrap.appendChild(endQrImg);
      var endQrTip = document.createElement('span');
      endQrTip.className = 'present-end-qr-tip';
      endQrTip.textContent = getLang() === 'zh' ? '扫码访问' : 'Scan to visit';
      endQrWrap.appendChild(endQrTip);
      endInner.appendChild(endQrWrap);

      var endBrand = document.createElement('p');
      endBrand.className = 'present-end-brand';
      endBrand.textContent = 'illusion615 Knowledge Hub';
      endInner.appendChild(endBrand);

      endSlide.appendChild(endInner);
      site.appendChild(endSlide);
      topLevelContainers.push(endSlide);
    }
    presentSteps.push(endSlide);
  };

  var updatePresentationLabels = function () {
    var prevLabel = getLabel('prev');
    var nextLabel = getLabel('next');
    var presentText = getLabel('enter');
    var styleText = getLabel('style');
    var shareText = getLabel('share');
    var presentTextNode = presentationToggle ? presentationToggle.querySelector('[data-present-toggle-label]') : null;
    var styleTextNode = styleToggle ? styleToggle.querySelector('[data-style-toggle-label]') : null;
    var shareTextNode = shareWrapper ? shareWrapper.querySelector('[data-share-toggle-label]') : null;

    presentationToggle.setAttribute('aria-label', state.enabled ? getLabel('exit') : getLabel('enter'));
    presentationToggle.setAttribute('aria-pressed', String(state.enabled));
    presentationToggle.classList.toggle('is-active', state.enabled);

    if (presentTextNode) {
      presentTextNode.textContent = presentText;
    }
    if (presentationToggle) {
      presentationToggle.setAttribute('title', presentText);
    }
    if (styleTextNode) {
      styleTextNode.textContent = styleText;
    }
    if (styleToggle) {
      styleToggle.setAttribute('aria-label', styleText);
      styleToggle.setAttribute('title', styleText);
    }
    if (shareTextNode) {
      shareTextNode.textContent = shareText;
    }
    if (shareWrapper) {
      var shareBtn = shareWrapper.querySelector('.share-btn');
      if (shareBtn) {
        shareBtn.setAttribute('aria-label', shareText);
        shareBtn.setAttribute('title', shareText);
      }
    }

    if (presentationExit) {
      presentationExit.setAttribute('aria-label', getLabel('exit'));
      presentationExit.setAttribute('title', getLabel('exit'));
    }

    // Update share dropdown labels
    if (shareWrapper) {
      var copyLabel = shareWrapper.querySelector('[data-share-copy-url] .share-item-label');
      var wechatLabel = shareWrapper.querySelector('[data-share-wechat] .share-item-label');
      var pptLabel = shareWrapper.querySelector('[data-share-export-ppt] .share-item-label');
      var pdfLabel = shareWrapper.querySelector('[data-share-export-pdf] .share-item-label');
      var emailLabel = shareWrapper.querySelector('[data-share-email] .share-item-label');
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
      if (emailLabel) {
        emailLabel.textContent = getLabel('emailNewsletter');
      }
      var recordLabel = shareWrapper.querySelector('[data-share-record] .share-item-label');
      if (recordLabel) {
        recordLabel.textContent = isRecording() ? getLabel('recordStop') : getLabel('record');
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

  var syncDetailsPresentationState = function (activeStep) {
    presentSteps.forEach(function (step) {
      var wasOpen;

      if (!step || step.tagName !== 'DETAILS') {
        return;
      }

      wasOpen = step.getAttribute('data-present-was-open');
      if (wasOpen === null) {
        step.setAttribute('data-present-was-open', step.hasAttribute('open') ? 'true' : 'false');
        wasOpen = step.getAttribute('data-present-was-open');
      }

      if (state.enabled && step === activeStep) {
        step.setAttribute('open', '');
        return;
      }

      if (wasOpen === 'true') {
        step.setAttribute('open', '');
      } else {
        step.removeAttribute('open');
      }
    });
  };

  var ensureAccordionStepVisible = function (activeStep) {
    var btn;
    var content;
    var parentAccordion;

    if (!state.enabled || !activeStep) {
      return;
    }

    if (activeStep.hasAttribute('data-accordion')) {
      btn = activeStep.querySelector('.subsection-toggle');
      content = activeStep.querySelector('.subsection-content');
      activeStep.classList.add('is-open');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
      }
      if (content) {
        content.setAttribute('aria-hidden', 'false');
      }
    }

    parentAccordion = activeStep.parentElement ? activeStep.parentElement.closest('[data-accordion]') : null;
    if (parentAccordion) {
      btn = parentAccordion.querySelector('.subsection-toggle');
      content = parentAccordion.querySelector('.subsection-content');
      parentAccordion.classList.add('is-open');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
      }
      if (content) {
        content.setAttribute('aria-hidden', 'false');
      }
    }
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
      presentationFloating.classList.toggle('is-end-slide', !!(activeStep && activeStep.classList.contains('present-end-slide')));
    }

    if (!state.enabled || !activeStep) {
      return;
    }

    window.requestAnimationFrame(function () {
      var isOverflowing = activeStep.scrollHeight > activeStep.clientHeight + 24;
      activeStep.classList.toggle('is-step-overflowing', isOverflowing);
    });
  };

  // ── Phase 2: Focus mode — tag anchor elements per slide ──
  var tagFocusElements = function (slideEl) {
    if (!slideEl) return;
    // Clear previous focus-keep tags across ALL steps
    var prevKept = root.querySelectorAll('.focus-keep');
    prevKept.forEach(function (el) { el.classList.remove('focus-keep'); });

    // Tag anchor elements in current slide
    var anchors = slideEl.querySelectorAll('h2, h3, h4, img, blockquote, strong, .insight-callout, .insight-grid, .metric-card, .comparison-grid');
    anchors.forEach(function (el) {
      // Walk up to find the direct child of subsection-content or the event-field
      var target = el;
      while (target.parentElement && !target.parentElement.classList.contains('subsection-content') && !target.parentElement.classList.contains('event-field')) {
        target = target.parentElement;
      }
      target.classList.add('focus-keep');
    });

    // If subsection-content has NO anchors at all (only plain <p> elements),
    // keep everything visible — dimming text-only content is meaningless.
    var subContent = slideEl.querySelector('.subsection-content');
    if (subContent && !subContent.querySelector('.focus-keep')) {
      var children = subContent.children;
      for (var ci = 0; ci < children.length; ci++) {
        children[ci].classList.add('focus-keep');
      }
    }

    // First event-field is always kept via CSS :first-child, but also tag it
    var firstField = slideEl.querySelector('.event-field');
    if (firstField) firstField.classList.add('focus-keep');
  };

  var enterFocusMode = function () {
    if (!focusModeEnabled) return;
    var activeStep = presentSteps[state.index];
    tagFocusElements(activeStep);
    site.classList.add('is-focus-mode');
  };

  var exitFocusMode = function () {
    site.classList.remove('is-focus-mode');
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
    syncDetailsPresentationState(activeStep);
    ensureAccordionStepVisible(activeStep);

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

    // Phase 2: Re-tag focus anchors when slide changes during narration
    if (site.classList.contains('is-focus-mode')) {
      tagFocusElements(activeStep);
    }
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

  var requestBrowserFullscreen = function () {
    var el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(function () {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  var exitBrowserFullscreen = function () {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl) return;
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  /* ── Subtitle display — one sentence at a time ── */
  var formatDuration = function (ms) {
    var totalSec = Math.round(ms / 1000);
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    if (min > 0) {
      return min + ':' + (sec < 10 ? '0' : '') + sec;
    }
    return sec + 's';
  };

  var showSubtitleSentence = function (text) {
    if (!narrationSubtitle) return;
    if (!text) {
      narrationSubtitle.textContent = '';
      narrationSubtitle.classList.remove('is-visible');
      return;
    }
    // Position subtitle: shrink to content while staying clear of brand logo (left) and FAB (right)
    var logo = document.querySelector('.present-brand-logo');
    if (logo) {
      var logoRect = logo.getBoundingClientRect();
      var leftDist = logoRect.right + 16; // logo right edge + 16px gap
      // Clear inline left/right (older builds may have set them) and constrain max-width symmetrically
      narrationSubtitle.style.left = '';
      narrationSubtitle.style.right = '';
      narrationSubtitle.style.maxWidth = 'calc(100vw - ' + (leftDist * 2) + 'px)';
    }
    narrationSubtitle.textContent = text;
    narrationSubtitle.classList.add('is-visible');
  };

  /* ── Screen recording via getDisplayMedia ── */
  var isRecording = function () {
    return mediaRecorder && mediaRecorder.state === 'recording';
  };

  var stopRecording = function () {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach(function (t) { t.stop(); });
      recordingStream = null;
    }
    root.classList.remove('is-recording');
  };

  var toggleRecording = function () {
    // If already recording, stop
    if (isRecording()) {
      stopRecording();
      return;
    }

    // Check API support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      window.alert(getLang() === 'zh' ? '当前浏览器不支持屏幕录制' : 'Screen recording is not supported in this browser');
      return;
    }

    // Step 1: Request screen capture first (browser dialog)
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      systemAudio: 'include'
    }).then(function (stream) {
      // Step 2: Show progress overlay
      var prepOverlay = document.createElement('div');
      prepOverlay.className = 'present-countdown-overlay';
      var zhM = getLang() === 'zh';
      var rss = {};
      try { rss = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
      var rIsLocal = rss.ttsEngine === 'moss-tts-nano' || rss.ttsEngine === 'fish-s2';
      var rSteps = [
        { id: 'script', label: zhM ? '生成讲稿' : 'Generating script' }
      ];
      if (rIsLocal) rSteps.push({ id: 'audio', label: zhM ? '合成语音' : 'Synthesizing audio' });
      var rHtml = '<div class="prep-progress">';
      rSteps.forEach(function (s, i) {
        rHtml += '<div class="prep-step" data-step="' + s.id + '">' +
          '<span class="prep-step-icon prep-step-pending">' + (i + 1) + '</span>' +
          '<span class="prep-step-label">' + s.label + '</span>' +
          '<span class="prep-step-status"></span></div>';
      });
      rHtml += '</div>';
      prepOverlay.innerHTML = rHtml;
      document.body.appendChild(prepOverlay);

      var rSetActive = function (id) {
        var el = prepOverlay.querySelector('[data-step="' + id + '"]');
        if (!el) return;
        el.querySelector('.prep-step-icon').className = 'prep-step-icon prep-step-active';
        var st = el.querySelector('.prep-step-status');
        st.textContent = zhM ? '进行中…' : 'In progress…';
        st.className = 'prep-step-status prep-status-active';
      };
      var rSetDone = function (id) {
        var el = prepOverlay.querySelector('[data-step="' + id + '"]');
        if (!el) return;
        var icon = el.querySelector('.prep-step-icon');
        icon.className = 'prep-step-icon prep-step-done'; icon.textContent = '\u2713';
        var st = el.querySelector('.prep-step-status');
        st.textContent = zhM ? '完成' : 'Done';
        st.className = 'prep-step-status prep-status-done';
      };
      rSetActive('script');

      // Step 3: Enter presentation mode if not already
      if (!state.enabled) {
        enterPresentation();
      }
      setPresentationStep(0);

      // Step 4: Pre-generate first slide narrative
      ensureNarrationController().then(function (ctrl) {
        return ctrl.pregenerate(presentSteps, 0, getLang, function (phase) {
          if (phase === 'script-done') { rSetDone('script'); if (rIsLocal) rSetActive('audio'); }
          else if (phase === 'audio-done') { rSetDone('audio'); }
        });
      }).then(function () {
        rSteps.forEach(function (s) { rSetDone(s.id); });
        setTimeout(function () {
          if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);

          showCountdown(function () {
          // Step 6: 1s pause, then start recording + narration
          setTimeout(function () {
            // Setup MediaRecorder
            recordingStream = stream;
            recordedChunks = [];

            // Build recording stream — merge video + TTS audio based on engine
            var ss = {};
            try { ss = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
            var recordStream = stream;

            // VibeVoice — use its own audio stream
            if (ss.ttsProvider === 'vibevoice' && window.StudyRoomNarration) {
              var vibeAudioStream = window.StudyRoomNarration.getVibeAudioStream();
              if (vibeAudioStream) {
                recordStream = new MediaStream();
                stream.getVideoTracks().forEach(function (t) { recordStream.addTrack(t); });
                vibeAudioStream.getAudioTracks().forEach(function (t) { recordStream.addTrack(t); });
              }
            }

            // Local MLX TTS (Qwen3-TTS / Fish Audio S2) — use Web Audio capture stream
            if ((ss.ttsEngine === 'moss-tts-nano' || ss.ttsEngine === 'fish-s2') && window.StudyRoomNarration && window.StudyRoomNarration.getTtsAudioStream) {
              var ttsStream = window.StudyRoomNarration.getTtsAudioStream();
              if (ttsStream) {
                recordStream = new MediaStream();
                stream.getVideoTracks().forEach(function (t) { recordStream.addTrack(t); });
                ttsStream.getAudioTracks().forEach(function (t) { recordStream.addTrack(t); });
              }
            }

            var mimeType = 'video/webm;codecs=vp9,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

            mediaRecorder = new MediaRecorder(recordStream, { mimeType: mimeType });
            mediaRecorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = function () {
              var blob = new Blob(recordedChunks, { type: mimeType });
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              a.download = sanitizeFileName(document.title || 'presentation') + '.webm';
              document.body.appendChild(a); a.click(); document.body.removeChild(a);
              setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
              recordedChunks = [];
              if (presentationTip) {
                var origTip = presentationTip.textContent;
                presentationTip.textContent = getLabel('recordSaved');
                setTimeout(function () { presentationTip.textContent = origTip; }, 3000);
              }
            };

            var videoTracks = stream.getVideoTracks();
            if (videoTracks.length) {
              videoTracks[0].addEventListener('ended', function () {
                if (isRecording()) stopRecording();
              });
            }

            mediaRecorder.start(1000);
            root.classList.add('is-recording');
            narrationStartTime = Date.now();
            narrationController.start(presentSteps, 0, getLang);
          }, 1000);
        });
        }, 300);
      }).catch(function () {
        // Pregen failed — still proceed
        if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
        showCountdown(function () {
          setTimeout(function () {
            recordingStream = stream;
            recordedChunks = [];
            var mimeType = 'video/webm';
            mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
            mediaRecorder.ondataavailable = function (e) { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
            mediaRecorder.start(1000);
            root.classList.add('is-recording');
            narrationStartTime = Date.now();
            handleAutoPlayClick();
          }, 1000);
        });
      });
    }).catch(function () {
      // User cancelled screen capture dialog — do nothing
    });
  };

  /* ── Countdown overlay before narration starts ── */
  var showCountdown = function (callback) {
    var overlay = document.createElement('div');
    overlay.className = 'present-countdown-overlay';
    document.body.appendChild(overlay);

    var count = 3;
    var showNumber = function () {
      if (count <= 0) {
        overlay.classList.add('is-fading-out');
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          callback();
        }, 400);
        return;
      }
      overlay.innerHTML = '<span class="present-countdown-num">' + count + '</span>';
      var numEl = overlay.querySelector('.present-countdown-num');
      numEl.offsetWidth;
      numEl.classList.add('is-animating');
      count--;
      setTimeout(showNumber, 1000);
    };
    showNumber();
  };

  var wireCapsuleHandlers = function () {
    var settingsPanel = document.querySelector('.narration-settings-panel');

    // Wire capsule Settings button
    if (narrationCapsuleSettingsBtn && !narrationCapsuleSettingsBtn._wired) {
      narrationCapsuleSettingsBtn._wired = true;
      narrationCapsuleSettingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var sp = document.querySelector('.narration-settings-panel');
        if (sp) {
          // Delay toggle to avoid outside-click handler race
          setTimeout(function () { sp.classList.toggle('is-open'); }, 0);
        }
      });
    }

    // Wire capsule Record button
    if (narrationCapsuleRecordBtn && !narrationCapsuleRecordBtn._wired) {
      narrationCapsuleRecordBtn._wired = true;
      narrationCapsuleRecordBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleRecording();
      });
    }

    // Wire capsule Chat button
    if (narrationCapsuleChatBtn && !narrationCapsuleChatBtn._wired) {
      narrationCapsuleChatBtn._wired = true;
      narrationCapsuleChatBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var dialog = document.querySelector('.assistant-dialog');
        if (dialog) {
          var isOpen = dialog.classList.contains('is-open');
          dialog.classList.toggle('is-open', !isOpen);
          if (!isOpen) {
            var input = dialog.querySelector('.assistant-input');
            if (input) input.focus();
          }
        }
      });
    }

    // Wire capsule main area (Narrator)
    var capsuleMain = presentationAutoPlay ? presentationAutoPlay.querySelector('.narration-capsule-main') : null;
    if (capsuleMain && !capsuleMain._wired) {
      capsuleMain._wired = true;
      capsuleMain.addEventListener('click', function (e) {
        e.stopPropagation();
        if (state.enabled && hasNarrationSupport()) {
          handleAutoPlayClick();
        }
      });
    }
  };

  var enterPresentation = function () {
    state.enabled = true;
    root.classList.add('is-presentation-mode');

    // Sync narration settings panel from localStorage (launch panel writes there)
    var settingsPanel = document.querySelector('.narration-settings-panel');
    if (settingsPanel && settingsPanel._refreshFromStorage) {
      settingsPanel._refreshFromStorage();
    }

    // Take over the FAB for narration
    ensureNarrationFab();
    if (presentationAutoPlay && hasNarrationSupport()) {
      buildCapsuleStructure();
      wireCapsuleHandlers();
      presentationAutoPlay.classList.add('is-narration-mode');
      var mainArea = presentationAutoPlay.querySelector('.narration-capsule-main');
      if (mainArea) mainArea.innerHTML = NARRATION_SVG_PLAY;
      presentationAutoPlay.setAttribute('aria-label', getLabel('autoPlay'));
    }
    expandAllAccordions();
    setPresentationStep(0);
    updatePresentationLabels();
    requestBrowserFullscreen();

    // Phase 4: Mobile presentation mode — explicit toggle OR auto-detect by viewport
    mobilePresentEnabled = localStorage.getItem('present-mobile-mode') === 'true' || window.innerWidth <= 768;
    if (mobilePresentEnabled) {
      root.classList.add('is-mobile-present');
      ensureMobilePresent();
    }
  };

  /** Prepare narration controller (lazy load + create). Returns Promise<controller>. */
  var ensureNarrationController = function () {
    return ensureNarration().then(function (narrationModule) {
      if (!narrationController) {
        narrationController = narrationModule.createController({
          onFillProgress: function (filled, total, currentIdx) {
            if (!prefetchBar) return;
            if (total <= 0) { prefetchBar.style.display = 'none'; return; }
            prefetchBar.style.display = '';
            var pct = Math.round((filled / total) * 100);
            var pointerPct = Math.round(((currentIdx + 0.5) / total) * 100);
            prefetchBar.querySelector('.present-prefetch-fill').style.width = pct + '%';
            prefetchBar.querySelector('.present-prefetch-pointer').style.left = pointerPct + '%';
            if (filled >= total) {
              setTimeout(function () { prefetchBar.style.display = 'none'; }, 2000);
            }
          },
          onSlideComplete: function (status, targetIndex) {
            if (status === 'next' && targetIndex !== undefined) {
              // Controller already started playing the next slide internally.
              // Sync UI to controller's pointer — not state.index + 1.
              if (state.enabled) {
                setPresentationStep(targetIndex);
              }
            } else {
              var elapsed = Date.now() - narrationStartTime;
              stopNarration();
              if (isRecording()) stopRecording();
              if (presentationTip) {
                var origTip = presentationTip.textContent;
                presentationTip.textContent = getLabel('narrationComplete') + ' · ' + getLabel('narrationDuration') + ' ' + formatDuration(elapsed);
                setTimeout(function () { presentationTip.textContent = origTip; }, 5000);
              }
            }
          },
          onStateChange: function (newState) {
            narrationState = newState;
            root.classList.toggle('is-narrating', newState === 'playing' || newState === 'generating');
            // Phase 2: Focus mode — enter on play, exit on pause/idle
            if (newState === 'playing') {
              enterFocusMode();
            } else if (newState === 'paused' || newState === 'idle') {
              exitFocusMode();
            }
            updateAutoPlayButton();
          },
          onSubtitle: function (text) { showSubtitleSentence(text); },
          onError: function () {
            if (presentationTip) {
              var origTip = presentationTip.textContent;
              presentationTip.textContent = getLabel('narrationError');
              setTimeout(function () { presentationTip.textContent = origTip; }, 2000);
            }
          }
        });
      }
      return narrationController;
    });
  };

  /** Auto-start flow: show prep overlay → pregen slide 0 → countdown → start narration. */
  var startAutoNarration = function () {
    // Show FAB generating state
    var mainArea = presentationAutoPlay ? presentationAutoPlay.querySelector('.narration-capsule-main') : null;
    if (mainArea) mainArea.innerHTML = NARRATION_SVG_GENERATING;

    var zhMode = getLang() === 'zh';
    var ss = {};
    try { ss = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
    var isLocalTTS = ss.ttsEngine === 'moss-tts-nano' || ss.ttsEngine === 'fish-s2';

    // Build step definitions
    var steps = [
      { id: 'script', label: zhMode ? '生成讲稿' : 'Generating script' }
    ];
    if (isLocalTTS) {
      steps.push({ id: 'audio', label: zhMode ? '合成语音' : 'Synthesizing audio' });
    }

    // Show progress overlay
    var prepOverlay = document.createElement('div');
    prepOverlay.className = 'present-countdown-overlay';
    var stepsHtml = '<div class="prep-progress">';
    steps.forEach(function (s, i) {
      stepsHtml += '<div class="prep-step" data-step="' + s.id + '">' +
        '<span class="prep-step-icon prep-step-pending">' + (i + 1) + '</span>' +
        '<span class="prep-step-label">' + s.label + '</span>' +
        '<span class="prep-step-status"></span>' +
        '</div>';
    });
    stepsHtml += '</div>';
    prepOverlay.innerHTML = stepsHtml;
    document.body.appendChild(prepOverlay);

    var setStepActive = function (id) {
      var el = prepOverlay.querySelector('[data-step="' + id + '"]');
      if (!el) return;
      var icon = el.querySelector('.prep-step-icon');
      var status = el.querySelector('.prep-step-status');
      icon.className = 'prep-step-icon prep-step-active';
      status.textContent = zhMode ? '进行中…' : 'In progress…';
      status.className = 'prep-step-status prep-status-active';
    };
    var setStepDone = function (id) {
      var el = prepOverlay.querySelector('[data-step="' + id + '"]');
      if (!el) return;
      var icon = el.querySelector('.prep-step-icon');
      var status = el.querySelector('.prep-step-status');
      icon.className = 'prep-step-icon prep-step-done';
      icon.textContent = '\u2713';
      status.textContent = zhMode ? '完成' : 'Done';
      status.className = 'prep-step-status prep-status-done';
    };

    setStepActive('script');

    // Pre-generate first slide narrative + audio
    ensureNarrationController().then(function (ctrl) {
      return ctrl.pregenerate(presentSteps, 0, getLang, function (phase) {
        if (phase === 'script-done') {
          setStepDone('script');
          if (isLocalTTS) setStepActive('audio');
        } else if (phase === 'audio-done') {
          setStepDone('audio');
        }
      });
    }).then(function () {
      // Ensure all steps show done
      steps.forEach(function (s) { setStepDone(s.id); });
      setTimeout(function () {
        if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
        if (mainArea) mainArea.innerHTML = NARRATION_SVG_PLAY;
        showCountdown(function () {
          narrationStartTime = Date.now();
          narrationController.start(presentSteps, state.index, getLang);
        });
      }, 300);
    }).catch(function () {
      if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
      if (mainArea) mainArea.innerHTML = NARRATION_SVG_PLAY;
      showCountdown(function () {
        narrationStartTime = Date.now();
        handleAutoPlayClick();
      });
    });
  };

  var stopNarration = function () {
    if (narrationController && narrationController.isActive()) {
      narrationController.stop();
    }
    showSubtitleSentence('');
    narrationState = 'idle';
    root.classList.remove('is-narrating');
    exitFocusMode();
    updateAutoPlayButton();
  };

  var updateAutoPlayButton = function () {
    if (!presentationAutoPlay) return;
    if (!state.enabled) return; // only in presentation mode
    var mainArea = presentationAutoPlay.querySelector('.narration-capsule-main');
    if (!mainArea) return;
    if (narrationState === 'generating') {
      mainArea.innerHTML = NARRATION_SVG_GENERATING;
      presentationAutoPlay.setAttribute('aria-label', getLabel('narrationGenerating'));
    } else if (narrationState === 'playing') {
      mainArea.innerHTML = NARRATION_SVG_WAVE;
      presentationAutoPlay.setAttribute('aria-label', getLabel('pauseNarration'));
    } else if (narrationState === 'paused') {
      mainArea.innerHTML = NARRATION_SVG_PLAY;
      presentationAutoPlay.setAttribute('aria-label', getLabel('resumeNarration'));
    } else {
      // idle
      mainArea.innerHTML = NARRATION_SVG_PLAY;
      presentationAutoPlay.setAttribute('aria-label', getLabel('autoPlay'));
    }
  };

  var handleAutoPlayClick = function () {
    if (!state.enabled) return;
    if (!hasNarrationSupport()) return;

    // If narrating — stop
    if (narrationState === 'playing' || narrationState === 'generating') {
      stopNarration();
      return;
    }

    // If paused — resume
    if (narrationState === 'paused') {
      if (narrationController) narrationController.resume();
      narrationState = 'playing';
      root.classList.add('is-narrating');
      updateAutoPlayButton();
      return;
    }

    // idle → start narration
    presentationAutoPlay.disabled = true;
    var mainArea = presentationAutoPlay.querySelector('.narration-capsule-main');
    if (mainArea) mainArea.innerHTML = NARRATION_SVG_GENERATING;
    ensureNarrationController().then(function (ctrl) {
      presentationAutoPlay.disabled = false;
      narrationStartTime = Date.now();
      ctrl.start(presentSteps, state.index, getLang);
    }).catch(function (err) {
      presentationAutoPlay.disabled = false;
      console.error('Narration load failed:', err);
    });
  };

  var exitPresentation = function () {
    var activeStep = presentSteps[state.index];

    stopNarration();
    if (isRecording()) stopRecording();

    // Restore FAB to chat mode
    if (presentationAutoPlay) {
      presentationAutoPlay.classList.remove('is-narration-mode');
      var originalHtml = presentationAutoPlay.getAttribute('data-original-html');
      if (originalHtml) {
        presentationAutoPlay.innerHTML = originalHtml;
        presentationAutoPlay.removeAttribute('data-original-html');
      } else {
        presentationAutoPlay.innerHTML = NARRATION_SVG_CHAT;
      }
      presentationAutoPlay.setAttribute('aria-label', 'AI Assistant');
      narrationCapsuleSettingsBtn = null;
      narrationCapsuleRecordBtn = null;
      narrationCapsuleChatBtn = null;
    }

    state.enabled = false;
    root.classList.remove('is-presentation-mode');

    // Phase 4: Clean up mobile presentation mode
    root.classList.remove('is-mobile-present');
    if (mobilePresentController) {
      mobilePresentController.destroy();
      mobilePresentController = null;
    }

    restoreAccordionStates();
    setPresentationStep(state.index);
    updatePresentationLabels();
    exitBrowserFullscreen();

    if (activeStep) {
      activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  var goToPreviousStep = function () {
    if (!state.enabled || state.index <= 0) return;
    setPresentationStep(state.index - 1);
    if (narrationController && narrationController.isActive()) {
      narrationController.syncToSlide(state.index);
    }
  };

  var goToNextStep = function () {
    if (!state.enabled || state.index >= presentSteps.length - 1) return;
    setPresentationStep(state.index + 1);
    if (narrationController && narrationController.isActive()) {
      narrationController.syncToSlide(state.index);
    }
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
  var themeToggleBtn = ensureThemeToggle();
  var langToggleBtn = ensureLangToggle();
  buildLaunchPanel();
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

  presentationToggle.addEventListener('click', function (e) {
    if (state.enabled) {
      exitPresentation();
      return;
    }

    // Click no longer auto-starts presentation. Toggle the panel open/closed instead.
    var wrapper = topbar.querySelector('.present-launch-wrapper');
    if (wrapper) {
      e.stopPropagation();
      buildLaunchPanel();
      if (wrapper.classList.contains('is-open')) {
        closeTopbarPanels();
      } else {
        openTopbarPanel('.present-launch-wrapper');
      }
    }
  });

  if (styleToggle) {
    styleToggle.addEventListener('click', function (e) {
      var wrapper = topbar.querySelector('.present-style-wrapper');
      e.stopPropagation();
      if (!wrapper) return;
      if (wrapper.classList.contains('is-open')) {
        closeTopbarPanels();
      } else {
        openTopbarPanel('.present-style-wrapper');
      }
    });
  }

  themeToggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var cur = root.getAttribute('data-theme') || 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (err) {}
  });

  langToggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var cur = getLang();
    var next = cur === 'zh' ? 'en' : 'zh';
    applyLanguageToDocument(next);
    var labelSpan = langToggleBtn.querySelector('.topbar-lang-label');
    if (labelSpan) labelSpan.textContent = next === 'zh' ? 'EN' : '中';
    var themeBtn = topbar.querySelector('[data-theme-toggle]');
    if (themeBtn) themeBtn.setAttribute('aria-label', next === 'zh' ? '切换深浅色' : 'Toggle theme');
  });


  // Close the panel when clicking outside (panels are portaled to body, so check them too).
  document.addEventListener('click', function (e) {
    var launchWrapper = topbar && topbar.querySelector('.present-launch-wrapper.is-open');
    var stylePanelWrapper = topbar && topbar.querySelector('.present-style-wrapper.is-open');
    var launchPanel = document.querySelector('.present-launch-panel.is-open');
    var stylePanel = document.querySelector('.present-style-panel.is-open');
    var insideLaunch = (launchWrapper && launchWrapper.contains(e.target)) || (launchPanel && launchPanel.contains(e.target));
    var insideStyle = (stylePanelWrapper && stylePanelWrapper.contains(e.target)) || (stylePanel && stylePanel.contains(e.target));
    if ((launchWrapper || stylePanelWrapper) && !insideLaunch && !insideStyle) {
      closeTopbarPanels();
    }
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

  // Narration — only get FAB reference at init (don't modify its content)
  ensureNarrationFab();
  var narrationSettingsPanel = ensureNarrationSettingsPanel();

  document.addEventListener('keydown', function (event) {
    if (!state.enabled) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      exitPresentation();
      return;
    }

    if (isBlockedTarget(event.target)) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goToNextStep();
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      // Space: pause/resume narration if active, otherwise advance slide
      if (narrationState === 'playing') {
        if (narrationController) narrationController.pause();
        narrationState = 'paused';
        root.classList.remove('is-narrating');
        updateAutoPlayButton();
      } else if (narrationState === 'paused') {
        if (narrationController) narrationController.resume();
        narrationState = 'playing';
        root.classList.add('is-narrating');
        updateAutoPlayButton();
      } else {
        goToNextStep();
      }
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

  // Visibility change — pause narration when tab hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && narrationController && narrationState === 'playing') {
      narrationController.pause();
      narrationState = 'paused';
      root.classList.remove('is-narrating');
      updateAutoPlayButton();
    }
  });

  var onFullscreenChange = function () {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl && state.enabled) {
      exitPresentation();
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
});
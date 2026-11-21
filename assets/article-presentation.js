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
  var presentationStatus;
  var presentationPagerToggle;
  var presentationPagerMenu;
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
  var recordAspectRatio = localStorage.getItem('present-record-ratio') || '16:9';

  if (!site || !topbar || !hero || !main) return;

  // Phase 3: Listen for record ratio change from narration-ui settings panel
  document.addEventListener('recordRatioChanged', function (e) {
    recordAspectRatio = e.detail.ratio;
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
      pagePicker: '选择页面',
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
      pagePicker: 'Select slide',
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

  // Build a shareable URL that carries the current language, theme, and style
  // so a reader who opens the link keeps the sharer's selection.
  var buildShareUrl = function () {
    var lang = getLang();
    var theme = root.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    var style = root.getAttribute('data-style') || localStorage.getItem('article-style') || 'clean';
    var loc = window.location;
    var base = (loc.origin && loc.origin !== 'null') ? loc.origin + loc.pathname : loc.href.split('#')[0].split('?')[0];
    var parts = ['lang=' + (lang === 'en' ? 'en' : 'zh'), 'theme=' + (theme === 'dark' ? 'dark' : 'light')];
    if (style && style !== 'clean') parts.push('style=' + style);
    return base + '?' + parts.join('&') + (loc.hash || '');
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

  /* ── Presentation styles ──
     Each preset owns its canvas class plus a surface polarity; the polarity drives
     data-theme while presenting so every component follows the style, not just the
     background. Reading mode always falls back to the reader's own theme. */
  var PRESENT_BG_STYLES = {
    'default': { className: '', surface: null },
    white: { className: 'present-bg-white', surface: 'light' },
    black: { className: 'present-bg-black', surface: 'dark' },
    gray: { className: 'present-bg-gray', surface: 'light' },
    corporate: { className: 'present-bg-corporate', surface: 'light' },
    cola: { className: 'present-bg-cola', surface: 'dark' }
  };

  var getReadingTheme = function () {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  };

  var getPresentBgKey = function () {
    var value = localStorage.getItem('present-bg') || 'default';
    return PRESENT_BG_STYLES[value] ? value : 'default';
  };

  var syncPresentationSurface = function () {
    var entry = PRESENT_BG_STYLES[getPresentBgKey()];
    var surface = (state.enabled && entry.surface) ? entry.surface : getReadingTheme();
    root.setAttribute('data-theme', surface);
  };

  var applyPresentBg = function (value) {
    Object.keys(PRESENT_BG_STYLES).forEach(function (key) {
      var className = PRESENT_BG_STYLES[key].className;
      if (className) document.body.classList.remove(className);
    });

    var entry = PRESENT_BG_STYLES[value] || PRESENT_BG_STYLES['default'];
    if (entry.className) document.body.classList.add(entry.className);
    syncPresentationSurface();
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

    // Keep the mobile chapter menu with the leading navigation controls.
    if (navLinks && !topbarStart.querySelector('.nav-toggle')) {
      var mobileToggle = document.createElement('button');
      mobileToggle.className = 'nav-toggle';
      mobileToggle.setAttribute('aria-label', 'Toggle navigation');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
      topbarStart.appendChild(mobileToggle);
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

  // ── Shared TTS / Voice / Settings Helpers ──
  var DIALECT_MAP = {
    'zh-CN': '普通话', 'zh-TW': '台湾', 'zh-HK': '粤语',
    'en-US': 'US', 'en-GB': 'UK', 'en-AU': 'AU', 'en-IN': 'IN', 'en-IE': 'IE', 'en-ZA': 'ZA'
  };

  var fillBrowserVoiceOptions = function (voiceSelect, filterLang, autoLabel, restoreVal, fallbackVal) {
    if (!window.speechSynthesis) return false;
    var allVoices = window.speechSynthesis.getVoices();
    if (!allVoices || !allVoices.length) return false;
    var langPrefix = (filterLang === 'zh') ? 'zh' : 'en';
    while (voiceSelect.options.length > 1) {
      voiceSelect.removeChild(voiceSelect.lastChild);
    }
    if (autoLabel && voiceSelect.options[0]) voiceSelect.options[0].textContent = autoLabel;
    allVoices.forEach(function (v) {
      if (v.lang.indexOf(langPrefix) !== 0) return;
      if (!/premium|natural|nature/i.test(v.name + ' ' + v.voiceURI)) return;
      var opt = document.createElement('option');
      opt.value = v.name;
      var coreName = v.name.replace(/\s*\(.*\)\s*$/, '');
      opt.textContent = coreName + ' · ' + (DIALECT_MAP[v.lang] || v.lang);
      opt.title = v.name + ' (' + v.lang + ')';
      voiceSelect.appendChild(opt);
    });
    if (restoreVal) voiceSelect.value = restoreVal;
    else if (fallbackVal) voiceSelect.value = fallbackVal;
    return true;
  };

  var playRemoteTtsPreview = function (endpoint, headers, body, btn, failAlertZh, failAlertEn) {
    btn.classList.add('is-testing');
    fetch(endpoint + '/audio/speech', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
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
        src.onended = function () { btn.classList.remove('is-testing'); };
        src.start(0);
      });
    })
    .catch(function (err) {
      btn.classList.remove('is-testing');
      console.error('TTS preview error:', err);
      if (failAlertZh || failAlertEn) {
        window.alert(getLang() === 'zh' ? failAlertZh : failAlertEn);
      }
    });
  };

  var playVibeVoicePreview = function (voice, rate, btn) {
    playRemoteTtsPreview(
      'http://127.0.0.1:8191/v1',
      { 'Content-Type': 'application/json', 'Authorization': 'Bearer dummy' },
      {
        model: 'VibeVoice-Realtime-0.5B-4bit',
        input: 'This is a voice preview. You can hear how the selected voice sounds.',
        voice: voice || 'en-Emma_woman',
        speed: parseFloat(rate) || 1.0
      },
      btn,
      'VibeVoice 试听失败，请确认服务已启动',
      'VibeVoice preview failed. Ensure the service is running.'
    );
  };

  var playBrowserVoicePreview = function (filterLang, rate, voiceName, btn) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var isZh = filterLang === 'zh';
    var utt = new SpeechSynthesisUtterance(
      isZh
        ? '这是一段语音测试，你可以听到当前选择的语音效果。'
        : 'This is a voice preview. You can hear how the selected voice sounds.'
    );
    utt.lang = isZh ? 'zh-CN' : 'en-US';
    utt.rate = parseFloat(rate) || 0.92;
    if (voiceName) {
      var match = window.speechSynthesis.getVoices().filter(function (v) { return v.name === voiceName; });
      if (match.length) utt.voice = match[0];
    }
    btn.classList.add('is-testing');
    utt.onend = function () { btn.classList.remove('is-testing'); };
    utt.onerror = function () { btn.classList.remove('is-testing'); };
    window.speechSynthesis.speak(utt);
  };

  var bindVoiceCloneSelect = function (selectEl, recordBtn, deleteBtn, qualityRow, onChanged, initialValue) {
    var updateUI = function () {
      var isClone = selectEl.value.indexOf('clone:') === 0;
      if (deleteBtn) deleteBtn.style.display = isClone ? '' : 'none';
      if (qualityRow) qualityRow.style.display = isClone ? '' : 'none';
    };
    var refreshOptions = function (selectId) {
      var clones = loadVoiceClones();
      var toRemove = [];
      for (var i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value.indexOf('clone:') === 0 || selectEl.options[i].dataset.cloneGroup === '1') {
          toRemove.push(selectEl.options[i]);
        }
      }
      toRemove.forEach(function (o) { o.remove(); });
      clones.slice().reverse().forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = 'clone:' + c.id;
        opt.dataset.cloneGroup = '1';
        var dur = c.duration ? c.duration.toFixed(1) + 's' : '';
        opt.textContent = '🎙 ' + c.name + (dur ? ' · ' + dur : '');
        selectEl.insertBefore(opt, selectEl.firstChild);
      });
      var want = selectId || selectEl.value;
      if (want && Array.prototype.some.call(selectEl.options, function (o) { return o.value === want; })) {
        selectEl.value = want;
      }
      updateUI();
    };
    refreshOptions(initialValue || null);
    if (recordBtn) {
      recordBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openVoiceCloneModal(function (entry) {
          refreshOptions('clone:' + entry.id);
          onChanged();
        });
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var current = selectEl.value;
        if (current.indexOf('clone:') !== 0) return;
        var id = current.slice(6);
        var clones = loadVoiceClones();
        var entry = null;
        for (var i = 0; i < clones.length; i++) { if (clones[i].id === id) { entry = clones[i]; break; } }
        var name = entry ? entry.name : '';
        var isZh = getLang() === 'zh';
        var msg = (isZh ? '确定删除克隆声音 “' : 'Delete cloned voice “') + name + (isZh ? '” 吗？此操作不可恢复。' : '”? This cannot be undone.');
        if (!window.confirm(msg)) return;
        saveVoiceClones(clones.filter(function (c) { return c.id !== id; }));
        selectEl.value = 'vivian';
        refreshOptions('vivian');
        onChanged();
      });
    }
    selectEl.addEventListener('change', function () {
      updateUI();
      onChanged();
    });
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
    try { savedSettings = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) { savedSettings = {}; }
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
      '    <button type="button" class="launch-voice-test" data-launch="voicePreview" aria-label="' + (zhMode ? '试听' : 'Preview') + '">' +
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
      '<h4 class="launch-section-title">' + (zhMode ? '演示风格' : 'Presentation Style') + '</h4>',
      '<div class="launch-background-options" role="group" aria-label="' + (zhMode ? '演示风格' : 'Presentation Style') + '">',
      '  <button type="button" class="launch-background-option" data-bg-style="default">',
      '    <span class="launch-background-preview is-default"></span>',
      '    <span>' + (zhMode ? '默认' : 'Default') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-background-option" data-bg-style="white">',
      '    <span class="launch-background-preview is-white"></span>',
      '    <span>' + (zhMode ? '纯白' : 'White') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-background-option" data-bg-style="black">',
      '    <span class="launch-background-preview is-black"></span>',
      '    <span>' + (zhMode ? '纯黑' : 'Black') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-background-option" data-bg-style="gray">',
      '    <span class="launch-background-preview is-gray"></span>',
      '    <span>' + (zhMode ? '浅灰' : 'Gray') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-background-option" data-bg-style="corporate">',
      '    <span class="launch-background-preview is-corporate"></span>',
      '    <span>' + (zhMode ? '商务' : 'Corporate') + '</span>',
      '  </button>',
      '  <button type="button" class="launch-background-option" data-bg-style="cola">',,
      '    <span class="launch-background-preview is-cola"></span>',
      '    <span>' + (zhMode ? '可乐红' : 'Cola Red') + '</span>',
      '  </button>',
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
    var voiceTestBtn = panel.querySelector('[data-launch="voicePreview"]');
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

    var transitionOptions = panel.querySelectorAll('[data-transition-style]');
    var backgroundOptions = panel.querySelectorAll('[data-bg-style]');

    var syncLaunchPanelCopy = function () {
      zhMode = getLang() === 'zh';

      var text = function (el, zh, en) {
        if (el) el.textContent = zhMode ? zh : en;
      };
      var attr = function (el, name, zh, en) {
        if (el) el.setAttribute(name, zhMode ? zh : en);
      };
      var rowLabel = function (control, zh, en) {
        var row = control ? control.closest('.launch-row') : null;
        text(row ? row.querySelector('span') : null, zh, en);
      };
      var optionText = function (select, value, zh, en) {
        if (!select) return;
        Array.prototype.forEach.call(select.options, function (option) {
          if (option.value === value) option.textContent = zhMode ? zh : en;
        });
      };

      var titles = panel.querySelectorAll('.launch-section-title');
      text(titles[0], '语音讲解', 'Narration');
      text(titles[1], '演示风格', 'Presentation Style');
      text(titles[2], '过渡风格', 'Transition');

      rowLabel(autoNarrateBtn, '自动语音讲解', 'Auto narration');
      attr(autoNarrateBtn, 'aria-label', '自动语音讲解', 'Auto narration');
      rowLabel(ttsSelect, '引擎', 'Engine');
      optionText(ttsSelect, 'browser', '浏览器内置', 'Browser');

      rowLabel(mossTtsVoiceSelect, '音色', 'Voice');
      optionText(mossTtsVoiceSelect, 'vivian', 'vivian (活泼女声)', 'vivian (Female ZH)');
      optionText(mossTtsVoiceSelect, 'serena', 'serena (温柔女声)', 'serena (Female ZH)');
      optionText(mossTtsVoiceSelect, 'uncle_fu', 'uncle_fu (成熟男声)', 'uncle_fu (Male ZH)');
      optionText(mossTtsVoiceSelect, 'dylan', 'dylan (京腔男声)', 'dylan (Male Beijing)');
      optionText(mossTtsVoiceSelect, 'ryan', 'ryan (英文男声)', 'ryan (Male EN)');
      optionText(mossTtsVoiceSelect, 'aiden', 'aiden (美式男声)', 'aiden (Male US)');
      var cloneRecordBtn = panel.querySelector('.launch-clone-record');
      var cloneDeleteBtn = panel.querySelector('.launch-clone-delete');
      attr(cloneRecordBtn, 'title', '录制新声音', 'Record new clone');
      attr(cloneRecordBtn, 'aria-label', '录制新声音', 'Record new clone');
      attr(cloneDeleteBtn, 'title', '删除当前克隆', 'Delete current clone');
      attr(cloneDeleteBtn, 'aria-label', '删除', 'Delete');

      rowLabel(launchCloneQualitySelect, '克隆质量', 'Clone quality');
      optionText(launchCloneQualitySelect, '8bit', '快速（8bit）', 'Fast (8bit)');
      optionText(launchCloneQualitySelect, 'bf16', '高质（bf16）', 'High quality (bf16)');
      rowLabel(fishVoiceInput, '音色', 'Voice');
      if (fishVoiceInput) fishVoiceInput.placeholder = zhMode ? '留空 = 默认音色' : 'blank = default';
      rowLabel(emotionSelect, '情绪', 'Emotion');
      optionText(emotionSelect, 'default', '默认讲解', 'Default narrator');
      optionText(emotionSelect, 'passionate', '充满激情', 'Passionate');
      optionText(emotionSelect, 'inspiring', '激励鼓舞', 'Inspiring');
      optionText(emotionSelect, 'warm', '温暖亲切', 'Warm');
      optionText(emotionSelect, 'cheerful', '轻松愉快', 'Cheerful');
      optionText(emotionSelect, 'serious', '严肃权威', 'Serious');
      optionText(emotionSelect, 'storytelling', '娓娓道来', 'Storytelling');
      optionText(emotionSelect, 'urgent', '紧迫急切', 'Urgent');

      rowLabel(voiceSelect, '音色', 'Voice');
      optionText(voiceSelect, '', '自动', 'Auto');
      attr(voiceTestBtn, 'aria-label', '试听', 'Preview');
      rowLabel(rateInput, '语速', 'Speed');

      backgroundOptions.forEach(function (button) {
        var label = button.querySelectorAll('span')[1];
        var value = button.getAttribute('data-bg-style');
        if (value === 'default') text(label, '默认', 'Default');
        if (value === 'white') text(label, '纯白', 'White');
        if (value === 'black') text(label, '纯黑', 'Black');
        if (value === 'gray') text(label, '浅灰', 'Gray');
        if (value === 'corporate') text(label, '商务', 'Corporate');
        if (value === 'cola') text(label, '可乐红', 'Cola Red');
      });

      transitionOptions.forEach(function (button) {
        var label = button.querySelectorAll('span')[1];
        var style = button.getAttribute('data-transition-style');
        if (style === 'fade') text(label, '淡入', 'Fade');
        if (style === 'morph') text(label, '变形', 'Morph');
        if (style === 'slide') text(label, '滑动', 'Slide');
        if (style === 'zoom') text(label, '缩放', 'Zoom');
      });

      var playBtn = panel.querySelector('.launch-play-btn');
      attr(playBtn, 'aria-label', '开始演示', 'Start Presentation');
      text(panel.querySelector('.launch-hero-label'), '开始演示', 'Start Presentation');
    };

    panel._syncCopy = syncLaunchPanelCopy;
    syncLaunchPanelCopy();

    var presentTransition = localStorage.getItem('present-transition-style') || 'fade';
    transitionOptions.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-transition-style') === presentTransition);
    });
    // Apply on load
    applyPresentationTransitionStyle(presentTransition);
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

    // Presentation background — body classes only take effect inside presentation mode.
    var markActiveBackground = function (value) {
      backgroundOptions.forEach(function (btn) {
        var isActive = btn.getAttribute('data-bg-style') === value;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    var presentBg = getPresentBgKey();
    markActiveBackground(presentBg);
    applyPresentBg(presentBg);

    backgroundOptions.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var value = btn.getAttribute('data-bg-style') || 'default';
        markActiveBackground(value);
        localStorage.setItem('present-bg', value);
        applyPresentBg(value);
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
      var filterLang = langSelect.value === 'auto' ? getLang() : langSelect.value;
      fillBrowserVoiceOptions(voiceSelect, filterLang, zhMode ? '自动' : 'Auto', lastBrowserVoice, '');
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

    langSelect.addEventListener('change', function () {
      // Stub — lang now switches via the topbar toggle; the langChanged listener below
      // handles voice/font refresh.
    });

    document.addEventListener('langChanged', function () {
      syncLaunchPanelCopy();
      if (ttsSelect.value !== 'vibevoice') {
        lastBrowserVoice = '';
        syncVoiceList();
      }
      if (state.enabled) {
        setPresentationStep(state.index);
      }
      saveLaunchSettings();
    });

    ttsSelect.addEventListener('change', function () {
      syncVoiceList();
      saveLaunchSettings();
    });

    if (launchCloneQualitySelect) launchCloneQualitySelect.addEventListener('change', saveLaunchSettings);
    bindVoiceCloneSelect(
      mossTtsVoiceSelect,
      panel.querySelector('.launch-clone-record'),
      panel.querySelector('.launch-clone-delete'),
      panel.querySelector('.launch-clone-quality-row'),
      saveLaunchSettings,
      savedSettings.mossTtsVoice
    );
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
      if (ttsSelect.value === 'vibevoice') {
        playVibeVoicePreview(voiceSelect.value, rateInput.value, voiceTestBtn);
        return;
      }
      var filterLang = langSelect.value === 'auto' ? getLang() : langSelect.value;
      playBrowserVoicePreview(filterLang, rateInput.value, voiceSelect.value, voiceTestBtn);
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
      themeLabel: { zh: '阅读模式', en: 'Reading mode' },
      fontLabel: { zh: '字体', en: 'Font' },
      logoLabel: { zh: '左下角 Logo', en: 'Bottom-left logo' },
      fabLabel: { zh: '右下角按钮', en: 'Bottom-right buttons' }
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
      '  <span class="style-panel-label" data-style-panel-copy="themeLabel">' + getStylePanelCopy('themeLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <div class="style-theme-control">',
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
      '      <button type="button" class="launch-switch style-theme-switch" role="switch" data-style-panel="theme" aria-label="' + getStylePanelCopy('themeLabel') + '"></button>',
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="fontLabel">' + getStylePanelCopy('fontLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <select class="style-panel-select" data-style-panel="presentFont"></select>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="logoLabel">' + getStylePanelCopy('logoLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <button type="button" class="launch-switch" data-style-panel="showLogo"></button>',
      '  </div>',
      '</div>',
      '<div class="style-panel-row">',
      '  <span class="style-panel-label" data-style-panel-copy="fabLabel">' + getStylePanelCopy('fabLabel') + '</span>',
      '  <div class="style-panel-control">',
      '    <button type="button" class="launch-switch" data-style-panel="showFab"></button>',
      '  </div>',
      '</div>'
    ].join('\n');

    // Portal to topbar's parent so the panel sits in the same stacking context as the topbar.
    var __styleHost = (topbar && topbar.parentElement) || document.body;
    __styleHost.appendChild(panel);
    wrapper._panel = panel;

    var themeSwitch = panel.querySelector('[data-style-panel="theme"]');
    var fontSelect = panel.querySelector('[data-style-panel="presentFont"]');
    var showLogoBtn = panel.querySelector('[data-style-panel="showLogo"]');
    var showFabBtn = panel.querySelector('[data-style-panel="showFab"]');

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

    var syncStylePanelCopy = function () {
      var title = panel.querySelector('[data-style-panel-title]');
      if (title) {
        title.textContent = getLabel('style');
      }

      panel.querySelectorAll('[data-style-panel-copy]').forEach(function (el) {
        var key = el.getAttribute('data-style-panel-copy');
        el.textContent = getStylePanelCopy(key);
      });

      themeSwitch.setAttribute('aria-label', getStylePanelCopy('themeLabel'));
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
      var currentTheme = getReadingTheme();
      var langKey = lang === 'zh' ? 'zh' : 'en';
      var showLogo = localStorage.getItem('present-show-logo') !== 'false';
      var showFab = localStorage.getItem('present-show-fab') !== 'false';

      syncStylePanelCopy();
      themeSwitch.classList.toggle('is-on', currentTheme === 'dark');
      themeSwitch.setAttribute('aria-checked', currentTheme === 'dark' ? 'true' : 'false');
      showLogoBtn.classList.toggle('is-on', showLogo);
      showLogoBtn.setAttribute('aria-pressed', showLogo ? 'true' : 'false');
      showFabBtn.classList.toggle('is-on', showFab);
      showFabBtn.setAttribute('aria-pressed', showFab ? 'true' : 'false');
      document.body.classList.toggle('present-hide-logo', !showLogo);
      document.body.classList.toggle('present-hide-fab', !showFab);
      populatePresentFontOptions(langKey);
    };

    themeSwitch.addEventListener('click', function () {
      var value = getReadingTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', value);
      syncPresentationSurface();
      syncPanelState();
    });

    fontSelect.addEventListener('change', function () {
      var langKey = getLang() === 'zh' ? 'zh' : 'en';
      localStorage.setItem('present-font:' + langKey, fontSelect.value);
      applyPresentFont(langKey, fontSelect.value);
    });

    showLogoBtn.addEventListener('click', function () {
      var on = !showLogoBtn.classList.contains('is-on');
      localStorage.setItem('present-show-logo', on ? 'true' : 'false');
      syncPanelState();
    });

    showFabBtn.addEventListener('click', function () {
      var on = !showFabBtn.classList.contains('is-on');
      localStorage.setItem('present-show-fab', on ? 'true' : 'false');
      syncPanelState();
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
      var url = buildShareUrl();
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
      var url = buildShareUrl();
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

  var closePresentationPager = function () {
    if (!presentationStatus || !presentationPagerToggle || !presentationPagerMenu) return;
    presentationStatus.classList.remove('is-page-menu-open');
    presentationPagerToggle.setAttribute('aria-expanded', 'false');
    presentationPagerMenu.setAttribute('aria-hidden', 'true');
  };

  var setPresentationPagerOpen = function (isOpen) {
    if (!presentationStatus || !presentationPagerToggle || !presentationPagerMenu) return;
    presentationStatus.classList.toggle('is-page-menu-open', isOpen);
    presentationPagerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    presentationPagerMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen && renderPresentationPageMenu) {
      renderPresentationPageMenu(state.index);
    }
  };

  var ensureFloating = function () {
    var floating = document.querySelector('.present-floating');
    var deck;
    var status;
    var counterButton;
    var pagerMenu;

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
    presentationStatus = status;

    counterButton = document.createElement('button');
    counterButton.className = 'present-counter-button';
    counterButton.type = 'button';
    counterButton.setAttribute('aria-haspopup', 'menu');
    counterButton.setAttribute('aria-expanded', 'false');
    counterButton.setAttribute('aria-controls', 'present-page-menu');
    counterButton.setAttribute('aria-label', getLabel('pagePicker'));
    counterButton.setAttribute('title', getLabel('pagePicker'));
    presentationPagerToggle = counterButton;

    presentationCounter = document.createElement('span');
    presentationCounter.className = 'present-counter';
    presentationCounter.setAttribute('data-present-counter', '');
    counterButton.appendChild(presentationCounter);
    status.appendChild(counterButton);

    pagerMenu = document.createElement('div');
    pagerMenu.id = 'present-page-menu';
    pagerMenu.className = 'present-page-menu';
    pagerMenu.setAttribute('aria-hidden', 'true');
    presentationPagerMenu = pagerMenu;
    status.appendChild(pagerMenu);

    counterButton.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!state.enabled) return;
      setPresentationPagerOpen(!status.classList.contains('is-page-menu-open'));
    });

    pagerMenu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
      if (status && !status.contains(e.target)) {
        closePresentationPager();
      }
    });

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
    var fab = document.querySelector('.assistant-fab');
    if (!fab) {
      if (!state.enabled) return null;
      fab = document.createElement('button');
      fab.className = 'assistant-fab';
      fab.setAttribute('data-presentation-owned', '');
      fab.setAttribute('aria-label', getLabel('autoPlay'));
      fab.innerHTML = NARRATION_SVG_PLAY;
      document.body.appendChild(fab);
    }
    presentationAutoPlay = fab;
    return fab;
  };

  var restoreAssistantFab = function () {
    if (!presentationAutoPlay) return;
    if (presentationAutoPlay.hasAttribute('data-presentation-owned') &&
        !document.querySelector('.assistant-dialog')) {
      presentationAutoPlay.remove();
      presentationAutoPlay = null;
      narrationCapsuleSettingsBtn = null;
      narrationCapsuleRecordBtn = null;
      narrationCapsuleChatBtn = null;
      return;
    }
    presentationAutoPlay.classList.remove('is-narration-mode');
    var originalHtml = presentationAutoPlay.getAttribute('data-original-html');
    presentationAutoPlay.innerHTML = originalHtml || NARRATION_SVG_CHAT;
    presentationAutoPlay.removeAttribute('data-original-html');
    presentationAutoPlay.setAttribute('aria-label', 'AI Assistant');
    presentationAutoPlay.style.removeProperty('--capsule-expanded-height');
    narrationCapsuleSettingsBtn = null;
    narrationCapsuleRecordBtn = null;
    narrationCapsuleChatBtn = null;
  };

  var narrationUiLoader = null;
  var ensureNarrationUI = function () {
    if (window.StudyRoomNarrationUI) return Promise.resolve(window.StudyRoomNarrationUI);
    if (narrationUiLoader) return narrationUiLoader;
    narrationUiLoader = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('article-narration-ui.js');
      s.async = true;
      s.onload = function () {
        if (window.StudyRoomNarrationUI) { resolve(window.StudyRoomNarrationUI); return; }
        reject(new Error('article-narration-ui.js loaded but unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load article-narration-ui.js.')); };
      document.head.appendChild(s);
    });
    return narrationUiLoader;
  };

  /** Build capsule structure inside the FAB (only in presentation mode) */
  var buildCapsuleStructure = function () {
    var fab = presentationAutoPlay;
    if (!fab) return;
    if (window.StudyRoomNarrationUI && window.StudyRoomNarrationUI.buildCapsule) {
      var built = window.StudyRoomNarrationUI.buildCapsule(fab, getLang, {
        settings: SVG_SETTINGS,
        record: SVG_RECORD,
        chat: NARRATION_SVG_CHAT
      });
      narrationCapsuleSettingsBtn = built.settingsBtn;
      narrationCapsuleRecordBtn = built.recordBtn;
      narrationCapsuleChatBtn = built.chatBtn;
      return fab;
    }
    ensureNarrationUI().then(function (ui) {
      if (!ui || !ui.buildCapsule || !state.enabled) return;
      var built = ui.buildCapsule(fab, getLang, {
        settings: SVG_SETTINGS,
        record: SVG_RECORD,
        chat: NARRATION_SVG_CHAT
      });
      narrationCapsuleSettingsBtn = built.settingsBtn;
      narrationCapsuleRecordBtn = built.recordBtn;
      narrationCapsuleChatBtn = built.chatBtn;
      wireCapsuleHandlers();
      updateAutoPlayButton();
    }).catch(function () {});
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
    try { arr = JSON.parse(localStorage.getItem('narration-clones')) || []; } catch (e) { arr = []; }
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
          try { localStorage.setItem('narration-clones', JSON.stringify(arr)); } catch (e) { console.debug('[presentation] legacy clone persist skipped:', e); }
          localStorage.removeItem('narration-clone-voice');
        }
      } catch (e) {
        console.debug('[presentation] legacy clone migration skipped:', e);
      }
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
      if (processor) { try { processor.disconnect(); } catch (e) { console.debug('[presentation] processor disconnect ignored:', e); } processor = null; }
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) { console.debug('[presentation] sourceNode disconnect ignored:', e); } sourceNode = null; }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      if (audioCtx) { try { audioCtx.close(); } catch (e) { console.debug('[presentation] audioCtx close ignored:', e); } audioCtx = null; }
    };

    var stopRecording = function () {
      if (!recording) return;
      recording = false;
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
      if (processor) { try { processor.disconnect(); } catch (e) { processor = null; } }
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) { sourceNode = null; } }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }

      // Concatenate chunks
      var totalLen = 0;
      chunks.forEach(function (c) { totalLen += c.length; });
      if (totalLen === 0 || !audioCtx) {
        showMsg(zh ? '没有捕获到音频，请重试。' : 'No audio captured. Please try again.', true);
        recordBtn.textContent = zh ? '● 开始录制' : '● Start';
        recordBtn.disabled = false;
        if (audioCtx) { try { audioCtx.close(); } catch (e) { console.debug('[presentation] empty capture audioCtx close ignored:', e); } audioCtx = null; }
        return;
      }
      var samples = new Float32Array(totalLen);
      var off = 0;
      chunks.forEach(function (c) { samples.set(c, off); off += c.length; });
      capturedSampleRate = audioCtx.sampleRate;
      capturedDuration = totalLen / capturedSampleRate;
      capturedWavBuffer = encodeWav(samples, capturedSampleRate);
      try { audioCtx.close(); } catch (e) { console.debug('[presentation] post-capture audioCtx close ignored:', e); }
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
    if (window.StudyRoomNarrationUI && window.StudyRoomNarrationUI.createSettingsPanel) {
      return window.StudyRoomNarrationUI.createSettingsPanel(getLang, {
        openVoiceCloneModal: openVoiceCloneModal,
        loadVoiceClones: loadVoiceClones,
        saveVoiceClones: saveVoiceClones,
        bindVoiceCloneSelect: bindVoiceCloneSelect,
        fillBrowserVoiceOptions: fillBrowserVoiceOptions,
        playBrowserVoicePreview: playBrowserVoicePreview,
        playVibeVoicePreview: playVibeVoicePreview,
        playRemoteTtsPreview: playRemoteTtsPreview
      });
    }
    ensureNarrationUI().then(function (ui) {
      if (ui && ui.createSettingsPanel) {
        ui.createSettingsPanel(getLang, {
          openVoiceCloneModal: openVoiceCloneModal,
          loadVoiceClones: loadVoiceClones,
          saveVoiceClones: saveVoiceClones,
          bindVoiceCloneSelect: bindVoiceCloneSelect,
          fillBrowserVoiceOptions: fillBrowserVoiceOptions,
          playBrowserVoicePreview: playBrowserVoicePreview,
          playVibeVoicePreview: playVibeVoicePreview,
          playRemoteTtsPreview: playRemoteTtsPreview
        });
      }
    }).catch(function () {});
    return null;
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
    var narrationSettings = {};
    try {
      narrationSettings = JSON.parse(localStorage.getItem('narration-settings')) || {};
    } catch (e) {
      narrationSettings = {};
    }
    if (narrationSettings.ttsProvider === 'vibevoice' ||
        narrationSettings.ttsEngine === 'moss-tts-nano' ||
        narrationSettings.ttsEngine === 'fish-s2') {
      return true;
    }
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
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
      syncPresentationSurface();
      setPresentationStep(snapshot.index);
      var activeStep = presentSteps[snapshot.index];
      if (activeStep) { activeStep.scrollTop = snapshot.stepScrollTop; syncStepOverflowState(activeStep); }
      updatePresentationLabels();
      return;
    }
    state.enabled = false;
    root.classList.remove('is-presentation-mode');
    syncPresentationSurface();
    restoreAssistantFab();
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
      var svgContainers = document.querySelectorAll('.slide-mockup, .demo-block, figure');
      svgContainers.forEach(function (container) {
        var svg = container.querySelector('svg');
        if (!svg) return;
        svgCaptures.push(new Promise(function (resolve) {
          var serializer = new XMLSerializer();
          var svgClone = svg.cloneNode(true);
          // Standalone SVG images cannot resolve the article's CSS classes or
          // inherited variables. Preserve the live diagram's labels and colors.
          var sourceNodes = [svg].concat(Array.from(svg.querySelectorAll('*')));
          var cloneNodes = [svgClone].concat(Array.from(svgClone.querySelectorAll('*')));
          var svgStyleProperties = [
            'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width',
            'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity',
            'font-family', 'font-size', 'font-weight', 'font-style',
            'letter-spacing', 'text-anchor', 'dominant-baseline', 'color'
          ];
          sourceNodes.forEach(function (node, index) {
            var computed = getComputedStyle(node);
            svgStyleProperties.forEach(function (property) {
              cloneNodes[index].style.setProperty(property, computed.getPropertyValue(property));
            });
          });
          var svgStr = serializer.serializeToString(svgClone);
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
            if (container.tagName !== 'FIGURE') {
              ctx.fillStyle = '#FCF6EE';
              ctx.fillRect(0, 0, cw, ch);
            }
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
        // Force lazy images to load before geometry capture.
        //
        // Steps are measured while off-screen, so any <img loading="lazy">
        // that never scrolled into view has not been fetched: currentSrc is
        // empty and the picture silently disappears from the deck. Clearing
        // the attribute and waiting for decode() makes the export
        // deterministic regardless of how far the reader scrolled.
        var lazyImgs = [];
        document.querySelectorAll('img[loading="lazy"], img:not([loading])').forEach(function (img) {
          if (img.complete && img.naturalWidth > 0) return;
          img.loading = 'eager';
          img.removeAttribute('loading');
          lazyImgs.push(
            (img.decode ? img.decode() : Promise.resolve())
              .catch(function () { /* broken image: renderStep reports it */ })
          );
        });
        return Promise.all(lazyImgs);
      }).then(function () {
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

  var triggerBlobDownload = function (blob, ext) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFileName(document.title || 'presentation') + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  };

  var exportPresentationDeck = function () {
    if (exportInProgress) return Promise.resolve();
    exportInProgress = true;
    updatePresentationLabels();
    return exportWithNativeObjects().then(function (blob) {
      triggerBlobDownload(blob, '.pptx');
    }).catch(function (error) {
      console.error(error);
      window.alert(getLabel('exportError'));
    }).then(function () {
      exportInProgress = false;
      updatePresentationLabels();
    });
  };

  var pdfExportInProgress = false;
  var emailShareLoader = null;

  var ensureEmailShare = function () {
    if (emailShareLoader) return emailShareLoader;
    emailShareLoader = new Promise(function (resolve, reject) {
      if (window.StudyRoomEmailShare) { resolve(window.StudyRoomEmailShare); return; }
      var s = document.createElement('script');
      s.src = resolvePresentationAssetUrl('article-email-share.js');
      s.async = true;
      s.onload = function () {
        if (window.StudyRoomEmailShare) { resolve(window.StudyRoomEmailShare); return; }
        reject(new Error('article-email-share.js loaded but unavailable.'));
      };
      s.onerror = function () { reject(new Error('Failed to load article-email-share.js.')); };
      document.head.appendChild(s);
    });
    return emailShareLoader;
  };

  var exportPdf = function () {
    if (pdfExportInProgress) return;
    pdfExportInProgress = true;
    updatePresentationLabels();

    expandAllAccordions();

    // Allow layout to settle then trigger browser print
    window.setTimeout(function () {
      window.print();
      restoreAccordionStates();
      pdfExportInProgress = false;
      updatePresentationLabels();
    }, 300);
  };

  var shareEmailNewsletter = function () {
    if (window.StudyRoomEmailShare) {
      window.StudyRoomEmailShare.share(getLang, buildShareUrl);
      return;
    }
    ensureEmailShare().then(function (mod) {
      mod.share(getLang, buildShareUrl);
    }).catch(function (err) {
      console.error(err);
    });
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

  var renderPresentationPageMenu = function (activeIndex) {
    var head;
    var list;

    if (!presentationPagerMenu) return;

    while (presentationPagerMenu.firstChild) {
      presentationPagerMenu.removeChild(presentationPagerMenu.firstChild);
    }

    head = document.createElement('div');
    head.className = 'present-page-menu-head';
    head.textContent = getLabel('pagePicker');
    presentationPagerMenu.appendChild(head);

    list = document.createElement('div');
    list.className = 'present-page-menu-list';
    list.setAttribute('role', 'menu');

    presentSteps.forEach(function (step, index) {
      var item = document.createElement('button');
      var number = document.createElement('span');
      var title = document.createElement('span');
      var pageNumber = String(index + 1);
      var pageTitle = deriveStepTitle(step, index) || getLabel('fallbackStep') + ' ' + String(index + 1);

      if (index + 1 < 10) {
        pageNumber = '0' + pageNumber;
      }

      item.className = 'present-page-menu-item';
      item.type = 'button';
      item.setAttribute('role', 'menuitem');
      item.setAttribute('aria-label', getLabel('pagePicker') + ' ' + String(index + 1) + ': ' + pageTitle);

      if (index === activeIndex) {
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'page');
      }

      number.className = 'present-page-number';
      number.textContent = pageNumber;
      item.appendChild(number);

      title.className = 'present-page-title';
      title.textContent = pageTitle;
      item.appendChild(title);

      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToStep(index);
        closePresentationPager();
        if (presentationPagerToggle) {
          presentationPagerToggle.focus();
        }
      });

      list.appendChild(item);
    });

    presentationPagerMenu.appendChild(list);
  };

  var getNestedStepCandidates = function (container) {
    var result = [];
    var candidates = container.querySelectorAll('[data-present-step]');
    var locales = ['zh', 'en'];

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
          var suffix = subs.length > 1 ? ' (' + (idx + 1) + '/' + subs.length + ')' : '';
          if (!sub.hasAttribute('data-step-title')) {
            sub.setAttribute('data-step-title', pTitle + suffix);
          }
          if (pLabel && !sub.hasAttribute('data-step-label')) {
            sub.setAttribute('data-step-label', pLabel);
          }
          locales.forEach(function (locale) {
            var localizedTitle = candidate.getAttribute('data-step-title-' + locale);
            var localizedLabel = candidate.getAttribute('data-step-label-' + locale);
            if (localizedTitle && !sub.hasAttribute('data-step-title-' + locale)) {
              sub.setAttribute('data-step-title-' + locale, localizedTitle + suffix);
            }
            if (localizedLabel && !sub.hasAttribute('data-step-label-' + locale)) {
              sub.setAttribute('data-step-label-' + locale, localizedLabel);
            }
          });
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
    // Skip ordinal badges (.subsection-number) and status chips (.event-tag) so the
    // slide title comes from the title span only.
    var span = toggle.querySelector('span:not(.subsection-number):not(.event-tag)');
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
      // Restore the reading-mode sizing contract as well as classes/ARIA.
      // Presentation activation (or a resize while presenting) may have
      // removed article-common.js's inline close-state ceiling.
      if (content) {
        content.style.maxHeight = entry.wasOpen ? 'none' : '0px';
        content.style.overflow = entry.wasOpen ? 'visible' : 'hidden';
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

      if (container.hasAttribute('data-present-exclude')) {
        return;
      }

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
      endSlide.setAttribute('data-step-title', '感谢收看');
      endSlide.setAttribute('data-step-title-en', 'Thank You');
      endSlide.setAttribute('data-step-label', '');
      autoAssignedSteps.push(endSlide);

      var endInner = document.createElement('div');
      endInner.className = 'present-end-inner';

      var endTitle = document.createElement('h2');
      endTitle.className = 'present-end-title';
      endTitle.textContent = getLang() === 'zh' ? '感谢收看' : 'Thank You';
      endInner.appendChild(endTitle);

      var showQR = false;
      try { showQR = JSON.parse(localStorage.getItem('narration-showEndQR') || 'false'); } catch (e) { showQR = false; }

      var endQrWrap = document.createElement('div');
      endQrWrap.className = 'present-end-qr';
      endQrWrap.style.display = showQR ? '' : 'none';
      var endQrImg = document.createElement('img');
      endQrImg.alt = 'QR Code';
      endQrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=' + encodeURIComponent(buildShareUrl());
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
    var endTitle = document.querySelector('.present-end-title');
    var endQrTip = document.querySelector('.present-end-qr-tip');

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

    if (presentationPagerToggle) {
      presentationPagerToggle.setAttribute('aria-label', getLabel('pagePicker'));
      presentationPagerToggle.setAttribute('title', getLabel('pagePicker'));
    }

    if (endTitle) {
      endTitle.textContent = getLang() === 'zh' ? '感谢收看' : 'Thank You';
    }
    if (endQrTip) {
      endQrTip.textContent = getLang() === 'zh' ? '扫码访问' : 'Scan to visit';
    }

    if (presentationStatus && presentationStatus.classList.contains('is-page-menu-open') && renderPresentationPageMenu) {
      renderPresentationPageMenu(state.index);
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
    if (!state.enabled || !activeStep) {
      return;
    }

    main.querySelectorAll('[data-accordion]').forEach(function (item) {
      // A slide may be the accordion, a substep inside it, or a wrapper
      // containing it. Do not expand bodies on overview slides or inside
      // other, inactive steps. Existing step CSS still owns visibility.
      var ownsActiveStep = item === activeStep || item.contains(activeStep);
      var belongsToActiveStep = !activeStep.hasAttribute('data-present-overview')
        && activeStep.contains(item)
        && item.closest('[data-present-step]') === activeStep;
      if (!ownsActiveStep && !belongsToActiveStep) return;

      var btn = item.querySelector('.subsection-toggle');
      var content = item.querySelector('.subsection-content');
      item.classList.add('is-open');
      if (btn) {
        btn.setAttribute('aria-expanded', 'true');
      }
      if (content) {
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = 'none';
        content.style.overflow = 'visible';
      }
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

    if (presentationPagerMenu) {
      renderPresentationPageMenu(safeIndex);
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

  var requestBrowserFullscreen = function () {
    var el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(function (e) { console.debug('[presentation] requestFullscreen skipped:', e); });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  var exitBrowserFullscreen = function () {
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl) return;
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(function (e) { console.debug('[presentation] exitFullscreen skipped:', e); });
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

  var runNarrationPrepOverlay = function (onReady, onFailed) {
    var zhMode = getLang() === 'zh';
    var ss = {};
    try { ss = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) { ss = {}; }
    var isLocalTTS = ss.ttsEngine === 'moss-tts-nano' || ss.ttsEngine === 'fish-s2';
    var steps = [{ id: 'script', label: zhMode ? '生成讲稿' : 'Generating script' }];
    if (isLocalTTS) steps.push({ id: 'audio', label: zhMode ? '合成语音' : 'Synthesizing audio' });

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
    prepOverlay.innerHTML = stepsHtml + '</div>';
    document.body.appendChild(prepOverlay);

    var setStepState = function (id, done) {
      var el = prepOverlay.querySelector('[data-step="' + id + '"]');
      if (!el) return;
      var icon = el.querySelector('.prep-step-icon');
      var status = el.querySelector('.prep-step-status');
      icon.className = 'prep-step-icon ' + (done ? 'prep-step-done' : 'prep-step-active');
      if (done) icon.textContent = '\u2713';
      status.textContent = done ? (zhMode ? '完成' : 'Done') : (zhMode ? '进行中…' : 'In progress…');
      status.className = 'prep-step-status ' + (done ? 'prep-status-done' : 'prep-status-active');
    };
    setStepState('script', false);

    return ensureNarrationController().then(function (ctrl) {
      return ctrl.pregenerate(presentSteps, 0, getLang, function (phase) {
        if (phase === 'script-done') {
          setStepState('script', true);
          if (isLocalTTS) setStepState('audio', false);
        } else if (phase === 'audio-done') {
          setStepState('audio', true);
        }
      });
    }).then(function () {
      steps.forEach(function (s) { setStepState(s.id, true); });
      setTimeout(function () {
        if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
        onReady();
      }, 300);
    }).catch(function () {
      if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
      if (onFailed) onFailed();
    });
  };

  /* ── Screen recording via getDisplayMedia ── */
  var isRecording = function () {
    return !!(mediaRecorder && mediaRecorder.state === 'recording');
  };

  var stopRecording = function () {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (recordingStream) {
      recordingStream.getTracks().forEach(function (track) { track.stop(); });
      recordingStream = null;
    }
    root.classList.remove('is-recording');
  };

  var mergeVideoWithAudioStream = function (videoStream, audioStream) {
    if (!audioStream) return videoStream;
    var combined = new MediaStream();
    videoStream.getVideoTracks().forEach(function (t) { combined.addTrack(t); });
    audioStream.getAudioTracks().forEach(function (t) { combined.addTrack(t); });
    return combined;
  };

  var toggleRecording = function () {
    if (isRecording()) {
      stopRecording();
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      window.alert(getLang() === 'zh' ? '当前浏览器不支持屏幕录制' : 'Screen recording is not supported in this browser');
      return;
    }

    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      systemAudio: 'include'
    }).then(function (stream) {
      if (!state.enabled) {
        enterPresentation();
      }
      setPresentationStep(0);

      runNarrationPrepOverlay(function () {
        showCountdown(function () {
          setTimeout(function () {
            recordingStream = stream;
            recordedChunks = [];

            var ss = {};
            try { ss = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) { ss = {}; }
            var recordStream = stream;

            if (ss.ttsProvider === 'vibevoice' && window.StudyRoomNarration) {
              recordStream = mergeVideoWithAudioStream(stream, window.StudyRoomNarration.getVibeAudioStream());
            } else if ((ss.ttsEngine === 'moss-tts-nano' || ss.ttsEngine === 'fish-s2') && window.StudyRoomNarration && window.StudyRoomNarration.getTtsAudioStream) {
              recordStream = mergeVideoWithAudioStream(stream, window.StudyRoomNarration.getTtsAudioStream());
            }

            var mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].filter(function (m) {
              return MediaRecorder.isTypeSupported(m);
            })[0] || 'video/webm';

            mediaRecorder = new MediaRecorder(recordStream, { mimeType: mimeType });
            mediaRecorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = function () {
              triggerBlobDownload(new Blob(recordedChunks, { type: mimeType }), '.webm');
              recordedChunks = [];
              if (presentationTip) {
                var origTip = presentationTip.textContent;
                presentationTip.textContent = getLabel('recordSaved');
                setTimeout(function () { presentationTip.textContent = origTip; }, 3000);
              }
            };

            var firstVideoTrack = stream.getVideoTracks()[0];
            if (firstVideoTrack) {
              firstVideoTrack.addEventListener('ended', function () {
                if (isRecording()) stopRecording();
              });
            }

            mediaRecorder.start(1000);
            root.classList.add('is-recording');
            narrationStartTime = Date.now();
            narrationController.start(presentSteps, 0, getLang);
          }, 1000);
        });
      }, function () {
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
        var sp = ensureNarrationSettingsPanel();
        if (sp) {
          setTimeout(function () { sp.classList.toggle('is-open'); }, 0);
        } else {
          ensureNarrationUI().then(function () {
            var loadedSp = ensureNarrationSettingsPanel();
            if (loadedSp) setTimeout(function () { loadedSp.classList.toggle('is-open'); }, 0);
          }).catch(function () {});
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
    syncPresentationSurface();

    // Sync narration settings panel from localStorage (launch panel writes there)
    var settingsPanel = document.querySelector('.narration-settings-panel');
    if (settingsPanel && settingsPanel._refreshFromStorage) {
      settingsPanel._refreshFromStorage();
    }

    // Take over the FAB for narration
    ensureNarrationFab();
    if (presentationAutoPlay && hasNarrationSupport()) {
      ensureNarrationUI().catch(function () {});
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
    var mainArea = presentationAutoPlay ? presentationAutoPlay.querySelector('.narration-capsule-main') : null;
    if (mainArea) mainArea.innerHTML = NARRATION_SVG_GENERATING;

    runNarrationPrepOverlay(function () {
      if (mainArea) mainArea.innerHTML = NARRATION_SVG_PLAY;
      showCountdown(function () {
        narrationStartTime = Date.now();
        narrationController.start(presentSteps, state.index, getLang);
      });
    }, function () {
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

    closePresentationPager();
    stopNarration();
    if (isRecording()) stopRecording();

    restoreAssistantFab();

    state.enabled = false;
    root.classList.remove('is-presentation-mode');
    syncPresentationSurface();

    restoreAccordionStates();
    setPresentationStep(state.index);
    updatePresentationLabels();
    exitBrowserFullscreen();

    if (activeStep) {
      activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  var goToStep = function (index) {
    if (!state.enabled) return;
    if (index < 0 || index >= presentSteps.length) return;
    setPresentationStep(index);
    if (narrationController && narrationController.isActive()) {
      narrationController.syncToSlide(state.index);
    }
  };

  var goToPreviousStep = function () {
    if (!state.enabled || state.index <= 0) return;
    goToStep(state.index - 1);
  };

  var goToNextStep = function () {
    if (!state.enabled || state.index >= presentSteps.length - 1) return;
    goToStep(state.index + 1);
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
  styleToggle = ensureStyleToggle();
  var langToggleBtn = ensureLangToggle();
  buildLaunchPanel();
  buildStylePanel();
  shareWrapper = ensureShareDropdown();
  presentationFloating = ensureFloating();
  presentationExit = presentationFloating.querySelector('[data-present-exit]');
  presentationPrev = presentationFloating.querySelector('[data-present-prev]');
  presentationNext = presentationFloating.querySelector('[data-present-next]');
  presentationDeckLabel = presentationFloating.querySelector('[data-present-deck-label]');
  presentationDeckTitle = presentationFloating.querySelector('[data-present-deck-title]');
  presentationStatus = presentationFloating.querySelector('.present-status');
  presentationPagerToggle = presentationFloating.querySelector('.present-counter-button');
  presentationPagerMenu = presentationFloating.querySelector('.present-page-menu');
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
      if (wrapper._panel && wrapper._panel._syncCopy) wrapper._panel._syncCopy();
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

  langToggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var cur = getLang();
    var next = cur === 'zh' ? 'en' : 'zh';
    applyLanguageToDocument(next);
    updatePresentationLabels();
    var labelSpan = langToggleBtn.querySelector('.topbar-lang-label');
    if (labelSpan) labelSpan.textContent = next === 'zh' ? 'EN' : '中';
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
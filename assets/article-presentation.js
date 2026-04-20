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

    // Wrap toggle in a launch-wrapper for hover dropdown
    var launchWrapper = document.createElement('div');
    launchWrapper.className = 'present-launch-wrapper';
    launchWrapper.appendChild(toggle);
    topbarActions.appendChild(launchWrapper);

    return toggle;
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
      '<div class="launch-hero">',
      '  <button type="button" class="launch-play-btn" aria-label="' + (zhMode ? '开始演示' : 'Start Presentation') + '">',
      '    <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10 8l5 3-5 3V8z" fill="currentColor"/></svg>',
      '  </button>',
      '  <span class="launch-hero-label">' + (zhMode ? '开始演示' : 'Start Presentation') + '</span>',
      '</div>',
      '<div class="launch-divider-line"></div>',
      '<div class="launch-row">',
      '  <span class="launch-row-label">' + (zhMode ? '语言' : 'Language') + '</span>',
      '  <select class="launch-select" data-launch="lang">',
      '    <option value="auto">' + (zhMode ? '跟随页面' : 'Follow page') + '</option>',
      '    <option value="zh">中文</option>',
      '    <option value="en">English</option>',
      '  </select>',
      '</div>',
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
      '</div>'
    ].join('\n');

    wrapper.appendChild(panel);

    // DOM references
    var langSelect = panel.querySelector('[data-launch="lang"]');
    var autoNarrateBtn = panel.querySelector('[data-launch="autoNarrate"]');
    var voiceSection = panel.querySelector('.launch-voice-settings');
    var ttsSelect = panel.querySelector('[data-launch="ttsProvider"]');
    var voiceSelect = panel.querySelector('[data-launch="voiceName"]');
    var voiceTestBtn = panel.querySelector('.launch-voice-test');
    var rateInput = panel.querySelector('[data-launch="rate"]');
    var rateVal = panel.querySelector('.launch-rate-val');
    var mossRows = panel.querySelectorAll('.launch-moss-row');
    var mossTtsVoiceSelect = panel.querySelector('[data-launch="mossTtsVoice"]');

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
    if (savedSettings.lang) langSelect.value = savedSettings.lang;
    if (savedSettings.ttsProvider) ttsSelect.value = savedSettings.ttsProvider;
    if (savedSettings.rate) { rateInput.value = savedSettings.rate; rateVal.textContent = parseFloat(savedSettings.rate).toFixed(2); }
    if (savedSettings.mossTtsVoice) mossTtsVoiceSelect.value = savedSettings.mossTtsVoice;
    if (autoNarrate) autoNarrateBtn.classList.add('is-on');

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
      // Show/hide MOSS rows
      mossRows.forEach(function (row) { row.style.display = isMoss ? '' : 'none'; });
      // Show/hide voice select row (hide for MOSS since it uses demo ID)
      var voiceRow = voiceSelect.closest('.launch-row');
      if (voiceRow) voiceRow.style.display = isMoss ? 'none' : '';
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
      // Update tracked selections
      if (isVibe) {
        lastVibeVoice = voiceSelect.value;
      } else if (!isMoss) {
        lastBrowserVoice = voiceSelect.value;
      }

      var s = {
        lang: langSelect.value === 'auto' ? '' : langSelect.value,
        rate: parseFloat(rateInput.value),
        voiceName: isVibe ? lastBrowserVoice : voiceSelect.value,
        vibeVoice: isVibe ? voiceSelect.value : lastVibeVoice,
        ttsProvider: ttsSelect.value,
        ttsEngine: isMoss ? 'moss-tts-nano' : '',
        mossTtsVoice: mossTtsVoiceSelect.value
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
      // Switch article display language
      var selectedLang = langSelect.value === 'auto' ? getLang() : langSelect.value;
      localStorage.setItem('lang', selectedLang);
      root.setAttribute('lang', selectedLang === 'zh' ? 'zh-CN' : 'en');
      document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
        var val = el.getAttribute('data-' + selectedLang);
        if (val !== null) el.innerHTML = val;
      });
      // Re-populate voices for new language (only relevant for browser voices)
      if (ttsSelect.value !== 'vibevoice') {
        lastBrowserVoice = '';
        syncVoiceList();
      }
      saveLaunchSettings();
    });

    ttsSelect.addEventListener('change', function () {
      syncVoiceList();
      saveLaunchSettings();
    });

    mossTtsVoiceSelect.addEventListener('change', saveLaunchSettings);

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
        // Trigger the same flow as the original toggle click
        presentationToggle.click();
      });
    }
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
      '  </label>',
      '</div>',
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
      '</div>'
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
    var browserVoiceRow = panel.querySelector('.narration-voice-row:not(.narration-vibe-row)');

    if (saved.lang) langSelect.value = saved.lang;
    if (saved.rate) { rateInput.value = saved.rate; rateValue.textContent = saved.rate; }
    if (saved.ttsProvider) ttsProviderSelect.value = saved.ttsProvider;
    if (saved.vibeVoice) vibeVoiceSelect.value = saved.vibeVoice;
    if (saved.mossTtsVoice) mossDemoIdInput.value = saved.mossTtsVoice;

    // Show/hide provider-specific rows based on TTS provider selection
    var syncProviderVisibility = function () {
      var provider = ttsProviderSelect.value;
      browserVoiceRow.style.display = provider === 'browser' ? '' : 'none';
      vibeRow.style.display = provider === 'vibevoice' ? '' : 'none';
      mossSettingsDiv.style.display = provider === 'moss-tts-nano' ? '' : 'none';
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
        ttsEngine: ttsProviderSelect.value === 'moss-tts-nano' ? 'moss-tts-nano' : '',
        mossTtsVoice: mossDemoIdInput.value,
        vibeVoice: vibeVoiceSelect.value
      };
      localStorage.setItem(globalKey, JSON.stringify(s));
      if (articleKey) {
        localStorage.setItem(articleKey, JSON.stringify(s));
      }
    };

    langSelect.addEventListener('change', saveSettings);
    ttsProviderSelect.addEventListener('change', saveSettings);
    vibeVoiceSelect.addEventListener('change', saveSettings);
    mossDemoIdInput.addEventListener('change', saveSettings);
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

      var endQrWrap = document.createElement('div');
      endQrWrap.className = 'present-end-qr';
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

    presentationToggle.setAttribute('aria-label', state.enabled ? getLabel('exit') : getLabel('enter'));
    presentationToggle.setAttribute('aria-pressed', String(state.enabled));
    presentationToggle.classList.toggle('is-active', state.enabled);

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
    // Position subtitle symmetrically: left side clears brand logo, right mirrors
    var logo = document.querySelector('.present-brand-logo');
    if (logo) {
      var logoRect = logo.getBoundingClientRect();
      var leftDist = logoRect.right + 16; // logo right edge + 16px gap
      narrationSubtitle.style.left = leftDist + 'px';
      narrationSubtitle.style.right = leftDist + 'px';
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
      var rIsLocal = rss.ttsEngine === 'moss-tts-nano';
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

            // Qwen3-TTS (MLX) — use Web Audio capture stream
            if (ss.ttsEngine === 'moss-tts-nano' && window.StudyRoomNarration && window.StudyRoomNarration.getTtsAudioStream) {
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
    var isLocalTTS = ss.ttsEngine === 'moss-tts-nano';

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

  presentationToggle.addEventListener('click', function () {
    if (state.enabled) {
      exitPresentation();
      return;
    }

    enterPresentation();

    // Auto-start narration with countdown if enabled
    if (hasNarrationSupport() && localStorage.getItem('narration-autostart') === 'true') {
      startAutoNarration();
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
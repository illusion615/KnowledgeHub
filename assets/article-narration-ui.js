// ======================================
// article-narration-ui.js — Narration settings panel + FAB capsule
// ======================================
// Lazy-loaded by article-presentation.js when presentation mode is entered
// Exposes: window.StudyRoomNarrationUI

(function () {
  'use strict';

  window.StudyRoomNarrationUI = {
    /**
     * Build capsule structure inside the FAB (only in presentation mode).
     * @param {HTMLElement} fab - the assistant-fab element
     * @param {Function} getLang - returns 'zh' or 'en'
     * @param {Object} svgs - SVG constants { play, chat, settings, record }
     * @returns {Object} { settingsBtn, recordBtn, chatBtn }
     */
    buildCapsule: function (fab, getLang, svgs) {
      if (!fab) return {};
      if (fab.querySelector('.narration-capsule-actions')) {
        return {
          settingsBtn: fab.querySelector('.narration-capsule-btn[aria-label]'),
          recordBtn: fab.querySelectorAll('.narration-capsule-btn')[1],
          chatBtn: fab.querySelectorAll('.narration-capsule-btn')[2]
        };
      }

      // Save original HTML to restore on exit
      fab.setAttribute('data-original-html', fab.innerHTML);

      var actions = document.createElement('div');
      actions.className = 'narration-capsule-actions';

      // Settings button
      var settingsBtn = document.createElement('button');
      settingsBtn.className = 'narration-capsule-btn';
      settingsBtn.type = 'button';
      settingsBtn.setAttribute('aria-label', getLang() === 'zh' ? '讲解设置' : 'Settings');
      settingsBtn.innerHTML = svgs.settings;
      actions.appendChild(settingsBtn);

      // Record button
      var recordBtn = document.createElement('button');
      recordBtn.className = 'narration-capsule-btn';
      recordBtn.type = 'button';
      recordBtn.setAttribute('aria-label', getLang() === 'zh' ? '录制视频' : 'Record');
      recordBtn.innerHTML = svgs.record;
      actions.appendChild(recordBtn);

      // Chat button — only if assistant dialog exists (LLM configured)
      var hasAssistant = !!document.querySelector('.assistant-dialog');
      var chatBtn = document.createElement('button');
      chatBtn.className = 'narration-capsule-btn';
      chatBtn.type = 'button';
      chatBtn.setAttribute('aria-label', getLang() === 'zh' ? 'AI 助手' : 'AI Chat');
      chatBtn.innerHTML = svgs.chat;
      if (!hasAssistant) {
        chatBtn.style.display = 'none';
      }
      actions.appendChild(chatBtn);

      var divider = document.createElement('div');
      divider.className = 'narration-capsule-divider';
      actions.appendChild(divider);

      var mainArea = document.createElement('div');
      mainArea.className = 'narration-capsule-main';

      fab.innerHTML = '';
      fab.appendChild(actions);
      fab.appendChild(mainArea);

      // Adjust expanded height based on visible buttons
      var visibleBtnCount = hasAssistant ? 3 : 2;
      fab.style.setProperty('--capsule-expanded-height', (visibleBtnCount * 44 + 1 + 52) + 'px');

      return {
        settingsBtn: settingsBtn,
        recordBtn: recordBtn,
        chatBtn: chatBtn
      };
    },

    /**
     * Create the narration settings panel.
     * @param {Function} getLang - returns 'zh' or 'en'
     * @returns {HTMLElement} the settings panel element
     */
    createSettingsPanel: function (getLang) {
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
        '</div>'
      ].join('\n');

      document.body.appendChild(panel);

      // Settings keys
      var articleSlug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
      var globalKey = 'narration-settings';
      var articleKey = articleSlug ? ('narration-settings:' + articleSlug) : '';

      // Load saved settings
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem(globalKey)) || {}; } catch (e) {}
      if (articleKey) {
        try {
          var articleSaved = JSON.parse(localStorage.getItem(articleKey));
          if (articleSaved) {
            Object.keys(articleSaved).forEach(function (k) { if (articleSaved[k] !== undefined && articleSaved[k] !== '') saved[k] = articleSaved[k]; });
          }
        } catch (e) {}
      }

      var langSelect = panel.querySelector('[data-narration-setting="lang"]');
      var rateInput = panel.querySelector('[data-narration-setting="rate"]');
      var rateValue = panel.querySelector('.narration-rate-value');
      var voiceSelect = panel.querySelector('[data-narration-setting="voiceName"]');
      var voiceTestBtn = panel.querySelector('.narration-voice-test');

      if (saved.lang) langSelect.value = saved.lang;
      if (saved.rate) { rateInput.value = saved.rate; rateValue.textContent = saved.rate; }

      // Populate voices from browser Speech API
      var populateVoices = function () {
        if (!window.speechSynthesis) return;
        var allVoices = window.speechSynthesis.getVoices();
        if (!allVoices || !allVoices.length) return;

        var filterLang = langSelect.value;
        if (filterLang === 'auto') filterLang = getLang();
        var langPrefix = (filterLang === 'zh') ? 'zh' : 'en';

        var currentVal = voiceSelect.value;
        while (voiceSelect.options.length > 1) {
          voiceSelect.removeChild(voiceSelect.lastChild);
        }

        var dialectMap = {
          'zh-CN': '普通话', 'zh-TW': '台湾', 'zh-HK': '粤语',
          'en-US': 'US', 'en-GB': 'UK', 'en-AU': 'AU', 'en-IN': 'IN', 'en-IE': 'IE', 'en-ZA': 'ZA'
        };

        allVoices.forEach(function (v) {
          if (v.lang.indexOf(langPrefix) !== 0) return;
          var opt = document.createElement('option');
          opt.value = v.name;
          var dialectLabel = dialectMap[v.lang] || v.lang;
          var coreName = v.name.replace(/\s*\(.*\)\s*$/, '');
          opt.textContent = coreName + ' · ' + dialectLabel;
          opt.title = v.name + ' (' + v.lang + ')';
          voiceSelect.appendChild(opt);
        });

        if (currentVal) voiceSelect.value = currentVal;
        if (saved.voiceName && !currentVal) voiceSelect.value = saved.voiceName;
        panel.removeAttribute('data-voices-pending');
      };

      populateVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
      }

      langSelect.addEventListener('change', function () {
        voiceSelect.value = '';
        populateVoices();
      });

      var saveSettings = function () {
        var s = {
          lang: langSelect.value === 'auto' ? '' : langSelect.value,
          rate: parseFloat(rateInput.value),
          voiceName: voiceSelect.value
        };
        localStorage.setItem(globalKey, JSON.stringify(s));
        if (articleKey) {
          localStorage.setItem(articleKey, JSON.stringify(s));
        }
      };

      langSelect.addEventListener('change', saveSettings);
      rateInput.addEventListener('input', function () {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(2);
        saveSettings();
      });
      voiceSelect.addEventListener('change', saveSettings);

      // Voice test/preview
      voiceTestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        var testText = (getLang() === 'zh' || langSelect.value === 'zh')
          ? '这是一段语音测试，你可以听到当前选择的语音效果。'
          : 'This is a voice preview. You can hear how the selected voice sounds.';

        var utt = new SpeechSynthesisUtterance(testText);
        var filterLang = langSelect.value;
        if (filterLang === 'auto') filterLang = getLang();
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

      panel.querySelector('.narration-settings-close').addEventListener('click', function () {
        panel.classList.remove('is-open');
      });

      document.addEventListener('click', function (e) {
        if (panel.classList.contains('is-open') && !panel.contains(e.target) && !e.target.closest('.present-settings') && !e.target.closest('.narration-capsule-btn')) {
          panel.classList.remove('is-open');
        }
      });

      return panel;
    }
  };
})();

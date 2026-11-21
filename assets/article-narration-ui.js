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
     */
    buildCapsule: function (fab, getLang, svgs) {
      if (!fab) return {};
      if (fab.querySelector('.narration-capsule-actions')) {
        var btns = fab.querySelectorAll('.narration-capsule-btn');
        return {
          settingsBtn: btns[0] || null,
          recordBtn: btns[1] || null,
          chatBtn: btns[2] || null
        };
      }

      fab.setAttribute('data-original-html', fab.innerHTML);

      var actions = document.createElement('div');
      actions.className = 'narration-capsule-actions';
      var hasAssistant = !!document.querySelector('.assistant-dialog');
      var makeBtn = function (labelZh, labelEn, svg, hidden) {
        var btn = document.createElement('button');
        btn.className = 'narration-capsule-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', getLang() === 'zh' ? labelZh : labelEn);
        btn.innerHTML = svg;
        if (hidden) btn.style.display = 'none';
        actions.appendChild(btn);
        return btn;
      };

      var settingsBtn = makeBtn('讲解设置', 'Settings', svgs.settings, false);
      var recordBtn = makeBtn('录制视频', 'Record', svgs.record, false);
      var chatBtn = makeBtn('AI 助手', 'AI Chat', svgs.chat, !hasAssistant);

      var divider = document.createElement('div');
      divider.className = 'narration-capsule-divider';
      actions.appendChild(divider);

      var mainArea = document.createElement('div');
      mainArea.className = 'narration-capsule-main';

      fab.innerHTML = '';
      fab.appendChild(actions);
      fab.appendChild(mainArea);
      fab.style.setProperty('--capsule-expanded-height', ((hasAssistant ? 3 : 2) * 44 + 1 + 52) + 'px');

      return {
        settingsBtn: settingsBtn,
        recordBtn: recordBtn,
        chatBtn: chatBtn
      };
    },

    /**
     * Create the narration settings panel.
     */
    createSettingsPanel: function (getLang, hooks) {
      var existing = document.querySelector('.narration-settings-panel');
      if (existing) return existing;
      var h = hooks || {};
      var zh = getLang() === 'zh';
      var speakerIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

      var panel = document.createElement('div');
      panel.className = 'narration-settings-panel';
      panel.innerHTML = [
        '<div class="narration-settings-header">',
        '  <strong>' + (zh ? '讲解设置' : 'Narration Settings') + '</strong>',
        '  <button class="narration-settings-close" type="button" aria-label="Close">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>',
        '</div>',
        '<label class="narration-setting-row">',
        '  <span>' + (zh ? '语言' : 'Language') + '</span>',
        '  <select class="narration-select" data-narration-setting="lang">',
        '    <option value="auto">' + (zh ? '跟随页面' : 'Follow page') + '</option>',
        '    <option value="zh">中文</option>',
        '    <option value="en">English</option>',
        '  </select>',
        '</label>',
        '<label class="narration-setting-row">',
        '  <span>' + (zh ? '语速' : 'Speed') + '</span>',
        '  <input type="range" class="narration-range" data-narration-setting="rate" min="0.5" max="1.5" step="0.1" value="0.92" />',
        '  <span class="narration-rate-value">0.92</span>',
        '</label>',
        '<div class="narration-setting-row narration-voice-row">',
        '  <span>' + (zh ? '语音' : 'Voice') + '</span>',
        '  <select class="narration-select narration-voice-select" data-narration-setting="voiceName">',
        '    <option value="">' + (zh ? '自动' : 'Auto') + '</option>',
        '  </select>',
        '  <button class="narration-voice-test" type="button" aria-label="' + (zh ? '试听' : 'Preview') + '" title="' + (zh ? '试听' : 'Preview') + '">' + speakerIcon + '</button>',
        '</div>',
        '<label class="narration-setting-row">',
        '  <span>TTS</span>',
        '  <select class="narration-select" data-narration-setting="ttsProvider">',
        '    <option value="browser">' + (zh ? '浏览器内置' : 'Browser') + '</option>',
        '    <option value="vibevoice">VibeVoice (EN)</option>',
        '    <option value="moss-tts-nano">Qwen3-TTS (MLX)</option>',
        '    <option value="fish-s2">Fish Audio S2 (MLX)</option>',
        '  </select>',
        '</label>',
        '<div class="narration-moss-settings" style="display:none;">',
        '  <label class="narration-setting-row">',
        '    <span>' + (zh ? '音色' : 'Voice') + '</span>',
        '    <select class="narration-select" data-narration-setting="mossTtsVoice">',
        '      <option value="vivian">vivian (' + (zh ? '活泼女声' : 'Female ZH') + ')</option>',
        '      <option value="serena">serena (' + (zh ? '温柔女声' : 'Female ZH') + ')</option>',
        '      <option value="uncle_fu">uncle_fu (' + (zh ? '成熟男声' : 'Male ZH') + ')</option>',
        '      <option value="dylan">dylan (' + (zh ? '京腔男声' : 'Male Beijing') + ')</option>',
        '      <option value="ryan">ryan (' + (zh ? '英文男声' : 'Male EN') + ')</option>',
        '      <option value="aiden">aiden (' + (zh ? '美式男声' : 'Male US') + ')</option>',
        '      <option value="ono_anna">ono_anna (' + (zh ? '日语女声' : 'Female JA') + ')</option>',
        '      <option value="sohee">sohee (' + (zh ? '韩语女声' : 'Female KO') + ')</option>',
        '      <option value="eric">eric (' + (zh ? '英文男声' : 'Male EN') + ')</option>',
        '    </select>',
        '    <button class="narration-voice-test narration-moss-voice-test" type="button" aria-label="' + (zh ? '试听' : 'Preview') + '" title="' + (zh ? '试听' : 'Preview') + '">' + speakerIcon + '</button>',
        '    <button class="narration-voice-test narration-clone-record-btn" type="button" title="' + (zh ? '录制新声音' : 'Record new clone') + '" aria-label="' + (zh ? '录制新声音' : 'Record new clone') + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
          '</button>',
        '    <button class="narration-voice-test narration-clone-delete-btn" type="button" style="display:none;" title="' + (zh ? '删除当前克隆声音' : 'Delete current clone') + '" aria-label="' + (zh ? '删除' : 'Delete') + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
          '</button>',
        '  </label>',
        '  <label class="narration-setting-row narration-clone-quality-row" style="display:none;">',
        '    <span>' + (zh ? '克隆质量' : 'Clone quality') + '</span>',
        '    <select class="narration-select" data-narration-setting="mossCloneQuality">',
        '      <option value="8bit">' + (zh ? '快速（8bit，推荐）' : 'Fast (8bit, recommended)') + '</option>',
        '      <option value="bf16">' + (zh ? '高质（bf16，较慢）' : 'High quality (bf16, slower)') + '</option>',
        '    </select>',
        '  </label>',
        '</div>',
        '<div class="narration-fish-settings" style="display:none;">',
        '  <label class="narration-setting-row">',
        '    <span>' + (zh ? '音色' : 'Voice') + '</span>',
        '    <input type="text" class="narration-select" data-narration-setting="fishTtsVoice" placeholder="' + (zh ? '留空 = 默认音色' : 'blank = default voice') + '" />',
        '  </label>',
        '  <div class="narration-setting-hint">' + (zh ? '支持 [whisper]、[laughing] 等情感标签。' : 'Inline tags like [whisper], [laughing] are supported.') + '</div>',
        '</div>',
        '<label class="narration-setting-row narration-tts-emotion-row" style="display:none;">',
        '  <span>' + (zh ? '情绪' : 'Emotion') + '</span>',
        '  <select class="narration-select" data-narration-setting="ttsEmotion">',
        '    <option value="default">' + (zh ? '默认讲解' : 'Default narrator') + '</option>',
        '    <option value="passionate">' + (zh ? '充满激情' : 'Passionate') + '</option>',
        '    <option value="inspiring">' + (zh ? '激励鼓舞' : 'Inspiring') + '</option>',
        '    <option value="warm">' + (zh ? '温暖亲切' : 'Warm') + '</option>',
        '    <option value="cheerful">' + (zh ? '轻松愉快' : 'Cheerful') + '</option>',
        '    <option value="serious">' + (zh ? '严肃权威' : 'Serious') + '</option>',
        '    <option value="storytelling">' + (zh ? '娓娓道来' : 'Storytelling') + '</option>',
        '    <option value="urgent">' + (zh ? '紧迫急切' : 'Urgent') + '</option>',
        '  </select>',
        '</label>',
        '<div class="narration-setting-row narration-voice-row narration-vibe-row">',
        '  <span>' + (zh ? 'AI语音' : 'AI Voice') + '</span>',
        '  <select class="narration-select" data-narration-setting="vibeVoice">',
        '    <option value="en-Emma_woman">Emma (Woman)</option>',
        '    <option value="en-Grace_woman">Grace (Woman)</option>',
        '    <option value="en-Carter_man">Carter (Man)</option>',
        '    <option value="en-Davis_man">Davis (Man)</option>',
        '    <option value="en-Frank_man">Frank (Man)</option>',
        '    <option value="en-Mike_man">Mike (Man)</option>',
        '  </select>',
        '  <button class="narration-voice-test narration-vibe-test" type="button" aria-label="' + (zh ? '试听' : 'Preview') + '" title="' + (zh ? '试听' : 'Preview') + '">' + speakerIcon + '</button>',
        '</div>',
        '<label class="narration-setting-row">',
        '  <span>' + (zh ? '结尾二维码' : 'End QR Code') + '</span>',
        '  <input type="checkbox" class="narration-checkbox" data-narration-setting="showEndQR" />',
        '</label>',
        '<div class="narration-setting-divider"></div>',
        '<label class="narration-setting-row">',
        '  <span>' + (zh ? '录制比例' : 'Record Ratio') + '</span>',
        '  <select class="narration-select" data-narration-setting="recordRatio">',
        '    <option value="16:9">' + (zh ? '横屏 16:9' : 'Landscape 16:9') + '</option>',
        '    <option value="9:16">' + (zh ? '竖屏 9:16（手机）' : 'Portrait 9:16') + '</option>',
        '    <option value="1:1">' + (zh ? '正方 1:1（社交媒体）' : 'Square 1:1') + '</option>',
        '  </select>',
        '</label>'
      ].join('\n');

      document.body.appendChild(panel);

      var articleSlug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
      var globalKey = 'narration-settings';
      var articleKey = articleSlug ? ('narration-settings:' + articleSlug) : '';

      var readMergedSettings = function () {
        var merged = {};
        try { merged = JSON.parse(localStorage.getItem(globalKey)) || {}; } catch (e) {}
        if (articleKey) {
          try {
            var art = JSON.parse(localStorage.getItem(articleKey));
            if (art) {
              Object.keys(art).forEach(function (k) {
                if (art[k] !== undefined && art[k] !== '') merged[k] = art[k];
              });
            }
          } catch (e) {}
        }
        return merged;
      };

      var saved = readMergedSettings();
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
      var cloneQualitySelect = panel.querySelector('[data-narration-setting="mossCloneQuality"]');
      var emotionSelectIn = panel.querySelector('[data-narration-setting="ttsEmotion"]');
      var emotionRowIn = panel.querySelector('.narration-tts-emotion-row');

      if (saved.lang) langSelect.value = saved.lang;
      if (saved.rate) { rateInput.value = saved.rate; rateValue.textContent = saved.rate; }
      if (saved.ttsProvider || saved.ttsEngine) ttsProviderSelect.value = saved.ttsProvider || saved.ttsEngine;
      if (saved.vibeVoice) vibeVoiceSelect.value = saved.vibeVoice;
      if (saved.mossTtsVoice) mossDemoIdInput.value = saved.mossTtsVoice;
      if (saved.fishTtsVoice && fishVoiceInput) fishVoiceInput.value = saved.fishTtsVoice;
      if (cloneQualitySelect && saved.mossCloneQuality) cloneQualitySelect.value = saved.mossCloneQuality;

      var syncProviderVisibility = function () {
        var provider = ttsProviderSelect.value;
        browserVoiceRow.style.display = provider === 'browser' ? '' : 'none';
        vibeRow.style.display = provider === 'vibevoice' ? '' : 'none';
        mossSettingsDiv.style.display = provider === 'moss-tts-nano' ? '' : 'none';
        if (fishSettingsDiv) fishSettingsDiv.style.display = provider === 'fish-s2' ? '' : 'none';
        if (emotionRowIn) emotionRowIn.style.display = (provider === 'moss-tts-nano' || provider === 'fish-s2') ? '' : 'none';
      };
      syncProviderVisibility();

      var populateVoices = function () {
        var filterLang = langSelect.value === 'auto' ? getLang() : langSelect.value;
        if (h.fillBrowserVoiceOptions && h.fillBrowserVoiceOptions(voiceSelect, filterLang, null, voiceSelect.value, saved.voiceName)) {
          panel.removeAttribute('data-voices-pending');
        }
      };

      populateVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
      }

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
        if (articleKey) localStorage.setItem(articleKey, JSON.stringify(s));
      };

      langSelect.addEventListener('change', function () {
        voiceSelect.value = '';
        populateVoices();
        saveSettings();
      });
      ttsProviderSelect.addEventListener('change', function () {
        syncProviderVisibility();
        saveSettings();
      });
      vibeVoiceSelect.addEventListener('change', saveSettings);
      if (emotionSelectIn) emotionSelectIn.addEventListener('change', saveSettings);
      if (fishVoiceInput) {
        fishVoiceInput.addEventListener('input', saveSettings);
        fishVoiceInput.addEventListener('change', saveSettings);
      }

      if (h.bindVoiceCloneSelect) {
        h.bindVoiceCloneSelect(
          mossDemoIdInput,
          panel.querySelector('.narration-clone-record-btn'),
          panel.querySelector('.narration-clone-delete-btn'),
          panel.querySelector('.narration-clone-quality-row'),
          saveSettings,
          saved.mossTtsVoice
        );
      } else {
        mossDemoIdInput.addEventListener('change', saveSettings);
      }

      if (cloneQualitySelect) cloneQualitySelect.addEventListener('change', saveSettings);
      rateInput.addEventListener('input', function () {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(2);
        saveSettings();
      });
      voiceSelect.addEventListener('change', saveSettings);

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

      var recordRatioSelect = panel.querySelector('[data-narration-setting="recordRatio"]');
      if (recordRatioSelect) {
        recordRatioSelect.value = localStorage.getItem('present-record-ratio') || '16:9';
        recordRatioSelect.addEventListener('change', function () {
          localStorage.setItem('present-record-ratio', recordRatioSelect.value);
          document.dispatchEvent(new CustomEvent('recordRatioChanged', { detail: { ratio: recordRatioSelect.value } }));
        });
      }

      voiceTestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var filterLang = langSelect.value === 'auto' ? getLang() : langSelect.value;
        if (h.playBrowserVoicePreview) {
          h.playBrowserVoicePreview(filterLang, rateInput.value, voiceSelect.value, voiceTestBtn);
        }
      });

      var vibeTestBtn = panel.querySelector('.narration-vibe-test');
      if (vibeTestBtn && h.playVibeVoicePreview) {
        vibeTestBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          h.playVibeVoicePreview(vibeVoiceSelect.value, rateInput.value, vibeTestBtn);
        });
      }

      if (mossVoiceTestBtn && h.playRemoteTtsPreview) {
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
          h.playRemoteTtsPreview(
            ep,
            headers,
            { model: 'Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit', input: testText, voice: voice },
            mossVoiceTestBtn
          );
        });
      }

      panel.querySelector('.narration-settings-close').addEventListener('click', function () {
        panel.classList.remove('is-open');
      });

      document.addEventListener('click', function (e) {
        if (panel.classList.contains('is-open') && !panel.contains(e.target) && !e.target.closest('.present-settings') && !e.target.closest('.narration-capsule-btn') && !e.target.closest('.assistant-fab')) {
          panel.classList.remove('is-open');
        }
      });

      panel._refreshFromStorage = function () {
        var fresh = readMergedSettings();
        langSelect.value = fresh.lang || 'auto';
        if (fresh.rate) { rateInput.value = fresh.rate; rateValue.textContent = parseFloat(fresh.rate).toFixed(2); }
        ttsProviderSelect.value = fresh.ttsProvider || fresh.ttsEngine || 'browser';
        if (fresh.vibeVoice) vibeVoiceSelect.value = fresh.vibeVoice;
        if (fresh.mossTtsVoice) mossDemoIdInput.value = fresh.mossTtsVoice;
        if (cloneQualitySelect && fresh.mossCloneQuality) cloneQualitySelect.value = fresh.mossCloneQuality;
        if (emotionSelectIn) emotionSelectIn.value = fresh.ttsEmotion || 'default';
        syncProviderVisibility();
        populateVoices();
        if (fresh.voiceName) voiceSelect.value = fresh.voiceName;
      };

      return panel;
    }
  };
})();

/**
 * Article Narration — LLM-powered auto-narrate for presentation mode.
 * Lazy-loaded by article-presentation.js on first auto-play click.
 * Exposes window.StudyRoomNarration with a createController() factory.
 *
 * Dependencies: Web Speech API (browser-native), LLM via localStorage('llm-settings').
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     Voice cache — speechSynthesis.getVoices() is async
     in some browsers, so we cache on first availability.
     ══════════════════════════════════════════════════════ */
  var cachedVoices = [];
  var voicesReady = false;

  function refreshVoices() {
    if (!window.speechSynthesis) return;
    var v = window.speechSynthesis.getVoices();
    if (v && v.length) {
      cachedVoices = v;
      voicesReady = true;
    }
  }

  refreshVoices();
  if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  }

  /* ══════════════════════════════════════════════════════
     Slide text extraction
     ══════════════════════════════════════════════════════ */
  function extractSlideText(stepElement) {
    var title = stepElement.getAttribute('data-step-title') || '';
    var label = stepElement.getAttribute('data-step-label') || '';
    var body = '';

    // For overview pages, content is visually hidden (accordion collapsed).
    // Extract section description + all subsection titles regardless of visibility.
    if (stepElement.hasAttribute('data-present-overview')) {
      var sHead = stepElement.querySelector('.section-head');
      if (sHead) {
        var kicker = sHead.querySelector('.section-kicker');
        if (kicker) body += (kicker.textContent || '').trim() + '\n';
        var headH2 = sHead.querySelector('h2');
        if (headH2) body += (headH2.textContent || '').trim() + '\n';
        var descP = sHead.querySelector('p:not(.section-kicker)');
        if (descP) body += (descP.textContent || '').trim() + '\n';
      }
      // Collect all accordion subsection titles + key content
      var accordionItems = stepElement.querySelectorAll('[data-accordion]');
      accordionItems.forEach(function (item) {
        var toggle = item.querySelector('.subsection-toggle span');
        if (toggle) body += '- ' + (toggle.textContent || '').trim() + '\n';
        var content = item.querySelector('.subsection-content');
        if (content) {
          // Grab all paragraphs (not just first)
          var paras = content.querySelectorAll('p');
          paras.forEach(function (p) {
            var t = (p.textContent || '').trim();
            if (t && t.length > 10) body += '  ' + t + '\n';
          });
          // Grab insight callout content
          var callouts = content.querySelectorAll('.insight-callout');
          callouts.forEach(function (c) {
            var ch = c.querySelector('h4');
            var cp = c.querySelector('p');
            if (ch) body += '  [' + (ch.textContent || '').trim() + '] ';
            if (cp) body += (cp.textContent || '').trim() + '\n';
          });
          // Grab scenario card titles
          var cards = content.querySelectorAll('.scenario-card h4');
          cards.forEach(function (h) {
            body += '  · ' + (h.textContent || '').trim() + '\n';
          });
          // Grab step-flow item titles
          var stepItems = content.querySelectorAll('.step-item h4');
          stepItems.forEach(function (h) {
            body += '  · ' + (h.textContent || '').trim() + '\n';
          });
        }
      });
      // Also grab non-accordion content (insight-grid, flow-list, etc.)
      var insightCards = stepElement.querySelectorAll('.insight-card');
      insightCards.forEach(function (card) {
        var h3 = card.querySelector('h3');
        var p = card.querySelector('p');
        if (h3) body += '- ' + (h3.textContent || '').trim() + '\n';
        if (p) body += '  ' + (p.textContent || '').trim() + '\n';
      });

      return { title: title, label: label, body: body };
    }

    // Normal extraction — walk DOM elements (ignore CSS visibility since
    // non-active steps are display:none during lookahead, but we still need their text)
    var walker = document.createTreeWalker(
      stepElement,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function (node) {
          // Skip aria-hidden elements (presentation chrome, not content)
          if (node.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT;
          // Skip toggled-off subsection content in normal reading mode
          if (node.classList.contains('subsection-content') &&
              node.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT;
          // Skip presentation-only elements
          if (node.classList.contains('present-inline-head')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var node;
    var seen = {};
    while ((node = walker.nextNode())) {
      // Only collect leaf text from specific content elements
      var tag = node.tagName;
      if (tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4' ||
          tag === 'P' || tag === 'LI' || tag === 'TD' || tag === 'TH' ||
          tag === 'SPAN' || tag === 'STRONG' || tag === 'EM' || tag === 'CODE' ||
          tag === 'BLOCKQUOTE') {
        var text = (node.innerText || node.textContent || '').trim();
        if (text && !seen[text]) {
          seen[text] = true;
          body += text + '\n';
        }
      }
    }

    return { title: title, label: label, body: body };
  }

  /* ══════════════════════════════════════════════════════
     LLM narrative generation
     ══════════════════════════════════════════════════════ */
  var SYSTEM_PROMPTS = {
    zh: '你是 illusion615 Knowledge Hub 的 AI 讲解员，正在为一段知识分享演示做语音旁白。你的讲解要让听众觉得清晰、有洞察、值得听。\n\n输出格式：\n- 只输出纯文本，禁止使用任何 Markdown 格式（不要用 **加粗**、不要用 # 标题、不要用 - 列表、不要用代码块）\n- 输出的文本将直接交给语音合成引擎朗读，所以要完全口语化，像说话一样自然\n\n重要：不要自行添加问候语、开场白或结束语，除非用户消息中明确要求。直接讲解当前页内容即可。\n\n讲解深度规则：\n- 简单页（只有标题或少量文字）：2-3句，80字左右\n- 普通页（列表、要点）：3-5句，120-180字。逐条用自己的话解释核心要点，不要跳过\n- 复杂页（表格、架构图、对比矩阵、代码）：5-8句，200-300字。拆解结构、对比差异、指出设计取舍\n- 根据内容量自适应长度，内容越多讲解越充分\n\n风格规则：\n- 绝对不要照读幻灯片文字，用你自己的话重新诠释\n- 语气亲和、专业，像跟朋友分享有趣发现——有节奏感、有观点、有温度\n- 用具体类比让抽象概念可感知（"这就好比…""相当于…"）\n- 有数据时，挑最有冲击力的数字点评，给出直觉性解读\n- 有对比时，明确说出谁更好以及为什么\n- 页间过渡自然多变：禁止"接下来""下面""然后"，用反问、设问、因果、转折衔接\n- 不要用"我们可以看到""值得注意的是"等废话\n- 每页结尾用一句话收束，但表达方式必须多变——可以是观点、类比、反问、展望、金句，禁止反复使用"所以结论就是""总结一下""一句话概括"等固定句式',
    en: 'You are the AI narrator for illusion615 Knowledge Hub, providing voice-over for a knowledge-sharing presentation. Your narration should feel clear, insightful, and worth listening to.\n\nOutput format:\n- Output plain text ONLY. Do NOT use any Markdown formatting — no **bold**, no # headings, no - bullet lists, no code blocks\n- The output will be fed directly to a text-to-speech engine, so it must read naturally as spoken language\n\nIMPORTANT: Do NOT add greetings, opening remarks, or closing remarks unless the user message explicitly asks for them. Just narrate the current slide content directly.\n\nDepth rules:\n- Simple slides (title only or minimal text): 2-3 sentences, ~50 words\n- Regular slides (bullet points, key concepts): 3-5 sentences, ~80-120 words. Walk through each point in your own words, do not skip any\n- Complex slides (tables, architecture diagrams, comparison matrices, code): 5-8 sentences, ~150-200 words. Break down the structure, compare differences, explain design trade-offs\n- Adapt length to content density — more content means more thorough narration\n\nStyle rules:\n- Never read slide text verbatim — reinterpret in your own words\n- Be approachable and professional — like sharing an exciting discovery with a friend — punchy, opinionated, warm\n- Use concrete analogies to make abstract concepts tangible\n- When data is shown, single out the most striking number and give an intuitive reading\n- When comparisons are present, clearly state who wins and why\n- Vary transitions: use rhetorical questions, cause-effect, contrast, callbacks — never say "next" or "moving on"\n- Avoid filler phrases like "as we can see" or "it is worth noting"\n- End each slide with a concise wrap-up, but vary the phrasing every time — use an opinion, analogy, rhetorical question, forward look, or memorable quote. Never repeat "so the conclusion is" or "to sum up"'
  };

  function getLlmSettings() {
    try {
      var s = JSON.parse(localStorage.getItem('llm-settings'));
      if (s && s.provider !== 'none' && s.endpoint && s.model) return s;
    } catch (e) {}
    return null;
  }

  function generateNarrative(slideInfo, slideIndex, totalSlides, lang, abortSignal) {
    var settings = getLlmSettings();
    if (!settings) return Promise.reject(new Error('No LLM settings'));

    // Get article title for context so LLM knows the topic
    var articleTitle = document.title || '';
    var heroH1 = document.querySelector('.hero h1');
    if (heroH1) articleTitle = (heroH1.textContent || '').trim();

    var systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.zh;
    var positionHint = '';
    if (slideIndex === 0) positionHint = '\n\n[指令：这是演示的第一页，请以"大家好，欢迎来到 illusion615 Knowledge Hub 的知识分享"开头，然后简要介绍本次演示的主题]';
    else if (slideIndex === totalSlides - 1) positionHint = '\n\n[指令：这是演示的最后一页，请在讲解完内容后，以"感谢收看，更多内容请访问 illusion615 Knowledge Hub"结尾]';

    var userPrompt = '本次演示的文章主题: ' + articleTitle +
      '\n\n幻灯片 ' + (slideIndex + 1) + '/' + totalSlides +
      '\n标签: ' + (slideInfo.label || '(无)') +
      '\n标题: ' + (slideInfo.title || '(无)') +
      '\n内容:\n' + (slideInfo.body || '(空)') + positionHint;

    if (lang === 'en') {
      positionHint = '';
      if (slideIndex === 0) positionHint = '\n\n[Instruction: This is the FIRST slide. Start with "Hi everyone, welcome to illusion615 Knowledge Hub." Then briefly introduce the topic.]';
      else if (slideIndex === totalSlides - 1) positionHint = '\n\n[Instruction: This is the LAST slide. After narrating the content, close with "Thanks for watching. Visit illusion615 Knowledge Hub for more."]';

      userPrompt = 'Article topic: ' + articleTitle +
        '\n\nSlide ' + (slideIndex + 1) + '/' + totalSlides +
        '\nLabel: ' + (slideInfo.label || '(none)') +
        '\nTitle: ' + (slideInfo.title || '(none)') +
        '\nContent:\n' + (slideInfo.body || '(empty)') + positionHint;
    }

    var messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    var endpoint = settings.endpoint.replace(/\/+$/, '');
    var url, headers, body;
    headers = { 'Content-Type': 'application/json' };

    if (settings.provider === 'ollama') {
      url = endpoint + '/api/chat';
      body = { model: settings.model, messages: messages, stream: false };
    } else {
      url = endpoint + '/chat/completions';
      body = { model: settings.model, messages: messages, stream: false };
      if (settings.apikey) headers['Authorization'] = 'Bearer ' + settings.apikey;
    }

    var fetchOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    };
    if (abortSignal) fetchOptions.signal = abortSignal;

    return fetch(url, fetchOptions)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        // Ollama: data.message.content
        // OpenAI: data.choices[0].message.content
        if (settings.provider === 'ollama') {
          return (data.message && data.message.content) ? data.message.content.trim() : '';
        }
        return (data.choices && data.choices[0] && data.choices[0].message)
          ? data.choices[0].message.content.trim()
          : '';
      });
  }

  /* ══════════════════════════════════════════════════════
     Web Speech API wrapper
     ══════════════════════════════════════════════════════ */
  function pickVoice(lang, preferredVoiceName) {
    if (!voicesReady) refreshVoices();
    // If user selected a specific voice, use it
    if (preferredVoiceName) {
      var exact = cachedVoices.filter(function (v) { return v.name === preferredVoiceName; });
      if (exact.length) return exact[0];
    }
    var targetLang = (lang === 'zh') ? 'zh' : 'en';
    var preferred = cachedVoices.filter(function (v) {
      return v.lang.indexOf(targetLang) === 0;
    });

    // Prefer premium/enhanced/natural voices
    var premium = preferred.filter(function (v) {
      return /premium|enhanced|natural/i.test(v.name);
    });

    return premium[0] || preferred[0] || null;
  }

  /**
   * Split long text by sentences to avoid Chrome's ~15s utterance bug.
   * Returns an array of text chunks.
   */
  function splitIntoChunks(text) {
    if (text.length <= 200) return [text];
    // Split on Chinese/English sentence endings
    var parts = text.split(/(?<=[。！？.!?])\s*/);
    var chunks = [];
    var current = '';
    for (var i = 0; i < parts.length; i++) {
      if (current.length + parts[i].length > 200 && current.length > 0) {
        chunks.push(current);
        current = parts[i];
      } else {
        current += (current ? ' ' : '') + parts[i];
      }
    }
    if (current) chunks.push(current);
    return chunks.length ? chunks : [text];
  }

  /**
   * Speak text using Web Speech API.
   * Returns an object with pause/resume/cancel methods for control.
   */
  function speak(text, lang, callbacks, speechSettings) {
    var synth = window.speechSynthesis;
    var chunks = splitIntoChunks(text);
    var chunkIndex = 0;
    var cancelled = false;
    var paused = false;
    var currentUtterance = null;
    var ss = speechSettings || {};

    var cb = callbacks || {};

    function speakChunk() {
      if (cancelled || chunkIndex >= chunks.length) {
        if (!cancelled && cb.onEnd) cb.onEnd();
        return;
      }

      // Notify which sentence is being spoken
      if (cb.onChunkStart) cb.onChunkStart(chunks[chunkIndex]);

      var utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.lang = (lang === 'zh') ? 'zh-CN' : 'en-US';
      utterance.rate = ss.rate || 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      var voice = pickVoice(lang, ss.voiceName);
      if (voice) utterance.voice = voice;

      currentUtterance = utterance;

      utterance.onend = function () {
        chunkIndex++;
        if (!cancelled && !paused) {
          speakChunk();
        }
      };

      utterance.onerror = function (e) {
        if (cancelled) return;
        // 'interrupted' is expected when we cancel mid-speech
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        if (cb.onError) cb.onError(e);
      };

      synth.speak(utterance);
    }

    speakChunk();

    return {
      pause: function () {
        paused = true;
        synth.pause();
      },
      resume: function () {
        paused = false;
        synth.resume();
        // If between chunks, continue
        if (chunkIndex < chunks.length && !synth.speaking) {
          speakChunk();
        }
      },
      cancel: function () {
        cancelled = true;
        synth.cancel();
      }
    };
  }

  /* ══════════════════════════════════════════════════════
     NarrationController
     ══════════════════════════════════════════════════════ */
  function createController(options) {
    var opts = options || {};
    var onSlideComplete = opts.onSlideComplete || function () {};
    var onStateChange = opts.onStateChange || function () {};
    var onSubtitle = opts.onSubtitle || function () {};
    var onError = opts.onError || function () {};

    var controllerState = 'idle'; // idle | generating | playing | paused
    var narrativeCache = {};      // slideIndex → narrative string
    var presentSteps = null;
    var currentIndex = -1;
    var totalSlides = 0;
    var getLang = function () { return 'zh'; };
    var getEffectiveLang = function () {
      var ss = getSpeechSettings();
      if (ss.lang && ss.lang !== 'auto') return ss.lang;
      return getLang();
    };
    var getSpeechSettings = function () {
      var global = {};
      var article = {};
      var articleSlug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
      try { global = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
      if (articleSlug) {
        try { article = JSON.parse(localStorage.getItem('narration-settings:' + articleSlug)) || {}; } catch (e) {}
      }
      // Article overrides global
      var merged = {};
      Object.keys(global).forEach(function (k) { merged[k] = global[k]; });
      Object.keys(article).forEach(function (k) { if (article[k] !== undefined && article[k] !== '') merged[k] = article[k]; });
      return merged;
    };
    var currentSpeaker = null;
    var currentAbort = null;
    var skipTimer = null;
    var lookaheadAbort = null;

    function setState(newState) {
      controllerState = newState;
      onStateChange(newState);
    }

    function cancelAll() {
      if (currentSpeaker) {
        currentSpeaker.cancel();
        currentSpeaker = null;
      }
      if (currentAbort) {
        currentAbort.abort();
        currentAbort = null;
      }
      if (lookaheadAbort) {
        lookaheadAbort.abort();
        lookaheadAbort = null;
      }
      if (skipTimer) {
        clearTimeout(skipTimer);
        skipTimer = null;
      }
      window.speechSynthesis && window.speechSynthesis.cancel();
    }

    /** Pre-generate narrative for the next slide (non-blocking). */
    function lookahead(index) {
      if (index < 0 || index >= totalSlides) return;
      if (narrativeCache[index] !== undefined) return; // already cached

      var step = presentSteps[index];
      if (!step) return;

      var slideInfo = extractSlideText(step);
      var lang = getEffectiveLang();

      lookaheadAbort = new AbortController();
      generateNarrative(slideInfo, index, totalSlides, lang, lookaheadAbort.signal)
        .then(function (text) {
          narrativeCache[index] = text || '';
        })
        .catch(function () {
          // Lookahead failure is non-critical
        });
    }

    /** Play narration for a specific slide index. */
    function playSlide(index) {
      if (controllerState === 'idle') return;

      currentIndex = index;
      var step = presentSteps[index];
      if (!step) {
        setState('idle');
        return;
      }

      // Check cache first
      if (narrativeCache[index] !== undefined) {
        startSpeaking(narrativeCache[index], index);
        return;
      }

      // Generate narrative
      setState('generating');
      currentAbort = new AbortController();
      var slideInfo = extractSlideText(step);
      var lang = getEffectiveLang();

      generateNarrative(slideInfo, index, totalSlides, lang, currentAbort.signal)
        .then(function (text) {
          if (controllerState === 'idle') return; // stopped during generation
          narrativeCache[index] = text || '';
          startSpeaking(narrativeCache[index], index);
        })
        .catch(function (err) {
          if (controllerState === 'idle') return;
          if (err.name === 'AbortError') return;
          onError(err);
          // Skip this slide after 3s
          setState('playing');
          skipTimer = setTimeout(function () {
            skipTimer = null;
            if (controllerState !== 'idle') {
              advanceOrStop(index);
            }
          }, 3000);
        });
    }

    function startSpeaking(text, index) {
      if (controllerState === 'idle') return;

      if (!text) {
        // Empty narrative → advance immediately
        advanceOrStop(index);
        return;
      }

      setState('playing');

      // Start lookahead for next slide
      lookahead(index + 1);

      var lang = getEffectiveLang();
      var ss = getSpeechSettings();
      currentSpeaker = speak(text, lang, {
        onChunkStart: function (chunkText) {
          onSubtitle(chunkText);
        },
        onEnd: function () {
          currentSpeaker = null;
          if (controllerState === 'playing') {
            onSubtitle('');
            advanceOrStop(index);
          }
        },
        onError: function () {
          currentSpeaker = null;
          if (controllerState !== 'idle') {
            onSubtitle('');
            advanceOrStop(index);
          }
        }
      }, ss);
    }

    function advanceOrStop(index) {
      if (index >= totalSlides - 1) {
        // Last slide done
        setState('idle');
        onSubtitle('');
        onSlideComplete('done');
        return;
      }
      onSlideComplete('next');
    }

    /* ── Public API ── */
    return {
      start: function (steps, index, langFn) {
        cancelAll();
        presentSteps = steps;
        totalSlides = steps.length;
        currentIndex = index;
        if (langFn) getLang = langFn;
        setState('generating');
        playSlide(index);
      },

      /** Pre-generate narrative for a slide without starting speech. Returns Promise. */
      pregenerate: function (steps, index, langFn) {
        presentSteps = steps;
        totalSlides = steps.length;
        if (langFn) getLang = langFn;
        if (narrativeCache[index] !== undefined) return Promise.resolve(narrativeCache[index]);
        var step = steps[index];
        if (!step) return Promise.resolve('');
        var slideInfo = extractSlideText(step);
        var lang = getEffectiveLang();
        return generateNarrative(slideInfo, index, totalSlides, lang, null).then(function (text) {
          narrativeCache[index] = text || '';
          return narrativeCache[index];
        }).catch(function () {
          narrativeCache[index] = '';
          return '';
        });
      },

      pause: function () {
        if (controllerState === 'playing' && currentSpeaker) {
          currentSpeaker.pause();
          setState('paused');
        }
      },

      resume: function () {
        if (controllerState === 'paused' && currentSpeaker) {
          currentSpeaker.resume();
          setState('playing');
        }
      },

      stop: function () {
        cancelAll();
        onSubtitle('');
        setState('idle');
      },

      syncToSlide: function (index) {
        if (controllerState === 'idle') return;
        cancelAll();
        currentIndex = index;
        setState('generating');
        playSlide(index);
      },

      isActive: function () {
        return controllerState !== 'idle';
      },

      getState: function () {
        return controllerState;
      },

      destroy: function () {
        cancelAll();
        narrativeCache = {};
        presentSteps = null;
        controllerState = 'idle';
      }
    };
  }

  /* ══════════════════════════════════════════════════════
     Static utility: check if narration is possible
     ══════════════════════════════════════════════════════ */
  function isAvailable() {
    return !!(window.speechSynthesis &&
              window.SpeechSynthesisUtterance &&
              getLlmSettings());
  }

  function getVoiceList() {
    if (!voicesReady) refreshVoices();
    return cachedVoices.map(function (v) {
      return { name: v.name, lang: v.lang, isDefault: v.default };
    });
  }

  /* ── Public module ── */
  window.StudyRoomNarration = {
    createController: createController,
    isAvailable: isAvailable,
    getVoiceList: getVoiceList
  };
})();

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

      return { title: title, label: label, body: body, isOverview: true };
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

    return { title: title, label: label, body: body, isOverview: false };
  }

  /* ══════════════════════════════════════════════════════
     LLM narrative generation
     ══════════════════════════════════════════════════════ */
  var SYSTEM_PROMPTS = {
    zh: '你是 illusion615 Knowledge Hub 的 AI 讲解员，正在为知识分享演示做语音旁白。\n\n输出格式：\n- 只输出纯文本，禁止 Markdown（不要 **加粗**、# 标题、- 列表、代码块）\n- 文本直接交给语音合成引擎朗读，必须口语化、自然\n\n重要：不要加问候语或结束语，除非用户消息明确要求。直接讲解当前页。\n\n长度规则：\n- 简单页（只有标题或少量文字）：2-3句，60-80字\n- 普通页（列表、要点）：3-5句，100-150字\n- 复杂页（表格、架构图、对比矩阵）：5-8句，180-250字\n- 宁可简洁有力，不要啰嗦注水\n\n核心原则——内容为王：\n- 紧贴幻灯片上的实际内容讲解，不要脱离主题发挥\n- 把幻灯片的要点用自己的话解释清楚，确保每个关键概念都覆盖到\n- 有数据就讲数据，有对比就讲差异，有步骤就讲逻辑——不要跳过具体内容去空谈\n- 涉及专业概念时，先用一句话说清楚是什么，再决定是否需要举例\n\n比喻使用规则：\n- 每页最多一个比喻，且只在概念确实抽象难懂时才用\n- 如果幻灯片内容本身已经很具体（有数字、有例子、有步骤），不需要再加比喻\n- 绝对禁止连续两页都用比喻结尾\n\n禁止事项：\n- 不要照读幻灯片文字\n- 不要用"我们可以看到""值得注意的是""不难发现"等废话\n- 不要用"接下来""下面""然后"做过渡\n- 不要每页都用金句或感叹收尾——大部分页面用一句话平实总结即可\n- 不要自行编造幻灯片中没有的内容或例子',
    en: 'You are the AI narrator for illusion615 Knowledge Hub, providing voice-over for a knowledge-sharing presentation.\n\nOutput format:\n- Plain text ONLY. No Markdown (no **bold**, # headings, - lists, code blocks)\n- Output goes directly to TTS engine — must sound natural when spoken\n\nIMPORTANT: No greetings or closings unless explicitly requested. Narrate the current slide directly.\n\nLength rules:\n- Simple slides (title/minimal text): 2-3 sentences, ~40-60 words\n- Regular slides (bullet points, concepts): 3-5 sentences, ~70-100 words\n- Complex slides (tables, diagrams, comparisons): 5-8 sentences, ~120-180 words\n- Be concise and substantive — never pad with filler\n\nCore principle — substance first:\n- Stick closely to the actual slide content. Do not go off-topic\n- Explain each key point in your own words. Cover every important concept shown\n- If there are numbers, discuss them. If there are comparisons, state the differences. If there are steps, walk through the logic — do not skip specifics to philosophize\n- For technical concepts, state what it is in one sentence first, then decide if an example is needed\n\nAnalogy rules:\n- Maximum ONE analogy per slide, and only when a concept is genuinely abstract\n- If the slide already has concrete data, examples, or steps, skip the analogy\n- Never end two consecutive slides with analogies\n\nProhibitions:\n- Do not read slide text verbatim\n- No filler: "as we can see", "it is worth noting", "interestingly"\n- No generic transitions: "next", "moving on", "let us now"\n- Do not end every slide with a catchy quote or exclamation — most slides should end with a plain one-sentence summary\n- Do not invent content, examples, or data not present on the slide'
  };

  function getLlmSettings() {
    try {
      var s = JSON.parse(localStorage.getItem('llm-settings'));
      if (s && s.provider !== 'none' && s.endpoint && s.model) return s;
    } catch (e) {}
    return null;
  }

  /**
   * Detect the active TTS engine by merging global + per-article narration settings.
   * Returns: 'fish-s2' | 'moss-tts-nano' | 'vibevoice' | 'browser'
   */
  function getActiveTtsEngine() {
    var ns = {};
    try { ns = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
    var slug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
    if (slug) {
      try {
        var a = JSON.parse(localStorage.getItem('narration-settings:' + slug));
        if (a) Object.keys(a).forEach(function (k) { if (a[k] !== undefined && a[k] !== '') ns[k] = a[k]; });
      } catch (e) {}
    }
    if (ns.ttsEngine === 'fish-s2') return 'fish-s2';
    if (ns.ttsEngine === 'moss-tts-nano') return 'moss-tts-nano';
    if (ns.ttsProvider === 'vibevoice') return 'vibevoice';
    return 'browser';
  }

  /**
   * Return engine-specific text formatting guidance to append to the narration system prompt.
   * Each engine has different tolerance for tags, acronyms, numbers, and pause markers.
   */
  function getEngineGuidance(engine, lang) {
    if (lang === 'zh') {
      if (engine === 'fish-s2') {
        return '\n\n语音引擎适配（Fish Audio S2）：\n' +
          '- 数字和年份直接用阿拉伯数字（如 2026、12.5%、第 3 条），引擎按上下文自然朗读\n' +
          '- 英文术语保留原文（RAG、LLM、API），单字母缩写如需逐字读则在字母间留空格\n' +
          '- 用句号、逗号、问号、感叹号划分语义节奏，标点会决定停顿长度\n' +
          '- 在情感起伏明显的位置，可以插入中文括号标签增强表现力：(笑)、(叹气)、(停顿)、(快速)、(缓慢)。每页最多 1–2 个，仅在真正需要时使用。\n' +
          '- 除上述括号标签外，不要再用其他括号说明、引号包裹的旁白或星号\n' +
          '- 不要写 SSML 或 <break> 标签';
      }
      if (engine === 'moss-tts-nano') {
        return '\n\n语音引擎适配（Qwen3-TTS）：\n' +
          '- 每句话控制在 15-25 字，用句号断句。绝对不要逗号连排超过两个分句\n' +
          '- 关键概念讲完后用句号收束，让听众有消化的停顿\n' +
          '- 数字直接用阿拉伯数字，专业术语保留英文原文（RAG、LLM、API）\n' +
          '- 中英混排时英文前后保留空格\n' +
          '- 不要使用任何标签、SSML 或括号旁白——只输出标点连接的纯文本（引擎会通过语调参数控制情感，不需脚本里加标记）\n' +
          '- 节奏比信息量更重要：宁可少说一个细节，也不要把三个要点挤进一句话';
      }
      if (engine === 'vibevoice') {
        return '\n\n语音引擎适配（VibeVoice 实时引擎）：\n' +
          '- 句子越短越流畅，建议每句 ≤ 25 字\n' +
          '- 数字用阿拉伯数字，避免长串数字\n' +
          '- 不要使用任何标签或括号旁白';
      }
      return '\n\n语音引擎适配（浏览器 TTS）：\n' +
        '- 仅依赖标点产生停顿，请用句号、逗号合理划分\n' +
        '- 数字用阿拉伯数字，英文术语保留原文\n' +
        '- 不要使用任何标签';
    }
    // English
    if (engine === 'fish-s2') {
      return '\n\nTTS engine adaptation (Fish Audio S2):\n' +
        '- Use punctuation (period, comma, question, exclamation) for natural prosody\n' +
        '- Spell acronyms with spaces if you want letter-by-letter reading (e.g., "A P I"); otherwise keep as "API"\n' +
        '- Use plain digits for numbers and years\n' +
        '- At genuine emotional beats you may insert paralinguistic tags (in Chinese parentheses, supported by the engine): （笑）、（叹气）、（停顿）. Use sparingly — at most 1–2 per slide and only when the emotion is real.\n' +
        '- Avoid other parenthetical asides, quoted side-notes, or asterisks — they may be read aloud\n' +
        '- No SSML or <break> tags';
    }
    if (engine === 'moss-tts-nano') {
      return '\n\nTTS engine adaptation (Qwen3-TTS):\n' +
        '- Keep sentences to 10-18 words. End with a period — never chain more than two clauses with commas\n' +
        '- After each key concept, close the sentence to create a natural pause for the listener\n' +
        '- Keep technical terms in their normal written form (API, LLM, RAG)\n' +
        '- No tags, SSML, or parenthetical asides — plain punctuated prose only (the engine handles emotion via its own tone parameter, not inline markup)\n' +
        '- Rhythm matters more than coverage: better to drop one detail than cram three points into one sentence';
    }
    if (engine === 'vibevoice') {
      return '\n\nTTS engine adaptation (VibeVoice realtime):\n' +
        '- Short sentences flow better — aim for ≤ 15 words per sentence\n' +
        '- Plain digits for numbers; avoid long digit strings\n' +
        '- No tags or parenthetical asides';
    }
    return '\n\nTTS engine adaptation (browser TTS):\n' +
      '- Punctuation alone produces pauses — use commas and periods deliberately\n' +
      '- Plain digits, plain text, no tags';
  }

  /**
   * Default speaker-tone instructions per engine — passed as the `instructions` field
   * of the OpenAI-compatible TTS request. Both Fish Audio S2 and Qwen3-TTS accept it.
   * Users may override via narration-settings.ttsInstructions (free-text, future UI).
   */
  function getDefaultInstructions(engine, lang) {
    if (lang === 'zh') {
      if (engine === 'fish-s2') return '专业讲解者语气，沉稳清晰，节奏适中，关键数据处略有强调';
      if (engine === 'moss-tts-nano') return '讲解者语气，沉稳专业，节奏自然';
      return '';
    }
    if (engine === 'fish-s2') return 'Professional narrator tone, calm and clear, with subtle emphasis on key data points';
    if (engine === 'moss-tts-nano') return 'Professional narrator, calm, paced naturally';
    return '';
  }

  /**
   * Emotion presets for cloned voices and presets — natural-language instructions
   * that bias the TTS engine toward a particular tone/energy. Returned strings are
   * passed verbatim as the `instructions` field. Falls back to default narrator tone.
   */
  var EMOTION_PRESETS = {
    'default':     { zh: '讲解者语气，沉稳专业，节奏自然，关键数据处略有强调', en: 'Professional narrator, calm and clear, paced naturally with subtle emphasis on key points' },
    'passionate':  { zh: '充满激情，富有感染力，语调起伏明显，节奏有力，关键处声音上扬，让人热血沸腾', en: 'Passionate and energetic, with strong dynamics, dramatic intonation, rising emphasis on key phrases — make it inspiring' },
    'inspiring':   { zh: '激励人心，鼓舞士气，节奏铿锵有力，传达坚定信念和未来希望', en: 'Inspiring and uplifting, rhythmic and powerful delivery, conveying conviction and hope for the future' },
    'warm':        { zh: '温暖亲切，像朋友在身边倾诉，节奏舒缓，语气柔和，让人放松', en: 'Warm and intimate, like a friend speaking close by, slow soothing pace, gentle tone' },
    'cheerful':    { zh: '轻松愉悦，活泼跳跃，节奏明快，带有微笑感，传递正能量', en: 'Cheerful and lively, bright pace, smiling tone, upbeat and positive energy' },
    'serious':     { zh: '严肃深沉，权威感强，语速稳健，字字清晰有力，传达专业性', en: 'Serious and authoritative, steady pace, every word clear and weighty, conveying expertise' },
    'storytelling':{ zh: '讲故事的语气，富有画面感，节奏富于变化，情感细腻，引人入胜', en: 'Storyteller voice, vivid and immersive, varied rhythm, nuanced emotion, draws the listener in' },
    'urgent':      { zh: '紧迫急切，节奏加快，语气坚定，传达事件的重要性和时效性', en: 'Urgent and intense, faster pace, firm tone, conveying importance and time pressure' }
  };

  function getEmotionInstructions(engine, lang, emotionKey) {
    var key = emotionKey || 'default';
    var preset = EMOTION_PRESETS[key];
    if (!preset) return getDefaultInstructions(engine, lang);
    return lang === 'zh' ? preset.zh : preset.en;
  }

  function generateNarrative(slideInfo, slideIndex, totalSlides, lang, abortSignal) {
    var settings = getLlmSettings();
    if (!settings) return Promise.reject(new Error('No LLM settings'));

    // Get article title for context so LLM knows the topic
    var articleTitle = document.title || '';
    var heroH1 = document.querySelector('.hero h1');
    if (heroH1) articleTitle = (heroH1.textContent || '').trim();

    var systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.zh;
    systemPrompt += getEngineGuidance(getActiveTtsEngine(), lang);
    var positionHint = '';
    if (slideIndex === 0) positionHint = '\n\n[指令：这是演示的第一页，请以"大家好，欢迎来到 illusion615 Knowledge Hub 的知识分享"开头，然后简要介绍本次演示的主题]';
    else if (slideIndex === totalSlides - 1) positionHint = '\n\n[指令：这是演示的最后一页，请在讲解完内容后，以"感谢收看，更多内容请访问 illusion615 Knowledge Hub"结尾]';

    var userPrompt = '本次演示的文章主题: ' + articleTitle +
      '\n\n幻灯片 ' + (slideIndex + 1) + '/' + totalSlides +
      '\n标签: ' + (slideInfo.label || '(无)') +
      '\n标题: ' + (slideInfo.title || '(无)') +
      '\n内容:\n' + (slideInfo.body || '(空)') + positionHint;

    if (slideInfo.isOverview) {
      userPrompt += '\n\n[指令：这是一个章节概览页，下面的子节会逐个展开讲解。请只用 2-3 句话简要概括本章的主题和要点，不要展开细节。控制在 60 字以内。]';
    }

    if (lang === 'en') {
      positionHint = '';
      if (slideIndex === 0) positionHint = '\n\n[Instruction: This is the FIRST slide. Start with "Hi everyone, welcome to illusion615 Knowledge Hub." Then briefly introduce the topic.]';
      else if (slideIndex === totalSlides - 1) positionHint = '\n\n[Instruction: This is the LAST slide. After narrating the content, close with "Thanks for watching. Visit illusion615 Knowledge Hub for more."]';

      userPrompt = 'Article topic: ' + articleTitle +
        '\n\nSlide ' + (slideIndex + 1) + '/' + totalSlides +
        '\nLabel: ' + (slideInfo.label || '(none)') +
        '\nTitle: ' + (slideInfo.title || '(none)') +
        '\nContent:\n' + (slideInfo.body || '(empty)') + positionHint;

      if (slideInfo.isOverview) {
        userPrompt += '\n\n[Instruction: This is a section overview page. The subsections will be covered in detail on the following slides. Keep it to 2-3 sentences summarizing the section theme. Stay under 50 words.]';
      }
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
   * Split text into subtitle-sized chunks (≤ ~2 visual lines).
   * Chinese: counted by character (~36/chunk).
   * English: counted by character but split at word boundaries (~80/chunk).
   * Splits at sentence punctuation first; falls back to clause punctuation
   * (，、；,;) and finally to whitespace if a single clause is still too long.
   */
  function splitIntoSubtitleChunks(text, lang) {
    var max = (lang === 'zh') ? 36 : 80;
    if (!text) return [];

    // Hard-split a too-long clause without breaking words (English) or
    // by character (Chinese, where there are no word breaks).
    function hardSplit(str) {
      var out = [];
      var rest = str;
      while (rest.length > max * 1.4) {
        var cut = max;
        if (lang !== 'zh') {
          // Find last whitespace within [0, max] to avoid mid-word cuts
          var slice = rest.slice(0, max);
          var ws = slice.lastIndexOf(' ');
          if (ws > max * 0.5) {
            cut = ws;
          } else {
            // No reasonable space — extend forward to next space to keep word intact
            var fwd = rest.indexOf(' ', max);
            cut = fwd > -1 ? fwd : rest.length;
          }
        }
        out.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).replace(/^\s+/, '');
      }
      if (rest) out.push(rest);
      return out;
    }

    var pieces = text.split(/(?<=[。！？.!?])\s*/).filter(Boolean);
    var chunks = [];
    pieces.forEach(function (p) {
      if (p.length <= max) { chunks.push(p); return; }
      // Sub-split on clause punctuation
      var clauses = p.split(/(?<=[，、；,;])\s*/).filter(Boolean);
      var buf = '';
      clauses.forEach(function (c) {
        if ((buf + c).length > max && buf) {
          chunks.push(buf);
          buf = c;
        } else {
          buf += c;
        }
      });
      if (buf) {
        hardSplit(buf).forEach(function (s) { chunks.push(s); });
      }
    });
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
     Local TTS — OpenAI-compatible server (mlx-audio)
     ══════════════════════════════════════════════════════ */

  /**
   * Speak text via a local OpenAI-compatible TTS server (e.g. mlx-audio).
   * Returns an object with pause/resume/cancel methods (same interface as speak()).
   *
   * Requires:
   *  - mlx-audio server:  mlx_audio.server --port 8000
   *  - CORS proxy:        node scripts/moss-tts-cors-proxy.js
   *
   * API: POST /v1/audio/speech  { model, input, voice }  → audio/wav blob
   */
  /**
   * Fetch TTS audio without playing (for prefetch / lookahead).
   * Returns a Promise<ArrayBuffer>.
   */
  function fetchLocalTTSAudio(text, lang, speechSettings) {
    var ss = speechSettings || {};
    // Reuse the same oMLX endpoint and API key as LLM
    var llm = getLlmSettings();
    var endpoint = llm ? llm.endpoint.replace(/\/+$/, '') : 'http://localhost:8000';
    var apikey = llm ? llm.apikey : '';
    var headers = { 'Content-Type': 'application/json' };
    if (apikey) headers['Authorization'] = 'Bearer ' + apikey;

    var body;
    if (ss.ttsEngine === 'fish-s2') {
      // Fish Audio S2 — voice is optional (zero-shot model uses default if omitted)
      var fishModel = ss.fishTtsModel || 'fish-audio-s2-pro-8bit';
      body = { model: fishModel, input: text };
      if (ss.fishTtsVoice) body.voice = ss.fishTtsVoice;
      // Speaker-tone control via natural-language instruction (engine accepts it)
      var fishInstr = (ss.ttsInstructions && ss.ttsInstructions.trim()) || getEmotionInstructions('fish-s2', lang, ss.ttsEmotion);
      if (fishInstr) body.instructions = fishInstr;
      // NOTE: voice cloning via ref_audio is currently disabled — the oMLX backend
      // crashes ("'str' object has no attribute 'ndim'") on any ref_audio payload.
      // Re-enable once the upstream server accepts base64/data-URI ref_audio.
    } else {
      // Default: moss-tts-nano / Qwen3-TTS — voice may be a preset (e.g. "vivian")
      // or a cloned voice ("clone:<id>"). Cloned voices switch to Qwen3-TTS-Base
      // and attach ref_audio + ref_text from the named entry in 'narration-clones'.
      var rawVoice = (ss.mossTtsVoice || (lang === 'zh' ? 'vivian' : 'ryan'));
      if (typeof rawVoice === 'string' && rawVoice.indexOf('clone:') === 0) {
        var cloneId = rawVoice.slice(6);
        var clones = [];
        try { clones = JSON.parse(localStorage.getItem('narration-clones')) || []; } catch (e) {}
        var entry = null;
        for (var i = 0; i < clones.length; i++) {
          if (clones[i].id === cloneId) { entry = clones[i]; break; }
        }
        if (entry && entry.audio && entry.text) {
          var quality = ss.mossCloneQuality === 'bf16' ? 'bf16' : '8bit';
          body = {
            model: 'Qwen3-TTS-12Hz-1.7B-Base-' + quality,
            input: text,
            ref_audio: entry.audio,   // plain base64 (no data-URI prefix)
            ref_text: entry.text
          };
        } else {
          // Clone missing — fall back to a preset
          body = { model: 'Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit', input: text, voice: lang === 'zh' ? 'vivian' : 'ryan' };
        }
      } else {
        var model = ss.mossTtsModel || 'Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit';
        body = { model: model, input: text, voice: rawVoice.toLowerCase() };
      }
      // Qwen3-TTS uses `instructions` for emotion/tone; pass selected emotion preset
      var qwenInstr = (ss.ttsInstructions && ss.ttsInstructions.trim()) || getEmotionInstructions('moss-tts-nano', lang, ss.ttsEmotion);
      if (qwenInstr) body.instructions = qwenInstr;
    }

    return fetch(endpoint + '/audio/speech', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error('Local TTS HTTP ' + res.status);
      return res.arrayBuffer();
    });
  }

  /* ── Shared AudioContext for recording capture ── */
  var recordingCtx = null;
  var recordingDest = null;

  function getRecordingStream() {
    if (!recordingCtx) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      recordingCtx = new Ctor();
      recordingDest = recordingCtx.createMediaStreamDestination();
    }
    if (recordingCtx.state === 'suspended') recordingCtx.resume();
    return recordingDest.stream;
  }

  /* ── Shared AudioContext for playback ──
     Browsers (Chrome/Edge) limit concurrent AudioContexts (~6). Creating one
     per slide caused 'AudioContext encountered an error from the audio device'
     after a few slides, with onended never firing → controller hung.
     Reuse a single context for all playback. */
  var playbackCtx = null;
  function getPlaybackCtx() {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (!playbackCtx || playbackCtx.state === 'closed') {
      playbackCtx = new Ctor();
    }
    if (playbackCtx.state === 'suspended') {
      try { playbackCtx.resume(); } catch (e) {}
    }
    return playbackCtx;
  }

  function speakViaLocalTTS(text, lang, callbacks, speechSettings, prefetchedBuffer) {
    var cb = callbacks || {};
    var ss = speechSettings || {};
    var cancelled = false;
    var paused = false;
    var audioCtx = null;
    var sourceNode = null;
    var subtitleTimers = [];
    var subtitleStartedAt = 0;
    var subtitlePauseAt = 0;
    var subtitleElapsedBeforePause = 0;
    var subtitleSchedule = null; // { chunks, offsets } in ms

    // Prepare subtitle chunks (≤ 2 visual lines each)
    var subtitleChunks = splitIntoSubtitleChunks(text, lang);

    function clearSubtitleTimers() {
      subtitleTimers.forEach(function (t) { clearTimeout(t); });
      subtitleTimers = [];
    }

    function scheduleSubtitles(durationMs, fromOffsetMs) {
      clearSubtitleTimers();
      if (!cb.onChunkStart || subtitleChunks.length <= 1) return;
      // Distribute by character weight so longer chunks linger longer
      var weights = subtitleChunks.map(function (s) { return Math.max(1, s.length); });
      var total = weights.reduce(function (a, b) { return a + b; }, 0);
      var offsets = [0];
      for (var i = 0; i < weights.length - 1; i++) {
        offsets.push(offsets[i] + (weights[i] / total) * durationMs);
      }
      subtitleSchedule = { offsets: offsets, durationMs: durationMs };
      subtitleStartedAt = Date.now() - (fromOffsetMs || 0);
      subtitleChunks.forEach(function (chunk, idx) {
        var delay = offsets[idx] - (fromOffsetMs || 0);
        if (delay < 0) {
          // Already past — fire immediately for the latest one before "now"
          if (idx === subtitleChunks.length - 1 || offsets[idx + 1] > (fromOffsetMs || 0)) {
            cb.onChunkStart(chunk);
          }
          return;
        }
        var t = setTimeout(function () {
          if (!cancelled) cb.onChunkStart(chunk);
        }, delay);
        subtitleTimers.push(t);
      });
    }

    // Show first subtitle chunk immediately while audio loads
    if (cb.onChunkStart) cb.onChunkStart(subtitleChunks[0] || text);

    var audioPromise = prefetchedBuffer
      ? Promise.resolve(prefetchedBuffer)
      : fetchLocalTTSAudio(text, lang, ss);

    audioPromise
    .then(function (buffer) {
      if (cancelled) return;

      audioCtx = getPlaybackCtx();
      if (!audioCtx) throw new Error('Web Audio API not available');
      // Copy the buffer before decoding — decodeAudioData detaches the original
      var copy = buffer.slice(0);
      return audioCtx.decodeAudioData(copy);
    })
    .then(function (audioBuffer) {
      if (cancelled || !audioBuffer) return;

      sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      var rateMultiplier = 1;
      if (ss.rate && ss.rate !== 0.92) {
        rateMultiplier = ss.rate / 0.92;
        sourceNode.playbackRate.value = rateMultiplier;
      }
      sourceNode.connect(audioCtx.destination);

      // Also route to recording capture stream if active
      if (recordingCtx && recordingDest) {
        try {
          var recSource = recordingCtx.createBufferSource();
          recSource.buffer = audioBuffer;
          if (ss.rate && ss.rate !== 0.92) {
            recSource.playbackRate.value = ss.rate / 0.92;
          }
          recSource.connect(recordingDest);
          recSource.start(0);
        } catch (e) {}
      }

      sourceNode.onended = function () {
        sourceNode = null;
        clearSubtitleTimers();
        if (!cancelled) {
          if (cb.onEnd) cb.onEnd();
        }
        // Do NOT close shared playback context — reused across slides
        audioCtx = null;
      };

      sourceNode.start(0);

      // Safety net: if onended never fires (audio device error, suspended tab),
      // force-advance after duration + 2s grace.
      var graceMs = (audioBuffer.duration / rateMultiplier) * 1000 + 2000;
      var safety = setTimeout(function () {
        if (cancelled || !sourceNode) return;
        try { sourceNode.stop(); } catch (e) {}
        var stale = sourceNode;
        sourceNode = null;
        clearSubtitleTimers();
        if (!cancelled && cb.onEnd) cb.onEnd();
        // null onended on stale to avoid double-fire
        try { stale.onended = null; } catch (e) {}
      }, graceMs);
      subtitleTimers.push(safety);

      // Schedule subtitle chunks across audio duration
      var durationMs = (audioBuffer.duration / rateMultiplier) * 1000;
      scheduleSubtitles(durationMs, 0);
    })
    .catch(function (err) {
      if (cancelled) return;
      if (cb.onError) cb.onError(err);
    });

    return {
      pause: function () {
        paused = true;
        // Stop the source instead of suspending the shared context (would pause
        // every other slide's audio too in future calls).
        if (sourceNode) {
          try { sourceNode.onended = null; sourceNode.stop(); } catch (e) {}
          sourceNode = null;
        }
        if (subtitleStartedAt) {
          subtitlePauseAt = Date.now();
          subtitleElapsedBeforePause = subtitlePauseAt - subtitleStartedAt;
        }
        clearSubtitleTimers();
      },
      resume: function () {
        paused = false;
        // Pause/resume of TTS playback is treated as cancel + restart at controller level;
        // shared context stays running.
        if (subtitleSchedule && subtitleElapsedBeforePause) {
          scheduleSubtitles(subtitleSchedule.durationMs, subtitleElapsedBeforePause);
        }
      },
      cancel: function () {
        cancelled = true;
        clearSubtitleTimers();
        if (sourceNode) {
          sourceNode.onended = null; // prevent stale callback
          try { sourceNode.stop(); } catch (e) {}
          sourceNode = null;
        }
        // Do NOT close shared playback context — reused across slides
        audioCtx = null;
      }
    };
  }

  /* ══════════════════════════════════════════════════════
     NarrationController — queue-based architecture
     ══════════════════════════════════════════════════════

     slides[]:  Array indexed by slide number.
                Each entry: { text: string|null, audio: ArrayBuffer|null }
     pointer:   Current slide index being played.

     On enter slide N:
       - If slides[N].audio exists → play immediately
       - Else if slides[N].text exists → synthesize audio, then play
       - Else → generate text via LLM, synthesize audio, then play
       - While playing, background-fill N+1, N+2, … (sequential pipeline)

     Navigation (left/right) just moves the pointer.
     Exit clears the queue.
     ══════════════════════════════════════════════════════ */
  function createController(options) {
    var opts = options || {};
    var onSlideComplete = opts.onSlideComplete || function () {};
    var onStateChange = opts.onStateChange || function () {};
    var onSubtitle = opts.onSubtitle || function () {};
    var onError = opts.onError || function () {};
    var onFillProgress = opts.onFillProgress || function () {};

    var state = 'idle';
    var queueId = null;  // article identifier — queue is valid only for this article
    var slides = [];     // queue: [{ text: null, audio: null }, ...]
    var presentSteps = null;
    var totalSlides = 0;
    var pointer = -1;
    var gen = 0;         // generation counter — incremented on every navigate to invalidate stale callbacks
    var currentSpeaker = null;
    var speakTimer = null;
    var fillAbort = null; // AbortController for background fill
    var getLang = function () { return 'zh'; };

    var getEffectiveLang = function () {
      var ss = getSpeechSettings();
      if (ss.lang && ss.lang !== 'auto') return ss.lang;
      return getLang();
    };
    var getSpeechSettings = function () {
      var global = {};
      var article = {};
      var slug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
      try { global = JSON.parse(localStorage.getItem('narration-settings')) || {}; } catch (e) {}
      if (slug) { try { var a = JSON.parse(localStorage.getItem('narration-settings:' + slug)); if (a) { Object.keys(a).forEach(function (k) { if (a[k] !== undefined && a[k] !== '') global[k] = a[k]; }); } } catch (e) {} }
      return global;
    };
    var isLocalTTS = function () {
      var e = getSpeechSettings().ttsEngine;
      return e === 'moss-tts-nano' || e === 'fish-s2';
    };

    function setState(s) { state = s; onStateChange(s); }

    /* ── Stop playback (does not clear queue) ── */
    function stopPlayback() {
      gen++;  // invalidate all stale callbacks FIRST
      if (currentSpeaker) { currentSpeaker.cancel(); currentSpeaker = null; }
      if (speakTimer) { clearTimeout(speakTimer); speakTimer = null; }
      window.speechSynthesis && window.speechSynthesis.cancel();
    }

    function stopFill() {
      if (fillAbort) { fillAbort.abort(); fillAbort = null; }
    }

    function getArticleId() {
      return window.location.pathname.replace(/\/$/, '').split('/').pop() || 'unknown';
    }

    function initQueue(steps) {
      var id = getArticleId();
      if (queueId === id && slides.length === steps.length) return; // reuse
      queueId = id;
      slides = [];
      for (var i = 0; i < steps.length; i++) slides.push({ text: null, audio: null });
    }

    function clearQueue() {
      queueId = null;
      slides = [];
    }

    /* ── Queue helpers ── */

    /** Generate text for slide at `idx` if not yet available. Returns Promise<string>. */
    function ensureText(idx, abortSignal) {
      if (slides[idx] && slides[idx].text !== null) return Promise.resolve(slides[idx].text);
      var step = presentSteps[idx];
      if (!step) return Promise.resolve('');
      var info = extractSlideText(step);
      var lang = getEffectiveLang();
      return generateNarrative(info, idx, totalSlides, lang, abortSignal).then(function (t) {
        slides[idx].text = t || '';
        return slides[idx].text;
      });
    }

    /** Synthesize audio for slide at `idx` if using local TTS and not yet available. Returns Promise. */
    function ensureAudio(idx, abortSignal) {
      if (!isLocalTTS()) return Promise.resolve();
      if (slides[idx] && slides[idx].audio) return Promise.resolve();
      var text = slides[idx] ? slides[idx].text : null;
      if (!text) return Promise.resolve();
      var ss = getSpeechSettings();
      var lang = getEffectiveLang();
      return fetchLocalTTSAudio(text, lang, ss).then(function (buf) {
        slides[idx].audio = buf;
      }).catch(function () {});
    }

    /* ── Background fill pipeline ── */

    /** Count how many slides are fully ready (text + audio if local TTS). */
    function countFilled() {
      var local = isLocalTTS();
      var n = 0;
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].text !== null && (!local || slides[i].audio)) n++;
      }
      return n;
    }

    function reportProgress() {
      onFillProgress(countFilled(), totalSlides, pointer);
    }

    /** Fill slides from `startIdx` onward sequentially. Non-blocking, abortable. */
    function startFill(startIdx) {
      stopFill();
      fillAbort = new AbortController();
      var signal = fillAbort.signal;

      function fillNext(idx) {
        if (signal.aborted) return;
        if (idx >= totalSlides) { reportProgress(); return; }
        ensureText(idx, signal).then(function () {
          if (signal.aborted) return;
          return ensureAudio(idx, signal);
        }).then(function () {
          if (signal.aborted) return;
          reportProgress();
          fillNext(idx + 1);
        }).catch(function () {});
      }
      fillNext(startIdx);
    }

    /* ── Play current pointer ── */

    function playPointer() {
      var idx = pointer;
      var myGen = gen;
      reportProgress();

      if (state === 'idle') return;
      if (idx < 0 || idx >= totalSlides) { setState('idle'); return; }

      var entry = slides[idx];

      // Case 1: audio ready → play
      if (isLocalTTS() && entry.audio) {
        beginSpeak(idx, myGen);
        return;
      }
      // Case 2: text ready but no audio → synthesize then play
      if (entry.text !== null) {
        if (isLocalTTS()) {
          setState('generating');
          var ss = getSpeechSettings();
          fetchLocalTTSAudio(entry.text, getEffectiveLang(), ss).then(function (buf) {
            if (myGen !== gen) return;
            entry.audio = buf;
            beginSpeak(idx, myGen);
          }).catch(function () {
            if (myGen !== gen) return;
            beginSpeak(idx, myGen); // play without prefetched audio
          });
        } else {
          beginSpeak(idx, myGen);
        }
        return;
      }
      // Case 3: nothing → generate text, synthesize, play
      setState('generating');
      ensureText(idx, null).then(function () {
        if (myGen !== gen) return;
        if (isLocalTTS() && entry.text) {
          return ensureAudio(idx, null);
        }
      }).then(function () {
        if (myGen !== gen) return;
        beginSpeak(idx, myGen);
      }).catch(function (err) {
        if (myGen !== gen) return;
        if (err && err.name === 'AbortError') return;
        onError(err);
        setState('playing');
        // Skip after 3s
        speakTimer = setTimeout(function () {
          speakTimer = null;
          if (myGen !== gen) return;
          advance(idx, myGen);
        }, 3000);
      });
    }

    function beginSpeak(idx, myGen) {
      if (myGen !== gen) return;
      if (state === 'idle') return;

      var text = slides[idx].text || '';
      if (!text) { advance(idx, myGen); return; }

      setState('playing');

      // Start background fill from idx+1 onward
      startFill(idx + 1);

      // 1s pause for rhythm, then speak
      speakTimer = setTimeout(function () {
        speakTimer = null;
        if (myGen !== gen || state !== 'playing') return;

        onSubtitle(text);
        var lang = getEffectiveLang();
        var ss = getSpeechSettings();
        var cbs = {
          onChunkStart: function (t) { onSubtitle(t); },
          onEnd: function () {
            currentSpeaker = null;
            if (myGen !== gen) return;
            if (state === 'playing') { onSubtitle(''); advance(idx, myGen); }
          },
          onError: function () {
            currentSpeaker = null;
            if (myGen !== gen) return;
            if (state !== 'idle') { onSubtitle(''); advance(idx, myGen); }
          }
        };

        if (isLocalTTS()) {
          currentSpeaker = speakViaLocalTTS(text, lang, cbs, ss, slides[idx].audio || null);
        } else {
          currentSpeaker = speak(text, lang, cbs, ss);
        }
      }, 1000);
    }

    function advance(idx, myGen) {
      if (myGen !== gen) return;
      if (idx !== pointer) return; // stale callback from a different slide
      if (idx >= totalSlides - 1) { setState('idle'); onSubtitle(''); onSlideComplete('done'); return; }
      pointer = idx + 1;
      onSlideComplete('next', pointer);
      playPointer();
    }

    /* ── Public API ── */
    return {
      /** Start narration from a given slide. */
      start: function (steps, index, langFn) {
        stopPlayback(); stopFill();
        presentSteps = steps; totalSlides = steps.length;
        if (langFn) getLang = langFn;
        initQueue(steps);
        pointer = index;
        setState('generating');
        playPointer();
      },

      /** Pre-generate content for a slide before starting. Returns Promise. */
      pregenerate: function (steps, index, langFn, onProgress) {
        presentSteps = steps; totalSlides = steps.length;
        if (langFn) getLang = langFn;
        initQueue(steps);
        var notify = onProgress || function () {};

        return ensureText(index, null).then(function (text) {
          notify('script-done');
          if (isLocalTTS() && text) {
            return ensureAudio(index, null).then(function () {
              notify('audio-done');
              return text;
            });
          }
          return text;
        }).catch(function () {
          notify('script-done');
          if (isLocalTTS()) notify('audio-done');
          return '';
        });
      },

      /** Navigate to a specific slide (user-driven, e.g. arrow keys). */
      syncToSlide: function (index) {
        if (state === 'idle') return;
        stopPlayback(); // increments gen, cancels speaker + timers
        // Do NOT stopFill — background fill continues to be useful
        pointer = index;
        setState('generating');
        playPointer();
      },

      pause: function () {
        if (state === 'playing' && currentSpeaker) { currentSpeaker.pause(); setState('paused'); }
      },
      resume: function () {
        if (state === 'paused' && currentSpeaker) { currentSpeaker.resume(); setState('playing'); }
      },
      stop: function () { stopPlayback(); stopFill(); clearQueue(); onSubtitle(''); setState('idle'); },
      isActive: function () { return state !== 'idle'; },
      getState: function () { return state; },
      destroy: function () { stopPlayback(); stopFill(); clearQueue(); presentSteps = null; setState('idle'); }
    };
  }

  /* ══════════════════════════════════════════════════════
     Static utility: check if narration is possible
     ══════════════════════════════════════════════════════ */
  function isAvailable() {
    var hasLlm = !!getLlmSettings();
    if (!hasLlm) return false;
    // Available if browser TTS exists OR a local OpenAI-compatible TTS engine is configured
    var hasBrowserTTS = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
    var hasLocalTTS = false;
    try {
      var ns = JSON.parse(localStorage.getItem('narration-settings'));
      if (ns && (ns.ttsEngine === 'moss-tts-nano' || ns.ttsEngine === 'fish-s2')) hasLocalTTS = true;
    } catch (e) {}
    return hasBrowserTTS || hasLocalTTS;
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
    getVoiceList: getVoiceList,
    getTtsAudioStream: getRecordingStream
  };
})();

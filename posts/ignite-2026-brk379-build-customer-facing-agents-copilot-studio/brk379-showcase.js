/* posts/ignite-2026-brk379-build-customer-facing-agents-copilot-studio/brk379-showcase.js */
(function () {
  'use strict';

  var CHAPTER_GROUPS = [
    {
      id: 'arch',
      tabZh: '00:00 架构主旨 (Omar Aftab)',
      tabEn: '00:00 Architecture (Omar Aftab)',
      code: 'BRK379 · Part 1 · 00:00–10:15',
      titleZh: '为什么构建专属 Customer Conversation Harness 与联络中心协同底座',
      titleEn: 'Why Microsoft Built the Dedicated Customer Conversation Harness & CCI',
      speakersZh: 'Omar Aftab (VP, Conversational AI & Contact Center Intelligence)',
      speakersEn: 'Omar Aftab (VP, Conversational AI & Contact Center Intelligence)',
      summaryZh: '剖析传统按键式语音导航与孤立网页机器人的断层痛点，发布正式商用的多智能体全渠道底座、声纹核验防线、Microsoft AI Realtime 1 语音模型及零改造联络中心交接方案。',
      summaryEn: 'Breaks down legacy IVR friction and unveils the GA multi-agent omnichannel harness, voice biometrics, Microsoft AI Realtime 1 speech model, and drop-in contact center handoff.',
      itemsZh: [
        { ts: '00:00:45', text: '市场拐点：2028 年至少 70% 客户旅程始于对话式 AI，旧式按键菜单难以为继' },
        { ts: '00:03:03', text: '专职子智能体团队：主控接待加信用卡、按揭与 Foundry 代理同画布协同' },
        { ts: '00:04:30', text: '原生语音与跨通记忆：隧道掉线重拨自动续接上下文，支持直接申领 Teams 号码' },
        { ts: '00:06:04', text: '混合推理与声纹防伪：混编生成式技能与合规确定性话题，原生拦截录音与合成语音' }
      ],
      itemsEn: [
        { ts: '00:00:45', text: 'Market Shift: At least 70% of customer journeys start with conversational AI by 2028' },
        { ts: '00:03:03', text: 'Specialist Sub-Agents: Primary concierge orchestrates credit, mortgage & Foundry agents' },
        { ts: '00:04:30', text: 'Voice-Native & Memory: Resumes dropped tunnel calls seamlessly and acquires Teams numbers' },
        { ts: '00:06:04', text: 'Hybrid Reasoning & Voice Auth: Mixes generative skills with topics; blocks synthetic spoofing' }
      ]
    },
    {
      id: 'demo',
      tabZh: '10:15 7.5分钟实机改造 (Jason Xian)',
      tabEn: '10:15 7.5-Min Live Demo (Jason Xian)',
      code: 'BRK379 · Part 2 · 10:15–32:30',
      titleZh: 'Contoso Bank 7.5 分钟现场改造：从死锁按键语音到 Avaya 全链路贯通',
      titleEn: 'Contoso Bank 7.5-Min Live Build: From Rigid IVR to Full Avaya Escalation',
      speakersZh: 'Jason Xian (Principal PM) & Omar Aftab (Live Spoofing Test)',
      speakersEn: 'Jason Xian (Principal PM) & Omar Aftab (Live Spoofing Test)',
      summaryZh: '现场用一句自然语言拉起支票、信用卡与按揭三大子智能体，串联跨底座工作流与 Foundry 账单分析，配置 Harper 多语种音色并实测声纹拦截冒名转账与 Avaya 坐席接管。',
      summaryEn: 'Generates checking, credit card, and mortgage sub-agents from one prompt, wires Studio workflows and Foundry analytics, configures Harper voice fonts, and blocks live caller spoofing into Avaya.',
      itemsZh: [
        { ts: '00:11:45', text: '自然语言拉起多智能体：自动拆分支票、信用卡（$495 年费贵宾厅推荐）与按揭子代理' },
        { ts: '00:15:10', text: '跨底座资产复用：挂载已有余额查询工作流与 Azure AI Foundry 交易穿透代理（$68 余额溯源）' },
        { ts: '00:19:45', text: '零代码接入 Avaya：粘贴端点保留原有队列与号码，实测掉线重拨记忆与意大利语无缝切换' },
        { ts: '00:26:15', text: '舞台冒名攻防与质量评分：Omar 借手机冒充转账被声纹当场识破转人工，CCI 自动输出会话评分' }
      ],
      itemsEn: [
        { ts: '00:11:45', text: 'Prompt-to-Team: Auto-scaffolds checking, credit card ($495 lounge card), and mortgage sub-agents' },
        { ts: '00:15:10', text: 'Cross-Harness Reuse: Wires existing balance workflow and Foundry transaction analyzer ($68 trace)' },
        { ts: '00:19:45', text: 'Zero-Code Avaya Link: Keeps existing queues/numbers; verifies call-drop memory & Italian switch' },
        { ts: '00:26:15', text: 'Live Spoof Block & Scoring: Blocks Omar impersonation into Avaya live transcript + CCI quality score' }
      ]
    },
    {
      id: 'publix',
      tabZh: '32:45 Publix 生产案例 (Chris Povolish)',
      tabEn: '32:45 Publix Case Study (Chris Povolish)',
      code: 'BRK379 · Part 3 · 32:45–42:50',
      titleZh: '财富 500 强第 72 位 Publix：34 座联络中心与月均 20 万通电话演进实录',
      titleEn: 'Fortune #72 Publix Super Markets: Scaling Across 34 Contact Centers & 200K+ Monthly Calls',
      speakersZh: 'Chris Povolish (Sr. Manager of IT — Collaboration, AI, and Data Services, Publix)',
      speakersEn: 'Chris Povolish (Sr. Manager of IT — Collaboration, AI, and Data Services, Publix)',
      summaryZh: '复盘拥有 1,453 家门店、超 26 万名员工与 627 亿美元年零售额的 Publix 如何从旧版声明式技术支持语音代理升级至支持随时打断、共享技能与自动评测的员工服务实时语音助手 Sage。',
      summaryEn: 'Details how Publix (1,453 stores, 260,000+ associates, $62.7B sales) evolved from rigid classic voice flows to Sage, a real-time Associate Services agent across payroll, stock, retirement, and benefits.',
      itemsZh: [
        { ts: '00:33:05', text: '业务底盘：全美最大员工持股企业，34 个联络中心约 800 名坐席月均承接超 20 万通来电' },
        { ts: '00:35:05', text: '旧版声明式瓶颈：虽完成技术支持中心上线并抗住门店重大故障洪峰，但无法打断换题且响应偏慢' },
        { ts: '00:37:10', text: '六大实战收益：双态共享变量、节省上下文窗口的跨代理共享技能、实时语音活动图与自动评测集' },
        { ts: '00:39:25', text: 'Sage 实时语音实录：统一承接薪资、股东服务、退休金与福利咨询，12 月 9 日正式投产上线' }
      ],
      itemsEn: [
        { ts: '00:33:05', text: 'Enterprise Scale: Largest US employee-owned firm; 34 centers & ~800 reps handling 200K+ calls/mo' },
        { ts: '00:35:05', text: 'Classic Voice Limits: Handled major store incidents in Tech Support, but lacked barge-in & agility' },
        { ts: '00:37:10', text: 'Six Key Wins: Shared variables, token-saving shared skills, live voice activity map & auto evals' },
        { ts: '00:39:25', text: 'Live Sage Call Demo: Unifies payroll, stockholder, retirement & PTO inquiries ahead of Dec 9 launch' }
      ]
    }
  ];

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856630856001Eccy-1791814920810001CGXz';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/724b5fa5-2c1d-41bb-a265-970a7c3481b9';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/724b5fa5-2c1d-41bb-a265-970a7c3481b9';
  var POSTER_SRC = './media/brk379-session-thumb.jpg';

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk379-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk379-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var group = CHAPTER_GROUPS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk379-theater-tabs';

      for (i = 0; i < CHAPTER_GROUPS.length; i++) {
        (function (idx) {
          var g = CHAPTER_GROUPS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk379-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? g.tabEn : g.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var items = en ? group.itemsEn : group.itemsZh;
      var liHtml = '';
      for (i = 0; i < items.length; i++) {
        liHtml += '<li><span class="brk379-chapter-time">' + items[i].ts + '</span>' + items[i].text + '</li>';
      }

      var mediaLeftHtml = playerMounted
        ? '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRK379 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + POSTER_SRC + '" alt="Microsoft Ignite 2026 BRK379 Official Thumbnail" loading="lazy" />',
            '<div class="brk379-poster-overlay">',
            '  <button type="button" class="brk379-play-trigger" data-mount-brk379-player="1">' +
              (en ? '▶ Load Embedded Medius Stream (45 min)' : '▶ 在页内加载官方 Medius 点播流（45 分钟）') +
              '</button>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk379-theater-layout">',
        '  <div class="brk379-player-shell">',
        mediaLeftHtml,
        '  </div>',
        '  <div class="brk379-theater-meta">',
        '    <span class="brk379-theater-code">' + group.code + '</span>',
        '    <h4 class="brk379-theater-title">' + (en ? group.titleEn : group.titleZh) + '</h4>',
        '    <div class="brk379-theater-speakers">' + (en ? group.speakersEn : group.speakersZh) + '</div>',
        '    <p class="brk379-theater-summary">' + (en ? group.summaryEn : group.summaryZh) + '</p>',
        '    <ul class="brk379-chapter-list">' + liHtml + '</ul>',
        '    <div class="brk379-theater-actions">',
        '      <a class="brk379-theater-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk379-theater-btn" href="' + SLIDES_URL + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk379-theater-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK379 Page' : '↗ 访问 Ignite 专场页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-mount-brk379-player="1"]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          playerMounted = true;
          render();
        });
      }
    }

    render();

    var observer = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        if (mutations[m].attributeName === 'lang') {
          render();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheater);
  } else {
    initTheater();
  }
})();

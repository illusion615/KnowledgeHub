/* posts/ignite-2026-brk264-pick-right-harness-build-agents-copilot/brk264-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856613195001Eigo-1791588173931001C2oW',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/840f0781-2aae-4992-a99e-1c0e984a71c0',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/840f0781-2aae-4992-a99e-1c0e984a71c0',
    poster: './media/brk264-session-poster.jpg',
    speakerZh: '讲者：Alice Appleton · Jennifer Ratten (NFP) · Jason Xian · 44m42s 实录',
    speakerEn: 'Speakers: Alice Appleton · Jennifer Ratten (NFP) · Jason Xian · 44m42s Recording'
  };

  var ACTS = [
    {
      id: 'act1',
      code: 'BRK264 · ACT 1 (00:00 – 12:55)',
      tabZh: '第一幕：三底座格局与离线评测',
      tabEn: 'Act 1: Three Harnesses & Evals',
      titleZh: '为什么 Copilot Studio 提供三套底座：从 2023 窄提示到 87% 点数降幅',
      titleEn: 'Why Copilot Studio Offers Three Harnesses: From 2023 Chat Scaffolding to −87% Credits',
      summaryZh: 'Alice Appleton 梳理三大执行底座的分工边界，揭示为什么在 Standard 底座上换强模型通过率仅动 0.2 pts，而换用 Microsoft Copilot 底座在 Opus 4.8 上实现 2.4x 任务完成率与 87% 点数节省（308 降至 40 点数）。',
      summaryEn: 'Alice Appleton maps the three harnesses and proves why upgrading models on Standard moves pass rates just 0.2 pts, whereas switching to the Microsoft Copilot harness lifts Anthropic pass rates +22.1 pts and cuts Opus 4.8 credit spend by 87% (308 to 40 credits).',
      cuesZh: [
        '00:01:52 — AI 价值三支柱定位：个人生产力（Cowork）、软件产品（GitHub Copilot）与可重复业务流程（Copilot Studio）',
        '00:04:33 — 三大底座全景：Microsoft Copilot 底座、客户对话底座（Customer Conversation）与延续性标准底座（Standard）',
        '00:08:28 — Sonnet 4.6 离线对比：代码分析涨 47.5 pts、文件分析涨 28.2 pts，输入词元从 47.8K 降至 26.5K（−45%）',
        '00:09:52 — 归因拆解：Standard 底座换模型仅波动 0.2 pts；换用新底座让 OpenAI 涨 10.8 pts、Anthropic 涨 22.1 pts',
        '00:12:01 — 300+ 企业任务（Claude Opus 4.8）：通过率从 22.9% 跃升至 54.6%（2.4x），单会话点数从 308 骤降至 40（−87%）'
      ],
      cuesEn: [
        '00:01:52 — Three AI value pillars: Personal Productivity, Products/Services, and Repeatable Business Processes',
        '00:04:33 — Three-harness picker: Microsoft Copilot, Customer Conversation (GA), and Standard for continuity',
        '00:08:28 — Sonnet 4.6 benchmarks: +47.5 pts code analysis, +28.2 pts file analysis, −45% input tokens (47.8K → 26.5K)',
        '00:09:52 — What moves pass rate: model swap on Standard yields 0.2 pts vs. +10.8 pts (OpenAI) and +22.1 pts (Anthropic) on new harness',
        '00:12:01 — 300+ Opus 4.8 tasks: 2.4x tasks completed (54.6% vs. 22.9%) and −87% credits per conversation (308 → 40)'
      ]
    },
    {
      id: 'act2',
      code: 'BRK264 · ACT 2 (12:56 – 20:46)',
      tabZh: '第二幕：投顾穿透实机演示',
      tabEn: 'Act 2: Wealth Advisor Demo',
      titleZh: '实机演示：Northwind 财富顾问智能体基金穿透核查，单次运行仅 87.91 点数（<$1）',
      titleEn: 'Live Demo: Northwind Financial Insights Agent Fund Look-Through for 87.91 Credits (<$1)',
      summaryZh: '展示如何用简洁目标指令、Markdown 邮件模板技能、Morningstar MCP 与人工审批确定性工作流组装财富顾问智能体：自主穿透指数基金前十大持仓揪出 MSFT（9.48%）与 NVDA（10.68%）超标敞口，全程耗时短且花费不足 1 美元。',
      summaryEn: 'Demonstrates goal-oriented instructions, on-demand Markdown email skills, Morningstar MCP, and human-approval workflows: autonomously computing fund look-through exposure for MSFT (9.48% vs. 5% cap) and NVDA (10.68% vs. 10% cap) for 87.91 credits (under $1).',
      cuesZh: [
        '00:13:55 — 告别连篇累牍的死板步骤提示词：只声明业务目标与核心准则，模型路由交由 Auto 自动选优',
        '00:15:05 — 模块化技能（Skill）与工具链：按需加载品牌邮件 Markdown 模板，仅信任 Morningstar MCP 实时金融数据',
        '00:16:24 — 并非万物皆需纯智能体：挂载“发送客户邮件前必须获顾问审批”的确定性工作流（支持左右/上下双视图）',
        '00:19:00 — 自主基金穿透（Look-through）：客户 LAMBERT233（$1.94M 组合）检出 MSFT 总敞口 9.48%（超 5% 红线 $87,065.93）及 NVDA 10.68%',
        '00:20:23 — 成本实测闭环：当场跑完多工具检索、穿透计算与三表合规建议信，账单仅消耗 87.91 Copilot 点数（不到 1 美元）'
      ],
      cuesEn: [
        '00:13:55 — Goal-first instructions + Auto model selection instead of multi-page procedural prompt scripts',
        '00:15:05 — Scoped Markdown email template skill + trusted Morningstar MCP server to prevent web hallucination',
        '00:16:24 — Pairing non-deterministic judgment with a deterministic "Send Client Email with Approval" workflow',
        '00:19:00 — Autonomous index-fund look-through on $1.94M account LAMBERT233 flags 9.48% MSFT and 10.68% NVDA exposure',
        '00:20:23 — End-to-end live run completes for 87.91 Copilot credits—well under $1'
      ]
    },
    {
      id: 'act3',
      code: 'BRK264 · ACT 3 (20:47 – 32:20)',
      tabZh: '第三幕：NFP 医保单据实战',
      tabEn: 'Act 3: NFP Medicare Case',
      titleZh: '客户实战：NFP 用“广域推理、窄域行动”自动化 4 大区域 20+ 版式医保申请单',
      titleEn: 'Customer Case: NFP Automates 20+ Carrier Formats & 39 CRM Fields ("Reason Broadly, Act Narrowly")',
      summaryZh: 'NFP 应用工程副总裁 Jennifer Ratten 复盘如何用限时遥测模型化解数千名创作者对按量计费的顾虑，并落地无头事件驱动的医保与个人健康险申请单处理智能体，单技能适配 20 余种承保商手写/机打 PDF 并精准填入 39 个 CRM 字段。',
      summaryEn: 'NFP VP of Application Engineering Jennifer Ratten explains replacing consumption-pricing fear with time-bound telemetry, then details an event-driven Medicare intake agent extracting 39 CRM fields across 20+ handwritten/typed carrier PDFs.',
      cuesZh: [
        '00:22:47 — 全员线下实训与治理转型：2025 年起普及创作者赋能，用限时遥测数据模型取代对“按量计费失控”的空想焦虑',
        '00:25:41 — 业务痛点：美加英爱及 4 大联邦区域涌入超 20 种版式（含手写与机打）医保 PDF，人工逐份重敲 39 个 CRM 字段',
        '00:28:14 — 核心架构格言“广域推理，窄域行动”：SharePoint 入库 → Power Automate 触发 → 39 字段提取技能 → 校验门禁 → 单一审批流写回 CRM',
        '00:29:35 — 自动化重复劳动而非人类判断：低置信度异常自动路由人工复核，全量落盘关联 ID、延迟、重试、模型与点数遥测',
        '00:30:51 — 为什么非新底座不可：无需为每家承保商维护条件分支流，模块化技能降低点数开销并让业务一线人员快速交付'
      ],
      cuesEn: [
        '00:22:47 — Replacing worst-case consumption fear among thousands of makers with time-bound telemetry governance',
        '00:25:41 — Bottleneck: manual PDF re-keying of 39 CRM fields across 20+ handwritten/typed carrier formats in 4 regions',
        '00:28:14 — "Reasons broadly, acts narrowly": SharePoint → Power Automate → 39-field skill → Validation gate → One approved CRM flow',
        '00:29:35 — Automating repetition while routing low-confidence outliers to humans with full correlation & credit logs',
        '00:30:51 — Practical impact: zero per-carrier conditional branching, modular credit savings, and faster maker delivery'
      ]
    },
    {
      id: 'act4',
      code: 'BRK264 · ACT 4 (32:21 – 44:42)',
      tabZh: '第四幕：客户对话底座与 CCI',
      tabEn: 'Act 4: Customer Conversation & CCI',
      titleZh: '何时不选 Copilot 底座：面向超低延迟全渠道语音与联络中心的客户对话底座（现已 GA）',
      titleEn: 'When Not to Use Copilot Harness: Customer Conversation Harness & Contact Center Intelligence (GA)',
      summaryZh: 'Jason Xian 揭晓专为外部客户实时交互打造的 Customer Conversation 底座与同日 GA 的 Microsoft Contact Center Intelligence（CCI）：原生集成超低延迟语音模型、单画布多子代理、经典 Topics 兼容以及来电声纹免密核身。',
      summaryEn: 'Jason Xian unveils the GA Customer Conversation harness and Microsoft Contact Center Intelligence (CCI): native ultra-low-latency voice, single-canvas sub-agents, classic Topics support, and caller ID + voice biometric authentication.',
      cuesZh: [
        '00:32:29 — 明确边界：长程推理底座不针对毫秒级实时语音优化；对外客服热线、IVR 与官网微件应选 Customer Conversation 底座',
        '00:34:22 — 单画布多子智能体 + 跨代兼容：一处编排房贷、信用卡、支票账户专员，同时支持生成式技能、工作流与经典 MCS Topics',
        '00:35:33 — Microsoft Contact Center Intelligence（CCI）正式商用：免改路由队列直连 Genesys、Avaya、Five9、Cisco，内置声纹认证与后台质检打分',
        '00:39:14 — Contoso 银行双模态实测：语音推荐 $495 年费 Horizon Reserve 卡、官网渲染自适应申卡卡片、电话端声纹核身秒查 $68 余额',
        '00:42:20 — 全球多区域 GA（美/欧/澳/英/加/亚/瑞士/阿联酋）与统一企业级底座收官：同一套 ALM、DLP、审计日志与支出管控'
      ],
      cuesEn: [
        '00:32:29 — Clear boundary: pick Customer Conversation harness for external omnichannel voice, IVR, web chat, and Teams Phone',
        '00:34:22 — Single-canvas multi-agent architecture supporting generative skills, workflows, persistent memory, and classic Topics',
        '00:35:33 — Microsoft Contact Center Intelligence (GA): plug into Genesys, Avaya, Five9 & Cisco with voice biometrics & QA scoring',
        '00:39:14 — Contoso Bank demo: $495 Horizon Reserve voice pitch, web adaptive card, and voice-authenticated $68 balance lookup',
        '00:42:20 — Global GA rollout across 8+ regions backed by unified ALM, Purview DLP, audit logs, and spend management'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk264Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk264-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk264-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var item = ACTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk264-tabs';

      for (i = 0; i < ACTS.length; i++) {
        (function (idx) {
          var act = ACTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk264-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? act.tabEn : act.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var cues = en ? item.cuesEn : item.cuesZh;
      var liHtml = '';
      for (i = 0; i < cues.length; i++) {
        liHtml += '<li>' + cues[i] + '</li>';
      }

      var mediaInnerHtml = playerMounted
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK264 Official Video Player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRK264 Official Session Poster" loading="lazy" />',
            '<button type="button" class="brk264-play-overlay" data-mount-brk264-player="1">',
            '  <span class="brk264-play-circle" aria-hidden="true">&#9654;</span>',
            '  <span class="brk264-play-caption">' + (en ? 'Click to Load Official Medius On-Demand Stream' : '点击在页内加载微软官方 Medius 点播流') + '</span>',
            '</button>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk264-theater-layout">',
        '  <div class="brk264-player-wrap">',
        '    ' + mediaInnerHtml,
        '  </div>',
        '  <div class="brk264-meta">',
        '    <span class="brk264-code">' + item.code + '</span>',
        '    <h4 class="brk264-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk264-speaker">' + (en ? SESSION_META.speakerEn : SESSION_META.speakerZh) + '</div>',
        '    <p class="brk264-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk264-cues">' + liHtml + '</ul>',
        '    <div class="brk264-actions">',
        '      <a class="brk264-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk264-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk264-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK264 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-mount-brk264-player]');
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
    document.addEventListener('DOMContentLoaded', initBrk264Theater);
  } else {
    initBrk264Theater();
  }
})();

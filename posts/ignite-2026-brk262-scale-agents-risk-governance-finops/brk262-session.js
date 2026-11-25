/* posts/ignite-2026-brk262-scale-agents-risk-governance-finops/brk262-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-brk262-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/eb1012b8-4ac4-4a62-a5dc-f09b915b8886',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612903001EK5O-1791588157241001CqrV',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/eb1012b8-4ac4-4a62-a5dc-f09b915b8886',
    speakersZh: 'Graham Mosley & Thomas Zou（微软智能体治理团队）· 特邀嘉宾 Andrew Gaskins（Lumen 首席架构师）',
    speakersEn: 'Graham Mosley & Thomas Zou (Microsoft) · Guest Speaker Andrew Gaskins (Principal Solution Architect, Lumen)'
  };

  var CHAPTERS = [
    {
      id: 'act1',
      time: '00:00:55 – 00:06:55',
      tabZh: '00:55 分层治理与五角色七问',
      tabEn: '00:55 Layered Model & 7 JTBD',
      titleZh: '第一幕：能力越强护栏越深——五类管理员分工与七大核心治理考题',
      titleEn: 'Act 1: Capability-Driven Guardrails, Five IT Roles & Seven Admin Questions',
      summaryZh: 'Thomas Zou 与 Graham Mosley 拆解从文档问答、外部工具连接到独立员工身份智能体的风险跃迁，明确 Power Platform、Entra、Purview、Defender 与 AI 管理员五方协同边界。',
      summaryEn: 'Thomas Zou and Graham Mosley trace risk escalation from simple RAG chat to tool-using and dedicated Agent User ID agents, mapping duties across Power Platform, Entra, Purview, Defender, and AI admins.',
      bulletsZh: [
        '00:02:35 — 智能体获得独立邮箱、日历与事件触发器后，IT 必须锁定其数据访问范围与故障爆炸半径',
        '00:03:34 — 全生命周期三段式接力：环境路由构建、身份与合规基线注入、上线后跨生态观测与威胁拦截',
        '00:05:38 — 将笼统的 IT 团队拆解为五类专职管理员角色，凝练覆盖创作者赋能、运行观测与成本核算的七大必答题'
      ],
      bulletsEn: [
        '00:02:35 — Once agents gain dedicated inboxes, calendars, and triggers, IT must bound their blast radius',
        '00:03:34 — Three-stage lifecycle handoff: PPAC environment routing, Entra/Purview baselines, and runtime threat defense',
        '00:05:38 — Unpacks IT into five admin personas answering seven concrete governance and FinOps questions'
      ]
    },
    {
      id: 'act2',
      time: '00:06:56 – 00:14:15',
      tabZh: '06:56 Demo 1&2 插件看板与 A365',
      tabEn: '06:56 Demos 1&2 Plugin & A365',
      titleZh: '第二幕实机演示：15 分钟生成托管治理看板 + Agent 365 跨云拓扑与价值核算',
      titleEn: 'Act 2 Demos: 15-Min Custom Admin Dashboard & Agent 365 Cross-Cloud ROI Map',
      summaryZh: '现场演示用自然语言插件秒查十大环境并导出高管汇报草稿，通过两页提示词在 15 分钟内构建托管监控应用；随后切入 Microsoft 365 管理中心审查跨平台智能体拓扑与工时价值。',
      summaryEn: 'Live walkthrough querying top 10 environments via the Power Platform Admin plugin, building a custom CMR dashboard in 15 minutes from a 2-page prompt, and auditing cross-cloud agents and wage-based ROI in Agent 365.',
      bulletsZh: [
        '00:07:18 — 调用内置本体的管理员插件直接查出前十大环境，自动生成可交付管理层的 80% 完成度高管摘要',
        '00:08:18 — 输入两页 Markdown 提示词调用 Admin V2 连接器，15 分钟生成免管理员权限即可安全阅览的托管看板',
        '00:10:19 — 在 Agent 365 统一纳管微软及 AWS、Salesforce、ServiceNow 智能体，按岗位时薪微调招聘简报等用例产出'
      ],
      bulletsEn: [
        '00:07:18 — Queries top 10 environments via natural-language ontology and drafts an 80%-ready executive brief',
        '00:08:18 — Feeds a 2-page Markdown prompt over Admin V2 connector to ship a shareable CMR dashboard in 15 minutes',
        '00:10:19 — Audits Microsoft, AWS, Salesforce, and ServiceNow agents in Agent 365 with wage-tuned ROI tracking'
      ]
    },
    {
      id: 'maker-ppac',
      time: '00:14:16 – 00:23:02',
      tabZh: '14:16 Demo 3 创作者透视与四维 API',
      tabEn: '14:16 Demo 3 Maker Vis & 4D API',
      titleZh: '第三幕上篇：Contoso HR 创作者实时点数透视、预扣陷阱与四维报表接口公测',
      titleEn: 'Act 3 Part 1: Contoso HR Maker Credit Visibility, Allocation Nuance & 4D Reporting API',
      summaryZh: '演示创作者在预览聊天、四组评测集与运行监控中自查点数消耗及下沉安全告警；剖析旧版静态预扣挤占协同画布额度的症结，并宣布四维日粒度报表接口开启公测。',
      summaryEn: 'Shows makers tracking live preview burn, 4-eval-set credit totals, and floated security warnings on a Contoso HR agent; explains why static allocations starve Cowork and launches the 4D daily Reporting API.',
      bulletsZh: [
        '00:16:34 — Contoso HR 智能体预览对话实时回显点数消耗，并逐一核算四套评测集得分与运行账单',
        '00:20:59 — 揭示静态预扣痛点：双控制台互不通气导致环境闲置预扣锁死总池，迫使架构全面转向扁平限额',
        '00:22:06 — 宣布报表接口开放公测：按用户、智能体、功能与自然日四维切片精准定位违规调用重型模型的行为'
      ],
      bulletsEn: [
        '00:16:34 — Contoso HR preview chat displays live credit burn alongside per-eval-set scores and runtime monitor logs',
        '00:20:59 — Explains why static PPAC allocations lock up shared tenant pools and starve Cowork, driving flat limits',
        '00:22:06 — Announces Public Preview of PPAC Reporting API slicing spend by User, Agent, Feature, and Day'
      ]
    },
    {
      id: 'lumen',
      time: '00:23:03 – 00:32:20',
      tabZh: '23:03 双域模型与 Lumen 客户实战',
      tabEn: '23:03 Dual Scopes & Lumen Case',
      titleZh: '第三幕中篇：AskHR 资源兜底 vs. 个人定额，以及 Lumen 规模化治理实录',
      titleEn: 'Act 3 Part 2: AskHR Resource Shielding vs. Identity Pools & Lumen Production Architecture',
      summaryZh: '对比全员人事助手专款兜底与部门团队弹性定额两类场景；Lumen 首席解决方案架构师 Andrew Gaskins 登台分享个人开发环境孵化、超 10 人晋升机制与 80% 月度预警实践。',
      summaryEn: 'Contrasts resource-scoped AskHR protection against identity-scoped maker budgets, followed by Lumen Principal Solution Architect Andrew Gaskins sharing PDE incubation, >10-user promotion gates, and 80% spend alerts.',
      bulletsZh: [
        '00:26:17 — AskHR 生产兜底铁律：即便员工周末写代码耗尽个人月度额度，周一仍须正常提交人事休假或工单',
        '00:28:15 — Lumen 环境分层：新创作者默认落入受连接器策略保护的个人开发环境，分享突破 10 人即启动晋升评估',
        '00:30:42 — 副总裁级月度预算审批配合 80% 消耗阈值预警，既防账单失控又避免粗暴关停关键业务流'
      ],
      bulletsEn: [
        '00:26:17 — AskHR rule: weekend vibe-coding exhausting personal credits must never block Monday HR incident filings',
        '00:28:15 — Lumen routing: makers start in connector-guarded PDEs; sharing past 10 users triggers promotion intake',
        '00:30:42 — VP-approved monthly PayGo budgets pair with 80% threshold alerts instead of abrupt mid-month shutoffs'
      ]
    },
    {
      id: 'demo4-move',
      time: '00:32:21 – 00:45:30',
      tabZh: '32:21 Demo 4 人机竞速与五步迁移',
      tabEn: '32:21 Demo 4 YOLO Race & 5 Steps',
      titleZh: '第三幕下篇与问答：PowerShell 智能体秒建 20,000 点数策略及五步迁移路线',
      titleEn: 'Act 3 Part 3 & Q&A: Agentic 20,000-Credit Policy Creation Race & Five-Step Migration',
      summaryZh: 'Graham 现场与语音驱动的智能体竞速创建花费策略——智能体读取表格与文档自动拉起脚本建好 20,000 点数安全组限额并开麦播报；最后总结三大升级收益、五步迁移法与优先级问答。',
      summaryEn: 'Graham races an audio-prompted Copilot agent that spins up PowerShell from Excel + Markdown to create a 20,000-credit security-group policy and announces completion over stage speakers, closing with the 5-step migration plan and Q&A.',
      bulletsZh: [
        '00:33:51 — 现场开启免确认竞速：智能体调创建策略接口在纽约时间 12:34 建好 20,000 点数策略并插话打断人工演示',
        '00:36:45 — 统一封顶规则：首次支持对按量计费设硬上限；同时勾选预付包与按量计费时优先扣尽预付容量包再平滑结转',
        '00:41:04 — 现场问答明确优先级：新管理中心策略优先于旧控制台扣费，且根治旧版新智能体需空跑一天才能设限的盲区'
      ],
      bulletsEn: [
        '00:33:51 — YOLO-mode race: Copilot reads Excel + Markdown, runs Create Policy API via PowerShell for 20,000 credits, and speaks up live',
        '00:36:45 — Unified hard caps on PayGo; checking both billing plans consumes Capacity Packs first before PayGo rollover',
        '00:41:04 — Live Q&A confirms MAC policies take precedence over PPAC and enforce default caps from minute zero'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk262Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk262-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk262-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk262-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk262-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var bullets = en ? item.bulletsEn : item.bulletsZh;
      var liHtml = '';
      for (i = 0; i < bullets.length; i++) {
        liHtml += '<li>' + bullets[i] + '</li>';
      }

      var mediaInner = playerLoaded
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK262 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK262 Scale agents, not risk official session cover" loading="lazy" />' +
          '<button type="button" class="brk262-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk262-play-pill">' + (en ? '▶ Load Official Video Player (45 min)' : '▶ 点击加载官方内嵌点播流（45 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk262-theater-layout">',
        '  <div class="brk262-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk262-meta">',
        '    <span class="brk262-code">BRK262 · ' + item.time + '</span>',
        '    <h4 class="brk262-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk262-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk262-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk262-highlights">' + liHtml + '</ul>',
        '    <div class="brk262-actions">',
        '      <a class="brk262-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk262-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk262-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK262 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var loadBtn = stage.querySelector('[data-load-embed="1"]');
      if (loadBtn) {
        loadBtn.addEventListener('click', function () {
          playerLoaded = true;
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
    document.addEventListener('DOMContentLoaded', initBrk262Theater);
  } else {
    initBrk262Theater();
  }
})();

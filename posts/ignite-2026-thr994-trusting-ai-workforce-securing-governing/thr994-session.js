/* posts/ignite-2026-thr994-trusting-ai-workforce-securing-governing/thr994-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr994-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/7b98f53c-b97c-436c-8f9e-c72038f4235f',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856596851001EQ5i-1791588293983001Ce5A',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/7b98f53c-b97c-436c-8f9e-c72038f4235f',
    speakersZh: 'Sasha Kranjac（Microsoft Regional Director & Security MVP · Kloudatech 创始人）',
    speakersEn: 'Sasha Kranjac (Microsoft Regional Director & Security MVP · Founder, Kloudatech)'
  };

  var CHAPTERS = [
    {
      id: 'questions',
      time: '00:01:00 – 00:04:08',
      tabZh: '01:00 四大拷问与七步路径',
      tabEn: '01:00 4 Questions & 7 Steps',
      titleZh: '智能体四大安全拷问、OWASP 风险映射与七步演进蓝图',
      titleEn: 'Four Burning Questions, OWASP Agentic Top 10 & Seven-Step Blueprint',
      summaryZh: 'Sasha Kranjac 剖析可见性、权限归属、过度共享与运行安全四大企业盲区，映射 OWASP 2026 智能体前三大风险（ASI01–03），并提出经四大控制面淬炼可信智能体的七步路径。',
      summaryEn: 'Sasha Kranjac frames Visibility, Privileges, Oversharing, and Safety against OWASP Agentic Top 10 (ASI01–03) and outlines the seven-step journey across four Microsoft control planes.',
      bulletsZh: [
        '00:01:08 — 四大核心追问：组织内有 1 个还是 10,000 个智能体？谁是人类责任人？过度共享暴露了什么？',
        '00:01:47 — 阐明过度共享并非 AI 原罪，而是智能体将潜藏多年的 SharePoint 宽泛权限技术债集中放大',
        '00:02:40 — 定义 Bontoso 七步闭环：构建 → 身份标识 → 摸清权限 → 数据保护 → 风险检测 → 全域治理 → 建立信任'
      ],
      bulletsEn: [
        '00:01:08 — Four urgent questions: fleet count (1 vs. 10,000), human accountability, oversharing, and goal hijack',
        '00:01:47 — Identifies oversharing as legacy technical debt newly spotlighted by enterprise AI agents',
        '00:02:40 — Maps the 7-step Bontoso journey: Create, Identify, Understand Access, Protect Data, Detect Risk, Govern, Trust'
      ]
    },
    {
      id: 'entra',
      time: '00:04:09 – 00:11:25',
      tabZh: '04:09 薪酬泄漏与 Entra 身份',
      tabEn: '04:09 Salary Leak & Entra ID',
      titleZh: 'Bontoso 2027 薪酬职级暴露复现与 Microsoft Entra 专属身份隔离',
      titleEn: 'Bontoso 2027 Salary Band Exposure & Microsoft Entra Agent Identity',
      summaryZh: '演示员工 Mickey 通过 Bontoso HR Helper Standard 直接问出高度机密的 2027 年薪酬职级方案；切入 Copilot Studio 与 Entra 管理中心拆解专属智能体身份、人类责任人（Sponsor）与登录日志。',
      summaryEn: 'Demonstrates employee Mickey querying proposed 2027 salary bands from an overshared HR Hub, then inspects the dedicated Entra Agent ID, human sponsor A-Minnie Bontoso, and 7-day agent sign-in logs.',
      bulletsZh: [
        '00:05:43 — Mickey 在对话流询问薪酬标准，智能体从 Everyone 可读的 SharePoint 库返回高度机密 2027 薪酬表',
        '00:07:02 — 核验智能体元数据：自创建起自动签发独立 Entra Agent ID（6a641622-...），与员工个人账号严格解耦',
        '00:09:14 — 在 Entra 查看人类责任人（Sponsor）与 24 小时/7 天独立登录日志，防止员工离职产生无主孤儿智能体'
      ],
      bulletsEn: [
        '00:05:43 — Mickey queries salary bands; the HR agent surfaces Highly Confidential 2027 figures from an overshared library',
        '00:07:02 — Inspects Copilot Studio & Entra metadata confirming dedicated Entra Agent ID (6a641622-...) separate from Mickey',
        '00:09:14 — Reviews Sponsor lifecycle accountability and 24h/7d agent sign-in logs inside Microsoft Entra'
      ]
    },
    {
      id: 'purview',
      time: '00:11:26 – 00:16:30',
      tabZh: '11:26 Purview 防泄漏与审计',
      tabEn: '11:26 Purview DLP, DSPM & Audit',
      titleZh: 'Microsoft Purview：拦截高度机密文档进入 Copilot 处理流与 638 条审计追踪',
      titleEn: 'Microsoft Purview: Blocking Highly Confidential Processing & 638 Audit Logs',
      summaryZh: '安全团队启用针对 Copilot Chat 与 Cowork 的数据防泄漏策略，在不剥夺授权员工直接访问源文件的前提下阻断智能体转述机密薪酬；同步巡检 DSPM 与 638 条交互审计记录。',
      summaryEn: 'IT applies a Purview DLP policy restricting Copilot Chat and Cowork from processing Confidential/Highly Confidential files—stopping agent oversharing while preserving direct file ACLs—backed by DSPM and 638 Audit records.',
      bulletsZh: [
        '00:11:36 — 配置 Purview DLP 动作“Restrict Copilot from processing content”，覆盖 Confidential 与 Highly Confidential 标签',
        '00:13:12 — 在新版 DSPM 的 Apps and agents 视图审阅近 30 天 Top 20 活跃智能体与 Activity Explorer 敏感信息命中',
        '00:15:38 — 检索 Purview Audit（11 月 4 日至 19 日共 638 条 CopilotInteraction），穿透客户端 IP、Blueprint ID 与访问文件链接'
      ],
      bulletsEn: [
        '00:11:36 — Enforces Purview DLP rule blocking Copilot Chat & Cowork from processing Confidential/Highly Confidential items',
        '00:13:12 — Inspects Purview DSPM Apps and agents (Top 20 recent agents) and Activity Explorer AI interactions',
        '00:15:38 — Queries Purview Audit (638 CopilotInteraction events, Nov 4–19) exposing client IP, Blueprint ID & clicked URLs'
      ]
    },
    {
      id: 'defender',
      time: '00:16:31 – 00:18:44',
      tabZh: '16:31 Defender 攻击面与狩猎',
      tabEn: '16:31 Defender & KQL Hunting',
      titleZh: 'Microsoft Defender：智能体工具/MCP 攻击面测绘与 AgentsInfo 高级威胁狩猎',
      titleEn: 'Microsoft Defender: Tool/MCP Attack Surface & AgentsInfo Advanced Hunting',
      summaryZh: '开启智能体防护后，在 Defender 中逐项检视版本 v1.0.4、挂载工具与 MCP 服务端点，并在 AzureSentinelSK 工作区编写 KQL 查询 AgentsInfo 表关联安全态势与告警。',
      summaryEn: 'Inside Microsoft Defender, Sasha inspects agent v1.0.4 posture, 2 bound SharePoint tools, and 0 MCP servers, then runs KQL against the AgentsInfo table in Advanced Hunting.',
      bulletsZh: [
        '00:17:18 — 透视智能体详情页：版本 1.0.4、2 项工具（search_sharepoint_onedrive 与 SharePoint Create item）、风险等级 Low',
        '00:17:58 — 在高级威胁狩猎（Advanced Hunting）查询 AgentsInfo 表，0.939 秒内聚合 10 个智能体最新配置与渠道清单',
        '00:18:22 — 将 EntraAgentID 与安全告警及行为表关联，精准揪出配置漂移或越权调用异常'
      ],
      bulletsEn: [
        '00:17:18 — Audits Defender AI Agent view: v1.0.4, 2 SharePoint tools, 0 MCP servers, and Low posture risk',
        '00:17:58 — Queries <code>AgentsInfo | summarize arg_max(Timestamp, *) by AgentId</code> returning 10 inventory rows in 0.939s',
        '00:18:22 — Correlates EntraAgentID against AlertEvidence and BehaviorInfo for incident investigations'
      ]
    },
    {
      id: 'agent365',
      time: '00:18:45 – 00:23:25',
      tabZh: '18:45 Agent 365 与条件访问',
      tabEn: '18:45 Agent 365 & Conditional Access',
      titleZh: 'Microsoft Agent 365 全域控制面、智能体条件访问与限时权限包',
      titleEn: 'Microsoft Agent 365 Control Plane, Agent Conditional Access & Access Packages',
      summaryZh: '回到 Microsoft 365 管理中心 Agent 365 汇总盘点全量智能体、渠道与影子 AI；演示在 Entra 条件访问策略中直接圈选单个智能体身份，并纳入身份治理限时访问包。',
      summaryEn: 'Consolidates fleet visibility in Microsoft 365 admin center (Agent 365), targets specific agent identities inside Entra Conditional Access, and binds time-bound Entitlement Management access packages.',
      bulletsZh: [
        '00:18:55 — 在 M365 管理中心查看 All agents、Agent map 与 Shadow AI，核查 Bontoso 助手系统指令与受权用户范围',
        '00:20:08 — 在 Entra 条件访问（Users or agents）直接点选 Bontoso HR Helper Standard 施加独立零信任准入控制',
        '00:20:42 — 将智能体纳入 Entitlement Management 访问包实现按期自动回收权限，总结四大控制面协同护航'
      ],
      bulletsEn: [
        '00:18:55 — Reviews M365 admin center Agent 365 inventory, Agent map, Shadow AI, instructions, and user access',
        '00:20:08 — Targets Bontoso HR Helper Standard directly under Conditional Access -> Users or agents',
        '00:20:42 — Adds agent identities to Entitlement Management access packages for time-boxed resource access'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr994Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr994-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr994-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr994-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr994-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR994 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR994 Trusting Your AI Workforce official session cover" loading="lazy" />' +
          '<button type="button" class="thr994-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr994-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr994-theater-layout">',
        '  <div class="thr994-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr994-meta">',
        '    <span class="thr994-code">THR994 · ' + item.time + '</span>',
        '    <h4 class="thr994-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr994-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr994-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr994-highlights">' + liHtml + '</ul>',
        '    <div class="thr994-actions">',
        '      <a class="thr994-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr994-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official MP4 Recording' : '⬇ 官方高清录播直链') + '</a>',
        '      <a class="thr994-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR994 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr994Theater);
  } else {
    initThr994Theater();
  }
})();

/* posts/ignite-2026-thr992-agent-principal-know-what-yours-reach/thr992-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr992-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/1de00190-3e6a-40e0-8c56-832593cdb25f',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856596548001Euhx-1791588214960001CKMK',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/1de00190-3e6a-40e0-8c56-832593cdb25f',
    speakersZh: 'Nicole Enders（Microsoft MVP · conet Deutschland GmbH 首席开发工程师）',
    speakersEn: 'Nicole Enders (7x Microsoft MVP · Lead Developer, conet Deutschland GmbH)'
  };

  var CHAPTERS = [
    {
      id: 'intro',
      time: '00:00:02 – 00:02:18',
      tabZh: '00:02 强制主体与双底座设定',
      tabEn: '00:02 Mandatory ID & Setup',
      titleZh: '你刚“录用”了谁：三个门户、两款智能体与无法关闭的身份',
      titleEn: 'Who Did You Just Hire? Three Portals, Two Harnesses, Zero Opt-Out',
      summaryZh: 'Nicole Enders 指出自 2026 年 7 月起新建智能体强制获得 Entra Agent ID 且无任何跳过开关，并设定同文档、同双连接器的双底座对照实验。',
      summaryEn: 'Nicole Enders highlights that every new Copilot Studio agent receives a mandatory Entra Agent ID since July 2026, setting up an identical two-agent test across harnesses.',
      bulletsZh: [
        '00:00:35 — 拆解三大核心追问：发布背后发生了什么、为何权限列表并非真实边界、存量旧智能体如何处置',
        '00:01:09 — 规划同配置对照：Onboarding Buddy（Copilot 底座）对比 Expense Desk（标准底座）',
        '00:01:39 — 横跨 Copilot Studio、Entra 管理中心与 Microsoft 365 管理中心（Agent 365）三端追踪'
      ],
      bulletsEn: [
        '00:00:35 — Frames three pillars: Behind Your Back, Not the Boundary, and Last Year\'s Agents',
        '00:01:09 — Sets up identical handbooks and two tools across Onboarding Buddy and Expense Desk',
        '00:01:39 — Traces identity creation across Copilot Studio, Entra Admin Center, and Agent 365'
      ]
    },
    {
      id: 'draft',
      time: '00:02:20 – 00:13:05',
      tabZh: '02:20 草稿态铸造时机差异',
      tabEn: '02:20 Draft vs Create Timing',
      titleZh: '实机对照一：草稿阶段谁先落地 Entra 主体、蓝图与保荐人',
      titleEn: 'Live Walkthrough 1: Draft-Stage Identity Creation, Blueprint & Sponsor',
      summaryZh: '为两款智能体挂载相同的 Word 手册以及获取个人档案、读取日历两项操作；切回 Entra 后发现标准底座新建即铸造身份，而 Copilot 底座草稿态仍为空。',
      summaryEn: 'Both agents attach a Word handbook plus Get my profile and Get calendar view of events; checking Entra reveals Standard mints its ID at creation while Copilot waits.',
      bulletsZh: [
        '00:04:21 — 为 Onboarding Buddy 添加 Office 365 用户档案与 Outlook 日历工具，此时 Entra 尚无记录',
        '00:10:54 — 新建未发布的标准底座 Expense Desk 已在 Entra 生成主体，而草稿态 Buddy 仍未现身',
        '00:11:47 — 点开身份详情页核验创建者自动成为保荐人（Sponsor），且全租户共享唯一 Copilot Studio 蓝图'
      ],
      bulletsEn: [
        '00:04:21 — Adds Office 365 profile and Outlook calendar tools to Onboarding Buddy; Entra shows nothing yet',
        '00:10:54 — Standard-harness Expense Desk already owns an Entra Agent ID while still in draft',
        '00:11:47 — Inspects the Maker-as-Sponsor binding and the single shared Copilot Studio Blueprint'
      ]
    },
    {
      id: 'publish',
      time: '00:13:09 – 00:19:12',
      tabZh: '13:09 发布后权限盲区与 A365',
      tabEn: '13:09 Scopes Gap & Agent 365',
      titleZh: '实机对照二：Granted Permissions 单行聚合、留白现象与 Agent 365 补盲',
      titleEn: 'Live Walkthrough 2: Runtime.All Aggregation, Empty Scopes & Agent 365',
      summaryZh: '双双点击发布后，Copilot 底座终于生成身份但权限栏完全留白；标准底座将两项 M365 工具聚合成单条记录，唯有切入 Agent 365 才能透视完整工具路径。',
      summaryEn: 'Publishing both mints Onboarding Buddy\'s ID with an empty permissions tab, writes one aggregated Runtime.All entry on Expense Desk, and surfaces raw APIs in Agent 365.',
      bulletsZh: [
        '00:14:20 — 发布后两款智能体均出现在 Entra，但 Onboarding Buddy 的 Granted permissions 列表为空',
        '00:15:05 — Expense Desk 仅显示单条 Azure API Connections Runtime.All，聚合了全部第一方 M365 连接器',
        '00:18:13 — 在 M365 管理中心 Agent 365 直读知识文档、底层 API 路径、Work IQ MCP 服务与 Purview 敏感交互'
      ],
      bulletsEn: [
        '00:14:20 — Post-publish, Onboarding Buddy appears in Entra with an undocumented empty permissions list',
        '00:15:05 — Expense Desk shows a single Azure API Connections Runtime.All row covering M365 tools',
        '00:18:13 — Agent 365 exposes Onboarding Handbook.docx, shared_office365users APIs, Work IQ MCP & Purview data'
      ]
    },
    {
      id: 'matrix',
      time: '00:19:19 – 00:23:16',
      tabZh: '19:19 三核心词与五扇治理门',
      tabEn: '19:19 3 Words & 5 Admin Doors',
      titleZh: '架构复盘：蓝图、连接器范围、条件访问与五个互不碰面的团队',
      titleEn: 'Architecture Synthesis: Blueprint, Scopes, Conditional Access & Five Teams',
      summaryZh: '提炼智能体身份三大支柱，对比官方文档与 2026 年 11 月实测差异矩阵，并指出五个管理角色必须补齐的两场跨部门对话。',
      summaryEn: 'Synthesizes Blueprint, Connector Scopes, and Conditional Access, contrasts documented vs. Nov 2026 observed behavior, and maps five siloed governance teams.',
      bulletsZh: [
        '00:20:28 — 条件访问已支持将智能体列为目标，现阶段仅支持 Teams 内“高风险即阻断”（无人类 MFA 与设备校验）',
        '00:21:16 — 实测矩阵揭底：自定义连接器与 MCP 在双底座权限栏均为空，Copilot 底座连第一方工具也未显示',
        '00:22:05 — 串联构建者、Power Platform、Entra、M365 与安全合规五方，直指权限评估与离职保荐人交接盲点'
      ],
      bulletsEn: [
        '00:20:28 — Conditional Access targets Agent IDs with Block-if-Risky in Teams (no MFA or device checks)',
        '00:21:16 — Matrix reveals MCP/custom connectors stay empty on both harnesses, plus empty 1P on Copilot harness',
        '00:22:05 — Maps Makers, Power Platform, Identity, M365, and Security across two missing governance handoffs'
      ]
    },
    {
      id: 'monday',
      time: '00:23:17 – 00:29:40',
      tabZh: '23:17 存量迁移与周一四步清查',
      tabEn: '23:17 Legacy Bots & Monday Plan',
      titleZh: '2025 存量智能体（重建/迁移/等待）、智能体账户前瞻与周一四项核查',
      titleEn: '2025 Legacy Agents (Recreate, Migrate, Wait), Agent Accounts & Monday Checklist',
      summaryZh: '剖析仅有传统企业应用标签的 2025 旧智能体三条出路（含 MC1478488 自动迁移时间线），预告拥有独立邮箱的智能体账户，并给出周一落地的四步清查清单。',
      summaryEn: 'Compares Recreate, Preview Migrate, and MC1478488 Auto-Migration for 2025 bots, previews Roadmap 570430 Agent Accounts, and delivers a 4-step Monday tenant audit.',
      bulletsZh: [
        '00:23:37 — 2025 旧版 Onboarding Bot 仅存于企业应用列表，无蓝图、无保荐人、不受智能体条件访问管辖',
        '00:24:47 — 对比 Entra 文档（重建）、Studio 预览版就地迁移与 9 月启动的 MC1478488 后台自动迁移',
        '00:27:30 — 周一四步法：查新建 Agent ID、对账 API 权限与 DLP、按 AgentCreatedBy:CopilotStudio 标签盘点存量并接入离职流程'
      ],
      bulletsEn: [
        '00:23:37 — 2025 Onboarding Bot sits in Enterprise Apps without Blueprint, Sponsor, or Agent CA',
        '00:24:47 — Contrasts Entra docs (Recreate), Studio in-place preview Migrate, and MC1478488 automatic rollout',
        '00:27:30 — Monday 4 checks: Find Agent IDs, Read permissions + DLP, Count tagged Enterprise Apps, Decide & bind JML'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr992Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr992-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr992-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr992-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr992-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR992 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR992 Every agent is a principal now official session cover" loading="lazy" />' +
          '<button type="button" class="thr992-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr992-play-pill">' + (en ? '▶ Load Official Video Player (30 min)' : '▶ 点击加载官方内嵌点播流（30 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr992-theater-layout">',
        '  <div class="thr992-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr992-meta">',
        '    <span class="thr992-code">THR992 · ' + item.time + '</span>',
        '    <h4 class="thr992-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr992-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr992-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr992-highlights">' + liHtml + '</ul>',
        '    <div class="thr992-actions">',
        '      <a class="thr992-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr992-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript (DOCX)' : '⬇ 下载官方逐字稿（DOCX）') + '</a>',
        '      <a class="thr992-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR992 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr992Theater);
  } else {
    initThr992Theater();
  }
})();

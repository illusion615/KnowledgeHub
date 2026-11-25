/* posts/ignite-2026-brk261-tool-teammate-persistent-agents-shared/brk261-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/brk261-session-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/9ff88e92-a86a-4077-8aa5-7e5819913ce0',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612754001EwNc-1791588132209001CdtH',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/9ff88e92-a86a-4077-8aa5-7e5819913ce0',
    speakersZh: 'Evan Lew（Copilot Studio 产品总监） & Matt Hidinger（首席产品经理） · 嘉宾：Andrew Gaskins（Lumen）',
    speakersEn: 'Evan Lew (Director of Product, Copilot Studio) & Matt Hidinger (Principal PM) · Guest: Andrew Gaskins (Lumen)'
  };

  var CHAPTERS = [
    {
      id: 'onboarding',
      time: '00:00:00 – 00:06:15',
      tabZh: '00:00 新人入职与三大支柱',
      tabEn: '00:00 Onboarding & 3 Pillars',
      titleZh: '从 2007 新员工蓝牌到 2026 数字队友：告别复制粘贴的中间人瓶颈',
      titleEn: 'From 2007 Blue Badge to 2026 Digital Teammate: Ending Copy-Paste Bottlenecks',
      summaryZh: 'Evan Lew 对比个人生产力工具（Autopilot）与跨部门共享流程智能体：如同新员工入职需要工牌、电脑、手册、笔记本与门禁边界，数字队友依次对应智能体账号、计算机使用、共享技能、持久记忆与安全护栏。',
      summaryEn: 'Evan Lew maps 2007 new-hire onboarding artifacts (badge, laptop, handbook, notebook, building access) directly to Agent Accounts, Computer Use, Shared Skills, Memory, and IT Guardrails, freeing marketing manager Vid from manual coordination.',
      bulletsZh: [
        '00:01:42 — 复盘 2007 年微软入职五件套，映射 2026 年共享流程智能体五大核心装备',
        '00:03:05 — 宣布专属智能体账号（Agent Accounts）于 2026 年 12 月开启 Frontier 公开预览',
        '00:04:55 — 剖析 Ignite 四项发布并行场景：让 Go for Launch 直接对接全组，经理 Vid 仅在关键审批介入'
      ],
      bulletsEn: [
        '00:01:42 — Maps 2007 Microsoft onboarding essentials to 2026 persistent agent capabilities',
        '00:03:05 — Announces Agent Accounts entering Frontier public preview in December 2026',
        '00:04:55 — Walks through the four-launch Ignite scenario where Go for Launch removes Vid as the middleman'
      ]
    },
    {
      id: 'demo-colleague',
      time: '00:06:16 – 00:18:55',
      tabZh: '06:16 Demo 1 账号与全端协同',
      tabEn: '06:16 Demo 1 Account & M365',
      titleZh: '实机演示一：Go for Launch 专属身份、Dataverse 自有凭据与文档协同',
      titleEn: 'Demo 1: Go for Launch Identity, Agent-Authenticated Dataverse & Office Co-Authoring',
      summaryZh: 'Matt Hidinger 演示绑定智能体账号后自动解锁 +7 个默认通信触发器，对比共享制作者凭据、终端用户凭据与智能体自有凭据，并在 15 名所有者 + 31 名成员的 Teams 频道、PPT 评论与 Outlook 转发中闭环协作。',
      summaryEn: 'Matt Hidinger tours Go for Launch (`GPT 6.1 Sol`), contrasts Agent Account auth against risky maker credentials, and shows live collaboration across a 46-person Teams channel, PowerPoint comments, Word edits, and Outlook email threads.',
      bulletsZh: [
        '00:09:18 — 解析 Dataverse 工具认证：以智能体自有账号读写核心台账，终结制作者共享凭据风险与用户重复授权',
        '00:14:12 — 展示像拉真人入群一样将智能体加入 Teams（15 位 Owner + 31 位 Member），每日自动播报晨会倒计时',
        '00:15:20 — 复盘过去一年半 7 场发布延期根因（法务客户证言平均拖慢 5–6 天），在 PPT 第 6 页评论区直接修订并同步台账'
      ],
      bulletsEn: [
        '00:09:18 — Configures Dataverse MCP with Agent Account auth, avoiding shared maker credentials and user token timeouts',
        '00:14:12 — Adds Go for Launch as a standard member in a 15-owner, 31-member Teams team with daily stand-up triggers',
        '00:15:20 — Reviews 7 past launches, flags 5–6 day legal/PR quote delays, and updates Slide 6 + Dataverse via @mention'
      ]
    },
    {
      id: 'demo-govern',
      time: '00:18:56 – 00:29:58',
      tabZh: '18:56 Demo 2 权限图谱与算力围栏',
      tabEn: '18:56 Demo 2 Governance & Spend',
      titleZh: '实机演示二：禁删最小权限、Agent Map 拓扑、条件访问与三级预算封顶',
      titleEn: 'Demo 2: Insert/Update RBAC, Agent Map, Conditional Access & Credit Caps',
      summaryZh: '切换管理员视角，在 Power Platform 管理中心授予智能体“仅新增与修改、禁止删除”角色，在 Microsoft 365 管理中心通过 Agent Map 审查工具调用链，并讲解 Autopilot 边界与三级 Copilot Credits 限额保护。',
      summaryEn: 'Switching to Power Platform and Microsoft 365 Admin Centers, Matt assigns an insert/update-only Dataverse role, inspects live tool connections in Agent Map, applies Entra Conditional Access to `agent users`, and recaps 3-tier spend caps.',
      bulletsZh: [
        '00:19:45 — 在 AP Preview 环境配置 `launch agent` 安全角色：仅开放表新增与更新，物理阻断误删数据',
        '00:20:55 — 打开 Agent Map 可视化拓扑：透视 Work IQ MCP、文档共编与终端用户授权的 Canva 连接器',
        '00:24:30 — 结合 Purview 敏感度标签、Entra `agent users` 条件访问及单智能体/环境级 100% 额度熔断锁死风险'
      ],
      bulletsEn: [
        '00:19:45 — Grants `launch agent` security role in `AP Preview` with insert/update permissions and zero delete rights',
        '00:20:55 — Explores Agent Map connections across Dataverse, auto-attached Work IQ MCP, co-authoring, and Canva',
        '00:24:30 — Enforces Purview sensitivity labels, Entra Conditional Access on `agent users`, and 100% credit Stop Usage caps'
      ]
    },
    {
      id: 'demo-equipped',
      time: '00:29:59 – 00:38:55',
      tabZh: '29:59 Demo 3 电脑操作与富界面',
      tabEn: '29:59 Demo 3 Plugins, CUA & UI',
      titleZh: '实机演示三：统一插件目录、云浏览器/云电脑无接口操作与 MCP Apps',
      titleEn: 'Demo 3: Unified Plugins, Browser/Cloud PC Computer Use & Rich MCP Apps',
      summaryZh: '演示将知识、工具与 SKILL.md 统一打包为插件；现场唤起云浏览器自动填写 Woodgrove Bank 客户证言 Microsoft Forms 表单，并回放 Windows 365 云电脑点击开始菜单操作老旧 Java 采购客户端创建 PO 单。',
      summaryEn: 'Unifies Knowledge + Tools + Skills into Plugins, runs live Cloud Browser automation to submit a Woodgrove Bank quote form, and replays a Windows 365 Cloud PC opening the Start menu to file a PO in a legacy Java desktop app.',
      bulletsZh: [
        '00:32:25 — 实机启动云端浏览器：自动填入 Woodgrove Bank 数字运营主管引语与 12 月 1 日上线节点并提交法务表单',
        '00:33:38 — 回放 Windows 365 云电脑：点击 Windows 开始菜单打开 `Java procurement` 桌面软件逐项生成采购单',
        '00:37:50 — 公布三步路线图（11 月公开网页预览 → 12 月 Key Vault 登录与视频录制教学 → 年底专属云电脑）及交互式 MCP Apps'
      ],
      bulletsEn: [
        '00:32:25 — Live cloud browser session fills and submits the Woodgrove Bank legal evidence Microsoft Form (Dec 1 launch)',
        '00:33:38 — Replays Windows 365 Cloud PC launching a legacy `Java procurement` desktop app via the Start menu to raise a PO',
        '00:37:50 — Details Computer Use roadmap (Nov public web, Dec Key Vault + video Teach mode, year-end Cloud PC) and MCP Apps'
      ]
    },
    {
      id: 'demo-memory-lumen',
      time: '00:38:56 – 00:45:25',
      tabZh: '38:56 Demo 4 共享记忆与 Lumen 案例',
      tabEn: '38:56 Demo 4 Memory & Lumen Case',
      titleZh: '实机演示四：透明可删的共享记忆账本与 Lumen「Brand Buddy」实战',
      titleEn: 'Demo 4: Auditable Shared Memory Ledger & Lumen Brand Buddy Customer Showcase',
      summaryZh: '核验智能体跨会话记住 Woodgrove Bank 证言单号（CE-10033）、个人可编辑链接偏好与聊天提速规程；最后由 Lumen 首席解决方案架构师 Andrew Gaskins 登台分享基于新内核构建 Brand Buddy 品牌合规智能体的端到端实践。',
      summaryEn: 'Inspects Go for Launch\'s transparent shared memory ledger (`CE-10033`, edit-link preferences, and chat latency rules), followed by Lumen Principal Solution Architect Andrew Gaskins presenting Brand Buddy for automated PDF brand markup.',
      bulletsZh: [
        '00:39:45 — 追问证言审批进展：智能体秒回申请单号 `CE-10033` 并附带“管理记忆”透明账本直达链接',
        '00:40:35 — 检视三类可删改记忆：个人可编辑链接偏好、关键业务日志与团队反馈触发的“直接读目录提速”规则',
        '00:41:52 — Lumen 架构师 Andrew Gaskins 登台：基于 Microsoft Copilot Harness 与智能体身份打造 Brand Buddy，自动输出带批注的品牌审查 PDF'
      ],
      bulletsEn: [
        '00:39:45 — Queries Woodgrove approval status; agent cites saved record `CE-10033` with a direct Manage Memories link',
        '00:40:35 — Reviews three auditable memory classes: edit-ready link preferences, milestone logs, and folder-lookup speed optimizations',
        '00:41:52 — Lumen\'s Andrew Gaskins shares how Marketing built Brand Buddy on Microsoft Copilot Harness + Agent Identity for full PDF brand markup'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk261Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk261-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk261-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk261-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk261-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK261 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK261 From tool to teammate official session cover" loading="lazy" />' +
          '<button type="button" class="brk261-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk261-play-pill">' + (en ? '▶ Load Official Video Player (45 min)' : '▶ 点击加载官方内嵌点播流（45 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk261-theater-layout">',
        '  <div class="brk261-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk261-meta">',
        '    <span class="brk261-code">BRK261 · ' + item.time + '</span>',
        '    <h4 class="brk221-title brk261-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk261-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk261-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk261-highlights">' + liHtml + '</ul>',
        '    <div class="brk261-actions">',
        '      <a class="brk261-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk261-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk261-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK261 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk261Theater);
  } else {
    initBrk261Theater();
  }
})();

/* posts/ignite-2026-thr885-agentic-erp-action-build-agents-skills/thr885-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr885-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/c43045ee-f382-49e7-8f57-2448115ae000',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856580022001El3j-1791588087248001CNOO',
    docsUrl: 'https://aka.ms/ERPWorkIQ',
    speakersZh: 'Jared Hall（Microsoft Dynamics 365 ERP 首席产品经理 · Principal Product Manager）',
    speakersEn: 'Jared Hall (Principal Product Manager, Microsoft Dynamics 365 ERP)'
  };

  var CHAPTERS = [
    {
      id: 'foundation',
      time: '00:00:00 – 00:05:14',
      tabZh: '00:00 表单交互 MCP 与可调配置',
      tabEn: '00:00 Form-Driven MCP & Configs',
      titleZh: '超越底层增删改查：基于视图模型的 Dynamics 365 ERP MCP 与多场景配置',
      titleEn: 'Beyond CRUD: View-Model Form Interactions & Custom MCP Configurations',
      summaryZh: 'Jared Hall 回顾 Dynamics 365 ERP MCP 自公开预览一周年来的架构演进：不同于仅对数据库表做增删改查的数据接口，ERP MCP 依托应用视图模型与字段标签提示直接定位表单、点击按钮并触发完整业务逻辑；新增记录深链、附件处理、可下载上下文资源及多套自定义 MCP 配置。',
      summaryEn: 'Jared Hall outlines how the Dynamics 365 ERP MCP server goes beyond table CRUD by driving form interactions and X++ business logic via the application view model, adding record deep links, attachments, downloadable resources, and scenario-tuned MCP configurations.',
      bulletsZh: [
        '00:01:55 — 依托表单交互工具定位目标页面并执行按钮动作，将应用视图模型、列标签与工具提示作为原生上下文喂给智能体',
        '00:03:54 — 性能提速与响应增强：压降工具调用轮次，支持返回记录深链（Deep Links）、直接操作附件并拉取系统资源入上下文',
        '00:04:44 — 推出自定义 MCP Configurations：告别硬编码阈值，允许制作者按业务场景配置多套参数上限供不同智能体调用'
      ],
      bulletsEn: [
        '00:01:55 — Uses form interaction tools plus view-model metadata (column labels and tooltips) to execute real ERP business logic',
        '00:03:54 — Rolls out speedups cutting tool calls alongside record deep links, attachment handling, and downloadable context resources',
        '00:04:44 — Introduces multiple MCP Configurations so makers can override hardcoded limits per agent scenario'
      ]
    },
    {
      id: 'security',
      time: '00:05:15 – 00:08:25',
      tabZh: '05:15 10.0.51 双身份内核降权',
      tabEn: '05:15 10.0.51 Dual-ID Security',
      titleZh: '10.0.51 安全内核重构：让员工经由智能体执行的权限严于前台界面',
      titleEn: '10.0.51 Security Kernel Overhaul: Scoping Agent Privileges Below Full UI Access',
      summaryZh: '针对过去一年客户呼声最高的安全诉求——管理员不仅要求“智能体权限不超用户上限”，更希望“员工通过智能体能做的事少于直接操作前台”——10.0.51 版本深入安全内核重构，支持基于 User ID + Agent/App ID 双标识绑定专属裁剪版角色。',
      summaryEn: 'Addressing the #1 customer request from the past year, release 10.0.51 updates the F&O security kernel to evaluate both User ID and Agent/Application ID—letting admins enforce narrower privileges when users act through an agent.',
      bulletsZh: [
        '00:05:58 — 直击头号治理痛点：员工在前台拥有完整角色权限，但管理员希望限制其通过 Copilot 或 Cowork 可触发的高危写操作',
        '00:07:12 — 实机演示派生角色：复制标准应收账款文员（Accounts receivable clerk），删减敏感动作后另存为 Accounts receivable clerk - agent',
        '00:07:41 — 底部新增 Manage agent access 绑定：请求进入时同时核验用户 ID 与智能体/应用 ID，按接入表面精准套用安全配置'
      ],
      bulletsEn: [
        '00:05:58 — Solves the top enterprise ask: letting a user do less through an agent than they can directly inside the F&O web client',
        '00:07:12 — Clones "Accounts receivable clerk" into "Accounts receivable clerk - agent" with sensitive operations stripped out',
        '00:07:41 — Evaluates both User ID and Agent/App ID at runtime via "Manage agent access" to apply surface-specific security profiles'
      ]
    },
    {
      id: 'workiq',
      time: '00:08:26 – 00:13:02',
      tabZh: '08:26 Work IQ 双通道与 65 万操作',
      tabEn: '08:26 Work IQ Ask & 650K Ops',
      titleZh: 'Dynamics 365 ERP 汇入 Work IQ：42 个索引实体问答与 65 万项业务操作联动',
      titleEn: 'Bringing ERP into Work IQ: 42 Indexed Entities in Ask + 650K MCP Actions',
      summaryZh: '将财务与供应链上下文与 Word、Outlook、Dataverse 汇聚至同一 Work IQ 端点：底层新增 AI Descriptions 消除晦涩字段歧义；中间层通过 Ask 提供 42 个高频实体的全文检索只读问答，并在 Do Action 背后挂载 ERP MCP 解锁 650,000 项业务动作。',
      summaryEn: 'Unifies Dynamics 365 ERP alongside Microsoft 365 and Dataverse inside Work IQ—combining AI Descriptions for cryptic schema fields, fast read-only Ask over 42 indexed entities, and Do Action backed by 650,000 ERP MCP operations.',
      bulletsZh: [
        '00:09:38 — AI Descriptions 公开预览：为命名晦涩的 F&O 表单、实体与字段补充语义说明，消除人类与智能体双双困惑的选表盲区',
        '00:11:48 — Work IQ Ask 只读快查：借助 Dataverse 搜索与 ACS 索引开放 42 个最常用 F&O 实体的自然语言全文检索',
        '00:12:33 — Work IQ Do Action 全量兜底：对超出 42 个实体的复杂诉求直接联动 ERP MCP 服务器，开放多达 650,000 项系统操作'
      ],
      bulletsEn: [
        '00:09:38 — AI Descriptions (Public Preview) augments cryptic F&O forms, entities, and columns with clear agent usage guidance',
        '00:11:48 — Work IQ Ask delivers fast read-only natural-language Q&A across the 42 most commonly used F&O entities via Dataverse search/ACS',
        '00:12:33 — Work IQ Do Action links directly to Dynamics 365 ERP MCP, exposing 650,000 operations across data and business logic'
      ]
    },
    {
      id: 'skills',
      time: '00:13:03 – 00:17:45',
      tabZh: '13:03 角色级业务技能与 AOT 节点',
      tabEn: '13:03 Role-Scoped Skills & AOT',
      titleZh: '10.0.51 Business Skills 公开预览：遵循标准规范、受 F&O 角色管控并原生入驻 AOT',
      titleEn: 'Business Skills in 10.0.51: Role-Secured SOPs, AOT Nodes & Client Support Matrix',
      summaryZh: '详解为何在客户端技能之外构建 ERP 专属技能框架：遵循通用 Agent Skills 规范，但直接保存在 F&O 内并按安全角色授权，使员工无论使用 Copilot Studio、VS Code、Claude 还是 Cowork 均遵循统一企业规程；同时在应用对象树（AOT）新增内置节点供 ISV 随代码交付。',
      summaryEn: 'Explains why ERP Business Skills live inside F&O: built on the standard Agent Skills spec yet governed by F&O security roles across every client harness, with a new Application Object Tree (AOT) node so X++ ISVs can ship skills alongside code.',
      bulletsZh: [
        '00:13:33 — 跨宿主一致合规：技能持久化于 F&O 并绑定安全角色（如隔离敏感人事政策），跨任意接入客户端统一生效',
        '00:14:32 — 双重来源体系：AOT（应用对象树）新增 Business Skills 节点支持微软与 X++ 独立软件商随应用分发内置技能，客户亦可自建 Custom 技能',
        '00:16:17 — 客户端支持矩阵：Copilot Studio、VS Code GitHub Copilot、Claude 等第三方远程连接与 Cowork 均支持问答+动作；M365 Copilot Chat 现阶段仅限只读问答'
      ],
      bulletsEn: [
        '00:13:33 — Secures skills via the F&O security model so confidential HR or finance policies stay consistent across every harness',
        '00:14:32 — Adds Business Skills as a native AOT node for X++ ISVs shipping built-in intelligence alongside customer/partner custom skills',
        '00:16:17 — Details client availability: Copilot Studio, VS Code, Claude (remote MCP), and Cowork support Ask + MCP; M365 Copilot Chat supports Q&A only'
      ]
    },
    {
      id: 'demos',
      time: '00:17:46 – 00:24:44',
      tabZh: '17:46 呆滞库存看板、自动写技能与催收',
      tabEn: '17:46 Live Demos: Stock & Cash Flow',
      titleZh: '端到端实录：两句话揪出 $2.78M 呆滞库存、一键沉淀 F&O 技能并在 Cowork 触发催收',
      titleEn: 'End-to-End Walkthrough: $2.78M Idle Stock Dashboard, Auto-Authored Skill & Cowork Collections',
      summaryZh: '在零预置技能下仅凭两句提示词驱动 ERP MCP 自主查表，生成揭露 $3.96M 总库存中 $2.78M（70%）呆滞积压与 1,000 台零销量高端音箱的可视化看板；随后一句话让智能体自动将分析流程写成 F&O 业务技能，并切至 Cowork 经由 Work IQ 复现库存与现金流逾期催收动作。',
      summaryEn: 'Walks through a two-sentence prompt with zero prior skills surfacing $2.78M (70%) idle stock and 1,000 unsold high-end speakers, instructing the agent to write the `inventory-health-analysis` skill back into F&O, and invoking inventory and cash-flow skills inside Cowork.',
      bulletsZh: [
        '00:18:15 — 零技能冷启动分析：输入“呆滞占压资金且热销常断货”两句话，生成含 $3.96M 在库估值、$2.78M 积压与 1,000 台未售高端音箱的诊断看板',
        '00:20:08 — 智能体反向写回技能：一句“Go ahead and create a business skill for me”即通过 MCP 在 F&O 内自动生成带 SQL 避坑说明的 inventory-health-analysis（v1.0.0）并配置角色权限',
        '00:21:45 — Cowork + Work IQ 闭环执行：在 Cowork 跨应用调起库存健康与现金流分析技能（汇总应收/应付/回款历史），一键触发起草逾期账款催收邮件等可执行动作，并开放 aka.ms/ERPWorkIQ 官方文档'
      ],
      bulletsEn: [
        '00:18:15 — Zero-skill two-sentence prompt builds an HTML dashboard flagging $3.96M valued stock, $2.78M (70%) excess, 16 short items, and 1,000 unsold speakers',
        '00:20:08 — Prompts the agent to author and save `inventory-health-analysis` directly into F&O via MCP, complete with role-based Manage access controls',
        '00:21:45 — Switches to Copilot Cowork via Work IQ to run inventory and cash-flow skills and click recommended overdue-collections actions (`aka.ms/ERPWorkIQ`)'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr885Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr885-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr885-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr885-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr885-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR885 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR885 Agentic ERP in action official session cover featuring Jared Hall" loading="lazy" />' +
          '<button type="button" class="thr885-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr885-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr885-theater-layout">',
        '  <div class="thr885-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr885-meta">',
        '    <span class="thr885-code">THR885 · ' + item.time + '</span>',
        '    <h4 class="thr885-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr885-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr885-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr885-highlights">' + liHtml + '</ul>',
        '    <div class="thr885-actions">',
        '      <a class="thr885-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr885-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR885 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="thr885-btn" href="' + SESSION_META.docsUrl + '" target="_blank" rel="noopener">' + (en ? '📘 ERP in Work IQ Docs' : '📘 ERP in Work IQ 官方文档') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr885Theater);
  } else {
    initThr885Theater();
  }
})();

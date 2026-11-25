/* posts/ignite-2026-thr981-essential-insights-governing-copilot-agents/thr981-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr981-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/74e31d7d-f39f-4eda-9e48-03869722f24f',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856594825001EWii-1791588109215001CiD2',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/74e31d7d-f39f-4eda-9e48-03869722f24f',
    speakersZh: 'Tiffany Songvilay（Microsoft MVP · 智能体治理与企业协作架构）',
    speakersEn: 'Tiffany Songvilay (Microsoft MVP · Agent Governance & Enterprise Architecture)'
  };

  var CHAPTERS = [
    {
      id: 'spectrum',
      time: '00:00:00 – 00:06:40',
      tabZh: '00:00 从问答到写回（风险跃迁）',
      tabEn: '00:00 Answers to Outcomes',
      titleZh: '破除“线性升级迷思”：Understand → Recommend → Act 三阶能力与数据卫生',
      titleEn: 'Breaking the Graduation Myth: Understand, Recommend & Act Data Hygiene',
      summaryZh: 'Tiffany Songvilay 开宗明义指出智能体并非从聊天到专业代码的单向晋升梯，而是按问答理解、上下文建议与系统写回三类动作决定治理水位，并点破 Agent Builder 仅能穿透 2 层目录结构的现实约束。',
      summaryEn: 'Tiffany Songvilay clarifies that agents are not a mandatory graduation ladder; governance scales from Q&A (Understand) to Work IQ synthesis (Recommend) and ERP/CRM write-back (Act), while exposing Agent Builder\'s 2-level hierarchy limit.',
      bulletsZh: [
        '00:00:43 — 纠偏认知：Chat → Agent Builder → Copilot Studio → Pro-Code 不是所有智能体必经的升级路线',
        '00:02:40 — 决策建议层（如 Researcher / Analyst）依赖 Microsoft IQ 汇总隐式上下文，要求敏感标签与唯一真实信源',
        '00:04:47 — 工程硬边界：Agent Builder 无法穿透超过 2 层的数据层级，迫使企业扁平化并集中收敛分散文档'
      ],
      bulletsEn: [
        '00:00:43 — Debunks the graduation myth across Chat, Agent Builder, Copilot Studio, and Pro-Code',
        '00:02:40 — Decision/recommendation agents (Researcher, Analyst) rely on Microsoft IQ and clean sensitivity labels',
        '00:04:47 — Hard boundary: Agent Builder cannot traverse more than 2 hierarchy levels, requiring flattened data estates'
      ]
    },
    {
      id: 'zones',
      time: '00:06:41 – 00:11:39',
      tabZh: '06:41 四大治理分区（Zone 1–3）',
      tabEn: '06:41 Four Governance Zones',
      titleZh: '微软官方四分区模型：从个人快速辅助（S）到跨厂战略编排（XL）',
      titleEn: 'Microsoft Four-Zone Matrix: Quick Assist (S) to Strategic Impact (XL)',
      summaryZh: '完整拆解全场最核心的官方四分区图谱：Zone 1 零代码个人助手、Zone 2.1 公民开发者团队赋能、Zone 2.2 创作者与 IT 协同业务流程写回，以及 Zone 3 耗时数月构建的专业级跨工厂自主编排。',
      summaryEn: 'Unpacks Microsoft\'s official four-zone framework: Zone 1 Quick Assist (S), Zone 2.1 Team Enablement (M), Zone 2.2 Business Process (L), and Zone 3 Strategic Impact (XL) taking months of pro-dev and change management.',
      bulletsZh: [
        '00:07:10 — Zone 1（低风险 S）与 Workspaces 演进：原本为个人单建的轻量问答正逐步迁入团队协作空间',
        '00:08:37 — Zone 2.1（中风险 M）：面向先锋网络（Champions）发放 Copilot Studio 许可，启动准入登记与责任人绑定',
        '00:10:31 — Zone 2.2（中高风险 L）触及旧系统与业务流程；Zone 3（高风险 XL）由专业研发在独立隔离环境历时数月交付'
      ],
      bulletsEn: [
        '00:07:10 — Zone 1 (S Low Risk) & Workspaces shift: personal Q&A use cases increasingly move to shared Workspaces',
        '00:08:37 — Zone 2.1 (M Medium Risk): license Copilot Studio Champions and initiate owner-bound intake',
        '00:10:31 — Zone 2.2 (L) touches legacy workflows with IT; Zone 3 (XL) demands isolated environments and months of pro-dev'
      ]
    },
    {
      id: 'coe',
      time: '00:11:40 – 00:16:45',
      tabZh: '11:40 CoE 分诊与业务结果指标',
      tabEn: '11:40 CoE Intake & Outcome KPIs',
      titleZh: '卓越中心（CoE）准入四问：拒绝“锤子找钉子”与“日省 15 分钟”伪指标',
      titleEn: 'CoE Intake Triage: Stopping Agent Sprawl & Vanity Usage Metrics',
      summaryZh: '阐明为何必须由卓越中心（CoE）而非忙碌的 IT 团队主导准入分诊，筛除本该由 Workspaces、Cowork 或 SharePoint 工作流承担的伪需求，并将度量标准从单纯调用量升级为员工流失率等真实财务与业务结果。',
      summaryEn: 'Explains why a Center of Excellence (not overloaded IT) must run intake triage—filtering out SharePoint/Cowork tasks and replacing "saving 15 minutes a day" usage vanity metrics with hard business outcomes like attrition reduction.',
      bulletsZh: [
        '00:11:45 — CoE 替代 IT 坐镇准入关口：避免 IT 因忙于开发专业代码智能体而沦为全员创新的审批瓶颈',
        '00:14:28 — 停止用单纯调用量评判成败：“每天省 15 分钟”已无法说服财务审批，需锚定入职流失率等业务硬指标',
        '00:15:48 — 破除“拿着智能体锤子看什么都像钉子”：甄别 Power Platform、Cowork 或 SharePoint 流即可解决的场景'
      ],
      bulletsEn: [
        '00:11:45 — CoE leads intake because IT is busy building Zone 3 pro-code agents and would bottleneck makers',
        '00:14:28 — Ditch usage vanity metrics: "saving 15 minutes a day" no longer justifies spend; measure outcomes like attrition',
        '00:15:48 — Cure the "agent hammer" syndrome by routing routine workflows to Workspaces, Cowork, or SharePoint'
      ]
    },
    {
      id: 'scale',
      time: '00:16:46 – 00:21:21',
      tabZh: '16:46 四大支柱：A365、环境与 DLP',
      tabEn: '16:46 A365, Environments & DLP',
      titleZh: '规模化治理四支柱：“无责任人则无智能体”与叫停 Default 默认环境裸奔',
      titleEn: 'Four Pillars at Scale: "No Owner, No Agent" & Exiting the Default Environment',
      summaryZh: '深入拆解资产台账、环境与 DLP 围栏、Purview 安全合规及遥测审计四大支柱：打通 CoE 对 Agent 365 的访问权，严禁全员在 Default 默认环境混建智能体，并按环境粒度锁死可用连接器范围。',
      summaryEn: 'Details the four scale pillars: granting CoE access to Agent 365 inventory, halting builds in the Default environment via Personal/Dev/Test/Prod isolation, locking connectors via DLP, and wiring Purview compliance.',
      bulletsZh: [
        '00:16:56 — 铁律重申：“没有实名责任人，就没有智能体”，并向 CoE 开放 Agent 365 台账权限与离职交接机制',
        '00:18:21 — 立即叫停 Default 默认环境裸奔：至少单建个人生产力环境（DLP 仅放行 M365 数据源），企业级严守 Dev/Test/Prod',
        '00:20:35 — 跨管理员协同：联合 Purview 合规团队，并在 CoE 内配置横跨 Entra、Power Platform 与 SharePoint 的复合角色'
      ],
      bulletsEn: [
        '00:16:56 — Hard rule: "You do not have an owner, you do not have an agent"—backed by CoE access to Agent 365',
        '00:18:21 — Exit the Default environment immediately: isolate personal M365-only DLP from Dev/Test/Prod pipelines',
        '00:20:35 — Cross-admin alignment: unite Purview teams with CoE roles spanning Entra, Power Platform, and SharePoint'
      ]
    },
    {
      id: 'readiness',
      time: '00:21:22 – 00:24:28',
      tabZh: '21:22 五类变更重验与四关上线',
      tabEn: '21:22 Re-Validation & Release Gates',
      titleZh: '企业级生产就绪度：视指令如“公司章程”，严守四道验证与签批门禁',
      titleEn: 'Enterprise Production Readiness: Five Change Triggers & Four Release Gates',
      summaryZh: '压轴揭晓从试点走向全企业推广的放行路径：指令或模型、知识源、工具动作、系统集成与编排五类变更均须退回测试环境，依次通过回归验证、质量安全评估、红队对抗测试与实名责任人签批四道关卡。',
      summaryEn: 'Closes with the enterprise release path: updates to instructions/model, knowledge, tools, integrations, or orchestration trigger mandatory re-testing across regression, quality/safety, adversarial testing, and named-owner sign-off.',
      bulletsZh: [
        '00:21:52 — 把系统指令视同“公司章程（Articles of Incorporation）”：哪怕微改指令或新增知识源，也必须退回 Dev/Test 重验',
        '00:22:46 — 启用受信任测试员（Trusted Testers）在类生产环境核验权限边界，防范敏感数据意外暴露与编排越权',
        '00:23:24 — 四关合拢放行：回归验证 → 质量安全评估 → 对抗与安全测试 → 实名责任人签署，阶梯推进受控试点至全企规模化'
      ],
      bulletsEn: [
        '00:21:52 — Treat system instructions like Articles of Incorporation: any instruction or knowledge edit returns to Dev/Test',
        '00:22:46 — Rely on trusted testers in production-like Test environments to catch accidental sensitive data exposure',
        '00:23:24 — Four-gate release path: Regression → Quality/Safety → Adversarial Testing → Named Owner Sign-Off'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr981Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr981-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr981-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr981-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr981-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR981 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR981 Essential Insights for Governing Copilot Agents official session cover" loading="lazy" />' +
          '<button type="button" class="thr981-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr981-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr981-theater-layout">',
        '  <div class="thr981-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr981-meta">',
        '    <span class="thr981-code">THR981 · ' + item.time + '</span>',
        '    <h4 class="thr981-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr981-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr981-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr981-highlights">' + liHtml + '</ul>',
        '    <div class="thr981-actions">',
        '      <a class="thr981-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr981-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official DOCX Transcript' : '⬇ 下载官方逐字稿 (DOCX)') + '</a>',
        '      <a class="thr981-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR981 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr981Theater);
  } else {
    initThr981Theater();
  }
})();

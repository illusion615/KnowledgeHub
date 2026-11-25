/* posts/ignite-2026-brk236-agents-copilot-help-user-done/brk236-theater.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856608929001E4Ws-1791588218162001Cshc';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/356d05a7-24fc-4876-98ae-edbe2f51a7fb';

  var CHAPTERS = [
    {
      id: 'three-paths',
      tabZh: '00:00 三大构建路径',
      tabEn: '00:00 Three Build Paths',
      code: 'BRK236 · 00:00 – 16:48',
      titleZh: '从个人提效到核心工程：Agent Builder、Copilot Studio 与 Foundry 分工互联',
      titleEn: 'Role-Matched Continuum: Agent Builder, Copilot Studio, and Foundry',
      speakersZh: 'Anna Cao（Copilot 智能体产品市场负责人，2014 年加入微软）',
      speakersEn: 'Anna Cao (Product Marketing Lead, Agents in Copilot, Microsoft)',
      poster: './media/brk236-three-build-paths.jpg',
      summaryZh: '明确何时自建智能体以沉淀组织专属流程，拆解业务人员（Agent Builder 零代码与插件包）、创作者与开发者（Copilot Studio 三位一体、1,400+ 连接器、Auto Mode 与专属记忆）以及专业工程团队（GitHub + Foundry 10,000+ 模型与会话沙盒）三大互补路径，并通过 Microsoft Copilot Harness、远程 MCP 与 A2A 协议全栈贯通。',
      summaryEn: 'Maps when to codify organizational know-how across Business Users (Agent Builder + Plugins), Makers & Devs (Copilot Studio trinity, 1,400+ connectors, Auto Mode, Agent Account & Memory), and Pro Devs (GitHub + Foundry 10,000+ models & sandboxes), unified by Microsoft Copilot Harness, remote MCP, and A2A.',
      pointsZh: [
        '00:04:45 — 三大互补入口：Copilot Agent Builder、Copilot Studio 与 GitHub + Foundry 按角色匹配',
        '00:10:25 — 跨系统连接：融合 Work IQ、Foundry IQ、1,400+ 第三方连接器、Auto Mode 与 A2A 协议',
        '00:11:45 — 统一内核：八月发布的执行层正式定名 Microsoft Copilot Harness，横跨四大平台'
      ],
      pointsEn: [
        '00:04:45 — Three Build Paths: Copilot Agent Builder, Copilot Studio, and GitHub + Foundry',
        '00:10:25 — Deep Connectivity: Work IQ, Foundry IQ, 1,400+ connectors, Auto Mode & A2A protocol',
        '00:11:45 — Shared Engine: August harness renamed Microsoft Copilot Harness across all four surfaces'
      ]
    },
    {
      id: 'shiproom-patterns',
      tabZh: '17:00 高频范式与周报实战',
      tabEn: '17:00 Patterns & Shiproom',
      code: 'BRK236 · 17:00 – 26:35',
      titleZh: '每周数百万次构建背后：两大高价值范式与 Shiproom 真实运行检视',
      titleEn: 'Behind Millions of Weekly Builds: Two Core Patterns & Live Shiproom Walkthrough',
      speakersZh: 'Ned Friend（Agent Builder 团队负责人，Copilot Chat 与 Researcher 创始 GPM）',
      speakersEn: 'Ned Friend (Product Lead, Agent Builder; Founding GPM of Copilot Chat & Researcher)',
      poster: './media/brk236-shiproom-docx-report.jpg',
      summaryZh: '提炼每周数百万用户在 Copilot 内自建智能体的两大核心场景——权威指南（Authoritative Guidance）与标准化交付物（Standardized Deliverables）；现场通过 /shiproom reporter 斜杠指令拉取 Azure DevOps 史诗看板与高管邮件，直出原生 Word 周报供全组实时批注，并展示微软内部最受欢迎的员工自助智能体（ESS）与插件页聚合。',
      summaryEn: 'Distills Authoritative Guidance and Standardized Deliverables from millions of weekly builds, then invokes /shiproom reporter live over real Azure DevOps Epics and leadership emails to generate a collaborative Word report alongside pinned JD, Spec Writer, Onboarding, and ESS agents.',
      pointsZh: [
        '00:18:10 — 两大黄金范式：严锁官方信源的“权威指南”与跨周高度一致的“标准化交付物”',
        '00:21:20 — /shiproom reporter 实战：自动串联 ADO 工作项与高管关注邮件生成可协同 Word 报告',
        '00:25:15 — 默认封装为插件：所有 Agent Builder 产物统一汇聚至 Plugins 面板区分个人、共享与管理员认证'
      ],
      pointsEn: [
        '00:18:10 — Two Core Scenarios: Authoritative Guidance and repeatable Standardized Deliverables',
        '00:21:20 — /shiproom reporter Live: Synthesizes real ADO Epics and top-of-mind mail into native DOCX',
        '00:25:15 — Wrapped as Plugins: Every Agent Builder agent surfaces in Plugins with admin-approved badges'
      ]
    },
    {
      id: 'builder-deep-dive',
      tabZh: '26:36 渐进技能与跨源接地',
      tabEn: '26:36 Skills, Code & Grounding',
      code: 'BRK236 · 26:36 – 36:40',
      titleZh: '从零精调 Shiproom 智能体：自动生成 Python 技能、嵌套智能体与协同编辑',
      titleEn: 'Building Shiproom Reporter Live: Progressive Python Skills, Nested Agents & Co-Authoring',
      speakersZh: 'Ned Friend（Agent Builder 团队负责人）',
      speakersEn: 'Ned Friend (Product Lead, Agent Builder)',
      poster: './media/brk236-agent-builder-skills-code.jpg',
      summaryZh: '完整演示从自然语言创建到团队推广闭环：一键“建议改进”优化指令优先级；拆解渐进披露（Progressively Disclosed）技能包内自动编写的 scripts/main.py 逾期比对脚本；嵌套挂载 Spec Reviewer 智能体；限定单场周期会议纪要、开启 Exchange ADO 连接器与 Power BI / Fabric 接地；配置不自动外发的 Outlook 草稿动作；添加 Anna 为共同编辑者并查看会话调用统计。',
      summaryEn: 'End-to-end live build: interactive Suggest Improvements, progressively disclosed skills with auto-generated Python date-comparison code (scripts/main.py), nested Agent Builder Spec Reviewer, scoped recurring Teams transcripts, Exchange ADO & Fabric grounding, human-confirmed Outlook draft actions, co-editor sharing with document ACL prompts, and usage analytics.',
      pointsZh: [
        '00:29:30 — 渐进披露技能与代码：自动生成 shiproom-docx-report 技能及 scripts/main.py 日期核验脚本',
        '00:30:20 — 智能体嵌套与精准接地：链接 Spec Reviewer，锁死周期会议纪要并接入 ADO / Fabric / Dataverse',
        '00:34:45 — 协同编辑与用量洞察：支持 Co-editor 共建、底层文档权限自动授权、知识源命中统计与提交组织目录'
      ],
      pointsEn: [
        '00:29:30 — Progressive Skills & Code: Auto-writes shiproom-docx-report skill and scripts/main.py script',
        '00:30:20 — Agent Linking & Grounding: Links Spec Reviewer, scopes recurring Teams series & ADO/Fabric',
        '00:34:45 — Co-Editing & Telemetry: Office-style co-authoring, file ACL grant, source hit stats & catalog submit'
      ]
    },
    {
      id: 'admin-agent365',
      tabZh: '36:41 全域治理与成本精算',
      tabEn: '36:41 Admin, IQ & FinOps',
      code: 'BRK236 · 36:41 – 44:50',
      titleZh: '规模化信任底座：M365 管理中心三把抓手、四维 IQ 与 Agent 365 成本管控',
      titleEn: 'Scaling Adoption with Confidence: Admin Controls, Four-Part IQ & Agent 365 Spend Management',
      speakersZh: 'Ned Friend & Anna Cao',
      speakersEn: 'Ned Friend & Anna Cao',
      poster: './media/brk236-agent365-observability.jpg',
      summaryZh: '切入 Microsoft 365 管理中心实操连接器预配、All Agents 全量盘点（一键封禁风险项或全员免申领推送高价值智能体）与组织级共享审批门禁；盘点 SharePoint 创建、完整插件构建、事件触发提示词与版本历史路线图；最后由 Anna 阐明四维 Microsoft IQ（Work / Fabric / Foundry / Web）及 Agent 365 四问模型与三步 AI 预算管控方案。',
      summaryEn: 'Walks through M365 Admin Center connector setup, All Agents block/org-wide push, and org-sharing approval gates; previews SharePoint authoring, full plugin creation, event-based prompts, and version history; closes with four-part Microsoft IQ, Agent 365 observability, three-step FinOps budgeting, and the Frontier Accelerator Program.',
      pointsZh: [
        '00:37:05 — 管理中心三抓手：预置业务连接器、All Agents 一键封禁或全员部署、关闭无审批全员共享',
        '00:41:05 — 四维上下文与安全栈：Work / Fabric / Foundry / Web IQ 配合 Entra、Purview 与 Defender',
        '00:42:50 — 三步终结预算失控：Copilot Credit Estimator 事前测算 + 成本看板按用户/按智能体追踪支出'
      ],
      pointsEn: [
        '00:37:05 — Three Admin Levers: Pre-built connectors, All Agents block/push-install, and org-share gate',
        '00:41:05 — Four-Part IQ & Security: Work/Fabric/Foundry/Web IQ backed by Entra, Purview & Defender',
        '00:42:50 — Predictable AI Spend: Copilot Credit Estimator + Cost Management Dashboard per user/agent'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk236-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk236-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk236-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var c = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk236-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? c.tabEn : c.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var pts = en ? item.pointsEn : item.pointsZh;
      var liHtml = '';
      for (i = 0; i < pts.length; i++) {
        liHtml += '<li>' + pts[i] + '</li>';
      }

      var mediaHtml = '';
      if (playerLoaded) {
        mediaHtml = '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRK236 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
      } else {
        mediaHtml = [
          '<img src="' + item.poster + '" alt="' + item.code + '" loading="lazy" />',
          '<div class="brk236-player-overlay">',
          '  <button type="button" class="brk236-play-trigger" data-load-medius="1">' + (en ? '▶ Load Official Medius Stream (45m)' : '▶ 加载微软官方点播流（45 分钟全片）') + '</button>',
          '</div>'
        ].join('\n');
      }

      stage.innerHTML = [
        '<div class="brk236-theater-layout">',
        '  <div class="brk236-player-box">' + mediaHtml + '</div>',
        '  <div class="brk236-meta">',
        '    <span class="brk236-code">' + item.code + '</span>',
        '    <h4 class="brk236-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk236-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="brk236-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk236-highlights">' + liHtml + '</ul>',
        '    <div class="brk236-actions">',
        '      <a class="brk236-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口播放官方视频') + '</a>',
        '      <a class="brk236-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Official BRK236 Session Page' : '↗ 访问 Ignite BRK236 官方主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var trigger = stage.querySelector('[data-load-medius="1"]');
      if (trigger) {
        trigger.addEventListener('click', function () {
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
    document.addEventListener('DOMContentLoaded', initTheater);
  } else {
    initTheater();
  }
})();

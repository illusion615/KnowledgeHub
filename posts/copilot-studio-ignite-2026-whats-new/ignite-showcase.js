/* posts/copilot-studio-ignite-2026-whats-new/ignite-showcase.js */
(function () {
  'use strict';

  var SESSIONS = [
    {
      id: 'brk267',
      code: 'BRK267 · Flagship Breakout',
      tabZh: 'BRK267 全景主论坛',
      tabEn: 'BRK267 What\'s New',
      titleZh: 'What\'s new in Copilot Studio：智能体、工作流与托管应用三位一体',
      titleEn: 'What\'s new in Copilot Studio: Unifying Agents, Workflows, and Apps',
      speakersZh: 'Jason Moore (VP of Product) & Alice Appleton (Principal PM)',
      speakersEn: 'Jason Moore (VP of Product) & Alice Appleton (Principal PM)',
      poster: './media/session-flagship-thumb.jpg',
      summaryZh: '45 分钟旗舰专场：披露前沿大模型迭代从 17 天缩短至 6 天、8 月由智能体工厂从零重构新版 Studio，并现场用自然语言构建约 $1/次运行的晨星理财顾问智能体与多模型评测看板。',
      summaryEn: '45-minute flagship talk covering the 6-day frontier model cadence, August ground-up rebuild by agents, live ~$1/run Morningstar financial advisor demo, and multi-model eval dashboards.',
      chaptersZh: [
        '00:01:15 — 八月推倒重铸：17 天→6 天模型节奏与智能体造智能体',
        '00:08:23 — 创作体验：极简设计器、智能节点工作流与托管应用 GA',
        '00:12:27 — 实战演示：Cowork 一句指令生成晨星理财顾问与审批流',
        '00:19:02 — 能力跃迁：Copilot Harness 省 45% Token、Auto 选模与记忆',
        '00:35:56 — 规模治理：日跑超百万智能体、Evals 多模比价与 FinOps 账本'
      ],
      chaptersEn: [
        '00:01:15 — August Rebuild: 17d→6d Model Cadence & Software Factory',
        '00:08:23 — Maker Experience: New Designer, AI Workflows & Apps GA',
        '00:12:27 — Live Demo: Cowork Prompt to ~$1/Run Financial Advisor',
        '00:19:02 — Capabilities: Copilot Harness (-45% Tokens), Auto & Memory',
        '00:35:56 — Governance: 1M+ Daily Internal Agents, Evals & FinOps'
      ],
      sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856613640001EPcc-1791587921531001Fi0n?source=sessions',
      videoUrl: 'https://medius.microsoft.com/Embed/video-nc/93a9a81e-ba1c-4cdd-a0b8-557097cf52ab',
      slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/93a9a81e-ba1c-4cdd-a0b8-557097cf52ab'
    },
    {
      id: 'brk259',
      code: 'BRK259 · Deep Architecture',
      tabZh: 'BRK259 Copilot Harness 内核',
      tabEn: 'BRK259 Copilot Harness',
      titleZh: 'See how the Microsoft Copilot harness powers Copilot Studio',
      titleEn: 'See how the Microsoft Copilot harness powers Copilot Studio',
      speakersZh: 'Alice Appleton & Ben Appleby (Agentic Runtime Team)',
      speakersEn: 'Alice Appleton & Ben Appleby (Agentic Runtime Team)',
      poster: './media/session-harness-thumb.jpg',
      summaryZh: '深入拆解安全容器内的单循环执行引擎（命令行、代码执行与本地文件系统），揭秘工具失败后 84%–91% 的自主重算恢复率与 83%–88% 缓存命中降本机制。',
      summaryEn: 'Deep dive into the containerized continuous execution loop (CLI, code execution, filesystem), 84%–91% tool failure self-recovery, and 83%–88% prompt cache hit rates.',
      chaptersZh: [
        '安全沙盒容器：50,000 行导出数据直接落盘写代码查询，告别塞爆上下文',
        '确定性生命周期钩子（Hooks）：在工具调用前后拦截校验，不泄露凭据密码',
        '连接器自愈：只读探针令 Excel Online 生产调用成功率从 85.6% 升至 96.3%'
      ],
      chaptersEn: [
        'Secure Container: Query 50,000-row exports via local filesystem & code',
        'Lifecycle Hooks: Deterministic pre/post tool guardrails with zero raw secrets',
        'Connector Tuning: Read-only helpers lifted Excel Online success 85.6% → 96.3%'
      ],
      sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612459001EfZu-1791588174633001COAZ?source=sessions',
      videoUrl: 'https://medius.microsoft.com/Embed/video-nc/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd',
      slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd'
    },
    {
      id: 'brk261',
      code: 'BRK261 · Digital Teammates',
      tabZh: 'BRK261 独立账号与持久代理',
      tabEn: 'BRK261 Persistent Agents',
      titleZh: 'From tool to teammate: Persistent agents for shared processes',
      titleEn: 'From tool to teammate: Persistent agents for shared processes',
      speakersZh: 'Evan Liu & Matt Heidinger',
      speakersEn: 'Evan Liu & Matt Heidinger',
      poster: './media/session-persistent-thumb.jpg',
      summaryZh: '演示如何为智能体配置专属 Microsoft Entra 账号、邮箱与 Teams 在线身份（2026 年 12 月公测），结合事件触发器与跨周记忆接管财务周度预算复盘等共享流程。',
      summaryEn: 'Demonstrates dedicated Microsoft Entra agent accounts, mailboxes, and Teams presence (Public Preview Dec 2026) with triggers and memory for recurring team processes.',
      chaptersZh: [
        '专属数字员工身份：员工可在 Teams 或 Outlook 直接 @提及智能体交接任务',
        '信号与定时触发：新邮件、SharePoint 条目变更或每周二定时自动唤醒执行',
        '跨周期业务记忆：自动记住上周未决预算疑问并追问责任人，用户随时可查可删'
      ],
      chaptersEn: [
        'Teammate Identity: @mention agents directly in Teams, Outlook, and Office docs',
        'Signal Triggers: Autonomous runs on new mail, SharePoint items, or schedules',
        'Process Memory: Carries unresolved budget items week-to-week with user control'
      ],
      sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612754001EwNc-1791588132209001CdtH?source=sessions',
      videoUrl: 'https://medius.microsoft.com/Embed/video-nc/9ff88e92-a86a-4077-8aa5-7e5819913ce0',
      slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/9ff88e92-a86a-4077-8aa5-7e5819913ce0'
    },
    {
      id: 'brk379',
      code: 'BRK379 · Customer Service',
      tabZh: 'BRK379 全渠道客服 Harness',
      tabEn: 'BRK379 Customer Harness',
      titleZh: 'Build Customer-Facing Agents in Copilot Studio, Teams, and CCI',
      titleEn: 'Build Customer-Facing Agents in Copilot Studio, Teams, and CCI',
      speakersZh: 'Copilot Studio & Contact Center Intelligence Team',
      speakersEn: 'Copilot Studio & Contact Center Intelligence Team',
      poster: './media/session-customer-thumb.jpg',
      summaryZh: '面向外部客户的专属 Customer Conversation Harness 正式商用（GA）：一次编写即可同步发布至网页聊天、移动端与 Teams Phone 语音专线，遇复杂诉求带完整上下文转接人工坐席。',
      summaryEn: 'Customer Conversation Harness (GA): author once across web chat, messaging, and Teams Phone voice, escalating unresolved issues to human reps with full context.',
      chaptersZh: [
        '语音与数字全渠道同源：告别僵硬按键菜单，统一共享知识库、技能与对话行为',
        '子智能体分工协作：主控接待智能体按意图路由给账单、订单等专职子智能体',
        '无缝转接联络中心：通过 Microsoft Contact Center Intelligence 携带摘要交接人工'
      ],
      chaptersEn: [
        'Unified Voice & Chat: Author once for web, messaging, and Teams Phone',
        'Specialized Sub-Agents: Front-door routing to billing or order specialists',
        'Warm Live Handoff: Escalate to Contact Center Intelligence with full context'
      ],
      sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856630856001Eccy-1791814920810001CGXz?source=sessions',
      videoUrl: 'https://medius.microsoft.com/Embed/video-nc/724b5fa5-2c1d-41bb-a265-970a7c3481b9',
      slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/724b5fa5-2c1d-41bb-a265-970a7c3481b9'
    },
    {
      id: 'brk262',
      code: 'BRK262 · Governance & FinOps',
      tabZh: 'BRK262 规模治理与 FinOps',
      tabEn: 'BRK262 Governance & FinOps',
      titleZh: 'Scale agents, not risk: Governance and FinOps for the enterprise',
      titleEn: 'Scale agents, not risk: Governance and FinOps for the enterprise',
      speakersZh: 'Copilot Studio Governance & Admin Center Team',
      speakersEn: 'Copilot Studio Governance & Admin Center Team',
      poster: './media/session-governance-thumb.jpg',
      summaryZh: '串联 Power Platform 管理中心（PPAC）、Microsoft 365 管理中心（MAC）与 Agent 365：覆盖创作者首次登录必读合规条款（Purview 审计）、级联额度预算及闲置点数重分配。',
      summaryEn: 'Connects PPAC, MAC, and Agent 365: mandatory maker terms audited in Purview, cascading Copilot Credit budgets, spend alerts, and unused capacity redistribution.',
      chaptersZh: [
        '事前合规门禁：创作者登录弹窗强制审阅安全守则，确认记录直通 Purview 审计',
        '事中状态面板：受限连接器置灰前置提示，一键直达组织审批责任人',
        '事后 FinOps 账本（GA）：按智能体与部门透视预付/按量消耗，触及阈值自动预警'
      ],
      chaptersEn: [
        'Pre-Build Terms: Mandatory maker policy acknowledgment audited in Purview',
        'In-Studio Guardrails: Disallowed tools greyed out up front with 1-click contact',
        'Agent FinOps (GA): Track prepaid/PAYG spend by agent & group with limit alerts'
      ],
      sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612903001EK5O-1791588157241001CqrV?source=sessions',
      videoUrl: 'https://medius.microsoft.com/Embed/video-nc/eb1012b8-4ac4-4a62-a5dc-f09b915b8886',
      slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/eb1012b8-4ac4-4a62-a5dc-f09b915b8886'
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="ignite-session-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="ignite-session-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;

    function render() {
      var en = isEnglish();
      var item = SESSIONS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'ignite-theater-tabs';

      for (i = 0; i < SESSIONS.length; i++) {
        (function (idx) {
          var s = SESSIONS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ignite-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? s.tabEn : s.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var chapters = en ? item.chaptersEn : item.chaptersZh;
      var liHtml = '';
      for (i = 0; i < chapters.length; i++) {
        liHtml += '<li>' + chapters[i] + '</li>';
      }

      stage.innerHTML = [
        '<div class="ignite-theater-layout">',
        '  <div class="ignite-theater-poster-wrap">',
        '    <img src="' + item.poster + '" alt="' + item.code + '" loading="lazy" />',
        '  </div>',
        '  <div class="ignite-theater-meta">',
        '    <span class="ignite-theater-code">' + item.code + '</span>',
        '    <h4 class="ignite-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="ignite-theater-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="ignite-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="ignite-theater-chapters">' + liHtml + '</ul>',
        '    <div class="ignite-theater-actions">',
        '      <a class="ignite-theater-btn is-primary" href="' + item.videoUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Watch On-Demand Stream' : '▶ 观看官方点播回放') + '</a>',
        '      <a class="ignite-theater-btn" href="' + item.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Download Official PPTX' : '⬇ 下载官方原版课件') + '</a>',
        '      <a class="ignite-theater-btn" href="' + item.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite Session Page' : '↗ 访问 Ignite 议题主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
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

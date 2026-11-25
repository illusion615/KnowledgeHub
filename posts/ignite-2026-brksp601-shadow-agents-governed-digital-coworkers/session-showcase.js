/* posts/ignite-2026-brksp601-shadow-agents-governed-digital-coworkers/session-showcase.js */
(function () {
  'use strict';

  var MODES = [
    {
      id: 'part1',
      tabZh: '上半场：影子风险与注册表 (00:00–21:30)',
      tabEn: 'Part 1: Shadow Risk & Registry (00:00–21:30)',
      summaryZh: '从外包顾问访客工牌类比切入，剖析四大智能体来源与 82% 企业盲区，并在 M365 管理中心现场演示 Copilot Studio、Foundry、AWS Bedrock 与 Snowflake AI 的跨平台统一盘点。',
      summaryEn: 'Opens with the contractor security badge analogy, unpacks four shadow agent sources and the 82% visibility gap, and demos live M365 Admin Center inventory across Copilot Studio, Foundry, AWS Bedrock, and Snowflake AI.',
      chaptersZh: [
        '00:01:05 — 访客门禁工牌类比：为什么企业绝不允许无工牌陌生人读写 ERP 与邮箱',
        '00:03:50 — 四类创建源井喷与 82% 企业盲区：研发、业务低代码、SaaS 内嵌与员工自采',
        '00:09:35 — 三条接入轨道：微软原生自动同步、外部云注册表连接器、自研 Agent 365 SDK',
        '00:11:20 — M365 管理中心实机演示：免进 Studio 透视指令、Jira/MCP 工具与活跃用户',
        '00:18:10 — One Agent, One Identity vs. 1:N Blueprint：技术 Owner、业务 Sponsor 与集中凭据'
      ],
      chaptersEn: [
        '00:01:05 — Security Badge Analogy: Why badge-less strangers never get CRM/ERP access',
        '00:03:50 — Four Creation Streams & 82% Gap: Devs, business makers, SaaS & web tools',
        '00:09:35 — Three Intake Paths: Native auto-sync, Connected Platform sync & Agent 365 SDK',
        '00:11:20 — Live M365 Registry Demo: Inspect instructions, Jira/MCP tools & active users',
        '00:18:10 — Identity vs. 1:N Blueprint: Technical Owner, Business Sponsor & shared secrets'
      ]
    },
    {
      id: 'part2',
      tabZh: '下半场：Python 实机纳管与零信任闭环 (21:30–41:50)',
      tabEn: 'Part 2: Live Python Onboarding & Zero Trust (21:30–41:50)',
      summaryZh: '对运行在 Azure Container Apps 上的无身份 Python 薪酬助手 Payroll Pal 执行零重写纳管：通过 VS Code Agent 365 Skills 四步挂载 AI Teammate 身份、Defender 全链路遥测、条件访问、限时访问包、Purview DLP 实时阻断与离职自动转交。',
      summaryEn: 'Takes Payroll Pal—an ownerless Python agent on Azure Container Apps—and onboards it without code rewrites via VS Code Agent 365 Skills, enforcing AI Teammate identity, Defender trace telemetry, Conditional Access, Access Packages, Purview DLP blocking, and Lifecycle Workflows.',
      chaptersZh: [
        '00:21:45 — 影子智能体现形：Payroll Pal 凭共享密钥裸奔泄露 Maya Chen 薪资与银行卡号',
        '00:23:35 — VS Code Agent 365 Skills 四步纳管：手工 CLI 两天压至 4–5 分钟预演 / 20 分钟生效',
        '00:30:15 — Teams 数字同事与 Defender 遥测：捕获网关 MCP 调用、推理请求与完整 Trace ID',
        '00:31:45 — Entra 条件访问与限时访问包：高风险自动封禁邮件 MCP，按月审批到期回收',
        '00:34:30 — Purview DLP 实时阻断与离职继任：拦截银行账号外发邮件，Sponsor 离职自动转交主管'
      ],
      chaptersEn: [
        '00:21:45 — Unmanaged Baseline: Payroll Pal exposes salary & bank details with zero sign-in',
        '00:23:35 — VS Code Agent 365 Skills: Compressing ~2 days manual CLI into 4–5m dry run / 20m live',
        '00:30:15 — Teams AI Teammate & Defender Trace: Capturing gateway MCP calls & Trace IDs',
        '00:31:45 — Conditional Access & Access Packages: High-risk Mail MCP block & 30-day expiry',
        '00:34:30 — Purview DLP & Lifecycle Workflows: Real-time bank-leak block & manager auto-handover'
      ]
    }
  ];

  var SESSION_META = {
    code: 'BRKSP601 · Partner Breakout · 45 Min',
    titleZh: 'Turn shadow agents into governed digital coworkers（将影子智能体转化为受控数字同事）',
    titleEn: 'Turn shadow agents into governed digital coworkers',
    speakersZh: 'Rafsan Huseynov (3× MVP, Manager of Agentic AI Solutions, SHI) · Matthew Devaney (7× MVP, Sr. Solutions Engineer, SHI)',
    speakersEn: 'Rafsan Huseynov (3× MVP, Manager, SHI) · Matthew Devaney (7× MVP, Sr. Solutions Engineer, SHI)',
    poster: './media/session-brksp601-thumb.jpg',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787854983514001tUM8-1791588196008001CfTD',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/225588bd-0cbf-4ee8-a63a-968068d6ffdb',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/225588bd-0cbf-4ee8-a63a-968068d6ffdb'
  };

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initShowcase() {
    var controls = document.querySelector('[data-sandbox-controls="brksp601-session-player"]');
    var stage = document.querySelector('[data-sandbox-stage="brksp601-session-player"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var mode = MODES[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brksp601-theater-tabs';

      for (i = 0; i < MODES.length; i++) {
        (function (idx) {
          var item = MODES[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brksp601-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? item.tabEn : item.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var chapters = en ? mode.chaptersEn : mode.chaptersZh;
      var liHtml = '';
      for (i = 0; i < chapters.length; i++) {
        liHtml += '<li>' + chapters[i] + '</li>';
      }

      var mediaHtml = playerLoaded
        ? '<iframe class="brksp601-player-frame" src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRKSP601 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRKSP601 Official Session Poster" loading="lazy" />',
            '<div class="brksp601-poster-overlay">',
            '  <span>' + (en ? 'Official Microsoft Medius Stream (No-Cookie Embed)' : '微软官方 Medius 点播流（支持页内免跳转加载）') + '</span>',
            '  <button type="button" class="brksp601-embed-trigger" data-load-embed="1">' + (en ? '▶ Load Inline Player' : '▶ 页内加载点播视频') + '</button>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brksp601-theater-layout">',
        '  <div class="brksp601-player-wrap">',
        mediaHtml,
        '  </div>',
        '  <div class="brksp601-meta">',
        '    <span class="brksp601-code">' + SESSION_META.code + '</span>',
        '    <h4 class="brksp601-title">' + (en ? SESSION_META.titleEn : SESSION_META.titleZh) + '</h4>',
        '    <div class="brksp601-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brksp601-summary">' + (en ? mode.summaryEn : mode.summaryZh) + '</p>',
        '    <ul class="brksp601-chapters">' + liHtml + '</ul>',
        '    <div class="brksp601-actions">',
        '      <a class="brksp601-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 打开官方视频流') + '</a>',
        '      <a class="brksp601-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brksp601-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRKSP601 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var trigger = stage.querySelector('[data-load-embed="1"]');
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
    document.addEventListener('DOMContentLoaded', initShowcase);
  } else {
    initShowcase();
  }
})();

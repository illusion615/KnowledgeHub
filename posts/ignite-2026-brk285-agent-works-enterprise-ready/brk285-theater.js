/* posts/ignite-2026-brk285-agent-works-enterprise-ready/brk285-theater.js */
(function () {
  'use strict';

  var SESSION_LINKS = {
    poster: './media/brk285-session-thumb.jpg',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856616329001EyM8-1791588352535001C8TA',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/048e7075-9b0a-458d-b28b-3fa6113f248b',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/048e7075-9b0a-458d-b28b-3fa6113f248b'
  };

  var CHAPTER_GROUPS = [
    {
      id: 'overview',
      tabZh: '00:00 成熟度总纲',
      tabEn: '00:00 Maturity Framework',
      code: 'BRK285 · Part 01 (00:00 – 08:00)',
      titleZh: '从可用原型到受信任企业系统：三阶段自主权委派模型',
      titleEn: 'From Working Prototype to Trusted System: Three-Stage Delegation Model',
      speakerZh: '主讲：Omprakash Reddy Adudodla (Azure CODE 首席客户工程经理)',
      speakerEn: 'Speaker: Omprakash Reddy Adudodla (Principal Customer Engineering Manager, Azure CODE)',
      summaryZh: '开场现场举手调查揭示核心落差：多数团队已做出能给出漂亮回答的原型，却无人敢撤掉人工逐单审批直接投产。本段确立快速试验、企业就绪、有界全自主三阶演进坐标与七类微软技术分工。',
      summaryEn: 'Opens with an audience poll exposing the production trust gap: many teams have a working prototype, yet few let it act unreviewed. Defines the Experiment, Enterprise-Ready, and Bounded Autonomous stages.',
      itemsZh: [
        '00:00 – 02:15 — 现场两次举手提问：能答对问题 vs. 敢免审批进生产系统的鸿沟',
        '02:55 – 04:20 — 错资源幻觉陷阱：回答措辞再漂亮，查错目标资源依然是生产事故',
        '04:25 – 05:55 — 核心命题转换：自主化不是消灭人类，而是凭证据决定委派多少责任',
        '06:10 – 07:55 — 七大技术栈职责定界：Copilot Studio、Foundry、Dynamics 365、Azure 与 Fabric'
      ],
      itemsEn: [
        '00:00 – 02:15 — Audience show-of-hands: useful answer vs. unreviewed production action',
        '02:55 – 04:20 — Wrong-resource hallucination trap: fluent prose on the wrong asset still fails',
        '04:25 – 05:55 — Reframing autonomy: delegating earned responsibility rather than removing humans',
        '06:10 – 07:55 — Seven-product division of labor across Studio, Foundry, Dynamics 365, and Azure'
      ]
    },
    {
      id: 'journey1',
      tabZh: '08:00 旅程一：原型重构',
      tabEn: '08:00 Journey 1: Architecture',
      code: 'BRK285 · Part 02 (08:00 – 27:30)',
      titleZh: '旅程一：订单到回款用例发现原型、公网断点踩坑与 Superagents 重构',
      titleEn: 'Journey 1: Order-to-Cash Prototype, Public Endpoint Failure & Superagents Rebuild',
      speakerZh: '主讲：Tim Schaeps (Microsoft 合作伙伴解决方案架构师)',
      speakerEn: 'Speaker: Tim Schaeps (Partner Solution Architect, Microsoft)',
      summaryZh: '实机演示一天搭出的订单到回款（Order-to-Cash）8 个 AI 用例发现应用，复盘只堆功能触发 Azure 禁用公网端点策略中断的教训，并展示如何用 Microsoft Learn MCP 与五大设计原则从零重铸企业底座。',
      summaryEn: 'Walks through a 1-day Order-to-Cash discovery app generating 8 AI use cases, exposes how feature-stacking broke on Azure public-endpoint policies, and rebuilds via Microsoft Learn MCP and five principles.',
      itemsZh: [
        '09:45 – 11:30 — 智能体转型三组件：卓越中心（AI CoE）、AI 基础架构与智能体工厂',
        '13:10 – 17:25 — Demo 1 实录：生成 8 个订单到回款用例，直击 Cosmos DB 公网端点策略阻断',
        '18:45 – 20:55 — 架构师利器：先调 Microsoft Learn MCP 检索 CAF/WAF 盲区再写代码，切勿先重画界面',
        '21:10 – 27:20 — Demo 2 与闭环：五大原则、Superagents 五层平台及 GitHub Actions OIDC 免密发布'
      ],
      itemsEn: [
        '09:45 – 11:30 — Three transformation blocks: AI CoE, AI Foundation Architecture, and Agent Factory',
        '13:10 – 17:25 — Demo 1: 8 Order-to-Cash use cases and reactive Cosmos DB public-endpoint outage',
        '18:45 – 20:55 — Architect workflow: challenge designs with Microsoft Learn MCP before rebuilding UI',
        '21:10 – 27:20 — Demo 2: Five design principles, Superagents platform, and OIDC passwordless CI/CD'
      ]
    },
    {
      id: 'journey2',
      tabZh: '27:35 旅程二：FACS 实机排障',
      tabEn: '27:35 Journey 2: FACS Support',
      code: 'BRK285 · Part 03 (27:35 – 44:15)',
      titleZh: '旅程二：Azure 支持团队 18 个月演进与 Contoso 503 故障全自主结案',
      titleEn: 'Journey 2: 18-Month Azure Support Evolution & Contoso 503 Autonomous Resolution',
      speakerZh: '主讲：Arun Masilamani & Ali Ijaz (Azure 自主支持排障项目与产品负责人)',
      speakerEn: 'Speakers: Arun Masilamani & Ali Ijaz (Azure Supportability Autonomous Resolution Leads)',
      summaryZh: '还原微软内部 Customer Zero 历时 18 个月打磨的全自主客户服务（FACS）：现场走查 Contoso 应用服务 09:08 部署后 0/3 实例健康的 503 工单，拆解低代码协同推理与全代码持久状态机的分工。',
      summaryEn: 'Inside Azure Support Customer Zero over 18 months: live walkthrough of Contoso App Service 503 outage (0 of 3 healthy instances after 09:08 deploy) and low-code + pro-code architecture.',
      itemsZh: [
        '28:55 – 30:55 — FACS 实机走查：免问订阅 ID 直查 0/3 健康实例，定位 09:08 部署故障并待客户确认后关单',
        '32:45 – 36:15 — 赢得自主权的四步验证与两条铁律：绝不授予无法解释或无法撤销的权限',
        '36:35 – 40:50 — 18 个月三阶演进：不推倒重写低代码智能体，按需叠加 Durable Functions 与 Cosmos DB',
        '41:00 – 44:10 — 生产参考架构全景：Dynamics 365 + Copilot Studio 六专员 + 四路 MCP + Foundry 门禁'
      ],
      itemsEn: [
        '28:55 – 30:55 — FACS walkthrough: zero-prompt subscription lookup, 0/3 healthy instances after 09:08 deploy',
        '32:45 – 36:15 — Four human-validation steps and two iron rules: explainable and reversible authority',
        '36:35 – 40:50 — 18-month additive architecture: extending Copilot Studio with Durable Functions & Cosmos DB',
        '41:00 – 44:10 — Live reference architecture: Dynamics 365, 6 Studio specialists, 4 MCP bridges, Foundry gates'
      ]
    },
    {
      id: 'hillclimb',
      tabZh: '44:15 爬山闭环与复盘',
      tabEn: '44:15 Hill Climbing & Wrap-Up',
      code: 'BRK285 · Part 04 (44:15 – 51:15)',
      titleZh: '直面线上幻觉：六步爬山迭代法、跨平台归属追踪与五步复用框架',
      titleEn: 'Confronting Live Hallucinations: Hill-Climbing Loop, Trace Ownership & 5-Step Pattern',
      speakerZh: '主讲：Ali Ijaz & Omprakash Reddy Adudodla',
      speakerEn: 'Speakers: Ali Ijaz & Omprakash Reddy Adudodla',
      summaryZh: '坦陈架构上线后智能体依然会出现幻觉，单纯在提示词里写「请更聪明点」毫无作用；详述基于逐轮追踪、失败分桶与专家基准集的爬山（Hill Climbing）工程方法，解决跨部门推诿与财务算力追问。',
      summaryEn: 'Candidly addresses post-launch hallucinations—telling prompts to "think smarter" fails—and details systematic hill climbing against SME benchmarks plus turn-level trace ownership.',
      itemsZh: [
        '44:20 – 46:55 — 告别提示词许愿：把未决工单与幻觉归入失败分桶，用专家基准集做爬山回归测试',
        '48:25 – 49:35 — 破解企业两大痛点：逐轮追踪（Trace Studio）终结跨平台甩锅，全链路透视词元账单',
        '49:40 – 51:15 — 五步通用自检框架：构建（Build）→ 验证 → 运维化 → 自动化 → 持续优化'
      ],
      itemsEn: [
        '44:20 – 46:55 — Why "think smarter" prompts fail: failure buckets and hill climbing on SME benchmarks',
        '48:25 – 49:35 — Solving enterprise friction: turn-level traces end cross-team finger-pointing & FinOps shocks',
        '49:40 – 51:15 — Reusable 5-step maturity check: Build, Validate, Operationalize, Automate, Optimize'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk285Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk285-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk285-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var showEmbed = false;

    function render() {
      var en = isEnglish();
      var group = CHAPTER_GROUPS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabBar = document.createElement('div');
      tabBar.className = 'brk285-theater-tabs';

      for (i = 0; i < CHAPTER_GROUPS.length; i++) {
        (function (idx) {
          var g = CHAPTER_GROUPS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk285-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? g.tabEn : g.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabBar.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabBar);

      var items = en ? group.itemsEn : group.itemsZh;
      var listHtml = '';
      for (i = 0; i < items.length; i++) {
        listHtml += '<li>' + items[i] + '</li>';
      }

      var mediaInner = showEmbed
        ? '<div class="brk285-theater-iframe-wrap"><iframe src="' + SESSION_LINKS.embedUrl + '" title="Microsoft Ignite 2026 BRK285 Official Video Player" allow="fullscreen; encrypted-media" loading="lazy"></iframe></div>'
        : '<img src="' + SESSION_LINKS.poster + '" alt="Microsoft Ignite 2026 BRK285 Your agent works. Now make it enterprise-ready." loading="lazy" />';

      var toggleLabel = showEmbed
        ? (en ? '✕ Close Inline Player' : '✕ 收起内嵌播放器')
        : (en ? '▶ Load Embedded Medius Player' : '▶ 展开官方内嵌播放器');

      var barHint = en
        ? 'Official 51-min Ignite 2026 Breakout Recording (Medius Stream)'
        : 'Microsoft Ignite 2026 官方 51 分钟完整实录（支持内嵌播放）';

      stage.innerHTML = [
        '<div class="brk285-theater-layout">',
        '  <div class="brk285-theater-player-box">',
        '    ' + mediaInner,
        '    <div class="brk285-theater-overlay-bar">',
        '      <span>' + barHint + '</span>',
        '      <button type="button" class="brk285-embed-toggle" data-brk285-toggle-embed="1">' + toggleLabel + '</button>',
        '    </div>',
        '  </div>',
        '  <div class="brk285-theater-meta">',
        '    <span class="brk285-theater-code">' + group.code + '</span>',
        '    <h4 class="brk285-theater-title">' + (en ? group.titleEn : group.titleZh) + '</h4>',
        '    <div class="brk285-theater-speakers">' + (en ? group.speakerEn : group.speakerZh) + '</div>',
        '    <p class="brk285-theater-summary">' + (en ? group.summaryEn : group.summaryZh) + '</p>',
        '    <ul class="brk285-theater-chapters">' + listHtml + '</ul>',
        '    <div class="brk285-theater-actions">',
        '      <a class="brk285-theater-btn is-primary" href="' + SESSION_LINKS.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开高清点播流') + '</a>',
        '      <a class="brk285-theater-btn" href="' + SESSION_LINKS.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk285-theater-btn" href="' + SESSION_LINKS.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK285 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var toggleBtn = stage.querySelector('[data-brk285-toggle-embed]');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          showEmbed = !showEmbed;
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
    document.addEventListener('DOMContentLoaded', initBrk285Theater);
  } else {
    initBrk285Theater();
  }
})();

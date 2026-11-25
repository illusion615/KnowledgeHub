/* posts/ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot/brk382-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-brk382-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/8698eb3b-5f0b-4284-bf98-188eb338d15e',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856631314001Eynh-1791814918515001Cspr',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/8698eb3b-5f0b-4284-bf98-188eb338d15e',
    speakersZh: 'Zohar Raz · Ryan Jansen · Austin Laugesen（Microsoft）& Nicholas Balestrino（Novartis）',
    speakersEn: 'Zohar Raz · Ryan Jansen · Austin Laugesen (Microsoft) & Nicholas Balestrino (Novartis)'
  };

  var CHAPTERS = [
    {
      id: 'novartis',
      time: '00:00:00 – 00:12:45',
      tabZh: '00:00 托管四支柱与诺华案例',
      tabEn: '00:00 Pillars & Novartis Case',
      titleZh: '达·芬奇隐喻、四大管理支柱与诺华（Novartis）7.5× 智能体扩规模实战',
      titleEn: 'Da Vinci Analogy, Four Managed Pillars & Novartis 7.5× Agent Scale Story',
      summaryZh: 'Zohar Raz 阐明不能把每份个人试验品都当成《蒙娜丽莎》重兵封锁；诺华执行总监 Nicholas Balestrino 登台复盘 77,000 名员工租户如何凭安全护栏与周期确权清理，实现智能体激增 7.5 倍而零失控。',
      summaryEn: 'Zohar Raz frames balancing innovation with risk across four managed pillars, followed by Novartis Executive Director Nicholas Balestrino sharing how ~77,000 associates scaled active agents 7.5× safely.',
      bulletsZh: [
        '00:02:02 — 宣布两大新底座成员：正式商用的 Copilot Managed Runtime 与 Microsoft Copilot Harness',
        '00:08:05 — 诺华主租户实测：在用智能体增 7.5×（182 → 1,366），月活创作者增 2.6×（峰值 3,312 人）',
        '00:10:15 — 6,000 名商业员工结业自建智能体 + 10 周训练营产出约 250 个生产代理，靠周期确权清退僵尸资产'
      ],
      bulletsEn: [
        '00:02:02 — Introduces two new platform members: Copilot Managed Runtime (GA) and Microsoft Copilot Harness',
        '00:08:05 — Novartis telemetry: active agents up 7.5× (182 → 1,366), monthly makers up 2.6× (peak 3,312)',
        '00:10:15 — 6,000 US commercial associates trained + ~250 live cohort agents governed via periodic attestation'
      ]
    },
    {
      id: 'demo1',
      time: '00:12:46 – 00:20:30',
      tabZh: '12:46 Demo 1 PPAC 绿区路由',
      tabEn: '12:46 Demo 1 PPAC Green Zone',
      titleZh: '实机演示一（Zohar）：在 PPAC 搭建绿区路由、SQL OAuth 认证管控与创作者引导',
      titleEn: 'Demo 1 (Zohar): PPAC Environment Routing, SQL OAuth Policy & Maker Onboarding',
      summaryZh: '演示将创作者从拥挤的默认环境自动分流至类似 OneDrive 的个人开发环境并归入分层环境组；用全新高级连接器策略替代传统 DLP，细粒度锁死 SQL 动作与 OAuth 登录。',
      summaryEn: 'Walks through routing makers out of the crowded default environment into personal developer environments, replacing legacy DLP with Advanced Connector Policies down to SQL action and OAuth level.',
      bulletsZh: [
        '00:16:02 — 配置兜底绿区与 Pro Maker 分层环境组，勾选单选框平滑接管并淘汰旧版 DLP 策略',
        '00:17:31 — 在 SQL 连接器内精细允许/禁止 Delete 或 Update 动作，并强制限定仅允许 OAuth 身份认证',
        '00:18:35 — 创作者端强制阅读条款（Purview 留痕），禁用连接器直接置灰，配合 Ask Mica 智能体自助申诉'
      ],
      bulletsEn: [
        '00:16:02 — Configures layered environment groups with a one-check migration toggle off legacy DLP',
        '00:17:31 — Locks SQL Server down to allowed CRUD actions and enforces OAuth-only authentication',
        '00:18:35 — Enforces Purview-audited sign-in terms, greys out blocked connectors, and surfaces Ask Mica help'
      ]
    },
    {
      id: 'demo2',
      time: '00:20:31 – 00:33:58',
      tabZh: '20:31 Demo 2 CMR 与 MAC 管控',
      tabEn: '20:31 Demo 2 CMR & MAC Control',
      titleZh: '实机演示二（Ryan）：Cowork 单提示词构建微应用与 M365 管理中心默认绿区',
      titleEn: 'Demo 2 (Ryan): Prompt-Built App in Cowork & Day-One Default Green Zone in MAC',
      summaryZh: 'Ryan Jansen 剖析正式商用的 Copilot Managed Runtime 如何统一承接来自 Cowork、VS Code 乃至 Lovable、Claude 的应用，并在 Microsoft 365 管理中心提供开箱默认开启的绿区护栏与一键封禁。',
      summaryEn: 'Ryan Jansen demonstrates building an Ignite Session Planner app from a single Cowork prompt and governing all 953 tenant apps inside the Microsoft 365 admin center with an on-by-default green zone.',
      bulletsZh: [
        '00:25:15 — 跨平台统一宿主：无论始于 Cowork、GitHub Copilot 还是 Lovable / Claude，均归口同一控制面',
        '00:27:55 — 在 Cowork 单条提示词生成 Ignite 议程追踪微应用，自动拉取同事头像与实时进行中议题',
        '00:30:50 — 切入 MAC All apps 盘点 953 款受管应用：默认绿区收敛至 M365 核心连接器，支持一键禁用与 CSP 围栏'
      ],
      bulletsEn: [
        '00:25:15 — Unified host for apps built in Cowork, Copilot Code, VS Code, Lovable, or Claude',
        '00:27:55 — Generates a live Ignite Session Planner app in Cowork grounded in org colleague profiles',
        '00:30:50 — Governs 953 managed apps in MAC with default core-M365 connectors, 1-click block, and CSP'
      ]
    },
    {
      id: 'demo3',
      time: '00:33:59 – 00:40:55',
      tabZh: '33:59 Demo 3 沙盒拦截与 ALM',
      tabEn: '33:59 Demo 3 Host CSP & ALM',
      titleZh: '实机演示三（Austin）：Managed Host 实时阻断未授权外呼、阶梯式 ALM 与小时级告警',
      titleEn: 'Demo 3 (Austin): Live Managed Host CSP Blocking, Tiered ALM & 1-Hour Alerts',
      summaryZh: 'Austin Laugesen 现场用外部 SDK + GitHub Copilot 编写代码应用连击测试：白名单连接器畅通无阻，而试图越界请求 Bing 外部端点的调用被 Managed Host 按 CSP 策略当场拦截报错。',
      summaryEn: 'Austin Laugesen tests a pro-code app live: allowed connectors succeed while arbitrary external calls to Bing blow up immediately under Managed Host Content Security Policy enforcement.',
      bulletsZh: [
        '00:36:35 — 现场压测三栏代码应用：受允连接器正常放行，越界请求 Bing 当场触发右侧 CSP 拦截报错',
        '00:38:15 — 对比 Power Platform Git 管线与 CMR 双层 ALM（零配置环境内 Dev/Test/Prod 阶段 vs 跨环境严管目标）',
        '00:40:05 — Monitor 高敏告警可在 1 小时内捕获生产故障，支持 API 导出并直推 Teams 频道或 ServiceNow 工单'
      ],
      bulletsEn: [
        '00:36:35 — Live sandbox test: allowed connector calls pass while unauthorized Bing calls fail CSP checks',
        '00:38:15 — Scales ALM from zero-setup in-environment stages to shrink-wrapped cross-environment prod',
        '00:40:05 — New high-sensitivity Monitor alerts fire within 1 hour and route to Teams or ServiceNow via API'
      ]
    },
    {
      id: 'demo4',
      time: '00:40:56 – 00:47:20',
      tabZh: '40:56 Demo 4 点数账本与 $10 CoE',
      tabEn: '40:56 Demo 4 FinOps & $10 CoE',
      titleZh: '实机演示四（Zohar）：双轨计费透视与 Cowork Admin 插件 30 分钟 $10 生成超级 CoE',
      titleEn: 'Demo 4 (Zohar): Credit Visibility & Building a CoE Superset in 30 Min for $10',
      summaryZh: '拆解坐席订阅（USL）与按量点数（UBB）双轨制及创作者端实时消耗提示；基于单一 OpenAPI 规范衍生的 Cowork 管理插件，仅耗费 10 美元与 30 分钟便在租户内生成超越传统 CoE Toolkit 的全栈治理应用。',
      summaryEn: 'Covers USL vs. Copilot Credit FinOps across PPAC/MAC and live demo of the Power Platform Admin Plugin in Cowork generating a full CoE Toolkit superset app in 30 minutes for $10.',
      bulletsZh: [
        '00:41:28 — 创作者在 Studio 左上角（如 88 credits）与 Cowork `/cost` 实时查看点数消耗，管理中心向 MAC 汇聚',
        '00:43:10 — 单一 OpenAPI 规范按月同步生成 .NET/Python SDK、Admin V2 连接器、15 组 PAC CLI 与 Cowork 插件',
        '00:44:45 — 顾问 Reza 夜间 3 小时打磨提示词包，复现导入仅需 30 分钟与 $10 即可交付 CMR 版超级 CoE 应用'
      ],
      bulletsEn: [
        '00:41:28 — Real-time maker credit counters (e.g., 88 credits in Studio, `/cost` in Cowork) and MAC migration',
        '00:43:10 — One OpenAPI spec ships monthly .NET/Python SDKs, Admin V2 connector, 15 PAC CLI groups & plugin',
        '00:44:45 — Rebuilds a rich CoE Toolkit superset as a CMR app in 30 minutes for ~$10 (`aka.ms/powerplatform360`)'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk382Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk382-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk382-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk382-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk382-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK382 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK382 Deploy solutions at scale with Power Platform or Copilot Managed Runtime official session cover" loading="lazy" />' +
          '<button type="button" class="brk382-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk382-play-pill">' + (en ? '▶ Load Official Video Player (47 min)' : '▶ 点击加载官方内嵌点播流（47 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk382-theater-layout">',
        '  <div class="brk382-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk382-meta">',
        '    <span class="brk382-code">BRK382 · ' + item.time + '</span>',
        '    <h4 class="brk382-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk382-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk382-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk382-highlights">' + liHtml + '</ul>',
        '    <div class="brk382-actions">',
        '      <a class="brk382-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk382-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk382-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK382 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk382Theater);
  } else {
    initBrk382Theater();
  }
})();

/* posts/ignite-2026-live07-copilot-managed-runtime-build-want-run/live07-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-live07-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/0c28b348-0e35-4615-9f32-d9bbcc40e458',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1793676097907001gh3w-AAAAAAAAAAAAAAAAAAAA',
    blogUrl: 'https://aka.ms/CMRblog',
    speakersZh: 'Jiun Hong（主持人）· Clay Wesener（Microsoft 总经理）· Malavika Balachandran Tadeusz（Lovable 产品经理）',
    speakersEn: 'Jiun Hong (Host) · Clay Wesener (GM, Microsoft) · Malavika Balachandran Tadeusz (PM, Lovable)'
  };

  var CHAPTERS = [
    {
      id: 'vision',
      time: '00:00:10 – 00:02:04',
      tabZh: '00:10 愿景与跨端构建',
      tabEn: '00:10 Vision & Build Anywhere',
      titleZh: '告别 localhost 孤岛：从一线排班表到销售智能体工作流的统一归宿',
      titleEn: 'Beyond localhost Silos: One Destination from Shift Schedules to Sales Workflows',
      summaryZh: 'Clay Wesener 与 Malavika Balachandran Tadeusz 阐明核心定位——无论用户从 Cowork、GitHub 还是 Lovable 起步，应用都不应沦为无法访问的本地端口，而是直接部署到同一套企业级托管底座运行并受控。',
      summaryEn: 'Clay Wesener and Malavika Balachandran Tadeusz frame the core thesis: whether builders start in Cowork, GitHub, or Lovable, apps never get stranded as localhost URLs and instead ship into one governed hosting destination.',
      bulletsZh: [
        '00:00:31 — Clay 指出构建入口已全面铺开（Cowork、GitHub、Lovable），关键是让产物集中托管与治理而非困在 localhost',
        '00:01:17 — Malavika 分享真实构建跨度：从后勤保洁人员自建值班排班表，到 AI 原生销售团队搭建 CRM 智能体工作流',
        '00:01:50 — 在用户最顺手的工具中承接创意，消除从个人试验跨向企业投产时的技术断崖（Cliff）'
      ],
      bulletsEn: [
        '00:00:31 — Clay highlights how builders start across Cowork, GitHub, and Lovable while needing one place to host and govern',
        '00:01:17 — Malavika shares real-world Lovable usage: from janitors building shift schedules to AI-native sales teams on CRM',
        '00:01:50 — Meets makers where they are so prototypes never hit a deployment cliff on the way to enterprise production'
      ]
    },
    {
      id: 'entra-crm',
      time: '00:02:05 – 00:03:51',
      tabZh: '02:05 Entra 身份与销售简报',
      tabEn: '02:05 Entra & CRM Call Briefs',
      titleZh: '默认 Microsoft Entra 鉴权与连接器权限继承：会前客户简报实战',
      titleEn: 'Out-of-Box Microsoft Entra & Connector ACL Inheritance: Pre-Call Sales Briefings',
      summaryZh: '针对业务开发者最头疼的身份认证与敏感数据越权难题，托管运行时在底层统一由 Microsoft Entra 护航，并通过连接器自动继承当前登录代表的客户数据权限。',
      summaryEn: 'Solving authentication and data-access defaults for citizen and pro builders alike, Copilot Managed Runtime governs access behind Microsoft Entra and inherits per-user permissions directly through connectors.',
      bulletsZh: [
        '00:02:15 — 业务开发者无需手写鉴权逻辑，开箱即获正确的身份与数据访问默认边界',
        '00:02:40 — 应用与底层连接器统一受 Microsoft Entra 管控，连接器自动继承当前应用用户的细粒度权限',
        '00:03:12 — 销售代表会前简报案例：自动汇总客户近况、商机规模、关键干系人与增购策略，且严格限制仅对应负责代表可见'
      ],
      bulletsEn: [
        '00:02:15 — Removes manual auth wiring and provides safe out-of-the-box access defaults for citizen developers',
        '00:02:40 — Governs apps behind Microsoft Entra while connectors automatically inherit per-user data permissions',
        '00:03:12 — Sales call briefing workflow: surfaces opportunity size, account contacts, and upsell strategy strictly to authorized reps'
      ]
    },
    {
      id: 'admin-guardrails',
      time: '00:03:52 – 00:06:14',
      tabZh: '03:52 管理中心与 1,500+ 连接器',
      tabEn: '03:52 Admin Center & Guardrails',
      titleZh: '终结影子 IT：M365 管理中心单一应用台账、异常告警与四重策略护栏',
      titleEn: 'Ending Shadow IT: Single App Inventory, Alerts & Policy Guardrails in M365 Admin Center',
      summaryZh: 'Clay 深入拆解管理员视角——无论应用诞生于 Lovable、Cowork、Copilot Code、Copilot Studio 还是 CLI，管理员都能在同一清单中看清谁建、谁用、连了什么数据，并配置 1,500+ 连接器与包内容策略。',
      summaryEn: 'Clay details the IT admin experience: every app built across Lovable, Cowork, Copilot Code, Copilot Studio, or CLI appears in one Microsoft 365 Admin Center list with performance alerts and 1,500+ connector guardrails.',
      bulletsZh: [
        '00:04:12 — 全局可观测性：单一台账追踪创建者、活跃用户与关联数据源，支持配置加载缓慢与运行报错告警，“阴影里不再有任何暗箱操作”',
        '00:04:57 — 1,500+ 预置微软/三方连接器及自定义连接器：管理员可精细管控谁能用哪些连接器及哪些连接器允许组合使用',
        '00:05:14 — 共享策略、路由策略与可用内容/软件包白名单：让一线构建出的应用天然成为组织“预先核准（Pre-blessed）”的合规资产'
      ],
      bulletsEn: [
        '00:04:12 — Unified observability: one inventory tracking makers, users, data links, slow-load alerts, and errors—"nothing happening in the shadows"',
        '00:04:57 — 1,500+ Microsoft, third-party, and custom connectors governed by combination and user-scope policies',
        '00:05:14 — Sharing, routing, and content/package policies turn frontline creations into pre-blessed enterprise applications'
      ]
    },
    {
      id: 'zero-rebuild',
      time: '00:06:15 – 00:09:07',
      tabZh: '06:15 零返工投产与行动路线',
      tabEn: '06:15 Zero-Rebuild & Next Steps',
      titleZh: '从敏捷实验直通生产免推倒重来，联动 BRK378 专场与官方博客',
      titleEn: 'From Rapid Experimentation Straight to Production Without Rebuilding',
      summaryZh: '当试验原型一开始就生长在受控运行时底座上，团队再也不会因误触禁用数据源而被管理员叫停重做；对话尾声给出了 Cowork、Copilot Studio、Lovable 与 BRK378 深度专场的完整上手路径。',
      summaryEn: 'Building on Copilot Managed Runtime from day one eliminates the painful cycle of rebuilding prototypes after IT flags an unapproved data source, closing with hands-on paths across Cowork, Studio, Lovable, and BRK378.',
      bulletsZh: [
        '00:06:26 — 超越玩具原型：在 Lovable 中完成构建即可直接推向生产，避免因违规数据源被管理员打回而推倒重写',
        '00:07:39 — 预告次日 4:15 PM 深度专场（BRK378）：现场完整演示 Cowork、Copilot Studio、Lovable 构建与管理中心实操',
        '00:08:57 — 发布官方演进主阵地 `aka.ms/CMRblog`，持续披露正式商用（GA）与本地 CLI、代码智能体等预览特性'
      ],
      bulletsEn: [
        '00:06:26 — Moves beyond throwaway prototypes straight to production without wasting engineering cycles on forced rebuilds',
        '00:07:39 — Previews the 4:15 PM breakout (BRK378) featuring live demos across Cowork, Copilot Studio, Lovable, and Admin Center',
        '00:08:57 — Points builders and IT architects to `aka.ms/CMRblog` for GA details, Fabric storage, and CLI previews'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLive07Theater() {
    var controls = document.querySelector('[data-sandbox-controls="live07-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="live07-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'live07-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'live07-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVE07 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVE07 Copilot Managed Runtime official broadcast stage cover" loading="lazy" />' +
          '<button type="button" class="live07-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="live07-play-pill">' + (en ? '▶ Load Official Video Player (9m 07s)' : '▶ 点击加载官方内嵌点播流（9 分 07 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="live07-theater-layout">',
        '  <div class="live07-player-wrap">' + mediaInner + '</div>',
        '  <div class="live07-meta">',
        '    <span class="live07-code">LIVE07 · ' + item.time + '</span>',
        '    <h4 class="live07-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="live07-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="live07-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="live07-highlights">' + liHtml + '</ul>',
        '    <div class="live07-actions">',
        '      <a class="live07-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="live07-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVE07 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="live07-btn" href="' + SESSION_META.blogUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Official CMR GA Blog' : '↗ 阅读官方 GA 发布博客') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLive07Theater);
  } else {
    initLive07Theater();
  }
})();

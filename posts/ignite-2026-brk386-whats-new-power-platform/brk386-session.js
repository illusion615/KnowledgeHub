/* posts/ignite-2026-brk386-whats-new-power-platform/brk386-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-brk386-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/9738309b-7e2d-4954-94da-58c99c9aae8d',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856631949001EQzf-1791588350490001C50X',
    videoDownloadUrl: 'https://medius.microsoft.com/video/asset/HIGHMP4/9738309b-7e2d-4954-94da-58c99c9aae8d',
    speakersZh: 'Jed Brown（应用与自动化产品管理负责人）· Adrian Orth（Microsoft）',
    speakersEn: 'Jed Brown (PM Lead for Apps & Automate) · Adrian Orth (Microsoft)'
  };

  var CHAPTERS = [
    {
      id: 'principles',
      time: '00:00:00 – 00:09:20',
      tabZh: '00:00 四大原则与 130+ 改进',
      tabEn: '00:00 Principles & 130+ Gains',
      titleZh: '四大产品过滤原则、130+ 项平台改进（65% 聚焦质量性能）与四大战略支柱',
      titleEn: 'Four Guiding Principles, 130+ Platform Improvements (65% Quality/Perf) & Four Strategic Pillars',
      summaryZh: 'Jed Brown 明确宣示 Canvas、Model-Driven 与 Power Automate 不仅不会退场，反而迎来史上最大规模投入：过去一年交付超 130 项改进，果断下线 24+ 处低效冗余区域，并坚持零强制词元消耗的“按需 AI”路线。',
      summaryEn: 'Jed Brown emphasizes preserving customer investments across Canvas, Model-Driven, and Power Automate—shipping 130+ improvements (65% quality/perf), removing 24+ friction areas, and keeping AI strictly optional on your token budget.',
      bulletsZh: [
        '00:01:40 — 四大决策原则：高回报端到端方案、极致质量底座、自主可控 AI（零强制词元消耗）、守护并放大既有投资',
        '00:04:02 — 近 12 个月交付 130+ 项改进（65% 归属质量与性能），主动精简移除 24+ 处阻碍易用性的冗余特性',
        '00:08:55 — 确立四大战略支柱：打磨现有核心产品、人机混合共创、应用内与代理协同、向 AI 解锁既有业务应用'
      ],
      bulletsEn: [
        '00:01:40 — Four product filters: high-ROI end-to-end solutions, foundation quality, AI on your terms (zero mandatory token burn), and investment preservation',
        '00:04:02 — Shipped 130+ improvements in 12 months (65% quality & perf) and deprecated 24+ underperforming areas',
        '00:08:55 — Introduces four strategic pillars: Improve Existing Product, Hybrid Authoring, Collaborate with Agents, and Unlock Apps to AI'
      ]
    },
    {
      id: 'core-perf-mobile',
      time: '00:09:21 – 00:20:25',
      tabZh: '09:21 移动端原生与 SSR 提速',
      tabEn: '09:21 Native Mobile & SSR Perf',
      titleZh: '实机演示一（Jed）：现代控件、移动端冷启动提速 55% + 6 款原生控件、服务端渲染与统一门户',
      titleEn: 'Demo 1 (Jed): Modern Controls, 55% Faster Mobile Boot + 6 Native Controls, Model SSR & Unified Portal',
      summaryZh: '逐一展示高词元效率现代控件、iPhone 15 上秒级识别二维码的 Event 360 原生移动扫码、蓝牙探针自定义组件、React Native 应用支持，以及模型驱动应用近 50% 服务端渲染提速与三合一新 Make 门户。',
      summaryEn: 'Showcases token-efficient modern Canvas controls, Event 360 sub-second QR check-in on iPhone 15 across six native mobile controls, React Native support, ~50% faster server-side rendered Model-Driven forms/grids, and the unified Make portal.',
      bulletsZh: [
        '00:12:08 — 移动端启动提速最高达 55%；内置 6 款原生控件（<1 秒扫码、PDF 缩放、手写签批、Zebra DataWedge、后台定位及即将推出的生物识别）并支持 React Native',
        '00:16:35 — 模型驱动应用新增日历视图与网格列可视化，依托服务端渲染（SSR）使表单与网格加载提速近 50%',
        '00:19:02 — 推出性能优先的全新统一创作者门户，将 Pages、Automate 与 Apps 最近资产整合进单一秒开视图'
      ],
      bulletsEn: [
        '00:12:08 — Up to 55% faster mobile startup, 6 native controls (<1s Barcode/QR GA, PDF Viewer, Pen Input, Zebra DataWedge, Geolocation, upcoming Biometrics), and React Native apps',
        '00:16:35 — Model-Driven calendar view, column visualizers, and ~50% faster form/grid load via server-side rendering',
        '00:19:02 — Performance-first unified maker portal uniting Pages, Automate, and Apps recent lists in one fast view'
      ]
    },
    {
      id: 'hybrid-authoring',
      time: '00:20:26 – 00:35:25',
      tabZh: '20:26 MCP 混合共创与维护技能',
      tabEn: '20:26 MCP Hybrid Co-Authoring',
      titleZh: '实机演示二（Jed）：三类受众共享四路 MCP 服务、编码代理多人共创与 PowerCAT 性能/排障技能',
      titleEn: 'Demo 2 (Jed): Three Audiences on Four MCP Servers, Live Agent Co-Authoring & PowerCAT Maintenance Skills',
      summaryZh: '专业开发者（BYOA）、低代码创作者与 M365 用户通过 MCP 服务器与 GitHub Copilot Harness 共享同一可编辑方案；现场演示 GitHub Copilot CLI 挂载 PowerCAT 技能扫描 81 个控件并自动修复断流。',
      summaryEn: 'Unites Pro-Dev (BYOA), Makers, and M365 users across four MCP servers; demonstrates GitHub Copilot CLI joining a live Canvas co-authoring session with a PowerCAT skill auditing 81 controls plus automated flow diagnostics.',
      bulletsZh: [
        '00:23:30 — 混合共创矩阵：Pro-dev、Maker 与 M365 三类角色共用 Automate、Canvas、Model、Pages 四路 MCP 服务',
        '00:26:50 — 咖啡店库存画布应用实机：GitHub Copilot CLI 通过 MCP 加入实时共创，调用 PowerCAT 性能技能审查 81 个旧控件',
        '00:30:45 — 强监管行业零 AI 生产代码下的无障碍/文档审计实战，以及用自然语言挂载临界库存 Teams 告警流与断流根因修复'
      ],
      bulletsEn: [
        '00:23:30 — Hybrid authoring matrix: Pro-dev, Maker, and M365 personas share four MCP servers across Automate, Canvas, Model, and Pages',
        '00:26:50 — Live Coffee Shop inventory app: GitHub Copilot CLI joins co-authoring via MCP and runs a PowerCAT skill auditing 81 controls',
        '00:30:45 — Regulated-industry accessibility/docs skills without shipping AI prod code, plus critical Teams alert flow generation and flow diagnostics'
      ]
    },
    {
      id: 'copilot-in-apps',
      time: '00:35:26 – 00:41:15',
      tabZh: '35:26 GJ Pepsi 应用内双向智能',
      tabEn: '35:26 GJ Pepsi In-App Copilot',
      titleZh: '实机演示三（Adrian）：GJ Pepsi 一线销售画布应用内的声明式代理、自适应卡片与双向交互',
      titleEn: 'Demo 3 (Adrian): GJ Pepsi Frontline Sales App with Declarative Agent, Adaptive Cards & Bidirectional Actions',
      summaryZh: '继模型驱动应用内 Copilot 于 4 月正式商用后，画布应用内 Copilot 亦于 11 月正式商用（GA）；现场在 GJ Pepsi 巡店应用中演示按屏幕定制零触控提示词、门店优先级排序与一键生成 Derby Pantry 拜访简报。',
      summaryEn: 'Following Model-Driven GA in April, Copilot in Canvas apps hits GA in November; live GJ Pepsi route demo shows per-screen prompts, declarative Frontline Assistant ranking Derby Pantry, and bidirectional visit brief generation.',
      bulletsZh: [
        '00:36:40 — GJ Pepsi 一线销售路线应用：创作者按屏幕预设零触控引导提示词，由专属声明式代理（Frontline Assistant）响应',
        '00:37:45 — 双向联动：智能体计算门店优先级并通过自适应卡片直跳应用内 Derby Pantry（ST-1009）记录视图',
        '00:38:55 — 跨多张授权表汇总 6 周完结箱数趋势、百事/激浪单品表现、陈列方案与店内核查清单生成拜访简报（11 月 GA）'
      ],
      bulletsEn: [
        '00:36:40 — GJ Pepsi frontline app: maker-defined per-screen prompts backed by a declarative Frontline Assistant agent',
        '00:37:45 — Bidirectional UX: ranks Derby Pantry (ST-1009) with transparent math and navigates the app via adaptive card',
        '00:38:55 — Synthesizes 6-week case trends, SKU assortment, display options, and in-store checklists into a visit brief (Canvas GA in Nov)'
      ]
    },
    {
      id: 'work-iq-unlock',
      time: '00:41:16 – 00:48:15',
      tabZh: '41:16 Work IQ 解锁跨应用写回',
      tabEn: '41:16 Work IQ Cross-App Unlock',
      titleZh: '实机演示四（Adrian & Jed）：Business Apps in Work IQ 架构与 Cowork 两阶段安全确认写回',
      titleEn: 'Demo 4 (Adrian & Jed): Business Apps in Work IQ Architecture & Two-Phase Governed Save in Cowork',
      summaryZh: '当用户不在应用内时，Work IQ 将模型/画布应用、云端/桌面流、流程挖掘与门户上下文带入 Copilot 与 Cowork，严格继承用户身份权限；现场在 Cowork 中免指定环境查出伦敦路演未确认讲者并分两阶段安全写回。',
      summaryEn: 'Brings Model/Canvas apps, Cloud/RPA flows, Process Mining, and Pages into Work IQ under strict user RBAC; live Cowork demo discovers Event Command Center, flags an unconfirmed 300-seat London keynote speaker, and commits updates via two-phase save.',
      bulletsZh: [
        '00:42:55 — Business Apps in Work IQ 全景图：六大平台资产向 Copilot、Cowork、Copilot Studio 与自定义代理输出受管上下文',
        '00:44:05 — Cowork 零环境配置自动检索授权应用 Event Command Center，定位 300 座伦敦路演唯一未确认讲者 Mateo Kim',
        '00:46:15 — 遵循原应用业务规则执行“变更预览（Pending → Confirmed）+ 人工确认提交”两阶段安全保存闭环'
      ],
      bulletsEn: [
        '00:42:55 — Business Apps in Work IQ blueprint: exposes six platform surfaces to Copilot, Cowork, Copilot Studio, and custom agents',
        '00:44:05 — Cowork auto-discovers Event Command Center without environment hints, surfacing unconfirmed London keynote speaker Mateo Kim (300 seats)',
        '00:46:15 — Enforces underlying app business rules with a two-phase save preview (Pending → Confirmed) before committing'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk386Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk386-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk386-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk386-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk386-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK386 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK386 What is new in Power Platform official session thumbnail" loading="lazy" />' +
          '<button type="button" class="brk386-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk386-play-pill">' + (en ? '▶ Load Official Video Player (48 min)' : '▶ 点击加载官方内嵌点播流（48 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk386-theater-layout">',
        '  <div class="brk386-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk386-meta">',
        '    <span class="brk386-code">BRK386 · ' + item.time + '</span>',
        '    <h4 class="brk386-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk386-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk386-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk386-highlights">' + liHtml + '</ul>',
        '    <div class="brk386-actions">',
        '      <a class="brk386-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk386-btn" href="' + SESSION_META.videoDownloadUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official MP4 Recording' : '⬇ 下载官方高清实录 MP4') + '</a>',
        '      <a class="brk386-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK386 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk386Theater);
  } else {
    initBrk386Theater();
  }
})();

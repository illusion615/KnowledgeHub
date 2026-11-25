/* posts/ignite-2026-livesp165-build-agentic-platform-scale-govern/livesp165-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/livesp165-cover.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/67cf14de-0e47-4c29-a542-c498eb8587b6',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787855010982001tzJO-AAAAAAAAAAAAAAAAAAAA',
    speakersZh: 'Josh Scriven（IBM Consulting Imagine Enterprise 现场演示负责人）· Ignite Hub 演播室主持人',
    speakersEn: 'Josh Scriven (IBM Consulting Imagine Enterprise Lead) · Microsoft Ignite Hub Studio Host'
  };

  var CHAPTERS = [
    {
      id: 'co-dev-vision',
      time: '00:00:10 – 00:02:56',
      tabZh: '00:10 联合研发与 6,000+ 资产底座',
      tabEn: '00:10 Co-Development & 6,000+ Assets',
      titleZh: '第一章：从局部试点迈向量产——IBM 与微软联合打造 Imagine Enterprise',
      titleEn: 'Chapter 1: From Pilot to Production—IBM & Microsoft Co-Developing Imagine Enterprise',
      summaryZh: 'Josh Scriven 回顾与微软 Frontier Co 前线部署工程师（FDE）闭门共创历程：将 IBM Consulting 沉淀的 6,000+ 预置智能体与微软 Azure、Foundry、Agent 365、Copilot Studio 及 Fabric 凝聚为统一平台，消除客户手工拼装底层基础设施的负担。',
      summaryEn: 'Josh Scriven recounts co-developing Imagine Enterprise alongside Microsoft Frontier Co forward-deployed engineers—uniting 6,000+ IBM Consulting agents with Azure, Foundry, Agent 365, Copilot Studio, and Fabric.',
      bulletsZh: [
        '00:00:34 — 推出 Imagine Enterprise：围绕“人类员工 + 数字员工”混合范式，端到端重塑设计、构建、运行与治理',
        '00:01:15 — 联合 Microsoft Frontier Co 与 FDE 驻场攻坚数月，汇聚 IBM 逾 6,000 个 AI 智能体资产与微软云安全底座',
        '00:02:12 — 打通 Foundry、Agent 365 与 Copilot Studio 之间的连接层，让业务团队聚焦解决实际问题而非手工缝合组件'
      ],
      bulletsEn: [
        '00:00:34 — Introduces Imagine Enterprise to design, build, run, and govern hybrid human-plus-digital workforces end to end',
        '00:01:15 — Built side by side with Microsoft Frontier Co FDEs, pairing 6,000+ IBM AI assets with Azure data and security',
        '00:02:12 — Abstracts the connective tissue across Foundry, Agent 365, and Copilot so teams solve business problems first'
      ]
    },
    {
      id: 'process-manifest',
      time: '00:02:57 – 00:04:41',
      tabZh: '02:57 流程重构与清单包交接',
      tabEn: '02:57 Process Reimagine & Manifest',
      titleZh: '第二章：从 28 步压缩至 11 步——O2C 流程挖掘、人机 RACI 席位与 Manifest 打包',
      titleEn: 'Chapter 2: Compressing 28 Steps to 11—O2C Process Intelligence, RACI Seats, and Manifest Handoff',
      summaryZh: '实机演示订单到收款（Order-to-Cash）重构：导入流程文档、SOP 与氛围编码原型，识别 47 条路径变体与耗时瓶颈，人机协同将 28 个步骤精简至 11 步，明确人类与数字席位边界并向产品研发团队发布版本化 Manifest 清单包。',
      summaryEn: 'Live walkthrough of Order-to-Cash transformation: ingesting SOPs and vibe-coded prototypes, cutting 28 steps down to 11 with human-in-the-loop chat, assigning human/digital seats, and publishing the Manifest bundle.',
      bulletsZh: [
        '00:03:05 — 流程智能引擎：导入业务流程图、SOP 与氛围编码原型（Vibe-Coded Prototypes），自动扫描 47 条路径摩擦点',
        '00:03:45 — 订单到收款（O2C）实战：保留人在回路（Human-in-the-Loop）对话修订，将冗长的 28 步流程压缩至 11 步',
        '00:04:09 — 划分人类与数字工位决策权，将 Markdown 文档、智能体定义与业务本体（Ontologies）打包为 Manifest 交付研发团队'
      ],
      bulletsEn: [
        '00:03:05 — Process Intelligence ingests flows, SOPs, and vibe-coded prototypes to pinpoint friction across 47 path variants',
        '00:03:45 — Order-to-Cash redesign: keeps humans in the loop via process chat while compressing 28 steps down to 11',
        '00:04:09 — Maps human vs. digital seats and bundles Markdowns, agent definitions, and ontologies into a product Manifest'
      ]
    },
    {
      id: 'slo-lineage',
      time: '00:04:42 – 00:05:52',
      tabZh: '04:42 SLO 巡检、血缘与下线隔离',
      tabEn: '04:42 SLOs, Lineage & Worker PIP',
      titleZh: '第三章：24 名数字员工与 46 个智能体——超越令牌消耗的业务 SLO 与违规下线',
      titleEn: 'Chapter 3: 24 Digital Workers & 46 Agents—Governing by Business SLOs, Git Lineage, and Worker PIPs',
      summaryZh: '切换至运行态治理视图：底层令牌消耗与安全护栏由 Entra 与 Agent 365 原生兜底；管理者按人类同事标准考核响应时长、准确率等五维 SLO，顺着部署血缘定位 EMEA 贷项凭证劣化实例并立即执行下线隔离或绩效改进计划（PIP）。',
      summaryEn: 'Demonstrates runtime fleet operations across 24 digital workers (46 agents): combining Entra and Agent 365 telemetry with deployment lineage to catch a degraded EMEA Credit Memo worker and take it offline or place it on a PIP.',
      bulletsZh: [
        '00:04:47 — 生产舰队规模：24 名数字员工由底层 46 个智能体协同组成，按管理人类同事的 SLO 视角衡量健康度而非单纯盯防 Token 消耗',
        '00:05:11 — 融合 Entra 与 Agent 365 信号并贯通全链路血缘（Lineage），可从运行实例一路下钻至 azd 部署流水线与 Git PR',
        '00:05:28 — 发现 EMEA 贷项凭证数字员工五项 SLO 违约劣化后，一键将其下线摘除（Fire / Offline）或纳入绩效整改（PIP）'
      ],
      bulletsEn: [
        '00:04:47 — Runs 24 digital workers composed of 46 agents, judged via workforce SLOs rather than raw token burn alone',
        '00:05:11 — Pulls Entra and Agent 365 controls alongside full lineage tracing down to container image tags and Git PRs',
        '00:05:28 — Detects SLO breaches on the EMEA Credit Memo worker and immediately takes it offline or places it on a PIP'
      ]
    },
    {
      id: 'business-roi',
      time: '00:05:53 – 00:06:32',
      tabZh: '05:53 商业价值大盘与 ROI 兑现',
      tabEn: '05:53 Business Insights & Verified ROI',
      titleZh: '第四章：可度量的商业回报——异常周期缩短 62%、单笔降本 40% 与成熟度闭环',
      titleEn: 'Chapter 4: Measurable Business Impact—62% Faster Resolution, 40% Lower Cost, and Maturity Closure',
      summaryZh: '收官展示全企业业务洞察大盘（Business Insight）：对照版本化清单设定的基准目标，量化呈现异常处理周期从 41.0 小时降至 15.5 小时、每月释放约 940 小时人工工时、月度护航营收从 $137k 跃升至 $352k 的真实商业闭环。',
      summaryEn: 'Closes on the Enterprise Business Insight dashboard—proving 62% faster exception cycle times (41.0 h to 15.5 h), 40% lower transaction cost, ~940 hours returned monthly, and $352k monthly protected revenue.',
      bulletsZh: [
        '00:05:53 — 业务洞察（Business Insight）视图：对标 mf-o2c-exceptions@1.0.0 目标，直观核验技术投资是否兑现商业承诺',
        '00:05:58 — 关键实测成效：异常处理周期缩短 62%（15.5 小时）、单笔成本下降 40%（$18.89）、自动解决量提升至 4 倍以上',
        '00:06:03 — 演播室总结：兼具底层可观测性、可管理性与企业 AI 运营成熟度模型，打通从高管愿景到生产落地的最后一公里'
      ],
      bulletsEn: [
        '00:05:53 — Business Insight dashboard benchmarks live enterprise telemetry directly against locked manifest targets',
        '00:05:58 — Verified gains: -62% cycle time (15.5 h), -40% cost/tx ($18.89), ~940 h/mo returned, and $352k/mo revenue protected',
        '00:06:03 — Host takeaway: pairs deep observability and manageability with a repeatable enterprise maturity model'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLivesp165Theater() {
    var controls = document.querySelector('[data-sandbox-controls="livesp165-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="livesp165-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'livesp165-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'livesp165-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVESP165 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVESP165 Build an agentic platform to scale and govern digital workforces official session cover" loading="lazy" />' +
          '<button type="button" class="livesp165-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="livesp165-play-pill">' + (en ? '▶ Load Official Video Player (6 min 32 s)' : '▶ 点击加载官方内嵌点播流（6 分 32 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="livesp165-theater-layout">',
        '  <div class="livesp165-player-wrap">' + mediaInner + '</div>',
        '  <div class="livesp165-meta">',
        '    <span class="livesp165-code">LIVESP165 · ' + item.time + '</span>',
        '    <h4 class="livesp165-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="livesp165-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="livesp165-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="livesp165-highlights">' + liHtml + '</ul>',
        '    <div class="livesp165-actions">',
        '      <a class="livesp165-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="livesp165-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVESP165 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLivesp165Theater);
  } else {
    initLivesp165Theater();
  }
})();

/* posts/ignite-2026-brk474-modernization-ai-transformation-aon-enables/brk474-showcase.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856645372001Euij-1791588243916001CFOX';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/7b1b7044-629b-46dd-a33c-8a3b7bcc3631';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/7b1b7044-629b-46dd-a33c-8a3b7bcc3631';
  var POSTER_SRC = './media/brk474-session-thumb.jpg';

  var CHAPTERS = [
    {
      id: 'megatrends',
      tabZh: '00:03 四大风险与 3×3 重组',
      tabEn: '00:03 Megatrends & 3x3 Rebuild',
      timeRange: '00:03:00 – 00:08:50',
      titleZh: '四大交织大趋势与 13–14 亿美元底座再投入',
      titleEn: 'Four Interlocking Megatrends & $1.3B–$1.4B Foundation Reinvestment',
      speakerZh: 'Magnus Roe（Aon 全球首席数据与分析官）& Alex Knizhnik（微软全球客户总监）',
      speakerEn: 'Magnus Roe (Global CDAO, Aon) & Alex Knizhnik (Global Account Director, Microsoft)',
      summaryZh: '以超大规模数据中心建设拆解贸易、技术、气候与劳动力风险的放大效应；披露怡安围绕风险资本与人力资本重组组织，三年投入 13–14 亿美元筑牢 Aon Business Services，并在周一完成并购整合 10,500 名 USI 新同事。',
      summaryEn: 'Uses hyperscale data center builds to show how trade, technology, weather, and workforce risks amplify each other; details Aon\'s 3x3 reorganization, $1.3B–$1.4B foundation spend, and rapid onboarding of 10,500 USI colleagues.',
      pointsZh: [
        '00:04:02 — 风险不再孤立：数据中心选址同时牵动算力供应链、极端天气水电与员工福利',
        '00:05:18 — 打破专业孤岛：整合风险资本与人力资本，三年注资 13–14 亿美元重塑底座',
        '00:07:20 — 告别五年规划：以 6–12 个月滚动节奏响应变化，实现跨 150 国一次构建多处复用'
      ],
      pointsEn: [
        '00:04:02 — Interlocking risk: Data center projects link trade supply chains, weather, power, and talent',
        '00:05:18 — Breaking silos: Uniting Risk Capital and Human Capital atop $1.3B–$1.4B in shared services',
        '00:07:20 — Agile horizon: Replacing 5-year plans with 6–12 month pivots across 150 countries'
      ]
    },
    {
      id: 'foundation',
      tabZh: '00:08 应用精简与主数据层',
      tabEn: '00:08 Estate & Trusted Data',
      timeRange: '00:08:50 – 00:13:55',
      titleZh: '2,200+ 应用精简、22 座数据中心迁云与主数据抽象层',
      titleEn: 'Rationalizing 2,200+ Apps, Migrating 22 DCs, and Master Data Abstraction',
      speakerZh: 'Sudipto Dasgupta（Aon 全球数据与 AI 平台负责人）& Sudha Kumar（微软技术战略师）',
      speakerEn: 'Sudipto Dasgupta (Global Head of Data & AI Platforms, Aon) & Sudha Kumar (Microsoft)',
      summaryZh: '阐明在错误数据上叠加生成式 AI 只会放大幻觉风险；怡安率先削减 30%–40% 存量应用并将 80% 关键负载迁入 Azure，在无法强求全球单一实例的现实下建立覆盖保单、理赔、敞口与账单的可信主数据层。',
      summaryEn: 'Explains why putting GenAI atop untrusted data amplifies hallucination risk; Aon cut its 2,200+ app estate by 30%–40%, moved 80% of workloads to Azure, and built a master data abstraction layer across policies and claims.',
      pointsZh: [
        '00:10:00 — 应用现代化先行：削减 30%–40% 冗余系统，80% 核心负载与 22 座数据中心迁入云端',
        '00:11:02 — 务实数据抽象：放弃乌托邦式全球单一库，通过主数据管理统一保单、理赔、敞口与客户资产',
        '00:12:15 — 贴近工作流选型：依托 Teams、Outlook 与 Entra 原生协同，将 Azure 定为主云底座'
      ],
      pointsEn: [
        '00:10:00 — Modernize first: Cut 2,200+ apps by 30%–40% and move 80% of workloads plus 22 DCs to cloud',
        '00:11:02 — Pragmatic abstraction: Master data management unifying policy, claims, exposure, and client assets',
        '00:12:15 — Meet colleagues where they work: Native Teams, Outlook, and Entra integration on Azure'
      ]
    },
    {
      id: 'zones',
      tabZh: '00:14 三区工具与激活师',
      tabEn: '00:14 Three Zones & Activators',
      timeRange: '00:14:06 – 00:20:45',
      titleZh: '60,000+ 同事三区分层配权与 150 国 2,000 名 AI 激活师',
      titleEn: 'Three-Zone Colleague Tooling & 2,000 Grassroots AI Activators Across 150 Countries',
      speakerZh: 'Magnus Roe & Alex Knizhnik',
      speakerEn: 'Magnus Roe & Alex Knizhnik',
      summaryZh: '从“把所有工具塞给所有人”转向“按角色精准配权”：第一区全员普及 Microsoft 365 Copilot，第二区用 Copilot Studio 承接属地低代码长尾诉求，第三区为工程师配备 GitHub Copilot；志愿者招募一周涌入 2,500 人。',
      summaryEn: 'Shifts from giving every tool to everyone to role-based zoning: Zone 1 M365 Copilot for all, Zone 2 governed Copilot Studio for local teams, and Zone 3 GitHub Copilot for engineers—backed by 2,500 volunteer sign-ups in one week.',
      pointsZh: [
        '00:15:25 — 三区分层治理：区分全员生产力、受控低代码（Copilot Studio）与专业研发（GitHub Copilot）',
        '00:17:28 — 成本红线意识：70,000 人规模下按量计费极易失控，拒绝用专业编程工具做演示文稿',
        '00:19:15 — 激活师网络：首周 2,500 名志愿者报名，最终在全部 150 个国家部署 2,000 名一线变革骨干'
      ],
      pointsEn: [
        '00:15:25 — Three-zone model: Universal M365 Copilot, governed Copilot Studio, and pro-code GitHub Copilot',
        '00:17:28 — Consumption discipline: Preventing 70,000-seat cost spikes by matching tools to tasks',
        '00:19:15 — Activator network: 2,500 volunteers in week one, placing 2,000 trained peers across all 150 countries'
      ]
    },
    {
      id: 'certificates',
      tabZh: '00:21 百万证书中心重塑',
      tabEn: '00:21 1M Certificate Center',
      timeRange: '00:20:50 – 00:29:10',
      titleZh: 'Certificate Center：年签发超 100 万份保险证明的端到端重构',
      titleEn: 'Certificate Center: Redesigning 1M+ Annual Insurance Certificates End-to-End',
      speakerZh: 'Sudipto Dasgupta、Magnus Roe & Alex Knizhnik',
      speakerEn: 'Sudipto Dasgupta, Magnus Roe & Alex Knizhnik',
      summaryZh: '拒绝把旧手工步骤原样搬给机器人：将原本邮件往返、耗时 60 分钟乃至数周的多承保人保险证明（COI）核发重塑为类 Apple Wallet 数字自助体验，并将 Azure AI Foundry 多文档解析模板复用到加拿大及经纪/理赔场景。',
      summaryEn: 'Rather than automating broken back-office steps, Aon reimagined 60-minute manual Certificate of Insurance requests into an Apple Wallet-style self-service flow, reusing Azure AI Foundry document patterns across Broker and Claims Copilots.',
      pointsZh: [
        '00:22:04 — 业务痛点拆解：跨国建筑与地产客户入场需海量保险证明，旧流程单份人工录入耗时 60 分钟',
        '00:24:05 — 流程彻底重设计：不造单纯替代录入的后台脚本，直接交付分钟级客户端数字自助体验',
        '00:25:55 — Foundry 模式复用：抽象多文档解析与比对标准件，弥合美加两地批单与保单部门割裂'
      ],
      pointsEn: [
        '00:22:04 — High-volume bottleneck: Global construction sites require 1M+ COIs/year at 60 minutes per request',
        '00:24:05 — Workflow redesign: Delivering digital client self-service in minutes instead of automating legacy typing',
        '00:25:55 — Foundry pattern reuse: Shared document extraction & comparison across US, Canada, Broker & Claims'
      ]
    },
    {
      id: 'finops',
      tabZh: '00:34 AI FinOps 与网关',
      tabEn: '00:34 AI FinOps & Gateway',
      timeRange: '00:34:10 – 00:49:50',
      titleZh: 'GenAI Wrapper 单一控制面、业务价值计量与澳洲属地实战问答',
      titleEn: 'GenAI Wrapper Control Plane, Outcome FinOps & Live Q&A on Local Gray Areas',
      speakerZh: 'Sudipto Dasgupta & Magnus Roe',
      speakerEn: 'Sudipto Dasgupta & Magnus Roe',
      summaryZh: '揭秘与微软共建于 Azure AI Foundry 的 GenAI Wrapper 强制网关（绕过网关一律禁止上线生产）；将 ROI 核算从碎片词元转向单笔保单/理赔业务成果，并在问答环节分享澳大利亚团队用 Copilot Studio 快速响应小型商业险市场的治理经验。',
      summaryEn: 'Details the mandatory GenAI Wrapper in Azure AI Foundry (blocking non-compliant apps from production), shifts FinOps from raw tokens to cost per policy/claim, and shares Q&A lessons from Australia\'s Copilot Studio affinity workflows.',
      pointsZh: [
        '00:36:35 — 强制单一网关：所有编程与业务智能体统一经由 Foundry GenAI Wrapper 跨云路由并统计词元',
        '00:39:00 — 拒绝算 Excel 式伪账：一区办公助手定性为经营必需品，二三区按保单、理赔与证书核算业务回报',
        '00:48:15 — 现场 Q&A 灰区治理：澳洲团队用 Copilot Studio 打造属地小型商险工具，靠教育纠偏“盲目追顶配大模型”'
      ],
      pointsEn: [
        '00:36:35 — Mandatory gateway: Every LLM call routes through Foundry GenAI Wrapper; bypasses cannot ship to prod',
        '00:39:00 — Outcome ROI: Treat Zone 1 Copilot like Excel infrastructure; measure Zone 2/3 per policy or claim',
        '00:48:15 — Live Q&A gray areas: Australia built local affinity sales flows in Copilot Studio under model-tier coaching'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk474-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk474-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var embedLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk474-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk474-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
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

      var playerInner = embedLoaded
        ? '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRK474 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + POSTER_SRC + '" alt="Microsoft Ignite 2026 BRK474 Session Poster" loading="lazy" />',
            '<button type="button" class="brk474-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load Official On-Demand Player' : '加载官方点播播放器') + '">',
            '  <span class="brk474-play-pill">▶ ' + (en ? 'Load Official Medius Stream (50m)' : '点击内嵌播放官方 50 分钟实录') + '</span>',
            '</button>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk474-theater-layout">',
        '  <div class="brk474-theater-player">' + playerInner + '</div>',
        '  <div class="brk474-theater-meta">',
        '    <span class="brk474-theater-code">BRK474 · ' + item.timeRange + '</span>',
        '    <h4 class="brk474-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk474-theater-speakers">' + (en ? item.speakerEn : item.speakerZh) + '</div>',
        '    <p class="brk474-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk474-theater-chapters">' + liHtml + '</ul>',
        '    <div class="brk474-theater-actions">',
        '      <a class="brk474-theater-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口打开视频流') + '</a>',
        '      <a class="brk474-theater-btn" href="' + SLIDES_URL + '" target="_blank" rel="noopener">' + (en ? '⬇ Download Official PPTX' : '⬇ 下载官方原版课件') + '</a>',
        '      <a class="brk474-theater-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite Session Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-load-embed="1"]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          embedLoaded = true;
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

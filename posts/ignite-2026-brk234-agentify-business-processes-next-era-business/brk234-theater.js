/* posts/ignite-2026-brk234-agentify-business-processes-next-era-business/brk234-theater.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856608608001EBSP-1791588069088001Cwnv';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/b996ddba-c550-4e0e-9d21-8d9a3d50e5f6';

  var CHAPTERS = [
    {
      id: 'overview',
      tabZh: '00:00 战略与三层栈',
      tabEn: '00:00 Three-Layer Stack',
      code: 'BRK234 · 00:00 – 14:45',
      titleZh: '无头业务前门：Copilot + Microsoft IQ + Agent 365 持久架构',
      titleEn: 'Headless Front Door: Copilot + Microsoft IQ + Agent 365 Stack',
      speakersZh: 'Jeff Teper（微软应用与智能体事业部执行副总裁）',
      speakersEn: 'Jeff Teper (EVP, Apps and Agents, Microsoft)',
      poster: './media/brk234-copilot-iq-stack.jpg',
      summaryZh: '复盘研发生产力从 20% 跃升至 2x–5x 的拐点，确立体验层（Copilot）、智能数据层（Microsoft IQ 融合 M365、Dynamics 365 与 Fabric）及治理层（Agent 365）三大支柱，并发布 Dynamics 365 Activate 面向 SAP ERP 迁移的私有预览。',
      summaryEn: 'Traces internal engineering productivity gains (20% to 2x–5x), establishes the Copilot + Microsoft IQ + Agent 365 architecture, and announces private preview of Dynamics 365 Activate for SAP ERP migrations.',
      pointsZh: [
        '00:02:01 — 编码模型与执行内核外溢至业务应用，研发高质量代码产出提升 2x–5x',
        '00:04:03 — Dynamics 365 成为 Microsoft IQ 一等公民，打通协作、CRM/ERP 与 Fabric 分析',
        '00:13:20 — Dynamics 365 Activate 继 Salesforce 正式商用后，开启 SAP ERP 迁移私有预览'
      ],
      pointsEn: [
        '00:02:01 — Coding harnesses spill into business apps after 2x–5x internal code output gains',
        '00:04:03 — Dynamics 365 joins Microsoft IQ alongside M365 and Fabric in one unified stack',
        '00:13:20 — Dynamics 365 Activate adds SAP ERP migration private preview alongside Salesforce GA'
      ]
    },
    {
      id: 'zava-crm',
      tabZh: '14:46 无头 CRM 实战',
      tabEn: '14:46 Headless CRM Demo',
      code: 'BRK234 · 14:46 – 20:35',
      titleZh: 'Copilot Today 与 Autopilot：在工作流内闭环 3,000 万美元续约',
      titleEn: 'Copilot Today & Autopilot: Closing a $30M Renewal in the Flow of Work',
      speakersZh: 'Karan Nigam（Dynamics 365 产品演示负责人）',
      speakersEn: 'Karan Nigam (Dynamics 365 Product Lead)',
      poster: './media/brk234-copilot-today-zava-crm.jpg',
      summaryZh: '实机演示销售代表无需切入传统 CRM 后台，直接在 Copilot Today 页面诊断季度 2,160 万美元缺口，联动工单、邮件与使用率数据拆解三步续约动作，并配置每周一早 8 点 Autopilot 竞品监控例程（每周省下 4–5 小时手工活）。',
      summaryEn: 'Live demo diagnosing a $21.6M Q4 pipeline gap from Copilot Today, orchestrating three actions to win the $30M Zava renewal with automatic CRM write-back, plus a Monday 8 a.m. Autopilot routine saving 4–5 hours/week.',
      pointsZh: [
        '00:15:55 — Today 看板：第四季度目标 8,000 万美元已达成 73%，锁定 3,000 万美元 Zava 续约',
        '00:16:38 — 跨源归因：揪出两笔高龄故障单与 CFO 三次未回信风险，一键指派客户成功经理',
        '00:19:10 — Autopilot 例程：将每周耗费 4–5 小时的重点客户与竞品情报搜集转为全自动定时推送'
      ],
      pointsEn: [
        '00:15:55 — Today View: 73% of $80M Q4 target closed/committed; $30M Zava renewal flagged',
        '00:16:38 — Cross-Stack Triage: Surfaces 2 open support cases & uncontacted CFO with CRM write-back',
        '00:19:10 — Autopilot Routine: Automates 4–5 hrs/week of manual account & competitive tracking'
      ]
    },
    {
      id: 'visa-case',
      tabZh: '20:45 Visa IQ 对谈',
      tabEn: '20:45 Visa IQ Fireside',
      code: 'BRK234 · 20:45 – 27:15',
      titleZh: 'Visa 全球技术负责人对谈：打通云端与本地数据构建 Visa IQ',
      titleEn: 'Visa Fireside Chat: Bridging Cloud & On-Premises Context for Visa IQ',
      speakersZh: 'Manish Mittal（Visa 高级副总裁兼全球技术负责人）& Jeff Teper',
      speakersEn: 'Manish Mittal (SVP & Global Head of Technology, Visa) & Jeff Teper',
      poster: './media/brk234-session-cover.jpg',
      summaryZh: '面向全球银行、金融科技与商户的数百款支付与风控产品，Visa 构建专属客户 360 脉络（Visa IQ）注入销售智能体，攻克云端 Copilot 与本地核心系统的身份认证桥接，推动组织从单兵提效迈向全员集体智慧复用。',
      summaryEn: 'Across hundreds of payment, fraud, and risk products, Visa built a Customer 360 context layer (Visa IQ) inside its Sales Agent—solving cloud-to-on-prem authentication and scaling top-seller habits across teams.',
      pointsZh: [
        '00:21:30 — 核心痛点：数据并不匮乏但散落多套系统，销售难以在对客瞬间串联支付与风控全貌',
        '00:23:25 — 工程攻坚：打通云端 Copilot 与本地（On-Premises）核心系统的安全认证链路',
        '00:25:35 — 演进路线：从“理解→推荐→行动”走向萃取顶尖销售打法的全团队集体提效'
      ],
      pointsEn: [
        '00:21:30 — Core Challenge: Connecting fragmented client history across hundreds of payment/risk products',
        '00:23:25 — Engineering Hurdle: Securely authenticating cloud Copilot against on-premises systems',
        '00:25:35 — Next Horizon: Moving from understanding to proactive action and collective seller intelligence'
      ]
    },
    {
      id: 'studio-cmr',
      tabZh: '27:20 托管运行时与微应用',
      tabEn: '27:20 CMR & Studio Trinity',
      code: 'BRK234 · 27:20 – 39:55',
      titleZh: 'Copilot Managed Runtime 正式商用：药企上市控制中心三合一实操',
      titleEn: 'Copilot Managed Runtime GA: Building Caldova Launch Control End-to-End',
      speakersZh: 'Jeff Teper & Jessica Lo（Copilot Studio 产品经理）',
      speakersEn: 'Jeff Teper & Jessica Lo (Product Manager, Copilot Studio)',
      poster: './media/brk234-cmr-launch-control-app.jpg',
      summaryZh: '详解八月重构版 Copilot Studio 如何凭 GPU 推理与 CPU 工作流混跑实现 10–40 个百分点质量跃升与约 50% 词元节降；Jessica 现场用自然语言构建托管在 Copilot Managed Runtime（当日 GA）上的药企上市门禁应用、评估智能体与 Teams 升级审批流。',
      summaryEn: 'Covers 10–40 pt quality gains and ~50% token savings by mixing GPU LLMs with CPU workflows, followed by a live build of a governed pharmaceutical launch control app (CMR GA), readiness agent, and Teams approval workflow.',
      pointsZh: [
        '00:28:45 — 算力分工：GPU 大模型推理配合 CPU 确定性流，质量涨 10–40 点且词元消耗减半',
        '00:31:00 — Copilot Managed Runtime 正式商用：杜绝未知开源依赖裸虚机，细粒度管控连接器',
        '00:34:15 — Caldova 实战：自然语言生成门禁看板应用，自动识别巴西赛区高危阻断并触发 Teams 审批'
      ],
      pointsEn: [
        '00:28:45 — GPU + CPU Mix: 10–40 pt quality gains while cutting token consumption roughly in half',
        '00:31:00 — Copilot Managed Runtime GA: Governed hosting replacing raw VMs with unknown OSS risks',
        '00:34:15 — Caldova Demo: Prompt-built gate app flags Brazil launch risk and triggers Teams sign-off'
      ]
    },
    {
      id: 'cci-ga',
      tabZh: '40:01 非侵入联络中心智能',
      tabEn: '40:01 Contact Center Intelligence',
      code: 'BRK234 · 40:01 – 50:14',
      titleZh: 'Microsoft Contact Center Intelligence 正式商用：零推倒重来挂载语音智能体',
      titleEn: 'Microsoft Contact Center Intelligence GA: Zero Rip-and-Replace Voice Agents',
      speakersZh: 'Bryan Goode（AI 业务流程市场负责人）& Heidi Elmore',
      speakersEn: 'Bryan Goode (VP, AI Business Process Marketing) & Heidi Elmore',
      poster: './media/brk234-cci-avaya-warm-handoff.jpg',
      summaryZh: '回应九成企业客户互动转型诉求与“无法推倒重来”的现实约束，发布与 Avaya、Cisco、Five9 深度集成的 Contact Center Intelligence（当日 GA）：保留原有电话号码与路由，融合开放问答、声纹确定性开卡流、英德双语实时切换、Avaya 坐席摘要交接与自动质检。',
      summaryEn: 'Addressing the 9-in-10 customer engagement mandate without rip-and-replace, CCI reaches GA with Avaya, Cisco, and Five9 partnerships—featuring voiceprint deterministic flows, live English/German switching, Avaya desktop summaries, and automated QA.',
      pointsZh: [
        '00:42:05 — 通用连接器零改造接入：保留既有路由与专线号码（DID），官宣牵手 Avaya、Cisco 与 Five9',
        '00:44:10 — 刚柔并济：开放旅行权益咨询走生成式技能，信用卡申领走确定性流程并叠加声纹核身',
        '00:47:15 — 坐席桌面无感赋能：通话中途英德秒切，转人工时向第三方 Avaya 桌面直推意图与核身摘要'
      ],
      pointsEn: [
        '00:42:05 — Universal Connector: Keep existing telephony routing & DIDs across Avaya, Cisco, and Five9',
        '00:44:10 — Hybrid Control: Generative travel Q&A paired with deterministic card intake + voiceprint auth',
        '00:47:15 — Third-Party Desktop Handoff: Live German switch, Avaya summary push, QA scoring & Agent 365'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk234-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk234-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk234-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var c = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk234-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        mediaHtml = '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRK234 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
      } else {
        mediaHtml = [
          '<img src="' + item.poster + '" alt="' + item.code + '" loading="lazy" />',
          '<div class="brk234-player-overlay">',
          '  <button type="button" class="brk234-play-trigger" data-load-medius="1">' + (en ? '▶ Load Official Medius Stream (50m)' : '▶ 加载微软官方点播流（50 分钟全片）') + '</button>',
          '</div>'
        ].join('\n');
      }

      stage.innerHTML = [
        '<div class="brk234-theater-layout">',
        '  <div class="brk234-player-box">' + mediaHtml + '</div>',
        '  <div class="brk234-meta">',
        '    <span class="brk234-code">' + item.code + '</span>',
        '    <h4 class="brk234-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk234-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="brk234-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk234-highlights">' + liHtml + '</ul>',
        '    <div class="brk234-actions">',
        '      <a class="brk234-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口播放官方视频') + '</a>',
        '      <a class="brk234-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Official BRK234 Session Page' : '↗ 访问 Ignite BRK234 官方主页') + '</a>',
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

/* posts/ignite-2026-thrsp1104-strengthen-copilot-agent-security-trusted/session-showcase.js */
(function () {
  'use strict';

  var MODES = [
    {
      id: 'foundations',
      tabZh: '第一幕：数据盲区与权限放大 (00:00–07:49)',
      tabEn: 'Act 1: Data Blind Spots & Over-Reach (00:00–07:49)',
      summaryZh: 'Tafi Makamure 援引 Gartner 与 IBM/Ponemon 2026 权威报告，揭示企业智能体数量从不足 15 个激增至 150,000+ 时，制作者共享连接（Maker Connection）如何把潜伏的 SharePoint 与 Outlook 权限盲区放大为全员可触发的薪酬泄密通道。',
      summaryEn: 'Tafi Makamure cites 2026 Gartner and IBM/Ponemon benchmarks to show how scaling from <15 to 150,000+ agents turns hidden SharePoint and Outlook over-permissions—inherited via Maker Connections—into tenant-wide payroll exposure.',
      chaptersZh: [
        '00:01:18 — 规模失衡：2028 年财富 500 强平均运行 150,000+ 智能体（2025 年不足 15 个），仅 13% 企业具备治理信心',
        '00:01:48 — 92% 泄密根因：IBM/Ponemon 602 起案例证实 AI 数据泄露主因在于缺失恰当的数据访问控制',
        '00:03:18 — 三道治理灵魂拷问：有哪些智能体？能触达哪些敏感数据？越界执行时如何处置？',
        '00:04:20 — 微软 × Cyera 四层协同底座：Copilot Studio、Entra ID、Power Platform 与 Purview 标签联动',
        '00:05:42 — HR 助手越权推演：全员继承制作者连接（Maker Connection），一句话查出高管薪酬并通过 Outlook 外发'
      ],
      chaptersEn: [
        '00:01:18 — Scale Gap: Fortune 500 enterprises projected at 150,000+ agents by 2028 (up from <15 in 2025); only 13% ready',
        '00:01:48 — 92% Breach Root Cause: IBM/Ponemon study of 602 organizations ties AI breaches to missing access controls',
        '00:03:18 — Three Governance Questions: What agents exist, what sensitive data they reach, and how out-of-purpose acts stop',
        '00:04:20 — Four-Pillar Stack: Copilot Studio, Entra ID, Power Platform policies, and Purview labels enriched by Cyera',
        '00:05:42 — HR Assistant Walkthrough: Shared Maker Connections expose executive payroll and external Outlook send actions'
      ]
    },
    {
      id: 'agent365',
      tabZh: '第二幕：Agent 365 融合风险实机 (07:50–10:45)',
      tabEn: 'Act 2: Live Agent 365 Risk Telemetry (07:50–10:45)',
      summaryZh: '微软 Agent 365 安全团队 Brendan Powers 现场打开 Microsoft 365 管理中心，检视待审智能体 Recruiting Coordinator 的三维动态风险评分，并在同一案件（INC-48625）下联合溯源 Microsoft Defender XPIA 告警与 Cyera 外发证据。',
      summaryEn: 'Brendan Powers from the Microsoft Agent 365 security team opens the Microsoft 365 admin center live, inspecting Recruiting Coordinator across three dynamic risk dimensions and correlating Microsoft Defender XPIA alerts with Cyera exfiltration telemetry under INC-48625.',
      chaptersZh: [
        '00:08:28 — Agent 365 全量资产台账：一键筛选无责任人（Ownerless）与卡在待审队列的 Copilot Studio 智能体',
        '00:09:10 — 三维动态风险拆解：Recruiting Coordinator 综合高危（运行时 High · 暴露面 High · 爆炸半径 Medium）',
        '00:09:42 — 案件驱动调查（Case-First）：无需逐条拼凑孤立告警，直接从候选人数据外泄调查单切入证据链',
        '00:10:08 — 双源遥测同屏合流：Cyera 捕获未授权 Teams 群聊录用薪资与外部 Gmail 简历摘要，同屏并列 Defender XPIA 注入告警'
      ],
      chaptersEn: [
        '00:08:28 — Agent 365 Estate View: Filter ownerless agents and pending-review Copilot Studio submissions in MAC',
        '00:09:10 — Dynamic Risk Trio: Recruiting Coordinator rated High overall (Runtime High, Exposure High, Blast Radius Medium)',
        '00:09:42 — Case-First Triage: Start from the candidate data leak case rather than stitching raw alerts manually',
        '00:10:08 — Dual-Source Fusion: Cyera Agent Guardian (unsanctioned Teams & external Gmail) alongside Defender XPIA alerts'
      ]
    },
    {
      id: 'quarantine',
      tabZh: '第三幕：意图透视与隔离熔断 (10:46–21:19)',
      tabEn: 'Act 3: Intent Reach & Live Quarantine (10:46–21:19)',
      summaryZh: '切换至 Cyera Agent Security 控制台，剖析 Stark Corp HR Assistant 名不副实的六大敏感域触达范围，对比演示“单动作精准阻断（保留日常问答）”与基于 Power Automate Premium 的“整机隔离（Agent Quarantine）”五步持续合规模型。',
      summaryEn: 'Switches to Cyera Agent Security to expose Stark Corp HR Assistant reaching six confidential domains beyond HR, demonstrating surgical action-level email blocking versus full agent quarantine powered by Power Automate Premium.',
      chaptersZh: [
        '00:12:35 — 意图与可达性错配：Stark Corp HR Assistant 实机暴露财务、法务、并购、SOX 审计与 W2 税表等 6 大敏感域',
        '00:14:31 — 动作级精准拦截（Action Enforcement）：阻断违规外发调薪邮件并记录四元组证据，常规员工问答零中断',
        '00:15:39 — 整机隔离熔断（Agent Quarantine）：安全员联动 Power Automate Premium 一键冻结失控智能体直至缩权完毕',
        '00:17:18 — 五步联合运营飞轮：准备可信数据 → 双向盘点 → 身份收敛 → 动作防护 → 持续合规（取代年度手工审计）'
      ],
      chaptersEn: [
        '00:12:35 — Intent vs. Reach Mismatch: Stark Corp HR Assistant reaches M&A, SOX audit, tax & W2 files across 6 domains',
        '00:14:31 — Action-Level Enforcement: Blocks external payroll email with 4-tuple evidence while keeping normal HR Q&A online',
        '00:15:39 — Whole-Agent Quarantine: Operator freezes the entire agent via Power Automate Premium while owner narrows scope',
        '00:17:18 — Five-Step Operating Flywheel: Prepare data, discover agents, govern access, protect actions & validate continuously'
      ]
    }
  ];

  var SESSION_META = {
    code: 'THRSP1104 · Partner Theater · 25 Min',
    titleZh: 'Strengthen Copilot agent security with trusted data（以可信数据强化 Copilot 智能体安全防线）',
    titleEn: 'Strengthen Copilot agent security with trusted data',
    speakersZh: 'Brendan Powers（Microsoft Agent 365 安全与治理团队） · Tafi Makamure（Cyera 数据安全布道师）',
    speakersEn: 'Brendan Powers (Security & Governance, Microsoft Agent 365) · Tafi Makamure (Data Security Evangelist, Cyera)',
    poster: './media/session-thrsp1104-thumb.jpg',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787858593974001SXAY-1791588239104001CHpv',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/16bbf001-1384-44f5-a628-4e66db67de03',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/16bbf001-1384-44f5-a628-4e66db67de03'
  };

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initShowcase() {
    var controls = document.querySelector('[data-sandbox-controls="thrsp1104-session-player"]');
    var stage = document.querySelector('[data-sandbox-stage="thrsp1104-session-player"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var mode = MODES[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thrsp1104-theater-tabs';

      for (i = 0; i < MODES.length; i++) {
        (function (idx) {
          var item = MODES[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thrsp1104-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe class="thrsp1104-player-frame" src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THRSP1104 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 THRSP1104 Official Session Poster" loading="lazy" />',
            '<div class="thrsp1104-poster-overlay">',
            '  <span>' + (en ? 'Official Microsoft Medius Stream (No-Cookie Embed)' : '微软官方 Medius 点播流（支持页内免跳转加载）') + '</span>',
            '  <button type="button" class="thrsp1104-embed-trigger" data-load-embed="1">' + (en ? '▶ Load Inline Player' : '▶ 页内加载点播视频') + '</button>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="thrsp1104-theater-layout">',
        '  <div class="thrsp1104-player-wrap">',
        mediaHtml,
        '  </div>',
        '  <div class="thrsp1104-meta">',
        '    <span class="thrsp1104-code">' + SESSION_META.code + '</span>',
        '    <h4 class="thrsp1104-title">' + (en ? SESSION_META.titleEn : SESSION_META.titleZh) + '</h4>',
        '    <div class="thrsp1104-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thrsp1104-summary">' + (en ? mode.summaryEn : mode.summaryZh) + '</p>',
        '    <ul class="thrsp1104-chapters">' + liHtml + '</ul>',
        '    <div class="thrsp1104-actions">',
        '      <a class="thrsp1104-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 打开官方视频流') + '</a>',
        '      <a class="thrsp1104-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official 1080p MP4' : '⬇ 官方高清 MP4 直链') + '</a>',
        '      <a class="thrsp1104-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THRSP1104 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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

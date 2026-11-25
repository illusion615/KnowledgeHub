/* posts/ignite-2026-live47-agents-work-charles-lamanna-alysa-taylor/live47-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/live47-session-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/aa0d0210-ddd6-4397-8802-bcf011c02676',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1793670952619001g4OH-AAAAAAAAAAAAAAAAAAAA',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/aa0d0210-ddd6-4397-8802-bcf011c02676',
    speakersZh: 'Charles Lamanna（商业与行业 Copilot 总裁）· Alysa Taylor（首席营销官，商业云与 AI）',
    speakersEn: 'Charles Lamanna (President, Business & Industry Copilot) · Alysa Taylor (Chief Marketing Officer, Commercial Cloud & AI)'
  };

  var CHAPTERS = [
    {
      id: 'proactive-finops',
      time: '00:00:09 – 00:02:20',
      tabZh: '00:09 主动式 AI 与花费分析',
      tabEn: '00:09 Proactive AI & Spend ROI',
      titleZh: '从写提示词到全天候巡航，并用 Agent 365 商业分析统管跨云支出与价值',
      titleEn: 'From Manual Prompts to Perpetual Autopilot and Agent 365 Business Analytics',
      summaryZh: '因天气原因临时移师热闹的技能中心（Skills Hub）现场后，Charles Lamanna 开场拆解两大高光：Copilot 通过 Today、Workspace 与持续运行的 Autopilot 迈入主动式 AI；Agent 365 全新商业分析看板则像全生态 AI 支出的 ERP/BI 仪表盘，破解预算封顶与价值归因瓶颈。',
      summaryEn: 'Broadcasting live from the Skills Hub floor, Charles Lamanna highlights proactive AI across Copilot Today, Workspace, and perpetual Autopilot, alongside the new Agent 365 Business Analytics dashboard—an ERP/BI view balancing Microsoft and non-Microsoft AI spend against value created.',
      bulletsZh: [
        '00:00:44 — 主动式 AI 三剑客：Today 推送动态简报与下一步建议，Workspace 支撑人机协作项目，Autopilot 全天候持续运转',
        '00:01:12 — 直击企业落地头号瓶颈：发布 Agent 365 成本控制策略与全新商业分析（Business Analytics）体验，支持支出封顶、预算与预测',
        '00:02:08 — 成本方程的两面：如同微软与非微软 AI 支出的 ERP/BI 看板，高产出下的高投入值得肯定，零价值下的低花费同样是浪费'
      ],
      bulletsEn: [
        '00:00:44 — Proactive AI trio: Today surfaces briefs and next best actions, Workspace unites people and agents on projects, and Autopilot runs perpetually',
        '00:01:12 — Solves the top enterprise adoption blocker with Agent 365 spending caps, budgeting, forecasting, and the new Business Analytics experience',
        '00:02:08 — Two sides of the FinOps equation: acts like an ERP/BI dashboard for Microsoft and non-Microsoft AI spend while tracking business value created'
      ]
    },
    {
      id: 'unified-backplane',
      time: '00:02:21 – 00:03:40',
      tabZh: '02:21 三大支柱无断崖背板',
      tabEn: '02:21 Seamless 3-Pillar Backplane',
      titleZh: '消除产品间断崖与裂痕：Copilot、Work IQ 与 Agent 365 共建统一背板',
      titleEn: 'Eliminating Cliffs and Seams: One Backplane Across Copilot, IQ, and Agent 365',
      summaryZh: '回应过去一年客户最迫切的反馈，微软将 Foundry、Copilot Studio 与 Autopilot 构建或消费的智能体全部纳入 Agent 365 统一管理控制，并拉通跨 GitHub Copilot、Copilot 与 Autopilot 的共享插件注册表。',
      summaryEn: 'Responding to a full year of customer feedback, Microsoft unified Foundry, Copilot Studio, and Autopilot agents under one consistent backplane—sharing admin controls in Agent 365, Work IQ data grounding, Entra security, and a single plugin registry.',
      bulletsZh: [
        '00:02:48 — 无论在 Foundry、Copilot Studio 构建，还是在 Copilot 中运行 Autopilot，均在 Agent 365 中共享同一套管理控制',
        '00:02:59 — 统一插件与技能注册表：同一套注册目录可无缝跨 GitHub Copilot、Copilot 与 Autopilot 发现并复用',
        '00:03:22 — 消除微软不同产品与平台间的断崖（Cliffs）或接缝（Seams），确立 Copilot、IQ 与 Agent 365 三大核心支柱'
      ],
      bulletsEn: [
        '00:02:48 — Agents built or consumed in Foundry, Copilot Studio, or Autopilot share identical admin controls inside Agent 365',
        '00:02:59 — Shared plugin registry lets teams discover skills once across GitHub Copilot, Copilot, and Autopilot',
        '00:03:22 — Removes cliffs and seams across products as Copilot, IQ, and Agent 365 form the three foundational pillars'
      ]
    },
    {
      id: 'zero-trust-hardmode',
      time: '00:03:41 – 00:07:06',
      tabZh: '03:41 Entra 身份与零信任“困难模式”',
      tabEn: '03:41 Entra ID & Zero Trust Hard Mode',
      titleZh: '别重造轮子、先假设失陷：复用 Entra 智能体身份与多层隔离护栏',
      titleEn: 'Don\'t Reinvent the Wheel—Start by Not Trusting Your Agents in "Hard Mode"',
      summaryZh: '面对触达关键系统的自主智能体，企业无需推倒重来：一方面直接扩展已正式商用（GA）的 Entra Agent ID 与 Entra Agent User ID；另一方面以零信任“假设已被入侵”为起点，叠加网络隔离、身份隔离、密钥隔离与 Windows MXC 容器等纵深防御。',
      summaryEn: 'Instead of starting from scratch, enterprises extend GA Entra Agent IDs and Agent User IDs alongside Intune-grade controls—while adopting Zero Trust "hard mode" with network, identity, and secret isolation plus MXC containers for Windows.',
      bulletsZh: [
        '00:04:01 — 无需从零重造轮子：过去一年已正式推出（GA）Entra Agent ID 与 Entra Agent User ID，将智能体作为员工与服务主体的自然延伸',
        '00:05:40 — 规模化前必做的安全动作：从“不信任你自己的智能体”出发，假设已被入侵，严格管控 ACL、IP 范围、网络隔离与 Windows MXC 容器',
        '00:06:26 — 微软内部保护自研智能体的纵深防御（Hard Mode）：层层叠加网络隔离、身份隔离、密钥隔离、标准容器、实时监控与应急缓解策略'
      ],
      bulletsEn: [
        '00:04:01 — Extend existing enterprise basics with GA Entra Agent IDs and Entra Agent User IDs plus Intune-style protection',
        '00:05:40 — Security rule #1 before scaling: start by not trusting your agents; enforce ACLs, IP ranges, network isolation, and MXC for Windows',
        '00:06:26 — Defense-in-depth ("hard mode"): layer network isolation, identity isolation, secret isolation, standard containers, monitoring, and mitigation'
      ]
    },
    {
      id: 'otel-intune',
      time: '00:07:07 – 00:09:26',
      tabZh: '07:07 OTEL 遥测与“智能体 Intune”',
      tabEn: '07:07 OTEL & "Intune for Agents"',
      titleZh: '基于 OpenTelemetry 开放双向观测，打造统管多云异构生态的“智能体版 Intune”',
      titleEn: 'OpenTelemetry Observability and Agent 365 as the Cross-Platform "Intune for Agents"',
      summaryZh: '没有全域资产清册与可观测性就无从谈起治理。Agent 365 原生基于 OpenTelemetry（OTEL）开放标准，既能导出至企业数据湖与 SIEM，也能注入 Anthropic、AWS、GCP 等非微软平台日志，如同 Intune 统管 iPhone、Android、PC 与 Mac 一样统管所有智能体运行时。',
      summaryEn: 'Built on OpenTelemetry (OTEL), Agent 365 tracks connections, tool provenance, decision chains, and errors—exporting to existing data lakes/SIEMs while ingesting logs from Anthropic, AWS, and GCP just as Intune governs iOS, Android, PC, and Mac.',
      bulletsZh: [
        '00:07:26 — 从基础到高阶观测：看清智能体连了什么、用了哪些工具、插件技能源自何处，直至合规审计所需的决策轨迹与思维链（Trajectory & CoT）',
        '00:08:01 — 原生拥抱 OpenTelemetry（OTEL）开放标准：双向支持通过 API 导出至既有数据湖/SIEM，并直接注入 Anthropic、AWS、GCP 等三方日志',
        '00:09:04 — 经典类比：正如 Intune 同时管理 iPhone、Android、PC 与 Mac，Agent 365 致力于纳管企业异构多供应商环境下的任意智能体平台与运行时'
      ],
      bulletsEn: [
        '00:07:26 — Spans basic telemetry (connections, tools, plugin provenance) to compliance-grade decision trajectories, chains of thought, and failure logs',
        '00:08:01 — Built on OpenTelemetry (OTEL): exports via APIs to existing data lakes or SIEMs and ingests logs from Anthropic, AWS, and GCP',
        '00:09:04 — The Intune analogy: just as Intune governs iPhones, Androids, PCs, and Macs, Agent 365 connects to any agent platform or runtime'
      ]
    },
    {
      id: 'today-apollo',
      time: '00:09:27 – 00:12:28',
      tabZh: '09:27 2027 黑马 Today 与 Apollo 实战',
      tabEn: '09:27 2027 Sleeper Pick & Apollo Story',
      titleZh: '展望 2027 最大黑马 Copilot Today，以及 Autopilot“Apollo”周日救场记',
      titleEn: '2027 Dark Horse "Copilot Today" and How Autopilot "Apollo" Saved a Sunday Flight',
      summaryZh: 'Charles 将 Copilot Today 点名为 2027 年最具潜力的黑马产品：依托 Work IQ 语义与人脉图谱，免提示词直接列出本周五件要事与高层紧急请求；而他的专属 Autopilot“Apollo”更在周日主动发现专车订错机场，避免了误机危机。',
      summaryEn: 'Charles names Copilot Today his 2027 dark horse—leveraging Work IQ and people graphs without prompting to surface top-5 weekly priorities and urgent asks from Satya Nadella or Amy Hood—before sharing how his Autopilot "Apollo" caught a wrong-airport car booking.',
      bulletsZh: [
        '00:09:50 — 2027 黑马预测（Sleeper Pick）：Copilot Today 接入 Work IQ 与人脉图谱，免写提示词自动置顶 Satya 或 Amy Hood 的紧急事项并梳理每周五件要事',
        '00:11:02 — 新一代工作操作系统入口：Alysa 印证 Today 主动提醒她找同事 Kyle 对齐工作，未来一年有望成为人们发起协同任务（Cowork Tasks）的主阵地',
        '00:11:25 — 彩蛋实录：Charles 的个人 Autopilot“Apollo”在周日未经询问主动核查行程，及时预警专车发往错误机场，避免错过改签航班'
      ],
      bulletsEn: [
        '00:09:50 — 2027 dark horse: Copilot Today taps Work IQ to prioritize urgent asks (e.g., Satya or Amy Hood) and summarize top-5 weekly priorities with zero prompting',
        '00:11:02 — Copilot as the new OS: Alysa recounts Today nudging her to sync with colleague Kyle; poised to become the primary launchpad for cowork tasks',
        '00:11:25 — Bonus story: Charles\'s personal Autopilot "Apollo" proactively checked Sunday travel changes unprompted and caught a car headed to the wrong airport'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLive47Theater() {
    var controls = document.querySelector('[data-sandbox-controls="live47-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="live47-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'live47-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'live47-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVE47 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVE47 Put Agents to Work: Charles Lamanna and Alysa Taylor official session cover" loading="lazy" />' +
          '<button type="button" class="live47-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="live47-play-pill">' + (en ? '▶ Load Official Broadcast Stream (12m 28s)' : '▶ 点击加载官方演播室点播流（12 分 28 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="live47-theater-layout">',
        '  <div class="live47-player-wrap">' + mediaInner + '</div>',
        '  <div class="live47-meta">',
        '    <span class="live47-code">LIVE47 · ' + item.time + '</span>',
        '    <h4 class="live47-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="live47-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="live47-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="live47-highlights">' + liHtml + '</ul>',
        '    <div class="live47-actions">',
        '      <a class="live47-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="live47-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official HD MP4' : '⬇ 官方高清 MP4 直链') + '</a>',
        '      <a class="live47-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVE47 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLive47Theater);
  } else {
    initLive47Theater();
  }
})();

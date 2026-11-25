/* posts/ignite-2026-brk448-run-secure-agent-loops-production-isolated/brk448-showcase.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856641427001EIEu-1791588175102001CcC9';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/d8734a1a-bcf5-4871-ab79-ddfed898b641';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/d8734a1a-bcf5-4871-ab79-ddfed898b641';

  var CHAPTERS = [
    {
      id: 'ch1',
      code: '00:00 – 04:30 · Platform Gap',
      tabZh: '01 治理缺口与底座演进',
      tabEn: '01 Governance Gap & GA',
      titleZh: '智能体越界攻击面与 Azure Container Apps Sandboxes 正式商用',
      titleEn: 'The Agent Governance Gap and ACA Sandboxes General Availability',
      speakersZh: 'Devanshi Joshi (Senior PMM, Microsoft Azure)',
      speakersEn: 'Devanshi Joshi (Senior PMM, Microsoft Azure)',
      poster: './media/brk448-session-cover.jpg',
      summaryZh: '剖析 74% 攻击面认知与 13% 治理就绪度之间的断层，阐明硬件隔离微虚拟机为何成为 Foundry Agent Service、Copilot Studio 与 GitHub Copilot 共同的生产执行底座。',
      summaryEn: 'Unpacks the gap between 74% risk awareness and 13% governance readiness, introducing hardware-isolated ACA Sandboxes GA across Foundry, Copilot Studio, and GitHub Copilot.',
      bulletsZh: [
        '00:01:45 — 越削减权限越丧失业务价值，安全边界必须下沉至运行时内核',
        '00:02:10 — Gartner 调研：74% 视智能体为新攻击面，仅 13% 具备治理架构',
        '00:03:12 — 超越重型 VM 与共享内核容器：亚秒启动 + 零闲置算力计费微虚拟机',
        '00:04:02 — 微软内部统一基石：支撑 Foundry、Copilot Studio 与 SRE Agent'
      ],
      bulletsEn: [
        '00:01:45 — Stripping permissions kills agent utility; enforce trust at runtime',
        '00:02:10 — Gartner survey: 74% see new attack vector vs. 13% governance-ready',
        '00:03:12 — Beyond heavy VMs & shared kernels: <1s microVMs with zero idle cost',
        '00:04:02 — Shared substrate across Foundry, Copilot Studio, GitHub & SRE Agent'
      ]
    },
    {
      id: 'ch2',
      code: '04:31 – 15:55 · Nous Research',
      tabZh: '02 Hermes 自进化飞轮',
      tabEn: '02 Nous Hermes Fleet',
      titleZh: 'Nous Research：日处理近 2 万亿词元的自进化智能体与 20K+ 云沙盒实践',
      titleEn: 'Nous Research: Governing Self-Improving Hermes Agents Across 20K+ Sandboxes',
      speakersZh: 'Jeffrey Quesnelle (Co-founder & CTO, Nous Research) & Devanshi Joshi',
      speakersEn: 'Jeffrey Quesnelle (Co-founder & CTO, Nous Research) & Devanshi Joshi',
      poster: './media/brk448-session-cover.jpg',
      summaryZh: '复盘开源榜首智能体 Hermes 如何将高频重复操作自动固化为确定性工作流与可复用技能，并借助 ACA Sandboxes 承载超 20,000 个高突发有状态云端实例。',
      summaryEn: 'How OpenRouter #1 open agent Hermes (~2T tokens/day) distills successful runs into governed enterprise skills across 20,000+ stateful ACA Sandbox instances.',
      bulletsZh: [
        '00:05:18 — 自进化闭环：后台自动沉淀技能文件并将确定性步骤编译为代码工作流',
        '00:07:10 — 多租户风险：非受信代码绝不能共享内核，个人隐私习惯严禁外泄至全员技能',
        '00:10:50 — Spend Intelligence 成本滑杆：对比 100% 与 95% 高阶模型路由表现',
        '00:12:45 — 规模实证：20,000+ 活跃云实例、100+ 大型企业采用、99% 空闲时缩零省钱'
      ],
      bulletsEn: [
        '00:05:18 — Self-improvement loop: auto-captures skills & deterministic code workflows',
        '00:07:10 — Multi-tenant risk: isolate untrusted code & review skill promotion',
        '00:10:50 — Spend Intelligence slider: balance frontier model spend vs. task behavior',
        '00:12:45 — Operating proof: 20K+ active instances, 100+ enterprises, scale-to-zero'
      ]
    },
    {
      id: 'ch3',
      code: '15:56 – 34:48 · 4 Live Demos',
      tabZh: '03 四连实机架构演示',
      tabEn: '03 Four Sandbox Demos',
      titleZh: 'ACA Sandboxes 深度拆解：200 万日活底座与四场零剪辑实机演示',
      titleEn: 'ACA Sandboxes Deep Dive: 2M+ Daily Fleet & Four Live Architecture Demos',
      speakersZh: 'Jan Kalis (Principal Product Manager, Microsoft)',
      speakersEn: 'Jan Kalis (Principal Product Manager, Microsoft)',
      poster: './media/brk448-egress-proxy-secretless.jpg',
      summaryZh: '覆盖全球 44 个 Azure 区域日跑超 200 万沙盒的底层解剖，现场演示三端创建、25 并发矩阵快照休眠、出站代理零密钥凭据注入与 1,700+ 连接器日程汇总。',
      summaryEn: 'Covers 2M+ daily sandboxes across 44 Azure regions with four live demos: 3-way creation, 25-sandbox snapshot matrix, secretless egress header injection, and Work IQ connectors.',
      bulletsZh: [
        '00:16:40 — Demo 1：门户、ACA CLI 与 VS Code 扩展秒建 0.25–16 核 Ubuntu 沙盒',
        '00:22:50 — Demo 2：2.2 秒并发拉起 25 个计数沙盒，内存快照暂停后零丢失续跑',
        '00:26:15 — Demo 3：默认全拒出站策略 + Transform 规则在沙盒外动态注入 X-API-Key',
        '00:32:20 — Demo 4：GitHub Copilot 沙盒挂载 Work IQ 连接器按 OBO 身份汇总周日程'
      ],
      bulletsEn: [
        '00:16:40 — Demo 1: Provision 0.25–16 core Ubuntu microVMs via Portal, CLI & VS Code',
        '00:22:50 — Demo 2: Spawn 25 parallel counter sandboxes in 2.2s; snapshot suspend/resume',
        '00:26:15 — Demo 3: Default-deny egress + Transform rule injecting X-API-Key externally',
        '00:32:20 — Demo 4: GitHub Copilot sandbox querying calendar via Work IQ OBO connector'
      ]
    },
    {
      id: 'ch4',
      code: '34:49 – 44:50 · Cognite Industrial AI',
      tabZh: '04 炼油厂工业智能体',
      tabEn: '04 Cognite Industrial AI',
      titleZh: 'Cognite Atlas AI：100 万亿工业数据点上的炼油厂阀门隔离方案生成',
      titleEn: 'Cognite Atlas AI: Refinery P&ID Valve Isolation over 100T Industrial Datapoints',
      speakersZh: 'Christian Flasshoff (Principal Solution Architect, Cognite)',
      speakersEn: 'Christian Flasshoff (Principal Solution Architect, Cognite)',
      poster: './media/brk448-matrix-suspend-resume.jpg',
      summaryZh: '展示重资产工业知识图谱 Cognite Data Fusion 如何为 Atlas AI 接入安全微虚拟机“计算机”，在数天内开发、数周内投产换热器检修阀门自动高亮智能体。',
      summaryEn: 'Shows how Cognite paired its 100T-datapoint Knowledge Graph with ACA Sandboxes to ship a production refinery P&ID valve-isolation agent in weeks.',
      bulletsZh: [
        '00:36:45 — 工业数据底座：汇聚 100 万亿数据点、50 亿图节点与 4 亿份工程文档',
        '00:38:05 — 赋予智能体一台安全计算机：自定义镜像 + 私有 VNet + 令牌留存沙盒外',
        '00:40:20 — 换热器检修实录：下载 P&ID 图纸并在沙盒内写代码解析管线与阀门拓扑',
        '00:41:35 — 视觉验证交付：在工程原图上精准高亮待关闭隔离阀门供现场工程师复核'
      ],
      bulletsEn: [
        '00:36:45 — Cognite Data Fusion: 100T datapoints, 5B graph nodes & 400M documents',
        '00:38:05 — Giving Atlas AI a safe computer: custom rootfs, private VNet & external tokens',
        '00:40:20 — Heat-exchanger maintenance: download & parse P&ID diagrams via sandbox code',
        '00:41:35 — Visual sign-off: highlight exact isolation valves directly on engineering drawings'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk448-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk448-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk448-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk448-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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

      var mediaHtml = playerLoaded
        ? '<iframe class="brk448-theater-iframe" src="' + EMBED_URL + '" title="BRK448 Official Medius Stream" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + item.poster + '" alt="BRK448 Official Video Cover" loading="lazy" />',
            '<div class="brk448-poster-overlay">',
            '  <button type="button" class="brk448-play-trigger" data-embed-launch="1">' + (en ? '▶ Load Official On-Demand Player' : '▶ 内嵌加载官方点播播放器') + '</button>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk448-theater-layout">',
        '  <div class="brk448-theater-player-wrap">',
        mediaHtml,
        '  </div>',
        '  <div class="brk448-theater-meta">',
        '    <span class="brk448-theater-code">' + item.code + '</span>',
        '    <h4 class="brk448-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk448-theater-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="brk448-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk448-theater-chapters">' + liHtml + '</ul>',
        '    <div class="brk448-theater-actions">',
        '      <a class="brk448-theater-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方视频流') + '</a>',
        '      <a class="brk448-theater-btn" href="' + SLIDES_URL + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk448-theater-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK448 Page' : '↗ Ignite BRK448 主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var trigger = stage.querySelector('[data-embed-launch="1"]');
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

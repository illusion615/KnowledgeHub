/* posts/ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/brk378-theater.js */
(function () {
  'use strict';

  var SEGMENTS = [
    {
      id: 'vision',
      tabZh: '00:00 统一托管底座定调',
      tabEn: '00:00 Managed Runtime Vision',
      code: 'BRK378 · Part 01 (00:00–08:35)',
      titleZh: '告别 localhost 孤岛：策略前置感知、Work IQ 与 1,500+ 连接器',
      titleEn: 'Beyond localhost Silos: Policy-Aware Build, Work IQ & 1,500+ Connectors',
      speakersZh: 'Clay Wesener (GM, Apps - Copilot Managed Runtime · Microsoft)',
      speakersEn: 'Clay Wesener (GM, Apps - Copilot Managed Runtime · Microsoft)',
      summaryZh: '揭示企业自研微应用的核心张力：无论创作者使用 Cowork、Copilot Studio、CLI 还是三方工具混合多种模型构建，成品均不落入脆弱的本地端口，而是自带 Entra 身份鉴权、Git 远程源码库并统一呈现在 Microsoft 365 管理中心。',
      summaryEn: 'Frames the core enterprise tension: whether makers build in Cowork, Copilot Studio, CLI, or third-party tools across mixed models, zero apps ship on localhost—every artifact inherits Entra security, a Git remote, and M365 Admin visibility.',
      bulletsZh: [
        '00:01:15 — 零 localhost 托管：所有入口产出的应用默认挂载 Entra 安全边界、Git 仓库与管理中心盘点',
        '00:03:05 — 构建期策略感知：智能体在生成阶段即读取环境路由与连接器禁令，杜绝空耗额度造出废品',
        '00:05:10 — Work IQ 上下文直通：直接引用刚结束的会议、Loop 组件与团队脉络自动生成业务应用',
        '00:07:10 — 智能应用跃迁：接入 1,500+ 受管连接器，并支持行内提示词与完整 Studio 智能体双重驱动'
      ],
      bulletsEn: [
        '00:01:15 — Zero localhost URLs: every deployed app gets Entra auth, Git-backed source, and MAC visibility',
        '00:03:05 — Policy-aware agents: builders read MAC data and sharing guardrails upfront before burning credits',
        '00:05:10 — Work IQ grounding: reference recent meetings, Loop components, and team context right in prompts',
        '00:07:10 — Agentic app leap: 1,500+ connectors paired with inline LLM prompts and full Copilot Studio agents'
      ]
    },
    {
      id: 'inflow',
      tabZh: '08:40 Cowork 与 Studio 实机',
      tabEn: '08:40 Cowork & Studio Demos',
      code: 'BRK378 · Part 02 (08:40–23:50)',
      titleZh: '实机演示：Atlas 路线图、Figma 插件还原与 Gauge 巡检智能应用',
      titleEn: 'Live Demos: Atlas Roadmap, Figma Plugin UI & Gauge Field Inspections',
      speakersZh: 'Emma Cooper (Principal PM · Microsoft) & Clay Wesener',
      speakersEn: 'Emma Cooper (Principal PM · Microsoft) & Clay Wesener',
      summaryZh: '现场演示在 Cowork 中把散落的文档表格转化为 Q4 2026 Atlas 路线图应用并调用 Figma 插件生成真实数据界面；随后切入 Copilot Studio 展示基于 Dataverse 的 Gauge 现场巡检分析应用，同时内嵌行内风险摘要与逾期整改智能体。',
      summaryEn: 'Demonstrates turning static spreadsheets into the Q4 2026 Atlas roadmap app in Cowork, pulling Figma designs via plugin, and building the Dataverse-backed Gauge field inspections app with an embedded risk advisor agent.',
      bulletsZh: [
        '00:10:35 — Cowork 应用正式商用：生成 Q4 2026 Atlas 项目路线图，支持像分享 Office 文档一样复制组织链接',
        '00:13:20 — 插件与技能生态：调用应用文档生成技能与 Figma 插件，几分钟内将设计稿接通真实业务数据',
        '00:16:50 — Gauge 现场巡检应用：通过 Dataverse 插件建表，实时渲染通过率趋势与故障热力图',
        '00:18:10 — 双模智能协同：自定义对话界面直连 Gauge 风险顾问智能体查北场逾期项，顶部配行内 LLM 摘要'
      ],
      bulletsEn: [
        '00:10:35 — Cowork Apps GA: converts static slides/sheets into the interactive Q4 2026 Atlas roadmap with org links',
        '00:13:20 — Skills & Figma plugin: auto-generates user guides and turns Figma mockups into live data-bound apps',
        '00:16:50 — Gauge Inspections in Studio: uses Dataverse plugin for schema creation, pass-rate trends & heatmaps',
        '00:18:10 — Dual intelligence UX: custom chat queries Gauge Risk Advisor on North Yard overdue items + AI summary'
      ]
    },
    {
      id: 'lovable',
      tabZh: '23:55 Lovable 三方集成',
      tabEn: '23:55 Lovable 3P Deploy',
      code: 'BRK378 · Part 03 (23:55–30:15)',
      titleZh: '跨生态无孤岛：从 Lovable 一键发布纯前端至微软受管运行时',
      titleEn: 'Open Ecosystem: Publishing React Frontends from Lovable into M365 Tenant',
      speakersZh: 'Malavika Balachandran Tadeusz (Product Manager · Lovable)',
      speakersEn: 'Malavika Balachandran Tadeusz (Product Manager · Lovable)',
      summaryZh: '拥有超 4 万家企业客户与 7,000 万个项目的 Lovable 登台演示原生集成：IT 管理员仅需约 20 分钟完成工作区绑定，创作者生成新员工入职应用后直接将 React 前端推入微软租户运行，Lovable 全程零接触企业底层数据。',
      summaryEn: 'Serving 40,000+ businesses and 70M+ projects, Lovable demonstrates its 20-minute admin integration: builders prompt an Entra-personalized new-hire onboarding app backed by Excel, shipping pure React straight into CMR with zero data exposure to Lovable.',
      bulletsZh: [
        '00:24:20 — 规模实证：超 40,000 家企业与 7,000 万项目（涵盖德国电信与英伟达等客户）高频使用 Lovable',
        '00:25:05 — 零数据驻留隔离：管理员约 20 分钟配通；发布时仅推送 React 前端至 CMR，三方平台不碰业务数据',
        '00:26:00 — 新员工入职实机：以 Excel 表格维护入职名单与任务后端，按登录者 Entra ID 渲染专属清单',
        '00:27:15 — 租户内闭环交互：员工以 Entra 身份登录勾选完成事项并触发实时状态反馈，全程受管理中心纳管'
      ],
      bulletsEn: [
        '00:24:20 — Adoption scale: 40,000+ businesses and 70M+ projects built on Lovable, from SMBs to Deutsche Telekom & Nvidia',
        '00:25:05 — Zero data access: ~20-minute IT setup; Lovable ships only the React frontend to CMR without touching tenant data',
        '00:26:00 — New-hire onboarding demo: binds an Excel task tracker backend to Entra ID for personalized journeys',
        '00:27:15 — Governed execution: employees sign in via Microsoft Entra ID to check off tasks inside the tenant boundary'
      ]
    },
    {
      id: 'prodev',
      tabZh: '30:20 CLI 接力与管理中心',
      tabEn: '30:20 CLI Handoff & Admin',
      code: 'BRK378 · Part 04 (30:20–43:15)',
      titleZh: '专业开发 VS Code 无缝接力与 M365 管理中心全链路策略管控',
      titleEn: 'Pro-Dev VS Code Git Handoff & M365 Admin Center Policies and FinOps',
      speakersZh: 'Emma Cooper & Clay Wesener (Microsoft)',
      speakersEn: 'Emma Cooper & Clay Wesener (Microsoft)',
      summaryZh: '完整跑通业务专家向专业研发的交接闭环：通过 Git 凭据管理器免密钥将 Gauge 应用克隆至本地 VS Code，用 Copilot 增补地理定位地图并在本地开发服验证；最后在管理中心演示应用盘点隔离、连接器动作级开关、严格 CSP 与 5,000 点数计费限额。',
      summaryEn: 'Completes the domain-to-pro-dev relay: keyless GCM git clone of the Gauge React/TypeScript repo into VS Code to add a geolocation map in local dev mode, followed by M365 Admin Center quarantine, per-action DLP, strict CSP, and a 5,000-credit billing cap.',
      bulletsZh: [
        '00:31:10 — 免密 Git 克隆接力：借助 Git Credential Manager 无令牌拉取 Gauge 完整 TypeScript/React 工程至 VS Code',
        '00:33:45 — 本地开发态演进：唤起 Copilot 编码新增巡检地理位置地图组件，在本地 dev server 预览无误后回推',
        '00:36:10 — 管理中心 Apps 全景：一键筛查组织全部托管应用、连接器调用明细，并可随时执行 Block 隔离排险',
        '00:37:35 — 细粒度安全与计费：细化至连接器单动作开关、默认严格 CSP 防护，并为巡检业务配置 5,000 额度上限'
      ],
      bulletsEn: [
        '00:31:10 — Keyless Git clone: pulls the Gauge React/TypeScript repo via Git Credential Manager with zero raw keys',
        '00:33:45 — Local dev server loop: uses Copilot in VS Code to add an inspection geolocation map and test locally',
        '00:36:10 — MAC Apps inventory: inspects makers, usage, and connectors across all apps with instant Block quarantine',
        '00:37:35 — Action DLP, CSP & FinOps: toggles individual connector actions, enforces strict CSP, and sets a 5,000-credit cap'
      ]
    }
  ];

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856630704001Ep9J-1791588308254001CRyh';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/c5c8ac76-0384-4a0c-acf5-83488136a4f1';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/c5c8ac76-0384-4a0c-acf5-83488136a4f1';
  var POSTER_SRC = './media/session-brk378-poster.jpg';

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk378-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk378-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var seg = SEGMENTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk378-theater-tabs';
      for (i = 0; i < SEGMENTS.length; i++) {
        (function (idx) {
          var s = SEGMENTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk378-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? s.tabEn : s.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      stage.innerHTML = '';
      var layout = document.createElement('div');
      layout.className = 'brk378-theater-layout';

      var playerShell = document.createElement('div');
      playerShell.className = 'brk378-player-shell';

      if (playerMounted) {
        var iframe = document.createElement('iframe');
        iframe.src = EMBED_URL;
        iframe.title = 'Microsoft Ignite 2026 BRK378 Official On-Demand Stream';
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'allowfullscreen');
        playerShell.appendChild(iframe);
      } else {
        var img = document.createElement('img');
        img.src = POSTER_SRC;
        img.alt = en ? seg.titleEn : seg.titleZh;
        img.loading = 'lazy';
        playerShell.appendChild(img);

        var overlay = document.createElement('div');
        overlay.className = 'brk378-poster-overlay';
        var playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'brk378-play-trigger';
        playBtn.textContent = en ? '▶ Load Official Medius Player (45 min)' : '▶ 在页内加载微软官方点播流（45 分钟）';
        playBtn.addEventListener('click', function () {
          playerMounted = true;
          render();
        });
        overlay.appendChild(playBtn);
        playerShell.appendChild(overlay);
      }

      var meta = document.createElement('div');
      meta.className = 'brk378-meta';

      var codeEl = document.createElement('div');
      codeEl.className = 'brk378-code';
      codeEl.textContent = seg.code;

      var titleEl = document.createElement('h4');
      titleEl.className = 'brk378-title';
      titleEl.textContent = en ? seg.titleEn : seg.titleZh;

      var spkEl = document.createElement('div');
      spkEl.className = 'brk378-speakers';
      spkEl.textContent = en ? seg.speakersEn : seg.speakersZh;

      var sumEl = document.createElement('p');
      sumEl.className = 'brk378-summary';
      sumEl.textContent = en ? seg.summaryEn : seg.summaryZh;

      var ul = document.createElement('ul');
      ul.className = 'brk378-chapters';
      var list = en ? seg.bulletsEn : seg.bulletsZh;
      for (i = 0; i < list.length; i++) {
        var li = document.createElement('li');
        li.textContent = list[i];
        ul.appendChild(li);
      }

      var actions = document.createElement('div');
      actions.className = 'brk378-actions';

      var aVideo = document.createElement('a');
      aVideo.className = 'brk378-btn is-primary';
      aVideo.href = EMBED_URL;
      aVideo.target = '_blank';
      aVideo.rel = 'noopener noreferrer';
      aVideo.textContent = en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方视频流';

      var aSlides = document.createElement('a');
      aSlides.className = 'brk378-btn';
      aSlides.href = SLIDES_URL;
      aSlides.target = '_blank';
      aSlides.rel = 'noopener noreferrer';
      aSlides.textContent = en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件';

      var aPage = document.createElement('a');
      aPage.className = 'brk378-btn';
      aPage.href = SESSION_URL;
      aPage.target = '_blank';
      aPage.rel = 'noopener noreferrer';
      aPage.textContent = en ? '↗ Ignite BRK378 Page' : '↗ Ignite BRK378 专场主页';

      actions.appendChild(aVideo);
      actions.appendChild(aSlides);
      actions.appendChild(aPage);

      meta.appendChild(codeEl);
      meta.appendChild(titleEl);
      meta.appendChild(spkEl);
      meta.appendChild(sumEl);
      meta.appendChild(ul);
      meta.appendChild(actions);

      layout.appendChild(playerShell);
      layout.appendChild(meta);
      stage.appendChild(layout);
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

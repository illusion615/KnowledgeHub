/* posts/ignite-2026-brk259-copilot-harness-powers-copilot-studio/brk259-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612459001EfZu-1791588174633001COAZ',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd',
    poster: './media/brk259-session-poster.jpg',
    speakerZh: '讲者：Alice Appleton（Copilot Studio 首席产品经理） · 38m36s 实录',
    speakerEn: 'Speaker: Alice Appleton (Principal PM, Copilot Studio) · 38m36s Recording'
  };

  var ACTS = [
    {
      id: 'act1',
      code: 'BRK259 · ACT 1 (00:00 – 15:35)',
      tabZh: '第一幕：Copilot SDK 与容器底座',
      tabEn: 'Act 1: SDK & Azure Container',
      titleZh: '为什么放弃缝补旧对话底座，转向 Microsoft Copilot SDK 与 Azure 容器沙盒',
      titleEn: 'Why Copilot Studio Rebuilt on Microsoft Copilot SDK & Azure Containers',
      summaryZh: '复盘从 2023 年单轮对话底座到推理循环底座的分水岭：揭秘模块化系统提示词、约 500 道真实用例离线评测（代码分析 +47.5 pts、输入词元 −45%）、Auto 帕累托路由与内部 32 智能体软件工厂。',
      summaryEn: 'Traces the shift from 2023 chat scaffolding to the Copilot SDK agentic loop: modular system prompts, ~500-case evals (+47.5 pts code analysis, −45% input tokens), Auto routing, and the 32-agent internal software factory.',
      cuesZh: [
        '00:02:45 — 从单轮提示拆分（Chat Harness）到 o1 / Claude Code 推理循环范式变迁',
        '00:05:00 — 架构分水岭：停止给 Standard 底座贴创可贴，直接基于 Microsoft Copilot SDK 重建',
        '00:06:34 — 每会话拉起 Azure 隔离容器（CLI + 本地磁盘）并由信任层执行 DLP 与审计',
        '00:09:42 — 约 500 道离线用例实测：代码分析涨 47.5 个百分点，输入词元成本直降 45%',
        '00:13:45 — 内部吃狗粮：32 个智能体、47 条连接与 6 个共享专家构建 Copilot Studio 自身'
      ],
      cuesEn: [
        '00:02:45 — Evolution from sequential chat scaffolding to reasoning-era agentic loops',
        '00:05:00 — Fork in the road: starting fresh on Microsoft Copilot SDK vs. patching Standard',
        '00:06:34 — Per-session Azure container (CLI + filesystem) governed by Purview DLP & audit',
        '00:09:42 — ~500-case offline evals: +47.5 pts code analysis and −45% input token spend',
        '00:13:45 — Dogfooding factory: 32 agents, 47 connections, and 6 shared helpers shipping Studio'
      ]
    },
    {
      id: 'act2a',
      code: 'BRK259 · ACT 2A (15:36 – 24:40)',
      tabZh: '第二幕上：动态子代理实机演示',
      tabEn: 'Act 2A: Dynamic Task Agents',
      titleZh: '实机演示一：并行拉起 Haiku 子智能体盲审三份供应商标书与异构模型交叉质询',
      titleEn: 'Live Demo 1: Parallel Haiku Sub-Agents Scoring Supplier Proposals & Cross-Model Critique',
      summaryZh: '无需单独创建或发布子智能体，主控智能体在运行时动态派生 3 个 Claude Haiku 5.5 工作节点并行独立评审 Apex、Meridian 与 Nimbus 标书，随后按需召唤异构模型 Sol 二次挑刺复核，并开放 MCP / A2A 远程发布通道。',
      summaryEn: 'Without publishing separate child bots, the orchestrator dynamically spawns 3 parallel Claude Haiku 5.5 task agents to score Apex, Meridian, and Nimbus proposals independently, followed by on-demand Sol cross-critique and MCP/A2A publishing.',
      cuesZh: [
        '00:16:15 — 动态任务子智能体（Dynamic Task Agents）三大收益：并行提速、上下文隔离与按需选模',
        '00:19:02 — 采购标书评审配置：Auto 主控编排 + 指令声明“分配更经济的模型独立评审”',
        '00:20:31 — 思维链实录：并行拉起 3 个 Claude Haiku 5.5 独立打分，精准揪出 Nimbus 两项不合规',
        '00:22:18 — 运行时临时追问：一句话召唤异构推理模型 Sol 对推荐结论做独立复核审视',
        '00:23:56 — 多智能体互联：以 Entra OAuth 2.0 委托身份将智能体发布为远程 MCP 或 A2A 服务'
      ],
      cuesEn: [
        '00:16:15 — Dynamic Task Agents: parallel speed, isolated context, and tiered model cost',
        '00:19:02 — Supplier proposal agent setup: Auto orchestrator + instruction-driven delegation',
        '00:20:31 — Live chain-of-thought: 3 parallel Claude Haiku 5.5 runs flag Nimbus failing 2 checks',
        '00:22:18 — Ad-hoc prompt delegation: spawning a cross-vendor Sol agent to critique the verdict',
        '00:23:56 — Multi-agent publishing: expose Studio agents as Entra-secured MCP or A2A servers'
      ]
    },
    {
      id: 'act2b',
      code: 'BRK259 · ACT 2B & 3 (24:41 – 38:36)',
      tabZh: '第二幕下 & 路线图：Hooks 与变量',
      tabEn: 'Act 2B & 3: Hooks & Roadmap',
      titleZh: '实机演示二：用 Before Tool 钩子硬性拦截超 £2,000 采购单、会话变量与路线图',
      titleEn: 'Live Demo 2: Blocking Out-of-Policy £2,000 POs with Hooks, Scoped Variables & Roadmap',
      summaryZh: '对比纯提示词软约束与生命周期钩子硬护栏：通过 Session Start 注入成本中心与 £2,000 审批红线，在调用下单工具前返回 continue=false 阻断 8 套入职包超额采购，揭晓会话变量裁剪与 2027 Q1 交付时间表。',
      summaryEn: 'Contrasts soft prompt rules against deterministic lifecycle hooks: loading cost-center & £2,000 limits at Session Start, returning continue=false Before Tool on 8 onboarding kits, and unveiling variable-gated knowledge plus the Q1 CY27 roadmap.',
      cuesZh: [
        '00:24:45 — 架构对偶性：工作流嵌智能节点（确定流调推理）vs. 智能体挂 Hooks（推理流嵌确定性）',
        '00:26:18 — 六大生命周期事件契约：Session Start、Prompt、Before/After Tool、Failure 与 Error',
        '00:28:50 — 对照实验：无 Hook 纯靠提示词读制度存在误读风险且多烧工具调用词元',
        '00:30:12 — 硬护栏生效：8 套入职包触发 £2,000 上限返回 continue=false 阻断，改订 5 套放行',
        '00:32:55 — 会话变量裁剪 HR 部门专属知识库，以及 Python 代码钩子与连续自主会话路线图'
      ],
      cuesEn: [
        '00:24:45 — Architectural duality: Agent nodes in Workflows vs. deterministic Hooks in Agents',
        '00:26:18 — Six lifecycle events: Session Start, User Prompt, Before/After Tool, Failure & Error',
        '00:28:50 — Baseline risk: relying on LLM prompt reading alone burns tokens and risks misreading',
        '00:30:12 — Live block: 8 onboarding kits hit £2,000 limit (continue=false); 5 kits pass cleanly',
        '00:32:55 — Variable-gated HR knowledge, January Python script hooks, and continuous sessions'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk259Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk259-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk259-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var item = ACTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk259-tabs';

      for (i = 0; i < ACTS.length; i++) {
        (function (idx) {
          var act = ACTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk259-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? act.tabEn : act.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var cues = en ? item.cuesEn : item.cuesZh;
      var liHtml = '';
      for (i = 0; i < cues.length; i++) {
        liHtml += '<li>' + cues[i] + '</li>';
      }

      var mediaInnerHtml = playerMounted
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK259 Official Video Player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRK259 Official Session Poster" loading="lazy" />',
            '<button type="button" class="brk259-play-overlay" data-mount-brk259-player="1">',
            '  <span class="brk259-play-circle" aria-hidden="true">&#9654;</span>',
            '  <span class="brk259-play-caption">' + (en ? 'Click to Load Official Medius On-Demand Stream' : '点击在页内加载微软官方 Medius 点播流') + '</span>',
            '</button>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk259-theater-layout">',
        '  <div class="brk259-player-wrap">',
        '    ' + mediaInnerHtml,
        '  </div>',
        '  <div class="brk259-meta">',
        '    <span class="brk259-code">' + item.code + '</span>',
        '    <h4 class="brk259-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk259-speaker">' + (en ? SESSION_META.speakerEn : SESSION_META.speakerZh) + '</div>',
        '    <p class="brk259-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk259-cues">' + liHtml + '</ul>',
        '    <div class="brk259-actions">',
        '      <a class="brk259-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk259-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk259-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK259 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-mount-brk259-player]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          playerMounted = true;
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
    document.addEventListener('DOMContentLoaded', initBrk259Theater);
  } else {
    initBrk259Theater();
  }
})();

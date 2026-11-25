/* posts/ignite-2026-thrsp1157-building-agents-claude-foundry-choosing/thrsp1157-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787858601855001S4cx-1791588239328001Ceki',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/b192dcac-be6a-4530-94cd-169acc180cb3',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Caption/b192dcac-be6a-4530-94cd-169acc180cb3',
    poster: './media/thrsp1157-session-poster.jpg',
    speakerZh: '讲者：Maya Nielan（Anthropic 应用 AI 工程师） · 23m07s 官方实录',
    speakerEn: 'Speaker: Maya Nielan (Applied AI Engineer, Anthropic) · 23m07s Official Recording'
  };

  var ACTS = [
    {
      id: 'act1',
      code: 'THRSP1157 · ACT 1 (00:00 – 07:38)',
      tabZh: '第一幕：能力跃迁与三层模型',
      tabEn: 'Act 1: Capability Leap & 3 Layers',
      titleZh: '从 49% 到 95% 的指数级跃迁，以及“模型—框架—基础设施”三层心智框架',
      titleEn: 'From 49% to 95% on SWE-bench Verified and the Model-Harness-Infra Framework',
      summaryZh: '剖析智能体核心循环为何未变但周边能力全面升级：SWE-bench Verified 从 Sonnet 3.5 的 49.0% 跃升至 Fable 5 的 95.0%，工具链演进出沙盒、技能与记忆，并用“新员工配发笔记本”比喻拆解三层架构。',
      summaryEn: 'Traces why the core tool loop stayed constant while everything around it evolved: SWE-bench Verified jumped from 49.0% (Sonnet 3.5) to 95.0% (Fable 5), paired with sandboxes, skills, and the new-teammate laptop analogy across Model, Harness, and Infra.',
      cuesZh: [
        '00:01:52 — 智能体本质定义：模型在循环中调用工具并自我纠错直至达成目标',
        '00:02:35 — SWE-bench Verified 跃升：2024.10 Sonnet 3.5 (49.0%) → 2026.06 Fable 5 (95.0%)',
        '00:03:30 — 工具与环境演进：从桌面操控（Computer Use）到代码沙盒、Skills、Compaction 与 Dreams',
        '00:04:17 — Anthropic 递归自改进报告：自主智能体集群正在调度其他 Claude 协同开发完整功能',
        '00:05:54 — 新队友入职比喻：现成采购“笔记本”（Harness），把研发精力集中于企业专属知识与连接'
      ],
      cuesEn: [
        '00:01:52 — Defining an agent: a model calling tools in a loop until the goal is complete',
        '00:02:35 — SWE-bench Verified leap: Oct 2024 Sonnet 3.5 (49.0%) to Jun 2026 Fable 5 (95.0%)',
        '00:03:30 — Environment timeline: Computer Use to Code Execution, Skills, Compaction & Dreams',
        '00:04:17 — Recursive self-improvement: autonomous agents managing fleets of other Claudes',
        '00:05:54 — New-hire laptop analogy: buy the harness off the shelf, invest in domain context'
      ]
    },
    {
      id: 'act2',
      code: 'THRSP1157 · ACT 2 (07:39 – 14:30)',
      tabZh: '第二幕：大脑与双手解耦',
      tabEn: 'Act 2: Brain & Hands Split',
      titleZh: 'Anthropic 三阶开发者服务演进：从 Messages API、Agent SDK 到大脑—双手解耦',
      titleEn: 'Anthropic Developer Surfaces: Messages API, Agent SDK, and Splitting Brain from Hands',
      summaryZh: '复盘构建 Claude Code、Cowork、Tag 与 Duet 的架构教训：单容器长时运行易因沙盒崩溃中断，进而演进出 Claude Managed Agents 将编排大脑（The Brain）与执行沙盒（The Hands）彻底分离，并沉淀跨栈可移植的 MCP 与 Skills。',
      summaryEn: 'Distills lessons from building Claude Code, Cowork, Tag, and Duet: single-container failures hours into a task drove Claude Managed Agents to separate orchestration (The Brain) from sandboxes (The Hands), backed by portable MCP and Skills.',
      cuesZh: [
        '00:08:13 — Messages API：最底层的裸金属级控制接口，循环、权限、沙盒与监控全由团队自建',
        '00:09:20 — Claude Agent SDK：将驱动 Claude Code 的同款 Python/TS 框架开箱交付并随新模型持续调优',
        '00:10:58 — 大脑与双手解耦（Brain & Hands）：分离智能体编排循环与代码执行沙盒以实现秒级故障恢复',
        '00:12:05 — 凭据金库（Vaults）隔离原始密钥、Azure 自托管沙盒，以及私有化自托管 CMA 私测版',
        '00:13:50 — 跨栈不变资产：MCP 系统连接器、Agent Skills 规范与领域提示词可在任意技术栈间平滑迁移'
      ],
      cuesEn: [
        '00:08:13 — Messages API: bare-metal building blocks when you own loop, permissions & hosting',
        '00:09:20 — Claude Agent SDK: the Python/TS harness powering Claude Code, maintained by Anthropic',
        '00:10:58 — Brain vs. Hands split: decoupling agent loop from sandbox for long-horizon recovery',
        '00:12:05 — External credential Vaults, Azure self-hosted sandboxes & private-beta self-hosted CMA',
        '00:13:50 — Portable investments: MCP connectors, Agent Skills, and prompts transfer everywhere'
      ]
    },
    {
      id: 'act3',
      code: 'THRSP1157 · ACT 3 (14:31 – 23:07)',
      tabZh: '第三幕：Foundry 选型与六大画像',
      tabEn: 'Act 3: Foundry Stack & 6 Personas',
      titleZh: 'Claude in Foundry 采购托管边界、Foundry 托管智能体与六类真实业务选型矩阵',
      titleEn: 'Claude in Foundry Procurement, Foundry Hosted Agents, and the Six-Persona Playbook',
      summaryZh: '逐层对比自建与采购光谱：辨析 Foundry 中 Azure 托管与 Anthropic 托管的功能与合规差异，详解 Foundry Hosted Agents 四大能力（端点、Entra ID、每会话隔离沙盒、App Insights），并给出六种企业场景的对号入座方案。',
      summaryEn: 'Walks through the Build-vs-Buy spectrum on Microsoft Foundry: comparing Azure-hosted vs. Anthropic-hosted Claude, Foundry Hosted Agents (endpoint, Entra ID, per-session sandbox, App Insights), and six concrete team personas.',
      cuesZh: [
        '00:15:15 — 模型采购与托管辨析：抵扣 Azure MACC 承诺额，对比 Azure 托管（US 数据区）与 Anthropic 托管',
        '00:16:36 — 微软侧框架对比：多模型开源 Microsoft Agent Framework (.NET/Python) 与低代码 Copilot Studio',
        '00:18:12 — Foundry Hosted Agents：容器化托管运行时，赋予独立 Entra ID、会话隔离沙盒与 App Insights',
        '00:19:10 — 六大业务画像上半场：教育产品快速上线（CMA）、保险数小时理赔合规内网（自托管 CMA）与研发 CI 自愈',
        '00:21:08 — 六大业务画像下半场：多模型切换应用（MAF）、HR 零代码助手（Copilot Studio）与底层平台自建'
      ],
      cuesEn: [
        '00:15:15 — Model procurement vs. hosting: MACC drawdown, Azure US Data Zone vs. Hosted on Anthropic',
        '00:16:36 — Microsoft harnesses: multi-model Microsoft Agent Framework (.NET/Python) & Copilot Studio',
        '00:18:12 — Foundry Hosted Agents: managed container runtime with Entra ID, sandboxes & App Insights',
        '00:19:10 — Personas 1–3: EdTech memory app (CMA), regulated insurance claims (self-hosted CMA) & SDLC CI',
        '00:21:08 — Personas 4–6: multi-model picker (MAF), M365 HR helper (Copilot Studio) & custom API loop'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThrsp1157Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thrsp1157-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thrsp1157-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var item = ACTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thrsp1157-tabs';

      for (i = 0; i < ACTS.length; i++) {
        (function (idx) {
          var act = ACTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thrsp1157-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THRSP1157 Official Video Player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 THRSP1157 Official Session Poster" loading="lazy" />',
            '<button type="button" class="thrsp1157-play-overlay" data-mount-thrsp1157-player="1">',
            '  <span class="thrsp1157-play-circle" aria-hidden="true">&#9654;</span>',
            '  <span class="thrsp1157-play-caption">' + (en ? 'Click to Load Official Medius On-Demand Stream' : '点击在页内加载微软官方 Medius 点播流') + '</span>',
            '</button>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="thrsp1157-theater-layout">',
        '  <div class="thrsp1157-player-wrap">',
        '    ' + mediaInnerHtml,
        '  </div>',
        '  <div class="thrsp1157-meta">',
        '    <span class="thrsp1157-code">' + item.code + '</span>',
        '    <h4 class="thrsp1157-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thrsp1157-speaker">' + (en ? SESSION_META.speakerEn : SESSION_META.speakerZh) + '</div>',
        '    <p class="thrsp1157-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thrsp1157-cues">' + liHtml + '</ul>',
        '    <div class="thrsp1157-actions">',
        '      <a class="thrsp1157-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thrsp1157-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript (DOCX)' : '⬇ 下载官方演讲文稿') + '</a>',
        '      <a class="thrsp1157-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THRSP1157 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-mount-thrsp1157-player]');
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
    document.addEventListener('DOMContentLoaded', initThrsp1157Theater);
  } else {
    initThrsp1157Theater();
  }
})();

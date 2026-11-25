/* posts/ignite-2026-live107-agent-boss/live107-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/live107-official-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/e2c16839-f8e3-493a-a698-c79121165845',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1793673035822001IAoZ-AAAAAAAAAAAAAAAAAAAA',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/e2c16839-f8e3-493a-a698-c79121165845',
    guideUrl: 'https://aka.ms/agentboss',
    speakersZh: 'Jeremy Chapman（Microsoft Mechanics）· Jack Rowbotham（Microsoft Copilot Studio）',
    speakersEn: 'Jeremy Chapman (Microsoft Mechanics) · Jack Rowbotham (Microsoft Copilot Studio)'
  };

  var CHAPTERS = [
    {
      id: 'shifts-patterns',
      time: '00:00:09 – 00:02:11',
      tabZh: '00:09 三次演进与四大模式',
      tabEn: '00:09 3 Shifts & 4 Patterns',
      titleZh: '从检索、任务到自主循环：复盘 Assist、Delegate、Build、Automate 四大人机协作模式',
      titleEn: 'From Retrieval to Autonomy: Unpacking Assist, Delegate, Build, and Automate',
      summaryZh: 'Jeremy Chapman 与 Jack Rowbotham 开场梳理过去数年 AI 的三次跃迁（检索、任务连接、推理自主循环），并对照演示文稿逐一拆解辅助、委派、定制构建与自动巡航四种交互模式。',
      summaryEn: 'Jeremy Chapman and Jack Rowbotham trace three foundational AI shifts—Retrieval, Tasks, and Autonomy—and map them onto four human-AI interaction patterns: Assist, Delegate, Build, and Automate.',
      bulletsZh: [
        '00:00:21 — 三大底层演进：从业务数据检索（Retrieval），到连接协议更新系统的任务执行（Tasks），再到推理规划的自主循环（Autonomy）',
        '00:01:10 — Assist（聊天审阅总结）与 Delegate（定义目标生成 PPT/Word 初稿后人工精修）构成高频起步形态',
        '00:01:42 — Build（围绕独特流程编写规格定制方案）与 Automate（设定权限策略后后台全天候自动巡航）打开深水区价值'
      ],
      bulletsEn: [
        '00:00:21 — Three shifts: grounded data retrieval, MCP-connected business tasks, and autonomous reasoning loops',
        '00:01:10 — Assist (chat review/summary) and Delegate (drafting PowerPoint/Word deliverables for human refinement)',
        '00:01:42 — Build (authoring custom specs for unique workflows) and Automate (setting permissions and policies for always-on autopilot)'
      ]
    },
    {
      id: 'agent-boss-ratio',
      time: '00:02:12 – 00:03:35',
      tabZh: '02:12 智能体老板与 1:10/1:5 配比',
      tabEn: '02:12 Agent Boss & 1:10 / 1:5 Ratio',
      titleZh: '连接 Chat / Co-work / Code / Auto 新工作模式：按自主风险设定人机管理配比',
      titleEn: 'Connecting Chat, Co-work, Code, and Auto: Sizing Your Human-to-Agent Ratio by Risk',
      summaryZh: '将四大模式映射为四种新工作形态后，Jack 阐明“智能体老板”的核心在于从真实业务意图出发放大个人影响力，并按智能体自主程度动态调配单人管理幅度。',
      summaryEn: 'Mapping the four patterns to Chat, Co-work, Code, and Auto, Jack defines an Agent Boss as someone who drives end-to-end intent and calibrates human-to-agent ratios by autonomy level.',
      bulletsZh: [
        '00:02:23 — 四种新工作形态对齐：Assist = Chat、Delegate = Co-work、Build = Code、Automate = Auto',
        '00:03:02 — 引入“人与智能体配比（Human-to-Agent Ratio）”指标：因组织、部门与岗位职责而异',
        '00:03:14 — 简单对话类智能体可高达 1:10；高自主性智能体因需持续引导与调优，管理幅度宜收敛至约 1:5'
      ],
      bulletsEn: [
        '00:02:23 — Aligns the four new modes of work: Assist = Chat, Delegate = Co-work, Build = Code, Automate = Auto',
        '00:03:02 — Introduces the Human-to-Agent Ratio, tailored to each organization, department, and individual role',
        '00:03:14 — Simpler chat experiences scale to ~1:10, whereas autonomous agents require hands-on guidance closer to ~1:5'
      ]
    },
    {
      id: 'discover-build-deputize',
      time: '00:03:36 – 00:05:17',
      tabZh: '03:36 立项构建与受权代办',
      tabEn: '03:36 Discover, Build & Deputize',
      titleZh: '六阶段生命周期前篇：先算清 ROI，拒绝盲目 AI 化，以“受权代办”守住人类问责主驾席',
      titleEn: 'Lifecycle Stages 1–3: Lead with ROI, Make AI Earn Its Route, and Deputize with Accountability',
      summaryZh: '人类在全生命周期始终坐在主驾席：Discover 阶段拒绝先造再补理由；Build 阶段避免为无用输出白付词元薪水；Delegate 阶段通过“受权代办（Deputize）”明确业务问责仍归属人类。',
      summaryEn: 'Humans stay in the driver\'s seat across Discover (upfront ROI), Build (combining deterministic routes with apps, workflows, and agents so tokens aren\'t wasted), and Delegate (deputizing work while keeping human accountability).',
      bulletsZh: [
        '00:03:49 — Discover（价值发现）：紧盯真实商业机会与投资回报率，切忌先动手搭出来再回头硬凑合理性',
        '00:04:11 — Build（混合构建）：让 AI 凭价值挣得环节席位，固定步骤保留确定性路径，不给闲置无用输出白付额度或词元“薪水”',
        '00:04:53 — Delegate（受权代办 Deputize）：配置人在回路审批与异常标记——智能体执行具体活计，但人类对业务流程负最终责任'
      ],
      bulletsEn: [
        '00:03:49 — Discover: anchor on real business value and ROI first rather than building first and justifying later',
        '00:04:11 — Build: make AI earn its route alongside deterministic steps, apps, and workflows—never pay token "salaries" for unused output',
        '00:04:53 — Delegate ("Deputize"): define HITL approvals and flags; the agent executes, but the human owns the process'
      ]
    },
    {
      id: 'manage-improve-evals',
      time: '00:05:18 – 00:06:42',
      tabZh: '05:18 运行纳管与评测调优',
      tabEn: '05:18 Manage, Evals & Token Tuning',
      titleZh: '六阶段生命周期中篇：监控工具调用与推理质量，用小步 Evals 切换高性价比模型与调度频次',
      titleEn: 'Lifecycle Stages 4–5: Track Reasoning KPIs, Run Small-Step Evals, and Right-Size Models & Schedules',
      summaryZh: '上线绝非终点：Manage 阶段持续核查采用率、工具调用与推理链路；Improve 阶段通过自动化评测集（Evals）小步验证指令修改、替换更高词元效率的模型并削减冗余定时任务。',
      summaryEn: 'Post-launch rigor requires Manage (checking adoption KPIs, tool selection, and reasoning) and Improve (running evals, swapping in token-efficient models, making small verified changes, and trimming scheduled runs).',
      bulletsZh: [
        '00:05:18 — Manage（持续纳管）：检视真实使用率、价值转化、是否正确调用工具以及底层推理是否合乎预期',
        '00:05:38 — Improve（评测调优）：运行 Evals 验证效果，尝试切换词元/额度效率更高的非最昂贵前沿模型，每次只改一小步并证明有效',
        '00:06:16 — 审视后台定时任务频次：无需每天空跑 3–4 次的任务可改为隔天运行，砍掉不值得做的冗余消耗'
      ],
      bulletsEn: [
        '00:05:18 — Manage: monitor adoption KPIs, delivered value, accurate tool invocation, and sound reasoning',
        '00:05:38 — Improve: run evals, swap to more token/credit-efficient models where appropriate, and validate one small change at a time',
        '00:06:16 — Right-size scheduled tasks: drop 3–4x daily runs to once every other day when aligned with real work patterns'
      ]
    },
    {
      id: 'scale-retire-skills',
      time: '00:06:43 – 00:08:51',
      tabZh: '06:43 扩缩退役与管理软技能',
      tabEn: '06:43 Scale, Retire & Boss Skills',
      titleZh: '六阶段生命周期终篇：跨组织推广或果断退役合并，锤炼判断力与系统思维软实力',
      titleEn: 'Stage 6 & Getting Started: Scale or Retire via A2A Consolidation, Plus Essential Human Soft Skills',
      summaryZh: '收官阶段探讨从团队向部门与全企规模化推广，像传统 IT 应用治理一样果断退役失效方案、用智能体间协议（A2A）整合零散智能体，并给出 aka.ms/agentboss 入门入口与软硬技能清单。',
      summaryEn: 'Closes the lifecycle with scaling across teams/orgs or retiring and consolidating duplicate bots via agent-to-agent protocols, then highlights aka.ms/agentboss alongside critical thinking and systems judgment.',
      bulletsZh: [
        '00:06:48 — Scale or Retire（规模化或退役清理）：评估推向团队、部门或全公司，同时果断下线无价值智能体并合并零散重复实例',
        '00:07:37 — 借助智能体间协议（Agent-to-Agent Protocols）建立有意识的协同连接，将优秀单点能力整合进端到端流程',
        '00:07:54 — 访问 aka.ms/agentboss 起步：除提示词、负责任 AI 与护栏等硬技能外，更要锤炼抱负、判断力、批判性思维与系统思维'
      ],
      bulletsEn: [
        '00:06:48 — Scale or Retire: expand proven value to departments/orgs, or retire and consolidate overlapping small installations',
        '00:07:37 — Leverage agent-to-agent protocols to intentionally connect specialized agents across business processes',
        '00:07:54 — Start at aka.ms/agentboss: pair prompt engineering and guardrails with human ambition, judgment, critical thinking, and systems thinking'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLive107Theater() {
    var controls = document.querySelector('[data-sandbox-controls="live107-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="live107-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'live107-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'live107-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVE107 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVE107 How to be an Agent Boss official session cover" loading="lazy" />' +
          '<button type="button" class="live107-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="live107-play-pill">' + (en ? '▶ Load Official Broadcast Stream (8m 52s)' : '▶ 点击加载官方演播室点播流（8 分 52 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="live107-theater-layout">',
        '  <div class="live107-player-wrap">' + mediaInner + '</div>',
        '  <div class="live107-meta">',
        '    <span class="live107-code">LIVE107 · ' + item.time + '</span>',
        '    <h4 class="live107-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="live107-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="live107-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="live107-highlights">' + liHtml + '</ul>',
        '    <div class="live107-actions">',
        '      <a class="live107-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="live107-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official HD MP4' : '⬇ 官方高清 MP4 直链') + '</a>',
        '      <a class="live107-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVE107 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="live107-btn" href="' + SESSION_META.guideUrl + '" target="_blank" rel="noopener">' + (en ? '↗ aka.ms/agentboss' : '↗ 官方指南 aka.ms/agentboss') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLive107Theater);
  } else {
    initLive107Theater();
  }
})();

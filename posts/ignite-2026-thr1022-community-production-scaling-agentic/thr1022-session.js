/* posts/ignite-2026-thr1022-community-production-scaling-agentic/thr1022-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr1022-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/8dfb35b2-a9de-4c2d-9f22-b5e4870c9c77',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856601255001EaAa-1791588248645001CLer',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/8dfb35b2-a9de-4c2d-9f22-b5e4870c9c77',
    speakersZh: 'David Abu（Microsoft 高级产品营销经理 · Copilot Studio / Power Platform / Dynamics 365 全球社区负责人）',
    speakersEn: 'David Abu (Sr. Product Marketing Manager, Microsoft · Global Community Lead for Copilot Studio, Power Platform & Dynamics 365)'
  };

  var CHAPTERS = [
    {
      id: 'value-gap',
      time: '00:00:00 – 00:03:55',
      tabZh: '00:00 71% vs 13% 价值鸿沟',
      tabEn: '00:00 71% vs. 13% Value Gap',
      titleZh: '从“涌入又涌出”的快闪活动到规模化投产：破解 71% 意向与 13% 价值错位',
      titleEn: 'Beyond Rush-In Hackathons: Closing the 71% Intent vs. 13% Scale Value Gap',
      summaryZh: 'David Abu 复盘企业办活动“人来得快、散得也快”的普遍现象，援引 Gartner 调研揭示 71% 组织已在或计划 12 个月内部署智能体、却仅 13% 跑出规模化显著价值的核心错位。',
      summaryEn: 'David Abu contrasts fleeting hackathon attendance against production business goals, citing Gartner data where 71% deploy or plan agents within 12 months while only 13% realize significant value at scale.',
      bulletsZh: [
        '00:00:53 — 破除“办场活动就等于采纳”的迷思：员工涌入又匆匆离场，黑客松原型与生产交付属于两套完全不同的对话',
        '00:02:00 — 双向拷问：一线创作者苦于如何从海量试点提案筛出高回报项目，高管赞助人则直接追问投入产出账本',
        '00:03:19 — Gartner 基准警示：71% 部署意向对比 13% 规模化价值兑现，瓶颈不在“会不会建智能体”，而在能否证明真实业务影响'
      ],
      bulletsEn: [
        '00:00:53 — Event attendance is not adoption: moving hackathon prototypes into production is a fundamentally different discipline',
        '00:02:00 — Two-sided tension: makers struggle to pick pilots for ROI while executive sponsors demand clear investment payback',
        '00:03:19 — Gartner reality check: 71% plan/deploy within 12 months vs. 13% reporting significant value at scale'
      ]
    },
    {
      id: 'choose-portfolio',
      time: '00:03:56 – 00:10:50',
      tabZh: '03:56 四象限组合与四测计分卡',
      tabEn: '03:56 Portfolio & 4-Test Scorecard',
      titleZh: 'CHOOSE 严选机制：拒收泛化“点子”，用四象限配比与四项测试计分卡锁死断裂工作流',
      titleEn: 'CHOOSE Discipline: Broken Workflows, Portfolio Quadrants & the Four-Test Scorecard',
      summaryZh: '剖析为何从 50 份黑客松提案挑出前 5 名依然折戟：员工常拿 Copilot 生成的 10 个脱离现状的点子找研发代工，或者自动化后仍留最后两步手工尾巴；提出资助 3–5 项速赢与 1–2 项战略投资的四象限法则及四项硬测试。',
      summaryEn: 'Explains why picking top hackathon demos still fails when ideas miss broken workflows or leave the last two steps manual, introducing Quick Win/Strategic portfolio sizing and the four-test scorecard.',
      bulletsZh: [
        '00:05:19 — 反面典型：让 Copilot 随手列 10 个智能体点子交给研发（Isaac），或盲目索要“4 个 Autopilot”，均偏离真实痛点',
        '00:06:38 — 端到端铁律：若跨多套工具的流程自动化后仍需人工手填最后两步，一线员工很快就会彻底弃用',
        '00:07:15 — 组合配比与四测计分卡：优先资助 3–5 项速赢 + 1–2 项阶段门禁战略项目；逐一核验高频重复（每周 1–2 次而非每季一次）、挂钩指标、人机交接与端到端闭环'
      ],
      bulletsEn: [
        '00:05:19 — Anti-patterns: copying 10 generic prompt ideas to engineering or requesting 4 Autopilots when 1 orchestrator suffices',
        '00:06:38 — End-to-end mandate: if automation still leaves the last two steps manual across tools, users abandon it',
        '00:07:15 — Fund 3–5 Quick Wins + 1–2 Strategic bets; score weekly repetition, tracked metrics, handoff quality, and full workflow coverage'
      ]
    },
    {
      id: 'prove-roi',
      time: '00:10:51 – 00:15:05',
      tabZh: '10:51 建前五问、工时折算与标杆案例',
      tabEn: '10:51 ROI Math & Global Proof',
      titleZh: 'PROVE 价值核验：开工前五问、50% 工时再投资折算公式与六大企业真实账本',
      titleEn: 'PROVE Value: Pre-Build Baseline, 50% Time-Recapture Math & Six Enterprise Paybacks',
      summaryZh: '立下“无指标不开发、无基线与责任人则试点永远只是演示”的铁规，拆解“省 1,000 小时 ≠ 净赚 $72,000”的回收率与归因折算逻辑，并展示 PG&E、喜力、新加坡民防部队、爱立信、范德兰德与埃森哲的量化回报。',
      summaryEn: 'Establishes five pre-build value questions, debunks raw time-saved math via 50% recapture and attribution share, and showcases verified ROI across PG&E, HEINEKEN, SCDF, Ericsson, Vanderlande, and Accenture.',
      bulletsZh: [
        '00:11:08 — 开工前五问：兼顾 CFO 等高管速赢与一线减负，锁定基线与扩停评审人——没有基线和责任人，试点永远停留在 Demo',
        '00:13:15 — 工时价值折算真相：1,000 小时 × $72 = $72K 账面数字必须乘以有效再投资回收率（如 50% 折为 $36K）与归因份额',
        '00:13:44 — 治理托底 ROI 与客户实证：仅 21% 组织建有智能体治理框架（其中 43% 含退役标准）；PG&E 年省约 $7,500 万、SCDF 不到 $5 万成本撬动约 $2,000 万价值'
      ],
      bulletsEn: [
        '00:11:08 — Five pre-build questions: pair executive and employee wins; no baseline and no owner keeps a pilot a demo',
        '00:13:15 — Time-saved math: 1,000 hrs × $72 ($72K) shrinks to $36K at 50% recapture before attribution share—only reinvested time counts',
        '00:13:44 — Governance shapes ROI (21% have frameworks, 43% include retirement); PG&E (~$75M/yr) and SCDF (~$20M value under $50K cost)'
      ]
    },
    {
      id: 'sustain-admin',
      time: '00:15:06 – 00:18:44',
      tabZh: '15:06 采纳习惯飞轮与 M365 限额',
      tabEn: '15:06 Flywheel & M365 Spend Caps',
      titleZh: 'SUSTAIN 持续运营：社区驱动日常习惯飞轮，联动 M365 管理中心严控消费上限',
      titleEn: 'SUSTAIN Scale: The Community-Habit Flywheel & Microsoft 365 Admin Spend Governance',
      summaryZh: '指出上线生产绝非终点，唯有靠持续改进把“尝鲜认知”固化为“离了它干不了活”的日常习惯才能留存价值，同时在 Microsoft 365 管理中心统一配置按人、按组、按智能体的消费限额、告警与计费看板。',
      summaryEn: 'Highlights continuous improvement and habit formation as the antidote to abandoned apps, backed by centralized spending policies, limits, alerts, and credit tracking inside the Microsoft 365 admin center.',
      bulletsZh: [
        '00:16:16 — 留存分水岭：现场互动点明“持续演进（Continuous Improvement）”与日常习惯（Awareness to Habit）决定智能体是被弃用还是成为刚需',
        '00:16:25 — 双向采纳飞轮：社区培育创作者与先锋建立信任与价值，习惯养成催生内部倡导者，进而吸引更多人反哺社区',
        '00:17:08 — M365 管理中心成本护栏：集中设定消费策略覆盖对象、单个员工或智能体的美元/点数上限、超支预警及高消耗排行'
      ],
      bulletsEn: [
        '00:16:16 — Retention divider: continuous improvement turns awareness into daily habit ("I cannot work without this agent")',
        '00:16:25 — Adoption flywheel: community makers/champions build trust and value, while advocates bring new users back in',
        '00:17:08 — M365 admin center controls: set spending policies, per-user/agent dollar or credit limits, alerts, and usage reporting'
      ]
    },
    {
      id: 'next-steps',
      time: '00:18:45 – 00:20:48',
      tabZh: '18:45 下周一即刻落地的三步行动',
      tabEn: '18:45 Three Immediate Next Steps',
      titleZh: '行动路线图：下周一改征断裂流、本月拉决策者共评四测、每个试点实名问责',
      titleEn: 'Execution Playbook: Monday Intake Shift, Monthly Scored Triage & Accountable Pilots',
      summaryZh: '压轴浓缩“下周一、本月、每个试点”三阶落地口诀：彻底停止征集空泛智能体点子，黑客松开场直接追问“哪个现有流程最让你头疼且耗时一两周”，并附赠微软官方先锋网络、ROI 测算与 Copilot Studio 采纳资源直链。',
      summaryEn: 'Wraps up with a concrete three-horizon checklist—Monday intake reform, this month\'s decision-maker scoring, and per-pilot ownership—plus official Microsoft Champion, ROI, and adoption resource hubs.',
      bulletsZh: [
        '00:18:55 — 下周一（Monday · 改写准入）：黑客松与头脑风暴不再问“想建什么智能体”，改问“团队眼下哪个断裂流程耗时一周甚至两月”',
        '00:19:41 — 本月内（This Month · 四测共审）：用四项测试计分卡逐一打分，且必须把业务决策者请进评审现场共同担责',
        '00:20:01 — 每个试点（Every Pilot · 无主不立）：落实实名试点负责人（No owner, no pilot）与官方三套实操工具包'
      ],
      bulletsEn: [
        '00:18:55 — Monday (Change intake): stop asking for agent ideas in hackathons; ask for broken workflows taking weeks to finish',
        '00:19:41 — This Month (Score every idea): apply all four scorecard tests with an accountable decision maker in the room',
        '00:20:01 — Every Pilot (No owner, no pilot): name the pilot owner and target outcome, backed by official Microsoft adoption toolkits'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr1022Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr1022-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr1022-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr1022-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr1022-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR1022 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR1022 From Community to Production: Scaling Agentic Business Apps official session cover" loading="lazy" />' +
          '<button type="button" class="thr1022-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr1022-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr1022-theater-layout">',
        '  <div class="thr1022-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr1022-meta">',
        '    <span class="thr1022-code">THR1022 · ' + item.time + '</span>',
        '    <h4 class="thr1022-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr1022-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr1022-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr1022-highlights">' + liHtml + '</ul>',
        '    <div class="thr1022-actions">',
        '      <a class="thr1022-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr1022-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official DOCX Transcript' : '⬇ 下载官方逐字稿 (DOCX)') + '</a>',
        '      <a class="thr1022-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR1022 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr1022Theater);
  } else {
    initThr1022Theater();
  }
})();

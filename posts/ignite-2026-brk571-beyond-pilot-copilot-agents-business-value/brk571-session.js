/* posts/ignite-2026-brk571-beyond-pilot-copilot-agents-business-value/brk571-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/brk571-session-cover.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/3396087b-841c-4f43-b435-e0630bd79f88',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1791521573359001iLsm-1791930938746001bmQL',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/3396087b-841c-4f43-b435-e0630bd79f88',
    speakersZh: 'Srini Raghavan & Steve Gustavson (Microsoft) · Martin Johnson (Ericsson) · Michael DiPaolo (Bristol Myers Squibb)',
    speakersEn: 'Srini Raghavan & Steve Gustavson (Microsoft) · Martin Johnson (Ericsson) · Michael DiPaolo (Bristol Myers Squibb)'
  };

  var CHAPTERS = [
    {
      id: 'foundations',
      time: '00:00:00 – 00:10:15',
      tabZh: '00:00 跨越试点与战略提速 7 倍',
      tabEn: '00:00 Beyond Pilots & 7x Strategy',
      titleZh: '跳出会议纪要套娃：三大支柱与爱立信、BMS 真实破局案例',
      titleEn: 'Escaping Recap Loops: Three Pillars and Real Ericsson & BMS Breakthroughs',
      summaryZh: 'Srini Raghavan 直指企业 AI 不能停留在“总结上一场周会去开下一场周会”，提出可靠性（Work IQ）、可信治理与经济学回报三大支柱；爱立信与百时美施贵宝披露从试点迈向生产的标杆智能体。',
      summaryEn: 'Srini Raghavan warns against status-meeting recap loops, framing Work IQ reliability, agent governance, and ROI economics before Ericsson and BMS share production breakthroughs.',
      bulletsZh: [
        '00:03:20 — 爱立信依托 15,000 名创作者与 20,000 个 Power Apps 底座，用 Cowork 实现客户会议结束即生成行动计划',
        '00:04:40 — 百时美施贵宝将去年的绩效评估试点升级为 Leader Assist，聚合 3–5 套系统在 Teams 内主动推送管理提醒',
        '00:08:25 — 爱立信业务部门用 Cowork + 魔鬼代言人质询智能体将 5 年战略规划周期从 1 周压缩至 1 天（提速 7 倍）'
      ],
      bulletsEn: [
        '00:03:20 — Ericsson builds on 15,000 makers and 20,000 Power Apps, turning customer meetings straight into engagement plans',
        '00:04:40 — BMS evolves its review pilot into Leader Assist, unifying 3–5 HR systems into proactive Teams nudges',
        '00:08:25 — Ericsson compresses a 1-week 5-year strategy cycle into 1 day (7x faster) using Cowork plus a devil\'s advocate agent'
      ]
    },
    {
      id: 'hygiene-ux',
      time: '00:10:16 – 00:21:15',
      tabZh: '10:16 权限重验与多端智能路由',
      tabEn: '10:16 Data Hygiene & Smart Router',
      titleZh: '堵住 30 年历史共享漏洞，消解 Chat / Cowork / Autopilot 选择负担',
      titleEn: 'Fixing 30-Year Oversharing & Dissolving Chat, Cowork, and Autopilot Cognitive Load',
      summaryZh: 'BMS 坦承早期 SharePoint 智能体试点暴露了积攒 30 年的历史权限过度共享，倒逼全盘重验数据标签；Steve Gustavson 揭秘微软内部正在测试的智能路由器与左侧栏 Autopilot 交互哲学。',
      summaryEn: 'BMS recounts pausing to audit 30 years of legacy SharePoint permissions after early oversharing alerts, while Steve Gustavson details Microsoft\'s internal smart router and human observability UX.',
      bulletsZh: [
        '00:11:02 — BMS 安全巡检发现员工离职转岗遗留群组权限，全面重验 SharePoint 站点分类后再小步扩面',
        '00:13:05 — Srini 演示会议途中一句指令让 Autopilot 代发会议录像权限给 3 位同事，省去手工 8 步点击',
        '00:17:15 — 微软内测智能路由器自动分流免费许可证内问答与消耗点数的 ERP 结账任务，并在 GitHub 开源约 150 款行业插件（源自 1,700 场客户深访）'
      ],
      bulletsEn: [
        '00:11:02 — BMS revalidates 30-year SharePoint permissions and stale role groups before scaling agents',
        '00:13:05 — Srini delegates an 8-click Teams recording permission grant to Autopilot mid-meeting',
        '00:17:15 — Steve reveals an internal smart router for license vs. credit tasks; Srini announces ~150 open-source GitHub industry plugins from 1,700 customer interviews'
      ]
    },
    {
      id: 'finops',
      time: '00:21:16 – 00:28:10',
      tabZh: '21:16 8.5 万员工 FinOps 与三塔重连',
      tabEn: '21:16 85K-Staff FinOps & Rewiring',
      titleZh: '让可变成本归属收益发生处：爱立信三级足迹看板与 BMS 流程重连',
      titleEn: 'Assigning Variable Spend to Business Benefit: Ericsson FinOps & BMS Process Rewiring',
      summaryZh: '面对跨平台多模型并存现实，爱立信为 85,000 名员工与 30,000 席许可证构建自研成本透视应用；BMS 按科研、商业研发与知识员工三塔推进“流程重连（Rewiring）”，拆解十年陈旧 SOP。',
      summaryEn: 'Operating multi-platform AI across 85,000 employees (30,000 Copilot seats), Ericsson assigns variable AI spend to benefiting units via a 3-tier Power App, while BMS rewires decade-old regulated SOPs.',
      bulletsZh: [
        '00:22:45 — 爱立信确立铁律：AI 可变消耗归属业务受益方，员工、经理与财务总监分级实时查看算力与许可足迹',
        '00:24:02 — Agent 365 全新业务分析模块打通 OpenAI、Anthropic 等跨平台消耗与业务产出度量',
        '00:25:10 — BMS 设立分子研发、结构化商业研发与日常知识工作三座业务塔，逐条审视 10 年老流程中哪些审批可自动化'
      ],
      bulletsEn: [
        '00:22:45 — Ericsson\'s Power App exposes individual, manager, and controller AI consumption across 85,000 staff',
        '00:24:02 — Agent 365 business analytics tracks outcomes and cross-platform usage spanning OpenAI and Anthropic',
        '00:25:10 — BMS splits AI across molecule discovery, commercial R&D, and knowledge work to tear apart 10-year SOPs'
      ]
    },
    {
      id: 'recode',
      time: '00:28:11 – 00:33:45',
      tabZh: '28:11 18 步压至 4 步与边界护栏',
      tabEn: '28:11 18→4 Step Recode & Guardrails',
      titleZh: '告别“蒸汽机换大电机”：录屏重构业务流与 5 万创作者硬边界沙盒',
      titleEn: 'From Steam-Engine Retrofits to Workflow Recoding and Guarded 50K-Maker Sandboxes',
      summaryZh: 'Srini 以工厂电气化初期死守中央大电机的历史类比企业“重构（Recode）”的必要性；Steve 与 Martin 阐述如何用前端推理加后端确定性轨道，在硬性合规护栏内释放数万名领域专家的创造力。',
      summaryEn: 'Using the steam-to-electricity factory analogy, panelists contrast +20% bolt-on gains against 80% workflow recoding—recording 18-step tasks into 4-step agents inside hard governance borders.',
      bulletsZh: [
        '00:29:20 — 受监管行业从 Cowork 挖掘复杂流程后沉淀回 Copilot Studio：前端允许弹性探索，后端合规环节锁死确定性轨道',
        '00:31:25 — 约翰迪尔（John Deere）实地跟访拖拉机作业启发销售财务革新；客户直接录屏将 18 步繁琐操作喂给 Studio 压缩为 4 步',
        '00:32:35 — 爱立信总结 7 年 Power Platform 经验：用不可逾越的硬性护栏（Box with Borders）托底，赋能最高 50,000 名创作者自由创新'
      ],
      bulletsEn: [
        '00:29:20 — Mine complex Cowork patterns into Copilot Studio: stochastic upfront, deterministic rails for regulated execution',
        '00:31:25 — John Deere field research ("touch the tractors") and Teams screen recordings compress 18-step workflows into 4 steps',
        '00:32:35 — Ericsson\'s 7-year "box with borders" philosophy lets up to 50,000 makers innovate safely inside hard guardrails'
      ]
    },
    {
      id: 'qa',
      time: '00:33:46 – 00:46:10',
      tabZh: '33:46 现场五问：盘点 2.5 万代理与 CFO 预算',
      tabEn: '33:46 Live Q&A: 25K Audit & CFO Caps',
      titleZh: '五大实战拷问：民间智能体收敛、$50 月度封顶、多代理编排与先锋机制',
      titleEn: 'Five Candid Audience Q&As: 25K Agent Inventory, $50 CFO Caps, Superagents & Hub-and-Spoke',
      summaryZh: '来自安朗杰（Allegion）、法国药企、荷兰私人银行与吉利德科学（Gilead Sciences）的四位听众轮番抛出尖锐难题，嘉宾给出经生产验证的落地解法。',
      summaryEn: 'Leaders from Allegion, a French pharma firm, a Dutch bank, and Gilead Sciences press the panel on citizen-agent sprawl, unpredictable pay-per-use bills, workflow extraction, and ownership.',
      bulletsZh: [
        '00:34:45 — 收敛 25,000 个全民开发智能体：先拉清单写简述找跨部门共性（如项目管理），试点证兴趣、复购率证产品',
        '00:36:35 — 说服 CFO 控住按量计费：设定每人或每组每月 $50 硬性点数封顶，结合重构研发人效账本算总账',
        '00:39:55 — 化解业务部门“怕被抽走流程”的戒心：拒绝五人小队强行索取流程，靠承诺 1 年投入期的业务先锋（Champions）按中枢辐射（Hub-and-Spoke）机制共建'
      ],
      bulletsEn: [
        '00:34:45 — Curating 25,000 citizen agents at BMS: inventory owners, spot cross-dept commonality ("pilots prove interest, repeatability proves the product")',
        '00:36:35 — Winning CFO sign-off on pay-per-use: enforce hard $50/month token caps per user or vendor group',
        '00:39:55 — Partnering vs. extracting workflows: nominated 1-year business champions feed a hub-and-spoke intake model'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk571Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk571-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk571-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk571-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk571-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK571 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK571 Beyond the Pilot official session cover" loading="lazy" />' +
          '<button type="button" class="brk571-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk571-play-pill">' + (en ? '▶ Load Official Video Player (46 min)' : '▶ 点击加载官方内嵌点播流（46 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk571-theater-layout">',
        '  <div class="brk571-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk571-meta">',
        '    <span class="brk571-code">BRK571 · ' + item.time + '</span>',
        '    <h4 class="brk571-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk571-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk571-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk571-highlights">' + liHtml + '</ul>',
        '    <div class="brk571-actions">',
        '      <a class="brk571-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk571-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk571-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK571 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk571Theater);
  } else {
    initBrk571Theater();
  }
})();

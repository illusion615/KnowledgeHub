/* posts/ignite-2026-thr1021-scaling-copilot-studio-adoption-through/thr1021-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr1021-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/94421f2b-19dc-4225-8b67-aed713685a76',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856601105001EEot-1791588257574001Cxwy',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/94421f2b-19dc-4225-8b67-aed713685a76',
    learnUrl: 'https://aka.ms/BuildMakerCommunity',
    speakersZh: 'David Abu（Microsoft · Copilot Studio、Power Platform 与 Dynamics 365 全球社区负责人）',
    speakersEn: 'David Abu (Microsoft · Global Community Lead for Copilot Studio, Power Platform & Dynamics 365)'
  };

  var CHAPTERS = [
    {
      id: 'spark-vs-engine',
      time: '00:00:00 – 00:06:22',
      tabZh: '00:00 次周退潮与“火花 vs 引擎”',
      tabEn: '00:00 Week-2 Cliff & Spark vs. Engine',
      titleZh: '破除“单打独斗”与“千人死群”迷思：活动只是火花，社区才是飞轮引擎',
      titleEn: 'Beyond Week-2 Hype: Events Create the Spark, Community Builds the Engine',
      summaryZh: 'David Abu 直指企业推广新工具的通病——首周全员兴奋、第二周采纳率断崖下跌；结合 PG&E、Heineken、新加坡民防部队与 AGCO 等真实客户账本，论证单次活动（Spark）绝不等于可持续社区（Engine）。',
      summaryEn: 'David Abu diagnoses why enterprise rollouts stall after week two: building cool solo agents or hosting a one-off launch event only creates a spark, whereas peer-led community builds the engine behind PG&E, Heineken, SCDF, and AGCO results.',
      bulletsZh: [
        '00:00:54 — “第二周退潮定律”：单靠造出酷炫智能体并群发通知，热度往往撑不过上线后两周',
        '00:03:10 — 商业回报铁证：PG&E 年省约 7,500 万美元与 52.7 万工时；新加坡民防部队不到 5 万美元研发成本撬动约 2,000 万美元方案价值',
        '00:04:35 — 火花 ≠ 社区：Meetup 与黑客松只负责点燃早期热情；AGCO 从约 900 名志愿先锋扩展至约 2,000 名创作者并投产数百个企业级智能体'
      ],
      bulletsEn: [
        '00:00:54 — The Week-2 Adoption Cliff: announcing "I built something cool" never sustains organization-wide usage',
        '00:03:10 — Quantified ROI: PG&E saves ~$75M and ~527K hours/year; SCDF unlocked ~$20M value for under $50K build cost',
        '00:04:35 — Spark != Engine: AGCO scaled ~900 volunteer leaders into ~2,000 makers running several hundred production agents'
      ]
    },
    {
      id: 'foundation-skilling',
      time: '00:06:23 – 00:11:30',
      tabZh: '06:23 目标基石与三阶育人体系',
      tabEn: '06:23 Goal Foundation & 3-Phase Skilling',
      titleZh: '先立业务指标再办活动：从 1 人起步的三阶创作者晋升与“学徒变讲师”',
      titleEn: 'Goals Before Events: Starting Small & Designing Cohorts That Produce Teachers',
      summaryZh: '拆解社区成功路径前两环（Foundation & Training）：反对一上来就拉 2,000 人聊天群，强调先锚定可衡量的业务优先级，按入门、进阶、高阶三阶段培育创作者，并复盘 PG&E（3 人支撑 4,300+ 创作者）与 State Farm 实战。',
      summaryEn: 'Unpacks Foundation and Training: set measurable business goals before scheduling events, start from one person rather than fearing scale, and structure 3-phase skilling as proven by Shell, PG&E, Deutsche Bahn, and State Farm.',
      bulletsZh: [
        '00:07:14 — 目标先于火花：先写清一句话使命与可量化业务指标（如壳牌原定培训 500 人，最终裂变出 4,000+ 活跃 DIY 开发者）',
        '00:08:23 — PG&E 极简杠杆：仅靠 3 人卓越中心（CoE）培训 1,300 名数字创作者，支撑全公司 4,300+ 创作者生态',
        '00:10:49 — State Farm 梯队裂变：150 人负责任 AI 工作坊层层选拔先锋，风险评审后投产 41 项方案，翻译周转从 12 个月缩至 24 小时'
      ],
      bulletsEn: [
        '00:07:14 — Goals precede events: Shell targeted 500 DIY developers and scaled to 4,000+ active makers via clear mission metrics',
        '00:08:23 — PG&E lean leverage: a 3-person CoE trained 1,300 Digital Creators to support 4,300+ makers company-wide',
        '00:10:49 — State Farm cohort ladder: 150-attendee Responsible AI workshops yielded 41 risk-reviewed prod builds (12m -> 24h translation)'
      ]
    },
    {
      id: 'operations-platforms',
      time: '00:11:31 – 00:14:01',
      tabZh: '11:31 先锋答疑与原生协作阵地',
      tabEn: '11:31 Office Hours & Native Platforms',
      titleZh: '如何让热度不掉线：转化“有话语权的质疑者”与严守员工原生工具习惯',
      titleEn: 'Sustaining Momentum: Converting Vocal Skeptics & Meeting Employees Where They Work',
      summaryZh: '聚焦日常运营（Operation）：揭秘如何把最初抵触社区但极具影响力的同事转化为坐镇答疑（Office Hours）的铁杆先锋；复盘采埃孚（ZF Group）20 人服务 3.7 万用户的同侪互助机制，并强调绝不强迫员工跨平台迁移。',
      summaryEn: 'Focuses on daily Operations: recruit vocal skeptics into Office Hours champions, measure the community like a product, replicate ZF Group\'s peer-support leverage, and embed inside Viva Engage, SharePoint, Teams, and Forms.',
      bulletsZh: [
        '00:11:44 — 招募逆向心法：主动争取那些起初喊“没时间”但在团队内有话语权的骨干，一旦认同便是最稳固的答疑先锋',
        '00:12:29 — 采埃孚（ZF Group）同侪杠杆：中央团队仅 20 人，依靠“Citizen Pros”数小时内互助答疑，激活 37,000 名用户与 25,000+ 应用',
        '00:13:29 — 就地取材铁律：员工习惯用 Teams 就绝不强拉去 WhatsApp 或 Telegram；Lumen 从单一 Teams 频道起步长成全企创作者社区'
      ],
      bulletsEn: [
        '00:11:44 — Recruiting secret: win over vocal colleagues who initially push back—they become your most committed Champions',
        '00:12:29 — ZF Group peer scale: 20 central staff + Citizen Pros answering questions in hours support 37,000 active users & 25,000+ apps',
        '00:13:29 — Zero platform friction: never force Teams users onto external chat apps; Lumen grew company-wide from one Teams channel'
      ]
    },
    {
      id: 'partners-recognition',
      time: '00:14:02 – 00:15:57',
      tabZh: '14:02 四维伙伴联盟与荣誉晋升',
      tabEn: '14:02 Partners, Guardrails & Recognition',
      titleZh: '从部门试验到全企运动：IT/数据治理结盟、Heineken 与 Hiscox 护栏放权',
      titleEn: 'From Team Project to Movement: Partner Coalitions, Heineken Scale & Hiscox Guardrails',
      summaryZh: '串联伙伴协同（Partners）与荣誉激励（Recognition）：联合 IT 安全、数据分析、业务单元、高管赞助人与外部 MVP，解读喜力（Heineken）5 人纳管万级环境与 Hiscox 采纳率从 4% 跃升至 74% 的护栏放权之道。',
      summaryEn: 'Connects Partners and Recognition: unite IT/security, data analytics, business units, executive sponsors, and MVPs—illustrated by Heineken\'s 5-person governance of 7,800+ makers and Hiscox\'s 4% to 74% Copilot surge.',
      bulletsZh: [
        '00:14:06 — 四角色伙伴拼图：IT 与安全 + 数据分析守住治理底线，业务部门锚定场景，M365 先锋促活，高管现身站台背书',
        '00:14:35 — 喜力（Heineken）前沿心态：仅 5 名管理员统管 10,000+ 环境，支撑 7,800+ 创作者构建 6,500+ 应用与 36,000+ 自动化',
        '00:15:18 — Hiscox 信任与护栏并重：培训 3,000+ 员工并用 Agent 365 纳管 6,000+ 自建智能体，采纳率从 4% 飙至 74%，人均周省 2–5 小时'
      ],
      bulletsEn: [
        '00:14:06 — Four partner roles: IT/Security & Data (governance), Business units, M365 Champions (engagement), and Executive sponsors',
        '00:14:35 — Heineken Frontier Mindset: 5 admins govern 10,000+ environments for 7,800+ makers, 6,500+ apps, and 36,000+ automations',
        '00:15:18 — Hiscox Citizen AI + Agent 365: 3,000+ trained, ~3,500 staff built 6,000+ governed agents, lifting adoption 4% -> 74% (2–5 hrs/wk saved)'
      ]
    },
    {
      id: 'ninety-day-plan',
      time: '00:15:58 – 00:17:54',
      tabZh: '15:58 90 天冷启动行动路线图',
      tabEn: '15:58 90-Day Starter Roadmap',
      titleZh: '90 天落地四步法：把“办活动”排在第三顺位，从首日即用数据说话',
      titleEn: 'Your 90-Day Starter Plan: Why Steady Events Rank Third—Not First',
      summaryZh: '收束全场方法论为可立即执行的 90 天四步清单：先建 2–3 人核心组与高管赞助人，再孵化能带教的先锋讲师，第三步才按每季度一场的稳态节奏办活动并汇报业务产出，最后依托现有工具持续留存，并发布 Microsoft Learn 官方蓝图。',
      summaryEn: 'Distills the session into a four-step 90-day starter plan—deliberately placing steady quarterly events third behind a 2–3 person core team and teaching Champions—backed by the official Microsoft Learn playbook.',
      bulletsZh: [
        '00:16:03 — 第 1–2 步（组织先行）：任命 2–3 名核心牵头人与 1 位高管赞助人，把每一批学员转化为能开口带教的先锋讲师',
        '00:16:18 — 第 3–4 步（节奏与阵地）：刻意将“稳态活动（每季度一场并汇报业务成果）”放在第三步，依托员工现有协作工具持续运营',
        '00:17:01 — 官方开源手册：David Abu 在 Microsoft Learn 发布完整指南《Build thriving Copilot Studio communities》（aka.ms/BuildMakerCommunity）'
      ],
      bulletsEn: [
        '00:16:03 — Steps 1 & 2: Name 2–3 leads plus an executive sponsor, then turn every learner cohort into teaching Champions',
        '00:16:18 — Steps 3 & 4: Run one steady event per quarter reporting hard outcomes (ranked 3rd, never 1st) inside existing tools',
        '00:17:01 — Full Microsoft Learn guide published at aka.ms/BuildMakerCommunity ("Build thriving Copilot Studio communities")'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr1021Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr1021-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr1021-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr1021-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr1021-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR1021 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR1021 Scaling Copilot Studio Adoption Through Community-Led Agent Building official session cover" loading="lazy" />' +
          '<button type="button" class="thr1021-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr1021-play-pill">' + (en ? '▶ Load Official Video Player (18 min)' : '▶ 点击加载官方内嵌点播流（18 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr1021-theater-layout">',
        '  <div class="thr1021-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr1021-meta">',
        '    <span class="thr1021-code">THR1021 · ' + item.time + '</span>',
        '    <h4 class="thr1021-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr1021-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr1021-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr1021-highlights">' + liHtml + '</ul>',
        '    <div class="thr1021-actions">',
        '      <a class="thr1021-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr1021-btn" href="' + SESSION_META.learnUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Microsoft Learn Playbook' : '↗ Microsoft Learn 社区指南') + '</a>',
        '      <a class="thr1021-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR1021 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr1021Theater);
  } else {
    initThr1021Theater();
  }
})();

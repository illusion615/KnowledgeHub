/* posts/ignite-2026-live149-behind-curtain-building-copilot-studio/live149-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-live149-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/2c5e35c0-7c4b-4907-bf96-2e47d2c8580d',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1793675965297001onQI-AAAAAAAAAAAAAAAAAAAA',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/2c5e35c0-7c4b-4907-bf96-2e47d2c8580d',
    speakersZh: 'Ryan Cunningham（Copilot Studio & Power Platform 企业副总裁）· Lauren Soni（产品与技术高级副总裁）',
    speakersEn: 'Ryan Cunningham (CVP, Copilot Studio & Power Platform) · Lauren Soni (SVP, Product & Technology)'
  };

  var CHAPTERS = [
    {
      id: 'factory',
      time: '00:00:10 – 00:01:45',
      tabZh: '00:10 自举软件工厂',
      tabEn: '00:10 Software Factory',
      titleZh: '告别一年前的旧研发模式：数十个各司其职的智能体运行在 Copilot Studio 之上',
      titleEn: 'Zero Resemblance to a Year Ago: Dozens of Agents Running on Copilot Studio Itself',
      summaryZh: 'Lauren Soni 与 Ryan Cunningham 开场揭示核心转变：团队搭建了一座由数十个智能体、自动化与工作流组成的软件工厂，越来越多的构建系统直接自举运行在 Copilot Studio 本身之上。',
      summaryEn: 'Ryan Cunningham explains how producing Copilot Studio today bears almost no resemblance to a year ago: teams of dozens of agents monitor telemetry, listen to feedback, code improvements, and validate builds right on Copilot Studio.',
      bulletsZh: [
        '00:00:55 — 当前构建 Copilot Studio 的工程流程与一年前同期相比已几乎找不到相似之处',
        '00:01:06 — 打造由智能体、自动化与工作流协同组成的“软件工厂（Software Factory）”，大量环节直接跑在 Copilot Studio 上',
        '00:01:23 — 数十个智能体各自拥有明确岗位：监控遥测、倾听反馈、编写改进代码并验证交付质量'
      ],
      bulletsEn: [
        '00:00:55 — How the team builds the product bears very little resemblance to just one year earlier',
        '00:01:06 — Operates an agentic software factory whose own workflows increasingly run on Copilot Studio itself',
        '00:01:23 — Dozens of role-scoped agents monitor telemetry, listen for feedback, code fixes, and validate changes'
      ]
    },
    {
      id: 'roles',
      time: '00:01:46 – 00:02:49',
      tabZh: '01:46 角色重塑与设计师 PR',
      tabEn: '01:46 Designer PRs (>50%)',
      titleZh: '当“写代码最慢最难”不再成立：超半数设计师直接提交并合入生产 PR',
      titleEn: 'When Writing Code Is No Longer the Bottleneck: Over Half of Designers Merge PRs',
      summaryZh: '过去的软件规划默认编码最耗时，迫使团队花数周做焦点小组与静态平面稿；如今团队跳过漫长排期直接上手实现并推入早期用户环，超过一半的设计师已提交并合入生产拉取请求。',
      summaryEn: 'Legacy planning assumed writing code was the slow, hard bottleneck. Freed from weeks of focus groups and flat-file mockups, over half of Copilot Studio designers have submitted pull requests merged into production.',
      bulletsZh: [
        '00:01:54 — 彻底推翻“写代码是最慢最难环节”的旧规划前提，释放全新的创造力空间',
        '00:02:10 — 免去数周焦点小组与平面设计图排期，直接编码试穿、推送早期用户环实测后再加固入主干',
        '00:02:32 — 超过 50% 的 Copilot Studio 设计师亲手提交了代码拉取请求（PR），大批改动已合入生产环境'
      ],
      bulletsEn: [
        '00:01:54 — Dismantles creative and planning processes built around coding being the slowest phase',
        '00:02:10 — Replaces weeks of scheduling and flat-file design with immediate implementation and early-ring testing',
        '00:02:32 — More than half of Copilot Studio designers have submitted PRs, with many merged into production'
      ]
    },
    {
      id: 'linkedin',
      time: '00:02:50 – 00:03:40',
      tabZh: '02:50 24 小时夜间修复闭环',
      tabEn: '02:50 24-Hour Fix Loop',
      titleZh: '真实用户进入创新内环：从 LinkedIn 抱怨视频到次晨合入仅需 24 小时',
      titleEn: 'Customers Inside the Loop: From Frustrated LinkedIn Video to Merged Fix in 24 Hours',
      summaryZh: '一位受挫用户在 LinkedIn 发布长文与操作录屏反映痛点，智能体当晚自动拾取、复现确认真实缺陷并写好修复代码，经人工把关次晨合并，24 小时内即回访告知补丁正发往其环境。',
      summaryEn: 'After a frustrated user posted a detailed LinkedIn video, an agent picked it up overnight, verified the bug, and coded the fix; with human-in-the-loop review it merged by morning, closing the loop in 24 hours.',
      bulletsZh: [
        '00:02:59 — 一名用户在 Copilot Studio 卡壳受挫，在 LinkedIn 发布了长篇吐槽与详细复现录屏',
        '00:03:13 — 智能体当晚拾取线索、独立核验问题属实并完成代码修复，保留人在回路（Human in the Loop）于次晨合入',
        '00:03:23 — 24 小时内主动回访该用户：“感谢反馈，问题已修复并正在推往你的环境”'
      ],
      bulletsEn: [
        '00:02:59 — A frustrated maker posted a detailed LinkedIn write-up and video when stuck in Copilot Studio',
        '00:03:13 — An agent picked it up that night, validated the issue, and coded the fix for human-in-the-loop morning merge',
        '00:03:23 — Team replied within 24 hours confirming the fix was already merged and rolling out to their environment'
      ]
    },
    {
      id: 'hillclimb',
      time: '00:03:41 – 00:05:47',
      tabZh: '03:41 转型爬坡与工作 OS',
      tabEn: '03:41 Hill-Climbing & Work OS',
      titleZh: '给研发高管的建议：先下水试游，重设约束指标，打造工作操作系统',
      titleEn: 'Advice for Tech Leaders: Get in the Pool, Reset Constraints, Build the Work OS',
      summaryZh: 'AI 转型绝非上线聊天机器人或消耗词元额度，而是重设约束与野心——例如核心能力翻倍、测试预算减半但覆盖翻倍；Copilot 底层正抽象为跨软件、财务与政务的工作操作系统。',
      summaryEn: 'AI transformation is not deploying a chatbot or burning a token meter—it means resetting constraints (like halving test budget while doubling coverage) and using Copilot as an operating system for work.',
      bulletsZh: [
        '00:04:19 — 不要站在岸边刷动态等待完美方案，“不下水打湿自己永远学不会游泳”',
        '00:04:42 — 设定具体爬坡目标：核心业务做好 2 倍、削减测试预算同时将测试覆盖率翻倍、大幅缩短客户价值实现时间',
        '00:05:27 — 将同源抽象底座沉淀为“工作操作系统（Operating System for Work）”，赋能软件、财务部门与政府服务'
      ],
      bulletsEn: [
        '00:04:19 — Start before it is perfect: you cannot learn to swim without getting wet',
        '00:04:42 — Define concrete hill-climbing goals: 2x core performance, cut test budget while 2x test coverage',
        '00:05:27 — Exposes the abstract platform beneath Copilot as an operating system for work across finance and government'
      ]
    },
    {
      id: 'markel',
      time: '00:05:48 – 00:07:39',
      tabZh: '05:48 Markel 航运险 3 倍提速',
      tabEn: '05:48 Markel Marine (3x+ Speed)',
      titleZh: '特种保险商 Markel 实战：不足 18 小时交期内将高危航线核保决策提速 3 倍以上',
      titleEn: 'Markel Marine Insurance Case: 3x+ Faster Voyage Underwriting Inside an 18-Hour Window',
      summaryZh: '特种保险公司 Markel 的海事保险部门为穿越全球最危险水域的货轮承保，常在不足 18 小时窗口内评估复杂风险与价值；借助 Copilot Studio 将高质量决策速度提升至 3 倍以上，并揭示改写后台低效系统的下一波前沿。',
      summaryEn: 'Specialty insurer Markel insures cargo vessels sailing dangerous waters—often with under 18 hours of lead time—and used Copilot Studio to triple or more its velocity to sound underwriting decisions.',
      bulletsZh: [
        '00:06:01 — 特种保险商 Markel 海事部门承保穿越全球高危水域的货轮航次，常面临不足 18 小时的极限评估窗口',
        '00:06:26 — 依托 Copilot Studio 将高质量风险与价值决策速度提升至 3 倍以上（客户获批清晰度快 3 倍、核心业务吞吐扩容 3 倍）',
        '00:07:09 — 终章洞见：第一阶段 AI 提升了旧低效系统之上个人的日常效率，下一前沿是直接改造报表与看板背后的核心业务系统'
      ],
      bulletsEn: [
        '00:06:01 — Markel\'s marine division underwrites cargo ships entering dangerous waters with <18 hours of lead time',
        '00:06:26 — Tripled or more (3x+) velocity to sound decisions—delivering 3x faster customer clarity and 3x core capacity',
        '00:07:09 — Next frontier: moving beyond personal productivity on top of inefficient systems to re-architect the systems themselves'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLive149Theater() {
    var controls = document.querySelector('[data-sandbox-controls="live149-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="live149-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'live149-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'live149-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVE149 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVE149 Behind the Curtain: Building Copilot Studio official session cover" loading="lazy" />' +
          '<button type="button" class="live149-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="live149-play-pill">' + (en ? '▶ Load Official Broadcast Stream (7m 40s)' : '▶ 点击加载官方演播室点播流（7 分 40 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="live149-theater-layout">',
        '  <div class="live149-player-wrap">' + mediaInner + '</div>',
        '  <div class="live149-meta">',
        '    <span class="live149-code">LIVE149 · ' + item.time + '</span>',
        '    <h4 class="live149-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="live149-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="live149-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="live149-highlights">' + liHtml + '</ul>',
        '    <div class="live149-actions">',
        '      <a class="live149-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="live149-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official HD MP4' : '⬇ 官方高清 MP4 直链') + '</a>',
        '      <a class="live149-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVE149 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLive149Theater);
  } else {
    initLive149Theater();
  }
})();

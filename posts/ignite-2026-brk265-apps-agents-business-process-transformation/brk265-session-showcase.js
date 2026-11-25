/* posts/ignite-2026-brk265-apps-agents-business-process-transformation/brk265-session-showcase.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/brk265-session-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/8d0d9425-456a-4e32-95df-ad46ce72395a',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856613341001ExL3-1791588120437001CBBg',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/8d0d9425-456a-4e32-95df-ad46ce72395a',
    speakersZh: 'Ashvini Sharma（Copilot Studio 产品合伙人总监） · Clay Wesener（Copilot 托管运行时总经理）',
    speakersEn: 'Ashvini Sharma (Partner Director of Product, Copilot Studio) · Clay Wesener (GM, Apps - Copilot Managed Runtime)'
  };

  var CHAPTERS = [
    {
      id: 'ch1',
      tabZh: '00:00 战略与底座',
      tabEn: '00:00 Framing & Harness',
      code: 'BRK265 · Part 01 (00:00 – 12:30)',
      titleZh: 'AI 转型的三层坐标与 Microsoft Copilot Harness 容器底座',
      titleEn: 'Three Ways of AI Transformation & Containerized Copilot Harness',
      summaryZh: '厘清个人提效（Copilot + Cowork）、多人跨部门流程（Copilot Studio）与云原生智能开发底座（Foundry + Agent 365）的边界，并披露同一 Sonnet 4.6 模型下新内核代码分析涨 47.5 个百分点、输入词元降 45% 的实测机理。',
      summaryEn: 'Frames personal productivity (Copilot + Cowork), multiplayer business processes (Copilot Studio), and PaaS AI (Foundry + Agent 365), detailing how the sandboxed Copilot Harness lifts code analysis by 47.5 pts while cutting input tokens by 45% on Sonnet 4.6.',
      bulletsZh: [
        '00:01:20 — 三层选型标尺：单人日常协同归 Copilot，多人单实例业务流程归 Copilot Studio',
        '00:05:55 — 纠偏超长提示词反模式：拒绝把 20 个工具和 50 份文档硬塞进数页死板指令',
        '00:07:45 — 同模型对照基准：长文档跨页（第 54 页与第 350 页）循环深挖与本地落盘写脚本算账'
      ],
      bulletsEn: [
        '00:01:20 — Portfolio Framing: Individual work in Copilot vs. multiplayer process instances in Studio',
        '00:05:55 — Anti-Pattern Fix: Stop stuffing 20 tools and 50 docs into multi-page rigid agent prompts',
        '00:07:45 — Harness Benchmark: Multi-turn deep doc retrieval (pages 54 & 350) and local disk code execution'
      ]
    },
    {
      id: 'ch2',
      tabZh: '12:35 智能体与工作流实机',
      tabEn: '12:35 Agent & Workflow Demo',
      code: 'BRK265 · Part 02 (12:35 – 25:05)',
      titleZh: 'Zava 新员工入职实机演示：持久记忆智能体、共享邮箱分类流与 Cowork 共创',
      titleEn: 'Live Zava Onboarding Demo: Memory Agent, Mailbox Triage Flow & Cowork Build',
      summaryZh: '现场拆解 Zava 入职伙伴智能体（自动识别 11 月 26 日感恩节顺延报到、拦截无线密码请求、按技能生成首周 Word 计划），演示共享邮箱六分支确定性分类工作流，并回放周五起在 Cowork 中用自然语言迭代生成整套资产的真实提示词。',
      summaryEn: 'Walks through the Zava Onboarding Buddy agent (catching Nov 26 Thanksgiving start dates, blocking Wi-Fi password leaks, generating Word week-one plans via skills), a 6-branch shared-mailbox triage workflow, and the multi-day Cowork authoring prompt.',
      bulletsZh: [
        '00:14:55 — 边界护栏与技能复用：识别感恩节假期改期周一，拒答敏感密码并生成首周文档',
        '00:17:20 — 共享邮箱确定性分流：分类入职确认、福利咨询、移民敏感件与供应商垃圾推销',
        '00:20:35 — 协作脉络与习惯记忆：推荐团队成员做导师，记住经理 12:00–13:00 个人午餐占位可约'
      ],
      bulletsEn: [
        '00:14:55 — Guardrails & Skills: Catches Thanksgiving start date, blocks Wi-Fi leaks, generates Word plan',
        '00:17:20 — Shared Mailbox Workflow: Routes hire confirmations, benefits, sensitive HR, and vendor spam',
        '00:20:35 — Work IQ & Memory: Picks team buddies and remembers solo 12–1 PM OOO lunch blocks are bookable'
      ]
    },
    {
      id: 'ch3',
      tabZh: '25:10 托管应用与无断层开发',
      tabEn: '25:10 Managed Apps & Git',
      code: 'BRK265 · Part 03 (25:10 – 40:50)',
      titleZh: 'Copilot 托管运行时正式商用：动态智能体应用、对话地图微件与后台 Git 仓库',
      titleEn: 'Copilot Managed Runtime GA: Agentic Apps, In-Chat Map UI & Auto Git Repos',
      summaryZh: '展示 11 月 17 日正式商用的托管运行时与应用磁贴：一键生成 Dataverse、SharePoint 或 Fabric Rayfin 数据库表结构，在 Zava 入职看板内把门禁延期等任务直接指派给行内生成的后台智能体，并由后台自动托管 Git 源码仓库消除低代码断层。',
      summaryEn: 'Showcases the Nov 17 GA of Copilot Managed Runtime and Apps: auto-creating schemas across Dataverse, SharePoint, and Fabric Rayfin, delegating Zava board tasks to an inline-built agent, and spinning up background Git repos with zero low-code cliffs.',
      bulletsZh: [
        '00:28:15 — 高留存应用秘诀：引用真实会议、幻灯片与插件演进构建，超越空白单句提示词',
        '00:31:05 — 双向交互融合：西雅图理赔热力图微件（$5,402 高出区域中位数 64%）嵌入群聊',
        '00:34:10 — Zava 智能体应用与后台 Git：行内生成入职智能体接管任务，专业开发者随时拉取代码'
      ],
      bulletsEn: [
        '00:28:15 — What Makes Apps Stick: Grounding on live meetings, decks, and Figma plugins beats blank prompts',
        '00:31:05 — Bidirectional UI: Regional Seattle claim map ($5,402, +64% vs. median) rendered inside Teams chat',
        '00:34:10 — Agentic App & Git: Inline-created onboarding agent takes over tasks while Git backs full source code'
      ]
    },
    {
      id: 'ch4',
      tabZh: '37:10 全域治理与成本管控',
      tabEn: '37:10 Admin & FinOps',
      code: 'BRK265 · Part 04 (37:10 – 44:30)',
      titleZh: '首日即受控：管理中心全域应用盘点、上线前多维评测与额度隔离',
      titleEn: 'Governed from Day One: M365 Admin Inventory, Pre-Publish Evals & Credit Caps',
      summaryZh: '无论创作者从终端命令行、Cowork 还是 Studio 起步，管理员均可在单一管理中心透视全部托管应用、收紧 1,500+ 连接器组合策略，配合内置评测器、级联额度上限与一键隔离守住企业安全及预算红线。',
      summaryEn: 'Whether built from CLI, Cowork, or Studio, every app surfaces in Microsoft 365 admin center with policy controls over 1,500+ connectors, paired with pre-publish graders, cascading credit caps, and instant quarantine.',
      bulletsZh: [
        '00:37:15 — 单一治理平面：全量盘点组织托管应用，统一管控环境路由、连接器白名单与外部分享',
        '00:41:45 — 发布前质量门禁：内置评分器与安全测试验证输出质量，预检面板拦截带病上线',
        '00:42:20 — 精细化成本账本：按智能体、用户与环境设定点数上限，异常超支或违规支持一键隔离'
      ],
      bulletsEn: [
        '00:37:15 — Single Control Plane: Track every app across CLI, Cowork, and Studio with connector policies',
        '00:41:45 — Evaluate Before Publish: Built-in graders and safety tests verify quality and flag blockers',
        '00:42:20 — FinOps & Quarantine: Enforce credit caps per agent, user, and environment with instant isolation'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk265Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk265-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk265-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk265-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk265-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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

      var visualInner = playerLoaded
        ? '<iframe class="brk265-theater-iframe" src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK265 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRK265 Session Poster" loading="lazy" />',
            '<div class="brk265-poster-overlay">',
            '  <button type="button" class="brk265-play-trigger" data-brk265-load-video="1">' + (en ? '▶ Load Official Medius Stream In-Page' : '▶ 页内加载微软官方点播流（45 分钟实录）') + '</button>',
            '  <div class="brk265-poster-caption">' + (en ? 'Click to mount the official Medius player on demand, or open the session page / PPTX deck on the right.' : '按需挂载微软官方 Medius 点播播放器，亦可直接通过右侧按钮在新标签页打开视频或下载原版课件。') + '</div>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk265-theater-layout">',
        '  <div class="brk265-theater-visual">',
        visualInner,
        '  </div>',
        '  <div class="brk265-theater-meta">',
        '    <span class="brk265-theater-code">' + item.code + '</span>',
        '    <h4 class="brk265-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk265-theater-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk265-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk265-theater-chapters">' + liHtml + '</ul>',
        '    <div class="brk265-theater-actions">',
        '      <a class="brk265-theater-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Official Video Stream' : '▶ 新窗口打开官方点播视频') + '</a>',
        '      <a class="brk265-theater-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Download Official PPTX' : '⬇ 下载 BRK265 官方课件') + '</a>',
        '      <a class="brk265-theater-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK265 Session Page' : '↗ 访问 Ignite 官方议题页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-brk265-load-video]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
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
    document.addEventListener('DOMContentLoaded', initBrk265Theater);
  } else {
    initBrk265Theater();
  }
})();

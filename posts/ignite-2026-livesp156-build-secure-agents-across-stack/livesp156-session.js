/* posts/ignite-2026-livesp156-build-secure-agents-across-stack/livesp156-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-livesp156-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/5e6a1af0-3acb-48e2-b4cf-86cf12dd3a6f',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787855009112001tM9c-AAAAAAAAAAAAAAAAAAAA',
    speakersZh: 'Rafsan Huseynov（SHI 智能体 AI 与数字工作场所经理）· Matthew Devaney（SHI 资深解决方案工程师、七届微软 MVP）',
    speakersEn: 'Rafsan Huseynov (Manager, Agentic AI & Digital Workplace, SHI) · Matthew Devaney (Senior Solutions Engineer & 7x Microsoft MVP, SHI)'
  };

  var CHAPTERS = [
    {
      id: 'shadow-ai',
      time: '00:00:10 – 00:02:02',
      tabZh: '00:10 影子 AI 的高危裂变',
      tabEn: '00:10 Shadow AI Escalation',
      titleZh: '第一章：从静态影子 IT 到动态影子 AI——当推理与工具调用越过可见边界',
      titleEn: 'Chapter 1: From Classic Shadow IT to Shadow AI—When Reasoning and Tool Calls Escape Visibility',
      summaryZh: 'Rafsan Huseynov 与七届微软 MVP Matthew Devaney 在 Ignite Hub 演播室直击企业痛点：智能体早已在组织内悄然运行，因其具备自主推理与工具调用能力，失管后的破坏半径远超传统影子应用。',
      summaryEn: 'Live from the Ignite Hub, Rafsan Huseynov and 7x MVP Matthew Devaney diagnose why ungoverned agents pose far greater operational risk than static legacy shadow IT applications and data stores.',
      bulletsZh: [
        '00:00:49 — 企业环境中早已有大量智能体在运转；若查不清归属人、可执行动作与数据边界，智能体即沦为新一代影子 IT',
        '00:01:22 — 传统影子 IT 仅限于静态应用与孤立数据表，而影子 AI 涵盖一切 IT 部门看不见的推理体',
        '00:01:34 — 智能体具备自主推理（Reasoning）与外部工具调用（Tool Calling）能力，行动半径与越权风险呈指数放大'
      ],
      bulletsEn: [
        '00:00:49 — Agents already operate across enterprise estates; without owner, action, and data visibility, they become new shadow IT',
        '00:01:22 — Classic shadow IT involved static apps and data stores; shadow AI spans unseen autonomous workloads',
        '00:01:34 — Because agents combine reasoning with tool invocation, they reach much further and carry higher risk'
      ]
    },
    {
      id: 'entra-badge',
      time: '00:02:03 – 00:04:18',
      tabZh: '02:03 数字门禁卡与生命周期',
      tabEn: '02:03 Entra Badge & Lifecycle',
      titleZh: '第二章：拒绝拟人化噱头——用 Entra 安全门禁卡、时限访问包与离职继承锁死权限',
      titleEn: 'Chapter 2: Digital Security Badges—Entra Agent Identity, Access Packages, and Leaver Inheritance',
      summaryZh: '澄清“赋予智能体身份”绝非拟人化取名，而是像给外部承包商发放门禁胸牌一样分配 Microsoft Entra ID，将条件访问、按月续期的最小权限访问包与员工离职自动交接工作流原生下放给智能体。',
      summaryEn: 'Clarifies that agent identity is not anthropomorphism, but an Entra ID security badge enabling Conditional Access, time-bound Access Packages, and automated manager inheritance when an agent owner leaves.',
      bulletsZh: [
        '00:02:07 — 区分动作究竟由人类发起还是智能体代劳的前提，是为每个智能体签发独立身份并收敛访问边界',
        '00:02:55 — 承包商门禁卡类比：胸牌绑定角色与房间准入权限，映射至 API 权限与 Entra 角色，无权房间一律拦截',
        '00:03:41 — 落地条件访问、月度时限访问包（期满需主管审批续签）与生命周期工作流（创建者离职后由直属经理自动继承）'
      ],
      bulletsEn: [
        '00:02:07 — Scoping security controls to distinct agent identities separates agent-initiated actions from human user actions',
        '00:02:55 — Contractor badge analogy: maps room clearance directly to API scopes, tool permissions, and Entra roles',
        '00:03:41 — Enforces Conditional Access, 1-month Access Packages (no set-and-forget), and manager inheritance on owner departure'
      ]
    },
    {
      id: 'control-plane',
      time: '00:04:19 – 00:05:14',
      tabZh: '04:19 Agent 365 四合一防线',
      tabEn: '04:19 Agent 365 & Zero-New-Tool Stack',
      titleZh: '第三章：无需重学一套新工具——Agent 365 统合 Purview、Defender 与 Entra',
      titleEn: 'Chapter 3: Zero New Tooling Tax—Agent 365 Unifying Purview, Defender, and Entra',
      summaryZh: '围绕“治理是为了加速创新而非踩刹车”的理念，拆解如何以 Microsoft Agent 365 为中央控制面，直接复用企业现成的 Purview 数据保护、Defender 威胁监控与 Entra 身份治理体系。',
      summaryEn: 'Demonstrates how Microsoft Agent 365 acts as the central control plane while reusing existing employee governance investments across Purview, Defender, and Entra without slowing builders down.',
      bulletsZh: [
        '00:04:20 — Microsoft Agent 365 充当智能体中央控制面，沿用治理人类员工的成熟范式纳管数字劳动力',
        '00:04:31 — 三剑客各司其职：Purview 保护数据资产，Defender 实施威胁防护与活动监控，Entra 统管身份准入',
        '00:04:47 — 安全护栏的使命是让业务与研发继续放手构建，同时让安全团队无需重新学习陌生工具即可掌控风险'
      ],
      bulletsEn: [
        '00:04:20 — Microsoft Agent 365 serves as the central control plane mirroring human workforce governance',
        '00:04:31 — Purview protects data, Defender monitors runtime activity and threats, and Entra governs agent identities',
        '00:04:47 — Lets makers keep building at full speed without forcing IT teams to learn a brand-new security stack'
      ]
    },
    {
      id: 'shi-onboarding',
      time: '00:05:15 – 00:06:14',
      tabZh: '05:15 跨双轨盘点与调用遥测',
      tabEn: '05:15 Dual-Track Inventory & Telemetry',
      titleZh: '第四章：SHI 客户实战方法论——统揽业务低代码与专业代码资产及全链路遥测',
      titleEn: 'Chapter 4: SHI Enterprise Onboarding—Centralizing Business & Pro-Code Inventory and Telemetry',
      summaryZh: '复盘 SHI 协助众多企业落地 Agent 365 的一线经验：打通 Copilot Studio 业务创作者与 Microsoft Foundry 专业开发者双轨鸿沟，建立集中式资产清册与动作、数据、工具三级遥测闭环。',
      summaryEn: 'Recaps SHI field engagements onboarding enterprises onto Agent 365—bridging Copilot Studio business makers and pro-code developers through centralized inventory and deep runtime telemetry.',
      bulletsZh: [
        '00:05:18 — 企业内部同时存在业务用户（Copilot Studio）与专业代码开发者（Foundry），亟需统一的跨栈治理底座',
        '00:05:35 — 通过 Agent 365 汇总全量智能体资产清单，实时采集智能体正在执行什么动作、读取什么数据、调用哪些工具',
        '00:05:53 — 金句收官：“你无法监控、也无法治理你看不见的东西（You cannot monitor and govern what you cannot see）”'
      ],
      bulletsEn: [
        '00:05:18 — Enterprises run dual tracks—business users in Copilot Studio alongside pro-code developers in Foundry',
        '00:05:35 — Centralizes all-agent inventory plus live telemetry on actions taken, data accessed, and tools invoked',
        '00:05:53 — Closing maxim: "You cannot monitor and you cannot govern what you cannot see"'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLivesp156Theater() {
    var controls = document.querySelector('[data-sandbox-controls="livesp156-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="livesp156-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'livesp156-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'livesp156-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVESP156 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVESP156 Build secure agents across the Microsoft stack official session cover" loading="lazy" />' +
          '<button type="button" class="livesp156-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="livesp156-play-pill">' + (en ? '▶ Load Official Video Player (6 min 14 s)' : '▶ 点击加载官方内嵌点播流（6 分 14 秒实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="livesp156-theater-layout">',
        '  <div class="livesp156-player-wrap">' + mediaInner + '</div>',
        '  <div class="livesp156-meta">',
        '    <span class="livesp156-code">LIVESP156 · ' + item.time + '</span>',
        '    <h4 class="livesp156-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="livesp156-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="livesp156-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="livesp156-highlights">' + liHtml + '</ul>',
        '    <div class="livesp156-actions">',
        '      <a class="livesp156-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="livesp156-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVESP156 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLivesp156Theater);
  } else {
    initLivesp156Theater();
  }
})();

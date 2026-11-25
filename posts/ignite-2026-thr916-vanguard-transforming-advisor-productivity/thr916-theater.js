/* posts/ignite-2026-thr916-vanguard-transforming-advisor-productivity/thr916-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr916-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/f9b6bdc6-9792-4683-bf6e-170588fbf6b1',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856584719001EqrK-1791588293549001CGwG',
    fabricUrl: 'https://learn.microsoft.com/en-us/fabric/',
    speakersZh: 'Sangeeta Iyer（Microsoft 前线部署工程经理 · FDE Manager）· Chris Zahner（Vanguard FAS 技术工具负责人）',
    speakersEn: 'Sangeeta Iyer (Forward Deployed Engineering Manager, Microsoft) · Chris Zahner (FAS Sales Technology Lead, Vanguard)'
  };

  var CHAPTERS = [
    {
      id: 'problem',
      time: '00:00:41 – 00:04:49',
      tabZh: '00:41 碎片化栈与 40+ 技能库',
      tabEn: '00:41 Fragmented Stack & 40+ Skills',
      titleZh: '从“人类充当集成层”到可读写记录系统的 40+ 项业务技能库',
      titleEn: 'From Human Integration Layer to 40+ Read/Write Business Skills',
      summaryZh: 'Chris Zahner 拆解 Vanguard 财务顾问服务部（FAS）B2B2C 业务痛点：全美数百名销售代表服务约 300,000 名外部理财顾问，过去准备一次纽约出差需手工横跨 Dynamics、Outlook、Teams、FAS 360 多云数据湖与 Power BI 拼凑线索；团队将高频提问拆解为子提示词，构建超过 40 项可读写的业务技能库。',
      summaryEn: 'Chris Zahner outlines Vanguard FAS scale—several hundred sales executives serving 300,000 financial advisors—where humans previously stitched Dynamics, Outlook, Teams, FAS 360, and Power BI together manually, before building a library of 40+ read/write skills.',
      bulletsZh: [
        '00:00:49 — 披露业务体量：FAS 数百名销售人员覆盖全美曼哈顿高楼至中部单人工作室共约 300,000 名理财顾问',
        '00:02:08 — 指出旧态瓶颈：Dynamics CRM、邮件聊天、FAS 360 多云数据湖与报表割裂，“人类被迫充当系统集成层”',
        '00:04:16 — 将“纽约出差该见谁”等复合简问拆解为子提示词，沉淀超过 40 项既能读取分析又能回写核心系统的技能库'
      ],
      bulletsEn: [
        '00:00:49 — Frames FAS B2B2C reach: hundreds of sales executives supporting ~300,000 external financial advisors nationwide',
        '00:02:08 — Diagnoses stack fragmentation across Dynamics, Outlook, Teams, FAS 360 multi-cloud lake, and BI where humans acted as the glue',
        '00:04:16 — Decomposes shorthand trip asks into subprompts backed by a library of 40+ read/write business skills'
      ]
    },
    {
      id: 'walkthrough',
      time: '00:04:50 – 00:10:02',
      tabZh: '04:50 实机闭环：纽约行程与简报',
      tabEn: '04:50 Live Demo: NYC Sweep & Brief',
      titleZh: 'Westbrook 静默预警、纽约三机构顺路排程与 $20M 商机重定级',
      titleEn: 'Westbrook Staleness Alert, NYC Route Sweep & $20M Opportunity Brief',
      summaryZh: '实机演练完整周一晨间工作流：Sales Agent 跨 Dynamics、Work IQ 与 Fabric IQ 识别线索分高达 88 但已静默 18 天的 Westbrook；自动筛选纽约同城具备在途推荐的 Corvane、Pellward 与 Tilwick 并剔除近期刚见面的机构；针对 $20M 超期商机与 $1.2B 丢单历史生成致 Morgan Bell 的沟通草稿与 CRM 跟进单供人审。',
      summaryEn: 'Walks through Monday triage: surfacing Westbrook (lead score 88, 18 days old) via Fabric IQ, filtering nearby NYC accounts with visible in/out rules into one non-crisscrossing route, and drafting outreach to Morgan Bell for an overdue $20M opportunity.',
      bulletsZh: [
        '00:06:07 — Fabric IQ 调取 FAS 360 信号：精准捕获 Westbrook（线索分 88、已静默 18 天，高于 Brenmoor 82分/3天与 Quillan 79分/11天）',
        '00:07:19 — 透明规则生成纽约名单：保留 Corvane（资金流出）、Pellward（新任 CIO）、Tilwick（跟进逾期），剔除上周刚见的 Larkspan 与无推荐的 Marrowfield 并顺路排程',
        '00:08:51 — 穿透 $20M 超期增长计划与 8 月 $1.2B 丢单记录，锁定策略负责人 Morgan Bell，调取确定性 NBA 起草外发邮件与 CRM 待审跟进'
      ],
      bulletsEn: [
        '00:06:07 — Fabric IQ ranks FAS 360 signals, flagging Westbrook (score 88, 18 days old) as high-value going quiet',
        '00:07:19 — Applies transparent rules: keeps Corvane, Pellward, and Tilwick in one sweep while dropping Larkspan (met last week) and Marrowfield',
        '00:08:51 — Grounds on evidence ($20M overdue deal, $1.2B August loss, unconfirmed buyer) and prepares Morgan Bell outreach for human review'
      ]
    },
    {
      id: 'trust',
      time: '00:10:03 – 00:14:40',
      tabZh: '10:03 三大原则与受监管护栏',
      tabEn: '10:03 Design Principles & Trust',
      titleZh: '三大设计铁律、四道内置信任门禁与共享 Dataverse 双层校验',
      titleEn: 'Three Design Principles, Four Trust Gates & Shared Dataverse Reality',
      summaryZh: 'Sangeeta Iyer 阐明金融受监管环境落地准则：智能主动送达工作流、Vanguard 稳居唯一事实与推荐源、人类始终掌控最终动作；在委托身份鉴权、遇重名歧义暂停追问与写回前弹窗确认之外，深度适配多业务线共享单实例 Dynamics/Dataverse 的前后端双层业务规则。',
      summaryEn: 'Sangeeta Iyer details regulated financial guardrails: intelligence in the flow of work, Vanguard as single source of truth, and human control—enforced via delegated identity, ambiguity pauses, write confirmations, and two-layer rules in a shared Dynamics/Dataverse instance.',
      bulletsZh: [
        '00:11:52 — 确立三大核心原则：智能融入日常流、Vanguard 保持唯一推荐事实源、未获人工批准绝不外发一封邮件或回写一条记录',
        '00:12:42 — 步步内嵌信任：智能体严格继承当前用户的数据与操作权限边界，遇重名客户或重复商机主动暂停核实',
        '00:13:56 — 直面企业级复杂度：Vanguard 多条业务线共享单一 Dynamics/Dataverse 实例，架构同时遵循后端存储与前端展示层双层校验'
      ],
      bulletsEn: [
        '00:11:52 — Establishes three pillars: intelligence in Copilot, Vanguard owns recommendations, and humans approve every outbound email or CRM write',
        '00:12:42 — Enforces delegated user permissions, pauses on duplicate names/opportunities, and requires confirmation dialogs before Dataverse writes',
        '00:13:56 — Respects Vanguard enterprise reality: a single shared multi-LOB Dynamics/Dataverse instance with rules in both data and presentation layers'
      ]
    },
    {
      id: 'architecture',
      time: '00:14:41 – 00:17:35',
      tabZh: '14:41 FDE 驻场与双路 MCP/Fabric 架构',
      tabEn: '14:41 FDE Co-Scrum & Dual-Path Arch',
      titleZh: '前线部署工程驻场联创：Dataverse MCP 技能路与 Fabric IQ 扩展路',
      titleEn: 'Forward Deployed Engineering & Dual-Path Dataverse MCP + Fabric IQ Architecture',
      summaryZh: '揭秘微软前线部署工程（FDE）团队驻场数周与 Vanguard 组成联合敏捷小组并直通微软多产品组的闭环机制，完整拆解架构图：一方 M365 Sales Agent 零管道挂载 Work IQ；上路经 Dataverse MCP Server 调用 Business Skills 连通 CRM；下路经自定义扩展与 Fabric IQ 桥接非微软生态的多云数据湖 FAS 360。',
      summaryEn: 'Unpacks the joint FDE co-scrum model with direct Microsoft product-group feedback loops and the full architecture: first-party M365 Sales Agent with zero-plumbing Work IQ, Business Skills over Dataverse MCP Server, and FAS 360 bridged via Fabric IQ and a custom sales extension.',
      bulletsZh: [
        '00:14:41 — FDE 联合敏捷模式：微软工程师连续数周进驻 Vanguard 办公楼，将一线业务词汇与真实环境阻碍双向反馈至 Fabric、Dynamics 与 Copilot 产品组',
        '00:16:15 — 一方前门与 CRM 路径：M365 Sales Agent 免开发自动接入 Work IQ，通过 Dataverse MCP Server 运行 Business Skills 读写 Dynamics',
        '00:16:58 — 多云信号路径：外部多云数据湖 FAS 360 经 Fabric IQ 与自定义销售扩展汇入同一会话，双路共享身份权限与人审策略'
      ],
      bulletsEn: [
        '00:14:41 — FDE co-scrum embedded on-site for weeks, pairing Vanguard domain rules with direct escalation to Microsoft product groups',
        '00:16:15 — Front door & CRM path: M365 Sales Agent auto-grounds Work IQ and invokes Business Skills via the Dataverse MCP server',
        '00:16:58 — Enterprise-signals path: connects non-Microsoft multi-cloud lake FAS 360 through Fabric IQ and a custom sales extension under unified governance'
      ]
    },
    {
      id: 'impact',
      time: '00:17:36 – 00:22:05',
      tabZh: '17:36 单提示省 40 分钟与演进路线',
      tabEn: '17:36 40-Min Daily Win & Roadmap',
      titleZh: '7 人生产试点实效、单提示词日省 40 分钟与合规内容/自治循环演进',
      titleEn: '7-User Production Pilot, 40 Minutes Saved Daily & Autopilot Roadmap',
      summaryZh: '总结当前 7 名销售代表生产环境实跑成效与未来数月向全员数百人推广计划：单条高频提示词每天即可为一线销售节省 40 分钟检索时间；问答环节澄清通话不录音但通过转写摘要管道沉淀至 CRM 与数据湖；展望深挖数据湖、接入基金合规标准话术库及引入智能体自治循环三大方向。',
      summaryEn: 'Reviews live production pilot results across ~7 sales users ahead of full rollout to hundreds: one prompt saves 40 minutes every single day; Q&A clarifies non-recorded call transcription summarization into CRM and FAS 360; outlines next steps across deeper lake signals, compliance-approved fund content, and agentic autopilot loops.',
      bulletsZh: [
        '00:18:12 — 三大演进路线：深挖多云数据湖更多信号与技能、接入基金持仓合规审批话术库（Compliance-approved content）、探索团队级智能体自治循环',
        '00:19:35 — 量化试点收益：7 名生产试点用户之一实测单条常用提示词每天节省 40 分钟信息搜寻时间，未来数月推广至全部数百名销售人员',
        '00:21:14 — 现场问答揭秘会话智能管道：Vanguard 不直接保存通话录音，而是经转写与摘要流水线写入 CRM 并下沉至数据湖持续反哺 Next Best Action'
      ],
      bulletsEn: [
        '00:18:12 — Three roadmap horizons: deeper data-lake skills, inline compliance-approved fund talking points, and Ignite-announced autopilot loops',
        '00:19:35 — Production pilot ROI: 1 of ~7 live pilot reps saves 40 minutes every single day from a single prompt, ahead of rollout to hundreds of reps',
        '00:21:14 — Q&A detail: calls are not recorded; transcription runs through a summarization pipeline into CRM and down to the lake to enrich NBA'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr916Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr916-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr916-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr916-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[i];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr916-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR916 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR916 How Vanguard is transforming advisor productivity with data and AI official session cover" loading="lazy" />' +
          '<button type="button" class="thr916-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr916-play-pill">' + (en ? '▶ Load Official Video Player (22 min)' : '▶ 点击加载官方内嵌点播流（22 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr916-theater-layout">',
        '  <div class="thr916-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr916-meta">',
        '    <span class="thr916-code">THR916 · ' + item.time + '</span>',
        '    <h4 class="thr916-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr916-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr916-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr916-highlights">' + liHtml + '</ul>',
        '    <div class="thr916-actions">',
        '      <a class="thr916-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr916-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR916 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="thr916-btn" href="' + SESSION_META.fabricUrl + '" target="_blank" rel="noopener">' + (en ? '📘 Microsoft Fabric Docs' : '📘 Microsoft Fabric 官方文档') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr916Theater);
  } else {
    initThr916Theater();
  }
})();

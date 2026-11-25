/* posts/ignite-2026-brk501-partners-unlock-growth-ai-across-apps/brk501-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-brk501-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/e45b2f9e-eae2-4177-8c04-98753141d46b',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856649473001Eo9Q-1791588284843001CGr1',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/e45b2f9e-eae2-4177-8c04-98753141d46b',
    speakersZh: 'Thomas Abel, Ben Jeannot, Paula Nobre Santos（Microsoft）· Marco Amoedo（KPMG）· Jordan O\'Halloran（Velrada）',
    speakersEn: 'Thomas Abel, Ben Jeannot, Paula Nobre Santos (Microsoft) · Marco Amoedo (KPMG) · Jordan O\'Halloran (Velrada)'
  };

  var CHAPTERS = [
    {
      id: 'trinity',
      time: '00:00:06 – 00:10:59',
      tabZh: '00:06 三位一体与新底座',
      tabEn: '00:06 Trinity & Harness',
      titleZh: '组织级业务流程革新：Agents + Workflows + Apps 与 Copilot Harness 跃迁',
      titleEn: 'Org-Owned Business Processes: Agents + Workflows + Apps & Copilot Harness',
      summaryZh: 'Thomas Abel 剖析个人效率（N=1）与组织级流程资产的本质差异，揭晓智能体推理、工作流一致性与微应用结构三位一体架构，以及评测通过率最高涨 22.1 个百分点、净输入成本降 15%–21% 的 Microsoft Copilot Harness。',
      summaryEn: 'Thomas Abel contrasts personal productivity (N=1) with org-owned business processes, detailing the Agents + Workflows + Apps trinity and Microsoft Copilot Harness (+10.8 to +22.1 pts pass rate, -15% to -21% net input cost).',
      bulletsZh: [
        '00:01:30 — 划清边界：个人生产力随员工调动而走，组织级流程资产由团队共享、跨重组留存并追求规模效率',
        '00:03:02 — 三位一体分工：智能体提供推理（化解不确定性），工作流提供确定性低成本执行，微应用提供交互结构',
        '00:07:31 — 内核红利：换用 Microsoft Copilot Harness 带来 10–22 个百分点跃升（约为常规小版本换模收益的 50–100 倍），缓存命中率提升 38.6–48.2 个百分点'
      ],
      bulletsEn: [
        '00:01:30 — Org-owned assets survive reorgs and scale across teams, unlike single-user personal assistants',
        '00:03:02 — Process trinity: Agents provide reasoning, Workflows ensure cheap consistency, Apps add structure',
        '00:07:31 — Harness leap: +10.8/+22.1 pts eval gains (~50–100x an incremental model bump) with +38.6/+48.2 pp cache hits'
      ]
    },
    {
      id: 'demo',
      time: '00:11:00 – 00:20:20',
      tabZh: '11:00 实机演示与专属账号',
      tabEn: '11:00 Live Demo & Accounts',
      titleZh: '实机演示：Cowork $20 生成反馈闭环方案与 Feedback Coordinator 数字员工',
      titleEn: 'Live Demo: $20 Cowork Solution Build & Embodied Feedback Coordinator Account',
      summaryZh: '现场在 Copilot Cowork 加载 Copilot Studio 插件，耗费约 30 分钟与 $20 点数自动生成应用、智能体与工作流；随后为智能体开通专属员工账号（汇报给 Chase），在 Outlook 邮件流内实现边界拦截与 3 客同类数据导出问题去重归并。',
      summaryEn: 'Live in Cowork, the Copilot Studio plugin spends ~30 min and ~$20 in credits to build an app, agent, and workflow; provisioning an Agent Account under Chase enables Outlook @mention triage, org-boundary blocking, and 3-customer deduplication.',
      bulletsZh: [
        '00:12:30 — 单条提示词运行约 30 分钟、消耗约 $20 Copilot Credits，一次性交付 SharePoint 支撑的应用、智能体与工作流',
        '00:14:32 — 细粒度凭据与实体配置：工具调用走智能体独立凭据，外发工作流走 Chase 委托凭据，自动开通 Exchange、OneDrive、SharePoint 与 Teams',
        '00:17:00 — 真实防呆与去重：误点 Reply All 触发跨组织边界自动拦截；重发后智能体识别出已有 3 家客户反馈同一数据导出缺陷并拒绝重复建单'
      ],
      bulletsEn: [
        '00:12:30 — ~30-minute, ~$20 Cowork run outputs a linked SharePoint-backed app, agent, and workflow',
        '00:14:32 — Scoped auth: agent credentials for tools, Chase\'s credentials for outbound workflows, full GAL/M365 provisioning',
        '00:17:00 — Live boundary & dedup proof: blocks external Reply-All leak and links 3 matching data-export reports without duplicating'
      ]
    },
    {
      id: 'economics',
      time: '00:20:21 – 00:27:25',
      tabZh: '20:21 伙伴经济学与逆风破局',
      tabEn: '20:21 Partner Economics',
      titleZh: '81% 降价诉求 vs. 93% 风险共担溢价：从工时压缩走向 ~130 价值池扩容',
      titleEn: '81% Discount Ask vs. 93% Risk-Share Premium: Outweighing Compression to ~130',
      summaryZh: 'Ben Jeannot 解读 Forrester 与麦肯锡最新模型：尽管生产力压缩削减 20–30 点传统实施收入，但叠加现有服务智能化（+10–15）与法定报表、应付账款、托管 AgentOps 等新价值池（+10–30），2028 年伙伴收入基准反升至 ~130，对应 $16.45/用户/月服务空间。',
      summaryEn: 'Ben Jeannot unpacks Forrester and McKinsey benchmarks: despite (20–30) traditional service compression, AI service expansion (+10–15) and new AgentOps value pools (+10–30) lift 2028 partner revenue index from 100 to ~130 ($16.45 PUPM).',
      bulletsZh: [
        '00:21:10 — 买方心理分野：81% 客户要求 AI 交付打折，76% 寻求 18 个月内收益分成，但 93% 愿为共担风险的伙伴支付更高溢价',
        '00:22:00 — 2025→2028 收入瀑布：基准 100 + 市场增长（25–30）− 压缩（20–30）+ 存量升级（10–15）+ 新价值池（10–30）≈ 130',
        '00:24:32 — 2026 Partner TEI 量化回报：每用户每月 $16.45 服务营收潜力，智能体开发增长 +152%，托管服务增长 +125%'
      ],
      bulletsEn: [
        '00:21:10 — Buyer split: 81% ask for AI discounts and 76% want gain-share, yet 93% pay more when partners share risk',
        '00:22:00 — McKinsey 2025→2028 index: 100 + growth (25–30) − compression (20–30) + expansion (10–15) + new pools (10–30) ≈ 130',
        '00:24:32 — 2026 Partner TEI: $16.45 per-user-per-month services opportunity, +152% agent dev growth, +125% managed services'
      ]
    },
    {
      id: 'gtm',
      time: '00:27:26 – 00:31:20',
      tabZh: '27:26 Frontier 加速与 ASPX',
      tabEn: '27:26 Frontier & ASPX GTM',
      titleZh: 'FY27 联合拓客引擎：Frontier Accelerate 激励、ASPX 遥测看板与 AI FinOps',
      titleEn: 'FY27 Partner GTM: Frontier Accelerate MCI, ASPX Telemetry & AI FinOps',
      summaryZh: '详解售前立项（Envisioning & PoC）与售后双部署加速器，演示如何借助 ASPX 看板识别仅 50% 激活的存量客户并联动微软销售推进增购，同时通过四阶认证路径（PL-900 至 AB-100）与三层 AI FinOps 锁死预算护栏。',
      summaryEn: 'Covers pre/post-sales Frontier Accelerate engagements, ASPX seat-adoption and propensity telemetry for co-selling with Microsoft field teams, updated PL/AB role certifications, and three-pillar AI FinOps.',
      bulletsZh: [
        '00:28:02 — Frontier Accelerate（MCI）：覆盖售前 1:1 场景验证与售后 M365 Copilot / Agent Solution 规模化部署加速',
        '00:28:40 — ASPX 合作伙伴看板：透视客户许可证月活率（如 1,000 席位仅激活 50%）、点数消耗与加购倾向指标，现已扩展至 Power Platform 与 Copilot Studio',
        '00:29:55 — 技能与案例闭环：更新 L100–L400 角色认证（含 AB-410/AB-620/AB-100），披露阿布扎比第一银行提速 40%、荷兰市政厅缩减 24% 排队等四大伙伴标杆'
      ],
      bulletsEn: [
        '00:28:02 — Frontier Accelerate (MCI): funds 1:1 Envisioning & PoC plus post-sales Copilot and Agent Solution Accelerators',
        '00:28:40 — ASPX dashboard: exposes MAU gaps (e.g., 50% of 1,000 seats active), consumption, and propensity across Studio & Power Platform',
        '00:29:55 — Role skilling & proof: updated PL-900 to AB-100 certifications alongside FAB (-40% request time) and Dutch municipality (-24% wait) cases'
      ]
    },
    {
      id: 'panel',
      time: '00:31:21 – 00:45:35',
      tabZh: '31:21 KPMG & Velrada 圆桌',
      tabEn: '31:21 KPMG & Velrada Panel',
      titleZh: '年度大奖得主实战圆桌：速度悖论、嵌入式 Frontier Ops、自有 IP 与 30 万员工零号客户',
      titleEn: 'POTYA Winner & Finalist Panel: Velocity Paradox, Frontier Ops, IP & 300K Customer Zero',
      summaryZh: 'Paula Nobre Santos 对话 2026 年度低代码与智能体大奖得主 KPMG（Marco Amoedo）及入围者 Velrada（Jordan O\'Halloran），直击定制化项目按效计费的“速度悖论”、实践融合矩阵化、无自有 IP 不投标原则及 30 万全员实战背书。',
      summaryEn: 'Paula Nobre Santos interviews POTYA winner KPMG (Marco Amoedo) and finalist Velrada (Jordan O\'Halloran) on bespoke value-pricing bottlenecks, practice fusion, RFP IP gates, and KPMG\'s 300,000-user internal deployment.',
      bulletsZh: [
        '00:34:35 — 破解“速度悖论”：Velrada 指出定制化智能体若在签约前死磕 KPI 界定反而拖慢交付，推出嵌入式常驻迭代服务 Frontier Operations（类前线部署工程师 + 托管运营）',
        '00:36:35 — 打破部门墙与厂商中立神话：KPMG 将原 Dynamics、安全、现代办公与变革咨询融合为统一平台矩阵，并以内部 300,000 名员工全面运行微软 AI 栈作为最强客户零号实证',
        '00:38:25 — 自有 IP 生死线与伙伴竞合：当人人皆可几分钟拼出原型时，单靠个人考证已无法突围；Velrada 确立“无差异化 IP 则审慎放弃 RFP”纪律，并倡导跨伙伴生态互补'
      ],
      bulletsEn: [
        '00:34:35 — Velocity paradox: upfront bespoke KPI scoping slows time-to-value; Velrada embeds persistent "Frontier Operations" (FDE + managed services)',
        '00:36:35 — Practice fusion & opinionated alliances: KPMG merged Dynamics, cyber, modern work, and change teams, backed by 300,000 internal Copilot/Studio/Foundry users',
        '00:38:25 — IP as RFP gatekeeper: certifications alone no longer differentiate; Velrada questions bidding without proven IP and embraces partner-to-partner teaming'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk501Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk501-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk501-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk501-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk501-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK501 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK501 Partners Unlock Growth with AI official session cover" loading="lazy" />' +
          '<button type="button" class="brk501-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk501-play-pill">' + (en ? '▶ Load Official Video Player (45 min)' : '▶ 点击加载官方内嵌点播流（45 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk501-theater-layout">',
        '  <div class="brk501-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk501-meta">',
        '    <span class="brk501-code">BRK501 · ' + item.time + '</span>',
        '    <h4 class="brk501-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk501-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk501-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk501-highlights">' + liHtml + '</ul>',
        '    <div class="brk501-actions">',
        '      <a class="brk501-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk501-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk501-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK501 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk501Theater);
  } else {
    initBrk501Theater();
  }
})();

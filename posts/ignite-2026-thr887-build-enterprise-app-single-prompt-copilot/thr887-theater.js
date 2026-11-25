/* posts/ignite-2026-thr887-build-enterprise-app-single-prompt-copilot/thr887-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr887-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/b08b8f4a-b185-4c45-a65d-9829439b24d2?sessiontimeID=1791588176515001C35D',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856580323001EG0e-1791588176515001C35D',
    docsUrl: 'https://learn.microsoft.com/en-us/microsoft-365/copilot-managed-runtime/',
    speakersZh: 'Jessica Lo（Microsoft Copilot 托管运行时应用创作产品经理 · Product Manager）',
    speakersEn: 'Jessica Lo (Product Manager, Copilot Managed Runtime App Authoring, Microsoft)'
  };

  var CHAPTERS = [
    {
      id: 'ga-three-doors',
      time: '00:00:44 – 00:07:00',
      tabZh: '00:44 正式商用与三扇前门',
      tabEn: '00:44 GA & Three Front Doors',
      titleZh: '告别推倒重写玩具原型：Copilot 托管运行时正式商用与三扇前门',
      titleEn: 'Beyond Rewriting Vibe-Coded Toys: Copilot Managed Runtime GA & Three Front Doors',
      summaryZh: 'Jessica Lo 指出代码生成已极其低廉，真正的工程鸿沟在于把首版原型转化为企业可运行的生产系统。随着 Copilot 托管运行时应用正式商用，信息工作者、业务制作者与专业开发者可从 Cowork、Copilot Studio 或命令行与开发套件三扇前门进入同一套受管 Git 底座。',
      summaryEn: 'Jessica Lo explains that while generating code is now fast, taking a prototype to production is the real bottleneck. With Copilot Managed Runtime apps now generally available, builders enter through Cowork, Copilot Studio, or CLI + SDK—all backed by one Git repo and identical IT governance.',
      bulletsZh: [
        '00:02:12 — 运行在微软托管基础设施，首分钟接通 Microsoft Entra 登录、受管连接器与组织数据策略，投产无需推倒重写',
        '00:03:14 — 宣布 Copilot 托管运行时应用全面正式商用（GA），三扇前门底层调用完全一致的应用技能',
        '00:05:03 — 分享内部实战：在 Cowork 生成追踪 350+ 客户经理产品下线回执的应用，每 2 小时自动巡检收件箱同步状态'
      ],
      bulletsEn: [
        '00:02:12 — Runs on Microsoft-hosted infrastructure with Entra sign-in and admin data policies wired from minute one',
        '00:03:14 — Announces general availability (GA) of Copilot Managed Runtime apps across Cowork, Copilot Studio, and CLI + SDK',
        '00:05:03 — Shares a real internal case: tracking deprecation acknowledgments across 350+ account managers with 2-hour inbox checks'
      ]
    },
    {
      id: 'anatomy-four-things',
      time: '00:07:00 – 00:10:03',
      tabZh: '07:00 五层解剖与一词四件',
      tabEn: '07:00 App Anatomy & 4 Outputs',
      titleZh: '掀开引擎盖：标准 React + TypeScript 代码仓与单提示词四联产物',
      titleEn: 'Under the Hood: React + TypeScript in Git and Four Deliverables from One Prompt',
      summaryZh: '深度拆解受管应用的五维解剖结构（代码、桥接套件、数据与智能体、零运维托管、首分钟策略），并预告现场单条提示词将同步交付完整 Web 应用、新智能体节点连接器驱动的内联智能体、Dataverse 插件自动创建的 3 张新表以及复用的 Cowork 技能。',
      summaryEn: 'Opens the hood on the five layers of a managed runtime app (React + TypeScript code in Git, M365 bridge SDK, 1,500+ connectors, zero-server hosting at managedapps.cloud.microsoft, and instant policy) and previews the four outputs generated from one prompt.',
      bulletsZh: [
        '00:07:11 — 绝非封闭黑盒文件：底层是存放在 Git 仓库中的标准 React + TypeScript 真实 Web 应用，开发者可随时打开扩展',
        '00:07:52 — 单一应用服务三类人群：三扇前门构建者、通过 managedapps.cloud.microsoft 访问的终端用户，以及 M365 管理中心管理员',
        '00:08:28 — 揭晓单提示词四联产物：业务应用 + 内联智能体节点连接器 + Dataverse 自动建表插件 + 跨端可复用 Cowork 技能'
      ],
      bulletsEn: [
        '00:07:11 — Delivers standard React + TypeScript web code inside a Git repo—not a mockup or proprietary file',
        '00:07:52 — Serves three audiences: makers/developers, users at managedapps.cloud.microsoft, and admins in M365 Admin Center',
        '00:08:28 — Previews four single-prompt outputs: working app, inline agent node connector, Dataverse table plugin, and reusable skill'
      ]
    },
    {
      id: 'studio-prompt-data',
      time: '00:10:04 – 00:16:32',
      tabZh: '10:04 实机提示词与三表连接',
      tabEn: '10:04 Live Prompt & 3 Tables',
      titleZh: '实机输入单条提示词：构建社区脉搏应用并检视源码、多端视口与连接器',
      titleEn: 'Live Single Prompt in Copilot Studio: Code View, Form Factors & 3 Dataverse Tables',
      summaryZh: '进入 Copilot Studio 应用入口提交真实反馈聚合提示词，现场检视预生成的“客户信号分诊（社区脉搏）”应用：左侧保留 30/60/90 天历史对话方便追溯决策，右侧支持交互预览、底层源码直读、平板/手机多尺寸切换，并核验自动生成的 3 张表与 4 项连接器。',
      summaryEn: 'Submits the customer-feedback prompt in Copilot Studio and inspects the generated Customer Signal Triage (Community Pulse) workspace: persistent 30/60/90-day chat history, live interactive preview, React code view, mobile/tablet form-factor picker, 3 Dataverse tables, and 4 connectors.',
      bulletsZh: [
        '00:11:48 — 单条提示词同时要求聚合多渠道社区反馈、按主题分类与情绪趋势展示、自动建 3 张表并调用 Cowork 技能生成文档',
        '00:14:15 — 左侧永久留存提示词与多轮修改记录（便于 30/60/90 天后回溯上下文），右侧一键切换代码视图与手机/平板自适应预览',
        '00:15:26 — 打开数据与连接面板：确认自动创建社区反馈、来源、产品领域 3 张表，并挂载 Office 365 用户、GitHub、内联智能体与 Dataverse'
      ],
      bulletsEn: [
        '00:11:48 — Submits one prompt specifying forum/social feedback aggregation, theme/sentiment grouping, 3 tables, and skill-based docs',
        '00:14:15 — Preserves full prompt chat history for 30/60/90-day continuity alongside a code viewer and mobile/tablet previewer',
        '00:15:26 — Verifies 3 auto-created Dataverse tables (`craf4_*`) plus Office 365 Users, GitHub, Agent, and Dataverse connectors'
      ]
    },
    {
      id: 'inline-agent-pdf',
      time: '00:16:33 – 00:21:43',
      tabZh: '16:33 内联分诊、GitHub 与手册',
      tabEn: '16:33 Triage, GitHub & PDF Docs',
      titleZh: '内联智能体实战：早会汇总 45 条动态、自动起草 GitHub 缺陷单与 10 页手册',
      titleEn: 'Inline Agent in Action: Standup Pulse Summary, GitHub Issue Drafts & 10-Page PDF Guide',
      summaryZh: '展开生成的社区脉搏看板（当日新增 45 条帖子、77% 正向情绪、15 条待分诊及五大热门主题），点击“询问智能体”秒级输出团队晨会摘要，直接命令智能体向团队 GitHub 仓库批量起草并创建缺陷议题，最后展示复用 Cowork 技能零人工生成的 10 页用户手册。',
      summaryEn: 'Explores the live dashboard (45 posts today, 77% positive, 15 awaiting triage across top themes), uses Ask the Agent for an instant standup summary, drafts and files GitHub bug issues inline, shares the app with teammate Emma, and opens the auto-generated 10-page PDF user guide.',
      bulletsZh: [
        '00:16:43 — 看板实时呈现当日 45 条社区发帖（30 条已评级中 77% 正向，15 条待分诊）并自动聚类五大核心产品主题',
        '00:18:26 — 唤醒内联智能体总结未分诊反馈供 Teams 晨会同步，并下达指令直接为当日上报的缺陷起草与创建 GitHub 议题',
        '00:20:49 — 展示跨端调用 Cowork 文档技能生成的 10 页 PDF 用户指南，支持随应用迭代随时让智能体重新生成更新'
      ],
      bulletsEn: [
        '00:16:43 — Dashboard surfaces 45 new posts today (77% positive across 30 rated posts, 15 awaiting triage) and 5 top product themes',
        '00:18:26 — Inline agent summarizes untriaged feedback for standup and drafts GitHub issues directly against the team repository',
        '00:20:49 — Opens the 10-page PDF user guide generated via the reusable Cowork skill—ready to share alongside the published app link'
      ]
    },
    {
      id: 'governance-roadmap',
      time: '00:21:44 – 00:25:51',
      tabZh: '21:44 管理中心盘点与演进路线',
      tabEn: '21:44 Admin Governance & Roadmap',
      titleZh: 'Microsoft 365 管理中心全量透视（159 款受管应用）与六大后续路线图',
      titleEn: 'M365 Admin Center Visibility (159 Managed Apps) & Six Post-GA Roadmap Investments',
      summaryZh: '切入 Microsoft 365 管理中心检索刚创建的社区脉搏应用，直观验证管理员对全租户受管应用清单、连接器使用频次与所有者的开箱可见性；随后揭晓客户呼声最高的六大演进方向：多人协同创作、共同所有者、界面级版本回滚、开发测试生产晋级管线、企业自有 GitHub 仓库与自定义环境选择。',
      summaryEn: 'Switches to Microsoft 365 Admin Center to inspect CMR Community Pulse among 159 tenant managed apps, then details six post-GA investments: real-time co-authoring, co-owners, UX version rollback, dev-test-prod ALM, customer GitHub Enterprise hosting, and custom environment selection.',
      bulletsZh: [
        '00:21:49 — 在 M365 管理中心“全部应用”盘点全租户 159 款受管应用，实时审查连接器调用频次、创建者与阻断状态',
        '00:23:10 — 团队连续性演进：支持多人同会话协同创作（Co-authoring）与指派共同所有者（Co-owners），消除单人离职断档风险',
        '00:23:55 — 生产交付与管控升级：把命令行已有的版本回滚引入图形界面，补齐开发/测试/生产晋级管线、企业自有 GitHub 仓与非个人开发环境选择'
      ],
      bulletsEn: [
        '00:21:49 — Audits `CMR Community Pulse` inside M365 Admin Center (`All apps`, 159 managed apps) with full connector and owner telemetry',
        '00:23:10 — Collaboration & continuity roadmap: real-time multi-author sessions (`Co-authoring`) and `Co-owners` so apps outlive their creator',
        '00:23:55 — Safe shipping & IT control: UX `Version history` rollback, staged `ALM` (dev/test/prod), `Your GitHub Enterprise`, and `Environment choice`'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr887Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr887-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr887-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr887-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr887-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR887 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR887 Build an enterprise app from a single prompt with Copilot Studio official session cover featuring Jessica Lo" loading="lazy" />' +
          '<button type="button" class="thr887-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr887-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr887-theater-layout">',
        '  <div class="thr887-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr887-meta">',
        '    <span class="thr887-code">THR887 · ' + item.time + '</span>',
        '    <h4 class="thr887-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr887-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr887-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr887-highlights">' + liHtml + '</ul>',
        '    <div class="thr887-actions">',
        '      <a class="thr887-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr887-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR887 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="thr887-btn" href="' + SESSION_META.docsUrl + '" target="_blank" rel="noopener">' + (en ? '📘 Managed Runtime Docs' : '📘 托管运行时官方文档') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr887Theater);
  } else {
    initThr887Theater();
  }
})();

/* posts/ignite-2026-brk570-developers-guide-copilot-studio/brk570-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/brk570-session-cover.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/ee8a3aff-d805-428d-b727-c2b3ba01441c',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1791404048974001d13C-1791930977477001a2wC',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/ee8a3aff-d805-428d-b727-c2b3ba01441c',
    speakersZh: 'Matt Barbour & Seth Bacon (Microsoft Copilot Studio)',
    speakersEn: 'Matt Barbour & Seth Bacon (Microsoft Copilot Studio)'
  };

  var CHAPTERS = [
    {
      id: 'why-procode',
      time: '00:00:00 – 00:05:45',
      tabZh: '00:00 破除低代码偏见与托管运行时',
      tabEn: '00:00 Beyond Low-Code & Managed Runtime',
      titleZh: '“我的 Git、PR 和流水线在哪？”——三角色协同与新内核底座',
      titleEn: '“Where Are My Git, PRs, and Pipeline?”—Three Personas & Copilot Managed Runtime',
      summaryZh: 'Seth Bacon 与 Matt Barbour 直面专业开发者对拖拽画布的排斥，阐明业务负责人、专业开发者与安全治理管理员的三角协同模型，并揭示 Microsoft Copilot Harness 与本周正式商用（GA）的 Copilot 托管运行时。',
      summaryEn: 'Seth Bacon and Matt Barbour confront developer skepticism around drag-and-drop canvases, uniting process owners, developers, and admins atop the Microsoft Copilot Harness and newly GA Copilot Managed Runtime.',
      bulletsZh: [
        '00:01:12 — 企业级流程落地离不开三大角色闭环：盯业务结果的流程负责人、保扩展性的专业开发者与守合规底线的管理员',
        '00:03:05 — 聚焦原名 GitHub Copilot Harness 的 Microsoft Copilot Harness，彻底摆脱经典 Topics 碎片编排，围绕工具、技能与工作流重塑代码体验',
        '00:04:15 — Copilot Managed Runtime 本周正式商用（GA），统一承载代码级托管微应用与本地文件化 Copilot Studio 智能体'
      ],
      bulletsEn: [
        '00:01:12 — Scaling robust processes requires three personas working as one: Process Owner, Pro Developer, and Governance Admin',
        '00:03:05 — Built on the Microsoft Copilot Harness (formerly GitHub Copilot Harness), organizing agents cleanly around tools, skills, and workflows',
        '00:04:15 — Copilot Managed Runtime hits GA during Ignite week, hosting both code-built managed apps and file-backed Copilot Studio agents'
      ]
    },
    {
      id: 'msagent-cli-git',
      time: '00:05:46 – 00:12:15',
      tabZh: '05:46 msagent CLI 与文件化 Git 架构',
      tabEn: '05:46 msagent CLI & Git File Layout',
      titleZh: '与 PAC CLI 职责分家：纯文件智能体工程与标准 Git SDLC',
      titleEn: 'Splitting from PAC CLI: Intelligible File Layouts & Opinionated Git SDLC',
      summaryZh: 'Matt 详解专为智能体研发打造的 msagent CLI 如何与偏向运维管理的 PAC CLI 解耦，让 GitHub Copilot、Claude Code 与 Gemini 等任意编程代理直接操作本地文件与标准 Git 仓库。',
      summaryEn: 'Matt explains why msagent CLI split from admin-oriented PAC CLI—giving coding agents like GitHub Copilot, Claude Code, and Gemini a focused toolset over standard files and Git repos.',
      bulletsZh: [
        '00:06:18 — msagent CLI 专攻开发者创建、测试与评测闭环，PAC CLI 聚焦平台运维；收敛后的命令集让终端编程智能体理解更准、调用更稳',
        '00:07:32 — 智能体在磁盘上还原为直观目录树：根配置、部署环境映射、Markdown 技能（含 Python 脚本）、自定义连接器与 MCP 定义一应俱全',
        '00:11:08 — 坦诚披露当前唯一待交付拼图：底层架构本周已就绪，基于服务主体（Service Principal）的 GitHub Actions 自动化部署即将上线'
      ],
      bulletsEn: [
        '00:06:18 — msagent CLI focuses on developer inner loops while PAC CLI focuses on admin governance, making commands easier for coding agents to grok',
        '00:07:32 — Agents live on disk as intelligible files: root config, multi-stage deployments, skills (Markdown + Python), connectors, and MCP tools',
        '00:11:08 — Candid gap check: everything shown is available today except Service Principal GitHub Actions automation, whose backend landed this week'
      ]
    },
    {
      id: 'brownfield-vscode',
      time: '00:12:16 – 00:19:35',
      tabZh: '12:16 演示一：存量方案克隆与 VS Code',
      tabEn: '12:16 Demo 1: Brownfield Clone & VS Code',
      titleZh: '把业务侧已建好的画布资产接进 Git：BlastBox 七合一解包与连接重绑',
      titleEn: 'Bringing Brownfield Canvas Builds into Git: BlastBox Unpacking & VS Code LSP',
      summaryZh: '针对企业最常见的“业务人员已在 UI 或 Cowork 里搭好原型，急需研发接手规模化”场景，现场演示用 GitHub Copilot 驱动 msagent CLI 批量克隆 7 项资产并在 VS Code 内完成连接重绑。',
      summaryEn: 'Starting from the most common enterprise brownfield scenario, Matt uses GitHub Copilot and msagent CLI to clone 7 existing agents and workflows into Git and rebind connections in VS Code.',
      bulletsZh: [
        '00:13:10 — 一句自然语言指令驱动 GitHub Copilot 读取环境列表并批量克隆 7 个智能体与工作流（如 Store Associate Assistant 含 2 个工具与 3 项技能）',
        '00:15:30 — 打开目录自动唤醒 Copilot Studio Language Server，直接检视内含 Python 计算逻辑与 SKILL.md 的退货折算技能源码',
        '00:17:05 — 在 VS Code 扩展面板与 msagent deployment connections 中直观重绑跨环境所需的 4–5 条审批与 Office 365 连接引用，并预览工作流拓扑'
      ],
      bulletsEn: [
        '00:13:10 — GitHub Copilot invokes msagent CLI to clone 7 brownfield assets—including Store Associate Assistant with 2 tools and 3 skills—into a local Git folder',
        '00:15:30 — Opening VS Code activates the Copilot Studio Language Server over Python components and SKILL.md definitions',
        '00:17:05 — Reattaching environments in VS Code surfaces 4–5 unbound workflow connections alongside a built-in visual workflow viewer'
      ]
    },
    {
      id: 'bidirectional-sdlc',
      time: '00:19:36 – 00:40:15',
      tabZh: '19:36 演示二：双向同步与多环境晋级',
      tabEn: '19:36 Demo 2: Bi-Directional Sync & Pipeline',
      titleZh: 'NHL 冰球新闻台实战：命令行 JSON 流调试、Peek 远端拉取与 PR 多通道发布',
      titleEn: 'NHL News Desk Live Pipeline: JSON Activity Streams, Peek Remote & Multi-Stage PR Ship',
      summaryZh: '围绕拥有 3 项技能的 NHL 新闻台智能体，完整走通命令行在线问答、网页端切换模型拉回本地、新增 Dev/Prod 部署目标、发起 GitHub PR 智能审查及同步发布至 Teams 与 Copilot 的全流程。',
      summaryEn: 'Using an NHL News Desk agent with 3 skills, Matt demonstrates terminal testing, pulling web UI edits into Git, configuring Dev/Prod targets, running GitHub PR review, and shipping live.',
      bulletsZh: [
        '00:21:55 — 运行 msagent ask 直接在终端测试西雅图海怪队赛果；追加 --json --non-interactive 即可吐出完整原始事件流供编程代理自迭代优化技能',
        '00:24:15 — 在 Copilot Studio 网页端将昂贵的 Astra 6.2 模型改为 Auto 后，VS Code 一键 Peek Remote Changes 精准识别差异并拉回本地 Git 分支',
        '00:31:05 — 合入 GitHub PR #2 后执行 msagent agent deploy，12 秒内推送至新环境并同时发布上线 Teams 与 Copilot 双通道，随后由编程代理接管推向 Prod 并交叉核验公网赛果'
      ],
      bulletsEn: [
        '00:21:55 — msagent ask queries live NHL scores from the terminal; adding --json --non-interactive streams raw activity events so coding agents can refine skills',
        '00:24:15 — Switching the model from Astra 6.2 to Auto in the web UI is immediately diffed via Peek Remote Changes and pulled into the local Git branch',
        '00:31:05 — Merging PR #2 and running msagent agent deploy ships to Dev and publishes across Teams and Copilot in seconds before promoting to Prod'
      ]
    },
    {
      id: 'faa-notam-agent',
      time: '00:40:16 – 00:47:35',
      tabZh: '40:16 演示三：30 美元攻克 FAA 航空电报',
      tabEn: '40:16 Demo 3: $30 FAA Weather & NOTAM Agent',
      titleZh: '1.5 天攻克 1990 年代遗留政务接口：旧金山机场气象（TAF）与 180 条航行通告解析',
      titleEn: 'Conquering 1990s Government APIs in 1.5 Days: Live KSFO Weather & 180 NOTAMs for ~$30',
      summaryZh: 'Matt 展示赴会途中耗时一天半、仅花费约 30 美元编程智能体算力构建的“机场气象简报”重度工程：由编程代理编写自定义连接器对接美国联邦航空局（FAA）老旧接口，并在监控面板透明追踪会话点数。',
      summaryEn: 'Matt unveils a passion project built in 1.5 days between flights for ~$30 in coding-agent spend: custom connectors bridging 1990s-era FAA weather and NOTAM services into plain-English pilot briefings.',
      bulletsZh: [
        '00:41:50 — 挂载 plain-english-taf 与 format-notam-blocks 两项专业技能，配合自定义连接器工程直连 1990 年代风格的美国 FAA 航行通告与 NOAA 气象中心接口',
        '00:43:35 — 现场查询旧金山国际机场（KSFO）终端区天气预报（TAF），将晦涩压缩的航空电报实时翻译为清晰的分时段风向风速简报（单机场常伴随约 180 条 NOTAM）',
        '00:44:38 — 打开 Copilot Studio Monitor 面板展示完整可观测性：1.5 天 CLI 编码总成本约 $30，而智能体自身运行至今累计消耗低于 $5（单次仅约 $0.01）'
      ],
      bulletsEn: [
        '00:41:50 — Combines plain-english-taf and format-notam-blocks skills with a Power Platform custom connector project interfacing with 1990s-era FAA and NOAA APIs',
        '00:43:35 — Queries KSFO live on stage, translating cryptic aviation TAF blocks into structured wind/period reports alongside ~180 San Francisco NOTAMs',
        '00:44:38 — Studio Monitor tracks M365 Agents SDK client sessions, durations, and credits: ~$30 total CLI build cost and under $5 runtime credits (~$0.01 increments)'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk570Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk570-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk570-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk570-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk570-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK570 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK570 Developer\'s guide to Copilot Studio official session cover" loading="lazy" />' +
          '<button type="button" class="brk570-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk570-play-pill">' + (en ? '▶ Load Official Video Player (47 min)' : '▶ 点击加载官方内嵌点播流（47 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk570-theater-layout">',
        '  <div class="brk570-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk570-meta">',
        '    <span class="brk570-code">BRK570 · ' + item.time + '</span>',
        '    <h4 class="brk570-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk570-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk570-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk570-highlights">' + liHtml + '</ul>',
        '    <div class="brk570-actions">',
        '      <a class="brk570-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk570-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk570-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK570 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk570Theater);
  } else {
    initBrk570Theater();
  }
})();

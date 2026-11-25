/* posts/ignite-2026-odsp2233-deliver-trusted-accessible-ai-teams-work/odsp2233-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-odsp2233-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/f7e4add0-d026-4e44-84f0-72e7f878feb1',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787855007373001tHrU-AAAAAAAAAAAAAAAAAAAA',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/f7e4add0-d026-4e44-84f0-72e7f878feb1',
    speakersZh: 'Shankar Narayanan SGS（微软 Snowflake ISV 合作团队负责人）',
    speakersEn: 'Shankar Narayanan SGS (Snowflake ISV Team Lead, Microsoft)'
  };

  var CHAPTERS = [
    {
      id: 'ecosystem',
      time: '00:00:05 – 00:02:00',
      tabZh: '00:05 三大跨生态支柱',
      tabEn: '00:05 Three Ecosystem Pillars',
      titleZh: '连接业务桌面与企业数仓：Copilot Studio、Teams 与 Foundry 三路协同',
      titleEn: 'Bridging M365 and Snowflake: Copilot Studio, Teams & Microsoft Foundry',
      summaryZh: '微软 Snowflake ISV 团队负责人 Shankar Narayanan 拆解双方 AI 生态三大联合创新：通过全新 Snowflake MCP Server 让 Copilot Studio 原生连接 Cortex Agent、将对话式检索直接嵌入 M365 Teams，以及实现 Foundry 与 Azure OpenAI 对 Cortex 的双向模型赋能。',
      summaryEn: 'Shankar Narayanan outlines three joint pillars between Microsoft and Snowflake: native Copilot Studio to Cortex Agent connectivity via Snowflake MCP Server, direct M365 Teams chat access, and bidirectional model integration across Microsoft Foundry and Azure OpenAI.',
      bulletsZh: [
        '00:00:18 — 支柱一：Copilot Studio 借助全新托管式 Snowflake MCP Server 原生调用 Cortex Agent，发布至 Teams 与 Web 应用',
        '00:00:44 — 支柱二：M365 Teams 原生集成，支持业务人员像与同事对话一样联合查询结构化与非结构化数据',
        '00:01:06 — 支柱三：双向模型底座——在 Foundry 中调用 Cortex 构建智能体，或在 Snowflake Cortex 内直接调用 Azure OpenAI'
      ],
      bulletsEn: [
        '00:00:18 — Pillar 1: Copilot Studio connects natively to Cortex Agents via Snowflake MCP Server for multi-agent orchestration',
        '00:00:44 — Pillar 2: M365 Teams integration lets business users query structured and unstructured Snowflake data in plain text',
        '00:01:06 — Pillar 3: Bidirectional model power pairing Microsoft Foundry models with Azure OpenAI inside Snowflake Cortex'
      ]
    },
    {
      id: 'uscold',
      time: '00:02:01 – 00:03:05',
      tabZh: '02:01 US Cold Storage 案例',
      tabEn: '02:01 US Cold Storage Case',
      titleZh: '客户实战：US Cold Storage 整合多仓 WMS 与冷链 IoT 实现零 SQL 数据普惠',
      titleEn: 'Customer Story: United States Cold Storage Democratizes Multi-WMS & IoT Logistics Data',
      summaryZh: '剖析北美冷链物流领军企业 United States Cold Storage 如何将分散在多套仓库管理系统（WMS）及 RFID/IoT 传感器的库存与运营数据汇聚至 Snowflake AI Data Cloud，并通过 Copilot Studio 编排 Cortex 智能体推送至 Teams 一线员工。',
      summaryEn: 'Examines how United States Cold Storage unified fragmented warehouse management systems (WMS) plus RFID and IoT streams into Snowflake AI Data Cloud, orchestrating Cortex Agents via Copilot Studio directly inside Microsoft Teams.',
      bulletsZh: [
        '00:02:09 — 业务痛点：库存与运营数据散落多套 WMS 且质量不一，非技术人员查数受困于手工报表加载与编写 SQL',
        '00:02:28 — 统一底座：汇聚全网仓库与 RFID/IoT 实时流至 Snowflake 单一事实源，在上层构建专属 Cortex 智能体群',
        '00:02:40 — Teams 即时触达：由 Copilot Studio 统一编排并推入 Teams，实现全网货品位置追踪与零等待自然语言洞察'
      ],
      bulletsEn: [
        '00:02:09 — Friction solved: eliminated manual SQL queries and slow report loads across scattered warehouse management systems',
        '00:02:28 — Unified foundation: consolidated multi-WMS, RFID, and IoT telemetry into Snowflake AI Data Cloud',
        '00:02:40 — Instant Teams rollout: Copilot Studio orchestrates Cortex Agents in Teams for real-time product tracking'
      ]
    },
    {
      id: 'mcpsetup',
      time: '00:03:06 – 00:04:34',
      tabZh: '03:06 六步架构与 MCP SQL 配置',
      tabEn: '03:06 6-Step Flow & MCP SQL',
      titleZh: '六步端到端工作流与 Snowflake 侧 MCP Server 声明式注册（OAuth + RBAC）',
      titleEn: 'Six-Step Reference Workflow & Declarative CREATE MCP SERVER Setup with OAuth',
      summaryZh: '演示在 Snowflake 内借助 Cortex Code 组装 SALES_INTELLIGENCE_AGENT（挂载语义模型与对话检索两套工具），通过 CREATE OR REPLACE MCP SERVER 暴露为 CORTEX_AGENT_RUN 工具，并在 Copilot Studio 中配置 OAuth 接入。',
      summaryEn: 'Walks through the 6-step architecture and live Snowflake configuration: building SALES_INTELLIGENCE_AGENT with Cortex Code, registering salesintelligencemcpserver via SQL YAML specification, granting role usage, and wiring OAuth in Copilot Studio.',
      bulletsZh: [
        '00:03:11 — 双擎组装：在 SALES_INTELLIGENCE.DATA 下挂载 sales_metrics_model.yaml（Analyst）与 SALES_CONVERSATION_SEARCH（Search）',
        '00:03:53 — 声明式发布：执行 CREATE OR REPLACE MCP SERVER 暴露 CORTEX_AGENT_RUN，并向 SALES_INTELLIGENCE_RL 授予最小 USAGE 权限',
        '00:04:12 — 零摩擦接入：在 Copilot Studio 添加 Model Context Protocol 工具并填入 Entra External OAuth 凭据即可就绪'
      ],
      bulletsEn: [
        '00:03:11 — Dual-engine agent: binds sales_metrics_model.yaml (Analyst) and SALES_CONVERSATION_SEARCH (Search) in Snowflake',
        '00:03:53 — SQL registration: CREATE OR REPLACE MCP SERVER exposes CORTEX_AGENT_RUN with role-scoped GRANT USAGE',
        '00:04:12 — Copilot Studio wiring: adds the Snowflake MCP Server tool over OAuth without custom middleware'
      ]
    },
    {
      id: 'livedemo',
      time: '00:04:35 – 00:06:34',
      tabZh: '04:35 双模态实机联调演示',
      tabEn: '04:35 Dual-Modal Live Demo',
      titleZh: '实机联调：从 SecureBank 90 分钟通话纪要检索到十家客户客单价 Text-to-SQL',
      titleEn: 'Live Demo: Unstructured SecureBank CISO Call Triage & Structured Deal-Value Text-to-SQL',
      summaryZh: '在同一 Copilot Studio 会话内连续验证非结构化与结构化推理：先用 15.44 秒通过 Cortex Search 提炼 SecureBank CISO 通话的三大成交信号与三项待办；再用 24.14 秒通过 Cortex Analyst 生成 SQL 算出 10 家客户平均客单价（$180K 至 $25K）。',
      summaryEn: 'Demonstrates seamless context switching in one Copilot Studio test session: first summarizing a 90-minute SecureBank CISO call via Cortex Search (15.44s), then translating an average-sales prompt into Snowflake SQL via Cortex Analyst (24.14s).',
      bulletsZh: [
        '00:04:37 — 非结构化检索（15.44s）：调取 SecureBank CISO 与安全运营团队 90 分钟会议纪要，输出零信任/MFA 亮点与 3 项跟进行动',
        '00:05:32 — 结构化 Text-to-SQL（24.14s）：基于语义视图自动生成 SQL，返回 FastTrack Ltd（$180K）至 SmallBiz（$25K）共 10 家客户均值',
        '00:06:14 — 跨模态互证：自动指出排名第 2 的 SecureBank（$150K）恰与前述高价值安全套件商机形成业务闭环，并推荐追问方向'
      ],
      bulletsEn: [
        '00:04:37 — Unstructured turn (15.44s): extracts highlights and 3 action items from SecureBank CISO 90-minute strategy call',
        '00:05:32 — Structured Text-to-SQL (24.14s): ranks 10 accounts from FastTrack Ltd ($180K) to SmallBiz ($25K), a 7.2x ($155K) spread',
        '00:06:14 — Cross-modal insight: correlates #2 SecureBank ($150K) with the Premium Security call and suggests follow-up prompts'
      ]
    },
    {
      id: 'skills',
      time: '00:06:35 – 00:07:03',
      tabZh: '06:35 AI 编程技能扩展',
      tabEn: '06:35 Coding Skills & YAML',
      titleZh: '工程化提效：结合 GitHub Copilot、Snowflake Cortex Code 与 Skills for Copilot Studio',
      titleEn: 'Developer Acceleration: Pairing GitHub Copilot & Cortex Code with Skills for Copilot Studio',
      summaryZh: '展示微软开源仓库 microsoft/skills-for-copilot-studio（v1.0.11）：开发者可联合使用 GitHub Copilot、Claude Code 与 Snowflake Cortex Code（CoCo），以带模式校验的 YAML 直接编写、演进和推送 Copilot Studio 智能体工作流。',
      summaryEn: 'Highlights the open-source microsoft/skills-for-copilot-studio repository (v1.0.11), enabling teams to combine GitHub Copilot, Claude Code, and Snowflake Cortex Code to author and validate Copilot Studio agents as YAML.',
      bulletsZh: [
        '00:06:35 — 跨源编排扩展：可将 Snowflake 分析结果与企业其他运营数据源在 Copilot Studio 工作流中串联执行',
        '00:06:43 — 开源技能包：发布 microsoft/skills-for-copilot-studio（MIT 许可），支持以 YAML 构建与编辑智能体并内置 Schema 校验',
        '00:06:48 — 双 AI 结对研发：打通 GitHub Copilot 与 Snowflake Cortex Code（CoCo），端到端加速智能体工程化交付'
      ],
      bulletsEn: [
        '00:06:35 — Multi-source extensibility: combine Snowflake insights with broader operational data and M365 actions',
        '00:06:43 — Open-source YAML toolkit: microsoft/skills-for-copilot-studio provides schema validation, templates, and evals',
        '00:06:48 — AI-assisted authoring: pair GitHub Copilot and Snowflake Cortex Code (CoCo) to build workflows end-to-end'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initOdsp2233Theater() {
    var controls = document.querySelector('[data-sandbox-controls="odsp2233-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="odsp2233-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'odsp2233-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'odsp2233-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 ODSP2233 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="ODSP2233 Deliver trusted accessible AI where your teams work official session cover" loading="lazy" />' +
          '<button type="button" class="odsp2233-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="odsp2233-play-pill">' + (en ? '▶ Load Official Video Player (7 min)' : '▶ 点击加载官方内嵌点播流（7 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="odsp2233-theater-layout">',
        '  <div class="odsp2233-player-wrap">' + mediaInner + '</div>',
        '  <div class="odsp2233-meta">',
        '    <span class="odsp2233-code">ODSP2233 · ' + item.time + '</span>',
        '    <h4 class="odsp2233-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="odsp2233-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="odsp2233-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="odsp2233-highlights">' + liHtml + '</ul>',
        '    <div class="odsp2233-actions">',
        '      <a class="odsp2233-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="odsp2233-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript' : '⬇ 下载官方字幕讲稿') + '</a>',
        '      <a class="odsp2233-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite ODSP2233 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initOdsp2233Theater);
  } else {
    initOdsp2233Theater();
  }
})();

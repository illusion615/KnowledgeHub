/* posts/ignite-2026-brk473-building-governing-trusted-ai-agents/brk473-session.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856645220001EUhq-1791588268917001CGsN';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/5fd1a5a1-f386-4f89-a525-5b5c39952c4f';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/5fd1a5a1-f386-4f89-a525-5b5c39952c4f';
  var POSTER_SRC = './media/brk473-session-thumb.jpg';

  var CHAPTERS = [
    {
      id: 'framing-voice',
      tabZh: '00:00 达·芬奇隐喻与客户心声',
      tabEn: '00:00 Mona Lisa Framing & Voices',
      timeRange: '00:00:07 – 00:07:35',
      titleZh: '草稿不等于蒙娜丽莎：让合规路径成为创作者最省力的捷径',
      titleEn: 'Drafts vs. Mona Lisas: Making the Governed Way the Easy Way',
      speakerZh: 'Zohar Raz（微软 Power Platform 治理、安全与成本负责人）与全球企业管理员代表',
      speakerEn: 'Zohar Raz (Power Platform Governance, Security & Cost Lead) & Customer Admins',
      summaryZh: '剖析生成式时代人人皆可构建应用与智能体的洪流：若金融机构把每份个人草稿都当作传世画作层层封堵，只会扼杀创新或催生影子 IT；核心解法是用环境路由与连接器护栏取代硬路障。',
      summaryEn: 'Contrasts three-year bespoke software with instant AI-generated apps and agents; warns financial CISOs against blocking every early draft like a Mona Lisa and frames environment routing plus guardrails as the friction-free path.',
      pointsZh: [
        '00:01:49 — 平台两大新成员：自然语言微应用托管运行时（Copilot Managed Runtime）与 Microsoft Copilot Harness',
        '00:04:20 — 终结默认环境“西部荒野”：防止个人生产力草稿在缺乏监控下悄然演变为核心业务依赖',
        '00:05:32 — 治理本质是人的协同：当受管路径本身就是最顺手路径时，创作者自然不会绕道违规'
      ],
      pointsEn: [
        '00:01:49 — Two agentic additions: Copilot Managed Runtime apps and Microsoft Copilot Harness',
        '00:04:20 — Escaping default-environment Wild West before personal drafts quietly become mission-critical',
        '00:05:32 — People-first governance: When the governed path is the easiest path, makers stay inside guardrails'
      ]
    },
    {
      id: 'state-farm-case',
      tabZh: '00:07 State Farm 54 个生产智能体',
      tabEn: '00:07 State Farm 54 Prod Agents',
      timeRange: '00:07:38 – 00:22:18',
      titleZh: 'State Farm 实战全拆解：73,241 席位、阶梯晋升与四级点数池',
      titleEn: 'State Farm Deep Dive: 73,241 Builder Seats, Laddering Strategy & 4-Tier Credits',
      speakerZh: 'Azsure Dorton（State Farm 财产险工程经理）',
      speakerEn: 'Azsure Dorton (Engineering Manager, State Farm Insurance)',
      summaryZh: '美国财产与意外险巨头 State Farm 为全员配发 73,241 个高级创作者席位，实现近 100% 托管环境纳管、85% 员工活跃消费与 54 个生产级智能体；详解 askHRD、西语理赔函翻译、虚拟环境集群（VEC）及四级点数预算。',
      summaryEn: 'Details how US P&C insurer State Farm equipped 73,241 employees with premium seats across ~100% managed environments, driving 85% app consumption and 54 production agents via automated VEC clusters and four credit buckets.',
      pointsZh: [
        '00:11:30 — 标杆智能体实效：askHRD 月省 254 小时（38 个专家工作日），西语理赔函年译 5,000 封减负约 90%',
        '00:13:10 — 创作者阶梯效应与 VEC：个人试水豁免额外风评，晋升部门/企业级时自动拉起开发/测试/生产集群',
        '00:18:54 — 四级点数预算隔离：拆分个人探索、黑客松培训创新池、开发测试预拨池与历史预测生产池'
      ],
      pointsEn: [
        '00:11:30 — Verified ROI: askHRD saves 254 hrs (38 specialist days)/month; Spanish claims translator handles 5K letters/yr (~90% less effort)',
        '00:13:10 — Maker Ladder & VEC: Personal builds skip heavy risk paperwork until promoting into automated Dev/QA/Prod clusters',
        '00:18:54 — Four-tier credit strategy: Dedicated buckets for Personal, Innovation/Hackathon, Dev/QA, and Production'
      ]
    },
    {
      id: 'green-zone-demo',
      tabZh: '00:22 绿区构建与 SQL OAuth 实测',
      tabEn: '00:22 Green Zone & SQL OAuth Demo',
      timeRange: '00:22:20 – 00:31:55',
      titleZh: '打造受控“绿区”：SQL OAuth 动作级连接器策略与 250 万资产秒级盘点',
      titleEn: 'Creating a Green Zone: SQL OAuth Connector Rules & 2.5M-Asset 50s Inventory',
      speakerZh: 'Zohar Raz（实机演示 PPAC 与 Microsoft 365 管理中心）',
      speakerEn: 'Zohar Raz (Live PPAC & Microsoft 365 Admin Center Walkthrough)',
      summaryZh: '现场演示用个人开发环境替代拥挤默认环境：通过环境组下发约 50 项规则，在 1,500+ 连接器中锁定允许动作并强制 SQL 仅用 OAuth 鉴权；展示 250 万资产 50 秒增量同步及 MAC 开箱即用托管策略。',
      summaryEn: 'Demonstrates routing makers into isolated personal environments governed by ~50 group rules, enforcing OAuth-only SQL actions across 1,500+ connectors, syncing 2.5M assets within 50 seconds, and turning on default MAC guardrails.',
      pointsZh: [
        '00:27:45 — Ignite 重磅规则：高级连接器策略精细限制 SQL 具体动作，并强制仅允许 OAuth 身份认证',
        '00:28:40 — 工作台内生引导：首登强制确认合规欢迎词，被拦截时在状态栏直接唤起 IT 异常申请智能体',
        '00:29:45 — 极速全局资产库：250 万规模资产改名后 50 秒刷新，支持按 Copilot Harness 与底层模型排序筛选'
      ],
      pointsEn: [
        '00:27:45 — New at Ignite: Advanced Connector Policies restrict specific SQL actions and require OAuth authentication',
        '00:28:40 — Inline studio UX: Mandatory first-run onboarding acknowledgement plus status-pane IT unblock agent',
        '00:29:45 — Instant estate inventory: Refreshes 2.5M assets in 50 seconds with filters for Copilot Harness and model used'
      ]
    },
    {
      id: 'managed-host-prod',
      tabZh: '00:32 托管主机 CSP 强拦截演示',
      tabEn: '00:32 Managed Host & CSP Guard',
      timeRange: '00:32:00 – 00:39:40',
      titleZh: '生产级安全运行：Managed Host 内容安全策略（CSP）与 1 小时级健康告警',
      titleEn: 'Enterprise Production Runtime: Managed Host CSP Enforcement & 1-Hour Alerts',
      speakerZh: 'Austin Laugesen（微软产品负责人，实机演示代码应用运行态拦截）',
      speakerEn: 'Austin Laugesen (Microsoft Product Lead, Live Managed Host CSP Demo)',
      summaryZh: '阐释创作者任意选型工具与统一受管宿主解耦架构：演示用 GitHub Copilot + CLI/SDK 在外部编写的纯代码应用部署进托管主机后，获批连接器顺畅通行，而未授权外部 API 调用被默认 CSP 实时拦截报错。',
      summaryEn: 'Shows how Managed Host enforces Entra auth, Purview logging, and restrictive Content Security Policies—blocking unauthorized external API calls in browser DevTools even inside a pro-code app built externally with GitHub Copilot.',
      pointsZh: [
        '00:34:15 — 塑封级最小权限晋升（Shrink-Wrap Governance）：结合 Git 与混合 ALM 将宽松开发态平滑推向硬化生产目标',
        '00:36:05 — Monitor 低延迟告警预览：最快 1 小时捕获运行退化，开放 API 并将告警事件直推 Teams 或 ServiceNow',
        '00:37:35 — 浏览器控制台实证：外部 CLI 构建的代码应用每次违规直连外部 API 均被托管主机 CSP 当场阻断'
      ],
      pointsEn: [
        '00:34:15 — Shrink-wrap governance: Git-backed pipelines and hybrid ALM promote builds into hardened production targets',
        '00:36:05 — Preview 1-hour Monitor alerts: Route operational degradation events straight to Teams or ServiceNow',
        '00:37:35 — Live DevTools proof: Pro-code CLI app succeeds on approved connectors while CSP blocks arbitrary APIs'
      ]
    },
    {
      id: 'finops-cowork-cli',
      tabZh: '00:39 双中心计费与 10 美元建管控台',
      tabEn: '00:39 FinOps & $10 Cowork 360 App',
      timeRange: '00:39:42 – 00:47:30',
      titleZh: 'USL 与按量点数双轨分工，以及用 Cowork + PAC CLI 30 分钟生成 360 管控台',
      titleEn: 'USL vs. Credit FinOps Split & Building Power Platform 360 in 30 Minutes for ~$10',
      speakerZh: 'Zohar Raz（压轴演示 Cowork 管理员插件与开源 Power Platform 360 应用）',
      speakerEn: 'Zohar Raz (Closing Demo: Cowork Admin Plugin, PAC CLI & Power Platform 360)',
      summaryZh: '厘清 PPAC 管固定坐席订阅（USL）、MAC 管按量消耗点数（Copilot Credits）的边界；压轴演示基于单一 OpenAPI 规范生成的 15 个 PAC CLI 命令组与 Cowork 插件，仅耗资约 10 美元、30 分钟构建超越经典 CoE 工具包的可执行管控台。',
      summaryEn: 'Clarifies fixed USL management in PPAC versus usage-based Copilot Credits in MAC, then demos how one OpenAPI spec powers PAC CLI and a Cowork plugin to generate an actionable Power Platform 360 portal in 30 minutes for ~$10.',
      pointsZh: [
        '00:40:45 — 双管理中心职责切分：PPAC 许可中心管固定月费坐席，MAC 成本页统管高阶模型点数策略，工作台左上角实时显账',
        '00:42:35 — 单一 OpenAPI 规范月度同发：一次定义管理能力，自动派生 REST、.NET/Python SDK、Admin V2 连接器与 15 组 PAC CLI',
        '00:44:50 — 告别只读报表：拖入 Reza 开源模板包，Cowork 耗费约 10 美元调 CLI 生成支持隔离与删除资产的 Power Platform 360 应用'
      ],
      pointsEn: [
        '00:40:45 — Dual-console FinOps: PPAC manages predictable USL seats while MAC governs Copilot Credit policies with live studio meters',
        '00:42:35 — Single OpenAPI spec: Ships REST docs, .NET/Python SDKs, Admin V2 connector, and 15 PAC CLI command groups monthly',
        '00:44:50 — Actionable agentic admin: Cowork builds the open-source Power Platform 360 app (~$10, 30 min) calling PAC CLI to quarantine assets'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk473-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk473-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var embedLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk473-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk473-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var pts = en ? item.pointsEn : item.pointsZh;
      var liHtml = '';
      for (i = 0; i < pts.length; i++) {
        liHtml += '<li>' + pts[i] + '</li>';
      }

      var playerInner = embedLoaded
        ? '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRK473 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : [
            '<img src="' + POSTER_SRC + '" alt="Microsoft Ignite 2026 BRK473 Session Poster" loading="lazy" />',
            '<button type="button" class="brk473-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load Official On-Demand Player' : '加载官方点播播放器') + '">',
            '  <span class="brk473-play-pill">▶ ' + (en ? 'Load Official Medius Stream (47m)' : '点击内嵌播放官方 47 分钟实录') + '</span>',
            '</button>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk473-theater-layout">',
        '  <div class="brk473-theater-player">' + playerInner + '</div>',
        '  <div class="brk473-theater-meta">',
        '    <span class="brk473-theater-code">BRK473 · ' + item.timeRange + '</span>',
        '    <h4 class="brk473-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk473-theater-speakers">' + (en ? item.speakerEn : item.speakerZh) + '</div>',
        '    <p class="brk473-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk473-theater-chapters">' + liHtml + '</ul>',
        '    <div class="brk473-theater-actions">',
        '      <a class="brk473-theater-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口打开视频流') + '</a>',
        '      <a class="brk473-theater-btn" href="' + SLIDES_URL + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Slide Deck Link' : '⬇ 官方原版课件直链') + '</a>',
        '      <a class="brk473-theater-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite Session Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-load-embed="1"]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          embedLoaded = true;
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
    document.addEventListener('DOMContentLoaded', initTheater);
  } else {
    initTheater();
  }
})();

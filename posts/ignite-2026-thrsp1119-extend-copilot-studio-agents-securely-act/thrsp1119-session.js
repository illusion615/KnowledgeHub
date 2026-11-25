/* posts/ignite-2026-thrsp1119-extend-copilot-studio-agents-securely-act/thrsp1119-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thrsp1119-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/8d8bbc36-b706-41d9-890f-d4e29210bbcd',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787858596220001SjZp-1791588332150001CZvW',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Caption/8d8bbc36-b706-41d9-890f-d4e29210bbcd',
    speakersZh: 'Rahul Pahuja（CData Software 现场首席技术官 Field CTO）',
    speakersEn: 'Rahul Pahuja (Field CTO, CData Software)'
  };

  var CHAPTERS = [
    {
      id: 'arch',
      time: '00:00:00 – 00:04:50',
      tabZh: '00:00 跨生态治理架构',
      tabEn: '00:00 Cross-Estate Architecture',
      titleZh: '走出微软边界：从智能体层治理延伸到 350+ 企业数据源记录级治理',
      titleEn: 'Beyond the Microsoft Estate: Extending Agent 365 to 350+ Data Sources',
      summaryZh: 'Rahul Pahuja 阐明核心矛盾：Work IQ 与 Agent 365 解决了微软生态内的上下文与智能体管控，但跨 SAP、Salesforce、Snowflake 等异构系统时，必须通过 Copilot Studio 官方认证连接器与 CData Connect AI 网关补齐语义与记录级读写控制。',
      summaryEn: 'Rahul Pahuja frames the architectural gap: Work IQ and Agent 365 handle Microsoft-estate context and governance, while CData Connect AI brings certified OAuth, semantic context, and record-level controls across 350+ external systems.',
      bulletsZh: [
        '00:01:35 — 治理不能止步于 Agent 365 智能体入口层，必须向下贯通至外部异构数据与单条记录层',
        '00:02:44 — Copilot Studio 内置官方认证连接器：通过每用户 OAuth 直连超 350 款实时读写连接器',
        '00:03:18 — Connect AI 四层能力：自带模型路由网关、集中安全控制面、Context Engine 与虚拟数据层'
      ],
      bulletsEn: [
        '00:01:35 — Governance must extend below Agent 365 all the way down to external data and individual records',
        '00:02:44 — Certified Copilot Studio connector: per-user OAuth unlocking 350+ out-of-the-box MCP connectors',
        '00:03:18 — Four Connect AI layers: BYO-model gateway, security control plane, Context Engine & virtual data layer'
      ]
    },
    {
      id: 'labs',
      time: '00:04:51 – 00:09:50',
      tabZh: '04:51 CData Labs 三大实测',
      tabEn: '04:51 CData Labs 3 Studies',
      titleZh: 'CData Labs 定量报告：98.5% 准确率、178 倍成本跨度与 93% 词元节省',
      titleEn: 'CData Labs Benchmarks: 98.5% Accuracy, 178x Cost Spread & 93% Token Savings',
      summaryZh: '披露三项跨 Salesforce、Zendesk 与 Snowflake 关联查询实验室对比研究：依靠模式感知工具、跨源预连接派生视图（Derived Views）与服务端计算，在开放权重小模型上实现同等准确回答并大幅削减词元开销。',
      summaryEn: 'Unpacks three CData Labs studies across Salesforce, Zendesk, and Snowflake: schema-aware tools, pre-joined derived views, and server-side execution enable open-weight small models to match frontier accuracy at a fraction of the cost.',
      bulletsZh: [
        '00:04:55 — 研究一（准确率差距）：Connect AI 达 98.5% 准确率，领先其他通用连接服务（65%–75%）约 25 个百分点',
        '00:06:25 — 研究二（178x 成本跨度）：依托跨源派生视图让 Mistral Small 跑出同等正确结果，单次运行成本从 $0.16 降至 $0.01',
        '00:08:25 — 研究三（93% 词元节省）：按需加载上下文将单次消耗从 914K 压降至 87K tokens（1/10 工具调用，正确率 83% vs 36%）'
      ],
      bulletsEn: [
        '00:04:55 — Study 1 (Accuracy Gap): Connect AI hits 98.5% accuracy, beating other MCP providers (65%–75%) by ~25 percentage points',
        '00:06:25 — Study 2 (178x Cost Spread): Pre-joined derived views let Mistral Small match frontier accuracy ($0.16 down to $0.01/run)',
        '00:08:25 — Study 3 (93% Token Savings): On-demand context cuts runs from 914K to 87K tokens (1/10 tool calls, 83% vs 36% correct)'
      ]
    },
    {
      id: 'gateway',
      time: '00:09:51 – 00:13:17',
      tabZh: '09:51 提示词链路与预算封顶',
      tabEn: '09:51 Prompt Life & FinOps',
      titleZh: '提示词六步全生命周期与 LLM 网关：月度预算封顶、故障转移与防注入',
      titleEn: 'Six-Step Life of a Prompt & LLM Gateway: Spend Caps, Failover & Guardrails',
      summaryZh: '追踪一次提问从身份透传、网关路由、策略校验、语义挂载到源端执行的六步闭环；演示 Account Health 项目配置 $1,000 月度预算上限、Sonnet 至 Opus 优先级故障切换及提示词攻击护栏。',
      summaryEn: 'Traces a user prompt across six governed hops from OAuth identity to source execution, and showcases the LLM Gateway with a $1,000/month cap, claude-sonnet-5 to claude-opus-5 failover, and active PromptAttackGuardrail.',
      bulletsZh: [
        '00:10:10 — 提示词六步生命周期：全程携带提问者真实身份凭据，按调用者自有权限在源端执行读写',
        '00:11:09 — 演示 Account Health 项目配置：绑定优先级故障转移路由与主动防提示词注入护栏',
        '00:11:40 — 多维成本刹车：软硬预算阈值、每分钟请求与词元速率限制、项目级归因看板及超额自动跳过路由'
      ],
      bulletsEn: [
        '00:10:10 — Six-step life of a prompt: attaches caller OAuth identity end-to-end and executes with native source permissions',
        '00:11:09 — Account Health Project setup: priority failover routing paired with active PromptAttackGuardrail',
        '00:11:40 — Multi-layered FinOps: soft/hard token budgets, per-minute rate limits, live spend attribution & budget-aware routing'
      ]
    },
    {
      id: 'demo',
      time: '00:13:18 – 00:17:33',
      tabZh: '13:18 实机演示：健康分与回写',
      tabEn: '13:18 Live Demo: Score & Write',
      titleZh: '实机演示：导入 Power BI / Snowflake 语义、37 分高危诊断与 Salesforce 受控回写',
      titleEn: 'Live Demo: PBIX/Snowflake Context, 37/100 Risk Diagnosis & Governed Salesforce Write',
      summaryZh: '完整演示从导入 Power BI PBIX 与 Snowflake 语义生成可编辑 Markdown，到配置收敛工具包与虚拟模式 CRUD 权限，最终在 Copilot Studio 中诊断 Silver State Banking（健康分 37/100）并经人工确认回写 Salesforce 跟进任务。',
      summaryEn: 'Walks live from importing PBIX/Snowflake semantics into editable Markdown and scoping CRUD toolkits, to diagnosing Silver State Banking (37/100 score < 40 threshold) in Copilot Studio and confirming a governed Salesforce task write-back.',
      bulletsZh: [
        '00:13:53 — Context Engine 导入 dbt、Power BI（PBIX）或 Snowflake 语义视图，向导式生成可编辑 Markdown 业务口径',
        '00:14:33 — Scoped Toolkits 与 Virtual Schema：仅暴露 4 个专用工具并精确收敛对象级 CRUD 权限与 SIEM 审计流',
        '00:15:49 — Customer 360 智能体诊断 Silver State Banking 健康分 37/100（低于阈值 40，合同逾期 4 个月、6 张未结工单），获批后成功创建 Salesforce 任务'
      ],
      bulletsEn: [
        '00:13:53 — Context Engine ingests dbt, Power BI PBIX, or Snowflake views into editable Markdown domain definitions',
        '00:14:33 — Scoped Toolkits & Virtual Schemas restrict agent surface area to 4 tools with object-level CRUD & SIEM logs',
        '00:15:49 — Customer 360 Agent flags Silver State Banking at 37/100 (< 40 threshold, 6 open tickets) and writes a Salesforce task after confirmation'
      ]
    },
    {
      id: 'anaqua',
      time: '00:17:34 – 00:19:05',
      tabZh: '17:34 Anaqua 客户投产案例',
      tabEn: '17:34 Anaqua Case Study',
      titleZh: '客户实证：知识产权软件领军企业 Anaqua 在 6–8 周内跨 5 套系统全面投产',
      titleEn: 'Customer Story: Anaqua Deploys Governed AI Across 5 Enterprise Systems in 6–8 Weeks',
      summaryZh: '分享约 950 名员工的知识产权管理软件企业 Anaqua 实战：统一纳管 Claude 与 Microsoft Copilot 双端用户，跨 Salesforce、NetSuite、Zendesk、Azure DevOps 与 BambooHR 五大系统告别管理员特权共享，6–8 周从概念验证走向全员投产。',
      summaryEn: 'Details how ~950-employee IP software leader Anaqua unified Claude and Microsoft Copilot across Salesforce, NetSuite, Zendesk, Azure DevOps, and BambooHR—moving from POC to company-wide production in 6–8 weeks.',
      bulletsZh: [
        '00:17:36 — 痛点破局：终结原生连接器依赖管理员高危特权的隐患，为 Claude 与 Copilot 双入口提供统一每用户鉴权控制面',
        '00:18:01 — 投产速度：仅用 6–8 周即完成从概念验证（POC）到全公司推广，支撑 5 个活跃业务与高管场景',
        '00:18:10 — 延伸成效：落地可自动生成 SQL 修复方案的自进化 IT 智能体，并在网关层严格实施对 Certinia 的受控写入'
      ],
      bulletsEn: [
        '00:17:36 — Eliminated admin-privileged connector risks with one per-user authenticated plane across Claude and Copilot',
        '00:18:01 — Reached company-wide production from POC in 6–8 weeks across 5 active IT, ops, and leadership use cases',
        '00:18:10 — Delivered a self-improving IT SQL-fix agent and enforced controlled write-back into Certinia'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThrsp1119Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thrsp1119-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thrsp1119-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thrsp1119-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thrsp1119-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THRSP1119 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THRSP1119 Extend Copilot Studio agents to securely act on enterprise data official session cover" loading="lazy" />' +
          '<button type="button" class="thrsp1119-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thrsp1119-play-pill">' + (en ? '▶ Load Official Video Player (19 min)' : '▶ 点击加载官方内嵌点播流（19 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thrsp1119-theater-layout">',
        '  <div class="thrsp1119-player-wrap">' + mediaInner + '</div>',
        '  <div class="thrsp1119-meta">',
        '    <span class="thrsp1119-code">THRSP1119 · ' + item.time + '</span>',
        '    <h4 class="thrsp1119-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thrsp1119-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thrsp1119-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thrsp1119-highlights">' + liHtml + '</ul>',
        '    <div class="thrsp1119-actions">',
        '      <a class="thrsp1119-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thrsp1119-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript' : '⬇ 下载官方字幕讲稿') + '</a>',
        '      <a class="thrsp1119-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THRSP1119 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThrsp1119Theater);
  } else {
    initThrsp1119Theater();
  }
})();

/* posts/from-build-to-production-harness-managed-runtime/talk-blueprint.js */
(function () {
  'use strict';

  var SCENARIOS = [
    {
      id: 'in-flow-app',
      tabZh: 'S1 · 工作流内微应用',
      tabEn: 'S1 · In-Flow Micro-App',
      stepZh: '1 · 团队协作应用（Cowork / Figma）',
      stepEn: '1 · In-Flow App (Cowork / Figma)',
      anchorZh: '场景模式一 · 个人与团队级状态化应用｜架构锚点：BRK378 + BRK382',
      anchorEn: 'Pattern 01 · Personal & Team Stateful App | Anchors: BRK378 + BRK382',
      titleZh: '从会议表格孤岛到受管应用：Work IQ 脉络建构与首日默认绿区托管',
      titleEn: 'From Spreadsheet Silos to Governed Apps: Work IQ Authoring & Default Green-Zone Hosting',
      thesisZh: '核心架构判断：无需服务器运维或漫长立项审批——让应用从诞生第一秒起脱离 localhost 落入个人托管沙盒，由平台默认接管 Entra 登录、核心连接器白名单与单环境三阶段晋升。',
      thesisEn: 'Core Architectural Decision: Eliminate server ops and upfront red tape—every app skips localhost into a personal managed sandbox with automatic Entra SSO, default green-zone connectors, and built-in Dev/Test/Prod targets.',
      stackZh: [
        '执行内核（Harness）：调用 Copilot Cowork 内置应用技能与 Figma 插件，结合 Work IQ 组织上下文直接生成标准 React/TypeScript 组件树。',
        '受管宿主（Managed Runtime）：一键发布至 managedapps 独立受管域名，经代号 Rayfin 的前沿能力挂载 Microsoft Fabric 数据库或 SharePoint 列表持久化跨会话状态。',
        '治理与成本边界（Governance & FinOps）：落入 M365 管理中心（MAC）首日默认绿区，严格 CSP 实时阻断未授权外部域名（如越界外呼 Bing），创作者用 /cost 即时查账。'
      ],
      stackEn: [
        'Harness Layer: Copilot Cowork app skill and Figma plugin pull Work IQ organizational context to emit clean React/TypeScript components.',
        'Managed Runtime Layer: Publishes to an Entra-authenticated URL backed by a Git remote, persisting cross-session state via Fabric (Rayfin) or SharePoint lists.',
        'Governance & FinOps Layer: Lands in MAC’s on-by-default green zone where strict CSP blocks unauthorized outbound calls live and /cost exposes build spend.'
      ],
      gatesZh: [
        '实证标杆（BRK378）：Q4 2026 Atlas 项目路线图几分钟内跑通构建，整场演示 0 款成品停留在 localhost 本地端口。',
        '晋升与清退闭环（BRK382）：利用单环境零配置 Dev -> Test -> Prod 目标隔离日常改码，配合周期性所有者确权自动清退闲置僵尸应用。'
      ],
      gatesEn: [
        'Empirical Proof (BRK378): Q4 2026 Atlas Roadmap ships in minutes with zero resulting apps running on localhost ports.',
        'Lifecycle Hygiene (BRK382): Built-in Dev -> Test -> Prod targets protect live users from edits while periodic owner attestation retires stale apps.'
      ],
      ruleZh: '关键边界准则：构建期连接器禁令前置注入智能体上下文，从源头杜绝耗费词元写出无法过审的代码。',
      ruleEn: 'Boundary Rule: Admin connector policies inject into the authoring agent upfront so makers never burn tokens on unshippable code.',
      links: [
        { zh: '↗ 阅读 BRK378 深度解析', en: '↗ Read BRK378 Deep Dive', href: '../ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/index.html', primary: true },
        { zh: '↗ 阅读 BRK382 规模治理', en: '↗ Read BRK382 Scale Guide', href: '../ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot/index.html', primary: false }
      ]
    },
    {
      id: 'ecosystem-relay',
      tabZh: 'S2 · 三方与全栈接力',
      tabEn: 'S2 · 3P & Pro-Dev Relay',
      stepZh: '2 · 跨生态与全栈协同（Lovable / VS Code）',
      stepEn: '2 · Cross-Tool Git Relay (Lovable / VS Code)',
      anchorZh: '场景模式二 · 业务原型交棒专业研发｜架构锚点：BRK378',
      anchorEn: 'Pattern 02 · Domain-to-Pro-Dev Co-Evolution | Anchor: BRK378',
      titleZh: '消除推倒重写断崖：共享 Git 远程源码仓、三方纯前端直发与免密接力',
      titleEn: 'Ending the Rewrite Cliff: Shared Git Remote, Zero-Data-Touch 3P Publish & Keyless VS Code Relay',
      thesisZh: '核心架构判断：低代码画布、外部生成工具与全栈 IDE 不再是割裂孤岛——五大入口围绕同一套 TypeScript/React Git 远程仓库协同演进，前端构建自由开放而企业数据读写严格锁在租户内。',
      thesisEn: 'Core Architectural Decision: Unify visual studios, external builders, and pro IDEs on one backing TypeScript/React Git remote—keeping UI authoring open while locking data access strictly inside the M365 tenant.',
      stackZh: [
        '双模应用架构（Studio Intelligent Apps）：如 Gauge 现场巡检台，顶栏用低时延行内提示词函数（Inline LLM）提炼摘要，侧栏内嵌完整 Studio 顾问智能体跨表检索 Dataverse。',
        '开放三方生态直发（Lovable SDK）：IT 管理员约 20 分钟完成工作区绑定；Lovable 仅向 CMR 推送编译后的纯 React 前端，全程零权限接触底层 Excel 或业务数据。',
        '专业研发免密演进（CLI + VS Code）：工程师通过 CLI 与 Git Credential Manager 免令牌克隆 Gauge 源码仓，在 Home.tsx 增补巡检地图并在本地开发服验证后原路推回生产。'
      ],
      stackEn: [
        'Dual-Intelligence UX: Gauge Field Inspections pairs low-latency inline LLM summaries with an embedded Studio Risk Advisor agent querying Dataverse.',
        'Open 3P Publishing (Lovable): ~20-minute admin bind lets Lovable (40,000+ orgs) push pure React UI to CMR with zero access to underlying tenant data.',
        'Keyless Pro-Dev Handoff: Engineers clone the live repo via CLI and Git Credential Manager into VS Code, add a geolocation map on a flagged dev server, and push back.'
      ],
      gatesZh: [
        '连接与构建质检（BRK378）：统一接入 1,500+ 支持单动作级开关的受管连接器；Voyage Desk 核保台发布前自动跑通 36 项构建与数据交互检查。',
        '全代码智能体扩展：支持自带模型与编排器的 Code Agents 直接托管运行并默认打通 Agent 365，免除额外 Azure 基础设施搭建。'
      ],
      gatesEn: [
        'Connector & Build Verification: 1,500+ connectors with per-action toggles; Voyage Desk passes 36 automated build checks prior to publish.',
        'Code Agents Extension: Custom code-built orchestrators deploy onto CMR with default Agent 365 wiring and zero manual Azure setup.'
      ],
      ruleZh: '关键边界准则：无论前端诞生于外部工具还是业务画布，身份登录、动作级 DLP 与 5,000 点数试点限额统一由客户租户闭环强制执行。',
      ruleEn: 'Boundary Rule: Regardless of where the React UI originates, Entra sign-in, per-action DLP, and 5,000-credit caps execute strictly inside the tenant.',
      links: [
        { zh: '↗ 阅读 BRK378 深度解析', en: '↗ Read BRK378 Deep Dive', href: '../ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/index.html', primary: true },
        { zh: '⬇ BRK378 官方 PPTX 课件', en: '⬇ BRK378 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/c5c8ac76-0384-4a0c-acf5-83488136a4f1', primary: false }
      ]
    },
    {
      id: 'deterministic-process',
      tabZh: 'S3 · 合规写操作门禁',
      tabEn: 'S3 · Policy-Gated Actions',
      stepZh: '3 · 敏感审批与多代理（Harness Hooks）',
      stepEn: '3 · Policy-Gated Loops (Harness Hooks)',
      anchorZh: '场景模式三 · 涉及金额审批与合规红线的业务智能体｜架构锚点：BRK259',
      anchorEn: 'Pattern 03 · Financial & Compliance-Critical Agents | Anchor: BRK259',
      titleZh: '在自主推理循环内钉死确定性：容器沙盒减负、动态子代理与生命周期钩子',
      titleEn: 'Embedding Determinism Inside Autonomous Loops: Container Sandboxes, Dynamic Task Agents & Hooks',
      thesisZh: '核心架构判断：绝不靠自然语言提示词“祈祷模型遵守财务制度”——用会话级 Azure 容器接管重算降本，在工具执行切点挂载百分百必跑的确定性钩子硬阻断越界写操作。',
      thesisEn: 'Core Architectural Decision: Never trust natural-language prompt wishes to enforce financial rules—offload heavy parsing to Azure containers and gate side-effecting tools with 100% deterministic lifecycle hooks.',
      stackZh: [
        'Copilot SDK 与容器沙盒：每次会话动态拉起隔离 Azure 容器（含 Shell、代码执行与本地磁盘），大体积表格落盘脚本解析，原始凭据严格隔离在外部信任层。',
        '动态任务子智能体（Dynamic Task Agents）：免发布独立子机器人，单会话内并行扇出 3 个轻量 Claude Haiku 5.5 隔离盲审供应商标书，再跨厂商拉起 Sol 挑刺复核。',
        '六类生命周期钩子与变量：Session start 预载成本中心档案；唯一拥有拦截改参权的 Before tool 钩子当场拒绝超 £2,000 采购单（continue: false），After tool 前置脱敏。'
      ],
      stackEn: [
        'Copilot SDK & Sandbox: Per-session Azure containers parse large files on local disk via CLI while keeping raw credentials isolated in the outer Trust Layer.',
        'Dynamic Task Agents: Spins up three parallel Claude Haiku 5.5 bid reviewers in isolated contexts with zero child bots to publish, plus Sol cross-provider critique.',
        'Six Hooks & Variables: Session start loads UK cost-center rules; Before tool deterministically blocks >£2,000 orders (continue: false), and Variables gate HR knowledge.'
      ],
      gatesZh: [
        '500 道离线评测实证（Sonnet 4.6）：代码分析 +47.5 pts、文件分析 +28.2 pts，凭 83%–88% 提示词缓存命中将输入词元直降 45%，工具失败自愈率达 84%–91%。',
        '自举工厂验证：微软研发团队用 32 个智能体、47 条连接与 6 个共享专家全天候自动分流故障、生成补丁并巡检账单来构建 Copilot Studio 本体。'
      ],
      gatesEn: [
        '~500-Case Benchmark (Sonnet 4.6): +47.5 pts code analysis, +28.2 pts file analysis, -45% input tokens via 83%–88% cache hits, and 84%–91% tool self-recovery.',
        'Dogfooding Proof: 32 Copilot Studio agents, 47 connections, and 6 shared helpers build, review, and audit Copilot Studio 24/7.'
      ],
      ruleZh: '关键边界准则：工作流嵌智能体是在确定性骨架里引入模型判断；Hooks 则是在自主循环固定切点强制嵌入每次必跑的确定性防线。',
      ruleEn: 'Boundary Rule: Agent nodes inject LLM judgment into deterministic flows; Hooks embed mandatory deterministic guardrails into autonomous loops.',
      links: [
        { zh: '↗ 阅读 BRK259 内核解析', en: '↗ Read BRK259 Harness Guide', href: '../ignite-2026-brk259-copilot-harness-powers-copilot-studio/index.html', primary: true },
        { zh: '⬇ BRK259 官方 PPTX 课件', en: '⬇ BRK259 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd', primary: false }
      ]
    },
    {
      id: 'tenant-finops',
      tabZh: 'S4 · 全租户规模治理',
      tabEn: 'S4 · Tenant Scale & FinOps',
      stepZh: '4 · 数千人规模化治理（PPAC + MAC + CoE）',
      stepEn: '4 · Tenant-Wide Governance & FinOps',
      anchorZh: '场景模式四 · 跨数万员工租户的双轨治理与成本透视｜架构锚点：BRK382',
      anchorEn: 'Pattern 04 · Multi-Thousand-Maker Governance & FinOps | Anchor: BRK382',
      titleZh: '护栏内规模放行：PPAC/MAC 双轨绿区、小时级异常告警与单一 OpenAPI 账本',
      titleEn: 'Scaling Without Sprawl: Dual PPAC/MAC Green Zones, Sub-Hour Alerts & OpenAPI FinOps',
      thesisZh: '核心架构判断：既不把个人草稿当《蒙娜丽莎》审批三年，也不放任默认环境沦为影子泥潭——让受管绿区成为最省力的默认路径，并将算力账单同时摊开在创作者与管理员眼前。',
      thesisEn: 'Core Architectural Decision: Make the governed path the path of least resistance—combining PPAC expert routing with MAC default safety and real-time maker-to-admin credit transparency.',
      stackZh: [
        '双轨绿区纵深协同：PPAC 用最多 25 条路由规则配高级连接器策略（封禁 SQL Delete/Update 且强制仅允许 OAuth 认证）；MAC 首日默认开启 CMR 绿区盘点全域应用（实拍 953 款）。',
        '严管晋升与小时级监控：反洗钱/KYC 等核心负载经 Git 审计与审批门禁晋升独立最小权限生产环境；Monitor 在 1 小时内捕获健康劣化直推 Teams 或 ServiceNow。',
        '双轨账本与开放管理面：Studio 顶栏点数器（88 credits）配 MAC 2.5M 全局账本（≥90% 预警）；1 份权威 OpenAPI 按月同步 REST、.NET/Python SDK、15 组 PAC CLI 与 Cowork 插件。'
      ],
      stackEn: [
        'Dual Green Zones: PPAC priority routing + OAuth-only SQL rules pair with MAC’s default green zone tracking 953 managed apps and 4 blocked apps.',
        'Hardened ALM & Sub-Hour Ops: KYC/AML workloads promote via gated pipelines while high-sensitivity Monitor alerts route to Teams or ServiceNow within 1 hour.',
        'Transparent FinOps & OpenAPI Spec: Studio live counters (88 credits) + MAC 2.5M credit ledger; one OpenAPI spec generates SDKs, 15 CLI groups, and the Cowork Admin Plugin.'
      ],
      gatesZh: [
        '诺华 77,000 人租户实证（BRK382）：在用 Copilot Studio 智能体激增 7.5×（182 升至 1,366 个），月活创作者增 2.6×（3,312 人），10 周训练营约 50% 转化投产。',
        '管理自动化降本奇迹：导入顾问打磨包后，利用 Cowork 管理插件仅耗时 30 分钟、花费约 $10 即编译出运行在 CMR 上的全栈超级 CoE 应用。'
      ],
      gatesEn: [
        'Novartis 77,000-Associate Telemetry: Active Studio agents grew 7.5× (to 1,366) and makers 2.6× (3,312 peak) with ~50% Citizen Developer cohort conversion.',
        'Admin Automation Breakthrough: Using the OpenAPI-backed Cowork Admin Plugin, Zohar compiled a modern CoE Toolkit superset app on CMR in 30 minutes for ~$10.'
      ],
      ruleZh: '关键边界准则：只要业务依赖某套软件运转，它就已处于生产状态——必须同步配齐 Purview 必读条款、Ask Mica 自助申诉与活跃度自动清退。',
      ruleEn: 'Boundary Rule: All software a business depends on is production—pair Purview-audited welcome terms and Ask Mica guidance with automated stale-asset attestation.',
      links: [
        { zh: '↗ 阅读 BRK382 深度解析', en: '↗ Read BRK382 Deep Dive', href: '../ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot/index.html', primary: true },
        { zh: '⬇ BRK382 官方 PPTX 课件', en: '⬇ BRK382 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/8698eb3b-5f0b-4284-bf98-188eb338d15e', primary: false }
      ]
    },
    {
      id: 'bounded-autonomy',
      tabZh: 'S5 · 跨天有界全自主',
      tabEn: 'S5 · Bounded Autonomy',
      stepZh: '5 · 关键业务全自主（FACS 混合状态 + 爬山）',
      stepEn: '5 · Mission-Critical Autonomy (FACS)',
      anchorZh: '场景模式五 · 跨数天关键业务免审闭环｜架构锚点：BRK285',
      anchorEn: 'Pattern 05 · Multi-Day Unreviewed Production Execution | Anchor: BRK285',
      titleZh: '凭证据挣得有界全自主：低高代码持久状态分工与六步爬山迭代闭环',
      titleEn: 'Earning Bounded Autonomy: Hybrid Low/Pro-Code Durable State & Six-Step Hill Climbing',
      thesisZh: '核心架构判断：自主权从来不是一键打开的开关——用 Microsoft Learn MCP 先定架构契约，以“Studio 专员推理 + Azure 持久状态机”承接跨天工单，靠生产反馈爬山逐个场景挣得免审执行权。',
      thesisEn: 'Core Architectural Decision: Autonomy is delegated responsibility earned one scenario at a time—ground contracts via Learn MCP, split reasoning from Azure durable state, and hill-climb live failure buckets.',
      stackZh: [
        '契约先行防瘫痪（Journey 1）：拒绝在单容器原型上盲堆界面（曾因 Cosmos DB 公网端点违例瘫痪），在 VS Code 挂载 Learn MCP 检索 CAF/WAF 规范落盘可评审 ADR。',
        '低高代码精密分工（Journey 2 FACS）：Copilot Studio 协同意图、证据合成、质量审校等 6 类专员，经 APIM 与 4 路 MCP 桥由 Durable Functions + Cosmos DB 接管跨周单案状态与超时升级。',
        '六步爬山抗幻觉闭环：摒弃“让提示词更努力思考”的无效许愿，将人工坐席改稿原因、专家量表（Rubric）与逐轮追踪工作台（Trace Studio）聚成失败分桶，经 Foundry 门禁灰度放量。'
      ],
      stackEn: [
        'Contract Before Screen (Journey 1): Wire Microsoft Learn MCP in VS Code to ground CAF/WAF ADRs upfront rather than stacking features onto fragile prototypes.',
        'Hybrid Division of Labor (Journey 2 FACS): Studio orchestrates 6 specialist roles while Azure Durable Functions + Cosmos DB hold multi-day case state behind APIM and 4 MCP bridges.',
        'Six-Step Hill Climbing: Replace wishful prompt tweaking by clustering reviewer edit reasons, SME rubrics, and Trace Studio logs into failure buckets gated by Foundry replay.'
      ],
      gatesZh: [
        '18 个月生产实证（Azure Support）：Contoso 503 故障单免问订阅号直连诊断，秒锁 09:08 部署后 0/3 健康实例，保留跨轮状态直至客户确认回滚恢复才受控关单。',
        '跨团队定责破局：全面开启逐轮追踪工作台（Trace Studio），一眼锁定连接器、APIM 网关或后端 API 责任方，同步压降词元成本与排障时延。'
      ],
      gatesEn: [
        '18-Month Production Proof: Pinpoints 0 of 3 healthy instances after a 09:08 deployment without asking Contoso for a subscription ID, holding state until rollback verifies.',
        'Cross-Team Fault Ownership: Turn-level Trace Studio ends finger-pointing across low-code connectors, APIM gateways, and backend APIs while optimizing token spend.'
      ],
      ruleZh: '两条不可逾越的授权铁律：绝不授予你无法解释的权限，绝不授予你无法撤销的权限。',
      ruleEn: 'Two Iron Rules of Delegation: Never grant authority you cannot explain, and never grant authority you cannot reverse.',
      links: [
        { zh: '↗ 阅读 BRK285 深度解析', en: '↗ Read BRK285 Deep Dive', href: '../ignite-2026-brk285-agent-works-enterprise-ready/index.html', primary: true },
        { zh: '⬇ BRK285 官方 PPTX 课件', en: '⬇ BRK285 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/048e7075-9b0a-458d-b28b-3fa6113f248b', primary: false }
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initMatrix() {
    var controls = document.querySelector('[data-sandbox-controls="abs-talk-blueprint"]');
    var stage = document.querySelector('[data-sandbox-stage="abs-talk-blueprint"]');
    if (!controls || !stage) return;

    var activeIdx = 0;

    function render() {
      var en = isEnglish();
      var item = SCENARIOS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'b2p-tabs';
      for (i = 0; i < SCENARIOS.length; i++) {
        (function (idx) {
          var sc = SCENARIOS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'b2p-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? sc.tabEn : sc.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      stage.innerHTML = '';
      var shell = document.createElement('div');
      shell.className = 'b2p-stage-shell';

      var banner = document.createElement('div');
      banner.className = 'b2p-session-banner';
      var bTitle = document.createElement('div');
      bTitle.className = 'b2p-banner-title';
      bTitle.textContent = en
        ? 'From Build to Production · Workload Architecture Decision Matrix'
        : 'From Build to Production · 五类企业负载架构选型与护栏推演台';
      var bMeta = document.createElement('div');
      bMeta.className = 'b2p-banner-meta';
      bMeta.textContent = en
        ? 'Harness (BRK259) × Managed Runtime (BRK378) × Scale & Autonomy (BRK382 / BRK285)'
        : '执行内核（BRK259）× 托管运行时（BRK378）× 规模治理与自主演进（BRK382 / BRK285）';
      banner.appendChild(bTitle);
      banner.appendChild(bMeta);
      shell.appendChild(banner);

      var bar = document.createElement('div');
      bar.className = 'b2p-timeline-bar';
      for (i = 0; i < SCENARIOS.length; i++) {
        (function (idx) {
          var segItem = SCENARIOS[idx];
          var segBtn = document.createElement('button');
          segBtn.type = 'button';
          segBtn.className = 'b2p-time-seg' + (idx === activeIdx ? ' is-active' : '');
          segBtn.textContent = en ? segItem.stepEn : segItem.stepZh;
          segBtn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          bar.appendChild(segBtn);
        })(i);
      }
      shell.appendChild(bar);

      var grid = document.createElement('div');
      grid.className = 'b2p-grid';

      var leftCard = document.createElement('div');
      leftCard.className = 'b2p-card';

      var eyebrow = document.createElement('div');
      eyebrow.className = 'b2p-eyebrow';
      eyebrow.textContent = en ? item.anchorEn : item.anchorZh;

      var actTitle = document.createElement('h4');
      actTitle.className = 'b2p-act-title';
      actTitle.textContent = en ? item.titleEn : item.titleZh;

      var quoteBox = document.createElement('blockquote');
      quoteBox.className = 'b2p-quote-box';
      var qLabel = document.createElement('span');
      qLabel.className = 'b2p-quote-label';
      qLabel.textContent = en ? 'Architectural Design Verdict' : '架构选型核心裁决';
      var qText = document.createElement('p');
      qText.className = 'b2p-quote-text';
      qText.textContent = en ? item.thesisEn : item.thesisZh;
      quoteBox.appendChild(qLabel);
      quoteBox.appendChild(qText);

      var stackList = document.createElement('ul');
      stackList.className = 'b2p-list';
      var stacks = en ? item.stackEn : item.stackZh;
      for (i = 0; i < stacks.length; i++) {
        var li = document.createElement('li');
        li.textContent = stacks[i];
        stackList.appendChild(li);
      }

      leftCard.appendChild(eyebrow);
      leftCard.appendChild(actTitle);
      leftCard.appendChild(quoteBox);
      leftCard.appendChild(stackList);

      var rightCard = document.createElement('div');
      rightCard.className = 'b2p-card';

      var proofHead = document.createElement('h5');
      proofHead.className = 'b2p-subhead';
      proofHead.textContent = en ? 'Empirical Proof & Production Release Gates' : '实证基准与生产准入门禁';

      var proofList = document.createElement('ul');
      proofList.className = 'b2p-list';
      var gates = en ? item.gatesEn : item.gatesZh;
      for (i = 0; i < gates.length; i++) {
        var pli = document.createElement('li');
        pli.textContent = gates[i];
        proofList.appendChild(pli);
      }

      var handoff = document.createElement('div');
      handoff.className = 'b2p-handoff';
      handoff.textContent = en ? item.ruleEn : item.ruleZh;

      var linksWrap = document.createElement('div');
      linksWrap.className = 'b2p-links';
      for (i = 0; i < item.links.length; i++) {
        var lk = item.links[i];
        var a = document.createElement('a');
        a.className = 'b2p-link' + (lk.primary ? ' is-primary' : '');
        a.href = lk.href;
        if (lk.href.indexOf('http') === 0) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        a.textContent = en ? lk.en : lk.zh;
        linksWrap.appendChild(a);
      }

      rightCard.appendChild(proofHead);
      rightCard.appendChild(proofList);
      rightCard.appendChild(handoff);
      rightCard.appendChild(linksWrap);

      grid.appendChild(leftCard);
      grid.appendChild(rightCard);
      shell.appendChild(grid);
      stage.appendChild(shell);
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
    document.addEventListener('DOMContentLoaded', initMatrix);
  } else {
    initMatrix();
  }
})();

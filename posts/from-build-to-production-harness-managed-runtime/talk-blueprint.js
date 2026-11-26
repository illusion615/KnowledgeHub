/* posts/from-build-to-production-harness-managed-runtime/talk-blueprint.js */
(function () {
  'use strict';

  var ACTS = [
    {
      id: 'act-1',
      slot: '11:30–11:33',
      mins: 3,
      tabZh: 'M1 · 开场破题 (3m)',
      tabEn: 'M1 · Opening Hook (3m)',
      segZh: '11:30 · 开场破题 (3m)',
      segEn: '11:30 · Hook (3m)',
      anchorZh: '第一幕 · 11:30–11:33（3 分钟）｜信源锚点：BRK378 开场 + BRK285 现场投票',
      anchorEn: 'Act 1 · 11:30–11:33 (3 min) | Anchors: BRK378 Opening + BRK285 Live Audience Poll',
      titleZh: '破除两大生产幻觉：告别 localhost 孤岛与“敢看不敢放”的原型陷阱',
      titleEn: 'Shattering Two Illusions: Escaping Localhost Silos and Unshippable Prototypes',
      quoteZh: '“写得出前端演示早已不是门槛；真正的分水岭在于你的应用能否走出个人电脑的 localhost 端口，以及你的智能体是否积累了免去逐单审批直接进生产的证据。”',
      quoteEn: '“Drafting a fluent UI or answer is no longer the bottleneck; the real divide is whether your app escapes localhost and whether your agent has earned the evidence to act in production.”',
      pointsZh: [
        '00:00–01:15 — 复现 BRK285 两次举手反差：全场大半听众搭出过能跑的智能体，却几乎无人敢免逐单审批放进生产执行动作。',
        '01:15–02:15 — 抛出 BRK378 核心观察：团队混合 Cowork、Copilot Studio、CLI 与多前沿模型准备演示，但产出的应用 0 款跑在 localhost。',
        '02:15–03:00 — 立起 30 分钟三阶主线：Build（Harness 重铸内核）➔ Host（CMR 随处受管托管）➔ Scale & Govern（规模治理与有界自主）。'
      ],
      pointsEn: [
        '00:00–01:15 — Recreate the BRK285 two-question poll: most teams have built a useful agent, yet almost none trust it unreviewed in production.',
        '01:15–02:15 — Land Clay Wesener’s BRK378 benchmark: across Cowork, Studio, CLI, and mixed frontier models, zero resulting apps ran on localhost.',
        '02:15–03:00 — Establish the 30-minute spine: Build (Copilot Harness) -> Host (Copilot Managed Runtime) -> Scale & Govern (ALM, FinOps & Autonomy).'
      ],
      proofZh: [
        '关键日期：2026 年 11 月 17 日 Copilot Managed Runtime 正式全面商用（GA）。',
        '架构先手：Microsoft Learn MCP 前置检索 CAF/WAF 规范，拒绝在脆弱单容器原型上盲堆界面（BRK285 Tim Schaeps）。'
      ],
      proofEn: [
        'Key Milestone: Copilot Managed Runtime reached General Availability on November 17, 2026.',
        'Contract First: Ground designs in CAF/WAF via Microsoft Learn MCP instead of retrofitting fragile prototypes (BRK285).'
      ],
      handoffZh: '转场提示（11:33）：既然不能在旧式聊天脚手架上打补丁，我们先掀开引擎盖，看微软如何重铸智能体执行内核。',
      handoffEn: 'Transition (11:33): Since patching chat-era scaffolding cannot cross this gap, let us open the hood on the new execution harness.',
      links: [
        { zh: '↗ 阅读 BRK378 深度拆解', en: '↗ Read BRK378 Breakdown', href: '../ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/index.html', primary: true },
        { zh: '↗ 阅读 BRK285 深度拆解', en: '↗ Read BRK285 Breakdown', href: '../ignite-2026-brk285-agent-works-enterprise-ready/index.html', primary: false }
      ]
    },
    {
      id: 'act-2',
      slot: '11:33–11:40',
      mins: 7,
      tabZh: 'M2 · Build 内核 (7m)',
      tabEn: 'M2 · Build Harness (7m)',
      segZh: '11:33 · Build 内核 (7m)',
      segEn: '11:33 · Build (7m)',
      anchorZh: '第二幕 · 11:33–11:40（7 分钟）｜信源锚点：BRK259 Alice Appleton 架构实证',
      anchorEn: 'Act 2 · 11:33–11:40 (7 min) | Anchor: BRK259 Copilot Harness Deep Dive',
      titleZh: 'Build 层换代：Copilot SDK 单循环、Azure 容器沙盒与六类确定性钩子',
      titleEn: 'Build Layer: Copilot SDK Single Loop, Azure Containers & Six Lifecycle Hooks',
      quoteZh: '“如果工作流嵌智能体是在确定性骨架里引入大模型判断，那么生命周期钩子（Hooks）恰恰相反——它是在自主推理循环的固定切点，钉死百分百必跑的确定性防线。”',
      quoteEn: '“Whereas agent nodes inject LLM judgment into deterministic flows, Hooks embed deterministic guardrails into fixed lifecycle points of an autonomous agent.”',
      pointsZh: [
        '03:00–05:15 — 拆解弃旧立新：告别 2023 串行切分提示词底座，与 GitHub、Foundry、Cowork、Copilot Code 共用 Microsoft Copilot SDK + 会话级 Azure 容器沙盒。',
        '05:15–07:30 — 亮出 500 道离线评测硬账单（Sonnet 4.6）：代码分析 +47.5 pts、文件分析 +28.2 pts，依托 83%–88% 提示词缓存命中将输入词元直降 45%。',
        '07:30–10:00 — 双实机杀手锏：Dynamic Task Agents 并行拉起 3 个 Haiku 5.5 盲审标书并用 Sol 挑刺；Before tool 钩子硬阻断超 £2,000 采购单（continue: false）。'
      ],
      pointsEn: [
        '03:00–05:15 — Explain the fork: retiring the 2023 chat harness for the shared 5-product Microsoft Copilot SDK plus per-session Azure container sandboxes.',
        '05:15–07:30 — Present the ~500-case Sonnet 4.6 benchmark: +47.5 pts code analysis, +28.2 pts file analysis, and -45% input tokens via 83%–88% cache hits.',
        '07:30–10:00 — Dual mechanics: Dynamic Task Agents fan out 3 parallel Haiku 5.5 bid reviewers + Sol critique; Before tool hook blocks >£2,000 POs deterministically.'
      ],
      proofZh: [
        '内部自举规模：Copilot Studio 研发团队用 32 个智能体、47 条连接与 6 个共享专家全天候构建自身产品。',
        '工具自愈率：84%–91% 的工具失败回合在单循环内自主重算恢复；Auto 选模覆盖 Anthropic、OpenAI、Mistral 与 SpaceXAI。'
      ],
      proofEn: [
        'Dogfooding Scale: 32 Copilot Studio agents, 47 connections, and 6 shared helpers build and ship Copilot Studio 24/7.',
        'Resilience: 84%–91% autonomous recovery on failed tool turns; Auto Pareto routing across Anthropic, OpenAI, Mistral & SpaceXAI.'
      ],
      handoffZh: '转场提示（11:40）：内核跑稳之后，业务专家与全栈研发在五花八门的工具里写出的应用，究竟该往哪里部署？进入主讲核心 BRK378。',
      handoffEn: 'Transition (11:40): Once the reasoning engine is solid, where do apps authored across five different tools actually run? Enter lead session BRK378.',
      links: [
        { zh: '↗ 阅读 BRK259 深度拆解', en: '↗ Read BRK259 Breakdown', href: '../ignite-2026-brk259-copilot-harness-powers-copilot-studio/index.html', primary: true },
        { zh: '⬇ BRK259 官方 PPTX 讲义', en: '⬇ BRK259 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd', primary: false }
      ]
    },
    {
      id: 'act-3',
      slot: '11:40–11:49',
      mins: 9,
      tabZh: 'M3 · Host 托管主讲 (9m)',
      tabEn: 'M3 · Host CMR Lead (9m)',
      segZh: '11:40 · Host 托管 (9m)',
      segEn: '11:40 · Host CMR (9m)',
      anchorZh: '第三幕（核心主讲） · 11:40–11:49（9 分钟）｜信源锚点：BRK378 Clay Wesener / Emma Cooper / Lovable',
      anchorEn: 'Act 3 (Core Lead) · 11:40–11:49 (9 min) | Anchor: BRK378 Copilot Managed Runtime GA',
      titleZh: 'Host 层收口：五大入口汇聚单一 Git 远程仓、Lovable 零数据外泄与 VS Code 接力',
      titleEn: 'Host Layer: Five Entry Surfaces on One Git Repo, Lovable Zero-Data-Touch & VS Code Relay',
      quoteZh: '“低代码与生成式原型不再意味着推倒重写的能力断崖——五大构建入口背后共享同一个标准 TypeScript/React Git 远程仓库，且构建智能体在动笔前就已知晓租户合规红线。”',
      quoteEn: '“Prototyping no longer ends at a rewrite cliff—all five authoring surfaces commit clean TypeScript/React to one backing Git remote while respecting admin policies before writing a line of code.”',
      pointsZh: [
        '10:00–13:00 — 工作流内智能跃迁：Cowork 调取 Work IQ 与 Figma 插件秒建 Atlas 路线图并经 Rayfin 落盘 Fabric；Studio 托管 Gauge 巡检应用（行内摘要 + 风险顾问智能体双驱动）。',
        '13:00–16:00 — 开放三方生态实证：服务 40,000+ 企业与 7,000 万项目的 Lovable 约 20 分钟绑入租户，仅直发纯 React 前端至 CMR，全程零权限触碰企业业务数据。',
        '16:00–19:00 — 消除研发断崖：全栈工程师用 CLI + Git Credential Manager 免密钥克隆 Gauge 仓库至 VS Code，新增巡检地图并在本地开发服验证后一键推回共享受管域名。'
      ],
      pointsEn: [
        '10:00–13:00 — In-flow apps: Cowork grounds in Work IQ + Figma plugin with Fabric (Rayfin) persistence; Studio hosts Gauge Inspections pairing inline LLM summaries with a specialist agent.',
        '13:00–16:00 — Open 3P ecosystem: Lovable (40,000+ orgs, 70M+ projects) binds in ~20 minutes and ships pure React UI to CMR with zero access to underlying tenant data.',
        '16:00–19:00 — Zero-cliff pro-dev relay: CLI + Git Credential Manager clones the live React/TS repo keyless into VS Code to add a geolocation map and push straight back to production.'
      ],
      proofZh: [
        '数据与连接底座：预置 1,500+ 受管连接器，支持细化至单动作级开关；Voyage Desk 演示自动跑通 36 项构建检查。',
        '扩展三连发（11月17日）：本地 Git 源码化智能体（公测）、Code Agents 默认通 A365（早鸟预览）、Fabric Rayfin 持久库（前沿预览）。'
      ],
      proofEn: [
        'Data Backbone: 1,500+ governed connectors with per-action toggles; Voyage Desk passes 36 automated build checks pre-publish.',
        'Nov 17 Companion Drops: Local Git-backed Studio agents (Preview), Code Agents with default A365, and Fabric Rayfin persistence.'
      ],
      handoffZh: '转场提示（11:49）：当全公司几千名创作者同时在五种工具里点发布，CIO 与 CISO 怎样睡个安稳觉？切入规模化治理与算力账本。',
      handoffEn: 'Transition (11:49): When thousands of makers publish across five tools at once, how do CIOs and CISOs keep order and budget control?',
      links: [
        { zh: '↗ 阅读 BRK378 深度拆解', en: '↗ Read BRK378 Breakdown', href: '../ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/index.html', primary: true },
        { zh: '⬇ BRK378 官方 PPTX 讲义', en: '⬇ BRK378 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/c5c8ac76-0384-4a0c-acf5-83488136a4f1', primary: false }
      ]
    },
    {
      id: 'act-4',
      slot: '11:49–11:56',
      mins: 7,
      tabZh: 'M4 · Scale 治理 (7m)',
      tabEn: 'M4 · Scale & Govern (7m)',
      segZh: '11:49 · Scale 治理 (7m)',
      segEn: '11:49 · Scale (7m)',
      anchorZh: '第四幕 · 11:49–11:56（7 分钟）｜信源锚点：BRK382 Zohar Raz / Ryan Jansen / 诺华实战 + BRK378',
      anchorEn: 'Act 4 · 11:49–11:56 (7 min) | Anchors: BRK382 Novartis & Managed Host + BRK378 Admin',
      titleZh: 'Scale & Govern：诺华 7.5 倍扩张、双轨绿区、CSP 实时拦截与 $10 超级 CoE',
      titleEn: 'Scale & Govern: Novartis 7.5× Surge, Dual Green Zones, CSP Blocking & the $10 CoE App',
      quoteZh: '“只要业务依赖某套软件运转，那它就已经处于生产状态——让合规路径成为最省力的默认路径，才能既不把草稿当《蒙娜丽莎》设卡，也不放任默认环境失控。”',
      quoteEn: '“All software a business depends on is production—making the governed path the path of least resistance scales grassroots innovation without shadow sprawl.”',
      pointsZh: [
        '19:00–21:30 — 诺华 77,000 人租户实证：在用 Copilot Studio 智能体激增 7.5×（182 升至 1,366 个）、月活创作者增 2.6×（峰值 3,312 人），靠周期性所有者确权清退僵尸资产。',
        '21:30–24:00 — 双轨绿区与宿主拦截：PPAC 环境路由配 OAuth 级 SQL 管控；CMR 在 M365 管理中心默认开启首日绿区（实机盘点 492 / 953 款应用），Managed Host 凭严格 CSP 当场掐断越界 Bing 外呼。',
        '24:00–26:00 — 阶梯 ALM、小时级告警与开放管理面：单环境三阶段晋升企业严管流水线，Monitor <1 小时告警直推 ServiceNow；单一 OpenAPI 驱动 Cowork 花 $10、30 分钟生成托管超级 CoE。'
      ],
      pointsEn: [
        '19:00–21:30 — Novartis 77,000-associate proof: active Studio agents grew 7.5× (182 to 1,366) and makers 2.6× (3,312 peak), kept clean via periodic owner attestation.',
        '21:30–24:00 — Dual green zones & runtime CSP: PPAC OAuth-only SQL rules + CMR on-by-default green zone in MAC (492 / 953 apps tracked) blocking unauthorized outbound calls live.',
        '24:00–26:00 — Tiered ALM, <1h Monitor alerts & OpenAPI FinOps: 5,000-credit pilot caps, 2.5M MAC credit ledger, and building a full CoE app in 30 minutes for ~$10.'
      ],
      proofZh: [
        '双轨计费透视：创作者顶栏直看点数（如 88 credits）或敲 /cost 查账；MAC 统管 1.5M 预付 + 1M 按量及 ≥90% 阈值预警。',
        '管理自动化工具链：1 份权威 OpenAPI 按月同步生成 REST、.NET/Python SDK、Admin V2 连接器、15 组 PAC CLI 与 Cowork 插件。'
      ],
      proofEn: [
        'Transparent FinOps: Live maker credit counter (88 credits) and /cost command paired with MAC 2.5M credit overview and ≥90% alerts.',
        'Monthly Synchronized Tooling: One OpenAPI spec generates REST docs, .NET/Python SDKs, Admin V2 connector, 15 PAC CLI groups & Cowork plugin.'
      ],
      handoffZh: '转场提示（11:56）：最后 4 分钟，回答最硬核的一跳——应用与智能体上线后遇到真实故障和幻觉，怎么挣得真正的全自主权？',
      handoffEn: 'Transition (11:56): Final 4 minutes—once hosted and governed, how does an agent earn true production autonomy when live hallucinations strike?',
      links: [
        { zh: '↗ 阅读 BRK382 深度拆解', en: '↗ Read BRK382 Breakdown', href: '../ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot/index.html', primary: true },
        { zh: '⬇ BRK382 官方 PPTX 讲义', en: '⬇ BRK382 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/8698eb3b-5f0b-4284-bf98-188eb338d15e', primary: false }
      ]
    },
    {
      id: 'act-5',
      slot: '11:56–12:00',
      mins: 4,
      tabZh: 'M5 · 生产自主收官 (4m)',
      tabEn: 'M5 · Prod Autonomy (4m)',
      segZh: '11:56 · 生产收官 (4m)',
      segEn: '11:56 · Close (4m)',
      anchorZh: '第五幕 · 11:56–12:00（4 分钟）｜信源锚点：BRK285 Azure Support FACS 18 个月实战',
      anchorEn: 'Act 5 · 11:56–12:00 (4 min) | Anchor: BRK285 Azure Support 18-Month FACS Playbook',
      titleZh: '挣得有界自主权：低高代码持久状态分工、六步爬山闭环与周一行动清单',
      titleEn: 'Earning Bounded Autonomy: Hybrid Durable State, Six-Step Hill Climbing & Action Checklist',
      quoteZh: '“自主权从来不是一键打开的开关，而是凭证据逐个场景挣来的责任委派——绝不授予你无法解释的权限，绝不授予你无法撤销的权限。”',
      quoteEn: '“Autonomy is never a switch you flip on—it is delegated responsibility earned one scenario at a time: never grant authority you cannot explain, and never grant authority you cannot reverse.”',
      pointsZh: [
        '26:00–27:30 — 低高代码精密分工（Azure FACS 架构）：Copilot Studio 编排 6 类专职推理角色，Azure Durable Functions + Cosmos DB 经 4 路 MCP 桥接管跨天工单状态（秒锁 09:08 部署 0/3 健康实例）。',
        '27:30–29:00 — 直面线上幻觉的六步爬山法：告别“让提示词更努力思考”的许愿，把人工改稿原因、专家量表（Rubric）与逐轮追踪聚成失败分桶，经 Foundry 门禁回归放量。',
        '29:00–30:00 — 收束 ABS 方案构建三步落地清单：核对 MAC 默认绿区与 5,000 点试点账本 ➔ 打通 Git/Lovable 受管托管闭环 ➔ 按 3×6 控制矩阵逐场景放行有界自主。'
      ],
      pointsEn: [
        '26:00–27:30 — Hybrid division of labor (Azure FACS): Studio orchestrates 6 specialist reasoning roles while Durable Functions + Cosmos DB hold multi-day case state via 4 MCP bridges.',
        '27:30–29:00 — Six-step hill climbing over wishful prompting: turn reviewer edit reasons, SME rubrics, and turn traces into failure buckets gated by Foundry replay.',
        '29:00–30:00 — Land the ABS takeaway checklist: baseline MAC green zone & 5K credit cap -> unify Git/3P hosting on CMR -> unlock bounded autonomy per 3×6 control matrix.'
      ],
      proofZh: [
        '18 个月演进标尺：快速试验（100% 人工复核）➔ 企业就绪（影子运行与最小权限）➔ 有界全自主（单场景达标免审 + 超时自动回滚升级）。',
        '组织协同破局：全面开启逐轮追踪工作台（Trace Studio），终结低代码、APIM 网关与后端 API 团队间的跨部门故障推诿。'
      ],
      proofEn: [
        '18-Month Progression: Experiment (100% HITL) -> Enterprise-Ready (shadow runs & scoped identity) -> Bounded Autonomous (per-scenario gate + rollback).',
        'Org Alignment: Turn-level Trace Studio eliminates cross-team finger-pointing across connectors, APIM gateways, and backend services.'
      ],
      handoffZh: '压轴收尾（12:00 准点）：开放内部方案构建答疑，引导团队按四场原版课件与知识库关联专场对号入座。',
      handoffEn: 'Closing Bell (12:00 sharp): Open ABS Q&A and point solution architects directly to the four linked Ignite 2026 deep dives.',
      links: [
        { zh: '↗ 阅读 BRK285 深度拆解', en: '↗ Read BRK285 Breakdown', href: '../ignite-2026-brk285-agent-works-enterprise-ready/index.html', primary: true },
        { zh: '⬇ BRK285 官方 PPTX 讲义', en: '⬇ BRK285 Official PPTX', href: 'https://medius.microsoft.com/video/asset/PPT/048e7075-9b0a-458d-b28b-3fa6113f248b', primary: false }
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBlueprint() {
    var controls = document.querySelector('[data-sandbox-controls="abs-talk-blueprint"]');
    var stage = document.querySelector('[data-sandbox-stage="abs-talk-blueprint"]');
    if (!controls || !stage) return;

    var activeIdx = 0;

    function render() {
      var en = isEnglish();
      var act = ACTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'b2p-tabs';
      for (i = 0; i < ACTS.length; i++) {
        (function (idx) {
          var item = ACTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'b2p-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? item.tabEn : item.tabZh;
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
        ? 'Ignite 2026 | ABS Internal Sharing · Session 08 [Solution Build Track]'
        : 'Ignite 2026 | ABS 内部分享安排 · 第 08 场【方案构建板块】';
      var bMeta = document.createElement('div');
      bMeta.className = 'b2p-banner-meta';
      bMeta.textContent = en
        ? 'Speaker: Wells Zhang · Mon Dec 7, 11:30–12:00 (30 min) · BRK378 + BRK259 / BRK382 / BRK285'
        : '主讲人：Wells Zhang · 12月7日 周一 11:30–12:00（30 分钟）· BRK378 主讲 + BRK259 / BRK382 / BRK285';
      banner.appendChild(bTitle);
      banner.appendChild(bMeta);
      shell.appendChild(banner);

      var bar = document.createElement('div');
      bar.className = 'b2p-timeline-bar';
      for (i = 0; i < ACTS.length; i++) {
        (function (idx) {
          var segItem = ACTS[idx];
          var segBtn = document.createElement('button');
          segBtn.type = 'button';
          segBtn.className = 'b2p-time-seg' + (idx === activeIdx ? ' is-active' : '');
          segBtn.textContent = en ? segItem.segEn : segItem.segZh;
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
      eyebrow.textContent = en ? act.anchorEn : act.anchorZh;

      var actTitle = document.createElement('h4');
      actTitle.className = 'b2p-act-title';
      actTitle.textContent = en ? act.titleEn : act.titleZh;

      var quoteBox = document.createElement('blockquote');
      quoteBox.className = 'b2p-quote-box';
      var qLabel = document.createElement('span');
      qLabel.className = 'b2p-quote-label';
      qLabel.textContent = en ? 'Verbatim Speaker Soundbite' : '本幕演讲核心金句（可直接上台口播）';
      var qText = document.createElement('p');
      qText.className = 'b2p-quote-text';
      qText.textContent = en ? act.quoteEn : act.quoteZh;
      quoteBox.appendChild(qLabel);
      quoteBox.appendChild(qText);

      var beatList = document.createElement('ul');
      beatList.className = 'b2p-list';
      var beats = en ? act.pointsEn : act.pointsZh;
      for (i = 0; i < beats.length; i++) {
        var li = document.createElement('li');
        li.textContent = beats[i];
        beatList.appendChild(li);
      }

      leftCard.appendChild(eyebrow);
      leftCard.appendChild(actTitle);
      leftCard.appendChild(quoteBox);
      leftCard.appendChild(beatList);

      var rightCard = document.createElement('div');
      rightCard.className = 'b2p-card';

      var proofHead = document.createElement('h5');
      proofHead.className = 'b2p-subhead';
      proofHead.textContent = en ? 'Hard Empirical Proof & Slide Anchors' : '官方硬核论据与实机数据锚点';

      var proofList = document.createElement('ul');
      proofList.className = 'b2p-list';
      var proofs = en ? act.proofEn : act.proofZh;
      for (i = 0; i < proofs.length; i++) {
        var pli = document.createElement('li');
        pli.textContent = proofs[i];
        proofList.appendChild(pli);
      }

      var handoff = document.createElement('div');
      handoff.className = 'b2p-handoff';
      handoff.textContent = en ? act.handoffEn : act.handoffZh;

      var linksWrap = document.createElement('div');
      linksWrap.className = 'b2p-links';
      for (i = 0; i < act.links.length; i++) {
        var lk = act.links[i];
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
    document.addEventListener('DOMContentLoaded', initBlueprint);
  } else {
    initBlueprint();
  }
})();

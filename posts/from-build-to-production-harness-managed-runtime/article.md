---
title: From Build to Production：Harness 执行内核与 Copilot 托管运行时企业级架构解析 || From Build to Production: Harness Kernel & Copilot Managed Runtime Architecture
eyebrow: Microsoft Ignite 2026 · 企业应用与智能体投产工程专题 || Microsoft Ignite 2026 · Enterprise App & Agent Production Architecture
brand: Study Room Power Platform & Copilot Studio || Study Room Power Platform & Copilot Studio
date: 2026-11-26
topic: ignite-2026
tags:
  - Microsoft Ignite 2026
  - Copilot Managed Runtime
  - Microsoft Copilot Harness
  - BRK378
  - BRK259
  - BRK382
  - BRK285
relations:
  - ignite-2026-brk378-host-apps-anywhere-new-copilot-managed
  - ignite-2026-brk259-copilot-harness-powers-copilot-studio
  - ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot
  - ignite-2026-brk285-agent-works-enterprise-ready
strict_i18n: true
strict_density: true
summary: 拆解企业应用与智能体跨越原型孤岛与投产断层的工程路径：从 Microsoft Copilot Harness 容器内核换代、Copilot Managed Runtime 统一托管，到双轨绿区账本与有界自主爬山闭环。 || Traces how enterprise apps and agents cross from prototype silos to production: Microsoft Copilot Harness containers, Copilot Managed Runtime Git hosting, dual green-zone FinOps, and hill-climbed bounded autonomy.
lead: 生成式编码与对话工具已经把“搭出一个可演示界面或能对答的机器人”压缩到几分钟，但绝大多数企业项目仍停在构建（Build）与生产（Production）的断层前 [1][7]。一边是跑在个人电脑本地端口上、缺乏统一登录与合规审批的微应用孤岛；另一边是回答流畅、却无人敢免去人工逐单复核直接放进生产环境执行写操作的智能体 [1][7]。Microsoft Ignite 2026 四场相互咬合的核心专场补齐了这套生产拼图：BRK378 与 BRK259 重构了托管运行时与执行内核；BRK382 与 BRK285 给出了规模治理与有界放权路径 [1][3][5][7]。 || Generative coding and chat tools have compressed drafting a working interface or bot into minutes, yet most enterprise initiatives still stall between Build and Production [1][7]. Micro-apps sit trapped on laptop `localhost` ports without corporate sign-on or governed connectors, while fluent agent prototypes still require manual review before executing production writes [1][7]. At Microsoft Ignite 2026, four interlocking disclosures closed this gap: BRK378 and BRK259 rebuilt the managed host and execution kernel; BRK382 and BRK285 delivered tenant-scale FinOps and hill-climbed bounded autonomy [1][3][5][7].
panel_label: 议题核心工程判断 || Core Architectural Thesis
panel_title: 内核重铸解决“算得稳且管得住”，受管运行时解决“随处写且零孤岛” || Rebuild the Harness for Bounded Reasoning; Unify the Runtime to End Hosting Silos
panel_desc: 从构建走向生产不能靠补几条提示词，而要用容器化单循环内核、Git 托管宿主、默认绿区账本与爬山评测门禁重构底座 [1][3][5][7]。 || Crossing from build to production replaces prompt band-aids with containerized agent loops, Git-backed managed hosting, default green-zone FinOps, and hill-climbing release gates [1][3][5][7].
panel:
  - 执行内核换代（Copilot Harness） — 基于 Copilot SDK 与会话级 Azure 容器重铸，代码分析涨 47.5 个百分点、输入词元省 45%，六类钩子锁住确定性边界 [3][4] || Execution Kernel: Copilot Harness — Rebuilt on Microsoft Copilot SDK and Azure containers, lifting code analysis +47.5 pts and cutting input tokens 45% under six deterministic hooks [3][4]
  - 随处构建统一托管（Managed Runtime） — 五大入口共写同一套 React/TS Git 远程仓并接入 1,500+ 连接器，Lovable 纯前端直发不碰企业数据，VS Code 免密克隆直接接力 [1][2] || Universal Host: Managed Runtime — Five authoring surfaces share one React/TS Git remote and 1,500+ connectors, pairing zero-data-touch Lovable deploys with keyless VS Code relay [1][2]
  - 规模治理与有界自主（Scale & Autonomy） — 诺华活跃智能体增 7.5×、10 美元 30 分钟生成超级 CoE，配合低高代码持久状态分工与六步爬山闭环逐场景挣得免审执行权 [5][6][7][8] || Scale, FinOps & Autonomy — Combines Novartis's 7.5× agent growth and $10 30-minute CoE app with hybrid durable state and 6-step hill climbing for bounded autonomy [5][6][7][8]
metrics:
  - 新内核代码分析与词元实测 || Harness Gain & Token Cut | +47.5 pts / -45% | BRK259 约 500 道真实业务流程离线评测（Sonnet 4.6），83%–88% 输入词元命中缓存 [3][4][9] || Across ~500 customer offline evals on Sonnet 4.6 with 83%–88% prompt cache hit rates (BRK259) [3][4][9]
  - 受管连接器与生态覆盖 || Connectors & Ecosystem | 1,500+ / 40,000+ | BRK378 预置 1,500+ 动作级连接器，20 分钟绑定服务 4 万余家企业的 Lovable 平台且零数据外泄 [1][2] || 1,500+ per-action governed connectors plus 20-minute Lovable bind across 40,000+ orgs with zero data exposure (BRK378) [1][2]
  - 诺华规模与自主演进周期 || Novartis Scale & FACS Span | 7.5× / 18 个月 || 7.5× / 18 Months | BRK382 诺华在用智能体达 1,366 个；BRK285 Azure 支持排障历时 18 个月落地有界全自主 [5][7] || Novartis reached 1,366 active agents (BRK382); Azure Support matured autonomous resolution over 18 months (BRK285) [5][7]
style:
  accent: "#ea580c"
  teal: "#0d8f8c"
---

## #production-chasms 01 / Four Production Chasms :: 为什么“能跑通的原型”进不了生产：横亘在构建与投产之间的四道工程断层 || Why Working Prototypes Stall: Four Engineering Chasms Between Build and Production

企业应用与智能体的“构建（Build）”与“投产（Production）”遵循截然不同的评判标准 [7]。BRK285 开场做了两次现场举手投票：会场里绝大多数团队都搭出过能给出实用回答的智能体；追问“谁敢免去人工逐单审批、直接放它进生产系统执行动作”时，举手者寥寥无几 [7]。Azure 云运营需求工程团队（CODE）首席客户工程经理 Omprakash Reddy Adudodla 一语道破症结：演示原型只验证点子能不能跑通；生产系统追问的是当外部接口超时、跨天状态中断或推理漂移时，企业能否看清、管住并安全回滚 [7][8]。 || Enterprise *Build* and *Production* obey fundamentally different rules [7]. Two live audience polls at the opening of BRK285 exposed the gap: most attendees had built an agent that gave useful answers; almost none trusted it to run production actions without step-by-step human approval [7]. Azure CODE Principal Customer Engineering Manager Omprakash Reddy Adudodla pinpointed why: a prototype asks whether an idea works, whereas production asks whether teams can observe, govern, and safely roll back when tools time out or reasoning drifts [7][8].

不少团队还把投产误当成在一天搭出的单容器原型上继续堆功能 [7]。合作伙伴解决方案架构师 Tim Schaeps 复盘“订单到回款（Order-to-Cash）”原型时展示了这一隐患：团队连续提交代码往单容器里塞新特性，直到接入 Azure Cosmos DB 触碰租户“严禁公网端点”的安全红线而当场瘫痪 [7]。企业项目卡在投产前，根源在于传统开发栈在四个层面同时出现了断层 [1][3][5][7]： || Many teams also mistake productionization for stacking UI features onto a one-day single-container prototype [7]. Replaying an *Order-to-Cash* commit history, Partner Solution Architect Tim Schaeps showed features piling up until adding Azure Cosmos DB hit a tenant policy forbidding public endpoints and halted deployment [7]. Enterprise initiatives stall because legacy stacks fracture across four distinct layers [1][3][5][7]:

| 生产断层维度 || Production Chasm | 原型期的常见假象与反模式 || Prototype Illusion & Anti-Pattern | 推向企业生产时的真实工程崩塌 || What Breaks at Enterprise Production | 对应的平台级破局支点 || Platform Architectural Answer |
| --- | --- | --- | --- |
| **1. 推理与控制断层** || **1. Reasoning & Control Gap** | 靠 2023 年串行拆分提示词底座拼凑流程，或靠自然语言提示词“祈祷模型别违规” [3] || Patching 2023 sequential prompt scaffolding or trusting prompt wishes for compliance [3] | 模型看不见全局业务目标，遇数万行表格塞爆上下文；缺少百分百触发的调用前拦截机制 [3][4] || Blind to holistic goals, chokes on large tabular files, and lacks deterministic pre-tool blocking [3][4] | **Microsoft Copilot Harness**：Copilot SDK 单循环 + 会话级 Azure 容器沙盒 + 六类确定性钩子（BRK259）[3][4] || **Microsoft Copilot Harness**: Copilot SDK loop + per-session Azure containers + 6 deterministic hooks (BRK259) [3][4] |
| **2. 宿主与接力断层** || **2. Hosting & Handoff Cliff** | 自然语言生成微应用跑在个人电脑 `localhost` 端口；业务原型交棒研发时无干净源码 [1] || AI-generated apps trapped on laptop `localhost`; domain prototypes hit a pro-code rewrite cliff [1] | 无 Entra 单点登录与合规连接器；事后才发现用了禁用数据源，全栈工程师被迫推倒重写 [1][2] || No Entra SSO or governed connectors; prohibited connectors discovered late force full rewrites [1][2] | **Copilot Managed Runtime（CMR）**：零 `localhost` 托管、构建期策略前置与共享 Git 远程源码仓（BRK378）[1][2] || **Copilot Managed Runtime**: Zero-localhost host, build-time policy context & shared Git remote (BRK378) [1][2] |
| **3. 规模与账本断层** || **3. Sprawl & FinOps Blindness** | 要么像审《蒙娜丽莎》一样卡死每份草稿，要么放任数千人混居默认环境野蛮生长 [5] || Either gating every draft like the *Mona Lisa* or letting thousands crowd an unguarded default environment [5] | 无主僵尸资产泛滥、私调外部未授权接口，且创作者与 IT 均看不清实时算力点数账单 [5][6] || Orphaned zombie sprawl, unauthorized outbound API calls, and opaque Copilot Credit bills [5][6] | **双轨绿区与开放管理面**：PPAC 路由 + MAC 首日默认绿区 CSP + 单一 OpenAPI 账本与 `\$10` CoE（BRK382）[5][6] || **Dual Green Zones & FinOps**: PPAC routing + MAC default CSP + OpenAPI ledger & `\$10` CoE app (BRK382) [5][6] |
| **4. 状态与信任断层** || **4. State & Autonomy Gap** | 以为配好工具就能一键开启“全自主”，上线出现幻觉后只会在提示词里写“请更努力思考” [7] || Treating autonomy as an on/off switch and fighting live hallucinations with "think harder" prompts [7] | 跨数天复杂工单在长会话中丢状态；针对错误资源写出流畅诊断反而掩盖幻觉并引发跨团队推诿 [7][8] || Multi-day cases drop state; fluent prose about the wrong resource hides hallucinations and sparks finger-pointing [7][8] | **混合持久状态与爬山闭环**：Studio 专员推理 + Durable Functions 状态机 + 逐轮追踪与六步爬山（BRK285）[7][8] || **Hybrid State & Hill Climbing**: Studio specialists + Durable Functions state + Trace Studio & 6-step evals (BRK285) [7][8] |

这四道断层说明“Harness（执行内核）”与“Managed Runtime（托管运行时）”缺一不可。缺少容器化推理内核与确定性钩子，上云的应用只是脆弱的聊天外壳；缺少统一接管身份、Git 源码、网络沙盒与点数账本的托管运行时，再强的内核也走不出员工的个人电脑 [1][3][5]。图 1 展示了两大支柱如何与租户治理及爬山评测咬合为三层生产架构 [1][3][5][7]： || These four chasms show why **Harness** and **Managed Runtime** belong together. Without a containerized reasoning kernel and deterministic hooks, a cloud app stays a brittle chat wrapper. Without a managed runtime governing identity, Git source, network sandboxes, and credit ledgers, even the strongest harness stays trapped on a laptop [1][3][5]. Figure 1 maps how both pillars connect with tenant governance and hill-climbing evaluations across three planes [1][3][5][7]:

:::figure { src: "./media/build-to-prod-four-session-topology.figure.json", title: "From Build to Production：Harness 执行内核、Copilot 托管运行时与规模治理全栈拓扑 || From Build to Production: Harness Kernel, Copilot Managed Runtime & Scale Topology" }
图 1：顶层由 Microsoft Copilot Harness 单循环容器内核、六类确定性钩子与构建期前置策略统一承接五大创作入口（BRK259/BRK378）；中层收口至共享 Git 远程仓库、1,500+ 受管连接器与低高代码混合持久底座（BRK378/BRK285）；底层依靠 Microsoft 365 管理中心默认绿区、单一 OpenAPI 算力账本与六步爬山闭环保障规模化投产（BRK382/BRK285）[1][3][5][7]。 || Figure 1: Top plane unites five policy-aware entry surfaces on the Microsoft Copilot Harness and lifecycle hooks (BRK259/BRK378); middle plane converges on one Git remote, 1,500+ connectors, and hybrid durable state (BRK378/BRK285); bottom plane enforces Microsoft 365 default green zones, OpenAPI FinOps, and 6-step hill climbing (BRK382/BRK285) [1][3][5][7].
:::

## #copilot-harness-kernel 02 / Kernel: Microsoft Copilot Harness :: 执行内核重铸：用容器化单循环与确定性钩子替代对话脚手架 || Rebuilding the Execution Kernel: Containerized Agent Loops and Deterministic Hooks

跨越第一道断层，首先要淘汰 2023 年初为弥补早期模型短板而设计的“串行对话脚手架（Standard Harness）” [3]。Copilot Studio 首席产品经理 Alice Appleton 在 BRK259 中指出，旧底座强行将复杂请求切碎为固定串行子提示词。这虽压低了单步开销，却让模型看不见完整业务目标，遇到数万行财务表格便卡死 [3][4]。微软工程团队放弃修补旧框架，基于 GitHub、Microsoft Foundry、Copilot Cowork 与 Copilot Code 共用的 **Microsoft Copilot SDK** 从零重写内核 [3][4]。新内核剥离了纯研发提示词，补齐跨部门业务流程语义，并在每次会话启动时动态拉起专属 **Azure 隔离容器（Execution Sandbox）** [3][4]。 || Crossing the first chasm starts by retiring the 2023 chat-era *Standard harness* [3]. Copilot Studio Principal Product Manager Alice Appleton explained in BRK259 that splitting user requests into rigid sequential sub-prompts blinded the model to overall business goals and choked on multi-thousand-row spreadsheets [3][4]. Rather than patching legacy scaffolding, Microsoft rebuilt from scratch on the shared five-product **Microsoft Copilot SDK** [3][4]. Engineers stripped pure coding prompt fragments, added cross-department process semantics, and spun up an isolated **Azure container sandbox** with shell, code execution, and local disk on every session [3][4].

容器化内核让智能体能把大文件落盘并用脚本逐行解析，也打破了“多步自主循环必然烧穿预算”的顾虑 [3][9]。团队在约 **500 道真实客户流程离线评测集**上统一固定 Claude Sonnet 4.6 测试：容器命令行接管了确定性切片重算，配合单循环增量上下文拼接，新内核在四类业务能力全线提升的同时，把最昂贵的 **输入词元**（Input Tokens）消耗直接砍掉 **45%** [3][4][9]： || Container sandboxes let agents parse massive exports on local disk via scripts while disproving the fear that multi-turn loops multiply token bills [3][9]. Tested on **~500 customer-derived offline evaluations** held constant on Claude Sonnet 4.6, container scripts and incremental context assembly lifted pass rates across all four categories and cut **input token consumption by 45%** [3][4][9]:

$$
\begin{aligned}
\Delta Q_{\text{code}} &= +47.5\text{ pts}, & \Delta Q_{\text{file}} &= +28.2\text{ pts}, & \Delta T_{\text{input}} &= -45.0\% \\
R_{\text{cache}} &\in [83\%,\, 88\%], & R_{\text{recover}} &\in [84\%,\, 91\%]
\end{aligned}
$$

实测中 **83%–88%** 的输入词元命中低价提示词缓存，使成本加权输入词元净降 15%–21%；外部工具报错时，**84%–91%** 的回合能在同一循环内自主重算恢复 [3][9]。容器外层的 **信任层**（Trust Layer）隔离了原始连接凭据，对每次进出模型的流量强制执行 Microsoft Purview 数据防泄漏（DLP）检查与敏感度标签继承 [3][4]。前沿实验室平均每周至少发布一款新模型，平台通常数十分钟内即可完成评测上架；默认开启的 **Auto 帕累托选模**会在管理员策略内横跨 Anthropic、OpenAI、Mistral 与 SpaceXAI 自动平衡质量与成本 [3][4]。微软研发团队内部更运行着由 **32 个 Copilot Studio 智能体、47 条协作连接与 6 个共享专家**组成的全天候软件工厂，自动分流故障、提交修复代码并巡检每日点数账单来研发 Copilot Studio 本体 [3][4]。 || Prompt cache hits reached **83%–88%** (cutting cost-weighted input tokens by 15%–21%), and **84%–91%** of failed tool turns self-recovered mid-loop [3][9]. Outside the sandbox, the **Trust Layer** isolates raw credentials and enforces Microsoft Purview data loss prevention (DLP) and sensitivity labels on every turn [3][4]. Frontier labs now ship new models weekly, and default **Auto Pareto routing** balances quality against cost across Anthropic, OpenAI, Mistral, and SpaceXAI within admin boundaries [3][4]. Internally, Microsoft runs **32 Copilot Studio agents, 47 connections, and 6 shared helpers** 24/7 to triage incidents, author pull requests, and audit credit spend while building Copilot Studio itself [3][4].

:::insight-grid { cols: 3, title: "让自主内核满足生产严苛要求的三大控制机制（BRK259） || Three Runtime Mechanisms Making Autonomous Loops Production-Safe (BRK259)" }
::card 01 · BRK259
### 动态任务子智能体（Dynamic Task Agents） || Ephemeral Parallel Sub-Agents
无需单独创建或发布子机器人，主控智能体可在单次会话内并发拉起 3 个轻量 `Claude Haiku 5.5` 在隔离上下文中盲审 Apex、Meridian 与 Nimbus 标书以防交叉污染；随后再用一句话跨厂商拉起 `Sol` 模型挑刺复核（预计 2026 年 12 月全面商用）[3][4]。 || Spins up ephemeral workers at runtime with zero child bots to publish. One session fans out three isolated `Claude Haiku 5.5` bid reviewers in parallel to prevent context bleed, then calls `Sol` for cross-provider critique (targeting Dec 2026 general availability) [3][4].

::card 02 · BRK259
### 六类生命周期钩子（Lifecycle Hooks） || Six Deterministic Lifecycle Hooks
工作流嵌智能体是在固定流程里引入大模型判断，Hooks 则相反：它在自主循环的固定切点强制挂载百分百触发的确定性规则 [3]。采购实测中，`Session start` 预载英国成本中心，`Before tool`（唯一拥有拦截与改参权的钩子）当场拦下超 **£2,000** 的 8 套入职包订单（`continue: false`），`After tool` 则在返回值进模型前脱敏隐私字段 [3][4]。 || Agent nodes add model judgment to fixed flows; Hooks instead lock 100% deterministic logic into fixed agent lifecycle points [3]. `Session start` loads UK cost-center rules, `Before tool`—the sole blocking/rewriting event—halts an 8-kit order exceeding **£2,000** (`continue: false`), and `After tool` redacts sensitive fields before model ingestion [3][4].

::card 03 · BRK259
### 会话变量裁剪与双向协议互联 || Scoped Variables & Bidirectional Agent Protocols
创作者可将固定入参锁为会话变量，仅当 `Department = HR` 成立时才向模型暴露薪酬工具与人事知识库，兼顾防幻觉与省词元 [3][4]。智能体既能凭 Entra OAuth 2.0 委托身份入向连接 Foundry、Microsoft 365 智能体开发包与私有虚拟网络代理（已全面商用），也能在 2027 年一季度全面商用后直接向外发布为远程 MCP 或 A2A 服务 [3][4]。 || Scoped **Variables** lock static tool inputs and expose HR knowledge strictly when `Department = HR` [3][4]. Entra OAuth 2.0 channels connect inbound to Foundry, the Microsoft 365 Agents toolkit, and private virtual networks today; outbound MCP and A2A server publishing targets Q1 2027 general availability [3][4].
:::

<div class="b2p-media-grid">
  <article class="b2p-media-card" data-present-surface="unframed">
    <div class="b2p-media-frame">
      <img src="./media/brk259-slide08-harness-loop.png" alt="BRK259 Slide 8 official diagram showing App, 6-step Harness loop, Execution Sandbox, Tools, Model, and Trust Layer" loading="lazy" />
    </div>
    <div class="b2p-media-body">
      <span class="b2p-media-badge" data-zh="BRK259 官方架构图 · Slide 08" data-en="BRK259 Official Architecture · Slide 08">BRK259 官方架构图 · Slide 08</span>
      <h4 data-zh="Microsoft Copilot Harness 六步自愈循环与容器信任边界" data-en="Six-Step Agentic Loop, Azure Sandbox & Outer Trust Layer">Microsoft Copilot Harness 六步自愈循环与容器信任边界</h4>
      <p data-zh="输入组装、模型调用、容器沙盒工具执行与外层凭据隔离/Purview DLP 审计形成完整闭环 [3][4]。" data-en="Unites prompt assembly, model calls, container CLI execution, and outer Purview DLP credential isolation [3][4].">输入组装、模型调用、容器沙盒工具执行与外层凭据隔离/Purview DLP 审计形成完整闭环 [3][4]。</p>
    </div>
  </article>
  <article class="b2p-media-card" data-present-surface="unframed">
    <div class="b2p-media-frame">
      <img src="./media/brk378-admin-center-inventory.jpg" alt="BRK378 Slide 18 official screenshot of Microsoft 365 Admin Center All Apps inventory tracking 492 managed apps and 4 blocked apps" loading="lazy" />
    </div>
    <div class="b2p-media-body">
      <span class="b2p-media-badge is-accent" data-zh="BRK378 官方实拍 · Slide 18 GA" data-en="BRK378 Official Capture · Slide 18 GA">BRK378 官方实拍 · Slide 18 GA</span>
      <h4 data-zh="Microsoft 365 管理中心：全域托管应用盘点与一键阻断" data-en="M365 Admin Center: 492 Managed Apps & Instant Quarantine">Microsoft 365 管理中心：全域托管应用盘点与一键阻断</h4>
      <p data-zh="五大构建入口产出的应用自动入账盘点（实机纳管 492 款、拦截 4 款高危应用），彻底消除隐形本地端口 [1][2]。" data-en="All five entry surfaces auto-register into one inventory (492 apps tracked, 4 blocked) with zero localhost blind spots [1][2].">五大构建入口产出的应用自动入账盘点（实机纳管 492 款、拦截 4 款高危应用），彻底消除隐形本地端口 [1][2]。</p>
    </div>
  </article>
</div>

## #copilot-managed-runtime 03 / Host: Copilot Managed Runtime :: 随处构建与受管托管：单一 Git 远程仓库如何消除本地孤岛与重写断崖 || Universal Hosting Without Silos: How Copilot Managed Runtime Ends Localhost and Rewrite Cliffs

智能体能可靠推理并受控调用工具后，下一步要解决多工具生成的全栈应用“往哪托管、如何协同演进”的第二道断层 [1]。2026 年 11 月 17 日全面商用（GA）的 **Copilot 托管运行时（Copilot Managed Runtime，简称 CMR）** 直接回应了这一痛点 [1][2]。产品总经理 Clay Wesener 在 BRK378 中指出，团队混用 Cowork、Copilot Studio、命令行与多款模型搭出了全部演示应用，**没有任何一款成品停留在 `localhost` 本地端口上** [1][2]。应用发布至托管运行时后，平台自动配齐独立受管域名下的 Microsoft Entra 单点登录、后台专属 **Git 远程源码仓库**、**1,500 余个受管连接器**代理及管理中心实时台账 [1][2]。 || Once the reasoning harness is reliable, enterprises must solve where full-stack apps built across multiple tools actually run and co-evolve [1]. **Copilot Managed Runtime (CMR)**—generally available since November 17, 2026—closes that gap [1][2]. General Manager Clay Wesener noted in BRK378 that although the team built demos across Cowork, Copilot Studio, the command line, and mixed models, **zero resulting apps ran on `localhost`** [1][2]. Publishing to the managed runtime automatically provisions Microsoft Entra sign-on, a backing **Git remote repository**, **1,500+ governed connectors**, and live Microsoft 365 Admin Center visibility [1][2].

托管运行时还打通了**构建期策略前置**与**应用内双模智能** [1][2]。以往员工花掉大量词元写完应用，往往到上线审批时才因误用禁用连接器而推倒重来；现在托管运行时把环境组路由、连接器动作级白名单与共享范围直接注入构建智能体上下文，动笔前即对齐安全红线 [1]。这与 BRK285 在开发环境中挂载 **Microsoft Learn MCP**、先查云架构规范再落盘架构契约的做法一脉相承 [7]。首席产品经理 Emma Cooper 现场演示了两类递进应用：一类在已全面商用的 **Copilot Cowork** 中结合组织工作脉络（Work IQ）与 **Figma 设计插件**生成《Q4 2026 Atlas 项目路线图》，再经代号 **Rayfin** 的能力一键写入 **Microsoft Fabric 数据库**或 SharePoint 列表；另一类在 **Copilot Studio** 中构建通过 36 项自动质检的 *Voyage Desk* 核保台与 **Gauge 现场巡检应用** [1][2]。巡检看板顶部用低时延**行内提示词函数**提炼即时风险摘要，右侧嵌入 **Gauge 风险顾问智能体** 跨 Dataverse 表与规程库追查北场（North Yard）逾期整改项 [1][2]。 || Two design choices stand out: **build-time policy grounding** and **dual in-app intelligence** [1][2]. Instead of rejecting prohibited connectors at deployment review, the runtime injects admin routing, per-action connector rules, and sharing limits into the authoring agent upfront [1]. That mirrors BRK285's practice of wiring **Microsoft Learn MCP** into code editors to lock cloud architecture contracts before writing application logic [7]. Inside the apps, Principal Product Manager Emma Cooper showed two patterns. First, prompting **Copilot Cowork** with organizational context (**Work IQ**) and the **Figma plugin** shipped the *Q4 2026 Atlas Roadmap* persisted to **Microsoft Fabric via Rayfin**. Second, **Apps in Copilot Studio** powered *Voyage Desk* (passing 36 automated build checks) and **Gauge Field Inspections**, pairing a fast **inline prompt summary** on top with an embedded **Gauge Risk Advisor Agent** side pane querying overdue North Yard actions [1][2].

:::comparison { title: "以单一 Git 远程仓库打通开放三方生态与全栈工程接力（BRK378） || Uniting Open 3P Builders and Pro-Dev Engineering on One Shared Git Remote (BRK378)" }
::versus 开放三方生态直发：Lovable + Managed Platform SDK || Open 3P Ecosystem: Lovable Direct Publish
### 20 分钟租户绑定，仅推送纯 React 前端且零权限触碰企业数据 || 20-Minute Admin Bind, Pure React UI & Zero 3P Data Access
服务超 **40,000 家企业**（含德国电信与英伟达）、累计创建逾 **7,000 万个项目**的 Lovable 已原生接入托管平台开发包 [1][2]。管理员约 **20 分钟**完成租户绑定后，业务人员生成的新员工入职应用即可一键直发托管运行时；**Lovable 仅向微软运行时推送编译后的纯 React 前端代码，全程无权接触底层 Excel 或企业业务数据**，身份鉴权与连接器读写全部闭环在客户租户内 [1][2]。 || Powering **40,000+ businesses** and **70M+ projects**, Lovable connects to the managed runtime in roughly **20 minutes** [1][2]. Makers prompt an Entra-personalized onboarding app and publish in one click: **Lovable ships only the compiled React frontend and never touches underlying enterprise data**, keeping sign-in and connector traffic inside the customer's Microsoft 365 tenant [1][2].

::versus 专业研发无缝接力：CLI + VS Code + Code Agents || Pro-Dev Relay: CLI, VS Code & Code Agents { highlight: true }
### 免密克隆标准 TypeScript/React 源码树，终结推倒重写 || Keyless Clone of Clean React/TS Source—Zero Rewrite Cliff
所有入口背后共写同一套标准 React/TypeScript Git 仓库 [1]。全栈工程师无需手工配置个人令牌，直接通过命令行与 **Git 凭据管理器（GCM）** 把业务专家在 Studio 里搭好的 Gauge 巡检应用克隆到本地编辑器；在 `Home.tsx` 补上巡检地图并在带安全横幅的本地开发服验证后，即可原路推回生产域名 [1]。研发团队还能直接部署自带模型与编排器的 **Code Agents**（早鸟预览），免去额外 Azure 配置即默认连通 Agent 365 [1][2]。 || Every authoring surface commits clean React/TypeScript to one shared Git remote [1]. Software engineers clone the Studio-built Gauge app keyless via **Git Credential Manager** into their code editor, add a geolocation map onto `Home.tsx` on a flagged local dev server, and push straight back to production [1]. Teams can also deploy custom **Code Agents** wired to Agent 365 with zero extra Azure setup [1][2].
:::

## #dual-green-zones-finops 04 / Scale: Dual Green Zones & FinOps :: 规模化治理与算力账本：双轨绿区、CSP 实时拦截与单一 OpenAPI 管理生态 || Governing at Tenant Scale: Dual Green Zones, Runtime CSP, and OpenAPI FinOps

五六种创作入口向全公司数千名员工敞开后，企业随即面对第三道断层：怎样既不像委托达·芬奇花三年画《蒙娜丽莎》那样卡死每份个人草稿，又不让默认环境滑向失控的影子系统 [5]？拥有约 **77,000 名员工**、服务全球 **3.04 亿患者**的跨国药企 **诺华（Novartis）** 在 BRK382 中给出了生产实证 [5][6]。诺华推行“护栏内放行”并开展 10 周公民开发者训练营，约 500 名活跃毕业生中有近 50% 将作品推上生产；自 2025 年 10 月起，主租户在用 Copilot Studio 智能体从 182 个增至 **1,366 个（7.5×）**，月活创作者增至 **3,312 人（2.6×）** [5][6]。同期 Power Apps 扩至 **27,862 款**（含 50 款新代码应用），依靠**周期性所有者确权（Periodic Owner Attestation）**自动清退无主僵尸资产 [5][6]。 || Opening half a dozen authoring tools to thousands of employees immediately raises the third chasm: how to avoid gating every personal draft like Leonardo da Vinci's three-year *Mona Lisa* without letting the default environment slide into shadow IT [5]? In BRK382, **Novartis** (**77,000 associates**, **304M patients**) shared primary tenant telemetry proving the "path of least resistance" model [5][6]. Pairing guardrailed enablement with 10-week Citizen Developer cohorts (~500 graduates converting ~50% to production), active Copilot Studio agents grew **7.5× from 182 to 1,366** and monthly makers reached **3,312 (2.6×)** [5][6]. Power Apps simultaneously scaled to **27,862** (including 50 Code apps) while **periodic owner attestation** automatically retired orphaned assets [5][6].

支撑这套规模秩序的底座，是 **Power Platform 管理中心（PPAC）专家绿区**与 **Microsoft 365 管理中心（MAC）首日默认绿区**的双轨配合，外加托管宿主（Managed Host）的运行时隔离 [1][5][6]： || Sustaining this velocity pairs **Power Platform expert green zones** with **Microsoft 365 on-by-default green zones** above an isolated **Managed Host** [1][5][6]:

1. **双轨绿区与 OAuth 连接器防线**：在 Power Platform 侧，管理员可配置最多 25 条优先级环境路由，把创作者分流至个人开发沙盒 [5][6]。启用**高级连接器策略**（ACP）后，系统不仅能封禁数据库 `Delete/Update` 高危动作，还强制要求**仅用 OAuth 身份认证**连接数据库，配合 Microsoft Purview 必读守则与微软内部 **Ask Mica** 申诉助手化解合规阻力 [5][6]。在跨工具的托管运行时侧，**绿区从租户首日起默认开启**，开箱仅放行核心办公连接器，并在管理中心 `All apps` 视图统一盘点全域资产——BRK382 课件实拍已纳管 **953 款受管应用**并封禁 4 款违规应用 [1][5][6]。 || **Dual Green Zones & OAuth-Only Connector Rules**: Power Platform layers up to 25 routing rules to place makers into personal sandboxes [5][6]. **Advanced Connector Policies** block database `Delete/Update` actions and enforce **OAuth-only authentication**, backed by Purview-audited welcome terms and Microsoft's internal **Ask Mica** helper [5][6]. Across the managed runtime, the **green zone ships on by default from day one**—scoping apps to core office connectors while tracking **953 managed apps** and 4 blocked apps in BRK382 Slide 30 [1][5][6].
2. **托管宿主实时拦截、分层晋升与小时级告警**：每款应用运行在强制 Entra 登录与 Purview 审计的专属 **Managed Host** 中 [5]。Austin Laugesen 现场测试三栏代码应用时验证，白名单连接器可直接通行；代码一旦试图私自外呼未授权外部地址（演示中指向 `Bing`），宿主便依据默认**严格内容安全策略**（CSP）当场掐断报错 [5]。应用交付支持平滑升级：小团队可直接用免配置的“单环境内建 `Dev -> Test -> Prod` 部署目标”，核心反洗钱与客户尽调负载则走跨环境严管流水线，并由高灵敏度 **Monitor** 在 **1 小时内**捕获健康波动直推 Teams 或 ServiceNow 工单 [5][6]。 || **Live Host Blocking, Tiered Promotion & Sub-Hour Alerts**: Workloads run inside a **Managed Host** enforcing Entra sign-on and Purview logging [5]. When Demo 3's code app attempted an unauthorized call to `Bing`, the host's default **strict Content Security Policy** (CSP) blocked it live [5]. Teams start with zero-setup `Dev -> Test -> Prod` targets inside one environment and graduate regulated anti-money-laundering workloads to cross-environment pipelines, with **within-1-hour** Monitor alerts routed to Teams or ServiceNow [5][6].
3. **双轨算力账本与单一 OpenAPI 驱动的 `$10` 超级卓越中心**：创作者可在 Studio 左上角直看实时点数（如 `88 credits`）或在 Cowork 输入 `/cost` 查账；管理员则在管理中心 `Cost management` 设定如现场巡检 **5,000 点数**的试点上限，一屏统管全租户 `2.5M` 月度点数（`1.5M` 预付 + `1M` 按量）与 `≥90%` 阈值预警 [1][5][6]。微软还将全平台管理接口收口为**单一权威 OpenAPI 规范**，按月自动生成版本化网页接口、`.NET/Python` 开发包、`Admin V2` 连接器、**15 组平台命令行**与 **Cowork 管理插件** [5][6]。Zohar 现场导入顾问团队 3 小时整理的资料包，仅花 **10 美元**、用时 **30 分钟**便在托管运行时上编译出一套全栈卓越中心治理应用（`aka.ms/powerplatform360`）[5][6]。 || **Transparent FinOps & the `$10` OpenAPI CoE App**: Makers check live spend via Studio's top-left counter (`88 credits`) or `/cost` in Cowork; admins set **5,000-credit** pilot caps and track `2.5M` monthly credits (`1.5M` prepaid + `1M` pay-as-you-go) with `≥90%` alerts [1][5][6]. Underneath, **one authoritative OpenAPI specification** auto-generates monthly web APIs, `.NET/Python` toolkits, `Admin V2` connectors, **15 command-line groups**, and the **Cowork Admin Plugin** [5][6]. Importing a 3-hour consultant packet, Zohar compiled a full Center of Excellence governance app on the managed runtime in **30 minutes for `$10`** (`aka.ms/powerplatform360`) [5][6].

<div class="b2p-media-grid">
  <article class="b2p-media-card" data-present-surface="unframed">
    <div class="b2p-media-frame">
      <img src="./media/brk382-mac-cost-management.png" alt="BRK382 Slide 46 official screenshot of Microsoft 365 admin center Copilot Cost management overview showing 2.5M total credits, 1.5M prepaid, 1M pay-as-you-go, and user spending limit alerts" loading="lazy" />
    </div>
    <div class="b2p-media-body">
      <span class="b2p-media-badge" data-zh="BRK382 官方实拍 · Slide 46" data-en="BRK382 Official Capture · Slide 46">BRK382 官方实拍 · Slide 46</span>
      <h4 data-zh="MAC 全局双轨账本：2.5M 点数透视与限额预警" data-en="MAC FinOps Ledger: 2.5M Credits & Threshold Alerts">MAC 全局双轨账本：2.5M 点数透视与限额预警</h4>
      <p data-zh="衔接创作者端顶栏点数器（88 credits）与 Cowork /cost 命令，统一纳管 1.5M 预付 + 1M 按量及 5,000 点业务上限 [1][5][6]。" data-en="Pairs maker-side counters (88 credits) and /cost commands with 1.5M prepaid + 1M PAYG tracking and 5,000-credit pilot caps [1][5][6].">衔接创作者端顶栏点数器（88 credits）与 Cowork /cost 命令，统一纳管 1.5M 预付 + 1M 按量及 5,000 点业务上限 [1][5][6]。</p>
    </div>
  </article>
  <article class="b2p-media-card" data-present-surface="unframed">
    <div class="b2p-media-frame">
      <img src="./media/brk285-slide29-reference-arch.jpg" alt="BRK285 Slide 29 official diagram of the Resolution Agent Reference Architecture across Dynamics 365, Power Platform, Copilot Studio, MCP, and Azure" loading="lazy" />
    </div>
    <div class="b2p-media-body">
      <span class="b2p-media-badge is-accent" data-zh="BRK285 官方架构图 · Slide 29" data-en="BRK285 Official Architecture · Slide 29">BRK285 官方架构图 · Slide 29</span>
      <h4 data-zh="Azure 支持 FACS 生产参考拓扑：低代码推理 + 全代码状态" data-en="Azure Support FACS Topology: Studio Reasoning + Azure State">Azure 支持 FACS 生产参考拓扑：低代码推理 + 全代码状态</h4>
      <p data-zh="Copilot Studio 调度 6 大专职推理角色，经安全网关与 4 路协议桥连接 Durable Functions 与云端跨天状态库及 Foundry 门禁 [7][8]。" data-en="Copilot Studio coordinates 6 specialist roles across 4 gateway-secured bridges to Durable Functions/Cosmos state and Foundry gates [7][8].">Copilot Studio 调度 6 大专职推理角色，经安全网关与 4 路协议桥连接 Durable Functions 与云端跨天状态库及 Foundry 门禁 [7][8]。</p>
    </div>
  </article>
</div>

## #bounded-autonomy-evolution 05 / Autonomy: Durable State & Hill Climbing :: 跨越最后一公里信任鸿沟：混合持久状态分工与有界自主爬山闭环 || Crossing the Final Trust Chasm: Hybrid Durable State and Six-Step Hill Climbing

内核、托管与租户治理就绪后，面对跨数天乃至数周的关键业务工单，企业还要跨越最后一道“敢不敢免审放权”的信任门槛 [7]。BRK285 拆解了微软 Azure 客户支持团队历时 **18 个月**将全自主客户服务（Fully Autonomous Customer Service，简称 FACS）推上生产的实战经验 [7][8]。在 Contoso `503 Service Unavailable` 线上故障实录中，工单进入 Dynamics 365 后，系统**无需追问客户索要订阅号**便直连诊断接口，查明“上午 `09:08` 刚完成新部署，当前 `0 of 3` 实例健康” [7]。随后内置审校门禁核验诊断证据并给出回滚指引，系统持续保持跨轮状态，直到客户确认健康检查恢复才受控关单 [7]。 || With governed hosting and FinOps in place, multi-day mission-critical operations still face the final trust hurdle of unreviewed execution [7]. BRK285 unpacked Azure Support's **18-month** Customer Zero rollout of Fully Autonomous Customer Service (FACS) [7][8]. When Contoso reported a live `503` App Service outage in Dynamics 365, the system queried diagnostics **without asking for a subscription identifier**, pinpointed `0 of 3` healthy instances right after a `09:08` deployment, and verified evidence through an in-flow critic gate [7]. It then held multi-turn state until rollback health checks passed before closing the ticket [7].

Ali Ijaz 与 Arun Masilamani 强调，这套生产系统的稳定并非靠“成熟后迁离低代码”，而是靠 **低代码做敏捷专员推理、全代码管跨天持久状态** 的清晰分工 [7][8]。Copilot Studio 在前端编排意图识别、证据合成、质量审校等 6 类专职角色；跨周工单状态持久化与工具超时升级兜底，则经由接口管理网关与 4 路协议桥交由 **Azure Durable Functions 与 Cosmos 数据库**承载 [7][8]。面对线上偶发幻觉，团队放弃在提示词里写“请更努力思考”的无效调优，转而运转 **六步爬山**（Hill Climbing）闭环 [7][8]。工程师把人工坐席改稿原因、专家评分量表与**逐轮追踪工作台**（Trace Studio）日志聚类为失败分桶，经 Microsoft Foundry 重放与金丝雀门禁逐个场景放开有界自主，彻底终结跨部门故障推诿 [7][8]。 || Ali Ijaz and Arun Masilamani stressed that production stability came **not from migrating off low-code, but from splitting specialist reasoning from pro-code durable state** [7][8]. Copilot Studio coordinates six specialist roles—from Intent and Evidence Synthesis to Quality Critic—while **Azure Durable Functions and Cosmos databases** hold multi-week case state and timeout escalations across four gateway-secured bridges [7][8]. To eliminate live hallucinations, the team replaced wishful "think harder" prompt edits with a **six-step hill-climbing loop** [7][8]. Engineers clustered **reviewer edit reasons**, expert rubrics, and **Trace Studio** logs into failure buckets gated by Microsoft Foundry replay, unlocking bounded autonomy one scenario at a time [7][8].

:::figure { src: "./media/talk-30min-pacing-blueprint.figure.json", title: "从个人验证原型到有界全自主生产系统：三阶段六维工程控制同步硬化雷达 || From Personal Prototype to Bounded Production Autonomy: Six-Axis Control Progression" }
图 2：综合四场专场实证绘制的控制强度外扩轨迹。自主权不是一键打开的开关：每从个人试验晋级至受管企业应用乃至有界全自主系统，内核确定性钩子、受管宿主内容策略、跨天持久状态、动作级最小权限、逐轮追踪告警与爬山回滚门禁六个维度都必须同步收紧 [1][3][5][7]。 || Figure 2: Control progression synthesized across BRK259 and BRK378—alongside BRK382 and BRK285. Autonomy is never an on/off switch: advancing from personal prototypes to governed apps and bounded autonomous systems requires lockstep hardening across all six control axes [1][3][5][7].
:::

不同业务场景所需的内核机制、托管形态与治理深度各不相同。切换下方**企业负载架构选型与护栏推演台**的五个场景标签，可分别查看工作流微应用、跨生态全栈接力、敏感审批智能体、数千人租户治理与跨天关键业务自主的分层配置与准入门禁： || Architectural requirements vary by workload risk. Switch across the five workload patterns in the interactive **Workload Architecture Decision Matrix** below to inspect concrete Harness, Managed Runtime, FinOps, and release-gate configurations:

:::sandbox { id: "abs-talk-blueprint", canvas: false, script: "./talk-blueprint.js", style: "./talk-blueprint.css", title: "From Build to Production：五类企业负载架构选型与护栏推演台 || From Build to Production: Five-Workload Architecture & Guardrail Decision Matrix", desc: "按业务复杂度切换五类典型企业负载，查阅对应的 Harness 内核机制、Managed Runtime 托管路径、实证指标与生产准入边界。 || Switch across five enterprise workload tiers to inspect Harness mechanics, Managed Runtime hosting paths, empirical benchmarks, and release gates." }
纯静态交互式架构选型推演台：涵盖工作流微应用、三方与全栈 Git 接力、合规写操作门禁、全租户双轨治理及跨天有界全自主五类生产模式。 || Pure static architecture decision matrix spanning in-flow micro-apps, 3P/pro-dev Git relay, policy-gated loops, tenant FinOps, and bounded production autonomy.
:::

:::callout { title: "企业架构师推进 Build-to-Production 的三条刚性工程准则 || Three Non-Negotiable Engineering Rules for Build-to-Production Architecture" }
① **契约与确定性钩子先于界面和提示词**：动笔前用 Microsoft Learn MCP 与构建期前置策略对齐云安全红线；凡涉及金额审批、外部写操作或隐私数据的工具，一律用 `Before tool` / `After tool` 生命周期钩子锁死确定性边界，不靠自然语言提示词“祈祷合规” [1][3][7]。<br><br>② **前端构建全面开放，代码仓与数据边界统一收口**：允许业务人员与工程师自由选用 Cowork、Copilot Studio、Lovable 或本地代码编辑器，强制所有产物脱离 `localhost` 收归共享 Git 远程仓库与 Copilot Managed Runtime，确保外部工具不碰企业数据、专业研发免重写直接接力 [1][2]。<br><br>③ **让默认绿区成为最省力路径，凭爬山证据逐场景放权**：开箱启用 Microsoft 365 管理中心默认绿区连接器、严格内容安全策略与业务线点数限额，辅以 OpenAPI 自动生成的管理套件；跨天核心流程采用“Studio 推理 + Azure 持久状态”分工，坚守 BRK285 两条授权底线——**绝不授予无法解释的权限，绝不授予无法撤销的权限** [1][5][7]。 || ① **Contracts & Deterministic Hooks Precede UI and Prompts**: Ground designs via Microsoft Learn MCP and build-time policy context upfront, and gate side-effecting or sensitive tools with `Before tool` / `After tool` hooks rather than trusting prompt wishes [1][3][7].<br><br>② **Open Authoring on Top, Unified Git & Tenant Data Underneath**: Let teams build freely across Cowork, Studio, Lovable, or code editors while converging every artifact onto Copilot Managed Runtime and one shared Git remote. Tenant data stays inside Microsoft 365 with zero pro-dev rewrite cliff [1][2].<br><br>③ **Default to Green-Zone FinOps and Earn Autonomy One Scenario at a Time**: Enforce default green-zone security policies, pilot credit caps, and OpenAPI admin automation; split Studio reasoning from Azure durable state for multi-day flows, and uphold BRK285's two iron rules—**never grant authority you cannot explain, and never grant authority you cannot reverse** [1][5][7].
:::

## 参考资料：Microsoft Ignite 2026 四大核心专场与官方信源 || References: Four Microsoft Ignite 2026 Core Engineering Sources

1. **Clay Wesener, Emma Cooper & Malavika Balachandran Tadeusz (Microsoft Ignite 2026 BRK378)** — https://ignite.microsoft.com/en-US/sessions/1787856630704001Ep9J-1791588308254001CRyh | 《Host apps from anywhere with the new Copilot Managed Runtime》45 分钟官方点播实录与逐字稿（2026-11-18） || BRK378 official 45-minute recording and verbatim transcript on Copilot Managed Runtime general availability (Nov 18, 2026)
2. **Microsoft Ignite 2026 BRK378 Official Slide Deck & Stream** — https://medius.microsoft.com/video/asset/PPT/c5c8ac76-0384-4a0c-acf5-83488136a4f1 | BRK378 原版 34 页演示课件（含 11 月 17 日商用矩阵、Voyage Desk 36 项检查、Fabric Rayfin 持久化与管理中心 492 款应用实拍） || Official 34-slide BRK378 presentation deck covering Nov 17 release capabilities, Lovable integration, and admin inventory captures
3. **Alice Appleton (Microsoft Ignite 2026 BRK259)** — https://ignite.microsoft.com/en-US/sessions/1787856612459001EfZu-1791588174633001COAZ | 《See how the Microsoft Copilot harness powers Copilot Studio》38 分 36 秒官方点播实录与双语逐字稿（2026-11-20） || BRK259 official recording and transcript on the Microsoft Copilot toolkit harness and Azure container sandboxes (Nov 20, 2026)
4. **Microsoft Ignite 2026 BRK259 Official Slide Deck** — https://medius.microsoft.com/video/asset/PPT/57bd65b7-dce0-4d9d-9d20-70a3b284e9bd | BRK259 原版 32 页演示讲义（含 500 道离线评测 +47.5 pts / -45% 数据、32 智能体软件工厂、动态子智能体与六类 Hooks 契约） || Official 32-slide BRK259 presentation deck detailing offline eval gains, 32-agent internal factory, Dynamic Task Agents, and 6 lifecycle hooks
5. **Zohar Raz, Ryan Jansen, Austin Laugesen & Nicholas Balestrino (Microsoft Ignite 2026 BRK382)** — https://ignite.microsoft.com/en-US/sessions/1787856631314001Eynh-1791814918515001Cspr | 《Deploy solutions at scale with Power Platform or Copilot Managed Runtime》47 分钟官方点播实录与诺华访谈逐字稿（2026-11-20） || BRK382 official 47-minute recording featuring Novartis's 77,000-associate telemetry and four governance demos (Nov 20, 2026)
6. **Microsoft Ignite 2026 BRK382 Official Slide Deck** — https://medius.microsoft.com/video/asset/PPT/8698eb3b-5f0b-4284-bf98-188eb338d15e | BRK382 原版 54 页演示课件（含诺华 7.5× 增长报表、双管理中心绿区、小时级 Monitor 告警、2.5M 点数账本与单一 OpenAPI 规范） || Official 54-slide BRK382 presentation deck covering Novartis scale metrics, live host blocking, FinOps ledgers, and the $10 governance app
7. **Ali Ijaz, Arun Masilamani, Tim Schaeps & Omprakash Reddy Adudodla (Microsoft Ignite 2026 BRK285)** — https://ignite.microsoft.com/en-US/sessions/1787856616329001EyM8-1791588352535001C8TA | 《Your agent works. Now make it enterprise-ready.》51 分钟官方点播实录与双旅程逐字稿（2026-11-19） || BRK285 official 51-minute recording dissecting Superagents contracts and Azure Support's 18-month autonomous rollout (Nov 19, 2026)
8. **Microsoft Ignite 2026 BRK285 Official Slide Deck** — https://medius.microsoft.com/video/asset/PPT/048e7075-9b0a-458d-b28b-3fa6113f248b | BRK285 原版 38 页演示讲义（含三阶成熟度、3×6 控制矩阵、全自主客服低高代码参考拓扑与六步爬山迭代图） || Official 38-slide BRK285 presentation deck covering the 3×6 autonomy-control matrix, hybrid reference topology, and 6-step hill-climbing loop
9. **Ben Appleby (Microsoft Copilot Studio Engineering Blog)** — https://www.microsoft.com/en-us/copilot/blog/copilot-studio/how-the-microsoft-copilot-harness-in-copilot-studio-helps-agents-finish-the-job/ | 《How the Microsoft Copilot harness in Copilot Studio helps agents finish the job》83%–88% 提示词缓存命中率与 84%–91% 工具失败自愈工程解析（2026-11-09） || Companion engineering deep dive on Azure container sandboxes, 83%–88% prompt cache hit rates, and 84%–91% self-recovery (Nov 9, 2026)

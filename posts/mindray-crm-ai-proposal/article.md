---
title: "销售 CRM 移动 AI 智能体方案 || Mobile-First, Agent-Driven Sales CRM"
eyebrow: Microsoft Business AI Solution
brand: Agentic Sales Mobile
date: 2026-01-01
strict_i18n: false
strict_density: true
lead: "基于 Microsoft Power Platform 为客户销售团队打造一套移动优先、语音驱动、AI 编排的智能业务伙伴。让一线销售在客户拜访现场即可用一句话完成数据查询、活动反馈记录与商机创建——把 SAP Commerce CRM 的\"完整能力\"包装成\"对话式体验\"。 || Built on Microsoft Power Platform, this proposal turns the sales force's CRM into a mobile-first, voice-driven, AI-orchestrated business companion. Field sales can query data, log call notes, and create opportunities in a single utterance — wrapping SAP Commerce's full capability inside a conversational experience."
hero_actions:
  - "查看设计哲学 || See Design Philosophy | #philosophy"
  - "查看系统架构 || See System Architecture | #architecture"
panel_label: "核心主张 || Core Thesis"
panel_title: "不再让销售\"使用 CRM\"，而是让 CRM\"跟随销售\"。 || Stop making sales reps \"use the CRM\". Make the CRM follow them."
panel_desc: "传统思路是把桌面 CRM 移植到手机上；本方案的设计原点是：把 CRM 拆解成一个个可被语音召唤、可在对话中确认、可在后台自动落库的智能体（Agent），让销售只与客户、不与表单打交道。 || The conventional approach ports the desktop CRM onto a phone. This proposal does the opposite — it decomposes the CRM into voice-summonable, conversation-confirmable, silently-persistable agents, so reps engage with customers, not forms."
panel:
  - "移动优先 — 单手 30 秒内完成主流程 || Mobile-first — main flows finishable single-handed within 30 seconds"
  - "语音先行 — 自然语言取代字段填空 || Voice-first — natural language replaces form filling"
  - "AI 编排 — Agent 调度而非菜单导航 || AI orchestration — agents dispatched, not menus navigated"
  - "SAP 共生 — 不替换底座，扩展智能层 || SAP symbiosis — no replacement, only an intelligence layer on top"
metrics:
  - "覆盖业务域 || Business Domains | 5 | 客户活动 · 商机 · 订单 · 安装售后 · 考核管理 || Activities · Opportunities · Orders · Install & Service · KPIs"
  - "规划 Agent 数量 || Planned Agents | 30+ | 含通用场景 Agent，分阶段上线 || Including reusable utility agents, rolled out in phases"
  - "移动主流程目标耗时 || Target Mobile Flow Time | ≤ 30s | 语音录入活动反馈到商机草稿生成 || From voice capture to opportunity draft generation"
  - "实施周期 || Delivery Timeline | 6 个月 || months | 四阶段交付，3 个月内首个生产 Agent 上线 || Four phases; first production agent live within 3 months"
---

## #challenge 01 / Business Challenge :: 现状与挑战：桌面 CRM 在拜访现场失效 || The Status Quo: A Desktop CRM That Breaks Down on the Field

客户业务依赖一套基于 SAP Commerce 的高度定制 CRM，承载从客户活动、商机、订单、安装到售后的完整业务流程。系统在桌面端覆盖了完整的功能集，但其访问形态与现代销售的实际工作场景之间存在明显错位——销售真正需要它的时刻，恰恰是它最难以使用的时刻。 || The customer's business runs on a heavily-customized SAP Commerce CRM that covers activities, opportunities, orders, installation and after-sales. The desktop surface is functionally complete, yet its access model is mismatched with how modern sales actually work — the moments reps need the CRM most are precisely when it is hardest to use.

:::insight-grid { cols: 2 }
::card 01
### 移动访问 = 浏览器套桌面，并非真正的移动应用 || "Mobile" today = a desktop site wrapped in a browser, not a real mobile app
痛点 01 · 形态错配 || Pain 01 · Form Mismatch

当前所谓的"移动端"实质是桌面 Web 在手机浏览器内的简单包装：仅做了 Responsive 布局适配，未按移动操作特性重新设计交互；首屏与列表加载时间长，触控热区与导航层级仍是桌面思维，销售在拜访现场仍倾向退回 Excel/微信记录。 || What is called "mobile" today is the desktop web rendered through a phone browser — only responsive layout, no rethinking of interaction. First-screen and list loads are slow; tap targets and navigation depth are still desktop-style. Reps end up retreating to Excel and chat apps in the field.

::card 02
### 跨境访问慢，等待消耗耐心 || Cross-border access is slow; latency burns patience
痛点 02 · 性能瓶颈 || Pain 02 · Performance

SAP Commerce 后端部署集中，跨区域访问需经多段网络，单页加载与列表查询常需数秒至十余秒，使一线销售更倾向用 Excel/微信记笔记，绕过系统。 || The SAP Commerce backend is centrally deployed, while cross-region access traverses multiple network hops. Single-page loads and list queries often take several to a dozen seconds, pushing reps to take notes in Excel or chat — bypassing the system entirely.

::card 03
### 表单字段繁多，移动端难以完成 || Forms have too many fields to finish on a phone
痛点 03 · 录入摩擦 || Pain 03 · Entry Friction

"记录拜访"需填写 10+ 字段（主题、纪要、起止时间、目的、联系人、状态、跟进动作、关联客户/商机），即便上线移动表单也只是把痛苦从大屏迁移到小屏。 || "Logging a visit" demands 10+ fields (subject, notes, start/end time, purpose, contacts, status, follow-up, linked customer/opportunity). Even a mobile form just moves the pain from a large screen to a small one.

::card 04
### 从"信息记录"到"商机识别"全靠人脑 || From note-taking to opportunity recognition, everything still depends on human judgement
痛点 04 · 智能缺位 || Pain 04 · No Intelligence

销售完成拜访后需要自己判断"是否要建商机"、"产品线是什么"、"信心度多少"，再手动到另一个模块创建——这恰恰是 AI 最擅长辅助、却尚未介入的环节。 || After every visit, the rep alone decides whether to create an opportunity, which product line it belongs to, and what the confidence is — then manually opens another module to enter it. This is exactly where AI should assist, yet today it does not.
:::

:::callout { title: "核心判断 || Core Insight" }
问题不在"CRM 该不该上移动端"，而在于：当 AI 已经可以理解口语、识别意图、自动调用业务 API 时，销售为什么还要被迫去"填表"？真正的目标不是把桌面表单缩到 6 寸屏上，而是让表单从用户视野中消失。 || The question is not "should the CRM have a mobile UI". It is: now that AI understands speech, infers intent, and calls business APIs, why are sales reps still forced to fill forms? The goal is not to shrink desktop forms onto a 6-inch screen — it is to make forms disappear from the user's view altogether.
:::

## #philosophy 02 / Design Philosophy :: 设计哲学：Conversational CRM || Design Philosophy: Conversational CRM

本方案不是"做一个手机版 CRM"，而是用四条原则重新定义销售与 CRM 的交互方式。每条原则一句本质 + 一条硬规则，决定后续架构与产品配置的取舍。 || This is not "a mobile version of the CRM". Four principles redefine how sales and the CRM interact — each one essence plus one hard rule, anchoring every architectural and licensing choice that follows.

原则 01 || Principle 01

### Mobile-First，不只是 Mobile-Compatible || Mobile-First, not Mobile-Compatible

设计起点是"单手 · 户外光线 · 30 秒内完成"，而非桌面缩小版。 || Design starts from "one hand · outdoor light · finished within 30 seconds" — not a shrunk desktop.

Design Rule

单一焦点 · 一拇指可达 · 离线可写；超过 3 屏的表单必须由对话承接。 || Single focus · thumb-reachable · offline-writable. Any form longer than three screens must be replaced by conversation.

原则 02 || Principle 02

### Voice-First，键盘是 fallback || Voice-First, keyboard is fallback

语音是拜访间隙最自然的输入；键盘只在语音失败时出现。 || Voice is the natural input between visits; the keyboard appears only when voice fails.

Design Rule

主页面常驻语音按钮 · 设备原生 Web Speech API 转写 · AI Builder 抽取字段，无额外语音订阅。 || A voice button persists on every main screen · transcription uses the device-native Web Speech API · AI Builder extracts fields. No additional speech subscription.

原则 03 || Principle 03

### Confirm，Don't Configure || Confirm, Don't Configure

AI 主动给草稿，用户只做"确认 / 微调 / 拒绝"三选一，配置型交互压成判断型。 || AI drafts proactively; the user picks one of three — confirm / tweak / reject. Configuration-style interaction collapses into judgement.

Design Rule

每条 AI 输出附"来源 + 置信度 + 一键编辑"；拒绝/编辑沉淀为提示词优化语料。 || Every AI output carries source · confidence · one-tap edit. Rejections and edits become prompt-optimization corpus.

原则 04 || Principle 04

### Agent 编排，不是菜单导航 || Agent Orchestration, not Menu Navigation

用户表达意图，Generative Orchestration 调度 Agent，无需知道 SAP 菜单。 || The user states intent; Generative Orchestration dispatches the right agent. No one needs to know the SAP menu.

Design Rule

移动端只有"对话 · 看板 · 任务"三入口；新增能力靠注册 Agent 而非重构 UI。 || Mobile has just three entry points — Chat · Board · Tasks. New capabilities ship by registering an agent, not rebuilding the UI.

## #architecture 03 / System Architecture :: 系统架构：智能业务伙伴的分层协同 || System Architecture: A Layered Intelligent Business Partner

架构由五个职责清晰的功能区组成：用户侧的体验层、AI 推理与编排的认知与编排平面（彼此并行协作）、与 SAP Commerce 共生的数据层，以及横切全栈的治理层。整体不是简单堆叠，而是"前端体验 → 认知/编排双引擎 → 共生数据"的纵深结构，治理层从侧面横切所有功能区。 || The architecture is five clearly-scoped zones: an Experience layer at the user edge, parallel Cognitive and Orchestration planes for AI reasoning and dispatch, a Data layer co-living with SAP Commerce, and a Governance layer cutting across the entire stack. It is not a simple stack — it is "Experience → dual Cognitive/Orchestration engines → symbiotic Data", with Governance crossing every zone from the side.

Experience · 体验层 || Experience Layer

### Power Apps Code App 主战场 + Teams / 管理后台两侧入口 || Power Apps Code App as the main stage; Teams & admin portal as flanking entry points

主体验由 Power Apps Code App 承载——以 React 编写真正的移动 UI（手势、相机、语音、离线缓存），同时享受 Power Platform 的身份、连接器与治理。Copilot in Teams 提供会议中临时查询入口；管理后台用 Model Driven App 快速生成。 || The primary experience runs on Power Apps Code App — a real React mobile UI (gestures, camera, voice, offline cache) that still inherits Power Platform identity, connectors, and governance. Copilot in Teams gives reps an in-meeting ad-hoc query entry; the admin back office is generated quickly with a Model Driven App.

Power Apps Code App (React)

Copilot in Teams

Model Driven App（管理后台） || Model Driven App (admin back office)

Cognitive · 认知层 || Cognitive Layer

### 设备原生语音 + AI Builder 文本智能 || Device-native voice + AI Builder text intelligence

**语音走设备、文本走 AI Builder**。前端通过 Web Speech API / 设备语音输入法本地完成多语种转写；AI Builder 提供 Prompt(GPT)、Form Processing、实体抽取、分类等预构建能力，由前端与编排层共用。 || **Voice runs on the device; text runs through AI Builder.** The frontend transcribes multi-language speech locally via Web Speech API or the device IME. AI Builder supplies prebuilt capabilities — Prompt(GPT), Form Processing, entity extraction, classification — shared by the frontend and the orchestration layer.

Web Speech API（设备原生） || Web Speech API (device-native)

AI Builder Prompt (GPT)

AI Builder Form Processing

Entity Extraction / Classification

Azure AI Search · 售后知识库（Phase 3） || Azure AI Search · service knowledge base (Phase 3)

⇌

Orchestration · 编排层 || Orchestration Layer

### Copilot Studio Agents — 数据与工具的编排者 || Copilot Studio Agents — orchestrators of data and tools

Agent **不是聊天机器人**，是有目标、可调用工具的执行单元。每个 Agent 注册自己的知识与工具集（AI Builder 模型、Agent Flow、SAP 连接器、Dataverse 表）；Generative Orchestration 按意图分发任务；Agent Flow 承担事务性长流程。 || An agent is **not a chatbot** — it is a goal-directed execution unit that calls tools. Each agent registers its own knowledge and toolset (AI Builder models, Agent Flow, SAP connectors, Dataverse tables). Generative Orchestration dispatches tasks by intent; Agent Flow handles long transactional flows.

Copilot Studio Agents

Generative Orchestration

Agent Flow（事务流程） || Agent Flow (transactional)

MCP / Custom Connectors

Data · 数据层 || Data Layer

### Dataverse 作为 AI 操作面 · SAP Commerce 仍是 System of Record || Dataverse as the AI operating surface · SAP Commerce remains the System of Record

不替换 SAP 数据底座。读路径以 Virtual Tables 直连 SAP 关键实体，高频字段近实时缓存；写路径走"草稿 → 确认 → Service Bus 异步回写 SAP"。AI 元数据（摘要、置信度、调用日志）原生存于 Dataverse。 || The SAP data foundation is not replaced. Reads go through Virtual Tables straight to key SAP entities, with hot fields cached near-real-time. Writes follow Draft → Confirm → Service Bus async to SAP. AI metadata (summaries, confidences, call logs) lives natively in Dataverse.

Microsoft Dataverse（AI 元数据） || Microsoft Dataverse (AI metadata)

Virtual Tables → SAP Commerce

Azure API Management（统一接入） || Azure API Management (unified ingress)

Azure Service Bus（异步回写） || Azure Service Bus (async writeback)

Azure Blob Storage（拜访照片 / 设备铭牌） || Azure Blob Storage (visit photos / device nameplates)

System of Record

### SAP Commerce CRM（保留 · 不动其底座） || SAP Commerce CRM (preserved · foundation untouched)

承担权威记录、合同、价格、订单履约等关键业务流；本方案所有写入最终回流到 SAP，保持其作为 System of Record 的唯一性。 || Authoritative records, contracts, pricing, order fulfilment continue to live here. Every write in this proposal eventually flows back to SAP, keeping it the singular System of Record.

Governance · 治理层（横切） || Governance Layer (cross-cutting)

### 横切全栈的身份 · 安全 · 合规 || Identity · security · compliance, cutting across the stack

身份与权限沿用 Entra ID + 现有 SAP 角色；Power Platform DLP 控制连接器边界；Managed Environments + Pipelines 管理 Dev/UAT/Prod；Copilot Studio 内容审核与 PII 屏蔽守护 AI 输出；Purview 集中审计。 || Identity and permissions reuse Entra ID plus existing SAP roles; Power Platform DLP fences connector boundaries; Managed Environments and Pipelines govern Dev/UAT/Prod; Copilot Studio content moderation and PII redaction guard AI outputs; Purview provides central audit.

Microsoft Entra ID（SSO） || Microsoft Entra ID (SSO)

Power Platform DLP

Managed Environments

Microsoft Purview

Azure Key Vault（凭据托管） || Azure Key Vault (credential vault)

Azure Application Insights · 端到端可观测 || Azure Application Insights · end-to-end observability

:::comparison { title: "数据策略：三种与 SAP Commerce 共存的方式 || Data Strategy: Three Ways to Co-Exist with SAP Commerce" }
::versus 方案 A || Option A
### 整迁 / 双写 || Full Migration / Dual Write
把 SAP Commerce 的数据全量同步到 Dataverse，两侧维护一致性。优势是 AI 侧查询最快、可离线；代价是同步基础设施沉重、双向冲突、合规审计复杂、SAP 端定制功能可能丧失。 || Mirror all SAP Commerce data into Dataverse with two-way consistency. Pros: fastest AI-side queries, offline-friendly. Cons: heavy sync infrastructure, bidirectional conflicts, complex compliance audits, possible loss of SAP-side customizations.

::versus 方案 B || Option B
### 实时接口调用（REST API / MCP） || Live API Calls (REST / MCP)
不复制任何数据，Agent 通过 SAP Commerce 暴露的 REST API 或 MCP Server 实时读写。优势是零数据冗余、SAP 始终是唯一真相源、上线最快；代价是每次交互都要回 SAP 链路（受跨境延迟影响）、复杂查询难以编排、需要 SAP 侧补齐 API/MCP 覆盖面。 || No data is copied; agents read and write live through SAP Commerce REST APIs or an MCP server. Pros: zero data duplication, SAP stays the single source of truth, fastest to launch. Cons: every interaction round-trips to SAP (sensitive to cross-border latency), complex queries are hard to orchestrate, depends on SAP exposing sufficient API/MCP surface.

::versus 方案 C || Option C
### Virtual Tables + 事件驱动回写 || Virtual Tables + Event-Driven Writeback
SAP Commerce 仍是业务系统记录（System of Record），Dataverse 仅作为 AI 操作面（System of Engagement）。读取以 Virtual Table 直连为主，写入通过 Azure Service Bus 异步落到 SAP，并提供"草稿态 → 确认态 → 同步态"三段式可视化，让销售清楚每条记录的同步进度。 || SAP Commerce stays the System of Record; Dataverse is the System of Engagement (the AI operating surface). Reads are served by Virtual Tables; writes flow through Azure Service Bus into SAP asynchronously, with a Draft → Confirmed → Synced visualisation so reps see exactly where every record stands.
:::

## #agent-map 04 / Agent Map :: Agent 全景规划 || Agent Landscape

在客户给出的 Agent 全景图基础上，本方案以"业务域 + 通用域"二元组织 Agent 体系，并标注哪些 Agent 进入 Phase 1 落地（核心高频）、哪些进入 Phase 2/3 扩展（中长期价值）。 || Building on the customer's agent landscape, this proposal organises agents along two axes — business domain and generic capability — and labels which agents land in Phase 1 (high-frequency core) versus Phase 2/3 (mid- to long-term value).

### 客户与活动 · Customer & Activity || Customer & Activity

客户画像 Agent || Customer Profile Agent

线索获取 Agent || Lead Capture Agent

活动创建 Agent ★ || Activity Creation Agent ★

客户拜访 Agent ★ || Customer Visit Agent ★

工作总结 Agent ★ || Daily Summary Agent ★

竞品分析 Agent || Competitive Analysis Agent

市场扫描 Agent || Market Scan Agent

### 商机管理 · Opportunity || Opportunity Management

商机创建 Agent ★ || Opportunity Creation Agent ★

商机评估 Agent ★ || Opportunity Scoring Agent ★

销售/需求预测 Agent || Sales / Demand Forecast Agent

标书分析 Agent || Tender Analysis Agent

投标文件 Agent || Bid Document Agent

标书制作 Agent || Tender Authoring Agent

商机督导 Agent || Opportunity Coaching Agent

### 订单管理 · Order || Order Management

报价 Agent || Quoting Agent

下单 Agent || Order Placement Agent

订单审核 Agent || Order Approval Agent

运费核算 Agent || Freight Costing Agent

订单查询 Agent ★ || Order Inquiry Agent ★

物流查询 Agent ★ || Logistics Inquiry Agent ★

### 安装与售后 · Service || Install & Service

智能派单 Agent || Smart Dispatch Agent

现场服务 Agent ★ || Field Service Agent ★

故障识别 Agent || Fault Diagnosis Agent

维修知识检索 Agent ★ || Repair Knowledge Agent ★

备件推荐 Agent || Spare Parts Agent

质量分析 Agent || Quality Analytics Agent

预测性维护 Agent || Predictive Maintenance Agent

### 考核与通用 · Performance & Generic || Performance & Generic

指标分析 Agent ★ || KPI Analytics Agent ★

会议纪要 Agent || Meeting Minutes Agent

流程卡点 Agent || Process Bottleneck Agent

智能知识库 Agent ★ || Knowledge Base Agent ★

文件审核 Agent || Document Review Agent

PPT/Excel 助手 || PPT / Excel Assistant

★ = Phase 1 优先落地（高频 · 直接服务一线销售拜访场景） || ★ = Phase 1 priority (high-frequency · directly serves field sales visits)

## #agent-architecture 05 / Agent Architecture :: 多 Agent 协同：30+ Agent 如何共同回答一句话 || Multi-Agent Orchestration: How 30+ Agents Answer One Sentence Together

Agent 全景图回答了"有哪些 Agent"，本节回答"它们怎么协同"。我们采用 Microsoft Copilot Studio 的 Generative Orchestration 作为调度核心，把 Agent 分成三层职责，规定四种协作模式，并以一条统一的消息契约串起所有 Agent，使任何业务域的新 Agent 加入时，无需修改现有 Agent。 || The Agent Map answered "which agents exist"; this section answers "how they work together". We use Microsoft Copilot Studio's Generative Orchestration as the dispatcher, split agents into three responsibility tiers, define four collaboration patterns, and bind them with a single shared message contract — so adding a new agent in any domain requires no change to existing agents.

Tier 1 · 调度 || Tier 1 · Dispatch

### Orchestrator Agent —— 一个，全局唯一 || Orchestrator Agent — single, global

由 Copilot Studio 的 Generative Orchestration 充当。它不执行业务逻辑，只做三件事：理解用户意图、选择业务 Agent、把多 Agent 的回答合成一段连贯回复。所有界面（HomeDashboard / BriefMe / CopilotChat / ActivityCapture）的 mic 按钮最终都打到这一个 Orchestrator。 || Filled by Copilot Studio's Generative Orchestration. It owns no business logic — only three jobs: parse intent, pick the right domain agents, and compose multi-agent replies into one coherent answer. The mic on every screen (HomeDashboard / BriefMe / CopilotChat / ActivityCapture) ultimately hits this single Orchestrator.

Generative Orchestration（内置） || Generative Orchestration (built-in)

▼

Tier 2 · 业务 || Tier 2 · Domain

### Domain Agents —— 与业务概念一一对应 || Domain Agents — one per business concept

即第 04 节列出的 30+ Agent。每个 Agent 拥有自己的 system prompt、知识源（Dataverse 表 / SAP 虚拟表 / 知识库）与可调用工具集。Domain Agent 之间默认不直接互调，统一由 Orchestrator 串联，避免硬编码依赖。 || The 30+ agents from §04. Each owns its system prompt, knowledge sources (Dataverse tables / SAP virtual tables / knowledge bases) and callable toolset. Domain agents do NOT call each other directly by default — the Orchestrator stitches them together, eliminating hard-coded dependencies.

客户画像 / 商机评估 / 活动创建 … || Customer Profile / Opportunity Scoring / Activity Creation …

订单查询 / 物流查询 / 现场服务 … || Order Inquiry / Logistics / Field Service …

见 §04 全景图 || see §04 Agent Map

▼

Tier 3 · 工具 || Tier 3 · Tools

### Skill / Tool Layer —— 可被多个 Agent 复用 || Skill / Tool Layer — reusable across agents

原子能力，单一职责。包括 SAP Commerce Connector、Dataverse CRUD、AI Builder Prompt(GPT)、Form Processing、Azure AI Search、Power Automate Flow 等。同一工具可被任意 Domain Agent 调用，治理与权限由 Power Platform 集中管控。 || Atomic single-purpose capabilities: SAP Commerce Connector, Dataverse CRUD, AI Builder Prompt(GPT), Form Processing, Azure AI Search, Power Automate Flow, etc. Any tool can be called by any domain agent; governance and permissions are centrally enforced by Power Platform.

SAP Connector

Dataverse CRUD

AI Builder Prompt(GPT)

Form Processing

Azure AI Search（Phase 3） || Azure AI Search (Phase 3)

Power Automate Flow

设计原则：上层只调下层，跨层不可越级；任何新 Agent 加入只需在 Tier 2 注册并声明所需 Tier 3 工具，Orchestrator 通过描述自动学会调度。 || Rule: each tier only calls the tier below; no cross-tier shortcuts. Adding a new agent means registering at Tier 2 and declaring its Tier 3 tools — the Orchestrator learns to dispatch via descriptions, no code change needed.

01

### 并行扇出 · Fan-out || Fan-out (Parallel)

同一意图明显涉及多个独立信息源时，Orchestrator 同时调用多个 Domain Agent，并行返回片段回复，最后按 agent_chain 顺序渲染。延迟 ≈ max(各 Agent)，而非 sum。 || When one intent clearly spans independent info sources, the Orchestrator dispatches multiple domain agents in parallel, collects partial replies, and renders them in agent_chain order. Latency ≈ max, not sum.

示例：「Hospital Beta 最新进度？」→

客户画像 + 商机评估 + 订单查询

三 Agent 并行回答

02

### 顺序流水 · Sequential || Sequential Pipeline

后序 Agent 依赖前序 Agent 输出时（典型如"先抽实体再创建记录"），Orchestrator 在 Agent Flow 内串行调用，前一步输出作为下一步输入；任何一步失败 → 全流程回滚到 draft。 || When a downstream agent needs an upstream agent's output (e.g. "extract entities, then create record"), the Orchestrator chains them serially inside Agent Flow; if any step fails, the whole flow rolls back to draft.

示例：拜访录音 →

实体抽取

→

活动创建 Agent

→

商机创建 Agent

（带 confidence 拦截）

03

### 条件路由 · Routing || Conditional Routing

意图模糊或参数不全时，Orchestrator 先调用一个轻量分类 Agent 决策走向，再分发到对应 Domain Agent；若置信度低于阈值，触发反问而非猜测。 || When intent is ambiguous or parameters are missing, the Orchestrator first calls a lightweight classifier agent to decide the route, then dispatches to the right domain agent; if confidence is below threshold, it asks back rather than guessing.

示例：「这单怎么样了」→ 路由判断为「订单查询」还是「商机评估」→ 仅调用对应一方 || Example: "How's this deal?" → routed to either Order Inquiry or Opportunity Scoring — only one is called

04

### 审阅闭环 · Review-Loop || Review Loop

涉及写操作（创建活动、创建商机、下单）时，执行 Agent 先生成 draft 而非直接落库；由独立的审阅/督导 Agent 校验业务规则与重复检测；用户在 UI 一键 Confirm/Discard 才真正提交。 || For write operations (create activity / opportunity / order), the executing agent first produces a draft instead of committing; a separate review/coaching agent checks business rules and duplicates; the user must Confirm or Discard in the UI before persistence.

示例：商机创建 Agent →

商机督导 Agent

（重复检测 / 阶段合理性）→ 用户 Confirm

刚拜访完上海仁济医院张主任，他对监护仪 N17 感兴趣，要 12 台，下周三再约一次定标书细节。 || Just visited Dr. Zhang at Shanghai Renji Hospital — he wants 12 units of Monitor N17 and asked for a follow-up next Wednesday to finalise the tender.

Orchestrator

识别意图为「活动录入 + 商机线索」，决定走「顺序流水 + 审阅闭环」组合模式。 || Detects intent as "activity capture + opportunity lead"; chooses Sequential + Review-Loop composition.

工具：Generative Orchestration · 路由耗时 ≈ 200 ms || Tool: Generative Orchestration · routing ≈ 200 ms

实体抽取 || Entity Extract

抽出客户=上海仁济医院、联系人=张主任、产品=监护仪 N17、数量=12、下次跟进=下周三。 || Extracts customer = Shanghai Renji Hospital, contact = Dr. Zhang, product = Monitor N17, qty = 12, next follow-up = next Wed.

工具：AI Builder Prompt(GPT) + 自定义 schema || Tool: AI Builder Prompt(GPT) + custom schema

客户画像 Agent || Profile Agent

并行查询：仁济医院在 SAP/Dataverse 中已存在，最近 30 天 4 次拜访 · 信用 A 级 · 已签 MSA。 || Parallel query: Renji Hospital exists in SAP/Dataverse · 4 visits in last 30 d · credit grade A · MSA in place.

工具：Dataverse Virtual Table · SAP Connector || Tool: Dataverse Virtual Table · SAP Connector

活动创建 Agent || Activity Creation

生成 Activity draft（type=Visit, date=今天, 摘要 = 三句话, 下次 follow-up=下周三日历占位）。 || Produces Activity draft (type=Visit, date=today, 3-sentence summary, follow-up = next Wed calendar placeholder).

工具：Dataverse CRUD · Outlook Calendar || Tool: Dataverse CRUD · Outlook Calendar

商机创建 Agent || Opportunity Creation

检索到对该客户已存在监护仪 N17 商机（Identify 阶段）→

不创建新商机

，建议追加为既有商机的活动证据。

工具：SAP Commerce Opportunity 表 · 重复检测规则 || Tool: SAP Commerce Opportunity table · dedup rule

商机督导 Agent || Opp Coaching

校验：12 台 N17 + Identify 阶段 + 客户级 A → 触发"阶段建议升级到 Qualify"提示，附建议下一步：发送报价。 || Validates: 12× N17 + Identify stage + grade-A customer → suggests "upgrade stage to Qualify", with next-step recommendation: send quote.

工具：业务规则引擎（Power Fx） || Tool: business rule engine (Power Fx)

Orchestrator

把 5 段 agent 输出合成一段连贯回复 + 一张可一键 Confirm 的 draft 卡片回送 UI；用户 Confirm 后才落库。 || Composes the 5 agent outputs into one coherent reply + a single Confirm-able draft card sent back to the UI; persistence only happens on Confirm.

端到端 ≈ 3.2 秒（拜访结束到 UI 出现 draft） || End-to-end ≈ 3.2 s (utterance to draft on screen)

### ① 消息信封 Message Envelope || ① Message Envelope

所有 Agent 输入输出统一为 { role, agent_name, content, sources[], confidence, draft? } 结构；UI 按此结构渲染气泡与来源 chip，不感知 Agent 内部实现。 || Every agent's I/O is { role, agent_name, content, sources[], confidence, draft? }. The UI renders bubbles and source chips strictly from this shape — never aware of an agent's internals.

### ② 来源引用 Source Citation || ② Source Citation

任何 Agent 回答必须附带 sources[] 数组，标注 Dataverse 表/SAP 实体/知识库片段；CopilotChat 的"来源"行直接渲染，让销售一眼判断可信度。 || Every agent reply must carry a sources[] array — Dataverse table / SAP entity / KB snippet. CopilotChat's "Sources" row renders them so reps can judge credibility at a glance.

### ③ 共享会话记忆 Shared Memory || ③ Shared Memory

一次会话的中间结果（识别出的 accountId / opportunityId / 当前 BriefItem）写入 CopilotConversation.context；下游 Agent 不必从头再问，也无需用户重述。 || Mid-conversation results (resolved accountId / opportunityId / current BriefItem) are written to CopilotConversation.context, so downstream agents need not re-resolve and the user never repeats themselves.

结论：业务方新增 Agent 时只需遵守上述三条契约，即可被 Orchestrator 自动识别并被任何前端复用。这正是 Agent Map 中 30+ Agent 不会随规模变得失控的根源。 || Bottom line: new agents only need to honour these three contracts to be auto-discovered by the Orchestrator and reused by any frontend — which is why the 30+ agents in the Agent Map don't spiral into chaos as the system grows.

## #prototypes 06 / Interface Prototypes :: 界面原型：把四条原则落到屏幕上 || Prototypes: The Four Principles, Rendered on a Phone

把四条设计原则落到一线最高频的五个屏幕：开机看到的"今日大盘"、提供主动播报的"今日播报"，以及活动录入 / 客户信息查询 / 商机创建三个动作屏。本文档为方案视角，仅展示界面终态；每屏对应的 Vibe Coding 提示词与平台地基 Bootstrap 提示词集中收录在配套设计文档中。 || The four design principles, rendered onto the five highest-frequency screens for field sales: the launch "Today at a Glance", a proactive Brief Me screen, and three action screens — activity capture / customer inquiry / opportunity creation. This proposal shows only the finished UI; the per-screen Vibe Coding prompts and the platform Bootstrap prompt live in the companion design doc.

9:41

5G ▮▮

M

早上好 || Good morning

Maria Souza

⚙

今日拜访 || Visits Today

4

2 已确认 · 2 待出发 || 2 confirmed · 2 to go

活跃商机 || Active Opps

12

2 风险 · 需关注 || 2 at risk · review

本月业绩 || MTD Quota

68%

↑ 8% vs 上月 || ↑ 8% vs last mo

待跟进 || Follow-ups

5

1 延期 · 1 工单 || 1 overdue · 1 ticket

今日摘要 || Today's Briefing

AI 生成 || AI Generated

!

9:00 Hospital Alpha · 重点跟进 A3 演示反馈 || 9:00 Hospital Alpha · follow up on A3 demo feedback

▲

Hospital Gamma 昨日提交 RFP · 14:00 拜访前需准备 || Hospital Gamma RFP submitted yesterday · prep before 14:00 visit

●

Hospital Delta · A1 商机阶段升级 Propose → Negotiate || Hospital Delta · A1 opp moved Propose → Negotiate

⊙

昨日 N1 订单已清关 · 预计明日交付 Hospital Alpha || N1 order cleared customs · ETA tomorrow to Hospital Alpha

指标分析 + 客户画像 + 订单查询 Agent || KPI Analytics + Customer Profile + Order Inquiry agents

●

语音播报 || Brief Me

＋

新拜访 || New Visit

●

按住对 Copilot 说话 || Hold to talk to Copilot

原则 01 + 04 || Principle 01 + 04

### 首页 Dashboard || Home Dashboard

开机即得"今日大盘"：身份 + 4 张 KPI + AI 生成的今日摘要 + 语音播报/新拜访快捷入口，底部为常驻语音气泡。 || On launch the rep sees today's pulse: identity + 4 KPIs + an AI-generated daily briefing + Brief Me / New Visit shortcuts, with the persistent voice bubble pinned at the bottom.

9:41

5G ▮▮

←

今日播报 · 6 章节 2 分 40 秒 || Brief Me · 6 chapters 2m 40s

文 || Aa

风险预警 || Risk

03 / 06 · 00:48–01:25

A 客户两次延期回复 · 履约掉至 78% || Account A: 2 reply delays · fulfilment 78%

14 天连续 2 次延期：付款承诺从 4/18 推到 4/26 又推到 5/03；今晨内部群已被 @两次，履约 96% → 78%。 || 2 reply delays in 14 days: payment commitment slid 4/18 → 4/26 → 5/03; @-mentioned twice in the team channel this morning, fulfilment 96% → 78%.

- 对方采购总监本周休假 · 已切换接口人为副总监 Lucia || Procurement lead on PTO this week · contact switched to deputy Lucia
- 信用风险分上调至 B+，回款超 30 天将触发预警 || Credit risk score raised to B+; >30-day overdue will trigger alert

-18% · 履约

SLA 超 4 天

¥620 万 在途

3 单待发货

今天 15:30 你正好在浦东 · 距 A 客户 2.4 km · 副总监今日在岗 || You're in Pudong at 15:30 · 2.4 km from Account A · deputy on-site today

加入今日拜访 || Add to today

左右滑动 · 切换章节 || Swipe ← → to switch chapters

1

×

▾

▶

01:08 / 02:40

原则 04 · 反向播报 || Principle 04 · Reverse Briefing

### 今日播报 Brief Me || Brief Me

单张 BriefCard 承载今日全部背景：摘要 + 要点 + metric chip + 加入今日 CTA。底部气泡短按播放、长按对话，左侧 chip 切 1×/1.5×/2×，dots 切章节。 || One BriefCard holds today's context: summary, bullets, metric chips, Add-to-Today CTA. The bottom bubble short-taps to play, holds to talk; left chip cycles 1×/1.5×/2×, dots switch chapters.

9:41

5G ▮▮

←

新拜访 · Hospital Alpha || New Visit · Hospital Alpha

⋯

"刚拜访了 Hospital Alpha，院方对 A1 型号比较感兴趣，预计下季度采购 8 台，下周三再上门做技术演示。" || "Just visited Hospital Alpha. They're interested in the A1 model, plan to buy 8 next quarter, and want a tech demo on-site next Wednesday."

语音转写 · 02:14 || Voice transcript · 02:14

拜访摘要 || Visit Summary

AI 草稿 || AI Draft

客户 || Customer

Hospital Alpha

主题 || Subject

A1 产品介绍 || A1 product intro

下一步 || Next Step

下周三技术演示 || Tech demo next Wed

商机草稿 || Opportunity Draft

AI 推断 || AI Inferred

产品 · 数量 || Product · Qty

A1 × 8

信心度 || Confidence

60%

确认 || Confirm

编辑 || Edit

重录 || Redo

●

按住对 Copilot 说话 || Hold to talk to Copilot

原则 02 + 03 || Principle 02 + 03

### 活动录入 || Activity Capture

语音 → 自动生成拜访摘要 + 商机草稿 + 跟进动作，用户只做"确认 / 编辑 / 重录"三选一。 || Voice → auto-generated visit summary + opportunity draft + next action. The user picks one of three: confirm, edit, or redo.

9:41

5G ▮▮

←

Ask Copilot

⋯

Hospital Beta 的最新商机进度？ || What's the latest opportunity status for Hospital Beta?

⊙ 商机评估 Agent || ⊙ Opportunity Agent

Hospital Beta 当前 3 个活跃商机： || Hospital Beta currently has 3 active opportunities:

监护仪 N17 || Monitor N17

× 12

Negotiate

监护仪 A2 || Monitor A2

× 4

Identify

超声 R9 || Ultrasound R9

× 2

Propose

⊙ 客户画像 Agent || ⊙ Customer Profile Agent

最近 30 天 4 次拜访 · NPS 提升 12 点 · 上次接触 04/22 || 4 visits in past 30d · NPS up 12 pts · last touch 04/22

来自 SAP Commerce · Dataverse Virtual Table || From SAP Commerce · Dataverse Virtual Table

●

问点别的… || Ask anything else…

↑

原则 04 || Principle 04

### 客户信息查询 || Customer Inquiry

用户表达意图，Generative Orchestration 自动调用客户画像 + 商机评估两个 Agent 并合成回答，无需菜单导航。 || The user states intent; Generative Orchestration calls Customer Profile and Opportunity agents and composes the answer. No menu navigation needed.

9:41

5G ▮▮

←

商机草稿 || Opportunity Draft

⋯

AI 已生成 || AI Generated

待确认 || To Confirm

整体信心度 || Overall Confidence

78%

客户 || Customer

Hospital Alpha

产品线 || Product Line

A1 监护仪 || A1 Monitor

数量 || Quantity

8 台 || 8 units

预计金额 || Est. Amount

USD 96,000

阶段 || Stage

Identify

预计成交 || Est. Close

2026 Q3

溯源 || Provenance

Source

04/29 拜访活动 · Hospital Alpha || 04/29 visit · Hospital Alpha

历史成交参考 · 类型相似 · 3 单 || 3 similar past deals referenced

确认创建 || Confirm & Create

编辑详情 || Edit Details

确认后将异步回写 SAP Commerce || Will async-sync to SAP Commerce after confirmation

原则 03 || Principle 03

### 商机创建 || Opportunity Creation

每个 AI 生成结果带"信心度 + 来源 + 一键编辑"，写入走"草稿 → 确认 → SAP 同步"三段式，绝不黑盒提交。 || Every AI output carries confidence · source · one-tap edit. Writes follow Draft → Confirm → SAP sync — never a black-box submit.

:::callout { title: "三个原型共同呈现的设计取舍 || Trade-offs Embodied by All Three Prototypes" }
① 主动作永远是橙色麦克风，键盘是隐藏的 fallback；② 任何 AI 输出必须带"AI 草稿"标签和置信度，写入前一律可编辑；③ Agent 名字明示在回答上方，让用户对"是谁在回答我"有感知，便于后续追溯与调优。 || (1) The primary action is always the orange mic; the keyboard is the hidden fallback. (2) Every AI output bears an "AI Draft" tag and confidence score, and must be editable before write. (3) The agent's name is shown above its reply, so the user knows who answered — enabling traceability and tuning.
:::

## #day 07 / A Day in the Life :: 用户的一天：一线销售 Maria 的智能拜访日 || A Day in the Life: Maria, Field Sales, on a New CRM

用一个具体角色把架构落到使用现场。Maria 是客户巴西区域的资深销售，负责 12 家三甲医院。下面是她在新方案上线后的一天——所有交互都来自前述 Agent 的实际调用路径。 || A concrete persona grounds the architecture in real usage. Maria is a senior sales rep in the customer's Brazil region covering 12 large hospitals. Below is one of her days under the new solution — every interaction maps to a real agent call path described earlier.

07:50

### 清晨 · 通勤路上 — AI 主动播报今日预案 || Morning · Commute — AI Briefs the Day

Maria 在车上戴上耳机打开 App，语音助手主动播报：今日 4 个拜访、2 个进行中商机风险、1 张昨日延期工单。播报内容由 **指标分析 Agent + 客户画像 Agent** 拼装。 || Maria puts in her earbuds in the car. The voice assistant proactively briefs her: 4 visits today, 2 at-risk active opportunities, 1 ticket carried over from yesterday. The briefing is composed by the **KPI Analytics Agent + Customer Profile Agent**.

"今天上午 9 点 Hospital Alpha，关注点：A3 型号演示反馈；下午 2 点 Hospital Gamma，注意他们昨天提交了一份 RFP——我已经把要点摘要放在拜访卡片里。" || "9 AM at Hospital Alpha — focus: A3 demo feedback. 2 PM at Hospital Gamma — note: they submitted an RFP yesterday; I've already put the key points on your visit card."

08:55

### 到访前 5 分钟 — 客户画像速览 || 5 Min Before Arrival — Customer Snapshot

停车场内打开 Hospital Alpha 的拜访卡片，**客户画像 Agent** 已聚合：近 3 次拜访摘要、当前 3 个开放商机进度、上次的 follow-up action 清单、医院最近 6 个月的设备采购倾向。Maria 三屏滑完，进电梯。 || In the parking lot Maria opens Hospital Alpha's visit card. The **Customer Profile Agent** has already aggregated last 3 visit summaries, 3 open opportunities and stages, the last follow-up list, and the hospital's purchase trend over the past 6 months. Three swipes — and she's in the elevator.

10:30

### 拜访结束 · 走出医院 — 一句话录入 || Visit Done · Walking Out — One-Sentence Capture

Maria 按住语音键说出此次拜访结果。**客户拜访 Agent** 自动生成结构化活动反馈，**商机评估 Agent** 检测到一个新商机线索并生成草稿，AI 同时推荐下一步动作。三张卡片左右滑动确认。 || Maria holds the voice button and narrates the visit. The **Customer Visit Agent** auto-generates a structured activity log; the **Opportunity Scoring Agent** detects a new lead and drafts an opportunity; AI also recommends the next action. Three cards — swipe to confirm.

"刚见完主任医生和采购主任，他们对 A1 型号试用结果满意，初步意向 8 台，希望我们月底前提交正式报价。采购主任提到 ICU 区也在评估升级监护仪，可能 6 月启动。" || "Just met the head physician and head of procurement. They're happy with the A1 trial — initial intent 8 units, formal quote needed by month-end. Procurement also mentioned ICU is evaluating a monitor upgrade, possibly kicking off in June."

12:15

### 午餐时间 — 自助查询订单状态 || Lunch — Self-Service Order Status

客户来电问之前的 4 台监护仪 N1 是否到港。Maria 直接说"查一下 Hospital Alpha 上个订单的物流"，**订单查询 + 物流查询 Agent** 联合返回当前状态、清关进度、预计交付日。无需打开任何菜单。 || A customer calls asking whether the 4 N1 monitors have arrived at port. Maria simply says "check the logistics of Hospital Alpha's last order". The **Order Inquiry + Logistics Agents** jointly return current status, customs progress, and ETA. No menu opened.

15:40

### 下午 · 客户院内 — 现场支持 || Afternoon · On-site — Field Support

Hospital Gamma 的设备使用培训结束，对方临床工程师追问一台旧机型的故障处理流程。Maria 让 **维修知识检索 Agent** 搜索故障代码，10 秒内给出排查步骤与备件号。 || A device training session at Hospital Gamma wraps up. Their clinical engineer asks how to handle a fault on an older model. Maria lets the **Repair Knowledge Agent** look up the fault code — within 10 seconds it returns troubleshooting steps and the part number.

18:20

### 傍晚 · 返回酒店 — 自动生成日报 || Evening · Back at the Hotel — Auto-Generated Daily Report

**工作总结 Agent** 已基于今日全部活动、商机更新、跨系统调用记录，自动生成一份双语日报草稿（英文 + 葡文）。Maria 读一遍、改两句、一键提交给区域经理。 || The **Daily Summary Agent** has already drafted a bilingual daily report (English + Portuguese) based on today's activities, opportunity updates, and cross-system call traces. Maria reads it, tweaks two sentences, one-tap submits to the regional manager.

"今天我没有打过一个字。" || "I didn't type a single character today."

## #delivery-method 08 / Delivery Method :: 交付方式：Plan-First · Vibe Build · ALM Promote || How We Build & Ship: Plan-First · Vibe Build · ALM Promote

不是传统瀑布交付，也不是纯 vibe coding “生成完事”。本方案采用 Microsoft 官方 Power Platform ALM + 新发布的 Plan Designer 组合出三段式交付：Plan-First 起手、Vibe Build 出原型、ALM Pipeline 推到生产。详细六阶段路线图见《开发者设计文档》。 || Not waterfall. Not vibe-coding-as-shipping. This proposal combines Microsoft's official Power Platform ALM with the new Plan Designer into a three-stage delivery pattern: Plan-First kickoff, Vibe Build prototyping, ALM pipeline promotion. The full six-stage path lives in the Developer Design Doc.

:::comparison { title: "三段式交付模型 || Three-Stage Delivery Model" }
::versus 阶段 1 · Plan-First || Stage 1 · Plan-First
### 一句话 → v0 Plan || One Sentence → v0 Plan
进 Power Apps Plan Designer，三个官方 Agent（Requirement / Data / Solution）接力生成用户角色、Dataverse 表与推荐技术栈。后续三轮人审使 v0 收敛到 SAP 共生边界，输出锁定的 Data Model + Phase 1 技术清单。 || In Power Apps Plan Designer, three official agents (Requirement / Data / Solution) emit user roles, Dataverse tables and a recommended tech mix. Three human-led refine rounds tighten v0 to the SAP-coexistence boundary, producing a locked data model and Phase 1 tech list.

::versus 阶段 2 · Vibe Build || Stage 2 · Vibe Build
### Bootstrap + 一屏一 Prompt || Bootstrap + One Prompt per Screen
一个 Bootstrap 提示词拉起 Solution / Dataverse / Connector / Flow 占位，四屏提示词逐屏生成可演示原型；SAP API 调用、性能敏感视图、安全审计交给 pro-code（PCF / Plug-in / Custom Connector），Vibe 与 Pro-Code 边界明确。 || A single Bootstrap prompt scaffolds Solution, tables, connectors and flow stubs; four screen prompts generate UI screen-by-screen. SAP API calls, perf-sensitive views and security-audit logic hand off to pro-code (PCF / plug-in / custom connector). The vibe-vs-pro boundary is explicit, not implicit.

::versus 阶段 3 · ALM Promote || Stage 3 · ALM Promote
### Solution 化 + Pipeline 推送 || Solution-ize + Pipeline Promote
unmanaged Solution 从 Dev 导出，以 SolutionPackager 解包进 Git，prompt 与代码同仓；CI 打出 managed 包，In-product Pipeline 依次推 Test / UAT / Prod，Patch 走 hotfix、Upgrade 走 minor；App Insights 监控拜访完成率、Agent 成功率、SAP 写入时延。 || Unmanaged solution exports from Dev, unpacked via SolutionPackager into Git alongside prompts; CI builds a managed package; the in-product pipeline pushes Test / UAT / Prod with patches for hotfixes and upgrades for minor releases; App Insights tracks visit-completion rate, agent success rate and SAP write latency.
:::

## #roadmap 09 / Implementation Roadmap :: 实施路线图：6 个月四阶段 || Implementation Roadmap: Six Months in Four Phases

避免"一次性大爆炸式上线"——分四个阶段交付，每阶段有明确的可衡量价值与回退点。3 个月内首个生产 Agent 真实服务销售；6 个月覆盖 Phase 1 标记的全部高频 Agent。 || No big-bang launch — four phased deliveries, each with measurable value and a clear rollback point. The first production agent serves real sales within 3 months; all Phase 1 high-frequency agents go live within 6 months.

Phase 1 · M0–M2

### 地基搭建 + 概念验证2 个月 · 关键里程碑：客户拜访 Agent 在试点区域可用 || Foundations + Proof of Concept2 months · key milestone: Customer Visit Agent live in pilot region

- Power Platform 环境拓扑（Dev / UAT / Prod / 沙盒）与 DLP 策略设计 || Power Platform environment topology (Dev / UAT / Prod / sandbox) and DLP policy design
- SAP Commerce 数据接入：搭建 Custom Connector + Virtual Tables（覆盖客户、活动、商机三个核心实体） || SAP Commerce ingress: Custom Connector + Virtual Tables for the three core entities — customer, activity, opportunity
- 体验层最小可用：Power Apps Mobile 主页 + 语音录入 + 拜访卡片 || Experience MVP: Power Apps Mobile home + voice capture + visit card
- 认知层：打通设备原生语音（Web Speech API）→ AI Builder Prompt 模型抽取字段的端到端拜访录入流程 || Cognitive layer: end-to-end visit-capture flow from device-native voice (Web Speech API) to AI Builder Prompt extraction
- 试点：1 个区域（如巴西） · 10 名销售真实使用 · 收集语料 || Pilot: 1 region (e.g. Brazil) · 10 reps in real use · collect corpus

Phase 2 · M3–M4

### 核心 Agent 上线 + 编排框架2 个月 · 关键里程碑：Phase 1 ★ Agent 全部投产 || Core Agents Live + Orchestration Framework2 months · key milestone: all Phase 1 ★ agents in production

- Copilot Studio 编排框架成型：注册中心、Agent 调度、统一对话入口 || Copilot Studio orchestration framework: registry, agent dispatch, unified chat entry
- 商机评估、订单查询、物流查询、客户画像、工作总结 5 个 Agent 上线 || 5 agents go live: Opportunity Scoring, Order Inquiry, Logistics Inquiry, Customer Profile, Daily Summary
- Power Automate 异步回写流程上线（草稿→确认→SAP 同步） || Power Automate async writeback flow live (Draft → Confirm → SAP sync)
- 试点扩展到 3 个区域 · 100 名销售 || Pilot expands to 3 regions · 100 reps
- 建立 AI 质量基线：意图识别准确率、商机草稿采纳率、平均节省时间 || Establish AI quality baseline: intent accuracy, opportunity draft adoption rate, avg time saved

Phase 3 · M5

### 售后与知识 Agent 拓展1 个月 · 关键里程碑：覆盖售后场景闭环 || Service & Knowledge Agents1 month · key milestone: full after-sales loop covered

- 维修知识检索 Agent + 现场服务 Agent + 备件推荐 Agent || Repair Knowledge Agent + Field Service Agent + Spare Parts Agent
- 智能知识库：以 SharePoint + Dataverse 知识源做 RAG 索引 || Knowledge base: RAG indexing over SharePoint + Dataverse sources
- Microsoft Teams 内置 Copilot 入口，覆盖会议中临时查询 || Copilot in Teams entry covers in-meeting ad-hoc queries
- 区域级运营看板基于 Power Apps 自定义页面 + Dataverse 视图实现，由考核管理 Agent 推送关键洞察 || Regional ops board built on Power Apps custom pages + Dataverse views; KPI Agent pushes key insights

Phase 4 · M6

及以后 || and beyond

### 全球推广 + 持续演进持续 · 关键里程碑：覆盖全部销售人员 || Global Rollout + Continuous EvolutionOngoing · key milestone: all sales reps covered

- 全球推广：分批接入欧洲、亚太、北美、中东等区域 || Global rollout: phase Europe, APAC, North America, Middle East
- 建立 Agent 运营机制：每月一次 prompt/工具优化、新 Agent 评审 || Agent operations cadence: monthly prompt/tool optimisation and new-agent review
- 引入预测性维护、销售预测等高阶 Agent || Introduce advanced agents — predictive maintenance, sales forecasting
- 形成内部 Citizen Developer 培训体系，让区域业务专家参与新 Agent 设计 || Stand up an internal Citizen Developer programme so regional business SMEs co-design new agents

:::callout { title: "风险控制三原则 || Three Principles of Risk Control" }
① 任何 AI 写入操作均经过"草稿确认"，不直接覆盖 SAP；② 每个 Agent 都可独立下线/灰度，不影响其他流程；③ 每阶段结束做"销售真实满意度"测量（NPS + 关键流程节省时间），未达标禁止进入下一阶段。 || (1) Every AI write goes through Draft-Confirm; SAP is never overwritten directly. (2) Every agent can be independently dark-launched or rolled back without affecting other flows. (3) At the end of every phase we measure real sales satisfaction (NPS + time saved on key flows); the next phase cannot start until the bar is met.
:::

## #licensing 10 / Recommended Product Configuration :: 建议产品配置 || Recommended Product Configuration

本节按 Microsoft 产品/SKU 维度组织：每个 SKU 列出"承担的用途、适配的用户角色、估算逻辑"三件事，便于直接套到客户的人头规模上估出量级。具体单价请以微软官方报价或合作伙伴报价为准。 || This section is organised by Microsoft product/SKU. For each SKU we spell out three things — what it does, which user roles it covers, and how to estimate quantity — so it can be directly mapped onto the customer's headcount. Actual unit prices follow official Microsoft or partner quotes.

| SKU | 用途 || Purpose | 适配用户角色 || Target User Roles | 估算逻辑 || Sizing Logic |
| --- | --- | --- | --- |
| Power Apps Premium | 移动 App 运行时：解锁 Premium 连接器（含 SAP / Custom）、Dataverse 完整能力、Custom Pages 与 Mobile App。 || Mobile app runtime: unlocks Premium connectors (incl. SAP/Custom), full Dataverse, custom pages, and Mobile App. | 一线销售 / 服务工程师、区域经理 / 业务管理员、公民开发者 / Maker || Field Sales / Service Engineers, Regional Managers / Business Admins, Citizen Developers / Makers | 按"实际使用 App 的命名用户数"计：Phase 1 试点 ~10–20、Phase 2 ~100、Phase 4 全球推广按目标销售人数 1:1 计。 || Count by named users actually using the app: ~10–20 in Phase 1 pilot, ~100 in Phase 2, 1:1 with target sales headcount in Phase 4 rollout. |
| Copilot Studio User | Agent 编辑/发布权限：用于编排框架、新 Agent 设计、知识源维护。 || Agent authoring/publishing entitlement: for orchestration framework, new agent design, knowledge source maintenance. | 公民开发者 / Maker、中央 IT 编排团队 || Citizen Developers / Makers, Central IT orchestration team | 按 Maker 头数计，通常远小于消费者人数：Phase 2 一般 5–10 个授权即可启动，Phase 4 推广至各区域业务专家时按 1 区域 1–2 人扩配。 || Count by Maker headcount, typically much smaller than consumers: 5–10 seats at Phase 2; scale to 1–2 per region at Phase 4 rollout. |
| Copilot Studio Credits | 统一计量的运行时与 AI 能力消耗：覆盖语音 → 意图 → Agent 调用的对话消息，以及 Prompt(GPT)、表单识别 / OCR、实体抽取、分类等预构建 AI 能力，前端 Code App 与编排层 Agent 共用。语音输入走设备原生能力，无需额外语音订阅。 || Unified meter for runtime + AI consumption: covers voice → intent → agent conversation messages plus Prompt(GPT), form processing/OCR, entity extraction, classification prebuilt capabilities — shared by the front-end Code App and orchestration agents. Voice input uses device-native APIs; no extra speech subscription. | 租户级（不与人头绑定，由各 Agent 共享） || Tenant-level (not per-user; shared across agents) | 按"月活用户 × 日均对话条数 × 22 天 + 高耗 AI 调用次数 × 单次 Credits"估包：Phase 1 用最小包验证基线（如 10 人 × 20 条 × 22 ≈ 4.4k 消息/月）；Phase 2 起按 Agent 实际消耗 P95 续包，并设置租户级上限保护。 || Estimate by MAU × daily turns × 22 days + heavy-AI calls × credits per call: Phase 1 starts with the smallest pack as baseline (e.g. 10 users × 20 turns × 22 ≈ 4.4k messages/mo); from Phase 2 top up against per-agent P95 consumption with tenant-level caps. |
| Managed Environments + Dataverse Capacity | 平台治理：环境拓扑、Pipelines、详细使用分析;预留 Dataverse 数据库与文件容量，承载 AI 元数据、对话日志、知识源缓存。 || Platform governance: environment topology, Pipelines, detailed usage analytics; reserve Dataverse database & file capacity for AI metadata, conversation logs, knowledge source caches. | 租户级（平台 / 中央 IT 持有） || Tenant-level (owned by Platform / Central IT) | Managed Environments 与 Premium 授权数量对齐免单独采购；Dataverse 容量按"基线包 + 月增量"估，预留 30% 富余应对 Phase 推进。 || Managed Environments aligns to Premium licence count, no separate purchase; Dataverse capacity sized by baseline pack + monthly increment with 30% headroom for phase ramp-up. |
| Microsoft 365 E3 / E5 | 协作与移动入口：承载 Entra ID SSO、Teams Copilot 入口、SharePoint 知识源、Outlook 集成（自动 follow-up 邮件）。 || Collaboration & mobile entry: hosts Entra ID SSO, Copilot in Teams, SharePoint knowledge source, Outlook integration (auto follow-up emails). | 所有内部用户（销售、管理者、IT、Maker） || All internal users (sales, managers, IT, makers) | 复用客户已有 M365 授权，本方案不重复采购；只需确认目标人群均已持有 E3/E5 且启用 Teams、SharePoint。 || Reuse the customer's existing M365 licences — this proposal does not re-buy them; just confirm the target population has E3/E5 with Teams and SharePoint enabled. |
| Microsoft Purview | 合规与审计：AI 调用审计、敏感信息（PII）发现与策略、Copilot 互动追踪，满足区域合规要求。 || Compliance & audit: AI invocation audit, PII discovery & policies, Copilot interaction tracking — meets regional compliance requirements. | 租户级 · 由合规 / 安全团队配置 || Tenant-level · configured by Compliance / Security team | 已有 M365 E5 用户可直接启用；E3 用户需补 Purview 加载项。按"受合规约束的人数"计授权数。 || M365 E5 customers can enable directly; E3 customers add the Purview add-on. Licence count = headcount under compliance scope. |

备注 · 复用 vs 新购 vs 按用量计费：① 可复用客户已有授权 — Microsoft 365 E3 / E5（承载 Entra ID、Teams、SharePoint、Outlook 集成）、Microsoft Purview（E5 已含；E3 用户需补加载项）、Managed Environments（与既有 Power Platform 治理体系合并）。② 需新购订阅授权 — Power Apps Premium（按命名用户）、Copilot Studio Credits（按消息+AI 调用估包）、Copilot Studio User（按 Maker 头数）、Dataverse 增量容量。③ 配套 Azure 服务（按用量计费，无需预购授权） — API Management + Service Bus（SAP 集成与回写）、Key Vault（凭据托管）、Application Insights / Monitor（端到端可观测）、Blob Storage（拜访照片 / 设备铭牌等大文件）、AI Search（Phase 3 售后知识库语义检索）。Azure 部分按月度实际用量结算，前期成本可控、可随业务节奏弹性增减。 || Note · Reuse vs Buy vs PAYG: (1) Reuse existing licences — Microsoft 365 E3/E5 (Entra ID, Teams, SharePoint, Outlook integration), Microsoft Purview (included in E5; add-on for E3), Managed Environments (folded into existing Power Platform governance). (2) New subscription licences required — Power Apps Premium (per named user), Copilot Studio Credits (sized by messages + AI calls), Copilot Studio User (per Maker headcount), Dataverse incremental capacity. (3) Supporting Azure services (pay-as-you-go, no upfront licence) — API Management + Service Bus (SAP integration and writeback), Key Vault (credential vault), Application Insights / Monitor (end-to-end observability), Blob Storage (visit photos / device nameplates), AI Search (Phase 3 service knowledge semantic search). Azure services bill by actual monthly consumption, keeping early-stage cost controlled and elastic with business pace.

## #benefits 11 / Expected Benefits :: 方案期望收益 || Expected Benefits

收益从"销售个人体验"、"业务过程质量"、"组织规模化能力"三个维度展开。下列指标为本方案的设计目标值，需要在 Phase 1 试点期间通过实际测量校准基线，避免空泛承诺。 || Benefits are framed across three dimensions: sales experience, process quality, and organisational scalability. The metrics below are design targets — Phase 1 pilots must establish a measured baseline to avoid empty promises.

A · SALES EXPERIENCE

### 让销售从"被迫使用"转向"主动使用" || Move Sales From Forced Use to Voluntary Use

面向销售个人：录入更快、表单更少、体验更顺，从而把时间还给客户。 || For the individual rep: faster capture, fewer forms, smoother experience — giving time back to the customer.

A1

### 拜访录入耗时 || Visit Capture Time

≤ 30 秒 / 次 || ≤ 30 sec per visit

口语录音直接生成活动反馈 + 商机草稿，相比事后回酒店打开桌面端补录的 5–15 分钟压缩一个数量级。 || A spoken recording directly generates the activity log + opportunity draft — an order of magnitude faster than the 5–15 minutes of after-hours desktop entry back at the hotel.

目标值 · 试点期测真实分布 || Target value · pilot measures actual distribution

A2

### 每日"被表单消耗"的时间 || Daily Time Burned on Forms

显著下降 || Substantial drop

表单转为 AI 草稿 + 用户确认；销售每天用于行政性维护的时间下降，腾出客户面对面时间。 || Forms become AI drafts + user confirmation; daily time spent on administrative upkeep falls, freeing up face-time with customers.

销售时间日志或问卷自报告 || Sales time logs or self-reported surveys

A3

### 系统使用意愿（NPS） || System Usage Intent (NPS)

被迫用 → 主动用 || Forced → Voluntary

用 NPS / CSAT 测量；目标从当前桌面 CRM 的"被迫使用"区间进入"主动使用"区间。 || Measured by NPS / CSAT; target moves from the current desktop CRM's forced-use band into the voluntary-use band.

Phase 1 与 Phase 2 末分别测量 || Measure at end of Phase 1 and Phase 2

B · PROCESS QUALITY

### 让业务数据更新鲜、更完整、更可决策 || Make Business Data Fresher, Fuller, More Decision-Ready

面向流程与数据：缩短从动作到落库的时延，提升商机识别与售后响应。 || For process and data: shorten the gap between action and persistence; improve opportunity discovery and after-sales response.

B1

### 拜访记录时效性 || Visit-Log Freshness

次日补录 → 现场即录 || Next-day catch-up → on-site capture

移动 + 语音让录入发生在拜访结束 5 分钟内，区域经理看到的是"昨天"而非"上周"的数据。 || Mobile + voice means capture happens within 5 minutes after a visit; the regional manager sees yesterday's data, not last week's.

拜访发生 → 系统落库时延中位数 || Median latency: visit → record persisted

B2

### 商机识别覆盖率 || Opportunity Discovery Coverage

显著上升 || Substantial uplift

商机评估 Agent 主动从拜访摘要识别潜在线索并提示确认，把"靠人脑判断"变成"AI 提示 + 人工确认"，减少漏报。 || The Opportunity Scoring Agent proactively detects leads from visit summaries and prompts for confirmation, replacing rely-on-human-judgement with AI-suggest + human-confirm and reducing misses.

商机新建数 / 拜访数比值 || New opportunities / visits ratio

B3

### 数据质量一致性 || Data Quality & Consistency

必填字段完整度 ↑ || Required-field completeness ↑

AI 草稿一次填齐 10+ 字段（产品线、信心度、阶段、关联客户等），相比手填"只填关键 3–5 个"，下游分析与预测可用数据增多。 || An AI draft fills 10+ fields in one shot (product line, confidence, stage, linked accounts…) versus the typical hand-filled 3–5 key fields — yielding more usable data for downstream analysis and forecasting.

核心商机字段填写完整率 || Completeness rate of core opportunity fields

B4

### 售后响应速度 || After-Sales Response Speed

现场 10 秒内拿到答案 || Answer on-site in under 10 seconds

维修知识检索 Agent + 故障识别 Agent 让工程师不再翻文档；Phase 3 上线后直接影响客户感知质量。 || The Repair Knowledge Agent + Fault Identification Agent let engineers stop flipping through docs; once Phase 3 ships, customer-perceived quality is directly impacted.

First-Time-Fix 率 + 平均响应时间 || First-Time-Fix rate + avg response time

C · SCALABILITY

### 让方案在多区域、多语言、低耦合下持续扩展 || Sustain Multi-Region, Multi-Language, Low-Coupling Growth

面向组织能力：交付提速、跨区复用、对 SAP 零侵入、可由业务专家共建。 || For organisational capability: faster delivery, cross-region reuse, zero SAP intrusion, and business-SME co-build.

C1

### 新功能交付节奏 || New-Feature Delivery Cadence

季度 → 周 || Quarters → Weeks

低代码 + Code App + Vibe Coding 让新增 Agent / 字段 / 页面以"天/周"上线，对比 SAP 端定制的"季度级"周期。 || Low-code + Code App + Vibe Coding let new agents / fields / pages ship in days or weeks, versus SAP-side customisation's quarterly cadence.

Phase 2 后新增 Agent 平均上线时长 || Average ship time of new agents after Phase 2

C2

### 多语种与多区域复用 || Multi-Language & Multi-Region Reuse

一套 Agent · 多语言开箱 || One agent set · multi-language out of the box

设备原生语音识别支持多语种，转写文本由 AI Builder Prompt(GPT) 理解；同一套 Agent 服务葡 / 西 / 英 / 法 / 阿区域。 || Device-native speech recognition supports multiple languages; transcripts are understood by AI Builder Prompt(GPT). The same agent set serves PT/ES/EN/FR/AR regions.

区域本地化工作量显著低于传统方案 || Regional localisation effort substantially lower than traditional builds

C3

### 对 SAP Commerce 的侵入度 || Intrusion Into SAP Commerce

零定制（SAP 不动） || Zero customisation (SAP untouched)

所有写入通过异步回写 SAP，不要求 SAP 端定制开发，规避与 SAP 升级 / 补丁 / 运维节奏的耦合风险。 || All writes go through async writeback into SAP — no SAP-side customisation required, decoupling from SAP upgrade / patch / ops cadence.

SAP 仅暴露既有 API，不新增功能 || SAP only exposes existing APIs; no new features

C4

### Citizen Developer 网络 || Citizen Developer Network

区域业务专家可参与设计 || Regional business SMEs co-design

低代码让区域业务专家参与新 Agent 设计与知识库维护，减少对中央 IT 的瓶颈依赖。 || Low-code lets regional business SMEs help design new agents and maintain knowledge sources, easing the bottleneck on central IT.

Phase 4 起逐区域培养 Maker || Cultivate Makers region-by-region from Phase 4

:::callout { title: "收益度量三原则 || Three Principles of Benefit Measurement" }
① 上述指标为设计目标值，必须在 Phase 1 试点期间建立基线后再做对比，杜绝"未实施先承诺"；② 每个指标都对应可持续监测的数据源（用户行为日志 + Agent 调用日志 + Dataverse 业务读出），通过 Power Apps 自定义页面与 Dataverse 视图直接呈现；③ 每季度公布一次度量结果，未达标的指标进入下一季度的 Agent / 体验优化清单。 || (1) The figures above are design targets — they must be compared against a baseline established during Phase 1, ruling out promise-before-implement. (2) Every metric maps to a continuously observable data source (user behaviour logs + agent invocation logs + Dataverse business reads), surfaced directly via Power Apps custom pages and Dataverse views. (3) Results are published quarterly; any metric missing target enters the next quarter's agent / experience optimisation backlog.
:::

## #references 12 / References :: 参考来源 || References

本方案参考了客户提供的"AI 应用 Agent 全景图"与现有 SAP Commerce CRM 截图，并基于 Microsoft 官方文档构建技术选型。 || This proposal references the customer-provided AI Agent Landscape and current SAP Commerce CRM screenshots, with technology choices grounded in official Microsoft documentation.

- [1] Microsoft Power Platform | Power Apps Code App、Power Automate、Power Pages 官方文档 || Official docs for Power Apps Code App, Power Automate, Power Pages
- [2] Power Apps Vibe Coding | 浏览器端 Power Apps Vibe 与 IDE 端 MCP Plugin 的双轨开发模式 || Dual-track development model: in-browser Power Apps Vibe and IDE-side MCP Plugin
- [3] Microsoft Copilot Studio | Generative Orchestration、Agent 注册、Topics/Instructions 与多 Agent 协同机制 || Generative Orchestration, agent registration, Topics/Instructions, and multi-agent coordination
- [4] AI Builder | 预构建与自定义模型：Prompt (GPT)、Form Processing、Entity Extraction、Classification 等（不含 Speech） || Prebuilt and custom models: Prompt (GPT), Form Processing, Entity Extraction, Classification (Speech excluded)
- [5] Web Speech API (W3C) | 浏览器原生多语种语音识别接口，iOS Safari / Android Chrome 均支持 || Browser-native multi-language speech recognition; supported by iOS Safari and Android Chrome
- [6] Microsoft Dataverse | Virtual Tables 与外部数据源直连模式（含 SAP / OData） || Virtual Tables and direct connection to external data sources (incl. SAP / OData)
- [7] Microsoft Entra ID + Purview | 企业级身份与 AI 审计治理参考 || Enterprise identity and AI audit governance reference
- [8] 客户 AI 应用 Agent 全景图（客户提供） | 客户与活动 / 商机 / 订单 / 安装售后 / 考核管理五大业务域 Agent 清单 || Agent inventory across five business domains: customer & activity / opportunity / order / installation & service / KPI management
- [9] 客户 SAP Commerce CRM 现状截图（客户提供） | 活动列表、记录拜访、商机创建、商机详情等关键流程的现状参考 || Reference views of activity list, record visit, create opportunity, opportunity detail and other key flows

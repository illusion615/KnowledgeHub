---
title: "销售 CRM 移动 AI 智能体方案 · 审阅报告 || Mobile-First Sales CRM Proposal · Review Report"
eyebrow: "Power Platform 专家审阅 || Power Platform Expert Review"
brand: Agentic Sales Mobile · Review
date: 2026-01-01
strict_i18n: false
strict_density: true
lead: "以 Microsoft Power Platform 解决方案专家视角，对方案进行可落地性、产品现状对齐度、成本估算、合规与运营完整度四个维度的审阅。共识别 6 个 P0 高优先级问题、5 个 P1 架构性偏差、6 个必须补全的章节级缺口。 || A Microsoft Power Platform solution-expert review across four lenses: build feasibility, alignment with current product state, cost estimation, compliance & operations. 6 P0 critical issues, 5 P1 architectural inaccuracies, 6 missing sections identified."
hero_actions:
  - "先看高优先级 || Critical Issues First | #p0"
  - "阅读原方案 || Read Original Proposal | ../agentic-sales-mobile-proposal/"
panel_label: "审阅总判断 || Reviewer's Verdict"
panel_title: "设计哲学与体验侧立得住，平台技术细节与产品现状偏差较大，需在客户提案前修正。 || The design philosophy and UX side hold up; the platform technical details diverge from current product reality and must be corrected before client review."
panel_desc: "Mobile-First / Voice-First / Confirm-Don't-Configure / Agent 编排四条原则定位准确，Agent 全景、设计哲学、用户的一天三章可直接进入客户答辩。架构层、产品配置层、Roadmap 层包含若干与 Power Platform 当前 GA 状态、Web Speech / Virtual Tables / Generative Orchestration 实际能力不一致的描述，会在技术尽调阶段被对方架构师击穿。 || The four principles (Mobile-First, Voice-First, Confirm-Don't-Configure, Agent Orchestration) are well-framed. The Agent Map, Design Philosophy, and Day-in-the-Life sections are client-ready. The architecture, licensing, and roadmap layers include several claims that conflict with the GA state of Power Platform, with Web Speech / Virtual Tables / Generative Orchestration actual capabilities — these will be picked apart by the customer's architect in technical due diligence."
panel:
  - "可落地性 · B —— 产品定位需对齐 GA 现状 || Buildability · B — alignment with GA needed"
  - "技术准确性 · C —— 多处描述与产品能力不符 || Technical accuracy · C — multiple claims diverge from product reality"
  - "商务可读性 · C —— 缺乏 ROM 成本与人头映射 || Commercial readability · C — no ROM cost or headcount mapping"
  - "合规与运营 · D —— 数据驻留 / 治理 / 可观测性几乎未谈 || Compliance & ops · D — residency / governance / observability barely covered"
metrics:
  - "P0 高优先级 || P0 Critical | 6 | 客户答辩前必须修正 || Must fix before client review"
  - "P1 架构性偏差 || P1 Architectural | 5 | 技术尽调阶段会被追问 || Will be probed in due diligence"
  - "章节级缺口 || Section Gaps | 6 | 标准 Power Platform 提案应有 || Standard PP proposal sections missing"
  - "综合评级 || Overall Grade | B- | 设计强 · 平台细节弱 || Strong design · weak platform details"
---

## #verdict 01 / Overall Verdict :: 逐章评分：哪些章节可上桌，哪些章节要回炉 || Per-Section Grading: What to Present, What to Rework

按客户答辩可用度、技术准确性、商务可读性三个维度对方案 12 章逐章打分。绿色（A/B+）章节可直接演示；橙色（B-/C）章节需补字段或修正描述；红色（D）章节建议重写。 || The 12 chapters are graded across three lenses: client-presentation readiness, technical accuracy, commercial readability. Green (A/B+) chapters are presentation-ready; orange (B-/C) need field updates or wording fixes; red (D) should be rewritten.

| 章节 || Section | 评级 || Grade | 结论 || Verdict |
| --- | --- | --- |
| 01 业务挑战 / 02 设计哲学 | A | 痛点描述具体、四条原则提炼到位，是全篇最强部分。可直接进入客户答辩。 || Pain points are specific; the four principles are well-distilled. The strongest part of the proposal — ready as-is. |
| 03 系统架构 | C | 分层视图清晰，但 Code App 定位、Virtual Tables 缓存、AI Builder 角色三处描述与产品现状不一致，技术尽调阶段会被追问。 || The layered view is clear, but Code App positioning, Virtual Tables caching, and AI Builder role diverge from product reality — will be probed in due diligence. |
| 04 Agent 全景 | B+ | 30+ Agent 分类合理，★ 标注的 Phase 1 优先级清楚。建议增补每个 Agent 的"输入 / 输出 / 调用工具 / 平均成本"四列。 || The 30+ agents are well-categorised; ★-marked Phase 1 priorities are clear. Suggest adding four columns per agent: input / output / tools / avg cost. |
| 05 Agent 协同架构 | C | 三层职责骨架与共享契约思路对，但"并行扇出"模式与 Generative Orchestration 当前实现不符；3.2 秒端到端时延声明过于乐观。 || Three-tier responsibility and shared contracts are sound, but the Fan-out pattern doesn't match Generative Orchestration's current implementation; the 3.2s end-to-end claim is over-optimistic. |
| 06 界面原型 / 07 用户的一天 | A | 原型与角色叙事配合好，是销售场景方案中难得的"能演示"部分。 || Prototypes and persona narrative work together — a rare presentable element in solution decks. |
| 08 交付方式 | B | Plan-First → Vibe Build → ALM Promote 三段式合理；缺少 Solution 分层（unmanaged dev / managed prod）的具体策略。 || The Plan-First → Vibe Build → ALM Promote model is sound; missing concrete Solution layering (unmanaged dev / managed prod) strategy. |
| 09 实施路线图 | B- | 阶段切分合理；但 Phase 1 在 2 个月内打通端到端语音录入对客户首次合作偏激进，建议把试点从 10 人收窄到 3-5 人内测。 || Phasing is reasonable, but driving an end-to-end voice flow live in 2 months on a first engagement is aggressive — recommend narrowing the pilot from 10 reps to a 3-5-person internal test. |
| 10 产品配置 | C | SKU 列表完整，但缺少 100 / 500 / 1000 用户三档 ROM 月度成本范围；Copilot in Teams 与 Microsoft 365 Copilot 的边界没说清。 || SKU list is complete, but no ROM monthly cost ranges for 100 / 500 / 1000 users; the Copilot in Teams vs Microsoft 365 Copilot boundary is unclear. |
| 11 期望收益 | B | "先建基线再对比"的度量纪律值得肯定；但 A2/A3/B2/B3 几个指标只给方向（"显著上升"）未给数值，难以让客户立指标。 || The "baseline-first" measurement discipline is commendable; but A2/A3/B2/B3 give only directions ("substantial uplift") without numbers — hard for the customer to set targets against. |

## #p0 02 / P0 Critical Issues :: 客户答辩前必须修正的 6 个问题 || Six Issues That Must Be Fixed Before the Client Pitch

这一节的 6 个问题与 Microsoft 产品当前 GA 状态、平台能力或定价口径直接冲突。如果在客户技术答辩时被提出，要么说不清楚、要么需要现场修正——任何一种都会损伤方案的可信度。建议在提交前逐条对齐。 || The 6 issues in this section conflict directly with Microsoft products' current GA state, platform capabilities, or pricing. If raised during a customer technical Q&A, they will either go unanswered or require live correction — both damage credibility. Resolve all six before submission.

P0

### P0-01 · Power Apps Code App 定位与产品现状错配 || P0-01 · Power Apps Code App positioning conflicts with product state

出现位置：§03 体验层 · §08 Vibe Build || Where: §03 Experience layer · §08 Vibe Build

原文把 Code App 定位为"主战场——以 React 编写真正的移动 UI（手势、相机、语音、离线缓存）"。问题：Code App 截至 2026Q2 仍在 Preview/有限 GA 阶段，运行形态是 Power Apps 容器内的 React PWA，而非原生壳；手势 / 相机 / 离线写入受 Power Apps Mobile 与 Webview 能力限制，不等同于原生 iOS / Android 应用。 || The proposal positions Code App as "the main stage — a real mobile React UI (gestures, camera, voice, offline cache)". Problem: as of 2026 Q2, Code App is still preview / limited-GA. It runs as a React PWA inside the Power Apps container, not a native shell. Gestures / camera / offline writes are bounded by Power Apps Mobile and Webview capabilities — not equivalent to native iOS / Android.

修正建议 || Suggested Fix

主战场建议改为 Canvas App + Power Apps Mobile（GA · 离线 · 原生相机 / 推送）；Code App 用于 5 个高交互屏（语音播报、商机草稿确认）等局部模块；并在方案中明确 GA 等待节奏与 Preview 风险条款。 || Make Canvas App + Power Apps Mobile (GA · offline · native camera / push) the main stage; restrict Code App to the 5 high-interaction screens (Brief Me, opportunity draft confirmation); explicitly state GA timing and Preview risk terms in the proposal.

P0

### P0-02 · Web Speech API 在 iOS Safari 不支持识别 || P0-02 · Web Speech API recognition not supported on iOS Safari

出现位置：§03 认知层 · §10 备注 · 参考 [04a] || Where: §03 Cognitive · §10 note · Reference [04a]

方案核心是"Voice-First"，并把语音识别明确收敛到"前端通过 Web Speech API / 设备语音输入法本地完成多语种转写"，license 表里也以此作为不采购语音订阅的理由。问题：WebKit / iOS Safari 至今未实现 SpeechRecognition 接口（仅实现 SpeechSynthesis），iPhone 上唯一的可用方案是系统输入法听写 —— 与"长按麦克风一句话录入"的体验不一致。如果销售主力是 iPhone 用户，整套语音入口会失效。 || The proposal is "Voice-First" and pins recognition to "Web Speech API / device IME local multi-language transcription", citing this as the reason no speech subscription is needed. Problem: WebKit / iOS Safari still has not implemented the SpeechRecognition interface (only SpeechSynthesis). On iPhone the only usable path is system IME dictation — inconsistent with the "hold-to-talk" design. If reps mostly use iPhones, the entire voice entry collapses.

修正建议 || Suggested Fix

语音识别改走 Azure AI Speech (STT) 的批式 / 流式接口，按分钟计费；同时承认 iOS 上系统输入法听写作为 fallback。licensing 表新增 Azure AI Speech 行（PAYG）；产品配置备注里去掉"无额外语音订阅"的承诺。 || Move recognition to Azure AI Speech (STT) batch / streaming, billed per minute; acknowledge iOS system-IME dictation as fallback. Add an Azure AI Speech line (PAYG) to the licensing table; drop the "no extra speech subscription" claim from the product-config note.

P0

### P0-03 · Virtual Tables 不是缓存层 || P0-03 · Virtual Tables are not a cache layer

出现位置：§03 数据层 · §03 方案 C || Where: §03 Data layer · §03 Option C

原文："读路径以 Virtual Tables 直连 SAP 关键实体，高频字段近实时缓存"。问题：Virtual Tables 是请求时直读外部数据源，本身不缓存；查询能力受外部 OData/Connector 翻译能力限制，不支持复杂 JOIN、聚合、Rollup、Calculated columns，离线模式也不可用。这与方案后续依赖的"现场即查、户外光线下秒级响应"体验冲突。 || The text says "reads use Virtual Tables direct to SAP key entities, with hot fields cached near-real-time". Problem: Virtual Tables read external sources at request time and do NOT cache. Query capability depends on external OData/Connector translation — no complex JOINs, aggregation, Rollup, calculated columns, no offline mode. This conflicts with the "query on-site, sub-second outdoors" experience the rest of the proposal relies on.

修正建议 || Suggested Fix

高频读分两路：① 客户 / 商机 / 活动这类销售自有数据用 Dataverse 物理表 + Power Automate 增量同步（写时回写 SAP）；② 报价 / 库存 / 订单状态等 SAP 权威数据用 Custom Connector 实时调用，前端做客户端短期缓存（IndexedDB 或 Power Apps cache）。Virtual Tables 仅在"只读 + 简单字段 + 低频"场景使用。 || Split hot reads: (1) sales-owned data (customers / opportunities / activities) → Dataverse physical tables + Power Automate incremental sync with writeback to SAP; (2) SAP-authoritative data (quote / stock / order status) → Custom Connector live calls with client-side short-term cache (IndexedDB or Power Apps cache). Use Virtual Tables only for read-only, simple-field, low-frequency cases.

P0

### P0-04 · Generative Orchestration 不是并行 Fan-out 引擎 || P0-04 · Generative Orchestration is not a parallel fan-out engine

出现位置：§05 协作模式 01 || Where: §05 Pattern 01

原文模式 01："Orchestrator 同时调用多个 Domain Agent，并行返回片段回复 …… 延迟 ≈ max(各 Agent)"。问题：Copilot Studio 当前 Generative Orchestration 在一个对话回合内本质是顺序的 LLM 工具调用循环（plan → call tool → reflect），并不提供原生并行扇出；多个 Agent 串联调用的总延迟≈ sum 而非 max。"Hospital Beta 最新进度"那种三 Agent 并行回答需要在 Power Automate / Agent Flow 内手工编排并行分支才能实现。 || Pattern 01 says: "the Orchestrator dispatches multiple domain agents in parallel … latency ≈ max". Problem: Copilot Studio Generative Orchestration today is, within a turn, essentially a sequential LLM tool-call loop (plan → call tool → reflect) — no native parallel fan-out. Multi-agent total latency ≈ sum, not max. The "Hospital Beta latest" three-agent parallel answer requires hand-built parallel branches in Power Automate / Agent Flow.

修正建议 || Suggested Fix

把"并行扇出"模式改写为"由 Power Automate / Agent Flow 显式实现的并行子流分支"；性能声明改为顺序成本估算（4-8 秒区间），并把这部分作为方案中需要"后台编排成本"的真实开销列出。 || Rewrite the "Fan-out" pattern as "parallel branches explicitly implemented in Power Automate / Agent Flow"; replace the latency claim with a realistic sequential estimate (4-8s range); call this out as a real backend orchestration cost in the proposal.

P0

### P0-05 · Copilot Studio Credits 估算量级不足 || P0-05 · Copilot Studio Credits estimate is materially under-sized

出现位置：§10 Copilot Studio Credits 行 || Where: §10 Copilot Studio Credits row

原文给的样例：10 人 × 20 条 × 22 ≈ 4.4k 消息/月。问题：① 一次"一句话录入"在方案里要走 Orchestrator → 实体抽取 → 客户画像 → 活动创建 → 商机创建 → 商机督导 6 个 Agent 调用 + 若干 SAP / Dataverse Tool 调用，按 Copilot Studio messages 计费口径远不止 1 条；② Phase 2 100 用户、Phase 4 数百到上千用户的月度消耗未估；③ Prompt(GPT) / Form Processing 走 Copilot Studio Credits 后，单价显著高于通过 Azure OpenAI 直接调用，方案没有比较两条路径的成本。 || The example reads: 10 reps × 20 turns × 22 ≈ 4.4k messages/month. Issues: (1) one "one-sentence capture" in the proposal walks Orchestrator → entity extract → profile → activity create → opportunity create → coaching = 6 agent calls + multiple SAP / Dataverse tool calls — well over 1 message under Copilot Studio meters; (2) no monthly estimates for Phase 2 (100 users) or Phase 4 (several hundred to thousand); (3) Prompt(GPT) / Form Processing through Copilot Studio Credits is materially more expensive than direct Azure OpenAI calls — no comparison.

修正建议 || Suggested Fix

新增一节"典型场景的 Credit 拆解"：拜访录入 / 客户问答 / 商机创建三个场景各列出"Agent 跳数 × 消息数 × 单条 Credits"；按 100 / 500 / 1000 用户给出月度 ROM；并把 Prompt(GPT) 高耗调用单独列"Azure OpenAI Direct Call 替代方案"的成本对照。 || Add a section "Per-Scenario Credit Breakdown": for visit capture / customer Q&A / opportunity creation, list agent hops × messages × credits/message; provide monthly ROM at 100 / 500 / 1000 users; show an "Azure OpenAI Direct Call" cost alternative for heavy Prompt(GPT) calls.

P0

### P0-06 · 离线写入承诺与产品能力不符 || P0-06 · Offline-write claim conflicts with product capability

出现位置：§02 原则 01 Design Rule || Where: §02 Principle 01 Design Rule

原文："单一焦点 · 一拇指可达 · 离线可写"。问题：当前架构里前端是 Code App + Virtual Tables + Service Bus 异步回写，三者均依赖在线：Code App 的离线能力远不及 Canvas App + Mobile Offline；Virtual Tables 完全不支持离线；Service Bus 只接收已发出的请求。要做"离线可写"必须切到 Canvas App + Dataverse 物理表 + 显式离线 profile + 冲突解决策略。 || The text says "single focus · thumb-reachable · offline-writable". Problem: the architecture (Code App + Virtual Tables + Service Bus async writeback) is fully online: Code App offline trails Canvas App + Mobile Offline; Virtual Tables have no offline support; Service Bus only receives already-sent requests. "Offline write" requires switching to Canvas App + Dataverse physical tables + explicit offline profile + conflict-resolution strategy.

修正建议 || Suggested Fix

二选一：① 把"离线可写"降级为"弱网下本地 draft 暂存 + 在线后批量提交"，并在前端实现一个简单的 IndexedDB 队列；② 改用 Canvas App + Dataverse Mobile Offline 承载活动录入屏，承担 P0-01 联动的架构调整。 || Pick one: (1) downgrade "offline writable" to "local draft cached on weak network, batch-submitted when back online", implemented as a simple IndexedDB queue; (2) move the activity-capture screen onto Canvas App + Dataverse Mobile Offline, taking the architectural shift implied by P0-01.

## #p1 03 / P1 Architectural Issues :: 技术尽调阶段会被追问的 5 个不严谨 || Five Loose Ends That Will Surface in Technical Due Diligence

这一节的 5 个问题不致命，但都会在客户架构师 / SAP Basis / 安全官的提问中暴露，建议在二轮提案前补齐。 || None of the 5 issues here is fatal, but all will surface under questioning by the customer's architect / SAP Basis / security officer. Resolve before the second round.

P1

### P1-01 · PCF / Plug-in 适用边界写错 || P1-01 · PCF / Plug-in scope mis-stated

出现位置：§08 阶段 2 Vibe Build || Where: §08 Stage 2 Vibe Build

原文："SAP API 调用、性能敏感视图、安全审计交给 pro-code（PCF / Plug-in / Custom Connector）"。问题：① PCF Code Component 只能在 Canvas App / Model-Driven App 中使用，Code App 不消费 PCF；② Plug-in 是 Dataverse 服务端事件扩展，不应承担直接调 SAP API 的角色；③ 三者职责不可互换。 || The text bundles "SAP API calls, perf-sensitive views, security audit" under "pro-code (PCF / Plug-in / Custom Connector)". Issues: (1) PCF Code Components run only in Canvas / Model-Driven Apps — Code App does not consume PCF; (2) Plug-ins are server-side Dataverse event extensions — not the right place to call SAP APIs; (3) the three are not interchangeable.

修正建议 || Suggested Fix

按用途分别归位：SAP API 调用 → Custom Connector（统一从 APIM 出口）；性能敏感视图 → Code App 内 React 组件 / MDA 内 PCF；安全审计 → Dataverse Plug-in + Purview。 || Re-assign by purpose: SAP API → Custom Connector (egressing through APIM); perf-sensitive views → React in Code App / PCF in MDA; security audit → Dataverse Plug-in + Purview.

P1

### P1-02 · 写路径事务一致性未谈 || P1-02 · Write-path transactional consistency not addressed

出现位置：§03 数据策略方案 C · §03 数据层 || Where: §03 Data Strategy Option C · §03 Data layer

原文："草稿 → 确认 → Service Bus 异步回写 SAP"。问题：① 没有幂等键策略（同一拜访被重复 Confirm 怎么办）；② SAP 拒收（字段校验失败 / SAP 服务停机）后用户侧的 UX 与状态机未定义；③ 与 SAP 方既有数据并发冲突的 last-writer-wins / merge 策略缺；④ Compensation 事务（活动已写、商机失败）回滚边界缺。 || The text reads "Draft → Confirm → Service Bus async writeback to SAP". Issues: (1) no idempotency key strategy (what if the same visit is Confirmed twice); (2) no UX / state machine for SAP rejection (field validation failure / SAP downtime); (3) no last-writer-wins or merge strategy for concurrent writes from SAP side; (4) no compensation strategy when activity persists but opportunity fails.

修正建议 || Suggested Fix

新增"写路径状态机"子章节：状态枚举（Draft / Pending / Synced / Rejected / NeedsReview）+ 幂等键设计 + Service Bus DLQ 处理 + 用户可见的 retry / 人工介入入口。 || Add a "Write-Path State Machine" subsection: state enum (Draft / Pending / Synced / Rejected / NeedsReview) + idempotency key design + Service Bus DLQ handling + user-facing retry / manual-intervention entry.

P1

### P1-03 · SAP 身份与行级权限未定义 || P1-03 · SAP identity & row-level access undefined

出现位置：§03 治理层 · 一句话带过 || Where: §03 Governance · single line

原文仅说"身份与权限沿用 Entra ID + 现有 SAP 角色"。问题：Custom Connector 调用 SAP 时使用 Service Principal 还是 User OBO 未定；如果走 SP，销售 A 不应看到销售 B 的商机这一类行级隔离如何在网关层执行？多区域 SAP 实例如何根据用户区域路由？这是 SAP 客户提案的标配章节。 || The text only says "identity reuses Entra ID + existing SAP roles". Issues: when Custom Connector calls SAP, does it use Service Principal or User OBO? If SP, how is rep-A vs rep-B row-level isolation enforced at the gateway? How are multi-region SAP instances routed by user region? Standard section in any SAP customer proposal.

修正建议 || Suggested Fix

新增"身份模型"小节：明确 Custom Connector 走 OAuth2 + OBO（用户身份透传到 SAP）；APIM 上挂 JWT 校验策略；不能透传时通过 Dataverse 安全角色 + Power Fx 行级筛选叠加。 || Add an "Identity Model" subsection: Custom Connector uses OAuth2 + OBO (user identity propagated to SAP); APIM enforces JWT validation; where propagation isn't possible, layer Dataverse security roles + Power Fx row filters on top.

P1

### P1-04 · Copilot in Teams 授权口径含糊 || P1-04 · Copilot in Teams licensing ambiguous

出现位置：§03 体验层 · §10 licensing 表 || Where: §03 Experience layer · §10 licensing table

原文把"Copilot in Teams"当作会议中临时查询入口，但 licensing 表里没列。"Copilot in Teams"在 Microsoft 体系里有两种含义：① Microsoft 365 Copilot（USD 30/user/月，Microsoft Graph 接入）；② 通过 Copilot Studio 发布的自定义 Agent 在 Teams 内呈现（用 Copilot Studio Credits）。两者授权 / 能力 / 成本完全不同，方案没区分会让客户预算被低估或高估一个数量级。 || The text uses "Copilot in Teams" as an in-meeting ad-hoc query entry but doesn't list it in the licensing table. "Copilot in Teams" in Microsoft's catalogue means two things: (1) Microsoft 365 Copilot (USD 30/user/mo, Microsoft Graph access); (2) custom Copilot Studio agents surfaced in Teams (Copilot Studio Credits). Wildly different licensing / capability / cost — the proposal could mis-size the budget by an order of magnitude.

修正建议 || Suggested Fix

本方案一律采用第二种（Copilot Studio Agent 通过 Microsoft 365 Channel 发布到 Teams），在 licensing 表里以"复用 §10 Copilot Studio Credits 池"明示，并去掉"M365 Copilot"的隐含。 || Standardise on option (2) — Copilot Studio Agent published to Teams via the Microsoft 365 channel; in the licensing table, mark this as "reuses the Copilot Studio Credits pool from §10" and explicitly drop any M365 Copilot implication.

P1

### P1-05 · 3.2 秒端到端时延声明过于乐观 || P1-05 · 3.2-second end-to-end latency claim is over-optimistic

出现位置：§05 实战串联最后一行 || Where: §05 Worked Example, last row

原文："端到端 ≈ 3.2 秒（拜访结束到 UI 出现 draft）"。问题：路由（Generative Orchestration LLM 决策）≈ 1-2 秒、AI Builder Prompt(GPT) 实体抽取 ≈ 1-3 秒、客户画像 Agent（含 Dataverse Virtual Table → SAP 跨境往返）≈ 1-5 秒、活动创建 Agent / 商机创建 Agent / 商机督导 Agent 各一次 LLM + 一次 Dataverse / SAP IO；最后 Orchestrator 合成 ≈ 1-2 秒。综合 P50 现实在 8-15 秒区间，3.2 秒是不可达的。客户当场计时会被打脸。 || The text reads "end-to-end ≈ 3.2 s (utterance to draft on screen)". Reality: routing (Generative Orchestration LLM decision) ≈ 1-2 s, AI Builder Prompt(GPT) entity extraction ≈ 1-3 s, Profile Agent (Dataverse Virtual Table → cross-border SAP round-trip) ≈ 1-5 s, Activity / Opportunity / Coaching agents each one LLM + one Dataverse / SAP IO, plus Orchestrator composition ≈ 1-2 s. P50 lands at 8-15 s. The 3.2-second claim is unreachable and will fail a stopwatch demo.

修正建议 || Suggested Fix

时延声明改为分段："录入即时反馈（语音转写完成）≤ 1 秒、UI 出现初始 draft ≤ 4 秒（活动 + 实体抽取）、完整 6-Agent 推理完成 ≤ 12 秒（P50）"；并在 UI 上以"边到边流式渲染"掩盖总时长。 || Replace the latency claim with a phased version: "immediate transcription feedback ≤ 1 s, initial draft on screen ≤ 4 s (activity + entity extraction), full 6-agent reasoning ≤ 12 s P50"; mask total duration in the UI with edge-to-edge streaming render.

## #gaps 04 / Section-Level Gaps :: 标准 Power Platform 提案应有但本方案缺的 6 个章节 || Six Sections Standard PP Proposals Have That This One Lacks

作为面向企业客户的 Power Platform 解决方案提案，下列六个章节是技术买方（CTO / Architect / SecOps / Compliance）评估的标准切面。本方案聚焦于设计与体验，企业级运营 / 治理 / 成本切面相对薄弱，建议补全。 || For an enterprise-facing Power Platform solution proposal, the six sections below are standard cuts evaluated by technical buyers (CTO / Architect / SecOps / Compliance). The proposal is strong on design and experience but light on enterprise operations / governance / cost — fill these in.

缺失 || Missing

### GAP-01 · Environment / Solution 拓扑 || GAP-01 · Environment / Solution topology

缺一张"Tenant → Environments (Dev / UAT / Prod / Default / 各区域 sandbox) → Solutions (Core / Connectors / Agents / Reporting) → Connection References"的拓扑图，以及谁拥有哪个 Environment、Solution 之间依赖关系、是否启用 Managed Environments 各项策略。 || Missing a "Tenant → Environments (Dev / UAT / Prod / Default / per-region sandboxes) → Solutions (Core / Connectors / Agents / Reporting) → Connection References" topology, plus environment ownership, inter-solution dependencies, and which Managed Environments policies are enabled.

缺失 || Missing

### GAP-02 · 多区域数据驻留与合规 || GAP-02 · Multi-region data residency & compliance

Phase 4 全球推广涉及巴西 LGPD、EU GDPR / Data Boundary、中东 / 中国数据驻留要求。Power Platform geo、Dataverse data location、Copilot Studio 跨区域调用、AI 模型可用区均需对齐。当前方案完全未谈，是合规审批阶段的硬卡点。 || Phase 4 global rollout touches Brazil LGPD, EU GDPR / Data Boundary, Middle East / China residency requirements. Power Platform geo, Dataverse data location, Copilot Studio cross-region calls, AI model availability per region all need alignment. None of this is currently addressed — a hard blocker at compliance review.

缺失 || Missing

### GAP-03 · Agent 治理与 Prompt 生命周期 || GAP-03 · Agent governance & prompt lifecycle

30+ Agent 上线后，缺：prompt 版本仓库、回归测试集、上线前评估指标（faithfulness / refusal rate / latency P95）、A/B 灰度、prompt 漂移监控、Agent 下线策略。这是从 PoC 到生产的分水岭。 || With 30+ agents going live, missing: prompt version repository, regression test set, pre-release eval metrics (faithfulness / refusal rate / latency P95), A/B canary, prompt-drift monitoring, agent retirement policy. This is the watershed between PoC and production.

缺失 || Missing

### GAP-04 · 端到端可观测性架构 || GAP-04 · End-to-end observability architecture

Application Insights 仅出现在治理层 chip 中，未展开。需要：trace ID 在 UI → Orchestrator → Agent → Tool → SAP 的传播策略、Agent chain 链路视图、商机草稿采纳率 / 编辑率 / 拒绝率仪表盘的具体指标定义、错误预算（error budget）与告警阈值。 || Application Insights appears only as a governance chip — undeveloped. Need: trace-ID propagation across UI → Orchestrator → Agent → Tool → SAP, agent-chain view, concrete metric definitions for opportunity-draft adoption / edit / rejection dashboards, error budget and alerting thresholds.

缺失 || Missing

### GAP-05 · TCO 月度成本 ROM || GAP-05 · TCO monthly cost ROM

Licensing 表只描述 SKU 与计量逻辑，没有数字。建议至少给三档 ROM：① Phase 1 试点 10 用户的月度预估范围；② Phase 2 100 用户；③ Phase 4 1000 用户。每档拆 Power Apps Premium / Copilot Studio Credits / Copilot Studio User / Dataverse Capacity / Azure (APIM + Service Bus + Speech + AI Search + Storage + App Insights) 五行。 || The licensing table describes SKUs and metering only — no numbers. Provide at least three ROM tiers: (1) Phase 1 pilot 10 users monthly range; (2) Phase 2 100 users; (3) Phase 4 1000 users. Each tier broken into Power Apps Premium / Copilot Studio Credits / Copilot Studio User / Dataverse Capacity / Azure (APIM + Service Bus + Speech + AI Search + Storage + App Insights).

缺失 || Missing

### GAP-06 · AI 安全风险矩阵 || GAP-06 · AI security risk matrix

缺：① Prompt injection（外部数据进入 Agent 上下文，恶意改变行为）；② AI 幻觉触发错误下单 / 错误报价的风险与"高金额必须人审"策略；③ 客户敏感信息（病历、价格、合同）在对话日志中的脱敏；④ Copilot Studio 内置 content moderation 与自定义阈值。这一节的存在与否决定客户安全官是否签字。 || Missing: (1) prompt injection (external data entering agent context to alter behaviour); (2) AI-hallucinated wrong order / wrong quote risks and a "high-amount requires human review" policy; (3) PII redaction in conversation logs (patient records, prices, contracts); (4) Copilot Studio built-in content moderation and custom thresholds. The presence or absence of this section determines whether the customer's CISO signs.

## #recommendations 05 / Recommendations :: 提交客户前的改稿优先级清单 || Pre-Submission Edit Priority List

按改稿成本与收益排序的执行顺序：先做 1-3 解除答辩硬伤，再做 4-5 强化商务可读性，最后做 6-7 补全企业级章节。预计完整改稿 5-8 个工作日。 || Execution order ranked by edit cost vs payoff: items 1-3 remove answerability blockers, 4-5 strengthen commercial readability, 6-7 fill enterprise-grade gaps. Full revision: 5-8 working days.

01

### 对齐前端形态（解 P0-01 · P0-06） || Align the front-end form (resolves P0-01 · P0-06)

决定 Code App / Canvas App 的边界 → 改 §03 体验层架构图与 §08 Vibe Build 描述 → 同步 §02 原则 01 的"离线可写"表述。 || Decide the Code App / Canvas App boundary → update §03 experience layer diagram and §08 Vibe Build text → synchronise the "offline-writable" wording in §02 Principle 01.

02

### 对齐语音识别路径（解 P0-02） || Align speech-recognition path (resolves P0-02)

把方案改为"Azure AI Speech (STT) + iOS 系统输入法 fallback"，参考文献 [04a] 删除或修正措辞 → §10 licensing 表新增 Azure AI Speech 行 → 备注里去掉"无额外语音订阅"的承诺。 || Switch to "Azure AI Speech (STT) + iOS system-IME fallback"; remove or amend reference [04a] → add Azure AI Speech row to §10 licensing → drop the "no extra speech subscription" claim from the note.

03

### 对齐 Orchestration 实现（解 P0-04 · P1-05） || Align orchestration implementation (resolves P0-04 · P1-05)

§05 Pattern 01 改为"Power Automate / Agent Flow 显式并行"；§05 实战串联的 3.2 秒改为分段时延声明（即时反馈 ≤ 1s · 初始 draft ≤ 4s · 全 Agent 完成 ≤ 12s P50）。 || Rewrite §05 Pattern 01 as "explicit parallel via Power Automate / Agent Flow"; replace the 3.2-second claim in §05 worked example with a phased latency statement (immediate feedback ≤ 1s · initial draft ≤ 4s · full agents ≤ 12s P50).

04

### 新增 Credit / TCO 拆解章节（解 P0-05 · GAP-05） || Add a Credit / TCO breakdown section (resolves P0-05 · GAP-05)

在 §10 后增加"典型场景 Credit 拆解 + 三档 ROM 月度成本"一节，给客户决策者一个量级，避免后续被对方 procurement 用价格反推架构。 || Add a "Per-Scenario Credit Breakdown + Three-Tier ROM Monthly Cost" section after §10 to give the buyer a magnitude, preventing procurement from later reverse-engineering the architecture from price.

05

### 对齐数据策略（解 P0-03 · P1-02） || Align data strategy (resolves P0-03 · P1-02)

§03 Option C 改写为"Dataverse 物理表 + 增量同步（销售自有数据） · Custom Connector 实时调用（SAP 权威数据） · Virtual Tables 仅低频只读"三段式；并新增写路径状态机子章节（含幂等键、DLQ、补偿事务）。 || Rewrite §03 Option C as a three-track strategy: "Dataverse physical tables + incremental sync (sales-owned data) · Custom Connector live calls (SAP-authoritative data) · Virtual Tables only for low-frequency read-only"; add a write-path state-machine subsection (idempotency key, DLQ, compensation).

06

### 补企业级章节（解 GAP-01 · 02 · 03 · 04 · 06） || Add enterprise-grade sections (resolves GAP-01 · 02 · 03 · 04 · 06)

新增 4 个章节：① Environment / Solution 拓扑；② 数据驻留与合规矩阵（按目标区域）；③ Agent 治理与 prompt 生命周期；④ AI 安全风险与缓解。每节 1-2 屏即可，不必长。 || Add four sections: (1) Environment / Solution topology; (2) data residency & compliance matrix (by target region); (3) agent governance & prompt lifecycle; (4) AI security risks & mitigations. 1-2 screens each — no need to be long.

07

### 收紧 Phase 1 试点规模（解 09 章节评级） || Tighten Phase 1 pilot size (resolves §09 grade)

把 Phase 1 的"1 区域 · 10 名销售"收窄到"1 区域 · 3-5 名销售 + 1 名管理者 + 1 名 IT"的内测，先建立基线再扩量，能极大降低首次客户合作的风险。 || Narrow Phase 1 from "1 region · 10 reps" to "1 region · 3-5 reps + 1 manager + 1 IT" for an internal alpha; establish baseline before scaling — substantially reducing first-engagement risk.

:::callout { title: "审阅结语 || Reviewer's Closing Note" }
本方案在"为什么做、做什么样子、用户感受是什么"三件事上写得相当好——这是大多数 Power Platform 提案缺乏的部分。如果能在"怎么做、做出来花多少钱、运营起来谁负责、合规上谁签字"四件事上补足前述 17 个问题，这套方案的整体评级可以从 B- 升到 A-，足以承接 Microsoft Business AI Solution 在 SAP 共生客户群中的旗舰位置。 || The proposal is unusually strong on the why / what / user-feel — areas where most Power Platform proposals are weak. If the 17 issues above are resolved on the how / cost / who-operates / who-signs-for-compliance dimensions, the overall grade moves from B- to A-, enough to anchor Microsoft Business AI Solution's flagship position among SAP-coexistence accounts.
:::

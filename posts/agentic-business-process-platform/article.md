---
title: Agentic Business Process Platform
eyebrow: "Microsoft Business AI Solution · 审批现代化 || Microsoft Business AI Solution · Approval Modernization"
brand: Business AI Solution
date: 2026-07-27
strict_i18n: true
strict_density: true
lead: "基于 Microsoft Copilot Studio 的企业审批 Agent 平台 || An Enterprise Approval Agent Platform on Microsoft Copilot Studio"
hero_actions:
  - "查看端到端架构 || Explore the End-to-End Architecture | #architecture"
  - "配置产品组合 || Configure the Product Stack | #configuration"
panel_label: "方案边界 || Solution Boundary"
panel_title: "Agent 负责理解与分派，Workflow 负责确定性执行，人负责关键决定。 || Agents Interpret and Route, Workflows Execute Deterministically, and People Own Material Decisions"
panel:
  - 优先沿用来源表单；缺少合适入口时采用平台表单，并明确申请主记录的唯一归属
  - "Agent 只调用已注册工具：流程选择可生成，金额计算、权限和写入路径保持确定 || The agent calls registered tools only: workflow selection can be generative, while calculations, authorization, and writes stay deterministic"
  - 人工参与分为补件与审批两类任务，由 HumanTask 统一记录和授权，Agent 不代替审批人
  - "来源系统保持权威：审批结果经幂等回写落账后流程才正式关闭 || Source systems remain authoritative: the process closes only after idempotent writeback"
metrics:
  - "Agentic 控制面 || Agentic Control Plane | 1 | Copilot Studio 流程 Agent || Copilot Studio Process Agent"
  - "Human-in-the-Loop Gate || Human-in-the-Loop Gates | 2 | 审批任务 · 补件任务"
  - "确定性执行层 || Deterministic Execution Layer | 1 | Copilot Studio Workflow"
  - "强制替换现有表单 | 0 | 现有表单优先连接，新业务按需建表单"
style:
  accent: "#a855f7"
---

## #challenges 01 / Business Context and Challenges :: 四类断点让审批人把时间花在找入口、补信息和追状态上 || Four Frictions Make Approval Work Slower Than the Decision Itself

传统企业通常按财务、采购、销售、HR 和项目管理分别建设业务系统。提交端与专业流程已经稳定，但审批任务、材料结构、催办方式和历史记录散落在各系统。立项前应至少采集四项同口径基线：每名审批人每周访问的系统数、单笔主动处理分钟、等待时长中位数、因材料不全造成的退回率；没有基线就不能承诺提速幅度。 || Enterprises commonly operate separate finance, procurement, sales, HR, and project systems. Intake and specialist workflows may already be stable, while approval tasks, evidence formats, reminders, and history remain fragmented. Before funding a pilot, collect four comparable baselines: systems visited per approver per week, active handling minutes per item, median waiting time, and return rate caused by incomplete evidence. Without a baseline, no cycle-time claim is defensible.

:::insight-grid { cols: 4 }
::card 01
### 入口分散 || Fragmented Entry Points
审批人需要在邮件通知、ERP、采购、费用和 CRM 等入口之间切换，移动场景下更容易把等待任务误当成已处理任务。 || Approvers switch among email notifications, ERP, procurement, expense, and CRM interfaces. On mobile devices, pending items are easier to lose among completed work.

::card 02
### 上下文不完整 || Incomplete Decision Context
表单只呈现本系统字段，审批人还要查合同、预算、供应商历史、邮件和政策，主动处理时间因此高于点击同意或拒绝本身。 || A form exposes only its local fields. Approvers still inspect contracts, budgets, supplier history, email, and policy, so active handling takes longer than the approve-or-reject action itself.

::card 03
### 集成改造昂贵 || Expensive Source-System Changes
重做每个系统的表单和工作流会触发回归测试、培训、发布窗口与供应商定制费用；把提交端一并迁移会扩大首期范围。 || Rebuilding forms and workflows in every system creates regression testing, training, release-window, and vendor-customization costs. Migrating intake expands the first-phase scope.

::card 04
### 记录无法统一复核 || No Unified Review Record
待办、已办、转派、补件和回写失败分布在不同数据库，管理者难以按流程、部门、金额、时长和异常原因统一分析。 || Pending, completed, reassigned, supplemented, and failed-writeback events live in different stores, preventing consistent analysis by process, department, amount, duration, and exception cause.
:::

:::accordion
::panel
### 1.1 试点前先统一四项基线口径 || 1.1 Standardize Four Baseline Measures Before the Pilot
基线按同一流程、同一风险等级和同一月份采集，避免把业务季节性误判为平台收益。 || Collect baselines for the same process, risk tier, and calendar period so seasonality is not misclassified as platform value.

| 指标 || Measure | 计算口径 || Definition | 数据来源 || Source | 排除项 || Exclusion |
| --- | --- | --- | --- |
| 系统切换数 || Systems Visited | 每名审批人每周打开的独立审批系统数量 || Distinct approval systems opened by each approver per week | 访问日志 + 抽样访谈 || Access logs plus sampled interviews | 仅查阅、不参与审批的系统 || Read-only systems unrelated to the decision |
| 主动处理分钟 || Active Handling Minutes | 首次打开到提交决定之间的有效操作时间 || Effective interaction time from first open to submitted decision | 遥测 + 20 笔人工计时样本 || Telemetry plus 20 manually timed samples | 等待他人补件的时间 || Time waiting for supplementary evidence |
| 等待时长中位数 || Median Waiting Time | 任务生成到首次有效决定的自然小时 || Elapsed hours from task creation to first valid decision | 来源系统流程日志 || Source-system workflow logs | 已批准暂停的业务时段 || Approved business holds |
| 材料退回率 || Evidence Return Rate | 因材料缺失或冲突而退回的审批数 / 总审批数 || Approvals returned for missing or conflicting evidence divided by all approvals | 退回原因代码 || Return-reason codes | 业务条件变化导致的撤回 || Withdrawals caused by changed business conditions |
:::

## #principles 02 / Design Principles and Expected Benefits :: 保留来源系统，把审批体验、证据和治理标准化 || Preserve Source Systems, Standardize the Approval Experience

平台以一次审批旅程为主线：来源系统创建事项，中台生成标准工作项和 AI 简报，审批人在 Outlook、Teams 或 Power Pages 统一工作台决策，结果回写来源系统，Power Pages 保留面向内部与外部参与者的统一入口。收益必须落在四个可测结果上：减少系统切换、降低单笔处理时间、减少材料退回、提高跨系统追溯覆盖率。 || The platform follows one approval journey: a source system creates a request, the control plane produces a normalized work item and AI brief, and the approver decides in Outlook, Teams, or the Power Pages unified workbench. The result returns to the source, while Power Pages provides one entry point for internal and external participants. Value must appear in four measurable outcomes: fewer system switches, lower handling time, fewer evidence returns, and greater cross-system trace coverage.

:::comparison
::versus 原则 1 || Principle 1 { highlight: true }
### 来源系统保持权威 || Source Systems Stay Authoritative
平台保存审批副本、事件和引用，不复制全部业务主数据。正式订单、费用、合同和人员记录仍由原系统负责。 || The platform stores approval copies, events, and references rather than replicating all business master data. Orders, expenses, contracts, and employee records remain authoritative in their source systems.

::versus 原则 2 || Principle 2
### 先统一工作项，再统一界面 || Normalize the Work Item Before the Interface
所有流程先映射到同一 ApprovalCase 数据契约，再投递到 Outlook、Teams 和工作台，避免每接一个系统就开发一套审批页面。 || Every process maps to one ApprovalCase contract before delivery to Outlook, Teams, and the workbench, avoiding a new approval interface for every connected system.

::versus 原则 3 || Principle 3
### AI 输出证据简报 || AI Produces an Evidence Brief
简报分为已确认事实、规则异常、缺失信息和建议关注点，并保留来源链接。AI 不改变金额、审批链或最终决定。 || The brief separates verified facts, policy anomalies, missing information, and review points while retaining source links. AI does not alter amounts, approval chains, or final decisions.

::versus 原则 4 || Principle 4
### 一次决定形成完整事件链 || One Decision Produces a Complete Event Chain
接收、补件、委派、提醒、决定、回写和失败重试都写成不可混淆的事件，支持复核、分析和责任追踪。 || Receipt, supplementation, delegation, reminders, decisions, writeback, and retries become distinct events that support review, analytics, and accountability.
:::

| 期望获益 || Expected Benefit | 验证指标 || Pilot Measure | 通过条件示例 || Example Gate | 不应归因的变化 || Excluded Change |
| --- | --- | --- | --- |
| 减少入口切换 || Fewer Interface Switches | 每名审批人每周访问系统数 || Systems visited per approver per week | 试点流程降至 Outlook/Teams + Power Pages 统一工作台 || Pilot processes require only Outlook/Teams plus the Power Pages unified workbench | 非试点系统访问变化 || Changes in nonpilot system usage |
| 缩短主动处理时间 || Lower Active Handling Time | 同风险等级单笔分钟数中位数 || Median minutes per item within the same risk tier | 连续 4 周下降且错误决定率不升 || Lower for four consecutive weeks without a higher decision-error rate | 审批量下降带来的总工时变化 || Total-hours change caused by lower approval volume |
| 减少材料退回 || Fewer Evidence Returns | 材料缺失/冲突退回率 || Return rate for missing or conflicting evidence | 与同期对照组相比下降 || Lower than a matched control group in the same period | 政策放宽造成的退回减少 || Fewer returns caused by relaxed policy |
| 提高追溯覆盖 || Greater Trace Coverage | 具备来源、决定、人员与回写证据的事项占比 || Items with source, decision, actor, and writeback evidence | 生产试点达到 99%，异常进入明确队列 || Production pilot reaches 99%, with exceptions entering a named queue | 历史数据补录覆盖率 || Backfilled historical-record coverage |

## #architecture 03 / Logical Architecture and Responsibilities :: Source Adapter 隔离系统差异，Agent 与 Workflow 分开理解和执行 || Source Adapters Isolate System Differences While Agents and Workflows Separate Interpretation from Execution

本文用 Copilot Studio Workflow 表示逻辑执行职责，实际基线采用 standard harness 的 agent flows；官方另有独立的 Workflows 体验说明，两者的能力不能混用。[1][4] 本方案设计为四层：Source Adapter 统一来源契约，Agent 理解上下文并建议已发布流程，确定性执行层调用独立规则与审批命令服务，Dataverse 保存 IntegrationEvent、ApprovalCase、HumanTask 及版本。生产清单须逐项固定实际 harness、区域、版本及文档支持的可用动作，不对整个画布笼统宣称预览或正式可用。来源业务主记录仍由原系统负责；平台表单新建的申请主记录则由 Dataverse 负责。

:::comparison { title: "Source Adapter、Agent、Workflow 与状态层的职责 || Responsibilities Across Source Adapter, Agent, Workflow, and State" }
::versus 来源接入 || Source Integration
### Source Adapter
实现 ReceiveEvent、ReadContext、ApplyDecision、GetWritebackStatus 与 GetSourceDeepLink；隐藏 Connector、Gateway、批量和 RPA 差异，但不拥有审批矩阵。 || Implements ReceiveEvent, ReadContext, ApplyDecision, GetWritebackStatus, and GetSourceDeepLink. It hides connector, gateway, batch, and RPA differences without owning approval policy.

::versus 理解与分派 || Interpret and Route { highlight: true }
### Copilot Studio 流程 Agent || Copilot Studio Process Agent
接收 IntegrationEvent 引用，通过 Source Adapter 读取有权限的上下文，识别流程类型、风险和缺失信息，只从已注册的 Copilot Studio Workflow、prompt 与 connector tool 中选择下一步。 || Receives an IntegrationEvent reference, reads authorized context through the source adapter, identifies process type, risk, and missing information, and selects only from registered Copilot Studio Workflows, prompts, and connector tools.

::versus 确定性执行 || Deterministic Execution
### Copilot Studio Workflow
按已发布计划调用规则服务、审批命令服务和适配器，执行校验、分支及幂等回写；HumanTask 保存人员任务，原生 Approval 与 Request information 仅作为适用时的可选渠道。相同事实与规则版本产生相同审批要求。

::versus 持久状态 || Durable State
### Dataverse IntegrationEvent + ApprovalCase
保存来源事件、重放状态、Agent/Workflow 运行 ID、人工任务、决定和回写凭证；等待人员数小时或数天时不依赖对话会话存活。 || Stores source events, replay state, agent and workflow run IDs, human tasks, decisions, and writeback receipts without relying on a live conversation while people respond hours or days later.
:::

Agentic Business Process Platform · 逻辑架构 || Agentic Business Process Platform · Logical Architecture

来源接入先归一事件与读写契约；Agent、Workflow 和审批/管理入口共享持久状态与治理 || Source integration normalizes events and read-write contracts before agents, workflows, and approver or administrator channels share durable state and governance

Submission Experience Plane

现有业务系统提交入口 || Existing Business-System Intake

业务人员继续在熟悉的表单和专业系统中提交，不迁移业务入口。 || Employees keep submitting through familiar forms and specialist systems without migrating intake.

ERP

采购 · 财务 || Procurement · Finance

CRM

客户 · 合同 || Customer · Contract

HR

人员 · 假勤 || People · Leave

专业系统 || Specialist Systems

项目 · 质量 || Project · Quality

↕

事件与上下文 ↕ 决定与凭证 || Events and Context ↕ Decisions and Receipts

Source Integration Plane

来源系统 Source Adapter || Source-System Adapter

验证来源、去重事件、按最小权限读取上下文，并把回写凭证返回平台；不承载审批规则。 || Validates and deduplicates events, reads least-privilege context, and returns writeback receipts.

事件接入 || Event Ingress

验签 · 去重 · 重放 || Verify · Deduplicate · Replay

上下文读取 || Context Read

API · Gateway · RPA

结果回写 || Result Writeback

幂等 · 凭证 · 对账 || Idempotency · Receipt · Reconcile

↓

IntegrationEvent 引用 || IntegrationEvent Reference

Agentic Control Plane

Copilot Studio 流程 Agent || Copilot Studio Process Agent

理解事件与上下文，识别流程、风险和缺失信息，只选择已发布的 Copilot Studio Workflow 与工具。 || Interprets context and selects published Copilot Studio Workflows and tools by process, risk, and missing data.

理解上下文 || Understand Context

识别风险 || Identify Risk

选择 Workflow || Select Workflow

→

选择版本化 Workflow || Select Versioned Workflow

↔

Read · Apply · Receipt

Deterministic Execution Plane

Copilot Studio Workflow

以 Copilot Studio Workflow 作为生产基线；相同输入按相同规则执行，每个节点可版本化、测试与审计。 || Runs versioned, testable Copilot Studio Workflows so identical inputs follow identical rules.

校验与归一 || Validate and Normalize

身份 · 幂等 · 审批矩阵 || Identity · Idempotency · Approval Matrix

连接器与 AI || Connectors and AI

Tool · Prompt · 文档处理 || Tool · Prompt · Content Processing

Human in the Loop

Request information · Approval || Request Information · Approval

回写与补偿 || Writeback and Compensation

Connector · 重试 · 对账 || Connector · Retry · Reconciliation

↕

审批/管理任务 ↕ 人员操作 || Approval/Admin Tasks ↕ Human Actions

Human and Admin Experience Plane

审批人、管理员统一工作入口 || Unified Approver and Administrator Entry Point

审批人完成补件与决定；管理员维护流程配置、处理异常并查看运营状态。 || Approvers provide evidence and decisions; administrators maintain process configuration, handle exceptions, and review operations.

Outlook

邮件审批 || Email Approval

Teams Approvals

协作审批 || Collaborative Approval

Power Pages 统一工作台 || Power Pages Workbench

内外部参与 · 待办 · 已办 || Internal/External · Pending · Completed

Power Apps 管理应用 || Power Apps Administration App

流程配置 · 异常 · 运营 || Configuration · Exceptions · Operations

↑

事件收件箱、审批状态、审计、安全与运营支撑全部运行层 || The event inbox, approval state, audit, security, and operations support every runtime block

↑

State and Audit Plane

Microsoft Dataverse · IntegrationEvent · ApprovalCase

事件收件与重放 · 来源引用 · Agent/Workflow Run ID · Human Task · 决定 · 回写凭证 · Credits 遥测 || Event inbox and replay · Source references · Agent/Workflow run IDs · Human tasks · Decisions · Writeback receipts · Credit telemetry

身份 || Identity

Entra · Least Privilege

数据边界 || Data Boundary

DLP · Dataverse RBAC

生命周期 || Lifecycle

Solutions · Dev/Test/Prod

运营 || Operations

Activity Map · Credits · Alerts

## #source-integration 04 / Source-System Integration :: 前端改造能力决定任务入口，后端接口能力决定接入可靠性 || Frontend Extensibility Determines Task Placement; Backend Interfaces Determine Integration Reliability

每个来源系统先按事件、读取、回写和网络能力分类，再选择 Connector、Webhook、轮询、批量或 RPA。前端可改造时可在原系统呈现结构化任务面板；前端不可改造时使用 Outlook、Teams 或 Power Pages Sidecar。两类体验都调用同一 Source Adapter 契约，且只有来源系统返回业务凭证后事项才能关闭。[6][11][23][24][25][28][29][30] || Classify each source by event, read, writeback, and network capabilities before selecting connectors, webhooks, polling, batch, or RPA. Extensible frontends can host a structured task panel; fixed frontends use Outlook, Teams, or a Power Pages sidecar. Both experiences call the same source-adapter contract, and a case closes only after the source returns a business receipt.[6][11][23][24][25][28][29][30]

:::comparison { title: "四种来源系统接入方式 || Four Source-System Integration Patterns" }
::versus 首选 · 原生事件 || Preferred · Native Events { highlight: true }
### 标准 Connector || Standard Connector
适用于已具备标准连接器和业务事件的系统。事件实时进入 Source Adapter，数据读取与回写均走受支持的标准接口，延迟与维护成本最低。 || Use when the source provides supported connectors and business events. Events enter the source adapter in real time, while supported interfaces handle reads and writeback with the lowest latency and maintenance burden.

::versus API 优先 || API-First
### Custom API + Webhook
适用于没有标准 Connector、但具备 API 的系统。用 Webhook 推送可信事件，通过 OpenAPI 契约读取上下文并返回可核验的业务凭证。 || Use when no standard connector exists but APIs are available. Webhooks push trusted events, and an OpenAPI contract reads context and returns verifiable business receipts.

::versus 异步接入 || Asynchronous
### 轮询、网关或批量 || Polling, Gateway, or Batch
适用于只有查询、数据库、文件或队列接口的系统。按水位发现变化，明确展示数据截止时间，并对批量回写结果逐笔对账。 || Use when only query, database, file, or queue interfaces exist. Discover changes by watermark, expose data freshness, and reconcile batch writeback item by item.

::versus 兜底路径 || Fallback
### 受控 UI 自动化 || Controlled UI Automation
仅用于完全没有机器接口的 Web、桌面或终端系统。写入后必须重新读取关键字段，失败日志与录像进入异常队列，不能把界面点击视为落账成功。 || Use only for web, desktop, or terminal systems with no machine interface. Reread key fields after writing, route logs and recordings to the exception queue, and never treat a UI click as proof of posting.
:::

四种接入路径通过同一个 Source Adapter 双向交换 || Four Integration Paths Exchange Data Bidirectionally Through One Source Adapter

优先使用事件与 API；只有缺少机器接口时才采用受控 UI 自动化 || Prefer events and APIs; use controlled UI automation only when no machine interface exists

Source Systems

现有业务系统 || Existing Business Systems

提交入口与业务主数据继续留在来源系统。 || Intake and authoritative business data remain in source systems.

ERP

采购 · 财务 || Procurement · Finance

CRM

客户 · 合同 || Customer · Contract

HR

人员 · 假勤 || People · Leave

专业系统 || Specialist

项目 · 质量 || Project · Quality

前端可改造：原系统内嵌任务面板 || Extensible UI: embedded task panel

前端不可改造：Outlook / Teams / Power Pages || Fixed UI: Outlook / Teams / Power Pages

首选 · Push || Preferred · Push

标准 Connector || Standard Connector

来源系统原生事件 || Native source event

低延迟 · 平台托管 || Low latency · Managed

首选 · Push || Preferred · Push

Custom API + Webhook

OpenAPI 契约 · 事件验签 || OpenAPI contract · Signed event

[6][11][23]

兼容 · Pull / Batch || Compatible · Pull / Batch

轮询 · Gateway · 文件/队列 || Polling · Gateway · File/Queue

水位读取 · 批次对账 || Watermark read · Batch reconciliation

[24][25]

最后选择 · UI || Last Resort · UI

受控 UI 自动化 || Controlled UI Automation

无机器接口时操作界面 || UI automation with no machine interface

写后复核 · 失败录像 [28–30] || Post-write verification · Failure video [28–30]

事件进入 · 上下文读取 || Event Ingress · Context Read

↔

决定回写 · 凭证返回 || Decision Writeback · Receipt Return

Source Integration Plane

Source Adapter

隐藏来源产品差异，只向平台暴露五个窄接口。 || Hides source-product differences behind five narrow operations.

ReceiveEvent

验签 · 去重 · 重放 || Verify · Deduplicate · Replay

ReadContext

最小字段 · 数据截止时间 || Minimum fields · Freshness

ApplyDecision

幂等写入 || Idempotent write

GetWritebackStatus

状态查询 · 重试 || Status · Retry

GetSourceDeepLink

授权记录链接 || Authorized record link

→

事件引用 || Event Reference

Platform Runtime

审批运行时 || Approval Runtime

平台只处理标准契约，不包含来源产品分支。 || The platform handles normalized contracts without source-product branches.

IntegrationEvent

事件收件箱 || Event inbox

流程 Agent || Process Agent

理解与分派 || Interpret and route

Copilot Studio Workflow

规则 · AI · Human Gate || Rules · AI · Human gate

ApprovalCase

状态 · 决定 · 审计 || State · Decision · Audit

决定与回写 || Decision and Writeback

同一条可审计返回链 || One auditable return path

人员决定 || Human Decision

→

ApplyDecision

→

来源凭证 || Source Receipt

→

Closed

未返回业务凭证时保持 WritebackPending；批量与 RPA 必须额外对账。 || Without a business receipt, retain WritebackPending; batch and RPA paths require reconciliation.

:::accordion
::panel
### 4.1 按前端改造能力与系统接口选择接入方式 || 4.1 Choose Integration by Frontend Extensibility and System Interfaces
**前端可改造：在原系统内呈现任务，业务事实仍由服务端确认 || Extensible Frontend: Present Tasks In-App, Confirm Business Facts Server-Side**

前端能否改造只决定任务入口放在原系统还是统一工作台；事件真实性、数据读取和结果回写仍由后端接口能力决定。原系统可以增加审批状态、补件入口和 Agent 解释面板，但浏览器事件只能作为交互信号；可信事件必须来自服务端提交钩子、事务性事件表或后续查询。 || Frontend extensibility determines whether tasks appear inside the source system or on unified surfaces, while backend interfaces still determine event authenticity, data access, and result writeback. The source app can add approval status, evidence requests, and an agent explanation panel, but browser events are interaction signals only; trusted events come from a server-side submission hook, transactional outbox, or subsequent query.

| 系统接口 || System Interface | 事件与读取 || Event and Read | 原系统体验 || In-App Experience | 回写与边界 || Writeback and Boundary |
| --- | --- | --- | --- |
| 事件 + 读写 API || Events + Read/Write APIs | 服务端 Outbox 或 Webhook → Source Adapter；按记录 ID 和版本读取 || Server outbox or webhook → source adapter; read by record ID and version | 内嵌结构化任务面板；Agent 通过安全 Direct Line token 提供解释 || Embedded structured task panel; agent explanations use a secured Direct Line token | 按钮调用确定性 Workflow；API 返回凭证号与新版本 || Buttons call deterministic workflows; APIs return a receipt and new version |
| 只有查询或更新 API || Query or Update APIs Only | 优先补服务端提交钩子；否则按时间戳或递增编号轮询 || Add a server submission hook when possible; otherwise poll by timestamp or increasing ID | 仍可内嵌任务面板，但明确展示轮询延迟 || The task panel can remain embedded but must display polling latency | 按可用 API 或批量接口回写；异步结果进入对账 || Write through available APIs or batch interfaces; reconcile asynchronous results |
| 无后端机器接口 || No Backend Machine Interface | 前端只能传递来源引用；受支持的服务端插件优先，做不到才用 RPA || The frontend can pass only a source reference; prefer a supported server plugin, then RPA | 可显示平台状态，不能把浏览器提交当成来源系统已落账 || Can display platform status but cannot treat a browser submission as source posting | RPA 或人工回写；没有可核验结果时保持 WritebackPending || Use RPA or manual writeback; remain WritebackPending without verifiable confirmation |

**前端不可改造：后台 Sidecar 接入，审批人使用统一入口 || Fixed Frontend: Sidecar Integration with Unified Approval Surfaces**

来源界面保持不变，平台通过后台接口发现事项；Outlook、Teams 或 Power Pages 展示任务，并用来源深链接帮助审批人返回原记录。 || The source UI remains unchanged while backend interfaces expose cases. Outlook, Teams, or Power Pages presents tasks and provides a source deep link back to the original record.

| 系统接口 || System Interface | 事件与读取 || Event and Read | 审批入口 || Approval Surface | 回写与边界 || Writeback and Boundary |
| --- | --- | --- | --- |
| 事件 + 读写 API || Events + Read/Write APIs | Webhook 或 Connector → Source Adapter → IntegrationEvent || Webhook or connector → source adapter → IntegrationEvent | 统一入口 + 来源深链接；来源系统零改造 || Unified surfaces plus source deep links; no source UI changes | API 幂等回写并返回业务凭证 || Idempotent API writeback returns a business receipt |
| 查询、数据库或批量接口 || Query, Database, or Batch Interface | Custom Connector 轮询；内网资源经本地网关；文件按批次水位读取 || Custom connector polling; on-premises resources through the gateway; files read by batch watermark | 统一入口展示数据截止时间和来源深链接 || Unified surfaces display data freshness and the source deep link | API 或结果文件回写；导入结果单独对账 || Write through APIs or result files; reconcile import results separately |
| 无机器接口 || No Machine Interface | 专用受控运行环境读取 Web、桌面或终端界面 || A dedicated controlled runtime reads web, desktop, or terminal UIs | 统一入口；不向来源页面注入未经厂商支持的脚本 || Unified surfaces; no unsupported script injection into the source page | 写入后重新读取关键字段；失败录像和运行日志进入异常队列 || Reread key fields after writing; failure video and run logs enter the exception queue |

**五个操作隔离系统差异，Copilot Studio Workflow 不包含来源系统分支 || Five Operations Isolate System Differences from Copilot Studio Workflows**

每个来源系统实现同一组窄接口；Connector、Gateway、批量处理或 UI 自动化都封装在适配器内部，Workflow 只处理标准输入与输出。 || Each source implements the same narrow interface. Connectors, gateways, batch processing, and UI automation remain inside the adapter, while workflows handle standard inputs and outputs only.

| 操作 || Operation | 最小输入 || Minimum Input | 输出与判据 || Output and Criterion |
| --- | --- | --- |
| `ReceiveEvent` | `sourceEventId`, `recordId`, `version` | 验签并按来源事件 ID 去重，返回 IntegrationEvent 引用 || Verify origin, deduplicate by source event ID, and return an IntegrationEvent reference |
| `ReadContext` | `recordId`, `version`, `fieldSet` | 只返回审批所需字段、附件引用和数据截止时间 || Return only approval fields, attachment references, and data freshness |
| `ApplyDecision` | `decision`, `comment`, `idempotencyKey` | 返回业务凭证号、新版本与来源系统状态 || Return a business receipt, new version, and source status |
| `GetWritebackStatus` | `idempotencyKey` | 区分已接收、已落账、失败和未知，支持重试与对账 || Distinguish accepted, posted, failed, and unknown states for retry and reconciliation |
| `GetSourceDeepLink` | `recordId`, `viewerId` | 返回经过授权的记录链接；无深链接时返回导航说明 || Return an authorized record link or navigation instructions when deep links aren't available |

**可改造 CRM：服务端发事件，原页面呈现任务 || Extensible CRM: Server Events with In-App Tasks**

销售人员继续在 CRM 保存折扣申请；新增页面区域只承载状态、结构化操作和 Agent 解释，不改变 CRM 仍为业务权威。 || Sellers continue saving discount requests in CRM. The added page region carries status, structured actions, and agent explanations without changing CRM as the system of record.

1. **1 · CRM 事务与 Outbox 同时提交 || 1 · Commit the CRM Transaction and Outbox Together** — 申请记录和来源事件在同一服务端事务中提交；浏览器回调失败或重复发送不会制造第二个 ApprovalCase。 || The request and source event commit in the same server transaction. Failed or repeated browser callbacks don't create a second ApprovalCase.
2. **2 · Source Adapter 写入 IntegrationEvent || 2 · The Source Adapter Writes IntegrationEvent** — 适配器验签、按事件 ID 去重，只把记录 ID、版本、事件类型和来源深链接发送给 Agent。 || The adapter verifies origin, deduplicates by event ID, and sends only the record ID, version, event type, and source deep link to the agent.
3. **3 · 页面任务面板读取 ApprovalCase || 3 · The In-App Panel Reads ApprovalCase** — 结构化按钮调用 Human Task API；Agent 对话使用服务端换取的单会话 Direct Line token，不能在浏览器暴露 secret。[26][27] || Structured buttons call the Human Task API. Agent chat uses a single-conversation Direct Line token exchanged by the server, and no secret appears in browser code.[26][27]
4. **4 · Workflow 回写并核对新版本 || 4 · The Workflow Writes Back and Verifies the New Version** — 批准按钮直接进入确定性 Workflow；CRM 返回折扣审批凭证和新记录版本后，页面与统一工作台才显示 Closed。 || The approval button enters a deterministic workflow directly. The in-app panel and unified workbench show Closed only after CRM returns the approval receipt and new record version.

**不可改造 ERP：后台发现事项，统一入口决策 || Fixed ERP: Backend Discovery with Unified Decisions**

ERP 界面和原提交表单完全不变；接入方式按 Webhook、轮询、批量、RPA 的顺序降级，审批任务始终在平台统一呈现。 || The ERP UI and original intake form remain unchanged. Integration degrades in order from webhook to polling, batch, and RPA, while approval tasks remain unified on platform surfaces.

1. **1 · 按最强可用接口发现待审记录 || 1 · Discover Pending Records Through the Strongest Available Interface** — 有 API 时使用 Webhook 或水位轮询；只有内网数据库或文件时经本地网关；全部缺失时才采用受控 UI 自动化。 || Use webhooks or watermark polling when APIs exist, the on-premises gateway for internal databases or files, and controlled UI automation only when all machine interfaces are absent.
2. **2 · 统一入口显示来源与数据截止时间 || 2 · Unified Surfaces Show Origin and Data Freshness** — Outlook、Teams 或 Power Pages 展示证据、来源记录号、最后读取时间和可用深链接，避免把缓存内容误认为实时数据。 || Outlook, Teams, or Power Pages shows evidence, source record number, last-read time, and any available deep link so cached content isn't mistaken for live data.
3. **3 · Workflow 选择 API、批量或 RPA 回写 || 3 · The Workflow Selects API, Batch, or RPA Writeback** — 适配器隐藏来源差异；Copilot Studio Workflow 始终调用 ApplyDecision，不包含 ERP 产品名、页面选择器或文件目录分支。 || The adapter hides source differences. Copilot Studio Workflows always call ApplyDecision and contain no ERP product names, UI selectors, or file-path branches.
4. **4 · 无凭证不关闭，失败进入 Exception || 4 · No Receipt, No Closure; Failures Enter Exception** — RPA 写入后重新搜索业务单号并读取状态；找不到预期值、机器会话冲突或 UI 元素变化时保留 WritebackPending，并提交运行日志和失败录像。 || After an RPA write, the adapter searches the business reference and rereads status. Missing values, machine-session conflicts, or changed UI elements keep the case WritebackPending and attach run logs and failure video.
:::

## #runtime 05 / 审批规则与流转 :: 审批规则与流转

模板定义步骤结构与流转规则，业务矩阵按条件启用必需步骤并确定审批责任，组织映射确定办理人；任务决定汇总为步骤结果，再推进案件与业务回写。以下 CASE／STEP／TASK 机制为拟交付方案，规则与任务模块仍需开发及组合验收，不代表 Copilot Studio 原生提供完整能力。

### 5.1 审批定义与维护入口

:::insight-grid { cols: 3 }
::card CASE
### 申请模板
**存放：**Dataverse 流程类型与申请模板配置。

**定义：**申请入口、表单、可用步骤、完成与撤回规则。

**维护：**受训管理员通过 Power Apps 管理工作台配置，按版本发布。

::card STEP
### 步骤模板
**存放：**Dataverse 步骤模板与流程步骤关系配置。

**定义：**审批责任、先后或并行依赖、结果汇总规则；引用矩阵与任务模板。

**维护：**管理员通过 Power Apps 调整已支持的步骤与规则。

::card TASK
### 任务模板
**存放：**Dataverse 任务模板配置。

**定义：**加签、改派、委托等可用动作，以及期限、角色范围与材料要求。

**维护：**平台团队提供支持能力，管理员通过 Power Apps 配置选项。
:::

### 从定义到实际办理

:::insight-grid { cols: 3 }
::card 01
### 审批矩阵：选择责任
**存放：**Dataverse 独立矩阵与角色组织映射配置。

**判断：**按产品、价格、地区、客户与合同条件启用步骤；按角色和组织解析合资格人员，不固定姓名。

**边界：**模板管结构，矩阵管条件；政策不重复维护，与模板组成同一版本发布集。

::card 02
### 运行实例：记录本次审批
**存放：**Dataverse 案件、步骤执行记录和人员任务。

**生成：**申请通过校验后引用已发布定义，生成本次 CASE、STEP 和 TASK。

**加签：**A 加签 B 只新增关联任务实例，不修改模板，也不新建案件。

::card 03
### 执行服务：推进与恢复
**执行：**共享 Workflow 与审批服务读取已发布配置，校验授权、推进状态并恢复加签依赖。

**复用：**不为每个申请人或任务手工建流；管理员改参数，新增办理机制由平台团队开发。

**交付：**上述自定义配置与服务为拟建模块，不是微软原生完整审批引擎。
:::

### 5.2 案件、步骤与任务

CASE 是一笔申请，STEP 是销售或财务等业务审批责任，TASK 是人员待办。同一步骤可有多个并行任务；完成任务不等于批准，也不代表步骤通过或案件完成。

案件包含销售与财务步骤；财务步骤包含主审 A 与并行复核 D 的任务。各层责任见下表。

箭头仅表示包含关系，不表示状态转换或办理先后。销售任务省略；人员间的加签依赖不改变 TASK 所属层级。

| 层级 | 回答的问题 | 状态 | 推进要求 |
| --- | --- | --- | --- |
| CASE · 案件 | 一笔申请是否达成目标？ | 待校验、审批中、待补件、待回写、已完成、已拒绝、已撤回 | 必需 STEP 全部通过且无有效否决才可回写；权威记录更新确认后完成 |
| STEP · 步骤 | 某项业务审批责任是否满足？ | 未开始、进行中、已通过、未通过 | 按本步骤任一批准／全部批准及拒绝、否决规则汇总有效 TASK 结果 |
| TASK · 任务 | 谁可以办理、是否已提交决定？ | 待处理、处理中、等待加签、已完成、已取消 | 前置条件满足且人员获授权才可办理；完成时另记批准或拒绝结果 |

### 5.3 审批条件与人员分配

产品、价格、地区、客户和合同条件经矩阵计算，确定 CASE 启用的必需 STEP 及角色／组织责任；先后／并行依赖取自流程—步骤关系，任一／全部批准、拒绝和否决规则取自所引用的步骤模板。矩阵独立于 Workflow 管理，不重复维护模板规则，也不直接指定用户名；任务生成与办理时再按角色和组织确定合资格人员。

:::insight-grid { cols: 3 }
::card 01
### 业务政策
按多维条件确定必需审批及条件加签。已支持的阈值和条件可独立调整，不改主流程；金额、币种、汇率与来源材料须先核验。

::card 02
### 角色与组织
矩阵引用角色、组织及有效期。岗位无人或匹配冲突停止分派；组织变动通过留痕改派处理，不能自动降低审批要求。

::card 03
### 发布前验证
覆盖阈值以下、等于及以上样本，检查漏审与冲突。Agent 建议的流程和风险等级须按事实校验，避免选错流程降低审批要求。
:::

:::flow
1. **维护** — 管理员修改政策与岗位映射，预览审批责任变化；Agent 可建议，不得发布或授权。
2. **验证** — 回归样本通过后，由独立发布人批准，保留旧政策和命中结果供追溯。
3. **应用** — 新案件使用有效版本，在途案件保留原计划；关键事实变化形成新提交版本，受影响步骤重新计算并授权。
:::

**实施边界：**Dataverse business rules 支持字段验证和赋值。[31] 本方案仍需实现受限审批矩阵；超出约定条件、复杂计算或执行语义的变化进入专业开发评估。

### 5.4 案件状态

CASE 状态描述整笔申请进度，不随单个人员任务同步变化。例如前加签使 TASK 等待时，CASE 仍在审批中；审批结束后，还须确认业务记录更新。

案件提交后校验，缺材料则补件重提；审批满足全部必需步骤后待回写，更新确认后完成。拒绝与授权撤回分别终止案件。

CASE 图例：

实心圆表示案件起始，双圈终止标记表示案件结束，包括已完成、已拒绝、已撤回；方括号表示条件。图不含 TASK 内层状态、草稿与技术异常恢复分支。

- **完成与异常：**外部业务确认来源系统落账，自有业务确认 Dataverse 权威记录更新。失败或结果未知进入异常待处理，核实后从原阶段恢复，禁止重复落账。
- **拒绝与撤回：**按规则拒绝或按阶段权限撤回后终止案件；再申请创建关联历史的新案件。已生效业务另走撤销或补偿，不能靠改状态撤销交易；抄送仅通知，不授予批准权。

### 5.5 步骤推进与结果汇总

| 推进环节 | 条件与结果 |
| --- | --- |
| 步骤内与跨步骤流转 | 跨 STEP 按审批计划检查先后及并行前置条件，满足后才启动步骤；同一 STEP 内按 TASK 依赖开放可办理任务。独立并行任务可同时办理，不强制排成串行。 |
| 步骤结果汇总 | 直属 TASK 的有效决定须满足任一批准或全部批准，同时全部必需加签依赖均满足规则，才可判定 STEP 通过。拒绝按政策处理；否决独立判断，有效否决阻止通过，不被任一／全部批准覆盖。嵌套加签 B、C 只解除依赖，不作为额外票数替代 A。 |
| 后续推进与退回 | STEP 有效通过后重新检查后续步骤的启动条件；全部必需 STEP 通过且无有效否决，CASE 才进入待回写。退回／复审开启新轮次，冻结受影响后续步骤及任务；退申请人时补件重提并重新校验，保留未受影响的决定与全部历史。 |

### 5.6 任务操作与加签

### 任务状态与审批决定

| 任务状态 | 操作与下一状态 | 结果边界 |
| --- | --- | --- |
| 待处理 | 领取／打开 → 处理中 | 仅当前有效且前置条件满足的任务可办理 |
| 处理中 | 前加签 → 等待加签；提交有效决定 → 已完成 | 已完成同时记录批准或拒绝，二者不能混用 |
| 等待加签 | 全部必需前置满足规则 → 待处理 | 恢复本人办理，不自动批准；拒绝按政策处置 |
| 已完成 | 本轮办理结束 | 决定参与 STEP 汇总，复审另开新轮次 |
| 已取消 | 待处理／处理中／等待加签可因撤回或失效转入 | 取消不等于批准，迟到结果不得重新激活任务 |

### 连续前加签示例：A、B、C 依次等待与恢复

财务主审 A 前加签 B，B 再前加签 C；三项 TASK 同属财务 STEP。A 等 B，B 等 C。财务步骤汇总直属任务 A 与并行复核 D；B、C 的批准只解除依赖，不能代替 A 投票。

| 事件 | A | B | C | STEP / CASE |
| --- | --- | --- | --- | --- |
| 两次前加签已建立 | 等待 B | 等待 C | 待处理 | 财务进行中；案件审批中 |
| C 办理并批准 | 仍等待 B | 待处理，尚未决定 | 已完成·批准 | C 不自动批准 B 或 A；财务仍进行中 |
| B 办理并批准 | 待处理，尚未决定 | 已完成·批准 | 已完成·批准 | B 不自动批准 A；案件仍审批中 |
| A 办理并批准 | 已完成·批准 | 已完成·批准 | 已完成·批准 | 汇总 A、D，不重复计入 B、C；尚有必需步骤时 CASE 仍审批中 |
| 另一分支：C 拒绝 | 不能自动通过 | 不能自动恢复常规审批 | 已完成·拒绝 | 按政策终结步骤、退回，或交授权人处理；不得按批准链继续 |

- **统一处理：**审批运行时服务校验身份、任务资格、轮次及有效决定，重评等待中的直接父任务及其全部必需前置任务。全部满足才恢复父任务，否则继续等待或按拒绝／否决政策处置，再汇总 STEP 与 CASE。
- **可恢复同步：**持久保存依赖和业务事件，支持失败后重新评估、重复事件去重及幂等推进，防止漏恢复或重复生效。终止案件、取消任务与失效轮次不接受迟到结果重新开启。
- **受控续办：**恢复后可以再次申请加签，但须检查资格、职责分离、循环依赖与配置的深度限制并留痕。各入口只提交操作；Agent 仅解释和建议，无权批准或代人授权。

### 任务操作及其影响

| 动作与层级 | 原任务与新增任务 | STEP / CASE 影响 |
| --- | --- | --- |
| 条件追加审批 · STEP | 例如命中金额条件新增财务责任，通常新增 STEP 及其 TASK | CASE 增加必需步骤，按计划设置先后或并行；不等同于人员加签 |
| 前加签 · TASK | 原任务等待；新增必需前置任务先办理 | 同一 STEP 保持进行中；前置满足后恢复原任务，CASE 仍审批中 |
| 后加签 · TASK | 原任务可完成本人意见，再由新增后继任务办理 | 同一 STEP 等后继满足规则才通过，CASE 不提前回写 |
| 并行加签 · TASK | 原任务仍可办理，新增任务同时可用 | 修订当前 STEP 汇总规则；不移除强制审批，终局确定后其余任务失效 |
| 改派／转交 · TASK | 同一任务更换合资格处理人，不新增审批任务、不算完成 | 责任要求不变；记录前后人员、操作者、时间和原因，旧处理人的响应失效 |
| 外出委托 · TASK | 授权代理人办理，默认不新增审批任务；记录实际与被代理身份 | 规则不变；核验范围、期限，拒绝自批、循环与职责冲突，撤销后禁止新代理操作 |
| 退回／复审 · STEP、CASE | 退申请人进入待补件并重新校验；退前序开新轮次，暂停受影响后续任务 | 保留历史及未受影响决定；关键事实变化重算要求，受影响 STEP 重审，不抹去旧轮次 |

**续办保障：**Dataverse 保存唯一有效状态、材料、政策、决定与轮次；使用兼容版本恢复，失配转异常并通知流程负责人，由授权人员核实处理，不依赖原运行持续存活。所有加签记录原因；撤回与批准并发时只接受一个有效终局。

**原生能力：**prompt 支持内容生成。[7] Approvals 支持 Outlook、Teams 响应。[9][10] Power Pages 提供认证与表权限。[17][18]

Request information 经 Outlook 收集租户内首个响应后继续运行。[8] First to respond 由首个批准或拒绝结束，不等于任一批准。[32]

**方案扩展：**跨入口补件、加签依赖、指定前序退回、分层汇总与长期续办须另行实现；上述原生能力不构成这些机制的交付证明。

## #governance 06 / 安全与治理 :: 安全与治理

生产环境用三组横切控制约束全部组件：Agent、Workflow 与人员各自拥有明确决定权；回写失败时必须保持 WritebackPending 或转入 Exception，严禁伪装为已落账关闭；身份、DLP、Dataverse 权限、Credits 容量和 Dev → Test → Prod 发布门分别设定生产阈值。任何未授权访问或重复过账都直接触发试点停止条件。[2][3][5][12][13][14][15] || Three cross-cutting controls constrain every production component. Agents, workflows, and people hold explicit decision authority; failed writeback remains WritebackPending or enters Exception rather than appearing posted and closed; identity, DLP, Dataverse authorization, credit capacity, and Dev-to-Test-to-Prod release gates each have production thresholds. Any unauthorized access or duplicate posting stops the pilot.[2][3][5][12][13][14][15]

:::accordion
::panel
### 6.1 Agent、Workflow 与人的决定边界 || 6.1 Decision Boundaries Across Agent, Workflow, and People
三类执行者各自拥有明确决定权；Agent 的生成式规划不能覆盖 workflow 规则，也不能覆盖人员审批。 || Each executor owns explicit decisions. Generative agent planning can't override workflow rules or human approvals.

Agent

**理解、解释与选择受控工具 || Interpret, Explain, and Select Controlled Tools**

可分类事项、整合证据、识别缺失、选择已发布 workflow、解释状态与发起催办；不能自创工具、金额或审批规则。[5] || Can classify cases, assemble evidence, identify gaps, select a published workflow, explain status, and initiate follow-up. It can't invent tools, amounts, or approval policy.[5]

Workflow

**计算、校验、授权与回写 || Calculate, Validate, Authorize, and Write Back**

执行层调用版本化规则服务计算金额和审批计划，由审批命令服务校验身份、任务与期限，适配器处理幂等回写和对账。规则内容独立配置，生成式提取必须经事实核验才能参与计算，不能直接成为授权依据。

Human

**补充事实并承担最终责任 || Supply Facts and Own Final Accountability**

信息补充人核实缺失字段；审批人做出批准、拒绝、退回或委派决定。每次操作均记录操作人身份、时间戳、审批意见及当时所见的证据版本。 || Information contributors verify missing fields; approvers approve, reject, return, or delegate. Every action stores identity, time, rationale, and the evidence version shown.

> 失败样例：合同读取失败时，Agent 标记「合同内容未知」，workflow 转入 Request information 或人工审阅；禁止 Agent 根据供应商历史补写本合同条款。 || Failure example: if contract extraction fails, the agent marks Contract content unknown and the workflow enters Request information or manual review. The agent must not infer this contract's terms from supplier history.

::panel
### 6.2 失败走查：人员已批准，但 ERP 回写超时 || 6.2 Failure Walkthrough: Human Approval Succeeds, ERP Writeback Times Out
审批表决通过与来源系统成功落账属于两个独立状态：Agent 负责状态解释与催办，Copilot Studio Workflow 负责重试与补偿，任何一方都不得将回写失败标记为已结案。 || Approval decision and source-system posting are separate states. The agent explains and follows up, while the Copilot Studio Workflow owns retry and compensation; neither can mark failed writeback as closed.

1. **决定入账 || Record the Decision** — 平台保存 Approve、审批人、时间、意见和输入版本，状态进入 WritebackPending。 || The platform records Approve, the approver, timestamp, rationale, and input version, then enters WritebackPending.
2. **Source Adapter 先查状态，再按接入方式重试 || The Source Adapter Checks Status Before Retrying by Integration Mode** — API 临时错误可按幂等键指数退避重试 3 次；批量或 RPA 在任何重试前先按业务单号查询来源状态，已经生成凭证时禁止再次提交。 || Transient API errors can retry three times with exponential backoff and an idempotency key. Before any batch or RPA retry, the adapter queries source status by business reference and must not resubmit when a receipt already exists.
3. **进入异常队列 || Enter the Exception Queue** — 三次失败后进入 Exception，通知流程负责人；Power Pages 统一工作台显示「已批准，待回写」，而不是「已完成」。 || After three failures, the case enters Exception and notifies the process owner. The Power Pages unified workbench shows Approved, writeback pending rather than Completed.
4. **对账后关闭 || Close After Reconciliation** — 人工修复权限或版本冲突后再次回写；只有 ERP 返回业务凭证号并完成对账，状态才进入 Closed。 || After permissions or version conflicts are repaired, writeback runs again. The case reaches Closed only when ERP returns a business document number and reconciliation succeeds.

::panel
### 6.3 安全、DLP 与 ALM 边界 || 6.3 Security, DLP, and ALM Boundaries
触发身份、工具权限、Credits 容量与实际功能可用性分别设置生产门槛；以下配置之外，还需实现身份、职责分离、数据生命周期和 AI 停用控制。

- 触发身份：event trigger 当前只使用 agent maker credentials；生产使用专用低权限 maker 账号，并把 payload 缩到最小字段。[2] || Trigger identity: event triggers currently use agent-maker credentials only. Production uses a dedicated least-privileged maker account and minimizes trigger payloads.[2]
- 工具与数据：DLP 控制 connector 组合，Dataverse 角色限制表、列与记录；Agent 只获得完成当前流程所需工具。[12][14] || Tools and data: DLP governs connector combinations, Dataverse roles restrict tables, columns, and records, and the agent receives only the tools needed for the current process.[12][14]
- 容量：每 100 个 Copilot Studio Workflow action 消耗 13 Copilot Credits；预付容量耗尽会阻止新 Workflow run，生产环境启用告警、月度上限和 PAYG 连续性方案。[3] || Capacity: every 100 Copilot Studio Workflow actions consume 13 Copilot Credits. Exhausted prepaid capacity blocks new workflow runs, so production uses alerts, monthly limits, and a pay-as-you-go continuity plan.[3]
- 发布与风险：Agent、Copilot Studio Workflow、prompt、connector 与 Dataverse 表进入 Solution，经 Dev → Test → Prod；preview action 不进入关键生产路径，AI 风险按持续治理、测量和处置执行。[13][15] || Release and risk: agents, Copilot Studio Workflows, prompts, connectors, and Dataverse tables enter Solutions and move through Dev → Test → Prod. Preview actions stay out of critical production paths, and AI risk follows continuous governance, measurement, and treatment.[13][15]

以下为拟交付控制及验收要求，不是产品认证或已实现声明。

| 控制 | 实施要求 | 验收判据 |
| --- | --- | --- |
| 身份与职责分离 | 按实际身份、角色、组织及任务资格授权；规则编制与发布分权，maker 连接身份不代表业务操作者 | 拒绝冒名、自批、过期或循环代理、委托冲突、跨组织越权及自行发布；代理保留双方身份 |
| 传输与静态加密 | 逐服务确认传输、存储、备份加密及密钥责任；客户管理密钥以服务和许可支持为前提 | 提供配置与合同证据，拒绝未加密入口；核验密钥权限，演练轮换与恢复，不承诺统一 CMK |
| 审计与独立留存 | Dataverse 审计需配置环境、表、列及容量、保留和权限；有权管理员可删除记录，读取／导出可能需额外日志。[37] | 核验实际身份、关键字段和删除权限；按需另建独立归档并对账，审批运营账号无删除权，不称原生审计不可删除 |
| 保留、删除与 GDPR | 按目的与数据类别约定期限、责任及法律保留，覆盖案件、附件、提示词、索引、日志和备份；不宣称方案获 GDPR 认证 | 演练数据主体查找、导出、更正与删除请求；记录法律及备份到期限制，恢复后重施删除清单，合同明确双方责任 |
| AI 隔离与停用 | 服务端限制工具与数据权限；停用须阻断新 Agent 触发、AI 工具调用及在途输出提交，已发生业务影响另行对账 | 提示注入与停用后迟到输出均不得推进审批；确定性规则、事件处理及人工工作台继续办理 |
:::

## #admin-lifecycle 07 / 客户自助与版本发布 :: 客户自助与版本发布

无代码自助限于受训管理员可完成的约定变更，平台初建仍需开发。规则、表单、Workflow 与连接配置分别保留版本，并共同验证发布兼容性。

:::comparison
::versus 客户管理员
### 配置常用变化
调整已支持的条件、阈值、角色、组织和表单校验，预览影响；通过培训独立完成配置、发布申请及回滚演练。

::versus 专业开发
### 扩展能力边界
负责新增执行语义、复杂计算、系统接入与破坏性数据变更；评估迁移方案，交付测试样本、操作及恢复手册。
:::

:::flow
1. **开发环境设计** — 保存规则、表单与流程版本，明确新旧兼容范围；配置数据单独纳入交付，Solution 部署不迁移表中业务数据。[33]
2. **测试环境验证** — 使用合成或脱敏样本验证政策差异、历史材料、在途续办及回滚；不兼容版本不得晋级。
3. **生产环境发布** — 由独立发布人批准新案件入口，保留旧表单与兼容流程供在途案件使用，保留成本纳入运营预算。
:::

### 回滚边界

- 新案件恢复到已验证的默认发布版本。
- 在途案件沿用原版本；迁移须另经测试与业务批准，无法兼容时暂停办理。
- 回退定义不撤销历史决定、破坏性数据变更或外部交易；另作兼容修复、数据迁移或业务补偿。

| 表单来源 | 版本与权威边界 |
| --- | --- |
| 来源系统表单 | 保留原入口与业务权威；须有可读历史版本或授权快照，否则不能承诺重现当时材料。 |
| 平台表单 | Power Apps／Power Pages 办理内外部申请，Dataverse 为主记录；表单、提交材料及附件共同留版，历史只读呈现需实施。 |

## #platform-operations 08 / 运行监控与故障处理 :: 运行监控与故障处理

技术运行成功不等于案件完成。方案拟提供实例运营工作台，帮助管理员识别等待、补件与集成故障；干预须经过授权并留痕，不直接修改数据库状态。

:::insight-grid { cols: 3 }
::card 01
### 搜索案件
按业务标识、组织、负责人、状态和超期情况查询，查看当前阶段、采用版本及待办责任人。

::card 02
### 双向追踪
从案件追溯入站事件、审批决定与出站调用结果；区分尚未处理、失败和结果未知，日志脱敏且不记录令牌。

::card 03
### 受控恢复
授权人员可补齐岗位映射、改派、重试或停止案件，记录影响、身份与原因；Agent 仅准备摘要，不自行重放业务操作。
:::

:::flow
1. **发现** — 分别监控人员超期、缺少审批人、集成故障与容量风险。Credits 预付容量耗尽可能阻止新执行。[3]
2. **诊断** — 核对来源状态和业务凭证；结果不可确认或无法防止重复落账时，转人工对账。
3. **恢复** — 修复后核验案件与来源一致，确保不重复过账；演练执行中断及备份恢复，实测约定的数据丢失容忍度和恢复时间。
:::

**接入与服务边界：**拟交付受控 REST 接口和事件接入，连接 CRM、ERP 与主数据系统（MDM）；渠道、容量及恢复目标逐项验收，单项产品 SLA 不代表端到端服务承诺。

## #deployment-boundary 09 / 部署与数据驻留 :: 部署与数据驻留

EU 托管、指定国家部署和外部 AI 限制须分别核验。每个部署组合都要提供数据流及合同证据；本方案尚未证明严格 EU 成员国限定的端到端部署可行。

| 数据路径 | 目标控制 | 必须取得的证据 |
| --- | --- | --- |
| Dataverse、应用与 Workflow | 选择符合约束的服务与环境，隔离开发、测试和生产 | 服务适用条件、处理与存储位置、备份和恢复地区 |
| Agent、模型与知识 | 仅启用批准的模型、知识源及出口；相关 AI 设置影响数据流向。[36] | 提示词、附件、索引、会话和遥测位置；方案须逐路径核验，单一 AI 开关不足以证明全链路受限 |
| Teams、Outlook、Power Pages 与来源系统 | 通知与文件链接最小化，限制接收及访问范围 | Microsoft 365、站点、外部接口与附件副本的位置及访问条件 |
| 日志、支持与分包 | 限制诊断导出及远程访问，约定人员与服务地点 | 子处理者、支持升级、安全运营、备份删除及境外访问条款 |

**地域边界：**微软 EU Data Boundary 包含 EU 与 EFTA，且有持续传输及境外人员访问例外。[34][35] 因此，本方案不能据此承诺严格 EU-only；合法跨境传输依据也不能替代客户的驻留要求。

- **可用服务：**固定执行体验、版本与区域。agent flows 与另一套 Workflows 体验分别提供。[1][4] 预览／试用不自动适用正式付费服务的驻留承诺。[35]
- **AI 降级：**模型不可用或未获批准时，保留人工和确定性审批，不自动转向未经批准的境外模型。
- **合同准入：**法务须确认处理、存储及远程访问满足原始约束；必要服务证据不足或无法满足时不准入，增加审批模块不能解除该限制。

## #configuration 10 / 产品配置 :: 产品配置

基础组合固定为 Source Adapter、Copilot Studio 流程 Agent、Copilot Studio Workflow、Dataverse、Power Pages 统一工作台与 Microsoft 365 内部审批入口。配置向导依次采集接入能力、流程规模、Credits 用量和可选能力，结果面板实时同步更新容量摘要与完整产品清单。Copilot Studio PAYG、Power Apps Premium、Power Pages、Power BI Pro 与 Power Automate Process 进入已计价合计；APIM 区域 SKU、RPA 运行机器、外部身份提供商、税费和合同折扣另行核算。[3][16][19][20][21][22][25][27][29][30] || The core stack is a source adapter, Copilot Studio process agent, Copilot Studio Workflow, Dataverse, a Power Pages unified workbench, and Microsoft 365 internal approval surfaces. The wizard captures integration capabilities, process scale, Copilot Credit usage, and optional capabilities in sequence, while the full-width results panel updates the capacity summary and product list in real time. Priced totals include Copilot Studio pay-as-you-go, Power Apps Premium, Power Pages, Power BI Pro, and Power Automate Process; regional APIM SKUs, RPA runtime machines, external identity providers, taxes, and contract discounts remain separate.[3][16][19][20][21][22][25][27][29][30]

:::sandbox { id: "agentic-business-process-platform-sandbox-1", title: "前端、接口、网络与回写能力 || Frontend, Interface, Network, and Writeback Capabilities", canvas: false }
四项能力分别决定任务入口、事件接入、网络路径和结果确认；前端可改造不代表浏览器可以替代可信的服务端事件或来源回写。 || Four capabilities determine task placement, event ingress, network path, and result confirmation. An extensible frontend doesn't make browser events or writes authoritative.
:::

## #roi 11 / 成本与收益测算 :: 成本与收益测算

计算器统一使用 USD。收益分为三类：节省不同管理层的审批时间、减少资料不全造成的返工、减少审批延误造成的损失。成本分为产品年费、项目一次性实施费用、客户侧可选增量支持和报价单外费用。产品配置器的报价结果会自动带入，无需重复填写。默认值仅用于方案测算，正式立项前应由客户业务和财务团队确认。 || The calculator uses USD throughout. Benefits come from three sources: management time saved, less rework caused by incomplete evidence, and lower losses from approval delay. Costs consist of annual product fees, one-time project implementation, optional incremental customer support, and costs outside the quote. Product pricing flows in automatically from the configurator and is not entered twice. Defaults support proposal modeling and must be confirmed by customer business and finance teams before funding.

:::sandbox { id: "agentic-business-process-platform-sandbox-2", title: "审批量、采用与时间价值 || Volume, Adoption, and Time Value", canvas: false }
时间收益按 C-level、高级管理者和其他审批人分别计算。审批分配权重自动归一为 100%，始终与配置器带入的月审批总量保持对账；所有省时和成本输入都应由同流程试点实测数据替换。 || Time value is calculated separately for C-level executives, senior management, and other approvers. Approval allocation weights normalize to 100% and always reconcile to the configured monthly approval total. Replace all time-saving and labor-cost assumptions with evidence from the same-process pilot.
:::

## #delivery 12 / 实施与交接 :: 实施与交接

首期只选一个流程、一个责任部门和一组明确指标；每阶段都有交付范围和退出条件，未达标时保留原审批入口并停止扩展。 || Phase one selects one process, one accountable function, and one explicit measure set. Every phase has a defined delivery scope and exit gate; when a gate fails, the original approval path remains available and expansion stops.

:::flow { title: "四阶段交付计划 || Four-Phase Delivery Plan" }
1. **阶段 1 · 2 周发现与基线 || Phase 1 · Two-Week Discovery and Baseline** — 选定一个月审批量足够、风险可控的流程；完成 4 项基线、ApprovalCase 字段映射、身份边界和回写接口评审。 || Select one sufficiently frequent, controllable-risk process. Complete four baselines, ApprovalCase mapping, identity boundaries, and writeback API review.
2. **阶段 2 · 4–6 周 Agent + Workflow PoC || Phase 2 · Four-to-Six-Week Agent and Workflow PoC** — 在选定环境验证一个 standard harness agent flow、流程 Agent、规则服务、HumanTask 命令服务与模拟回写。按需验证原生 Approval／Request information 的渠道映射、取消与迟到响应；同时演练短时运行结束后的版本化续办。所列周期仅用于单流程 PoC 排期，不承诺在该周期交付全部通用模块。
3. **阶段 3 · 6–8 周生产试点 || Phase 3 · Six-to-Eight-Week Production Pilot** — 限制到一个部门和明确金额阈值，保留原审批入口回退；连续 4 周对照业务指标，并记录每笔 Agent actions、Copilot Studio Workflow actions、Prompt tokens 与文档页数。 || Restrict production to one function and an explicit amount threshold while retaining the original approval path. Compare business measures for four weeks and record agent actions, Copilot Studio Workflow actions, prompt tokens, and document pages per case.
4. **阶段 4 · 按模板逐流程扩展 || Phase 4 · Expand Process by Process with Templates** — 复用 Agent instructions、Copilot Studio Workflow、Prompt、Connector、Human Gate、ApprovalCase、DLP 和 ALM 模板；一次只增加一个流程或组织范围。 || Reuse agent instructions, Copilot Studio Workflows, prompts, connectors, human gates, ApprovalCase, DLP, and ALM templates, adding only one process or organizational scope at a time.
:::

## #case 13 / 组合案例 :: 组合案例

本节基于常见制造业采购审批特征构造组合示例，不对应任何单一真实客户，也不代表已落地的交付结果。其作用是演示如何将业务问题、产品配置、基线、目标与扩展条件纳入同一份试点章程；所有数字在立项时均须替换为客户真实日志、财务口径与安全评审结论。 || This composite scenario combines common manufacturing-procurement approval characteristics. It does not represent one real customer and does not claim realized outcomes. Its purpose is to show how business problems, product configuration, baselines, targets, and scale gates fit into one pilot charter. Every figure must be replaced with customer logs, finance definitions, and security review.

:::insight-grid { cols: 3, title: "制造业采购组合示例 || Composite Manufacturing Procurement Scenario" }
::card 01
### 现状假设 || Illustrative Baseline
3 个来源系统，180 名审批人，月均 20,000 笔；单笔主动处理 7 分钟，材料退回率 10%，审批人需要分别登录采购、ERP 和合同系统。 || Three source systems, 180 approvers, and 20,000 monthly requests. Active handling averages seven minutes, evidence returns are 10%, and approvers separately enter procurement, ERP, and contract systems.

::card 02
### 试点范围 || Pilot Scope
选择一个工厂、一个间接采购流程和 30 名审批人；保留原提交表单，接入预算、供应商状态和合同附件，Outlook/Teams 处理内部审批。 || Select one plant, one indirect-procurement process, and 30 approvers. Retain the original intake form, connect budget, supplier status, and contract evidence, and process internal decisions in Outlook/Teams.

::card 03
### 产品配置 || Product Configuration
Copilot Studio 流程 Agent + Copilot Studio Workflow + Dataverse + Power Pages 统一工作台 + Teams Approvals；原生 Prompt 与 Content processing 生成简报并提取附件；Custom Connector 回写 ERP；Power BI 分析流程。 || A Copilot Studio process agent, Copilot Studio Workflow, Dataverse, a Power Pages unified workbench, and Teams Approvals; native prompts and content processing for briefs and attachments; a custom connector for ERP writeback; and Power BI for process analysis.
:::

| 维度 || Dimension | 组合示例基线 || Composite Baseline | 8 周试点通过条件 || Eight-Week Pilot Gate | 停止扩展条件 || Stop Condition |
| --- | --- | --- | --- |
| 采用 || Adoption | 0% 使用统一入口 || 0% use the unified surfaces | 至少 70% 试点审批通过 Outlook/Teams 完成 || At least 70% of pilot decisions complete through Outlook/Teams | 连续 2 周低于 50% || Under 50% for two consecutive weeks |
| 效率 || Efficiency | 单笔主动处理 7 分钟 || Seven active minutes per item | 同风险等级中位数降至 4 分钟或以下 || Median falls to four minutes or less within the same risk tier | 处理时间下降但错误决定率上升 || Handling time falls while decision-error rate rises |
| 材料质量 || Evidence Quality | 材料退回率 10% || 10% evidence return rate | 降至 6% 或以下，且政策标准不变 || Falls to 6% or less with unchanged policy standards | AI 简报出现 1 次未标注来源的关键事实 || One material AI fact appears without a source |
| 可靠性 || Reliability | 跨系统追踪缺失 || No cross-system trace | 99% 事项具备完整事件链，回写成功率至少 99.5% || 99% have complete event chains and writeback succeeds at least 99.5% | 出现重复过账或未授权数据访问 || Any duplicate posting or unauthorized data access |
| 财务 || Economics | 无同口径收益基线 || No comparable benefit baseline | 用实测参数重算后，所选 ROI 区间的收益/成本比至少 1.2x || At least 1.2x benefit/cost over the selected ROI horizon after recalculation with measured inputs | 只靠未报价的避免重构成本才能达到 1.0x || Reaches 1.0x only through an unquoted avoided-rebuild assumption |

:::accordion
::panel
### 13.1 达标后如何扩展，未达标时如何处理 || 13.1 How to Scale After Passing and Respond After Failure
扩展依据是试点门槛，不是演示反馈；每轮只增加一个流程或组织范围。 || Scale follows pilot gates rather than demo feedback, and each wave adds only one process or organizational scope.

通过 || Pass

**复用模板，增加第二个采购流程 || Reuse the Template for a Second Procurement Process**

复用状态机、异常队列、连接引用、DLP、简报 schema 和指标定义，只新增字段映射、审批规则与来源 API。 || Reuse the state machine, exception queue, connection references, DLP, brief schema, and measures. Add only field mapping, approval policy, and source APIs.

未通过 || Fail

**保持原入口，修复单一失败原因 || Retain the Original Path and Repair One Failure Cause**

按采用、数据质量、AI 简报、集成可靠性或经济性定位失败；修复后重跑同范围 4 周，不同时更换流程和组织。 || Classify failure by adoption, data quality, AI brief, integration reliability, or economics. After repair, rerun the same scope for four weeks without changing both process and organization.
:::

## #capability-acceptance 14 / 能力验收 :: 能力验收

按客户 Must／Should 要求验收拟交付能力。设计覆盖不代表产品原生支持或系统已交付；只有适用版本、责任方及测试证据明确，才能声明满足。

| 能力／优先级 | 交付范围 | 业务验收结果 |
| --- | --- | --- |
| POL / Must | 开发独立多维矩阵、角色／组织规则及条件加签 | 调整阈值和映射不改主模型，缺失或冲突阻断审批 |
| TASK / Must | 开发加签、改派、退回、委托及任一／全部审批 | 同案续办、关键修改重审；历史保留，代理不越权，重复响应不重复推进 |
| LIFE / Must | 受限自助、流程／表单版本及开发测试生产发布 | 管理员独立配置；回滚保留在途版本、旧材料与续办能力 |
| OPS / Must | 交付搜索、干预、REST、事件与双向追踪 | CRM／ERP／MDM 实际接通，故障可定位，恢复不重复落账 |
| SEC / Must | 身份／单点登录、角色权限、职责分离、加密、审计及数据生命周期控制 | 拒绝越权、自批、代理冲突、停用账号和注入攻击；访问与删除覆盖关联数据及备份政策 |
| RES / Must | 逐服务及合同核验本次 EU 成员国限制 | 数据流及支持访问符合要求；证据不足则不准入 |
| EXT / Should | 撤回／撤销、抄送与外部 AI 限制 | 结论唯一，抄送无批准权；AI 停用阻断新调用及在途输出，人工可继续 |
| DEL / 商务 | 本地支持、培训、专业服务及透明许可待合同确认 | 服务与报价有依据，管理员通过操作考核 |

:::flow
1. **验证可复用需求** — 保留优先级与未满足项；多轮补件、任务冲突及跨渠道响应按同案组合验证。
2. **配置项目差异** — 明确行业政策、组织与接口范围，预先约定规模、最长等待、性能及恢复目标。
3. **凭证据验收** — 留存版本、责任方与测试记录，演练 AI 停用、响应丢失及灾备恢复；短时演示不能证明长期续办可靠。
:::

| 自建与复用 | 条件采购 |
| --- | --- |
| 优先复用微软平台并开发通用规则／任务模块，不默认增加专业 BPM。 | 迁移、复杂审批或运维存在明确缺口，或全生命周期成本更高时，以相同用例比较商业套件、开源与自研；替换后仍保留唯一状态来源。 |

### 商务交付范围

- 德国／欧洲服务实体、德英语言、CET／CEST 时段、故障值守与升级 SLA、培训及专业变更边界写入合同。
- 列明全生命周期许可、容量与超额费，覆盖非生产、日志归档、模块开发维护及适用许可条件；配置器估算不代替完整报价。
- 明确数据、配置及源码权属／使用权、审计导出和在途案件退出安排。

## #references 15 / References :: 参考资料 || References

产品能力和限制以 Microsoft Learn 与 Microsoft Support 官方文档为准；AI 风险边界参考 NIST AI RMF。本文没有引用未经核验的客户收益数字。产品许可、功能可用性和服务限制可能随地区、云环境与发布时间变化，实施前应重新核验。 || Product capabilities and limits rely on official Microsoft Learn and Microsoft Support documentation, while AI risk boundaries reference the NIST AI RMF. This proposal cites no unverified customer benefit figures. Licensing, feature availability, and service limits can vary by region, cloud, and release date and must be rechecked before implementation.

- [1] Microsoft Learn · Dataverse Business Rules — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-create-business-rule | 支持字段赋值、校验及适用范围，不证明通用审批矩阵执行能力。2026-09-14 核验。
- [2] Microsoft Learn · Approval Completion Rules — https://learn.microsoft.com/en-us/power-automate/all-assigned-must-approve | 支持 First to respond 与 Everyone must approve 的批准和拒绝语义，不证明动态任务控制原生可用。2026-09-14 核验。
- [3] Microsoft Learn · Power Platform Pipelines — https://learn.microsoft.com/en-us/power-platform/alm/pipelines | 支持 Solution 部署及按设置重部署历史版本，不含 Dataverse 表中业务数据，也不保证在途案件和外部副作用回滚。
- [4] Microsoft Learn · EU Data Boundary — https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-learn | 支持 EU＋EFTA 范围及服务适用条件，不等同于严格 EU 成员国驻留。
- [5] Microsoft Learn · Continuing Data Transfers — https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-transfers-for-all-services | 支持境外访问、支持与安全运营等例外；预览和免费试用不在相同承诺范围。2026-09-14 核验。
- [6] Microsoft Learn · Generative AI Data Movement — https://learn.microsoft.com/en-us/power-platform/admin/geographical-availability-copilot | 支持相关 AI 区域设置、Bing 与 flex routing 的处理边界；开关不能替代全链路核验。

---
title: "销售 Agentic CRM 设计文档：六阶段实施手册 || Sales Agentic CRM Design Doc: Six-Stage Implementation Manual"
eyebrow: "Design Doc · Vibe Coding 提示词集 || Design Doc · Vibe Coding Prompt Pack"
brand: Agentic Sales Mobile
date: 2026-05-01
strict_i18n: false
strict_density: true
lead: "这份手册面向开发者与 maker，提供从空租户环境到可演示原型的完整落地路线（01 Foundation → 02 Plan + Bootstrap → 03 Refine → 04 Canvas App → 05 Automation → 06 Solution → 07 Operate），从方法论延伸至详细设计，每个阶段均附可直接复制的 Copilot 提示词与操作指引。 || Written for developers and makers, this manual lays out the end-to-end path from an empty tenant to a demo-ready prototype (01 Foundation → 02 Plan + Bootstrap → 03 Refine → 04 Canvas App → 05 Automation → 06 Solution → 07 Operate), connecting methodology to detailed design with copy-paste Copilot prompts and step-by-step instructions at every stage."
hero_actions:
  - "先看怎么用 || How to Use This Doc | #how-to-use"
  - "进入阶段 01 || Start Stage 01 | #stage-01"
panel_label: "核心主张 || Core Thesis"
panel_title: "不再让销售\"使用 CRM\"，而是让 CRM\"跟随销售\"。 || Stop making sales reps \"use the CRM\". Make the CRM follow them."
panel_desc: "传统思路是把桌面 CRM 移植到手机上；本方案的设计原点是：把 CRM 拆解成一个个可被语音召唤、可在对话中确认、可在后台自动落库的智能体（Agent），让销售只与客户、不与表单打交道。 || The conventional approach ports the desktop CRM onto a phone. This proposal does the opposite — it decomposes the CRM into voice-summonable, conversation-confirmable, silently-persistable agents, so reps engage with customers, not forms."
panel:
  - "移动优先 — 单手 30 秒内完成主流程 || Mobile-first — main flows finishable single-handed within 30 seconds"
  - "语音先行 — 自然语言取代字段填空 || Voice-first — natural language replaces form filling"
  - "AI 编排 — Agent 调度而非菜单导航 || AI orchestration — agents dispatched, not menus navigated"
  - "SAP 共生 — 不替换底座，扩展智能层 || SAP symbiosis — no replacement, only an intelligence layer on top"
style:
  accent: "#a78bfa"
---

## #how-to-use 00 / How to Use This Doc :: 使用指南与前置条件 || Usage Guide & Prerequisites

这份实施手册可直接按步骤粘贴执行：每个阶段都配有可直接复制到 Power Apps / Copilot Studio / Power Automate 的提示词卡片，配套结构、产出物、风险与回退指引。动手前先确认下方三件事，能省去后面 80% 的反复折返。 || This build manual is designed for direct step-by-step execution: every stage ships with copy-paste prompt cards for Power Apps / Copilot Studio / Power Automate, paired with structure, outputs, risk, and rollback guidance. Confirm the three items below first to avoid 80% of downstream back-and-forth.

:::comparison
::versus 方案 1 || Option 1
### 读者画像 || Reader Personas
- **Maker / 业务侧**：跟着方法论总览 + 各章阶段卡 + 提示词，能在 Plan Designer 里产出 v0 plan，并在 Vibe Coding 里搭出可演示原型。 || **Maker / business side**: follow the methodology overview + per-chapter stage cards + prompts to produce a v0 plan in Plan Designer and a demo prototype in Vibe Coding.
- **开发 / Pro-Code**：重点看阶段 04 的 Vibe ↔ Pro-Code 边界、阶段 05 Solution-ize、阶段 06 Pipeline，承接 maker 产物上线。 || **Developer / Pro-Code**: focus on the Vibe ↔ Pro-Code boundary in Stage 04, Solution-ize in Stage 05 and pipelines in Stage 06; take the maker output to production.
- **架构 / 治理**：先看阶段 01 Foundation，确认环境矩阵 / DLP / Publisher prefix / Plans 启用；治理基线决定后面所有阶段的可上线性。 || **Architecture / governance**: start with Stage 01 Foundation; environment matrix, DLP, publisher prefix and Plans enablement determine whether everything downstream is shippable.

::versus 方案 2 || Option 2
### 跑完时间预估（首遍） || Time Estimate (First Run)
- 阶段 01 Foundation：1 个工作日（4 个环境 + DLP + ADR） || Stage 01 Foundation: 1 working day (4 environments + DLP + ADR)
- 阶段 02 Plan-First：30 分钟（Plan Designer 跑通三 Agent） || Stage 02 Plan-First: 30 min (run all three Plan agents end-to-end)
- 阶段 03 Refine ×3：半天（每轮 Edit + 人审） || Stage 03 Refine ×3: half a day (each round Edit + human review)
- 阶段 04 Vibe Build：1 天（Bootstrap + 5 屏 prompt + 4 Flow） || Stage 04 Vibe Build: 1 day (Bootstrap + 5 screen prompts + 4 flows)
- 阶段 05–06 Solution + Pipeline：3 天（首次 ALM 接线含 PR / 评审） || Stages 05–06 Solution + Pipeline: 3 days (first ALM wire-up including PR / review)

::versus 方案 3 || Option 3
### 动手前必须就位 || Required Before You Start
- **订阅**：Power Apps Premium + Copilot Studio license；建议 Power Platform per-app or Premium per-user。 || **Subscriptions**: Power Apps Premium + Copilot Studio license; recommend Power Platform per-app or Premium per-user.
- **角色**：1 名 Power Platform Admin（管 4 环境与 DLP）+ 1 名 Solution Architect + 1 名 Maker；Pro-Code 在阶段 04 后期接入。 || **Roles**: 1 Power Platform Admin (owns the 4 envs + DLP), 1 Solution Architect, 1 Maker; Pro-Code joins in late Stage 04.
- **账号**：Microsoft 365 工作账号 + 同租户的 SAP Commerce 服务账号（用于 Virtual Tables）。 || **Accounts**: Microsoft 365 work account + same-tenant SAP Commerce service account (for Virtual Tables).
- **仓库**：一个空 Git repo（GitHub 或 Azure DevOps）；阶段 05 起作为 source of truth。 || **Repository**: an empty Git repo (GitHub or Azure DevOps); becomes the source of truth from Stage 05 onward.
:::

01–02

Foundation + Plan

环境 · Plan Designer · Bootstrap || Envs · Plan Designer · Bootstrap

03–04

Refine → Canvas

三轮人审 · 5 屏 Vibe Coding || 3 rounds · 5 screen Vibe Coding

05

Automation

4 Flow + Agent || 4 Flows + Agent

06–08

上线 + 自助 || Ship + Self-Serve

Solution · Pipeline · 索引 || Solution · Pipeline · Index

## #build-and-operate 02 / Methodology Overview :: 六阶段实施全景 || Six-Stage Implementation Overview

六阶段全景图汇总了从环境基线到持续运维的实施主线；各阶段（01–06）分别给出方法论、详细设计与可复制提示词，点击任意阶段可直接定位到对应实施卡片。 || The six-stage overview maps the delivery spine from environment baseline to ongoing operations; stages 01–06 each provide methodology, detailed design, and copy-paste prompts, and clicking any stage jumps directly to its implementation card.

01 · Foundation

环境与治理基线 || Environments & Governance

开 4 个 Dataverse 环境（Dev / Test / UAT / Prod），落 DLP / 命名 / Publisher prefix。 || Stand up four Dataverse environments (Dev / Test / UAT / Prod); lock DLP, naming and the publisher prefix.

Admin Center

DLP

02 · Plan-First

Plan Designer 起手 || Plan Designer Kickoff

销售一句话 → Requirement / Data / Solution Agent 顺序生成 v0 plan。 || A one-line business problem → Requirement / Data / Solution Agents emit a v0 plan in sequence.

Plan Designer

3 Agents

03 · Refine ×3

三轮人审 + Copilot 改写 || Three Refine Rounds

角色补全 → 数据贴齐 SAP Virtual Tables → 技术栈裁剪到 Phase 1 范围。 || Round out personas → align tables with SAP Virtual Tables → trim the tech list to Phase 1 scope.

Copilot Edit

Data Workspace

04 · Vibe Build

Vibe Coding 出原型 || Vibe Coding the Prototypes

Bootstrap 提示词搭骨架，四屏提示词逐屏生成；性能 / SAP / 安全敏感处由 pro-code 接管。 || A Bootstrap prompt scaffolds the skeleton; four screen prompts generate UI; perf / SAP / security-sensitive parts hand off to pro-code.

Canvas App

Copilot Studio

PCF

05 · Solution-ize

Solution 化 + Source Control || Solution-ize + Source Control

导出 unmanaged Solution → SolutionPackager 解包到 Git → PR 评审 → 每日构建 managed 包。 || Export unmanaged solution → SolutionPackager unpack into Git → PR review → daily managed-build artifact.

SolutionPackager

Git

Azure DevOps

06 · Promote & Operate

Pipeline 推送与持续运维 || Promote & Operate

Pipeline → Test / UAT / Prod；Patch 走 hotfix、Upgrade 走 minor；App Insights 看可用率与时延。 || Pipeline pushes Test / UAT / Prod; patches for hotfixes, upgrades for minor releases; App Insights tracks availability and latency.

In-product Pipelines

App Insights

## #stage-01 01 / Foundation :: 环境、DLP 与 Publisher Prefix || Environments, DLP & Publisher Prefix

ALM 的所有能力都依赖一个前提：四个独立的 Dataverse 环境 + 一个全公司唯一的 Publisher prefix。必须在第一行 metadata 落地之前锁定。 || Every ALM capability depends on one prerequisite: four isolated Dataverse environments and one company-wide publisher prefix. Lock it before the first row of metadata exists.

01

阶段 01 · Foundation || Stage 01 · Foundation

### 先把能上线的轨道铺好，再让 AI 在上面跑车 || Lay the track first, then let AI run on it

一句话：把 4 个 Dataverse 环境、DLP、Publisher prefix 在第一行 metadata 落地之前定下来。 || In one line: lock 4 Dataverse environments, DLP and the publisher prefix before the first row of metadata exists.

ALM 的所有能力都依赖一个前提：四个独立的 Dataverse 环境 + 一个全公司唯一的 Publisher prefix。Publisher prefix 一旦在生产里出现就改不了，必须在第一行 metadata 落地之前定下来。 || Every ALM capability later depends on a single prerequisite: four isolated Dataverse environments and one company-wide publisher prefix. The prefix is immutable once any production metadata exists — it must be locked before the first row of metadata is created.

执行清单 || Checklist

- 在 Admin Center 创建 Dev / Test / UAT / Prod 四套环境，全部启用 Dataverse || Create Dev / Test / UAT / Prod in Admin Center, all with Dataverse
- 设定 Publisher = {your_company}，prefix = {prefix}，锁定命名约束 || Set Publisher and prefix, lock naming convention
- 发布 DLP 策略：Business / Non-Business / Blocked 三级分类 || Publish DLP policy: Business / Non-Business / Blocked
- 为 Dev / Test 启用 Plans 功能 || Enable Plans on Dev / Test
- 产出：《环境与治理手册》含容量、备份、管理员 || Output: Environment Handbook with capacity, backup, admin list
- 产出：Publisher prefix 锁定记录（ADR） || Output: Publisher prefix lock entry (ADR)
- 门禁：4 个环境均可登录且 DLP 策略生效后方可进入阶段 02 || Gate: all 4 environments accessible and DLP active before Stage 02

**查看深入：环境矩阵 · 风险与回退 || Deep dive: Environment Matrix · Risk & Rollback**

**环境矩阵 || Environment Matrix**

- **Dev** · unmanaged Solution，Plans 启用，maker 可写
- **Test** · 接收 managed Solution，CI 部署目标
- **UAT** · 业务侧 sign-off，含真实样本数据
- **Prod** · 仅 Pipeline 写入，强制 4-eyes 审批

**风险与回退 || Risk & Rollback**

- 任何环境创建后 24h 内备份基线，便于灾难恢复 || Snapshot baseline within 24h of environment creation for DR
- DLP 变更走 PR + Admin 审批，保留变更日志 || DLP changes go through PR + Admin approval, with change log

## #stage-02 02 / Plan Designer Kickoff :: 三 Agent 接力生成 v0 Plan || Three Agents Produce a v0 Plan

进入 Power Apps Home → Start with a plan，把销售场景一句话写进 Copilot prompt。三个 Plan Agent 接力：Requirement → Data → Solution，每段都有 Looks good / Edit 两个动作。 || In Power Apps Home choose Start with a plan and paste the one-line scenario into Copilot. Three Plan Agents work in sequence: Requirement → Data → Solution, each exposing Looks good / Edit.

02

阶段 02 · Plan-First || Stage 02 · Plan-First

### 一句话业务问题 → 三个 Agent 顺序产出 v0 Plan || One-line problem → three agents emit a v0 plan, in order

一句话：业务问题 + 客户 context → Requirement / Data / Solution 三个 Plan Agent 接力产出 v0 Plan。 || In one line: business problem + customer context → the Requirement / Data / Solution agents hand off in sequence to produce v0.

进入 Power Apps Home → Start with a plan，把销售场景一句话写进 Copilot prompt。三个 Plan Agent 会接力工作：Requirement Agent 推导用户角色与故事，Data Agent 推荐 Dataverse 表与关系，Solution Agent 给出技术栈建议（Canvas / Model-driven / Power Pages / Power Automate / Copilot Studio Agent）。每一段都有 Looks good / Edit 两个动作。 || In Power Apps Home choose Start with a plan and paste the one-line scenario into Copilot. Three Plan Agents work in sequence: Requirement Agent derives user roles and stories, Data Agent proposes Dataverse tables and relationships, Solution Agent recommends a tech mix (Canvas / Model-driven / Power Pages / Power Automate / Copilot Studio Agent). Every step exposes Looks good / Edit.

执行清单 || Checklist

- 把核心业务问题压缩成一句话（≤ 50 字） || Compress core problem into one line (≤ 50 chars)
- 附上现有 CRM 截图 + ERP 数据字典作为 context || Attach existing CRM screenshots + ERP data dictionary as context
- 三 Agent 依次执行：Requirement → Data → Solution，每段 Looks good / Edit || Run 3 agents in sequence: Requirement → Data → Solution, Looks good / Edit each
- 导出 v0 plan PDF 留存基线 || Export v0 plan PDF as baseline
- 跑 Bootstrap A 数据骨架提示词（见下方） || Run Bootstrap A data skeleton prompt (below)
- 产出：v0 Plan（3-4 角色 / 8-12 表 / 3-5 技术） || Output: v0 Plan (3-4 personas / 8-12 tables / 3-5 techs)
- 产出：7 张 draft tables + Connection Refs + Roles + Env Vars || Output: 7 draft tables + Connection Refs + Roles + Env Vars
- 门禁：v0 Plan PDF 已导出 + Bootstrap A 生成的 tables 可在 Dataverse 中看到 || Gate: v0 Plan PDF exported + Bootstrap A tables visible in Dataverse

**查看深入：Plan Designer 三 Agent 分工 · 起手 Prompt || Deep dive: Three Plan Agents · Kickoff Prompt**

**Plan Designer 三 Agent 分工 || Three Plan Agents at Work**

- **Requirement Agent** · 业务问题 → 用户角色 + 用户故事
- **Data Agent** · 用户故事 → Dataverse 表 / 列 / 关系
- **Solution Agent** · 角色 + 数据 → 推荐技术栈

**Plan Designer 起手 Prompt（直接复制） || Plan Designer Kickoff Prompt (copy-paste)**

```
为一线销售团队构建一个移动优先的 Canvas App，名称 Sales Copilot Mobile。核心场景：

1. 销售出差时单手 30 秒内通过语音记录客户拜访（客户名、联系人、结果、下一步），AI 自动解析语音并生成结构化活动记录。
2. 活动记录确认后，AI 自动起草关联商机（客户、阶段、置信度、预计关闭日期），销售确认即入库。
3. 每日早 6 点自动生成个性化语音播报（今日拜访计划、商机动态、风险提醒），销售通勤时收听。
4. 销售可通过对话式 Agent 查询客户信息、商机状态、活动历史，无需打开表单。

技术约束：
- 现有 ERP 是数据真相源，新平台通过 HTTP connector 读取，写回走异步队列。
- 语音转文字用 Azure Speech，结构化抽取用 Azure OpenAI。
- 安全：行级 owner-based 权限，三种角色（一线销售 / 区域经理 / 管理员）。
- 双语界面（zh-Hans + en-US），按用户语言自动切换。

请基于以上需求生成 Plan，包括用户角色、Dataverse 数据表、推荐技术栈。
```

### ⚙ Plan 完成后的第一个动作：搭数据骨架 || ⚙ First Action After Plan: Scaffold the Data Skeleton

Plan Designer 产出 v0 后，在同一个 vibe 环境里立即跑这段提示词，把 Solution / 7 张 Tables / Connection References / Security Roles / Env Vars 一次性拉齐。后续 Canvas App 屏幕和 Power Automate Flow 都基于这个骨架生成。 || After Plan Designer produces v0, run this prompt in the same vibe environment to scaffold the Solution / 7 Tables / Connection References / Security Roles / Env Vars in one shot. All subsequent Canvas App screens and Power Automate Flows build on this skeleton.

Sales Copilot Mobile · Bootstrap

### Solution

- SalesCopilotMobile（Publisher 前缀 scm） || SalesCopilotMobile (publisher prefix scm)

### Dataverse 表 || Dataverse Tables

- Account / Contact
- Opportunity (stage, confidence, ext_id)
- Activity (type, draft_status, raw_voice_url, parsed_json)
- OpportunityWriteQueue

### Connector 占位 || Connector Placeholders

- ERP HTTP（待用户提供）
- Azure Speech / Azure OpenAI
- SharePoint / Outlook / Teams

### Power Automate Flow 空壳 || Power Automate Flow Stubs

- Flow_VoiceToActivity
- Flow_ActivityToOpportunity
- Flow_OpportunityToERP
- Flow_DailyBriefing

Vibe Coding 在生成过程中会主动追问客户专属信息，不预先硬编码。 || Vibe Coding interactively asks for customer-specific values; nothing is hardcoded.

先地基 · 后界面 || Foundation First

### 一次性初始化 || One-Shot Bootstrap

把 Solution、数据表、Connector、Flow 占位一次拉齐，后续四屏 Vibe Coding 直接落到既有结构上，不再重复声明数据模型。 || Bring up the Solution, tables, connectors and flow stubs in one shot so the next four screen prompts plug into a stable foundation instead of redefining the data model each time.

Plan · Bootstrap A

### 数据骨架初始化 || Data Skeleton Init

在 Power Apps vibe 的 Plan 模式下一次性搭好 draft tables + Connection References + Security Roles + Env Vars。 || In Power Apps vibe Plan mode, scaffold draft tables + Connection References + Security Roles + Env Vars in one shot.

A · Power Apps vibe — 数据骨架 || A · Power Apps vibe — data foundation

vibe.powerapps.com → 新建 chat → Plan 模式 || vibe.powerapps.com → new chat → Plan mode

1. 登录 vibe.powerapps.com；在欢迎页选好目标 Environment + Solution（vibe 不再追问这两项）。 || Sign in to vibe.powerapps.com; on the welcome screen pick your target Environment + Solution (vibe will not re-ask).
2. 点 "New" 起一个 chat，确保左下角是 "Plan" 模式（不是 "Build"），把下方提示词整段粘贴进去发送。 || Click "New" to start a chat, make sure the bottom-left toggle says "Plan" (not "Build"), paste the whole prompt below and send.
3. vibe 会一次性问 4 组澄清问题（角色 / 对接系统 / 语言区域 / 语音 LLM）。能填就填，留空走 default。 || vibe asks 4 clarifying groups in one round (roles / external systems / locale / speech & LLM). Answer what you can; leave blanks to use defaults.
4. 它会回一份 Plan：5 张 Dataverse draft tables + Connection References + 3 个 Security Roles + 7 个 Env Vars。检查无误后点 "Generate"。 || It returns a Plan: 5 Dataverse draft tables + Connection References + 3 Security Roles + 7 Env Vars. Review, then click "Generate".
5. 生成完毕 → 当前 plan 内出现 app 壳 + 数据模型 draft + Env Vars。**暂不要 Publish**：Activity / OpportunityWriteQueue 两张表要等 Step B 的 Flow 测试通过后再 Publish，否则 Flow 触发器读不到字段。 || When done, your plan now contains an app shell + draft data model + env vars. **Do NOT Publish yet** — Activity / OpportunityWriteQueue need to wait until Step B's Flows pass smoke tests, otherwise Flow triggers will not see the fields.

```
为 Sales Copilot Mobile 在 Power Apps vibe 中完成"数据骨架"初始化。当前已登录的 vibe 环境（Environment / Region / Solution）由用户在 vibe.powerapps.com 选好，不要再追问。本次只产出：app 壳 + Dataverse draft tables + Connection References + Security Roles + Env Vars；Power Automate Flow 由用户在另一个工作台手动建（已另发提示词），本次不要尝试调用 Power Automate connector 去生成 Flow。

【交互式收集（Plan 模式 · 一轮问完）】
1. 身份与角色：销售一线角色名（默认 SalesRep）、区域负责人角色名（默认 RegionLead）、管理员角色名（默认 Admin）；是否启用行级 owner-based 安全（默认 是）。
2. 对接系统：用户主 ERP / 主 CRM 名称（不预设品牌）、对接方式偏好（HTTP / 自定义 Connector / 已有 OOB Connector）、是否需要写回。
3. 语言与区域：默认 UI 语言（默认 zh-Hans + en-US 双语）、时区、货币。
4. 语音 / LLM：是否使用 Azure Speech（默认 是）、是否使用 Azure OpenAI（默认 是）、模型部署名（用户填，未填则占位 {AOAI_DEPLOYMENT}）。

【Dataverse draft tables】
prefix_ 为新增字段；choice 全部用 Global Choice。
- Account：OOB + prefix_external_id (string, unique)
- Contact：OOB
- Opportunity：OOB + prefix_stage (choice: lead/qualify/propose/won/lost) + prefix_confidence (int 0-100) + prefix_external_id (string)
- Activity (custom)：type (choice: visit/call/email/voice) · draft_status (choice: draft/confirmed/discarded) · raw_voice_url (string) · parsed_json (multiline) · related_account (Lookup→Account) · related_opportunity (Lookup→Opportunity, optional) · owner · created_on · parsed_confidence (int)
- OpportunityWriteQueue (custom)：source_activity (Lookup→Activity) · payload_json (multiline) · target_system (choice，选项 = 用户回答的 ERP/CRM 名) · status (choice: pending/sent/failed) · retry_count (int) · last_error (multiline)
- Briefing (custom)：owner (Lookup→User) · generated_on (date) · payload_json (multiline) · audio_url (string) · last_position (int, 默认 0)
- CopilotConversation (custom)：owner (Lookup→User) · started_on (datetime) · last_active_on (datetime) · messages_json (multiline)

【Connection References（占位，认证留到部署阶段）】
{customer_erp_or_crm} (HTTP + OAuth2 占位) · Azure Speech to Text (Region={customer_speech_region}) · Azure OpenAI (Deployment={AOAI_DEPLOYMENT}) · Office 365 Outlook · Office 365 Users · Microsoft Teams · SharePoint。
禁止把任何客户 URL / 密钥写进生成物 — 一律走 Env Var + Connection Reference。

【Security Roles】
SalesRep：custom 表 owner-based RWA + OOB 表 BU read。
RegionLead：custom 表 BU RW + 可改 owner。
Admin：full。

【Environment Variables（值留空，由部署时填）】
ENV_TIMEZONE · ENV_DEFAULT_LANG · ENV_CUSTOMER_CURRENCY · ENV_CUSTOMER_ERP_NAME · ENV_CUSTOMER_ERP_BASE_URL · ENV_SPEECH_REGION · ENV_AOAI_DEPLOYMENT · ENV_SHAREPOINT_VOICE_PATH · ENV_BRIEFING_CRON。

【交付清单（请明确回报）】
- 7 张 draft tables 列表 + 关键字段 + 关系
- Connection Reference 列表
- 3 个 Security Roles 矩阵
- 9 个 Env Var 列表（值留空）
- 缺失项追问清单

【硬约束】
- 不写死任何客户专属信息（公司名、ERP 品牌、URL、密钥、模型名）— 要么提问，要么落到 Env Var / Connection Reference。
- 所有 choice 字段用 Global Choice，便于跨表 / 跨 Flow 复用。
- 本次不要生成 Power Automate Flow；它们由用户在 make.powerautomate.com 手动建，本提示词只声明 schema 给到下游使用。
```

A · vibe 数据骨架 || A · vibe data foundation

Env Var 收口客户专属信息 || Env Vars hold all customer-specific values

## #stage-03 03 / Refine ×3 :: 角色 · 数据 · 技术栈三轮人审 || Personas · Data · Tech Stack — Three Review Rounds

v0 是 AI 自由发挥的版本，必须经历三轮人审才能进入 Vibe Build。每轮聚焦一个轴——角色 / 数据 / 技术栈——通过 Copilot Edit 通道用自然语言下达修改。 || v0 is the model's free-form draft; three human-led refine rounds must happen before Vibe Build. Each round targets one axis and uses Copilot Edit to issue changes in natural language.

03

阶段 03 · Refine ×3 || Stage 03 · Refine ×3

### 把 v0 plan 收敛到能落到 SAP 共生方案的边界 || Tighten v0 down to the "co-exists with SAP" boundary

一句话：三轮人审——角色 / 数据 / 技术栈——把 v0 收敛到 Phase 1 范围，改写口令走 Copilot Edit。 || In one line: three refine rounds (personas / data / tech) tighten v0 to the Phase 1 boundary, with Copilot Edit issuing changes in natural language.

v0 是 AI 自由发挥的版本，必须经历三轮人审才能进入 Vibe Build。每轮都聚焦一个轴，并通过 Copilot 的 Edit 通道用自然语言下达修改。 || v0 is the model's free-form draft; three human-led refine rounds must happen before Vibe Build. Each round targets one axis and uses Copilot's Edit channel to issue changes in natural language.

执行清单 || Checklist

- Round 1 · 角色：补一线销售 / 区域经理 / 产品经理，删除无关角色 || Round 1 · Personas: add field rep / regional mgr / product mgr; remove unrelated
- Round 2 · 数据：Data Agent 将自定义表与 ERP Virtual Table 字段对齐 || Round 2 · Data: align custom tables to ERP Virtual Table fields
- Round 3 · 技术栈：保留 Canvas + Agent + Flow；裁剪 Power Pages / Model-driven || Round 3 · Tech: keep Canvas + Agent + Flow; cut Power Pages / Model-driven
- 每轮通过 Copilot Edit 用自然语言下达修改 || Issue changes via Copilot Edit in natural language per round
- 产出：锁定的 Data Model（与 ERP 字段 1:1 映射） || Output: locked data model (1:1 mapped to ERP fields)
- 产出：Phase 1 技术清单 + ADR（含裁剪理由） || Output: Phase 1 tech list + ADR (with cut rationale)
- 门禁：三轮人审全部签字 + ADR 提交后方可进入阶段 04 || Gate: all 3 review rounds signed off + ADR committed before Stage 04

**查看深入：Copilot Edit 改写示例 · 人审检查表 || Deep dive: Copilot Edit Examples · Refine Checklist**

**Copilot Edit 改写示例（自然语言） || Copilot Edit Examples (natural language)**

- «把 Manager 角色拆成 Regional Manager 与 Product Manager；后者只看本产品线商机»
- «mr_visit 加字段 visit_voice_blob (File)、ai_confidence (Decimal 0-1)»
- «去掉 Power Pages，所有外部访问走移动 Canvas + 公网 Copilot Studio Agent»

**人审检查表（每轮必过） || Refine Checklist (per round)**

- 是否仍能用 SAP Virtual Tables 直读，不引入双写？ || Can it still read via SAP Virtual Tables without dual-write?
- 是否所有写操作都走 Service Bus 异步落 SAP？ || Do all writes flow through Service Bus to SAP asynchronously?
- 是否每个 Agent 的 prompt < 800 token、可审计？ || Is every agent prompt < 800 tokens and auditable?

## #stage-04 04 / Canvas App :: 五屏 Vibe Coding 提示词 || Five-Screen Vibe Coding Prompts

基于阶段 02 Bootstrap 创建的数据骨架，逐屏粘贴五屏 Canvas App 提示词即可生成可演示原型。所有提示词共享同一套设计令牌（橙 #FF7A00、青 #0D8F8C、深底渐变），保证生成结果跨页一致；SAP / 性能 / 安全敏感处留给 Pro-Code。 || Building on the data skeleton created in Stage 02 Bootstrap, five copy-paste Canvas App screen prompts generate a demo-ready prototype. All prompts share the same design tokens (orange #FF7A00, teal #0D8F8C, dark gradient) for cross-screen consistency; SAP / perf / security-sensitive parts go to pro-code.

04

阶段 04 · Vibe Build || Stage 04 · Vibe Build

### 五屏提示词生成可演示原型 || Five screen prompts produce a demo-ready prototype

一句话：基于阶段 02 的数据骨架，逐屏粘贴五屏 Vibe Coding 提示词生成可演示 Canvas App；SAP / 性能 / 安全敏感处留给 Pro-Code。 || In one line: build on Stage 02's data skeleton, paste five Vibe Coding screen prompts to generate a demo-ready Canvas App; SAP / perf / security-sensitive parts go to pro-code.

五屏 Canvas App 的 Vibe Coding 提示词工程先明确 Vibe ↔ Pro-Code 的二级开发边界，随后依次给出五屏提示词。 || The Vibe Coding prompt engineering for the five Canvas App screens defines the two-tier Vibe vs Pro-Code boundary first, followed by all five screen prompts.

执行清单 || Checklist

- 确认阶段 02 Bootstrap 已完成（Solution / Tables / Refs 就绪） || Confirm Stage 02 Bootstrap done (Solution / Tables / Refs ready)
- 逐屏粘贴五屏提示词，每屏生成后立即 Preview || Paste each of the 5 screen prompts; preview immediately after each
- 发现幻觉（错误绑定 / 缺字段）立刻 Edit 重生成 || On hallucination (wrong binding / missing field), re-issue Edit immediately
- SAP API / 性能敏感视图 / 自定义控件标记为 pro-code 任务 || Mark SAP API / perf views / custom controls as pro-code tasks
- 产出：可演示的 Canvas App 5 屏 || Output: demo-able Canvas App with 5 screens
- 产出：提示词清单（带版本号）+ Edit 历史 || Output: versioned prompt list + Edit history
- 门禁：5 屏均可在手机预览跑通端到端流程 → 进入阶段 05 || Gate: all 5 screens pass end-to-end on mobile preview → enter Stage 05

**查看深入：Vibe ↔ Pro-Code 边界二级开发模型 || Deep dive: Vibe ↔ Pro-Code Boundary (Two-Tier Model)**

**二级开发模型：Vibe ↔ Pro-Code 边界 || Two-Tier Model: Vibe ↔ Pro-Code Boundary**

**走 Vibe Coding || Goes through Vibe Coding**

界面布局、CRUD 表单、客户画像聚合、Agent prompt 与对话脚本、低复杂度 Flow（条件 + 通知）。 || UI layouts, CRUD forms, customer profile aggregation, agent prompts and dialog scripts, low-complexity flows (conditions + notifications).

**走 Pro-Code || Goes through Pro-Code**

SAP Commerce 同步逻辑、跨境延迟优化、自定义可视化（如时间线）、安全审计 Plug-in、合规审计字段计算。 || SAP Commerce sync logic, cross-border latency tuning, custom visuals (e.g. timeline), security-audit plug-ins, compliance field computations.

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

开机即得"今日大盘"：身份 + 4 张 KPI + AI 生成的今日摘要 + 三个语音/拜访/Copilot 快捷入口，承接 Maria 通勤途中的"主动播报"场景。 || On launch the rep sees today's pulse: identity + 4 KPIs + an AI-generated daily briefing + three quick entries for voice / new visit / Copilot — the visual home of Maria's morning commute briefing.

Vibe Coding · Screen 0

### HomeDashboard（首页大盘） || HomeDashboard (Today at a Glance)

在已建好的 plan 内追加一屏，作为 App 启动后的默认页面：身份 + KPI + 今日播报入口 + 快捷动作。所有 KPI 实时从 Bootstrap 创建的 Dataverse 表读取，不在 UI 里硬编码示例数字。 || Add the rep launch screen to the existing plan as the default route: identity + KPI + Brief Me entry + quick actions. All KPIs read live from the Dataverse tables created in Bootstrap — never hardcode sample numbers in the UI.

```
在 Power Apps vibe 中向当前 app 追加一屏 HomeDashboard，作为 App 的默认路由（/home）。Mobile 预览尺寸 9:19 竖屏。

【顶部栏】
左 ≡（点击展开侧栏导航），居中标题"主页"，右 ⚙（跳转 Settings 屏）。

【布局自上而下】
1. 问候头：左 34px 圆形渐变头像（取 power.user().fullName 首字母）+ 右两行文字：第一行"早上好"（按当前时区切换 早上好 / 下午好 / 晚上好），第二行用户全名。
2. KPI 网格：2×2 卡片，20px 圆角，深色玻璃背景，内距 12-14。四张卡：
   · 今日拜访：当日 owner = 当前用户的 Activity 行数；副文案"X 已确认 · Y 待出发"，按 draft_status 分桶。
   · 活跃商机：当前用户拥有的 Opportunity 行数（prefix_stage NOT IN won/lost）；副文案"Z 风险 · 需关注"，Z = prefix_confidence < 50 的行数。
   · 本月业绩：当月 won 单的 totalamount 求和 / 当前用户配额 ×100%；副文案"↑/↓ N% vs 上月"。
   · 待回访客户：当前用户拥有的 Account 行数中 lastcontactedon < 14 天前；副文案"按距离排序"。
3. 今日播报卡：brand orange 12px 圆角，左大字"今日播报 · 6 章节 · 2 分 40 秒"，右白色圆形播放按钮。点击 → 跳 BriefMe 屏。
4. 快捷操作 chip 行：4 个等宽圆角按钮——
   · "新拜访" → 跳 ActivityCapture 屏，先建一行 Activity (type=visit, draft_status=draft)。
   · "提问 Copilot" → 跳 CopilotChat 屏。
   · "看商机" → 跳 OpportunityDraftReview 屏。
   · "扫名片" → 暂占位，弹"功能即将上线" toast。
5. 摘要行：单行 9.5pt 灰字"今天有 N 个回访，M 个商机本周收尾"，N/M 实时计算。

【数据绑定】
全部数据来自 Bootstrap 建立的 Account / Opportunity / Activity / Contact 四张表，按当前用户 owner 过滤。空数据时所有 KPI 显示"—"。

【交互】
- 下拉刷新触发整页重查。
- 右下浮动 Copilot mic：56px 圆形 brand orange，按下 ≥ 300 ms 录音并跳 CopilotChat。
- 离线：顶部插一条琥珀色横条"离线 · 显示最近一次缓存"。

【设计约束】
- 复用 plan 中已有的 brand orange (#FF7A00)、深色玻璃背景、Fluent UI v9 控件。
- 双语 zh-Hans / en-US，按 power.user().lang 渲染。
- 字号阶梯遵循 plan theme tokens（headline 18 / body 13 / caption 9.5）。
```

交互 · 下拉刷新 + 浮动 Copilot mic || Interactions · pull-to-refresh + floating Copilot mic

数据 · Account / Opportunity / Activity || Data · Account / Opportunity / Activity

云流 · 仅 Brief Me 卡片用 BriefMe || Cloud Flow · only Brief Me card calls BriefMe

路由 · /home（默认） || Route · /home (default)

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

Vibe Coding · Screen 0B

### BriefMe（今日主动播报） || BriefMe (Proactive Daily Briefing)

从 HomeDashboard 的"今日播报"卡进入：整屏一张 BriefCard 占满可用高度，卡顶承担"标题 + 关键证据"、卡底钉住播放控件；章节切换的 dots / swipe 提示在卡外；底部复用共享 mic 行让用户按住对当前章节追问。所有播报内容由后端 agent 生成，不在 UI 硬编码。 || Entered from HomeDashboard's Brief Me card: a single BriefCard fills the available height — top carries headline + supporting evidence, bottom pins the audio player; chapter dots + swipe hint sit outside the card; the bottom mic row is reused so the rep can press-and-hold to ask about the current chapter. All briefing copy comes from the backend agent — never hardcoded.

```
在 Power Apps vibe 中向当前 app 追加一屏 BriefMe，由 HomeDashboard 的"今日播报"卡唤起，路由 /brief。Mobile 预览 9:19 竖屏。

【数据】
读 Bootstrap 中创建的 Briefing 表（owner / generated_on / payload_json / audio_url / last_position）。打开屏时按"owner = 当前用户 AND generated_on = 今天"取一行；若不存在或离上次生成 > 5 分钟，调用云流 BriefMe(userId, date) 重算并写回。payload_json 解出 items[≤6]，每个 item:
{ id, priority: focus|opp|risk|warn|info,
  pos: { index, total }, time_range: { start_ms, end_ms },
  headline: { zh, en }, summary: { zh, en }, context: { zh, en },
  bullets: [ { zh, en } ],            // ≤ 2
  metrics: [ { label, dir: up|down|flat } ],  // ≤ 4
  cta: { label: { zh, en }, action } }
长度：headline ≤ 18 zh / 50 en · summary ≤ 60 zh / 140 en · bullet ≤ 22 zh / 60 en · context = 1 行。

【顶部栏】共享 PhoneHeader：← / 居中"今日播报 · 6 章节 2 分 40 秒" / 右"文"（转写抽屉）。

【BriefCard（flex: 1，列布局）】
- 头部：priority pill（取 --prio 颜色）+ 等宽数字 "03 / 06 · 00:48–01:25"。
- 11.5pt headline · 10.5pt summary · ≤ 2 条 bullet（priority 色圆点 + 9.5pt）。
- ≤ 4 个 metric chip（up=青 / down=红 / flat=灰白）。
- 9.5pt context 行，行首 ↳；之后是左对齐橙色 CTA 按钮。
- 卡底播放区（margin-top:auto 钉住）：1px 顶分隔 + 20 根波形条 + 30px 圆形 ▶/❚❚ + 等宽数字 "01:08 / 02:40" + 1.0×/1.25×/1.5×/2.0× 速度 pill。
- 5 种 priority 共用同一形态，仅 --prio 与一层淡渐变背景不同。

【卡外】StageDots：6 个章节圆点，当前为胶囊高亮，点击跳章。SwipeHint：9pt 灰字"左右滑动 · 切换章节"。

【底部】共享 PhoneMicRow：48px 跳动橙圆按钮 + "按住对这条提问"。最底部 110×4 home 指示条。

【行为】
- 进屏自动播放。audio.timeupdate 跨入下一 time_range 时 BriefCard 横向滑入下一 item（transform translate3d, 300 ms ease）。
- 手动 swipe / 点 dot 暂停跟读 30 秒；30 秒静止 OR 滑回当前章节恢复跟读；双击当前卡立即恢复。
- 速度按钮循环 1.0× → 1.25× → 1.5× → 2.0× → 1.0×；存到 localStorage briefMeRate。
- "文"按钮 → 全屏 Drawer 列出 transcript_segments，当前段高亮，点段跳音频。
- 离开屏 → 暂停音频，把 currentTime 写回 Briefing.last_position。
- mic 按住 ≥ 300 ms 开始录音；松开把音频 blob + 当前 BriefItem.id + 当前转写片段传给 CopilotChat（route /copilot）作为 system context。按住时右滑 ≥ 80 px 取消并提示"松开取消"。

【手势 / 无障碍】
- 横向 swipe：|Δx| ≥ 60 px 且 ≥ 1.5×|Δy| → 切章；否则按滚动处理。
- BriefCard role="article" aria-roledescription="briefing chapter"；StageDots role="tablist"，dot role="tab"；方向键也能切章。
- mic 双语 aria-label；按住时 aria-live="polite" 报"录音中，松开发送"。

【约束】
- headline / summary / bullets / metrics / cta / 答复全部来自云流，UI 严禁硬编码业务文案。
- 颜色 / 圆角 / 字号走 plan theme tokens；priority 颜色走 --prio CSS 变量。
- 双语 { zh, en }，由 power.user().lang 决定渲染；切语言不重新合成音频。
- 离线：渲染 Briefing 表中昨天那一行；mic 灰化并提示"离线无法提问"。
- 章节切换只用 transform，不引发整页 reflow；Drawer 走 portal。
```

交互 · 自动跟读 / 章节滑动 / 长按追问 || Interactions · auto-follow / swipe chapters / hold to ask

数据 · Briefing 表（来自 Flow_DailyBriefing） || Data · Briefing table (from Flow_DailyBriefing)

云流 · BriefMe（按需重算）+ AskAboutBrief（追问） || Cloud Flows · BriefMe (on-demand) + AskAboutBrief

路由 · /brief（HomeDashboard 唤起） || Route · /brief (from HomeDashboard)

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

Vibe Coding · Screen 1

### ActivityCapture（活动录入） || ActivityCapture (Voice → Draft)

一屏：录音 → AI 草稿 → 三按钮确认。在用户点 Confirm 之前不写 Dataverse；草稿状态由 Activity 表的 draft_status 字段承担。 || One screen: record → AI draft → three-button confirm. No write to Dataverse until the user taps Confirm; draft state lives on Activity.draft_status.

```
在 Power Apps vibe 中向当前 app 追加一屏 ActivityCapture，路由 /activity/:accountId。Mobile 预览 9:19 竖屏。

【顶部栏】
左 ←（返回上屏），居中标题"新拜访 · {Account.Name}"（按 :accountId 查 Account 表），右 ⋯。

【布局自上而下】
1. 语音气泡：3px 橙色左竖条 + rgba(255,122,0,0.08) 浅橙背景，padding 12-14；内部等宽字体显示实时转写文本，未开始录音时占位"按住下方按钮开始录音"。录音中右上角显示 spinner 和已录时长（00:08）。
2. 录音按钮：80px 圆形 brand orange，正中麦克风图标。按住开始录，松开停止；按住时按钮放大 1.05× 并外发橙色光环。最长 60 秒，临到 5 秒时按钮内圈红光提示。
3. AI 草稿卡：录音停止后出现，标题"AI 草稿"+ 右上 ConfidenceBar（绿 ≥ 80 / 琥珀 50–79 / 红 < 50，宽 60px）。卡内 6 行字段：客户 / 联系人 / 拜访日期 / 结果 / 下一步 / 商机意向；每行右侧带铅笔图标可内联编辑。等待转写时所有字段显示骨架占位。
4. 三按钮行：左"放弃"（文字按钮，灰）、中"重录"（描边按钮）、右"确认"（橙色实心按钮）。

【数据流】
- 按住录音 → 把音频 blob 上传到 SharePoint /SalesVoiceUploads/{userId}/{guid}.webm。
- 上传成功触发 Bootstrap 中的 Flow_VoiceToActivity：Speech 转写 → AOAI 抽取结构 → 在 Activity 表写一行 (draft_status=draft, related_account=:accountId, parsed_json, parsed_confidence)，返回 row id。
- 屏幕轮询 Activity 表中该 row（每 1.2 秒一次，最长 30 秒）；拿到 parsed_json 后填入草稿卡。
- 用户点"确认"→ Patch 该 row：draft_status=confirmed，并跳 OpportunityDraftReview 屏（带 activityId 参数）。
- 点"放弃"→ Patch row 为 draft_status=discarded，回首页。
- 点"重录"→ 不动 Activity 行，清空草稿卡，重置语音气泡。

【约束】
- 在用户点"确认"前，Activity 表里的行始终是 draft，不会被任何下游 Flow 消费。
- 字段文案 / 占位 / 错误提示双语 zh/en，按 power.user().lang 渲染。
- 颜色 / 圆角 / 字号全部走 plan theme tokens；ConfidenceBar 控件后续在 OpportunityDraftReview 复用。
- 离线：录音按钮灰化 + 顶部琥珀横条"离线 · 录音将在恢复网络后上传"，本地用 IndexedDB 暂存音频，上线后自动续传。
```

路由 · /activity/:accountId || Route · /activity/:accountId

数据 · Activity 表（draft → confirmed → discarded） || Data · Activity table (draft → confirmed → discarded)

云流 · Flow_VoiceToActivity（SharePoint 文件触发） || Cloud Flow · Flow_VoiceToActivity (SharePoint file trigger)

复用 · ConfidenceBar 控件 || Reuse · ConfidenceBar control

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

Vibe Coding · Screen 2

### CopilotChat（客户信息查询） || CopilotChat (Multi-Agent Conversation)

一屏：单列对话流；每条 agent 回复必须带 agent 名 + 来源行；不能把多 agent 答复合并成一段散文。 || One screen: single-column chat; every agent reply must carry an agent name + a source line — never merge multi-agent replies into one paragraph.

```
在 Power Apps vibe 中向当前 app 追加一屏 CopilotChat，路由 /copilot。可由 HomeDashboard 浮动 mic 或 BriefMe 长按 mic 唤起。Mobile 预览 9:19 竖屏。

【顶部栏】
左 ←（返回），居中标题"Ask Copilot"，右 ⋯（清空对话 / 新建会话）。

【主体】
单列对话流，从下往上累加（最新消息在底部，自动滚到底）。message 数据形如 { id, type, role, content, agent?, sources?[], stage_card? }，type 三种：
1. type="user"：右对齐，brand orange 描边气泡（与 ActivityCapture 引用样式一致），白底深字。如果消息附带音频（来自 BriefMe / 浮动 mic），气泡上方显示一个迷你音频条 + 时长。
2. type="agent"：左对齐白字，气泡上方一颗 agent 名 pill（如"客户画像 Agent"、"商机评估 Agent"、"订单查询 Agent"，每个 agent 有固定颜色），气泡下方 9.5pt 灰字"来源"行：列出 1-N 条引用 chip（如"Account #12345 · 最近 30 天 Activity 4 条"），点击 chip 弹 Drawer 显示该行原始数据。
3. type="stage-card"：特殊白色卡片，用于展示某个 Opportunity 的 pipeline 进度条（5 段 stage + 当前置信度），点击跳 OpportunityDraftReview。

【底部输入】
固定底部一行 56px 高条：左 mic 圆按钮（按住 ≥ 300 ms 录音，松开自动转写并以 user 消息发出）、中文本输入框、右 send 圆按钮（橙）。键盘弹起时整条上抬。

【数据流】
- 每发一条 user 消息，调用云流 AskCopilot(message, conversation_id, attached_audio?)，云流内部按 message intent 调度多 agent，返回 { agent_chain: [{ agent_name, content, sources[] }], stage_cards?: [...] }。
- agent_chain 每一项渲染成一条独立 type="agent" 消息（不要合成一段）。stage_cards 渲染为 type="stage-card" 消息插在末尾。
- 整段对话持久化到 Dataverse 表 CopilotConversation（如未在 Bootstrap 中创建则自动追加：id / owner / started_on / messages_json / last_active_on）。
- 流式打字效果：agent 消息 token 从云流流式返回，前端按字符逐个显示，光标常驻末尾。

【交互】
- 来源 chip 点击 → 全屏 Drawer 显示原始 Account / Opportunity / Activity 行；Drawer 顶部带"在 OpportunityDraftReview 中打开"按钮。
- 长按某条 agent 消息 → 出现菜单"复制 / 转发到 Teams / 反馈不准"。
- 顶部 ⋯ → "清空当前会话"会把 CopilotConversation 当前行 messages_json 清空但保留 id；"新建会话"会插入新 id。

【约束】
- 不允许把多 agent 答复合并成一段散文——必须按 agent_chain 一条一条渲染。
- 所有文案双语 zh/en，按 power.user().lang 渲染；agent 名称从云流返回，UI 不写死中文/英文映射。
- 颜色 / 圆角 / 字号全部走 plan theme tokens；user 气泡复用 ActivityCapture 的引用样式。
- 离线：mic 灰化 + 顶部琥珀横条"离线 · 仅可查看历史对话"；输入框禁用。
```

路由 · /copilot || Route · /copilot

数据 · CopilotConversation 表 + 引用 Account / Opportunity || Data · CopilotConversation table + refs to Account / Opportunity

云流 · AskCopilot（多 agent 编排） || Cloud Flow · AskCopilot (multi-agent orchestration)

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

Vibe Coding · Screen 3

### OpportunityDraftReview（商机创建） || OpportunityDraftReview (Confirm Before Write)

一屏：把 AI 生成的商机草稿做"字段级可改 + 来源可追 + 异步写回 ERP"的确认流。提交即入队，写回 ERP 由 Flow_OpportunityToERP 异步完成，UI 不阻塞。 || One screen: turn the AI-generated opportunity draft into a field-editable + source-traceable + async ERP write-back confirmation flow. Tap Submit and the row is enqueued; Flow_OpportunityToERP handles ERP write-back asynchronously — the UI never blocks.

```
在 Power Apps vibe 中向当前 app 追加一屏 OpportunityDraftReview，路由 /opp-draft/:activityId，由 ActivityCapture 点"确认"后跳入。Mobile 预览 9:19 竖屏。

【顶部栏】
左 ←（返回 ActivityCapture，不丢草稿），居中标题"商机草稿"，右 ⋯（"重新让 AI 生成 / 拒绝草稿"）。

【三张卡片自上而下】
1. 状态卡：标题"AI 生成"+ 右上"待确认"badge（rgba(96,165,250,0.18) 底 / #93C5FD 字）。卡内一行小字"由 Activity #{activityId} 自动生成"+ ConfidenceBar（复用 ActivityCapture 控件，宽 80px，绿/琥珀/红 同阈值）。

2. 字段编辑卡：6 行 EditableRow，每行 = label + AI 建议值 + 右侧铅笔图标。行字段：
   · 客户 → Account 选择器（默认填 Activity.related_account）
   · 阶段 → prefix_stage choice（默认按 AI 建议）
   · 金额 → 货币输入（默认 AI 建议金额，币种取 Bootstrap ENV_CUSTOMER_CURRENCY）
   · 预计成交日 → 日期选择
   · 下一步动作 → 单行文本
   · Owner → 默认当前用户，可改为同 Business Unit 内成员
   每行点铅笔进入内联编辑，编辑过的行右侧显示一颗橙点；底部出现一行 9.5pt 灰字"已修改 N 个字段，原 AI 值保留为 tooltip"。

3. 来源卡：标题"来源追溯"，下方为来源 chip 列表，每条来自 Activity.parsed_json 的 sources[]：如"录音 00:42 提到金额 ¥620 万"、"客户邮件 2025-04-18"、"上次拜访 2025-04-12"。点 chip 弹 Drawer 显示原始片段（音频带高亮区段、邮件全文等）。

【底部动作条】
固定底部 64px 条：左"放弃"（文字按钮，灰，把 Activity.draft_status 改回 draft）、右"提交"（大号橙色实心按钮，宽占 70%）。

【数据流】
- 进屏：按 :activityId 读 Activity 行；调用云流 Flow_ActivityToOpportunity（如该 activity 已有对应草稿则直接返回，否则现场生成），返回 { opportunity_draft, sources }。
- "提交"：在 OpportunityWriteQueue 表插一行（source_activity=:activityId, payload_json=最终字段值, target_system=ENV_CUSTOMER_ERP_NAME, status=pending, retry_count=0）；同时 Patch Activity 行附加 confirmed_opportunity_id=插入的 queue id。
- 写回 ERP 由 Bootstrap 中的 Flow_OpportunityToERP 异步消费 OppWriteQueue（status=pending），UI 不阻塞。
- 提交成功后：弹 Toast"已入队，ERP 写回中"，回到 HomeDashboard，并在 Home 顶部插一条 9.5pt 灰条"商机已提交 · 状态：写回中 / 成功 / 失败（点击查看）"，3 秒后自动收起。
- 写回失败由 Flow 把 OppWriteQueue 行 status=failed 并填 last_error；当用户回 Home 时如有 failed 行，Home 顶条显示红色"商机写回失败 · 点击重试"。

【约束】
- 在用户点"提交"前，OpportunityWriteQueue 不会有任何行；单纯打开本屏不产生写操作。
- 字段标签 / 占位 / 错误提示双语 zh/en，按 power.user().lang 渲染。
- 颜色 / 圆角 / 字号 / ConfidenceBar 全部走 plan theme tokens 与已有控件，不再造一份。
```

路由 · /opp-draft/:activityId || Route · /opp-draft/:activityId

数据 · Activity / Opportunity / OpportunityWriteQueue || Data · Activity / Opportunity / OpportunityWriteQueue

云流 · Flow_ActivityToOpportunity + Flow_OpportunityToERP（异步） || Cloud Flows · Flow_ActivityToOpportunity + Flow_OpportunityToERP (async)

:::callout { title: "三个原型共同呈现的设计取舍 || Trade-offs Embodied by All Three Prototypes" }
① 主动作永远是橙色麦克风，键盘是隐藏的 fallback；② 任何 AI 输出必须带"AI 草稿"标签和置信度，写入前一律可编辑；③ Agent 名字明示在回答上方，让用户对"是谁在回答我"有感知，便于后续追溯与调优。 || (1) The primary action is always the orange mic; the keyboard is the hidden fallback. (2) Every AI output bears an "AI Draft" tag and confidence score, and must be editable before write. (3) The agent's name is shown above its reply, so the user knows who answered — enabling traceability and tuning.
:::

## #stage-05 05 / Automation :: Power Automate Flow + Copilot Studio Agent || Power Automate Flows + Copilot Studio Agent

Canvas App 负责界面，数据流转和智能对话则需要后台支撑：自动化编排包含 4 个 Power Automate Cloud Flow 的 Copilot describe-to-design 提示词（语音转活动 / 活动转商机 / 商机写回 ERP / 每日播报），以及 1 个 Copilot Studio Agent 的配置指引。所有 Flow 都依赖阶段 02 Bootstrap 创建的 Dataverse 表和 Connection Reference。 || Canvas App handles the UI, while data pipelines and intelligent conversations run on backend automation: Copilot describe-to-design prompts for 4 Power Automate Cloud Flows (voice-to-activity / activity-to-opportunity / opportunity-to-ERP / daily briefing), plus 1 Copilot Studio Agent setup guide. All flows depend on the Dataverse tables and Connection References created in Stage 02 Bootstrap.

Describe-to-Design

### 4 个 Cloud Flow || 4 Cloud Flows

在 Power Automate Copilot 面板粘贴对应提示词，Copilot 自动搭出 trigger + action 链。所有客户专属值从 Env Var 取，不硬编码。 || Paste each prompt into the Power Automate Copilot panel; Copilot auto-builds the trigger + action chain. All customer-specific values come from Env Vars, never hardcoded.

Describe-to-Design · Flows

### Power Automate 4 Flow || Power Automate 4 Flows

每个 Flow 在 make.powerautomate.com 的同一个 Solution 里新建，类型按指定选。进入设计器后把对应段粘到 Copilot 面板。所有 Env Var 沿用阶段 02 Bootstrap 生成的 9 个。 || Create each flow in make.powerautomate.com inside the same Solution, picking the type shown. In the designer, paste the matching section into the Copilot panel. All env vars reuse the 9 created by the Stage 02 Bootstrap.

Copilot Studio

### 销售助手 Agent || Sales Assistant Agent

在 Copilot Studio 中创建一个面向一线销售的对话式 Agent，支持语音/文字输入，可调用 Dataverse 查询客户信息、活动记录和商机状态，并支持自然语言下达拜访记录和商机创建指令。 || Create a conversational agent in Copilot Studio for field reps, supporting voice/text input, querying Dataverse for customer info, activities and opportunity status, and accepting natural-language commands to log visits and create opportunities.

Copilot Studio · Agent

### Sales Assistant Agent 配置 || Sales Assistant Agent Setup

在 copilotstudio.microsoft.com 创建新 Agent，选择同一个 Solution，把下方描述粘贴到 Agent 的 Instructions 面板。 || In copilotstudio.microsoft.com create a new Agent in the same Solution, paste the description below into the Agent Instructions panel.

Copilot Studio → 新建 Agent || Copilot Studio → New Agent

copilotstudio.microsoft.com → 同 Solution → 新建 Agent || copilotstudio.microsoft.com → same Solution → New Agent

1. 打开 copilotstudio.microsoft.com，在左侧 Solutions 里选阶段 02 Bootstrap 用的同一个 Solution。 || Open copilotstudio.microsoft.com, select the same Solution used in Stage 02 Bootstrap.
2. 点 "+ New agent"，命名 SalesCopilotAgent，语言选 zh-Hans + en-US。 || Click "+ New agent", name it SalesCopilotAgent, language zh-Hans + en-US.
3. 把下方 Instructions 提示词粘贴到 Agent 的 Instructions 面板，点 Save。 || Paste the Instructions prompt below into the Agent Instructions panel, click Save.
4. 在 Knowledge 面板添加 Dataverse 数据源：Account / Contact / Opportunity / Activity 四张表。 || In the Knowledge panel, add Dataverse sources: Account / Contact / Opportunity / Activity tables.
5. 在 Actions 面板启用 "Dataverse (dynamic)" connector，绑定 Bootstrap 的 Connection Reference。 || In the Actions panel, enable the "Dataverse (dynamic)" connector and bind the Bootstrap Connection Reference.
6. Test → 发送 "帮我查一下 Hospital Alpha 的商机" → Agent 应返回结构化商机列表。 || Test → send "Show me Hospital Alpha opportunities" → Agent should return a structured opportunity list.

```
你是 Sales Copilot Agent，一个面向一线销售的移动端智能助手。你的职责是帮助销售高效完成日常工作，包括：

【身份与语气】
- 你是一线销售的贴身助理，语气简洁专业，回复控制在 3 句以内。
- 默认用中文回复；用户切换到英文时跟随切换。
- 不确定的信息明确标注"AI 推测"，不编造数据。

【核心能力】
1. 客户查询：根据客户名称或关键词查询 Account / Contact 表，返回客户概要（最近拜访、活跃商机数、联系人）。
2. 商机查询：查询 Opportunity 表，按 stage / confidence / owner 过滤，返回商机列表或单个商机详情。
3. 活动记录：用户语音或文字描述拜访内容 → 你提取结构化字段（客户名、联系人、结果、下一步）→ 创建 Activity 行（draft_status=draft）→ 让用户确认后改为 confirmed。
4. 商机创建：用户描述潜在商机 → 你提取字段（客户、阶段、预估金额、预计关闭日期）→ 创建 Opportunity 行（prefix_stage=lead）→ 让用户确认。
5. 今日摘要：查询用户今日的 Activity + 即将到期的 Opportunity，生成 3-5 条摘要。

【数据访问规则】
- 只访问当前用户 owner 的数据，除非用户是 RegionLead（可看 BU 范围）或 Admin（全部）。
- 所有写操作先生成草稿（draft_status=draft），用户确认后再改为 confirmed。
- 不直接调用 ERP；商机写回走 OpportunityWriteQueue（由 Flow_OpportunityToERP 异步处理）。

【硬约束】
- 不返回超过 10 条记录，超过时提示用户缩小范围。
- 所有金额显示用户配置的货币格式（ENV_CUSTOMER_CURRENCY）。
- 不暴露内部表名或字段名给用户，用业务语言描述。
```

Copilot Studio Agent

Knowledge 绑 4 张 Dataverse 表 || Knowledge binds 4 Dataverse tables

Actions 启用 Dataverse connector || Actions enable Dataverse connector

## #stage-06 06 / Solution-ize + Source Control :: Solution 导出、Git 解包与 CI 构建 || Solution Export, Git Unpack & CI Build

按 Microsoft ALM 官方建议：unmanaged Solution 属于开发态，必须导出并解包到 Git；环境之间只用 managed Solution 传递。这一步将原型阶段的快速迭代收归标准工程变更管理。 || Per Microsoft ALM guidance: unmanaged solutions are dev-time and must be exported and unpacked into Git; only managed solutions move between environments. This stage brings rapid prototype iteration under disciplined engineering change control.

06

阶段 06 · Solution-ize || Stage 06 · Solution-ize

### Dataverse 不是 source of truth，Git 才是 || Dataverse is not the source of truth — Git is

一句话：unmanaged Solution → SolutionPackager 解包到 Git → CI 重新打出 managed 包，环境之间只走 managed。 || In one line: unmanaged solution → SolutionPackager unpacks into Git → CI re-packs into managed; only managed solutions move between environments.

按 Microsoft ALM 官方建议：unmanaged Solution 属于开发态，必须导出并解包到 Git；任何环境之间的传递只用 managed Solution。这一步将原型阶段的快速迭代收归标准工程变更管理。 || Per Microsoft ALM guidance: unmanaged solutions are dev-time and must be exported and unpacked into Git; only managed solutions move between environments. This stage brings rapid prototype iteration under disciplined engineering change control.

执行清单 || Checklist

- 从 Dev 导出 unmanaged Solution → SolutionPackager Extract 解包 || Export unmanaged from Dev → SolutionPackager Extract
- 解包结果提交到 Git，PR 评审 + 自动 Lint || Commit unpacked XML/JSON to Git, PR review + lint
- CI 用 SolutionPackager Pack 打回 managed Solution || CI re-packs managed solution via SolutionPackager Pack
- prompts/ 目录版本管理所有提示词与 Bootstrap 脚本 || Version-control all prompts and Bootstrap scripts under prompts/
- 产出：Repo 结构 solutions/ · prompts/ · pipelines/ · docs/ || Output: repo layout solutions/ · prompts/ · pipelines/ · docs/
- 产出：每日构建 managed.zip || Output: daily managed.zip build artifact
- 门禁：managed Solution 可在 Test 环境成功导入 → 进入阶段 07 || Gate: managed solution imports successfully in Test → enter Stage 07

**查看深入：Repo 目录骨架 · Solution 生命周期动作 || Deep dive: Repo Skeleton · Solution Lifecycle Verbs**

**Repo 目录骨架 || Repo Skeleton**

```
agentic-sales-mobile/
├─ solutions/
│  └─ AgenticSalesMobile/   ← unpacked unmanaged
├─ prompts/
│  ├─ bootstrap.md
│  └─ screens/
│     ├─ home-dashboard.md
│     ├─ brief-me.md
│     ├─ activity-capture.md
│     └─ customer-inquiry.md
├─ pipelines/
│  ├─ pp-build.yml
│  └─ pp-release.yml
└─ docs/  ← ADR, env handbook
```

**Solution 生命周期动作 || Solution Lifecycle Verbs**

- **Create** · Dev 内创作 unmanaged
- **Update** · 增量 metadata，不删组件
- **Patch** · hotfix，叠在父 Solution 上
- **Upgrade** · minor release，移除已退役组件

## #stage-07 07 / Promote & Operate :: Pipeline 发布与运维监控 || Pipeline Promotion & Operational Monitoring

Phase 1 用 in-product Pipelines 求快；Phase 2 接 Azure DevOps，与客户已有 SAP DevOps 流程对齐。每次上线必须有可衡量成功条件与回退脚本。 || Phase 1 uses in-product pipelines for speed; Phase 2 connects to Azure DevOps to align with the customer's existing SAP DevOps cadence. Every release ships with measurable success criteria and a rollback script.

07

阶段 07 · Promote & Operate || Stage 07 · Promote & Operate

### Pipeline 把 managed Solution 推到生产，App Insights 闭环监控 || Pipelines push managed solutions to prod; App Insights closes the loop

一句话：Phase 1 走 in-product Pipelines 求快，Phase 2 接 Azure DevOps 与 SAP DevOps 对齐；App Insights + prompt diff 闭环运维。 || In one line: Phase 1 uses in-product pipelines for speed; Phase 2 connects to Azure DevOps to align with SAP DevOps; App Insights + prompt diffs close the operational loop.

Phase 1 用 in-product Pipelines 求快；Phase 2 接 Azure DevOps 与客户已有 SAP DevOps 流程对齐。所有上线必须有可衡量的成功条件与回退脚本。 || Phase 1 uses in-product pipelines for speed; Phase 2 connects to Azure DevOps to align with the customer's existing SAP DevOps cadence. Every release ships with measurable success criteria and a rollback script.

执行清单 || Checklist

- 配置 Pipeline：Dev → Test 自动、Test → UAT 一键、UAT → Prod 4-eyes || Configure pipeline: Dev → Test auto, Test → UAT one-click, UAT → Prod 4-eyes
- hotfix 走 Patch；功能 release 走 Upgrade（携带退役清单） || Hotfixes as Patches; feature releases as Upgrades with retirement list
- 接入 App Insights：拜访录入耗时 / Agent 成功率 / ERP 写入 P95 || Wire App Insights: visit latency / agent success rate / ERP write P95
- 每月 Operational Review：prompt-as-source diff 评审 Agent 行为漂移 || Monthly review: prompt-as-source diffs for agent behavior drift
- 产出：Release 节奏（每两周 Patch / 每月 Upgrade） || Output: release cadence (bi-weekly patches / monthly upgrades)
- 产出：可观测性看板（业务 KPI + 平台 KPI） || Output: observability dashboard (business + platform KPIs)
- 门禁：Prod 首次部署成功 + 看板数据 24h 内出现 → 运维闭环 || Gate: first prod deploy succeeds + dashboard data within 24h → ops loop closed

**查看深入：两条 Pipeline 路径 · 生产 SLO || Deep dive: Two Pipeline Tracks · Production SLOs**

**两条 Pipeline 路径 || Two Pipeline Tracks**

- **Phase 1 · In-product Pipelines** · Power Platform 自带，3 周可上线
- **Phase 2 · Azure DevOps + GitHub** · 与 SAP DevOps 对齐，正规 CI/CD

**生产 SLO（首发版本） || Production SLOs (first release)**

- 拜访录入端到端 ≤ 30s（P50） || Visit capture end-to-end ≤ 30s (P50)
- Agent 调用成功率 ≥ 98% || Agent call success rate ≥ 98%
- SAP 写入 P95 ≤ 8s（异步） || SAP write P95 ≤ 8s (async)
- 可用性 ≥ 99.5%（不含 SAP 计划外停机） || Availability ≥ 99.5% (excludes unplanned SAP downtime)

## #self-serve 08 / Self-Serve Index :: 提示词索引与行动计划 || Prompt Index & Action Plan

把全文散布的 9 段提示词和模板按使用顺序集中索引；右上角复制按钮在每个 prompt 卡片上都能用，照单跑一遍 = 一遍完整实施。 || The nine prompts and templates scattered through the doc, indexed in execution order; every prompt card carries a top-right copy button, so a one-pass run = a full first implementation.

:::flow
1. **阶段 02 · Plan-First · 一句话起手 Prompt || Stage 02 Plan-First · One-Line Kickoff Prompt** — 阶段 02 · Plan-First · 一句话起手 Prompt || Stage 02 Plan-First · One-Line Kickoff Prompt 给 Plan Designer 的"30 秒单手 + AI 起草商机"一句话定义；产出 v0 plan。 || The one-line "30s single-handed + AI-drafted opportunity" intent for Plan Designer; produces a v0 plan.
2. **阶段 03 · Refine ×3 · Edit-mode 微调 prompt 模板 || Stage 03 Refine ×3 · Edit-Mode Refinement Prompt Template** — 阶段 03 · Refine ×3 · Edit-mode 微调 prompt 模板 || Stage 03 Refine ×3 · Edit-Mode Refinement Prompt Template 第 1/2/3 轮 Edit prompt：分别聚焦实体边界、Agent 工具集、UI 交互细节。 || Round 1/2/3 Edit prompts: entity boundaries, agent toolsets, UI interaction details respectively.
3. **阶段 04 · Vibe Build · Bootstrap 提示词 || Stage 04 Vibe Build · Bootstrap Prompt** — 阶段 04 · Vibe Build · Bootstrap 提示词 || Stage 04 Vibe Build · Bootstrap Prompt 一段拉齐 Solution / 7 张 Tables / 1 个 SAP Connector / 4 条 Cloud Flow 占位；屏幕生成的前置条件。 || One prompt aligns the Solution, 7 Tables, 1 SAP connector and 4 Cloud Flow stubs; prerequisite for screen generation.
4. **阶段 04 · Vibe Build · 5 屏 Vibe Coding 提示词 || Stage 04 Vibe Build · 5 Screen Vibe Coding Prompts** — 阶段 04 · Vibe Build · 5 屏 Vibe Coding 提示词 || Stage 04 Vibe Build · 5 Screen Vibe Coding Prompts HomeDashboard / VoiceCapture / OpportunityDraft / VisitTimeline / AgentChat 五屏，每屏一段可粘贴 prompt。 || HomeDashboard / VoiceCapture / OpportunityDraft / VisitTimeline / AgentChat — five screens, one paste-ready prompt each.
5. **阶段 05 · Solution-ize · ALM 接线模板 || Stage 05 Solution-ize · ALM Wire-Up Template** — 阶段 05 · Solution-ize · ALM 接线模板 || Stage 05 Solution-ize · ALM Wire-Up Template Publisher prefix / Solution 命名 / 环境变量 / 连接引用四件套；从 Vibe 输出抽取到可上线 Solution。 || Publisher prefix / solution naming / environment variables / connection references — the four-piece kit that lifts Vibe output into a shippable solution.
6. **阶段 06 · Promote & Operate · Pipeline + 监控基线 || Stage 06 Promote & Operate · Pipeline + Monitoring Baseline** — 阶段 06 · Promote & Operate · Pipeline + 监控基线 || Stage 06 Promote & Operate · Pipeline + Monitoring Baseline Power Platform Pipelines DEV→TEST→UAT→PROD 配置；Monitor / 失败重放 / SLO 阈值。 || Power Platform Pipelines DEV→TEST→UAT→PROD config; Monitor / failure replay / SLO thresholds.
:::

:::comparison
::versus 方案 1 || Option 1
### Day-1 · 自检 || Day-1 · Self-Check
- 读 00 节怎么用 + 方法论总览，确认读者画像、时间预估、前置清单与你团队匹配。 || Read Section 00 how-to-use + methodology overview; confirm reader personas, time estimates and prerequisites match your team.
- 确认 Power Apps Premium / Copilot Studio license + Plan Designer 已对租户启用。 || Confirm Power Apps Premium / Copilot Studio license + Plan Designer is enabled for your tenant.
- 跑阶段 01 Foundation：DEV/TEST/UAT/PROD 4 个环境 + DLP + Publisher prefix。 || Run Stage 01 Foundation: 4 environments DEV/TEST/UAT/PROD + DLP + publisher prefix.

::versus 方案 2 || Option 2
### Week-1 · 出 v0 原型 || Week-1 · Ship a v0 Prototype
- 阶段 02：复制"一句话起手 Prompt"到 Plan Designer，跑通三 Agent。 || Stage 02: paste the "One-Line Kickoff Prompt" into Plan Designer; run all three agents end-to-end.
- 阶段 03：执行 3 轮 Edit-mode refine，每轮人审 + 留 ADR。 || Stage 03: execute three Edit-mode refine rounds; human review + ADR after each.
- 阶段 04：复制 Bootstrap + 5 屏提示词，搭出可演示的销售单手原型。 || Stage 04: paste the Bootstrap + 5 screen prompts; ship a demo-able single-handed rep prototype.

::versus 方案 3 || Option 3
### Month-1 · 上线一条线 || Month-1 · Ship One End-to-End Line
- 阶段 05：把 v0 抽到带 Publisher prefix 的 Managed Solution + 环境变量 / 连接引用。 || Stage 05: lift v0 into a Managed Solution with publisher prefix + environment variables / connection references.
- 阶段 06：用 Power Platform Pipelines 把 Solution 推过 DEV→TEST→UAT→PROD。 || Stage 06: promote the solution DEV→TEST→UAT→PROD via Power Platform Pipelines.
- 开 Monitor + SLO 看板：错误率 / P95 延迟 / Flow 失败重放，纳入 weekly review。 || Open Monitor + SLO dashboard: error rate / P95 latency / Flow failure replay, baked into weekly review.
:::

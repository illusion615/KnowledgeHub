---
title: "Copilot Studio 官方路线图与发布状态 || Copilot Studio Official Roadmap and Release Status"
eyebrow: "官方计划 · 交付核验 · 产品选型 || Official Plans · Release Evidence · Product Selection"
brand: Copilot Studio
date: 2026-11-09
strict_i18n: true
strict_density: true
lead: "选型需要同时回答三件事：微软计划交付什么，哪些能力已有发布依据，以及这些能力能否在目标环境按要求运行。结合官方入口、状态解读和功能查询，可将关键能力转化为可核验的采购与实施条件。 || Product selection needs three answers: what Microsoft plans to deliver, which capabilities have release evidence, and whether they work as required in the target environment. Use the official sources, status guide, and feature query to turn important capabilities into verifiable procurement and implementation conditions."
hero_actions:
  - "查询功能快照 || Query the Feature Snapshot | #query"
  - "打开官方入口 || Find the Official Sources | #sources"
panel_label: "选型原则 || Selection Principle"
panel_title: "先确定能力范围，再判断交付状态 || Verify Scope before Release Status"
panel:
  - "目标日期回答计划，不直接回答是否已经交付。 || A target date describes a plan, not proof of delivery."
  - "发布标记回答官方状态，不证明所有租户都已推出。 || A release label states the official status, not rollout to every tenant."
  - "生产依赖还需要渠道、权限、许可与真实流程验证。 || Production reliance still requires channel, permission, licensing, and workflow validation."
metrics:
  - "选取记录 || Selected Records | 16 | 12 个路线图 ID，加 4 条公告／历史计划对照；不是完整功能目录。 || 12 roadmap IDs plus 4 notice/archived-plan comparisons; not an exhaustive feature list."
  - "官方路线图 ID || Official Roadmap IDs | 12 | 同名但状态不同的两条记录分别保留；ID 数量不是独立能力数量。[3][4] || Two same-title records with different states are retained; IDs are not a count of distinct capabilities.[3][4]"
  - "最近核对日期 · UTC || Last Verified · UTC | 2026-11-09 | 快照不自动更新，也没有执行客户租户检测。 || No automatic refresh and no customer tenant availability checks."
style:
  accent: "#7c3aed"
custom_scripts:
  - ./roadmap-query.js
---

## #sources 01 / Official Sources :: 用当前路线图查计划，用产品文档查实施条件 || Use the Current Roadmap for Plans and Product Docs for Implementation

Release Planner 公告已停止更新，内容截至 2026-09-01，并计划在 2026-11-15 退役。Copilot Studio 产品选择会导向 AI at Work Roadmap；旧 Power Platform 发布计划已标为历史归档。[1][2][6] || The Release Planner banner says updates have stopped, with content frozen as of September 1, 2026 and retirement scheduled by November 15. The Copilot Studio product selection directs readers to the AI at Work Roadmap; the older Power Platform plans are marked archived.[1][2][6]

:::accordion
::panel { open: true }
### 四类官方页面分别回答什么 || What Each Official Source Can Establish
公开预览（Public preview）供提前体验；一般可用（GA，General Availability）是正式发布阶段标签，不能省略后续的环境核验。[5][8] || Public preview provides early access. General availability (GA) is a formal release-stage label, but it does not remove the need to verify the target environment.[5][8]

| 入口 || Source | 适合回答 || What It Establishes | 不能据此推定 || What It Does Not Establish |
| --- | --- | --- |
| AI at Work Roadmap：Copilot Studio || AI at Work Roadmap: Copilot Studio | 当前条目、原始状态、预计月份、云与平台标签。[2][3] || Current records, original status, planned months, cloud and platform tags.[2][3] | 精确部署日期；客户租户已经可用。 || An exact deployment day or availability in a customer tenant. |
| [What's new in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new) | 按月查发布公告，保留 GA／Preview 原始标签。[5] || Monthly release notices with the original GA/Preview labels.[5] | 当月第一天就是交付日；公告覆盖每一项功能。 || Release on the first day of the month or complete feature coverage. |
| 能力专属 Microsoft Learn 文档 || Capability-Specific Microsoft Learn Guidance | 具体操作、支持范围、前提与已知限制；如 Dataverse 的 15 表上限。[12] || Implementation, scope, prerequisites, and limits, such as Dataverse's 15-table limit.[12] | 出现配置步骤就代表整个能力已经 GA。 || GA for the entire capability merely because setup steps exist. |
| [Release Planner](https://releaseplans.microsoft.com/en-US/?app=Microsoft+Copilot+Studio) / [Learn 历史计划 || Archived Learn Plans](https://learn.microsoft.com/en-us/previous-versions/power-platform/release-plan/2024wave2/microsoft-copilot-studio/) | 追溯旧波次、原计划和启用方式。[1][6][7] || Historical waves, original plans, and enablement conditions.[1][6][7] | 旧波次仍在维护；过去的 GA 日期已经兑现。 || Continued maintenance or delivery of a past planned GA date. |

::panel
### 沿产品视图找到可复核的功能条目 || Find a Traceable Feature in the Product View
先固定产品，再固定条目 ID，避免混入其他产品。harness 指负责模型调用与工具执行的运行时，不同 harness 的能力与计费可能不同。[20] || Fix the product and then the record ID to avoid mixing in other products. A harness is the runtime that manages model calls and tool execution; features and billing can differ between harnesses.[20]

1. **从产品入口进入 || Start from the Product View** — 旧门户的实际产品参数是 `app=Microsoft+Copilot+Studio`；当前目标页的产品筛选是 Microsoft Copilot Studio。[1][2] || The legacy portal's actual product parameter is `app=Microsoft+Copilot+Studio`; the current destination filters for Microsoft Copilot Studio.[1][2]
2. **保留 ID 和原文标题 || Retain the ID and Official Title** — 官方 RSS 给出逐条链接，例如 [576272：新 harness 的网页浏览](https://www.microsoft.com/microsoft-365/roadmap?id=576272)。同名条目不能只按标题合并。[3][4] || The official RSS supplies per-feature links, such as [576272: web browsing on the new harness](https://www.microsoft.com/microsoft-365/roadmap?id=576272). Do not merge same-title records by title alone.[3][4]
3. **同时打开实施文档 || Open Matching Implementation Guidance** — 条目没有文档链接时，需到 Learn 查对应能力；相近能力的文档不能当作同范围的交付证明。 || If the record has no documentation link, find the matching capability on Learn. Guidance for a similar feature is not evidence of delivery in the same scope.
:::

## #interpret 02 / Interpret Status :: 把目标日期、发布阶段与环境可用性分开 || Separate Target Dates, Release Stages, and Tenant Availability

同一条记录可能写着过去的 GA 目标月份，却仍标为 In development。查询保留这两个事实，不按日历自动升级状态，也不把记录修改时间当作发布日期。[2][3] || A record can show a past GA target month and still say In development. The query preserves both facts: dates do not automatically upgrade status, and a record's modified timestamp is not a release date.[2][3]

:::accordion
::panel
### 日期字段不等于已交付证明 || Date Fields Are Not Delivery Evidence
路线图通常给到月份，发布公告通常给到月份标题；只有来源明确给出某天时，才保留日级精度。Learn 日期取自 HTML 的 ms.date 元数据，不是页脚 Last updated；未采集 updated_at，也不据任何日期升级发布状态。 || Roadmap targets and release notices usually have month precision; a day is retained only when supplied. Learn dates use HTML ms.date metadata, not the visible Last updated footer; updated_at is not collected. None of these dates upgrades release status.

| 字段或标记 || Field or Label | 实际示例 || Observed Example | 选型含义 || Selection Implication |
| --- | --- | --- |
| 计划预览／GA 月份 || Planned Preview/GA Month | [576272](https://www.microsoft.com/microsoft-365/roadmap?id=576272)：2026-11／2027-01；In development。[3] || [576272](https://www.microsoft.com/microsoft-365/roadmap?id=576272): 2026-11 / 2027-01; In development.[3] | 安排跟踪与试点窗口，不承诺该窗口已经交付。 || Plan monitoring and a pilot window, not a claim of completed delivery. |
| 过去的目标日期 || Past Target Date | [571305](https://www.microsoft.com/microsoft-365/roadmap?id=571305)：两个目标月份均为 2026-10；仍 In development。[3] || [571305](https://www.microsoft.com/microsoft-365/roadmap?id=571305): both targets are 2026-10; still In development.[3] | 保留状态与月份的差异；没有变更说明时，不断言延期原因。 || Retain the discrepancy; without a change notice, do not assert why it occurred. |
| 明确的发布标签 || Explicit Release Label | 2026 年 5 月公告：Computer use，(General availability)。[5] || May 2026 notice: Computer use, (General availability).[5] | 证明公告所指能力的阶段，不覆盖另一种 harness 或工具形态。 || Substantiates the announced scope, not another harness or tool form. |
| 推出与来源元数据 || Rollout and Source Metadata | What's new 提醒更新会分多天推出。[5] || What's new says updates roll out over several days.[5] | ms.date 字段、开始推出与某个租户已经可用是不同判断。 || The ms.date field, rollout start, and availability in a tenant are separate facts. |

General Availability、Preview、Targeted Release 等是路线图的发布阶段标签。Targeted release 如适用，Rollout start 表示它开始出现，随后才到 Standard release；这些标签不应改写成全量可用。[2][3] || General Availability, Preview, and Targeted Release are release-phase tags. Where Targeted release applies, Rollout start refers to its beginning, followed by Standard release. These tags should not be rewritten as complete availability.[2][3]

::panel
### 筛选标签保留原始官方状态 || Filter Labels Retain the Original Official State
筛选器的中文标签仅用于检索归类：路线图状态与 Learn 公告属于两类独立来源，不组成自动推进的交付流水线。 || These filter labels are query categories. Roadmap states and Learn notices are different sources, not an automatically advancing delivery pipeline.

| 本页筛选 || Query Label | 保留的原文 || Retained Original | 解释边界 || Interpretation Limit |
| --- | --- | --- |
| 开发中 || In Development | In development | 保留计划状态，即使描述写着 now 或目标月份已过。[3] || Keep this state even when the description says now or a target month is past.[3] |
| 推出中 || Rolling Out | Rolling out | 推出正在进行；不代表所有目标环境都已完成。[3][5] || Rollout is underway, not complete in every target environment.[3][5] |
| 已发布标记 || Launched Label | Launched | 官方路线图的发布标记；实施范围仍需另查。[3] || An official roadmap release label; implementation scope still needs checking.[3] |
| 条目取消 || Cancelled Item | Cancelled | 仅指该条目；不可推导整个产品能力被撤销。[3] || Applies to the item, not necessarily the whole product capability.[3] |
| GA 公告 || GA Notice | (General availability) | 明确公告标签；按公告与文档的能力范围使用。[5] || An explicit notice label, used within the notice's documented scope.[5] |
| 预览标签 || Preview Label | (Preview)／(Production-ready preview)／文档中的 preview || (Preview) / (Production-ready preview) / preview in guidance | 保留各自限定，Production-ready preview 不改成 GA。[5][8] || Retain each qualification; Production-ready preview is not normalized to GA.[5][8] |

::panel
### 用能力范围解释撤回、同名条目与状态冲突 || Resolve Scope before Interpreting Conflicting States
三种 harness 的支持范围不同。MCP（Model Context Protocol）是连接 agent 与工具的协议，也要按实际接入路径核验。[15][20] || The three harnesses have different scopes. MCP (Model Context Protocol) connects agents with tools; its availability also needs checking for the actual integration path.[15][20]

Computer use 的 GA、预览、计划与取消记录对应不同范围，不能用一个状态概括整个能力。 || GA, preview, planned, and cancelled Computer use records concern different scopes; one state cannot summarize the entire capability.

当前 standard 工具 || Standard Tool

**本地工具已有明确 GA 公告 || The Local Tool Has an Explicit GA Notice**

2026 年 5 月公告为 General availability；实施文档适用 standard harness 的工具，需开启 generative orchestration。standalone 工具则另标 preview，只能加入 agent flows，尚不能加入 workflows。[5][9][10] || The May 2026 notice says General availability. Its guidance covers the standard-harness tool and requires generative orchestration. The standalone tool is separately preview and can be added to agent flows, not workflows.[5][9][10]

新 harness 与旧计划 || New Harness and Withdrawn Plan

**原生浏览仍在计划，撤回仅针对特定条目 || Native Browsing Is Planned; Withdrawal Is Item-Specific**

[576272](https://www.microsoft.com/microsoft-365/roadmap?id=576272) 仍为 In development；[562220](https://www.microsoft.com/microsoft-365/roadmap?id=562220) 为 Cancelled，并说明条目已不准确、将移除。它没有证明 Computer use 整体被取消。[3][11] || [576272](https://www.microsoft.com/microsoft-365/roadmap?id=576272) remains In development. [562220](https://www.microsoft.com/microsoft-365/roadmap?id=562220) is Cancelled and says the item is inaccurate and will be removed, not that all Computer use is cancelled.[3][11]

两个 Agent node 条目有相同标题与目标月份，但官方状态不同；分别保留可以防止误用发布依据。 || Two Agent node items share a title and target months but have different official states. Keeping both prevents the release label from being applied to the wrong record.

562222

**仍为开发中 || Still in Development**

[官方记录](https://www.microsoft.com/microsoft-365/roadmap?id=562222)：In development；预览 2026-04、GA 2026-09 目标。修改时间为 2026-05-14，不是交付日。[3][4] || [Official record](https://www.microsoft.com/microsoft-365/roadmap?id=562222): In development, with preview 2026-04 and GA 2026-09 targets. Modified on 2026-05-14, not a release date.[3][4]

566998

**已有 Launched 标记 || Marked Launched**

[官方记录](https://www.microsoft.com/microsoft-365/roadmap?id=566998)：Launched；预览 2026-04、GA 2026-09 目标。修改时间为 2026-10-26，不用它自动覆盖另一条记录。[3][4] || [Official record](https://www.microsoft.com/microsoft-365/roadmap?id=566998): Launched, with the same 2026-04/2026-09 targets. Modified on 2026-10-26; this does not overwrite the other record.[3][4]

Learn 分别提供 standard agent flow 与 GitHub Copilot workflow 的文档，但没有证据把这两个 ID 自动分配到两种路径，也没有明确的替代关系。[15][16] || Learn has separate standard agent-flow and GitHub Copilot workflow guidance. The collected sources do not map these IDs to those paths or establish a replacement relationship.[15][16]

过去的 GA 目标日期不能覆盖现有产品文档的预览警告与渠道限制。 || A past GA target does not override preview warnings and channel exclusions in the available product guidance.

归档计划 || Archived Plan

**日期列是历史依据 || Date Cells Are Historical Evidence**

IP firewall 计划列出 Public preview：Jul 14, 2025；General availability：Dec 12, 2025。此页面已归档，不用这一天确认实际 GA 交付。[7] || The IP firewall plan lists Public preview: Jul 14, 2025 and General availability: Dec 12, 2025. The page is archived; the date alone does not confirm GA delivery.[7]

现有产品文档 || Available Product Guidance

**预览警告与渠道限制仍需遵守 || Preview Warnings and Channel Limits Remain**

文档仍明确是 preview，要求 Managed Environment，并说明 Teams、Microsoft Copilot 等渠道不强制执行限制。所有渠道按 IP 隔离的采购要求不能由此支撑。[8] || The guidance explicitly says preview, requires a Managed Environment, and excludes enforcement on Teams, Microsoft Copilot, and other channels. It cannot support a requirement for mandatory IP isolation across all channels.[8]
:::

## #query 03 / Feature Query :: 按关键词和原始状态查询可追溯记录 || Query Traceable Records by Keyword and Original State

16 条选取记录覆盖知识源、协作、流程扩展、治理与计算机操作：12 个路线图 ID、3 条发布公告、1 条历史计划与现有文档对照。同名但 ID 不同的记录分别保留，ID 本身唯一；查询不代表完整路线图。[3][4][5][7] || The 16 selected records cover knowledge, collaboration, workflow extensions, governance, and computer use: 12 roadmap IDs, 3 release notices, and 1 archived-plan/current-guidance comparison. Same-title records with distinct IDs are retained; IDs are unique, and this is not the complete roadmap.[3][4][5][7]

功能筛选需要 JavaScript。仍可阅读完整指南、打开官方入口，或下载 snapshot.json 查看收录数据。 || Filtering requires JavaScript. You can still read the full guide, open the official sources, or download snapshot.json.

:::comparison { title: "搜索快照并选择记录 || Search the Snapshot and Select a Record" }
::versus 本地快照 || Local Snapshot
### 关键词与状态交叉筛选 || Combine Keyword and Status Filters
> **🧪 交互实验沙盒 || Interactive Simulation Sandbox** (`#roadmap-query-form`) — 交互可调参数：关键词／功能 ID || Keyword / Feature ID、状态（来源归类） || Status (Source Category)全部状态 || All Statuses 开发中 · In development || In Development · Roadmap 推出中 · Rolling out || Rolling Out · Roadmap 已发布标记 · Launched || Launched Label · Roadmap 条目取消 · Cancelled || Cancelled Item · Roadmap GA 公告 · General availability || GA Notice · General Availability 预览标签 · 保留原始限定 || Preview Label · Original Qualification Retained。

多个词按同时包含匹配；点击查询后应用。切换语言保留未提交输入、已应用筛选和所选记录。 || Multiple terms must all match. Filters apply on Search; language changes preserve draft input, applied filters, and the selected record.

2026-11-09 UTC

筛选不是租户检测；预览标签不自动变成 GA。本查询只读取本站快照，不向模型或微软发送关键词。 || Filtering is not a tenant check; preview labels do not become GA. This query only reads the site's snapshot and sends no keywords to a model or Microsoft.

::versus 方案 2 || Option 2
### 收录顺序 · 每页 4 条 || Curated Order · Four Records per Page
正在读取本站功能快照… || Loading the site's feature snapshot…

重试本地快照 || Retry Local Snapshot

上一组 || Previous

下一组 || Next
:::

选择匹配记录后显示计划与发布依据。 || Select a matching record to see its plan and release evidence.

选择记录后显示实施条件与选型含义。 || Select a record to see implementation conditions and selection implications.

:::callout { title: "关键洞察 || Key Insight" }
选型含义 · 评估建议 || Selection Implication · Evaluation Guidance
:::

:::callout { title: "网页可读；中文 PPT 未验收 || The Web Page Is Readable; Chinese PPT Is Not Accepted" }
交付范围为网页和查询。本机转换的中文 PPT 字体显示未通过，不能把 PPT 当作已验收稿。需要中文稿时，可尝试浏览器打印完整阅读稿，先选择所需功能，再检查中文、引用和分页；不保证其他浏览器或配置的打印结果。 || The deliverable is the web article and query. Chinese font rendering in this machine's PPT conversion has not passed; the PPT is not an accepted manuscript. For a Chinese copy, try browser printing the full reading view, select the required feature, and check Chinese text, references, and pagination. Results in other browsers or configurations are not guaranteed. 打开中文完整阅读稿以打印并核对 || Open the Chinese Reading Copy to Print and Check
:::

## #verify 04 / Verify Delivery :: 用目标环境的完整流程验证关键能力 || Verify the Critical Capability in the Target Workflow

看见功能菜单只证明当前账户能看到入口。选型依据还需要同范围文档，以及授权测试数据在目标渠道、身份和权限下完成流程的结果；此处列出标准核验步骤，不代表已检测客户租户。 || A visible menu only shows that the account can see an entry point. Selection also needs matching guidance and results from authorized test data under the target channel, identity, and permissions. These are standard verification steps, not a claim that customer tenants have been checked.

:::accordion
::panel
### 以 Dataverse 知识源做一次完整核验 || Verify a Dataverse Knowledge Source End to End
[568929](https://www.microsoft.com/microsoft-365/roadmap?id=568929) 仍为开发中，但公告和实施文档已有可操作内容；结构化数据与预览中的非结构化列应分开验收。[3][5][12] || [568929](https://www.microsoft.com/microsoft-365/roadmap?id=568929) remains in development while release notes and guidance provide usable implementation details. Validate structured data separately from preview unstructured columns.[3][5][12]

1. **固定要验收的数据范围 || Fix the Data Scope** — 先测试结构化表，最多 15 张表／知识源；Multiline Text 与 File 的非结构化检索另列预览依赖，不与普通表查询合并。[12] || Start with structured tables, up to 15 per knowledge source. Treat unstructured Multiline Text/File retrieval as a separate preview dependency.[12]
2. **确认搜索与身份前提 || Check Search and Authentication** — 环境开启 Dataverse search，agent 使用 Authenticate with Microsoft；此知识源不支持 No authentication 或 Authenticate manually。底层权限不足会导致表不可选。[12] || Enable Dataverse search and use Authenticate with Microsoft. This source does not support No authentication or Authenticate manually; insufficient underlying permissions can hide tables.[12]
3. **同时测允许和拒绝的数据 || Test Both Authorized and Denied Data** — 建议用两名授权测试账户分别验证应能访问和不应访问的数据，比较答案、引用与拒绝结果。不要只测试 maker 的权限；这是建议的测试，不是已执行结果。 || Use two authorized test accounts to check intended access and denial, comparing answers, citations, and refusals. Do not test only the maker's access. This is a proposed test, not an executed result.
4. **发布后再测真实目标渠道 || Retest in the Published Target Channel** — 预览列先设为 Searchable 并加入 Quick Find View；先加知识源后配置列可能最多需要两天回填。记录测试日期、配置与结果，再决定生产依赖。[12] || Make preview columns Searchable and add them to the Quick Find View. Adding the source first can require up to two days of backfill. Record the date, configuration, and outcome before production reliance.[12]

::panel
### 把六项条件写进功能核验记录 || Record Six Conditions for Capability Verification
同时归档环境范围、实施路径和可复现结果，避免核验记录退化为单一 GA 标签。 || Archive the environment scope, implementation path, and reproducible result so the record does not collapse into a bare GA label.

| 条件 || Condition | 应记录的内容 || What to Record |
| --- | --- |
| 租户、云与地区 || Tenant, Cloud, and Region | 目标云／地区、环境与测试日期；本样本的 Worldwide 标签不证明每个云或租户均支持。[3][5] || Target cloud/region, environment, and test date. Worldwide tags in this sample do not prove support in every cloud or tenant.[3][5] |
| harness 与渠道 || Harness and Channel | 运行时与网页、Teams 等部署渠道；不能跨范围套用发布结论。[9][11][20] || Runtime and deployment channel, such as web or Teams. Release conclusions do not transfer across scopes.[9][11][20] |
| 语言与数据类型 || Language and Data Types | 目标语言、文件／表类型和实际输入；未列出语言时，单独查文档与测试。[3][12] || Required language, file/table types, and representative inputs; check guidance and test languages not specified in the record.[3][12] |
| 许可与计费前提 || Licensing and Billing | 对应许可、可用容量与测试／生产预算口径；共享 agent 的接收者文档有 per-user license 前提。[17][20] || Applicable entitlement, capacity, and test/production budget basis. Sharing guidance requires a per-user license for recipients.[17][20] |
| 身份、连接与治理 || Identity, Connection, and Governance | 运行身份、连接权限与策略。SQL 依赖 maker 的连接与数据库权限；Entra Agent ID 不证明已具备独立邮箱。[13][19] || Execution identity, connection permissions, and policies. SQL uses the maker's connection/database permissions; an Entra Agent ID does not prove an agent-owned mailbox.[13][19] |
| 端到端结果 || End-to-End Result | 发布版本、目标渠道、允许／拒绝样例、错误与复测时间。SQL 文档建议先测已知小数据集的 diagnostic view。[13] || Published version, channel, allow/deny cases, errors, and retest date. SQL guidance recommends a diagnostic view with a small known dataset.[13] |
:::

## #selection 05 / Selection Decisions :: 把发布依据转成当前候选或有条件依赖 || Turn Release Evidence into Candidates or Conditional Dependencies

计划适合跟踪方向；明确发布标签加同范围文档，适合启动验证；生产依赖还需要目标环境的验证结果。这是选型判据，不是对客户项目的验收结论。 || Plans support tracking direction. An explicit release label and matching guidance justify starting validation; production reliance also needs target-environment results. These are selection criteria, not acceptance of a customer project.

:::accordion
::panel
### 三种依据支持三种决策 || Three Evidence Conditions Support Three Decisions
先写出采购必须满足的动作，再决定采用、试点或排除某项依赖；不按路线图日期给产品打分。 || Specify the required action first, then decide whether to validate, pilot, or exclude a dependency. Roadmap dates are not product scores.

1. **当前方案候选 || Candidate for the Current Solution** — 有 GA 公告或 Launched 标记，加同范围实施说明。例如 standard Computer use 有 GA 公告和工具说明；仍需验证目标机器、身份与渠道。[5][9] || An explicit GA notice or Launched label plus matching implementation guidance. Standard Computer use has both; still verify the machine, identity, and channel.[5][9]
2. **试点／有条件依赖 || Pilot or Conditional Dependency** — 预览、推出中，或计划与实施说明有差异。REST evaluations 的 4 月公告是 Preview；standard harness API 文档要求 test set 与用户令牌，不能因已有 API 文档就升为 GA。[5][14] || Preview, rolling out, or a scope/status discrepancy. REST evaluations are Preview in April's notice; the standard-harness API requires a test set and user token. API documentation does not make it GA.[5][14]
3. **不写入当前交付承诺 || Exclude from Current Delivery Commitments** — 只有目标日期、条目取消，或范围不满足硬要求。例如 576272 新 harness 原生浏览仍开发中、562220 已取消；准备可用替代路径，分开未来能力与当前承诺。[3][9][11] || Only target dates, a cancelled item, or scope that fails a mandatory requirement. Native browsing in 576272 is in development and 562220 is cancelled. Verify an available alternative and separate future plans from current commitments.[3][9][11]

::panel
### 三个容易误判的采购要求 || Three Procurement Requirements That Need Scope Checks
要求越具体，越能看出相似名称之间是否真的可以替代。 || Specific requirements expose whether similarly named capabilities are actually interchangeable.

| 采购要求 || Requirement | 可查依据 || Available Evidence | 应采用的判断 || Decision |
| --- | --- | --- |
| 新 harness 本月原生浏览网页 || Native Browsing on the New Harness This Month | 576272：2026-11 预览、2027-01 GA 目标，仍开发中；standard 工具另有 GA 公告。[3][5][11] || 576272: preview 2026-11, GA 2027-01 targets, still in development. The standard tool has a separate GA notice.[3][5][11] | 不用 standard 的 GA 替新 harness 背书；验证现有路径或连接器替代，保留迁移条件。 || Standard GA does not establish new-harness support. Validate an existing path or connector alternative with migration conditions. |
| 新分享界面直接给予编辑权限 || Editor Access Directly through the New Sharing UI | 569475 为 Launched、描述有 Editor；现有文档说新界面只给 viewing rights，编辑需其他角色路径。[3][17] || 569475 is Launched and mentions Editor. Current guidance says the new UI grants viewing rights; editing needs other role paths.[3][17] | 测试编辑、发布与角色分配；仅能查看／测试不足以满足协作编写要求。 || Test editing, publishing, and role assignment. Viewing/testing does not satisfy collaborative authoring. |
| 所有渠道按 IP 强制隔离 || Mandatory IP Isolation across All Channels | 历史计划有 GA 日期；现有文档仍为 preview，并不在 Teams／Microsoft Copilot 等渠道执行限制。[7][8] || An archived GA date coexists with preview guidance and no enforcement on Teams/Microsoft Copilot and other channels.[7][8] | 不作为全渠道隔离的唯一控制；另行满足安全要求。 || Do not use it as the sole all-channel isolation control; meet the security requirement separately. |

Agent Readiness 的路线图标记不能当作合规验收：相关 standard 文档仍为 preview，并说明状态摘要不替代管理员治理／合规报告。[3][18] || Agent Readiness's roadmap label is not compliance acceptance: related standard-harness guidance remains preview and says the summary does not replace admin governance/compliance reporting.[3][18]

::panel
### 评审前重查条目与实施条件 || Recheck Records and Conditions before the Decision
快照用于稳定引用，官方实时页面用于确认变化；两者一起保留。 || Use the snapshot for a stable reference and official live pages to confirm changes. Retain both.

1. **按 ID 重开官方记录 || Reopen the Official Record by ID** — 核对状态、月份、描述与实施范围。条目消失不证明已经交付：官方说明 GA、取消或推迟都可能导致信息移除。[2][4] || Check state, months, description, and implementation scope. Disappearance is not delivery proof: the official policy permits removal after GA, cancellation, or postponement.[2][4]
2. **以具体变更为准 || Use Specific Change Evidence** — 日期或描述改变时，保留前后版本与核对日期；没有官方说明时，不虚构延期、替代或撤回原因。 || Retain before/after versions and the verification date when dates or descriptions change. Without an official explanation, do not invent delay, replacement, or withdrawal reasons.
3. **保留未满足的选型条件 || Retain the Unmet Selection Conditions** — 写清 ID、官方依据、目标环境结果、剩余前提、替代路径与复查触发条件。旧 Planner 已停更，不作为当前计划的回退来源。[1] || Record the ID, sources, target-environment result, unmet prerequisites, alternative, and recheck trigger. The frozen Planner is not a fallback for current plans.[1]

快照核对日期为 2026-11-09 UTC。RSS 当时的 lastBuildDate 为 2026-11-06 23:04:41 UTC；两者都不是功能交付日。[4] 可下载 [功能快照](snapshot.json) 或查看 [来源与支持范围](evidence.json)；没有自动刷新或客户环境检测。 || Snapshot verified on 2026-11-09 UTC. The RSS lastBuildDate was 2026-11-06 23:04:41 UTC; neither is a feature release date.[4] Download the [feature snapshot](snapshot.json) or inspect the [sources and scope](evidence.json). There is no automatic refresh or customer-environment check.
:::

:::sandbox { id: "copilot-studio-release-roadmap-interactive-module", canvas: false, title: "页面交互增强模块 || Interactive Enhancement Module", script: "./roadmap-query.js" }
挂载同目录静态交互脚本与定制样式资源。 || Mounts sibling static interactive scripts and custom stylesheets.
:::

## #references 06 / References :: 按具体能力回到官方来源 || Return to the Official Source for Each Capability

全部参考来源均在 2026-11-09 公开访问核对。官方原文标题保留英文；每条路线图记录另有直接 ID 链接。公告月、计划日期、Learn ms.date、路线图 modified 与核对日分别保留。点击引用会展开对应来源，演示模式下返回阅读；其他手动披露状态不变。 || All reference sources were publicly checked on 2026-11-09. Official titles remain in English and roadmap records have individual ID links. Notice months, planned dates, Learn ms.date, roadmap modified, and verification dates remain separate. Citation jumps reveal the source and return presentation mode to reading, preserving other manual disclosures.

- [1] Microsoft — https://releaseplans.microsoft.com/en-US/?app=Microsoft+Copilot+Studio | 产品参数、停止更新与迁移公告；不作为当前功能状态来源。 || Actual product parameter and freeze/migration banner; not a source of current feature state.
- [2] Microsoft — https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=%5B%22Microsoft+Copilot+Studio%22%5D#Roadmap | 当前产品目标页、预计日期、Targeted／Standard 推出解释与移除政策。 || Current product destination, estimated dates, Targeted/Standard rollout interpretation, and removal policy.
- [3] Microsoft — https://www.microsoft.com/releasecommunications/api/v2/m365 | 官方页面使用的数据；核对收录 ID 的原文、状态、日期与标签，不承诺稳定 API。 || Data used by the official page; checks selected IDs, titles, states, dates, and tags. No stable API contract is asserted.
- [4] Microsoft — https://www.microsoft.com/releasecommunications/api/v2/m365/rss | 逐条官方链接与匹配状态；lastBuildDate 不等于功能发布日。 || Official per-record links and matching states; lastBuildDate is not a feature release date.
- [5] Microsoft Learn — https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new | 相关 2026 年 4／5／6／8／9 月公告与 rollout 警告；所取 HTML 的 ms.date 日期部分为 2026-11-04，不用作页脚更新时间。 || Relevant April/May/June/August/September 2026 notices and rollout caveat; the fetched HTML ms.date date portion is 2026-11-04, not labeled as the footer update date.

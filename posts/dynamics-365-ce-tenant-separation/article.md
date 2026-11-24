---
title: "CRM 系统拆分评估指南 || CRM System Separation Assessment Guide"
eyebrow: CRM Separation · Dynamics 365 CE / Dataverse Reference
brand: Power Platform
date: 2026-07-15
strict_i18n: false
strict_density: true
lead: "企业因业务剥离、法律实体重组、区域独立、数据驻留或运营模式变化，需要把一个既有 CRM 拆成两个独立系统。本指南提供适用于企业 CRM 的通用可行性判断、三条路径对比、目标架构、数据边界、六阶段实施和切换回退方法；平台能力、限制和工具以 Dynamics 365 CE / Dataverse 为实现参考。 || Divestitures, legal-entity restructuring, regional independence, data-residency requirements, and operating-model changes can require one CRM to become two independent systems. This guide provides reusable feasibility criteria, three path options, a target architecture, data-boundary rules, six delivery phases, and cutover and rollback methods for enterprise CRM. Platform capabilities, constraints, and tools use Dynamics 365 CE and Dataverse as the implementation reference."
hero_actions:
  - "比较三条路径 || Compare Three Paths | #options"
  - "查看阶段闸门 || Review Phase Gates | #phases"
panel_label: "路径选择规则 || Path Selection Rule"
panel_title: "整个 CRM 完整转移时评估原生迁移；源端与目标端都继续运营时评估选择性拆分。 || Assess Native Migration for a Complete CRM Transfer and Selective Carve-Out When Source and Target Both Continue Operating"
panel_desc: "Microsoft 原生 tenant-to-tenant move 的迁移单位是整个 Dataverse organization；迁移完成后，源环境不再包含 Dataverse。[1] 因此它适用于完整所有权转移，不会自动按照法律实体、业务单元、区域或数据边界把共享 CRM 拆成两套。 || The Microsoft native tenant-to-tenant move transfers the entire Dataverse organization; after completion, the source environment no longer contains Dataverse.[1] It fits complete ownership transfer and does not automatically split a shared CRM by legal entity, business unit, geography, or data boundary."
panel:
  - "先判断：整个 CRM 转移，还是源端与目标端继续运营 || Decide first: complete CRM transfer or continued operation in both source and target"
  - "再定义：哪些数据、流程和接口属于拆分组织 || Then define which data, processes, and integrations belong to the separated organization"
  - "最后执行：独立目标环境、选择性迁移、受控切换 || Then execute through an independent target, selective migration, and controlled cutover"
metrics:
  - "候选路径 || Candidate Paths | 3 | 整环境转移 · 选择性拆分 · 业务重建 || Whole-environment move · selective carve-out · business rebuild"
  - "迁移阶段 || Migration Phases | 6 | 从发现到稳定期，每阶段设退出闸门 || Discovery through stabilization, each with an exit gate"
  - "目标环境基线 || Target Environment Baseline | 3 | Dev · Test/UAT · Production || Development · Test/UAT · Production"
  - "关键闸门 || Critical Gates | 4 | 范围 · 构建 · 演练 · 切换 || Scope · build · rehearsal · cutover"
style:
  accent: "#7c3aed"
---

## #methodology 00 / Methodology and Master Flow :: 把 Success by Design 五阶段裁剪到 CRM 租户拆分：从目标租户创建、Entra ID 到数据迁移与切换的端到端主线 || Success by Design Tailored to CRM Tenant Separation: End to End from Target Tenant Creation and Entra ID to Data Migration and Cutover

CRM 租户拆分涵盖新建目标租户、建立 Entra ID 身份、预配 Dataverse 环境、按边界迁移数据、重建集成与受控切换，属于完整的 Dynamics 365 实施项目，不能简化为一次性数据搬运。Microsoft 官方方法论 Success by Design（Dynamics 365 实施指南核心、FastTrack 团队采用）的 Discover、Initiate、Implement、Prepare、Operate 五个阶段可裁剪至租户拆分场景，配齐三道强制评审闸门，并按租户与身份、环境与应用、数据、集成与协作、切换与治理五条工作流展开端到端活动与关键决策点。[13] || A CRM tenant separation spans target-tenant creation, Entra ID identity setup, Dataverse environment provisioning, boundary-based data migration, integration rebuilds, and controlled cutover; it is a full Dynamics 365 implementation project rather than a one-off data move. Microsoft's official Success by Design methodology (the core of the Dynamics 365 Implementation Guide used by FastTrack) adapts its five phases—Discover, Initiate, Implement, Prepare, and Operate—to tenant separation with three mandatory review gates. End-to-end activities and decision points then unfold across five work streams: tenant and identity, environments and apps, data, integrations and collaboration, and cutover and governance.[13]

1

Discover

评估 || Assess

盘点源租户、Dataverse 环境、Entra 身份与安全组、集成；判可行性与目标租户/区域 || Inventory source tenant, Dataverse environments, Entra identity and security groups, integrations; assess feasibility and target tenant/region

SBR 启动 || SBR starts

§01 决策前提 || §01 Decision Premise

决策 || Decision

可行性 · 选路径 || Feasible · pick path

→

2

Initiate

计划 || Plan

新建目标 Entra 租户与域；Solution Blueprint、数据边界、身份映射、Conditional Access 基线 || Create target Entra tenant and domains; Solution Blueprint, data boundary, identity mapping, Conditional Access baseline

SBR 定稿 || SBR finalized

§03 目标架构 || §03 Target Architecture

决策 || Decision

蓝图签署 || Blueprint sign-off

→

3

Implement

执行 || Execute

预配 Dataverse 环境；建 Entra 用户/组/application users；迁移元数据与数据；重建集成 || Provision Dataverse environments; build Entra users/groups/application users; migrate metadata and data; rebuild integrations

实施评审 || Impl. Reviews

§05 分阶段计划 || §05 Phased Plan

决策 || Decision

迁移验收 · 演练二 || Migration OK · rehearsal 2

→

4

Prepare

测试 || Test

UAT；登录/MFA/角色验证；切换手册与 go/no-go；模拟上线 || UAT; sign-in/MFA/role validation; cutover runbook and go/no-go; mock go-lives

就绪评审 || Go-live review

§07 切换与回退 || §07 Cutover and Rollback

决策 || Decision

上线 Go/No-Go || Go/No-Go

→

5

Operate

运营 || Operate

稳定期监控与支持；源侧退出；关闭跨租户共享与迁移凭据；知识移交 || Stabilization monitoring and support; source-side exit; close cross-tenant sharing and migration credentials; knowledge transfer

稳定退出 → 完成 || Stabilization exit → live

§08 治理与立项 || §08 Governance and Approval

阶段（Success by Design） || Phase (Success by Design)

评审闸门 || Review gate

决策闸门（通过才进入下一阶段） || Decision gate (pass to advance)

| 工作流 || Work Stream | Discover · 评估 || Discover · Assess | Initiate · 计划 || Initiate · Plan | Implement · 执行 || Implement · Execute |
| --- | --- | --- | --- |
| 租户与身份（Entra ID） || Tenant & Identity (Entra ID) | 盘点源租户、Entra 用户/组/应用注册、安全组、DLP || Inventory source tenant, Entra users/groups/app registrations, security groups, DLP | 新建目标 Microsoft 365 / Entra 租户，验证域，定身份映射与 Conditional Access 基线 || Create target Microsoft 365/Entra tenant, verify domains, define identity mapping and Conditional Access baseline | 建用户与许可、安全组与 group teams、application users / app registrations / secrets，启用 Conditional Access || Provision users and licenses, security groups and group teams, application users/app registrations/secrets, enable Conditional Access |
| 环境与应用 || Environments & Apps | 盘点 Dataverse 环境、D365 模块、solutions、表与容量 || Inventory Dataverse environments, D365 modules, solutions, tables and capacity | 设计目标环境链（Dev/Test/Prod）、publisher、DLP、pipeline || Design target environment chain (Dev/Test/Prod), publisher, DLP, pipelines | 预配目标 Dataverse 环境，用 managed solution 迁移元数据与应用 || Provision target Dataverse environments, transport metadata and apps as managed solutions |
| 数据 || Data | 数据画像、归属规则、依赖闭包、历史处置、稳定键 || Data profiling, ownership rules, dependency closure, historical disposition, stable keys | 数据处置矩阵、共享键、映射与转换规则 || Data disposition matrix, shared keys, mapping and transformation rules | Dataflows / ADF 按父子序 upsert，至少两次完整演练 || Dataflows/ADF parent-child upsert, at least two full rehearsals |
| 集成与协作 || Integrations & Collaboration | 盘点接口、mailboxes、SharePoint、connections、网关 || Inventory interfaces, mailboxes, SharePoint, connections, gateways | 每个接口定 owner、目标 URL、凭据与协作边界 || Assign each interface an owner, target URL, credential, and collaboration boundary | 重建 server-side sync、SharePoint 集成、connection references、HTTP 回调 || Rebuild server-side sync, SharePoint integration, connection references, HTTP callbacks |
| 切换与治理 || Cutover & Governance | 确定责任主体（CIO/业务/法务/数据/架构）与未知项 || Identify accountable parties (CIO/business/legal/data/architecture) and unknowns | RACI、切换原则、回退边界、范围批准 || RACI, cutover principles, rollback boundary, scope approval | 演练切换脚本、对账门槛与回退演练 || Rehearse cutover script, reconciliation thresholds, and rollback drill |

| 工作流 || Work Stream | Prepare · 测试 || Prepare · Test | Operate · 运营 || Operate · Operate |
| --- | --- | --- |
| 租户与身份（Entra ID） || Tenant & Identity (Entra ID) | 验证登录、MFA、许可与角色矩阵（正/负向访问测试） || Verify sign-in, MFA, licensing, and role matrix (positive/negative access tests) | 移交身份治理，关闭跨租户共享与迁移凭据，回收临时权限 || Hand over identity governance, close cross-tenant sharing and migration credentials, revoke temporary access |
| 环境与应用 || Environments & Apps | solution import、依赖与 smoke test、UAT 回归 || Solution import, dependency and smoke tests, UAT regression | 版本基线固化，纳入常规 ALM 与发布节奏 || Freeze the version baseline into routine ALM and release cadence |
| 数据 || Data | 数量、字段、关系、金额与业务场景对账 || Reconcile count, fields, relationships, financials, and business scenarios | 数据质量监控，源数据按保留决定只读或删除 || Monitor data quality; source data read-only or deleted per retention |
| 集成与协作 || Integrations & Collaboration | 逐接口合同测试与端到端验证 || Per-interface contract tests and end-to-end validation | 监控队列、同步与外部接口，关闭过渡通道 || Monitor queues, sync, and external interfaces; close transitional channels |
| 切换与治理 || Cutover & Governance | 变更冻结准备、Go/No-Go 标准、模拟上线、支持模型 || Prepare change freeze, go/no-go criteria, mock go-lives, support model | 执行切换与稳定期监控，源侧退出与知识移交 || Execute cutover and stabilization monitoring, source-side exit and knowledge transfer |

| 决策点 / 评审闸门 || Decision Point / Gate | 所在阶段 || Phase | 通过标准 || Pass Criteria | 引申章节 || Routes To |
| --- | --- | --- | --- |
| 可行性判定 || Feasibility Decision | Discover | 五项可行性闸门全部满足（业务与所有权、平台可迁移性、数据可分离性、独立运营、可切换可恢复） || All five feasibility gates are met (business and ownership, platform portability, data separability, independent operability, cutover and recoverability) | §01 决策前提 || §01 Decision Premise |
| 路径选择 || Path Selection | Discover → Initiate | 在完整所有权转移 / 选择性拆分 / 业务重建之间，判据明确且唯一 || The choice among complete ownership transfer, selective carve-out, and business rebuild is explicit and singular | §02 方案对比 || §02 Option Comparison |
| 蓝图签署（架构与数据边界） || Blueprint Sign-Off (Architecture and Data Boundary) | Initiate | 目标架构、五个控制面、数据边界规则与身份/接口目标经业务、法务、数据 owner 与架构联合批准 || Target architecture, the five control planes, data-boundary rules, and identity and integration targets are jointly approved by business, legal, data owners, and architecture | [§03 目标架构 || §03 Target Architecture](#architecture) · [§04 数据边界 || §04 Data Boundary](#boundary) |
| 迁移验收（演练二） || Migration Acceptance (Rehearsal Two) | Implement | 第二次完整演练在数量、关键字段、关系、金额、owner/team 与业务场景对账全部通过 || Rehearsal two passes reconciliation on count, critical fields, relationships, financial totals, owner/team, and business scenarios | [§05 分阶段计划 || §05 Phased Plan](#phases) · [§06 资产迁移 || §06 Asset Migration](#assets) |
| 上线 Go/No-Go || Go/No-Go | Prepare | Go-live Readiness Review 通过；关键业务路径验证、无未解释高风险差异 || The Go-live Readiness Review passes; critical business paths are validated with no unexplained high-risk variance | §07 切换与回退 || §07 Cutover and Rollback |
| 稳定期退出 || Stabilization Exit | Operate | 目标运营团队接管、未结缺陷进入常规 backlog、源侧按保留决定处置 || The target operations team owns the service, remaining defects enter the normal backlog, and the source is handled per the retention decision | §08 治理与立项 || §08 Governance and Approval |

| 评审闸门 || Review Gate | 时点 || Timing | 关注重点 || Focus | 是否强制 || Mandatory |
| --- | --- | --- | --- |
| Solution Blueprint Review（SBR） || Solution Blueprint Review (SBR) | Discover 启动、Initiate 定稿 || Starts in Discover, finalized in Initiate | 高层方案与架构风险、关键工作流、早期对齐 || High-level approach, architectural risk, key workstreams, and early alignment | 是（起点，强制） || Yes (starting point, mandatory) |
| Implementation Reviews | Implement | data model、security、integration、ALM、测试策略等专题深挖 || Topic deep dives: data model, security, integration, ALM, and testing strategy | 视 SBR 发现而定 || As indicated by SBR findings |
| Go-live Readiness Review | Prepare | 切换计划、go/no-go 标准、模拟上线、支持模型、部署手册 || Cutover plan, go/no-go criteria, mock go-lives, support model, and deployment runbook | 是（上线前，强制） || Yes (pre-go-live, mandatory) |

:::callout { title: "评审产出与方法论适配 || Review Outputs and Methodology Fit" }
每次评审把观察匹配到已知模式，产出三类 Findings：Assertions（做得对的地方）、Risks（若不缓解将带来负面影响）、Issues（已经或必然造成负面影响），再据此给出建议与行动。Success by Design 与团队既有实施方法论并行、不替代它；分阶段迁移计划中的六个迁移阶段，就是 Implement 与 Prepare 在拆分场景下的具体工作包，同样适用于选择性拆分、整环境迁移与业务重建三条路径。[13] || Each review matches observations to known patterns and yields three finding types: assertions (what the team is doing right), risks (negative impact if not mitigated), and issues (already or certain to cause negative impact). Those findings then drive recommendations and actions. Success by Design runs alongside—not instead of—the team's existing implementation methodology; the six migration phases form the concrete work packages of Implement and Prepare in a separation and apply equally to the selective carve-out, whole-environment move, and business-rebuild paths.[13]
:::

## #decision 01 / Decision Premise :: 迁移单位必须先于迁移工具确定 || Define the Migration Unit Before Selecting the Migration Tool

拆分评估先把诉求转化为一个可判断的所有权问题：迁移后，源租户是否仍需保留原 CRM 的客户、流程和历史。这个答案决定后续是移动一个完整 Dataverse organization，还是在目标租户建立第二套 CRM 并选择性迁移。 || Separation assessment starts by converting the request into an ownership decision: after migration, must the source tenant retain customers, processes, and history in the original CRM? The answer determines whether to move one complete Dataverse organization or build a second CRM in the target tenant and migrate selectively.

:::comparison { title: "先判断整体转移还是选择性拆分 || Decide Between Whole Transfer and Selective Carve-Out" }
::versus 完整所有权转移 || Complete Ownership Transfer
### 源租户不再需要该 Dataverse organization || The Source Tenant No Longer Needs the Dataverse Organization
- 业务、数据和 CRM 运营权整体转入目标租户 || Business, data, and CRM operations transfer together to the target tenant
- 可评估 Microsoft 原生 tenant-to-tenant move || The Microsoft native tenant-to-tenant move can be assessed
- 用户、应用用户、连接和外围服务仍需重配置 || Users, application users, connections, and peripheral services still require reconfiguration

::versus 源端与目标端继续运营 || Continued Operation in Source and Target { highlight: true }
### 保留组织与拆分组织都需独立 CRM || Both Retained and Separated Organizations Need Independent CRM
- 同一客户、联系人或历史可能跨两个组织共享 || Accounts, contacts, or history might be shared across both organizations
- 原生整环境移动不能完成按业务边界拆分 || A native whole-environment move cannot split records by business boundary
- 应建立目标环境，先部署元数据，再迁移获批数据 || Create the target environment, deploy metadata first, then migrate approved data
:::

:::callout { title: "通用角色定义 || Reusable Role Definitions" }
本指南以「源租户」表示当前承载 CRM 的租户，以「保留组织」表示拆分后继续使用源 CRM 的业务范围，以「拆分组织」表示需要独立 CRM 的法律实体、业务单元、区域或子公司，以「目标租户」表示承载新 CRM 的租户。若不存在保留组织，则优先评估完整所有权转移。 || This guide uses Source Tenant for the tenant currently hosting CRM, and Retained Organization for the business scope continuing on the source CRM. Separated Organization denotes the legal entity, business unit, region, or subsidiary needing an independent CRM, while Target Tenant denotes the tenant hosting the new CRM. If no retained organization exists, assess complete ownership transfer first.
:::

| 闸门 || Gate | 必须证明 || Evidence Required | 不满足时 || If Not Met |
| --- | --- | --- |
| 1 · 业务与所有权 || 1 · Business and Ownership | 保留组织、拆分组织、共享业务和最终 CRM 责任均有批准边界。 || Approved boundaries exist for the retained organization, separated organization, shared business, and final CRM accountability. | 不能选定迁移路径；先完成法律、业务与运营责任划分。 || Do not select a migration path; complete legal, business, and operating-accountability decisions first. |
| 2 · 平台可迁移性 || 2 · Platform Portability | 源部署形态、环境类型、产品组件、ISV 依赖与目标区域均落在已验证的迁移或重建路径内。 || Source deployment model, environment types, product components, ISV dependencies, and target geography all have a validated migration or rebuild path. | 把不支持项拆为专项重建、替代或退役工作包。 || Create dedicated rebuild, replacement, or retirement work packages for unsupported assets. |
| 3 · 数据可分离性 || 3 · Data Separability | 每类记录都有归属规则、共享策略、依赖闭包、历史处置和稳定业务键。 || Every record class has an ownership rule, sharing policy, dependency closure, historical disposition, and stable business key. | 选择性拆分不可进入构建；先完成数据画像和样本验证。 || A selective carve-out cannot enter build; complete data profiling and sample validation first. |
| 4 · 独立运营能力 || 4 · Independent Operability | 目标身份、许可、环境、容量、接口、邮件、文档、监控、支持与供应商责任可以独立运行。 || Target identity, licensing, environments, capacity, integrations, email, documents, monitoring, support, and vendor ownership can operate independently. | 允许限时过渡依赖，但必须有 owner、服务级别和关闭日期。 || Allow time-bounded transitional dependencies only with an owner, service level, and closure date. |
| 5 · 可切换与可恢复 || 5 · Cutover and Recoverability | 冻结、最终增量、对账、入口切换、Go/No-Go 和目标写入前后的回退边界均可演练。 || Freeze, final delta, reconciliation, entry-point switching, Go or No-Go, and rollback boundaries before and after target writes can all be rehearsed. | 不批准生产窗口；继续降低数据变化量或改用分波次切换。 || Do not approve a production window; reduce the change volume or use wave-based cutover. |

## #options 02 / Option Comparison Overview :: 三条路径分别适用于完整转移、选择性拆分与流程重建 || Three Paths Address Complete Transfer, Selective Carve-Out, and Process Rebuild

五项可行性闸门确认具备拆分条件后，需进一步比较三条实现路径。不存在对所有项目都成立的默认方案：完整所有权转移优先评估平台原生整实例迁移；源端与目标端都继续运营时评估选择性拆分；目标流程与旧系统差异过大时评估业务重建。 || Once the five feasibility gates confirm that separation is viable, three implementation paths are compared. No default fits every program: complete ownership transfer should assess a platform-native whole-instance move first; continued operation in both source and target should assess selective carve-out; and major divergence between target processes and the legacy system should assess business rebuild.

:::insight-grid { cols: 3, title: "三条迁移路径 || Three Migration Paths" }
::card A
### 平台原生整实例转移 || Platform-Native Whole-Instance Move
完整移动 CRM 实例及其业务数据。Dynamics 365 CE / Dataverse 提供两种原生形态：tenant-to-tenant 换租户、geo-to-geo 换区域。二者都移动整个环境，不做选择性拆分。[1][12] || Moves the complete CRM instance and its business data. Dynamics 365 CE and Dataverse offer two native variants: tenant-to-tenant changes the tenant and geo-to-geo changes the region. Both move a whole environment and perform no selective carve-out.[1][12]

::card B
### 选择性拆分 || Selective Carve-Out
在目标租户建立独立 ALM 环境链，使用解决方案迁移元数据，按获批边界迁移数据，再重建身份与集成。 || Builds an independent ALM environment chain in the target tenant, transports metadata through solutions, migrates approved data, and recreates identity and integrations.

::card C
### 业务重建 || Business Rebuild
以拆分组织的目标流程重新设计 CRM，仅迁移必要主数据与开放业务，历史留在只读档案或源系统。 || Redesigns CRM around the separated organization's target process, migrates only necessary master and open transactional data, and leaves history in a read-only archive or source system.
:::

| 维度 || Dimension | A · 整实例转移 || A · Whole-Instance Move | B · 选择性拆分 || B · Selective Carve-Out | C · 业务重建 || C · Business Rebuild |
| --- | --- | --- | --- |
| 适用条件 || Fit Condition | 整个 CRM 所有权转移，源租户不再承载该 CRM || The entire CRM transfers and the source tenant no longer hosts it | 源端与目标端都需继续运营，需要按记录与流程边界拆分 || Both source and target continue operating and require record and process separation | 拆分组织流程变化大，历史复用价值低 || The separated organization's processes change substantially and historical reuse value is low |
| 主要优点 || Primary Advantage | Dataverse 数据与组织整体保持；URL、OrgID、名称不变 || Dataverse data and organization stay intact; URL, OrgID, and name remain | 保留源 CRM，同时形成拆分组织的独立数据与治理边界 || Preserves the source CRM while establishing independent data and governance for the separated organization | 清理历史定制与技术债，目标流程更简洁 || Removes historical customizations and technical debt for a simpler target process |
| 主要代价 || Primary Cost | 不能保留两套可写 CRM；外围服务仍需重配置 || Cannot retain two writable CRMs; peripheral services still require reconfiguration | 需要业务边界规则、依赖闭包、数据转换与多轮对账 || Requires business-boundary rules, dependency closure, transformation, and repeated reconciliation | 需求确认与用户变更更大，历史连续性最低 || Requires greater requirements and user change, with the least historical continuity |
| 回退特性 || Rollback Characteristic | 迁移前可取消；完成后回退需另行制定受支持方案 || Can be canceled before completion; post-completion reversal requires a separately supported plan | 切换前可保留源 CRM；目标开始独立写入后需补偿性回退 || The source CRM can remain before cutover; independent target writes require compensating rollback | 可延后切换，但双轨流程持续越久，业务差异越大 || Cutover can be delayed, but longer dual operation increases process divergence |
| D365 实现边界 || D365 Implementation Boundary | 仅 Production / Sandbox；部分组件不支持；F&O 关联组织不可迁移 || Production and Sandbox only; some components unsupported; F&O-linked organizations cannot move | Solutions 与数据迁移工具均可用，但不是单键拆分功能 || Solutions and data migration tools are available, but this is not a one-click split feature | 标准 ALM 可用，业务重设计与历史归档需项目自行定义 || Standard ALM applies; business redesign and historical archiving remain project-defined |
| 本文结论 || Conclusion in This Plan | 仅在完整所有权转移时优先 || Preferred only for complete ownership transfer | 在源端与目标端继续运营时推荐 || Recommended when source and target both continue operating | 在流程重构价值高于历史连续性时采用 || Use when process redesign value exceeds historical continuity |

| 对比维度 || Dimension | Tenant-to-tenant migration || Tenant-to-Tenant Migration | Geo-to-geo migration（Geo Migration） || Geo-to-Geo Migration (Geo Migration) |
| --- | --- | --- |
| 改变什么 || What Changes | 环境的租户归属：把 Dataverse organization 关联到另一个租户。[1] || The environment's owning tenant: the Dataverse organization is linked to a different tenant.[1] | 环境所在的区域/数据中心，租户保持不变。[12] || The region or datacenter that hosts the environment, while the tenant stays the same.[12] |
| 租户与区域 || Tenant and Region | 租户改变，区域由目标租户决定。 || The tenant changes; the region follows the target tenant. | 单租户内操作：租户不变，区域改变。[12] || A single-tenant operation: the tenant is unchanged and the region changes.[12] |
| 典型场景 || Typical Scenario | 合并多个租户、企业收购、把环境所有权转到另一个租户。[1] || Merging multiple tenants, company acquisitions, and transferring environment ownership to another tenant.[1] | 数据驻留合规、区域整合、迁到离用户更近或新开放的数据中心。[12] || Data-residency compliance, region consolidation, and moving closer to users or to newly opened datacenters.[12] |
| 是否自助 || Self-Service | 是。PowerShell 与 Power Platform 管理中心；源端提交、目标端审批。[1] || Yes. PowerShell and the Power Platform admin center; the source submits and the target approves.[1] | 否。官方称支持有限、通常不可用，需联系客户经理或技术支持发起。[12] || No. Microsoft states support is limited and generally not available; initiate it through your account manager or Technical Support.[12] |
| 前置与窗口 || Lead Time and Window | 审批请求 7 天内有效；准备完成后 7 天内执行迁移。[1] || Approval requests are valid for seven days; run the migration within seven days after preparation.[1] | 官方建议预留至少 10 天完成；cut-over 小组织 1–6 小时、大组织可达 48 小时，通常在夜间或周末。[12] || Microsoft advises allowing at least 10 days; cut-over runs 1 to 6 hours for smaller organizations and up to 48 hours for large ones, usually in the evening or over a weekend.[12] |

| 对比维度 || Dimension | Tenant-to-tenant migration || Tenant-to-Tenant Migration | Geo-to-geo migration（Geo Migration） || Geo-to-Geo Migration (Geo Migration) |
| --- | --- | --- |
| URL 与标识 || URL and Identifiers | 环境 URL、OrgID 与名称保持不变。[1] || The environment URL, OrgID, and name stay the same.[1] | URL 改变（数据中心区域标识不同），environment ID 变为新的全局唯一 GUID。[12] || The URL changes (the datacenter region identifier differs) and the environment ID becomes a new globally unique GUID.[12] |
| 用户映射 || User Mapping | 需要 usermapping.csv 把源用户映射到目标租户用户。[1] || Requires usermapping.csv to map source users to target-tenant users.[1] | 不需要用户映射，因为租户和用户不变。[12] || No user mapping is needed because the tenant and users do not change.[12] |
| 配置丢失 || Configuration Loss | 安全组、application users 不随迁移；Managed Environment 需在目标重新启用，连接与部分组件需重配。[1] || Security groups and application users do not travel; Managed Environments must be re-enabled at the target, and connections and some components require reconfiguration.[1] | 备份、Managed Environment 状态、企业策略（CMK、VNet）、Lockbox、DLP、环境组、PAYG 与货币分配均丢失，需迁移后逐项恢复。[12] || Backups, Managed Environment status, enterprise policies (CMK, VNet), Lockbox, DLP, environment group, pay-as-you-go, and currency allocations are all lost and must be reapplied after migration.[12] |
| 主权云限制 || Sovereign-Cloud Limits | GCC 与公有云之间不支持互迁。[1] || Migration between GCC and public clouds is not supported.[1] | US GCC、GCC High、中国不支持；OCE 与 IND 进出受限。[12] || Not supported into or out of US GCC, GCC High, or China; restricted into or out of OCE and IND.[12] |
| 对拆分的意义 || Relevance to Separation | 整环境换租户，不按业务边界拆分记录。 || Moves a whole environment to another tenant and does not split records by business boundary. | 整环境换区域，不按业务边界拆分记录。 || Relocates a whole environment to another region and does not split records by business boundary. |

:::callout { title: "适用条件与常见误用 || Applicability and Common Misuse" }
选 tenant-to-tenant：整个 CRM 环境的所有权转到另一个租户（收购、集团重组、租户合并），且源租户不再需要该环境。选 geo-to-geo：环境必须落到不同区域以满足数据驻留或延迟要求，但仍留在同一租户；它是重定位而非拆分。二者都不能把一个共享 CRM 按法律实体、业务单元或区域拆成两套——这类需求应走本文的选择性拆分（路径 B），并在建目标环境时直接选定所需区域，通常无需再做 geo-to-geo。 || Choose tenant-to-tenant when ownership of the whole CRM environment moves to another tenant (acquisition, group restructuring, tenant merger) and the source tenant no longer needs it. Choose geo-to-geo when the environment must reside in a different region for data-residency or latency requirements while staying in the same tenant; it relocates rather than separates. Neither splits one shared CRM by legal entity, business unit, or region into two systems — that need uses the selective carve-out (Path B) in this guide, and the target environment is created directly in the required region, so a separate geo-to-geo move is usually unnecessary.
:::

## #architecture 03 / Target Architecture :: 目标租户承载独立运行栈，迁移通道只在过渡期存在 || The Target Tenant Hosts an Independent Runtime While the Migration Channel Is Temporary

选定选择性拆分路径后，目标架构落为三域模型：源租户保持业务连续，过渡域执行受控提取与对账，目标租户形成独立身份、应用、数据、集成和治理。迁移通道不承担长期业务集成，稳定期结束后关闭。 || Under the selective carve-out path, the target architecture maps to three zones: the source tenant preserves continuity, a transition zone performs controlled extraction and reconciliation, and the target tenant establishes independent identity, application, data, integration, and governance. The migration channel is not a permanent business integration and closes after stabilization.

:::insight-grid { cols: 3, title: "三域目标架构 || Three-Zone Target Architecture" }
::card 01
### 源租户 · 连续运营 || Source Tenant · Continued Operation
现有 Dynamics 365 CE / Dataverse 保持权威；冻结期前继续承接业务。对目标范围数据应用边界标签，并提供受控只读提取。 || The existing Dynamics 365 CE and Dataverse remain authoritative and continue business until the freeze. Target-scope data receives boundary labels and controlled read-only extraction.

::card 02
### 过渡域 · 迁移工厂 || Transition Zone · Migration Factory
保存解决方案构件、映射规则、提取批次、转换日志、错误队列和对账结果。凭据使用目标侧独立应用身份。 || Stores solution artifacts, mapping rules, extraction batches, transformation logs, error queues, and reconciliation results. Credentials use independent target-side application identities.

::card 03
### 目标租户 · 独立运行 || Target Tenant · Independent Runtime
至少设置 Dev、Test/UAT、Production 三套环境；在目标 Entra、Dataverse、Exchange、SharePoint 与外部系统中建立独立身份和权限。 || Provides at least Development, Test/UAT, and Production environments, with independent identity and authorization across target Entra, Dataverse, Exchange, SharePoint, and external systems.
:::

| 控制面 || Control Plane | 目标态 || Target State | 迁移机制 || Migration Mechanism | 失败边界 || Failure Boundary |
| --- | --- | --- | --- |
| 身份与访问 || Identity and Access | 目标用户、组、应用注册与条件访问由目标租户管理 || Target users, groups, app registrations, and Conditional Access are managed in the target tenant | 先创建并许可目标用户；重建环境安全组、group teams 和 application users || Precreate and license target users; recreate environment security groups, group teams, and application users | 未映射用户不得进入目标；应用身份不得沿用源租户密钥 || Unmapped users cannot enter the target; application identities cannot reuse source-tenant credentials |
| 应用与元数据 || Application and Metadata | 开发环境使用 unmanaged solution；Test/UAT 与生产使用 managed solution || Development uses unmanaged solutions; Test/UAT and production use managed solutions | 统一 publisher、解决方案分层、依赖清单和流水线 || Use one publisher, solution layering, a dependency inventory, and pipelines | 目标缺少依赖时停止导入，不在生产直接补 unmanaged customization || Stop import on missing dependencies and do not patch production with unmanaged customizations |
| 业务数据 || Business Data | 目标范围记录进入目标；共享与争议记录按批准规则复制、引用或留档 || Target-scope records enter the target; shared or disputed records follow approved copy, reference, or archive rules | 先主数据后交易数据；alternate key 支持幂等 upsert 与关联重建 || Load master data before transactions; alternate keys enable idempotent upsert and relationship reconstruction | 未通过依赖闭包的记录进入异常队列，不以空 lookup 强行写入 || Records failing dependency closure enter an exception queue rather than being forced in with empty lookups |
| 集成与协作 || Integration and Collaboration | 每个接口在目标租户拥有独立 owner、凭据、URL 与监控 || Every interface has an independent owner, credential, URL, and monitor in the target tenant | 重建 connection references、HTTP 回调、邮箱同步与 SharePoint 站点关联 || Rebuild connection references, HTTP callbacks, mailbox synchronization, and SharePoint site associations | 通过接口合同测试后才允许生产流量切换 || Production traffic moves only after interface contract tests pass |
| 治理与运维 || Governance and Operations | 目标租户独立承担 DLP、审计、容量、备份、支持和发布责任 || The target tenant independently owns DLP, audit, capacity, backup, support, and release responsibilities | 建立目标租户管理员、运营手册、告警、变更与应急流程 || Establish target-tenant administrators, runbooks, alerts, change, and incident processes | 稳定期退出前不得撤销源侧支持与取证访问 || Source-side support and evidence access remain until stabilization exits |

:::callout { title: "环境策略依据 || Environment Strategy Basis" }
Microsoft 建议至少分离 Development、Test 与 Production，Test 用于验证解决方案部署和端到端应用行为。[3] 若目标生产环境与开发环境处于不同服务更新站点，还必须校验版本方向，避免从较新环境向较旧环境导入解决方案。 || Microsoft recommends at least separate Development, Test, and Production environments, with Test validating both solution deployment and end-to-end application behavior.[3] If target production and development environments use different service-update stations, verify version direction to avoid importing from a newer environment into an older one.
:::

## #boundary 04 / Data Boundary :: 数据拆分以业务所有权与依赖闭包为准 || Data Separation Follows Business Ownership and Dependency Closure

目标架构只有在记录归属可计算时才可实施。数据边界将法律实体、业务过程、地域和记录关系合并为一套可审计规则；单纯按 owner、国家字段或创建人筛选都会遗漏团队拥有记录、跨区域客户和子表依赖。 || The target architecture is implementable only when record ownership can be computed. The data boundary combines legal entity, business process, geography, and record relationships into an auditable rule set. Filtering only by owner, country, or creator misses team-owned records, cross-region accounts, and child-table dependencies.

:::insight-grid { cols: 4, title: "四类数据处置 || Four Data Dispositions" }
::card 01
### 拆分组织独有 || Separated-Organization Exclusive
由拆分组织拥有、仅由目标流程处理且无保留组织持续使用要求的记录，迁移后由目标 CRM 成为权威。 || Records owned by the separated organization, processed only by target workflows, and not required by the retained organization become authoritative in the target CRM.

::card 02
### 保留组织独有 || Retained-Organization Exclusive
与拆分组织无业务、法律或运营关系的记录不进入目标；对账报告只记录数量与规则结果。 || Records with no business, legal, or operational relationship to the separated organization do not enter the target; reconciliation records only counts and rule outcomes.

::card 03
### 共享主数据 || Shared Master Data
跨组织的 Account、Contact、Product 等按批准字段集复制；建立 shared business key，不让两个 CRM 的本地 GUID 成为跨组织标识。 || Cross-organization Accounts, Contacts, and Products are copied using an approved field set and a shared business key; local CRM GUIDs do not become cross-organization identifiers.

::card 04
### 受限与历史 || Restricted and Historical
法律保留、敏感字段、审计证据或争议记录依据法务决定迁移、脱敏、留源或进入独立只读档案。 || Legal-hold, sensitive, audit-evidence, or disputed records follow legal decisions to migrate, mask, remain at source, or enter a separate read-only archive.
:::

:::accordion
::panel { open: true }
### 依赖闭包：每条业务记录必须带齐可运行上下文 || Dependency Closure: Every Business Record Needs Its Executable Context
依赖闭包指一条获批迁移记录所依赖的父记录、引用数据、owner/team、活动参与方、附件与状态语义必须一并解决，否则该记录在目标系统中不可正确解释或执行。 || Dependency closure means that every approved record must have its parent records, reference data, owner or team, activity parties, attachments, and status semantics resolved; otherwise the target cannot interpret or execute it correctly.

1. **先迁移主数据 || Load Master Data First** — Currency、Unit、Product、Price List、Account、Contact 与自定义 reference tables 先建立 alternate keys。 || Establish alternate keys for Currency, Unit, Product, Price List, Account, Contact, and custom reference tables first.
2. **再迁移开放交易 || Then Load Open Transactions** — Opportunity、Case、Quote、Order 与活动按父子顺序载入；owner 与 team 在目标身份映射后再赋值。 || Load Opportunities, Cases, Quotes, Orders, and activities in parent-child order; assign owners and teams after target identity mapping.
3. **最后处置历史与附件 || Finally Resolve History and Attachments** — 关闭业务、Notes、Email、附件与 SharePoint 文档按保留价值和合规要求决定全迁、选择迁移或只读归档。 || Closed transactions, Notes, Email, attachments, and SharePoint documents are fully migrated, selectively migrated, or archived read-only based on retention value and compliance.

::panel
### 具体失败样例：共享客户与目标范围商机不能只迁一半 || Failure Walkthrough: A Shared Account and Target-Scope Opportunity Cannot Be Half-Migrated
若 Opportunity 属于拆分组织团队，但其 Account 由共享团队拥有、Primary Contact 属于保留组织、Price List 为集团共享，则只按 Opportunity owner 筛选会生成三个失效 lookup，并可能让报价计算失败。 || If an Opportunity belongs to a separated-organization team while its Account is owned by a shared team, its Primary Contact belongs to the retained organization, and its Price List is shared group-wide, filtering only by Opportunity owner creates three broken lookups and can break quote calculations.

错误做法 || Incorrect Method

**按 owner 单字段提取 || Extract by Owner Only**

记录数看似匹配，但目标商机缺客户、联系人和价格上下文；用户进入目标后无法继续推进。 || Record counts appear correct, but the target opportunity lacks account, contact, and price context, so users cannot continue the process.

正确处置 || Correct Disposition

**先判定共享，再完成依赖闭包 || Classify Shared Data, Then Complete Dependency Closure**

复制获批字段的 Account 与 Contact，映射共享 Price List，建立目标 owner/team，再导入 Opportunity 并验证报价路径。 || Copy approved Account and Contact fields, map the shared Price List, establish the target owner or team, then import the Opportunity and validate the quote path.

::panel
### 数据工具边界：Dataflows 与 ADF 都需要明确映射 || Data Tool Boundaries: Both Dataflows and ADF Require Explicit Mapping
Microsoft 推荐 Dataflows 迁移 Dataverse 环境间数据；复杂批量迁移也可使用 Azure Data Factory / Synapse Dynamics connector。两类工具都只是执行器，不会替代业务归属、关联顺序和字段语义设计。[4][5] || Microsoft recommends Dataflows for migrating data between Dataverse environments; complex bulk migrations can also use the Azure Data Factory or Synapse Dynamics connector. Both are executors and do not replace business ownership, relationship ordering, or field-semantic design.[4][5]

| 工具 || Tool | 适合 || Best Fit | 官方限制 || Official Limitation | 本方案用法 || Use in This Plan |
| --- | --- | --- | --- |
| Dataverse Dataflows | 一次性跨环境或跨租户迁移；表结构接近 || One-time cross-environment or cross-tenant migration with similar schemas | 不支持 many-to-many relationship data；不能映射 Status / Status Reason；父子表需分开且手动定序 || Does not import many-to-many relationship data or map Status and Status Reason; parent and child tables require separate, manually ordered dataflows | 用于中等复杂度表和重复演练；alternate key 支持 upsert || Use for moderately complex tables and repeated rehearsals; alternate keys support upsert |
| ADF / Synapse Dynamics Connector | 大批量、转换、错误处理与可观测流水线 || Bulk loads, transformation, error handling, and observable pipelines | PartyList 不支持；线上组织并发 batch call 上限为 52；sink 使用 Upsert || PartyList is unsupported; online organizations allow 52 concurrent batch calls; the sink uses Upsert | 用于大表、复杂转换和增量追平；显式设置并发与 batch size || Use for large tables, complex transformations, and delta catch-up with explicit concurrency and batch sizing |
:::

## #phases 05 / Phased Migration Plan :: 六个阶段以证据闸门推进，不以预设日历推进 || Six Phases Advance Through Evidence Gates, Not a Preset Calendar

数据边界确定迁移对象后，分阶段计划进一步将迁移对象拆解为可执行工作包。当前没有表数、记录量、附件容量、接口数和停机容忍度，因此不编造周数；项目在发现阶段采集基线，在两次完整演练后由实测吞吐量推导生产窗口。 || Once the data boundary defines what moves, the phased plan decomposes the scope into executable work packages. Table count, row volume, attachment capacity, interface count, and outage tolerance are unknown, so no schedule is invented. Discovery establishes baselines, and two full rehearsals provide measured throughput for the production window.

:::flow
1. **阶段 1 · 发现与可迁移性评估 || Phase 1 · Discovery and Migratability Assessment** — 盘点环境、Dynamics 365 模块、solutions、表与容量、flows、plugins、custom APIs、PCF、canvas apps、Copilot Studio、Power Pages、mailboxes、SharePoint、网关、连接、应用用户、接口、审计与保留要求。退出闸门：资产清单有 owner，未知项有关闭日期。 || Inventory environments, Dynamics 365 modules, solutions, tables and capacity, flows, plug-ins, custom APIs, PCF, canvas apps, Copilot Studio, Power Pages, mailboxes, SharePoint, gateways, connections, application users, interfaces, audit, and retention requirements. Exit gate: every asset has an owner and every unknown has a closure date.
2. **阶段 2 · 目标设计与范围批准 || Phase 2 · Target Design and Scope Approval** — 确定路径、目标环境链、license/capacity 假设、数据处置矩阵、共享 key、身份映射、接口目标、RACI、切换原则和退出安排。退出闸门：CIO、业务、法务、数据 owner 与架构负责人共同签署范围。 || Confirm the path, target environment chain, license and capacity assumptions, data disposition matrix, shared keys, identity mapping, integration targets, RACI, cutover principles, and exit arrangement. Exit gate: CIO, business, legal, data owners, and architecture jointly approve scope.
3. **阶段 3 · 目标构建与元数据迁移 || Phase 3 · Target Build and Metadata Migration** — 建立目标 Entra 与 Dev/Test/Production，配置 security groups、DLP、publisher、pipelines；把应用、表、security roles、flows 与相关组件纳入 solutions，并从 Dev 以 managed artifact 推进。退出闸门：空数据目标环境通过 solution import、依赖和 smoke test。 || Build target Entra and Development, Test, and Production; configure security groups, DLP, publisher, and pipelines; place apps, tables, security roles, flows, and related components into solutions and promote managed artifacts from Development. Exit gate: the empty-data target passes solution import, dependency, and smoke tests.
:::

:::flow
1. **阶段 4 · 数据迁移、集成重建与测试 || Phase 4 · Data Migration, Integration Rebuild, and Testing** — 按主数据、开放交易、活动、历史和附件批次执行至少两次完整演练；并行重建 application users、connections、HTTP URLs、mailboxes、SharePoint 和外部接口。退出闸门：第二次演练通过数量、关键字段、关系、金额汇总、owner/team 与业务场景对账。 || Run at least two full rehearsals across master data, open transactions, activities, history, and attachments while rebuilding application users, connections, HTTP URLs, mailboxes, SharePoint, and external interfaces. Exit gate: rehearsal two passes count, critical-field, relationship, financial aggregate, owner/team, and business-scenario reconciliation.
2. **阶段 5 · 生产切换 || Phase 5 · Production Cutover** — 进入变更冻结，执行最终全量或增量追平，完成自动与人工对账，切换接口、URL 和用户入口，业务 owner 决定 go/no-go。退出闸门：关键业务路径通过且没有未解释的高风险差异。 || Enter change freeze, perform final full or delta catch-up, complete automated and manual reconciliation, switch integrations, URLs, and user entry points, and let the business owner make the go or no-go decision. Exit gate: critical business paths pass with no unexplained high-risk variance.
3. **阶段 6 · 稳定期与源侧退出 || Phase 6 · Stabilization and Source Exit** — 按业务日监控登录、同步、flow、plugin、接口、队列和数据质量；关闭迁移凭据与双写通道，执行知识移交。退出闸门：目标运营团队接管，未结缺陷进入常规 backlog，源数据按保留决定继续只读或删除。 || Monitor sign-in, synchronization, flows, plug-ins, integrations, queues, and data quality by business day; close migration credentials and dual-write channels; complete knowledge transfer. Exit gate: the target operations team owns the service, remaining defects enter the normal backlog, and source data follows the approved read-only or deletion decision.
:::

:::callout { title: "排期计算方法 || Schedule Calculation Method" }
生产数据窗口应以第二次演练的实际结果计算：窗口 = 最终增量提取 + 转换/载入 + 自动对账 + 人工抽检 + 接口切换 + 业务验证 + 决策缓冲。任何阶段日期都应在资产清单完成后由关键路径和团队容量推导，不以通用周数代替。 || Calculate the production data window from rehearsal-two evidence: final delta extraction + transformation and load + automated reconciliation + manual sampling + integration switch + business validation + decision buffer. Derive all phase dates from the critical path and team capacity after the inventory is complete rather than substituting generic week counts.
:::

## #assets 06 / Asset Migration Mechanisms :: 每类资产采用独立机制，不能把环境移动等同于完整可用性 || Each Asset Uses Its Own Mechanism; an Environment Move Does Not Equal Full Operability

六阶段计划需要一张可执行的资产路由表，将应用元数据、业务数据、身份、自动化、邮件、文档和不受支持组件分别映射到迁移机制与验收证据，防止环境或数据完成后才发现外围能力不可用。 || The six-phase plan requires an executable asset-routing table that maps application metadata, business data, identity, automation, email, documents, and unsupported components to separate migration mechanisms and acceptance evidence. This prevents peripheral failures from surfacing only after the environment or data has moved.

| 资产 || Asset | 机制 || Mechanism | 目标侧动作 || Target-Side Action | 验收证据 || Acceptance Evidence |
| --- | --- | --- | --- |
| Tables、columns、forms、views、model-driven apps、security roles、plugins || Tables, columns, forms, views, model-driven apps, security roles, and plug-ins | Custom solution；Dev 为 unmanaged，后续环境为 managed || Custom solutions; unmanaged in Development and managed downstream | 统一 publisher 与依赖顺序；不使用不可导出的 Default Solution 作为发布包 || Use one publisher and dependency order; do not use the nonexportable Default Solution as a release package | solution import log、dependency check、版本与 smoke test || Solution import log, dependency check, version, and smoke test |
| 业务数据与关联 || Business Data and Relationships | Dataflows 或 ADF/Synapse；按 alternate keys upsert || Dataflows or ADF/Synapse with alternate-key upsert | 父表先于子表；many-to-many、Status、PartyList 等限制单独处理 || Load parents before children; handle many-to-many, Status, PartyList, and other limitations separately | 记录数、关键字段、关系、金额汇总与抽样业务路径 || Record counts, critical fields, relationships, financial aggregates, and sampled business paths |
| 用户、环境安全组与 group teams || Users, Environment Security Groups, and Group Teams | 目标 Entra 预创建；用户映射用于整环境 move，选择性拆分使用独立身份映射表 || Precreate in target Entra; whole moves use user mapping, while carve-outs use an independent identity map | 分配 license、security role、team 与业务单元；安全组不会随整环境 move 自动迁移 || Assign licenses, security roles, teams, and business units; security groups do not migrate automatically with a whole move | 角色矩阵、正向/负向访问测试与 owner/team 对账 || Role matrix, positive and negative access tests, and owner/team reconciliation |
| Application users、app registrations、secrets/certificates || Application Users, App Registrations, and Secrets or Certificates | 在目标 Entra 与每个 Dataverse 环境重新创建 || Recreate in target Entra and in every Dataverse environment | 重新授予最小权限并轮换凭据；原生用户映射不支持 application users || Regrant least privilege and rotate credentials; native user mapping does not support application users | 每个接口的认证、授权、过期与禁用测试 || Authentication, authorization, expiry, and disablement tests for every interface |

| 资产 || Asset | 机制 || Mechanism | 目标侧动作 || Target-Side Action | 验收证据 || Acceptance Evidence |
| --- | --- | --- | --- |
| Power Automate 与 connections || Power Automate and Connections | Flows 放入 Dataverse solutions；connections、custom connectors 与 gateways 手动重配 || Place flows in Dataverse solutions; manually reconfigure connections, custom connectors, and gateways | 先启用 child flows，再启用 parent flows；HTTP-triggered flows 更新新 URL || Enable child flows before parent flows and update new URLs for HTTP-triggered flows | 逐 flow 成功路径、失败路径、重试与调用方合同测试 || Success, failure, retry, and caller-contract tests for each flow |
| Exchange mailboxes 与 server-side sync || Exchange Mailboxes and Server-Side Synchronization | 目标 Exchange 与 Dataverse 建立同租户 profile；过渡期需要时可用 cross-tenant OAuth || Establish a same-tenant profile between target Exchange and Dataverse; use cross-tenant OAuth during transition when needed | 配置、批准、Test & Enable mailbox；队列邮箱单独验证 || Configure, approve, and Test & Enable each mailbox; validate queue mailboxes separately | Incoming、Outgoing、Appointments/Contacts/Tasks 三类状态均通过 || Incoming, Outgoing, and Appointments, Contacts, and Tasks statuses all pass |
| SharePoint 文档 || SharePoint Documents | 另行迁移站点与文档，再重建 server-based SharePoint integration || Migrate sites and documents separately, then rebuild server-based SharePoint integration | 更新 Site、Document Location 与权限；不把 Dataverse 记录迁移视为文档已迁移 || Update Site, Document Location, and permissions; do not treat Dataverse record migration as document migration | 从 CRM 打开、创建、搜索和授权文档的端到端测试 || End-to-end tests for opening, creating, searching, and authorizing documents from CRM |
| Customer Voice、Omnichannel、component library、Customer Insights、Power Pages、Copilot Studio || Customer Voice, Omnichannel, Component Library, Customer Insights, Power Pages, and Copilot Studio | 按产品专门 runbook 处理；前三项不受原生 tenant move 支持 || Use product-specific runbooks; the first three are unsupported by the native tenant move | 导出、删除、重新预配或手工重连取决于产品；发现阶段必须单列 || Export, delete, reprovision, or reconnect manually depending on product; inventory each separately during discovery | 使用对应产品的官方迁移检查表和业务场景验收 || Use the product-specific official migration checklist and business-scenario acceptance |

:::callout { title: "原生整环境移动也存在前后置工作 || The Native Whole Move Still Has Pre- and Post-Move Work" }
Microsoft 明确要求对 Power Apps、Power Automate、Copilot Studio、Power Pages、Customer Insights、connections、mailboxes、security groups、Managed Environments 和未复制的环境设置执行专门步骤。[1] 因此即使最终改选方案 A，也应保留这套资产清单与验收结构。 || Microsoft explicitly requires product-specific steps for Power Apps, Power Automate, Copilot Studio, Power Pages, Customer Insights, connections, mailboxes, security groups, Managed Environments, and environment settings that do not copy.[1] Even if option A is ultimately selected, retain this asset inventory and acceptance structure.
:::

## #cutover 07 / Cutover and Rollback :: 切换以第二次演练结果定窗，以写入所有权变化划定回退边界 || Rehearsal Two Sets the Window, and Write Ownership Defines the Rollback Boundary

资产路由明确切换对象后，切换方案需定义生产当日的执行顺序与停止条件。选择性拆分在目标开始独立写入前可以回到源系统；目标产生独有业务记录后，简单恢复源写入会形成双主数据，需要补偿性同步和业务仲裁。 || Once asset routing identifies what must switch, the cutover plan defines the production-day execution order and stop conditions. A selective carve-out can return to the source before the target begins independent writes. Once the target creates unique business records, simply restoring source writes creates dual masters and requires compensating synchronization and business arbitration.

:::flow
1. **确认冻结与指挥链 || Confirm Freeze and Command Chain** — 停止 solution、schema、security role 与接口变更；确认业务、技术、法务和支持值守人。 || Stop solution, schema, security-role, and integration changes; confirm business, technical, legal, and support owners on duty.
2. **完成源侧最终快照 || Complete the Final Source Snapshot** — 记录表级数量、关键汇总、最后修改水位、接口队列与未完成批处理，作为回退和对账基线。 || Capture table counts, critical aggregates, last-modified watermarks, integration queues, and unfinished batch jobs as rollback and reconciliation baselines.
3. **暂停目标范围写入 || Pause Target-Scope Writes** — 通过维护窗口、业务流程控制或受支持的 administration mode 停止会形成目标范围增量的数据源。 || Use a maintenance window, process control, or supported administration mode to stop sources that would create further target-scope deltas.
4. **执行最终增量追平 || Run Final Delta Catch-Up** — 按水位提取变更，依照父子顺序 upsert，并清空可重试错误队列。 || Extract by watermark, upsert in parent-child order, and clear the retryable error queue.
5. **执行自动与人工对账 || Run Automated and Manual Reconciliation** — 检查记录数、alternate key 唯一性、孤立 lookup、owner/team、金额汇总、活动参与方和抽样客户时间线。 || Check counts, alternate-key uniqueness, orphan lookups, owners and teams, financial aggregates, activity parties, and sampled customer timelines.
6. **切换接口与协作服务 || Switch Integrations and Collaboration Services** — 启用 flows、application users、mailboxes、SharePoint、API endpoints、webhooks、报表和外部调用方。 || Enable flows, application users, mailboxes, SharePoint, API endpoints, webhooks, reports, and external callers.
7. **执行业务关键路径 || Execute Critical Business Paths** — 按销售、服务和管理角色完成登录、查询、创建、审批、邮件、文档和集成回执；每条结果留证。 || For sales, service, and management roles, test sign-in, query, create, approval, email, documents, and integration acknowledgments with evidence retained for every result.
8. **业务 owner 作出 go/no-go || Business Owner Makes the Go or No-Go Decision** — 未达到数据、接口、安全或关键流程阈值时停止开放；通过后才向目标用户发布新入口并开始稳定期。 || If data, integration, security, or critical-process thresholds are not met, keep access closed. Publish the new entry point to target users and begin stabilization only after approval.
:::

:::accordion
::panel
### Go/No-Go 判据必须在演练前批准 || Go or No-Go Criteria Must Be Approved Before Rehearsal
阈值应由业务与数据 owner 根据风险定义，不能在生产窗口中临时协商；下表给出必须量化的类别，不替客户虚构具体百分比。 || Business and data owners must define thresholds from risk before rehearsal rather than negotiating them during production. The table identifies categories that require numeric thresholds without inventing customer-specific percentages.

| 类别 || Category | 必须批准的判据 || Criterion Requiring Approval | 停止条件示例 || Example Stop Condition |
| --- | --- | --- |
| 数据完整性 || Data Integrity | 关键表允许差异数、孤立 lookup 数、金额汇总容差 || Allowed variance for critical tables, orphan-lookups, and financial aggregates | 存在未解释的高价值商机、Case 或客户关系缺失 || An unexplained high-value opportunity, case, or customer relationship is missing |
| 安全 || Security | 角色正向与负向测试、敏感字段访问和管理员范围 || Positive and negative role tests, sensitive-field access, and administrator scope | 目标用户可读取保留组织专属数据，或关键用户无法读取获批数据 || A target user can read retained-organization-exclusive data, or a critical user cannot read approved data |
| 业务连续性 || Business Continuity | 关键路径通过率、接口 backlog、邮箱与 flow 状态 || Critical-path pass rate, integration backlog, mailbox, and flow status | 无法创建或推进核心交易，或关键外部系统未收到回执 || Core transactions cannot be created or progressed, or a critical external system receives no acknowledgment |

::panel
### 回退分为写入前回退与写入后补偿 || Rollback Splits into Pre-Write Reversal and Post-Write Compensation
目标开始产生独立业务写入是回退的不可忽略分界；在此之前可恢复源入口，在此之后必须保存目标增量并决定回灌、人工重录或继续完成切换。 || Independent target writes are the material rollback boundary. Before that point, source access can be restored. After it, target deltas must be retained and either replayed, re-entered manually, or carried forward by completing the cutover.

写入前 || Before Target Writes

**恢复源入口并重开源写入 || Restore Source Entry and Source Writes**

停止目标接口，保留迁移日志与目标快照，解除源侧冻结；调查原因后重新演练。 || Stop target integrations, retain migration logs and the target snapshot, lift the source freeze, investigate, and rehearse again.

写入后 || After Target Writes

**执行补偿计划，禁止形成双主 || Execute Compensation and Prevent Dual Masters**

冻结目标增量，导出新建与修改记录，由业务 owner 批准回灌或人工处置；未完成前不得让两边同时自由写入同一业务范围。 || Freeze target deltas, export newly created and changed records, and obtain business-owner approval for replay or manual treatment. Do not allow both systems to write freely to the same scope before completion.
:::

## #governance 08 / Governance and Approval Decisions :: 立项批准四项原则，发现阶段关闭八项未知 || Approve Four Principles and Close Eight Unknowns During Discovery

切换方案需要管理层明确谁对业务边界、数据合法性、技术可用性和生产开放负责。治理模型定义最小责任结构与立项决策；项目获批不等于生产迁移获批，后者必须等待演练证据。 || The cutover plan requires clear accountability for business boundaries, data legality, technical operability, and production opening. The governance model defines the minimum accountability structure and approval decisions. Project approval is not production-migration approval; the latter waits for rehearsal evidence.

:::insight-grid { cols: 4, title: "四类责任主体 || Four Accountable Parties" }
::card 01
### 执行发起人 || Executive Sponsor
批准迁移路径、预算边界、业务优先级、跨组织争议升级和最终 go/no-go 权限。 || Approves the migration path, budget boundary, business priority, cross-organization dispute escalation, and final go or no-go authority.

::card 02
### 业务与数据 Owner || Business and Data Owners
批准流程边界、记录归属、共享字段、历史范围、对账阈值和业务场景验收。 || Approve process boundaries, record ownership, shared fields, historical scope, reconciliation thresholds, and business-scenario acceptance.

::card 03
### 法务、安全与合规 || Legal, Security, and Compliance
确认跨境、隐私、合同、法律保留、审计证据、删除和源侧保留期限。 || Confirm cross-border, privacy, contractual, legal-hold, audit-evidence, deletion, and source-retention requirements.

::card 04
### 技术与运营负责人 || Technical and Operations Owners
对 solution、数据、身份、集成、切换、回退、监控、支持和知识移交提供可验证证据。 || Provide verifiable evidence for solutions, data, identity, integrations, cutover, rollback, monitoring, support, and knowledge transfer.
:::

| 未知项 || Unknown | 需要的证据 || Required Evidence | 影响的决策 || Decision Affected |
| --- | --- | --- |
| 1 · CRM 所有权是否整体转移 || 1 · Whether CRM Ownership Transfers in Full | 法律实体、业务 owner 与源侧持续使用声明 || Legal-entity, business-owner, and source-continuity statements | 方案 A 或 B || Option A or B |
| 2 · 环境与产品范围 || 2 · Environment and Product Scope | Production/Sandbox/Default 等环境及 D365 模块清单 || Inventory of Production, Sandbox, Default, and other environments plus D365 modules | 官方支持路径与专门 runbook || Official support path and product-specific runbooks |
| 3 · 数据规模与复杂度 || 3 · Data Scale and Complexity | 每表记录、附件容量、审计、关系图与增长率 || Rows per table, attachment capacity, audit, relationship graph, and growth rate | 工具、波次与窗口 || Tooling, waves, and window |
| 4 · 目标范围数据判定规则 || 4 · Target-Scope Data Classification Rules | 法律实体、区域、owner/team、流程和共享记录样本 || Legal entity, geography, owner/team, process, and shared-record samples | 迁移范围与依赖闭包 || Migration scope and dependency closure |
| 5 · 身份与许可 || 5 · Identity and Licensing | 目标用户、groups、roles、application users 与容量估算 || Target users, groups, roles, application users, and capacity estimate | 目标租户就绪与访问模型 || Target readiness and access model |
| 6 · 集成与协作依赖 || 6 · Integration and Collaboration Dependencies | 接口、connections、gateways、Exchange、SharePoint、Power BI 与调用方 || Interfaces, connections, gateways, Exchange, SharePoint, Power BI, and callers | 重建工作量与切换顺序 || Rebuild effort and cutover order |
| 7 · 合规与保留 || 7 · Compliance and Retention | 合同、隐私、跨境、legal hold、审计和删除要求 || Contractual, privacy, cross-border, legal-hold, audit, and deletion requirements | 字段范围、历史与源侧退出 || Field scope, history, and source exit |
| 8 · 停机容忍度与业务日历 || 8 · Outage Tolerance and Business Calendar | 关键时区、月末/季末、服务窗口与手工应急流程 || Critical time zones, month or quarter close, service windows, and manual contingency processes | 演练设计、窗口与回退时点 || Rehearsal design, window, and rollback point |

:::callout { title: "建议批准的四项立项原则 || Four Principles Recommended for Project Approval" }
一，在源端与目标端继续运营时以选择性拆分为基线，同时保留发现阶段改选整环境转移的权利；二，目标租户采用独立 Dev/Test/Production 与 managed-solution ALM；三，数据范围必须由业务、法务和数据 owner 共同批准；四，生产迁移仅在至少两次完整演练、量化对账和回退演练通过后获批。 || First, use selective carve-out as the baseline when source and target continue operating, while retaining the right to switch to a whole-environment move during discovery. Second, use independent Development, Test, and Production environments with managed-solution ALM in the target tenant. Third, require joint approval of data scope by business, legal, and data owners. Fourth, approve production migration only after at least two full rehearsals, quantified reconciliation, and rollback rehearsal pass.
:::

## #references 09 / References :: 参考来源 || References

下列资料支撑本文对整环境移动（换租户与换区域）、ALM、环境策略、数据迁移、身份访问、邮件与文档依赖的判断。方案中的路径推荐属于基于客户工作假设的架构推论；客户专属周期、成本、合规结论和停机窗口仍需发现与演练证据。 || The sources below support the judgments about whole-environment moves (change of tenant and change of region), ALM, environment strategy, data migration, identity and access, email, and document dependencies. The path recommendation is an architectural inference from the customer working assumption; customer-specific duration, cost, compliance conclusions, and outage window still require discovery and rehearsal evidence.

- [1] Microsoft Learn · Tenant-to-tenant migrations — https://learn.microsoft.com/en-us/power-platform/admin/move-environment-tenant | 页面日期 2026-06-04，内容更新至 2026-07-13。支撑整 Dataverse organization 迁移单位、Production/Sandbox 支持范围、URL/OrgID/名称保持、源环境不再含 Dataverse、用户映射、七天有效期、安全组与 application users 不迁移，以及 Power Apps、Power Automate、Power Pages、Copilot Studio、Customer Insights 等前后置步骤。 || Page date 2026-06-04, content updated 2026-07-13. Supports the complete Dataverse organization as the move unit, Production and Sandbox scope, retained URL, OrgID, and name, removal of Dataverse from the source environment, user mapping, seven-day validity, nonmigration of security groups and application users, and product-specific pre- and post-move steps.
- [2] Microsoft Learn · Solution concepts with Power Platform — https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm | 支撑 solutions 作为 ALM 机制、Development 使用 unmanaged、下游环境使用 managed、solution dependencies、publisher prefix 与元数据名称不可事后更改等约束。 || Supports solutions as the ALM mechanism, unmanaged solutions in Development, managed solutions downstream, solution dependencies, publisher prefixes, and the immutability of metadata names after creation.
- [3] Microsoft Learn · ALM environment strategy considerations — https://learn.microsoft.com/en-us/power-platform/alm/environment-strategy-alm | 支撑至少分离 Development、Test、Production，以及跨地域服务更新站点和 solution import 版本方向的注意事项。 || Supports separating at least Development, Test, and Production and considering service-update stations and solution-import version direction across geographies.
- [4] Microsoft Learn · Migrate Data Between Dataverse Environments Using the OData Connector — https://learn.microsoft.com/en-us/power-apps/developer/data-platform/dataverse-odata-dataflows-migration | 页面日期 2026-03-12。支撑 Dataflows 跨租户场景、目标先部署相同 schema、父表先于子表、alternate keys、以及 many-to-many、Status 和 Status Reason 限制。 || Page date 2026-03-12. Supports cross-tenant Dataflows scenarios, target schema deployment first, parent-before-child ordering, alternate keys, and limitations for many-to-many, Status, and Status Reason.
- [5] Microsoft Learn · Copy and transform data in Dynamics 365 or Dynamics CRM — https://learn.microsoft.com/en-us/azure/data-factory/connector-dynamics-crm-office-365 | 内容更新至 2026-07-08。支撑 ADF/Synapse Dynamics connector 的 source/sink、service principal、Upsert、batch 与并发限制，以及 PartyList 等数据类型限制。 || Content updated 2026-07-08. Supports ADF/Synapse Dynamics connector source and sink capabilities, service-principal authentication, Upsert, batch and concurrency limits, and data-type limitations such as PartyList.

---
title: "Power Platform 治理：从概念到落地执行 || Power Platform Governance: From Concept to Operational Execution"
eyebrow: "企业治理快速上手 || Enterprise Governance Quickstart"
brand: Power Platform
date: 2026-05-12
strict_i18n: false
strict_density: true
lead: "面向企业 IT 团队的实操指南 — 把 Power Platform 治理拆成 7 段 ALM 生命周期、17 项交付任务、11 类负责人角色和 4 档成熟度路径，给出可对照执行的运营模型。所有建议来自 Microsoft Learn 官方文档。 || A practical guide for enterprise IT teams — Power Platform governance broken into 7 ALM stages, 17 delivery tasks, 11 role personas, and 4 maturity tiers, with an executable operating model you can map to. All recommendations grounded in Microsoft Learn official documentation."
hero_actions:
  - "看 7 段 × 6 组角色地图 || See the 7-Stage × 6-Group Role Map | #lifecycle"
  - "按成熟度对照落地 || Tailor by Maturity Tier | #playbook"
panel_label: "核心观点 || Core Judgements"
panel_title: "从即兴 maker 到自动化与持续改进的企业平台 — 适配分层创新的治理模型。 || From ad hoc makers to automated, continuously improved platforms — governance model for layered innovation."
panel:
  - "不同成熟度的企业，应执行同一治理框架中的不同最小子集。 || Different maturity tiers run different minimum subsets of the same governance framework."
  - "治理强度应由业务影响、数据敏感度、跨部门耦合与运营成本共同决定。 || Governance rigor should be set by business impact, data sensitivity, cross-team coupling, and operating cost."
  - "治理基线必须先于交付定型，事后追补的代价远高于一次性前置。 || Set the governance baseline before delivery starts — retrofitting costs far exceed an up-front lock-in."
  - "6 个角色组按 ALM 7 阶段编排 Driver 与交接，配合才能转化为交付节奏。 || Align the six role groups to ALM's seven stages with explicit Drivers and hand-offs — coordination then becomes delivery cadence."
metrics:
  - "角色组 || Role Groups | 6 | 战略 · 治理 · 赋能 · 开发 · 数据/AI · 终端用户 || Strategic · Governance · Enablement · Dev · Data/AI · End Users"
  - "ALM 阶段 || ALM Stages | 7 | 受理 → 立项 → 适配 → 设计 → 交付 → 切换 → 运营，对应 6 个微软角色组 || Intake → Frame → Fit → Design → Deliver → Cutover → Operate; mapped to six Microsoft role groups"
  - "交付任务 || Delivery Tasks | 17 | T1 受理 → T17 稳态运营，每项含负责人与产物 || T1 intake → T17 steady-state ops, each with owner and artifact"
  - "成熟度档位 || Maturity Tiers | 4 | L100 即兴 · L200 复用 · L300 CoE · L400–500 战略平台 || L100 ad hoc · L200 repeatable · L300 CoE · L400–500 strategic"
style:
  accent: "#8b5cf6"
---

## #org 01 / Organization Model :: 治理参与方的 6 个角色组 || The Six Role Groups That Govern Power Platform

后文用到的 11 个 ALM 责任角色直接提取自微软 [《Define roles and responsibilities》](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/roles)归纳的 6 个角色组中与项目交付直接相关的成员，而非另起一套体系。这里先对照微软官方文档锚定 6 个组的职责与协作关系，后续所有角色名、组颜色标签与 RACI 均建立在该组织模型之上。 || The 11 ALM responsibility roles used later are drawn directly from the delivery-relevant members of the six groups Microsoft defines in [Define roles and responsibilities](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/roles), rather than inventing a separate taxonomy. Anchoring the six groups and their relationships first provides the foundation for every later role name, group-color tag, and RACI cell.

组 1 · 战略与高管 || Group 1 · Strategic & Executive

### 设定方向、对齐战略、批准投入 || Set direction, align strategy, approve investment

Power Platform product owner、Leadership / Executives、Change management、Business analysts、Project management office。授权下面四组开展工作，对业务价值与合规风险负责。 || Power Platform product owner, Leadership / Executives, Change management, Business analysts, Project management office. They authorize the four operational groups below and own business value and compliance risk.

▼

组 2 · 管理与治理 || Group 2 · Administration & Governance

### 守护租户健康与合规底线 || Guard tenant health and the compliance baseline

Power Platform admins、Power Platform environment admins、Information governance、Information security & compliance。负责环境、容量、DLP、安全监控与合规审计。 || Power Platform admins, Power Platform environment admins, Information governance, Information security & compliance. They run environments, capacity, DLP, security monitoring, and compliance audits.

组 3 · 支持与赋能 || Group 3 · Support & Enablement

### 降低 maker 上手成本，承接日常支持 || Lower maker onboarding cost; handle day-to-day support

Community & enablement leads（含 CoE）、IT operations 支持、Azure 服务管理员、Microsoft 365 admin、其他服务管理员。培训、社区、L1 / L2 支持与跨服务协同。 || Community & enablement leads (including CoE), IT operations support, Azure service administrator, Microsoft 365 admin, other service admins. Training, community, L1 / L2 support, and cross-service coordination.

组 4 · 开发与架构 || Group 4 · Development & Architecture

### 把需求变成可上线、可维护的方案 || Turn requirements into deployable, maintainable solutions

Makers（公民到专业开发者）、DevOps engineer、Enterprise architects、Solution architects。负责具体交付：方案设计、构建、ALM 流水线与企业系统集成。 || Makers (citizen to pro-dev), DevOps engineer, Enterprise architects, Solution architects. They deliver: design, build, ALM pipelines, and integration with enterprise systems.

组 5 · 数据与 AI || Group 5 · Data & AI

### 数据质量、AI 战略与负责任 AI || Data quality, AI strategy, and responsible AI

Data stewards、AI strategist、Ethics officer。制定数据治理策略，把 AI 用例与业务目标对齐，并完成 AI 伦理与合规评估。 || Data stewards, AI strategist, Ethics officer. They set data governance policy, align AI use cases with business goals, and own AI ethics & compliance reviews.

▼

组 6 · 终端用户 || Group 6 · End Users

### 使用产出的解决方案产生业务价值并提供反馈 || Use the delivered solutions to generate business value and provide feedback

日常使用 Power Platform 解决方案的业务用户。其使用率与反馈是上面五组工作是否有效的最终衡量。 || Business users who consume Power Platform solutions day-to-day. Their adoption rate and feedback are the final measure of whether the five groups above are doing their job.

**三条关系规则：**(1) *战略组*授权 + 接收价值与风险报告，不直接执行；(2) 中间四组并行运作 — *管理与治理*给其它三组划边界（环境、DLP、容量），*支持与赋能*把规则翻译成 maker 可用的训练与模板，*开发与架构*负责落地交付，*数据与 AI*在涉及数据 / AI 的方案中横向参与；(3) *终端用户*反馈回流到战略组，触发下一轮投入决策。 || **Three relationship rules:** (1) the *Strategic* group authorizes and receives value / risk reports — it does not execute; (2) the four operational groups run in parallel — *Admin & Governance* draws the boundaries (environments, DLP, capacity), *Support & Enablement* translates rules into maker-ready training and templates, *Dev & Architecture* ships solutions, and *Data & AI* participates horizontally whenever data / AI is in scope; (3) *End User* feedback flows back to the Strategic group and triggers the next investment cycle.

:::accordion
::panel
### 角色图例 · 全篇通用的角色标签定义 || Role Legend · role label definitions used across the guide
后文出现的 13 个角色与组颜色标签覆盖微软全部 6 个角色组。组 1–4 在 ALM 任务里担任主责人或协同人；组 5（数据与 AI）不担任 ALM 交付的 owner，但在 Qualify / Design / Build & Test / Operate 4 个阶段以 Contributor 形式横向参与；组 6（终端用户）参与用户场景输入与 UAT。下表汇总了各实操角色到微软 6 组的映射关系。 || The 13 roles and group-color tags used later cover all six Microsoft role groups. Groups 1–4 drive or contribute to ALM tasks; Group 5 (Data & AI) does not own ALM delivery but joins as a Contributor across four stages (Qualify, Design, Build & Test, Operate); Group 6 (End Users) provides user context and UAT. The table maps each operational role to the six Microsoft groups.

| 实操角色 || Operational role | 组颜色标签 || Group color tag | 角色组 || Role group |
| --- | --- | --- |
| 高管发起人 / 产品负责人 || Executive sponsor / Product owner | 战略与高管 || Strategic & Executive | 1 · 战略与高管 || 1 · Strategic & Executive |
| 业务分析师 / SME || Business analyst / SME | 战略与高管 || Strategic & Executive | 1 · 战略与高管 || 1 · Strategic & Executive |
| CoE 负责人 || CoE lead | 支持与赋能 || Support & Enablement | 3 · 支持与赋能 || 3 · Support & Enablement |
| 方案 / 企业架构师 || Solution / Enterprise architect | 开发与架构 || Development & Architecture | 4 · 开发与架构 || 4 · Development & Architecture |
| Power Platform 管理员 || Power Platform admin | 管理与治理 || Administration & Governance | 2 · 管理与治理 || 2 · Administration & Governance |
| 身份管理员（Entra） || Identity admin (Entra) | 管理与治理 || Administration & Governance | 2 · 管理与治理 || 2 · Administration & Governance |
| 信息安全与合规 || Information security & compliance | 管理与治理 || Administration & Governance | 2 · 管理与治理 || 2 · Administration & Governance |
| Maker（公民 → 专业开发者） || Maker (citizen → pro-dev) | 开发与架构 || Development & Architecture | 4 · 开发与架构 || 4 · Development & Architecture |
| DevOps 工程师 || DevOps engineer | 开发与架构 || Development & Architecture | 4 · 开发与架构 || 4 · Development & Architecture |
| 数据管家（Data steward） || Data steward | 数据与 AI || Data & AI | 5 · 数据与 AI || 5 · Data & AI |
| AI 策略师 / 伦理官 || AI strategist / Ethics officer | 数据与 AI || Data & AI | 5 · 数据与 AI || 5 · Data & AI |
| IT 运维 / 支持 || IT operations / support | 支持与赋能 || Support & Enablement | 3 · 支持与赋能 || 3 · Support & Enablement |
| 最终用户 || End users | 终端用户 || End Users | 6 · 终端用户 || 6 · End Users |

> Define roles and responsibilities — Role clarity
:::

## #basics 02 / Foundations :: 容器层级与角色对应 — 谁在哪里管什么 || Container Hierarchy & Role Mapping — Who Manages What, Where

后续所有许可、环境拓扑、DLP 与签核决策都建立在同一个三层容器模型之上。每一层有自己的边界与配置入口，对应的角色也只在该层生效 — 跨层授权既不会发生，也不能省略。 || Every subsequent licensing, environment, DLP, and approval decision sits on the same three-layer container model. Each layer has its own boundary and admin surface, and the matching roles only take effect at that layer — cross-layer authority neither cascades automatically nor can it be skipped.

### 1. 租户 — Microsoft Entra ID 身份边界 || 1. Tenant — the Microsoft Entra ID identity boundary

组织的身份边界。所有 Power Platform 资源都驻留在租户内；跨环境治理动作（环境创建、租户 DLP、容量配额、Managed Environments）在这一层完成。 || The organization's identity perimeter. All Power Platform resources live inside it; every cross-environment governance action (env creation, tenant DLP, capacity quotas, Managed Environments) happens at this layer.

5 个 Entra 管理角色 ▾ || 5 Entra Admin Roles ▾

▼

### 2. 环境 — 隔离与治理边界 || 2. Environment — the isolation & governance boundary

区域型容器，承载应用、流、连接器、网关与可选 Dataverse。资源不跨环境读取；DLP、容量、访问角色都在单个环境内生效。 || A regional container holding apps, flows, connectors, gateways, and optionally Dataverse. Resources never leak across environments; DLP, capacity, and access roles are scoped here.

2 个环境角色 ▾ || 2 Environment Roles ▾

▼

### 3. Dataverse — 环境内的数据存储 || 3. Dataverse — the in-environment data store

可选的环境内云关系型数据库。启用后在环境访问之上叠加表/列/记录级安全角色 — 没有 Dataverse 角色就读不到表数据。 || An optional in-environment cloud relational database. When present, it layers table / column / record-level security roles on top of environment access — without a Dataverse role, table data is unreadable.

2 ALM + 5 工作负载管理角色 ▾ || 2 ALM + 5 Workload-Admin Roles ▾

**记住三条规则：**(1) 三个容器是物理边界，资源不会自动跨层；(2) 上一层的角色不会自动赋予下一层 — 给某人 *Environment Admin* 并不让他能读 Dataverse 数据；(3) 任何角色都从一个明确的管理入口分配，绕过入口的“直接授权”不存在。 || **Three rules to remember:** (1) the three containers are physical boundaries — resources do not cascade; (2) a role at one layer never extends to the next — granting *Environment Admin* does not unlock Dataverse data; (3) every role is assigned from a specific admin surface — there is no ‘direct grant’ that bypasses it.

:::accordion
::panel
### 租户层 · 5 个 Entra 管理角色 || Tenant Layer · 5 Entra Admin Roles
下列 **5 个 Entra 内置角色**是 ALM 的硬关卡 — 缺任意一个，端到端流水线（创建环境、注册服务主体、分配角色、发许可、维护安全组）都会卡壳。本页是第 1 组：平台运营、ALM 服务主体、角色授予三道访问关卡。第 2 组（许可与用户）与条件性角色见下一页。 || The **five Entra built-in roles** below are the hard gates for ALM — without any one of them, the end-to-end pipeline (provision environment, register service principal, grant roles, assign licenses, maintain security groups) cannot complete. Group 1 covers platform operations, ALM service principals, and role-grant approval. Group 2 (licensing / users) plus conditional roles is on the next page.

环境 · DLP · 容量 || Environments · DLP · capacity

**Power Platform Administrator**

日常平台运营角色。在 PPAC 管理所有环境、租户 DLP、容量分配（Dataverse / Copilot Credits / AI Builder / Power Pages logins）、Managed Environments、Copilot Studio 租户开关、Power Pages 站点治理、Power Platform Pipelines。**不**覆盖 Power BI / Fabric 租户设置，也不含 M365 用户与许可管理。 || The day-to-day platform operations role. From PPAC, manages every environment, tenant DLP, capacity allocation (Dataverse / Copilot Credits / AI Builder / Power Pages logins), Managed Environments, Copilot Studio tenant switches, Power Pages site governance, and Power Platform Pipelines. Does **not** cover Power BI / Fabric tenant settings, nor M365 user or license management.

可访问管理中心 || Admin portals

Power Platform admin center (PPAC)

Microsoft 365 admin center &rsaquo; Service health

ALM · 云端服务主体 || ALM · cloud service principals

**Cloud Application Administrator**

管理 Microsoft Entra 应用注册与服务主体（不含 on-prem Application Proxy）。ALM 流水线（Power Platform CLI、GitHub Actions、Azure DevOps、Power Platform Build Tools）的 S2S 凭据由它创建、轮换、停用；Copilot Studio agent 发布到 Teams 渠道时的 bot channel 注册也走这条路径。云端 ALM 的最小权限首选 — 优于 Application Administrator。 || Manages Microsoft Entra app registrations and service principals (no on-premises Application Proxy). Creates, rotates, and disables the S2S credentials used by ALM pipelines (Power Platform CLI, GitHub Actions, Azure DevOps, Power Platform Build Tools); also handles bot channel registration when Copilot Studio agents publish to Teams. Preferred least-privilege option for cloud-only ALM — chosen over Application Administrator.

可访问管理中心 || Admin portals

Microsoft Entra admin center › App registrations

Entra › Enterprise applications

Azure portal › Microsoft Entra ID

角色授予的网关 || Role-grant gatekeeper

**Privileged Role Administrator**

授予上述任一管理角色都必须经过此角色（或 Global Administrator）。它本身不操作 Power Platform 资源，但任何角色分配审批流必须经由它 — PIM 启用、审计与权限变更的必要节点。 || Required to grant any of the admin roles above (alongside Global Administrator). It does not act on Power Platform resources directly, but every role-assignment approval flow runs through it — the mandatory node for PIM enrolment, audit, and privilege change.

可访问管理中心 || Admin portals

Microsoft Entra admin center › Roles & admins

Entra › Privileged Identity Management (PIM)

第 2 组（许可 + 用户）补齐发证与账号侧的硬关卡；末尾汇总条件性与应急角色，按触发条件追加而不进入 ALM 基线。 || Group 2 (licensing + users) closes the seat-issuance and account side of the baseline gate; the footnote summarises conditional & break-glass roles that are added only when their trigger applies and are not part of the ALM baseline.

席位许可 || Seat licensing

**License Administrator**

只负责许可：分配、移除、重新分配 Power Apps / Power Automate / Power Pages / Copilot Studio / Power BI 等席位，以及 Copilot Credit 预付包订阅。不能创建环境、不能改 DLP、不能管理容量分配。 || License-only role: assign, remove, and reassign Power Apps / Power Automate / Power Pages / Copilot Studio / Power BI seats, plus Copilot Credit prepaid pack subscriptions. Cannot create environments, change DLP, or manage capacity allocation.

可访问管理中心 || Admin portals

Microsoft 365 admin center › Billing › Licenses

Microsoft Entra admin center › Billing

用户与安全组 || Users & security groups

**User Administrator**

负责用户与安全组：创建/禁用账号、重置密码、维护用于环境绑定与 Dataverse 角色分配的安全组。不涉及许可与环境配置，但所有 Power Platform 授权链都依赖它维护的对象。 || Owns users and security groups: create/disable accounts, reset passwords, maintain the security groups used to bind environments and assign Dataverse roles. No license or environment authority, but every Power Platform authorization chain depends on the objects this role maintains.

可访问管理中心 || Admin portals

Microsoft 365 admin center › Users

M365 › Teams & groups

Microsoft Entra admin center › Users

Entra › Groups

:::accordion
::panel
### 条件性与应急角色（按触发条件追加） || Conditional & Break-Glass Roles (Trigger-Based Add-Ons)
> **Conditional & break-glass roles — assigned only when the trigger applies, not part of the baseline ALM gate.**

> **Global Administrator**
> Global Administrator
> 
> — break-glass only (2–4 named owners + MFA + PIM JIT elevation), never a daily operations role.
> Dynamics 365 Administrator
> 
> — legacy alias of Power Platform Administrator, retained for D365-first orgs.
> Application Administrator
> 
> — use only if the ALM pipeline still needs on-premises Application Proxy; otherwise Cloud Application Administrator covers the same surface with less privilege.
> Fabric Administrator
> 
> — required when solutions ship Power BI / Fabric assets (workspaces, datasets, reports).
> AI Administrator
> 
> — required to approve and publish agents to Microsoft 365 Copilot Chat from the M365 admin center (Integrated apps).
> AI Reader
> 
> — read-only audit / governance committee access to M365 Copilot & AI service settings.
> Security Administrator
> 
> — required when Conditional Access policies gate Power Platform sign-in or block service principal authentication.
:::

::panel
### 环境层 · 2 个角色 || Environment Layer · 2 Roles
环境内只有 2 个核心角色：**Environment Admin** 管理本环境的设置与角色分配，**Environment Maker** 在环境内创建应用与流。 || Only two core roles inside an environment: **Environment Admin** manages settings & role assignment, **Environment Maker** authors apps & flows.

环境生命周期 · 访问 · 环境级 DLP || Environment lifecycle · access · env-scoped DLP

**Environment Admin**

单个环境的最高权限：管理环境设置、分配环境角色、维护环境级 DLP 策略、回收环境资源。**在带 Dataverse 的环境中会自动映射为 Dataverse System Administrator**（所有表的完整数据权限）；仅在无 Dataverse 的环境里才退化为纯平台权限。租户级 DLP 仍由 Power Platform Administrator 在 PPAC 维护。 || Full control of one environment: manage settings, assign environment roles, author environment-scoped DLP policies, and reclaim resources. **In an environment with Dataverse, this role is automatically mapped to the Dataverse System Administrator role** (full access to every table); only in Dataverse-less environments does it stay limited to platform settings. Tenant-wide DLP remains owned by Power Platform Administrator in PPAC.

主要工作面 || Primary surfaces

PPAC &rsaquo; Environments &rsaquo; Settings

PPAC &rsaquo; Users + permissions

PPAC &rsaquo; Security

PPAC &rsaquo; DLP policies (env scope)

PPAC &rsaquo; Capacity

PPAC &rsaquo; Resources

App / Flow / Agent 创作 || App / flow / agent authoring

**Environment Maker**

制作者角色：在环境内创建应用、流、自定义连接器与解决方案。不能管理环境、不能授权他人；在带 Dataverse 的环境中会获得 Dataverse Environment Maker 安全角色（可创建解决方案与自定义组件，但不附带业务表数据访问）。 || Builder role: create apps, flows, custom connectors, and solutions inside the environment. Cannot administer the environment or grant roles; in an environment with Dataverse, it is mapped to the Dataverse Environment Maker security role (can author solutions and custom components but does **not** bring business-table data access).

主要工作面 || Primary surfaces

make.powerapps.com

make.powerautomate.com

copilotstudio.microsoft.com

make.powerpages.microsoft.com

::panel
### Dataverse 层 · 2 ALM + 5 工作负载管理角色 || Dataverse Layer · 2 ALM + 5 Workload-Admin Roles
环境创建时决定是否启用的云关系型数据库。一旦启用，就在环境访问之上叠加一层独立的安全角色（表 + 列 + 记录级别）；没有 Dataverse 角色就读不到表数据。本层角色分两类：(A) Dataverse **预置**的 ALM 必备角色，决定能否导入解决方案、跑 Pipelines、维护安全模型；(B) 工作负载启用时**追加**的应用域管理角色，与具体项目实施挂钩，但不参与解决方案部署。面向业务用户的 Basic User / App Opener 与自定义业务角色不在本层范围。 || An optional cloud relational database decided at environment creation time. When present, it layers its own security roles (table + column + record level) on top of environment access — without a Dataverse role, table data is unreadable. The roles here split into two groups: (A) Dataverse **predefined** roles required for ALM — solution import, Pipelines, security-model maintenance; (B) workload-specific admin roles **installed** with an app — relevant to a project's runtime, but not part of solution deployment. End-user roles such as Basic User / App Opener and custom business roles are out of scope here.

**A · ALM 角色 || A · ALM roles**

解决方案导入/导出、Pipelines、environment variables、connection references、安全角色编辑 — 自动化账号 (service principal) 必须持有下面两个之一（多数场景是 System Administrator）。 || Solution import/export, Pipelines, environment variables, connection references, security-role edits — the automation account (service principal) must hold one of the two below (System Administrator in most pipelines).

ALM 总闸 · 全表全动作 || ALM master gate · all tables · all actions

**System Administrator**

环境内最高 Dataverse 权限：所有表、所有动作、组织级访问，并可创建/编辑安全角色与业务部门。Power Platform Pipelines、PAC CLI、Build Tools 的部署账号默认要求此角色。仅用于平台运维与应急 — 不要分配给业务用户。 || Top Dataverse privilege inside the environment: every table, every action, organization-level access, plus the ability to create and edit security roles and business units. Power Platform Pipelines, PAC CLI, and Build Tools deployment accounts default to requiring this role. Reserve for platform operations and break-glass — never assign to business users.

主要工作面 || Primary surfaces

PPAC &rsaquo; Environment &rsaquo; Settings &rsaquo; Security roles

PPAC &rsaquo; Environment &rsaquo; Users + permissions

Pipelines / PAC CLI / Build Tools (service principal)

架构定制 · 不含业务数据 || Schema customization · no business data

**System Customizer**

架构定制管理角色：可创建/修改表、列、关系、表单、视图、解决方案，但**不**自动获得业务数据访问。配合 Environment Maker 给定制者授权，无需放开数据；也是构建最小权限 ALM 部署账号（"Deployment User"）的常用起点。 || Schema / solution customization admin: create or change tables, columns, relationships, forms, views, and solutions, but does **not** grant access to business data. Pair with Environment Maker so customizers can build without unlocking data; also the common starting point when building a least-privilege ALM "Deployment User" role.

主要工作面 || Primary surfaces

PPAC &rsaquo; Environment &rsaquo; Settings &rsaquo; Security roles

make.powerapps.com &rsaquo; Solutions

**B · Workload admin 角色 || B · Workload admin roles**

启用相应应用 (Approvals / Dynamics 365 Conversation Intelligence / Power Automate Desktop / Copilot Studio / Fabric & Power BI) 时自动出现于本环境，治理对应应用的运行时数据：审批流配置、RPA 机器纳管、agent 发布、BI 工作区联动等。下列名称来自 PPAC &rsaquo; Environment &rsaquo; Settings &rsaquo; Security roles 中以 "Admin" 过滤的真实条目。 || Provisioned in the environment when the matching workload is enabled (Approvals / Dynamics 365 Conversation Intelligence / Power Automate Desktop / Copilot Studio / Fabric & Power BI). They govern that workload's runtime data: approval template config, RPA machine onboarding, agent publishing, BI workspace linkage. Names below come from a real PPAC &rsaquo; Environment &rsaquo; Settings &rsaquo; Security roles list filtered by "admin".

审批运行时治理 || Approvals runtime

**Approvals Administrator**

Power Automate Approvals 应用启用时追加。管理审批模板、运行时审批记录、重新指派、清理孤儿审批；具备读写 `flow_approval` / `flow_approvalrequest` 等审批表的权限。**不**影响解决方案打包，也不能管环境。 || Added when Power Automate Approvals is enabled in the environment. Manages approval templates, runtime approval records, reassignments, and orphan cleanup; read/write on the `flow_approval` / `flow_approvalrequest` tables. **Does not** affect solution packaging or environment administration.

主要工作面 || Primary surfaces

Power Automate &rsaquo; Action items &rsaquo; Approvals

make.powerautomate.com &rsaquo; Admin (Approvals settings)

对话/呼叫智能模块 || Conversation / call intelligence

**CCI admin**

Dynamics 365 Sales 或 Customer Service 启用 Conversation Intelligence / 呼叫智能模块时追加（CCI = Customer / Conversation Intelligence）。管理通话录音、转写、KPI、关键词触发；仅在装了对应 D365 SKU 的环境中存在。不参与 ALM。 || Added when Conversation Intelligence (a.k.a. CCI — Customer / Conversation Intelligence) is enabled in Dynamics 365 Sales or Customer Service. Manages call recordings, transcripts, KPIs, and keyword triggers; exists only in environments that have the matching D365 SKU. Not involved in ALM.

主要工作面 || Primary surfaces

D365 Sales Hub &rsaquo; Conversation intelligence

Customer Service workspace &rsaquo; Conversation intelligence

RPA 机器与机器组 || RPA machines & groups

**Desktop Flow Machine Configuration Admin**

启用 Power Automate Desktop（RPA）后追加。管理本环境内 unattended / attended 机器注册、机器组、共享凭据、机器分配策略；**不**含 Desktop flow 本身的编写或运行权限。解决方案内 Desktop flow 的部署仍由 System Administrator/Customizer 完成。 || Added when Power Automate Desktop (RPA) is enabled. Manages unattended / attended machine registration, machine groups, shared credentials, and assignment policies in this environment; **does not** grant authoring or run rights on the Desktop flows themselves. Deployment of Desktop flows inside a solution still goes through System Administrator / Customizer.

主要工作面 || Primary surfaces

Power Automate &rsaquo; Monitor &rsaquo; Machines

Power Automate &rsaquo; Monitor &rsaquo; Machine groups

agent 运行时治理 || Agent runtime governance

**Microsoft Copilot Administrator**

启用 Copilot Studio 后追加（亦称 Copilot Studio Administrator）。管理本环境内 agent 的发布、共享、Knowledge sources、analytics、生成式应答开关；agent 解决方案的导入/导出仍归 System Administrator/Customizer，渠道发布到 Teams / M365 Copilot Chat 还需 tenant 层 Cloud Application Admin / AI Administrator 配合。 || Added when Copilot Studio is enabled (a.k.a. Copilot Studio Administrator). Manages agent publishing, sharing, knowledge sources, analytics, and generative answers in this environment; solution import/export of agents still requires System Administrator / Customizer, and channel publishing to Teams / M365 Copilot Chat still needs tenant-level Cloud Application Admin / AI Administrator.

主要工作面 || Primary surfaces

copilotstudio.microsoft.com &rsaquo; Agents

PPAC &rsaquo; Environment &rsaquo; Copilot Studio

Power BI 工作区联动 || Power BI workspace linkage

**Power BI workspace admin**

Fabric / Power BI 与本 Dataverse 环境集成时追加。管理 Dataverse 内由 BI workspace 联动产生的工件（dataset link、报表权限、Dataverse → Power BI 导出）；**Fabric workspace / capacity 本身**的治理仍在 Fabric admin portal 由 Fabric Administrator 负责。 || Added when Fabric / Power BI integrates with this Dataverse environment. Manages the Dataverse-side artifacts created by that linkage (dataset link, report permissions, Dataverse → Power BI export); the **Fabric workspace / capacity** itself is still governed in the Fabric admin portal by the Fabric Administrator.

主要工作面 || Primary surfaces

PPAC &rsaquo; Environment &rsaquo; Power BI

app.powerbi.com (workspace owner)

> **Note:**
> not a Dataverse security role
:::

:::callout { title: "关键洞察 || Key Insight" }
Environments overview Environment roles Predefined Dataverse security roles Security role privileges Tenant-level permissions Entra built-in roles reference Copilot Studio admin & security roles Power Platform service admin roles Fabric administration overview Fabric admin roles Power Pages admin roles Service principal authentication for Power Platform
:::

## #lifecycle 03 / End-to-End Project Process :: 在地图上找到你的角色 — 每个参与者在 ALM 每一阶段该做什么 || Find Your Role on the Map — What Every Player Does at Each ALM Stage

一张图、三个阶段、七个 ALM 环节，每项 IT 任务各归其位。纵向色带表示你处于 [Power Platform ALM](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) 的哪个阶段；中间卡片命名该环节与主责人；右侧胶囊列出具体任务（按微软角色组色标识，并链接到详解章节）；右侧色带点名本阶段唯一的归属人。角色遵循微软 [采纳角色指南](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/roles)。 || One picture, three phases, seven ALM stages, every IT task in its place. The vertical band tells you which phase of [Power Platform ALM](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) you're in; the central card names the stage and its driver; the pills on the right list the concrete tasks (color-coded by Microsoft role group, each linked to the chapter that explains how to do it); the band on the right calls out the single role who owns the stage. Roles follow the Microsoft [adoption roles guidance](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/roles).

### 每个 ALM 阶段谁会出现 || Who Shows Up at Each ALM Stage

每个阶段一个主责人（填充单元格），加上围绕他们的协同者（淺色单元格）。用这张图定位你的行，再跳到阶段卡片查看具体任务。 || One driver per stage (filled cell) plus the contributors who orbit around them (tinted cell). Use this slide to spot your row, then jump to the phase slides for the actual tasks.

| — | 发现 || Discover | 设计 || Design | 交付 || Deliver |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 角色行 || Role row | 1需求与受理 || 1Idea & Intake | 2评估与规划 || 2Qualify & Plan | 3设计与审批 || 3Design & Approve | 4环境创建 || 4Provision | 5开发与测试 || 5Build & Test | 6部署与发布 || 6Deploy & Release | 7运营与优化 || 7Operate & Improve |
| 战略与高管 （发起人 / BA） || Strategic & Executive (Sponsor / BA) | 界定问题 || Define problem | 判决是否推进 || Go/No-go | — | 预算 || Budget | UAT 验收 || UAT sign-off | — | ROI 复盘 || ROI review |
| 数据与 AI （Data steward / AI strategist / Ethics officer） || Data & AI (Data steward / AI strategist / Ethics officer) | — | 数据策略起草 || Set data policy | Responsible AI 评审 || Responsible AI review | — | 数据质量与 AI 输出抽检 || Data quality & AI sign-off | — | 监控 AI 使用与数据合规 || Monitor AI usage & data hygiene |
| 支持与赋能 （CoE） || Support & Enablement (CoE) | 受理 || Intake | 平台适配性判断 || Fit-for-platform | 审批 || Approve | — | — | 培训 || Train | 采纳 KPI || KPIs |
| 开发与架构 （解决方案架构师） || Development & Architecture (Solution architect) | — | 选型产品 || Pick product | 设计 Dataverse 模型 || Model Dataverse | — | 验证设计 || Verify design | — | — |
| 管理与治理 （Power Platform 管理员 / Entra 身份管理员 / 安全） || Administration & Governance (Power Platform Admin / Identity admin / Sec) | — | 成本与 DLP 范围 || Cost & DLP scope | DLP 例外 || DLP exceptions | 预置 Dev/Test/Prod 环境 || Provision Dev/Test/Prod | — | 最终 DLP 与调优 || Final DLP & tune | 监控容量 || Monitor capacity |
| 开发与架构 （Maker / DevOps） || Development & Architecture (Maker / DevOps) | — | — | 规划 ALM 布局 || ALM layout | — | 在 Dev 环境开发 || Build in Dev | 发布到 Prod || Promote to Prod | 修复缺陷 || Bug fixes |
| 支持与赋能 （IT 运维） || Support & Enablement (IT Ops) | — | — | — | — | — | 切换上线 || Cut-over | 处理工单 || Handle tickets |
| 终端用户 （业务使用者） || End Users (Business users) | 用户场景输入 || User context | — | — | — | 执行 UAT || UAT runs | — | — |

图例 || Key

填充单元格 — 本阶段该角色担当主责人的任务 || Filled cell — the driver task that role owns this stage

淺色单元格 — 协同任务 || Tinted cell — contributing task

空白 — 本阶段不参与 || Empty — not involved at this stage

发现 || Discover

决定要做什么 || Decide what to build

1. 1 需求与受理 || Idea & Intake 收集请求并重新界定问题。 || Capture the request and frame the problem. 主责人 || Driver 业务分析师 / SME || Business analyst / SME
  - 通过 CoE 受理表单提交 CoE→&sect;05.1 || Submit through CoE intake form CoE→&sect;05.1
  - 说清问题陈述 Business analyst→&sect;05.2 || Define problem statement Business analyst→&sect;05.2
  - 设定成功指标 Business analyst→&sect;05.2 || Set success metric Business analyst→&sect;05.2
  - 收集最终用户场景 End users→&sect;05.2 || Gather end-user context End users→&sect;05.2
  - 确认发起人 Sponsor→&sect;05.2 || Confirm sponsor Sponsor→&sect;05.2
2. 2 评估与规划 || Qualify & Plan 决定是否建、如何建。 || Decide if and how to build it. 主责人 || Driver CoE 负责人 || CoE lead
  - 平台适配性检查 CoE→&sect;05.3 || Fit-for-platform check CoE→&sect;05.3
  - 选型 PP 产品 Architect→&sect;05.3 || Pick PP product Architect→&sect;05.3
  - 许可与成本估算 Power Platform 管理员→&sect;05.4 || Estimate licenses & cost Power Platform Admin→&sect;05.4
  - 起草环境方案 Power Platform 管理员→&sect;05.5 || Sketch environment plan Power Platform Admin→&sect;05.5
  - 划定 DLP 与数据敏感度 Sec & compliance→&sect;05.5 || Scope DLP & data sensitivity Sec & compliance→&sect;05.5
  - 起草数据策略 Data steward→&sect;05.5 || Set data policy strategy Data steward→&sect;05.5
  - Go / No-go 决策门 Sponsor→&sect;05.6 || Go / no-go gate Sponsor→&sect;05.6

设计 || Design

架构与审批 || Architect & approve

1. 3 设计与审批 || Design & Approve 锁定数据模型、环境拓扑、ALM 与 DLP 方案。 || Lock the data model, env topology, ALM & DLP plan. 主责人 || Driver 解决方案架构师 || Solution architect
  - 设计 Dataverse 模型 Architect→&sect;06.1 || Model Dataverse Architect→&sect;06.1
  - 设计环境拓扑 Architect→&sect;06.2 || Design env topology Architect→&sect;06.2
  - 规划 ALM 解决方案布局 DevOps→&sect;06.3 || Plan ALM solution layout DevOps→&sect;06.3
  - 列出 DLP 例外 Sec & compliance→&sect;06.4 || List DLP exceptions Sec & compliance→&sect;06.4
  - 制定 Dataverse 角色方案 Architect→&sect;06.5 || Define Dataverse role plan Architect→&sect;06.5
  - 审批设计 CoE→&sect;06.6 || Approve design CoE→&sect;06.6
  - Responsible AI 评审 Ethics officer→&sect;06.6 || Responsible AI review Ethics officer→&sect;06.6

交付 || Deliver

构建 · 发布 · 运营 || Build · ship · run

1. 4 环境创建 || Provision 搭起项目要用的平台基础设施。 || Stand up the platform plumbing the project will use. 主责人 || Driver Power Platform 管理员 || Power Platform admin
  - 创建 Dev / Test / Prod 环境 Power Platform 管理员→&sect;07.1 || Create Dev / Test / Prod Power Platform Admin→&sect;07.1
  - 分配 Dataverse 容量 Power Platform 管理员→&sect;07.1 || Allocate Dataverse capacity Power Platform Admin→&sect;07.1
  - 分配用户许可 License Admin→&sect;07.2 || Assign user licenses License Admin→&sect;07.2
  - 绑定安全组 User Admin→&sect;07.2 || Bind security groups User Admin→&sect;07.2
  - 下发 DLP 策略 Power Platform 管理员→&sect;07.2 || Apply DLP policies Power Platform Admin→&sect;07.2
  - 释放预算 Sponsor→&sect;05.6 || Release budget Sponsor→&sect;05.6
2. 5 开发与测试 || Build & Test 在 Dev 开发、在 Test 以托管解决方案验证。 || Build in Dev, validate in Test as a managed solution. 主责人 || Driver Maker
  - 在 Dev 构建应用 / 流 / 代理 Maker→&sect;07.3 || Build app / flow / agent in Dev Maker→&sect;07.3
  - 配置 Dataverse 角色 Architect→&sect;07.3 || Configure Dataverse roles Architect→&sect;07.3
  - 搭建 CI/CD 管道 DevOps→&sect;07.3 || Set up CI/CD pipeline DevOps→&sect;07.3
  - 执行 UAT End users→&sect;07.3 || Run UAT End users→&sect;07.3
  - 按设计验证 Architect→&sect;07.3 || Verify against design Architect→&sect;07.3
  - 数据质量与 AI 输出抽检 Data steward→&sect;07.3 || Data quality & AI output sign-off Data steward→&sect;07.3
3. 6 部署与发布 || Deploy & Release 通过管道发布到 Prod、培训、切换上线。 || Promote to Prod through pipelines, train, cut over. 主责人 || Driver DevOps 工程师 || DevOps engineer
  - 将托管解决方案发布到 Prod DevOps→&sect;07.4 || Promote managed solution to Prod DevOps→&sect;07.4
  - 最终 DLP 检查 Sec & compliance→&sect;07.4 || Final DLP check Sec & compliance→&sect;07.4
  - 培训与传达 CoE→&sect;07.4 || Train & communicate CoE→&sect;07.4
  - 切换最终用户 IT Ops→&sect;07.4 || Cut over end users IT Ops→&sect;07.4
  - 调优 Prod 环境设置 Power Platform 管理员→&sect;07.4 || Tune Prod env settings Power Platform Admin→&sect;07.4
4. 7 运营与优化 || Operate & Improve 监控、支持、修复、衡量 — 并反哺下一轮需求。 || Monitor, support, fix, measure — feeds the next intake. 主责人 || Driver Power Platform 管理员 || Power Platform admin
  - 监控容量与健康度 Power Platform 管理员→&sect;07.5 || Monitor capacity & health Power Platform Admin→&sect;07.5
  - 跟踪 DLP / 治理信号 Sec & compliance→&sect;07.5 || Watch DLP / governance signals Sec & compliance→&sect;07.5
  - 处理支持工单 IT Ops→&sect;07.5 || Handle support tickets IT Ops→&sect;07.5
  - 通过管道修复缺陷 Maker→&sect;07.5 || Fix bugs back through pipeline Maker→&sect;07.5
  - 跟踪采纳 KPI CoE→&sect;07.5 || Track adoption KPIs CoE→&sect;07.5
  - 复盘 ROI 并规划下一轮 Backlog Sponsor→&sect;07.5 || Re-evaluate ROI & plan next backlog Sponsor→&sect;07.5
  - 监控 AI 使用与数据合规 Data steward→&sect;07.5 || Monitor AI usage & data hygiene Data steward→&sect;07.5

:::callout { title: "关键洞察 || Key Insight" }
Define roles and responsibilities Establish a Power Platform Center of Excellence Power Platform adoption methodology Overview of ALM with Power Platform ALM basics Environment strategy for ALM Power Platform pipelines
:::

## #playbook 04 / Tailor ALM by Maturity :: 不是每个组织都要跑完 17 个任务：按成熟度裁剪 §03–&sect;07 || Not Every Org Runs All 17 Tasks: Tailor &sect;03–&sect;07 by Maturity

&sect;05–&sect;07 给出了一条 17 个任务的完整流水线，但 Microsoft 自己的 [Power Platform 采纳成熟度模型](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/maturity-model)（Level 100–500）承认：处于 Initial / Repeatable 阶段的组织没有人力、预算或制度去全部覆盖。此处将 17 个任务按 4 个成熟度档位映射为 **Must / Should / Optional / Defer**，并给出每个档位的进入与毕业判据，便于团队挑出最小可执行子集，并在能力提升后自然扩展。 || &sect;05–&sect;07 lay out the full 17-task pipeline, but Microsoft's own [Power Platform adoption maturity model](https://learn.microsoft.com/en-us/power-platform/guidance/adoption/maturity-model) (Level 100–500) acknowledges that orgs at Initial / Repeatable levels lack the headcount, budget, or process to run all of it. Mapping the 17 tasks across four maturity tiers as **Must / Should / Optional / Defer**, with entry and graduation criteria per tier, lets teams pick the smallest viable subset today and expand as capability grows.

●

必做（缺则项目无法上线） || Must — project blocks without it

◐

应做（跳过需书面理由） || Should — skip needs documented rationale

○

可选（视场景而定） || Optional — context-dependent

—

暂缓（本阶段不引入） || Defer — out of scope at this tier

L100 · 初始 || L100 · Initial

### 临时 Maker 阶段 || Ad Hoc Makers

组织画像：还没有 CoE，Maker 自发学习，绝大多数应用在 default 环境，几乎不付费 Premium，没有正式治理岗位。 || Org profile: no CoE yet; makers learn on their own; most apps live in the default environment; little to no Premium spend; no named governance role.

●

必做 || Must

- T2 · 一句话讲清问题、指标、发起人 || T2 · Frame problem, metric, sponsor
- T15 · 在 default 环境构建并让用户试用 || T15 · Build in default, end-user trial

◐

应做 || Should

- T1 · 用共享邮箱或表单做轻量受理 || T1 · Light intake (shared inbox / form)
- T3 · 用 Microsoft 决策树选 PP 产品 || T3 · Pick PP product via decision tree
- T4 · 估算许可成本（避免意外 Premium） || T4 · Estimate licenses (avoid surprise Premium)

○

可选 || Optional

- T13 · 创建一个 production 环境（脱离 default） || T13 · Provision a single named prod env
- T14 · 至少分配许可与基础 DLP || T14 · License + baseline DLP only

—

暂缓 || Defer

- T5–T12 全部设计阶段任务 || T5–T12 (full design phase)
- T16 正式管道发布（用 solution export 替代） || T16 formal pipelines (use solution export instead)

**毕业到 L200 的判据 || Graduate to L200 when** 活跃 Maker > 50，或第一个 Premium 应用进入生产，或出现一次数据外泄事件。 || Active makers > 50, OR first Premium app reaches production, OR a data-exposure incident has occurred.

L200 · 可重复 || L200 · Repeatable

### 局部治理阶段 || Repeatable Pockets

组织画像：已任命 PP 管理员，default 环境收紧到安全组，已有租户级 DLP 基线，CoE 正在筹建，关键业务部门各自有 Maker 小组。 || Org profile: a Power Platform Admin is named; the default env is tightened to a security group; a baseline tenant-wide DLP policy is in place; CoE is forming; lead BUs each have a maker pod.

●

必做 || Must

- T1–T4 全部 Discover 任务 || T1–T4 (full Discover phase)
- T13 · Dev + Prod 双环境（Test 可合并） || T13 · Dev + Prod (Test may fold into Dev)
- T14 · 完整许可 + 安全组 + DLP || T14 · Full licensing + groups + DLP
- T15 · 在 Dev 构建并跑 UAT || T15 · Build in Dev, run UAT
- T17 · 月度容量与采纳复盘 || T17 · Monthly capacity & adoption review

◐

应做 || Should

- T5 · 环境方案与 DLP 范围 || T5 · Environment plan & DLP scope
- T6 · 轻量 Go/No-Go（CoE 主持） || T6 · Light Go/No-Go (CoE-led)
- T8 · 环境拓扑蓝图 || T8 · Environment topology blueprint
- T10 · DLP 例外审批流 || T10 · DLP exception review
- T16 · 管道或托管解决方案导出 || T16 · Pipeline or managed-solution export

○

可选 || Optional

- T7 / T11 · 仅当使用 Dataverse || T7 / T11 · only if using Dataverse
- T9 · ALM 解决方案布局（手工编号即可） || T9 · ALM layout (manual numbering OK)

—

暂缓 || Defer

- T12 · 正式架构审批门（口头确认即可） || T12 · formal design sign-off (verbal OK)

**毕业到 L300 的判据 || Graduate to L300 when** CoE 正式宪章签署，且 Premium 生产应用 ≥ 3 个，且 DLP 已强制覆盖全租户。 || CoE charter is signed AND Premium production apps ≥ 3 AND DLP is enforced tenant-wide.

L300 · 已定义 || L300 · Defined

### 正式 CoE & ALM 阶段 || Formal CoE & ALM

组织画像：CoE 已有专职团队与宪章，Dev / Test / Prod 环境分层标准化，ALM 用 Power Platform Pipelines 或 ALM Accelerator，Managed Environments 已开启。 || Org profile: CoE is a dedicated team with a published charter; Dev / Test / Prod is standard; ALM uses Power Platform Pipelines or the ALM Accelerator; Managed Environments are turned on.

●

必做 || Must

- 全部 17 个任务（T1–T17）按 §03 地图执行 || All 17 tasks (T1–T17) per the §03 map
- 所有生产环境开启 Managed Environments || Managed Environments on every production env
- 部署 CoE Starter Kit 仪表板用于盘点 / 治理 / 培训 || CoE Starter Kit dashboards for inventory / governance / nurture

◐

应做 || Should

- 每个生产环境单独切分 Dataverse 容量配额 || Named Dataverse capacity slice per production env
- 共享解决方案与 Maker Champion 网络 || Shared solution library + Maker Champion network
- 季度 ROI & 采纳 KPI 复盘 || Quarterly ROI & adoption KPI review

○

可选 || Optional

- AI Builder / Copilot Studio 治理护栏 || AI Builder / Copilot Studio guardrails
- 跨地理位置的环境与数据驻留方案 || Cross-geo environment & data-residency planning

—

暂缓 || Defer

- 无 — 全部 17 任务已纳入本档位 || None — all 17 tasks in scope at this tier

**毕业到 L400 的判据 || Graduate to L400 when** ALM 管道 ≥ 5 个项目并发，且 Managed Environments 全量强制，且季度 ROI 进业务例会。 || ALM pipeline runs ≥ 5 projects AND Managed Environments enforced AND quarterly ROI in business cadence.

L400–500 · 战略平台 || L400–500 · Strategic Platform

### 自动化 & 持续优化阶段 || Automated & Continuously Improving

组织画像：Power Platform 是企业级战略平台，治理与发布几乎全自动，Maker 社区有 Champion 机制，AI / Copilot 在主流场景已上线。 || Org profile: Power Platform is a strategic enterprise platform; governance and release are largely automated; the Maker community has a Champion program; AI / Copilot is live in mainstream scenarios.

●

必做 || Must

- 全部 17 任务 + 用 Power Platform Build Tools 自动化发布 || All 17 tasks + automated release via Power Platform Build Tools
- 环境与 DLP 通过 IaC（PowerShell / Terraform 提供方） || Environments & DLP via IaC (PowerShell / Terraform provider)
- CoE 仪表板对接业务 OKR / 财务系统 || CoE dashboards wired into business OKRs / finance

◐

应做 || Should

- 集成 Azure DevOps / GitHub 仓库与 CI 流水线 || Integrate with Azure DevOps / GitHub repos and CI pipelines
- 正式 Maker Champion 计划与培训路径 || Formal Maker Champion program with training pathways
- 安全运营对接 Microsoft Purview & Defender || SecOps wired into Microsoft Purview & Defender

○

可选 || Optional

- 向社区贡献内部模式、模板与组件 || Contribute patterns / templates / components back to community
- ISV / 跨租户共享方案 || ISV / cross-tenant solution sharing

—

暂缓 || Defer

- 无 — 治理与发布已全部自动化 || None — governance & release are fully automated

**下一步 || What's next** L500 是节奏而非终点：每季复盘采纳、AI 管道与 ROI，并入企业架构治理。 || L500 is a rhythm: revisit adoption, AI pipeline, and ROI quarterly; fold into enterprise architecture governance.

:::accordion
::panel
### 紧凑对照矩阵 · 17 任务 × 4 成熟度档 || Compact matrix · 17 tasks × 4 maturity tiers
左列是 17 个任务，列头是 4 个成熟度档。**●** 必做、**◐** 应做、**○** 可选、**—** 暂缓。同一任务在不同档位含义不同：低档位的 "Should" 通常是简化版（如手工导出而非管道），高档位的 "Must" 通常是自动化版。 || Rows are the 17 tasks; columns are the 4 maturity tiers. **●** Must, **◐** Should, **○** Optional, **—** Defer. The same task means different things at different tiers: a lower-tier "Should" is usually a simplified form (manual export instead of pipeline), and a higher-tier "Must" is the automated form.

| 任务 || Task | L100 | L200 | L300 | L400+ |
| --- | --- | --- | --- | --- |
| T1 CoE 受理 || T1 CoE intake | ◐ | ● | ● | ● |
| T2 问题/指标/发起人 || T2 Problem / metric / sponsor | ● | ● | ● | ● |
| T3 平台适配 & 选型 || T3 Platform fit & product pick | ◐ | ● | ● | ● |
| T4 许可与成本估算 || T4 License & cost estimate | ◐ | ● | ● | ● |
| T5 环境方案 & DLP 范围 || T5 Env plan & DLP scope | ○ | ◐ | ● | ● |
| T6 Go / No-Go 决策门 || T6 Go / No-Go gate | ○ | ◐ | ● | ● |
| T7 Dataverse 数据模型 || T7 Dataverse data model | — | ○ | ● | ● |
| T8 环境拓扑蓝图 || T8 Environment topology | — | ◐ | ● | ● |
| T9 ALM 解决方案布局 || T9 ALM solution layout | — | ○ | ● | ● |
| T10 DLP 例外审批 || T10 DLP exception review | — | ◐ | ● | ● |
| T11 Dataverse 角色方案 || T11 Dataverse role plan | — | ○ | ● | ● |
| T12 架构审批门 || T12 Design sign-off gate | — | — | ● | ● |
| T13 环境预置 & 容量 || T13 Provision envs & capacity | ○ | ● | ● | ● |
| T14 身份 / 安全组 / DLP || T14 Identity / groups / DLP | ○ | ● | ● | ● |
| T15 构建 & UAT || T15 Build & UAT | ● | ● | ● | ● |
| T16 发布 & 切换 || T16 Promote & cutover | — | ◐ | ● | ● |
| T17 运营 & 监控 || T17 Operate & monitor | ○ | ● | ● | ● |
:::

:::callout { title: "关键洞察 || Key Insight" }
Power Platform adoption maturity model Power Platform adoption methodology CoE Starter Kit Managed Environments overview Power Platform ALM overview
:::

## #licensing 05 / Discover & Qualify · Stages 1–2 :: 把一句话需求落实到一个可被批准的方案 || Turn a One-Line Request Into an Approvable Plan

探索期涵盖 §03 生命周期的 **Stage 1（需求与受理）**与 **Stage 2（评估与规划）**。一句话需求要走完六个动作，才能进入设计阶段：CoE 收单 → BA 把问题与指标讲清楚 → 架构师做平台与产品适配 → 管理员估算许可与环境 → 安全合规圈定 DLP 范围 → 发起人在 Go/No-Go 门拍板。每张卡片明确：谁主导、谁贡献、谁参与、在哪个后台或会议中操作、4 步具体动作、做完的判定标准。 || The Discover phase expands **Stage 1 (Idea & Intake)** and **Stage 2 (Qualify & Plan)** from the §03 lifecycle. Six concrete actions take a one-line request into Design: CoE intake → BA frames the problem and metric → architect picks the platform / product → Power Platform Admin estimates licenses and environments → security & compliance scopes DLP → sponsor signs the Go/No-Go gate. Each card specifies who drives it, who contributes, who participates, where it actually happens, the 4 steps to execute, and the one-line definition of done.

发现 Discover || Discover

·

Stage 1–2

·

决定要不要做、要做什么 || Decide whether and what to build

1

CoE Intake

收单与采集 || Capture context

→

2

Problem · Metric · Sponsor

BA 框定价值 || BA frames value

→

3

Platform Fit & Product Pick

架构师选型 || Architect picks

→

4

License & Cost Estimate

管理员估算 || Admin quotes

→

5

Env Plan & DLP Scope

安全合规圈定 || Security scopes

→

6

Go / No-Go Gate

发起人拍板 || Sponsor decides

## #task-intake 06 / 05.1 · Stage 1 · Intake :: 任务 1 · 收单与场景采集 || Task 1 · CoE Intake & Context Capture

1

业务方 || Requester

### 提交受理表单 || Submit intake form

在 CoE Portal 提交受理表单：业务名称、痛点、目标用户、预期收益。 || Submits the standardized intake form on the CoE portal: business name, pain point, target users, expected benefit.

所需资产 || Asset

受理表单 || Intake form

准备人 || Prepared by

CoE 负责人 || CoE lead

2

CoE

### 完成首轮分诊 || Triage request

收到 Teams / 邮件通知，24 小时内完成首轮分诊（标主题、定优先级）。 || Receives Teams / email notification and triages within 24 hours: tag topic, set initial priority.

所需资产 || Asset

分诊通知队列 || Triage queue

准备人 || Prepared by

CoE 负责人 || CoE lead

3

业务分析师 || Business analyst

### 补全场景访谈 || Interview users

与最终用户做 30 分钟场景访谈，补全使用频率、数据敏感度、跨部门依赖。 || Holds a 30-minute scenario interview with end users to capture frequency, data sensitivity, cross-department dependencies.

所需资产 || Asset

场景访谈记录 || Interview notes

准备人 || Prepared by

业务分析师 / SME || Business analyst / SME

4

CoE

### 创建 Initiative 记录 || Create Initiative record

在 Dataverse 中创建 Initiative 记录，进入 Stage 2 评估池。 || Creates an Initiative record in Dataverse and moves it into the Stage 2 qualification queue.

所需资产 || Asset

Initiative 建档记录 || Initiative record

准备人 || Prepared by

CoE 负责人 || CoE lead

完成判定 || Done

Initiative 在 CoE Dataverse 中已建档，含完整业务上下文与初步优先级。 || Initiative record exists in CoE Dataverse with full business context and initial priority captured.

## #task-frame 07 / 05.2 · Stage 1 · Frame :: 任务 2 · 界定问题、设定指标、确认发起人 || Task 2 · Problem · Metric · Sponsor

1

业务分析师 || Business analyst

### 写问题陈述 || Frame the problem

写出一句话问题陈述：“现状是 X，导致 Y，希望达到 Z。” || Drafts a one-sentence problem statement: “today X, which causes Y; we want Z.”

所需资产 || Asset

Initiative 一页纸 || Initiative brief

准备人 || Prepared by

业务分析师 / SME || Business analyst / SME

2

业务分析师 || Business analyst

### 设定成功指标 || Set success metrics

设定 1–2 个可衡量的成功指标（如：审批耗时从 3 天到 4 小时、人工录入从 200 单/月到 0）。 || Sets 1–2 measurable success metrics (e.g., approval cycle from 3 days to 4 hours; manual entries from 200/month to 0).

所需资产 || Asset

指标基线记录 || Metric baseline

准备人 || Prepared by

业务分析师 / SME || Business analyst / SME

3

BA + 发起人 || BA + Sponsor

### 确认发起人 || Confirm sponsor

找到一名愿意背书预算与决策的高管发起人，签字确认愿景。 || Identifies and confirms an executive sponsor willing to back the budget and the decision; captures sign-off on the vision.

所需资产 || Asset

发起人确认 || Sponsor sign-off

准备人 || Prepared by

高管发起人 || Executive sponsor

4

业务分析师 || Business analyst

### 更新 Initiative 记录 || Update Initiative record

把问题、指标、发起人三项写回 Initiative 记录，作为后续所有评审的引用。 || Writes problem, metric, and sponsor into the Initiative record as the canonical reference for every later review.

所需资产 || Asset

Initiative 记录 || Initiative record

准备人 || Prepared by

业务分析师 / SME || Business analyst / SME

完成判定 || Done

Initiative 卡片含可量化指标、命名发起人，CoE 可以排上 Stage 2 评估议程。 || Initiative carries a quantifiable metric and a named sponsor; CoE can add it to the Stage 2 qualification agenda.

## #task-fit 08 / 05.3 · Stage 2 · Fit :: 任务 3 · 平台适配性与产品选型 || Task 3 · Platform Fit & Product Pick

1

架构师 || Architect

### 评估平台适配 || Evaluate platform fit

对照决策矩阵评估：是否适合低代码、是否需要 Dataverse、是否触碰复杂集成。 || Evaluates against the matrix: low-code suitability, Dataverse need, complex integration touchpoints.

所需资产 || Asset

平台决策矩阵 || Decision matrix

准备人 || Prepared by

解决方案 / 企业架构师 || Solution / Enterprise architect

2

架构师 || Architect

### 选定主产品 || Pick primary product

若适合 Power Platform，按场景在 Power Apps / Automate / Copilot Studio / Pages 中选主产品。 || If Power Platform fits, picks the primary product among Power Apps / Automate / Copilot Studio / Pages by scenario.

所需资产 || Asset

平台决策矩阵 || Decision matrix

准备人 || Prepared by

解决方案 / 企业架构师 || Solution / Enterprise architect

3

架构师 || Architect

### 记录驳回路径 || Document rejection path

若不适合（高定制 UI、毫秒级延迟、复杂事务），明确驳回理由并提出替代方案。 || If a poor fit (heavy custom UI, millisecond latency, complex transactions), documents the rejection rationale and proposes an alternative.

所需资产 || Asset

适配结论草稿 || Fit rationale draft

准备人 || Prepared by

解决方案 / 企业架构师 || Solution / Enterprise architect

4

CoE

### 盖章 PASS / FAIL || Stamp PASS / FAIL

在 Initiative 记录上盖章 "Platform fit: PASS / FAIL"，FAIL 立即关闭工单并通知发起人。 || Stamps the Initiative with "Platform fit: PASS / FAIL"; FAIL closes the ticket and notifies the sponsor.

所需资产 || Asset

适配结论记录 || Fit decision log

准备人 || Prepared by

CoE 负责人 || CoE lead

完成判定 || Done

主产品选定（或 FAIL 关单），决策记录可追溯。 || Primary product is chosen (or the Initiative is closed as FAIL) with a traceable decision record.

## #task-license 09 / 05.4 · Stage 2 · License & Cost :: 任务 4 · 许可与成本估算 || Task 4 · License & Cost Estimate

1

Power Platform 管理员 || Power Platform Admin

### 划分用户群 || Segment user groups

圈出三类用户：Maker（构建者）、被授权用户（Premium）、轻量用户（仅 seeded 即可）。 || Identifies three user buckets: Makers (builders), licensed end users (Premium), and light users (seeded rights are enough).

所需资产 || Asset

SKU 与容量盘点 || SKU snapshot

准备人 || Prepared by

License Admin + Power Platform 管理员 || License Admin + Power Platform Admin

2

Power Platform 管理员 || Power Platform Admin

### 映射付费模式 || Map payment modes

对照三种付费模式选 SKU：用户许可（M365 中分配）、容量许可（Power Platform admin center 分配）、按量计费（绑 Azure）。 || Maps them to the 3 payment modes: user license (M365), capacity license (Power Platform admin center), pay-as-you-go (Azure-linked).

所需资产 || Asset

SKU 与容量盘点 || SKU snapshot

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

3

Power Platform 管理员 || Power Platform Admin

### 估算附加容量 || Estimate add-on capacity

估算 Dataverse 容量需求（GB）、AI Builder 积分、Power Automate Process 等加购。 || Estimates Dataverse capacity needs (GB), AI Builder credits, Power Automate Process and similar add-ons.

所需资产 || Asset

成本估算表 || Cost estimator

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

4

Power Platform 管理员 || Power Platform Admin

### 发布一页报价 || Publish the quote

把单价、数量、年成本写进估算表；标注发起人预算 vs. 共享池摊销，附 12 个月增长预测与 20–30% buffer。 || Drops unit price, quantity, annual cost into the estimator; flags sponsor-budget vs. shared-pool items, plus a 12-month projection with 20–30% buffer.

所需资产 || Asset

成本估算表 || Cost estimator

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

完成判定 || Done

发起人收到一页报价单，含 SKU 明细、年成本、扩张余量、付费归属。 || Sponsor receives a one-page quote with SKU breakdown, annual cost, growth buffer, and budget ownership.

**许可参考 · 点击展开查看完整产品×付费模式目录 || License Reference · Click to expand the full product × payment-mode catalog**

需要查询具体 SKU 或分配责任时再展开。完成价格估算后可保持折叠。 || Expand only when you need to look up a specific SKU or assignment owner. Keep it collapsed once your cost estimate is locked.

**许可参考 — 按产品列出，按付费模式分组 || License Reference — All Licenses by Product, Grouped by Payment Mode**

一页带走：每个产品下的许可以 **付费模式**（User License / Capacity / Pay-as-you-go）分组，本版块底部说明每种付费模式需什么角色、在什么位置完成分配。 || One page to take away: every product's licenses grouped by **payment mode** (User License / Capacity / Pay-as-you-go). The footer notes spell out who, in which admin surface, allocates each mode.

**Power Apps**

自定义业务应用 — canvas 与 model-driven。 || Custom business apps — canvas and model-driven.

① 用户许可 || ① User License

- Power Apps for Microsoft 365 （随附） || Power Apps for Microsoft 365 (seeded)
- Power Apps for Dynamics 365 （随附） || Power Apps for Dynamics 365 (seeded)
- Power Apps Premium
- Power Apps Developer Plan / Trial

② 容量 / 作用域 || ② Capacity / Scoped

- Power Apps per app（分配到环境） || Power Apps per app (allocated to environment)

③ 按量计费 || ③ Pay-as-you-go

- Power Apps per-app 用户计量项 || Power Apps per-app users meter

**Power Automate**

跨云流与桌面 RPA 的工作流自动化。 || Workflow automation across cloud flows and desktop RPA.

① 用户许可 || ① User License

- Power Automate for Microsoft 365 （随附） || Power Automate for Microsoft 365 (seeded)
- Power Automate for Dynamics 365 （随附） || Power Automate for Dynamics 365 (seeded)
- Power Automate Free / Trial
- Power Automate Premium

② 容量 / 作用域 || ② Capacity / Scoped

- Power Automate Process（绑定云流） || Power Automate Process (bound to a flow)
- Power Automate Hosted Process（托管机器组） || Power Automate Hosted Process (hosted machine group)

③ 按量计费 || ③ Pay-as-you-go

- Power Automate 高级流运行次数计量项 || Power Automate premium flow runs meter

**Copilot Studio**

可推理、检索、执行动作的 AI 代理与 Copilot。 || AI agents and copilots that can reason, ground, and act.

① 用户许可 || ① User License

- Copilot Studio User License（作者） || Copilot Studio User License (authors)
- Copilot Studio for Microsoft Teams 计划 || Copilot Studio for Microsoft Teams plan
- Copilot Studio Trial

② 容量 / 作用域 || ② Capacity / Scoped

- Copilot Studio 租户许可（不分配给用户） || Copilot Studio tenant license (not user-assigned)
- 租户积分 / 按会话计费容量 || Tenant credits / billed-session capacity

③ 按量计费 || ③ Pay-as-you-go

- Copilot 积分计量项（走 Azure） || Copilot credits meter (billed to Azure)

**Power Pages**

以 Dataverse 为后端的外部网站。 || External websites backed by Dataverse.

① 用户许可（仅限内部使用） || ① User License (internal use only)

- 经由 Power Apps Premium 获得内部使用权 || Internal use via Power Apps Premium
- 经由 Dynamics 365 许可获得内部使用权 || Internal use via Dynamics 365 licenses

② 容量 / 作用域 || ② Capacity / Scoped

- 认证用户订阅容量包 || Authenticated users subscription capacity
- 匿名用户订阅容量包 || Anonymous users subscription capacity

③ 按量计费 || ③ Pay-as-you-go

- Power Pages 用户数计量项 || Power Pages users meter

**Power BI / Fabric · 跨产品容量加购 || Power BI / Fabric · Cross-Product Add-ons**

分析服务许可，以及跨产品的汇聚型容量加购。 || Analytics service licenses, plus the cross-product pooled capacity add-ons.

① 用户许可（Power BI） || ① User License (Power BI)

- Fabric Free
- Power BI Pro
- Power BI Premium Per User （PPU） || Power BI Premium Per User (PPU)

② 容量 / 作用域 || ② Capacity / Scoped

- Premium / Fabric 容量（F SKU） || Premium / Fabric capacity (F SKUs)
- Dataverse 数据库 / 文件 / 日志容量加购 || Dataverse database / file / log capacity add-ons
- AI Builder 积分 || AI Builder credits
- Power Platform Requests 加购 || Power Platform Requests add-ons

③ 按量计费 || ③ Pay-as-you-go

- Fabric 容量按 Azure F SKU 按量计费 || Fabric capacity billed via Azure F SKUs
- Dataverse 存储计量项 || Dataverse storage meter
- Power Platform requests 计量项 || Power Platform requests meter

付费模式与分配责任 — 每种许可由谁、在哪里完成分配 || Payment mode & assignment ownership — who acts where for each license type

① 用户许可 || ① User License

**谁：**License Admin。 **在哪里：**Microsoft 365 admin center → Users / Groups，或通过 Microsoft Entra 的基于组的许可分发。 **分配到：**具体用户。 || **Who:** License Admin. **Where:** Microsoft 365 admin center → Users / Groups, or via group-based licensing in Microsoft Entra. **Assigned to:** a named user.

② 容量 / 作用域 || ② Capacity / Scoped

**谁：**Power Platform Admin（必要时需 Microsoft 365 Billing Admin 先采购）。 **在哪里：**Power Platform admin center → Licensing / Capacity / Resources。 **分配到：**环境、应用、云流、机器组、或租户汇聚池，不绑定到具体用户。 || **Who:** Power Platform Admin (Microsoft 365 Billing Admin first procures the SKU when needed). **Where:** Power Platform admin center → Licensing / Capacity / Resources. **Assigned to:** an environment, app, cloud flow, machine group, or tenant pool — not a named user.

③ 按量计费 || ③ Pay-as-you-go

**谁：**Power Platform Admin + 目标 Azure 订阅的 Owner / Contributor。 **在哪里：**Power Platform admin center → Billing → Billing plans，将环境与 Azure Power Platform account 资源关联。 **分配到：**环境；使用量以计量项后付费到 Azure。 || **Who:** Power Platform Admin + Owner / Contributor on the target Azure subscription. **Where:** Power Platform admin center → Billing → Billing plans, linking the environment to an Azure Power Platform account resource. **Assigned to:** an environment; usage is metered and billed to Azure after the fact.

:::callout { title: "关键洞察 || Key Insight" }
Power Platform licensing overview Power Platform licensing FAQ Power Apps per app plans Types of Power Automate licenses Pay-as-you-go overview Pay-as-you-go meters Copilot Studio licensing management Power BI license types
:::

## #task-env 10 / 05.5 · Stage 2 · Env & DLP :: 任务 5 · 环境拓扑与 DLP 范围 || Task 5 · Env Plan & DLP Scoping

1

Power Platform 管理员 + 架构师 || Power Platform Admin + Architect

### 草拟环境拓扑 || Draft environment topology

按 Dev / Test / Prod 草拟环境拓扑，写明每个环境的目的、数据敏感度、用户范围。 || Sketches a Dev / Test / Prod topology with each environment's purpose, data sensitivity, and user audience.

所需资产 || Asset

环境拓扑草图 || Environment topology draft

准备人 || Prepared by

解决方案架构师 || Solution architect

2

安全代表 || Security rep

### 映射连接器分组 || Map connector groups

对照租户级 DLP 策略，列出本方案需要的连接器，标注 Business / Non-Business / Blocked 归属。 || Cross-checks against tenant DLP policy; lists the connectors this initiative needs and tags each as Business / Non-Business / Blocked.

所需资产 || Asset

DLP 连接器矩阵 || DLP connector matrix

准备人 || Prepared by

信息安全代表 || Security rep

3

安全代表 || Security rep

### 起草 DLP 例外 || Draft DLP exception

若有连接器跨越数据组（如 SharePoint ↔ HTTP），起草 DLP 例外申请，说明业务必要性与缓解措施。 || If a connector crosses data groups (e.g., SharePoint ↔ HTTP), drafts a DLP exception request with business need and mitigations.

所需资产 || Asset

DLP 例外申请 || DLP exception sheet

准备人 || Prepared by

信息安全代表 || Security rep

4

安全代表 || Security rep

### 写回预审结论 || Record pre-review outcome

预审通过后结论写回 Initiative；最终策略下发延后到 Stage 3 设计完成时。 || Pre-approves; conclusions go back into the Initiative. Final policy enforcement is deferred to Stage 3 design completion.

所需资产 || Asset

预审结论记录 || Pre-review note

准备人 || Prepared by

信息安全代表 || Security rep

完成判定 || Done

环境拓扑草图 + DLP 连接器清单 + 例外申请清单，全部附在 Initiative 上。 || Env topology sketch + DLP connector list + exception request list are attached to the Initiative.

任务 5 参考 || Task 5 Reference

**环境策略 · Part 1（6 类环境类型对比） || Environment Strategy · Part 1 (Six Environment Types)**

需要对比 Default / Production / Sandbox / Trial / Developer / Dataverse for Teams 的差异时展开。创建前置条件与划分模式见 Part 2。 || Expand to compare Default / Production / Sandbox / Trial / Developer / Dataverse for Teams. Creation prerequisites and segmentation patterns live in Part 2.

核心 || Core

**Default**

每租户一个，自动创建。所有许可用户获得 Maker 角色。限额 1 TB，不可删除。面向个人生产力场景，**不适以生产**。重命名以明确用途。 || One per tenant, auto-created. All licensed users get Maker role. Limited to 1 TB. Cannot be deleted. Designed for personal productivity — NOT production. Rename it to clarify purpose.

受控 || Managed

**Production**

完整的管理控制。面向长期、业务关键的工作负载。需要至少 1 GB 可用容量。支持完整备份 / 还原。 || Full admin control. For permanent, business-critical workloads. Requires 1 GB available capacity. Full backup & restore support.

开发 / 测试 || Dev/Test

**Sandbox**

非生产，支持复制与重置。适用于开发与测试。完整管理控制。可与 production 互转。 || Non-production with copy & reset. For development and testing. Full admin control. Convert to/from production.

临时 || Temporary

**Trial**

30 天后过期。每用户一个。创建受管理员控制。不能启用 Dynamics 365 apps。 || Expires after 30 days. One per user. Admin-controlled creation. Cannot enable Dynamics 365 apps.

临时 || Temporary

**Developer**

通过 Developer Plan 获得。仅限个人使用，不可共享。不可绑定安全组。面向学习与原型验证。 || Via Developer Plan. Individual-use only, no sharing. No security group assignment. For learning and prototyping.

自动 || Auto

**Dataverse for Teams**

首次在 Teams 中创建 Power App 时自动生成。管理设置受限。角色自动映射到 Teams 成员身份。 || Auto-created when a Power App is first built in Teams. Limited admin settings. Roles map to Teams membership automatically.

**环境策略 · Part 2（创建前置条件 & 推荐划分模式） || Environment Strategy · Part 2 (Requirements & Segmentation Patterns)**

需要确认环境创建前置条件或推荐划分模式时展开。 || Expand to confirm environment creation prerequisites and recommended segmentation patterns.

:::accordion
::panel
### 环境创建前置条件 || Environment Creation Requirements
**1. 许可资格** — 需 Power Apps/Automate/D365 计划。M365、Teams 与 Developer Plan 都不授予创建权。Power Platform 与 D365 管理员除外。 || **1. License eligibility** — Power Apps/Automate/D365 plan required. M365, Teams, and Developer Plan do NOT grant creation rights. Waived for PP and D365 admins.

**2. 可用容量** — 租户需至少 1 GB 可用数据库存储。 || **2. Available capacity** — Tenant must have at least 1 GB available database storage.

**3. 租户策略** — 管理员未通过租户设置限制环境创建。 || **3. Tenant policy** — Admin must not have restricted environment creation via tenant settings.

**要点：**"启用 Dynamics 365 apps" 设置在数据库供应时选定，**事后不可变更**。 || **Important:** The "Enable Dynamics 365 apps" setting is chosen at database provisioning time and **cannot be changed later**.

::panel
### 推荐划分模式 || Recommended Segmentation Patterns
**1–10 人、非机密、无 ALM** → Default 环境。 || **1–10 users, non-confidential, no ALM** → Default environment.

**7–30 人、含机密数据或需 ALM** → 带安全组的共享 production。 || **7–30 users, confidential data, or needs ALM** → Shared production with security group.

**>30 人、财务 / 声誉影响大** → 专属 production、独立 ALM 流水线。 || **>30 users, monetary/reputational impact** → Dedicated production with its own ALM pipeline.

为 production 与 sandbox 环境始终绑定 **安全组**。 || Always bind a **security group** to production and sandbox environments.
:::

> Environment types
> Create environments
> Manage default environment

**DLP 最佳实践（Scoping 阶段的策略分层与连接器分类） || DLP Best Practices (Scoping-Stage Policy Layering & Connector Classification)**

需要确定 DLP 策略的分层、连接器三组归类、租户 vs 环境策略覆盖关系、或自定义连接器与 action / endpoint 控制时展开。聚焦 Power Platform DLP，非通用 DLP 介绍。 || Expand to fix DLP policy layering, the three-bucket connector classification, tenant- vs environment-policy precedence, or custom-connector / action / endpoint control. Scoped to Power Platform DLP, not generic DLP intro.

:::accordion
::panel
### 连接器三组分类（Business / Non-Business / Blocked） || Three-Bucket Connector Classification (Business / Non-Business / Blocked)
规则 || Rule

**组间互斥 || Groups Are Mutually Exclusive**

同一 app / flow 不允许同时使用来自不同组的连接器；Blocked 组在策略范围内完全禁用。 || One app / flow cannot use connectors from two different groups at the same time; the Blocked group is fully disabled within the policy scope.

默认归属 || Default Group

**新连接器自动归默认组 || New Connectors Inherit the Default**

创建策略时由 admin 选定 default 组（Business / Non-Business / Blocked 之一），所有未显式分类的连接器自动归入该组。 || The admin picks the default group (Business / Non-Business / Blocked) at policy creation; any connector not classified explicitly falls into it.

典型分组 || Typical Buckets

**Business / Non-Business / Blocked 范例 || Reference Bucket Mapping**

Business = Dataverse、SharePoint / Outlook / Teams、企业 LOB；Non-Business = 社交与消费类（Twitter、Facebook、个人 Dropbox）；Blocked = 个人邮箱、未审计 HTTP 出口。 || Business = Dataverse, SharePoint / Outlook / Teams, enterprise LOB; Non-Business = social & consumer (Twitter, Facebook, personal Dropbox); Blocked = personal mail, unaudited HTTP egress.

Nonblockable

**约 30 个核心连接器无法 Block || ~30 Core Connectors Cannot Be Blocked**

Approvals、Notifications、Microsoft Dataverse、Office 365 Outlook 等被官方标记为 nonblockable，无法移入 Blocked；策略设计时按必然存在的 Business 项处理。 || Approvals, Notifications, Microsoft Dataverse, Office 365 Outlook and others are tagged nonblockable and cannot be moved to Blocked; treat them as fixed Business-group entries.

::panel
### 租户策略 vs 环境策略：覆盖与叠加规则 || Tenant vs Environment Policies: Scope & Precedence
租户层 || Tenant

**租户策略 · 三种 Scope || Tenant Policy · Three Scopes**

由 Power Platform Admin 在 PPAC 维护，可选所有环境 / 除指定环境外 / 仅指定环境；后两者需 Managed Environments / Sandbox / Trial。 || Owned by Power Platform Admin in PPAC; targets all environments, all-except-a-list, or only-a-list (last two require Managed Environments / Sandbox / Trial).

环境层 || Environment

**环境策略不能放宽租户策略 || Env Policies Cannot Loosen Tenant Policies**

由 Environment Admin 创建，仅作用单个环境；只要任一策略把连接器划入 Blocked，最终结果就是 Blocked。 || Created by an Environment Admin, scoped to a single environment; if any policy puts a connector in Blocked, the effective result is Blocked.

叠加 || Precedence

**叠加规则：最严胜出 || Layering Rule: Most Restrictive Wins**

多策略冲突时取最严（Blocked > Business / Non-Business 分组 > 默认组）。设计上按租户基线 + 环境追加两层，不在每个环境策略里重复基线。 || When policies disagree, the most restrictive wins (Blocked > Business / Non-Business split > default group). Design as tenant baseline + per-environment additions, not by restating the baseline everywhere.

Default 环境 || Default Env

**Default 环境必须最严 || Default Environment Must Be Strictest**

Default 环境对全租户用户开放 Maker 权限，是事实上的影子 IT 入口；基线应单列 Default 环境，所有非 Microsoft 一方连接器归 Blocked。 || The Default environment grants Maker rights to every licensed user and is the de-facto shadow-IT entry point; the baseline should call it out and put all non-Microsoft connectors in Blocked.

::panel
### Action 与 endpoint 级控制 || Action & Endpoint-Level Control
Action

**Connector Action Control**

对单个连接器的具体 action 设 Allow / Deny（例：SharePoint 允许 `Get items`、禁止 `Delete file`）；适合连接器整体不能 Block、但部分高危动作要拦截的场景。 || Allow or deny individual actions on a connector (e.g. allow SharePoint `Get items`, block `Delete file`). Use when the connector cannot be blocked outright but specific high-risk actions must be denied.

Endpoint

**Endpoint Filtering**

HTTP、HTTP with Microsoft Entra、SQL Server、Azure Blob、SMTP 等支持限定可访问的 URL / 主机 / 数据库；OPDG 网关同样适用，用于收敛出口。 || HTTP, HTTP with Microsoft Entra, SQL Server, Azure Blob, SMTP and others support restricting which URLs / hosts / databases can be reached; the same pattern applies to OPDG (on-premises data gateway) connectors to constrain egress.

自定义连接器 || Custom Connectors

**Custom Connector Parity**

自定义连接器不会自动继承基础连接器的分类，需在每个策略中显式登记；同一个 HTTP 自定义连接器在不同环境可归不同组。 || Custom connectors do NOT auto-inherit the underlying connector's classification — they must be added to each policy explicitly; the same HTTP-based custom connector can land in different groups across environments.

高风险默认 || High-Risk Default

**HTTP / HTTP with Microsoft Entra**

两个 premium 连接器可绕过大量审计；建议租户基线默认 Blocked，仅在显式审批的环境内通过 endpoint filtering 放出受限 URL。 || Both premium connectors can bypass most auditing; baseline should put them in Blocked at the tenant level and only open them inside reviewed environments via endpoint filtering.

::panel
### 生效延迟、违规处置与变更流程 || Enforcement Latency, Violation Handling & Change Process
延迟 || Latency

**生效延迟 1 小时 – 24 小时 || Enforcement Latency: 1 h – 24 h**

策略变更通常在 1 小时内生效，大规模租户可能延迟 24 小时；变更后立刻扫描违规并通知 owner。 || Policy changes typically take effect within an hour, up to 24 hours at scale; a scan runs after each change and notifies owners of any violation.

违规 || Violation

**违规 app / flow → Suspended || Violating Apps / Flows → Suspended**

违规资源进入 Suspended 状态停跑；owner 修复（移除 / 替换连接器或申请例外）后才能恢复。Suspended 的 flow 不会自动重跑历史触发，业务连续性责任在 owner。 || Violating resources enter the Suspended state and stop running; the owner must remediate (drop / swap the connector or request an exception) before they resume. Suspended flows do NOT auto-replay historical triggers — business continuity is the owner's responsibility.

例外 || Exception

**例外申请 4 要素 + 双签 || Exception: 4 Fields + Co-Sign**

例外申请必须含申请人 / 业务场景 / 替代缓解措施 / 到期复核日；策略变更走 PR 流程（PowerShell 或 Power Platform CLI 导出 JSON 入库），由 Power Platform Admin + 信息安全双签后合入。 || An exception must carry requester / business case / compensating mitigation / expiry review date; run policy changes as a PR workflow (export JSON via PowerShell or Power Platform CLI) with Power Platform Admin + Security co-sign before merge.

差分扫描 || Diff Scan

**变更前做影响差分 || Mandatory Pre-Change Impact Diff**

每次变更前用 `Get-AdminDlpPolicy` + Inventory / Power Platform CoE Kit 跑一次新策略 vs 现存 app / flow 的差分，列出会被 Suspended 的资源、提前通知 owner。 || Before each change, diff the new policy against existing apps / flows using `Get-AdminDlpPolicy` + Inventory / Power Platform CoE Kit, list resources that will be Suspended, and notify owners in advance.
:::

> Data policies overview
> Create a DLP policy
> Connector classification
> Connector action control
> Custom connector parity
> DLP adoption strategy
> Effective policies across layers
> Manage default environment

## #task-gate 11 / 05.6 · Stage 2 · Gate :: 任务 6 · Go / No-Go 决策门 || Task 6 · Go / No-Go Gate

1

CoE

### 发送评审包 || Send the review pack

会前 3 个工作日把 Initiative 一页纸（问题、指标、产品、报价、环境、DLP）发给评审委员会。 || Sends the one-pager (problem, metric, product, quote, env, DLP) to the review board 3 business days ahead.

所需资产 || Asset

评审包 || Review pack

准备人 || Prepared by

CoE 负责人 || CoE lead

2

发起人 + 架构师 + Power Platform 管理员 || Sponsor + Architect + Power Platform Admin

### 说明价值与风险 || Present value and risk

发起人陈述价值与预算来源；架构师答风险；Power Platform 管理员答容量与 SLA。 || Sponsor presents value and budget source; architect addresses risk; Power Platform Admin addresses capacity and SLA.

所需资产 || Asset

评审包 || Review pack

准备人 || Prepared by

CoE 负责人 || CoE lead

3

评审委员会 || Review board

### 记录决策结果 || Record gate decision

决议三选一：Go（进入 Stage 3 设计）、Hold（补材料 2 周内重审）、No-Go（关闭并归档原因）。 || Outcome is one of: Go (move to Stage 3), Hold (revise within 2 weeks), No-Go (close and archive rationale).

所需资产 || Asset

决策归档记录 || Decision log

准备人 || Prepared by

CoE 负责人 || CoE lead

4

CoE

### 触发 Stage 3 || Trigger Stage 3

Go 决议后通知 Power Platform 管理员 与架构师启动 Stage 3，并在 Initiative 上盖章 "Approved for Design"。 || On Go, pings Power Platform Admin and architect to start Stage 3 and stamps the Initiative as "Approved for Design".

所需资产 || Asset

决策归档记录 || Decision log

准备人 || Prepared by

CoE 负责人 || CoE lead

完成判定 || Done

Initiative 上有明确决议（Go / Hold / No-Go）、决策时间、决策人，预算释放或冻结指令同步发出。 || Initiative shows a clear outcome (Go / Hold / No-Go) with date and decision-maker; budget release or freeze instructions are sent.

## #foundations 06 / Design & Approve · Stage 3 :: 把获批需求锁成一份可开工的设计包 || Lock an Approved Initiative Into a Build-Ready Design Pack

设计期承接 Stage 2 的 Go 决议，把 Initiative 从“值得做”推进到“可以开工”。六个动作必须锁定：Dataverse 数据模型、环境拓扑、ALM 方案、DLP 例外、Dataverse 角色矩阵，以及最终设计签核。T7–T12 共 6 张任务卡各自附带执行该任务所需查阅的参考资料（例如 Task 8 含容器层级与容量；Task 10 含 DLP 与 Managed Environments；Task 11 含权限分层与租户角色对照）。 || The Design phase picks up after the Stage 2 Go decision and turns the Initiative from "worth doing" into "ready to build". Six actions must be locked down: the Dataverse data model, environment topology, ALM layout, DLP exceptions, the Dataverse role matrix, and the final design sign-off. Each of the 6 task cards (T7–T12) ships with the reference material that task actually needs — e.g. Task 8 includes container hierarchy and capacity; Task 10 carries DLP and Managed Environments; Task 11 carries the permission layers and tenant-admin role comparison.

设计 Design || Design

·

Stage 3

·

决定系统要怎样被构建与控制 || Decide how the solution will be built and governed

7

Data Model Blueprint

锁定表与关系 || Tables and relationships

→

8

Env Topology Design

锁定环境边界 || Freeze environment boundaries

→

9

ALM Layout

锁定解决方案结构 || Freeze solution structure

→

10

DLP Exception Review

锁定连接器边界 || Freeze connector boundaries

→

11

Dataverse Role Matrix

锁定最小权限 || Freeze least privilege

→

12

Design Sign-Off

发放开工许可 || Release build-ready approval

## #design-model 13 / 06.1 · Stage 3 · Data Model :: 任务 7 · Dataverse 数据模型 || Task 7 · Dataverse Data Model

把“业务想做什么”翻成 Dataverse 里的表、关系、敏感字段和数据 owner，不让建模停留在口头理解。 || Translate the approved business scope into Dataverse tables, relationships, sensitive fields, and data owners instead of leaving the model as verbal understanding.

1

架构师 + 业务分析师 || Architect + Business Analyst

### 列出业务对象 || List Business Objects

先把核心业务对象、记录 owner、关键状态和成功口径列出来，明确哪些对象必须进入 Dataverse，而不是继续散落在 Excel 或 SharePoint。 || List the core business entities, record owners, key states, and success measures first, and decide which objects must live in Dataverse instead of remaining in Excel or SharePoint.

所需资产 || Asset

领域词汇表 || Domain Glossary

准备人 || Prepared by

业务分析师 / 解决方案架构师 || Business Analyst / Solution Architect

2

System Customizer

### 起草表与关系 || Draft Tables and Relationships

把对象落成表、主键、查找关系、选项集与必填字段，顺手标注哪些列由自动化写入、哪些列由人工维护。 || Turn those objects into tables, keys, lookups, choices, and required columns, and mark which fields are automation-written versus manually maintained.

所需资产 || Asset

逻辑数据模型 || Logical Data Model

准备人 || Prepared by

System Customizer

3

信息安全 + 数据 owner || Security + Data Owner

### 标注敏感字段 || Classify Sensitive Fields

给表和字段打上数据等级、保留期和审计要求，指出哪些字段需要字段级安全，哪些表不能跨业务单元共享。 || Tag tables and columns with data classification, retention, and audit requirements, and call out which fields need field-level security and which tables cannot be shared across business units.

所需资产 || Asset

数据分级清单 || Data Classification Sheet

准备人 || Prepared by

信息安全代表 || Security Rep

4

架构师 || Architect

### 写回设计包 || Write Back to the Design Pack

把表清单、关系图、敏感字段和未决问题写回设计包，明确 Stage 4 创建环境前必须先关闭哪些建模 blocker。 || Write the table list, relationship map, sensitive fields, and open issues back into the design pack, and make clear which modeling blockers must close before Stage 4 provisioning starts.

所需资产 || Asset

模型决议页 || Model Decision Page

准备人 || Prepared by

解决方案架构师 || Solution Architect

完成判定 || Done

设计包里有一份明确的 Dataverse 表、关系、敏感字段和数据 owner 列表，团队不再靠口头理解做模型。 || The design pack contains a clear Dataverse table list, relationship map, sensitive fields, and data owners, so the team is no longer modeling from verbal assumptions.

## #design-topology 14 / 06.2 · Stage 3 · Env Topology :: 任务 8 · 环境拓扑蓝图 || Task 8 · Environment Topology Blueprint

先把 Dev / Test / Prod 的边界、区域、安全组和容量想清楚，再让管理员去创建环境。 || Decide the Dev/Test/Prod boundaries, region, security groups, and capacity first, then let admins provision against that plan.

1

架构师 || Architect

### 选定环境形态 || Choose the Environment Shape

先决定是否需要独立 Production、专属 Sandbox、跨区域隔离，以及哪些人必须被安全组挡在环境外。 || Decide whether the workload needs a dedicated Production, its own Sandbox, cross-region separation, and which users must be kept out through security groups.

所需资产 || Asset

环境拓扑草图 || Topology Sketch

准备人 || Prepared by

解决方案架构师 || Solution Architect

2

Power Platform 管理员 || Power Platform Admin

### 复核平台前置条件 || Check Platform Prerequisites

检查区域可用性、可用容量、Managed Environments、环境命名规范和创建权限，不能满足的地方直接标为 blocker。 || Check region availability, spare capacity, Managed Environments, environment naming rules, and creation permissions, and mark anything unsupported as a blocker.

所需资产 || Asset

租户环境基线 || Tenant Environment Baseline

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

3

架构师 + 集成负责人 || Architect + Integration Lead

### 画出系统接线图 || Map the Integration Paths

标出每个环境要连哪些系统、哪些网关、哪些接口会触发 DLP 或网络审批，避免环境建好了才发现数据过不去。 || Map which systems, gateways, and interfaces each environment needs and flag the ones that trigger DLP or network review, so you do not discover blocked data paths after provisioning.

所需资产 || Asset

集成路径图 || Integration Map

准备人 || Prepared by

解决方案架构师 || Solution Architect

4

Power Platform 管理员 || Power Platform Admin

### 冻结创建清单 || Freeze the Provisioning Checklist

把环境名、区域、安全组、Managed Environments 开关、容量预留和创建顺序写成一张可执行清单，直接交给 Stage 4。 || Turn the environment names, regions, security groups, Managed Environments flags, capacity reservation, and creation order into an executable checklist for Stage 4.

所需资产 || Asset

环境创建清单 || Provisioning Checklist

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

完成判定 || Done

团队对 Dev / Test / Prod 的边界、区域、安全组和容量有一份可执行清单，不会在创建环境当天边做边猜。 || The team has an executable checklist for Dev/Test/Prod boundaries, region, security groups, and capacity instead of improvising on provisioning day.

任务 8 参考 || Task 8 Reference

**容量分配 · 上半部分（Storage / Copilot Credits / AI Builder） || Capacity Allocation · Part 1 (Storage / Copilot Credits / AI Builder)**

需要查询存储、Copilot Credits 或 AI Builder 容量的来源、分配方式或超额阈值时展开。完整 6 类容量分两段呈现，后 3 类见 Part 2。 || Expand to look up the source, allocation model, or overage threshold for storage, Copilot Credits, or AI Builder. The full six-type capacity reference is split into two parts; see Part 2 for the remaining three pools.

- **Dataverse 存储 || Dataverse storage** — **单位：**GB（拆为 Database / File / Log 三池）。**分配：**租户池由默认额 + 每用户许可累计 + 加购构成，PPAC 中按环境预分配。**超额：**剩余 15% 首次警告，5% 运营影响警告，超额后环境的创建 / 复制 / 还原被阻断；默认环境拥有独立 3+3+1 GB 额度。 || **Unit:** GB (split into Database / File / Log pools). **Allocation:** tenant pool = sign-up default + per-user license accruals + add-ons; preallocated per environment in PPAC. **Overage:** 15% remaining = first warning, 5% = ops impact warning; once in overage, create/copy/restore in the environment is blocked. Default env has its own 3+3+1 GB quota.
- **Copilot Credits** — **单位：**Copilot Credits / 月（取代旧的 Copilot Studio Messages，是 Copilot Studio 各能力的统一货币）。**分配：**租户池由预付包订阅或按量计费提供，PPAC › Licensing › Copilot Studio 中按环境分配，可对单个 agent 设月度封顶。**超额：**租户消耗达 125% 时自定义 agent 被禁用；agent flow 单独触发 enforcement，先停新 run 不停整个 agent；接 Azure 订阅启用 pay-as-you-go 则不触发 enforcement。 || **Unit:** Copilot Credits per month (replaces the legacy Copilot Studio Messages; the common currency across Copilot Studio capabilities). **Allocation:** tenant pool from prepaid pack subscription or pay-as-you-go; allocated per environment in PPAC › Licensing › Copilot Studio, with per-agent monthly caps available. **Overage:** custom agents are disabled when tenant consumption hits 125%; agent flow enforcement is separate — it blocks new flow runs without disabling the agent. Linking an Azure subscription for pay-as-you-go avoids enforcement.
- **AI Builder credits（遗留通道） || AI Builder credits (legacy)** — **单位：**AI Builder credits / 月。**分配：**同 Copilot Credits 模式，PPAC 中按环境分配。**超额：**当月 AI Builder credits 用尽时改用 Copilot Credits；两者都耗尽则 model run 被阻断，credits 不滚存。**注意：**新客户不能购买 AI Builder add-on，仅老客户续订；seeded credits 2026 年 11 月移除 — 新设计应优先规划 Copilot Credits。 || **Unit:** AI Builder credits per month. **Allocation:** same model as Copilot Credits, allocated per environment in PPAC. **Overage:** within a month, exhausted AI Builder credits fall back to Copilot Credits; if both are out, model runs are blocked. Credits do not roll over. **Note:** AI Builder add-ons are renewal-only for existing customers; seeded credits are removed in November 2026 — design new workloads around Copilot Credits.

**容量分配 · 下半部分（Requests / RPA / Pages logins） || Capacity Allocation · Part 2 (Requests / RPA / Pages logins)**

需要查询 API 请求、Power Automate Process / Hosted RPA 或 Power Pages 登录配额时展开。 || Expand to look up API requests, Power Automate Process / Hosted RPA, or Power Pages login allocation.

- **Power Platform Requests** — **单位：**请求数 / 24h 滚动窗口（涵盖 Dataverse API 调用、connector 调用、Power Automate flow action）。**分配：**按用户许可累积到租户池，不是按环境分配。**超额：**触发节流（throttling）而非阻断，运行变慢但不会强制停止；持续超额需购买 Power Platform Requests add-on 或升级许可。 || **Unit:** requests per 24-hour rolling window (covers Dataverse API calls, connector calls, Power Automate flow actions). **Allocation:** accrued from user licenses to a tenant pool; not allocated per environment. **Overage:** throttled rather than blocked — runs slow down but do not hard-stop. Sustained overage requires a Power Platform Requests add-on or higher-tier license.
- **Power Automate · Process / Hosted RPA** — **单位：**Process plan（按工作流计费）与 Hosted RPA bot（按并发计费）。**分配：**按环境绑定 process / hosted bot 容量。**超额：**新的 unattended desktop flow 触发失败；attended desktop flow 由 Power Automate Premium 用户许可提供，不消耗 process 容量。 || **Unit:** Process plans (billed per workflow) and Hosted RPA bots (billed per concurrency). **Allocation:** process / hosted bot capacity is bound per environment. **Overage:** new unattended desktop flow triggers fail; attended desktop flows come from Power Automate Premium user licenses and do not draw on process capacity.
- **Power Pages logins** — **单位：**authenticated user logins / 月 与 anonymous user logins / 月（独立计量）。**分配：**按站点的付费 SKU 配置，不在 PPAC 容量池里分配。**超额：**按月活登录梯度计费，不阻断站点访问，但会触发额外费用 — 治理重点是站点 SKU 选型与登录预测。 || **Unit:** authenticated user logins per month and anonymous user logins per month (metered separately). **Allocation:** set by each site's paid SKU configuration; not allocated from a PPAC capacity pool. **Overage:** tiered billing on monthly logins — site access is not blocked but extra charges accrue. Governance focus is SKU selection and login forecasting per site.

> **Separate domain:**
> Dataverse capacity-based storage
> Copilot Credits billing & overage
> AI Builder licensing
> Power Platform Requests limits
> Process plan & Hosted RPA
> Power Pages billing
> Fabric capacity

## #design-alm 15 / 06.3 · Stage 3 · ALM Layout :: 任务 9 · ALM 解决方案布局 || Task 9 · ALM Solution Layout

别等到开始开发才想解决方案怎么拆、代码放哪里、发布怎么回滚；这些都要在 Stage 3 先定。 || Do not wait until development starts to decide solution boundaries, where the source lives, or how rollback works; lock those in Stage 3.

1

DevOps

### 切分解决方案边界 || Split Solution Boundaries

决定哪些组件属于核心解决方案，哪些属于共享或扩展解决方案，明确 Dev 用 unmanaged、发布用 managed 的边界。组件清单覆盖 canvas / model-driven app、Power Automate flow、Copilot Studio agent、Dataverse 表与关系、connection reference、environment variable — 全部走同一条 solution 通道。 || Decide which components belong in the core solution versus shared or extension solutions, and make the unmanaged-in-Dev / managed-in-release boundary explicit. The component inventory covers canvas / model-driven apps, Power Automate flows, Copilot Studio agents, Dataverse tables & relationships, connection references, and environment variables — all travelling through the same solution pipeline.

所需资产 || Asset

解决方案清单 || Solution Inventory

准备人 || Prepared by

DevOps 工程师 || DevOps Engineer

2

DevOps

### 锁定代码仓与分支策略 || Lock Repo and Branching

确定源码仓、分支模型、导出节奏，以及到底走 Power Platform Pipelines 还是 Azure DevOps / GitHub Actions。 || Lock the source repository, branching model, export cadence, and whether releases flow through Power Platform Pipelines or Azure DevOps / GitHub Actions.

所需资产 || Asset

ALM 蓝图 || ALM Blueprint

准备人 || Prepared by

DevOps 工程师 || DevOps Engineer

3

架构师 + Power Platform 管理员 || Architect + Power Platform Admin

### 登记部署变量 || Register Deployment Variables

列出环境变量、连接引用、服务主体、网关和机密来源，明确哪些在部署时注入，哪些由管理员预先创建。 || List environment variables, connection references, service principals, gateways, and secret sources, and separate what is injected during deployment from what admins must pre-create.

所需资产 || Asset

部署变量清单 || Deployment Variable Sheet

准备人 || Prepared by

解决方案架构师 + PP 管理员 || Solution Architect + PP Admin

4

DevOps

### 写发布与回滚规则 || Write Release and Rollback Rules

把导出、导入、验证、审批闸门与回滚动作写成运行手册，避免把 Test / Prod 当成第一次试发布的地方。 || Write export, import, validation, approval gates, and rollback moves into a runbook, so Test and Prod are not the first places where release is attempted.

所需资产 || Asset

发布运行手册 || Release Runbook

准备人 || Prepared by

DevOps 工程师 || DevOps Engineer

5

DevOps + Power Platform 管理员 || DevOps + Power Platform Admin

### 锁定 agent 渠道与发布通路 || Lock Agent Channels and Publish Paths

For each agent, list the target channels (Demo Site, Custom Canvas, Microsoft Teams,

Microsoft 365 Copilot Chat

) and write down the extras: after solution import, recreate connections in the target environment, bind Copilot Credits capacity, and validate knowledge sources; Teams publishing needs a Cloud Application Administrator to register the bot channel; Microsoft 365 Copilot Chat publishing requires

AI Administrator approval in M365 admin center › Integrated apps

— without it, the agent is invisible to the target tenant. Add these channel steps to the Release Runbook, and make the rollback section cover channel takedown too.

所需资产 || Asset

Agent 渠道发布矩阵 || Agent Channel Publish Matrix

准备人 || Prepared by

DevOps 工程师 + PP 管理员 || DevOps Engineer + PP Admin

完成判定 || Done

团队有一份统一 ALM 蓝图：解决方案边界、代码仓、部署变量、发布回滚规则、渠道发布矩阵都在纸面上，Test / Prod 不会成为渠道发布的第一现场。 || The team has a single ALM blueprint: solution boundaries, source control, deployment variables, release / rollback rules, and the channel publish matrix are all on paper — Test and Prod are not the first place a channel goes live.

## #design-dlp 16 / 06.4 · Stage 3 · DLP Exceptions :: 任务 10 · DLP 例外复核 || Task 10 · DLP Exception Review

DLP 例外不能只在会议里口头通过；要在 Stage 3 就带着 owner、缓解措施和到期时间写清楚。 || DLP exceptions cannot stay as verbal approvals; Stage 3 needs a written record with owner, mitigations, and expiry.

1

信息安全代表 || Security Rep

### 对照租户 DLP 基线 || Check the Tenant DLP Baseline

把方案需要的连接器逐一对照租户 DLP，标出哪些已允许、哪些冲突、哪些根本不能落地。 || Compare every connector the design needs against the tenant DLP baseline and mark what is allowed, what conflicts, and what is impossible to land as-is.

所需资产 || Asset

连接器清单 || Connector Inventory

准备人 || Prepared by

信息安全代表 || Security Rep

2

架构师 || Architect

### 解释例外必要性 || Explain Why the Exception Is Needed

对于跨组连接器或敏感数据路径，说明业务目标为什么离不开它，以及不用它时的替代架构和成本。 || For every cross-group connector or sensitive data path, explain why the business outcome depends on it and what the fallback architecture and cost would be without it.

所需资产 || Asset

例外论证单 || Exception Rationale

准备人 || Prepared by

解决方案架构师 || Solution Architect

3

信息安全代表 || Security Rep

### 起草缓解与到期规则 || Draft Mitigations and Expiry

把例外范围、适用环境、补偿控制、到期时间和复审 owner 写进正式记录，而不是只在会后纪要里留一句话。 || Write the exception scope, target environments, compensating controls, expiry date, and review owner into a formal record instead of burying approval in meeting notes.

所需资产 || Asset

DLP 例外申请 || DLP Exception Request

准备人 || Prepared by

信息安全代表 || Security Rep

4

Power Platform 管理员 || Power Platform Admin

### 冻结执行时点 || Freeze the Enforcement Timing

明确哪些策略在 Stage 4 创建环境时就下发，哪些留到 Stage 6 发布前执行，防止例外长期悬而未决。 || State which policies are enforced as early as Stage 4 provisioning and which wait until later release gates, so exceptions do not stay open indefinitely.

所需资产 || Asset

DLP 执行清单 || DLP Enforcement Checklist

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

完成判定 || Done

DLP 例外已经变成带 owner、缓解措施和到期时间的正式清单，平台团队知道什么时候执行什么策略。 || DLP exceptions now exist as a formal list with owner, mitigations, and expiry, and the platform team knows exactly when each policy change is enforced.

任务 10 参考 || Task 10 Reference

**治理控制 · DLP 策略与监控工具链全栈 || Governance Controls · DLP Policies & Monitoring Toolchain**

需要查看 DLP 三层分类规则、Managed Environments 特性或 CoE 监控清单时再展开。 || Expand for the three-tier DLP classification, Managed Environments features, or the CoE monitoring checklist.

预防 || Preventive

**数据策略（DLP） || Data Policies (DLP)**

将连接器划分为 Business / Non-Business / Blocked。不同组的连接器不能同时存在于一个应用或流。生效时延：通常 <1 小时，大规模环境可达 24 小时。违规应用 / 流会被暂停。 || Classify connectors into Business / Non-Business / Blocked groups. Connectors in different groups cannot coexist in one app or flow. Enforcement latency: typically <1 hour, up to 24h at scale. Violations cause apps/flows to be suspended.

高级 || Premium

**Managed Environments**

添加共享限制、使用洞察、扩展备份、解决方案检查器、IP 防火墙、客户托管密钥与 Lockbox。包含于独立 PP / D365 许可；Developer Plan 不含。 || Adds sharing limits, usage insights, extended backup, solution checker, IP firewall, Customer Managed Key, and Lockbox. Included with standalone PP/D365 licenses. Not included with Developer Plan.

监控 || Monitoring

**管理中心视图 || Admin Center Views**

**Inventory** — 所有应用 / 流 / 代理。**Usage** — 采纳跟踪。**Monitor** — 运行健康。**Actions** — 风险与建议。取代 CoE Starter Kit 作为主要治理工具。 || **Inventory** — all apps/flows/agents. **Usage** — adoption tracking. **Monitor** — operational health. **Actions** — risks & recommendations. Replaces CoE Starter Kit as primary governance tool.

网络 || Network

**条件访问与 Intune || Conditional Access & Intune**

Entra ID P1/P2 条件访问策略针对 Power Apps / Automate 按用户、设备或地点生效。Intune 在 iOS / Android 上提供移动应用保护。 || Entra ID P1/P2 conditional access policies for Power Apps/Automate based on user, device, or location. Intune mobile app protection on iOS/Android.

> Data policies
> Managed Environments
> CoE Starter Kit transition

## #design-roles 17 / 06.5 · Stage 3 · Role Matrix :: 任务 11 · Dataverse 角色方案 || Task 11 · Dataverse Role Plan

把 persona 和最小权限在 Stage 3 就写清楚，避免上线时靠“先给个 Admin”救火。 || Map personas to least privilege in Stage 3 so go-live does not depend on handing out broad admin rights as a shortcut.

1

架构师 || Architect

### 映射业务角色 || Map Business Personas

把发起人、审批人、运营人员、支持人员等 persona 映射到要看哪些表、能做哪些动作、是否需要跨业务单元视角。 || Map sponsors, approvers, operators, and support personas to the tables they need, the actions they perform, and whether they require cross-business-unit visibility.

所需资产 || Asset

Persona × 数据动作矩阵 || Persona-Action Matrix

准备人 || Prepared by

解决方案架构师 || Solution Architect

2

Dataverse 管理员 || Dataverse Admin

### 拆分环境角色与数据角色 || Separate Environment and Data Roles

明确谁只需要 Environment Maker / Admin，谁还需要 Dataverse 安全角色，避免把“能建应用”和“能看数据”混成一个权限包。 || Separate who only needs Environment Maker/Admin from who also needs Dataverse security roles, so build permissions and data permissions are not bundled together by accident.

所需资产 || Asset

角色边界说明 || Role Boundary Notes

准备人 || Prepared by

Dataverse 管理员 || Dataverse Admin

3

架构师 || Architect

### 起草表级权限 || Draft Table-Level Privileges

逐表定义 Create / Read / Write / Delete / Assign / Share 权利和访问级别，标出哪些需要字段级安全和审计。 || Define Create / Read / Write / Delete / Assign / Share privileges and access levels per table, and mark where field-level security and audit are mandatory.

所需资产 || Asset

Dataverse 权限矩阵 || Dataverse Privilege Matrix

准备人 || Prepared by

解决方案架构师 || Solution Architect

4

信息安全 + CoE || Security + CoE

### 复核最小权限 || Review Least Privilege

检查是否有人被默认给了组织级读取、是否存在职责冲突，以及上线后谁有权审批角色变更。 || Check whether anyone has been given org-level read by default, whether separation-of-duties conflicts exist, and who owns post-go-live role change approval.

所需资产 || Asset

角色审批记录 || Role Review Log

准备人 || Prepared by

信息安全代表 + CoE || Security Rep + CoE

完成判定 || Done

团队有一份 persona 到环境角色 / Dataverse 权限的映射表，上线时无需靠临时授予宽泛 Admin 权限应急。 || The team has a persona-to-role map for both environment roles and Dataverse privileges, so go-live does not rely on giving broad admin rights as a shortcut.

## #design-approval 18 / 06.6 · Stage 3 · Sign-Off :: 任务 12 · 设计签核门 || Task 12 · Design Sign-Off Gate

签核必须形成明确的 Go / Hold 决议（而非模糊的口头共识），直接决定 Stage 4 能否开始创建环境。 || Sign-off requires an explicit Go / Hold decision rather than a vague consensus, directly determining whether Stage 4 can start provisioning.

1

架构师 || Architect

### 组装评审包 || Assemble the Review Pack

把数据模型、环境拓扑、ALM 布局、DLP 例外、角色方案和未决问题汇总成一份评审包，不让评委自己拼图。 || Bundle the data model, environment topology, ALM layout, DLP exceptions, role plan, and open issues into one review pack so reviewers do not have to piece the design together themselves.

所需资产 || Asset

设计评审包 || Design Review Pack

准备人 || Prepared by

解决方案架构师 || Solution Architect

2

CoE

### 主持设计评审 || Run the Design Review

按固定议程过一遍范围、架构、环境、DLP、角色和风险，确保每个 owner 都当场确认自己负责的部分。 || Run a fixed agenda through scope, architecture, environments, DLP, role plan, and risks so every owner confirms the part they are responsible for in the room.

所需资产 || Asset

评审议程 || Review Agenda

准备人 || Prepared by

CoE 负责人 || CoE Lead

3

发起人 + 信息安全 + PP 管理员 || Sponsor + Security + PP Admin

### 记录批准或 Hold || Record Approve or Hold

会议结果必须给出明确的 Go / Hold、附加条件、owner 和截止时间（拒绝模糊的“原则同意”）；未过项单独列为 blocker。 || The meeting outcome must record an explicit Go / Hold with named conditions, owners, due dates, and blockers called out separately — never a vague "in principle yes."

所需资产 || Asset

设计决议记录 || Design Decision Log

准备人 || Prepared by

CoE 负责人 || CoE Lead

4

CoE

### 盖章允许开工 || Stamp Approved for Provisioning

当所有 blocker 关闭后，在 Initiative 上盖章 "Approved for Provisioning"，正式把任务交给 Stage 4 的管理员与 DevOps。 || Once blockers are closed, stamp the Initiative as "Approved for Provisioning" and formally hand the work to the Stage 4 admin and DevOps owners.

所需资产 || Asset

签核状态记录 || Approval Status Record

准备人 || Prepared by

CoE 负责人 || CoE Lead

完成判定 || Done

Initiative 已被明确标记为 "Approved for Provisioning" 或带条件 Hold，Stage 4 团队拿到的是冻结后的设计包，不是会后口头共识。 || The Initiative is explicitly marked as "Approved for Provisioning" or held with named conditions, and the Stage 4 team receives a frozen design pack instead of a verbal meeting consensus.

## #deliver 07 / Deliver · Stages 4–7 :: 把签核后的设计包变成在产稳定运行的应用 || Turn a Signed Design Pack Into a Production-Stable Application

交付与运营期承接 Task 12 盖章后的设计包，覆盖 §03 地图 Stage 4–7 全部 22 个任务胶囊。与 Discover / Design 不同，交付期一个 Task 卡片是一组 stage 胶囊的打包：T13 打包 Stage 4 的平台操作胶囊，T14 打包 Stage 4 的身份与 DLP 激活胶囊，T15 / T16 / T17 分别打包 Stage 5 / 6 / 7。因此每个 Task 卡片的 step 数量 = 该胶囊包里胶囊的个数（2 / 3 / 5 / 5 / 6），step 与胶囊是 1:1 对应，可以在 PR 与会议里逐项核对。超出官方胶囊的实践建议（如 Managed Environments、冗余验收）跟在对应 Task 卡片的折叠“工程建议”中，不混入主路径。 || The Deliver & Operate phase picks up the design pack signed off in Task 12 and covers all 22 task cells of &sect;03 map Stages 4–7. Unlike Discover / Design, in Deliver each Task card bundles a group of stage cells: T13 bundles the Stage 4 platform-operations cells, T14 bundles the Stage 4 identity & DLP-activation cells, and T15 / T16 / T17 bundle Stage 5 / 6 / 7 respectively. Therefore the step count per Task card equals the number of cells in that bundle (2 / 3 / 5 / 5 / 6); each step maps 1:1 to one cell so it can be ticked off in a PR or meeting. Practice recommendations that go beyond the official cells (Managed Environments, additional acceptance checks, etc.) live in a collapsible “Engineering Recommendations” block on each Task card and are kept off the main path.

交付 Deliver || Deliver

·

Stage 4–7

·

构建、上线、稳定运营 || Build, ship, and run steady-state

13

Provision & Capacity

就绪平台环境 || Stand up the platform

→

14

Identity & DLP Activation

许可与策略落地 || Licenses and policies live

→

15

Build & UAT

Dev 构建并验证 || Implement and validate

→

16

Promote & Cutover

发布并接住用户 || Ship and catch users

→

17

Steady-State Operations

监控、修复、复盘 || Monitor, fix, review

## #task-provision 20 / 07.1 · Stage 4 · Provision & Capacity :: 任务 13 · 环境与容量配置 || Task 13 · Provision Environments & Capacity

按设计包创建 Dev / Test / Prod 三套环境，分配 Dataverse 容量，并在 Production 上启用 Managed Environments，确保所有后续动作都落在受控边界内。 || Create the Dev / Test / Prod environments per the design pack, allocate Dataverse capacity, and enable Managed Environments on Production so every later action happens inside a controlled boundary.

1

Power Platform 管理员 || Power Platform Admin

### 创建 Dev / Test / Prod 三套环境 || Create Dev / Test / Prod Environments

在 Power Platform 管理中心按 Task 8 锁定的拓扑分别创建 Dev / Test / Prod，选择正确的 region、type（Production / Sandbox）和 Dataverse 选项，并为每个环境登记具名 owner。 || In the Power Platform admin center, create Dev / Test / Prod following the topology locked in Task 8, choosing the correct region, type (Production / Sandbox), and Dataverse option, and record a named owner for each.

所需资产 || Asset

环境创建记录 || Environment Creation Record

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

2

Power Platform 管理员 || Power Platform Admin

### 按环境切分 Dataverse 容量 || Allocate Dataverse Capacity per Environment

把 Task 4 估算的 Database / File / Log 容量按 Production 优先分配到三个环境，并按官方建议打开容量阈值告警。 || Allocate the Database / File / Log capacity estimated in Task 4 to the three environments with Production first, and enable capacity threshold alerts per Microsoft Learn guidance.

所需资产 || Asset

容量分配表 || Capacity Allocation Sheet

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

完成判定 || Done

Dev / Test / Prod 三个具名环境就位，容量已按设计切分，每个环境都登记了具名 owner。 || Three named Dev / Test / Prod environments exist with capacity sliced per design, and each has a named owner on file.

**工程建议 · 超出 §03 胶囊的可选加固 || Engineering Recommendations · Optional Hardening Beyond the &sect;03 Map**

不在官方 22 个胶囊中，但是广被采纳的实践加固，推荐但不是必须。 || Not in the official 22 cells but widely adopted operational hardening; recommended, not required.

- **对 Production 启用 Managed Environments**：把 weekly digest、sharing limits、solution checker 强制规则从“建议”变成“默认开”。来源：[Managed Environments 概述](https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-overview)。 || **Enable Managed Environments on Production**: moves weekly digests, sharing limits, and the solution-checker enforcement from ‘recommended’ to ‘on by default’. Source: [Managed Environments overview](https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-overview).
- **CoE 验收清单**：在放行 Task 14 之前由 CoE 对照设计包逐项核对名称规范、备份 owner 与安全组绑定设置。 || **CoE acceptance checklist**: before T14 is released, have CoE walk the design pack item by item for naming convention, backup owner, and security-group binding.

## #task-identity-dlp 21 / 07.2 · Stage 4 · Identity & DLP :: 任务 14 · 身份与 DLP 激活 || Task 14 · Identity & DLP Activation

把许可、安全组、环境角色和 DLP 策略真正"打开"，让团队首次登录环境时就处在受控边界里，而不是事后补丁。 || Actually turn on licenses, security groups, environment roles, and DLP policies so the team lands inside the controlled boundary on first login instead of being patched in afterwards.

1

License Admin

### 分配用户许可 || Assign User Licenses

在 Microsoft 365 admin center 按 Task 4 估算的 Premium / Per-app / Per-user 类型精确分配，留下分配清单。 || In Microsoft 365 admin center, assign Premium / Per-app / Per-user licenses exactly as estimated in Task 4, and keep the assignment list.

所需资产 || Asset

许可分配清单 || License Assignment Manifest

准备人 || Prepared by

License Admin

2

User Admin + Power Platform 管理员 || User Admin + PP Admin

### 安全组绑定环境角色 || Bind Security Groups to Environment Roles

按 Task 11 的角色方案把 Environment Maker / Admin 与 Dataverse 安全角色都绑到 Entra 安全组上，而不是直接给个人，让人员变动只改组员。 || Per the Task 11 role plan, bind Environment Maker / Admin and Dataverse security roles to Entra security groups (not directly to individuals) so people moves only change group membership.

所需资产 || Asset

组-角色绑定记录 || Group-to-Role Binding Record

准备人 || Prepared by

User Admin + PP 管理员 || User Admin + PP Admin

3

信息安全 + Power Platform 管理员 || Security + PP Admin

### 下发 DLP 策略与例外 || Apply DLP Policies and Exceptions

按 Task 10 通过的连接器分组与例外清单创建租户级和环境级 DLP 策略，明确 Business / Non-Business / Blocked 边界，并把例外的复核周期写进 KPI。 || Using the connector groups and exception list approved in Task 10, create tenant-scoped and environment-scoped DLP policies with explicit Business / Non-Business / Blocked boundaries, and put exception review cadence into the governance KPI.

所需资产 || Asset

DLP 策略发布记录 || DLP Policy Publication Record

准备人 || Prepared by

信息安全 + PP 管理员 || Security + PP Admin

完成判定 || Done

目标用户拿到许可、安全组与角色都已绑好、DLP 在目标环境已激活。 || Target users have licenses, security groups are bound to environment roles, and DLP policies are active on target environments.

**工程建议 · 超出 §03 胶囊的可选加固 || Engineering Recommendations · Optional Hardening Beyond the &sect;03 Map**

不在官方 22 个胶囊中，但是广被采纳的实践加固，推荐但不是必须。 || Not in the official 22 cells but widely adopted operational hardening; recommended, not required.

- **DLP 与权限冒烟测试**：用一个测试 Maker 账号在 Dev 上跑两条流——一条命中允许的连接器组合，一条故意触发 Blocked 组合——确认报错与权限符合设计。 || **DLP and role smoke test**: with a test Maker account in Dev, run two flows—one hitting an allowed connector combination, one deliberately hitting a Blocked combination—and confirm error and access result match the design.

## #task-build-uat 22 / 07.3 · Stage 5 · Build & UAT :: 任务 15 · Dev 构建与 UAT 验收 || Task 15 · Build in Dev & UAT Sign-Off

在 Dev 把设计落成可导出的托管解决方案，搭起 ALM 管道，并用真实用户在 Test 跑 UAT，把"做完没"换成可被验收的证据。 || In Dev, turn the design into an exportable managed solution, stand up the ALM pipeline, and let real users run UAT in Test so "is it done?" is answered by evidence rather than opinion.

1

Maker（公民开发者 → 专业开发者） || Maker (citizen → pro-dev)

### 在 Dev 构建应用 / 流 / 代理 || Build App / Flow / Agent in Dev

按 Task 9 锁定的解决方案布局在 Dev 构建应用 / 流 / 代理，所有改动都放进非默认解决方案，并按 Task 7 的数据模型创建表与关系。 || Follow the solution layout locked in Task 9 and build apps / flows / agents inside a non-default solution in Dev, creating tables and relationships per the Task 7 data model.

所需资产 || Asset

Dev 解决方案包 || Dev Solution Package

准备人 || Prepared by

Maker

2

架构师 || Architect

### 配置 Dataverse 安全角色 || Configure Dataverse Security Roles

按 Task 11 的角色方案在 Dev 与 Test 配置 Dataverse 安全角色和表权限，让数据访问从一开始就跟设计一致。 || Per the Task 11 role plan, configure Dataverse security roles and table privileges in Dev and Test so data access matches the design from day one.

所需资产 || Asset

Dataverse 安全角色配置 || Dataverse Role Configuration

准备人 || Prepared by

架构师 || Architect

3

DevOps 工程师 || DevOps Engineer

### 搭建 CI/CD 管道 || Set Up CI/CD Pipeline

把解决方案接入源码，配置 Power Platform Pipelines 或 Azure DevOps Build Tools，让 Dev → Test → Prod 的导出 / 导入是命令而不是手动操作。 || Hook the solution into source control and configure Power Platform Pipelines or Azure DevOps Build Tools so Dev → Test → Prod export / import is a command, not a manual action.

所需资产 || Asset

CI/CD 管道配置 || CI/CD Pipeline Config

准备人 || Prepared by

DevOps 工程师 || DevOps Engineer

4

最终用户 || End Users

### 在 Test 执行 UAT || Run UAT in Test

通过管道把解决方案以 managed 形式导入 Test，按 Task 2 设定的成功指标和测试用例在 Test 跑 UAT，把缺陷分类（Block / Major / Minor）。 || Promote the solution to Test as managed via the pipeline, then run UAT in Test against the success metric and test cases defined in Task 2; categorize defects as Block / Major / Minor.

所需资产 || Asset

UAT 执行记录 || UAT Execution Log

准备人 || Prepared by

最终用户 || End Users

5

架构师 || Architect

### 按设计验证 UAT 结果 || Verify UAT Results Against the Design

架构师把 UAT 结果与 Task 6–9 的设计、Task 2 的成功指标逐项核对，所有 Block 缺陷关闭后再进入 Stage 6。 || The architect verifies UAT results line-by-line against the Task 6–9 designs and the Task 2 success metric; Stage 6 only starts after all Block defects are closed.

所需资产 || Asset

UAT 验收报告 || UAT Verification Report

准备人 || Prepared by

架构师 || Architect

完成判定 || Done

Dev 解决方案可经管道部署到 Test、Dataverse 安全角色就位、UAT 覆盖 Task 2 的成功指标、架构师按设计验证通过且所有 Block 缺陷已关闭。 || The Dev solution deploys to Test via the pipeline, Dataverse roles are in place, UAT covers the Task 2 success metric, and the architect’s design verification passes with all Block defects closed.

## #task-promote 23 / 07.4 · Stage 6 · Promote & Cutover :: 任务 16 · 上 Prod 与用户切换 || Task 16 · Promote to Prod & Cutover

通过管道把通过 UAT 的解决方案搬到 Prod，做最后一次 DLP / 合规复核，再用受控节奏把用户接进来，避免"上线即首日事故"。 || Promote the UAT-passed solution to Prod via the pipeline, run the final DLP / compliance check, and bring users in on a controlled cadence so go-live does not become day-one incident response.

1

DevOps 工程师 || DevOps Engineer

### 将托管解决方案发布到 Prod || Promote Managed Solution to Prod

用 Test → Prod 管道导入 managed 解决方案，禁止任何在 Prod 直接打开 maker 工具的非托管改动，保留每次部署的版本号与变更说明。 || Use the Test → Prod pipeline to import the managed solution; no unmanaged maker-portal edits are allowed in Prod, and every deployment keeps a version number and change note.

所需资产 || Asset

Prod 部署记录 || Prod Deployment Record

准备人 || Prepared by

DevOps 工程师 || DevOps Engineer

2

信息安全 + 合规 || Security & Compliance

### 最终 DLP 检查 || Final DLP Check

在 Prod 复核连接器实际命中情况、Managed Environments 设置、共享上限与 audit 日志，把所有偏离设计的项作为 blocker 处理。 || Re-verify on Prod which connectors are actually used, the Managed Environments settings, the sharing limits, and audit logs; anything drifting from the design is treated as a blocker.

所需资产 || Asset

Prod 合规验收单 || Prod Compliance Sign-Off

准备人 || Prepared by

信息安全 + 合规 || Security & Compliance

3

CoE

### 培训与传达 || Train & Communicate

按角色发放使用文档与短视频，明确支持邮箱、SLA 与升级路径，让用户上线第一天就知道遇到问题应当联系谁。 || Publish role-specific docs and short videos, name the support inbox, SLA, and escalation path so users know on day one who to contact when issues arise.

所需资产 || Asset

培训与支持包 || Training & Support Pack

准备人 || Prepared by

CoE

4

IT 运维 || IT Operations

### 切换最终用户 || Cut Over End Users

按业务单元分批把最终用户接入 Prod 应用，关闭旧路径，记录切换批次、对接人与回滚条件。 || Bring end users onto the Prod app in business-unit waves, close the legacy path, and record each wave’s scope, contact, and rollback criteria.

所需资产 || Asset

切换计划 || Cutover Plan

准备人 || Prepared by

IT 运维 || IT Operations

5

Power Platform 管理员 || Power Platform Admin

### 调优 Prod 环境设置 || Tune Prod Environment Settings

上线后基于真实使用量复核 Prod 的 Managed Environments、共享上限、容量与告警阈值，把首批观察结果固化进环境配置。 || After go-live, review Prod Managed Environments settings, sharing limits, capacity, and alert thresholds against real usage, and lock the first observations into the environment configuration.

所需资产 || Asset

Prod 环境调优记录 || Prod Env Tuning Log

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

完成判定 || Done

应用以 managed 形式发布到 Prod、最终 DLP 检查通过、培训与支持入口可达、最终用户分批切换完成、Prod 环境设置已按真实使用量调优。 || The managed app is live on Prod, the final DLP check passes, training and the support channel are reachable, end users are cut over in waves, and Prod environment settings are tuned to real usage.

**工程建议 · 超出 §03 胶囊的可选加固 || Engineering Recommendations · Optional Hardening Beyond the &sect;03 Map**

不在官方 22 个胶囊中，但是广被采纳的实践加固，推荐但不是必须。 || Not in the official 22 cells but widely adopted operational hardening; recommended, not required.

- **切换期护航 (hypercare)**：在首批切换之后的一段窗口内建立 hypercare 群组，DevOps / IT Ops / CoE 同步在线，按既定剧本处理 Sev-1 / Sev-2 事件。具体窗口长度（例如 72 小时、一周）由项目自定。 || **Cutover hypercare**: for a window after the first cutover wave, run a hypercare channel with DevOps / IT Ops / CoE on call and follow the agreed Sev-1 / Sev-2 incident playbook. The window length (e.g., 72 hours, one week) is set per project.

## #task-operate 24 / 07.5 · Stage 7 · Steady-State Operations :: 任务 17 · 稳态运营与持续优化 || Task 17 · Steady-State Operations & Continuous Improvement

上线之后把每周巡检、每月治理扫描、支持工单流转和季度 ROI 复盘固化下来，让治理成为日历事件而不是事故响应。 || After go-live, lock in the weekly inventory review, monthly governance scan, support-ticket loop, and quarterly ROI check so governance is a calendar event, not an incident response.

1

Power Platform 管理员 || Power Platform Admin

### 监控容量与健康度 || Monitor Capacity & Health

在管理中心跟踪容量趋势、failed flows、异常使用量与待处理 Actions，把发现归档到运营记录。 || Track capacity trends, failed flows, anomalous usage, and pending Actions in the admin center; archive findings in the operations log.

所需资产 || Asset

容量与健康度记录 || Capacity & Health Log

准备人 || Prepared by

Power Platform 管理员 || Power Platform Admin

2

信息安全 + 合规 || Security & Compliance

### 跟踪 DLP 与治理信号 || Watch DLP & Governance Signals

跟踪 DLP 违规事件、过度共享应用、孤儿应用与流，把发现转成 Maker 通知与撤销 / 归档动作。 || Watch DLP violations, over-shared apps, and orphaned apps / flows; convert findings into Maker notifications and revoke / archive actions.

所需资产 || Asset

治理信号台账 || Governance Signal Log

准备人 || Prepared by

信息安全 + 合规 || Security & Compliance

3

IT 运维 || IT Operations

### 处理支持工单 || Handle Support Tickets

IT 运维按优先级分诊用户工单，按 SLA 办结；超出运维范围的缺陷转交 Maker 进入下一胶囊。 || IT Ops triages user tickets by priority and closes them within SLA; defects beyond ops scope are handed to the Maker for the next step.

所需资产 || Asset

支持工单台账 || Support Ticket Log

准备人 || Prepared by

IT 运维 || IT Operations

4

Maker

### 通过管道修复缺陷 || Fix Bugs Back Through Pipeline

缺陷由 Maker 在 Dev 修复后走 ALM 管道经 Test 回到 Prod，禁止任何在 Prod 直接打补丁的临时操作。 || The Maker fixes defects in Dev and ships them back to Prod via Test through the ALM pipeline; no direct Prod hotfixes are allowed.

所需资产 || Asset

缺陷修复记录 || Bug Fix Log

准备人 || Prepared by

Maker

5

CoE

### 跟踪采纳 KPI || Track Adoption KPIs

跟踪活跃应用、活跃用户、违规率、新 Maker 数等采纳 KPI，发现采纳停滞时把对应议题送到指导委员会。 || Track adoption KPIs such as active apps, active users, violation rate, and new-Maker count; escalate stalled adoption to the steering committee.

所需资产 || Asset

采纳 KPI 仪表 || Adoption KPI Dashboard

准备人 || Prepared by

CoE

6

发起人 || Sponsor

### 复盘 ROI 并规划下一轮 Backlog || Re-evaluate ROI & Plan Next Backlog

对照 Task 2 的成功指标核算 ROI，把治理 KPI 与下一轮需求 backlog 汇报给指导委员会，决定继续投入或调整边界。 || Reconcile ROI against the Task 2 success metric, present governance KPIs and the next-round backlog to the steering committee, and decide whether to keep investing or adjust scope.

所需资产 || Asset

ROI 复盘报告 || ROI Review Report

准备人 || Prepared by

发起人 || Sponsor

完成判定 || Done

容量与健康度、DLP 与治理信号、支持工单、缺陷管道、采纳 KPI、ROI 复盘六条回路都在运行，每条都有责人、台账和升级路径。 || All six loops—capacity / health, DLP & governance signals, support tickets, bug-fix pipeline, adoption KPIs, ROI review—are running with named owners, logs, and an escalation path.

**工程建议 · 运营节奏与 SLA 模板 || Engineering Recommendations · Cadence & SLA Templates**

官方胶囊只规定“要做”，不规定“多久做一次”。下面是常用的运营节奏与 SLA 模板，按本组织节奏自行调整。 || The official cells say what to do, not how often. Below are common cadence and SLA templates; adjust to your organization’s rhythm.

- **容量与健康度**：每周固定时间巡检管理中心 Inventory / Usage / Monitor / Actions 四个视图。 || **Capacity & health**: weekly review of the admin-center Inventory / Usage / Monitor / Actions views at a fixed time.
- **DLP / 治理信号**：每月一次扫描，按 30 / 60 / 90 天 SLA 通知 Maker 并执行撤销 / 归档。 || **DLP / governance signals**: monthly sweep with a 30 / 60 / 90-day SLA for Maker notification, revoke, and archive.
- **采纳 KPI 与 ROI 复盘**：KPI 每月对外可见；ROI 与 backlog 每季度复盘一次，对齐指导委员会节奏。 || **Adoption KPIs & ROI review**: report KPIs monthly; review ROI and refresh the backlog quarterly, aligned to the steering committee.

## #references 08 / Official References :: 参考来源 || References

&sect;01–&sect;07 中所有论据的权威出处。所有 URL 均于 2026 年 5 月验证。 || The authoritative sources behind every claim in &sect;01–&sect;07. All URLs verified as of May 2026.

- Power Platform 安全与治理考量要点 || Security and governance considerations in Power Platform
- Microsoft Power Platform 许可概述 || Licensing overview for Microsoft Power Platform
- Dataverse 容量存储详情 || Dataverse capacity-based storage details
- Power Platform 环境概述 || Power Platform environments overview
- 在管理中心创建与管理环境 || Create and manage environments in the admin center
- Dataverse 安全角色与特权 || Security roles and privileges for Dataverse
- 数据策略 || Data policies
- Managed Environments 概述 || Managed Environments overview
- Power Platform 管理中心概述 || Overview of the Power Platform admin center
- CoE Starter Kit 向管理中心迁移 || CoE Starter Kit transition to admin center
- 管理与治理默认环境 || Manage and govern the default environment
- Power Platform 应用生命周期管理概述 || Overview of application lifecycle management with Power Platform
- ALM 环境策略 || Environment strategy for ALM
- 使用 Power Platform Pipelines 部署解决方案 || Deploy solutions using Power Platform pipelines
- Azure DevOps 中的 Power Platform Build Tools || Power Platform Build Tools for Azure DevOps

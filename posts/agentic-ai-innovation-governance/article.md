---
title: "Copilot Studio Agent 企业治理体系 || Copilot Studio Agent Enterprise Governance"
eyebrow: Official Copilot Studio Guidance
brand: Copilot Studio Governance
date: 2026-08-27
strict_i18n: true
strict_density: true
lead: "企业治理不是某个 Agent 项目的交付流程。它由 IT、CoE、安全、合规和数据 Owner 预先定义环境、Zone、访问、数据策略、发布准入与运营规则，让后续项目在清晰边界内交付。 || Enterprise governance is not the delivery process for one agent project. IT, the CoE, security, compliance, and data owners define environments, zones, access, data policies, release criteria, and operating rules in advance so later projects can deliver within clear boundaries."
hero_actions:
  - "查看治理制度 || View Governance Policy | #policy"
  - "配置分区与环境 || Configure Zones and Environments | #zoning"
panel_label: "治理目标 || Governance Objective"
panel_title: "治理要让团队知道：什么可以建、在哪里建、谁能访问、怎样发布、出了问题谁来处理。 || Governance must make clear what can be built, where it belongs, who can access it, how it is released, and who responds when it fails."
panel:
  - "将创新放入适当环境和数据边界 || Place innovation in the right environment and data boundary"
  - "用预防性控制替代事后追查 || Prefer preventive controls to retrospective investigation"
  - "将运行数据转成持续改进的决定 || Turn operating data into continuous improvement decisions"
metrics:
  - "建立时点 || When to Establish | Before | 在项目申请与规模化开发之前 || Before project intake and scaled development"
  - "治理责任 || Governance Accountability | Shared | CoE、IT、安全、合规与数据 Owner || CoE, IT, security, compliance, and data owners"
  - "首选控制 || Preferred Control | Built-in | 优先使用 Managed Environments 和平台原生策略 || Start with Managed Environments and native platform policies"
style:
  accent: "#c9a227"
  teal: "#c9a227"
---

## #why 01 / Why Governance :: 缺乏治理时，风险不再停留于纸面，而会直接波及日常业务 || Without Governance, Risk Enters Everyday Work

Power Platform 的目标是让业务更快构建应用、流程和 Agent；治理的目标是让这种速度不以数据泄露、不可持续的个人资产或未经审查的发布为代价。微软将治理定义为管理和控制平台使用的政策、实践与工具组合。[1] || Power Platform is designed to let the business build apps, flows, and agents faster. Governance ensures that speed does not trade away data protection, continuity for individually owned assets, or reviewed releases. Microsoft defines governance as the policies, practices, and tools used to manage and control platform use.[1]

:::insight-grid { cols: 3, title: "治理必须解决的三类业务风险 || Three Business Risks Governance Must Address" }
::card 01
### 数据越界 || Data Boundary Violations
Agent 可以连接组织数据、外部服务与 MCP 工具。没有数据策略，连接器、HTTP、知识源或发布渠道可能形成意外的数据外流路径。[3] || Agents can connect organizational data, external services, and MCP tools. Without data policies, connectors, HTTP, knowledge sources, or publishing channels can create unintended data-exfiltration paths.[3]

::card 02
### 业务连续性中断 || Business Continuity Gaps
个人离职后遗留的 ownerless 资源，以及默认环境中高价值资源缺少 ALM，都会让关键业务能力失去可维护性。[5] || Ownerless resources left after individuals depart, and high-value resources in the default environment without ALM, both create business-continuity risk.[5]

::card 03
### 变更失控 || Uncontrolled Change
数据策略既影响设计时能否保存，也影响运行时连接能否执行；策略更新会重新评估应用、流程和聊天机器人，违规资源可能被暂停或隔离。[4] || Data policies affect both design-time saves and runtime connections. Policy updates reevaluate apps, flows, and chatbots; violating resources can be suspended or quarantined.[4]
:::

## #relationship 02 / Governance Relationship :: Agent 治理依托 Power Platform 治理基座，并叠加 Agent 专属控制 || Agent Governance Builds on Power Platform Governance and Adds Agent-Specific Controls

两者不是互相替代的两套体系。Power Platform 治理为所有低代码资产建立通用的租户、环境、身份、连接、数据策略、容量与审计控制；Copilot Studio Agent 治理复用这些控制，再管理 Agent 的知识、工具、认证、渠道、运行时安全和对话质量。[1][8][10] || These are not two competing governance systems. Power Platform governance establishes tenant, environment, identity, connection, data-policy, capacity, and audit controls for all low-code assets. Copilot Studio agent governance reuses those controls and adds agent knowledge, tools, authentication, channels, runtime security, and conversation quality.[1][8][10]

:::comparison { title: "两类治理的范围与控制点 || Scope and Controls of Two Governance Layers" }
::versus 平台基座 || Platform Foundation
### Power Platform 治理 || Power Platform Governance
对象是 Apps、Flows、Dataverse、连接器和环境等所有平台资产。主要在 Power Platform admin center 设置环境类型、环境组、Environment routing、Microsoft Entra 组、角色、Data policy、容量和审计。 || The scope is all platform assets, including apps, flows, Dataverse, connectors, and environments. Controls are primarily set in Power Platform admin center: environment types and groups, Environment routing, Microsoft Entra groups, roles, Data policy, capacity, and audit.

::versus 专项治理 || Specialized Governance
### Copilot Studio Agent 治理 || Copilot Studio Agent Governance
对象是 Agent 及其 Knowledge、Topic、Action、Tool、HTTP、MCP、认证、发布渠道和对话记录。它在既有平台控制上，增加对知识接地、工具调用、渠道开放、运行时保护和回答质量的治理。 || The scope is agents and their Knowledge, Topics, Actions, Tools, HTTP, MCP, authentication, publishing channels, and transcripts. On top of platform controls, it governs grounding, tool calls, channel exposure, runtime protection, and response quality.
:::

:::callout { title: "环境、身份和 Data policy 由平台治理预先设定；项目在这些边界内配置 Agent；一旦 Agent 需要新知识源、新工具或新渠道，就同时触发平台控制与 Agent 专项审查。 || Platform governance preconfigures environments, identity, and Data policy. Projects configure agents within those boundaries. A new knowledge source, tool, or channel triggers both platform controls and agent-specific review." }
因此，企业应由同一治理机制协调两层责任，避免拆成两套互不相干的审批流程。 || Organizations should therefore coordinate the two layers through one governance mechanism, avoiding two disconnected approval processes.
:::

## #fit 02 / Enterprise Fit :: 企业应按 Agent 的影响范围启动治理，切勿按员工人数设门槛 || Start Governance by Agent Impact, Not Employee Count

微软的 Copilot Studio 指南没有以企业人数作为前提。它以用途、风险、技术复杂度、数据访问、受众和业务影响来划分治理强度。[9][10] 只要 Agent 从个人试验走向共享使用、接入组织数据或承担持续业务任务，无论企业规模，都应采用相应层级的治理。 || Microsoft's Copilot Studio guidance does not set an employee-count threshold. It scales governance by purpose, risk, technical complexity, data access, audience, and business impact.[9][10] When an agent moves beyond personal experimentation into shared use, organizational data, or sustained business work, organizations of any size should apply the appropriate governance level.

:::comparison { title: "适用企业与启动信号 || Enterprise Fit and Governance Start Signals" }
::versus 个人试验 || Personal Experimentation
### 以安全默认值开始 || Begin with Safe Defaults
面向个人或小团队、只读且在既有权限内使用的 Agent，适合 Zone 1。重点是隔离试验、限制共享，并让使用范围保持清楚。[10] || Agents for an individual or small team that are read-only and stay within existing permissions fit Zone 1. Focus on isolated experimentation, limited sharing, and a clear scope of use.[10]

::versus 部门服务 || Department Service
### 共享使用即应启动治理 || Shared Use Calls for Governance
当 Agent 服务部门、跨团队共享、使用批准的数据源或连接器时，应进入 Zone 2：由业务作者和 IT 共同负责环境、访问、发布与支持。[10][11] || When an agent serves a department, is shared across teams, or uses approved data sources or connectors, move to Zone 2. Business makers and IT then share responsibility for environment, access, publishing, and support.[10][11]

::versus 关键业务 || Critical Business
### 高影响场景需要完整治理 || High-Impact Scenarios Need Full Governance
当 Agent 写入业务系统、处理敏感数据、面向全组织或客户，或故障会影响服务承诺时，应采用 Zone 3 的专业开发、严格安全控制、测试和 ALM。[10][11][12] || When an agent writes to business systems, handles sensitive data, serves the organization or customers broadly, or its failure affects service commitments, use Zone 3 with professional development, strict security controls, testing, and ALM.[10][11][12]
:::

:::callout { title: "出现跨团队共享、组织数据接入、业务系统写入、对外发布或持续运营责任中的任一项，就应先核定治理要求与 Zone 分区。 || When any agent involves cross-team sharing, organizational data, writes to business systems, external publishing, or continuing operational accountability, establish governance requirements and a zone decision first." }
此举并非增设繁琐审批，核心在于确立环境、权限、数据策略、测试和运行责任的起点。[9][10][11] || Far from being an extra approval hurdle, this step establishes the starting point for environments, permissions, data policies, testing, and operational accountability.[9][10][11]
:::

## #concepts 03 / Governance Foundations :: 企业治理体系先建立四类规则，项目再在规则内运行 || Enterprise Governance Establishes Four Rule Sets Before Projects Operate Within Them

微软将租户、环境和 Agent 层的控制组合用于企业级治理。[8][10] 对企业而言，治理体系的交付物绝非一次性项目计划，其核心是一套可跨后续项目复用的规则、配置、审批路径与监督机制。 || Microsoft combines tenant-, environment-, and agent-level controls for enterprise governance.[8][10] For an organization, the governance deliverable goes beyond a one-off project plan to form a reusable set of rules, configurations, approval paths, and oversight mechanisms for later projects.

:::comparison { title: "企业治理体系的四个预置域 || Four Preconfigured Domains of Enterprise Governance" }
::versus 01
### 制度与责任 || Policy and Accountability
明确谁可申请、谁可构建、谁审批数据和发布、何时必须升级审查，以及 CoE 如何提供培训、标准与支持。 || Define who can request and build, who approves data and publishing, when escalation is required, and how the CoE provides training, standards, and support.

::versus 02
### 分区与环境 || Zones and Environments
按风险定义 Zone 1/2/3，并预置个人 Developer、专用开发、Sandbox 与 Production 环境，以及作者不进入 Default 的环境路由。 || Define Zones 1/2/3 by risk and preconfigure personal Developer, dedicated development, Sandbox, and Production environments, plus routing away from Default.

::versus 03
### 数据与访问控制 || Data and Access Controls
预先定义身份组、环境角色、允许的 Knowledge/连接器/端点、认证方式、共享限制和对外发布条件。 || Predefine identity groups, environment roles, permitted Knowledge, connectors, and endpoints, authentication, sharing limits, and external-publishing conditions.

::versus 04
### 监督与持续治理 || Oversight and Continuous Governance
定义资产盘点、审计、保护状态、容量、例外和整改的监控方式；项目运行产生证据，治理团队据此调整规则。 || Define how to monitor inventory, audit, protection status, capacity, exceptions, and remediation. Projects produce evidence that the governance team uses to adjust rules.
:::

## #objects 04 / Governed Objects :: 用对象清单把官方治理动作落实到可审查资源 || Use an Object Inventory to Make Official Governance Actions Reviewable

微软指南分别涵盖环境、角色、数据策略、Agent、解决方案、测试和运行信号。为便于工程落地，此处将其归纳为六类治理对象；该划分属于实操盘点清单，并非微软官方命名的“六类”模型。 || Microsoft's guidance addresses environments, roles, data policies, agents, solutions, testing, and operational signals. To make implementation practical, this framework organizes them into six governed object types as an operational inventory, not a Microsoft-named six-type model.

:::insight-grid { cols: 3, title: "六类治理对象 || Six Governed Object Types" }
::card 01
### 环境与环境组 || Environments and Groups
记录用途、地区、生命周期阶段、所属环境组、管理员和数据策略。环境组可将规则一致应用到关联的受管理环境。[2] || Record purpose, region, lifecycle stage, environment group, administrators, and data policy. Environment groups consistently apply rules to associated managed environments.[2]

::card 02
### 人员与权限 || People and Access
记录业务 owner、技术 owner、环境管理员、maker、审批人和运行支持人；按环境角色、资源权限和 Dataverse 角色实施最小权限。[1] || Record the business owner, technical owner, environment admin, maker, approver, and operational support contact. Apply least privilege through environment, resource, and Dataverse roles.[1]

::card 03
### 数据、知识与连接 || Data, Knowledge, and Connections
清点知识源、连接器、HTTP 端点、自定义连接器、MCP 工具和保存的连接凭据。对每一项明确数据类别、允许范围和认证方式。[3][4] || Inventory knowledge sources, connectors, HTTP endpoints, custom connectors, MCP tools, and saved connection credentials. Define data category, allowed scope, and authentication for each.[3][4]

::card 04
### Agent、Workflow 与 App || Agents, Workflows, and Apps
将业务场景、功能边界、人工接管、预期渠道和责任人绑定到每个可运行资产；解决方案中的组件应能随版本跨环境追溯。[6] || Bind business scenario, functional boundary, human escalation, intended channels, and accountable owner to every runnable asset. Components in a solution must be traceable across environments by version.[6]

::card 05
### 策略与发布记录 || Policies and Release Records
记录数据策略范围、连接器分组、例外批准、发布审批和回退方案。策略变更影响已运行资源，不能把保存策略直接视作稳妥上线。[4] || Record data-policy scope, connector grouping, approved exceptions, release approvals, and rollback plans. Policy changes affect live resources, so saving a policy never equates to a safe rollout.[4]

::card 06
### 运行证据 || Operating Evidence
保存测试结果、评测记录、使用指标、异常与转人工记录、变更历史和复盘决定。Copilot Studio Monitor 提供采用、会话结果和满意度等运行信号。[7] || Keep test results, evaluation records, usage metrics, failures and escalations, change history, and review decisions. Copilot Studio Monitor provides signals such as adoption, session outcomes, and satisfaction.[7]
:::

## #roles 05 / Governance Roles :: 治理并非 IT 单打独斗，需要六类角色协同担责 || Governance Is Shared Work Across Six Roles, Not an IT-Only Task

Copilot Studio 治理需要把业务目标、平台控制和租户运营分开负责。六类核心角色既可由不同团队分担，也可在小型企业中由同一人兼任；关键是每项企业级规则都有具名 Owner，项目团队据此申请和交付。[9][10][11][13][17] || Copilot Studio governance separates business objectives, platform controls, and tenant operations. Six core roles can sit with different teams or be combined in smaller organizations. The essential point is that every enterprise rule has a named owner, and project teams request and deliver against those rules.[9][10][11][13][17]

:::insight-grid { cols: 3, title: "Copilot Studio 治理的六类角色 || Six Roles in Copilot Studio Governance" }
::card 01
### 业务发起人与业务 Owner || Business Sponsor and Owner
提出场景、说明业务价值与用户范围，确认可接受的服务与风险，并在上线后对业务效果和人工接管负责。 || Propose the scenario, business value, and user scope; confirm acceptable service and risk; own business outcomes and human escalation after release.

::card 02
### 业务作者与 Agent Owner || Maker and Agent Owner
在获授权环境中配置 Knowledge、Topic、Action、Tool、认证和渠道；维护测试集，处理日常内容或行为变更。 || Configure Knowledge, Topics, Actions, Tools, authentication, and channels in authorized environments; maintain test sets and handle day-to-day content or behavior changes.

::card 03
### CoE 与治理负责人 || CoE and Governance Lead
制定命名、分区、培训和申请流程，协调业务与平台团队，跟踪资产、采用情况和治理待办。CoE 是组织能力，不等同于某个工具包。[17] || Define naming, zoning, training, and request processes; coordinate business and platform teams; track assets, adoption, and governance actions. A CoE is an organizational capability, not a toolkit.[17]

::card 04
### 平台与身份管理员 || Platform and Identity Admin
在 Power Platform admin center 创建环境、环境组与路由规则，分配环境和 Dataverse 角色，并用 Microsoft Entra 组管理成员资格。 || Create environments, environment groups, and routing rules in Power Platform admin center; assign environment and Dataverse roles; manage membership through Microsoft Entra groups.

::card 05
### 安全、合规与数据 Owner || Security, Compliance, and Data Owner
审查数据敏感度、保留、驻留、认证与对外发布要求；批准可用的知识源、连接器、端点和数据策略边界。 || Review data sensitivity, retention, residency, authentication, and external-publishing requirements; approve permitted knowledge sources, connectors, endpoints, and data-policy boundaries.

::card 06
### IT、专业开发与运营支持 || IT, Professional Development, and Operations
负责关键系统集成、网络与密钥、解决方案和部署管道；处理生产事故、容量、性能和需要升级的技术变更。 || Own critical system integration, networking and secrets, solutions and deployment pipelines; handle production incidents, capacity, performance, and escalated technical changes.
:::

## #requirements 06 / Governance Policy :: 由 CoE、IT 与控制 Owner 预先制定项目必须遵循的制度 || CoE, IT, and Control Owners Predefine the Policies That Projects Must Follow

治理制度把企业的业务目标、监管要求和平台能力转为可执行规则。它在项目开始前发布，至少覆盖项目申请、Zone 分类、数据与连接申请、发布准入和运行责任；业务 Owner 只能在这套制度内提出项目申请。[9][17] || Governance policy turns business objectives, regulatory requirements, and platform capabilities into enforceable rules. It is published before projects begin and covers project intake, zone classification, data and connection requests, release entry, and operating accountability. Business owners submit projects within this policy.[9][17]

:::callout { title: "发起与协调：企业负责人授权 CoE 或治理负责人建立制度；执行设计：平台、身份、安全、合规、法务与数据 Owner 共同形成规则。 || Initiate and coordinate: an enterprise sponsor authorizes the CoE or governance lead to establish policy. Design and execute: platform, identity, security, compliance, legal, and data owners jointly create the rules." }
批准：相应控制 Owner 批准其负责的身份、数据、合规和技术边界；企业负责人批准整体治理章程。业务 Owner 和作者是制度使用者，不是规则制定者。 || Approve: each control owner approves the identity, data, compliance, or technical boundary they own; an enterprise sponsor approves the overall governance charter. Business owners and makers use the policy; they do not define it.
:::

:::insight-grid { cols: 3, title: "治理要求需要回答的三个问题 || Three Questions Governance Requirements Must Answer" }
::card 01
### 项目准入规则 || Project Intake Rules
规定谁可提交场景、申请材料需要哪些事实、哪些条件触发 Zone 2/3 或安全与数据审查，以及谁作出准入决定。 || Define who can submit a scenario, the facts required in an intake, which conditions trigger Zone 2/3 or security and data review, and who makes the intake decision.

::card 02
### 数据与访问规则 || Data and Access Rules
规定哪些 Knowledge 来源、连接器、HTTP 端点、MCP 工具、认证方式和渠道可直接使用，哪些必须申请，哪些一律禁止。 || Define which Knowledge sources, connectors, HTTP endpoints, MCP tools, authentication methods, and channels are directly permitted, require approval, or are prohibited.

::card 03
### 发布与运行规则 || Release and Operations Rules
规定测试证据、审批角色、发布渠道、支持路径、审计与留存要求，以及何种运行信号触发整改、升级或停止。 || Define required test evidence, approval roles, publishing channels, support paths, audit and retention, and which operating signals trigger remediation, escalation, or retirement.
:::

:::accordion
::panel
### 制度发布前应留下什么 || What Should Exist Before Policy Is Published
一套可审查、可执行且能由项目团队直接引用的治理制度。 || A reviewable, enforceable governance policy that project teams can directly reference.

- 治理章程、角色 Owner 与项目准入、例外和升级路径 || Governance charter, role owners, and project intake, exception, and escalation paths
- Zone 判定标准、环境类型、路由规则与访问模型 || Zone criteria, environment types, routing rules, and access model
- 允许的数据与连接、发布条件、审计留存和治理复盘要求 || Permitted data and connections, release conditions, audit retention, and governance review requirements
:::

## #zoning 06 / Zoned Governance :: Zone 是环境与控制的治理分组，不是 Copilot Studio 中可单独创建的对象 || A Zone Is a Governance Grouping of Environments and Controls, Not a Copilot Studio Object

Zone 是微软用来按风险分层管理 Agent 的治理模型。实际操作时，管理员在 Power Platform admin center 创建或选择 Power Platform 环境，把环境纳入相应的数据策略和安全组，并在其中创建或部署 Copilot Studio Agent；这些环境及其规则组合在一起便构成了 Zone。环境决定 Agent 数据存放位置、谁能编辑、可用的连接器，以及开发、测试、生产如何隔离。[10] || A zone is Microsoft's governance model for managing agents by risk level. In practice, administrators create or select Power Platform environments in the Power Platform admin center, apply the appropriate data policies and security groups, then create or deploy Copilot Studio agents in those environments. Together, those environments and their rules form a zone. An environment determines where agent data resides, who can edit, which connectors are available, and how development, test, and production are separated.[10]

:::callout { title: "发起：业务 Owner 或业务作者依据已确认的场景申请 Zone；协调：CoE 提供分区标准并记录决定。 || Initiate: the business owner or maker requests a zone based on the confirmed scenario. Coordinate: the CoE provides zoning criteria and records the decision." }
参与：平台管理员、IT、安全和数据 Owner。执行：平台管理员创建或选择环境、环境组和路由规则。批准：业务 Owner 接受使用范围；安全和数据 Owner 批准数据与连接边界；IT 对 Zone 2/3 的集成和生产路径确认可行。 || Participate: platform admins, IT, security, and data owners. Execute: platform admins create or select environments, environment groups, and routing rules. Approve: the business owner accepts the usage scope; security and data owners approve data and connection boundaries; IT confirms Zone 2/3 integration and production feasibility.
:::

:::comparison { title: "三类 Copilot Studio 治理分区 || Three Copilot Studio Governance Zones" }
::versus Zone 1
### 公民开发区 || Citizen Development Zone
对应每位作者自有的受管理 Developer 环境。个人或小团队可在既有权限内创建私有、只读的生产力 Agent；Environment routing 负责将作者自动引导至专属环境，避开 Default 环境。[10][16] || This maps to each maker's own managed Developer environment. Individuals or small teams create private, read-only productivity agents within existing permissions. Environment routing directs makers there and keeps them out of the Default environment.[10][16]

::versus Zone 2
### 合作开发区 || Partnered Development Zone
对应 IT 批准的受管理专用开发环境，并配套测试或生产环境。管理员在环境上配置安全组、Dataverse 角色、Data policy 和共享规则；经过培训的作者在该环境中创建 Agent，再经 ALM 发布。[10][14] || This maps to IT-approved managed dedicated development environments, with paired test or production environments. Administrators configure security groups, Dataverse roles, Data policy, and sharing rules; trained makers build there and publish through ALM.[10][14]

::versus Zone 3
### 专业开发区 || Professional Development Zone
对应受管理的三环境组合：Development 和 Test 使用 Sandbox 类型环境，Production 使用 Production 类型环境。专业开发人员和 IT 以解决方案、环境变量、连接引用及自动化部署管理关键业务 Agent。[10][14][16] || This maps to a managed three-environment set: Development and Test use Sandbox environments, while Production uses a Production environment. Professional developers and IT manage critical agents with solutions, environment variables, connection references, and automated deployment.[10][14][16]
:::

:::flow { title: "选择适当 Zone 的判断路径 || A Decision Path for Choosing the Right Zone" }
1. **从用途和受众开始 || Start with Purpose and Audience** — 仅供个人或小团队使用、在既有权限内查询信息的场景，通常从 Zone 1 评估；面向部门或多人共享时，需要继续评估 Zone 2。 || Use cases limited to an individual or small team querying information within existing permissions typically begin in Zone 1; department or multi-user sharing requires a Zone 2 assessment.
2. **检查数据与集成 || Assess Data and Integration** — 需要写入业务系统、调用高级连接器、连接敏感数据或开放更多渠道时，应采用 IT 管理的环境、策略和审批，至少进入 Zone 2。 || Writing to business systems, using advanced connectors, accessing sensitive data, or opening additional channels requires IT-managed environments, policies, and approvals, placing the agent at least in Zone 2.
3. **以业务影响作最终判断 || Use Business Impact for the Final Decision** — 若故障、错误回答或数据误用会影响关键业务、服务承诺或全组织用户，就需要 Zone 3 的专业开发、强安全控制和完整 ALM。 || When failure, incorrect answers, or data misuse could affect critical business processes, service commitments, or organization-wide users, use Zone 3 with professional development, stronger controls, and full ALM.
:::

:::accordion
::panel
### 如何将个人作者引导至专属环境并避开 Default 环境 || How to Route Personal Makers to Their Own Environment and Away from Default
使用 Environment routing，让 Copilot Studio 的作者门户按租户规则自动进入其自有的 Developer 环境。该功能默认关闭，需要 Power Platform 管理员启用。[16] || Use Environment routing so the Copilot Studio maker portal automatically directs makers to their own Developer environment according to tenant rules. The feature is off by default and requires a Power Platform admin to enable it.[16]

1. 在 Power Platform admin center 进入 Manage > Tenant settings > Environment routing，并选择对 Copilot Studio 启用。 || In Power Platform admin center, go to Manage > Tenant settings > Environment routing and enable it for Copilot Studio.
2. 创建路由规则，指定适用范围为所有作者或某个 Microsoft Entra 安全组，并选择用于承载个人环境的 Environment group。 || Create a routing rule for all makers or a Microsoft Entra security group, and select the Environment group that will govern personal environments.
3. 为该 Environment group 发布受管理环境规则和租户级 Data policy，使新建的个人 Developer 环境继承统一的保留、AI 与共享控制。 || Publish managed-environment rules and tenant-level Data policy for that Environment group so newly created personal Developer environments inherit retention, AI, and sharing controls.
4. 作者下次打开 Copilot Studio 时，系统会使用其已有的自有 Developer 环境，或自动创建一个新的环境并将其设为管理员；规则不匹配、路由未启用或创建失败时，才会回到 Default 环境。 || When makers next open Copilot Studio, the system uses their existing owned Developer environment or creates one and assigns them as admin. They fall back to Default only when no rule matches, routing is off, or environment creation fails.
:::

## #security 07 / Secure Projects :: 把访问、数据和发布面分别纳入安全控制 || Secure Access, Data, and Publishing Surfaces Separately

第三阶段不是一项单独的安全设置。Copilot Studio 将作者权限、数据策略、Agent 认证、共享规则、数据驻留与关键场景网络控制放在不同层级管理；每层都要与所选 Zone 和业务场景相匹配。[11] || The third phase is not a single security setting. Copilot Studio manages author permissions, data policies, agent authentication, sharing rules, data residency, and network controls for critical scenarios at different layers. Each layer must match the selected zone and business scenario.[11]

:::callout { title: "发起：业务作者提交所需 Knowledge、连接器、认证和发布渠道；审查：安全、合规和数据 Owner 审查其是否符合已批准边界。 || Initiate: makers submit required Knowledge, connectors, authentication, and publishing channels. Review: security, compliance, and data owners assess whether they meet approved boundaries." }
执行：平台管理员配置环境访问、角色、Data policy 与共享规则；身份管理员配置 Microsoft Entra 组与认证要求；IT 为关键系统实施网络和密钥控制。批准：安全或数据 Owner 批准高风险连接和对外发布。 || Execute: platform admins configure environment access, roles, Data policy, and sharing rules; identity admins configure Microsoft Entra groups and authentication requirements; IT implements network and secret controls for critical systems. Approve: the security or data owner approves high-risk connections and external publishing.
:::

:::insight-grid { cols: 3, title: "Copilot Studio 项目的三层安全控制 || Three Security Control Layers for Copilot Studio Projects" }
::card A
### 访问与职责 || Access and Accountability
在 Power Platform 环境的安全组和 Dataverse 安全角色中分配作者、管理员与转录查看权限；用 Microsoft Entra 组管理成员。Agent 的共享设置再决定哪些人可编辑或使用。 || Assign author, administrator, and transcript-viewer permissions through Power Platform environment security groups and Dataverse security roles; manage membership with Microsoft Entra groups. Agent sharing settings then determine who can edit or use the agent.

::card D
### 数据与连接 || Data and Connections
在 Power Platform admin center 的 Security > Data and privacy > Data policy 中，把 Copilot Studio 连接器归为 Business、Non-business 或 Blocked，并将策略应用到指定环境或整个租户。 || In Power Platform admin center at Security > Data and privacy > Data policy, classify Copilot Studio connectors as Business, Non-business, or Blocked, then apply the policy to selected environments or the tenant.

::card P
### 发布与运行时 || Publishing and Runtime
在 Agent 的 Settings 中配置终端用户认证，在 Channels 中配置发布渠道；租户级共享规则限制谁可授予 Editor 或 Viewer。发布后在 Agents 列表查看 Protection status 和威胁检测信号。[11][15] || Configure end-user authentication in the agent's Settings and publishing targets in Channels. Tenant sharing rules limit who can grant Editor or Viewer access. After publishing, use Protection status on the Agents list to review threat-detection signals.[11][15]
:::

## #operations 09 / Governance Operations :: 用跨项目的运行证据审查并调整企业治理规则 || Use Cross-Project Operating Evidence to Review and Adjust Enterprise Governance Rules

治理运营关注的是整个租户，而非单个项目的日常待办。CoE、平台管理员、安全、合规与数据 Owner 汇总采用、审计、保护状态、容量、例外和整改信号，判断现有 Zone、Data policy、共享或发布规则是否仍合适。[5][13][15][17] || Governance operations focus on the whole tenant, not the daily backlog of one project. The CoE, platform admins, security, compliance, and data owners aggregate adoption, audit, protection status, capacity, exceptions, and remediation signals to decide whether existing zone, Data policy, sharing, or publishing rules remain appropriate.[5][13][15][17]

:::callout { title: "发起与协调：CoE 或治理负责人组织周期性治理复盘；执行：平台管理员汇总环境、容量和策略信号，安全、合规和数据 Owner 审查控制有效性。 || Initiate and coordinate: the CoE or governance lead runs periodic governance reviews. Execute: platform admins consolidate environment, capacity, and policy signals while security, compliance, and data owners review control effectiveness." }
决定：各控制 Owner 提出规则调整，企业负责人或治理委员会批准涉及租户范围、风险边界或资金投入的变更。项目团队提供运行证据，并在新规则发布后调整其交付方式。 || Decide: control owners propose rule changes, while an enterprise sponsor or governance board approves changes affecting tenant scope, risk boundaries, or funding. Project teams provide operating evidence and adapt delivery after new rules are published.
:::

:::insight-grid { cols: 3, title: "运营期的三类治理信号 || Three Governance Signals in Operations" }
::card 01
### 采用与资产清单 || Adoption and Asset Inventory
CoE 在 Copilot Studio Analytics 和 Power Platform admin center 汇总 Agent 使用、活跃资源和异常趋势，用于识别需要培训、支持或调整 Zone 的群体。[5][7][13] || The CoE aggregates agent use, active assets, and anomaly trends in Copilot Studio Analytics and Power Platform admin center to identify groups needing training, support, or zone adjustments.[5][7][13]

::card 02
### 审计与安全状态 || Audit and Protection Status
在 Microsoft Purview 搜索和保留 Copilot Studio 审计记录；在 Copilot Studio 的 Agents 列表查看每个已发布 Agent 的 Protection status，进入详情检查认证、策略和内容审核问题。[13][15] || Search and retain Copilot Studio audit records in Microsoft Purview. On the Copilot Studio Agents list, review Protection status for each published agent and open details for authentication, policy, and content-moderation issues.[13][15]

::card 03
### 容量与政策演进 || Capacity and Policy Evolution
平台管理员在 Power Platform admin center 的 Copilot 区域汇总消息使用、容量和依赖项；当证据表明现有 Data policy、共享或发布规则不合适时，由相应控制 Owner 提出调整并按治理机制批准。[5][13] || Platform admins aggregate message usage, capacity, and dependencies in the Copilot area of Power Platform admin center. When evidence shows existing Data policy, sharing, or publishing rules are unsuitable, the relevant control owner proposes an adjustment through the governance approval process.[5][13]
:::

:::callout { title: "已发布 Agent 的每一次实质变更，都应能追溯到运行信号、审批决定、测试结果和部署记录。 || Every material change to a published agent should be traceable to an operational signal, approval decision, test result, and deployment record." }
Copilot Studio ALM 建议使用解决方案、环境变量、连接引用和自动化管道；部分设置不具备 solution-awareness，需要在下游环境完成部署后配置。[14] || Copilot Studio ALM recommends solutions, environment variables, connection references, and automated pipelines. Some settings are not solution-aware and require post-deployment configuration in downstream environments.[14]
:::

## #references 11 / Sources :: 参考来源 || References

本指南将 Microsoft Learn 中的租户、环境和 Agent 层控制，整合为企业在项目启动前建立并持续维护的治理体系。项目申请、构建、测试、发布和日常运营，请参阅关联的项目管理文章。 || This guide organizes Microsoft Learn's tenant-, environment-, and agent-level controls into an enterprise governance system established before projects begin and maintained over time. See the linked project-management article for intake, build, test, release, and daily operations.

- [1] Microsoft. — https://learn.microsoft.com/en-us/power-platform/admin/governance-considerations | 支撑治理的定义、环境作为资源容器、环境角色/资源权限/Dataverse 角色，以及监控与告警范围。 || Supports the governance definition, environments as resource containers, environment/resource/Dataverse roles, and the monitoring and alerting scope.
- [2] Microsoft. — https://learn.microsoft.com/en-us/power-platform/guidance/adoption/environment-strategy | 支撑环境类型、受管理环境、环境组与规则、默认环境路由、开发/测试/生产隔离、解决方案与管道。 || Supports environment types, managed environments, environment groups and rules, default-environment routing, dev/test/prod separation, solutions, and pipelines.
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention | 支撑 Copilot Studio 的认证、知识源、工具、HTTP、技能、渠道和事件触发器的数据策略控制与验证方法。 || Supports data-policy controls and verification for Copilot Studio authentication, knowledge sources, tools, HTTP, skills, channels, and event triggers.
- [4] Microsoft. — https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention | 支撑数据策略对设计时和运行时的影响、策略级联、违规资源状态和最长 24 小时实施延迟。 || Supports design-time and runtime impact, policy cascading, violating-resource states, and the up-to-24-hour enforcement delay.
- [5] Microsoft. — https://learn.microsoft.com/en-us/power-platform/guidance/adoption/reactive-governance | 支撑无 owner、过度共享、闲置资源、环境和数据策略变更审批、受管理环境优先与 CoE Starter Kit 的补充角色。 || Supports ownerless, overshared, and inactive-resource handling; approval for environment and data-policy changes; managed-environment preference; and the complementary CoE Starter Kit role.
- [6] Microsoft. — https://learn.microsoft.com/en-us/power-platform/alm/overview-alm | 支撑 ALM 的生命周期、治理职责、解决方案、Dataverse、源代码管理和 CI/CD 的定义。 || Supports the ALM lifecycle, governance responsibilities, solutions, Dataverse, source control, and CI/CD definitions.
- [7] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-overview | 支撑 Copilot Studio Monitor 的采用、会话结果、满意度、分析访问和数据保留范围。 || Supports Copilot Studio Monitor adoption, session outcomes, satisfaction, analytics access, and data-retention scope.
- [8] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-intro | 企业治理与项目管理的官方总入口；支撑租户、环境和 Agent 层控制，以及 ALM 与检查清单的关系。 || The official entry point for enterprise governance and project management; supports tenant-, environment-, and agent-level controls and their relationship to ALM and the checklist.
- [9] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase1 | 支撑利益相关方对齐、场景与数据保护、命名和共享组件、许可证、预算与消息容量要求。 || Supports stakeholder alignment, scenario and data protection, naming and shared components, licensing, budget, and message-capacity requirements.
- [10] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2 | 支撑三种开发分区，以及按租户、环境和 Agent 层级配置控制的方式。 || Supports the three development zones and controls configured at tenant, environment, and agent levels.
- [11] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase3 | 支撑安全角色、数据策略、共享规则、数据驻留和关键业务场景的安全加固。 || Supports security roles, data policies, sharing rules, data residency, and security hardening for critical business scenarios.
- [12] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase4 | 支撑连续测试、核心场景、知识、回归、对抗、安全合规和性能测试，以及发布前验证。 || Supports continuous testing, core-scenario, knowledge, regression, adversarial, security-compliance, and performance tests, plus pre-release validation.
- [13] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase5 | 支撑运营分析、Application Insights、审计、会话留存、内容审核、安全状态、消息容量与服务限制预防。 || Supports operational analytics, Application Insights, audit, session retention, content moderation, protection status, message capacity, and throttling prevention.
- [14] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/alm | 支撑开发、测试、生产环境隔离，解决方案、环境变量、连接引用、管道与部署后设置。 || Supports development, test, and production isolation; solutions, environment variables, connection references, pipelines, and post-deployment settings.
- [15] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-agent-runtime-view | 支撑已发布 Agent 的保护状态、认证、策略、内容审核与威胁检测的运行时可见性。 || Supports runtime visibility of protection status, authentication, policies, content moderation, and threat detection for published agents.
- [16] Microsoft. — https://learn.microsoft.com/en-us/power-platform/admin/default-environment-routing | 支撑个人受管理 Developer 环境、Copilot Studio 作者门户的路由规则、目标 Environment group，以及回退至 Default 环境的条件。 || Supports managed personal Developer environments, routing rules for the Copilot Studio maker portal, target Environment groups, and the conditions that fall back to the Default environment.
- [17] Microsoft. — https://learn.microsoft.com/en-us/power-platform/guidance/coe/overview | 支撑 CoE 作为领导力、最佳实践、培训、支持和治理运营能力的定位；CoE Starter Kit 只是可选的示例实现。 || Supports the CoE as an organizational capability for leadership, best practices, training, support, and governance operations; the CoE Starter Kit is only an optional sample implementation.

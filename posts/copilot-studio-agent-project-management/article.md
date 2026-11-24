---
title: "在既定治理边界内，把 Agent 从场景申请交付到持续运营 || Deliver an Agent from Scenario Request to Operations Within Established Governance"
eyebrow: Project Delivery Within Governance
brand: Copilot Studio Delivery
date: 2026-08-28
strict_i18n: true
strict_density: true
lead: "本指南面向业务 Owner、业务作者、项目交付团队和审批人。它不负责重新制定企业的 Zone、数据策略或环境规则；项目团队的任务是根据这些预置规则申请、构建、测试、发布和运营 Agent。 || This guide is for business owners, makers, delivery teams, and approvers. It does not redefine enterprise zones, data policies, or environment rules. Project teams use those established rules to request, build, test, release, and operate agents."
hero_actions:
  - "查看项目申请 || View Project Intake | #intake"
  - "查看企业治理体系 || View Enterprise Governance | ../agentic-ai-innovation-governance/"
panel_label: "项目原则 || Project Principle"
panel_title: "项目不是制定治理规则，而是证明自己能够在规则内安全运行。 || A project does not define governance rules; it demonstrates that it can operate safely within them."
panel:
  - "业务 Owner 提出场景和可验收结果 || Business owner proposes the scenario and acceptable outcomes"
  - "项目团队按既定 Zone 和环境要求交付 || Delivery team follows the established zone and environment requirements"
  - "运行证据决定后续变更与扩展 || Operating evidence determines further change and expansion"
style:
  accent: "#0d8f8c"
---

## #scope 01 / Delivery Boundary :: 先确认项目遵循哪套治理规则，再开始交付 || Confirm the Governing Rules Before Delivery Begins

企业治理体系预先规定哪些环境可用、哪些连接器和渠道可用、谁可以构建或发布，以及何时必须走更严格的流程。项目团队不自行放宽这些规则；遇到新需求时，向 CoE 或平台团队提交例外申请。[1][2] || Enterprise governance predefines usable environments, permitted connectors and channels, who can build or publish, and when stricter delivery is required. Project teams do not relax these rules themselves. Submit exception requests to the CoE or platform team when needs change.[1][2]

:::comparison { title: "项目开始前确认的三项边界 || Three Boundaries to Confirm Before a Project Starts" }
::versus 环境 || Environment
### 获分配的 Zone 与环境 || Assigned Zone and Environment
确认项目被分配到个人 Developer 环境、专用开发环境，还是开发/测试/生产环境组合。 || Confirm whether the project uses a personal Developer environment, a dedicated development environment, or a development/test/production set.

::versus 数据 || Data
### 批准的知识与连接 || Approved Knowledge and Connections
确认可使用的 Knowledge、Tool、HTTP、MCP、认证方式和发布渠道，不把未获批准的需求直接配置进 Agent。 || Confirm permitted Knowledge, Tools, HTTP, MCP, authentication, and publishing channels. Do not configure unapproved needs directly into the agent.

::versus 责任 || Accountability
### 已指定的审批与支持路径 || Assigned Approval and Support Paths
确认业务验收人、数据与安全审批人、发布审批人、Agent Owner 和运行支持联系人。 || Confirm business acceptance, data and security approval, release approval, agent ownership, and operations-support contacts.
:::

## #intake 02 / Project Intake :: 业务 Owner 发起场景申请，项目团队据此完成准入 || The Business Owner Initiates the Scenario Request and the Team Completes Intake

申请应说明业务任务、目标用户、预期渠道、人工接管、所需数据与集成、以及可接受的结果。CoE 用既定分区标准协调准入；平台、安全和数据团队只对超出既有边界的部分进行审查。[1] || The request describes the business task, target users, intended channels, human escalation, required data and integration, and acceptable outcomes. The CoE coordinates intake against established zoning criteria. Platform, security, and data teams review only needs that exceed existing boundaries.[1]

:::flow { title: "项目准入的四步 || Four Steps for Project Intake" }
1. **业务 Owner 提交场景 || Business Owner Submits the Scenario** — 发起人说明价值、用户、边界和结果，指定业务 Owner。 || The initiator states value, users, boundaries, outcomes, and names the business owner.
2. **CoE 完成分类 || CoE Completes Classification** — 根据既定 Zone、环境和申请标准确认适用路径，或将例外转交审批。 || Use established zone, environment, and intake criteria to confirm the path or route an exception for approval.
3. **控制 Owner 确认边界 || Control Owners Confirm Boundaries** — 数据、安全和 IT Owner 对新增连接、敏感数据、对外渠道或关键集成作出批准或拒绝。 || Data, security, and IT owners approve or reject new connections, sensitive data, external channels, or critical integrations.
4. **平台管理员分配环境 || Platform Admin Assigns the Environment** — 将作者加入批准环境并赋予所需角色；项目可在明确的配置边界内开始构建。 || Add makers to the approved environment with required roles. The project can start building within stated configuration boundaries.
:::

## #build 03 / Build :: 作者在获授权环境中构建，并把可部署内容纳入解决方案 || Makers Build in the Authorized Environment and Package Deployable Content in Solutions

业务作者或专业开发人员在分配的环境中配置 Agent 的 Knowledge、Topic、Action、Tool、认证与渠道。对于 Zone 2/3，项目团队应在 Solution 中管理可部署组件，使用环境变量和连接引用分离环境差异。[3] || Business makers or professional developers configure the agent's Knowledge, Topics, Actions, Tools, authentication, and channels in the assigned environment. For Zone 2/3, manage deployable components in a Solution and use environment variables and connection references to separate environment-specific settings.[3]

:::callout { title: "执行：业务作者或专业开发负责 Agent 内容、动作和集成；业务 Owner 负责持续确认业务边界。 || Execute: makers or professional developers implement agent content, actions, and integration; the business owner continuously confirms business boundaries." }
支持：平台管理员处理环境与角色问题；数据、安全和 IT Owner 只审查变更中新增或超出既定边界的对象。 || Support: platform admins handle environment and role issues; data, security, and IT owners review only objects newly introduced or outside established boundaries.
:::

## #test 04 / Test :: 在测试环境用可重复证据验证 Agent 能否达到准入条件 || Use Repeatable Evidence in Test to Verify That the Agent Meets Entry Conditions

业务作者建立 Test set，覆盖核心场景、知识问答、多轮对话、转人工、回归与对抗输入。项目团队还要在测试环境验证数据策略、角色、连接引用和生产知识源，再把结果提交给业务与发布审批人。[4] || Makers create Test sets for core scenarios, knowledge answers, multi-turn conversation, escalation, regression, and adversarial input. Teams also verify data policies, roles, connection references, and production knowledge in test before submitting results to business and release approvers.[4]

:::callout { title: "发起与执行：作者维护 Test set；业务 Owner 定义验收结果；IT/专业开发验证集成与性能。 || Initiate and execute: makers maintain Test sets; business owners define acceptance outcomes; IT and professional developers validate integration and performance." }
批准：业务 Owner 签署业务验收；安全、合规和数据 Owner 确认高风险控制；发布审批人基于完整测试证据决定是否允许部署。 || Approve: the business owner signs off business acceptance; security, compliance, and data owners confirm high-risk controls; the release approver decides whether deployment is permitted from complete test evidence.
:::

## #release 05 / Release :: 通过既定 ALM 路径把通过验收的 Agent 推进到生产 || Promote an Accepted Agent to Production Through the Established ALM Path

Zone 2/3 的发布应从开发环境经测试环境进入生产环境。项目团队使用 Solution、环境变量、连接引用和已选定的管道工具推进部署；认证、渠道、共享和 Application Insights 等不随 Solution 自动迁移的设置，应在下游环境按发布清单完成。[3] || Zone 2/3 releases move from development through test to production. Teams use Solutions, environment variables, connection references, and the chosen pipeline tool. Settings that do not move automatically with a Solution, including authentication, channels, sharing, and Application Insights, are completed in downstream environments through the release checklist.[3]

:::callout { title: "执行：IT、专业开发或指定发布人员运行已批准的部署管道，并完成下游环境检查。 || Execute: IT, professional developers, or named release personnel run the approved deployment pipeline and complete downstream environment checks." }
批准：发布审批人确认测试、业务验收和高风险控制证据完整；业务 Owner 确认生产范围与支持路径；平台管理员确认目标环境已准备就绪。 || Approve: the release approver confirms complete testing, business acceptance, and high-risk control evidence; the business owner confirms production scope and support path; platform admins confirm the target environment is ready.
:::

## #operate 06 / Operate :: 用运行证据管理已发布 Agent，而不是把上线当作终点 || Manage Published Agents with Operating Evidence Rather Than Treating Release as the End

Agent Owner 在 Copilot Studio Analytics 中跟踪采用、会话结果和满意度；运营支持处理故障与转人工；平台团队关注容量、策略和安全状态。需要改变提示、Knowledge、连接、数据策略或发布范围时，项目回到既定的变更、测试和发布路径。[5] || The agent owner tracks adoption, session outcomes, and satisfaction in Copilot Studio Analytics; operations support handles incidents and escalations; platform teams monitor capacity, policy, and security status. Changes to prompts, Knowledge, connections, data policies, or publishing scope return through the established change, test, and release path.[5]

:::insight-grid { cols: 3, title: "运营中需要作出的三类决定 || Three Decisions Required in Operations" }
::card 01
### 修复与改进 || Fix and Improve
Agent Owner 处理内容、知识和行为问题；超出既有边界的变更重新进入申请和审批。 || The agent owner handles content, knowledge, and behavior issues; changes beyond established boundaries re-enter intake and approval.

::card 02
### 扩展与加固 || Expand and Harden
业务 Owner、CoE 和 IT 根据采用、质量、风险和成本，决定扩大用户范围、提高 Zone 或增加控制。 || Business owners, the CoE, and IT use adoption, quality, risk, and cost to decide on broader use, a higher zone, or additional controls.

::card 03
### 停止与归档 || Retire and Archive
当场景失效或风险不可接受时，业务 Owner 申请停止；平台和数据 Owner 按企业留存与清理规则处理资产和记录。 || When a scenario is no longer valid or risk is unacceptable, the business owner requests retirement. Platform and data owners handle assets and records under enterprise retention and cleanup rules.
:::

## #references 07 / Sources :: 参考来源 || References

本文只说明项目如何在既定企业治理规则内运行；租户治理制度的制定和配置详见关联的治理文章。 || This article explains how projects run within established enterprise governance rules. See the linked governance article for establishing and configuring tenant governance.

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase1 | 支撑场景、数据、合规、命名和责任要求。 || Supports scenario, data, compliance, naming, and accountability requirements.
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2 | 支撑项目在预定义 Zone、环境与审批要求内准入。 || Supports project intake within predefined zones, environments, and approval requirements.
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/alm | 支撑 Solution、环境变量、连接引用、开发/测试/生产和部署后设置。 || Supports Solutions, environment variables, connection references, dev/test/production, and post-deployment settings.
- [4] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase4 | 支撑 Test set、回归、对抗、安全合规和性能验证。 || Supports Test sets, regression, adversarial, security-compliance, and performance validation.
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase5 | 支撑 Analytics、运营监控、合规审计、容量和改进循环。 || Supports Analytics, operations monitoring, compliance auditing, capacity, and improvement cycles.

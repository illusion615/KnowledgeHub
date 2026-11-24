---
title: 企业智能体架构设计与应用
eyebrow: Enterprise Agent Blueprint
brand: 智能体
date: 2026-04-08
strict_i18n: false
strict_density: true
lead: 企业智能体由 AI 模型驱动，能够感知上下文、推理并围绕目标自主行动。不同于静态聊天机器人，它作为位于现有企业应用之上和之间的新认知层，通过自然语言意图驱动 ERP、CRM、数据湖、IoT 与业务 API 协同执行。
hero_actions:
  - "查看模式架构 | #patterns"
  - "查看重构优先级 | #priorities"
panel_label: 核心图景
panel_title: 用户表达意图后，Agent 会跨系统完成一整段业务动作
panel_desc: 以呼叫中心退货场景为例，Agent 会规划步骤，查询订单与政策，判断是否满足退货窗口，随后触发退货流程并返回结果。这正是企业智能体区别于静态应用的关键。
metrics:
  - "核心组件 | 3 | Model、Orchestration Layer、Memory 构成 Agent 的最小核心闭环。"
  - "连接生态 | 1400+ | Microsoft 平台提供 1400+ 预构建扩展，可连接 ERP、CRM、HCM 与自定义应用。"
  - "架构扩展 | 7 → 11 | Salesforce 的 Agentic Enterprise 框架在传统七层 IT 栈上新增四层，形成 11 层结构。"
style:
  accent: "#ff9340"
---

## #role 01 / Architectural Role :: 智能体在企业 IT 中的架构角色

企业智能体的本质在于：它由 AI 模型驱动，能够感知上下文、推理并围绕目标自主行动。与只对提示作出反应的静态聊天机器人不同，Agent 是位于现有系统之上和之间的新认知层。这一点与 “Copilot is the UI for AI” 以及“每位员工都有 Copilot、每个业务流程都有 Agent”的愿景一起，构成了 Agent 进入企业架构后的核心变化，而非确定性也由此成为必须正视的关键权衡。

:::insight-grid { cols: 2 }
::card 01
### Agent 定义
Microsoft Entra 将 Agent 定义为能够理解环境与上下文、作出决策，并利用可用工具自主行动以完成目标的应用[1]。

::card 02
### 三项核心组件
一个 Agent 至少包含三项关键构成：Model、Orchestration LayerAgent 的循环推理层，负责规划、调用工具和状态推进。，以及用于持久化上下文的 Memory。

::card 03
### 规模化趋势
IDC 预测，到 2028 年将出现 10 亿个新的逻辑应用[4]。Gartner 将 Multiagent Systems 列为 2026 年十大战略技术趋势第 4 位[9]。这意味着 Agent 驱动的企业架构变迁正从部门级创新走向组织级重构。

::card 04
### 核心权衡
Agent 把非确定性引入企业栈，传统面向确定性软件的测试、审计和合规框架必须随之重构，否则结果会不一致且难以审计。
:::

:::comparison
::versus Call Center Return Scenario
### 五步退货场景
该案例展示了 Agent 如何在一次交互里跨多个企业系统走完业务流程，超越单纯的问答交互。

1. **Reason and Plan** — 用户提出“Can you help me return my last order?” 之后，Agent 先规划任务：查找最近订单并检查退货政策。
2. **Retrieve Information** — Agent 查询订单数据库，并结合相关政策规则，把订单事实与规则依据同时取回。
3. **Reason Again** — Agent 再次推理，判断该订单是否仍处于可退货窗口内。
4. **Take Action** — 如果满足条件，Agent 会触发退货流程，并生成退货物流标签。
5. **Respond** — 最后把处理结果返回给用户。这一串动作同时调用了订单库、知识库和退货处理 API。

::versus 7-Layer To 11-Layer { highlight: true }
### Agentic Enterprise 如何扩展传统七层 IT 栈
Salesforce Chief Architect Emin Gerba 提出的框架[4]，在传统七层 IT 栈之上再扩展四层，从而形成面向 Agent-Based Systems 的 11 层结构。

- Semantic Layer：统一企业数据与知识的意义。
- AI / ML Layer：承载模型与推理能力。
- Agentic Layer：承载 Agent 自主执行与协作能力。
- Enterprise Orchestration Layer：把业务流程与 Agent 控制编排起来。
:::

## #ecosystem 02 / Enterprise Ecosystem :: 智能体与企业 IT 生态组件的关系

企业级 Agent 落地离不开五个支点：系统集成、Semantic Layer统一企业数据和知识语义的解释层，是跨系统推理的前提。、Entra Agent IDMicrosoft 为 AI Agent 提供的专用企业身份模型，用于身份、认证与权限控制。、开发路径，以及采用 Agentic Architecture 时必须正视的组织性障碍。

Enterprise Integration

数据、系统、知识、权限与平台服务在此汇聚

ERP / CRM

业务事实、客户上下文和流程入口。

Data Lakes

统一知识与跨系统数据访问。

External Systems

外部 API、第三方 Agent 与外部知识。

Knowledge Mediator

同时为知识内容与结构化数据提供 grounding。

IoT / Vertical Systems

现场事件流和行业垂直系统。

Gateway / Security / Monitoring / FinOps

模型解耦、安全、监控与成本管理。

2.1 Integration

### 企业集成层是连接智能体与业务事实的关键桥梁

IEEE Agentic Mesh 架构要求 Mesh 无缝连接数据湖、ERP、CRM、IoT 和垂直系统，并通过标准 API、连接器和适配器提供安全且可治理的访问[5]。Microsoft 生态进一步把连接模式细分成 External Systems、Knowledge Base Mediator 与 AI Platform Services 三类。

:::callout { title: "ERP 场景补充" }
Account Reconciliation Agent 与 Supplier Communication Agent 展示了 Agent 如何通过 MCPModel Context Protocol，用于把工具和企业系统能力暴露给 Agent 调用。 与 Copilot Studio 深入嵌入 ERP 工作流。
:::

:::accordion
::panel { open: true }
### 2.1 Integration with Enterprise Systems (ERP, CRM, Data Lakes, APIs)
企业集成层连接着 Agent 与业务数据、业务流程以及第三方生态。除了 Microsoft 365 的生产力信号，平台还可以连接 ERP、CRM、HCM 和自定义应用，使 Copilot 能对整个企业数据进行推理。

- External Systems：Agent 可以调用不同环境中的 API 或其他平台上的 Agent，并结合知识库建立事实锚定（grounding）。
- Knowledge Base Mediator：负责把知识内容和结构化数据同时接入 Agent 的推理过程。
- AI Platform Services：包括 Gateway、Security、Monitoring 和 FinOps，用来解耦模型选择、落实安全与合规，并跟踪系统健康和成本。

::panel
### 2.2 Semantic Layer and Knowledge Unification
数据孤岛是有效部署 Agent 的主要障碍。Semantic Layer 即 “the agent's knowledge layer”，负责建立跨企业数据和知识的统一语义映射，使人和 AI Agent 都能一致地解释和操作信息。

这意味着，在部署跨域 Agent 之前，组织必须先投资于数据统一能力，例如知识图谱、企业数据目录或联邦数据平台。否则，当 Agent 被问到 “ACME Corp's order status” 时，它无法把 CRM 中的客户记录与 ERP 中的订单记录关联起来。

::panel
### 2.3 Identity, Security, and Governance
规模化自治 AI 需要自己的企业身份。传统面向人和普通应用的身份模型不足以支撑这一点，因此需要专门的 Agent Identity[1]。Agent Identity 让每一次动作都可归因、可审计，并可施加细粒度 RBAC。

Guardrails

**四类生产级护栏**

- Action Whitelists：定义 Agent 被允许执行的动作边界。
- Spending Limits：限定单次、每小时、每天的成本上限。
- Escalation Triggers：当风险触发阈值时强制转人工审核。
- Content Filters：对输入与输出做策略校验与过滤。

Observability

**企业必须能回答的五个问题**

- Agent 做了什么决策，为什么这样做？
- 它调用了哪些工具，参数是什么？
- 它访问了哪些数据？
- 这次操作消耗了多少成本？
- 每一步分别花了多长时间？

Prompt Injection Defense

**Agent 特有安全威胁**

除了通用的 Content Filters，Agent 还面临 prompt injection（通过恶意输入劫持 Agent 行为）和 jailbreak（绕过安全护栏）等对抗攻击。防御需要多层：输入校验、工具调用参数过滤、输出安全检查，以及在编排层对每一步施加 least-privilege 约束[3][7]。

Human-in-the-Loop

**HITL 架构决策指南**

并非所有 Agent 动作都应自治执行。关键决策点包括：高风险操作（如金融交易、患者诊断）需要同步审批门；中风险操作（如数据更新）可采用异步审计 + 自动回滚；低风险操作（如信息检索、报告生成）可完全自治[10][11]。HITL 的粒度应随 Agent 成熟度和组织信任度动态调整。

::panel
### 2.4 Agent Components and Development Approaches
Agent Types

**平台支持的 Agent 形态**

- Prompt Agents
- Workflow Agents
- Hosted Agents
- Tools and Integrations：Web Search、File Search、Code Interpreter、MCP Servers、Custom Functions
- Publishing Targets：API Endpoints、Microsoft Teams、M365 Copilot

Starting Points

**两条开发起点**

| Starting Point | Description | Best For |
| --- | --- | --- |
| M365 Copilot + Copilot Studio | 在 Microsoft 365 里用低代码方式扩展 AI Agent，用于生产力应用中的自动化。 | Business users / citizen developers |
| Azure AI Foundry (Code-First) | 使用 Azure AI Foundry SDK，并结合 Semantic Kernel 或 AutoGen 构建可定制化 Agent。 | Professional developers needing full flexibility |

Lifecycle

**六步 Agent 生命周期**

1. **Create** — 定义 Agent。
2. **Test** — Agent 输出是非确定的，测试不能依赖精确匹配断言。需要使用评分量规（scoring rubrics）或 LLM-as-judge 评估[3]。
3. **Trace** — 检查 Agent 的决策过程，包括每一步的工具调用、参数和推理链。
4. **Evaluate** — 衡量质量表现，建立基线指标并持续监控漂移。
5. **Publish** — 创建稳定端点或发布目标。
6. **Monitor** — 持续通过仪表盘监控运行状态。

无论从哪条路径起步，Agent 都可以通过 M365 Agents SDK 部署到第三方应用、网站或客户平台，这说明 Agent 的应用边界并不局限于内部系统。

::panel
### 2.5 Organizational Challenges in Adopting Agentic Architecture
采用 Agentic Architecture 面临一组技术与组织互相耦合的结构性挑战。传统以人决策、机器执行为前提的企业系统，在共享记忆、编排和实时上下文流的要求下必须同步改造[5][7]。

- **组织文化与变革管理** —— 需要明确的变革路径和管理层承诺，避免试点后推广停滞。
- **遗留系统与基础设施** —— 通过 API 网关和标准连接器逐步桥接旧系统，而非一次性替换。
- **战略与 ROI 不清晰** —— 每阶段设定可量化业务指标，用渐进式价值证明投资合理性。
- **数据质量与可用性** —— 语义层和知识图谱是 Agent 跨域推理的前提，必须优先投资。
- **技能缺口** —— 低代码路径（Copilot Studio）与代码优先路径（Azure AI Foundry）可共存，以降低上手门槛。
- **伦理与偏见** —— 内容过滤、护栏和可审计机制需要从第一天嵌入，而非上线后补救。
- **用户采纳与体验** —— Agent 最终要通过 Copilot 等自然语言界面触达用户，体验断层会直接耗散组织投入意愿。
- **安全风险** —— Agent Identity（Entra Agent ID）和 RBAC 是防止权限失控的基础。
:::

## #patterns 03 / Design Patterns And Reference Architectures :: 企业 AI 的设计模式与参考架构

企业 AI 的设计模式与参考架构涵盖六个核心维度：3.1 能力谱系、3.2 企业架构模式、3.3 多智能体编排收益、3.4 Agentic Mesh由多个 AI Agent 通过标准协议、身份体系和协调机制连接形成的分布式系统。、3.5 记忆架构，以及 3.6 Agentic Architecture 的五项基础原则。

Industry Consensus

### 关键行业背书

Gartner 将 **Multiagent Systems** 列为 2026 年十大战略技术趋势第 4 位，认为它"允许模块化 AI Agent 协作完成复杂任务，从而提升自动化和可扩展性"[9]。McKinsey 指出，Agent 系统有可能将复杂工作流的审查周期缩短 20–60%[10]。Anthropic 在大量客户项目中总结出一条关键经验："最成功的实现使用的是简单、可组合的模式，而非复杂框架"[11]。

这三条来自不同视角的结论形成了共识：**企业级 Agent 的价值已被确认，但落地路径必须从简单形态起步，仅在确有必要时才引入更高复杂度的编排。**

:::sandbox { id: "enterprise-agent-architecture-sandbox-1", title: "五类企业模式的能力谱系", canvas: false }
能力谱系最终落在同一组五类企业模式上：Single Agent、Router、Orchestrator、Planner-Executor 和 Autonomous Swarm（命名体系沿用 HyperTrends[7] 的框架；Azure Architecture Center[3] 2026 年版使用了 Sequential / Concurrent / Group Chat / Handoff / Magentic 这套编排导向命名，概念可映射但侧重点不同）。
:::

:::comparison
::versus 3.3 Multi-Agent Benefits
### 多 Agent 编排的四项结构收益
- Specialization：每个 Agent 聚焦一个领域或能力，降低代码与 Prompt 复杂度。
- Scalability：可以增删 Agent，而不必重设计整个系统。
- Maintainability：测试与调试可以聚焦到单个 Agent，降低问题隔离难度。
- Optimization：不同 Agent 可以采用不同模型、知识、工具和算力配置。

::versus 3.4 Agentic Mesh { highlight: true }
### Agentic Mesh 的六层实现架构
Agent 之间的互操作依赖两类标准化协议：MCPModel Context Protocol，标准化 Agent 对工具和企业系统能力的发现与调用。 负责工具调用层面的标准化，而 Google 主导的 A2A ProtocolAgent-to-Agent Protocol，开源框架，使不同平台构建的 Agent 可以互操作。 则聚焦于 Agent 间通信与协调。两者互补，共同构成 Agentic Mesh Communication Fabric 的协议基础。

- Agent Runtime：安全、隔离、可扩展、容错的执行环境。
- Identity and Governance：身份、鉴权、授权、token vault、RBAC。
- Communication Fabric：工具调用、记忆共享和消息传递协议。
- Model Abstraction：通过统一接口让不同模型可替换，并支持按策略选模。
- Observability and Safety：延迟、准确率、漂移、异常检测，以及内容过滤和合规检查。
- Enterprise Integration：连接数据湖、ERP、CRM、IoT 与行业系统。
:::

:::comparison
::versus 3.5 Memory Architecture
### 四类必需记忆
- Short-term Memory：当前对话或当前任务上下文。
- Working Memory：多步执行过程中的中间结果。
- Long-term Memory：持久知识，例如用户偏好和过去决策。
- Shared Memory：在多 Agent 系统中可被多个 Agent 共同访问的状态。

结论很直接：没有记忆的 Agent 会重复犯错，也会忘记上下文。在多 Agent 编排中，上下文窗口还会随每个 Agent 的推理、工具结果和中间输出快速膨胀。必须在 Agent 之间采用压缩策略（如摘要或选择性裁剪）来防止超出模型限制或降低响应质量[3]。

::versus 3.6 Foundational Principles
### 五项基础原则
- Autonomy and Agency：在权限和合规边界内保持结构化自治。
- Goal-Directed Behavior：围绕可回溯到业务结果的目标层级行动。
- Environment Awareness and Perception：能感知环境并与系统、工具、人交互。
- Orchestrated Collaboration：多个 Agent 在不冲突、不漂移的前提下协同工作。
- Learning and Adaptation：实时更新理解、调整策略，并随着新输入持续学习。
:::

:::sandbox { id: "enterprise-agent-architecture-sandbox-2", title: "企业模式决策树", canvas: false }
依次选择三个维度的任务特征，决策树将按五类企业模式的适用边界匹配推荐方案。
:::

## #roadmap 04 / Phased Adoption Roadmap :: 分阶段企业采用路线图

企业采用 Agent 架构是一个分阶段渐进的过程。每个阶段都要同时建设必要架构基础并交付可见业务价值，否则要么治理滞后导致 agent sprawl，要么基础投资过重却缺少回报。

:::comparison
::versus Phased Approach
### 三阶段采用路径与五项推进动作
1. **Phase 1 — 单点验证** — 识别高价值用例（复杂决策或非结构化数据密集领域），部署目标明确的 Single Agent，同步建立语义层和身份基础。毕业标准：至少一个 Agent 进入生产并产出可量化业务价值。
2. **Phase 2 — 多 Agent 协作** — 引入 Router 或 Orchestrator 模式，建设治理连接器与集成层，嵌入透明度、审计与安全护栏。毕业标准：跨域 Agent 可协同处理端到端流程。
3. **Phase 3 — 规模化运营** — 部署 Agentic Mesh 或 Autonomous Swarm，让 Agent 之间形成自适应协同而非孤立运行。持续跟踪效率、成本、错误率与用户满意度。毕业标准：全组织可复用的 Agent 平台与 FinOps 能力就绪。
4. **Phase 4 — 企业数字孪生与自治仿真** — 建立多 Agent 多域自治网络，实现企业运营的持续仿真与战略优化。需要自愈基础设施、A2A 通信协议，以及 Agent 自反思与自适应框架[4]。毕业标准：Agent 网络可主动发现效率拐点并提出业务建议。

::versus Speed vs Risk { highlight: true }
### 速度与风险之间的直接权衡
如果在没有语义层和治理基础的情况下过快进入更高阶段，会出现 agent sprawl：部门各自构建孤立 Agent，导致重复建设和安全缺口。

如果反过来过度投资底层基础设施，却不能交付早期业务价值，则会造成利益相关方疲劳，并削弱持续投入意愿。
:::

## #examples 05 / Real-World Examples :: 真实世界案例

行业案例已经说明 Agentic Paradigm 正在不同产业形态中发生。McKinsey 对贷款审批场景的分析表明，Agent 系统可以将审查周期缩短 20–60%[10]。六个代表性案例横向展示了不同场景下的落地方式。

Hero FinCorp

Good360

Global Bank

制造与保险

Security Ops

D365 Agentic ERP

Hero FinCorp 通过 Salesforce Agentforce 平台部署 AI Agent 来简化贷款处理流程，使贷款审批可在 30 分钟内完成[4]。

这一案例展示了 Agent 如何在 CRM 客户数据和核心银行系统之间执行多步工作流：自动收集客户资料、完成检查、准备审批文档，从而压缩原本高度依赖人工的流程。

Good360 使用 Agent 技术去连接物资供给数据和社区需求数据，使灾后救援物资匹配速度提升了最多 3 倍[4]。

该案例印证了跨域编排的价值：Agent 超越单一系统操作，在库存管理、物流协同和需求评估之间建立连通与协调。

一家全球银行曾让不同地区各自建设了 6 个孤立聊天机器人项目，这些项目无法共享客户上下文，导致服务不一致且成本更高。

该银行正在转向 Agentic Mesh[5]：通过共享治理、数据访问和通信协议，让任一面向客户的 Agent 都能访问统一的客户信息和公司政策。

制造企业将预测性维护 Agent 接入 IoT 传感器数据流与 ERP 排程系统，用于预测设备故障；保险公司则将车联网 Agent 接入汽车理赔流程，用于自动分析事故后的车辆遥测数据。

这两个案例说明了 Agentic Mesh 的模块化集成能力：企业不必重写整个系统，只需要把 Agent 插入现有工作流即可。

微软内部安全团队构建了协作型 Agent 组合，包括 Posture IQ、Tenant Assessment Agent 和 SOC Bot Agent，并把它们接入 Microsoft 365 Copilot 和 Teams。

这些 Agent 共享与 Microsoft 365 和 Azure 服务一致的集成模式，并建立在 zero-trust 基础之上，用于自动化威胁防御与安全姿态管理。

在 D365 Agentic ERP 场景中，Microsoft Innovation Hub 通过 Account Reconciliation Agent 与 Supplier Communication Agent 展示如何把 Agent 深度嵌入 ERP 业务流程。

客户最终拿到的不只是一个演示，而是一份经过验证的架构蓝图、风险缓释计划，以及基于 MCP 与 Copilot Studio 的嵌入式 Agent 设计方案。

## #priorities 06 / Restructure Current IT Architecture :: 面向 Agent 时代的当前 IT 架构重构

当前 IT 架构的重构重点集中在四组内容：架构转型优先级、成本考虑、Agent-as-Client 设计决策，以及生产级错误恢复。

:::comparison
::versus 6.1 Transformation Priorities
### 六项优先级
- 建立统一数据与语义层。
- 实施 Agent 身份与访问管理。
- 部署 Agent 运行时与开发平台，并支持六步生命周期。
- 建设带治理能力的连接器与集成层。
- 落地编排与治理控制。
- 从第一天起建立可观测性基础设施。

::versus 6.2 Cost + 6.3 Design Decision
### 成本管理与 Agent-as-Client
LLM 成本会在 Agent 架构中快速复合放大[7]：规划 Agent 如果重复规划 5 次，代价就是 5 倍 token；四个 Agent 每个调用 3 次模型，则单次请求会变成 12 次模型调用。

- 为每次操作设置 token 预算。
- 根据任务复杂度选模：路由用更小模型，规划用更强模型。
- 引入结果缓存与成本仪表盘。
- 把 FinOps 内置为平台基础能力，避免事后补救。

| Decision Point | Agent-as-Client | Bridge Architecture |
| --- | --- | --- |
| 服务端处理 | 沿用与人类用户一致的 API 端点和统一服务端路由。 | 需要额外桥接层与独立事件流。 |
| 代码路径 | 保留单一路径处理所有 artifact 操作。 | Agent 与用户往往形成两套代码路径。 |
| 多 Agent 扩展 | 无需为每类 Agent 再造桥接器。 | 容易出现重复桥接实现。 |
| 状态同步 | 不需要额外复杂同步机制。 | 需要复杂状态同步并加深与特定 Agent 的耦合。 |
:::

6.4 Error Recovery

### 生产级错误恢复：Demo 与 Product 的分水岭

Demo 级 Agent 在一切顺利时表现良好；生产级 Agent 则需要为每种失败模式定义恢复路径[7]：

- **工具调用失败** —— 重试 → 跳过 → 升级到人工，或触发重规划。
- **LLM 幻觉出不存在的工具** —— 工具注册表做显式白名单校验，拒绝未注册调用。
- **无限循环** —— 对迭代次数和总 token 消耗设硬上限。
- **超出成本限制** —— 中途暂停执行，保存状态快照，通知运维团队后由人工决定恢复或终止。
- **部分 Agent 宕机** —— 编排层启用断路器（circuit breaker），将任务重新路由到备选 Agent 或降级到确定性流程。

## #references 07 / References :: 参考来源

各参考来源与正文中的 [n] 上标标注一一对应，涵盖官方架构指南、行业分析报告与工程实践文献。

- [1] Microsoft. — https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id | Agent 定义、身份、RBAC 和 Agent Identity 模型的权威来源。
- [2] Azure Databricks. — https://learn.microsoft.com/en-us/azure/databricks/generative-ai/guide/agent-system-design-patterns | 呼叫中心退货场景、LLM+Prompt → Multi-Agent 能力谱系和"从简单开始"原则。
- [3] Azure Architecture Center. — https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns | 多 Agent 编排收益、五类编排模式，以及上下文窗口管理、测试和安全指南。
- [4] E. Gerba (Salesforce). — https://www.salesforce.com/news/stories/agentic-enterprise-architecture/ | 11 层扩展框架、分阶段路线图和 Hero FinCorp / Good360 案例。
- [5] IEEE Computer Society. — https://www.computer.org/publications/tech-news/trends/ai-agentic-mesh | Agentic Mesh 六层参考架构、Global Bank 案例和制造/保险模块化集成。
- [6] Kore.ai. — https://www.kore.ai/blog/agentic-architecture-blueprint-for-intelligent-enterprise | 三层智能模型、五项基础原则和组织挑战清单。
- [7] HyperTrends. — https://www.hypertrends.com/2026/04/ai-agent-architecture-enterprise/ | 护栏分类、成本管理策略、模式选择逻辑和可观测性。
- [8] Infosys BPM. — https://www.infosysbpm.com/blogs/agentic-ai/intelligent-agent-in-ai-guide.html | 五项推进动作和分阶段采用路线的补充视角。
- [9] Gartner. — https://www.gartner.com/en/articles/top-technology-trends-2026 | 将 Multiagent Systems 列为第 4 大战略技术趋势。
- [10] McKinsey Digital. — https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/why-agents-are-the-next-frontier-of-generative-ai | 业务价值框架、贷款审批场景分析（审查周期缩短 20–60%）。
- [11] Anthropic. — https://www.anthropic.com/engineering/building-effective-agents | "最成功的实现使用简单、可组合的模式"及工作流构建块。

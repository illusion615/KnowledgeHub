---
title: Copilot Studio 与 M365 Agents SDK：产品定位、协作关系与场景选型
eyebrow: Architecture Decision Guide
brand: Copilot Studio
date: 2026-04-16
strict_i18n: false
strict_density: true
lead: Microsoft 构建 AI Agent 的两个核心产品——Copilot Studio 和 M365 Agents SDK——服务于不同用户群体，解决不同层面的问题。基于 Microsoft Learn 官方文档，从产品定位、技术边界、协作关系和六个具体场景可清晰界定两者各自适用的条件。
hero_actions:
  - "协作关系 | #relationship"
  - "场景分析 | #scenarios"
panel_label: 关键区分
panel_title: 不同层面的工具，各有明确边界
panel:
  - Copilot Studio 是一个可视化 Agent 构建平台，内置编排、NLU、Knowledge 和渠道发布，目标用户是业务人员和 IT 管理员。
  - M365 Agents SDK 是一个 Pro-code 开发框架，提供 Activity 协议处理、多渠道适配和状态管理，目标用户是开发者。
  - 两者共享 Activity 通信协议和渠道基础设施（Teams / M365 Copilot / Web），可以在同一项目中协同使用。
metrics:
  - "Copilot Studio | 低代码平台 | GUI 画布 + 自然语言创建 Agent"
  - "M365 Agents SDK | 开发框架 | C# / JS / Python — AI 服务无关"
  - "共享协议 | Activity Protocol | 标准通信格式，跨渠道统一"
style:
  accent: "#7c3aed"
---

## #positioning 01 / Positioning :: 两个产品解决不同层面的问题

Copilot Studio 和 Agents SDK 在 Microsoft 智能体技术栈中分别承担不同的职责。

:::accordion
::panel { open: true }
### 1.1 定位一览
| 维度 | Copilot Studio | M365 Agents SDK |
| --- | --- | --- |
| **产品类型** | SaaS 平台（Web 应用 + Teams 应用） | 开源开发框架（NuGet / npm / PyPI 包） |
| **目标用户** | 业务分析师、IT 管理员、Citizen Developer | 软件开发者 |
| **核心职责** | 端到端 Agent 构建：NLU → 编排 → Knowledge → 渠道发布 | Agent 通信容器：Activity 协议 → 状态管理 → 多渠道适配 |
| **AI 编排** | 内置（Generative Orchestration / Topic 路由） | 不内置；开发者自选（Semantic Kernel / LangChain / Azure OpenAI 等） |
| **编码需求** | 零代码（可选 Pro-code 扩展） | 全部编码 |
| **托管** | Microsoft 全托管（多租户） | 开发者自行部署（Azure App Service / Container Apps 等） |
| **前身** | Power Virtual Agents | Bot Framework SDK v4 |

::panel
### 1.2 类比理解
两者的关系类似于 Power Apps 和 ASP.NET Core：

- **Power Apps**（≈ Copilot Studio）：低代码平台，内置数据连接、UI 渲染、身份验证，面向 Citizen Developer 快速构建业务应用。
- **ASP.NET Core**（≈ Agents SDK）：编程框架，提供 HTTP pipeline、中间件、路由，开发者自行选择 ORM、前端、认证方案。

选择哪个取决于：**谁来构建**（业务团队 vs 开发团队）、**需要多少控制权**（平台内置 vs 自定义编排）、**维护成本谁承担**（平台运维 vs 自运维）。
:::

## #studio 02 / Copilot Studio :: Copilot Studio：低代码 Agent 平台

端到端的可视化 Agent 构建体验，从创建到发布全在平台内完成。

:::accordion
::panel { open: true }
### 2.1 覆盖范围
Copilot Studio 是一个垂直整合的平台，在一个产品中覆盖了 Agent 构建的完整链路：

- **意图理解**：内置 NLU 模型，将用户输入匹配到最佳 Topic；Generative Orchestration 模式下基于 GPT 自动路由。
- **对话编排**：Topic 画布定义对话流（问题节点 → 条件分支 → 消息输出 → 行动调用），无需编码。
- **知识接入**：支持 SharePoint、Dataverse、上传文件、公共网站、Power Platform Connectors 作为 Knowledge 源，自动 RAG。
- **工具调用**：1,400+ Power Platform 预置 Connectors（SharePoint / Dynamics 365 / SAP / ServiceNow 等）和自定义 Connectors。
- **工作流**：Agent Flow（基于 Power Automate）可作为 Agent 的 Tool 被调用，也可独立运行。
- **渠道发布**：一键发布到 Teams、Web、Facebook、Azure Bot Service 支持的渠道。
- **M365 Copilot 扩展**：Agent 可发布为 M365 Copilot 的扩展，用户在 Copilot 中直接调用。

::panel
### 2.2 技术边界
Copilot Studio 通过标准化换取简单性，平台当前存在五项明确的技术边界：

- **模型不可选**：编排模型由平台管理（Azure OpenAI GPT 系列），不支持自行指定基座模型。
- **编排逻辑不可编程**：Generative Orchestration 的路由决策基于 Topic/Tool 的 description，无法注入自定义推理循环。
- **运行时不可自定义**：Agent 运行在 Microsoft 托管的多租户环境，不支持 VNet、自定义容器或 Bring-Your-Own 资源。
- **状态管理有限**：Topic 变量和 Global 变量两级作用域；无内置的跨会话持久化状态。
- **Activity 类型受限**：平台自动处理 Activity 协议，开发者无法直接操作 TurnContext 或注册自定义 Activity 类型处理器。
:::

## #sdk 03 / Agents SDK :: M365 Agents SDK：Pro-Code Agent 框架

面向开发者交付多渠道 Agent 的通信基础设施和编程模型。

:::accordion
::panel { open: true }
### 3.1 SDK 的职责
M365 Agents SDK（前身 Bot Framework SDK v4）是一个开发框架，负责 Agent 与渠道之间的通信层：

- **Activity 协议处理**：解析和构造符合 Activity Protocol 规范的结构化消息（Message / Event / Invoke / ConversationUpdate / Typing 等）。
- **Turn 管理**：每次用户交互创建 TurnContext，开发者通过 TurnContext 读取输入、管理状态、发送回复。
- **多渠道适配**：同一段 Agent 代码可部署到 M365 Copilot、Teams、Web Chat（DirectLine）、Slack 等渠道，SDK 处理各渠道的格式差异。
- **状态管理**：提供 TurnState 管理会话状态、用户状态和对话状态的持久化。
- **Adaptive Cards**：支持在 Teams 等渠道中发送富卡片交互。
- **Streaming**：支持向 M365 Copilot 等要求流式响应的渠道发送增量输出。

::panel
### 3.2 SDK 不负责什么
Agents SDK 是 AI 无关的通信层，五类上层能力需要开发者自行选型和集成：

- **AI 模型调用**：SDK 不绑定任何 LLM。开发者自行集成 Azure OpenAI、OpenAI、Anthropic 或开源模型。
- **意图识别和 NLU**：SDK 不内置 NLU；开发者可使用 CLU（LUIS 继任者）、Semantic Kernel 或自定义分类器。
- **编排逻辑**：SDK 不提供 Topic 路由或 Generative Orchestration。需要编排的场景可集成 Semantic Kernel、LangChain 或 AutoGen。
- **Knowledge / RAG**：SDK 不内置知识检索功能。开发者通过 Azure AI Search、Qdrant 或其他 vector store 自行构建。
- **工具连接器**：没有预置的 1,400 Connectors 生态。外部系统调用通过标准 HTTP 客户端或 SDK 实现。

::panel
### 3.3 代码结构示例
用 Agents SDK 创建一个 Echo Agent 的最小代码（C#）：

```
builder.AddAgent(sp =>
{
    var agent = new AgentApplication(
        sp.GetRequiredService<AgentApplicationOptions>());

    agent.OnActivity(ActivityTypes.Message,
        async (turnContext, turnState, cancellationToken) =>
    {
        var text = turnContext.Activity.Text;
        await turnContext.SendActivityAsync(
            MessageFactory.Text($"Echo: {text}"),
            cancellationToken);
    });
});
```

从这个基础容器出发，开发者可以自行加入 Azure OpenAI 调用（AI 推理）、Semantic Kernel（编排）、Azure AI Search（知识检索）等组件。SDK 不限制技术选型。

::panel
### 3.4 渠道差异处理
Agents SDK 将渠道差异抽象到 Activity 协议层，但各渠道仍有特定约束：

| 渠道 | 特点 |
| --- | --- |
| **Microsoft Teams** | 支持 Adaptive Cards、消息更新/删除、Invoke Activity（Task Module）、Teams 特有 ChannelData（@mention、会议信息）。 |
| **M365 Copilot** | 以 Message Activity 为主；要求 Streaming 响应；支持 Citations；不支持 Typing Activity 和富卡片。 |
| **Web Chat / DirectLine** | HTTP 协议；完整支持所有 Activity 类型和自定义 ChannelData。 |
| **第三方（Slack / Facebook）** | 部分 Activity 类型受限；Card 渲染行为不一致。 |
:::

## #relationship 04 / Relationship :: 两者如何协作

Copilot Studio 和 Agents SDK 共享底层协议，可以在同一解决方案中协同工作。

:::accordion
::panel { open: true }
### 4.1 共享基础：Activity Protocol
两个产品都基于同一套 Activity Protocol 通信规范。该协议定义了 Activity 的结构化 JSON 格式（type / from / recipient / text / attachments / channelData 等字段），是 Microsoft Teams、M365 Copilot、Copilot Studio 和 Agents SDK 之间的通用语言。

这意味着：

- Copilot Studio 构建的 Agent 和 Agents SDK 构建的 Agent 可以发布到同一批渠道（Teams / M365 Copilot / Web Chat）。
- 两者构建的 Agent 在渠道端的用户体验一致——终端用户无法区分 Agent 是低代码还是 Pro-code 构建的。
- 两者可以通过 Activity Protocol 双向互调（Copilot Studio Agent ↔ SDK Agent）。

::panel
### 4.2 架构分层
在 Microsoft 智能体技术栈中，两者处于不同的架构层：

渠道层

M365 Copilot · Teams · Web Chat · Slack

（两者共享的发布目标）

↕

Copilot Studio

NLU + Topic 画布

Generative Orchestration

Knowledge + Connectors

（垂直整合，一体化）

M365 Agents SDK

Activity Protocol

TurnContext + 状态管理

渠道适配层

（通信框架，AI 自选组装）

↕

AI 服务与工具层

Azure OpenAI · Semantic Kernel · Azure AI Search · 自定义 API

（Copilot Studio 已内置；SDK 路径需开发者自行组装）

::panel
### 4.3 互调能力：谁能调用谁
截至 2026-04 的互调能力矩阵（部分能力处于 Public Preview 阶段）：

| 调用方向 | 接入方式 | 状态 |
| --- | --- | --- |
| **Copilot Studio → SDK Agent** | 在 Copilot Studio 的 Agents 页面选择 Add an agent → Connect to an external agent → Microsoft 365 Agents SDK。填入 SDK Agent 的 messaging endpoint URL（默认 `/api/messages`），配置认证方式后即可连接。连接后 Copilot Studio Agent 可在对话中自动路由或手动 Redirect 到 SDK Agent。 | Preview |
| **Copilot Studio → Foundry Agent** | Add an agent → Microsoft Foundry。提供 Foundry Project Endpoint URL 和 Agent Id 即可连接。 | Preview |
| **Copilot Studio → 其他 Copilot Studio Agent** | Add an agent → 选择同环境中的另一个 Copilot Studio Agent 作为 Connected Agent。也可创建 Child Agent（轻量子 Agent，嵌在主 Agent 内部）。 | GA |
| **Copilot Studio → A2A 协议 Agent** | Add an agent → Agent-to-Agent。通过 A2A 协议端点连接任何兼容 A2A 的外部 Agent。 | Preview |
| **Copilot Studio → Fabric Data Agent** | Add an agent → Fabric Data Agent。已知限制：不支持通过 Redirect 节点调用，不支持在 instructions 中引用，不支持部署到 M365 Copilot。 | Preview |
| **SDK Agent → Copilot Studio Agent** | Agents SDK 仓库提供 Copilot Studio Client sample（C# / JS / Python），SDK Agent 代码中通过该 Client 将对话转交给 Copilot Studio Agent。 | Sample |
| **SDK Agent → SDK Agent** | 开发者自行通过 HTTP / gRPC / Activity Protocol 实现 Agent 间通信，SDK 不限制互调方式。 | GA |

::panel
### 4.4 常见问题直答
**Q：Copilot Studio 能否通过 Agents SDK 调用 M365 原生 Agent（如 Researcher）？**

不能直接调用。M365 原生 Agent（Researcher、Analyst 等）是 Microsoft 内置的 Agent，不对外暴露 messaging endpoint 或 Agent Id。Copilot Studio 的 Connected Agent 机制只能连接到开发者自己部署的 SDK Agent、Foundry Agent、A2A Agent 或同环境的 Copilot Studio Agent。M365 原生 Agent 只能在 M365 Copilot 内由 Copilot 编排器自动调度，第三方 Agent 无法主动调用。

**Q：Copilot Studio Agent 和 SDK Agent 在 M365 Copilot 中是什么关系？**

两者在 M365 Copilot 中都是「扩展 Agent」——用户通过 @mention 或侧边栏选择后进入该 Agent 的独立对话上下文。它们与 M365 内置 Agent 不共享编排器，无法在同一轮对话中被 Copilot 编排器混合调度。

**Q：SDK Agent 部署在哪里？**

SDK Agent 是开发者自行托管的应用，通常部署在 Azure App Service 或 Container Apps 上，通过 Azure Bot Service 注册渠道。Copilot Studio Agent 通过 Connected Agent 功能连接到这个 endpoint。SDK Agent 的运维（扩缩容、监控、安全）由开发团队负责。

**Q：Copilot Studio 的 Connected Agent 和 Child Agent 有什么区别？**

Child Agent 是在同一个 Copilot Studio Agent 内部创建的子模块，共享主 Agent 的配置和部署。Connected Agent 是独立发布的外部 Agent（可在另一个 Copilot Studio 环境、Azure、或其他基础设施上运行），通过 endpoint URL 连接到主 Agent。Child Agent 适合团队集中管理的场景；Connected Agent 适合跨团队或跨平台集成。

::panel
### 4.5 与 Foundry Agent Service 的关系
Microsoft Foundry Agent Service 是另一个相关产品，交付全托管的 Agent 运行时。它与 Copilot Studio 和 Agents SDK 的分工关系体现为三个方面：

- **Foundry Prompt Agent**：在 Foundry Portal 中通过 Instructions + Model + Tools 配置创建的 Agent，无需编码，定位与 Copilot Studio 有重叠但生态不同（Copilot Studio 偏 Power Platform 生态；Foundry 偏 Azure AI 生态）。
- **Foundry Hosted Agent**：开发者用 Agent Framework SDK 或 LangGraph 编写代码，部署为容器运行在 Foundry 托管的基础设施上。适合需要全托管运行时的 Pro-code Agent。
- **M365 Agents SDK 的角色**：无论 Agent 后端是 Copilot Studio、Foundry 还是自建服务，M365 Agents SDK 都可以作为渠道连接层，将 Agent 发布到 Teams / M365 Copilot。

本指南聚焦 Copilot Studio 与 Agents SDK 的对比；Foundry Agent Service 的详细分析参见相关专题文章。
:::

## #comparison 05 / Comparison :: 核心差异对比

10 个维度的结构化对比。

:::accordion
::panel { open: true }
### 5.1 全维度对比表
| 维度 | Copilot Studio | M365 Agents SDK |
| --- | --- | --- |
| **构建方式** | GUI 画布 + 自然语言描述 | 代码（C# / JavaScript / Python） |
| **AI 编排** | 内置 Generative / Classic 两种模式 | 不内置；自选 Semantic Kernel / LangChain 等 |
| **模型选择** | 平台管理（Azure OpenAI GPT 系列） | 开发者自选（任意 LLM Provider） |
| **知识集成** | 内置 RAG（SharePoint / 文件 / Dataverse / 网站） | 自行实现（Azure AI Search / 自建 Vector Store） |
| **外部系统** | 1,400+ Power Platform Connectors | 标准 HTTP 调用 / 自定义 SDK |
| **发布渠道** | Teams / Web / Facebook / M365 Copilot | Teams / Web Chat / M365 Copilot / Slack / 自定义 |
| **Activity 控制** | 平台自动处理，开发者不接触 TurnContext | 完全控制 TurnContext / Activity Type / ChannelData |
| **托管** | 全托管（Microsoft 运维） | 自行部署（Azure App Service / Container Apps 等） |
| **计费** | Copilot Credits（按事件类型分级） | Azure 计算资源 + 所选 AI 服务的 Token 用量 |
| **上线速度** | 简单场景 30 分钟内 | 取决于开发复杂度，通常数天到数周 |
:::

## #scenarios 06 / Scenarios :: 六个场景的选型分析

每个场景列出需求特征和选型依据。

:::accordion
::panel { open: true }
### 6.1 场景概览
- **IT Helpdesk 自助服务** — 员工在 Teams 问 IT 问题，Agent 从 SharePoint 知识库检索答案。
- **销售报价查询** — 销售在 M365 Copilot 中查询产品价格和库存，Agent 调用 Dynamics 365 Connector。
- **Teams 协作 Agent** — 深度集成 Teams 特有能力：Adaptive Cards 交互表单、Task Module、@mention、消息更新。
- **多模型推理 Agent** — 使用 Semantic Kernel 编排多模型调用（GPT-4o 推理 + Claude 验证），嵌入自有 Web 应用。
- **嵌入产品的对话功能** — SaaS 产品内嵌 AI 助手，通过 DirectLine 接入，完全自定义 UI 和交互逻辑。
- **客服前台 + 业务后端** — Copilot Studio 处理 FAQ；复杂请求路由到 SDK Agent 做业务逻辑处理。

::panel
### 6.2 场景 A：IT Helpdesk（Copilot Studio）
**需求**：员工在 Teams 中提问密码重置、VPN 配置等 IT 问题；无法解决时创建 ServiceNow 工单。

员工

(Teams)

→

Copilot Studio

Agent

→

SharePoint KB

+ ServiceNow

Connector

**选 Copilot Studio 的依据：**

- 知识源是 SharePoint 文档，Copilot Studio 直接接入，无需实现 RAG 管线。
- ServiceNow 是预置 Connector，IT 管理员在画布中配置即可使用。
- 维护者是 IT 运维团队而非开发团队，GUI 画布更新 Topic 无需代码部署。
- 如果用 Agents SDK 构建相同功能，开发者需要自行实现：SharePoint Graph API 调用 + 文本向量化 + 检索逻辑 + ServiceNow REST API 集成 + Teams 渠道适配——工作量与收益不成比例。

::panel
### 6.3 场景 B：Teams 协作 Agent（Agents SDK）
**需求**：项目管理 Agent 在 Teams 频道中运行，支持通过 Adaptive Card 表单收集需求、Task Module 弹窗展示详细信息、根据 @mention 分派任务、实时更新之前发送的消息。

Teams

Channel

→

Agents SDK

Agent

→

Semantic

Kernel

→

Azure DevOps

API

**选 Agents SDK 的依据：**

- 需要处理 Teams 特有的 Invoke Activity（task/fetch、task/submit），Copilot Studio 不暴露 Activity 类型级别的控制。
- 需要更新已发送的消息（如状态变更后自动刷新之前的 Adaptive Card），需要 TurnContext.UpdateActivityAsync()。
- 需要解析 ChannelData 中的 Teams 特有数据（meeting info、@mention resolution）。
- Agent 逻辑包含自定义状态机（需求 → 评审 → 分派 → 追踪 → 关闭），超出 Topic 画布的线性流程能力。

::panel
### 6.4 场景 C：多模型推理 Agent（Agents SDK）
**需求**：法律合同审查 Agent，使用 GPT-4o 做初始分析，调用 Claude 做交叉验证，对比结果后生成最终意见。Agent 部署为 Web 应用的后端服务。

Web App

(DirectLine)

→

SDK Agent

+ Semantic Kernel

→

Azure OpenAI

+ Anthropic API

→

审查

报告

**选 Agents SDK 的依据：**

- 需要调用非 Azure OpenAI 的模型（Anthropic Claude），Copilot Studio 不支持自选模型 Provider。
- 需要自定义推理流程：两个模型的输出需要对比后合并，这种逻辑无法在 Topic 画布中表达。
- 通过 DirectLine 嵌入已有 Web 应用，需要自定义 UI 而非 Copilot Studio 的标准 Web Chat 组件。
- Semantic Kernel 提供 Plugin / Planner 编排能力，开发者可以精确控制模型调用顺序和结果合并策略。

::panel
### 6.5 场景 D：SaaS 产品内嵌 Agent（Agents SDK）
**需求**：一个 B2B SaaS 产品（如项目管理工具）需要在产品内嵌入 AI 助手，用户在产品 UI 中直接与 Agent 对话，Agent 可以操作产品内的数据。

产品 UI

(DirectLine SDK)

→

SDK Agent

(Azure App Service)

→

产品 DB

+ 内部 API

**选 Agents SDK 的依据：**

- 产品需要完全自定义的 Chat UI（品牌一致性），不能使用 Copilot Studio 的标准 Web Chat 小部件。
- Agent 需要直接访问产品的内部数据库和 API，这些是私有接口，没有对应的 Power Platform Connector。
- 需要在 Agent 代码中执行产品级别的权限校验（租户隔离、角色授权），这超出 Copilot Studio 的变量作用域能力。
- 部署在产品已有的 Azure 基础设施上（App Service / AKS），运维团队统一管理。

::panel
### 6.6 场景 E：客服前台 + 业务后端（协同使用）
**需求**：客服系统承接高频咨询。80% 是标准问题（退货政策、账户查询），20% 需要业务逻辑处理（退款计算、合规审查）。

客户

(Teams / Web)

→

Copilot Studio

前台 Agent

路由 →

SDK Agent

(业务逻辑)

→

CRM

+ ERP

**协同使用的依据：**

- 标准问题由 Copilot Studio 处理：Knowledge 源接入产品文档，Connectors 查询订单状态——客服运营团队可自行维护。
- 复杂请求通过 Agent Flow（HTTP Action）路由到部署在 Azure 上的 SDK Agent，由后者执行退款计算、合规规则等业务逻辑。
- 用户体验无缝：客户在同一对话中完成，路由在后端发生，无需切换界面。
- 职责分离：客服团队管低代码部分（更新 FAQ、调整回复话术），开发团队管代码部分（业务规则、API 集成）。
:::

## #decision 07 / Decision Framework :: 选型决策

基于需求特征判断适用产品。

:::accordion
::panel { open: true }
### 7.1 判断标准
| 条件 | 指向 |
| --- | --- |
| 构建和维护者是业务团队 / IT 管理员 | Copilot Studio |
| 知识源在 SharePoint / Dataverse / 公共网站 | Copilot Studio（内置 RAG） |
| 外部系统有对应的 Power Platform Connector | Copilot Studio |
| 需要发布为 M365 Copilot 扩展 | 两者均可 |
| 需要操作 Teams 特有能力（Adaptive Cards / Task Module / Invoke） | Agents SDK |
| 需要自选 AI 模型（非 Azure OpenAI） | Agents SDK |
| 需要自定义推理/编排逻辑 | Agents SDK |
| 需要嵌入已有应用（自定义 UI） | Agents SDK（DirectLine） |
| 需要访问私有 API / 内部数据库 | Agents SDK |
| 标准问答 + 少量复杂逻辑 | 协同使用 |

::panel
### 7.2 决策注意事项
- **不存在替代关系**：Copilot Studio 是完整平台（含编排 + 运行时 + 工具），Agents SDK 是通信框架（需自行组装 AI 能力）。选择取决于团队技能结构和项目需求，而非产品优劣。
- **运维成本差异**：Copilot Studio 的运维由 Microsoft 承担（SaaS 模式）。Agents SDK 构建的 Agent 需要开发团队负责 CI/CD、基础设施、监控和版本管理。
- **可以逐步演进**：从 Copilot Studio 开始验证场景可行性；当需求超出平台边界时，将复杂部分用 Agents SDK 实现，两者通过 HTTP / Activity Protocol 集成。
- **许可条件不同**：Copilot Studio 需要独立的 Copilot Studio 订阅或附带在 Dynamics 365 / M365 Copilot 许可中。Agents SDK 是开源免费（MIT 协议），成本来自 Azure 计算和 AI 服务消耗。
:::

## #references 08 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio | Copilot Studio 产品定位、Agent/Agent Flow 定义、两种使用模式（独立 / M365 扩展）和渠道发布。
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-365/agents-sdk/agents-sdk-overview | Agents SDK 产品定位、Agent 容器模型、AI 无关设计原则、C#/JS/Python 支持。
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-365/agents-sdk/activity-protocol | Activity Protocol 规范、Activity 类型（Message / Event / Invoke / ConversationUpdate）、TurnContext 编程模型。
- [4] Microsoft. — https://github.com/microsoft/agents | SDK 仓库结构、与 Semantic Kernel / Azure AI Foundry / Copilot Studio 的关系说明和 Sample 代码。
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors | Copilot Studio 通过 Power Platform Connectors 集成外部服务的机制和认证模式。
- [6] Microsoft. — https://learn.microsoft.com/en-us/azure/foundry/agents/overview | Foundry Agent Service 定位和三类 Agent（Prompt / Workflow / Hosted），作为补充背景参考。
- [7] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents | Copilot Studio 多 Agent 架构：Child Agent、Connected Agent、外部 Agent（SDK / Foundry / A2A / Fabric）连接方式和已知限制。
- [8] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-microsoft-365-agents-sdk-agent | Copilot Studio 连接 SDK Agent 的具体步骤：endpoint URL、认证配置和数据流责任说明。
- [9] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/microsoft-copilot-extend-copilot-extensions | Copilot Studio Agent 发布到 M365 Copilot 的流程，Agent 在 M365 Copilot 中的行为模式。

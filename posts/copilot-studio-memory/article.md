---
title: Copilot Studio 记忆管理机制：变量作用域、对话历史与知识检索
eyebrow: Memory Architecture Reference
brand: Copilot Studio
date: 2026-04-09
strict_i18n: false
strict_density: true
lead: "Copilot Studio Agent 的\"记忆\"由四层机制组成：Topic 变量（单 Topic 作用域）、Global 变量（会话作用域）、对话历史（orchestrator 有限窗口）和知识源检索（4–6h 同步的外部文档）。本文系统梳理各层的作用域、生命周期、控制手段与已知限制，作为 Agent 状态管理架构选型的量化参考。数据来源为 Microsoft Learn 官方文档（2026-04-09 核验）。"
hero_actions:
  - "查看变量体系 | #variables"
  - "查看缺失能力 | #gaps"
panel_label: 核心约束
panel_title: 无跨会话持久记忆、对话历史窗口有限、知识同步周期 4–6 小时
panel:
  - Global 变量在会话结束时重置，平台原生不支持跨会话持久化变量。
  - Generative orchestration 下对话历史有限，长对话中 Agent 可能丢失早期上下文。
  - 知识源（SharePoint / OneDrive / Dataverse）同步周期 4–6 小时，非实时更新。
metrics:
  - "变量作用域 | 2 级 | Topic（单话题）+ Global（会话级）"
  - "Global 变量生命周期 | 单次会话 | 会话结束或 Reset Conversation 时清除"
  - "对话历史 | 有限窗口 | Generative orchestration 下窗口量未公开"
  - "知识同步 | 4–6 小时 | 非结构化数据源的 ingestion 周期"
style:
  accent: "#9333ea"
---

## #overview 01 / Memory Architecture Overview :: Copilot Studio 的四层"记忆"机制

Copilot Studio 并未内置单一的"memory"子系统，Agent 的上下文感知能力由四层机制叠加而成，各层的作用域、生命周期与控制方式各不相同。

Layer 1: Topic Variables

### Topic 变量 — 单个 Topic 内的短期状态

作用域限于定义该变量的 Topic。Topic 执行完毕后，变量值不自动传递到其他 Topic。可通过 "Receive values from other topics" / "Return values to original topics" 显式传递。类型由 Question 节点的 entity 决定（string / number / boolean / record / table 等）。

Layer 2: Global Variables

### Global 变量 — 跨 Topic 的会话级状态

将 Topic 变量提升为 Global 作用域（前缀 `Global.`）即可跨 Topic 共享，变量名在 Agent 内全局唯一。生命周期从创建持续至会话结束，或在触发 Reset Conversation 系统 Topic 时清空；也可在会话启动时通过外部源（URL 参数、`pvaSetContext` 事件、Omnichannel 上下文）注入初始值。

Layer 3: Conversation History

### 对话历史 — Orchestrator 的上下文窗口

Generative orchestration 模式下，Agent 使用近期对话历史做决策（选择 Topic/Tool/Knowledge、填充输入参数、生成回复）。窗口大小未在官方文档中公开具体 token/turn 数。已知限制：长对话中 Agent 可能无法引用早期内容。Reset Conversation 系统 Topic 默认仅清除 Global 变量，不清除对话历史；需显式使用 "Clear variable values → Conversation history for the current session" 节点。

Layer 4: Knowledge Source Retrieval

### 知识源检索 — 基于外部文档的 RAG 式回答

Agent 从已配置的知识源（SharePoint / OneDrive / Dataverse / Salesforce / Confluence / ServiceNow / Zendesk / 网页 / 上传文件）检索信息并生成回答。这种机制本质上是按次触发的检索增强（RAG），而非 Agent 内部状态记忆。同步周期为 4–6 小时；当需要全量穷举检索（exhaustive retrieval）时，受限于上下文窗口容量可能出现回答降级。

## #variables 02 / Variable System :: 变量体系：Topic 变量与 Global 变量

变量是 Copilot Studio 中唯一由开发者显式控制的状态存储机制。理解其作用域和生命周期是状态管理设计的基础。

:::comparison
::versus Topic Variables
### Topic 变量
- **作用域** — 仅限定义该变量的 Topic 内部。
- **创建方式** — Question 节点自动创建（类型由 entity 决定），或手动通过 Set Variable Value 节点创建。
- **跨 Topic 传递** — 需在 Variable Properties 中启用 "Receive values from other topics" 或 "Return values to original topics"，并在 Redirect 节点中显式绑定。
- **命名** — 最长 500 字符（节点名称限制）。重命名后所有引用自动更新。
- **类型系统** — string / number / boolean / datetime / record / table / 自定义 entity。支持 Power Fx 公式赋值。

::versus Global Variables { highlight: true }
### Global 变量
- **作用域** — Agent 内所有 Topic 均可读写。前缀 `Global.`。
- **创建方式** — 将 Topic 变量的 scope 修改为 "Global (any topic can access)"。
- **命名约束** — 名称必须在 Agent 内全局唯一。
- **生命周期** — 从设置到会话结束或 Reset Conversation 触发时清除。不跨会话持久化。
- **外部注入** — 支持通过 URL 参数（`?UserName=Ana`）、WebChat `pvaSetContext` 事件、或 Omnichannel 上下文注入。可配置超时时间（ms）和默认值。
- **认证变量** — 配置认证后自动生成 `Global.UserDisplayName` 等认证相关 Global 变量。
:::

Key Constraint

### 变量传递的显式绑定要求

Topic 变量不会自动在 Topic 之间流动。每个需要传递的变量都必须在源 Topic 的 Redirect 节点中显式绑定到目标 Topic 的输入变量上。这意味着：(1) 开发者必须提前规划哪些变量需要跨 Topic 共享；(2) 如果变量需要在多个不相关的 Topic 中使用，应提升为 Global 变量而非逐一绑定传递。

## #history 03 / Conversation History :: 对话历史：orchestrator 的隐式上下文窗口

对话历史是 generative orchestration 模式下 Agent 做决策的核心输入之一，但开发者对其控制能力有限。

:::insight-grid { cols: 2 }
::card 01
### 上下文窗口未公开
官方文档未公开 generative orchestration 的对话历史窗口具体大小（token 数或 turn 数）。仅说明"the amount of conversation history is currently limited"。

::card 02
### 长对话丢失早期上下文
在长对话中，Agent 可能无法引用早期消息中的信息。官方建议：确保关键信息在 transcript 中定期重复出现，或重新向用户收集。

::card 03
### Reset Conversation 不清除历史
Reset Conversation 系统 Topic 默认只清除 Global 变量。清除对话历史需额外使用 "Clear variable values → Conversation history for the current session" 节点。

::card 04
### Channel 差异
Microsoft Teams 维护完整对话历史（同一 conversation ID 贯穿整个 Agent 生命周期）。Web 频道通常在页面刷新后开始新会话。这导致相同 Agent 在不同频道上的上下文行为不一致。
:::

:::comparison
::versus Control Mechanisms
### 开发者可用的控制手段
- **Clear variable values 节点** — 可选 "Conversation history for the current session" 选项，清除 orchestrator 使用的对话历史。
- **Reset Conversation 系统 Topic** — 清除所有 Global 变量，但需手动补充对话历史清除节点。
- **AI response generated 触发** — 可在 Agent 生成 AI 回复后触发自定义逻辑。
- **Plan complete 触发** — 可在 Agent 完成一个计划后触发自定义逻辑。

::versus What You Cannot Control { highlight: true }
### 开发者无法控制的部分
- **窗口大小** — 无法配置对话历史的 token/turn 上限。
- **选择性保留** — 无法标记某些消息为"重要"以优先保留在窗口中。
- **跨会话延续** — 对话历史在会话结束时完全丢失，无法在新会话中恢复。
- **历史注入** — 不支持在会话启动时注入历史消息以模拟"记忆恢复"。
:::

## #knowledge 04 / Knowledge Retrieval :: 知识源检索：外部文档作为"长期记忆"的替代

知识源是 Copilot Studio Agent 获取超出对话历史和变量范围信息的唯一内建机制。它基于检索增强（RAG 模式），而非 Agent 自身的持久记忆。

:::comparison
::versus How It Works
### 知识检索行为
- **Generative orchestration** — Agent 主动选择是否搜索知识源，基于 description 匹配。不依赖 Conversational Boosting 系统 Topic。
- **Classic orchestration** — 知识源仅在无 Topic 匹配时作为 fallback 使用，或在 Topic 内通过 generative answers 节点显式调用。
- **同步周期** — SharePoint / OneDrive / Dataverse 等非结构化数据源每 4–6 小时同步一次。
- **上下文窗口约束** — 当查询需要从大量文件中检索时（exhaustive retrieval），Agent 上下文窗口可能不足，性能降级。

::versus Limitations { highlight: true }
### 知识源检索的约束
- **非实时** — 4–6h 同步意味着知识源更新后最多需要 6 小时才能被 Agent 检索到。
- **只读** — Agent 无法向知识源回写信息，不支持"Agent 记住用户偏好并写回知识库"。
- **无个性化** — 知识源对所有用户返回相同视图，无法按用户返回差异化知识子集（除非配合用户认证与源端权限过滤）。
- **超链接丢失** — 知识源中的超链接在 Agent 回复中显示为纯文本。
:::

## #lifecycle 05 / State Lifecycle :: 状态生命周期对照表

下表横向汇总四层记忆机制的作用域、持久性与控制方式。

| 机制 | 作用域 | 生命周期 | 开发者可控 | 跨会话持久 |
| --- | --- | --- | --- | --- |
| Topic 变量 | 单 Topic | Topic 执行期间 | 完全可控（创建/赋值/传递） | 否 |
| Global 变量 | Agent 全局 | 单次会话（Reset Conversation 可提前清除） | 完全可控（创建/赋值/外部注入/清除） | 否 |
| 对话历史 | Orchestrator 窗口 | 单次会话（窗口大小有限，未公开具体值） | 部分可控（仅支持"全量清除"，不支持选择性保留） | 否 |
| 知识源 | Agent 配置级 | 持久（4–6h 同步周期） | 只读检索，不可运行时写入 | 是（但为全局知识，非用户个体记忆） |
| 外部存储（Dataverse / API） | 不限 | 自定义 | 完全可控（通过 Power Automate flow 或 connector 读写） | 是 |

## #gaps 06 / Missing Capabilities :: 缺失能力与变通方案

针对 Copilot Studio 原生记忆机制暂不支持的四类典型场景，可采用外部存储与流编排作为架构变通方案。

:::accordion
::panel { open: true }
### 6.1 无跨会话持久记忆
**问题**：所有 Global 变量和对话历史在会话结束时清除。Agent 在新会话中无法"记住"用户上次说的内容。

**变通**：通过 Power Automate flow 在会话中将关键信息写入 Dataverse 表（如 user_preferences、conversation_summary），在下次会话启动时通过 Conversation Start 系统 Topic 调用 flow 读取并注入 Global 变量。需要用户认证以关联用户身份。

::panel
### 6.2 对话历史窗口不可配置
**问题**：开发者无法调整对话历史窗口大小，也无法标记关键消息以优先保留。在客服等长对话场景中，Agent 可能丢失用户早期描述的问题上下文。

**变通**：(1) 使用 Global 变量手动保存关键上下文（如 `Global.CustomerIssue`、`Global.OrderNumber`），避免依赖对话历史。(2) 在关键节点通过 Message 节点重复确认信息以将其重新写入对话历史。(3) 对长流程拆分为多个短 Topic，每个 Topic 通过 output 变量将摘要传回。

::panel
### 6.3 无 Agent 可写知识库
**问题**：Agent 无法在运行时向知识源回写数据，不支持"将对话中学到的新信息自动写回知识库"。

**变通**：通过 Power Automate flow 将信息写入 Dataverse 表或 SharePoint 列表，但这些更新要等 4–6 小时后才会被知识源同步拾取。需要即时可用性时，应使用 API connector 直接查询 Dataverse 或外部 API。

::panel
### 6.4 Teams 频道的会话生命周期特殊性
**问题**：Teams 频道使用同一 conversation ID 贯穿 Agent 整个生命周期（即使用户移除并重新添加 Agent）。Conversation Start 系统 Topic 仅在首次添加时触发一次。Global 变量可能在长期使用中积累过时状态。

**变通**：(1) 使用 "Clear variable values" 节点在关键节点定期清理 Global 变量。(2) 不依赖 Conversation Start 做初始化，改为通过用户显式指令（如"重新开始"）触发 Reset Conversation。(3) 通过 Power Automate 定期检查变量时效性。

::panel
### 6.5 无用户画像/偏好原生支持
**问题**：Copilot Studio 没有原生的用户画像（user profile）或偏好存储机制。Agent 不能根据用户历史行为自动调整响应策略。

**变通**：在 Dataverse 中建立 user_profile 表，通过认证获取用户身份后，在 Conversation Start 中调用 Power Automate flow 加载用户画像到 Global 变量。每次会话结束前写回更新。成本：每次会话增加 2 次 flow 调用（读 + 写）。
:::

## #comparison 07 / Competitive Comparison :: 竞品记忆管理机制对比

横向对比 Copilot Studio、Google Dialogflow CX 与 Amazon Lex V2 在状态管理机制上的关键差异。数据来源为各平台官方文档（2026-04-09 核验）。

| 维度 | Copilot Studio | Dialogflow CX | Amazon Lex V2 |
| --- | --- | --- | --- |
| 变量作用域层级 | 2 级：Topic 变量 + Global 变量 | 4 级：Intent / Form / Flow-scoped / Session 参数，自动向上传播 | 2 级：Slot 值 + Session Attributes |
| 会话内变量生命周期 | Global 变量持续到会话结束或 Reset Conversation | Session 参数默认 30 分钟不活跃后过期，可通过 `session_ttl` 延长至最长 24 小时 | Session Attributes 在会话期间持续，可通过 API 在每个请求中设置/读取 |
| 跨会话持久化 | 不支持（需 Power Automate + Dataverse 变通） | 不原生支持，但开放了 API 级会话恢复接口：可通过 `QueryParameters.current_page` + `QueryParameters.parameters` 在新 session 中还原旧状态 | 不原生支持（需 Lambda + DynamoDB 变通） |
| 对话历史窗口 | 有限（具体大小未公开），仅支持全量清除 | 由 LLM 上下文窗口决定（playbook 模式），flow 模式无隐式历史 | 无隐式对话历史，状态完全由 Slot + Session Attributes 显式管理 |
| 参数自动传播 | 不自动传播，需显式 Receive/Return 绑定或提升为 Global | 自动传播：Intent 参数 → 同名 Form 参数 → Session 参数，无需显式绑定 | Slot 值在 intent 切换时需显式管理 |
| 知识检索（RAG） | 内建：SharePoint / OneDrive / Dataverse / Salesforce 等，4–6h 同步周期，只读 | Data Store agents：Vertex AI Search 集成，支持网页/非结构化/结构化数据 | 无内建 RAG（需 Lambda + Bedrock 或 OpenSearch 自建） |
| 外部状态注入 | 支持：URL 参数 / `pvaSetContext` 事件 / Omnichannel 上下文，可配置超时和默认值 | 支持：API 请求中通过 `queryParams.parameters` 注入，webhook 可读写所有参数 | 支持：API `sessionState.sessionAttributes` 注入，Lambda 可读写 |
| 变通持久化成本 | 每次会话 2 次 Power Automate flow 调用（读开始 + 写结束）+ Dataverse 表存储 | Webhook 调用 + 外部存储（Cloud Firestore / Cloud SQL） | Lambda 调用 + DynamoDB 表存储 |

:::comparison
::versus Copilot Studio Advantages
### Copilot Studio 的记忆管理优势
- **内建 RAG 知识检索** — 原生支持 7 种知识源（SharePoint / OneDrive / Dataverse / Salesforce / Confluence / ServiceNow / Zendesk），无需额外搭建检索基础设施。Dialogflow CX 需 Vertex AI Search，Lex V2 需完全自建。
- **低代码外部注入** — 通过 URL 参数或 `pvaSetContext` 事件即可注入上下文，无需编写代码。竞品均需 API 层级操作。
- **Power Platform 生态集成** — 变通方案使用 Power Automate（低代码）+ Dataverse（内建存储），而竞品需要 Lambda/Cloud Functions + 独立数据库。

::versus Copilot Studio Disadvantages { highlight: true }
### Copilot Studio 的记忆管理劣势
- **参数传播需手动绑定** — Dialogflow CX 的 Intent → Form → Session 自动传播机制减少了开发者的显式绑定工作。Copilot Studio 的每个跨 Topic 变量传递都需要在 Redirect 节点中手动指定。
- **会话恢复无 API 支持** — Dialogflow CX 允许通过 API 在新 session 中传入 `current_page` + `parameters` 恢复旧状态。Copilot Studio 不支持此机制，只能通过外部存储变通。
- **对话历史不透明** — 窗口大小未公开，不可配置，不可选择性保留。Dialogflow CX 的 flow 模式完全由显式参数控制，无隐式历史依赖。Lex V2 同样为纯显式状态管理。
- **知识源同步延迟** — 4–6 小时同步周期，且只读。Dialogflow CX 的 Data Store 支持更灵活的更新频率配置。
:::

## #community 08 / Community Patterns & Extensions :: 社区常见问题、实践模式与扩展方案

汇总 Power Platform 社区与 Microsoft Learn 文档中高频出现的记忆管理痛点及配套架构解法。

:::accordion
::panel { open: true }
### 8.1 Teams 频道"永不过期"的会话
**问题描述**：Teams 使用同一 conversation ID 贯穿 Agent 整个生命周期。Conversation Start 系统 Topic 仅在首次添加 Agent 时触发一次（即使用户移除并重新添加）。这导致 Global 变量可能保留数天前的过时数据，且 Agent 的欢迎消息不会重新出现。

**官方确认**：Microsoft Learn 原文："For agents published to the Microsoft Teams channel, the Conversation Start topic runs only once: the first time a user adds the agent to Teams, even if they remove it and add it back. The reason for this behavior is that Teams uses the same conversation ID for every session with the agent."

**推荐模式**：(1) 在 Agent 中添加"重新开始"触发关键词，触发 Reset Conversation + Clear variable values（含 conversation history）。(2) 不将关键初始化逻辑放在 Conversation Start 中，改用每次对话首条消息触发的自定义 Topic。(3) 在 Global 变量中记录时间戳，每次交互时检查是否超过有效期。

::panel
### 8.2 跨会话用户记忆的 Dataverse 模式
**问题描述**：用户频繁提出"Agent 能否记住我上次说的内容"的需求。Copilot Studio 无原生跨会话持久化能力。

**推荐架构**：

- **Step 1** — 在 Dataverse 中创建 `user_memory` 表，字段包括：user_id（lookup）、memory_key（string）、memory_value（string/JSON）、updated_at（datetime）。
- **Step 2** — 创建 Power Automate Flow "Load User Memory"：接收 user_id，查询 Dataverse，返回 JSON 格式的记忆数据。
- **Step 3** — 在 Conversation Start 或首次交互 Topic 中调用认证获取 user_id，再调用 Load User Memory 将结果 Parse 为 Global 变量。
- **Step 4** — 在 End of Conversation 或关键节点调用 "Save User Memory" Flow 写回变更。
- **成本考量** — 每次会话 2 次 Power Automate flow 调用。如果 Agent 使用 Power Platform 请求配额，standalone 订阅为 250,000/24h，Teams 计划仅 6,000/24h。

::panel
### 8.3 对话历史丢失的缓解策略
**问题描述**：长对话中用户报告"Agent 忘记了我刚说的内容"。由于 orchestrator 对话历史窗口有限且大小未公开，这在复杂多轮对话中尤为突出。

**缓解策略**：

- **关键信息 Global 化** — 在每个收集关键信息的 Topic 中，将用户输入同时写入 Global 变量（如 `Global.CustomerName`、`Global.IssueDescription`）。即使对话历史窗口滑过，这些值仍然可用。
- **摘要注入** — 在长流程的中间节点添加 Message 节点，将当前上下文摘要重新写入对话流（如"确认一下，您的问题是关于 {Global.IssueDescription}，订单号是 {Global.OrderNumber}"），让摘要重新进入对话历史窗口。
- **Topic 拆分** — 将长流程拆分为多个短 Topic，每个 Topic 通过 output 变量将摘要传回上层 Topic，避免单个 Topic 内对话轮数过多。

::panel
### 8.4 Generative Orchestration 与 Knowledge 搜索行为变化
**问题描述**：从 classic 切换到 generative orchestration 后，Knowledge 搜索行为发生变化：Conversational Boosting 系统 Topic 的定制不再生效，classic data sources 和 generative answers 节点的配置也不再被使用。

**关键区别**：Classic 模式下知识检索作为 fallback，仅在无 Topic 匹配时触发。Generative 模式下 Agent 主动决定是否搜索知识源，搜索行为由平台控制，开发者无法通过系统 Topic 定制。

**缓解策略**：(1) 在切换到 generative 模式前，审计所有 Conversational Boosting 定制，将其中的逻辑迁移到自定义 Topic。(2) 对于需要精确控制知识搜索行为的场景，评估是否继续使用 classic 模式。(3) 通过 Topic / Tool 的 description 间接控制何时触发知识检索。

::panel
### 8.5 大规模部署的扩展架构
**场景**：当原生记忆机制无法满足业务需求时，可按四级扩展架构逐层演进：

- **L1: Global 变量层（原生）** — 适用于单次会话内的上下文传递。零额外成本。上限：会话结束即丢失。
- **L2: Dataverse + Flow 层（低代码）** — 适用于跨会话用户画像和偏好。每次会话 2 次 flow 调用。上限：Power Platform 请求配额。
- **L3: Azure API + 外部存储层（Pro-code）** — 适用于需要实时数据、复杂查询或高并发的场景。通过 custom connector 调用 Azure Functions + Cosmos DB / SQL。上限：Azure 服务成本。
- **L4: Azure AI Search + RAG 层（Pro-code）** — 适用于需要向量检索和语义搜索的大规模知识库。通过 custom connector 调用 Azure AI Search。绕过原生知识源 4–6h 同步限制。
:::

## #references 09 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables | Topic 变量的创建、类型系统、跨 Topic 传递（Receive/Return values）和 Parse value 节点的官方说明。
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables-bot | Global 变量的生命周期（persist until session ends）、外部源注入（URL 参数 / pvaSetContext / Omnichannel）、超时配置和认证变量的官方说明。
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions | Generative orchestration 下对话历史的使用方式（"the amount of conversation history is currently limited"）、Clear variable values 节点的 conversation history 选项、Reset Conversation 不清除历史的行为说明。
- [4] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-system-topics | Conversation Start / Reset Conversation / End of Conversation 等系统 Topic 的触发条件与行为说明。Teams 频道下 Conversation Start 仅触发一次的行为确认。
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-quotas | 知识源同步周期（4–6 小时）、Dataverse 源限制（每 Agent 2 源 / 15 表）等数据的来源。
- [6] Google Cloud. — https://cloud.google.com/dialogflow/cx/docs/concept/parameter | Dialogflow CX 的四级参数体系（Intent / Form / Flow-scoped / Session）和自动传播机制的官方说明。用于竞品对比。
- [7] Google Cloud. — https://cloud.google.com/dialogflow/cx/docs/concept/session | Dialogflow CX 会话管理：默认 30 分钟超时、session_ttl 最长 24 小时、通过 current_page + parameters 恢复旧会话状态的官方说明。

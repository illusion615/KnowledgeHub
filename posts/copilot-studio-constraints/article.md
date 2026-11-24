---
title: Microsoft Copilot Studio 约束条件与工程边界
eyebrow: Platform Constraints Reference
brand: Copilot Studio
date: 2026-04-09
strict_i18n: false
strict_density: true
lead: Microsoft Copilot Studio 是一个低代码 AI Agent 构建平台，支持 generative orchestration 和 classic orchestration 两种模式。本文系统整理其配额、硬限制、知识源约束和编排限制，为企业 Agent 落地的方案选型提供量化依据。数据来源为 Microsoft Learn 官方文档（2026-04-09 核验）。
hero_actions:
  - "查看配额与限制 | #quotas"
  - "查看工程影响 | #implications"
panel_label: 关键约束速览
panel_title: 8,000 RPM 消息上限、1,000 Topics/Agent、8,000 字符指令、512MB 文件上限
panel:
  - Generative AI 消息受 RPM/RPH 配额控制，试用环境仅 10 RPM / 200 RPH。
  - Agent 指令上限 8,000 字符，Topics 上限 1,000/Agent，Skills 上限 100/Agent。
  - 知识源文件最大 512MB，SharePoint 无 M365 Copilot 许可时限 7MB，同步周期 4–6 小时。
metrics:
  - "消息配额 | 8,000 RPM | 单 Agent 消息上限（含集成调用）"
  - "GenAI 配额 | 50–100 RPM | 按预付包数量阶梯递增"
  - "Topics 上限 | 1,000 | Dataverse 环境每 Agent"
  - "指令长度 | 8,000 字符 | Agent Instructions 硬限制"
style:
  accent: "#7c3aed"
---

## #platform 01 / Platform Overview :: 平台定位与两种编排模式

Copilot Studio 是 Microsoft 面向企业的低代码 AI Agent 构建平台，基于 Dataverse 环境运行，支持 Web App 和 Teams App 两种入口。新建 Agent 默认使用 generative orchestration。

:::comparison
::versus Generative Orchestration
### 生成式编排（默认）
- **Topic 选择** — 基于 description 语义匹配，无需 trigger phrases。
- **工具调用** — Agent 根据 name + description 自主决定是否调用 tools。
- **知识搜索** — Agent 主动搜索知识源回答用户问题。
- **多意图** — 可同时选择多个 topics/tools/knowledge 并顺序链式执行。
- **自动追问** — 自动生成问题收集 tools/topics 所需的缺失输入。

::versus Classic Orchestration { highlight: true }
### 经典编排
- **Topic 选择** — 基于 trigger phrases 匹配，选择单个最佳 topic。
- **工具调用** — 只能在 topic 内部显式调用 tools。
- **知识搜索** — 仅作为无 topic 匹配时的 fallback。
- **多意图** — 一次只选择一个 topic 响应用户。
- **输入收集** — 必须在 topic 中手动设计 Question 节点。
:::

## #quotas 02 / Quotas :: 配额体系：RPM / RPH 阶梯

配额是平台在超出使用量时对消息的自动限流。用户触达配额后会收到失败提示，无法继续发送消息。以下分为普通消息配额和 Generative AI 消息配额两类。

| 配额类型 | 限额 | 适用条件 |
| --- | --- | --- |
| 普通消息 | **8,000 RPM** | 包括用户消息和 Azure Bot Framework Skills 集成调用 |
| GENERATIVE AI 消息配额（orchestration / agent action / AI tools / generative answers） |   |   |
| 试用/开发环境 | **10 RPM / 200 RPH** | Trial 或 Developer 类型环境 |
| 1–10 预付包 | **50 RPM / 1,000 RPH** | 按消息包数量阶梯 |
| 11–50 预付包 | **80 RPM / 1,600 RPH** | 按消息包数量阶梯 |
| 51–150 预付包 | **100 RPM / 2,000 RPH** | 按消息包数量阶梯 |
| 150+ 预付包 | **+1 RPM / +20 RPH per 10 packs** | 线性递增 |
| Pay-as-you-go | **100 RPM / 2,000 RPH** | 按量付费环境 |
| M365 Copilot 用户 | **100 RPM / 2,000 RPH** | 持有 Microsoft 365 Copilot 许可 |

## #limits 03 / Hard Limits :: 硬限制：Agent 构建与订阅边界

以下限制为平台硬约束，无法通过购买更多许可突破。分为 Web App 限制、Teams App 限制和订阅限制三组。

| 维度 | Web App | Teams App | 类型 |
| --- | --- | --- | --- |
| Agent Instructions | **8,000 字符** | — | Hard |
| Topics / Agent | **1,000**（Dataverse） | **250**（Dataverse for Teams）/ 1,000（升级后） | Hard |
| Trigger Phrases / Topic | **200** | **200** | Hard |
| Skills / Agent | **100** | **100**（需独立订阅） | Hard |
| Connector Payload | **5 MB**（GCC: 450 KB） | — | Hard |
| 文件上传大小 | **512 MB** | — | Hard |
| 文件上传数量 | **500**（不含 SharePoint） | — | Hard |
| Agents / Team | — | **50** | Hard |
| 会话限制 | **10 sessions / user / 24h**（跨租户所有 Agent） | Soft |   |
| Power Platform 请求 | **250,000 / 24h** | **6,000 / 24h** | Soft |

## #knowledge 04 / Knowledge Source Constraints :: 知识源约束：文件、同步与访问限制

Copilot Studio 支持 SharePoint、OneDrive、Dataverse、Salesforce、Confluence、ServiceNow、Zendesk 等知识源。以下整理各源的关键约束。

:::accordion
::panel { open: true }
### 4.1 SharePoint 知识源
- **文件限制** — 每个源最多 1,000 文件、50 文件夹、10 层子文件夹。单文件最大 512MB。
- **无 M365 Copilot 许可时** — generative answers 仅支持 <7MB 的 SharePoint 文件，超过需拆分。
- **支持格式** — DOC/DOCX、PPT/PPTX、PDF。不支持 ASPX 经典页面。
- **同步周期** — 4–6 小时（基于 ingestion 完成时间）。
- **列表限制** — 查询仅返回前 2,048 行。每次限选 15 个列表。超过 12 个 lookup 列不支持。
- **不支持** — 文档/文件名引用查询、Sensitivity Label 为 Confidential/Highly Confidential 的文档、密码保护文档、ALM 导入后自动处理、Custom CSS 站点、& 字符在文件名中。

::panel
### 4.2 OneDrive 知识源
- **文件限制** — 每个源最多 1,000 文件、50 文件夹、10 层子文件夹。单文件最大 512MB。
- **同步周期** — 4–6 小时。
- **支持格式** — DOC/DOCX、XLS/XLSX、PPT/PPTX、PDF。
- **不支持** — Sensitivity Label（Confidential/Highly Confidential）、密码保护、ALM、Glossary/Synonyms。

::panel
### 4.3 Dataverse 知识源
- **源数量** — 每 Agent 最多 2 个 Dataverse 源。
- **表数量** — 每个源最多 15 个 Dataverse 表。
- **表类型** — 仅支持 Standard 或 Activity 表（Virtual 表需特定 dataproviderid）。
- **Synonym/Glossary** — 支持。名称最长 100 字符，描述最长 1,000 字符。

::panel
### 4.4 Salesforce / Confluence / ServiceNow / Zendesk
- **文章数量** — 无限制。
- **文章大小** — 无限制。
- **同步周期** — 4–6 小时。
- **不支持** — ALM 导入后自动处理、Glossary/Synonyms（Salesforce/Confluence）。

::panel
### 4.5 通用约束
- **认证要求** — 所有非结构化数据源要求用户级认证。运行时用户必须登录后才能查询。不支持单凭据 SSO。
- **上下文窗口** — Agent 的上下文窗口有限。当需要从大量文件中检索信息时（exhaustive retrieval），性能会降级。
- **Hyperlinks** — 知识源（Word/PDF/网页）中的超链接在 Agent 回复中显示为纯文本。
:::

## #orchestration 05 / Orchestration Constraints :: Generative Orchestration 的已知限制

generative orchestration 模式下的已知约束，会直接影响 Agent 的行为边界和设计模式。

:::insight-grid { cols: 2 }
::card 01
### Knowledge 行为变化
generative orchestration 启用后，Agent 不使用 Conversational Boosting 系统 topic。对该 topic 的任何定制（包括 classic data sources 和 generative answers 节点）均不生效。

::card 02
### Custom Entity 不支持
Tools 和 Topics 不支持 custom entities（closed lists / regex entities）作为输入参数。需要收集自定义实体信息时，必须在 Topic 内使用 Question 节点。

::card 03
### Disambiguation 缺失
当多个 Topic 的 description 与用户意图接近时，Agent 无法调用 Multiple Topics Matched 系统 topic 进行消歧。当前会自动选择一个 topic 而非询问用户。

::card 04
### 对话历史有限
Agent 可访问的对话历史量有限。在长对话中，Agent 可能无法引用早期对话内容，需要重新收集关键信息或确保关键信息在 transcript 中定期出现。
:::

Channel Constraint

### Omnichannel 消息大小限制

通过 Omnichannel 集成时，使用 ACS channel，channel data 消息大小上限 **28 KB**。在 handoff 场景中，如果传递的所有变量（local + agent variables）超过 28 KB，transfer 会在不传递变量的情况下完成，报错 `MessageSizeExceeded`。

## #implications 06 / Engineering Implications :: 工程影响：这些约束意味着什么

以下将上述约束映射到具体的工程决策点，帮助在方案选型和架构设计阶段提前识别风险。

:::comparison
::versus Scale Planning
### 容量规划约束
- **GenAI RPM 瓶颈** — 试用环境 10 RPM 仅适合 PoC（≤10 并发用户）。生产环境需购买 51+ 预付包达到 100 RPM / 2,000 RPH 上限。
- **10 sessions/user/24h** — 限制了高频交互场景（如客服 Agent），需在架构中设计 session 复用策略。
- **1,000 Topics/Agent** — 大型知识库需要按领域拆分为多个 Agent，通过 connected agents 组合。
- **8,000 字符 Instructions** — 无法在 Instructions 中嵌入完整的领域知识；必须依赖知识源 + Topic 分层。

::versus Knowledge Architecture { highlight: true }
### 知识架构约束
- **4–6 小时同步** — 不适合需要实时知识更新的场景。变通方案：使用 API connector 直接调用外部数据源。
- **7MB 文件限制（无 M365 许可）** — 大型 PDF/DOCX 必须拆分。启用 Tenant Graph Grounding + Semantic Search 后上限提升到 200MB。
- **2 Dataverse 源/Agent** — 跨多个 Dataverse 表的复杂查询需要在 2 个源 × 15 表的约束内设计。
- **用户级认证** — 所有非结构化数据源要求运行时登录，影响匿名用户场景（如公开网页 Agent）。
:::

:::comparison
::versus Design Patterns
### 需要适应约束的设计模式
- **Topic Description 驱动** — generative orchestration 下，Topic 的语义匹配完全依赖 description 质量。description 之间必须避免语义重叠，否则触发随机选择。
- **多 Agent 组合** — 超过 1,000 Topics 或需要跨域知识时，需拆分为 connected agents。
- **显式消歧** — 由于 disambiguation 缺失，相似 Topic 必须在 description 层面通过否定语句区分（"此 Topic 处理 X，不处理 Y"）。
- **对话历史管理** — 长对话中需使用 Clear variable values 节点定期清理 conversation history，或在关键节点重复关键信息。

::versus Anti-Patterns { highlight: true }
### 应避免的反模式
- **在 Instructions 中堆叠领域知识** — 8,000 字符上限会被迅速耗尽。使用知识源 + Topics 分层。
- **依赖 Conversational Boosting 定制** — generative orchestration 下不生效。知识搜索行为由平台控制。
- **假设实时数据同步** — 所有非结构化数据源同步周期 4–6 小时。需要实时数据应使用 API connector。
- **在 Omnichannel handoff 中传递大量变量** — 28 KB 消息上限。超出时 transfer 完成但变量丢失。
:::

## #references 07 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-quotas | 所有配额数值（RPM/RPH 阶梯）和硬限制（Topics/Skills/Instructions/File 上限）的权威来源。
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio | 平台定位、Agent 定义、Agent flow 概念和接入方式（Web App / Teams App）的官方说明。
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions | Generative orchestration 与 classic orchestration 的行为差异对照表，以及 generative 模式的已知限制（disambiguation 缺失、custom entity 不支持、对话历史有限等）。

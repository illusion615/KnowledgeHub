---
title: "把经典 Knowledge Agent 迁移到 New Agent || Migrating Classic Knowledge Agent Patterns to New Agent"
eyebrow: Copilot Studio New Agent Pattern
brand: Copilot Studio
date: 2026-06-15
strict_i18n: false
strict_density: true
lead: "本文记录一次 Copilot Studio 知识问答迁移实践：经典 Knowledge Agent 依赖 topic flow、unbound action 和 AI Prompt；New Agent 改用 Instructions、Skills 和 Tools 复刻同一套 Dataverse 知识检索能力，并通过参数契约和答案规范降低重试成本。 || This article documents a Copilot Studio knowledge-answering migration: the classic Knowledge Agent used topic flows, an unbound action, and an AI Prompt; the New Agent reproduces the same Dataverse retrieval capability with Instructions, Skills, and Tools, while reducing retry cost through explicit parameter contracts and answer rules."
hero_actions:
  - "查看数据契约 || View Data Contract | #contract"
  - "查看验证清单 || View Validation Checklist | #validation"
panel_label: "迁移结论 || Migration Conclusion"
panel_title: "检索仍由 Dataverse action 承担，答案生成回到 New Agent 编排器 || Retrieval stays in Dataverse action; answer synthesis moves into the New Agent orchestrator"
panel:
  - "域清单来自 `faq_topic.biz_groupname` 去重，回答检索来自 `faq_article.faq_articlebody`。 || The domain list comes from distinct `faq_topic.biz_groupname`; answer retrieval uses `faq_article.faq_articlebody`."
  - "`options`、`entityParameters` 必须作为 JSON 字符串传入，`organization` 必须为 `current`。 || `options` and `entityParameters` must be JSON strings, and `organization` must be `current`."
  - "答案层必须二次过滤 `biz_groupname`，否则引用可能跨域混入。 || The answer layer must post-filter `biz_groupname`, otherwise citations can cross domains."
metrics:
  - "检索 Action || Retrieval Action | copilotquerytextcontext | Dataverse unbound action"
  - "召回数量 || Top Results | top 3 | 与经典实现保持一致 || Aligned with the classic implementation"
  - "域列表源 || Domain Source | faq_topic | 按 biz_groupname 去重 || Distinct by biz_groupname"
  - "答案策略 || Answer Policy | Grounded | 无命中时固定话术 || Fixed fallback when no match"
style:
  accent: "#8b5cf6"
---

## #problem 01 / Problem :: 经典 Topic 编排可以复刻，但 New Agent 需要显式契约 || Classic Topic Orchestration Can Be Reproduced, But New Agent Needs Explicit Contracts

本章说明迁移要解决的问题：保留原有知识域选择和接地回答，同时减少 Agent Flow 与 AI Prompt 的额外往返。 || This section defines the migration problem: preserve domain selection and grounded answers while reducing extra round trips through Agent Flow and AI Prompt calls.

:::comparison
::versus Classic Agent
### 显式 Topic Flow 串联检索与生成 || Explicit Topic Flow Chains Retrieval And Generation
- 通过 Flow 读取知识域列表，再用 Question 节点保存用户选择。 || A flow retrieves the domain list, and a Question node stores the selected domain.
- 调用 `copilotquerytextcontext` 检索 `faq_article`。 || It calls `copilotquerytextcontext` to retrieve from `faq_article`.
- 再调用独立 AI Prompt 将检索结果生成答案。 || A separate AI Prompt then synthesizes the retrieved context into an answer.

::versus New Agent { highlight: true }
### 工具只负责检索，编排器直接生成答案 || Tools Retrieve; The Orchestrator Synthesizes Answers
- Skills 固化域选择与检索规则，Tools 连接 Dataverse MCP 与 unbound action。 || Skills encode domain-selection and retrieval rules; Tools connect to Dataverse MCP and the unbound action.
- 答案生成不再额外调用 AI Prompt，减少一次模型往返。 || Answer synthesis no longer calls a separate AI Prompt, removing one model round trip.
- 参数类型、域过滤和 fallback 必须写成硬规则，否则模型会重试或串域。 || Parameter types, domain filtering, and fallback behavior must be explicit, otherwise the model can retry or mix domains.
:::

## #contract 02 / Data Contract :: 两张表承担两个边界：域列表与答案正文 || Two Tables Define Two Boundaries: Domain List And Answer Body

上一章明确迁移目标，本章把目标落到 Dataverse 数据契约：域列表不来自文章表，答案检索不来自 Topic 表。 || After defining the migration goal, this section maps it to the Dataverse contract: the domain list does not come from the article table, and answer retrieval does not come from the Topic table.

| 用途 || Purpose | 表 || Table | 字段 || Field | 规则 || Rule |
| --- | --- | --- | --- |
| 知识域列表 || Knowledge domain list | `faq_topic` | `biz_groupname` | 读取非空值后去重，作为用户可选 knowledge domain。 || Read non-empty values, deduplicate them, and present them as selectable knowledge domains. |
| 答案检索 || Answer retrieval | `faq_article` | `faq_articlebody` | 只检索正文列，并用 `biz_groupname` 过滤当前域。 || Search only the body column and filter by the current domain through `biz_groupname`. |
| 串域防护 || Cross-domain guard | `faq_article` | `biz_groupname` | 生成答案前二次检查返回记录，字段不等于当前域的记录必须丢弃。 || Post-filter returned records before answering; records whose field does not match the current domain must be discarded. |

Unbound Action Contract

### `copilotquerytextcontext` 的参数类型必须显式写入 Skill || `copilotquerytextcontext` Parameter Types Must Be Explicit In The Skill

- `organization` 必须传 `current`，传完整 CRM URL 会导致 Request validation 400。 || `organization` must be `current`; passing a full CRM URL can cause Request validation 400.
- `options` 必须是 JSON 字符串：`{"VectorSearchMode":"Hybrid","UseVectorSearch":true}`。 || `options` must be a JSON string: `{"VectorSearchMode":"Hybrid","UseVectorSearch":true}`.
- `entityParameters` 必须是 JSON 字符串数组，不能传原生 array。 || `entityParameters` must be a JSON-stringified array, not a native array.

## #implementation 03 / Implementation :: Instructions 定边界，Skills 定步骤，Tools 做外部调用 || Instructions Define Boundaries, Skills Define Steps, Tools Execute External Calls

数据契约明确后，New Agent 的实现重点变成编排约束：哪些行为由全局 Instructions 约束，哪些行为进入可复用 Skill。 || Once the data contract is clear, implementation shifts to orchestration constraints: which behaviors belong in global Instructions and which belong in reusable Skills.

:::insight-grid { cols: 2 }
::card 01
### 会话开始主动列域 || Proactively List Domains At Session Start
调用 Dataverse MCP 查询 `faq_topic.biz_groupname`，去重后列出 7 个知识域，让用户选择。 || Call Dataverse MCP to query `faq_topic.biz_groupname`, deduplicate values, and present the 7 domains for user selection.

::card 02
### 用精确域名更新状态 || Update State With The Exact Domain Name
用户消息中出现完整域名时，例如 `Lenovo IVA Troubleshooting`，直接把该值作为当前域。 || When the user message contains a full domain name such as `Lenovo IVA Troubleshooting`, store that exact value as the current domain.

::card 03
### 检索后再次过滤域 || Post-Filter Domain After Retrieval
即使 action 已设置 filterCriteria，答案生成前仍检查每条记录的 `biz_groupname`，不匹配就丢弃。 || Even when the action uses filterCriteria, inspect each returned record before answer synthesis and discard mismatched `biz_groupname` values.

::card 04
### 按原 Prompt 规范生成答案 || Generate Answers Under The Original Prompt Rules
保留语言一致、Markdown、引用、References、图片输出和固定 fallback。 || Preserve language consistency, Markdown, citations, References, image output, and fixed fallback behavior.
:::

:::comparison
::versus Instructions
### 写全局边界，不写工具流水账 || Write Global Boundaries, Not Tool Logs
Instructions 负责角色、数据模型、当前域状态、跨域过滤、图片保留和固定 fallback。这些规则必须覆盖所有回合，因此不能只放在单个 Skill 中。 || Instructions define the role, data model, current-domain state, cross-domain filtering, image preservation, and fixed fallback. These rules must cover every turn, so they cannot live only inside one Skill.

::versus Skills { highlight: true }
### 写可触发步骤，明确工具参数 || Write Triggerable Steps And Exact Tool Inputs
Skills 负责选域和回答两个可触发流程：`select-knowledge-domain` 管 `faq_topic` 域列表，`answer-from-knowledge` 管 unbound action、后过滤和答案格式。 || Skills define two triggerable procedures: `select-knowledge-domain` handles the `faq_topic` domain list, and `answer-from-knowledge` handles the unbound action, post-filtering, and answer format.
:::

:::accordion
::panel { open: true }
### Instructions 与 Skills 的写法 || How To Write Instructions And Skills
New Agent 的写法分成三层：Instructions 写不可违反的全局边界，Skills 写可触发的行为步骤，Tools 只承接外部系统调用。 || The New Agent writing pattern has three layers: Instructions define non-negotiable global boundaries, Skills define triggerable behavior steps, and Tools handle external system calls.

| 层级 || Layer | 写入内容 || What To Write | 设计原因 || Design Reason |
| --- | --- | --- |
| Instructions | 角色、数据模型、域选择状态、fallback、图片保留、跨域丢弃等全局约束。 || Role, data model, domain-selection state, fallback, image preservation, and cross-domain discard rules. | 这些规则必须覆盖所有轮次；若只写在某个 Skill 中，模型在域选择或异常分支中可能绕开。 || These rules must cover every turn; if they live only inside a Skill, the model can bypass them during domain selection or exception branches. |
| select-knowledge-domain | 从 `faq_topic` 读取 `biz_groupname`，去重、排序、展示给用户选择；失败时换查询方式重试。 || Read `biz_groupname` from `faq_topic`, deduplicate, sort, present choices, and adapt the query on failure. | 域列表是对话入口行为，不应混进回答 Skill；否则 greeting、切换域、直接带域提问三种场景会互相干扰。 || Domain listing is an entry behavior, not an answer behavior; mixing it into the answer Skill makes greetings, switching, and domain-prefixed questions interfere with one another. |
| answer-from-knowledge | 调用 `copilotquerytextcontext`，明确 `organization=current` 与 JSON 字符串参数；生成前过滤 `biz_groupname`。 || Call `copilotquerytextcontext`, specify `organization=current` and JSON-string parameters, and post-filter `biz_groupname` before synthesis. | 参数类型错误会造成 400 重试；检索返回中的域名错误会造成引用串域。两者都必须作为步骤写明。 || Wrong parameter typing causes 400 retries; domain mismatch in retrieved records causes cross-domain citations. Both must be explicit steps. |
| 答案规范 || Answer Rules | 同语言、Markdown、References、编号引用、图片输出；无命中时只返回固定句子。 || Same-language response, Markdown, References, numbered citations, image output; fixed one-sentence fallback when no answer exists. | 这是替代经典 AI Prompt 的部分；New Agent 不再调用独立 Prompt，因此必须把原 Prompt 的格式规则迁移到 Skill。 || This replaces the classic AI Prompt layer; because New Agent no longer calls a separate Prompt, the original formatting rules must move into the Skill. |

::panel
### 具体配置内容（可直接照填） || Concrete Configuration (Copy-Ready)
以下是本次 New Agent 的实际配置取值。Tools 已挂载「Perform an unbound action in selected environment」与「Microsoft Dataverse MCP Server」两项。 || The following are the actual values used in this New Agent. The Tools panel already mounts "Perform an unbound action in selected environment" and "Microsoft Dataverse MCP Server".

**1. select-knowledge-domain 的域查询**：在 Dataverse MCP 上读取 `faq_topic` 表的 `biz_groupname` 列，客户端去重后展示。 || **1. The domain query in select-knowledge-domain**: read the `biz_groupname` column of the `faq_topic` table through Dataverse MCP, then deduplicate client-side before display.

`SELECT biz_groupname FROM faq_topic`

**2. answer-from-knowledge 调用 copilotquerytextcontext 的精确入参**： || **2. Exact inputs for copilotquerytextcontext in answer-from-knowledge**:

| 参数 || Parameter | 类型 || Type | 取值 || Value |
| --- | --- | --- |
| `organization` | 字符串 || String | `current` |
| `searchText` | 字符串 || String | 用户的问题原文 || The user's question verbatim |
| `searchType` | 字符串 || String | `semantic` |
| `searchMode` | 字符串 || String | `any` |
| `options` | 字符串（JSON） || String (JSON) | `{"VectorSearchMode":"Hybrid","UseVectorSearch":true}` |
| `top` | 数字 || Number | `3` |
| `totalResultCount` | 布尔 || Boolean | `false` |
| `entityParameters` | 字符串（JSON） || String (JSON) | `[{"name":"faq_article","searchColumns":["faq_articlebody"],"filterCriteria":"biz_groupname eq '<SELECTED_GROUP>'"}]` |

`<SELECTED_GROUP>` 替换为当前域显示名；域名中的单引号需翻倍转义。`options` 与 `entityParameters` 必须作为字符串传入，否则返回 Request validation 400。 || Replace `<SELECTED_GROUP>` with the current domain display name; double any single quote inside the name. `options` and `entityParameters` must be passed as strings, otherwise the call returns Request validation 400.

**3. 固定 fallback 话术**：检索剩余上下文不直接回答问题时，只输出对应语言的固定句子，不附加解释或 References。 || **3. Fixed fallback strings**: when the remaining context does not directly answer the question, output only the fixed sentence in the matching language, with no explanation or References.

- 英文：Sorry, I cannot find relevant information in the knowledge library. || English: Sorry, I cannot find relevant information in the knowledge library.
- 中文：抱歉，我无法在知识库中找到相关信息。 || Chinese: 抱歉，我无法在知识库中找到相关信息。

::panel { open: true }
### Adaptive Card 与 Suggested Action 的现实边界 || The Practical Boundary Of Adaptive Cards And Suggested Actions
New Agent 的纯 Instructions / Skills 无法稳定生成经典 Topic 的 suggested-action chip。若需要原版那种可点击域按钮，应让工具返回 Adaptive Card。 || Pure Instructions and Skills in New Agent do not reliably produce the classic Topic suggested-action chips. If clickable domain buttons are required, a tool should return an Adaptive Card.

- 可选增强：Agent Flow 查询 `faq_topic` 后返回 Adaptive Card，卡片按钮用 `Action.Submit` 提交域名。 || Optional enhancement: an Agent Flow queries `faq_topic` and returns an Adaptive Card whose `Action.Submit` buttons submit the domain name.
- 会话开头固定 Suggested Prompts 只能作为 starter prompts，不能替代每轮动态按钮。 || Static startup Suggested Prompts can act as starter prompts, but they do not replace dynamic per-turn buttons.

::panel
### 图片输出规则 || Image Output Rule
检索到的 `faq_articlebody` 可能包含 Markdown 图片或原始图片 URL。只要图片和答案步骤相关，就应按 `![Image Description](Image URL)` 保留。 || The retrieved `faq_articlebody` can contain Markdown images or raw image URLs. When an image supports an answer step, preserve it as `![Image Description](Image URL)`.
:::

## #validation 04 / Validation :: 迁移是否成功，必须用行为结果验证 || Migration Success Must Be Validated Through Runtime Behavior

实现规则写入 New Agent 后，验证不应只看配置是否保存，而要检查实际对话里的检索参数、答案引用和 fallback。 || After rules are saved into New Agent, validation should inspect runtime behavior, not just saved configuration: retrieval inputs, answer citations, and fallback behavior must be checked.

| 检查项 || Check | 运行时判据 || Runtime Criterion | 通过信号 || Pass Signal |
| --- | --- | --- |
| 域列表完整 || Complete domain list | 问候语后主动读取 `faq_topic.biz_groupname` 并列出 7 个知识域。 || After a greeting, read `faq_topic.biz_groupname` and list 7 domains. | GWM、GWM Test、HR、Lenovo IVA How-to、Lenovo IVA Troubleshooting、Power Platform、Test-LongH 全部出现。 || GWM, GWM Test, HR, Lenovo IVA How-to, Lenovo IVA Troubleshooting, Power Platform, and Test-LongH all appear. |
| 首跳无 400 || No first-turn 400 | 工具调用按约定传 `organization=current`，并把 `options` / `entityParameters` 作为 JSON 字符串传入。 || The tool call passes `organization=current` and sends `options` / `entityParameters` as JSON strings. | 无 Request validation 400，无 metadata 自纠重试。 || No Request validation 400 and no metadata-based retry. |
| 引用不串域 || No cross-domain citation | 选择 Lenovo 域后，答案生成前丢弃 `biz_groupname` 不匹配的检索记录。 || After selecting a Lenovo domain, discard records whose `biz_groupname` does not match before answer synthesis. | References 和 Citations 不出现 `Power Platform`。 || References and Citations do not contain `Power Platform`. |
| 固定 fallback || Fixed fallback | 无关问题或剩余上下文不直接回答问题时，不使用通用知识补答。 || When the remaining context does not directly answer the question, do not fill the gap with general knowledge. | 只返回固定句子；不附加解释、选项或 References。 || Return only the fixed sentence, without explanations, options, or References. |

## #references 05 / References :: 参考来源 || References

以下来源用于支撑 Copilot Studio Adaptive Card、Generative orchestration 和平台约束相关判断。项目内配置结论来自本次 New Agent 实测。 || The sources below support the claims about Copilot Studio Adaptive Cards, generative orchestration, and platform constraints. Implementation conclusions come from the New Agent validation described in this article.

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-ask-with-adaptive-card | 用于说明经典 Copilot Studio topic 中 Adaptive Card 节点的交互能力。 || Supports the description of Adaptive Card interactions in classic Copilot Studio topics.
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions | 用于说明 generative orchestration 下工具与 topic 由模型选择的行为。 || Supports the description of model-selected tools and topics under generative orchestration.
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-quotas | 用于说明 Instructions、Tools 与平台边界需要被工程化约束。 || Supports why Instructions, Tools, and platform boundaries need engineering constraints.

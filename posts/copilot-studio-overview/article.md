---
title: Microsoft Copilot Studio：定位、能力、落地路径与费用
eyebrow: Platform Decision Guide
brand: Copilot Studio
date: 2026-11-02
strict_i18n: false
strict_density: true
lead: Copilot Studio 是 Microsoft 面向企业的低代码 AI Agent 工作室，可构建 agents、workflows、agent flows，以及处于付费公开预览的 apps。2026 年 11 月官方指南把三种主运行底座更新为 GitHub Copilot、Customer Conversation（公开预览）与 Standard harness；其中 GitHub Copilot harness 从自然语言构建、预览和评测阶段开始消耗 Copilot Credits，Standard harness 则按运行事件计量。本文按定位、harness 选型、能力、产品边界、计费模型、场景成本、购买路径、治理、启动九个维度给出决策依据。数据来源为 November 2026 两份官方许可与 Credits 指南及 2026 年 10 月末 Microsoft Learn，核验日为 2026-11-02。
hero_actions:
  - "查看 Harness 选型 | #harness"
  - "查看购买路径 | #pricing"
panel_label: 适用人群
panel_title: 业务分析师用自然语言构建，IT 管理员控成本与合规，开发者按需扩展
panel:
  - 业务分析师与 Citizen Developer：用自然语言描述目标生成 Agent 骨架；每位构建者需要一张 Copilot Studio User License（$0）。
  - IT 管理员：在 Power Platform 管理中心配置 DLP 策略、分配 Credits 容量、对单个 Agent 设月度消耗上限。
  - 开发者：通过 connectors、MCP、agent flows、Bot Framework skills 与自带模型扩展；自带模型单独计费。
metrics:
  - "运行底座 | 3 种 Harness | GitHub Copilot / Customer Conversation / Standard"
  - "按量单价 | $0.01 / Credit | Pay-as-you-go 计量表，月末后付"
  - "容量包 | $200 / 25,000 Credits | 每月，年付，未用完不滚存"
  - "限流阈值 | 125% | 超出预付容量后自定义 Agent 被禁用"
style:
  accent: "#6d28d9"
---

## #what 01 / Platform Positioning :: 一个工作室组合四类构建能力，运行底座决定计费边界

Copilot Studio 属于 Microsoft Power Platform，前身为 Power Virtual Agents。当前官方概览把 agents、workflows、agent flows 与 apps 纳入同一工作室；还可用 Build with natural language（预览）在一次会话中组合生成 agents 与 workflows。Copilot Credits 已成为 Copilot Studio、Work IQ APIs、Copilot Managed Runtime 等工作负载共用的消耗单位，并在租户层级汇总。

:::insight-grid { cols: 2 }
::card 01
### Agent
处理对话并完成任务的 AI 助手。它依据指令与上下文调用知识、工具和其他 Agent；具体规划与恢复能力取决于所选 harness。

::card 02
### Workflow
运行在 GitHub Copilot harness 上的拖放式自动化，用于推理型、多步骤业务流程；自然语言创作、预览、测试和生成评测均可能消耗 Credits。

::card 03
### Agent Flow
运行在 Standard harness 上的既有流程格式，可独立运行或作为 Agent 工具。Power Automate 云端流可转换为 Agent Flow，但不能直接转换为新 Workflow。

::card 04
### App（付费公开预览）
开启 New experience 后可构建 App，并发布到 Copilot Managed Runtime。构建期按生成与迭代消耗 Credits；托管运行按 API 调用计量，Power Apps Premium 用户受既有请求限额约束。
:::

## #harness 02 / Choose a Harness :: 三种主 Harness 面向不同任务，Copilot Chat 不再单列为第三种底座

Harness 是 Agent 或 workflow 背后的编排与运行框架，不是三款独立产品或三种 SKU。November 2026 官方指南列出的三种主 Harness 是 GitHub Copilot、Customer Conversation（公开预览）与 Standard。Copilot Chat agents 仍用于以组织知识扩展 Microsoft Copilot，但在许可口径中归入 Standard harness 的 Microsoft 渠道场景。GitHub Copilot 与 Standard harness 之间不能直接迁移，切换意味着重新架构。

| 维度 | GitHub Copilot Harness | Customer Conversation Harness | Standard Harness |
| --- | --- | --- | --- |
| 状态与定位 | GA 主底座；面向推理型、多步骤 agents 与 workflows | Public Preview；面向语音与聊天客户服务，构建物称 Customer Assist Agent | GA 主底座；面向 topics、规则与 agent flows 驱动的 Agent |
| 典型场景 | 跨文件、系统和工具推进复杂业务流程 | 客户自助问答、身份核验、任务办理与转人工前分流 | 结构化对话、网站/Teams/SharePoint 等多渠道发布 |
| 差异能力 | 原生文件处理、Skills、Memory、Bash 容器与 Hooks | 按 Digital、GenAI Voice、Premium S2S Voice 估算运行消耗 | Generative / Classic orchestration、Computer Use、Agent Flows |
| 许可与计费 | LLM 构建体验与运行均需 Credits；自然语言构建、预览和评测即开始计费 | 运行需 Credits；官方给出的区间仅是粗略规划估算 | 通常按运行事件计费；已认证持证用户在 Microsoft 渠道的 B2E 用量受公平使用零费率权益覆盖 |
| 关键限制 | 不能转换到 Standard harness；部分 Standard 渠道和能力尚不支持 | 预览条款适用；语音渠道不支持终端用户登录 | 不能转换到 GitHub Copilot harness；CUA 与 Work IQ APIs 不在 Microsoft Copilot USL 豁免内 |

:::callout { title: "关键洞察 || Key Insight" }
规划区间（非合同报价）：GitHub Copilot harness 自然语言构建约 1–20 / 21–60 / 61+ Credits，运行约 100–300 / 300–500 / >500 Credits（Light / Medium / Heavy）。Customer Conversation 的 Digital 约 5–15 / 15–25 / 25–50 Credits；语音还会随时长、模型与 S2S 层级上升。实际消耗取决于模型、运行时、上下文和工具调用。
:::

## #capabilities 03 / Core Capabilities :: 构建能力靠编排，落地能力靠连接器与知识源

能力可以分成两组：一组决定 Agent 如何被创作和编排，另一组决定它能读到什么数据、能调用什么系统。前者受 harness 约束，后者主要受许可路径约束。

:::comparison
::versus Agent Building
### 构建与编排
- **自然语言创建** — 描述目标（≤1,024 字符），生成 name、description、instructions 以及建议的 triggers、knowledge 和 tools。
- **Generative orchestration** — 按语义匹配自动选择 Topics、Tools、Knowledge 和子 Agent，支持多意图链式执行。Teams 计划不含此能力。
- **Classic orchestration** — 按 trigger phrases 匹配单个 Topic，适合需要精确控制回答的场景。
- **可视化与代码双通道** — 节点式 Topic 编辑器（Question / Message / Condition / Set variable / Redirect / Action），同时支持 YAML 代码编辑。
- **评测与分析** — 用测试集和共享评分器库在发布前后验证质量，并跟踪自定义指标与会话结果。
- **Harness 边界** — GitHub Copilot harness 提供 Skills、Memory、Bash 容器与 Hooks；Standard harness 当前保留 Computer Use、手动认证、自定义实体以及更多发布渠道。两者不可直接转换。

::versus Integration & Extension { highlight: true }
### 集成与扩展
- **Knowledge 来源** — SharePoint、OneDrive、Dataverse、Salesforce、Confluence、ServiceNow、Zendesk、公开网页与上传文件（DOC / PPT / PDF）。
- **Tools 与 Connectors** — Standard、Premium 和自定义 connectors 均含在 Copilot Studio 许可内，同时支持 HTTP 请求与 MCP。
- **Agent Flows 与 Power Automate** — Agent flows 按 Copilot Credits 计费；Power Automate 云端流沿用 Power Automate 许可，不消耗 Copilot Credits。
- **Bot Framework** — 可用 Bot Framework skills 扩展，也可把 Copilot Studio 经典聊天机器人作为 skill 被其他 Bot 调用。
- **模型与语音** — 自带模型（含 Microsoft Foundry 模型）单独计费；外部模型可能涉及跨区域处理并需管理员开启。语音 Agent 按通话总时长和语音编排层级计费。
- **Computer Use（功能 GA）** — 仅适用于开启 Generative orchestration 的 Standard harness Agent；标准模型 5 Credits/步，高级模型 15 Credits/步，不含在 Microsoft Copilot USL 内。各模型仍有独立状态，其中 15 Credits/步的 premium 模型当前为 Experimental。
:::

## #comparison 04 / Product Boundaries :: 与相邻产品的分工是互补关系，不是替代关系

下表基于 Microsoft 官方产品定位与许可文档。第三方产品不在本文核验范围内。Copilot Studio 与 Microsoft Foundry、Power Automate、Azure Bot Service 和 Microsoft Copilot 是协作关系：低代码编排、专业代码、流程自动化与终端用户订阅各自承担不同层级。

| 维度 | Copilot Studio | Azure Bot Service | Microsoft Copilot |
| --- | --- | --- | --- |
| 定位 | 低代码 AI Agent 与工作流工作室 | Pro-code Bot 开发框架 | 面向终端用户的 AI 助手订阅 |
| 受众 | 业务分析师 / IT 管理员 / Citizen Developer | 专业开发者 | 全体持证员工 |
| 代码要求 | 无（可选 Power Fx / YAML） | C# / JavaScript / Python | 无 |
| 编排能力 | 内建三种 harness，按场景选择 | 需自行实现 | 内建 Microsoft Copilot 编排器 |
| 扩展关系 | 可用 Bot Framework skills 扩展 | 可被 Copilot Studio 调用 | 可用 Copilot Studio Agent 扩展 |
| 计费方式 | Copilot Credits（按 harness 与功能类型分级） | Azure 资源计费 | 按用户订阅许可，B2E 场景含 Agent 运行用量 |

## #billing 05 / Billing Model :: Copilot Credits 按功能类型分级，单次交互可能同时命中多档

下表是 Standard harness（也覆盖 Copilot Chat agents）的官方事件费率，不适用于 GitHub Copilot harness 与 Customer Conversation harness，也不含自带模型。一次交互可能同时命中多档：例如一次经租户图谱接地的生成式回答计 12 Credits，其中 10 Credits 为租户图谱接地，2 Credits 为生成式回答。

| 功能类型 | Copilot Credits | Microsoft Copilot 持证用户 |
| --- | --- | --- |
| Classic answer（人工编写的固定回答） | 1 | 不计费 |
| Generative answer（基于知识源动态生成） | 2 | 不计费 |
| Agent action（触发器、深度推理、Topic 跳转等） | 5 | 不计费；但 Computer-Using Agent 明确不在豁免范围 |
| Tenant graph grounding（租户级 Microsoft Graph 检索增强） | 10 | 不计费 |
| Agent flow actions（每 100 次动作） | 13 | 仅「当 Agent 调用该流」触发器不计费 |
| AI Tools — basic（每 10 次响应，等价 0.1 Credit / 1K tokens） | 1 | 不计费 |
| AI Tools — standard（每 10 次响应，等价 1.5 Credits / 1K tokens） | 15 | 不计费 |
| AI Tools — premium（每 10 次响应，等价 10 Credits / 1K tokens） | 100 | 不计费 |
| Content processing（每页） | 8 | 不计费 |

:::callout { title: "关键洞察 || Key Insight" }
「不计费」的前提是员工面向（B2E）场景：用户持有 Microsoft Copilot 许可，且 Agent 以该用户的已认证身份运行，并受公平使用限制约束。Microsoft 未公开公平使用限制的具体数值，并保留随产品演进调整的权利，因此这一项不能作为容量规划的确定输入。
:::

:::accordion
::panel { open: true }
### 5.1 语音 Agent 按分钟计费
语音 Agent 按通话总时长计费，精确到秒，费率由所配置的语音编排层级决定。核心 Agent 活动（classic answer、generative answer、agent action）已含在语音费率内，不再单独叠加。

| 语音层级 | Credits / 分钟 | 核心 Agent 活动 |
| --- | --- | --- |
| Classic Voice（classic orchestration） | 10 | 已包含 |
| GenAI Voice | 35 | 已包含 |
| Premium GenAI Voice | 75 | 已包含 |

> 按 pay-as-you-go 单价折算，一通 5 分钟的 GenAI Voice 通话约 175 Credits，即 $1.75；同样时长的 Premium GenAI Voice 约 375 Credits，即 $3.75。语音场景的成本模型由通话时长主导，与文本 Agent 的按事件计费口径不同。

::panel
### 5.2 推理模型触发双计量表
当 Agent 使用推理模型时，总成本由功能费率与 premium Token 费率相加。单次用户消息可能触发规划、检索/工具调用和回答生成等多次模型调用，每次都计入。

- **功能费率** — 覆盖生成式回答、流程动作或 agent action 等 Agent 活动。
- **Premium Token 费率** — 按实际计费 Token 数收取 10 Credits / 1,000 tokens。
- **计费 Token** — 输入、输出（含 reasoning tokens）与写入 Prompt Cache 的输入均计费；从 Prompt Cache 命中读取的输入不计费。

$$
C_{total}=C_{feature}+\frac{T_{billed}}{1000}\times 10
$$

::panel
### 5.3 容量执行有两套独立机制
所有购买容量按月执行，未用完的 Credits 不滚存到下月。超额后的执行动作分成两套，触发条件和影响面不同。

- **自定义 Agent 限流（125%）** — 租户消耗达到预付容量的 125% 时触发，受影响环境中的 Agent 停止响应，*包括已经进行中的会话*，直到容量增加或月度重置。Pay-as-you-go 环境的超额部分继续后付计费。
- **Agent flow 限流（容量耗尽即触发）** — 预付容量用尽时新的 agent flow 运行被拒绝，已在运行的正常完成，Agent 的非流程交互不受影响，创作者在设计器中看到容量耗尽告警，每月随预付 Credits 续订重置。
- **环境分配优先于租户池** — 已分配专属容量的环境按自身额度执行。官方示例：租户共 25,000 Credits，环境 A 分配 10,000、环境 D 分配 500 并启用 pay-as-you-go，其余 14,500 由环境 B、C 共享；B 与 C 超出 14,500 的 125% 时触发限流，而环境 A 只要仍有自身额度就不受影响。
- **豁免项** — pay-as-you-go 环境不受限流约束，超额直接计入 Azure 账单；测试运行不消耗 agent flow 容量也不被拦截；Power Automate 云端流沿用 Power Automate 许可，不属于 Copilot Studio 执行范围。
- **事前护栏** — 在 Power Platform 管理中心 Licensing > Copilot Studio > Manage Agents 可为单个 Agent 设置月度消耗上限；但该上限不会停止它调用的 Agent Flows，后者按环境容量独立核算。
:::

## #scenarios 06 / Scenarios & Cost :: 用官方计费示例把 Credits 换算成月度账单

以下五个场景使用 Microsoft Learn 官方示例或官方 Computer Use 步数示例复算。美元金额按美国公开税前列表价 $0.01 / Credit 折算，不代表中国区人民币含税合同报价；月度金额按 30 天估算。

:::comparison
::versus Scenario 1
### 客户支持 Agent
- **场景** — 网站客服 Agent，以退货政策和产品手册为知识源回答问题。
- **交互模式** — 每次会话平均 4 次 classic answer + 2 次 generative answer，900 客户/天。
- **每日消耗** — $[(4\times1)+(2\times2)]\times900=7{,}200$ Credits/天。
- **月度折算** — 216,000 Credits/月。按 pay-as-you-go 约 $2,160；改用容量包需 9 包（225,000 Credits），约 $1,800。

::versus Scenario 2 { highlight: true }
### 销售绩效 Agent
- **场景** — Microsoft Copilot Chat 中的租户图谱接地 Agent，回答员工关于销售数据的问题。
- **交互模式** — 每次会话 4 次 generative answer + 4 次租户图谱接地；50 名持证用户 + 100 名无许可用户。
- **每日消耗** — $[(4\times2)+(4\times10)]\times100=4{,}800$ Credits/天，持证用户不计费。
- **月度折算** — 144,000 Credits/月。按 pay-as-you-go 约 $1,440；改用容量包需 6 包（150,000 Credits），约 $1,200。
:::

:::comparison
::versus Scenario 3
### 订单处理 Agent
- **场景** — 收到新订单时自主触发，检查库存、查看物流时效、审批订单、给客户发邮件。
- **交互模式** — 单一知识源取商品信息 + 4 次动作调用，在 generative orchestration 下均按 agent action 计费。
- **每次消耗** — $4\times5=20$ Credits/次，按 pay-as-you-go 约 $0.20/单。
- **规模说明** — 官方示例未给出日订单量，需按各自订单基数自行乘算，不宜直接套用日成本。

::versus Scenario 4 { highlight: true }
### 推理模型客服 Agent
- **持续会话** — 两次模型调用合计读取缓存 80,000 tokens（免计费），缓存写入 12,600 + 输出 1,500 = 14,100 计费 tokens。
- **Premium 算力费** — $14{,}100\times\frac{10}{1{,}000}=141$ Credits，另加该轮功能费率。
- **新会话** — 若仅命中 6,000 缓存，计费 tokens 为 36,600 + 9,500 = 46,100，算力费为 **461 Credits/条**。
- **结论** — 长上下文是否命中 Prompt Cache 会显著改变成本，不能只按“消息条数”预算。
:::

:::comparison
::versus Scenario 5
### Computer Use 工时表填报
- **场景** — Agent 用 Computer Use 完成 4 个桌面操作步骤。
- **标准模型** — $4\times5=20$ Credits/次，即 $0.20。
- **高级模型** — $4\times15=60$ Credits/次，即 $0.60。
- **限制** — Computer Use 功能已 GA，但只适用于启用 Generative orchestration 的 Standard harness Agent，且不享受 Microsoft Copilot USL 零费率权益；15 Credits/步的 premium 模型当前仍为 Experimental。

::versus Unit Economics { highlight: true }
### 两条路径的单价差
- **容量包单价** — $200 ÷ 25,000 Credits = **$0.008 / Credit**，比 pay-as-you-go 的 $0.01 低 20%。
- **代价** — 容量包按月执行、未用完不滚存，且超出后触发 125% 限流；pay-as-you-go 无上限风险但单价更高。
- **常见组合** — 用容量包覆盖基线负载，用 pay-as-you-go 承接峰值，避免业务中断。官方文档明确：容量包耗尽后才开始计入 pay-as-you-go 计量表。
- **证据缺口** — Microsoft Customer Stories 需登录访问，本文不引用未经核验的企业名称与 ROI 数字；量化预估请使用官方 [Agent Usage Estimator](https://microsoft.github.io/copilot-studio-estimator/)。
:::

## #pricing 07 / Purchasing Paths :: 四条购买路径，按承诺期限和折扣结构分野

Copilot Credits 可通过四条路径获得，全部在租户层级汇总。下表为《Microsoft Copilot Studio Licensing Guide》（November 2026）列出的美国市场美元税前公开标价；最终价格以地区、协议与经销商报价为准。四条路径的消耗口径一致，差别在承诺期限、折扣与超额行为。

| 路径 | 价格 | 承诺期限 | 关键约束 |
| --- | --- | --- | --- |
| Pay-as-you-go 计量表 | $0.01 / Credit | 无 | 月末后付，无预付承诺；抵扣 Azure 消费承诺（MACC），不适用 Azure 预付款；构建者需 Copilot Studio Author 角色（$0） |
| Copilot Studio 容量包（租户订阅） | $200 / 包 / 月，年付 | 年度 | 1 包 = 25,000 Credits / 月，未用完不滚存；每位构建者需 Copilot Studio User License（$0）；耗尽后才计入 pay-as-you-go |
| Copilot Credit Pre-Purchase Plan (P3) | 按额度阶梯折扣 5%–20% | 一年预付 | 九档，30 万至 3 亿 Credits；未用完到期作废；抵扣 MACC |
| Microsoft Agent Pre-Purchase Plan (P3) | 按额度阶梯折扣 5% / 10% / 15% | 一年预付 | 额度池跨 Copilot Studio 与 Microsoft Foundry；1 ACU = $1 = 100 Credits；未用完不跨年结转 |

:::accordion
::panel { open: true }
### 7.1 两个预付计划的折扣阶梯
Copilot Credit P3 只覆盖 Copilot Credits；Microsoft Agent P3 用 Agent Commit Units（ACU）同时覆盖 Copilot Studio 与 Microsoft Foundry 的合规用量，适合两个平台并行建设的组织。两者超出额度后可追加购买，或自动切换到 pay-as-you-go。

| Copilot Credit P3 档位 | Credits | 折扣 | Microsoft Agent P3 档位 |
| --- | --- | --- | --- |
| Tier 1 | 300,000 | 5% | 20,000 ACU — 5% |
| Tier 2 | 1,500,000 | 6% | 100,000 ACU — 10% |
| Tier 3 | 3,000,000 | 7% | 500,000 ACU — 15% |
| Tier 4 | 15,000,000 | 8% | — |
| Tier 5 | 30,000,000 | 10% | — |
| Tier 6 | 75,000,000 | 12% | — |
| Tier 7 | 150,000,000 | 14% | — |
| Tier 8 | 225,000,000 | 17% | — |
| Tier 9 | 300,000,000 | 20% | — |

> 折扣起点对应的规模可用前面的场景反推：一个日消耗 7,200 Credits 的客户支持 Agent，年消耗约 263 万 Credits，落在 Copilot Credit P3 的 Tier 2 与 Tier 3 之间。两个预付计划都抵扣 Azure 消费承诺，但都不适用 Azure 预付款。

::panel
### 7.2 许可自带的容量与服务
Credits 之外，Copilot Studio 许可还附带数据层容量和治理能力，这部分容量与 Power Platform 共享，容易在预算中被漏算。

- **Dataverse 默认容量** — 每租户 Database 15 GB、File 20 GB、Log 2 GB。由租户的第一个 Copilot Studio、Power Apps、Power Automate、Power Pages 或部分 Dynamics 365 订阅一次性提供，追加订阅不叠加。Database 默认容量已于 2025 年 12 月从 5 GB 提高到 15 GB。
- **Dataverse 订阅加购（年付）** — Database $40 / GB / 月；Database Tier 2 $30 / GB / 月（起订 1,000 GB）；File $2 / GB / 月；Log $10 / GB / 月。
- **Dataverse 按量计量表** — 在启用 pay-as-you-go 的环境中按超出部分计费（每环境含 1 GB Database 与 1 GB File，Log 不含）：Database $48 / GB / 月；File $2.40 / GB / 月；Log $12 / GB / 月。
- **连接器与数据传输** — Standard、Premium 与自定义 connectors，以及 Power Platform 连接器的本地与云服务数据传输，均含在许可内。
- **Managed Environments** — 含在 Copilot Studio 租户许可内，但仅对 Copilot Studio 相关功能生效。
- **支持** — Professional Direct Support for Dynamics 365 and Power Platform 为 $9 / 用户 / 月（年付）；需覆盖协议内每个 Power Platform 与 Dynamics 365 许可，上限 250 个。

::panel
### 7.3 试用、Teams 计划与其他订阅入口
除四条付费路径外，还有三个免费或捆绑入口，各自有明确的能力边界，不能替代正式订阅。

- **免费试用** — 30 天，可再延 30 天，需使用工作或学校账号。可创建并在测试面板中验证 Agent，但不能发布；试用到期后 Agent 仍可继续运行最多 90 天。
- **Teams 计划** — 含在部分 Microsoft 365 订阅中，只支持 classic orchestration 并只能发布到 Teams，环境类型限 Dataverse for Teams，不含 Premium connectors、generative orchestration、Bot Framework skills、转人工以及 Copilot 辅助创作；不适用于 GCC、GCC High、DoD、EDU A1 和 SUB SKU。
- **Dynamics 365** — Copilot Studio 权限含在 Dynamics 365 Customer Service 的 Digital Messaging 与 Chat 附加组件中。
- **Microsoft Copilot 许可** — 员工面向场景中的 Agent 运行用量含在用户订阅许可内，但受公平使用限制约束，且不覆盖计算机操作 Agent 与 Work IQ API 调用。
- **双估算器** — Standard/Dynamics 365 Agent 使用 [Copilot Studio Agent Usage Estimator](https://microsoft.github.io/copilot-studio-estimator/)；GitHub Copilot harness 与 Copilot Cowork 使用 [Copilot Credit Estimator](https://nptnlopppecostweb.azurewebsites.net/#/estimator)。两者只用于规划，不构成报价。
:::

## #security 08 / Security & Governance :: 治理控制既覆盖数据边界，也覆盖成本边界

Copilot Studio 遵循 Microsoft 安全开发生命周期（SDL），并按商业许可协议（Microsoft Product Terms 与数据保护附录）处理数据。治理面分成两类：一类限制数据流向和访问身份，另一类限制谁能发布、谁能共享、以及能花多少钱。

:::insight-grid { cols: 3 }
::card 01
### DLP 策略
在 Power Platform 管理中心配置数据策略，管控知识源、动作与连接器、Bot Framework skills、HTTP 请求、发布渠道、Application Insights 和触发器的可用性，限制连接器使用与数据流向。

::card 02
### 审计与合规
创作者审计日志接入 Microsoft Purview，Agent 活动可用 Microsoft Sentinel 监控告警，合规基线以 Microsoft Trust Center 为准。

::card 03
### 加密与数据驻留
支持客户自管加密密钥（CMK）与 Customer Lockbox；数据处理位置以地理数据驻留文档为准，可禁用跨地理区域移动。Lockbox 不覆盖经 Purview 管道处理的 Copilot Studio 安全审计日志，也不覆盖流经 Microsoft Agent 365 的治理与审计事件。

::card 04
### 身份与访问
自 2026 年 5 月起，新建 Agent 默认自动创建 Microsoft Entra Agent ID，且环境级不能再选择退出；连接器权限映射为该身份的 API permissions，可叠加 Conditional Access。手动认证仍可用于特定 Standard harness 场景。

::card 05
### 发布与共享控制
管理员可在 Power Platform 管理中心关闭整个租户发布生成式 AI Agent 的能力；共享范围通过 Editor / Viewer 权限与 Managed Environments 的共享限制配置。创作者在发布前会看到默认安全配置被改动的告警。

::card 06
### 成本护栏
Credits 在租户层级汇总，可分配到环境；管理员可在 Microsoft 365 管理中心与 Power Platform 管理中心协同查看消耗，并对单个 Agent 设置月度上限。注意该上限不停止其调用的 Agent Flows。
:::

## #quickstart 09 / Quick Start :: 先选 Harness，再用评测、身份与成本护栏推进生产

以下路径把官方 Standard harness 快速入门与生产治理要求合并。首页 New experience 开关是第一处分流：关闭进入 Standard harness 经典首页；开启进入 GitHub Copilot harness 与 App（Preview）体验。试用许可只能在测试聊天中验证，不能发布。

:::flow
1. **取得权限并选择 Harness** — 用工作或学校账号登录；Standard harness 快速入门需在首页关闭 New experience。若开启该开关进入 GitHub Copilot harness，应先确认 Credits 计量已启用，因为自然语言构建、预览和评测会立即产生消耗。
2. **定义目标与成功标准** — 描述 Agent 的业务目标、边界与预期输出；Standard harness 可生成 name、description、instructions 与建议的 triggers、knowledge 和 tools。先建立代表性测试集，不把演示效果直接当生产质量。
3. **接入知识源** — 添加 SharePoint 站点 URL、上传 PDF / DOCX / PPTX 文件，或连接 Dataverse 表。是否启用租户图谱接地会直接改变每次回答的 Credits 消耗。
4. **评测、计费与安全验证** — 用测试集验证任务完成率与内容安全，检查实际触发的模型、知识、工具、Computer Use 步数与 Agent Flows；同步配置 DLP、Entra Agent ID、环境容量和单 Agent 月度上限。
5. **灰度发布并持续监控** — 正式订阅和 Credits 路径到位后，先向受控渠道或小范围用户发布，再监控质量、失败路径、跨区域模型使用与 Credits 消耗。Public Preview 能力按预览条款评估，不应未经保护直接承载关键生产流程。
:::

## #references 10 / References :: 参考来源

- [1] Microsoft. — https://go.microsoft.com/fwlink/?linkid=2320995 | 三种主 Harness、Apps 付费公开预览、使用权矩阵、四条 Credits 购买路径、Dataverse 容量与美元标价。
- [2] Microsoft. — https://aka.ms/CopilotCredits/LicensingGuide | 跨产品 Credits 范围、GitHub Copilot 与 Customer Conversation harness 规划区间、Copilot Managed Runtime 与双估算器。
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management | Standard harness 费率、Prompt Cache Token 规则、四个官方计费示例、125% 与 Agent Flow 限流。
- [4] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview | 三 Harness 定义、适用场景与计费边界。
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview | GitHub Copilot harness 从构建阶段开始计费及其覆盖范围。
- [6] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio | 四类构建能力、Build with natural language 预览与 Harness 概览。
- [7] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use | Computer Use 适用条件、GA/Experimental 模型状态及 5/15 Credits 每步费率。
- [8] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance | DLP、Microsoft Agent 365、Customer Lockbox 排除范围与内容安全边界。
- [9] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-use-entra-agent-identities | 新建 Agent 默认身份、连接器权限映射及不可环境级退出。
- [10] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started | New experience 开关分流与试用许可不可发布。
- [11] Microsoft. — https://microsoft.github.io/copilot-studio-estimator/ | Standard/Dynamics 365 Agent 非约束性消耗估算。
- [12] Microsoft. — https://nptnlopppecostweb.azurewebsites.net/#/estimator | GitHub Copilot harness 与 Copilot Cowork 非约束性规划估算。

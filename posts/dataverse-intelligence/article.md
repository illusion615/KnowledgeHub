---
title: Dataverse Intelligence：组织业务上下文的复用层
eyebrow: Power Platform · Preview
brand: Dataverse Intelligence
date: 2026-05-20
strict_i18n: false
strict_density: true
lead: "Dataverse Intelligence 把 Work IQ 从\"理解文件、邮件、会议\"延展到\"理解 Dataverse 业务数据与流程\"。它的核心交付物是 Business Skills——一次定义、跨 agent 复用的自然语言流程指令，通过 Dataverse MCP Server（preview）暴露给 Microsoft 365 Copilot、Copilot Studio agent，以及 VS Code 等非微软 MCP 客户端。本文按 Microsoft Learn 官方 preview 文档（2026 年 3 月 31 日更新）整理。"
hero_actions:
  - "看清它在哪里 | #stack-position"
  - "选型对比 | #choose"
panel_label: 一句话概览
panel_title: Dataverse Intelligence 的四个事实
panel:
  - 定位：Work IQ 在 Dataverse 业务数据维度的延伸
  - 资产：可复用的自然语言 Business Skills（不是代码）
  - 通道：Dataverse MCP Server preview（标准 MCP 协议）
  - 状态：Preview，仅 Managed Environment 可用，禁止生产
metrics:
  - "特性状态 | Preview | 2026/03/31 文档；不进生产，API 可能变更"
  - "环境前置 | Managed Env | 必须开启 MCP Server preview"
  - "核心资产 | Business Skill | Solution-aware，跨环境迁移"
  - "调用接口 | MCP Endpoint | /api/mcp_preview"
style:
  accent: "#06b6d4"
---

## #overview 01 / What It Is :: Dataverse Intelligence 解决一个具体问题：agent 看不懂业务数据

本章先给出 Microsoft 的官方定义，并用一句话说明它要解决的具体痛点；后续章节再把它放回 Microsoft Copilot 生态里看坐标。

:::accordion
::panel { open: true }
### Microsoft 官方定义
引用 Microsoft Learn《What is Dataverse intelligence?》原文（2026/03/31）：

> Microsoft Dataverse intelligence extends Work IQ to bring business data understanding to AI agents and Microsoft Copilot. Work IQ helps agents understand work artifacts like files, meetings, and messages. Dataverse intelligence builds on this foundation by enabling agents to understand and act on your business data.

翻成大白话：

- **Work IQ** 让 Copilot 看懂 Microsoft 365 里的"工作产物"——邮件、文件、会议、Teams 消息。
- **Dataverse Intelligence** 在同一根管线上接出一根支线，让 Copilot 看懂 Dataverse 里的"业务对象"——客户、订单、工单、自定义表，以及处理它们的标准流程。

::panel
### 它要解决的痛点
在没有 Dataverse Intelligence 之前，一个连接到 Dataverse 的 agent 通常要靠下面三种方式获得"业务感"：

1. **System Prompt 里写规则**：把"客户分类怎么判定""退款流程几步走"塞进 agent 的 instructions。每个 agent 各写一份，散落、不一致。
2. **表名/字段名"自解释"**：靠 schema 命名让 LLM 猜。Status 字段值 1/2/3 是什么意思？只能写注释或喂示例。
3. **Plugin / Connector 封装动作**：在 Copilot Studio 里逐 agent 配置工具。流程更新时要同步改多个 agent。

Dataverse Intelligence 的解法是：

把"组织怎么解读和操作业务数据"这件事，从每个 agent 的 prompt 中抽出来，作为

一类一等公民资产

存在 Dataverse 里（Business Skills），让所有 agent 通过 Dataverse MCP Server 按需检索使用。一次写，到处用。
:::

## #stack-position 02 / Where It Sits :: 从 Work IQ 到 Agent：Dataverse Intelligence 在中间一层

上一章定义了"是什么"。本章把它放回 Microsoft 智能体堆栈里，画出从底层智能到 agent 调用的链路；下一章再深入这条链路中"Business Skills"这一节。

1. 智能基座

Work IQ：Microsoft Copilot 的工作上下文层，理解文件、会议、邮件、Teams 消息和人际关系。

→

2. 业务延展

Dataverse Intelligence：把 Work IQ 的理解能力延展到 Dataverse 业务记录与流程上。

→

3. 可复用资产

Business Skills：自然语言编写的"流程剧本"，明确规定 agent 应按哪些步骤处理业务任务。

→

4. 协议通道

Dataverse MCP Server（preview）：通过标准 MCP 协议，把 Skills 与 Dataverse 工具暴露给客户端。

→

5. 消费方

Microsoft 365 Copilot、Copilot Studio agent、VS Code、Claude、GitHub 等支持 MCP 的客户端。

:::accordion
::panel
### 和 Work IQ 的关系：同源、分工不同
Work IQ 是 Microsoft 在 Ignite 2025 后正式命名的"Copilot 智能层"，覆盖 Microsoft 365 里所有非结构化工作产物。Dataverse Intelligence 没有自建一套智能基座，它使用同一套 Microsoft 365 Copilot 设置入口（M365 admin center → Copilot → Settings → Dataverse data available in Microsoft 365 Copilot），把"理解能力"扩展到 Dataverse 这块结构化数据。

实践含义：

- 租户没启用 Microsoft 365 Copilot 的话，Dataverse 数据无法被 Copilot 主体使用（但 agent 通过 MCP 仍可访问业务上下文）。
- 两者权限模型不同：Work IQ 走 Microsoft Graph + Entra 权限；Dataverse Intelligence 仍走 Dataverse 自身的安全角色与行/列级权限。详见站内的 [Dataverse Security Role 完全指南](../dataverse-security-roles/index.html)。

::panel
### 和 MCP / Copilot Studio 的关系：复用同一个 MCP 通道
Dataverse 现已内置生产级 MCP Server（GA 版本，涵盖基础 CRUD 与查询工具）。而 Dataverse Intelligence 新增的 Business Skills 目前**仅在 Preview 版本**的 Dataverse MCP Server 中开放：

- Copilot Studio：添加连接器时选 *Microsoft Dataverse MCP Server (Preview)*，注意与默认连接器同名但带 "(Preview)" 后缀。
- 非微软 MCP 客户端：使用 endpoint `https://<orgUrl>/api/mcp_preview`。

这意味着：要让 agent 用上 Business Skills，必须用 Preview 版本的 MCP Server。Preview 不在 Microsoft 支持协议范围内，API 可能不通知变更。
:::

## #business-skills 03 / Business Skills :: Business Skills：组织流程的"可复用脚本"

在整体四层链路中，Business Skills 处于第 3 层"可复用资产"。这里先拆解它的内部结构、能力边界与运行约束，随后再与其它"教 agent 做事"的机制做横向选型对比。

官方定义（《Business skills overview》，2026/03/10）：Business Skills 是**用自然语言编写的业务指令**，规定组织处理某项具体工作的标准步骤、输入参数与业务规则。它并非可执行代码，本质上是一份面向 agent 编写的标准化作业指导书（SOP）。

Metadata

### Name + Description

agent 用它做"技能检索"——根据用户意图先匹配出相关的 Skills，再去拉详细指令。

Instructions

### Markdown 步骤

完整的流程定义，写在 Markdown 编辑器里，agent 命中后才完整读取。

Resources

### 附件文件（≤20MB）

SOP、政策、计算模板、表单——agent 在执行时可引用作为参考材料。

Lifecycle

### Active / Inactive

未定稿时可 Deactivate 阻止 agent 发现；定稿后激活并通过 Share 控制可见范围。

:::accordion
::panel { open: true }
### Business Skill 的四个关键性质
1. **Reusability（可复用）**：定义一次，多个 agent、多个表面（M365 Copilot、Copilot Studio、外部 MCP 客户端）共用。
2. **Consistency（一致性）**：所有 agent 按同一份指令执行，跨 agent 行为差异降到最小。
3. **Maintainability（可维护）**：流程改了，只改一处；所有引用该 Skill 的 agent 自动跟上。
4. **Solution-aware（解决方案对象）**：可放进 Dataverse Solution，跟随 ALM 流程在 Dev → Test → Prod 之间迁移。

::panel
### 分层检索机制：先 Metadata 后 Instructions
企业环境中的 Skills 数量往往较多。Microsoft 官方文档明确说明，agent 并不会把所有 Skills 全量塞进长上下文，而是分两步按需加载：

1. agent 通过 MCP Server 查询所有 Skills 的 **metadata（name + description）**，做意图匹配。
2. 命中后再拉完整 **instructions**。

这也直接决定了 Skill description 的写法：描述中必须写明"何时触发我"的信号词（例：*"Use when user asks about order status or mentions shipment tracking"*），否则路由命中率会明显跌落。这是编写 Skill 的首要质量准则。

::panel
### 权限模型：复用 Dataverse 的 RBAC，不另起炉灶
Skills 沿用 Dataverse 安全角色，每个 Skill 都有 owner，通过 Share 机制控制访问。文档列出三档典型权限：

| 角色 | 可以做什么 |
| --- | --- |
| Basic User | 创建自己拥有的 Skill；使用别人分享给自己的 Skill；**不能**在环境范围内发布。 |
| Environment Maker | 创建并分享自己拥有的 Skill；管理 Solution 部署。 |
| System Administrator / Customizer | 创建、分享所有 Skill；管理 Solution 部署。 |

Skill 的可见性还可以单独切到 Organization 级（环境内所有具备 Basic User 权限的人都能看见），或者保持默认的 Individual（仅 owner + 被分享者）。
:::

## #choose 04 / Choose the Right Tool :: 选型对比：Skill / Agent Instructions / Plugin / Connector

Business Skills 不是要取代 Copilot Studio 已有的所有扩展机制。本章用一张表对四种常见"教 agent 做事"的手段做正面对比，给出"什么时候选 Skill"的判断依据。

:::comparison
::versus Business Skill
### 跨 agent 复用的流程剧本
适合：组织有标准化业务流程、希望多个 agent 行为一致、希望流程跟着业务方而不是技术方走的场景。

::versus Agent Instructions
### 单个 agent 的角色设定
适合：agent 本身的语气、身份、范围设定；与组织无关的角色性指令；不需要被其它 agent 复用的部分。

::versus Plugin / Action
### 调用具体 API 执行动作
适合：调用外部系统、执行 Power Automate flow、读写非 Dataverse 数据；Skill 中可"调用"它们，二者互补。

::versus Knowledge / Connector
### 外挂文档与系统数据
适合：把 SharePoint、外部 SaaS、第三方数据库的内容作为知识喂给 agent；处理的是"读"，不是"按流程做"。
:::

:::accordion
::panel
### 判断树：到底要不要写成 Skill
1. 这件事是不是"我们组织怎么干"，而不是"某个 agent 怎么说话"？是 → 候选 Skill；否 → 留在 Agent Instructions。
2. 它会不会被 ≥2 个 agent 或 ≥2 个客户端表面使用？会 → 强烈推荐 Skill；只有一个 → 留在 agent 内部更轻量。
3. 它的更新频率是不是由业务方决定？是 → Skill 更合适（业务方可直接在 Business skills 页编辑）；否 → 用 plugin/工具更稳。
4. 它的核心是"流程编排 + 决策"还是"调用 API 取数"？前者 → Skill；后者 → Plugin 或 MCP Tool。
5. 结论：Skill ≠ 取代 plugin/connector。Skill 是"剧本"，plugin/connector 是"道具"。一个完整任务往往是 **一个 Skill 编排若干个 Tool/Plugin**。

::panel
### 对比表：四种机制并排看
| 维度 | Business Skill | Agent Instructions | Plugin / Action | Knowledge / Connector |
| --- | --- | --- | --- | --- |
| 表达形式 | Markdown 自然语言 | 自然语言 | API/Flow 定义 | 数据源连接 |
| 复用范围 | 所有连 MCP Server 的客户端 | 仅当前 agent | 当前 agent 配置 | 当前 agent 配置 |
| 主要消费方 | LLM 推理 + 流程编排 | LLM 推理 | LLM 选择并调用 | LLM 检索引用 |
| 所有权 | 业务方可直接维护 | agent 作者 | 开发者/IT | IT/数据负责人 |
| ALM | Solution-aware，可迁移 | 跟随 agent solution | solution + 凭据 | 需重新配置连接 |
| 当前状态 | Preview | GA | GA | GA |
:::

## #enablement 05 / Enable & Configure :: 启用流程：四步串联 M365 → PPAC → MCP Preview

本章给出"从零到 agent 能调用 Skills"的启用清单。所有步骤来自《What is Dataverse intelligence?》和《Use preview tools and upcoming features in Dataverse MCP server》两篇官方文档。

:::flow
1. **① 角色与许可前置** — 需要 Microsoft 365 AI Administrator 或 Global Administrator 角色访问 M365 admin center Copilot 设置；需要 Power Platform Administrator 角色配置环境层 Dataverse Intelligence。目标环境必须是 **Managed Environment**，具体许可要求见同节许可矩阵。
2. **② M365 admin center：开放 Dataverse 数据给 Copilot** — Microsoft 365 admin center → Copilot → Settings → 找到 *Dataverse data available in Microsoft 365 Copilot*，选择 All users 或 Specific groups（指定 Entra 安全组），保存。
3. **③ Power Platform 管理中心：环境级开启** — PPAC → Manage → Environments → 选定环境 → Settings → Product → Features → 滚动到 Dataverse intelligence 区段，打开 *Allow data availability in M365 copilot* 和（或）*Enable Dataverse intelligence (Work IQ) for agents and AI experiences*。同一区段确认 *Allow MCP clients to interact with Dataverse MCP server (Preview version)* 已打开。保存后生效需要几分钟。
4. **④ 连接到 Preview 版本 MCP Server** — Copilot Studio：添加连接器时选 *Microsoft Dataverse MCP Server (Preview)*（与 GA 同名 + "(Preview)" 后缀，不要选错）。VS Code / Claude / GitHub 等非微软 MCP 客户端：使用 endpoint `https://<orgUrl>/api/mcp_preview`（例如 `https://contoso.crm.dynamics.com/api/mcp_preview`）。
:::

没有"Dataverse Intelligence"专属 SKU。计费分三层：环境层（Managed Environment）、调用层（Copilot Studio messages / M365 Copilot / D365）、用户层（Dataverse 访问 license + 安全角色）。下方矩阵把三层拆开列。其他治理话题（DLP、capacity、ALM）见站内

Power Platform 治理速览

。

:::accordion
::panel { open: true }
### 环境与租户层：tenant 必须先付的三件事
| 层级 | 要求 | 谁付费 / 形态 |
| --- | --- | --- |
| 环境 | **Managed Environment** 开启 + Dataverse Intelligence 开关 + MCP preview 开关 | Managed Environment 本身不收费，但要求该环境内每位活跃用户都持有 premium license（Power Apps Premium / Power Automate Premium / Copilot Studio / Dynamics 365 等任一），否则触发 license enforcement。 |
| 数据 | **Dataverse 数据库**容量足以存放 Skill 定义和业务表 | Power Apps / D365 / Power Platform plan 自带初始容量；不足部分按 Dataverse capacity add-on 计费。Developer Plan 可用于 PoC，不可生产。 |
| 调用 | **Copilot Studio messages** 池（每次 agent 执行 Skill / 调用 MCP 工具计 1+ message） | 两种付费方式：PAYG（按 message 后付费，挂 Azure 订阅）或 Copilot Studio 预付费 messages pack。M365 Copilot 持证者在 M365 Copilot 渠道内调用时由其 license 覆盖。Preview 期间 MCP server 本身不另收费，GA 定价未公布。 |

::panel
### 终端用户层：调用 agent 的人需要什么 license
核心结论：**没有"Dataverse Intelligence"用户 SKU**。终端用户只要满足"有 Dataverse 访问权 + 落到一个能扣 messages 的渠道"即可。

| 用户已有许可 | 能否调用 Business Skills | messages 由谁出 |
| --- | --- | --- |
| Dynamics 365 app 许可（Sales / Customer Service / Field Service / Finance 等） | 可以。D365 许可天然带 Dataverse 访问。 | 在 D365 Copilot / agent 渠道内调用，messages 计入 D365 配额；跳出 D365 走自建渠道则由 tenant PAYG 覆盖。 |
| Power Apps Premium（$20/user/月） | 可以。可访问 Dataverse 表，作为 Maker 或 agent 调用者均可。 | tenant PAYG 或预付费 messages 池。 |
| Microsoft 365 Copilot（$30/user/月） | 可以，但需要 admin 在 Dataverse 里给该用户配安全角色。 | M365 Copilot 渠道内调用由 M365 Copilot license 覆盖；走 Copilot Studio 自建 agent 仍走 tenant messages。 |
| 仅 M365 E3 / E5，无 Copilot、无 Power 系列 | 需要补 license 或改身份模式。 | 方案 A：加 Power Apps Premium；方案 B：agent 改用 service principal 连接 Dataverse，messages 由 tenant PAYG 出。 |
| 外部 / 匿名 web 渠道用户 | 可以，但必须用 service principal 连接。 | tenant PAYG 全包；失去行级安全隔离，需要在 Skill 内做显式 scope 限制。 |

**两个常被踩的坑：**

- **License 给的是"能用"，不是"能看所有数据"。**Business Skill 调用 Dataverse 时按调用者身份做 RBAC 检查；用户即使有 D365，也只看得到安全角色授权的行。详见站内 [Dataverse Security Roles](../dataverse-security-roles/index.html)。
- **身份模式决定计费主体。**Delegated（agent 借用户身份）→ 用户必须有 Dataverse license；Service principal（agent 用自己身份）→ 用户不需要 Dataverse license，但 tenant 必须给 application user 配 admin 角色并承担 messages 费用。外部用户场景必须走 service principal。
:::

## #paths 06 / Two Paths :: 两条使用路径：Maker 创作 vs. Agent 开发者调用

功能启用后，组织内通常由两类角色协同使用 Dataverse Intelligence：业务人员与 Maker 负责将业务流程提炼为 Skill；agent 开发者负责在智能体中接入并调用这些 Skill。两条工作路径可对照展开。

路径 A · Maker / 业务方

### 把流程写成 Business Skill

1. 打开 [Power Apps](https://make.powerapps.com/) → 左侧 More → *Business skills (preview)*（建议固定到导航栏）。
2. New business skill：写 Name、Description（必含触发场景的信号词）、Instructions（Markdown 步骤，可在 Edit/Preview 间切换）。
3. 保存后在 Resources 区上传引用材料（≤20MB）：SOP、表单、计算模板。
4. Share 给具体用户/团队（Viewer / Co-owner），或切到 Organization 可见性。
5. 需要时 Deactivate 阻止 agent 发现；定稿后 Activate。
6. 需要跨环境流转：把 Skill 加进 Solution（Add existing → Business skill），走 Dev → Test → Prod ALM。

路径 B · Agent 开发者

### 让 agent 用上 Skills

1. 给 agent 添加 Dataverse MCP Server (Preview) 工具（Copilot Studio 选连接器；VS Code 等用 `/api/mcp_preview` endpoint）。
2. 先做发现性测试：向 agent 说 *"Show me all business skills in this environment."* 确认 MCP 拉到 Skill 列表。
3. 用真实场景测试：给 agent 一段与某 Skill 设计目的匹配的 prompt（例如调用日志记录 Skill 时附一段通话记录）。
4. 命中率低时，加前缀 *"Using business skills，..."* 强制让 agent 先检索 Skill。
5. 补齐配套：Skill 编排逻辑里需要的 connector / plugin / 其它 MCP server 也要挂在同一个 agent 上。
6. 迭代 Skill description 与步骤直到命中率与执行结果稳定。

:::accordion
::panel
### 另一种创作方式：用 MCP 让 agent 帮你写 Skill
Microsoft 在《Create and use business skills》明确支持第三种创作方式：通过任意连到 Dataverse MCP Server (Preview) 的 agent（Copilot Studio、VS Code、Claude 等）发起 "create a new skill" / "update an existing skill" 的请求，描述业务流程后由 agent 调用 MCP 工具写入 Dataverse。

实践意义：业务专家可以在自己熟悉的对话界面（甚至是编码 IDE）里口述 SOP，由 agent 翻译为 Skill 结构；省去切到 Power Apps UI 的成本。但 description 与触发词仍需人工把关，确保检索命中率。

::panel
### Skill 写作模板（官方建议结构）
官方在"Best practices for creating business skills"中给了"结构良好的 Skill"应包含的字段，按字段对应到 Skill 三段（Description / Instructions / Resources）大致是：

- **Description**：技能用途 + 何时使用 + 具体触发短语（trigger phrases），例如 *"Use when user asks about order status or mentions shipment tracking"*。
- **Instructions**：编号步骤、每步做什么、每步做完如何验证再进入下一步；典型场景的输入输出示例；常见错误与恢复步骤。
- **Input / Output 规范**：必填 vs. 可选参数及格式；输出字段；成功判定标准；执行该 Skill 必须挂哪些工具。

同时遵守："一个 Skill 一个流程"（不要堆叠流程到一个 Skill 里）、"清晰具体的指令"（含糊会导致 agent 行为漂移）、"用真实场景测试后再广泛分享"。

Microsoft 官方维护了开源样例仓库 [Business skills repo on GitHub](https://aka.ms/DVBusinessSkillRepo)，内含可直接导入的 Solution 模板，适合作为起步参考。
:::

## #boundaries 07 / Boundaries & Practice :: 现状边界、风险与最佳实践

Dataverse Intelligence 当前是 preview，存在硬约束与变更风险。本章把"用之前必须知道的事"集中列出，避免在选型评审或试点上线时被打脸。

:::accordion
::panel { open: true }
### 四条硬约束（不满足无法开通）
1. **Preview Only**：Business Skills 仅在 Dataverse MCP Server 的 Preview 版本里可用；preview API 可能在不通知的情况下变更。
2. **Managed Environment Only**：目标环境必须是受管环境，意味着对应许可成本。
3. **双向开关都要开**：环境层既要打开 Dataverse intelligence，也要打开 MCP Server preview；只开一个 agent 拿不到 Skills。
4. **非微软客户端走专用 endpoint**：必须用 `/api/mcp_preview`，不要用 GA 的 MCP endpoint。

::panel
### Preview 的支持承诺
来自《Use preview tools and upcoming features in Dataverse MCP server》官方表格：

| 项目 | 承诺 |
| --- | --- |
| Support | Preview tools 不在 Microsoft 支持协议范围内。 |
| Breaking changes | Preview API 可能在不通知的情况下变更。 |
| Performance | 可能达不到生产级可靠性。 |

含义：可以做受控试点、内部 POC、对外演示，但不要把它放进 SLA 承诺的对外业务链路。

::panel
### Skill 写作四条质量准则
- **Description 必含触发信号词**：metadata 决定命中率，含糊的描述会让 agent 永远找不到这个 Skill。
- **一个 Skill 一个流程**：跨流程拼凑会让 agent 在子步骤间漂移。订单状态查询、退款审批、客户分级各写一个。
- **每步给出验证条件**：让 agent 在进入下一步前自检"上一步是否成功"，比单纯写"做 A 然后做 B"更稳。
- **用真实场景而非合成 prompt 测**：跑 3–5 个真实业务输入，看输出是否符合预期，再分享给更多人。

::panel
### 治理与 ALM 建议
- **Solution 化所有共享 Skill**：单 owner 拥有的 Skill 个人化太强，跨环境流转和审计困难；用 Solution 装起来走 ALM。
- **命名与描述规范化**：建议在描述里固定写明"业务领域 + 触发场景 + 涉及的表"，方便后期检索与审计。
- **分享时优先用 Team 而非个人**：人员变动时不需要逐 Skill 改授权。
- **定期审视 Inactive Skills**：preview 阶段试错多，及时清理或归档失效 Skill，避免 metadata 污染检索命中率。
- **权限走 Dataverse 体系**：Skill 不是绕过 Dataverse 安全角色的捷径——agent 执行 Skill 时仍受调用者的 Dataverse 安全角色与行/列级权限约束。详见 [Dataverse Security Role 完全指南](../dataverse-security-roles/index.html)。
:::

## #faq 08 / FAQ :: 常见问题（来自 GitHub microsoft/Dataverse-skills 官方仓库）

下列问题整理自官方仓库 [microsoft/Dataverse-skills](https://github.com/microsoft/Dataverse-skills) 的 README、Issues 与 SUPPORT 文档。该仓库是 Microsoft 发布的"AI coding agent ↔ Dataverse MCP"插件，把 GA 版 Dataverse MCP Server / CLI / Python SDK / PAC CLI 封装成 dv-connect、dv-query、dv-data、dv-metadata、dv-solution、dv-admin、dv-security 八个 skill；与本文上半部分讲的"Business Skills"（server-side preview）不是同一层东西，配套使用。

:::accordion
::panel { open: true }
### Q1：GitHub 上的 Dataverse-skills 插件和本文讲的 Business Skills 是同一个东西吗？
不是。两者层级不同，配合使用：

- **Dataverse-skills（GitHub 开源 MIT 插件，GA）**：跑在 AI coding agent 一侧（GitHub Copilot、Claude Code），把 Dataverse MCP server / CLI / Python SDK / PAC CLI 封装成 8 个开发者 skill（dv-connect、dv-query、dv-data、dv-metadata、dv-solution、dv-admin、dv-security、dv-overview）。面向开发者建模、查询、部署 Dataverse。
- **Business Skills（Dataverse 平台内 preview）**：运行在 Dataverse 服务端，以表记录形式存储业务流程指令，经由 Dataverse MCP server preview 暴露给任意 MCP 客户端发现并调用，方便 Maker 积累并复用组织业务规则。

典型组合：开发者用 Dataverse-skills 插件设计表与解决方案，业务方用 Business Skills 把流程写成可被 agent 调用的指令。两者都依赖 Dataverse MCP server。

::panel
### Q2：使用 Dataverse-skills 插件的最低环境前提是什么？
官方 README "Prerequisites" 段落只列一条：**一个 Microsoft Dataverse 环境**。可通过 Power Apps / Dynamics 365 / Power Platform plan 获得，或免费的 [Power Apps Developer Plan](https://learn.microsoft.com/en-us/power-platform/developer/plan)（个人开发者免费，仅可用于开发测试）。

注意：这是*插件本身*的最低准入门槛。若要进一步启用 Business Skills（preview），仍需满足 05 启用清单中的 Managed Environment 与 premium license 两项环境前置条件。

::panel
### Q3：怎么安装？怎么验证装好了？
官方推荐 plugin 安装命令（README "Install" 段）：

- **GitHub Copilot**：`/plugin install dataverse@awesome-copilot`
- **Claude Code**：`/plugin install dataverse@claude-plugins-official`

验证：装好后直接对 agent 说 *"Connect to Dataverse"*，`dv-connect` skill 会自动跑工具检查、认证、注册 MCP server。成功后应该看到名为 `dataverse-<orgname>` 的 MCP server 出现在 agent 里，`pac auth list` 会列出当前激活的环境。

::panel
### Q4：插件能不能绕过我的安全角色，做我本来没权限的操作？
不能。README "Safety & Security" 段明确：插件按最小权限模型设计，**不能超出当前认证用户的权限**。三道闸：

- **MCP 授权**：要求开发者认证 + tenant admin consent + per-environment allowlist 才能用 MCP；其他工具（SDK、PAC CLI）走直接认证。
- **Security role enforcement**：每次 API 调用都由 Dataverse 服务端做授权检查，插件无法绕过或提权。
- **Token 安全**：凭据存在 OS 原生 credential store 或仅内存中，从不外传给第三方服务。

::panel
### Q5：我的 prompt 和数据会被回传给 Microsoft 吗？
README 给出的结论：**不会回传 prompt、工具参数或记录数据**。只有应用层 telemetry——出站到 Dataverse 的请求会带上插件名 / 版本 / skill / agent 这类元数据标签，以便服务端 dashboard 做流量归因。完整的 safety 模型见仓库 [docs/safety-and-guardrails.md](https://github.com/microsoft/Dataverse-skills/blob/main/docs/safety-and-guardrails.md)。

::panel
### Q6：在 GitHub Copilot CLI 里 project scope 注册 MCP 不生效（曾经报告的 Bug #49）
历史问题：早期 `dv-connect` 在 project scope 下把 MCP 配置写到了 `.mcp/copilot/mcp.json`，但 Copilot CLI 实际只读项目根的 `.mcp.json`，导致 `/mcp show` 看不到 Dataverse MCP。

修复：PR #50（dmitmikh，3 周前）已合并，新版会把配置写到 `.mcp.json` 根路径。如果还在用旧版本，手动把文件从 `.mcp/copilot/mcp.json` 移到项目根 `.mcp.json`，重启 Copilot CLI 即可。

::panel
### Q7：enable-mcp-client.py 报 503 SystemLabelDictionaryCache 锁错误（Bug #26）
症状：脚本能 GET 到 `allowedmcpclient` 记录，但 PATCH `isenabled=True` 持续返回 503，错误码 `0x80048d3d`，提示 "Could not acquire Write lock in time 30000 milliseconds. Lock name: SystemLabelDictionaryCache"。重试 10 分钟无果。

官方 workaround：跳过脚本，直接在 **PPAC UI** 手动开启：Environments → 选环境 → Settings → Product → Features → 把 *MCP Server* 开关打开 → 添加 client ID `aebc6443-996d-45c2-90f0-388ff96faa56`。该错误属于环境级偶发锁竞争，UI 路径不会触发。

::panel
### Q8：一句 prompt 让 agent 建表后，display name 带了 publisher 前缀（Bug #34）
症状：用 dv-metadata / dv-solution 一气呵成 "create a solution and tables"，结果生成的表的 **display name 直接复用了带 publisher prefix 的 schema name**（例如表显示成 `new_contact` 而不是 `Contact`）。

修复：PR #51 已合并。如果建表后看到这个现象：①检查 dv-connect 是否复用了既有 publisher 而不是默认 publisher；②手动改 display name 和 plural display name；③下次提示词里显式指定 "use display name X, schema name Y"。

::panel
### Q9：插件能做哪些事？有哪些 skill？
仓库 README 列出 8 个 skill，`dv-overview` 负责路由分发：

| Skill | 负责什么 |
| --- | --- |
| dv-connect | 一次性 setup：装 CLI / Python SDK / PAC CLI，认证，注册 MCP server。 |
| dv-query | 读、过滤、分页、聚合记录；支持自然语言问句、多页结果、pandas DataFrame 加载。 |
| dv-data | 单条 CRUD + 批量导入：CSV、多表带外键、按 alternate key upsert、AI 生成测试数据。 |
| dv-metadata | 建模：表、列、关系、表单、视图。 |
| dv-solution | Solution 生命周期：建、导出、导入、跨环境推进、部署验证。 |
| dv-admin | 环境管理：批量删除、保留 / 归档、组织设置、OrgDB 设置、回收站、审计、PPAC 白名单开关。 |
| dv-security | 分配安全角色、加 application user、配置 business unit、admin 自提升。 |
| dv-overview | 跨 skill 的路由与规则，先于其他 skill 加载。 |

::panel
### Q10：插件可以用在生产环境吗？许可证是什么？
仓库 LICENSE 标注 **MIT License**，可商用、可修改、可二次分发，保留版权声明即可。Microsoft 自己把它定位为"Microsoft 官方维护的开发者插件"（README "About"）。是否在生产环境用，建议同时评估两件事：①agent 端权限模型（你的开发者账号绑了什么 Dataverse 安全角色）；②运维流程（Solution 走 dv-solution 推到生产前，是否经过同样的 ALM 评审）。
:::

## #references 09 / References :: 参考资料

正文所有事实性论断来自下列 Microsoft Learn 官方 preview 文档与 GitHub microsoft/Dataverse-skills 仓库。非官方分析仅在背景描述处使用并显式标注。

- [1] Microsoft Learn — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intelligence | 官方定义、与 Work IQ 的关系、前置条件、M365 / PPAC 启用步骤（2026/03/31）。
- [2] Microsoft Learn — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-business-skill-overview | Business Skill 的概念、四性质（Reusability/Consistency/Maintainability/Solution-aware）、分层 metadata/instructions 结构、安全模型（2026/03/10）。
- [3] Microsoft Learn — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-business-skills | Maker 创作流程、上传/分享/可见性/激活、通过 MCP 让 agent 创建 Skill、加入 Solution、最佳实践与写作模板（2026/04/21）。
- [4] Microsoft Learn — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-mcp-preview-tools | Preview MCP Server 启用方式、Copilot Studio 连接器选择、非微软客户端 endpoint `/api/mcp_preview`、Preview 支持承诺（2026/01/09）。
- [5] Microsoft GitHub — https://aka.ms/DVBusinessSkillRepo | 官方开源样例 Skill 仓库，可安装成 Dataverse Solution 作为模板起步。
- [6] Microsoft Learn — https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/work-iq | Work IQ 作为 Microsoft Copilot 智能基座的定位；用于解释 Dataverse Intelligence 的"延伸"含义。
- [7] Microsoft GitHub — https://github.com/microsoft/Dataverse-skills | 官方 AI coding agent 插件（MIT 许可），封装 Dataverse MCP / CLI / Python SDK / PAC CLI；FAQ 章节的 README 引用、Issue #26 / #34 / #49 均来自此仓库。

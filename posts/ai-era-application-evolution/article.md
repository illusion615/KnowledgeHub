---
title: Application × AI × Agent：范式综述与前沿设计
eyebrow: "Survey & Design-Space Analysis"
brand: "智能体 || Agents"
date: 2026-05-21
strict_i18n: false
strict_density: true
lead: 五种融合范式（Copilot / Workflow / Embedded Agent / Agent-as-App / Multi-Agent Mesh）已构成行业公认的参照地图。但矩阵右上角——App 主导性高 × Agent 自主性高的区域——至今未收敛出成熟范式。该区域是当前 AI Application 设计最具探索价值的问题域。
hero_actions:
  - "看前沿主线 | #frontier"
  - "看未解之题 | #open-questions"
panel_label: Editorial Stance
panel_title: 五种融合范式构成共识地图；真正待攻克的焦点，是地图之外的前沿领域。
panel:
  - "前沿的核心矛盾不是自主性的强度，而是 Application 对**行为可预测**的硬性要求与 Agent 决策的**不确定性**之间的不可调和——任何回避这一矛盾的架构都将在生产环境失效。"
  - "生成式 UI 是应用行为的**扩展面**，不是替代面；不可观测、不可持久、不可撤销的生成结果，不具备进入主链路的资格。"
  - "Schema 是 Agent 与 Application 之间的**语义边界**，不是工程兼容层；未经 schema 约束的输出，不应触达业务状态。"
  - "主导权应由**运行时置信度**而非预设角色决定；这是 Horvitz (1999) Mixed-Initiative 原则在大模型时代的工程化要求。"
  - "用户在使用过程中重塑应用结构，应是 LLM 时代的**默认形态**，而非高级用法；将其降级为开发者专属能力的设计，会在下一代应用中被淘汰。"
metrics:
  - "三元角色 | 3 | Application / AI / Agent，分别对应承载 / 能力 / 自主"
  - "融合范式 | 5 | 从 AI-Inside 到 Multi-Agent Mesh 的成熟光谱"
  - "前沿主线 | 5 | 当前在攻 App-Centric × Agentic 角落的研究方向"
  - "未解之题 | 7 | Application 设计在 AI 时代尚未给出答案的核心问题"
style:
  accent: "#f97316"
---

## #verdict 01 / Verdict :: Application 死了吗？还是需要被重新定义？

"Application 将被 Agent 取代"是 2024-2026 年最具传播度的技术叙事之一。但既有证据表明：Application 不会消亡，但其形态正经历自 GUI 范式确立以来的一次结构性重构。

:::comparison
::versus 方案 1 || Option 1
### "应用已死"的论据
DEAD 论

- ChatGPT 6 周达到 1 亿 MAU，证明通用聊天界面可以替代垂直应用
- Agent 可以自主分解任务、调用工具、端到端解决问题，不再需要人逐步操作 GUI
- MCP 等协议让 Agent 直接操作数据源，绕过应用层
- 生成式 AI 的留存率仅 14% DAU/MAU（Sequoia 数据），说明独立 AI 应用尚未找到价值锚点

::versus 方案 2 || Option 2 { highlight: true }
### "应用不死"的反证
ALIVE 论

- GUI 仍是信息密度最高的交互方式——填一张银行表格，点选远比对话快
- 可视化反馈(visibility of system status)是可用性十大法则之首，纯对话式 Agent 难以做到
- GitHub Copilot 成功的核心教训："如果你必须改变编码方式才能使用它，那就是 bug"——AI 嵌入现有应用比取代更有效
- Compound AI System 数据：最优 AI 结果来自多组件系统，而非单一模型或单一 Agent
:::

:::callout { title: "核心判断：" }
**核心判断：**Application 不会被 Agent 消灭，但会被 Agent 重新定义。围绕"Application 是否会消亡"的讨论已经收敛，真正悬而未决的问题是**新形态的设计语言长什么样**。以 5 种融合范式作为参照系，核心探讨聚焦在矩阵右上角——App-Centric × Agentic 这一前沿设计空间，它是当前应用架构与交互研究中开放性最强的问题域。
:::

## #trinity-landscape 02 / Trinity & Landscape :: 三元辨析与五种融合范式

讨论 AI Application 的设计之前，需先界定三个常被混用的概念：Application、AI、Agent 各自指代何物。其后以一张二维矩阵梳理 5 种融合范式——这是参照地图，不是终点。

### 三元角色定义

Application 承载层

### 运行容器

由 UI、业务逻辑、数据 schema、权限模型与用户上下文构成的运行容器。AI 能力调用与 Agent 决策均在 Application 内被装载、约束与持久化。

理论锚点：Microsoft Copilot Stack（Kevin Scott, 2023）的 Frontend / Orchestration / Foundation 三层架构

AI 能力层

### 无状态能力调用

推理、生成、识别、检索等单次能力调用。无持续意图、无目标维护、无工具循环——一次 LLM 推理、一次 embedding 查询均属此层。

理论锚点：Russell & Norvig《AIMA》对 intelligence 作为 capability 的定义；Andrew Ng "Agentic Reasoning Patterns"（2024）

Agent 自主层

### 目标驱动的循环系统

由 AI 能力、规划、记忆与工具调用构成的循环系统。具备显式目标、可分解任务、并能在不确定输入下持续推进决策。

理论锚点：Anthropic《Building Effective Agents》(Dec 2024)；Lilian Weng《LLM Powered Autonomous Agents》(2023)

关键澄清：**AI 与 Agent 不可互换**。AI 是无状态能力调用，Agent 是带目标、带状态、带工具循环的系统；Application 则是二者运行的容器。后续所有矩阵与范式分析，均建立在此三元区分之上。

### 融合矩阵：两根轴 × 五个范式 + 一个前沿领域

自主性 Autonomy →

App 主导性 ↑

Static AI

Workflow

Agentic

Multi-Agent

高

中

低

P1

AI-Inside

P2

Copilot

P3

Embedded Agent

P4

Agent-as-App

P5

Multi-Agent Mesh

★ 前沿 / Frontier

App-Centric × Agentic

前沿领域

五个范式（P1-P5）已构成行业公认的参照地图；右上角虚线区是**尚未收敛出成熟范式**的前沿领域——§03 起的全部探讨围绕该区域展开。

### 五种范式一览

| 编号 | 范式名 | 三元定位 | 代表产品 | 理论锚点 |
| --- | --- | --- | --- | --- |
| P1 | AI-Inside Feature<br>AI 作为 App 内的功能 | App 主导 + 单次 AI 调用，无 Agent | Gmail Smart Compose、Notion 翻译、搜索语义化 | Anthropic "Augmented LLM" |
| P2 | Copilot-Augmented App<br>Copilot 增强型 App | App 主导 + Workflow（RAG / prompt chain） | GitHub Copilot 自动补全、Microsoft 365 Copilot 写作建议、Notion AI | Anthropic "Workflow"；Microsoft Copilot 产品定义 |
| P3 | Embedded Agent<br>App 内托管的 Agent | App 与 Agent 共治 + 真自主循环 | Cursor agent mode、M365 Copilot Pages、Replit Agent（早期） | Anthropic "Agent"；Russell & Norvig agency 定义 |
| P4 | Agent-as-Application<br>Agent 即应用 | Agent 主导 + App 退居为 MCP / 工具后端 | ChatGPT、Claude.ai、ChatGPT Operator、Manus | Anthropic MCP (2024)；OpenAI Operator (2025)；Lilian Weng autonomous agent |
| P5 | Multi-Agent Mesh<br>多 Agent 编排网 | Agent 主导 + 多 Agent 协作 + 跨 App | Microsoft Copilot Studio multi-agent、AutoGen、LangGraph 多代理工作流 | Andrew Ng "4 Agentic Patterns"；AutoGen 论文 |

### ★ 设计空间的空缺：App-Centric × Agentic

矩阵显示一处明确空缺：**App 主导性高 × Agent 自主性高**的区域至今未收敛出成熟范式。这源于**结构化交互的确定性**与 **Agent 决策的开放性**之间的结构性张力。这也构成了 AI Application 设计的核心命题：结构化 GUI 与非结构化的对话 / Agent 决策，如何在同一产品中并存而不相互坍缩？后续展开将直面这一问题。

## #frontier 03 / Frontier :: 结构化 × 自主性融合：五条仍在尝试中的研究主线

针对该结构性张力，学术与工业界目前形成 5 条平行的研究主线，从不同切面尝试调和 GUI 的确定性与 Agent 的自主性。每条主线均具备明确的理论根基、代表性产品、当前设计难点与尚未解决的核心问题。

### 先看清张力：四个根本冲突

:::comparison
::versus 方案 1 || Option 1
### 可预测性
- **App 期望：**同样输入两次，结果一致；可撤销、可审计
- **Agent 本质：**循环里包含 LLM 抽样，本就是非确定的探索过程

::versus 方案 2 || Option 2
### Affordance（可见性）
- **App 强项：**菜单 / 按钮 / 字段告诉用户"能做什么、不能做什么"
- **Agent 强项：**动态选工具、跨越约束——Action space 不可见

::versus 方案 3 || Option 3
### 意图表达
- **App 强项：**结构化输入（表单、点选、字段）准确高效
- **Agent 强项：**非结构化对话承载模糊与上下文

::versus 方案 4 || Option 4
### 状态管理
- **App 强项：**显式 schema、事务、版本
- **Agent 强项：**隐式 context window、记忆漂移
:::

### 五条研究主线

A

### Mixed-Initiative Interaction 混合主导交互

用户与 AI **交替发起动作**，系统依据运行时置信度判断介入或退让。该路径是该领域最早成型、引用最广泛的研究范式。

:::callout { title: "📊 内联数据可视化图表 || Inline SVG Visualization" }
Mixed-Initiative：
:::

### 理论根基

Eric Horvitz, *Principles of Mixed-Initiative User Interfaces* (CHI 1999, Microsoft Research)。论文给出了 12 条原则，核心是：在用户行为的不确定性下，AI 何时介入、何时旁观，应由**价值期望函数**决定。2024 年随着 Copilot 设计语言普及而被广泛重新引用。

### 关键产品 / 论文

- GitHub Copilot 的 "ghost text" 默认隐身、按需出现
- Cursor 的 agent / manual / ask 三档切换
- Linear AI 的 inline 建议浮层
- Microsoft Copilot Stack 的 "User-in-the-loop" 设计语言

### 设计难题

置信度如何估计是开放问题。过于主动的提示会打断用户心流（Office Clippy 的历史教训）；过于被动则错失辅助时机。现有产品多依赖启发式规则（光标静止 N 秒、错误检测、关键词触发），**尚未出现通用的置信度估计模型**。

### 仍未解决

用户对“被打扰阈值”的偏好高度异质，同一介入时机在不同用户群中体感迥异。是否需为每位用户维护个性化置信度参数？置信度模型应部署于端侧、服务端还是浏览器层？目前均无共识答案。

B

### Generative UI 生成式 UI

UI 不再由设计师预先固定，而是由 Agent 按需生成**结构化可交互组件**，替代纯文本输出。该范式并非只适用于图表展示，也已经进入传统 CRUD：Create 生成表单，Read 生成查询视图，Update 生成批量变更预览，Delete 生成归档/删除影响分析面板。

:::callout { title: "📊 内联数据可视化图表 || Inline SVG Visualization" }
Generative UI：
:::

:::comparison
::versus 方案 1 || Option 1
### Create：生成建模表单
用户输入业务意图后，Agent 生成字段分组、校验规则与默认值，直接形成可提交的录入界面。

- **代表产品：**Airtable Cobuilder、Coda AI、Retool AI

::versus 方案 2 || Option 2
### Read：生成查询与可视化视图
按自然语言生成筛选器、分组方式与图表组件，用户不必手工拼接查询条件。

- **代表产品：**Anthropic Artifacts、ChatGPT Canvas、Hex Magic

::versus 方案 3 || Option 3
### Update：生成批量修改工作台
把“批量修改”转为可确认的差异界面，先展示受影响记录与改前/改后，再执行写入。

- **可落地平台（需组合实现）：**Retool（AI + Workflows）、Airtable（AI + Automations）、OpenAI Apps SDK（App 内嵌操作面板）

::versus 方案 4 || Option 4
### Delete：生成删除影响分析面板
在执行删除前生成依赖影响、替代动作（归档）与回滚窗口，降低误删风险。

- **可落地平台（需组合实现）：**Retool Workflows、Airtable Automations、OpenAI Apps SDK（删除前影响分析面板）
:::

### 理论根基

没有单一论文奠基，由产品工程实践推动。Maggie Appleton 的 *Language Model Sketchbook*（2023）把 12 种"生成式+结构化"UI 草图视觉化，是设计圈最常被引用的研究草稿。

### 关键产品 / 论文

- **Anthropic Artifacts**（June 2024）：对话中动态生成可交互的代码 / 表格 / SVG
- **ChatGPT Canvas**（Oct 2024）：文档/代码可被用户和 Agent 同时编辑
- **Vercel AI SDK Generative UI**（2024）：Agent 返回 React 组件而非文本
- **OpenAI Apps SDK / Apps in ChatGPT**（2025）：第三方 App 把自己的 UI 嵌入对话
- **Vercel v0**：从自然语言生成可部署的 UI 组件
- **Airtable Cobuilder / Coda AI / Retool AI**：在 CRUD 流程中按意图生成表单、视图与操作面板

### 设计难题

生成的组件如何**可发现**（用户怎么知道它能交互）？如何**可缓存**（每次重生成代价高昂）？如何**可审计**（同一句提示生成的 UI 千变万化，怎么固化最佳版本）？

### 仍未解决

生成式 UI 是临时资产还是持久化实体？其 schema 的定义权归属如何划定？多用户协作下，不同用户是否应看到同一版本？目前所有产品仍在迭代探索，**尚未形成共识的最佳实践**。

C

### Schema-Bound Agency 结构契约下的 Agent

Application 以 **schema / tools / resources** 形式暴露语义边界，Agent 仅在边界内行使自主性：结构完整性由 Application 保证，行为灵活性由 Agent 承担。该路径工程化程度最高，但 schema 设计经验仍处于早期阶段。

:::callout { title: "📊 内联数据可视化图表 || Inline SVG Visualization" }
Schema-Bound Agency：
:::

### 理论根基

受程序合成（program synthesis）和 type-driven development 启发。直接源头是 OpenAI Function Calling（June 2023）和后续的 JSON Mode、Structured Outputs，以及 Anthropic 在 MCP 中把这套思路标准化。

### 关键产品 / 论文

- **OpenAI Structured Outputs**（Aug 2024）：保证 JSON 严格符合 schema
- **Anthropic Tool Use + MCP**（Nov 2024）：开源协议，让 App 把"工具/资源"暴露给任意 Agent
- **Outlines / Instructor / LMQL**：约束解码（constrained decoding）开源库
- **Linear AI、Notion AI Connections、Airtable Cobuilder**：把结构化数据 schema 当作 Agent 的契约

### 设计难题

Schema 的**定义权归属**尚无定论：完全由 App 设计师固定将限制 Agent 的推理空间；由 Agent 即时生成则难以保证业务一致性。Schema 演进同样是开放问题——字段变更后，依赖旧 schema 的历史 Agent 调用如何向前兼容，目前缺乏标准方案。

### 仍未解决

错误恢复机制：当 Agent 多次违反 schema，怎么自动修正而不只是重试？schema 的细粒度权限（同一字段不同 Agent 看到的结构不同）至今没有标准方案。

D

### Malleable Software 可塑软件 / 终端用户编程

用户以自然语言指令改造软件结构本身——Agent 协助用户在 Application 内生成新视图、新工作流、新字段。软件不再是开发者交付的固定产物，而是**持续被终端用户重构的可变结构**。

:::callout { title: "📊 内联数据可视化图表 || Inline SVG Visualization" }
Malleable Software：
:::

### 理论根基

Geoffrey Litt（Ink & Switch、MIT）系列论文与 essay；其 *Malleable software in the age of LLMs*（2023-2024）把这个方向命名并系统化。继承了 Bret Victor 的 Inventing on Principle 和 End-User Programming 学术传统。

### 关键产品 / 论文

- **Notion AI Connections**：用户用自然语言把外部数据接入 Notion
- **Coda AI、Airtable Cobuilder**：用对话生成新的数据库视图与公式
- **Replit Agent**：用户描述需求，Agent 生成可运行的小型应用
- **Ink & Switch Patchwork / Embark**（2024-2025 实验项目）

### 设计难题

用户可重构的**边界**难以划定：放宽边界将引入难以治理的结构污染；收紧边界则削弱 malleable 的实际收益。多用户共享工作空间下，用户自定义工作流的审计主体、跨用户累积变更的治理与回滚，至今未被系统性回答。

### 仍未解决

当应用结构由用户即时塑造，**“版本”概念本身需要重新定义**。用户 A 与用户 B 的工作空间能力可能完全不同，这对企业 IT 治理与合规审计构成严峻挑战。目前所有相关产品均处于小规模实验阶段，尚无大规模生产部署案例。

E

### Direct Manipulation + LLM Hybrid 直接操作 × LLM 双轨并存

不以对话取代 GUI，而是使二者**双轨并存**且相互驱动：GUI 承担高密度精确操作，LLM 承担复杂意图与不确定性，由用户在二者间自由切换。

:::callout { title: "📊 内联数据可视化图表 || Inline SVG Visualization" }
DM + LLM Hybrid：
:::

### 理论根基

Ben Shneiderman, *Human-Centered AI*（Oxford, 2022）。Shneiderman 半个世纪倡导 Direct Manipulation 范式（Shneiderman 1983），明确反对"用对话取代直接操作"，主张 "Twin Win"——两者各取所长。Don Norman 在 2024 年的评论中持同样立场。

### 关键产品 / 论文

- **Cursor**：编辑器内手动编辑 + Agent 模式可一键切换
- **Figma AI**：直接画图 + AI 重组对象（First Draft、Auto Layout）
- **Hex Magic、Equals AI、Rows AI**：电子表格作为结构化容器，AI 操作 cell
- **Tableau Pulse**：可视化分析 + agentic 探索 / 异常检测

### 设计难题

模式切换的**认知成本**：用户在"我应该点选还是描述"之间反复犹豫，反而比单一模式慢。如何让模式切换"无感"？两个模式产出的结果如何统一表达（一边是确定操作，一边是建议草稿）？

### 仍未解决

双轨之间的**状态同步**：用户用 GUI 改了一半，再切到对话让 Agent 接手，Agent 是否完整理解了 GUI 的隐式状态？反过来 Agent 改了一半，GUI 怎么显示"半成品"？

### 五条主线在三个轴上的对比

| 主线 | 提升的核心能力 | 对自主性的容忍 | 用户干预成本 | 当前成熟度 |
| --- | --- | --- | --- | --- |
| A | 混合主导 · 让 AI 介入有节制 | 中（取决于置信度） | 低（用户不必频繁切模式） | ★★★★ 已普遍应用 |
| B | 生成式 UI · 把 Agent 输出变成可操作组件 | 高 | 低（可点选确认） | ★★★ 大厂在跑，最佳实践未定 |
| C | 结构契约 · 用 schema 约束 Agent | 高（在契约内） | 低（结构错误自动校正） | ★★★ 工程化方案，schema 设计经验少 |
| D | 可塑软件 · 让用户改 App 本身 | 最高 | 高（要参与定义） | ★★ 实验阶段，治理未解 |
| E | 双轨并存 · GUI + 对话同 在 | 中（用户控权） | 中（要切换模式） | ★★★★ 多产品已落地 |

## #principles 04 / Design Principles :: 从五条主线提炼的五条 AI Application 设计原则

从 §03 五条主线中抽取共性，归纳为五条可操作的设计原则。每条原则均植根于至少一条主线的理论支撑，并配以反例划定其适用边界。

:::accordion
::panel
### 原则 1 · Schema 是契约，不是牢笼
结构化数据的边界由 Application 定义，schema 内部的灵活性交由 Agent 承担。该原则同时源自**主线 C**（schema 作为契约）与**主线 D**（用户亦可临时扩展契约）。

**正例**

- Linear 把 issue 字段定义为 schema，Agent 只能在 status / assignee / priority 等已知维度操作
- MCP server 暴露明确的 tool 列表，Agent 自主选择但参数受约束
- Notion AI Connections 让用户为 schema 加新字段，但仍走 schema 校验

**反例 / 边界**

- 将 schema 固化为硬编码常量 → Agent 无法应对未知请求，退化成 P2 Workflow
- 完全无 schema 的纯对话产物 → 数据无法回流到结构化业务系统
- Schema 版本变更没有兼容策略 → 历史 Agent 调用全部失效

::panel
### 原则 2 · 任何 Agent 行为必须有 Escape Hatch
用户随时能切回直接操作，并能 undo Agent 的行动。来自**主线 E**（双轨并存）和**主线 A**（用户应保留主导权）。

**正例**

- Cursor 的 agent 模式可以一键切回 manual edit，并保留 diff 让用户挑选
- Anthropic Artifacts 生成的代码可以直接被用户编辑覆盖
- Figma AI 的 Auto Layout 提供 undo 步进到原始排布

**反例 / 边界**

- Operator / 浏览器 Agent 直接执行不可逆操作（发邮件、转账）后才提示用户
- 对话式产品没有"重置上下文"按钮，错误的中间状态污染后续
- 多步 Agent 自动 commit 但没有跨步骤 rollback

::panel
### 原则 3 · 主导权由置信度决定，不由模式决定
不要把"AI 主动" / "AI 被动"做成全局开关，而是按每次决策的置信度动态调整。来自**主线 A**（混合主导）。

**正例**

- GitHub Copilot 在置信度高时显示 ghost text，低时只在 Cmd+I 主动召唤
- Linear AI 当 issue 描述模糊时不主动建议 assignee，只在标题清晰时给出
- Microsoft Editor 对拼写错误立即建议，对语义改写仅在用户暂停时温和提示

**反例 / 边界**

- Office Clippy：完全不基于置信度的主动提示，干扰心流
- 每次操作都强制要求确认 → 退化成 P1 静态提示，失去 Agent 价值
- 置信度模型从未校准 → 用户学到"AI 总是错"，逐渐忽略所有建议

::panel
### 原则 4 · 生成式 UI 必须可审计、可固化
动态生成的组件不能是一次性的，要能溯源、缓存、复用。来自**主线 B**（生成式 UI）。

**正例**

- Anthropic Artifacts 把生成内容存为可分享、可重新打开的对象
- v0 / Bolt 把生成的 UI 落到代码仓库，用户可以 fork / 持久化
- OpenAI Apps SDK 让第三方组件复用，不每次重新生成

**反例 / 边界**

- 对话中的 inline 表格仅文本输出，下次问同样问题样式不一致
- 生成的图表无法导出 / 复用 / 嵌入其他文档
- 同一意图重复触发但每次生成不同结构的 UI，用户无法形成肌肉记忆

::panel
### 原则 5 · 双轨并存优于单轨替代
不要消灭 GUI，让 chat 与直接操作共存且互相驱动。来自**主线 E**（DM + LLM）和 Shneiderman / Don Norman 的人因学共识。

**正例**

- Cursor：左侧文件树 + 右侧编辑器 + 顶端 Agent 对话，三种模态共存
- Hex Magic：SQL 编辑器 + 自然语言副驾，结果同步到 cell
- Microsoft 365 Copilot Pages：文档表格 + 对话 + 直接编辑混合

**反例 / 边界**

- 用纯 chat 替代复杂表单（"请用对话告诉我你银行卡的所有字段"）
- 把 GUI 全部隐藏到对话里，复杂操作变得繁琐
- 双轨同时存在但状态不同步——GUI 改一半，对话不知道
:::

## #open-questions 05 / Open Questions :: 留给 Application 设计师的七个未解之题

这七个问题目前均无统一答案，所有相关产品仍处于探索阶段，构成 AI Application 设计当前最具开放性的研究命题清单。

01

Schema Authorship

### 结构契约该由谁定义？

由 App 设计师在上线时固定，将限制 Agent 的灵活性；由 Agent 即时生成，业务一致性难以保障；引入用户参与的中间路线，又对权限治理构成挑战。

**当前最佳尝试：**MCP 让平台暴露 schema、用户在 prompt 里附加临时约束。但 schema 演进与版本兼容仍是未解课题。

02

Locus of Trust

### 当 UI 是 Agent 生成的，用户在信任什么？

用户面对一个动态生成的图表 / 表格 / 按钮，他信任的是组件外观？背后的数据？还是它暗示的"我点这个会发生什么"？

**当前最佳尝试：**Artifacts 显示 source；Linear AI 标注"由 AI 生成"。但**"看到不等于理解"**仍是开放问题。

03

Reversibility

### Agent 的行动如何 undo？

直接操作的撤销栈是简单的状态回放；Agent 多步行动横跨多个系统、调用多个外部副作用，"undo"语义本就不成立。

**当前最佳尝试：**事务化 Agent（每一步可补偿操作）、"沙箱预演"模式。但跨外部 API 的真撤销仍是工程难题。

04

Discoverability

### Action space 不可见时，怎么让用户发现能力？

传统菜单显式呈现可用动作；Agent 的能力由能力组合形成，理论上接近无界——用户如何形成对其能力边界的认知？

**当前最佳尝试：**提示词模板库、上下文相关 quick action。但**"我不知道我不知道"**问题仍在。

05

Determinism Contract

### 同样输入两次，要不要保证同样输出？

用户对 App 的隐含期待倾向于“是”，对 Agent 的实际表现则为“否”。二者融合后，确定性契约如何重新定义？

**当前最佳尝试：**低 temperature + caching；区分"事实检索"和"创意生成"两种模式。但用户认知预期尚未统一。

06

Collaboration

### 协作场景下生成式 UI 如何共享？

用户 A 通过对话生成了一份 dashboard，用户 B 打开链接看到的是什么？同样的对话？还是固化后的 UI？还是为 B 重生成？

**当前最佳尝试：**Artifacts / Canvas 的版本快照机制。但**"对话 + 协作"**的真协同模型尚未出现。

07

Source of Truth

### 结构化数据 vs Agent 记忆，谁是真相？

App 数据库说订单状态是 A，Agent 上次对话记得是 B，谁优先？同步语义如何定义？

**当前最佳尝试：**将 App 数据库作为唯一真相源，Agent 记忆每次重读。但用户期待的对话连续性与该原则之间存在张力。

:::callout { title: "立场陈述：" }
**立场陈述：**这七个问题均非技术能力不足所致，而是**设计哲学层面尚未形成行业共识**。任何严肃投入 AI Application 的团队，都需就此七题给出自身的明确回答，而非沿用某个尚未被证伪的“最佳实践”。
:::

## #decision 06 / Decision :: 当下投什么，未来观察什么

面向决策者的两份清单：当前需要补齐的成熟能力（缺失即落后），以及面向前沿的高方差投入方向（押对即领先）。

:::comparison
::versus 方案 1 || Option 1
### 今天必须做（稳定收益）
- **P1 / P2 必须覆盖：**核心场景至少嵌入一项 Copilot 能力——缺失将导致产品在用户认知中被判定为“无 AI 形态”
- **引入 schema 契约：**用 function calling / structured outputs 把 LLM 输出锚定到业务字段
- **建立 escape hatch：**所有 Agent 行为都可 undo / 可暂停
- **埋点采集：**建议接受率、Agent 成功率、用户切换 GUI ↔ 对话的频率

::versus 方案 2 || Option 2 { highlight: true }
### 明天要押注（前沿 / 高方差）
- **生成式 UI（主线 B）：**选 1-2 个高频场景试点 Artifacts / Canvas 式的动态组件
- **结构契约 + 自主循环（主线 C）：**研究 schema 演进、错误恢复、跨 Agent 兼容
- **双轨并存的状态同步（主线 E）：**团队内做一个原型，验证 GUI ↔ Agent 状态可以无损切换
- **用户对 7 个未解之题的实际期待：**用 user research 给出你产品的回答
:::

### 给所有 Application 团队的建议

关于“Application 是否会消亡”的讨论已经结束（结论：不会）。后续的投入重心应转移至**“自身产品的右上角应呈现何种形态”**这一问题。未来一年的产品差距，取决于哪个团队更早就 §05 七个未解之题给出系统化回答。

## #references 07 / References :: 参考来源

- [1] Jakob Nielsen. — https://www.nngroup.com/articles/ai-paradigm/ | 提出 AI 是计算历史上第三个 UI 范式——意图式结果描述(Intent-Based Outcome Specification)，与批处理和命令式交互并列。
- [2] Sonya Huang, Pat Grady, GPT-4. — https://sequoiacap.com/article/generative-ai-act-two/ | 生成式 AI 从技术展示(Act 1)进化到解决实际问题(Act 2)，提出 DAU/MAU 14% 中位数的留存困境和 Copilot → Agent 的产品形态演进路径。
- [3] Matei Zaharia, Omar Khattab, et al. — https://bair.berkeley.edu/blog/2024/02/18/compound-ai-systems/ | 论证最优 AI 结果来自多组件协作的复合系统而非单一模型，60% 企业 LLM 应用使用 RAG，AlphaCode 2 通过系统工程达到编程竞赛 85 百分位。
- [4] Karim R. Lakhani. — https://www.microsoft.com/en-us/worklab/redesigning-the-enterprise-for-an-era-of-agency | 2026 Work Trend Index 序言，论述工作组织方式从"人+流程+应用"向"人+Agent+系统"的转变，以及"执行力可规模化后，判断力成为溢价"的核心洞察。
- [5] Rina Diane Caballar. — https://spectrum.ieee.org/ai-agents | AI Agent 的定义、三步工作流(目标→分解→执行)及隐私/幻觉/准确性风险的系统性梳理。
- [6] Anthropic. — https://www.anthropic.com/news/model-context-protocol | MCP 作为 AI 连接数据源的开放协议标准，用统一协议替代碎片化集成的架构方向。
- [7] Shuyin Zhao. — https://github.blog/ai-and-ml/generative-ai/how-to-build-an-enterprise-llm-application-lessons-from-github-copilot/ | GitHub Copilot 的产品开发三阶段(Find it → Nail it → Scale it)、"不改变用户工作方式"的设计原则、ghost text 选择与接受率指标。
- [8] Lei Wang, Chen Ma, et al. — https://arxiv.org/abs/2308.11432 | LLM 自主代理的统一框架综述，覆盖构建、应用与评估策略。
- [9] Eric Horvitz. — https://erichorvitz.com/chi99horvitz.pdf | 12 条 Mixed-Initiative 设计原则；提出由 expected value 决定 AI 何时主动介入的判据。Copilot/Agent 时代被重新引用作为"主导权切换"的理论基石。
- [10] Ben Shneiderman. | 系统论证 Direct Manipulation 与 AI 自动化的 "Twin Win" 共存模型；反对用对话取代直接操作。继承自 Shneiderman 1983《Direct Manipulation: A Step Beyond Programming Languages》的可见对象+即时反馈范式。
- [11] Anthropic. — https://www.anthropic.com/research/building-effective-agents | 区分 Workflow（流程预定义+LLM 填空）与 Agent（LLM 决策路径）两条路径；给出 Augmented LLM、Prompt Chaining、Routing、Parallelization、Orchestrator-Workers、Evaluator-Optimizer 六种结构化模式。
- [12] Lilian Weng. — https://lilianweng.github.io/posts/2023-06-23-agent/ | Planning + Memory + Tool Use 的经典三组件 Agent 架构图，被后续工程实践广泛引用。
- [13] Andrew Ng. — https://www.deeplearning.ai/the-batch/issue-241/ | Reflection、Tool Use、Planning、Multi-Agent Collaboration 四种代理推理模式，是 Multi-Agent Mesh 范式最常被引用的理论锚点。
- [14] OpenAI. — https://openai.com/index/introducing-structured-outputs-in-the-api/ | 通过约束解码保证 100% schema 合规的结构化输出能力，把 Function Calling（June 2023）从概率服从升级为协议保证，是 Schema-Bound Agency 的工程基石。
- [15] Anthropic. — https://www.anthropic.com/news/artifacts | Claude 在对话旁动态生成可交互 Artifact（代码 / 文档 / SVG / React 组件），是 Generative UI 在主流 Chat 产品中的首个规模化落地。
- [16] OpenAI. — https://openai.com/index/introducing-canvas/ | ChatGPT 中独立的 Canvas 区域支持用户与 Agent 同时编辑文档/代码，把"对话生成 → 直接操作 → 再次对话"的循环工程化。
- [17] Vercel. — https://sdk.vercel.ai/docs/ai-sdk-rsc/generative-ui-state | Agent 直接返回 React Server Components 而非文本字符串的工程范式；同期 Vercel v0 把"自然语言 → 可部署 UI 组件"的链路产品化。
- [18] OpenAI. — https://developers.openai.com/apps-sdk/ | 第三方 App 把自身 UI 嵌入 ChatGPT 对话流的协议接口，代表"对话作为 OS、应用作为 UI 模块"的容器关系。
- [19] Geoffrey Litt. — https://www.geoffreylitt.com/2023/03/25/llm-end-user-programming.html | 提出"用户用自然语言修改正在使用的软件"的可塑软件愿景，源自 Ink & Switch / MIT 的 End-User Programming 学术线，是 Stream D 的命名者。
- [20] Maggie Appleton. — https://maggieappleton.com/lm-sketchbook | 12 种"生成式 + 结构化"UI 设计草图，是设计圈讨论 Generative UI 时最常被引用的视觉化研究草稿。

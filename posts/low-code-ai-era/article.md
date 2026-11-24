---
title: 低代码的 AI 时代生死局
eyebrow: Low-Code × AI Evolution
brand: Power Apps
date: 2026-04-11
strict_i18n: false
strict_density: true
lead: "\"Low Code is Dead\" 的论调在 AI 原生代码生成崛起后甚嚣尘上。本文从低代码的原始初衷出发，以 Microsoft Power Apps 为核心案例，追溯其四个时期的转型路径，提炼决定该品类存亡的六项关键属性，并分析 AI 时代下低代码平台面临的生态挑战与演进方向。"
hero_actions:
  - "查看核心争论 | #debate"
  - "查看关键属性 | #attributes"
panel_label: 核心论点
panel_title: 低代码不会死，但必须蜕变
panel_desc: "AI 并未终结低代码，反而迫使低代码从\"可视化编程工具\"蜕变为\"AI-治理-集成\"三位一体平台。无法走通这一蜕变的平台将被淘汰。"
panel:
  - 低代码原始初衷：让业务人员自主构建应用
  - AI 冲击：代码生成降低了编程门槛
  - Power Apps 从表单工具演进为 Agent 平台
  - 生存关键：治理、生态锁定、AI 融合深度
metrics:
  - "低代码市场规模 (2025) | $35B+ | Gartner 预测 2025 年全球低代码开发技术市场达 350 亿美元"
  - "Power Platform 月活用户 | 46M+ | 截至 2025 财年，Power Platform 月活跃用户超 4600 万"
  - "Power Apps 可用连接器 | 1,400+ | Power Platform 提供超过 1400 个开箱即用的数据连接器"
style:
  accent: "#a855f7"
---

## #origin 01 / The Original Promise :: 低代码的原始初衷

低代码运动的根基在于缓解全球企业数字化需求远超 IT 部门交付能力的供需失衡，而非单纯"少写代码"。Forrester 在 2014 年提出 "low-code" 概念时，核心命题是让"公民开发者"（citizen developer，即未受过专业编程训练的业务人员）能够自主构建满足部门级需求的应用。

:::insight-grid { cols: 2 }
::card 01
### 供需缺口
全球开发者数量约 2800 万，但企业每年需要的新增应用量级远超现有 IT 团队的产能。低代码的诞生正是为了弥合这一缺口——让非技术人员也能参与应用构建。

::card 02
### 可视化抽象
低代码的核心价值主张是用可视化拖拽替代手工编码，用预置组件替代从零构建，用声明式逻辑替代命令式编程。它把编程的门槛从"会写代码"降到"会用 Excel"。

::card 03
### 速度优先
传统开发一个部门级应用平均需要 4-6 个月，低代码将其压缩到 2-4 周。速度是低代码最直接的卖点——让业务需求不再排队等 IT 排期。

::card 04
### IT 治理需求
当业务人员开始自己做应用，IT 部门需要一套治理框架来管控数据安全、合规、生命周期。低代码平台因此天然承担了治理中枢的角色——这个角色在 AI 时代变得更加重要。
:::

:::comparison { title: "传统开发 vs 低代码" }
::versus Before Low-Code
### 传统开发模式
业务部门提交需求 → IT 排期（通常 3-6 个月）→ 专业开发者编码 → 测试 → 部署。期间业务需求可能已变，重新迭代又需数月。大量部门级需求被搁置或用 Excel/SharePoint 临时解决。

::versus Low-Code Era { highlight: true }
### 低代码开发模式
业务人员直接在平台上拖拽构建 → 连接现有数据源 → IT 设定治理策略（DLP、环境隔离）→ 即时发布。开发周期从月缩短到周，业务人员从需求方变成构建者，IT 从交付者变成治理者。
:::

## #debate 02 / The "Low Code is Dead" Debate :: "Low Code is Dead" 争论的本质

AI 原生代码生成工具（GitHub Copilot、Cursor、Claude Code 等）的崛起，让普通人可以用自然语言直接生成完整应用。这直接冲击了低代码的核心卖点——降低编程门槛。如果 AI 能把自然语言变成代码，还需要拖拽式的可视化编辑器吗？

:::accordion
::panel { open: true }
### 2.1 "Low Code is Dead" 阵营的论据
- **AI 生成代码门槛更低** — 用自然语言描述需求比学习低代码平台的拖拽规则更直觉。Vibe Coding 的兴起表明，AI 正在重新定义"编程门槛"的含义。
- **生成的是真正的代码** — AI 生成的是可移植、可审查、可版本控制的标准代码，而低代码平台生成的是平台锁定的私有格式，缺乏可移植性。
- **灵活性碾压** — 低代码平台的可视化编辑器有天花板（复杂业务逻辑、高度定制 UI、高性能需求），而 AI 代码生成没有这个上限。
- **厂商锁定风险** — 低代码平台上构建的应用难以迁移，AI 生成的代码可以在任何环境运行、任何团队接手。

::panel
### 2.2 低代码不会死的理由
- **AI 生成代码不等于可治理的应用** — 一个应用的生命周期不只是编码。部署、监控、权限管理、合规审计、数据丢失防护（DLP）——这些是低代码平台已经构建了多年的能力。AI 生成的代码要达到企业级部署标准，需要单独搭建这些基础设施。
- **连接器与集成生态** — Power Platform 内置 1,400+ 预构建连接器，Salesforce、ServiceNow 等平台也积累了深厚的集成生态。这些能力无法靠一行 prompt 替代，背后沉淀着多年的 API 适配、认证流程与错误处理逻辑。
- **"公民开发者"仍然需要护栏** — AI 生成代码给了每个人"写代码"的能力，但没有给他们"安全地部署和管理代码"的能力。没有治理框架的 AI 代码生成等于给每个员工一把没有保险的枪。
- **Gartner 2025 预测** — 到 2028 年，75% 的大型企业将至少采用四种低代码开发工具支撑 IT 应用开发与公民开发，低代码市场仍在持续增长。

::panel
### 2.3 真正的剧变：从编码替代到流程编排
争论的关键不在于低代码与 AI 谁取代谁，而在于应用构建的价值重心正在发生位移：

- **2015-2022：价值在编码替代** — 低代码的核心价值是"用拖拽替代编码"，AI 尚未成熟，这个价值成立。
- **2023-2025：价值向治理和编排位移** — AI 可以生成代码了，"编码替代"的价值被摊薄。但企业更需要的是：谁来管理这些 AI 生成的应用？谁来确保它们符合合规要求？谁来编排跨系统的工作流？
- **2026+：价值集中在人机协作编排** — 写代码已由 AI 接管，未来低代码平台的核心价值将转向充当人、AI Agent、企业数据与业务流程之间的编排层和治理层。

> **关键判断**
> 低代码不会死，但"低代码 = 可视化编程工具"这个定义会死。存活下来的低代码平台将重新定义自己为"AI 应用治理与编排平台"。
:::

## #powerapps 03 / Power Apps Evolution :: Power Apps 的四阶段演进

Microsoft Power Apps 自 2016 年正式推出以来，经历了四个清晰的演化阶段。每个阶段都是对市场需求变化的结构性回应——从表单工具到应用平台，从流程自动化到 AI Agent 编排。

Phase 1 · 2016-2019

### 表单驱动时代：用 Excel 思维做应用

Power Apps 的初始定位是"会用 Excel 就能做应用"：Canvas Apps 采用拖拽式画布，Power Fx 公式语言借鉴 Excel 语法，核心场景是把 SharePoint 列表或 Excel 表格转化为移动端可用的表单应用。这一阶段的关键突破在于 **Power Fx 的声明式编程模型**，让非开发者用"公式绑定属性"替代传统的"事件驱动编程"；连接器生态同步起步，首批上线约 200 个。

Phase 2 · 2019-2022

### 平台化扩张：Dataverse + Power Platform 一体化

引入 Model-driven Apps 后，Power Apps 从简单的表单工具演变为低代码应用平台：Dataverse（原 CDS）承载企业级数据层（含角色权限、审计日志与关系建模），Power Automate（原 Flow）负责工作流编排，Power BI 负责分析。这一阶段完成了**从单一应用工具到平台生态**的转型，陆续引入环境管理、DLP 策略、ALM（应用生命周期管理）与 Solutions 打包部署；连接器突破 500 个，企业客户开始将 Power Apps 纳入 IT 治理体系。

Phase 3 · 2023-2025

### AI 集成时代：Copilot 嵌入全栈

GPT-4 发布后，Microsoft 迅速将 Copilot 接入 Power Platform 全产品线，支持用自然语言创建应用、编写 Power Fx 公式、按需求描述生成 Power Automate 流程，并由 AI Builder 内置文档处理、表单识别与情感分析等预构建模型。**关键动作**：2025 年推出 Code Apps（支持 React/Vue 代码应用运行在 Power Platform 治理框架内），直接回应"开发者正在逃离低代码"的质疑；同期连接器突破 1,400 个，Copilot in Power Apps 覆盖 model-driven apps。

Phase 4 · 2026+

### Agent 编排时代：从应用平台到人机协作枢纽

2026 年是 Power Apps 身份转型的分水岭。四项关键能力正在重新定义其角色：**Power Apps MCP Server**（公开预览）使 AI Agent 能够像人类用户一样操作 Power Apps 应用——读取表单、创建记录、触发流程，并通过 Agent Feed 让人类监督和审批 Agent 的操作。**M365 Copilot 集成**（2026.04 公开预览）让 Model-driven Apps 的 Grid 和 Form 直接嵌入 Word/Excel/PowerPoint 的 Copilot 对话中，用户在文档编辑流中即可查询、创建和编辑业务数据，无需切换应用。**Canvas Apps MCP Authoring Plugin**（2026.04 公开预览）是 Power Apps 的"Vibe Coding"答案——用 GitHub Copilot、Claude Code 或任何 MCP 兼容 AI agent 通过自然语言构建 Canvas Apps，AI 生成 YAML 和 Power Fx 并在 Power Apps Studio 实时验证。**Generative Pages 外部工具支持**（GA）允许用 PAC CLI + AI 代码生成工具为 Model-driven Apps 创建自定义页面。Power Apps 正在从"人构建应用"全面转向"人与 Agent 协作构建和使用应用"。

## #attributes 04 / Survival Attributes :: 决定低代码平台存亡的六项关键属性

并非所有低代码平台都能在 AI 时代存活。六项关键属性决定了平台能否从"可视化编程工具"蜕变为"AI 治理编排平台"，这里逐项对照评估 Power Apps 的当前水位。

:::insight-grid { cols: 3 }
::card 01
### ① 企业治理深度
生死线

AI 时代每个员工都能生成代码，但谁来管？低代码平台的治理能力（DLP、环境隔离、RBAC、审计日志、Conditional Access）不再是锦上添花，而是核心生存竞争力。Power Apps 在此维度有深厚积累：多环境管理、Managed Environments、Tenant Isolation、Power Platform Admin Center。

**Power Apps 评分：强** — 10 年企业治理工具积累。但新兴 AI 平台正在快速构建类似能力。

::card 02
### ② AI Agent 支持深度
生死线

未来的企业应用同时面向人类用户与 AI Agent。平台能否充当 Agent 的操作界面与治理层？Power Apps MCP Server 已支持 Agent 直接操作模型驱动应用，并由 Agent Feed 配套人工监督机制；2026 release wave 1 更将"agentic app"确立为战略方向。

**Power Apps 评分：先发优势** — MCP Server + Agent Feed 是业界首个将低代码应用变成 Agent 可操作界面的方案。但 Agent 生态仍处于早期阶段。

::card 03
### ③ 连接器与集成生态
生死线

低代码平台的应用价值取决于它能连接多少企业数据源。1,400+ 连接器构成了 Power Platform 的核心竞争壁垒，每个连接器背后都凝聚着多年的 API 适配、认证流程、分页逻辑与错误处理工程。AI 可以帮你生成 REST API 调用代码，却无法靠一行 prompt 复刻整套连接器认证与治理体系。

**Power Apps 评分：业界领先** — 1,400+ 连接器 + Custom Connectors + Dataverse 关系建模。竞品中 Salesforce MuleSoft 在集成层面是最强对手。
:::

:::insight-grid { cols: 3 }
::card 01
### ④ Pro-Code 融合能力
关键

纯低代码有天花板，纯代码缺治理。未来的平台需要让两者在同一治理框架下共存。Power Apps 2026 年 GA 了 Code Apps——允许 React、Vue 等框架构建的应用运行在 Power Platform 治理层内，享受 DLP、Entra ID 认证、监控等企业能力。这是一个关键信号：承认代码开发有其不可替代性，但在治理层统一。

**Power Apps 评分：正在补强** — Code Apps GA 是正确方向，但开发者生态的迁移惯性仍是挑战。

::card 02
### ⑤ AI 原生创作体验
关键

低代码平台产品体验（即 Maker Experience）能否从"拖拽配置"转型为"自然语言驱动"？2026 年 4 月推出的 **Canvas Apps MCP Authoring Plugin** 是关键突破：Maker 可以用 GitHub Copilot、Claude Code 等 MCP 兼容 AI agent 通过自然语言描述需求，AI 生成 YAML + Power Fx 并在 Power Apps Studio 实时验证。这标志着 Power Apps 开始接受"Vibe Coding"范式——用户不再拖拽控件，而是用对话驱动应用构建。

**Power Apps 评分：快速追赶** — Canvas Authoring MCP Plugin 将 Power Apps 从"AI 辅助拖拽"推向"AI 原生创作"。但该功能仍处于公开预览阶段，与 Cursor/Bolt 等 AI-native 工具在体验流畅度上仍有差距。

::card 03
### ⑥ 可移植性与开放标准
新兴

厂商锁定是低代码平台最大的历史包袱。AI 时代用户拥有更多选择，平台必须开放一定程度的数据与逻辑可移植性来消除迁移顾虑。目前 Power Fx 已开源（GitHub: microsoft/power-fx），Code Apps 也采用了标准 Web 框架，但 Canvas Apps 与 Model-driven Apps 的核心格式仍属 Power Platform 私有。

**Power Apps 评分：部分开放** — Power Fx 开源 + Code Apps 标准化是正确方向，但核心应用格式仍锁定在平台内。
:::

## #challenges 05 / Competitive Landscape :: 竞品生态与所面临的挑战

Power Apps 不仅要面对传统低代码同行的竞争，还要迎战 AI 原生开发工具与新兴 Agent 平台，其结构性挑战可从三个维度拆解。

:::accordion
::panel { open: true }
### 5.1 同类低代码平台竞争
Salesforce Platform

**Salesforce + MuleSoft + Einstein**

在 CRM 领域拥有最深的低代码生态。MuleSoft 的 API 集成能力在企业集成层面是 Power Platform 的直接对手。Einstein Copilot 提供 CRM 场景的 AI 能力。**优势**：CRM 场景极深；**劣势**：跨 CRM 场景扩展能力弱于 Power Platform 的全栈覆盖。

ServiceNow

**ServiceNow App Engine + Now Assist**

在 ITSM/ITOM 领域占据主导。Now Assist 深度集成 AI 于工作流自动化。App Engine 提供低代码应用构建。**优势**：IT 运维流程最深；**劣势**：业务应用场景覆盖不如 Power Apps 广泛。

OutSystems

**OutSystems + Mentor AI**

面向专业开发者的高代码低代码平台。生成标准 .NET / React 原生代码，可导出运行。AI Mentor 提供代码质量分析。**优势**：生成可移植代码，无锁定焦虑；**劣势**：企业治理能力不如 Power Platform 成熟。

Mendix (Siemens)

**Mendix + Siemens 工业生态**

被 Siemens 收购后聚焦工业 IoT 和制造业场景。Mendix Assist 提供 AI 辅助建模。**优势**：工业场景独特性；**劣势**：通用企业市场影响力有限。

::panel
### 5.2 AI 原生代码生成工具冲击
- **GitHub Copilot / Cursor / Claude Code** — 它们不是低代码平台的替代品，但正在侵蚀低代码的核心价值主张——"降低编程门槛"。一个业务分析师用 Cursor 描述需求，AI 直接生成 React 应用。这比在 Power Apps 中拖拽更直觉。
- **Bolt / Lovable / v0** — AI 原生的前端生成工具，用户描述界面需求就能得到完整的 Web 应用。它们在原型速度上已经超越低代码平台，虽然在企业治理能力上几乎为零。
- **Replit Agent / Devin** — 自主编码 Agent 能从需求到部署全流程自动化。它们代表的是"AI 替代人类编程"的最终形态。但它们缺乏企业数据连接和治理层——这恰恰是低代码平台可以差异化的空间。

> **核心挑战**
> AI 代码生成工具在"个人生产力"维度碾压低代码，但在"组织治理"维度几乎空白。低代码平台的生存空间在于后者。

::panel
### 5.3 Agent 平台与新兴威胁
- **Microsoft Copilot Studio** — 与 Power Apps 同属 Power Platform，但角色逐渐独立。Copilot Studio 正在成为 Agent 构建的入口，而 Power Apps 变成 Agent 的操作界面。两者的边界和协作模式是 Microsoft 内部需要持续厘清的关键命题。
- **Anthropic MCP 生态** — MCP（Model Context Protocol）的开放标准正在形成 Agent 与应用交互的通用协议。Power Apps 选择拥抱 MCP 是正确的战略决策。但 MCP 生态的开放性意味着任何应用都可以成为 Agent 的操作界面——Power Apps 的"Agent 界面"角色不是独占的。
- **垂直行业 SaaS 自建 AI** — 行业巨头（如 Epic Health、SAP、Workday）正在自己的产品中嵌入 AI Agent。当行业 SaaS 自带 AI 编排能力后，通用低代码平台在该垂直场景的价值被进一步压缩。
:::

## #future 06 / Future Trajectory :: 未来发展趋势预测

结合前文拆解，可以对低代码品类演进与 Power Apps 走向得出四点具体判断。

:::insight-grid { cols: 2 }
::card 趋势 1
### 低代码品类重新定义
"低代码"作为产品类别名称可能在 2-3 年内逐步被弃用或重新定义。Gartner 已经出现 "AI-Augmented Application Platform" 等新分类。Power Platform 的营销定位也在从 "low-code" 向 "AI-powered business platform" 迁移。品类名的消亡不代表产品的消亡——它意味着这些平台需要用新的价值叙事来定义自己。

::card 趋势 2
### 治理即产品
AI 时代，应用数量将爆发式增长（每个员工都能生成应用），治理能力成为最稀缺的资源。能在组织级别统一管理 AI 生成应用、低代码应用、传统代码应用的平台，将在企业采购决策中占据有利位置。Power Platform 的 Managed Environments、CoE Starter Kit、Tenant Analytics 在此方向上有先发优势。

::card 趋势 3
### 人-Agent 协作界面
Power Apps 的 Agent Feed 预示着未来企业应用的标准交互形态：人类无需再亲手操作应用跑完每一步，而是设定规则、监督 Agent 执行并在关键节点介入审批。低代码平台的 UI 层随之从"人操作数据"转向"人监督 Agent 操作数据"。

::card 趋势 4
### Pro-Code 与 Low-Code 边界消融
Power Apps Code Apps 的 GA 标志着一个趋势：低代码和专业代码不再是非此即彼的选择，它们在同一治理框架下共存。未来的开发者可能在 VS Code 中用 AI 生成 React 应用，一键推送到 Power Platform 获得企业级治理和连接器能力。开发体验是代码级的，治理能力是平台级的。
:::

### 总结判断：Low Code is Dead?

**低代码不会死，但"旧低代码"会死。**

以"可视化拖拽替代编码"为唯一卖点的传统低代码工具，确实正在被 AI 代码生成边缘化；但以 Power Apps 为代表的头部平台正沿着三条路径重塑自身定位：

:::flow
1. **编程工具 → 治理平台** — 在 AI 让每个人都能生成代码的时代，成为组织管控这些代码的中枢。
2. **人操作界面 → Agent 协作界面** — 通过 MCP Server 和 Agent Feed，让 AI Agent 和人类在同一应用环境中协作。
3. **封闭格式 → 开放治理层** — 通过 Code Apps 接纳用任何框架编写的应用，在治理层而非开发层实现平台价值。
:::

能走通这一蜕变的低代码平台将在 AI 时代打开更广阔的市场空间——因为亟待治理的应用数量将是过去的 10 倍；而停留在原地的产品，终将成为 "Low Code is Dead" 的真实注脚。

## #references 07 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/power-platform/power-fx/overview | Power Fx 声明式公式语言的设计原理和演化哲学，印证了 Power Apps 以 Excel 思维降低编程门槛的初始定位。
- [2] Hemant Gaur, Microsoft. — https://www.microsoft.com/en-us/power-platform/blog/power-apps/public-preview-power-apps-mcp-and-enhanced-agent-feed-for-your-business-applications/ | Power Apps MCP Server 和 Agent Feed 标志着低代码平台从"人构建应用"向"人-Agent 协作"范式的转变。
- [3] Jordan Chodak, Microsoft. — https://www.microsoft.com/en-us/power-platform/blog/power-apps/generally-available-host-and-run-code-apps-in-power-apps/ | Code Apps GA 标志着 Power Apps 承认 Pro-Code 的不可替代性，并在治理层统一低代码与代码开发。
- [4] Gartner. | Gartner 预测全球低代码市场持续两位数增长，但品类定义正在向 AI-Augmented Application Platform 演化。
- [5] Forrester Research. | Forrester 提出低代码平台的评估框架，强调治理能力和专业开发者支持是头部平台的分化要素。
- [6] Microsoft. — https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/03/18/2026-release-wave-1-plans-for-microsoft-dynamics-365-microsoft-power-platform-and-copilot-studio-offerings/ | 2026 release wave 1 路线图明确了 agentic app、MCP 集成和治理增强作为 Power Platform 战略方向。
- [7] Anthropic. — https://modelcontextprotocol.io/ | MCP 作为 Agent 与应用交互的开放标准，Power Apps 拥抱 MCP 是其 Agent 平台战略的关键一步。
- [8] Tiffany Treacy, Microsoft. — https://www.microsoft.com/en-us/power-platform/blog/2026/04/09/whats-new-in-power-platform-april-2026-feature-update/ | Canvas Apps MCP Authoring Plugin（公开预览）和 Generative Pages 外部工具支持（GA）标志着 Power Apps 接受 Vibe Coding 范式。
- [9] Claudio Romano, Microsoft. — https://www.microsoft.com/en-us/power-platform/blog/power-apps/public-preview-your-business-apps-now-part-of-every-conversation/ | Model-driven Apps 通过 MCP Server 嵌入 M365 Copilot 对话，Grid/Form 在文档编辑流中可用——Power Apps 从独立应用变成 Copilot 生态的一环。

---
title: AI 编码助手的 Harness Engineering 最佳实践
eyebrow: Harness Engineering Best Practices
brand: Vibe Coding
date: 2026-04-08
strict_i18n: false
strict_density: true
lead: Harness Engineering 是通过结构化约定文件、分层记忆架构和指令体系，为 AI 编码助手建立持续演进的协作基础设施的工程实践。从 Day-One 初始化到跨项目记忆治理，本文覆盖完整的生命周期最佳实践。
hero_actions:
  - "查看初始化协议 | #dayone"
  - "查看设计模式 | #patterns"
panel_label: 核心理念
panel_title: 项目初期投入 2-4 小时建立 harness 体系
panel_desc: 后续每次与 AI 协作时节省的时间将成百倍回报。Harness 把隐性的团队知识变成显性的机器可读指令，让 AI 从第一轮对话就对齐团队标准。
panel:
  - copilot-instructions.md — 全局项目约定
  - "*.instructions.md — 按文件模式匹配的规则"
  - "*.prompt.md — 可复用的任务模板"
  - "*.agent.md — 带工具限制的专用子代理"
  - SKILL.md — 按需激活的工作流包
metrics:
  - "核心文件 | 5 | copilot-instructions.md, instructions/*.instructions.md, prompts/*.prompt.md, agents/*.agent.md, skills/*/SKILL.md"
  - "效率提升 | 3-5x | 经过 harness 初始化的项目，AI 输出质量和一致性显著提升。"
  - "上下文层级 | 4 | Workspace → File → Prompt → Agent，从全局到局部逐层细化。"
style:
  accent: "#12b5b2"
---

## #what 01 / What Is Harness Engineering :: 什么是 Harness Engineering

Harness Engineering 是为 AI 编码助手建立结构化工作约束和上下文框架的工程实践。它的目标是把隐性的团队约定转化为显性的、机器可读的指令体系，让 AI 在项目的第一天就能按照正确的方式参与开发。

:::insight-grid { cols: 2 }
::card 01
### 定义
Harness Engineering 是为 AI 编码助手建立结构化工作约束和上下文框架的工程实践。它把约定前置，让 AI 在启动时就理解项目。

::card 02
### 核心价值
把隐性的团队约定变成显性的机器可读指令，消除每次对话的重复校准。AI 从第一轮就能对齐，而不是经过三轮纠正后才理解你要什么。

::card 03
### 时机
项目第一天就应该初始化，就像 .gitignore 和 CI 配置一样。越早建立，后续越多对话受益。回过头补建的成本远高于一开始投入。

::card 04
### 边界
Harness 不是限制 AI，而是让 AI 在正确的轨道上发挥最大能力。它定义的是边界和方向，不是每一个微操。
:::

:::comparison
::versus Traditional
### 传统方式
每次会话手动描述项目背景、编码规范、架构约定。AI 输出不一致，需要反复校正。知识随会话消失，新会话从零开始。团队成员之间的 AI 使用经验无法共享。

::versus Harness { highlight: true }
### Harness 方式
约定写入结构化文件，AI 自动加载项目上下文。输出从第一轮就对齐团队标准。知识持久化并随项目演进。团队共享同一套指令，AI 行为一致性得到保障。
:::

## #hierarchy 02 / The Harness File Hierarchy :: Harness 文件体系与层级

Harness 的文件体系按照上下文作用范围分为四个层级：Workspace 级全局约定、File 级模式匹配规则、Prompt 级任务模板和 Agent 级专用子代理。每一层解决不同粒度的问题，避免信息过载。

:::accordion
::panel { open: true }
### 2.1 Workspace Instructions (copilot-instructions.md / AGENTS.md)
Workspace Instructions 是全局的、始终激活的项目约定文件。它定义了项目的技术栈、编码风格、禁止模式和架构规则。位于 .github/ 目录下，对所有会话和所有文件生效。

这是 harness 体系的基石。一个好的 copilot-instructions.md 应该包含：项目身份（技术栈、框架版本）、编码纪律（命名规范、import 规则、错误处理策略）、禁止行为清单（不允许使用的模式或工具），以及架构级约定（目录结构、分层规则）。

> **关键原则**
> copilot-instructions.md 应该是团队中任何新成员上手时最先阅读的文件之一。如果它对人有价值，它对 AI 就有价值。

::panel
### 2.2 File Instructions (*.instructions.md)
File Instructions 通过 YAML frontmatter 中的 applyTo glob 模式，将特定规则绑定到特定类型的文件。例如，测试约定只对 *.test.* 文件生效，API 路由约定只对 routes/* 下的文件生效。

这种分层机制解决了一个核心矛盾：全局指令如果过于详细会稀释 AI 注意力，而文件级指令允许你在需要的地方加载精确的上下文，而不干扰其他文件的开发。

- **testing.instructions.md** — applyTo: "**/*.test.*"，定义测试框架、断言风格、mock 策略。
- **api.instructions.md** — applyTo: "src/routes/**"，定义路由命名、参数校验、错误码规范。
- **components.instructions.md** — applyTo: "src/components/**"，定义组件结构、props 命名、状态管理模式。

::panel
### 2.3 Prompts (*.prompt.md)
Prompts 是可复用的任务模板，位于 .github/prompts/ 目录。每个 prompt 文件描述一个具体任务，带有参数化输入，可以被团队成员反复调用。它们就像代码中的函数——定义一次，反复使用。

- **create-api-endpoint.prompt.md** — 创建新的 API 端点，包含路由定义、参数校验、错误处理和测试桩。
- **add-unit-test.prompt.md** — 为指定模块生成单元测试，遵循团队的测试约定。
- **refactor-module.prompt.md** — 重构指定模块，保持接口不变，改善内部结构。

::panel
### 2.4 Custom Agents (*.agent.md)
Custom Agents 是带有工具限制和上下文隔离的专用子代理。每个 agent 可以定义自己能使用和不能使用的工具，以及它应该加载的额外指令文件。

隔离赋予了 agent 安全性和聚焦度。例如，一个 "reviewer" agent 只能读取文件不能修改；一个 "deployer" agent 可以运行终端命令但不能编辑源代码。

- **reviewer.agent.md** — 只读权限，专注代码审查，提供改进建议但不直接修改。
- **deployer.agent.md** — 可以运行部署脚本，但不能编辑业务代码。
- **doc-writer.agent.md** — 只能编辑 docs/ 目录下的文件，专注文档编写。

::panel
### 2.5 Skills (SKILL.md)
Skills 是按需激活的工作流包，位于 .github/skills/{name}/ 目录。每个 skill 包含一个 SKILL.md 描述文件和可选的附属资源（模板、示例文件等）。AI 通过 description 字段的语义匹配来发现和激活 skill。

Skills 与 Instructions 的区别在于：Instructions 始终加载或按文件模式加载，而 Skills 只有在用户请求匹配其描述时才被读取。这使得 skill 可以承载更重的上下文（如完整的工作流步骤、多文件模板），而不会在日常开发中占用注意力预算。

> **description 是发现入口**
> Skill 的 description 是 AI 发现它的唯一途径。如果描述不够精确，skill 永远不会被触发。写 description 就像写搜索关键词——要覆盖所有可能的触发意图。
:::

## #dayone 03 / Day-One Initialization Protocol :: Day-One 初始化协议

项目的第一天不只是写代码的开始，也是建立 AI 协作基础设施的最佳时机。以下六步构成了一个最小可行的 harness 初始化流程。

Initialization Flow

### 六步初始化清单

:::flow
1. **Create .github/copilot-instructions.md** — 写下项目身份：技术栈和版本、目录结构约定、核心架构原则。这是 AI 理解"我在哪个项目里"的第一份文件。
2. **定义编码纪律** — 在 copilot-instructions.md 中加入禁止行为清单：不允许的模式（如 silent error swallowing）、命名规范、import 排序规则、错误处理策略。负面指令比正面指令更有效。
3. **创建 File-Scoped Instructions** — 为最常编辑的文件类型建立专属指令：测试文件的断言风格、API 路由的参数校验模式、组件文件的结构约定。通过 applyTo glob 模式精确匹配。
4. **构建 Starter Prompts** — 为团队最常见的任务创建 prompt 模板：创建组件、添加 API 端点、编写迁移脚本。每个 prompt 应该明确输入参数和期望输出格式。
5. **建立 Memory/Context 约定** — 定义如何维护会话上下文、何时更新指令文件、如何处理 AI 学到的新模式。考虑引入 session memory 和 repo memory 的管理机制。
6. **建立 Review 协议** — 明确 AI 生成的变更如何被审查：哪些操作需要人工确认（如删除文件、修改共享基础设施）、哪些可以自动执行（如格式化、添加测试）。
:::

## #prompt 04 / 03+ / Recommended Initialization Prompt :: 推荐的 Harness 初始化提示词

在新项目中首次启动 AI 编码助手时，使用以下提示词让 AI 自动完成 harness 体系的脚手架搭建。它会分析项目结构并生成符合上述六步协议的完整文件体系。直接复制并发送给你的 AI 助手即可。

:::comparison
::versus Quick Start Prompt
### 快速初始化（适合个人项目）
适合个人项目或小型项目的轻量级初始化。AI 会扫描项目并直接生成核心文件。

复制

# 发送给 AI 编码助手的初始化提示词

请为当前项目初始化 Copilot Harness Engineering 体系：

## 第一步：分析项目

-

扫描项目结构、技术栈和依赖

-

识别主要编程语言、框架和构建工具

-

识别目录分层模式（src/、tests/、docs/ 等）

## 第二步：生成 .github/copilot-instructions.md

包含：

- 项目身份（名称、技术栈、版本）

- 目录结构说明

- 编码纪律（命名规范、错误处理、import 规则）

- 禁止行为清单（至少 3 条 "Do NOT" 规则）

- 架构约定

## 第三步：创建 File-Scoped Instructions

为项目中最常编辑的文件类型各创建一个：

- .github/instructions/testing.instructions.md

- 其他根据项目结构按需生成

## 第四步：创建 2-3 个 Starter Prompts

放在 .github/prompts/ 目录下，

覆盖团队最频繁的任务模式。

请逐步执行，每步完成后展示生成的文件内容。

::versus Full Harness Prompt { highlight: true }
### 完整初始化（适合团队项目）
适合需要完整治理体系的团队项目。包含 agent 定义、skill 框架和 review 协议。

复制

# 完整 Harness Engineering 初始化

你是一个 Harness Engineering 初始化专家。请为当前项目 建立完整的 AI 协作基础设施。

## 分析阶段

1.

扫描项目结构，输出技术栈摘要

2.

识别现有约定（lint 配置、CI、README）

3.

标记缺失的 harness 文件

## 生成阶段（按顺序执行）

A) .github/copilot-instructions.md

项目身份 + 编码纪律 + 禁止行为 + 架构约定

控制在 50 行以内

B) .github/instructions/*.instructions.md

按文件类型创建 2-4 个 file-scoped 指令

每个包含 applyTo frontmatter

C) .github/prompts/*.prompt.md

3-5 个覆盖高频任务的 prompt 模板

D) .github/agents/reviewer.agent.md

只读权限的 code review agent

E) 验证清单

- copilot-instructions.md ≤50 行？

- 是否有 ≥3 条 "Do NOT" 规则？

- file instructions 是否有 applyTo？

- prompts 是否有明确的输入参数？

请先展示分析结果，确认后再逐步生成文件。
:::

Usage Tips

### 使用建议

- **先分析再生成** — 让 AI 先输出分析结果，确认理解正确后再生成文件。这能避免 AI 基于错误假设生成不适用的指令。
- **逐步确认** — 要求 AI 每生成一个文件就暂停，等确认后再继续。批量生成会导致后续文件的质量下降。
- **基于现有约定** — 如果项目已有 .eslintrc、tsconfig、CI 配置等，提示词会自动引导 AI 从中提取约定，避免重复和冲突。
- **迭代优化** — 初始化后的第一周是最佳调优期。每次发现 AI 输出不符合预期，立即更新对应的指令文件。

## #patterns 04 / Instruction Design Patterns :: 指令设计模式

好的指令不是简单的规则罗列，而是需要精心设计的结构化知识。以下六种模式来自大量实践中总结出的有效策略。

Pattern 1

### Guard Rails 护栏模式

定义 AI 绝对不能做的事情。负面指令比正面指令更容易被 AI 遵守。例如："Never use regex for text extraction"、"Never commit without tests passing"、"Never swallow errors silently"。

Pattern 2

### Template Anchoring 模板锚定

提供期望输出格式的具体示例，而不是抽象描述。AI 从示例中学习远比从规则中学习更准确。一个好的 anchor 胜过十条规则。

Pattern 3

### Progressive Disclosure 渐进式披露

将指令从通用（workspace 级）到具体（file 级）逐层组织，避免信息过载。AI 不需要在编写组件时知道数据库迁移的规则。

Pattern 4

### Negative Examples 反例驱动

在规则旁边展示常见错误及其修正。"不要这样做"+"应该这样做"的配对比单独的规则描述更有效，因为 AI 能从对比中建立更精确的理解。

Pattern 5

### Living Documentation 活文档

指令文件随项目演进。每次发现 AI 犯了一个新类型的错误，就在对应的指令文件中加入一条规则。好的 harness 是从实战中长出来的，不是一次性规划出来的。

Pattern 6

### Context Budgeting 上下文预算

保持指令简洁，优先传递信号而非噪声。每个指令文件控制在 50 行以内。AI 的注意力是有限资源——过多的指令会稀释最重要规则的执行力。

## #pitfalls 05 / Common Pitfalls :: 常见陷阱与应对

Harness Engineering 不是写完文件就结束了。以下是实践中最常见的八个陷阱，以及对应的应对策略。

- **指令过长导致 AI 注意力稀释** — 每个指令文件控制在 50 行以内。把详细内容拆分到 file-scoped instructions 或 skills 中。
- **约定写了但没有验证机制** — 结合 CI hooks 或 AI review agent 做自动检查。指令不只是给 AI 看的，也需要可验证性。
- **过度限制导致 AI 无法发挥** — 告诉 AI 边界，不要事无巨细地规定每一步。Harness 是护栏，不是脚本。
- **忽略负面指令（什么不该做）** — 负面指令比正面指令更有效，AI 更容易理解禁区。"Never do X" 比 "Always do Y" 的遵守率更高。
- **一次性初始化后从不更新** — 每次发现 AI 犯重复错误，就应该更新指令。好的 harness 是活的。
- **把所有约定放在一个文件** — 按职责分层：全局 → 文件级 → 任务级。单文件指令超过 100 行就需要拆分。
- **描述不够导致技能/代理未被触发** — description 是 AI 发现指令的唯一入口。写 description 就像写搜索关键词。
- **忽略团队协作的指令同步** — 指令文件应纳入版本控制并参与 code review。指令变更和代码变更同等重要。

## #evolving 06 / Evolving Your Harness :: 持续演进你的 Harness 体系

Harness 体系的成熟度不是一步到位的，而是随着团队对 AI 协作的理解深入而逐步演进的。以下是三个阶段的成熟度模型，以及衡量 harness 效果的五项指标。

:::comparison
::versus Maturity Model
### 三阶段成熟度模型
1. **基础约定** — copilot-instructions.md + 基本编码规范，1-2 个 starter prompts。团队开始统一 AI 使用方式，但指令体系还比较粗糙。
2. **分层治理** — File-scoped instructions + custom agents + 任务模板库。不同类型的文件有不同的约定，团队建立了可复用的 prompt 库。
3. **自适应体系** — Skills + memory grooming + 团队共享指令仓库 + CI 集成验证。harness 成为项目基础设施的一部分，能够自我演进和自我验证。

::versus Effectiveness Metrics { highlight: true }
### 度量你的 harness 效果
- AI 首次输出采纳率（目标 >70%）
- 需要校正的轮次（目标 <2 轮）
- 重复描述相同约定的频率（目标 0）
- 新成员上手到独立使用 AI 的时间
- 指令文件的更新频率（健康信号：每周 1-2 次）
:::

## #casestudy 07 / Case Study — Knowledge Hub :: 实战案例：三层指令记忆架构

本站（Knowledge Hub）在持续迭代过程中遇到了典型的指令管理问题：AI 在生成新文章时反复犯同类错误（重复实现已由共享脚本处理的行为、添加冗余的 HTML 图标标记）。问题根源不是 AI 能力不足，而是指令体系的架构设计存在盲区。以下是诊断过程和最终方案。

:::accordion
::panel { open: true }
### 7.1 问题诊断：同类 Bug 反复出现
在三篇新文章中发现了相同的两类问题：

- **HTML 与 CSS 双重图标** — 文章内联了 `<span class="subsection-icon">+</span>`，而共享 CSS 已通过 `::after` 伪元素生成 +/- 图标。结果：每个折叠面板出现两个 + 号，展开时一个变 - 另一个保持 +。
- **JS 行为重复实现** — 一篇文章在内联 `<script>` 中重写了 90 行滚动揭示、折叠面板和 localStorage 同步逻辑，与已加载的 `article-common.js` 完全重复。结果：事件监听器被注册两次。

核心原因：生成指令只说"Include scroll-reveal observer, accordion JS"，没有明确这些行为已由共享脚本处理、不得内联重复。AI 在生成新文章时，按照"确保功能完整"的本能重新实现了这些行为。

::panel
### 7.2 方案设计：全局与项目级指令的协同
根本挑战在于：AI 编码助手的记忆系统有多个作用域（全局/项目/会话），如果不做架构设计，规则会散落在不同层级，产生重复、冲突或遗漏。

**三层架构设计：**

- **User Memory（全局层 · 跨 Agent 知识共享）** 跨所有项目和所有 AI Agent 自动加载。只存储老板的通用行为规范：git 纪律、调试方法论、写作标准、文档格式要求。总量控制在 50 行以内，**不含任何项目专属术语、文件路径或数值基线**。User Memory 是不同项目中不同 AI 编程智能体之间相互共享知识的唯一通道。
- **Repo Memory（项目层 · 踩坑速查 + 项目基线）** 仅当前项目可见，需主动读取。记录两类信息：（1）曾经犯过且容易复发的错误（踩坑卡），（2）项目专属的审查基线和度量数值。每文件不超过 10 行。用一行指针指向 `.github/instructions/` 获取完整规范，避免双源维护。
- **Instructions（项目层 · 权威规范）** 通过 VS Code 的 `applyTo` glob 自动注入。包含详尽的组件规范、规范 HTML 模板、Forbidden 清单。按文件类型拆分（article-pages / homepage / knowledge-data），是生成代码时的唯一权威来源。

**分层原则：**User Memory 存"所有项目都必须遵守的行为规范"（跨 Agent 共享），Repo Memory 存"这个项目上次栽在哪"（踩坑提醒 + 项目基线），Instructions 存"怎么做是对的"（正向规范）。三层职责不重叠，信息不冗余。

::panel
### 7.3 实施效果与持续演进机制
**实施的具体变更：**

- **Instructions 升级** — 将 `article-pages.instructions.md` 从 15 行扩展到 80+ 行，新增"Forbidden JS in Inline Scripts"清单（5 种不得内联的行为）和三个核心组件的规范 HTML 模板（Accordion / Section / Topbar）。
- **User Memory 瘦身** — 将项目专属规则标记为 `(Project-Specific)`，从 28 行减少到 17 行通用规则。确保在其他 workspace 中不会注入无关指令。
- **Repo Memory 降重** — 将 9 行的规范描述缩减为 3 行踩坑提醒，每条只需一行话加上指针。消除了与 instructions 的双源维护问题。
- **防御性 CSS** — 添加 `.subsection-icon { display: none; }`，即使未来有残留 HTML 也不会产生视觉干扰。

**对话提取协议（持续演进机制）：**

每次与 AI 的协作对话结束前，执行一次指令提取：将对话中产生的可指令化规则归类到正确层级（user → repo → instructions），经确认后写入。这确保了指令体系能从实战中持续生长，而不是依赖一次性的静态配置。指令体系本身成为 Living Documentation 模式（Pattern 5）的实践。
:::

## #memory-grooming 08 / Memory Grooming — Cross-Project Optimization :: 记忆治理：跨项目的持续优化

当你同时维护多个项目，每个项目有独立的 AI 编码助手时，记忆污染成为必须面对的架构问题。项目 A 的规则泄漏到项目 B 的注意力空间，导致无关指令稀释 AI 的执行力。Memory Grooming 是定期审计和整顿记忆层级的工程实践。

:::accordion
::panel { open: true }
### 8.1 问题：跨项目记忆污染
在实际多项目协作中，AI 助手的 User Memory 会自然积累来自不同项目的规则。典型症状：

- **注意力稀释** — 在 Study-Room 项目写技术文章时，MUD 游戏项目的叙事设计规则（"做局者"模式、"事件"术语）自动加载到上下文，占用注意力预算却毫无用处。
- **基线错位** — 项目 A 的审查基线（"31 篇文章、index.html 5608 行"）存在全局层，在项目 B 中被读取后产生困惑——这些数字与当前项目完全无关。
- **规则冲突** — 不同项目的文档格式要求不同（一个要 Markdown，一个要 HTML），但都存在 User Memory 中时 AI 无法判断当前应遵循哪条。

**根本原因**：User Memory 自动加载到所有项目的所有对话中。任何存入其中的项目专属内容都会成为其他项目的注意力噪声。

::panel
### 8.2 User Memory 作为跨 Agent 知识共享层
认清 User Memory 的真正价值：它是你（老板）在不同项目中持有的不同 AI 编程智能体之间**唯一的知识共享通道**。利用好这个特性，而不是让它退化成垃圾收集站。

**适合放入 User Memory 的内容（跨 Agent 广播）：**

- **通用行为规范** — Git 纪律、调试方法论、服务重启策略。在任何项目中 AI 都应该遵循的操作纪律。
- **写作与文档标准** — 渐进披露文章架构（Hero + 编号章节 + 手风琴 + 洞察卡）、修辞禁令、证据要求。确保每个项目的 AI 都知道老板要求的文档格式。
- **记忆架构规则自身** — 三层分层原则、跨 Agent 纪律、新项目首次对话创建 repo memory 骨架的要求。元规则确保体系自我维护。

**必须迁出 User Memory 的内容：**

- **项目文件路径** — `article.css`、`knowledge-data.js`、`DEVELOPMENT-PROTOCOL.md` 等。其他项目不存在这些文件。
- **数值基线** — "31 篇文章"、"5608 行"、"article-presentation.js 1314 行"。这些是项目快照，属于 Repo Memory。
- **项目专属术语** — "Round archives"、"做局者"、"事件/局线"。在其他项目中无意义。

::panel
### 8.3 治理协议：审计、迁移、纪律
**定期审计：**每次跨项目切换时，检查 User Memory 中是否有上一个项目遗留的专属内容。审计标准：如果一条规则在移除项目名称后仍然有意义，它是通用的；否则它是项目专属的，应该迁出。

**迁移流程（四步）：**

1. **诊断** — 逐条审查 User Memory，标记每条规则为：通用 / 混合 / 项目专属。
2. **拆分** — 混合条目中提取通用部分保留，项目专属部分（路径、数值、术语）迁出到对应项目的 Repo Memory。
3. **删除** — 纯项目专属条目从 User Memory 中删除。下次进入该项目时自动在 Repo Memory 中补建。
4. **验证** — 整顿后 User Memory 应 ≤50 行、3 个文件。任何条目不含项目专属文件名、路径或数值。

**持续纪律（写入 User Memory 的元规则）：**

- **新项目首次对话** — 主动创建该项目的 Repo Memory 骨架（审查基线、关键合约），避免临时往 User Memory 塞项目内容。
- **发现跨项目规则时** — 提议将其写入 User Memory 供所有 Agent 共享，经老板确认后执行。
- **绝对禁令** — 项目专属内容（文件路径、行数、特定术语）永远不进 User Memory。

::panel
### 8.4 治理后的效果
以本站（Knowledge Hub）与 MUD 游戏项目的整顿为例：

Before

**整顿前**

User Memory 5 个文件、~90 行。包含 MUD 的叙事设计规则（"做局者"模式）、文档同步纪律（Round archives）、Study-Room 的审查基线（31 篇/5608 行）。两个项目的 Agent 互相被对方的规则干扰。

After

**整顿后**

User Memory 3 个文件、~50 行。只含通用行为规范（Git 纪律、调试方法）、写作与文档标准（渐进披露架构、修辞禁令）、协议框架（分层原则、跨 Agent 纪律）。项目基线和专属术语各归各的 Repo Memory。

**关键认知：**User Memory 不是"我的笔记本"，而是"所有 AI Agent 的共同行为宪法"。往里面写的每一条规则，都会被你所有项目中的所有 AI 助手无条件执行。这个认知应该驱动你在写入时的审慎程度。
:::

## #references 10 / References :: 参考来源

- [1] GitHub. | Copilot 自定义指令的官方文档，涵盖 copilot-instructions.md 和 file-scoped instructions。
- [2] VS Code. | VS Code 中 Copilot 自定义指令的配置指南，包括 prompts、agents 和 skills。
- [3] Anthropic. | "最成功的实现使用简单、可组合的模式"——这一原则同样适用于 harness 设计。

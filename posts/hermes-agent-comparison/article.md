---
title: Hermes Agent：自进化开源 AI Agent 框架深度研究
eyebrow: Autonomous Agent Framework
brand: 智能体
date: 2026-04-13
strict_i18n: false
strict_density: true
lead: "Hermes Agent 是 Nous Research 于 2026 年 2 月发布的开源自主 AI Agent 框架[1]。不同于绑定在 IDE 中的编程助手或包裹在单一 API 外层的聊天机器人，它是一个驻扎在用户服务器上的持久化 Agent——具备持久记忆、自动技能创建、多平台网关、定时任务调度和并行子代理等核心能力[2]。本报告深入剖析其架构设计，并与设计来源 OpenClaw[9] 以及 Claude Code[6]、OpenAI Codex CLI[4]、Aider[5] 等同类产品展开系统对比。"
hero_actions:
  - "架构解析 | #architecture"
  - "竞品对比表 | #comparison"
panel_label: 核心定位
panel_title: "不是 Copilot，也不是 Chatbot——是一个\"越用越聪明\"的自主 Agent。"
panel:
  - 持久记忆：跨会话记住用户偏好、项目上下文和环境配置，使用时间越长越了解用户。
  - 自动技能创建：解决复杂问题后自动生成可复用的 SKILL.md 文档，兼容 agentskills.io 开放标准。
  - 多平台网关：一个进程同时连接 Telegram / Discord / Slack / WhatsApp / Signal / CLI，支持跨平台对话接续。
  - 全模型兼容：支持 Nous Portal / OpenRouter（200+ 模型）/ OpenAI / 本地 vLLM 等任意 OpenAI 兼容端点。
metrics:
  - "GitHub Stars | 64.9k | 397 contributors · 8.7k forks"
  - "最新版本 | v0.8.0 | 2026-04-08 发布，7 个 Release"
  - "内置工具 | 47 | 终端 / 浏览器 / 文件 / 搜索等"
  - "许可 | MIT | 100% 自托管，零遥测，零数据收集"
style:
  accent: "#f97316"
---

## #what-is 01 / What Is Hermes Agent :: 什么是 Hermes Agent：重新定义"Agent"的含义

在当前 AI 工具生态中，"Agent"一词被广泛滥用——从简单的 API 包装器到 IDE 插件都自称 Agent。Hermes Agent 的设计理念是回归 Agent 的本义：一个自主运行、持续学习、主动触达用户的智能实体。

:::insight-grid { cols: 2 }
::card 01
### 谁在做 Hermes Agent
Nous Research，同时也是 Hermes 开源模型系列（Hermes 1→4）的创建者[2]。Hermes Agent 的核心开发者为 Ryan Teknium（teknium1），代码设计继承自 OpenClaw / Clawdbot（Peter Steinberger 创建的开源个人 AI 助手，356k GitHub stars）[9]。2026 年 2 月 Nous Research 基于 OpenClaw 的设计理念以 Python 重新实现并发布 Hermes Agent，提供了 `hermes claw migrate` 一命令迁移路径[2]。两个项目目前独立并行发展：OpenClaw 仍由 Peter Steinberger 维护（TypeScript, MIT）[9]，Hermes Agent 由 Nous Research 维护（Python, MIT）[2]。

::card 02
### 不是什么
**不是 IDE 编程助手**——不绑定 VS Code / Cursor，不做 code completion。**不是单一 API 聊天机器人**——不只是包裹一个 LLM API 的对话界面。**不是框架库**——不是 LangChain / AutoGen 那样的编程框架，而是一个可直接运行的完整 Agent 产品。

::card 03
### 是什么
一个自托管的、持久运行的 AI Agent。它住在你的服务器上，通过消息平台（Telegram / Discord / Slack 等）或 CLI 与你交互，拥有自己的终端、记忆系统和技能库。它可以执行代码、浏览网页、生成图像、调度定时任务——并且随着使用时间越长越了解你的工作方式。

::card 04
### 核心差异点
Hermes Agent 与竞品最大的差异在于**持续自进化学习循环**（closed learning loop）：Agent 自主创建技能文档 → 技能在后续使用中自我改进 → 主动提醒持久化知识 → FTS5 全文搜索跨会话回忆 → Honcho 辩证式用户画像[3][10]。这使它成为一个"越用越聪明"的个人 Agent。
:::

:::comparison
::versus 与 Hermes 模型的关系
### Hermes Agent ≠ Hermes Model
- **Hermes 模型**（Hermes 1→4）是 Nous Research 的开源微调 LLM 系列，以 neutral alignment 和 function calling 训练著称。
- **Hermes Agent** 是一个独立的 Agent 框架产品，可以使用任何 LLM（包括但不限于 Hermes 模型）。
- **推荐搭配** — Nous Portal 集成了 Hermes 模型，Hermes Agent 默认支持 Nous Portal OAuth 登录。但用户也可通过 OpenRouter 使用 Claude / GPT / Gemini 等任意模型。
- **协同设计** — Hermes Agent 的批量轨迹生成和 RL 训练工具可以为 Hermes 模型的下一代训练提供工具调用数据，形成"Agent 训练模型 → 模型驱动 Agent"的飞轮[2]。

::versus 从 OpenClaw 到 Hermes { highlight: true }
### 历史演变
- **OpenClaw**（原名 Clawdbot）由 Peter Steinberger 创建，是一个开源个人 AI 助手（356k GitHub stars, TypeScript），通过聊天平台控制用户计算机[9]。
- **2026-02** — Nous Research 基于 OpenClaw 的设计理念创建了 Hermes Agent（Python 重写），整合进 Nous 生态（Portal / Hermes 模型 / Psyche 训练网络）[2]。注意：这并非收购——OpenClaw 仍由原团队独立维护和发展[9]。
- **迁移路径** — `hermes claw migrate` 一命令导入 OpenClaw 的 SOUL.md、记忆、技能、API 密钥和消息平台配置[2]。
- **快速迭代** — 2 个月内从 v0.2.0 迭代到 v0.8.0（7 个 Release），增加了 MCP 支持、Honcho 用户画像[10]、语音模式等[8]。
:::

## #architecture 02 / Architecture :: 架构设计：六大核心模块

Hermes Agent 的架构围绕"持久化自主 Agent"的核心目标设计，由六个松耦合模块构成。所有数据存储在用户本地（~/.hermes/），零云端依赖。

Agent Core

### Agent 循环引擎

核心推理循环（agent/）：接收用户输入 → LLM 推理 → 工具调用 → 结果解析 → 继续对话或完成。支持 context compression、session search（FTS5 + LLM 摘要）和 title generation。

- run_agent.py — 主入口
- model_tools.py — 工具注册与调度
- toolsets.py — 工具集分发
- hermes_state.py — 全局状态管理

Memory

### 持久记忆系统

三层记忆架构[3]。**MEMORY.md**：Agent 自主维护的长期记忆（项目偏好、技术栈、常用模式）。**USER.md**：用户画像（通过 Honcho[10] 辩证式建模渐进构建）。**Session History**：FTS5 全文索引的会话历史，支持跨会话回忆。Agent 会主动提醒（nudge）用户持久化重要上下文。

Skills

### 自动技能系统

当 Hermes 解决一个复杂问题后，它会自动生成 SKILL.md 文档——一个结构化的、可搜索的技能文件。技能在后续使用中自我改进（self-improve）[3]。兼容 agentskills.io 开放标准[7]，支持社区分享。47 种内置工具覆盖终端 / 浏览器 / 文件 / 搜索等[3]。

- skills/ — 内置技能目录
- optional-skills/ — 可选技能
- /skills 或 /<skill-name> 快捷调用

Gateway

### 多平台消息网关

单进程消息路由器，同时连接 15+ 平台：Telegram / Discord / Slack / WhatsApp / Signal / Matrix / Mattermost / Email / WeCom / DingTalk / Feishu 等[3]。支持语音备忘转录、跨平台对话接续（Telegram 开始的对话可在终端继续）。systemd 服务化运行。

- gateway/ — 网关实现
- hermes gateway setup — 交互式配置
- hermes gateway install — 安装为系统服务

Execution

### 六种终端后端

本地终端 / Docker（安全加固容器）/ SSH 远程 / Daytona / Singularity / Modal[2]。Docker 模式提供只读 root、dropped capabilities 和 PID 限制。Daytona 和 Modal 提供 serverless 持久化——空闲时休眠、按需唤醒，可在 $5 VPS 上运行。

Training / RL

### MLOps 与训练数据生成

Hermes Agent 不仅是终端用户工具，还是训练数据生成平台[2]。**Batch Runner**：并行生成数千条工具调用轨迹。**Atropos 集成**：11 种 tool-call parser，支持 RL 训练 Agent 行为。**Trajectory Export**：导出 ShareGPT 格式数据用于微调，轨迹压缩适配 token 预算。

# 安装（一行命令，无需 prerequisites） curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash # 启动交互式 CLI hermes # 配置 LLM 提供商 hermes model # Nous Portal / OpenRouter / 自定义端点 # 启动多平台消息网关 hermes gateway setup # 交互式配置 Telegram/Discord/Slack 等 hermes gateway start # 启动网关进程 # 更新到最新版本 hermes update

## #capabilities 03 / Core Capabilities :: 核心能力：六大差异化特性深入分析

围绕 Hermes Agent 的六个核心能力，逐一拆解其设计意图和实际工程价值。

:::accordion
::panel { open: true }
### 持久记忆 — 跨会话学习
设计理念

**从"每次重新解释"到"越用越懂你"**

- **MEMORY.md** — Agent 自主维护的结构化记忆文件，记录用户偏好、项目细节和常见工作流。存储在 ~/.hermes/ 本地目录。
- **USER.md** — 借助 Honcho 插件构建辩证式用户画像。Agent 在对话中观察用户行为模式，逐步建立深度用户模型，无需依赖单次问卷式采集。
- **Session Search** — FTS5 全文索引所有历史会话，结合 LLM 摘要实现跨会话回忆。当用户提到"上周那个项目"时，Agent 可以搜索历史上下文。
- **主动持久化提醒** — Agent 在对话中检测到重要但尚未持久化的信息时，会主动建议用户保存，而非等待用户手动触发。

vs 竞品

**记忆能力对比**

- **Claude Code** — 通过 CLAUDE.md 项目文件提供上下文，但不具备跨会话的自动记忆。每次新会话需要重新加载项目文件。
- **Codex CLI** — 支持 .codex/skills 目录的项目级技能，但无持久用户画像和跨会话回忆。
- **Aider** — 通过 repo-map 映射代码库结构，但不维护用户偏好或项目偏好的持久记忆。
- **Hermes 独特性** — 是唯一同时具备自主记忆管理 + 用户画像 + 跨会话搜索 + 主动持久化提醒的 Agent。

::panel
### 自动技能创建 — 自我进化的知识系统
机制

**解决一次 → 永远掌握**

- **自动触发** — Agent 在解决复杂任务后，自动将解决方案封装为 SKILL.md 文档，包含触发条件、步骤和注意事项。
- **自我改进** — 技能在后续使用中被自动优化：发现更好的方法时更新步骤，遇到新边界条件时补充注意事项。
- **可搜索** — 所有技能通过 /skills 命令浏览，/<skill-name> 直接调用。支持关键词搜索。
- **开放标准** — SKILL.md 格式兼容 agentskills.io 社区标准，可跨平台共享和安装（一命令安装外部技能）。

工程价值

**为什么技能系统比 prompt 模板更强**

- **vs Prompt 模板** — Prompt 模板是静态的；SKILL.md 是动态自进化的，包含上下文触发条件、多步操作流程和失败回退策略。
- **vs RAG** — RAG 依赖向量检索匹配；技能系统是精确匹配 + 结构化操作序列，不会产生 RAG 的相关性漂移问题。
- **复利效应** — 每次使用 Hermes 解决新问题，知识库自动扩展。团队场景中，一个人创建的技能可以立即被其他成员使用。
- **透明可审计** — SKILL.md 是纯文本文件，用户可以随时查看、编辑和版本控制 Agent 的知识。

::panel
### 多平台网关 — 随时随地触达
- **Telegram** — 完整支持，包含语音备忘转录、文件上传、内联键盘交互。最成熟的消息平台集成。
- **Discord** — Bot 模式集成，支持频道和私聊。适合团队/社区场景的 Agent 部署。
- **Slack / WhatsApp / Signal** — 覆盖企业（Slack）、个人（WhatsApp / Signal）和隐私优先（Signal）场景。WeCom（企业微信）回调模式在 v0.8.0 新增。
- **跨平台接续** — 在 Telegram 开始的对话可以在终端 CLI 中继续（通过共享会话 ID），反之亦然。

::panel
### 并行子代理 — 零上下文成本的工作流编排
设计

**通过 RPC 隔离的子 Agent**

- **隔离性** — 每个子代理拥有独立的对话上下文和终端会话，不污染主 Agent 的上下文窗口。
- **零上下文成本** — 子代理通过 RPC 通信，结果摘要压缩后返回主 Agent，多步管线只消耗一轮主 Agent 的 token。
- **Python 脚本模式** — 可编写 Python 脚本通过 RPC 调用工具，将复杂工作流编排为零上下文成本的自动化流程。
- **并行执行** — 多个子代理可以同时运行不同任务，适合批量处理和多步管线。

对比

**vs 其他 Agent 的并行方案**

- **Claude Code** — 最近引入了 subagent 概念，但不支持跨终端或跨会话的持久化子代理。
- **Codex CLI** — 支持并行任务执行，但通过云端 sandbox 实现，非本地化。
- **LangChain / CrewAI** — 提供 multi-agent 编排框架，但需要用户编写代码定义工作流，非自主创建。
- **Hermes 优势** — 子代理是运行时动态创建的，不需要预定义工作流。Agent 自主决定何时需要并行化。

::panel
### 定时任务调度 — 无人值守自动化
能力

**自然语言定义的 Cron 任务**

- **自然语言配置** — "每天早上 8 点发送新闻简报到 Telegram"即可创建定时任务，无需编写 cron 表达式。
- **多平台投递** — 定时任务的结果可以发送到任何已连接的消息平台。
- **内置模板** — 每日报告、夜间备份、每周审计、晨间简报等预设模板。
- **无人值守** — 配合 systemd 服务化运行，即使用户离线也持续执行。

独特性

**为什么其他 Agent 没有 Cron**

- **设计定位差异** — Claude Code / Codex / Aider 定位为"按需调用"的工具，设计时不考虑 7×24 持久运行。Hermes Agent 从一开始就设计为常驻服务。
- **基础设施要求** — 定时任务需要 Agent 持续运行在用户的服务器上，而非在用户终端会话中临时启动。
- **适用场景** — DevOps 巡检、竞品监控、数据备份、定期报告——这些是"Agent 作为基础设施"而非"Agent 作为工具"的场景。

::panel
### 安全与隐私 — 零信任设计
- **零遥测** — 不收集任何使用数据、崩溃报告或分析数据。所有数据存储在 ~/.hermes/ 本地目录。MIT 许可，可审计每一行代码。
- **容器安全加固** — Docker 执行后端默认启用四项隔离约束：只读 root 文件系统、dropped Linux capabilities、PID 限制与非 root 用户运行。
- **命令审批机制** — 敏感命令需用户显式批准。命令白名单机制（allowlist）降低常用命令的审批频率。--yolo 模式可跳过所有审批（需谨慎）。
- **DM 配对限制** — 消息网关通过 allowed users 配置限制谁可以与 Agent 对话，防止未授权访问。
:::

## #competitors 04 / Competitor Landscape :: 竞品概览：五类 AI Agent 产品的定位差异

与 Hermes Agent 形成竞争的产品可分为五类。其中 OpenClaw 是最直接的对标——两者共享设计理念，均定位为"持久化个人 AI 助手"。

Peter Steinberger

### OpenClaw

Peter Steinberger 创建的开源个人 AI 助手[9]。TypeScript 实现，通过 Gateway 连接 20+ 聊天平台。Hermes Agent 的设计来源项目，两者目前独立并行发展。356k Stars。

- 定位：持久化个人 AI 助手
- 模型：35+ 提供商（Anthropic / OpenAI / Google 等）[11]
- 许可：MIT
- 语言：TypeScript
- 消息平台：20+ 内置 + 插件通道[11]
- 移动端：macOS / iOS / Android 伴侣应用[11]

Anthropic

### Claude Code

Anthropic 出品的 agentic 编程工具[6]。在终端中运行，专注于代码编写、调试和项目理解。支持 CLAUDE.md 项目上下文文件。2025 年发布。

- 定位：IDE 内/终端编程助手
- 模型：仅限 Claude 系列
- 许可：闭源 / Anthropic 订阅
- 持久运行：否（按需调用）
- 消息平台集成：无

OpenAI

### Codex CLI

OpenAI 出品的编程 Agent，在本地终端运行[4]。支持 sandbox 隔离执行、multiline editing 和项目级 skills。Apache 2.0 开源。74.8k Stars。

- 定位：终端编程 Agent
- 模型：仅限 OpenAI / ChatGPT 订阅
- 许可：Apache 2.0（CLI 部分）
- 语言：Rust + TypeScript
- 消息平台集成：无

开源社区

### Aider

Paul Gauthier 创建的开源终端 AI 编程助手[5]。以 repo-map（代码库全局映射）和 Git 集成著称。支持 100+ 编程语言和几乎任何 LLM。43.2k Stars。

- 定位：终端 AI 结对编程
- 模型：任意（Claude / GPT / DeepSeek 等）
- 许可：Apache 2.0
- 核心优势：repo-map、自动 Git 提交
- 消息平台集成：无

编排框架

### LangChain / CrewAI / AutoGen

面向开发者的 Agent 编排框架（非终端用户产品），封装了构建 multi-agent 工作流的编程接口，需要开发者编写代码定义 Agent 行为、工具和协作模式。

- 定位：开发者框架 / 库
- 非直接竞品：不是可运行的 Agent 产品
- 互补关系：Hermes 等产品可以基于这些框架构建

## #comparison 05 / Head-to-Head Comparison :: 多维对比：Hermes Agent vs OpenClaw vs Claude Code vs Codex CLI vs Aider

对比表从 15 个维度横向评估五款 AI Agent。Hermes Agent 与 OpenClaw 是同源的"持久化个人 Agent"，其余三个是"按需编程助手"——两类产品的设计定位截然不同。

| 维度 | Hermes Agent | OpenClaw | Claude Code | Codex CLI | Aider |
| --- | --- | --- | --- | --- | --- |
| **核心定位** | 持久化个人 Agent（Python） | 持久化个人 AI 助手（TypeScript） | 终端编程助手 | 终端编程 Agent | AI 结对编程 |
| **开源许可** | MIT | MIT | 闭源 | Apache 2.0 | Apache 2.0 |
| **GitHub Stars** | 64.9k | 356k[9] | N/A（闭源） | 74.8k | 43.2k |
| **LLM 模型选择** | 任意 OpenAI 兼容端点 | 35+ 提供商[11] | 仅 Claude | 仅 OpenAI / ChatGPT | 任意 LLM |
| **持久记忆** | MEMORY.md + USER.md + FTS5 | MEMORY.md + 会话持久化[11] | CLAUDE.md（项目级） | .codex/ 项目文件 | 无 |
| **自动技能创建** | 47 内置工具 + 自动技能生成[3] | 技能系统 + ClawHub 社区[9] | 无 | 项目级 skills | 无 |
| **消息平台集成** | 15+ 平台[3] | 20+ 内置 + 插件通道[11] | 无 | 无 | 无 |
| **定时任务** | 内置 Cron + 多平台投递 | Cron + Heartbeat 调度[11] | 无 | 无 | 无 |
| **浏览器自动化** | 搜索/提取/点击/截图 | 专用 Chrome + CDP 控制[11] | 有限支持 | 无 | URL 抓取 |
| **移动端伴侣应用** | 无 | macOS / iOS / Android[11] | 无 | 无 | 无 |
| **7×24 持久运行** | systemd 服务化 | launchd / systemd 守护进程[9] | 按需启动 | 按需启动 | 按需启动 |
| **并行子代理** | RPC 隔离子代理 | 多 Agent 路由 + 会话隔离[11] | 有限 subagent | 云端并行 | 无 |
| **RL / 训练数据生成** | Atropos + 批量轨迹生成 | 无 | 无 | 无 | 无 |
| **语音交互** | CLI / Telegram / Discord | Voice Wake + Talk Mode[11] | 无 | 无 | 无 |
| **安装复杂度** | 一行 curl 命令 | 一行 curl / npm[9] | npm / brew | npm / brew | pip install |

关键发现

### 对比数据的核心洞察

- **Hermes vs OpenClaw：同源但分化** — 两者共享设计理念（持久化个人 Agent + 多平台网关 + 技能系统 + 定时任务），但实现路径不同。OpenClaw 以 TypeScript 实现，生态更成熟（356k stars, 1623 contributors, 90 Releases, macOS/iOS/Android 伴侣应用）[9]。Hermes Agent 以 Python 实现，集成了 Nous Research 的 RL 训练管线（Atropos + 批量轨迹生成）和 Honcho 用户画像[2][10]——这是 OpenClaw 没有的独特能力。
- **OpenClaw 的平台优势** — OpenClaw 拥有 macOS 菜单栏应用、iOS/Android 伴侣节点、Voice Wake 唤醒词、Live Canvas 可视化工作区和 A2UI 框架[11]，在消费级用户体验的完成度上远超 Hermes Agent。
- **Hermes 的 MLOps 优势** — 批量轨迹生成 + Atropos RL 环境 + 轨迹压缩是 Hermes Agent 独有的能力，使其同时是训练数据生产工具。这对 AI 研究者和模型训练者有独特价值[2]。
- **编程专深度** — 在纯编程场景中，Claude Code 的代码库索引深度、Aider 的 repo-map 全局映射仍然优于 Hermes Agent 和 OpenClaw。后二者是"什么都能做"的通才，不是编程专家。
- **模型自由度** — Hermes Agent、OpenClaw 和 Aider 都支持多模型提供商，Claude Code 和 Codex 分别锁定在各自厂商的模型上。

## #pros-cons 06 / Pros & Cons :: 优劣势分析：每款产品适合什么、不适合什么

结合"自主 Agent"维度的工程实用性标准，分别归纳各款产品的核心优势与局限边界。

:::accordion
::panel { open: true }
### Hermes Agent（Nous Research）
**✓ 优势**

- **唯一的"持久化个人 Agent"** — 7×24 运行、跨会话记忆、定时任务、消息平台网关，构成不可替代的组合
- **自进化学习循环** — 自动技能创建 + 自我改进 + 主动持久化提醒，使用时间越长越有价值
- **模型无关** — 200+ 模型可选（OpenRouter），不锁定在任何厂商
- **完全自托管** — 零遥测、零云依赖、MIT 许可，数据完全在用户控制下
- **MLOps 就绪** — 批量轨迹生成 + Atropos RL，可为下一代模型产出训练数据
- **$5 VPS 可运行** — Daytona/Modal serverless 后端使空闲成本趋近于零

**✗ 劣势**

- **非编程专家** — 代码库理解深度不如 Claude Code 和 Aider 的专用索引
- **迭代速度过快** — 2 个月 7 个 Release，API 和配置格式可能不稳定
- **运维责任** — 自托管意味着用户需自行维护服务器、更新和安全
- **新项目风险** — 2026-02 基于 OpenClaw 设计创建[2]，项目尚年轻，长期维护承诺尚未验证
- **文档上游追赶** — 功能迭代快于文档更新，部分新功能文档缺失

::panel
### OpenClaw（Peter Steinberger）
**✓ 优势**

- **生态成熟度最高** — 356k stars, 1623 contributors, 90 Releases, 5 个月迭代历史[9]
- **消费级用户体验** — macOS 菜单栏应用 + iOS/Android 伴侣节点 + Voice Wake 唤醒词 + Live Canvas 可视化工作区[11]
- **渠道覆盖最广** — 20+ 内置 + 插件通道，含 WhatsApp / Telegram / Discord / Slack / Signal / iMessage / Microsoft Teams / Matrix / WeChat 等[11]
- **完全自托管** — 零遥测、MIT 许可，Gateway 架构清晰，所有数据在 ~/.openclaw/[9]
- **35+ 模型提供商** — 支持 OAuth 订阅鉴权（如 ChatGPT / Codex 订阅直接使用）+ 自定义端点[11]
- **商业赞助商背书** — OpenAI / GitHub / NVIDIA / Vercel 为官方赞助商[9]

**✗ 劣势**

- **无 RL / 训练数据生成** — 不具备 Hermes Agent 的 Atropos 集成和批量轨迹生成，不面向 AI 研究场景
- **无 Honcho 用户画像** — 不具备辩证式用户建模，记忆系统更偏传统的 MEMORY.md 文件
- **Node.js 依赖** — 需要 Node 22+，相比 Hermes Agent 的 Python 环境对某些服务器用户不太友好
- **非编程专家** — 与 Hermes Agent 类似，代码库理解深度不如 Claude Code / Aider 的专用索引
- **迭代极快** — 90 个 Release，API 变更频繁，升级需要关注 breaking changes

::panel
### Claude Code（Anthropic）
**✓ 优势**

- **代码理解最深** — Claude 的长上下文窗口 + 代码索引使其在大型代码库中表现最佳
- **模型质量最高** — Claude Sonnet 4.5 / Opus 在编程基准上领先[6]
- **CLAUDE.md** — 项目级上下文文件，简单有效
- **企业就绪** — Anthropic 的安全合规、SLA 和支持

**✗ 劣势**

- **闭源** — 无法审计或自定义 Agent 行为
- **仅限 Claude 模型** — 100% 供应商锁定
- **无持久运行** — 按需启动，不支持 7×24 Agent 场景
- **无消息平台集成** — 仅限终端交互
- **API 成本** — 高频使用下费用显著

::panel
### Codex CLI（OpenAI）
**✓ 优势**

- **OpenAI 生态整合** — ChatGPT 订阅直接使用，无需 API 密钥管理
- **Rust 性能** — 客户端用 Rust 编写，启动和响应速度极快[4]
- **Sandbox 隔离** — 安全的代码执行环境
- **Apache 2.0 开源** — CLI 部分可审计
- **.codex/skills** — 项目级技能支持

**✗ 劣势**

- **仅限 OpenAI 模型** — 供应商锁定
- **无持久运行** — 按需工具，非常驻服务
- **无消息平台集成** — 仅限终端
- **无跨会话记忆** — 不维护用户偏好或项目偏好
- **云端依赖** — 部分功能需要云端 sandbox

::panel
### Aider
**✓ 优势**

- **repo-map** — 代码库全局映射是独特的架构级优势，使大型项目的修改更精确[5]
- **最佳 Git 集成** — 自动 commit + 语义化 commit message + 轻松 undo
- **模型自由度最高** — 支持几乎任何 LLM，社区维护 LLM 排行榜
- **成熟稳定** — 3 年开发历史，社区验证充分[5]
- **100+ 编程语言** — Tree-sitter 驱动的多语言支持

**✗ 劣势**

- **仅限编程** — 不处理非代码任务（邮件、报告、数据分析）
- **无持久运行** — 按需使用
- **无记忆系统** — 每次会话独立，不积累用户偏好
- **无消息平台集成** — 仅限终端
- **无工具生态** — 不支持浏览器自动化、图像生成等非编程工具
:::

## #verdict 07 / Verdict :: 选择建议：根据场景选对工具

各款产品并非互相替代关系，它们分别解决不同层面的工程需求，按六个典型场景可给出清晰的选型建议。

场景 1

### 个人 AI 助手（消费级体验）

需要一个 7×24 运行的 AI 助手，通过手机消息平台随时可用，有伴侣应用、语音唤醒和 Canvas 可视化界面。

- **推荐：OpenClaw**
- 最成熟的生态（356k stars, 90 Releases）[9]
- macOS / iOS / Android 伴侣应用 + Voice Wake[11]
- 20+ 消息平台，渠道覆盖最广

场景 2

### AI 研究 / MLOps 自动化

需要定时巡检、自动化报告、批量数据处理和训练数据生成，面向 AI 研究者和模型训练者。

- **推荐：Hermes Agent**
- 唯一内置 Atropos RL + 批量轨迹生成[2]
- Honcho 辩证式用户画像是独特能力[10]
- 与 Nous Portal / Psyche 训练网络深度整合

场景 3

### 专业编程（大型代码库）

在大型已有代码库上进行开发，需要深度代码理解和高质量代码生成。

- **推荐：Claude Code 或 Aider**
- Claude Code 代码理解最深
- Aider 的 repo-map 对大型项目更友好

场景 4

### 轻量编程（快速原型）

快速创建新项目或做小型修改，需要低摩擦的入手体验。

- **推荐：Codex CLI**
- ChatGPT 订阅直接使用，无额外配置
- Rust 客户端启动极快[4]

场景 5

### 模型无关 + 成本控制

需要使用低成本 LLM（DeepSeek / 本地模型）进行编程，同时保持高质量。

- **推荐：Aider（编程）/ Hermes 或 OpenClaw（通用）**
- 三者都支持任意 LLM
- Aider 维护 LLM 排行榜帮助选择[5]

场景 6

### 隐私优先 / 完全离线

数据不能离开本地网络，需要完全自托管和零遥测保证。

- **推荐：Hermes Agent 或 OpenClaw + 本地模型**
- 两者均 MIT 许可 + 零遥测 + 本地 LLM
- 数据存储在 ~/.hermes/ 或 ~/.openclaw/

总结判断

### Hermes Agent vs OpenClaw：同源分化的两条路线

- **OpenClaw 是消费级个人 AI 助手的标杆** — 356k stars 的社区验证、macOS/iOS/Android 伴侣应用、Voice Wake 唤醒词、Live Canvas 可视化工作区、20+ 消息平台，在用户体验完成度上领先[9][11]。如果你想要一个"开箱即用的个人 AI 管家"，OpenClaw 是更成熟的选择。
- **Hermes Agent 是 AI 研究者的差异化选项** — Atropos RL 训练集成、批量轨迹生成、Honcho 辩证式用户画像是独有能力[2][10]，对模型训练和 Agent 行为研究有不可替代的价值。但项目仅 2 个月、7 个 Release，成熟度远低于 OpenClaw。
- **最大风险** — 项目自 2026-02 创建仅 2 个月[2]，7 个版本的快速迭代说明架构仍在快速变化。长期维护承诺、API 稳定性和社区生态成熟度需要时间验证。注意 Hermes Agent 与 OpenClaw[9] 是两个独立并行发展的项目，并非收购关系。
- **互补而非替代** — 对于专业编程场景，Hermes Agent 和 OpenClaw 都不会替代 Claude Code 或 Aider。最优工作流可能是：OpenClaw / Hermes Agent 作为 7×24 的"管家"+ Claude Code / Aider 作为编程时的"专家"。
- **关注方向** — MCP（Model Context Protocol）集成[3]、Psyche 分布式训练网络接入[1]、以及 agentskills.io 技能生态[7]的成长，将决定 Hermes Agent 的长期竞争力。

## #references 08 / References :: 参考来源

- [1] Nous Research. — https://hermes-agent.org/ | Hermes Agent 官方网站，包含功能概览、架构说明和快速入门指南，是核心能力分析的主要来源。
- [2] NousResearch. — https://github.com/NousResearch/hermes-agent | Hermes Agent 开源仓库（64.9k stars, 397 contributors）。包含完整源码、文档、Release 历史和贡献指南。
- [3] Nous Research. — https://hermes-agent.nousresearch.com/docs/ | 官方文档站，覆盖 CLI 使用、配置、消息网关、安全、工具系统、技能系统、记忆、MCP 集成和架构说明。
- [4] OpenAI. — https://github.com/openai/codex | Codex CLI 开源仓库（74.8k stars），OpenAI 的终端编程 Agent。Apache 2.0 许可，Rust + TypeScript 实现。
- [5] Aider-AI. — https://github.com/Aider-AI/aider | Aider 开源仓库（43.2k stars），Paul Gauthier 创建的终端 AI 结对编程工具。以 repo-map 和 Git 集成著称。Apache 2.0 许可。
- [6] Anthropic. — https://code.claude.com/docs | Claude Code 官方文档。Anthropic 出品的 agentic 编程工具，专注于代码编写和项目理解。
- [7] agentskills.io. — https://agentskills.io/ | Hermes Agent 技能生态的社区标准和分享平台。定义了 SKILL.md 开放格式。
- [8] NousResearch. — https://github.com/NousResearch/hermes-agent/blob/main/RELEASE_v0.8.0.md | 最新版本发布说明，包含 notify_on_complete、MiMo v2 Pro 集成等新功能。
- [9] OpenClaw. — https://github.com/openclaw/openclaw | OpenClaw 开源仓库（356k stars, 1623 contributors, TypeScript, MIT 许可），由 Peter Steinberger 创建和维护。Hermes Agent 的设计继承自 OpenClaw，但两者是独立并行发展的项目——并非收购关系。截至 2026-04 两个项目均活跃维护。
- [10] Plastic Labs. — https://github.com/plastic-labs/honcho | Honcho 是 Hermes Agent 使用的辩证式用户画像建模组件，通过观察用户行为模式渐进构建深度用户模型。
- [11] OpenClaw. — https://docs.openclaw.ai/ | OpenClaw 官方文档站。覆盖 Gateway 架构、20+ 消息通道、35+ 模型提供商、技能系统（ClawHub）、浏览器控制（专用 Chrome + CDP）、Cron/Heartbeat 调度、macOS/iOS/Android 伴侣应用、Voice Wake/Talk Mode 语音交互和 Live Canvas 可视化工作区。

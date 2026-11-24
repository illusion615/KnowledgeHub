---
title: Claw Code 用户手册：从安装到精通
eyebrow: User Manual
brand: 智能体
date: 2026-04-21
strict_i18n: false
strict_density: true
lead: "Claw Code 是由 UltraWorkers 社区维护的开源自主编码代理 harness。本手册以 Rust 实现的 `claw` CLI 为主线，覆盖环境准备、交互模式、工具系统、配置层级、权限策略和进阶自动化场景，帮助你从零开始掌握这款自主编码工具。"
hero_actions:
  - "快速上手 | #quickstart"
  - "进阶用法 | #advanced"
panel_label: 学习路径
panel_title: 从终端到自主编码
panel_desc: 本手册按照由浅入深的学习路径组织。先完成环境搭建和首次对话，再逐步解锁工具链、权限模型和多代理协同能力。
panel:
  - 环境准备 — Rust 工具链 + API Key 配置
  - 快速上手 — REPL 交互 / 单次提问 / JSON 输出
  - 工具系统 — 40 个内置工具的分类与实操
  - 配置与安全 — 五级配置层级与三级权限模型
  - 进阶用法 — Sub-agent、MCP、Hooks 与自动化
metrics:
  - "内置工具 || Built-in Tools | 40 | Bash / 文件 / 搜索 / Web / MCP / LSP / Agent 等 || Bash / File / Search / Web / MCP / LSP / Agent etc."
  - "权限模式 || Permission Modes | 3 | read-only / workspace-write / danger-full-access"
  - "配置层级 || Config Layers | 5 | 全局 → 用户 → 仓库 → 项目 → 本地 || Global → User → Repo → Project → Local"
  - "Rust 代码行 || Rust LOC | 48,600 | 9 个 crate，覆盖 API / 运行时 / CLI / 工具 / 遥测 || 9 crates across API / runtime / CLI / tools / telemetry"
style:
  accent: "#fb923c"
---

## #prerequisites 01 / Prerequisites :: 环境准备 || Prerequisites

使用 Claw Code 前，需先装好 Rust 工具链并配置 API 认证，全程约 5 分钟。 || Before using Claw Code, install the Rust toolchain and configure API authentication—the setup takes about 5 minutes.

:::insight-grid { cols: 3 }
::card 01
### Rust 工具链 || Rust Toolchain
需要安装 Rust 和 cargo。推荐使用 rustup 安装最新稳定版。如果你已经安装过 Rust，确认 cargo 可用即可。 || Rust and cargo are required. Install the latest stable version via rustup. If Rust is already installed, just confirm cargo is available.

::card 02
### API 认证 || API Authentication
支持两种认证方式：配置 ANTHROPIC_API_KEY 环境变量直连 API，或运行 claw login 走 OAuth 认证，二选一即可。 || Two authentication methods: set the ANTHROPIC_API_KEY environment variable for direct API access, or run claw login for OAuth authentication. Choose either one.

::card 03
### 可选配置 || Optional Configuration
如需使用代理或本地服务，可设置 ANTHROPIC_BASE_URL 环境变量指向自定义 API 端点。大多数用户无需此配置。 || Set ANTHROPIC_BASE_URL to target a proxy or local service. Most users don't need this.
:::

### 安装步骤 || Installation Steps

# 1. 安装 Rust（如果尚未安装）

$

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. 克隆仓库

$

git clone https://github.com/illusion615/claw-code.git

$

cd claw-code

# 3. 构建整个工作区

$

cd rust

$

cargo build --workspace

# 构建完成后，CLI 二进制位于：

rust/target/debug/claw

# 4. 配置 API Key（二选一）

$

export ANTHROPIC_API_KEY=

"sk-ant-..."

# 或使用 OAuth 登录

$

./target/debug/claw login

## #quickstart 02 / Quick Start :: 快速上手 || Quick Start

Claw Code 支持三种基本运行模式：交互式 REPL、单次 Prompt 和 JSON 输出，30 秒内即可跑通首次对话。 || Claw Code supports three core usage modes: interactive REPL, one-shot prompt, and JSON output—getting your first conversation running in 30 seconds.

:::comparison { title: "快速上手：三种启动模式" }
::versus 交互式 REPL || Interactive REPL
### 多轮对话模式 || Multi-turn Conversation
启动后进入交互式终端开启多轮对话，适合探索性开发、代码调试及需要上下文延续的任务，并支持恢复历史会话。 || Launches an interactive terminal for multi-turn conversations—suited for exploratory development, debugging, and tasks requiring context continuity, with session resumption built in.

$

cd rust

$

./target/debug/claw

::versus 单次 Prompt || One-Shot Prompt { highlight: true }
### 一问一答模式 || Single Q&A Mode
发送一个 prompt 并获取响应后退出。适合脚本集成、CI/CD 管道中的自动化任务和批量代码分析。支持简写形式。 || Sends one prompt and exits after getting the response. Ideal for script integration, CI/CD pipeline automation, and batch code analysis. Supports shorthand form.

# 完整形式

$

./target/debug/claw prompt

"summarize this repository"

# 简写形式

$

./target/debug/claw

"explain rust/crates/runtime/src/lib.rs"
:::

### JSON 输出模式 || JSON Output Mode

使用 --output-format json 标志获取结构化输出，方便脚本解析和管道集成。 || Use the --output-format json flag to get structured output for script parsing and pipeline integration.

$

./target/debug/claw

--output-format json

prompt

"status"

# 输出示例（结构化 JSON）

{ "response": "...", "usage": { "input_tokens": 1024, "output_tokens": 256 }, "model": "claude-sonnet-4-20250514" }

## #cli-modes 03 / CLI Modes :: CLI 模式与模型控制 || CLI Modes & Model Control

Claw Code 支持模型别名切换、权限模式指定、扩展思考和会话管理。这些参数可以在启动时通过命令行标志设置。 || Claw Code supports model alias switching, permission mode specification, extended thinking, and session management. These can be set via command-line flags at launch.

| 命令 / 标志 || Command / Flag | 说明 || Description | 示例 || Example |
| --- | --- | --- |
| `--model` | 指定模型，支持别名 opus / sonnet / haiku || Specify model, supports aliases opus / sonnet / haiku | `claw --model opus` |
| `--permission-mode` | 设置权限等级 || Set permission level | `claw --permission-mode read-only` |
| `--extended-thinking` | 启用扩展思考（链式推理） || Enable extended thinking (chain-of-thought) | `claw --extended-thinking` |
| `--session` | 恢复指定的历史会话 || Resume a specific session | `claw --session abc123` |
| `--output-format json` | 输出 JSON 格式，便于脚本解析 || JSON output for scripting | `claw --output-format json prompt "..."` |
| `claw login` | OAuth 登录认证 || OAuth login authentication | `claw login` |
| `claw logout` | 清除 OAuth 凭证 || Clear OAuth credentials | `claw logout` |

:::accordion { title: "CLI 模式：模型别名速查" }
::panel { open: true }
### 模型别名速查 || Model Alias Quick Reference
Claw Code 内置了三个模型别名，让你无需记忆完整的模型标识符： || Claw Code includes three built-in model aliases so you don't need to remember full model identifiers:

- `opus` — 最强推理能力，适合复杂架构设计和代码审查 || Strongest reasoning, best for complex architecture and code review
- `sonnet` — 平衡速度与质量，日常开发的默认选择 || Balanced speed and quality, default for daily development
- `haiku` — 最快响应速度，适合简单查询和批量操作 || Fastest response, ideal for simple queries and batch operations

::panel
### 会话持久化 || Session Persistence
每次 REPL 会话会自动保存到本地。下次启动时可通过 --session 标志恢复之前的对话上下文，包括工具调用历史和模型选择。这意味着你可以在中断后无缝继续之前的工作。 || Each REPL session is automatically saved locally. Resume previous conversation context through the --session flag on next launch, including tool call history and model selection. This means you can seamlessly continue previous work after interruptions.
:::

## #tools 04 / Built-in Tools :: 内置工具系统 || Built-in Tool System

Claw Code 暴露 40 个工具规格供 AI 代理自动调用。你无需手动触发——只需向 claw 发出指令，代理便会自动挑选并组合所需工具。核心工具按职责可分为六大类。 || Claw Code exposes 40 tool specs for AI agent auto-invocation. You never need to invoke them manually—once you issue an instruction to claw, the agent selects and combines the right tools across six core categories.

:::insight-grid { cols: 2, title: "工具系统：文件与终端" }
::card 01
### 终端 & Shell || Terminal & Shell
Bash 工具可在工作区内执行任意 Shell 命令。代理会自动用它来运行测试、安装依赖、查看 git 状态等。在 read-only 模式下，写入类命令会被拒绝。 || The Bash tool executes shell commands within the workspace. The agent uses it to run tests, install dependencies, check git status, etc. Write commands are denied in read-only mode.

::card 02
### 文件操作 || File Operations
ReadFile、WriteFile、EditFile 三件套：读取文件内容（支持 offset/limit）、创建/覆写文件、精确替换文件中的文本片段。EditFile 使用精确匹配而非行号，避免并发编辑冲突。 || ReadFile, WriteFile, EditFile trio: read file content (with offset/limit), create/overwrite files, and precisely replace text fragments. EditFile uses exact matching instead of line numbers to avoid concurrent edit conflicts.

::card 03
### 搜索工具 || Search Tools
GlobSearch 按文件名模式查找文件，GrepSearch 按正则表达式搜索文件内容。两者结合可以快速定位代码库中的任何符号、配置项或文本模式。 || GlobSearch finds files by name patterns, GrepSearch searches file contents by regex. Together they quickly locate any symbol, config entry, or text pattern in the codebase.

::card 04
### Web 工具 || Web Tools
WebSearch 执行网络搜索获取最新信息，WebFetch 抓取指定 URL 的内容并转换为可读文本。让代理可以查阅文档、API 参考和在线资源。 || WebSearch performs web searches for current information, WebFetch fetches URL content and converts to readable text. Enables the agent to consult documentation, API references, and online resources.
:::

:::insight-grid { cols: 2, title: "工具系统：代理与高级工具" }
::card 05
### Sub-Agent 编排 || Sub-Agent Orchestration
Agent 工具可以启动子代理来处理独立的子任务。主代理通过任务描述和 prompt 创建子代理，子代理完成后返回结果。适合将大任务分解为并行执行的小任务。 || The Agent tool spawns sub-agents for independent subtasks. The main agent creates sub-agents via task descriptions and prompts, and results are returned upon completion. Ideal for decomposing large tasks into parallelizable units.

::card 06
### LSP 智能分析 || LSP Intelligence
LSP 工具连接语言服务器，支持符号查找、引用查询、定义跳转、悬浮信息和诊断信息获取。让代理理解代码语义而非仅仅搜索文本。 || The LSP tool connects to language servers, supporting symbol lookup, reference queries, go-to-definition, hover info, and diagnostics. Helps the agent understand code semantics beyond text search.

::card 07
### 任务管理 || Task Management
TodoWrite 维护结构化任务列表，TaskCreate/TaskGet/TaskList 管理后台任务，TeamCreate 创建并行子代理团队，CronCreate 设置定时任务。完整的任务编排体系。 || TodoWrite maintains structured task lists, TaskCreate/TaskGet/TaskList manage background tasks, TeamCreate creates parallel sub-agent teams, CronCreate sets recurring tasks. A complete orchestration system.

::card 08
### MCP 与 Notebook || MCP & Notebook
MCP 工具连接外部 MCP 服务器扩展能力边界，NotebookEdit 直接编辑 Jupyter Notebook 的单元格。两者让 claw 的能力可以按需扩展，不受内置工具集的限制。 || MCP tools connect to external MCP servers to extend capabilities, NotebookEdit directly edits Jupyter Notebook cells. Together they make claw's capabilities extensible beyond the built-in tool set.
:::

:::accordion { title: "工具系统：完整工具清单" }
::panel
### 完整工具清单（40 个） || Full Tool List (40 tools)
Bash

ReadFile

WriteFile

EditFile

GlobSearch

GrepSearch

WebSearch

WebFetch

Agent

TodoWrite

TaskCreate

TaskGet

TaskList

TaskStop

TaskOutput

TaskUpdate

TeamCreate

TeamDelete

CronCreate

CronDelete

CronList

NotebookEdit

LSP

MCP

ListMcpResources

ReadMcpResource

McpAuth

Config

SendUserMessage

AskUserQuestion

EnterPlanMode

ExitPlanMode

WorkerCreate

WorkerGet

WorkerSendPrompt

WorkerTerminate

RemoteTrigger

Sleep

REPL

TestingPermission
:::

## #config 05 / Configuration :: 配置体系 || Configuration System

Claw Code 使用五级配置层级，后项覆盖前项。这种设计让你可以在全局设置默认值，再在特定仓库中覆写，最终用本地配置保存个人偏好而不影响团队。 || Claw Code uses a five-level configuration hierarchy where later entries override earlier ones. This design lets you set global defaults, override per-repo, and keep personal preferences in local config without affecting the team.

~/.claw.json

← 优先级 1（全局）

~/.config/claw/settings.json

← 优先级 2（用户级 XDG）

<repo>/.claw.json

← 优先级 3（仓库级，可提交到 git）

<repo>/.claw/settings.json

← 优先级 4（项目级，可提交到 git）

<repo>/.claw/settings.local.json

← 优先级 5（本地级，应加入 .gitignore）

:::callout { title: "实践建议 || Best Practice" }
将团队共享的配置放在 /.claw.json 或 /.claw/settings.json 并提交到版本控制。将个人偏好（如 API Key 路径、权限模式）放在 settings.local.json 并加入 .gitignore。 || Put team-shared config in /.claw.json or /.claw/settings.json and commit to version control. Keep personal preferences (API key paths, permission modes) in settings.local.json and add to .gitignore.
:::

:::accordion { title: "配置体系：CLAW.md 项目记忆" }
::panel { open: true }
### CLAW.md — 项目级 AI 记忆 || CLAW.md — Project-Level AI Memory
在仓库根目录放置 CLAW.md 文件，Claw Code 会在每次会话启动时自动读取并注入系统 prompt。你可以在其中定义： || Place a CLAW.md file in the repo root and Claw Code will automatically read and inject it into the system prompt at session start. You can define:

- 项目架构约定和编码规范 || Project architecture conventions and coding standards
- 技术栈偏好（如框架、测试库选择） || Tech stack preferences (frameworks, test libraries)
- 文件组织结构说明 || File organization structure notes
- 团队协作约定（如 commit message 格式） || Team collaboration conventions (commit message format, etc.)
- AI 代理的行为偏好（如谨慎度、输出风格） || AI agent behavior preferences (caution level, output style)

::panel
### 配置示例 || Configuration Example
// .claw/settings.json — 团队共享配置

{

"model"

:

"sonnet"

,

"permission_mode"

:

"workspace-write"

,

"extended_thinking"

: false }

// .claw/settings.local.json — 个人配置

{

"model"

:

"opus"

,

"permission_mode"

:

"danger-full-access"

,

"extended_thinking"

: true }
:::

## #permissions 06 / Permissions & Security :: 权限与安全 || Permissions & Security

Claw Code 借助 PermissionEnforcer 在每次工具执行前拦截校验。三级权限模式可精确控制代理的操作边界，覆盖从只读审查到完全自主操作的各类场景。 || Claw Code relies on PermissionEnforcer to gate-check every tool execution. Three permission tiers let you precisely control the agent's operational boundaries, from read-only auditing to fully autonomous operation.

:::comparison { title: "权限与安全：三级模式" }
::versus SAFE
### read-only
只允许读取操作。所有文件写入、bash 中的写入命令均被拒绝。适合代码审查、架构分析和学习场景——让代理看但不能动。 || Read operations only. All file writes and mutating bash commands are denied. Ideal for code review, architecture analysis, and learning—the agent can look but not touch.

::versus MODERATE
### workspace-write
允许在工作区边界内写入文件。任何试图跨越工作区目录的写入操作都会被阻止。适合日常开发——代理可以修改项目文件，但不会影响系统文件。 || File writes allowed within workspace boundaries. Operations crossing workspace directories are blocked. Ideal for daily development—the agent can modify project files but won't affect system files.

::versus FULL { highlight: true }
### danger-full-access
完全访问权限，默认模式。代理可以执行任何操作，包括系统级命令。适合受信环境下的自主编码——代理拥有与你相同的操作系统权限。 || Full access, the default mode. The agent can execute any operation including system-level commands. Suitable for autonomous coding in trusted environments—the agent has the same OS permissions as you.
:::

:::accordion { title: "权限与安全：安全防护机制" }
::panel { open: true }
### 内置安全防护 || Built-in Security Guards
无论处于哪种权限模式，Claw Code 始终强制启用五项内置安全防线： || Regardless of permission mode, Claw Code always enforces five built-in security guards:

- **路径穿越防护 || Path Traversal Prevention** — 检测符号链接跳转和 ../ 逃逸，阻止访问工作区外的文件 || Detects symlink traversal and ../ escapes, blocking access to files outside the workspace
- **大小限制 || Size Limits** — MAX_READ_SIZE / MAX_WRITE_SIZE 约束防止意外读取或写入超大文件 || MAX_READ_SIZE / MAX_WRITE_SIZE constraints prevent accidental reads or writes of oversized files
- **二进制检测 || Binary Detection** — NUL 字节检测自动阻止对二进制文件的文本操作，避免文件损坏 || NUL byte detection automatically blocks text operations on binary files, preventing corruption
- **工具调用审批 || Tool Call Approval** — 在非 full-access 模式下，高风险工具调用会弹出用户确认提示 || In non-full-access modes, high-risk tool calls trigger user confirmation prompts

::panel
### 权限选择建议 || Permission Mode Recommendations
- 代码审查 / 学习新项目 → read-only || Code review / learning a new project → read-only
- 日常功能开发 / Bug 修复 → workspace-write || Daily feature development / Bug fixing → workspace-write
- 个人项目 / 受信 CI 环境 → danger-full-access || Personal projects / trusted CI environments → danger-full-access
- 团队协作项目 → 在 .claw.json 中默认 workspace-write，让个人按需覆写 || Team collaborative projects → default workspace-write in .claw.json, let individuals override as needed
:::

## #slash-commands 07 / Slash Commands :: Slash 命令速查 || Slash Commands Reference

在 REPL 交互模式中，你可以使用斜杠命令来控制会话状态、切换模型和查看系统信息。这些命令不会消耗 API token。 || In REPL interactive mode, use slash commands to control session state, switch models, and view system info. These commands don't consume API tokens.

| 命令 || Command | 功能说明 || Description |
| --- | --- |
| `/status` | 显示当前会话状态：模型、权限模式、token 用量和成本 || Display current session status: model, permission mode, token usage, and cost |
| `/model` | 切换模型。支持完整名称或别名（opus / sonnet / haiku） || Switch model. Supports full names or aliases (opus / sonnet / haiku) |
| `/compact` | 压缩会话上下文，保留关键信息并释放 token 空间 || Compact session context, keeping key info while freeing token space |
| `/clear` | 清空当前会话历史，重新开始 || Clear current session history and start fresh |
| `/permissions` | 查看和修改当前权限模式 || View and modify current permission mode |
| `/config` | 查看当前生效的配置项及其来源层级 || View current active config entries and their source layers |

## #advanced 08 / Advanced Usage :: 进阶用法 || Advanced Usage

掌握基础操作之后，可以解锁 Sub-Agent 编排、MCP 扩展、Hooks 集成和自动化工作流等高级能力，将 Claw Code 从交互式助手提升为自主编码系统。 || After mastering the basics, unlock advanced capabilities like sub-agent orchestration, MCP extensions, hooks integration, and automated workflows, elevating Claw Code from an interactive assistant to an autonomous coding system.

1

### 发出指令 || Issue Directive

用自然语言描述目标，如「重构 auth 模块，提取公共接口」 || Describe the goal in natural language, e.g., 'refactor auth module, extract public interfaces'

2

### 代理分析 || Agent Analysis

Claw 自动阅读相关代码、理解结构、制定计划 || Claw automatically reads relevant code, understands structure, and formulates a plan

3

### 工具执行 || Tool Execution

自动调用 ReadFile、EditFile、Bash 等工具完成修改 || Automatically invokes ReadFile, EditFile, Bash, etc. to make changes

4

### 验证结果 || Verify Results

运行测试、检查编译、确认修改正确 || Runs tests, checks compilation, confirms changes are correct

5

### 报告产出 || Report Output

汇总修改内容，说明变更理由和验证结果 || Summarizes changes, explains rationale and verification results

:::accordion { title: "进阶用法：MCP / Hooks / 多代理" }
::panel { open: true }
### MCP 服务器集成 || MCP Server Integration
MCP（Model Context Protocol）允许 Claw Code 连接外部工具服务器，扩展内置工具集之外的能力。典型场景包括： || MCP (Model Context Protocol) allows Claw Code to connect external tool servers, extending capabilities beyond the built-in tool set. Typical scenarios include:

- 连接数据库查询工具，让代理直接查询生产数据 || Connect database query tools for direct production data queries
- 集成 Slack/Discord 消息推送，自动发送任务状态通知 || Integrate Slack/Discord messaging for automated task status notifications
- 连接 Figma/Design 工具，让代理读取设计稿 || Connect Figma/Design tools for reading design specs
- 接入内部 API 网关，执行领域特定操作 || Connect internal API gateways for domain-specific operations

MCP 生命周期管理支持部分成功——即使部分服务器连接失败，其余服务器仍可正常工作。 || MCP lifecycle management supports partial success—even if some servers fail to connect, the rest continue working.

::panel
### Hooks：PreToolUse / PostToolUse || Hooks: PreToolUse / PostToolUse
Hooks 允许在工具执行前后插入自定义逻辑。PreToolUse 在工具被调用前触发，可以用于：日志记录、参数校验、操作审批和安全检查。PostToolUse 在工具执行后触发，可以用于：结果转换、通知推送和指标采集。 || Hooks allow inserting custom logic before and after tool execution. PreToolUse triggers before a tool call for logging, parameter validation, approval, and security checks. PostToolUse triggers after execution for result transformation, notification, and metrics collection.

> **注意 || Note**
> Hooks 功能当前仍在开发中（🔧 标记），接口可能在后续版本中变化。建议在非生产环境中试验。 || The hooks feature is still under development (🔧 marked) and the interface may change in future versions. We recommend experimenting in non-production environments.

::panel
### 多代理并行工作流 || Multi-Agent Parallel Workflows
通过 TeamCreate 和 Agent 工具，可以构建多代理并行工作流。主代理作为编排者，将任务分解并分配给多个子代理并行执行。典型场景： || Through TeamCreate and Agent tools, you can build multi-agent parallel workflows. The main agent acts as orchestrator, decomposing tasks and assigning them to multiple sub-agents for parallel execution. Typical scenarios:

- 跨模块重构：每个子代理负责一个模块的修改 || Cross-module refactoring: each sub-agent handles one module's changes
- 代码审查：多个子代理分别审查不同方面（安全、性能、可读性） || Code review: multiple sub-agents review different aspects (security, performance, readability)
- 测试生成：并行为不同文件生成单元测试 || Test generation: generate unit tests for different files in parallel
- 文档编写：子代理分别撰写 API 文档、README 和变更日志 || Documentation: sub-agents separately write API docs, README, and changelogs

::panel
### 实际操作示例 || Practical Examples
**示例 1：代码审查 || Example 1: Code Review**

$

./target/debug/claw

--model opus --permission-mode read-only

> Review the authentication module for security vulnerabilities. Focus on: input validation, SQL injection, XSS, CSRF, and token handling.

**示例 2：自动重构 || Example 2: Automated Refactoring**

$

./target/debug/claw

--model sonnet --permission-mode workspace-write

> Refactor all API handler functions to use the new Result<T, AppError> return type. Update the error handling in each handler and add appropriate error codes. Run tests after each file change.

**示例 3：批量分析 || Example 3: Batch Analysis**

$

./target/debug/claw

--output-format json

prompt \

"List all TODO comments in src/ with file, line, and context"

\ | jq

'.response'

> todos.json
:::

## #walkthrough 09 / Project Walkthrough :: 实战案例：用 Claw Code 构建一个 REST API || Walkthrough: Building a REST API with Claw Code

以 Node.js + Express 待办事项 API 项目为例，演示在真实开发流程中如何用 Claw Code 走通从项目初始化到部署验证的全流程。每个步骤均列出输入指令、代理的实际执行动作以及关键决策点。 || Using a Node.js + Express todo API project as an example, this walkthrough shows how to run Claw Code across a real development workflow from project initialization to deployment verification—covering your prompts, agent actions, and key decision points at each step.

### 步骤 1：项目初始化 || Step 1: Project Initialization

先创建 CLAW.md 告诉代理项目的技术栈和规范，然后在 REPL 中发出脚手架指令。 || First create a CLAW.md to tell the agent about the tech stack and conventions, then issue a scaffold command in REPL.

# 1. 创建项目目录并编写 CLAW.md

$

mkdir todo-api && cd todo-api && git init

$

cat > CLAW.md

<

<

'EOF'

# CLAW.md ## Tech Stack - Node.js 20 + Express 4 + TypeScript - SQLite via better-sqlite3 (no ORM) - Jest for testing ## Conventions - Use ESM imports - All responses follow { data, error, meta } envelope - Commit messages: type(scope): description EOF

# 2. 启动 Claw Code（workspace-write 模式保护系统文件）

$

claw

--model sonnet --permission-mode workspace-write

# 3. 在 REPL 中发出指令

> Initialize a todo API project based on the tech stack in CLAW.md. Create package.json, tsconfig.json, src/index.ts with a health endpoint, and a basic Jest config. Run npm install after setup.

:::callout { title: "代理行为 || Agent Behavior" }
Claw 会读取 CLAW.md 了解技术栈偏好，然后依次调用 WriteFile 创建配置文件、Bash 执行 npm install，并在完成后运行 npx tsc --noEmit 验证 TypeScript 配置是否正确。 || Claw reads CLAW.md for tech stack preferences, then sequentially calls WriteFile to create config files, Bash to run npm install, and finally npx tsc --noEmit to verify TypeScript configuration.
:::

### 步骤 2：实现 CRUD 端点 || Step 2: Implement CRUD Endpoints

在同一个 REPL 会话中继续发出功能需求。上下文延续意味着代理已经理解了项目结构。 || Continue issuing feature requirements in the same REPL session. Context continuity means the agent already understands the project structure.

> Add CRUD endpoints for todos: - GET /api/todos (list, with ?status=done filter) - POST /api/todos (create, validate title is non-empty) - PATCH /api/todos/:id (update status) - DELETE /api/todos/:id Create a SQLite database module in src/db.ts and add migration logic that runs on startup. Write Jest tests for each endpoint.

:::callout { title: "代理行为 || Agent Behavior" }
代理会创建 src/db.ts（数据库初始化 + 迁移）、src/routes/todos.ts（路由）、tests/todos.test.ts（测试），然后自动运行 npm test 验证。如果测试失败，代理会读取错误输出、诊断问题并自动修复——这就是 agentic loop 的价值。 || The agent creates src/db.ts (database init + migration), src/routes/todos.ts (routes), tests/todos.test.ts (tests), then automatically runs npm test. If tests fail, it reads the error output, diagnoses the issue, and auto-fixes—this is the value of the agentic loop.
:::

### 步骤 3：安全审查 || Step 3: Security Review

功能开发完成后，切换到 read-only 模式让代理审查代码，避免在审查过程中意外修改文件。 || After feature development, switch to read-only mode for the agent to review code without accidentally modifying files.

# 切换权限模式（在 REPL 内）

> /permissions read-only

# 发起安全审查

> Review all route handlers for security issues: 1. SQL injection in query parameters 2. Missing input validation 3. Error messages that leak internal details 4. Missing rate limiting considerations Output a numbered list of findings with severity and fix suggestions.

:::callout { title: "代理行为 || Agent Behavior" }
代理会用 ReadFile 逐个读取路由文件，用 GrepSearch 搜索 SQL 拼接模式，然后输出结构化的审查报告。因为处于 read-only 模式，即使代理想修复问题也无法写入文件——你可以先审阅建议，再决定是否切回 workspace-write 让代理执行修复。 || The agent uses ReadFile to read route files, GrepSearch to find SQL concatenation patterns, and outputs a structured review report. In read-only mode, even if the agent wants to fix issues, it cannot write files—you can review suggestions first, then switch back to workspace-write to let the agent execute fixes.
:::

### 步骤 4：修复审查发现 & 提交 || Step 4: Fix Findings & Commit

# 切回写入模式

> /permissions workspace-write

# 让代理批量修复

> Fix all security findings from the review: - Use parameterized queries instead of string concatenation - Add input length validation (title max 200 chars) - Replace detailed error messages with generic ones in production Run tests after each fix to confirm nothing breaks.

# 修复完成后，让代理生成 commit

> Stage all changes and create a commit following our CLAW.md commit convention. Summarize what was fixed.

:::callout { title: "代理行为 || Agent Behavior" }
代理会逐一修复漏洞，每次修改后运行测试确认未引入回归，最后执行 git add -A && git commit。整个流程中你只需发出 3 条指令，代理会自动执行约 15 次工具调用。 || The agent fixes vulnerabilities one by one, running tests after each change to prevent regressions, and finally executes git add -A && git commit. Throughout the process you only issue 3 commands while the agent executes about 15 tool calls.
:::

### 步骤 5：CI 管道中的自动化检查 || Step 5: Automated CI Checks

在 CI 环境中使用单次 prompt 模式进行无人值守的代码检查。 || Use one-shot prompt mode for unattended code checks in CI environments.

# 在 CI 脚本中（如 GitHub Actions）

$

claw

--model haiku --permission-mode read-only --output-format json

\ prompt

"Check if all API endpoints have corresponding test cases. \ Return JSON with { covered: [...], missing: [...] }"

\ | jq

'.response'

> coverage-report.json

# 检查是否有遗漏

$

jq

'.missing | length'

coverage-report.json

0

:::callout { title: "关键决策 || Key Decision" }
CI 场景使用 haiku 模型（最快 + 最便宜）和 read-only 权限（防止 CI 环境中的意外写入）。JSON 输出让下游脚本可以解析结果并做出自动化决策。 || CI scenarios use the haiku model (fastest + cheapest) with read-only permissions (preventing accidental writes in CI). JSON output lets downstream scripts parse results for automated decisions.
:::

## #best-practices 10 / Best Practices :: 最佳实践 || Best Practices

从大量实际使用经验中总结出的高效使用方法。这些实践可以帮你减少 token 消耗、提高代理输出质量并避免常见陷阱。 || Distilled from extensive real-world usage. These practices help reduce token consumption, improve agent output quality, and avoid common pitfalls.

:::insight-grid { cols: 3, title: "最佳实践：Prompt 编写技巧" }
::card 01
### 明确指令优于模糊描述 || Specific Directives Over Vague Descriptions
❌「优化这个文件」→ 代理不知道优化什么。✅「将 src/db.ts 中的 SQL 字符串拼接改为参数化查询，保持现有的函数签名不变」→ 代理知道要改什么、怎么改、不改什么。指令越精确，代理的首次成功率越高，回合数和 token 消耗越低。 || ❌ 'Optimize this file' → agent doesn't know what to optimize. ✅ 'Replace SQL string concatenation in src/db.ts with parameterized queries, keeping existing function signatures unchanged' → agent knows what to change, how, and what to leave alone. More precise directives lead to higher first-attempt success rates and lower token consumption.

::card 02
### CLAW.md 是你最重要的投资 || CLAW.md Is Your Most Important Investment
花 15 分钟写一份详细的 CLAW.md 可以节省数小时的反复纠正。包含：项目架构概览、命名规范、测试策略、错误处理约定和禁止事项。代理在每次会话开始时自动读取这份文件，相当于一次性培训了一个了解你项目的新同事。 || Spending 15 minutes on a detailed CLAW.md can save hours of corrections. Include: project architecture overview, naming conventions, testing strategy, error handling conventions, and prohibited actions. The agent reads this file at every session start, effectively onboarding a new colleague who understands your project.

::card 03
### 要求代理先分析再动手 || Ask the Agent to Analyze Before Acting
对于复杂任务，先让代理用 read-only 模式分析代码并输出计划，确认计划合理后再切换到 workspace-write 执行。这种「分析 → 确认 → 执行」的三步模式可以避免代理在错误方向上浪费大量 token。 || For complex tasks, first have the agent analyze code in read-only mode and output a plan. After confirming the plan is sound, switch to workspace-write for execution. This 'analyze → confirm → execute' three-step pattern prevents the agent from wasting tokens on wrong approaches.
:::

:::insight-grid { cols: 3, title: "最佳实践：会话与模型管理" }
::card 04
### 按任务粒度拆分会话 || Split Sessions by Task Granularity
一个 REPL 会话最好围绕一个聚焦目标。完成一个功能后用 /clear 开始新会话，而不是在同一个会话里塞下整个 sprint 的工作。上下文越短，代理的注意力越集中，输出质量越高。当会话变得臃肿时，用 /compact 压缩而不是继续累加。 || Each REPL session should focus on one goal. After completing a feature, use /clear to start fresh rather than cramming an entire sprint into one session. Shorter context means more focused agent attention and higher output quality. When sessions get bloated, use /compact rather than continuing to accumulate.

::card 05
### 为不同任务选择合适的模型 || Choose the Right Model for Each Task
opus 用于需要深度推理的任务（架构设计、复杂重构、安全审计）；sonnet 用于日常开发（功能实现、Bug 修复、代码生成）；haiku 用于批量操作（格式检查、TODO 收集、CI 检查）。不要为简单任务使用 opus——费用是 sonnet 的数倍但对简单任务没有质量提升。 || Use opus for deep reasoning tasks (architecture design, complex refactoring, security audits); sonnet for daily development (feature implementation, bug fixes, code generation); haiku for batch operations (format checking, TODO collection, CI checks). Don't use opus for simple tasks—it costs several times more than sonnet with no quality improvement for straightforward work.

::card 06
### 让代理自验证 || Let the Agent Self-Verify
在每条指令中明确要求「修改后运行测试」或「编译验证」。代理天然支持 agentic loop——如果测试失败，它会自动读取错误、诊断并重试。你要做的是在指令中设定验证标准，而不是手动检查每一步。如果代理连续失败 3 次以上，这通常意味着需求不够清晰或超出了模型能力，此时应该介入调整指令。 || Explicitly require 'run tests after modification' or 'verify compilation' in each directive. The agent natively supports the agentic loop—if tests fail, it automatically reads errors, diagnoses, and retries. Your job is to set verification criteria in directives rather than manually checking each step. If the agent fails 3+ times consecutively, the requirement is likely unclear or beyond model capabilities, and you should intervene to adjust directives.
:::

:::insight-grid { cols: 3, title: "最佳实践：安全与团队协作" }
::card 07
### 权限模式是你的安全网 || Permission Modes Are Your Safety Net
默认从 workspace-write 开始，而不是 danger-full-access。只有在你完全信任代理行为（如个人项目）或在隔离环境中（如容器化 CI）时才升级到 full-access。代码审查一律使用 read-only。养成在 REPL 中随时用 /permissions 检查当前模式的习惯。 || Default to workspace-write instead of danger-full-access. Only upgrade to full-access when you fully trust agent behavior (personal projects) or in isolated environments (containerized CI). Always use read-only for code reviews. Build the habit of checking current mode with /permissions in REPL.

::card 08
### 配置分层管理 || Layered Configuration Management
团队项目中，可在 .claw.json 中设定保守默认值（sonnet + workspace-write）并提交到 git，再由成员通过 settings.local.json 覆写个人偏好（如 opus + extended-thinking），兼顾团队基线安全与个人操作自由度。settings.local.json 必须加入 .gitignore。 || In team projects, set conservative defaults (sonnet + workspace-write) in .claw.json and commit to git, while letting team members override personal preferences in settings.local.json (e.g., opus + extended-thinking) to balance baseline safety with individual flexibility. settings.local.json must be in .gitignore.

::card 09
### 善用 /compact 而非 /clear || Prefer /compact Over /clear
当上下文变长但你还需要保留核心上下文时，用 /compact 而不是 /clear。/compact 会压缩对话但保留关键信息（如当前正在修改的文件列表、已做的决策）。只有在切换到完全不相关的任务时才用 /clear。用 /status 监控 token 用量，在接近限制前主动压缩。 || When context grows long but you still need core context, use /compact instead of /clear. /compact compresses the conversation while retaining key information (current files being modified, decisions made). Only use /clear when switching to completely unrelated tasks. Monitor token usage with /status and proactively compact before hitting limits.
:::

:::insight-grid { cols: 2, title: "最佳实践：多会话协作与冲突预防" }
::card 10
### 按文件边界划分会话 || Partition Sessions by File Boundaries
多会话并行时，最有效的防冲突策略是让各会话只修改互不重叠的文件集合。例如会话 A 负责 src/auth/，会话 B 负责 src/api/。若两个会话必须改动同一文件，应先让其一收尾提交，另一个再接手。在 CLAUDE.md 中注明「本会话仅允许修改指定路径：…」即可显式约束代理的操作范围。 || When running parallel sessions, the most effective way to prevent conflicts is assigning non-overlapping file sets—for example, session A on src/auth/ and session B on src/api/. If two sessions must touch the same file, let one finish and commit before starting the other. Adding 'This session only modifies specified paths: …' in CLAUDE.md explicitly constrains the agent's scope.

::card 11
### Git Worktree 隔离并行任务 || Use Git Worktree to Isolate Parallel Tasks
git worktree 是多会话协作的最佳拍档。为每个并行任务创建独立 worktree 和分支（git worktree add ../feature-x -b feature-x），每个会话在各自 worktree 的独立目录中运行 Claw Code。这样即使两个代理同时修改相同路径的文件也不会冲突，因为它们操作的是物理上不同的目录。最后通过 PR 合并，利用 code review 解决语义冲突。 || git worktree is the ideal companion for multi-session work. Create a separate worktree and branch for each task (git worktree add ../feature-x -b feature-x), then run Claw Code in each worktree's directory. Even if two agents modify the same file path, there's no conflict since they operate on physically separate directories. Merge via PRs afterward, using code review to resolve semantic conflicts.

::card 12
### 频繁提交，小步合并 || Commit Often, Merge in Small Steps
每完成一个逻辑完整的修改就让代理提交（在指令中加「完成后 git commit」）。小而频繁的提交使合并窗口更短、冲突范围更小、回滚更精确。避免让一个会话积累数小时的未提交修改——积累越久，与其他会话产生文本冲突和语义冲突的概率越高。合并前用 git diff main...feature-x 预览差异，确认影响范围。 || Have the agent commit after each logically complete change (add 'git commit when done' to your prompt). Small, frequent commits shorten the merge window, reduce conflict scope, and allow precise rollbacks. Avoid letting a session accumulate hours of uncommitted changes—the longer the accumulation, the higher the probability of both textual and semantic conflicts. Preview with git diff main...feature-x before merging.

::card 13
### 用 CLAUDE.md 建立会话契约 || Establish Session Contracts via CLAUDE.md
在多人或多会话场景中，CLAUDE.md 不仅是配置文件，更是协作契约。写入共享的编码规范（缩进、命名、commit message 格式）、架构约束（不引入新依赖、不修改公共接口）和测试要求（修改后必须通过 lint 和测试）。这保证不同会话产出的代码风格一致，减少合并后的整理成本。每个 worktree 可以有自己的 CLAUDE.md 来进一步限定该分支的工作范围。 || In multi-person or multi-session scenarios, CLAUDE.md serves as a collaboration contract beyond just configuration. Document shared coding standards (indentation, naming, commit message format), architectural constraints (no new dependencies, no public interface changes), and testing requirements (must pass lint and tests). This ensures consistent code style across sessions and reduces post-merge cleanup. Each worktree can have its own CLAUDE.md to further constrain that branch's scope.
:::

## #troubleshooting 11 / Troubleshooting :: 常见问题 || Troubleshooting

收集 Claw Code 使用过程中的常见问题及其解决方案。 || Common issues encountered when using Claw Code and their solutions.

:::accordion
::panel { open: true }
### API Key 未设置或无效 || API Key Not Set or Invalid
症状：启动后提示认证错误或 401 响应。 || Symptom: Authentication error or 401 response after launch.

解决：核对 ANTHROPIC_API_KEY 环境变量是否配置正确，或改用 claw login 走 OAuth 认证。检查 Key 是否已过期或被吊销；若启用了网络代理，需确认 ANTHROPIC_BASE_URL 指向正确的端点。 || Solution: Verify that the ANTHROPIC_API_KEY environment variable is set correctly, or run claw login for OAuth authentication. Check whether the key has expired or been revoked; if using a proxy, confirm ANTHROPIC_BASE_URL points to the right endpoint.

::panel
### 编译错误 || Build Errors
症状：cargo build --workspace 失败。 || Symptom: cargo build --workspace fails.

解决：确认 Rust 版本足够新（建议 stable 最新版）。尝试 rustup update 更新工具链。清理缓存后重试：cargo clean && cargo build --workspace。 || Solution: Ensure Rust version is recent enough (latest stable recommended). Try rustup update. Clear cache and retry: cargo clean && cargo build --workspace.

::panel
### 工具执行被拒绝 || Tool Execution Denied
症状：代理尝试写入文件或执行命令时被阻止。 || Symptom: Agent is blocked when trying to write files or execute commands.

解决：检查当前权限模式（/permissions）。如果在 read-only 模式下需要写入，使用 /permissions 或重启并指定 --permission-mode workspace-write。路径穿越检测触发时，确认操作目标在工作区目录内。 || Solution: Check current permission mode (/permissions). If you need writes in read-only mode, use /permissions or restart with --permission-mode workspace-write. When path traversal detection triggers, verify the target is within the workspace directory.

::panel
### 上下文窗口耗尽 || Context Window Exhausted
症状：代理响应变得不相关或提示 token 超限。 || Symptom: Agent responses become irrelevant or token limit exceeded.

解决：使用 /compact 压缩会话上下文，保留关键信息并释放空间。如果仍然不够，使用 /clear 清空历史重新开始。对于大型任务，建议拆分为多个独立的子会话。 || Solution: Use /compact to compress session context, retaining key info. If still insufficient, use /clear to start fresh. For large tasks, consider splitting into multiple independent sub-sessions.

::panel
### MCP 服务器连接失败 || MCP Server Connection Failure
症状：MCP 工具调用返回错误或超时。 || Symptom: MCP tool calls return errors or timeout.

解决：Claw Code 的 MCP 设计支持部分成功——其他 MCP 服务器和内置工具不受影响。检查目标服务器是否在运行、网络是否可达，以及认证凭证是否正确。 || Solution: Claw Code's MCP design supports partial success—other MCP servers and built-in tools are unaffected. Verify the target server is running, network is reachable, and auth credentials are correct.
:::

## #references 12 / References :: 参考来源 || References

- [1] illusion615/claw-code — https://github.com/illusion615/claw-code | Fork 仓库，本手册的主要参考源 || Fork repository, primary reference source for this manual
- [2] ultraworkers/claw-code — https://github.com/ultraworkers/claw-code | 上游主仓库，包含 README、PHILOSOPHY、PARITY、ROADMAP、USAGE 等文档 || Upstream main repository with README, PHILOSOPHY, PARITY, ROADMAP, USAGE documents
- [3] USAGE.md — https://github.com/illusion615/claw-code/blob/main/USAGE.md | 官方使用指南，覆盖 CLI 模式、模型控制、权限和 Slash 命令 || Official usage guide covering CLI modes, model controls, permissions, and slash commands
- [4] PHILOSOPHY.md — https://github.com/illusion615/claw-code/blob/main/PHILOSOPHY.md | 核心哲学文档：人类定方向，Claw 做执行 || Core philosophy document: humans set direction, claws execute
- [5] PARITY.md — https://github.com/illusion615/claw-code/blob/main/PARITY.md | 9-lane 对齐状态文档，包含 mock harness 覆盖详情 || 9-lane parity status with mock harness coverage details
- [6] ROADMAP.md — https://github.com/illusion615/claw-code/blob/main/ROADMAP.md | Clawable Coding Harness 演进路线，5 个阶段 + 7 个产品原则 || Clawable Coding Harness evolution roadmap, 5 phases + 7 product principles

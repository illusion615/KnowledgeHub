---
title: AI-MUD 项目回顾：产品级 Vibe Coding 实践
eyebrow: Product-Grade Vibe Coding
brand: AI Mud
date: 2026-04-09
strict_i18n: false
strict_density: true
lead: "AI-MUD Episode 1——\"魏晋风骨：士人志\"是一个由单人工作室（Boss + AI Copilot）开发的 AI 驱动交互叙事游戏。项目经历 156+ 轮正式迭代（C-01~C-156）、10 轮代码审查（R01-R10，覆盖 9 个维度 ABCD 分级）和 17 个架构决策。本文以工程数据为基础，记录该项目在 Vibe Coding 模式下达到产品级工程质量的具体路径。"
hero_actions:
  - "查看开发协议 | #protocol"
  - "查看经验教训 | #lessons"
panel_label: 核心理念
panel_title: Vibe Coding 的工程化条件
panel_desc: Vibe Coding（Karpathy, 2025）指以自然语言驱动编码的开发模式。本项目通过五道门禁、9 份轮次归档和 10 轮结构化审查将其约束为可产出产品级代码的工程流程。
metrics:
  - "迭代轮次 | 156+ | 正式记录的 C-01 至 C-156 轮"
  - "代码审查 | 10 轮 | R01-R10，覆盖 9 个维度 ABCD 分级"
  - "测试覆盖 | 464+ | director-api 464 pytest 用例 + voice-server 26 用例"
  - "源码总行数 | 150,642 | 统计 tools 下 py/js/css/html/sql/sh 源码"
  - "文档总数 | 1,331 | Git 跟踪的 Docs/ 与 Markdown 类文档"
  - "项目启动 | 2026-02-22 | 按 Git 首次提交日期统计"
  - "Git 提交 | 45 | 每次提交覆盖多轮迭代（平均约 3.5 轮/commit）"
style:
  accent: "#d4a83a"
---

## #what 01 / What Is AI-MUD :: 什么是 AI-MUD

:::insight-grid { cols: 2 }
::card 01
### 项目定义
AI-MUD Episode 1——"魏晋风骨：士人志"是一款 AI 驱动的多媒体交互叙事游戏。玩家通过文字指令与由 7 个 AI 角色组成的 Director 系统交互，系统实时生成叙事文本、场景插画（FLUX.1-schnell / Z-Image-Turbo MLX）和角色语音（IndexTTS2 Zero-Shot TTS），以魏晋时期（约 220–420 AD）为背景构建沉浸式剧情体验。

::card 02
### 核心机制
7 角色 Director 系统（Director / Storyteller / Writer / Supervisor / Artist / Composer / Consultant），Storyteller 与 Supervisor 双模型分离（ADR-09），三层记忆架构（Working Memory ≤50 轮 + Episodic Memory 跨场景事件线 + Semantic Memory pgvector RAG），场景驱动的章节推进，以及"风骨度"道德评分系统。

::card 03
### 技术栈
Director API（FastAPI, 206 端点, :9000）+ Image Server（:8090, 三引擎隔离）+ Voice Server（:8070, TTS + speaker registry）+ Ollama LLM Runtime（:11434）+ PostgreSQL + pgvector。前端为纯原生 JS（Player Portal + Director Studio），无框架。两阶段 Skill 编排器（54+ 注册技能，OrchestratorQueue 异步执行）。

::card 04
### 产品指标
设计目标：70% 首次会话完成率、≥80% 好评率、<1% 崩溃率、10–20 分钟会话时长。截至回顾时点，项目处于内部测试阶段，尚未进行大规模用户验证。
:::

Architecture

### 项目架构图

五层分离：UI 层（玩家入口 + 运营入口）、路由编排层（Director API 统一中枢）、能力服务层（Image / Voice / LLM）、状态持久化层（PostgreSQL + pgvector）、运行保障层（Watchdog + Service Manager）。

AI-MUD Episode 1 分层系统架构图

顶部是 UI Layer，包含 Player Portal 和 Director Studio。中间的 Routing and Orchestration Layer 由 Director API 组成。下层依次是能力服务层、状态持久化层和运行保障层，每个模块列出主要能力。

01

### UI Layer

玩家入口（Player Portal）和运营入口（Director Studio）均为浏览器端纯原生 JS 应用，不包含服务端渲染。

### Player Portal

Player UI

- 文字指令输入与对话反馈
- 场景推进、状态呈现、媒体播放
- 浏览器端沉浸式交互体验承载

Browser Runtime

### Director Studio

Ops UI

- 剧情与场景调试
- Prompt / 配置检查与回放
- 运营观察与人工干预入口

Authoring & Inspection

02

### Routing & Orchestration Layer

Director API 是系统唯一的 HTTP 入口（:9000），承载 206 个 API 端点和所有后端能力编排。UI 层和能力服务层均不直接互联。

### Director API

Routing Core

- HTTP 路由统一入口与会话治理
- Scene / Agent / Service Orchestration
- 对图像、语音、LLM、状态存储的统一调度

FastAPI · 206 API · :9000

03

### Capability Services Layer

Image Server（:8090）、Voice Server（:8070）和 LLM Runtime（Ollama :11434）三个独立服务进程，均由 Director API 通过 HTTP 调用编排，不接受外部直连。

### Image Server

Media

- 图像生成与插画代理下载
- 多后端切换与任务进度管理
- 统一封装 torch / mflux 系列服务

:8090 / :8098 / :8099

### Voice Server

Speech

- TTS 合成与 speaker registry
- 浏览器直连与 API 调用双入口
- 统一管理语音角色与输出能力

:8070

### LLM Runtime

Inference

- Ollama 文本生成能力
- 可选 llama-server 模型服务
- 承接叙事生成与推理调用

:11434 / :8080

04

### State & Persistence Layer

PostgreSQL + pgvector 承载项目状态、会话记忆、剧情上下文和向量检索索引。Director API 通过 RepositoryPort 抽象层访问，禁止其他服务直接读写。

### PostgreSQL + pgvector

Storage

- 项目状态、记忆与剧情上下文持久化
- 向量检索与缓存索引承载
- 为 Director API 提供统一状态读写基础

PG-only Persistence

05

### Reliability & Operations Layer

30 秒周期健康检查、PID 管理和自动重启机制，覆盖上述 5 个服务进程。

### Watchdog + Service Manager

Ops

- 30 秒健康检查与进程状态巡检
- PID 管理、自动重启、跨服务恢复
- 为多进程运行时提供最小可靠性兜底

Runtime Reliability

:::comparison
::versus Scale
### 项目规模
206 个 API 端点、22 个路由文件、80+ 后端文件、49+ 前端文件（33 JS + 14 CSS）、5 个独立服务进程。

截至 2026-04-09，仓库累计 150,642 行源码、1,331 份文档、45 次 Git 提交，首个提交日期为 2026-02-22。

::versus Team { highlight: true }
### 一人工作室
所有代码由一个人（Boss）和 AI Copilot 协作完成。没有团队分工，但有严格的角色分离——Boss 做决策和审核，AI 做分析和执行。
:::

## #protocol 02 / Product-Grade Vibe Coding Protocol :: 产品级 Vibe Coding 开发协议

:::accordion
::panel { open: true }
### 2.1 沟通协议
每条 Copilot 回复以"报告老板"开头、"下一步："结尾。Boss 使用触发词加载对应 Playbook：新需求 / Bug / 重构 / 调研。进度优先原则——触发词输入默认为分析→记录 TODO→按序执行。

::panel
### 2.2 五道门禁制度
Gate-0 轮次简报 + 需求对齐 → Gate-1 设计/测试计划/文档/架构审查 → Gate-3 测试通过后才能扩展范围 → Gate-4 对齐审查 + 测试报告 → Gate-D 数据变更专项审查。

::panel
### 2.3 轮次归档制度
每轮迭代要求 9 份文档：REQ-ALIGN, PLAN, DESIGN, TEST-PLAN, DOC-REVIEW, ARCH-REVIEW, ARCH-DESIGN, ALIGN-REVIEW, TEST-REPORT。零延迟归档——必须在代码完成的同一会话内完成。

::panel
### 2.4 禁止行为
不允许 fallback 掩盖错误、不允许静默异常吞噬、不允许硬编码提示词、不允许绕过 RepositoryPort、不允许并行复杂特性扩展、单问题最多 3 次连续修复尝试。
:::

## #iterations 03 / 156+ Iterations :: 156+ 轮迭代历程

Three Stages

### 三阶段演进

:::flow
1. **Stage A (C-01~C-38): 工具平台基础设施** — 搭建基本服务框架、数据库、前端骨架 ✅
2. **Stage B (C-39~C-151): 导演台核心能力** — 43 个里程碑组（B1-B43），涵盖角色系统、对话引擎、章节规划、试玩引擎、图像生成、语音合成、CSS 治理、PG 迁移、编排队列、RAG 记忆系统、MLX 图像引擎、Agentic 架构
3. **Stage C (C-153+): Agent 统一分派中心** — Skill 驱动的两阶段对话编排、任务队列持久化
:::

Key Milestones

### 关键里程碑

- **C-39** — 产品方向重新定义（从 Godot 转向 Web）
- **C-80** — 试玩引擎重构（双模型分离、场景切换）
- **C-84** — RAG 源文档系统
- **C-121~C-127** — MLX 图像引擎（自建 FLUX 管线 + Z-Image-Turbo）
- **C-128** — ReAct 原子工具 Agent 架构
- **C-153** — Skill 驱动两阶段 Agent 编排器

## #metrics 04 / 03B / Engineering Metrics :: 工程绩效趋势

以下数据基于 AI-MUD 仓库 45 次 Git 提交的 `git log --numstat` 统计，按周聚合。纵轴为净增行数（insertions − deletions），不包含 .venv 和 node_modules。

0

80K

160K

240K

320K

W08

W12

W13

W14

Stage A

Stage B (bulk)

B→C transition

Image+Docs

累计代码量 (净增行数) 与各语言占比

C-138 bulk: +229K

Python (累计)

JavaScript

Test 代码

文档

| 周期 | 阶段 | 提交数 | 净增行数 | Python | JavaScript | 测试代码 | 文档 (MD) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W08 (2/22–2/26) | Stage A 基础设施 | 4 | +80,011 | 24,030 | 19,537 | 7,488 | 28,498 |
| W12 (3/24) | Stage B 导演台核心 | 1 | +211,190 | 48,914 | 31,725 | 18,121 | 30,996 |
| W13 (3/29–3/31) | B→C: LLM 重构 + Skill 编排 | 34 | +27,233 | 13,159 | 4,895 | 1,103 | 8,180 |
| W14 (4/3–4/9) | Image Server + 文档补齐 | 6 | +9,912 | 2,330 | 1,970 | 0 | 4,930 |
| **合计** | **45** | **+328,346** | **88,433** | **58,127** | **26,712** | **72,604** |   |

:::comparison
::versus Productivity Pattern
### 生产力特征
- **W12 集中交付** — 单次提交 +229K 行覆盖 C-138 ~C-151 共 13 轮迭代，含 async post-processing、perf diagnostics、memory system restructure 等。这种 bulk commit 模式是单人工作室 + AI Copilot 的典型节奏。
- **W13 高频精细提交** — 34 次提交集中在 LLM Client 重构（ADR-14/15）和 C-153 Skill 编排器的 4 批次实现上，平均每次提交 +801 行。
- **测试/代码比** — 测试代码占总产出的 8.1%（26,712 / 328,346）。director-api 测试文件当前 40 个、约 16,140 行。

::versus Quality Indicators { highlight: true }
### 质量指标变化
- **文档/代码比** — 文档产出占总行数 22.1%（72,604 / 328,346），超过了 JavaScript 产出。68 份轮次归档（Round SUMMARY.md）。
- **W13 重构密度** — W13 的 Python 净增中，约 40%（~5,200 行）为 LLM Client Provider 抽象层重构和 Skill 框架代码。删除量 5,078 行，证明在做结构压缩而非单纯堆叠。
- **W14 测试缺口** — W14 的 Image Server 扩展 +9,912 行中测试增量为 0，是后续应优先补测的模块。
:::

## #review 04 / Code Review Practice :: 代码审查实践

10 轮代码审查（R01-R10，部分轮次拆为多次审查），触发条件：每 5 轮迭代 / 阶段转换 / 单文件超 500 行（后端）或 2000 行（前端）/ Boss 要求。

:::comparison
::versus Dimensions
### 9 维度审查
架构一致性、重复代码、命名可读性、错误处理、可测试性、性能、安全性、设计系统合规、文档健康。每个维度 ABCD 分级，任何 D 级 = 立即停止特性开发。

::versus Impact { highlight: true }
### 审查的价值
R01-R10 审查中发现的问题推动了 llm_client.py 从 1905 行重构到 995 行（-48%）、CSS 治理体系建立、前端 ES Module 规范化、数据库访问层抽象等关键改进。
:::

## #lessons 05 / Lessons Learned :: 经验与教训

- **Gate-1 设计审查在 C-80、C-128 等大型重构中拦截了架构漂移** — 例如 C-80 试玩引擎重构在 Gate-1 阶段识别出双模型分离需求，避免了先实现再拆分的返工路径。
- **C-153 文档断裂事件：7 个实体变更未同步文档，导致后续 2 轮专项修复** — 该事件直接催生了 Gate-D 数据变更专项审查，将数据文档更新设为代码提交的前置条件。
- **AI Copilot 在无约束下倾向于过度工程化** — 早期迭代中 AI 自行引入多层抽象和未请求的重构，导致代码复杂度膨胀。触发词（新需求/Bug/重构/调研）+ Playbook 机制将 AI 限定在单一执行模式内，减少无关改动。
- **单人工作室的注意力分散通过流程约束控制** — 进度优先原则（触发词输入默认为分析→TODO→按序执行）和禁止并行复杂特性扩展规则，将每轮迭代限制在单一目标上。
- **周期性代码审查替代了外部审查者** — R01-R10 审查按 9 维度 ABCD 分级，累计触发了 llm_client 重构（-48%）、CSS 治理体系建立等架构级改进。
- **每次 git commit 前必须通过全量测试** — director-api 464 pytest 用例 + voice-server 26 用例，commit 前 CI 必须全绿。该规则在 C-80 重构中拦截了 3 处回归。
- **Gate-D 数据变更审查的起源** — C-153 中 7 个实体（conversation、entity_versions 等）变更未经审查直接编码，事后产生 2 轮专项修复。Gate-D 要求数据结构变更必须先更新 Docs/Dev-Notes/data/ 下的领域文档，再编码。
- **Vibe Coding 的"vibe"是方向感，不是随意性** — 用自然语言驱动开发是效率工具，但必须配合工程纪律。

## #start 06 / Start Your Own Vibe Coding Project :: 如何启动你自己的产品级 Vibe Coding 项目

:::comparison
::versus Checklist
### 启动清单
1. **定义沟通协议** — 建立 Boss ↔ AI 的对话格式、触发词和 Playbook
2. **建立门禁制度** — 至少 Gate-0（需求对齐）和 Gate-3（测试通过）
3. **建立归档制度** — 每轮迭代必须有可追溯的决策记录
4. **设定禁止行为** — 从第一天就定义 AI 的行为边界
5. **启动代码审查节奏** — 每 5 轮或每阶段一次结构化审查

::versus Maturity Signals { highlight: true }
### 成熟度信号
- 每轮迭代有完整的 9 份归档文档
- 测试覆盖率持续增长
- 代码审查未发现 D 级问题
- 文档与代码同步率 100%
- AI Copilot 首次输出采纳率 >70%
:::

## #references 08 / References :: 参考来源

- [1] A. Karpathy. — https://x.com/karpathy/status/1886192184808149383 | Vibe Coding 概念的首次提出：以自然语言描述需求、让 LLM 生成代码的开发模式。本文的标题和核心概念源自此定义。
- [2] Knowledge Hub. | C-121~C-127 MLX 图像引擎里程碑的详细工程复盘，包含 FLUX.1-schnell 基座、4-bit 量化和分阶段内存释放等技术细节。
- [3] Knowledge Hub. | R06 审查触发的 llm_client 重构（1905→995 行）的详细技术记录，包含三层架构设计和运行时控制面。
- [4] Knowledge Hub. | C-153 Skill 驱动两阶段 Agent 编排器的架构设计细节。

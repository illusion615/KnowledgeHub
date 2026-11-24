---
title: 智能体技能执行架构设计实践
eyebrow: Agentic Skill Execution Blueprint
brand: AI Mud
date: 2026-04-09
strict_i18n: false
strict_density: true
lead: 在 AI-MUD Episode 1 项目中，我们构建了一个由 7 个 AI 角色组成的智能体编排系统——导演台（Director System）。本文记录了从同步工具调用到两阶段异步 Skill 编排的架构演进过程，以及在生产级场景下对 Agent 行为控制、记忆管理和角色分派的设计实践。
hero_actions:
  - "查看架构演进 | #evolution"
  - "查看技能注册 | #registry"
panel_label: 核心架构
panel_title: 两阶段对话架构
panel_desc: 理解阶段只开放读取工具，提交阶段通过 submit_task_plan 异步分派，执行阶段由领域专家角色完成。
panel:
  - 理解阶段 — 仅暴露 read 类工具 + submit_task_plan
  - 提交阶段 — 验证任务计划并入队 orch_queue
  - 执行阶段 — 领域专家角色异步完成任务
metrics:
  - "注册技能 | 54+ | 覆盖 read/write/generate 三类操作"
  - "架构决策 | 17 ADR | 从 ReAct 到两阶段 Skill 编排"
  - "AI 角色 | 7 | Director, Writer, Storyteller, Supervisor, Artist, Composer, Consultant"
style:
  accent: "#e8c34a"
---

## #overview 01 / Director System Overview :: 导演台系统概述

:::insight-grid { cols: 2 }
::card 01
### 定义
导演台是 AI 驱动的对话式游戏设计工作台。一个人 + AI 七人团队 = 完整的游戏叙事设计团队。

::card 02
### 角色体系
7 个 AI 角色各司其职——Director 理解意图、Writer 编写内容、Storyteller 驱动叙事、Supervisor 审核质量、Artist 生成图像、Composer 编曲、Consultant 检索知识。

::card 03
### 设计边界
导演台是设计工具而非脚本组装工具。人类给出指令、审核输出、批准结果；AI 团队负责详细生产。

::card 04
### 技术栈
FastAPI Python 后端 + 原生 JS 前端，206 个 API 端点，49+ 原子工具，PostgreSQL + pgvector。
:::

## #evolution 02 / Architecture Evolution :: 架构演进：从同步到两阶段异步

:::accordion
::panel { open: true }
### 2.1 Phase I — 同步意图-规划-执行
早期架构。意图分类 → 结构化计划 → 阻塞执行。简单直接，但随着工具数量增长，上下文窗口成为瓶颈，且用户必须等待整个执行完成。

::panel
### 2.2 Phase II — ReAct 循环 + 原子工具 (C-128, ADR-01)
DirectorAgent.run() 使用 ReAct（推理-行动）循环，配合 49 个原子工具执行同步 CRUD 操作。每轮推理后选择工具调用，直到任务完成。解决了灵活性问题，但仍然是同步阻塞。

::panel
### 2.3 Phase III — 两阶段对话架构 (C-153, ADR-17)
当前成熟设计。理解阶段仅暴露 read 类工具 + submit_task_plan 函数，LLM 物理上无法调用写入/生成工具。提交阶段通过函数调用提交任务计划，后端验证并入队后立即返回，解锁聊天界面。用户可以继续对话而不必等待执行完成。
:::

:::comparison
::versus Understand Phase
### 理解阶段
Schema 过滤 _build_skill_tool_schemas(categories={"read"}) 确保 LLM 物理上无法调用写入工具。只能阅读项目状态、提问澄清、构建理解。

::versus Execution Phase { highlight: true }
### 执行阶段
submit_task_plan({skills, reasoning}) 提交后，_auto_split_bulk_skills() 展开批量操作为逐实体任务，全部入队 orch_queue。对话流立即返回 agent_done，用户继续使用不受阻。
:::

## #registry 03 / Skill Registry And Dispatch :: 技能注册与分派机制

SkillRegistry 管理 54+ 技能的元数据。每个技能通过声明式配置定义其类别、执行角色、上下文需求和容错参数。

:::comparison
::versus Skill Metadata
### 技能元数据字段
| 字段 | 说明 | 示例 |
| --- | --- | --- |
| category | read/write/generate | generate |
| executor_role | 执行该技能的 AI 角色 | writer |
| context_prompt_key | 角色专属的提示模板 | narrative_rules_context |
| auto_execute | 是否自动执行 | true |
| confidence_threshold | 最低置信度 | 0.7 |
| timeout_s | 超时时间 | 600 |
| depends_on | 前置依赖 | [scene_read] |
| merge_strategy | 合并策略 | replace / highest_confidence / append |

::versus Role Dispatch (ADR-16) { highlight: true }
### 三层角色分派
1. **Intent Layer — Director 理解意图** — Director 角色仅负责理解用户的自然语言指令，构建结构化的任务计划。不执行任何写入或生成操作。
2. **Dispatch Layer — orch_queue 分派** — 任务计划通过 submit_task_plan 提交后，orch_queue 根据技能元数据中的 executor_role 将任务路由到对应的领域专家。
3. **Execution Layer — 领域专家角色执行** — Writer、Storyteller、Artist 等角色在各自的上下文中独立执行被分派的技能，结果异步返回。
:::

## #queue 04 / Orchestrator Queue :: 编排队列与容错机制

OrchestratorQueue 是两阶段架构的执行引擎，负责任务的并行调度、去重、超时和熔断。

OrchestratorQueue Features

### 编排队列核心能力

:::flow
1. **ThreadPoolExecutor(3 workers)** — 并行执行能力
2. **Per-conversation queues** — 会话级隔离
3. **Dedup by tool_key** — 相同技能去重，支持 replace/highest_confidence/append 合并策略
4. **Per-task timeout (600s)** — 防止僵死任务
5. **Circuit breaker per model** — 模型级熔断器
6. **Dual Semaphore (global=10, per-model=6)** — 防止单模型饥饿
7. **PG advisory lock** — 项目写入串行化
:::

## #memory 05 / Memory Architecture :: 三层记忆架构

:::comparison
::versus Three-Layer Memory
### 三层记忆模型
- **Working Memory（短期）** — 当前场景的消息窗口，≤50 轮 / ≤64K tokens，场景切换时重置
- **Episodic Memory（中期）** — 场景总结、跨场景事件线、关系变化。存储在 episodic_memories 表中
- **Semantic Memory（长期）** — 世界知识、角色传记、规则。使用 pgvector 余弦相似度搜索

::versus RAG Injection { highlight: true }
### RAG 注入模式
Storyteller 通过函数调用动态检索知识，按以下顺序注入系统提示：

1. **[长期知识] Semantic Memory** — 世界观设定、角色传记、游戏规则等持久知识
2. **[中期回忆] Episodic Memory** — 之前场景的事件总结、NPC 关系变化、剧情线索
3. **[短期对话] Working Memory** — 当前场景的对话窗口和即时上下文
:::

## #adr 06 / Key Architecture Decisions :: 关键架构决策（ADR 精选）

- **ADR-01** — ReAct-only 架构（后在 C-153 演进为两阶段）
- **ADR-03** — PromptRegistry — DB 是唯一运行时真相源；Markdown 模板仅用于种子/重置
- **ADR-09** — 双模型分离 — storyteller 负责纯叙事，supervisor/writer 负责结构化数据提取
- **ADR-10** — call_role_model() 作为唯一 LLM 调用入口，强制角色消毒
- **ADR-14** — LLM Provider 抽象 — Protocol + 注册表分派（Ollama, OpenAI-compat, Azure）
- **ADR-16** — 角色分派 — 内容类写入技能声明 executor_role，Director 只理解意图不执行
- **ADR-17** — 两阶段对话 — 理解 → submit_task_plan → 异步执行
- **Data-Skill 单一真相源** — 每个数据实体有且仅有一个权威存储和对应的 READ/WRITE Skills

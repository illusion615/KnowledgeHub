---
title: "导演台智能体引擎替换：低风险重构专项记录 || DirectorStudio Agent Engine Replacement: A Low-Risk Refactoring Study"
eyebrow: "开发专项 · 持续更新 || Engineering Study · Living Record"
brand: AI Mud
date: 2026-09-23
strict_i18n: true
strict_density: true
lead: "用 Pi 嵌入式运行时探索导演台核心替换：保留业务资产，定义行为契约，通过同条件对照决定采用、部分采用或停止。记录想法、设计、验证门和当前进度，为项目回顾保留可追溯依据。 || Explore Pi embedding as a replacement for DirectorStudio's agent runtime. Preserve domain assets, define behavioral contracts, and use controlled comparisons to decide whether to adopt, partially adopt, or stop. Record the design, validation gates, and progress for later project review."
hero_actions:
  - "查看替换边界 || Review the Boundary | #architecture"
  - "查看进度与结果 || Check Progress and Results | #progress"
panel_label: "当前结论 || Current Conclusion"
panel_title: "设计已形成，替换收益仍需验证 || Design Defined; Benefits Remain Unproven"
panel:
  - "保留 UI、业务 Skill 与数据权威。 || Retain the UI, domain Skills, and data authority."
  - "设计用Pi；游戏不依赖Pi。 || Pi for authoring; gameplay remains independent."
  - "安全失败即停止，不强求迁移。 || Stop on safety failures; migration is optional."
metrics:
  - "Pi评估版本 || Pi Review Version | 0.86.0 | 以本机匹配文档与接口为准 || Based on matching installed docs and APIs"
  - "计划应用容器 || Planned Application Containers | 3 | PG / API（Python＋Node）/ Portal || PG / API (Python + Node) / Portal"
  - "引擎A/B任务实测 || Measured Engine A/B Tasks | 0 | 尚未运行mock或真实模型对照 || No mock or real-model comparison run"
style:
  accent: "#18b7ab"
---

## #scope 01 / Objectives :: 先验证前台导演循环的替换价值 || Validate the Foreground Director Loop First

本课题记录复杂项目核心部件替换的开发过程：提出方案、验证行为、控制迁移范围，并保留最终采用或放弃的依据。当前阶段为设计与验证准备，尚未实施引擎替换。 || This living engineering study records the proposal, behavior checks, migration boundaries, and eventual adoption or rejection of a core-component replacement. It is currently in design and validation planning; no engine has been replaced.

### 业务范围与课题边界 || Business Scope and Study Boundaries

用户反馈此前自研智能体中台未达到预期；原架构文章仍提供了可保留的业务设计。[1] 本课题不以该反馈推导失败率，也不预设 Pi 必然优于自研。 || The project owner reports that the earlier custom agent platform did not meet expectations. Its architecture article still documents reusable domain design.[1] That feedback does not establish a failure rate or prove that Pi will outperform the existing engine.

:::comparison
::versus 方案 1 || Option 1
### 首个切口 || Initial Replacement Boundary
替换 `DirectorAgent.run()` 的模型—工具循环，继续使用现有 Web UI、项目实体、Skill 与数据接口。 || Replace the model–tool loop in `DirectorAgent.run()`, retaining the Web UI, project entities, Skills, and data interfaces.

::versus 方案 2 || Option 2
### 本轮不替换 || Outside This Phase
Pi只用于设计时；游戏保留专用运行链路，Jev＋LLM快路径另行评测。后台队列、试玩结算和媒体服务不随本轮迁移。 || Pi is authoring-only. Gameplay keeps its dedicated runtime, with Jev-plus-LLM fast paths evaluated separately. Background queues, playtest settlement, and media services are not migrated in this phase.
:::

### 质量、效率与有效退出 || Quality, Efficiency, and Valid Exit Outcomes

低风险是可检查的约束：旧业务行为必须保留，新增维护成本必须可见，未证实收益时允许停止。 || Low risk is a testable constraint: preserve existing behavior, expose new maintenance costs, and allow the study to stop when benefits remain unproven.

| 目标 || Objective | 观察项 || Observable | 不接受的替代指标 || Insufficient Proxy |
| --- | --- | --- |
| 业务质量 || Domain Quality | 正确工具与参数、目标实体、授权和不重复写 || Correct tools, arguments, entity scope, authorization, and no duplicate writes | 历史单测数或生成代码量 || Historical test counts or generated code volume |
| 交互与任务效率 || Interaction and Task Efficiency | 首段文本、入队确认、最终业务完成、轮次与 tokens || First visible text, plan acknowledgement, business completion, model turns, and tokens | 仅比较框架名称或单次 mock 耗时 || Framework names or one mock timing |
| 工程效率 || Engineering Efficiency | 接入、升级、调试和回滚的实际工时 || Actual integration, upgrade, debugging, and rollback effort | 只统计删除了多少行代码 || Only counting deleted lines |

零越权、零重复写是拟议验收要求，不是已获得的成绩。保留自研、只采用部分适配能力、停止试点都是允许的结论。 || Zero unauthorized or duplicate writes is a proposed acceptance requirement, not a measured result. Retaining the current engine, adopting selected adapters, and stopping the pilot are all valid outcomes.

## #baseline 02 / Design and Baseline :: 保留两阶段业务架构，重新核对实现保障 || Retain the Two-Phase Domain Design and Recheck Its Guarantees

旧文记录了从同步执行到 ReAct 再到异步 Skill 编排的演进。[1] ReAct 在此指模型选择工具、观察结果并继续响应的循环；本课题沿用这一行为，不把旧文的设计承诺直接当作当前验收结果。 || The earlier article traces the move from synchronous execution through ReAct to asynchronous Skill orchestration.[1] Here, ReAct denotes a loop in which the model selects tools, observes results, and continues. This behavior remains; historical design commitments are not treated as current acceptance results.

### 值得保留的业务资产 || Domain Assets Worth Retaining

原方案把意图理解、任务分派和领域生产拆开；这些业务职责不会因采用 Pi 而消失。[1][2] || The original design separates intent understanding, task dispatch, and domain production. Adopting Pi does not remove those responsibilities.[1][2]

| 资产 || Asset | 保留原因 || Reason to Retain | 迁移约束 || Migration Constraint |
| --- | --- | --- |
| Read + submit_task_plan | 聊天与长任务解耦 || Decouple conversation from long-running work | 理解阶段不直接开放 write/generate || Do not expose write/generate directly during understanding |
| SkillRegistry / SkillRuntime | 保存领域参数、执行角色和数据副作用 || Preserve domain arguments, executor roles, and side effects | 一份注册源，不另写 TS 业务实现 || Keep one registry; do not duplicate domain implementations in TS |
| RepositoryPort / 项目选角 || RepositoryPort / Project Model Assignment | 保存权威数据与角色模型映射 || Own authoritative data and role-to-model assignments | 新引擎不得绕过存储、授权或模型治理 || The new engine must not bypass storage, authorization, or model governance |

旧文的 54+ Skill、17 ADR 与 7 角色是历史描述；本文不把它们重新发布为当前规模或质量指标。[1] || The earlier counts of 54+ Skills, 17 ADRs, and 7 roles are historical descriptions, not updated scale or quality metrics.[1]

### 设计承诺与代码观察的差距 || Gaps Between Design Commitments and Code

本轮以 HEAD `5e3c5ec` 加 main 未提交工作为磁盘基线，未查询生产数据库或证明线上已加载全部改动。[3] || The filesystem baseline is HEAD `5e3c5ec` plus uncommitted main changes. No production database was queried, and this does not prove that every change is loaded in the running service.[3]

| 旧文或界面印象 || Design or UI Impression | 本轮代码观察 || Code Observation | 设计影响 || Design Consequence |
| --- | --- | --- |
| 提交后立即解锁 || Immediate Release after Submission | 计划后仍有模型确认；SSE done 前同步更新 Memo || A model confirmation follows submission; Memo updates synchronously before SSE done | 区分入队、聊天结束与任务完成 || Separate plan acceptance, chat completion, and business completion |
| Schema 过滤阻止写工具 || Schema Filtering Prevents Writes | 执行路径仍需拒绝白名单外调用 || Execution must still reject calls outside the allowlist | 模型输入约束不能代替服务器授权 || Model-facing constraints cannot replace server authorization |
| SSE 就是逐 token 输出 || SSE Means Token Streaming | 导演 loop 调用默认非流式模型接口 || The director loop calls the non-streaming model path | 更换 loop 和改流式传输分别验证 || Validate loop replacement and streaming transport separately |

以上是静态发现，不是已复现的线上故障统计。旧文章未完整记录前次尝试的失败原因；仍需用真实、脱敏的业务案例核对。[1][3] || These are static findings, not production failure statistics. The earlier article does not establish a complete causal account of the unsuccessful attempt; realistic, sanitized task cases are still needed.[1][3]

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 不能忽略 main 已有的改进 || Account for Existing Main-Branch Improvements
提示词精简、默认历史 5→2 轮、Skill 参数提示、计数器调整与局部 upsert 已纳入比较；C-158 仍是旁路辅助判定。[3] || The comparison includes shorter prompts, a default history window reduced from 5 to 2 rounds, Skill argument hints, revised counters, and local upserts. C-158 remains an advisory side path.[3]

- 动态 profile 已有代码，但静态路径检查发现加载目录与实际目录不一致；不能算作已生效，也未在本课题修复。 || Dynamic profiles exist in code, but a static path check found a mismatch between the loader and actual directory. They are not assumed active and were not fixed here.
- PromptRegistry 的运行时来源是 PG；模板文件字符减少不等于生产输入 tokens 已减少。现有连接池也已经存在。 || PG supplies runtime prompts through PromptRegistry. Fewer characters in a template file do not prove lower production input tokens. Connection pooling already exists.
- 现有跨轮历史只取 role/content，精简 tool_events 不是完整工具调用记录。导演 Memo 与试玩三层记忆不可混为一套会话。 || Cross-turn history currently uses role/content; compact tool_events are not a complete tool transcript. The director Memo and three-layer playtest memory are distinct consumers.
:::

## #options 03 / Options :: 按替换深度选择 Pi，并保留其他路线 || Choose Pi by Replacement Depth and Keep Alternatives Open

嵌入使用指通过编程接口调用 Agent 运行时，无需终端界面。Pi core 与完整 AgentSession SDK 都可嵌入 Node，承担的会话职责不同；本轮 0.86.0 包采用 MIT 许可，coding-agent 声明 Node≥22.19.0。[4][5] || Embedding calls the agent runtime through a programming interface without a terminal UI. Pi core and the full AgentSession SDK embed in Node but assume different session responsibilities. The reviewed 0.86.0 packages use MIT licenses; coding-agent requires Node≥22.19.0.[4][5]

### 先确定循环与会话的接管范围 || Choose Loop and Session Ownership First

首个对照选择 Pi core 的最小切口；如果明确需要自动压缩和树形会话，再验证完整 SDK，避免重复实现确实需要的现成功能。 || The initial comparison uses the smaller Pi core boundary. If automatic compaction and tree-shaped sessions become requirements, evaluate the full SDK rather than rebuilding useful existing capabilities.

| 路线 || Route | 承接职责 || Responsibilities | 额外工作 || Additional Work |
| --- | --- | --- |
| 改进自研 || Improve the Current Engine | 现有 Python loop 与业务兼容 || Existing Python loop and domain compatibility | 自行维护工具流、上下文与取消 || Maintain tool streaming, context, and cancellation |
| Pi core + ai 0.86.0 | 循环、工具、事件；模型层可独立选用 [4] || Loop, tools, and events; the model layer can be selected separately [4] | Python↔Node 桥接；持久化和摘要策略由宿主管理 || Python–Node bridge; host-owned persistence and summary policy |
| Pi AgentSession 0.86.0 | 会话树、压缩、重试、资源加载 [5][6] || Session tree, compaction, retries, and resource loading [5][6] | 受控资源加载器、PG 会话桥接、避免双重摘要 || Controlled resource loader, PG session bridge, and no duplicate summarization |

Pi 的 `SKILL.md` 是按需加载的说明；导演台 SkillDefinition 带执行器、权限及副作用。二者不能通过复制目录直接互换。[1][5] || A Pi `SKILL.md` provides on-demand instructions; a DirectorStudio SkillDefinition includes an executor, permissions, and side effects. Copying directories does not make them interchangeable.[1][5]

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### Python 候选与依赖成本 || Python Alternatives and Dependency Costs
这些版本仅代表本轮核查基线，不表示永久最新；支持 Python 也不代表可以原样装进导演台现有环境。[9][10][11] || These versions identify this review, not a permanent latest release. Python support does not imply compatibility with the current DirectorStudio environment.[9][10][11]

| 候选 / 许可 || Candidate / License | 适用价值 || Potential Fit | 已知限制 || Known Limit |
| --- | --- | --- |
| PydanticAI 2.47.0 / MIT | 类型化工具、依赖注入、延迟工具结果 [9] || Typed tools, dependency injection, and deferred tool results [9] | 核心要求 Pydantic≥2.12，现有 pin 为2.11.7；slim也需升级 || Core requires Pydantic≥2.12; current pin is 2.11.7. Slim still requires an upgrade |
| LangGraph 1.2.12 / MIT | 显式状态图与 checkpoint；适合复杂暂停/恢复 [10] || Explicit state graphs and checkpoints for complex pause/resume flows [10] | 状态持久化与业务事务仍需协调；暂不迁移队列 || Checkpoint and domain transactions still need coordination; queue migration is deferred |
| OpenAI Agents 0.22.3 / MIT | Python Runner、Session 与人工审批；可接非OpenAI模型 [11] || Python Runner, Sessions, and approvals; supports non-OpenAI models [11] | Pydantic≥2.12.2及Starlette≥1.3.1与现有依赖冲突；默认trace需处理 || Pydantic≥2.12.2 and Starlette≥1.3.1 conflict with current dependencies; default tracing needs control |

PydanticAI 完整包的 web extra 同样要求 Starlette≥1.3.1；FastAPI 0.116.1 要求 Starlette<0.48。优先在隔离环境验证 slim，禁止修改共享虚拟环境试装。[9][12] || The full PydanticAI package includes a web extra requiring Starlette≥1.3.1, while FastAPI 0.116.1 requires Starlette<0.48. Evaluate slim in isolation; do not experiment by changing the shared environment.[9][12]

::panel
### Miyo 作为上下文组件单列 || Treat Miyo as a Context Component
Miyo 0.2.28 是本地上下文产品，可通过 CLI 和远程 MCP 向外部 agent 提供资料；没有据此确认可替换循环的公开 SDK。[13] || Miyo 0.2.28 is a local context product exposing material to external agents through its CLI and remote MCP. These interfaces do not establish a public replacement SDK for the agent loop.[13]

- 官方入门页仍介绍 stdio MCP，但发布库当前 Skill 标注该命令 deprecated；本地 HTTP API 文档明确没有认证。[13] || The getting-started page still describes stdio MCP, but the current published Skill marks that command deprecated. The local HTTP API is documented as unauthenticated.[13]
- 可选用途是 KnowledgeService 的只读检索补充；--path 是筛选条件，不是项目授权。独立 parse 可读任意路径，需宿主限制。 || A possible role is read-only retrieval behind KnowledgeService. --path is a filter, not project authorization. Standalone parse accepts arbitrary paths and needs host restrictions.
- 连接插件的 MIT 不覆盖桌面产品的分发权限；产品条款限制分发和再许可。本课题暂不安装或接入 Miyo。[14] || The connector MIT license does not grant desktop redistribution rights; product terms restrict distribution and sublicensing. This study does not install or integrate Miyo.[14]
:::

## #architecture 04 / Logical Boundaries :: Pi 执行循环，Python 保留业务决策与数据权限 || Pi Runs the Loop; Python Retains Domain and Data Authority

目标设计复用现有业务能力，仅新增适配边界。图中的 EngineAdapter、PlanGateway 和 ModelGateway 是本项目拟议组件名，不是 Pi SDK 已提供的业务服务。 || The proposed design reuses domain capabilities and adds an adapter boundary. EngineAdapter, PlanGateway, and ModelGateway in the diagram are proposed project components, not domain services supplied by Pi.

:::diagram { src: "./media/before-after", drawio: "./media/before-after.drawio", title: "Before / After：替换循环，保留业务 || Before / After: Replace the Loop, Retain the Domain" }
仅对比设计链路：左列自研，右列为API容器内Node/Pi的阶段A提案。游戏不经Pi。箭头表示委托或数据访问，不是工具/队列/模型的串行步骤；小屏横滑或点图放大。[3][4] || Authoring path only: current custom code on the left, proposed stage-A Node/Pi inside the API container on the right. Gameplay bypasses Pi. Arrows show delegation or data access, not serial tool/queue/model steps. Swipe or click to enlarge.[3][4]
:::

### 对比图中的三类变更 || Three Types of Change in the Comparison

| 变更类型 || Change Type | 具体内容 || Specific Scope | 边界与代价 || Boundary and Cost |
| --- | --- | --- |
| 替换 || Replace | DirectorAgent的通用模型—工具循环交给Pi core。 || Move the generic model–tool loop from DirectorAgent to Pi core. | 业务策略、预算与退出规则仍要适配；不是把整个Python模块直接删除。 || Domain policy, budgets, and stop rules still need adaptation; this does not simply delete the entire Python module. |
| 新增 || Add | EngineAdapter、API容器内的Node进程、受控工具/模型桥接。 || EngineAdapter, a Node process inside the API container, and controlled tool/model bridges. | 新增跨进程通信、身份校验和生命周期管理；不能把这些成本归零。 || Adds cross-process communication, authentication, and lifecycle management; these are not free. |
| 保留 || Retain | UI/API、Skill、队列、项目选角与模型治理、RepositoryPort/PG。 || UI/API, Skills, queue, project model assignment and governance, and RepositoryPort/PG. | 阶段A保留会话历史与Memo；试玩、结算和媒体服务不迁移，既有队列风险也不会自动消失。 || Stage A retains history and Memo. Playtest, settlement, and media services stay unchanged; existing queue risks do not disappear automatically. |

### 职责边界图 || Responsibility Boundaries

调用经过宿主验证后才能执行；Pi 不获得数据库、任意文件系统或生产 shell 的访问能力。 || The host validates calls before execution. Pi receives no database access, arbitrary filesystem access, or production shell capability.

:::diagram { src: "./media/ownership", drawio: "./media/ownership.drawio" }
小屏可左右滑动；点图查看大图。 拟议职责视图；箭头表示调用方向，返回结果沿对应请求返回。未部署。 || Swipe horizontally on small screens; click the diagram for a larger view. Proposed ownership view. Arrows show calls; results return to the corresponding request. Not deployed.
:::

### 一份注册源与版本化输入 || One Registry and Versioned Inputs

SkillRegistry 输出本次运行的工具清单，Node 为它生成 AgentTool 包装；业务执行器仍留在 Python，避免维护两份能力注册表。 || SkillRegistry exports the run-specific tool manifest, and Node creates AgentTool wrappers. Executors stay in Python, avoiding a second domain registry.

| 契约 || Contract | 关键字段 || Key Fields | 校验规则 || Validation Rule |
| --- | --- | --- |
| 运行输入 || Run Input | `run_id / project_id / conversation_id / deadline` | 由已认证请求解析，不接受模型覆盖项目 || Derive from an authenticated request; the model cannot override the project |
| 配置快照 || Configuration Snapshot | `prompt_version / toolset_hash / model_route_revision / memo_version` | 运行内冻结；换模型只影响后续run || Freeze during a run; model changes affect subsequent runs |
| 工具清单 || Tool Manifest | `name / category / schema / side_effects` | 只开放read＋plan；批准规则在服务器保存 || Expose read and plan only; keep approval policy on the server |

运行预算另带 max_turns、max_tool_calls、token_budget 与 retry_policy；宿主在每轮和工具执行前检查。JSON Schema 转换不得静默改变 required、默认值和额外字段；无法映射时在模型请求前明确失败。 || Run limits also include max_turns, max_tool_calls, token_budget, and retry_policy, checked by the host at turn and tool boundaries. JSON Schema conversion must preserve required fields, defaults, and extra-field rules; unsupported mappings fail before a model request.

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 完整 SDK 的资源加载边界 || Resource Loading with the Full SDK
AgentSession SDK 支持自定义工具、资源加载器和内存会话；默认资源发现与编码工具需要显式收窄。[5][7] || The AgentSession SDK supports custom tools, resource loaders, and in-memory sessions. Default resource discovery and coding tools must be restricted explicitly.[5][7]

- 只注册经批准的业务工具；不把默认 read/bash/edit/write 交给导演。禁止自动读取宿主 HOME 中的扩展、Skill 和凭据。 || Register approved domain tools only. Do not grant the director the default read/bash/edit/write tools or discover extensions, Skills, and credentials from the host HOME.
- PromptRegistry 仍提供业务提示词；Pi 不另维护一套角色规则。发现模型不可用时明确报错，不自动换模型。 || PromptRegistry remains the source of domain prompts. Pi does not own a second set of role rules. Unavailable models fail explicitly instead of triggering silent model substitution.
- Pi 扩展运行在宿主权限下，并不是沙箱；进程隔离、出网控制与业务授权仍须由平台提供。[7] || Pi extensions run with host privileges, not inside a built-in sandbox. Process isolation, egress control, and domain authorization remain platform responsibilities.[7]
:::

## #runtime 05 / Runtime Flow :: 把计划接收、聊天结束和业务完成分别确认 || Acknowledge Plan Acceptance, Chat Completion, and Business Completion Separately

采用「只完善三个已有场景，不新增，不生成图片」作为贯穿样例。以下是拟议执行流程，用来设计测试；它不是已运行的模型结果。 || The running example is: enrich three existing scenes, create none, and generate no images. The proposed flow below defines tests; it is not an observed model result.

:::diagram { src: "./media/task-handoff", drawio: "./media/task-handoff.drawio", title: "先确认接收，再报告执行结果 || Acknowledge Acceptance before Reporting Results" }
小屏可左右滑动；点图查看大图。 拟议时序：只画计划提交与结果确认；省略模型内部读取、推理及回调传输。实线为请求，虚线为回执或状态反馈，垂直顺序不代表实测耗时。 || Swipe horizontally on small screens; click the diagram for a larger view. Proposed sequence showing submission and result acknowledgement only. Model reads, reasoning, and callback transport are omitted. Solid arrows are requests; dashed arrows are receipts or status feedback. Vertical spacing is not measured time.
:::

### 从意图到后台任务的完整走查 || From Intent to Background Execution

前台只负责读数据与提交计划，后台仍由现有角色专家执行；成功入队不能表述为内容已生成。 || The foreground reads data and submits a plan; existing role-specific executors perform background work. Successful enqueueing does not mean content has been generated.

:::flow
1. **读取真实范围 || Read the Actual Scope** — 从当前项目取得三个 scene_id 与实体版本；保留不新增、不出图的约束。 || Read three scene_ids and entity revisions from the active project, retaining the no-create and no-image constraints.
2. **验证并接收计划 || Validate and Accept the Plan** — PlanGateway 检查 Skill、参数、目标归属和审批，使用稳定 operation_id 持久接收计划。 || PlanGateway checks Skills, arguments, ownership, and approval, then durably accepts the plan under a stable operation_id.
3. **返回入队事实 || Return an Acceptance Receipt** — 回传 plan_run_id；对话可按批准策略结束。若后台尚未完成，明确显示已接收或执行中。 || Return plan_run_id and end the conversation according to the approved policy. Show accepted or running while background work remains.
4. **独立确认业务结果 || Confirm Domain Results Separately** — orch_queue 驱动领域 Skill；从任务日志获取逐实体成功、失败和版本，不从模型确认文字推断。 || orch_queue drives domain Skills. Read per-entity success, failure, and revisions from task logs, not from model confirmation text.
:::

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 工具批次与只读回答的终止规则 || Tool-Batch Termination and Read-Only Answers
Pi core 默认支持并行工具；首期采用 sequential 保持与自研对照一致。terminate:true 只在批次全部最终结果都终止时跳过后续模型轮。[4] || Pi core defaults to parallel tool execution; the first comparison uses sequential execution to match the current engine. terminate:true skips another model turn only when all finalized results in the batch terminate.[4]

**批次中含计划 || A Batch Contains a Plan**

宿主限制每run只接受一个有效计划；成功接收后拒绝额外副作用。混合read/plan批次不能只靠terminate确保停止。 || The host accepts at most one valid plan per run and rejects further side effects after acceptance. A mixed read/plan batch cannot rely on terminate alone.

**用户只要求查询 || The User Only Requests a Read**

「列出场景，不修改」在读取后回答；「改这个角色」目标不唯一时澄清。没有计划不是未完成任务。 || Answer after reading when asked to list scenes without changes. Clarify ambiguous character targets. Absence of a plan is not task failure.

::panel
### 流式事件不能丢失完成语义 || Preserve Completion Semantics in Streaming Events
SSE 是服务器向浏览器持续发送事件的传输方式；事件名本身不证明模型逐token输出。Pi事件需映射到原UI契约。[3][8] || SSE carries a stream of server events to the browser; event names alone do not prove token-level model streaming. Pi events must map to the existing UI contract.[3][8]

| Pi / 宿主事件 || Pi / Host Event | 导演台事件 || DirectorStudio Event | 必要约束 || Required Constraint |
| --- | --- | --- |
| text_delta | token | 注明真实delta或完整响应后输出 || Distinguish actual deltas from output after a complete response |
| 工具开始 / 最终结果 || Tool Start / Final Result | tool_start / tool_done / tool_error | 保留call_id；部分参数只预览，完整校验后执行 || Preserve call_id; preview partial arguments and execute only after validation |
| 持久计划回执 || Durable Plan Receipt | plan_submitted | 后台完成继续来自原队列 || Background completion still comes from the existing queue |
| session settled | agent_done，再保存消息 || agent_done, then persist the message | SDK agent_end 后可能重试；不能提前宣告结束 [5][8] || SDK agent_end may be followed by retries; do not report completion early [5][8] |

内部事件携带 run_id、sequence、project_id 与 conversation_id；重连去重与结果查询由宿主管理。SkillResult.success=false 必须映射为明确失败。 || Internal events carry run_id, sequence, project_id, and conversation_id. The host handles reconnection, deduplication, and result queries. SkillResult.success=false must map to an explicit failure.
:::

## #state 06 / State and Recovery :: 分别管理对话记忆与不可重放的业务副作用 || Manage Conversation Memory Separately from Domain Side Effects

会话恢复重建模型上下文；任务恢复决定哪些业务操作可以继续。两者使用不同数据和确认边界，Pi会话持久化不能替代业务事务。 || Session recovery reconstructs model context; task recovery determines which domain operations may continue. They rely on different data and acknowledgement boundaries. Pi session persistence cannot replace domain transactions.

### 会话与记忆的权威来源 || Authoritative Session and Memory Stores

首期维持现有历史窗口和项目 Working Memo，仅使用 Pi 的运行内状态；完整 SDK 接管会话是后续可单独验收的范围。 || Initially retain the existing history window and project Working Memo, using Pi state only within a run. Full SDK session ownership is a separately verifiable scope.

| 状态 || State | 首期权威 || Initial Authority | 后续设计边界 || Later Design Boundary |
| --- | --- | --- |
| Conversation / 工具记录 || Conversation / Tool Transcript | 现有PG会话；旧tool_events有损 [3] || Existing PG conversations; old tool_events are lossy [3] | 不得伪造旧tool pairs；新增完整transcript需数据审查 || Never invent historical tool pairs; full transcript storage requires data review |
| Working Memo | 现有项目级字段 || Existing project-level field | 更新带版本比较；过期run不得覆盖新Memo || Version-check updates; stale runs cannot overwrite newer Memos |
| Pi会话树 / compaction || Pi Session Tree / Compaction | 首期不接管 || Not adopted initially | SDK内存会话桥接Repo；不同时维护PG/JSONL双真相源 [6] || Bridge SDK in-memory sessions through Repo; avoid competing PG and JSONL authorities [6] |

compaction 是压缩模型上下文的摘要过程，不是修改游戏实体或统一试玩记忆。一个会话只允许一个前台写入run；同项目跨会话Memo冲突由宿主处理。 || Compaction summarizes model context; it does not modify game entities or unify playtest memory. Permit one foreground writer per conversation and resolve cross-conversation project-Memo conflicts in the host.

:::diagram { src: "./media/lost-receipt", drawio: "./media/lost-receipt.drawio", title: "回执丢失后查询原操作 || Query the Original Operation after a Lost Receipt" }
小屏可左右滑动；点图查看大图。 拟议故障样例：第3条虚线表示回执在途中丢失，并未送达调用方。恢复使用同一个operation_id；若记录仍无法判定，保持状态不明并对账，不再次入队。 || Swipe horizontally on small screens; click the diagram for a larger view. Proposed failure case: dashed message 3 is lost in transit and does not reach the caller. Recovery reuses the same operation_id. If records cannot resolve the outcome, keep it unknown and reconcile instead of enqueueing again.
:::

### 回执丢失与执行中断的走查 || Lost Receipts and Interrupted Execution

框架检查点与数据库副作用不天然处于同一事务，必须允许明确的「状态不明」而不是猜测成功或失败。 || Framework checkpoints and database side effects do not automatically share a transaction. Represent unknown state explicitly instead of guessing success or failure.

| 故障位置 || Failure Point | 恢复动作 || Recovery Action | 禁止动作 || Forbidden Action |
| --- | --- | --- |
| 已入队、回执丢失 || Enqueued, Receipt Lost | 按原operation_id查询并返回已有plan_run_id || Query the original operation_id and return the existing plan_run_id | 换引擎或换键再次enqueue || Enqueue again using another engine or key |
| 业务写完成、日志确认失败 || Write Committed, Log Acknowledgement Failed | 对账业务版本和操作记录；不能判定则人工处理 || Reconcile domain revisions and operation records; escalate unresolved state | 仅因日志缺失就重跑写工具 || Repeat a write solely because its log is missing |
| 线程超时或服务重启 || Thread Timeout or Service Restart | 记录现有队列限制；单独验证执行器恢复 [3] || Record existing queue limits and validate executor recovery separately [3] | 声称换loop已保证恰好一次执行 || Claim exactly-once execution merely from loop replacement |

当前队列超时可能留下运行线程，重启时运行中任务会被取消。[3] 保留队列能缩小迁移面，也意味着这些限制仍然存在；写入试点前必须通过对应故障测试。 || A timed-out queue thread may continue, and running tasks are cancelled during restart recovery.[3] Retaining the queue reduces migration scope but retains these limits. Write-enabled pilots must pass the corresponding failure tests.

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 幂等提交与事务边界 || Idempotent Submission and Transaction Boundaries
operation_id 表示同一次业务操作，call_id 只关联一次模型工具调用。超时重试必须保留前者；这套应用机制尚未实现。 || operation_id identifies one domain operation; call_id correlates a model tool call. Timeout retries must retain the operation ID. This application mechanism is proposed, not implemented.

- 计划与幂等记录能共用事务时，原子保存唯一键、参数hash和plan_run_id；同键异参数拒绝，已接受的同键返回旧回执。 || When plan and idempotency records share a transaction, atomically store the unique key, argument hash, and plan_run_id. Reject changed arguments under the same key; return the original receipt for accepted operations.
- 不能共用事务时，评估事务发件箱（outbox）：接受记录与待投递记录同事务写入，worker可重复投递，消费端按operation/step去重。这是后续设计，不是Pi能力。 || If a shared transaction is impossible, evaluate a transactional outbox: commit acceptance and delivery intent together, allow repeated delivery, and deduplicate by operation/step at the consumer. This is proposed application design, not a Pi feature.
- 批准绑定项目、目标版本和参数hash；运行中状态不明先查询或对账，不生成新幂等键重新执行。 || Bind approval to the project, target revision, and argument hash. Query or reconcile uncertain execution state rather than retrying with a new idempotency key.
:::

## #deployment 07 / Containers and Processes :: 采用3个应用容器，Pi与Python在API容器内分进程运行 || Use Three Application Containers with Pi and Python in the API Container

根据用户明确的部署取舍，优先方案由独立Pi容器调整为共置：postgres、director-api、player-portal共3个应用容器；API内为Python和Node两个进程。现有Compose尚无Pi启动项，以下仍是拟议设计。[17] || The preferred design now follows the owner's deployment choice: three application containers—postgres, director-api, and player-portal—with separate Python and Node processes inside the API container. The existing Compose file has no Pi startup configuration; this remains a proposal.[17]

:::diagram { src: "./media/container-topology", drawio: "./media/container-topology.drawio", title: "三容器拓扑与宿主推理服务 || Three Containers and Host Inference Services" }
小屏左右滑动或点图放大。图框表示容器或宿主边界。API内横向箭头是设计请求的内部调用；Node工具/模型回调返回Python，图中省略返回线和媒体调用。宿主模型不计入3个应用容器，Jev容器连通尚未验收。 || Swipe horizontally or click to enlarge. Boxes mark container or host boundaries. The horizontal API-container arrow is an internal authoring call; Node tool/model callbacks return to Python. Return paths and media calls are omitted. Host models are not counted among the three containers; Jev connectivity from containers is unverified.
:::

### 明确数量、进程与备选边界 || Separate Container Count, Processes, and Alternatives

Pi是编排SDK，不在API容器中加载一套LLM权重。同容器减少服务数量，但不能代替权限、状态和资源隔离。 || Pi is an orchestration SDK, not another LLM loaded into the API container. Colocation reduces service count, not the need for permission, state, and resource isolation.

| 部署单元 || Deployment Unit | 拟议内容 || Proposed Contents | 边界 || Boundary |
| --- | --- | --- |
| postgres | PostgreSQL＋pgvector || PostgreSQL plus pgvector | 存储权威保留；Node不取得PG凭据 || Storage authority remains; Node receives no PG credentials |
| director-api | Python/FastAPI＋一个Node/Pi进程 || Python/FastAPI plus one Node/Pi process | Pi仅设计时；纯游戏模式可不启动Node（拟议） || Pi is authoring-only; a gameplay-only mode may omit Node (proposed) |
| player-portal | 现有玩家入口 || Existing player entry | 游戏请求不因Pi不可用而被阻断 || Pi unavailability must not block gameplay requests |

宿主LLM、NanoJev、图像和语音服务另计，不必为本方案同时启动两套Jev权重。若恢复独立Pi容器，应用容器数才增至4；同容器是部署优先项，不是更强隔离的证明。 || Host LLM, NanoJev, image, and voice services are outside this count. The design does not require two Jev weight variants running together. A separate Pi container would raise the application count to four. Colocation is a deployment preference, not evidence of stronger isolation.

### 双进程监督不能以游戏可用性为代价 || Supervise Both Processes without Gating Gameplay on Pi

需要统一的进程管理入口，但分别处理API与Node状态；这些是待实现的验收要求，不是已有运行保障。 || A single process-management entry must supervise API and Node separately. These are implementation requirements, not guarantees already in place.

| 要求 || Requirement | 机制与失败边界 || Mechanism and Failure Boundary |
| --- | --- |
| 只启动一份Node || Start One Node Process | 不在每个Uvicorn worker初始化时重复启动；支持信号转发、回收子进程和有界重启 || Do not start Node in each Uvicorn worker. Forward signals, reap child processes, and bound restarts |
| 按功能报告就绪 || Report Readiness by Capability | 分开进程存活、游戏依赖与设计Pi状态；Node异常令设计明确不可用，而不是拖垮游戏readiness || Separate liveness, gameplay dependencies, and Pi availability. A Node failure disables authoring explicitly, not gameplay readiness |
| 承认共同故障域 || Acknowledge the Shared Failure Domain | 容器发布重启或OOM仍可能影响两进程；实测影响，不承诺零传播 || Container restart or OOM may affect both processes. Measure the impact; do not promise zero propagation |

同一游戏运行采用明确的数据版本；试玩期间的导演编辑属于设计请求，不能无冲突检查地改写正在使用的判定前提。 || A game run uses an explicit data version. Director edits during play remain authoring requests and must not overwrite active decision inputs without conflict checks.

### 设计时的两阶段模型接入 || Two Stages of Authoring Model Integration

先保持模型治理不变，再决定是否使用 pi-ai 的原生流式传输，避免同时改变运行时、模型和调度三个变量。 || Preserve model governance first, then decide whether to adopt native pi-ai streaming. Avoid changing runtime, model behavior, and scheduling simultaneously.

:::comparison
::versus 方案 1 || Option 1
### 阶段 A：保留现有调用层 || Stage A: Retain the Existing Model Layer
Pi custom streamFn 经内部桥接调用 Python call_role_model。保留选角、限流与usage；当前返回完整结果，此阶段只能证明控制流与契约。 || A custom Pi streamFn bridges to Python call_role_model. Retain model assignment, limits, and usage. The current path returns complete results, so this stage validates control flow and contracts only.

::versus 方案 2 || Option 2
### 阶段 B：评估原生流式 || Stage B: Evaluate Native Streaming
统一调用授权、配额和用量归属后，再允许pi-ai直连本地推理端。核验Qwen思考参数、工具delta、结束原因和取消，不默认兼容。 || Only after unifying authorization, quotas, and usage attribution may pi-ai call local inference directly. Verify Qwen thinking parameters, tool deltas, termination, and cancellation rather than assuming compatibility.
:::

Pi 提供 OpenAI-compatible 与 Qwen 相关兼容参数；支持这些参数不等于当前 Qwen 后端已验收。[15] 首阶段包装完整响应也不能宣称获得真实首字改善。 || Pi exposes OpenAI-compatible and Qwen-specific compatibility settings; their existence does not validate the current Qwen backend.[15] Wrapping complete responses in stage A cannot establish a true first-token improvement.

:::accordion
::panel
### 隔离、内部通信及跨项目复用细则 || Isolation, Internal Communication, and Cross-Application Reuse
共置仍须隔离会话与凭据；若需要运行不可信扩展，独立worker或沙箱仍是更强的备选。 || Colocation still requires session and credential separation. Dedicated workers or sandboxes remain stronger alternatives for untrusted extensions.

- 内部Unix socket或容器loopback接口绑定应用身份、项目、会话和run；不允许模型指定回调URL或覆盖项目授权。 || Bind an internal Unix socket or container-loopback API to the application identity, project, conversation, and run. The model cannot select callback URLs or override project authorization.
- 独立Agent状态、消息快照与取消信号；同会话串行写，Memo做版本检查。多副本需跨进程锁/租约，不靠一个session_id当授权。 || Use separate Agent state, message snapshots, and cancellation signals. Serialize conversation writes and version-check Memo updates. Multiple replicas need inter-process locks or leases; session_id is not authorization.
- 使用最小目录权限、独立非root身份和清理后的Node环境；不传PG凭据，不挂宿主HOME或Docker socket，不开放任意shell/文件工具。同容器仍共享文件系统与网络。[7] || Use minimal file access, separate non-root identities, and a sanitized Node environment. Do not pass PG credentials, mount host HOME or Docker socket, or expose arbitrary shell/file tools. The container still shares filesystem and network boundaries.[7]
- 固定包/协议版本，限制并发、消息积压与deadline；避免模型或工具回调等待同一已占用工作线程。停止接收新run后再关停，不重放状态不明的计划。 || Pin packages and protocols, bound concurrency/backlogs/deadlines, and prevent callbacks from waiting on the same occupied worker. Stop new runs before shutdown and never replay an unresolved plan.
- DirectorStudio与Aye aye Captain仍按应用分开运行，可复用基础依赖和协议，不共享会话、认证文件或工具权限。Captain文章的CLI优先结论不直接套用。[16] || DirectorStudio and Aye aye Captain still run separately. Reuse dependencies and protocols, not sessions, auth files, or tool privileges. Captain's CLI-first recommendation does not determine this design.[16]
:::

## #gameplay 08 / Gameplay Path :: 游戏不经过Pi，Jev与LLM按任务分工 || Keep Gameplay Independent of Pi and Assign Jev and LLM Work by Task

玩家行动继续进入专用playtest链路，不触发Pi规划、设计Memo或Pi自动压缩。Jev由游戏业务服务直接调用；未来快路径是否加速，要以质量和关键路径测量决定。现有C-158仍是非权威辅助复核。[18] || Player actions remain on the dedicated playtest path, without Pi planning, authoring Memo updates, or Pi compaction. Gameplay services call Jev directly. Future fast paths require quality and critical-path measurements; C-158 currently remains advisory.[18]

:::diagram { src: "./media/authoring-gameplay", drawio: "./media/authoring-gameplay.drawio", title: "设计使用Pi，玩家行动绕过Pi || Pi for Authoring, No Pi for Player Actions" }
小屏左右滑动或点图放大。两列由服务器按请求入口分流；箭头是业务调用关系，不表示规则→Jev→LLM必须串行。角色模型仍经受控调用层，图中省略共享资源调度与数据访问。Jev快路径是目标设计，尚未实施。 || Swipe horizontally or click to enlarge. The server selects the path from the request entry. Arrows show business calls, not a mandatory rules→Jev→LLM sequence. Models still use governed calls; shared scheduling and storage are omitted. The Jev fast path is a target, not an implementation.
:::

### 只有减少关键路径工作量才可能加速 || Acceleration Requires Less Work on the Critical Path

不应在原来的全部LLM调用前机械增加一次Jev。优先让明确规则直接执行，再按任务是否适合、是否经过验证选择判定或生成模型。 || Do not mechanically insert Jev before every existing LLM call. Execute explicit rules directly, then choose decision or generation models according to task fit and validation.

| 任务 || Task | 目标路径 || Target Path | 限制 || Limit |
| --- | --- | --- |
| 数值、权限、已知字段规则 || Numeric, Permission, or Explicit Field Rules | 确定性代码 || Deterministic code | 无需模型即可判断时不增加推理 || Add no inference when code can decide |
| 有限候选或布尔语义判定 || Finite-Choice or Boolean Semantic Decisions | 经场景评测的Jev || Task-validated Jev | 保留不确定状态；原始概率不能直接当已校准置信度 || Allow uncertainty; raw probabilities are not calibrated confidence |
| 开放叙事与复杂推理 || Open Narrative and Complex Reasoning | LLM | 不强制先做一次无收益Jev调用 || Do not require an unhelpful Jev call first |
| 依赖新叙事的判定 || Decisions Depending on New Narrative | 文本可用后判定 || Decide after the text exists | 不可声称预先判定；只并行无数据依赖的任务 || Do not claim decisions before inputs exist; parallelize only independent work |

Jev替代适合的判定、减少重试或支持无依赖并行，才可能节省时间。低置信路由与服务故障要分开记录，不能用静默fallback伪造判定成功。 || Replacing suitable decisions, reducing retries, or enabling independent work may save time. Record uncertainty routing separately from service failures; silent fallback must not fabricate a successful decision.

### 当前shadow不是加速结果，容器接入也未完成 || Current Shadow Audits Are Not Acceleration Results or Container Readiness

源码显示C-158在原LLM状态分析之后，对明确提出且匹配唯一条件的退出事件做旁路复核，不改状态、不减少原LLM调用。[18] || Source inspection shows that C-158 audits explicit exits matching a unique condition after the original LLM state analysis. It neither changes game state nor removes the original model call.[18]

| 现状 || Current State | 设计含义 || Design Consequence |
| --- | --- |
| `off / manual / shadow` | 辅助观察路径，尚无自动判定快路径 || An advisory path, not an automatic fast path |
| `authoritative=False / calibrated=False` | 不把模型概率或与LLM一致率当业务正确率 || Neither raw probability nor LLM agreement establishes business correctness |
| 连接文件校验UID、权限与127.0.0.1 || Connection File Checks UID, Permissions, and 127.0.0.1 | 容器loopback不指宿主；当前客户端不能靠改URL直接复用 || Container loopback is not the host; changing a URL does not make the current client reusable |

后续须验证允许列表宿主网关/代理、服务token和模型身份，以及最小secret挂载和UID处理。不得挂整份HOME或无保护开放0.0.0.0。本课题不接管现有Jev及结算实验。 || Future integration must verify an allowlisted host gateway/proxy, service tokens and model identity, minimal secret mounts, and UID handling. Do not mount all of HOME or expose an unauthenticated 0.0.0.0 listener. This study does not take over existing Jev or settlement experiments.

### 软剧情与硬机制须先明确产品语义 || Define Product Semantics for Narrative Cues and Hard Mechanics

共同RFC把软叙事提示与硬机制结算的划分列为待产品确认项；本文的「规则优先」不授权将旧自然语言提示直接编译为强制规则。[19] || The shared RFC identifies the boundary between soft narrative cues and hard settlement mechanics as an unresolved product decision. The rules-first proposal does not authorize compiling existing natural-language guidance into mandatory rules.[19]

:::comparison
::versus 方案 1 || Option 1
### 保留原语义 || Preserve Existing Semantics
未形式化、未批准的规则继续保持原行为。LLM和判定模型提供候选，不因参数合法或双方一致就获得状态写入权。 || Keep existing behavior for rules that are not formalized and approved. LLMs and decision models provide proposals; valid parameters or model agreement do not grant state-write authority.

::versus 方案 2 || Option 2
### 单独批准快路径 || Approve Fast Paths Separately
先明确哪些字段属于硬机制、旧项目怎样兼容，再评测单任务快路径。改成「先规则提交再叙事」也要独立验证，不能借用现有叙事后分析的结果。 || Define hard-mechanic fields and legacy-project compatibility before evaluating a task-specific fast path. Committing rules before narration also needs its own validation; results from the current narration-then-analysis order do not transfer.
:::

共同F0契约/语义批准与B3快路径准入均未通过。本文G0–G4是本线验证步骤，不替代共同审批；Pi创作验证与游戏快路径上线仍分别推进。[19] || Shared F0 contract/semantic approval and B3 fast-path admission have not passed. This article's G0–G4 are study validation steps, not substitutes for shared approval. Pi authoring validation and gameplay fast-path rollout remain separate.[19]

### 链路分离之外，还要保护游戏的推理资源 || Protect Gameplay Inference Resources as Well as Its Call Path

游戏绕过Pi，仍可能与设计文本、图片生成和Jev争用GPU及内存。容器数量不能证明时延隔离。 || Bypassing Pi does not prevent contention with authoring text, image generation, or Jev for GPU and memory. Container count does not establish latency isolation.

- 为游戏预留推理容量，限制设计并发，游玩活跃时延后非紧急批量任务；所有模型请求进入统一预算。 || Reserve inference capacity for gameplay, limit authoring concurrency, defer non-urgent batches during active play, and budget all model requests together.
- 已开始的生成能否抢占由推理服务决定，不能承诺任意暂停；Node不得绕过Python治理另开GPU并发。 || Preemption of active generation depends on the inference service and is not assumed. Node must not bypass Python governance to consume extra GPU concurrency.
- 分别测仅游戏、游戏＋设计、游戏＋Jev的queue_wait、首字、叙事完成和状态稳定时间；状态错序、重复结算及质量回退独立验收。 || Measure queue wait, first text, narrative completion, and stable-state latency under gameplay-only, gameplay-plus-authoring, and gameplay-plus-Jev loads. Validate out-of-order state, duplicate settlement, and quality regressions separately.
- Pi设计迁移与Jev游戏快路径使用独立实验、开关和回滚；不能把网页设计完成算作任何一条路径已提速。 || Use separate experiments, switches, and rollback for Pi authoring and Jev gameplay. Completing the article does not demonstrate acceleration of either path.

## #safety 09 / Risk and Rollback :: 让故障可见，并阻止重复执行 || Expose Failures and Prevent Duplicate Execution

引擎可替换不意味着业务操作可以随意重放。模型故障、取消、授权失败与队列状态必须保持可区分，不能通过静默切换另一引擎掩盖。 || A replaceable engine does not make domain operations safe to replay. Model failures, cancellation, authorization failures, and queue state must remain distinguishable rather than being hidden by silent engine substitution.

### 权限与影子验证 || Authorization and Shadow Validation

影子验证只观察候选决策；它的计划提交只能落到隔离模拟库，不能向生产队列发送写请求。 || Shadow validation observes candidate decisions only. Plan submission must target isolated simulation storage, never a production write queue.

- 服务器核对身份、项目归属、工具类别、参数与批准记录；模型返回approved或project_id不产生权限。 || The server checks identity, project ownership, tool category, arguments, and approval records. Model-generated approved or project_id fields grant no authority.
- 检索结果与Memo作为低信任资料处理；提示词注入防护不能只靠「不要执行恶意指令」。业务写工具保持最小权限。 || Treat retrieval results and Memos as lower-trust data. Prompt-injection defense cannot rely only on instructions to ignore malicious requests. Domain writes remain least-privilege.
- 只读shadow也可能消耗GPU并读取敏感数据，仍需预算和脱敏；不把零写入误解为零成本、零风险。 || Read-only shadow runs can still consume GPU capacity and access sensitive information. They require budgets and sanitized inputs; zero writes do not mean zero cost or risk.

### 显式切换与回滚演练 || Explicit Switching and Rollback Rehearsal

回滚只改变后续运行选择，不重新执行状态不明的旧请求，也不撤销已经发生的业务副作用。 || Rollback changes the engine for subsequent runs. It neither replays unresolved requests nor reverses committed domain side effects.

:::flow
1. **固定一次运行的引擎 || Pin the Engine for Each Run** — 测试项目明确选择engine/version；同一个run不在两套引擎间自动跳转。 || Explicitly select engine/version for a test project. Never switch a run automatically between engines.
2. **冻结入口并对账 || Pause New Entries and Reconcile** — 检查原operation_id、已入队计划和待批准任务；旧任务保持原schema/engine版本至终态。 || Inspect operation IDs, accepted plans, and outstanding approvals. Keep old schema/engine versions for existing tasks through completion.
3. **显式恢复自研 || Explicitly Restore the Current Engine** — 新run恢复legacy；保留旧会话和任务记录。任何越权、重复写或串项目问题立即停止扩大试点。 || Use legacy for new runs while retaining previous sessions and task records. Any unauthorized write, duplicate write, or cross-project leak stops pilot expansion.
:::

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 取消分层与重试预算 || Layered Cancellation and Retry Budgets
Pi的取消信号需要底层工具协作；它不能撤销已提交事务，也不能强制终止现有Python线程。[4] || Pi cancellation requires cooperation from underlying tools. It cannot roll back committed transactions or forcibly terminate existing Python threads.[4]

| 取消位置 || Cancellation Point | 应有结果 || Required Outcome |
| --- | --- |
| 模型生成 / 未提交计划 || Model Generation / Unsubmitted Plan | 停止请求与后续工具调度；提交入口拒绝过期run || Stop the request and subsequent tool scheduling; reject expired runs at submission |
| 排队任务 || Queued Task | 沿现有队列取消接口确认终态 || Confirm terminal state through the existing queue cancellation interface |
| 运行中工具 / 已提交事务 || Running Tool / Committed Transaction | 显示不可中断或状态不明；业务撤销走已有版本流程 || Show non-interruptible or unknown state; reverse domain changes through existing version workflows |

读重试与写重试分开配置，并给provider、loop、队列设置统一总预算；避免三层各自重试导致调用倍增。任何Skill失败都要能关联到run、call和step。 || Configure read and write retries separately, with a shared total budget across provider, loop, and queue layers. Prevent multiplicative retries and correlate every Skill failure with its run, call, and step.
:::

## #validation 10 / Validation and Cost :: 用同条件对照识别运行时收益与策略收益 || Separate Runtime Benefits from Policy Changes through Controlled Comparisons

框架更换不会自动提高同一模型的token生成速度。测试既要检查任务质量，也要区分模型时间、额外轮次、工具时间、排队和跨进程开销。 || Changing frameworks does not automatically increase token generation speed for the same model. Tests must measure task quality and separate model time, extra turns, tool time, queueing, and cross-process overhead.

### 两条对照轨道与最小案例 || Two Comparison Tracks and a Minimal Case Set

A轨仅换运行时；B轨逐项改变策略，并把同样优化应用到自研对照，避免候选因少做工作而获得虚假的框架优势。 || Track A changes only the runtime. Track B changes one policy at a time and applies it to the current-engine control, preventing less work from masquerading as a framework advantage.

| 轨道 || Track | 保持或改变 || Fixed or Changed | 可得结论 || Permitted Conclusion |
| --- | --- | --- |
| A：等价契约 || A: Equivalent Contract | 同模型/量化、prompt、schema、历史/Memo、工具结果、串行、提醒/终止/确认策略与重试预算 || Same model/quantization, prompt, schema, history/Memo, tool results, serial execution, reminder/stop/acknowledgement policy, and retry budget | 循环、协议、事件和纯运行时开销差异 || Differences in loop behavior, protocol, events, and runtime overhead |
| B：策略优化 || B: Policy Optimization | 确定性确认、阈值Memo、真流式、只读并行、字段投影逐项消融 || Ablate deterministic acknowledgements, threshold-based Memo updates, real streaming, parallel reads, and field projection | 收益来自哪项策略，质量是否受损 || Which policy helps and whether quality regresses |

案例覆盖：纯讨论/查询、单字段修改、批量enrich、否定/歧义、坏参数/非法工具、取消/超时/回执丢失、两项目并发和长对话。所有write/generate仍走同一mock队列契约。 || Cases cover discussion and reads, single-field edits, batch enrichment, negation and ambiguity, invalid arguments and tools, cancellation/timeouts/lost receipts, concurrent projects, and long conversations. All write/generate operations use the same mock queue contract.

:::diagram { src: "./media/evidence-decision", drawio: "./media/evidence-decision.drawio", title: "验证结果决定下一步投入 || Let Evidence Determine the Next Investment" }
小屏可左右滑动；点图查看大图。 拟议决策图：三条分支是不同证据条件下的决定，不是已完成的测试结果。安全失败优先停止；继续只意味着申请下一阶段，不自动切换生产。 || Swipe horizontally on small screens; click the diagram for a larger view. Proposed decision branches, not completed test results. Safety failures take precedence and stop the pilot. Continuing means seeking approval for the next stage, not automatically switching production.
:::

### 投入预算与继续、停止判据 || Effort Budget and Continue-or-Stop Criteria

下表保留此前Pi范围的规划估算，本轮没有重新估时。双进程故障验证、容器连通和Jev游戏实验另计；减少一个容器不能直接等同于减少总工期。 || The table retains earlier Pi-scope estimates; effort was not re-estimated this round. Dual-process failure checks, container connectivity, and Jev gameplay experiments are additional. One fewer container does not establish less total work.

| 投入项 || Work Item | 本轮估算 / 边界 || Estimate / Boundary |
| --- | --- |
| Pi隔离验证 || Isolated Pi Validation | 4–6人日，先设6人日复核点；到期按证据决定停止或续批 || 4–6 person-days; review at day 6 and stop or explicitly extend based on evidence |
| Pi有限接入 || Limited Pi Integration | 12–20人日，仅在保留业务层/队列前提下；不含幂等执行器重构 || 12–20 person-days, assuming retained domain code and queue; excludes executor idempotency redesign |
| 其他与持续成本 || Other and Recurring Costs | Python依赖升级、同容器双进程监督、版本回放与队列治理分别计账；Jev连接和质量验证另计，不并行建设通用中间件 || Account separately for Python upgrades, colocated process supervision, upgrade replays, and queue governance. Jev connectivity and quality validation are separate; do not build general middleware in parallel |

继续：全部安全/业务契约通过，任务质量不低于冻结基线，且预先选定的效率或维护指标有可重复改善。停止：任一安全失败、同条件无收益，或新增维护成本超出已批准预算。缺数据时只批准下一项最小实验，不批准生产替换。 || Continue only when safety and domain contracts pass, quality does not regress against the frozen baseline, and a preselected efficiency or maintenance metric improves reproducibly. Stop for a safety failure, no benefit under equal conditions, or costs beyond the approved budget. Missing data can justify only the next minimal experiment, not production replacement.

### 游戏保护是独立验收门 || Gameplay Protection Is a Separate Acceptance Gate

以下条件尚未测试；它们约束新部署和Jev试验，不能被设计时Pi任务成功率替代。 || These conditions are untested. They constrain deployment and Jev experiments and cannot be replaced by authoring-task success rates.

| 场景 || Scenario | 必须观察到的结果 || Required Observation |
| --- | --- |
| 纯游戏运行 / Node异常 || Gameplay-Only Run / Node Failure | 玩家trace中Pi调用为0；游戏按自身依赖就绪，设计故障明确可见 || Zero Pi calls in player traces; gameplay readiness depends on its own services, and authoring failure is explicit |
| 同容器故障与并发负载 || Container Failure and Concurrent Load | 记录OOM/重启对两进程的影响；比较仅游戏与设计/Jev并发的排队和完整回合耗时 || Record OOM/restart impact on both processes; compare queueing and full-turn latency with authoring/Jev contention |
| Jev判定与状态写入 || Jev Decisions and State Writes | 按场景验证误通过/误拒绝、校准、版本和回合顺序；零重复结算 || Validate false accepts/rejects, calibration, revisions, and turn order per scenario; no duplicate settlement |

Pi和Jev各有独立开关与回滚。基线、错误率和延迟预算需实验前明确；未过门时不启用权威Jev判定，也不把异常静默改写成通过。 || Pi and Jev need separate switches and rollback. Define baselines, error-rate limits, and latency budgets before testing. Until gates pass, do not enable authoritative Jev decisions or silently convert errors into approvals.

补充解释 · 不影响主线阅读 || Optional Detail · The Main Argument Stands Without It

:::accordion
::panel
### 先测协议，再测本地模型 || Test the Protocol before the Local Model
离线mock使用实际引擎循环和同一脚本决策序列，替换模型transport与业务副作用；它不证明模型理解中文或选对工具。 || Offline mocks exercise the actual engine loops with the same scripted decisions, replacing model transport and domain side effects. They do not demonstrate Chinese comprehension or tool-selection quality.

- Pi可用fauxProvider，PydanticAI可用FunctionModel；禁止重写一个近似自研loop来充当基线。未提交基线需先经负责人整理，不复制覆盖main。[4][9] || Pi can use fauxProvider and PydanticAI can use FunctionModel. Do not compare against a rewritten approximation of the current loop. The owner must resolve the uncommitted baseline first; never overwrite main.[4][9]
- 拟议本地质量冒烟：6例×3次×自研/Pi/Python候选3实现，共54个任务请求；仅在空闲GPU和预算批准后执行，内部重试/摘要另计。 || Proposed local quality smoke test: 6 cases × 3 repetitions × 3 implementations (current, Pi, and a Python candidate), totaling 54 task requests. Require idle GPU capacity and budget approval; count internal retries and summaries separately.
- 每run记录成功率、参数正确性、越权/重复写、轮次与tokens、TTFT、plan_ack、dialogue_done、business_done、queue_wait、bridge开销和峰值内存。 || Record task success, argument correctness, unauthorized/duplicate writes, turns and tokens, TTFT, plan_ack, dialogue_done, business_done, queue_wait, bridge overhead, and peak memory.
- 失败和超时保留在统计中；报告样本量与测量条件。54次是质量冒烟，不能凭此稳定估计p95；mock tokens与耗时不得冒充真实推理数据。 || Keep failures and timeouts in the statistics and report sample size and measurement conditions. The 54 requests are a quality smoke test, not a reliable p95 estimate. Mock tokens and timings are not inference measurements.

TTFT在本文指请求到首个可见文本的时间；若模型先执行工具而没有文本，另记首事件与计划确认时间，不用工具事件冒充首字。 || TTFT here means request-to-first-visible-text time. If tools precede any text, record first-event and plan-acknowledgement times separately rather than counting a tool event as first text.
:::

## #progress 11 / Progress and Results :: 将决定、实验和结果分别留档 || Record Decisions, Experiments, and Outcomes Separately

本页是可持续更新的专项记录。每次状态推进都需要版本、测试条件和证据；设计完成、文章验收与产品迁移完成是三件不同的事。 || This page is a living study record. Every status change needs versions, test conditions, and evidence. A completed design, a verified article, and a completed product migration are separate milestones.

### 截至2026-09-25的实际进度 || Actual Progress as of September 25, 2026

已经完成的是资料和源码核查；没有引擎A/B结果，也没有生产切换。本页不以规划中的测试替代结果。 || Documentation and source review are complete. No engine A/B results or production switch exist. Planned tests are not presented as results.

| 日期 / 工作 || Date / Work | 状态与证据 || Status and Evidence |
| --- | --- |
| 09-22：引擎初筛与代码基线 || Sep 22: Engine Shortlist and Baseline | 已完成：版本/许可、main脏改动、依赖冲突、静态检查 [3] || Complete: versions/licenses, uncommitted main changes, dependency conflicts, and static checks [3] |
| 09-23：结合旧文完善设计 || Sep 23: Design Informed by Earlier Articles | 已完成：职责、状态、故障走查与验证门；本文为可追踪产物 || Complete: ownership, state, failure walkthroughs, and validation gates; this article records the work |
| 09-25：三容器与双链路设计 || Sep 25: Three Containers and Dual Paths | 已同步文章与图示；进程、容器、Jev快路径均未实现或部署 [17][18] || Article and diagrams updated; process integration, containers, and Jev fast paths remain unimplemented and undeployed [17][18] |
| mock / 真实模型 / 灰度 || Mock / Real Model / Canary | 均未执行；需基线冻结和阶段授权，不提供成功率或延迟数字 || Not executed; requires a frozen baseline and stage approval. No success-rate or latency figures are available |
| 生产引擎 / 最终收益 || Production Engine / Final Benefit | 未替换；仍为现有自研路径。收益尚未证实 || Unchanged: the existing custom path remains. Benefits are unproven |

文章展示验证单独记录在[页面验证记录](evidence/article-validation.json)，不计入引擎测试成绩。源码核查摘要提供相对路径和文件hash，不包含生产数据。[3] || Presentation checks are recorded separately in the [article validation record](evidence/article-validation.json) and do not count as engine tests. The source-review summary contains relative paths and file hashes, not production data.[3]

### 验证门与决策记录 || Validation Gates and Decision Record

先形成可重复的测试，再扩大副作用范围；每个阶段均可选择暂停，不以已经投入工时作为继续理由。 || Make tests reproducible before expanding side effects. Every stage may pause; sunk effort is not a reason to continue.

| 门 || Gate | 退出条件 || Exit Condition | 当前状态 / 责任 || Current State / Owner |
| --- | --- | --- |
| G0 基线冻结 || G0 Baseline Freeze | main改动整理、prompt/schema/config快照、脱敏样例 || Reconciled main changes, prompt/schema/config snapshots, and sanitized cases | 未开始 / 项目负责人批准整理方式 || Not started / Project owner approves baseline preparation |
| G1 离线契约 || G1 Offline Contracts | 真实loop mock回放、错误/取消/隔离测试 || Mock replay of actual loops, errors, cancellation, and isolation | 未执行 / 适配实现者与测试负责人 || Not executed / Adapter implementer and test owner |
| G2 同模型质量 || G2 Same-Model Quality | 相同条件质量与资源测量，可复核原始结果 || Matched quality/resource measurements with reviewable raw results | 未执行 / 获准本地资源窗口后 || Not executed / After a local-resource window is approved |
| G3 有限切换 || G3 Limited Switch | 测试项目、幂等审批与回滚演练通过 || Test project, idempotency, approval, and rollback rehearsal pass | 未批准 / 独立迁移评审 || Not approved / Separate migration review |
| G4 闭环决定 || G4 Outcome Decision | 采用、部分采用或停止；记录实际成本与质量 || Adopt, partially adopt, or stop; record actual cost and quality | 尚无最终结果 / 项目负责人 || No final outcome / Project owner |

当前设计决定：D01保留业务层；D02先验证Pi core；D03会话SDK另设门；D04 Miyo只列上下文用途；D05无实测不宣布胜者。若后续会话需求使完整SDK更合适，更新D02并保留旧理由，不删除决策历史。 || Current decisions: D01 retains domain code; D02 tests Pi core first; D03 evaluates session SDK adoption separately; D04 treats Miyo as context infrastructure; D05 names no performance winner without tests. If later session requirements favor the full SDK, revise D02 while retaining its original rationale.

### 09-25：更新部署与游戏边界 || September 25: Revised Deployment and Gameplay Boundaries

新增决定D06：3容器、API内Python＋Node；D07：Pi仅设计，游戏不依赖Pi；D08：Jev按场景独立评测，shadow不算提速。独立Pi容器降为更强隔离备选；这是设计修订，未部署。 || New decisions: D06 selects three containers with Python and Node in the API; D07 keeps Pi on the authoring path only; D08 evaluates Jev per task and does not count shadow auditing as acceleration. A separate Pi container remains a stronger-isolation alternative. This is a design revision, not a deployment.

- 共享身份、事件、模型治理、Repository/schema、全局配置和Compose接口须经跨工作区协调确认；本文字段仍是提案，不由本课题独立修改或合入。 || Shared identity, events, model governance, Repository/schema, global configuration, and Compose interfaces require cross-workspace agreement. Fields here remain proposals, not independently implemented or merged contracts.
- 当前只继续独立研究文档及获准的隔离契约验证；不改变既有服务、不丢弃并行成果，不用文章更新替代运行时验收。 || Continue independent research documentation and approved isolated contract validation only. Preserve existing services and parallel work; article updates do not establish runtime acceptance.

### 怎样记录最终结果，包括停止 || How to Record the Outcome, Including a Stop

当前结论是「方案已形成，替换收益未证实」；最终结果栏已有明确状态，不用空白或虚构成功填满。 || The current outcome is: a design exists, but replacement benefits are unproven. The result has an explicit status, not a blank field or a fabricated success.

:::comparison
::versus 方案 1 || Option 1
### 走查A：满足继续条件 || Walkthrough A: Conditions for Continuing
假设同条件测试全部满足业务契约，且预先选定指标稳定改善：只批准下一阶段测试项目；生产切换仍须审批与回滚演练。此为判据示例，不是实测。 || If matched tests satisfy every domain contract and the preselected metric improves reproducibly, approve only the next test-project stage. Production still requires approval and rollback rehearsal. This illustrates the rule, not a measured result.

::versus 方案 2 || Option 2
### 走查B：发现重复提交 || Walkthrough B: Duplicate Submission Found
假设「已入队但回执丢失」导致第二个计划：G1失败，停止写入试点。保留自研并单独解决幂等边界；即使候选首字更快也不通过。 || If a lost receipt creates a second accepted plan, G1 fails and the write-enabled pilot stops. Retain the current engine and address idempotency separately; faster first text does not override the failure.
:::

闭环记录必须包含：最终选项、engine/业务代码版本、数据集hash、测量条件、前后质量与耗时、故障记录、实际接入/维护成本、回滚结果和未解决限制。每条实验写明执行日期、执行人、命令及证据位置；无测试就保持未验证。 || Closure requires the chosen option, engine/domain-code versions, dataset hash, measurement conditions, before/after quality and timing, failures, actual integration/maintenance cost, rollback outcome, and residual limits. Each experiment records its date, operator, command, and evidence location. Untested claims remain unverified.

## #references 12 / References :: 保留版本、来源和未验证范围 || Retain Versions, Sources, and Unverified Boundaries

引擎来源于2026-09-22核查；09-25补充Compose、进程与Jev源码依据并同步设计。官方能力、静态观察和拟议方案分别标注；没有容器部署、模型实验或生产写入。 || Engine sources were checked on 2026-09-22; Compose, process, and Jev source evidence and the revised design were added on September 25. Official capabilities, static observations, and proposals are distinct. No containers were deployed, models tested, or production data written.

- [1] Knowledge Hub. | — 2026-04-09历史设计；支持两阶段、Skill与角色分派，不证明当前运行质量。 || — Historical design dated 2026-04-09: two phases, Skills, and role dispatch; not evidence of current runtime quality.
- [2] Knowledge Hub. | — 角色调用入口与Provider边界；关联项目回顾亦已阅读，历史指标不重新计为成果。 || — Role-call and provider boundaries; the linked project retrospective was also read. Historical metrics are not new results.
- [3] DirectorStudio. | — HEAD 5e3c5ec与main脏基线、静态发现、文件hash及限制；代码结论来源，不包含运行时PG配置。 || — HEAD 5e3c5ec plus uncommitted main changes, static findings, hashes, and limits. No runtime PG configuration is included.
- [4] Pi 0.86.0. — https://github.com/earendil-works/pi/blob/v0.86.0/packages/agent/README.md | — Agent、streamFn、工具并行、terminate和取消；mock provider另见同tag的packages/ai/README.md。 || — Agent, streamFn, tool execution, termination, and cancellation. The same tag's packages/ai/README.md documents the mock provider.
- [5] Pi 0.86.0. — https://github.com/earendil-works/pi/blob/v0.86.0/packages/coding-agent/docs/sdk.md | — createAgentSession、工具白名单、ResourceLoader、SessionManager和事件；本机匹配文档已完整读取。 || — createAgentSession, allowlists, ResourceLoader, SessionManager, and events; matching installed documentation was read in full.

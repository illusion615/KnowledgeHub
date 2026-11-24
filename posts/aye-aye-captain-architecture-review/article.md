---
title: "Aye aye Captain：先恢复可信状态，再扩展功能 || Aye aye Captain: Restore Trustworthy State Before Expanding Features"
eyebrow: "2026-09-08 · 当前工作树 · 含未提交修改 || 2026-09-08 · Working Tree · Uncommitted Changes Included"
brand: "AI 项目实践 · 阶段评审 || AI Project Practice · Stage Review"
date: 2026-09-08
strict_i18n: true
strict_density: true
lead: "这份阶段架构评审供维护者对齐项目目标、清理冗余、评估问题与解决方案，并为下一轮开发建立可关闭的整改台账。审查对象是本地优先的 AI 协作项目操作系统；结论依据当前代码，不把已登记任务状态当作交付证据。 || This stage review helps maintainers realign project goals, remove redundancy, assess findings and remedies, and define verifiable remediation for the next development cycle. It examines a local-first AI collaboration system using the current source, not backlog status as evidence of delivery."
hero_actions:
  - "查看整改顺序 || Review Remediation Priorities | #ledger"
  - "核对源码证据 || Inspect Source Evidence | #references"
panel_label: "评审结论 · 建议优先专项整改 || Verdict · Prioritize Targeted Remediation"
panel_title: "保留本地单体与审批链，统一入口和执行契约 || Keep the Local Monolith and Approval Chain; Unify Entry and Execution Contracts"
panel:
  - "创建和更新不能拥有不同的质量门禁 || Creation and updates must enforce the same quality requirements"
  - "进程退出、结构化交付和人工验收须分开记录 || Process exit, structured delivery, and human acceptance need distinct records"
  - "先修页面生命周期，再补齐下一步、版本差异和快照入口 || Repair page lifecycle before completing next-action, version-diff, and snapshot paths"
metrics:
  - "主发现 || Findings | 10 | F01–F10，子项不重复计数 || F01–F10; subitems are not counted twice"
  - "建议优先级 || Suggested Priority | 5 + 5 | 5 项 P1 · 5 项 P2 || 5 P1 · 5 P2"
  - "本次修复关闭 || Fixes Closed by This Review | 0 / 10 | 仅评审，未修改项目代码或任务 || Review only; no project code or task changes"
  - "风险最高维度 || Highest-Risk Dimension | D | 数据完整性；不是安全渗透结论 || Data integrity; not a penetration-test verdict"
style:
  accent: "#b11f4b"
---

## #goals 01 / Goal Alignment :: 下一阶段先兑现状态可信、执行可控和验收可追踪 || Prioritize Trustworthy State, Controlled Execution, and Traceable Acceptance

船长在本地规划工作，Agent 执行，船长根据验证记录验收。这要求状态可信、执行可停止，界面持续回答接下来做什么。现有基础可保留，缺口应按具体契约关闭。 || The captain plans locally, agents execute, and the captain accepts results using validation records. State must be trustworthy, execution stoppable, and the UI clear about what comes next. Keep the existing foundation and close gaps against explicit contracts.

| 目标 || Goal | 当前判断 || Assessment | 后续动作 || Next Action |
| --- | --- | --- |
| 本地持久化 || Local Persistence | API 单写者、SQLite 已实现 || API writer and SQLite implemented | 保留，不拆微服务 || Retain; do not split into microservices |
| 设计与架构审批 || Design and Architecture Approval | 设计门与原子变更单已实现 || Design gates and atomic proposals implemented | 保留人工批准与来源关系 || Preserve human approval and provenance |
| 可信验收 || Trustworthy Acceptance | F01 / F02 / F05 | 统一入口，增强证据和交付契约 || Unify entry, evidence, and delivery contracts |
| 受控执行与恢复 || Controlled Execution and Recovery | F03 / F04 / F06 | 明确权限、取消终态和持久编排 || Define authority, cancellation, and durable orchestration |
| 下一步与版本审阅 || Next Actions and Version Review | F07 / F08 / F09 | 修页面时序，完成现有能力接线 || Repair page timing and connect existing capabilities |

[1] [2] F10 导出是路线图已承认的未交付能力，不是已完成功能的退化。P1/P2 是下一轮开发的建议顺序，不是生产事故或外部攻击等级。 || F10 export is an acknowledged roadmap gap, not a regression of a completed feature. P1/P2 indicate suggested development priority, not production incident or external attack severity.

## #structure 02 / Structure and Boundaries :: 按职责收敛单体，不按文件长度重写系统 || Consolidate Responsibilities Without Rewriting the Stack

同步 SQLite 和单进程服务符合当前本地单人目标。多服务、消息中间件或前端框架迁移不能自动修复入口门禁；本轮也没有负载数据支持容量判断。 || Synchronous SQLite and one service process fit the local, single-user scope. Microservices, a broker, or a frontend framework migration would not repair entry gates. This review has no load data from which to infer capacity.

:::flow { title: "现有组件职责 || Current Component Responsibilities" }
1. **Dashboard → Fastify API → services → SQLite || Dashboard → Fastify API → Services → SQLite** — 浏览器经 HTTP 读写；API 持有 SQLite 单例，开启 WAL 与外键。UI 不承担持久化门禁。 || The browser reads and writes over HTTP. The API owns a SQLite singleton with WAL and foreign keys. Persistence gates do not belong in the UI.
2. **Delegation Engine → jobs → CLI → MCP → API || Delegation Engine → Jobs → CLI → MCP → API** — 引擎组装 Playbook 与约束，jobs 管进程和日志。MCP 经 HTTP 回写，没有直接打开数据库。 || The engine assembles playbooks and conventions; jobs manage processes and logs. MCP writes back over HTTP without opening the database.
3. **产品意图 → 设计 → 任务 → 证据 → 人工验收 || Product Intent → Design → Task → Evidence → Human Acceptance** — Blueprint、Solution、Scenario、Requirement 表达产品意图；批准 L2 后原子生成任务和 implements 关系。复杂任务增加 L3；架构变化通过 reconcile_runs 与 ADR 审批。 || Blueprint, solution, scenario, and requirement express intent. Approved L2 designs atomically generate tasks and implements links. Complex tasks add L3 designs; architecture changes use reconcile_runs and ADR approval.
:::

[1] [2] ADR 是架构决策记录；L2/L3 在此指功能设计和任务详细设计，不是审查框架的判据层。 || ADR means architecture decision record. Here L2/L3 mean feature and task-detail designs, not the review framework's calibration layers.

:::accordion
::panel
### 拆分依据与保留边界 || Decomposition Criteria and Preserved Boundaries
app.js 的 4,538 行和 routes/index.ts 的 1,885 行是定位线索，不是预设超标；重复职责才是拆分依据。 || The 4,538 lines in app.js and 1,885 in routes/index.ts locate review hotspots; they are not predefined violations. Repeated responsibilities justify decomposition.

| 收敛对象 || Consolidation Target | 建议 || Recommendation |
| --- | --- |
| 导航提交与 Job 观察 || Navigation Commits and Job Observation | 先统一生命周期，再分离实体渲染模块；保留原生 JS。 || Unify lifecycle first, then separate entity rendering; retain vanilla JS. |
| 路由中的业务编排 || Workflow Logic in Routes | 按产品意图、设计、执行和证据拆注册；可复用用例进入现有 services。 || Separate registration by intent, design, execution, and evidence; move reusable use cases into existing services. |
| 共享架构数据 || Shared Architecture Data | 功能/集成投影继续复用构件和关系；保留子集批准、ADR 和事务回滚。 || Keep functional/integration projections on shared components and links; preserve subset approval, ADRs, and rollback. |

[2] [3] 不恢复直接需求执行，不增加第二个数据库写入者，也不为减少行数而改接口。 || Do not restore direct requirement execution, add another database writer, or change interfaces merely to reduce line counts.
:::

## #state 03 / Persistent-State Gates :: 创建入口和验收证据存在已复现缺口 || Creation and Acceptance Evidence Have Reproduced Gaps

同一工作项不能因使用 POST 或 PATCH 而获得不同的质量保证。F01 与 F02 两项均在临时 SQLite 与 Fastify inject 中复现，没有启动真实 Agent，也未读写实际项目数据。 || A work item must not receive different quality guarantees depending on POST versus PATCH. Both F01 and F02 were reproduced with temporary SQLite and Fastify inject, without a real agent or live project data.

| 操作 || Operation | 结果 || Result |
| --- | --- |
| POST tasks/bugs，直接指定 done || POST tasks/bugs directly with done | 201；无验证命令或根因也能成为 done || 201; done without a validation command or root cause |
| PATCH task→done，无通过记录 || PATCH task→done without a passing run | 422；更新路径门禁确实生效 || 422; the update-path gate is active |
| 先 POST pass-only run，再 PATCH done || POST a pass-only run, then PATCH done | 201 + 200；无证据也能完成 || 201 + 200; completion without evidence |

[4] [5]

:::accordion
::panel
### F01 / P1：创建可绕过完成门禁 || F01 / P1: Creation Bypasses Completion Gates
普通创建直接调用 repo.create；质量门禁集中在更新服务，形成可复现的入口差异。 || Ordinary creation calls repo.create directly, while quality gates live in the update service, producing a reproducible entry-path inconsistency.

| 机制与影响 || Mechanism and Impact | POST 接受 task/bug 的 done；fixture 中任务无 validation_command、Bug 无 root_cause，仍保存成功。完成率不再可靠。 || POST accepts done for tasks/bugs. The fixture persisted a task without validation_command and a bug without root_cause. Completion metrics cannot be trusted on that basis. |
| --- | --- |
| 方案取舍 || Options and Tradeoffs | 建议普通创建固定 triage；历史状态重建使用独立、可验证来源的导入契约。只补 PATCH 无效；通用 POST 不应成为导入捷径。 || Default ordinary creation to triage; reconstruct historical state only through a separate import contract with validated provenance. Patching PATCH alone does not fix POST. |
| 关闭判据 || Closure Criteria | 普通创建不能直达 ready/in_progress/review/done/blocked；合法初态、明确批准的导入例外和设计任务原子生成都有回归。维护者需确认历史导入例外范围。 || Ordinary creation cannot jump to ready/in_progress/review/done/blocked. Cover valid initial state, explicitly approved import exceptions, and atomic design-task creation. Maintainers must confirm import exceptions. |

[4]

::panel
### F02 / P1：pass 声明未绑定本次验证证据 || F02 / P1: A Pass Claim Is Not Bound to Current Evidence
当前契约接受执行者声明；它没有保证执行证据与本次修改关联。这不等于已证明代码逻辑有误，也不否认 requirement 已完成状态的特例。 || The contract accepts the executor's claim without ensuring that execution evidence belongs to the current change. This does not prove the code logic is wrong or invalidate the explicit implemented-requirement exception.

| 机制与影响 || Mechanism and Impact | done 查询任意历史 pass；run 与 evidence 分开写。仅提交项目、任务和 test_result=pass，随后 done 即获批准。 || The done gate accepts any historical pass; run and evidence are written separately. Providing only project, task, and test_result=pass was sufficient for subsequent completion. |
| --- | --- |
| 方案取舍 || Options and Tradeoffs | run 绑定工作项版本或重开轮次、命令、退出码和输出来源；区分可信执行器记录与人工申报。只要求非空摘要仍允许自证。 || Bind each run to a work-item version or reopen cycle, command, exit code, and output provenance. Distinguish trusted runner records from manual declarations. A nonempty summary alone still permits self-certification. |
| 关闭判据与边界 || Closure Criteria and Limits | 无证据 pass、其他工作项 run、重开前旧 pass 均不满足新的验收；有效结果和批准的人工例外可追踪。API 能校验记录契约，不能证明任意外部文件真实无伪造。 || Reject evidence-free passes, runs for other items, and passes preceding a reopen cycle. Trace valid results and approved manual exceptions. API validation enforces a record contract; it cannot prove arbitrary external files are authentic. |

[5]
:::

## #execution 04 / Execution Lifecycle :: 权限、取消和结构化交付需要独立的运行契约 || Authority, Cancellation, and Structured Delivery Need Separate Contracts

现有消息交付门禁值得保留，但消息、工作记录与进程终态三者边界独立。这三项发现经静态源码确认，未运行真实 CLI 权限或取消实验。 || Retain the existing message-delivery gate, but distinguish messages, work records, and process termination. These three findings are source-confirmed; real CLI permission and cancellation experiments were not run.

:::insight-grid { cols: 3, title: "执行契约总览 || Execution Contract Overview" }
::card F03
### P1 建议 · 只读边界 || Suggested P1 · Read-Only Boundary
禁用 write 不等于禁止 shell 写入；默认权限仍广于分析任务用途。 || Denying write does not prohibit shell writes; default authority exceeds an analysis task's stated purpose.

[6]

::card F04
### P1 · 取消顺序 || P1 · Cancellation Ordering
模型回退先于 canceled 检查；数据库终态不证明进程树已停止。 || Model fallback precedes the canceled check; a database terminal state does not prove process-tree termination.

[7]

::card F05
### P2 · 结果契约 || P2 · Output Contract
消息门禁未覆盖所有声明的 work_run、变更单及目标话题。 || The message gate does not enforce every declared work_run, proposal, or target topic.

[8]
:::

:::accordion
::panel
### F03：显式授权优于零散拒绝 || F03: Explicit Grants over Ad Hoc Denials
buildCommand 默认传入 allow-all-tools 和 allow-all-paths；allowWrite=false 只拒绝 write，不建立文件系统只读边界。 || buildCommand supplies allow-all-tools and allow-all-paths by default. allowWrite=false denies write but does not establish a read-only filesystem boundary.

| 优先级依据 || Priority Rationale | 只读分析不应修改工作区。P1 是基于该边界重要性的建议；安装版本的 CLI 实际权限行为仍需夹具确认，不作漏洞利用声明。 || Read-only analysis should not modify the workspace. P1 is a recommendation based on that boundary's importance; installed CLI behavior still needs fixture confirmation. This is not an exploitation claim. |
| --- | --- |
| 方案取舍 || Options and Tradeoffs | 按 Playbook 授予工具和目录范围；必须运行任意命令时挂载只读工作区。拒绝更多命令不能穷尽 shell 写入，系统级隔离则增加兼容和维护成本。 || Grant tools and paths per playbook; use a read-only workspace when arbitrary commands are necessary. More denied commands cannot exhaust shell writes, while OS isolation adds compatibility and maintenance costs. |
| 关闭判据 || Closure Criteria | 代表性只读任务无法通过文件工具或 shell 写入，但读取代码和允许的结构化提交仍可成功。 || Representative read-only tasks cannot write through file tools or shell commands, while code reads and permitted structured submissions still succeed. |

[6]

::panel
### F04：终止确认先于回滚和终态 || F04: Confirm Termination Before Rollback and Finalization
取消先保存 canceled 并对直接子进程发 SIGTERM；close 回调先检查模型回退，满足条件时可能重启已取消任务。 || Cancellation persists canceled and sends SIGTERM to the direct child. The close handler checks model fallback first, so matching conditions can restart a canceled job.

| 建议机制 || Recommended Mechanism | 取消请求先禁止重试并撤销写入授权；canceling 表示停机中。确认进程树退出后才 canceled 和回滚，并增加可配置截止时间及有界升级终止。 || On cancellation, block retries and revoke write authority. Use canceling while stopping. Finalize and roll back only after process-tree exit; add a configurable deadline and bounded termination escalation. |
| --- | --- |
| 取舍与边界 || Tradeoff and Limits | 移动 canceled 判断可修回退复活，但不能解决后代进程存活。仅发 SIGTERM 也不能证明已停止；本轮未运行残留进程实验。 || Moving the canceled check repairs fallback resurrection, not surviving descendants. Sending SIGTERM alone does not prove termination. No residual-process experiment was run here. |
| 关闭判据 || Closure Criteria | 回退诊断后取消、忽略 SIGTERM、生成后代三种夹具均不重启、不遗留写入者；写入者未停不得回滚；截止时间行为可观察。 || Fixtures for cancellation after fallback diagnostics, SIGTERM resistance, and child descendants must not restart or leave writers. Never roll back before writers stop; deadline behavior must be observable. |

[7]

::panel
### F05：按声明结果验证交付 || F05: Validate Delivery Against Declared Outputs
outcome 声明尚未成为完整 postflight 门禁；消息存在性也未确认目标话题。保留现有缺消息失败处理并直接扩展，避免另起平行机制。 || Declared outcomes do not yet form a complete postflight gate, and message existence does not confirm the target topic. Preserve and extend the existing missing-message failure handling without introducing a parallel system.

| 机制 || Mechanism | engine 向 jobs 传递是否必须发消息，未按 outcome 强制核对 work_run 或提案；消息查询只使用 job_id 和 Agent 角色。 || The engine passes a message requirement to jobs but does not enforce work_run or proposal outcomes. The message query uses job_id and the agent role only. |
| --- | --- |
| 方案取舍 || Options and Tradeoffs | 持久化带类型的 expected_outputs，验证 Job、工作项、话题和来源。失败、部分完成、阻塞分别记录，不要求失败执行制造 pass。增加提示词不能替代检查。 || Persist typed expected_outputs and validate job, item, topic, and provenance. Record failure, partial completion, and blocking separately; never require a failed run to manufacture a pass. Prompt changes cannot replace checks. |
| 关闭判据 || Closure Criteria | 仅发消息却无所需 run、未交提案、发错话题均不能算交付完成；符合该 Playbook 声明的有效结果才通过。 || A message without its required run, a missing proposal, or delivery to the wrong topic must not count as complete. Accept only valid outputs matching that playbook's declaration. |

[8]
:::

## #recovery 05 / Restart Recovery :: 持久化 Job 不等于持久化编排 || Persisted Jobs Do Not Make Orchestration Durable

F06 / P2 包含初始化后续任务和架构提取恢复互斥两个子项。除保存进程记录外，两者均需持久化批次身份和恢复状态；结论经静态源码确认。 || F06 / P2 covers initialization continuation and architecture-extraction recovery exclusion. Beyond process records, both require durable batch identity and recovery state; both findings are source-confirmed.

:::comparison { title: "两个恢复缺口 || Two Recovery Gaps" }
::versus F06-A
### 初始化 continuation 在内存中 || Initialization Continuation Lives in Memory
Set 和定时器保存后续一致性阶段；重启后缺少批次恢复。等待一小时后只要已有成功任务便可继续，即使其他任务仍运行。 || A Set and timer hold the consistency continuation. Restart loses batch recovery. After one hour, any successful predecessor can allow continuation even while others still run.

::versus F06-B
### 恢复失败未重建项目互斥 || Failed Recovery Does Not Restore Project Exclusion
提取回滚失败会保留快照，却没有重建项目锁；新提取可能与尚未完成的恢复冲突。 || A failed extraction rollback retains its snapshot without reconstructing the project lock; new extraction can conflict with unresolved recovery.
:::

[9]

:::accordion
::panel
### F06：在单写者内持久化依赖与恢复租约 || F06: Persist Dependencies and Recovery Leases Within the Single Writer
先明确取消和结果终态，再把编排存入现有数据库；否则只是持久化错误状态。 || Define cancellation and output terminal states before persisting orchestration; otherwise incorrect states merely become durable.

| 建议结构 || Recommended Structure | 保存初始化批次、前置 Job、唯一后续任务声明及项目恢复租约。恢复失败保留阻塞；显式处理超时，禁止提前合并。 || Persist initialization batches, predecessor jobs, a unique continuation claim, and project recovery leases. Keep failed recovery blocked; handle timeout explicitly and forbid early consolidation. |
| --- | --- |
| 取舍 || Tradeoffs | 无批次身份的启动扫描可能混合多次初始化；外部工作流平台则超出当前体量需要。复用同一 API 写入边界。 || Startup scans without batch identity can mix separate initialization attempts; an external workflow platform exceeds current needs. Reuse the API writer boundary. |
| 关闭判据 || Closure Criteria | 前置完成与后续启动之间重启，后续恰好启动一次；前置未结束不合并；恢复失败禁新提取，恢复成功释放租约。依赖 F04/F05。 || Restart between predecessor completion and continuation: launch exactly once. Do not consolidate unfinished predecessors. Block new extraction after recovery failure and release the lease after success. Depends on F04/F05. |

[9]
:::

## #page 06 / Page Lifecycle :: 异步结果必须归属于当前导航 || Async Results Must Belong to the Current Navigation

F07 / P1 合并两个页面生命周期子项，但分别记录证据与验收。修复共享时序比迁移前端框架更直接；两个子项都关闭才计主项完成。 || F07 / P1 groups two page-lifecycle subitems with separate evidence and acceptance criteria. Repairing shared timing is more direct than migrating frameworks. Both subitems must close before the parent finding closes.

:::comparison { title: "页面失败样例 || Page Failure Cases" }
::versus F07-A
### 旧请求覆盖新页面 || An Old Request Overwrites the New Page
tasks 请求先启动，随后导航到 bugs；tasks 最后返回，重新查询全局 listArea 后写入。内存 mock 复现 Bugs 标题配 tasks 内容；不是源应用浏览器 E2E。 || A tasks request starts, then navigation switches to bugs. Tasks resolves last and writes into the global listArea. An in-memory mock reproduced a Bugs heading with tasks content; this was not browser E2E on the source app.

::versus F07-B
### 修订观察器调用不存在 || Revision Polling Calls an Undefined Function
方案/场景重新进入修订状态调用未定义的 startEntityRevisionPoll，异常被空 catch 吞掉。另有两个已有轮询器承担近似职责，属于静态确认的接线缺陷。 || Reopening a revising solution/scenario calls undefined startEntityRevisionPoll, and an empty catch hides the error. Two existing pollers serve similar duties. This is a source-confirmed wiring defect.
:::

[10]

:::accordion
::panel
### F07：一个导航提交规则，一个 Job 观察器 || F07: One Navigation Commit Rule and One Job Observer
复用 dock 已有的请求序号思路；实体只定义刷新回调，不再各自管理完整轮询生命周期。 || Reuse the request-generation approach already present in the dock. Entities define refresh callbacks while a shared observer owns the polling lifecycle.

| 方案与取舍 || Mechanism and Tradeoff | 提交前校验 project/view/entity/generation；统一 Job 订阅、终态和退出清理。AbortController 可减少无效请求，但不能替代提交身份校验。 || Validate project/view/entity/generation before committing. Centralize job subscriptions, terminal handling, and teardown. AbortController reduces wasted requests but does not replace commit-identity checks. |
| --- | --- |
| A 关闭判据 || A Closure Criteria | 乱序响应、快速下钻、返回及跨项目切换后，只能呈现当前导航结果与上下文。 || Out-of-order responses, rapid drill-down, back navigation, and project switches can display only the current route's result and context. |
| B 关闭判据 || B Closure Criteria | 三类产品实体修订后离开再返回，恢复进度并在终态刷新；同一 Job 不重复轮询，失败可见。 || Leaving and returning during revision of all three product entity types restores progress and refreshes terminal results. No duplicate polling per job; failures remain visible. |

[10]
:::

## #alignment 07 / Alignment and Redundancy :: 补齐使用路径，再清理无效表面 || Complete User Paths, Then Remove Inactive Surfaces

已有算法、已有接口或已有命令名字都不能单独证明能力已交付。F08 是目标偏差，F09 是接线缺口，F10 是未交付能力与失效命令；三者不能混称为回归。 || An algorithm, endpoint, or command name alone does not establish delivery. F08 is goal drift, F09 a wiring gap, and F10 an undelivered capability with an invalid command. They are not all regressions.

| 发现 || Finding | 事实 || Fact | 建议决定 || Recommended Decision |
| --- | --- | --- |
| F08 / P2 | ai_next 已返回，首页未呈现 || ai_next is returned but not rendered on home | 恢复下一步入口与空态 || Restore next actions and an empty state |
| F09 / P2 | 语义差异算法未接入版本页 || Semantic diff is not connected to the version page | 接线并补页面回归，或批准撤回 || Wire it with page coverage, or explicitly withdraw it |
| F10 / P2 | export 指向不存在的 exporter.ts || export points to absent exporter.ts | 批准最小导出，或移除无效命令 || Approve minimal export, or remove the invalid command |

[11] [12] [13]

:::accordion
::panel
### F08：让首页重新回答 AI 下一步 || F08: Make Home Show the Next AI Action
buildHome 产生 ai_next，但最终首页模板未使用，偏离已有验收目标；重复聚合也增加指标漂移的维护风险。 || buildHome produces ai_next, but the final home template ignores it, departing from the acceptance goal. Repeated aggregation also increases metric-drift maintenance risk.

| 方案取舍 || Options and Tradeoffs | 恢复紧凑下一步列表与空态；首页组合多个聚合接口，验证命令覆盖率在不同分支重复计算，应复用指标口径。若删 ai_next，先修订目标。 || Restore a compact next-action list and empty state. Home combines several aggregates, and validation-command coverage is computed in multiple branches; reuse one metric definition. Revise the goal before deleting ai_next. |
| --- | --- |
| 关闭判据 || Closure Criteria | 有 ready_for_agent 任务时显示下一步和目标链接，无任务时有明确空态；不同页面的重复指标一致。 || Show next actions and target links for ready_for_agent tasks, with an explicit empty state otherwise. Shared metrics must agree across pages. |

[11]

::panel
### F09：版本差异需要页面级交付 || F09: Version Differences Need Page-Level Delivery
蓝图差异算法及纯函数测试存在，但阅读页没有消费；Job 变更摘要不能代替两份持久化版本的实际比较。 || The blueprint diff algorithm and unit-level checks exist, but the reader does not consume it. A job summary cannot substitute for comparing two persisted versions.

| 方案取舍 || Options and Tradeoffs | 连接比较对象选择与现有算法，覆盖字段、列表和路线图；若取消能力，明确修订文档并删除失去用途的代码。 || Connect comparison selection to the existing algorithm for fields, lists, and roadmaps. If the capability is canceled, explicitly revise documentation and remove unused code. |
| --- | --- |
| 关闭判据 || Closure Criteria | 当前与历史版本选择正确比较对象，页面呈现实际差异；新增页面级断言，纯函数通过不算接线完成。 || Current and historical versions select the correct comparison and render actual differences. Add page-level assertions; a passing pure function does not establish wiring. |

[12]

::panel
### F10：导出能力须交付或撤回入口 || F10: Deliver Export or Withdraw Its Entry Point
package.json 指向缺失的 exporter.ts；roadmap 已将 JSON/Markdown 导出列为待办，不能以阶段概括代替能力清单。 || package.json points to missing exporter.ts. The roadmap already lists JSON/Markdown export as unfinished; a phase summary cannot replace a capability inventory.

| 方案取舍 || Options and Tradeoffs | 需要快照时先批准最小导出设计；否则移除无效命令并准确表述完成范围。快照不等于完整灾难恢复，不增加第二个 SQLite 写入者。 || Approve a minimal export design if snapshots are needed; otherwise remove the invalid command and clarify delivered scope. Snapshots are not full disaster recovery. Do not add a second SQLite writer. |
| --- | --- |
| 关闭判据 || Closure Criteria | 所有声明可运行的命令都有实现；若交付导出，以隔离数据集核对项目过滤、实体关系及 JSON/Markdown 输出。 || Every advertised runnable command has an implementation. If export ships, verify project filtering, entity relationships, and JSON/Markdown output using isolated fixtures. |

[13]
:::

## #ledger 08 / Remediation Tracking :: 用稳定编号连接方案、执行和船长验收 || Connect Findings, Implementation, and Captain Acceptance with Stable IDs

这是 2026-09-08 的静态评审快照，不是数据库的第二个看板。全部发现处于已发现，修复关闭 0/10。建议负责角色不是实际指派；没有承诺日期、批准排期或创建项目任务。 || This is a static review snapshot dated 2026-09-08, not a second database-backed board. All findings are identified, with 0/10 fixes closed. Suggested roles are not assignments; there are no promised dates, approved schedules, or newly created project tasks.

| 发现 / 优先级 || Finding / Priority | 建议角色 || Suggested Role | 状态 || Status | 关闭依据 || Closure Basis |
| --- | --- | --- | --- |
| [F01 / P1](#f01) | API | 已发现 || Identified | 创建初态与导入例外契约 || Initial-state and import-exception contract |
| [F02 / P1](#f02) | API | 已发现 || Identified | 本次版本的可追溯验证 || Traceable validation for the current revision |
| [F03 / P1](#f03) | Runner | 已发现 || Identified | 只读文件及 shell 夹具 || Read-only file and shell fixtures |
| [F04 / P1](#f04) | Runner | 已发现 || Identified | 取消不重试、进程树终止 || No retry after cancel; process-tree termination |
| [F05 / P2](#f05) | Runner | 已发现 || Identified | 按声明验证结构化结果 || Declared structured outputs enforced |
| [F07 / P1](#f07) | Dashboard | 已发现 || Identified | A 导航隔离 + B 观察器恢复 || A navigation isolation + B observer recovery |

先建立失败回归，再作最小修复。F05 虽为 P2，仍进入阶段 A，因为它决定后续编排采用什么完成信号。 || Establish failing regression cases before minimal fixes. F05 is P2 but belongs in Phase A because it defines the completion signal used by subsequent orchestration.

| 发现 / 阶段 || Finding / Phase | 建议角色 || Suggested Role | 状态 || Status | 依赖与关闭依据 || Dependencies and Closure |
| --- | --- | --- | --- |
| [F06 / P2 / B](#f06) | Runner + 数据层 || Runner + Data Layer | 已发现 || Identified | 依赖 F04/F05；批次恢复恰好一次，失败恢复保持互斥 || After F04/F05: exactly-once continuation and exclusion during failed recovery |
| [F08 / P2 / C](#f08) | 产品 + Dashboard || Product + Dashboard | 已发现 || Identified | 复用 F07；下一步、空态及指标一致 || Reuse F07; next actions, empty state, and consistent metrics |
| [F09 / P2 / C](#f09) | Dashboard | 已发现 || Identified | 复用 F07；版本页真正消费差异算法 || Reuse F07; the version page consumes the diff algorithm |
| [F10 / P2 / C](#f10) | API + 文档 || API + Documentation | 已发现 || Identified | 先决定交付或撤回；已声明命令可用 || Decide delivery or withdrawal first; advertised commands work |

:::accordion
::panel
### 台账更新与关闭协议 || Ledger Updates and Closure Protocol
文章保存审查事实；真实整改状态应进入现有项目系统，再按证据更新文章日期与快照。 || The article preserves review facts. Actual remediation state belongs in the existing project system; update the article's date and snapshot from evidence.

1. 每条保存 finding_id、建议优先级、负责角色、状态、依赖、方案决定和关闭证据。 || Track finding_id, suggested priority, role, status, dependencies, solution decision, and closure evidence.
2. 已发现 → 已批准整改 → 实施中 → 待验收 → 已关闭；风险接受另列，不计作修复。 || Identified → remediation approved → implementing → acceptance review → closed. Record risk acceptance separately; it is not a fix.
3. finding_id → Bug 或批准设计/任务 → work_run/evidence → 船长验收 → 文章快照更新；review 不得误记为 done。 || finding_id → bug or approved design/task → work_run/evidence → captain acceptance → article snapshot update. Review is not done.
4. Bug 走根因优先；新能力与结构重构先批准 L2，复杂任务补 L3，架构变化附 ADR。公开页不写真实项目任务编号。 || Bugs follow root-cause-first handling. New capabilities and structural refactoring require approved L2 designs, complex tasks need L3, and architecture changes need ADRs. Keep real project task IDs out of the public page.
:::

## #baseline 09 / Assessment and Baseline :: 以已复现的数据完整性问题决定整改优先级 || Prioritize Remediation Using Reproduced Data-Integrity Failures

源仓库没有项目专用 L2 审查判据或 L3 历史基线。本次先依据 AGENTS 的单写者、门禁、交付和审批不变量标定临时判据，未补建源仓库配置。评分是首轮建议，不是既有标准认证。 || The source repository has no project-specific L2 review rubric or L3 historical baseline. This review derives provisional criteria from AGENTS invariants for the single writer, gates, delivery, and approval. No source review configuration was added. These are initial recommendations, not certification against an established standard.

| 维度 || Dimension | 等级 || Grade | 依据与置信度 || Basis and Confidence |
| --- | --- | --- |
| 架构一致性 || Architecture Consistency | C | 审批链可保留，创建入口未统一门禁；高置信。[1][2][4] || Keep the approval chain; creation gates are inconsistent. High confidence. [1][2][4] |
| 代码重复度 || Duplication | B | 共享投影良好，观察器和统计局部重复；中置信。未证明三处大段重复。[2][10][11] || Shared projections are sound; observers and metrics have local duplication. Medium confidence; no three-way large clone established. [2][10][11] |
| 命名与可读性 || Naming and Readability | B | 领域命名可识别，热点集中多种职责；中置信。长度不单独定级。[3] || Domain names are recognizable; hotspots concentrate responsibilities. Medium confidence; length alone does not determine the grade. [3] |
| 错误处理与健壮性 || Error Handling and Robustness | C | 已有缺消息保护；取消顺序和结果契约仍有缺口。静态高置信，未宣称生产事故。[7][8] || Missing-message protection exists; cancellation ordering and output contracts remain incomplete. High source confidence; no production incident claimed. [7][8] |
| 可测试性 || Testability | C | 隔离 API/服务脚本可复用，但入口和证据缺口未被现有检查发现；高置信。[4][5][14] || Isolated API/service scripts are reusable, but existing checks missed entry and evidence gaps. High confidence. [4][5][14] |

| 维度 || Dimension | 等级 || Grade | 依据与置信度 || Basis and Confidence |
| --- | --- | --- |
| 性能与资源 || Performance and Resources | B* | 仅静态、低置信：单例 DB 与分块日志有基础，重复聚合值得测量；无延迟/吞吐/内存基线，运行性能不评级。[1][7][11] || Static only, low confidence: singleton DB and chunked log reads provide a foundation; measure repeated aggregation. No latency, throughput, or memory baseline; runtime performance is unrated. [1][7][11] |
| 安全与数据完整性 || Security and Data Integrity | D | 数据完整性范围、高置信：普通 API 可制造无门禁 done。不是安全渗透结论。[4][5] || Data-integrity scope, high confidence: ordinary APIs can create ungated done records. Not a penetration-test verdict. [4][5] |
| 组件复用 || Component Reuse | B | 实体阅读器、投影与 i18n 基础已存在，生命周期应收敛；中置信。[10][12][14] || Entity readers, projections, and i18n exist; consolidate lifecycle management. Medium confidence. [10][12][14] |
| 文档健康 || Documentation Health | C | 目标/接线不一致、阶段完成范围过宽；导出待办已有说明。高置信。[11][12][13] || Goals and wiring diverge; phase-completion claims are broad. Export is explicitly unfinished. High confidence. [11][12][13] |

A=保持，B=局部改善，C=下一轮整改，D=先治理关键不变量。总体按最高风险取 D，不取平均；建议先专项整改，不表示删除现有功能或重做整个系统。 || A: retain; B: local improvement; C: remediate next cycle; D: repair critical invariants first. Overall D follows the highest-risk dimension, not an average. Prioritize targeted remediation; do not remove existing features or rebuild the system.

:::accordion
::panel
### 首轮规模基线与验证范围 || Initial Size Baseline and Validation Scope
包含当前未提交文件，排除 src/public/vendor；按换行符统计代码及 SQL，不含 CSS/HTML。没有历史对照，不计算增长率。 || Includes uncommitted files and excludes src/public/vendor. Counts newline characters in code and SQL, excluding CSS/HTML. There is no historical comparison or growth calculation.

| 范围 || Scope | 文件数 || Files | 行数 || Lines |
| --- | --- | --- |
| src (.ts/.js/.mjs) | 42 | 15,694 |
| scripts (.mjs) | 13 | 1,693 |
| migrations (.sql) | 20 | 766 |
| 合计 || Total | 75 | 18,153 |

Node v22.22.3 / macOS。现有 typecheck、design API、Bug resolution、conversation delivery、delegation tools 检查通过；Dashboard 审阅中的 entity-reader、blueprint-diff、i18n 检查通过。直接复用现有测试基础，无需把引入新框架作为前置条件。 || Node v22.22.3 / macOS. Existing typecheck, design API, bug resolution, conversation delivery, and delegation tools checks passed; dashboard review also passed entity-reader, blueprint-diff, and i18n checks. Reuse this test foundation directly without requiring a new framework.

[14]
:::

## #references 10 / Source Evidence and Scope :: 行号属于工作树，提交号不能代替未提交快照 || Line References Identify the Working Tree, Not Just Its Base Commit

证据仅包含源码位置和脱敏复现条件。没有公开项目数据库、真实任务编号、日志、提示词或令牌，也没有发布源代码副本。引用供持有相同工作树的维护者复核。 || Evidence includes source locations and sanitized reproduction conditions only. No project database, real task IDs, logs, prompts, tokens, or source-code copies are published. References are for maintainers with the matching working tree.

- **[1] 单写者与分层 || [1] Single Writer and Layers** `AGENTS.md:18–34; src/db/index.ts:7–16; src/mcp/server.mjs:8–35; src/server.ts:11–35`
- **[2] 原子设计任务、变更单与共享投影 || [2] Atomic Design Tasks, Proposals, and Shared Projections** `src/services/designs.ts:473–496; src/services/reconcile.ts:176–193,246–260,623–638; src/services/blueprintViews.ts:133–202`
- **[3] 职责热点与重复编排 || [3] Responsibility Hotspots and Repeated Orchestration** `src/public/app.js:1924–1982,2485–2551,3360–3393; src/routes/index.ts:1175–1245`
- **[4] F01 创建与更新门禁不对称 || [4] F01 Creation and Update Gate Asymmetry** `src/routes/index.ts:1106–1124; src/services/transitions.ts:13–48; migrations/001_init.sql:115–165`
- **[5] F02 pass 与证据写入契约 || [5] F02 Pass and Evidence Contracts** `src/domain/qualityGates.ts:22–30,149–159; src/routes/index.ts:1763–1821; docs/05-roadmap.md:21–25`

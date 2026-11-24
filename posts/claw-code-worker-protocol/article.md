---
title: 为什么自治代理需要显式状态机而非「scrape 终端再猜」
eyebrow: Claw Code · Series 02 · Worker Protocol
brand: 智能体 · Claw Code 系列 · 02
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: 传统 harness 让代理通过 grep 终端输出来判断「现在能不能发任务」。这种方法有两个致命缺陷：(1) 观察与真相解耦——终端可能已经变化但你还没看到；(2) 失败没有分类——日志里只有「红了」，到底是编译红、测试红还是分支陈旧红？
hero_actions:
  - "看状态图 | #fsm"
  - "回看总览 | ../claw-code-analysis/index.html"
panel_label: 核心设计原则
panel_title: 三条不可妥协的原则
panel:
  - 唯一真相源 · worker.status
  - 失败即数据 · 分类 + 可恢复性
  - 恢复即配方 · 最多一次 + 升级出口
metrics:
  - "Worker 状态 || Worker states | 6 | 确定性有限状态机，转换由 observe 驱动 || Deterministic FSM, transitions driven by observe"
  - "启动险境 || Boot hazards | 2 | 信任门阻塞 / 提示错投，两种都有自动恢复路径 || Trust gate / prompt misdelivery, both with auto-recovery"
  - "Lane 事件语义 || Lane event semantics | 16 | 从噪音日志到类型化语义流 || From noisy logs to typed semantic stream"
  - "恢复配方 || Recovery recipes | 7 | 每个场景最多自动恢复 1 次，失败即升级 || Max 1 auto-recovery per scenario, then escalate"
  - "绿度等级 || Green levels | 4 | Targeted → Package → Workspace → MergeReady"
style:
  accent: "#fb923c"
---

## #gap 01 / The Gap :: 从「grep 终端输出」到「读状态机」的认知缺口

绝大多数 code agent 框架把终端当作唯一的观察窗口：发一条命令、grep stdout、做 if-else、决定下一步。这种模式在**单条命令**尺度够用，但一旦进入**会话级别**的自治（「在这个分支上跑完编译、测试、提交、等 CI 过」），它的局限就暴露出来。

### grep 模式的失败

- 「session exists」不等于「session ready」——过早发任务落到 shell 或 trust prompt 缓冲区
- 终端可能已变化但 observer 还没看到——观察与真相解耦
- 日志只有「红了」，是编译红 / 测试红 / 分支陈旧红？失败无分类
- grep 本身有噪声——构建日志一秒三屏，有用信号被淹没
- 恢复靠写 ad-hoc if-else，每个新事故加一条 patch

### 状态机模式的保证

- worker.status 是唯一真相源——任何时刻读它就知道能否发任务
- observe() 是唯一驱动转换的函数——消除观察/真相之间的时间窗口
- 失败带 failure_class 分类——不同类型走不同恢复配方
- Lane 事件是结构化类型流——噪声被压缩成一行摘要
- 恢复是声明式配方——新场景只需添加一条 recipe，不改控制流

:::callout { title: "核心断言 || Core assertion" }
自治代理不是需要更好的 grep，而是需要不同的抽象层：一台状态机，把终端观察翻译成状态转换，把失败翻译成类型化数据，把恢复翻译成可查表的配方。 || Autonomous agents don't need better grep—they need a different abstraction: a state machine that translates terminal observation into transitions, failures into typed data, recovery into table-lookup recipes.
:::

## #philosophy 02 / Design Philosophy :: 三条设计原则：为什么这样建模

:::insight-grid { cols: 3, title: "三条不可妥协的原则" }
::card 01
### 唯一真相源：worker.status
原则 1

传统 harness 维护多个 flag：is_ready、is_running、has_error……flag 组合爆炸导致矛盾状态（is_ready && has_error 意味着什么？）。状态机用**互斥枚举**替代 flag 集合——任何时刻 worker 只可能处于 6 个状态之一，不存在矛盾组合。代理只读一个字段就够了。

::card 02
### 失败即数据：分类 + 可恢复性
原则 2

错误不是字符串，而是带结构的**数据**。每个失败至少携带 failure_class（11 种之一）和 recoverable 布尔。恢复系统据此查表，不需要 parse 错误信息来猜测原因。这让仪表盘聚合和策略引擎判断都变成「match 枚举」而非「regex 字符串」。

::card 03
### 恢复即配方：最多一次 + 升级出口
原则 3

同一个场景只允许自动恢复一次。理由是**两次相同的恢复大概率做相同的无用功**。成功则继续；失败则交给明确的升级策略（人工介入 / 降级运行 / 终止），不存在无限重试耗尽 token 的死循环。
:::

这三条原则贯穿下面所有小节。每看到一个设计决策，可以问「它在服务哪条原则」来验证一致性。

## #fsm 03 / State Diagram :: 一张图理解 Worker 的 6 个状态与转换

先看全局：Worker 从 **Spawning** 出发，经过可选的 **TrustRequired** 旁路，到达唯一允许接收任务的 **ReadyForPrompt**，进入 **Running**，最终走向 **Finished** 或 **Failed**。任何状态都可以因为异常直接跳到 Failed；restart 可以从任何状态回到 Spawning。

Spawning

observe() 检测到 trust 关键词 ?

↓

是

TrustRequired

auto-resolve 或 manual

↓

回到 Spawning 继续 observe

否

ReadyForPrompt

send_prompt() 投递任务

↓

Running

工作结束

↓

Finished

Failed

↻

restart() → 回到 Spawning（事件流保留）

⚡

任何状态 → Failed（异常跳转）

:::accordion { title: "状态转换的关键约束" }
::panel { open: true }
### ReadyForPrompt 是唯一的可发任务状态 || ReadyForPrompt is the sole send-able state
这是整台状态机的核心设计决策。在 Spawning、TrustRequired、Running、Finished、Failed 五个状态下调用 `send_prompt()` 都会返回 not ready 错误。这意味着**提示错投在协议层面被结构性消灭**——不是靠「检测到再补救」，而是靠「类型系统不允许」。

传统方式是发任务后 grep 终端看有没有 command not found，但这有时间窗口——发出去之后 grep 之前如果终端已经吞掉了错误信息，你永远不知道。状态机前置了这个判断。

::panel
### observe() 是唯一的自主转换驱动 || observe() is the sole autonomous transition driver
`observe(worker_id, screen_text)` 是整台机器里唯一会「被动」改变状态的方法。其余 API（send_prompt、resolve_trust、restart、finish）都是「显式命令」——调用方主动触发，有明确的前置条件断言。这个设计确保了：

- 只有一个入口在读终端输出并翻译成状态变化——不存在两个不同地方同时改状态的竞争
- 观察行为与命令行为分离——测试时可以 mock observe 返回而不必真跑终端

::panel
### restart 保留事件流而非清空 || restart preserves event log, does not clear
很多状态机实现在 reset 时清空所有历史。Claw Code 的 restart() 把状态回到 Spawning 但**事件流保留**：之前的 trust_required、prompt_misdelivery、failed 事件全部还在。这让恢复配方可以看到「这是第 2 次 restart」并决定升级而非重试。事件日志是不可变的审计轨迹。
:::

## #hazards 04 / Boot Hazards :: 启动的两个险境：信任门与提示错投

Worker 从 Spawning 到 ReadyForPrompt 只有几秒的时间窗，但这几秒是事故最密集的阶段。Claw Code 把两种最常见的启动事故——**信任门阻塞**和**提示错投**——建模成状态机的一等概念，而不是事后用 regex 去抓。

:::insight-grid { cols: 2, title: "两种启动险境" }
::card 01
### 信任门（TrustRequired）
险境 A

代理 spawn 后 TUI 弹出 trust prompt（「你信任这个目录吗？」）。此时任何发到 stdin 的任务文本会被 trust prompt 吃掉而非转给 agent。传统解法：sleep 几秒再发。Claw Code 的解法：observe() 在屏幕文本中检测 trust 关键词，进入 TrustRequired 状态。

**自动解的条件**：创建 worker 时传入 trusted_roots 允许列表。若当前 cwd 命中，同一个 observe 调用内立即自解（push trust_resolved { AutoAllowlisted }），状态回到 Spawning 继续轮询直到 ReadyForPrompt。不命中则保持阻塞，clawhip 在频道里渲染一条「请人按确认」的事件。

::card 02
### 提示错投（PromptMisdelivery）
险境 B

任务文本被送到了 shell 而非 agent。终端里出现 command not found、zsh: 等 shell 错误，且上次 prompt 的文本片段也在屏幕里——这是提示进了 shell 的铁证。

**三种检测信号**：(1) Shell——shell 错误 + prompt 回显；(2) WrongTarget——观察到的 cwd 与 worker 注册的 cwd 不一致；(3) Unknown——prompt_in_flight 长时间无 running cue 也无错误（兜底防 ghost-running）。

**自动恢复路径**：若创建时开启 auto_recover_prompt_misdelivery，检测后同步把 last_prompt 复制到 replay_prompt，状态回到 ReadyForPrompt，下一次 send_prompt(None) 自动取 replay 内容重投。最多一次。
:::

:::accordion { title: "为什么不用 sleep + retry" }
::panel { open: true }
### sleep 的三个致命问题 || Three fatal problems with sleep
- **不可预测**：trust prompt 出现的时机取决于文件系统缓存、网络延迟、shell 初始化速度。任何固定的 sleep 值都可能太短（没过 trust prompt）或太长（白白等）
- **不可组合**：如果一个 harness 管 5 个并行 worker，每个 sleep 3 秒就是 15 秒浪费；而状态机是事件驱动的——谁先 ready 谁先收任务
- **不可诊断**：sleep 之后 grep 成功了，但你不知道 trust prompt 是否真被通过了——可能只是它还没弹出来而你恰好在窗口内溜过去了。这是隐性 flaky

::panel
### prompt_delivery_attempts 计数器的作用 || Role of prompt_delivery_attempts counter
每次 send_prompt() 成功都递增 prompt_delivery_attempts（包括 replay 重投）。这个计数器单调递增，**restart 不重置**。策略引擎据此判断「同一个 worker 已经重投 3 次了，问题可能不是 timing 而是结构性的」——这是升级到 AlertHuman 的条件之一。
:::

## #events 05 / Semantic Events :: 从日志噪音到语义事件流：Lane 事件总线

状态机解决了「当前是什么状态」的问题。但代理还需要知道**发生过什么**——尤其是在 Discord/clawhip 频道里展示进度和异常时。传统做法是 scrape pane 文本 + regex。Claw Code 用 16 个**具名事件**替代，每个事件是一条不可变记录。

设计原理：Lane（车道）是比 Worker 更高一级的抽象——一个 lane 对应一个「分支上的完整工作流」（从创建分支到合并）。Worker 是 lane 的执行单元。Lane 事件把 Worker 内部状态变化「翻译」成外部可消费的语义。

### `lane.started`

车道启动，绑定 worker_id。从这一刻起所有后续事件都关联到同一条 lane。

### `lane.ready`

Worker 进入 ReadyForPrompt。频道里渲染为「worker #3 就绪，等待任务」。

### `lane.commit.created`

git commit 落地。频道里渲染为「feat: add login validation (abc1234)」。

### `lane.green`

按 GreenLevel 契约验证通过（见 &sect;7）。频道里渲染为「✓ WorkspaceGreen」。

### `lane.pr.opened`

GitHub PR 打开。频道里渲染为可点击链接。

### `lane.merge.ready` → `lane.merged` → `lane.finished`

合并前置条件满足 → 合入 main → 车道闭合。finished 事件 detail 里携带 SummaryCompressor 压缩后的一句话摘要。

而如果过程中出错：

### `branch.stale_against_main`

stale_branch 模块发现当前分支落后 main 3 个 commit。在跑 broad test **之前**主动发出——避免「先跑红了再去查是不是因为陈旧」。

### `lane.blocked`

带 LaneEventBlocker { failure_class: compile, detail: "missing import in crate X" }。failure_class 是 11 种分类之一（见折叠区），detail 是人可读文本。

### `lane.reconciled`

恢复配方执行后状态对齐。意味着「曾经出错，已自动修复」。

:::accordion { title: "事件设计细节" }
::panel { open: true }
### 为什么是 16 个事件而不是自由文本 || Why 16 named events, not free text
自由文本事件（{ type: "log", message: "..." }）的问题是**消费方必须 parse 文本才能决定展示方式**。16 个具名事件意味着每个事件都有确定的 UI 渲染规则——lane.green 永远渲染为绿色勾，lane.blocked 永远渲染为红色警告卡，lane.superseded 渲染为灰色划线。消费方只需要 switch-case，不需要 regex。

::panel
### 11 个失败分类（LaneFailureClass） || 11 failure classes (LaneFailureClass)
按事故起源分四组，让仪表盘可以按类别聚合统计：

prompt_delivery

trust_gate

branch_divergence

compile

test

tool_runtime

gateway_routing

plugin_startup

mcp_startup

mcp_handshake

infra

分类不是装饰——它是恢复配方查表的 key，也是策略引擎按分支做不同决策的条件输入。

::panel
### SummaryCompressor：从事件流到一句话 || SummaryCompressor: event stream to one-liner
summary_compression.rs（300 行）把整条车道事件流压缩成四元组：

- **current phase**：现在在做什么（编译 / 测试 / 等 CI）
- **last good checkpoint**：最近一次成功是什么（最后一个 green commit）
- **current blocker**：当前卡在哪（failure_class + detail 的缩写）
- **recommended next action**：建议做什么（rebase / fix import / wait CI）

效果：以前频道每分钟刷三屏 cargo 日志，现在每条 lane.finished 事件配一行结构化摘要。代理直接消费 detail 字段决定下一步，不需要人去翻日志。

::panel
### Worker 事件与 Lane 事件：翻译而非复制 || Worker vs Lane events: translation, not duplication
Worker 事件（10 种）是内部实现细节；Lane 事件（16 种）是外部语义。两者通过一个桥接函数翻译，而不是一对一复制。例如：

- worker.failed(PromptDelivery) → lane.blocked { failure_class: prompt_delivery }
- worker.finished 不直接变成 lane.finished——还要等 green contract 和 push 确认
- 多个 worker 事件可能折叠成同一个 lane 事件——observer 连续看到三次 trust_required 只发一条 lane 级别的 blocked

这种翻译层的存在让 Worker 内部重构不影响外部消费者。
:::

## #recovery 06 / Recovery Philosophy :: 恢复配方：把 ad-hoc if-else 变成声明式查表

传统 harness 的恢复逻辑散落在控制流里：「如果 compile 红了就重跑，如果 trust prompt 卡了就发个 Y」。每增加一种新事故就要改控制流，很快变成不可维护的意大利面条。Claw Code 的解法是把恢复逻辑从控制流中**提取成数据**——7 个声明式的 RecoveryRecipe。

trust_prompt_unresolved

- AcceptTrustPrompt

max_attempts=

1

· escalation=

AlertHuman

prompt_misdelivery

- RedirectPromptToAgent

max_attempts=

1

· escalation=

AlertHuman

stale_branch

- RebaseBranch
- CleanBuild

max_attempts=

1

· escalation=

AlertHuman

compile_red_cross_crate

- CleanBuild

max_attempts=

1

· escalation=

AlertHuman

mcp_handshake_failure

- RetryMcpHandshake { timeout: 5000 }

max_attempts=

1

· escalation=

Abort

partial_plugin_startup

- RestartPlugin { name }
- RetryMcpHandshake { timeout: 3000 }

max_attempts=

1

· escalation=

LogAndContinue

provider_failure

- RestartWorker

max_attempts=

1

· escalation=

AlertHuman

:::accordion { title: "恢复设计的三个关键决策" }
::panel { open: true }
### 为什么 max_attempts 都是 1 || Why max_attempts is always 1
代理消耗 token 是有成本的。每一次自动恢复意味着：(1) 构建/测试的时间成本，(2) 可能产生的额外 LLM 调用成本。同一种失败模式重试两次成功的概率远低于第一次——大多数情况是底层条件没变。

**一次性策略的推论**：如果你需要更多重试次数，那说明你的检测或恢复步骤有问题——应该修检测逻辑而不是加 retry 次数。这是一种「向上施压」的设计哲学。

::panel
### 三种升级策略的选择逻辑 || Selection logic for three escalation policies
升级策略不是随机分配的，背后有明确的决策树：

- **AlertHuman**——失败可能影响合并结果或产品质量。例如 trust prompt 解不了说明环境配置有问题，需要人来判断
- **LogAndContinue**——失败不影响主路径，降级运行即可。例如一个 MCP 插件启动失败但其它插件可用（详见 Series 04 MCP 降级模式）
- **Abort**——继续运行会浪费 token 而无实际价值。例如 MCP handshake 失败通常意味着 server 永久不可达

::panel
### 配方是数据，不是代码 || Recipes are data, not code
每个 recipe 是一个 { scenario, steps, max_attempts, escalation_policy } 数据结构。执行引擎 attempt_recovery() 只做一件事：查表 → 检查计数 → 顺序执行 steps → 记录结果。

这种设计的好处是**新增场景只需要加一条 recipe，不需要改执行逻辑**。步骤原语只有 8 个（AcceptTrustPrompt / RedirectPromptToAgent / RebaseBranch / CleanBuild / RetryMcpHandshake / RestartPlugin / RestartWorker / EscalateToHuman），所有配方都是这些原语的组合。
:::

## #green 07 / Green Contract :: 绿度契约：把「绿了」从布尔变成 4 级语义

「测试绿了」是代理报告里最常见也最危险的一句话。危险在于它是模糊的——跑了一个单元测试绿了和跑了整个 workspace 绿了是完全不同的保证级别。Claw Code 用 GreenLevel 把「绿」拆成 4 档，每档有明确的定义。

| 级别 | 含义 | 可用于 |
| --- | --- | --- |
| `TargetedGreen` | 只跑了与改动直接相关的 N 个测试 | 本地快速反馈，不可用于合并 |
| `PackageGreen` | 所在 crate 的 cargo test 全绿 | 文档类 PR 的合并门槛 |
| `WorkspaceGreen` | cargo test --workspace 全绿 | Feature PR 的测试门槛（还需 stale check） |
| `MergeReadyGreen` | WorkspaceGreen + 通过 stale_branch 检查 + commit 已 push | Feature PR 的合并门槛 |

策略引擎按车道类型要求不同的最低绿度：feature 车道要求 MergeReadyGreen，文档车道允许 PackageGreen 即可放行。这消灭了「只跑了 targeted test 就声称绿了，下一个并行 worker 在 workspace 维度立刻翻车」的事故。

:::accordion { title: "stale_branch 检测与绿度的关系" }
::panel { open: true }
### 为什么 stale check 在跑 broad test 之前 || Why stale check precedes broad tests
如果先跑 cargo test --workspace 再查 stale，可能会出现：测试红了 → 代理花 30 分钟 debug → 发现是 main 上已经修复的 bug，分支没 rebase。浪费的不只是 token，还有人的注意力。

stale_branch.rs 的设计是**在任何 broad test 之前先比较当前分支与 main**：behind 数 / ahead 数 / 是否漏掉关键 fix commit。如果陈旧，直接发 branch.stale_against_main 事件 + 触发 stale_branch recovery 配方（RebaseBranch + CleanBuild），而不是让代理去 debug 一个不存在的 regression。

::panel
### lane completion 的三个必要条件 || Three necessary conditions for lane completion
detect_lane_completion() 同时观察三件事——(1) session 已 finished；(2) tests 已达到要求的 GreenLevel；(3) push 已完成。三者皆真才把 LaneContext.completed 翻成 true，触发策略引擎的 closeout 路径自动 emit lane.finished 与摘要。

这避免了「session finished 但测试没跑完就声称 done」或「测试绿了但 commit 没 push」的不完整报告。
:::

## #refs 08 / References :: 参考来源

- [1] worker_boot.rs (1,076 LOC) | WorkerStatus 6 状态 / WorkerEventKind 10 事件 / WorkerRegistry / observe / detect_trust_prompt / detect_prompt_misdelivery
- [2] recovery_recipes.rs (630 LOC) | 7 FailureScenario + RecoveryRecipe + attempt_recovery + 一次性策略
- [3] lane_events.rs (243 LOC) | 16 LaneEventName / 11 LaneFailureClass / LaneEventBlocker
- [4] policy_engine.rs (581 LOC) | LaneContext + closeout + lane completion 检测
- [5] stale_branch.rs (416 LOC) | branch.stale_against_main 事件源
- [6] summary_compression.rs (300 LOC) | compress_summary_text 四元组
- [7] trust_resolver.rs (299 LOC) | trust 关键词检测与允许列表
- [8] green_contract.rs (152 LOC) | GreenLevel 四档定义
- [9] session_control.rs (458 LOC) | WorkerRegistry 上层会话控制接口
- [10] ROADMAP.md | §1–§11 设计来源

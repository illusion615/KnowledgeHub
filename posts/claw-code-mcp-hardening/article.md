---
title: 为什么 MCP 需要显式生命周期而非「全有或全无」
eyebrow: Claw Code · Series 04 · MCP Hardening
brand: 智能体 · Claw Code 系列 · 04
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: "MCP 在很多 harness 里是「黑盒插件」：一个 server 握手失败就整个不可用，错误日志只有一行 `mcp init failed`，模型还在调用已经退出的 server 浪费 token。本文先讲*为什么需要把 MCP 从插件升格为带有生命周期的子系统*，用一张生命周期图建立全局理解，再在折叠区展开每个设计选择背后的原理。"
hero_actions:
  - "看生命周期图 | #lifecycle"
  - "回看运行时 | ../claw-code-runtime-anatomy/index.html"
panel_label: 核心设计原则
panel_title: 三条 MCP 硬化原则
panel:
  - 单 server 失败不等于全死
  - 错误必须回答 6 个问题
  - 阶段转换受守卫约束
metrics:
  - "Lifecycle 阶段 || Lifecycle phases | 11 | 4 个分区 · 守卫转换 || 4 partitions, guarded transitions"
  - "阶段结果三态 || Phase result tri-state | 3 | Success / Failure / Timeout"
  - "错误面字段 || Error surface fields | 6 | 每个错误必须回答的 6 个问题 || 6 questions every error must answer"
  - "降级报告维度 || Degraded report dimensions | 4 | 健康 / 故障 / 可用工具 / 缺失工具 || healthy / failed / available / missing"
  - "模块 LOC || Module LOC | 5,487 | 5 个模块共计 || 5 modules total"
style:
  accent: "#fb923c"
---

## #gap 01 / The Gap :: 「黑盒 MCP」在生产代理里的三类事故

大多数 harness 把 MCP 当作一个开关：能连就全有，不能连就全无。这种模式在单 server 环境够用，但一旦配置了多个 stdio/sse server，三类事故反复出现。

### 典型 harness 的 MCP

- 5 个 server 配一个开关——1 个 binary 不存在，整个 MCP 标记 down
- 错误日志只有 `mcp init failed` 一行——哪个 server、哪个阶段、能否恢复全部不可见
- server 退出后模型仍调用旧工具列表——每次返回 connection lost，重试浪费 token
- 没有 degraded 概念——要么全绿要么全红

### Claw Code 的 MCP

- 每个 server 独立走 11 阶段生命周期——1 个失败不影响其它 4 个
- 错误是 6 字段结构体——阶段 / server / 消息 / 上下文 / 可恢复性 / 时间戳
- server 断开后立即从 available_tools 移除——模型不会看见幻觉工具
- 显式 degraded report——「3 健康 / 1 故障 / tool X 缺失」

## #philosophy 02 / Design Philosophy :: 三条 MCP 硬化原则

:::insight-grid { cols: 3, title: "三条不可妥协的原则" }
::card 01
### 单 server 失败 ≠ 全死
原则 1

传统 harness 把「任一 server 连接失败」等同于「MCP 子系统不可用」，原因是缺少 server 级别的隔离建模。Claw Code 让每个 server 独立持有自己的 lifecycle state，失败被记录但**不传播**。降级报告把健康 server 和故障 server 分成两个集合，ToolExecutor 只从健康集合路由。

::card 02
### 每个错误必须回答 6 个问题
原则 2

错误不是 String，而是**数据**。当 MCP 错误发生时，它必须告诉你：(1) 哪个阶段；(2) 哪个 server；(3) 发生了什么；(4) 上下文（超时毫秒、stderr 片段）；(5) 能否恢复；(6) 什么时候。这 6 个字段缺任何一个，运维人员都无法定位问题。

::card 03
### 阶段转换受守卫约束
原则 3

11 个阶段不是装饰性标签——它们之间有**合法转换矩阵**。你不能从 ConfigLoad 跳到 Invocation 跳过 Handshake——守卫函数会拒绝。这消灭了「skip handshake 直接发 tools/list 然后 server 挂了但没人知道为什么」的隐性事故。
:::

## #lifecycle 03 / Lifecycle Diagram :: 一张图理解 11 个阶段的 4 个分区

11 个阶段按功能分成 4 个分区。每个分区的失败语义不同——启动期失败影响 server 注册，发现期失败影响工具列表，运行期失败影响单次调用，终止期失败可以忽略。

┌─ 启动期：失败 → 进 UnsupportedMcpServer 列表 ─┐

① ConfigLoad

② ServerRegistration

③ SpawnConnect

④ InitializeHandshake

↓

┌─ 发现期：失败 → 工具/资源缺失但 server 仍可用 ─┐

⑤ ToolDiscovery

⑥ ResourceDiscovery

↓

┌─ 运行期：失败 → 单调用隔离，不污染其它 ─┐

⑦ Ready

⑧ Invocation

⑨ ErrorSurfacing

↓

┌─ 终止期：失败可忽略，幂等 ─┐

⑩ Shutdown

⑪ Cleanup

⏵ 非法跳转被 validate_phase_transition 拒绝 ⚡ 任何阶段可跳转 ErrorSurfacing

:::accordion { title: "分区设计细节" }
::panel { open: true }
### 启动期为什么拆成 4 个阶段 || Why boot splits into 4 phases
ConfigLoad 与 SpawnConnect 分开是因为**失败原因完全不同**：ConfigLoad 失败是配置问题（binary 路径错、env 冲突），修改配置即可解；SpawnConnect 失败是运行时问题（权限不够、端口占用），可能需要 retry。合成一个「启动失败」会让恢复配方无法区分。

InitializeHandshake 独立出来是因为它有**超时语义**——spawn 成功但 handshake 超时是最常见的 MCP 失败模式。ErrorSurface 的 context 字段在这一阶段会带 `timeout_ms`，让 doctor 子命令直接定位「卡在 handshake 12 秒了」。

::panel
### 发现期为什么允许空 || Why discovery allows empty
一个 server 可以只支持 tools 不支持 resources，反之亦然。ToolDiscovery 返回空集不算失败——server 可能只提供 resources。但如果 ToolDiscovery **报错**（不是空而是异常），那进 ErrorSurface 走恢复配方。

::panel
### 阶段执行的三个入口 API || Three entry points for phase control
McpLifecycleValidator 暴露三个改状态的 API：

- `run_phase(phase)` — 进入新阶段；先 validate_phase_transition，通过后打时间戳，返回 Success { duration }
- `record_failure(error)` — 本阶段抛错；error.recoverable 决定 lifecycle 能否继续
- `record_timeout(phase, waited, error)` — 超时专用，与 Failure 分开是为了 lane_events 分桶精确
:::

## #error-design 04 / Error Design :: 把错误从字符串升格为类型：6 个必答题

错误吞噬的根源是「错误只有一个 String」。Claw Code 把 MCP 错误写成 6 字段结构体，强制每次抛错都至少回答 6 个问题。

| 问题 | 字段 | 为什么必须 |
| --- | --- | --- |
| 哪个阶段出的？ | `phase` | 决定恢复路径——ConfigLoad 错误改配置，Handshake 超时可 retry |
| 哪个 server？ | `server_name` | 隔离故障域——只降级这一个，不拖垮其它 |
| 发生了什么？ | `message` | 面向人的描述——运维在频道里看的就是这行 |
| 更多上下文？ | `context: BTreeMap` | 结构化补充——timeout_ms、binary_path、stderr 片段 |
| 能恢复吗？ | `recoverable: bool` | lifecycle 据此决定是继续走还是停 |
| 什么时候？ | `timestamp: u64` | ErrorSurfacing 阶段按时间排序 |

:::accordion { title: "recoverable 设计细节" }
::panel { open: true }
### 同一种错误在不同阶段 recoverable 不同 || Same error, different recoverability per phase
- SpawnConnect: binary not found → recoverable=false——重启也变不出来
- InitializeHandshake: timeout → recoverable=true——可能临时阻塞
- Invocation: pipe closed → recoverable=true——按配方重启 server
- ConfigLoad: invalid scope → recoverable=false——必须改配置

这种「同一种 IO 错误在不同阶段有不同恢复性」的设计，是 lifecycle 阶段划分的直接价值——没有阶段信息就无法做出正确的恢复判断。

::panel
### Display 格式：一行定位故障 || Display format: one line to locate failure
```
MCP lifecycle error during initialize_handshake: peer closed pipe
  (server: github-mcp) with context {"timeout_ms": "5000",
   "stderr_tail": "address already in use"} [recoverable]
```

这种格式直接喂给 lane_events 的 LaneEventBlocker.detail（见 Series 02 §5），clawhip 频道里能看到「具体哪个 server、哪个阶段、是否值得人工接管」三件事。
:::

## #degraded 05 / Partial Failure :: 部分失败 ≠ 全部失败：降级报告的 4 个维度

原则 1（单 server 失败 ≠ 全死）的落地是一个只有 4 个字段的数据结构。它配合 lifecycle 验证器实现了「部分失败 = 部分可用」语义。

### working_servers

已走完 Ready 阶段、当前 Connected 的 server 列表。**ToolExecutor 只从这个集合路由调用**——模型不会看见挂掉的 server 上的工具。

### failed_servers

每条带 (server_name, phase, error)。daemon 把它发到 lane_events，clawhip 渲染为 inline 故障卡片，**不阻塞**其它 server 的工具调用。

### available_tools

所有 working_servers 上 ToolDiscovery 的累积结果。系统提示里只暴露这一份，模型不会看见挂掉 server 的 tool——消灭工具幻觉。

### missing_tools

配置里期望但实际未发现的 tool 名集合。doctor 子命令直接说「期望 tool X 来自 server Y，但 Y 没启动」。

:::accordion { title: "降级触发与恢复" }
::panel { open: true }
### 启动期 vs 运行期降级回报 || Startup vs runtime degraded report
**启动期**：lifecycle 把所有 server 跑完 ConfigLoad → Ready 后，用 working/failed 两套集合构造一次 degraded report。即使有 server 失败，daemon 仍可对外报 ready——但带降级警告。

**运行期**：Invocation 阶段错误把 server 从 working 移到 failed，新的 degraded report 通过 lane_events 发出。recovery_recipes 的 PartialPluginStartup 配方介入：RestartPlugin + RetryMcpHandshake；失败则 LogAndContinue（不 Abort，因为剩余 server 仍可服务）。

::panel
### 为什么运行期默认不重启 || Why no auto-restart at runtime
一个 server 在 Invocation 阶段断开，直觉上应该自动重启。但 Claw Code **默认不重启**，而是标记 disconnected 并发降级报告。理由：

- 重启有 token 成本——重启期间 model 等待，浪费 API 调用时间
- 重启可能不安全——server 可能持有状态（事务、锁），直接 kill+restart 可能造成数据不一致
- recovery 配方已经覆盖了需要重启的场景——PartialPluginStartup 会判断是否值得
:::

## #bridge 06 / Tool Bridge :: 为什么 runtime 不应知道 MCP 的存在

McpToolRegistry（912 行）解决的核心问题是**关注分离**：ConversationRuntime 通过 ToolExecutor trait 调用工具，不知道也不关心工具来自 MCP 还是本地。MCP 的 lifecycle、错误面、降级报告全部封装在 registry 内。

:::insight-grid { cols: 3 }
::card 01
### `mcp__` 前缀自动路由
命名空间

工具名以 `mcp__` 开头就走 call_tool，否则走本地分发。模型不需要为 MCP 工具学不同的调用语法——命名空间天然不冲突。

::card 02
### disconnect 移除工具列表
断开即消失

server 断开时 list_tools 不再列出它的工具。这是「工具幻觉」的协议解——不是靠 timeout 后才发现调不通，而是从源头让模型看不见。

::card 03
### manager 管配置，registry 管状态
两层分离

McpServerManager → 配置侧（哪些 server、怎么 spawn）。McpToolRegistry → 运行时侧（哪些 server 活着、有什么工具）。set_manager() 是两层的接缝。
:::

:::accordion { title: "stdio 通道细节" }
::panel { open: true }
### 为什么 2,897 行只做一件事：强类型通道 || Why 2,897 lines for just one thing
mcp_stdio.rs 把 MCP wire protocol 的**每个方法对**（initialize、tools/list、tools/call、resources/list、resources/read）都建模成强类型 Params/Result 对。好处：

- 调用方不需要构造 raw JSON——用 McpToolCallParams { name, arguments } 就行
- 返回值不需要 downcast——McpToolCallResult.structured_content 是 Option<JsonValue> 而非「从 JsonValue 里翻」
- 序列化/反序列化错误在**编译期**被捕获——不是在 runtime 传了一个错字段才发现

::panel
### 每次调用前先确认 server 活着 || Pre-invocation liveness check
McpStdioProcess::has_exited() 调用 try_wait，让 lifecycle 在每次 Invocation 前快速断言「这个 server 是不是已经死了」。如果死了，不发 JSON-RPC（省一次 IO + timeout 等待），直接走 ErrorSurface → degraded report → 从 available_tools 移除。
:::

## #refs 07 / References :: 参考来源

- [1] mcp_lifecycle_hardened.rs (842 LOC) | McpLifecyclePhase 11 阶段 / McpErrorSurface / McpPhaseResult / McpDegradedReport / McpLifecycleValidator
- [2] mcp_stdio.rs (2,897 LOC) | 15+ JSON-RPC 强类型 / McpStdioProcess / McpServerManager
- [3] mcp_tool_bridge.rs (912 LOC) | McpToolRegistry / mcp__ 命名空间路由 / disconnect 移除工具
- [4] mcp.rs (304 LOC) | 公共 MCP 类型再导出
- [5] plugin_lifecycle.rs (532 LOC) | 通用 plugin 生命周期接口
- [6] recovery_recipes.rs::PartialPluginStartup | RestartPlugin + RetryMcpHandshake 配方；见 Series 02 §6

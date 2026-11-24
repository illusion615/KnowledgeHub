---
title: 把代理回合解剖成可观测、可压缩、可计费的状态推进
eyebrow: Claw Code · Series 03 · Runtime Anatomy
brand: 智能体 · Claw Code 系列 · 03
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: "Series 02 拆了 worker 协议——「让代理能驱动 harness」。这一篇下沉到 `ConversationRuntime` 自身：模型流式响应如何被装回 Session、何时触发自动压缩、System Prompt 由哪些段拼出、token 用量与美元成本怎样追踪。这部分代码集中在 `runtime/src/` 的 6 个核心模块（**5,829 行 Rust**），是 claw-daemon、macOS App、未来 VSCode 插件共享的同一台引擎。"
hero_actions:
  - "进入 Turn 循环 | #turn-loop"
  - "回看 Worker 协议 | ../claw-code-worker-protocol/index.html"
panel_label: 核心设计原则
panel_title: 四条引擎设计原则
panel:
  - 宿主可替换 · sink 解耦
  - 窗口自动管理 · 不撞限
  - 计费即 ground truth
  - hook 注入不改引擎
metrics:
  - "TurnEventSink 回调 || TurnEventSink callbacks | 7 | turn / assistant / tool×2 / usage / compaction"
  - "Compaction 默认窗口 || Compaction default window | 4 / 10K | 保留尾部 4 条消息，超 10K est tokens 触发 || preserve 4 tail messages; trigger above 10K est tokens"
  - "提示文件预算 || Instruction budget | 4K / 12K | 单文件 4,000 char，总和 12,000 char 上限 || 4,000 chars per file, 12,000 chars total cap"
  - "计费维度 || Cost dimensions | 4 | input / output / cache_creation / cache_read"
  - "Hook 决策结果 || Hook outcomes | 4 | allow / deny / cancel / failed —— 任一非 allow 都让 tool 进 deny 路径 || allow / deny / cancel / failed — any non-allow forces deny path"
style:
  accent: "#fb923c"
---

## #problem 01 / Problem :: 从朴素 while-let 循环到显式回合引擎

一个朴素的「LLM 主循环」往往写成 while-let：调 API、收响应、跑工具、追加消息、再调 API。这种写法在 demo 里能跑，但落到长会话场景立刻暴露四类问题。

### 朴素 while-let 循环

- Token 失控——没有窗口管理，撞 context length 中断会话
- 工具不可门控——权限、Hook、PTY 混在一处
- UI 不可观测——客户端只能等 finish 拿全文
- 计费靠估算——cache_read / cache_creation 被忽略

### Claw Code run_turn 引擎

- 自动压缩——超 10K est tokens 触发 compact_session
- Hook 注入——before/after_tool 不改引擎核心代码
- 7 个 sink 回调——增量推 assistant text / tool / usage
- 四维计费——input / output / cache_creation / cache_read

Claw Code 把这四件事拆成四个相互独立但在 run_turn 中精确组合的子系统。在看具体实现之前，先理解驱动这些拆分的设计原则。

## #philosophy 02 / Design Philosophy :: 四条引擎设计原则

:::insight-grid { cols: 2 }
::card 01
### 宿主可替换：sink 解耦观察与执行
原则 1

引擎内部执行 turn 时，不知道也不关心谁在观察——CLI、daemon、VSCode 插件都通过同一个 TurnEventSink trait 接收增量事件。换宿主只需换 sink 实现，不改引擎一行代码。

::card 02
### 窗口自动管理：会话不会撞限
原则 2

长会话不应该靠用户手动「清除上下文」。compact_session 在每次 turn 前检查 estimated tokens，超阈值自动触发「摘要 + 尾部原文」压缩。用户无需感知这件事正在发生。

::card 03
### 计费即 ground truth：四维不可少
原则 3

只追踪 input/output tokens 的计费是不完整的。Anthropic 的 cache_creation 和 cache_read 各有不同单价。UsageTracker 追踪全部 4 维，每次 API 响应实时累加，不做事后估算。

::card 04
### Hook 注入不改引擎：策略是数据
原则 4

想在工具调用前加权限检查？加日志？加审计？不需要改 run_turn 的控制流。Hook 是注入到 before_tool / after_tool 管线里的函数，引擎只看 Hook 返回的 allow/deny/cancel 三态。
:::

## #turn-loop 03 / Turn Loop :: 单回合的 9 步推进：从消息到工具到计费

run_turn 是整个运行时唯一的可变入口。它持有 6 个组件的所有权，按以下顺序推进每一回合：

①

on_turn_started + push_user_text

用户输入先经

session.push_user_text

落到 Session（带回 SessionError 即映射成 RuntimeError），再 fire

sink.on_turn_started

。

session_tracer

同步记录

turn_started

事件供 OTLP 导出。

②

iterations 计数 + max_iterations 守卫 || iterations counter + max_iterations guard

每进一轮 iteration 自增 1；若超过

with_max_iterations

设的上限直接 RuntimeError，避免「loop 失控烧 token」。默认

usize::MAX

，但 daemon 通常设到

50

。

③

组装 ApiRequest 并 stream || Build ApiRequest and stream

每轮重新构造

ApiRequest { system_prompt, messages: session.messages.clone() }

。注意

system_prompt 是 Vec<String>

，每段会独立缓存——这是后面 prompt cache_creation/read 计费分开记录的根源。

④

build_assistant_message：流式事件 → 单条消息 || build_assistant_message: stream events → single message

API client 返回

Vec<AssistantEvent>

，函数把 Text / ToolUseStart / ToolUseDelta / Usage / PromptCacheEvent 折叠成一条

ConversationMessage

，外加

Option<TokenUsage>

与

Vec<PromptCacheEvent>

。错误一律 record_turn_failed 后早返。

⑤

usage_tracker.record + sink.on_usage

每条 usage 都即时累加到 cumulative，再 fire

on_usage(&cumulative)

。

这是 daemon 能实时刷计费的唯一渠道

——客户端不必再去 grep 末尾响应。

⑥

提取 pending_tool_uses + push 助手消息 || Extract pending_tool_uses + push assistant message

从 blocks 里筛

ContentBlock::ToolUse

收集 (id, name, input)，立即把整条 assistant 消息 push 进 session（含未来的 tool_result 锚点 id）。若 pending 为空 → 跳出循环，进 ⑨。

⑦

PreToolUse hook → permission → execute → PostToolUse hook

每个工具调用都按这条「四闸门」推进：PreHook 可改输入或直接 cancel；permission_policy 拿到改后输入做授权；执行结果再喂 PostHook，PostHook 的 deny/failed/cancelled 都会把 is_error 翻 true，再用

merge_hook_feedback

把 hook 信息合并进 output 文本。

⑧

ToolResult 落 session + sink.on_tool_finished || ToolResult lands in session + sink.on_tool_finished

把

ConversationMessage::tool_result(id, name, output, is_error)

push 进 session，同时把首块 ContentBlock::ToolResult 的字段拆出来 fire

on_tool_finished(name, output, is_error)

。回到 ② 进行下一轮。

⑨

maybe_auto_compact + 构造 TurnSummary || maybe_auto_compact + build TurnSummary

跳出循环后立刻调

maybe_auto_compact

（见 §4），若发生压缩 fire

on_compaction

。最后把全部增量打包成

TurnSummary { assistant_messages, tool_results, prompt_cache_events, iterations, usage, auto_compaction }

返回。

:::accordion { title: "run_turn 的不变量" }
::panel { open: true }
### 为何 ApiRequest 每轮 clone 一次 messages || Why ApiRequest clones messages each iteration
Session 必须先持有当前轮的 assistant + tool_result 才能进入下一轮 stream。如果用借用，session 就被 stream lifetime 绑住，无法在迭代体内 push 新消息。Claw Code 选择「每轮 clone」是经过测算的：messages 多为短引用（`Vec<ContentBlock>`），clone 成本远低于 LLM 网络往返；换来的是简单的所有权模型与可重入性。

::panel
### 错误路径都先 record_turn_failed 再返 || All error paths record_turn_failed before return
`session_tracer` 必须看到失败回合，否则 lane completion 检测会把「半截 turn」误判为 in-flight。代码里每个早返点都显式 `self.record_turn_failed(iterations, &error)`，这是 §02 worker 协议里 `WorkerStatus::Running` 不会被卡死的关键支撑。

::panel
### permission_outcome 三态合一 || permission_outcome unified into three states
PreHook 的 cancelled / failed / denied 都被翻译成同一个 `PermissionOutcome::Deny { reason }`，不进 tool_executor.execute。这意味着 hook 自然就是 permission policy 的「前置补丁」——比如 PreHook 可以根据 `tool_name + input` 把权限从 Allow 降级为 Deny，policy 完全不需要改代码。
:::

## #sink-protocol 04 / Host Decoupling :: 让宿主在不持有引擎的前提下增量观察

`TurnEventSink` 是 7 个回调的 trait，所有方法都有空 default。这是 Claw Code「同一台引擎服务多种宿主」的接口契约——claw-daemon 用它推 UDS、macOS App 用它驱动 SwiftUI、CLI 用它打 ANSI 流。回调全部 best-effort，**实现不应阻塞 runtime**（注释明确写了）。

on_turn_started(input)

用户消息已落 session 之前/之后？答：**之前** fire——输入字符串已知但 session.messages 尚未追加。daemon 用它在 UI 标记「思考中…」。

每回合 1 次

on_assistant_message(iter, msg)

每轮一次，紧接 build_assistant_message 完成后。msg 已经是折叠完成的整条 ConversationMessage，含 ToolUse blocks。客户端可以渲染思考链并预览即将调用的工具。

每 iteration 1 次

on_tool_started(iter, name, input)

permission Allow 之后、execute 之前 fire。**Deny 路径不会 fire**，避免 UI 给被拒工具显示运行动画。

每 Allow 工具 1 次

on_tool_finished(iter, name, output, is_error)

无论 Allow 走完还是 Deny 直接构造的 result message 都 fire——保证 UI「Started → Finished」永远配对。

每工具 1 次

on_usage(cumulative)

注意是 **cumulative** 而不是 turn delta。客户端只要展示「累计开销」就直接照搬，不需要自己加；要看本回合就在 Sink 自留 last 值做差。

每条 model usage 1 次

on_compaction(event)

当且仅当 maybe_auto_compact 真的删掉过消息才 fire；event.removed_message_count 让 UI 在时间线上画一条「压缩到这里」的分隔。

每回合 0 或 1 次

NoopTurnEventSink

测试与「批处理 CLI」用的零成本实现——所有方法都是默认空实现。`run_turn` 接 `Option<&mut dyn TurnEventSink>`，传 None 时连 trait 调度都省了。

用作 fallback

重要细节：所有 fire 都用 `sink.as_deref_mut()` 而不是 take，**同一个 sink 引用贯穿整轮 N 个 iteration**。这让 Sink 实现可以在自身 state 里维持 turn-scoped 缓冲（比如把同一回合的 token 增量聚合再 flush），而不必担心 sink 被中途销毁。

## #compaction 05 / Window Control :: 自动压缩：把长会话改写成「摘要 + 尾部原文」

`compact.rs`（716 行）的核心是「不让 context window 成为引擎崩溃的硬上限」。它有两套触发条件：

### ① 显式压缩 should_compact() || ① Explicit compact should_compact()

- compactable.len() > preserve_recent_messages
- compactable est_tokens ≥ max_estimated_tokens
- 默认 4 条尾部 + 10,000 token 阈值
- 一般由 `/compact` slash 命令显式触发

### ② 自动压缩 maybe_auto_compact() || ② Auto compact maybe_auto_compact()

- cumulative.input_tokens ≥ env 阈值
- 调用 compact_session，**但 max_estimated_tokens=0**
- 意为「token 一旦超了就强制压」
- 读取 `CLAW_AUTO_COMPACTION_INPUT_TOKENS` 环境变量

:::accordion { title: "compact_session 算法骨架" }
::panel { open: true }
### 孤儿 tool_result 防护 || Orphan tool_result guard
最容易写错的细节：如果保留尾部第 K 条恰好是 tool_result，而它对应的 assistant tool_use 已被压进摘要，模型会拒绝整个对话（「unknown tool_use_id」）。`compact_session` 用一个 while 循环往前回退 keep_from，跳过所有 **纯 tool_result 起头**的边界，直到找到合法的 user 或 assistant 消息为止：

```
while keep_from > compacted_prefix_len {
    let msg = &session.messages[keep_from];
    let starts_with_tool_result = msg.role == MessageRole::Tool
        || (msg.role == MessageRole::User
            && msg.blocks.iter().all(|b|
                matches!(b, ContentBlock::ToolResult { .. })));
    if starts_with_tool_result { keep_from -= 1; } else { break; }
}
```

::panel
### 摘要文本结构：/ || Summary text structure: /
`summarize_messages()` 输出的不是平文，而是带有 `<analysis>…</analysis>` 与 `<summary>…</summary>` 双标签的结构化文本。`format_compact_summary()` 显示前会：

1. 用 `strip_tag_block(&text, "analysis")` 把 analysis 段整段删除
2. 把 `<summary>…</summary>` 替换成 `"Summary:\n…"`
3. 用 `collapse_blank_lines()` 折叠空行后 trim

之所以保留 analysis：模型在写 summary 前会先用 analysis 自我推理，给 summary 一个「思维链锚」。生产展示时不需要它，但保留在 raw summary 里，`merge_compact_summaries` 后续合并多次压缩时能复用。

::panel
### 续写指令：直接 resume 不寒暄 || Continuation instruction: resume directly, no preamble
`get_compact_continuation_message()` 拼出的系统消息会以一段强制指令收尾：

```
// COMPACT_DIRECT_RESUME_INSTRUCTION
"Continue the conversation from where it left off without
asking the user any further questions. Resume directly —
do not acknowledge the summary, do not recap what was
happening, and do not preface with continuation text."
```

这一段是为了避免压缩后模型立刻输出「Got it, picking up from the summary…」浪费一轮。**当且仅当 `suppress_follow_up_questions=true`** 时被追加；slash 触发的手动 compact 通常关闭它，因为人类乐于看摘要确认。

::panel
### estimate_session_tokens：粗估而非精算 || estimate_session_tokens: rough estimate, not exact
`estimate_message_tokens()` 不接 tokenizer，按 `chars / 4` 粗估。理由：tokenizer 集成会把 runtime 拖进 BPE 模型依赖，违反 PHILOSOPHY 里「runtime crate 零网络零模型」的约束。粗估对触发条件足够（精度 ±20% 不影响窗口管理决策），真正的计费走 §6 由 API 实际响应回填。
:::

## #prompt-builder 06 / Dynamic Prompt :: 从静态骨架到带 git diff 的动态环境提示

`prompt.rs`（803 行）回答的问题是「每一回合发给模型的 system prompt 究竟由什么组成」。Claw Code 把它显式分成「静态前缀 → 动态边界标记 → 动态后缀」，让 prompt cache 命中率最大化。

━━━ STATIC HEAD（被 prompt cache 命中） ━━━

· output_style 段（如 with_output_style 设过）

· 默认 frontier 模型自报 (FRONTIER_MODEL_NAME)

· 角色与输出协议骨架

━━━ __SYSTEM_PROMPT_DYNAMIC_BOUNDARY__ ━━━

━━━ DYNAMIC TAIL ━━━

· with_os(name, version)

· ProjectContext.cwd / current_date

· git_status（截断到 git --short 输出）

· git_diff（截断到合理上限）

· instruction_files[N]（每文件 ≤4,000 char，总 ≤12,000 char）

· render_config_section(RuntimeConfig)（环境感知开关）

· append_section[..]（用户/SDK 追加段）

注：build() 返回 Vec<String>，每段独立缓存键 → API 端的 cache_creation/read 计费按段累加

:::accordion { title: "ProjectContext 自动发现" }
::panel { open: true }
### discover_with_git：cwd → 5 个字段 || discover_with_git: cwd → 5 fields
`ProjectContext::discover_with_git(cwd, current_date)` 在引擎启动期跑一次，依次：

1. `discover_instruction_files(cwd)`：扫 `CLAW.md`、`CLAUDE.md`、`AGENTS.md`、`.github/copilot-instructions.md` 等指引文件
2. `read_git_status(cwd)`：跑 `git status --short --untracked-files=all`，失败返回 None
3. `read_git_diff(cwd)`：跑 `git diff`，输出过长时由后续 render 阶段截断
4. `cwd` + `current_date`：原样塞入

关键：上述命令通过 `read_git_output` 走子进程，**失败永远不抛**。在非 git 仓库里运行 claw 不会让 prompt 装配崩溃——只是 git_status / git_diff 字段为 None。

::panel
### 指引文件预算：4K / 12K 双限 || Instruction budget: 4K / 12K dual cap
`MAX_INSTRUCTION_FILE_CHARS = 4_000` 与 `MAX_TOTAL_INSTRUCTION_CHARS = 12_000` 是硬编码常量。单个 CLAW.md 超 4K 会被截断并加 truncation marker；多文件累计超 12K 后续文件被丢弃。这套预算让指引文件「不会因 repo 越长越烂的 README 把 system prompt 撑爆」。

每个 ContextFile 渲染时都附 path 元信息，模型可以引用「按 .github/copilot-instructions.md §2 所述…」——这是为什么 claw 经常在回答里精确引用规则源头。

::panel
### DYNAMIC_BOUNDARY 标记的真实用途 || Real purpose of the DYNAMIC_BOUNDARY marker
`SYSTEM_PROMPT_DYNAMIC_BOUNDARY = "__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__"` 看着像调试标记，实则是给 **API 端 prompt cache 划分缓存键**的硬边界。同一个项目下，静态前缀几乎不变 → 命中 cache_read；动态后缀（git diff、cwd 时间戳）每轮变 → 进 cache_creation。这一刀切下去，长会话里第二轮起的「真实新增 token」常常只有几十个，对应 §6 的 cache_read_cost 显著低于 input_cost。

::panel
### build() vs render()
builder 同时提供两种产物：

- `build() -> Vec<String>`：分段返回，**给 ApiClient 用**，每段对应 API 的一个 system message 元素，享受独立 cache key。
- `render() -> String`：拼成单一字符串，**给调试 / 日志 / SystemPromptInfo 用**，方便人眼读。

生产路径只走 build()，render() 主要用于 `--print-system-prompt` 之类的诊断子命令。
:::

## #usage-billing 07 / Four-Axis Billing :: 为什么计费必须是四维的

`usage.rs`（313 行）只做一件事：把每条 model response 的 `TokenUsage` 累加到 cumulative，并按内置 `ModelPricing` 表算成美元。它的特点是「计费维度即 API 真实分桶」，不做估算式合并。

| 模型族 || Model family | input USD/M | output USD/M | cache_creation USD/M | cache_read USD/M |
| --- | --- | --- | --- | --- |
| haiku | 1.00 | 5.00 | 1.25 | 0.10 |
| sonnet（默认） | 15.00 | 75.00 | 18.75 | 1.50 |
| opus | 15.00 | 75.00 | 18.75 | 1.50 |
| 未知（fallback） | 15.00 | 75.00 | 18.75 | 1.50 |

`pricing_for_model(name)` 用 `to_ascii_lowercase` + `contains` 匹配，命中即返。未知模型走 `default_sonnet_tier` 并在 summary_lines 里追加 `pricing=estimated-default` 标记，提醒账单可能不准。

:::accordion { title: "UsageTracker 的两条会计线" }
::panel { open: true }
### latest_turn vs cumulative
Tracker 维护两条独立账：

- `latest_turn`：record(usage) 时 **覆盖**而非累加。客户端读 `current_turn_usage()` 拿到的就是「最近一次 model call 用了多少」。
- `cumulative`：四个字段分别累加。turns 计数也同步 +1。

这条设计让 UI 既能展示「本次调用 1.2K token」也能展示「会话累计 38K token」，无需自行做差。

::panel
### from_session：会话恢复后回填 || from_session: backfill after session restore
`UsageTracker::from_session(&session)` 遍历 `session.messages`，把每条消息的 `usage: Option<TokenUsage>` record 一遍。这是 daemon 重启后或加载历史会话时恢复正确累计的唯一路径——`ConversationRuntime::new_with_features` 内部就是这样调用，使「中断恢复」与「从头跑」对计费看起来无差别。

::panel
### auto-compaction 阈值的耦合点 || Auto-compaction threshold coupling
§4 的 `maybe_auto_compact` 判断条件是 `cumulative.input_tokens < threshold`——**只看 input_tokens 而不看 output / cache**。原因：output 不影响下一轮 prompt 长度，而 cache_read 即便很大对真实窗口压力小。这个细节让阈值设定与「实际撞 context length 风险」线性相关。
:::

## #hooks 08 / Hook Injection :: 在工具入口和出口注入策略而不改引擎

`hooks.rs`（987 行）是 §02 turn 循环步 ⑦ 的可插拔层。它定义 5 个 `HookEvent`，运行结果统一为 `HookRunResult`，后者承载四种语义并能改写工具入参或权限判定。

| HookEvent | 触发时机 || Fired at | 可影响 || Can influence |
| --- | --- | --- |
| `PreToolUse` | permission 之前；可改 input、可决策 allow/deny || Before permission; can rewrite input, decide allow/deny | 工具是否执行、用什么参数执行、PermissionContext.override || Whether to execute, with what input, PermissionContext.override |
| `PostToolUse` | execute 成功后 || After successful execute | output 文本（merge_hook_feedback 合并）、是否升级为 is_error || output text (merge_hook_feedback), upgrade to is_error |
| `PostToolUseFailure` | execute 抛错后 || After execute error | 把错误转写成模型可消费的 error message；可补救 || Translate error into model-consumable message; remediate |
| `Stop / SubagentStop` | 主回合或子代理结束时（hooks.rs 完整 enum） || At end of main turn or sub-agent (full enum in hooks.rs) | 副作用：发通知、写日志、触发后续脚本 || Side effects: notifications, logs, follow-up scripts |

:::accordion { title: "HookRunResult 的四个状态" }
::panel { open: true }
### allow / deny / cancelled / failed 的差异 || Differences between allow / deny / cancelled / failed
- allow messages 可作 advisory 合并到 output；不阻断 || messages merged advisory into output; non-blocking
- deny 工具直接进 PermissionOutcome::Deny，is_error=true || Tool routed to PermissionOutcome::Deny, is_error=true
- cancelled 例：HookAbortSignal 触发；与 deny 同效但 reason 文案不同 || e.g. HookAbortSignal fires; same effect as deny but different reason text
- failed hook 自身崩溃；视同 deny，避免「hook 挂了 → 工具裸奔」 || Hook itself crashed; treated as deny to prevent 'hook crashed → tool runs free'

conversation.rs 里这四种判定写在同一段 if/else 链中，全部翻译为同一个 `PermissionOutcome::Deny { reason }`——这是「hook 失败也安全」的兜底。

::panel
### updated_input 与 permission_override || updated_input and permission_override
PreHook 可以返回两个修改：

- `updated_input`：把模型给的 raw input 改写为 `effective_input`。典型用例：把 `rm -rf /tmp/x` 改成 `rm -rf -- /tmp/x` 再做权限判定。
- `permission_override`：把权限决策 override 成 Allow / Deny / Ask 之一，并附 reason。典型用例：当前 cwd 在 trusted_roots 里时把 Bash 从 Ask 升级为 Allow。

两条路径相互独立：可以只改输入不动权限，反之亦然。

::panel
### HookAbortSignal：所有 hook 共享一个停摆开关 || HookAbortSignal: shared kill switch
`HookAbortSignal` 是 `Arc<AtomicBool>` 的薄包装，由 `ConversationRuntime` 持有并传入 `HookRunner`。当宿主调 `signal.abort()`（例如用户 Ctrl+C），**所有正在排队的 hook 会立刻把结果置为 cancelled**，工具被 deny，回合得以快速收敛。这是 §02 步 ⑦ 能在用户中断时不挂住整个 daemon 的关键。
:::

## #references 09 / References :: 参考来源

所有引用均指向当前 main 分支的具体路径与行号。 || All references point to specific paths and line numbers on current main.

- [1] conversation.rs (1,750 LOC) | ConversationRuntime / run_turn / TurnEventSink / build_assistant_message / maybe_auto_compact / record_* 追踪入口
- [2] compact.rs (716 LOC) | CompactionConfig / compact_session / get_compact_continuation_message / 孤儿 tool_result 防护循环 / <analysis><summary> 标签处理
- [3] prompt.rs (803 LOC) | SystemPromptBuilder / ProjectContext::discover_with_git / SYSTEM_PROMPT_DYNAMIC_BOUNDARY / MAX_INSTRUCTION_FILE_CHARS 4000 / MAX_TOTAL_INSTRUCTION_CHARS 12000
- [4] usage.rs (313 LOC) | TokenUsage 四维 / UsageTracker.latest_turn vs cumulative / ModelPricing.haiku/sonnet/opus / from_session 回填
- [5] session.rs (1,246 LOC) | MessageRole / ContentBlock / ConversationMessage / Session.push_message / record_compaction / fork / to_json / from_json
- [6] hooks.rs (987 LOC) | HookEvent / HookRunResult / HookRunner / HookAbortSignal / merge_hook_feedback / format_hook_message
- [7] PHILOSOPHY.md | runtime crate「零网络零模型」约束的来源；解释为何 estimate_session_tokens 不集成 tokenizer
- [8] DESIGN-APP-CLIENT.md | claw-daemon UDS 协议中 TurnEventSink 实现的下游消费者，证实 7 个回调全部被映射成线协议

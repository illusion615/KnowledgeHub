---
title: 用 1,209 行 Rust + 一份线协议，把终端代理改造成可被任何 GUI 包装的服务
eyebrow: "Claw Code · Series 06 · App Client & Daemon"
brand: 智能体 · Claw Code 系列 · 06
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: "终端体验有 7 个公认痛点：墙体文本、16KB 截断、压缩失忆、无 diff、阻塞确认对话、多会话难管理、长任务无进度。Claw Code 把解法切成两半：（1）`claw-daemon`（lib 18 + protocol 218 + server 215 + runtime_handler 558 共 1,009 行 Rust）暴露 Unix Domain Socket 上的 line-delimited JSON；（2）SwiftUI App 包装这条协议，把 Series 03 的 7 个 sink 回调全部映射到原生 UI 元素。本文走通这条线。"
hero_actions:
  - "进入线协议 | #protocol"
  - "回看权限层 | ../claw-code-permission-bash/index.html"
panel_label: 核心设计原则
panel_title: 两条协议设计原则
panel:
  - runtime 不变 · 新客户端只写 UI
  - JSON + 换行 = 全部协议
metrics:
  - "Message kind || Message kinds | 3 | request / response / event 三态信封 || request / response / event tri-state envelope"
  - "Request 方法 || Request methods | 5 | ping / echo / session_create / session_send / permission_respond"
  - "Event 类型 || Event types | 6 | text_delta / tool_start / tool_result / permission_request / usage / compaction"
  - "Daemon Rust LOC | 1,009 | lib 18 + protocol 218 + server 215 + runtime_handler 558"
  - "MVP 痛点覆盖 || MVP pains covered | 3 / 7 | v0.1 解决 wall-of-text / 截断 / 工具结果折叠 || v0.1 fixes wall-of-text / truncation / collapsible tool results"
style:
  accent: "#fb923c"
---

## #problem 01 / Problem :: 终端体验的 7 个痛点为什么不能在「美化层」里解决

### Terminal-only 体验

- 所有输出线性堆叠——工具结果淹没 assistant prose
- 工具输出超 16KB 直接截断——数据丢失不可恢复
- 压缩后旧消息消失——用户无法回看
- 权限 Y/N 阻塞整个 session

### daemon + 结构化协议

- 6 种事件按类型分块渲染——tool 折叠、text 流式
- sidecar 完整输出——截断前落盘，UI 提供「查看完整」
- 客户端独立持久化——压缩只影响模型视图不影响用户视图
- 非阻塞 toast——request_id 关联异步回执

这 7 项里每一项都需要「runtime 主动暴露结构化事件」+「客户端拥有自己的存储与渲染」。terminal-only 的设计无解。在看协议设计之前，先理解驱动架构选择的两条原则。

## #philosophy 02 / Design Philosophy :: 两条协议设计原则

:::insight-grid { cols: 2 }
::card 01
### runtime 不变，新客户端永远只是「写 UI」
原则 1

如果每接一个新客户端（SwiftUI、TUI、Web、IDE 插件）都需要改 runtime，那架构就是错的。Claw Code 的做法是把 runtime 完全封装在 daemon 内，daemon 只负责把 TurnEventSink 的 7 个回调翻译成 line-delimited JSON 事件。新客户端只需要：(1) 连 socket；(2) 发 JSON；(3) 收 JSON。不需要理解 Rust 内部、不需要 API key、不需要重新实现工具执行。

::card 02
### JSON + 换行 = 全部协议
原则 2

故意不用 gRPC / Cap'n Proto / MessagePack。理由是**最小公倍数**：任何语言都有 JSON 解析器和 readline。调试时用 nc -U /tmp/claw.sock 直接 telnet 看协议流。新增事件类型不破坏旧客户端（serde 忽略未知字段）。复杂度越低，第三方集成的门槛越低。
:::

## #protocol 03 / Wire Protocol :: 一行就是一个 Message：3 种信封 × 5 个方法

protocol.rs 的第一段注释就把规则交代清楚：「All messages are line-delimited JSON. Each line decodes to a single Message tagged by the kind field.」

### Message::Request

客户端发起，期望恰好一个 Response 终止。携带客户端选定的 id 用作匹配。

### Message::Response

daemon 回应，id 与 Request 对齐。Error { code, message } 是稳定 code + 人类可读 message——code 用于客户端 switch，message 用于 UI 展示。

### Message::Event

daemon 推送的异步通知，可选 request_id（关联触发它的 request）与 session_id（如背景压缩）。客户端按 id 路由到对应面板。

:::accordion { title: "Request 5 方法" }
::panel { open: true }
### Ping / Echo —— 框架自检 || Ping / Echo — framing self-test
专为 smoke test 与客户端启动期校验设计。Echo 回送任意字符串，让客户端在不创建 session 的前提下确认 line-framing 正常。这是「protocol 第一公里」必备工具——很多 RPC 框架因为没有这两个方法导致连接 bug 难定位。

::panel
### SessionCreate —— 显式建模会话 || SessionCreate — sessions as first-class
参数 `working_directory` 与 `model` 都可选；daemon 选定 `SessionId` 返回。**客户端不能自带 session_id**——id 由 daemon 生成是为了避免冲突与伪造。

::panel
### SessionSend —— 一次 user turn 触发整段事件流 || SessionSend — one user turn triggers a full event stream
`{ session_id, text }` 进入 daemon 后，daemon 会持续推 `EventPayload`（assistant 流、工具调用、权限请求、用量）直到 `ResponsePayload::TurnComplete { iterations, message }` 收尾。`iterations` 直接对应 Series 03 §2 的 run_turn 循环计数，便于客户端展示「这一轮跑了 N 步」。

::panel
### PermissionRespond —— 用 request_id 回应任意权限请求 || PermissionRespond — reply by request_id
`{ session_id, request_id, decision }`。decision 三态：`allow / allow_for_session / deny`。**非阻塞**——客户端可以挂起多个权限 request 让用户先看完上下文再统一处理，这是 toast UI 而非 modal 对话框的协议根基。
:::

## #daemon 04 / Translation Layer :: daemon 只做翻译：为什么 runtime 与协议互不感知

215 行的 `server.rs` 只做一件事：在 Unix domain socket 上接受连接、按行读取、把 Message 派发给 `SessionHandler` 实现。558 行的 `runtime_handler.rs` 则把 `ConversationRuntime` 与协议绑起来，实现真正的 SessionHandler。

### ServerConfig::new(path)

声明 socket 文件位置。daemon 启动会先 unlink 旧文件再 bind，避免「上次崩溃留了个 stale socket」的常见坑。

### Server::bind / serve

分两步：`bind` 同步返回 `UnixListener`（启动期用于 systemd readiness），`serve` 异步进入 accept 循环。**分离的好处**是测试可以先 bind 拿到端口再注入 mock handler。

### ResponseSink

handler 通过 `sink.send(Message)` 推回事件 / 响应。一个 sink = 一个连接，`async fn send` 内部用 tokio mutex + writer 串行化，避免多事件交错出现半行。

### EchoHandler

测试与 demo 用 handler，仅响应 Ping / Echo。证明 SessionHandler 是**抽象 trait**——daemon 框架与具体业务可分别替换。

### RuntimeHandler::new(api_factory)

真正的业务实现。注入 `Fn() -> Box<dyn ApiClient>` 工厂——每个 session 调用一次，**session 之间 ApiClient 不复用**，避免凭据 / token 串。

### RuntimeHandler::with_factories

测试用扩展构造器，可注入 ApiClient + ToolExecutor + MCP 等多组工厂；production 默认用 new 即可。

handler 的 SessionSend 实现里持有一个 `ConversationRuntime`，把 Series 03 §3 的 `TurnEventSink` 7 个回调实现成「转 Message::Event 写入 sink」。runtime 不感知协议存在，handler 不感知 socket 存在——两层都可独立替换。

## #mapping 05 / Sink-Event Mapping :: 把 7 个 sink 回调映射到 6 个 Event + 1 个 Response

这是整个 daemon 的核心翻译表。`TurnEventSink`（in-process 接口）与 `EventPayload`（wire 表示）一一对应——这种「sink 与 event 形状对齐」的设计让 handler 实现几乎是机械填充。

| TurnEventSink 回调 | 对应 EventPayload | 关键字段 |
| --- | --- | --- |
| `on_assistant_text(delta)` | `AssistantTextDelta { text }` | 逐 token 流式 prose |
| `on_tool_call_started(call)` | `ToolCallStart { call_id, summary: ToolCallSummary { tool, headline } }` | headline 是「`cargo test --workspace`」这种一句话提要，UI 折叠卡用 |
| `on_tool_call_finished(call, result)` | `ToolCallResult { call_id, truncated, full_output_path?, preview }` | truncated=true 时 full_output_path 指向 sidecar 文件，是 §1 第二痛点的协议解 |
| `on_permission_required(req)` | `PermissionRequest { request_id, tool, description }` | 客户端用 request_id 回 PermissionRespond |
| `on_usage_update(usage)` | `UsageUpdate { input_tokens, output_tokens, estimated_cost_usd }` | 四维计费收敛到 3 个数字（cost 是综合） |
| `on_compaction_applied(report)` | `CompactionApplied { removed_messages }` | 触发客户端「snapshot 原始历史」时机 |
| `on_session_complete(_)` | — | 对应 ResponsePayload::TurnComplete 而非 Event |

:::accordion { title: "翻译层代码示例" }
::panel
### SinkAdapter 的典型翻译实现 || Typical SinkAdapter translation implementation
```
// runtime_handler.rs 内的典型转译（简化）
impl TurnEventSink for SinkAdapter {
    fn on_tool_call_finished(&mut self, call: &ToolCall, res: &ToolResult) {
        let ev = EventPayload::ToolCallResult {
            call_id: call.id.clone(),
            truncated: res.was_truncated,
            full_output_path: res.sidecar_path.clone(),
            preview: res.preview.clone(),
        };
        self.sink.send_event(self.session_id.clone(), ev);
    }
}
```
:::

:::accordion { title: "为什么 7 → 6 而不是 7 → 7" }
::panel { open: true }
### on_session_complete 走 Response，不走 Event || on_session_complete uses Response, not Event
session 完成是「请求-响应配对」的终止，而不是异步通知。把它实现为 `Message::Response { TurnComplete }` 让客户端的 await 模式自然收束——发了 SessionSend 之后 await 一个 response 即可，期间 event 只是 side channel。混用一个事件做收尾会强迫客户端自己实现「谁是终止信号」的判断。

::panel
### ToolCallStart 与 ToolCallResult 必须分两个事件 || Tool start and result must be two events
UI 想做「折叠卡片显示进度」就必须知道「开始了但未完成」的中间态。两阶段事件让 UI 渲染 spinner 的时机精确到具体某次工具调用，而不是「整个 session 在跑」。`call_id` 把两阶段串起来——可以并行多个 tool call，每个独立刷新自己的卡片。

::panel
### UsageUpdate 折叠 4 维成本到 3 个数字 || UsageUpdate collapses 4-axis cost to 3 numbers
Series 03 §6 提到 usage.rs 跟踪 4 维（input / output / cache_read / cache_write 等）。线协议只暴露 input/output 加合并 cost——这是「客户端 UI 需要的只是头部数字」的设计判断。如要细分，daemon 可以新增 `UsageDetail` event 而不破坏现有客户端。
:::

## #app 06 / UI Mapping :: 把 6 种 event 映射成 4 种 UI 元素

`DESIGN-APP-CLIENT.md` 第 3 节定义了三栏布局（File Tree · Conversation · Context Panel）。Conversation 面板按事件类型分块——同一类事件总是渲染成同一种视觉单元，避免「同一种内容散落 UI 多处」。

| 消息来源 | UI 元素 | 关键交互 |
| --- | --- | --- |
| User input | Chat bubble（顶部对齐 + avatar） | 右侧或上方 |
| AssistantTextDelta（流式合并） | Markdown 块 + 代码 syntax highlight + 「Copy」按钮 | 逐 token 增量绘制 |
| ToolCallStart + ToolCallResult | 折叠卡：「`▶ bash: cargo test` → ✓ 12 passed」点开看完整 IO | edit_file 触发 inline diff |
| PermissionRequest | 滑入 toast（Allow / Allow for session / Deny） | 非阻塞，可堆叠 |
| UsageUpdate / CompactionApplied | 右侧 Context Panel 数值与历史轨迹 | compaction 触发本地 SQLite snapshot |

:::flow { title: "数据流路径" }
1. **1** — 用户输入 → App 通过 UDS 发送 `Message::Request { SessionSend }`。
2. **2** — daemon 启动 turn，开始推 `EventPayload`。
3. **3** — App 一边解析事件渲染 UI，一边把原始事件存入本地 SQLite（GRDB）。
4. **不读取真文件** — 4；遇到 `ToolCallResult { truncated: true, full_output_path }`，App 在折叠卡上挂一个「View full output」按钮，**不读取真文件**直到点击。
5. **5** — 遇到 `PermissionRequest` 弹 toast；用户点击 → App 发 `PermissionRespond { request_id, decision }`。
6. **6** — 收到 `Message::Response { TurnComplete }` → 关闭 spinner、把 iterations 写到 Context Panel。
:::

:::accordion { title: "MVP 切片：先打 3 个最高频痛点" }
::panel { open: true }
### v0.1 先做：结构化渲染 + 折叠工具卡 + 完整输出 sidecar || v0.1: structured render + collapsible tool cards + full-output sidecar
选这三项是因为 ROI 最高：

- 结构化渲染消灭「墙体文本」，单条 PR 价值最大
- 折叠工具卡消灭「无进度」「输出占满屏」两个痛点
- sidecar 完整输出消灭 16KB 截断的根本问题，需要 daemon 协议侧已落字段（`full_output_path`），不需要客户端魔法

::panel
### v0.2: inline diff + 非阻塞权限 + cost 显示 || v0.2: inline diff + non-blocking perms + cost
diff 视图依赖 edit_file 工具事件已经携带 before/after 文本块；非阻塞权限直接接 PermissionRequest event；cost 接 UsageUpdate。三者都是「协议已具备，写 UI 即可」。

::panel
### v0.3: 文件树 git status + 压缩前历史 + 拖拽 || v0.3: file tree git status + pre-compaction history + drag-drop
压缩前历史是「客户端独立持久化」最有价值的应用——daemon 收到 `CompactionApplied` 后 runtime 内的旧消息就被折叠成 summary，但 App 在 SQLite 里完整保存原始事件流，**用户视图与模型视图分离**。
:::

## #byo 07 / BYO Client :: 协议刻意保持极简：JSON parser + 行分割就能写客户端

这是「为什么不直接 RPC 框架」的回答。Claw Code 故意没用 gRPC / Cap'n Proto / MessagePack——这些方案对接需要 schema 编译器、IDL 文件、运行时库。而 line-delimited JSON：

### 语言独立

Python `json.loads` + `readline`；TypeScript `JSON.parse` + readline；Swift Codable + AsyncStream。任何语言只要有 JSON 与 socket 即可。

### 调试友好

用 `nc -U /tmp/claw.sock` 直接 telnet socket 看协议流，对照 protocol.rs 的 5 个 method 就能手写测试。

### 向前兼容简单

新增 EventPayload 变体不破坏旧客户端（serde 默认忽略未知字段时配 `#[serde(other)]` 即可），新增 RequestPayload method 同理。

### 分场景客户端

同一个 daemon 可同时被 SwiftUI App + TUI + IDE 插件 + 自动化脚本连。每个客户端按需选择关心的 event 即可。

:::accordion { title: "Python 客户端示例" }
::panel
### Python 30 行客户端示例 || Python 30-line client example
```
# Python 30 行客户端示例（伪代码）
import json, socket
s = socket.socket(socket.AF_UNIX); s.connect("/tmp/claw.sock")
send({"kind":"request","id":"1","method":"session_create","params":{}})
sid = recv_response().data.session_id
send({"kind":"request","id":"2","method":"session_send",
       "params":{"session_id":sid,"text":"fix login bug"}})
while (msg := recv()).kind != "response":
    if msg.event == "permission_request":
        send({"kind":"request","id":"3","method":"permission_respond",
               "params":{"session_id":sid,"request_id":msg.data.request_id,
                         "decision":"allow"}})
```
:::

这就是**架构最小公倍数**的力量：runtime 与 daemon 不变，新客户端永远是「写 UI」而非「重新对接 LLM/工具/MCP/权限」。

## #refs 08 / References :: 参考来源

- [1] claw-daemon/src/protocol.rs (218 LOC) | Message / RequestPayload / ResponsePayload / EventPayload / PermissionDecision / ToolCallSummary 全套线协议
- [2] claw-daemon/src/server.rs (215 LOC) | ServerConfig / Server::bind/serve / ResponseSink / EchoHandler
- [3] claw-daemon/src/runtime_handler.rs (558 LOC) | RuntimeHandler / SessionHandler 实现 / TurnEventSink → EventPayload 翻译
- [4] DESIGN-APP-CLIENT.md (418 行) | 7 个终端痛点 / 三栏 UI / MVP 切片 / 技术栈选择
- [5] runtime/src/conversation.rs::TurnEventSink | in-process sink 7 callback；见 Series 03 §3
- [6] claw-daemon/tests/permission_round_trip.rs | PermissionRequest event ↔ PermissionRespond request 的端到端集成测试
- [7] claw-daemon/tests/smoke.rs | Ping / Echo 框架自检

---
title: 智能体平台 · 接口规范说明书
eyebrow: Agent Platform · API Specification
brand: 智能体平台
date: 2026-05-04
strict_i18n: false
strict_density: true
lead: "本文给出对外 REST/SSE 接口与对内 MCP 出站协议的完整契约。所有路径以 `/v1/` 前缀，配合 `X-Project-Id` + `Authorization: Bearer` 完成租户与鉴权识别。MCP 出站严格遵循 Model Context Protocol 规范，并叠加平台护栏（超时 / 熔断 / 大小限制）。"
hero_actions:
  - "运行时 API | #runtime"
  - "MCP 协议 | #mcp"
panel_label: 接口总览
panel_title: 17 个 REST 端点 · 1 套 MCP 协议
panel_desc: API 分两类：运行时（高频、对接调用方代码）与控制面（低频、对接 Admin 与 CI）。MCP 协议是平台与项目侧的唯一出站通道——禁止在平台代码中出现任何项目业务的 HTTP / gRPC 直连。
panel:
  - 所有时间字段统一 ISO-8601 UTC
  - "所有写操作支持 `Idempotency-Key`"
  - "错误体统一 `{ error: { code, message, request_id } }`"
  - "分页统一 `cursor + limit` 模式"
metrics:
  - "REST 端点 | 17 | 4 个 Sessions / 13 个控制面（projects, skills, mcp-servers, models, telemetry, supervisor）。"
  - "协议版本 | v1 | 所有路径均带 `/v1/` 前缀，向后不兼容修改需进入 `/v2/`。"
  - "默认限流 | 20/5 | 项目级 20 QPS、用户级 5 QPS（FR-04），可在 Admin Console 提升上限。"
  - "MCP 护栏 | 15s | 单次工具调用 15s 超时（上限 60s），熔断阈值 5 次/30s，响应 ≤1MB。"
style:
  accent: "#0891b2"
---

## #principles 01 / Design Principles :: API 设计原则

规范的可用性来自一致性。下列六条作为 API 评审的硬性 checklist。

:::comparison
::versus P1 · REST + SSE
### 双协议分工
常规请求走 REST/JSON；流式响应走 SSE（`Content-Type: text/event-stream`）。WebSocket 仅作为 SSE 的可选替代（FR-06）。不引入第三种协议。

::versus P2 · Idempotency-Key
### 所有写操作幂等
任何 POST/PUT/DELETE 均接受 `Idempotency-Key` header。同一 key 24 小时内重复请求返回原响应（FR-03）。

::versus P3 · 显式版本
### 路径前缀 v1
所有端点带 `/v1/`。新增字段视为兼容；删字段、改语义视为不兼容，必须新版本号。

::versus P4 · 统一错误体
### error 对象结构
响应非 2xx 时返回 `{ error: { code, message, request_id, details? } }`。`code` 是稳定枚举，`message` 给人看，`request_id` 用于追责。

::versus P5 · 租户上下文
### X-Project-Id 强制
除 `/v1/health` 外，所有请求必须带 `X-Project-Id`。该 header 与 api_key 必须匹配，否则 401。

::versus P6 · cursor 分页
### 无 offset
列表接口统一 `{ items, next_cursor }` 模式；不暴露 offset，避免大数据集深分页性能问题。
:::

## #auth 02 / Auth & Rate Limit :: 鉴权、租户上下文与限流

每个请求通过两个 header 完成"我是谁、我代表哪个项目"的识别。

### 请求头部规范

```
X-Project-Id:        proj_01HN... (string, required)
Authorization:       Bearer sk_live_... (api_key, required)
X-User-Id:           u_... (string, optional, for user-level rate limit / telemetry)
Idempotency-Key:     uuid (string, optional but recommended on writes)
X-Request-Id:        uuid (string, optional, server will generate if absent)
Accept:              application/json | text/event-stream
```

**响应头部**：

```
X-Request-Id:        uuid (echo or server-generated)
X-RateLimit-Limit:   20
X-RateLimit-Remaining: 18
X-RateLimit-Reset:   epoch seconds
Retry-After:         seconds (only on 429)
```

:::comparison
::versus 限流维度
### 项目级 + 用户级双维度
默认 `project: 20 QPS`、`user: 5 QPS`（FR-04）。两条规则均触发即返回 429。可在 Admin Console 按项目调整。

::versus api_key 生命周期
### 创建 → 撤销 → 轮换
创建时返回明文（仅一次）；服务端只存 hash + 前缀（NFR-11）。支持设置 expires_at；轮换通过双 key 共存窗口完成。
:::

## #runtime 03 / Runtime API :: 运行时 API · Sessions & Messages

运行时 API 是调用方接触最频繁的 4 个端点，承载会话生命周期与流式消息。

POST

/v1/sessions

### 创建会话

建立一个新的 session 上下文。可选指定 `preferred_skill` 跳过首次 intent 推断。

```
// Request
{
  "user_id": "u_123",
  "preferred_skill": "consultation@latest",   // optional
  "metadata": { "channel": "wechat" },        // optional, opaque
  "ttl_seconds": 3600                          // optional, default 3600
}

// 200 Response
{
  "session_id": "sess_01HN...",
  "project_id": "proj_01HN...",
  "active_skill": "consultation@1.4.2",
  "expires_at": "2026-04-15T10:00:00Z"
}
```

POST

/v1/sessions/{session_id}/messages

### 发送消息（SSE 流式响应）

请求体为 user message；响应为 SSE 流。客户端使用 `Accept: text/event-stream`。

```
// Request
{
  "role": "user",
  "content": "帮我计划一下下周的目标。",
  "attachments": [],                           // optional
  "intent_hint": "goal_planning"               // optional
}

// SSE Response (multi-event stream)
event: intent
data: { "intent": "goal_planning", "target_skill": "consultation@1.4.2", "user_frustrated": false }

event: token
data: { "delta": "好的," }

event: token
data: { "delta": "我来帮你规划。" }

event: tool_call
data: { "name": "list_recent_goals", "args": { "limit": 5 }, "call_id": "c_..." }

event: tool_result
data: { "call_id": "c_...", "ok": true, "content": [...] }

event: token
data: { "delta": "..." }

event: done
data: { "trace_id": "tr_01HN...", "usage": { "tokens_in": 812, "tokens_out": 240 } }
```

GET

/v1/sessions/{session_id}

### 查询会话状态

返回会话元数据、当前 active_skill、最近 trace_id。不返回完整对话历史（项目侧自管）。

DELETE

/v1/sessions/{session_id}

### 结束会话

主动结束并清理 Redis 中的短期上下文。已写入的 telemetry 不受影响。

## #mgmt 04 / Management API :: 控制面 API · 项目、Skill、模型、Supervisor

Admin Console 与 CI 通过控制面 API 管理资源。所有接口要求登录 actor 拥有相应 RBAC 角色（FR-33）。

:::accordion
::panel { open: true }
### 4.1 项目与 api_key
POST

/v1/projects

**创建项目**

```
{ "name": "intellygoal-prod", "owner": "ops@illusion615.com" }
// 201 → { "project_id": "proj_...", "default_api_key": "sk_live_...","status":"active" }
```

POST

/v1/projects/{project_id}/api-keys

**签发 api_key**

返回的明文仅出现一次，后续仅可通过 hash 前缀检索。

DELETE

/v1/projects/{project_id}/api-keys/{key_id}

**撤销 api_key**

::panel
### 4.2 Skill 注册与版本治理
POST

/v1/projects/{project_id}/skills

**上传 skill 草稿**

```
{
  "name": "consultation",
  "version": "1.5.0",
  "seed_md": "",                  // immutable seed
  "overlay_md": "",               // optional, can be empty
  "tools_allowed": ["list_recent_goals", "commit_goal_plan"],
  "handoff_to": ["intake", "review"],
  "turn_budget": 12
}
// 201 → { "skill_id": "sk_...", "status": "staging" }
```

POST

/v1/projects/{project_id}/skills/{skill_id}/promote

**晋级到下一阶段**

```
{ "to": "shadow" | "canary" | "prod", "canary_pct": 5 }
```

促级动作走 FR-16 灰度状态机，禁止跨级跳转。失败将自动回滚（FR-17）。

GET

/v1/projects/{project_id}/skills?name=consultation

**列出 skill 与各版本状态**

::panel
### 4.3 MCP server 注册
POST

/v1/projects/{project_id}/mcp-servers

**注册一个项目侧 MCP endpoint**

```
{
  "name": "intellygoal-core",
  "transport": "http" | "stdio" | "sse",
  "endpoint": "https://mcp.intellygoal.io",
  "auth": { "type": "bearer", "secret_ref": "vault://intellygoal/mcp_token" },
  "advertised_tools": ["list_recent_goals", "commit_goal_plan", "memory.read", "memory.write"]
}
// 201 → { "server_id": "mcp_...", "status": "active" }
```

GET

/v1/projects/{project_id}/mcp-servers/{server_id}/tools

**动态拉取工具清单**

调用 MCP `tools/list`，返回工具的 name / description / inputSchema。Skill 中引用的工具必须在此清单内。

::panel
### 4.4 模型路由与 BYOK
PUT

/v1/projects/{project_id}/models

**设置模型偏好与回退链**

```
{
  "preferred":  { "provider": "openai",     "model": "gpt-4o-mini" },
  "fallbacks":  [
    { "provider": "anthropic", "model": "claude-3-5-haiku" },
    { "provider": "azure",     "model": "gpt-4o-mini-azure" }
  ],
  "byok": [
    { "provider": "openai",    "secret_ref": "vault://proj/openai_key" },
    { "provider": "anthropic", "secret_ref": "vault://proj/anthropic_key" }
  ]
}
```

BYOK 凭据通过 Vault reference 提供，平台调用时按需解密注入；明文不进数据库（NFR-10）。

::panel
### 4.5 Telemetry & Supervisor
GET

/v1/projects/{project_id}/traces?from=...&to=...&skill=...

**查询 trace 列表（支持 cursor 分页）**

GET

/v1/projects/{project_id}/traces/{trace_id}

**查询完整 trace 回放**

GET

/v1/projects/{project_id}/eval-results?skill=...

**评测结果列表**

GET

/v1/projects/{project_id}/supervisor/proposals

**Supervisor 起草的待审补丁**

POST

/v1/projects/{project_id}/supervisor/proposals/{id}/decision

**人审决策**

```
{ "decision": "approve" | "reject", "reason": "..." }
```
:::

## #mcp 05 / MCP Outbound Contract :: MCP 协议契约 · 平台 → 项目侧

平台作为 MCP client 拨号项目侧 MCP server，唯一允许的工具调用通道。本节给出契约细节，包括发现、调用、错误模型与平台叠加的护栏规则。

### 5.1 工具发现 · tools/list

注册 MCP server 时与每次 server 重启后调用，拉取当前 server 暴露的工具元数据。

```
// MCP request
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }

// MCP response
{
  "jsonrpc": "2.0", "id": 1,
  "result": {
    "tools": [
      {
        "name": "commit_goal_plan",
        "description": "Commit a planned goal with milestones and reminders.",
        "inputSchema": {
          "type": "object",
          "required": ["goal_text", "milestones"],
          "properties": {
            "goal_text":  { "type": "string", "minLength": 4 },
            "milestones": { "type": "array", "items": { "type": "object" } }
          }
        }
      }
    ]
  }
}
```

### 5.2 工具调用 · tools/call

```
// MCP request
{
  "jsonrpc": "2.0", "id": 42,
  "method": "tools/call",
  "params": {
    "name": "commit_goal_plan",
    "arguments": {
      "goal_text": "在 Q2 完成毕业论文初稿",
      "milestones": [ { "title": "完成文献综述", "due": "2026-05-01" } ]
    }
  }
}

// MCP response (success)
{
  "jsonrpc": "2.0", "id": 42,
  "result": {
    "content": [{ "type": "text", "text": "{\"goal_id\":\"g_...\",\"status\":\"committed\"}" }],
    "isError": false
  }
}

// MCP response (business error)
{
  "jsonrpc": "2.0", "id": 42,
  "result": {
    "content": [{ "type": "text", "text": "Validation failed: milestones[0].due in past" }],
    "isError": true
  }
}
```

### 5.3 平台叠加的护栏规则

- **超时** —— 默认 15 秒，可在 skill frontmatter 调到上限 60 秒
- **熔断** —— 30 秒滑窗内 5 次失败触发 endpoint 熔断 60 秒
- **重试** —— 仅幂等工具（idempotent: true）允许 1 次重试，其余 fail-fast
- **响应大小** —— ≤ 1MB；超出截断并标记 `truncated: true`
- **并发** —— 每项目 ≤ 50 并发出站；全平台 ≤ 500（FR-23）
- **白名单** —— 调用工具必须在 skill `tools_allowed` 列表内

### 5.4 memory.read / memory.write 约定

业务对象长期记忆通过保留工具名 `memory.read` / `memory.write` 走 MCP，由项目侧 server 实现并落到自家数据库。平台不持有任何业务字段（FR-21、NFR-12）。

```
// memory.write
{ "name": "memory.write", "arguments": { "scope": "user:u_123", "key": "preferred_lang", "value": "zh-CN" } }

// memory.read
{ "name": "memory.read",  "arguments": { "scope": "user:u_123", "key": "preferred_lang" } }
// → { "value": "zh-CN" }
```

## #errors 06 / Error Model :: 统一错误模型与 HTTP 状态码

所有非 2xx 响应都返回相同结构，`code` 是稳定枚举供客户端编程，`message` 给人看。

```
{
  "error": {
    "code": "rate_limited",
    "message": "Project QPS limit exceeded. Retry after 1 second.",
    "request_id": "req_01HN...",
    "details": { "limit": 20, "remaining": 0 }
  }
}
```

| HTTP | code | 含义 |
| --- | --- | --- |
| 400 | invalid_request | 请求体不符合 schema 或参数缺失 |
| 401 | unauthenticated | 缺少 / 错误的 api_key 或 X-Project-Id |
| 403 | forbidden | 认证通过但无权访问该资源 |
| 404 | not_found | 资源不存在或不属于当前 project |
| 409 | conflict | 状态机非法跳转、资源冲突 |
| 409 | idempotency_replay_mismatch | 同 key 不同请求体 |
| 413 | payload_too_large | 请求体超过 10MB 上限 |
| 422 | skill_validation_failed | skill 草稿契约校验失败 |
| 429 | rate_limited | 项目级或用户级限流触发 |
| 499 | client_closed_request | SSE 客户端主动关闭 |
| 500 | internal_error | 未分类的服务端错误 |
| 502 | upstream_model_error | 所有 fallback 模型均失败 |
| 503 | tool_circuit_open | 工具 endpoint 熔断中 |
| 504 | tool_timeout | MCP 工具调用超时 |

## #references 07 / References :: 参考来源

- [1] Anthropic. — https://modelcontextprotocol.io/specification | tools/list, tools/call 报文与错误模型来源。
- [2] Stripe. — https://stripe.com/docs/api/idempotent_requests | Idempotency-Key header 与 24 小时窗口约定参考来源。
- [3] WHATWG. — https://html.spec.whatwg.org/multipage/server-sent-events.html | SSE 报文格式与连接管理依据。
- [4] IETF. — https://datatracker.ietf.org/doc/html/rfc6585 | 429 Too Many Requests / Retry-After 来源。
- [5] 本系列文档

---
title: 智能体平台 · 高阶设计
eyebrow: Agent Platform · High-Level Design
brand: 智能体平台
date: 2026-05-04
strict_i18n: false
strict_density: true
lead: "本文是[需求规格说明书](../agent-platform-requirements/)到[接口规范](../agent-platform-api-spec/)之间的桥梁，以三层视图（外部接触面 → 内部模块 → 组件细节）+ 11 个核心组件 + 5 条关键数据流 + 2 种部署形态阐明系统结构。每一项设计决策都标注其来源 FR/NFR。"
hero_actions:
  - "阅读三层视图 | #layers"
  - "查看关键数据流 | #flows"
panel_label: 架构概览
panel_title: 11 个组件，1 套抽象，2 种部署
panel_desc: 11 个组件全部通过 PROFILE 启动参数从同一镜像加载；进程间走 Postgres / Redis / 内存事件总线，不引入额外消息队列。Compact 模式适合 PoC 与小项目，Scale-Out 模式按层拆分为 Gateway / Compute / Worker / Eval / Supervisor 五类无状态副本。
panel:
  - 外部接触面：HTTPS API · MCP 出站 · Admin 控制台
  - 内部模块：11 个核心组件 + 共享存储
  - 组件内部：状态机、桥接器、抽象层细节
metrics:
  - "核心组件 | 11 | API Gateway · Intent · Skill Registry · Runtime · Memory · Tool Bridge · Model Router · Telemetry · Eval · Supervisor · Admin。"
  - "关键数据流 | 5 | 请求路径、工具调用、telemetry 写入、灰度晋级、Supervisor 闭环。"
  - "部署形态 | 2 | Compact 单镜像 · Scale-Out Kubernetes 多副本。"
  - "外部依赖 | 3 | Postgres · Redis · 项目侧 MCP server（领域工具）。"
style:
  accent: "#0891b2"
---

## #layers 01 / Three-Layer View :: 三层架构视图

L0 → L1 → L2 三层逐级展开。L0 关注"谁在和系统说话"，L1 关注"系统内部由哪些可复用模块构成"，L2 关注"每个模块内部怎么组织"。

L0 · 外部接触面

### 调用方与平台的接触界面

系统对外只暴露三类接触面，其余通信全部封闭。

- **HTTPS REST/SSE API** —— 调用方发起会话与消息（FR-02、NFR-01）
- **MCP 出站连接** —— 平台作为 MCP client 拨号项目侧 MCP server，传输工具调用（FR-22）
- **Admin Console（Web）** —— 项目管理员、Skill 作者、运维、合规四类角色操作入口（FR-32、FR-33）

不存在第四种接触面：禁止业务直连数据库、禁止业务订阅平台 Kafka、禁止平台主动调用项目 webhook。

L1 · 内部模块

### 11 个核心组件 + 共享存储

组件按职责分为四组，共享一对存储（Postgres + Redis）。下方 ASCII 图概览组件位置与依赖方向。

```
   ┌────────────────────────────────────────────────────────────────┐
   │                       L0 · External Surface                    │
   │   HTTPS API           Admin Console            MCP outbound    │
   └────────────┬──────────────────┬──────────────────────┬─────────┘
                ▼                  ▼                      ▼
   ┌─────────────────────────  L1 · Internal Modules  ─────────────────┐
   │                                                                   │
   │  [API Gateway] ─▶ [Intent] ─▶ [Skill Runtime] ─▶ [Tool Bridge]    │
   │       │                          │   │                │           │
   │       │                          │   ▼                ▼           │
   │       │                          │  [Model Router]──▶ LLM API     │
   │       │                          ▼                                │
   │       │                       [Memory]                            │
   │       │                                                           │
   │       └──── all spans ─────▶ [Telemetry] ◀───── [Supervisor]      │
   │                                  │                  ▲             │
   │                                  ▼                  │             │
   │                              [Eval Harness] ────────┘             │
   │                                                                   │
   │                          [Skill Registry] ◀── [Admin Console]     │
   │                                                                   │
   │  Shared storage:  Postgres (control-plane)   Redis (session/rl)   │
   └───────────────────────────────────────────────────────────────────┘
            
```

L2 · 组件内部

### 关键组件内部结构

- **API Gateway** —— Auth Filter → Tenant Context → Rate Limiter → Idempotency Cache → Router
- **Skill Runtime** —— LangGraph StateGraph：`load_skill → intent_check → llm_call → maybe_handoff → tool_call → respond`
- **Tool Bridge** —— MCP Client Pool · Circuit Breaker · Timeout Wrapper · Event Tap
- **Model Router** —— LiteLLM Adapter · BYOK Decryptor · Fallback Chain · Stream Aggregator · Token Meter
- **Supervisor** —— Trace Sampler → Failure Pattern Miner → Patch Drafter (LLM) → Eval Runner → Promotion Gate

## #components 02 / Component Inventory :: 11 个核心组件

每个组件对应一组明确的需求项，互相之间通过 Postgres / Redis / 进程内事件总线交互——禁止引入额外消息队列以保持 Compact 模式的零外部依赖承诺。

| 组件 | 职责 | 关键依赖 | 对应需求 |
| --- | --- | --- | --- |
| API Gateway | 鉴权、租户上下文、限流、幂等、SSE 适配 | Postgres(api_keys), Redis(rate) | FR-01..06, NFR-01 |
| Intent Gateway | 识别 user 意图、判定 target_skill / hint / 情绪 | Model Router, Redis(intent cache) | FR-07, FR-08, NFR-02 |
| Skill Registry | skill 命名空间、版本、灰度状态、seed/overlay | Postgres(skills) | FR-14..19 |
| Skill Runtime | LangGraph 状态机、handoff、turn budget、checkpoint | LangGraph, Postgres(checkpoint) | FR-09..13 |
| Memory | session 短期记忆、长会话摘要、业务记忆 MCP 代理 | Redis(session), MCP Bridge | FR-20, FR-21 |
| Tool Bridge | MCP 客户端池、超时熔断、事件回流 | 项目侧 MCP server | FR-22, FR-23 |
| Model Router | provider 抽象、BYOK 注入、回退链、stream 聚合 | LiteLLM, Vault | FR-24..26 |
| Telemetry | OTEL trace 收集、PII 脱敏、指标聚合 | Postgres(traces), OTLP exporter | FR-27, NFR-12, NFR-17, NFR-18 |
| Eval Harness | frozen eval set 跑分、对比报告、定时任务 | Skill Registry, Model Router | FR-28 |
| Supervisor | 失败模式挖掘、补丁起草、灰度推动、人审队列 | Telemetry, Eval Harness | FR-29..31, NFR-08 |
| Admin Console | SSO 登录、灰度操作、telemetry 视图、BYOK 配置、RBAC | 所有控制面 API | FR-32..34 |

## #flows 03 / Critical Data Flows :: 5 条关键数据流

把 11 个组件用 5 条端到端流"串"起来。任何新需求都应能映射到其中一条流；映射不上者要么是范围外，要么意味需要补一条新流。

:::accordion
::panel { open: true }
### Flow 1 · 请求路径（调用方 → 模型响应）
1. **API Gateway** — 认证（FR-01）→ 限流（FR-04）→ 幂等检查（FR-03）→ 解析 SSE 长连接。
2. **Intent Gateway** — 读取 session 上下文摘要 + 当前 user message → 调用轻量模型 → 输出 `{intent, target_skill, hint, user_frustrated}`。
3. **Skill Runtime** — 从 Skill Registry 拉取 `active_skill`（合并 seed + overlay）→ 进入 LangGraph StateGraph。
4. **Model Router** — 注入 BYOK → 调用首选模型，stream chunk 实时回吐到 SSE。
5. **Tool Bridge（如需）** — 模型若产生 tool_call，按 MCP 协议拨号项目 server → 工具结果回灌 → 模型继续生成。
6. **Telemetry** — 整轮所有 span 异步落 Postgres（FR-27），SSE 通道自然结束或调用方主动关闭。

::panel
### Flow 2 · 工具调用路径（含护栏）
1. **白名单校验** — tool_call 请求工具必须在 skill frontmatter 的 `tools_allowed` 列表内，否则直接 reject 并写 trace。
2. **并发与限流** — 检查项目级并发（≤50）与全平台并发（≤500）；超限排队或 fail-fast。
3. **调用 MCP server** — 使用项目 MCP endpoint 池中的连接，套 15s 超时（可调到 60s 上限）。
4. **结果护栏** — response 大小 ≤1MB；超出截断并标记。失败若幂等则重试 1 次，否则直接抛错。
5. **熔断状态** — 30 秒滑窗内 5 次失败触发 endpoint 熔断 60 秒；熔断期间所有该工具调用 fail-fast。

::panel
### Flow 3 · Telemetry 写入与查询
1. **Span 生成** — API Gateway / Runtime / Tool Bridge / Model Router 各自产 OTEL span，trace_id 贯穿。
2. **PII 脱敏** — 落库前过 PII 过滤器（手机 / 身份证 / 信用卡 / 邮箱），原文不入库（NFR-12）。
3. **分区存储** — Postgres traces 表按 `project_id + day` 分区，热数据 7 天，温数据 30 天。
4. **查询入口** — Admin Console / Eval / Supervisor 通过 Telemetry 查询 API 拉取，按项目自然隔离。
5. **导出（可选）** — OTLP exporter 把 trace 推送到 Langfuse / DataDog / 自建 ClickHouse（NFR-20）。

::panel
### Flow 4 · 灰度晋级（draft → prod）
1. **Draft 上传** — Skill 作者上传新版本，落入 staging；契约校验通过方可进入下一步。
2. **Eval 跑分** — Eval Harness 用 frozen eval set 计算 correctness / latency / cost / safety 四类指标。
3. **Shadow 双跑** — 真实流量复制一份给候选版本，对比 prod 版本输出，记录差异；不影响真实回包。
4. **Canary 比例** — 按 5% / 25% / 100% 三档分阶段开放；每档持续 N 小时，监控指标。
5. **Promote / Rollback** — 指标达标 promote 至 prod；任一阶段退化触发 FR-17 自动回滚 + 审计写入 + 告警。

::panel
### Flow 5 · Supervisor 自演化闭环
1. **样本采集** — Supervisor 周期性扫描 traces，按失败模式聚类（如"用户拒绝率过高"、"工具误调用"）。
2. **补丁起草** — 调用 Patch Drafter LLM 在 overlay 层生成增量；seed 永不被改。
3. **护栏** — 调用预算、变更预算、人审队列三层护栏；高风险补丁强制 require_review。
4. **走 Flow 4** — 通过护栏的补丁直接进入灰度状态机 staging 起点，与人工补丁同流。
5. **回写学习** — 每个补丁的最终结局（promote / rollback）回写为 Supervisor 训练样本。
:::

## #deploy 04 / Deployment Topology :: 两种部署形态

同一个镜像通过 `PROFILE` 启动参数加载不同子模块；这是 NFR-21 / NFR-22 的硬约束。

:::comparison
::versus Compact
### 单镜像 · docker-compose
所有组件在同一进程内，本地 Postgres + Redis 容器伴行；适合 PoC、单项目、研发联调。启动命令 `PROFILE=compact`。

- 资源：≥ 2 vCPU / 4 GB RAM
- 外部依赖：Postgres / Redis（容器内伴行可选）
- 性能：单实例 50 RPS（NFR-01）
- 可观测：本地 OTEL collector + 浏览器 trace UI

::versus Scale-Out { highlight: true }
### Kubernetes 多副本
同一镜像按 PROFILE 拆分为五类 Deployment：Gateway / Compute / Worker / Eval / Supervisor。无状态副本可水平扩展，状态全部在 Postgres + Redis（外部托管）。

- `PROFILE=gateway` · API Gateway × N + HPA
- `PROFILE=compute` · Intent / Runtime / Memory / Model Router / Tool Bridge × M
- `PROFILE=worker` · 异步任务（telemetry 批写、PII 脱敏）
- `PROFILE=eval` · Eval Harness 定时跑批
- `PROFILE=supervisor` · 离线管线，独立 LLM 调用预算
:::

Migration Discipline

### Compact → Scale-Out 平滑升级

升级路径：把 Postgres / Redis 切换到外部托管 → 调整 manifests 把单 Pod 拆成 5 类 Deployment → 配置 Ingress + HPA + ServiceMonitor。代码与镜像不变。如果某次需求改动让"同一镜像不能再统一启动"，则该改动违反 NFR-21，需重新设计。

## #evolution 05 / Self-Evolution :: 自演化设计 · Seed / Overlay 双层

自演化能力的设计核心是"如何让自动改写不破坏可控性"。三条规则联合保证。

:::comparison
::versus Rule 1
### Seed 永不可变
每个 skill 有不可变的 seed 层（人类作者所写的"骨架"），存储为 immutable record。Supervisor 只能在 overlay 层生成增量，运行时按 `seed + overlay` 合并装载。任何"清空 overlay 回到 seed"的操作 1 秒内可执行。

::versus Rule 2
### 双闸入库
Supervisor 起草的补丁必须经过 shadow + canary 两个阶段才能晋级 prod。任一阶段指标退化（safety / correctness 下降，cost / latency 增长超阈值）自动回滚。绝不允许"直接覆写 prod"。

::versus Rule 3
### 三层护栏
① 调用预算（每日 LLM 调用上限）防止失控；② 变更预算（每 skill 每周改写次数上限）防止漂移；③ 人审队列（高风险补丁强制 `require_review`）保留最后否决权。
:::

Why this matters

### 为什么自演化要刻意"慢"

自动改写的最大风险不是"改错了一次"，而是"无人察觉的累积漂移"。Seed 不可变给了"何时回到原点"的物理基线；双闸入库给了"每次改动都被验证"的过程保证；三层护栏给了"运行节奏可控"的速率上限。三者缺一，Supervisor 就会从治理资产退化为治理负债。

## #failure 06 / Failure & Degradation :: 失败模型与降级路径

对照常见故障，给出每条失败模式的发现机制与降级策略。

| 故障 | 发现 | 降级 |
| --- | --- | --- |
| 模型超时 | Model Router 30s timeout | 切换至 fallback 链路下一档；超时计入 telemetry。 |
| MCP server 不可达 | Tool Bridge 连续 5 次失败 | endpoint 熔断 60 秒，期间该工具 fail-fast；告警通知项目运维。 |
| Postgres 主库不可用 | 健康检查失败 | API Gateway 进入"只读 + 拒新会话"模式；现存会话经 checkpoint 续跑。 |
| Redis 不可用 | session/rl 写入异常 | 降级为内存 LRU + 单进程限流；放弃跨实例一致性，告警通知。 |
| Skill 灰度退化 | Eval / Canary 指标越线 | FR-17 自动回滚到上一 prod 版本；写审计 + 告警。 |
| Supervisor 漂移 | 每周变更预算耗尽 + 投诉率上升 | 停止该 project 的 auto_promote，强制 require_review；告警平台运维。 |
| BYOK 失效 | Model API 401/403 | 切换 fallback；连续失败时通知项目管理员轮换 key。 |

## #references 07 / References :: 参考来源

- [1] LangChain. — https://langchain-ai.github.io/langgraph/ | Skill Runtime 内核选型，StateGraph + Checkpoint + Handoff 模型。
- [2] BerriAI. — https://docs.litellm.ai/ | Model Router 抽象、BYOK、回退链选型依据。
- [3] Anthropic. — https://modelcontextprotocol.io/specification | Tool Bridge 出站协议规范。
- [4] OpenTelemetry. — https://opentelemetry.io/docs/specs/otel/trace/ | Telemetry 数据模型、OTLP exporter 协议。
- [5] 本系列文档

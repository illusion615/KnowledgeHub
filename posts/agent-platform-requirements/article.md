---
title: 智能体平台 · 需求规格说明书
eyebrow: Agent Platform · Software Requirements Specification
brand: 智能体平台
date: 2026-05-04
strict_i18n: false
strict_density: true
lead: "本文以 IEEE 830 SRS 结构组织，把[设计理念](../agent-platform-philosophy/)转换为可验证的功能与非功能需求。所有 FR/NFR 编号在后续高阶设计、接口规范、应用实践三篇文档中保持唯一引用，便于 PR 评审追溯到原始需求。"
hero_actions:
  - "查看功能需求列表 | #functional"
  - "查看非功能需求 | #non-functional"
panel_label: 需求统计
panel_title: 34 条功能需求 · 24 条非功能需求 · 6 类核心角色
panel_desc: 每条需求都有唯一 ID（FR-NN / NFR-NN）、优先级（MUST / SHOULD / COULD）、来源章节与可验收的判定语句。MUST 类需求在 Phase 1 GA 前必须全部满足；SHOULD 类在 Phase 2 之前满足；COULD 类作为 Phase 3+ 增强项。
panel:
  - MUST · 24 条 · 平台 GA 阻塞项
  - SHOULD · 22 条 · Phase 2 强烈建议
  - COULD · 12 条 · Phase 3+ 增强能力
  - "WON'T · 见[设计理念 §03](../agent-platform-philosophy/#non-goals)"
metrics:
  - "功能需求 | 34 | 覆盖 API 网关、Skill、运行时、记忆、模型、工具、监控、评测、Supervisor、Admin。"
  - "非功能需求 | 24 | 性能、隔离、安全、可用性、可观测性、可维护性六大类。"
  - "用户角色 | 6 | 调用方、终端用户、项目管理员、平台运维、Skill 作者、合规审计。"
  - "追溯链路 | 4 | 需求 → 设计章节 → API 端点 → 实践案例（IntellyGoal Phase A→D）。"
style:
  accent: "#0891b2"
---

## #scope 01 / Scope :: 范围与术语约定

明确"什么在范围内、什么不在"，避免后续争议时回到主观判断。

:::accordion
::panel { open: true }
### 1.1 系统目的
提供一套独立部署的多租户智能体公共服务，承载意图分类、Skill 装载、工具调用桥接、模型路由、会话短期记忆、监控、评测、自演化等与业务无关的运行时机制。任何接入方（"项目"）通过暴露 MCP server + 上传 skill markdown 即可获得生产级智能体能力，不需要修改平台代码。

::panel
### 1.2 范围内
- **运行时机制** —— 意图网关、Skill Runtime、handoff、回合预算、流式 SSE 输出
- **Skill 治理** —— 注册、版本化、灰度状态机、seed/overlay 双层、回滚
- **工具桥接** —— MCP client pool、超时熔断、事件回流、每项目独立 endpoint registry
- **模型路由** —— LiteLLM 抽象、BYOK 注入、回退链、流式聚合、token 计数
- **记忆代理** —— 短期会话（Redis）、业务对象记忆代理（经 MCP 转发）
- **监控与治理** —— OTEL trace、指标聚合、Admin 控制台、RBAC、审计日志
- **评测与演化** —— frozen eval set 跑分、Supervisor 离线管线、人审队列

::panel
### 1.3 范围外
严格按[设计理念 §03 三条非目标](../agent-platform-philosophy/#non-goals)执行：

- 不做业务工具实现（项目侧 MCP server 自实现）
- 不做业务数据存储（业务对象一律由项目持久化）
- 不做模型托管（BYOK，平台仅做路由）
- 不替业务做策略决策（评测集 / 通过标准 / 灰度阈值由项目自定）

::panel
### 1.4 术语约定
- **项目（Project）** —— 平台的接入方业务系统，每项目持有独立 `project_id` 与 `api_key`
- **Skill** —— 接入方在平台上注册的对话契约 markdown，由 frontmatter（工具白名单 + handoff 目标）与正文（对话目标 / 边界 / 退出条件 / 条件段落）组成；每份 skill 自身即一个智能体
- **MCP** —— Model Context Protocol，平台与项目之间唯一的工具调用协议
- **BYOK** —— Bring Your Own Key，项目自带模型 API key
- **Seed / Overlay** —— Skill 的不可变种子提示与可被 Supervisor 覆写的增量层
- **Session** —— 一次会话上下文，绑定 `project_id + user_id`，寿命由项目自定义
- **Handoff** —— Skill Runtime 在一个会话中替换 active_skill 的动作
:::

## #actors 02 / Actors & Use Cases :: 用户角色与典型用例

需求的服务对象是六类角色——它们之间能力边界互不重叠，且每条 FR 至少与一类角色对应。

A1 · CALLER

### 调用方（Caller）

项目内运行的 App、后台服务、CI 任务或上游 agent，持有 `project_id + api_key`。通过 HTTP/SSE 发起会话与消息。

A2 · END USER

### 终端用户

项目业务的使用者。不直接持有平台凭证；调用方代其发起请求，`user_id` 用于用户级限流、telemetry 与计费分摊。

A3 · PROJECT ADMIN

### 项目管理员

项目侧的运维或产品负责人。在 Admin Console 管理 skill 灰度、查看 telemetry、配置模型偏好与 BYOK、审阅 Supervisor 提案。

A4 · PLATFORM OPS

### 平台运维

负责平台自身可用性，管理基础设施、配额上限、系统级告警；不接触任何项目业务数据。

A5 · SKILL AUTHOR

### Skill 作者

领域专家，负责撰写、维护、迭代项目下的 skill markdown。提交后通过灰度状态机晋级。

A6 · COMPLIANCE

### 合规审计

持只读权限访问审计日志、trace 历史、RBAC 变更记录。验证操作归因与数据访问边界。

:::comparison
::versus UC-01
### 用例：调用方发起一次会话并接收流式响应
1. **认证** — 调用方携带 `X-Project-Id` + `Authorization: Bearer api_key` 调用 `POST /v1/sessions`。
2. **会话建立** — 平台返回 `session_id`，初始 `active_skill` 由项目侧默认配置或 intent 推断。
3. **发送消息** — 调用方 `POST /v1/sessions/{id}/messages`，请求建立 SSE 长连接。
4. **意图与执行** — Intent Gateway 判定 target_skill；Skill Runtime 装载、调用工具（MCP）、流式回吐 token。
5. **结束** — 响应完成或调用方 `DELETE /v1/sessions/{id}` 主动结束。

::versus UC-02 { highlight: true }
### 用例：Skill 作者发布新版本经灰度晋级
1. **上传草稿** — Skill 作者通过 Admin Console 或 API 上传 markdown，落入 staging。
2. **契约校验** — 结构合法、字段齐全、引用工具存在；任一项失败拒绝入库。
3. **评测跑分** — Eval Harness 用项目 frozen eval set 跑分，对比基线。
4. **影子 / 灰度** — 分别走 shadow 与 canary，按指标决定 promote 或回滚。
5. **晋级 / 回滚** — 通过即写入 prod；任一阶段指标退化触发自动回滚 + 告警。
:::

## #functional 03 / Functional Requirements :: 功能需求（FR）

共 34 条，按模块分组。每条 FR 包含 ID、优先级、描述、关联角色、关联章节。

:::accordion
::panel { open: true }
### 3.1 API 网关与会话（FR-01 ~ FR-06）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-01 | MUST | 所有入站请求必须携带 `project_id` + 有效 `api_key`，鉴权失败返回 401，鉴权信息不得在下游被覆写。 | A1, A4 |
| FR-02 | MUST | 支持创建会话、追加消息（SSE 流式）、查询会话状态、主动结束会话四类核心 API。 | A1 |
| FR-03 | MUST | 所有写操作支持 `Idempotency-Key` header；同一键 24 小时内重复请求返回原响应。 | A1 |
| FR-04 | MUST | 项目级 QPS 默认 20、用户级 QPS 默认 5；超限返回 429 + `Retry-After`。 | A1, A2, A4 |
| FR-05 | SHOULD | 支持月度 token 预算硬上限与软告警，可在 Admin Console 设置。 | A3, A4 |
| FR-06 | SHOULD | 支持 WebSocket 作为 SSE 的可选替代（用于双向交互场景）。 | A1 |

::panel
### 3.2 Intent Gateway 与 Skill Runtime（FR-07 ~ FR-13）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-07 | MUST | Intent Gateway 在每轮对话头部输出 `{intent, confidence, target_skill, hint, user_frustrated}` JSON 结构。 | A1 |
| FR-08 | SHOULD | Intent 结果支持按上下文 hash 缓存；命中跳过轻量 LLM 调用。 | A1, A4 |
| FR-09 | MUST | Skill Runtime 装载指定版本 skill 作为系统提示，并维护 `active_skill` 状态。 | A1, A5 |
| FR-10 | MUST | 支持 handoff：在同一会话中按 frontmatter 中的 `handoff_to` 切换 active_skill。 | A1, A5 |
| FR-11 | MUST | 每个 skill 可配置回合预算（turn_budget），超出强制收敛 respond + end。 | A5 |
| FR-12 | MUST | Runtime 状态在每个节点结束后落 checkpoint（Postgres），支持崩溃恢复。 | A4 |
| FR-13 | COULD | 支持 skill 之间的 sub-graph 嵌套调用（一个 skill 临时唤起另一个 skill 完成子任务后返回）。 | A5 |

::panel
### 3.3 Skill Registry 与版本治理（FR-14 ~ FR-19）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-14 | MUST | Skill 按 `project_id/name@semver` 命名空间存储，禁止跨项目引用或 import。 | A3, A5 |
| FR-15 | MUST | 每个 skill 有不可变的 seed 层和可被 Supervisor 改写的 overlay 层；运行时合并输出。 | A5 |
| FR-16 | MUST | 灰度状态机：`draft → staging → shadow → canary → prod`，禁止跨级跳转。 | A3, A5 |
| FR-17 | MUST | promote 失败自动回滚到上一个 prod 版本，并写入审计日志。 | A3, A6 |
| FR-18 | SHOULD | 支持 skill diff 视图（seed vs overlay、版本 N vs N-1）。 | A3, A5 |
| FR-19 | SHOULD | 支持按 user_id 或 user_segment 的 canary 路由（5% / 25% / 100%）。 | A3 |

::panel
### 3.4 Memory · Tool Bridge · Model Router（FR-20 ~ FR-26）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-20 | MUST | 短期会话记忆按 `project_id` 分区存储于 Redis，支持 get / append / summarize_session 三类操作。 | A1 |
| FR-21 | MUST | 业务对象记忆通过 MCP `memory.read / memory.write` 代理回项目侧；平台不持久化任何业务字段。 | A1, A6 |
| FR-22 | MUST | 所有工具调用必须经 MCP 协议出站；禁止平台内置硬编码业务工具。 | A4, A6 |
| FR-23 | MUST | MCP 调用强制护栏：单次超时 15s（上限可调到 60s）、熔断阈值 30s/5 次、重试上限 1 次（仅幂等工具）、响应大小 1MB、并发上限每项目 50 / 全平台 500。 | A4 |
| FR-24 | MUST | Model Router 支持 OpenAI / Anthropic / Azure OpenAI / Bedrock / Ollama 至少 5 类 provider；BYOK 经 Vault 解密后注入。 | A3 |
| FR-25 | MUST | 支持回退链 `preferred → fallback1 → fallback2`；上一档失败自动切换。 | A3, A4 |
| FR-26 | SHOULD | 支持基于成本 / 延迟 / 项目偏好的路由策略选择。 | A3 |

::panel
### 3.5 Telemetry · Eval · Supervisor（FR-27 ~ FR-31）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-27 | MUST | 所有调用产生 OTEL trace，必含 skill 版本快照、上下文、工具调用、模型输出，可完整回放。 | A4, A6 |
| FR-28 | MUST | Eval Harness 按 frozen eval set 计算 correctness / latency / cost / safety 四类指标，支持 cron / Admin / Supervisor 三类触发。 | A3, A5 |
| FR-29 | SHOULD | Supervisor 离线管线消费 traces 起草补丁，经 shadow → canary 入库；可由项目独立开关 `auto_promote` / `require_review`。 | A3 |
| FR-30 | SHOULD | Supervisor 调用预算与变更预算双重护栏：每日 LLM 上限、每 skill 每周改写上限。 | A4 |
| FR-31 | COULD | 支持 Supervisor 跨 skill 的 handoff 拓扑分析与异常路径告警。 | A3 |

::panel
### 3.6 Admin Console 与 RBAC（FR-32 ~ FR-34）
| ID | 优先级 | 需求描述 | 角色 |
| --- | --- | --- | --- |
| FR-32 | MUST | Admin Console 提供 SSO / OAuth 登录，所有界面操作映射到平台内部管理 API。 | A3, A4 |
| FR-33 | MUST | RBAC 至少支持四类角色：项目管理员、Skill 作者、运维、合规审计；权限按 `project_id` 范围分发。 | A3, A6 |
| FR-34 | SHOULD | 所有 RBAC 变更、灰度晋级、Supervisor 决策、BYOK 配置写入审计日志，保留 ≥ 365 天。 | A6 |
:::

## #non-functional 04 / Non-Functional Requirements :: 非功能需求（NFR）

性能、隔离、安全、可用性、可观测性、可维护性六大类共 24 条。

:::accordion
::panel { open: true }
### 4.1 性能（NFR-01 ~ NFR-04）
| ID | 优先级 | 指标 / 描述 |
| --- | --- | --- |
| NFR-01 | MUST | API 网关 p95 延迟 ≤ 50ms（不含上游模型调用），单 Compact 实例支撑 50 RPS。 |
| NFR-02 | MUST | Intent Gateway 端到端 p95 ≤ 800ms（含轻量 LLM 调用）；命中缓存时 ≤ 50ms。 |
| NFR-03 | SHOULD | SSE 首 token 延迟 p95 ≤ 1.5s；token 间间隔抖动 p95 ≤ 200ms。 |
| NFR-04 | SHOULD | Scale-Out 模式可水平扩展至 ≥ 1000 RPS、≥ 5000 并发会话。 |

::panel
### 4.2 多租户隔离（NFR-05 ~ NFR-09）
| ID | 优先级 | 指标 / 描述 |
| --- | --- | --- |
| NFR-05 | MUST | Skill 命名空间按 `project_id` 强隔离；跨项目读取在 schema 层即被拒绝。 |
| NFR-06 | MUST | MCP endpoint registry、模型 BYOK、telemetry 分区按 `project_id` 严格分离。 |
| NFR-07 | MUST | Redis 按 `project_id` 一致性哈希分片；rate-limit 计数与 session 上下文不共享。 |
| NFR-08 | MUST | Supervisor 闭环按项目独立运行；不允许跨项目样本污染补丁起草。 |
| NFR-09 | SHOULD | 支持按项目独立 KMS / Vault 实例（高合规场景）。 |

::panel
### 4.3 安全（NFR-10 ~ NFR-14）
| ID | 优先级 | 指标 / 描述 |
| --- | --- | --- |
| NFR-10 | MUST | 所有外部通信使用 TLS 1.2+；BYOK 凭据加密存储（AES-256-GCM）。 |
| NFR-11 | MUST | `api_key` 仅在创建时返回明文；服务端只存储 hash + 前缀；支持轮换与撤销。 |
| NFR-12 | MUST | 所有日志、trace、telemetry 在落库前完成 PII 脱敏（手机号 / 身份证 / 信用卡等）。 |
| NFR-13 | MUST | Admin Console 写操作必须经 SSO 二次确认；高危操作（删除项目、撤销 BYOK）触发邮件 / IM 通知。 |
| NFR-14 | SHOULD | 提供 IP 白名单 / mTLS 可选项给金融级合规项目使用。 |

::panel
### 4.4 可用性与可观测性（NFR-15 ~ NFR-20）
| ID | 优先级 | 指标 / 描述 |
| --- | --- | --- |
| NFR-15 | MUST | API Gateway / Compute 层无状态，支持 rolling update 零停机；Stateful 层支持主备切换。 |
| NFR-16 | SHOULD | 核心 API 月度可用性 ≥ 99.9%；维护窗口预先公告。 |
| NFR-17 | MUST | OTEL trace 默认采样率 100%（GA 阶段），保留 ≥ 30 天；可按项目调整。 |
| NFR-18 | MUST | 关键指标（QPS / 延迟 / 错误率 / token 消耗）按项目维度可查询。 |
| NFR-19 | SHOULD | 提供 Grafana 面板模板与告警规则示例。 |
| NFR-20 | COULD | 支持把 trace 导出到 Langfuse / DataDog / 自建 ClickHouse。 |

::panel
### 4.5 可维护性与可移植性（NFR-21 ~ NFR-24）
| ID | 优先级 | 指标 / 描述 |
| --- | --- | --- |
| NFR-21 | MUST | 同一镜像通过 `PROFILE=compact&#124;edge&#124;worker&#124;supervisor&#124;eval` 启动参数加载子模块；不同 Profile 共享同一份配置变量。 |
| NFR-22 | MUST | Compact → Scale-Out 升级不要求重写代码，仅调整 manifests + PROFILE。 |
| NFR-23 | SHOULD | 所有外部依赖（模型、工具、telemetry 后端）通过抽象接口接入，可替换。 |
| NFR-24 | SHOULD | 提供 Helm chart 与 Terraform module 给生产部署使用。 |
:::

## #data 05 / Data Requirements :: 数据需求

明确平台持有什么数据、不持有什么数据，是合规审计的第一道判定。

:::comparison
::versus D1 · 平台持有
### 控制面元数据
- `projects(project_id, name, owner, created_at, status)`
- `api_keys(key_hash, project_id, scopes, expires_at)`
- `byok(project_id, provider, encrypted_key, kms_id)`
- `skills(project_id, name, version, status, seed_md, overlay_md)`
- `traces(trace_id, project_id, session_id, skill_version, payload)`
- `eval_results(project_id, skill_version, eval_set, metrics, run_at)`
- `supervisor_proposals(project_id, skill, draft, status)`
- `audit_log(actor, action, target, before, after, ts)`
- `session_long_ctx(session_id, project_id, summary)` · 仅长会话摘要

::versus D2 · 平台禁止持有
### 业务对象数据
- 任何用户业务实体（订单、目标、客户、病历等）
- 用户 PII（姓名、身份证、地址、联系方式）超出 telemetry 脱敏副本范围
- 项目内部权限矩阵 / 业务 ACL 表
- 项目业务数据库的 schema 元数据或缓存副本
- 第三方 API 的明文密钥（除 BYOK 模型 key 外）

所有业务对象的读写都通过 MCP `memory.read / memory.write` 代理回项目侧 MCP server 完成。
:::

## #acceptance 06 / Acceptance Criteria :: GA 验收准则

下列五条全部通过方能宣布 GA；任一条失败均阻塞发布。

:::flow
1. **需求覆盖** — FR-MUST × 24 条 + NFR-MUST × 14 条全部交付，自动化测试覆盖率 ≥ 80%。
2. **多租户证伪测试** — 构造两个项目，互相尝试访问对方的 skill / telemetry / session / BYOK，全部应返回 404 或 403；无任何路径泄漏。
3. **性能基准** — NFR-01 / NFR-02 / NFR-03 在 Compact 模式下达标；Scale-Out 模式 1000 RPS 持续 1 小时无 OOM、无 5xx 飙升。
4. **灰度回滚演练** — 主动制造 promote 失败场景，验证 FR-17 自动回滚 + 审计日志写入 + 告警发出三项动作完整发生。
5. **合规审计走查** — 合规角色（A6）以只读权限拉取最近 7 天审计日志、trace 样本、RBAC 变更记录；所有 PII 字段已脱敏，所有变更可归因到具体 actor。
:::

## #references 07 / References :: 参考来源

- [1] IEEE. — https://standards.ieee.org/ieee/830/1222/ | 本文需求结构与术语遵循 IEEE 830 SRS 框架。
- [2] DSDM Consortium. — https://www.agilebusiness.org/page/themoscowrules | 优先级 MUST / SHOULD / COULD / WON'T 取自 MoSCoW 规则。
- [3] Anthropic. — https://modelcontextprotocol.io/ | FR-22, FR-23 工具调用协议规范来源。
- [4] 本系列文档

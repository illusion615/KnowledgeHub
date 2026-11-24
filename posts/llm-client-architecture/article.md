---
title: LLM Client 架构重构：多 Provider 运行时设计实践
eyebrow: Runtime Refactor Notes
brand: AI Mud
date: 2026-04-09
strict_i18n: false
strict_density: true
lead: 这篇文章把原先混在 MLX 文中的 LLM client 内容独立出来，聚焦一件更明确的事：在 AI-MUD 项目里，如何把一个 1905 行、同时承担业务入口、Provider 适配、并发控制和故障处理的单文件客户端，重构成一个可扩展、可维护、可治理的多 Provider 运行时。
hero_actions:
  - "先看重构动机 | #trigger"
  - "直接看重构结果 | #results"
panel_label: 核心原则
panel_title: 这次重构不是为了把客户端写得更“优雅”，而是为了把业务调用、Provider 适配和运行时稳定性拆成彼此独立的责任层。
panel:
  - "业务层只保留 `call_role_model(...)` 这一条入口。"
  - Provider 之间零交叉依赖，新增后端不再改业务逻辑。
  - 并发、熔断、连接池等稳定性能力从“隐式行为”变成显式运行时控制面。
metrics:
  - "文件规模 | 1905 → 995 | 主客户端文件缩减约 48%"
  - "Provider 实现 | 3 个 | Ollama、OpenAI-compatible、Azure"
  - "协议方法 | 6 个 | call / stream / probe / warmup / heartbeat / auth headers"
  - "并发修复 | 2 → 6 | PER_MODEL_CONCURRENCY 调整以消除角色饥饿"
style:
  accent: "#18b7ab"
---

## #trigger 01 / Trigger :: 起因：客户端真正的问题不是“代码太长”，而是职责混在一起之后没人能安全地继续改

当一个 LLM client 同时承担角色入口、模型路由、Provider 协议、网络连接、并发治理和故障保护时，最先坏掉的通常不是某个功能，而是演进能力本身。当前材料里保留的数字和经验，足够说明这次重构为什么必须发生。

:::insight-grid { cols: 2 }
::card 01
### 入口与实现耦合
业务层本应只关心 role，但旧客户端把 role 解析、provider 选择和 transport 细节揉在一起。

::card 02
### 跨 Provider 重复代码
当前材料明确提到约 220 行跨 Provider 重复逻辑，说明抽象层次不对，重复已经开始侵蚀可维护性。

::card 03
### 并发饥饿
storyteller 与 supervisor 共用模型时会发生资源饥饿，证明客户端已经进入“运行时治理”问题，而不只是接口封装问题。

::card 04
### 新增后端成本过高
如果新增一个 Provider 还要改业务入口层，说明系统没有真正形成稳定边界。
:::

## #goals 02 / Design Goals :: 设计目标：哪些必须重构，哪些必须保持不动

一次好的运行时重构，不是全盘推倒，而是把“应该稳定的接口”固定下来，把“应该变化的实现”隔离出去。当前路线最聪明的地方，在于它保住了业务入口，同时重做了内部责任边界。

:::comparison
::versus What Stayed Fixed
### 保留下来的稳定接口
- **`call_role_model(...)`** — 业务层仍通过 role 来表达意图，不感知 provider 和 endpoint 细节。
- **Role → Model 映射** — 角色分工依旧存在，重构没有破坏上层编排逻辑。
- **单一业务入口** — 避免在业务代码里散落 Provider 专属调用。

::versus What Was Rebuilt { highlight: true }
### 必须被重新拆分的部分
- **分派层** — 统一参数解析、provider 解析和调用分发。
- **Provider 协议层** — 把各后端的差异收敛为同一组方法契约。
- **运行时控制层** — 并发、熔断、连接池、心跳这些能力不再散落在实现细节里。
:::

## #architecture 03 / Layered Architecture :: 三层架构：把“谁决定调用什么”和“怎么真正发请求”彻底拆开

当前材料里最重要的设计点，是它把 llm_client 变成了一套分层系统，而不是一个越来越大的工具模块。层与层之间的边界一旦稳定，扩展与治理就变成了常规工作。

System View

### LLM Client 的分层系统图

最上层只表达业务意图，中间层负责解析和分发，底层 Provider 负责真正执行请求，稳定性能力作为运行时控制面横切其间。

LLM Client 分层架构图

从上到下依次是 Role API 层、Dispatch 层、Provider 协议层和 Runtime 控制层，展示 call_role_model、provider 分发以及并发与故障治理之间的关系。

01

### Role API Layer

业务层唯一应该看到的入口是 `call_role_model(role, messages, stream)`。这一层只负责表达业务角色和请求意图，不承担具体 Provider 的实现差异。

### call_role_model

Business API

- 解析 role 对应的 model / provider / endpoint
- 保持业务代码不感知底层后端差异
- 把上层编排与底层 transport 解耦

Single Entry

02

### Dispatch Layer

中间层负责把 role 解析出来的调用意图转成具体的 provider 调用，并集中处理参数、模型标识、endpoint 和流式 / 非流式模式。

### call_model / Provider Resolution

Dispatch

- 获取 provider 实现并分发请求
- 集中解析模型和 endpoint 配置
- 避免 Provider 分支逻辑渗透到业务层

Centralized Routing

03

### Provider Protocol Layer

每个后端都实现同一套契约：调用、流式输出、探针、预热、心跳和认证头构造。这样“新增一个 Provider”才会变成实现协议，而不是改遍系统。

### OllamaProvider

Local

- 承接本地模型调用
- 适合低延迟、本地优先场景

Local Runtime

### OpenAICompatProvider

Compatible

- 统一兼容 OpenAI 风格接口
- 减少多家兼容服务接入成本

Compatible API

### AzureProvider

Cloud

- 承接 Azure 路线的认证与调用
- 保持与本地 / 兼容实现同一调用模型

Managed Endpoint

04

### Runtime Control Layer

真正让这次重构从“代码整理”升级成“运行时设计”的，是并发、熔断、连接池和心跳这些控制面被显式抽出来了。

### Stability Primitives

Runtime

- Dual semaphore: global + per-model 并发控制
- Per-model circuit breaker: 熔断保护精确到模型级
- httpx.Client 单例复用: 降低 transport 开销与连接抖动
- warmup / heartbeat / probe: 让可用性检查成为显式动作

Operational Guardrails

## #runtime 04 / Runtime Controls :: 关键实现：真正有价值的优化，发生在运行时控制层

如果只看“代码行数减少”，会低估这次重构。更关键的变化在于：以前隐含在各个分支里的稳定性策略，现在被写成了显式的运行时机制。

:::accordion
::panel { open: true }
### 4.1 Dual Semaphore：把并发从“碰运气”变成“有边界的调度”
当前材料保留了 global + per-model 双层并发控制，以及 `PER_MODEL_CONCURRENCY` 从 2 调到 6 这一修复点。这说明问题本质不是“线程数不够”，而是不同角色共享模型时缺少公平调度边界。

::panel
### 4.2 Per-model Circuit Breaker：把故障限制在模型粒度，而不是拖垮整套运行时
把熔断粒度做到模型级，意味着某个特定后端或模型出问题时，系统仍然有空间让其他模型继续服务。这是多 Provider 运行时和单 Provider 客户端的根本差别之一。

::panel
### 4.3 Connection Pool + httpx.Client 复用：把 transport 成本从业务路径中拿掉
单例 HTTP 客户端不是“性能小技巧”，而是运行时稳定性的一部分。它减少连接抖动和重复初始化开销，让 provider 层更接近真正可运行的服务组件。

::panel
### 4.4 Warmup / Probe / Heartbeat：把“模型活着吗”变成显式协议
Provider 协议里不只有 call 和 stream，还包括 probe、warmup、heartbeat。这一层的价值在于，它把可用性检查前移成标准能力，减少了“请求发出去才知道死了”的不确定性。
:::

## #results 05 / Results :: 重构结果：这次工作真正提升的是可扩展性和可治理性

当前材料里最直观的结果是文件从 1905 行降到 995 行，但更关键的是结构收益：业务调用更稳定，新增 Provider 的改动范围更小，并发饥饿得到了明确修复。

| 维度 | 重构前 | 重构后 | 意义 |
| --- | --- | --- | --- |
| 主客户端文件 | 1905 行 | 995 行 | 复杂度显著下降，主路径更清晰。 |
| 跨 Provider 重复逻辑 | 约 220 行重复 | 协议层统一收敛 | 新增后端不再复制业务逻辑。 |
| 并发控制 | 单一 / 不充分边界 | global + per-model semaphore | 角色共享模型时的饥饿问题可被针对性治理。 |
| 稳定性能力 | 零散分布 | 熔断、心跳、预热显式化 | 运行时行为更可预期，也更便于运维。 |

### 最直接的收益

业务代码可以继续只面向 role，而不必追着不同 Provider 的 transport 细节跑。这让上层编排系统保持稳定。

### 最重要的隐性收益

“新增一个 Provider”从改业务分支，变成实现协议。这是软件边界成熟的信号，不只是代码好看了。

### 仍然没有解决的事

- 当前材料没有保留完整时延 benchmark
- 没有展示更复杂多 Provider 降级策略
- 没有展开 auth / quota / retry 的更细设计

## #conclusion 06 / Conclusion :: 结论：客户端重构的价值，不在于把文件拆小，而在于把系统责任重新分配正确

当前这次重构最值得保留的经验是：多 Provider 运行时的复杂度无法靠“写得小心一点”来控制，必须通过明确的边界来控制。只要业务入口、分派层、Provider 协议和运行时控制面被拆开，后续扩展、治理和故障隔离才会真正变得可持续。

:::comparison
::versus What Worked
### 这次重构真正成功的地方
- 保住了业务入口，不需要让上层角色编排跟着重写。
- 把 Provider 扩展从系统级修改缩到协议实现范围。
- 让并发和故障治理成为显式的运行时控制，而不是散落的补丁。

::versus Main Lesson { highlight: true }
### 如果只保留一句话
LLM client 的长期可维护性，不取决于你支持了多少个 Provider，而取决于你是否把“业务意图”“调用分发”“Provider 实现”和“运行时治理”放到了各自该在的位置上。
:::

## #references 07 / References :: 参考来源

- [1] Knowledge Hub. | 提供这次客户端重构在 AI-MUD 项目中的阶段化背景与工程上下文。
- [2] Knowledge Hub. | 帮助理解上层 role 编排与执行链路，为 `call_role_model(...)` 的业务定位提供上下文。

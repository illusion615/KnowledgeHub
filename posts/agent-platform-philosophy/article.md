---
title: 智能体平台的边界、目标与不适用场景
eyebrow: Agent Platform · Design Philosophy
brand: 智能体平台
date: 2026-05-04
strict_i18n: false
strict_density: true
lead: "本设计文档将\"是否需要把智能体运行时从业务系统中抽出来\"作为待验证的工程假设，给出八条可观测的设计目标、四条不进入平台的非目标、与七个主流方案的逐维度对照，并明确五条本设计已知不适用的场景。论证手段以 IntellyGoal（Phase 1 真实租户）为实证锚点，避免把分类决定误读为测量结果。"
hero_actions:
  - "查看八条设计目标 | #pillars"
  - "先看不适用场景 | #limitations"
panel_label: 中心假设（待证伪）
panel_title: 智能体运行时属于基础设施层能力（有别于业务功能）
panel_desc: 该假设在三类情况下即告证伪：(a) 接入第二个项目时平台代码改动 ≥ 50 行；(b) 任意一类业务对象（订单、患者档案、销售线索）必须存放在平台数据库；(c) 三个以上项目同时运行时，无法用单一 trace ID 复现某次跨项目调用。八条设计目标即为该假设的判定标尺。
panel:
  - 平台代码静态依赖图不得包含任何项目命名空间
  - 新项目接入仅 3 步：注册 project_id、登记 MCP endpoint、上传 skill
  - 每次调用必须可回放 skill 版本 / 上下文 / 工具序列 / 模型输出四元组
  - 模型、工具、运行时内核任一供应商锁定均触发设计违反
metrics:
  - "平台职责（设计层划分） | 8 | 边界表中平台侧 8 类与业务无关的运行时机制；为分类决定，非测量结果。"
  - "项目职责（设计层划分） | 6 | 边界表中项目侧 6 类带业务副作用的责任；同上为分类决定。"
  - "已知不适用场景 | 5 | 本设计在单租户、低调用量、强分支逻辑等 5 类场景下不优于直接内嵌（见 Limitations）。"
  - "实证锚点 | 1 | IntellyGoal Phase 1 是当前唯一已落地租户；实证观测数据均限于该项目。"
style:
  accent: "#0891b2"
---

## #problem 01 / Hypothesis :: 需要被验证的工程假设

"组织内每多一个引入 LLM 能力的业务系统，自建智能体堆栈的边际成本就会重复出现一次。"该陈述本身是假设而非定理。这里梳理三类被多次报告的失败模式，并标注当前可获得的证据强度，供读者按本组织实际情况判断该假设是否成立。

:::insight-grid { cols: 2 }
::card F1
### 同一类机制的重复实现
对话状态机、流式 SSE 适配器、token 计数器、限流配额逻辑在不同项目中独立维护。*证据强度*：IntellyGoal Phase 0（迁移前）含 ~1.4k 行此类代码，与团队内另一原型项目高度同构；尚无更大样本统计。

::card F2
### 跨项目行为漂移
不同团队迭代提示模板、回退策略、工具描述格式后，同类问句在不同项目得到风格与深度迥异的响应。*证据强度*：业内多次报告（参见 LangSmith 与 Arize 的 trace 漂移分析），本组织尚无量化对比。

::card F3
### 运维信号分散
token 用量、慢调用、负反馈散落在各项目本地日志，安全审计需逐项目走一遍。*证据强度*：合规需求驱动，已被本组织安全团队明确列为 Phase 1 必须解决项。

::card F4
### 抽象层级的可能错配
若 F1–F3 在 ≥ 3 个项目同时出现，则把"运行时机制"留在业务层的代价大概率超过抽出独立平台的代价。后续架构设计均围绕这一判断展开；不同组织可代入自身项目数评估。
:::

:::comparison
::versus Pattern A · 内嵌
### 智能体作为业务模块
对话状态、工具调用、模型路由直接嵌入业务服务代码库，与领域逻辑共享数据库与发布周期。

- **耦合面** —— 模型升级与业务发布同周期
- **调试面** —— prompt 改动散落在领域代码 PR 中
- **合规面** —— 审计日志需在每个服务复刻
- **成本面** —— 跨项目 token 议价与统一限流缺乏落点

::versus Pattern B · 抽出 { highlight: true }
### 智能体作为独立运行时服务
抽出容器化服务，对内承诺统一 API 与 SLA，对外仅经 MCP 消费项目能力。业务侧负责工具实现、skill 撰写、评测集与 BYOK。

- **耦合面** —— 模型升级与业务发布解耦
- **调试面** —— skill 版本化 + 集中 trace
- **合规面** —— 集中审计、集中 RBAC
- **成本面** —— 跨项目 token 报表与统一配额
:::

证伪条件

### 本假设何时不成立

当组织内只有 1 个 LLM 项目、或所有 LLM 项目共享同一业务数据库与同一团队时，Pattern B 的隔离与运维收益不足以补偿额外的运维与协议复杂度。[07 不适用场景清单](#limitations)列出了五条具体反转条件。

## #definitions 02 / Definitions :: 关键术语的操作定义

D1–D6 六项操作定义供后续判定争议特性的归属。每条定义给出充分必要条件或可机械执行的判定算法，避免读者用直觉裁决。

D1 · Skill

五元组 `(system_prompt_md, tools_whitelist, model_pref, version, eval_set_ref)`。其中 `system_prompt_md` 为不可变 markdown，`version` 须随任一字段变化递增。运行时按 (project_id, skill_id, version) 三元组唯一加载。

D2 · 业务对象

满足下列任一条件即为业务对象：(i) 参与项目侧事务边界；(ii) 受项目 ACL 策略保护；(iii) 出现在项目业务表的主键或外键中。判定算法：在项目数据库 schema 上跑一次扫描，命中即归项目侧。

D3 · 运行时机制

同时满足三条：(i) 实现不依赖任何业务概念；(ii) 在两个以上项目中接口形状一致；(iii) 输入输出可被 trace 完整记录。例：意图分类、模型路由、限流。反例：commit_goal_plan、create_order。

D4 · 多租户硬隔离

在 schema、缓存键、配置表、灰度状态、telemetry 分区五个维度上，跨 project_id 的读写默认拒绝；放行需显式策略授权且写入 audit_log。判定测试：跨租户读写测试集 100% 拒绝。

D5 · 可回放

给定 trace_id，能以确定的方式还原 (skill 版本、输入上下文、工具调用序列与参数、模型完整输出) 四元组。判定算法：对随机抽样的 N 条 trace 执行 replay，结构化字段一致性 ≥ 99%。

D6 · 业务无关

平台代码静态依赖图不得包含任何项目命名空间。判定算法：CI 阶段执行 import 扫描，命中项目包即构建失败。

## #pillars 03 / Design Goals :: 八条设计目标

八条设计目标是每个架构决策的判定依据：每当有"是否引入此特性"的争议，对照八条逐项检查；若违反前两条任一条则不进入主线，违反后六条则需在 PR 描述中显式说明取舍依据。

Goal 01

### 业务无关

定义见 D6。判定方法：依赖图扫描 + 把任意项目从平台拔掉后回归测试仍通过。

Goal 02

### 多租户硬隔离

定义见 D4。判定方法：跨租户读写测试集 100% 拒绝；audit_log 完整记录授权放行。

Goal 03

### 可回放

定义见 D5。判定方法：N=200 抽样 replay 一致性 ≥ 99%；缺失字段触发告警。

Goal 04

### 可替换

模型经 LiteLLM 抽象、工具经 MCP 抽象、运行时经 LangGraph 接口；任一层供应商锁定均触发违反。判定方法：模型 swap、工具 swap、内核 swap 三类 e2e 测试。

Goal 05

### 单镜像可启动

最小可用形态为 1 个 Docker 镜像 + Postgres + Redis。新项目接入步数 ≤ 3：注册 project_id、登记 MCP endpoint、上传 skill。

Goal 06

### BYOK

模型 API key 由项目自带，平台只在调用时注入。平台代码中不出现任何 provider key 字面量；CI 含 secret-scan 检查。

Goal 07

### MCP 单通道

平台出站到项目仅经 MCP 协议，禁止并行 webhook / gRPC / 私有 RPC。判定方法：网络策略只放行注册的 MCP endpoint。

Goal 08

### 可演进

支持 Supervisor 离线管线在 shadow / canary 双闸下提交 skill 补丁。Phase 1 可暂不实现，但 schema 与接口须为该路径预留。

Decision Rule

### 八条目标的优先级

裁决序列：*业务无关 > 多租户硬隔离 > 可回放 > 可替换 > BYOK > MCP 单通道 > 单镜像 > 可演进*。

- **1 → 2**：业务无关是隔离的前提，没有业务无关，隔离失去意义
- **2 → 3**：先保证不串户，再追求复现；隔离失败后即便可回放也已是事故
- **3 → 4**：可回放是可替换的安全网；不可回放的前提下任何替换都是赌博
- **4 → 5**：可替换属架构属性，BYOK 属商业边界；前者破坏后者尚可补救
- **5 → 6**：BYOK 决定 token 责任主体，比通道单一性更高优先级
- **6 → 7**：MCP 单通道是工程约束；单镜像与可演进属阶段性能力
- **7 → 8**：单镜像服务于早期接入门槛，可演进是后续能力

## #boundary 04 / Boundary & Non-Goals :: 边界划分与四条不进入平台的事项

以下按 D1–D6 操作定义给出平台与项目责任的逐项归属，并明确四条平台不承担的事项，避免诉诸主观偏好。

| 归属 | 职责 | 归属依据（引用定义） |
| --- | --- | --- |
| 平台 | 项目鉴权 / 限流 / 计费元数据 | D3 运行时机制；跨项目共用 |
| 平台 | 意图网关 · Skill 注册与版本治理 | D1 + D3；与领域无关 |
| 平台 | Skill Runtime 与 handoff | D3；状态机协议跨项目同构 |
| 平台 | 工具桥（MCP 客户端）· 超时 / 熔断 / 重试 | D3；协议层与具体工具无关 |
| 平台 | 模型路由 · BYOK 注入 · 回退链 | D3 + Goal 06 |
| 平台 | 会话短期记忆（≤ session 寿命） | 非业务对象（D2 不命中） |
| 平台 | 端到端 telemetry · 评测 · Supervisor 管线 | D5 可回放的承载 |
| 平台 | Admin 控制台 | D3；面向人的运维入口 |
| 项目 | 领域工具实现，以 MCP server 暴露 | D2 命中（带业务副作用） |
| 项目 | 业务数据库与事务边界 | D2 命中；事务边界须贴聚合根 |
| 项目 | 权限与租户策略 | 业务语义下的 ACL，平台不可代决 |
| 项目 | 业务对象长期记忆 | D2 命中；与业务表同源 |
| 项目 | 模型 API key（BYOK）· 评测集 · 通过标准 | Goal 06；计费与领域成功标准 |
| 项目 | Skill markdown 撰写与维护 | 领域知识产物 |

### 四条不进入平台的事项 || Four Non-Goals

:::accordion
::panel { open: true }
### NG1 · 不实现业务工具
*判定边界*：任何带"创建/修改/删除业务对象"语义的工具（命中 D2）必属项目侧。*依据*：违反 Goal 01；同时跨业务事务边界，违反聚合根原则。

*常见违反*：把"通用 SQL 工具"放入平台，看似业务无关，实则把所有项目业务表暴露在统一接口下，等价于把多租户隔离削弱到数据库账号层级。

::panel
### NG2 · 不持有业务对象数据
*判定边界*：平台 Postgres 仅存控制面元数据（skills@version、traces、eval_results、supervisor_proposals、project + api_key、audit_log）；Redis 仅存 session 短期上下文、限流计数、幂等 token、热缓存。

*典型失败模式*：为"加速跨项目上下文"在平台缓存用户档案，遭遇 GDPR 删除请求时需在平台与项目两侧分别处理，跨地域同步窗口期会出现违规风险。

::panel
### NG3 · 不托管模型 API key
*判定边界*：BYOK；平台不出现"预付费余额"概念；不为项目代付 token 费用。

*依据*：(a) 合规边界——模型供应商账号通常已签署独立 DPA；(b) 商业边界——代付意味着平台需为项目违规承担连带责任。

::panel
### NG4 · 不替业务设定通过阈值
*判定边界*：平台只提供机制（评测 runner、灰度状态机、人审队列），不预设阈值。默认配置必须采用保守安全策略（如灰度 auto-promote 默认关闭）。

*依据*：通过阈值是领域成功标准的体现；由平台预设会形成隐式策略，被项目方误以为"已被审核"。
:::

边界一句话

### One-Liner

平台承担运行时机制（D3），项目承担业务对象与领域决策（D2 + 通过标准）。新需求评审时优先回到 D2 / D3 判定，再讨论实现成本。

## #landscape 05 / Market Landscape :: 市场对标 · 主流方案的边界形状

下表按七个维度对照本设计与 2024–2026 期间公开可查的主流方案。维度选取依据：每个维度均能被官方文档或 SDK 行为佐证，避免主观比较。所有产品状态注明截至 2026-05 的查阅时间。

| 方案 | 定位 | 工具协议 | 模型 key | 多租户 | 数据驻留 | 可观测下界 | 演进机制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LangChain 生态<br>（LangGraph + LangSmith + Hub） | SDK + 平台化 Trace/Eval | 开发者自接 / MCP 适配器 | BYOK | 账户级 | SaaS（LangSmith）默认存输入输出 | 调用元数据 + 输入输出 | Prompt Hub 版本化；自动改写需自建 |
| Dify | 开源 BaaS + 可视化编排 | 支持 MCP（HTTP） | BYOK | 工作空间 | 含业务对象表（Datasets） | 工作流节点级 | 手工版本管理 |
| AWS Bedrock Agents | 云托管 Agent + Action Group | OpenAPI / Lambda | 云账户 | 账户/区域 | 云账户内 | CloudWatch + Bedrock Logs | Prompt 模板 + 版本 |
| Azure AI Foundry Agents | 云托管 Agent + Threads | OpenAPI / 内置 Tools / MCP | Azure 订阅 | 项目/资源 | Azure 区域内 | Foundry Tracing + App Insights | Agent 配置版本 + 内置评测 |
| OpenAI Responses API + Agents SDK<br>（取代已 deprecate 的 Assistants API） | SaaS 模型侧托管 + 客户端 SDK | Function Calling / MCP / Hosted Tools | OpenAI 平台 | API key / Project | OpenAI 数据中心 | Responses 调用日志 | 客户端自管 |
| Microsoft Agent Framework | 开源 .NET / Python SDK（替代 AutoGen + SK） | MCP / 自定义 Function | BYOK | SDK 内由宿主决定 | 由宿主进程决定 | OpenTelemetry 自接 | Workflow 级回放，prompt 改写由 Foundry 侧承担 |
| Coze（按形态分） | 低代码 Bot 平台<br>（C 端：coze.com；自托管：Coze Studio OSS） | 插件市场 / 自定义 | SaaS 平台供给为主；OSS 支持 BYOK | 账户 / 工作空间 | SaaS 形态业务对象托管在平台 | Bot 调用日志 | Workflow 版本管理 |
| Microsoft Copilot Studio | 低代码企业 Agent 平台 | Power Platform Connectors / MCP | Microsoft 生态 | 租户 / 环境 | Microsoft 365 数据边界 | Dataverse 审计 + AppInsights | 主题与 Topic 版本管理 |
| **本设计** | 容器化业务无关运行时 | **MCP 单通道** | **BYOK** | **项目级硬隔离（D4）** | **不持有任何业务对象（NG2）** | **四元组可回放（D5）** | Supervisor 离线管线（Goal 08） |

:::accordion
::panel
### 5.1 与 LangChain 生态的关系
本平台 Skill Runtime 直接采用 LangGraph 内核；可观测性可对接 LangSmith 作为可选 telemetry 后端。差异在于本平台规约部署形态与多租户隔离，LangChain 生态本身不规约这两层。

::panel
### 5.2 与 Dify 的差异
Dify 工作空间允许在 Datasets 中持有业务对象，这与本设计的 NG2 直接冲突。Dify 编排面向"低代码搭智能体"；本设计的 skill 仅为不可变 markdown，不提供节点编排画布。

::panel
### 5.3 与云厂商方案（Bedrock / Foundry）的差异
云厂商方案的多租户与计费天然依附于云账户，工具即云函数。本设计通过 LiteLLM + MCP 抽象解耦云厂商绑定，但代价是失去与单一云生态的深度集成（IAM、监控、计费联动）。该取舍在 [06 Trade-Off 02](#tradeoffs) 显式列出。

::panel
### 5.4 与 OpenAI Responses + Agents SDK 的差异
Assistants API 已于 2025 年公告进入 deprecation，迁移目标为 Responses API + Agents SDK。OpenAI 路径把对话历史与状态托管在 OpenAI 侧；本设计把 session 短期记忆放本地 Redis，长期记忆代理回项目侧 MCP，避免业务对象离开自有数据中心。

::panel
### 5.5 与 Microsoft Agent Framework 的关系
Agent Framework 是 SDK 层抽象，不规约部署形态、多租户、telemetry 持久化，可作为本平台 Skill Runtime 的备选内核（与 LangGraph 平行评估）。本平台与之是"运行时容器 vs SDK"层级关系，不冲突。

::panel
### 5.6 与 Coze / Copilot Studio 的差异
这两类方案的共性是"平台即业务宿主"——承担对话历史、知识库、用户身份、渠道接入。优点是上手极快；代价是核心业务数据离开自有数据中心。对企业关键系统而言，"业务对象不离开自有数据库"通常是合规与事务一致性的硬约束，本设计直接为该约束服务。
:::

## #tradeoffs 06 / Trade-Offs :: 关键取舍及其对应代价

每条设计决策都附带代价。此处逐条列出四组核心取舍，避免后续将"已知取舍"误判为"设计缺陷"。

:::comparison
::versus Trade-Off 01
### MCP 单通道 vs 多协议
*选择*：平台 ↔ 项目仅经 MCP，禁止并行 webhook / gRPC。

*收益*：协议表面收敛、SDK 复用、错误模型与工具发现统一。

*代价*：项目侧需维护 MCP server；存量 REST API 需经 MCP 包装层。短期接入工作量增加。

::versus Trade-Off 02
### BYOK vs 平台统管 key
*选择*：模型 API key 由项目自带，平台仅在调用时注入。

*收益*：计费、合规、限流责任边界清晰；项目自由选 provider；平台不承担 token 成本风险。

*代价*：项目需自行注册 OpenAI / Anthropic / Azure 账号、申请配额；接入多一道运营手续。

::versus Trade-Off 03
### Skill markdown vs 可视化编排
*选择*：skill 为纯 markdown 文本，禁模板字符串、条件 include、函数调用。

*收益*：可读、可 diff、可版本化；Supervisor 写补丁的解析面收敛。

*代价*：复杂分支逻辑表达比可视化节点冗长，需依赖多 skill handoff 拆分；某些重分支场景应直接走代码（见 [L3](#limitations)）。

::versus Trade-Off 04
### 项目级硬隔离 vs 共享优化
*选择*：skill 命名空间、Supervisor 演进管线、telemetry 分区、灰度状态全部按项目独立。

*收益*：合规可审计、跨项目无知识泄漏、单项目故障不扩散。

*代价*：同类问题的优秀 skill 不能自动跨项目共享；规模大于一定阈值后会出现"知识不复用"反模式（见 [L4](#limitations)）。

::versus Trade-Off 05
### Supervisor 自演化 vs 全人工迭代
*选择*：内建 Supervisor 离线管线，shadow / canary 双闸下自动起草补丁。

*收益*：常见失败模式可被自动捕获并改写，迭代速度可量化提升。

*代价*：Supervisor 自身有运维成本；不可变 seed + 灰度护栏 + 人审队列三层机制必须严格落地，否则会引入难以归因的行为漂移。Phase 1 默认不启用为合理选择。

::versus Trade-Off 06
### Compact 单镜像 vs Scale-Out
*选择*：默认 Compact 模式（单镜像 + docker-compose），承诺可平滑升级到 Scale-Out。

*收益*：PoC 与早期项目运维成本低，1 命令启动。

*代价*：升级到 Scale-Out 需调整 manifests、引入 Ingress / HPA / StatefulSet；同一镜像通过 PROFILE 启动子模块的承诺必须从第一天保持，否则后期重写代价大。
:::

## #limitations 07 / Limitations :: 五条已知不适用场景

在五类特定场景中，本设计并不优于"直接内嵌 LLM 到业务系统"，团队应在采纳前对照评估。

### L1 · 单租户极简场景

组织内仅 1 个 LLM 项目，且 ≤ 6 个月内不会出现第二个。BYOK + 多租户隔离 + MCP 单通道带来的运维与协议复杂度无法被项目数摊平。

### L2 · 日均调用量低于阈值

日均请求 < 1k 且无 SLA 要求。集中可观测、统一限流、跨项目报表的收益不足以覆盖独立服务的常驻成本（容器 + DB + Redis）。

### L3 · 强分支逻辑场景

业务流程含 > 10 个状态分支且分支条件依赖结构化数据（如规则引擎、审批流）。skill markdown 表达冗长，应保留代码层 orchestration，仅把"自然语言理解节点"委托给平台。

### L4 · 强跨项目知识共享需求

组织对"同类问题的最佳 skill 跨项目自动复用"是核心需求。本设计的项目级硬隔离与该目标直接冲突，需引入额外的"skill 跨项目市场"机制（不在本设计范围）。

### L5 · MCP 协议演进风险敏感场景

MCP 协议在 2024–2026 期间已经历多次破坏性变更。对协议稳定性敏感（如医疗、金融关键路径）的项目，应评估锁定 MCP 版本号、维护协议兼容层的额外成本。

## #verification 08 / Verification :: 八条目标的可观测验证方法

每条目标必须配套机械可执行的验证手段；不能验证的目标会退化为标语。下表给出 Phase 1 可立即落地的检查方法。

| 目标 | 验证方法 | 通过判据 | 失败动作 |
| --- | --- | --- | --- |
| Goal 01 · 业务无关 | CI 阶段静态依赖图扫描 import | 0 项目命名空间命中 | 构建失败 |
| Goal 02 · 多租户硬隔离 | 跨租户读写测试集（schema / cache / config / 灰度 / telemetry） | 5 维度 100% 拒绝 | release 阻断 + 安全告警 |
| Goal 03 · 可回放 | 每日抽样 N=200 trace 执行 replay | 四元组结构化字段一致性 ≥ 99% | SLO 告警 + 字段补齐 PR |
| Goal 04 · 可替换 | e2e 三类 swap 测试：模型 / 工具 / 内核 | 所有 skill 在两个模型 provider 下 eval 通过率 Δ ≤ 5pp | 路由策略回退 + 评测集补充 |
| Goal 05 · 单镜像 | 从空环境 docker compose up 到首次成功响应 | ≤ 5 分钟，0 平台代码改动 | 启动脚本回归 |
| Goal 06 · BYOK | CI secret-scan + 运行时 key 注入路径审计 | 仓库 0 命中；运行时 key 仅来自 project_secrets 表 | 构建失败 + 安全工单 |
| Goal 07 · MCP 单通道 | 网络策略白名单 + 出站连接审计 | 非注册 MCP endpoint 出站 = 0 | 策略阻断 + 事件告警 |
| Goal 08 · 可演进 | Supervisor 路径 schema / API 兼容性测试 | shadow / canary / 人审三态可达 | schema 迁移补丁 |

## #empirical 09 / Empirical Anchor :: IntellyGoal Phase 1 的实证数据

实证范围限定到当前唯一已落地的租户 IntellyGoal。表中数字仅代表 N=1 的早期观测，不构成跨项目结论；详细方法学与上下文见 [智能体平台应用实践（IntellyGoal 项目实践）](../agent-platform-intellygoal/)。

0

第二个 MCP 租户接入时平台代码改动行数（Phase D 验证）

5

从 Phase 0 业务内嵌迁出的 skill 数（goal_create / plan_optimize 等）

9

项目侧 MCP server 暴露的工具数

4

迁移阶段（A 内嵌 → B 抽离 → C 治理 → D 第二租户）

~1.4k

Phase 0 业务侧自建智能体堆栈代码行（迁移后归零）

1

当前样本量。不足以泛化到其他领域；下一组验证待第二租户接入

读法说明

### 这些数字证明了什么 · 没证明什么

*已支持的命题*：在 IntellyGoal 这一案例中，Goal 01 / 02 / 05 的判定方法可机械执行且通过；第二租户接入零平台改动这条承诺在 Phase D 验证为真。

*尚未支持的命题*：八条目标中 Goal 03（可回放一致性）、Goal 04（多 provider eval Δ）、Goal 08（Supervisor 自动演进周期）仍处于度量样本不足阶段；跨项目泛化结论需 N ≥ 3 才能讨论。

## #references 10 / References :: 参考来源

除官方文档外，补充协议规范的具体版本号与同行评审来源。所有 URL 访问日期为 2026-05-04。

- [1] Anthropic. — https://modelcontextprotocol.io/specification/2025-06-18/ | 本设计采用的 MCP 协议版本基线；含 tools/list、tools/call、resources、prompts 四类原语。
- [2] BerriAI. — https://docs.litellm.ai/ | 100+ LLM 统一接口、BYOK 路由、Proxy 模式与回退机制；本平台模型路由层选型依据。
- [3] LangChain. — https://langchain-ai.github.io/langgraph/ | 本平台 Skill Runtime 内核选型依据；状态机与 handoff 模型。
- [4] Microsoft. — https://github.com/microsoft/agent-framework | 备选内核，与 LangGraph 平行评估；Workflow + OpenTelemetry 对接。
- [5] OpenAI. — https://platform.openai.com/docs/guides/responses | 对比项；Assistants API 已于 2025 年公告 deprecation。
- [6] LangGenius. — https://docs.dify.ai/ | 对比项：开源 BaaS + 可视化编排、MCP 集成、工作空间多租户模型。
- [7] AWS. — https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html | 对比项：云托管 Agent、Action Group + Lambda 工具协议。
- [8] Microsoft. — https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview | 对比项：云原生 Agent、Threads、知识与工具集成。
- [9] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/ | 对比项：低代码企业 Agent + Power Platform 连接器。
- [10] ByteDance / Coze. — https://github.com/coze-dev/coze-studio | 对比项 OSS 形态；与 coze.com SaaS 形态在数据驻留模式上存在本质差异。
- [11] Guo, T. et al. — https://arxiv.org/abs/2402.01680 | 多智能体系统综述；含运行时治理与协作模式分类。
- [12] Patil, S. G. et al. — https://arxiv.org/abs/2305.15334 | 工具调用基准与失败模式分析；为本设计 Goal 04 模型 swap 测试方法学提供参考。

---
title: 智能体平台 · IntellyGoal 应用实践
eyebrow: Agent Platform · IntellyGoal Practice
brand: 智能体平台
date: 2026-05-04
strict_i18n: false
strict_density: true
lead: "IntellyGoal 是[本平台](../agent-platform-philosophy/)的首个参考接入项目——一款帮助用户拆解长期目标、跟进进度的目标管理 App。本文记录从\"业务内嵌智能体\"到\"项目作为平台首个 MCP 租户\"的四阶段迁移路径，连同 Skill 设计、MCP 工具开发、长期记忆方案与实战复盘。"
hero_actions:
  - "查看四阶段迁移 | #phases"
  - "查看 MCP 工具实现 | #mcp"
panel_label: 实践目标
panel_title: "用真实业务证伪\"业务无关 + 多租户硬隔离\"两条边界"
panel_desc: 检验架构边界最直接的办法是用真实项目跑通全流程。IntellyGoal 在 Phase A 充当进程内验证场景，Phase B 拆出独立 MCP server 达成业务与平台代码分仓，Phase C 引入 Admin / Eval / Supervisor 补齐治理链路，Phase D 接入第二个租户（健康提醒类项目）验证平台代码零改动。
panel:
  - Phase A · 进程内联调，验证 skill / runtime / tool 抽象
  - Phase B · 拆出 MCP server，平台代码与业务代码分离
  - Phase C · 上线 Admin / Eval / Supervisor 治理体系
  - Phase D · 接入第二租户，证伪多租户隔离
metrics:
  - "Skill 数量 | 5 | intake · consultation · planning · review · escalation 五个角色化 skill 通过 handoff 串联。"
  - "MCP 工具 | 9 | 4 个目标管理 + 3 个进度跟进 + 2 个保留工具（memory.read/write）。"
  - "迁移周期 | 4 阶段 | 从进程内联调到第二租户接入，每阶段交付明确的可验证成果。"
  - "第二租户 | 0 改动 | Phase D 接入新项目时，平台代码零修改即满足上线条件。"
style:
  accent: "#0891b2"
---

## #background 01 / Background :: 项目背景与迁移动机

IntellyGoal 早期把对话智能体直接嵌进 App 后端代码：提示词、状态机、工具调用、token 计数全部混在业务服务里。引入第二条产品线（一款健康提醒应用）时，团队发现重复造轮子的代价已经不可接受。本平台的设计动机直接来自 IntellyGoal 项目的实战痛点。

:::comparison
::versus 迁移前
### 业务内嵌智能体
- 提示模板硬编码在 service 层
- 对话状态用业务侧 Postgres 表持久化，与 Goal 表混合
- OpenAI 调用与回退逻辑由每个 controller 自行处理
- token 用量没有统一报表，按项目散落
- 引入第二应用需要复制粘贴整套智能体代码

::versus 迁移后 { highlight: true }
### 平台 + MCP 租户
- 提示词以 skill markdown 上传至平台 Skill Registry
- 对话状态与 trace 由平台集中持有，业务表只剩业务对象
- 模型路由 / 回退 / token 计数由 Model Router 处理
- 跨项目统一 telemetry 与计费视图
- 新项目接入零平台改动，仅暴露 MCP endpoint
:::

## #phases 02 / Four Phases :: 四阶段渐进迁移

每个阶段交付一个明确的可验证成果，避免"大爆炸式重构"。下一阶段开始前，必须先验证上一阶段成果。

:::comparison
::versus 方案 1 || Option 1
### In-Process 验证
Phase A

把 skill / runtime / tool 抽象在 IntellyGoal 仓库内试跑

- 新增 `agent_platform/` 子模块，承载 LangGraph runtime
- 把现有提示词改写成 skill markdown，仍在同进程加载
- tool_call 走本地函数注册，不引 MCP
- **成果**：验证 skill / handoff / turn budget 抽象在真实业务跑得通

::versus 方案 2 || Option 2
### 抽出独立平台仓库
Phase B

IntellyGoal 退化为 MCP server，平台独立部署

- 把 `agent_platform/` 抽出到独立 git 仓库 + Docker 镜像
- IntellyGoal 仓库新增 `mcp_server/` 暴露领域工具
- App 后端调用方式从函数 import 改为 HTTP /v1/sessions
- **成果**：业务代码与平台代码物理隔离，两边独立发布

::versus 方案 3 || Option 3
### 上 Admin / Eval / Supervisor
Phase C

补齐评测与灰度治理，接入生产流量

- Admin Console 上线，灰度操作可视化
- 构建 frozen eval set（200 个真实 case），跑 nightly 评测
- Supervisor 启用，`auto_promote=false` + `require_review=true`
- **成果**：每次 skill 改动均经评测 + 灰度，迭代速度提升而风险可控

::versus 方案 4 || Option 4
### 第二租户接入
Phase D

健康提醒应用作为第二项目验证多租户隔离

- 新项目仅需走完三步：注册项目 → 上传 skill → 注册 MCP server
- 平台代码零行改动；两个项目 telemetry 完全隔离
- 主动构造交叉访问测试，验证 skill / trace / BYOK 互不可见
- **成果**：边界设计被真实证伪，平台进入"可对外销售"状态
:::

Discipline

### 渐进迁移的纪律

四个阶段不可跳序：跳过 Phase A 直接抽平台仓库，会让 skill 抽象在没有真实业务校准的情况下定型；跳过 Phase C 直接接第二租户，会让多租户隔离的隐患在生产环境暴露。每个阶段交付物必须先在 staging / shadow 验证，再进入下一阶段。

## #skills 03 / Skill Inventory :: 5 个 Skill 与 handoff 拓扑

IntellyGoal 把对话过程拆为 5 个角色化 skill，通过 frontmatter 中的 `handoff_to` 串联，避免单一 skill 膨胀。

| Skill | 角色 | 退出条件 | handoff_to |
| --- | --- | --- | --- |
| intake | 识别用户意图、收集基本背景 | 已识别用户主诉 + 基础背景齐全 | consultation, escalation |
| consultation | 深入理解目标动机与约束 | 动机清晰、可量化 + 用户准备好规划 | planning, escalation |
| planning | 拆解里程碑与节奏，调用 commit_goal_plan | 计划已落库 + 用户确认 | review |
| review | 定期回顾进度、调整计划 | 当期复盘结束 + 用户无新需求 | (end) |
| escalation | 识别情绪困境或超出能力范围，引导人审 | 情绪稳定 / 已生成人审工单 | (end) |

Skill markdown 样例

### planning.md（裁剪片段）

```
---
name: planning
version: 1.4.0
seed: true
turn_budget: 8
tools_allowed:
  - list_recent_goals
  - commit_goal_plan
  - memory.read
  - memory.write
handoff_to:
  - review
---

## 角色
你是用户的目标规划伙伴。在 consultation 已经摸清用户动机后，你的任务是把目标
拆为 3-5 个里程碑，与用户对齐节奏与提醒频率，然后调用 `commit_goal_plan` 落库。

## 退出条件
- 计划已落库（commit_goal_plan 返回 status=committed）
- 用户在最后一条消息确认计划合理

## 行为边界
- 不涉及健康 / 心理诊断；如出现，立即 handoff 到 escalation
- 不擅自承诺平台外的能力（如发邮件、设手机闹钟）
- 节奏建议优先采用用户偏好（memory.read scope=user 读 preferred_pace）

## 条件段落
- 如果用户表达犹豫，引导其量化"完成后的最具体收益"再继续
- 如果计划落库失败，复述错误并询问是否调整
```

## #mcp 04 / MCP Tool :: MCP 工具开发样例 · commit_goal_plan

领域工具一律由 IntellyGoal 侧 MCP server 承载，平台只负责发起调用；核心逻辑可直接用 Python (FastMCP) 编写。

```
from mcp.server.fastmcp import FastMCP
from intellygoal.db import goals_repo
from intellygoal.auth import resolve_user

mcp = FastMCP("intellygoal-core")

@mcp.tool()
def commit_goal_plan(
    goal_text: str,
    milestones: list[dict],
    pace: str = "weekly",
) -> dict:
    """Commit a planned goal with milestones and reminders.

    All side effects happen in IntellyGoal's database, never in the platform.
    """
    user = resolve_user()  # MCP context provides project_id + user_id
    if len(goal_text) < 4:
        raise ValueError("goal_text too short")
    for m in milestones:
        if m["due"] < today():
            raise ValueError(f"milestone due in past: {m}")

    goal = goals_repo.create(
        user_id=user.id,
        text=goal_text,
        milestones=milestones,
        pace=pace,
    )
    return { "goal_id": goal.id, "status": "committed" }

@mcp.tool()
def list_recent_goals(limit: int = 5) -> list[dict]:
    user = resolve_user()
    return [g.to_dict() for g in goals_repo.recent(user.id, limit)]

# memory.read / memory.write 是 MCP 协议的保留工具名
@mcp.tool(name="memory.read")
def memory_read(scope: str, key: str) -> dict | None:
    return memory_repo.get(scope, key)

@mcp.tool(name="memory.write")
def memory_write(scope: str, key: str, value) -> dict:
    memory_repo.upsert(scope, key, value)
    return { "ok": True }

if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=7100)
```

边界检查

### 为什么 commit_goal_plan 不在平台

它带有"创建业务对象"的副作用，必须由业务系统持有事务边界。一旦平台代码直接读写 IntellyGoal 数据库，就会同时打破三条架构红线——代管业务工具逻辑、侵入业务数据存储、越权干预业务策略（例如 pace 默认值的业务语义）。MCP 抽象让平台只需发出"工具调用请求"，业务侧保留完整自决权。

## #memory 05 / Long-term Memory :: 长期记忆 · goals.memorandum 模式

IntellyGoal 用一个名为 `goals.memorandum` 的业务表承载用户长期偏好（节奏、敏感话题、过往承诺）。该表完全由 IntellyGoal 自管，平台通过 `memory.read / memory.write` 透明读写。

:::accordion
::panel { open: true }
### 5.1 表结构与 scope 命名
```
create table goals_memorandum (
  scope          text   not null,    -- e.g. user:u_123, goal:g_456
  key            text   not null,    -- e.g. preferred_pace, sensitive_topics
  value          jsonb  not null,
  updated_at     timestamptz not null default now(),
  primary key (scope, key)
);
```

scope 命名约定：`user:<user_id>` 用于跨目标的用户偏好；`goal:<goal_id>` 用于目标级备忘；`session:<session_id>` 用于一次会话内的临时备忘（可选）。

::panel
### 5.2 Skill 中的使用模式
Skill 在每轮开始或退出条件检查前主动 `memory.read` 拉取必要偏好；在用户给出新承诺时 `memory.write` 持久化。两类调用均经 MCP 透传，无平台缓存——保证业务对象数据离开平台。

```
// 典型对话片段
tool_call: memory.read { scope: "user:u_123", key: "preferred_pace" }
tool_result: { value: "weekly" }

tool_call: memory.write { scope: "user:u_123", key: "preferred_pace", value: "biweekly" }
tool_result: { ok: true }
```

::panel
### 5.3 隐私与保留期
因数据全部在 IntellyGoal 自有 Postgres，其保留期、加密、删除请求处理完全由 IntellyGoal 合规策略决定。平台 telemetry 中只保留经 PII 脱敏的工具调用元数据（scope / key / 调用时间），不留 value 明文。
:::

## #lessons 06 / Lessons :: 经验教训

四阶段迁移中累积的踩坑与反思。下列教训在后续接入新租户时被作为 checklist 复用。

:::insight-grid { cols: 3 }
::card L1
### Skill 拆得太细反而增加 handoff 噪音
Phase A 早期把 consultation 拆成 3 个子 skill，handoff 频繁让对话节奏变碎。最终保留单一 consultation，里程碑与节奏由 planning 接手。规则：handoff 应对应清晰的"角色变更"，不是单纯的"步骤推进"。

::card L2
### turn_budget 必须从第一天设
未设 budget 的 skill 在长对话中会反复追问用户补充细节，导致 token 消耗暴涨。强制每个 skill 上线即配置 budget，到达轮数上限立即收敛。

::card L3
### frozen eval set 是治理的最大杠杆
200 个真实 case 的评测集让每次 skill 改动有客观分数。Supervisor 起草补丁的接受率从 ~40% 提升到 ~75%，因为补丁前先要过 eval。

::card L4
### BYOK 校验在 Phase B 漏掉
Phase B 上线初期曾允许用平台默认 key 兜底，结果单项目配额超限拖垮了全部租户。修复策略：项目未配置 BYOK 时直接拒绝请求，彻底取消"友好降级"。BYOK 是合规硬边界，不容妥协。

::card L5
### 第二租户暴露的命名冲突
Phase D 接入健康提醒应用时，发现两边都叫 `review` skill，但语义完全不同。平台命名空间已按 project_id 隔离，没冲突；但 Admin Console 的列表页 UI 没显示 project_id 前缀，造成运维误判。修复：所有 skill 名称在管控面强制带项目前缀展示。

::card L6
### Supervisor auto_promote 默认关
初期试图开启 auto_promote 加速迭代，结果一次模型偶发 hallucination 导致连续 3 个补丁起草偏离原意——若入库会造成行为漂移。改回 require_review 后稳定。规则：自动入库应是项目主动选择，不是平台默认。
:::

## #references 07 / References :: 参考来源

- [1] Anthropic. — https://github.com/modelcontextprotocol/python-sdk | commit_goal_plan 代码样例所用的 MCP server 框架。
- [2] 本系列文档
- [3] 原始设计文档

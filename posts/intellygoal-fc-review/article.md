---
title: Pydantic-as-Schema 的优雅落地，与 5 个待修补的工程缝隙
eyebrow: Code Review · IntellyGoal-by-W · backend/src/agent
brand: "FC & Agentic"
date: 2026-04-30
strict_i18n: false
strict_density: true
lead: "IntellyGoal 是一个 AI 目标管理 App，后端用 FastAPI + SQLAlchemy + OpenAI SDK 实现了一个 13 工具的 Function Calling Agent。本文按照《Function Calling 工程化提效》的方法论，对 `backend/src/agent/` 三个核心文件（registry / runtime / tools，共 1 049 行）逐项 review，给出 ABCD 评级、可执行的改进 patch 和优先级排序。"
hero_actions:
  - "查看问题清单 | #issues"
  - "改进 Roadmap | #recommendations"
panel_label: 综合评级
panel_title: B+ ／ 单用户原型已达生产线下限，多用户与多模型场景需先补 5 处工程缝隙
panel:
  - 架构分层 A：registry / runtime / tools / service 四层职责清晰
  - Schema 工程 A-：Pydantic 单一来源，但缺 strict mode
  - 错误处理 B+：tool 错误回灌 LLM，但 prompt 强约束未代码化
  - 会话与成本 C+：full-replay 无截断，长对话必爆 token
  - 可观测性 C：仅 print 级日志，无 metrics / tracing
metrics:
  - "代码量 | 1 049 行 | registry 133 + runtime 243 + tools 487 + ai_service 186（FC 相关部分）"
  - "工具数 | 13 个 | 读 6 / 写 4 / 复合 3，处于\"无需路由\"的舒适区"
  - "最大轮次 | 6 轮 | 含重复检测 + 强制总结兜底，避免无限循环"
  - "关键风险 | 5 处 | strict / 路由 / 历史截断 / 业务前置约束 / 可观测性"
style:
  accent: "#6366f1"
---

## #overview 01 / 项目概览 :: IntellyGoal 是什么、Agent 为何而生

用一段话先把背景交代清楚，避免后文 review 失去坐标系。

:::insight-grid { cols: 2 }
::card 01
### 产品定位
用户用自然语言写下目标（如"4 个月减重 15kg"），AI 自动拆 KPI、排日任务、收反馈、给进度报告。后端是 FastAPI + Postgres + OpenAI 兼容 LLM。

::card 02
### Agent 模块的边界
`backend/src/agent/` 只负责"AI 助手对话"——用户在 App 内向小助手提问/下达指令，Agent 通过 13 个工具读写目标/KPI/任务/反馈数据。**非** goal 解析或 KPI 推荐主流程（那些走独立的 `AIService`）。

::card 03
### 三个文件的分工
`registry.py`：装饰器 + 工具注册表，把 Pydantic 模型转 OpenAI tools schema；`runtime.py`：think→tool→think 循环，含重复检测、强制总结；`tools.py`：13 个具体工具的薄包装，全部委托给已有 service。

::card 04
### review 的对照系
本文以《Function Calling 工程化提效》中提出的五维度（Schema 工程 / 工具路由 / 上下文管理 / 错误恢复 / 架构模式）为对照系，逐项给评级和改进建议。
:::

## #architecture 02 / 架构解剖 :: 请求是如何从 HTTP 流到 LLM 再回来的

把数据流摊开看，比对每一层的职责是否单一、契约是否对齐。

:::flow
1. **HTTP 入口 — `controllers/agent_router.py`** — 01；HTTP 入口 — `controllers/agent_router.py` `POST /api/v1/agent/chat` 接收 `{session_id?, page_context?, message}`，`20/minute` 限流，鉴权后解析或新建 `AgentSession`，然后 `runtime.run(...)`。控制器很薄，符合预期。
2. **Runtime 编排 — `runtime.py`** — 02；Runtime 编排 — `runtime.py` 1) 持久化 user 消息；2) 从 `page_context` 用正则抠 `client_date`；3) 进入最多 6 轮的 think→tool→think 循环；4) 检测 (name,args) 重复立即跳出；5) 强制单次"无 tools"总结作为兜底。
3. **Schema 生成 — `registry.openai_tools()`** — 03；Schema 生成 — `registry.openai_tools()` 对每个注册工具，调用 Pydantic 的 `spec.schema.model_json_schema()` 直接得到 JSON Schema，组装成 OpenAI `tools` 数组。**单一来源**原则贯彻得很好——人不需要手写两份 schema。
4. **LLM 调用 — `ai_service._call_llm_raw_async`** — 04；LLM 调用 — `ai_service._call_llm_raw_async` 用 `asyncio.to_thread` 包同步 OpenAI SDK；`tool_choice` 默认 `"auto"`；超时 120 s 适配本地 LLM；APITimeoutError / APIError 各重试 1 次后映射成统一 ApiError。
5. **Tool 派发 — `registry.dispatch`** — 05；Tool 派发 — `registry.dispatch` JSON 解析 → Pydantic 校验 → 调用 async 工具 → 异常一律捕获并返回 `{"error": "..."}` 给 LLM 继续推理。**不向上抛**——这是把错误信息回灌模型自我纠正的关键设计。
6. **持久化 — `models/agent.py`** — 06；持久化 — `models/agent.py` 每一轮 user / assistant / tool 消息都按 `idx` 写入 `agent_messages`，下一轮 `_replay_for_llm` 全量回放。可审计、可断点续聊，但代价是历史无截断（详见 04 节）。
:::

## #strengths 03 / 亮点（A 级实践） :: 四个值得抄到其他项目的设计决策

这些不是锦上添花，而是把 Agent 从"能跑"推到"能稳"的关键决策。

:::accordion
::panel { open: true }
### 1Pydantic-as-Schema：单一来源消除两份 schema 漂移
问题背景

很多项目里，工具的 OpenAI JSON Schema 和 Python 入参校验是两套独立写的——schema 改了忘了改校验，校验改了忘了改 schema，参数漂移是 FC 项目最常见的脏活。

本项目做法

每个工具用 `schema=` 显式声明一个 `BaseModel`，`registry.openai_tools()` 直接调用 `model_json_schema()` 喂给 OpenAI；`dispatch()` 又用同一个模型 `model_validate()` 校验入参。schema 漂移在编译期就被消灭。

推荐复用

这是几乎所有 Python FC 项目的最佳实践，建议作为新工具的强制脚手架。

::panel
### 2错误回灌而非抛出：让 LLM 自己读错误自纠
关键代码

```
try:
    result = await spec.func(args, ctx)
except Exception as e:
    _log.error("tool %s raised %s ...", name, ...)
    return {"error": f"{type(e).__name__}: {e}"}
```

为什么对

抛异常会终结整个对话；返回 `{"error":...}` 把错误作为 tool 消息回灌给 LLM，下一轮模型有机会换参数重试或转告用户。这是 OpenAI 官方指南里多次强调的模式（参见上一篇文章 04 节）。

细节加分

错误同时落 `_log.error` 含 `traceback`，开发可观测；返回给 LLM 的 message 只含 type+msg，不泄露 stack——分级处理得当。

::panel
### 3循环检测 + 强制总结：杜绝无限工具调用
两道闸

第一道：`max_rounds=6` 硬上限；第二道：`seen_tool_keys` 记录已发生的 (name,args_json)，命中重复立即跳出循环并强制总结。

兜底总结

budget 耗尽后再追加一条 system 消息"基于已有结果直接回答，不要再调用工具"，并以 `tools=None` 二次调用——保证用户永远拿到一个文本回复，而不是空响应或转圈。

改进点（在 04 节展开）

跳出后又"白白浪费"了一次 LLM 调用做总结；可以在检测到重复时直接复用已有上下文做局部 collapse，详见 issue #4。

::panel
### 4每个工具 in-tool ownership check：纵深防御
问题背景

很多 Agent 把鉴权放在 controller，工具内默认"既然能调到就有权限"。但 Agent 工具会被 LLM 任意拼装参数，**必须**在工具边界二次校验。

本项目做法

`_owned_goal()` 帮手 + 每个写工具内 `SELECT ... JOIN Goal WHERE Goal.user_id = ctx.user.id`。即使 LLM 幻觉出别人的 goal_id，数据库也不会返回。

安全评级

FC 安全维度 A 级。建议把这个模式抽成 `@requires_owned_goal` 装饰器，避免每个写工具重复 4 行 SQL。
:::

## #issues 04 / 待修补的 5 处工程缝隙 :: 从原型走向多租户生产前必须修的事

按"修复成本 × 暴露概率"排序，**Issue #1 与 #2 强烈建议在引入第二个真实用户前完成**。

:::accordion
::panel { open: true }
### 1Issue #1：未启用 Strict Mode，schema 偏离风险常驻
现状

`registry.openai_tools()` 生成的 tools 数组里没有 `"strict": true`，`function.parameters` 也没有 `additionalProperties: false`。当模型用本地 OSS（gpt-oss、Qwen 等）时，幻觉字段、类型错位（`"true"` vs `true`、`"2026-04-30"` 写成 `"明天"`）会直接进入 `model_validate` 抛 ValidationError。

代码对比

**现状（无 strict）**

```
schema = spec.schema.model_json_schema()
schema.setdefault("type", "object")
schema.setdefault("properties", {})
out.append({
  "type": "function",
  "function": {
    "name": spec.name,
    "description": spec.description,
    "parameters": schema,
  },
})
```

**建议（OpenAI 官方 strict）**

```
schema = spec.schema.model_json_schema()
schema["additionalProperties"] = False
# 强制把所有字段进 required
schema["required"] = list(schema.get("properties", {}).keys())
out.append({
  "type": "function",
  "function": {
    "name": spec.name,
    "description": spec.description,
    "parameters": schema,
    "strict": True,   # ← OpenAI / vLLM 都支持
  },
})
```

注意事项

strict 要求所有字段 required，因此可选字段需改用 `Field(None, json_schema_extra={"nullable": True})` 或在 schema 后处理时把 Optional 字段加进 required 但 type 保留 `["string","null"]`。如果用本地模型不支持 strict，需要在 `registry` 里加 feature flag。

优先级

P0 改动小、收益大，是引入更多模型前的护栏。

::panel
### 2Issue #2：业务前置约束被写在 prompt 里，模型一不听就脏写
现状

SYSTEM_PROMPT 第 7 条规定："写入 notes/actual_value 前必须先调用 get_task_feedback 读已有内容；写入时必须传入『已有内容 + 用户新输入』合并后的完整文本"。这是**典型的约束写在 prompt**——模型 90% 时听话，10% 直接 `submit_feedback(notes="新文本")` 把历史覆盖掉。

建议方案

把"先读后合并"从 prompt 约束改为 **service 层强约束**：`FeedbackService.submit_feedback` 内部先读旧 feedback，按 strategy（`"replace" | "append" | "merge"`）合并后再写。工具入参增加 `merge_strategy` 字段，由 LLM 决定语义意图，但合并动作交给后端代码。

代码示例

```
class _SubmitFeedbackArgs(BaseModel):
    task_id: str
    completed: bool
    actual_value: Optional[float] = None
    notes_delta: Optional[str] = None  # 用户本轮新增内容
    merge_strategy: Literal["append","replace","merge_meal"] = "append"

# service 内
old = await self.get_feedback(task_id)
final_notes = self._merge(old.notes, args.notes_delta, args.merge_strategy)
await self._write(task_id, notes=final_notes, ...)
```

优先级

P0 数据正确性问题，覆盖丢失对用户体验是灾难性的。

::panel
### 3Issue #3：full-history replay 无截断，长会话必爆 token
现状

`_replay_for_llm` 每次都 `SELECT * FROM agent_messages WHERE session_id=? ORDER BY idx`，把整段历史拼回 messages。在一个跑了几天的 session 里，`list_today_tasks` 的 tool 返回可能 10 KB+，6 轮调用 + 多日累积，分分钟把 8K context 撑爆。

三层截断方案

1. **分会话边界**：超过 N 小时未活动自动开新 session（前端切到新 conversation 即可）。
2. **tool 结果摘要化**：tool 返回大于阈值（如 2 KB）时落 DB 全量、replay 时截断为前 N 项 + "[... omitted M items]"。
3. **前缀 summary**：当 messages 估算 token > 70% context window，把最早 K 轮压缩成一条 system summary。

优先级

P1 单用户原型不痛，但接入第二个用户或单用户用满一周必爆。

::panel
### 4Issue #4：循环检测靠字符串相等，被绕一次就白干
现状

`seen_tool_keys` 用 `f"{name}|{arguments}"` 做 key，且 `arguments` 是模型原始字符串。如果模型把 `{"goal_id":"a"}` 第二次写成 `{ "goal_id":"a" }`（多了空格），重复检测就失效。另外即使检测到重复，也是**先 dispatch 再 break**——第二次相同调用还是被执行了。

建议改法

```
# 1) 规范化 key：先 json.loads 再 sort_keys 再 dumps
try:
    norm = json.dumps(json.loads(tc["arguments"] or "{}"),
                      sort_keys=True, ensure_ascii=False)
except json.JSONDecodeError:
    norm = tc["arguments"]
key = f"{tc['name']}|{norm}"

# 2) 重复时直接复用已有 trace 的 result，跳过 dispatch
if key in seen_tool_keys:
    cached = next(t for t in traces if ...)  # 同 key 的最近结果
    result = cached.result
else:
    result = await registry.dispatch(...)
```

优先级

P1 不会出错，但在重负载场景下省钱省延迟。

::panel
### 5Issue #5：可观测性近乎为零，线上问题无法定位
现状

除了 `_log.error` 在工具异常时打 traceback，没有任何 metrics：tool 调用次数 / 成功率 / p50-p99 延迟 / token usage / 平均 round 数 / 强制总结触发率，统统看不到。一旦"用户说 AI 又乱说话了"，开发只能去翻 `agent_messages` 表硬看 SQL。

最小可行方案

1. 在 `AgentRuntime.run` 入口/出口埋 `time.perf_counter()`，输出 INFO 级 `agent_run session=... rounds=N tools=[...] elapsed_ms=...`。
2. 在 `registry.dispatch` 包一层 `(name, ok, ms)` 计数，落 Prometheus 或写 `agent_metrics` 小表。
3. 把 OpenAI `resp.usage`（`prompt_tokens / completion_tokens`）也存到 `AgentMessage.metadata`，方便后续 cost dashboard。

优先级

P1 上线前必备，线上后才补成本极高。
:::

## #grading 05 / 评级矩阵 :: 按五维度对照《FC 工程化提效》打分

评级口径：A 可作为最佳实践抄；B 满足生产门槛；C 原型可用但生产前需补；D 有正确性或安全风险。

| 维度 | 评级 | 说明 | 对应改进项 |
| --- | --- | --- | --- |
| Schema 工程 | A- | Pydantic 单一来源；description 中文清晰；**缺 strict mode + additionalProperties:false**。 | Issue #1 |
| 工具路由 | A | 13 个工具处于"无需路由"舒适区；`tool_choice="auto"` 直接用全集合理。如果未来 > 30 工具，需引入分层。 | — |
| 错误恢复 | B+ | tool 错误回灌 LLM 是教科书写法；**但前置约束（先读后写）写在 prompt 里靠不住**。 | Issue #2 |
| 上下文 / 成本 | C+ | 会话持久化 + 全量回放对调试友好；**但缺历史截断与 tool 结果摘要化**，长会话必爆 token。 | Issue #3 |
| 架构模式 | A | registry / runtime / tools / service 四层职责单一；纵深鉴权到位；循环检测 + 强制总结优雅。 | Issue #4 (优化) |
| 安全 | A | 每个工具内 join Goal.user_id 二次校验；ApiError 不泄露 stack；`_to_jsonable` 在 SQLAlchemy fallback 时*会*暴露所有列，需注意未来不要把敏感模型直接 return。 | — |
| 可观测性 | C | 仅 ERROR 级日志；无 metrics / tracing / cost dashboard。 | Issue #5 |
| 多模型适配 | B | 统一走 OpenAI 兼容协议（OpenAI / vLLM / Ollama 都能跑），适配面广；`temperature=0.3` 对 FC 偏高，建议 0–0.1。 | Issue #1 配套 |

## #recommendations 06 / 改进 Roadmap :: 按优先级排好的可执行清单

每条都是周级可完成的小改动，建议按 P0 → P1 → P2 顺序推进。

:::comparison
::versus 方案 1 || Option 1
### P0 · 本周
1. 1启用 Strict Schema改 `registry.openai_tools()`：所有字段 required + `additionalProperties:false` + `strict:true`；可选字段改 nullable union。Issue #1。
2. 2把"先读后合并"挪进 service`FeedbackService.submit_feedback` 内部读旧值并按 strategy 合并；工具入参改 `notes_delta + merge_strategy`。Issue #2。
3. 3FC 调用降温度`_call_llm_raw_sync` 默认 `temperature=0`，让生成 schema 更稳定；自由文本回复可在 forced summary 时调回 0.3。

::versus 方案 2 || Option 2
### P1 · 本月
1. 4历史截断三件套session 自动按 N 小时切；tool 结果 >2KB 截断 replay；超 70% context 触发 prefix summary。Issue #3。
2. 5循环检测规范化arguments JSON 解析后 sort_keys 再 hash；命中重复直接复用 trace、跳过 dispatch。Issue #4。
3. 6最小 metrics埋 tool 调用 (name, ok, ms)、round 数、token usage；落 `agent_metrics` 表或推 Prometheus。Issue #5。

::versus 方案 3 || Option 3
### P2 · 季度
1. 7page_context 结构化改成 `{"goal_id": "...", "client_date": "..."}` JSON，砍掉 runtime 里那段正则；schema 校验用 Pydantic。
2. 8parse_goal / clarify 也改 FC当前用 JSON-mode + 手写 fence-strip，脆弱；这两条同样可以表达成 tool schema，让模型走 strict FC 出结构化数据。
3. 9Eval 闭环定义 20–50 条典型对话作为回归集，每次模型/prompt 改动跑一遍，记录 tool 调用准确率、强制总结触发率、平均 round 数。
:::

## #conclusion 07 / 一句话总结 :: 把 prompt 约束代码化、把成本可观测化，这套 Agent 就能上线

:::insight-grid { cols: 2 }
::card 01
### 给作者
架构选型已经踩在了 Python FC 项目的最佳实践上（Pydantic schema + 错误回灌 + 纵深鉴权 + 循环检测）。下一步只需把"靠 prompt 自律"的两条约束（先读后写、字段填全）变成"代码强制"，再补上历史截断与 metrics，就达到了多用户 SaaS 的工程门槛。

::card 02
### 给读者
这是一个干净的"参考实现"：8 成代码值得直接抄，2 成代码暴露了 prompt-driven Agent 的常见缝隙。把本文的 5 个 issue 当作自查清单，就能在自家项目里少踩 80% 的同类坑。

::card 03
### 给 Agent 框架设计者
本项目的实践印证了《FC 工程化提效》的核心论点：**同一个模型下，工程做到位能把成功率提一个数量级**。Schema 工程（strict）、错误回灌、循环兜底、纵深鉴权——这四件事远比换更大的模型更值得投资。

::card 04
### 相关阅读
[Function Calling 工程化提效](../fc-engineering-optimization/)（本文方法论来源）｜[Function Calling 最佳实践](../function-calling-best-practices/)｜[企业 Agent 架构](../enterprise-agent-architecture/)。
:::

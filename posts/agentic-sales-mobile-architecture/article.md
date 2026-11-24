---
title: "让一句话可靠地变成正确的工具调用 || Turning One Sentence Reliably into the Correct Tool Calls"
eyebrow: "运行时架构 · 端到端操作流 || Runtime Architecture · End-to-End Operation Flow"
brand: Agentic Sales Mobile
date: 2026-07-04
strict_i18n: false
strict_density: true
lead: "本文描述应用的运行时架构：一条把销售口语翻译成工具调用的端到端操作流——理解一句话说了什么、计划该调哪些工具及其顺序、带人工确认与接地地执行、再把每次调用落到其后端（CRM 写操作落 Dataverse，读操作返回记录与答案）。 || This document describes the app's runtime architecture: an end-to-end operation flow that translates a rep's speech into tool calls — understanding what a sentence says, planning which tools to call and in what order, executing with human confirmation and grounding, and landing each call on its backend (CRM writes go to Dataverse; reads return records and answers)."
hero_actions:
  - "看端到端操作流 || See the Operation Flow | #dataflow"
  - "从业务需求讲起 || Start with the Requirements | #requirements"
panel_label: "一句话架构 || In One Sentence"
panel_title: "把一句话翻译成经过校验的工具调用——理解、计划、执行、落地四段。 || Turning one sentence into validated tool calls — understand, plan, execute, land."
panel_desc: "先理解——把一句话拆成多个独立意图；再计划——把每个意图映射到一个技能函数（工具）并建立依赖图。这两次 LLM 调用（代码中称 Frame 与 Orchestrator）都用自由文本输出 + 客户端 Zod 校验，而非依赖平台的结构化 JSON 模式。 || First understand — split one sentence into independent intents; then plan — map each intent to a skill function (a tool) and build a dependency graph. These two LLM calls (named Frame and Orchestrator in code) emit free text validated client-side by Zod, rather than the platform's structured-JSON mode."
panel:
  - "理解 — 把一句话拆成多意图 || Understand — split into intents"
  - "计划 — 意图映射到工具、定序 || Plan — map intents to tools, order them"
  - "执行 — 带确认与接地地调用 || Execute — call with confirmation and grounding"
  - "落地 — 校验并适配到后端 || Land — validate and adapt to the backend"
style:
  accent: "#fb923c"
---

## #requirements 01 / Business Need and Architectural Requirements :: 把销售口述可靠地变成 CRM 里的记录与判断 || Reliably Turning a Rep's Dictation into CRM Records and Judgments

现场销售在两次拜访之间用口语与系统交互：一句话既要落成 CRM 记录，也要问出对自己业务盘子的判断。一句自然表达往往裹挟多件有依赖的事，而销售不会按系统的字段边界说话。要把这种输入稳定地变成正确的记录与可信的回答，架构必须同时满足四条属性。 || A field rep interacts by voice between visits: one sentence must both become CRM records and surface judgments about their book of business. A natural utterance often bundles several dependent actions, and reps do not speak in the system's field boundaries. To turn such input reliably into correct records and trustworthy answers, the architecture must satisfy four properties at once.

:::callout { title: "关键洞察 || Key Insight" }
「我刚拜访了协和医院的张主任，他们对新款监护仪很感兴趣，建一个商机，金额大概 150 万，下周三再约他复盘。」——一句代表性的销售口述，下面四条属性都要从它这样的输入里成立。 || I just visited Director Zhang at Union Hospital — they are keen on the new monitor. Create an opportunity, around 1.5M, and book a review with him next Wednesday. — a representative rep utterance; each property below must hold for inputs like it.
:::

:::insight-grid { cols: 2 }
::card 01
### 可拆分与定序 || Decomposable and Ordered
上句含三件事：记一次已发生的拜访、建一个新商机、约一个未来的会议——对象、时态、动作各不同，且商机与会议要挂在先解析出的客户与联系人下。架构必须先拆分、再定依赖顺序，才能动手。 || That sentence holds three things: log a past visit, create an opportunity, book a future meeting — different objects, tenses and actions, and the opportunity and meeting must hang off an account and contact resolved first. The architecture must split, then order by dependency, before acting.

::card 02
### 写前可核对 || Verifiable Before Write
每一次写库（建商机、记活动、改字段）都要在触及 Dataverse 之前由人确认。销售对着系统说话不等于授权入库，模型输出更不能静默落库——写操作必须先呈现为可核对的草稿。 || Every write (create opportunity, log activity, edit a field) must be human-confirmed before it touches Dataverse. Speaking to the system is not authorization to persist, and model output must never write silently — a write must first appear as a verifiable draft.

::card 03
### 读必接地 || Reads Must Be Grounded
销售也要问「这周该盯哪些商机」「这个客户还能不能救」。这类查询与分析的答案必须严格来自真实记录，不允许模型编造名称、金额或趋势——读路径要接地，判断才可信。 || Reps also ask 'which deals should I chase this week' or 'can this account still be saved'. Answers to such queries and analysis must come strictly from real records; the model may not invent a name, amount or trend — the read path must be grounded for its judgments to be trusted.

::card 04
### 落库正确 || Correct Persistence
「下周三」要换算成具体日期、「150 万」要落成数字金额、「协和医院」要匹配到 Dataverse 里真实存在的客户记录。任一步错就是脏数据，而底层模型不可信、有不确定性，架构要在其之上保证正确。 || 'Next Wednesday' must resolve to a date, '1.5M' to a numeric amount, 'Union Hospital' to a real Dataverse account. Any slip is dirty data — and the underlying model is untrusted and nondeterministic, so the architecture must guarantee correctness on top of it.
:::

## #dataflow 02 / End-to-End Operation Flow :: 从一句话到被执行的工具调用的完整路径 || The Full Path from One Sentence to Executed Tool Calls

一句话严格自上而下穿过四个责任层变成工具调用：表现层接收、认知层理解与计划、执行层执行、数据层落地，不允许跨层直调；写操作落 Dataverse，读操作返回记录与答案。下面的时序图是当前代码的真实主路径，起点是 CopilotProvider 的 sendMessage。 || One sentence flows strictly top-down through four responsibility layers to become tool calls — presentation receives, cognition understands and plans, execution executes, data lands — with no cross-layer shortcuts; writes go to Dataverse, reads return records and answers. The sequence below is the real main path in the current code, starting at CopilotProvider's sendMessage.

表现层 || Presentation

### Pages + CopilotProvider

页面采集输入并设置页面上下文；CopilotProvider 的 sendMessage 是对话主入口，负责澄清门控、消息持久化、查询失效与队列协调。 || Pages capture input and set page context; CopilotProvider's sendMessage is the conversational entry point, owning clarification gating, message persistence, query invalidation and queue coordination.

contexts/copilot-context.tsx · pages/*-detail.tsx

认知层 || Cognition

### 理解 + 计划 || Understand + Plan

理解把一句话拆成多意图数组；计划把每个意图映射到技能函数（工具）、填充参数、建立 DAG 依赖。两段共同产出一个 PipelineResult。 || Understanding splits the sentence into an intent array; planning maps each intent to a skill function (a tool), fills arguments and builds the DAG dependencies. Together they produce a PipelineResult.

lib/frame.ts · lib/orchestrator.ts · lib/dag-schema.ts

执行层 || Execution

### 意图队列 + 函数执行 || Intent Queue + Function Execution

意图队列把多意图串成一条带游标的状态机；运行时逐个执行，draft/update 渲染确认卡片，query 立即返回结果，Analyze/Report 读意图在查询后追加接地分析、必要时再补一次查询并可生成可下钻图表。函数执行器按注册表分派到对应 handler。 || The intent queue chains intents into a cursor-driven state machine; the runtime executes them one by one — draft/update render a confirm card, query returns results immediately, and Analyze/Report reads append a grounded analysis after the query, fetch one more query when needed, and can emit a drill-down chart. The executor dispatches to handlers via the registry.

lib/intent-queue.ts · lib/intent-queue-runtime.ts · lib/function-executor.ts · lib/functions/*-handlers.ts · lib/chart-aggregation.ts

数据层 || Data

### 服务适配器 + Dataverse || Service Adapters + Dataverse

每张表一个适配器，用 toDv / fromDv + FIELD_MAP 在应用模型与 Dataverse 列名之间转换，再经 Power Apps SDK 读写 Dataverse。 || One adapter per table converts between app model and Dataverse column names via toDv / fromDv + FIELD_MAP, then reads/writes Dataverse through the Power Apps SDK.

generated/services/*-service.ts · _adapter-utils.ts

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户 / UI
    participant C as CopilotProvider
sendMessage
    participant F as 理解
意图分类
    participant O as 计划
DAG 规划
    participant Q as 意图队列
运行时
    participant X as 函数执行器
+ Handlers
    participant D as 适配器
→ Dataverse
    U->>C: 输入一句话
    C->>C: 澄清门控检查
    C->>F: 拆分意图
    F-->>C: intents[] + 依赖
    C->>O: 规划每个意图
    O-->>C: PipelineResult (DAG)
    C->>Q: 构建意图队列
    loop 逐个意图
        Q->>X: 执行 / 解析引用
        alt draft / update
            X-->>U: 渲染确认卡片
            U->>X: Save 确认
        else query
            X-->>U: 直接返回结果
        end
        X->>D: 写入 / 读取
        D-->>X: 落库结果
    end
    Q-->>C: 失效相关查询
    C-->>U: 刷新页面 + 回执
              
```

## #frame 03 / The Understanding Stage :: 把一句话切成多个独立意图 || Splitting One Sentence into Independent Intents

理解阶段（代码中称 Frame）是流水线的第一段，唯一职责是「拆」。它读入用户原句加页面上下文，输出一个意图数组，每个意图标注销售对象、认知任务、时态，以及它依赖哪些兄弟意图。拆分一旦定下，下游不再重新分类。 || The understanding stage (named Frame in code) is the pipeline's first stage, with the sole job of splitting. It reads the raw sentence plus page context and outputs an intent array, each tagged with sales object, cognitive task, tense, and which sibling intents it depends on. Once the split is fixed, downstream never re-classifies.

每个意图（IntentItem）携带四个判定维度，下游据此选技能、定顺序、解时态： || Each IntentItem carries four decision dimensions used downstream to pick skills, set order and resolve tense:

| 维度 || Dimension | 取值 || Values | 作用 || Purpose |
| --- | --- | --- |
| salesObject | Account / Contact / Opportunity / Activity / Product / None | 意图操作的业务对象 || The business object the intent acts on |
| cognitiveTask | Log / Plan / Find / Update / Recommend / Analyze / Knowledge / Report / Chat | 意图的动作类型，决定映射到哪类技能 || The action type, deciding which skill class to map to |
| temporal | past / future / none | 时态，决定活动是已完成还是已计划 || Tense, deciding whether an activity is completed or planned |
| relatesTo | [0, 2] 等兄弟意图下标 || Sibling intent indices like [0, 2] | 依赖编码，下游据此建 DAG 顺序 || Dependency encoding, used downstream to build DAG order |

日期锚点：理解阶段在意图分类的提示词里显式注入今天的日期与星期，模型据此把「下周三」这类相对时间换算成具体日期。 || Date anchor: the understanding stage's intent-classification prompt explicitly injects today's date and weekday, so the model resolves relative times like 'next Wednesday' into a concrete date.

## #orchestrator 04 / The Planning Stage :: 把意图排成有依赖的执行计划 || Arranging Intents into a Dependency-Ordered Plan

计划阶段（代码中称 Orchestrator）是第二段，职责是「排」——不重新分类、不拆并意图，只把上一段给定的每个意图映射到一个技能函数（工具）、填充参数、用 $ref 占位符表达跨步依赖，产出一张 DAG。它是一个受约束的「填空」任务。 || The planning stage (named Orchestrator in code) is the second stage; its job is to arrange. It never re-classifies or merges intents — it maps each given intent to a skill function (a tool), fills arguments, expresses cross-step dependencies with $ref placeholders, and emits a DAG. It is a constrained fill-in-the-blanks task.

:::comparison
::versus 方案 1 || Option 1
### 一步一函数 || One Step, One Function
↹

每个 DagStep 含 seq 执行序号、function 技能名、arguments 参数；同一 seq 可并行。Orchestrator 只填这些，不碰意图边界。 || Each DagStep has a seq order number, a function (skill) name and arguments; same seq can run in parallel. Orchestrator fills only these, never touching intent boundaries.

::versus 方案 2 || Option 2
### $ref 表达依赖 || $ref Expresses Dependency
$

一步的产出用 outputRef 命名（如 $opp），后续步骤在 arguments 里用 $opp.id 引用；执行时 resolveRefs() 展开占位符。这把「先建客户再挂商机」的顺序固化进结构。 || A step names its output via outputRef (e.g. $opp); later steps reference $opp.id in arguments; resolveRefs() expands placeholders at execution. This bakes 'account before opportunity' ordering into the structure.
:::

页面绑定实体：当对话发生在某个客户/商机详情页时，Orchestrator 接收页面已解析的实体，无需让 LLM 重新查询或猜测，既省一次解析也避免错挂。 || Page-bound entities: when the conversation happens on an account/opportunity detail page, Orchestrator receives the page's already-resolved entities, so the LLM need not re-query or guess — saving a resolution and avoiding mis-attachment.

## #queue 05 / The Intent Queue :: 多意图如何串成可核对的卡片流 || How Multiple Intents Become a Verifiable Card Flow

规划出的多意图不会一次性直接写库，而是进入一条带游标的意图队列，逐个推进。队列把「纯状态」与「纯副作用」分开：意图队列本身是一个纯函数 reducer，所有 I/O（消息推送、服务调用、提示）集中在运行时。 || Planned intents are not written all at once without review; they enter a cursor-driven intent queue and advance one by one. The queue separates pure state from pure side effects: the queue itself is a pure-function reducer, while all I/O (message push, service calls, toasts) lives in the runtime.

:::insight-grid { cols: 3 }
::card draft
### 草稿类 — 阻塞确认 || Draft — Blocking Confirm
draftActivity / draftOpportunity 等先把数据整形成预填表单卡片，等用户 Save 才真正 create()。写库前必有人核对。 || draftActivity / draftOpportunity shape data into a pre-filled form card; only on user Save does create() run. A human verifies before any write.

::card update
### 更新类 — 阻塞确认 || Update — Blocking Confirm
updateActivity / updateOpportunity 等把现有记录预填进卡片，用户改完 Save 才 update()。与草稿类同样需要核对。 || updateActivity / updateOpportunity pre-fill the existing record into a card; update() runs only after the user edits and saves. Like drafts, it requires verification.

::card query
### 查询类 — 直接返回 || Query — Immediate Return
queryAccounts / queryActivities 等是只读的，立即执行并展示结果列表，不渲染阻塞卡片——读不需要确认。 || queryAccounts / queryActivities are read-only; they execute immediately and show a result list, with no blocking card — reads need no confirmation.
:::

模糊匹配级联：当意图引用了「协和医院」这类名字，队列先插入一个匹配选择卡片，让用户在候选中确认或跳过；选定的实体 ID 累积进 resolvedContext，供后续兄弟意图自动引用。 || Fuzzy-match cascade: when an intent references a name like 'Union Hospital', the queue first inserts a match-selection card for the user to confirm or skip; the chosen entity ID accumulates into resolvedContext for sibling intents to auto-reference.

## #intelligence 06 / The Intelligent Read Path :: 读路径只在真实记录上作答，并把定量拆解交给可回溯的图表 || The Read Path Answers Only From Real Records and Hands Quantitative Breakdowns to Traceable Charts

智能读路径兑现了「读必接地」这一架构要求：标注为 Analyze / Report 的读意图不直接让模型作答，而是先查询、再交给接地分析步（analyzeResults）在取回的真实记录上推理。整条读路径按四层配合运行：运行时分派决策、规格与数值计算分离、固定渲染器与下钻回溯，以及文字洞察与图表拆解的职责边界。 || The intelligent read path fulfills the 'reads must be grounded' requirement: a read intent tagged Analyze / Report never lets the model answer directly, but queries first and hands the fetched records to a grounded analysis step (analyzeResults). Four layers work together: runtime dispatch decisions, separating chart specs from numeric computation, the fixed renderer with drill-down back to records, and the boundary between prose insight and chart breakdown.

分析步返回一个结构化结果 { answer? | followupQuery? , chart? }，运行时按出现了哪个字段分派： || The analysis step returns a structured result { answer? | followupQuery? , chart? }; the runtime dispatches on which field is present:

| 结构字段 || Structured Field | 运行时动作 || Runtime Action | 终止保证 || Termination Guarantee |
| --- | --- | --- |
| answer | 当前记录足以回答，直接给出接地答案。 || The current records suffice; emit the grounded answer. | 终态。 || Terminal. |
| followupQuery | 当前记录不足，补一次相关查询（如账户 → 其活动），在合并记录上重分析。 || Records insufficient; run one related query (e.g. account then its activities) and re-analyze over the merged set. | 补查上限 MAX_HOPS = 1；末跳被强制只能返回 answer，回路不可能递归。 || Follow-ups capped at MAX_HOPS = 1; on the final hop the step may return only answer, so the loop cannot recur. |
| chart | 答案是定量拆解，附一张由模型出规格、固定渲染器绘图的图表。 || The answer is a quantitative breakdown; attach a chart spec computed from real records and drawn by the fixed renderer. | 与 answer 并存，非独立分支。 || Coexists with answer; not a separate branch. |

失败样例走查：问「Rush 客户还能不能救」，账户记录里没有商机与近期活动 → 触发一次 followupQuery 补查其活动与商机 → 仍为空 → 末跳强制作答，如实回复「以现有记录无法评估其健康度」，而非编造一个乐观结论。 || Failure walkthrough: asked whether the Rush account can still be saved, the account row carries no opportunities or recent activity, so one followupQuery fetches its activities and deals; still empty, the final hop must answer and honestly replies that it cannot assess the account's health from the current records, rather than fabricating an optimistic verdict.

要让「读必接地」可证，数值的产出权必须离开模型。模型只输出一个图表规格 { type, dimension, metric }——按什么分、用哪种图、看金额还是数量；代码据此对真实记录分组并计算每一个数字。 || For 'reads must be grounded' to be provable, authorship of the numbers must leave the model. The model emits only a chart spec { type, dimension, metric } — what to group by, which chart, amount or count; code then groups the real records and computes every value.

:::comparison
::versus 方案 1 || Option 1
### 模型负责选择 || The Model Chooses
模型

判断该不该出图、按哪个维度（阶段 / 客户 / 月份 / 负责人）、用柱 / 环 / 折线、度量取金额还是数量。它只碰「怎么看」，不碰「是多少」，也从不产出 HTML 或 SVG。 || Whether to chart at all, along which dimension (stage / account / month / owner), which of bar / donut / line, and whether the metric is amount or count. It touches only how to view, never what the value is, and never emits HTML or SVG.

::versus 方案 2 || Option 2
### 代码负责算数 || Code Computes
代码

按 dimension 把取回的记录分组，逐组累加 metric，并在每组内保留成员记录的指针。每个柱高、每个占比都能追溯到具体记录，数值可证。 || Groups the fetched records by dimension, sums the metric per group, and keeps pointers to each group's member records. Every bar height and every share traces to concrete records, so the numbers are provable.
:::

被否决的替代方案：让模型直接输出聚合后的数字或一张渲染好的表。否决依据——模型会误算或编造，违反「读必接地」，且产出无法与记录对账；只让模型输出规格，才能使每个数字都锚定在真实记录上。 || Rejected alternative: letting the model output the aggregated numbers or a rendered table directly. Rejected because the model would miscount or fabricate, violating 'reads must be grounded', and its output could not be reconciled against the records; emitting only a spec is what anchors every number to real records.

:::flow
1. **选型由数据形状决定 || Shape Decides the Chart Form** — 固定渲染器据规格选型：排名比较用柱状，占比且组数 ≤ 6 用环形，时间维度用折线；类别名过长自动转横向柱；类别超过 Top-N（上限 10）时，尾部折叠成一个可展开的「其它」，其内再按子组下钻。 || The fixed renderer picks the form from the spec: bar for ranking, donut for share with 6 or fewer groups, line for a time dimension; long category names switch to horizontal bars; beyond a Top-N cap (10) the tail folds into an expandable 'Other' that itself drills into its sub-groups.
2. **三级兜底保证该出图就出图 || A Three-Tier Fallback Makes Charts Reliable** — 有模型规格就用模型的；模型未给时，从用户原话推断维度（「按客户」「按月」）；仍无则回退到阶段管道拆解。因此定量拆解请求即便模型漏给规格，也稳定出图。 || Use the model's spec when present; when the model omits it, infer the dimension from the user's own words ('by account', 'by month'); failing that, fall back to the pipeline-stage breakdown. So a breakdown request charts reliably even if the model drops the spec.
3. **下钻闭环回到同一批记录 || Drill-Down Closes the Loop on the Same Records** — 点一段 → 就地展开它的成员记录 → 点一条 → 按实体类型（商机 / 客户 / 活动 / 联系人四种路由）进入详情页。图表、下钻清单、详情页是同一批取回记录的三个视图：柱上的数字与详情页里的金额是同一个值。 || Tap a segment, inline-expand its member records, tap one, and open its detail page (routed by entity kind across four routes: opportunity / account / activity / contact). Chart, drill-down list and detail page are three views of the same fetched records: the number on a bar equals the amount on the detail page.
:::

:::comparison
::versus 方案 1 || Option 1
### 文字只担洞察 || Text Carries Only Insight
文字

有图表时，文字被约束为洞察——集中度、异常、风险、下一步动作；代码会剥掉模型答案里的分组罗列与小标题，使文字不复述图表已呈现的分组明细。 || When a chart is present, the text is constrained to insight: concentration, outliers, risk, next action; code strips any per-group enumeration and headings from the model's answer so the text never restates the breakdown the chart already shows.

::versus 方案 2 || Option 2
### 图表只担明细 || Chart Carries Only the Breakdown
图表

每组的数值与成员记录由图表及其下钻承担。文字答「为什么重要」，图表答「具体是多少、由哪些记录构成」，两者不重叠。 || Each group's value and member records are carried by the chart and its drill-down. Text answers why it matters; the chart answers what the numbers are and which records make them up. The two do not overlap.
:::

边界与代价：图表仅在「定量拆解且组数 ≥ 2」时出现，单个数值仍走文字；金额不带统一货币符号，因为同一盘子可能混币种；接地读路径比裸查询多一次模型往返，遇 followupQuery 再多一次——这是用延迟换正确性的取舍。 || Limits and cost: a chart appears only for a quantitative breakdown with 2 or more groups — a single value stays text; amounts carry no unified currency symbol because a book may mix currencies; the grounded read path costs one extra model round-trip over a bare query, and one more on a followupQuery — a deliberate latency-for-correctness trade.

## #contracts 07 / Contracts and Adaptation :: 两道防线：注册表契约与适配器 || Two Guardrails: The Registry Contract and the Adapter

LLM 的输出不可直接信任，数据库的物理列名也不宜渗入业务代码。架构在这两处各设一道防线：函数注册表用 Zod 校验每个技能的输入输出；服务适配器把应用模型翻译成 Dataverse 的真实列名。 || LLM output cannot be trusted directly, and physical database column names should not leak into business code. The architecture sets a guardrail at each boundary: the function registry validates every skill's I/O with Zod, while the service adapter translates the app model into Dataverse's real column names.

:::flow
1. **第一道：输出必须过契约校验 || First: Every Output Must Pass a Contract Check** — 每个技能在注册表里声明自己的输入输出契约。模型回复必须先过这道校验才能进入业务流程；校验失败就返回一个明确的错误，绝不静默放行、也不允许调用方自行猜测或强转。这是让不可信的 LLM 输出变可用的架构手段。 || Each skill declares its input/output contract in the registry. A model reply must pass this check before entering the business flow; on failure it returns an explicit error, never silently passing and never letting callers guess or re-cast shapes. This is the architectural means of turning untrusted LLM output into something usable.
2. **第二道：适配层隔离数据库细节 || Second: The Adapter Isolates Database Details** — 每张表一个适配器，把 Dataverse 的物理字段翻译成业务模型、反向再翻译回去，业务代码只面对干净的业务字段，不被平台的选项集、查找字段、创建回读等细节渗透。这些 Dataverse SDK 层面的具体适配机制见 Power Apps Code App 技术文章。 || Each table has one adapter that translates Dataverse's physical fields into the business model and back, so business code faces only clean business fields, unpolluted by platform choice sets, lookup fields, create read-back and so on. The concrete Dataverse SDK adaptation mechanisms are covered in the Power Apps Code App technical article.
:::

## #observability 08 / Observability :: 任何静默降级都必须留下痕迹 || Every Silent Degradation Must Leave a Trace

LLM 流水线天然有不确定性：某次调用可能畸形需重试，某个字段可能缺失被补默认值。架构的硬规则是：任何重试、补值、回退都不能伪装成一次干净的运行，必须在控制台告警、在 PipelineResult 里带上布尔值与原因，并在 Frame Inspector 里显示一枚标记。 || An LLM pipeline is inherently nondeterministic: a call may be malformed and retried, or a field may be missing and filled with a default. The hard rule is that no retry, default, or fallback may disguise itself as a clean run — it must warn in the console, carry a boolean flag and reason on PipelineResult, and show a chip in the Frame Inspector.

:::comparison
::versus 方案 1 || Option 1
### 可回放的运行记录 || Replayable Run Records
▤

Inspector 保留最近若干次运行的 Frame 结果（意图、推理、置信度）、Orchestrator 延迟，以及发送给 LLM 的精确 prompt 文本与原始响应，可直接复制到 playground 复现。 || The Inspector retains recent runs' Frame results (intents, reasoning, confidence), Orchestrator latency, plus the exact prompt text sent to the LLM and the raw response, copyable into a playground to reproduce.

::versus 方案 2 || Option 2
### 重试与补值高亮 || Retries and Patches Highlighted
⟳

当 Frame 或 Orchestrator 因畸形输出重试，运行记录带上 frameRetried / planRetried 与原因，Inspector 用醒目标记呈现；字段补值同样以列表形式标出，绝不静默。 || When Frame or Orchestrator retries on malformed output, the record carries frameRetried / planRetried plus reasons, surfaced by the Inspector with a visible chip; field patches are likewise listed, never silent.
:::

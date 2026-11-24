---
title: "Purpose-Driven CRM：从录入工具到即时决策伙伴 || Purpose-Driven CRM: From a Data-Entry Tool to a Real-Time Decision Partner"
eyebrow: Microsoft Business AI Solution
brand: Agentic Sales Mobile
date: 2026-04-30
strict_i18n: false
strict_density: true
lead: "传统 CRM 以数据为中心，一线销售是录入者，价值多兑现于管理复盘；本方案基于 Microsoft Power Platform，以目标为向重构一套移动优先、语音驱动、AI 编排的销售 CRM：让一线在拜访现场的每一次录入之上，即时获得面向目标的判断与下一步行动。 || Traditional CRM is data-centric: the front-line rep is a data entrant, and value lands late, mostly in management review. Built on Microsoft Power Platform, this proposal re-architects the sales CRM around purpose — mobile-first, voice-driven, and AI-orchestrated — so that on top of every field capture, the rep receives goal-oriented judgment and a confirmable next step in the moment."
hero_actions:
  - "查看设计哲学 || See Design Philosophy | #philosophy"
  - "查看系统架构 || See System Architecture | #architecture"
panel_label: "核心主张 || Core Thesis"
panel_title: "让一线销售从数据的贡献者，同时成为数据的即时受益人。 || Make the front-line rep, beyond being a contributor of data, the immediate beneficiary of it."
panel_desc: "传统思路把桌面 CRM 移植到手机，数据仍服务于隔日复盘；本方案以目标为编排主线，在每一次录入与查询之上叠加一个面向销售目标的判断层，使数据当下回流成对销售有用的下一步行动。 || The conventional approach ports the desktop CRM onto a phone, and data still serves next-day review. This proposal makes purpose the orchestration spine: on top of every capture and query it adds a sales-goal-oriented judgment layer, so data flows back, in the moment, into a useful next action for the rep."
panel:
  - "即时受益 — 录入即回报，当场返回判断与下一步 || Immediate return — logging earns a return: judgment and the next step on the spot"
  - "目标导向 — 每条数据映射销售目标，而非堆字段 || Purpose-led — every data point maps to a sales goal, not just fields"
  - "认知闭环 — 行为→数据→洞察→行动持续驱动 || Cognitive loop — behavior → data → insight → action, continuously driven"
  - "共生扩展 — 不替换既有 CRM，叠加智能判断层 || Coexistence — keep the legacy CRM, add an intelligence layer on top"
metrics:
  - "覆盖业务域 || Business Domains | 5 | 客户活动 · 商机 · 订单 · 安装售后 · 绩效 || Activities · Opportunities · Orders · Install & Service · Performance"
  - "规划 Agent 数量 || Planned Agents | 30+ | 含通用场景 Agent，分阶段上线 || Including reusable utility agents, rolled out in phases"
  - "移动主流程目标耗时 || Target Mobile Flow Time | ≤ 30s | 语音录入活动反馈到商机草稿生成 || From voice capture to opportunity draft generation"
  - "实施周期 || Delivery Timeline | 6 个月 || months | 四阶段交付，3 个月内首个生产 Agent 上线 || Four phases; first production agent live within 3 months"
style:
  accent: "#c084fc"
---

## #challenge 01 / Business Challenge :: 现状与挑战：桌面 CRM 在拜访现场失效 || The Status Quo: A Desktop CRM That Breaks Down on the Field

客户业务依赖一套高度定制的既有 CRM，承载从客户活动、商机、订单、安装到售后的完整业务流程。系统在桌面端覆盖了完整的功能集，但其访问形态与现代销售的实际工作场景之间存在明显错位——销售真正需要它的时刻，恰恰是它最难以使用的时刻。 || The customer's business runs on a heavily-customized legacy CRM that covers activities, opportunities, orders, installation and after-sales. The desktop surface is functionally complete, yet its access model is mismatched with how modern sales actually work — the moments reps need the CRM most are precisely when it is hardest to use.

:::insight-grid { cols: 2 }
::card 01
### 移动访问 = 浏览器套桌面，并非原生移动应用 || "Mobile" today = a desktop site wrapped in a browser, not a native mobile app
痛点 01 · 形态错配 || Pain 01 · Form Mismatch

当前所谓的"移动端"实质是桌面 Web 在手机浏览器内的简单包装：仅做了 Responsive 布局适配，未按移动操作特性重新设计交互；首屏与列表加载时间长，触控热区与导航层级仍是桌面思维，销售在拜访现场仍倾向退回 Excel/微信记录。 || What is called "mobile" today is the desktop web rendered through a phone browser — only responsive layout, no rethinking of interaction. First-screen and list loads are slow; tap targets and navigation depth are still desktop-style. Reps end up retreating to Excel and chat apps in the field.

::card 02
### 跨境访问慢，等待消耗耐心 || Cross-border access is slow; latency burns patience
痛点 02 · 性能瓶颈 || Pain 02 · Performance

既有 CRM 后端部署集中，跨区域访问需经多段网络，单页加载与列表查询常需数秒至十余秒，使一线销售更倾向用 Excel/微信记笔记，绕过系统。 || The legacy CRM backend is centrally deployed, while cross-region access traverses multiple network hops. Single-page loads and list queries often take several to a dozen seconds, pushing reps to take notes in Excel or chat — bypassing the system entirely.

::card 03
### 表单字段繁多，移动端难以完成 || Forms have too many fields to finish on a phone
痛点 03 · 录入摩擦 || Pain 03 · Entry Friction

"记录拜访"需填写 10+ 字段（主题、纪要、起止时间、目的、联系人、状态、跟进动作、关联客户/商机），即便上线移动表单也只是把痛苦从大屏迁移到小屏。 || "Logging a visit" demands 10+ fields (subject, notes, start/end time, purpose, contacts, status, follow-up, linked customer/opportunity). Even a mobile form just moves the pain from a large screen to a small one.

::card 04
### 从"信息记录"到"商机识别"全靠人脑 || From note-taking to opportunity recognition, everything still depends on human judgement
痛点 04 · 智能缺位 || Pain 04 · No Intelligence

销售完成拜访后需要自己判断"是否要建商机"、"产品线是什么"、"信心度多少"，再手动到另一个模块创建——这恰恰是 AI 最擅长辅助、却尚未介入的环节。 || After every visit, the rep alone decides whether to create an opportunity, which product line it belongs to, and what the confidence is — then manually opens another module to enter it. This is exactly where AI should assist, yet today it does not.
:::

:::callout { title: "核心判断 || Core Insight" }
AI 已经可以理解口语、识别意图、自动调用业务 API。销售在路上仍被迫低头填表，跟“CRM 该不该上移动端”无关，原因是现有 CRM 把桌面表单原样搬到了 6 寸屏上。本方案的目标：表单退出主界面，由对话与 AI 草稿承接录入。 || AI can already understand speech, infer intent, and call business APIs. Sales reps still type into forms on the road — not because mobile CRM is wrong, but because today’s CRM ships desktop forms verbatim onto a 6-inch screen. Goal of this proposal: forms exit the main screen; conversation and AI drafts handle data capture.
:::

## #philosophy 02 / Design Philosophy :: 设计哲学：从 Data-Driven 迈向 Purpose-Driven CRM || Design Philosophy: From Data-Driven to Purpose-Driven CRM

设计原点是一次定位转变：CRM 不再只以数据为中心，而以销售目标为编排方向——保留 CRM 的数据基础，在录入、查询与呈现之上叠加面向目标的判断层，使一线在沉淀数据的当下即获得回报。下面四条原则规定销售与这套 Purpose-Driven CRM 的交互方式：一句话说清原则，一条硬规则约束实现，并直接决定后续的架构选型与产品配置。 || The design begins with a shift in stance: the CRM is no longer merely data-centric but steered by sales purpose — preserving the data foundation while adding a goal-oriented judgment layer over capture, query, and surfacing, so the front line is rewarded the moment data is captured. The four principles below define how reps interact with this Purpose-Driven CRM: one sentence per principle plus one hard rule, and they drive every architectural and licensing decision that follows.

输入侧· 让数据更轻松地沉淀 || Input Side· make data easier to capture

原则 01 || Principle 01

### 移动 + 语音优先 || Mobile + Voice First

设计起点是单手、户外光线、30 秒内完成，而非桌面缩小版；语音是拜访间隙最自然的输入，键盘仅作 fallback。 || Design starts from one hand, outdoor light, finished within 30 seconds — not a shrunk desktop; voice is the natural input between visits, with the keyboard only as a fallback.

Design Rule

单一焦点 · 一拇指可达 · 离线可写；Azure AI Speech 流式转写为主、系统听写 fallback、Copilot Studio AI Tool + Workflow 抽取字段。 || Single focus · thumb-reachable · offline-writable; Azure AI Speech streaming primary, system dictation as fallback, Copilot Studio AI Tool + Workflow for field extraction.

原则 02 || Principle 02

### Confirm，Don't Configure || Confirm, Don't Configure

AI 主动给草稿，用户只做确认 / 微调 / 拒绝三选一，配置型交互压成判断型。 || AI drafts proactively; the user picks one of three — confirm / tweak / reject. Configuration-style interaction collapses into judgement.

Design Rule

任何写入先展示可核对草稿；每条 AI 输出附来源 + 置信度 + 一键编辑，拒绝 / 编辑沉淀为提示词优化语料。 || Every write shows a checkable draft first; each AI output carries source + confidence + one-tap edit, and rejections/edits become prompt-optimization corpus.

原则 03 || Principle 03

### Agent 编排，不是菜单导航 || Agent Orchestration, not Menu Navigation

用户表达意图，Generative Orchestration 调度 Agent，无需知道既有 CRM 菜单。 || The user states intent; Generative Orchestration dispatches the right agent. No one needs to know the legacy CRM menu.

Design Rule

移动端只有对话 · 看板 · 任务三入口；新增能力靠注册 Agent 而非重构 UI。 || Mobile has just three entry points — Chat · Board · Tasks; new capabilities ship by registering an agent, not rebuilding the UI.

输出侧· 让数据即时回流成判断 || Output Side· turn data into judgment in the moment

原则 04 || Principle 04

### 即时闭环：录入即回报 || Instant Loop: Logging Earns a Return

数据写入后立即触发回报：在当前会话内返回确认结果、增量发现与下一步建议，不依赖隔日报表。 || After a write, the return fires immediately: within the same session the system returns confirmed capture, incremental findings, and a next-step suggestion — not a next-day report.

Design Rule

回报固定三段：已沉淀的记录 / 草稿 → 基于 CRM 事实的增量发现 → 可接受 / 忽略 / 转待办的下一步入口。 || The return has a fixed three-part shape: the captured record/draft → incremental findings grounded in CRM facts → a next-step entry that can be accepted, ignored, or turned into a task.

原则 05 || Principle 05

### 增量价值：只说他不知道的 || Incremental Value: Tell What They Don't Know

输出须提供输入之外的增量判断——如久未联系、信心下滑、关系覆盖缺口或被忽略的机会，而非复述用户口述。 || Output must provide judgment beyond the input — inactive accounts, declining confidence, relationship-coverage gaps, or overlooked opportunities — not a paraphrase of what the rep said.

Design Rule

洞察按现象 → 原因 → 行动三段生成；不返回对输入的简单复述，每条都应可执行。 || Insights follow Observation → Reason → Action; the system never returns a simple paraphrase, and every item is actionable.

原则 06 || Principle 06

### 可信赖：有据可查，宁缺毋编 || Trustworthy: Grounded, Never Fabricated

每条 AI 输出均基于真实字段事实、可溯源，并支持销售核对与推翻；低置信时显式降级，不输出无依据的确定性结论。 || Every AI output rests on real field facts and traceable sources, and supports rep verification and correction; under low confidence it degrades explicitly, never asserting unfounded certainty.

Design Rule

输出附事实来源与置信度；无数据时正确拒答、不编造工具未返回的数据。 || Outputs attach factual source and confidence; when data is missing, the system refuses correctly and never fabricates data the tools did not return.

## #prototypes 03 / Interface Prototypes :: 界面原型：设计原则在移动端的落地 || Prototypes: The Principles, Rendered on a Phone

把上述设计原则落到一线最高频的五个屏幕：开机看到的"今日大盘"、提供主动播报的"今日播报"，以及活动录入 / 客户信息查询 / 商机创建三个动作屏。本文档为方案视角，仅展示界面终态；每屏对应的 Vibe Coding 提示词与平台地基 Bootstrap 提示词集中收录在配套设计文档中。 || The design principles, rendered onto the five highest-frequency screens for field sales: the launch "Today at a Glance", a proactive Brief Me screen, and three action screens — activity capture / customer inquiry / opportunity creation. This proposal shows only the finished UI; the per-screen Vibe Coding prompts and the platform Bootstrap prompt live in the companion design doc.

9:41

5G ▮▮

M

早上好 || Good morning

Maria Souza

⚙

今日拜访 || Visits Today

4

2 已确认 · 2 待出发 || 2 confirmed · 2 to go

活跃商机 || Active Opps

12

2 风险 · 需关注 || 2 at risk · review

本月业绩 || MTD Quota

68%

↑ 8% vs 上月 || ↑ 8% vs last mo

待跟进 || Follow-ups

5

1 延期 · 1 工单 || 1 overdue · 1 ticket

今日摘要 || Today's Briefing

AI 生成 || AI Generated

!

9:00 Hospital Alpha · 重点跟进 A3 演示反馈 || 9:00 Hospital Alpha · follow up on A3 demo feedback

▲

Hospital Gamma 昨日提交 RFP · 14:00 拜访前需准备 || Hospital Gamma RFP submitted yesterday · prep before 14:00 visit

●

Hospital Delta · A1 商机阶段升级 Propose → Negotiate || Hospital Delta · A1 opp moved Propose → Negotiate

⊙

昨日 N1 订单已清关 · 预计明日交付 Hospital Alpha || N1 order cleared customs · ETA tomorrow to Hospital Alpha

指标分析 + 客户画像 + 订单查询 Agent || KPI Analytics + Customer Profile + Order Inquiry agents

●

语音播报 || Brief Me

＋

新拜访 || New Visit

Ask Copilot…

↑

原则 01 + 04 || Principle 01 + 04

### 首页 Dashboard || Home Dashboard

开机即得"今日大盘"：身份 + 4 张 KPI + AI 生成的今日摘要 + 语音播报/新拜访快捷入口，底部常驻 Copilot Chat 输入条（语音 + 文本任选）。 || On launch the rep sees today's pulse: identity + 4 KPIs + an AI-generated daily briefing + Brief Me / New Visit shortcuts, with a persistent Copilot Chat input bar (voice or text) pinned at the bottom.

9:41

5G ▮▮

←

今日播报 · 6 章节 2 分 40 秒 || Brief Me · 6 chapters 2m 40s

文 || Aa

风险预警 || Risk

03 / 06 · 00:48–01:25

A 客户两次延期回复 · 履约掉至 78% || Account A: 2 reply delays · fulfilment 78%

14 天连续 2 次延期：付款承诺从 4/18 推到 4/26 又推到 5/03；今晨内部群已被 @两次，履约 96% → 78%。 || 2 reply delays in 14 days: payment commitment slid 4/18 → 4/26 → 5/03; @-mentioned twice in the team channel this morning, fulfilment 96% → 78%.

- 对方采购总监本周休假 · 已切换接口人为副总监 Lucia || Procurement lead on PTO this week · contact switched to deputy Lucia
- 信用风险分上调至 B+，回款超 30 天将触发预警 || Credit risk score raised to B+; >30-day overdue will trigger alert

-18% · 履约

SLA 超 4 天

¥620 万 在途

3 单待发货

今天 15:30 你正好在浦东 · 距 A 客户 2.4 km · 副总监今日在岗 || You're in Pudong at 15:30 · 2.4 km from Account A · deputy on-site today

加入今日拜访 || Add to today

左右滑动 · 切换章节 || Swipe ← → to switch chapters

1

×

▾

▶

01:08 / 02:40

原则 04 · 反向播报 || Principle 04 · Reverse Briefing

### 今日播报 Brief Me || Brief Me

单张 BriefCard 承载今日全部背景：摘要 + 要点 + metric chip + 加入今日 CTA。底部气泡短按播放、长按对话，左侧 chip 切 1×/1.5×/2×，dots 切章节。 || One BriefCard holds today's context: summary, bullets, metric chips, Add-to-Today CTA. The bottom bubble short-taps to play, holds to talk; left chip cycles 1×/1.5×/2×, dots switch chapters.

9:41

5G ▮▮

←

新拜访 · Hospital Alpha || New Visit · Hospital Alpha

⋯

"刚拜访了 Hospital Alpha，院方对 A1 型号比较感兴趣，预计下季度采购 8 台，下周三再上门做技术演示。" || "Just visited Hospital Alpha. They're interested in the A1 model, plan to buy 8 next quarter, and want a tech demo on-site next Wednesday."

语音转写 · 02:14 || Voice transcript · 02:14

拜访摘要 || Visit Summary

AI 草稿 || AI Draft

客户 || Customer

Hospital Alpha

主题 || Subject

A1 产品介绍 || A1 product intro

下一步 || Next Step

下周三技术演示 || Tech demo next Wed

商机草稿 || Opportunity Draft

AI 推断 || AI Inferred

产品 · 数量 || Product · Qty

A1 × 8

信心度 || Confidence

60%

确认 || Confirm

编辑 || Edit

重录 || Redo

Ask Copilot…

↑

原则 02 + 03 || Principle 02 + 03

### 活动录入 || Activity Capture

语音 → 自动生成拜访摘要 + 商机草稿 + 跟进动作，用户只做"确认 / 编辑 / 重录"三选一。 || Voice → auto-generated visit summary + opportunity draft + next action. The user picks one of three: confirm, edit, or redo.

9:41

5G ▮▮

←

Ask Copilot

⋯

Hospital Beta 的最新商机进度？ || What's the latest opportunity status for Hospital Beta?

⊙ 商机评估 Agent || ⊙ Opportunity Agent

Hospital Beta 当前 3 个活跃商机： || Hospital Beta currently has 3 active opportunities:

监护仪 N17 || Monitor N17

× 12

Negotiate

监护仪 A2 || Monitor A2

× 4

Identify

超声 R9 || Ultrasound R9

× 2

Propose

⊙ 客户画像 Agent || ⊙ Customer Profile Agent

最近 30 天 4 次拜访 · NPS 提升 12 点 · 上次接触 04/22 || 4 visits in past 30d · NPS up 12 pts · last touch 04/22

来自既有 CRM · Custom Connector 实时查询 || From the legacy CRM · live via Custom Connector

Ask Copilot…

↑

原则 04 || Principle 04

### 客户信息查询 || Customer Inquiry

用户表达意图，Generative Orchestration 自动调用客户画像 + 商机评估两个 Agent 并合成回答，无需菜单导航。 || The user states intent; Generative Orchestration calls Customer Profile and Opportunity agents and composes the answer. No menu navigation needed.

9:41

5G ▮▮

←

商机草稿 || Opportunity Draft

⋯

AI 已生成 || AI Generated

待确认 || To Confirm

整体信心度 || Overall Confidence

78%

客户 || Customer

Hospital Alpha

产品线 || Product Line

A1 监护仪 || A1 Monitor

数量 || Quantity

8 台 || 8 units

预计金额 || Est. Amount

USD 96,000

阶段 || Stage

Identify

预计成交 || Est. Close

2026 Q3

溯源 || Provenance

Source

04/29 拜访活动 · Hospital Alpha || 04/29 visit · Hospital Alpha

历史成交参考 · 类型相似 · 3 单 || 3 similar past deals referenced

确认创建 || Confirm & Create

编辑详情 || Edit Details

确认后将异步回写既有 CRM || Will async-sync to the legacy CRM after confirmation

原则 03 || Principle 03

### 商机创建 || Opportunity Creation

每个 AI 生成结果带"信心度 + 来源 + 一键编辑"，写入统一经"草稿 → 确认 → 既有 CRM 同步"三段式，不以黑盒方式直接提交。 || Every AI output carries confidence · source · one-tap edit. Writes follow Draft → Confirm → legacy-CRM sync, not a black-box submit.

:::callout { title: "三个原型共同呈现的设计取舍 || Trade-offs Embodied by All Three Prototypes" }
① 主动作永远是橙色麦克风，键盘是隐藏的 fallback；② 任何 AI 输出必须带"AI 草稿"标签和置信度，写入前一律可编辑；③ Agent 名字明示在回答上方，让用户对"是谁在回答我"有感知，便于后续追溯与调优。 || (1) The primary action is always the orange mic; the keyboard is the hidden fallback. (2) Every AI output bears an "AI Draft" tag and confidence score, and must be editable before write. (3) The agent's name is shown above its reply, so the user knows who answered — enabling traceability and tuning.
:::

## #day 04 / The Sales Rhythm :: 用户的节奏：Maria 的一天 · 一周 · 一季 || The Sales Rhythm: Maria's Day, Week, and Quarter

Maria 是负责 12 家三甲医院的资深销售。下方按时间顺序列出她一天 + 一周 + 一季的 9 个高频场景，每条标注触发动作与对应 Agent，作为后续架构章节的业务参照。 || Maria is a senior rep covering 12 large hospitals. Below: 9 high-frequency scenarios across her day / week / quarter — each labels the trigger and the agents involved, as a business reference for the architecture sections that follow.

07:40

### 出门前 · 一屏看清今天 || Before Leaving · Today at a Glance

4 拜访 || 4 visits

1 评审 || 1 review

2 跟进 || 2 follow-ups

1 待签报价 || 1 quote pending

⚠ 8:30 前需回复 1 项 || ⚠ 1 reply due by 8:30

日程协调 Agent || Schedule Coordination Agent

07:55

### 通勤路上 · 90 秒语音简报 || On the Road · 90-Second Voice Brief

3 件必做 || 3 musts

2 风险商机 || 2 at-risk opps

1 延期工单 || 1 overdue ticket

指标分析 Agent || KPI Analytics Agent

客户画像 Agent || Customer Profile Agent

"今天三件事：9 点 Hospital Alpha 推进 A1 报价、下午 2 点 Hospital Gamma 回应 RFP、回程前给 Beta 采购回个电话。Alpha 单子已到 Validate 阶段，缺一份院方授权书；Gamma RFP 截止日是周五，注意问清评分权重。" || "Three things today: 9 AM push the A1 quote at Hospital Alpha; 2 PM respond to Gamma's RFP; before heading back, call Beta's procurement lead. Alpha is at Validate stage — missing the authorization letter. Gamma's RFP closes Friday — clarify the scoring weights."

08:55

### 到访前 3 分钟 · 三层洞察卡 || 3 Min Before Arrival · 3-Layer Insight Card

决策链 3 人 || Decision chain · 3

开放商机 3 || Open opps · 3

未闭环动作 2 || Open actions · 2

客户画像 Agent || Customer Profile Agent

提示：采购主任偏好先看 TCO，不要先讲临床效果。 || Hint: Procurement lead prefers TCO first, not clinical outcomes.

10:30

### 拜访结束 · 一句话 → 4 张确认卡 || Visit Done · One Sentence → 4 Confirm Cards

4 意图 · 30 秒 || 4 intents · 30s

拜访 · 活动 · 商机 · 日程 || visit · activity · opp · schedule

客户拜访 Agent || Customer Visit Agent

活动记录 Agent || Activity Log Agent

商机评估 Agent || Opportunity Scoring Agent

日程协调 Agent || Schedule Coordination Agent

"记一下今天的拜访，A1 试用反馈 8 台正向；顺便加一条活动——给 ICU 主管演示过 N1；ICU 升级监护仪算一个新机会，估 20 万美元；下周二上午约采购主任评审报价。" || "Log today's visit — positive feedback on 8-unit A1 trial. Also add an activity — demoed N1 to the ICU lead. The ICU monitor upgrade is a new opportunity, around USD 200K. Book a quote review with the procurement lead next Tuesday morning."

12:10

### 午餐间隙 · 现场技术追问 || Lunch Break · On-the-Spot Tech Q&A

语音问答 || Voice Q&A

3 段答 + 引用页码 || 3-part answer + page refs

适配版本 / 网关 / 案例 || firmware / gateway / case

产品知识 Agent || Product Knowledge Agent

16:30

### 回程路上 · 推商机升阶段 || On the Way Back · Push Opp to Next Stage

决策链 ✅ || Decision chain ✅

预算 ✅ || Budget ✅

技术评估 ✅ || Tech eval ✅

授权书 ❌ || Auth letter ❌

AI 拟稿 + 抄送 + 发送时间，一键确认 || AI draft + CC + send time, one-tap confirm

商机评估 Agent || Opportunity Scoring Agent

18:20

### 傍晚 · 日报默认成稿 || Evening · Daily Report Drafted by Default

4 段：产出 / 变动 / 未闭环 / 明日重点 || 4 blocks: outcomes / changes / open / next-day

读 → 改 → 提交 || Read → tweak → submit

工作总结 Agent || Daily Summary Agent

"今天我没有打过一个字。" || "I didn't type a single character today."

周一 09:00 || Mon 09:00

### 一句话 → 批量写入 Outlook 日历 + Tasks || One Sentence → Batch-Create Outlook Events + Tasks

任务类型：回访 / 报价 / 评审 / 复盘 || Tasks: visit / quote / review / retro

冲突项给 2 候选，一键选其一 || Conflicts → 2 options, one-tap pick

周计划 Agent || Weekly Plan Agent

日程协调 Agent || Schedule Coordination Agent

"本周给我安排三家重点客户回访：Alpha、Gamma、Delta，每家 60 分钟；周三前完成 Alpha A1 报价；周四下午做 Gamma RFP 内部评审；周五傍晚和经理复盘本季度缺口。" || "Schedule three key-account visits this week — Alpha, Gamma, Delta, 60 minutes each. Finish the Alpha A1 quote by Wednesday. Internal review of Gamma's RFP on Thursday afternoon. Friday evening, retro the quarterly gap with my manager."

周五 17:30 || Fri 17:30

### 季度缺口复盘 · 5 个可前推商机 || Quarterly Gap Retro · 5 Movable Opps

筛选条件：阶段差一步 + 响应度高 + 金额够 || Filter: 1 stage away + high response + amount fits

每条附下一步动作（材料 / 会议 / 电话） || Each with next action (doc / meeting / call)

Maria 选 3 进入下周 || Maria picks 3 for next week

指标分析 Agent || KPI Analytics Agent

商机评估 Agent || Opportunity Scoring Agent

## #architecture 05 / System Architecture :: 系统架构：智能业务伙伴的分层协同 || System Architecture: A Layered Intelligent Business Partner

三种数据方案共用两条调用路径。直接事务路径由 Power Apps Code App 接入 Azure AI Speech 转写，结合 Copilot Studio AI Tool / Workflow 处理意图与字段，再通过 Dataverse Connector 或 Custom Connector 完成确定性读写；Model Driven App 直接管理获准维护的 Dataverse 表。Agent 编排路径由 Copilot in Teams 或 Code App 对话入口调用 Copilot Studio Agents / Workflow，再由 Agent 工具访问 Dataverse 或 CRM。两条路径共用 Entra ID、DLP、Key Vault 和 Application Insights。本图采用本方案选定的 AI Tool / Workflow 标签，不表示 AI Builder 官方停用或能力逐项等价；部署前须核对 [Prompt 工具](https://learn.microsoft.com/en-us/microsoft-copilot-studio/prompts-overview)与 [Workflow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview) 所用的编排体验、节点、区域与授权。 || All three data options support two invocation paths. In the direct transaction path, Power Apps Code App uses Azure AI Speech transcription with Copilot Studio AI Tool / Workflow for intent and field processing, then performs deterministic reads and writes through Dataverse Connector or Custom Connector; Model Driven App directly manages approved Dataverse tables. In the agent orchestration path, Copilot in Teams or the Code App chat entry invokes Copilot Studio Agents and Workflow, whose tools access Dataverse or CRM. Both paths share Entra ID, DLP, Key Vault, and Application Insights. AI Tool / Workflow are this solution's selected labels, not a claim that AI Builder is retired or that features map one-to-one; verify the orchestration experience, nodes, region, and licensing for [prompt tools](https://learn.microsoft.com/en-us/microsoft-copilot-studio/prompts-overview) and [Workflow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview) before deployment.

Power Apps Code App · Copilot in Teams · Model Driven App

### 主战场 + 两侧入口 || Main stage + flanking entry points

销售用代码型 Power Apps（写 React / TS，复用平台身份与治理）作为主端，能调相机、语音、离线缓存等原生能力；Teams 给会议中的临时查询，Model Driven App 给后台运维。 || Reps work on a code-flavoured Power Apps shell (React / TS, reusing platform identity and governance) with native camera / voice / offline access; Teams provides in-meeting ad-hoc queries; Model Driven App handles back-office operations.

Power Apps Code App (React)

Copilot in Teams

Model Driven App（管理后台） || Model Driven App (admin back office)

Azure AI Speech · Copilot Studio AI Tool

### 语音转写 + AI Tool 文本智能 || Speech Transcription + AI Tool Text Intelligence

**语音走 Azure AI Speech，文本智能用 Copilot Studio AI Tool**。表单处理、实体抽取与分类由相应 Workflow 功能承接，具体节点与输出 schema 按场景验证。 || **Voice runs on Azure AI Speech; text intelligence uses Copilot Studio AI Tool.** Related Workflow functions handle form processing, entity extraction, and classification; validate the nodes and output schema for each scenario.

Azure AI Speech (STT) · iOS 输入法听写 fallback || Azure AI Speech (STT) · iOS IME dictation fallback

Copilot Studio AI Tool (Prompt)

Workflow：表单处理 || Workflow: Form Processing

Workflow：实体抽取 / 分类 || Workflow: Entity Extraction / Classification

⇌

Copilot Studio Agents · Workflow

### Copilot Studio Agents — 数据与工具的编排者 || Copilot Studio Agents — orchestrators of data and tools

**Generative Orchestration** 只处理需要对话推理、跨业务域查询或多 Agent 协同的请求；**Workflow** 处理多步事务。AI Tool / Workflow 已完成字段处理且目标操作明确时，Code App 服务层可直接调用 Connector，不必绕行 Agent。 || **Generative Orchestration** handles requests that require conversational reasoning, cross-domain queries, or multi-agent coordination; **Workflow** handles multi-step transactions. After AI Tool / Workflow field processing, when the target operation is deterministic, the Code App service layer can invoke the connector directly without routing through an agent.

Copilot Studio Agents

Generative Orchestration

Workflow（多步事务） || Workflow (Multi-Step Transactions)

Copilot Studio · 售后知识库 || Copilot Studio · Service Knowledge Base

MCP / Custom Connectors

Dataverse · API 接入 · CRM 同步适配器 || Dataverse · API Access · CRM Synchronization Adapter

### 数据方案只改变这些组件与 CRM REST API 的连接方式 || Data Options Change Only How These Components Connect to the CRM REST API

Microsoft Dataverse 保存副本、投影或应用状态；API 接入层承担实时校验；CRM 同步适配器承担变更读取、字段映射、写回与对账。这里先定义逻辑职责，不预设同步产品：CRM 原生事件或插件、客户既有中间件、iPaaS，以及 Azure 集成服务都可能成为实现，最终由 CRM 能力与客户现有集成标准决定。 || Microsoft Dataverse stores replicas, projections, or application state. The API access layer handles live validation, while a CRM synchronization adapter handles change capture, mapping, writeback, and reconciliation. This defines logical responsibilities without predetermining a synchronization product: CRM-native events or plug-ins, existing customer middleware, iPaaS, or Azure integration services may implement the adapter, subject to CRM capabilities and the customer's integration standards.

Microsoft Dataverse

Custom Connector

Azure API Management（统一接入） || Azure API Management (unified ingress)

CRM 同步适配器（待接入调研后选型） || CRM Synchronization Adapter (selected after discovery)

Azure Blob Storage（拜访照片 / 设备铭牌） || Azure Blob Storage (visit photos / device nameplates)

既有 CRM REST API · System of Record || Legacy CRM REST API · System of Record

### 既有 CRM REST API 与业务数据库 || Legacy CRM REST API and Business Database

合同、价格、库存和订单履约等后台能力保持不变。每种数据策略必须逐实体声明权威数据源、允许的写入方和一致性边界，避免两侧同时成为主数据。 || Backend capabilities such as contracts, pricing, inventory, and order fulfilment remain unchanged. Every data strategy must declare the authoritative source, permitted writer, and consistency boundary for each entity so the two sides never become competing masters.

Entra ID · DLP · Key Vault · App Insights

### 三种数据方案共用相同的平台治理组件 || All Three Data Options Share the Same Platform Governance Components

身份沿用现有 Entra ID + 既有 CRM 角色；连接器边界、环境隔离、AI 输出审核、凭据托管与端到端可观测都用平台原生组件，不再自建。 || Identity reuses existing Entra ID + legacy-CRM roles; connector boundaries, environment isolation, AI output moderation, credential vault and end-to-end observability all rely on native platform components — nothing custom-built.

Microsoft Entra ID（SSO） || Microsoft Entra ID (SSO)

Power Platform DLP

Managed Environments

Microsoft Purview

Azure Key Vault（凭据托管） || Azure Key Vault (credential vault)

Azure Application Insights · 端到端可观测 || Azure Application Insights · end-to-end observability

## #data-strategy 06 / Data Strategy :: 数据策略：与既有 CRM 共存的三种方式 || Data Strategy: Three Ways to Co-Exist with the Legacy CRM

客户要求建立真正的近实时双向双环同步（既有 CRM ↔ 移动新端），同时严禁直接跨网强耦、拖慢一线页面响应。下面三组集成架构聚焦于两端的数据调度、校验与防冲突持久化链路。作为核心推荐的「方案 C」具备三条互不阻塞的主轴：读侧直接走 Dataverse 投影避免等待，写端在确认动作时跨过网关送达 CRM 做强事务提交，而由 CRM 发出的任意更改，则经被动 Webhook/CDC 反向分发至 Azure 异步中台同步覆写更新 Dataverse 投影。 || The customer requires a near-real-time bidirectional loop (legacy CRM ↔ mobile frontline) without tightly-coupling network hops that ruin screen response. The three architectures below map data staging, consensus validation, and fallback persistence. Option C—our recommendation—features three non-blocking tracks: reads query Dataverse projections immediately, confirmed saves push firmly past the gateway for CRM synchronous transactions, and asynchronous Webhooks or CRM CDCs inversely publish side-effects towards the Azure hub, continuously refreshing the Dataverse projection footprint safely.

:::comparison { title: "数据策略：与既有 CRM 共存的三种方式 || Data Strategy: Three Ways to Co-Exist with the Legacy CRM" }
::versus 方案 A || Option A
### 全量复制 / 迁移过渡 || Full Replication / Migration Transition
Dataverse 保存完整业务副本，App 主要在本地操作；由双向同步中台负责将 Dataverse 与被动 CRM 上的各自变化持续进行双线对齐。适合已有明确迁移终点的项目，不适合作为长期无边界双写。迁移期必须逐实体或字段限定单一写入方。 || Dataverse stores a full business replica and the app primarily uses it locally; a bidirectional sync hub continuously aligns changes originated in either Dataverse or legacy CRM. This fits programs with a defined migration destination, not indefinite unrestricted dual write. A single writer must be assigned per entity or field during transition.

::versus 方案 B || Option B
### 实时接口调用（REST API / MCP） || Live API Calls (REST / MCP)
Dataverse 不参与 CRM 业务数据链路。App 和 Agent 的每次业务读写都经 Custom Connector、API Management 与 CRM API 同步完成；未提交草稿只保留在 App 本地或会话状态，遥测进入 Application Insights。这里的“直连”指不经过业务副本，不是绕过 APIM 治理直接访问数据库。数据最接近 CRM 当前值，但页面响应与可用性直接继承网络和 CRM 波动。 || Dataverse does not participate in the CRM business-data path. Every business read and write from the app or agents completes synchronously through Custom Connector, API Management, and CRM APIs. Unsubmitted drafts remain in local app or session state, while telemetry goes to Application Insights. Direct means no business replica, not bypassing APIM governance to access the database. Values are closest to current CRM state, but screen response and availability inherit network and CRM variance.

::versus 方案 C（推荐） || Option C (recommended)
### 近实时投影 + 按需实时校验 || Near-Real-Time Projection + On-Demand Live Validation
CRM 权威实体通过其可用的 Webhook/CDC 向服务总线反向外送状态，严密刷新 Dataverse 中的只读记录投影。App 移动页默认直接渲染投影实现秒开；仅在订单提交与核心验证动作阶段，才利用穿透网关实施实时交易。正反链路异步分离。 || Authoritative legacy CRM records reverse-publish changes to the event bus via CDC, strictly updating read-only Dataverse projections. Mobile screens consume projections locally for instant response; only crucial actions penetrate the gateway for live transaction completions. Forward and reverse tracks are asynchronously decoupled.
:::

| 维度 || Dimension | A · 全量复制 || A · Full Replication | B · 实时直连 || B · Live API | C · 近实时投影（推荐） || C · Near-Real-Time Projection (Recommended) |
| --- | --- | --- | --- |
| 权威数据边界 || Authority Boundary | 迁移期按实体 / 字段指定单一写入方 || Single writer assigned per entity or field during transition | CRM 是唯一业务数据源 || CRM is the sole business data source | CRM 管权威实体；Dataverse 管草稿、AI 元数据与只读投影 || CRM owns authoritative entities; Dataverse owns drafts, AI metadata, and read-only projections |
| 默认读取路径 || Default Read Path | Dataverse 全量副本 || Full Dataverse replica | 每次请求实时访问 CRM || Every request reaches CRM live | Dataverse 近实时投影 || Near-real-time Dataverse projection |
| 读取新鲜度 || Read Freshness | 取决于同步延迟与冲突处理 || Depends on sync lag and conflict handling | 请求成功时读取 CRM 当前值 || Current CRM value when the request succeeds | 事件驱动近实时；显示源版本、更新时间与投影延迟 || Event-driven near real time; source version, updated time, and projection lag are visible |
| 交互时延确定性 || Interaction Latency Predictability | 高：主要本地读取 || High: primarily local reads | 低：继承跨网络与 CRM 响应波动 || Low: inherits network and CRM response variance | 高：普通页面本地读，关键动作才同步调用 || High: normal screens read locally; only critical actions call live |
| 强一致动作 || Strongly Consistent Actions | 必须先定义当前权威写入方 || Requires a currently authoritative writer | 直接在 CRM 中完成 || Completed directly in CRM | 价格、库存、订单与最终提交实时校验；失败时禁止用旧值完成交易 || Price, inventory, order, and final submit validate live; stale values cannot authorize a transaction on failure |
| 移动与离线 || Mobile and Offline | 可支持完整副本范围内的离线 || Can support offline use within the replicated scope | 仅能保存本地草稿 || Local drafts only | 投影与草稿可离线；强一致动作等待联网 || Projections and drafts can be offline; strong-consistency actions wait for connectivity |
| 故障时用户体验 || Failure Experience | 继续本地操作，但可能产生待解决冲突 || Local work continues but may create conflicts | 页面等待、失败或功能不可用 || Screens wait, fail, or become unavailable | 展示带时间戳的投影；实时校验超时则标记不可确认或转待处理 || Show timestamped projection; timed-out live validation becomes unavailable for confirmation or pending |

| 维度 || Dimension | A · 全量复制 || A · Full Replication | B · 实时直连 || B · Live API | C · 近实时投影（推荐） || C · Near-Real-Time Projection (Recommended) |
| --- | --- | --- | --- |
| 正向提交 (App → CRM) || Forward Submit (App → CRM) | 写入 Dataverse 全量副本，由异步中台推送至 CRM || Write to Dataverse replica, asynchronous hub pushes to CRM | 经访问网关的同步 API 调用直接写入 CRM || Synchronous API via gateway writes directly to CRM | 前端验证拦截 → 经同步网关直达 CRM 做强事务提交 || Frontend validation → gateway → CRM synchronous transaction |
| 反向同步 (CRM → App) || Reverse Sync (CRM → App) | CRM 端产生变更后，由异中台主动拉回并处理写回冲突 || CRM-side changes are pulled back by hub handling conflicts | 无需持久同步，前端在发起拉取请求时直接拿到 CRM 实时态 || No persistent sync; frontend gets CRM live state on fetch | CRM 借由 Webhook / CDC 流式按序分发，异步刷新平台投影 || CRM spins Webhook/CDC stream continuously refreshing projections |
| 冲突风险 || Conflict Risk | 高，需要字段级规则与人工处置 || High; requires field-level rules and manual resolution | 低，CRM 内部处理并发 || Low; CRM handles concurrency | 中低；投影只读，命令用源版本检测并发变化 || Medium-low; projection is read-only and commands detect concurrent change by source version |
| 后台 CRM 依赖 || Backend CRM Dependency | 需要全量导出、增量变更与映射能力 || Requires full export, incremental changes, and mapping | 需要覆盖全部交互的稳定 API || Requires stable APIs for every interaction | 需要变更源或增量查询，并为少量关键动作提供 API || Requires a change feed or incremental query plus APIs for a small set of critical actions |
| 恢复与对账 || Recovery and Reconciliation | 双向重放、冲突队列与全量对账 || Bidirectional replay, conflict queue, and full reconciliation | API 重试与后台事务结果查询 || API retries and backend transaction-status lookup | 检查点、重复控制、失败恢复与周期对账；具体机制由适配器决定 || Checkpoints, duplicate control, failure recovery, and periodic reconciliation; exact mechanisms depend on the adapter |
| 可观测指标 || Observability Metrics | 双向同步延迟、积压与冲突率 || Bidirectional lag, backlog, and conflict rate | API P50 / P95、超时率与 CRM 可用性 || API P50/P95, timeout rate, and CRM availability | 投影延迟、同步检查点、失败变更、实时校验超时与命令状态 || Projection lag, synchronization checkpoint, failed changes, live-validation timeout, and command state |
| 实施与运维复杂度 || Delivery and Operations Complexity | 高：全量模型、双向同步与迁移治理 || High: full model, bidirectional sync, and migration governance | 初期较低；API 覆盖扩大后运维压力随调用量增长 || Lower initially; operational pressure grows with API surface and traffic | 中：需建设投影和同步适配器；复杂度取决于 CRM 接口能力与既有集成平台 || Medium: requires a projection and synchronization adapter; complexity depends on CRM interfaces and the existing integration platform |

“近实时”不是固定秒数承诺。试点期应根据 CRM 变更能力和地区网络实测，确定投影延迟 SLO、新鲜度阈值、实时校验超时预算与允许进入 Pending 的动作范围。 || Near real time is not an unmeasured fixed-seconds promise. The pilot should use the CRM's change capabilities and regional network measurements to set the projection-lag SLO, freshness threshold, live-validation timeout budget, and the actions allowed to enter Pending.

:::diagram { src: "./media/data-option-a.zh.svg?v=20260812r", drawio: "./media/data-option-a.drawio", title: "方案 A：全量复制与迁移过渡 || Option A: Full Replication and Migration Transition" }
适用边界：已经确定迁移到 Dataverse，并能在过渡期限定单一写入方。 || Fit: a Dataverse migration destination is confirmed and a single writer can be enforced during transition.
:::

:::diagram { src: "./media/data-option-b.zh.svg?v=20260812r", drawio: "./media/data-option-b.drawio", title: "方案 B：实时接口直连 || Option B: Live API Integration" }
适用边界：网络稳定、CRM API 覆盖完整，并能接受后台链路决定页面响应。 || Fit: stable networks, complete CRM API coverage, and acceptance that backend latency determines screen response.
:::

:::diagram { src: "./media/data-option-c.zh.svg?v=20260812r", drawio: "./media/data-option-c.drawio", title: "方案 C：近实时投影与按需实时校验 || Option C: Near-Real-Time Projection with On-Demand Live Validation" }
推荐原因：普通页面不等待后台网络，关键交易仍以 CRM 当前值为准。我们通过解耦前端提交链路与后端投影更新链路，实现了在保障关键动作强一致的同时，规护页面免受非必要网络抖动的影响。 || Recommendation: normal screens do not wait on the backend network, while critical transactions still use current CRM values. We decoupled the frontend submission route from the projection update route, preventing erratic network jitter from blocking routine interactions while ensuring strong consistency for crucial validations.
:::

| 数据范围 || Data Scope | 权威数据源 || Authoritative Source | App 默认读取 || App Default Read | 写入与一致性规则 || Write and Consistency Rule |
| --- | --- | --- | --- |
| 客户、联系人、商机、活动 || Accounts, contacts, opportunities, activities | 既有 CRM || Legacy CRM | Dataverse 只读投影，显示源版本与更新时间 || Read-only Dataverse projection with source version and updated time | 编辑先形成草稿；确认后发送带操作键和源版本的命令，CRM 确认后更新投影 || Edits first become drafts; confirmation sends a command with operation key and source version; CRM acknowledgement updates the projection |
| 报价、价格、库存、订单 || Quotes, price, inventory, orders | 既有 CRM || Legacy CRM | 可显示投影摘要，但必须标注更新时间 || Projection summaries may be shown with an updated timestamp | 查看关键值或最终提交时实时校验；超时后不得用投影旧值完成交易 || Validate live for critical values or final submission; a timeout cannot fall back to stale projected values to complete the transaction |
| AI 草稿、摘要、置信度、会话与同步状态 || AI drafts, summaries, confidence, conversations, sync state | Dataverse | Dataverse | 由 App 和 Agent 创建；状态使用 Draft、Pending Sync、Synced、Failed、Conflict || Created by the app and agents; states are Draft, Pending Sync, Synced, Failed, and Conflict |
| 拜访照片与设备铭牌 || Visit photos and device nameplates | Azure Blob Storage；CRM 保存业务关联 || Azure Blob Storage; CRM stores the business relationship | Dataverse 保存引用与处理状态 || Dataverse stores references and processing state | 上传完成后再发布关联命令；失败可重试，不重复创建业务记录 || Publish the relationship command after upload; retries must not duplicate the business record |

## #agent-map 07 / Agent Map :: Agent 全景规划 || Agent Landscape

在客户给出的 Agent 全景图基础上，本方案按销售生命周期横向编排 Agent 体系：从市场线索、客户经营、商机与招投标，到订单履约、安装售后，并以一组通用支撑 Agent 贯穿全程。每个阶段内的 Agent 按业务流程的先后顺序竖向排列，并标注哪些进入 Phase 1 落地（核心高频）、哪些列为 Phase 2+ 后续扩展。 || Building on the customer's agent landscape, this proposal arranges the agent system along the sales lifecycle: from market and lead, account engagement, opportunity and bidding, through order fulfillment and install-and-service, with a set of generic-support agents spanning the whole journey. Within each stage, agents are listed vertically in workflow order, marked for Phase 1 priority (high-frequency core) or Phase 2+ later expansion.

1

### 市场与线索 || Market & Lead

1. 市场扫描 Agent || Market Scan Agent
2. 竞品分析 Agent || Competitive Analysis Agent
3. 线索获取 Agent || Lead Capture Agent

2

### 客户经营 || Account Engagement

1. 客户画像 Agent || Customer Profile Agent
2. 客户拜访 Agent || Customer Visit Agent
3. 活动创建 Agent || Activity Creation Agent
4. 工作总结 Agent || Daily Summary Agent

3

### 商机与招投标 || Opportunity & Bidding

1. 商机创建 Agent || Opportunity Creation Agent
2. 商机评估 Agent || Opportunity Scoring Agent
3. 销售/需求预测 Agent || Sales / Demand Forecast Agent
4. 标书分析 Agent || Tender Analysis Agent
5. 投标文件 Agent || Bid Document Agent
6. 标书制作 Agent || Tender Authoring Agent
7. 商机督导 Agent || Opportunity Coaching Agent

4

### 订单履约 || Order Fulfillment

Phase 2+ · 后续实现 || Phase 2+ · Later

1. 报价 Agent || Quoting Agent
2. 下单 Agent || Order Placement Agent
3. 订单审核 Agent || Order Approval Agent
4. 运费核算 Agent || Freight Costing Agent
5. 订单查询 Agent || Order Inquiry Agent
6. 物流查询 Agent || Logistics Inquiry Agent

5

### 安装与售后 || Install & Service

Phase 2+ · 后续实现 || Phase 2+ · Later

1. 智能派单 Agent || Smart Dispatch Agent
2. 现场服务 Agent || Field Service Agent
3. 故障识别 Agent || Fault Diagnosis Agent
4. 维修知识检索 Agent || Repair Knowledge Agent
5. 备件推荐 Agent || Spare Parts Agent
6. 质量分析 Agent || Quality Analytics Agent
7. 预测性维护 Agent || Predictive Maintenance Agent

＋

### 通用支撑·底座能力（贯穿全部阶段） || Generic Support · Foundation (spans every stage)

Phase 2+ · 后续实现 || Phase 2+ · Later

1. 指标分析 Agent || KPI Analytics Agent
2. 会议纪要 Agent || Meeting Minutes Agent
3. 流程卡点 Agent || Process Bottleneck Agent
4. 智能知识库 Agent || Knowledge Base Agent
5. 文件审核 Agent || Document Review Agent
6. PPT/Excel 助手 || PPT / Excel Assistant

横向为销售生命周期阶段（①→⑤），阶段内 Agent 自上而下按业务流程顺序排列；通用支撑作为底座能力，横跨五个阶段贯穿全程。橙色 P1 标记 = Phase 1 优先落地（高频 · 直接服务一线拜访），集中在客户经营与商机阶段；订单履约、安装售后与通用支撑列为 Phase 2+ 后续实现。 || Columns are sales-lifecycle stages (①→⑤); within each stage, agents are ordered top-down by workflow. Generic support is the foundation layer, spanning all five stages end to end. The orange P1 mark = Phase 1 priority (high-frequency · directly serves field visits), concentrated in account engagement and opportunity; order fulfillment, install-and-service, and generic support are deferred to Phase 2+.

## #agent-architecture 08 / Agent Architecture :: 多 Agent 协同：30+ Agent 如何共同回答一句话 || Multi-Agent Orchestration: How 30+ Agents Answer One Sentence Together

Agent 全景图回答了"有哪些 Agent"，本节回答它们如何分工。Microsoft Copilot Studio 的 Generative Orchestration 作为调度核心，Agent 分成调度、业务域和工具三层；新业务 Agent 在业务域层注册能力并声明工具依赖，不直接改动其他 Agent。 || The Agent Map answers which agents exist; this section explains how responsibilities are divided. Microsoft Copilot Studio Generative Orchestration is the dispatcher, with agents organized into orchestration, domain, and tool tiers. A new domain agent registers its capability and tool dependencies without directly changing other agents.

Tier 1 · 调度 || Tier 1 · Dispatch

### Orchestrator Agent —— 一个，全局唯一 || Orchestrator Agent — single, global

由 Copilot Studio 的 Generative Orchestration 充当。它不执行业务逻辑，只处理需要对话推理、跨业务域查询或多 Agent 合成的请求。CopilotChat 与 Teams 对话进入 Orchestrator；ActivityCapture 等目标操作明确的录入流程在 Copilot Studio AI Tool / Workflow 完成字段处理后，可由 Code App 服务层直接执行 Connector，不进入本层。 || Copilot Studio Generative Orchestration fills this role. It owns no business logic and handles only requests requiring conversational reasoning, cross-domain queries, or multi-agent composition. CopilotChat and Teams conversations enter the Orchestrator; after Copilot Studio AI Tool / Workflow field processing, deterministic capture flows such as ActivityCapture can execute the connector directly from Code App without entering this tier.

Generative Orchestration（内置） || Generative Orchestration (built-in)

▼

Tier 2 · 业务 || Tier 2 · Domain

### Domain Agents —— 与业务概念一一对应 || Domain Agents — one per business concept

即 Agent 全景中列出的 30+ Agent。每个 Agent 拥有自己的 system prompt、知识源（Dataverse 投影 / 既有 CRM 实时校验接口 / 知识库）与可调用工具集。Domain Agent 之间默认不直接互调，统一由 Orchestrator 串联，避免硬编码依赖。 || These are the 30+ agents in the Agent Landscape. Each owns its system prompt, knowledge sources (Dataverse projections / legacy-CRM live-validation APIs / knowledge bases), and callable tools. Domain agents do not call one another directly by default; the Orchestrator composes them to avoid hard-coded dependencies.

客户画像 / 商机评估 / 活动创建 … || Customer Profile / Opportunity Scoring / Activity Creation …

订单查询 / 物流查询 / 现场服务 … || Order Inquiry / Logistics / Field Service …

见 Agent 全景 || See Agent Landscape

▼

Tier 3 · 工具 || Tier 3 · Tools

### Skill / Tool Layer —— Code App 与 Agent 共用 || Skill / Tool Layer — Shared by Code App and Agents

原子能力，单一职责。包括既有 CRM Connector、Dataverse CRUD、Copilot Studio AI Tool（Prompt）、Workflow（表单处理、实体抽取、分类与多步事务）、Azure AI Search、Power Automate Flow 等。确定性工具可由 Code App 服务层直接调用，也可作为 Domain Agent 工具；两种调用方式使用相同的连接引用、DLP 与权限策略。 || Atomic single-purpose capabilities include the legacy CRM connector, Dataverse CRUD, Copilot Studio AI Tool (Prompt), Workflow (form processing, entity extraction, classification, and multi-step transactions), Azure AI Search, and Power Automate flows. Deterministic tools can be called directly by the Code App service layer or exposed as domain-agent tools; both invocation modes use the same connection references, DLP, and permission policies.

既有 CRM Connector || Legacy CRM Connector

Dataverse CRUD

Copilot Studio AI Tool (Prompt)

Workflow：表单 / 抽取 / 分类 || Workflow: Forms / Extraction / Classification

Azure AI Search（Phase 3） || Azure AI Search (Phase 3)

Power Automate Flow

设计原则：上层只调下层，禁止跨层级调用；任何新 Agent 加入只需在 Tier 2 注册并声明所需 Tier 3 工具，Orchestrator 通过描述自动学会调度。 || Rule: each tier only calls the tier below; cross-tier calls are not permitted. Adding a new agent means registering at Tier 2 and declaring its Tier 3 tools — the Orchestrator learns to dispatch via descriptions, no code change needed.

## #worked-example 09 / Worked Example :: 方案 C 如何完成一句话拜访录入 || How Option C Completes One-Sentence Visit Capture

销售说一句话后，Orchestrator 与 5 个业务 Agent 并行或串行协作。客户与商机信息默认从 Dataverse 投影读取；只有投影过期或最终确认涉及并发变化时才访问 CRM 实时接口。用户确认后产生带操作键和源版本的命令，后台处理结果通过同步状态回到 App。 || After the seller speaks one sentence, the Orchestrator and five domain agents collaborate in parallel or sequence. Account and opportunity data read from Dataverse projections by default; the live CRM API is used only when a projection is stale or final confirmation must detect concurrent change. User confirmation creates a command with an operation key and source version, and the backend result returns to the app through synchronization state.

刚拜访完上海仁济医院张主任，他对监护仪 N17 感兴趣，要 12 台，下周三再约一次定标书细节。 || Just visited Dr. Zhang at Shanghai Renji Hospital — he wants 12 units of Monitor N17 and asked for a follow-up next Wednesday to finalise the tender.

Orchestrator

识别意图为「活动录入 + 商机线索」，决定走「顺序流水 + 审阅闭环」组合模式。 || Detects intent as "activity capture + opportunity lead"; chooses Sequential + Review-Loop composition.

工具：Generative Orchestration · 路由耗时 ≈ 200 ms || Tool: Generative Orchestration · routing ≈ 200 ms

Workflow

抽出客户=上海仁济医院、联系人=张主任、产品=监护仪 N17、数量=12、下次跟进=下周三。 || Extracts customer = Shanghai Renji Hospital, contact = Dr. Zhang, product = Monitor N17, qty = 12, next follow-up = next Wed.

工具：Workflow 实体抽取（Copilot Studio AI Tool + 自定义 schema） || Tool: Workflow entity extraction (Copilot Studio AI Tool + custom schema)

客户画像 Agent || Profile Agent

并行查询 Dataverse 客户投影：仁济医院已存在，最近 30 天 4 次拜访 · 信用 A 级 · 已签 MSA；结果同时显示 CRM 源版本与投影更新时间。 || Queries the Dataverse account projection in parallel: Renji Hospital exists · 4 visits in the last 30 days · credit grade A · MSA in place; the result also shows the CRM source version and projection timestamp.

工具：Dataverse 只读投影 · 过期时才走 Custom Connector → APIM → CRM || Tool: read-only Dataverse projection · stale records only use Custom Connector → APIM → CRM

活动创建 Agent || Activity Creation

生成 Activity draft（type=Visit, date=今天, 摘要 = 三句话, 下次 follow-up=下周三日历占位）。 || Produces Activity draft (type=Visit, date=today, 3-sentence summary, follow-up = next Wed calendar placeholder).

工具：Dataverse 草稿表 · Outlook Calendar || Tool: Dataverse draft table · Outlook Calendar

商机创建 Agent || Opportunity Creation

检索到对该客户已存在监护仪 N17 商机（Identify 阶段）→

不创建新商机

，建议追加为既有商机的活动证据。

工具：Dataverse 商机投影 · CRM 源版本校验 · 重复检测规则 || Tool: Dataverse opportunity projection · CRM source-version validation · duplicate rule

商机督导 Agent || Opp Coaching

校验：12 台 N17 + Identify 阶段 + 客户级 A → 触发"阶段建议升级到 Qualify"提示，附建议下一步：发送报价。 || Validates: 12× N17 + Identify stage + grade-A customer → suggests "upgrade stage to Qualify", with next-step recommendation: send quote.

工具：业务规则引擎（Power Fx） || Tool: business rule engine (Power Fx)

Orchestrator

把 5 段 Agent 输出合成一段回复和一张可确认的草稿卡；用户确认后写入命令记录与操作键，状态先变为 Pending Sync，CRM 确认后再变为 Synced。 || Composes the five agent outputs into one reply and a confirmable draft card. Confirmation persists a command record and operation key, changes state to Pending Sync, and moves to Synced only after CRM acknowledgement.

端到端分段：语音转写完成 ≤ 1秒 · UI 堆出初始 draft ≤ 4秒 · 6 Agent 全部推理完成 ≤ 12秒 (P50)。UI 以边到边流式渲染掩盖总时长。 || End-to-end, phased: speech transcription ≤ 1 s · initial draft on screen ≤ 4 s · full 6-agent reasoning ≤ 12 s (P50). The UI masks total duration with edge-to-edge streaming render.

:::flow
1. **默认读取投影 || Read the Projection by Default** — 客户、联系人、商机与活动页面直接读取 Dataverse 只读投影，页面响应不等待后台 CRM 网络。 || Account, contact, opportunity, and activity screens read the Dataverse projection directly, so screen response does not wait on the backend CRM network.
2. **检查新鲜度 || Evaluate Freshness** — App 根据源版本、更新时间和配置的新鲜度阈值决定是否接受投影，并把“更新于何时”显示给用户。 || The app uses source version, update time, and a configured freshness threshold to decide whether to accept the projection and shows when it was updated.
3. **关键动作按需实时校验 || Validate Critical Actions Live** — 投影过期，或操作涉及价格、库存、订单与最终提交时，经 Custom Connector 和 APIM 查询 CRM 当前值。 || When a projection is stale or an action involves price, inventory, orders, or final submission, Custom Connector and APIM query the current CRM value.
4. **超时后按业务风险降级 || Degrade by Business Risk After Timeout** — 普通查看可继续展示带时间戳的投影；强一致动作标记为不可确认或转 Pending，不允许用旧值完成交易。 || Normal viewing may continue with a timestamped projection; strongly consistent actions become unavailable for confirmation or move to Pending and cannot complete with stale values.
:::

:::flow
1. **Draft** — Agent 生成可编辑草稿，尚未影响 CRM 权威记录。 || The agent creates an editable draft that has not changed the authoritative CRM record.
2. **Pending Sync** — 用户确认后保存命令、操作键、源版本和同步状态，再由 CRM 同步适配器按既有 CRM 的接口契约处理。App 无需保持请求直到 CRM 完成。适配器的部署技术在接入调研后确定。 || After confirmation, the command, operation key, source version, and synchronization state are stored. The CRM synchronization adapter then processes the command according to the legacy CRM contract. The app does not hold the request open until CRM completes; the adapter technology is selected after integration discovery.
3. **按 CRM 能力控制重试 || Control Retries by CRM Capability** — CRM 支持幂等键或条件写时，适配器可自动重试；对于超时等结果不确定的调用，先查询事务状态并进入对账，不做盲目重试。 || When CRM supports idempotency keys or conditional writes, the adapter may retry automatically. For timeouts and other uncertain outcomes, it queries transaction status and reconciles instead of retrying blindly.
4. **结果回传 || Return the Outcome** — CRM 确认后状态变为 Synced 并刷新投影；并发变化进入 Conflict，无法自动恢复的结果进入 Failed 和人工对账。具体失败队列与重放方式由所选同步技术提供。 || CRM acknowledgement changes state to Synced and refreshes the projection. Concurrent changes become Conflict, while outcomes that cannot recover automatically become Failed and enter operator reconciliation. The selected synchronization technology determines the failure queue and replay mechanism.
:::

## #benefits 10 / Expected Benefits :: 方案期望收益 || Expected Benefits

收益从"销售个人体验"、"业务过程质量"、"组织规模化能力"三个维度展开。下列指标为本方案的设计目标值，需要在 Phase 1 试点期间通过实际测量校准基线，避免空泛承诺。 || Benefits are framed across three dimensions: sales experience, process quality, and organisational scalability. The metrics below are design targets — Phase 1 pilots must establish a measured baseline to avoid empty promises.

A · SALES EXPERIENCE

### 降低一线录入负担、提升工具采用意愿 || Lower Capture Burden, Raise Tool Adoption

面向销售个人：录入更快、表单更少、体验更顺，腾出更多面向客户的时间。 || For the individual rep: faster capture, fewer forms, smoother experience, freeing more time for customer-facing work.

A1

### 拜访录入方式 || Visit Capture Mode

回程补录 → 现场即录 || Return-Trip Catch-Up → On-Site Capture

当前路径是事后回酒店打开桌面端补录，每次耗时 5–15 分钟；本方案将录入移至拜访现场，以口述录音生成活动反馈 + 商机草稿，压缩单次录入耗时，具体降幅于试点期实测。 || Today, capture happens after hours on a desktop back at the hotel, taking 5–15 minutes each time; this proposal moves capture to the visit site, using a spoken recording to generate the activity log + opportunity draft, compressing per-entry time, with the actual reduction measured during the pilot.

单次录入耗时 · 试点期测真实分布 || Per-entry time · pilot measures actual distribution

A2

### 每日"被表单消耗"的时间 || Daily Time Burned on Forms

显著下降 || Substantial drop

表单转为 AI 草稿 + 用户确认；销售每天用于行政性维护的时间下降，腾出客户面对面时间。 || Forms become AI drafts + user confirmation; daily time spent on administrative upkeep falls, freeing up face-time with customers.

销售时间日志或问卷自报告 || Sales time logs or self-reported surveys

A3

### 系统使用意愿（NPS） || System Usage Intent (NPS)

被迫用 → 主动用 || Forced → Voluntary

用 NPS / CSAT 测量；目标从当前桌面 CRM 的低意愿区间提升至高意愿区间。 || Measured by NPS / CSAT; the target is to move from the current desktop CRM's low-willingness band into a high-willingness band.

Phase 1 与 Phase 2 末分别测量 || Measure at end of Phase 1 and Phase 2

B · PROCESS QUALITY

### 让业务数据更新鲜、更完整、更可决策 || Make Business Data Fresher, Fuller, More Decision-Ready

面向流程与数据：缩短从动作到落库的时延，提升商机识别与售后响应。 || For process and data: shorten the gap between action and persistence; improve opportunity discovery and after-sales response.

B1

### 商机识别覆盖率 || Opportunity Discovery Coverage

显著上升 || Substantial uplift

商机评估 Agent 主动从拜访摘要识别潜在线索并提示确认，把"靠人脑判断"变成"AI 提示 + 人工确认"，减少漏报。 || The Opportunity Scoring Agent proactively detects leads from visit summaries and prompts for confirmation, replacing rely-on-human-judgement with AI-suggest + human-confirm and reducing misses.

商机新建数 / 拜访数比值 || New opportunities / visits ratio

B2

### 数据质量一致性 || Data Quality & Consistency

必填字段完整度 ↑ || Required-field completeness ↑

AI 草稿一次填齐 10+ 字段（产品线、信心度、阶段、关联客户等），相比手填"只填关键 3–5 个"，下游分析与预测可用数据增多。 || An AI draft fills 10+ fields in one shot (product line, confidence, stage, linked accounts…) versus the typical hand-filled 3–5 key fields — yielding more usable data for downstream analysis and forecasting.

核心商机字段填写完整率 || Completeness rate of core opportunity fields

B3

### 售后现场响应 || After-Sales On-Site Response

翻阅文档 → 现场即问即答 || Flipping Through Docs → Ask and Answer On-Site

维修知识检索 Agent + 故障识别 Agent 让工程师在现场直接提问获得答案，而非翻阅纸质或桌面文档；Phase 3 上线后直接影响客户感知质量。 || The Repair Knowledge Agent + Fault Identification Agent let engineers ask and get answers on-site instead of flipping through paper or desktop docs; once Phase 3 ships, customer-perceived quality is directly impacted.

是否现场获得答案 + First-Time-Fix 率 || Whether answered on-site + First-Time-Fix rate

C · SCALABILITY

### 让方案在多区域、多语言、低耦合下持续扩展 || Sustain Multi-Region, Multi-Language, Low-Coupling Growth

面向组织能力：交付提速、跨区复用、对既有 CRM 零侵入、可由业务专家共建。 || For organisational capability: faster delivery, cross-region reuse, zero legacy-CRM intrusion, and business-SME co-build.

C1

### 新功能交付节奏 || New-Feature Delivery Cadence

季度 → 周 || Quarters → Weeks

低代码 + Code App + Vibe Coding 让新增 Agent / 字段 / 页面以"天/周"上线，对比既有 CRM 端定制的"季度级"周期。 || Low-code + Code App + Vibe Coding let new agents / fields / pages ship in days or weeks, versus the quarterly cadence of legacy-CRM customisation.

Phase 2 后新增 Agent 平均上线时长 || Average ship time of new agents after Phase 2

C2

### 多语种与多区域复用 || Multi-Language & Multi-Region Reuse

一套 Agent · 多语言开箱 || One agent set · multi-language out of the box

设备原生语音识别支持多语种，转写文本由 Copilot Studio AI Tool 理解；同一套 Agent 可跨区域复用。 || Device-native speech recognition supports multiple languages; transcripts are understood by Copilot Studio AI Tool. The same agent set is reusable across regions.

区域本地化工作量显著低于传统方案 || Regional localisation effort substantially lower than traditional builds

C3

### 对既有 CRM 的侵入度 || Intrusion Into the Legacy CRM

零定制（既有 CRM 不动） || Zero customisation (legacy CRM untouched)

所有写入通过异步回写既有 CRM，不要求既有 CRM 端定制开发，规避与既有 CRM 升级 / 补丁 / 运维节奏的耦合风险。 || All writes go through async writeback into the legacy CRM — no legacy-side customisation required, decoupling from its upgrade / patch / ops cadence.

既有 CRM 仅暴露现有 API，不新增功能 || The legacy CRM only exposes existing APIs; no new features

C4

### Citizen Developer 网络 || Citizen Developer Network

区域业务专家可参与设计 || Regional business SMEs co-design

低代码让区域业务专家参与新 Agent 设计与知识库维护，减少对中央 IT 的瓶颈依赖。 || Low-code lets regional business SMEs help design new agents and maintain knowledge sources, easing the bottleneck on central IT.

Phase 4 起逐区域培养 Maker || Cultivate Makers region-by-region from Phase 4

:::callout { title: "收益度量三原则 || Three Principles of Benefit Measurement" }
① 上述指标为设计目标值，必须在 Phase 1 试点期间建立基线后再做对比，杜绝"未实施先承诺"；② 每个指标都对应可持续监测的数据源（用户行为日志 + Agent 调用日志 + Dataverse 业务读出），通过 Power Apps 自定义页面与 Dataverse 视图直接呈现；③ 每季度公布一次度量结果，未达标的指标进入下一季度的 Agent / 体验优化清单。 || (1) The figures above are design targets — they must be compared against a baseline established during Phase 1, ruling out promise-before-implement. (2) Every metric maps to a continuously observable data source (user behaviour logs + agent invocation logs + Dataverse business reads), surfaced directly via Power Apps custom pages and Dataverse views. (3) Results are published quarterly; any metric missing target enters the next quarter's agent / experience optimisation backlog.
:::

## #licensing 11 / Recommended Product Configuration :: 建议产品配置 || Recommended Product Configuration

下表按 Microsoft 产品 / SKU 列出承担的用途、适配的用户角色与估算逻辑，可直接对应客户的人头规模估算量级。具体单价以微软官方报价或合作伙伴报价为准。 || The table below lists, by Microsoft product / SKU, the purpose served, target user roles, and sizing logic, mapping directly onto the customer's headcount for order-of-magnitude estimation. Actual unit prices follow official Microsoft or partner quotes.

| SKU | 用途 || Purpose | 适配用户角色 || Target User Roles | 估算逻辑 || Sizing Logic |
| --- | --- | --- | --- |
| Power Apps Premium | 移动 App 运行时：解锁 Premium 连接器（含既有 CRM / Custom）、Dataverse 完整能力、Custom Pages 与 Mobile App。 || Mobile app runtime: unlocks Premium connectors (incl. legacy CRM/Custom), full Dataverse, custom pages, and Mobile App. | 一线销售 / 服务工程师、区域经理 / 业务管理员、公民开发者 / Maker || Field Sales / Service Engineers, Regional Managers / Business Admins, Citizen Developers / Makers | 按命名用户计费（per named user / month）：授权数 = 实际使用该移动 App 的销售 / 服务 / 管理者 / Maker 人数。订阅后人数可随阶段推广逐月增减。 || Per named user per month: licence count = number of sales / service / managers / makers actually using the mobile app. Headcount can be added month-over-month as rollout phases progress. |
| Copilot Studio User | Agent 编辑/发布权限：用于编排框架、新 Agent 设计、知识源维护。 || Agent authoring/publishing entitlement: for orchestration framework, new agent design, knowledge source maintenance. | 公民开发者 / Maker、中央 IT 编排团队 || Citizen Developers / Makers, Central IT orchestration team | 按 Maker 头数计费（per maker / month）：授权数 = 具备 Agent 编辑 / 发布 / 知识源维护职责的内部人员数（中央 IT 编排团队 + 各业务域 Maker）。不与使用 App 的消费者人数挂钩。 || Per maker per month: licence count = internal staff with agent authoring / publishing / knowledge-source maintenance responsibilities (central IT orchestration team + per-domain makers). Decoupled from app consumer headcount. |
| Copilot Studio Credits | 统一计量的运行时与 AI 能力消耗：覆盖意图路由 → Agent 调用的对话消息，以及 Prompt(GPT)、表单识别 / OCR、实体抽取、分类等预构建 AI 能力，前端 Code App 与编排层 Agent 共用。 || Unified meter for runtime + AI consumption: covers intent routing → agent conversation messages plus Prompt(GPT), form processing/OCR, entity extraction, classification prebuilt capabilities — shared by the front-end Code App and orchestration agents. | 租户级（不与人头绑定，由各 Agent 共享） || Tenant-level (not per-user; shared across agents) | 按用量预付 Credits 包（租户级共享，不与人头绑定）。计入 Credits 的内容：Agent 对话消息（含 Orchestrator 路由与各业务 Agent 调用）、Prompt(GPT) 调用、表单识别 / OCR、实体抽取、分类等 AI Builder 预构建能力。 || Prepaid Credits pack by usage (tenant-level shared, not per-user). Metered against Credits: agent conversation messages (Orchestrator routing and business agent calls), Prompt(GPT), form processing / OCR, entity extraction, classification and other AI Builder prebuilt capabilities. |
| Dataverse Capacity | 预留 Dataverse 数据库、文件与日志容量，承载 AI 元数据、对话日志、知识源缓存。 || Reserve Dataverse database, file and log capacity for AI metadata, conversation logs, and knowledge source caches. | 租户级（平台 / 中央 IT 持有） || Tenant-level (owned by Platform / Central IT) | 按容量包计费：数据库（GB）+ 文件（GB）+ 日志（GB）三个维度分别计量，实际容量需根据客户客户 / 活动 / 商机 / 对话日志数量与保留期限推算。 || Billed by capacity packs across three dimensions: database (GB) + file (GB) + log (GB). Actual capacity must be derived from the customer's customer / activity / opportunity / conversation-log volumes and retention period. |

备注 · 配套 Azure 服务（按用量计费，无需预购授权） || Note · Supporting Azure services (pay-as-you-go, no upfront licence)

- Azure AI Speech — 流式语音识别主路径，按音频分钟 || Azure AI Speech — primary STT path, billed per audio minute
- API Management — 关键数据实时 API 治理；是否采用由客户接口标准决定 || API Management — live API governance for critical data; adoption depends on customer API standards
- Azure 集成服务 — 仅在 CRM 接口调研后被选为同步适配器实现时计费；不作为当前既定依赖 || Azure integration services — billed only if selected as the synchronization-adapter implementation after CRM discovery; not a predetermined dependency
- Key Vault — 凭据托管 || Key Vault — credential vault
- Application Insights / Monitor — 端到端可观测 || Application Insights / Monitor — end-to-end observability
- Blob Storage — 拜访照片 / 设备铭牌等大文件 || Blob Storage — visit photos / device nameplates
- AI Search — Phase 3 售后知识库语义检索 || AI Search — Phase 3 service knowledge semantic search

Azure 部分按月度实际用量结算，前期成本可控、可随业务节奏弹性增减。合规与审计（如 Microsoft Purview）不在本项目预算范围，如需请由合规团队单独评估。 || Azure services bill by actual monthly consumption, keeping early-stage cost controlled and elastic with business pace. Compliance & audit tooling (e.g. Microsoft Purview) is out of scope for this project budget — to be evaluated separately by the compliance team.

## #options 12 / Option Comparison :: 方案对比：总拥有成本、风险与长期演进 || Option Comparison: Total Cost of Ownership, Risk, and Long-Term Evolution

选型的实质并非功能清单的逐项比对，而是总拥有成本与风险结构的权衡。报价单上的产品许可费清晰可见，却只是总账的一部分；价值兑现周期、成本可预测性、风险归属、技术演进的可持续性、对既有微软投资的复用、以及对现行系统的侵入度，才共同决定三年期的实际投入与回报。下文先界定这六个评估维度，再将三条路径逐项对照。 || Choosing a path is not a line-by-line comparison of feature lists but a trade-off across total cost of ownership and risk structure. The product license fee on a quote is clearly visible, yet it is only part of the total: time to value, cost predictability, risk ownership, the sustainability of technical evolution, reuse of existing Microsoft investments, and the degree of intrusion on the incumbent system together determine the real spend and return over three years. Below we first define these six evaluation dimensions, then place the three paths side by side.

显性成本：总拥有成本（TCO）的构成与量级 || Visible cost: the make-up and magnitude of total cost of ownership (TCO)

TCO 由许可、开发、硬件、运维、网络与集成等科目共同构成。下图每行为一条路径——横条越长，三年期总投入量级越大；条内分段按比例显示各成本科目的占比，右侧附一句该路径的成本画像。量级为相对示意，须在选型阶段以实测报价替换。 || TCO is the sum of licensing, development, hardware, operations, network, and integration. Each row below is one path — the longer the bar, the larger the three-year total; the segments show each cost item's share, and a note on the right captures that path's cost profile. Magnitudes are illustrative and must be replaced with quoted figures during selection.

自研 || Custom

全栈自建：开发、运维、硬件、集成与网络全部自担，总拥有成本最高。 || Full custom build: development, operations, hardware, integration, and network all on you — the highest TCO.

多家产品组合 || Multi-Vendor

多家拼接：前端、智能体、AI 算力分属不同厂商，集成与开发叠加，总账居中偏高。 || Multi-vendor stitching: front end, agent, and AI compute span different vendors, so integration and development pile up — a mid-to-high total.

Power Platform

全栈一体：复用既有 M365 与许可，免硬件与专线，开发与运维最轻，总账最低。 || Full-stack on one platform: reuses existing M365 and licenses, no hardware or dedicated lines, lightest development and operations — the lowest total.

产品许可费 || Product license

开发与实施费 || Development & implementation

硬件与基础设施费 || Hardware & infrastructure

运维与支持费 || Operations & support

网络与线路费 || Network & connectivity

集成对接费 || Integration

隐性而决定性的：六个评估维度 || Hidden but decisive: six evaluation dimensions

### 价值兑现周期 || Time to value

从立项到一线真正投入使用、开始产生价值需要多久？是先行投入数月夯实底层，还是数周内即可交付首个可用版本？ || How long from kickoff to the front line actually using it and creating value? Months of groundwork first, or a usable first version within weeks?

自研 || Custom

首个可用版本半年起 || First version in 6+ months

Power Platform

数周内交付首版 || First version in weeks

多家产品组合 || Multi-Vendor

视成熟度与实施伙伴 || Depends on maturity

### 成本可预测性 || Cost predictability

总投入是否可估、可控？是按席位与用量清晰核算，还是随人力投入与返工而逐步偏离预算？ || Is the total spend estimable and controllable? Clearly accounted by seat and usage, or drifting from budget as labor and rework accumulate?

自研 || Custom

难估算、易超支 || Hard to estimate, prone to overrun

Power Platform

许可加用量，报价透明 || License + usage, transparent

多家产品组合 || Multi-Vendor

订阅制，成本同样可预期 || Subscription-based, equally predictable

### 风险归属 || Risk ownership

安全漏洞、合规审查、关键人员流失等风险，由自有团队独立承担，还是由供应商持续保障、共同分摊？ || Who carries risks such as security gaps, compliance review, and the loss of key staff — your own team alone, or a vendor that keeps backing you and shares the load?

自研 || Custom

全数由自有团队承担 || Borne by your team alone

Power Platform

微软持续保障与分摊 || Sustained and shared by Microsoft

多家产品组合 || Multi-Vendor

分摊但单供应商锁定 || Shared yet single-vendor lock-in

### 技术栈收敛度与演进可持续性 || Stack convergence & evolution sustainability

由一个平台贯通前端、数据中台、智能体与 AI 算力，还是由多家产品拼接？栈越分散，跨产品版本对齐与联调维护的隐形成本越高，三年后同步演进越难。 || Are the front end, data middle-tier, agent, and AI compute carried by one platform, or stitched from several vendors? The more fragmented the stack, the higher the hidden cost of cross-product version alignment and joint maintenance, and the harder it is to evolve in lockstep over three years.

自研 || Custom

栈自控，但演进须自追 || Stack self-owned, but evolution self-chased

Power Platform

单栈一体，随产品同步演进 || Single stack, evolves in lockstep with the product

多家产品组合 || Multi-Vendor

多家拼接，版本联调成本高 || Multi-vendor stitching; costly version coordination

### 既有投资的复用度 || Reuse of existing investment

员工已在 Teams、Outlook 中工作，企业已持有 M365 / Copilot 许可。新方案能否直接复用这些资产、延伸至同一群体的其他业务，而非另起增量投入？ || Staff already work in Teams and Outlook; the enterprise already holds M365 / Copilot licenses. Can the new solution reuse these assets and extend to the same users' other scenarios, rather than starting fresh incremental spend?

自研 || Custom

无可复用许可，纯增量 || No reusable licenses, all new

Power Platform

原生复用 M365 / Copilot || Natively reuses M365 / Copilot

多家产品组合 || Multi-Vendor

许可仅限自有平台 || Licenses bound to its platform

### 对现行系统的侵入度 || Intrusion on the incumbent system

部署是否需要改动支撑业务运转的现行 CRM？改动越深，升级、补丁与回归测试的连带风险越高。理想状态是现行系统零改动，仅在其外层叠加能力。 || Does deployment require changing the incumbent CRM the business runs on? The deeper the change, the higher the knock-on risk in upgrades, patches, and regression testing. Ideally the incumbent stays untouched and capability is layered outside it.

自研 || Custom

多需深度改造现行系统 || Often deep rework of the incumbent

Power Platform

现成连接器接入，零侵入 || Connectors, zero-intrusion

多家产品组合 || Multi-Vendor

接入现行系统仍需集成 || Still needs integration

优 || Strong

中 || Fair

弱 || Weak

· 档位表示各路径在该维度上的相对优势 || · Bars indicate each path's relative strength on this dimension

## #roi 13 / ROI Assessment :: 投资回报评估：年化收益、回收期与三年净收益 || ROI Assessment: Annual Benefit, Payback, and Three-Year Net Benefit

本测算从四个维度估算年化收益——一线录入效率、商机漏报减少、自建成本规避与平台复用——并与一次性实施、年度订阅运行及运维成本对照，输出回收期与三年净收益。默认值基于客户提供并经脱敏的销售行为量级；拜访与商机次数受物理与市场条件约束，模型不假设其因方案而增长，效率收益仅来自单次动作的耗时下降。标注为设计假设的参数须在试点阶段以实测基线替换。 || This model estimates annual benefit across four dimensions — frontline capture efficiency, fewer missed opportunities, avoided custom-build cost, and platform reuse — and weighs it against one-time implementation, annual subscription/run, and operations costs to output payback period and three-year net benefit. Defaults are based on customer-provided, de-identified sales-activity volumes; visit and opportunity counts are bound by physical and market conditions, so the model assumes no growth from the solution, and efficiency benefit comes only from reduced time per action. Parameters marked as design assumptions must be replaced with a measured baseline during the pilot.

:::sandbox { id: "agentic-sales-mobile-proposal-sandbox-1", title: "投资回报自助计算器 || Self-Service ROI Calculator", canvas: false }
说明：本模型用于预算量级测算，不替代正式财务审计。一线效率取自脱敏后的动作量与单次省时假设；商机价值按漏报减少保守估算，不计入新增客户；投资成本含订阅、Credit、Dataverse 容量与配套 Azure 用量。所有默认值须在试点阶段以实测基线替换。 || Note: this model is for budget-magnitude estimation and does not replace formal financial audit. Frontline efficiency uses de-identified action volumes and per-action time-saving assumptions; opportunity value is a conservative estimate of fewer missed leads and excludes new customers; investment cost includes subscription, credits, Dataverse capacity, and supporting Azure usage. All defaults must be replaced with a measured baseline during the pilot.
:::

## #delivery-method 14 / Delivery Method :: 交付方式：Plan-First · Vibe Build · ALM Promote || How We Build & Ship: Plan-First · Vibe Build · ALM Promote

本方案采用 Microsoft 官方 Power Platform ALM 与新发布的 Plan Designer，组成三段式交付：Plan-First 规划、Vibe Build 原型构建、ALM Pipeline 生产部署。该模式区别于传统瀑布交付与纯生成式开发，在规划与发布两端均保留人工控制。详细六阶段路线图见《开发者设计文档》。 || This proposal combines Microsoft's official Power Platform ALM with the new Plan Designer into a three-stage delivery pattern: Plan-First planning, Vibe Build prototyping, ALM Pipeline production deployment. Distinct from both waterfall delivery and generation-only development, it retains human control at both the planning and release ends. The full six-stage path lives in the Developer Design Doc.

:::comparison { title: "三段式交付模型 || Three-Stage Delivery Model" }
::versus 阶段 1 · Plan-First || Stage 1 · Plan-First
### 一句话 → 初版 Plan（v0） || One Sentence → Draft Plan (v0)
进 Power Apps Plan Designer，三个官方 Agent（Requirement / Data / Solution）接力生成初版计划（v0，即 Plan Designer 首次自动产出的草案）：用户角色、Dataverse 表与推荐技术栈。后续三轮人审使该 v0 草案收敛到既有 CRM 共生边界，输出锁定的 Data Model + Phase 1 技术清单。 || In Power Apps Plan Designer, three official agents (Requirement / Data / Solution) emit an initial draft plan (v0 — the Plan Designer's first auto-generated draft): user roles, Dataverse tables and a recommended tech mix. Three human-led refine rounds tighten this v0 draft to the legacy-CRM coexistence boundary, producing a locked data model and Phase 1 tech list.

::versus 阶段 2 · Vibe Build || Stage 2 · Vibe Build
### Bootstrap + 一屏一 Prompt || Bootstrap + One Prompt per Screen
一个 Bootstrap 提示词初始化 Solution / Dataverse / Connector / Flow 占位，四屏提示词逐屏生成可演示原型；既有 CRM API 调用、性能敏感视图、安全审计交给 pro-code（PCF / Plug-in / Custom Connector），Vibe 与 Pro-Code 边界由代码与文档显式界定。 || A single Bootstrap prompt scaffolds Solution, tables, connectors and flow stubs; four screen prompts generate UI screen-by-screen. Legacy-CRM API calls, perf-sensitive views and security-audit logic hand off to pro-code (PCF / plug-in / custom connector). The vibe-vs-pro boundary is defined explicitly by code and documentation.

::versus 阶段 3 · ALM Promote || Stage 3 · ALM Promote
### Solution 化 + Pipeline 推送 || Solution-ize + Pipeline Promote
unmanaged Solution 从 Dev 导出，以 SolutionPackager 解包进 Git，prompt 与代码同仓；CI 打出 managed 包，In-product Pipeline 依次推 Test / UAT / Prod，Patch 走 hotfix、Upgrade 走 minor；App Insights 监控拜访完成率、Agent 成功率、既有 CRM 写入时延。 || Unmanaged solution exports from Dev, unpacked via SolutionPackager into Git alongside prompts; CI builds a managed package; the in-product pipeline pushes Test / UAT / Prod with patches for hotfixes and upgrades for minor releases; App Insights tracks visit-completion rate, agent success rate and legacy-CRM write latency.
:::

## #roadmap 15 / Implementation Roadmap :: 实施路线图：6 个月四阶段 || Implementation Roadmap: Six Months in Four Phases

避免"一次性大爆炸式上线"——分四个阶段交付，每阶段有明确的可衡量价值与回退点。3 个月内首个生产 Agent 真实服务销售；6 个月覆盖 Phase 1 标记的全部高频 Agent。 || No big-bang launch — four phased deliveries, each with measurable value and a clear rollback point. The first production agent serves real sales within 3 months; all Phase 1 high-frequency agents go live within 6 months.

Phase 1 · M0–M2

### 地基搭建 + 概念验证2 个月 · 关键里程碑：客户拜访 Agent 在试点区域可用 || Foundations + Proof of Concept2 months · key milestone: Customer Visit Agent live in pilot region

- Power Platform 环境拓扑（Dev / UAT / Prod / 沙盒）与 DLP 策略设计 || Power Platform environment topology (Dev / UAT / Prod / sandbox) and DLP policy design
- 既有 CRM 数据接入：搭建 Custom Connector 供实时查询，并以 Power Automate 调度关键主数据增量同步到 Dataverse（客户 / 活动 / 商机三个核心实体） || Legacy-CRM ingress: Custom Connector for live queries plus Power Automate scheduled incremental sync of key master data into Dataverse (customer / activity / opportunity)
- 体验层最小可用：Power Apps Mobile 主页 + 语音录入 + 拜访卡片 || Experience MVP: Power Apps Mobile home + voice capture + visit card
- 认知层：打通 Azure AI Speech (STT) 流式转写 → Copilot Studio AI Tool + Workflow 字段抽取的端到端拜访录入流程 || Cognitive layer: end-to-end visit capture from Azure AI Speech (STT) streaming to Copilot Studio AI Tool + Workflow field extraction
- 试点：选定 1 个区域 · 10 名销售真实使用 · 收集语料 || Pilot: one selected region · 10 reps in real use · collect corpus

Phase 2 · M3–M4

### 核心 Agent 上线 + 编排框架2 个月 · 关键里程碑：Phase 1 Agent 全部投产 || Core Agents Live + Orchestration Framework2 months · key milestone: all Phase 1 agents in production

- Copilot Studio 编排框架成型：注册中心、Agent 调度、统一对话入口 || Copilot Studio orchestration framework: registry, agent dispatch, unified chat entry
- 商机评估、订单查询、物流查询、客户画像、工作总结 5 个 Agent 上线 || 5 agents go live: Opportunity Scoring, Order Inquiry, Logistics Inquiry, Customer Profile, Daily Summary
- Power Automate 异步回写流程上线（草稿→确认→既有 CRM 同步） || Power Automate async writeback flow live (Draft → Confirm → legacy-CRM sync)
- 试点扩展到 3 个区域 · 100 名销售 || Pilot expands to 3 regions · 100 reps
- 建立 AI 质量基线：意图识别准确率、商机草稿采纳率、平均节省时间 || Establish AI quality baseline: intent accuracy, opportunity draft adoption rate, avg time saved

Phase 3 · M5

### 售后与知识 Agent 拓展1 个月 · 关键里程碑：覆盖售后场景闭环 || Service & Knowledge Agents1 month · key milestone: full after-sales loop covered

- 维修知识检索 Agent + 现场服务 Agent + 备件推荐 Agent || Repair Knowledge Agent + Field Service Agent + Spare Parts Agent
- 智能知识库：以 SharePoint + Dataverse 知识源做 RAG 索引 || Knowledge base: RAG indexing over SharePoint + Dataverse sources
- Microsoft Teams 内置 Copilot 入口，覆盖会议中临时查询 || Copilot in Teams entry covers in-meeting ad-hoc queries
- 区域级运营看板基于 Power Apps 自定义页面 + Dataverse 视图实现，由考核管理 Agent 推送关键洞察 || Regional ops board built on Power Apps custom pages + Dataverse views; KPI Agent pushes key insights

Phase 4 · M6

及以后 || and beyond

### 全球推广 + 持续演进持续 · 关键里程碑：覆盖全部销售人员 || Global Rollout + Continuous EvolutionOngoing · key milestone: all sales reps covered

- 全球推广：分批接入欧洲、亚太、北美、中东等区域 || Global rollout: phase Europe, APAC, North America, Middle East
- 建立 Agent 运营机制：每月一次 prompt/工具优化、新 Agent 评审 || Agent operations cadence: monthly prompt/tool optimisation and new-agent review
- 引入预测性维护、销售预测等高阶 Agent || Introduce advanced agents — predictive maintenance, sales forecasting
- 形成内部 Citizen Developer 培训体系，让区域业务专家参与新 Agent 设计 || Stand up an internal Citizen Developer programme so regional business SMEs co-design new agents

:::callout { title: "风险控制三原则 || Three Principles of Risk Control" }
① 任何 AI 写入操作均经过"草稿确认"，不直接覆盖既有 CRM；② 每个 Agent 都可独立下线/灰度，不影响其他流程；③ 每阶段结束做"销售真实满意度"测量（NPS + 关键流程节省时间），未达标禁止进入下一阶段。 || (1) Every AI write goes through Draft-Confirm; the legacy CRM is never overwritten directly. (2) Every agent can be independently dark-launched or rolled back without affecting other flows. (3) At the end of every phase we measure real sales satisfaction (NPS + time saved on key flows); the next phase cannot start until the bar is met.
:::

## #references 16 / References :: 参考来源 || References

本方案参考了客户提供的"AI 应用 Agent 全景图"与客户既有 CRM 截图，并基于 Microsoft 官方文档构建技术选型。 || This proposal references the customer-provided AI Agent Landscape and the customer's legacy CRM screenshots, with technology choices grounded in official Microsoft documentation.

- [1] Microsoft Power Platform | Power Apps Code App、Power Automate、Power Pages 官方文档 || Official docs for Power Apps Code App, Power Automate, Power Pages
- [2] Power Apps Vibe Coding | 浏览器端 Power Apps Vibe 与 IDE 端 MCP Plugin 的双轨开发模式 || Dual-track development model: in-browser Power Apps Vibe and IDE-side MCP Plugin
- [3] Microsoft Copilot Studio | Generative Orchestration、Agent 注册、Topics/Instructions 与多 Agent 协同机制 || Generative Orchestration, agent registration, Topics/Instructions, and multi-agent coordination
- [4] AI Builder | 预构建与自定义模型：Prompt (GPT)、Form Processing、Entity Extraction、Classification 等（不含 Speech） || Prebuilt and custom models: Prompt (GPT), Form Processing, Entity Extraction, Classification (Speech excluded)
- [5] Azure AI Speech · Speech to Text | 流式 / 批式语音识别，多语种、按音频分钟计费；本方案语音入口的主路径，iOS 系统输入法听写仅作 fallback（WebKit 至今未实现 SpeechRecognition） || Streaming / batch speech recognition, multi-language, billed per audio minute; the primary voice entry in this proposal — iOS system-IME dictation serves only as fallback (WebKit still has not implemented SpeechRecognition)
- [6] Microsoft Dataverse | Virtual Tables 与外部数据源直连模式（含 OData / REST 等外部源） || Virtual Tables and direct connection to external data sources (incl. OData / REST and other external sources)
- [7] Microsoft Entra ID + Purview | 企业级身份与 AI 审计治理参考 || Enterprise identity and AI audit governance reference
- [8] 客户 AI 应用 Agent 全景图（客户提供） | 客户与活动 / 商机 / 订单 / 安装售后 / 考核管理五大业务域 Agent 清单 || Agent inventory across five business domains: customer & activity / opportunity / order / installation & service / KPI management
- [9] 客户既有 CRM 现状截图（客户提供） | 活动列表、记录拜访、商机创建、商机详情等关键流程的现状参考 || Reference views of activity list, record visit, create opportunity, opportunity detail and other key flows
- [10] Azure Architecture Center · CQRS Pattern — https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs | 支撑权威写模型与面向 App 的读取投影分离，以及投影采用最终一致性的边界。 || Supports separating the authoritative write model from app-facing read projections and the eventual-consistency boundary of projections.
- [11] Azure Architecture Center · Materialized View Pattern — https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view | 支撑以可重建投影改善查询与移动读取体验。 || Supports rebuildable projections for query and mobile-read performance.
- [12] Azure API Management · Backends — https://learn.microsoft.com/en-us/azure/api-management/backends | 支撑后台封装、负载分配和受支持层级中的熔断配置；一致性仍由 CRM 事务负责。 || Supports backend encapsulation, load distribution, and circuit-breaker configuration on supported tiers; CRM transactions still own consistency.
- [13] Azure Service Bus · Duplicate Detection — https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection | 说明 MessageId 重复检测的范围与时间窗口；消费者仍需操作键和幂等处理记录。 || Defines MessageId duplicate-detection scope and window; consumers still require operation keys and idempotent processing records.
- [14] Azure Service Bus · Dead-Letter Queues — https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues | 支撑失败消息隔离、人工修复与重放设计。 || Supports failed-message isolation, remediation, and replay.
- [15] Dataverse · Change Tracking — https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-change-tracking-synchronize-data-external-systems | 支撑外部系统与 Dataverse 的增量同步机制；后台 CRM 是否具备等价事件或 CDC 能力需在接入阶段验证。 || Supports incremental synchronization with Dataverse; equivalent events or CDC in the backend CRM must be validated during integration discovery.

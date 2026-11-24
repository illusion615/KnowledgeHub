---
title: "Agentic Field Service：重构 Agent 赋能的现场服务 || Agentic Field Service: Rebuilding Field Service Around Agents"
eyebrow: Microsoft Business AI Solution · Field Service
brand: Agentic Field Service
date: 2026-07-11
strict_i18n: false
strict_density: true
lead: "打造流程、数据、工具无断点的高效现场服务 || Efficient Field Service With No Breaks Across Process, Data, and Tools"
hero_actions:
  - "查看设计哲学 || See the Design Philosophy | #philosophy"
  - "查看移动界面 || See the Mobile Screens | #prototypes"
panel_label: "核心主张 || Core Thesis"
panel_title: "先解决客户的问题，记录在维修过程中同步完成，当天即可回到管理视图。 || Solve the customer's problem first, capture the record as the repair proceeds, and make it visible to management the same day."
panel_desc: "移动端围绕五个工作区展开：今日任务与导航、访前背景、现场共写、完成检查和客户验收。Agent 负责理解现场记录并起草结构化内容；工程师可直接修改或锁定确定字段，业务异常与客户签字仍由确定性规则和现场人员控制，权威记录继续由现有工单与客户系统保管。 || The mobile experience spans five workspaces: today's work and navigation, pre-visit context, field coauthoring, completion check, and customer acceptance. The agent interprets field evidence and drafts structured content; technicians edit directly or lock settled fields, while deterministic rules and field personnel retain control of business exceptions and customer signature. Existing work-order and customer systems remain authoritative."
panel:
  - "执行顺序 — SLA 风险、路程与预计工时决定当天排序 || Sequence — SLA risk, travel, and planned effort determine the day's order"
  - "访前背景 — 历史工单、设备状况与未结事项汇总成一页 || Pre-visit context — past work orders, equipment condition, and open items on one page"
  - "现场采集 — 语音、照片与文字通过统一 Agent 输入区补全工单 || Field capture — voice, photos, and text complete the work order through one agent input dock"
  - "完成检查 — 只处理缺失必填与业务异常 || Completion check — address only missing required data and business exceptions"
  - "客户验收 — 检查项、附件、屏幕签字与报告交付 || Customer acceptance — checklist, evidence, on-screen signature, and report delivery"
metrics:
  - "核心结果指标 || Primary Measure | 一次修复率 || First-Time Fix | 以是否需要二次上门为主要口径，填写耗时作为辅助指标 || Measured by whether a second visit is required; entry time serves as a supporting measure"
  - "高频移动场景 || Core Mobile Scenarios | 5 | 今日任务 · 访前简报 · 现场采集 · 完成确认 · 客户确认 || Today's work · pre-visit brief · field capture · completion review · customer confirmation"
  - "未经确认写入目标 || Unconfirmed-Write Target | 0 | AI 填写保留来源且默认可修订；人工编辑或锁定后不再被 AI 覆盖 || AI-written content keeps provenance and remains revisable; human edits or locks prevent later AI overwrites"
  - "首期验证周期 || Initial Validation Cycle | 12周 || weeks | 两类工单、一类主数据变化、10–20 名现场人员 || Two work-order types, one master-data change, and 10–20 technicians"
style:
  accent: "#60a5fa"
---

## #challenge 01 / Business Challenge :: 现场掌握的信息最完整，进入管理视图却最晚 || The Field Holds the Most Complete Information and Reports It Last

一次上门同时决定三件事：客户的故障是否真正解决、本次服务能否顺利开票与索赔、客户的设备与联系信息是否发生变更。三者只有现场人员同时掌握，却也是回到管理端最慢、最不完整的部分。结果是单次维修的实际成本与其中可避免的部分，往往要到月度结算时才显现。 || A single visit settles three things at once: whether the fault is genuinely resolved, whether the job can be invoiced and claimed without dispute, and whether the customer's equipment and contact details have changed. Only the technician holds all three, yet these are the facts that return to management slowest and least completely. The actual cost of a repair, and how much of it was avoidable, therefore tends to surface only at the month-end close.

:::comparison { title: "三个视角下的同一问题 || One Problem Seen From Three Perspectives" }
::versus 视角 01 · 管理层 || Perspective 01 · Management
### 单次维修的实际成本难以核算 || The Actual Cost of a Repair Cannot Be Accounted For
人工、路程、备件、二次上门与 SLA 赔付分散在多个系统，无法归集到具体的工单类型、客户或设备型号。服务只能按人员编制与工单数量管理，成本控制手段基本只剩压缩工时。 || Labor, travel, parts, second visits, and SLA penalties are held in separate systems and cannot be attributed to a work-order type, a customer, or an equipment model. Service is therefore managed by headcount and ticket volume, leaving compressed hours as almost the only cost lever.

- 成本只汇总到总额，落不到单次服务 || Costs aggregate to totals and never reach the individual job
- 管理端看到的是上月数据，风险出现时已无法干预 || Management sees last month's data, too late to intervene when risk appears
- 续约谈判缺少依据：全年维修内容与设备状况没有可引用的记录 || Renewal talks lack evidence: no citable record of the year's repairs or equipment condition

::versus 视角 02 · 现场人员 || Perspective 02 · Technicians { highlight: true }
### 一次上门难以完成，二次上门成为常态 || One Visit Rarely Finishes the Job and Second Visits Become Routine
到场后才发现档案与实物不符、备件型号不对、上次处理过程无人交接。诊断依赖个人经验，同一故障在不同人员手中的处理结果差异明显。 || Technicians arrive to find records that do not match the equipment, parts of the wrong specification, and no handover of the previous repair. Diagnosis relies on individual experience, so the same fault yields visibly different outcomes depending on who takes it.

- 设备型号、上次处理与未结事项需要到现场逐项询问 || Model, previous repair, and open items must be checked one by one after arrival
- 资深与新任人员差距明显，经验只保留在个人身上 || Senior and new technicians differ markedly because experience stays with the individual
- 维修与记录同时进行，客户在现场等待 || Repair and record-keeping proceed at the same time while the customer waits on site

::versus 视角 03 · 管理流程 || Perspective 03 · Process
### 现场完成的工作无法完整进入后台流程 || Work Completed on Site Does Not Reach the Back-Office Process Intact
从受理、派工、现场执行到关单开票，每次交接都需要重新确认一遍信息。工单资料不全会直接影响开票与保修索赔；改期、暂停与临时增补备件多通过电话协调，事后无据可查。 || From intake to dispatch to on-site execution and on to closure and invoicing, every handoff begins by confirming the same information again. An incomplete work order directly affects invoicing and warranty claims, while reschedules, holds, and added parts are arranged by phone and leave no record.

- 客户需要说明两次：受理时一次，技术员到场后再一次 || Customers explain twice: once at intake and again after the technician arrives
- 资料不全影响开票，计费争议与保修索赔随之增加 || Incomplete records delay invoicing and increase billing disputes and warranty claims
- 现场发现的地址与联系人变更缺少受控的申报渠道 || Address and contact changes found on site have no governed reporting channel
:::

:::insight-grid { cols: 4 }
::card 01
### 信息未随人员到达现场 || The Information Does Not Reach the Site With the Technician
需补齐的能力 · 感知 + 理解 || Capability Required · Sense + Understand

设备故障史、上次处理记录与未结事项均存在于系统中，但没有汇总成出发前可读完的一页。能否一次修复，很大程度上取决于个人准备。 || Fault history, the previous repair record, and open items all exist in the system, yet nobody consolidates them into a page that can be read before departure. Whether the job is completed in one visit depends largely on individual preparation.

::card 02
### 工单执行顺序依赖个人判断 || Work-Order Sequencing Depends on Individual Judgment
需补齐的能力 · 理解 + 决策 || Capability Required · Understand + Decide

剩余时限、暂停状态、路程与备件到位情况分布在不同页面。排序依赖经验，系统发出预警时通常已接近超时。 || Remaining time, hold status, travel, and parts readiness are spread across different screens. Sequencing relies on experience, and by the time the system issues a warning the deadline is usually close.

::card 03
### 现场记录无法完整回到业务系统 || On-Site Records Do Not Return to the Business Systems Intact
需补齐的能力 · 协同 + 执行 || Capability Required · Coordinate + Act

维修内容、更换件与客户签字多在事后补录。资料不全会影响开票与索赔，客户信息变更也缺少受控的提交路径。 || Repair content, replaced parts, and the customer signature are mostly entered afterwards. Incomplete records affect invoicing and claims, and customer-record changes have no governed submission path.

::card 04
### 同类问题反复出现，经验难以复用 || The Same Problems Recur and Experience Is Not Reused
需补齐的能力 · 学习 || Capability Required · Learn

每次服务的结果留在各自的工单中，没有汇总成设备型号的失效规律或客户反复故障的原因。资深人员的判断未被记录，新任人员需要重新积累。 || Each outcome stays inside its own work order, so no view forms of how a given model fails or why a customer reports the same fault repeatedly. Senior judgment is never recorded, and new technicians must rebuild it from the beginning.
:::

:::callout { title: "诊断顺序 || Diagnostic Order" }
现场受阻的环节 → 对应的脱节类型 → 需要补齐的能力 → 受影响的成本项。四项成本分别为二次上门费用、技术员产能、关单到开票的周期，以及 SLA 赔付与停机损失。Forrester 受 Microsoft 委托、以 1,000 名技术员的复合组织测算的现场服务项目，三年 ROI 为 346%，其中假设避免 12% 的二次上门、技术员产能最高提高 14%。该研究评估的是整体现场服务现代化，不是本方案的增量，仅用于判断成本可能下降的方向。本项目的填写耗时、返修率与客户档案错误率尚无实测基线，试点须先建立基线，再讨论收益。[14] || Where the field is blocked → which type of disconnect it belongs to → which capability must be built → which cost item it affects. The four cost items are second-visit expense, technician capacity, the closure-to-invoice cycle, and SLA penalties plus downtime. A Microsoft-commissioned Forrester study of a composite organization with 1,000 technicians reported 346% three-year ROI for a field-service program, assuming 12% of second visits avoided and technician productivity up to 14% higher. That study evaluates field-service modernization as a whole rather than the increment of this proposal, so it indicates only where cost is likely to fall. Entry time, rework, and customer-record error rates have no measured baseline here, so the pilot must establish one before benefits are discussed.[14]
:::

## #philosophy 02 / Purpose and Design Principles :: 一条服务闭环提升质量与效率，同一份记录继续供市场与销售使用 || One Service Loop Lifts Quality and Efficiency While the Same Record Continues to Serve Marketing and Sales

一次上门就把问题解决，是现场服务本来就有的要求，与是否引入系统无关。真正决定能否做到的，是每一次服务是否孤立发生：事前拿不到他人处理同类故障的经验，事中记录依赖个人习惯，事后结果不回到下一次的派工与准备。方案要建立的，是让每一次服务都能用上此前所有服务的结果，质量与效率的提升由此产生，而不是靠对现场人员提出更高要求。同一份结构化记录还能超出服务本身，成为客户档案、商机线索与市场情报的来源，在生产、销售与服务之间继续产生价值。[15] || Resolving the problem in a single visit is what field service has always been expected to do, with or without a system. What determines whether it happens is whether each visit occurs in isolation: no access beforehand to how colleagues handled the same fault, records during the work that depend on personal habit, and outcomes afterwards that never reach the next dispatch or preparation. What this proposal builds is the ability for every visit to draw on the results of every visit before it. Gains in quality and efficiency come from there, not from asking more of technicians. The same structured record also reaches beyond service itself, becoming a source for customer profiles, sales signals, and market intelligence across manufacturing, sales, and service.[15]

:::comparison
::versus 内环 01 · 事前洞察 || Inner Loop 01 · Before the Visit
### 出发前拿到同类故障的处理经验 || Arrive With How the Same Fault Was Handled Before
系统汇总该客户与该设备的历史工单、上次处理方式、未结事项与备件状态，形成一页可核对的访前背景。技师不必到场后再逐项询问，也不必依赖自己是否恰好处理过同类故障。 || The system consolidates past work orders, the previous repair method, open items, and parts status for this customer and this equipment into one verifiable pre-visit page. Technicians no longer ask item by item after arrival, nor depend on whether they happen to have handled the same fault before.

- 输入：历史工单、设备档案、未结事项、备件状态 || Input: past work orders, equipment records, open items, parts status
- 输出：访前背景与本次检查重点 || Output: pre-visit context and the focus of this inspection
- 交给事中：带着明确的检查顺序与备件清单到场 || Handoff: arrive with a defined inspection order and parts list

::versus 内环 02 · 事中执行 || Inner Loop 02 · During the Visit { highlight: true }
### 处理过程中同步完成结构化记录 || Complete the Structured Record as the Work Proceeds
语音、照片与条码在维修过程中进入同一采集会话，系统即时生成候选答案，并只追问阻碍下一步的缺口。记录不再是服务结束后的额外工作，而是执行过程的一部分。 || Voice, photos, and barcode feed one capture session while the repair proceeds; the system drafts candidate answers immediately and asks only about gaps that block the next step. Recording stops being extra work after the service and becomes part of doing it.

- 输入：访前背景、现场观察、客户陈述 || Input: pre-visit context, on-site observation, customer statements
- 输出：结构化工单内容、证据链、客户信息变更申请 || Output: structured work-order content, evidence trail, customer-record change requests
- 交给事后：一份当天即可用于结算与复用的记录 || Handoff: a record usable the same day for settlement and reuse

::versus 内环 03 · 事后回流 || Inner Loop 03 · After the Visit
### 本次结果成为下一次的事前依据 || This Visit's Outcome Becomes the Next Visit's Preparation
关单资料当天进入结算与索赔通道，同一份结构化记录也成为下一次访前背景中可引用、可打开来源的事实。同类故障的处理方式因此在人员之间传递，而不是停留在个人经验里。 || The closing record enters settlement and claims the same day, and the same structured record becomes a citable, source-linked fact in the next pre-visit brief. How a fault was handled therefore travels between people instead of staying in one person's experience.

- 输入：结构化工单、返场记录、结算结果 || Input: structured work orders, return-visit records, settlement results
- 输出：可引用的处理记录与未结事项 || Output: citable repair records and open items
- 交回事前：下一次的访前背景与检查重点 || Handoff back: the next pre-visit context and inspection focus
:::

:::callout { title: "闭环的闭合范围 || Where the Loop Closes" }
首期闭环闭合在个案层面：本次服务的结构化记录，成为下一次同客户、同设备服务的可引用事实。跨工单的失效规律归纳需要足够样本，属于试点之后单独评估的能力，不计入首期范围。 || In the initial phase the loop closes at case level: this visit's structured record becomes a citable fact for the next visit to the same customer and equipment. Generalizing failure patterns across work orders requires sufficient sample size and is assessed separately after the pilot rather than counted in the initial scope.
:::

:::insight-grid { cols: 3 }
::card 01
### 现场观察补全客户与设备档案 || Field Observation Completes the Customer and Equipment Profile
受益方 · 销售与客户成功 || Beneficiary · Sales and Customer Success

现场是唯一直接看到实际使用环境、在用设备构成、使用方式与现场角色变化的环节。这些事实经确认后进入客户与设备档案，使销售与客户成功看到的画像与真实现场一致，而不是停留在签约时的信息。 || The site is the only place where the operating environment, the equipment genuinely in use, how it is used, and changes in on-site roles are directly visible. Once confirmed, these facts enter the customer and equipment profile so that sales and customer success see a picture matching the site rather than the information captured at signing.

::card 02
### 设备状态与客户诉求形成可核实的线索 || Equipment Condition and Customer Requests Become Verifiable Signals
受益方 · 销售 || Beneficiary · Sales

设备接近使用年限、同类故障反复出现、备件停产，以及客户主动提出的扩容或升级，都是可核实的事实。现场人员只如实记录，不作销售判断，也不在现场作出商务承诺；线索的判定与跟进由销售侧完成。 || Equipment approaching end of life, the same fault recurring, parts going out of production, and customers raising expansion or upgrade requests are all verifiable facts. Technicians record them as observed, make no sales judgment, and give no commercial commitment on site; qualification and follow-up belong to sales.

::card 03
### 同场设备与替代方案构成市场情报 || Co-Located Equipment and Alternatives Form Market Intelligence
受益方 · 市场与产品 || Beneficiary · Marketing and Product

同一现场常常存在其他品牌设备、替代方案与外部服务商。谁在现场、以什么方式服务，是市场与产品侧难以从公开渠道获得的信息。同样只记录客观可核实的事实，不记录主观评价。 || A single site often hosts other brands, alternative solutions, and third-party service providers. Who is on site and how they serve is information that marketing and product teams rarely obtain from public sources. Here too, only objective and verifiable facts are recorded, not subjective assessments.
:::

:::callout { title: "使用边界 || Conditions of Use" }
三类再利用共用同一组前提：客户知情并同意采集与用途，每条事实的来源与时间可追溯，字段用途在客户档案中标注。现场人员的职责是如实记录，不承担销售目标。这部分能力不计入首期 12 周试点，需在服务闭环稳定、字段与同意机制确认之后单独评估。 || All three forms of reuse share the same preconditions: the customer is informed of and consents to both collection and purpose, every fact carries a traceable source and timestamp, and field purpose is labeled in the customer profile. Technicians are accountable for recording accurately and carry no sales targets. This capability is excluded from the initial 12-week pilot and is assessed separately once the service loop is stable and the field and consent mechanisms are confirmed.
:::

:::callout { title: "承载闭环的工具 || The Tool That Carries the Loop" }
闭环要在现场成立，工具必须以移动端为第一工作面、以 AI 理解与起草为主要交互：手机承载当日工单、访前背景、现场采集与关单确认；语音、照片与条码是主要输入方式；完整表单退为查阅入口。能力建立在现有 Field Service 与 Power Platform 底座之上，不以自研原生应用为前提。以下四条原则约束它的设计。 || For the loop to hold on site, the tool must treat mobile as the primary work surface and AI interpretation and drafting as the main interaction: the phone carries the day's work orders, pre-visit context, on-site capture, and closure review; voice, photos, and barcode are the primary inputs; the full form recedes to a reference view. The capability is built on the existing Field Service and Power Platform foundation and does not presuppose a custom native application. The four principles below constrain its design.
:::

:::insight-grid { cols: 4 }
::card 01
### 先解决问题 || Solve the Problem First
首页先回答当日任务、下一站位置与临近超时的工单。完整表单保留为查阅入口，不占据主流程。 || The home screen answers the day's assignments, the next location, and which work orders are approaching their deadline. The full form remains available for reference without occupying the primary flow.

::card 02
### 过程中采集 || Capture During the Work
工单开始后到关闭前，语音、文字、照片和条码持续进入同一采集会话；人员可以随时暂停并恢复。 || From work start to closure, voice, text, photos, and barcode feed one capture session that technicians can pause and resume at any time.

::card 03
### 确认后再提交 || Confirm Before Submitting
系统主动给出字段草稿和主数据变化，用户只需确认、编辑或拒绝。任何 AI 结果都不能绕过确认直接写入。 || The system proactively proposes field drafts and master-data changes; users confirm, edit, or reject. No AI result bypasses confirmation to write directly.

::card 04
### 记录即时回报 || Records Return Value Immediately
每次信息补充后，系统立即更新完成度、缺失项和下一步；出发前则用同一数据形成 SLA 顺序与访前简报。 || After every capture, the system immediately updates completion, gaps, and the next action; before departure, the same data forms the SLA sequence and pre-visit brief.
:::

:::callout { title: "责任边界 || Accountability Boundary" }
AI 负责理解、整理与起草；现场人员负责业务判断；规则负责必填、范围、审批和关闭条件；现有工单、客户与资产系统继续持有权威记录。 || AI interprets, organizes, and drafts; technicians make business judgments; rules enforce required fields, ranges, approvals, and closure; existing work-order, customer, and asset systems retain authoritative records.
:::

## #day 03 / A Technician's Day :: 林工的一天：同一张设备科走访工单在八个时点逐步完成 || Lin's Day: One Equipment-Department Visit Work Order Progresses Across Eight Moments

以下跟随林工完成华东市第一人民医院的一次现场服务。八个时点描述同一客户、同一工单和同一组现场事实如何从排程、访前准备、现场共写一路进入客户验收；移动界面蓝图使用当前运行版本的维修工单演示数据，按这条时间线截取关键界面。 || Follow Lin through one field-service visit at East City First Hospital. Eight moments show how the same customer, work order, and field facts move from scheduling and pre-visit preparation through field coauthoring and into customer acceptance; the mobile screen blueprint uses repair-work-order demo data from the current running build to capture the key interfaces along this timeline.

上午 · SLA 排程到首次现场采集 || Morning · From SLA Planning to First On-Site Capture

:::flow
1. **07:30 · 今日工单按 SLA 风险重新排序 || 07:30 · Today's Work Orders Reorder by SLA Risk** — 首页显示 6 张待办工单、2 张即将进入 SLA 预警和 5 小时 20 分钟预计服务时长。华东市第一人民医院设备科走访将在 3 小时后预警，林工结合 12.4 公里距离与 09:30 计划时间，将其排在第一站。 || The home screen shows six open work orders, two approaching SLA warning, and 5 hours 20 minutes of planned service. The East City First Hospital equipment visit reaches warning in three hours, so Lin combines its 12.4-kilometer distance and 09:30 planned time and places it first.
2. **08:10 · 访前简报呈现可引用事实 || 08:10 · The Pre-Visit Brief Presents Cited Facts** — Agent 汇总 CRM 与 3 张历史工单：客户为三甲医院，设备管理系统覆盖全院约 80,000 台设备；设备科王立负责本次沟通，近期关注 mi-IoT 与常规附件服务。每条事实都可打开来源。 || The agent summarizes CRM and three historical work orders: the customer is a tier-3 hospital whose equipment system covers about 80,000 devices; Wang Li from the Equipment Department leads the discussion and is currently interested in mi-IoT and standard accessory services. Every fact opens its source.
3. **09:00 · 到场后冻结本次问卷版本 || 09:00 · Arrival Freezes the Questionnaire Version** — 林工点击开始后，系统冻结“客户经理走访-设备科服务工作清单”版本 12：基本信息 5 项、专业信息 5 项、服务反馈 3 项、客户档案链接 1 项。客户名称、被拜访人姓名和拜访日期由表达式带入。 || When Lin starts the visit, the system freezes version 12 of the Customer Manager Visit - Equipment Department Service Checklist: five Basic fields, five Professional fields, three Feedback fields, and one Customer Profile link. Expressions fill customer name, contact name, and visit date.
4. **10:15 · 连续语音识别与 AI 同屏共写 || 10:15 · Continuous Speech Recognition and AI Coauthoring** — 林工边维修边口述现场事实，浏览器或 Azure 语音把临时与最终文本持续写入输入框；发送后 AI 读取完整证据链并填写问卷。AI 内容保留来源标识，后续记录可修订未锁定字段，确定内容可单独锁定。 || Lin narrates field facts while repairing. Browser or Azure speech continuously writes interim and final text into the composer; after submission AI reads the complete evidence trail and fills the questionnaire. AI content retains provenance, later evidence can revise unlocked fields, and settled content can be locked independently.
:::

下午 · 渐进补齐、档案更新与客户确认 || Afternoon · Progressive Completion, Profile Update, and Customer Confirmation

:::flow
1. **11:40 · 系统只追问当前关键缺口 || 11:40 · The System Asks Only for the Current Critical Gap** — Agent 不要求林工逐页检查所有字段，而是只追问会阻碍下一步的缺口。AI 已填写的完整字段不构成确认任务；工程师可直接修改，或在内容确定时点击锁定，防止后续 AI 更新。 || The agent does not ask Lin to inspect every field page by page. It asks only about gaps that block the next step. Complete AI-written fields create no approval task; the technician can edit them directly or lock settled content against later AI updates.
2. **14:00 · 客户档案链接生成更新需求 || 14:00 · CustomerProfileLink Creates an Update Request** — 现场确认全院约有 80,000 台设备，现有设备管理系统已全院覆盖。CustomerProfileLink 将这组信息保存为一项客户档案更新需求；它随工单复核，但不会直接覆盖 CRM 正式记录。 || The visit confirms about 80,000 devices and hospital-wide coverage by the existing equipment system. CustomerProfileLink stores this as one customer-profile update request. It is reviewed with the work order but does not overwrite the official CRM record.
3. **16:30 · 完成检查只列出业务异常 || 16:30 · Completion Check Lists Business Exceptions Only** — 确定性规则检查字段类型、合法选项、必填条件、设备恢复状态和后续计划。完整问卷不会再次逐项展示；只有缺失必填、未恢复却缺少计划等问题会阻止进入客户验收。 || Deterministic rules validate field types, legal options, required conditions, equipment recovery, and follow-up plans. A complete questionnaire is not shown field by field again; only gaps such as missing required data or unresolved equipment without a plan block customer acceptance.
4. **17:20 · 客户在设备上完成验收与签字 || 17:20 · The Customer Completes Acceptance and Signature on Device** — 系统按工单类型加载维修或培训验收模板，逐项检查结果、不合格说明和必传附件。客户评价并屏幕签字后内容锁定，签名绑定内容指纹；报告随后可打印、下载并进入发送队列，客户档案更新继续独立治理。 || The system loads a repair or training acceptance template by work-order type and validates item results, failure notes, and required evidence. Customer rating and on-screen signature lock the content and bind the signature to a content fingerprint; the report can then be printed, downloaded, and queued for delivery while customer-profile updates remain independently governed.
:::

## #prototypes 04 / Mobile Screen Blueprint :: 现场服务的八个时点，在五个 Agent 工作区中连续重现 || Eight Service-Day Moments Replay Across Five Agent Workspaces

原型继续使用林工、华东市第一人民医院、设备科王立和同一张 14 字段走访工单。五个工作区分别承接 07:30 排程、08:10 访前简报、09:00–14:00 现场采集、16:30 完成复核和 17:20 客户确认；屏内时间标记可与服务日时间线逐项对照。下列数字均为界面示意，不是客户实测结果。 || The prototype continues with Lin, East City First Hospital, Wang Li from the Equipment Department, and the same 14-field visit work order. Five workspaces cover 07:30 scheduling, the 08:10 pre-visit brief, 09:00-14:00 field capture, the 16:30 completion review, and the 17:20 customer confirmation. On-screen timestamps map directly to the service-day timeline. All figures are interface illustrations rather than measured customer results.

:::sandbox { id: "agentic-service-mobile-solution-sandbox-1", title: "现场服务移动原型 || Field Service Mobile Prototype", canvas: false }
07:30 · 个人工单 Dashboard || 07:30 · Personal Work-Order Dashboard
:::

## #architecture 05 / System Architecture :: 统一业务契约让移动 Agent 支持 Dynamics 365 或其他 CRM 骨干 || A Unified Business Contract Lets the Mobile Agent Support Dynamics 365 or Other CRM Backbones

移动体验、Agent 与问卷运行时不直接绑定某一套 CRM 表结构。统一业务契约定义工单、客户、设备、SLA、档案更新与客户确认文件；适配器把契约映射到 Dynamics 365 Field Service，或客户现有的 CRM / 工单平台。 || The mobile experience, agent, and questionnaire runtime do not bind directly to one CRM schema. A unified business contract defines work orders, customers, equipment, SLA, profile updates, and customer confirmation documents; adapters map that contract to Dynamics 365 Field Service or the customer's existing CRM and work-order platform.

Field Service Mobile · Power Apps 模型驱动应用 · 客户确认 || Field Service Mobile · Power Apps Model-Driven App · Customer Confirmation

### 现场主端 + 后台与客户侧入口 || Field Main Surface Plus Back-Office and Customer Entry Points

技术员以 Field Service Mobile 为主端，直接使用离线优先缓存、相机、条码与设备听写；客户尚未部署 Field Service 时，同一体验由 Power Apps 模型驱动应用承载。调度与数据管理员在后台复核，客户侧通过确认文件与签字回传闭环。 || Technicians work primarily in Field Service Mobile with offline-first caching, camera, barcode, and device dictation. When the customer has not deployed Field Service, a Power Apps model-driven app carries the same experience. Dispatchers and data stewards review in the back office, and the customer side closes the loop through a confirmation document and returned signature.

Field Service Mobile（iOS / Android / Windows） || Field Service Mobile (iOS / Android / Windows)

Power Apps 模型驱动应用 || Power Apps Model-Driven App

离线优先缓存与本地草稿 || Offline-first cache and local drafts

客户确认文件 · 邮件 · 签字 || Confirmation document · Email · Signature

Azure Speech · AI Builder

### 云端语音与结构化字段抽取，断网可降级 || Cloud Speech and Structured Extraction, With a Degraded Path Offline

**语音走 Azure Speech，字段抽取走 AI Builder prompt**。语音密钥只保存在服务端，因此调用经 Azure Functions 代理。未配置语音主机或断网时回退到设备原生听写与文字输入，采集流程不中断。 || **Voice runs on Azure Speech and field extraction runs through AI Builder prompts.** The speech key stays server-side, so calls pass through an Azure Functions proxy. When the voice host is unconfigured or connectivity drops, the app falls back to device dictation and text input without interrupting capture.

Azure Speech（语音转文本） || Azure Speech (speech-to-text)

设备原生听写 fallback || Device dictation fallback

AI Builder Prompt（字段抽取） || AI Builder Prompt (field extraction)

照片与条码识别 || Photo and barcode recognition

⇌

Copilot Studio Agents · Agent Flow

### 四个领域 Agent 编排排程、简报、采集与主数据 || Four Domain Agents Orchestrate Scheduling, Briefing, Capture, and Master Data

**生成式编排**只处理需要推理、跨来源查询或自动追问的请求；**Agent Flow** 处理关单门禁与主数据变更申请等多步事务。字段已由 AI Builder 抽取且目标操作确定时，前端可直接调用连接器，不绕行 Agent。Agent 不持有业务系统写权限。 || **Generative orchestration** handles only requests that need reasoning, cross-source lookup, or automatic follow-up questions; **Agent Flow** handles multi-step transactions such as closure gates and master-data change requests. When AI Builder has already extracted the fields and the target operation is deterministic, the front end calls the connector directly without routing through an agent. Agents hold no write privileges on business systems.

Service Day Agent

Visit Brief Agent

Capture Agent

Data Steward Agent

Agent Flow（关单门禁 · 变更审批） || Agent Flow (closure gates · change approval)

统一业务契约 · Dataverse · 工单适配器 || Unified Business Contract · Dataverse · Work-Order Adapters

### 统一业务契约让业务骨干可替换 || A Unified Business Contract Keeps the Backbone Interchangeable

契约定义 WorkOrder、Customer、Equipment、SLA 与 Acceptance；适配器承担读取模型、命令映射、事件转换与并发检查，是唯一知道骨干私有表结构的地方。Dataverse 保存问卷版本、采集草稿、同步队列与审计；语音调用与附件经 Azure Functions 和存储账户落地。 || The contract defines WorkOrder, Customer, Equipment, SLA, and Acceptance. Adapters own the read model, command mapping, event translation, and concurrency checks, and are the only place that knows the backbone's private schema. Dataverse holds questionnaire versions, capture drafts, the sync queue, and audit, while speech calls and attachments land through Azure Functions and a storage account.

统一业务契约（WorkOrder · Customer · Equipment · SLA） || Unified contract (WorkOrder · Customer · Equipment · SLA)

Microsoft Dataverse

CRM / 工单适配器 || CRM / work-order adapters

Azure Functions（语音代理） || Azure Functions (speech proxy)

存储账户（附件与照片） || Storage account (attachments and photos)

Dynamics 365 Field Service · 其他 CRM / 工单平台 || Dynamics 365 Field Service · Other CRM / Work-Order Platform

### 权威业务记录保持在骨干系统 || Authoritative Business Records Stay in the Backbone

工单、预约、客户资产、SLA 与服务结果继续由骨干持有。已部署 Dynamics 365 Field Service 时使用标准适配器；工单仍在 Salesforce、自研 CRM、ERP 服务模块或行业工单系统时改用客户适配器。每个实体必须逐一声明权威来源、允许的写入方与一致性边界，避免两侧同时成为主数据。 || Work orders, bookings, customer assets, SLA, and service results remain in the backbone. A standard adapter applies when Dynamics 365 Field Service is deployed; a custom adapter applies when work orders still live in Salesforce, a custom CRM, an ERP service module, or an industry work-order system. Every entity must declare its authoritative source, permitted writer, and consistency boundary so the two sides never become competing masters.

Dynamics 365 Field Service（标准适配器） || Dynamics 365 Field Service (standard adapter)

Salesforce · 自研 CRM · ERP 服务模块（客户适配器） || Salesforce · Custom CRM · ERP service module (custom adapter)

Entra ID · DLP · Key Vault · App Insights

### 两条调用路径共用同一套平台治理 || Both Invocation Paths Share One Set of Platform Governance Components

身份沿用现有 Entra ID 与 Field Service 安全角色；连接器边界、环境隔离、凭据托管与端到端可观测都使用平台原生组件，不再自建。Dataverse 审计记录变更前后值，Application Insights 关联 Agent 操作、工具调用与失败原因。 || Identity reuses existing Entra ID and Field Service security roles. Connector boundaries, environment isolation, credential storage, and end-to-end observability all rely on native platform components rather than custom builds. Dataverse audit records before-and-after values, while Application Insights correlates agent actions, tool calls, and failure causes.

Microsoft Entra ID（SSO） || Microsoft Entra ID (SSO)

Field Service 安全角色 || Field Service security roles

Power Platform DLP

Managed Environments

Azure Key Vault（语音密钥） || Azure Key Vault (speech keys)

Dataverse 审计（前后值） || Dataverse audit (before-and-after)

Application Insights（端到端可观测） || Application Insights (end-to-end observability)

:::flow
1. **1 · 用户体验层 || 1 · User Experience Layer** — 承载移动 Agent、语音拍照文字输入、设备导航以及客户确认文件；不直接读取或写入 CRM 私有表结构。 || Hosts the mobile agent, voice-photo-text input, device navigation, and customer confirmation documents without directly reading or writing private CRM schemas.
2. **2 · 智能体层 || 2 · Agent Layer** — 理解用户目标，组织 SLA 排程、访前简报、字段提取、缺口追问与下一步建议，但不直接持有业务系统写权限。 || Understands user goals and organizes SLA scheduling, pre-visit briefs, field extraction, gap follow-ups, and next actions without direct write privileges to business systems.
3. **3 · 集成层 || 3 · Integration Layer** — 统一业务契约、规则门禁与 CRM 适配器负责读取、命令映射、审批、并发检查、审计和最小变更集提交。 || The unified contract, rule gates, and CRM adapters handle reads, command mapping, approvals, concurrency, audit, and minimal confirmed change sets.
4. **4 · Backbone** — Dynamics 365 Field Service 或其他 CRM / 工单系统继续持有工单、客户、设备、SLA 和服务结果等权威业务记录。 || Dynamics 365 Field Service or another CRM and work-order system continues to hold authoritative work orders, customers, equipment, SLA, and service results.
:::

:::accordion
::panel { open: true }
### 问卷如何贯穿工单全程 || How the Questionnaire Spans the Work-Order Lifecycle
每张工单创建一个独立采集会话，锁定当时的问卷版本并保存进度；管理员之后更新模板，不会改变正在执行的工单。 || Each work order creates an independent capture session that freezes the active questionnaire version and retains progress; later template changes do not alter work already in progress.

- 工单开始：按类型加载对应问题与条件分支 || Work starts: load the questions and branches for the work-order type
- 服务进行：持续保存已确认、待确认和缺失信息 || During service: retain confirmed, pending, and missing information
- 每次补充：重新计算相关问题和完成度 || After each update: recalculate relevant questions and completion
- 工单关闭：必填、签字、照片和后续任务全部通过门禁 || At closure: required fields, signature, photos, and follow-up tasks pass the gate

::panel
### 在线、弱网与离线的能力边界 || Capability Boundaries for Connected, Degraded, and Offline Work
离线保障服务继续执行，云端 Agent 提供增强理解；断网时系统回退到本地工单、缓存问卷、文字、照片和设备听写。 || Offline support keeps service execution available while cloud agents add enhanced interpretation; without connectivity the app falls back to local work orders, cached questionnaires, text, photos, and device dictation.

| 模式 || Mode | 现场可用 || Available in the Field | 恢复方式 || Recovery |
| --- | --- | --- |
| 在线 || Connected | 实时语音、自然补问、最新 SLA 与主数据核对 || Real-time voice, natural follow-ups, current SLA, and master-data validation | 持续同步已确认内容 || Continuously synchronize confirmed content |
| 弱网 || Degraded | 本地工单、缓存问卷、文字、照片、条码与设备听写 || Local work order, cached questionnaire, text, photos, barcode, and device dictation | 按片段提交，失败项进入可见队列 || Submit by segment and place failures in a visible queue |
| 离线 || Offline | 离线范围内的工单、问卷、附件与本地草稿 || Offline-scoped work order, questionnaire, attachments, and local drafts | 联网后解析，并在提交前重新核对服务器版本 || Parse after reconnecting and revalidate the server version before commit |

::panel
### 工单答案与客户主数据采用不同写入路径 || Work-Order Answers and Customer Master Data Follow Different Write Paths
现场事实影响当前服务，客户主数据影响未来派工、账单与合规，因此两类内容分组确认并采用不同审批。 || Field facts affect the current service, while customer master data affects future dispatch, billing, and compliance, so the two groups receive separate confirmation and approval.

工单内容 || Work-Order Content

**现场确认后提交当前工单 || Commit to the Current Work Order After On-Site Confirmation**

基本信息、重点需求、推广产品、方案阶段、服务反馈和走访总结在规则校验后进入当前工单。 || Basic details, priority needs, promoted products, solution stage, service feedback, and visit summary enter the current work order after rule validation.

客户主数据 || Customer Master Data

**现场确认只创建变更申请 || On-Site Confirmation Creates a Change Request Only**

服务地址、联系人和资产归属等变化带证据进入数据管理员审批；高风险财务与法定字段只生成人工任务。 || Service address, contacts, and asset-ownership changes enter data-steward approval with evidence; high-risk financial and legal fields create human tasks only.

::panel
### 云端能力不可用时如何继续工作 || How Work Continues When Cloud Capabilities Are Unavailable
Agent 是增强能力，不能成为查看工单、执行安全步骤、采集必填信息和完成客户签字的单点依赖。 || Agents are enhancements and cannot become a single dependency for viewing work orders, completing safety steps, capturing required information, or obtaining customer signatures.

- Copilot Studio 不可用：显示完整问卷与既有工单操作 || Copilot Studio unavailable: show the full questionnaire and existing work-order actions
- Azure Speech 不可用：切换设备听写或文字输入 || Azure Speech unavailable: switch to device dictation or text
- 主数据系统不可用：保存为待提交，不显示成功 || Master-data system unavailable: retain as pending and do not show success
- SLA 来源不可用：显示最后更新时间，不推算实时倒计时 || SLA source unavailable: show the last update time and do not extrapolate a live countdown
:::

## #data-strategy 06 / Data Strategy :: 按数据责任分域：移动体验更快，现有系统仍是唯一权威来源 || Split by Data Accountability: A Faster Mobile Experience With Existing Systems Remaining Authoritative

明确各层如何协作后，数据策略进一步比较三条数据路径。方案选择按责任分域：采集会话、草稿和审批过程落在 Dataverse，工单、客户、资产与 SLA 的最终事实仍由现有业务系统持有。 || With cross-layer collaboration defined, the data strategy compares three data paths. The selected design splits by accountability: capture sessions, drafts, and approvals live in Dataverse, while final work-order, customer, asset, and SLA facts remain in existing business systems.

:::comparison { title: "三种数据路径对比 || Comparison of Three Data Paths" }
::versus 方案 A || Option A
### 全量复制到 Dataverse || Replicate Everything Into Dataverse
移动查询与离线体验最直接，但数百字段客户主数据需要持续双向同步，冲突、审计与数据驻留成本最高。 || Mobile query and offline access are straightforward, but hundreds of customer-master fields require continuous bidirectional synchronization, creating the highest conflict, audit, and residency cost.

::versus 方案 B || Option B
### 所有数据实时调用现有系统 || Call Existing Systems for Every Interaction
不产生数据副本，上线边界清晰；代价是每次交互都依赖网络和外部 API，离线采集、跨记录简报与多轮补齐难以连续。 || No data copy is created and the boundary is clear, but every interaction depends on connectivity and external APIs, making offline capture, cross-record briefs, and multi-turn completion difficult to sustain.

::versus 方案 C · 采用 || Option C · Selected { highlight: true }
### 按责任分域，共享最小必要数据 || Split by Accountability and Share the Minimum Necessary Data
Dataverse 保存移动运行状态、候选答案和审批过程；权威业务数据按需读取，确认后以最小变更集回写。该路径兼顾离线连续性与现有系统责任。 || Dataverse stores mobile runtime state, candidate answers, and approval progress; authoritative business data is read on demand and written back as a minimal confirmed change set. This balances offline continuity with incumbent-system accountability.
:::

:::accordion
::panel { open: true }
### 各类数据由谁负责 || Who Owns Each Data Category
移动层只保存完成体验所需的运行状态，不成为工单、客户、资产或 SLA 的第二权威来源。 || The mobile layer stores only the runtime state needed for the experience and does not become a second source of truth for work orders, customers, assets, or SLA.

| 数据对象 || Data Object | 权威来源 || Authoritative Source | 移动智能层保存 || Stored by the Mobile Intelligence Layer |
| --- | --- | --- |
| 工单与服务任务 || Work Orders and Service Tasks | Dynamics 365 Field Service 或现有工单系统 || Dynamics 365 Field Service or the existing work-order system | 采集进度、候选答案、证据与同步状态 || Capture progress, candidate answers, evidence, and sync state |
| 客户与资产主数据 || Customer and Asset Master Data | 现有 CRM、ERP 或主数据平台 || Existing CRM, ERP, or master-data platform | 带证据的变更申请、审批状态与目标版本 || Evidence-backed change requests, approval state, and target version |
| SLA | 现有 SLA 或服务承诺引擎 || Existing SLA or service-commitment engine | 只读快照、最后更新时间与排序解释 || Read-only snapshot, last update time, and ranking explanation |
| Agent 运行记录 || Agent Runtime Records | Dataverse 与 Application Insights || Dataverse and Application Insights | 计划、工具调用、确认、拒绝、延迟与错误 || Plans, tool calls, confirmations, rejections, latency, and errors |

::panel
### 字段风险决定审批深度 || Field Risk Determines Approval Depth
审批按字段影响范围配置，使现场可确认信息快速进入工单，同时保护会影响后续派工、财务和合规的客户主数据。 || Approval follows field impact so field-confirmable information reaches the work order quickly while customer master data affecting dispatch, finance, and compliance remains protected.

| 类别 || Category | 示例 || Examples | 处理方式 || Handling |
| --- | --- | --- |
| 当前工单 || Current Work Order | 科室、重点需求、推广产品、方案阶段、服务反馈与走访总结 || Department, priority needs, promoted products, solution stage, service feedback, and visit summary | 规则通过且现场人员确认后提交 || Commit after rule validation and technician confirmation |
| 中风险主数据 || Medium-Risk Master Data | 服务地址、现场联系人、服务时间偏好 || Service address, site contact, service-time preference | 现场确认后进入数据管理员审批 || Route to data-steward approval after on-site confirmation |
| 高风险主数据 || High-Risk Master Data | 法定名称、税务、账单与受监管标识 || Legal name, tax, billing, and regulated identifiers | 只创建人工核验任务，AI 不提交 || Create a human-verification task only; AI does not commit |

::panel
### 后台已修改时如何避免覆盖 || How Overwrite Is Prevented When the Back Office Has Already Changed a Record
系统使用实体标签（ETag）识别记录自上次读取后是否变化；不匹配时停止写入，并把现场值、后台值与来源交给数据管理员比较。 || The system uses an entity tag (ETag) to detect whether a record changed after it was read; a mismatch stops the write and presents the field value, back-office value, and evidence to a data steward.

1. **访前读取 || Pre-Visit Read** — 简报读取服务地址 A，并保留当时的记录版本。 || The brief reads service address A and retains the record version at that time.
2. **现场发现 || Field Finding** — 客户告诉林工地址应为 B；与此同时，后台已把地址改为 C。 || The customer tells Lin the address should be B while the back office has already changed it to C.
3. **停止覆盖 || Stop the Overwrite** — 记录版本不一致，系统拒绝自动提交，不采用最后写入覆盖。 || The record versions differ, so the system rejects automatic commit and does not use last-write-wins overwrite.
4. **人工核对 || Human Review** — 数据管理员同时看到 A、B、C、来源和时间，决定保留、修改或联系客户复核。 || The data steward sees A, B, C, their sources, and timestamps and decides whether to keep, change, or verify with the customer.
:::

## #agent-map 07 / Agent Map :: 四个领域 Agent 覆盖现场人员一天中的四类稳定目标 || Four Domain Agents Cover Four Stable Goals Across the Technician's Day

在各系统数据责任明确后，Agent 划分应围绕用户目标展开，而不按每张表或每个 API 创建 Agent。四个领域能力分别负责当天顺序、访前背景、现场采集与客户数据变化。 || With system accountability established, agents are defined by user goal rather than creating one agent per table or API. Four domain capabilities cover daily sequencing, pre-visit context, on-site capture, and customer-data changes.

:::insight-grid { cols: 4, title: "四个领域 Agent || Four Domain Agents" }
::card 01
### Service Day Agent
每天开始时读取分配工单、SLA、路程、计划工时、备件和暂停状态，形成可解释的今日顺序。它不修改 SLA，只解释现有承诺。 || At the start of each day, it reads assigned orders, SLA, travel, planned effort, parts, and pause state to form an explainable sequence. It never changes SLA; it explains existing commitments.

::card 02
### Visit Brief Agent
在出发前汇总本次任务、客户背景、资产历史和未完成事项，并把事实、推断与建议分开呈现。 || Before departure, it summarizes the mission, customer context, asset history, and open actions while separating facts, inferences, and recommendations.

::card 03
### Capture Agent
在服务现场理解语音、照片、条码与文字，匹配当前工单问题，生成字段草稿并只追问阻止下一步的缺口。 || On site, it interprets voice, photos, barcode, and text, matches them to current work-order questions, drafts fields, and asks only for gaps blocking the next step.

::card 04
### Data Steward Agent
识别现场口述中可能涉及客户或资产主数据的变化，说明影响并起草带证据的变更申请；审批和提交仍由规则流程完成。 || It detects potential customer or asset master-data changes in field input, explains their impact, and drafts evidence-backed change requests; rule-based flows still approve and commit them.
:::

:::callout { title: "Agent 数量原则 || Agent Count Principle" }
首期保持四个职责清晰、描述不重叠的 Agent。只有当新能力对应稳定用户目标、独立数据权限和独立验收指标时，才增加新的领域 Agent；新增一张表或一个接口不构成新增 Agent 的理由。 || The initial release keeps four agents with clear, nonoverlapping responsibilities. A new domain agent is added only when a capability maps to a stable user goal, independent data permissions, and independent acceptance measures; adding a table or API alone is not sufficient.
:::

## #agent-architecture 08 / Agent Collaboration :: 读取可以自动完成，草稿必须确认，写入回到确定性流程 || Reads Can Run Automatically, Drafts Require Confirmation, and Writes Return to Deterministic Flows

明确四个领域 Agent 的职责后，协同架构进一步规定它们如何安全协作。Copilot Studio 负责理解目标和编排步骤，但每种动作依据业务风险落在生成式、混合或确定性控制层。 || With the four domain agents defined, the collaboration architecture specifies how they work together safely. Copilot Studio interprets goals and orchestrates steps, while every action lands in a generative, hybrid, or deterministic control layer according to business risk.

:::insight-grid { cols: 3, title: "三层控制模型 || Three-Layer Control Model" }
::card 01
### 生成式层 · 查找与整理 || Generative Layer · Find and Organize
适用于读取工单、查找历史、理解自然语言、生成摘要和提出下一步问题。它受用户权限和可用数据约束，不产生最终写入。 || Used to read work orders, find history, interpret natural language, generate summaries, and ask the next question. It remains constrained by user permissions and available data and produces no final write.

::card 02
### 混合层 · 起草与确认 || Hybrid Layer · Draft and Confirm
适用于字段草稿、完成建议和主数据变化识别。AI 完成整理，用户在会话内确认、编辑或拒绝，确认点不能省略。 || Used for field drafts, completion suggestions, and master-data-change detection. AI organizes the information, while the user confirms, edits, or rejects it in the conversation; the checkpoint cannot be skipped.

::card 03
### 确定性层 · 校验与提交 || Deterministic Layer · Validate and Commit
适用于必填、范围、关闭、审批、并发检查和最终写入。规则按固定步骤执行，失败时返回明确原因和恢复动作。 || Used for required fields, ranges, closure, approval, concurrency checks, and final writes. Rules execute fixed steps and return explicit reasons and recovery actions on failure.
:::

:::flow
1. **理解目标 || Interpret the Goal** — 林工说出现场事实；编排器识别其中同时包含工单补充、客户信息变化和后续动作。 || Lin states the field facts; the orchestrator recognizes work-order completion, customer-data changes, and follow-up actions in the same message.
2. **读取上下文 || Read the Context** — Capture Agent 读取当前问卷进度，Data Steward Agent 读取允许变更的客户字段，Service Day Agent 读取未完成任务。 || The Capture Agent reads questionnaire progress, the Data Steward Agent reads permitted customer fields, and the Service Day Agent reads open tasks.
3. **合并草稿 || Compose the Draft** — 系统把工单答案、主数据变化和下一步分组展示，并为每一项附来源。 || The system presents work-order answers, master-data changes, and next actions in separate groups with a source for every item.
4. **用户确认 || User Confirmation** — 林工可以确认工单组、编辑主数据组并拒绝不相关建议；三组动作互不绑架。 || Lin can confirm the work-order group, edit the master-data group, and reject an irrelevant recommendation independently.
5. **规则提交 || Rule-Based Commit** — 工单内容经校验写入当前记录，主数据变化进入审批，后续动作创建为任务；每条结果返回成功、待审批或失败状态。 || Validated work-order content enters the current record, master-data changes enter approval, and follow-up actions become tasks; each result returns a succeeded, pending-approval, or failed state.
:::

:::callout { title: "可信赖输出规则 || Trustworthy Output Rule" }
访前简报和现场建议始终区分事实、推断与建议；事实必须链接原记录，推断必须列出依据，建议必须能够被接受、修改或忽略。用户无权访问的记录不得进入检索、提示词或摘要。 || Pre-visit briefs and field recommendations always separate facts, inferences, and recommendations. Facts link to source records, inferences state their evidence, and recommendations can be accepted, changed, or ignored. Records outside the user's access must not enter retrieval, prompts, or summaries.
:::

## #worked-example 09 / Worked Example :: 一句现场口述同时补充工单、识别客户变化并生成下一步 || One Field Utterance Completes the Work Order, Detects Customer Changes, and Creates the Next Step

结合上述 Agent 分工与三层控制边界，以下通过一次真实风格的现场交互展示最终用户看到的结果。所有内容先生成草稿，林工确认后才按各自路径提交。 || Building on the agent responsibilities and three-layer control boundaries, the following realistic interaction shows what the user receives. Everything begins as a draft and follows its own commit path only after Lin confirms it.

:::callout { title: "现场口述 || Field Utterance" }
今天拜访设备科王立主任。科室重点关注 mi-IoT 全院设备管理和常规附件服务，目前处于需求发展阶段；MIS 暂不涉及。客户没有未解决的服务问题，希望下周提供方案介绍，并补充档案：全院约 80,000 台设备，现有系统已全部覆盖。 || I met Director Wang Li in the Equipment Department today. The department is focused on mi-IoT hospital-wide equipment management and standard accessory services, currently in the needs-development stage; MIS is not in scope. There are no unresolved service issues. The customer wants a solution introduction next week, and the profile should note about 80,000 devices with full coverage by the existing system.
:::

:::insight-grid { cols: 4 }
::card 01
### 工单草稿 || Work-Order Draft
科室：设备科；被拜访人职务：主任；PMLS：mi-IoT、常规附件；方案阶段：需求发展阶段；MIS：不涉及。 || Department: Equipment; contact title: Director; PMLS: mi-IoT and standard accessories; solution stage: needs development; MIS: not in scope.

::card 02
### 问卷进度 || Questionnaire Progress
14 个字段中，表达式带入 3 项，Agent 从口述预填 7 项；当前仍有 4 项待确认，其中走访重点总结与待办事项为唯一必填字段。 || Of 14 fields, expressions fill three and the agent prefills seven from the spoken note. Four remain for review, with the visit summary and action items as the only required field.

::card 03
### 主数据变化 || Master-Data Changes
CustomerProfileLink 生成一项档案更新需求：全院设备总量约 80,000 台，现有设备管理系统已全院覆盖。确认后进入数据管理员审批。 || CustomerProfileLink creates one profile update request: about 80,000 devices and hospital-wide coverage by the existing equipment system. It enters data-steward approval after confirmation.

::card 04
### 下一步 || Next Step
生成“下周提供 mi-IoT 方案介绍”的待办；现场人员确认走访总结后提交工单，客户档案更新需求按独立路径审批。 || Create an action to provide the mi-IoT solution introduction next week. The technician submits after confirming the visit summary, while the profile update request follows its separate approval path.
:::

:::flow
1. **理解并分组 || Interpret and Group** — 系统把口述拆成工单事实、客户主数据变化和后续动作三组，不把所有内容混成一段摘要。 || The system separates the utterance into work-order facts, customer-master changes, and follow-up actions instead of mixing everything into one summary.
2. **规则校验 || Rule Validation** — CheckBox 与 Radio 只能使用模板选项，DatePicker 使用合法日期；必填走访总结未确认时阻止提交。 || CheckBox and Radio values must come from template options, DatePicker requires a valid date, and submission is blocked until the required visit summary is confirmed.
3. **分组确认 || Grouped Confirmation** — 林工可以确认工单草稿、编辑联系人并拒绝位置变化；每组选择独立。 || Lin can confirm the work-order draft, edit the contact, and reject the location change independently.
4. **分别提交 || Commit Separately** — 工单答案进入当前工单，客户变化进入审批，复查动作进入任务列表；页面分别显示成功、待审批或失败。 || Work-order answers enter the current order, customer changes enter approval, and the follow-up enters the task list; the page shows succeeded, pending-approval, or failed for each group.
:::

## #benefits 10 / Expected Benefits :: 一个核心结果指标、三个诊断指标与三条底线指标 || One Primary Measure, Three Diagnostic Measures, and Three Limits

判断这套做法是否值得推广，取决于三点：服务是否一次完成、单次维修的综合成本、以及关单到开票的周期。填写耗时与必填完整率用于解释结果的变化，不单独作为验收依据。下列数值为建议验收目标，不是已实现结果；试点开始前必须先建立现状基线。 || Whether this approach merits scaling rests on three points: whether the service is completed in one visit, the total cost of a single repair, and the closure-to-invoice cycle. Entry time and field completeness explain movements in these results but do not serve as acceptance criteria on their own. The figures below are proposed acceptance targets rather than achieved outcomes, and the current baseline must be established before the pilot starts.

:::insight-grid { cols: 3 }
::card A1
### 一次修复率高于现状 || First-Time Fix Above Baseline
同类工单中无需二次上门的比例。因备件不符、信息缺失或档案不一致而返场的计入未完成；因客户原因导致的改期单独统计。 || The share of comparable work orders that require no second visit. Returns caused by mismatched parts, missing information, or inconsistent records count as incomplete; customer-initiated reschedules are counted separately.

::card A2
### 单次维修的综合成本下降 || Lower Total Cost per Repair
将人工、路程、备件与返场成本归集到同一次故障，而不是按工单张数分摊。试点前后使用同一口径比较，才能区分真实节省与成本转移。 || Attribute labor, travel, parts, and return-visit cost to the same fault rather than spreading them across ticket counts. Comparing before and after on a single definition is what separates real savings from cost that has merely moved.

::card A3
### 关单到开票的周期缩短 || Shorter Closure-to-Invoice Cycle
关单资料完整、证据可追溯后，财务与保修索赔无需再向现场补取材料。测量关单到开票的中位天数，以及被退回补充材料的工单量。 || Once the closing record is complete and traceable, finance and warranty claims no longer collect missing evidence from the field. Measure the median days from closure to invoice and the volume of work orders returned for additional material.
:::

:::insight-grid { cols: 3 }
::card B1
### 访前准备时间缩短 || Shorter Pre-Visit Preparation
由多处检索记录改为阅读一页带来源的背景。测量从打开工单到能够说明本次任务、设备风险与未结事项所需的时间。 || Searching several records is replaced by reading one sourced page. Measure the time from opening a work order to being able to state the assignment, the equipment risk, and the open items.

::card B2
### 主动填写耗时下降 ≥ 40% || Active Entry Time Down by at Least 40%
以同类工单从开始输入到满足关单条件的主动操作时间为口径，对比试点前后的中位数；等待网络与维修本身的时间单独记录。该指标用于解释结果，不单独作为验收依据。 || Compare the median active operation time from first input to closure readiness for comparable work orders, recording network wait and repair time separately. This measure explains the result rather than substituting for it.

::card B3
### 必填完整率 ≥ 95% || Required-Field Completeness at or Above 95%
关单时由规则直接计算，并要求不低于现状。完整率必须与填写耗时同时评估，避免以增加负担换取数据完整。 || Calculated directly from rules at closure and required to be no worse than baseline. Completeness must be assessed together with entry time so that better data is not obtained by adding burden.
:::

:::insight-grid { cols: 3 }
::card C1
### 未经确认写入 = 0 || Unconfirmed Writes = 0
审计记录必须能把每一次业务写入对应到候选值、确认人和提交结果；任何对不上账的写入都视为验收失败。 || Audit records must connect every business write to its candidate value, its confirmer, and its commit result; any write that cannot be reconciled fails acceptance.

::card C2
### 客户信息直接写入 = 0 || Direct Writes to Customer Records = 0
客户和设备信息的每一处改动都要有对应的变更申请、证据、字段策略和审批结果；高风险字段只创建人工任务。 || Every change to customer and equipment records must have a matching request, evidence, field policy, and approval result; high-risk fields create human tasks only.

::card C3
### 离线场景不出现无提示的数据丢失 || No Unnoticed Data Loss in Offline Scenarios
断网采集、后台并发修改、联网重放与冲突审阅均需显示状态；系统不得将尚未提交的内容显示为已提交。 || Offline capture, concurrent back-office edits, reconnect replay, and conflict review must all display their state; the system must not present pending content as committed.
:::

:::callout { title: "测量口径 || Measurement Basis" }
试点前先记录同类工单的一次修复率、返场原因、关单到开票天数、填写耗时、完整率与客户信息修正次数，试点期间按同一口径比较。另有两项须一并检查：访前简报中的每条事实都能打开原始记录；第二类工单的上线工作量单独统计，用于判断框架是否可复用。单独优化某一指标可能只是转移成本，因此结果、诊断与底线三组必须同时通过。 || Before the pilot, record first-time fix, return causes, closure-to-invoice days, entry time, completeness, and customer-record corrections for comparable work orders, then compare on the same definitions during the pilot. Two further checks apply: every fact in the pre-visit brief must open its source record, and the effort to launch the second work-order type must be tracked separately to establish whether the framework is reusable. Optimizing a single measure may only relocate cost, so the primary, diagnostic, and limit measures must all pass together.
:::

## #licensing 11 / Recommended Product Configuration :: 复用现有 Microsoft 业务平台，把新增能力集中在移动体验与 Agent 编排 || Reuse the Existing Microsoft Business Platform and Concentrate New Work in Mobile Experience and Agent Orchestration

明确收益与治理目标后，下表列出各产品在方案中承担的职责与适用边界。具体许可、容量与 Azure 用量需根据现有合同、用户数、音频分钟和数据保留期单独核算。 || With benefit and governance targets defined, the table below lists each product's role and boundary in the solution. Licensing, capacity, and Azure consumption must be calculated separately from existing contracts, user counts, audio minutes, and retention requirements.

| 产品能力 || Product Capability | 承担职责 || Role in the Solution | 适用条件与边界 || Condition and Boundary |
| --- | --- | --- |
| Dynamics 365 Field Service Mobile | 复用工单、资产、服务任务、检查、相机、条码、签字与离线主路径 || Reuse work orders, assets, service tasks, inspections, camera, barcode, signature, and the offline core path | 客户已使用 Dynamics 365 Field Service 时优先选择；定制页面需在目标设备与离线模式中验证 || Preferred when Dynamics 365 Field Service is already used; custom pages require validation on target devices and offline mode |
| Power Apps 模型驱动应用 || Power Apps Model-Driven App | 在外部工单系统场景中承载独立移动体验，并复用 Entra ID、Dataverse、离线与 ALM || Host a separate mobile experience when work orders live externally while reusing Entra ID, Dataverse, offline, and ALM | 需要连接器适配现有工单、SLA 与主数据系统 || Requires connectors to adapt the existing work-order, SLA, and master-data systems |
| Microsoft Copilot Studio | 承载四个领域 Agent、生成式编排、自然补问和动态确认 || Hosts four domain agents, generative orchestration, natural follow-ups, and dynamic confirmation | 只调用场景级读取与草稿工具；不可逆动作进入确定性流程 || Calls scenario-level read and draft tools only; irreversible actions enter deterministic flows |
| Microsoft Dataverse | 保存问卷定义、采集会话、候选答案、证据、审批和审计记录 || Stores questionnaire definitions, capture sessions, candidate answers, evidence, approvals, and audit records | 不复制与移动场景无关的全量客户主数据 || Does not replicate customer master data unrelated to the mobile scenarios |
| Power Automate / Plug-in / Power Fx | 执行必填校验、关闭门禁、审批、条件写入、通知和重试 || Enforces required validation, closure gates, approval, conditional writes, notifications, and retries | 事务性与低延迟逻辑使用同步能力，长流程与通知使用异步流程 || Use synchronous capabilities for transactional and low-latency logic and asynchronous flows for long-running work and notifications |
| Azure Speech | 提供在线实时语音转写、领域短语与多语言能力 || Provides connected real-time transcription, domain phrases, and multilingual capability | 离线时回退到设备听写、文字或延后转写 || Falls back to device dictation, text, or deferred transcription when offline |
| Application Insights | 关联移动操作、Agent 计划、工具调用、延迟、失败与业务提交结果 || Correlates mobile actions, agent plans, tool calls, latency, failures, and business commit results | 敏感字段与转写文本需按隐私和保留策略限制采集 || Sensitive fields and transcripts require collection limits based on privacy and retention policy |

## #options 12 / Option Comparison :: 优先扩展现有 Field Service 移动端；没有该底座时再构建独立 Power Apps 外壳 || Extend the Existing Field Service Mobile App First; Build a Separate Power Apps Shell When That Foundation Does Not Exist

确定所需产品组件后，方案进一步比较三条移动实现路径。选型依据是现有工单平台、离线能力、治理复用与定制自由度，而不是单纯追求界面自由。 || With the required product capabilities established, the following comparison evaluates three mobile implementation paths. Selection follows the incumbent work-order platform, offline capability, governance reuse, and customization freedom rather than interface freedom alone.

| 维度 || Dimension | 扩展 Field Service Mobile || Extend Field Service Mobile | 独立 Power Apps 移动应用 || Separate Power Apps Mobile App | 自研原生应用 || Custom Native App |
| --- | --- | --- | --- |
| 适用前提 || Precondition | 客户已使用 Dynamics 365 Field Service || Dynamics 365 Field Service is already used | 工单在外部系统或需要独立体验 || Work orders live externally or require a separate experience | 平台无法满足专用设备或实时能力 || The platform cannot meet specialized device or real-time needs |
| 工单与资产能力 || Work-Order and Asset Capability | 原生复用 || Native reuse | 通过连接器适配 || Adapt through connectors | 全部自建 || Build everything |
| 离线主路径 || Offline Core Path | 已有离线优先能力 || Existing offline-first capability | 配置模型驱动应用离线范围 || Configure model-driven offline scope | 自行实现缓存、同步与冲突 || Build cache, sync, and conflict handling |
| 身份与治理 || Identity and Governance | 原生复用 Entra、Dataverse 与 DLP || Natively reuse Entra, Dataverse, and DLP | 复用 Entra、Dataverse、DLP 与 ALM || Reuse Entra, Dataverse, DLP, and ALM | 需单独建设 || Build separately |
| 体验自由度 || Experience Freedom | 中；受现有应用支持矩阵约束 || Medium; constrained by the existing app support matrix | 高；仍在 Power Platform 治理内 || High; remains under Power Platform governance | 最高；同时承担全部工程成本 || Highest; carries all engineering cost |
| 推荐判断 || Recommendation | 首选 || Preferred | 外部工单系统的适配路径 || Adaptation path for external work-order systems | 仅用于已验证的平台硬缺口 || Only for a validated hard platform gap |

:::callout { title: "推荐结论 || Recommendation" }
已有 Dynamics 365 Field Service 时先扩展现有移动端；工单仍在外部系统时使用独立 Power Apps 模型驱动应用。只有 PoC 证明目标设备、离线、实时音频或专用硬件存在平台硬缺口时，才把该能力局部下沉到原生组件。 || When Dynamics 365 Field Service already exists, extend its mobile app first. When work orders remain in an external system, use a separate Power Apps model-driven app. Move a capability into a native component only after the PoC proves a hard gap in target-device, offline, real-time audio, or specialized hardware support.
:::

## #cost 13 / Cost Estimation :: 先按向导确定技术选型，再生成逐条 SKU 的年度成本 || Fix the Technical Choices in a Wizard First, Then Generate Annual Cost by SKU

方案成本并非固定单一报价，而是取决于四项架构选型：是否以 Dynamics 365 Field Service 作为业务骨干、AI 推理走 Copilot Studio 编排还是前端轻量推理框架、是否部署 Azure Speech、是否启用 Application Insights。两条 AI 路径最终都以 Copilot Credits 结算，只是计量方式不同：编排按活动类型计费，轻量推理按 token 档位折算。向导预填 2026-08 查阅的美国商业渠道 USD list price，自动屏蔽不适用的计费项，并输出可导出的年度成本明细。全部字段已按一个 1,000 名技术员的参考场景填入初始值：单价取官方 list price，用量与工作量取可推导的规划值，每个字段均在说明中给出推导口径，替换任一输入即实时重算。此处仅核算成本投入，业务收益与回收期在投资回报测算中单独评估。 || Solution cost is determined by four architectural choices rather than a single quote: whether Dynamics 365 Field Service is the business backbone, whether reasoning runs through Copilot Studio orchestration or a lightweight front-end inference framework, whether Azure Speech is deployed, and whether Application Insights is enabled. Both AI paths ultimately settle in Copilot Credits and differ only in metering: orchestration bills by activity type while lightweight inference converts tokens at a tier rate. The wizard pre-fills US commercial-channel USD list prices retrieved in 2026-08, hides billing lines that do not apply, and produces an exportable annual cost detail. Every field ships with an initial value from one reference scenario of 1,000 technicians: unit prices use official list prices, while volumes and effort use derivable planning values whose basis is stated in each field description, and replacing any input recalculates immediately. This wizard computes investment only; benefit and payback are assessed separately in the ROI model.

:::sandbox { id: "fsbRoot", title: "确认计价口径与合同年限 || Confirm the Pricing Basis and Contract Term", canvas: false }
全部金额按美国商业渠道 USD list price 预填，合同年限决定合同期总成本。 || All amounts are pre-filled with US commercial-channel USD list prices, and the contract term determines the contract-term total.
:::

## #roi 14 / ROI Assessment :: 按金额排序测算：二次上门、技术员产能、开票周期与赔付，填写时间列末 || Model by Size: Second Visits, Technician Capacity, Invoicing Cycle, and Penalties, With Entry Time Last

成本估算向导得出的年度经常性成本与一次性投入，在此作为 ROI 分母直接引用，不重复填写。现场服务金额最大的一项成本是二次上门：单次上门的人工、车辆、路程与备件重新调拨合计，远高于同一张工单节省的填写时间，因此测算从该项开始。收益口径不填入未经客户确认的金额；发现阶段先收集返场率、单次上门综合成本、关单到开票天数与 SLA 事件，再由财务团队代入。 || The annual recurring cost and one-time investment from the cost estimation wizard serve directly as the ROI denominator and are not re-entered. The largest single cost in field service is the second visit: the labor, vehicle, travel, and re-picked parts of one visit together far exceed the entry time saved on the same work order, so the model starts there. The benefit basis inserts no unconfirmed customer amounts; discovery must first collect return rate, fully loaded cost per visit, closure-to-invoice days, and SLA events before finance supplies values.

:::insight-grid { cols: 4, title: "四项收益来源，按金额排序 || Four Sources of Benefit, in Order of Size" }
::card 01
### 减少二次上门 || Fewer Second Visits
出发前信息完整、现场追问准确，可减少因备件不符、档案不一致或漏检导致的返场。该项单笔金额最大，测算时使用单次上门的综合成本，而非仅计工时。 || Complete information before departure and precise follow-up questions on site reduce returns caused by mismatched parts, inconsistent records, or skipped checks. This is the largest single item, so use the fully loaded cost of a visit rather than labor hours alone.

::card 02
### 技术员产能释放 || Technician Capacity Released
返场、检索与补录减少后，同等人力可完成更多工单。仅在实际承接更多工作、减少加班或避免增员时折算为金额，节省的工时本身不构成现金收益。 || With fewer returns, less searching, and less catch-up entry, the same workforce completes more work orders. Convert this to money only when the capacity is actually used, overtime falls, or headcount is avoided; saved hours alone are not cash.

::card 03
### 开票加快与争议减少 || Faster Invoicing and Fewer Disputes
关单资料完整、证据可追溯，财务无需向现场补取材料，保修索赔通过率提高。收益体现为资金占用减少与争议处理成本下降。 || A complete, traceable closing record removes the need for finance to collect missing evidence and raises the pass rate of warranty claims. The benefit appears as less working capital tied up and lower dispute-handling cost.

::card 04
### 赔付、停机与档案修正 || Penalties, Downtime, and Record Corrections
更早识别临近超时与暂时无法执行的工单，可减少升级、赔付与加急调度；现场发现的客户信息变更经审批渠道提交后，后续派工与账单错误随之减少。 || Identifying at-risk and temporarily blocked work orders earlier reduces escalation, penalties, and expedited dispatch, while routing field-detected record changes through approval lowers downstream dispatch and billing errors.
:::

:::sandbox { id: "agentic-service-mobile-solution-sandbox-3", title: "投资回报测算器 || ROI Calculator", canvas: false }
技术员人数、工单量、采用率与人力成本已在成本估算向导中确定，此处不重复填写，而是随向导取值实时联动；金额一律按 USD。下列假设已预填保守规划值，发现阶段必须用客户基线逐项替换。 || Technician count, work-order volume, adoption, and labor cost are already set in the cost wizard; they are not re-entered here and update live with the wizard. All amounts are in USD. The assumptions below are pre-filled with conservative planning values and must be replaced item by item with the customer baseline during discovery.
:::

### 累计投入与累计收益的交点即回收时点 || The Crossing Point of Cumulative Cost and Benefit Is the Payback Moment

横轴为上线后的月份，纵轴为累计金额。投入曲线从一次性投入起步、按年度经常性成本线性增长；收益曲线从零起步，月度速率按 S 形采用曲线推进——试点期缓、推广期陡、接近全员采用时减速，因此累计收益先加速后趋于匀速。达到稳态后累计额仍按固定斜率上升，因为避免的返场与释放的工时每月持续发生；若认为收益会随时间衰减，应下调稳态假设或缩短合同期，本工具不预设衰减。两条线相交的月份即贴现后累计现金流转正的时点，两线均按资本成本逐月贴现。 || The horizontal axis is months after go-live and the vertical axis is the cumulative discounted amount. The cost curve starts at the one-time investment and grows with discounted recurring cost. The benefit curve starts at zero and its monthly rate follows an S-shaped adoption curve: slow during the pilot, steep during rollout, decelerating as it saturates. After saturation the cumulative amount still rises because avoided return visits and released hours recur every month; if benefit is expected to erode over time, lower the steady-state assumptions or shorten the contract term, because this tool assumes no erosion. The month where the curves cross is when discounted cumulative cash flow turns positive, and both curves are discounted monthly at the cost of capital.

累计投入 || Cumulative cost

累计收益 || Cumulative benefit

—

| 价值项 || Value Item | 计算口径 || Calculation Basis | 必须采集的基线 || Required Baseline |
| --- | --- | --- |
| 年度返场规避 || Annual Return Trips Avoided | 年度工单量 × 返场率下降 × 单次上门综合成本（人工 + 车辆 + 路程 + 备件重新调拨） || Annual work-order volume × reduction in return rate × fully loaded cost per visit (labor + vehicle + travel + re-picked parts) | 按返场原因分类的历史记录，以及单次上门的综合成本 || Historical returns classified by cause, plus the fully loaded cost of one visit |
| 年度产能释放 || Annual Capacity Released | 释放工时 × 兑现比例 × 综合小时成本 || Hours released × realization rate × loaded hourly cost | 人均日单量、加班时长与是否存在增员计划 || Jobs per technician per day, overtime hours, and any planned headcount increase |
| 现金流与争议改善 || Cash Flow and Dispute Improvement | 年开票金额 × 缩短天数 ÷ 365 × 资金成本率 ＋ 减少的争议单量 × 单次争议处理成本 || Annual invoiced amount × days saved ÷ 365 × cost of capital + reduction in disputed orders × cost per dispute | 关单到开票天数分布、退回补材料与争议处理记录 || Distribution of closure-to-invoice days, returned orders, and dispute-handling records |
| 赔付与修正规避 || Penalties and Corrections Avoided | 可避免的 SLA 事件 × 单次财务影响 ＋ 减少的错误变更 × 单次跨系统修正成本 || Avoidable SLA events × financial impact per event + reduced erroneous changes × cross-system correction cost per case | 预警、超时、升级、赔付历史与地址、联系人、账单错误的修正记录 || Warning, breach, escalation, and penalty history, plus correction records for address, contact, and billing errors |
| 填写时间（诊断项） || Entry Time (Diagnostic) | 现场人数 × 人均月工单 × 单单节省分钟 ÷ 60 × 综合小时成本 × 12 || Technicians × monthly orders per technician × minutes saved per order ÷ 60 × loaded hourly cost × 12 | 同类工单的主动填写时间分布；该项已包含在产能释放中，不重复计入收益 || Active entry-time distribution for comparable orders; already captured inside released capacity and not counted twice |

:::callout { title: "财务边界 || Financial Boundary" }
本文不提供许可单价、实施报价或三年净收益结论。首期试点只能量出基线和差异；正式 ROI 由财务团队按风险调整口径计算，把建设、数据准备、集成、许可与调用、评估测试、人工确认、培训和持续运维全部计入成本，再按低、基准、高三种情景分别取值。同一笔收益不得在两处重复计算，节省的工时也仅在实际被重新使用时才折算为金额。 || This proposal provides no license unit price, implementation quote, or three-year net-benefit conclusion. The initial pilot can only measure the baseline and the difference; formal ROI belongs to finance on a risk-adjusted basis, counting build, data preparation, integration, licensing and consumption, evaluation, human confirmation, training, and ongoing operations as cost, and running low, base, and high cases separately. No benefit may be counted in two places, and released hours convert to money only when they are genuinely reused.
:::

## #delivery-method 15 / Delivery Method :: 先建立证据，再共创高频场景，最后通过受控 ALM 推向生产 || Establish Evidence First, Co-Design Frequent Scenarios, Then Promote Through Governed ALM

明确 ROI 测量口径后，交付方法进一步规定如何分阶段落地。方案采用三段式方式，为业务基线、现场共创与生产治理分别设置明确产出，避免在需求尚未稳定时同时扩展多类工单。 || With ROI measurement defined, the delivery method specifies how to execute in stages. A three-stage method gives business evidence, field co-design, and production governance explicit outputs and avoids expanding multiple work-order types before requirements stabilize.

:::comparison { title: "三段式交付方式 || Three-Stage Delivery Method" }
::versus 阶段 1 · Evidence First || Stage 1 · Evidence First
### 先盘点两类工单与现状基线 || Inventory Two Work-Order Types and Establish the Baseline
确认字段、条件分支、客户主数据映射、现有耗时、一次修好率与返场原因、关单到开票天数、SLA、设备、离线和权限边界，输出锁定的试点范围与验收口径。 || Confirm fields, branches, customer-master mappings, current entry time, first-time fix and return causes, closure-to-invoice days, SLA, devices, offline scope, and permissions, producing a locked pilot scope and acceptance definitions.

::versus 阶段 2 · Field Co-Design || Stage 2 · Field Co-Design { highlight: true }
### 围绕四个页面与真实一天共创 || Co-Design Around Four Screens and a Real Service Day
现场人员每周使用可运行版本，验证追问顺序、语音词汇、离线恢复、确认粒度和访前简报；一次只调整一个变量并保留对照。 || Technicians use a working release every week to validate question order, speech vocabulary, offline recovery, confirmation granularity, and pre-visit briefs; change one variable at a time and retain comparison data.

::versus 阶段 3 · Governed Promote || Stage 3 · Governed Promote
### 通过 Solution、Pipeline 与审计进入生产 || Promote Through Solutions, Pipelines, and Audit
Dev、Test、UAT、Prod 环境分离；问卷、Agent、连接器、规则与权限纳入 Solution 和版本控制，发布前通过离线、角色、并发和回滚测试。 || Separate Dev, Test, UAT, and Prod. Place questionnaires, agents, connectors, rules, and permissions under solutions and version control, and pass offline, role, concurrency, and rollback testing before release.
:::

## #roadmap 16 / Implementation Roadmap :: 12 周用两类工单和一类主数据变化验证闭环，再决定是否规模化 || Validate the Loop in 12 Weeks With Two Work-Order Types and One Master-Data Change Before Scaling

确定三段式交付节奏后，实施路线图进一步给出首期范围、四阶段计划和继续投资门槛。试点集中在一个区域与目标设备，不同时扩展更多工单类型。 || With the three-stage delivery cadence set, the implementation roadmap defines the initial scope, four-phase plan, and continued-investment gates. The pilot stays within one region and the target devices and does not expand additional work-order types in parallel.

:::insight-grid { cols: 4, title: "首期试点范围 || Initial Pilot Scope" }
::card 01
### 2 类高频工单 || Two Frequent Work-Order Types
字段与条件分支明显不同，覆盖语音、照片、测量值、备件、签字与关闭门禁。 || Use types with materially different fields and branches covering voice, photos, measurements, parts, signature, and closure gates.

::card 02
### 1 类中风险主数据变化 || One Medium-Risk Master-Data Change
选择服务地址或现场联系人，完整验证证据、确认、审批和并发冲突。 || Choose service address or site contact and fully test evidence, confirmation, approval, and concurrency conflict.

::card 03
### 10–20 名现场人员 || 10–20 Technicians
同时纳入 2 名调度或主管与 1–2 名数据管理员，覆盖真实角色和权限差异。 || Include two dispatchers or supervisors and one or two data stewards to cover real roles and permission differences.

::card 04
### 1 个区域与目标设备 || One Region and Target Devices
使用真实手机和平板、在线与离线脚本，以及脱敏或正式授权的数据集。 || Use real phones and tablets, connected and offline scripts, and a de-identified or formally authorized dataset.
:::

:::flow
1. **第 1–2 周 · 发现与基线 || Weeks 1–2 · Discovery and Baseline** — 盘点字段、分支、主数据映射、现有耗时、返工、SLA、角色、设备与离线边界，确认试点门槛。 || Inventory fields, branches, master-data mappings, current time, rework, SLA, roles, devices, and offline boundaries and confirm pilot gates.
2. **第 3–5 周 · 移动主路径 || Weeks 3–5 · Mobile Core Path** — 完成四个页面、问卷版本、可恢复采集、完整表单、离线草稿和关闭门禁，先验证无 AI 时的业务正确性。 || Complete the four screens, questionnaire versioning, resumable capture, full form, offline drafts, and closure gate, validating business correctness before AI enhancement.
3. **第 6–9 周 · Agent 与受控写入 || Weeks 6–9 · Agents and Governed Writes** — 接入语音、四个 Agent、草稿确认、主数据申请、审批、并发检查与审计，并完成角色和故障测试。 || Add speech, four agents, draft confirmation, master-data requests, approval, concurrency checks, and audit and complete role and failure testing.
4. **第 10–12 周 · 实地试点与决策 || Weeks 10–12 · Field Pilot and Decision** — 真实执行并按同一口径比较耗时、完整率、采纳、SLA、主数据和离线恢复；所有门槛通过后再扩展区域与工单类型。 || Run real work and compare time, completeness, adoption, SLA, master data, and offline recovery using the same definitions; expand regions and work-order types only after all gates pass.
:::

| 指标 || Metric | 建议门槛 || Proposed Gate | 未通过时 || If the Gate Fails |
| --- | --- | --- |
| 一次修复率 || First-Time Fix | 高于现状，且返场原因可逐条归类 || Above baseline, with every return classified by cause | 先核查访前简报与备件信息是否到位，暂不扩展工单类型 || Verify whether the pre-visit brief and parts information actually arrived; do not expand work-order types yet |
| 主动填写耗时 || Active Entry Time | 相对现状中位数降低 ≥ 40% || At least 40% below the baseline median | 调整追问、确认粒度与界面，不扩工单类型 || Adjust follow-ups, confirmation granularity, and screens; do not expand types |
| 必填完整率 || Required-Field Completeness | ≥ 95%，且不低于现状 || At least 95% and no worse than baseline | 修正规则与字段映射 || Correct rules and field mappings |
| 未经确认写入 || Unconfirmed Writes | 0 次 || Zero | 停止试点并修复控制边界 || Stop the pilot and repair control boundaries |
| 客户主数据直接写入 || Direct Customer-Master Writes | 0 次 || Zero | 停止相关能力并审计全部变更 || Disable the capability and audit every change |
| 访前事实引用 || Pre-Visit Fact Citation | 100% 可打开来源 || 100% open a source | 未引用内容降级为推断或删除 || Downgrade uncited content to inference or remove it |
| 离线恢复 || Offline Recovery | 脚本场景零静默丢失 || Zero silent loss in scripted scenarios | 不得扩大试点设备与区域 || Do not expand devices or regions |

## #references 17 / References :: 参考来源 || References

下列资料分别支撑工单与移动能力、问卷版本与逻辑、离线、编排与确认、语音、SLA、审计、并发和渐进披露。客户现状与字段规模来自本次业务输入，实施前仍需以发现阶段盘点结果校准。 || The sources below support work-order and mobile capability, questionnaire versioning and logic, offline behavior, orchestration and confirmation, speech, SLA, audit, concurrency, and progressive disclosure. Customer state and field scale come from the current business brief and still require discovery-stage calibration before implementation.

- [1] Microsoft Learn · Dynamics 365 Field Service 概览 — https://learn.microsoft.com/en-us/dynamics365/field-service/overview | 支撑工单生命周期、移动服务人员、资产历史、调度、库存与 Copilot 工单摘要等官方能力边界。 || Supports the official work-order lifecycle, mobile technician, asset history, scheduling, inventory, and Copilot work-order summary boundaries.
- [2] Microsoft Learn · Field Service Mobile 概览 — https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/overview | 支撑 iOS、Android、Windows、离线优先、相机、条码、语音转文字、检查与报告等移动能力。 || Supports iOS, Android, Windows, offline-first, camera, barcode, speech-to-text, inspections, and reporting capabilities.
- [3] Microsoft Learn · 在工单中使用检查 — https://learn.microsoft.com/en-us/dynamics365/field-service/inspections | 支撑检查题型、移动执行、必填、附件、服务任务关联，以及单任务仅保留最新响应等限制。 || Supports inspection question types, mobile execution, required answers, attachments, service-task association, and the latest-response-only limitation per task.
- [4] Microsoft Learn · 检查高级配置 — https://learn.microsoft.com/en-us/dynamics365/field-service/inspections-advanced | 支撑条件逻辑、分支、新版本行为、JSON 导出与多语言；官方说明旧发布版本不保留，现有服务任务保留创建时版本。 || Supports conditional logic, branching, revision behavior, JSON export, and translations; official guidance states that prior published versions are not retained while existing service tasks keep their creation-time version.
- [5] Microsoft Learn · 模型驱动应用移动离线概览 — https://learn.microsoft.com/en-us/power-apps/mobile/mobile-offline-overview | 支撑离线优先、本地数据、自动同步、冲突处理与离线表范围配置。 || Supports offline-first local data, automatic synchronization, conflict handling, and offline-table scope configuration.
- [6] Microsoft Learn · Copilot Studio 生成式编排 — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-orchestration | 支撑自动补问、工具选择、事件触发、确定性/混合/生成式控制层与敏感动作确认。 || Supports auto-prompting, tool selection, event triggers, deterministic/hybrid/generative control layers, and confirmation for sensitive actions.
- [7] Microsoft Learn · 使用 Adaptive Card 提问 — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-ask-with-adaptive-card | 支撑动态输入、输出变量、重试、唯一提交标识与防止旧卡片重复提交。 || Supports dynamic inputs, output variables, retries, unique submit identifiers, and prevention of duplicate submissions from stale cards.
- [8] Microsoft Learn · Azure Speech to Text 概览 — https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-to-text | 支撑实时、快速与批量转写、领域短语表、多语言检测与自定义语音模型。 || Supports real-time, fast, and batch transcription, phrase lists, language detection, and custom speech models.
- [9] Microsoft Learn · Dynamics 365 SLA 配置 — https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/define-service-level-agreements | 支撑 SLA KPI、营业时间、暂停与恢复、预警、失败和 Power Automate 动作。 || Supports SLA KPIs, business hours, pause and resume, warning, failure, and Power Automate actions.
- [10] Microsoft Learn · 管理 Dataverse 审计 — https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing | 支撑环境、表、列级审计、保留期、变更前后值与审计容量边界。 || Supports environment-, table-, and column-level audit, retention, before-and-after values, and audit-capacity boundaries.
- [11] Microsoft Learn · Dataverse 条件操作与 ETag — https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/perform-conditional-operations-using-web-api | 支撑 `If-Match`、乐观并发与 `412 Precondition Failed` 冲突路径。 || Supports `If-Match`, optimistic concurrency, and the `412 Precondition Failed` conflict path.
- [12] Microsoft Learn · Dataverse 批量操作最佳实践 — https://learn.microsoft.com/en-us/power-apps/developer/data-platform/optimize-performance-create-update | 支撑批量 API 支持范围、整批失败风险、服务保护限制、重试与并行度建议。 || Supports bulk API coverage, whole-operation failure risk, service-protection limits, retry, and parallelism guidance.
- [13] Nielsen Norman Group · Progressive Disclosure — https://www.nngroup.com/articles/progressive-disclosure/ | 支撑先呈现高频核心选项、按需展开次要内容，以及线性分阶段披露不适合频繁往返任务的交互判断。 || Supports showing frequent core options first, revealing secondary content on demand, and avoiding staged linear disclosure for tasks requiring frequent back-and-forth.
- [14] Forrester Total Economic Impact · Dynamics 365 Field Service（Microsoft 委托） — https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2024/02/05/forrester-study-finds-346-roi-when-modernizing-service-operations-with-microsoft-dynamics-365-field-service/ | 支撑第 01 章引用的量级：基于 1,000 名技术员、50 名调度员和 150 名管理者的复合组织，三年 346% ROI、避免 12% 二次上门、技术员产能最高提高 14%。该研究评估的是整体现场服务现代化，不是本方案的增量，也不能当作收益承诺。 || Supports the order of magnitude cited in Chapter 01: a composite organization of 1,000 technicians, 50 dispatchers, and 150 managers with 346% three-year ROI, 12% of repeat visits avoided, and technician productivity up to 14% higher. The study evaluates overall field-service modernization rather than the increment of this proposal and is not a benefit commitment.
- [15] Knowledge Hub · 重构 AI 时代的客户经营 | 本文的上位文章，提供客户旅程六阶段、六项运行能力（感知、理解、决策、协同、执行、学习）、人机责任分级与交付和现场服务愿景；本文是其中现场执行分支的垂直展开。 || The parent article for this proposal. It defines the six customer-journey stages, the six operating capabilities (sense, understand, decide, coordinate, act, learn), the human-agent accountability levels, and the delivery and field-service vision; this proposal expands the field-execution branch of that vision.
- [16] Azure · Speech 服务定价 — https://azure.microsoft.com/en-us/pricing/details/speech/ | 支撑报价明细中的语音单价参考：按量付费实时语音转文本 USD 1.00 / 音频小时，Neural 语音合成 USD 15 / 百万字符，并含 F0 免费额度（每月 5 音频小时与 50 万字符）；官方页面声明价格为估算，实际取决于协议、购买时间与汇率。2026-08 查阅。 || Supports the speech unit prices cited in the quote detail: pay-as-you-go real-time speech-to-text at USD 1.00 per audio hour and Neural text-to-speech at USD 15 per 1M characters, with an F0 free grant of five audio hours and 0.5M characters per month. The official page states prices are estimates and depend on agreement, purchase date, and exchange rate. Retrieved 2026-08.
- [17] Azure · Functions 定价 — https://azure.microsoft.com/en-us/pricing/details/functions/ | 支撑语音代理托管成本口径：消耗计划按 USD 0.20 / 百万次执行加 USD 0.000016 / GB-s 计费，每月含 100 万次执行与 400,000 GB-s 免费额度，且存储账户按标准存储费率单独计费。2026-08 查阅。 || Supports the speech-proxy hosting basis: the Consumption plan bills USD 0.20 per million executions plus USD 0.000016 per GB-s, includes a monthly free grant of one million executions and 400,000 GB-s, and bills the required storage account separately at standard storage rates. Retrieved 2026-08.
- [18] Microsoft Learn · Copilot Studio 计费费率与管理（标准 harness） — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management | 支撑成本向导中的 Copilot Credits 口径：自 2025-09-01 起计费货币由 messages 改为 Copilot Credits；官方费率为经典回答 1、生成式回答 2、Agent action 5、租户图谱接地 10 Copilot Credits，文本与生成式 AI 工具基础/标准/高级档每 10 次响应分别为 1/15/100 Copilot Credits。本文取标准档 1.5 Credits/次作为 AI 工具默认口径。文档更新日期 2026-08-03。 || Supports the Copilot Credits basis in the cost wizard: since 2025-09-01 the billing currency changed from messages to Copilot Credits; official rates are 1 for classic answers, 2 for generative answers, 5 for agent actions, and 10 for tenant graph grounding, while basic, standard, and premium text and generative AI tools bill 1, 15, and 100 Copilot Credits per 10 responses. This article uses the standard tier at 1.5 credits per response as the AI-tool default. Document updated 2026-08-03.
- [19] Microsoft Learn · AI 工具与 AI Builder 的 Copilot Credits 计费 — https://learn.microsoft.com/en-us/ai-builder/message-management | 支撑前端 Prompt 管线同样以 Copilot Credits 结算的结论：Power Apps 与 Power Automate 中的 prompt 在无 AI Builder credits 或超额时消耗 Copilot Credits，换算率为基础档 0.1、标准档 1.5、高级档 10 Copilot Credits / 1K tokens；自带模型（BYOM）时调用计作一次 agent action，模型处理成本改由 Foundry 的 token 单价单独结算。另据 AI Builder Prompt tokens 文档，输入 token 含约 1,200 tokens 的不可见系统元提示词。文档更新日期 2026-06-16。 || Supports the conclusion that the front-end prompt pipeline also settles in Copilot Credits: prompts in Power Apps and Power Automate consume Copilot Credits when AI Builder credits are unavailable or in overage; conversion rates are 0.1, 1.5, and 10 Copilot Credits per 1K tokens for basic, standard, and premium tiers. With bring-your-own-model the invocation counts as one agent action and model processing is billed separately by Foundry token price. The AI Builder prompt-tokens article adds that input tokens include an invisible system metaprompt of about 1,200 tokens. Document updated 2026-06-16.
- [20] Microsoft Learn · Power Platform 许可 FAQ — https://learn.microsoft.com/en-us/power-platform/admin/powerapps-flow-licensing-faq | 支撑成本明细中的美国商业渠道 list price：Power Apps Premium USD 20 / 用户 / 月、Dataverse Database Capacity USD 40 / GB / 月、Dataverse File Capacity USD 2 / GB / 月。文档更新日期 2026-08-14。 || Supports the US commercial-channel list prices in the cost detail: Power Apps Premium at USD 20 per user/month, Dataverse Database Capacity at USD 40 per GB/month, and Dataverse File Capacity at USD 2 per GB/month. Document updated 2026-08-14.
- [21] Microsoft · Copilot Studio Licensing Guide — https://go.microsoft.com/fwlink/?linkid=2320995 | 支撑 Copilot Credits 的美国 list price：PAYG USD 0.01 / Credit；预付容量包 USD 200 / 25,000 Credits / 月，按年付费且未用容量不结转。2026-08 版。 || Supports US list prices for Copilot Credits: PAYG at USD 0.01 per credit and a prepaid capacity pack at USD 200 for 25,000 credits/month, paid yearly with unused capacity not carried forward. August 2026 edition.
- [22] Microsoft · Dynamics 365 Field Service 定价 — https://www.microsoft.com/en-us/dynamics-365/products/field-service/pricing | 支撑 Dynamics 365 Field Service 的美国 list price：USD 105 / 用户 / 月，按年付费。2026-08 查阅。 || Supports the US list price for Dynamics 365 Field Service: USD 105 per user/month, paid yearly. Retrieved 2026-08.
- [23] Azure · Monitor 定价 — https://azure.microsoft.com/en-us/pricing/details/monitor/ | 支撑 Application Insights 使用的 Analytics Logs PAYG 参考价 USD 2.30 / GB；官方说明实际价格随协议、购买时间、区域和汇率变化。2026-08 查阅。 || Supports the Analytics Logs PAYG reference price of USD 2.30 per GB used for Application Insights; Microsoft states that actual pricing varies by agreement, purchase date, region, and exchange rate. Retrieved 2026-08.
- [24] Microsoft Learn · Dataverse 容量存储 — https://learn.microsoft.com/en-us/power-platform/admin/capacity-storage | 支撑向导中的容量口径：租户总权益由“租户默认容量 + 每用户许可累计 + 额外加购”构成，数据库、文件与日志分开计量，且并非所有许可都提供每用户权益；Dynamics 365 企业版应用的具体每用户数值需查 Dynamics 365 Licensing Guide。文档更新日期 2026-08-17。 || Supports the capacity basis used in the wizard: tenant entitlement is composed of tenant default capacity plus per-user license accrual plus purchased add-ons, database, file, and log are metered separately, and not every license grants per-user entitlement; the specific per-user values for Dynamics 365 enterprise applications must be taken from the Dynamics 365 Licensing Guide. Document updated 2026-08-17.
- [25] 业务需求输入 · 2026-07-10 | 支撑数百字段工单与客户主数据、渐进式语音补齐、SLA 关注和访前历史归纳四项业务需求；不包含可直接引用的耗时或错误率基线。 || Supports the four business needs: work orders and customer master data with hundreds of fields, progressive voice completion, SLA visibility, and pre-visit history synthesis. It contains no directly citable time or error-rate baseline.

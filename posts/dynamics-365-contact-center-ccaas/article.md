---
title: "Microsoft Dynamics 365 Contact Center：让客户对话成为可治理的业务行动 || Microsoft Dynamics 365 Contact Center: Turn Customer Conversations into Governed Business Action"
eyebrow: "Microsoft Agentic Service 方案指南 || Microsoft Agentic Service Solution Guide"
brand: D365 CC
date: 2026-07-07
strict_i18n: false
strict_density: true
lead: "Dynamics 365 Contact Center 把渠道、Copilot、业务数据、人员协作与自动化流程连接到 Microsoft Cloud。每次客户接触都可以在企业既有身份、权限与合规边界内，转化为识别意图、查询记录、创建工单、触发派工、完成人工接管并回写结果的服务执行链。 || Dynamics 365 Contact Center connects channels, Copilot, business data, human collaboration, and automated workflows across Microsoft Cloud. Each customer interaction can become a service-execution chain—under existing enterprise identity, permission, and compliance controls—that identifies intent, retrieves records, creates work, triggers fulfillment, hands off to people, and writes outcomes back."
hero_actions:
  - "了解微软执行优势 || Explore Microsoft's Execution Advantage | #why-microsoft"
  - "规划 90 天试点 || Plan a 90-Day Pilot | #adoption"
panel_label: "核心主张 || Core Thesis"
panel_title: "Dynamics 365 Contact Center 是 Microsoft Cloud 中的 Agentic Service 执行层：不只处理对话，也让人、Copilot 与 AI agent 共同把客户事务办完。 || Dynamics 365 Contact Center is the Agentic Service execution layer of Microsoft Cloud: it not only handles conversations, but helps people, Copilot, and AI agents complete customer work together."
panel_desc: "对已经采用 Microsoft 365、Teams、Azure、Power Platform 或 Dynamics 365 的企业，联络中心升级可以复用既有云、身份、数据与治理资产，而不是再建设一座技术孤岛。 || For enterprises already using Microsoft 365, Teams, Azure, Power Platform, or Dynamics 365, contact-center modernization can reuse existing cloud, identity, data, and governance assets instead of building another technology silo."
panel:
  - "理解：统一渠道、客户身份、CRM 上下文与意图 || Understand: unify channels, customer identity, CRM context, and intent"
  - "执行：用 Copilot Studio、Power Platform 与业务系统完成动作 || Execute: complete actions through Copilot Studio, Power Platform, and business systems"
  - "协作：让座席、专家与 Teams 在关键节点接管和协同 || Collaborate: bring representatives, experts, and Teams into critical handoffs"
  - "治理：复用 Entra、Purview 与企业合规体系控制全过程 || Govern: reuse Entra, Purview, and enterprise compliance across the process"
metrics:
  - "公开定价基准 || Public Price Baseline | $110/用户/月 || /user/mo | Digital + Voice；按年计费，Copilot Credits 与 Teams Phone 扩展另计 || Digital + Voice; billed annually, with Copilot Credits and Teams Phone extensibility separate"
  - "Forrester 预测 ROI || Forrester Projected ROI | 100–345% | D365 Contact Center 复合组织预测区间（含 Teams Phone 整合）；属参考非承诺 || Projected range for a D365 Contact Center composite (with Teams Phone consolidation); a reference, not a guarantee"
  - "CRM 自由度 || CRM Freedom | 可保留 || Keep Yours | 官方定义为接入“你选择的 CRM”；ServiceNow 标准连接器将 Account、Contact 单向复制到 Dataverse，保留原 CRM 作为业务主系统 || Official docs define it as working with the CRM of your choice; the standard ServiceNow connector copies Account and Contact into Dataverse while retaining the source CRM as the business system of record"
  - "通话处理时间 || Call Handling Time | 13–40%↓ | Forrester 在 D365 Contact Center 复合组织中观察到的通话处理时间下降区间 || Call-handling-time reduction range Forrester observed in a D365 Contact Center composite"
style:
  accent: "#a855f7"
---

## #trends 01 / Industry Trends and Findings :: AI 价值向服务集中，但体验、人才与数据压力同步上升 || AI Value Is Concentrating in Service While Experience, Workforce, and Data Pressures Rise

四项行业发现界定了 CCaaS 评估的外部环境：服务已成为 AI 价值的重要来源，但客户体验下滑、座席流失和数据割裂同时提高了维持现状的成本。 || Four industry findings frame the external environment for CCaaS evaluation: service has become a major source of AI value, while declining customer experience, representative attrition, and disconnected data raise the cost of maintaining the status quo.

:::insight-grid { cols: 4, title: "行业趋势与发现 || Industry Trends and Findings" }
::card 38%
### AI 的价值正集中到服务 || AI Value Is Concentrating in Service
支持类职能已贡献企业从 AI 获得的商业价值的 **38%**，说明服务是 AI 投资的高回报入口。来源：BCG《Where's the Value in AI》，2024 年 10 月。 || Support functions already account for **38%** of the business value enterprises get from AI, indicating service is a high-return entry point for AI investment. Source: BCG, Where's the Value in AI, October 2024.

::card 25%
### 体验预期在升，满意度未跟上 || Expectations Rise, Satisfaction Lags
**25%** 的品牌在客户体验排名中下滑，仅靠增加人手难以维持体验。来源：Forrester 2025 US Customer Experience Index。 || **25%** of brands dropped in customer experience rankings, showing that adding headcount alone cannot sustain experience. Source: Forrester 2025 US Customer Experience Index.

::card 37%
### 座席流失推高成本 || Attrition Drives Up Cost
客户服务座席的估计流失率约 **37%**，招聘与培训成本持续侵蚀服务预算。数据为行业普遍引用的估计，微软 FY26 CCaaS 材料亦援引。 || Estimated turnover for customer service reps is about **37%**, with hiring and training cost continually eroding the service budget. This is a widely cited industry estimate, also referenced in Microsoft's FY26 CCaaS materials.

::card 87%
### 数据割裂造成运营盲区 || Disconnected Data Creates Blind Spots
**87%** 的组织受困于分散、割裂的数据，主管只能事后、被动决策。数据为行业普遍引用的估计，微软 FY26 CCaaS 材料亦援引。 || **87%** of organizations struggle with fragmented, disconnected data, leaving supervisors to decide reactively after the fact. This is a widely cited industry estimate, also referenced in Microsoft's FY26 CCaaS materials.
:::

## #challenge 02 / Operating Challenges :: 行业压力归结为旅程、上下文、AI 治理与实时运营四项要求 || Industry Pressure Resolves into Four Requirements: Journeys, Context, AI Governance, and Live Operations

这些趋势不是四个孤立数字。它们共同要求联络中心跨渠道保持服务连续性、把业务上下文带入会话、约束 AI 行为，并让主管在运营发生时获得信号。 || These trends are not four isolated figures. Together, they require contact centers to preserve service continuity across channels, bring business context into conversations, govern AI behavior, and give supervisors signals while operations are unfolding.

:::insight-grid { cols: 4, title: "四项运营挑战 || Four Operating Challenges" }
::card 01
### 客户不再按企业的渠道分工来提问 || Customers Do Not Follow the Enterprise Channel Map
同一个问题可能从电话开始，转到在线聊天、短信、社交消息或邮件。若系统只按渠道分开管理，座席会重复询问，主管也难以看到完整服务链路。 || The same issue may begin on voice and move to live chat, SMS, social messaging, or email. If systems are managed channel by channel, agents repeat questions and supervisors lose the full service journey.

::card 02
### CRM 上下文与联络中心经常分离 || CRM Context Often Sits Apart from Contact Center Work
服务代表处理电话时需要客户、订单、合同、历史工单和知识库。若这些信息分散在不同系统，平均处理时长、转接率和培训成本都会上升。 || Representatives need customer, order, contract, case history, and knowledge context during interactions. When this context is split across systems, average handling time, transfer rate, and training cost rise.

::card 03
### AI 让自助率可提升，也放大治理要求 || AI Can Raise Self-Service Rates and Raises Governance Needs
实时语音 agent、意图识别和自动摘要能减少人工负担，但它们依赖高质量知识、明确工具边界、错误回退和人工接管机制。 || Real-time voice agents, intent detection, and automatic summaries can reduce manual workload, but they depend on high-quality knowledge, clear tool boundaries, fallback paths, and human handoff.

::card 04
### 主管需要实时信号，不只需要事后报表 || Supervisors Need Live Signals, Not Only Retrospective Reports
队列积压、等待时长、服务水平、放弃率和人员状态需要在运营中被看见。若只能隔日复盘，排班和质量干预会错过窗口。 || Queue backlog, wait time, service level, abandon rate, and representative availability need to be visible during operations. If insights arrive the next day, staffing and quality interventions miss the window.
:::

## #root-causes 03 / Root Causes :: 点对点拼接把渠道、CRM、数据与外挂 AI 固化为运营阻力 || Point-to-Point Integration Turns Channels, CRM, Data, and Bolted-On AI into Operating Friction

四项运营要求难以满足，根源往往不在单点功能缺失，而在多年叠加的渠道、CCaaS、CRM、数据与 AI 各自运行，只能依赖脆弱接口维持协作。 || The four operating requirements are difficult to meet rarely because individual features are missing, but because channels, CCaaS, CRM, data, and AI have accumulated as separate systems that depend on brittle interfaces to work together.

当前典型服务栈大多并非一次规划成型，而是多年应对紧急需求逐步叠加工具的结果：渠道、CCaaS、AI、数据、CRM 与生产力工具各成一套，AI 多为外挂，数据分散在各系统之间。 || A typical service stack today is rarely designed all at once; it accumulates over years as tools are layered onto urgent needs. Channels, CCaaS, AI, data, CRM, and productivity tools each stand alone, with bolted-on AI and data scattered across systems.

典型服务栈：上层渠道、中层 CCaaS、底层系统，点对点拼接 || A Typical Service Stack: Channels on Top, CCaaS in the Middle, Systems Below

互动渠道 || Engagement channels

外挂 AI || Bolted-on AI

在线聊天 || Live chat

社交 || Social

邮件 || Email

短信 || SMS

视频 || Video

语音 || Voice

客户 || Customers

→

从这里发起联系 || initiate contact here

⇄

CCaaS 平台 || CCaaS platform

外挂 AI || Bolted-on AI

流程 || Flows

技能 || Skills

电话 || Telephony

座席桌面 || Agent desktop

管理 || Administration

路由 || Routing

队列 || Queues

排班管理 || Workforce management

IVR

分析与报表 || Analytics + reporting

录音 || Recordings

转写 || Transcripts

⇄

企业系统 || Enterprise resources

外挂 AI || Bolted-on AI

CRM

销售 || Sales

市场 || Marketing

记录系统 || Systems of record

身份 || Identity

服务团队 || Service teams

⇕

在此办公（CRM / 记录系统） || work here (CRM / systems of record)

生产力应用 || Productivity apps

协作 || Collaboration

文档 || Docs

邮件 || Email

云存储 || Cloud storage

AI 服务 || AI services

虚拟座席 || Virtual agents

语音合成与识别 || TTS + STT

座席辅助 || Agent assist

数据科学 || Data science

内容智能 || Content intelligence

客户 || Customers

←

在此获得 AI 体验 || receive AI experiences here

数据平台 || Data platform

外挂 AI || Bolted-on AI

数据湖 || Data lake

报表 || Reporting

数据仓库 || Data warehouse

商业智能 || Business intelligence

客户 || Customers

←

在此获得数据洞察 || receive data insights here

读图：灰色圆点是人的接触点——客户从渠道发起联系、由 AI 服务与数据平台服务，服务团队则在企业系统（CRM / 记录系统）侧办公；这些接触点分散在不同系统上，彼此不天然连通。红色 ⇄ 是系统间的点对点集成——正是这些脆弱接缝让整套栈难以维护；标注“外挂 AI”的系统，其 AI 多为后期叠加。 || How to read it: the grey dots are human touchpoints — customers initiate contact through channels and are served by AI services and the data platform, while service teams work on the enterprise-systems (CRM / systems-of-record) side; these touchpoints land on different systems and are not naturally connected. The red ⇄ marks point-to-point integrations between systems — these fragile seams make the whole stack hard to maintain; systems tagged 'Bolted-on AI' have AI added later.

:::callout { title: "为什么这会成为问题 || Why This Becomes a Problem" }
拼凑式架构运行成本高、脆弱、难以变更：它拖慢 IT、拖累一线团队、把数据困在孤岛，并阻碍 AI 产生价值。**86%** 的 IT 领导者认为这类拼凑式技术栈同时带来财务压力与新的安全风险，已把整合列为优先事项（来源：Nintex《Software sprawl》，2025 年 6 月，为 IT 领导者自评）。微软援引的分析师估计显示，约 **60%–80%** 的 IT 预算被用于维护这类遗留与割裂系统（分析师估计区间，非单一实测值）。因此，服务升级不能只增加渠道或外挂 AI，而要重新安排人、Copilot 与 AI agent 在统一上下文和治理下的分工。 || A patchwork architecture is expensive to run, brittle, and hard to change: it slows IT, frustrates frontline teams, traps data in silos, and blocks AI from delivering value. **86%** of IT leaders say such patchwork tech stacks create both financial strain and new security risks and have made consolidation a priority (source: Nintex, Software sprawl, June 2025, an IT-leader self-report). Analyst estimates cited by Microsoft put roughly **60%–80%** of IT budgets into maintaining these legacy and fragmented systems (an analyst estimate range, not a single measured figure). Service modernization therefore cannot stop at adding channels or bolting on AI; it must reallocate work across humans, Copilot, and AI agents with shared context and governance.
:::

## #the-shift 04 / The Shift to Agentic Service :: 服务模式正从人力主导转向人机协同与 agent 运营，且可按你的节奏推进 || Service Is Moving from Human-Led to Agent-Operated, at Your Pace

体验、人才和数据压力提高了维持现状的成本，而点对点拼接又限制了企业的响应能力。服务模式因此从增加渠道和单点自动化，转向让人、Copilot 与 AI agent 在统一上下文和治理下协作；企业可以按场景逐步推进，无需一次性替换。 || Experience, workforce, and data pressures raise the cost of maintaining the status quo, while point-to-point integration limits the enterprise response. Service therefore shifts from adding channels and isolated automation toward collaboration across humans, Copilot, and AI agents with shared context and governance, allowing staged adoption rather than one-time replacement.

:::insight-grid { cols: 3, title: "三种角色，一个团队 || Three Roles, One Team" }
::card 人
### 人：处理复杂与关系 || Humans: Complexity and Relationships
人留在中心，处理复杂问题、建立客户关系，并在关键时刻运用同理心与判断——这些是 AI 不擅长替代的部分。 || People stay at the center, handling complex issues, building customer relationships, and applying empathy and judgment in the moments that matter, which AI does not replace well.

::card Copilot
### Copilot：面向 AI 的操作界面 || Copilot: The Interface for AI
Copilot 是团队看见并使用 AI 的界面，在座席、主管与技术人员的工作流中提供实时指引、摘要与下一步建议，嵌入他们已经在用的工具里。 || Copilot is where teams see and use AI, delivering real-time guidance, summaries, and next-best actions inside the workflows of reps, supervisors, and technicians, embedded in the tools they already use.

::card Agent
### AI agent：自主承担流程 || AI Agents: Autonomous Processes
AI agent 是能自主承担完整任务与流程的 AI：在后台解决案例、更新知识、优化排班，仅在需要人类监督时再升级交接。 || AI agents are AI that autonomously take on entire tasks and processes: resolving cases, updating knowledge, and optimizing scheduling in the background, escalating to a human only when oversight is needed.
:::

:::flow { title: "按你的节奏演进 || Evolve at Your Pace" }
1. **人 + AI 助手 || Human with Assistants** — 每位员工都有一个 AI 助手，帮助更快更好地工作，例如案例摘要、知识检索、基础路由。多数组织今天处在这一级。 || Every employee has an AI assistant that helps them work better and faster, such as case summaries, knowledge lookup, and basic routing. Most organizations are here today.
2. **人主导的 agent || Human-Led Agents** — AI agent 作为“数字同事”加入团队，在人的指导下承担特定任务，例如协同处理会话、给出下一步建议。仍是人主导的模式。 || AI agents join the team as digital colleagues, taking on specific tasks under human direction, such as co-handling conversations and surfacing next-best actions. It remains a human-led model.
3. **人定方向、agent 运营 || Human-Led, Agent-Operated** — 人设定方向，agent 端到端运行整个业务流程，仅在需要时向人报到。这不是线性跳跃：多数组织会按渠道与用例同时运行三级，目标是渐进而非一步到位。 || Humans set direction while agents run entire processes end to end, checking in only as needed. This is not a linear jump: most organizations run all three levels at once across channels and use cases, aiming for progress rather than a single leap.
:::

:::callout { title: "本文如何理解 agentic service || How This Guide Reads Agentic Service" }
微软把这套模式称为 agentic service（agent 化服务）：人、Copilot 与 AI agent 作为一个团队协作。其意义在于：这是一条可控的渐进路径，企业从可量化的场景起步，控制推进节奏，再逐步扩展，无需一次性替换。 || Microsoft calls this model agentic service, where humans, Copilot, and AI agents work as one team. The point is that this is a controllable, gradual path: the enterprise starts from measurable scenarios, controls the pace, and expands over time, without a one-time replacement.
:::

## #capabilities 05 / Solution Capabilities :: 先看系统结构：一方 agent 承担跨自助、座席和运营的协同分工 || Start with the System Structure: First-Party Agents Divide Work Across Self-Service, Representatives, and Operations

Agent 化服务只有落实到系统分工才可评估：渠道、路由、CRM 数据、Copilot、一方 agent 和治理平面必须协同，再把能力拆成可验证的服务层；否则“全渠道”“AI 自助”“座席辅助”仍只是通用功能标签。 || Agentic service becomes assessable only when translated into system responsibilities: channels, routing, CRM data, Copilot, first-party agents, and governance planes must work together, with capabilities decomposed into verifiable service layers. Otherwise, omnichannel, AI self-service, and agent assistance remain generic feature labels.

共享平台资产 || Shared Platform Assets

Entra + Purview + Responsible AI

身份、权限、数据合规、AI 风险说明复用企业现有治理。 || Identity, permissions, data compliance, and AI risk notes reuse enterprise governance already in place.

ACS 原生语音 / Teams Phone 扩展 || ACS Native Voice / Teams Phone Extensibility

ACS 提供应用原生 PSTN 与通话控制；Teams Phone extensibility 通过 ACS API 复用企业既有的 Teams service number、PSTN 和电话策略。 || ACS provides application-native PSTN and call controls; Teams Phone extensibility uses ACS APIs to reuse existing Teams service numbers, PSTN, and telephony policies.

Power Platform + Copilot Studio

把业务动作、连接器、自定义 agent 和流程规则扩展到联络中心之外。 || Extends business actions, connectors, custom agents, and process rules beyond the contact center.

CRM of choice + Dataverse

保留既有 CRM；外部 CRM 连接范围因产品而异。ServiceNow 标准连接器只把 Account、Contact 镜像到 Dataverse，Contact Center 会话数据由微软侧管理。 || Keeps the existing CRM, with integration scope varying by product. The standard ServiceNow connector mirrors only Account and Contact into Dataverse, while Contact Center conversation data remains on the Microsoft side.

进入统一会话编排 || Feeds Unified Conversation Orchestration

Dynamics 365 Contact Center

统一承接 voice、chat、SMS、social、Teams 等渠道，负责会话状态、路由、上下文交接和服务指标。 || Receives voice, chat, SMS, social, and Teams channels, handling conversation state, routing, context handoff, and service metrics.

一方 agent 分层接管服务链路 || First-Party Agents Divide the Service Chain

一方 agent 分工 || First-Party Agent Work Division

客户入口层 || Customer Entry Layer

Customer Intent Agent 识别与发现意图；Customer Assist Agent 结合自主自助与人工座席实时辅助。Copilot Studio real-time agent 是独立的 agent 类型，可通过 Contact Center 部署到语音渠道并按规则转人工。 || Customer Intent Agent detects and discovers intents; Customer Assist Agent combines autonomous self-service with real-time assistance for human representatives. A Copilot Studio real-time agent is a separate agent type that can be deployed to voice through Contact Center and configured to transfer to a human.

座席协作层 || Assisted Service Layer

Copilot Service workspace 给人工座席摘要、知识和下一步；Case Management Agent 把会话结果变成结构化案例与跟进动作。 || Copilot Service workspace gives human agents summaries, knowledge, and next steps; Case Management Agent turns conversation outcomes into structured cases and follow-up actions.

运营闭环层 || Operations Loop Layer

Knowledge Management Agent 回补知识，Quality Assurance Agent 扩大质检覆盖，Service Operations Agent 支持健康诊断和服务水平管理。 || Knowledge Management Agent feeds knowledge back, Quality Assurance Agent expands quality coverage, and Service Operations Agent supports health diagnosis and service-level management.

沉淀为可复用产品资产 || Becomes Reusable Product Assets

可形成差异化的资产 || Assets That Create Differentiation

意图资产 || Intent Assets

高频问题、转人工原因、新意图发现。 || High-volume issues, handoff reasons, and newly discovered intents.

案例资产 || Case Assets

客户、上下文、处理路径、后续动作。 || Customer, context, handling path, and follow-up actions.

知识资产 || Knowledge Assets

SOP、FAQ、缺口主题、审核后的回答。 || SOPs, FAQs, gap topics, and reviewed answers.

治理与动作资产 || Governance and Action Assets

质检证据、合规规则、Power Platform 动作包。 || Quality evidence, compliance rules, and Power Platform action packs.

:::comparison { title: "能力边界 || Capability Boundaries" }
::versus 产品定位 || Positioning
### Copilot-first 的云联络中心 || A Copilot-First Cloud Contact Center
微软官方定义称它把 intelligence、automation 与 efficiency 带到客户选择的 CRM 里的每个 engagement channel。这里的判断点是 AI 与 CRM 上下文是否能进入同一工作流。 || Microsoft's official definition says it brings intelligence, automation, and efficiency to every engagement channel in the CRM of the customer's choice. The evaluation point is whether AI and CRM context enter the same workflow.

::versus 落地边界 || Implementation Boundary { highlight: true }
### 内置 CRM 与外部 CRM 的复杂度不同 || Native CRM and External CRM Have Different Complexity
Salesforce、Zendesk、ServiceNow 和自定义连接路径都存在，但会引入 Dataverse 同步、字段映射、API 配额、权限和数据一致性责任。这些都应纳入总成本评估。 || Salesforce, Zendesk, ServiceNow, and custom connection paths exist, but they introduce Dataverse sync, field mapping, API quota, permissions, and data consistency responsibilities. These all belong in the total cost assessment.
:::

| 能力块 || Capability Block | 微软公开能力 || Microsoft Public Capability | 业务价值 || Business Value | 评估问题 || Evaluation Question |
| --- | --- | --- | --- |
| 全渠道接入 || Omnichannel engagement | Chat、Voice、SMS、Social、Microsoft Teams；系统要求中还提到 email 相关能力。 || Chat, voice, SMS, social, and Microsoft Teams; system requirements also reference email-related capabilities. | 减少客户跨渠道重复说明，提升主管对队列和服务水平的可见度。 || Reduce repeated customer explanations across channels and improve supervisor visibility into queues and service level. | 企业当前高频渠道有哪些？是否需要社交消息、WhatsApp、Teams 或第三方 SMS 提供商？ || Which channels are high-volume today? Does the enterprise need social messaging, WhatsApp, Teams, or third-party SMS providers? |
| 座席工作台 || Agent workspace | Copilot Service workspace 支持多会话、多标签、跨 live chat、SMS、voice、Teams 与社交渠道工作。 || Copilot Service workspace supports multiple sessions and tabs across live chat, SMS, voice, Teams, and social channels. | 减少座席在不同系统之间切换，提升新员工上手速度。 || Reduce agent switching across systems and improve ramp-up speed for new representatives. | 现有座席桌面是否已经高度定制？是否需要嵌入第三方 CRM，而不是替换桌面？ || Is the current agent desktop heavily customized? Is embedding into a third-party CRM required rather than replacing the desktop? |
| Copilot 与 AI agents || Copilot and AI agents | 总结对话、草拟回复和邮件、问答、Customer Intent Agent、Customer Assist Agent、Quality Assurance Agent、Knowledge Management Agent。 || Conversation summaries, response and email drafting, Q&A, Customer Intent Agent, Customer Assist Agent, Quality Assurance Agent, and Knowledge Management Agent. | 把节省时间、提高自助解决率和质检覆盖率拆成可衡量指标。 || Turn time savings, self-service resolution, and quality coverage into measurable metrics. | 知识库、历史会话、API 工具和升级路径是否足够清晰？是否接受 Copilot Credits 的额外成本？ || Are knowledge sources, historical interactions, API tools, and escalation paths clear enough? Is the extra Copilot Credits cost acceptable? |
| 质量与 WFM || Quality and WFM | 质量评估、通话与屏幕录制、实时质量提示、容量计划、短期与长期排班预测、场景分析。 || Quality evaluation, call and screen recording, real-time quality nudges, capacity planning, short-term and long-term staffing forecasts, and scenario analysis. | 从只看通话量，扩展到服务标准、合规风险和人员配置。 || Extend management from call volume to service standards, compliance risk, and staffing. | 企业是否要一次替换现有 WFM/质检工具？还是先保留部分专业工具？ || Does the enterprise want to replace current WFM and quality tools at once, or keep selected specialist tools first? |
| 实时运营 || Live operations | 实时流式分析预览提供 Wallboard、Assisted Service、Queues、Representatives 与 Conversations 视图。 || Real-time streaming analytics preview provides Wallboard, Assisted Service, Queues, Representatives, and Conversations views. | 帮助主管在队列积压、服务水平下降、等待时长过高时更早介入。 || Help supervisors intervene earlier when queue backlog, service level, or wait time moves in the wrong direction. | 预览能力是否适合生产范围？哪些仪表板仍依赖现有 BI 或数据仓库？ || Is the preview capability appropriate for production scope? Which dashboards still rely on existing BI or warehouse assets? |
| 地域与语言 || Geography and language | Digital 与 Voice 的区域可用性不同；截至 2026 年 7 月，France、Germany、India 的 Voice 在公开表中为 No，Japan 为 Yes。该表描述 Microsoft 365 租户区域，不等同于号码国家、模型部署区或 Power Platform 数据位置。 || Digital and voice availability differs by geography. As of July 2026, the public table lists voice as No for France, Germany, and India, and Yes for Japan. The table describes Microsoft 365 tenant geography, not phone-number country, model deployment region, or Power Platform data location. | 跨国客户需要先确认 Microsoft 365 tenant 区域、语音区域、数据驻留和语言支持。 || Global customers need to confirm Microsoft 365 tenant region, voice geography, data residency, and language support first. | 客户服务国家、租户区域和语音线路区域是否一致？是否需要多语言语音 agent？ || Do service countries, tenant geography, and voice line geography align? Are multilingual voice agents required? |

| 一方 AI agent || First-Party AI Agent | 负责的服务环节 || Service Moment Owned | 需要的系统资产 || Required System Asset | 形成差异化的方式 || How It Differentiates |
| --- | --- | --- | --- |
| Customer Intent Agent | 识别客户意图、发现新意图、决定是否继续自助或进入路由。 || Detect customer intent, discover new intents, and decide whether to continue self-service or enter routing. | 历史会话、知识主题、队列规则、CRM 客户上下文。 || Historical conversations, knowledge topics, queue rules, and CRM customer context. | 把分流质量变成可持续学习的资产，而不是一次性配置的 IVR 菜单。 || Turns routing quality into a learning asset rather than a one-time IVR menu configuration. |
| Customer Assist Agent | 结合自主自助与人工座席实时辅助，理解客户意图并协助解决问题。 || Combine autonomous self-service with real-time assistance for human representatives to understand customer intent and help resolve issues. | 知识库、工具动作、历史会话和人工座席工作流。 || Knowledge sources, tool actions, conversation history, and human-representative workflows. | 把自主处理与人工辅助放在同一服务链路中；Copilot Studio real-time agent 的语音部署与转人工规则需单独配置。 || Places autonomous handling and human assistance in one service chain; voice deployment and human-transfer rules for Copilot Studio real-time agents are configured separately. |
| Case Management Agent | 自动建单、补齐上下文、推进跟进、辅助关闭。 || Create cases, fill context, drive follow-up, and assist closure. | Dataverse 案例模型、CRM 同步、权限、业务流程规则。 || Dataverse case model, CRM sync, permissions, and business process rules. | 把会话结果落成结构化案例资产，避免 AI 对话结束后价值丢失。 || Converts conversation outcomes into structured case assets, preventing value loss after the AI conversation ends. |
| Knowledge Management Agent | 从解决过程发现知识缺口，建议新增或更新知识文章。 || Find knowledge gaps from resolved work and suggest new or updated articles. | 知识库、案例解决记录、审批流程、内容质量标准。 || Knowledge base, resolved-case records, approval workflow, and content-quality standards. | 把每次人工解决变成下一次自助和座席辅助的输入，形成闭环复利。 || Turns each human resolution into input for the next self-service and assisted-service interaction, creating compounding improvement. |
| Quality Assurance Agent | 生成质量评估、扩展抽检覆盖、提供辅导证据。 || Generate quality evaluations, expand sampled coverage, and provide coaching evidence. | 录音/转写、评价表、合规规则、主管审核流程。 || Recordings/transcripts, scorecards, compliance rules, and supervisor review workflows. | 把质检从抽样后验变成更高覆盖率的运营反馈，而非单独质检工具。 || Moves quality from sampled hindsight to broader operational feedback rather than a separate QA tool. |
| Service Operations Agent | 辅助运营配置、健康诊断、队列与服务水平分析。 || Assist operations configuration, health diagnosis, and queue/service-level analysis. | 实时运营指标、队列配置、渠道健康、主管工作流。 || Live operations metrics, queue configuration, channel health, and supervisor workflows. | 把 agent 运营纳入主管日常管理，而不是只把 AI 放在客户入口。 || Brings agent operations into supervisor management rather than placing AI only at customer entry. |

:::accordion
::panel
### 学习闭环：为什么这些 agent 必须连成一条链 || Learning Loop: Why These Agents Must Form One Chain
一方 agent 的价值不在于名字多，而在于它们覆盖同一条服务链路：客户进入、意图识别、自助处理、带上下文转人工、案例结构化、知识回流、质检与运营诊断。拆开看每一项竞品都可能做到；连成闭环后，客户服务数据会持续改善下一次服务。 || The value of first-party agents is not the number of names; it is that they cover one service chain: customer entry, intent detection, self-service, contextual handoff, case structuring, knowledge feedback, quality evaluation, and operations diagnosis. A competitor may match any single item; the closed loop makes service data improve the next interaction.

1. **Customer Intent Agent：左移到自助 || Customer Intent Agent: Shift Left to Self-Service** — 客户接入时分析其意图，尽量在自助环节直接解决，减少不必要的转人工。 || Analyzes customer intent at the start and resolves in self-service where possible, reducing unnecessary escalation to a human.
2. **Case Management Agent：自动维护案例 || Case Management Agent: Automate Case Maintenance** — Case Management Agent 适用于 Dynamics 365 Customer Service 的 live chat 与 email 案例流程，负责创建、更新、跟进和关闭案例；语音转人工与队列分派由 Contact Center 的会话升级、workstream、queue 和 unified routing 处理。 || Case Management Agent applies to live-chat and email case workflows in Dynamics 365 Customer Service, where it creates, updates, follows up, and closes cases. Voice escalation and queue assignment are handled by Contact Center conversation escalation, workstreams, queues, and unified routing.
3. **Copilot：座席实时辅助 || Copilot: Real-Time Assistance** — 座席处理案例时，Copilot 提供实时知识、对话摘要与下一步建议。 || While the rep works the case, Copilot provides real-time knowledge, conversation summaries, and next-step suggestions.
4. **Knowledge Management Agent：知识回流 || Knowledge Management Agent: Knowledge Feedback** — 若座席解决了尚未记录的问题，系统建议将其沉淀为知识文章，回流改进自助与辅助——下一次相似问题更快解决。 || If the rep resolves an issue that is not yet documented, the system suggests turning it into a knowledge article that feeds back into self-service and assisted service, so the next similar issue is resolved faster.

| AI agent || AI Agent | 职责 || Role | 服务层 || Service Layer |
| --- | --- | --- |
| Customer Intent Agent | 识别意图、发现新意图、提升自助解决 || Detect intent, discover new intents, and improve self-service | 自助 || Self-service |
| Customer Assist Agent | 自主自助结合实时座席辅助，即时处理常见问题 || Combine autonomous self-service with real-time rep assistance to resolve routine issues instantly | 自助 / 辅助 || Self-service / Assisted |
| Case Management Agent | 自动建单、捕获上下文、跟进与关闭 || Automate case creation, context capture, follow-up, and closure | 辅助 || Assisted |
| Knowledge Management Agent | 从每次交互自主整理并更新知识库 || Autonomously curate and update the knowledge base from every interaction | 自助 / 辅助 || Self-service / Assisted |
| Quality Assurance Agent | 生成 AI 辅助的质量评估，扩大质检覆盖 || Generate AI-assisted quality evaluations and expand quality coverage | 运营 || Operations |
| Service Operations Agent | 辅助运营配置与健康诊断，支撑主管决策 || Assist operations configuration and health diagnostics to support supervisor decisions | 运营 || Operations |
:::

## #servicenow-integration 06 / ServiceNow Integration Architecture :: 从渠道接入到 ServiceNow 工单履约，D365 Contact Center 负责交互，ServiceNow 负责业务执行 || From Channel Intake to ServiceNow Work Fulfillment, D365 Contact Center Owns Engagement and ServiceNow Owns Business Execution

客户先从 voice、chat、SMS 等渠道进入 Contact Center；Copilot Studio agent 尝试自助解决，必要时由 Unified Routing 把实时会话分配给座席。需要后台处理时，agent 或 flow 在 ServiceNow 创建或更新 Case、Incident、Request；随后由 ServiceNow 的 assignment group、处理人和 SLA 机制负责工单分配与履约。处理状态再返回 agent、座席或客户。 || Customers enter Contact Center through voice, chat, SMS, and other channels. A Copilot Studio agent attempts self-service, while Unified Routing assigns live conversations to representatives when needed. For back-office work, an agent or flow creates or updates a ServiceNow Case, Incident, or Request. ServiceNow assignment groups, assignees, and SLA mechanisms then own work assignment and fulfillment, with status returned to the agent, representative, or customer.

产品泳道 / 流程 || Product Lane / Flow

01

渠道接入 || Intake

02

理解与自助 || Understand

03

人工协同 || Assist

04

建单 || Record

05

分配与履约 || Fulfill

06

状态闭环 || Close

客户与渠道 || Customer and Channels

ACS / Teams Phone / Digital Channels

渠道入口 || Channel Entry

Voice · Chat · SMS · Social · Teams

功能：建立客户实时会话 || Function: establish the live customer session

客户通知 || Customer Update

答复、工单号、状态与关闭通知 || Answer, work number, status, and closure notification

功能：完成服务闭环 || Function: close the service loop

D365 Contact Center

全渠道会话与座席运营平台 || Omnichannel session and representative operations

Channel Runtime

接收并维护 voice/chat 会话状态 || Receives and maintains voice/chat session state

功能：会话接入与编排 || Function: session ingress and orchestration

Unified Routing

按技能、产能和队列分配实时会话 || Routes live conversations by skill, capacity, and queue

功能：实时会话分配 || Function: live conversation routing

Copilot Service Workspace

接听、客户上下文、咨询与转接 || Handling, context, consult, and transfer

功能：人工服务桌面 || Function: representative workspace

会话结果 || Conversation Outcome

摘要、转写引用、客户反馈 || Summary, transcript reference, customer response

功能：交互闭环 || Function: engagement closure

Microsoft Copilot Studio

Agent、知识与工具编排 || Agent, knowledge, and tool orchestration

Intent / Self-Service Agent

理解请求，调用 ServiceNow 知识/记录 || Understands requests; invokes ServiceNow knowledge/records

功能：自助或转人工 || Function: self-service or handoff

ServiceNow Tool / Agent Flow

Create/Update/Get Record，或调用安全 API || Create/Update/Get Record or invoke a secured API

功能：建单与状态查询 || Function: create work and retrieve status

Status Agent

查询工单状态并生成客户可读答复 || Retrieves work status and generates a customer-readable response

功能：结果回传 || Function: result return

Power Platform / Dataverse

集成编排与操作数据层 || Integration and operational data layer

Account / Contact Mirror

初始/CUD 同步；Source CRM ID/URL || Initial/CUD sync; Source CRM ID/URL

功能：客户识别与上下文 || Function: identification and context

Correlation / Audit

保存 ServiceNow sys_id/number 与必要调用结果 || Stores ServiceNow sys_id/number and required invocation outcomes

功能：跨系统追踪，不接管工单 || Function: cross-system traceability, not work ownership

ServiceNow CSM / ITSM

权威工单与履约平台 || Authoritative work and fulfillment platform

Knowledge / Record APIs

已发布知识、客户/工单查询 || Published knowledge and customer/work retrieval

功能：给 Agent 提供业务事实 || Function: provide business facts to the agent

Case / Incident / Request

保存业务记录、状态、优先级和关联客户 || Stores work record, status, priority, and customer relationship

功能：业务工单主记录 || Function: authoritative work record

Assignment + SLA

assignment group、assignee、priority、SLA 与处理流程 || Assignment group, assignee, priority, SLA, and fulfillment workflow

功能：后台工单分配与履约 || Function: back-office work assignment and fulfillment

Work Status / Resolution

处理进度、解决结果与关闭状态 || Progress, resolution outcome, and closure status

功能：状态权威来源 || Function: authoritative status source

R1

渠道 → Contact Center || Channels → Contact Center

建立实时会话，传入来电/消息、渠道标识和可用客户标识；Contact Center 持有会话状态。 || Creates the live session and passes the call/message, channel identity, and available customer identifiers; Contact Center owns session state.

**技术路线 || Technology Route**ACS Calling/Call Automation、Teams Phone extensibility 或数字渠道适配器进入 Contact Center channel runtime。 || ACS Calling/Call Automation, Teams Phone extensibility, or digital-channel adapters feed the Contact Center channel runtime.

**相关产品 || Related Products**Azure Communication Services · Teams Phone · Dynamics 365 Contact Center

R2

Copilot Studio ↔ ServiceNow 知识/记录 || Copilot Studio ↔ ServiceNow Knowledge/Records

通过 Premium connector 或知识源读取已授权内容；ServiceNow 身份与角色决定可见范围。 || Retrieves authorized content through the premium connector or knowledge source; ServiceNow identity and roles determine visibility.

**技术路线 || Technology Route**ServiceNow Premium connector tool，或 ServiceNow 非结构化知识源；复杂场景使用 custom connector / HTTP node。 || ServiceNow premium connector tools or a ServiceNow unstructured knowledge source; use a custom connector or HTTP node for complex scenarios.

**相关产品 || Related Products**Microsoft Copilot Studio · Power Platform ServiceNow Connector · ServiceNow Knowledge/API

R3

ServiceNow → Dataverse 客户镜像 || ServiceNow → Dataverse Customer Mirror

Power Automate 初始/CUD 同步 Account、Contact 和源记录 URL；单向镜像，不同步 Case/Incident。 || Power Automate initial/CUD synchronization copies Account, Contact, and source URLs one way; it doesn't synchronize Case/Incident.

**技术路线 || Technology Route**初始批量 Flow 分页拉取；Business Rule + REST Message 触发 6 个 CUD HTTP Flow；Dataverse upsert/delete。 || A paged initial bulk flow plus Business Rule and REST Message events into six CUD HTTP flows, followed by Dataverse upsert/delete.

**相关产品 || Related Products**ServiceNow CSM · Power Automate · Microsoft Dataverse · D365 CC CRM Connector

R4

Unified Routing → 座席工作台 || Unified Routing → Representative Workspace

按技能、产能和队列分配实时会话；这不是 ServiceNow 工单 assignment。 || Assigns the live conversation by skill, capacity, and queue; this isn't ServiceNow work assignment.

**技术路线 || Technology Route**Contact Center workstream → queue → skill/capacity routing → Copilot Service workspace 会话通知与接听。 || Contact Center workstream → queue → skill/capacity routing → Copilot Service workspace notification and acceptance.

**相关产品 || Related Products**Dynamics 365 Contact Center · Unified Routing · Copilot Service Workspace · Dataverse

R5

Agent/Flow → ServiceNow 建单 || Agent/Flow → ServiceNow Work Creation

显式传递必要客户引用、意图、摘要和关联 ID，创建或更新 Case/Incident/Request；返回 sys_id/number。 || Explicitly passes required customer references, intent, summary, and correlation ID to create or update a Case/Incident/Request and returns sys_id/number.

**技术路线 || Technology Route**Copilot Studio Create/Update Record tool、agent flow；复杂规则走 Power Automate、custom connector 或受控 Scripted REST API。 || Copilot Studio Create/Update Record tools or agent flows; complex rules use Power Automate, a custom connector, or a controlled Scripted REST API.

**相关产品 || Related Products**Copilot Studio · ServiceNow Connector · Power Automate · ServiceNow CSM/ITSM · Dataverse

R6

ServiceNow 工单 → Assignment/SLA || ServiceNow Work → Assignment/SLA

由 ServiceNow 规则决定 assignment group、处理人、优先级和 SLA，并驱动后台处理流程。 || ServiceNow rules determine assignment group, assignee, priority, and SLA and drive the back-office fulfillment workflow.

**技术路线 || Technology Route**ServiceNow 原生 assignment group/assignee/priority 字段，结合配置的 assignment/business/flow 规则与 SLA engine。 || Native ServiceNow assignment group, assignee, and priority fields combined with configured assignment/business/flow rules and the SLA engine.

**相关产品 || Related Products**ServiceNow CSM / ITSM · Assignment Rules / Flow Designer · SLA Management

R7

ServiceNow 状态 → Agent/座席 || ServiceNow Status → Agent/Representative

按需查询权威状态和解决结果；避免把 ServiceNow 状态复制成第二套可编辑主数据。 || Retrieves authoritative status and resolution on demand, avoiding a second editable copy of ServiceNow work status.

**技术路线 || Technology Route**Copilot Studio Get/List Record tool、agent flow 或安全 API 按 sys_id/number 查询；必要时仅缓存只读引用。 || Copilot Studio Get/List Record tools, agent flows, or secured APIs query by sys_id/number; cache only read-only references when required.

**相关产品 || Related Products**ServiceNow CSM/ITSM · ServiceNow Connector · Copilot Studio · Copilot Service Workspace

R8

Contact Center → 客户闭环 || Contact Center → Customer Closure

通过原渠道返回答案、工单号、进度或关闭通知；会话记录仍由 Contact Center 管理。 || Returns the answer, work number, progress, or closure notification through the original channel; Contact Center continues to manage the conversation record.

**技术路线 || Technology Route**Agent/座席生成回复，Contact Center 通过原 voice/chat/SMS 渠道发送；异步通知可用 Power Automate 或渠道 API。 || The agent or representative composes the response and Contact Center sends it through the original voice/chat/SMS channel; asynchronous notifications can use Power Automate or channel APIs.

**相关产品 || Related Products**Dynamics 365 Contact Center · Copilot Studio · ACS / Teams Phone / Digital Channels · Power Automate

这张表回答一个直接问题：要在 ServiceNow 上使用左侧数据或能力，Contact Center 侧和 Copilot Studio 侧分别采用什么技术方式？ || This table answers one direct question: for each ServiceNow data type or capability on the left, what implementation approach is available from Contact Center and from Copilot Studio?

| ServiceNow 数据或能力 || ServiceNow Data or Capability | Contact Center 侧：如何实现 || Contact Center: Implementation Approach | Copilot Studio 侧：如何实现 || Copilot Studio: Implementation Approach |
| --- | --- | --- |
| Account / Contact | 使用微软 ServiceNow CRM Connector：Power Automate 先做初始批量同步，再用 CUD 事件 Flow 把 Account/Contact 单向镜像到 Dataverse，供客户识别和会话上下文使用。 || Use the Microsoft ServiceNow CRM connector: Power Automate performs an initial bulk load and then CUD event flows mirror Account/Contact one way into Dataverse for customer identification and conversation context. | 使用 ServiceNow Premium connector 的 Get/List/Create/Update/Delete Record 工具实时访问相应表；可读写范围由 ServiceNow 连接身份和角色决定。 || Use ServiceNow premium connector Get/List/Create/Update/Delete Record tools for live table access; ServiceNow connection identity and roles govern the read/write scope. |
| Case / Incident | 预建 Contact Center Connector 不同步 Case/Incident。若 Contact Center 流程需要建单或回写，需增加 Power Automate、自定义 connector 或 ServiceNow API 集成。 || The predefined Contact Center connector doesn't synchronize Case/Incident. If the Contact Center process must create or write back work records, add Power Automate, a custom connector, or a ServiceNow API integration. | 使用 ServiceNow connector 的 Get/List/Create/Update/Delete Record 工具；复杂业务规则用 agent flow 或受控 API 包装。ServiceNow 继续控制状态、SLA 和权限；Create Record 的完整 description 字段存在已知限制。 || Use ServiceNow connector Get/List/Create/Update/Delete Record tools; wrap complex business rules in an agent flow or controlled API. ServiceNow continues to own status, SLA, and permissions; Create Record has a known full-description limitation. |
| Knowledge | Contact Center 预建 ServiceNow 同步不包含知识。若座席工作流需要 ServiceNow 知识，需要通过 Copilot Studio 知识源、connector 或自定义集成提供。 || The predefined Contact Center ServiceNow synchronization doesn't include knowledge. If the representative workflow needs ServiceNow knowledge, provide it through a Copilot Studio knowledge source, connector, or custom integration. | 把 ServiceNow 配置为非结构化知识源，只检索已发布文章并按用户权限校验；也可调用 Get Knowledge Articles / Article。Knowledge API 工具需要 sn_km_api plugin。 || Configure ServiceNow as an unstructured knowledge source that retrieves published articles with user permission checks, or call Get Knowledge Articles / Article. Knowledge API tools require the sn_km_api plugin. |

目录、附件、会话运行数据和 UI 体验不属于 Contact Center 预建 ServiceNow 客户主数据同步，需要按下列方式扩展。 || Catalogs, attachments, conversation runtime data, and UI experience are outside the predefined Contact Center ServiceNow customer-master-data synchronization and require the following extensions.

| ServiceNow 数据或能力 || ServiceNow Data or Capability | Contact Center 侧：如何实现 || Contact Center: Implementation Approach | Copilot Studio 侧：如何实现 || Copilot Studio: Implementation Approach |
| --- | --- | --- |
| Catalog / Attachments | Contact Center 预建 Connector 不提供目录和附件操作；需要通过 Copilot Studio、Power Automate 或自定义 API 扩展。 || The predefined Contact Center connector doesn't provide catalog or attachment operations; extend through Copilot Studio, Power Automate, or custom APIs. | 使用 ServiceNow connector 查询 catalog/category/item、执行 Order item，并读取或上传附件。应按最小权限限制工具和表；每个连接限流 600 calls / 60 秒。 || Use the ServiceNow connector to browse catalogs/categories/items, order an item, and retrieve or upload attachments. Restrict tools and tables by least privilege; each connection is throttled at 600 calls per 60 seconds. |
| Conversation / Transcript / Recording / Routing / Presence | 这些数据由 Contact Center 管理，不会自动同步到 ServiceNow。若确需回写，只通过 Flow/API 传递最少必要摘要或引用，并单独定义保留策略。 || Contact Center manages these data and doesn't automatically synchronize them to ServiceNow. If write-back is required, pass only the minimum necessary summary or references through flows/APIs and define a separate retention policy. | 它们不会自动成为 ServiceNow connector 的输入。需要在 Agent/Topic/Flow 中显式选择要传给 ServiceNow 工具的摘要、客户引用或会话关联 ID；不要默认传输完整录音或转写。 || They don't automatically become ServiceNow connector inputs. Explicitly select the summary, customer reference, or conversation correlation ID passed to ServiceNow tools in the agent/topic/flow; don't send full recordings or transcripts by default. |
| ServiceNow Workspace 内嵌 || ServiceNow Workspace Embedding | 当前标准方案是 Copilot Service workspace standalone，并通过 View-In-CRM 打开 ServiceNow 原记录；这不是 ServiceNow Workspace 内嵌。 || The current standard design uses standalone Copilot Service workspace and opens source ServiceNow records through View-In-CRM; this isn't ServiceNow Workspace embedding. | Copilot Studio Agent 可以操作 ServiceNow 数据和流程，但不会自动生成 ServiceNow 内嵌座席 UI。目前没有找到微软或 ServiceNow 官方的 Contact Center Workspace 内嵌配置。 || Copilot Studio agents can operate on ServiceNow data and processes but don't automatically generate an embedded representative UI in ServiceNow. No official Microsoft or ServiceNow Contact Center Workspace embedding configuration was found. |

:::flow { title: "Copilot Studio Runtime Action" }
1. **Contact Center 把会话交给 Agent || Contact Center Invokes the Agent** — 客户从 voice/chat 进入 Contact Center；Copilot Studio agent 接收意图、对话上下文和必要的 Dataverse 客户引用。 || A customer enters through Contact Center voice or chat; the Copilot Studio agent receives intent, conversation context, and the required Dataverse customer reference.
2. **Agent 选择 ServiceNow 工具或知识 || The Agent Selects a ServiceNow Tool or Knowledge** — 问答场景检索已发布知识；业务动作调用 connector tool、agent flow 或受控 HTTP/custom connector。 || Question-answering scenarios retrieve published knowledge; business actions call connector tools, agent flows, or controlled HTTP/custom connectors.
3. **ServiceNow 执行权限范围内的操作 || ServiceNow Executes Within the Permission Scope** — ServiceNow 根据用户身份或受限系统账户角色查询知识/记录，或创建、更新 Incident、Case、Request 等业务对象。 || Based on the user's identity or constrained system-account roles, ServiceNow retrieves knowledge or records or creates and updates business objects such as Incident, Case, and Request.
4. **Agent 返回结果并保留引用 || The Agent Returns the Result and Preserves References** — Agent 向客户或座席返回答案、编号和状态；需要跨系统追踪时把 ServiceNow sys_id / number 保存到 Dataverse，但 ServiceNow 继续作为业务主系统。 || The agent returns the answer, number, and status to the customer or representative. For cross-system traceability, store the ServiceNow sys_id or number in Dataverse while ServiceNow remains the business system of record.
:::

:::accordion
::panel
### 生产控制：幂等、顺序、安全与对账 || Production Controls: Idempotency, Ordering, Security, and Reconciliation
微软示例提供同步起点，但没有端到端延迟 SLA、事件顺序、恰好一次交付或冲突解决保证；生产实现需要补齐以下控制。 || Microsoft's sample provides a synchronization starting point but no end-to-end latency SLA, event ordering, exactly-once delivery, or conflict-resolution guarantee. Production implementations need the following controls.

| 控制项 || Control | 生产要求 || Production Requirement |
| --- | --- |
| 幂等与版本 || Idempotency and versioning | 以 Source CRM + sys_id 作为唯一键，事件携带 event ID、sys_updated_on 或 sys_mod_count，拒绝陈旧更新。 || Use Source CRM plus sys_id as the unique key; carry an event ID, sys_updated_on, or sys_mod_count and reject stale updates. |
| 初始同步与顺序 || Initial synchronization and ordering | 分页先载入 Account，再载入 Contact；初始同步期间缓存增量事件，完成后按对象与版本回放。 || Load Account before Contact with pagination; buffer incremental events during the initial load and replay them by object and version afterward. |
| 入口安全 || Ingress security | HTTP-trigger flow 使用 OAuth；若使用 SAS URL，应按 bearer secret 管理，限制读取、记录访问并建立轮换。 || Protect HTTP-triggered flows with OAuth. If SAS URLs are used, manage them as bearer secrets with restricted access, auditing, and rotation. |
| 失败与对账 || Failure and reconciliation | 对 429/5xx 指数重试，4xx 与映射错误进入死信/人工补偿；定时比较两端记录数、水位与更新时间。 || Exponentially retry 429/5xx responses, route 4xx and mapping failures to dead-letter or manual compensation, and periodically compare record counts, watermarks, and update times. |
| 环境与运维 || Environment and operations | Dev/Test/Prod 独立，flow 放入 solution 并使用 connection references 与服务主体；监控 flow run、ServiceNow 出站失败和 Dataverse 限流。 || Separate Dev, Test, and Production; place flows in solutions with connection references and service principals; monitor flow runs, ServiceNow outbound failures, and Dataverse throttling. |
:::

## #competition 07 / Evaluation Framework :: 评估微软方案不能只看座席价格、渠道数量与单点 AI 功能 || Evaluating Microsoft Requires More Than Seat Price, Channel Count, and Isolated AI Features

传统 CCaaS 清单适合比较基础覆盖，却会低估微软方案对企业现有资产的复用价值。决策应同时计算客户事务执行能力、Microsoft Cloud 资产复用、AI 治理一致性，以及跨系统集成与长期运营成本。 || Traditional CCaaS checklists compare baseline coverage but understate the value of reusing an enterprise's existing Microsoft estate. Decisions should also account for customer-work execution, Microsoft Cloud asset reuse, consistent AI governance, and the long-term cost of cross-system integration and operations.

:::insight-grid { cols: 4, title: "Microsoft Evaluation Lens" }
::card 01
### 从回答问题到完成事务 || From Answering Questions to Completing Work
确认方案能否把客户意图连接到查询、建单、退款、预约、派工、升级与结果回写，而不是只提供机器人和座席建议。 || Confirm whether the solution connects customer intent to retrieval, work creation, refunds, appointments, dispatch, escalation, and outcome write-back—not only bots and representative suggestions.

::card 02
### 计算现有微软资产的复用价值 || Value the Existing Microsoft Estate
把 Microsoft 365、Teams、Azure、Power Platform、Dynamics 365、Entra 与 Purview 的既有投入计入总体方案，而不是把联络中心当成孤立采购。 || Include existing investments in Microsoft 365, Teams, Azure, Power Platform, Dynamics 365, Entra, and Purview instead of treating the contact center as an isolated purchase.

::card 03
### 用同一治理体系约束 AI || Govern AI through One Enterprise Control Plane
评估身份、权限、数据合规、审计、环境隔离和人工接管能否沿用企业现有控制，而不是为每个 AI 点方案重建治理。 || Assess whether identity, permissions, data compliance, audit, environment isolation, and human handoff reuse enterprise controls instead of rebuilding governance for every AI point solution.

::card 04
### 比较全周期运营成本 || Compare Full-Lifecycle Operating Cost
除席位费外，还要计算电话、AI 用量、CRM 同步、连接器、身份、报表、运维、供应商管理和后续变更成本。 || Beyond seat price, include telephony, AI usage, CRM synchronization, connectors, identity, reporting, operations, vendor management, and future change cost.
:::

:::accordion
::panel
### 市场参考：主要 CCaaS 厂商的公开定位与成本信号 || Market Reference: Public Positioning and Cost Signals from Major CCaaS Vendors
以下公开信息用于校准市场基线，不替代基于客户 Microsoft Cloud 资产、业务流程和治理要求的方案评估。 || The public information below calibrates the market baseline; it does not replace solution evaluation based on the customer's Microsoft Cloud estate, business processes, and governance requirements.

| 厂商 / 方案 || Vendor / Offer | 公开定位 || Public Positioning | 优势场景 || Strength Scenarios | 成本模型信号 || Cost Model Signal | 选型提醒 || Selection Caution |
| --- | --- | --- | --- | --- |
| Microsoft Dynamics 365 Contact Center | Copilot-first 云联络中心，支持客户选择的 CRM；Digital、Voice、Digital+Voice 授权。 || Copilot-first cloud contact center that supports the CRM of the customer's choice; Digital, Voice, and Digital+Voice licenses. | 希望把 D365/Dataverse/Power Platform/Copilot Studio、Teams 与服务运营治理放在同一平台上评估的企业。 || Enterprises that want D365, Dataverse, Power Platform, Copilot Studio, Teams, and service operations governance evaluated together. | Digital $95、Voice $95、Digital+Voice $110 / 用户 / 月；Copilot Credits、Teams Phone 与 PSTN 另计。 || Digital $95, Voice $95, Digital+Voice $110 per user per month; Copilot Credits, Teams Phone, and PSTN are separate. | 外部 CRM 集成会引入同步、字段映射和权限治理；实时语音 agent 需要生产样本测试。 || External CRM integration introduces sync, field mapping, and permission governance; real-time voice agents require production-like testing. |
| Genesys Cloud CX | AI-powered Experience Orchestration，强调全渠道、WEM、旅程管理、开放云平台。 || AI-powered Experience Orchestration, emphasizing omnichannel, WEM, journey management, and an open cloud platform. | 大型联络中心、成熟 WEM、复杂旅程编排、需要丰富市场集成的企业。 || Large contact centers, mature WEM, complex journey orchestration, and enterprises needing a broad integration marketplace. | CX1 $75、CX2 $115、CX3 $155、CX4 $240 / 用户 / 月；AI Experience tokens 与部分使用量另算。 || CX1 $75, CX2 $115, CX3 $155, CX4 $240 per user per month; AI Experience tokens and selected usage may be additional. | 若 CRM 战略中心在 D365 或 Salesforce，需要评估预建集成能否覆盖关键对象和流程。 || If the CRM strategy centers on D365 or Salesforce, evaluate whether prebuilt integrations cover critical objects and processes. |
| NICE CXone | CX AI 平台，强调自动化体验、编排、员工工作台、客户交互数据和 WEM。 || CX AI platform emphasizing automated experiences, orchestration, workforce workspaces, customer engagement data, and WEM. | 重质检、录音、WFM、行业包、复杂运营管理和大规模联络中心优化的企业。 || Enterprises focused on quality, recording, WFM, industry packages, complex operations management, and large-scale contact center optimization. | 公开包价约 $110、$135、$169、$209、$249 / agent / month，Ultimate 另有每 session 信号。 || Public packages show about $110, $135, $169, $209, and $249 per agent per month, with an Ultimate per-session signal. | 能力覆盖宽，采购时要确认哪些 AI、行业功能或集成是 included、add-on 或 consumption based。 || Capability coverage is broad; procurement should confirm which AI, industry, or integration features are included, add-on, or consumption based. |
| Five9 Intelligent CX Platform | AI-powered、个性化、连接式客户交互；公开页强调 99.999% uptime、Agent Assist 和案例指标。 || AI-powered, personalized, connected interactions; public pages emphasize 99.999% uptime, Agent Assist, and case metrics. | 希望快速云化、保持联络中心专业平台、同时接入 CRM 与 AI 辅助的组织。 || Organizations that want rapid cloud migration, a specialist contact center platform, and CRM plus AI assistance. | 本次公开抓取未取得标准价目表；页面提供 Quick Quote 询价入口。 || This public research did not retrieve a standard price table; the page provides a Quick Quote path. | 应把 SLA、行业案例、现有电话系统迁移和 CRM 集成深度列为尽调重点。 || Due diligence should focus on SLA, industry references, telephony migration, and CRM integration depth. |
| Salesforce Agentforce Contact Center | 把 voice、digital channels、CRM data 与 AI agents 原生统一在 Salesforce Service 体系中。 || Natively unifies voice, digital channels, CRM data, and AI agents within Salesforce Service. | Salesforce 是服务 CRM 主系统，且希望联络中心直接继承 Service Cloud 数据模型和 Agentforce 的企业。 || Enterprises where Salesforce is the service CRM system of record and the contact center should inherit Service Cloud data model and Agentforce. | Contact Center $125、Plus $250、Voice $75 / 用户 / 月；WFM 公开价 $50 / 用户 / 月。 || Contact Center $125, Plus $250, Voice $75 per user per month; WFM public price is $50 per user per month. | 对 Salesforce 原生客户很有吸引力；若企业 CRM 战略不在 Salesforce，需要评估数据复制和主数据治理。 || Attractive for Salesforce-native customers; if CRM strategy is elsewhere, evaluate data replication and master data governance. |
| Amazon Connect Customer | 按使用量付费的云联络中心，强调无最低消费、无长期合同、无需按坐席授权。 || Usage-based cloud contact center emphasizing no minimums, no long-term contracts, and no seat-based licensing requirement. | AWS 技术团队强、希望细粒度控制、开发自定义流程、用量波动大或座席数不是主要成本驱动的企业。 || Enterprises with strong AWS teams, fine-grained control needs, custom flow development, variable usage, or non-seat-driven cost structure. | 公开页示例：voice $0.038 / 分钟、chat $0.010 / 消息、email $0.080 / 封、SMS 与第三方消息 $0.014 / 消息。 || Public page examples: voice $0.038 per minute, chat $0.010 per message, email $0.080 per email, SMS and third-party messaging $0.014 per message. | 优势来自用量弹性和 AWS 控制；企业需要承担更多配置、集成和运营工程责任。 || Strength comes from usage elasticity and AWS control; the enterprise takes on more configuration, integration, and operations engineering responsibility. |
:::

## #why-microsoft 08 / Why Microsoft :: 微软的结构性优势是让 AI 在企业治理下完成客户事务 || Microsoft's Structural Advantage Is Governed AI That Completes Customer Work

全渠道、AI 自助、座席辅助和质检已经是市场基础能力。微软的差异在于把这些能力直接连接到 D365/Dataverse、Teams、Power Platform、Copilot Studio、Entra 与 Purview，使客户对话能够触发业务动作、调动人员协作、沉淀服务结果，并沿用企业已有治理体系。 || Omnichannel, AI self-service, representative assistance, and quality evaluation are now market baseline capabilities. Microsoft's difference is connecting them directly to D365/Dataverse, Teams, Power Platform, Copilot Studio, Entra, and Purview so customer conversations can trigger business action, mobilize human collaboration, persist service outcomes, and reuse existing enterprise governance.

:::insight-grid { cols: 4, title: "Four Microsoft Execution Advantages" }
::card 01
### 把客户意图直接连接到业务动作 || Connect Customer Intent Directly to Business Action
Copilot Studio、Power Platform 和连接器可把会话意图转成查询、建单、退款、预约、派工与升级流程；服务价值不止来自更快回答，而来自事务完成。 || Copilot Studio, Power Platform, and connectors can turn conversational intent into retrieval, work creation, refunds, appointments, dispatch, and escalation; value comes not only from faster answers but from completed work.

::card 02
### 复用已经部署的 Microsoft Cloud || Reuse the Microsoft Cloud Already in Place
语音可用 ACS 或 Teams Phone，协作进入 Teams，数据与流程使用 Dataverse 和 Power Platform，分析使用 Power BI。Forrester 预测替换多供应商电话许可可在三年节省 $328K–$602K。 || Voice can use ACS or Teams Phone, collaboration enters Teams, data and workflows use Dataverse and Power Platform, and analytics use Power BI. Forrester projects $328K–$602K in three-year savings from replacing multi-vendor telephony licenses.

::card 03
### 让人、Copilot 与 AI agent 共用服务闭环 || Put People, Copilot, and AI Agents in One Service Loop
一方 agent 覆盖意图、自助、案例、知识、质检与运营；Copilot 支持座席和主管；自定义 agent 可继续扩展。自动处理、人工接管和持续改进不必分散在多个 AI 点方案中。 || First-party agents cover intent, self-service, cases, knowledge, quality, and operations; Copilot supports representatives and supervisors; custom agents extend the model. Automation, human handoff, and continuous improvement need not be split across AI point solutions.

::card 04
### 在既有身份、数据与合规边界内运行 || Operate within Existing Identity, Data, and Compliance Boundaries
Microsoft Entra 管理身份与权限，Purview 支撑数据合规，Power Platform 环境承载连接器与流程控制，Responsible AI 文档明确能力边界；企业无需为联络中心 AI 另建治理孤岛。 || Microsoft Entra manages identity and permissions, Purview supports data compliance, Power Platform environments control connectors and workflows, and Responsible AI documentation clarifies limits; the enterprise does not need a separate governance silo for contact-center AI.
:::

| 维度 || Dimension | 分析师指出的微软强项 || Microsoft Strength Cited by Analysts |
| --- | --- |
| 创新节奏 || Pace of innovation | 快速交付联络中心新能力，如智能自动化与座席生产率工具。 || Rapidly delivering new contact center capabilities such as intelligent automation and agent-productivity tools. |
| 语音能力 || Voice capability | 2022 年收购 Nuance，将语音识别、降噪和对话式 IVR 能力并入微软语音体系。这里的打断处理指客户打断 IVR 或 Bot，不代表主管加入人工通话。 || Microsoft's 2022 Nuance acquisition brought speech recognition, noise filtering, and conversational IVR capabilities into its voice stack. Interruption handling here means callers interrupting an IVR or bot, not supervisors joining human calls. |
| 全渠道路由 || Omnichannel routing | AI 驱动的全渠道路由，在该类目的分析师评测中评级高于领先竞品。 || AI-driven omnichannel routing rated higher than the leading competitor in that category in analyst evaluations. |
| 员工与排班（WEM） || Workforce engagement (WEM) | 用 AI 辅助座席与排班管理，在该类目评级高于领先竞品。 || Using AI for agent assistance and workforce management, rated higher than the leading competitor in that category. |
| 定价透明度 || Pricing transparency | 定价灵活度与透明度评级高于领先竞品。 || Rated higher than the leading competitor on pricing flexibility and transparency. |
| AI 融入 || AI infusion | 用 Copilot 把 AI 嵌入服务全流程，帮助企业落地 AI 用例与 AI 战略。 || Embedding AI across service processes with Copilot to help organizations realize AI use cases and strategy. |

以上为 Gartner、Forrester、IDC 等分析师公开评测的归纳。Forrester 亦指出该产品约 40% 的同比增长，尤其在金融服务、医疗和零售。分析师评级会随版本更新，采购前应以最新报告为准。 || The above summarizes public analyst evaluations from Gartner, Forrester, and IDC. Forrester also notes about 40% year-over-year growth for the product, especially in financial services, healthcare, and retail. Analyst ratings change across releases; rely on the latest reports before procurement.

| 通用能力 || Generic Capability | 为什么别人也能说自己有 || Why Others Can Also Claim It | 微软路径的可利用差异 || Exploitable Microsoft Difference | 客户应验证的业务结果 || Business Outcome to Validate |
| --- | --- | --- | --- |
| AI 自助与语音 agent || AI self-service and voice agents | Genesys、NICE、Salesforce、AWS 都能提供 bot、voice bot 或 agent assist。 || Genesys, NICE, Salesforce, and AWS can all provide bots, voice bots, or agent assist. | Customer Intent、Customer Assist 与实时语音 agent 直接进入 D365 会话、路由和案例模型。 || Customer Intent, Customer Assist, and real-time voice agents flow directly into D365 conversations, routing, and case models. | 验证每次客户接触能否生成可追踪意图、业务记录、处理结果与知识反馈。 || Validate whether each customer interaction produces traceable intent, business records, outcomes, and knowledge feedback. |
| 座席辅助 || Agent assistance | 摘要、建议回复和知识检索已是主流 CCaaS 标配。 || Summaries, suggested replies, and knowledge retrieval are now mainstream CCaaS features. | Copilot Service workspace 把会话、CRM、知识、Teams 协作和后续动作放进同一工作台。 || Copilot Service workspace brings conversation, CRM, knowledge, Teams collaboration, and follow-up actions into one workspace. | 验证座席建议能否直接触发退款、预约、派单、升级等业务动作，而不是止于生成回复。 || Validate whether representative guidance can trigger refunds, appointments, dispatch, escalation, and other business actions rather than stopping at generated replies. |
| 知识库与质检 || Knowledge and quality | 多数平台都有知识问答、录音、转写和质量评分。 || Most platforms provide knowledge Q&A, recording, transcription, and quality scoring. | Knowledge Management Agent 与 Quality Assurance Agent 把知识更新、评价证据和主管辅导接入同一运营闭环。 || Knowledge Management Agent and Quality Assurance Agent connect knowledge updates, evaluation evidence, and supervisor coaching into one operations loop. | 验证服务现场能否持续沉淀 SOP、FAQ、质检样本与改进任务，形成可复用的服务资产。 || Validate whether live service work continuously produces reusable SOPs, FAQs, quality samples, and improvement tasks. |
| 低代码扩展 || Low-code extension | 竞品也有 API、marketplace、workflow 和开发者平台。 || Competitors also have APIs, marketplaces, workflows, and developer platforms. | Power Platform、Copilot Studio、Dataverse 与连接器让业务团队把规则、动作和数据模型延展到联络中心之外。 || Power Platform, Copilot Studio, Dataverse, and connectors let business teams extend rules, actions, and data models beyond the contact center. | 验证相同的规则、动作与数据模型能否扩展到销售、服务、现场、会员和工单流程。 || Validate whether the same rules, actions, and data model extend into sales, service, field, loyalty, and work-management processes. |

:::callout { title: "为什么这很重要 || Why This Matters" }
对已经在用 Microsoft 365、Teams、Dynamics 或 Azure 的企业，这四点既能减少集成接缝和供应商合同，又能把客户接触、案例、知识、质检、流程动作和治理规则沉淀为同一套可复用产品资产；微软委托的两份 Forrester 研究已将这种整合效应量化为可参考的回报区间。 || For enterprises already using Microsoft 365, Teams, Dynamics, or Azure, these four points reduce integration seams and vendor contracts while consolidating customer contacts, cases, knowledge, quality, process actions, and governance rules into one reusable product-asset layer. Two Microsoft-commissioned Forrester studies quantify this integration into reference return ranges.
:::

## #roi 09 / Investment Return :: ROI 应从业务指标反推，不能只比较每席价格 || Model ROI from Business Metrics, Not Seat Price Alone

要把平台整合的结构优势转化为可核算的投资回报，可结合三组量化基准（两份 Forrester TEI 与 Microsoft Business Value Insights）、一个可替换公式和一个 300 座席测算样例，代入企业自身的话务量和薪资结构。 || To translate structural platform advantages into computable return, combine three benchmark sets (two Forrester TEI studies and Microsoft Business Value Insights) with a replaceable formula and a 300-seat worked example adapted to your own traffic and labor structure.

可替换公式 || Replaceable Formula

三年净收益 = 节省的人力成本 + 减少的重复联系成本 + 减少的质检/合规成本 + 保留或增量收入 - 软件许可 - 通信与 AI 用量 - 集成实施 - 运营变革成本 || Three-year net benefit = labor cost saved + repeat-contact cost avoided + quality/compliance cost avoided + retained or incremental revenue - software licenses - communications and AI usage - integration implementation - operating-model change cost

可核实的量化基准：微软委托 Forrester 的两份研究与 Microsoft Business Value Insights（BVI），基于复合组织与访谈给出参考回报。 || Verifiable benchmarks: two Microsoft-commissioned Forrester studies and Microsoft Business Value Insights (BVI), based on composite organizations and interviews, provide reference return.

| 研究（复合组织条件） || Study (Composite Conditions) | 投资回报 || Investment Return | 主要量化收益 || Key Quantified Benefits | 对应的价值杠杆 || Mapped Value Levers |
| --- | --- | --- | --- |
| Forrester TEI：D365 Customer Service（2024；10 亿美元收入、500 座席、三年） || Forrester TEI: D365 Customer Service (2024; $1B revenue, 500 agents, three years) | 315% ROI，回收期低于 6 个月（1,470 万美元收益 / 354 万美元投入） || 315% ROI, payback under six months ($14.7M benefits / $3.54M investment) | 通话处理时间下降 40%（每座席每年省约 468 小时）、一次解决提升 20%、误转下降 15%、退役旧系统省约 97.8 万美元 || 40% lower call handling time (about 468 hours saved per agent per year), 20% higher first-call resolution, 15% fewer misroutes, and about $978K saved from retired systems | 座席生产率、一次解决、平台整合 || Agent productivity, first-call resolution, platform consolidation |
| Forrester New-Tech TEI：D365 Contact Center（15 亿美元收入、1,100 座席、含 Teams Phone 整合、三年） || Forrester New-Tech TEI: D365 Contact Center ($1.5B revenue, 1,100 reps, with Teams Phone consolidation, three years) | 预测 ROI 100%–345%，NPV 79.2 万–270 万美元 || Projected ROI 100%–345%, NPV $792K–$2.7M | 语音相关停机下降至多 55%（值 84.3 万–200 万美元）、通话处理时间下降 13% 至 40%（值 25.1 万–64.9 万美元）、退役电话许可省 32.8 万–60.2 万美元 || Voice-related downtime down up to 55% (worth $843K–$2M), call handling time down 13% to 40% (worth $251K–$649K), and retired telephony licenses saving $328K–$602K | 电话整合、集成简化、座席可用率 || Telephony consolidation, integration simplification, agent availability |
| Microsoft Business Value Insights（BVI）（复合口径：每年 240 万案例、400 座席、$5B 营收、毛利 35%） || Microsoft Business Value Insights (BVI) (composite: 2.4M cases/year, 400 reps, $5B revenue, 35% gross margin) | 营收提升最多 $20M（源于 CSAT 与 NPS 改善） || Up to $20M revenue lift (from CSAT and NPS improvement) | 案例解决时间下降最多 25%、座席流失下降最多 66% || Case resolution time down up to 25%, service rep attrition down up to 66% | 座席生产率、员工留存、体验驱动的收入 || Agent productivity, retention, experience-driven revenue |

说明：两份均为微软委托的 Forrester 研究，基于复合组织与访谈，属预测或参考区间，非合同承诺；请用下方公式代入自身数据核算。 || Note: both are Microsoft-commissioned Forrester studies based on composite organizations and interviews; they are projected or reference ranges, not contractual guarantees. Use the formula below with your own data.

:::insight-grid { cols: 4, title: "ROI Drivers" }
::card 01
### AHT 降低 || AHT Reduction
自动摘要、知识问答、建议回复和 CRM 上下文减少查询时间。测量方式：同类队列试点前后 AHT、转接率、工单后处理时长。 || Summaries, knowledge Q&A, suggested replies, and CRM context reduce lookup time. Measure AHT, transfer rate, and after-contact work before and after pilot in comparable queues.

::card 02
### 自助解决率提升 || Higher Self-Service Resolution
Customer Intent Agent 与实时语音 agent 可处理重复问题，但收益必须扣除误判、升级和客户不满带来的返工。 || Customer Intent Agent and real-time voice agents can handle repeatable issues, but benefits must deduct rework from misclassification, escalation, and customer dissatisfaction.

::card 03
### 质检覆盖率提升 || Higher Quality Coverage
AI 质检与录制能力可扩大抽检范围。收益来自发现合规风险、缩短辅导周期和减少人工抽样成本。 || AI quality evaluation and recording can expand sampled coverage. Benefits come from earlier compliance risk detection, shorter coaching cycles, and lower manual sampling cost.

::card 04
### 平台整合收益 || Platform Consolidation Benefit
若替换独立 IVR、质检、录音、WFM 或报表工具，ROI 可计入退订费用和维护成本下降；若只是新增能力，则不能把整合收益提前计算。 || If standalone IVR, quality, recording, WFM, or reporting tools are retired, ROI can include subscription and maintenance reduction. If capability is only added, consolidation benefits should not be counted early.
:::

:::accordion
::panel { open: true }
### 成本项清单：D365 Contact Center 不能只看 $110 || Cost Checklist: D365 Contact Center Is Not Only the $110 Line
成本建模需把可公开复核的许可项与必须询价或实测的变量分开。500 名命名用户使用 Digital + Voice 时，许可基线为 500 × $110 × 12 = $660,000/年，不含 Copilot Credits、Teams Phone/PSTN、实施、集成和超额容量。 || Cost modeling separates publicly verifiable license items from variables that require a quote or measurement. For 500 named users on Digital + Voice, the license baseline is 500 × $110 × 12 = $660,000 per year, excluding Copilot Credits, Teams Phone/PSTN, implementation, integration, and overage capacity.

| 成本项 || Cost Item | 公开事实 || Public Fact | 如何测算 || How to Model It |
| --- | --- | --- |
| 用户许可 || User licenses | Digital $95、Voice $95、Digital+Voice $110 / 用户 / 月，按年计费。 || Digital $95, Voice $95, Digital+Voice $110 per user per month, billed annually. | 按命名用户、并发需求和不同角色是否都需要完整能力拆分。 || Separate named users, concurrency needs, and whether every role needs the full capability set. |
| 语音容量 || Voice capacity | Voice 包含 2,000 IVR 分钟 / 用户 / 月、6,000 Call Intelligence 分钟 / 用户 / 月、35GB Dataverse 文件存储 / USL。 || Voice includes 2,000 IVR minutes per user per month, 6,000 Call Intelligence minutes per user per month, and 35GB Dataverse file storage per USL. | 用历史通话分钟、录音保留策略、转写覆盖范围和峰值月份校验是否会超额。 || Use historical call minutes, recording retention policy, transcription coverage, and peak months to test overage risk. |
| AI 用量 || AI usage | Dynamics 365 Contact Center Agents 需要 Copilot Credits；生成式 AI 能力单独购买 credits。 || Dynamics 365 Contact Center Agents require Copilot Credits; generative AI capabilities require separately purchased credits. | 按摘要次数、对话轮次、语音 agent 分钟、质检覆盖比例和意图分析频率建模。 || Model by summary count, conversation turns, voice-agent minutes, quality coverage percentage, and intent-analysis frequency. |
| 电话与 Teams 扩展 || Telephony and Teams extensibility | Teams Phone 扩展另计，需要 Contact Center、Teams、Teams Phone 和 PSTN 连接相关许可或方案。 || Teams Phone extensibility is separate and requires Contact Center, Teams, Teams Phone, and PSTN connectivity-related licenses or options. | 把现有运营商合同、号码迁移、录音合规、紧急呼叫和跨国线路纳入迁移预算。 || Include carrier contracts, number porting, recording compliance, emergency calling, and cross-country lines in migration budget. |
| 集成实施 || Integration implementation | 外部 CRM 连接可能通过 Dataverse 同步、Power Automate flow、webhook 或自定义连接器实现。 || External CRM connection may use Dataverse sync, Power Automate flows, webhooks, or custom connectors. | 按对象数量、字段映射、数据清洗、API 限额、回滚和测试场景估算。 || Estimate by object count, field mapping, data cleansing, API limits, rollback, and test scenarios. |

::panel
### 示例：把 Forrester 区间代入一个 300 座席场景（可替换输入） || Example: Applying the Forrester Range to a 300-Seat Scenario (Replaceable Inputs)
以下说明性示例展示如何用上述净收益公式估算回报；所有输入均可替换为真实业务数据。 || The following illustrative example shows how to estimate return with the net-benefit formula above; all inputs can be replaced with your own data.

| 输入 / 计算 || Input / Calculation | 示例取值 || Illustrative Value | 你的取值 || Your Value |
| --- | --- | --- |
| 座席数 || Seats | 300 | —— |
| Digital + Voice 许可 || Digital + Voice licenses | 300 × $110 × 12 = $396,000 / 年 || 300 × $110 × 12 = $396,000 per year | —— |
| 每座席全负荷人力成本（示例） || Fully loaded labor cost per agent (example) | $45,000 / 年 || $45,000 per year | —— |
| 通话处理时间改善（取 Forrester 下限 13%） || Call handling improvement (Forrester low end, 13%) | 释放约 300 × 13% ≈ 39 个座席等效产能 || Releases about 300 × 13% ≈ 39 seat-equivalents of capacity | —— |
| 释放产能价值（示例） || Value of released capacity (example) | 约 39 × $45,000 ≈ $1.76M / 年 || about 39 × $45,000 ≈ $1.76M per year | —— |

说明：处理时间下降不等于等比例裁员；上表把它表达为“可释放的座席产能”，可用于承接更多话务或减少加班，需再扣除采纳曲线、AI 用量与实施成本。示例中释放产能价值约为年许可成本的 4 倍，但仅用于说明量级。 || Note: a handling-time reduction is not a proportional headcount cut; the table expresses it as released seat capacity that can absorb more volume or reduce overtime, and it must still net out adoption curve, AI usage, and implementation costs. In this example the released-capacity value is about four times the annual license cost, shown only to illustrate magnitude.
:::

## #proof 10 / Customer Proof :: 真实客户已经取得这些可公开核对的成效 || Real Customers Are Already Achieving Publicly Verifiable Outcomes

除模型测算外，微软公开客户故事进一步提供了跨金融、制造、公共服务与零售行业的实证成效，便于对照自身规模判断可行性。 || Beyond modeled return, Microsoft's public customer stories provide empirical outcomes across finance, manufacturing, public sector, and retail so you can gauge feasibility against your own scale.

| 客户 || Customer | 行业 / 地区 || Industry / Region | 采用 || Adopted | 公开成效 || Public Outcome |
| --- | --- | --- | --- |
| Lenovo | 制造 / 美国 || Manufacturing / US | D365 Contact Center + Customer Service | 座席生产率 +15%、处理时间 -20%、CSAT 创新高。 || Agent productivity +15%, handling time -20%, and record-high CSAT. |
| PKO Leasing | 资本市场 / 波兰 || Capital markets / Poland | D365 Contact Center | Copilot 摘要每月节省 550 小时；日常服务约 15 万家企业。 || Copilot summaries save 550 hours per month; serves about 150,000 businesses. |
| Innovation Federal Credit Union | 银行 / 加拿大 || Banking / Canada | D365 Contact Center + Customer Service | 约 80% 一次解决；每日处理 700–800 通电话与 20–50 次聊天。 || About 80% first-call resolution; handles 700–800 calls and 20–50 chats daily. |
| VIVID | 住房 / 英国 || Housing / UK | D365 CS / CC / FS + Copilot Studio | 响应时间 6 分钟降至 50 秒、弃单率 -81%、数字互动 +72%、新注册 +45%。 || Response time from 6 minutes to 50 seconds, abandonment -81%, digital engagement +72%, and new registrations +45%. |
| Virgin Money（Redi） || Virgin Money (Redi) | 银行 / 英国 || Banking / UK | Copilot Studio + D365 Customer Service | 超过 90% 客户从虚拟助手获得所需；服务 660 万零售与企业客户。 || Over 90% of customers get what they need from the virtual assistant; serves 6.6M retail and business customers. |
| Apollo / DERTOUR | 旅游零售 / 北欧 || Travel retail / Nordics | D365 Customer Insights + Contact Center + Copilot Studio | 替换 Salesforce Marketing Cloud 后支持请求 -66%；chatbot 预计处理约一半咨询，支持 5 种语言。 || After replacing Salesforce Marketing Cloud, support requests -66%; the chatbot is set to handle about half of inquiries in five languages. |

:::insight-grid { cols: 4, title: "微软自身的规模与成效 || Microsoft's Own Scale and Impact" }
::card 10亿+
### 服务客户数 || Customers Served
微软客户服务与支持（CSS）在这套平台上服务超过 **10 亿**客户，覆盖 195 个国家、92 个联络中心、46 种语言。 || Microsoft Customer Service and Support (CSS) serves more than **1 billion** customers on this platform, across 195 countries, 92 contact centers, and 46 languages.

::card 325M+
### 年交互量 || Annual Interactions
每年经手 **3.25 亿+**次语音、邮件与聊天交互，全部由同一套 Dynamics 365 平台承载。 || It handles **325M+** voice, email, and chat interactions per year, all on one Dynamics 365 platform.

::card -20%
### 误转下降 || Fewer Misroutes
核心能力（统一路由与统一数据）使误转下降约 **20%**，减少客户被转错部门。 || Core capabilities (unified routing and unified data) cut misroutes by about **20%**, reducing customers being sent to the wrong team.

::card +31%
### 一次解决提升 || Higher First-Call Resolution
同样的核心能力使一次解决率提升约 **31%**，让更多问题在首次接触即被解决。 || The same core capabilities raise first-call resolution by about **31%**, resolving more issues at first contact.
:::

:::callout { title: "微软用自己的平台服务自己 || Microsoft Runs Its Own Support on This Platform" }
CSS 从 16 套系统、500 个工具起步：2019 年统一到 Dynamics 365 Customer Service，随后引入 Teams 协作、智能路由与聊天机器人、Copilot（2022）与 AI agent（2023 年起）。内部研究显示 Copilot 使聊天案例平均处理时间下降 12–16%（Wave 2.5，9,900 名座席，2023 年 4–9 月）。以上均为微软公开客户故事与内部研究，成效为各客户在其环境下取得，非通用承诺。 || CSS started from 16 systems and 500 tools: it consolidated on Dynamics 365 Customer Service in 2019, then added Teams collaboration, intelligent routing and chatbots, Copilot (2022), and AI agents (from 2023). An internal study shows Copilot cut average handling time for chat cases by 12–16% (Wave 2.5, 9,900 agents, April–September 2023). All figures are from Microsoft public customer stories and internal studies; outcomes were achieved in each customer's environment and are not a universal guarantee.
:::

## #scenarios 11 / Fit Scenarios :: 根据 Microsoft Cloud 基础与数据准备度选择下一步 || Choose the Next Step Based on Microsoft Cloud Foundation and Data Readiness

客户不必等到所有系统统一后才开始。已有 Microsoft Cloud 基础的企业可直接进入价值评估；使用外部 CRM 的企业可从受控队列试点；知识、数据或治理尚未就绪时，先完成准备工作再启动。 || Customers do not need to wait for every system to be unified. Enterprises with an existing Microsoft Cloud foundation can enter value assessment directly; those using external CRM can start with a controlled queue pilot; where knowledge, data, or governance is not ready, complete readiness work before launch.

:::insight-grid { cols: 3, title: "Scenario Fit" }
::card Now
### 立即进入价值评估 || Begin Value Assessment Now
企业已采用 Microsoft 365、Teams、Azure、Power Platform 或 Dynamics 365，并希望把 Copilot、客户数据、人员协作与服务运营放进同一演进路线。 || The enterprise already uses Microsoft 365, Teams, Azure, Power Platform, or Dynamics 365 and wants Copilot, customer data, human collaboration, and service operations on one modernization path.

::card Pilot
### 用外部 CRM 场景优先试点 || Pilot First with External CRM
CRM 主系统在 Salesforce、Zendesk 或 ServiceNow，但业务希望引入 Microsoft AI、Teams 协作与流程执行。先验证客户识别、记录回跳、关键对象读写、权限和失败补偿，再扩展范围。 || The CRM system of record is Salesforce, Zendesk, or ServiceNow, while the business wants Microsoft AI, Teams collaboration, and workflow execution. Validate customer identification, record deep links, critical-object read/write, permissions, and failure compensation before expanding scope.

::card Ready
### 先完成数据与治理准备 || Complete Data and Governance Readiness First
AI 场景、知识边界、主数据、身份权限、录音同意、数据驻留或 Voice 区域条件尚未明确。先完成 readiness 清单，避免把基础问题带入试点。 || AI scenarios, knowledge boundaries, master data, identity permissions, recording consent, data residency, or Voice regional conditions are not yet clear. Complete the readiness checklist before carrying foundational issues into the pilot.
:::

| 行业场景 || Industry Scenario | 优先用例 || Priority Use Case | 主要收益指标 || Primary Benefit Metric | 前置条件 || Prerequisite |
| --- | --- | --- | --- |
| 零售与消费品 || Retail and consumer goods | 订单状态、退换货、会员权益、促销咨询的 AI 自助与转人工。 || AI self-service and handoff for order status, returns, loyalty benefits, and promotion inquiries. | 自助解决率、重复联系率、AHT、CSAT。 || Self-service resolution, repeat-contact rate, AHT, and CSAT. | 商品、订单、会员和售后知识必须可被 agent 安全查询。 || Product, order, loyalty, and service knowledge must be safely queryable by agents. |
| 金融服务 || Financial services | 身份确认后的常见咨询、投诉分流、合规提示、质量评估与录音留存。 || Authenticated common inquiries, complaint routing, compliance prompts, quality evaluation, and recording retention. | 合规风险发现率、升级准确率、质检覆盖率、投诉处理时效。 || Compliance risk detection, escalation accuracy, quality coverage, and complaint handling time. | 敏感操作必须用确定性流程和人工审批，不能只依赖生成式回复。 || Sensitive actions must use deterministic flows and human approval, not only generative responses. |
| 医疗健康 || Healthcare | 预约、检查准备、保险或资格咨询、患者支持队列。 || Appointments, exam preparation, insurance or eligibility inquiries, and patient-support queues. | 预约完成率、等待时长、转接率、敏感信息处理合规。 || Appointment completion, wait time, transfer rate, and sensitive-information compliance. | 先确认 HIPAA/HITRUST 适用性、数据驻留、录音同意和知识边界。 || Confirm HIPAA/HITRUST applicability, data residency, recording consent, and knowledge boundaries first. |
| 公共服务 || Public services | 政策问答、申请进度查询、多语言热线、人工升级。 || Policy Q&A, application status lookup, multilingual hotline, and human escalation. | 热线等待时长、一次解决率、语言覆盖、升级准确率。 || Hotline wait time, first-contact resolution, language coverage, and escalation accuracy. | 需确认政府云、区域可用性和公共信息披露边界。 || Government cloud, regional availability, and public-information disclosure boundaries must be confirmed. |

## #adoption 12 / Adoption Path :: 用 90 天证明一条从客户对话到业务结果的执行链 || Prove One Conversation-to-Outcome Execution Chain in 90 Days

选择一个高量、低敏、知识边界清晰的队列，在真实业务指标下验证意图识别、CRM 上下文、业务动作、人工接管、治理控制与结果回写。试点目标在于验证 Microsoft Agentic Service 能端到端完成一类客户事务，而非仅做单点 AI 演示。 || Choose one high-volume, low-sensitivity queue with clear knowledge boundaries and validate intent recognition, CRM context, business action, human handoff, governance controls, and outcome write-back against real operating metrics. Rather than staging an isolated AI demo, the pilot proves that Microsoft Agentic Service can complete a class of customer work end to end.

:::flow { title: "90-Day Pilot Path" }
1. **建立基线 || Establish the Baseline** — 锁定一个队列，记录近 8-12 周的来电/消息量、AHT、FCR、转接率、放弃率、质检样本和人员成本。 || Select one queue and capture 8-12 weeks of call/message volume, AHT, FCR, transfer rate, abandon rate, quality samples, and labor cost.
2. **定义 AI 可处理范围 || Define AI-Eligible Scope** — 列出可自助、需人工、必须升级三类意图；为每类配置知识、工具、回退语和人工接管条件。 || Classify intents into self-service, human-assisted, and mandatory escalation; configure knowledge, tools, fallback messages, and handoff conditions for each.
3. **连接 CRM 上下文 || Connect CRM Context** — 若使用 ServiceNow，标准试点先同步 Account、Contact；Case、Incident、订单状态或会话结果通过 Copilot Studio ServiceNow connector tool、agent flow 或安全 API 实现，并明确业务主系统、外部键、写入权限与失败补偿。 || For ServiceNow, begin the standard pilot with Account and Contact. Implement Case, Incident, order-status, or conversation-outcome integration through Copilot Studio ServiceNow connector tools, agent flows, or secured APIs, with an explicit system of record, external keys, write permissions, and failure compensation.
4. **用真实对话测试 || Test with Realistic Conversations** — 使用脱敏历史会话、口音、噪音、打断、工具失败和复杂请求测试。实时语音 agent 必须验证延迟、打断处理和升级准确率。 || Use sanitized historical interactions, accents, noise, interruptions, tool failures, and complex requests. Real-time voice agents must be tested for latency, barge-in behavior, and escalation accuracy.
5. **上线双轨运营 || Run Dual Operations** — 试点期保留人工优先路径，设置 AI 只建议、需确认、可自动执行三个级别，并让主管每日复盘失败样本。 || During pilot, keep a human-first path and set three AI modes: suggestion only, confirmation required, and automated execution. Supervisors review failure samples daily.
6. **决定扩展或暂停 || Decide Expansion or Pause** — 用同一指标对比基线：AHT、FCR、自助解决率、客户满意、合规问题、座席采纳率、实际 AI credits 消耗。 || Compare against baseline using the same metrics: AHT, FCR, self-service resolution, satisfaction, compliance issues, agent adoption, and actual AI credits consumption.
:::

:::insight-grid { cols: 3, title: "如何推进 || How to Engage" }
::card 1
### 愿景与价值工作坊 || Vision and Value Workshop
与微软或合作伙伴一起明确业务与技术需求，勾勒适合你服务环境的转型蓝图。 || Work with Microsoft or a partner to define business and technical needs and outline a transformation blueprint fit to your service environment.

::card 2
### TCO 与业务价值评估 || TCO and Business Value Assessment
用你自己的话务量、成本与目标，量化总拥有成本与预期回报，形成可提交决策层的商业论证。 || Use your own volume, cost, and goals to quantify total cost of ownership and expected return, forming a business case for decision-makers.

::card 3
### 定制化演示 || Tailored Demo
围绕你的优先场景做一次沉浸式演示，让业务与 IT 在同一场景下验证体验、AI 与集成。 || Run an immersive demo around your priority scenarios so business and IT can validate experience, AI, and integration together.
:::

## #voice-architecture 13 / Voice Connectivity and Live Controls :: 人工通话支持主管介入，Bot 通话支持打断与转人工，但两者的控制边界不同 || Human Calls Support Supervisor Intervention; Bot Calls Support Interruption and Human Transfer with Different Control Boundaries

Dynamics 365 Contact Center 的语音能力分为人工坐席控制、Copilot Studio real-time agent 和电话线路接入三层。人工通话可监听、私聊、加入、咨询和转接；Bot 通话可接受客户打断并按规则转人工，但微软未公开承诺主管可静默监听、插入或强制接管仍由 Bot 处理的通话。 || Dynamics 365 Contact Center voice capabilities span three layers: human call controls, Copilot Studio real-time agents, and telephony connectivity. Human calls support monitoring, private messaging, joining, consultation, and transfer. Bot calls support caller interruption and configured transfer to a human, but Microsoft does not publicly document supervisor monitoring, joining, or forced takeover while the bot still owns the call.

| 控制能力 || Control | 人工坐席通话 || Human-Handled Call | Real-Time Voice Agent 通话 || Real-Time Voice Agent Call | 适用边界 || Boundary |
| --- | --- | --- | --- |
| 实时监听 || Live monitoring | 支持。主管可静默监听，不显示为通话参与者。 || Supported. A supervisor can monitor without appearing as a participant. | 未找到主管静默监听 Bot-owned call 的官方承诺。 || No official commitment was found for supervisor monitoring of a bot-owned call. | 主管监听适用于 Contact Center standalone，需 Omnichannel Supervisor 角色。 || Supervisor monitoring applies to Contact Center standalone and requires the Omnichannel Supervisor role. |
| 私聊与加入 || Private messaging and join | 支持。主管可向座席发送客户不可见的消息，也可选择 Join call 加入并与双方通话。 || Supported. A supervisor can send messages hidden from the customer or select Join call to speak with both parties. | 支持客户在 Bot 播放语音时打断 Bot；这不是主管加入通话。 || The caller can interrupt the bot while it speaks; this is not supervisor call joining. | Bot barge-in 指客户打断 Bot；supervisor barge-in 指主管加入人工通话，两者不是同一功能。 || Bot barge-in means the caller interrupts the bot; supervisor barge-in means a supervisor joins a human-handled call. They are different controls. |
| 咨询与转接 || Consult and transfer | 可咨询或转给座席、主管、队列、Teams 用户和外部 PSTN 号码；具体目标需管理员启用。 || Calls can be consulted or transferred to representatives, supervisors, queues, Teams users, and external PSTN numbers when enabled by an administrator. | 支持按配置把请求升级或转给人工座席。 || Configured escalation or transfer to a human representative is supported. | 电话转入带 Copilot agent 的队列后，该 agent 只能与客户交谈和结束电话，不能再次转给其他 agent 或外部号码。 || After a call is transferred into a queue with a Copilot agent, that agent can only speak with the customer and end the call; it cannot transfer again to another agent or external number. |
| 接管 || Takeover | 当前主坐席可把咨询坐席提升为 primary representative，由其成为主要联系人。 || The current primary representative can promote a consulting representative to primary so they become the main contact. | 只确认 Bot 主动转人工；未找到主管从监控界面单方面接管 Bot 通话的官方能力。 || Only bot-initiated transfer to a human is documented; no official capability was found for unilateral supervisor takeover of a bot call from the monitoring interface. | 主管面板公开的管理动作是 Monitor、Assign、Transfer 和 Force Close，不包含独立的 Take Over 操作。 || The documented supervisor actions are Monitor, Assign, Transfer, and Force Close; there is no separate Take Over action. |

:::comparison { title: "ACS and Teams Phone" }
::versus 应用原生电话 || Application-Native Telephony
### Azure Communication Services
ACS Voice Calling 由 Microsoft 提供号码和 PSTN，适合新建应用原生电话；ACS Direct Routing 则通过受支持的 SBC 保留现有运营商、PBX 或模拟设备。号码、PSTN 和通信服务按 Azure 用量计费，国家、Azure billing address、号码类型与紧急呼叫能力受地域限制。 || ACS Voice Calling uses Microsoft-provided numbers and PSTN for application-native telephony. ACS Direct Routing retains an existing carrier, PBX, or analog equipment through a supported SBC. Numbers, PSTN, and communication services are billed through Azure usage, with regional constraints on country, Azure billing address, number type, and emergency calling.

::versus 复用企业电话体系 || Reuse Enterprise Telephony { highlight: true }
### Teams Phone Extensibility
Teams Phone extensibility 通过 ACS Calling SDK 和 Call Automation，把既有 Teams Phone 号码、PSTN、紧急呼叫策略和统一通信能力接入 Contact Center。当前 D365 接入使用 Teams service number 与 resource account；人工座席还需 Teams、Teams Phone 和 Enterprise Voice。Teams 与 CCaaS 客户端的通话历史分别保存。 || Teams Phone extensibility uses ACS Calling SDK and Call Automation to bring existing Teams Phone numbers, PSTN, emergency-calling policies, and unified communications into Contact Center. The current D365 integration uses a Teams service number and resource account; human representatives also require Teams, Teams Phone, and Enterprise Voice. Teams and CCaaS clients maintain separate call histories.
:::

:::flow { title: "PSTN Connectivity Topologies" }
1. **ACS Voice Calling** — 客户 PSTN → Microsoft 作为 PSTN carrier → ACS 号码与 Call Automation → D365 Contact Center → real-time agent、IVR 或人工座席。适合不保留现有运营商、希望由 Microsoft 托管号码与公网电话接入的场景。 || Customer PSTN → Microsoft as PSTN carrier → ACS number and Call Automation → D365 Contact Center → real-time agent, IVR, or human representative. This fits deployments that do not retain an existing carrier and want Microsoft-managed numbers and PSTN access.
2. **ACS Direct Routing** — 客户 PSTN / 现有运营商 / PBX → 客户或合作伙伴管理的受支持 SBC → ACS Direct Routing → Call Automation → D365 Contact Center。可保留运营商与既有电话设备，也可把部分号码走 ACS Voice Calling、部分走自有线路。 || Customer PSTN / existing carrier / PBX → supported SBC managed by the customer or partner → ACS Direct Routing → Call Automation → D365 Contact Center. This retains the carrier and existing telephony equipment and can mix ACS Voice Calling with customer-managed routes.
3. **Teams Calling Plan** — 客户 PSTN → Microsoft Calling Plan → Teams service number + resource account → Teams Phone → ACS TPE API → D365 Contact Center。Microsoft 提供运营商、号码和支持，不需要客户维护 SBC。 || Customer PSTN → Microsoft Calling Plan → Teams service number + resource account → Teams Phone → ACS TPE APIs → D365 Contact Center. Microsoft provides the carrier, number, and support, with no customer-managed SBC.
4. **Teams Operator Connect** — 客户 PSTN → 认证 Operator Connect 运营商及其托管 SBC → Teams Phone resource account → ACS TPE API → D365 Contact Center。适合保留参与 Operator Connect 的运营商，同时不自行部署 SBC。 || Customer PSTN → certified Operator Connect carrier and carrier-managed SBC → Teams Phone resource account → ACS TPE APIs → D365 Contact Center. This retains a participating carrier without customer-managed SBC infrastructure.
5. **Teams Direct Routing** — 客户 PSTN / 任意运营商 / PBX → 客户、集成商或 DRaaS 管理的认证 SBC → Teams Phone resource account → ACS TPE API → D365 Contact Center。它提供最高的运营商和设备灵活度，但需要维护路由策略、证书、DNS 与 SBC。ACS Direct Routing 与 Teams Direct Routing 是独立接口，SBC FQDN 必须不同。 || Customer PSTN / any carrier / PBX → certified SBC managed by the customer, integrator, or DRaaS provider → Teams Phone resource account → ACS TPE APIs → D365 Contact Center. It offers the most carrier and equipment flexibility but requires routing-policy, certificate, DNS, and SBC operations. ACS Direct Routing and Teams Direct Routing are separate interfaces and require different SBC FQDNs.
:::

:::accordion
::panel
### Real-Time Voice Agent：能力、限制与生产验收 || Real-Time Voice Agent: Capabilities, Limits, and Production Acceptance
Real-time agent 支持 PSTN/SIP 全语音交互、DTMF、VAD、客户打断、多语言、知识与工具调用、结构化 topic 和转人工，但生产可用性取决于模型区域、电话线路、延迟、并发、数据保护和回退设计。 || Real-time agents support PSTN/SIP voice interactions, DTMF, VAD, caller interruption, multilingual conversations, knowledge and tool calls, structured topics, and human transfer. Production fitness depends on model region, telephony, latency, concurrency, data protection, and fallback design.

| 检查项 || Check | 微软公开边界 || Documented Boundary | 生产验收要求 || Production Acceptance |
| --- | --- | --- |
| 模型与区域 || Model and region | 截至 2026 年 7 月，GPT-Realtime 托管于北美，GPT-Realtime-Mini Preview 托管于澳大利亚；GPT-5-Chat Preview 在美国、欧盟、英国和澳大利亚的受支持区域支持区域内处理。EU Data Boundary 客户不能使用需要跨地域处理的 Realtime/Mini。 || As of July 2026, GPT-Realtime is hosted in North America, GPT-Realtime-Mini Preview in Australia, and GPT-5-Chat Preview supports in-region processing in supported US, EU, UK, and Australian regions. EU Data Boundary customers cannot use Realtime or Mini when they require cross-geo processing. | 按租户区域、模型部署类型和数据驻留要求逐国确认，不用模型支持语言代替区域可用性判断。 || Confirm tenant region, model deployment type, and data-residency requirements country by country; model language capability does not establish regional availability. |
| 延迟与打断 || Latency and interruption | 网络、设备、安全检查、区域基础设施和多次 tool call 都会增加延迟，并影响轮次判断与打断时机；微软未承诺统一的端到端毫秒 SLA。 || Network, device, safety checks, regional infrastructure, and multiple tool calls add latency and affect turn-taking and interruption timing. Microsoft does not publish a uniform end-to-end millisecond SLA. | 使用实际线路、终端、口音、噪音和高峰负载测量首响应、轮次延迟、误打断和漏打断。 || Measure first response, turn latency, false interruptions, and missed interruptions using actual telephony, devices, accents, noise, and peak load. |
| 工具与上下文 || Tools and context | 工具可能失败、超时或返回不完整结果；很长或高度有状态的对话可能超出最佳上下文窗口。 || Tools can fail, time out, or return incomplete results; very long or highly stateful conversations can exceed the optimal context window. | 为每个关键动作配置确认、重试、回退和转人工；长流程使用 topic 边界和显式状态，不只依赖生成式上下文。 || Add confirmation, retry, fallback, and human transfer for every critical action; use topic boundaries and explicit state for long workflows rather than relying only on generative context. |
| 敏感数据与确定性 || Sensitive data and determinism | 流式 speech-to-speech 对敏感数据的全面过滤或脱敏可能受发布阶段与配置限制；输出还可能出现幻觉、越权承诺和信息过度披露。 || Comprehensive filtering or masking of sensitive data in streamed speech-to-speech can be constrained by release stage and configuration. Outputs can also hallucinate, make unauthorized commitments, or disclose excessive information. | 金融、合规、身份和账户变更使用确定性 topic、外部验证与人工审批；限制通用知识范围和工具权限。 || Use deterministic topics, external validation, and human approval for finance, compliance, identity, and account changes; restrict general knowledge and tool permissions. |
| 并发与监控 || Concurrency and monitoring | 区域 GPU capacity 会限制高峰并发，微软未公布统一并发上限。部分 Text LLM voice 对话轮次可能未完整写入通话转写，从而影响分析和监控。 || Regional GPU capacity constrains peak concurrency, and Microsoft publishes no uniform concurrency limit. Some Text LLM voice turns might not be fully captured in call transcripts, affecting analytics and monitoring. | 用目标峰值压测并持续监控延迟、工具成功率、升级频率、转写完整性和区域容量。 || Load-test at the target peak and continuously monitor latency, tool success, escalation frequency, transcript completeness, and regional capacity. |
:::

## #licensing 14 / Licensing and Configuration :: 许可按能力分档，配置按依赖顺序展开 || Licensing Tiers by Capability; Configuration Unfolds by Dependency

试点就绪后，采购与实施还需明确怎么买（许可逻辑）和怎么搭（配置逻辑）。许可与能力、渠道直接挂钩——缺对应许可，渠道复选框会被禁用；配置则有明确的依赖顺序。价格与权益取自 Dynamics 365 Licensing Guide（2026 年 7 月），可能变化，采购前以最新指南与定价页为准。 || Once the pilot scope is set, procurement and delivery hinge on two practical questions: how to buy (licensing logic) and how to build (configuration logic). Licensing is tied directly to capabilities and channels — without the matching license, a channel checkbox is disabled; configuration follows a clear dependency order. Prices and entitlements are from the Dynamics 365 Licensing Guide (July 2026), are subject to change, and should be confirmed against the latest guide and pricing page before procurement.

:::insight-grid { cols: 4, title: "许可逻辑 || Licensing Logic" }
::card 01
### 接入基座 || Attach Base
Contact Center 接入你既有的 CRM，或搭配 Dynamics 365 Customer Service Enterprise。若要把 CRM 与联络中心打包，可选 Customer Service Premium（= Customer Service Enterprise + Contact Center Digital+Voice）。 || Contact Center attaches to your existing CRM, or pairs with Dynamics 365 Customer Service Enterprise. To bundle CRM and contact center, Customer Service Premium equals Customer Service Enterprise plus Contact Center Digital+Voice.

::card 02
### 选 SKU || Pick the SKU
三档按用户 / 月、按年计费：Contact Center Digital $95（数字与聊天渠道）、Voice $95（原生语音）、Digital+Voice $110（打包，含两者全部权益）。 || Three tiers, per user per month, billed annually: Contact Center Digital $95 (digital and chat), Voice $95 (native voice), and Digital+Voice $110 (bundle with all entitlements of both).

::card 03
### 包含容量 || Included Entitlements
每档含 Unified Routing 50 record routes / 用户 / 月（不含聊天、通话、短信）；Voice 另含 2,000 Intelligent Voicebot（IVR）分钟 + 6,000 Call Intelligence 分钟 / 用户 / 月，及 35GB 通话录音文件存储（按 USL 累积、租户级池化）。 || Each tier includes Unified Routing at 50 record routes per user per month (excluding chats, calls, texts). Voice adds 2,000 Intelligent Voicebot (IVR) minutes plus 6,000 Call Intelligence minutes per user per month, and 35GB of call-recording file storage (accrued per USL, pooled at the tenant).

::card 04
### 附加项 || Add-Ons
预置 AI agent（Customer Intent、Knowledge Management、Quality Assurance、Customer Assist）需要 Copilot Credits，单独购买；Teams Phone 扩展与 PSTN 另计；Unified Routing、Voicebot 与 Call Intelligence 分钟均有容量加购包。 || Prebuilt AI agents (Customer Intent, Knowledge Management, Quality Assurance, Customer Assist) require separately purchased Copilot Credits; Teams Phone extensibility and PSTN are separate; Unified Routing, Voicebot, and Call Intelligence minutes have add-on capacity packs.
:::

:::flow { title: "配置与部署逻辑 || Configuration and Deployment Logic" }
1. **定部署形态 || Choose the Deployment Form** — 选择已被目标 CRM 官方支持的 embedded 方案，或使用 Copilot Service workspace standalone。ServiceNow 当前应以 standalone + Dataverse 客户镜像 + View-In-CRM 回跳作为标准基线；不要在缺少官方配置依据时承诺 ServiceNow workspace 内嵌。 || Choose an embedded model documented for the target CRM, or use Copilot Service workspace standalone. For ServiceNow, the current standard baseline is standalone plus a Dataverse customer mirror and View-In-CRM deep links; do not promise ServiceNow workspace embedding without documented support.
2. **打基座 || Lay the Foundation** — 准备 Power Platform 环境与 Dataverse，满足系统要求；在根业务单元为管理员授予 Dynamics 365 System Administrator 安全角色。 || Prepare a Power Platform environment and Dataverse, meet the system requirements, and grant the Dynamics 365 System Administrator security role on the root business unit.
3. **备语音底座 || Prepare the Voice Foundation** — 生产环境的一方语音与短信依赖 Azure Communication Services；若走 Teams，则用 Teams Phone 搭配 pay-as-you-go Calling Plan、Operator Connect 或 Direct Routing 接入 PSTN。 || First-party voice and SMS in production depend on Azure Communication Services; for Teams, use Teams Phone with a pay-as-you-go Calling Plan, Operator Connect, or Direct Routing for PSTN.
4. **开通渠道 || Provision Channels** — 在 Copilot Service 管理中心开通 Chat、Voice、SMS、Social、Microsoft Teams；许可决定哪些渠道可勾选——缺对应许可时复选框被禁用。开通在后台异步完成。 || In the Copilot Service admin center, enable Chat, Voice, SMS, Social, and Microsoft Teams; licenses gate which channels are selectable — checkboxes are disabled without the matching license. Provisioning completes asynchronously in the background.
5. **配统一路由 || Configure Unified Routing** — 建 workstream 与队列，按容量与技能路由，把会话分到合适的座席或 agent。 || Create workstreams and queues, and route by capacity and skill to send conversations to the right rep or agent.
6. **接 AI 与派角色 || Wire AI and Assign Roles** — 用 Copilot Studio 建自定义 agent、接入知识源；分配用户并按安全角色授权（身份用 Microsoft Entra）。 || Build custom agents and connect knowledge sources with Copilot Studio; assign users and authorize by security role (identity via Microsoft Entra).
:::

:::accordion
::panel { open: true }
### Teams Phone 扩展：为什么需要两套许可 || Teams Phone Extensibility: Why It Needs Two License Sets
用 Teams Phone 扩展把语音接进 Contact Center 时，需要两套许可：一套给“服务线路”，一套给“座席”。Teams Phone 扩展定价单独计，不含在 Contact Center 许可内。 || Bringing voice into Contact Center via Teams Phone extensibility requires two license sets: one for the service line and one for the reps. Teams Phone extensibility pricing is separate and not included in the Contact Center license.

| 许可对象 || License Target | 需要的许可 || Required Licenses |
| --- | --- |
| 服务线路 || Service line | Teams Phone Resource Account 许可（免费附加，用于 Auto Attendant、Call Queue 等资源账户）+ PSTN 连接（pay-as-you-go Calling Plan、Operator Connect 或 Direct Routing 之一）。 || Teams Phone Resource Account license (no-cost add-on for resource accounts such as Auto Attendant and Call Queue) plus PSTN connectivity (one of pay-as-you-go Calling Plan, Operator Connect, or Direct Routing). |
| 座席（service reps） || Service reps | 需同时具备 Dynamics 365 Contact Center USL + Microsoft Teams 许可 + Microsoft Teams Phone 许可。 || Must hold all of: Dynamics 365 Contact Center USL, a Microsoft Teams license, and a Microsoft Teams Phone license. |

注意：当前 Teams Phone 扩展尚不支持座席在 Contact Center 应用内使用各自独立号码；若座席需在 Teams 客户端使用独立号码，需为其单独配置 PSTN 连接。 || Note: Teams Phone extensibility does not currently let reps use their own unique phone numbers inside the Contact Center app; reps who need a unique number in the Teams client must have a PSTN connectivity option set up individually.

::panel
### 对照表：要用某能力 → 需要哪种许可 → 关键配置步骤 || Mapping: Capability → License → Key Configuration Steps
把许可与配置连起来看：想启用某项能力，先确认许可，再执行对应配置。 || Read licensing and configuration together: to enable a capability, confirm the license first, then run the matching configuration.

| 要启用的能力 || Capability to Enable | 需要的许可 / 附加 || Required License / Add-On | 关键配置步骤 || Key Configuration Steps |
| --- | --- | --- |
| 数字与聊天渠道 || Digital and chat channels | Contact Center Digital（或 Digital+Voice） || Contact Center Digital (or Digital+Voice) | 开通 Chat / SMS / Social，建 workstream 与队列。 || Enable Chat / SMS / Social, and create workstreams and queues. |
| 原生语音与 IVR || Native voice and IVR | Contact Center Voice（或 Digital+Voice）+ ACS 原生语音；或另行配置 Teams Phone extensibility || Contact Center Voice (or Digital+Voice) plus ACS native voice, or separately configured Teams Phone extensibility | 选择 ACS Voice Calling / ACS Direct Routing，或用 Teams service number + resource account 接入 Teams Phone；再配置 Voice、IVR 与 voice agent。 || Choose ACS Voice Calling / ACS Direct Routing, or connect Teams Phone with a Teams service number and resource account; then configure Voice, IVR, and the voice agent. |
| 生成式 Copilot 与预置 AI agent || Generative Copilot and prebuilt AI agents | 任一 Contact Center 许可 + Copilot Credits || Any Contact Center license plus Copilot Credits | 启用对应 agent，接知识源，配额度与用量监控。 || Enable the relevant agents, connect knowledge sources, and set quota and usage monitoring. |
| 自定义对话 agent || Custom conversational agents | Microsoft Copilot Studio | 在 Copilot Studio 编排对话与工具，发布到渠道。 || Author conversations and tools in Copilot Studio and publish to channels. |
| 嵌入既有 CRM || Embed into an existing CRM | 目标 CRM 满足系统要求 || Target CRM meets system requirements | 选 embedded 模式，配连接器与 Dataverse 同步。 || Choose embedded mode and configure the connector and Dataverse sync. |
| Teams 语音协作 || Teams voice collaboration | Contact Center USL + Teams + Teams Phone + PSTN | 配 Teams Phone 扩展与资源账户，分配座席许可。 || Configure Teams Phone extensibility and resource accounts, and assign rep licenses. |
:::

## #budget 15 / Cost Composition and Budget :: 按访谈顺序采集业务事实，再生成年度配置与成本 || Collect Business Facts in Interview Order, Then Generate Annual Configuration and Cost

向导依次询问范围、人员、渠道、现有系统、AI 用量和商务条件。系统根据回答推荐许可与语音方案，将月均或年度业务量统一换算成年度 Copilot Credits，并比较 PAYG 与 P3 年度预购；下方列表实时给出配置、成本、公式和依据。 || The wizard asks about scope, people, channels, existing systems, AI usage, and commercial terms in sequence. It recommends licensing and telephony from those answers, normalizes monthly-average or annual business volumes into annual Copilot Credits, and compares PAYG with annual P3 pre-purchase. The live lists below show configuration, cost, formulas, and evidence.

:::sandbox { id: "budget-tool-root", title: "确定估算范围 || Define the Estimate Scope", canvas: false }
先统一合同周期、用量口径和数据来源，避免后续把月均值与年度总量混用。 || Align the contract term, usage basis, and data source first so monthly averages and annual totals are not mixed later.
:::

## #governance 16 / Risk Governance :: AI、数据和电话线路需要被一起治理 || AI, Data, and Telephony Need Joint Governance

在推进试点与采购前，安全、法务和架构团队还必须逐项签字确认治理边界，尤其是实时语音 agent、外部 CRM 数据同步和跨区域语音可用性。 || Before advancing from pilot to procurement, security, legal, and architecture teams must sign off on governance boundaries, especially real-time voice agents, external CRM data sync, and cross-region voice availability.

:::comparison { title: "Governance Checklist" }
::versus AI 安全 || AI Safety
### 高风险动作不能只靠生成式回复 || High-Risk Actions Cannot Rely Only on Generative Responses
微软透明说明列出 hallucination、过度披露、工具调用失败、上下文保留和安全过滤卡顿等风险。涉及财务、合规、承诺或敏感个人信息的动作，应使用确定性流程和人工审批。 || Microsoft's transparency note lists hallucination, over-disclosure, tool-call failure, context-retention, and safety-filter stall risks. Actions involving finance, compliance, commitments, or sensitive personal information should use deterministic flows and human approval.

::versus 数据治理 || Data Governance
### 外部 CRM 集成要定义主数据归属 || External CRM Integration Must Define Master Data Ownership
Salesforce 连接器文档建议同步后不要在 Dataverse 修改同步数据，必须在 Salesforce 更新。这说明数据主系统、回写策略和冲突处理要在实施前确定。 || The Salesforce connector documentation recommends not changing synced data in Dataverse after sync; updates should be made in Salesforce. This means system of record, write-back policy, and conflict handling must be decided before implementation.

::versus 合规与审计 || Compliance and Audit
### 录音、转写、质检和员工分析都有告知义务 || Recording, Transcription, Quality, and Employee Analytics Carry Notice Duties
实时分析文档明确提醒客户需遵守适用法律，包括告知和取得同意。企业应把客户告知、员工告知、保留周期和访问审计写入运营制度。 || The real-time analytics documentation explicitly reminds customers to comply with applicable laws, including notice and consent. Enterprises should document customer notice, employee notice, retention period, and access audit in operating policy.

::versus 区域与线路 || Region and Telephony
### 语音可用性、PSTN 和 Teams Phone 要单独验收 || Voice Availability, PSTN, and Teams Phone Need Separate Acceptance
国际可用性表显示 Digital 与 Voice 在部分区域不同步。Teams Phone 扩展还需要 Teams、Teams Phone 和 PSTN 方案。跨国客户应按国家验收号码、延迟、录音和紧急呼叫。 || The international availability table shows Digital and Voice are not aligned in every geography. Teams Phone extensibility also requires Teams, Teams Phone, and PSTN options. Global customers should accept-test numbers, latency, recording, and emergency calling by country.
:::

Dynamics 365 Contact Center 是 Microsoft Product Terms 定义的 Core Online Service，覆盖或符合以下合规框架，详情见 Microsoft Service Trust Portal： || Dynamics 365 Contact Center is a Core Online Service as defined in the Microsoft Product Terms and is compliant with or covered by the following frameworks; see the Microsoft Service Trust Portal for details:

| 认证 || Certification | 覆盖领域 || What It Covers |
| --- | --- |
| HITRUST CSF | 医疗信息信任联盟通用安全框架。 || Health Information Trust Alliance Common Security Framework. |
| FedRAMP | 美国联邦风险与授权管理项目。 || US Federal Risk and Authorization Management Program. |
| SOC | 系统与组织控制报告。 || System and Organization Controls reports. |
| CSA STAR | 云安全联盟安全信任与风险评估。 || Cloud Security Alliance Security Trust Assurance and Risk. |
| UK G-Cloud | 英国政府云。 || United Kingdom Government Cloud. |
| HIPAA | 美国健康保险可携带与责任法覆盖。 || US Health Insurance Portability and Accountability Act coverage. |
| ISO（多项） || ISO (various) | 多项国际标准化组织认证。 || Various International Organization for Standardization certifications. |
| PCI DSS | 支付卡行业数据安全标准。 || Payment Card Industry Data Security Standard. |

:::callout { title: "决策口径 || Decision Rule" }
当目标是把服务体验、CRM 记录、AI 自动化和运营管理连成一套可审计、可扩展的客户运营系统时，Dynamics 365 Contact Center 应作为首选评估对象。尤其当企业已在使用 Microsoft 365、Teams、Dynamics 或 Azure 时，它能复用既有身份、合规与数据平面，并有 Forrester TEI 的回报区间可参考。仅当需求局限于最低价电话座席、且没有 CRM、AI 或运营整合目标时，才需要把纯用量型 CCaaS 一并比较。 || When the goal is to connect service experience, CRM records, AI automation, and operations management into an auditable, extensible customer operations system, Dynamics 365 Contact Center should be the first candidate to evaluate. For enterprises already using Microsoft 365, Teams, Dynamics, or Azure, it reuses existing identity, compliance, and data planes and offers Forrester TEI return ranges as a benchmark. Only when the requirement is limited to lowest-price telephony seats with no CRM, AI, or operations integration goal is it necessary to also compare usage-only CCaaS.
:::

## #glossary 17 / Appendix / Glossary :: 关键术语用于统一评估口径 || Key Terms Align the Evaluation Vocabulary

正文按业务问题展开；完整术语定义集中在此，供需要时查阅。 || The main narrative follows business questions; complete term definitions are collected here for reference.

:::accordion
::panel
### CCaaS、IVR、WEM、AHT 与 FCR || CCaaS, IVR, WEM, AHT, and FCR
这些术语分别描述平台范围、语音入口、员工运营和服务效率指标，不能混为同一类能力。 || These terms describe platform scope, voice entry, workforce operations, and service-efficiency measures; they are not interchangeable capabilities.

| 术语 || Term | 本文定义 || Definition in This Guide | 业务含义 || Business Meaning |
| --- | --- | --- |
| CCaaS | Contact Center as a Service，云联络中心服务，通常覆盖语音、数字渠道、路由、座席工作台、监控、质检和集成。 || Contact Center as a Service, usually covering voice, digital channels, routing, representative workspace, monitoring, quality, and integration. | 从自建呼叫中心转向按云服务、用户数或用量购买的客户交互平台。 || A shift from self-hosted call centers to customer-engagement platforms purchased as cloud services, seats, or usage. |
| IVR | Interactive Voice Response，交互式语音应答；传统 IVR 多依赖菜单，AI IVR 可通过自然语言识别意图。 || Interactive Voice Response; traditional IVR relies on menus, while AI IVR can detect intent through natural language. | 影响转人工率、首轮分流质量和等待体验。 || Affects human-handoff rate, first-step routing quality, and waiting experience. |
| WEM | Workforce Engagement Management，通常包括质检、录音、排班、绩效和辅导。 || Workforce Engagement Management, typically covering quality, recording, scheduling, performance, and coaching. | 决定联络中心能否稳定管理人员与服务质量。 || Determines whether the contact center can manage workforce and service quality consistently. |
| AHT / FCR | Average Handling Time 是平均处理时长；First Contact Resolution 是首次接触解决率。 || Average Handling Time measures handling duration; First Contact Resolution measures issues resolved on first contact. | AHT 衡量成本效率，FCR 衡量客户少折返；ROI 评估应同时观察。 || AHT measures cost efficiency; FCR measures reduced repeat contact; ROI analysis should use both. |
:::

## #references 17 / References :: 参考来源 || References

本文使用公开来源，优先采用 Microsoft Learn、Microsoft Licensing Guide 和各厂商官方产品 / 定价页。所有价格与功能均可能变化，采购前应以合同和最新官方页为准。 || This guide uses public sources, prioritizing Microsoft Learn, the Microsoft Licensing Guide, and official vendor product or pricing pages. Prices and capabilities may change; procurement should rely on contracts and the latest official pages.

- [1] Microsoft Learn：Dynamics 365 Contact Center overview — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/overview-contact-center | 支撑产品定位、Copilot-first、CRM of choice、关键能力列表。 || Supports product positioning, Copilot-first framing, CRM of choice, and key capability list.
- [2] Microsoft Learn：System requirements for Dynamics 365 Contact Center — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/system-requirements-contact-center | 支撑系统要求、Azure Communication Services、第三方 cookies、许可入口和可访问 URL。 || Supports system requirements, Azure Communication Services, third-party cookies, licensing entry points, and allowlist URLs.
- [3] Microsoft Dynamics 365 Licensing Guide，July 2026 — https://go.microsoft.com/fwlink/p/?LinkId=866544 | 支撑 Digital、Voice、Digital+Voice 价格、容量权益、Copilot Credits 与 Teams Phone 扩展说明。 || Supports Digital, Voice, Digital+Voice pricing, capacity entitlements, Copilot Credits, and Teams Phone extensibility notes.
- [4] Microsoft Learn：Provision channels in Dynamics 365 Contact Center — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/provision-channels | 支撑 Chat、Voice、SMS、Social、Microsoft Teams 渠道说明和渠道许可提醒。 || Supports Chat, Voice, SMS, Social, Microsoft Teams channel coverage and channel licensing notes.
- [5] Microsoft Learn：Configure the connector for Salesforce — https://learn.microsoft.com/en-us/dynamics365/contact-center/administer/configure-salesforce-connector | 支撑 Salesforce 数据同步、Dataverse 映射、10GB 性能建议和同步后数据更新边界。 || Supports Salesforce data sync, Dataverse mapping, 10GB performance recommendation, and synced-data update boundary.
- [6] Microsoft Learn：Configure the connector for Zendesk — https://learn.microsoft.com/en-us/dynamics365/contact-center/extend/configure-zendesk-connector | 支撑 Zendesk、Power Automate flow、webhook 与 Dataverse 同步路径。 || Supports Zendesk, Power Automate flow, webhook, and Dataverse sync path.
- [7] Microsoft Learn：Contact center agents in Dynamics 365 Contact Center — https://learn.microsoft.com/en-us/dynamics365/contact-center/administer/overview-contact-center-agents | 支撑 Customer Assist Agent、Quality Assurance Agent 和 Service Operations Agent 能力分类。 || Supports Customer Assist Agent, Quality Assurance Agent, and Service Operations Agent capability categories.
- [8] Microsoft Learn：Responsible AI FAQ for AI agents — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/faq-rai-ai-agents | 支撑 AI agent 限制、数据质量依赖、人工监督和治理模式。 || Supports AI agent limitations, data-quality dependency, human oversight, and governance modes.
- [9] Microsoft Learn：Transparency note for real-time voice agents — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/transparency-note-real-time-voice-agents | 支撑实时语音 agent 的能力、限制、幻觉、工具调用、延迟和评估方法。 || Supports real-time voice agent capabilities, limitations, hallucination, tool calls, latency, and evaluation methods.
- [10] Microsoft Learn：International availability of Dynamics 365 Contact Center — https://learn.microsoft.com/en-us/dynamics365/contact-center/implement/international-availability | 支撑地域与语言可用性、Digital/Voice 区域差异。 || Supports geography and language availability plus Digital/Voice regional differences.
- [11] Genesys Cloud CX 官方产品页 — https://www.genesys.com/genesys-cloud | 支撑 Genesys 的 AI-powered Experience Orchestration、全渠道、WEM 与旅程管理定位。 || Supports Genesys positioning around AI-powered Experience Orchestration, omnichannel, WEM, and journey management.
- [12] Genesys Cloud CX Pricing — https://www.genesys.com/pricing | 支撑 CX1-CX4 公开价、AI tokens、Named/Concurrent/Hourly licensing 说明。 || Supports CX1-CX4 public prices, AI tokens, and Named/Concurrent/Hourly licensing notes.
- [13] NICE CXone 官方产品页 — https://www.nice.com/products/cxone | 支撑 NICE 对 AI、编排、员工工作台、客户交互数据和行业包的公开定位。 || Supports NICE public positioning on AI, orchestration, workforce workspace, customer engagement data, and industry packages.
- [14] NICE CXone Pricing — https://www.nice.com/websites/pricing | 支撑 NICE 公开包价与 included / add-on / consumption based 成本结构。 || Supports NICE public package prices and included / add-on / consumption-based cost structure.
- [15] Salesforce Agentforce Contact Center 官方页 — https://www.salesforce.com/service/contact-center/ | 支撑 Salesforce 对 voice、digital channels、CRM data、AI agents 和公开价格的说明。 || Supports Salesforce statements on voice, digital channels, CRM data, AI agents, and public pricing.
- [16] Amazon Connect Customer Pricing — https://aws.amazon.com/connect/pricing/ | 支撑 Amazon Connect 的按使用量计费、通信渠道单价和 Forrester TEI 摘要指标。 || Supports Amazon Connect usage-based pricing, channel unit prices, and Forrester TEI summary metrics.
- [17] AWS Docs：What is Connect Customer? — https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html | 支撑 Amazon Connect 的角色、渠道和实时性能管理说明。 || Supports Amazon Connect role, channel, and real-time performance-management descriptions.
- [18] Five9 官方 Why Five9 页面 — https://www.five9.com/why-five9 | 支撑 Five9 对 AI-powered CX、99.999% uptime、Agent Assist 与案例结果的公开表述。 || Supports Five9 public statements on AI-powered CX, 99.999% uptime, Agent Assist, and case outcomes.
- [19] Microsoft Dynamics 365 博客：Forrester TEI 显示 315% ROI（Customer Service，2024） — https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2024/03/27/forrester-tei-study-shows-315-roi-when-modernizing-customer-service-with-microsoft-dynamics-365/ | 支撑 D365 Customer Service 315% ROI、回收期低于 6 个月、通话处理 -40%、一次解决 +20%、误转 -15%、退役旧系统省约 97.8 万美元。 || Supports D365 Customer Service 315% ROI, payback under six months, 40% lower handle time, 20% higher FCR, 15% fewer misroutes, and about $978K retired-system savings.
- [20] Forrester：New Technology Projected Total Economic Impact of Microsoft Dynamics 365 Contact Center — https://tei.forrester.com/go/Microsoft/Dynamics365CC/docs/NTTEI_of_Microsoft_D365_Contact_Center_vA.pdf | 支撑 D365 Contact Center 预测 ROI 100%–345%、NPV 79.2 万–270 万美元、语音停机 -55%、通话处理 -13% 至 -40%、Teams Phone 替换电话许可省 32.8 万–60.2 万美元。 || Supports D365 Contact Center projected ROI 100%–345%, NPV $792K–$2.7M, up to 55% less voice downtime, 13% to 40% lower handle time, and $328K–$602K telephony-license savings via Teams Phone.
- [21] BCG：Where's the Value in AI?（2024 年 10 月） — https://www.bcg.com/publications/2024/wheres-value-in-ai | 支撑“支持类职能占 AI 商业价值 38%”这一行业数据。 || Supports the industry figure that support functions account for 38% of AI business value.
- [22] Forrester：Customer Experience Index 2025 Results — https://www.forrester.com/blogs/cx-index-2025-results/ | 支撑“美国 25% 品牌 2025 年客户体验排名下滑”。 || Supports the figure that 25% of US brands declined in customer experience rankings in 2025.
- [23] Microsoft Customer Stories（customers.microsoft.com） — https://customers.microsoft.com | 支撑 Lenovo、PKO Leasing、Innovation Federal Credit Union、VIVID、Virgin Money、Apollo 等公开客户成效。 || Supports the public outcomes for Lenovo, PKO Leasing, Innovation Federal Credit Union, VIVID, Virgin Money, and Apollo.
- [24] Microsoft Service Trust Portal — https://servicetrust.microsoft.com | 支撑 Dynamics 365 Contact Center 的合规认证清单（HITRUST、FedRAMP、SOC、CSA STAR、G-Cloud、HIPAA、ISO、PCI DSS）。 || Supports the Dynamics 365 Contact Center compliance certification list (HITRUST, FedRAMP, SOC, CSA STAR, G-Cloud, HIPAA, ISO, PCI DSS).
- [25] Microsoft：Dynamics 365 Contact Center 价值材料（FY26） — https://www.microsoft.com/en-us/dynamics-365/products/contact-center | 支撑 Business Value Insights 的 KPI 区间（最多 25%/66%/$20M）、微软自身 CSS 转型规模与 KPI、分析师归纳的竞争定位与 Nuance；均出自微软 FY26 官方价值/使能材料。 || Supports the Business Value Insights KPI ranges (up to 25%/66%/$20M), Microsoft's own CSS transformation scale and KPIs, and the analyst-summarized competitive positioning and Nuance; all from Microsoft's FY26 official value and enablement materials.
- [26] Microsoft Learn：Copilot Credits billing rates and management — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management | 支撑 Classic answer、Generative answer、Agent action、Agent flow、AI Tools 与 10/35/75 credits/分钟的 Voice 费率。 || Supports Classic answer, Generative answer, Agent action, Agent flow, AI Tools, and Voice rates of 10/35/75 credits per minute.
- [27] Microsoft Learn：Agent usage estimator — https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-usage-estimator | 支撑按话务、会话、功能配置与 agent 类型预测月度 credits，并建议使用近 3–6 个月数据和增加 10%–20% 缓冲。 || Supports forecasting monthly credits by traffic, conversations, feature configuration, and agent type, using three to six months of history plus a 10%–20% buffer.
- [28] Microsoft Copilot Studio Licensing Guide，July 2026 — https://go.microsoft.com/fwlink/?linkid=2320995 | 支撑 PAYG 费率与 Copilot Credits 采购结构；本工具按销售建议仅评估 PAYG 与 P3 年度预购。 || Supports PAYG rates and Copilot Credit purchase constructs; following current sales guidance, this tool evaluates only PAYG and annual P3 pre-purchase.
- [29] Microsoft Copilot Credits Guide，July 2026 — https://go.microsoft.com/fwlink/?linkid=2368800 | 支撑 Copilot Credits 的统一用量货币、租户级汇总、PAYG 与年度预购 P3（300,000 credits 起）的定义。 || Supports Copilot Credits as the common usage currency, tenant-level pooling, PAYG, and annual P3 pre-purchase starting at 300,000 credits.
- [30] Nintex：Software sprawl: Your organization's silent growth killer（2025 年 6 月） — https://www.nintex.com | 支撑“86% 的 IT 领导者认为拼凑式技术栈同时带来财务压力与安全风险、并把整合列为优先事项”，以及微软材料援引的 60%–80% IT 预算用于维护遗留与割裂系统的分析师估计区间。 || Supports the figure that 86% of IT leaders say patchwork tech stacks create financial strain and security risks and make consolidation a priority, plus the analyst estimate range, cited in Microsoft materials, that 60%–80% of IT budgets maintain legacy and fragmented systems.
- [31] Microsoft Learn：Monitor calls in the voice channel — https://learn.microsoft.com/en-us/dynamics365/customer-service/use/voice-channel-monitor-calls | 支撑 standalone 模式下的主管静默监听、私聊座席与 Join call（supervisor barge-in）能力及角色要求。 || Supports supervisor monitoring, private representative messaging, Join call (supervisor barge-in), and role requirements in standalone mode.
- [32] Microsoft Learn：Transfer calls and consult with users — https://learn.microsoft.com/en-us/dynamics365/customer-service/use/voice-channel-transfer-consult | 支撑座席、主管、队列、Teams 与外部 PSTN 的咨询和转接，primary representative 提升，以及 Copilot agent 接收转入电话后的再转接限制。 || Supports consult and transfer across representatives, supervisors, queues, Teams, and external PSTN, primary-representative promotion, and the retransfer limit after a Copilot agent receives a transferred call.
- [33] Microsoft Learn：Enable supervisor access to manage conversations — https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/enable-monitor-assign-transfer-conv | 支撑主管的 Monitor、Assign、Transfer 与 Force Close 权限边界。 || Supports the documented supervisor permissions for Monitor, Assign, Transfer, and Force Close.
- [34] Microsoft Learn：Real-time agents overview — https://learn.microsoft.com/en-us/microsoft-copilot-studio/voice-realtime-voice-agents | 支撑 PSTN/SIP、DTMF、VAD、客户打断、模型与区域前置条件、数字消息预览限制及转写边界。 || Supports PSTN/SIP, DTMF, VAD, caller interruption, model and regional prerequisites, digital-messaging preview limits, and transcript boundaries.
- [35] Microsoft Learn：ACS PSTN integration concepts — https://learn.microsoft.com/en-us/azure/communication-services/concepts/telephony/telephony-concept | 支撑 ACS Voice Calling 与 ACS Direct Routing 的号码、运营商、SBC 和适用场景差异。 || Supports differences in numbers, carriers, SBCs, and fit between ACS Voice Calling and ACS Direct Routing.
- [36] Microsoft Learn：Teams Phone extensibility overview — https://learn.microsoft.com/en-us/azure/communication-services/concepts/interop/tpe/teams-phone-extensibility-overview | 支撑 Teams Phone 通过 ACS API 接入 CCaaS、resource account、service number、通话控制、AI 转人工、客户端选择与通话历史限制。 || Supports Teams Phone integration into CCaaS through ACS APIs, resource accounts, service numbers, call controls, AI handoff, client-selection behavior, and call-history limits.
- [37] Microsoft Learn：Teams Phone extensibility connectivity and cost — https://learn.microsoft.com/en-us/azure/communication-services/concepts/interop/tpe/teams-phone-extensibility-connectivity-cost | 支撑 Calling Plan、Operator Connect、Direct Routing 的架构取舍、座席许可和 ACS 用量成本。 || Supports architecture tradeoffs, representative licensing, and ACS usage costs for Calling Plan, Operator Connect, and Direct Routing.
- [38] Microsoft Learn：Configure Teams Phone in voice channel — https://learn.microsoft.com/en-us/dynamics365/contact-center/administer/configure-teams-phone-in-voice-channel | 支撑 D365 Contact Center 的 Teams service number、resource account、ACS 关联、PSTN 和 Enterprise Voice 配置要求。 || Supports D365 Contact Center requirements for Teams service numbers, resource accounts, ACS association, PSTN, and Enterprise Voice.
- [39] Microsoft Learn：Teams PSTN connectivity options — https://learn.microsoft.com/en-us/microsoftteams/pstn-connectivity | 支撑 Calling Plan、Operator Connect 与 Teams Direct Routing 的运营商、号码、SBC、路由和支持责任差异。 || Supports differences in carrier, number, SBC, routing, and support ownership across Calling Plan, Operator Connect, and Teams Direct Routing.
- [40] Microsoft Learn：Configure the connector for ServiceNow — https://learn.microsoft.com/en-us/dynamics365/contact-center/extend/configure-servicenow-connector | 支撑 ServiceNow Account/Contact 到 Dataverse 的初始与增量单向同步、View-In-CRM、字段映射、Business Rule 与 REST Message 配置。 || Supports initial and incremental one-way synchronization of ServiceNow Account and Contact into Dataverse, View-In-CRM, field mappings, Business Rules, and REST Messages.
- [41] Microsoft Learn：Configure the connector for any CRM solution — https://learn.microsoft.com/en-us/dynamics365/contact-center/extend/configure-custom-connector | 支撑外部 CRM 初始/增量复制模式、分页建议、HTTP、webhook 与 Business Rule 扩展路径。 || Supports initial and incremental copy patterns for external CRMs, pagination guidance, and HTTP, webhook, and Business Rule extension paths.
- [42] Microsoft Learn：Contact center architecture with an existing CRM — https://learn.microsoft.com/en-us/dynamics365/guidance/reference-architectures/contact-center-existing-crm-dynamics-365-contact-center | 支撑保留既有 CRM、微软侧管理渠道/路由/机器人/分析，以及 Dataverse 保存 Contact Center 核心运行数据的总体边界。 || Supports retaining an existing CRM while Microsoft manages channels, routing, bots, and analytics, with Dataverse holding core Contact Center runtime data.
- [43] Microsoft Learn：Overview of Copilot Service workspace — https://learn.microsoft.com/en-us/dynamics365/contact-center/use/ccw-overview | 支撑 Copilot Service workspace 是 Contact Center 的座席应用、使用 Dynamics 365 登录、提供多会话与跨渠道工作台。 || Supports Copilot Service workspace as the representative-facing Contact Center application, accessed through Dynamics 365 with multisession and cross-channel capabilities.
- [44] Microsoft GitHub：ServiceNow data-sync flows and scripts — https://github.com/microsoft/dynamics-365-contact-center/tree/CCaaS-3P-CRM-Connector/flows/ServiceNow | 支撑一个初始批量 flow、Account/Contact 各三个 CUD flow，以及六段 ServiceNow Business Rule 脚本的实现清单。 || Supports the implementation inventory of one initial bulk flow, three CUD flows each for Account and Contact, and six ServiceNow Business Rule scripts.
- [45] Microsoft Learn：Add OAuth authentication for HTTP request triggers — https://learn.microsoft.com/en-us/power-automate/oauth-authentication | 支撑生产环境使用 OAuth 保护 Power Automate HTTP trigger，而不是只依赖可复制的 endpoint URL。 || Supports protecting Power Automate HTTP triggers with OAuth in production rather than relying only on a copyable endpoint URL.
- [46] Microsoft Learn：ServiceNow Power Platform connector — https://learn.microsoft.com/en-us/connectors/service-now/ | 支撑 Copilot Studio Premium connector 可执行记录 CUD、知识检索、服务目录、下单与附件操作，以及认证模式、600 calls/60 秒限流和已知限制。 || Supports ServiceNow premium connector operations in Copilot Studio for record CUD, knowledge retrieval, service catalog, ordering, and attachments, plus authentication modes, the 600-calls-per-60-seconds throttle, and known limitations.
- [47] Microsoft Learn：Use connectors in Copilot Studio agents — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors | 支撑连接器可作为 agent tool、topic tool、agent flow action 或知识源，并说明用户凭据、Agent 作者凭据、连接共享及 SSO 限制。 || Supports connectors as agent tools, topic tools, agent-flow actions, or knowledge sources and documents user credentials, agent-author credentials, connection sharing, and SSO limitations.
- [48] Microsoft Learn：Add unstructured ServiceNow knowledge — https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-unstructured-data | 支撑 ServiceNow 作为 Copilot Studio 非结构化知识源、仅使用已发布文章、最终用户权限校验与独立登录要求。 || Supports ServiceNow as an unstructured Copilot Studio knowledge source using published articles only, with end-user permission checks and separate sign-in requirements.
- [49] Microsoft Learn：Configure user authentication for tools — https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-enduser-authentication | 支撑工具可使用用户身份或 Agent 作者凭据，以及 Omnichannel 工具用户认证当前仅支持 live chat 的渠道边界。 || Supports user or agent-author credentials for tools and the channel boundary that Omnichannel tool user authentication currently supports live chat only.
- [50] Microsoft Learn：Make HTTP requests from Copilot Studio — https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-http-node | 支撑在预建 connector 之外用 HTTP node 调用受控 ServiceNow API，并配置认证 header、错误处理与 30 秒默认超时。 || Supports calling controlled ServiceNow APIs through an HTTP node beyond the predefined connector, with authentication headers, error handling, and a default 30-second timeout.

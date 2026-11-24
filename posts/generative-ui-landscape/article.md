---
title: "生成式 UI 全景：从设计时生成到运行时界面 || The Generative UI Landscape: From Design-Time Generation to Runtime Interfaces"
eyebrow: "Generative UI 全景 || Generative UI Landscape"
brand: Vibe Coding
date: 2026-06-10
strict_i18n: false
strict_density: true
lead: "生成式 UI（Generative UI）指由 AI 模型生成用户界面，而非由人工手写固定界面。它包含两个层次：设计时生成（模型产出设计稿或前端代码，经人工审校后部署）与运行时生成（模型在对话或请求中即时生成可交互界面）。2024 年 6 月 Claude Artifacts 将生成界面引入对话窗口，2025 年 11 月 Google Gemini 3 的 Generative UI 进一步让模型即时生成整张界面[1][4]。本文按三层范式对比代表产品与开放协议，并给出定位象限图。 || Generative UI refers to user interfaces produced by an AI model rather than hand-coded by people. It spans two layers: design-time generation (the model outputs design mockups or front-end code that humans review and deploy) and runtime generation (the model produces an interactive interface on the fly inside a conversation or request). In June 2024 Claude Artifacts brought generated interfaces into the chat window; in November 2025 Google Gemini 3 Generative UI let the model assemble the entire interface in real time [1][4]. This article maps representative products and open protocols across three paradigms and a positioning chart."
hero_actions:
  - "看三大范式 || See Three Paradigms | #paradigms"
  - "看定位象限 || See the Map | #map"
panel_label: "核心观点 || Core Thesis"
panel_title: "生成式 UI 的重心正从「设计时生成代码」向「运行时生成界面」迁移，可控性与一致性是落地的主要约束。 || The center of gravity of generative UI is shifting from generating code at design time to generating interfaces at runtime; controllability and consistency are the main constraints on adoption."
panel:
  - "设计时层：v0、bolt.new、Lovable 把自然语言变成可部署的前端工程，人仍是发布前的审校者。 || Design-time layer: v0, bolt.new, and Lovable turn natural language into deployable front-end projects, with humans still reviewing before release."
  - "运行时组件层：Vercel AI SDK、Claude Artifacts、thesys C1 在对话中流式渲染组件，把文本回答升级为可交互控件。 || Runtime component layer: Vercel AI SDK, Claude Artifacts, and thesys C1 stream components inside a conversation, upgrading text answers into interactive controls."
  - "运行时界面层：Gemini 3 Generative UI 与开源 A2UI 让模型对每个 prompt 即时生成整张界面，是当前最前沿的方向。 || Runtime interface layer: Gemini 3 Generative UI and the open-source A2UI let the model assemble a full interface per prompt — the current frontier."
  - "协议层：MCP、A2A、AG-UI、A2UI 四个开放标准正在把 Agent 与界面之间的连接标准化。 || Protocol layer: four open standards — MCP, A2A, AG-UI, and A2UI — are standardizing the connection between agents and interfaces."
metrics:
  - "范式分层 || Paradigm Layers | 3 层 || 3 layers | 设计时生成 / 运行时组件 / 运行时界面 || Design-time / Runtime component / Runtime interface"
  - "代表产品 || Representative Products | 12+ | 商业产品与开源项目覆盖三层 || Commercial products and open-source projects across all three layers"
  - "开放协议 || Open Protocols | 4 个 || 4 | MCP / A2A / AG-UI / A2UI"
  - "数据截止 || Data Cutoff | 2026-06 | 基于各产品官方文档与公开发布 || Based on official docs and public releases"
style:
  accent: "#8b5cf6"
---

## #define 01 / What Is Generative UI :: 定义：界面由谁生成，在什么时候生成 || Definition: Who Generates the Interface, and When

传统 UI 的形态在发布前就被人固定下来；生成式 UI 把「生成界面」的一部分工作交给模型。区分两者的关键在于两个维度：界面由谁产出（人 vs 模型），以及界面在何时确定（设计时 vs 运行时）。后文各代表产品均可按这两个坐标定位。 || A traditional UI is fixed by people before release; generative UI hands part of producing the interface to the model. Two axes separate them: who produces the interface (people vs model) and when the interface is fixed (design time vs runtime). Every product covered later maps onto these two axes.

:::comparison
::versus 基线 · 传统 UI || Baseline · Traditional UI
### 人在设计时写死界面 || People fix the interface at design time
设计师与工程师在发布前确定每一个屏幕、状态和分支。界面是静态资产：同一段代码对所有用户呈现相同结构，个性化靠预先写好的条件分支实现，模型（如果有）只填充数据，不改变结构。 || Designers and engineers fix every screen, state, and branch before release. The interface is a static asset: the same code shows the same structure to all users, personalization comes from pre-written conditional branches, and the model — if present — only fills data, never changes structure.

::versus 新范式 · 生成式 UI || New Paradigm · Generative UI { highlight: true }
### 模型参与生成界面结构 || The model participates in generating the interface structure
模型根据 prompt、上下文或数据决定界面里出现哪些组件、如何排布。它可以发生在设计时（产出代码交人审校），也可以发生在运行时（对话中即时渲染，甚至整张界面按需生成）。结构本身成为模型的输出。 || The model decides which components appear and how they are arranged based on the prompt, context, or data. This can happen at design time (producing code for human review) or at runtime (rendered live in a conversation, or even a whole interface generated on demand). The structure itself becomes a model output.
:::

## #market 02 / Market and Momentum :: 市场与动能：为什么是现在 || Market and Momentum: Why Now

第三方测算显示，2025 年企业生成式 AI 工具支出约达 370 亿美元，其中应用层占比过半[8]；面向 UI 设计的生成式 AI 细分市场预计从 2023 年的 1.38 亿美元增长到 2033 年约 17 亿美元，复合年增长率约 29.4%[9]。这些数据属于机构预测而非实际收入，但指向同一趋势：界面生成正从研究走向产品，主要由三方面因素驱动： || Third-party estimates put enterprise spending on generative AI tools at roughly USD 37 billion in 2025, with the application layer accounting for more than half [8]; the generative-AI-for-UI-design segment is projected to grow from USD 138 million in 2023 to about USD 1.7 billion by 2033, a CAGR near 29.4% [9]. These figures are analyst forecasts rather than booked revenue, but they point in the same direction: interface generation is moving from research to product, driven by three factors:

:::insight-grid { cols: 3 }
::card 驱动 1
### 模型能力跨过可用线 || Models crossed the usability line
前沿模型在代码生成与结构化输出上的准确率持续提升，使「让模型直接产出可运行界面」从演示走向可交付。同时，模型能够读取图表并按系统指令稳定输出固定格式，构成了运行时生成的前提[1]。 || Frontier models have steadily improved at code generation and structured output, turning model-generated runnable interfaces from demos into deliverable features. Models can also read charts and follow system instructions to emit a fixed format reliably, which is a precondition for runtime generation [1].

::card 驱动 2
### 组件化前端成为天然靶子 || Component-based front ends are a natural target
React 与设计系统（shadcn/ui、Material、Chakra 等）把界面拆成可组合的组件单元。模型不必逐像素绘制，只需选择并组装既有组件，输出空间受控、可验证，生成质量因此更稳定。 || React and design systems (shadcn/ui, Material, Chakra, and others) decompose interfaces into composable component units. The model does not draw pixel by pixel; it selects and assembles existing components, so the output space is bounded and verifiable, making generation more stable.

::card 驱动 3
### Agent 与协议标准化 || Agents and protocol standardization
Agent 需要把结果还给用户，纯文本不够。2025 年 MCP、A2A、AG-UI、A2UI 等开放协议补齐了 Agent 与界面之间的连接层，使「Agent 驱动界面」有了跨平台的标准接口[5][2]。 || Agents must hand results back to users, and plain text is not enough. In 2025 open protocols such as MCP, A2A, AG-UI, and A2UI filled in the connection layer between agents and interfaces, giving 'agent-driven UI' a cross-platform standard interface [5][2].
:::

## #paradigms 03 / Three Paradigms :: 三大范式：界面在生命周期的哪一刻被生成 || Three Paradigms: At Which Moment the Interface Is Generated

结合上述两个坐标，可将市面方案按「生成发生的时机」分为三层：越往后，模型对界面的掌控越多，人工审校的环节越少，可控性挑战也越大。 || Along these two axes, current solutions split into three layers by when generation happens: the later the layer, the more control the model has over the interface, the fewer human review gates remain, and the harder controllability becomes.

:::accordion
::panel { open: true }
### 范式 A：设计时生成（Prompt to App / Design） || Paradigm A: Design-Time Generation (Prompt to App / Design)
模型在开发阶段把自然语言转换为设计稿或可部署的前端工程，由人在发布前审校；这是当前商业化最成熟、收入最集中的一层。 || At the development stage, the model turns natural language into design mockups or a deployable front-end project, with humans reviewing before release; this is the most commercially mature and revenue-dense layer today.

- **v0（Vercel） || v0 (Vercel)** — 从 prompt 生成可运行的 React / Next.js 应用，可连接 GitHub 直接推代码、一键部署到 Vercel。定位是「prompt、build、publish」的全流程[10]。 || Generates runnable React / Next.js apps from a prompt, syncs to GitHub, and deploys to Vercel in one click. Positioned as an end-to-end 'prompt, build, publish' flow [10].
- **bolt.new（StackBlitz） || bolt.new (StackBlitz)** — 基于 WebContainer 在浏览器里跑全栈工程，支持导入企业设计系统（Porsche、Material、Shadcn 等），主打自动测试与迭代降低错误率[10]。 || Runs full-stack projects in the browser via WebContainer, supports importing enterprise design systems (Porsche, Material, Shadcn, and others), and emphasizes automated testing and iteration to cut error rates [10].
- **Lovable** — 面向非工程读者的「prompt 到全栈应用」工具，提供模板与托管，官网称已构建数百万个项目。把后端、数据库、鉴权打包进对话式构建流程[10]。 || A 'prompt to full-stack app' tool aimed at non-engineering users, offering templates and hosting; the site reports millions of projects built. It packages backend, database, and auth into a conversational build flow [10].
- **Figma Make 与 Uizard || Figma Make and Uizard** — 偏设计稿一端：Figma 的 AI 能力与 Uizard 把文字、草图变成线框与高保真界面，产出物是设计而非生产代码，连接设计与开发的交接。 || Closer to the mockup end: Figma's AI features and Uizard turn text and sketches into wireframes and high-fidelity screens; the output is design rather than production code, bridging the design-to-development handoff.

::panel
### 范式 B：运行时组件流式渲染（In-Conversation） || Paradigm B: Runtime Component Streaming (In-Conversation)
在对话或请求处理过程中，模型即时返回可交互组件（图表、表单、卡片），而不是纯文本。界面在运行时生成，但范围限定在组件级，宿主应用框架仍由人工预先编写。 || During a conversation or request, the model returns interactive components (charts, forms, cards) on the fly instead of plain text. The interface is generated at runtime, but remains scoped to the component level while the host app framework is still written by people.

- **Vercel AI SDK（streamUI） || Vercel AI SDK (streamUI)** — 开发框架。streamUI 让模型调用服务端函数并以 React 组件作答；通过 AI State 与 UI State 分离，把可序列化的状态喂给模型、把不可序列化的组件留在客户端[3]。 || A developer framework. streamUI lets the model call server functions and respond with React components; by separating AI State from UI State it feeds serializable state to the model while keeping non-serializable components on the client [3].
- **Claude Artifacts** — 2024 年 6 月随 Claude 3.5 Sonnet 发布。当用户请求代码、文档或网页时，生成物出现在对话旁的专用窗口里，可实时查看、编辑、迭代，把对话式 AI 变成协作工作台[4]。 || Launched June 2024 with Claude 3.5 Sonnet. When users ask for code, documents, or web pages, the output appears in a dedicated window beside the conversation for live viewing, editing, and iteration — turning conversational AI into a collaborative workspace [4].
- **ChatGPT Canvas** — OpenAI 的并排编辑界面，把写作与编码从线性对话中拆出来，放进可定点修改的画布。同属「在对话中生成可操作界面」一类，强调局部编辑而非整页重写。 || OpenAI's side-by-side editing surface that lifts writing and coding out of the linear chat into a canvas with targeted edits. It belongs to the same 'generate an actionable surface inside the conversation' class, emphasizing local edits over full-page rewrites.
- **Thesys C1** — 把生成式 UI 作为 API 提供：传入数据或意图，返回仪表盘、表单、图表、报告等可渲染界面，目标是让「超越文本」的 AI 应用有现成的界面生成基座[7]。 || Offers generative UI as an API: pass in data or intent and get back renderable dashboards, forms, charts, and reports, aiming to give 'beyond-text' AI apps a ready-made interface-generation foundation [7].

::panel
### 范式 C：运行时完整界面生成（Dynamic UI） || Paradigm C: Runtime Full-Interface Generation (Dynamic UI)
模型对每个 prompt 即时生成一整张定制界面，而不只是一个组件。这一方向在 2025 年底浮现，目前以实验性功能与开源规范为主。 || The model assembles an entire customized interface per prompt, not just one component. Emerging in late 2025, this direction is currently dominated by experimental features and open specifications.

- **Gemini 3 Generative UI** — 2025 年 11 月 18 日随 Gemini 3 发布，通过 Dynamic View 与 Visual Layout 两种体验，对每个 prompt 即时生成完整的可交互界面（如行程规划器、教学工具）。技术上结合内容与布局生成、agentic 编码与后处理[1]。 || Launched November 18, 2025 with Gemini 3. Through two experiences — Dynamic View and Visual Layout — it assembles a full interactive interface per prompt (such as a trip planner or teaching tool). Technically it combines content and layout generation, agentic coding, and post-processing [1].
- **A2UI（开源规范） || A2UI (open specification)** — Google 开源的 agent 驱动、跨平台生成式 UI 规范，定义 Agent 如何投递可渲染的 UI 控件，邀请社区协作以推动动态界面跨生态落地[2]。 || Google's open-sourced spec for agent-driven, cross-platform generative UI, defining how an agent delivers renderable UI widgets and inviting community collaboration to spread dynamic interfaces across ecosystems [2].
- **AG-UI + CopilotKit** — AG-UI 是开放、事件型的 Agent↔用户交互协议；CopilotKit 是兼容 AG-UI 的前端栈，提供聊天、生成式 UI、共享状态与 human-in-the-loop，把 Agent 后端接到任意前端[5][6]。 || AG-UI is an open, event-based agent-to-user interaction protocol; CopilotKit is an AG-UI-compatible front-end stack providing chat, generative UI, shared state, and human-in-the-loop, wiring an agent backend to any front end [5][6].
:::

## #map 04 / Positioning Map :: 定位象限：用两个坐标看清整个市场 || Positioning Map: The Whole Market on Two Axes

横轴是「生成时机」（设计时到运行时），纵轴是「生成范围」（局部组件到完整界面）。把第三节的代表产品放进同一张图，三大范式自然落到不同区域：左侧偏成熟商业化，右上角是最前沿也是最具不确定性的方向。 || The horizontal axis is 'when generation happens' (design time to runtime); the vertical axis is 'scope of generation' (a single component to a full interface). Placing the representative products from Section 3 onto one chart, the three paradigms fall into distinct regions: the left is mature and commercialized, while the top-right is the frontier — and the most uncertain.

设计时 · 完整应用 || Design-time · Full app

运行时 · 完整界面 || Runtime · Full interface

设计时 · 局部设计 || Design-time · Partial design

运行时 · 组件级 || Runtime · Component-level

生成时机 → || When generated →

生成范围 → || Scope →

v0 / bolt.new / Lovable

设计时产出可部署的完整前端工程，人发布前审校。 || Produce deployable full front-end projects at design time, reviewed before release.

Figma Make / Uizard

设计时产出线框与设计稿，连接设计与开发交接。 || Produce wireframes and mockups at design time, bridging design and development.

Claude Artifacts / ChatGPT Canvas

对话中即时生成可交互的完整小应用与画布。 || Generate interactive mini-apps and canvases live in the conversation.

Vercel AI SDK（streamUI） || Vercel AI SDK (streamUI)

运行时把模型回答流式渲染为组件，宿主框架仍由人写。 || Stream model answers into components at runtime; the host framework is still hand-written.

Thesys C1 / CopilotKit

以 API 与前端栈形式提供运行时界面生成基座。 || Provide a runtime interface-generation foundation as an API and front-end stack.

Gemini 3 Generative UI / A2UI

对每个 prompt 即时生成整张界面，当前最前沿。 || Assemble a full interface per prompt — the current frontier.

读图方法：越靠右，界面越晚被确定、模型掌控越多；越靠上，模型生成的范围越接近整张界面。商业收入目前集中在左半区，研究热度集中在右上区。 || How to read it: the further right, the later the interface is fixed and the more the model controls; the further up, the closer the model's output is to a full interface. Commercial revenue clusters on the left half; research attention clusters in the top-right.

## #matrix 05 / Representative Products Compared :: 对比矩阵：商业产品与开源项目并列 || Comparison Matrix: Commercial Products Beside Open-Source Projects

把代表方案放进同一张表，按所属范式、生成时机、输出形态、是否开源、典型场景五个维度对照。表中信息基于各产品 2026 年 6 月的公开文档与发布说明。 || The representative solutions side by side, compared across five dimensions: paradigm, generation timing, output form, open-source status, and typical use. The table reflects each product's public docs and release notes as of June 2026.

| 方案 || Solution | 范式 || Paradigm | 生成时机 || Timing | 输出形态 || Output | 开源 || Open | 典型场景 || Typical Use |
| --- | --- | --- | --- | --- | --- |
| v0 / bolt.new / Lovable | A 设计时 || A Design-time | 开发阶段 || Dev stage | 可部署前端工程 || Deployable front-end project | 商业（闭源） || Commercial (closed) | 快速原型、上线 MVP || Fast prototypes, ship MVPs |
| Figma Make / Uizard | A 设计时 || A Design-time | 设计阶段 || Design stage | 线框 / 高保真设计稿 || Wireframes / hi-fi mockups | 商业（闭源） || Commercial (closed) | 概念探索、设计交接 || Concept exploration, handoff |
| Vercel AI SDK | B 运行时组件 || B Runtime component | 运行时（对话内） || Runtime (in chat) | 流式 React 组件 || Streamed React components | 开源框架 || Open-source framework | 自建对话式应用 || Building chat-native apps |
| Claude Artifacts / ChatGPT Canvas | B 运行时组件 || B Runtime component | 运行时（对话内） || Runtime (in chat) | 侧栏可编辑产物 || Editable side-panel artifact | 商业（闭源） || Commercial (closed) | 协作写作与编码 || Collaborative writing and coding |
| Thesys C1 | B 运行时组件 || B Runtime component | 运行时（API） || Runtime (API) | 仪表盘 / 表单 / 图表 || Dashboards / forms / charts | 商业 API || Commercial API | 数据型 AI 应用界面 || Data-heavy AI app UIs |
| CopilotKit / AG-UI | B/C 运行时 || B/C Runtime | 运行时（协议） || Runtime (protocol) | 事件驱动的 Agent 界面 || Event-driven agent UI | 开源协议 + 前端栈 || Open protocol + front-end stack | Agent 接入任意前端 || Wiring agents to any front end |
| Gemini 3 Generative UI / A2UI | C 运行时界面 || C Runtime interface | 运行时（每 prompt） || Runtime (per prompt) | 即时生成的完整界面 || Full interface generated on the fly | 产品闭源 / A2UI 开源 || Product closed / A2UI open | 动态搜索与助手体验 || Dynamic search and assistant UX |

## #protocols 06 / Protocol Substrate :: 协议基础设施：让运行时生成可互操作 || Protocol Substrate: Making Runtime Generation Interoperable

运行时生成式 UI 要跨产品落地，需要标准化的连接层。2025 年成型的四个开放协议各管一段：工具调用、Agent 间协调、Agent 与用户交互、以及界面控件投递。它们互补而非竞争[5]。 || For runtime generative UI to work across products, the connection layer must be standardized. Four open protocols that took shape in 2025 each own one segment: tool calls, agent-to-agent coordination, agent-to-user interaction, and UI widget delivery. They are complementary, not competing [5].

:::insight-grid { cols: 2 }
::card MCP
### Agent ↔ 工具与数据 || Agent ↔ Tools and Data
Model Context Protocol，由 Anthropic 提出。让 Agent 安全发现并调用外部工具、工作流与数据源，是生成界面所需数据的来源层[5]。 || Model Context Protocol, originated by Anthropic. It lets agents securely discover and call external tools, workflows, and data sources — the source layer for the data a generated interface needs [5].

::card A2A
### Agent ↔ Agent
Agent-to-Agent，由 Google 提出。定义分布式系统中 Agent 如何协调与分工，使复杂任务可由多个 Agent 协作完成后再交付界面[5]。 || Agent-to-Agent, originated by Google. It defines how agents coordinate and divide work in distributed systems, so complex tasks can be completed by multiple agents before an interface is delivered [5].

::card AG-UI
### Agent ↔ 用户交互 || Agent ↔ User Interaction
开放、轻量、事件型协议，标准化 Agent 状态、UI 意图与用户交互在前后端之间的流动，让 Agent 后端接到任意用户界面[5]。 || An open, lightweight, event-based protocol that standardizes how agent state, UI intent, and user interaction flow between front and back ends, connecting an agent backend to any user-facing interface [5].

::card A2UI
### 界面控件投递规范 || UI Widget Delivery Spec
生成式 UI 规范，定义 Agent 如何投递可渲染的 UI 控件。与 AG-UI 配合：AG-UI 管交互通道，A2UI 管界面内容本身，二者协同支撑跨平台动态界面[2][5]。 || A generative-UI specification defining how an agent delivers renderable UI widgets. It pairs with AG-UI: AG-UI owns the interaction channel, A2UI owns the interface content itself, and together they support cross-platform dynamic interfaces [2][5].
:::

## #challenges 07 / Real Constraints :: 现实约束：为什么运行时生成尚未默认开启 || Real Constraints: Why Runtime Generation Is Not the Default Yet

生成式 UI 落地的核心问题在于生成的界面是否可信。把界面交给模型即时产出，会触碰四类工程与产品约束，且越靠近运行时层越突出。 || The core challenge for generative UI is whether a generated interface can be trusted. Handing the interface to a model to produce on the fly hits four classes of engineering and product constraints, which become more acute closer to the runtime layer.

:::insight-grid { cols: 2 }
::card 约束 1
### 一致性与品牌约束 || Consistency and brand constraints
同一个 prompt 两次生成可能给出不同布局。企业需要界面符合设计系统与品牌规范，因此现实方案多采用「受约束生成」：模型只能从既有组件库中选择并组装，而非自由绘制。 || The same prompt can produce different layouts twice. Enterprises need interfaces that conform to design systems and brand rules, so practical solutions favor constrained generation: the model may only select and assemble from an existing component library rather than draw freely.

::card 约束 2
### 可控性与确定性 || Controllability and determinism
关键流程（支付、合同、医疗）不能容忍界面随机变化。这类场景要么停留在设计时生成（人审校后固定），要么对运行时生成施加严格的 schema 与结构化输出约束，把不确定性限制在可枚举范围内。 || Critical flows (payments, contracts, healthcare) cannot tolerate a randomly changing interface. Such scenarios either stay at design-time generation (fixed after human review) or impose strict schema and structured-output constraints on runtime generation, confining uncertainty to an enumerable range.

::card 约束 3
### 可访问性与合规 || Accessibility and compliance
即时生成的界面要满足无障碍标准、键盘可达、对屏幕阅读器友好，并通过合规审计。结构由模型动态决定时，这些保证更难给出，需要在生成后引入自动校验环节。 || An on-the-fly interface must meet accessibility standards, be keyboard-reachable, work with screen readers, and pass compliance audits. When the structure is decided dynamically by the model, these guarantees are harder to provide and call for automated post-generation validation.

::card 约束 4
### 性能、成本与信任 || Latency, cost, and trust
每次交互都调用模型生成界面会带来延迟与推理成本，并产生新的信任问题：用户如何形成对「界面为何长这样」的认知。多数产品因此采用缓存、模板兜底与渐进生成来平衡体验。 || Calling a model to generate the interface on every interaction adds latency and inference cost, and raises a new trust question: how users form a mental model of why the interface looks the way it does. Most products therefore use caching, template fallbacks, and progressive generation to balance the experience.
:::

## #future 08 / Outlook :: 未来趋势：界面会越来越晚被确定 || Outlook: Interfaces Will Be Fixed Later and Later

综合前文演进脉络，界面被确定的时刻正持续后移，模型生成的范围也持续扩大，具体体现在以下四个演进方向： || Across the developments above, the moment an interface is fixed keeps moving later and the model's generation scope keeps widening, reflected in four shifts:

:::flow
1. **从设计时到运行时 || From design time to runtime** — 界面确定的时刻从「发布前」后移到「请求处理时」。设计时工具不会消失，但越来越多界面会在用户提出请求的那一刻才被组装。 || The moment of fixing the interface moves from 'before release' to 'at request time'. Design-time tools will not disappear, but more interfaces will be assembled only when the user makes a request.
2. **从组件到完整界面 || From component to full interface** — 生成范围从单个组件扩展到整张界面。Gemini 3 Generative UI 与 A2UI 已在演示「按 prompt 生成完整体验」，这一范围会随模型可靠性提升而扩大[1]。 || The generation scope expands from a single component to a full interface. Gemini 3 Generative UI and A2UI already demonstrate 'a full experience per prompt', and this scope will widen as model reliability improves [1].
3. **个性化与自适应界面 || Personalized and adaptive interfaces** — 界面按用户、上下文与行为实时调整，而非对所有人呈现同一结构。个性化从「填不同数据」升级为「给不同结构」，这是运行时生成最直接的产品价值。 || Interfaces adapt in real time to the user, context, and behavior rather than showing one structure to everyone. Personalization upgrades from 'different data' to 'different structure', the most direct product value of runtime generation.
4. **受约束生成成为主流工程实践 || Constrained generation becomes the mainstream practice** — 为同时满足灵活性与可控性，主流做法会是「设计系统 + schema 约束 + 生成后校验」：模型在受限组件空间内自由组装，工程层保证一致性、可访问性与合规。 || To satisfy both flexibility and controllability, the mainstream approach will be 'design system + schema constraints + post-generation validation': the model assembles freely within a bounded component space while the engineering layer guarantees consistency, accessibility, and compliance.
:::

:::callout { title: "关键洞察 || Key Insight" }
总结而言，生成式 UI 落地的核心在于：如何在保证一致性、可控性与合规的前提下，把界面确定的时刻安全地推向运行时。 || In summary, practical adoption of generative UI comes down to safely pushing the moment an interface is fixed to runtime while preserving consistency, controllability, and compliance.
:::

## #references 09 / References :: 参考来源 || References

- [1] Google Research. — https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/ | Gemini 3 Generative UI 官方说明：2025-11-18 发布，Dynamic View 与 Visual Layout 两种体验，技术上结合内容/布局生成、agentic 编码、系统指令与后处理。支撑范式 C 与未来趋势第 2 点。 || Official write-up of Gemini 3 Generative UI: launched 2025-11-18, with Dynamic View and Visual Layout, combining content/layout generation, agentic coding, system instructions, and post-processing. Supports Paradigm C and Outlook step 2.
- [2] Google for Developers. — https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/ | A2UI 开源生成式 UI 规范：定义 Agent 如何投递可渲染 UI 控件，跨平台。支撑范式 C 与协议层 A2UI 卡片。 || A2UI open-source generative-UI spec: defines how an agent delivers renderable UI widgets across platforms. Supports Paradigm C and the A2UI protocol card.
- [3] Vercel. — https://sdk.vercel.ai/docs/ai-sdk-rsc/overview | streamUI / createStreamableUI 等函数，以及 AI State 与 UI State 分离的设计。支撑范式 B 的 Vercel AI SDK 卡片。文档标注 RSC 为实验性，生产推荐 AI SDK UI。 || streamUI / createStreamableUI functions and the AI State vs UI State design. Supports the Vercel AI SDK card in Paradigm B. The docs mark RSC as experimental and recommend AI SDK UI for production.
- [4] Anthropic. — https://www.anthropic.com/news/claude-3-5-sonnet | Claude Artifacts 首发说明：2024-06 推出，生成的代码/文档/网页出现在对话旁的专用窗口，可实时编辑迭代。支撑范式 B 的 Artifacts 卡片。 || Launch note for Claude Artifacts: introduced 2024-06, with generated code/documents/web pages appearing in a dedicated window beside the conversation for live editing. Supports the Artifacts card in Paradigm B.
- [5] AG-UI. — https://docs.ag-ui.com/introduction | AG-UI 为开放事件型 Agent↔用户协议；文档给出 MCP（Agent↔工具）、A2A（Agent↔Agent）、AG-UI（Agent↔用户）三层划分，并区分 AG-UI 与 A2UI。支撑协议层全部四张卡片。 || AG-UI is an open, event-based agent-to-user protocol; the docs lay out the three-layer split of MCP (agent-to-tools), A2A (agent-to-agent), AG-UI (agent-to-user), and distinguish AG-UI from A2UI. Supports all four protocol cards.
- [6] CopilotKit. — https://docs.copilotkit.ai/ | 兼容 AG-UI 的前端栈，提供聊天、生成式 UI、共享状态与 human-in-the-loop。支撑范式 C 的 AG-UI + CopilotKit 卡片。 || An AG-UI-compatible front-end stack providing chat, generative UI, shared state, and human-in-the-loop. Supports the AG-UI + CopilotKit card in Paradigm C.
- [7] Thesys. — https://www.thesys.dev/ | C1 把生成式 UI 作为 API：输入数据/意图，返回仪表盘、表单、图表、报告等可渲染界面。支撑范式 B 的 Thesys C1 卡片与对比矩阵。 || C1 offers generative UI as an API: input data/intent and get back renderable dashboards, forms, charts, and reports. Supports the Thesys C1 card in Paradigm B and the comparison matrix.
- [8] Menlo Ventures. — https://menlovc.com/2025-the-state-of-generative-ai-in-the-enterprise/ | 企业生成式 AI 工具支出 2025 年约 370 亿美元、应用层占比过半的来源。属机构测算，用于第 2 节市场动能的数量级参照，非实际收入。 || Source for ~USD 37 billion enterprise generative-AI tool spend in 2025 with the application layer over half. An analyst estimate used in Section 2 as an order-of-magnitude reference, not booked revenue.
- [9] MarketResearch.biz. — https://marketresearch.biz/report/generative-ai-in-ui-design-market/ | UI 设计生成式 AI 细分市场从 2023 年 1.38 亿美元增至 2033 年约 17 亿美元、CAGR 约 29.4% 的预测来源。机构预测，用于第 2 节趋势佐证。 || Source for the projection that the generative-AI-for-UI-design segment grows from USD 138 million (2023) to about USD 1.7 billion (2033) at ~29.4% CAGR. An analyst forecast used as trend evidence in Section 2.
- [10] Vercel; StackBlitz; Lovable. — https://v0.app/ | 设计时生成层产品的官方主页：v0 的 prompt-build-publish 与 GitHub/Vercel 集成、bolt.new 的 WebContainer 与设计系统导入、Lovable 的模板与项目规模。支撑范式 A 卡片与对比矩阵。 || Official homepages for the design-time generation products: v0's prompt-build-publish with GitHub/Vercel integration, bolt.new's WebContainer and design-system import, and Lovable's templates and project scale. Supports the Paradigm A cards and comparison matrix.

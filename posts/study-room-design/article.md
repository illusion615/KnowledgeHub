---
title: Knowledge Hub：交互式知识图谱的架构与实现
eyebrow: Design Document
brand: Knowledge Hub
date: 2026-04-11
strict_i18n: false
strict_density: true
lead: Knowledge Hub 是一个纯静态知识管理站点，以全屏交互式知识图谱为导航中枢，以结构化渐进披露文章为内容载体。按 2026-04-20 最近一次提交快照，项目已经演进到 Galaxy、Cards、Infographic、Cell 四种首页布局，并补齐统一搜索、主题/语言/纹理偏好持久化、文章演示模式、自动讲解、屏幕录制、邮件分享与跨端触控交互。
hero_actions:
  - "查看架构设计 | #architecture"
  - "查看项目指标 | #metrics"
panel_label: 核心价值
panel_title: 知识的全生命周期重新定义
panel_desc: Knowledge Hub 探索一种新的知识工作模式：从碎片化的学习笔记，到结构化的交互式产品页，再到可演示、可导出、可对话、可跨端探索的知识资产——让每一次学习都产出可复用的价值。
panel:
  - 创建：AI 辅助将研究资料整理为结构化 HTML 主源
  - 组织：knowledgeTree 邻接表统一管理 96 个知识节点
  - 探索：四种首页布局 + 统一搜索 + 统一悬浮信息卡
  - 交互：桌面与 iPad 浏览器均支持缩放、平移、滑动
  - 输出：演示、自动讲解、录屏、邮件分享与 GitHub Pages 发布共用同一份内容
metrics:
  - "知识节点 || Knowledge Nodes | 96 | 26 个主题节点 + 70 个文章节点（按 knowledgeTree 快照统计） || 26 topic nodes + 70 article nodes from the current knowledgeTree snapshot"
  - "跟踪源码行数 || Tracked Source Lines | 77,982 | 统计 git 跟踪的 HTML / CSS / JS，排除 html2canvas.min.js 与 pptxgen.bundle.js || Measured on git-tracked HTML/CSS/JS, excluding html2canvas.min.js and pptxgen.bundle.js"
  - "可视化模式 || Visualization Modes | 4 | Galaxy 星系 / Cards 卡片 / Infographic 信息图 / Cell 细胞 || Galaxy / Cards / Infographic / Cell"
  - "输出能力 || Output Capabilities | 4 类 | 演示 / 自动讲解 / 屏幕录制 / 邮件分享 || Presentation / Narration / Screen Recording / Email Share"
style:
  accent: "#0fb5ae"
---

## #dilemma 01 / The Knowledge Dilemma :: 知识管理的普遍困境 || The Knowledge Management Dilemma

我们正处于一个信息过载与知识稀缺并存的时代。获取信息的成本趋近于零，但将信息转化为可理解、可传递、可复用的知识，依然是一项高成本活动。 || We live in an era of simultaneous information overload and knowledge scarcity. Access to information is nearly free, yet transforming it into understandable, transferable, reusable knowledge remains expensive.

:::insight-grid { cols: 2 }
::card 01
### 认知负荷过重 || Cognitive Overload
Sweller 的认知负荷理论（1988）指出，人类工作记忆容量有限——Miller（1956）将其量化为 7±2 个信息块。一篇技术论文包含的概念远超这个阈值，大量信息被遗忘而非被理解。传统的线性阅读模式迫使读者承受全部认知负荷，无法按需分配注意力。 || Sweller's Cognitive Load Theory (1988) shows human working memory is limited — Miller (1956) quantified it at 7±2 chunks. A technical paper contains concepts far exceeding this threshold. Linear reading forces readers to bear full cognitive load without allocating attention on demand.

::card 02
### 知识碎片化 || Knowledge Fragmentation
对一个技术主题的完整理解往往散落在论文、官方文档、GitHub 仓库、技术博客、基准测试报告等多个来源中。Vannevar Bush 早在 1945 年的论文《As We May Think》中就预见了这一困境，并提出了通过关联路径（associative trails）连接知识的 Memex 构想。80 年后的今天，我们仍在多个浏览器标签之间反复跳转。 || Complete understanding of a technical topic is scattered across papers, docs, GitHub repos, blogs, and benchmarks. Vannevar Bush foresaw this in his 1945 essay 'As We May Think', proposing the Memex concept of associative trails. 80 years later, we still jump between browser tabs.

::card 03
### 隐性知识难以外化 || Tacit Knowledge Externalization
Nonaka 与 Takeuchi（1995）在《创造知识的企业》中提出了 SECI 模型，指出知识管理的关键挑战在于将个人的隐性知识（tacit knowledge）转化为可共享的显性知识（explicit knowledge）。传统的笔记工具擅长记录，但不擅长将碎片化的理解重组为结构化的、他人可消费的知识产品。 || Nonaka & Takeuchi (1995) in 'The Knowledge-Creating Company' proposed the SECI model, identifying the key challenge: converting personal tacit knowledge into shareable explicit knowledge. Traditional note-taking tools excel at recording but not at restructuring fragmented understanding into consumable knowledge products.

::card 04
### 消费与输出割裂 || Consumption-Output Gap
Shneiderman（1996）提出“先总览，再缩放过滤，最后按需查看细节”的信息可视化准则，至今仍是设计黄金法则。然而多数知识工具只解决了“记录”这一环——要分享需另做 PPT，要发布需另建博客，同一份知识被反复搬运和重新格式化。 || Shneiderman's (1996) mantra — 'Overview first, zoom and filter, then details-on-demand' — remains the golden rule. Yet most tools only solve recording: sharing needs separate slides, publishing needs a separate blog. The same knowledge gets repeatedly reformatted.
:::

## #goals 02 / Design Goals :: 设计目标 || Design Goals

论文、技术文档、多源调研报告——这些稠密知识的消化成本极高。Knowledge Hub 的核心目标是降低复杂知识的理解门槛：将需要数小时阅读的材料转化为可在数分钟内把握要点的交互式知识产品。 || Papers, technical docs, multi-source research — these dense knowledge sources are costly to digest. Knowledge Hub's core goal is to lower the barrier to understanding complex knowledge: transforming hours of reading into interactive knowledge products that convey key points in minutes.

:::insight-grid { cols: 3 }
::card 01
### 降低稠密知识的消化难度 || Reduce Cognitive Cost of Dense Knowledge
一篇论文往往需要反复精读数小时才能抓住核心。Knowledge Hub 通过 Hero 指标总览、编号章节、折叠深潜区的三层渐进披露结构，让读者在 3 秒内判断价值、3 分钟内掌握框架、按需深入细节——将稠密知识的消化路径从'通读全文'变为'按需探索'。 || A paper often requires hours of careful reading. Knowledge Hub uses a three-layer progressive disclosure structure — Hero metrics overview, numbered sections, accordion deep-dives — letting readers judge value in 3 seconds, grasp the framework in 3 minutes, and dive into details on demand.

::card 02
### 多源知识的结构化整合 || Structured Integration of Multi-Source Knowledge
一个技术主题的完整理解往往散落在论文、官方文档、GitHub 仓库、基准测试等多个来源中。Knowledge Hub 将这些碎片整合进一个统一的交互式页面，用洞察卡片、对比网格、流程图等设计模式组织信息，让读者无需在十个浏览器标签之间跳转。 || Full understanding of a technical topic is often scattered across papers, official docs, GitHub repos, and benchmarks. Knowledge Hub integrates these fragments into a unified interactive page using insight cards, comparison grids, and flow diagrams — no more jumping between ten browser tabs.

::card 03
### 贯通研究到发布的全链路工作流 || Connect the Full Research-to-Publish Pipeline
Knowledge Hub 的价值远超页面展示，核心在于把同一份研究成果串联成一条连续流水线：研究目标进入后，最终产出可以同时成为结构化文章、首页知识图谱节点、演示稿和可发布页面。研究、写作、注册、导出和发布告别五套割裂工具，围绕一份 HTML 主源协同运行。 || Knowledge Hub's value goes beyond display quality to end-to-end continuity: once a research goal enters the system, the output can become a structured article, a homepage graph node, a slide deck, and a publishable page from the same source. Research, writing, registration, export, and publishing stop being five disconnected toolchains.

::card 04
### 单源多输出带来的效率增益 || Productivity Gains from Single-Source Output
Knowledge Hub 把“研究成果整理成网页文章”“为分享重做 PPT”“同步首页目录与元数据”三段工作收束到一个源文件和一个注册点。只要研究材料足够完整，后处理阶段的工作就从多处重复排版变成一次结构化整理 + 自动复用，让效率提升扎根于流程复用而非单次突击。 || Knowledge Hub collapses three separate activities — formatting a web article, rebuilding slides for sharing, and syncing homepage metadata — into one source file and one registration point. With complete research material, the post-research stage shifts from repeated formatting to one structured transformation plus automated reuse.

::card 05
### 知识关系的可视化导航 || Visual Navigation of Knowledge Relationships
用交互式知识图谱取代传统目录列表，让知识点之间的层级关系、主题归属和跨域关联直观可见。读者一眼看到整个知识版图的全貌，发现意想不到的知识连接，沿着关联线自然延伸学习路径。 || Replace traditional directory listings with an interactive knowledge graph, making hierarchical relationships, topic memberships, and cross-domain connections visually intuitive. Readers see the full knowledge landscape and discover unexpected connections.

::card 06
### 长期可维护 || Long-Term Maintainability
单数据源架构（knowledge-data.js）使知识树的增删改只需编辑一个文件；共享样式与通用交互抽到 article.css、article-common.js、article-presentation.js，录屏、邮件分享和讲解设置再拆成懒加载模块。复杂能力增长，但页面主源仍保持轻量。 || The single-source model in knowledge-data.js centralizes graph edits, while shared behavior lives in article.css, article-common.js, and article-presentation.js. Recording, email share, and narration settings are further split into lazy-loaded modules so capabilities grow without bloating the article source.

::card 07
### 零构建部署 || Zero-Build Deployment
不依赖任何构建工具、框架或包管理器。编辑 HTML 文件后直接 git push 即可上线。技术的简单服务于项目的轻量化——消除一切与知识创建无关的工程摩擦。 || No build tools, frameworks, or package managers. Edit HTML and git push to deploy. Technical simplicity serves project lightness — eliminating all engineering friction unrelated to knowledge creation.
:::

## #lifecycle 03 / Knowledge Lifecycle :: 知识流转全生命周期 || Knowledge Lifecycle

从一个研究目标到一篇可分享、可定位、可导出的知识文章，Knowledge Hub 把流程拆解为六个阶段。核心设计是将审查与注册设为独立门禁，避免与写作过程混杂——研究成果必须通过显式检验才能进入知识树，成为可追踪的资产。 || From a research goal to a shareable, searchable, exportable knowledge article, Knowledge Hub breaks the workflow into six stages. The core design keeps review and registration as independent gates separate from drafting — research output must pass explicit checks before entering the knowledge tree as a traceable asset.

:::flow
1. **目标定义 — 明确研究问题、受众与输出 || Target Framing — Define the question, audience, and deliverable** — 输入是一个主题，但第一步不直接写文章，而是先把问题边界说清：要回答什么决策问题、面向谁、最终输出是选型文章、设计文档还是周期性雷达。只有问题边界明确，后续信息收集才不会失焦。 || The input is a topic, but the first step is not drafting. The system first defines the decision question, audience, and deliverable type — selection guide, design document, or periodic radar. Without this framing, information collection drifts.
2. **证据采集 — 收集来源锚点与测量条件 || Evidence Collection — Gather source anchors and measurement conditions** — 工具：浏览器 + AI 对话 + 文档阅读。围绕已定义的问题收集论文、官方文档、模型卡、基准测试和项目源码，并同步记录量化声明的测量条件。这里的目标不是“收更多链接”，而是形成一组足以支撑文章结构的证据锚点。 || Tools: Browser + AI chat + documentation reading. Around the framed question, gather papers, official docs, model cards, benchmarks, and source code while recording measurement conditions for quantitative claims. The goal is not more links, but a sufficient evidence set to support the article structure.
3. **结构化撰写 — 把证据转成单源 HTML 成品 || Structured Drafting — Convert evidence into a single-source HTML artifact** — 工具：VS Code + GitHub Copilot + article.css 组件库。此阶段把证据锚点转成 Hero 指标、章节主线、折叠深潜区、对比卡片和参考文献。核心原则是“一次结构化，后续多处复用”：文章不是笔记草稿，而是后续首页、分享和导出的唯一主源。 || Tools: VS Code + GitHub Copilot + the article.css component system. This stage turns evidence anchors into hero metrics, numbered sections, accordion deep-dives, comparison cards, and references. The core principle is structure once, reuse everywhere: the article is the primary source for all downstream outputs.
4. **内容审查 — 事实、逻辑、术语三条线并行审核 || Content Review — Fact, logic, and terminology audit** — 文章注册前必须通过四项检查：数字前后是否一致、量化声明是否附带测量条件、术语是否先定义后使用、章节因果链是否完整闭合。审查独立于撰写环节运行，充当注册前的硬门禁——通不过审查的文章不允许写入 knowledge-data.js。 || Before registration, articles must pass four checks: numerical consistency, measurement conditions on quantitative claims, term definitions before use, and complete causal chains across sections. Review runs independently of the drafting phase as a hard gate -- articles that fail review cannot be registered in knowledge-data.js.
5. **注册编目 — 让文章并入知识树、告别孤页状态 || Registration — Turn the page into a graph asset, never an orphan page** — 工具：knowledge-data.js。只有在文章标题、摘要、标签、父主题和关联线全部确定后，才向 knowledgeTree 写入注册条目。注册动作是原子性的——一次编辑让首页四种布局、全局搜索、标签筛选和关联线一起生效。未注册的页面即“孤页”，它对首页不可见、对搜索不可达、对关联不可用。 || Tools: knowledge-data.js. Registration is allowed only after the article title, summary, tags, parent topic, and relation lines are all finalized. The registration is atomic -- one edit activates all four homepage layouts, global search, tag filtering, and relation lines simultaneously. An unregistered page is an orphan: invisible to the homepage, unreachable by search, and unavailable for relational links.
6. **发布复用 — 用同一份 HTML 支撑分享、演示与上线 || Publish & Reuse — Deliver sharing, slides, and launch from the same HTML source** — 工具：article-presentation.js 及其按需懒加载的讲解、录屏、邮件分享模块 + GitHub Pages。现在一篇文章既可作为深度阅读页，也能切换为演示模式、生成自动讲解、录制讲解视频、导出 PPTX，或打开邮件分享预览。这里的价值不只是“发布更快”，而是把阅读、演示、分享和上线继续收束到同一份 HTML 主源。 || Tools: article-presentation.js with lazy-loaded narration, recording, and email-share modules, plus GitHub Pages. One article now supports deep reading, presentation mode, auto narration, narrated video recording, PPTX export, and email preview from the same HTML source.
:::

:::comparison
::versus 方案 1 || Option 1
### 已自动化的环节 || Automated Stages
六个阶段中，阶段 3–6 已由工具链直接支撑：article.css 组件库驱动结构化撰写、4.3 审核策略驱动内容审查、knowledge-data.js 的单数据源驱动注册编目、article-presentation.js + GitHub Pages 驱动发布复用。这些环节的执行不依赖人的记忆，直接内嵌在工具行为中。 || Among the six stages, steps 3–6 are directly supported by the toolchain: article.css drives structured drafting, review strategies (4.3) drive content review, the knowledge-data.js single source drives registration, and article-presentation.js + GitHub Pages drive publish-and-reuse. These stages execute through tooling behavior, not human memory.

::versus 方案 2 || Option 2
### 需要人工判断的环节 || Human-Dependent Stages
第 1–2 步——目标定义与证据采集——仍然主要依赖人工判断：选什么问题、面向谁、收集哪些证据锚点。这两个阶段的质量直接决定后续四步的输出上限。项目通过 Copilot 指令编码了证据采集的最低要求（测量条件、来源锚点），但研究方向本身的取舍是人工决策。 || Steps 1–2 — target framing and evidence collection — remain primarily human-dependent: choosing the question, the audience, and which evidence anchors to gather. Their quality sets the ceiling for the four downstream stages. The project Copilot instructions encode minimum requirements for evidence (measurement conditions, source anchors), but research direction itself is a human decision.
:::

## #quality 04 / Quality Assurance :: 知识生产的质量保障 || Knowledge Production Quality Assurance

将日常知识学习转化为可重复的高质量输出，需要在研究、撰写和审核三个环节建立标准化的策略。这些策略确保每篇知识文章不是一次性产物，而是经过系统化流程验证的知识资产。 || Turning daily knowledge learning into repeatable high-quality output requires standardized strategies across research, writing, and review. These ensure each article is a systematically validated knowledge asset, not a one-off artifact.

:::accordion
::panel { open: true }
### 4.1 研究策略 || Research Strategy
- **多源交叉验证 || Multi-Source Cross-Validation** — 每个核心事实至少从两个独立来源确认：官方文档 + 论文原文、基准测试数据 + 实际复现。避免二手转述导致的信息失真。AI 辅助扩展搜索范围，但最终事实锚点必须可溯源。 || Every core fact is confirmed from at least two independent sources: official docs + original papers, benchmark data + actual reproduction. Avoids information distortion from secondary accounts.
- **先框架后细节 || Framework Before Details** — 研究阶段先用 AI 对话梳理主题的宏观结构和关键维度，形成信息架构骨架。再沿着骨架逐项深入，填充数据和论据。这个顺序确保不会在细节中迷失方向，也为后续文章的章节编排奠定基础。 || Research starts with AI-assisted macro structure and key dimension mapping, forming an information architecture skeleton. Then drill down along the skeleton to fill data and evidence. This sequence prevents getting lost in details.
- **量化优先 || Quantification First** — 优先收集可量化的数据点：模型参数量、基准测试分数、延迟数字、内存占用、成本估算。每个量化声明必须附带测量条件（硬件、配置、步骤）。无法量化的差异用'无数据'显式标注，而非用模糊措辞掩盖。 || Prioritize quantifiable data: model parameters, benchmark scores, latency, memory, cost estimates. Every quantitative claim must include measurement conditions. Non-quantifiable gaps are explicitly marked, never masked with vague language.
:::

:::accordion
::panel
### 4.2 撰写策略 || Writing Strategy
- **AI 生成 + 人工架构 || AI Generation + Human Architecture** — 代码层面由 GitHub Copilot 全程辅助生成 HTML/CSS/JS，人工把控的是信息架构：哪些内容放 Hero 指标、哪些归入编号章节、哪些沉入折叠深潜区。AI 负责执行，人工负责决策——每篇文章的结构设计和内容分层是核心人工工作。 || Code is fully AI-assisted (GitHub Copilot generates HTML/CSS/JS). Human focus is information architecture: what goes in Hero metrics, numbered sections, or accordion deep-dives. AI executes, humans decide — structure design and content layering are the core human work.
- **3 秒 / 3 分钟 / 30 分钟法则 || 3s / 3min / 30min Rule** — 每篇文章必须服务三种阅读深度：3 秒看 Hero 指标判断价值、3 分钟扫完编号章节掌握框架、30 分钟展开折叠区深入所有细节。这个分层标准决定了每一段内容应该放在哪个层级。 || Each article must serve three reading depths: 3 seconds on Hero metrics to judge value, 3 minutes scanning numbered sections for the framework, 30 minutes expanding accordions for full detail. This layering standard determines where each piece of content belongs.
- **组件化写作 || Component-Based Writing** — 内容通过标准化的设计组件表达：洞察卡片承载关键观点、对比网格呈现方案差异、流程列表展示步骤、比较表格量化对比。组件选择不是装饰性的，而是语义化的——每种组件对应一种特定的信息传递模式。 || Content is expressed through standardized design components: insight cards for key viewpoints, comparison grids for solution differences, flow lists for steps, tables for quantitative comparisons. Component choice is semantic, not decorative — each maps to a specific information delivery pattern.
:::

:::accordion
::panel
### 4.3 审核策略 || Review Strategy
- **事实校验审核 || Fact-Check Review** — 每篇文章发布前执行事实锚点核验：检查量化数据是否附带测量条件、引用来源是否可追溯、前后数字是否一致（如 Hero 指标与正文数据）。禁止空泛修辞（如夸大或绝对化形容词），必须换成具体数字或比率。 || Pre-publication fact-anchor review: check if quantitative data includes measurement conditions, if sources are traceable, if numbers are consistent (e.g., Hero metrics vs body text). Empty superlatives and vague claims must be replaced with specific numbers or ratios.
- **信息架构审核 || Information Architecture Review** — 审核每篇文章的分层是否合理：Hero 是否只有 3-4 个最关键指标？每个章节是否有明确的单一主题？折叠区是否只包含需要深入的补充细节而非核心论点？遵循 Miller 7±2 法则，每层信息块数控制在人类工作记忆容量之内。 || Review article layering: Does Hero contain only 3-4 key metrics? Does each section have a clear single topic? Do accordions contain only supplementary detail, not core arguments? Follow Miller's 7±2 rule to keep information chunks within working memory capacity.
- **跨模型交叉审核 || Cross-Model Review** — 初稿定型后交由不同 AI 模型独立审阅，排查逻辑一致性、缺失前提、未定义术语和因果链断裂。不同模型的审核盲区不同，交叉审核能捕获单一模型可能忽视的问题。最终由人工判断哪些审核意见值得采纳。 || After drafting, submit to different AI models for independent review checking logic consistency, missing premises, undefined terms, and causal chain breaks. Different models have different blind spots — cross-review catches issues a single model might miss. Humans decide which feedback to adopt.
:::

:::accordion
::panel
### 4.4 执行门禁 || Execution Gates
- **先定稿页面，再注册知识树 || Page Before Registration** — 项目级指令约定：文章页必须已存在、标题/摘要/标签/父主题必须已定稿，才允许写入 knowledge-data.js。这条规则同时防止两种漂移——首页出现“空壳卡片”（页面未定稿），或文章沦为“孤页”（页面写好但首页找不到）。 || Project-level instructions stipulate: the article page must exist and its title, summary, tags, and parent topic must be finalized before writing to knowledge-data.js. This rule prevents two kinds of drift simultaneously -- hollow homepage cards (unfinished pages) and orphan articles (finished pages invisible to the graph).
- **量化声明必须带条件 || Quantitative Claims Need Conditions** — 量化声明必须同步记录硬件、配置、步骤和统计口径。裸数字——即不附带条件的数字——不允许出现在 Hero 或正文中。若数据缺失，正文必须显式标注缺口位置，绝不用“约”“接近”或程度副词模糊带过。 || Quantitative claims must carry hardware, configuration, steps, and counting method. Bare numbers -- those without conditions -- are not allowed in Hero or body text. If data is missing, the text must explicitly mark the gap rather than masking it with words like roughly, close to, or vague qualifiers.
- **发布时同步正文与元数据 || Sync Body and Metadata at Publish Time** — 文章正文、knowledge-data.js 摘要、首页分组和项目指标必须在同一次提交中保持一致。任何涉及文章内容变更的修改，都不允许只改一侧——正文数字更新了，摘要和指标必须同步跟进，反之亦然。 || Article body, knowledge-data.js summaries, homepage grouping, and project metrics must stay consistent within the same commit. No content change is allowed to update only one side -- if body numbers change, summaries and metrics must follow, and vice versa.
:::

## #philosophy 05 / Design Philosophy :: 设计理念 || Design Philosophy

Knowledge Hub 的设计理念可归结为五条原则，它们贯穿从首页知识图谱到文章演示、讲解与分享模块的所有设计决策。 || Knowledge Hub's design philosophy distills into five principles spanning the homepage graph as well as the presentation, narration, and sharing modules of each article.

:::insight-grid { cols: 3 }
::card 01
### 内容即产品 || Content Is the Product
每篇文章是一个独立的交互式产品页，不是博客帖子。Hero 区域的关键指标、卡片网格、对比矩阵、折叠深潜区——这些设计模式让知识像产品一样被结构化呈现和消费。 || Each article is a standalone interactive product page, not a blog post. Hero key metrics, card grids, comparison matrices, accordion deep-dives — these patterns structure knowledge as a consumable product.

::card 02
### 约束驱动创新 || Constraint-Driven Innovation
刻意排除框架和构建工具，迫使所有交互效果必须在原生 Web 标准内实现。这个约束催生了纯 CSS 变量驱动的暗色模式、IntersectionObserver 滚动动画、HTML data 属性驱动的双语切换等方案。 || Deliberately excluding frameworks forces all interactivity within native web standards. This constraint produces CSS-variable-driven dark mode, IntersectionObserver scroll animations, and HTML data-attribute-driven bilingual switching.

::card 03
### 单数据源真相 || Single Source of Truth
知识图谱的所有节点、层级和关联关系集中在 knowledge-data.js 的一个扁平数组中（邻接表结构）。首页四种视图模式、卡片过滤、标签云都从这一个数据源自动派生，消除数据不一致的可能。 || All knowledge graph nodes, hierarchy, and relations live in a single flat array in knowledge-data.js (adjacency list). All four homepage view modes, card filtering, and tag clouds auto-derive from this single source, eliminating data inconsistency.

::card 04
### 多维度探索 || Multi-Dimensional Exploration
同一份知识数据通过四种空间隐喻来呈现：Galaxy 用轨道系统表达主题引力，Cards 用分组卡片表达快速扫描，Infographic 用弧线轮盘表达层级深度，Cell 用有机包裹表达主题容器与内容密度。用户按认知任务自主切换视图，免受单一导航方式束缚。 || The same data is presented through four spatial metaphors: Galaxy for thematic gravity, Cards for rapid scanning, Infographic for hierarchical depth, and Cell for organic containers and density. Users choose views based on cognitive task rather than being locked into one navigation pattern.

::card 05
### 偏好即状态 || Preferences as State
主题、语言、布局、文章打开方式、背景纹理都通过 localStorage 持久化，跨页面保持一致。文章页自动继承首页设置，首页则把偏好解释为完整的探索状态，而不只是视觉开关。无需注册、无需后端、无需数据库——浏览器就是状态存储。 || Theme, language, layout, article open mode, and background texture all persist via localStorage across pages. Articles inherit homepage preferences automatically, and the homepage treats preferences as full exploration state rather than mere visual toggles. The browser itself is the state store.
:::

## #approach 06 / Design Approach :: 设计思路 || Design Approach

从知识结构建模到前端渲染，Knowledge Hub 的设计围绕三个核心思路展开。 || From knowledge structure modeling to frontend rendering, Knowledge Hub's design revolves around three core approaches.

:::accordion
::panel { open: true }
### 6.1 扁平化的知识结构管理 || Flat Knowledge Structure Management
知识结构采用扁平数组 + parentId 引用的邻接表模式（knowledgeTree[]）。每个节点只需声明自己的 id 和 parentId，树的深度不受限制。这种设计比嵌套 JSON 更易于增删节点——任何结构调整只需修改一个 parentId 值。 || The knowledge structure uses a flat array with parentId references (adjacency list) in knowledgeTree[]. Each node declares only its id and parentId, with unlimited tree depth. This design makes adding/removing nodes easier than nested JSON — any structural change requires modifying just one parentId.

首页通过一组树工具函数（getChildren / getDepth / getRoots / getAllArticles）从扁平数组实时计算出三套渲染所需的派生数据：planets（根节点）、groups（子分组）、posts（文章）。数据永远从单源推导，不存在手动同步。 || The homepage uses tree utility functions (getChildren / getDepth / getRoots / getAllArticles) to compute three derived datasets in real-time from the flat array: planets (roots), groups (sub-topics), posts (articles). Data always derives from the single source, eliminating manual sync.
:::

:::accordion
::panel
### 6.2 知识主题的四种组织形式 || Four Organizational Forms for Knowledge Topics
Galaxy

**星轨模式 || Orbital Mode**

根节点渲染为大型行星，所有子主题按无限深度的父子轨道递归展开。主题尺寸和运动速度由后代文章数驱动：内容越多，节点越大、轨道越慢。支持桌面滚轮缩放、拖拽平移，以及 iPad 上的单指拖拽与双指捏合。 || Root nodes become large planets, and all subtopics expand recursively through parent-child orbits with unlimited depth. Topic size and orbital speed are driven by descendant article counts. Supports desktop zoom/pan and iPad drag/pinch gestures.

Cards

**卡片模式 || Grid Mode**

将知识节点按主题递归分组，渲染为响应式网格卡片。文章按日期从旧到新排序，整张卡片可点击打开。适合快速浏览全量内容、按搜索结果扫描匹配条目，或从某一主题直接下钻到文章。 || Knowledge nodes are recursively grouped into responsive cards. Articles are sorted from oldest to newest, and the whole card is clickable. Ideal for scanning the full corpus, browsing search results, or drilling down from a topic directly to an article.

Infographic

**弧线轮盘模式 || Arc Hierarchy Mode**

以同心弧线展开层级结构，topic 和 article 都直接渲染在轮幅上。文章轮幅包含日期、标题、标签和摘要，减少额外弹窗依赖。桌面端支持滚轮和键盘，iPad 端支持上下滑动切换条目、左右滑动进退层级。 || Concentric arcs reveal hierarchy, with both topics and articles rendered directly on wedges. Article wedges include date, title, tags, and summary. Desktop uses wheel and keyboard; iPad uses vertical swipes to browse items and horizontal swipes to move across levels.

Cell

**细胞模式 || Cell Mode**

以有机细胞团块表达主题边界：topic 逐层包裹 topic 与 article，article 以可点击节点停靠在主题容器内部。布局由轻量力导向模拟驱动，支持拖拽平移、双指捏合缩放，以及和 Galaxy 共用的统一摘要悬浮卡。 || Organic cell-like bubbles express topic boundaries: topics wrap subtopics and articles recursively, and article nodes live inside topic containers. A lightweight force simulation drives layout, with pan, pinch zoom, and a unified hover summary card shared with Galaxy.
:::

:::accordion
::panel
### 6.3 知识内容的渐进式披露 || Progressive Disclosure of Knowledge Content
每篇文章遵循统一的四层结构，由浅入深引导阅读： || Each article follows a unified four-layer structure, guiding reading from overview to depth:

- **Hero 总览层 || Hero Overview Layer** — 标题 + 一句话描述 + 3-4 个关键指标数字。让读者在 3 秒内判断这篇文章是否值得深入阅读。 || Title + one-line description + 3-4 key metric numbers. Lets readers decide in 3 seconds whether to read deeper.
- **编号章节层 || Numbered Section Layer** — 章节以 01 / Section Name 格式编号，配 section-kicker 标签。每章有导入段落和洞察卡片网格，覆盖该主题的核心观点。 || Sections numbered as '01 / Section Name' with section-kicker labels. Each has an intro paragraph and insight card grid covering core viewpoints.
- **折叠深潜层 || Accordion Deep-Dive Layer** — 通过 data-accordion 标记的折叠区域承载详细论述、对比表格、代码示例。默认折叠，只有感兴趣的读者点击展开。降低认知负荷。 || Accordion sections (data-accordion) hold detailed discussions, comparison tables, code examples. Collapsed by default, expanded only by interested readers. Reduces cognitive load.
- **滚动揭示动画 || Scroll-Reveal Animation** — 所有章节借助 IntersectionObserver 触发滚动入场淡入动画（data-reveal），配合 load-in 类的首屏错列延迟动画，营造流畅的阅读节奏。 || All sections use IntersectionObserver for fade-in animations on scroll (data-reveal), combined with staggered load-in delays for first-screen content.
:::

:::accordion
::panel
### 6.4 为什么不用 Notion / Obsidian / Hugo || Why Not Notion / Obsidian / Hugo
**Notion / Obsidian**

强大的个人知识库工具，但核心限制在分享端：Notion 发布的页面是平台锁定的渲染视图，无法自定义交互和视觉呈现；Obsidian Publish 受限于 Markdown 渲染能力，不支持知识图谱可视化、幻灯片模式或 PPTX 导出。两者都无法做到“一份内容同时服务阅读、演示和分享”。 || Powerful personal knowledge tools, but limited in sharing: Notion publishes platform-locked views without custom interactivity; Obsidian Publish is constrained by Markdown rendering. Neither supports knowledge graph visualization, slide mode, or PPTX export from the same content.

**Hugo / Next.js / VitePress**

静态站点生成器解决了部署问题，但引入了构建工具链的维护负担（node_modules、版本升级、构建配置）。更重要的是，它们的模板系统为通用博客设计，无法原生支持每篇文章独立的交互式布局（Hero 指标、折叠深潜、卡片网格）。Knowledge Hub 的每篇文章都是一个自包含的交互产品页——这在模板引擎中反而是约束。 || SSGs solve deployment but add build toolchain maintenance (node_modules, upgrades, configs). More importantly, their template systems target generic blogs, not per-article interactive layouts (Hero metrics, accordions, card grids). Each Knowledge Hub article is a self-contained interactive product page — a constraint in template engines.

Knowledge Hub 选择的路径是：用原生 HTML 获得对每篇文章的完全布局控制，用共享 CSS 组件库（article.css）保持一致性，用单数据源（knowledge-data.js）驱动全站导航——在零构建的前提下兼得灵活性和可维护性。 || Knowledge Hub's path: native HTML for full per-article layout control, shared CSS components (article.css) for consistency, single data source (knowledge-data.js) for site-wide navigation — achieving both flexibility and maintainability with zero build steps.
:::

## #architecture 07 / Architecture :: 设计架构 || Architecture

Knowledge Hub 的当前架构可分为四层：展示层、能力编排层、共享组件层和数据层。 || Knowledge Hub's current architecture can be read as four layers: Presentation, Orchestration, Shared Components, and Data.

展示层

### 知识图谱首页 + 交互式文章页 || Knowledge Graph Homepage + Interactive Article Pages

首页提供 Galaxy / Cards / Infographic / Cell 四种知识图谱视图，统一挂接搜索框、纹理选择、文章打开方式和悬浮信息卡。每篇文章是独立的交互式产品页，包含 Hero 指标区、编号章节、折叠深潜区和卡片网格，并自动继承主题、语言与阅读偏好。 || The homepage offers four graph views (Galaxy / Cards / Infographic / Cell) with one shared search box, texture picker, article-open behavior, and hover cards. Each article is a standalone interactive page with Hero metrics, numbered sections, accordion deep-dives, and synchronized theme/language preferences.

能力层

### 演示编排 · 自动讲解 · 录屏 · 分享导出 || Presentation Orchestration · Narration · Recording · Share/Export

article-presentation.js 负责步骤收集、Deck 导航、分享菜单与跨模式状态切换；并按需懒加载讲解设置、屏幕录制和邮件分享模块。当前能力覆盖自动讲解、字幕叠加、16:9 / 9:16 / 1:1 录制比例、PPTX 导出与 AI 问答接力。 || article-presentation.js orchestrates slide steps, deck navigation, share actions, and cross-mode state transitions, then lazy-loads narration UI, screen recording, and email-share modules on demand. The current stack supports auto narration, subtitles, 16:9 / 9:16 / 1:1 recording ratios, PPTX export, and AI chat handoff.

组件层

### 共享样式框架 + 基础初始化 + 轻量扩展 || Shared Style System + Base Initialization + Lightweight Extensions

article.css 提供 Hero、章节、折叠区、网格和暗色模式等共享样式；article-common.js 统一处理 reveal、导航高亮、accordion 状态和 localStorage 偏好同步；scrollbar.js、lightbox 与讲解 UI 为跨文章复用的轻量扩展，保证页面主源不被重复逻辑污染。 || article.css provides shared styles for Hero blocks, sections, accordions, grids, and dark mode. article-common.js centralizes reveal behavior, nav highlighting, accordion state, and localStorage sync. Scrollbars, lightbox, and narration UI stay as reusable lightweight extensions so article HTML remains clean.

数据层

### knowledge-data.js — 唯一数据源 || knowledge-data.js — Single Source of Truth

knowledgeTree[] 以扁平邻接表存储全部层级、元数据与 relations。首页通过树工具函数实时派生 planets、groups、posts 等运行态数据，因此节点数扩张到 96 个、布局扩张到 4 种之后，仍然保持单一数据真相。改变任何节点的 parentId 即可重组知识结构。 || knowledgeTree[] stores all hierarchy, metadata, and relations in a flat adjacency list. The homepage derives runtime structures such as planets, groups, and posts through tree utilities, so the system still keeps one source of truth even after expanding to 96 nodes and four layouts. Changing parentId alone reorganizes the structure.

## #features 08 / Feature Matrix :: 功能矩阵 || Feature Matrix

Knowledge Hub 的完整能力按首页交互、文章页增强与跨站全局三大功能域分组梳理。 || Complete feature list of Knowledge Hub, organized across three functional domains.

:::accordion
::panel { open: true }
### 8.1 首页交互功能 || Homepage Interaction
- **四视图知识图谱 || Four-View Knowledge Graph** — 同一份 knowledgeTree 数据同时驱动 Galaxy、Cards、Infographic、Cell 四种布局。用户可以在空间探索、快速扫描、层级轮盘和有机细胞容器之间切换，而无需切换数据模型。 || The same knowledgeTree data drives Galaxy, Cards, Infographic, and Cell layouts simultaneously. Users can switch between spatial exploration, rapid scanning, arc hierarchy, and organic bubble containers without changing the underlying data model.
- **统一搜索与过滤 || Unified Search & Filtering** — 头部搜索框跨四种视图复用：Galaxy 与 Cell 对不匹配节点做弱化处理，Cards 直接筛卡，Infographic 只保留匹配主题或命中后代文章的轮幅。标签云仍然保留，用于主题式过滤。 || A single header search box works across all four views: Galaxy and Cell dim non-matching nodes, Cards filter cards directly, and Infographic keeps only matching topics or descendant-article hits. The tag cloud remains as thematic filtering.
- **桌面与 iPad 手势 || Desktop & iPad Gestures** — Galaxy 与 Cell 支持滚轮缩放、拖拽平移，也支持 iPad 上的单指拖拽与双指捏合。Infographic 除了滚轮和键盘外，还支持上下滑动切换条目、左右滑动进退层级，补齐平板浏览器的可操作性。 || Galaxy and Cell support wheel zoom and drag pan on desktop, plus single-finger drag and two-finger pinch on iPad. Infographic adds vertical swipes for browsing items and horizontal swipes for moving across levels, making tablet browsing viable.
- **状态化设置面板 || Stateful Settings Panel** — 首页设置面板集中管理布局、背景纹理、文章打开方式、语言和主题。背景纹理提供 5 种选择，文章打开支持当前页与新页面两种模式；这些偏好通过 localStorage 跨页面继承。 || The homepage settings panel manages layout, background texture, article open mode, language, and theme. Five background textures and two article-open modes are available, and all preferences persist via localStorage across pages.
:::

:::accordion
::panel
### 8.2 文章页增强功能 || Article Page Features
- **演示/幻灯片模式 || Presentation Mode** — 按 P 或点击按钮进入全屏幻灯片模式。Hero + 各 section 自动成为步骤，含折叠深潜区的 section 会自动拆成概览页 + 子步骤，Deck 顶栏统一负责标题、页码与键盘导航。 || Press P or click the button to enter fullscreen slides. Hero plus each section becomes a step, and accordion-heavy sections auto-split into an overview slide plus detail steps with a shared deck bar for titles, counters, and keyboard navigation.
- **自动讲解与字幕 || Auto Narration & Subtitles** — 演示模式已接入自动讲解：LLM 可根据页面内容生成旁白脚本；未配置 LLM 或请求失败时，系统会提取当前页标题与正文直接讲解。字幕、语速、语言和音色设置按文章保存在 localStorage 中。 || Presentation mode supports automatic narration. An LLM can generate a slide-aware script; when no LLM is configured or the request fails, the system narrates a concise extraction of the current slide. Subtitle, speed, language, and voice settings persist per article in localStorage.
- **屏幕录制与画面比例 || Screen Recording & Aspect Ratios** — 系统支持 getDisplayMedia 屏幕录制，录制比例可切换 16:9、9:16 和 1:1，并可与讲解音频联动保存。 || The system supports getDisplayMedia-based recording with 16:9, 9:16, and 1:1 aspect ratios, optionally saved together with narration audio.
- **邮件分享与 PPTX 导出 || Email Share & PPTX Export** — 分享菜单已同时支持 PPTX 导出和邮件分享预览：邮件模式会展开折叠内容、移除交互控件并强制切换到易读亮色版本，减少二次整理成本。 || The share menu now supports both PPTX export and email-share preview. Email mode expands accordions, strips interactive controls, and forces a clean light theme so the page can be reused with minimal manual cleanup.
- **AI 问答助手 || AI Q&A Assistant** — 浮窗式 Q&A 小部件会自动提取当前文章全文作为上下文，调用外部 LLM API（支持 Ollama / OpenAI 兼容接口）回答问题，使文章具备按需追问能力。 || The floating Q&A widget extracts the current article as context and queries an external LLM API, including Ollama and OpenAI-compatible endpoints, enabling on-demand follow-up questions.
- **图片灯箱 || Image Lightbox** — 点击文章中的图片即可全屏查看，Esc 或点击背景关闭，自动隐藏页面滚动条，保证图表和设计稿在深度阅读时可独立放大审视。 || Clicking an image opens it in fullscreen lightbox view, with Esc or backdrop click to close and automatic scrollbar hiding for focused inspection of diagrams and visuals.
:::

:::accordion
::panel
### 8.3 跨站全局功能 || Site-Wide Features
- **暗色/亮色主题 || Dark / Light Theme** — CSS 自定义属性驱动的完整暗色模式。:root 定义亮色变量，[data-theme='dark'] 覆写。自动检测系统偏好，localStorage 跨页面持久化。 || Full dark mode driven by CSS custom properties. :root defines light variables, [data-theme='dark'] overrides. Auto-detects system preference, persisted via localStorage.
- **中英双语切换 || Chinese / English Toggle** — 所有文本元素通过 data-zh / data-en 属性支持双语。JS 扫描所有带标记的元素并替换 innerHTML，语言偏好跨页面保持一致。 || All text elements support bilingual via data-zh / data-en attributes. JS scans all marked elements and swaps innerHTML. Language preference persists across pages.
- **响应式布局 || Responsive Layout** — 640px 断点适配移动端和桌面端。Hero 网格、卡片网格、导航栏在窄屏下自动堆叠为单列布局；首页交互层则进一步在 iPad Safari 上支持触摸拖拽、捏合缩放和滑动导航。 || A 640px breakpoint adapts layouts across mobile and desktop. Hero grids, card grids, and nav collapse into single-column layouts on narrow screens, while the homepage interaction layer further adds touch drag, pinch zoom, and swipe navigation for iPad Safari.
:::

## #metrics 09 / Project Metrics :: 项目指标 || Project Metrics

截至 2026-04-20 最近一次提交快照，Knowledge Hub 已演进到 4 种首页布局、96 个知识节点和 77,982 行跟踪 HTML/CSS/JS 源码。这组面板指标直接反映当前仓库运行态，区别于早期原型快照。 || As of the latest commit snapshot on 2026-04-20, Knowledge Hub has evolved to four homepage layouts, 96 knowledge nodes, and 77,982 tracked lines of HTML/CSS/JS. These dashboard metrics reflect the repository's current operating state rather than an early prototype snapshot.

时间线 || Timeline

项目创建 · 首页知识图谱雏形 + 首批文章 || Project created · Early homepage graph + first article batch

四视图首页全面贯通 · 统一搜索 · 纹理设置 · iPad 手势 || Four-view homepage fully integrated · unified search · textures · iPad gestures

共享文章框架标准化 · 演示架构重构 · 审查体系落地 || Shared article framework standardized · presentation architecture refactored · review workflow established

自动讲解 · Focus Mode · 录屏比例 · 邮件分享懒加载 || Auto narration · focus mode · recording ratios · lazy-loaded email share

核心代码分布 || Core Code Distribution

首页（知识图谱） || Homepage (Knowledge Graph)

4,756

共享资源层（样式 + 脚本，不含数据层） || Shared Asset Layer (Styles + Scripts, excluding data layer)

14,847

67 个文章页（设计文档、研究报告与案例页面） || 67 article pages across design docs, research reports, and case pages

55,972

数据层（knowledge-data.js） || Data Layer (knowledge-data.js)

1,549

96

知识节点 || Knowledge Nodes

26 个主题节点 · 70 个文章节点 || 26 topic nodes · 70 article nodes

70

已注册文章 || Registered Articles

按 knowledgeTree 当前快照统计，覆盖 AI 研究、Microsoft AI 与项目实践等主线 || Counted from the current knowledgeTree snapshot across AI Research, Microsoft AI, and project practice tracks

11

活跃提交日 || Active Commit Days

2026-04-08 至 2026-04-20，git 记录覆盖 11 个日历日 || 11 calendar days with recorded git activity from 2026-04-08 to 2026-04-20

62

提交数 || Commits

统计窗口：首个提交 2026-04-08 22:03 到最新提交 2026-04-20 23:09 || Measured from the first commit at 2026-04-08 22:03 to the latest commit at 2026-04-20 23:09

:::comparison
::versus 方案 1 || Option 1
### 实际产出速率 || Observed Throughput
按 git 时间口径，从 2026-04-08 22:03 到 2026-04-20 23:09，项目跨越 289.1 个日历小时，形成 70 个已注册文章节点、96 个知识节点和 77,982 行跟踪源码。换算后，相当于每 24 小时日历时间新增约 5.81 个文章节点，或每个文章节点对应约 4.13 小时日历跨度。这个数字不是“人工专注工时”，而是整个项目从启动到当前状态的实际产出密度。 || Using git timestamps, the project spans 289.1 calendar hours from 2026-04-08 22:03 to 2026-04-20 23:09, producing 70 registered article nodes, 96 knowledge nodes, and 77,982 tracked source lines. That equals about 5.81 article nodes per 24 calendar hours, or roughly 4.13 calendar hours per article node. This is not focused human labor time; it describes the observed output density from kickoff to the current state.

::versus 方案 2 || Option 2
### 相对零散工作流的效率估算 || Estimated Productivity vs Fragmented Workflow
若只比较“研究收尾后的包装与发布环节”，Knowledge Hub 的效率增益是可以建模的。基线假设：零散工具链需要 45 分钟整理网页稿、75 分钟重排演示稿、15 分钟同步目录与元数据，总计约 135 分钟；Knowledge Hub 假设为 60 分钟构建单源 HTML 结构、5 分钟注册 knowledgeTree、5 分钟导出/发布，总计约 70 分钟。在这个口径下，后处理阶段效率约提升 1.9×。若外部工作流还需分别维护博客页与分享页两套样式，增益会进一步扩大。 || If we compare only the packaging and publishing stage after research is complete, Knowledge Hub's productivity gain can be modeled. Baseline assumption: a fragmented toolchain spends 45 minutes formatting the web article, 75 minutes rebuilding presentation slides, and 15 minutes syncing directory metadata, totaling about 135 minutes. Knowledge Hub assumes 60 minutes to structure the single-source HTML, 5 minutes to register it in `knowledgeTree`, and 5 minutes to export/publish, totaling about 70 minutes. Under that scope, post-research productivity improves by roughly 1.9×. The gain grows further if the external workflow has to maintain separate blog and sharing layouts.
:::

## #conventions 10 / Coding Conventions :: 编码约定 || Coding Conventions

Knowledge Hub 项目遵循的关键编码约定与禁止模式。 || Key coding conventions and forbidden patterns in the Knowledge Hub project.

:::accordion
::panel { open: true }
### 10.1 强制约定 || Mandatory Conventions
- **纯 Vanilla JS || Pure Vanilla JS** — 不使用 jQuery、React 或任何 JS 框架。所有脚本使用 ES5 兼容语法（避免箭头函数）。var 声明置于作用域顶部。 || No jQuery, React, or any JS framework. ES5-compatible syntax (no arrow functions). var declarations at scope top.
- **CSS 自定义属性主题 || CSS Custom Properties Theming** — :root 定义亮色变量，[data-theme='dark'] 覆写。所有颜色引用 var(--xxx)，单点切换即全站暗色。 || :root defines light variables, [data-theme='dark'] overrides. All colors reference var(--xxx) for single-switch dark mode.
- **DOMContentLoaded 包裹 || DOMContentLoaded Wrapper** — 所有页面脚本包裹在 DOMContentLoaded 事件中，确保 DOM 就绪后再执行。事件绑定使用 addEventListener，不使用内联处理器。 || All page scripts wrapped in DOMContentLoaded. Event binding via addEventListener, not inline handlers.
- **共享样式优先 || Shared Styles First** — 文章页先引用 assets/article.css，只在页内 || Articles link assets/article.css first, article-specific overrides only in inline style. Dark mode variants go in article.css.
:::

:::accordion
::panel
### 10.2 禁止模式 || Forbidden Patterns
- **禁止框架/打包器 || No Frameworks / Bundlers** — 不引入 node_modules、webpack、vite 或任何构建工具链。部署就是 git push。 || No node_modules, webpack, vite, or any build toolchain. Deployment is git push.
- **禁止箭头函数 || No Arrow Functions** — 文章脚本中使用 function 表达式和 forEach，保持广泛的浏览器兼容性。 || Article scripts use function expressions and forEach for broad browser compatibility.
- **禁止硬编码数据 || No Hardcoded Data** — 知识图谱数据只存在于 knowledge-data.js 中，禁止在 index.html 中直接写入知识点数据。 || Knowledge graph data lives only in knowledge-data.js. Never hardcode knowledge data in index.html.
- **禁止 Markdown 文章 || No Markdown Articles** — 所有文章内容直接使用 HTML，不创建 Markdown 原始文件。每篇文章是一个独立的、可完全控制布局的交互式页面。 || All article content uses HTML directly. No Markdown source files. Each article is a standalone, fully layout-controlled interactive page.
:::

## #references 11 / References :: 参考文献 || References

- [1] Bush, V. | 提出 Memex 概念，通过关联路径（associative trails）连接知识片段，被视为超文本和知识图谱的思想源头。本项目的知识图谱关联线（relations）直接呼应这一构想。
- [2] Miller, G. A. | 工作记忆容量的经典研究。Knowledge Hub 的渐进披露设计（Hero 3-4 个指标、章节编号、折叠深潜区）直接依据此原理控制每层信息密度。
- [3] Sweller, J. | 认知负荷理论的奠基论文。区分内在负荷（intrinsic）、外在负荷（extraneous）和相关负荷（germane），奠定了降低稠密知识消化难度的理论框架。
- [4] Nonaka, I. & Takeuchi, H. | 提出 SECI 模型（社会化→外化→组合→内化），阐述隐性知识向显性知识转化的四个阶段。Knowledge Hub 的知识文章创建流程对应"外化"（Externalization）阶段。
- [5] Shneiderman, B. | 提出信息可视化准则"先总览，再缩放过滤，最后按需查看细节"（Visual Information-Seeking Mantra）。Knowledge Hub 的 Galaxy 全局视图 → 标签过滤 → 点击进入文章的交互流程直接践行了这一准则。
- [6] Mayer, R. E. | 多媒体学习认知理论，提出分段原则（Segmenting Principle）和信号原则（Signaling Principle）。文章的编号章节、section-kicker 标签和折叠子章节分别对应这两个原则的实践。
- [7] Nielsen, J. | Web 阅读行为的眼动追踪研究，发现用户以 F 型模式扫描页面。Knowledge Hub 的 Hero 指标区域和 section-kicker 标签专为这种扫描行为设计，确保关键信息位于视觉热区。

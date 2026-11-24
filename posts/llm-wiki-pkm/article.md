---
title: 用大模型构建持续进化的个人知识库
eyebrow: LLM Wiki × Personal Knowledge Management
brand: 智能体
date: 2026-04-13
strict_i18n: false
strict_density: true
lead: "基于 Andrej Karpathy 的 LLM Wiki 模式，系统拆解如何让 LLM 担任\"知识管理员\"——告别每次提问时的临时检索，转向增量构建一个持续复利的结构化 Wiki。"
hero_actions:
  - "理解核心思路 | #core-idea"
  - "查看架构设计 | #architecture"
panel_label: 关键洞察
panel_title: 知识的维护成本决定了知识库的生死
panel:
  - 人类放弃 Wiki 是因为维护负担增长快于价值
  - LLM 不会厌倦，能一次性更新 15 个文件
  - 知识被编译一次后持续维护，不需每次重新推导
  - 人类负责策展和思考，LLM 负责一切簿记工作
metrics:
  - "三层架构 | Source → Wiki → Schema | 不可变原始源 → LLM 维护的 Wiki → 协同演化的规范"
  - "三种操作 | Ingest · Query · Lint | 摄入 · 查询 · 健康检查"
  - "核心工具 | Obsidian + LLM Agent | Obsidian 是 IDE，LLM 是程序员，Wiki 是代码库"
style:
  accent: "#f97316"
---

## #problem 01 / The RAG Trap :: RAG 困境：每次从零开始的知识重新发现

大多数人使用 LLM 处理文档的方式是 RAG——但这意味着知识永远不会积累。

:::accordion
::panel { open: true }
### RAG 的根本局限
大多数人与 LLM 交互文档的方式看起来像 RAG：上传一批文件，LLM 在查询时检索相关片段，然后生成回答。NotebookLM、ChatGPT 文件上传、以及大部分 RAG 系统都是这种模式。

这种方式**可以工作，但 LLM 在每个问题上都是从零开始重新发现知识**。没有积累。问一个需要综合五篇文档的微妙问题，LLM 每次都得重新找到并拼凑相关片段。什么都没有被建立起来。

传统 RAG

**无状态检索**

- 每次查询从原始文档重新检索
- 交叉引用需要实时重新发现
- 矛盾和冲突不会被标记
- 综合分析无法跨 session 保留
- 知识量增长 ≠ 洞察质量提升

LLM Wiki

**持续编译**

- 知识编译一次，持续维护
- 交叉引用已经建立并更新
- 矛盾已被标记和解决
- 综合分析被保存为 Wiki 页面
- 每个新源都让知识库更丰富

::panel
### 为什么人类维护的 Wiki 总会死掉
维护知识库最费力的并非阅读或思考，真正的消耗在于**簿记工作**：更新交叉引用、保持摘要与时俱进、标注新数据与旧声明的矛盾、在几十个页面间维护一致性。

人类放弃 Wiki 是因为**维护负担增长速度超过了价值增长速度**。而 LLM 不会厌倦，不会忘记更新交叉引用，能在一次操作中触及 15 个文件。当维护成本接近零时，Wiki 就能存活。

**Karpathy 的核心洞察：**人类的工作是策展来源、引导分析、提出好问题、思考这一切意味着什么。LLM 的工作是把其余一切都做了——总结、交叉引用、归档、以及让知识库随时间真正有用的簿记。
:::

## #core-idea 02 / Core Idea :: 核心思路：从"检索"到"编译"的范式转换

不在查询时检索原始文档，而是让 LLM 增量构建并维护一个持久的 Wiki。

:::accordion
::panel { open: true }
### 持久的、复利的知识产物
LLM Wiki 的核心思路：不在查询时从原始文档检索，而是让 LLM **增量构建并维护一个持久的 Wiki**——一个结构化的、互相链接的 Markdown 文件集合，位于你和原始资料之间。

当你添加一个新来源时，LLM 不只是索引它以备后用。它会阅读它、提取关键信息，然后**整合到现有 Wiki 中**——更新实体页面、修订主题摘要、标注新数据与旧声明的矛盾、强化或挑战正在演化的综合观点。知识被编译一次，然后持续更新，而非在每次查询时从头推导。

这就是关键区别：**Wiki 是一个持久的、不断复利的产物**。交叉引用已经建好了。矛盾已经被标记了。综合分析已经反映了你读过的一切。每添加一个来源、每问一个问题，Wiki 都在变得更丰富。

::panel
### 你从不写 Wiki——LLM 写
你从不（或极少）亲自写 Wiki——**LLM 包揽所有写作和维护**。你只管筛选来源、引导探索并提出好问题；LLM 承担全部案头苦工——总结、交叉引用、归档和簿记。

在实践中，Karpathy 的工作方式是：一边打开 LLM Agent，一边打开 Obsidian。LLM 随对话推进同步改写页面，他在 Obsidian 中实时浏览结果——跟踪链接、检查图谱视图、阅读更新后的页面。

**Obsidian 是 IDE；LLM 是程序员；Wiki 是代码库。**

::panel
### 与 Memex 的精神联系
这个想法在精神上与 Vannevar Bush 1945 年的 **Memex** 愿景相关——一个个人的、策展的知识存储，文档之间有关联路径。Bush 的愿景比后来的 Web 更接近这种模式：私有的、主动策展的，文档间的连接与文档本身同样有价值。

他无法解决的部分是：**谁来做维护？** LLM 解决了这个问题。

评论者 gnusupport 进一步指出，这也与 Douglas Engelbart 1992 年的工作一脉相承——他提出的增强系统（Augmentation System）、CODIAK 框架和开放超文档系统（OHS），核心都是人机协同的知识积累。LLM Wiki 本质上是**让 LLM 扮演了 Engelbart 设想的"永不倦怠的知识工作者"角色**。
:::

## #architecture 03 / Three-Layer Architecture :: 三层架构

Raw Sources → Wiki → Schema：三层分离，职责清晰。

:::accordion
::panel { open: true }
### 架构全景
📄

**Layer 1：Raw Sources（原始来源）**

你策展的来源文档集合。文章、论文、图片、数据文件。这些是**不可变的**——LLM 从中读取但永远不修改。这是你的信源真相（source of truth）。

Immutable · 人类策展

📚

**Layer 2：The Wiki（知识 Wiki）**

LLM 生成的 Markdown 文件目录。摘要页、实体页、概念页、对比分析、概览、综合论述。**LLM 完全拥有这一层**——它创建页面、在新来源到达时更新它们、维护交叉引用、保持一切一致。你阅读它；LLM 书写它。

LLM 拥有 · 人类阅读

⚙️

**Layer 3：The Schema（规范文档）**

一份文档（如 Claude Code 的 `CLAUDE.md` 或 Codex 的 `AGENTS.md`），告诉 LLM Wiki 的结构、约定，以及在摄入来源、回答问题或维护 Wiki 时应遵循的工作流。正是这份核心配置把 LLM 约束为守纪律的 Wiki 管理员，使其跳出通用聊天机器人的散漫对话模式。

人机共同演化

::panel
### 索引与日志：Wiki 的导航系统
两个特殊文件帮助 LLM（和你）在知识库增长时导航：

**index.md — 内容导航**

Wiki 中所有内容的目录——每个页面附带链接、一行摘要和可选的元数据（日期、来源数量）。按类别组织（实体、概念、来源等）。LLM 在每次摄入时更新它。

查询时，LLM 先读 index.md 找到相关页面，然后深入阅读。在中等规模（约 100 个来源、数百个页面）下效果出奇地好，无需嵌入式 RAG 基础设施。

**log.md — 时间线记录**

一份只追加的记录：发生了什么，何时发生——摄入、查询、健康检查。

技巧：如果每条记录以一致的前缀开头（如 `## [2026-04-02] ingest | Article Title`），日志就可以用 Unix 工具解析——`grep "^## \[" log.md | tail -5` 给出最近 5 条记录。

::panel
### 关键设计决策：为什么是 Markdown 而非数据库
LLM Wiki 选择 Markdown 文件（通过 Obsidian 浏览）而非数据库或向量存储，这并非技术受限，背后出于**明确的设计取舍**：

- **可读性**：如果 LLM 写错了，你能打开文件直接修改。SQLite、向量索引都无法做到
- **版本控制**：Wiki 就是一个 Markdown 文件的 Git 仓库，你免费获得版本历史、分支和协作
- **可移植性**：不依赖任何特定服务或工具，任何编辑器都可以
- **LLM 原生**：Markdown 是 LLM 训练中遇到次数最多的格式，也是 Wikipedia 和科学论文的格式

正如评论者 IlyaGorsky 所说：**"人类可读不是约束——它是特性。一个你可以在文本编辑器中审阅、提交到 Git、用 diff 查看、不需要任何工具就能理解的知识库。"**
:::

## #operations 04 / Operations :: 三种核心操作

Ingest（摄入）、Query（查询）、Lint（健康检查）构成知识库的生命循环。

:::accordion
::panel { open: true }
### Ingest — 知识摄入
你将新来源放入 raw 目录，告诉 LLM 处理它。一个典型的流程：

1

**阅读来源**

LLM 阅读完整的原始文档，提取关键信息和主要观点。

2

**与你讨论**

LLM 与你讨论关键要点，你引导它关注什么是重要的。

3

**写入 Wiki**

写一个摘要页，更新 index.md，更新 Wiki 中所有相关的实体页和概念页，追加日志条目。**一个来源可能触及 10–15 个 Wiki 页面。**

Karpathy 倾向于逐个摄入来源并保持参与——阅读摘要、检查更新、引导 LLM 强调什么。但你也可以一次批量摄入多个来源，以较少的监督。关键是**找到适合你风格的工作流，并记录在 Schema 中**供未来 session 使用。

::panel
### Query — 查询与探索
你向 Wiki 提问。LLM 搜索相关页面、阅读它们、综合生成带引用的回答。回答可以采用不同形式：Markdown 页面、对比表格、幻灯片（Marp）、图表（matplotlib）、画布。

**关键洞察：好的回答可以作为新页面归档到 Wiki 中。**你要求的对比分析、你发现的联系、你做的深度分析——这些都很有价值，不应该消失在聊天历史里。这样你的探索也和输入的来源一样，在知识库中产生复利。

::panel
### Lint — 健康检查
定期让 LLM 巡检 Wiki 的健康状况，排查六类隐患：

- **页面间的矛盾**：不同页面声明相互冲突
- **过时声明**：新来源已经取代了旧的说法
- **孤儿页面**：没有任何入站链接的页面
- **缺失页面**：被提及但没有自己页面的重要概念
- **缺失交叉引用**：应该互相链接但没有链接的页面
- **数据间隙**：可以通过网络搜索填补的空白

LLM 擅长建议新的调查问题和新的来源方向。Lint 让 Wiki 在增长过程中保持健康。
:::

## #scenarios 05 / Application Scenarios :: 应用场景

LLM Wiki 模式适用于任何需要随时间积累和组织知识的场景。

:::accordion
::panel { open: true }
### 六大应用场景
- **个人成长** — 追踪你的目标、健康、心理、自我提升——归档日记条目、文章、播客笔记，建立一个关于你自己的结构化画像。
- **深度研究** — 在数周或数月内深入一个主题——阅读论文、文章、报告，增量构建一个带有不断演化的论述的综合 Wiki。
- **阅读伴侣** — 逐章归档一本书，建立角色、主题、情节线索的页面及其关联。读完后你拥有一个丰富的伴读 Wiki——想想 [Tolkien Gateway](https://tolkiengateway.net/wiki/Main_Page) 那样的粉丝 Wiki。
- **团队/业务知识库** — 由 LLM 维护的内部 Wiki，持续从 Slack 消息、会议记录、项目文档、客户通话中汲取信息。Wiki 保持最新，因为 LLM 做了团队中没人愿意做的维护工作。
- **代码库文档** — 评论者 akash-r34 的实践：用 LLM Wiki 模式为代码库建立文档。基于 `git diff` 驱动增量摄入——只刷新受变更影响的页面。约 80 个文件的 Next.js 项目生成了 78 个互链页面。
- **竞品分析/尽职调查** — 竞争分析、旅行规划、课程笔记、爱好深挖——任何你在随时间积累知识并希望它有组织而非散落的场景。

::panel
### 研究型 Wiki 的进阶实践
北京大学团队在 Karpathy 的模式基础上构建了 ΩmegaWiki，将 Wiki 扩展为完整的研究生命周期平台：

- **8 种实体类型**的结构化知识库（论文、方法、数据集、实验等）
- **9 种关系类型**连接一切（supports、contradicts、tested_by 等）
- **全链路研究循环**：摄入论文 → 检测空白 → 生成研究想法 → 设计实验 → 运行实验 → 判定 → 自动更新 Wiki
- **反重复记忆**：失败实验留在 Wiki 中，防止重新探索死胡同

关键思路：**Wiki 不是副产品——它是状态机。每个技能从中读取、写回它，知识随时间复利。**
:::

## #ecosystem 06 / Tools & Ecosystem :: 工具生态与实践技巧

构建 LLM Wiki 所需的工具栈和实战经验。

:::accordion
::panel { open: true }
### 推荐工具栈
| 工具 | 角色 | 说明 |
| --- | --- | --- |
| Obsidian | Wiki 浏览器 / IDE | Graph View 是查看 Wiki 形状（连接、枢纽、孤儿）的最佳方式。Dataview 插件支持对页面 frontmatter 的动态查询。 |
| Web Clipper | 来源采集 | Obsidian 浏览器扩展，将网页文章转为 Markdown，快速进入 raw 目录。 |
| Claude Code / Codex | LLM Agent | 执行摄入、查询、Lint 操作。Schema 文件（CLAUDE.md / AGENTS.md）是给 Agent 的指令。 |
| qmd | 本地搜索引擎 | Markdown 文件的混合 BM25/向量搜索 + LLM re-ranking，支持 CLI 和 MCP server。小规模下 index.md 足够，大规模时使用。 |
| Git | 版本控制 | Wiki 就是 Git 仓库的 Markdown 文件。免费获得版本历史、分支、协作和 diff 审查。 |
| Marp | 幻灯片生成 | 基于 Markdown 的幻灯片格式，Obsidian 有插件支持。可直接从 Wiki 内容生成演示文稿。 |

::panel
### 社区衍生工具
Karpathy 的 Gist 发布后迅速获得 5,000+ Stars 和 3,500+ Forks，催生了一批代表性开源项目：

| 项目 | 特色 | 适用场景 |
| --- | --- | --- |
| **claude-obsidian** | Claude Code 插件，hot cache（500 字会话上下文）、矛盾标记（`[!contradiction]`）、8 类 Lint、自动研究循环 | 深度研究、个人知识库 |
| **llm-context-base** | Git 模板，Training Period（前 30 天人类审阅所有写入）、分层 Lint 系统、多 LLM 适配 | 任何需要 Schema 收敛的场景 |
| **memory-toolkit** | Claude Code session 记忆管理：PreCompact 钩子、Haiku 观察者（每 3 分钟自动提取决策）、确认式写入 | 编码项目的 session 连续性 |
| **ΩmegaWiki** | 全生命周期研究平台：8 实体类型、9 关系类型、20 个 Claude Code 技能 | 学术研究 |
| **multi-agent-wiki-toolkit** | 多 Agent 扩展：13 种架构扩展、5 个专用 Wiki、文件级锁、能力令牌 | 多 Agent 并行协作 |
| **obsidian-llm-wiki-local** | 本地 Ollama LLM 支持，无需云端 API | 隐私优先的离线场景 |

::panel
### 实践技巧
- **图片本地化**：在 Obsidian 设置中将附件目录固定（如 `raw/assets/`），剪藏后用快捷键下载所有图片。LLM 无法在一次读取中处理内嵌图片的 Markdown——变通方案是先读文本，再单独查看引用的图片
- **Dataview**：如果 LLM 给 Wiki 页面添加 YAML frontmatter（标签、日期、来源计数），Dataview 可以生成动态表格和列表
- **逐个摄入 vs 批量摄入**：Karpathy 倾向逐个摄入并保持参与。对于质量优先的场景建议如此；对大批量低优先来源可以批量处理
- **查询结果归档**：养成习惯将有价值的查询回答保存为 Wiki 页面，让探索也产生复利
:::

## #limits 07 / Limitations & Debates :: 局限性与争议

社区反馈揭示的真实挑战与思辨。

:::accordion
::panel { open: true }
### 知识漂移与质量退化
ETH Zurich 的研究发现：LLM 生成的上下文文件在 8 个测试配置中的 5 个**反而降低了 Agent 性能**，每个任务多出 2–4 步推理。失败原因是 LLM 在维护过程中自行发明 schema、状态值和标签格式，导致渐进式漂移。

- **漂移来源** — LLM 不跨 session 保持一致性。每个新 session 可能引入略有不同的命名约定、标签体系或组织方式。这些微小偏差在数十次操作后**复合成系统性偏差**。
- **应对策略：Training Period** — llm-context-base 的做法：前 N 天（约 30 天），人类审阅所有 Wiki 写入操作，LLM 学习你的约定。之后分层 Lint 系统自动标记陈旧、漂移和孤儿页面。**人类策展 by design。**

::panel
### "第二大脑" vs "个人研究索引"
评论者 gpkc 提出了一个值得深思的区分：

**LLM Wiki 方向**

LLM 指向**外部来源**，让它编写综合。极限状态收敛到一个**个性化的互联网副本**（personalized research index）。

**PKM / "第二大脑" 方向**

LLM 指向**你自己的笔记**，只负责维护。极限状态收敛到一个**你思考的持久副本**。写作行为本身承载关键功能，不可替代。

**如果 LLM 是作者，你建立的是个性化研究索引，并非真正的第二大脑。**不同的工具，不同的用途。PKM 社区所说的"第二大脑"中，写作本身才是关键——它绝非附带产物，本身就是承重结构。

::panel
### Karpathy 文本中的内在矛盾
评论者 gnusupport 指出了原始文本中的几处张力：

- **Index vs "No RAG"**：Karpathy 说 index.md 避免了 RAG，但后来建议使用 qmd（BM25/向量搜索）作为扩展。这本质上是"多了几步的 RAG"。更准确的表述：搜索是可选的扩展工具，不是矛盾
- **"LLM 写一切" vs 人类编辑 Schema**：人类共同演化 CLAUDE.md（它位于 Wiki 中）。实际模式是：LLM 拥有内容页面，人类拥有元层（Schema）
- **不可变来源 vs 图片下载**：下载图片到本地附件目录会修改 Markdown 来源（URL 会变）。需修正措辞："内容不可变；元数据/附件可修改"
- **Lint 检测矛盾——但谁来解决？**：LLM 自动解决（按时间或权威）还是标记待人工审阅？原文未说明

::panel
### 开放问题与未来方向
- **多实例管理** — 个人 vs 工作？每个项目一个？如何在多个 Wiki 之间交叉查询？评论者 BillSeitz 建议：1 个私人空间、1 个公开空间、每个公司 1 个共享空间。
- **多 Agent 并发** — 当多个 Agent 并行操作同一 Wiki 时，需要身份验证、访问控制、防污染和并发协调。redmizt 团队开发了 13 种架构扩展来解决这些问题。
- **Obsidian 的开源替代** — gnusupport 指出 Obsidian 是专有软件——你无法在查看器是闭源的情况下拥有真正的"个人"知识库。替代方案：VS Codium、静态站点生成器、或自建查看器。
- **认识论过滤** — 评论者 V-interactions 认为 Karpathy 的模式解决了存储，但没解决生命周期、认识论过滤和熵。不同身份视角下（创始人 vs 投资人），同样的来源应生成完全不同的 Wiki 页面。
:::

## #references 08 / References :: 参考来源

- [1] Karpathy, A. — https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f | 核心原始资料。5,000+ Stars，3,500+ Forks。提出三层架构（Raw Sources / Wiki / Schema）和三种操作（Ingest / Query / Lint）。
- [2] Bush, V. — https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/ | Memex 概念的原始提出——私有的、策展的知识存储，带有文档间的关联路径。LLM Wiki 的精神前身。
- [3] Engelbart, D. — https://www.dougengelbart.org/content/view/116/ | 增强系统（Augmentation System）、CODIAK 框架和开放超文档系统（OHS）。评论者 gnusupport 指出 LLM Wiki 是 Engelbart 架构的实例化。
- [4] gpkc. — https://scribelet.app/blog/karpathy-llm-wiki-reaction | 区分"个性化研究索引"与"第二大脑"的关键分析：如果 LLM 是作者，产出的不是第二大脑。
- [5] AgriciDaniel. — https://github.com/AgriciDaniel/claude-obsidian | 基于 Claude Code 构建的完整 LLM Wiki 插件：hot cache、矛盾标记、8 类 Lint、自动研究循环。358 Stars。
- [6] asakin. — https://github.com/asakin/llm-context-base | 落地 Training Period 模式的工程模板：前 30 天人类审阅所有写入，分层 Lint 系统自动标记漂移。基于 ETH Zurich 的经验发现。
- [7] IlyaGorsky. — https://github.com/IlyaGorsky/memory-toolkit | Claude Code session 记忆管理：PreCompact 钩子、Haiku 观察者、确认式写入。解决 session 间知识退化问题。
- [8] redmizt. — https://github.com/redmizt/multi-agent-wiki-toolkit | 多 Agent 扩展：6 个 Agent 并行，5 个专用 Wiki，13 种架构扩展。验证了 LLM Wiki 模式在多 Agent 场景的可扩展性。
- [9] skyllwt et al. — https://github.com/skyllwt/OmegaWiki | 北京大学团队的全生命周期研究平台：8 实体类型、9 关系类型、20 个 Claude Code 技能。将 Wiki 从副产品变为研究流水线的状态机。
- [10] Tobi. — https://github.com/tobi/qmd | 本地 Markdown 搜索引擎，混合 BM25/向量搜索 + LLM re-ranking，支持 CLI 和 MCP server。Karpathy 推荐的扩展工具。

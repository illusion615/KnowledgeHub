---
applyTo: "posts/**/*.html"
---

# Article Page Conventions

> 本文件是 Study-Room 文章页的**唯一权威规范**。新建或修改 `posts/**/*.html` 前必须把 §0 当作 checklist 全部过一遍。其余 §1–§N 是组件级 spec，按需查阅。
>
> **设计系统入口**（写组件前必读）：
> - 可视化文档：[posts/article-design-system/index.html](../../posts/article-design-system/index.html) §04 Core Components — 列出每个共享组件的 markup、padding、字号、阴影、暗色模式
> - 样式实现源：[assets/article.css](../../assets/article.css) — 所有 canonical class 的真身
> - 验证器：`node tests/validate.js`（必须 exit 0；当前已知 14 条无关 WARN 基线）

## §0 Authoring Pre-Flight (READ FIRST, every time)

写文章前先按这 5 条自检；任意一条不达标，要求 boss 澄清或调整方案，**不要先动手**。

### 0.0 Intake Clarification — 内容澄清优先（开工前必走）

收到选题后，**先问内容侧问题**再动手。技术侧问题（章节顺序、用什么组件、放第几节、配色、CSS）由我自己判断，**严禁反问 boss**。

收到选题 → 一次性把下列 **5 个必问** 抛给 boss，缺答即停工等待。

1. **读者是谁** — 角色 + 先验知识水平 + 阅读处境（例：「企业 IT 经理，零 Power Platform 经验，正在被业务催方案」）。
2. **读完想达成什么** — 一个可验证的动作/判断（例：「能向 CIO 解释谁做什么」「能照做出 30 天落地计划」「评审会上能回答 5 个常见反对」）。
3. **形式偏好** — 主线形态：流程 / 对比 / 决策树 / 角色×阶段 / 时间轴 / 案例 / FAQ；篇幅：速览 / 深度 / 参考手册。
4. **信息源** — 必须采纳的官方文档 / 内部资料 / 客户原话 / 已发表文章；以及"不要用"的来源。
5. **边界** — 这篇 *不* 解决什么（防主题膨胀）；不能公开的信息；是否双语。

视情况追问：是否复用站内文章作为前置阅读？完稿后用途（站内发布 / 客户分享 / PPT 演示）？时间约束？

**禁止行为**：
- 用「我先按 X 做你看看」绕过澄清。
- 把内容侧问题包装成技术侧问题（"要不要分两节"是结构判断，背后还是受众和目的没问清）。
- 一次只问一个，挤牙膏。一次性列全。

### 0.1 写作纪律（详见 `/memories/writing-rigor.md`）
> 自检本节时，连带过一遍两条易漏的强约束：**事实导向、非心路历程**（删除"我最初设想 / 经过一次重设计 / 这是同步点"等过程叙事，移进备注；详见 writing-rigor.md「Fact-Led」）与 **总览先于细节**（§0.7-B-2）。
- 禁用空话：「不是 X 而是 Y」「真正的…」「最关键的…」「全方位」「极致」「赋能」等。每个论断必须可量化或可证伪。
- **严谨标准与表达体例分离**。事实、术语、引用、边界和测量采用论文级严谨标准；表达方式必须服从文档用途。解决方案汇报、架构方案和客户演示使用直接的业务决策与实施语言，正文主线禁止出现「研究问题 / 研究对象 / 分析单元 / 归因方法 / 证据层级 / 概念命题 / 先验假设」等研究方法叙事；确有保留价值时移入 References 或附录。文章正文（含 hero、editorial stance、frontier-callout、stream lead、quote-block、principles 正例/反例、open-question 描述、decision 列表项）仍须使用陈述式专业表达，禁止以下口语化比喻与自造术语：
  - **口语化禁用词**：钉死 / 写死 / 锁死 / 活体 / 祖师爷 / 最热 / 试水 / 噩梦 / 笔墨 / 住址 / 栖息 / 大脑+手脚 / 有人觉得X有人觉得Y / 没人讲清楚 / 没人攻 / 不要再争 / 认真做 / 代码乱炖 / 它记得我。
  - **自造术语禁用**：「可预测性契约」类自造复合词；优先复用已有学术词汇（Mixed-Initiative、schema、structured outputs、runtime confidence、mode switching cost、affordance、定义权归属、向前兼容、合规审计）。
  - **母语地道（禁翻译腔）**——第四类措辞硬伤，与"口语化""自造术语"并列：词本身既不口语也非生造、在英文里还是正规术语，但属英文**逐词直译**，中文从业者不这么说。判据——「这是官方英文术语吗」通过、但「中文从业者真的这么说吗」不通过 = 翻译腔。两类高发：① **计算机术语渗入业务正文**——breakpoint→断点、exception→例外（运营异常用「异常」，仅"规则/政策特例"保留「例外」）、routing→路由（工单/客户分派用「分派/分流」）、capacity 对人→容量（用「人力/产能」）；② **名词硬拼直译**——guardrail→守护门槛（用「安全红线/底线指标」）、benefit pool→收益池（用「收益来源/效益空间」）、customer outcome→客户结果（用「客户成效」）、primary outcome→主结果（用「核心结果指标」）、fully-burdened→完全成本（用「综合/全负担成本」）、close the loop→回路闭环（用「闭环」去冗余）、customer health→客户健康（用「客户健康度」）。已被中文接纳的借词（AI 语境的「上下文」、贡献毛利、回收期、转人工、派工、口径、主数据）保留——地道 ≠ 清洗所有外来词。核查手段：完稿逐条自审，**不设验证器硬拦**（「例外/异常」等需按语境判断，硬规则会误伤）。
  - **母语地道·句法层（禁机翻／AI 味，boss 2026-07-19）**——翻译腔不止在词，更在句式；且**双语内容里每种语言都要像母语从业者直接写出来的，不能一边写完、另一边逐句直译**。判据同样是「读出声，像翻译就重写」。中文高发硬伤：① **动词名词化当宾语**——达成可确认的解决／组织成……承诺／形成……证据／把……转成……成效／生成可选方案 → 用真动词（把问题解决／整理成一份承诺／拿出证据／提出方案）；② **英式直译句式**——直达……的解决、被转到……路径、可确认的X、以X驱动增长、从不完整证据开始、把行动结果用于……改进、并行工作 → 改成动词驱动的主动句；③ **书面生硬虚词**（面向业务领导时）——而非→而不是、并→也、即→就、依据→根据、滥用的「将」→把／会；④ **被动**「被……转化为……」→主动。保留 AI 术语「上下文」，但修其周边动词（形成上下文→整合出上下文）。
  - **改写范式**：「X 怎么定义 / 谁定义」→「X 的定义权归属 / 演进策略尚无定论」；「用户怎么知道」→「用户如何形成对……的认知」；「做不好就落后」→「缺失即落后」；连串疑问句 → 一句陈述 + 一条判据。
  - **副词收敛**：「最 / 极 / 最深刻 / 无限」必须配可证伪锚点（"引用最广泛"／"工程化程度最高"），否则删除。
  - **stance bullet 不得伪装大纲**：editorial-stance / decision 等"立场列表"的每一条必须是可证伪论断，不是目录条目。
- 量化数据必须带测量条件或显式声明缺失，不要用模糊比较代替绝对数。
- 引用必须给到具体来源（arxiv ID、Microsoft Learn URL、官方 doc URL），并说明每条来源支撑文中哪句论断。
- **术语纪律（Terminology Rigor）**——论文写作底线，违反一次即视为硬伤：
  - **先核实再使用**：用任何领域术语前，先确认它是不是官方 / 通行术语（查文档原文）。不确定就不要当既定术语用。例：`livestreaming`（亦称 *streaming response*）是 BotFramework-WebChat 官方术语；"webchat streaming 协议"不是——不得当通行术语使用。
  - **首次出现必须定义**：每个非通识术语在全文第一次出现处给一句话定义 + 来源标注（`[n]`）。
  - **近义不等价必须区分**：不得把多个不同机制混称为同一术语。例：Direct Line 的 livestreaming 约定与 Direct Engine 的 SSE 传输是两套东西，不能合称"同一个 streaming 协议"。
  - **自造术语显式标注**：确需自造词时写明"本文称之为 X"并说明它对应的已有概念；优先复用学术 / 官方既有词汇。
  - **全文一致**：同一概念全程用同一术语，不在中途换称呼。
- **排印**：英文撇号/引号一律用 ASCII `'` `"`，禁止 `&rsquo;` `&lsquo;` `&rdquo;` `&ldquo;` 及裸 U+2018/2019/201C/201D 字符。弯引号在中英混排回退到中文字体后会被渲染得偏宽不紧凑，且容易被误认为全角标点。中文标点（，。：；「」）正常使用，仅约束英文。
- **大小写**：英文 section `<h2>` 与 hero `<h2>` 一律用 **Title Case**（每个实词首字母大写）。冠词 `a/an/the`、并列连词 `and/but/or/nor/for/so/yet`、介词（不论长度，如 `of/in/on/at/to/from/with/into`）小写；首词与末词无论词性一律大写；连字符复合词（`One-Shot`、`ALM-Ready`、`Per-Environment`、`Pay-as-You-Go`）每段都大写；缩写（DLP、ALM、IT、PPAC、URL）保持全大写。`section-kicker`（"01 / Section Label"）同样 Title Case。**演示模式所有"页标题"也必须 Title Case**：包括 `data-step-title` 属性、`[data-accordion]` 内 `.subsection-toggle > span` 文本（accordion 既是阅读分节也是 present slide 标题）、以及 `[data-present-step]` slide 顶部直接出现的 `<h3>` 分组标题。正文段落与卡片说明仍用 sentence case。

### 0.2 受众与结构判断（先决定，再写）
- 用一句话写下受众与他们的预期收获；如果受众是「零基础」，主线必须按 learn-flow 排，不要按 reference-completeness 排。
- 选定**一条主线**（流程 / 对比 / 决策树 / 角色 × 阶段 / 时间轴）。辅助信息（角色词典、术语表、补充资料）一律放进 accordion 收起，不与主线竞争注意力。

### 0.3 视觉对称（详见 `/memories/visual-layout.md`，本规范强制执行）
- **卡片数量只能是 2 / 3 / 4 / 6**。出现 5、7、9、11 等数字立即重组：合并、拆分，或改成 accordion 列表。
- 严禁对会出现孤儿行的卡片组使用 `grid-template-columns: repeat(auto-fit, minmax(...))`；多列布局必须显式按断点写 `repeat(N, 1fr)` 或显式分行。
- 7 张必须 4+3，5 张必须 3+2，绝不允许 4+1、6+1、5+2 等单卡末行。
- Presentation 模式 `insight-grid` 最多 3 列，详见 §"Symmetric grid layout rule"。

### 0.4 渐进披露密度
- 每个 `<section>` 默认只展开一条主线 + ≤3 张总览卡。深度内容必须放进 `.subsection-accordion`，默认折叠。
- `.subsection-content` 第一句必须是一句话总结，后接结构化组件（cards / flow-list / table），禁止整块只放一段散文。
- 一张幻灯片只承载一个想法；若 section 同时有卡片网格和 accordion，必须拆 step。

### 0.5 分级验证与完工闸门

验证按变更风险分级。**完整仓库验证只在一个内容单元稳定后和提交前执行，不得在每个微小补丁后重复执行。** 第一次实质编辑后仍须立刻运行能推翻当前假设的最窄检查。

| 等级 | 典型变更 | 中间检查 | 完工浏览器检查 |
|---|---|---|---|
| L0 文案 | 术语、标题、摘要、单点数值，不改变 DOM 结构和 CSS | 搜索旧值 + `node tests/verify-change.js --article <slug> --level L0` | 自动扫全部 section 宽度与控制台；截图受影响区域；演示元数据未变时不扫全 deck |
| L1 局部行为 | 单章节内容、配置器字段、局部 JS、accordion 内容 | `node tests/verify-change.js --article <slug> --level L1` + 目标交互断言 | 全 section 阅读扫描；受影响章节做中英文、桌面/移动检查；仅扫描受影响演示页 |
| L2 结构/共享 | 拆章、架构图、演示分页、共享 CSS/JS、导航或全局组件 | `node tests/verify-change.js --article <slug> --level L2`；共享资产变化用 `--changed` 自动升级全仓 | 中文亮色 + 英文深色全 deck；桌面/移动；逐 section 检查并截关键结构页 |

L2 研究若同时存在事实证据与文章结构两条独立不确定性，可并行调用只读的 `Article Evidence Reviewer` 与 `Article Structure Reviewer`；主 Agent 必须先完成直接锚点检查，并始终保持唯一编辑者。只有一条不确定性时只调用对应 Agent，不为凑并发重复研究。

**验证账本停止规则**：一项检查成功后，后续编辑没有触及它覆盖的风险面，就不得重跑。例如只改汇率默认值，不重扫全部演示页；只改正文术语，不重测暗色 CSS。若后续编辑改变 DOM、CSS、演示元数据或共享运行时，对应检查才失效。

完工闸门（顺序不可调）：

1. 目标文章快速验证必须通过；优先使用 `node tests/verify-change.js --article <slug> --level <level>`，或用 `--changed` 自动选择当前改动。
2. `assets/knowledge-data.js` 的 `summary.zh ≤ 100` 字符、`summary.en ≤ 160` 字符。
3. 按上表完成 built-in browser 检查；HTML/CSS 变更至少自动遍历全部 section，并对受影响区域截图。
4. 内容稳定后运行一次 `node tests/verify-change.js --final`；其中全仓 `validate.js` 与 staged/unstaged diff 检查必须全部通过，warnings 不得新增（当前基线 22 条无关 WARN）。
5. 回头扫一遍 §0.1–§0.4 自检。

### 0.6 组件复用纪律（NO ROGUE COMPONENTS）

**默认结论：你想做的卡片站内已经有了。** 写任何"卡片/网格/列表/chip/表格"之前，按下面的顺序排查：

1. **先查 canonical 清单**（`assets/article.css` + `posts/article-design-system/index.html` §04）：
   - 信息卡片网格 → `.insight-grid` + `.insight-card`（含 `.card-index` 角标）
   - 二元/多元对比 → `.comparison-grid` + `.comparison-card`（可加 `.next` 强调）
   - 步骤 / 流程 / 时间轴 → `.flow-list` + `.flow-step` + `.flow-copy > strong + p`
   - 编号要点列表 → `.layer-list` + `.layer-number`
   - 数字指标 → `.metric` + `.metric-label` + `<strong>` + `<span>`
   - 引用 / 关键观点 → `.quote-block`
   - 数据表 → `.simple-table`
   - 折叠分节 → `.subsection-accordion` + `.subsection-item[data-accordion]` + `.subsection-toggle` + `.subsection-content`
   - 标签 / chip → 复用 `.comparison-label` 或 `.event-tag`
2. **找到等价物 → 直接用**，不要重命名、不要"我加点小改动"。需要色彩区分时用语义 modifier（如 `.event-tag-model`），不要新建独立组件。
3. **找不到等价物 → 暂停，先和 boss 确认**：说明用例、为什么 canonical 不够、新组件命名空间、是否进 `assets/article.css`。得到批准后再写。
4. **inline `<style>` 严禁定义"通用组件"职能的 class**。inline 样式只允许：
   - 文章一次性的微调（间距、特定颜色覆盖）
   - 该文章特有的、明显不会被复用的可视化（如某张矩阵图、某个示意图）
5. 任何新增"卡片/网格"组件时，必须同步更新 `posts/article-design-system/index.html` §04 demo + 在 `assets/article.css` 加暗色模式样式。
6. 任何叠在彩色 pill / 渐变底 / 染色卡片上的二级标签（如 `small`、role badge、chip、anchor badge）都必须单独定义 **dark mode 对比度规则**，禁止只继承父元素文字色。至少补其中一项：更深独立底色、边框 / inset ring、text-shadow；并在浏览器里实测可读性。

**反例（本文已发生过）**：为 7 阶段流程新造 `.lifecycle-stage` + `.ls-chip` 而不用 `.flow-list`；为 11 角色卡新造 `.role-card` + `.role-fam-*` 而不用 `.insight-card`。这两类都属于直接违规。

### 0.7 Article Logic Contract — 文章逻辑结构契约

**A. 写之前必须填写三件**（写在 session 笔记里，不达标不开工）
1. **一句话受众**：`______ 读者打开本文，期望在 ______ 分钟内拿到 ______ 的能力/判断`。
2. **一句话主张（thesis）**：本文用 ______ 证明 / 教会 ______。
3. **章节大纲**：列出 §01–§N 的 kicker，逐条问"删掉它读者还能不能拿到主张"。删得掉就删。

**B. 章节顺序原则**（按优先级排列；冲突时上层胜出）
1. **认知顺序优先**：零基础读者先要 *what / who*，再要 *why*，最后要 *how*。术语、许可、规格不许放在主线之前。
2. **总览先于细节（general-to-specific）**：凡涉及"多条路径 / 多个方案 / 多种机制"，必须先给一节**对比总览**（一张对比表 + 每条一句话取舍），再分节展开各条详情。禁止从概论直接跳进某一条的实测 / 配置细节而不先铺总览——这是 boss 两次纠正过的结构硬伤。总览节同时承担"协议/背景 → 实操"的过渡。
3. **主线唯一**：全文只允许一条主线（流程 / 对比 / 决策 / 角色×阶段 / 时间轴 / 案例 / FAQ 之一）。其余信息是支线，进 accordion。
4. **承接成链**：每章的论证结论应成为后续论证的前提，但承接必须通过事实、概念或因果关系自然完成。正文禁止使用「第 X 章 / 上一章 / 本章 / 下一章 / 前 N 章」解释文章结构；这类导航属于作者提纲，不属于读者内容。
5. **References 永远在最后**。

**C. 单章节三件套契约**
每个 `<section>` 的 `.section-head` 必须能回答：
- **kicker** = 章节代号（"01 / Section Label"）
- **h2** = 这一章的*结论或承诺*（动宾或判断句，不是干巴巴的名词短语）
- **intro `<p>`** = 直接陈述本节处理的事实问题、核心判断和适用边界；若依赖前文结论，复述必要前提而不引用章节号或描述写作动作

**D. Hero 对账**
hero `.hero-metrics` 抛出的每个 metric、`.hero-panel .layer-list` 抛出的每个要点，都必须在正文里被一个 section 兑现。完稿后逐一对照，未兑现的要么删 hero、要么补正文。

**E. 完稿"一句话回放"自检**
用一句话复述每个 section 的主张，串起来读一遍。如果读起来跳跃、缺环、或顺序倒过来也说得通，结构就不及格，必须重排。

**F. 多视图架构拆章契约（Multi-View Architecture Decomposition Contract）**

架构、设计和完整方案类文章必须区分三种不同层级，禁止互相替代：

1. **抽象层级（abstraction level）**：系统 → 子系统 → 组件，回答「由什么组成」。
2. **架构视图（architecture view）**：边界与接口、静态结构与职责、运行时与状态、部署拓扑、横切治理与风险，回答不同的读者问题。
3. **披露层级（disclosure level）**：`<section>` → accordion → `data-present-step` / `data-present-substep`，只控制阅读和演示展开方式，不定义架构语义。

拆章规则：

- 一个 `<section>` 只能回答**一个读者问题**，并以**一种架构视图**为主。边界接入、静态结构、运行时、状态模型、部署、治理/风险之间发生视图切换时，必须新建同级 `<section>`，不得继续塞进同一章的 accordion。
- 同一视图中的多个抽象层级可以留在一章，例如「平台 → 子系统 → 组件」逐层下钻；但必须先给该视图总览，再展开关键子系统。
- accordion 只能承载**同一视图的可选深度**、补充证据或失败样例。删除 accordion 后若本节主张无法成立，或 accordion 自己需要完整的「需求、机制、取舍、边界」四层论证，它就不是支线，必须升格为同级章节。
- `data-present-step` / `data-present-substep` 只负责演示分页。禁止用更多 slide 掩盖章节已经包含多条主线的问题。
- 横切概念（安全、身份、可观测性、DLP、ALM、可靠性）若同时作用于多个组件，应集中在「治理与保障」类章节，避免在每个组件说明中重复。
- 架构文章推荐认知顺序：**业务边界/外部接入 → 逻辑结构与职责 → 运行时与持久状态 → 部署（如适用）→ 可靠性与治理 → 配置/落地**。可按内容删减，但不得把不同视图重新合并成一个笼统的「架构」章节。

密度预警：一个非 References / 附录 / 单一交互工具章节命中以下任意 **2 项**，必须暂停并做拆章评审：

- 有效演示页超过 **7** 张：普通 `data-present-step` 计 1 页；父 step 含 `data-present-substep` 时，父容器不单独计页，只计实际子页；
- accordion 超过 **3** 个；
- 去除标签与空白后的正文超过 **3,000** 字符；
- 包含 **2 个以上非平凡子系统**，且每个都需要 §0.11-B 的四层说明；
- 同时出现两种以上架构视图，例如「静态组件图 + 运行时流程」或「接入矩阵 + 安全治理」。

前 3 项由 `tests/validate.js` 给出组合 warning；后 2 项必须在章节大纲和完稿审查中人工判断。数量阈值是触发审查，不是鼓励把内容压到阈值以下；只要读者问题或架构视图已经改变，即使未超数量也必须拆章。

新建的架构、设计、完整方案文章，以及被明确重访并发生实质结构修改的既有文章，必须在根节点启用严格检查：

```html
<html lang="zh-CN" data-section-density="strict">
```

严格模式按渐进迁移执行：`tests/validate.js` 只扫描声明该属性的文章，避免一次性把历史文章全部变成新增 warning；历史文章在后续实质重访时补上属性并完成拆章。`data-density-exempt="references"`、`"appendix"` 或 `"single-tool"` 只能标在确属参考资料、附录或单一交互工具的 `<section>` 上，不得用于规避普通正文拆章。

### 0.8 双模式组件契约 — Dual-Mode Component Contract

文章页同时承担**阅读模式**（自上而下滚动）和**演示模式**（一屏一 step）。任何新组件落地前必须同时满足两个模式，否则会和共享规则打架——本节列出必须遵守的硬约束。

**A. Spacing tokens（强制使用，禁止发明新 gap 值）**

`assets/article.css :root` 声明了 4 个垂直节奏 token，inline `<style>` 必须从中挑选；要新增 token 先扩 `:root` 再用。
- `--rhythm-step: 32px` — `<section>` 内相邻 `[data-present-step]` 兄弟之间（已由共享规则自动应用）
- `--rhythm-card: 18px` — 卡片网格 gap（`.insight-grid` / `.comparison-grid` 等）
- `--rhythm-inline: 12px` — chip / 标签 / 行内徽章 gap
- `--rhythm-tight: 8px` — 密集 pill / 小标签列表

**B. `data-present-step` 子级间距 — opt-out 契约**

`assets/article.css` 有一条全局规则：
```css
[data-present-step] + [data-present-step] { margin-top: var(--rhythm-step); }
```
它保证 `<section>` 直接子级的多个 step 在阅读模式下有节奏。**陷阱**：如果你的自定义容器自己用 `display: grid|flex; gap: …` 排版（如 `.lifecycle-map / .lc-stages / 任何自造 stack`）并直接包了多个 `[data-present-step]` 兄弟，全局 margin + 容器 gap 会叠加，产生双重间距。

**唯一正确做法**：在该容器上加 `data-gap-managed` 属性：
```html
<div class="lifecycle-map" data-gap-managed>
  <div class="lc-phase" data-present-step>…</div>
  <div class="lc-phase" data-present-step>…</div>
</div>
```
inline `<style>` 里**禁止**写 `.X > [data-present-step] + [data-present-step] { margin-top: 0 }` 这种局部 hack——重复一遍：用属性，不要写 CSS override。

**C. 新组件 inline `<style>` 顶部注释模板**

任何新组件块在 inline `<style>` 顶部必须写 3 行注释，注明双模式行为：
```css
/* Component: .lifecycle-map
   Reading mode: own grid gap (--rhythm-card); data-gap-managed disables global step margin.
   Presentation mode: each .lc-phase becomes one slide via data-present-step. */
```
没有这段注释 = 组件没设计完，不准提交。

**D. 完工自检（写完组件后必做）**

1. `node tests/validate.js` 必须 exit 0（含 §0.8 检查）。
2. 浏览器打开，**测量相邻 `[data-present-step]` 实际间距**：若容器有自己的 gap，间距应等于 gap；若直接挂在 `<section>` 下，间距应等于 `--rhythm-step`。任意一项不符则有双重 margin。
3. 进入演示模式，逐 step 翻一遍，确认每个 step 居中、内容不溢出。
4. 切深色模式过一遍。

**E. 演示水平安全区（强制）**

- 桌面演示内容必须继承共享 `--present-side-gap: 80px`；文章 inline CSS **禁止把它缩小**来换取更多宽度。
- 左右翻页按钮占用视口两侧 `12–56px` 区域；默认内容边界从 `80px` 开始，因此与按钮保留 `24px` 安全距离，并位于浮动标题的 `56px` 边界以内。
- 内容过密时先压缩卡片 padding / gap；达到下述字号下限仍放不下就拆页，不得继续缩字，也不得通过 `--present-side-gap: 32px` 等方式侵入按钮点击区。
- 完工时逐页测量：`active.left >= prev.right` 且 `active.right <= next.left`；中英文、亮暗主题都必须成立。手机演示与录制比例由共享样式自行调整，不在单篇文章覆盖该变量。

**F. 自定义可视化字号下限（强制）**

- 阅读模式：承载事实、机制、边界或说明的信息正文不得小于 `0.82rem`；结构标签不得小于 `0.72rem`。
- 演示模式：信息正文不得小于 `0.76rem`；结构标签不得小于 `0.7rem`。低于 `0.7rem` 只允许用于 P1、序号、短代码等不超过约 12 个字符的微型标记。
- 同一组件必须明确区分标题、正文、标签与短码四级，不得为了塞进一页把所有文字一起缩小。达到字号下限后仍溢出，按信息边界拆成多个 `data-present-step`。

**G. 演示 Surface Contract（强制）**

任何自定义容器（包括架构图、流程图、地图、board、canvas、配置面板、计算器输入面板、结果面板）的**根容器本身**只要带有阅读模式外框（`background / border / border-radius / box-shadow / backdrop-filter`），并且该根容器直接携带 `data-present-step` / `data-present-substep` 晋升为整页 slide，就必须在**同一个元素**显式选择 surface。**类名不构成豁免**：`.tool-panel`、`.roi-panel`、`.workspace` 等业务命名与 `.architecture`、`.diagram` 接受完全相同的检查。

- `data-present-surface="unframed"`：外框只是阅读模式容器 chrome。共享演示 CSS 自动移除背景、边框、圆角、阴影与 backdrop filter；内部节点、卡片和数据编码不受影响。架构图、流程图、配置面板、计算器面板和内容组合图默认选这个。
- `data-present-surface="board"`：根背景本身承载坐标轴、区域、拓扑或空间语义，演示时必须保留。象限图、棋盘、mesh/network board 仅在背景确实属于数据编码时选这个。

```html
<figure class="solution-architecture"
        data-present-step
        data-present-surface="unframed"
        data-step-title="Solution Architecture">
  <!-- Inner nodes keep their own semantic surfaces. -->
</figure>
```

规则与判据：
1. 新组件禁止再复制 `.is-presentation-mode .X.is-active { background: transparent; border: 0; ... }` 局部补丁；使用语义属性。旧文章的完整显式去框仅为迁移兼容。
2. 属性必须放在被晋升为 active step 的元素本身，不能放在后代节点。
3. `unframed` 实测时 active 根节点必须满足：透明背景、0 边框、0 圆角、无阴影、无 backdrop filter；`board` 必须说明背景承载的具体信息。
4. `tests/validate.js` Test 10 按 CSS 计算模型检查所有直接晋升的自定义根组件，不依赖类名关键词；有阅读外框却既无 surface 声明、也无共享框架管理或完整旧式去框时直接失败。

**H. 演示元数据多语言契约（新双语文章强制）**

新双语文章必须在根节点启用严格检查：

```html
<html lang="zh-CN" data-present-i18n="strict">
```

显式演示元数据以中文为默认值，英文放在 `-en` 属性；标题和标签分别成对出现：

```html
<div data-present-step
  data-step-title="配置流程特征"
  data-step-title-en="Configure Process Characteristics"
  data-step-label="04 / 配置"
  data-step-label-en="04 / Configure">
</div>
```

规则：
1. 禁止把英文同时复制到 `data-step-title` 与 `data-step-title-en`，也禁止只翻正文而漏掉演示浮动标题、页码菜单和 PPT 导出标题。
2. 默认 `data-step-title` / `data-step-label` 必须包含中文语义；英文分别放进 `data-step-title-en` / `data-step-label-en`。
3. 产品名、缩写或代码若跨语言确实不变，在同一 step 上声明 `data-present-i18n-invariant="title"`、`"label"` 或 `"title label"`；不允许用“内容一样”作为无声明漏译。
4. Accordion 自动标题仍来自 `.subsection-toggle > span`，因此该 span 的 `data-zh/data-en` 同样必须完整。
5. 完工时在中文和英文各遍历一次演示页；检查浮动标题、章节标签、页码菜单与导出标题，而不只检查 slide 正文。
6. `tests/validate.js` Test 11 对带 `data-present-i18n="strict"` 的文章执行硬检查。

### 0.9 自治原则 — Tech Decisions Are Mine

Boss 只关心**内容与业务**。技术问题（CSS 选择器范围、是否抽共享、是否扩 validate、组件契约位置）一律由我决策并落实到全局规则/instructions/memory/test，**不反问 boss**。当 boss 给出技术反馈时，我必须：
1. 解决眼前 bug；
2. 判断是单文章问题还是模式问题；
3. 若是模式问题，立刻把修复固化到 `assets/article.css` / `.github/instructions/` / `tests/validate.js` / repo memory；
4. 输出"做了什么 + 边界"一句话总结，不需 boss 批准。

### 0.10 双语覆盖契约 — Full-Body Bilingual Wrapping

> 默认所有新文章按本规范产出**全文双语**；旧文章在被 boss 显式重访时升级。
> 参考实现：[posts/agentic-sales-mobile-proposal/index.html](../../posts/agentic-sales-mobile-proposal/index.html)（495+ `data-en` 覆盖 hero/段落/列表/卡片/Eyebrow/Metric label/Accordion 标题/Step 标题/参考列表）。

所有新双语文章的 `<html>` 必须同时声明 `data-present-i18n="strict"`，演示元数据按 §0.8-H 成对本地化。

**覆盖范围（必须全包）**：

| 元素类型 | 包装策略 | 示例 |
|---|---|---|
| Hero `<h1>` / `<h2>` / 副标题 `<p>` / eyebrow / button | 元素本身加 `data-zh` / `data-en` | `<h1 data-zh="..." data-en="...">` |
| Section `<h2>` + `.section-kicker` | 元素本身加 | `<h2 data-zh="..." data-en="...">` |
| `.subsection-toggle > span`（accordion 标题，**= present slide 标题**）| 在 `<span>` 上加 | `<span data-zh="..." data-en="...">` |
| Step 卡片 `<h3>` / `<h4>` / `.comparison-label` / `.metric-label` | 元素本身加 | `<h3 data-zh="..." data-en="...">` |
| 段落 `<p>`、列表项 `<li>`、`<dt>` / `<dd>` | 元素本身加；如内含 `<strong><code>` 等子标签，整段连同子标签一起翻译进 `data-en` 字符串 | `<p data-zh="..." data-en="...">` |
| Figure `<figcaption>`、`<img alt>`、`<button aria-label>` | 同上；`alt` 与 `aria-label` 直接写英文字符串而非 `data-en`（无切换需求） | `alt="English description"` |
| 表格 `<th>` / `<td>` 文本 | 元素本身加；表格结构稳定不变 | `<th data-zh="..." data-en="...">` |
| 参考列表条目 | 链接文本与说明文字都加 | `<a ... data-zh="..." data-en="...">` |

**翻译质量规范**：

- 英文采用 §0.1 已定义的 **paper-grade 语域**：陈述句、可证伪、无空话；禁用 colloquialism（"kill", "lock down", "the OG", "no one can…"）。
- 专有名词与产品名保持原文（Copilot Studio、Dataverse、Microsoft Entra、21Vianet、PPAC、APIM、OAuth 2.0 等）。
- 中文括号 `（）` 在英文里换成空格 + `(` + 内容 + `)`；中文逗号 `，` 换成 `, `；中文句号 `。` 换成 `.`；中文分号 `；` 换成 `; `；中文冒号 `：` 换成 `: `。
- 长破折号 `——` 译为 ` — `（spaced em dash）；中文顿号 `、` 译为 `, `。
- 引用文档命名保留官方英文名（不要把 "Microsoft Learn" 译成 "Microsoft 学习中心"）。
- Title case 规则与 §0.1 一致；正文与卡片说明用 sentence case。

**HTML 安全（详见 §"data-zh/data-en quote safety"）**：

- `data-zh` / `data-en` 属性值内禁止裸 ASCII `"`；如必须出现引号，用 `&quot;` 或 `'`。
- 属性值内可含 HTML 标签（`<code>`、`<strong>`、`<em>`），但所有标签必须闭合且不含 `"` 属性。
- 中文标点 `「」` `『』` 是合法字符可直接写；英文版改用 `"`（注意是 `&quot;`）或不带引号的直陈写法。

**验证**：

- 新文章在 PR 前 `grep -c 'data-en=' posts/{slug}/index.html` 应 ≥ 该文章 `grep -c 'data-zh='` 的 95%（允许极少数 navbar 中两者相同时不重复计）。
- `node tests/validate.js` 的 quote safety 检查必须 pass。
- 浏览器实测：进入文章 → 顶部语言切换到 EN → 滚到底部，目视无中文残留（专有名词、数字、代码块除外）。

**升级旧文章**：当 boss 让你 review 或扩展一篇旧文章时，把"补齐双语"作为本次工作的强制 sub-task；不允许只翻一半。

---

### 0.11 内容实质与递进深度契约（Substance & Progressive-Depth Contract）

> 起因：boss 2026-07-04 反馈站内文章「越来越言之无物、花里胡哨、不知所云」。§0.1 管句子、§0.7 管逻辑，本节管**实质与深度**——结构级硬约束，违反任一条即不合格、须重写。适用于所有 final-state 面向读者的设计 / 架构 / 方案文档。

**A. 需求驱动的起因，禁纠偏 / 心路历程**
- Final-state 公开文档的开篇必须走「业务需求 → 该需求对任何方案提出的属性要求 → 因此本设计如何满足」。**禁止**以「为什么不能用朴素做法 X」「为什么不能一次调用搞定」这类**反面纠偏 / 作者开发心路**立论——那是你的设计过程，外部读者代入不了。
- 判据（写完自查）：把开篇里的「朴素做法 / 反例」整段删掉，若剩下的论证垮掉，说明它是纠偏叙事——改写成正面的需求 + 属性要求。
- 「N 重失控风险 / 三个坑」式的问题铺陈，改写成「N 条必须满足的属性」正面表述；反例可作为某条属性的一句话佐证，但不得作为文章的起因骨架。

**B. 递进深度契约：每个非平凡子系统分四层，禁扁平并列**
1. **需求**：它满足哪条业务需求 / 解决什么问题；
2. **机制**：数据结构 + 关键流程，读者据此能复现；
3. **取舍**：选了什么、**否掉了哪个替代方案、依据是什么**（给判据，不只声明「我们用 X 而非 Y」）；
4. **代价与边界**：延迟 / 限制 / 触发条件 / 一个具体失败样例走查。
- 一条并列 flow-list、一排卡片**都不构成分层**。四层缺任一层即不合格。子系统设计权重越大，四层越要写足。

**C. 覆盖完整性对账**
- 宣称「架构 / 运行时 / 完整方案 / 设计」的文档，代码里**每个非平凡子系统**都必须按设计权重出现在正文。完稿前列出代码实际子系统清单，逐一对账：**禁止把多决策子系统压成一条 bullet 或一个 callout**。

**D. 实质地板（Substance Floor）**
- 每个 `<section>` 至少含一个**可证伪具体项**：真实数字（阈值 / 数量 / 实测延迟）、schema / 契约、或具体失败样例走查。整节只有「有界 / 若干 / 可用 / 更好 / 显著」而无一个落地数字或结构 = 不合格。

**E. 内容先于组件 + 装饰预算**
- 选任何卡 / 网格 / callout / 流程前，先一句话写出「它必须承载、而一段普通文字承载不了的信息」；写不出就用段落。禁为视觉节奏把段落切成不真正并列的卡。
- callout 必须含一个**改变读者认知模型的新事实**，不得只复述上一段做强调。
- 标题（h2 / h3 / strong）必须是**可证伪论断或精确名词短语**，禁口号金句（反例：「段段可回到记录」「任何 X 都必须 Y」这类无判据的漂亮话）。

**F. 完工自查（并入 §0.5 闸门）**
- 逐 section 追问：这节有没有 B 的四层？有没有 D 的具体项？标题是不是论断？**把所有卡 / callout / 渐变 / 图形装饰在脑中删掉后，正文的信息量还剩多少**？若「删掉装饰后所剩无几」，即为花里胡哨，重写。

---

## Script & CSS Loading

### CSS（`<head>` 内，inline `<style>` 之前）

1. `<link rel="stylesheet" href="../../assets/article.css" />`
2. `<link rel="stylesheet" href="../../assets/scrollbar.css" />`
3. `<link rel="stylesheet" href="../../assets/article-narration.css" />`
4. `<link rel="stylesheet" href="../../assets/article-diagram.css" />`
5. 仅文章特有的覆盖样式放在 inline `<style>` 中

- Include all dark mode CSS variants for **shared components** in `assets/article.css` — NEVER in inline `<style>`
- Dark mode rules for **article-specific** components (e.g., custom tag colors) go in inline `<style>`
- Narration UI styles (FAB capsule, settings panel, subtitle) in `assets/article-narration.css`
- Diagram styles (signal-map, mesh-board, quadrant-board) in `assets/article-diagram.css`

### JS（`</body>` 前，按此顺序）

必选脚本（**每篇文章都必须包含**，缺一即为 bug）：

1. `<script src="../../assets/article-common.js"></script>` — 滚动动画、手风琴、主题同步
2. `<script src="../../assets/article-presentation.js"></script>` — 演示模式
3. `<script src="../../assets/scrollbar.js"></script>` — 自定义滚动条
4. `<script src="../../assets/article-lightbox.js"></script>` — 图片灯箱
5. `<script src="../../assets/article-assistant.js"></script>` — AI 助手 FAB + 对话框

可选脚本（按需添加，放在 article-common.js 之前）：

- `<script src="../../assets/article-math.js"></script>` — KaTeX 公式渲染（仅数学类文章）

文章自身的 inline `<script>` 放在 article-common.js 之前。

### 新建文章后的检查清单

1. 运行 `node tests/validate.js` — 必须 exit 0
2. 用 `grep -L 'article-assistant' posts/*/index.html` 检查是否有遗漏脚本
3. 在浏览器中确认：阅读模式右下角出现 chat FAB（需本地 LLM 设置）
4. 进入演示模式 → hover capsule → 确认 settings / record / chat / narrator 四个按钮均可见

## Forbidden JS in Inline Scripts

`article-common.js` already handles the following — **NEVER** re-implement them inline:

- **Scroll-reveal**: IntersectionObserver for `.load-in` and `[data-reveal]`
- **Accordion toggle**: Click handlers for `[data-accordion]` `.subsection-toggle`
- **Nav link highlighting**: IntersectionObserver for `main section[id]` + `.nav-links a`
- **localStorage theme/lang sync**: `data-theme`, `lang`, `data-zh`/`data-en`, reading font
- **Load-in stagger delay**: Applying `transitionDelay` to `.load-in` elements

Inline scripts should contain ONLY article-specific logic (e.g., custom tab switcher for `[data-tabs]`, matrix filter, decision tree interactivity, data rendering).

## Shared Components — Canonical Markup

### Accordion (subsection)

```html
<div class="subsection-accordion">
  <article class="subsection-item" data-accordion>
    <button class="subsection-toggle">
      <span>Subsection Title Text</span>
    </button>
    <div class="subsection-content">
      <!-- content here -->
    </div>
  </article>
  <!-- more items... -->
</div>
```

Rules:
- The `+`/`-` icon is rendered by CSS `::after` on `.subsection-toggle` — **NEVER** add inline icon markup like `<span class="subsection-icon">+</span>`
- Use `data-accordion` attribute on each `.subsection-item` (required for JS binding)
- The toggle `<button>` contains a `<span>` with text only — no extra child elements
- To default an item open on page load, add `class="subsection-item is-open"`
- Numbering (e.g., `<span class="subsection-number">1</span>`) is optional and placed as a sibling span inside the toggle, before the title span

### Section structure

```html
<section id="section-id" class="section" data-reveal>
  <div class="section-head">
    <p class="section-kicker">01 / Section Label</p>
    <h2>Section Title</h2>
    <p>Optional description paragraph.</p>
  </div>
  <!-- section body: accordion, grids, cards, etc. -->
</section>
```

### Topbar & Navigation

```html
<div class="topbar load-in">
  <a class="home-link" href="../../" data-zh="←" data-en="←" aria-label="返回首页">←</a>
  <div class="brand">
    <span class="brand-mark"></span>
    <span data-zh="父级主题名" data-en="Parent Topic Name">父级主题名</span>
  </div>
  <nav class="nav-links" aria-label="页面章节导航" data-nav-pager>
    <a href="#section-id" data-zh="章节名" data-en="Section">章节名</a>
    <!-- one anchor per top-level <section id="..."> in main; bilingual via data-zh/data-en -->
  </nav>
</div>
```

Rules:
- `←` home link shows arrow only — no trailing text
- `.brand` 文本 = 文章在 `assets/knowledge-data.js` 中的父级主题名（**不是**文章标题），用 `data-zh/data-en` 包一层支持双语
- **章节导航必须用 `<nav class="nav-links" data-nav-pager>`**，且作为 `.topbar` 的直接子节点，不要再外包 `<div class="topbar-actions">`（演示按钮的 `topbar-actions` 由 `article-presentation.js` 自动注入）
- `data-nav-pager` 触发共享分页器（`assets/article-common.js`）：nav 永不横向滚动；放不下时尾部塞 `…` 翻到下一组，再次显示时首部出现 `…` 翻回。**禁止**为单文章再写一份分页 inline JS / CSS — 共享 CSS 见 `assets/article.css` `.nav-links[data-nav-pager]` + `.nav-ellipsis`，共享 JS 见 `article-common.js` 末尾「In-place chapter-nav pager」段
- 每个章节链接必须带 `data-zh` / `data-en`；`href` 指向 `<section id="...">`
- Presentation toggle / share dropdown / chat / narrator 等按钮由 `article-presentation.js` 动态注入到 topbar 末尾的 `.topbar-actions`，**严禁**在 HTML 里硬编码

### Full Page Skeleton

The complete nesting structure every article **MUST** follow (CSS classes that provide layout, background, and max-width):

```html
<body>
  <div class="page-shell">
    <div class="backdrop" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="orb orb-c"></span>
    </div>

    <div class="site">
      <header class="hero">
        <!-- .topbar goes here (see Topbar section above) -->

        <div class="hero-grid">
          <div class="hero-copy load-in">
            <span class="eyebrow">Kicker Text</span>
            <h1>Article Title</h1>
            <p>Article description paragraph.</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#section">CTA 1</a>
              <a class="button button-secondary" href="#section">CTA 2</a>
            </div>
          </div>

          <aside class="hero-panel load-in">
            <span class="panel-label">Panel Label</span>
            <h2>Key insight or thesis statement.</h2>
            <ul class="layer-list">
              <li><span class="layer-number">1</span>Point one</li>
              <li><span class="layer-number">2</span>Point two</li>
            </ul>
          </aside>
        </div>

        <div class="hero-metrics load-in">
          <div class="metric">
            <div class="metric-label">Label</div>
            <strong>Value</strong>
            <span>Description</span>
          </div>
          <!-- 2-4 metric cards total -->
        </div>
      </header>

      <main>
        <!-- sections go here -->
      </main>

      <footer>
        <p>&copy; 2026 illusion615's Knowledge Hub | 交互式 HTML 页面。</p>
      </footer>
    </div>
  </div>
  <!-- scripts go here -->
</body>
```

**Critical rules:**
- **NEVER** use `<div class="page-wrapper">` — always `<div class="page-shell">` → `<div class="site">`
- **NEVER** put hero inside `<main>` or use `<section class="hero">` — always `<header class="hero">`
- **NEVER** invent hero sub-classes like `hero-inner`, `hero-kicker`, `hero-sub`, `meta-chip`, `hero-meta` — use the canonical classes: `.eyebrow`, `.hero-copy`, `.hero-panel`, `.hero-metrics`, `.metric`, `.panel-label`, `.layer-list`
- `.backdrop` with `.orb` elements provides the animated background gradient spheres
- `<main>` contains only `<section>` elements; `<footer>` is a sibling of `<main>` inside `.site`

## Presentation Mode

- Default presentation steps are hero + each `.section`; use `data-present-step` and optional `data-step-title` only for custom slide granularity
- `article-presentation.js` automatically splits accordion sections into overview + detail steps
- Overview pages render subsections as a centered card grid (flex row-wrap, auto-fit ~3 columns) with only subsection number and title visible; `.subsection-content` is hidden; non-accordion siblings (`.paradigm-grid`, `.flow-list`, `.insight-grid`, etc.) are also hidden via `display: none !important`
- Hero may keep its in-flow title; content slides rely on the shared deck overlay for active step title
- Dense content (matrices, tables, stacked accordions) should be split into multiple `data-present-step` slides rather than shrinking type
- Section-head is automatically hidden in presentation mode for sections with nested `[data-present-step]` (CSS `:has()` rule); on overview pages the section-head description `<p>` is shown centered

### Accordion auto-split — how it works

When a `<section>` contains `[data-accordion]` items and does **NOT** have `data-present-step`:

1. **Overview step**: section itself becomes a step (`data-present-overview`); section-head description shown centered, accordion items rendered as cards (title only, collapsed)
2. **Detail steps**: each `.subsection-item[data-accordion]` becomes an independent step; `.subsection-toggle` is hidden; `.subsection-content` is force-displayed; title comes from the deck bar overlay

**NEVER** add `data-present-step` to a `<section>` that contains accordions — it skips the auto-split and renders the entire section as one oversized slide.

### Subsection content — writing for dual-mode readability

Content inside `.subsection-content` must work in both reading mode (narrow column) and presentation mode (full viewport slide). Follow these rules:

#### Structured fields pattern (e.g., AI Radar event cards)

When subsection content has ≥3 labeled field blocks, use the `.event-field` + `.event-field-label` + `.action-box` pattern:

```html
<div class="subsection-content">
  <div class="event-meta"><span class="event-tag event-tag-model">Tag</span></div>
  <div class="event-field">
    <div class="event-field-label">FIELD LABEL</div>
    <p>Field content text.</p>
  </div>
  <!-- more event-field blocks... -->
  <div class="action-box">
    <div class="event-field-label">ACTION LABEL</div>
    <p>Action content.</p>
  </div>
</div>
```

Presentation mode auto-layouts these as a **2-column grid** (collapses to 1-col below 900px):
- `.event-meta` spans full width (top)
- First `.event-field` spans full width (primary description)
- Remaining fields flow into 2 columns
- `.action-box` spans full width (bottom), with distinct background

#### Rich component pattern (most knowledge articles)

When subsection content uses structured components (`.comparison-grid`, `.insight-grid`, `.flow-list`, `.layer-list`), **no special treatment needed** — these components already have responsive grid layouts that work at any width.

**Symmetric grid layout rule** (applies to `.insight-grid`, `.comparison-grid`, and any card grid):
- Card count per grid MUST produce balanced rows: use **2, 3, 4, or 6** cards. NEVER use 5, 7, or other counts that leave an orphan card on the last row.
- If the content naturally has 5 points, either merge two related points into one card, or split one point into two to reach 4 or 6.
- Presentation mode caps `insight-grid` to 3 columns. Design card content accordingly — card text should be ≤ 3 lines of body copy.
- When a grid appears directly inside a `<section>` (not inside accordion), it shares the same presentation slide as the `section-head`. Keep it to 3 cards max so it doesn't crowd the page title.

**Subsection content density rule** (progressive disclosure per slide):
- Every accordion subsection should open with a **1-sentence summary** `<p>` (the top-level takeaway), followed by **structured detail** (cards, flow-list, table).
- NEVER put a single long `<p>` as the only child of `.subsection-content`. If the information cannot be structured, break it into 2-3 short paragraphs with `<strong>` lead-ins.

#### Pure prose pattern (avoid in subsections)

**Do NOT** put long unstructured paragraphs directly inside `.subsection-content`. In presentation mode they render as a wall of text with no visual hierarchy. Instead:
- Break into labeled field blocks (`.event-field` pattern)
- Or use structured components (`.insight-card`, `.comparison-grid`)
- Or split into multiple accordion items, each focused on one point

### Title hierarchy in presentation mode

The deck bar overlay (top-left of viewport) shows:
- **Label** (`data-step-label`): section kicker (e.g., "01 / AGENT PLATFORMIZATION")
- **Title** (`data-step-title`): subsection title or section title

**NEVER** duplicate the deck bar title inside the slide content. Specifically:
- Do NOT inject `.present-inline-head` into accordion items — the deck bar handles it
- Do NOT add redundant `<h2>` or `<h3>` inside `.subsection-content` that repeats the toggle title
- Overview cards show only the `.subsection-toggle span` text — do NOT add extra title elements

### TTS narration considerations

Content text is extracted and sent to LLM for narration script generation, then spoken via Web Speech API. Write content with TTS in mind:
- Numbers with units: write `2.7%` not `百分之二点七` — the TTS preprocessor handles conversion
- Avoid bare decimal numbers without context (e.g., `2.7` alone) — always pair with unit or description
- Use full-width punctuation in Chinese content for natural speech pauses
- Keep individual subsection content under ~800 characters for optimal narration chunk sizing

## Other Rules

### Post-design presentation review checklist

After completing an article, review **every presentation slide** (each `data-present-step` and each accordion subsection) against these criteria before declaring it done:

1. **One slide = one idea**. If a slide shows both a card grid AND an accordion, split them into separate steps or move the cards into an accordion subsection.
2. **No content overflow**. Each slide must fit within the viewport without scrolling. If content overflows, either reduce text or split into more slides.
3. **Symmetric card grids**. Card counts must be 2, 3, 4, or 6 — never 5 or 7. In presentation mode, max 3 columns.
4. **No bare text walls**. Every subsection-content must open with a 1-sentence summary, followed by structured components (cards, flow-list, table). Never a single long `<p>` as the only child.
5. **Non-accordion content inside `<section>` must be inside a `subsection-accordion`**. Standalone `<div class="insight-grid">` directly under `<section>` will merge with the section overview slide and crowd it. Wrap it in an accordion item instead.

- Use semantic section structure: `.section` with `data-reveal`, `.section-head` with `.section-kicker`
- Footer format: `© 2026 illusion615's Knowledge Hub | 交互式 HTML 页面。` — 统一使用项目名，不放文章标题
- Reference list uses `.bib-list` class with `.bib-id`, `.bib-author`, `.bib-note` structure
- External links with `target="_blank"` must include `rel="noopener noreferrer"`
- No inline `style=""` attributes on HTML elements — use classes or inline `<style>` block
- **`data-zh` / `data-en` 属性值中禁止出现未转义的 ASCII 双引号 `"`（0x22）**，否则会被 HTML 解析器当作属性结束符，导致 `data-en` 文本泄漏到页面。
- 属性值里如果需要引号，统一写 `&quot;...&quot;`（推荐）或改写为不带引号的自然语句；不要依赖自动替换成弯引号。

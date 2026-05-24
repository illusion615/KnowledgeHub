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
- 禁用空话：「不是 X 而是 Y」「真正的…」「最关键的…」「全方位」「极致」「赋能」等。每个论断必须可量化或可证伪。
- **措辞体例 = 论文体陈述句**。文章正文（含 hero、editorial stance、frontier-callout、stream lead、quote-block、principles 正例/反例、open-question 描述、decision 列表项）一律使用陈述式专业表达，禁止以下口语化比喻与自造术语：
  - **口语化禁用词**：钉死 / 写死 / 锁死 / 活体 / 祖师爷 / 最热 / 试水 / 噩梦 / 笔墨 / 住址 / 栖息 / 大脑+手脚 / 有人觉得X有人觉得Y / 没人讲清楚 / 没人攻 / 不要再争 / 认真做 / 代码乱炖 / 它记得我。
  - **自造术语禁用**：「可预测性契约」类自造复合词；优先复用已有学术词汇（Mixed-Initiative、schema、structured outputs、runtime confidence、mode switching cost、affordance、定义权归属、向前兼容、合规审计）。
  - **改写范式**：「X 怎么定义 / 谁定义」→「X 的定义权归属 / 演进策略尚无定论」；「用户怎么知道」→「用户如何形成对……的认知」；「做不好就落后」→「缺失即落后」；连串疑问句 → 一句陈述 + 一条判据。
  - **副词收敛**：「最 / 极 / 最深刻 / 无限」必须配可证伪锚点（"引用最广泛"／"工程化程度最高"），否则删除。
  - **stance bullet 不得伪装大纲**：editorial-stance / decision 等"立场列表"的每一条必须是可证伪论断，不是目录条目。
- 量化数据必须带测量条件或显式声明缺失，不要用模糊比较代替绝对数。
- 引用必须给到具体来源（arxiv ID、Microsoft Learn URL、官方 doc URL），并说明每条来源支撑文中哪句论断。
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

### 0.5 完工闸门（顺序不可调）
1. `node tests/validate.js` 必须 exit 0，warnings 数量不得新增（基线 14 条无关 WARN）。
2. `assets/knowledge-data.js` 的 `summary.zh ≤ 100` 字符、`summary.en ≤ 160` 字符。
3. 用 built-in browser 打开本文，**逐 section 截图**，确认无 grid 孤儿、无文字溢出、暗色/亮色都正常（详见 `/memories/boss-guardrails.md` 的 Post-Edit Browser Verification）。
4. 完成前再回头扫一遍 §0.1–§0.4 自检。

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
2. **主线唯一**：全文只允许一条主线（流程 / 对比 / 决策 / 角色×阶段 / 时间轴 / 案例 / FAQ 之一）。其余信息是支线，进 accordion。
3. **承接成链**：每章的"产出"应是下一章的"输入"。intro 段显式说一句"上一章我们 X，本章把 X 变成 Y"。
4. **References 永远在最后**。

**C. 单章节三件套契约**
每个 `<section>` 的 `.section-head` 必须能回答：
- **kicker** = 章节代号（"01 / Section Label"）
- **h2** = 这一章的*结论或承诺*（动宾或判断句，不是干巴巴的名词短语）
- **intro `<p>`** = 一句话说明读完本章读者能做什么决定 / 拿到什么产出，并显式承接上一章

**D. Hero 对账**
hero `.hero-metrics` 抛出的每个 metric、`.hero-panel .layer-list` 抛出的每个要点，都必须在正文里被一个 section 兑现。完稿后逐一对照，未兑现的要么删 hero、要么补正文。

**E. 完稿"一句话回放"自检**
用一句话复述每个 section 的主张，串起来读一遍。如果读起来跳跃、缺环、或顺序倒过来也说得通，结构就不及格，必须重排。

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

### 0.9 自治原则 — Tech Decisions Are Mine

Boss 只关心**内容与业务**。技术问题（CSS 选择器范围、是否抽共享、是否扩 validate、组件契约位置）一律由我决策并落实到全局规则/instructions/memory/test，**不反问 boss**。当 boss 给出技术反馈时，我必须：
1. 解决眼前 bug；
2. 判断是单文章问题还是模式问题；
3. 若是模式问题，立刻把修复固化到 `assets/article.css` / `.github/instructions/` / `tests/validate.js` / repo memory；
4. 输出"做了什么 + 边界"一句话总结，不需 boss 批准。

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

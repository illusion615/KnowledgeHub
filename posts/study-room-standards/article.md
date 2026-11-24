---
title: Knowledge Hub 内容治理规范
eyebrow: Content Governance
brand: Knowledge Hub
date: 2026-04-13
strict_i18n: false
strict_density: true
lead: 本规范是 Knowledge Hub 项目的单一权威设计标准，涵盖研究选题、内容撰写、渐进式布局、组件使用、演示模式和质量审核六个维度。所有新文章创建和现有文章修改均以此为准。
hero_actions:
  - "查看布局规范 | #layout"
  - "查看组件库 | #components"
panel_label: 技术栈约束
panel_title: 纯静态 HTML，零构建依赖
panel_desc: 所有内容为自包含的 HTML 页面，通过 GitHub Pages 直接发布。无框架、无构建步骤、无 npm。
panel:
  - Vanilla JS（禁止箭头函数）
  - CSS Custom Properties 主题化
  - Google Fonts 唯一外部依赖
  - 知识树数据单一源 knowledge-data.js
metrics:
  - "共享资产 | 10 | article.css (3,029行) + 6 个文章 JS 模块 + 4 个首页专属模块"
  - "审核维度 | 9 | 架构一致性、重复度、命名、错误处理、可测试性、性能、安全、设计语言、文档健康"
  - "规范版本 | v1.1 | 2026-04-13 补充首页模块架构、更新脚本加载规范"
style:
  accent: "#14b8a6"
---

## #research 01 / Research Standards :: 研究规范

每篇文章的质量上限由研究深度决定，选题、引用与修辞规则共同确保所有内容具备可验证的事实基础。

:::accordion
::panel { open: true }
### 1.1 选题与定位
- **明确受众** — 每篇文章开始前确定目标读者：技术决策者、工程师、还是业务人员。受众决定了深度和术语密度。
- **价值判定** — 选题必须回答"读完后读者能做什么之前做不了的事？"如果答案是"了解"而非"行动"，需要补充可操作的框架或决策指南。
- **时效性标注** — 涉及产品功能、价格、配额的内容必须标注数据截止日期（如 "截至 2026 Q1"），产品迭代快于文章更新。

::panel
### 1.2 证据与引用
- **每个外部事实锚点必须有参考来源** — 框架特性、模型规格、算法原理等第三方声明必须出现在参考列表中，附注说明该引用在文章中支持什么论点。
- **量化声明必须带测量条件** — 硬件、配置、冷/热启动、步数、分辨率。"23GB→6GB"必须注明"12B × 2 bytes bf16 ≈ 23GB, 4-bit 量化后 ≈ 6GB"。
- **禁止模糊对比** — "显著落后"、"明显加速"、"接近"必须替换为比率或绝对值。示例：~11× gap, ~2× speedup, ~55s vs ~5s。
- **引用格式** — 使用 `.bib-list` 有序列表，包含 `.bib-id`、`.bib-author`、`.bib-note`。链接使用 arxiv ID、GitHub URL 或官方文档。

::panel
### 1.3 写作禁令
Forbidden

**禁止的修辞模式**

- "不是X而是Y"、"真正的…"、"最关键的…"
- "如果只保留一句话"
- 自指元文本："这篇文章不再把…"
- 叙事式标题："先把模型塞进目标硬件"

Required

**正确的替代方式**

- 使用量化或可证伪的陈述
- 标题直接概括内容："4-bit DiT 量化：23GB→6GB"
- 声明数据缺口而非模糊回避
- 用 Evidence → Claim → Implication 结构
:::

## #writing 02 / Writing Standards :: 撰写规范

知识库文章采用结构化的交互式知识页面形态（有别于传统单向博客），从 16 篇现有文章中提炼出统一页面骨架与注册格式。

:::accordion
::panel { open: true }
### 2.1 文章骨架
1. **HTML Head** — 加载 Google Fonts（Noto Sans SC + Space Grotesk）→ 引入 article.css + scrollbar.css → 文章特定样式放 inline <style>
2. **Hero Section** — topbar（← 返回首页 + 品牌名=父主题 + 导航链接）→ hero-grid（hero-copy + hero-panel）→ hero-metrics（3 列关键指标）
3. **Main Content** — N 个 <section>，每个包含 section-head（kicker + h2 + 描述）+ 内容组件。编号格式："01 / English Label"。
4. **References Section** — 放在 <main> 之外，使用 .bib-list。每条引用必须有 .bib-note 说明支持文章的哪个论点。
5. **Footer + Scripts（严格加载顺序）** — © 行 → `article-common.js`（自动处理 scroll-reveal、accordion、nav 高亮、localStorage 同步——禁止内联脚本重复编写）→ 文章专有 inline script（仅自定义交互）→ `article-presentation.js` → `scrollbar.js`

::panel
### 2.2 双语与主题支持
- **双语属性** — 所有用户可见文本使用 `data-zh` / `data-en` 属性。JS 在 DOMContentLoaded 时根据 `localStorage.getItem('lang')` 切换。
- **暗色模式** — 使用 `[data-theme="dark"]` CSS 选择器。所有自定义组件必须提供暗色变体。文章特定的暗色样式放在 inline <style> 中。
- **主题自动继承** — 文章页通过 JS 读取 `localStorage` 中首页设置的 theme 和 lang，自动应用。不需要用户手动切换。

::panel
### 2.3 知识树注册
- **唯一数据源** — 所有文章元数据在 `assets/knowledge-data.js` 的 `knowledgeTree[]` 数组中注册。
- **必填字段** — id, parentId, type:'article', title:{zh,en}, summary:{zh,en}, tags, date, url, color, phase, speed。
- **关联关系** — `relations: ['other-id']` 用于建立文章间的可视化连线。
- **品牌名** — 页面左上角 `.brand` 文本必须与 knowledge-data.js 中父主题的 label 一致。
:::

## #homepage 03 / 02b / Homepage Module Architecture :: 2b. 首页模块化架构

首页 index.html 经 2026-04-13 架构重构后从 5,608 行降至 3,686 行。核心布局引擎提取为独立模块，通过显式接口与宿主通信。

:::accordion
::panel { open: true }
### 首页脚本加载顺序
1. **scrollbar.js + knowledge-data.js** — 基础增强和唯一数据源。knowledgeTree[] 全局数组供所有布局使用。
2. **color-schemes.js + pan-zoom.js + infographic-view.js** — 配色方案数据、统一平移缩放控制器、弧线轮盘引擎。均为全局函数/变量。
3. **index.html 内联 <script>** — DOMContentLoaded 内：树工具函数 → Galaxy → Cards → Cell（调用 PanZoomController）→ 设置面板 → 搜索。
4. **cell-game.js** — 自包含 IIFE，DOMContentLoaded 后自初始化。仅在 Cell 布局下可启动。

::panel
### 模块接口契约
| 模块 | 接口 | 依赖 |
| --- | --- | --- |
| `pan-zoom.js` (183行) | `PanZoomController(container, camera, opts)` | 全局 clampNumber, getTouchCenter, zoomCameraAt, anchorCameraToTouch |
| `infographic-view.js` (1,056行) | `renderInfographicViewModule(ctx)`，ctx 含 13 个命名依赖 | 全局 colorSchemes |
| `cell-game.js` (540行) | IIFE 自初始化，DOM ID 获取元素 | 全局 currentLayout, window._cellGameActive |
| `color-schemes.js` (24行) | 全局 var colorSchemes 数组 | 无 |
:::

## #layout 03 / Layout Standards :: 渐进式布局规范

文章使用渐进式信息披露设计——用户滚动时内容逐步展开，而非一次性呈现所有信息。

:::insight-grid { cols: 3 }
::card 原则 1
### 滚动揭示
所有 `.section` 使用 `data-reveal` 属性触发 IntersectionObserver。元素进入视口时添加 `.is-visible` 类，驱动淡入动画。Hero 元素使用 `.load-in` 类。

::card 原则 2
### 折叠深度
复杂主题使用 accordion（`.subsection-accordion`）折叠详细内容。默认只展开第一项（`.is-open`），用户按需展开其余项。每个 accordion 项是独立的知识单元。

::card 原则 3
### 内容密度自适应
`.insight-grid` 使用 `repeat(auto-fit, minmax(240px, 1fr))`，根据卡片数量自动排列——3 张排 3 列，4 张排 4 列。`.card-index` 使用胶囊形（`min-width + padding`），短文本圆形、长文本自动展宽。
:::

:::comparison
::versus Required
### Hero 布局
`.hero` 使用 `justify-content: flex-end`——内容靠底部对齐，留白在顶部。`.hero-grid` 使用 `align-items: end`——左右两栏底部对齐。metrics 紧贴 hero-grid 下方。

::versus Required { highlight: true }
### Section Head
`.section-head` 无 max-width 约束——标题自然展开不换行。section-kicker 格式："01 / ENGLISH LABEL"。h2 紧跟其后，描述段落使用 `var(--muted)` 颜色。
:::

## #components 04 / Component Library :: 共享组件库

公共视觉组件统一定义在 `assets/article.css` 中供所有文章复用；选择组件时应根据内容性质匹配，而非机械套用。

:::accordion
::panel { open: true }
### 4.1 卡片与网格
| 组件 | 适用场景 | 关键类 |
| --- | --- | --- |
| 洞察卡片 | 并列的独立要点（3-4 项） | `.insight-grid` + `.insight-card` + `.card-index` |
| 对比卡片 | 两个方案的 Before/After 对比 | `.comparison-grid` + `.comparison-card` + `.next` |
| 模式卡片 | 设计模式或策略展示 | `.pattern-grid` + `.pattern-card` + `.pattern-type` |

::panel
### 4.2 列表与流程
| 组件 | 适用场景 | 关键类 |
| --- | --- | --- |
| 流程列表 | 有序的步骤流程 | `.flow-list` + `.flow-step` + `.flow-copy` |
| 层级列表 | 带编号的层级概念 | `.layer-list` + `.layer-number` |
| 引用列表 | 条目式说明 | `.reference-list` |
| 挑战列表 | 问题或陷阱罗列 | `.challenge-list` |

::panel
### 4.3 折叠与引用
| 组件 | 适用场景 | 关键类 |
| --- | --- | --- |
| 手风琴 | 多个深度子主题 | `.subsection-accordion` + `.subsection-item` + `[data-accordion]` |
| 引用块 | 关键判断或总结 | `.quote-block`（含 `margin-top: 18px`） |
| Tab 面板 | 多视角对比 | `.tab-shell` + `.tab-list` + `.tab-panel` |
| 参考文献 | 文末引用列表 | `.bib-list` + `.bib-id` + `.bib-note` |

::panel
### 4.4 共享 JS 模块
| 模块 | 行数 | 职责 |
| --- | --- | --- |
| `article-common.js` | 485 | scroll-reveal、accordion toggle、nav 高亮、localStorage 主题/语言/字体同步 |
| `article-presentation.js` | 4,489 | 演示模式：步骤收集、deck overlay、PPT 导出调度、分享按钮 |
| `article-lightbox.js` | 63 | 图片点击放大灯箱 |
| `article-assistant.js` | 708 | LLM 辅助阅读：摘要、追问、内容解释（需连接 LLM Provider） |
| `pptx-export.js` | 722 | PptxGenJS 几何渲染器（v5）：度量契约 R1/R2，逐视觉行发射，含密度上报 |
:::

## #presentation 05 / Presentation Standards :: 演示模式规范

每篇文章自动支持全屏演示模式和 PPT 导出，步骤收集、视口拆分与几何导出约束共同保障跨文章演示体验一致。

:::accordion
::panel { open: true }
### 5.1 步骤收集逻辑
1. **Hero → 第一页** — Hero section 自动成为第一个演示步骤，保留原有标题和布局。
2. **Section → 默认步骤** — 每个 `.section` 默认成为一个步骤。若 section 内有 `[data-present-step]` 子元素，则拆分为多个步骤。
3. **Accordion → 总览 + 详情** — 含 accordion 的 section 自动生成：(1) 总览页——描述居中显示，子章节渲染为水平卡片网格（auto-fit 3 列），仅显示编号和标题，section 内其他非 accordion 内容（如对比卡片、流程列表）自动隐藏；(2) 每个 accordion 项作为独立详情页。总览页由 `data-present-overview` 属性驱动，布局采用 flex row-wrap 垂直居中。
4. **References → 最后一页** — `<main>` 之后的 `.section`（如 references）也会被收集为演示步骤。

::panel
### 5.2 密集内容拆分规则
- **视口适配** — 每个步骤的内容必须在单个视口中舒适展示。如果超出，JS 自动标记 `.is-step-overflowing` 并切换为顶部对齐滚动。
- **手动拆分** — 对于 4+ 卡片的 insight-grid、多个 timeline-card、verdict-box 等密集内容，用 `<div data-present-step data-step-title="..." data-step-label="...">` 包裹拆分为多个步骤。包裹 div 在普通滚动模式下透明，仅在演示模式下生效。
- **禁止缩小字号** — 不要通过缩小字体或压缩 padding 来强制内容适配视口。应拆分为多个步骤。
- **Deck 标题** — 演示模式的左上角 deck 显示 step-label（section kicker）和 step-title（子节标题）。Accordion 步骤只显示子节标题（section 上下文已在 label 中）。

::panel
### 5.3 PPT 导出约束
- **逐页激活** — 导出时 JS 逐页调用 `setPresentationStep` 确保内容可见后再提取文本。否则隐藏元素的 `innerText` 返回空字符串，导致 PPTX 损坏。
- **原生对象渲染** — 使用 PptxGenJS 生成可编辑的文本框/形状，不截图。渲染器不识别 CSS class 名，而是读取演示态元素已渲染的几何（`getBoundingClientRect` + `getComputedStyle`），按背景层 → 文本层 → 图片层三趟重放到 13.333×7.5in 画布。
- **度量契约（v5，两条规则须同时成立）** — **R1 声明字体必须等于测量字体**：导出声明的字体取自元素实际渲染的字族（`FONT_STACK`），不得重映射为其他字体，否则消费端按不同度量重新断行、单行框变两行并压住下方内容。**R2 一行一个文本框**：按 `Range.getClientRects()` 逐视觉行发射并关闭自动换行，消费端不再做任何断行决策。
- **新增字体时** — 若 `article.css` 引入新字族，必须同步加入 `pptx-export.js` 的 `FONT_STACK`，否则该文本回退到 BODY 字体并重新换行（违反 R1）。
- **两趟共用同一矩形** — 背景层与文本层必须由同一个 `getBoundingClientRect()` 推导。曾尝试按估算基线单独校正文本位置以对齐行内 `<code>` 标签，结果文字与其背景色块分离，反而更糟。行内盒之间的亚像素基线差异可以接受，图层错位不可接受。
- **新增组件时** — 无需改动 `pptx-export.js`。几何渲染是通用的，任何新 CSS 组件或定制版式都会自动导出。
- **密度只报告、不自动纠正** — 填充率低于 40% 或超过 100% 的步骤由 `getOverflowReports()` 上报。稀疏页的正解是**合并相邻步骤或补一个视觉元素**（图表、示意图、配图），而非把文字放大填满版面——后者既是 AI 生成感的典型特征，也会让 PPT 与网页不一致，破坏几何重放前提。
- **不使用装饰性色条** — 页眉横条、侧边竖条、卡片单边描边等纯装饰元素不承载信息，且是自动生成 deck 的典型特征。标题区与正文之间用**留白**分隔，章节归属由标签文字本身建立。导出器已移除原先标题上方 2.4in 的橙色横条。
- **懒加载图片须预先解码** — 导出时步骤在屏幕外测量，`<img loading="lazy">` 若从未进入视口就不会被加载，`currentSrc` 为空，**图片会静默从 deck 中消失**（网页上滚动到时正常显示，因而隐蔽性高）。`article-presentation.js` 在几何捕获前统一清除 lazy 标记并 `await decode()`，使导出结果与读者滚动位置无关。
- **图片必须同源** — 导出时 PptxGenJS 用 XHR 逐张拉取图片写入 pptx，跨域图片被 CORS 拒绝。而 `<img>` 标签不受此限制，**网页上完全正常、导出却整篇失败**。渲染器现已改为跳过并上报（`getSkippedImages()`），但规范做法是**把外链图片下载到文章自己的 `media/` 目录并改为相对路径**。canvas 转码同样不可行——绘制跨域图会污染 canvas，`toDataURL()` 随即抛错。
- **已知失真** — CSS 渐变、`box-shadow`、`filter`、`backdrop-filter` 会被拍平为纯色；伪元素 `::before`/`::after` 不捕获；`canvas`/`video` 跳过。`<svg>` 需由调用方填充祖先元素的 `data-svg-png` 属性才能导出。逐行发射意味着换行的段落在 PowerPoint 中需逐行编辑——保真度优先于导出后的编辑便利。
:::

## #audit 06 / Audit Standards :: 审核规范

基于 9 维度 ABCD 评分框架，定期审查代码和内容质量。

:::accordion
::panel { open: true }
### 6.1 审核维度与评分
| 维度 | A 级标准（本项目语境） |
| --- | --- |
| 架构一致性 | 所有文章遵循统一骨架结构，共享 CSS/JS 无内联重复代码 |
| 代码重复度 | 无 >10 行的相似代码块，组件级与文章级样式清晰分离 |
| 命名与可读性 | CSS 类名语义一致（如 .insight-card, .comparison-grid），无魔法数字 |
| 错误处理 | JS observer/handler 有 null 检查，外部链接有 rel="noopener noreferrer" |
| 可测试性 | 通过浏览器 DevTools 可验证暗色模式、演示模式、PPT 导出 |
| 性能 | 无不必要的 JS 重复计算，IntersectionObserver 使用 unobserve 释放 |
| 安全 | 外部链接 target="_blank" 配 rel="noopener noreferrer" |
| 设计语言 | 组件使用一致，暗色模式完整覆盖，responsive 适配到位 |
| 文档健康度 | 知识树注册完整，references 有 .bib-note，规范文档与现行代码同步 |

::panel
### 6.2 红线规则
- **Hero 空白页 bug** — IntersectionObserver 选择器必须包含 `.load-in`，否则 hero 永远透明。每次新建文章后必须验证。
- **PPT 导出损坏** — 导出循环中未逐页激活步骤会导致空内容 → PPTX 格式错误。修改 step 收集逻辑后必须测试导出。
- **演示模式内容泄露** — `<main>` 外的 section 必须被 JS 收集到 topLevelContainers 中，否则在演示模式下不受隐藏控制。
- **CSS :has() 选择器** — 使用 `.section:has([data-present-step])` 而非兄弟选择器（`~`），因为目标元素通常嵌套在 wrapper 内。

::panel
### 6.3 审核频率与输出
- **触发条件** — 每新增 5 篇文章或每月审查；共享 CSS/JS 重大变更时立即审查；首页架构重构后必须专项审查。
- **输出物** — 审查报告作为文章发布，包含 9 维度评分和改进建议。重构类审查应包含"重构执行记录"小节以记录完整的验证结果。
- **行动项跟踪** — D 级评分项立即修复；C 级项在 2 个迭代内修复；B 级项择机优化。
- **基线数据** — 当前基线（2026-04-13）：32 篇文章、index.html 3,686 行、article.css 3,029 行、4 个首页模块。
:::

## #references 08 / References :: 参考来源

- [1] Knowledge Hub Project. | 项目全局约定：技术栈、文件结构、编码规范、禁止模式的权威定义。
- [2] Knowledge Hub Project. | 文章页专用规则：CSS 引用、暗色模式、演示模式、footer 格式等。
- [3] Knowledge Hub Project. | 共享组件库样式源码：25+ CSS 组件类的样式定义和暗色模式变体。
- [4] Knowledge Hub Project. | 演示模式的核心逻辑：步骤收集、accordion 总览、PPT 导出调度。
- [5] Knowledge Hub Project. | 文章公共初始化脚本。所有文章必须首先加载，禁止 inline 重复其功能。
- [6] Knowledge Hub Project. | 首页架构审查与重构报告。Section 2b 的依据来源。

# Study Room 文章 Markdown 原生保存、看板 Docs 在线编辑与动态 HTML 框架展示可行性评估

**评估结论定性：核心设想可行，但不能采用「纯浏览器运行时拉取 `.md` 全面替代静态 HTML」的单轨方案；推荐采用「以 `.md` 为唯一人工编辑真源 + 轻量双模渲染管线 + 存量 HTML 与增量 Markdown 双轨共存」的演进路线，跨越 5 个关键工程阻碍后可平稳落地。**

针对将 Study Room 文章还原为 Markdown 格式保存、在交付看板 `Docs` 视图直接查看与编辑、借助 HTML 框架提供丰富展示与交互体验，并在发布后让外部 GitHub Pages 页面实时更新的设想，本报告基于当前仓库 `posts/`、`assets/`、`docs/`、`tests/` 及交付看板文档底座的真实代码开展盘点与工程边界推演。

---

## 1. Study Room 现有文章与 Markdown 管线现状盘点

盘点仓库真实目录与架构组件定义后，当前内容资产和前端运行时的定量基线如下：

| 盘点维度 | 仓库实测数据 | 关键文件与代码证据 |
| :--- | :--- | :--- |
| `posts/` 顶层目录总数 | 162 个子目录 | 161 个含 `index.html`，仅 `posts/agentic-crm-solution-overview` 为空目录 |
| 静态 HTML 代码总规模 | 161,757 行 | 单篇最少 33 行，中位数 747 行，最多 5,486 行 |
| `knowledge-data.js` 注册节点 | 191 个节点 | 含 45 个 `topic` 主题节点与 146 个 `article` 文章节点，指向 144 个独立 URL |
| 含 `.md` 文件的文章目录 | 5 个 | 仅 `claw-code-analysis/article.md` 为文章源稿，其余 4 个为构建报告、审查记录或提示词 |
| 实际接入 `markdown-article` 引擎 | 0 篇正式入口 | 仅 `posts/claw-code-analysis/render.html` 作为实验入口调用 `StudyRoom.render('article.md', site)`，正式入口 `index.html` 仍为 832 行手写静态 HTML |
| 双语属性覆盖 (`data-zh` / `data-en`) | 155 / 161 篇 (96.3%) | 正文、导航、演示模式步骤标题广泛内嵌双语 DOM 属性 |
| 渐进披露折叠面板 (`[data-accordion]`) | 131 / 161 篇 (81.4%) | 承担章节支线收起与演示模式子页自动拆分双重职能 |
| 演示模式显式断点 (`data-present-step`) | 96 / 161 篇 (59.6%) | 配合 `assets/article-presentation.js` 实现一屏一页与分步揭示 |
| 页面级内联样式块 (`<style>`) | 161 / 161 篇 (100%) | 中位数 91 行，最高 3,233 行，承载文章专属网格、矩阵或暗色模式覆盖 |

### 1.1 历史 Markdown 渲染尝试 (`markdown-article` 组件) 复盘

仓库在 2026 年 4 月已建立 `markdown-article` 架构组件（绑定 `assets/article-renderer.js` 共 882 行与 `posts/claw-code-analysis/render.html` 共 265 行），并在 `.github/design/article-renderer-proposal.md` 与 `posts/markdown-rendering-pipeline/index.html`（对应看板能力节点 `art-markdown-rendering-pipeline`）中记录了完整复盘：

1. **已验证跑通的能力**：`assets/article-renderer.js` 实现了自定义 YAML Frontmatter 解析器（提取 `title`、`eyebrow`、`brand`、`panel`、`metrics` 生成 `.hero` 区域），并将 `#` 映射为首屏导语、将 `##` 映射为编号章节（`.section` + `.section-kicker`）、将 `###` 映射为编号卡片（`.insight-card`）、将 `---` 映射为演示断点（`data-present-step`）、将代码块与 `mermaid` 围栏映射为代码容器与图表节点，同时支持「渐进呈现视图（`.view-progressive`）」与「纯 Markdown 线性视图（`.view-markdown`）」一键切换。
2. **止步于原型阶段的原因**：
   - `assets/article-renderer.js` 采用手写正则表达式解析行内语法与块级结构，未接入成熟解析器，不支持复杂嵌套列表、表格内复杂代码、行内双语对象或自定义容器指令（`:::accordion`、`:::comparison` 等提案语法仅停留在 `.github/design/article-renderer-proposal.md` 纸面，未在 `article-renderer.js` 中编码实现）。
   - `posts/claw-code-analysis/render.html` 仅加载了 `article-renderer.js`、`scrollbar.js` 与 `article-presentation.js`，漏挂了 `article-common.js`、`article-lightbox.js` 与 `article-assistant.js`，也未引入 `article-narration.css` 与 `article-diagram.css`，无法通过 `node tests/validate.js` 的 14 项仓库级门禁检查。

### 1.2 现有六大前端运行时组件与 HTML 结构的耦合深度

当前每篇 Study Room 文章并不是孤立的 HTML 页面，而是挂载在六大共享应用层/展示层组件之上的结构化 DOM 树：

- **`reading-runtime`（6 个文件，5,695 行）**：`assets/article-common.js`（575 行）在脚本执行阶段立即扫描 `.hero .hero-copy h1` 计算中西文加权字数并设置 `data-title-scale`，绑定 `.load-in` 与 `[data-reveal]` 的滚动显现观察器，绑定 `main section[id]` 的导航高亮，并为所有 `[data-accordion]` 注入展开/折叠高度控制与键盘交互。`assets/article-math.js`（56 行）遍历 `[data-latex]` 节点调用 KaTeX 渲染公式。
- **`presentation-runtime`（3 个文件，4,133 行）**：`assets/article-presentation.js`（3,832 行）在 `DOMContentLoaded` 事件触发时立即执行 `collectPresentationSteps()`，同步遍历 `.hero`、`main .section`、`[data-present-step]`、`[data-accordion]` 与 `[data-present-substep]` 构建演示幻灯片队列 `presentSteps[]`，并在顶栏注入演示启动面板、风格切换器、双语切换按钮与录屏控制器。
- **`narration-engine` 与 `narration-ui`（3 个文件，2,817 行）**：`assets/article-narration.js`（1,226 行）通过 `extractSlideText(stepElement)` 深度遍历当前幻灯片 DOM（专门识别 `data-present-overview`、`.section-head`、`[data-accordion] .subsection-toggle`、`.insight-callout`、`.scenario-card` 等特定类名），提取结构化文本送入大模型生成逐页口语讲稿，再调度 Web Speech、VibeVoice、Fish Audio S2 或 Moss-TTS 合成语音。
- **`pptx-rendering`（3 个文件，747 行）**：`assets/pptx-export.js`（722 行）采用 DOM 几何重放架构（v5），逐页激活 `presentSteps` 并读取真实渲染后的 `getBoundingClientRect()`、`getComputedStyle()` 与 `Range.getClientRects()`，按测量字体（`Space Grotesk` / `Noto Sans SC`）逐行导出 PowerPoint 文本框、圆角矩形与 SVG 光栅化图片。
- **`article-assistant`（2 个文件，1,132 行）**：`assets/article-assistant.js`（997 行）在用户提问时调用 `getArticleText()`，克隆 `main` 节点，将 `[data-latex]` 和 `.katex` 还原为 `$...$` / `$$...$$` 源码，结合全文结构化文本执行流式问答。

### 1.3 存量文章复杂度分层与重度交互沙盒占比

对 161 篇有效文章的组件引用、脚本体积与交互控件扫描表明，文章并非同质化的图文长文，而是呈现显著的三层分化：

| 文章分层类别 | 篇数与占比 | 典型代表文章 | 核心结构特征与定制资产 |
| :--- | :--- | :--- | :--- |
| **L1 标准结构化长文** | 95 篇 (59.0%) | `claw-code-analysis`、`mcp-principles-development`、`llm-wiki` | 仅使用共享标准组件（`.hero`、`.insight-grid`、`.comparison-grid`、`[data-accordion]`、`.quote-block`、`.simple-table`、`.flow-list`）及少量页面级 CSS 颜色/列数微调，无内联业务脚本 |
| **L2 双语图表与公式增强长文** | 35 篇 (21.7%) | `knowledge-hub-diagram-engine`、`calculus-limits`、`high-school-conic-sections` | 内嵌 `tools/diagram-engine/compiler.js` 生成的 `.zh.svg` / `.en.svg` 双语矢量图对（26 篇含 SVG）、KaTeX 数学公式（36 篇含公式）或 Mermaid 流程图（12 篇），含轻量视图切换脚本 |
| **L3 重度定制交互沙盒与行业应用** | 31 篇 (19.3%) | `jev-system-one-research`、`exam-performance-modeling`、`buoyancy-principle`、`leshan-jiading-103-property-strategy` | 含 `<canvas>` 物理/博弈仿真画布（22 篇）、`<input>` / `<select>` 参数推演控件（31 篇）、独立外部业务 JS 模块或数百行内联交互脚本（47 篇含非平凡内联脚本） |

其中，L3 层的定制化程度远超普通文档范畴：
- **`jev-playground`（`posts/jev-system-one-research/`）**：单目录下挂载 33 个独立 JS 模块（`arena-combat.js`、`arena-geometry.js`、`playground-core.js` 等共 3,465 行）、7 个专属 CSS 文件（`arena.css`、`playground.css` 等）及 `examples/` 下 33 个基准测试 JSON/Python/SVG 数据集，并与后端 `scripts/jev-playground-server.js`、`scripts/serve-nanojev-mlx.py` 存在 9 条真实跨组件调用边。
- **`interactive-lab-embed`（34 个绑定文件，5,281 行）**：如 `posts/exam-performance-modeling/` 包含 38 个 JS 文件（含浏览器交互模块与回归测试）、7 个独立 CSS 文件、6 个 Python 统计拟合脚本及 5 份 JSON 预测结果账本；中学物理与数学系列（22 篇含 `<canvas>`）在页面内直接编写了 85 至 523 行不等的 Canvas 2D 实时物理仿真循环；房产策略系列（3 篇）内嵌了 `assets/leaflet.js` 与 `assets/planning-map.js` 交互式地理信息地图；企业方案原型（如 `agentic-business-process-platform`、`microsoft-ai-customer-cases`）内含 700 至 1,266 行前端状态机与多维筛选器。

---

## 2. 诉求一评估：以 MD 保存 + HTML 框架提供丰富展示与交互体验

**结论：对于占总量 80.7% 的 L1/L2 文章完全可行；对于占 19.3% 的 L3 重度交互沙盒文章，正文叙述与章节框架可转为 Markdown，但交互画布与仿真器必须通过「自定义挂载插槽（Slot / Web Component）」与外部 JS 模块解耦，不能强行塞入纯 Markdown 语法。**

### 2.1 扩展 Markdown 的表达力边界

只要引入标准解析器（如 `marked.bundle.js` 或 `markdown-it.min.js`，后者已在 `assets/vendor/markdown-it-14.1.0/markdown-it.min.js` 中现成存在！）并配合 YAML Frontmatter 与围栏指令（Directive `:::type`），即可 100% 表达 Study Room 现有的 9 类 canonical 布局组件：

| 现有 HTML 视觉与交互组件 | 出现频次 | Markdown 原生 / 扩展语法表达方案 | 无损度评估 |
| :--- | :--- | :--- | :--- |
| 首屏 Hero + 指标卡 + 侧边栏 | 158 篇 | YAML Frontmatter（`title`、`eyebrow`、`metrics`、`panel`、`hero_actions`） | 100% 无损 |
| 编号章节与导语 (`.section` + `.section-head`) | 161 篇 | `## 01 / Kicker :: 章节标题` + 紧随其后的首段文本 | 100% 无损 |
| 折叠手风琴 (`[data-accordion]`) | 131 篇 | `### 子节标题` 默认映射为折叠项，或显式使用 `:::accordion` 容器 | 100% 无损 |
| 洞察卡片网格 (`.insight-grid`) | 91 篇 | `:::insight-grid` 配合 `#### 卡片标题`（自动计算 2/3/4/6 对称列数） | 100% 无损 |
| 对比矩阵与卡片 (`.comparison-grid` / `.compare-table`) | 128 篇 | `:::comparison` 容器或标准 Markdown 管道表格 `\| col \|` | 100% 无损 |
| 引用高亮与洞察框 (`.quote-block` / `.insight-callout`) | 88 篇 | 标准块引用 `> **标题**\n> 正文` 或 `:::callout` | 100% 无损 |
| 流程步骤与时间轴 (`.flow-list` / `.timeline`) | 49 篇 | `:::flow` 或 `:::timeline` 包裹有序列表 `1. **步骤** — 说明` | 100% 无损 |
| 数学公式 (`[data-latex]`) 与 Mermaid 图表 | 36 篇 / 12 篇 | 标准 `$inline$`、`$$block$$` 与 ```` ```mermaid ```` 代码块 | 100% 无损 |
| 双语矢量图 (`DiagramSpec` `.zh.svg` / `.en.svg`) | 26 篇 | `:::diagram { src: "./media/arch", drawio: "./media/arch.drawio" }` | 100% 无损 |

### 2.2 必须正视的四大硬核工程阻碍

如果简单采取「纯浏览器运行时 `fetch('article.md')` 动态生成 DOM」的做法，将立即触发以下 4 个系统级故障：

1. **运行时生命周期竞态（Presentation / Narration / Assistant 失效）**：
   现有 `assets/article-presentation.js` 在 `DOMContentLoaded` 时立即同步扫描 `main .section` 构建幻灯片；`assets/article-common.js` 在脚本加载时立即同步扫描 `[data-accordion]` 和 `.load-in`。而浏览器端 `fetch('article.md')` 是异步网络请求，当 `fetch` 返回并渲染出 DOM 时，`DOMContentLoaded` 早已结束，导致演示模式找不到任何章节幻灯片、折叠面板点击无响应、导航栏无法高亮。
   *解决路径*：要么在构建/保存阶段预渲染出静态 HTML；要么改造 `article-common.js` 与 `article-presentation.js` 暴露显式的 `window.StudyRoomRuntime.mount(container)` 重初始化接口，在 Markdown 异步渲染完成后再挂载行为。
2. **双语切换与验证门禁（`tests/validate.js`）冲突**：
   当前 155 篇文章采用 `data-zh` / `data-en` 属性在同一份 HTML 内实现零刷新中英切换，且 `tests/validate.js` 设有 14 项针对 `posts/*/index.html` 源码的静态正则检查（检查脚本加载顺序、内联样式、引号转义、`data-present-surface` 契约、双语步骤标题、章节密度阈值）。如果在单份 `.md` 中到处手写 `{ zh: "...", en: "..." }`，人工编辑体验会极度恶化，还不如改 HTML；反之，若将 `.html` 变成只有 30 行的空壳客户端渲染器，`tests/validate.js` 的结构、密度、双语与引用检查将全部失去扫描目标或直接报错。
   *解决路径*：正文主语言采用纯正、干净的中文 Markdown（支持人工极速阅读编辑），双语需求通过「并列文件 `article.zh.md` / `article.en.md`」或「编译期自动合入双语属性」满足；同时保留构建产物 `index.html` 供 `tests/validate.js`、PPTX 导出器与搜索引擎校验。
3. **重度交互沙盒（L3 文章）的挂载解耦问题**：
   像 `jev-system-one-research`（33 个 JS 模块）或 22 篇含 `<canvas>` 的物理实验文章，其交互逻辑强依赖特定的 DOM 容器 ID、控件类名与文章专属 `<style>`。
   *解决路径*：在 Markdown 框架中引入声明式组件插槽指令，例如 `:::sandbox { id: "least-squares-demo", script: "./least-squares-demo.js", style: "./least-squares-demo.css" } :::`。人工在 Markdown 中只需维护章节文字和插槽位置，复杂的 Canvas/SVG 交互逻辑封装在同目录独立的 `.js` / `.css` 模块中，互不干扰。
4. **存量 161 篇 HTML 逆向转回 Markdown 的折损风险**：
   存量 161 篇 `index.html` 共计 16.18 万行代码，每篇都包含定制的 `<style>` 块（最高 3,233 行）和大量微调过的双语 DOM 属性。若强行用脚本一次性把 161 篇 HTML 逆向解析回 `.md`，必然丢失大量定制 CSS 布局、双语对位属性与演示子步骤元数据（`data-present-substep`、`data-present-surface="board"`）。
   *解决路径*：严禁对存量 L3 沙盒文章和复杂定制文章做破坏性批量逆向转换；实行「新文章及轻量修订文章原生采用 Markdown 管线，存量 HTML 文章按需渐进转换、长期双轨共存」。

---

## 3. 诉求二评估：在交付看板的 Docs 目录中直接查看和编辑这些 MD 文档

**结论：完全可行，且交付看板已经具备成熟的文档发现、居中博客式阅读、选中片段手工修改与 AI 原位改写（CAS 原子写回）底座，仅需打通「文章目录映射」与「新增强制全文编辑/编译钩子」两处小断点。**

### 3.1 交付看板 Docs 面板现有能力勘察（基于真实源码）

勘察 `/Users/wellszhang/Developer/Aye aye Captain/delivery-board/` 下的文档模块源码后，确认当前看板 **Docs** 页签并非简单的只读查看器，而是已经完整实现了从目录扫描、分类导航、相对资源解析到在线原子落盘的闭环：

1. **文档自动扫描与 `docs/navigation.json` 导航树机制**：
   - `scripts/development_board_project_assets.py` 中的 `list_project_documents()` 会扫描项目工作区下最多 6 层目录内的所有 `.md`、`.mdx`、`.rst`、`.adoc` 文件（上限 800 篇，单篇读取上限 2MB）。
   - **实测验证**：对当前 Study Room 仓库调用 `list_project_documents()`，看板已自动扫出全仓 **58 份 Markdown 文档**，不仅包含 `docs/` 下的 5 份技术文档（`docs/jev-validation.md` 等），还已经自动把 `posts/claw-code-analysis/article.md`、`posts/power-platform-pay-as-you-go-billing-plan/README.md` 等 `posts/` 目录下的 `.md` 文件收入了看板文档列表！
   - 若在 `docs/navigation.json` 中登记导航树，看板 `project_assets_navigation.py` 支持通过 `"include"` 或 `"path"` 构建多级编号目录，并按「产品审阅（`human`）」与「工程契约（`agent`）」双受众视图进行归类过滤。
2. **看板内直接查看与在线编辑能力（已上线）**：
   - 前端 `modules/docs/selection-editor.js` 与后端 `scripts/portal_doc_inline_service.py` 已实现**原位编辑闭环**：用户在看板 Docs 阅读器中划选任意段落，即可呼出浮动工具栏，选择「✏️ 手工修改源片段」或「✨ AI 原位改写（含精简一半、语气更专业、改成表格等快捷预设）」。
   - 后端通过 `/api/portal/docs/inline-locate` 将渲染后文本精确反查映射回源 `.md` 文件的字符偏移区间（`start_offset` ~ `end_offset`）与行号，再通过 `/api/portal/docs/inline-edit` 校验 `expected_sha256`（CAS 乐观锁，防并发覆盖），通过临时文件 + `os.replace()` 原子写回磁盘上的 `.md` 源文件，并支持一键撤销（Undo）。
3. **相对路径图片与 SVG 资源解析能力（已兼容）**：
   - 前端 `modules/docs/asset-links.js` 中的 `resolveDocumentAssetHref(currentDocPath, rawHref)` 会根据当前 `.md` 文件所在的相对路径（例如 `posts/claw-code-analysis/article.md` 或 `docs/articles/xxx.md`），将文中的相对图片路径（如 `./media/arch.zh.svg` 或 `../figures/demo.png`）自动解析为项目根目录相对路径，并转换为 `/api/docs/asset?project=...&path=...` 接口请求，同时提供点击放大灯箱（Lightbox）与原图下载。

### 3.2 把文章放进 `docs/` 或在 Docs 面板管理文章的三个具体阻碍与解法

| 潜在阻碍点 | 源码级根因分析 | 推荐工程解法 |
| :--- | :--- | :--- |
| **阻碍 2.1：物理移动路径会导致静态资源双端失配** | 若把文章物理挪到 `docs/posts/<slug>/article.md`，而图片/SVG/交互脚本仍留在 `posts/<slug>/media/`，文中写 `./media/foo.svg` 在看板 Docs 中会解析为 `docs/posts/<slug>/media/foo.svg`（404 报错）；且 `project_assets_navigation.py` 的 `_safe_doc_path()` 明确禁止经过符号链接（`if current.is_symlink(): raise ValueError("文档路径不能经过符号链接")`），因此不能用软链接把 `posts/` 链入 `docs/`。 | **物理位置不动，逻辑导航聚合**：源文件统一保存在 `posts/<slug>/article.md`（与同目录的 `index.html`、`media/`、`.js` 紧邻，使 `./media/xxx.svg` 在看板 Docs 阅读器与外部 HTML 页面双端 100% 同构解析）；同时在 `docs/navigation.json`（或看板文档分类器）中将 `posts/*/article.md` 注册为独立章节分类「📚 Study Room 知识库文章」，在看板 Docs 视图左侧目录树直接呈现。 |
| **阻碍 2.2：看板现有编辑器仅支持「划选片段原位改写」，缺少「全文源码模式 / Frontmatter 编辑」** | `selection-editor.js` 的 `isInsideExcludedReaderZone()` 排除了顶部元数据区，且用户若想修改 YAML Frontmatter（如修改 `metrics` 指标卡片或新增一整个章节），无法通过选中已有正文片段完成。 | 在看板 Docs 阅读器顶栏（`docs-reader-header`）为 Markdown 文档增加一个轻量的「📝 编辑全文源码」抽屉/模态框按钮，复用 `/api/portal/docs/inline-edit` 的 `expected_sha256` CAS 锁直接保存整篇文档。 |
| **阻碍 2.3：看板自带 Markdown 渲染器与 Study Room 渐进式 HTML 样式不同** | 看板 Docs 面板使用 `modules/shared/markdown.js` 渲染为居中博客阅读器（侧重审阅与改写字句），不直接渲染 Study Room 的 `.hero-panel` 或全屏幻灯片模式。 | 在看板 Docs 阅读器顶栏为 `posts/*/article.md` 提供「👁️ 打开 Study Room 交互预览」按钮，一键在新标签页或分屏打开对应的 `posts/<slug>/index.html`，兼顾看板内沉浸改稿与完整交互效果核验。 |

---

## 4. 诉求三评估：一旦发布，外部 Pages 页面就能实时显示变化

**结论：可行，但需明确对齐「实时」的物理边界——本地看板预览可做到毫秒级零延迟（0.1 秒内）；而外部 GitHub Pages 受限于 `git push` + GitHub 官方 Pages 构建部署 + Fastly CDN 边缘节点刷新，真实端到端生效延迟为 30～90 秒（准实时）。**

### 4.1 当前仓库 GitHub Pages 部署现状勘察

1. **远端与分支现状**：当前仓库远端为 `https://github.com/illusion615/KnowledgeHub.git`，工作在 `main` 分支，仓库内无 `.github/workflows/` CI/CD 构建脚本，属于典型的 **GitHub Pages 分支直出静态托管模式**（直接将 `main` 分支根目录下的 `index.html`、`assets/`、`posts/` 作为静态文件对外服务）。
2. **交付看板 Git 发布门禁现状**：看板已内置完整的 Git 协作与一键推送管线（`scripts/portal_git_doc_sync_gate.py`），在触发 `git push` 前会自动执行四向一致性核验与文档人类化质量门禁（`development_board_doc_humanizer.py`）。

### 4.2 从「看板保存 MD」到「外部 Pages 生效」的全链路时延拆解

```
[用户在看板 Docs 保存 article.md]
       │
       ├─► (本地同步钩子: < 0.2s) 自动运行 tools/render-article.js 编译更新 posts/<slug>/index.html
       │   └──► 【本地预览实时生效】：本机 Study Room 页面刷新即刻看到最新变化（延迟 < 0.2 秒）
       │
       ├─► (点击看板「发布/推送」或保存自动 Commit+Push: 2 ~ 5s)
       │   git add posts/<slug>/article.md posts/<slug>/index.html && git commit && git push origin main
       │
       ├─► (GitHub Pages 云端构建与部署: 20 ~ 60s)
       │   GitHub 接收 push 事件 → 触发内部 pages-build-deployment → 同步至 Fastly CDN
       │
       └─► (浏览器端缓存穿透: 0 ~ 10s)
           外部读者刷新页面 → 获取最新 index.html（全链路物理耗时：约 30 ~ 90 秒）
```

### 4.3 为什么「纯客户端 `fetch('article.md')`」并不能让外部 Pages 更快？

一种常见的直觉误区是：「如果外部 `index.html` 在浏览器端通过 `fetch('article.md')` 动态拉取 Markdown，是不是只要改了 `.md`，外部页面就能绕过构建实现 0 秒实时更新？」
基于网络协议与 GitHub Pages 架构，这一假设并不成立，反而会引入更严重的缓存滞后：

1. **文件同样必须经过 `git push` 与 GitHub Pages CDN 部署**：无论修改的是 `.md` 还是 `.html`，本地磁盘上的改动都必须通过 `git commit` + `git push` 推送到 GitHub 远端，并等待 GitHub Pages 的 `pages-build-deployment` 流水线将文件同步到 Fastly CDN 边缘节点（固定耗时 20～60 秒）。
2. **浏览器 `fetch()` 的 HTTP 缓存比 HTML 导航更顽固**：GitHub Pages 对静态资源默认下发 `Cache-Control: max-age=600`（10 分钟缓存）。当用户刷新浏览器页面时，浏览器对主文档 `index.html` 会发起带 `If-None-Match` / `max-age=0` 的条件验证请求，一旦 CDN 更新即可拿到新版 HTML；但如果 `index.html` 本身没变，而是由 JS 在页面内执行 `fetch('article.md')`，在不带动态版本号（如 `?v=sha`）的情况下，浏览器会直接命中本地磁盘缓存（Disk Cache），导致外部读者在 **10 分钟内看到的仍然是旧版 Markdown**。
3. **预编译静态 `index.html` 的额外优势**：在看板保存 `.md` 的瞬间，由本地轻量脚本（耗时 `< 100ms`）同步生成静态 `posts/<slug>/index.html` 并随 Git 一起提交，不仅彻底消除了浏览器端二次 `fetch` 的缓存顽疾与首屏白屏闪烁（FOUC），还保证了 `tests/validate.js`、PPTX 导出、AI 伴读与搜索引擎抓取 100% 正常工作。

---

## 5. 架构方案对比与推荐演进路线

针对上述三大诉求与工程约束，以下对比三种候选架构方案：

| 评估维度 | 方案 A：纯浏览器运行时框架<br>（`index.html` 空壳动态 `fetch` `docs/` 下 `.md`） | 方案 B：存量全量逆向重写<br>（将全部 161 篇 HTML 一次性转回 `.md` 并废弃静态 HTML） | **方案 C（推荐）：MD 真源 + 看板即时编译双模框架 + 双轨共存** |
| :--- | :--- | :--- | :--- |
| **人工修改体验** | 好（直接改 `.md`） | 好（直接改 `.md`） | **极佳**（看板 Docs 在线改或直接改 `.md`，所改即所得） |
| **展示与交互丰富度** | 较弱（异步 DOM 导致演示/伴读/PPT 导出频发竞态，L3 沙盒难挂载） | 极高风险（31 篇重度交互沙盒与定制 CSS 逆向转换必出视觉退化） | **100% 满血保留**（支持 9 类标准组件指令 + `:::sandbox` 交互插槽挂载） |
| **首屏性能与缓存一致性** | 差（存在二次请求白屏闪烁，且受 GitHub Pages 10 分钟 `fetch` 缓存困扰） | 中（视运行时或构建期而定） | **极佳**（保存 `.md` 时毫秒级同步生成静态 `index.html`，零首屏延迟、零缓存滞后） |
| **看板 Docs 路径兼容性** | 差（文章挪入 `docs/` 会导致 `posts/<slug>/media/` 相对图片断链） | 中（需大规模迁移目录） | **100% 兼容**（源文件置于 `posts/<slug>/article.md`，通过导航配置聚合进看板 Docs 面板） |
| **现有 14 项门禁 (`validate.js`)** | 破坏（空壳 HTML 无法通过结构、双语、密度与表面契约检查） | 改造成本极大（需重写大量历史文章以适配新编译器） | **无缝通过**（编译产出的 `index.html` 严格遵循现有契约，161 篇存量文章零改动通过） |
| **外部 Pages 生效速度** | 30～90 秒 + 潜在 10 分钟缓存延迟 | 30～90 秒 | **本地 < 0.2 秒实时预览；外部 Pages 推送后 30～90 秒准实时生效** |

### 推荐分阶段落地路线（三步走，零破坏演进）

#### 第一阶段：打通「Markdown 扩展编译内核 + 交互插槽契约」（预计工作量：1～2 个迭代卡）
1. **复用本地成熟解析器**：直接使用仓库已内置的 `assets/vendor/markdown-it-14.1.0/markdown-it.min.js`（淘汰 `assets/article-renderer.js` 中的脆弱手写正则），编写同构渲染脚本 `tools/render-markdown-article.js`（既可在 Node.js 下生成静态 `index.html`，也可在浏览器端即时预览）。
2. **补齐 9 类组件指令与沙盒插槽**：支持 Frontmatter 生成 `.hero`，支持 `##` 生成 `.section`，支持 `###` 生成 `[data-accordion]`，支持 `:::insight-grid`、`:::comparison`、`:::flow`、`:::quote`、`:::diagram`（自动嵌入双语 `.zh.svg` / `.en.svg`），并提供 `:::sandbox { id, html, script, style }` 插槽供重度交互组件无损挂载。
3. **验证标杆文章**：以 `posts/claw-code-analysis/article.md` 为首个标杆，编译生成符合全部 14 项 `node tests/validate.js` 门禁的 `index.html`，替换原有的实验性 `render.html`。

#### 第二阶段：打通「交付看板 Docs 面板集中查阅、全文编辑与保存即编译」（预计工作量：1～2 个迭代卡）
1. **看板 Docs 导航树聚合**：保持文章物理路径为 `posts/<slug>/article.md`（确保 `./media/...` 相对路径在看板与外部网页两端同时生效），在 `docs/navigation.json` 及看板文档分类逻辑中，将所有含 `article.md` 的文章自动归入 Docs 视图的「📚 Study Room 专栏文章」分组。
2. **增强看板 Docs 编辑器**：在现有的「划选段落原位手动/AI 改写」基础上，于 Docs 阅读器顶部增加「📝 全文 Markdown 源码编辑」模式与「👁️ 预览交互网页」按钮。
3. **保存即编译钩子（Save-to-Compile）**：当用户在看板 Docs 中保存 `posts/<slug>/article.md`（或本地修改该文件）时，后端 `portal_doc_inline_service.py` 自动触发一次 `< 100ms` 的 `tools/render-markdown-article.js` 编译，同步更新 `posts/<slug>/index.html`。

#### 第三阶段：打通「看板一键发布至外部 GitHub Pages 准实时同步」与「存量按需纳管」（预计工作量：1 个迭代卡）
1. **看板 Docs 一键发布按钮**：在看板 Docs 阅读器或顶栏提供「🚀 发布更新至 Pages」动作，后台自动将成对的 `posts/<slug>/article.md` 与编译好的 `posts/<slug>/index.html` 执行 `git commit` 与 `git push origin main`，约 30～90 秒后外部 GitHub Pages 即刻呈现最新内容。
2. **双轨制平滑演进**：
   - **增量文章**：今后所有新撰写的 Study Room 文章，100% 采用 `posts/<slug>/article.md` 作为唯一真源创建，人工随时可在看板 Docs 中直接修改文字、增删段落。
   - **存量文章（按需逆向提取）**：提供辅助提取脚本 `tools/html-to-markdown.js`，当用户需要人工编辑某篇存量 L1/L2 静态 HTML 文章时，一键将其转换为 `article.md` 并纳入看板 Docs 管线；而无需修改的存量文章及重度定制的 L3 沙盒文章（如 `jev-system-one-research`）保持现有静态 HTML 形态稳定运行，实现零风险过渡。

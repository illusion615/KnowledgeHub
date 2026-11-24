# 交付看板 Docs 扩展标签保护、胶囊显隐、富交互渲染与自适应双语切换跨项目对接规范

- **文档编号**：`portal-cmd-20261124-135506-fbe32b`（含用户补充指令 `cmd-20261124-141026-a22e25`）
- **需求提出方**：`Study Room` 项目组（`/Users/wellszhang/Developer/Study-Room`，项目标识 `project-ae072df8f9ae4232b6bf4476a4724951`）
- **升级承接方**：`Aye aye Captain` 交付看板平台组（`/Users/wellszhang/Developer/Aye aye Captain/delivery-board`，项目标识 `project-8610e2d940164bd1830b02a73d812651`）
- **关联架构决策**：`adr-markdown-source-dual-mode-pipeline`（Study Room 文章 Markdown 真源化与看板 Docs 协同编辑双模编译架构）
- **兼容性红线**：100% 保持标准纯 Markdown 文档（如 `README.md`、架构决策记录与普通技术笔记）的零感知原样渲染，不引入任何额外标记或项目硬编码耦合。

---

## 1. 职责边界核查结论：必须通知并由 `Aye aye Captain` 项目组在平台侧升级

经核查双仓真实代码，**本次升级 100% 需要发送通知给 `Aye aye Captain` 项目组，由看板平台侧统一承接阅读器与原位编辑器的代码改造**，Study Room 仓库不应也无法在本地修补看板前端与后端服务。具体源码归属与问题根因如下：

### 1.1 看板 Docs 模块物理归属与通用底座约束

交付看板（Delivery Board Portal）的文档阅读器、划选编辑器与后端持久化接口全部位于 `Aye aye Captain` 仓库内部，核心涉及以下 5 个平台文件：

| 平台侧源码文件（相对 `delivery-board/`） | 当前职责与真实代码行为 | 打开 Study Room 扩展 `article.md` 时的痛点表现 |
| --- | --- | --- |
| `modules/shared/markdown.js` | `renderMarkdownBody()` 仅跳过首部 `---...---`，其余按标准标题、列表、表格与代码块逐行渲染 | `:::insight-grid`、`::card 01`、`:::figure` 内联 JSON、`#id 01 / Kicker ::` 与 `\|\|` 双语分隔符全部作为裸文本段落直接暴露，打断沉浸阅读 |
| `modules/docs/selection-editor.js` | `extractReaderSelectionContext()` 从渲染 DOM 提取划选文字及前后各 220 字邻域，提交手工修改或快捷改写 | 用户划选正文时极易连带扫入裸露的 `:::`、`::card` 或 `\|\|` 符号，在弹窗编辑中顺手删改后破坏编译语法树 |
| `portal_doc_inline_service.py` | `locate_source_span()` 定位源文偏移，`save_document_inline_edit()` 执行乐观锁原子写回，`_invoke_inline_rewrite_llm()` 调用轻量模型局部改写 | `_normalize_ws_with_map()` 将管道符 `\|` 视作空白折叠；改写系统提示词无扩展令牌保护约束，写回前缺少围栏配对校验，一旦写坏闭合 `:::` 会导致整章渲染错位 |
| `modules/docs/header-meta.js` | `createDocsReaderHeader()` 渲染文档路径面包屑、搜索框、导出菜单与文风润色下拉框 | 顶栏尚无「显示/隐藏结构标签」开关、「纯净 Markdown / 富交互 HTML」双视图切换入口，也无按文档双语能力自适应显隐的 `[中文 \| EN]` 语言切换标签 |
| `modules/docs/index.js` | `updateDocsShellContent()` 拉取 `/api/docs/content` 并挂载单栏博客阅读流 | 仅调用 `renderMarkdownBody()` 单一路径，未探测同源富交互编译管线或挂载隔离式预览容器 |

此外，`Aye aye Captain` 平台遵循 **I1 项目无关通用底座架构准则**：平台自身严禁写死 `Study-Room` 目录名或私有业务逻辑；正确做法是由平台升级通用的「受保护扩展指令契约 + 插件化富视图挂载协议」，再由 Study Room 仓库通过声明式清单与本地无依赖编译脚本对接。

### 1.2 Study Room 侧提供的扩展语法真源契约

Study Room 已落地的 Genesis 纯静态编译内核（`tools/compile-markdown-article.js` 与 `tools/markdown-compiler/`）定义了确定性的扩展语法集合，供平台侧精确识别而无需猜测：

1. **首部元数据块（YAML Frontmatter）**：文件第 1 行起由 `---` 包裹的键值与列表（含 `title`、`eyebrow`、`lead`、`panel`、`metrics`、`style` 等首屏配置）。
2. **章节锚点与眉题前缀**：二级标题形如 `## #overview 01 / Architecture Overview :: 中文标题 || English Title`（正则特征：`^(#{2,4})\s+(?:#([a-zA-Z][\w-]*)\s+)?(?:(\d+\s*\/\s*[^:\n]+?)\s*::\s*)?(.+)$`）。
3. **同源中英双语分隔符**：行内或标题内的双竖线 ` || `（左侧为中文真源，右侧为英文对位译文；另有少量属性内 `{ zh: "...", en: "..." }` 写法）。
4. **块级语义容器围栏（9 类标准指令）**：开围栏 `^\s*:::(insight-grid|comparison|accordion|flow|timeline|callout|quote|diagram|figure|sandbox)(?:\s*\{.*\})?\s*$` 与闭围栏 `^\s*:::\s*$`。
5. **容器内子项锚点**：单行子指令 `^\s*::(card|item|panel|versus)(?:\s+.*)?$`。
6. **声明式图表与公式载荷**：`:::figure {...}` 块内的 JSON/YAML 规格体，以及 `$...$`、`$$...$$` 数学公式块。

---

## 2. 致 `Aye aye Captain` 项目组的四大核心需求对接规格

### 需求一：结构化指令与双语标签的「防误删写保护机制（Protected Structural Tokens）」

在不牺牲划选秒改体验的前提下，从前端选区收敛、AI 改写提示词约束与后端保存前语法门禁三层锁死结构标签：

#### 1) 前端划选边界排除与安全内缩（`selection-editor.js` + `portal_doc_inline_service.py`）
- **DOM 选区排除**：在 `isInsideExcludedReaderZone()` 与 `extractCleanContextText()` 中新增 `.md-structural-tag`、`.md-bilingual-chip`、`.md-frontmatter-fold` 排除选择器，并设置 `user-select: none` 与 `contenteditable="false"`，使鼠标拖选正文时自动跳过结构胶囊。
- **源文偏移安全内缩（Span Clamping）**：`locate_source_span()` 定位出 `[start_offset, end_offset]` 后，若首尾意外贴上整行围栏（如 `:::insight-grid {...}`、`:::`、`::card 01`）或章节前缀（`#id 01 / Kicker :: `），自动将可编辑区间内缩至纯正文切片，把外层结构指令保留在可编辑文本框之外，并在编辑卡片头部以只读徽章展示当前所属容器（例如 `🔒 容器内编辑：:::insight-grid > ::card 01`）。
- **双竖线定位修复**：修正 `portal_doc_inline_service.py` 中 `_normalize_ws_with_map()` 对单管道符与双管道符 `||` 的混同折叠，确保含双语对位符的段落能精准映射回源字符偏移。

#### 2) AI 局部改写结构守恒约束（`INLINE_AI_REWRITE_SYSTEM_PROMPT`）
- 当待改写源片段内部包含双语分隔符 `||` 或子项标记时，向 `INLINE_AI_REWRITE_SYSTEM_PROMPT` 动态追加第 6 条守恒规则：
  - 若源片段采用 `中文正文 || English Copy` 双语并列结构，改写结果必须同步更新中英两侧并严格保留单个 ` || ` 分隔符；
  - 严禁增删、改名任何 `:::` 容器围栏、`::card` / `::versus` 子锚点或 `#id` 章节锚点。

#### 3) 后端写回前 AST 配对完整性校验（`save_document_inline_edit()`）
- 在 `_atomic_write_utf8()` 落盘前执行轻量级毫秒校验 `validate_structural_tokens_integrity(before_doc, after_doc)`：
  1. 若原文档存在合法闭合的 YAML Frontmatter `---...---`，修改后首部 `---` 配对不得丢失；
  2. 扫描代码块（```` ``` ````）以外的所有 `:::<name>` 开围栏栈与 `:::` 闭围栏栈，若修改导致开闭数量失衡、嵌套错位，或被替换局部原本含有的 `::card` / `::versus` / `#custom-id` 锚点被无故抹除，立即抛出 `PortalValidationError`（HTTP 400），返回明确中文提示（如：`检测到结构标签 :::insight-grid 闭合围栏被破坏，已拦截保存以保护文档排版`），拒绝写坏源文件；
  3. 手工编辑框提供显式的「🔓 解锁高级源码块编辑」二级确认开关，仅供作者有意增删整块卡片时主动放行，但依然强制校验全局开闭配对平衡。

---

### 需求二：纯 Markdown 模式下的「精致胶囊 Tag 样式化 + 一键显示/隐藏开关」

在不启用富 HTML 视图、仅使用标准看板 Markdown 阅读流时，消除裸指令符号对视线的干扰，同时保持对纯 Markdown 文档的 100% 零侵入兼容：

#### 1) 纯 Markdown 零感知兼容判定（Zero-Noise Compatibility）
- `renderMarkdownBody()` 先对待渲染文本做 `O(n)` 快速特征扫描（检测是否含有代码块外的 `^:::[a-zA-Z]`、`^::(card|versus|item|panel)\b`、章节 `::` 眉题或行内 ` || ` 双语分隔符）。
- **若均未命中**（如平台自身的架构文档、普通 `README.md`、常规表格与代码块）：完全走现有标准渲染路径，顶栏不渲染任何多余标签开关，视觉与现网 100% 一致。

#### 2) 扩展令牌的只读胶囊（Read-only Chip/Tag）渲染规则
当文档命中扩展语法特征时，`markdown.js` 按以下规则将裸指令转换为低饱和度、圆角单行胶囊（DOM 统一挂载 `.md-structural-tag` 类名与 `data-md-tag-kind` 属性，且不计入散文正文字数审计）：

| 原始裸文本语法 | Tag 开启态（结构骨架可见）的胶囊表现 | Tag 隐藏态（沉浸纯净散文）的表现 |
| --- | --- | --- |
| 首部 `--- ... ---` Frontmatter | 顶部折叠为单行只读摘要条 `[📄 Frontmatter · title / metrics / style ▾]`，点击可展开只读键值表 | 完全收起隐藏（主标题已由文档头部承载） |
| `## #overview 01 / Overview :: 标题 \|\| Title` | 标题上方或左侧渲染紧凑胶囊 `[#overview]` `[01 / Overview]`，主标题优雅展示中文，右侧附低噪双语签 `[EN ▾]` 悬停或点击查看英文标题 | 仅展示干净的 `## 标题`（锚点 ID 仍挂载在 `<h2>` 的 `id` 属性上供目录跳转） |
| `:::insight-grid { cols: 3, title: "..." }` 与闭合 `:::` | 容器首部渲染细边框胶囊条 `[❖ insight-grid · 3 cols · 三大核心工程收益]`，容器左侧贯通 2px 语义导引竖线，尾部闭合 `:::` 化为极淡收尾刻度 | 隐藏首尾围栏胶囊文字，仅保留清爽的段落间距与轻柔分组左边框 |
| `::card 01` / `::versus 方案 A` | 渲染为精致序号小徽章 `[Card 01]` / `[VS · 方案 A]` | 化作无标签的轻量小节分隔点 |
| 段落内 `中文句子 \|\| English sentence` | 按当前阅读器头部选中的文档语种（`中文` 或 `EN`）展示对应语言分支，句末附低噪只读徽章 `[🌐 双语对位]`（点击可在段下展开对照译文，避免双语混排导致视线跳跃） | 仅展示当前选定语种的纯净正文，自动隐去另一语种与 `\|\|` 分隔符 |
| `:::figure { ... }` 内联 JSON 规格体 | 收拢为折叠配置卡 `[📊 figure · architecture · 4 nodes / 3 edges ▾]`，默认不把几十行 JSON 代码刷屏暴露在正文中 | 保持收拢为单行图题提示卡，点击可查看声明式规格 |

#### 3) 顶栏一键显示/隐藏切换与偏好记忆（`header-meta.js`）
- 当当前打开文档包含扩展结构令牌时，在 `createDocsReaderHeader()` 右侧工具簇（导出按钮左侧）注入胶囊开关按钮 **`[🏷️ 结构标签：显示 / 隐藏]`**（紧凑窄屏下收敛为带状态点的标签图标按钮）。
- 切换采用纯 CSS 状态类驱动（在 `.docs-reader-pane` 上切换 `.is-md-tags-hidden`），**零网络请求、零重排闪烁、1 帧内即时生效**，且保持当前阅读滚动条位置不变。
- 用户偏好按项目维度持久化在 `localStorage`（键名示例：`board.docs.showStructuralTags.<projectId>`，推荐默认值：**隐藏裸围栏、仅保留极简视觉分组**，让首次打开即获清爽阅读感，需核对结构时一键点亮全部胶囊）。

---

### 需求三：将 Study Room「富交互动态 HTML 渲染视图」原生融入看板 Docs 阅读器

让用户在交付看板 Docs 页签内部即可直接体验杂志级渐进披露卡片、双语无缝切换、Figure Engine v2 亮暗自适应矢量图、数学公式与 `:::sandbox` 交互实验台，同时与纯 Markdown 阅读模式自由切换：

#### 1) 顶栏双视图分段切换器（View Mode Segmented Control）
- 在 `header-meta.js` 文档阅读器顶栏提供清晰的分段切换控件：
  - **`[📖 纯净 Markdown]`**：使用看板原生轻量阅读流（含需求二的胶囊显隐、划选秒改、变更差异高亮跳阅与文风润色审计条）。
  - **`[✨ 富交互视图]`**：对具备扩展语法或同目录已编译产物的文档激活富交互 HTML 渲染引擎；对于无任何扩展语法且无配对富视图编译器的标准纯 Markdown 文档，该按钮自动置灰隐藏或继续呈现高可读性的标准排版，确保 **100% 纯 Markdown 兼容性**。

#### 2) 架构解耦的通用编译与预览协议（严守平台 I1 项目无关准则）
为避免把 Study Room 专用的 `tools/markdown-compiler/` 耦合进 `Aye aye Captain` 仓库，推荐采用 **「项目声明式渲染器发现 + 同源安全沙盒挂载」** 方案：

1. **项目级渲染器约定探测（零硬编码）**：
   - 看板后端在读取工作区文档（`read_project_document()` 或新增轻量接口 `GET /api/docs/rendered-html?path=<doc_path>`）时，按通用约定检查项目工作区是否存在声明式配置（如 `docs/navigation.json` 顶层的 `"rich_renderer"` 字段或 `.project-data/delivery-board/docs-renderer.json`），或检测同目录配对静态产物（如 `posts/<slug>/article.md` 同级的 `index.html`）。
   - Study Room 侧提供的标准无依赖 CLI 入口为：
     ```bash
     node tools/compile-markdown-article.js <article.md>
     ```
     该命令零外部服务依赖，单篇毫秒级（`< 50ms`）向标准输出直出完整自包含 HTML，且内置 14 项静态契约校验。
2. **保存即同步（Save-to-Compile 闭环）**：
   - 当用户在 `[📖 纯净 Markdown]` 视图下通过划选编辑或文风润色修改了 `posts/<slug>/article.md` 时，`portal_doc_inline_service.py` 落盘后若检测到该项目注册了富视图构建钩子（或请求实时预览接口），自动基于最新 `content_sha256` 触发增量编译缓存，切回 `[✨ 富交互视图]` 时即刻呈现最新内容，无陈旧缓存滞后。
3. **样式隔离与主题/双语状态联动**：
   - Study Room 编译产物带有完整的 `assets/article.css`、`article-figure.css`、8 个前端运行时脚本（`article-common.js`、`article-math.js`、`article-lightbox.js` 等）及可选的 `:::sandbox` Canvas 脚本。为防止文章全局样式污染交付看板宿主 DOM，看板 Docs 阅读器在 `[✨ 富交互视图]` 下应使用同源受控 `<iframe class="docs-rich-html-stage" sandbox="allow-scripts allow-same-origin allow-popups allow-downloads">`（由看板静态资源路由代理工作区相对路径 `assets/*` 与 `./media/*`）承载渲染结果。
   - **宿主与内嵌视图双向联动**：
     - **亮/暗主题同步**：看板宿主切换亮色/暗色主题时，向内嵌富视图同步设置 `document.documentElement.dataset.theme = 'light' | 'dark'`，Figure Engine v2 的 `--fig-*` CSS 变量与卡片表面即时无损切换，无白底反色断层；
     - **中/英语言同步**：与阅读器头部的自适应双语切换标签（见下方需求四）共享同一文档语言状态，同步切换内嵌富视图 `document.documentElement.lang`（`'zh-CN'` / `'en'`）、全文 `[data-zh]`/`[data-en]` 节点及内联矢量图 `.sr-zh`/`.sr-en` 图层；
     - **目录（TOC）与章节定位打通**：点击看板右侧浮动目录时，通过 `postMessage` 或同源帧内 `scrollIntoView` 精准滚动至对应 `#section-id`，并在顶栏保留「切回 Markdown 原位修改本节」快捷联动。

---

### 需求四：文档头部自适应双语切换动态标签（Adaptive Bilingual Header Switcher）

针对双语技术文章与普通单语工程文档并存的场景，在看板 Docs 阅读器头部建立「有双语才显示、纯单语零打扰」的动态语言切换机制：

#### 1) 自动双语内容探测契约（Bilingual Capability Detection）
当看板后端 `read_project_document()` 或前端 `modules/docs/index.js` 加载一篇文档时，排除代码块（```` ``` ```` / `~~~`）与行内代码（`` `...` ``）后，只要命中以下任一特征即判定为 `bilingual_capable = true`（否则为 `false`）：
1. **Frontmatter 显式声明**：首部 YAML Frontmatter 含 `strict_i18n: true`、`present_i18n: strict`，或 `title` / `lead` / `eyebrow` 字段值含 ` || ` 双语分隔符；
2. **标题或正文双语对位语法**：章节标题、列表项、表格单元格或正文段落含同源双语分隔符 ` || `（两侧均为非空文本），或属性块含 `{ zh: "...", en: "..." }`；
3. **内联双语 DOM / 矢量图标记**：文档内嵌 HTML 或内联 SVG 含成对的 `data-zh` / `data-en` 属性或 `.sr-zh` / `.sr-en` 双语图层类名；
4. **同目录配对双语文件**：当前文档路径同目录下存在显式命名的 `.zh.md` 与 `.en.md`（或 `README.md` 与 `README.en.md`）配对文件。

#### 2) 阅读器头部按需动态显隐（Conditional Header Chip）
- **支持双语的文档（`bilingual_capable === true`）**：
  - 在 `docs-reader-header`（`header-meta.js` 顶栏工具簇，紧邻视图切换器左侧）动态渲染醒目精致的 **`[中文 | EN]`** 分段胶囊标签（`class="docs-bilingual-switch-pill"`，具备 `role="tablist"` 或 `aria-pressed` 无障碍状态）。
  - **在「📖 纯净 Markdown 视图」下**：点击切换 `中文` 或 `EN` 时，标题、章节目录（TOC）、表格单元格、容器标题及正文段落**仅渲染当前所选语种分支，自动隐去另一语种文本与裸露的 `||` 分隔符**（对于同目录 `.zh.md` / `.en.md` 配对文档则无感加载对应语种文件并保持当前章节锚点位置）；同时划选原位编辑仍能通过源偏移映射安全定位对应语种分支或完整双语行。
  - **在「✨ 富交互视图」下**：点击同一头部 `[中文 | EN]` 标签即刻向内嵌富视图同步语种状态（更新 `html[lang]` / `html[data-lang]`、触发 `[data-zh][data-en]` 文本切换、联动内联 SVG `.sr-zh` / `.sr-en` 显隐与 `.diagram-zh` / `.diagram-en` 双语图切换，并派发 `langChanged` 事件刷新手风琴高度），全程零页面重载、零闪烁。
  - 阅读语种偏好支持记忆在 `localStorage`（如 `board.docs.readingLang.<projectId>`，默认跟随看板当前界面语言 `zh` / `en`）。
- **纯单语普通文档（`bilingual_capable === false`）**：
  - 当打开 `README.md`、`RELEASE.md`、单语架构评估报告或普通技术笔记（未命中上述任何双语特征）时，**完全不渲染该 `[中文 | EN]` 语言切换标签**，保持阅读器顶栏极简干净，绝不出现点击后毫无变化的无效按钮。

---

## 3. 跨项目协同边界与联调验收清单

### 3.1 双项目职责切分矩阵

| 协同模块 | `Aye aye Captain` 平台组负责交付 | `Study Room` 项目组负责配合 |
| --- | --- | --- |
| 防误删写保护 | 升级 `selection-editor.js` 选区排除与 `portal_doc_inline_service.py` 偏移内缩、双竖线定位及保存前围栏配对校验 | 提供完整扩展指令正则表与正反例测试样板（`posts/markdown-genesis-lab/article.md`） |
| 胶囊 Tag 显隐 | 升级 `markdown.js` 扩展令牌胶囊化渲染、`header-meta.js` 顶栏显隐开关与本地偏好存储 | 验证全部 9 类容器指令、`::card`/`::versus` 子锚点及 `\|\|` 双语段落在显/隐双态下的阅读体验 |
| 富交互 HTML 融入 | 在 `modules/docs/index.js` 与后端文档路由新增 `[📖 纯净 Markdown \| ✨ 富交互视图]` 切换、工作区相对资源代理及亮暗/目录联动 | 保持 `tools/compile-markdown-article.js` 零依赖毫秒级标准输出契约与 `docs/navigation.json` 目录索引对齐 |
| 头部自适应双语切换 | 在文档元数据解析、`markdown.js` 与 `header-meta.js` 实现双语特征自动探测、按需渲染 `[中文 \| EN]` 动态胶囊及双视图零闪烁联动 | 保证双语文章严格遵循 `strict_i18n`、`\|\|` 对位语法及内联 SVG `.sr-zh`/`.sr-en` 图层规范，并提供单语与双语对照验收样本 |

### 3.2 跨项目联调验收标准（DoD）

1. **纯 Markdown 与单语文档 100% 零回归**：在看板 Docs 中打开 `README.md`、`RELEASE.md` 或 `Aye aye Captain` 自身单语架构文档时，排版、表格、代码块、公式与划选修改行为与升级前完全一致，顶栏**不显示**多余的结构标签开关与 `[中文 | EN]` 语言切换标签。
2. **结构标签防误删生效**：在 `posts/markdown-genesis-lab/article.md` 阅读流中拖选跨卡片正文执行「手工修改」或「AI 改写」，外层 `:::insight-grid`、`::card`、`:::` 与 `#id` 不会被选入误删；人为在编辑框删掉闭合 `:::` 点保存时，后端准确返回 400 拦截提示且原文件纹丝不动。
3. **Tag 胶囊一键显隐流畅**：点击顶栏 `[🏷️ 结构标签]` 开关可在 16ms 内无刷新切换「显示精致只读胶囊骨架」与「隐藏标签沉浸阅读」两种状态，刷新页面后记住上次状态。
4. **富交互视图原生运行**：切换至 `[✨ 富交互视图]` 后，手风琴折叠面板、三列洞察卡、对比矩阵、Figure Engine v2 矢量图（亮/暗双主题对比度达标）、LaTeX 公式及 `genesis-wave-sandbox` 阻尼谐波 Canvas 交互沙盒均在看板 Docs 内直接可点可用，控制台零 404 或脚本报错。
5. **头部自适应双语切换精准联动**：打开含双语内容的 `posts/markdown-genesis-lab/article.md` 时，`docs-reader-header` 自动出现 `[中文 | EN]` 切换胶囊；在纯净 Markdown 视图下点击可干净切换中/英单语正文并隐去另一语种与 `||` 符号，在富交互视图下点击可同步切换全文 `[data-zh]`/`[data-en]` 与内联 SVG `.sr-zh`/`.sr-en` 双语矢量图；切换回单语文档（如 `docs/minimax-music3-mlx.md` 或 `RELEASE.md`）时，该语言切换标签立即自动隐藏。

---

## 4. 如何直接向 `Aye aye Captain` 项目发送协同指令（含一键可复制指令）

经核查交付看板跨项目路由源码（平台侧 `portal_dispatch.py`、`portal_cross_project_notifications.py` 与 `development_board_core/http_post.py`）：

1. **安全隔离机制确认**：交付看板强制执行跨项目会话隔离守卫（`cross_project_session_mutation_forbidden`），当前运行在 `Study Room` 工作区的子工位 Agent 严禁越权直接修改 `/Users/wellszhang/Developer/Aye aye Captain` 源码或私自向其他项目注入写指令；右上角全局铃铛（`cross-project-bell.js`）为只读聚合中心。
2. **最快发送方式（两种任选）**：
   - **方式 A（推荐 · 看板 UI 直接派单）**：在交付看板左上角项目切换器切至 **`Aye Aye Captain`** 项目，将下方拟定好的需求指令直接粘贴发送给该项目的项目经理（PM），系统会自动引用本规范说明书（`/Users/wellszhang/Developer/Study-Room/docs/aye-aye-captain-docs-integration-spec.md`）立项排期。
   - **方式 B（本机回环 API 一键投递）**：若需通过终端直接向本机 `Aye Aye Captain` 项目看板（项目 ID：`project-8610e2d940164bd1830b02a73d812651`）投递正式需求指令并唤醒其协调器，可在终端执行：

```bash
curl -sS -X POST "http://127.0.0.1:8766/api/portal/commands" \
  -H "Content-Type: application/json" \
  -H "Host: 127.0.0.1:8766" \
  -H "Origin: http://127.0.0.1:8766" \
  -H "X-Board-Project: project-8610e2d940164bd1830b02a73d812651" \
  -d '{
    "command_type": "instruction",
    "title": "升级看板 Docs 阅读器：支持扩展结构标签防误删保护、胶囊 Tag 显隐、富交互 HTML 视图融合与头部自适应双语切换",
    "body": "请读取跨项目对接规范 /Users/wellszhang/Developer/Study-Room/docs/aye-aye-captain-docs-integration-spec.md 并遵循平台 I1 项目无关通用底座准则落地四项 Docs 升级：1) 在 selection-editor.js 与 portal_doc_inline_service.py 中为 YAML Frontmatter、::: 容器围栏、::card/::versus 子锚点、章节 #id 眉题与 || 双语符建立防误删写保护及保存前配对校验；2) 在 markdown.js 与 header-meta.js 中将扩展结构符号渲染为只读胶囊 Tag 并提供顶栏一键显示/隐藏开关；3) 在 Docs 阅读器顶栏新增「纯净 Markdown / 富交互 HTML 视图」切换能力，通过通用声明式编译钩子与同源隔离容器融合 Study Room 动态富交互阅读体验（含亮暗主题与目录联动）；4) 在 docs-reader-header 新增自适应双语切换动态标签 [中文 | EN]：自动检测文档是否具备双语特征（strict_i18n: true、标题/正文 || 双语分隔符、data-zh/data-en 或 .sr-zh/.sr-en 属性、同目录 .zh.md/.en.md 配对），支持双语时在头部显示该胶囊并在纯净 Markdown 视图（仅展示所选语种并隐去 ||）与富交互 HTML 视图下零闪烁切换中英文，单语普通文档则完全不显示该标签，保持 100% 纯 Markdown 零回归兼容。"
  }'
```

### 附：可直接复制给 `Aye aye Captain` 项目经理的对话指令文本

> 请参照 Study Room 已梳理完毕的跨项目对接规格说明书 `/Users/wellszhang/Developer/Study-Room/docs/aye-aye-captain-docs-integration-spec.md`（样板真源可直接使用 `/Users/wellszhang/Developer/Study-Room/posts/markdown-genesis-lab/article.md` 实机联调），在交付看板 Docs 模块落地以下四项通用能力升级，同时确保纯标准单语 Markdown 文档 100% 零感知兼容：
> 1. **扩展结构标签防误删保护**：在划选原位编辑（`selection-editor.js`）与后端改写/落盘服务（`portal_doc_inline_service.py`）中识别受保护语法边界（Frontmatter `---...---`、`:::type {...}` / `:::` 围栏、`::card` / `::versus` 子锚点、`#id 01 / Kicker ::` 章节前缀与 `||` 双语分隔符），划选修改时自动排除外层结构标签，并在写回前校验围栏开闭配对，防止误删写坏文件；
> 2. **胶囊 Tag 样式化与一键显示/隐藏**：在纯 Markdown 阅读模式下将上述裸露指令符号渲染为低噪只读胶囊徽章，并在 Docs 阅读器顶栏提供 `[🏷️ 显示/隐藏结构标签]` 切换开关（无扩展标签的普通 Markdown 文档不显示多余控件）；
> 3. **富交互动态 HTML 渲染原生融入 Docs**：在 Docs 顶栏提供 `[📖 纯净 Markdown | ✨ 富交互视图]` 切换，按平台项目无关协议对接工作区静态编译输出（如 `node tools/compile-markdown-article.js <article.md>` 或配对 `index.html`），在 Docs 内直接支持手风琴、对比矩阵、Figure Engine v2 亮暗自适应矢量图、公式与交互沙盒阅读，并与宿主亮暗主题及章节目录联动；
> 4. **文档头部自适应双语切换动态标签**：在 `docs-reader-header` 自动探测当前文档是否支持双语（如 Frontmatter `strict_i18n: true`、标题/正文含 `||` 双语对位符、含 `data-zh`/`data-en` 或内联 SVG `.sr-zh`/`.sr-en`、或同目录存在 `.zh.md` & `.en.md` 配对文件）；若支持双语则在文档头部动态显示 `[中文 | EN]` 切换标签，点击即可在纯净 Markdown 视图（仅展示所选语言分支，自动隐去另一语种与 `||` 分隔符）和富交互 HTML 视图下零闪烁切换中英文；若为不支持双语的单语普通文档，则完全不显示该标签，保持顶栏极简干净。

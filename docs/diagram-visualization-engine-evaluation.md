# 全站统一图表与数据可视化引擎调研评估报告

> **评估编号**：`portal-cmd-20261124-080534-f1c126`  
> **核心结论**：当前图表在暗色模式下出现生硬割裂，根本原因在于编译器写死了浅色十六进制色值，且页面通过 `<img src="...svg">` 标签外部引入独立图形文件，阻断了宿主页面的样式令牌继承。要让系统架构图与统计数据图表在亮暗双模式下都与页面浑然一体，最优工程路径是构建统一的声明式图表引擎 **Study Room Figure Engine v2**。该方案结合分层正交自动布局与数据标尺计算，在编译期直接输出绑定页面设计变量的语义化内联矢量图。

---

## 1. 现状解剖：为什么现有图表在暗色模式下生硬突兀？

解剖 `tools/diagram-engine/compiler.js`（共 707 行）、`assets/article-diagram.css`、`tools/markdown-compiler/directives.js` 以及最新文章产物后，可以定位出三个代码层面的结构性根因。

### 1.1 根因一：`<img src="...svg">` 跨文档安全沙箱阻断了宿主设计令牌继承

在 `tools/markdown-compiler/directives.js`（第 424–429 行）及 `posts/knowledge-hub-diagram-engine/index.html`、`posts/copilot-studio-managed-runtime-alm/index.html` 中，所有编译产物均通过双图像标签挂载：

```html
<figure class="generated-diagram" data-present-step data-present-surface="unframed">
  <img class="diagram-zh" src="./media/dual-environment-anatomy.zh.svg" alt="..." />
  <img class="diagram-en" src="./media/dual-environment-anatomy.en.svg" alt="..." />
</figure>
```

按照浏览器安全规范，通过 `<img>` 标签加载的外部图形运行在隔离的文档上下文中。它无法读取宿主页面的根级样式变量（如 `--bg-top`、`--ink`、`--panel`、`--line`、`--accent`、`--teal`），也无法感知宿主 `<html>` 或 `<body>` 节点上的 `[data-theme="dark"]` 属性切换。无论外层页面如何切换深浅主题，图形内部始终保持静态的初始颜色。

### 1.2 根因二：`compiler.js` 内部硬编码了 100% 亮色粉彩调色盘

查看 `tools/diagram-engine/compiler.js` 第 17–32 行与第 596–659 行，编译器在生成矢量图时将所有泳道、节点、文字与连线写死为高明度浅色十六进制常量：

| 视觉元素 | 代码位置（`compiler.js`） | 硬编码填充色（`fill`） | 硬编码描边/文字色（`stroke` / `text`） | 暗色模式下的视觉缺陷 |
| :--- | :--- | :--- | :--- | :--- |
| 画布背景与时序标签底框 | 第 601、643、660 行 | `#FCF8F2`（暖白米色） | `#172430` / `#334155` | 在深色背景上形成刺眼的亮白色块 |
| 分组泳道（`GROUP_STYLES`） | 第 27–32 行 | `#FFF9F3` / `#F7FAFC` / `#FAF8FC` / `#F5FAF8` | 边框 `#DED2C3` ~ `#C5DDD8`，标题 `#7C2D12` ~ `#115E59` | 大面积近乎纯白的泳道框直接覆盖深空暗色背景 |
| 角色节点（`ROLE_STYLES`） | 第 17–25 行 | `#FFF1F2` / `#FFF7EF` / `#EFF9F7` / `#F2F7FB` 等 | 边框 `#E11D48` ~ `#AAB4C0`，主字 `#9F1239` ~ `#334155` | 浅粉、浅蓝、浅黄亮色实心底块在深灰底板上眩光严重 |
| 连线与辅助副文本 | 第 612、613、636 行 | `none` | 连线 `#64748B`，副文本 `#475569` | 当容器背景变暗且跨泳道悬空时，深灰连线与深灰底板对比度跌破 2.1:1，箭头与文字近乎隐形 |

检查 `posts/copilot-studio-managed-runtime-alm/media/dual-environment-anatomy.zh.svg` 与 `managed-runtime-alm-pipeline.zh.svg` 可以看到，未开启 `showCanvas` 时，外围泳道框之间完全透明，而泳道内部却是 `#FFF9F3`、`#F7FAFC`、`#FAF8FC` 三块高亮度浅色实心矩形；跨越泳道间隙的连线文字（`fill="#475569"`）直接暴露在暗色容器底板上，既看不清跨层连线，又被三道亮白横幅割裂了视觉焦点。

### 1.3 根因三：现有页面级暗色补丁各自为战，陷入「白膏药、黑底瞎字、反色失真」三重困境

由于外部矢量图无法随主题变色，仓库内不同文章尝试了三种临时妥协方案，但均未能解决融合问题：

1. **深色外框包裹亮白泳道（`tools/markdown-compiler/template.js` 第 319–322 行 & `copilot-studio-managed-runtime-alm`）**：
   模板设置 `[data-theme="dark"] .generated-diagram { background: rgba(22, 29, 38, 0.9); }`。外框虽然变暗，但内部图形依然顶着 `#FFF9F3` 等浅白泳道底色，同时跨泳道间隙的 `#475569` 深灰文字直接叠在 `rgba(22, 29, 38, 0.9)` 深色底板上，造成局部文字不可读与亮白条块炫光并存。
2. **强行锁死亮白底板（`posts/agentic-sales-mobile-proposal/index.html` 第 114–123 行）**：
   该文设置 `[data-theme="dark"] .generated-diagram { background: #F7FAFC; }`，直接把整张图表区域刷成刺眼的浅灰白底块，在 `#0f1318` 的深色阅读界面中像贴了一块突兀的白色补丁。
3. **粗暴反色滤镜（`posts/director-agent-engine-replacement/index.html` 第 40 行）**：
   该文设置 `[data-theme="dark"] .generated-diagram img { filter: invert(0.9) hue-rotate(180deg); }`。光学反相再旋转色相后，原有的米白底色变成浑浊的暗灰泥色，精确调配的语义品牌色（珊瑚橙、青绿、琥珀金）发生色偏失真，且与宿主页面毛玻璃面板（`rgba(30, 38, 48, 0.82)`）存在明显的色差边界。

### 1.4 全站 163 篇文章的图表碎片化盘点

对仓库 `posts/` 下全部 163 篇已发布文章（含门户索引的 145 篇与专项策略文章）进行全量扫描，当前全站混用了 5 种截然不同的图表实现方式：

| 图表实现形态 | 涉及文章数 | 存量实例规模 | 典型代表文章 | 视觉与工程痛点 |
| :--- | :---: | :---: | :--- | :--- |
| **1. `DiagramSpec` 编译双语图**（`.zh.svg` / `.en.svg`） | 7 篇 | 16 份 `.diagram.json` | `copilot-studio-managed-runtime-alm`、`director-agent-engine-replacement`、`knowledge-hub-diagram-engine` | 仅支持架构、流程、时序 3 种图；通过 `<img>` 挂载导致暗色模式割裂；连线为生硬直角折线，缺乏现代圆角拐弯与微光层次 |
| **2. 原生手写内联 `<svg>`** | 20 篇 | 67 个 `<svg>` 节点 | `exam-performance-modeling`（16 个）、`ai-era-application-evolution`（6 个）、`pptx-export-design`（6 个） | 每篇文章由作者或智能体手工硬算像素坐标，样式与字号标准不一，后续修改一处文案即需重算整张图坐标 |
| **3. 裸 `Mermaid` 语法块** | 14 篇 | 21 个图表块（9 篇加载运行时脚本） | `agentic-sales-mobile-features`、`pi-coding-harness`、`voice-speech-setup-guide` | 需在浏览器端加载体积庞大的渲染脚本；默认工程感粗糙，节点间距与字体排印与全站设计语言脱节，且无法原生支持单文件双语无闪烁切换 |
| **4. `<canvas>` 统计图与物理仿真** | 23 篇 | 28 个画布实例 | `buoyancy-principle`、`describing-motion`、`jev-system-one-research` | 适用于高频物理帧动画，但用于静态函数曲线或数据统计图时丧失了矢量缩放精度，无法被搜索引擎或无障碍树检索，且全屏演示缩放易模糊 |
| **5. HTML/CSS 卡片伪装图** | 101 篇 | 100+ 处网格/象限/轨道 | `article-diagram.css` 中的 `.signal-map`、`.mesh-board`、`.quadrant-board`、`.flow-grid` | 虽然继承了亮暗主题变量，但缺乏真实的拓扑连线路由能力（手机端 `.mesh-lines` 甚至被迫直接 `display: none` 隐藏连线），且无法绘制柱状、折线、桑基或雷达等定量图表 |

全站五套图形栈并存，导致文章内一旦同时出现「系统架构图」与「性能对比柱状图 / 象限矩阵图」，字体字号、圆角曲率、边框透明度与暗色底板就会出现多套视觉标准。因此，将架构流程图与数据统计图表收拢到同一套工具链，是实现全站界面风格高级统一的必经之路。

---

## 2. 市场顶尖图表与可视化工具深度横评（2025–2026 业界基准）

对照 Stripe Docs、Linear、Vercel、Distill.pub、Observable 以及 OpenAI / Anthropic 技术报告的出版级视觉水准，以下对「节点拓扑/架构流程图」与「数据统计/科学图表」两大赛道的代表性工具展开评估。

### 2.1 赛道 A：节点架构、流程、状态与拓扑图引擎

#### （1）D2（`terrastruct/d2` + ELK / TALA 布局引擎）
- **核心机制**：由 Terrastruct 用 Go 语言编写的现代声明式图表语言，旨在替代老旧的 Mermaid 与 Graphviz。支持容器多层嵌套、精准连接端口、SQL 表结构、时序图以及双主题 CSS 变量注入（`--d2-theme-id`）。
- **视觉表现力**：相比 Mermaid 具备更规整的容器嵌套与端口对齐，配合商业闭源的 TALA 布局引擎时，架构图的正交连线规整度较高。
- **工程局限**：
  1. **构建链路外部二进制依赖重**：需要宿主机器安装 Go 编译的 `d2` CLI 二进制文件，破坏了本仓库纯 Node.js 零外部系统依赖的轻量工具链；TALA 布局引擎为商业付费闭源组件，开源版仅能回退至 Dagre 或 ELK。
  2. **审美风格仍偏传统工程制图**：其输出的图形包含大量独立生成的 `<style>` 类名，缺乏 Study Room 特有的暖调沙盒玻璃质感、柔和渐变光晕与精细的副标题徽章排印。
  3. **品类单一**：完全不支持柱状图、折线图、散点图、雷达图、桑基图等数据可视化品类，无法满足「一套工具绘制所有图表」的核心诉求。

#### （2）Pintora / Pikchr / Kroki / Graphviz
- **核心机制**：
  - **Pikchr**（SQLite 团队出品）：基于 C 语言的相对方位标记语言（如 `box "A" then arrow then box "B"`），几何位置可控，但编写心智负担极高，复杂跨层连线需人工计算偏移量。
  - **Pintora**：纯 TypeScript 实现的类 Mermaid 扩展引擎，可在 Node.js 中运行，但默认视觉外观接近早期 UML 工具，缺乏现代高阶 UI 质感。
  - **Kroki**：聚合 20 余种图表工具的容器化网关，本身不提供统一的设计语言，反而会加剧不同图表之间的视觉分裂。

#### （3）React Flow（XYFlow）静态构建 / Excalidraw / Rough.js
- **核心机制**：
  - **Excalidraw / Rough.js**：主打手绘抖动线条（Sketch style）。适合白板头脑风暴，但与 Study Room 严肃、精密、现代的学术工程出版物气质背道而驰。
  - **XYFlow（React Flow）**：现代 AI 工作流产品（如 Dify、LangGraph Studio）广泛采用的节点画布，其圆角卡片、端口微光锚点与平滑贝塞尔曲线（SmoothStep / Bezier）极具现代感。但它本质上是重度依赖 React DOM 与浏览器测量生命周期的客户端交互框架，无法在零运行时的静态 HTML 页面中直接作为轻量构建器使用。不过，**XYFlow 的视觉设计语言（圆角半透明卡片 + 顶部语义色标条 + 4px 圆角正交步进连线 + 端口微圆点）非常值得我们在纯静态 SVG 编译器中直接吸纳复刻**。

#### （4）ELK.js（Eclipse Layout Kernel）+ 定制设计系统原生 SVG 渲染器（Design-System-Native Code-Generated SVG）
- **核心机制**：将「拓扑几何布局计算」与「视觉表面渲染」彻底解耦。底层采用业界最强的开源分层正交自动布局算法 **ELK（Layered / Mr.Tree / Force 算法）** 或增强版分层正交路由器计算节点坐标、端口分配与避障折线路径；上层由定制的纯 Node.js 矢量渲染器输出 100% 绑定宿主页面 CSS 变量的语义化 `<svg>`。
- **视觉表现力**：这是 Stripe、Linear 与 Vercel 官方架构图采用的真实生产方式——不依赖第三方工具粗糙的默认皮肤，而是把图表中的每一个容器、卡片、角标、连线都当作页面 UI 组件的矢量延伸，共享完全相同的颜色令牌、圆角半径、字体族与暗色光影规范。

### 2.2 赛道 B：数据可视化与科学图表引擎

#### （1）Observable Plot / D3（构建期同构直出纯语义 SVG）
- **核心机制**：由 D3.js 创始人 Mike Bostock 打造的高阶声明式图形语法库。在 Node.js 构建期配合轻量虚拟 DOM（如 `linkedom` 或纯函数式标尺计算 `d3-scale` + `d3-shape`），可在毫秒级直接生成零客户端运行时的纯语义 `<svg>`。
- **视觉表现力**：代表了 Distill.pub、The New York Times 与 Observable 平台的最高出版美学。坐标轴极简克制（无多余外框线、虚线网格极细淡、数字采用等宽对齐 `tabular-nums`、直接在线段末端标注数据标签而非堆砌图例框）。
- **工程优势**：生成的 SVG 结构极其干净，天然支持将填充色与描边色写为 `var(--accent)`、`var(--teal)`、`var(--ink)`、`var(--line)`，亮暗切换零割裂。

#### （2）Apache ECharts 5.x / 6.x SSR SVG 模式
- **核心机制**：通过 `echarts.init(null, null, { renderer: 'svg', ssr: true, width, height })` 配合 `renderToSVGString()` 在服务端输出静态矢量图。
- **视觉与工程局限**：
  1. **商业大屏感过重，缺乏出版级呼吸感**：默认刻度线、图例框与配色偏传统 BI 报表，与深度长文的书卷杂志感不够协调。
  2. **静态亮暗切换困难**：`renderToSVGString()` 导出的 SVG 属性中写死了计算后的 RGB 色值，无法在同一份静态 SVG 中直接依赖宿主 CSS 变量无损完成复杂渐变与暗色高光切换。

#### （3）Vega-Lite
- **核心机制**：华盛顿大学 IDL 实验室提出的声明式可视化 JSON 语法，学术严谨度高，擅长统计分布图。
- **局限**：完全不支持系统架构图、泳道流程图与时序图，且输出的 SVG 嵌套层级深、样式内联固定，难以与宿主页面暗色毛玻璃风格深度融合。

---

## 3. 核心破局方案：构建统一的「Study Room Figure Engine v2」

用户的核心诉求非常明确：**全站所有图表（含架构图、流程图、时序图、象限图、统计图表等）必须用统一的工具绘制，且在暗色与亮色模式下都必须与整个界面高度贴切融合、高级大气；通过代码生成达到同等甚至更高效果完全可行。**

为什么市面上没有任何单一现成的开源黑盒能直接满足这一要求？因为架构拓扑工具（如 D2、Mermaid）不会画统计数据图，而统计图表工具（如 ECharts、Vega-Lite）不会画多层嵌套架构泳道与时序调用，且它们导出的外部 SVG 文件都会被 `<img src>` 挡在宿主 CSS 主题变量门外。

因此，最彻底、最优雅的破局方案是将现有的 `tools/diagram-engine/` 升级演进为全站统一的声明式代码生成引擎——**Study Room Figure Engine v2（统一声明式 `FigureSpec` + 同构几何/标尺编译器 + 原生 CSS 变量内联双语 SVG）**。

### 3.1 亮色与暗色 100% 原生无感融合的架构机制

要彻底根除暗色模式下的「白底补丁」与「滤镜失真」，Figure Engine v2 在渲染层执行三项铁律：

1. **废除 `<img src="...svg">` 外链隔离，全面采用构建期内联语义化 `<svg>`**：
   在 `tools/markdown-compiler/` 编译文章或构建 HTML 时，编译器直接将生成的 `<svg class="sr-figure-svg">` 节点内联嵌入 `<figure class="sr-figure">` 容器中。内联 SVG 与宿主 HTML 处于同一个 DOM 树下，100% 实时继承 `assets/article.css` 中的所有 CSS 自定义属性。
2. **零硬编码十六进制色值，全量绑定双主题设计令牌（Design Tokens）**：
   图形内部严禁再出现 `#FFF9F3`、`#FFF1F2`、`#475569` 等死颜色。在 `assets/article.css`（或 `assets/article-figure.css`）中定义一套专供图表使用的双模语义令牌：

```css
:root {
  /* 画布与容器层：亮色下为通透暖白玻璃，与页面 --panel 浑然一体 */
  --fig-canvas-bg: rgba(255, 255, 255, 0.52);
  --fig-group-bg-1: rgba(255, 249, 242, 0.68);
  --fig-group-bg-2: rgba(244, 248, 251, 0.68);
  --fig-group-border: rgba(23, 36, 48, 0.10);
  --fig-group-divider: rgba(23, 36, 48, 0.07);

  /* 节点卡片层：白瓷微立体感 */
  --fig-node-bg: rgba(255, 255, 255, 0.92);
  --fig-node-border: rgba(23, 36, 48, 0.12);
  --fig-node-top-glow: rgba(255, 255, 255, 0.85);
  --fig-text-strong: #172430;
  --fig-text-muted: #5d6c76;
  --fig-edge-stroke: #64748b;
  --fig-edge-label-bg: rgba(252, 246, 238, 0.92);
  --fig-grid-line: rgba(23, 36, 48, 0.08);

  /* 角色语义色（亮色模式：低明度高对比文字 + 柔彩填充 + 清晰边框） */
  --fig-role-accent-fill: rgba(255, 122, 0, 0.09);
  --fig-role-accent-stroke: rgba(255, 122, 0, 0.45);
  --fig-role-accent-text: #9a3412;

  --fig-role-teal-fill: rgba(13, 143, 140, 0.09);
  --fig-role-teal-stroke: rgba(13, 143, 140, 0.45);
  --fig-role-teal-text: #115e59;

  --fig-role-blue-fill: rgba(30, 58, 95, 0.07);
  --fig-role-blue-stroke: rgba(59, 130, 246, 0.38);
  --fig-role-blue-text: #1e3a5f;

  --fig-role-rose-fill: rgba(225, 29, 72, 0.08);
  --fig-role-rose-stroke: rgba(225, 29, 72, 0.42);
  --fig-role-rose-text: #9f1239;
}

[data-theme="dark"] {
  /* 画布与容器层：暗色下为深空岩石半透明层，透出底部环境星云光晕 */
  --fig-canvas-bg: rgba(18, 24, 32, 0.55);
  --fig-group-bg-1: rgba(26, 34, 46, 0.62);
  --fig-group-bg-2: rgba(22, 31, 42, 0.62);
  --fig-group-border: rgba(255, 255, 255, 0.08);
  --fig-group-divider: rgba(255, 255, 255, 0.06);

  /* 节点卡片层：Linear / Vercel 级深色微光玻璃卡片 */
  --fig-node-bg: rgba(30, 40, 52, 0.88);
  --fig-node-border: rgba(255, 255, 255, 0.11);
  --fig-node-top-glow: rgba(255, 255, 255, 0.16);
  --fig-text-strong: #f1f5f9;
  --fig-text-muted: #94a3b8;
  --fig-edge-stroke: #94a3b8;
  --fig-edge-label-bg: rgba(17, 24, 32, 0.92);
  --fig-grid-line: rgba(255, 255, 255, 0.07);

  /* 角色语义色（暗色模式：深色低透明底色 + 微发光描边 + 高明度柔和字色） */
  --fig-role-accent-fill: rgba(255, 122, 0, 0.14);
  --fig-role-accent-stroke: rgba(255, 147, 64, 0.52);
  --fig-role-accent-text: #fdba74;

  --fig-role-teal-fill: rgba(13, 143, 140, 0.15);
  --fig-role-teal-stroke: rgba(45, 212, 191, 0.48);
  --fig-role-teal-text: #5eead4;

  --fig-role-blue-fill: rgba(56, 189, 248, 0.12);
  --fig-role-blue-stroke: rgba(96, 165, 250, 0.45);
  --fig-role-blue-text: #93c5fd;

  --fig-role-rose-fill: rgba(244, 63, 94, 0.15);
  --fig-role-rose-stroke: rgba(251, 113, 133, 0.52);
  --fig-role-rose-text: #fda4af;
}
```

3. **现代高阶视觉细节（告别生硬方框与直角折线）**：
   - **圆角正交步进连线（Rounded Orthogonal Step Routing）**：将现有 `routeEdge` 中的尖锐直角 `M x1 y1 V ym H x2 V y2` 升级为带 `r=8px` 二次贝塞尔圆弧拐角（`Q cx cy ex ey`）的平滑正交路径，并在连线起点增加 `r=3px` 的锚点空心圆环，终点采用流线型微弧箭头。
   - **连线标签胶囊底托（Pill Label Backdrop）**：所有跨层连线文字下方自动生成 `<rect rx="6" fill="var(--fig-edge-label-bg)" stroke="var(--fig-group-border)"/>` 胶囊底托，彻底解决暗色模式下连线文字与背景或线条重叠看不清的问题。
   - **卡片顶部微光高光边与角色色标**：每个节点卡片顶部内嵌 1px `stroke="var(--fig-node-top-glow)"` 镜面高光与左侧 3.5px 圆角语义色竖条，在暗色模式下呈现出类似 Linear 与 Raycast 的精致空间层次感。
   - **单 SVG 内置双语零请求秒切**：内联 `<svg>` 内部直接将中英文 `<text class="lang-zh">` 与 `<text class="lang-en">`（或通过 `data-zh` / `data-en` 属性配合页面语言切换器）渲染在同一棵矢量树中，切换语言时零网络请求、零闪烁。同时编译期依然保留同步生成 `.zh.svg`、`.en.svg` 与 `.drawio` 文件的能力，100% 兼容现有的灯箱放大、课堂演示模式与 PPTX 导出器。

### 3.2 一套工具统管全站 8 大图表家族（Unified Figure Taxonomy）

通过统一声明式输入契约 `FigureSpec v2`（在 Markdown 文章中统一使用 `:::figure` 指令，或在工程目录中存放 `.figure.json`），同一个编译器内核下辖两大几何计算管线，覆盖全站所有视觉表达场景：

| 图表家族分类 | `type` 枚举值 | 底层几何与布局算法 | 典型应用场景与视觉特征 |
| :--- | :--- | :--- | :--- |
| **1. 系统架构与分层拓扑图** | `architecture` / `topology` | 分层网格容器布局 + 圆角正交避障路由器（可按需调用 `elkjs` 处理复杂跨层 DAG） | 多层控制平面/数据平面边界、微服务拓扑、容器部署架构；带泳道标题栏、编号徽章与端口锚点 |
| **2. 流程图与状态机** | `flowchart` / `state` | 有向图分层排序 + 菱形判定分支/环形回路圆角路由 | 审批工作流、异常处理回退分支、Agent 循环状态转换；支持判定节点与虚线回退边 |
| **3. 交互时序图** | `sequence` | 等距或自适应生命线布局 + 激活期（Activation Box）+ 分组片段框（`alt`/`loop`） | 跨服务 API 调用、鉴权握手、异步回调；生命线与消息胶囊标签随暗色主题自适应 |
| **4. 四象限与对比矩阵图** | `quadrant` / `matrix` | 二维归一化坐标映射 $(x, y) \in [0, 100]^2$ + 碰撞消解标签排布 | 技术选型象限、成本-收益评估矩阵；替代原本需手写绝对定位 CSS 的 `.quadrant-board` |
| **5. 漏斗、桑基与流向图** | `funnel` / `sankey` | 梯形流量衰减几何 / 三次贝塞尔流带（Cubic Bezier Ribbon）宽度守恒算法 | 销售转化漏斗、Token 预算分配流向、生源/分数段去向分布 |
| **6. 柱状、条形与区间对比图** | `bar` / ` lollipop` / `range` | 离散分类标尺 + 连续线性/对数标尺 + 端头圆角矩形 + 末端直接数值标注 | 模型基准测试跑分对比、延迟分位数（P50/P95/P99）对比、年度配额变化 |
| **7. 折线、面积与科学函数曲线** | `line` / `area` / `function` | Catmull-Rom 样条平滑插值 / 数学表达式采样 + 极简淡网格 + 渐变面积填充 | 训练 Loss 收敛曲线、微积分/物理函数图像、时间序列趋势、置信区间带（Confidence Band） |
| **8. 雷达图與树状层级图** | `radar` / `tree` | 极坐标多边形网格投影 / 紧凑树（Reingold-Tilford 算法） | 多模型能力六维评测雷达图、知识图谱分类树、组织架构树 |

---

## 4. 多方案客观横评矩阵与架构选型结论

针对本项目「高审美上限、暗色模式无缝融合、全图表品类统一、中英双语切换、GitHub Pages 纯静态零运行时依赖、PPT 导出兼容」七大约束，以下对三种候选技术路线进行量化对比：

| 评估维度（满分 5 ★） | 方案一：自研升级 **Study Room Figure Engine v2**（拓扑路由 + 数据标尺 + CSS 变量内联双语 SVG） | 方案二：引入 **D2 CLI + Observable Plot** 双工具拼装 | 方案三：引入 **Apache ECharts SSR + Mermaid** 组合 |
| :--- | :--- | :--- | :--- |
| **1. 暗色模式融合度** | ★★★★★<br>内联 SVG 100% 绑定页面 `--fig-*` CSS 变量，毛玻璃半透明底色与微光边框随主题 0 延迟呼吸切换，零白底补丁、零反色滤镜失真 | ★★★☆☆<br>Observable Plot 易适配 CSS 变量，但 D2 含大量独立样式规则且需双工具分别调校暗色色板，视觉质感存在断层 | ★★☆☆☆<br>ECharts SSR 导出死 RGB 色值，Mermaid 需客户端重绘或两套独立主题配置，暗色下极易出现底色与页面脱节 |
| **2. 视觉高级感上限** | ★★★★★<br>对标 Linear / Stripe / Distill 出版级审美：圆角正交连线、胶囊边标签、卡片顶边微光、极简等宽数字坐标轴，全站字体与圆角 100% 统一 | ★★★★☆<br>Plot 具备优秀学术出版感，但 D2 的工程框线风格与 Plot 放在同一篇文章中仍有明显的「两套工具」痕迹 | ★★☆☆☆<br>ECharts 偏传统商业 BI 报表感，Mermaid 偏粗糙工程草图感，难以达到顶奢技术出版物水准 |
| **3. 图表品类覆盖广度** | ★★★★★<br>单一 `FigureSpec` 契约覆盖架构、流程、时序、象限、桑基/漏斗、柱状、折线/函数、雷达/树图 8 大家族 | ★★★★☆<br>覆盖架构与常见统计图，但两套 DSL 语法截然不同（`.d2` 文本 vs JS 代码） | ★★★★☆<br>覆盖面广，但同样分裂为 Mermaid 字符串与 ECharts Option 两种异构配置 |
| **4. 中英双语切换体验** | ★★★★★<br>原生支持单文件 `zh`/`en` 双语属性，内联 SVG 随顶栏语言按钮瞬间切换，同时编译产物保留 `.zh.svg` 与 `.en.svg` | ★★☆☆☆<br>D2 与 Plot 均无原生双语同源契约，必须外包一层脚本分别编译两套文件并通过 `<img>` 显隐切换 | ★★☆☆☆<br>无原生双语机制，需在业务层维护两份配置并重复渲染 |
| **5. 纯静态零依赖兼容性** | ★★★★★<br>100% 纯 Node.js 编译期生成静态矢量图，读者浏览器端零额外 JS 运行时负载，GitHub Pages 直接托管 | ★★★☆☆<br>D2 强依赖宿主安装 Go 二进制 CLI，跨机器协作与环境初始化成本高 | ★★★☆☆<br>Mermaid 若走客户端渲染会拖慢首屏并引发排版抖动；若走 Puppeteer 预渲染则构建极慢 |
| **6. AI 与人工编写友好度** | ★★★★★<br>单一 JSON / Markdown `:::figure` 声明式契约，AI 只需填写语义数据或节点关系，无需手算任何像素坐标 | ★★★☆☆<br>Agent 需同时掌握 D2 专有语法与 Observable Plot API 两套规则 | ★★★☆☆<br>ECharts 配置项极其繁琐（动辄上百行嵌套样式），AI 极易写出冲突色值 |
| **7. 演示模式与 PPT 导出** | ★★★★★<br>完全受控的 `viewBox` 几何模型，无缝对接现有全屏演示、灯箱放大、PPTX 导出器与 `.drawio` 工程文件下载 | ★★★☆☆<br>Plot 不支持导出 `.drawio`，且两套工具的尺寸比例难以统一适配演示模式步进容器 | ★★☆☆☆<br>ECharts 静态 SVG 缺乏可编辑 `.drawio` 源，PPT 导出易遇字体回退问题 |
| **综合推荐指数** | **★★★★★（唯一满足全部核心诉求的首选架构）** | **★★★☆☆（次选，存在双工具割裂与二进制依赖）** | **★★☆☆☆（不推荐，美学上限与暗色融合度不足）** |

---

## 5. 分阶段落地演进路线与视觉设计规范

为确保平滑演进且不破坏现有 163 篇文章的稳定性，建议按三个阶段推进升级：

### 5.1 第一阶段：暗色原生令牌体系与架构/流程/时序引擎升级（v1 → v2 核心层）
1. **建立全站图表双模 CSS 令牌（`assets/article-figure.css` 或合入 `assets/article.css`）**：
   正式引入 `--fig-canvas-bg`、`--fig-group-bg-*`、`--fig-node-bg`、`--fig-node-border`、`--fig-node-top-glow`、`--fig-edge-stroke`、`--fig-edge-label-bg` 以及 7 类角色语义色在 `:root` 与 `[data-theme="dark"]` 下的精确映射。
2. **改造 `tools/diagram-engine/compiler.js` 矢量序列化器**：
   - 将硬编码的 `#FFF9F3`、`#FFF1F2` 等浅色常量替换为 `var(--fig-role-*, #fallback)`（保留十六进制回退值以保证独立打开 `.svg` 文件时依然正常显示，而在内联嵌入 HTML 页面时自动激活动态 CSS 变量）；
   - 将直角折线 `routeEdge` 升级为 `r=8px` 圆角正交步进路径，并为所有连线文字添加 `--fig-edge-label-bg` 圆角胶囊底框；
   - 为节点卡片增加顶部微光内描边与左侧语义色条，字体排印统一采用 `"Space Grotesk", "Noto Sans SC", sans-serif`。
3. **升级 `tools/markdown-compiler/directives.js` 的 `:::diagram` / `:::figure` 渲染器**：
   支持构建期直接将 SVG 内联注入 `<figure class="generated-diagram is-inline-svg">` 中（或提供轻量同源注入），彻底打通宿主页面的 `[data-theme="dark"]` 样式作用域，并移除历史文章中 `filter: invert(0.9) hue-rotate(180deg)` 与死白底板补丁。

### 5.2 第二阶段：扩充定量数据可视化与象限/流向图编译器（覆盖 8 大图表家族）
1. **新增统一数据图表编译模块（`tools/diagram-engine/charts.js`）**：
   基于零依赖确定性标尺算法，在 `compiler.js` 中新增对 `bar`（柱状/条形图）、`line`/`area`/`function`（折线/面积/数学函数曲线）、`quadrant`（二维象限矩阵）、`sankey`/`funnel`（桑基/漏斗图）和 `radar`（雷达图）的编译支持。
2. **出版级图表排印规范**：
   - 坐标轴去除冗余外框，仅保留底轴与极淡水平参考虚线（`stroke="var(--fig-grid-line)" stroke-dasharray="4 4"`）；
   - 所有数值刻度强制启用 `font-variant-numeric: tabular-nums`；
   - 数据系列优先采用直接末端标注（Direct Labeling）与柔和面积渐变（`<linearGradient>` 绑定 `var(--accent)` / `var(--teal)` 至透明），避免传统图例框挤占画布空间。

### 5.3 第三阶段：存量文章渐进式收拢与门禁闭环
1. **建立图表视觉与暗色对比度自动化门禁**：
   在 `tests/` 验收测试中增加针对图表暗色模式的断言：禁止在 `.generated-diagram` 上使用 `filter: invert()`，禁止在 SVG 节点上出现未绑定 CSS 变量的纯白底色块，校验暗色模式下连线文字与背景的对比度 $\ge 4.5:1$。
2. **存量碎片化图表收拢**：
   新撰写或重构的文章统一使用 `FigureSpec` 生成全部架构图与数据图表，逐步替换存量文章中的裸 Mermaid 脚本与手写像素坐标 `<svg>`。

---
title: Markdown 渲染管线：内容与展现解耦
eyebrow: Evolution Proposal
brand: Knowledge Hub
date: 2026-04-16
strict_i18n: false
strict_density: true
lead: 将文章的内容创作（Markdown）与阅读展现（渐进呈现 HTML）彻底解耦。Build-time 为主路径生成静态 HTML，Runtime 阅读器为辅提供外部 Markdown URL 的即时阅读体验。
hero_actions:
  - "查看架构 | #architecture"
  - "实施阶段 | #phases"
panel_label: 核心收益
panel_title: Markdown 是 source of truth，HTML 是生成产物。
panel:
  - 生成效率：Markdown 内容量远小于等效 HTML
  - 维护门槛：人可直接编辑 .md，无需理解 HTML 结构
  - 扩展能力：引用外部 Markdown 链接即可视觉增强
metrics:
  - "上次 PoC | 900 LOC | 自定义解析器，仅 1 篇文章使用"
  - "新方案解析器 | marked.js | 成熟库替代手写正则"
  - "渲染模式 | 双模式 | Build-time 主 + Runtime 辅"
  - "迁移策略 | Opt-in | 现有 HTML 文章不强制迁移"
style:
  accent: "#0fb5ae"
---

## #retro 01 / 上次尝试复盘 :: article-renderer.js 验证了什么、止步于什么

2026 年 4 月，我们构建了一套 900 行纯 JS 运行时渲染器，把 `article.md` 在浏览器端解析为渐进呈现页面。它作为 PoC 验证了关键映射约定，但因架构局限最终被搁置。

:::accordion
::panel { open: true }
### 验证成功的设计
**Frontmatter → Hero 映射**

eyebrow / panel / metrics 等元数据通过 YAML frontmatter 配置驱动 hero 区域，消除了手写 hero HTML 的重复劳动。

**H2 → 编号 Section**

`## 标题` 自动映射为带 section-kicker（01 / 标题）的编号章节，约定简洁且一致。

**H3 → Insight Card**

三级标题自动生成编号卡片网格，适合展示并列知识点。

**HR → 演示断点**

`---` 水平线标记 `data-present-step` 幻灯片边界，Markdown 作者无需关心演示模式细节。

**双视图切换**

渐进呈现（主）与纯 Markdown 线性阅读（辅）的切换按钮，让读者自由选择阅读模式。

::panel
### 搁置的原因
- ⚠️ **纯 Runtime 架构**——每次页面加载都要 fetch .md 文件并在浏览器端解析，有性能开销。GitHub Pages 无法索引客户端渲染内容，SEO 为零。
- ⚠️ **自定义解析器脆弱**——900 行手写正则只覆盖 Markdown 子集（无删除线、脚注等），边界情况多，与 marked.js 等主流库行为不一致。
- ⚠️ **零实际采纳**——50+ 篇文章中只有 `claw-code-analysis` 一篇使用了渲染器，并且最终仍手写了独立的 `index.html`。
- ⚠️ **维护负担高**——自定义 inline 渲染逻辑（bold / italic / link / image）用正则实现，扩展或修 bug 的成本远高于使用成熟库。
:::

## #architecture 02 / 架构设计 :: Build-time 为主 + Runtime 为辅

吸取上次纯 Runtime 的教训，新方案以 Build-time 渲染为主路径（Node.js 脚本），Runtime 阅读器为辅路径（外部 Markdown URL 即时渲染）。

:::accordion
::panel { open: true }
### 渲染管线总览
article.md

Frontmatter + Markdown

→

marked.js

标准解析器

→

article-template.js

组件映射 + HTML 模板

→

index.html

静态可部署页面

Build-time 主路径：`node tools/render.js posts/{slug}`

::panel
### Build-time 与 Runtime 对比
| 维度 | Build-time（主路径） | Runtime（辅助路径） |
| --- | --- | --- |
| 用途 | 自己撰写的文章 | 外部 Markdown URL / 快速预览 |
| 工具 | `node tools/render.js` | `reader/index.html?url=...` |
| 解析器 | bundled marked.js（无 npm） | CDN marked.js |
| 产物 | 静态 HTML（提交到 git） | DOM 动态生成 |
| SEO | ✅ 完全可索引 | ❌ 客户端渲染 |
| 性能 | ✅ 零运行时开销 | 有 fetch + parse 延迟 |

::panel
### 为什么不用纯 Runtime
- 🔍 **SEO**——GitHub Pages 索引的是 HTML 文件，客户端渲染的内容对搜索引擎不可见。
- ⚡ **性能**——每次访问都有额外的网络请求（fetch .md）+ 浏览器端解析开销。
- 🔗 **可靠性**——外部 URL 的 CORS 限制和网络波动会导致页面白屏。

::panel
### 关于 no build step 约束
当前 `copilot-instructions.md` 声明了 "no build step, no framework, no SSG"。这条约束制定于所有文章都是手写 HTML 的时期。新方案中的 render 脚本与已有的 `tests/validate.js` 属于同一层级的工具脚本，不是 SSG 或 bundler。

需要内容创作与展现解耦时，这条约束应更新为：

- 允许使用工具脚本（`tools/` 目录下的 Node.js 脚本）进行 Markdown → HTML 渲染
- 禁止引入 npm 依赖管理、构建流水线或框架
- marked.js 以 bundle 单文件形式提交到仓库，与 pptxgen.bundle.js 同一模式
:::

## #convention 03 / 映射约定 :: Markdown 元素到渐进呈现组件的映射规则

这套约定决定了 Markdown 作者需要学习的心智模型：用标准 Markdown 语法写内容，渲染器自动生成对应的渐进呈现组件。

:::accordion
::panel { open: true }
### 标准映射表
| Markdown 元素 | 渐进呈现组件 |
| --- | --- |
| Frontmatter `title` | Hero `<h1>` |
| Frontmatter `eyebrow` / `panel` / `metrics` | `.eyebrow` / `.hero-panel` / `.hero-metrics` |
| H2 前的首段文本 | `.hero-copy` 描述段落 |
| `## 标题` | 编号 `.section` + `.section-kicker`（01 / 标题） |
| `### 标题`（在 H2 下） | `.subsection-accordion` 手风琴项 |
| `> 引用` | `.insight-callout`（首行 = 标题） |
| `---` 水平线 | `[data-present-step]` 演示断点 |
| 管道表格 | `.compare-wrap > .compare-table` |
| 代码块 | `.code-block` + 语言标签 |
| `` ```mermaid `` | Mermaid 图表（客户端延迟渲染） |
| `![alt](src)` | 响应式图片 + lightbox |

::panel
### 复杂组件的处理策略
部分渐进呈现组件（scenario-grid、step-flow、comparison-grid 等）没有标准 Markdown 对应物。分两阶段解决：

Phase 1：HTML 直写

**Markdown + 行内 HTML**

Markdown 原生支持行内 HTML。对于少量复杂布局，作者直接在 .md 中嵌入 HTML 片段。零解析器定制成本，立即可用。

Phase 2：自定义容器

**:::directive 语法**

当同类布局模式出现 3 次以上时，引入 marked.js 扩展注册自定义容器 token。例如 `:::scenario-grid` 自动生成卡片网格。

::panel
### Frontmatter 完整规格
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 文章标题 → Hero h1 |
| `eyebrow` | string | 标题上方的 kicker 标签 |
| `date` | YYYY-MM-DD | 发布日期 |
| `brand` | string | Topbar 品牌文字（默认取 knowledge-data.js 父节点） |
| `panel_label` | string | Hero panel 顶部标签 |
| `panel_title` | string | Hero panel 标题 |
| `panel_desc` | string | Hero panel 描述 |
| `panel` | array | Hero panel 编号列表项 |
| `metrics` | array | 格式 `Label &#124; Value &#124; Desc`，生成 hero-metrics 卡片 |
| `nav` | auto / array | 导航链接（默认从 H2 自动生成） |
:::

## #phases 04 / 实施阶段 :: 四阶段渐进式推进

每个阶段独立可交付，前一阶段的产物是后一阶段的输入。Phase 1-2 构建核心并验证，Phase 3-4 拓展能力并集成到工作流。

1

### 渲染器核心

打包 marked.js 为单文件 bundle；创建 `tools/render.js` 和 `tools/article-template.js`；实现 Markdown → HTML 映射约定。

2

### 验证与对比

用渲染器重新生成 `claw-code-analysis`，与手写版结构对比；新写一篇 Markdown 文章验证完整工作流；通过 `validate.js` 检查。

3

### Runtime 阅读器

创建 `reader/index.html`，支持 `?url=` 外部 Markdown URL 和 `?slug=` 本地文章，含渐进 ↔ 纯 Markdown 视图切换。

4

### 工作流集成

更新 `copilot-instructions.md` 反映新 authoring 流程；在 `validate.js` 中增加 .md 与 .html 时间戳一致性检查。

:::accordion
::panel
### Phase 1 详细任务清单
- 📦 下载 marked.js 发行版，打包为 `assets/marked.bundle.js`——单文件提交，与 `pptxgen.bundle.js` 同一模式，不引入 npm。
- 🔧 创建 `tools/render.js`——读取 `posts/{slug}/article.md`，解析 frontmatter + markdown body，套用 HTML 模板，写入 `posts/{slug}/index.html`。支持 `--watch` 文件监听。
- 🎨 创建 `tools/article-template.js`——生成符合 `article-pages.instructions.md` 规范的完整 page-shell / hero / main / footer / script 加载顺序。
- 🔄 实现映射约定：H2 → 编号 section、H3 → accordion、blockquote → callout、table → compare-table、HR → data-present-step。

::panel
### Phase 2 验证标准
- ✅ 渲染 `claw-code-analysis/article.md` → 产出的 HTML 与现有手写版在结构层面一致（section 数量、accordion 数量、hero 元素）。
- ✅ `node tests/validate.js` 对所有渲染产物 exit 0。
- ✅ 浏览器视觉验证：hero / sections / accordions / dark mode / presentation mode 全部功能正常。
- ✅ `article-common.js` 在渲染页面上正确初始化（scroll-reveal、accordion toggle、nav highlighting）。
- ✅ `article-presentation.js` 正确发现 slides（section count、accordion sub-slides、data-present-step markers）。

::panel
### Phase 3 Runtime 阅读器设计
创建 `reader/index.html`——一个通用 Markdown 阅读器页面：

- 🌐 接受 `?url=` 参数加载外部 Markdown URL（需 CORS 可达）。
- 📁 接受 `?slug=` 参数加载本地 `posts/{slug}/article.md`。
- 🔄 含视图切换：渐进呈现（默认）↔ 纯 Markdown 线性阅读。
- 🎨 使用与 build-time 相同的模板逻辑，仅在客户端执行。Dark/light 主题同步。
:::

## #decisions 05 / 已做决策 :: 六项关键架构决策及其理由

- 🏗️ **Build-time 优先，Runtime 辅助**——SEO 和首屏性能优先于纯客户端的简洁性。GitHub Pages 直接部署静态 HTML。
- 📚 **marked.js 替代自定义解析器**——成熟库，完整 Markdown 规范覆盖，扩展性好。消除 900 行手写正则的维护风险。
- 🔀 **不强制迁移**——现有 50+ 篇 HTML 文章保持原样，新文章 opt-in Markdown。两种格式长期共存。
- 📦 **marked.js 以 bundle 提交**——单 .js 文件提交到 `assets/`，与 `pptxgen.bundle.js` 同模式，不引入 npm / node_modules。
- 📝 **HTML 产物提交 git**——.md 和 .html 都被跟踪。保证 GitHub Pages 直接部署，不依赖 CI/CD 构建步骤。
- 🧩 **Mermaid 保持客户端渲染**——Build-time Mermaid 需要 headless browser（puppeteer），太重。渲染器输出 `<div class="mermaid">`，浏览器端延迟初始化。

## #open-questions 06 / 待确认事项 :: 三个需要你决定的问题

:::accordion
::panel { open: true }
### 增量验证规模
Phase 2 成功后，是否选 3 篇代表性文章做 Markdown 反向转换，以验证映射约定在不同复杂度下的表现？

**简单文章**

纯文本 + 表格 + 少量 accordion，验证基础映射。

**复杂布局文章**

含 scenario-grid、step-flow、comparison-grid 等自定义组件，验证 HTML 直写兼容性。

**Mermaid 文章**

含多个 Mermaid 图表，验证客户端延迟渲染与 build-time 产出的兼容性。

::panel
### knowledge-data.js 自动同步
渲染器是否应从 frontmatter 自动更新 `knowledge-data.js` 条目（title / summary / tags / date）？

- 👍 **自动同步的好处**——消除 .md 与 knowledge-data.js 的手动双写，减少不一致风险。
- 👎 **自动同步的风险**——knowledge-data.js 包含 Galaxy 渲染参数（phase / speed / orbitIndex / relations），这些不应由 frontmatter 控制。需要精确的 merge 逻辑。
- 💡 **建议**——先不做，保持手动注册。等 10+ 篇 Markdown 文章存在后，评估双写痛点是否值得投入。

::panel
### H3 映射为 Accordion 还是 Insight Card
上次 PoC 中 H3 映射为 insight-card（编号卡片网格），但当前大部分文章的 H3 对应的是 accordion 手风琴。两种映射各有优势：

H3 → Accordion

**默认方案（推荐）**

与现有 50+ 篇文章的结构一致。H3 作为可展开子节标题，内容折叠呈现，适合深度阅读场景。演示模式自动拆分为 overview + detail slides。

H3 → Insight Card

**可选模式**

适合并列知识点的快速浏览（如 "5 个关键发现"）。可通过 frontmatter 或 section-level 标记切换。

建议：默认 H3 → accordion，通过 frontmatter 字段（如 `card_sections: [2, 4]`）指定特定 section 使用 card 模式。
:::

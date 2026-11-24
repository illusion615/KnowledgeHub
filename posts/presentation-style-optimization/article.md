---
title: 演示模式内容与式样优化设计
eyebrow: Design Document
brand: Knowledge Hub
date: 2026-04-20
strict_i18n: false
strict_density: true
lead: 针对演示排版可读性、讲解模式认知负荷和移动端录制适配三个维度，基于行业最佳实践提出系统性优化方案。
hero_actions:
  - "查看解决方案 | #solution"
  - "现状分析 | #gap-analysis"
panel_label: 核心框架
panel_title: 两种演示类型 × 三层渐进优化
panel:
  - 阅读演示：内容以合理结构渐进呈现，观众自主阅读幻灯片
  - 讲解演示：内容降为视觉锚点，仅保留关键信息辅助语音叙事
  - 三层实施：排版放大 → 聚焦模式 → 竖屏视口
metrics:
  - "正文字号提升 | +56% | 15.4px → 19–24px"
  - "认知负荷减少 | ~40% | 聚焦模式淡化次要内容"
  - "移动端可读性 | 9:16 | 竖屏视口 + 字号 ×1.3"
  - "影响文件 | 6 | CSS + JS + HTML 共享资产"
style:
  accent: "#7c3aed"
---

## #gap-analysis 01 / Gap Analysis :: 现状分析：三个维度的系统性差距

演示模式在排版可读性、讲解认知分配和录制输出适配三个维度存在结构性缺陷，可从三组实测指标逐一拆解根因。

:::accordion
::panel
### 排版可读性：正文字号未针对演示场景覆盖
问题本质

演示模式直接继承文章阅读基线 `0.96rem`（15.36px），1080p 投影仪上 3 米外几乎不可读。

**当前值**

- 正文：**15.36px**
- 字幕：**13.76px**
- 移动端断点：**无**

**行业基准**

- Reveal.js 默认：**40px**
- Google Slides：**~28px**
- 字幕最低标准：**18px**

CSS 根因

`.is-presentation-mode` 仅覆盖标题和概览描述字号，未覆盖 `.subsection-content p/li`、`.event-field` 正文容器。移动端无专属媒体查询。

::panel
### 讲解模式认知负荷：文字墙与语音叙事争夺注意力
认知科学基础

Mayer 多媒体学习理论：视觉与听觉同时传递冗余详细信息时，学习效果**反而下降**（冗余效应）。

**当前行为**

- 幻灯片全量显示正文、表格、字段
- 仅叠加 13.76px 字幕条
- 导航箭头隐藏

**后果**

- 200–300 字正文墙 + 语音讲解
- 阅读/倾听频繁切换注意力
- 分裂注意力效应 → 学习效率下降

注意力分配

语音讲解场景中认知带宽约 **70% 听觉 / 30% 视觉**。幻灯片应充当视觉锚点而非完整文本。

::panel
### 录制输出适配：横屏录制在移动端不可用
录制机制

`getDisplayMedia()` 捕获全屏 → VP9/VP8 WebM，宽高比固定 16:9 或 16:10。

**横屏在手机上的效果**

- 视频窗口仅占屏幕高度 **~28%**
- 15px 正文 → 等效 **4–5px**
- 38px 标题 → 等效 **~10px**

**竖屏平台的做法**

- 抖音/TikTok/Shorts：**9:16**
- 字号：**18–24pt**（移动端 24–32px）
- 单列布局 + 大号代码字体
:::

## #benchmark 02 / Industry Benchmark :: 行业基准：五款产品的演示设计策略

从演示排版、讲者/观众视角分离、录制输出三个维度对标行业成熟产品，提取可复用的设计原则。

:::accordion
::panel
### Reveal.js：虚拟画布与自动缩放
核心机制

固定 960×700 虚拟画布 + CSS `transform: scale()` 等比缩放到任意屏幕。

**r-fit-text**

自动计算文字最大尺寸，保证填满可用空间但不溢出。适用于标题和关键数字。

**可借鉴点**

虚拟视口将演示设计与屏幕分辨率解耦。我们借助 CSS 自定义属性达成同等解耦。

::panel
### Google Slides：讲者视图的双通道分离
核心机制

Presenter View 将讲者笔记与观众画面**物理分离**——两个通道的信息密度完全不同。

**讲者屏幕**

- 当前幻灯片缩略图
- 完整 Speaker Notes
- 计时器

**观众屏幕**

- 仅幻灯片视觉内容
- 无笔记、无计时
- 低信息密度

可借鉴点

单屏场景下借助"聚焦模式"建立认知分离——淡化文字，保留视觉锚点。

::panel
### Pitch：内容密度与视觉层次规则
**Rule of 3**

每张幻灯片聚焦 **3 个核心要点**，每行 ≤ 12 词，保证扫描效率。

**在实际介质中测试**

最终观看设备是手机 → 设计时就在**手机尺寸**上验证可读性。

::panel
### Apple Keynote：录制讲解与演讲者显示器
**录制讲解**

逐页录制旁白 → 回放时语音与幻灯片**自动同步**。录制是一等公民功能。

**AI 生成笔记**

Keynote 15.2 支持 AI 自动生成演讲者笔记——与我们 LLM 讲解脚本生成理念一致。

可借鉴点

录制输出是独立消费场景，排版应针对最终设备（手机竖屏）优化。

::panel
### TED 演讲：幻灯片作为视觉锚点
设计哲学

TED 幻灯片通常只含**一个核心要素**：一张全屏图片、一个大号数字、或一句关键引述。

核心原则

语音讲解时，幻灯片角色从**"信息载体"→"注意力锚点"**。信息密度越低，观众越能专注语音叙事。不是删除内容，而是通过视觉降权重新分配注意力。
:::

| 产品 | 排版策略 | 讲者/观众分离 | 录制适配 |
| --- | --- | --- | --- |
| **Reveal.js** | 960×700 虚拟画布 + 等比缩放 | Speaker Notes 视图 | 无内建录制 |
| **Google Slides** | 固定画布 + 字号绝对值 | Presenter View 物理分屏 | 依赖外部工具 |
| **Pitch** | Rule of 3 + ≤12 词/行 | Speaker Notes 面板 | Video 导出（固定比例） |
| **Apple Keynote** | 主题字号模板 + 演讲者显示器 | 物理分屏 + 窗口化回放 | 录制讲解 + 导出 MOV |
| **TED 风格** | 全屏单要素 + 超大字号 | 讲者即叙事通道 | 专业摄像（切画面） |
| **Knowledge Hub（当前）** | 继承文章字号 15px | 无分离（全量显示） | getDisplayMedia 截屏 |

## #solution 03 / Solution Design :: 解决方案：两种演示类型 × 三层渐进式优化

演示模式并非单一场景——观众自主阅读幻灯片与讲者语音讲解是两种本质不同的信息传递方式，需要不同的内容密度和视觉策略。三层优化分别服务共享基线、讲解专属体验和录制输出。

:::accordion
::panel
### 两种演示类型的定义与差异
TYPE A

**阅读演示模式**

观众独立阅读幻灯片内容，无语音讲解。幻灯片是唯一信息通道——内容必须以合理的结构和顺序完整呈现，支持观众自主理解。

- **信息通道**：仅视觉（幻灯片即全部）
- **内容密度**：中高——保留完整正文、字段和表格
- **核心诉求**：可读性 + 结构清晰度 + 渐进呈现顺序
- **典型场景**：会后分享、异步阅读、邮件发送的 PPTX

TYPE B

**讲解演示模式**

讲者通过语音（TTS 或现场）传递完整叙事，幻灯片降为辅助支持——仅保留关键信息作为视觉锚点，帮助观众在听觉叙事中保持方位感。

- **信息通道**：听觉（主） + 视觉（辅）
- **内容密度**：低——标题、关键数字、图表、首段
- **核心诉求**：视觉锚定 + 认知带宽释放 + 字幕可读
- **典型场景**：现场演讲、自动讲解播放、录制分享视频

| 维度 | 阅读演示 (Type A) | 讲解演示 (Type B) |
| --- | --- | --- |
| **正文可见度** | 100%——全量显示，行高加大 | 15%——淡化 + 模糊，仅锚点保留 |
| **标题/图片** | 正常显示，字号放大 | 100% 可见，作为视觉锚点 |
| **字幕** | 不显示（无语音） | 放大字号 + 加宽底栏 |
| **导航** | 箭头可见，手动翻页 | 箭头隐藏，自动翻页 |
| **观众注意力分配** | 100% 视觉阅读 | ~70% 听觉 / ~30% 视觉扫描 |
| **触发条件** | 进入演示模式（默认） | 开启讲解 → 自动激活聚焦模式 |

::panel
### Phase 1：演示排版放大（共享基线，Type A + B 共用）
设计目标

正文 15px → **19–24px**，覆盖投影、外接屏和移动端三场景。两种演示类型共享此基线。

**Type A 阅读演示**

- 正文字号直接提升可读性
- 行高 → **1.75**
- 字段标签同步放大
- 概览卡片标题放大

**Type B 讲解演示**

- 锚点元素仍需放大基线
- 字幕 0.86rem → **clamp(1rem, 1.3vw, 1.25rem)**
- 字幕 max-width 70% → **80%**
- 字幕 padding 加宽

移动端

`@media (max-width: 768px)`：正文 1.15rem，概览单列，deck bar 缩放。

::panel
### Phase 2：讲解聚焦模式（Type B 专属）
设计目标

讲解开始 → 幻灯片从**"信息载体"自动转为"视觉锚点"**。同一内容在 Type A/B 下呈现不同密度。

**淡化（非锚点）**

- `opacity: 0.15`
- `filter: blur(1px)`
- 过渡 0.3s
- 结构仍可感知

**保留（锚点元素）**

- h2–h4 标题
- img 图片
- 首段 <p> + strong
- .insight-callout / .metric-card

切换流

play → 聚焦（Type B）｜pause → 恢复（Type A）｜stop → 退出｜设置面板可关闭聚焦

::panel
### Phase 3：移动端录制视口（Type B 增强）
设计目标

横屏视频在手机上字号缩小 **~4 倍**不可读 → 新增 9:16 竖屏和 1:1 正方形录制视口。

**CSS 虚拟视口**

- 9:16 宽度 = `min(56.25vh, 100vw)`
- 字号 × **1.3**
- 概览单列
- 字幕 max-width 90%

**录制比例选项**

- 横屏 16:9（默认）
- 竖屏 9:16（手机）
- 正方 1:1（社交媒体）
- localStorage 持久化

联动

竖屏录制默认启用聚焦模式 → 窄列中淡化非核心内容收益更高。
:::

1

### 演示排版放大（共享基线）

Type A + B 共用。仅修改 article.css + article-narration.css，零 JS 改动，向后兼容所有文章。

2

### 讲解聚焦模式（Type B 专属）

依赖 Phase 1 基线。讲解 play/pause 自动切换 Type A ↔ B。修改 article.css + article-presentation.js + article-narration-ui.js。

3

### 移动端录制视口（Type B 增强）

与 Phase 2 并行。竖屏 + 聚焦模式联动。修改 article.css + article-screen-recording.js + article-narration-ui.js。

## #implementation 04 / Implementation Specs :: 实施规格：CSS 属性与 JS 接口定义

精确到 CSS 属性值和 JS 函数签名的实施规格，确保代码改动可直接对照核验。

:::accordion
::panel
### CSS 自定义属性清单
| 属性名 | 值 | 作用域 | 说明 |
| --- | --- | --- | --- |
| `--present-body-font` | `clamp(1.2rem, 1.5vw, 1.5rem)` | `.is-presentation-mode .site` | 正文字号：19.2–24px |
| `--present-subtitle-font` | `clamp(1rem, 1.3vw, 1.25rem)` | `.narration-subtitle` | 字幕字号：16–20px |
| `--present-portrait-scale` | `1.3` | `.is-portrait-recording` | 竖屏录制字号放大乘数 |

::panel
### CSS 选择器覆盖规则
| 选择器 | 属性 | Phase |
| --- | --- | --- |
| `.is-presentation-mode .subsection-content p, .is-presentation-mode .subsection-content li` | `font-size: var(--present-body-font); line-height: 1.75` | 1 |
| `.is-presentation-mode .event-field p` | `font-size: var(--present-body-font)` | 1 |
| `.is-focus-mode .subsection-content > *:not(.focus-keep)` | `opacity: 0.15; filter: blur(1px); transition: 0.3s` | 2 |
| `.is-portrait-recording [data-present-step].is-active` | `width: min(56.25vh, 100vw)` | 3 |

::panel
### JS 接口定义
| 函数 / 事件 | 位置 | 说明 |
| --- | --- | --- |
| `tagFocusElements(slideEl)` | article-presentation.js | 遍历当前幻灯片 DOM，给锚点元素添加 `.focus-keep` 类 |
| `onNarrationPlay` 回调 | article-presentation.js | 添加 `.is-focus-mode` + 调用 `tagFocusElements` |
| `onNarrationPause/Stop` 回调 | article-presentation.js | 移除 `.is-focus-mode` |
| 录制比例选项变更 | article-narration-ui.js | 保存到 `localStorage('present-record-ratio')` |
| 录制开始前 | article-screen-recording.js | 读取 ratio → 添加 `.is-portrait-recording` / `.is-square-recording` |

::panel
### 影响文件清单
| 文件 | Phase | 改动类型 |
| --- | --- | --- |
| `assets/article.css` | 1, 2, 3 | 新增演示字号变量、聚焦模式样式、竖屏视口约束、移动端断点 |
| `assets/article-presentation.js` | 2 | 新增 `tagFocusElements()`、聚焦模式状态管理、讲解回调集成 |
| `assets/article-narration-ui.js` | 2, 3 | 新增聚焦模式开关、录制比例选项组 |
| `assets/article-screen-recording.js` | 3 | 录制前读取比例选项、添加/移除视口约束类 |
| `assets/article-narration.css` | 1 | 字幕响应式字号调整 |
:::

## #tracking 05 / Implementation Tracking :: 实施阶段表与检查清单

按 Phase 拆分为可独立交付的工作单元，每项任务附带验收条件与勾选状态，用于跟踪落地进度。

:::accordion
::panel
### Phase 1 检查清单：演示排版放大
交付范围

仅 CSS 改动，零 JS 依赖。Type A / Type B 共享基线。落地后所有现有文章自动受益——演示模式正文从 15px 提升至 19–24px。

| ✓ | 任务 | 验收条件 | 文件 |
| --- | --- | --- | --- |
| ☑ | 新增 `--present-body-font` CSS 变量 | 变量声明在 `.is-presentation-mode .site` 下，值为 `clamp(1.2rem, 1.5vw, 1.5rem)` | article.css |
| ☑ | 正文容器应用演示字号 | `.subsection-content p/li`、`.event-field p` 计算字号 ≥ 19px @ 1440px 视口 | article.css |
| ☑ | 行高提升 | 演示模式正文 line-height = 1.75 | article.css |
| ☑ | 字幕字号放大 | `.narration-subtitle` 计算字号 ≥ 16px，max-width = 80% | article-narration.css |
| ☑ | 移动端断点 | 375px 视口：正文 ≥ 18px，概览网格单列，deck bar 无溢出 | article.css |
| ☑ | 阅读模式回归 | 非演示模式下所有文章渲染无变化；`node tests/validate.js` exit 0 | — |

::panel
### Phase 2 检查清单：讲解聚焦模式
交付范围

Type B 专属功能。依赖 Phase 1 字号基线。涉及 CSS + JS 改动。讲解 play/pause 自动切换 Type A ↔ B。

| ✓ | 任务 | 验收条件 | 文件 |
| --- | --- | --- | --- |
| ☑ | `.is-focus-mode` CSS 规则 | 非 `.focus-keep` 元素 opacity=0.15 + blur(1px)，transition 0.3s | article.css |
| ☑ | `tagFocusElements(slideEl)` 函数 | 标记 h2–h4、img、首段 p、strong、blockquote、.insight-callout、.metric-card 为 `.focus-keep` | article-presentation.js |
| ☑ | 讲解回调集成 | play → 添加 .is-focus-mode + tagFocusElements；pause/stop → 移除 .is-focus-mode | article-presentation.js |
| ☑ | 翻页重标记 | 切页时重新调用 tagFocusElements，不同页面保留不同锚点 | article-presentation.js |
| ☑ | 设置面板开关 | 聚焦模式 checkbox，默认 ON，localStorage 持久化 | article-narration-ui.js |
| ☑ | Type A ↔ B 切换视觉测试 | play → 0.3s 淡入聚焦；pause → 0.3s 恢复全量；toggle OFF → play 时不淡化 | — |
| ☑ | 暗色主题兼容 | 聚焦模式在 dark theme 下锚点元素对比度充足 | article.css |

::panel
### Phase 3 检查清单：移动端录制视口
交付范围

Type B 增强功能。与 Phase 2 可并行开发。竖屏视口 + 聚焦模式联动，录制输出优化。

| ✓ | 任务 | 验收条件 | 文件 |
| --- | --- | --- | --- |
| ☑ | 录制比例选项 UI | 设置面板显示 16:9 / 9:16 / 1:1 三个选项，localStorage 持久化 | article-narration-ui.js |
| ☑ | `.is-portrait-recording` CSS | 活跃幻灯片宽度 = min(56.25vh, 100vw)，水平居中 | article.css |
| ☑ | 竖屏字号放大 | 正文字号 = 标准演示字号 × 1.3（约 25–31px） | article.css |
| ☑ | 竖屏布局适配 | 概览网格单列化；字幕 max-width = 90%；deck bar 精简 | article.css |
| ☑ | 录制前视口约束 | 录制开始 → 读取选项 → 添加 .is-portrait-recording；录制结束 → 移除 | article-screen-recording.js |
| ☑ | 聚焦模式联动 | 竖屏录制默认启用聚焦模式 | article-screen-recording.js |
| ☑ | 录制输出手机验证 | 在手机上播放录制 WebM，竖屏区域内正文清晰可读 | — |

::panel
### Phase 4 检查清单：实施后视觉优化
交付范围

Phase 1–3 部署后基于实际演示体验发现的视觉优化项。覆盖内容结构、布局间距、字号层次和 UI 细节。

| ✓ | 任务 | 改动 |
| --- | --- | --- |
| ☑ | 内容结构化：event-field 长段落 → comparison-grid + action-box + 列表 | 文章 HTML（Sec 01–03） |
| ☑ | 内容区边界：`--present-side-gap: 80px`，不超出左右箭头 + 24px 间距 | article.css |
| ☑ | 字幕定位：`left: 80px; right: 160px`，不遮挡 logo 和页码+FAB | article.css |
| ☑ | event-field-label 放大：`clamp(1.3rem, 1.7vw, 1.6rem)` + teal 高亮 | article.css |
| ☑ | 表格字号放大：compare-table/spec-table → `var(--present-body-font)` | article.css |
| ☑ | 概览卡片标题放大：`clamp(1.1rem, 1.4vw, 1.35rem)` | article.css |
| ☑ | comparison-grid/insight-grid 间距：演示模式 `margin: 16px 0` | article.css |
| ☑ | 网格响应式：竖屏录制 + 移动端 ≤768px → `grid-template-columns: 1fr` | article.css |
| ☑ | 竖屏内容边距：`padding: clamp(16px, 3vw, 32px)` | article.css |
| ☑ | 导航箭头精简：移除背景/圆形/毛玻璃，仅保留箭头，位置 12px | article.css |
| ☑ | 进度条宽度：`align-self: stretch` 匹配页码宽度 | article.css |
| ☑ | 语音选择器：Natural/Premium 音色标注 ★ 标记 | article-narration-ui.js, index.html |

::panel
### 实施阶段总览表
| Phase | 名称 | 服务类型 | 依赖 | 改动文件 | 任务数 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | 演示排版放大 | Type A + B 共享 | 无 | article.css, article-narration.css | 6 | 已完成 |
| P2 | 讲解聚焦模式 | Type B 专属 | P1 | article.css, article-presentation.js, article-narration-ui.js | 7 | 已完成 |
| P3 | 移动端录制视口 | Type B 增强 | P1（P2 可并行） | article.css, article-screen-recording.js, article-narration-ui.js | 7 | 已完成 |
| P4 | 实施后视觉优化 | Type A + B 共享 | P1–P3 | article.css, article-narration-ui.js, index.html, 文章 HTML | 12 | 已完成 |
:::

## #verification 06 / Verification :: 验证清单与设计决策

每个 Phase 的验收条件和关键设计决策的理由记录。

:::accordion
::panel
### Phase 1 验收条件
字号验证

在 1440px 视口进入演示模式，使用 DevTools 检查 `.subsection-content p` 计算字号 ≥ 19px。在 375px 视口（iPhone SE）检查正文字号 ≥ 18px、概览网格为单列布局。

字幕验证

触发讲解模式，确认 `.narration-subtitle` 计算字号 ≥ 16px，max-width 为 80%。在暗色主题下验证字幕背景毛玻璃效果和文字对比度。

回归测试

运行 `node tests/validate.js`，exit code = 0。在阅读模式下确认文章渲染无变化（演示字号变量仅在 `.is-presentation-mode` 作用域内生效）。

::panel
### Phase 2 验收条件
聚焦模式触发

进入演示模式 → 开启讲解 → 确认非锚点内容在 0.3s 内淡化至 15% 不透明度。暂停讲解 → 确认所有内容在 0.3s 内恢复至 100%。

锚点元素保留

聚焦模式下核对六类锚点元素保持 100% 可见：标题（h2–h4）、图片（img）、`.insight-callout`、`strong`、第一个 `<p>`、`.metric-card`。

设置开关

在设置面板关闭聚焦模式 → 讲解播放时所有内容保持 100% 可见。刷新页面 → 确认设置从 `localStorage` 正确恢复。

::panel
### Phase 3 验收条件
竖屏视口

选择 9:16 比例 → 开始录制 → 确认幻灯片内容约束在屏幕中央的窄列区域内，宽度约为视口高度的 56.25%。两侧为暗色背景。

字号放大

竖屏模式下正文字号应为标准演示字号的 1.3 倍（约 25–31px）。概览网格为单列布局。字幕宽度扩大至 90%。

录制输出

录制结束后在手机上播放 WebM 文件，确认竖屏区域内的正文文字清晰可读。暗色侧边条在深色主题下视觉自然。

::panel
### 关键设计决策记录
聚焦模式默认 ON

讲解播放时默认开启聚焦模式，用户可手动关闭。理由：符合 TED/Keynote 的演讲哲学——幻灯片辅助讲者而非替代讲者。默认 ON 意味着首次体验即为最优体验，不需要用户发现并开启这个功能。

结构化保留而非关键词提取

聚焦模式保留结构元素（标题 + 图片 + 卡片 + 首段）而非用 LLM 提取单一关键词。理由：结构化方法无 LLM 依赖、行为一致可预测、保持空间布局上下文。"部分可见"优于"完全隐藏"——观众需要感知到信息结构的存在。

CSS 约束而非 Canvas 裁剪

竖屏录制通过 CSS 约束幻灯片宽度，而非用 `<canvas>` 后处理裁剪视频。理由：CSS 方案复用现有 DOM 结构，无需额外的渲染管线；v1 接受两侧暗色条——canvas 裁剪引入 frameRate 同步和 GPU 内存风险，复杂度与收益不成比例。

逐页重算焦点元素

每次切换幻灯片时重新调用 `tagFocusElements(slideEl)`，而非全局一刀切标记。理由：不同幻灯片的 DOM 结构差异大——有些幻灯片只有表格，有些是字段列表，有些是图文混排。全局标记无法适应这种异构性。
:::

## #references 07 / References :: 参考来源

- [1] Richard E. Mayer. | 多媒体学习的认知理论，包含冗余原则、分裂注意力效应和信号化原则等 12 条设计原则。
- [2] John Sweller. | 认知负荷理论的创始论文，区分了内在负荷、外在负荷和相关负荷三类。
- [3] Reveal.js. — https://revealjs.com/presentation-size/ | Reveal.js 的虚拟画布缩放机制文档，含 960×700 默认尺寸和 minScale/maxScale 配置。
- [4] Reveal.js. — https://revealjs.com/layout/ | r-fit-text、r-stretch、r-stack 等布局工具类的使用文档。
- [5] Tee Tran (Pitch). — https://pitch.com/blog/presentation-design-tips | 可读性、Rule of 3、视觉一致性和上下文测试四条演示设计原则。
- [6] Apple. — https://support.apple.com/guide/keynote/present-on-a-display-connected-to-your-mac-tan22b172a2d/mac | Keynote 的演讲者显示器、窗口化回放和录制讲解功能文档。
- [7] Google. — https://support.google.com/docs/answer/1696787 | Google Slides 的 Presenter View、Speaker Notes 和多显示器演示文档。

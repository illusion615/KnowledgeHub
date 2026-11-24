---
title: 演示模式手机端优化设计（已下线）
eyebrow: Archived Design
brand: Knowledge Hub
date: 2026-04-21
strict_i18n: false
strict_density: true
lead: "本文记录曾采用的独立\"手机模式\"方案。该功能因入口重复、实际收益有限，已于 2026-07-30 从运行时与设置面板下线；现有 9:16 录制比例仍保留。"
hero_actions:
  - "查看架构 | #architecture"
  - "实施路线 | #roadmap"
panel_label: 核心理念
panel_title: 桌面录制，手机原生可读
panel:
  - 每屏一个焦点：单列布局 + 放大字号 + 安全区避让
  - 触控优先：底部导航栏 + 滑动手势替代侧边箭头
  - 模块化隔离：新增懒加载 JS + CSS 层，不影响桌面演示
  - "录制联动：手机模式 + 9:16 比例 + 导航栏自动隐藏"
metrics:
  - "最小字号 || Min Font | 1.8rem | ~28px 手机可读"
  - "触控目标 || Touch Target | ≥48px | Apple/Material 标准"
  - "新增文件 || New Files | 1 JS | article-mobile-present.js"
  - "改动文件 || Modified Files | 4 文件 | CSS + 3 JS 模块"
style:
  accent: "#7c3aed"
---

## #problem 01 / Problem Analysis :: 问题分析：当前竖屏录制为何不可用

现有 `is-portrait-recording` 只约束视口宽度为 56.25vh 并将字体放大 1.3 倍——在桌面预览尚可，但导出的 9:16 视频在手机上观看时，有效字号仅 8-10px，完全不可读。

:::accordion
::panel
### 排版问题
**字体过小**

桌面演示模式 body font 为 `clamp(1.2rem, 1.5vw, 1.5rem)`，竖屏模式乘以 1.3 后约 1.56rem，但录制视口宽度仅 56.25vh（约 400-500px 等效），最终有效字号 8-10px。Apple HIG 建议手机正文不低于 17pt。

**多列布局挤压**

comparison-grid、insight-grid 在桌面演示模式保持多列布局。竖屏宽度下这些网格被强制压缩到每列不足 200px，卡片内文字换行后层叠密集，难以辨识。

::panel
### 导航问题
**侧边箭头不适用**

桌面演示使用 `.present-nav-prev` / `.present-nav-next` 44px 按钮固定在视口左右，hover 触发高亮。手机上既遮挡内容又无法用手指精确点击。

**无触控手势**

键盘 ← / → 和 Esc 是桌面操作，手机用户期望的是横向滑动切页。目前没有 `touch` 事件处理。

::panel
### 字幕与安全区
**字幕位置不合理**

讲解字幕 `.narration-subtitle` 使用 `left: 80px; right: 160px` 定位——这是为 16:9 宽屏设计的。在 9:16 竖屏下字幕区域被挤压到极窄。

**无手机安全区避让**

手机屏幕底部 15% 是社交媒体 App 的交互按钮区（点赞、评论、分享），顶部 10% 是状态栏/刘海。当前 CSS 没有为手机端预留这些安全区。
:::

## #principles 02 / Design Principles :: 设计原则：参考行业最佳实践

基于 Apple Human Interface Guidelines、Material Design 3 和短视频平台内容呈现规范提炼的六条核心原则。

:::accordion
::panel
### 每屏一个焦点
One Focus Per Slide

每个屏幕传达单一信息点，最大化清晰度。Apple HIG 的核心布局原则：*"Make essential information easy to find by giving it sufficient space"*。在手机竖屏上，信息密度必须比桌面降低 60-70%。

::panel
### 最小可读字号
Minimum 1.8rem Body Font

在 9:16 录制视口（等效宽度约 400px）下，body font 设为 `clamp(1.6rem, 4.5vw, 2.2rem)`，实际渲染约 28px。这对应 Apple HIG 推荐的 iOS Body Large 字号（17pt × 1.65 缩放因子），确保录制视频在 iPhone 14 Pro（393pt 宽）上全屏播放时的可读性。

::panel
### 触控目标尺寸
≥48px Touch Targets

Material Design 3 要求最小触控目标 48dp；Apple HIG 推荐 44pt。手机模式下所有可交互元素（导航按钮、退出按钮）的可点击区域不低于 48px。底部导航栏高度设为 72px，按钮占满 50% 宽度以获得最大触控面积。

::panel
### 内容安全区
状态栏 / 刘海 (10%)

内容安全区 (75%)

交互按钮区 (15%)

手机短视频的内容安全区约为屏幕中部 75%。顶部 10% 被状态栏/刘海占据，底部 15% 是社交 App 的点赞、评论、分享按钮热区。设计的安全 padding：`--present-safe-top: 64px`、`--present-safe-bottom: 100px`。

::panel
### 强制单列布局
Single Column Forced

手机模式下所有 grid 组件（`comparison-grid`、`insight-grid`、`pattern-grid`、`subsection-accordion`、`hero-grid`、`hero-metrics`）强制为 `grid-template-columns: 1fr`。Material Design 建议 compact 尺寸类使用单列布局。

::panel
### 渐进简化
Progressive Simplification

不只是缩放——需要结构性简化。hero-metrics 从横排变纵排；comparison-grid 从多列变单卡；表格从宽行变 key-value pair 视图。V2 将引入内容密度分析，自动拆分过长 slide 为子步骤。
:::

## #architecture 03 / Architecture :: 模块架构：最小侵入式设计

新增一个 CSS 层 + 一个懒加载 JS 模块，通过 `is-mobile-present` CSS class 和 `CustomEvent` 与现有系统集成，不修改任何已有功能的核心逻辑。

:::accordion
::panel
### 模块边界
is-mobile-present

← CSS class on <html>

├──

article.css

← 纯视觉覆盖（字号、网格、间距、安全区）

└──

article-mobile-present.js

← 懒加载行为模块

├── Touch swipe gestures (prev/next) ├── Content density analysis ├── Bottom navigation bar └── Subtitle repositioning

CSS 负责纯视觉适配（字号、网格、安全区），JS 负责交互行为（手势、底部导航栏、内容密度检测）。两者通过 `is-mobile-present` class 解耦，CSS 可以在无 JS 的情况下独立生效。

::panel
### 集成点
| 文件 | 改动 | 模式 |
| --- | --- | --- |
| article-presentation.js | 添加 toggle 状态 + lazy-loader + class 管理 | 同 screen-recording 模式 |
| article-narration-ui.js | 设置面板添加手机优化 checkbox | 同 focusMode checkbox |
| article-screen-recording.js | 录制时自动叠加 is-mobile-present | 同 is-portrait-recording |
| article.css | 新增 .is-mobile-present 规则块 | 追加在 .is-portrait-recording 后 |

::panel
### 事件通信
CustomEvent Pattern

遵循已有的事件通信模式（`focusModeChanged`、`recordRatioChanged`），新增 `mobilePresentChanged` 事件：

- `mobilePresentChanged`
- `{ enabled: boolean }`
- Launch panel toggle + narration-ui checkbox
- article-presentation.js (top-level)

**localStorage key**：`present-mobile-mode`，值为 `'true'` / `'false'`，默认 `'false'`。

::panel
### 文件改动清单
assets/

├──

article.css

← +80 行 .is-mobile-present 规则

├──

article-presentation.js

← +40 行 toggle + lazy-loader

├──

article-narration-ui.js

← +15 行 checkbox 联动

├──

article-screen-recording.js

← +8 行 自动叠加

└──

article-mobile-present.js

← 新建 ~200 行
:::

## #css-layer 04 / CSS Layer :: CSS 移动演示层：视觉适配规范

所有视觉改动集中在 `.is-mobile-present` 选择器下，追加在 `article.css` 现有的 `.is-portrait-recording` 之后。不修改任何已有 CSS 规则。

:::accordion
::panel
### CSS 变量覆盖
| 变量 | 桌面演示值 | 手机模式值 | 原因 |
| --- | --- | --- | --- |
| --present-body-font | clamp(1.2rem, 1.5vw, 1.5rem) | clamp(1.6rem, 4.5vw, 2.2rem) | 手机录制 28px+ 可读 |
| --present-body-line-height | 1.75 | 1.85 | 增加行间距提升可读性 |
| --present-side-gap | 80px | 24px | 窄屏充分利用宽度 |
| --present-safe-top | clamp(84px, 9.5vh, 124px) | 64px | 手机状态栏避让 |
| --present-safe-bottom | clamp(78px, 9vh, 112px) | 100px | 社交 App 按钮区避让 |

::panel
### 布局强制规则

::panel
### 底部导航栏组件
Before: 侧边箭头

&lsaquo;

&rsaquo;

Section Title

Content text that is barely readable at this scale because the font is optimized for desktop...

After: 底部导航栏

Section Title

Content text readable at mobile scale with large font.

讲解字幕居中全宽显示

&lsaquo;

3 / 12

&rsaquo;

| 属性 | 规格 |
| --- | --- |
| 高度 | 72px |
| 布局 | 三栏：上一页按钮 \| 页码 + 进度 \| 下一页按钮 |
| 背景 | 磨砂玻璃 (`backdrop-filter: blur(16px)`) |
| 按钮宽度 | 各占 30% 视口宽度，居中计数器占 40% |
| 录制隐藏 | `.is-recording .mobile-nav-bar { display: none }` |

::panel
### Dark Mode 适配
手机模式的暗色适配使用已有的 `[data-theme="dark"]` 层叠。需新增的暗色规则：
:::

## #behavior-module 05 / Behavior Module :: 行为模块：article-mobile-present.js

新建懒加载模块，遵循 `article-screen-recording.js` 的依赖注入模式。暴露 `window.StudyRoomMobilePresent = { init, destroy }` 接口。

:::accordion
::panel
### 触控滑动导航
touchstart

记录起点 →

touchmove

计算 deltaX →

touchend

判断方向 →

prev / next

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 水平阈值 | 50px | deltaX 超过此值视为有效滑动 |
| 主轴判断 | \|deltaX\| > \|deltaY\| | 水平移动大于垂直时才触发，避免干扰纵向滚动 |
| 方向映射 | 左滑 → next，右滑 → prev | 符合手机内容流的自然手势 |
| 清理 | destroy() 移除所有 listener | 退出手机模式时完全清理 |

::panel
### 底部导航栏 DOM
DOM Structure

底部导航栏由 JS 动态创建并插入 `.present-floating` 容器。结构：

.mobile-nav-bar

├──

button.mobile-nav-prev

← 上一页

├──

.mobile-nav-center

│ ├──

.mobile-nav-counter

← "3 / 12"

│ └──

.mobile-nav-progress

← 进度条

└──

button.mobile-nav-next

← 下一页

导航栏通过 `MutationObserver` 监听 `[data-present-counter]` 的 `textContent` 变化来同步页码，无需修改 `setPresentationStep()` 函数本身。

::panel
### 内容密度守卫
Content Density Guard

手机模式放大字体后，部分 slide 的内容高度可能超过视口。`init()` 时扫描每个 `presentStep`：

V2 计划：将超长 step 自动拆分为多个子 step，基于 `<p>`、`.event-field`、grid item 等语义边界做切割。V1 使用滚动指示器作为过渡方案。

::panel
### 依赖注入接口
| 依赖 | 类型 | 来源 |
| --- | --- | --- |
| root | HTMLElement | document.documentElement |
| getLang | Function | 返回 'zh' 或 'en' |
| goToPrev | Function | goToPreviousStep() |
| goToNext | Function | goToNextStep() |
| getState | Function | 返回 { enabled, index } |
| getPresentSteps | Function | 返回 presentSteps 数组 |

遵循 `article-screen-recording.js` 的依赖注入模式——模块不直接引用任何外部变量，所有依赖通过 `init(deps)` 注入。
:::

## #integration 06 / Integration :: 集成方案：四个触点的改动

手机模式通过四个精确的集成点接入现有系统，每个点的改动量控制在 8-40 行。

:::accordion
::panel
### 启动面板 Toggle
buildLaunchPanel() 新增行

在 `article-presentation.js` 的 `buildLaunchPanel()` 函数中，auto-narrate toggle 之后新增一行：

::panel
### 演示模式生命周期

::panel
### 讲解设置面板联动
article-narration-ui.js 改动

在 `createSettingsPanel()` 的"录制比例"行之后，新增"手机优化"checkbox 行：

- 录制比例切换到 9:16 时，自动勾选手机优化
- 取消手机优化时不改变录制比例（用户可能想用 9:16 但不要手机字号）
- checkbox 变化时 fire `mobilePresentChanged` 事件

::panel
### 录制集成
article-screen-recording.js 改动

在 `toggle()` 的 "Apply recording aspect ratio" 逻辑之后：
:::

## #verification 07 / Verification :: 验证方案：8 项验收标准

:::accordion
::panel
### 功能验证清单
| # | 测试项 | 预期结果 |
| --- | --- | --- |
| 1 | validate.js | exit code 0（无箭头函数、脚本顺序正确） |
| 2 | 启动面板 Toggle | hover 演示按钮 → "手机优化" toggle 可见 |
| 3 | 手机模式演示 | 侧边箭头隐藏、底部导航栏显示、字体放大、网格单列、滑动手势可用 |
| 4 | 手机模式 + 录制 | 9:16 视口、导航栏隐藏、字幕大且居中 |
| 5 | 导出视频手机播放 | 文字无需缩放即可阅读 |
| 6 | 关闭手机模式 | 完全恢复桌面布局，无残留 class |
| 7 | Dark Mode | 切换主题 → 手机模式所有组件正确响应暗色 |
| 8 | 讲解中切换 | 播放讲解时开关手机模式 → 无崩溃、布局平滑过渡 |
:::

## #decisions 08 / Decisions :: 关键决策记录

:::accordion
::panel
### 显式 Toggle vs. 自动检测
**选择：双轨策略（显式 + 自动检测）**

手机模式的启用条件为 `localStorage('present-mobile-mode') === 'true' || window.innerWidth <= 768`。桌面录制场景通过 toggle 显式开启；真实手机浏览器上进入演示时，视口宽度 ≤768px 自动启用——无需用户手动操作。自动检测不写入 localStorage，不影响桌面端的默认行为。

**覆盖场景**

桌面浏览器全屏（>768px）：需手动开启 toggle 才生效，用于录制给手机观看。手机浏览器（≤768px）：进入演示时自动启用，触控手势和底部导航栏开箱即用。iPad 等中等屏幕（768px 边界）：由 CSS `clamp()` 字号公式平滑过渡。

::panel
### 内容拆分策略
**V1：滚动指示器**

对于手机模式下内容超出视口的 slide，添加 `data-mobile-scrollable` 属性，CSS 显示底部渐变遮罩 + `overflow-y: auto`。不拆分 slide 结构，保持与桌面相同的 step 数量。

**V2（延期）：自动拆分**

基于语义边界（`<p>`、`.event-field`、grid item）自动将长 slide 拆分为子 step。需要修改 `collectPresentationSteps()` 的核心逻辑，侵入性较高，推迟到收集使用反馈后实施。

::panel
### 模块加载模式
Decision: Lazy-load + Dependency Injection

新模块 `article-mobile-present.js` 不加入 HTML 的必选脚本列表，而是由 `article-presentation.js` 在进入手机模式时动态创建 `<script>` 标签加载。这与 `article-screen-recording.js`、`article-email-share.js`、`article-narration-ui.js` 的模式完全一致——确保不影响页面初始加载性能，且不修改 validate.js 的脚本检查列表。

::panel
### 独立 vs. 耦合的 localStorage Key
Decision: 独立存储 + 建议联动

`present-mobile-mode` 和 `present-record-ratio` 使用独立的 localStorage key。两者可以独立设置——用户可能想要 9:16 比例但不要手机字号（例如录制桌面竖屏内容），也可能想在 16:9 下使用手机模式（用于预览效果）。UI 提供建议性联动（切到 9:16 时高亮手机 toggle）但不强制绑定。
:::

## #roadmap 09 / Roadmap :: 实施路线

Phase 1 · V1

### CSS 移动演示层

- 在 article.css 追加 .is-mobile-present 规则块
- CSS 变量覆盖（字号、行高、间距、安全区）
- 强制单列布局 + 隐藏侧边箭头
- 底部导航栏组件样式
- Dark mode 适配

Phase 2 · V1

### 启动面板 Toggle + 事件

- buildLaunchPanel() 添加手机优化开关
- localStorage 持久化
- mobilePresentChanged CustomEvent
- 录制比例联动建议

Phase 3 · V1

### 演示模式生命周期集成

- enterPresentation() 添加 class + lazy-load
- exitPresentation() 清理
- mobilePresentChanged 监听
- narration-ui 设置面板联动

Phase 4 · V1

### 行为模块实现

- 新建 article-mobile-present.js
- 触控滑动导航（touchstart/move/end）
- 底部导航栏 DOM + MutationObserver 同步
- 内容密度守卫 + 滚动指示器

Phase 5 · V1

### 录制集成

- screen-recording.js 自动叠加 is-mobile-present
- 录制中隐藏导航栏（CSS）
- 停止录制时清理

Phase 6 · V2

### 内容自动拆分

- 语义边界检测（p、event-field、grid item）
- 密集 slide 自动拆为子 step
- 拆分后的 step 使用过渡动画
- 需改动 collectPresentationSteps()

Phase 7 · 未来

### 智能内容简化

- Hero metrics 自动筛选（只显示最重要的 2 项）
- 表格自动转 key-value 卡片视图
- LLM 驱动的内容精简建议
- 自适应字号（根据 slide 内容量动态调整）

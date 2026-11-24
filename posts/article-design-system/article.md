---
title: 文章页设计系统 视觉规范文档
eyebrow: Design System
brand: Knowledge Hub
date: 2026-04-20
strict_i18n: false
strict_density: true
lead: 本文档记录 Knowledge Hub 文章页面的完整视觉规范——从色彩令牌、字体系统到各组件的实际样式与具体数值。所有示例均为实际使用的 CSS 渲染效果。
hero_actions:
  - "色彩令牌 | #color"
  - "组件一览 | #components"
panel_label: 规范覆盖范围
panel_title: 6 大维度 完整定义视觉语言
panel:
  - 色彩令牌（Light / Dark 双模式）
  - 字体系统（family, size, weight, spacing）
  - 间距与圆角体系
  - 阴影与背景层
  - 核心组件样式
  - 动效与响应式断点
metrics:
  - "CSS 自定义属性 | 18 | 全局色彩与布局令牌"
  - "字体家族 | 2 | Space Grotesk + Noto Sans SC"
  - "断点 | 3 | 1100px · 760px · 768px"
  - "圆角档位 | 4 | 999px · 32px · 24px · 18px"
style:
  accent: "#ff7a00"
---

## #color 01 / Color Tokens :: 色彩令牌

所有颜色通过 CSS 自定义属性（Custom Properties）定义在 `:root` 和 `[data-theme="dark"]` 中，实现一键切换主题。

:::accordion
::panel { open: true }
### 核心语义色
这些是最常用的语义色彩令牌，控制页面的整体基调。

#fcf6ee

--bg-top

Light: #fcf6ee

Dark: #0f1318

#eef3ef

--bg-bottom

Light: #eef3ef

Dark: #111820

#172430

--ink

Light: #172430

Dark: #e4e6ea

#5d6c76

--muted

Light: #5d6c76

Dark: #9ca3af

::panel
### 强调色
三个强调色贯穿整个品牌识别系统，用于渐变、按钮、图标和装饰元素。

#ff7a00

--accent

主强调色（橙色）

用于：按钮、链接、品牌点

#0d8f8c

--teal

次强调色（青色）

用于：kicker、交互反馈、手风琴

#e0b04b

--gold

第三强调色（金色）

用于：装饰 orb、信号地图节点

14% opacity

--accent-soft

Light: rgba(255,122,0,0.14)

Dark: rgba(255,122,0,0.18)

14% opacity

--teal-soft

Light: rgba(13,143,140,0.14)

Dark: rgba(13,143,140,0.18)

::panel
### 面板与卡片
面板和卡片的背景色使用半透明白色叠加模糊效果，在深色模式下自动切换为深色调。

76% white

--panel

Light: rgba(255,255,255,0.76)

Dark: rgba(30,38,48,0.82)

94% dark

--panel-strong

Hero 侧边面板

rgba(16,31,43,0.94) / 0.96

62% white

--card-bg

Light: rgba(255,255,255,0.62)

Dark: rgba(22,27,38,0.72)

12% ink

--line

Light: rgba(23,36,48,0.12)

Dark: rgba(255,255,255,0.1)

::panel
### 背景渐变层
页面背景由多层渐变叠加构成，营造出温暖的有机质感。

Body Background

**三层渐变**

- **橙色径向渐变** — circle at 12% 12%, rgba(255,122,0,0.18), transparent 30%
- **青色径向渐变** — circle at 84% 10%, rgba(13,143,140,0.14), transparent 24%
- **线性渐变** — 180deg, --bg-top → #f4ede3 38% → --bg-bottom

Grid Overlay

**网格纹理层**

- **body::before** — fixed 全屏伪元素
- **网格线** — 3% opacity 线条, 112×112px 单元格
- **整体透明度** — opacity: 0.55, pointer-events: none
:::

## #typography 02 / Typography :: 字体系统

双字体家族策略：Space Grotesk 用于标题和导航等强调元素，Noto Sans SC 用于正文阅读。

:::accordion
::panel { open: true }
### 字体家族
Display Font

**Space Grotesk**

用于标题（h1, h2）、kicker、metric 数值、brand 标识、eyebrow 徽章和导航链接。font-weight: 500 | 700。Google Fonts 托管。

Aa Bb Cc 0123

Body Font

**Noto Sans SC**

用于正文段落、列表、描述文本。font-weight: 400 | 500 | 700 | 800。可通过 localStorage --reading-font 覆盖。

你好世界 文字排版

::panel
### 字号与行高规范
H1 / Hero Title

Space Grotesk

clamp(2rem, 4vw, 3.5rem)

line-height: 1.02 · letter-spacing: -0.04em · font-weight: 800

H2 / Section Title

Space Grotesk

clamp(2rem, 4vw, 3.5rem)

line-height: 1.02 · letter-spacing: -0.04em · font-weight: 700（与 H1 同 size，靠 weight 区分）

Kicker / Section Label

01 / SECTION KICKER

font-size: 0.82rem · letter-spacing: 0.16em · text-transform: uppercase · color: --teal

Eyebrow / Badge

DESIGN SYSTEM

font-size: 0.8rem · letter-spacing: 0.12em · padding: 10px 14px · border-radius: 999px · backdrop-filter: blur(12px)

Body / Paragraph

Noto Sans SC

正文段落文字使用 Noto Sans SC，色彩为 --muted (#5d6c76)。这是默认的阅读字体，在长段落中提供最佳中文可读性。

font-size: 0.96rem · line-height: 1.8 · color: --muted

Metric Value

Space Grotesk

2,048

font-size: 2rem · line-height: 1 · font-weight: 700

Metric Label

CSS CUSTOM PROPERTIES

font-size: 0.82rem · letter-spacing: 0.12em · text-transform: uppercase · color: --muted

Nav Link

导航链接

font-size: 0.9rem · font-weight: 600 · 底部 2px 渐变下划线（hover/active 时 scaleX(1)）
:::

## #spacing 03 / Spacing, Radius & Shadow :: 间距、圆角与阴影

系统化的间距档位确保组件之间的呼吸感一致，圆角从药片形到卡片级共 4 档。

:::accordion
::panel { open: true }
### 关键间距数值
.page-shell padding

22

.hero padding-top

78

.hero gap

28

.section padding-top

82

.hero-grid gap

34

.hero-metrics gap

16

.subsection toggle padding

22×24

.subsection content pad

0 24 24

.insight-card padding

24

.comparison-card pad

26

.accordion gap

14

.insight-grid gap

12

.topbar min-height

62

--content-width

1200

::panel
### 圆角体系
4 档圆角从药片形按钮到卡片容器，建立一致的曲率语言。

999px

Pill / Button / Badge

32px

--radius-xl / Hero Panel

24px

--radius-lg / Card, Subsection

18px

--radius-md / Share Menu

::panel
### 阴影系统
阴影分为 3 档，在深色模式下自动加深以保持层次感。

--shadow (默认)

0 24px 70px rgba(17,31,43,0.12)

Dark: rgba(0,0,0,0.3)

--card-shadow

0 4px 24px rgba(17,31,43,0.06)

Dark: rgba(0,0,0,0.2)

Topbar shadow

0 8px 28px rgba(23,36,48,0.04)

Dark: rgba(0,0,0,0.18)

Button :hover

0 18px 36px rgba(17,31,43,0.12)

transform: translateY(-2px)
:::

## #components 04 / Core Components :: 核心组件

以下展示文章页面中所有共享组件的实际渲染效果和关键 CSS 属性值。

:::accordion
::panel { open: true }
### 按钮 Button
Primary Button

主要按钮 Primary

次要按钮 Secondary

Primary

**.button-primary**

- background: linear-gradient(135deg, --accent, #ff9340)
- color: #fff
- padding: 14px 18px
- border-radius: 999px
- font-weight: 700

Secondary

**.button-secondary**

- background: rgba(255,255,255,0.58)
- border: 1px solid --line
- color: --ink
- hover: translateY(-2px) + shadow

::panel
### Insight 卡片
Insight Card Grid

- **卡片标题** — 卡片正文内容，使用 --muted 色彩，line-height 1.75。卡片右下角有 120px 径向渐变装饰。
- **第二张卡片** — 背景: --panel (rgba(255,255,255,0.76)) · 圆角: --radius-lg (24px) · 阴影: --shadow · backdrop-filter: blur(14px)
- **第三张卡片** — padding: 24px · card-index 尺寸: 34px 高 · 字体: Space Grotesk 0.88rem 700

::panel
### 对比卡片 Comparison
Comparison Grid (2-col)

Before / 标准

**浅色卡片**

padding: 26px · 标准 --panel 背景 · comparison-label: 8px 12px padding, 999px 圆角, 0.8rem 字号

After / 强调

**深色卡片（.next）**

background: linear-gradient(180deg, rgba(16,31,43,0.98), rgba(24,50,63,0.98)) · color: #f6f8fb

::panel
### 手风琴 Accordion
本组件即是手风琴本身——您此刻正在阅读的内容就在一个 `.subsection-item` 容器中。

Collapsed

**收起状态**

- 背景: --panel · 圆角: --radius-lg (24px)
- toggle padding: 22px 24px
- toggle icon (::after): 32×32px 圆形, "+" 字符, 1.2rem
- content: max-height 0, opacity 0

Expanded

**展开状态（.is-open）**

- border-color: rgba(13,143,140,0.22)
- background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(243,249,248,0.92))
- icon: "-" · bg: rgba(13,143,140,0.12) · color: --teal
- content: max-height 1600px, opacity 1, padding-bottom 24px

::panel
### Metric 指标卡
Metric Cards

Label

1,024

描述文字

Another

99.7%

说明信息

- padding: 18px · border-radius: --radius-lg (24px)
- background: rgba(255,255,255,0.62) · border: 1px solid --line
- label: 0.82rem uppercase, letter-spacing 0.12em, --muted
- value: Space Grotesk 2rem bold · margin-top: 10px
- description: 0.92rem --muted · margin-top: 8px

::panel
### Flow List 流程列表
Flow List

1. **步骤标题** — 步骤描述文字。flow-step 圆形 40×40px，橙色渐变，白色文字，14px 阴影。
2. **第二步** — grid-template-columns: 40px minmax(0,1fr) · gap: 14px · align-items: flex-start
3. **第三步** — flow-step background: linear-gradient(135deg, --accent, #ff9340) · box-shadow: 0 14px 28px rgba(255,122,0,0.18)

::panel
### Layer List 编号列表
Layer List

- layer-list li: padding 12px 14px 12px 52px · 圆角 14px
- layer-number: absolute left:14px · 28×28px 圆形 · Space Grotesk 0.82rem 700
- 背景: rgba(255,255,255,0.58) · 边框: 1px solid rgba(23,36,48,0.08)

::panel
### Quote Block 引用块
Quote Block

> **引用标题（Space Grotesk 1.05rem）**
> 引用内容文字。padding: 22px · border-radius: 20px · background: linear-gradient(135deg, rgba(255,122,0,0.1), rgba(13,143,140,0.12)) · border: 1px solid rgba(23,36,48,0.08)

::panel
### 表格 Table
Simple Table

| 属性 | 数值 | 说明 |
| --- | --- | --- |
| th font-size | 0.78rem | Space Grotesk · 700 · uppercase · letter-spacing 0.1em |
| td font-size | 0.92rem | line-height 1.65 · color --muted |
| td padding | 12px 14px | border-bottom: 1px solid rgba(23,36,48,0.08) |

::panel
### Topbar 顶栏
顶栏固定定位，三栏 grid 布局，背景模糊效果。

Layout

**布局参数**

- position: fixed · top: 0 · z-index: 50
- grid: minmax(0,1fr) auto minmax(0,1fr)
- min-height: 62px · gap: 18px
- padding: 10px clamp(20px,3vw,34px)

Visual

**视觉参数**

- background: rgba(252,246,238,0.78)
- backdrop-filter: blur(18px)
- border-bottom: 1px solid rgba(23,36,48,0.08)
- box-shadow: 0 8px 28px rgba(23,36,48,0.04)
:::

## #animation 05 / Animation & Transitions :: 动效与过渡

所有动效使用 CSS transitions 和 keyframe animations 实现，尊重 prefers-reduced-motion 媒体查询。

:::accordion
::panel { open: true }
### 过渡时长
Scroll Reveal

opacity 0.7s ease · transform 0.7s ease

translateY(26px) → translateY(0)

Accordion Open

max-height 0.34s ease · opacity 0.24s ease · padding 0.24s ease

Button Hover

transform 0.25s ease · box-shadow 0.25s ease

Nav Underline

scaleX 0.25s ease · transform-origin: left

Card Hover Lift

transform 0.28s ease · box-shadow 0.28s ease

translateY(-6px)

Presentation Fade

opacity + translateY 0.24s ease

presentFade keyframe

Share Menu

opacity 0.18s ease · transform 0.18s ease

translateY(-4px) → 0

Home Link Hover

background 0.2s ease · color 0.2s ease

translateX(-1px)

::panel
### Keyframe 动画
Decorative

**背景装饰球 Orb Drift**

- driftA: 16s ease-in-out infinite · translate3d(30px, 24px, 0)
- driftB: 18s ease-in-out infinite · translate3d(-26px, 18px, 0)
- driftC: 14s ease-in-out infinite · translate3d(18px, -16px, 0)

Interactive

**信号地图轨道 Orbit**

- orbitSpin: var(--orbit-duration) linear infinite
- orbitCounterSpin: 反向旋转保持节点正向
- corePulse: 8s ease-in-out box-shadow 脉冲

所有 keyframe 动画在 `@media (prefers-reduced-motion: reduce)` 下设为 `animation: none; transition: none;`
:::

## #responsive 06 / Responsive Breakpoints :: 响应式断点

三个 max-width 媒体查询断点，从桌面到移动端逐级适配。

:::accordion
::panel { open: true }
### 断点一览
- **平板/小桌面** — hero-grid → 单列 · brand 隐藏 · topbar gap: 12px · comparison/mesh/pattern/insight grid → 2 列
- **手机横屏** — page-shell padding: 16px · hero min-height: 0 · topbar min-height: 56px · padding: 8px 16px · 所有 grid → 单列 · subsection padding: 18px
- **演示模式移动端** — present-body-font: 1.15rem · side-gap: 16px · overview grid → 单列 · 字幕左右贴边 16px

| 组件 | 桌面 (>1100px) | 平板 (≤1100px) | 手机 (≤760px) |
| --- | --- | --- | --- |
| .hero-grid | 2 列 (1.1fr \| 0.9fr) | 1 列 | 1 列 |
| .comparison-grid | 2 列 | 2 列 | 1 列 |
| .pattern-grid | 3 列 | 2 列 | 1 列 |
| .brand | 可见 | 隐藏 | 隐藏 |
| .page-shell padding | 22px | 22px | 16px |
| .topbar min-height | 62px | 62px | 56px |

::panel
### Backdrop-filter 兼容性
系统广泛使用 `backdrop-filter: blur()` 实现磨砂玻璃效果。所有使用处均附带 `-webkit-backdrop-filter` 前缀以确保 Safari 兼容。

| 组件 | blur 值 |
| --- | --- |
| .topbar | blur(18px) |
| .eyebrow | blur(12px) |
| .share-menu | blur(18px) |
| .subsection-item | blur(14px) |
| .insight-card / .comparison-card | blur(14px) |
| .signal-node | blur(10px) |
| .narration-settings-panel | blur(20px) |
| .lightbox-overlay | blur(8px) |
:::

## #presentation 07 / Presentation Mode :: Presentation Mode Layout Conventions

Presentation mode transforms the article into a full-viewport slide deck. These rules govern how HTML content maps to presentation steps.

:::accordion
::panel { open: true }
### 7.1 Step Collection & Auto-Split Rules
| Rule | Behavior |
| --- | --- |
| **Step collection** | Hero → each `.section` in `<main>` → ending slide. Sections with `data-present-step` become a single step; otherwise auto-split applies. |
| **Accordion auto-split** | Sections containing `[data-accordion]` items (without explicit `data-present-step`) are split into: 1 overview step (section-head + collapsed card grid) + N detail steps (one per accordion item, content force-expanded). |
| **Overview step** | Gets `data-present-overview`. Section-head description shown centered; accordion items rendered as card grid (title only, collapsed). Non-accordion siblings hidden. |
| **Detail step** | Each `.subsection-item[data-accordion]` becomes its own step. `.subsection-toggle` is hidden; `.subsection-content` is force-displayed. Title shown in deck bar overlay. |
| **Deck bar** | Top-left overlay shows: label (`data-step-label` = section kicker) and title (`data-step-title` = subsection title or section h2). |
| **Ending slide** | Auto-generated `.present-end-slide` appended after last step. Contains centered “Thank You” title, QR code (current URL), and brand text. |
| **Navigation** | Keyboard ← → or floating prev/next buttons. Esc exits. Browser fullscreen requested on enter; exited on leave. |
| **Scroll within step** | Steps that overflow viewport height get internal scroll. Overflow indicator appears when content exceeds viewport. |
| **DO NOT** | Add `data-present-step` to a section that contains accordions — it skips auto-split and renders as one oversized slide. |

::panel
### 7.2 Viewport Layout
Annotated overview of the presentation viewport structure showing deck bar, navigation controls, step counter, and narration capsule.

01 / EXECUTIVE RECOMMENDATION

1.1 Solution Architecture Overview

deck bar overlay

label = data-step-label

title = data-step-title

Step Content

(subsection-content force-displayed, toggle hidden)

←

→

nav buttons

3 / 18

step counter

▶ Play

narration capsule

(auto-play / record)

Presentation Mode — Viewport Layout & Controls
:::

# 设计提案：Markdown + DSL → 交互式 HTML 动态渲染

> 状态：RFC / 讨论中  
> 日期：2026-04-11

---

## 1. 问题陈述

当前每篇文章是 500–800 行手写 HTML。实际内容只占 30–40%，其余是重复的结构模板和行为脚本。

### 1.1 已发生的故障

| 故障 | 根因 | 影响 |
|------|------|------|
| Hero 区域全白 | IntersectionObserver 选择器漏掉 `.load-in` | 文章首屏不可见 |
| Presentation 模式下 section-head 文字遮挡内容 | 手动拆分 step 后 section-head 未隐藏 | 每个拆分 slide 顶部都挤着一段多余描述 |
| Accordion 不工作 | 复制时遗漏 `[data-accordion]` 初始化代码 | 折叠面板点击无响应 |

这三个故障的共同根因：**每篇文章独立维护一份完整的行为脚本**，复制时遗漏或写错即出 bug。

### 1.2 效率痛点

- 新建一篇文章需要复制模板 → 手动替换 > 20 处内容 → 容易出错
- 多语言 `data-zh` / `data-en` 让 HTML 膨胀约 40%
- Presentation 拆分需手动加 `data-present-step`，与内容强耦合
- 共享行为的 bug 修复需要逐文件同步（15 篇文章 × 同一段脚本）

---

## 2. 设计目标

| 目标 | 约束 |
|------|------|
| 文章内容与展示逻辑分离 | 不引入 npm / build step / 框架（GitHub Pages 直接发布） |
| 写文章 = 写 Markdown + 少量组件标记 | 标准 MD 语法为主，自定义扩展最小化 |
| 共享行为一处维护 | Observer / Accordion / Theme / Lang / Presentation 逻辑只存在于共享脚本中 |
| 保持现有设计系统 | 所有组件样式不变，只改内容格式和渲染方式 |
| Presentation 模式自动适配 | 根据内容密度自动决定 slide 边界，不需要手动标注 |
| 渐进迁移 | 新旧文章可共存，不需要一次性迁移所有 15 篇 |

---

## 3. 方案概述

```
posts/
  claw-code-analysis/
    article.md          ← 新：Markdown + DSL 源文件
    index.html          ← 新：极简 shell（< 30 行），加载渲染器
    
assets/
  article-renderer.js   ← 新：MD 解析 + DSL 组件映射 + DOM 生成
  article-init.js       ← 新：从现有内联脚本提取的共享行为
  article.css           ← 现有：不变
  marked.min.js         ← 新：轻量 MD 解析器（~40KB gzip ~14KB）
```

### 3.1 文章 shell（index.html）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>文章标题</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/article.css" />
  <link rel="stylesheet" href="../../assets/scrollbar.css" />
</head>
<body>
  <div class="page-shell">
    <div class="backdrop" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="orb orb-c"></span>
    </div>
    <div class="site" id="site"></div>
  </div>
  <script src="../../assets/marked.min.js"></script>
  <script src="../../assets/article-renderer.js"></script>
  <script src="../../assets/article-init.js"></script>
  <script>
    StudyRoom.render('article.md', document.getElementById('site'));
  </script>
</body>
</html>
```

### 3.2 渲染流程

```
article.md
    ↓ fetch()
Markdown 文本
    ↓ 解析 YAML frontmatter → 元数据（标题、eyebrow、brand、metrics、nav、hero-panel）
    ↓ 解析 body → Markdown AST + DSL 块
    ↓ 组件映射：DSL 块 → 对应 HTML 组件
    ↓ 生成完整 DOM（hero + main sections + footer）
    ↓ 插入 #site
    ↓ article-init.js 激活行为（observer、accordion、theme、lang）
```

---

## 4. Markdown + DSL 语法设计

### 4.1 Frontmatter（YAML）

```yaml
---
title:
  zh: "Claw Code 深度解析：自主编码代理的开源 Harness 实现"
  en: "Claw Code Deep Dive: Open-Source Harness for Autonomous Coding Agents"
eyebrow:
  zh: "Open Source Coding Harness"
  en: "Open Source Coding Harness"
brand: "Claw Code Analysis"
date: "2026-04-11"

hero_actions:
  - label: { zh: "查看系统架构", en: "View Architecture" }
    href: "#architecture"
    primary: true
  - label: { zh: "查看核心哲学", en: "View Philosophy" }
    href: "#philosophy"

hero_panel:
  label: { zh: "三层协作系统", en: "Three-Layer System" }
  title: { zh: "人类定方向，Claw 做执行", en: "Humans Direct, Claws Execute" }
  text: { zh: "Claw Code 不是传统...", en: "Claw Code is not..." }
  layers:
    - { zh: "OmX (oh-my-codex) — 工作流编排", en: "OmX — Workflow Orchestration" }
    - { zh: "clawhip — 事件路由器", en: "clawhip — Event Router" }
    - { zh: "OmO — 多代理协调", en: "OmO — Multi-Agent Coordination" }

metrics:
  - label: { zh: "Rust 代码行数", en: "Rust LOC" }
    value: "48,600"
    desc: { zh: "9 个 crate，跨 API / 运行时 / CLI", en: "9 crates across API / runtime / CLI" }
  - label: { zh: "暴露工具规格", en: "Tool Specs" }
    value: "40"
    desc: { zh: "bash / file / grep / web / MCP 等", en: "bash / file / grep / web / MCP etc." }

nav:
  - { label: { zh: "总览", en: "Overview" }, href: "#overview" }
  - { label: { zh: "哲学理念", en: "Philosophy" }, href: "#philosophy" }

references:
  - id: 1
    author: "ultraworkers/claw-code"
    url: "https://github.com/ultraworkers/claw-code"
    note: { zh: "主仓库", en: "Main repository" }
---
```

### 4.2 Section 声明

```markdown
## #overview 01 / Project Overview
zh: 1. 项目总览
en: 1. Project Overview

> section-desc
> zh: Claw Code 是 ultraworkers/claw-code 仓库的开源编码代理 harness。
> en: Claw Code is an open-source coding agent harness.
```

规则：
- `## #id NN / Kicker` — 创建 `<section id="id">` + `.section-kicker`
- `zh:` / `en:` 行提供双语 h2
- `> section-desc` 块提供描述段落

### 4.3 组件块（DSL）

使用 `:::component-type` 围栏语法（类似 GitHub Markdown 的 admonition）。

#### 4.3.1 Insight Grid（洞察卡片网格）

```markdown
:::insight-grid

::card 01
### { zh: "背景", en: "Background" }
{ zh: "由 Bellman / Yeachan Heo 发起...", en: "Founded by Bellman..." }

::card 02
### { zh: "移植历程", en: "Porting Journey" }
{ zh: "TypeScript → Python → Rust...", en: "TypeScript → Python → Rust..." }

:::
```

#### 4.3.2 Comparison Grid（对比卡片）

```markdown
:::comparison

::versus { zh: "传统模式", en: "Traditional" }
### { zh: "人类驱动", en: "Human-Driven" }
{ zh: "开发者在终端中逐行编码...", en: "Developers code line by line..." }

::versus { zh: "Claw 模式", en: "Claw Mode" }
### { zh: "代理驱动", en: "Agent-Driven" }
{ zh: "人类通过 Discord 发送指令...", en: "Humans send directives via Discord..." }

:::
```

#### 4.3.3 Accordion Stack（折叠面板）

```markdown
:::accordion

::panel { open: true }
### { zh: "人类接口是 Discord", en: "The Human Interface Is Discord" }
{ zh: "在 Claw Code 的工作流中...", en: "In Claw Code's workflow..." }

::panel
### { zh: "瓶颈已经转移", en: "The Bottleneck Has Shifted" }
{ zh: "当代理系统能在数小时内...", en: "When agent systems can rebuild..." }

:::
```

#### 4.3.4 Quote Block（引用块）

```markdown
:::quote
**{ zh: "设计关键", en: "Design Insight" }**
{ zh: "clawhip 最重要的设计决策...", en: "clawhip's most important design..." }
:::
```

#### 4.3.5 Table（表格）

标准 Markdown 表格语法，但支持行内属性：

```markdown
:::table { class: "lane-table" }
| { zh: "车道", en: "Lane" } | { zh: "功能", en: "Feature" } | { zh: "状态", en: "Status" } |
|------|------|------|
| 1 | Bash 验证 | `merged` |
| 2 | CI 修复 | `merged` |
:::
```

#### 4.3.6 Flow List（流程列表）

```markdown
:::flow

1. **{ zh: "可靠 Worker 启动", en: "Reliable Worker Boot" }**
   { zh: "就绪握手生命周期...", en: "Ready-handshake lifecycle..." }

2. **{ zh: "事件原生集成", en: "Event-Native Integration" }**
   { zh: "标准车道事件 Schema...", en: "Canonical lane event schema..." }

:::
```

#### 4.3.7 Badge Grid（标签网格）

```markdown
:::badges
- Anthropic API + streaming ✅
- OAuth login/logout ✅
- Interactive REPL ✅
- Plugin system 📋
:::
```

#### 4.3.8 Arch Diagram（架构图块）

```markdown
:::arch-grid

::block { tag: { zh: "任务编排", en: "Orchestration" } }
#### OmX (oh-my-codex)
{ zh: "工作流层。将短指令转化为...", en: "Workflow layer..." }

::block { tag: { zh: "事件路由", en: "Event Routing" } }
#### clawhip
{ zh: "事件和通知路由器...", en: "Event and notification router..." }

:::
```

### 4.4 Presentation 拆分标记

在 section 内部，使用 `---slide---` 分隔符声明 presentation step 边界：

```markdown
## #crates 04 / Rust Workspace
zh: 4. Rust Crate 工作区详解

> section-desc
> zh: 当前 Rust 实现由 9 个 crate 组成...

:::arch-grid { slide-title: { zh: "9 个 Crate 职责", en: "9 Crate Responsibilities" } }
<!-- crate cards -->
:::

---slide { title: { zh: "CLI 能力与配置", en: "CLI Capabilities & Config" } }---

:::accordion
<!-- CLI / permissions / config panels -->
:::
```

规则：
- `---slide---` 在渲染时生成 `data-present-step` 属性
- 如果一个组件块自带 `slide-title`，它自己就是一个独立 step
- 没有 `---slide---` 的 section 自动作为整体成为一个 step（现有行为）

### 4.5 自动 Slide 拆分（可选增强）

渲染器可以在生成 DOM 后测量每个 section 的高度，自动为超出 `100vh` 的 section 插入 step 边界。策略：

1. 渲染完成后，遍历所有 `.section`
2. 如果 `section.scrollHeight > window.innerHeight * 1.2`，寻找最佳拆分点（组件块边界）
3. 自动包装为 `data-present-step` 容器

这消除了手动标注的需要，但保留 `---slide---` 作为强制覆盖。

---

## 5. 双语处理策略

### 5.1 内联双语对象

所有用户可见文本使用 `{ zh: "...", en: "..." }` 格式。渲染器根据当前 lang 选择正确文本：

- Frontmatter 中：YAML 原生对象
- Body 中：行内 JSON-like 标记

### 5.2 回退规则

- 如果某段文本只提供字符串（非对象），视为 zh 文本，en 回退为同一值
- 这允许渐进添加翻译

### 5.3 渲染输出

渲染器生成的 DOM 直接设置 `data-zh` / `data-en` 属性，与现有 CSS / JS 完全兼容。

---

## 6. 组件类型注册表

基于对 15 篇文章的完整审计，以下是渲染器需要支持的组件类型：

### 6.1 通用组件（所有文章使用）

| 组件 | DSL 标记 | HTML 输出 | 出现率 |
|------|----------|-----------|--------|
| Section | `## #id NN / Kicker` | `<section class="section" data-reveal>` | 15/15 |
| Insight Grid | `:::insight-grid` | `<div class="insight-grid">` | 15/15 |
| Hero | frontmatter | `<header class="hero">` | 15/15 |
| Metrics | frontmatter `metrics:` | `<div class="hero-metrics">` | 15/15 |

### 6.2 高频组件

| 组件 | DSL 标记 | 出现率 |
|------|----------|--------|
| Comparison Grid | `:::comparison` | 13/15 |
| Accordion | `:::accordion` | 10/15 |
| Quote Block | `:::quote` | 8/15 |
| Table | `:::table` 或原生 MD 表格 | 8/15 |
| Flow List | `:::flow` | 6/15 |
| Badge Grid | `:::badges` | 5/15 |

### 6.3 低频/专用组件

| 组件 | DSL 标记 | 使用文章 |
|------|----------|----------|
| Arch Grid | `:::arch-grid` | Claw Code, Enterprise Agent |
| Tier Grid | `:::tier-grid` | Function Calling, Hermes |
| Prompt Block | `:::code` | Text-to-Image, Harness Eng |
| Logo Wall | `:::logo-wall` | MS AI Customer Cases |
| Filter UI | `:::filter` | MS AI Customer Cases |
| Evolution Timeline | `:::timeline` | Hermes Open Model |

### 6.4 扩展策略

渲染器对未知 `:::type` 块产出 `<div class="type">` + 内部 MD 渲染。这意味着：
- 作者可以发明新组件类型
- 只需在 `article.css` 添加对应样式
- 不需要修改渲染器代码

---

## 7. article-init.js：共享行为提取

从 15 篇文章中提取完全重复的内联脚本，合并为一个共享模块：

```javascript
// article-init.js — 所有文章共享的初始化行为
(function () {
  // 1. Scroll reveal observer（.load-in + [data-reveal]）
  // 2. Nav highlighting observer
  // 3. Accordion toggle（单开模式）
  // 4. Load-in stagger animation
  // 5. Theme / Language from localStorage
  // 6. Presentation mode section-head 隐藏
})();
```

收益：
- 修复一次 → 所有文章生效（彻底消除 .load-in 遗漏类 bug）
- 新文章零 boilerplate JS
- 可独立于渲染器使用（旧 HTML 文章也可以替换内联脚本为此文件）

---

## 8. 迁移策略

### 8.1 阶段一：提取共享行为（无风险）

1. 创建 `assets/article-init.js`，提取 5 段重复脚本
2. 新文章使用 `<script src="article-init.js">`，删除内联脚本
3. 旧文章逐步替换（向后兼容）

### 8.2 阶段二：构建渲染器原型

1. 引入 `marked.min.js`（MIT 许可，~40KB）
2. 实现 `article-renderer.js`，支持 frontmatter + 6 个通用组件
3. 选择一篇中等复杂度的文章（如 claw-code-analysis）作为 pilot
4. 验证渲染结果与手写 HTML 视觉一致

### 8.3 阶段三：完善 DSL + 迁移

1. 补充低频组件支持
2. 逐篇将现有文章转换为 `.md` 格式
3. 保留 `index.html` shell 不变
4. 旧格式文章继续工作

### 8.4 阶段四（可选）：自动 slide 拆分

1. 实现 DOM 高度检测 + 自动拆分
2. 移除所有手动 `data-present-step` / `---slide---`

---

## 9. 已知风险与取舍

| 风险 | 缓解 |
|------|------|
| **FOUC**（首次加载白屏闪烁） | 在 shell 中放置 CSS skeleton / 加载动画；MD fetch + 渲染通常 < 200ms |
| **SEO 不友好** | GitHub Pages 场景下 SEO 非关键需求；如需改善可预渲染为静态 HTML |
| **marked.js 文件体积** | gzip 后 ~14KB，对比单篇文章 HTML ~25KB 是净减少 |
| **DSL 语法学习成本** | 控制在 8 个核心标记内；标准 MD 覆盖 70% 场景 |
| **调试困难** | 渲染器输出标准 DOM，DevTools 检查无差异 |
| **特殊布局支持** | 保留在 shell 的 `<style>` 中添加文章级 CSS 覆盖的能力 |

---

## 10. 不做什么

- **不引入 React / Vue / Svelte** — 项目约束明确排除框架
- **不做 SSG 预渲染** — 保持零 build step
- **不合并所有文章到 SPA 路由** — 每篇文章独立 URL，保持简单
- **不强制迁移旧文章** — 渐进替换，旧 HTML 持续可用
- **不改变现有组件的视觉设计** — 只改生产方式，不改输出样式

---

## 11. 决策点（需要讨论）

1. **双语语法**：`{ zh: "...", en: "..." }` 内联 JSON 是否足够简洁？是否考虑并列文件（`article.zh.md` + `article.en.md`）方案？
2. **MD 解析器选择**：marked.js vs markdown-it（更大但插件生态更丰富）vs 自写极简解析器？
3. **组件块语法**：`:::type` 围栏 vs `<!-- @type -->` HTML 注释 vs 其他标记？
4. **Frontmatter 复杂度**：hero panel、metrics、nav 放在 frontmatter 中还是 body 中？
5. **文章级 CSS**：继续放在 shell 的 `<style>` 中，还是也提取到独立 `.css` 文件？
6. **阶段一优先级**：是否先单独做 `article-init.js` 提取（收益确定、风险零），再讨论渲染器？

---
applyTo: "posts/**/*.html"
---

# Article Page Conventions

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
    Parent Topic Name
  </div>
  <div class="topbar-actions">
    <nav class="nav-links" aria-label="页面章节导航">
      <a href="#section-id">Section</a>
    </nav>
  </div>
</div>
```

Rules:
- `←` home link shows arrow only — no trailing text
- `.brand` text = the article's parent topic name from `assets/knowledge-data.js`, **not** the article title
- Presentation toggle, share dropdown, and other action buttons are injected dynamically by `article-presentation.js` — **NEVER** add them in HTML

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

- Use semantic section structure: `.section` with `data-reveal`, `.section-head` with `.section-kicker`
- Footer format: `© 2026 illusion615's Knowledge Hub | 交互式 HTML 页面。` — 统一使用项目名，不放文章标题
- Reference list uses `.bib-list` class with `.bib-id`, `.bib-author`, `.bib-note` structure
- External links with `target="_blank"` must include `rel="noopener noreferrer"`
- No inline `style=""` attributes on HTML elements — use classes or inline `<style>` block
- **`data-zh` / `data-en` 属性值中禁止使用 ASCII 直引号 `"`（0x22）**——会被 HTML 解析器当作属性结束符导致内容截断。中文引号必须使用弯引号 `""`（U+201C / U+201D），英文引号使用 `'`（单引号）或 `&quot;`

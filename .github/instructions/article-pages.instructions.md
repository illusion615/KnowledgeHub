---
applyTo: "posts/**/*.html"
---

# Article Page Conventions

## Script & CSS Loading

- Link shared CSS via `<link rel="stylesheet" href="../../assets/article.css" />` before any inline `<style>`
- Link shared scrollbar CSS via `<link rel="stylesheet" href="../../assets/scrollbar.css" />`
- Only article-specific overrides (e.g., hero title sizing, custom component colors) go in inline `<style>`
- Include all dark mode CSS variants for **shared components** in `assets/article.css` — NEVER in inline `<style>`
- Dark mode rules for **article-specific** components (e.g., custom tag colors) go in inline `<style>`
- At bottom of `<body>`, include shared scripts in this exact order:
  1. `<script src="../../assets/article-common.js"></script>`
  2. Article's inline `<script>` (custom components only — see "Forbidden JS" below)
  3. `<script src="../../assets/article-presentation.js"></script>`
  4. `<script src="../../assets/scrollbar.js"></script>` (if scrollbar imported)

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

## Presentation Mode

- Default presentation steps are hero + each `.section`; use `data-present-step` and optional `data-step-title` only for custom slide granularity
- `article-presentation.js` automatically splits accordion sections into overview + detail steps
- Hero may keep its in-flow title; content slides rely on the shared deck overlay for active step title
- Dense content (matrices, tables, stacked accordions) should be split into multiple `data-present-step` slides rather than shrinking type
- Section-head is automatically hidden in presentation mode for sections with nested `[data-present-step]` (CSS `:has()` rule)

## Other Rules

- Use semantic section structure: `.section` with `data-reveal`, `.section-head` with `.section-kicker`
- Footer format: `© 2026 {Article Title} | 交互式 HTML 页面。`
- Reference list uses `.bib-list` class with `.bib-id`, `.bib-author`, `.bib-note` structure
- External links with `target="_blank"` must include `rel="noopener noreferrer"`
- No inline `style=""` attributes on HTML elements — use classes or inline `<style>` block

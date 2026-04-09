---
applyTo: "posts/**/*.html"
---

# Article Page Conventions

- Link shared CSS via `<link rel="stylesheet" href="../../assets/article.css" />` before any inline `<style>`
- Only article-specific overrides (e.g., hero title sizing) go in inline `<style>`
- Include all dark mode CSS variants (`[data-theme="dark"]` selectors) in `assets/article.css`
- Include scroll-reveal observer, accordion, and tab JS at bottom
- Include localStorage theme/lang auto-apply script
- Include shared presentation script via `<script src="../../assets/article-presentation.js"></script>` after the page's inline script
- For custom presentation flow, annotate custom slide containers with `data-present-step` and optional `data-step-title`; otherwise hero + each `.section` become presentation steps automatically
- In presentation mode, hero may keep its in-flow title, but content slides should rely on the shared top-left presentation deck for the active step title; treat `.section-head` inside slides as optional intro copy, not the primary slide heading
- Presentation steps should fit a single viewport comfortably; if a matrix, table, accordion stack, or comparison block is too dense, split it into multiple `data-present-step` slides instead of shrinking type or compensating with ad hoc spacing
- Include `← 返回首页` home link with `data-zh` and `data-en` attributes (href="../../")
- Use semantic section structure: `.section` with `data-reveal`, `.section-head` with `.section-kicker`
- Footer format: `© 2026 {Article Title} | 交互式 HTML 页面。`
- Reference list uses `.bib-list` class with `.bib-id`, `.bib-author`, `.bib-note` structure

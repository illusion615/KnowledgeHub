---
applyTo: "posts/**/*.html"
---

# Article Page Conventions

- Link shared CSS via `<link rel="stylesheet" href="../../assets/article.css" />` before any inline `<style>`
- Only article-specific overrides (e.g., hero title sizing) go in inline `<style>`
- Include all dark mode CSS variants (`[data-theme="dark"]` selectors) in `assets/article.css`
- Include scroll-reveal observer, accordion, and tab JS at bottom
- Include localStorage theme/lang auto-apply script
- Include `← 返回首页` home link with `data-zh` and `data-en` attributes (href="../../")
- Use semantic section structure: `.section` with `data-reveal`, `.section-head` with `.section-kicker`
- Footer format: `© 2026 {Article Title} | 交互式 HTML 页面。`
- Reference list uses `.bib-list` class with `.bib-id`, `.bib-author`, `.bib-note` structure

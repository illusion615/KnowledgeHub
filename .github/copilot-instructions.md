# Study Room — Copilot Instructions

## Project Identity
- Static blog site published via GitHub Pages
- All content is plain HTML — no build step, no framework, no SSG
- License: CC BY 4.0

## File Structure
- `index.html` — Knowledge graph homepage (full-screen, interactive canvas)
- `posts/{slug}/index.html` — Individual articles (structured, progressive disclosure)
- `.github/` — Copilot harness files

## Article Design Principles
- Articles use **structured, progressive disclosure** design — NOT traditional blog format
- Each article is a self-contained interactive HTML page with:
  - Hero section with key metrics
  - Numbered sections with kicker labels (e.g., "01 / Section Name")
  - Accordion subsections for deep-dive content
  - Comparison grids, flow lists, insight cards
  - Scroll-reveal animations
- CSS and JS are inline (no external dependencies except Google Fonts)
- Every article must support dark/light mode via `[data-theme="dark"]` CSS
- Every article must auto-apply homepage preferences from `localStorage` (theme, lang)
- Every article must include a `← 返回首页` home link

## Homepage Architecture
- Full-screen knowledge graph with planets and orbiting knowledge nodes
- Planets = topic groups (data-driven via `planetId`, NOT tied to directory structure)
- Adding articles: edit `posts[]` array in `index.html`, set `planetId` to group
- All text elements support zh/en via `data-zh` / `data-en` attributes

## Coding Conventions
- Pure vanilla JS — no jQuery, no React, no npm
- CSS custom properties for theming (`:root` + `[data-theme="dark"]`)
- Shared article styles live in `assets/article.css` — article-specific overrides stay inline
- `DOMContentLoaded` wrapper for all scripts
- Declare all `var` at top of scope to avoid hoisting issues
- Use `forEach` with function expressions (not arrow functions) for IE compat

## Forbidden Patterns
- Do NOT use JavaScript frameworks or bundlers
- Do NOT add `node_modules` or any build tooling
- Do NOT use arrow functions in article scripts (broad browser compat)
- Do NOT create markdown articles — all content is HTML

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
- Every article must include a `←` home link (arrow only, no text): `<a class="home-link" href="../../" data-zh="←" data-en="←" aria-label="返回首页">←</a>`
- Bilingual support: `knowledge-data.js` entries must have zh/en title and summary; article page content is primarily Chinese; homepage UI elements use `data-zh` / `data-en` attributes

## Homepage Architecture
- Full-screen knowledge graph with four layout modes: Galaxy / Cards / Infographic / Cell
- Knowledge hierarchy stored in `assets/knowledge-data.js` as flat `knowledgeTree[]` (adjacency list)
- **Adding articles**: edit `knowledgeTree[]` in `assets/knowledge-data.js`, set `parentId` to parent topic
- **Adding topic groups**: add `{ type: 'topic', parentId, ... }` entry — depth unlimited
- **Moving nodes**: change `parentId` only — no file moves needed
- **NEVER** hardcode knowledge data in `index.html` — always use `assets/knowledge-data.js`
- `index.html` auto-derives `planets`, `groups`, `posts` arrays from `knowledgeTree` via tree utilities
- All text elements support zh/en via `data-zh` / `data-en` attributes

## Research-To-Publish Workflow
- When the user gives a research topic, follow this sequence: frame the research question and audience → collect source anchors and measurement conditions → draft the article structure → run fact / logic / terminology review → update `assets/knowledge-data.js` only after the article is complete and reviewed → publish/share from the same HTML source
- Do not register a new article in `knowledge-data.js` before the page exists and the title / summary / tags / parent topic are finalized
- **Summary length**: `knowledge-data.js` 中的 `summary.zh` / `summary.en` 必须控制在 4 行以内（中文 ≤ 100 字符，英文 ≤ 160 字符）。保留核心信息，去除冗余细节和枚举列表
- If quantitative evidence is missing, state the gap explicitly instead of filling it with vague language
- When updating a published article, keep the article body and its `knowledge-data.js` summary/metadata synchronized in the same change

## Coding Conventions
- Pure vanilla JS — no jQuery, no React, no npm
- CSS custom properties for theming (`:root` + `[data-theme="dark"]`)
- Shared article styles live in `assets/article.css` — article-specific overrides stay inline
- Shared article initialization (scroll-reveal, accordion, localStorage sync) via `assets/article-common.js`
- Presentation mode orchestration via `assets/article-presentation.js`; email share, screen recording, narration UI are lazy-loaded modules (`article-email-share.js`, `article-screen-recording.js`, `article-narration-ui.js`) — do NOT add them to article HTML
- `DOMContentLoaded` wrapper for all scripts
- Declare all `var` at top of scope to avoid hoisting issues
- Use `forEach` with function expressions (not arrow functions) for IE compat

## Testing
- Run `node tests/validate.js` before every commit — exit code 0 required
- Test suite covers: knowledge-data.js integrity, script order, inline style violations, arrow function bans, asset syntax, CSS known issues, article structural checks

## Forbidden Patterns
- Do NOT use JavaScript frameworks or bundlers
- Do NOT add `node_modules` or any build tooling
- Do NOT use arrow functions in article scripts (broad browser compat)
- Do NOT create markdown articles — all content is HTML

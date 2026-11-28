# CLAUDE.md

This file provides guidance to Claw Code (clawcode.dev) when working with code in this repository.

## Detected stack
- Static HTML/CSS/JS knowledge hub (`posts/<slug>/index.html`, `assets/*.js`, `assets/*.css`) backed by zero-dependency Node.js compilation and verification scripts (`tools/markdown-compiler/`, `tools/publish-article.js`, `tests/validate.js`).
- Primary authoring workflow: write or revise `posts/<slug>/article.md` first, then compile deterministic static HTML via `node tools/compile-markdown-article.js` or `node tools/publish-article.js <slug>`.

## Repository shape
- **Self-contained article bundle (`posts/<slug>/`)**: Every specialty article co-locates its canonical Markdown source (`posts/<slug>/article.md`), compiled static HTML (`posts/<slug>/index.html`), media assets (`posts/<slug>/media/`), and all article-specific supporting documents (draft increments, revision plans, source ledgers, builder handoffs, prompts, and per-article benchmark/experiment notes under `posts/<slug>/docs/`). `tools/sync-docs-navigation.js` groups articles that have supporting Markdown files into a single article folder under their business topic in `docs/navigation.json`.
- **Global vs. per-article boundaries**: Top-level `docs/` and `authoring/workflow-feedback/` are reserved strictly for cross-article platform specifications and shared workflow mechanisms; never scatter single-article drafts, ledgers, or experiment notes outside `posts/<slug>/`.
- `tests/` contains validation gates (`node tests/validate.js`, `node --test tests/markdown-compiler.test.js`, `node --test tests/publish-article.test.js`) that should be reviewed alongside code changes.

## Article authoring guidelines
- **Clarify on demand, never mechanically**: Understand the user's intent first. When audience, scope, and source materials are clear enough to execute responsibly, proceed directly using domain judgment instead of halting to ask a scripted 5-question questionnaire. Ask targeted clarification questions only when missing information genuinely blocks core thesis, factual boundaries, or non-public constraints.
- **Genre-native Markdown organization**: Author `posts/<slug>/article.md` first, then compile static HTML. Never force topics into a rigid chapter template or closed genre enum; mathematical modeling papers, user manuals, market research reports, and engineering architecture postmortems each follow the natural argumentative structure of their discipline.
- **Anti-over-engineering**: Never pad an article with components just to look "full-featured", and do not invent rigid required frontmatter fields. Omit `panel` / `metrics` when a clean single-column opening fits better; do not insert decorative `$$` equations into non-quantitative prose; do not draw opening block diagrams when plain text or a table is clearer; and do not build `:::sandbox` widgets unless real parameter exploration is needed.

## Working agreement
- Prefer small, reviewable changes and keep generated bootstrap files aligned with actual repo workflows.
- Keep shared defaults in `.claude.json`; reserve `.claude/settings.local.json` for machine-local overrides.
- Do not overwrite existing `CLAUDE.md` content automatically; update it intentionally when repo workflows change.

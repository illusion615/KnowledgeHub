# AGENTS.md

This file provides guidance to Claw Code (clawcode.dev) when working with code in this repository.

## Detected stack
- Static HTML/CSS/JS knowledge hub (`posts/<slug>/index.html`, `assets/*.js`, `assets/*.css`) backed by zero-dependency Node.js compilation and verification scripts (`tools/markdown-compiler/`, `tools/publish-article.js`, `tests/validate.js`).
- Primary authoring workflow: write or revise `posts/<slug>/article.md` first, then compile deterministic static HTML via `node tools/compile-markdown-article.js` or `node tools/publish-article.js <slug>`.

## Repository shape
- `posts/<slug>/article.md` is the canonical human-authored source for Markdown-backed articles; `posts/<slug>/index.html` is the self-contained static artifact served on GitHub Pages.
- `tests/` contains validation gates (`node tests/validate.js`, `node --test tests/markdown-compiler.test.js`, `node --test tests/publish-article.test.js`) that should be reviewed alongside code changes.

## Article authoring guidelines
- **Clarify on demand, never mechanically**: Understand the user's intent first. When audience, scope, and source materials are clear enough to execute responsibly, proceed directly using domain judgment instead of halting to ask a scripted 5-question questionnaire. Ask targeted clarification questions only when missing information genuinely blocks core thesis, factual boundaries, or non-public constraints.
- **Genre-native Markdown organization**: Author `posts/<slug>/article.md` first, then compile static HTML. Never force topics into a rigid chapter template or closed genre enum; mathematical modeling papers, user manuals, market research reports, and engineering architecture postmortems each follow the natural argumentative structure of their discipline.
- **Anti-over-engineering**: Never pad an article with components just to look "full-featured", and do not invent rigid required frontmatter fields. Omit `panel` / `metrics` when a clean single-column opening fits better; do not insert decorative `$$` equations into non-quantitative prose; do not draw opening block diagrams when plain text or a table is clearer; and do not build `:::sandbox` widgets unless real parameter exploration is needed.

## Working agreement
- Prefer small, reviewable changes and keep generated bootstrap files aligned with actual repo workflows.
- Keep shared defaults in `.Codex.json`; reserve `.Codex/settings.local.json` for machine-local overrides.
- Do not overwrite existing `AGENTS.md` content automatically; update it intentionally when repo workflows change.

## Continuous workflow feedback
- At a safe checkpoint after user feedback about layout, structure, reader needs, evidence or workflow, read `authoring/workflow-feedback/README.md` and submit a short record via `python3 scripts/workflow-feedback.py submit --file <feedback.json>`.
- Record the user's wording, issue, proposed scope and actual verification. No credentials, complete chat logs or image blobs. Collect promptly; do not wait until the article ends.
- `article-workflow-improvement` owns triage and validated shared-rule releases. Article agents fix their scoped task but do not independently propagate shared rules.
- Shared changes are not global until main and applicable worktrees are safely synchronized. Preserve dirty work; report blocked synchronization instead of overwriting it.

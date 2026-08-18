---
applyTo: "docs/reviews/**"
description: "L2 project-specific review standard for Study-Room (Knowledge Hub static HTML blog). Read in full whenever the boss says 开始审查 / 代码审查 / 架构审查 / 文档审查 / code review. Pairs with L1 skill code-review-framework (method) and the L3 baseline (this repo's /memories/repo/review-baselines.md). Migrated from the previously-blog-specific L1 rubrics on 2026-06-13."
---

# Code / Architecture / Documentation Review Standard — Study-Room Knowledge Hub (L2)

> **Role in the 3-tier model.** L1 (`~/.copilot/skills/code-review-framework`) = method (9 dimensions, ABCD, red-line mechanism, flow). **This file (L2)** = THIS project's stack-specific rubrics, thresholds, scope, and report contract for a static HTML article hub. L3 = this repo's `/memories/repo/review-baselines.md` (scale numbers + trend; seed below in §7 until it exists).
>
> **Trigger contract.** When the boss says {开始审查, 代码审查, 架构审查, 文档审查, code review, health check}, do NOT improvise — run the fixed pipeline (§6) using scope (§1), rubrics (§3), red lines (§4), report contract (§5). If this file or L3 is missing, say so and stop.
>
> **Authoritative companion spec**: article markup rules live in `.github/instructions/article-pages.instructions.md` §0 (auto-applied to `posts/**/*.html`). This review file judges conformance to that spec; it does not restate it.

---

## 1. Three review tracks (run all three unless boss scopes down)

| Track | Question | Scope | Granularity |
|---|---|---|---|
| **A. Code** | Is each article + shared asset correct, safe, maintainable? | `posts/**/*.html`, `assets/*.{js,css}` (excl vendored `html2canvas.min.js`, `pptxgen.bundle.js`) | File |
| **B. Architecture** | Is the shared-asset system sound — no per-article reimplementation, clean shared/article separation? | `assets/**` + how `posts/**` consume them + `index.html`/`settings.html` | Asset / system |
| **C. Documentation** | Do `.github/instructions/*` and design docs match the actual article markup + shared assets? | `.github/instructions/**`, `CLAUDE.md`, `posts/article-design-system/**` | Doc-vs-code |

**Per-track strategy:**
- **A. Code** — for each changed article, check it follows the canonical markup from `article-pages.instructions.md`; for shared assets, check null-guards, escaping, lazy-loading.
- **B. Architecture** — verify behavior (accordion, reveal, theme, presentation, narration, export) lives in shared `assets/*.js`, NOT reimplemented inline per article. Watch shared-asset bloat trend.
- **C. Documentation** — confirm the design-system doc (`posts/article-design-system/index.html`) and `article-pages.instructions.md` still match `article.css` reality; run `node tests/validate.js` (must exit 0 against the known WARN baseline).

---

## 2. Architecture invariants (the "should look like" baseline for dimension 1)

```
index.html / settings.html (hub shells)
posts/<slug>/index.html (articles)  ──consume──▶  assets/ (single source of shared behavior+style)
   • markup per .github/instructions/article-pages.instructions.md §0
   • shared style: article.css  • shared diagram css: article-diagram.css
   • shared behavior: article-common.js, article-renderer.js, article-presentation.js,
     article-narration*.js, article-math.js, article-lightbox.js, pan-zoom.js,
     pptx-export.js, article-email-share.js, article-screen-recording.js, etc.
   • data: knowledge-data.js (hub index entries)
```

**Invariants (each a check; cite file:line):**
1. **No shared behavior reimplemented inline** — accordion / scroll-reveal / theme-toggle / presentation / narration / export must come from `assets/*.js`, never copy-pasted into an article.
2. **Canonical markup** — every `posts/**/*.html` conforms to `article-pages.instructions.md` §0 checklist (script order, shared classes, no ad-hoc layout system).
3. **Shared/article separation clean** — articles carry content + structure only; cross-article styling lives in `article.css` (inline `style` only for one-off content, not shared components).
4. **External links** carry `rel="noopener noreferrer"`; no inline event handlers; `localStorage` reads sanitized.
5. **Heavy libs lazy-loaded** — `pptxgen.bundle.js`, `html2canvas.min.js`, export paths loaded on demand, not on every article view.
6. **Dual-theme parity** — every shared component renders correctly in normal / presentation / dark modes.
7. **Validator green** — `node tests/validate.js` exits 0 (known WARN baseline only).

---

## 3. Nine-dimension rubrics — specialized for static HTML article hub

Grade **A**/**B**/**C**/**D** with `file:line` evidence.

1. **Architecture consistency** — A: all articles follow canonical markup + clean shared/asset separation. B: 1-2 articles deviate (wrong script order, extra inline styles for shared components). C: new shared behavior reimplemented inline in an article, or a shared asset has conflicting patterns. D: some articles use a different layout system entirely.
2. **Code duplication** — A: no duplicated behavior; shared code in `assets/*`. B: minor inline overrides extractable to `article.css`. C: same ≥15-line block in 3+ articles. D: core behavior (accordion/reveal/theme/narration) reimplemented per-article.
3. **Naming & readability** — A: CSS classes semantic, JS functions self-documenting, consistent across assets. B: kebab/camel mixing, unclear abbreviations. C: multiple conventions; new dev confused. D: actively misleading names.
4. **Error handling & robustness** — A: null guards on DOM queries; graceful degradation; export (PPT/PDF) has try/catch + user feedback. B: missing null check on 1-2 new DOM queries. C: silent failure (missing element → blank section, no error). D: errors swallowed, broken state with no feedback.
5. **Testability** — A: features verifiable via DevTools; presentation/export/theme all manually testable; `tests/validate.js` covers markup. B: one new feature not easily verifiable. C: regression risk — a shared-file change could silently break articles. D: untestable coupling.
6. **Performance & resources** — A: no needless DOM traversal; heavy libs lazy-loaded; transitions hardware-accelerated. B: one suboptimal pattern (querySelectorAll in scroll handler). C: visible issue (layout thrash, >100ms main-thread block). D: user-visible lag or memory leak.
7. **Security & data integrity** — A: all external links `rel="noopener noreferrer"`; no inline handlers; localStorage sanitized. B: 1-2 new links missing rel. C: user input reaches innerHTML unescaped. D: XSS / data exfiltration vector.
8. **Design system & component reuse** — A: articles use shared components from `article.css`; CSS custom properties for theming; dark mode consistent. B: 1-2 article-specific components promotable to shared. C: duplicate component patterns under different class names. D: shared component behaves inconsistently across normal/presentation/dark.
9. **Documentation health** — A: `.github/instructions/*` + design-system doc match code; repo memory trap cards current. B: one instruction slightly outdated. C: instruction describes a removed pattern, or new pattern lacks coverage. D: instruction contradicts code.

---

## 4. Red lines

| Red line | Threshold (seeded from 2026-06-13 scale) | Action |
|---|---|---|
| **Shared-asset bloat** | `article.css` and `article-presentation.js` already ~4900 / ~4500 lines → warn ≥ 4000, hard ≥ 6000 (split/modularize plan) | At baseline both are large but single-purpose; do NOT block, but any growth >10% triggers a split-plan discussion. |
| **Per-article duplication** | same logic block (≥15 lines) in 3+ articles | Must extract to a shared asset. |
| **Core behavior reimplemented per-article** | accordion/reveal/theme/narration/export inline in any article | Dimension 1/2 = C minimum. |
| **Validator** | `node tests/validate.js` exits non-zero (beyond known WARN baseline) | Dimension 5 = C; fix before next article. |
| **D-grade** | any dimension = D | STOP new articles; next session remediation-only. |
| **Trend** | article count or any shared asset grew ≥25% since L3 baseline, OR a dimension dropped a grade | Trigger a full review; record in report. |

---

## 5. Report contract

- **Format**: Progressive-Disclosure HTML article (matches the hub's own design system — warm gradient bg, frosted topbar, numbered sections, accordions, dark/light toggle; mermaid for any non-trivial flow, verified in-browser).
- **Location**: `docs/reviews/` (create if absent).
- **Filename**: `code-review-<YYYY-MM-DD>.html` / `architecture-review-<YYYY-MM-DD>.html`.
- **Required sections**: 1) Scope & type · 2) Scale snapshot (articles, each shared asset line count, vs L3 baseline + deltas) · 3) Nine-dimension scorecard with `file:line` evidence · 4) Red-line check · 5) Findings (problem-led) · 6) Action items P0/P1/P2 · 7) Baseline update for L3.
- **After**: update L3 baseline; surface P0/P1 to boss before remediation.

---

## 6. Fixed pipeline

```
1. Read L2 (this) + L3 baseline + article-pages.instructions.md + repo memory traps.
2. Default scope = all three tracks (A/B/C) unless boss narrows.
3. Collect scale (article count + each shared asset lines) → compare L3 → trend red-lines.
4. Track A: per changed article + shared asset, check §2/§4.
5. Track B: verify shared behavior not reimplemented inline; check asset bloat.
6. Track C: design-system doc + instructions vs article.css; run tests/validate.js.
7. Grade 9 dimensions + red-line check, with file:line evidence.
8. Write §5 HTML report into docs/reviews/.
9. Update L3 baseline; surface P0/P1. D-grade/P0 → stop new articles.
```

---

## 7. L3 baseline seed (2026-06-13) — copy into this repo's /memories/repo/review-baselines.md when next working in the Study-Room workspace

```
# Review baselines (L3 — project state)
- Baseline date: 2026-08-18
- Articles (posts/ dirs): 147 ; article html files: 147
- Shared assets (lines): article.css 5039, article-presentation.js 4470, knowledge-data.js 2870, article-common.js 485, pptx-export.js 448 (+ ~20 more behavior assets: article-renderer, article-narration*, article-math, article-lightbox, pan-zoom, article-email-share, article-screen-recording, infographic-view/mobile, cell-game, color-schemes, scrollbar)
- Architecture review trigger: article count or any shared asset grows ~25% from baseline
- Validator: node tests/validate.js must exit 0 (known WARN baseline)
- Calendar trigger: review if >6 weeks since baseline date
- Last full review report: (none yet) → docs/reviews/
```

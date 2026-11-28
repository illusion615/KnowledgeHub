# Core presentation curation — 2026-09-26

## Follow-up: two actual live-demo pages

The user clarified: “那两个演示也需要各自作为一页”. The current deck is
**22 pages**: keep the 18 explanation/evidence topics, add a dedicated interactive
Tank Arena page (14) and Support Theater page (17), plus cover/closing. The
20-page description below records the initial curation, not the current count.

The actual existing UI instances are temporarily moved into the two slide hosts,
not cloned or recreated. Exiting restores their exact reading positions and
settings; listeners/canvases remain the same objects. Introduction links advance
to the corresponding live slide rather than leaving presentation. Start/Stop,
settings and consent are preserved; no navigation starts or stops a match.
Support KPI blocks are temporarily wrapped in collapsible “Metrics and Usage”
panels so the conversations remain prominent; reading mode restores the original
layout. Each host may scroll internally without creating additional pages.

Updated tests walk all 22 pages in both languages and narrow mobile, exercise
both settings panels, verify input arrows don't navigate, Escape closes dialogs
before exiting, and confirm original DOM identity/settings after restoration.
These are UI contract tests with inference forbidden, not new live-model results.
The updated 22-slide English/dark PPTX was rendered and reviewed: the shared
exporter omits the arena canvas and renders collapsed support descendants,
causing overlap. The earlier font issue also remains. Thus export deliverability
is still rejected; browser interaction is the accepted surface. No shared
exporter changes were made as part of this article-local follow-up.

## User request

Merge related material, show core presentation content only, and remove erroneous
one-sentence pages. Do not delete detailed reading content to make slides shorter.

## Audit and editorial decision

The browser initially collected 103 pages. Ten had fewer than 160 text characters,
including the conventional closing page; several were chapter introductions whose
only purpose was repeated by the next detail page. Configuration and audit extras
also became full slides. Character count was diagnostic only, not a universal
minimum that every article must satisfy.

The new explicit outline has 18 substantive topics, plus the existing title and
closing = **20 pages**:

1. Cover (existing hero)
2. Release cadence / implementation diversity
3. Discussion evidence and its demand limits
4. Category responsibilities and no-adoption alternative
5. Three-model implementation comparison
6. Jev's three output contracts
7. Hosted access, vendor evidence and runtime boundaries
8. NanoJev architecture/training/compute
9. Local-runtime verification vs business reliability
10. Laya checkpoint/specialization evidence
11. Chinese small-sample quality/time tradeoff
12. Three scenario patterns and responsibility boundaries
13. Tank demo: model/search/execution contributions
14. Prior research-cycle results and rejected claims
15. Support demo: multi-intent, quality review and real streaming
16. Enterprise integration and control plane
17. Deployment, governance, ownership and operations
18. Quality/coverage, full costs and phased rollout
19. Evidence-based adoption / ADR conclusion
20. Closing

The deck does not newly claim all model tests or game variants are equivalent.
The 56-game research series remains attributed to that historical policy; later
v4/v5 features are not credited with those results. Support uncertainty is not
called zero accuracy, and trial adoption is not paid retention. Each substantive
slide includes a visible evidence/interpretation limitation.

## Implementation

- `presentation-outline.js`: inspectable, bilingual editorial outline and source
  anchor per topic. Summaries are derived from existing article content; numeric
  tables have tests against the public research aggregates.
- `presentation.js`: validates source anchors, removes original slide markers at
  runtime only, marks original section children as reading-only for presentation,
  and appends explicit curated steps within their existing chapter containers.
  Detailed reading content, controls, IDs and source text are not rewritten.
- `presentation.css`: three-column topic layouts and concise comparison tables;
  only the active curated step appears in presentation. Reading/print hides the
  extra summary view. Mobile stacks cards and wraps compound terms.
- Tank/support deck links use the shared Escape exit path and navigate to their
  existing manual-start interfaces. No game or model call starts automatically.
- Shared `assets/article-presentation.js` and `assets/pptx-export.js` were not
  modified; no global template policy is imposed by this article-local edit.

## Verification

`tests/jev-curated-deck.test.js` checks the finite outline, bilingual content,
canonical anchors, no empty/single-sentence topic pages and historical numbers.
`tests/jev-curated-deck.browser.js` walks all 20 pages in both languages at
1440x900, verifies one visible step, no desktop content overflow, visible caveats,
exact reading-text restoration and no-inference demo exit. It also walks the
mobile deck for horizontal overflow. Actual Chinese/English screenshots for every
page were inspected via contact sheets and full-size spot checks.

Existing complete bilingual reading/deck, enterprise-adoption and scenario-modal
regressions were updated to the new deliberate page ownership/counts and passed.
JS-disabled reading remains available; the preexisting detailed source markers
are only rewritten when the curated runtime runs successfully.

## Export validation: do not hide a separate font failure

Both Chinese/light and English/dark decks were exported with the real
`tests/render-deck.js` pipeline to PPTX, converted by LibreOffice and split into
20 PNGs each. All rendered pages were inspected. **Chinese CJK characters are
missing in the converted PDF/PNGs; English text survives with substituted font
styling.** The browser deck renders correctly. The output files existing does NOT
mean their typography is acceptable for delivery.

Font discovery lists local CJK fonts but not the deck's named Noto Sans SC / Space
Grotesk families; the shared exporter names those fonts, including a hardcoded
display font for generated titles. This supports a font-substitution diagnosis,
not a completed universal font fix. This issue is submitted separately to the
shared workflow-improvement owner; no machine-wide fonts or shared exporter were
changed without coordination. Export density also flags some concise three-card
slides as sparse (roughly .29–.36 fill); these are intentional complete themes,
not isolated one-sentence paragraphs. Browser readability was inspected rather
than padding content to satisfy a numeric fill heuristic.

Summary: `examples/presentation-curation.json`.
Private validation assets: `~/.cache/study-room/jev-research/20260926-core-deck/`.
No model calls, backend restart, weight changes or unrelated service management.

Commands:

```sh
node --test tests/jev-curated-deck.test.js
node tests/jev-curated-deck.browser.js
node tests/jev-laya-research.browser.js
node tests/jev-enterprise-adoption.browser.js
node tests/jev-scenarios.browser.js
node tests/render-deck.js --article jev-system-one-research --lang zh --theme light --keep-pptx --outdir /tmp/jev-deck-curation/export-zh --json
node tests/render-deck.js --article jev-system-one-research --lang en --theme dark --keep-pptx --outdir /tmp/jev-deck-curation/export-en --json
```

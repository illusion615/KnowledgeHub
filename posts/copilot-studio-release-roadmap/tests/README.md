# Article-local validation

The published deliverable is `../index.html`, `../roadmap-query.js`, and
`../snapshot.json`. `../evidence.json` records the public-source provenance.
All checks below are scoped to this article; none installs a dependency,
reads user credentials, calls a model, or registers the article globally.

```sh
node --test posts/copilot-studio-release-roadmap/tests/roadmap-query.test.cjs
node --check posts/copilot-studio-release-roadmap/roadmap-query.js
node --check posts/copilot-studio-release-roadmap/tests/browser.cjs
node tests/verify-change.js --article copilot-studio-release-roadmap --level L2
node posts/copilot-studio-release-roadmap/tests/browser.cjs
node posts/copilot-studio-release-roadmap/tests/browser.cjs --probe-console
```

The browser suite uses Node 22's WebSocket support and an installed Chrome,
following the repository's CDP approach in `tests/render-deck.js`. Playwright
is not installed in this environment, and is not required by this local suite.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can supply another compatible browser binary.
It starts its own ephemeral loopback server and fresh browser contexts and
shuts down only what it started. The assistant is tested with a fixed,
loopback-only `TEST-ONLY-NO-INFERENCE` setting; no model request is sent.
External QR imagery is intercepted in test contexts; public Google Font assets
and this checkout's static assets are the only permitted non-model resources.

The primary browser matrix checks Chinese/light and English/dark desktop,
all 26 deck pages, keyword/status intersection, four-record pagination,
no-result states, direct source links, freshness, DOM identity and unsent
input preservation through language changes, deferred work on hidden deck
steps, hostile imported text, unsafe-link suppression, and a manual retry
of an intentionally failed snapshot fetch. It also scans every reading section
at 320px in Chinese and English. `--probe-console` separately records console
API errors across the full desktop deck transitions, English/dark 320px
reading, every status badge's contrast, and visible English-body coverage.

`--resume-mobile` is a validation-ledger convenience used only after this
builder's **mobile-only** `#sources .flow-copy code` wrapping fix. It requires
a real prior report containing completed desktop deck geometry, retains those
unchanged checks, and resumes mobile plus remaining hostile/error cases.
Independent reviewers should use the default full command, not the resume flag.

Artifacts go to ignored `tests/artifacts/`. The suite fails on runtime
exceptions; the console probe also fails on `console.error`. Wide reference
tables may scroll horizontally inside their designated wrapper, but sections,
form controls, and other visible content must remain inside the viewport.

## Actual export path

```sh
node tests/render-deck.js --article copilot-studio-release-roadmap --lang zh --theme light --outdir posts/copilot-studio-release-roadmap/tests/artifacts/deck-zh --keep-pptx --json
node tests/render-deck.js --article copilot-studio-release-roadmap --lang en --theme dark --outdir posts/copilot-studio-release-roadmap/tests/artifacts/deck-en --keep-pptx --json
```

Both actual browser exports and LibreOffice/poppler render paths ran and
produced 26 PNGs each, with no skipped images. This is **not a Chinese export
visual PASS**: the current conversion displays Chinese characters as blank
or missing glyphs, although the `.pptx` and extracted PDF text both retain
4,278 CJK characters. The browser's Chinese reading and presentation screenshots
render correctly. This rendering/font gap is reported for coordinator triage;
no shared renderer, font configuration, or global dependency was changed.
The renderer also reported sparse-slide advisories (14 zh, 9 en), including
chapter overviews; those advisories are not hidden as a clean visual acceptance.

The coordinator owns registration, independent review, the full-repository
`--final` gate, and release. No narration generation or commit was performed.

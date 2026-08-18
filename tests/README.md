# Validation Workflow

`validate.js` is the deterministic check engine. `verify-change.js` is the concurrent read-only orchestrator used during article work.

## Common Commands

```bash
# Fast text-only iteration
node tests/verify-change.js --article <slug> --level L0

# Local behavior or one-section change
node tests/verify-change.js --article <slug> --level L1

# Structural, navigation, presentation, or shared-runtime change
node tests/verify-change.js --article <slug> --level L2

# Derive scope from the working tree; shared assets force a full gate
node tests/verify-change.js --changed --level L1

# Stable change set and pre-commit gate
node tests/verify-change.js --final

# Visual self-check for the PPT export pipeline
node tests/render-deck.js --article <slug>
```

## Deck Render Self-Check

`render-deck.js` closes the loop on `assets/pptx-export.js`. It drives the
real browser export path (headless Chrome → the article's own PPT export
button → the exported blob), converts the `.pptx` with LibreOffice, and
splits it into one PNG per slide under `tmp/deck-render/<slug>/`.

```bash
node tests/render-deck.js --article <slug>                  # zh / light
node tests/render-deck.js --article <slug> --lang en --theme dark
node tests/render-deck.js --article <slug> --keep-pptx      # keep the .pptx
node tests/render-deck.js --pptx path/to/deck.pptx          # render only
node tests/render-deck.js --article <slug> --json           # machine-readable
```

Run it whenever `pptx-export.js`, `article-presentation.js`, or a
presentation-heavy layout changes — geometry replay failures (text
overflow, collapsed rows, letterboxing, flattened gradients) are invisible
to the deterministic checks and only show up in the rendered image.
**Review every PNG visually; a non-zero exit only means the pipeline ran.**

The run also prints a DENSITY section listing steps that are too sparse
(< 40% fill) or overflowing (> 100%). These are reported, never
auto-corrected: fix them in the article by merging adjacent steps or
adding a visual element, not by rescaling in the renderer.

A SKIPPED IMAGES section lists images left out of the deck. Cross-origin
images cannot be embedded (PptxGenJS fetches them by XHR and CORS refuses);
download them into the article's `media/` folder and reference them
locally. Before this was handled, a single remote image failed the whole
export with a generic "please retry" alert.

Requires Chrome/Chromium (auto-detected from the Playwright cache or an
installed browser), `soffice`, and poppler. Missing `soffice`/poppler
degrades to `{"rendered": false, "missing": [...]}` with exit 0 and keeps
the `.pptx` so the export itself is still verifiable.

Use `--json` for machine-readable timing and browser plans. Use `--serial` only to benchmark or troubleshoot concurrency.

## Architecture

- `validate.js --article <slug>` filters article-scoped checks to one or more articles.
- `validate.js --checks <list>` selects named deterministic checks.
- `validate.js --changed` targets changed articles, includes knowledge metadata when needed, and falls back to the full suite for shared assets.
- `verify-change.js` runs the validator, unstaged diff check, staged diff check, and changed-file inventory concurrently.
- IDE diagnostics and browser automation remain outside the Node runner. Run diagnostics in the same parallel tool batch; use the returned browser plan to choose the minimum browser matrix that preserves coverage.

## Adding Checks

1. Add a deterministic check function and registry entry in `validate.js`.
2. Decide whether it belongs in `ARTICLE_CHECKS` or only the full suite.
3. If it is an independent process-level check, add one task to `taskRegistry()` in `verify-change.js`; no scheduler rewrite is needed.
4. Keep tasks read-only. The main agent remains the only working-tree editor.
5. Add browser coverage to the L0/L1/L2 plan only when the new risk cannot be checked statically.

## Delegated Review

For L2 work, `Article Evidence Reviewer` and `Article Structure Reviewer` are read-only custom agents. Invoke both in one parallel batch only when evidence and structure are independent uncertainties. They return findings; they never edit files or run commands.

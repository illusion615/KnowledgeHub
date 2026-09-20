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

## Jev Playground Regression

Run `node --test tests/jev-playground.test.js tests/jev-live.test.js tests/jev-readiness.test.js tests/jev-local-provider.test.js` for the
playground under `posts/jev-system-one-research/`. Tests cover payload mapping,
optional provider confidence, threshold boundaries, response validation, origin
and CSRF checks, private-path protection, timeouts, concurrency, and safe errors.
They make no billable model calls. Local HTTP tests bind ephemeral loopback ports.
Two SDK transport tests use the actual installed SDK with intercepted HTTP; they
are explicitly skipped if the optional SDK cache is absent.

Start the optional backend with
`node scripts/jev-playground-server.js --port 8001 --prompt-key vercel` for hidden
key entry, or omit `--prompt-key` to use an existing environment variable.
It binds only to `127.0.0.1`. Gateway uses `AI_GATEWAY_API_KEY`, direct TypeSafe
uses `TYPESAFE_API_KEY`. `--check vercel` performs only a read-only authentication
probe with an existing key. Authentication checks do not run Jev or expose
balances, key fragments, raw errors, or account IDs; HTTP 401 and 403 stay distinct.
Restart an old backend process to load updated adapters and diagnostic routes. The SDK is loaded from
`$HOME/.cache/study-room/jev-sdk` or `JEV_SDK_DIR`, never from a repository build.
Install compatible runtime packages there using npm: `ai@7.0.107`,
`@ai-sdk/gateway@4.0.87`, and `zod@3.25.76`. Older mirrors may not have the
required evaluation feature. Keep keys out of source files and browser settings.

Browser checks must cover cloud-route transmission consent (retained per route
until reload, revocable, not shared across routes), status with missing
keys, live success/failure, stale-result rejection after input/provider changes,
cancellation, import provenance, downloads, language switches, and HTML-like
strings remaining plain text. Teaching fixtures and intercepted transport tests
are not real-model benchmark results. Successful authenticated cloud inference needs
a separately supplied server-side key and must not be claimed from these tests.
Local MLX inference uses separate owner-only connection tokens and no cloud key.

### Visible Output Browser Regression

With Playwright available (it can remain in an external tool environment), run
`node tests/jev-output.browser.js` against a loopback website backend. Set
`JEV_TEST_BASE_URL` to change the default `http://127.0.0.1:8000`, and optionally
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an installed Chromium binary.

The default test intercepts API responses with clearly scoped test fixtures. It
checks the always-visible output panel, run states, result JSON, policy separation,
late-response rejection, cancellation, and demo/import provenance. It does not
prove real inference. Add `--live` only with both local NanoJev services running:
it makes four real local calls across Chinese/English desktop/mobile, compares the
visible JSON to actual responses, and checks mobile result visibility and section
widths. It never selects a cloud route for inference. `JEV_SCREENSHOT_DIR` can
point to an existing external directory for screenshots.

## NanoJev MLX Artifact Audit

Run `python3 -m unittest discover -s tests -p test_nanojev_mlx_audit.py -v` to
check the audit utility using tiny temporary fixtures. No ML packages, weights,
network requests, or GPU are used by these tests.

`python3 scripts/audit-nanojev-mlx.py --model-dir <directory>` compares a local
package with the pinned public inventory and checks safetensors byte ranges.
It does not load the model or change its files. Its optional `--output` creates
a new JSON outside the model directory and refuses overwrites. A successful
integrity result is not an inference-readiness result.

## Native NanoJev MLX Runtime

See `scripts/nanojev_mlx/README.md` for isolated installation, service startup,
security boundaries, and real numerical validation. The original FP32 and
4-bit weights are reused unchanged; the oMLX app is not patched.

```bash
# Pure contract / audit / HTTP tests; MLX graph checks skip if MLX is absent
python3 -m unittest discover -s tests -p 'test_nanojev_mlx*.py' -v

# Include tiny MLX graph tests in the installed isolated environment
"$HOME/.cache/study-room/nanojev-mlx/bin/python" \
  -m unittest discover -s tests -p 'test_nanojev_mlx*.py' -v
```

Fake HTTP engines and tiny generated models test software behavior, not model
quality. `scripts/validate-nanojev-mlx.py` separately runs real downloaded weights
against the pinned, unchanged upstream PyTorch `DecisionModel`. The checked-in
record includes source/implementation hashes and a fixture hash. Same-weight
parity is distinct from quantization loss and domain accuracy: 4-bit versus
original FP32 changed 3/12 argmax results in this small fixture.

Browser checks for local providers additionally cover: automatic FP32 preference
when ready, click-to-run without a local checkbox and without automatic inference,
both real weight profiles, Boolean
mapping, null confidence, no cloud-price estimate, input-limit failures without
fallback, request/receipt downloads, and bilingual desktop/mobile layouts. A
static deployment has no model service; do not fabricate readiness there.

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

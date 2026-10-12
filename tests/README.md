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

## Structured Decision Article Narrative

The article begins with community developments (including Laya), abstracts the
category and its potential value, compares Jev/NanoJev/Laya, then presents three
contiguous model deep-dive groups before shared applications and experiments.
Legacy section/tool anchors are preserved; the navigation, chapter labels,
presentation order and `agent-brief.json` must stay aligned. Reading mode now uses
50 ordinary, always-visible narrative blocks (no toggle buttons or accordion
behavior). Only seven explicit reproduction/inventory/diagnostic/skill extensions
remain collapsed, plus the unchanged interactive Playground disclosures.
`reading.css` is article-local; explicit presentation steps decouple slide
pagination from reading visibility. Verify that opening extras, changing language,
resizing, and returning from presentation never hide the main narrative.

Chapter 1 uses an always-visible horizontal timeline, with calendar-day spacing
and contained scrolling on phones. `examples/model-release-timeline.json` records
Jev's announcement, NanoJev repository creation, Laya's first PyPI 0.1.0 upload
(2026-09-18), and the independent Laya-MLX package release (2026-09-19). Keep event
types and UTC/date precision explicit; review dates are not publication dates.
`tests/jev-release-timeline.test.js` checks dates, offsets, citations and scope.

The opening also distinguishes HN discussion from Gateway trial adoption.
`examples/demand/observations.json` contains public story metadata, comment IDs and
creation timestamps, plus exhaustive query receipts (not comment text or account
names). Eight-date windows align Jev with five illustrative generative launches: Qwen3,
GPT-OSS, DeepSeek-R1, GPT-6 Astra and Claude Opus 5, spanning open/closed weights.
Versions and dates are explicit. The newer GPT-6 Sol/Luna and Opus 5.5 lack full
windows and are excluded, not zero-filled. These are not whole-brand/all-web
counts or a representative LLM sample. Comments
are counted in-window, never reconstructed from current point scores. Reposts,
index coverage, calendar-date exposure, year/platform changes and selection bias
remain explicit. The Vercel image is attributed and unmodified, not digitized.
Paid Gateway teams are not necessarily paying for Jev; free promotion and missing
retention/denominator data prevent a claim of proven long-term demand.

```bash
node scripts/jev-demand-evidence.js  # offline: regenerate summary + two SVGs from the snapshot
node --test tests/jev-demand-evidence.test.js
```

Index associations can reflect thread merging: seven GPT-6 comments and one Opus 5
comment predate their current parent timestamp; preserve their own dates and
report the anomaly, rather than silently dropping them. The comparison table
also reports D4–D7 shares, not user retention.

Preserve negative evidence (GPT-6, Opus 5, R1 and GPT-OSS have more comments;
R1 also rises later; many Jev threads have none)
and the difference between enthusiasm, trial, retention, payment and net ROI.
Only the raw daily table/query-method detail is collapsed; all three charts and
their limitations are visible in the main narrative.

`examples/structured-decision-market-evidence.json` records adjacent observations
from AI Index 2025 and Anthropic's September 2025 Economic Index. Keep survey
organizations, sampled API prompt-response records and historical cost trends
separate. These are not this category's market size, adoption share, task success
rate or proof of hybrid ROI. Never relabel their dates as the current review date.

```bash
node --test tests/jev-article-structure.test.js
node tests/jev-laya-research.browser.js  # also scans new chapter order, market/comparison tables and full decks
node tests/verify-change.js --article jev-system-one-research --level L2
```

## Laya Research Chapter

`#laya` adds five bilingual reading/presentation substeps comparing the distinct
English, multilingual and task-tuned checkpoints. References 52–55 pin the
upstream, independent Chinese lab and MLX port. The public numerical evidence is
`posts/jev-system-one-research/examples/laya-research-evidence.json`; it contains
only numeric observations, not ticket texts, credentials or private receipts.

```bash
node --test tests/jev-laya-research.test.js
node tests/jev-laya-research.browser.js  # zh/en, light/dark, mobile, full deck walk; no inference
node tests/verify-change.js --article jev-system-one-research --level L2
# Optional offline regeneration from the two public files linked in the evidence:
node scripts/jev-laya-evidence.js bench-jev.json bench-laya.json > /tmp/laya-evidence.json
```

The generator checks both pinned SHA-256 digests and case alignment before
publishing. Tests recompute 31/40 vs 23/40, timings and the post-hoc threshold
replay. They verify publication consistency, not independent model performance.
Preserve base-vs-fine-tuned differences, unmatched external Jev baselines,
small-sample single-label limitations, network/loading timing scopes, and MLX
parity-vs-task-accuracy distinctions. The September 22 research snapshot remains
historical. Separate September 23 local integration is documented below; do not
rewrite the original snapshot's zero-inference/undeployed fields.

## Tank-Arena Practice Chapter

The article's `#arena-practices` chapter has seven bilingual reading/presentation
substeps and a public aggregate in
`posts/jev-system-one-research/examples/tank-arena-practice-evidence.json`.
The research brief points to the same chapter. Preserve the v6 denominators,
search-only ablation, negative model contribution, v7/cloud verification limits,
and distinction between implemented coordination and future work. Do not publish
private raw receipts or present summary consistency as independent model attestation.

```bash
node tests/verify-change.js --article jev-system-one-research --level L2
node --test tests/jev-arena-practices.test.js
node tests/jev-arena-practices.browser.js  # article/links/zh-en/light-dark/mobile, no inference
```

## Supervised Arena Research Cycles

`tests/experiments/jev-arena-research-cycle-20260923.md` documents the first
preregistered development → review → holdout → bounded local shadow cycle.
Runner: `scripts/jev-arena-research.js`; aggregate exporter:
`scripts/jev-arena-research-report.js`. The plan fixes seed splits, source hashes,
limits and model-call budgets. Every phase needs a fresh output directory;
`--consent-local` is required for model probes. Never stop a user's active match,
retry model failures, tune on an inspected holdout, or silently promote defaults.
The first cycle retains v3 looping/search-cost regressions and a fixed-readout
call-skipping certificate, not a claim of optimal combat strategy.
Follow-up checkpoint-specific cycles are documented in
`tests/experiments/jev-arena-local-optimization-20260923.md`: 56 actual model
episodes, rejected candidates, build-scoped caching, append-only user-interruption
continuation, and a tied final confirmation. The scripts
`jev-arena-local-optimization.js`, `jev-arena-local-continuation.js` and
`jev-arena-local-confirmation.js` require private fresh output, fixed hashes,
explicit consent and idle admission; they never interrupt the user's match.

```bash
node --test tests/jev-arena-research.test.js tests/jev-arena-search-cache.test.js tests/jev-arena-local-optimization.test.js
```

## Persistent Intent v4 and Track Rendering

`tests/experiments/jev-persistent-intent-20260924.md` documents persistent goals,
route approvals, per-step guard checks, zero-model continuations, mixed fixed
orders, measured progress, compact token-budget contracts and separate hull/turret
rendering. Historical v3 experiments are not relabeled as v4 quality evidence.

```bash
node --test tests/jev-arena-intent.test.js tests/jev-arena-intent-manager.test.js tests/jev-arena-progress.test.js tests/jev-arena-hull.test.js
node tests/jev-arena-intent.browser.js
node tests/jev-arena-hull.browser.js
```

These tests use fixtures. The real smoke helper `scripts/jev-intent-live-validation.js`
requires `--consent-local` and a fresh private output, caps attempts, checks idle
admission, and never calls cloud models or retries a failed input unchanged.

## Symmetric Health Exchange v5

`tests/experiments/jev-health-exchange-20260924.md` defines side-relative HP/shield
payoff, favorable mutual loss, finite opponent-response aggregation, side-swap
mapping, progress guards and distinct model adapters. It is application scoring,
not a solved Nash equilibrium or a correctness label.

```bash
node --test tests/jev-arena-exchange.test.js tests/jev-arena-exchange-provider.test.js
```

The live helper `scripts/jev-exchange-live-validation.js` needs explicit local
consent and fresh private output; it caps the run at eight fixed-state calls,
checks idle admission and stops without retry or cloud fallback.

## Curated Core Presentation

The Jev article now has a deliberate 22-page browser presentation (cover + 18
core topics + two dedicated live demo pages + closing), not 103 source-fragment pages. `presentation-outline.js`
is the bilingual editorial source; reading text/controls remain intact.

```bash
node --test tests/jev-curated-deck.test.js
node tests/jev-curated-deck.browser.js
```

See `tests/experiments/jev-presentation-curation-20260926.md` for the full page
plan, verified reading restoration and export-font limitation: PPTX files were
rendered but the Chinese LibreOffice PDF loses CJK text. Do not claim export
visual acceptance based on file generation alone. Browser screenshots passed.

## Vendor-Neutral Enterprise Adoption

The former evaluation and assistant-summary chapters are merged under
`#evaluation`; `#agent-brief` remains a nested ADR deliverables anchor. The main
chapter covers category-level business value, enterprise integration, deployment,
data governance, operations/owners, validation, cost and staged rollout rather
than assuming one provider. See `tests/experiments/jev-enterprise-adoption-20260924.md`.

```bash
node --test tests/jev-enterprise-adoption.test.js
node tests/jev-enterprise-adoption.browser.js
```

## Scenario Cards and Read-Only Plan Dialogs

`tests/experiments/jev-scenario-cards-20260924.md` documents the three-card
`#architectures` picker. Modal content comes from canonical popup-only
workflow/agent/RAG sources, with copied IDs and slide markers removed. No-JS hash
links reveal source content; opening a card never invokes a model. Tank/support
practice notes now use the same dialog from cards below each demo. The old
Alternatives chapter is removed; model-specific setup/inspection lives in the
model chapters. See `tests/experiments/jev-two-demo-layout-20260924.md`.

```bash
node --test tests/jev-scenarios.test.js
node tests/jev-scenarios.browser.js
node tests/jev-two-demos-layout.browser.js
node tests/jev-arena-practices.browser.js
```

## Grouped Model Chapters

The Jev article has one top-level header entry per model. Contract/evidence/access/
limits are children of Jev; reference integration/local MLX are children of
NanoJev. Legacy hashes and visible prose remain. Verification details:
`tests/experiments/jev-model-chapters-20260924.md`.

```bash
node --test tests/jev-article-structure.test.js tests/jev-laya-research.test.js
node tests/jev-model-chapters.browser.js
node tests/jev-laya-research.browser.js
```

The latter browser test walks the complete bilingual presentation and checks
reading-state restoration and JS-disabled visibility, without model inference.

## Shared Local Model Catalog and Laya Workers

`model-registry.js` is the common basic/support/arena catalog. The Node gateway
supports NanoJev FP32/4-bit and Laya multilingual/typed-decisions via separate local
workers. Setup: `scripts/laya-service/README.md`. Model switches invalidate earlier
results; no automatic fallback or inference on selection. Laya now supports
opponent-rollout planner ranking; only unadapted legacy utility-attack/tactics are
rejected. All input truncation is rejected. Normal UI defaults to planner/v7 and
offers raw input as its only input ablation, plus a zero-model search-only side.
Legacy browser regressions explicitly inject removed options in fixture pages;
this is compatibility coverage, not a production menu. All managed local models now share one GPU FIFO lane; concurrency tests
that require independent resources use injected native/cloud pairs instead.

```bash
python3 -m unittest discover -s tests -p 'test_laya_service.py'
node --test tests/jev-laya-provider.test.js tests/jev-laya-planner.test.js
node --test tests/jev-arena-tactical-wait.test.js tests/jev-arena-routes.test.js
node tests/jev-model-switch.browser.js
```

The Python/unit/browser suites above use fixtures, not new model-quality evidence.
`examples/laya-runtime-validation.json` separately reports six real local requests
(three request shapes per checkpoint), no retries/warmup/cloud inference. It is a
contract/readiness check, not an accuracy or latency-percentile benchmark. Local
transport cancellation cannot preempt a submitted GPU forward; the gateway lane
stays held until transport completion/ceiling. Other oMLX clients are not governed
by this per-process scheduler. Do not modify oMLX or downloaded model files.

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

### After-Sales Theater: NanoJev + LLM versus LLM Only

The article's `#jev-benchmark` is now a bounded, side-by-side after-sales chat
simulation, not the former classifier-versus-LLM scalar table. `support-core.js`
generates deterministic synthetic customers/orders and defines observable facts,
policy/workflow contracts, response validation, structured checks and token math.
`scripts/jev-support.js` runs server-owned paired conversations; `benchmark.js`
displays actual returned replies, stages, latency and usage in two chat rooms.
Settings, approval, Start/Stop and downloads are inside the theater.

**v5 (`after-sales-v5-quality-review`)**: explicit handoff/safe workflow continuation
→ one batched Native request → independent intent/order branches → application
processing for confirmed needs, internal LLM review for model uncertainty. Multiple issues are no longer an early
LLM/human bypass. Missing orders also do not suppress native recognition of the
underlying needs. Four known intents are evaluated for each mentioned order and
an unbound slot, plus an uncovered-needs question: at most **13 Boolean heads in
one request** for two orders. Question text names the candidate association; order
IDs/ledger facts come only from customer-visible context, never script gold.

Scores are independent: >=0.8 supported, <=0.2 absent, middle uncertain. These
are **uncalibrated per-question experimental gates**, not a cross-label softmax,
single argmax, multiplication, top-two margin or guarantee of correctness. Several
intents/orders can be supported together. Confirmed branches continue even when
another binding is unknown. Model uncertainty is **not** missing customer information.
Unconfirmed topics and inferred ambiguous bindings trigger explicit internal LLM
review with the original conversation and known order facts. Confirmed branches are
locked and may not be changed or omitted; new decisions are credited to the reviewer,
not NanoJev. Raw native scores/plan and native-only structured checks remain in receipts.
Actual missing order/ledger facts can still receive a focused application question.
Entirely uncertain output never becomes the generic customer-facing clarification
that v4 emitted. Review latency/tokens count in full and reviewed turns are not fast paths.
More than two order IDs is explicitly out of scope, never silently truncated.

Per-case memory retains branch bindings, not a single intent; unresolved or changed
bindings cannot be reused as confirmed. Each branch gets its own current order facts
and policy check. A unique requested single-order slot can be filled from the next
canonical order-number reply; multiple/unresolved bindings are not guessed. Templates
give customer-facing next steps using known facts; diagnostics are expandable separately.
Explanation requests run Native recognition first: confirmed plans use a reply-only
verbalizer; uncertain plans use the review contract, avoiding two sequential LLM calls. `routing_mode:
rules_llm` disables Native for ablation. Transport/schema failures still stop with
no repair or retry. **Protocol support is not proven checkpoint accuracy**: five
real local FP32 development probes produced no scores above the positive gate.
See `experiments/jev-support-multi-intent.md`; thresholds were not lowered to make
those results appear successful.

The baseline now returns `{reply, branches:[{intent, order_id, action}]}`, not one
other/human_review answer for all multi-intent requests. It shares the selected
LLM, style/length limits and real streaming transport. Its complete policy is not
padded. Hybrid explanation calls return only `{reply}` and retain upstream branch
ownership. The streaming parser checks bounded branch arrays without emitting them
as customer text. Review calls use the multi-branch contract with locked-branch validation.
Screenshot regression fixtures cover all-uncertain scores plus an already supplied order,
real draft delivery, no generic repeated-information request, provenance, usage and memory.
These injected outputs verify workflow, not real checkpoint/LLM quality. CLI sessions
remain fresh. Do not relabel v1/v2/v3/v4 records as v5.

`evaluateStreamTask` uses `--stream on` and consumes actual root
`assistant.message_delta.data.deltaContent`. A bounded incremental parser forwards
only the root JSON reply string, handles split escapes/Unicode, ignores reasoning
and subagents, and rejects tools, duplicate/unknown keys and mismatched messages.
The final message/result/parser checks remain required. SSE publishes real drafts
before process completion; failed/cancelled drafts remain visibly rejected, never
promoted into valid answers. If the CLI provides no reply deltas, the record says
completion-only—no simulated after-the-fact typing. Both sides get the same path.
Drafts are not permission to perform business operations; this remains synthetic.

First-content P50/P95 measure backend emissions (including unvalidated LLM prefixes),
not browser paint, correctness or problem resolution. Complete-reply distributions,
fast-path counts, actual native/cloud attempts, rejected drafts, LLM-stage latency,
process/API timing and reported usage are separately audited. Unknown reasoning
usage is unknown, not zero; it is not double-added to total tokens.

A seed chooses 1–3 distinct scenario types (delivery, returns, billing, technical),
three customer turns each, sometimes including the order at first contact.
Follow-ups include handoff/explanation, two needs for one order, two different
orders, ambiguous order binding and explicit negation. These are generated templates,
not another LLM pretending to be a customer. Both transcripts are retained; only
full-decision LLM calls receive history, while hybrid explanation gets a resolved
branch brief. Future customer lines stay paired. Checks cover exact intent sets,
order binding sets and per-branch actions, including missing/extra intents and
bindings. Clarification counts are separate from resolution. Rule-only turns with
no classification have intent/binding matches null, not free semantic successes. Matching fields does not attest
prose quality, promises or helpfulness, which require human review. This small workload is not general
accuracy evidence. No architecture is assumed faster or more token-efficient.
Start a **new or intentionally restarted** loopback website backend on a free port:

```bash
node scripts/jev-playground-server.js --port 8002 --enable-copilot
# Open http://127.0.0.1:8002/posts/jev-system-one-research/#jev-benchmark
```

Testers install/sign in to their own GitHub Copilot CLI (`copilot login` in their
terminal), and start the selected NanoJev MLX service for native-routing mode.
The rules+LLM ablation does not use a native service. Standalone local experiments
remain available in the Playground and arena. CLI is disabled unless `--enable-copilot` is passed; optionally
set `JEV_COPILOT_BIN` to a trusted executable path **on the server**, never in a
browser request. Node.js 22+ is required. CLI must support JSONL output,
`--usage-output-file`, tool filtering and `--max-ai-credits` (contract checked with
1.0.83). The availability endpoint runs only CLI help. After connecting, the
page automatically refreshes a **model dropdown** using the CLI's headless stdio
`connect → auth.getStatus → models.list` protocol. The refresh icon beside the
Copilot selector refreshes connections/catalog, retaining the selected ID only
if still present. Initial selection
and vanished models require an explicit dropdown choice (no silent upgrade to a
more expensive model). No model IDs are hardcoded in the page.

Model discovery can contact GitHub authentication/catalog metadata, but never
creates a session or sends a prompt. The POST endpoint requires same origin,
CSRF and an empty body; it shares the concurrency/rate budget, has a 30-second
server deadline and bounds CLI output. Only model IDs/display names escape the
bridge—no login/account details or credentials. Disabled/unconfigured models are
filtered out. Missing login, network errors, empty catalogs and incompatible CLI
versions disable story Start instead of falling back to a stale/hardcoded list.
Discovery still publishes the same event consumed by the tank arena. A listed model does not guarantee quota or
successful inference.

- Same-origin/CSRF/Host checks, fixed arguments, validated model IDs (no `auto`),
  one shared experiment lock and 20 **external** requests/minute (including catalog refreshes).
  Both sides receive a turn together; each actual cloud call acquires one slot
  when it is needed. Fast paths are not held behind the baseline's cloud quota.
  The next customer turn waits for both. Per-side admission wait is included in
  end-to-end time and audited separately; summed waits are not additive wall time.
  Native calls and approved templates do not spend external-call admission. The story excludes concurrent
  arena/probe/Playground inference. Stage deadlines are 30/60/120 seconds, with a
  five-second viewer lease and 15-minute wall cap; Stop aborts pending stages.
- The CLI gets a fresh private temporary working directory and nonmatching tool
  allowlist, no shell interpolation, no custom repository instructions and no
  remote session export. **An empty `--available-tools=` enables all default tools
  in 1.0.83**; do not replace the nonmatching sentinel with an empty list.
- Authentication remains with the CLI; unrelated API keys and BYOK overrides are
  not passed to its child environment. No login files are copied/read by the
  adapter. Raw stdout/stderr, login errors and account details are never served.
  Temporary bridge files are removed; CLI-managed session history may remain in
  the user's CLI home. Global CLI configuration/plugins/hooks remain trusted local
  configuration: this bridge is not an OS sandbox. Use non-sensitive inputs.
- Cloud approval is explicit, cleared on setting changes and page-scoped. A story
  has at most 6 cloud reply requests and 3 native decisions per configured customer,
  up to 18 cloud / 9 native requests for three customers. Start is the only trigger;
  preview/randomization is inference-free. There are no retries or fallback answers. CLI-internal
  work/retries may consume additional tokens; session metrics include them. The
  30-AI-credit session limit is the CLI's minimum **soft** cap, not a hard spend
  guarantee; a response may exceed it. CLI subprocess groups are terminated on
  cancellation/deadline, but remote computation/charges cannot be rolled back.
- Intent/order detection uses the shared verified native/probe transport with
  independent Boolean questions, not Choice. Original `binary_gates` and question
  mappings are retained. Baseline LLM branch arrays are strictly validated for
  unique intent/order pairs, mentioned IDs, legal action keys and bounded length.
  Fast-path and explanation-only branch fields remain application/Native-owned.
  Both native request and actual LLM prompts are retained. Orders/future script
  facts are not revealed to a model before the customer supplies them.
- Total Token KPI = reported input + output across **every dispatched stage**,
  including failures/cancellation. Hybrid includes native repeated candidate paths
  and LLM tokens; LLM-only includes its complete CLI sessions. Native/LLM subtotals
  remain separate. Missing usage makes totals unknown, not zero; cache/reasoning
  counts are not added again. This is a cross-tokenizer resource proxy, not dollars.
  Time means cover valid returned replies (not necessarily correct replies) and
  include the whole backend chain and side admission wait; failed stage times
  remain in receipts. Story pacing and browser/network rendering are not included.
  Reduction percentages appear only for completed paired stories, and differing
  structured checks explicitly prevent a claim of equal-quality savings.
- Legacy `/api/jev/benchmark/evaluate` remains for older scalar integrations and
  tests, but is no longer the chat UI's execution path. New endpoints are
  `/api/jev/support/start`, `/state`, `/stop`, plus authenticated POST `/events`
  (SSE). A separate client heartbeat renews the viewer lease; an open stream alone
  does not keep abandoned work alive. Snapshot/delta sequence numbers prevent
  stale heartbeats overwriting newer text. Backpressure and subscribers are bounded.
  `benchmark/status` advertises
  `support_version`. A stale backend cannot silently run an incompatible story.
- Receipts retain reported usage on invalid CLI answers and nonzero exits. The
  theater exposes token/model usage, not dollar or premium-request KPI cards.
  The shared CLI adapter also supports API-time/credit fields for legacy routes;
  dollars are never derived from credits or list pricing. Counts cover complete
  CLI sessions, not just prompt characters or the final customer reply.
- Tokenizers/scopes differ: NanoJev repeats candidate prefixes, Copilot includes
  agent-system overhead. Cached token counts are not added to input counts.
  Observed end-to-end time differences are environment-specific, not
  hardware-independent model speedups or proof of equal-quality savings.

Verification (all fixture-only; no paid calls or real GPU inference):

```bash
node --test tests/jev-*.test.js
# Opt in to the installed CLI protocol test with isolated HOME and a loopback
# OpenAI fixture. No GitHub auth or cloud inference. Default unit runs skip it.
JEV_TEST_COPILOT=1 node --test tests/jev-copilot-cli.test.js
# Playwright may live in an external NODE_PATH; creates its own mock backend.
node tests/jev-benchmark.browser.js
node --test tests/jev-support.test.js tests/jev-reply-stream.test.js
# Optional offline tokenization only (does not load weights or run inference):
JEV_TEST_TOKENIZER=1 node --test tests/jev-support.test.js
```

Support fixtures verify deterministic paired scripts, stage order, faster-side
visibility, no next-turn launch before both finish, same requested LLM, separate
histories, wrong-route preservation, strict output contracts, complete/unknown/
failed/cancelled usage, no cache double counting, approval, stop/lease cancellation,
mutual exclusion, actual prompt/receipt export and responsive two-column chats.
The tokenizer test checks 720 generated native inputs without loading weights;
the current v4 maximum observed path/request is 201/2562 tokens.
The optional installed-CLI test holds a loopback mock response open until a real
CLI delta reaches the callback: post-completion playback cannot pass it. It uses
an isolated HOME, no GitHub login and no paid inference. Mock timing/token results
are not evidence of real architecture speed or cost savings.

`JEV_TEST_COPILOT_CACHE` optionally points to the installed CLI package cache for
that isolated-HOME test (default macOS `~/Library/Caches/copilot`); it is a code
cache, not a credential/configuration directory. The test verifies the actual CLI
sends **no tools** to the loopback fixture and its usage file parses correctly.
The old scalar comparison UI is replaced, while its endpoint remains compatible.
The new theater puts settings/approval in an in-room floating panel, Start/Stop in
its toolbar (or panel footer), and two independently scrolling chat logs side by
side. Stage indicators reflect real pending work. Application templates are labeled,
while actual provider reply deltas appear as drafts before final validation;
there is no prerecorded model answer or after-completion typing animation. No model call is
needed to change a seed or preview the story. Structured mismatches retain the
original route/reply and are labeled separately from provider errors. Numeric
exports retain original values. Network loss produces an explicitly unconfirmed,
partial snapshot rather than fabricating settled usage; the server viewer lease
terminates abandoned work. Tests are fixtures, not real cloud availability or
business-quality evidence; those require an explicitly approved real run.

### Live Tank Arena

`#jev-arena` uses the same loopback backend (`--enable-copilot` for CLI teams).
`arena-core.js` is the deterministic game/choice contract shared by browser and
server; `scripts/jev-arena.js` owns the authoritative match and `arena.js` only
renders/polls it. Each side independently selects either local model or any
CLI-discovered model, including same-model matches. Each team's KPIs sit above
its side of the map. No request starts until the user clicks Start; a separate
arena checkbox grants repeated cloud calls with the visible per-match count.

- Seeded 13×9 rotationally symmetric maps have obstacles and paired repair,
  shield and power rewards. Spawns, rewards and flank waypoints must be connected.
  Two tanks per side, 100 HP each. Movement: one tile/0.8s; shots: one/1.2s,
  range six on cardinal lines, walls block, no friendly fire. Normal damage 12;
  power raises it to 20 for six simulation seconds. Shield absorbs 30 damage;
  repair restores up to 30 HP. Damage resolves simultaneously. Elimination wins;
  time limit uses surviving tanks, then HP; ties draw.
- **Default UI: `tank-v5-step` (action-level).** One returned order attempts
  exactly one move or one shot, including a failed attempt. It is then consumed;
  only a new model decision can issue another attempt. There is no voluntary wait
  option, automatic route repair or target switching. Physics cadence/cooldown
  still applies, and no replacement request is made until both living tanks on
  that side have consumed their orders. Real-time sides request independently,
  so a faster model is not gated by the slower model. **The UI has no decision
  count cap.** It requests until elimination, selected duration, or Stop. Old
  explicitly capped API experiments can still end with `decision_budget`; those
  are not the current UI defaults. Provider errors still stop the whole match
  without retry or a fabricated winner.
- **Legacy comparison: `tank-v4-active` (persistent forced action).** The model has no `wait` or
  `hold` option: only four absolute movement directions and fire attempts at
  living enemies. Unlike v3, walls and firing geometry are NOT prefiltered;
  judging feasibility is part of the model task. `move_up/down/left/right`
  repeats until replaced, with no BFS or hidden detours. `fire_ID` repeatedly
  attempts that target only, with no pursuit/target substitution or auto-fire
  while moving. Invalid moves/trigger pulls stay invalid, not corrected by
  software. A failed firing attempt consumes its 1.2s opportunity rather than
  retrying each simulation tick. Rewards are pickups, not orders.
  The internal initial state `awaiting_order` is not a model-selectable action;
  no program-generated action hides the cost before the first model reply.
- Execution KPIs separate moves/attempts (0.8s opportunities), hits/shots,
  ineffective trigger pulls and wall-clock delay until the first installed
  order. First-order delay includes the sync barrier when applicable. Counts
  are not a claimed semantic accuracy score, and repeated execution of an
  order does not cause additional model calls. Bad choices can still result in
  no displacement or no shot; that is measured failure, not voluntary waiting.
- **Strategic comparison: `tank-v2`.** Models choose one enumerated order: hold,
  retreat, flank north/south, support, pursue/focus an enemy, or a remaining
  reward. `tank-v2` filters already-satisfied movement choices (spawn retreat,
  nearby support, reached waypoint) but retains explicit `hold`; it never changes
  a model's stationary decision into an attack. Identical BFS/auto-aim/fire executes
  these orders. Allied contenders for an empty next tile alternate unit priority,
  instead of freezing forever. If distant tanks prevent finding an entirely clear
  path, the controller may approach along a wall-only route, but never enters an
  occupied next tile. Movement counters and reasons distinguish actual displacement,
  holding, already-at-target, yielding, blocked routes and combat. Do **not** describe
  shortest-path search or aiming as model-generated reasoning. No model ever
  gets the other side's unexecuted orders. Paired rounds carry the exact same
  public observation string, with side-specific tank question IDs. Independent
  step mode uses the same observable facts/rules but may sample different times.
- Sync step mode freezes paired snapshots while both models respond, applies both
  plans, then waits for both action sets to finish before the next paired request.
  Real-time step mode samples fresh state at each side's dispatch after its action
  set completes. It starts without an order and does not replay consumed commands.
  Old v2/v4 modes retain persistent commands, paired cadence and alternating
  first priority for a shared MLX service. At most one job is outstanding per side.
  Shared local-service calls use a FIFO resource queue in step real-time mode;
  its input is captured only at actual dispatch. Queue time stays in total latency
  but is separate from provider time and snapshot age. Shared GPU/account/network and fresh CLI startup
  remain confounds. State age ≥1s is counted as stale. Outcomes are task
  performance, **not accuracy** or hardware-independent speed comparisons.
- Start accepts 30/60/90 simulation seconds or `duration_s:null` for no time cap.
  The UI sends `max_decisions:null` (no total call cap); omitting it also means
  unlimited. Explicit 1–10 caps remain supported only for legacy/bounded API
  experiments. Two allowlisted routes, validated controls, and explicit consent
  remain required. Omitting `control` retains old strategic behavior. Continuous
  legacy controls replan every 50 ticks (10 simulation seconds), not a cadence
  computed by dividing an infinite duration/budget.
- Continuous **Copilot** requests acquire the shared **20 external calls/minute**
  allowance at dispatch. Local NanoJev and the rule baseline bypass this budget. At capacity, unstarted jobs show `rate_wait` and
  resume after a slot opens, without a model retry or an invented result. Sync
  keeps paired inputs frozen; realtime captures fresh input after admission.
  A queued job has no inference deadline until dispatch, and Stop discards it
  without calling a model. Explicit legacy caps still limit planned experiments,
  but only their cloud calls reserve rate admission. Other experiments remain locked out while a match is active.
- CLI consent warns about **uncapped total calls and ongoing quota consumption**;
  an unlimited duration continues until Stop, elimination, a failure, or loss of
  the viewer lease. CLI's 30-credit process cap remains soft, not a dollar bound.
  Per-call deadlines remain selectable (UI default 120s; omitted API field 30s).
  Actual provider failures still stop without automatic retry/fallback.
- `POST /api/jev/arena/{start,state,stop,replay}` requires Host, Origin and CSRF.
  State/stop/replay accept only the opaque match ID. Polling renews a five-second
  viewer lease; missing heartbeats, hidden/unloaded pages and Stop abort pending
  requests. A stopped match cannot apply late answers, and another match cannot
  start while its requests are cleaning up. There is no total wall-time cutoff
  for continuous/unlimited sessions; per-call deadlines and the viewer lease
  remain enforced. Remote work/charges cannot be undone by cancellation.
- The per-side option panels update only from returned decisions, with round and
  source-snapshot time. NanoJev exposes original candidate probabilities (not
  calibrated confidence of correctness); Copilot is asked for **self-reported
  0–100 preference scores**, not token probabilities. These need not sum to 100
  and cannot be compared directly with NanoJev probabilities. The selected action
  must be among the highest self-scores; provided scores require exact candidate
  keys and finite values within bounds. Valid replies without scores remain valid
  decisions with missing scores—never fabricated one-hot certainty. Requesting
  self-scores adds CLI output tokens/latency. `decision_protocol` records this
  changed workload; old receipts cannot have missing scores reconstructed.
- Replay contains simulation frames and every decision's shared snapshot, selected
  choices, application status, latency, state age, known model/weight identity and
  allowlisted usage. Unknown usage stays unknown. CLI raw stdout/errors, connection
  files and credentials are never returned. Page history retains ten manually
  started matches, including stopped/unscored attempts, and exports a match set;
  it is memory-only and clears on reload. Swap models on the same seed, then vary
  seeds; there is deliberately no auto-start next match or unattended cloud loop.

```bash
node --test tests/jev-arena.test.js
# Isolated mock provider, actual HTTP/UI, no real cloud or GPU calls:
node tests/jev-arena.browser.js
# Also covers the arena task with the installed CLI and loopback mock model:
JEV_TEST_COPILOT=1 node --test tests/jev-copilot-cli.test.js
```

Core tests cover 100 seeded maps, symmetry/connectivity, equal information,
strict orders, explicit stationary decisions, redundant-action filtering, the
`tank-2026` traffic-jam regression, actual displacement (not just symmetry),
no wall/occupancy penetration across 40 traffic seeds, rewards, collision/shot
rules, simultaneous damage, sync vs real
time, stale/late responses, same-service queues, caps, lease expiry, safe failures,
and HTTP authorization. Browser tests cover per-side KPI placement, consent,
model swapping, modes, stop/hidden-tab cancellation, replay, multi-match history,
errors and Chinese/English mobile layout. Primitive tests additionally prove
that `wait` is rejected, no actions are fabricated before the first order,
movement does not auto-fire or detour, only the named target is fired at, and
blocked moves/ineffective shots are counted at the correct cadence. Initial
latency tests distinguish real-time installation from the sync barrier.
Score tests cover native-vs-self-report provenance, missing scores, invalid ranges,
partial candidates, incoherent scores, record binding and live panel updates.
For the task protocols, offline tokenizer checks covered 480 seeded
stress cases across all three modes, with four projectiles, named buff/health fields,
concrete action coordinates and all four latest execution feedback entries:
at most 508 tokens/path and 8,852 total path tokens in these cases, below the
512/16,384 limits. Runtime guards still reject oversized inputs without truncation. The v4 catalog contains all movement and
living-target fire attempts, without a voluntary wait option.
These are software/tokenization checks, **not evidence of real model game skill**.
No real cloud/GPU match is initiated by default verification. Preserve rule
versions in exported comparisons: `tank-v1` allowed redundant stationary orders
and could deadlock allied traffic; its receipts must not be silently relabeled
as `tank-v2` results. Likewise, v3's optional wait and legality masks must not
be relabeled as v4 forced-action results.

### Explicit Task Input (`tank-explicit-task-v2`)

`arena-task.js` is the single task-text formatter shared by both providers and
by the input inspector. It contains GOAL, STRATEGY, ELEMENTS, RULES, STATE,
LAST EXECUTION and OUTPUT sections. Identity questions explicitly name the
controlled tank, its ally and enemies; primitive candidates name their concrete
source/destination or target coordinates. Tank rows use named HP, shield, boost
and reload values rather than anonymous tuple columns. Coordinate origin, map
symbols, units, movement/firing conditions and pickup effects are defined.
Remaining simulation time and the legacy nominal minimum decision gap are
included. Step mode uses `tank-step-task-v1`, explicitly describing ONE attempt
and replanning after completion instead of persistent movement/firing. Legacy
v2/v4 inputs keep `tank-explicit-task-v2` for meaningful historical comparison.

The world records each tank's latest **actually executed attempt** separately
from VFX. Accepting/queuing a new order does not change this feedback. Results
include moved, wall/tank blocked, yielded, fired, too far, diagonal, blocked shot
or missing target. `fired` means a projectile was emitted, **not** that it hit.
The compact model text carries the latest action/outcome; exact feedback ticks
remain in recorded game states. All four tanks' feedback appears in the common
observation. At a given tick both sides have the same public facts; paired
snapshots are identical, while independent requests can be made at different ticks. There is no best-action label, can-fire
flag, legality mask or automatically repaired decision. Combat rules are unchanged.

NanoJev retains the upstream State / Question / Candidate / Decision framing,
separate segment tokenization and terminal EOS. It scores native Choice paths;
it is not asked to generate JSON or self-scores. Copilot receives the identical
common task in readable text, then its tank questions/candidates and an explicit
JSON output contract (`orders`, numeric `self_scores`). The app's exact CLI task
text is retained, but CLI-added system context is not claimed or exposed.

The expandable input inspector shows preview (not sent), frozen in-flight input,
or the latest recorded input. A step request waiting for a shared local service
is labeled queued/not yet captured; it must not masquerade as a frozen input. Native paths can be inspected by tank and
candidate; Copilot shows the submitted application text. Inspecting never runs
a model. Receipts include `task_prompt_version`, and the match's
`decision_protocol` versions this input change separately from physics versions.
Old prompts/scores must not be rewritten as if they used this protocol. Software
checks do not establish improved model accuracy; compare fixed situations and
held-out maps before making that claim.

```bash
node --test tests/jev-arena-task.test.js
# Optional, offline tokenization only; no weights, GPU inference or cloud calls.
JEV_TEST_TOKENIZER=1 node --test tests/jev-arena-task.test.js
```

The optional test uses the existing external Python environment and downloaded
FP32 tokenizer with `local_files_only=True`. `JEV_NANOJEV_PYTHON` can select the
Python executable. It does not install dependencies or change the model's limits.
Tests cover complete task sections, identities, unmasked infeasible candidates,
actual vs pending feedback, equal observations, exact serialization, versioned
in-flight records, inspector behavior and path/total-token bounds.

### Disclosed Rule Attack Baseline (Not a Model)

The arena selector additionally offers **Rule Attack Baseline · Not a Model**.
It is step-only and consumes the same public captured snapshot, never opponent
pending orders or model probabilities. It first selects a geometrically valid
shot (kill, HP damage, shield damage, lower target HP), otherwise a legal move
minimizing BFS steps to any valid firing cell. Other tanks are frozen for this
calculation; it is not a prediction of their motion. Allies reserve distinct
next cells when possible. Recent visits only break equal-route ties, and failed
moves are deprioritized. The baseline is not an optimal planner and can still
get stuck on some maps.

This controller is **separate from model providers**, not a mask, fallback,
reranker or repair of NanoJev/Copilot output. Native plans still execute unchanged.
Every baseline row has `decision_source: rule_attack_baseline`, a versioned
`reported_model` naming the rule implementation, and an allowlisted `policy_audit`.
No probabilities/self-scores are fabricated. The UI displays rule evaluations,
not model calls, and the input inspector shows the public snapshot actually read.
Baseline-v-model wins mix policy and latency effects, not model accuracy.

Rule evaluations make no native/cloud calls and consume no model/discovery RPM
allowance. They still obey physical cadence, one attempt per order, manual stop,
viewer lease, retention and all combat rules. They work even without installed
models. Legacy explicitly capped API matches reserve only their model sides.

Diagnostics now report `no_attack_attempts`, `clear_shot_not_selected` and
`attack_route_distance_increased`. The last two are **post-hoc** geometry/BFS
observations, not extra model input or optimal-action labels; cooldown, future
motion and defensive reasons must still be considered. A lack of collision
failures no longer produces a misleadingly empty report for a non-attacking run.

```bash
node --test tests/jev-arena-attack.test.js
node tests/jev-arena-attack.browser.js
```

These tests exercise the rule controller and real physics only, not model skill.
The browser test runs with both model services marked unavailable. Results of
real local-model experiments and the disclosed mixed trial are documented in
`tests/experiments/jev-arena-attack-20260920.md`. Experimental `combat` and
`attack-priority` lab prompt variants were NOT promoted into the live model input
because the measured outputs still failed the attack objective.

### NanoJev Native Utility Scores + Disclosed Joint Readout

`input_profile: utility-attack` / `tank-utility-joint-v1` is an opt-in local
NanoJev mode, distinct from the original flat Choice task and the rule baseline.
It uses the original checkpoint's **Boolean head**, without editing/training
weights. Application-derived action effects are short, anonymous propositions;
tank/action IDs exist only in transport metadata and the explicit mapping (the
native encoder does not tokenize those IDs). The actual wire request is retained
in `utility_trace.model_request`; the older-looking `request` is explicitly
labeled `request_role: logical_action_contract`, not passed off as the model text.

Currently feasible moves and valid shots are scored in one local HTTP evaluation.
The model returns an independent `p_true` for each effect proposition. These are
used as **relative utility scores**, NOT categorical action probabilities, NOT a
normalized distribution, and NOT calibrated correctness confidence. No thresholds
or synthetic score bonuses are used. The disclosed readout maximizes their sum
over joint plans that do not contest the same move destination. Both the raw
per-action scores and per-tank independent argmax are preserved, so differences
introduced by the joint constraint are visible. There is no preselected rule
attack order substituted for a model result.

This is substantial **input/planner/readout assistance**, not unaided tactical
reasoning: geometry/BFS and physical feasibility come from the application.
Derived effect phrases repeat between many different board states; independent
board checks are not a disjoint textual generalization benchmark. Completely
trapped/no-joint-plan fallbacks are explicitly recorded (`fallback_tanks`,
`joint_fallback`) because the action contract has no wait option. They must not
be claimed as guaranteed legal/successful actions. Target motion can still make
an otherwise feasible selected action fail at execution.

Rows use `decision_source: model_utility_joint`, `score_kind: native_boolean_utility`
and `utility_scores`; ordinary action `probabilities` remains null. The UI shows
the actual Boolean request/readout trace and raw decimal scores, not percentage
confidence labels. Copilot is also supported through a separate score-only CLI
contract: original 0–100 self-preferences are preserved in `self_scores` and the
utility trace, with `score_kind: self_reported_preference`. The application ranks
the same legal joint plans by summed preferences; it does not synthesize native
Boolean probabilities or silently change task/provider. Old profiles remain available.

The pure local probe endpoint also accepts all-Boolean native requests for the
bounded encoding experiments. Returned `binary_gates` are validated against the
exact IDs and native Boolean probabilities/value; probes do not execute actions.

```bash
node --test tests/jev-arena-utility.test.js
node tests/jev-arena-utility.browser.js
# REAL local inference, opt-in, no cloud, max ten calls in this fixed suite:
node scripts/jev-utility-validation.js --consent-local \
  --output "$HOME/.cache/study-room/jev-evaluation/new-utility-validation"
```

`jev-arena-encoding-lab.js` performs bounded fixed-input ablations from a private
diagnostic, with reversible aliases, explicit consent, no action execution or
retries. Failed variants and successful real-game observations are documented in
`tests/experiments/jev-arena-utility-20260921.md`, not presented as weight training
or a population win rate.

### Survival / Teamwork v2 and Arbitrary-Angle Ballistics

Select `input_profile: utility-tactics` with `ruleset: tactical` and step control.
Physics is `tank-v6-tactical`: named-target fire at any angle, Euclidean radius 6,
fixed-direction bullets with swept wall/tank collision, closed wall corners and
0.7-cell tank hitboxes. Allies remain transparent. Old cardinal rules remain the
API default and an explicit UI comparison; old records are not relabeled.

The `tank-tactical-utility-v2` **assisted controller** considers incoming bullets,
cover, resources and allies. During reload it offers movement rather than another
queued shot when movement is possible; trapped exceptions are recorded as
`reload_hold_fallback`. Predeclared joint plans avoid tile conflicts. Disclosed
forecasts prioritize allied survivors, safe victory, then HP + shields, followed
by avoiding redundant individually lethal shots. Remaining plans are ranked by
publicly weighted offense/survival model scores. This is not weight training or
pure model action argmax. Projections assume a three-tick decision delay, one own
action, frozen enemies/no new enemy shots, and at most eight ticks; real latency
and enemy motion can invalidate them. Aggressive approach still matters when out
of range, and proactive cover preference remains imperfect.

NanoJev receives two states (`arena`, `survival`) in one HTTP request and returns
independent native Boolean scores. Copilot returns 0–100 **self-preferences** for
the same effect statements, not native probabilities. `utility_scores` /
`survival_scores` and `self_offense_scores` / `self_survival_scores` stay separate;
`combined_scores` is explicitly application-weighted. Actual request/prompt,
raw scores, mappings, forecast assumptions, plan audit, admissible plans and
weights survive the privacy-filtered export. CLI consent is still required.

```bash
node --test tests/jev-arena-tactics.test.js
node tests/jev-arena-tactics.browser.js
node tests/jev-arena-renderer.browser.js
# Ten REAL local development calls, no cloud, no retries; use a fresh directory:
node scripts/jev-tactics-validation.js --consent-local \
  --output "$HOME/.cache/study-room/jev-evaluation/new-tactics-validation"
```

See `tests/experiments/jev-arena-tactics-20260921.md` for the v1 negative evidence,
v2 constraints, the rejected zero-inference attempt, ten actual local probes,
and the remaining cover limitation. Fixture/controller successes must not be
credited entirely to the model or presented as a general win rate.

### v7 Friendly Collision and Firing-Lane Avoidance

`ruleset: friendly-fire` selects **tank-v7-friendly-fire**, step control only.
Choosing the UI's opponent-rollout profile now defaults to v7; its ballistics
selector remains available for an explicit v6 comparison. Other profiles can
also select v7. The API's omitted-rule default remains historical cardinal fire.
Existing v5/v6 records are not relabeled or replayed under new collision rules.

- A projectile stops at the first living tank, including a friendly tank. Shields
  absorb damage normally. Only the shooter's initial launch segment is exempt;
  there is no lifetime team immunity. Walls/corners retain collision priority.
- Guarded firing candidates and BFS firing positions exclude friendly-blocked
  rays. Raw or stale already-installed shots are **not silently repaired**: they
  can hit a teammate. Snapshot assistance is not an execution safety interlock.
- `tank-planner-friendly-fire-v1` checks each joint root with the actual engine,
  including existing projectiles, proposed own shots, reload and the movement
  phase, for `decision_delay + 12` ticks. Enemies are frozen and receive no new
  orders in this separate lane check. If collision-free roots exist, only they
  enter the model shortlist. Otherwise `no_safe_plan` is explicit; no hidden wait
  or made-up safe action is substituted. Full opponent rollouts additionally
  charge 2 application-value points per friendly HP/shield damage point.
- `planner_trace.lane_safety`, each root's `lane_safety`, raw model inputs/scores,
  and friendly-damage outcomes are exported. Friendly motion and actual latency
  can invalidate predictions. Root screening is application help, not learned
  coordination or a guarantee against friendly fire.
- `hits`/`damage` count enemy hits/HP damage only. `friendly_hits`,
  `friendly_damage`, `friendly_shield_damage` are separate HUD/detail/export KPIs.
  Mixed-source simultaneous damage is capped once, then HP and shield damage
  are attributed proportionally to raw incoming damage, independent of bullet
  order. A friendly hit cannot be credited as enemy damage.
- The HUD calls the v7 battle count **Enemy Losses**, since a destroyed enemy may
  have died to its own teammate. Friendly impacts stop the visual projectile;
  damage effects explicitly mark friendly fire.

```bash
node --test tests/jev-arena-friendly-fire.test.js
node tests/jev-arena-planner.browser.js
node tests/jev-arena-hud.browser.js
# Search-only game smoke, ZERO model calls:
node scripts/jev-planner-validation.js --ruleset friendly-fire \
  --seeds friendly-lanes-a,friendly-lanes-b
```

See `experiments/jev-arena-friendly-fire-20260921.md`. These physics and injected
controller checks do not extend the earlier v6 model win-rate evidence to v7.

### In-Game Settings and Operations

`arena-shell.js` reorganizes the original controls into the battlefield rather
than cloning them: each ID, input value, event handler, consent checkbox and
button has one canonical DOM node. Without the shell module, the original
controls remain available as a progressive-enhancement fallback.

- The game toolbar contains Start/Stop, Match Settings and Diagnostics & Records.
  Status/connection, both model HUDs, replay and visual help are inside the game.
- The bounded floating dialog has Settings and Diagnostics tabs. Settings include
  both model selectors, swap/refresh, seed, mode, control/input profile, ballistics,
  deadline, rate policy, duration, cloud consent and collapsible rule/cost notes.
  Diagnostics contain detailed scores/timings, actual input, exports, reports,
  imports, history, logs and the isolated no-model VFX demo.
- Opening the dialog temporarily moves the same Start/Stop buttons into its fixed
  footer. Closing moves them back; successfully initiating Start closes the panel.
  No duplicate action handlers or automatic model calls are introduced.
- Opening/closing preserves selected values and consent. Actual setting changes
  still clear consent. During a match, configuration remains read-only and Stop
  stays available. **Opening a panel does not pause realtime physics.**
- Dialog contents scroll independently; header/actions remain visible. Keyboard
  focus is contained, tabs support arrows/Home/End, Escape/backdrop/Close dismiss,
  focus returns to the opener, and prior background inert/scroll state is restored.
  The panel is bounded by the battlefield and available viewport.

```bash
node tests/jev-arena-shell.browser.js  # deferred injected providers; no inference
```

Existing browser suites navigate the actual panel using `jev-arena-ui.js` helpers,
not forced clicks or hidden-DOM bypasses. Shell coverage includes desktop/390/320px
layout, canonical control IDs, explicit cloud consent, cancellation, unchanged
simulation progress while inspecting settings, and actual site language switching.

### Battlefield Corner HUD

The battlefield header keeps Blue on the top left and Red on the top right,
including on narrow screens. It shows the selected model/controller name, kills,
alive/HP, HP damage, hits/shots, pickups, mean decision latency and decisions/errors.
Battle score means **kills** in historical rules, **enemy losses** under v7
(including enemy friendly-fire losses), not a newly invented reward. Installed model decision
scores are separately labeled (native probability, independent utility, application
value or CLI self-preference); rule controllers have no fabricated model scores.
Combat KPIs (including friendly fire), mean latency and decision/error counts
appear only in the battlefield HUD, not again in the diagnostic team cards.
The Diagnostics tab retains six complementary metrics: p50/p95, tokens, state age,
movement attempts/blocking, ineffective triggers and first-order latency. Premium
requests and external API cost are no longer KPI cards. Their original usage fields
remain in raw receipts/exports for audit, without fabricating zero cost. Detailed candidate-score panels and per-call timing traces remain available.

Names follow selection/swap before play and the match's captured team config during
play/replay. Long names wrap and are inserted as text. HUD space is reserved above
the canvas, never over tanks/projectiles. During replay, combat metrics and retained
installed-score records follow the selected tick; whole-match latency/call counts
are explicitly labeled. Missing latency/scores show a dash or a pending message.

```bash
node tests/jev-arena-hud.browser.js  # injected records, no model calls
node tests/jev-arena-planner.browser.js  # includes native-plan HUD score semantics
```

HUD coverage includes selection/swap, local/rule/long cloud names, text safety,
per-side combat/score semantics, replay rewind, language changes, and desktop,
390px and 320px side-by-side layout without obscuring the map.

### Online Arena Start and Score Contracts

Online teams are supported in both `utility-attack` and `utility-planner`, in
addition to the existing profiles. The previous local-only gates in frontend,
configuration validation and provider routing have been removed **together with**
implementing the score-only CLI contracts, not by simply enabling the button.
Cloud consent, CLI availability, rate admission, deadlines and cancellation still
apply. Disabled Start now shows a concrete reason (missing consent, unavailable
service/model, invalid seed, incompatible rule control, etc.) in the game and dialog.
No setting/approval starts a request until Start is explicitly pressed. Realtime
still does not wait for slow online calls; use Sync for a decision-quality comparison.

```bash
node --test tests/jev-arena-online.test.js
node tests/jev-arena-online.browser.js
```

These use injected CLI responses, not paid inference. Coverage includes both
previously blocked profiles, the full HTTP/worker/provider/parser path, preservation
of the selected model/profile and friendly-fire filtering, missing/extra/invalid
score rejection, separate native/self-score semantics, actual prompt exports,
Stop/abort, no native fallback, and removal of cost/premium KPI cards. Historical
local-only experiments remain historical evidence, not live cloud verification.

### Opponent Rollouts + Native Joint-Plan Ranking

Select **对手预测 · 联合搜索＋模型评分（实验）** / `utility-planner`, step control,
`friendly-fire` (v7, now selected by the UI) or explicit `tactical` (v6) rules,
and local NanoJev, Copilot, or the rule baseline. Copilot now scores the same
shortlisted plans; choosing an online model does not replace the strategy.

`arena-planner.js` enumerates joint roots and runs 24-tick actual-engine policy
rollouts against attack/evasive opponents. It exposes six shortlisted joint-outcome
propositions to the unchanged native Boolean head. Readout is disclosed application
search value plus `12 * (p_true - 0.5)` for native scores, or
`12 * (self_preference / 100 - 0.5)` for Copilot, **not a calibrated win probability**.
CLI output must contain exactly all shortlisted question IDs with finite 0–100
scores. `planner_trace.self_scores` and `plan_scores.self_preference` retain the
original values; native `binary_gates` and `model_score` stay null for CLI replies.
Rows use `self_reported_plan_preference` and preserve the actual CLI prompt while
pending and after completion. Failed/invalid replies stop without retry or fallback.
Both sides may queue fire during reload; no new wait or hidden autopilot is added.
Search runs in a cancellable worker, so live physics continues during computation.
Delay/scheduler assumptions follow sync or recent realtime request timings.

`planner_trace` preserves original requests/scores, all root forecasts, shortlist,
application values, search-only choice and whether the model changed it. Search
contributions are not credited as newly learned model ability. There is no model
fallback on invalid or failed inference. UI preview performs no search/inference.

```bash
node --test tests/jev-arena-planner.test.js
node tests/jev-arena-planner.browser.js  # injected scores only; Playwright required
# Search-only ablation, no model calls:
node scripts/jev-planner-validation.js --seeds tank-2026,planner-dev-a
# Explicit REAL native local sync evaluation, paired sides, fresh output directory:
node scripts/jev-planner-validation.js --consent-local --seeds my-new-map \
  --max-calls 120 --output "$HOME/.cache/study-room/jev-evaluation/new-planner-run"
# Actual realtime HTTP arena, with worker and inference latency (starts local matches):
node scripts/jev-planner-live-validation.js --consent-local --seeds my-new-map \
  --output "$HOME/.cache/study-room/jev-evaluation/new-planner-live"
```

The labs default to the loopback backend on port 62848 and refuse to collide with
an existing user match. No cloud, retries, warmups or automatic model replacement.
`--mode delayed` is a **synthetic** fixed-tick-delay lab, not a realtime benchmark.
The live runner uses the real manager, 90 simulation seconds / 120 wall seconds /
100 requests per match, polls its own heartbeat and stops only its own match ID.

See `experiments/jev-arena-planner-20260921.md` for all outcomes, development
failures, budgets and private evidence paths. The new FP32 pipeline won 6/6 held-out
sync cases and 4/4 actual realtime cases. **Pure search also won 6/6 sync cases**;
model preferences did not improve win count and reduced remaining HP in two cases.
These are bounded controller results, not population win rates or model training.

### Local Inference Without Per-Minute Quotas

Both the website's former 20/min local accounting and the MLX service's former
30/min limit are removed. All local routes (Playground, comparison, arena and
fixed-state probes) are exempt, even when external admission is exhausted.
Same-service FIFO / single-flight, cross-experiment exclusion, authentication,
input limits, deadlines, viewer lease and manual stop are unchanged. A mixed
match can still intentionally pause both sides for a **cloud** admission wait
when `pause-world` is selected; that is not a local inference quota.

Verification: `node --test tests/jev-local-unlimited.test.js` and
`python -m unittest discover -s tests -p 'test_nanojev_mlx_server.py' -v` use
injected evaluators / a fake engine, not GPU or cloud inference. They exercise
45 consecutive local requests, exhausted-cloud/local isolation, bounded and
continuous arena admission, and retained concurrency protection.

### Shared Pause During Application Rate Admission

The UI now defaults to `rate_limit_mode: pause-world`: when a request is waiting
for the application's rolling rate allowance, **both sides' simulation stops**.
The provider with no rate charge cannot continue shooting while its opponent has
no admitted request. The waiting side retains `rate_wait_ms`; the other side's
pause is `rate_barrier_ms`. Physics resumes when the admission queue clears.
Stop and the viewer lease remain active, and an unstarted request still has no
inference timeout. Actual inference is NOT a new sync barrier in realtime mode.
In-flight work can finish while the simulation is paused; this reduces the quota
confound but is not an isolated hardware/latency benchmark. Use Sync for a full
paired-response barrier. `continue-world` preserves the previous throughput
experiment; old API configurations without the field retain that behavior.
Simulation and wall clocks remain separate; a wall-time mean including a long
admission wait must not be described as pure model forward time.

### Approach-Then-Fire Input Gate (Default Compatibility Mode)

The user requested that tanks enter firing range before choosing a shot. The
step UI now defaults to **Approach Then Fire · Gated + BFS Assisted**, using
`input_profile: engage-first`, `tank-engage-first-v1`, and exported
`candidate_policy: fire_geometry_gate`. At capture, only live enemies in the same
row/column, within six cells (inclusive), and without a blocking wall receive a
`fire_ID` candidate. Four directional moves remain, so there are always at least
four choices; no duplicate/dummy firing options are invented for NanoJev.
Cooldown is not a geometry exclusion: an accepted shot can wait for reload under
the existing one-attempt rules. Allies do not block bullets.

The model sees APPROACH when no valid shot exists, otherwise ENGAGE with the
available target IDs. Movement descriptions include disclosed BFS distance to a
firing position, not an exploration reward. This **input constraint and planner
assistance are not evidence of native feasibility judgment or tactical skill**.
The model still chooses its action; no result is replaced after inference. Both
local and CLI providers receive the same constrained contract. Native probabilities
are normalized over the offered subset, not comparable directly to an old six-way
distribution; CLI self-scores remain self-reported preferences, not probabilities.

A target can move after capture or while a shot waits for reload. Such later
invalid attempts still fail and are recorded by the unchanged physics; the gate
does not fabricate hits, freeze targets, or guarantee every available shot is
selected. It also does not claim to solve the remaining movement loops.

Raw/older fact profiles remain explicitly selectable and unfiltered. Old API
requests omitting `input_profile` retain their old behavior and protocol.
Diagnostics expose the policy and `fire_candidates_filtered_at_capture` so
filtered runs are never relabeled as raw-model accuracy.

```bash
node --test tests/jev-arena-engage.test.js
JEV_TEST_TOKENIZER=1 node --test tests/jev-arena-task.test.js
```

Tests check range boundaries, diagonal/wall/dead targets, allies, actual movement
into range followed by a real physics shot, rejected out-of-contract replies,
post-capture target motion, and agreement with physics across maps/positions.
The four real local smoke calls in
`~/.cache/study-room/jev-evaluation/engage-review/development/` offered only movement
in the two far-target development states. They validate the transport/constraint,
not improved tactical decision quality. No cloud calls were made for that check.

For iterative preview updates, **reuse the current Orca browser page and reload
it**, rather than creating tabs. First ensure the match is stopped and archived;
preserve public form selections, but never restore cloud consent or auto-start a
new match. An active match must not be interrupted just to refresh code.

### Optional Action-Fact Input and Explicit Deadlines

The raw-map comparison retains `tank-step-task-v1`.
The step-only **Action Facts / Assisted Experiment** selector uses
`tank-action-facts-v2`: computed wall/occupancy/shot geometry, Manhattan distance
changes, immediate reversal, and visit counts from each tank's last eight actual
positions. Successful moves append history (including the initial spawn); failed
attempts and idle frames do not. This is additional observation assistance, **not
unaided spatial reasoning**. Both sides get the same assistance policy. All
candidate keys remain selectable; neither a solver nor a post-return correction
chooses the model's actions. Manhattan distance is not a shortest-path planner.
The v1 assisted receipts without position history remain labeled v1.

Assistance reduced ineffective shooting in observed local trials, but did not
establish competent combat: tanks still revisited locations and missed clear
firing opportunities. Do not report movement feasibility as tactical accuracy.
See `tests/experiments/jev-arena-actions-20260920.md` for successes and failures.

The UI now exposes **Per-Call Deadline** (30/60/120/180 seconds, default **120**)
without a UI decision-count limit. Bounded checks can still use an explicit
one-call API cap. The selected deadline appears in
cloud consent and exported configuration. Old API configurations that omit
`decision_timeout_s` retain 30 seconds. This is a timeout budget, not added calls,
a warm-up, or automatic retry. Sync freezes simulation while requests complete;
Realtime still stops at its simulation-duration limit, potentially before a long
per-call deadline. Use Sync to inspect complete slow-CLI decisions.

Receipts include `deadline_ms` and `timeout_source` (arena versus CLI deadline).
CLI failures/cancellation now read any completed usage file before cleanup and
retain allowlisted stage/byte counters even when no answer exists. Only fixed
JSONL event names and their timings/counts are retained, never event payloads,
stderr contents, reasoning text, or arbitrary names. Missing usage remains
unknown. The comparison page also preserves reported usage on its own deadline.

A single authorized `gpt-5-mini` test returned valid orders in 40,201 ms, exceeding
the former 30s arena cutoff. It reported 34,790 ms API time and 2,560 reasoning
tokens. This demonstrates the cutoff problem for that request, not a latency SLA
or a guarantee every future call completes. No cloud retry/fallback was used;
reported credits were not converted to dollars.

```bash
node --test tests/jev-arena-facts.test.js tests/jev-copilot-telemetry.test.js
JEV_TEST_TOKENIZER=1 node --test tests/jev-arena-task.test.js
```

Tokenizer checks now cover 2,240 finite/unlimited raw/legacy/assisted/gated/utility-wire/v6 stress inputs, offline without
model weights or inference. Simulation/unit fixtures are not model skill results.

### Action-Level Scheduling and Timing Diagnostics

Step-mode queue/inference/actuator/sync-barrier/budget/cadence wait buckets use
wall time. `blocked_ms` additionally counts time while at least one living tank
retains a failed last action; it overlaps those buckets and is not additive.
It ends when a different order is installed or a successful attempt replaces the
failure. It is not a tally of continuously executed bad model decisions. The UI also
labels `stale` as an age threshold (>=1s), not proof the decision became invalid.
Real-time step replanning now dispatches on the action-completion tick, avoiding
an otherwise unnecessary extra 200ms scheduler pulse; no action is predicted
or executed before the previous attempt finishes.

Per-side KPI cards show the all-completed-call arithmetic mean alongside
nearest-rank p50/p95 over the latest **256** samples per side. Charts show retained
individual calls, not an unbounded history. A six-sample bimodal series can
have a low nearest-rank p50 but a much higher mean; neither is hidden. Receipts
and copied diagnostics preserve queue time, provider time, sampling policy,
wait categories and allowlisted telemetry.

The local bridge separately measures connection-file checks, health requests,
inference HTTP round trip and response normalization. The MLX runtime returns
`nanojev-stages-v1` with a non-secret runtime instance ID, first-inference flag,
gap since the prior prediction ended (including failures), tokenization/preparation,
model forward, final softmax/eval, decoding and response build/validation times.
It also reports min/max path lengths, padded microbatch shapes, candidate counts,
call index and process-local MLX active/cache/peak memory. No new forward or eval
barrier is inserted for instrumentation. Forward includes the existing internal
MLX evaluation; the final phase includes synchronization. These are observed
stages, not isolated GPU-kernel profiles and not proof of a cache/thermal cause.
Old services without these fields show unknowns, never invented zero timings.
Reloading a model service creates a new runtime ID and explicitly marks its next
call as first inference; no automatic warm-up is performed.

```bash
node --test tests/jev-arena-step.test.js
node tests/jev-arena-step.browser.js
python3 -m unittest discover -s tests -p 'test_nanojev_mlx_timing.py' -v
```

Tests cover single-attempt moves/shots/failures, no voluntary wait, independent
fast-side progress, paired sync barriers, fresh dispatch snapshots, FIFO service
queues, queue cancellation, budgets, late-response rejection, bimodal means and
safe telemetry exports. Python timing tests use fake kernels/tokenizers only,
without weights or GPU inference. Real stage measurements require a user-authorized
run after the local model services are intentionally restarted.

### Unlimited Duration, Retention and Stop Verification

Select **Unlimited · Stop Manually** in duration; 30/60/90s remain available and
60s remains the page-load default. The old decision-cap selector has been removed.
An unlimited match can still finish by elimination. The normal Stop button,
hidden/unloaded-page handling and five-second lost-viewer lease remain effective,
including while waiting for rate admission. Merely selecting unlimited does not
start inference; cloud consent is reset when configuration changes.

Long matches use bounded memory without ending the match: newest **1,800 frames**
(about six simulation minutes), **200 decision receipts** and **256 latency/age
samples per side**. `retention` reports totals and dropped counts; diagnostic
`coverage` preserves the omissions and stable decision indices. The UI warns
when replay/input history is partial. Cumulative request/error/usage/combat totals
and mean latency remain all-run values; percentiles are explicitly recent-window
values. Final archives contain this retained window, **not a secretly complete
long-run history**. Old rows are not reconstructed or fabricated.

```bash
node --test tests/jev-arena-continuous.test.js
node tests/jev-arena-step.browser.js
```

These tests use fake providers, not model skill/billing: progress beyond 10 calls
and 90 seconds, finite-duration termination, manual stop, rate wait/resume with
fresh or frozen snapshots as appropriate, queued cancellation, lost-viewer stop,
bounded retention, cumulative metrics, and real HTTP admission. Browser checks
verify the absent cap selector, unlimited clock, >10 independent decisions,
manual Stop and no extra calls from copying/export.

### Private Archives and Bounded Local Experiments

The CLI website backend automatically archives a finished/stopped match **after
all launched calls settle** to
`~/.cache/study-room/jev-evaluation/matches/<match-id>.json`. Directory/file modes
are 0700/0600, files are exclusive (never overwritten), fields use the same
redaction/allowlist as copied diagnostics, and provenance is `local-server-record`.
Nothing is uploaded or served as a static file. A failed disk write is visible as
`archive_status: failed` and does not alter outcomes or trigger retries. Disable
with `--no-arena-archive`. Library `createServer()` opts in with `archiveArena:true`;
unit/browser fixtures do not write to your cache. Abrupt process termination can
still lose unsettled evidence; stop and preserve a match before restarting.

Read-only `POST /api/jev/arena/latest` takes `{}` with the existing Origin/CSRF
protection. It discovers the current match without knowing its UUID and **does
not renew the viewer lease**. Fetching a receipt never runs a model. To export a
settled record to a new private directory:

```bash
node scripts/jev-arena-capture.js --origin http://127.0.0.1:8000 \
  --output "$HOME/.cache/study-room/jev-evaluation/manual-capture"
```

Explicit opt-in local experiments (real GPU calls; not part of normal tests):

```bash
node scripts/jev-arena-lab.js --consent-local --origin http://127.0.0.1:8000 \
  --split development --profiles original,focused --max-calls 8 \
  --output "$HOME/.cache/study-room/jev-evaluation/new-development-run"
# Independent fixed cases, never the same cases relabeled as held out:
node scripts/jev-arena-lab.js --consent-local --origin http://127.0.0.1:8000 \
  --split heldout --profiles original,focused --max-calls 12 \
  --output "$HOME/.cache/study-room/jev-evaluation/new-heldout-run"
# Six identical paired case sequences, serial by default; opt into concurrency:
node scripts/jev-arena-lab.js --consent-local --origin http://127.0.0.1:8000 \
  --split latency --profiles original --max-calls 12 --concurrent \
  --output "$HOME/.cache/study-room/jev-evaluation/new-latency-run"
```

The runner requires a fresh output directory and a complete planned budget
<=32 calls. It saves a manifest and fsynced per-call JSONL, stops on errors/rate
limits without retry, and rejects unavailable services or an active match.
`POST /api/jev/arena/probe` explicitly permits only one/two distinct **local**
providers, shares the website's match lock and 30s deadline, but no per-minute quota,
and rejects cloud providers. Match start cannot race a launched probe. If a
match starts between probes, the next probe stops rather than disturbing it.
Per-experiment call caps and explicit consent still bound autonomous lab runs;
removing the runtime RPM limit does not authorize unbounded unattended experiments.
CLI CSRF stays in memory, not experiment receipts. Native connection tokens
remain inside the website backend.

`focused` and `geometry-assisted` are **lab-only rejected/experimental prompt
variants**, not defaults on the article. `action-facts` matches the separate,
explicitly assisted article input. `validation-v2`/`validation-v3` are additional
fixed suites; their previously inspected cases must not be called fresh holdouts.
Geometry-assisted inputs must not be scored as unaided map understanding. The
older profiles retain every candidate; the newly requested `engage-first` profile
explicitly filters firing candidates before inference, as documented above.
No profile changes returned orders or fabricates bullets. Selected-action geometry
is not tactical correctness or a calibrated accuracy metric. `heldout` is a fixed
independent suite; once inspected, it is no longer fresh for subsequent tuning.
Use new independent cases before making later generalization claims.

`node --test tests/jev-arena-lab.test.js` uses only fixtures and temporary files.
A local experimental report (including negative results) is in
`tests/experiments/jev-arena-20260920.md`.

### Copyable Diagnostics for Iteration

The arena's **Copy Logs and Results** button works during or after a match and
can target earlier page-history matches. The copied text is an immutable capture,
not a live-updating textarea. Optional user observations travel with the report.
The default summary includes configuration/seed, rule and input-protocol versions,
requested/reported models and weight identities, outcome, timing/usage, all
normalized decisions/scores and execution-pattern findings. It includes up to
three prioritized full input examples and explicitly marks length truncation
(60,000-character summary limit). **Copy Full Diagnostic JSON** keeps all
allowlisted inputs and diagnostic records but omits bulky animation frames; the
existing full-match download still supplies those frames.

`arena-report.js` is a pure formatter/analyzer, not a controller. It never calls a
model, changes an action or submits the report anywhere. Clipboard writes occur
only on the user's click. If browser permission is denied, a readonly textarea
is selected for manual Cmd/Ctrl+C. Copying does not itself stop a match; the
existing hidden-page safety stop still applies when leaving the page.

Old single-match JSON files can be imported locally (up to 10 MB), without
replaying/executing them or changing match KPIs/history. They are always labeled
`user-import-unverified`, even if their ID matches the live match. Imported frames
must not be merged with live frames. Imports are format-checked, not authenticated.

New decision receipts store a public geometry snapshot at capture and another
at installation, plus explicit applied tick/wall time. These are diagnostics only,
not additional model input. Older records use exact-tick replay frames when
available; missing snapshots remain unknown. Execution attempts are deduplicated
from `last_execution` before grouping repeated failures. The report distinguishes:

- one installed command repeatedly hitting a wall between model calls;
- a new applied decision choosing a failed command after explicit failure feedback,
  while the input snapshot is still geometrically blocked;
- geometry clear at capture but blocked at return/installation;
- absent actual shots despite repeated ineffective triggers, and call errors.

These are investigative leads, not proven causes, best-action judgments or model
accuracy. Geometric checks do not evaluate cooldown, simultaneous contention or
future movement. Sparse traces are labeled; legacy strategic execution may move
and auto-fire in a single tick, so `last_execution` need not contain both. Repeated
execution attempts must never be reported as that many model decisions.

Only allowlisted fields are copied. No auth headers, CSRF, environment, connection
files, raw CLI output or CLI-added system prompts are included. Known pasted
credential formats receive defense-in-depth redaction, with counts and field
truncation notices. This is not a universal sensitive-data detector: users should
review their notes/application input before sharing. Scores retain their distinct
native-probability vs self-reported-preference provenance; pending/missing usage
must not be called zero cost.

```bash
node --test tests/jev-arena-report.test.js
node tests/jev-arena.browser.js
```

Tests cover repeated-execution vs reselection, changed geometry, exact-tick legacy
fallback, missing/partial evidence, same-tick ownership, secret-field exclusion,
redaction, bounded text, clipboard success/permission failure, immutable capture,
history selection, unverified import isolation and zero additional inference.

### Arena Visual Events and Rendering

`tank-vfx-v1` adds presentation metadata, not new combat rules. The core records
bounded, uniquely numbered shot, impact, wall-hit, damage/shield, destruction,
pickup and dry-fire events (last 16 ticks, at most 96). Projectiles carry stable
IDs and spawn coordinates. These fields are excluded from model observations.
A bullet born and removed in one simulation step still has shot/impact events,
so the 250ms browser poll cannot silently erase its entire recorded trajectory.

`arena-renderer.js` uses requestAnimationFrame, high-DPI backing stores and a
320ms interpolation buffer over **received** snapshots. It renders bright
projectile heads/trails, muzzle flash/recoil, impact sparks, shield pulses, actual
HP damage labels and destroyed hulls. Short flights skipped by polling get a
brief replay of the actual recorded segment, never a guessed shot. Adjacent tank
poses interpolate; multi-tile/diagonal gaps snap rather than cutting through
walls. The renderer never steps the authoritative simulation or extrapolates
bullets beyond known data. Timing KPI definitions and all hit/damage rules stay
unchanged; rendering load remains part of the local environment, not proof of
hardware-independent latency. Animation pauses when offscreen/hidden.

Dry-fire feedback is deliberately different: a red dashed intent line, cross,
and explicit reason (range, alignment, wall or missing target), **no projectile
or muzzle flash**. The map caption reports actual shots vs ineffective attempts.
A match with zero actual shots must not be made to look like a firefight. Legacy
records without events cannot recover an unrecorded short-lived projectile.

The optional collapsed visual self-check uses its own canvas and hand-authored
commands for nine seconds, on explicit click. It makes no network/model calls,
never modifies match KPIs/history, and stops when collapsed, hidden or when a
model match starts. Its label must remain explicit: this is a renderer sample,
not model output or a benchmark. It is not a fallback for failed model decisions.

```bash
node --test tests/jev-arena-renderer.test.js
node tests/jev-arena-renderer.browser.js
node tests/jev-arena.browser.js
```

The renderer browser fixture uses a controllable animation clock and no network.
It verifies point-blank/same-tick shots, trajectories skipped by polling, trails,
shield/HP impacts, event deduplication, no ghost bullets after impact, high DPI,
mobile bounds and no fabricated bullets for dry fire. `JEV_SCREENSHOT_DIR` may
point to an existing external directory for clearly named fixture screenshots.

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

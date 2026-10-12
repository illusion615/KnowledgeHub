# Scenario schemes and practice notes become popup-only — 2026-09-24

User requested removal of repeated 07A/B/C prose, retirement of the old alternatives
chapter, a two-demo-only interactive chapter, model-owned setup, and practice-note
cards below both games.

## Resulting reading structure

News → category/value → three-model comparison → Jev → NanoJev → Laya → scenario
selection → **two interactive scenarios** → evaluation/adoption → agent brief →
references. Removing Alternatives renumbers the former interactive chapter 09 to
08, and subsequent main chapters accordingly. Model chapters keep their existing
04/05/06 positions; configuration is moved by model ownership, not by a guessed
chapter number.

- Workflow, Agent and RAG schemes retain their text and old IDs, but are canonical
  `.popup-source` blocks outside `main` at runtime. They have no reading/slide
  markers. Scenario cards open them; they no longer repeat in header navigation
  or default prose. Old hashes open the popup, including inner practice anchors.
- Alternatives is deleted from the article and navigation. An old #alternatives
  URL redirects locally to #model-comparison. No content from unrelated chapters
  is removed and historical cited source IDs are not renumbered.
- `#playground` has only `#jev-arena`, its practice card, `#jev-benchmark`, and its
  practice card. The arena's full research/evidence notes are popup-only. Support
  notes reuse its existing quality-review, multi-intent, streaming, cost and
  evidence-boundary prose; no false new performance results are introduced.
- Dynamic support script/log records remain in the live support diagnostics,
  not a copied modal. Game settings, consent, stop, heartbeat and cancellation
  controls remain attached to their original components.
- The old basic response inspector moves as canonical DOM nodes from templates
  into `#jev-model-lab`, an optional integration inspector within Jev's chapter.
  Its provider state, authored fixtures, controls and consent are not duplicated.
  Shared Node/Copilot setup moves there too. NanoJev retains its MLX setup, with
  links to the common gateway/inspector; Laya gets an explicit isolated-worker
  setup block and links to the common gateway.

## Implementation and fallback

`article-layout.js` runs before component initialization, moves template content
and popup sources, strips reading/deck markers from the latter and opens ancestor
configuration disclosures on hash navigation. It does not start inference.
`scenarios.js` uses the same read-only native dialog for scenario plans and demo
notes. It preserves full text, headings and evidence while stripping duplicate
IDs, scripts, interactive controls and presentation markers from dialog copies.

Without JS, source hash targets are readable through CSS `:target` (also nested
anchor targets). The API inspector, like its prior implementation, requires JS;
its new model-owned container states that explicitly. Popup-only sources are not
blank slides and do not count as ordinary visible narrative blocks. Existing
main narrative remains visible; 38 default main blocks remain after the requested
removals/moves, plus seven existing optional implementation extensions.

## Verification

- Node structural tests: top-level order, legacy anchors, source preservation,
  removed alternatives, model chapter hierarchy and narrative/extra distinction.
- `tests/jev-two-demos-layout.browser.js`: only two demos; each note immediately
  follows its component; model-owned setup and shared inspector; no duplicate
  IDs; language/mobile checks; opening/closing configuration makes zero calls.
- `tests/jev-scenarios.browser.js`: popup-only sources, language/theme, mobile,
  keyboard/focus/close/backdrop, slide isolation and no-JS source-link fallback.
- `tests/jev-arena-practices.browser.js`: both practice dialogs preserve limits
  and old v6 ablation values, internal old deep links, bilingual/mobile layouts.
- `tests/jev-laya-research.browser.js`: complete bilingual browser deck, source
  exclusion, visible main prose, extras and reading-state restoration.
- `tests/jev-model-switch.browser.js`, `tests/jev-benchmark.browser.js` and
  `tests/jev-output.browser.js` (fixtures only) verify relocated controls, support
  routing, consent, cancellation and unchanged model output semantics.
- Practice popup screenshots visually reviewed. No model inference, new game,
  service restart or changes to user match state were needed for this layout task.

The previous deadlock-recovery implementation remains separate in-progress work;
this content-layout verification is not evidence that recovery has been deployed.

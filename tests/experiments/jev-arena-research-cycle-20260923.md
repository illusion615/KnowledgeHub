# Supervised arena optimization cycle 01 — 2026-09-23

## What changed in the research method

A fixed fixture passing is not an optimization result. This cycle adds an
executable loop: preregister → collect development data → review/freeze → held-out
retest → bounded real model shadow probes → publish positive AND negative results
→ decide whether to promote, reject or open a new cycle. It is supervised and
budgeted, not an unattended service that spends model calls indefinitely.

Artifacts:

- Plan: `posts/jev-system-one-research/examples/arena-research-cycle-plan.json`
- Runner: `scripts/jev-arena-research.js`
- Aggregator: `scripts/jev-arena-research-report.js`
- Published evidence: `examples/arena-research-cycle-evidence.json`
- Tests: `tests/jev-arena-research.test.js`
- Private full cycle: `~/.cache/study-room/jev-research/20260923-invocation-01/`
  (complete input/output receipts, manifests, review and SHA-verified source copies).

No weights changed; no cloud requests, retries, warmups or automatic deployment.

## Frozen design

Two development seeds and two disjoint holdout seeds, each with both spawn sides.
Compare v2 and v3 packages against the fixed rule-attack-v1 opponent under v7
ballistics, sync snapshots, 180 ticks / 90 own decisions maximum per game.
There are **16 search-only games**, not 16 model-assisted games. Two seeds per
split are the independent board units; color swaps are paired observations.
Caps are separately reported, not HP-lead wins or forced losses.

Source/plan SHA-256 pins prevent continuing an old output directory after code or
plan changes. Exclusive phase directories refuse accidental reruns/overwrites.
Holdout requires a development review bound to the result-file hash. Errors are
recorded; only complete phases can advance. The runner will not stop a user's
active match to make room for a probe.

Primary questions:

1. Do v3's added tactical rules improve elimination outcomes over v2?
2. When can the model provably not change the already shortlisted decision?
3. Is the bottleneck inference, or the application search before inference?

Secondary metrics retain damage, friendly HP loss, blocked moves, invalid shots,
repair HP, added shields, zero-gain repair/shield pickups, powered shots, wait
orders and recent-position repetition. Repetition sums matches to the last eight
visited positions for each selected move destination; it is not a count of
unique bad actions, nor proof that every revisit is wrong.

## Candidate optimization: bounded-gap-v1

Current planner readout is `search_value + 12 * (preference - .5)` on at most six
fixed shortlisted plans, with native preferences in [0,1] (online self-scores are
scaled from [0,100]). Thus a model can change a pairwise difference by at most 12.

If there is one candidate, or the top search gap is **strictly greater than
12 + 1e-9**, no legal scores can change the winner. `invocationCertificate()`
returns this sufficient certificate. `chooseWithPolicy(..., 'bounded-gap-v1')`
actually bypasses its evaluator in that case, attributes the action to
`application_certified_search`, and leaves `model_response: null`.

This is not a confidence threshold, guessed answer, truncation, model fallback,
or a claim that pure search is correct. It is a fixed-readout action-invariance
proof. Close gaps still call the selected model once, propagating errors without
retry. Any change to weights/readout/shortlist needs a new certificate and tests.
Tests exercise all extreme score assignments in several bounded shortlists and
prove that close-gap scores can change the action.

Invocation savings are a candidate **research policy**, not silently enabled in
the arena UI. Always-call remains the normal model experiment, preserving user
expectations and historical accounting. Search-only already offers a zero-model
ablation. Promoting a gated live mode requires explicit labeling and end-to-end
realtime tests: action invariance at a snapshot does not imply identical latency-
dependent trajectories or provider-error behavior.

## Development review, before holdout

| Revision | Elimination wins | Caps | Repeat-visit sum | Search time total |
|---|---:|---:|---:|---:|
| v2 | 3/4 | 1 | 98 | 33.72 s |
| v3 | 3/4 | 1 | 66 | 73.19 s |

v3 had fewer repeated visits but no added elimination wins and roughly 2.17×
aggregate CPU search time. Its 30/115 snapshots (26.1%) were certified skips.
Review chose `proceed_without_tuning`: freeze the candidate, do not change tactics
or the threshold using the holdout. Review is preserved with the development
result hash.

## Holdout results — important regression

| Revision | Elimination wins | Caps | Repeat-visit sum | Search time total |
|---|---:|---:|---:|---:|
| v2 | 2/4 | 2 | 94 | 50.66 s |
| v3 | 2/4 | 2 | 385 | 128.35 s |

Both v3 runs on `cycle01-holdout-a` cap and exhibit excessive cycling; total
held-out HP damage is 424 for v3 versus 686 for v2. V3 restores no repair HP in
these four held-out runs versus v2's 60. This is **counterevidence** to claiming
that more resource/role rules already improve combat. Do not hide it behind
passing fixture tests, more prompts, or favorable timeout HP rankings.

V3 certifies 22/115 held-out snapshots (19.1%). Across development + holdout,
52/230 v3 snapshots (22.6%) are provably score-insensitive. These are search-only
trajectories: a model-changing earlier action can produce different later states.
CPU timing is sequentially grouped by version, not an isolated performance
benchmark; nevertheless search is a material cost that call skipping cannot erase.

## Twelve real local shadow requests

Preregistered sampling chooses three evenly spaced indices per split from the
ordered v3 snapshots, without looking at confidence/certificates. Both Laya
checkpoints score exactly those six snapshots, six calls each, total **12**.
The existing loopback probe API handles consent, idle admission and FIFO local
inference. No cloud, warmup, retry, weight change or extra cherry-picked calls.

- 24,026 local encoder input tokens actually processed, not cloud currency.
- 4/12 calls would be skipped by the certificate, all on development snapshots;
  their 8,511 tokens are **counterfactual replay savings**, not actual savings.
- Always-call vs gated replay: 0 action disagreements. On uncertified inputs both
  branches reuse the same response; that agreement is not independent evidence.
- None of the three sampled holdout snapshots was certified; do not market the
  six holdout calls as real held-out skip validations. The exhaustive bound and
  held-out coverage census are separate evidence.
- Typed-decisions changed the pure-search choice on one held-out snapshot. Its
  downstream outcome was not run, so this is not demonstrated improvement.
- First multilingual probe was ~2.17 s; later probe observations vary by workload
  and checkpoint. No warmup subtraction, latency percentile, or live speedup claim.

## Decision and next iteration

**Retain the invocation certificate as a tested explicit research optimization;
do not announce a best combat strategy or promote v3 based on this batch.**
No live defaults changed in this cycle.

Next cycle should:

1. Move the inspected holdout-a loop scenes into development/regression. They
   are no longer an untouched test set. Generate and freeze new holdout seeds.
2. Profile repeated public-state geometry/path work in rollouts. Try per-state
   reuse with bit-for-bit/action parity checks; do not cache across changed tank,
   bullet, shield, cooldown or resource states.
3. Diagnose loops by comparing root objectives, terminal value, continuation,
   actual chosen paths and resource detours; change one component per candidate.
4. Evaluate v2, v3 and the candidate against both the fixed attack baseline and
   an additional independently fixed opponent, with mirrored starts and equal
   budgets. Do not train and evaluate on the same failures.
5. Only after quality acceptance, measure actual always-call vs gated live runs
   with the same model, scheduling, cache/cold-state policy and full-stage timings.

Best practices: establish a baseline before adding rules; freeze the contract;
separate outcome, trajectory and efficiency metrics; preserve caps/errors;
prefer provable elimination of redundant calls over guessed confidence gates;
measure application search too; use explicit provenance for skipped calls;
consume each holdout once for candidate selection; publish rejected candidates;
require evidence gates before changing a user-facing default.

## Reproduction (fresh output only)

```sh
node --test tests/jev-arena-research.test.js
node scripts/jev-arena-research.js --plan posts/jev-system-one-research/examples/arena-research-cycle-plan.json --output /tmp/my-fresh-cycle --phase development
# Inspect results. Write review.json with decision=proceed_without_tuning and
# development_results_sha256. Changed code/plan requires a NEW cycle/output.
node scripts/jev-arena-research.js --plan posts/jev-system-one-research/examples/arena-research-cycle-plan.json --output /tmp/my-fresh-cycle --phase holdout
# Explicit additional permission for up to 12 local model requests:
node scripts/jev-arena-research.js --plan posts/jev-system-one-research/examples/arena-research-cycle-plan.json --output /tmp/my-fresh-cycle --phase model-probes --consent-local
node scripts/jev-arena-research-report.js /tmp/my-fresh-cycle /tmp/my-new-public-summary.json
```

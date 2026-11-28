# Opponent rollout planner — 2026-09-21

## What changed (and what did not)

New opt-in input profile: `utility-planner`, protocol `tank-opponent-rollout-v1`.
Requires step control, tactical v6 ballistics, local NanoJev or the existing rule
baseline. Copilot is deliberately rejected for this first implementation. Existing
raw/engage/attack/tactical-v2 modes retain their identities and behavior.

This is **model-assisted planning, not combat training**. Checkpoint weights,
precision, native heads, model length limits and local service settings were not
changed. No cloud inference, warmups, retries, synthesized model scores or silent
fallback to the baseline was used.

Implementation:

- `posts/jev-system-one-research/arena-planner.js`: enumerate feasible joint root
  plans (at most 36), excluding contested allied destinations when possible.
  A fully trapped forced-action fallback is disclosed; it does not invent wait.
- Reconstruct a simulated world from public fields only. Discard all outstanding
  orders and pending flags, even if a caller supplies them. Run the **actual game
  engine**, not a second approximation of ballistics, pickups or reload.
- For every root, roll out up to 24 ticks against two public opponent policies:
  attack and projectile-evasive attack. Both opponents make new moves/shots.
  Subsequent friendly actions use a disclosed evasive continuation policy.
  This is bounded policy rollout, **not exhaustive minimax/MCTS or an optimal
  opponent prediction**. The attack rollout policy is an approximation of, not
  hidden access to, the live baseline.
- Sync predictions use paired-after-action scheduling. Realtime predictions use
  independent scheduling; own delay is the last eight successful requests'
  median total provider time, rounded up to ticks, clamped to 1–6 (initially 1).
  Predicted opponents have zero additional decision delay. These assumptions can
  be wrong; they are exported on every request.
- Application leaf value, while both sides live: `65 * survivor_difference +
  HP_difference + 0.8 * shield_difference - 2 * sum(own firing-route distance)`.
  Route distances are capped at 20. Elimination is approximately +/-1000 plus
  survivor HP, with a 2-point/tick preference for an earlier win/later loss.
  Mutual elimination is zero. Resource gains affect real projected HP/shields,
  damage and positions, rather than receiving a separate invented reward.
- Root value is `0.7 * worst + 0.3 * mean` across the two opponents, minus
  `0.25 * repeated destination visits` from public recent-position history.
  This soft tradeoff replaces v2's strict short-term health hierarchy **only in
  the new mode**. Small damage trades can be selected for a win.
- The best six plans receive independent native Boolean scores using anonymous
  joint-outcome propositions (before/after strength, damage, resources). These
  scores are neither categorical action probabilities nor calibrated win rates.
  Final readout is `search_value + 12 * (p_true - 0.5)`; the application's numeric
  contribution and native score are kept separate. Scores are validated exactly;
  missing/invalid inference stops rather than substituting a rule action.
- Both live sides may queue an already geometrically valid shot during reload.
  The new profile removes v2's reload-must-move restriction for **both** sides;
  it adds no wait, automatic aim correction, tracking bullet or output repair.
- `scripts/jev-planner-worker.js`: cancellable per-decision worker. The live
  event loop continues advancing physics during search and inference. Worker
  startup/computation is included in request latency, with `planner_ms` also
  recorded separately. Timeout/Stop terminates the worker.
- `planner_trace` includes all root outcomes, shortlist, exact native request and
  original scores, application values, assumptions, search-only action and whether
  the model changed it. Privacy-filtered exports keep signed values and drop
  unknown fields. UI labels do not present application values as probabilities.
  Preview does not run search or inference. Only an explicit Start runs a match.

## Development evidence, including correction

First search-only development runs used independent continuation scheduling even
when the outer match was synchronous. On `tank-2026` both sides reached the 450-tick
cap instead of finishing. Another development side lost. Examination showed that
forecasted later wins were repeatedly deferred under the mismatched scheduler.

Before holdout evaluation, projection scheduling was matched to sync/realtime and
terminal tempo made explicit. The resulting search-only controller won all six
paired development cases (`tank-2026`, `planner-dev-a`, `planner-dev-b`) by
elimination. Six synthetic one-tick-delay cases also won; these are **not actual
realtime tests** and are not model wins.

Real FP32 development: `tank-2026` and `planner-dev-a`, both sides, 82 native calls,
4/4 elimination wins. The model changed the search-only choice twice. No claim of
improved model-over-search value follows from these wins.

## Predeclared held-out maps (sync)

After the above correction, coefficients and prompts were left unchanged for
`planner-holdout-01`, `planner-holdout-02`, `planner-holdout-03`, each from both sides.
Each run had a 450-tick cap; no case hit the cap. All six cases are retained.

| Controller | Wins / losses | Native calls | Model changes to search-only choice |
| --- | --- | ---: | ---: |
| Existing survival utility v2 | 3 / 3 | 216 | not applicable |
| New search-only ablation | 6 / 0 | 0 | not applicable |
| New planner + actual FP32 scores | 6 / 0 | 114 | 2 |

FP32 planner survivor HP, side 0 / side 1:

- holdout-01: **102 / 106** (search-only **114 / 112**)
- holdout-02: **140 / 146** (same as search-only)
- holdout-03: **90 / 86** (same as search-only)

**Important negative result:** model scoring did not improve win count over pure
search and reduced final HP in the two differing holdout outcomes. The main gain
currently belongs to planning and the task/controller changes, not new learned
model skill. Six wins are not a population win-rate estimate. These are new boards
with shared effect templates, not disjoint textual generalization. v2 and the new
mode have different reload candidate constraints, so their comparison is a package
comparison, not a causal isolation of search or model contribution.

## Actual realtime HTTP matches (worker + native FP32)

The original local backend was confirmed idle and reloaded; no active user match
or model service was interrupted. `scripts/jev-planner-live-validation.js` used the
real HTTP arena, normal worker/provider path and 200ms simulation clock. Predeclared
seeds: `tank-2026`, `planner-live-holdout-01`, both sides. Limits: 90 simulation
seconds, 120 wall seconds, 100 model requests per match. No limit was reached.

| Seed / model side | Match | Outcome | Remaining model team | Mean all-in decision ms | Shots / hits |
| --- | --- | --- | --- | ---: | --- |
| tank-2026 / Blue | `e1adde77-49ab-46a3-a3cf-27678a9e3b41` | elimination win | 2 tanks / 92 HP | 469 | 15 / 15 |
| tank-2026 / Red | `912ebdf6-014d-49f6-81df-fe504dff96cb` | elimination win | 2 tanks / 92 HP | 535 | 16 / 16 |
| live-holdout-01 / Blue | `415e4561-8db1-4e94-b7a4-f2866ba0b010` | elimination win | 2 tanks / 92 HP | 331 | 18 / 18 |
| live-holdout-01 / Red | `2eb5bf3e-c506-486b-940b-565605489ddd` | elimination win | 1 tank / 90 HP | 249 | 18 / 18 |

94 actual model requests, zero errors. One applied choice differed from pure search
on the same snapshot. Each model team dealt 200 HP damage. Match wall time was
17.7–21.5s. Delays adapted across 1–4 ticks. These are observed realtime wins, not
latency-free replays; they still do not establish reliable general superiority or
that a newly trained model outperformed search.

## Private evidence

Under `~/.cache/study-room/jev-evaluation/` (not committed or uploaded):

- `planner-native-development-20260921-150712/`
- `planner-search-holdout-20260921-151057/`
- `planner-native-holdout-20260921-151108/`
- `planner-legacy-holdout-20260921-151142/`
- `planner-realtime-20260921-151728/`
- `matches/<above-match-id>.json`: ordinary automatic privacy-filtered archives.

Native labs fsync the actual request/result/choice per call. Manifests predeclare
maps, sides and budgets. Live runs save start receipts, full records and summaries.
Nothing is silently retried or replaced on failure. Total native calls in the
reported development/holdout/realtime runs: **506**, all local FP32; zero cloud.

## Verification and next limits

- `tests/jev-arena-planner.test.js`: profile validation, shared reload contract,
  bounded/public-state forecasts, engine reconstruction parity, legal joints,
  exact score preservation and invalid-score rejection, injected model influence,
  async cancellation/event-loop liveness, actual provider contract, manager/export
  audit and paired development smoke (the latter explicitly search-only).
- `tests/jev-arena-planner.browser.js`: injected-score UI/worker fixture, no GPU or
  cloud; new profile, local-only gate, actual request/audit display, separate score
  meanings, stop/export and mobile width.
- Final Node regression command: `node --test tests/jev-arena*.test.js
  tests/jev-local-unlimited.test.js tests/jev-copilot*.test.js` — **163 passed,
  2 skipped, 0 failed** (165 total).
- Four injected-score browser suites passed: planner, tactical-v2, attack-utility
  and independent-step scheduling. They made no GPU/cloud inference calls.
- `git diff --check` passed. Existing user changes were retained; no commit or
  model-service restart was performed.

Unresolved: opponent-model error, limited 24-tick horizon, no guarantee against
cycles or unseen opponents, worker overhead, and little demonstrated benefit from
native preferences over search. A worthwhile next stage is training a joint-plan
value/ranking head from search/self-play data, with independent evaluation against
this **same** planner and not only the old attack baseline. No such training is
claimed in this change.

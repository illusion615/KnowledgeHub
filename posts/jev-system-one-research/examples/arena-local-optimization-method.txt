# Local NanoJev/Laya optimization cycles 02–06 — 2026-09-23

## Scope and stopping rule

This follows cycle01's negative evidence rather than relabeling v3 as best.
The user requested actual iterative optimization for both local model families.
The active arena selected NanoJev FP32 and Laya typed-decisions, so these exact
checkpoints—not multilingual Laya or 4-bit NanoJev—were fixed for this series.
No cloud requests, retries of model failures, warmup calls, training or weight
changes were used. Synchronous simulations compare each model-assisted controller
against the fixed rule-attack-v1 opponent. This is not model-vs-model realtime
performance and cannot prove a global best combat policy.

Per-checkpoint gate, frozen before trials: no fewer elimination wins; no more
losses, caps or own deaths; no slower total ticks among paired common wins;
require a strict quality improvement. Caps are not HP-lead wins. More damage at
the cost of deaths is a tradeoff, not a pass. Timing alone cannot promote.

## Changes investigated

1. **Build-scoped computation cache:** exact reusable firing-distance matrices
   and risk-weighted routes, keyed by relevant public geometry, alive tanks,
   cooldown/power state, own HP/shield and route weights. Fresh live enemy objects
   and closures are never cached. Cache is bounded to 512 entries and discarded
   after the synchronous build, including on exceptions. Tests compare cached and
   uncached planner scores, inputs, decisions and unchanged snapshots.
2. **anti-cycle-v1:** drop the +4 per-tank root-route prior and raise repeat cost
   from .25 to 2. More aggressive; increases deaths in actual held-out episodes.
3. **survival-anti-cycle-v1:** additionally screen by worst predicted own survivor
   count. Failed the CPU-only screen and received no model calls.
4. **neutral-route-v1:** isolate dropping the root-route prior, leaving .25 repeat
   cost. Also failed its CPU-only survival gate; no model calls.
5. **stagnation-rescue-v1:** conditional intervention only. If the original search
   leader has repeat-visit sum >=3 and predicts at most 12 damage under either
   opponent rollout, remove route bias and use repeat cost 2, restricting roots
   to at least the incumbent's minimum predicted own survivors. Otherwise retain
   original v3 scoring. This is an application heuristic, not a safety guarantee.

All model episodes use the previously proved bounded-gap invocation policy.
Skipped judgments are `application_certified_search`, never fake model results.
Actual uncertain judgments still call the selected checkpoint and use its raw
Boolean/Noul scores. No fallback to another model or gold-label repair.

## Executed work and accounting

Public machine-readable evidence:
`posts/jev-system-one-research/examples/arena-local-optimization-evidence.json`.
Private runs and frozen source copies:
`~/.cache/study-room/jev-research/20260923-local-optimization-{02,03,04,05}/`.

- 28 CPU-only screening games.
- 56 completed actual-model episodes (including the fixed confirmation batch).
- 1,220 real local requests, 402 actual certified skips.
- 2,508,822 local input tokens; these are compute accounting, not cloud currency.
- One additional interrupted Laya episode: five successful requests before a
  user started a match. It remains unscored but its cost and raw receipts remain.
- No cloud calls. No runtime/weights substitution. Model identities and hashes
  are copied from the actual provider receipts into the public summary.

These are repeated paired trials, not 40 independent maps. Models can diverge
from the pure-search trajectory; code always simulates their returned choices.

## Cycle 02: global anti-cycle candidate rejected as a universal winner

CPU screen: 4/4 elimination wins vs 2/4 plus two caps, equal deaths. Real-model
development looked promising but NanoJev traded an extra death for eliminations.
The unchanged candidate was then tested on two fresh boards with both sides.

| Checkpoint / holdout | Original wins / caps | Candidate wins / caps | Original → candidate deaths |
|---|---|---|---|
| NanoJev FP32 | 3/4, 1 cap | 3/4, 1 cap | 1 → 3 |
| Laya typed-decisions | 2/4, 2 caps | 4/4, 0 caps | 0 → 3 |

Both fail the preregistered survival gate. Laya also takes slightly longer on
common-win pairs (284 → 293 total ticks). Do not lower the gate after seeing this.
Calls: 519; certified skips: 193. All results retained, no automatic promotion.

## Cycles 03 and 04: reject cheaply before model calls

Previously inspected cycle02 failures explicitly became development data.
Global survival filtering (03) and unconditional route-prior removal (04) both
increased own losses/deaths during CPU-only screening. They were rejected without
spending additional model requests. Their uninspected proposed holdouts were not
run and are not reported as passing.

## Cycle 05: conditional rescue promising, strict generalization unproven

CPU screen on two known development maps: 4/4 wins, no deaths, versus 1/4 wins,
three caps and no deaths. Repeated-visit sum falls 567 → 109. Freeze this trigger
and its coefficients before model testing.

| Checkpoint | Development original → candidate wins | Deaths | Fresh holdout original → candidate wins | Deaths |
|---|---|---|---|---|
| NanoJev FP32 | 1/2 → 2/2 | 0 → 0 | 2/2 → 2/2 | 0 → 0 |
| Laya typed-decisions | 1/2 → 2/2 | 0 → 0 | 2/2 → 2/2 | 0 → 0 |

For each model, development repeated visits fall 207 → 43 and model calls
55 → 47. Common development win ticks remain 104. On the fresh holdout, results,
actions and common-win ticks tie: NanoJev 237 total ticks, Laya 225. The rescue
trigger never fires there. This supports absence of regression in that sample,
not a strict held-out improvement or best-state claim.

### User interruption and append-only continuation

The user started a live match partway through the eighth development episode.
The research loop stopped at admission without interrupting the user or submitting
another inference. Seven completed episodes were preserved; the partial eighth
has five real requests recorded. After idle admission returned, only the missing
episode was replaced in `model-development-continuation-01`, with the original
frozen source tree and remaining original call budget. No completed episode was
rerun; no failed model response was retried. Combined-result hashes bind the
review before holdout, while the original incomplete directory remains intact.

Tools: `scripts/jev-arena-local-optimization.js` and
`scripts/jev-arena-local-continuation.js`. Both refuse busy gateways and record
failures. Continuation rejects model errors; it is only for user-admission
interruptions and uses a new segment directory rather than overwriting results.

## Fixed confirmation batch: completed, superiority not established

The first holdout did not exercise rescue. A single additional batch was
preregistered **after observing this tie**, with two new maps, both sides, both
checkpoints, original/candidate pairs, and at most 384 local calls. Code and
coefficients remain cycle05's frozen source. This is disclosed follow-up, not a
formal original untouched-test significance claim. If mixed or tied, do not keep
adding maps until a favorable result appears.

Plan: `examples/arena-local-confirmation-plan.json`.
Harness: `scripts/jev-arena-local-confirmation.js`.
The first admission attempt was blocked by a new user match **before creating the
confirmation output or making any request**. Once idle, the unchanged batch ran
all 16 episodes with 346 requests and 96 actual certified skips.

| Checkpoint | Original → candidate wins | Caps | Deaths | Common-win ticks |
|---|---|---|---|---|
| NanoJev FP32 | 3/4 → 3/4 | 1 → 1 | 1 → 1 | 338 → 338 |
| Laya typed-decisions | 2/4 → 2/4 | 2 → 2 | 0 → 0 | 210 → 210 |

Again, rescue never triggered; actions and quality metrics tie. **Neither model
has a strict out-of-sample improvement.** This fixed batch is now complete; no
further maps are appended to force a pass. The series stops without claiming a
best combat state or promoting the conditional policy. Exact computation reuse
and certified invocation remain independently tested runtime techniques.

For reproduction only, when the user's match is idle (use a fresh output):

```sh
node scripts/jev-arena-local-confirmation.js \
  --plan posts/jev-system-one-research/examples/arena-local-confirmation-plan.json \
  --source-cycle "$HOME/.cache/study-room/jev-research/20260923-local-optimization-05" \
  --output /tmp/new-confirmation-reproduction \
  --consent-local
```

If the directory exists after an interrupted run, do not overwrite it or blindly
rerun the command. Inspect admission/model error receipts and remaining budget.

## Practices learned

- Model-specific episode tests are necessary; sampled schema success is not
  survival/kill efficiency. Identical application coefficients can affect the two
  models differently.
- Screen obviously regressing candidates without a model before spending calls.
- Do not globally punish tactical revisits: cover, reload and recovery can need
  them. The useful target is low-value repeated behavior, not all revisits.
- Treat terminal forecasts, role priors and repeat costs as interacting parts;
  preserve rejected one-factor and compound ablations.
- Exact per-build reuse and proven score-insensitive skips are safer efficiency
  gains than guessed confidence thresholds or cross-state caches.
- Preserve user-owned workloads and stopped experiments. Append new segments;
  count incomplete cost, never duplicate completed trials as new evidence.
- A promising development result plus tied, non-triggering held-out and
  confirmation batches is not proof of global optimality. Freeze, confirm within
  a fixed budget, then stop without promoting rather than adding tests until a
  favorable result appears.
- Further research should investigate why predicted damage repeatedly fails to
  materialize: receding-horizon continuation, actual-vs-predicted opponent moves,
  persistent targets and forecast calibration, using new hypotheses and fresh
  test maps. Do not simply loosen the current trigger on inspected test data.

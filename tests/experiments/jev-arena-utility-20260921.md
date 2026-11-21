# Native utility readout and rate-admission fairness — 2026-09-21

## Baseline evidence and scope

User match `82980288-d231-4b57-94fa-9860d350a3ff` used `tank-engage-first-v1`,
FP32 Blue versus the non-model attack baseline Red. It ended by elimination at
29,533 ms. FP32 completed 20 requests, 31 moves, 9 blocked moves, **zero firing
attempts and zero damage**. Twelve tank-level decisions had a geometrically clear
shot but selected movement (all listed reload values were zero). The model spent
11,855 ms in application rate wait while the rule opponent remained active.
This is both a decision-quality issue and a quota-related outcome confound.

The diagnostic was retrieved directly, without requiring another pasted report:
`~/.cache/study-room/jev-evaluation/20260921-offense/baseline/`.
All further evidence below is under the same private `20260921-offense/` directory.
No checkpoint weights, dtype, oMLX application files or training were changed.
There were no cloud inference calls, retries, automatic warmups or fallback models.

## Fixed-input experiments, including failures

The recorded source indices 7, 22 and 26 contain unused shooting opportunities
and allied blocking. These are DEVELOPMENT inputs, not held-out examples.

- `encoding-dev/`: original, compact, and compact-with-neutral-action-keys; nine
  real FP32 calls. Neither compact variant selected a shot. Neutral action IDs
  alone did not solve the problem.
- `canonical-dev/`: three real FP32 calls, removing absolute coordinates and
  named tank IDs from the compact question text. Flat Choice still did not fire.
- `boolean/receipts.jsonl`: three all-Boolean native probes. The initial question
  formulation still returned false for valid firing opportunities.
- `boolean/formulations.json`: twelve propositions in one native call. Merely
  changing the controlled ID from B1 to B0 in one formulation (with the same
  shot facts) changed the observed score from about .550 to .276. This establishes
  sensitivity in that formulation, not a universal causal explanation.
- `boolean/canonical.json`: eight anonymous positive/negative propositions in
  one call. Clear-shot propositions returned true; no-shot propositions false.
- `utility-dev.jsonl`: three per-action Boolean-utility calls. Valid shots ranked
  above movement, but blocked movement could also receive a high score. This
  prototype was NOT deployed as-is.
- `move-facts.json` and `stagnation-facts.json`: two development calls comparing
  faithful descriptions of movement effects. The final descriptions were chosen
  during development; their later use is not an independent prompt test.

These experiments use the native Boolean head and the same offline checkpoint,
not a chat model or generated explanation. The original flat Choice path is
still available. We did not prove that identifiers, verbosity or the decision-set
head alone caused all of the original behavior; the final variant changes several
aspects together.

## Deployed opt-in variant

`utility-attack` / `tank-utility-joint-v1` uses:

1. The same public captured world, with disclosed geometry/BFS assistance.
2. Feasible action eligibility before scoring, including valid firing geometry.
3. Anonymous, short **effect propositions**, one native Boolean question per
   offered action. Transport IDs bind results back to tank/action but are not
   tokenized by the native encoder.
4. The unchanged native `p_true` scores as relative utilities—not a categorical
   distribution or calibrated correctness probability.
5. A disclosed maximum-sum readout over preconstructed joint plans that avoid
   allies moving into the same destination. No manual attack bonus, probability
   normalization, fitted cutoff or rule-selected attack order is substituted.

`utility_trace` records the actual wire request, mapping, admissible plans, raw
Boolean outputs, independent per-tank argmax and readout. `request` is labeled
`logical_action_contract`, so it is not confused with the actual model text.
Fully trapped/no-feasible-joint-plan fallbacks are explicitly flagged, since the
existing game contract has no wait action. They are not claimed as legal progress.

**This is an assisted model-scoring/controller pipeline, not new learned strategic
knowledge in the original weights.** Many different board states map to identical
short effect phrases. Geometry and path computation come from the application.
The model supplies real scores, but this is not an unaided map/planning benchmark.

## Independent board checks

`utility-independent/` contains ten real local calls: five newly specified board
states, each evaluated with FP32 and 4-bit. Both models selected:

- shorter firing-position routes on the new approach map;
- actual firing in the clear-shot case;
- firing at shielded targets;
- distinct advancing destinations in the ally-contested case.

In the lethal-choice case, both selected a valid ordinary-damage target instead
of the available 4-HP kill. **Finishing off weak targets remains suboptimal.**
These boards were independent of the development boards, but their compressed
text/effect categories overlap; do not describe this as disjoint textual
holdout generalization, comprehensive strategy accuracy, or a win-rate estimate.

## Rate-admission correction

The UI now offers `pause-world` (default) versus the old `continue-world` policy.
During application quota waits, pause-world freezes physics for both sides, not
just the model that has exhausted admission. It does not create a barrier for
ordinary model inference in realtime mode. In-flight computations may finish
while paused; this reduces the external-quota confound, not every latency or
scheduling confound. Sync remains the full paired-response comparison.

The waiting side records `rate_wait_ms`; the other side records `rate_barrier_ms`.
The normal per-call deadline, viewer lease and Stop still operate. No RPM limit
was raised, and no failed inference was retried.

## Real live trials (same seed, swapped sides)

The assistant reused/refreshed the existing Orca page; no new user browser tab was
opened. Both trials used single-attempt realtime, `tank-2026`, unlimited UI caps,
and the new explicit utility/pause configuration. An external 90s observation
limit would have stopped each test if necessary; both ended naturally first.

| Observation | FP32 Blue vs rule Red | Rule Blue vs FP32 Red |
| --- | ---: | ---: |
| Match ID | `7b1b5538-0043-4795-a0c2-0ffcdcc16681` | `6c6f2353-7a39-473c-9308-33aa9b0f7d81` |
| FP32 requests | 21 | 17 |
| FP32 shots / hits | 19 / 18 | 18 / 18 |
| FP32 damage | 200 | 200 |
| FP32 blocked movement | 0 | 0 |
| FP32 invalid shots | 1 | 0 |
| FP32 provider mean ms (queue excluded) | 127.33 | 126.88 |
| FP32 all-in mean ms (queue included) | 2,086.81 | 126.94 |
| FP32 path tokens | 13,256 | 10,855 |
| Independent argmax changed by joint constraint | 3 turns | 3 turns |
| Trapped fallback turns | 0 | 0 |
| Simulation ticks | 99 | 90 |
| Wall ms | 60,841 | 18,086 |
| Outcome | FP32 wins, one tank / 16 HP | Both sides eliminated, draw |

Evidence files: `utility-live.json`, `utility-live-swapped.json`, plus automatic
private match archives. In the first trial, FP32 waited about **41.15 seconds**
for admission, and the rule side was paused for the same interval. It would be
wrong to call the all-in 2,086.81ms mean pure model inference latency. The second
trial had no quota pause and still produced real attacks and 200 damage.

The old log's 0 damage is not silently relabeled; the new source is
`model_utility_joint`, not the rule baseline. All shots, hits and HP changes came
from the unchanged physics, with an invalid/stale shot still recorded normally.
These results show a useful improvement on this reported scenario, **not a
population win rate or a causal attribution to one isolated change**. Inputs,
readout, eligibility, warm state and rate handling differ. Token/path counts are
local encoding counts, not dollar savings or cloud-billed token comparisons.

## Remaining limits

- The actual weights were not trained or fine-tuned. Original flat-action behavior
  is not fixed by renaming this new assisted task.
- Decision quality still depends on the application-derived effect representation;
  long-horizon tactics, threat response, finishing kills and opposing-traffic
  deadlocks need additional independent testing.
- 4-bit passed the five fixed-board checks; no new full 4-bit live match is claimed.
- The local utility mode does not silently switch Copilot into another task. Use
  the existing compatible input modes for cloud comparisons.
- Native utility scores remain uncalibrated and independent. Legal-input/joint
  constraints contribute to the zero-blocked result; that is not solely learned
  collision avoidance by NanoJev.

# Destroying enemies versus merely moving — 2026-09-20

## User evidence

Match `77a7597d-b42a-4274-8fa2-3d6631a75326`, retrieved directly to
`~/.cache/study-room/jev-evaluation/combat-review/baseline/`, used the assisted
`action-facts-v2` input, FP32 Blue / 4-bit Red, continuous decisions and unlimited
duration. The user stopped it at 33,440 ms:

- Each side completed ten model calls, nineteen successful moves and one blocked
  move. Neither attempted a shot or caused damage.
- Both sides spent about **17.36 seconds in rate admission wait**, after their
  last executed actions at tick 80 (16 simulation seconds). They were not
  continually thinking or moving throughout the remaining wall time.
- Blue B0 entered a dead end and backtracked; B1 revisited a small loop. Red also
  reversed attack progress. Favoring unvisited cells/Manhattan distance did not
  yield a useful attack strategy.

The objective must be enemy destruction, with valid damage and reaching a firing
position as intermediate progress. Movement success alone is not success.

## Real native prompt experiments — not promoted

Sixteen new local NanoJev calls were explicitly bounded and recorded under
`~/.cache/study-room/jev-evaluation/combat-review/`:

- `development/`: four calls using an experimental BFS-assisted attack prompt.
- `known-regressions/`: six calls on already-known cycle-exit, necessary-return
  and clear-shot states. These are regression cases, NOT fresh holdouts.
- `attack-priority/`: six calls with an explicit kill → damage → approach
  hierarchy and no novelty objective, retaining the older action facts.

The BFS prompt exposes shortest move count to **any valid firing cell**, treating
walls/live tanks as obstacles and freezing other tanks at the input snapshot.
It retains all candidate keys, explicitly identifies itself as planner-assisted,
and never repairs returned choices. Conditional shot damage accounts for shields
and the first enemy intercepted by the actual projectile. It is not a guarantee
that a moving target will be hit.

Results were inadequate: 4-bit selected ineffective shots in development, and
**both models still selected movement in the clear-shot regression**, for both
prompt variants. A stronger goal statement did not establish native combat skill.
These prompt variants remain lab-only. The live raw/action-facts tasks were not
silently relabeled or replaced with a failing new prompt or an external solver.

## A separate executable rule control

`Rule Attack Baseline · Not a Model` is now separately selectable. It uses the
public snapshot to choose one-attempt actions with the following priorities:

1. Valid shots: destroy an enemy, then maximize HP damage, then shield damage;
   break remaining ties toward the lower-HP target.
2. If no valid shot exists, minimize BFS distance to a reachable firing cell.
3. Coordinate ally destinations, avoid immediately repeating failed moves, and
   use visit count only to break equal-route ties—not as an exploration reward.

It does not call a model, consume model-rate allowance, use opponent pending
orders, or replace any NanoJev/Copilot return. Every row is marked
`decision_source: rule_attack_baseline`, with `rule-attack-baseline-v1` identity
and a structured `policy_audit`. The UI shows rule evaluations and no probability
bars for this source. All physical rules/cooldowns and one-attempt semantics
remain intact; a blocked/invalid rule action still fails normally.

Pure deterministic **non-model** simulations eliminated at least one side on
`tank-2026`, `attack-a`, `attack-b` and `attack-c` within 99 ticks. On `attack-d`,
a 1,000-tick exploratory simulation still had survivors/contested moves after
both sides caused 100 damage. The rule control is **not globally optimal and is
not guaranteed to terminate every map**. This negative result is retained here.
Browser regression independently runs this controller without any model services,
verifying actual projectiles, hits, HP loss, elimination, audit export and mobile
layout. These checks prove rules/UI behavior, not learned-model performance.

## Real FP32 versus disclosed rule baseline

A single mixed match, capped by **30 seconds duration**, used the same `tank-2026`
seed, single-attempt realtime, original `action-facts-v2` model input, FP32 Blue
and the rule baseline Red. Native orders were not corrected.

Evidence: `fp32-v-rule.json` / `mixed-diagnostic.json` in the private directory;
match **`ae5595c2-ce15-4aea-8a37-371436745a86`**.

| Metric | FP32 Blue (real model) | Red rule baseline (not a model) |
| --- | ---: | ---: |
| Completed evaluations | 19 | 22 |
| Actual shots | 0 | 22 |
| Hits | 0 | 19 |
| HP damage | 0 | 200 |
| Blocked moves | 11 | 0 |
| Invalid shot attempts | 0 | 2 |
| Mean evaluation wall ms | 432.47 | 0.91 |

At **20,904 ms**, Red won by elimination: Blue 0 survivors/0 HP; Red 2/200 HP.
The two ineffective rule triggers are retained, not repaired: snapshot geometry
can change before the action executes. This is a rule-controller win, **not a
NanoJev improvement or a model-v-model speed ranking**. Policy and latency both
differ. There were 19 real local model calls in this mixed trial and zero cloud
calls. Rule-controller evaluations are not added to model-call totals.

Post-hoc diagnostics found **16 tank-level choices with an available geometric
shot that was not selected**, and nine moves increasing the frozen-world BFS
route to a firing position. These observations expose the attack issue, but are
not labels of tactical optimality: cooldown, incoming bullets and future motion
can justify some movement. They do not establish a calibrated accuracy metric.

## What remains unsolved

The game can execute meaningful attacks and destruction. The present NanoJev
weights/input combination still fails to prioritize combat even when the enemy
actively approaches. Neither prompt experiment established a reliable fix. A
separate rule baseline makes that failure inspectable rather than hiding it with
autopilot or fabricated combat. No weights, training, automatic cloud fallback,
model-selection defaults, or unlimited-duration controls were changed.

# Tactical wait / resource roles v3 — 2026-09-23

## Request and implementation

Add bounded tactical waiting (reload/ambush), not idle camping; relate shield,
power and repair to assault, prompt damage, recovery and allied fire support.

New UI matches explicitly send `planner_revision: resource-tactics-v3`.
Absent revision still runs v1, and `resource-terrain-v2` still runs v2.
Ballistics remain v7; **action semantics change** under the v3 planner protocol.
Raw-map mode still has no wait. Do not describe raw/v3 as only an input or model
swap. Same-revision search-only remains the controlled model-ranking ablation.

- `arena-core.js`: v3 wait lasts exactly four ticks from installation, regardless
  of the global move-phase boundary. No move/auto-fire; cooldown and projectiles
  still advance. Completed `wait_actions`, active `tactical_wait_ticks`, and tank
  `wait_streak` are separate from transport/queue waits. Stop cancels the match;
  the action never waits indefinitely for a signal or model.
- `arena-tactical-policy.js`: v3 role/objective selection; old v2 policy preserved.
  HP <=35 prioritizes reachable repair (lethal shots can still dominate). Active
  power prioritizes firing and approach over more supplies. Shield >=12 at higher
  HP lowers route exposure cost and raises approach value. A healthy unbuffed
  ally considers support fire/positions against threats to a buffed or wounded
  teammate. These are stateless snapshot roles, not persistent learned teamwork.
- Wait candidates need a reload-position or possible one-move enemy-entry ambush
  rationale (public geometry only). A ready clear shot, an active ready power
  window, urgent reachable repair, or two consecutive completed waits disallows
  ordinary waiting. Trapped tanks are exempt from the repeat limit.
- `arena-planner.js`: same actual-engine 24-tick opponent rollouts. Root wait cost
  is `3 * (1 + wait_streak)` per waiting tank; rollout cost is `.75` per waiting
  tank-tick. A wait plan must exceed the best friendly-lane-safe nonwait plan by
  2 application points. If no roots satisfy this gate and no safe nonwait root
  exists, retain least-bad roots with `no_admissible_alternative`, not a false
  optimality claim. No post-model repair or secret rule fallback is added.
- Early enemy HP damage minus incoming enemy HP damage gets a disclosed `.25`
  horizon-weighted tempo contribution; early hits count slightly more than late
  ones. Actual HP, casualties, shields and friendly-fire costs remain dominant.
- Logical candidates rise to at most seven per tank / 49 joint roots; model
  shortlist stays at most six. Diagnostic exports retain index 48 without silent
  truncation or remapping. All Laya inputs still pass strict preflight.
- HUD labels show **application roles**, and actively waiting tanks have a Wait
  badge. Request/trace records preserve wait reasons, costs, gate, role, focus
  enemy, ally, and chosen action separately from the route reference.

## Verification (no inference)

11 development tests: exact wait duration; cooldown/no auto-fire; damage during
wait; old protocols; no unproductive/repeated wait; repair priority; shield and
support roles; powered shot urgency; public wait history vs hidden pending orders;
beneficial-wait fixture; 49-root diagnostic preservation; admission/cost arithmetic.
Tests share some cases within one test entry; not a quality-accuracy denominator.

A development-discovered scene (`wait-check-2`, 20 ticks of continuation) selects a
wait with sufficient forecast advantage; do not call this held-out evidence.

Four new eight-round search-only micro-matches (both sides v3) ran 128 tank
commands: 123 moves, 5 shot attempts, 0 waits, no blocked moves, 14 pickups and
24 enemy HP damage. They stop by a fixed budget and establish neither tactical
superiority nor a full-game anti-camping guarantee. Lack of waits in this smoke
is not evidence that the new action is disabled: the separate fixture tests its
admission and engine execution.

Both Laya tokenizers preflighted all 64 resulting planner payloads (344 Boolean
questions each), longest sequences 366 multilingual / 349 typed-decisions tokens.
No model weights were loaded and no forwards/cloud calls were dispatched.
Public aggregate: `examples/arena-tactical-wait-validation.json`.

Remaining limits: guessed enemy policies, finite horizon, exposure/arrival
heuristics, no persistent roles, no held-out full-match quality experiment,
and no demonstration that adding model ranking beats this same search-only
controller. Gains here are application code, not model training.

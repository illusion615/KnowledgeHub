# Persistent intent v4 and chassis/track correction — 2026-09-24

## Implemented behavior, not another proposed coefficient

New-match UI explicitly selects `persistent-intent-v4`; v1/v2/v3 records keep
original behavior. Ballistics remain v7; this revision changes application control,
not bullet speed, damage, collisions or model weights.

`arena-intent.js` separates three lifetimes:

1. **Goal:** retain a target enemy or resource destination across decisions.
   Choose reachable firing-route cost rather than just Manhattan distance.
   Reconsider when the target/resource disappears, low health changes priority,
   a shared attack target changes, the goal review reaches 80 ticks, or there is
   no actual route/team combat progress for 24 ticks. Merely changing position
   does not reset progress: completed waypoints must beat best remaining distance,
   or actual enemy HP/shield loss must occur. No-resource low HP does not cause a
   new identical recovery goal on every call.
2. **Route:** retain waypoints while the goal and firing destination remain valid.
   Trim completed waypoints from authoritative tank positions. Replan on blockage,
   terrain change, leaving the route or losing the destination's firing line—not
   merely because a slightly different equal-value route is found.
3. **Action:** after a selected model/search plan matches a disclosed route move, allow
   at most TWO additional route moves over a 24-tick approval lease. Revalidate
   each next move for occupancy, known projectiles, increased exposure, new ready
   shots, low health, goal validity and allied destination conflicts.

If all living teammates can follow, the manager executes the approved actions
without a new rollout or model call, model-admission charge, or managed GPU-lane
wait. These rows are explicitly
`application_route_follow`, with zero model-request/token usage and no fabricated
model scores. If only one can follow, its move is fixed in the next joint input;
other actions still need scoring (`model_with_route_constraints`). New threats
invalidate fixed orders before installation, marking the discarded receipt rather
than repairing its action. Stop/lease/budget protections remain in force.

The model prompt discloses the goal, the next-three-cell prefix, fixed actions and
conditional two-step continuation. Rollouts simulate the same bounded continuation
and guards; they do not assume an unlimited autopilot. No enemy hidden orders or
opponent private route memory are read. Unmatched model moves never silently arm
a route. The full long route remains inspectable, but only its bounded prefix is
approved for automatic execution.

HUD shows goal age, goal/route replan counts, route execution count and a zero-model
label for continuation steps. Diagnostic exports preserve intent, invalidation
reasons, source attribution, fixed actions and lease limits. Path overlays follow
the latest applicable intent record and replay time, not future decisions.

## Realized-progress sensor

The earlier sampled failure held enemy HP at 94 while forecasts repeatedly
promised 24–48 damage and selected moves. `arena-progress.js` consumes actual
engine damage events (including shields), not planner outcomes. After 16 ticks
without realized enemy loss it can retain an attack goal, until its target dies,
the designated attacker becomes low-health or a 48-tick review is due.

The v4 planner uses that measured goal to prefer a ready root attack when a
survivor-preserving, friendly-lane-safe option exists. Otherwise it records that
no such ready attack exists and keeps re-evaluating safety. A nonzero predicted
future-damage number cannot reset the actual-progress clock. Simulation worlds
never inherit the sensor as if predicted hits were observed events.

This is a finite application control contract, not a proof of globally optimal
combat or actual survival. Goal/route expiry and reactive replanning remain
necessary. Support roles and opponent assumptions are still heuristic.

## External resources consulted

- Jeff Orkin, **Agent Architecture Considerations for Real-Time Planning in
  Games**, AIIDE 2005:
  <https://cdn.aaai.org/AIIDE/2005/AIIDE05-018.pdf>.
  Working memory, event-driven perception, goals and action execution have
  distinct roles; changed facts invalidate plans, and costly path/ray results
  can be cached. Used to guide persistent goal/route state and explicit guards.
- Stephen Boyd, **Model Predictive Control**, Stanford EE364b notes:
  <https://web.stanford.edu/class/ee364b/lectures/mpc_slides.pdf>.
  Finite-horizon plans are not the same as their executed first action. This
  motivates separating promised rollout gains from observed progress. The
  linear/convex MPC results are NOT guarantees for this adversarial grid game.
- RoboWiki, **Linear Targeting**:
  <https://robowiki.net/wiki/Linear_Targeting> and **GuessFactor Targeting Tutorial**:
  <https://robowiki.net/wiki/GuessFactor_Targeting_Tutorial>.
  They distinguish current target location, flight-time prediction and observed
  outcomes. Lead aiming / learned aiming profiles were considered, but NOT
  implemented here: changing aiming physics would confound this control fix.
- GDC 2006 metadata corroborates Orkin's talk, **Three States and a Plan: The AI of
  F.E.A.R.** <https://www.gdcvault.com/play/1013282/Three-States-and-a-Plan>.
  Consulted page description, not a claim to have watched the full talk.

Retrieved 2026-09-24. Red3D pages returned unusable short responses and were not
used as evidence. An initially guessed AAAI PDF path resolved to an unrelated
speech-understanding paper; its title was checked and it was discarded. No
external code was copied into the implementation.

## Track/chassis rendering bug

Previously tracks and chassis were always drawn vertically, while only the gun
rotated. `arena-renderer.js` now uses local +X as hull-forward; two tracks run
parallel on the two sides of that axis. Hull and tracks rotate together using
actual movement history. The turret has an independent aim angle. Health bars
and tank IDs remain upright. This is rendering only: no collision boxes, heading
rules, bullet trajectories or authoritative positions change.

## Validation

- `tests/jev-arena-intent.test.js`: persistent goals/waypoints, two-step lease,
  obstacles/threats/shots/health interrupts, resource invalidation, no unapproved
  movement, serialization and disclosed rollout contract.
- `tests/jev-arena-intent-manager.test.js`: real worker/manager with injected
  scoring, automatic route steps perform no evaluation or rollout, correct export
  provenance, counters, explicit v4 config, legacy v3 retention and Stop.
- `tests/jev-arena-intent.browser.js`: real HTTP/UI with injected scores, visible
  goal age and zero-model continuation, path toggles, JSON export and mobile.
- `tests/jev-arena-hull.test.js` and `tests/jev-arena-hull.browser.js`: four movement
  directions, independent turret aim, actual desktop/mobile canvas rendering.
- `tests/jev-arena-progress.test.js`: measured-vs-predicted separation, actual
  damage updates, snapshot transport and known-loop counterfactual. The original
  one-shot progress prototype's six-shot observation remains in its fixture;
  latched-goal behavior uses five shots for the same 48 damage over 32 ticks.

These checks establish implementation/contract behavior, not broad tactical
superiority. A verbose initial request was rejected by NanoJev's 512-token cap
before forward execution. After rewriting duplicated prose into a complete,
explicit compact field contract (not truncating input), 16 tokenizer-only cases
per checkpoint reached 386 NanoJev / 381 Laya typed tokens at most. No limits were
raised. The replacement smoke made TWO successful model calls total, one per
checkpoint; each then completed a two-tank route-continuation decision without
another search or model call. The failed initial attempt remains recorded.

Bounded receipts are separately summarized in
`examples/persistent-intent-validation.json`; do not reuse earlier v3 victories
as v4 performance evidence. Further edge-guard tests cover approval expiry at
installation and oscillation not counting as actual progress.

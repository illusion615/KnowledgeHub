# Resource/terrain planner v2 — 2026-09-23

## Motivation and attribution

The prior planner used a 24-tick actual-engine rollout, but its continuation mostly
minimized distance to firing range. Evasive continuation rewarded resources only
on an immediately adjacent move. It lacked explicit longer resource routes,
need-based ally allocation, and reload-cover/counter-fire objectives.

`arena-strategy.js` now supplies **application heuristics**, not learned tactics:

- Missing HP (repair capped at +30), missing shield (set to 30), and useful power
  windows (+8 damage per shot, six-tick period, 30-tick duration). Existing buffs
  and travel from a pickup to firing range reduce power benefit.
- Weighted shortest paths: one per movement step plus visible-enemy exposure;
  low effective HP increases exposure cost. Living tanks block routes.
- Wounded tanks reserve resources first; one resource cannot be assigned to both
  allies. Next destinations are also reserved. Enemy wall-path arrival estimates
  discount contested resources; these are heuristics, not future knowledge.
- On reload / under low-health exposure, look for nearby covered cells within two
  steps of a firing cell. After leaving exposure, replan toward counter-fire.
- Continue checking existing projectile risk and friendly-fire lanes. Root plans
  still run through actual engine physics; model orders are never repaired.

Root actions matching the route reference receive a disclosed **+4 per tank**
application prior (maximum +8 for two tanks). This is not a probability, a learned
weight, or an optimality guarantee. The original model contribution remains
`12 * (preference - .5)`. Search-only and model-ranking sides use the same revision.

During development, a terminal bonus for remaining power encouraged delaying a
nearby pickup to retain more buff at the horizon. That bonus was removed from the
search value. Buffs contribute through actual simulated damage; the remaining
usable-power estimate is diagnostic only. A regression checks immediate useful
shield/power acquisition in a fixed open-map scene.

## Versioning and diagnostics

New-match UI sends `planner_revision: resource-terrain-v2`. Historical requests
without this field retain v1. Physics remains v7; strategy version becomes
`tank-planner-friendly-fire-v2` (or `tank-opponent-rollout-v2` under explicit legacy
v6 physics). Snapshot, worker, task protocol and private report preserve revision.

`strategy_reference` records proposed role, resource type, route, distance,
exposure, benefit and first action. It is a heuristic continuation reference,
**not the chosen model order**. Audit records expose the route prior, pickup counts
by type, search-only plan and model contribution separately. Moving away from a
firing cell can be intentional cover/resupply; diagnostics retain that context
without declaring the move correct.

## Verification and limits

Seven deterministic development tests cover wounded retreat, avoiding useless
repair/shield/buff refresh, finite buff range, distinct ally resources, reload
cover and counterattack access, obstacle-aware detours, unreachable resources,
full-rollout useful pickups, non-mutating snapshots and v1 compatibility.

A separate tokenizer-only check covers 32 v2 inputs per checkpoint: four seeds,
initial / 32-tick progressed states, both sides and zero / six-tick delays under
v7 physics. No weights or forwards are used; every actual request still preflights.

The earlier four real Laya requests in `examples/laya-planner-validation.json`
were **v1 adapter tests**, not v2 strategy evidence. This update makes no further
cloud or local model calls. No matched, held-out full-match win-rate improvement
has been established. Replanning has no persistent cross-round role memory;
static threat costs and arrival estimates can be wrong as opponents move.
Long-horizon strategy, flanking coordination and general tactical superiority
remain unverified. Defaults are not proof of optimality.

Commands:

```sh
node --test tests/jev-arena-strategy.test.js tests/jev-laya-planner.test.js
node --test --test-concurrency=4 tests/jev-*.test.js
node tests/jev-arena-planner.browser.js
node tests/jev-model-switch.browser.js
node tests/verify-change.js --article jev-system-one-research --level L2
```

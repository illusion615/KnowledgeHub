# Friendly fire and joint firing-lane checks — 2026-09-21

## Version boundary

- New physics: `tank-v7-friendly-fire`, API ruleset `friendly-fire`, step only.
- New planner protocol: `tank-planner-friendly-fire-v1`.
- v5/cardinal and v6/tactical retain friendly transparency for old experiments
  and explicit comparisons. Old recordings are never interpreted as v7.
- Selecting opponent-rollout planning in the UI now selects v7. The user can
  explicitly switch its ballistics back to v6. No active match is upgraded.
- Model weights, precision, limits and model services were not changed. This
  iteration used **zero real model/cloud calls**; scores in tests are injected.

## Physical and accounting changes

`arena-geometry.js` detects the first living tank along a swept projectile
segment regardless of team in v7. The projectile is consumed there. The shooter
is ignored only for the launch segment (`life === 6`), not forever. This exemption
also applies to forecast-generated bullets, which now preserve their owner.
Walls still win coincident collision ties; diagonal walls/corners remain closed.

`arena-core.js` applies ordinary shields/HP to friendly hits. Enemy hit counts
and HP damage exclude friendly fire. New counters:

- `friendly_hits`: number of actual friendly projectile contacts;
- `friendly_damage`: actual capped friendly HP damage;
- `friendly_shield_damage`: actual friendly shield depletion.

Damage remains simultaneous. If friendly and hostile rounds hit the same tank
on a tick, total HP/shield damage is capped once and allocated proportionally
according to raw incoming damage. Example: friendly 12 + hostile 20 against
10 shield / 10 HP produces friendly 3.75 shield + 3.75 HP, hostile 6.25 shield +
6.25 HP. Reordering bullets does not change these values. Friendly damage must
not increase the opponent's effective-damage statistic.

The HUD now exposes friendly-damage counters. v7's top-corner battle count is
labeled **Enemy Losses**, not credited kills, because an enemy might die from its
own team's shots. Friendly impact endpoints stop projectiles visually; damage
labels include a friendly-fire indication. Native model scores remain separate.

## Avoidance assistance (before scoring, not after an action returns)

1. Shared shot/BFS facts reject firing positions where an ally is the first
   tank on the ray. Raw/action-facts input can still expose unsafe fire with a
   warning. This affects both model and baseline under the same rules.
2. Every planner joint root gets a separate actual-engine lane forecast, including
   existing bullets of either side, the proposed friendly shots, reload and the
   exact four-tick movement phase. Horizon: estimated decision delay + 12 ticks.
   Opponent positions are frozen, with no new enemy orders in this lane check.
3. If any root has zero predicted friendly contacts, only those roots can enter
   the six-plan model shortlist. All rejected roots and their collision counts/
   HP/shield losses remain in the audit.
4. If none is safe, `no_safe_plan` is true and the ordinary rollout ranking is used;
   no wait, output repair, baseline substitution or fabricated safe action occurs.
5. The longer two-opponent rollout still evaluates future combat; cumulative
   friendly HP/shield damage receives an extra disclosed 2x application penalty,
   and friendly-damage facts are present in native plan propositions.

This detects both a teammate standing in front of a gun and a teammate moving
into a simultaneously proposed shot. It also allows crossing after a bullet has
already passed: lanes are not treated as permanently forbidden terrain.

This is not guaranteed collision avoidance. Actual latency, opposing motion and
later allied decisions can invalidate forecasts. Already-installed stale or raw
orders still fire physically and can damage teammates; the engine does not repair
a selected action. The new root filter belongs to application assistance, not
newly learned model teamwork. Other v7 input profiles get the physics/shared
shot facts, but do not acquire the planner's root-lane filter automatically.

## Verification

`tests/jev-arena-friendly-fire.test.js` covers:

- explicit version/config and unchanged v5/v6 transparency;
- horizontal and diagonal first-friendly collision, shield absorption, powered
  shots, dead-tank passability and launch-only shooter exemption;
- identical rules for Red and Blue, wall/corner priority;
- actual visual projectile termination at the friendly hit;
- guarded candidate/BFS facts and unsafe raw/stale execution;
- capped, order-independent simultaneous attribution;
- jointly moving into proposed friendly fire;
- crossing safely after a projectile has passed;
- existing friendly projectiles, explicit no-safe-root fallback;
- actual-engine delayed/reload parity and no hidden-order access;
- v7 legacy tactical projection parity;
- worker/manager/privacy export identities, constraints and counters.

Browser fixtures exercise v7 selection, explicit v6 fallback, real planner-worker
integration with injected scores, separate HUD friendly damage/enemy-loss labels,
replay, desktop/mobile bounds and existing old-mode behavior. No model inference
is triggered by those fixtures.

Four development **search-only** games were also run on `friendly-lanes-a` and
`friendly-lanes-b`, swapping the planner's side. They ended by elimination at
93, 88, 173 and 112 ticks, respectively. All four planner teams won, with zero
friendly contacts on both sides in these particular games. Model calls: zero.
These are bounded smoke runs, not model wins, general win rates, or proof that
friendly-fire avoidance is perfect. The explicit collision fixtures above,
not those zero-contact matches, verify that damage is actually enabled.

Final regression results: **178 passed, 2 skipped, 0 failed** (180 Node tests,
including 15 friendly-fire fixtures). Six browser suites passed: tactical v2,
attack utility, independent step, renderer, planner and HUD. `git diff --check`
passed. The idle local arena backend was reloaded without interrupting any
active match or restarting the model services.

Earlier v6 live FP32 results remain v6 evidence. No new v7 live-model outcome
is claimed here.

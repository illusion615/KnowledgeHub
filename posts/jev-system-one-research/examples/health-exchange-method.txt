# Side-relative health exchange v5 — 2026-09-24

## User requirement

Account for own/enemy HP when trading damage: favorable mutual loss can justify
pressure, unfavorable exchange favors protection. The same policy must apply to
both sides and be invoked correctly through different model interfaces.

## Implementation

`arena-exchange.js` defines a shared side-relative health utility. For living
units, EHP = HP + shield. Nonterminal health utility is:

```
65 * (own_alive - enemy_alive)
+ 100 * (own_EHP - enemy_EHP) / (own_EHP + enemy_EHP)
+ .25 * (own_EHP - enemy_EHP)
```

Victory = `1000 + own remaining EHP`; defeat is the corresponding negative value;
mutual elimination is zero. The health component is antisymmetric on the same
outcome under side swap. Positional, temporal, wait and friendly-fire heuristics
remain disclosed additional terms in search, not a claim that the entire runtime
is an exactly solved zero-sum game.

The planner forms a finite plan × opponent-response matrix using the same
attack/evasive rollouts and aggregates 70% worst response plus 30% mean. These
are design risk weights, NOT measured opponent probabilities or a Nash solution.
The normalized advantage makes equal absolute damage different depending on
health reserves: 100:20 → 90:10 gains 13.333333 health utility points, whereas
20:100 → 10:90 loses the same amount (one unit per side, zero shields).

All of this is application utility, not model training or calibrated victory
probability. A low-health tank may still safely shoot; a healthy team should not
blindly charge. Recovery that improves health without enemy loss is labeled
`recover_advantage`, not falsely described as an aggressive damage exchange.

### Gates and persistence

The earlier progress gate maximized own predicted survivors before considering
ready attacks. V5 instead requires a forced ready attack to preserve the best
available risk-adjusted health exchange. It does not categorically forbid losing
one ally when the joint result is favorable. If no equally good ready attack
exists, it leaves the choice open instead of forcing a bad trade.

Root friendly-fire screening remains. A previously approved route is suspended
when own/enemy unit counts change or health advantage moves by more than 12
points, allowing either aggression or protection to be reconsidered. The pending
model order is still guarded at installation. Old v1-v4 behavior remains explicit;
v5 uses the existing v4 persistent-intent contract and v7 ballistics.

### Correct model invocation

- NanoJev: native Boolean plan preferences.
- Laya: complete Boolean wire is converted by its dedicated worker to Noul;
  validated Noul values feed the shared readout, with raw metadata retained.
- Online CLI: validated 0..100 self-reported scores, scaled to 0..1 only in the
  application readout. Native probabilities are not fabricated.

Both sides use identical code. V5 uses rotation-relative action tie order and
normalizes model-facing IDs to ally/enemy aliases. Actual B/R action mappings stay
in the trace. Equivalent fixture scores produce the same mapped readout through
all adapters. This does not prove arbitrary learned scores are rotation-invariant.

Diagnostics retain initial/final health advantage, net effective-health changes,
fractions, utility change for each opponent response, risk stance, coefficients
and raw model scores. The existing “correct decisions” KPI stays unassessed;
a favorable predicted payoff is not a correctness label.

## Validation

- Unit tests cover favorable/unfavorable mutual losses, shields, victory, defeat,
  mutual elimination, risk aggregation, recovery vs aggression, changed-health
  route invalidation and signed diagnostic export.
- Rotated/color-swapped one- and two-tank fixtures preserve payoff values and
  root mapping, including unequal HP/shields.
- Injected provider tests run both sides through NanoJev Boolean, Laya Noul and
  CLI self-score parsing without provider fallback, renormalization or secrets.
- 32 tokenizer-only payloads per checkpoint cover both sides, ahead/behind health,
  initial/progress states and zero/six-tick delays. Max complete sequence/path:
  483 tokens for each tested tokenizer; NanoJev cap 512, Laya cap 1024. No weights
  loaded or forwards performed during token checks; runtime still rejects overflow.
- Eight real local fixed-state calls: two checkpoints × two sides × ahead/behind.
  All contracts passed; 12,298 input tokens, zero cloud/warmup/retry. Ahead chose
  firing, behind chose mirrored repositioning. None changed the pure-search plan.
  The four ahead calls had only one shortlisted plan after the application gate;
  they cannot be claimed as evidence of model tactical intelligence.

These were fixed-state checks, NOT full battle-quality experiments or proof of
optimality. The existing aggregate experiments are not relabeled as v5 evidence.

Public summary: `examples/health-exchange-validation.json`.
Private receipts: `~/.cache/study-room/jev-research/20260924-exchange-live/`.
Reproduction helper: `scripts/jev-exchange-live-validation.js` requires explicit
local consent and fresh output, checks idle admission before each request, stops
on error/busy, and makes at most eight requests. It never interrupts user matches.

# Survival/teamwork and arbitrary-angle ballistics — 2026-09-21

## Scope and identities

This is a controller/task change, **not model training or a claim of unaided tactical intelligence**. Weights, native heads, FP32/4-bit precision, cache limits and Copilot reasoning effort were not changed. No assistant-initiated cloud inference was used in this iteration.

- Physics: `tank-v6-tactical`, explicitly selected by `ruleset: tactical`; step control only. Omitted API ruleset retains the historical cardinal rules.
- Tactical input/readout: `utility-tactics`, `tank-tactical-utility-v2`, `tactical-effects-v2`, `tactical-projection-v2`.
- Earlier user matches with `tank-tactical-utility-v1` remain v1 evidence. They must **not** be relabeled as v2 matches.
- Raw, action-facts, engage-first and attack-only utility controls remain available. v6 versions of their task descriptions state the new geometry; old cardinal descriptions remain unchanged.

## Physics, not just candidate labels

v6 aims at a named enemy's current centre at **any angle**, within a **six-cell Euclidean radius**. A fixed-direction projectile travels one Euclidean cell per tick, for at most six ticks. It does not home, bend around walls, automatically switch targets, or create hits from intent.

The same geometry module serves candidate eligibility, BFS firing cells, actual swept projectile collision, forecasts and diagnostic feasibility checks. Walls use closed unit-cell boxes, including corner grazing: bullets cannot clip through diagonal wall corners. Tanks have 0.7-cell-wide hitboxes. Allies remain transparent to friendly bullets; the first actual enemy intersected takes the hit. Movement remains four-directional and one cell per four ticks. Damage, pickup effects and simultaneous damage resolution remain unchanged.

The renderer uses Euclidean flight distance for diagonal short-flight playback and clamps interpolation to recorded collision endpoints. Older cardinal replays retain their original physics identity.

## Disclosed v2 control hierarchy

All filtering/readout rules are explicit application assistance, not repaired model actions or synthetic model scores:

1. Offer currently legal movement and in-range, unoccluded fire targets. During reload, withhold fire if a legal movement exists, encouraging maneuver instead of queuing another stationary shot. If completely trapped, a geometrically valid shot may wait for reload; `reload_hold_fallback` exposes this exception. No hidden wait action is invented.
2. Enumerate joint plans without contested allied movement destinations. Existing forced-action trapped fallbacks remain disclosed.
3. Before inference, project each joint plan and prefer **more surviving friendly tanks**. Among those, prefer a projected safe victory when available, then **higher remaining friendly HP + shields**. This is a bounded, greedy forecast, not an optimal policy.
4. Avoid redundant shots that would each individually kill the same target when an equally safe alternative exists. Necessary multi-tank focus fire is still allowed.
5. Rank the remaining plans using model-provided offense/survival scores. Application survival weight is 0.65 with incoming projected HP loss, two immediately ready enemy firing lines, or low HP with a firing/resupply opportunity; otherwise it is 0.25. Offense has the complementary weight. These fixed application weights are not fitted model parameters.

Forecasts simulate **one proposed friendly action after an assumed three-tick decision delay**, existing projectiles and proposed friendly fire, pickups, reload, shields and the actual elimination stopping rule, for at most eight ticks. Enemy positions are frozen and **no new enemy shots/decisions are predicted**. They never inspect unexecuted opponent orders. Actual latency, target movement and later enemy decisions can invalidate the forecast.

Resource descriptions prioritize an immediate useful pickup over a distant resource and report actual projected repair gain. Cover is distinguished from simply leaving an enemy's firing radius. Power resources and threats to wounded allies are exposed as effect facts; there is no invented suppression mechanic or terrain damage bonus.

### Native versus CLI scores

One native HTTP request carries two states: `arena` (offense) and `survival`. Exact native Boolean values/distributions are validated for both state identities and every question ID. `utility_scores` and `survival_scores` remain their original independent native values.

Copilot scores the same effect statements through an explicit score-only prompt. Its `self_offense_scores` and `self_survival_scores` are **0–100 self-reported preferences**, not native probabilities. Dividing them by 100 for arithmetic does not make them probabilities. `binary_gates` stays absent/null for CLI output. Cloud consent, usage reporting, deadlines and cancellation remain in force. The new CLI contract was verified with injected CLI fixtures, **not a new live cloud call**.

`combined_scores` is a separately labeled application-weighted value. Actual request/prompt, raw score groups, mappings, independent weighted argmax, joint plans, forecasts, admissible-plan indices, weights and fallback flags are inspectable and included in privacy-filtered exports. Native and CLI scoring quantities must not be conflated.

## Negative evidence from v1 and the resulting correction

While implementation was in progress, the user ran v1 match
`6be4f085-a540-43bf-8643-874dff6e6981`, FP32 Blue versus 4-bit Red, `tank-2026`, realtime, unlimited duration, `continue-world` rate mode. It completed and was automatically archived:

- Blue: two survivors, **62 HP**, 18 shots / 18 hits, 200 HP damage, 21 successful moves, one pickup, zero blocked moves, three invalid firing attempts.
- Red: eliminated, 14 shots / 14 hits, 168 HP damage, 17 successful moves, one pickup, zero blocked moves, one invalid firing attempt.
- 22 request attempts per side. Blue's last receipt was cancelled when the match ended; this is not a model invalid-output result.
- Wall time 121,839 ms; each side spent about 100 seconds in rate admission wait. This is not a 122-second inference benchmark.

Despite the win, the archived action facts contain **five opportunities to reduce projected incoming HP loss, none selected**. There were **zero wall-cover opportunities** in those captured candidate sets, so this match cannot measure cover-selection quality. There were nine action snapshots with a projected repair opportunity. Some immediate repair gains were obscured by descriptions of a more distant shield resource.

For example, a Blue firing action had offense score 0.87897 and survival score 0.65359, while moves avoiding a projected 12 HP loss had survival scores only 0.63532–0.64953. Increasing the survival weight alone did not make the model select damage avoidance. This motivated v2's explicit health hierarchy and corrected resource descriptions. **The resulting safety gains belong in part to those application constraints.**

The subsequent user-controlled match `d703ac74-68bc-423a-913d-b1f5865bfc46` used **attack-only utility with v6 ballistics**, FP32 versus the rule baseline (`tank-utility-diagonal-v1`), not the survival policy. It was allowed to finish and archive before maintenance and is not credited as v2 survival evidence. No running user match was stopped to deploy v2. Public controls were saved fresh, the existing browser tab was reloaded, consent was cleared, and no match was automatically started.

## Bounded local v2 probes

The first planned fixed-state batch was rejected by `local_rate_limit` **before provider dispatch**. It made zero model calls and was not automatically retried while the user was playing. Its private directory contains an explicit dispatch-rejection receipt, not successful experiment evidence.

After the user match ended and v2 was loaded, a fresh run used five predeclared development boards × FP32/4-bit = **ten completed local calls**, without retries or warmups:

| Development board | FP32 joint decision | 4-bit joint decision |
|---|---|---|
| Outside firing radius | B0 right, B1 right | B0 right, B1 right |
| Existing lethal projectile, feasible evasion | B0 up, B1 right | B0 up, B1 right |
| Wounded tank, adjacent repair | B0 up onto repair, B1 right | Same |
| Proactive wall-cover choice, no existing incoming bullet | **B0 fires**, B1 right | **B0 fires**, B1 right |
| One enemy killable by either ally | B0 up, B1 fires | Same |

The approach, evasion, repair and redundant-kill checks exercise the actual scoring/readout pipeline. **They are not four “model accuracy” successes**: evasion, healing and coordination are strongly constrained by the disclosed planner. Both models still chose firing rather than proactive wall cover in the cover fixture. That limitation is retained, not relabeled as successful cover use.

These are development boards with shared effect templates, not unseen-text holdouts. They do not establish general win rate, optimality, reliable anticipation of enemy actions, or a completed v2 full-match outcome.

Private evidence:

- `~/.cache/study-room/jev-evaluation/matches/6be4f085-a540-43bf-8643-874dff6e6981.json`
- `~/.cache/study-room/jev-evaluation/20260921-tactics-probes/` — rejected dispatch, zero inference
- `~/.cache/study-room/jev-evaluation/20260921-tactics-v2-probes/` — manifest and ten fsynced receipts

## Verification surfaces

- `tests/jev-arena-tactics.test.js`: arbitrary-angle range, corner occlusion, swept collision, allied transparency, interception, non-homing motion, geometry/execution parity; projection/physics parity under the stated assumptions; HP/repair constraints, reload/trapped exception, target coordination, separate native/CLI score contracts, privacy exports and no hidden opponent orders.
- `tests/jev-arena-tactics.browser.js`: real UI with injected scores, no inference; v6 selection, dual-score semantics, cloud consent, actual CLI prompt, forecast trace, rate pause, stop/export and mobile bounds.
- Existing utility, step and renderer browser suites; diagonal flight/impact fixture added to the renderer suite.
- Offline installed-tokenizer matrix expanded to **2,240** finite/unlimited legacy/assisted/v6 cases. Maximum observed path **510 tokens**, maximum request **8,852 tokens**; no truncation and no inference. v6 raw/engage text was compacted, not model limits increased.

Remaining limitations: short-horizon frozen-enemy forecasts, uncertain latency, weak proactive cover preference, possible cautious movement loops, imperfect long-range resource allocation and no guarantee of match termination. Old attack-only utility, raw controls and the non-model rule baseline remain available for honest comparison.

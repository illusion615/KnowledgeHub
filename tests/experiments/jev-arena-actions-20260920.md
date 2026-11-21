# Action failures and Copilot cutoff — 2026-09-20 follow-up

## Evidence and scope

The user reported B1 alternating left/right, B0 repeatedly firing unsuccessfully,
and the other model timing out. The latest match was retrieved automatically:
`adbc6451-d70c-4e96-88c6-7c598ad963e9` (private diagnostic under
`~/.cache/study-room/jev-evaluation/next-review/`). FP32 made six decisions;
B0 chose `fire_R0` six times, B1 alternated right/left. The Copilot side was
`gpt-5-mini`, stopped at **30,049 ms** with `arena_timeout`, not a returned bad
plan. No stage/usage data survived the old cancellation path.

New real-call evidence is private under
`~/.cache/study-room/jev-evaluation/action-review/`. All mutations below are
application code and observation formatting, not weights/training. No returned
model action was repaired, no candidates were removed, and no fake shots were
introduced. The assistant made **one** authorized cloud request, with a stated
120s deadline and no retries/fallbacks.

## Copilot: a completed response beyond the old cutoff

`copilot-sync-once.json`, match `8adbcd65-e16a-49d3-8155-c6ac1b51e852`:

- Original raw input, synchronous mode, one decision per side, 120s deadline.
- FP32 returned in 465 ms; Copilot returned valid orders in **40,201 ms**.
- Copilot chose `R0: move_left`, `R1: move_left`, with complete self-scores.
  These are not native probabilities or a calibrated accuracy measurement.
- CLI process spawn: 0.574 ms; first stdout: 2,571 ms; assistant turn start:
  4,298 ms; assistant message: 39,096 ms; result event: 39,132 ms.
- Usage file: 1 model request; 3,137 input tokens; 2,704 output tokens;
  2,560 reasoning tokens; 1,152 cache-read tokens; 34,790 ms API duration.
  Reasoning/cache counters are separate breakdowns, **not added again**.
- Reported premium requests: 0; nano-AI units: 593,305,000; dollar billing:
  **unknown**. Do not infer free usage or a dollar amount from these counters.

The old arena-wide 30s cutoff would have aborted this request before its response.
This supports exposing/correcting the deadline, not a claim that every past or
future delay has the same cause. Ordinary comparison already allowed a longer
CLI wait; arena now exposes 30/60/120/180s with a visible 120s UI default. Old API
requests without the new field retain 30s. Realtime duration can still end a match
before the per-call deadline; Sync is appropriate for complete-response checks.

Cancellation now preserves any completed usage file and safe phase counters.
Only event names from a fixed allowlist, counts, timings and byte counts survive;
raw stdout/stderr, event contents, login data and reasoning text do not enter
receipts. `deadline_ms` and `timeout_source` distinguish the arena cutoff from
CLI timeout. No reasoning-effort setting was secretly changed.

## Explicit action facts: partial improvement, not tactical competence

A separate `action-facts` profile supplies snapshot geometry in plain language:
why a move/shot fails, nearest-enemy Manhattan distance change, and whether a
move reverses the previous successful move. It includes the map, live/dead HP,
shield/boost/reload, pickups and bullets. These computed facts are **additional
observation assistance**, not an unaided-map benchmark. Both providers receive
the same assistance policy, with all directional/named-target choices intact.

Development receipts: `development-facts` (initial simplified prototype), then
`development-facts-complete` (complete public state/rules). On the two development
states, both models made 4/4 geometrically clear choices instead of the earlier
raw 2/4. This alone would not justify generalization.

Three independently specified cases in `independent-facts` compared raw against
the complete profile: approach corridor, a Red-side clear firing opportunity,
and wall-blocked shooting/movement. Across the two providers:

- Raw: 8/12 selected actions geometrically clear.
- Assisted: 12/12 geometrically clear.
- **Both still missed the clear firing opportunity**, choosing movement instead.
  Geometry is not goal progress, optimality, combat skill, or calibrated accuracy.

The first full assisted match (`facts-match-once.json`,
`cf788fcb-ecff-41bb-bebb-4843e83c472e`, `tank-action-facts-v1`) had:

- Blue 12 successful moves, 0 blocked; Red 10 moves, 2 blocked.
- Both sides: **0 invalid shots, 0 actual shots, 0 damage**.
- Four-cell movement loops remained, despite avoiding the former two-cell
  left/right alternation. This negative result was retained.

## Last-eight-position feedback (v2)

The next profile version adds bounded actual movement history. Each tank retains
its last eight positions including spawn; only successful moves append. Candidate
text states the destination's recent visit count. It does not forbid a necessary
return or choose a route. History is exported in snapshots for audit.

A new three-case suite (`validation-v3`) was specified for a cycle exit, necessary
backtracking, and firing versus exploration. The run `independent-history` is
**partial**: five successful receipts followed by `local_probe_failed`. It stopped
without retry; the then-running probe route hid the underlying fixed error code.
Offline tokenization of the failed request showed paths only 384–390 tokens,
so this request was within the 512-token bound. The underlying failure cause is
not established. Probe error reporting was subsequently improved to preserve
allowlisted local error codes. No completion/aggregate success rate is claimed
for this partial suite. In the completed cycle-exit samples, the assisted model
still chose a recently visited destination: history is not a hard constraint.

Final full match (`facts-match-history.json`,
`f4992da3-9452-4a76-a92c-b54da06e3fd9`, `tank-action-facts-v2`), six calls per side:

| Metric | FP32 Blue | 4-bit Red |
| --- | ---: | ---: |
| Successful movement | 11 | 12 |
| Blocked movement | 1 | 0 |
| Invalid shots | 0 | 0 |
| Actual shots / damage | 0 / 0 | 0 / 0 |
| Mean decision ms | 911.17 | 883.17 |

The one blocked Blue move was `yielding`: B0 and B1 contested the same cell, not
an impossible wall move or repeated out-of-range shot. B1 ended at `(3,7)` instead
of toggling `(1,5)`/`(2,5)`; B0 ended at `(2,5)`. **Revisits remain in the paths**,
and this match still produced no combat. The change mitigates the reported
symptoms on this seed; it does not solve tactical planning/coordination.

The raw task remains selectable and is still the page-load default. The opened
verification tab explicitly selects assisted input, rather than relabeling it as
raw NanoJev skill. Existing v1/raw records retain their original protocols. Old
tabs and evidence remain intact; new finished matches are privately archived.

## Verification and limits

- Unit coverage: unfiltered action keys, genuinely invalid execution preserved,
  geometry descriptions, history updates/caps, explicit deadline validation,
  timeout source and usage retention, secret-free CLI observations.
- Browser fixture regression: deadline/profile selection, unchanged raw preview,
  protocol display/export, concurrency, stop/replay, mobile layout.
- Installed CLI loopback-fixture test passes; it is **not** another cloud request.
- Offline tokenizer stress: **640 cases**, max **508 tokens/path**, max **8,852**
  total path tokens; no model inference for this check.

Further improvements need new independent states and longer behavioral evidence.
Increasing deadlines alone does not reduce model reasoning latency. Increasing
call budgets, masking errors, or adding an autopilot would change the experiment
and must not be disguised as better native decisions.

# Clickable model names and comparison header — 2026-09-24

The map header keeps blue/red model names at opposite corners with four central
comparison cards in a single desktop row (two columns on narrow phones). Model names are real keyboard-accessible buttons: open the
existing settings dialog and focus the corresponding model select. Selection
uses the existing no-inference/no-fallback path and invalidates old consent.
Buttons are disabled during a running/submitting match; no mid-match substitution.
Mobile uses the model names in the first row and the comparison below, without
covering tanks or overflowing the viewport. Detailed status/clock/connection,
team HUD statistics, role/goal/path explanations, route visibility toggle and
metric definitions are reparented to Diagnostics & Records, retaining original
IDs and listeners. The redundant whole-match summary line is removed from the
header; metric semantics and unassessed correctness remain unchanged. Full long names remain text/title;
HTML-like model names are not interpreted as markup.

## Metric definitions

All four header metrics are cumulative for the match, including during replay:

- Mean decision latency: settled **new** decision elapsed time (queue, search,
  provider and failures), excluding previously approved route continuations.
  It is not isolated model/GPU inference time or completed-action latency.
- Attack efficiency: enemy hits / shots, including shield hits, excluding
  friendly contacts. Zero shots display `0 / 0` without an invented percentage.
- Planning efficiency: successfully completed joint root actions / generated
  valid joint plans. Every living tank named by that plan must actually finish
  its selected move, shot or wait. Installation alone is not success; blocked
  moves, stale/discarded plans and still-pending plans do not count as completed.
  Approved route-continuation steps do not create additional plan denominator
  entries. This does NOT claim completion of the entire forecast route.
- Decision correctness: `— / settled new decisions · unassessed`. There is no
  independent gold/quality label pipeline, so correctness is unknown. Successful
  execution, shot hits and model confidence are not substituted for correctness.
  Failures count in decision totals; route continuations do not.

Server counters survive the 200-row decision retention limit. Old records or an
old server without the new comparison schema show unknown values instead of
fabricated cumulative ratios. Exported diagnostics retain the same definitions
and unknown correctness. Active model/route behavior is otherwise unchanged.

## Verified

- `tests/jev-arena-comparison.test.js`: ratios, zero/missing denominators, unknown
  correctness, execution vs installation/blocked-move counts, cumulative export.
- `tests/jev-arena-intent-manager.test.js`: continuation excluded from decision
  mean/denominators, no new admission/model request on route following.
- `tests/jev-arena-hud.browser.js`: clickable names focus the correct side; no
  inference, swapping, replay, long names/injection safety, comparison values,
  desktop / 390px / 320px layout, card alignment, and detailed nodes hidden on
  the main stage but visible in diagnostics. Header screenshots visually reviewed.
- `tests/jev-arena-shell.browser.js`: buttons disabled while running and restored
  after Stop; dialog and mobile behavior retained.

No real model calls are needed for these presentation/accounting tests. The idle
Node gateway was restarted from the current worktree; local workers unchanged.

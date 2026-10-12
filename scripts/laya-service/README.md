# Shared decision-model gateway, isolated Laya workers

The browser talks only to `jev-playground-server.js`. The Node gateway exposes a
shared catalog from `posts/jev-system-one-research/model-registry.js`, used by the
basic Playground, support theater and arena. No browser token or model path is
required. No model is substituted after a failed request.

## Layout

- Existing NanoJev workers: ports 8767 (FP32) and 8766 (4-bit), unchanged defaults.
- New Laya workers: ports 8770 (multilingual) and 8771 (typed-decisions).
- Node website/API: this worktree on port 62848. Port 8000 may serve a different
  checkout; do not assume it contains the same implementation.
- Existing downloads are reused under `~/.omlx/models/aac6fef/` without modification.
- Laya uses a dedicated Python environment at `~/.cache/study-room/laya-mlx`.
  It is not loaded through oMLX's chat or embedding engine.

## Install and start (explicit operator action)

```sh
uv venv --python 3.12 "$HOME/.cache/study-room/laya-mlx"
uv pip install --python "$HOME/.cache/study-room/laya-mlx/bin/python" \
  -r scripts/laya-service/requirements.txt

# Separate foreground terminals, from this checkout:
"$HOME/.cache/study-room/laya-mlx/bin/python" scripts/serve-laya-mlx.py --variant multilingual --port 8770
"$HOME/.cache/study-room/laya-mlx/bin/python" scripts/serve-laya-mlx.py --variant typed-decisions --port 8771
node scripts/jev-playground-server.js --port 62848 --enable-copilot
```

Do not recreate an environment over a running worker. Stop only the intended
worker first. The first local installation encountered official file-CDN connection
errors and used the Tsinghua PyPI mirror. The downloaded `laya-mlx==0.2.0` wheel was
independently matched against the official PyPI SHA-256:
`1a80a0cc79c55be808de0b1208a172566209b5780d796b98d86235e9cf335187`.
The installed agent/common/tokenizer files also matched reviewed upstream commit
`0a859518634112655cb97c745dbf04f5191aaf13`. This was a package transport change, not a
model/checkpoint fallback. No new weight download was performed.

Each worker verifies a pinned manifest and every listed file, loads the complete
MLX architecture with strict weight loading, and publishes an owner-only 0600
connection record. `JEV_LAYA_CONNECTION_DIR` may point the Node process at another
private connection directory. The token never reaches browser JSON or cloud APIs.

Endpoints: read-only `/api/health`, authenticated `/api/auth-check`, authenticated
`POST /api/evaluate`. Requests with an Origin header are refused at the worker;
users must use the same-origin Node gateway. Binding is loopback only. Startup and
inference logs exclude user text and credentials. No cloud generation occurs here.

## Contract and limits

The internal gateway wire keeps `{states:[{id,state,questions}]}` with Choice,
Score and Boolean questions. This is a transport contract, not a claim that Laya
has NanoJev's architecture. The Laya worker explicitly adapts Boolean to Noul and
returns original Laya answers/calibration. Receipts use `study-room-laya-mlx-v1`,
not the NanoJev schema. Choice/Score confidence remains the Laya runtime statistic;
Noul `p_true` and its complement are explicitly derived in the arena adapter.

- 1,024 full-sequence tokens, including instructions/options/state.
- At most 20 Choice options; existing wire caps of 8 states, 32 questions and
  16,384 aggregate sequence tokens also apply.
- Every state is preflighted before any model forward. Reject instruction,
  per-option or state truncation, reserved mask-token rewriting, encoding drift
  and oversized requests. Do not silently raise limits or shorten inputs.
- Upstream four-decimal rounding is declared and validated; no renormalization.
- Raw and used calibration temperatures are recorded, including runtime clamps.
- Native input usage counts candidate paths; Laya counts per-question encoder
  sequences. They are distinct local-compute scopes, not cloud billing amounts.

Laya supports basic evaluation, support routing, and opponent-rollout planner
ranking as well as raw arena choices. Planner Noul values pass through the same
Boolean-gate readout as NanoJev, with original response/calibration provenance;
application search is not model reasoning. The new-match UI defaults to planner,
step controls and v7 friendly fire, offering raw input as the only input ablation.
New matches select `planner_revision: exchange-aware-v5`: both teams use the same
relative HP+shield exchange utility and risk aggregation, permitting favorable
mutual losses. No solved-equilibrium or model-quality claim is made. Both sides
retain correct NanoJev Boolean / Laya Noul adapters; eight local fixed-state checks
passed, not a full-battle benchmark. See `examples/health-exchange-validation.json`.
V5 retains the `persistent-intent-v4` route contract: goals and routes
persist, a selected matching route move can approve two guarded follow-up moves,
and continuation rows are application-owned with zero model calls/search. Mixed
joint requests expose already-fixed route actions. Context is compact and complete
rather than truncated: 16 tokenizer checks reached 386 NanoJev / 381 Laya typed
tokens at most. One real request per tested checkpoint was followed by one route
continuation each; this is not combat-quality evidence. See
`examples/persistent-intent-validation.json` and
`tests/experiments/jev-persistent-intent-20260924.md`.

The prior explicit `planner_revision: resource-tactics-v3` remains available:
four-tick tactical waits, shield assault, power burst, urgent repair and support
roles are application heuristics in `arena-tactical-policy.js`, not learning.
Waiting needs forecast advantage after costs and repeated waits are discouraged.
Requests without a revision retain v1; explicit `resource-terrain-v2` preserves v2.
Logical actions can include wait, but the model still ranks at most six plans.
V3: 11 development tests, four short search-only micro-matches and 64 tokenizer-only
inputs per checkpoint; zero new forwards or cloud requests, no full-match quality
claim. Raw input still has no wait, so raw/planner also differ in action space.
See `examples/arena-tactical-wait-validation.json` and
`tests/experiments/jev-arena-tactical-wait-20260923.md`.
The earlier v2 checks remain in `examples/arena-strategy-validation.json`.
Search-only is a non-model side using the identical planner, null model scores
and zero model requests. Use sync for matched-snapshot quality ablations.
Legacy action-facts/engage-first remain API-compatible; utility-attack and
utility-tactics are still unadapted for Laya. Historical controls/rules are not in
the new-match menu. Every supported request can still exceed the token budget
later in a game and must stop safely, never truncate or fall back.
Support theater still needs separate consent for its selected LLM; integration
validation did not call that cloud branch.

## Scheduling and cancellation

All managed local providers share a FIFO GPU lane in this Node process. Arena
scheduling uses the same resource group and alternates local pair ordering.
Queued jobs are not inferred after cancellation. A submitted GPU forward is not
preemptible; the HTTP operation retains its lane until it settles, with a separate
180-second transport ceiling. After a transport failure, physical completion may
be unknown; verify/restart the affected worker before another timing comparison.
Application deadlines/Stop may return earlier and
must not be presented as GPU termination. Failures stop without retry. This lane
cannot govern another website process, direct worker calls or unrelated oMLX
workloads; avoid those concurrent workloads during latency comparisons.

## Verification

```sh
python3 -m unittest discover -s tests -p 'test_laya_service.py'
node --test --test-concurrency=4 tests/jev-*.test.js
node tests/jev-model-switch.browser.js
```

One bounded real local smoke run dispatched six requests total: basic three-type
judgments, a support Boolean batch and a standard arena Choice request, once per
Laya checkpoint. All returned valid contracts; no warmup, retries, training or
cloud model calls. First requests were around 0.8 s; later different workloads
were around 56–138 ms. These are individual integration observations, not p50/p95,
accuracy or a fair model-performance comparison. Public aggregate:
`posts/jev-system-one-research/examples/laya-runtime-validation.json` preserves
that initial capability snapshot. The separate follow-up
`examples/laya-planner-validation.json` records 192 tokenizer-only payloads per
checkpoint and four real local one-decision planner requests (two per checkpoint,
colors swapped against search-only). All four contracts passed; none changed the
same-side pure-search plan. This is adapter validation, not tactical improvement.
No cloud requests, retries or weight changes. Browser compatibility tests inject
removed legacy controls only into fixture pages; the normal menu stays reduced.

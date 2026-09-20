# NanoJev on Apple Silicon: standalone MLX decision runtime

This is a **working, non-generative decision service**, not an oMLX chat-loader patch.
It reuses the downloaded weights without renaming or changing them. The existing
oMLX application and its other models are untouched. Native Choice/Boolean/Score
inference uses Qwen3 hidden states and all trained decision heads—no vocabulary
sampling, chat template, mock fallback, or cloud model call.

## Requirements and installation

Tested on Apple Silicon with Python 3.12.9, MLX 0.32.0, MLX-LM 0.31.3 and
Transformers 5.17.0. Metal is required. Numerical validation covers the default
float32 activation path. Other `--dtype` settings are experimental and need new
parity checks; the profile name identifies the stored artifact, not an assurance
that optional runtime casts preserve its precision. Run from the repository root.
The environment stays outside both the repository and oMLX.app.

```bash
ENV="$HOME/.cache/study-room/nanojev-mlx"
test -x "$ENV/bin/python" || uv venv --python 3.12 "$ENV"
uv pip install --python "$ENV/bin/python" \
  -r scripts/nanojev_mlx/requirements.txt
```

The setup was completed on this machine. If the default package index is
unreachable, use an approved mirror without disabling TLS verification. The
Microsoft mirror `https://packagefeedproxy.microsoft.io/pypi/simple/` worked in
this environment (`--index-url` with `uv pip install`). Do not recreate a live
service's environment while it is running.

Only these pinned artifacts are accepted; every required file is hashed before
loading. This runtime does not download weights or fetch the author's training
paths from `config.json`:

| Profile | Default directory | Required inventory |
|---|---|---|
| `fp32` | `~/.omlx/models/C-Tianyu/NanoJev` | `posts/jev-system-one-research/examples/nanojev-fp32-reference.json` |
| `4bit` | `~/.omlx/models/ZeroDegress/NanoJev-mlx-4bit` | `posts/jev-system-one-research/examples/nanojev-mlx-reference.json` |

## Run after a restart

Use separate terminals; Ctrl+C stops only that service. These are not installed
as login services. If a recorded service is already running, do not start a
second copy or delete its connection file.

```bash
# Terminal 1: original weights; preferred as the comparison baseline
"$HOME/.cache/study-room/nanojev-mlx/bin/python" \
  scripts/serve-nanojev-mlx.py --variant fp32

# Terminal 2: optional quantized comparison
"$HOME/.cache/study-room/nanojev-mlx/bin/python" \
  scripts/serve-nanojev-mlx.py --variant 4bit

# Terminal 3: Node.js >=22; no cloud API key required
node scripts/jev-playground-server.js --port 8000
```

Open <http://127.0.0.1:8000/posts/jev-system-one-research/#playground>.
The page prefers FP32 when it is ready, otherwise 4-bit. Select a local route and
click **Run and View Output**—no checkbox is required. Cloud routes require a
separate approval once per route per page load; editing input does not reset it. Switching a provider or
editing input discards old results. Failures never switch to a cloud route or a
teaching answer. Cloud Vercel/TypeSafe routes remain optional and separate.

Port 8000 must be free; otherwise choose a free website port (e.g. `--port 8002`).
The model services default to 8767 (FP32) and 8766 (4-bit). A custom `--port` is
recorded for automatic discovery by the website backend.

**The oMLX model selector still uses its existing chat loader.** Do not test this
runtime through `/v1/chat/completions`. Adding oMLX discovery/engine/protocol
support would be a separate integration.

## Protocol and safety boundary

- `GET /api/health`: loaded model/weight identity and counters; no inference.
- `GET /api/auth-check`: requires `X-NanoJev-Token`; no inference.
- `POST /api/evaluate`: authenticated `{states:[{id,state,questions}]}`.
- The service listens only on `127.0.0.1`, validates Host, and rejects direct
  browser POSTs carrying Origin. The Node bridge adds same-origin/CSRF checks.
- A fresh 256-bit connection token is written atomically to a **0600** file under
  `~/.cache/study-room/nanojev-mlx/connection-{variant}.json`. Never publish,
  paste into the browser, or commit these files. The Node bridge verifies file
  ownership/permissions, rejects symlinks, and allows only fixed loopback hosts.
- Inference limits: 64 KiB JSON; 8 states, 32 questions, 128 candidate paths,
  16,384 path tokens; each path ≤512 tokens. No silent truncation. One active
  inference and 30 attempts/minute per model service. The website bridge has its
  own 20/minute limit and 30-second deadline.
- Cancelling a browser wait does not guarantee that an already-running GPU
  operation stops. These limits are for local use, **not public-hosting security**.
- No inputs or tokens are logged or persisted by inference. Downloads are
  explicit browser actions. Runtime model loading is offline, local-files-only,
  with remote code disabled.
- Token usage counts actual candidate paths, including repeated prefixes;
  output tokens = 0 because there is no autoregressive decoding, not because the
  JSON response is empty. No external inference API charge; hardware/electricity
  and maintenance are not free.

The adapter maps Boolean `p_true` to the page's Noul probability. It does not
invent Choice/Score confidence. The default independent-confidence gate will
therefore ask for review; choosing probability gating must be explicit.

## Numerical validation—not a business benchmark

```bash
PY="$HOME/.cache/study-room/nanojev-mlx/bin/python"
uv pip install --python "$PY" -r scripts/nanojev_mlx/requirements-validation.txt
"$PY" scripts/validate-nanojev-mlx.py --fetch-reference \
  --original-dir "$HOME/.omlx/models/C-Tianyu/NanoJev" \
  --output /tmp/nanojev-parity-new.json
```

The output must not already exist. `--fetch-reference` downloads three pinned
MIT source/license files to an external cache and verifies their SHA-256. It
never downloads weights or performs cloud inference. The original upstream
`DecisionModel` is executed unchanged using CPU PyTorch, with strict state-dict
loading. Encoded candidate paths must match exactly. Acceptance was fixed at
maximum probability error ≤1e-4 and zero argmax flips **for the same weights**.

The checked-in report is
`posts/jev-system-one-research/examples/nanojev-mlx-numerical-validation.json`.
It records implementation/source hashes, versions, and the input fixture hash:

- 4 states / 12 questions / 28 paths; English, Chinese, structured state, all
  three question types.
- Same 4-bit artifact: MLX vs dequantized upstream PyTorch max probability error
  **3.7253e-6**, 0 flips.
- Original FP32: MLX vs upstream PyTorch max error **1.6689e-6**, 0 flips.
- Batched vs isolated: max error **7.4208e-6**, 0 flips.
- **4-bit vs original FP32: max probability difference 0.212082, 3/12 argmax
  flips.** This is a quantization comparison, not a porting failure and not
  business accuracy. Do not extrapolate a retention rate from 12 questions.

The root checkpoint was primarily trained for navigation. In the public
HTTP-500 business example, both models actually selected `other`. Those results
are preserved in `examples/nanojev-mlx-http-example.json`; nothing was corrected
to match an expected answer. Its warm timings (36.1/60.084 ms for one request)
are observations, not p50/p95 claims. Domain evaluation and calibration remain
necessary before using decisions operationally.

## Tests

```bash
node --test tests/jev-playground.test.js tests/jev-live.test.js \
  tests/jev-readiness.test.js tests/jev-local-provider.test.js
"$HOME/.cache/study-room/nanojev-mlx/bin/python" \
  -m unittest discover -s tests -p 'test_nanojev_mlx*.py' -v
```

Unit tests use temporary files, fake HTTP engines, and tiny generated MLX graphs,
not downloaded model inference. Without MLX the three graph tests are skipped;
contract, audit, and HTTP tests still run. They do not substitute for the real
full-weight numerical validation above or real browser-to-model checks.

Code attribution is in [NOTICE.md](NOTICE.md). Upstream code is MIT, but
fine-tuned/quantized weight licensing remains unclear; obtain clarification
before commercial deployment. No billing settings, ZDR policy, oMLX app files,
or original model files were changed.

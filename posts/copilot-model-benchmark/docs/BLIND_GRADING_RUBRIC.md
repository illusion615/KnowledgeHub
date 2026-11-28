# Blind Grading Rubric

Grade only the supplied answer and locked source. Do not infer the model from writing style, file path, or answer order.

## Architecture — 20 points

- Architecture and latency path, 0–3: components and edit flow are concrete; the design explains how the live path can meet the SLO.
- Data model, 0–3: tenant/document/update/snapshot/ACL identity and idempotency are explicit.
- Conflict strategy, 0–3: OT vs CRDT is decided from offline and concurrency requirements; no unsupported universal claim.
- Scaling and capacity, 0–3: hot-document fan-out, socket/bandwidth/memory bottlenecks, backpressure, and partition ownership are addressed.
- Isolation and security, 0–2: authorization and tenant isolation cover databases, object storage, streams, caches, and encryption boundaries.
- Failure recovery, 0–2: owner failure, replay, duplicate updates, reconnect, and region behavior are coherent.
- SLO validation, 0–2: assumptions are labeled; load shape, p95/p99 measurement, and acceptance criteria are described without adding percentile budgets incorrectly.
- Trade-offs, 0–2: at least four material trade-offs have explicit decision criteria and costs.

Unsupported numeric thresholds, invented product facts, or contradictions reduce the relevant item. Concision is neutral.

## Long Context — 25 points

- Architecture/state-machine summary, 0–4.
- Each of exactly three bugs, 0–6 (18 total):
  - 0 if false, already prevented by nearby code, only stylistic, or lacks a reproducible trigger.
  - Reality and source/control-flow proof, 0–2.
  - Trigger sequence and user impact, 0–2.
  - Root-cause fix that covers all branches, 0–2.
- Cross-file/nearby-code verification and precision, 0–3.

Line drift is not penalized when the cited function and control flow are unambiguous. Extra alleged bugs beyond three violate instructions and cost 2 points.

## Output

Return strict JSON:

```json
{
  "architecture": { "score": 0, "max": 20, "reasons": ["..."] },
  "longContext": {
    "score": 0,
    "max": 25,
    "summaryScore": 0,
    "bugs": [
      { "label": "Bug 1", "confirmed": false, "score": 0, "reason": "..." }
    ],
    "precisionScore": 0,
    "reasons": ["..."]
  }
}
```
# Copilot Model Benchmark v1 — Run Instructions

You are participating in a controlled benchmark. Complete all four tasks in this fresh run directory. Do not access parent directories, network resources, or prior benchmark runs. Do not install dependencies. Do not modify files under `input/` or `fixture/tests/`.

## Task 1 — Executable Correctness

Create `answers/task1.js` exporting one CommonJS function `deepMerge(target, source)`.

Rules:

1. Arrays concatenate rather than replace.
2. When both values are primitives, source wins.
3. Plain objects merge recursively.
4. `null`, `undefined`, and `Date` replace rather than merge; returned Date values must be cloned.
5. The function is pure. Neither input, nor nested objects reachable from either input, may be mutated through the returned value.
6. Preserve null-prototype objects. Treat class instances as atomic source values.
7. An enumerable own `__proto__` key must remain data and must not pollute `Object.prototype`.

Add succinct JSDoc. Do not use JSON serialization or external packages.

## Task 2 — Architecture Reasoning

Create `answers/architecture.md` with a production design for a multi-tenant real-time collaborative document editor:

- maximum 1,000 concurrent editors per document;
- p95 edit propagation under 200 ms;
- offline edits with deterministic conflict resolution;
- tenant data isolation.

Include a text architecture diagram, concrete data model, OT-vs-CRDT decision, scaling/capacity plan, failure recovery, security boundaries, measurable SLO validation, and at least four explicit trade-offs. Distinguish assumptions from measured facts.

## Task 3 — Long-Context Diagnosis

Read the complete `input/article-presentation.js`. Create `answers/long-context.md` containing:

1. A concise architecture and state-machine summary.
2. Exactly three real logic defects, not style concerns.
3. For each defect: current source line range, triggering sequence, user-visible impact, control-flow proof, and root-cause fix.

False positives are penalized. Verify that nearby code does not already prevent the problem.

## Task 4 — Long-Horizon Implementation

Implement the durable scheduler specified by `fixture/SPEC.md`. Work only inside `fixture/`. Run `node --test fixture/tests/*.test.js` until it passes. Do not weaken or edit tests.

## Completion

Create `answers/process.json` with:

```json
{
  "commandsRun": ["..."],
  "testsPassed": 0,
  "testsFailed": 0,
  "repairs": [{ "failure": "...", "change": "..." }],
  "knownLimitations": ["..."]
}
```

Before finishing, verify all required files exist and report a compact summary.
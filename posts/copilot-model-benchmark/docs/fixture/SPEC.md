# Durable Job Scheduler Specification

Implement a dependency-free CommonJS scheduler for Node.js 20+.

## Public API

`src/index.js` must export `createScheduler(options)`.

Options:

- `clock.now()` returns epoch milliseconds; default `Date.now`.
- `idFactory()` returns a unique job ID.
- `store` implements the async interface in `src/memory-store.js`.
- `maxAttempts` defaults to 3.
- `baseDelayMs` defaults to 1000.

Returned scheduler methods are async:

- `enqueue(type, payload, options?)` → immutable job snapshot. `options.runAt` defaults to now; `options.idempotencyKey` is optional.
- `claim(workerId, leaseMs)` → the oldest runnable job or `null`.
- `complete(jobId, workerId, result)` → completed snapshot.
- `fail(jobId, workerId, error)` → retry snapshot or terminal failed snapshot.
- `heartbeat(jobId, workerId, leaseMs)` → renewed snapshot.
- `get(jobId)` → snapshot or `null`.

## State and Rules

A job has `id`, `type`, `payload`, `status`, `attempts`, `runAt`, `createdAt`, `updatedAt`, `leaseOwner`, `leaseUntil`, `result`, `error`, and `idempotencyKey`.

1. Status is one of `pending`, `running`, `completed`, `failed`.
2. Claim order is ascending `(runAt, createdAt, id)`.
3. A job is runnable when pending and `runAt <= now`, or running with an expired lease.
4. Claim is atomic at the store boundary. A successful claim increments `attempts`, sets `running`, owner, and lease deadline.
5. Only the active lease owner may complete, fail, or heartbeat. Otherwise throw an error with code `LEASE_CONFLICT`.
6. `fail` uses exponential backoff: `baseDelayMs * 2^(attempts - 1)`. When attempts reach `maxAttempts`, status becomes `failed` and no lease remains.
7. Completing stores a cloned result. Payloads, results, errors, and returned snapshots must not expose mutable internal references.
8. Re-enqueueing the same non-empty idempotency key returns the original job and creates no duplicate, including after completion.
9. Reject invalid types, payloads containing unsupported cyclic structures, non-positive lease durations, and non-finite times using code `VALIDATION_ERROR`.
10. The memory store must provide atomic `claimRunnable(now, workerId, leaseMs)` behavior even when two claims start concurrently.

Do not use timers, global mutable state, external packages, filesystem storage, or network access.
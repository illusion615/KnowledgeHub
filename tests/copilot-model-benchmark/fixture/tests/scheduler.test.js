'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var api = require('../src');

function setup() {
  var now = 1000;
  var nextId = 0;
  var scheduler = api.createScheduler({
    clock: { now: function () { return now; } },
    idFactory: function () { nextId += 1; return 'job-' + nextId; },
    store: new api.MemoryStore(),
    maxAttempts: 2,
    baseDelayMs: 100
  });
  return { scheduler: scheduler, setNow: function (value) { now = value; } };
}

test('enqueue and claim a due job', async function () {
  var ctx = setup();
  var created = await ctx.scheduler.enqueue('email', { to: 'a@example.com' });
  var claimed = await ctx.scheduler.claim('worker-a', 50);
  assert.equal(created.status, 'pending');
  assert.equal(claimed.id, created.id);
  assert.equal(claimed.status, 'running');
  assert.equal(claimed.attempts, 1);
  assert.equal(claimed.leaseUntil, 1050);
});

test('future jobs wait and idempotency returns the original job', async function () {
  var ctx = setup();
  var first = await ctx.scheduler.enqueue('report', { n: 1 }, { runAt: 2000, idempotencyKey: 'daily' });
  var duplicate = await ctx.scheduler.enqueue('report', { n: 2 }, { idempotencyKey: 'daily' });
  assert.equal(duplicate.id, first.id);
  assert.equal(await ctx.scheduler.claim('worker-a', 50), null);
  ctx.setNow(2000);
  assert.equal((await ctx.scheduler.claim('worker-a', 50)).id, first.id);
});

test('only the lease owner completes and snapshots are cloned', async function () {
  var ctx = setup();
  var payload = { nested: { value: 1 } };
  var created = await ctx.scheduler.enqueue('work', payload);
  payload.nested.value = 9;
  var claimed = await ctx.scheduler.claim('worker-a', 50);
  assert.equal(claimed.payload.nested.value, 1);
  await assert.rejects(ctx.scheduler.complete(created.id, 'worker-b', {}), function (error) {
    return error.code === 'LEASE_CONFLICT';
  });
  var result = { ok: { value: true } };
  var completed = await ctx.scheduler.complete(created.id, 'worker-a', result);
  result.ok.value = false;
  assert.equal(completed.result.ok.value, true);
});

test('failure retries with exponential backoff then becomes terminal', async function () {
  var ctx = setup();
  var created = await ctx.scheduler.enqueue('work', {});
  await ctx.scheduler.claim('worker-a', 50);
  var retry = await ctx.scheduler.fail(created.id, 'worker-a', new Error('first'));
  assert.equal(retry.status, 'pending');
  assert.equal(retry.runAt, 1100);
  ctx.setNow(1100);
  await ctx.scheduler.claim('worker-b', 50);
  var terminal = await ctx.scheduler.fail(created.id, 'worker-b', new Error('second'));
  assert.equal(terminal.status, 'failed');
  assert.equal(terminal.leaseOwner, null);
});
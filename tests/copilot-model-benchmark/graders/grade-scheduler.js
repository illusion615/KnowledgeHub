'use strict';

var assert = require('node:assert/strict');
var path = require('path');
var fixtureRoot = process.argv[2];
var api;
var tests = [];

if (!fixtureRoot) throw new Error('Usage: grade-scheduler.js <fixture-root>');
api = require(path.resolve(fixtureRoot, 'src'));

function check(name, fn) { tests.push({ name: name, fn: fn }); }
function context(overrides) {
  var now = 1000;
  var id = 0;
  var scheduler = api.createScheduler(Object.assign({
    clock: { now: function () { return now; } },
    idFactory: function () { id += 1; return 'id-' + id; },
    store: new api.MemoryStore(),
    maxAttempts: 3,
    baseDelayMs: 100
  }, overrides || {}));
  return { scheduler: scheduler, setNow: function (value) { now = value; } };
}

check('claim order uses runAt createdAt id', async function () {
  var ctx = context();
  await ctx.scheduler.enqueue('a', {}, { runAt: 1000 });
  await ctx.scheduler.enqueue('b', {}, { runAt: 900 });
  assert.equal((await ctx.scheduler.claim('w', 20)).type, 'b');
});
check('concurrent claims are atomic', async function () {
  var ctx = context();
  await ctx.scheduler.enqueue('a', {});
  var claims = await Promise.all([ctx.scheduler.claim('w1', 20), ctx.scheduler.claim('w2', 20)]);
  assert.equal(claims.filter(Boolean).length, 1);
});
check('expired lease can be reclaimed', async function () {
  var ctx = context();
  var job = await ctx.scheduler.enqueue('a', {});
  await ctx.scheduler.claim('w1', 20);
  ctx.setNow(1021);
  var reclaimed = await ctx.scheduler.claim('w2', 20);
  assert.equal(reclaimed.id, job.id);
  assert.equal(reclaimed.attempts, 2);
});
check('heartbeat requires owner and extends lease', async function () {
  var ctx = context();
  var job = await ctx.scheduler.enqueue('a', {});
  await ctx.scheduler.claim('w1', 20);
  await assert.rejects(ctx.scheduler.heartbeat(job.id, 'w2', 20), function (error) { return error.code === 'LEASE_CONFLICT'; });
  assert.equal((await ctx.scheduler.heartbeat(job.id, 'w1', 40)).leaseUntil, 1040);
});
check('retry delay doubles', async function () {
  var ctx = context();
  var job = await ctx.scheduler.enqueue('a', {});
  await ctx.scheduler.claim('w1', 20);
  assert.equal((await ctx.scheduler.fail(job.id, 'w1', new Error('one'))).runAt, 1100);
  ctx.setNow(1100);
  await ctx.scheduler.claim('w2', 20);
  assert.equal((await ctx.scheduler.fail(job.id, 'w2', new Error('two'))).runAt, 1300);
});
check('third failure is terminal', async function () {
  var ctx = context();
  var job = await ctx.scheduler.enqueue('a', {});
  await ctx.scheduler.claim('w1', 1); await ctx.scheduler.fail(job.id, 'w1', 'one');
  ctx.setNow(1100); await ctx.scheduler.claim('w2', 1); await ctx.scheduler.fail(job.id, 'w2', 'two');
  ctx.setNow(1300); await ctx.scheduler.claim('w3', 1);
  var failed = await ctx.scheduler.fail(job.id, 'w3', 'three');
  assert.equal(failed.status, 'failed'); assert.equal(failed.leaseOwner, null);
});
check('completed idempotent job is reused', async function () {
  var ctx = context();
  var first = await ctx.scheduler.enqueue('a', {}, { idempotencyKey: 'same' });
  await ctx.scheduler.claim('w', 20); await ctx.scheduler.complete(first.id, 'w', {});
  assert.equal((await ctx.scheduler.enqueue('a', { changed: true }, { idempotencyKey: 'same' })).id, first.id);
});
check('snapshots are deeply isolated', async function () {
  var ctx = context();
  var payload = { a: [{ b: 1 }] };
  var created = await ctx.scheduler.enqueue('a', payload);
  try { created.payload.a[0].b = 9; } catch (error) {}
  payload.a[0].b = 8;
  assert.equal((await ctx.scheduler.get(created.id)).payload.a[0].b, 1);
});
check('cyclic payload is rejected', async function () {
  var ctx = context(); var payload = {}; payload.self = payload;
  await assert.rejects(ctx.scheduler.enqueue('a', payload), function (error) { return error.code === 'VALIDATION_ERROR'; });
});
check('invalid leases and times are rejected', async function () {
  var ctx = context();
  await assert.rejects(ctx.scheduler.enqueue('a', {}, { runAt: Infinity }), function (error) { return error.code === 'VALIDATION_ERROR'; });
  await ctx.scheduler.enqueue('a', {});
  await assert.rejects(ctx.scheduler.claim('w', 0), function (error) { return error.code === 'VALIDATION_ERROR'; });
});

(async function () {
  var passed = 0;
  var failures = [];
  for (var index = 0; index < tests.length; index += 1) {
    try { await tests[index].fn(); passed += 1; }
    catch (error) { failures.push({ name: tests[index].name, error: error.message }); }
  }
  console.log(JSON.stringify({ passed: passed, total: tests.length, failures: failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}());
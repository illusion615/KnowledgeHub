'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createTelemetry}=require('../scripts/jev-copilot-telemetry');
const {runProcess}=require('../scripts/jev-copilot-provider');
const timing=require('../posts/jev-system-one-research/arena-timing');
test('CLI observation records phase timing/byte counts, never content or arbitrary event names',()=>{
  let now=0;const t=createTelemetry(()=>now);now=3;t.spawned();now=10;
  const start=JSON.stringify({type:'session.start',data:{secret:'TEST-SECRET'}})+'\n';t.stdout(start.slice(0,5));now=20;t.stdout(start.slice(5));
  now=30;t.stdout(JSON.stringify({type:'assistant.message',data:{content:'TEST-SECRET'}})+'\n');
  t.stdout(JSON.stringify({type:'TEST-SECRET'})+'\n');t.stderr(Buffer.from('TEST-SECRET'));
  const r=t.snapshot();assert.equal(r.spawn_ms,3);assert.equal(r.first_stdout_ms,10);assert.equal(r.first_event_ms,20);assert.equal(r.assistant_message_ms,30);assert.equal(r.events['session.start'],1);assert.equal(r.stderr_bytes,11);assert.ok(!JSON.stringify(r).includes('TEST-SECRET'));
  const safe=timing.normalize({cli:{...r,raw:'TEST-SECRET',events:{...r.events,SECRET:99}}});assert.ok(!JSON.stringify(safe).includes('SECRET'));
});
test('process timeout exposes safe progress without retaining stderr',async()=>{
  await assert.rejects(runProcess(process.execPath,['-e','console.log(JSON.stringify({type:"session.start",data:{private:"TEST-SECRET"}}));console.error("TEST-SECRET");setInterval(()=>{},1000)'],{timeoutMs:150}),e=>{
    assert.equal(e.code,'copilot_timeout');assert.equal(e.process_telemetry.events['session.start'],1);assert.ok(e.process_telemetry.stdout_bytes>0);assert.ok(!JSON.stringify(e).includes('TEST-SECRET'));return true;
  });
});

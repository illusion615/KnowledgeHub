'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
const report=require('../posts/jev-system-one-research/arena-report');
const {createServer}=require('../scripts/jev-playground-server');
const config={seed:'continuous',control:'step',mode:'realtime',duration_s:null,max_decisions:null,consent:true,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}]};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function answer(req){return {ok:true,decision:Object.fromEntries(Object.entries(req.states[0].questions).map(([id,q])=>[id,Object.keys(q.criteria).find(k=>k.startsWith('fire_'))])),usage:{input_tokens:1,output_tokens:0,billing_usd:0}};}
function setup(t,options={}){let clock=0;const m=createArenaManager({auto:false,now:()=>clock,leaseMs:1e9,evaluate:async(team,req)=>answer(req),...options});t.after(()=>m.close());return {m,advance:ms=>{clock+=ms;},now:()=>clock};}
test('null is unlimited, missing decision cap is normalized, invalid infinity/zero remain rejected',()=>{
  assert.deepEqual(validateConfig(config),config);const omitted={...config};delete omitted.max_decisions;assert.equal(validateConfig(omitted).max_decisions,null);
  for(const patch of [{duration_s:0},{duration_s:Infinity},{duration_s:'unlimited'},{max_decisions:Infinity},{max_decisions:0}])assert.throws(()=>validateConfig({...config,...patch}));
});
test('unlimited continues beyond old duration/budget caps; Stop prevents any further dispatch',async t=>{
  let calls=0;const {m,advance}=setup(t,{evaluate:async(team,req)=>{calls++;assert.match(req.states[0].state,/time limit=none/);return answer(req);}});
  const start=m.start(config);for(let i=0;i<600;i++){advance(200);m.pulse();await flush();}
  let r=m.latest();assert.equal(r.status,'running');assert.ok(r.game.tick>450);assert.ok(r.metrics.every(s=>s.requests>10));assert.equal(r.result,null);
  m.stop(start.id);const before=calls;for(let i=0;i<20;i++){advance(200);m.pulse();await flush();}r=m.latest();assert.equal(calls,before);assert.equal(r.reason,'user_stopped');assert.equal(r.pending,0);assert.equal(r.result,null);
});
test('finite duration still ends a no-cap match, never at the old six-decision budget',async t=>{
  const {m,advance}=setup(t);m.start({...config,duration_s:30});for(let i=0;i<170;i++){advance(200);m.pulse();await flush();}
  const r=m.latest();assert.equal(r.status,'completed');assert.equal(r.game.tick,150);assert.notEqual(r.result.reason,'decision_budget');assert.ok(r.metrics.every(s=>s.requests>6));
});
test('rate admission waits before dispatch, resumes with fresh realtime input, and Stop removes uncharged queued work',async t=>{
  let tokens=2,calls=0;const requests=[];const {m,advance}=setup(t,{admit:()=>tokens>0?(tokens--,true):false,evaluate:async(team,req)=>{calls++;requests.push(req);return answer(req);}});
  const s=m.start(config);for(let i=0;i<20;i++){advance(200);m.pulse();await flush();}
  let r=m.latest();assert.equal(calls,2);assert.equal(r.status,'running');assert.ok(r.metrics.every(m=>m.phase==='rate_wait'&&m.errors===0&&m.wait_timings.rate_wait_ms>0));assert.ok(r.inflight.every(j=>j.phase==='rate_wait'&&j.request===null));
  const tick=r.game.tick;advance(60000);tokens=2;m.pulse();await flush();r=m.latest();assert.equal(calls,4);assert.match(requests[2].states[0].state,new RegExp('tick='+tick+';'));assert.ok(r.decisions[2].queue_ms>=60000);
  for(let i=0;i<10;i++){advance(200);m.pulse();await flush();}m.stop(s.id);await flush();assert.equal(m.latest().pending,0);tokens=2;m.pulse();await flush();assert.equal(calls,4);
});
test('sync rate-wait resumes without deadlock and keeps the shared snapshot frozen',async t=>{
  let tokens=1,calls=0;const inputs=[];const {m,advance}=setup(t,{admit:()=>tokens>0?(tokens--,true):false,evaluate:async(team,req)=>{calls++;inputs.push(req.states[0].state);return answer(req);}});
  m.start({...config,mode:'sync'});m.pulse();await flush();advance(60000);m.pulse();await flush();assert.equal(m.latest().game.tick,0);assert.equal(calls,1);
  tokens=1;m.pulse();await flush();assert.equal(calls,2);assert.equal(inputs[0],inputs[1]);assert.ok(m.latest().decisions.every(d=>d.applied));
});
test('long-match memory is bounded; cumulative means/counts and retention omissions remain truthful',async t=>{
  let calls=0,advance;const fixture=setup(t,{evaluate:async(team,req)=>{advance(++calls<50?1000:1);return answer(req);}});advance=fixture.advance;const m=fixture.m;
  m.start(config);for(let i=0;i<2050;i++){advance(200);m.pulse();await flush();}
  const r=m.latest();assert.equal(r.status,'running');assert.equal(r.frames.length,1800);assert.equal(r.decisions.length,200);assert.ok(r.retention.frames_dropped>0);assert.ok(r.retention.decisions_dropped>0);assert.equal(r.retention.decisions_total,r.metrics.reduce((n,s)=>n+s.finished,0));
  for(const s of r.metrics){assert.equal(s.percentile_samples,256);assert.equal(s.latencies.length,256);assert.equal(s.ages.length,256);assert.equal(s.mean_ms,s.total_elapsed_ms/s.finished);assert.ok(s.mean_ms>s.latencies.reduce((a,b)=>a+b,0)/256);assert.equal(s.usage.input_tokens,s.finished);}
  const d=report.create(r);assert.equal(d.decisions.length,200);assert.equal(d.coverage.full_tick_replay,false);assert.equal(d.coverage.decisions_omitted,r.retention.decisions_dropped);assert.equal(d.decisions[0].index,r.decisions[0].index);assert.equal(d.config.duration_s,null);assert.equal(d.config.max_decisions,null);
});
test('HTTP continuous cloud matches charge rolling admission per dispatch, wait at the limit, and stop queued work',async t=>{
  let calls=0;const server=createServer({maxCalls:2,arenaEvaluate:async(team,req)=>{calls++;return answer(req);},runner:{status:async()=>({'nanojev-fp32':{ready:true},'nanojev-4bit':{ready:true}})},copilot:{status:async()=>({available:true})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const origin='http://127.0.0.1:'+server.address().port,session=await(await fetch(origin+'/api/jev/status')).json();
  const send=async(action,body)=>{const response=await fetch(origin+'/api/jev/arena/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify(body)});assert.equal(response.status,200);return response.json();};
  const start=await send('start',{...config,teams:[{provider:'copilot',model:'fixture-a'},{provider:'copilot',model:'fixture-b'}]});let r;
  for(let i=0;i<30;i++){await new Promise(resolve=>setTimeout(resolve,100));r=await send('state',{id:start.id});if(r.metrics.every(m=>m.phase==='rate_wait'))break;}
  assert.equal(calls,2);assert.equal(r.status,'running');assert.ok(r.metrics.every(m=>m.phase==='rate_wait'&&m.errors===0));
  const stopped=await send('stop',{id:start.id});assert.equal(stopped.pending,0);await new Promise(resolve=>setTimeout(resolve,250));assert.equal(calls,2);
});
test('unlimited still honors a lost viewer lease, including while rate-limited',async t=>{
  let calls=0;const {m,advance}=setup(t,{leaseMs:100,admit:()=>false,evaluate:async()=>{calls++;}});m.start(config);m.pulse();advance(101);m.pulse();await flush();assert.equal(m.latest().reason,'viewer_disconnected');assert.equal(m.latest().pending,0);assert.equal(calls,0);
});

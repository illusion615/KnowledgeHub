'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const task=require('../posts/jev-system-one-research/arena-task');
const {createArenaManager}=require('../scripts/jev-arena');
const timing=require('../posts/jev-system-one-research/arena-timing');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function game(){const g=core.create('step-test','step');g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));g.rewards=[];return g;}
function cfg(extra={}){return {seed:'step-test',control:'step',mode:'realtime',duration_s:30,max_decisions:3,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}],consent:true,...extra};}
function answer(request){return {ok:true,decision:Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,id.startsWith('B')?'move_right':'move_left'])),usage:{input_tokens:100,output_tokens:0,billing_usd:0}};}
function manager(t,options={}){let clock=0;const m=createArenaManager({auto:false,now:()=>clock,evaluate:async(team,req)=>answer(req),...options});t.after(()=>m.close());return {m,advance:ms=>{clock+=ms;}};}
test('step move consumes exactly one attempt and one cell, never repeats until a new order',()=>{
  const g=game();assert.equal(g.version,'tank-v5-step');core.applyPlan(g,0,{B0:'move_right'});
  assert.equal(core.sideReady(g,0),false);for(let i=0;i<40;i++)core.step(g);
  assert.equal(g.tanks[0].x,2);assert.equal(g.stats[0].move_attempts,1);assert.equal(g.tanks[0].pending_action,false);assert.equal(core.sideReady(g,0),true);
  core.applyPlan(g,0,{B0:'move_right'});for(let i=0;i<4;i++)core.step(g);assert.equal(g.tanks[0].x,3);assert.equal(g.stats[0].move_attempts,2);
});
test('failed moves consume one action and keep feedback instead of hitting the wall indefinitely',()=>{
  const g=game();core.applyPlan(g,0,{B0:'move_left'});for(let i=0;i<40;i++)core.step(g);
  assert.equal(g.stats[0].blocked,1);assert.equal(g.stats[0].move_attempts,1);assert.equal(g.tanks[0].last_execution.outcome,'blocked_wall');
  assert.equal(g.tanks[0].pending_action,false);assert.ok(!('wait' in core.candidates(g,g.tanks[0])));
});
test('step fire is one attempt, respects reload, never auto-retries invalid geometry or auto-fires during idle',()=>{
  const g=game();Object.assign(g.tanks[2],{x:4,y:3});g.tanks[0].cooldown=3;
  core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<3;i++)core.step(g);
  assert.equal(g.stats[0].fire_attempts,0);assert.equal(g.tanks[0].pending_action,true);
  for(let i=0;i<40;i++)core.step(g);assert.equal(g.stats[0].fire_attempts,1);assert.equal(g.stats[0].shots,1);assert.equal(g.tanks[2].hp,88);
  core.applyPlan(g,0,{B0:'fire_R1'});for(let i=0;i<40;i++)core.step(g);assert.equal(g.stats[0].fire_attempts,2);assert.equal(g.stats[0].invalid_shots,1);
});
test('independent native/cloud sides can replan while a different compute resource is inferring',async t=>{
  const calls=[];let release;
  const {m,advance}=manager(t,{evaluate:(team,request,signal)=>{
    const side=Object.keys(request.states[0].questions)[0].startsWith('B')?0:1;calls.push({side,request});
    if(side===0)return Promise.resolve(answer(request));
    return new Promise((resolve,reject)=>{release=()=>resolve(answer(request));signal.addEventListener('abort',()=>reject(new Error('cancel')),{once:true});});
  }});
  const initial=m.start(cfg({teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]}));m.pulse();await flush();
  assert.equal(calls.length,2);assert.equal(calls[0].request.states[0].state,calls[1].request.states[0].state);
  for(let i=0;i<13;i++){advance(200);m.view(initial.id);m.pulse();await flush();}
  const live=m.view(initial.id);assert.equal(live.metrics[0].requests,3);assert.equal(live.metrics[1].requests,1);
  assert.equal(live.metrics[0].phase,'budget_idle');assert.ok(live.metrics[0].wait_timings.budget_idle_ms>0);
  assert.ok(calls[2].request.states[0].state.includes('LAST EXECUTION:'));assert.notEqual(calls[2].request.states[0].state,calls[0].request.states[0].state);
  assert.equal(live.scheduling,'independent_after_action');release();await flush();m.stop(initial.id);
});
test('real-time replans on the action-completion tick, without an extra 200ms cadence gap',async t=>{
  const calls=[];const {m,advance}=manager(t,{evaluate:async(team,request)=>{calls.push(request);return answer(request);}});
  const data=m.start(cfg({max_decisions:2}));
  for(let i=0;i<4;i++){advance(200);m.pulse();await flush();}
  assert.equal(m.view(data.id).game.tick,4);assert.equal(calls.length,4);
  assert.ok(calls[2].states[0].state.includes('STATE: tick=4;'));
  assert.ok(!calls[2].states[0].state.includes('LAST EXECUTION: none'));
  assert.equal(m.view(data.id).metrics[0].wait_timings.cadence_ms,200);
});
test('sync step mode freezes paired inputs and cannot request again before both action sets finish',async t=>{
  const calls=[],release=[];const {m}=manager(t,{evaluate:(team,request)=>{calls.push(request);return new Promise(resolve=>release.push(()=>resolve(answer(request))));}});
  const data=m.start(cfg({mode:'sync',teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]}));m.pulse();assert.equal(calls.length,2);
  release[0]();await flush();for(let i=0;i<3;i++)m.pulse();assert.equal(m.view(data.id).game.tick,0);
  release[1]();await flush();for(let i=0;i<4;i++)m.pulse();assert.equal(calls.length,2);assert.equal(m.view(data.id).game.tick,4);
  m.pulse();assert.equal(calls.length,4);assert.equal(calls[2].states[0].state,calls[3].states[0].state);
  release[2]();release[3]();await flush();m.stop(data.id);
});
test('same local service is FIFO serialized, records queue time and captures fresh input at dispatch',async t=>{
  const calls=[],release=[];let concurrent=0;
  const {m,advance}=manager(t,{evaluate:(team,request)=>{assert.equal(++concurrent,1);calls.push(request);return new Promise(resolve=>release.push(()=>{concurrent--;resolve(answer(request));}));}});
  const data=m.start(cfg({teams:[{provider:'nanojev-fp32'},{provider:'nanojev-fp32'}]}));m.pulse();
  assert.equal(calls.length,1);assert.equal(m.view(data.id).inflight[1].phase,'queued_no_snapshot');assert.equal(m.view(data.id).inflight[1].request,null);
  advance(1000);for(let i=0;i<5;i++)m.pulse();release[0]();await flush();
  assert.equal(calls.length,2);assert.notEqual(calls[0].states[0].state,calls[1].states[0].state);
  advance(100);release[1]();await flush();const rows=m.view(data.id).decisions;
  assert.equal(rows[1].queue_ms,1000);assert.equal(rows[1].provider_ms,100);assert.equal(rows[1].elapsed_ms,1100);assert.ok(rows[1].state_tick>rows[0].state_tick);
  m.stop(data.id);
});
test('stop removes queued jobs without dispatching or charging them and rejects late plans',async t=>{
  let calls=0,release;const {m}=manager(t,{evaluate:(team,request)=>{calls++;return new Promise(resolve=>{release=()=>resolve(answer(request));});}});
  const data=m.start(cfg({teams:[{provider:'nanojev-fp32'},{provider:'nanojev-fp32'}]}));m.pulse();m.stop(data.id);release();await flush();
  const stopped=m.view(data.id);assert.equal(calls,1);assert.equal(stopped.pending,0);assert.equal(stopped.decisions.length,1);assert.equal(stopped.decisions[0].applied,false);assert.equal(stopped.metrics[1].requests,0);
});
test('budget exhaustion is explicit, does not increase calls and completes only after outstanding actions/projectiles settle',async t=>{
  let calls=0;const {m,advance}=manager(t,{evaluate:async(team,request)=>{calls++;return answer(request);}});
  const data=m.start(cfg({max_decisions:1}));
  for(let i=0;i<20;i++){advance(200);m.view(data.id);m.pulse();await flush();}
  const end=m.view(data.id);assert.equal(calls,2);assert.equal(end.status,'completed');assert.equal(end.result.reason,'decision_budget');assert.ok(end.game.tick<150);
  assert.ok(end.metrics.every(s=>s.requests===1));assert.equal(end.decision_protocol,task.versionFor(end.game));
});
test('mean and nearest-rank p50 expose the supplied bimodal trace instead of hiding the slow half',async t=>{
  const times=[11866,2278,11784,1908,11288,1729],releases=[];
  const {m,advance}=manager(t,{evaluate:(team,request)=>new Promise(resolve=>releases.push(()=>resolve({ok:true,decision:Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,'hold']))})))});
  const data=m.start(cfg({control:'strategic',mode:'sync',max_decisions:6,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]}));
  for(let round=0;round<6;round++){
    for(let guard=0;releases.length<(round+1)*2&&guard<200;guard++){m.view(data.id);m.pulse();await flush();}
    assert.equal(releases.length,(round+1)*2);advance(times[round]);releases[round*2]();releases[round*2+1]();await flush();m.view(data.id);
  }
  const stats=m.view(data.id).metrics[0];assert.deepEqual(stats.latencies,times);assert.equal(stats.p50_ms,2278);assert.equal(stats.p95_ms,11866);assert.equal(stats.mean_ms,40853/6);
});
test('timing metadata stays bounded and secret-free',()=>{
  const normalized=timing.normalize({node_health_ms:2,token:'SECRET',native:{timing_protocol:'nanojev-stages-v1',runtime_id:'a'.repeat(32),first_inference:true,idle_before_ms:null,prepare_ms:4,forward_ms:10000,softmax_eval_ms:12,decode_ms:1,batch_shapes:[[12,450],['bad',-1]],candidate_counts:[6,6],private:'SECRET'}});
  assert.equal(normalized.native.forward_ms,10000);assert.equal(normalized.native.idle_before_ms,null);assert.deepEqual(normalized.native.batch_shapes,[[12,450]]);assert.ok(!JSON.stringify(normalized).includes('SECRET'));
  assert.equal(timing.normalize({native:{forward_ms:-1}}).native.forward_ms,null);
});

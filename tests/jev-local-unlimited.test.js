'use strict';
// Injected evaluators only: no model, GPU or cloud calls.
const test=require('node:test'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
const core=require('../posts/jev-system-one-research/arena-core');
const cfg={seed:'local-unlimited',control:'step',mode:'realtime',duration_s:null,max_decisions:null,rate_limit_mode:'continue-world',teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}],consent:true};
const result=()=>({request:{},response:{model:'fixture',answers:{team:{choice:'engineering'},enough_info:{noul:1},severity:{score:1}}}});
const answer=req=>({ok:true,decision:Object.fromEntries(Object.entries(req.states[0].questions).map(([id,q])=>[id,Object.keys(q.criteria).find(k=>k.startsWith('fire_'))]))});
async function server(t,options={}){
  const s=createServer({maxCalls:1,runner:{status:async()=>({'nanojev-fp32':{ready:true},'nanojev-4bit':{ready:true}}),evaluate:async()=>result()},copilot:{status:async()=>({available:true}),evaluate:async()=>({ok:true})},arenaEvaluate:async(team,req)=>answer(req),...options});
  await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>{s.closeAllConnections();return new Promise(r=>s.close(r));});const origin='http://127.0.0.1:'+s.address().port,session=await fetch(origin+'/api/jev/status').then(r=>r.json());
  return {session,send:(route,body)=>fetch(origin+'/api/jev/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify(body)})};
}
test('local Playground, benchmark, probes and bounded arena runs neither consume nor depend on external quota',async t=>{
  const s=await server(t,{arenaOptions:{auto:false}});assert.equal(s.session.limits.local_max_calls_per_minute,null);assert.equal(s.session.limits.rate_limit_scope,'external_calls_only');
  for(let i=0;i<45;i++)assert.equal((await s.send('evaluate',{provider:i%2?'nanojev-fp32':'nanojev-4bit',state:'fixture',consent:true})).status,200);
  const bounded=await s.send('arena/start',{...cfg,max_decisions:10});assert.equal(bounded.status,200);await s.send('arena/stop',{id:(await bounded.json()).id});
  const cloud={provider:'copilot',model:'fixture',state:'fixture',consent:true};assert.equal((await s.send('benchmark/evaluate',cloud)).status,200);assert.equal((await s.send('benchmark/evaluate',cloud)).status,429);
  for(const provider of ['nanojev-fp32','nanojev-4bit']){assert.equal((await s.send('evaluate',{provider,state:'fixture',consent:true})).status,200);assert.equal((await s.send('benchmark/evaluate',{provider,state:'fixture',consent:true})).status,200);}
  const request=core.request(core.create('probe','step'),0);for(let i=0;i<4;i++)assert.equal((await s.send('arena/probe',{consent:true,jobs:[{provider:'nanojev-fp32',request},{provider:'nanojev-4bit',request}]})).status,200);
  const started=await s.send('arena/start',{...cfg,max_decisions:10});assert.equal(started.status,200);const m=await started.json();assert.equal((await s.send('arena/stop',{id:m.id})).status,200);
  assert.equal((await s.send('arena/start',{...cfg,max_decisions:1,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture'}]})).status,429,'Bounded cloud calls still reserve quota');
});
test('mixed realtime matches keep local dispatching after the cloud budget is exhausted',async t=>{
  const calls={local:0,cloud:0},s=await server(t,{arenaEvaluate:async(team,req)=>{calls[team.provider==='copilot'?'cloud':'local']++;return answer(req);}});
  const start=await s.send('arena/start',{...cfg,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture'}]});assert.equal(start.status,200);const m=await start.json();let r;
  for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,100));r=await s.send('arena/state',{id:m.id}).then(r=>r.json());if(calls.local>=4)break;}
  assert.ok(calls.local>=4);assert.equal(calls.cloud,1);assert.equal(r.metrics[0].wait_timings.rate_wait_ms,0);assert.equal(r.metrics[1].phase,'rate_wait');assert.equal(r.simulation_paused_for_rate,false);
  await s.send('arena/stop',{id:m.id});const before={...calls};await new Promise(r=>setTimeout(r,250));assert.deepEqual(calls,before);
});
test('local requests still respect the single active experiment lock',async t=>{
  let release,entered;const ready=new Promise(r=>{entered=r;});const s=await server(t,{runner:{status:async()=>({}),evaluate:async()=>{entered();await new Promise(r=>{release=r;});return result();}}});
  const first=s.send('evaluate',{provider:'nanojev-fp32',state:'fixture',consent:true});await ready;
  try{const busy=await s.send('benchmark/evaluate',{provider:'nanojev-4bit',state:'fixture',consent:true});assert.equal(busy.status,429);assert.equal((await busy.json()).error.code,'busy');}finally{release();}
  assert.equal((await first).status,200);
});

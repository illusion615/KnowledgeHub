'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {run,cases,requestFor}=require('../scripts/jev-arena-lab');
const {capture}=require('../scripts/jev-arena-capture');
const {saveDiagnostic}=require('../scripts/jev-arena-records');
const {createArenaManager}=require('../scripts/jev-arena');
const {createServer}=require('../scripts/jev-playground-server');
const cfg={seed:'archive-fixture',control:'step',mode:'realtime',duration_s:30,max_decisions:1,consent:true,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}]};
const answer=req=>({ok:true,decision:Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up'])),usage:{input_tokens:1,output_tokens:0,billing_usd:0}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function directory(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-lab-'));fs.chmodSync(dir,0o700);t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('lab requires consent and a bounded exact budget before invoking any model',async t=>{
  let calls=0;const options={split:'development',profiles:['original'],output:directory(t),maxCalls:4,guard:async()=>{},evaluate:async()=>{calls++;}};
  await assert.rejects(run(options),/consent/);await assert.rejects(run({...options,consent:true,maxCalls:3}),/budget/);
  await assert.rejects(run({...options,consent:true,profiles:['copilot']}),/profile/);assert.equal(calls,0);
});
test('experimental profiles retain every choice and geometry assistance is explicit, not a repair',()=>{
  for(const f of [...cases('development'),...cases('heldout')]){
    const original=requestFor(f.game,f.side,'original');
    for(const profile of ['focused','geometry-assisted']){
      const req=requestFor(f.game,f.side,profile);
      for(const [id,q] of Object.entries(req.states[0].questions)){
        assert.deepEqual(Object.keys(q.criteria),Object.keys(original.states[0].questions[id].criteria));
        if(profile==='geometry-assisted')assert.ok(Object.values(q.criteria).every(s=>s.includes('Geometry:')));
      }
    }
  }
  assert.equal(cases('latency').length,6);
});
test('lab persists each completed call, uses only local models and refuses evidence overwrite',async t=>{
  const dir=directory(t);let calls=0;
  const options={split:'development',profiles:['original'],output:dir,maxCalls:4,consent:true,guard:async()=>{},evaluate:async(team,req)=>{assert.match(team.provider,/^nanojev-/);calls++;return answer(req);}};
  assert.equal((await run(options)).length,4);assert.equal(calls,4);
  assert.equal(fs.readFileSync(path.join(dir,'receipts.jsonl'),'utf8').trim().split('\n').length,4);
  assert.equal(fs.statSync(path.join(dir,'receipts.jsonl')).mode&0o077,0);
  await assert.rejects(run(options));assert.equal(calls,4);
});
test('lab stops on first serial failure without retry or fallback, retaining the failure receipt',async t=>{
  const dir=directory(t);let calls=0;
  await assert.rejects(run({split:'development',profiles:['original'],output:dir,maxCalls:4,consent:true,guard:async()=>{},evaluate:async()=>{calls++;throw new Error('private token detail');}}),/local_failed/);
  assert.equal(calls,1);const text=fs.readFileSync(path.join(dir,'receipts.jsonl'),'utf8');assert.ok(!text.includes('private token'));assert.equal(JSON.parse(text).error,'local_failed');
});
test('settled archive is once-only, includes cancelled in-flight receipts, and read-only latest does not renew lease',async t=>{
  let clock=0,saves=0,saved;const releases=[];
  const m=createArenaManager({auto:false,now:()=>clock,leaseMs:100,evaluate:async(team,req)=>new Promise(resolve=>releases.push(()=>resolve(answer(req)))),onSettled:record=>{saves++;saved=record;}});t.after(()=>m.close());
  const initial=m.start({...cfg,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]});m.pulse();clock=101;
  assert.equal(m.latest().status,'running');m.pulse();assert.equal(m.latest().reason,'viewer_disconnected');assert.equal(saves,0);
  releases.forEach(f=>f());await flush();assert.equal(saves,1);assert.equal(saved.pending,0);assert.equal(saved.decisions.length,2);assert.ok(saved.decisions.every(d=>!d.applied));
  m.stop(initial.id);m.close();assert.equal(saves,1);assert.equal(m.latest().archive_status,'saved');
});
test('completed sync match archives only after pair and all actions settle; sink failure does not change result',async t=>{
  for(const throws of [false,true]){
    let saves=0;const m=createArenaManager({auto:false,evaluate:async(team,req)=>answer(req),onSettled:record=>{saves++;assert.equal(record.pending,0);if(throws)throw new Error('disk');}});t.after(()=>m.close());
    m.start({...cfg,mode:'sync'});for(let i=0;i<12;i++){m.pulse();await flush();}
    assert.equal(m.latest().status,'completed');assert.equal(m.latest().result.reason,'decision_budget');assert.equal(saves,1);assert.equal(m.latest().archive_status,throws?'failed':'saved');
  }
});
test('private archive is allowlisted, exclusive and rejects public/symlink directories',t=>{
  const dir=directory(t),m=createArenaManager({auto:false,evaluate:async(team,req)=>answer(req)});t.after(()=>m.close());
  const start=m.start(cfg);m.stop(start.id);const record=m.latest();record.secret='do-not-write';
  const file=saveDiagnostic(record,dir),text=fs.readFileSync(file,'utf8');assert.ok(!text.includes('do-not-write'));assert.equal(JSON.parse(text).provenance,'local-server-record');assert.equal(fs.statSync(file).mode&0o077,0);
  assert.throws(()=>saveDiagnostic(record,dir),/EEXIST/);fs.chmodSync(dir,0o755);assert.throws(()=>saveDiagnostic(record,dir),/unsafe_record_directory/);fs.chmodSync(dir,0o700);
  const link=path.join(dir,'link');fs.symlinkSync(dir,link);assert.throws(()=>saveDiagnostic(record,link),/unsafe_record_directory/);
});
test('capture latest requires origin/CSRF, never invokes inference and exports without exposing CSRF',async t=>{
  let calls=0;const server=createServer({arenaOptions:{auto:false},arenaEvaluate:async()=>{calls++;},runner:{status:async()=>({'nanojev-fp32':{ready:true},'nanojev-4bit':{ready:true}})},copilot:{status:async()=>({available:false})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const origin='http://127.0.0.1:'+server.address().port,output=directory(t),status=await(await fetch(origin+'/api/jev/status')).json();
  const send=(action,body,csrf=status.csrf)=>fetch(origin+'/api/jev/arena/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':csrf},body:JSON.stringify(body)});
  await assert.rejects(capture({origin,output}),/no_match/);assert.equal((await send('latest',{},'wrong')).status,403);assert.equal((await send('latest',{id:'extra'})).status,400);
  const match=await(await send('start',cfg)).json();await assert.rejects(capture({origin,output}),/match_still_running/);await send('stop',{id:match.id});
  const receipt=await capture({origin,output});assert.equal(receipt.id,match.id);assert.equal(calls,0);assert.ok(!fs.readFileSync(receipt.file,'utf8').includes(status.csrf));
  await assert.rejects(capture({origin:'https://example.com',output}),/loopback_origin_required/);
});
test('local probe retains match lock, rejects cloud and requires consent, without a per-minute quota',async t=>{
  const releases=[];let calls=0;const server=createServer({maxCalls:2,arenaOptions:{auto:false},arenaEvaluate:async(team,req)=>{calls++;return new Promise(resolve=>releases.push(()=>resolve(answer(req))));},runner:{status:async()=>({'nanojev-fp32':{ready:true},'nanojev-4bit':{ready:true}})},copilot:{status:async()=>({available:false})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const origin='http://127.0.0.1:'+server.address().port,session=await(await fetch(origin+'/api/jev/status')).json();
  const send=(action,body)=>fetch(origin+'/api/jev/arena/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify(body)});
  const f=cases('development')[0],request=requestFor(f.game,f.side,'original');
  assert.equal((await send('probe',{consent:true,jobs:[{provider:'copilot',request}]})).status,400);
  assert.equal((await send('probe',{jobs:[{provider:'nanojev-fp32',request}]})).status,400);assert.equal(calls,0);
  const pending=send('probe',{consent:true,jobs:['nanojev-fp32','nanojev-4bit'].map(provider=>({provider,request}))});
  for(let i=0;i<100&&calls<2;i++)await new Promise(resolve=>setTimeout(resolve,1));assert.equal(calls,2);
  assert.equal((await(await fetch(origin+'/api/jev/status')).json()).experiment_busy,true);
  assert.equal((await send('start',cfg)).status,429);
  releases.forEach(f=>f());const results=await(await pending).json();assert.equal(results.results.length,2);assert.ok(results.results.every(r=>r.lab_elapsed_ms>=0));
  const next=send('probe',{consent:true,jobs:[{provider:'nanojev-fp32',request}]});
  for(let i=0;i<100&&calls<3;i++)await new Promise(resolve=>setTimeout(resolve,1));assert.equal(calls,3);releases[2]();assert.equal((await next).status,200);
});

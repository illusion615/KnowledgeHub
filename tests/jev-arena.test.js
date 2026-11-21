'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const task=require('../posts/jev-system-one-research/arena-task');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
const {createServer}=require('../scripts/jev-playground-server');
const {normalize,createArenaProvider,parseCopilotPlan}=require('../scripts/jev-arena-provider');
const local=require('../scripts/jev-local-provider');
const cli=require('../scripts/jev-copilot-provider');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const config=(overrides={})=>({seed:'fixture',mode:'realtime',duration_s:30,max_decisions:2,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}],consent:true,...overrides});
const plan=request=>Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,'hold']));
const result=request=>({ok:true,decision:plan(request),usage:{input_tokens:100,output_tokens:0,billing_usd:0}});
function manager(t,options={}){let clock=0;const m=createArenaManager({auto:false,now:()=>clock,evaluate:async(team,req)=>result(req),...options});t.after(()=>m.close());return {m,advance:ms=>{clock+=ms;}};}
test('seeded maps are reproducible, rotationally symmetric and connect spawns/rewards across 100 seeds',()=>{
  for(let i=0;i<100;i++){
    const g=core.create('seed-'+i);assert.deepEqual(g,core.create('seed-'+i));
    assert.ok(g.map.join('').split('#').length-1>40);
    for(let y=0;y<9;y++)for(let x=0;x<13;x++)assert.equal(g.map[y][x],g.map[8-y][12-x]);
    for(const p of g.tanks.slice(1).concat(g.rewards))assert.ok(core.path(g.map,g.tanks[0],p).length);
  }
  assert.notDeepEqual(core.create('a').map,core.create('b').map);
});
test('both sides share byte-identical public state; hidden orders never leak into observations',()=>{
  const g=core.create('info'),before=core.observation(g);g.tanks[0].order='north';
  assert.equal(core.observation(g),before);
  assert.equal(core.request(g,0).states[0].state,core.request(g,1).states[0].state);
  assert.deepEqual(Object.keys(core.request(g,0).states[0].questions),['B0','B1']);
  assert.deepEqual(Object.keys(core.request(g,1).states[0].questions),['R0','R1']);
});
test('action contract enforces living tanks, exact keys and enumerated strategies',()=>{
  const g=core.create('actions'),req=core.request(g,0);
  assert.deepEqual(core.validatePlan({B0:'repair',B1:'attack0'},req),{B0:'repair',B1:'attack0'});
  for(const p of [{B0:'hold'}, {B0:'eval',B1:'hold'}, {B0:'hold',B1:'hold',R0:'hold'}, null, []])assert.throws(()=>core.validatePlan(p,req),/arena_invalid_plan/);
  g.tanks[0].hp=0;assert.deepEqual(Object.keys(core.request(g,0).states[0].questions),['B1']);
  g.rewards=[];assert.ok(!('repair' in core.request(g,0).states[0].questions.B1.criteria));
});
test('v2 removes redundant retreat/support choices at spawn but retains an honest stationary hold',()=>{
  const g=core.create('tank-2026'),tank=g.tanks[0],choices=core.candidates(g,tank);
  assert.equal(g.version,'tank-v2');assert.ok(!('retreat' in choices));assert.ok(!('support' in choices));assert.ok('hold' in choices);
  assert.throws(()=>core.validatePlan({B0:'retreat',B1:'hold'},core.request(g,0)),/arena_invalid_plan/);
  tank.x=2;assert.ok('retreat' in core.candidates(g,tank));assert.ok('support' in core.candidates(g,tank));
  const holding=core.create('tank-2026'),before=holding.tanks.map(t=>[t.x,t.y]);
  for(let i=0;i<40;i++)core.step(holding);
  assert.deepEqual(holding.tanks.map(t=>[t.x,t.y]),before);assert.ok(holding.stats.every(s=>s.moved===0));
  assert.ok(holding.tanks.every(t=>t.movement==='holding'));
});
test('reported stationary decisions reproduce no movement for the documented reasons, not a paused engine',()=>{
  for(const [order,reason] of [['retreat','at_spawn'],['support','support_range'],['hold','holding']]){
    const g=core.create('tank-2026');g.tanks.forEach(t=>{t.order=order;});for(let i=0;i<40;i++)core.step(g);
    assert.equal(g.tick,40);assert.ok(g.stats.every(s=>s.moved===0));assert.ok(g.tanks.every(t=>t.movement===reason));
  }
});
test('regression: north/pursuit pass the tank-2026 first-step traffic jam instead of freezing allies',()=>{
  for(const order of ['north','attack0']){
    const g=core.create('tank-2026');g.tanks.forEach(t=>{t.order=order;});
    for(let i=0;i<40;i++)core.step(g);
    assert.ok(g.stats.every(s=>s.moved>8),order+' must actually advance, not merely preserve symmetry');
    assert.ok(g.tanks.every(t=>t.moved_cells>2));assert.ok(g.stats.some(s=>s.blocked>0),'Contested movement remains measured');
  }
});
test('movement never enters walls or overlaps live tanks across seeded traffic scenarios',()=>{
  for(let seed=0;seed<40;seed++){
    const g=core.create('traffic-'+seed);g.tanks.forEach(t=>{t.order='attack0';});
    for(let i=0;i<80;i++){
      core.step(g);const alive=g.tanks.filter(t=>t.hp>0);
      assert.equal(new Set(alive.map(t=>t.x+','+t.y)).size,alive.length);
      assert.ok(alive.every(t=>core.walkable(g.map,t.x,t.y)));
    }
    assert.ok(g.stats.every(s=>s.moved>0));
  }
});
test('BFS and equal controllers preserve rotational symmetry under mirrored tactics',()=>{
  const g=core.create('symmetry');core.applyPlan(g,0,{B0:'attack0',B1:'repair'});core.applyPlan(g,1,{R0:'attack0',R1:'repair'});
  for(let tick=0;tick<80;tick++){
    core.step(g);
    for(const i of [0,1]){const a=g.tanks[i],b=g.tanks[i+2];assert.equal(a.x,12-b.x);assert.equal(a.y,8-b.y);assert.equal(a.hp,b.hp);}
    assert.deepEqual(g.stats[0],g.stats[1]);
  }
});
test('walls block shooting, damage is simultaneous, and time-limit winner is not called accuracy',()=>{
  const g=core.create('combat');g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));
  Object.assign(g.tanks[0],{x:4,y:4,hp:1});Object.assign(g.tanks[2],{x:6,y:4,hp:1});g.tanks[1].hp=0;g.tanks[3].hp=0;
  g.map[4]=g.map[4].slice(0,5)+'#'+g.map[4].slice(6);
  core.step(g);assert.equal(g.tanks[0].hp,1);assert.equal(g.bullets.length,0);
  g.map[4]='#...........#';core.step(g);core.step(g);
  assert.equal(g.tanks[0].hp,0);assert.equal(g.tanks[2].hp,0);assert.equal(core.result(g,false).winner,null);
  assert.equal(core.result(core.create('draw'),true).winner,null);
});
test('reward pickups implement repair, shield and timed power without crossing walls',()=>{
  for(const type of ['repair','shield','power']){
    const g=core.create('rewards');const reward=g.rewards.find(r=>r.type===type),t=g.tanks[0];Object.assign(t,{x:reward.x,y:reward.y,hp:50});
    core.step(g);assert.equal(g.stats[0].rewards,1);assert.ok(!g.rewards.includes(reward));
    if(type==='repair')assert.equal(t.hp,80);if(type==='shield')assert.equal(t.shield,30);if(type==='power')assert.equal(t.power_until,31);
  }
});
function primitiveFixture(){
  const g=core.create('primitive','primitive');
  g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));
  Object.assign(g.tanks[0],{x:2,y:4});Object.assign(g.tanks[2],{x:6,y:4});g.tanks[1].hp=0;g.tanks[3].hp=0;g.rewards=[];return g;
}
test('forced action has no wait/hold and does not invent actions before the first model order',()=>{
  const g=primitiveFixture(),choices=core.candidates(g,g.tanks[0]);
  assert.equal(g.version,'tank-v4-active');assert.ok('move_up' in choices&&'move_right' in choices&&'fire_R0' in choices);
  assert.equal(g.tanks[0].order,'awaiting_order');
  assert.throws(()=>core.validatePlan({B0:'wait'},core.request(g,0)));
  for(const key of ['wait','hold','repair','power','attack0','north'])assert.ok(!(key in choices));
  assert.throws(()=>core.validatePlan({B0:'attack0'},core.request(g,0)));
  for(let i=0;i<10;i++)core.step(g);
  assert.equal(g.bullets.length,0);assert.equal(g.stats[0].damage,0);assert.equal(g.tanks[0].hp,100);
  assert.equal(core.request(g,0).states[0].state,core.request(g,1).states[0].state);
});
test('primitive movement repeats one absolute direction, collects pickups, stops at walls and never silently detours or shoots',()=>{
  const g=primitiveFixture();g.map[4]=g.map[4].slice(0,4)+'#'+g.map[4].slice(5);
  g.rewards=[{x:3,y:4,type:'repair'}];g.tanks[0].hp=50;
  assert.ok('fire_R0' in core.candidates(g,g.tanks[0]),'Model, not an action mask, must judge the blocked firing line');
  core.applyPlan(g,0,{B0:'move_right'});for(let i=0;i<16;i++)core.step(g);
  assert.equal(g.tanks[0].x,3);assert.equal(g.tanks[0].y,4);assert.equal(g.tanks[0].hp,80);
  assert.equal(g.tanks[0].movement,'blocked_wall');assert.equal(g.stats[0].moved,1);assert.ok(g.stats[0].blocked>0);
  assert.equal(g.stats[0].rewards,1);assert.equal(g.stats[0].damage,0);assert.equal(g.bullets.length,0);
  assert.ok('move_right' in core.candidates(g,g.tanks[0]));
  assert.equal(g.stats[0].move_attempts,4);assert.equal(g.stats[0].blocked,3);
});
test('primitive fire names one enemy, remains stationary and does not switch targets when its line becomes invalid',()=>{
  const g=primitiveFixture();core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<4;i++)core.step(g);
  assert.equal(g.tanks[0].x,2);assert.equal(g.tanks[2].hp,88);assert.equal(g.stats[0].damage,12);
  g.tanks[2].y=5;Object.assign(g.tanks[3],{hp:100,x:5,y:4});
  for(let i=0;i<20;i++)core.step(g);
  assert.equal(g.tanks[3].hp,100);assert.equal(g.stats[0].damage,12);assert.equal(core.stationaryReason(g,g.tanks[0]),'out_of_range');
  const req=core.request(g,0);assert.ok('fire_R0' in req.states[0].questions.B0.criteria);assert.ok('fire_R1' in req.states[0].questions.B0.criteria);
  assert.equal(g.stats[0].shots,1);assert.equal(g.stats[0].hits,1);assert.equal(g.stats[0].invalid_shots,3);
  assert.equal(g.stats[0].fire_attempts,g.stats[0].shots+g.stats[0].invalid_shots);
});
test('configuration requires explicit consent and bounds all caller-controlled values',()=>{
  assert.deepEqual(validateConfig(config()),config());
  for(const patch of [{consent:false},{seed:'../x'},{duration_s:3600},{max_decisions:0},{max_decisions:11},{teams:[{provider:'copilot',model:'--allow-all'},{provider:'nanojev-fp32'}]},{mode:'auto'},{control:'custom'},{command:'echo'}])assert.throws(()=>validateConfig(config(patch)));
});
test('sync freezes simulation until both actual responses return and shares one snapshot',async t=>{
  const requests=[],releases=[];const {m,advance}=manager(t,{evaluate:(team,req)=>{requests.push(req);return new Promise(resolve=>releases.push(()=>resolve(result(req))));}});
  const initial=m.start(config({mode:'sync',teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]}));m.pulse();assert.equal(requests.length,2);
  assert.equal(requests[0].states[0].state,requests[1].states[0].state);
  advance(2000);m.view(initial.id);m.pulse();assert.equal(m.view(initial.id).game.tick,0);
  releases[0]();await flush();m.pulse();assert.equal(m.view(initial.id).game.tick,0);
  releases[1]();await flush();m.pulse();assert.equal(m.view(initial.id).game.tick,1);
  assert.ok(m.view(initial.id).decisions.every(r=>r.applied&&r.state_age_ms===0));
});
test('real time advances while waiting; fast orders apply first and stale age is measured, not invented',async t=>{
  const releases=[];const {m,advance}=manager(t,{evaluate:(team,req)=>new Promise(resolve=>releases.push(()=>resolve({...result(req),decision:Object.fromEntries(Object.keys(plan(req)).map(id=>[id,'north']))})))});
  const initial=m.start(config());m.pulse();releases[0]();await flush();
  assert.equal(m.view(initial.id).game.tanks[0].order,'north');assert.equal(m.view(initial.id).game.tanks[2].order,'hold');
  for(let i=0;i<6;i++){advance(200);m.view(initial.id);m.pulse();}releases[1]();await flush();
  const data=m.view(initial.id);assert.ok(data.metrics[1].stale>0);assert.ok(data.decisions[1].state_age_ms>=1000);assert.equal(data.game.tanks[2].order,'north');
});
test('first-order latency includes the real initial gap and sync barrier, not a model wait choice',async t=>{
  for(const mode of ['realtime','sync']){
    const releases=[],{m,advance}=manager(t,{evaluate:(team,request)=>new Promise(resolve=>releases.push(()=>resolve({...result(request),decision:Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,id.startsWith('B')?'move_right':'move_left']))})))});
    const initial=m.start(config({mode,control:'primitive'}));m.pulse();advance(500);
    assert.equal(m.view(initial.id).metrics[0].first_order_wait_ms,500);
    releases[0]();await flush();advance(700);releases[1]();await flush();
    assert.deepEqual(m.view(initial.id).metrics.map(s=>s.first_order_wait_ms),mode==='sync'?[1200,1200]:[500,1200]);
    advance(500);assert.deepEqual(m.view(initial.id).metrics.map(s=>s.first_order_wait_ms),mode==='sync'?[1200,1200]:[500,1200]);
  }
});
test('same MLX service is never called concurrently; queue priority alternates and call cap is respected',async t=>{
  const sides=[];let concurrent=0;const {m,advance}=manager(t,{evaluate:async(team,req)=>{assert.equal(++concurrent,1);sides.push(Object.keys(req.states[0].questions)[0][0]);await flush();concurrent--;return result(req);}});
  const initial=m.start(config({teams:[{provider:'nanojev-fp32'},{provider:'nanojev-fp32'}]}));
  for(let i=0;i<160;i++){advance(200);m.view(initial.id);m.pulse();await flush();await flush();}
  assert.deepEqual(sides,['B','R','R','B']);assert.equal(m.view(initial.id).status,'completed');assert.equal(m.replay(initial.id).frames.length,151);
  assert.ok(m.view(initial.id).metrics.every(s=>s.requests===2));
});
test('lost heartbeat stops model work; late replies never apply and no new game starts during cleanup',async t=>{
  const releases=[],signals=[];const {m,advance}=manager(t,{leaseMs:100,evaluate:(team,req,signal)=>{signals.push(signal);return new Promise(resolve=>releases.push(()=>resolve(result(req))));}});
  const initial=m.start(config());m.pulse();advance(101);m.pulse();
  assert.equal(m.view(initial.id,false).reason,'viewer_disconnected');assert.ok(signals.every(s=>s.aborted));assert.throws(()=>m.start(config()),/busy/);
  releases.forEach(fn=>fn());await flush();assert.ok(m.view(initial.id).decisions.every(r=>!r.applied));assert.equal(m.busy(),false);
});
test('provider error stops the match with safe diagnostics and no winner or fallback',async t=>{
  const {m}=manager(t,{evaluate:async()=>{throw new Error('PRIVATE TOKEN');}});const initial=m.start(config());m.pulse();await flush();
  const data=m.view(initial.id);assert.equal(data.status,'stopped');assert.equal(data.result,null);assert.equal(data.reason,'provider_error');assert.ok(!JSON.stringify(data).includes('PRIVATE'));
  assert.equal(data.metrics[0].usage.input_tokens,null);assert.equal(data.metrics[1].requests,0,'queued local side was never dispatched');assert.equal(data.metrics[1].usage.input_tokens,0);
});
test('stopping aborts in-flight requests; deadline aborts also stop the match',async t=>{
  const {m}=manager(t,{decisionTimeoutMs:10,evaluate:(team,req,signal)=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('private')),{once:true}))});
  const initial=m.start(config());m.pulse();await new Promise(resolve=>setTimeout(resolve,30));
  const data=m.view(initial.id);assert.equal(data.status,'stopped');assert.equal(data.decisions[0].error,'arena_timeout');assert.equal(data.pending,0);
});
function rawLocal(request){const spec=local.MODELS['nanojev-fp32'];return {schema_version:'study-room-nanojev-mlx-v1',model:spec.model,checkpoint:{weights_sha256:spec.sha,strict_loading:true},states:[{id:'arena',answers:Object.fromEntries(Object.entries(request.states[0].questions).map(([id,q])=>[id,{type:'choice',choice:'hold',probabilities:Object.fromEntries(Object.keys(q.criteria).map(k=>[k,k==='hold'?1:0]))}]))}],execution:{runtime:'mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,candidate_path_tokens:500}};}
test('native choices validate exact candidate distributions and weight identity without fabricating scores',()=>{
  const request=core.request(core.create('local'),0),raw=rawLocal(request);const result=normalize(raw,request,local.MODELS['nanojev-fp32']);assert.deepEqual(result.decision,{B0:'hold',B1:'hold'});assert.equal(result.usage.output_tokens,0);
  raw.states[0].answers.B0.probabilities.hold=0.5;assert.throws(()=>normalize(raw,request,local.MODELS['nanojev-fp32']),/local_invalid_response/);
});
test('local arena transport uses private loopback authentication and returns only validated choices/usage',async t=>{
  const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'jev-arena-connection-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
  const spec=local.MODELS['nanojev-fp32'],token='b'.repeat(64),request=core.request(core.create('native-http'),0),calls=[];
  await fs.writeFile(path.join(directory,'connection-fp32.json'),JSON.stringify({schema:'study-room.nanojev-connection.v1',host:'127.0.0.1',port:18999,token,variant:'fp32',model:spec.model,weights_sha256:spec.sha}),{mode:0o600});
  const evaluate=createArenaProvider({env:{NANOJEV_MLX_CONNECTION_DIR:directory},copilot:{evaluateTask:()=>assert.fail('No cloud fallback')},localFetch:async(url,options)=>{
    calls.push(url);assert.ok(url.startsWith('http://127.0.0.1:18999/'));assert.equal(options.redirect,'error');
    if(url.endsWith('/api/health'))return new Response(JSON.stringify({backend:'study-room-nanojev-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float32',max_length:512,model_memory_bytes:1}));
    assert.equal(options.headers['X-NanoJev-Token'],token);assert.equal(options.headers.Origin,undefined);assert.deepEqual(JSON.parse(options.body),request);
    return new Response(JSON.stringify(rawLocal(request)));
  }});
  const result=await evaluate({provider:'nanojev-fp32'},request,new AbortController().signal);
  assert.equal(calls.length,2);assert.equal(result.ok,true);assert.ok(!JSON.stringify(result).includes(token));assert.equal(result.usage.billing_usd,0);
});
test('Copilot self-scores are distinct from probabilities, complete, bounded and consistent; missing scores remain missing',()=>{
  const request=core.request(primitiveFixture(),0),orders={B0:'move_right'},keys=Object.keys(request.states[0].questions.B0.criteria);
  const wrap=value=>JSON.stringify({type:'assistant.message',data:{content:JSON.stringify(value)}})+'\n'+JSON.stringify({type:'result',exitCode:0});
  const scores={B0:Object.fromEntries(keys.map(key=>[key,key==='move_right'?90:30]))};
  assert.deepEqual(parseCopilotPlan(wrap({orders,self_scores:scores}),request),{orders,self_scores:scores});
  assert.deepEqual(parseCopilotPlan(wrap(orders),request),{orders,self_scores:null});
  assert.deepEqual(parseCopilotPlan(wrap({orders}),request),{orders,self_scores:null});
  for(const value of [101,-1,'90',null]){const wrong=structuredClone(scores);wrong.B0.move_right=value;assert.throws(()=>parseCopilotPlan(wrap({orders,self_scores:wrong}),request));}
  const incomplete=structuredClone(scores);delete incomplete.B0.move_up;assert.throws(()=>parseCopilotPlan(wrap({orders,self_scores:incomplete}),request));
  const inconsistent=structuredClone(scores);inconsistent.B0.move_up=100;assert.throws(()=>parseCopilotPlan(wrap({orders,self_scores:inconsistent}),request));
});
test('match receipts preserve native probabilities and separate self-scores, bound to their source snapshot',async t=>{
  const {m}=manager(t,{evaluate:async(team,request)=>{
    const decision=plan(request),scores=Object.fromEntries(Object.entries(request.states[0].questions).map(([id,q])=>[id,Object.fromEntries(Object.keys(q.criteria).map(key=>[key,key==='hold'?(team.provider==='copilot'?80:1):0]))]));
    return {...result(request),decision,...(team.provider==='copilot'?{self_scores:scores}:{probabilities:scores})};
  }});
  const initial=m.start(config({teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]}));m.pulse();await flush();const data=m.view(initial.id);
  assert.equal(data.decision_protocol,task.version);
  assert.equal(data.decisions[0].score_kind,'native_choice_probability');assert.equal(data.decisions[1].score_kind,'self_reported_preference');
  assert.equal(data.decisions[0].probabilities.B0.hold,1);assert.equal(data.decisions[1].self_scores.R0.hold,80);
  assert.equal(data.decisions[1].probabilities,null);assert.equal(data.decisions[0].self_scores,null);
  assert.equal(data.decisions[0].request.states[0].state,data.decisions[1].request.states[0].state);
});
test('Copilot arena task uses bounded generic launcher and strict plan parser, not business answers',async()=>{
  const request=core.request(core.create('cli'),1);let calls=0;
  const evaluate=createArenaProvider({copilot:{evaluateTask:async(model,prompt,parser)=>{calls++;assert.equal(model,'test-model');assert.equal(prompt,task.copilotPrompt(request));assert.ok(prompt.includes(request.states[0].state));return {ok:true,decision:parser(JSON.stringify({type:'assistant.message',data:{content:JSON.stringify({R0:'hold',R1:'north'})}})+'\n'+JSON.stringify({type:'result',exitCode:0}))};}}});
  const result=await evaluate({provider:'copilot',model:'test-model'},request,new AbortController().signal);assert.equal(calls,1);assert.equal(result.decision.R1,'north');
});
test('arena HTTP endpoints require origin/CSRF, lock other inference and reserve bounded cloud calls',async t=>{
  const cloudTeams=[{provider:'copilot',model:'fixture-a'},{provider:'copilot',model:'fixture-b'}];
  let calls=0;const server=createServer({arenaOptions:{auto:false},arenaEvaluate:async()=>{calls++;},runner:{status:async()=>({'nanojev-fp32':{ready:true},'nanojev-4bit':{ready:true}})},copilot:{status:async()=>({available:true})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const base='http://127.0.0.1:'+server.address().port,status=await(await fetch(base+'/api/jev/benchmark/status')).json();
  const send=(action,body,headers={})=>fetch(base+'/api/jev/'+action,{method:'POST',headers:{Origin:base,'X-Jev-Csrf':status.csrf,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  assert.equal((await send('arena/start',config(),{Origin:'https://evil.example'})).status,403);
  assert.equal((await send('arena/start',config(),{'X-Jev-Csrf':'wrong'})).status,403);
  assert.equal((await send('arena/start',config({consent:false}))).status,400);assert.equal(calls,0);
  const started=await(await send('arena/start',config({max_decisions:9,teams:cloudTeams}))).json();assert.ok(started.id);
  assert.equal((await send('arena/start',config())).status,429);
  assert.equal((await send('benchmark/models',{})).status,429);
  assert.equal((await send('arena/state',{id:started.id})).status,200);
  assert.equal((await send('arena/state',{id:started.id,prompt:'attack'})).status,400);
  assert.equal((await send('arena/state',{id:'wrong'})).status,404);
  assert.equal((await send('arena/stop',{id:started.id})).status,200);
  const replay=await(await send('arena/replay',{id:started.id})).json();assert.equal(replay.frames.length,1);assert.equal(replay.status,'stopped');
  assert.equal((await send('arena/start',config({teams:cloudTeams}))).status,429);assert.equal(calls,0);
});

'use strict';
// Physics / controller-contract tests, not evidence of learned model strategy.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),geo=require('../posts/jev-system-one-research/arena-geometry'),combat=require('../posts/jev-system-one-research/arena-combat'),tactics=require('../posts/jev-system-one-research/arena-tactics'),utility=require('../posts/jev-system-one-research/arena-utility'),report=require('../posts/jev-system-one-research/arena-report');
const {normalize,createArenaProvider}=require('../scripts/jev-arena-provider'),{MODELS}=require('../scripts/jev-local-provider'),{createArenaManager,validateConfig}=require('../scripts/jev-arena');
const {open,fixtures}=require('../scripts/jev-tactics-validation');
const directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
const flush=()=>new Promise(r=>setImmediate(r));
function wall(g,x,y){g.map[y]=g.map[y].slice(0,x)+'#'+g.map[y].slice(x+1);}
function gates(w,score=()=>.6){return Object.fromEntries(w.request.states.flatMap(s=>Object.entries(s.questions).map(([id,q])=>{const p=score(id,q);return [id,{p_true:p,value:p>.5,probabilities:{false:1-p,true:p}}];})));}
function raw(w){const gs=gates(w),spec=MODELS['nanojev-fp32'];return {schema_version:'study-room-nanojev-mlx-v1',model:spec.model,checkpoint:{weights_sha256:spec.sha,strict_loading:true},execution:{runtime:'mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,candidate_path_tokens:200},states:w.request.states.map(s=>({id:s.id,answers:Object.fromEntries(Object.keys(s.questions).map(id=>[id,{type:'boolean',...gs[id]}]))}))};}
const cfg={seed:'tactical-tests',mode:'realtime',control:'step',ruleset:'tactical',input_profile:'utility-tactics',duration_s:null,max_decisions:null,rate_limit_mode:'pause-world',teams:[{provider:'nanojev-fp32'},{provider:'attack-baseline'}],consent:true};

test('v6 allows arbitrary angles, uses radius not Manhattan distance, and retains v5 cardinal behavior',()=>{
  const g=open();Object.assign(g.tanks[0],{x:2,y:2});Object.assign(g.tanks[2],{x:5,y:6});
  const ray=geo.sight(g,g.tanks[0],g.tanks[2]);assert.equal(ray.clear,true);assert.equal(ray.distance,5);assert.ok(Math.abs(Math.hypot(ray.dx,ray.dy)-1)<1e-12);assert.ok(core.candidates(g,g.tanks[0]).fire_R0);
  const legacy=core.copy(g);legacy.version='tank-v5-step';legacy.ruleset='cardinal';legacy.input_profile='engage-first';assert.equal(core.candidates(legacy,legacy.tanks[0]).fire_R0,undefined);
  Object.assign(g.tanks[2],{x:8,y:3});assert.equal(geo.sight(g,g.tanks[0],g.tanks[2]).reason,'range');Object.assign(g.tanks[2],{x:8,y:2});assert.equal(geo.sight(g,g.tanks[0],g.tanks[2]).clear,true);
});
test('walls, grazing corners and changed terrain block the same ray used by firing candidates',()=>{
  const g=open(),a={x:2,y:2},b={x:4,y:4};assert.equal(geo.sight(g,a,b).clear,true);wall(g,3,2);assert.equal(geo.sight(g,a,b).reason,'wall','Cannot clip through a closed wall corner');g.map[2]=g.map[2].slice(0,3)+'.'+g.map[2].slice(4);assert.equal(geo.sight(g,a,b).clear,true,'Wall cache follows changed terrain');wall(g,3,3);assert.equal(geo.sight(g,a,b).clear,false);
});
test('actual diagonal bullets hit swept tank boxes, pass allies and expire at six Euclidean cells',()=>{
  const g=open();g.tick=0;Object.assign(g.tanks[0],{x:2,y:2});Object.assign(g.tanks[1],{x:3,y:3});Object.assign(g.tanks[2],{x:5,y:5});core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<6;i++)core.step(g);assert.equal(g.stats[0].shots,1);assert.equal(g.stats[0].hits,1);assert.equal(g.tanks[2].hp,88);assert.equal(g.tanks[1].hp,100);assert.equal(g.bullets.length,0);assert.ok(g.events.some(e=>e.kind==='shot'&&e.dx!==0&&e.dy!==0));
  const empty=open(),b={x:2,y:2,dx:.6,dy:.8,side:0,life:6,damage:12};empty.tanks=[];for(let i=0;i<6;i++)assert.equal(geo.advance(empty,b),null);assert.equal(b.life,0);assert.ok(Math.abs(Math.hypot(b.x-2,b.y-2)-6)<1e-10);
});
test('target motion is not homing; first enemy intercepts; walls beat collision ties',()=>{
  const g=open();g.tick=0;Object.assign(g.tanks[0],{x:2,y:2});Object.assign(g.tanks[2],{x:6,y:4});core.applyPlan(g,0,{B0:'fire_R0'});core.step(g);const direction=[g.bullets[0].dx,g.bullets[0].dy];g.tanks[2].y=6;for(let i=0;i<5;i++)core.step(g);assert.equal(g.tanks[2].hp,100);assert.equal(g.stats[0].hits,0);assert.ok(direction.every(Number.isFinite));
  const world=open();Object.assign(world.tanks[0],{x:2,y:2});Object.assign(world.tanks[2],{x:4,y:3});Object.assign(world.tanks[3],{x:6,y:4});assert.equal(combat.shot(world,world.tanks[0],world.tanks[3],0).victim.id,'R0');
  wall(world,3,3);const a={x:2,y:2},b={x:4,y:4};assert.equal(geo.sweep(world,a,b,0).kind,'wall');
});
test('all static offered shots have the same v6 geometry and real execution outcome',()=>{
  let checked=0;for(let y=1;y<8;y++)for(let x=1;x<12;x++){
    const g=open();g.tick=0;Object.assign(g.tanks[0],{x:2,y:2});Object.assign(g.tanks[2],{x,y});g.tanks[1].hp=0;g.tanks[3].hp=0;if(x===2&&y===2)continue;wall(g,4,3);
    const valid=!!core.candidates(g,g.tanks[0]).fire_R0,diagnosis=report.geometry(report.snapshot(g),'B0','fire_R0');assert.equal(valid,diagnosis.status==='clear');core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<6;i++)core.step(g);assert.equal(g.stats[0].shots,valid?1:0);assert.equal(g.stats[0].hits,valid?1:0);checked++;
  }assert.ok(checked>70);
});
test('bounded forecasts match real physics with the disclosed delay, one action and frozen enemies',()=>{
  let count=0;for(const f of fixtures()){
    const w=utility.build(core.request(f.game,0),report.snapshot(f.game));for(const plan of w.plans){const projected=tactics.forecast(f.game,0,plan),g=core.copy(f.game);
      for(let tick=1;tick<=8;tick++){if(tick===4)core.applyPlan(g,0,plan);core.step(g);if(core.result(g,false))break;}
      for(const t of g.tanks.filter(t=>t.side===0)){assert.equal(projected.tanks[t.id].hp_after,t.hp,`${f.id} ${JSON.stringify(plan)} ${t.id}`);assert.equal(projected.tanks[t.id].shield_after,t.shield);}count++;
    }
  }assert.ok(count>30);
});
test('survival gates can override selfish shooting, and no side can inspect opponent pending orders',()=>{
  const g=fixtures().find(f=>f.id==='incoming-lethal-dodge').game,snapshot=report.snapshot(g),w=utility.build(core.request(g,0),snapshot);
  const result=utility.read(gates(w,id=>id.includes('fire_')?.99:.1),w);assert.ok(['move_up','move_down'].includes(result.decision.B0));assert.equal(result.independent_argmax.B0,'fire_R0');assert.ok(w.tactical.plan_audit.some(a=>a.forecast.survivors===1));assert.ok(w.tactical.eligible_plan_indices.every(i=>w.tactical.plan_audit[i].forecast.survivors===2));
  const before=JSON.stringify(w);g.tanks[2].order='move_left';g.tanks[2].pending_action=true;assert.equal(JSON.stringify(utility.build(core.request(g,0),report.snapshot(g))),before);assert.equal(JSON.stringify(snapshot),JSON.stringify(report.snapshot(g)));
});
test('v2 explicitly prefers preserved health and useful repair even when model scores prefer trading shots',()=>{
  const dodge=fixtures().find(f=>f.id==='incoming-lethal-dodge').game;dodge.tanks[0].hp=100;const w=utility.build(core.request(dodge,0),report.snapshot(dodge)),chosen=utility.read(gates(w,id=>id.includes('fire_')?.99:.1),w);assert.ok(['move_up','move_down'].includes(chosen.decision.B0));assert.equal(chosen.independent_argmax.B0,'fire_R0');assert.ok(w.tactical.eligible_plan_indices.every(i=>w.tactical.plan_audit[i].forecast.effective_hp===200));
  const repair=fixtures().find(f=>f.id==='wounded-repair').game,r=utility.build(core.request(repair,0),report.snapshot(repair));assert.equal(utility.read(gates(r,id=>id.includes('fire_')?.99:.1),r).decision.B0,'move_up');assert.match(r.request.states[1].questions.B0__move_up__safety.instructions,/Restores 30 HP/);assert.equal(r.tactical.features.B0.move_up.resource.type,'repair');
});
test('reload input gating encourages maneuvering; trapped reload waits are explicit, not hidden wait actions',()=>{
  const g=open();Object.assign(g.tanks[0],{x:2,y:2,cooldown:4});Object.assign(g.tanks[2],{x:5,y:6});assert.equal(geo.sight(g,g.tanks[0],g.tanks[2]).clear,true);assert.equal(core.candidates(g,g.tanks[0]).fire_R0,undefined);core.applyPlan(g,0,{B0:'move_right'});for(let i=0;i<4;i++)core.step(g);assert.equal(g.tanks[0].cooldown,0);assert.ok(core.candidates(g,g.tanks[0]).fire_R0);
  const trapped=open();Object.assign(trapped.tanks[0],{x:1,y:3,cooldown:4});Object.assign(trapped.tanks[1],{x:2,y:3});Object.assign(trapped.tanks[2],{x:5,y:3});wall(trapped,1,2);wall(trapped,1,4);const w=utility.build(core.request(trapped,0),report.snapshot(trapped));assert.ok(w.reload_hold_fallback.includes('B0'));assert.ok(Object.values(w.mapping.B0).includes('fire_R0'));assert.ok(!Object.values(w.mapping.B0).includes('wait'));core.applyPlan(trapped,0,{B0:'fire_R0'});for(let i=0;i<4;i++)core.step(trapped);assert.equal(trapped.stats[0].shots,0);core.step(trapped);assert.equal(trapped.stats[0].shots,1);
});
test('cover is distinguished from mere range exit; useful repair and shield effects are projected',()=>{
  const cover=fixtures().find(f=>f.id==='wall-cover').game;assert.equal(tactics.features(cover,cover.tanks[0],'move_up').takes_cover,true);
  const repair=fixtures().find(f=>f.id==='wounded-repair').game,f=tactics.features(repair,repair.tanks[0],'move_up');assert.equal(f.takes_cover,false);assert.equal(f.reduces_exposure,true);assert.equal(f.resource.type,'repair');assert.equal(f.resource.collects,true);assert.equal(f.repair_gain,30);assert.equal(f.hp_after,50);
  repair.rewards[0].type='shield';const projected=tactics.forecast(repair,0,{B0:'move_up'});assert.equal(projected.tanks.B0.shield_after,30);
});
test('team readout avoids two individually lethal shots at one target, but permits necessary focus fire',()=>{
  const g=fixtures().find(f=>f.id==='avoid-redundant-lethal-shots').game,w=utility.build(core.request(g,0),report.snapshot(g));const chosen=utility.read(gates(w,id=>id.includes('fire_')?.99:.1),w);assert.equal(Object.values(chosen.decision).filter(a=>a==='fire_R0').length,1);assert.ok(w.tactical.plan_audit.some(a=>a.redundant_lethal_shots===1));
  g.tanks[2].hp=20;const focus=utility.build(core.request(g,0),report.snapshot(g));assert.deepEqual(utility.read(gates(focus,id=>id.includes('fire_')?.99:.1),focus).decision,{B0:'fire_R0',B1:'fire_R0'});
});
test('dual native scores are preserved exactly; combined scores and weights are explicitly application-owned',()=>{
  const g=open(),w=utility.build(core.request(g,0),report.snapshot(g)),gs=gates(w,id=>id.endsWith('__safety')?.7:.9),r=utility.read(gs,w);assert.equal(w.request.states.length,2);
  for(const id of Object.keys(r.utility_scores))for(const action of Object.keys(r.utility_scores[id])){assert.equal(r.utility_scores[id][action],.9);assert.equal(r.survival_scores[id][action],.7);const weights=w.tactical.weights[id];assert.equal(r.combined_scores[id][action],weights.offense*.9+weights.survival*.7);}
  assert.throws(()=>utility.read({...gs,extra:{p_true:.8}},w),/invalid_utility_response/);assert.throws(()=>utility.read({...gs,[Object.keys(gs)[0]]:{p_true:NaN}},w),/invalid_utility_response/);
});
test('native normalization validates both state identities and every original Boolean result',()=>{
  const g=open(),w=utility.build(core.request(g,0),report.snapshot(g)),data=raw(w),spec=MODELS['nanojev-fp32'];assert.equal(Object.keys(normalize(data,w.request,spec).binary_gates).length,Object.keys(gates(w)).length);
  for(const mutate of [d=>d.states.pop(),d=>d.states[1].id='arena',d=>delete d.states[1].answers[Object.keys(d.states[1].answers)[0]],d=>Object.values(d.states[1].answers)[0].p_true=NaN]){const bad=structuredClone(data);mutate(bad);assert.throws(()=>normalize(bad,w.request,spec),/local_invalid_response/);}
});
test('v6 is explicit and incompatible configs fail without silently changing the task',()=>{
  assert.deepEqual(validateConfig(cfg),cfg);for(const patch of [{ruleset:'cardinal'},{ruleset:'unknown'},{control:'primitive'}])assert.throws(()=>validateConfig({...cfg,...patch}));assert.equal(core.create('legacy','step').version,'tank-v5-step');assert.equal(validateConfig({...cfg,teams:[{provider:'copilot',model:'fixture'},{provider:'attack-baseline'}]}).input_profile,'utility-tactics');
});
test('actual provider sends one dual-state request and exposes both raw score families without fabricated probabilities',async t=>{
  const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),dir=await fs.mkdtemp(path.join(os.tmpdir(),'tactical-connection-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const spec=MODELS['nanojev-fp32'],token='d'.repeat(64);await fs.writeFile(path.join(dir,'connection-fp32.json'),JSON.stringify({schema:'study-room.nanojev-connection.v1',host:'127.0.0.1',port:18999,token,variant:'fp32',model:spec.model,weights_sha256:spec.sha}),{mode:0o600});
  const g=open(),logical=core.request(g,0),snapshot=report.snapshot(g),w=utility.build(logical,snapshot);let calls=0;const evaluate=createArenaProvider({env:{NANOJEV_MLX_CONNECTION_DIR:dir},localFetch:async(url,opts)=>{if(url.endsWith('/api/health'))return new Response(JSON.stringify({backend:'study-room-nanojev-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float32',max_length:512,model_memory_bytes:1}));calls++;assert.deepEqual(JSON.parse(opts.body),w.request);return new Response(JSON.stringify(raw(w)));}});
  const r=await evaluate({provider:'nanojev-fp32'},logical,new AbortController().signal,snapshot,{input_profile:'utility-tactics',utility_wire:w});assert.equal(calls,1);assert.ok(r.survival_scores);assert.ok(r.combined_scores);assert.equal(r.probabilities,undefined);assert.equal(r.utility_trace.model_request.states.length,2);assert.ok(!JSON.stringify(r).includes(token));
});
test('Copilot tactical preferences use their own schema and scale, never fabricated Boolean probabilities',async()=>{
  const g=open(),snapshot=report.snapshot(g),logical=core.request(g,0),w=utility.build(logical,snapshot),self=Object.fromEntries(Object.keys(gates(w)).map(id=>[id,id.endsWith('__safety')?70:90]));let calls=0;
  const evaluate=createArenaProvider({localFetch:()=>{throw new Error('no_native_call');},copilot:{evaluateTask:async(model,prompt,parse)=>{calls++;assert.equal(prompt,utility.copilotPrompt(w));assert.match(prompt,/NOT probabilities/);return {ok:true,decision:parse(JSON.stringify({type:'assistant.message',data:{content:JSON.stringify({scores:self})}})+'\n'+JSON.stringify({type:'result',exitCode:0})),usage:{input_tokens:100,output_tokens:100,model_requests:1}};}}});
  const r=await evaluate({provider:'copilot',model:'fixture'},logical,new AbortController().signal,snapshot,{input_profile:'utility-tactics',utility_wire:w});assert.equal(calls,1);assert.equal(r.utility_scores,undefined);assert.equal(r.binary_gates,undefined);assert.equal(r.utility_trace.binary_gates,null);assert.deepEqual(r.utility_trace.self_scores,self);assert.equal(r.self_offense_scores.B0.move_up,90);assert.equal(r.self_survival_scores.B0.move_up,70);assert.equal(r.combined_scores.B0.move_up,.75*.9+.25*.7);assert.equal(r.usage.model_requests,1);
  for(const bad of [{...self,extra:80},{...self,[Object.keys(self)[0]]:101},{...self,[Object.keys(self)[0]]:'90'}])assert.throws(()=>utility.readSelfScores(bad,w),/arena_invalid_plan/);
});
test('manager and privacy-filtered archives retain actual dual input, forecasts, bullets, resources and separate score semantics',async t=>{
  const m=createArenaManager({auto:false,evaluate:async(team,req,signal,snapshot,context)=>{const w=context.utility_wire;if(!w)return {ok:true,decision:Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up']))};const gs=gates(w),chosen=utility.read(gs,w);return {ok:true,...chosen,utility_trace:{version:tactics.version,encoding:w.version,model_request:w.request,mapping:w.mapping,survival_mapping:w.survival_mapping,plans:w.plans,tactical:{...w.tactical,secret:'PRIVATE'},binary_gates:gs,independent_argmax:chosen.independent_argmax,readout:'forecast_then_weighted_utilities'}};}});t.after(()=>m.close());m.start(cfg);m.pulse();await flush();const d=report.create(m.latest()),r=d.decisions.find(r=>r.side===0);assert.equal(d.rule_version,'tank-v6-tactical');assert.equal(d.config.ruleset,'tactical');assert.equal(d.environment_contract.range_metric,'euclidean');assert.equal(d.environment_contract.fire_requires_same_row_or_column,false);assert.equal(r.decision_source,'model_tactical_utility_joint');assert.equal(r.score_kind,'native_multiobjective_utility');assert.equal(r.utility_trace.model_request.states.length,2);assert.ok(r.utility_trace.survival_mapping);assert.ok(r.utility_trace.tactical.plan_audit.length);assert.ok(r.survival_scores);assert.ok(r.combined_scores);assert.equal(r.probabilities,null);assert.ok(Array.isArray(r.observation_snapshot.bullets));assert.ok(Array.isArray(r.observation_snapshot.rewards));assert.ok(!JSON.stringify(d).includes('PRIVATE'));
});

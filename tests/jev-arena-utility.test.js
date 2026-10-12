'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),report=require('../posts/jev-system-one-research/arena-report'),utility=require('../posts/jev-system-one-research/arena-utility');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
const {createArenaProvider,normalize}=require('../scripts/jev-arena-provider');
const {MODELS}=require('../scripts/jev-local-provider');
const {encode,decode}=require('../scripts/jev-arena-encoding-lab');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const cfg={seed:'tank-2026',control:'step',mode:'realtime',duration_s:null,max_decisions:null,input_profile:'utility-attack',rate_limit_mode:'pause-world',consent:true,teams:[{provider:'nanojev-fp32'},{provider:'attack-baseline'}]};
function fixture(){const g=core.create('tank-2026','step','utility-attack');Object.assign(g.tanks[0],{x:1,y:4});Object.assign(g.tanks[1],{x:2,y:5});Object.assign(g.tanks[2],{x:9,y:4});return g;}
function fakeGates(wire){return Object.fromEntries(Object.entries(wire.request.states[0].questions).map(([id,q])=>{const p=q.instructions.includes('fires at')?.9:q.instructions.includes('advances along')?.8:.2;return [id,{p_true:p,value:p>.5,probabilities:{false:1-p,true:p}}];}));}
test('anonymous native Boolean inputs keep transport mapping, physical eligibility and predeclared nonconflicting plans',()=>{
  const g=fixture(),req=core.request(g,0),wire=utility.build(req,report.snapshot(g));
  assert.ok(wire.plans.length>1);assert.ok(wire.plans.length<=36);
  assert.ok(Object.values(wire.request.states[0].questions).every(q=>q.type==='boolean'&&!/[BR][01]/.test(q.instructions)));
  assert.ok(!Object.values(wire.mapping.B0).includes('move_left')); // Wall
  assert.ok(wire.plans.every(p=>!(p.B0==='move_right'&&p.B1==='move_up')));
  const gates=fakeGates(wire),chosen=utility.select(gates,wire.mapping,wire.plans);assert.equal(chosen.independent_argmax.B1,'move_up');assert.deepEqual(chosen.decision,{B0:'move_right',B1:'move_right'});
  for(const [id,scores]of Object.entries(chosen.utility_scores))for(const [key,p]of Object.entries(scores))assert.equal(p,gates[id+'__'+key].p_true,'Scores must remain the exact native values, not reweighted or normalized');
  assert.throws(()=>utility.select({},wire.mapping,wire.plans),/invalid_utility_response/);
});
test('trapped fallback is disclosed instead of inventing a wait or a successful move',()=>{
  const g=fixture();g.map[4]=g.map[4].slice(0,2)+'#'+g.map[4].slice(3);g.map[5]=g.map[5][0]+'#'+g.map[5].slice(2);g.tanks[0].x=1;g.tanks[0].y=4;g.tanks[1].x=1;g.tanks[1].y=3;
  const wire=utility.build(core.request(g,0),report.snapshot(g));assert.ok(wire.fallback_tanks.includes('B0'));assert.ok(Object.values(wire.mapping.B0).every(k=>k.startsWith('move_')));
});
function raw(wire){return {schema_version:'study-room-nanojev-mlx-v1',model:MODELS['nanojev-fp32'].model,checkpoint:{weights_sha256:MODELS['nanojev-fp32'].sha,strict_loading:true},states:[{id:'arena',answers:Object.fromEntries(Object.entries(fakeGates(wire)).map(([id,g])=>[id,{type:'boolean',...g}]))}],execution:{runtime:'mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,candidate_path_tokens:100}};}
test('Boolean normalization validates identity, exact IDs, finite distributions and native values; not an action probability vector',()=>{
  const wire=utility.build(core.request(fixture(),0),report.snapshot(fixture())),data=raw(wire),r=normalize(data,wire.request,MODELS['nanojev-fp32']);assert.ok(r.binary_gates);assert.equal(r.probabilities,undefined);assert.equal(r.decision,undefined);
  for(const p of [NaN,-1,2]){const copy=structuredClone(data);Object.values(copy.states[0].answers)[0].p_true=p;assert.throws(()=>normalize(copy,wire.request,MODELS['nanojev-fp32']),/local_invalid_response/);}
  const bad=structuredClone(data);Object.values(bad.states[0].answers)[0].value=!Object.values(bad.states[0].answers)[0].value;assert.throws(()=>normalize(bad,wire.request,MODELS['nanojev-fp32']));
});
test('model utility provider uses one real transport request and decodes only its validated native scores',async t=>{
  const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');const dir=await fs.mkdtemp(path.join(os.tmpdir(),'utility-connection-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const spec=MODELS['nanojev-fp32'],token='d'.repeat(64);await fs.writeFile(path.join(dir,'connection-fp32.json'),JSON.stringify({schema:'study-room.nanojev-connection.v1',host:'127.0.0.1',port:18999,token,variant:'fp32',model:spec.model,weights_sha256:spec.sha}),{mode:0o600});
  const g=fixture(),logical=core.request(g,0),snapshot=report.snapshot(g),wire=utility.build(logical,snapshot);let inferences=0;
  const evaluate=createArenaProvider({env:{NANOJEV_MLX_CONNECTION_DIR:dir},localFetch:async(url,options)=>{
    if(url.endsWith('/api/health'))return new Response(JSON.stringify({backend:'study-room-nanojev-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float32',max_length:512,model_memory_bytes:1}));
    inferences++;assert.deepEqual(JSON.parse(options.body),wire.request);return new Response(JSON.stringify(raw(wire)));
  }});
  const r=await evaluate({provider:'nanojev-fp32'},logical,new AbortController().signal,snapshot,{input_profile:'utility-attack',utility_wire:wire});assert.equal(inferences,1);assert.ok(r.utility_trace.model_request);assert.deepEqual(r.decision,{B0:'move_right',B1:'move_right'});assert.ok(!JSON.stringify(r).includes(token));
});
test('utility and fair-pause config are explicit; unsupported cloud utility fails rather than silently switching tasks',()=>{
  assert.deepEqual(validateConfig(cfg),cfg);assert.throws(()=>validateConfig({...cfg,rate_limit_mode:'invented'}));assert.equal(validateConfig({...cfg,teams:[{provider:'copilot',model:'test-model'},{provider:'attack-baseline'}]}).teams[0].provider,'copilot');
});
test('rate fairness freezes physics for both sides, resumes admission, and does not freeze normal inference',async t=>{
  let clock=0,tokens=1,release;const m=createArenaManager({auto:false,now:()=>clock,leaseMs:1e9,admit:team=>team.provider==='attack-baseline'||tokens>0?(team.provider!=='attack-baseline'&&tokens--,true):false,evaluate:async(team,req)=>{
    if(team.provider==='nanojev-fp32')await new Promise(resolve=>{release=resolve;});return {ok:true,decision:Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up']))};
  }});t.after(()=>{release?.();m.close();});m.start({...cfg,input_profile:'raw'});m.pulse();await flush();for(let i=0;i<4;i++){clock+=200;m.pulse();await flush();}assert.ok(m.latest().game.tick>1,'Normal inference must not become a sync barrier');release();await flush();
  for(let i=0;i<10;i++){clock+=200;m.pulse();await flush();}const paused=m.latest();assert.equal(paused.simulation_paused_for_rate,true);const tick=paused.game.tick;
  clock+=60000;m.pulse();await flush();assert.equal(m.latest().game.tick,tick);assert.ok(m.latest().metrics[1].wait_timings.rate_barrier_ms>0);tokens=1;m.pulse();await flush();assert.equal(m.latest().simulation_paused_for_rate,false);assert.ok(m.latest().game.tick>tick);release();await flush();m.stop(paused.id);
});
test('utility traces and both score semantics survive diagnostics with only allowlisted fields',async t=>{
  const m=createArenaManager({auto:false,evaluate:async(team,req,signal,snapshot,context)=>{
    if(!context.utility_wire)return {ok:true,decision:Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up']))};const w=context.utility_wire,g=fakeGates(w),chosen=utility.select(g,w.mapping,w.plans);return {ok:true,...chosen,utility_trace:{version:utility.version,encoding:w.version,model_request:w.request,mapping:w.mapping,plans:w.plans,binary_gates:g,independent_argmax:chosen.independent_argmax,fallback_tanks:w.fallback_tanks,readout:'maximum_sum_boolean_utilities_over_disclosed_joint_plans',secret:'PRIVATE'}};
  }});t.after(()=>m.close());m.start(cfg);m.pulse();await flush();const d=report.create(m.latest()),row=d.decisions.find(d=>d.side===0);assert.equal(row.decision_source,'model_utility_joint');assert.equal(row.request_role,'logical_action_contract');assert.equal(row.score_kind,'native_boolean_utility');assert.ok(row.utility_trace.model_request);assert.ok(row.utility_scores);assert.equal(row.probabilities,null);assert.ok(!JSON.stringify(d).includes('PRIVATE'));assert.equal(d.config.rate_limit_mode,'pause-world');
});
test('encoding ablations retain reversible identity and do not re-rank or execute imported actions',()=>{
  const g=fixture(),req=core.request(g,0),w=encode(req,report.snapshot(g),'compact-neutral');const returned={decision:Object.fromEntries(Object.entries(w.mapping).map(([id,m])=>[id,Object.keys(m)[0]]))};assert.deepEqual(decode(returned,w.mapping),{B0:'move_up',B1:'move_up'});assert.deepEqual(Object.values(w.mapping.B0),Object.keys(req.states[0].questions.B0.criteria));
});

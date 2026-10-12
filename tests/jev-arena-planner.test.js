'use strict';
// Controller/physics tests use injected scores. They are NOT model win-rate evidence.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const planner=require('../posts/jev-system-one-research/arena-planner');
const report=require('../posts/jev-system-one-research/arena-report');
const buildAsync=require('../scripts/jev-planner-worker');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
const {createArenaProvider}=require('../scripts/jev-arena-provider');
const {MODELS}=require('../scripts/jev-local-provider');
const {match}=require('../scripts/jev-planner-validation');
const config={seed:'tank-2026',mode:'sync',control:'step',ruleset:'tactical',input_profile:'utility-planner',duration_s:90,max_decisions:1,teams:[{provider:'nanojev-fp32'},{provider:'attack-baseline'}],consent:true};
function game(){return core.create('tank-2026','step','utility-planner','tactical');}
function gates(w){return Object.fromEntries(w.shortlist.map(s=>[s.question_id,{p_true:.6,value:true,probabilities:{false:.4,true:.6}}]));}
function wire(g=game()){return planner.build(core.request(g,0),report.snapshot(g),{decision_delay_ticks:0});}

test('new opt-in task retains old versions and allows queued reload fire equally for either side',()=>{
  assert.deepEqual(validateConfig(config),config);
  assert.throws(()=>validateConfig({...config,ruleset:'cardinal'}));
  assert.equal(validateConfig({...config,teams:[{provider:'copilot',model:'fixture'},{provider:'attack-baseline'}]}).teams[0].provider,'copilot');
  const g=game();g.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');
  Object.assign(g.tanks[0],{x:3,y:3,cooldown:3});Object.assign(g.tanks[2],{x:6,y:3,cooldown:3});
  assert.ok(core.candidates(g,g.tanks[0]).fire_R0);assert.ok(core.candidates(g,g.tanks[2]).fire_B0);
  core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<3;i++)core.step(g);
  assert.equal(g.stats[0].shots,0);assert.equal(g.tanks[0].pending_action,true);core.step(g);assert.equal(g.stats[0].shots,1);
  g.input_profile='utility-tactics';g.tanks[0].cooldown=3;assert.equal(core.candidates(g,g.tanks[0]).fire_R0,undefined);
  assert.equal(require('../posts/jev-system-one-research/arena-task').versionFor(g),'tank-tactical-utility-v2');
});
test('bounded search uses public state, predicts enemy shots and leaves input untouched',()=>{
  const g=game(),before=JSON.stringify(g),w=wire(g);
  assert.equal(JSON.stringify(g),before);assert.equal(w.assumptions.actual_engine,true);assert.equal(w.assumptions.hidden_orders_used,false);
  assert.equal(w.assumptions.horizon_ticks,24);assert.equal(w.assumptions.scheduling,'paired_after_action');
  assert.ok(w.plan_audit.length<=36);assert.ok(w.shortlist.length<=6);assert.ok(w.plan_audit.some(p=>p.outcomes.some(o=>o.damage_taken>0)));
  g.tanks.forEach(t=>{t.order='SECRET';t.pending_action=true;});g.hidden='SECRET';
  assert.deepEqual(wire(g),w);assert.ok(!JSON.stringify(planner.world(g)).includes('SECRET'));
  assert.ok(w.plan_audit.every(r=>r.outcomes.every(o=>o.ticks<=24)));
});
test('reconstructed public simulation has the same first-step physics as the actual engine',()=>{
  const g=game(),req=core.request(g,0),w=wire(g),p=w.search_only_plan;
  const a=planner.world(report.snapshot(g)),b=core.copy(g);
  core.applyPlan(a,0,p);core.applyPlan(b,0,p);
  const enemy=require('../posts/jev-system-one-research/arena-attack-policy').choose(report.snapshot(g),core.request(g,1)).decision;
  core.applyPlan(a,1,enemy);core.applyPlan(b,1,enemy);
  for(let i=0;i<8;i++){core.step(a);core.step(b);assert.deepEqual(report.snapshot(a),report.snapshot(b));}
  assert.deepEqual(core.validatePlan(p,req),p);
});
test('admissible root plans never contest an allied destination unless trapped fallback is disclosed',()=>{
  const g=game(),w=wire(g),delta={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  for(const p of w.plans){const cells=Object.entries(p).filter(([,a])=>delta[a]).map(([id,a])=>{const t=g.tanks.find(t=>t.id===id);return [t.x+delta[a][0],t.y+delta[a][1]].join(',');});assert.equal(new Set(cells).size,cells.length);}
  assert.equal(w.joint_fallback,false);
  for(const t of g.tanks.filter(t=>t.side===0))for(const d of Object.values(delta)){const x=t.x+d[0],y=t.y+d[1];g.map[y]=g.map[y].slice(0,x)+'#'+g.map[y].slice(x+1);}
  const trapped=wire(g);assert.ok(trapped.plans.length);assert.deepEqual(core.validatePlan(trapped.search_only_plan,core.request(g,0)),trapped.search_only_plan);
});
test('readout preserves actual native scores, exposes application contribution and rejects partial/non-finite scores',()=>{
  const w=wire(),gs=gates(w),r=planner.read(gs,w),trace=planner.trace(w,r,gs);
  assert.deepEqual(r.decision,w.search_only_plan);assert.equal(r.model_changed_plan,false);assert.deepEqual(trace.binary_gates,gs);
  for(const s of r.plan_scores){assert.equal(s.model_score,.6);assert.equal(s.combined_value,s.search_value+12*(.6-.5));}
  for(const bad of [{...gs,extra:{p_true:.9}},Object.fromEntries(Object.entries(gs).slice(1)),{...gs,plan_0:{p_true:NaN}},{...gs,plan_0:{p_true:1.1}}])assert.throws(()=>planner.read(bad,w),/invalid_planner_scores/);
  // Deliberately tied fixture proves model influence in the readout; not model accuracy.
  const equal=structuredClone(w);equal.shortlist=equal.shortlist.slice(0,2);
  equal.shortlist.forEach(s=>{equal.plan_audit[s.plan_index].search_value=10;});
  const chosen=planner.select({plan_0:.1,plan_1:.9},equal);assert.deepEqual(chosen.decision,equal.plans[equal.shortlist[1].plan_index]);assert.equal(chosen.model_changed_plan,true);
});
test('async planner preserves results, keeps event loop responsive and supports cancellation',async()=>{
  const g=game(),req=core.request(g,0),snapshot=report.snapshot(g),signal=new AbortController();let ticks=0;
  const timer=setInterval(()=>ticks++,2);
  try{const w=await buildAsync(req,snapshot,{decision_delay_ticks:0},signal.signal);assert.deepEqual(w,wire(g));assert.ok(ticks>0);}finally{clearInterval(timer);}
  const cancelled=new AbortController();cancelled.abort();await assert.rejects(buildAsync(req,snapshot,{},cancelled.signal),/cancelled/);
  const running=new AbortController(),job=buildAsync(req,snapshot,{},running.signal);running.abort();await assert.rejects(job,/cancelled/);
  await assert.rejects(buildAsync(req,snapshot,{decision_delay_ticks:7},new AbortController().signal),/arena_planner_failed/);
});
test('provider sends only actual joint-plan propositions and returns audited scores without a fallback',async t=>{
  const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),dir=await fs.mkdtemp(path.join(os.tmpdir(),'planner-provider-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const spec=MODELS['nanojev-fp32'],token='e'.repeat(64);await fs.writeFile(path.join(dir,'connection-fp32.json'),JSON.stringify({schema:'study-room.nanojev-connection.v1',host:'127.0.0.1',port:18999,token,variant:'fp32',model:spec.model,weights_sha256:spec.sha}),{mode:0o600});
  const g=game(),w=wire(g),gs=gates(w);let calls=0;
  const evaluate=createArenaProvider({env:{NANOJEV_MLX_CONNECTION_DIR:dir},localFetch:async(url,opts)=>{
    if(url.endsWith('/api/health'))return new Response(JSON.stringify({backend:'study-room-nanojev-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float32',max_length:512,model_memory_bytes:1}));
    calls++;assert.deepEqual(JSON.parse(opts.body),w.request);
    return new Response(JSON.stringify({schema_version:'study-room-nanojev-mlx-v1',model:spec.model,checkpoint:{weights_sha256:spec.sha,strict_loading:true},execution:{runtime:'mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,candidate_path_tokens:100},states:[{id:'arena',answers:Object.fromEntries(Object.entries(gs).map(([id,v])=>[id,{type:'boolean',...v}]))}]}));
  }});
  const r=await evaluate({provider:'nanojev-fp32'},core.request(g,0),new AbortController().signal,report.snapshot(g),{planner_wire:w});
  assert.equal(calls,1);assert.deepEqual(r.planner_trace.binary_gates,gs);assert.equal(r.probabilities,undefined);assert.ok(!JSON.stringify(r).includes(token));
  await assert.rejects(evaluate({provider:'copilot'},core.request(g,0),new AbortController().signal,report.snapshot(g),{planner_wire:w}),/copilot_unavailable/);
});
test('manager and private report retain signed values, actual inputs, worker time and attribution',async t=>{
  const m=createArenaManager({auto:false,evaluate:async(team,req,signal,snapshot,ctx)=>{
    if(team.provider==='attack-baseline')return {ok:true,decision:require('../posts/jev-system-one-research/arena-attack-policy').choose(snapshot,req).decision};
    assert.ok(ctx.planner_wire);const w=ctx.planner_wire,gs=gates(w),r=planner.read(gs,w),trace=planner.trace(w,r,gs);trace.secret='PRIVATE';return {ok:true,decision:r.decision,planner_trace:trace};
  }});t.after(()=>m.close());m.start(config);m.pulse();
  const limit=Date.now()+5000;while(m.latest().pending&&Date.now()<limit)await new Promise(r=>setTimeout(r,10));
  const record=m.latest(),d=report.create(record),row=d.decisions.find(r=>r.side===0);
  assert.ok(row);assert.equal(row.decision_source,'model_opponent_rollout');assert.equal(row.score_kind,'native_plan_preference');assert.equal(row.request_role,'logical_action_contract');assert.ok(row.planner_ms>0);assert.equal(row.planner_trace.assumptions.hidden_orders_used,false);
  assert.deepEqual(row.planner_trace.plan_audit.map(r=>r.search_value),record.decisions.find(r=>r.side===0).planner_trace.plan_audit.map(r=>r.search_value));
  assert.deepEqual(row.planner_trace.model_request,record.decisions.find(r=>r.side===0).planner_trace.model_request);assert.ok(!JSON.stringify(d).includes('PRIVATE'));assert.ok(report.format(d).includes('model_opponent_rollout'));
});
test('paired development smoke: search-only ablation defeats baseline from either spawn without a time-limit win',async()=>{
  for(const side of [0,1]){const r=await match({seed:'tank-2026',side,maxTicks:180});assert.equal(r.controller,'search-only-no-model');assert.equal(r.model_calls,0);assert.equal(r.won,true);assert.equal(r.capped,false);assert.equal(r.result.reason,'elimination');}
});

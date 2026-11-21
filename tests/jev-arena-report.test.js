'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const task=require('../posts/jev-system-one-research/arena-task');
const reports=require('../posts/jev-system-one-research/arena-report');
function base(){const game=core.create('diagnostic-fixture','primitive');game.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));return game;}
function decision(game,round){
  const request=core.request(game,0),plan={B0:'move_left',B1:'fire_R1'};
  return {round,side:0,state_tick:game.tick,completed_tick:game.tick,applied_tick:game.tick,applied_wall_ms:game.tick*200,applied:true,elapsed_ms:25,provider_ms:25,state_age_ms:0,task_prompt_version:task.version,requested_model:'C-Tianyu/NanoJev',reported_model:'C-Tianyu/NanoJev',weights_sha256:'f'.repeat(64),request,decision:plan,score_kind:'native_choice_probability',probabilities:Object.fromEntries(Object.entries(request.states[0].questions).map(([id,q])=>[id,Object.fromEntries(Object.keys(q.criteria).map(key=>[key,key===plan[id]?0.8:0.2/(Object.keys(q.criteria).length-1)]))])),usage:{input_tokens:100,output_tokens:0,billing_usd:0},observation_snapshot:reports.snapshot(game),application_snapshot:reports.snapshot(game)};
}
function record(rounds=2){
  const game=base(),frames=[core.copy(game)],decisions=[];
  for(let round=1;round<=rounds;round++){
    const row=decision(game,round);decisions.push(row);core.applyPlan(game,0,row.decision);
    for(let i=0;i<16;i++){core.step(game);frames.push(core.copy(game));}
  }
  return {schema:'study-room.tank-match.v1',id:'fixture-match',started_at:'2026-09-20T00:00:00Z',status:'stopped',reason:'user_stopped',pending:0,wall_ms:game.tick*200,config:{seed:game.seed,control:'primitive',mode:'sync',duration_s:30,max_decisions:3,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}]},decision_protocol:task.version,game,frames,decisions,metrics:[{...game.stats[0],requests:rounds,finished:rounds,errors:0,p50_ms:25,p95_ms:25,usage:{input_tokens:100*rounds,output_tokens:0,billing_usd:0}},{...game.stats[1],requests:0,finished:0,errors:0,usage:{input_tokens:0,output_tokens:0,billing_usd:null}}],result:null,inflight:[null,null]};
}
test('copy data preserves versions, outcomes, inputs, full-precision scores and execution evidence without mutating records',()=>{
  const r=record(),before=JSON.stringify(r),d=reports.create(r,{note:'反复撞墙，请检查是否忽略反馈'});
  assert.equal(JSON.stringify(r),before);assert.equal(d.rule_version,'tank-v4-active');assert.equal(d.decision_protocol,task.version);
  assert.equal(d.config.nominal_decision_gap_ms,10000);assert.equal(d.result,null);assert.equal(d.coverage.full_tick_replay,true);
  assert.equal(d.decisions[0].request.state,r.decisions[0].request.states[0].state);
  assert.deepEqual(d.decisions[0].probabilities,r.decisions[0].probabilities);
  assert.equal(d.metrics[0].usage.billing_usd,0);assert.equal(d.metrics[1].usage,null);
  assert.ok(d.findings.some(f=>f.kind==='no_actual_shots'&&f.side===0));
});
test('repeated controller execution is not counted as repeated model inference',()=>{
  const d=reports.create(record(1));const segment=d.execution_segments.find(s=>s.tank==='B0');
  assert.equal(segment.observed_attempts,4);assert.deepEqual(segment.decision_indices,[0]);
  const finding=d.findings.find(f=>f.kind==='repeated_failed_execution'&&f.tank==='B0');
  assert.match(finding.interpretation,/alone does not prove/);assert.ok(!d.findings.some(f=>f.kind==='reselected_failed_action'));
});
test('new model decision after supplied failure feedback is flagged separately from continued execution',()=>{
  const d=reports.create(record(2));const finding=d.findings.find(f=>f.kind==='reselected_failed_action'&&f.tank==='B0');
  assert.equal(finding.round,2);assert.equal(finding.input_geometry.reason,'blocked_wall');assert.equal(finding.previous_attempt.tick,16);
  const segment=d.execution_segments.find(s=>s.tank==='B0');assert.equal(segment.observed_attempts,8);assert.deepEqual(segment.decision_indices,[0,1]);
});
test('repeated shooting into a wall includes the precise blocking tile and the supplied feedback',()=>{
  const r=record(1),g=base();g.tick=6;Object.assign(g.tanks[0],{x:2,y:4,last_execution:{tick:5,action:'fire_R0',outcome:'wall'}});Object.assign(g.tanks[2],{x:6,y:4});
  g.map[4]=g.map[4].slice(0,4)+'#'+g.map[4].slice(5);const row=decision(g,2);row.decision.B0='fire_R0';r.decisions=[row];r.game=g;r.frames=[];
  const f=reports.create(r).findings.find(f=>f.kind==='reselected_failed_action'&&f.tank==='B0');
  assert.equal(f.input_geometry.reason,'wall');assert.deepEqual(f.input_geometry.cell,{x:4,y:4});assert.equal(f.previous_attempt.outcome,'wall');
});
test('old feedback does not imply a repeated mistake after geometry has changed',()=>{
  const r=record(1);const frame=base();Object.assign(frame.tanks[0],{x:2,y:3,last_execution:{tick:4,action:'move_right',outcome:'blocked_tank'}});frame.tick=5;
  const row=decision(frame,2);row.decision.B0='move_right';row.observation_snapshot=reports.snapshot(frame);row.application_snapshot=reports.snapshot(frame);
  r.decisions=[row];r.frames=[];r.game=frame;
  assert.ok(!reports.create(r).findings.some(f=>f.kind==='reselected_failed_action'&&f.tank==='B0'));
});
test('geometry valid at capture but blocked on installation is reported as timing evidence, not automatically a model mistake',()=>{
  const r=record(1),input=base();Object.assign(input.tanks[0],{x:2,y:3});
  const row=decision(input,1);row.decision.B0='move_right';const applied=core.copy(input);applied.tick=5;Object.assign(applied.tanks[2],{x:3,y:3});
  row.state_age_ms=1000;row.applied_tick=5;row.application_snapshot=reports.snapshot(applied);r.decisions=[row];
  const finding=reports.create(r).findings.find(f=>f.kind==='geometry_changed_during_call');
  assert.equal(finding.tank,'B0');assert.equal(finding.return_geometry.reason,'blocked_tank');assert.equal(finding.state_age_ms,1000);
});
test('same-tick execution belongs to the prior installed order, not a later response at that tick',()=>{
  const r=record(1);const second={...r.decisions[0],round:2,applied_tick:16,completed_tick:16};r.decisions.push(second);
  const d=reports.create(r);assert.deepEqual(d.execution_segments.find(s=>s.tank==='B0').decision_indices,[0]);
});
test('legacy replay fallback uses exact ticks and cannot invent missing snapshots or feedback awareness',()=>{
  const r=record(2);r.decisions.forEach(d=>{delete d.observation_snapshot;delete d.application_snapshot;delete d.applied_tick;d.task_prompt_version='legacy';});
  let d=reports.create(r);assert.equal(d.decisions[0].snapshot_source,'exact_tick_frame');assert.ok(!d.findings.some(f=>f.kind==='reselected_failed_action'));
  r.frames=[];d=reports.create(r);assert.equal(d.coverage.full_tick_replay,false);assert.equal(d.decisions[0].snapshot_source,'unavailable');
  assert.equal(d.decisions[0].geometry.B0.at_input.status,'unknown');
});
test('mid-match reports are explicitly partial, keep in-flight inputs and do not assume pending work is free',()=>{
  const r=record(1);r.status='running';r.pending=1;r.frames=[];r.metrics[0].finished=0;
  r.inflight=[{side:0,round:2,state_tick:r.game.tick,phase:'running',task_prompt_version:task.version,request:core.request(r.game,0)},null];
  const d=reports.create(r);assert.equal(d.partial,true);assert.equal(d.complete,false);assert.equal(d.metrics[0].usage,null);assert.equal(d.inflight.length,1);assert.match(reports.format(d),/阶段\/未确认快照/);
});
test('only allowlisted fields leave the report; known pasted credentials are redacted',()=>{
  const r=record();r.csrf='SECRET-CSRF';r.headers={Authorization:'SECRET-HEADER'};r.raw_stdout='SECRET-RAW';r.env={GH_TOKEN:'SECRET-ENV'};
  r.config.api_key='SECRET-KEY';r.game.tanks[0].token='SECRET-PRIVATE';r.decisions[0].request.headers={Authorization:'SECRET-IN-REQUEST'};
  r.decisions[0].usage.account='SECRET-ACCOUNT';r.decisions[0].raw_response='SECRET-RESPONSE';
  r.decisions[0].request.states[0].state+='\nX-NanoJev-Token: '+ 'a'.repeat(64);
  const d=reports.create(r,{note:'Bearer abcdef123456 and ghp_abcdefghijklmnopqrstuvwxyz123456'}),encoded=JSON.stringify(d);
  for(const value of ['SECRET-CSRF','SECRET-HEADER','SECRET-RAW','SECRET-ENV','SECRET-KEY','SECRET-PRIVATE','SECRET-IN-REQUEST','SECRET-ACCOUNT','SECRET-RESPONSE','abcdef123456','ghp_abcdefghijklmnopqrstuvwxyz123456'])assert.ok(!encoded.includes(value),value);
  assert.equal(d.privacy.redactions,3);assert.ok(!encoded.includes('a'.repeat(64)));assert.equal(d.decisions[0].weights_sha256,'f'.repeat(64));
});
test('malformed spatial values stay unknown rather than causing loops or fabricated feasibility',()=>{
  const g=base();g.tanks[0].x=1.5;assert.equal(reports.geometry(reports.snapshot(g),'B0','move_right').status,'unknown');
  g.tanks[0].x=1;g.tanks[3].x=NaN;assert.equal(reports.geometry(reports.snapshot(g),'B0','fire_R1').status,'unknown');
  g.map=['#'];assert.equal(reports.snapshot(g),null);
});
test('import provenance is never promoted to a verified match and invalid outcome values are rejected',()=>{
  const r=record(),d=reports.create(r,{source:'user-import-unverified'});assert.equal(d.provenance,'user-import-unverified');assert.match(reports.format(d),/未验证真实性/);
  r.result={winner:'red',reason:'time_limit'};assert.throws(()=>reports.create(r),/invalid_outcome/);
});
test('step diagnostics preserve independent scheduling, queue/native stages and explicit wait categories',()=>{
  const r=record(1);r.game.control='step';r.game.version='tank-v5-step';r.config.control='step';r.scheduling='independent_after_action';
  r.metrics[0].mean_ms=6808.8;r.metrics[0].phase='budget_idle';r.metrics[0].wait_timings={queue_ms:20,inference_ms:1000,blocked_ms:800,budget_idle_ms:500,secret:'PRIVATE'};
  r.decisions[0].queue_ms=20;r.decisions[0].telemetry={node_health_ms:2,native:{timing_protocol:'nanojev-stages-v1',prepare_ms:4,forward_ms:800,softmax_eval_ms:20,first_inference:false,idle_before_ms:7500,private:'PRIVATE'}};
  const d=reports.create(r);assert.equal(d.config.nominal_decision_gap_ms,null);assert.equal(d.scheduling,'independent_after_action');assert.equal(d.environment_contract.one_attempt_per_order,true);
  assert.equal(d.metrics[0].mean_ms,6808.8);assert.equal(d.metrics[0].wait_timings.blocked_ms,800);assert.equal(d.decisions[0].telemetry.native.forward_ms,800);
  assert.ok(!JSON.stringify(d).includes('PRIVATE'));assert.match(reports.format(d),/forward_ms/);
});
test('summary is bounded, names omitted detail and leaves full diagnostic JSON available',()=>{
  const r=record(2);r.decisions=Array.from({length:20},(_,i)=>({...r.decisions[i%2],round:i+1,copilot_task_text:'x'.repeat(23000)}));
  const d=reports.create(r),text=reports.format(d);assert.ok(text.length<=60000);assert.match(text,/截断/);assert.equal(d.decisions.length,20);
  assert.ok(JSON.stringify(d).length>text.length);assert.throws(()=>reports.create({game:r.game}),/match_required/);
});

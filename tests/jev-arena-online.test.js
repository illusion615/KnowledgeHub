'use strict';
// Injected CLI replies only: no paid inference or native-model fallback.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),planner=require('../posts/jev-system-one-research/arena-planner'),utility=require('../posts/jev-system-one-research/arena-utility'),report=require('../posts/jev-system-one-research/arena-report');
const {createArenaProvider}=require('../scripts/jev-arena-provider'),{createArenaManager,validateConfig}=require('../scripts/jev-arena');
const config=profile=>({seed:'online-fixture',mode:'sync',control:'step',ruleset:'friendly-fire',input_profile:profile,duration_s:30,max_decisions:1,consent:true,teams:[{provider:'copilot',model:'fixture-model'},{provider:'attack-baseline'}]});
function fixture(profile){const g=core.create('online-fixture','step',profile,'friendly-fire'),snapshot=report.snapshot(g),request=core.request(g,0),controller=profile==='utility-planner'?planner:utility,wire=controller.build(request,snapshot,{decision_delay_ticks:0}),scores=Object.fromEntries(wire.request.states.flatMap(s=>Object.keys(s.questions).map((id,i)=>[id,70+i])));return {g,snapshot,request,controller,wire,scores};}
function envelope(scores){return JSON.stringify({type:'assistant.message',data:{content:JSON.stringify({scores})}})+'\n'+JSON.stringify({type:'result',exitCode:0});}
for(const profile of ['utility-planner','utility-attack','utility-tactics']){
  test(profile+' accepts online teams without changing the profile or weakening consent',()=>{
    assert.deepEqual(validateConfig(config(profile)),config(profile));assert.throws(()=>validateConfig({...config(profile),consent:false}),/consent_required/);
  });
  test(profile+' uses exact CLI score contract, preserves self-scores and does not invent native probabilities',async()=>{
    const f=fixture(profile);let calls=0;
    const evaluate=createArenaProvider({localFetch:()=>assert.fail('no_native_fallback'),copilot:{evaluateTask:async(model,prompt,parse,signal)=>{
      calls++;assert.equal(model,'fixture-model');assert.equal(prompt,f.controller.copilotPrompt(f.wire));assert.match(prompt,/NOT probabilities/);assert.ok(signal instanceof AbortSignal);
      return {ok:true,decision:parse(envelope(f.scores)),usage:{model_requests:1,input_tokens:123,output_tokens:24,premium_requests:7,billing_usd:.25}};
    }}});
    const r=await evaluate({provider:'copilot',model:'fixture-model'},f.request,new AbortController().signal,f.snapshot,profile==='utility-planner'?{planner_wire:f.wire}:{utility_wire:f.wire});
    assert.equal(calls,1);assert.deepEqual(core.validatePlan(r.decision,f.request),r.decision);assert.equal(r.probabilities,undefined);assert.equal(r.binary_gates,undefined);assert.equal(r.utility_scores,undefined);assert.equal(r.usage.model_requests,1);
    const trace=r.planner_trace||r.utility_trace;assert.deepEqual(trace.self_scores,f.scores);assert.equal(trace.binary_gates,null);assert.deepEqual(trace.model_request,f.wire.request);
    if(profile==='utility-planner')for(const s of trace.plan_scores){assert.equal(s.model_score,null);assert.equal(s.self_preference,f.scores[s.question_id]);assert.equal(s.combined_value,s.search_value+12*(s.self_preference/100-.5));assert.ok(f.wire.shortlist.some(p=>p.plan_index===s.plan_index));}
    else if(profile==='utility-attack'){assert.ok(r.self_scores);assert.equal(r.self_offense_scores,undefined);assert.equal(r.combined_scores,undefined);}
    else assert.ok(r.self_offense_scores&&r.self_survival_scores&&r.combined_scores);
  });
  test(profile+' rejects missing, extra, non-numeric and out-of-range self-scores without a retry',async()=>{
    const f=fixture(profile),id=Object.keys(f.scores)[0];
    for(const scores of [Object.fromEntries(Object.entries(f.scores).slice(1)),{...f.scores,extra:80},{...f.scores,[id]:101},{...f.scores,[id]:-1},{...f.scores,[id]:'80'},{...f.scores,[id]:true},{...f.scores,[id]:null}]){
      let calls=0;const evaluate=createArenaProvider({localFetch:()=>assert.fail('no_native_fallback'),copilot:{evaluateTask:async(model,prompt,parse)=>{calls++;return {ok:true,decision:parse(envelope(scores))};}}});
      await assert.rejects(evaluate({provider:'copilot',model:'fixture-model'},f.request,new AbortController().signal,f.snapshot,profile==='utility-planner'?{planner_wire:f.wire}:{utility_wire:f.wire}),/arena_invalid_plan/);assert.equal(calls,1);
    }
  });
}

test('manager records the actual planner prompt while pending and exports CLI score semantics/cancellation faithfully',async t=>{
  let dispatched=0,release;
  const evaluate=createArenaProvider({localFetch:()=>assert.fail('no_local_call'),copilot:{evaluateTask:async(model,prompt,parse,signal)=>{
    dispatched++;assert.match(prompt,/JOINT PLAN SCORING CONTRACT/);const request=JSON.parse(prompt.split('CONTRACT:\n')[1]),scores=Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,81]));
    await new Promise((resolve,reject)=>{release=resolve;signal.addEventListener('abort',()=>reject(Object.assign(new Error('cancelled'),{code:'cancelled'})),{once:true});});
    return {ok:true,decision:parse(envelope(scores)),usage:{model_requests:1,input_tokens:100,output_tokens:10}};
  }}});
  const m=createArenaManager({auto:false,evaluate});t.after(()=>m.close());m.start(config('utility-planner'));m.pulse();
  let end=Date.now()+5000;while(!dispatched&&Date.now()<end)await new Promise(r=>setTimeout(r,10));assert.equal(dispatched,1);
  const pending=m.latest();assert.match(pending.inflight[0].copilot_task_text,/JOINT PLAN SCORING CONTRACT/);assert.match(report.create(pending).inflight[0].copilot_task_text,/JOINT PLAN SCORING CONTRACT/);
  release();end=Date.now()+5000;while(m.latest().pending&&Date.now()<end)await new Promise(r=>setTimeout(r,10));
  const d=report.create(m.latest()),row=d.decisions.find(r=>r.side===0);assert.equal(row.score_kind,'self_reported_plan_preference');assert.match(row.copilot_task_text,/JOINT PLAN SCORING CONTRACT/);assert.equal(row.planner_trace.score_kind,'self_reported_plan_preference');assert.equal(row.planner_trace.binary_gates,null);assert.ok(row.planner_trace.plan_scores.every(s=>s.self_preference===81&&s.model_score===null));assert.ok(row.planner_trace.lane_safety.enabled);assert.equal(d.config.input_profile,'utility-planner');
});

test('online planning preserves abort/stop and never changes provider after failure',async t=>{
  let calls=0,aborts=0;const evaluate=createArenaProvider({localFetch:()=>assert.fail('no_local_call'),copilot:{evaluateTask:(model,prompt,parse,signal)=>new Promise((resolve,reject)=>{calls++;signal.addEventListener('abort',()=>{aborts++;reject(Object.assign(new Error('cancelled'),{code:'cancelled'}));},{once:true});})}});
  const m=createArenaManager({auto:false,evaluate});t.after(()=>m.close());const initial=m.start(config('utility-planner'));m.pulse();let end=Date.now()+5000;while(!calls&&Date.now()<end)await new Promise(r=>setTimeout(r,10));assert.equal(calls,1);m.stop(initial.id);end=Date.now()+5000;while(m.latest().pending&&Date.now()<end)await new Promise(r=>setTimeout(r,10));assert.equal(aborts,1);assert.equal(calls,1);assert.equal(m.latest().status,'stopped');assert.equal(m.latest().decisions.find(d=>d.side===0).applied,false);
});

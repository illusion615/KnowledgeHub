#!/usr/bin/env node
'use strict';
// Paired-seed local benchmark. Search-only is explicitly a non-model ablation.
// Native calls use the existing guarded probe API: no retries/warmups/cloud calls.
const core=require('../posts/jev-system-one-research/arena-core');
const planner=require('../posts/jev-system-one-research/arena-planner');
const baseline=require('../posts/jev-system-one-research/arena-attack-policy');
const utility=require('../posts/jev-system-one-research/arena-utility');
const report=require('../posts/jev-system-one-research/arena-report');
const {performance}=require('node:perf_hooks');
async function match({seed,side,mode='sync',delay=1,profile='utility-planner',ruleset='tactical',evaluate,maxTicks=450,receipt=()=>{}}){
  const g=core.create(seed,'step',profile,ruleset),jobs=[null,null],count=[0,0];let changed=0,searchMs=0,calls=0,pathTokens=0;
  const started=performance.now();
  async function capture(s){
    const request=core.request(g,s),snapshot=report.snapshot(g);count[s]++;
    if(s!==side)return baseline.choose(snapshot,request).decision;
    const began=performance.now(),wire=profile==='utility-planner'?planner.build(request,snapshot,{decision_delay_ticks:mode==='sync'?0:delay}):utility.build(request,snapshot);searchMs+=performance.now()-began;
    if(!evaluate){if(profile!=='utility-planner')throw new Error('model_required_for_legacy_profile');receipt({seed,side,tick:g.tick,profile,snapshot,wire,chosen:{decision:wire.search_only_plan},controller:'search-only-no-model'});return wire.search_only_plan;}
    const result=await evaluate(wire.request);calls++;if(!result.ok)throw new Error(result.error||'probe_failed_no_retry');
    const chosen=profile==='utility-planner'?planner.read(result.binary_gates,wire):utility.read(result.binary_gates,wire);
    if(chosen.model_changed_plan)changed++;pathTokens+=result.usage?.input_tokens||0;
    receipt({seed,side,tick:g.tick,profile,snapshot,wire,result,chosen});return chosen.decision;
  }
  while(g.tick<maxTicks&&!core.result(g,false)){
    if(mode==='sync'){
      if([0,1].every(s=>core.sideReady(g,s)))for(const s of [0,1])core.applyPlan(g,s,await capture(s));
    }else{
      for(const s of [0,1]){
        if(!jobs[s]&&core.sideReady(g,s))jobs[s]={at:g.tick+(s===side?delay:0),plan:await capture(s)};
        if(jobs[s]&&jobs[s].at<=g.tick){core.applyPlan(g,s,jobs[s].plan);jobs[s]=null;}
      }
    }
    core.step(g);
  }
  const elimination=core.result(g,false),outcome=elimination||core.result(g,true);
  return {seed,side,mode,profile,ruleset,rule_version:g.version,controller:evaluate?'native-model-assisted':'search-only-no-model',ticks:g.tick,capped:!elimination,result:outcome,won:outcome.winner===side,draw:outcome.winner===null,stats:g.stats,decisions:count,model_calls:calls,model_changed_plan:changed,path_tokens:pathTokens,search_ms:Math.round(searchMs),wall_ms:Math.round(performance.now()-started)};
}
async function main(){
  const fs=require('node:fs'),path=require('node:path'),args=process.argv.slice(2),get=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
  const seeds=get('--seeds','tank-2026,planner-dev-a,planner-dev-b').split(','),native=args.includes('--consent-local'),origin=get('--origin','http://127.0.0.1:62848'),profile=get('--profile','utility-planner'),ruleset=get('--ruleset','tactical'),mode=get('--mode','sync'),delay=Number(get('--delay','1')),maxCalls=Number(get('--max-calls','400'));
  if(!['tactical','friendly-fire'].includes(ruleset)||!['sync','delayed'].includes(mode)||!['utility-planner','utility-tactics','utility-attack'].includes(profile)||!Number.isInteger(delay)||delay<0||delay>6||!Number.isInteger(maxCalls)||maxCalls<1||maxCalls>1000)throw new Error('invalid_configuration');
  let evaluate,fd,output=get('--output'),used=0;
  if(native&&!output)throw new Error('fresh_output_directory_required');
  if(output){fs.mkdirSync(output,{mode:0o700});fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({created_at:new Date().toISOString(),seeds,sides:[0,1],mode,delay,profile,ruleset,max_ticks:450,max_calls:maxCalls,native,planner_version:planner.version,scope:'Predeclared paired maps. Sync isolates decision quality; delayed uses synthetic fixed dispatch delay, NOT a wall-clock realtime match. No cloud, retries, warmups, training or silent model fallback.'},null,2),{flag:'wx',mode:0o600});fd=fs.openSync(path.join(output,'receipts.jsonl'),'wx',0o600);}
  const record=row=>{if(fd!==undefined){fs.writeSync(fd,JSON.stringify(row)+'\n');fs.fsyncSync(fd);}};
  if(native){
    const {checkIdle}=require('./jev-arena-lab');await checkIdle(origin);
    evaluate=async request=>{
      if(used>=maxCalls)throw new Error('call_budget_exhausted');const session=await checkIdle(origin);used++;
      const response=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs:[{provider:'nanojev-fp32',request}]})});
      const body=await response.json();if(!response.ok||!body.results?.[0]?.ok){record({error:body.error||body.results?.[0]?.error||'probe_failed',attempt:used});throw new Error('probe_failed_no_retry');}return body.results[0];
    };
  }
  const results=[];
  try{for(const seed of seeds)for(const side of [0,1]){const row=await match({seed,side,mode,delay,profile,ruleset,evaluate,receipt:record});results.push(row);record({match_summary:row});console.log(JSON.stringify(row));}}
  catch(e){record({aborted:true,error:e.message,calls_attempted:used});throw e;}
  finally{if(output)fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2),{flag:'wx',mode:0o600});if(fd!==undefined)fs.closeSync(fd);}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={match};

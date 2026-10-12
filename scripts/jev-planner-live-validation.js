#!/usr/bin/env node
'use strict';
// Actual HTTP arena, worker search, GPU inference and realtime world clock.
// Runs only predeclared local matches; never stops a pre-existing user match.
const fs=require('node:fs'),path=require('node:path');
const {checkIdle}=require('./jev-arena-lab');
async function run({origin='http://127.0.0.1:62848',seeds=['tank-2026','planner-live-holdout-01'],output,consent=false}){
  if(!consent||!output)throw new Error('consent_and_fresh_output_required');
  await checkIdle(origin);fs.mkdirSync(output,{mode:0o700});
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({created_at:new Date().toISOString(),seeds,sides:[0,1],profile:'utility-planner',mode:'realtime',simulation_limit_s:90,wall_limit_s:120,model_call_cap_per_match:100,scope:'Real HTTP arena with worker search and native FP32 inference. No cloud, retries, warmups or model fallback. All matches, failures and time limits retained.'},null,2),{flag:'wx',mode:0o600});
  const results=[];
  for(const seed of seeds)for(const side of [0,1]){
    const session=await checkIdle(origin);
    async function post(endpoint,body){const response=await fetch(origin+'/api/jev/arena/'+endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw new Error(data.error?.code||'arena_http_failed');return data;}
    const teams=[{provider:'attack-baseline'},{provider:'attack-baseline'}];teams[side]={provider:'nanojev-fp32'};
    let record=await post('start',{seed,mode:'realtime',control:'step',ruleset:'tactical',input_profile:'utility-planner',duration_s:90,max_decisions:null,rate_limit_mode:'pause-world',decision_timeout_s:30,teams,consent:true}),done=false;
    const id=record.id,started=Date.now();
    fs.writeFileSync(path.join(output,id+'-start.json'),JSON.stringify(record),{flag:'wx',mode:0o600});
    try{
      while(record.status==='running'||record.pending){
        if(Date.now()-started>120000||record.metrics[side].scheduled>=100){record=await post('stop',{id});throw new Error('explicit_experiment_budget_reached');}
        await new Promise(r=>setTimeout(r,250));record=await post('state',{id});
      }
      done=true;record=await post('replay',{id});
      fs.writeFileSync(path.join(output,id+'.json'),JSON.stringify(record),{flag:'wx',mode:0o600});
      const s=record.metrics[side],enemy=record.metrics[1-side],rows=record.decisions.filter(d=>d.side===side&&d.applied);
      const summary={id,seed,side,status:record.status,reason:record.reason,result:record.result,ticks:record.game.tick,wall_ms:record.wall_ms,model:{requests:s.requests,mean_ms:s.mean_ms,damage:s.damage,shots:s.shots,hits:s.hits,errors:s.errors},baseline:{requests:enemy.requests,mean_ms:enemy.mean_ms,damage:enemy.damage,shots:enemy.shots,hits:enemy.hits},model_changed_plan:rows.filter(r=>r.planner_trace?.model_changed_plan).length,applied_model_decisions:rows.length,delay_ticks:[...new Set(rows.map(r=>r.planner_trace?.assumptions.decision_delay_ticks))]};
      results.push(summary);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2),{mode:0o600});console.log(JSON.stringify(summary));
      if(record.status!=='completed'||record.decisions.some(d=>d.error&&d.error!=='cancelled'))throw new Error('match_failed_no_retry');
    }finally{if(!done){try{const stopped=await post('stop',{id});fs.writeFileSync(path.join(output,id+'-aborted.json'),JSON.stringify(stopped),{flag:'wx',mode:0o600});}catch(_){/* Server viewer lease stops orphaned requests; never target another id. */}}}
  }
  return results;
}
if(require.main===module){const args=process.argv.slice(2),get=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;run({origin:get('--origin','http://127.0.0.1:62848'),seeds:get('--seeds','tank-2026,planner-live-holdout-01').split(','),output:get('--output'),consent:args.includes('--consent-local')}).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={run};

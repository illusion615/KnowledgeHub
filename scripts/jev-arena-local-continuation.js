#!/usr/bin/env node
'use strict';
// Append-only continuation after USER-ADMISSION interruption. Completed episodes
// are reused, never rerun. Interrupted episode receipts remain unscored, and a
// replacement episode is explicitly a new trial (not retrying a failed model call).
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const key=r=>[r.seed,r.side,r.provider,r.candidate].join(':');
function expected(plan,stage){const seeds=stage==='holdout'?plan.holdout_seeds:plan.model_development_seeds;return seeds.flatMap(seed=>plan.sides.flatMap(side=>plan.providers.flatMap(provider=>plan.candidates.map(candidate=>({seed,side,provider,candidate})))));}
function resolveResults(cycle,plan,stage){
  const wanted=expected(plan,stage),rows=[],seen=new Set();
  for(const dir of fs.readdirSync(cycle).filter(d=>d===stage||d.startsWith(stage+'-continuation-')).sort()){
    const file=path.join(cycle,dir,'results.json');if(!fs.existsSync(file))continue;
    for(const row of JSON.parse(fs.readFileSync(file))){if(!wanted.some(w=>key(w)===key(row)))throw Error('unexpected_episode');if(seen.has(key(row)))throw Error('duplicate_completed_episode');seen.add(key(row));rows.push(row);}
  }
  return {rows:wanted.flatMap(w=>rows.filter(r=>key(r)===key(w))),missing:wanted.filter(w=>!seen.has(key(w)))};
}
function frozenLab(cycle,manifest){
  for(const [file,expectedHash]of Object.entries(manifest.sources))if(hash(fs.readFileSync(path.join(cycle,'source',file)))!==expectedHash)throw Error('frozen_source_changed');
  return require(path.join(cycle,'source/scripts/jev-arena-local-optimization.js'));
}
async function run({cycle,stage,segment,consent=false,origin='http://127.0.0.1:62848'}){
  cycle=path.resolve(cycle);if(!['model-development','holdout'].includes(stage)||!/^\d{2}$/.test(segment||'')||!consent)throw Error('stage_segment_and_explicit_consent_required');
  const manifest=JSON.parse(fs.readFileSync(path.join(cycle,'manifest.json'))),lab=frozenLab(cycle,manifest),plan=lab.validate(manifest.plan),resolved=resolveResults(cycle,plan,stage);
  if(!resolved.missing.length)throw Error('stage_already_complete');
  // Continuation is allowed after busy admission, never after a model error.
  const allReceipts=fs.readdirSync(cycle).filter(d=>d===stage||d.startsWith(stage+'-continuation-')).map(d=>path.join(cycle,d,'receipts.jsonl')).filter(f=>fs.existsSync(f));
  for(const file of allReceipts)for(const line of fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean)){const r=JSON.parse(line);if(r.aborted&&r.error!=='gateway_busy_do_not_interrupt')throw Error('non_admission_failure_requires_new_cycle');}
  if(stage==='holdout'){
    const previous=resolveResults(cycle,plan,'model-development');if(previous.missing.length)throw Error('development_incomplete');
    const review=JSON.parse(fs.readFileSync(path.join(cycle,'review-resolved-development.json')));if(review.decision!=='freeze_and_continue'||review.resolved_results_sha256!==hash(JSON.stringify(previous.rows)))throw Error('review_not_bound');
  }else if(!fs.existsSync(path.join(cycle,'review-screen.json')))throw Error('screen_review_required');
  const status=await lab.idle(origin);if(plan.providers.some(p=>status.providers?.[p]?.ready!==true))throw Error('model_unavailable');
  const lock=path.join(cycle,'running.lock');fs.mkdirSync(lock);const dir=path.join(cycle,stage+'-continuation-'+segment);let fd;const rows=[];
  try{
    fs.mkdirSync(dir,{mode:0o700});fs.writeFileSync(path.join(dir,'continuation-source.js'),fs.readFileSync(__filename),{flag:'wx',mode:0o600});fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({stage,segment,original_plan_sha256:manifest.plan_sha256,harness_sha256:hash(fs.readFileSync(__filename)),completed_episodes_reused:resolved.rows.map(key),pending_episodes:resolved.missing,scope:'Fresh replacement for interrupted episode only; existing raw receipts and completed games remain unchanged.'},null,2),{flag:'wx',mode:0o600});
    fd=fs.openSync(path.join(dir,'receipts.jsonl'),'wx',0o600);const record=r=>{fs.writeSync(fd,JSON.stringify(r)+'\n');fs.fsyncSync(fd);},counter=path.join(cycle,'model-attempts.jsonl');let used=fs.existsSync(counter)?fs.readFileSync(counter,'utf8').trim().split('\n').filter(Boolean).length:0;const deadline=performance.now()+plan.phase_wall_limit_s*1000;
    const evaluate=provider=>async request=>{if(used>=plan.model_call_budget||performance.now()>deadline)throw Error('cycle_budget_exhausted');const s=await lab.idle(origin);used++;fs.appendFileSync(counter,JSON.stringify({attempt:used,provider,stage:stage+'-continuation-'+segment,time:new Date().toISOString()})+'\n',{mode:0o600});const r=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{origin,'x-jev-csrf':s.csrf,'content-type':'application/json'},body:JSON.stringify({consent:true,jobs:[{provider,request}]})}),body=await r.json();if(!r.ok||!body.results?.[0]?.ok){record({failed_attempt:used,response:body});throw Error('model_error_no_retry');}return body.results[0];};
    for(const job of resolved.missing){const row=await lab.episode({...job,plan,evaluate:evaluate(job.provider),deadline,receipt:record});rows.push(row);record({match_summary:row});console.log(JSON.stringify(row));}
    const combined=expected(plan,stage).map(w=>resolved.rows.concat(rows).find(r=>key(r)===key(w)));fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(plan.providers.map(p=>lab.compare(combined,p)),null,2),{flag:'wx',mode:0o600});fs.writeFileSync(path.join(dir,'complete.json'),JSON.stringify({complete:true,resolved_results_sha256:hash(JSON.stringify(combined))}),{flag:'wx',mode:0o600});
  }catch(e){if(fd!==undefined)fs.writeSync(fd,JSON.stringify({aborted:true,error:e.message})+'\n');throw e;}
  finally{if(fd!==undefined){fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(rows,null,2)+'\n',{flag:'wx',mode:0o600});fs.closeSync(fd);}fs.rmdirSync(lock);}
}
if(require.main===module){const a=process.argv.slice(2),get=k=>a.includes(k)?a[a.indexOf(k)+1]:undefined;run({cycle:get('--cycle'),stage:get('--stage'),segment:get('--segment'),consent:a.includes('--consent-local'),origin:get('--origin')}).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={expected,resolveResults,run};

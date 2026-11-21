#!/usr/bin/env node
'use strict';
// Checkpoint-specific actual model episodes, with a separate CPU screening stage.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../posts/jev-system-one-research/arena-core'),planner=require('../posts/jev-system-one-research/arena-planner'),baseline=require('../posts/jev-system-one-research/arena-attack-policy'),report=require('../posts/jev-system-one-research/arena-report');
const {chooseWithPolicy}=require('./jev-arena-research');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function optionsFor(candidate){if(!['v3-cached','anti-cycle-v1','survival-anti-cycle-v1','neutral-route-v1','stagnation-rescue-v1','progress-obligation-v1'].includes(candidate))throw Error('unknown_candidate');return {decision_delay_ticks:0,cache_analysis:true,...(candidate!=='v3-cached'?{search_policy:candidate}:{})};}
function validate(p){
  if(p?.schema!=='study-room.arena-local-optimization-plan.v1'||JSON.stringify(p.providers)!=='["nanojev-fp32","laya-typed-decisions"]'||!['["v3-cached","anti-cycle-v1"]','["v3-cached","survival-anti-cycle-v1"]','["v3-cached","neutral-route-v1"]','["v3-cached","stagnation-rescue-v1"]','["v3-cached","progress-obligation-v1"]'].includes(JSON.stringify(p.candidates))||JSON.stringify(p.sides)!=='[0,1]'||p.opponent!==baseline.version||p.planner_revision!=='resource-tactics-v3'||p.invocation_policy!=='bounded-gap-v1')throw Error('invalid_plan');
  for(const k of ['screen_seeds','model_development_seeds','holdout_seeds'])if(!Array.isArray(p[k])||!p[k].length||p[k].length>3||p[k].some(s=>typeof s!=='string'||!/^[a-zA-Z0-9_-]{1,32}$/.test(s))||new Set(p[k]).size!==p[k].length)throw Error('invalid_seeds');
  if(p.holdout_seeds.some(s=>p.screen_seeds.includes(s)||p.model_development_seeds.includes(s)))throw Error('holdout_leakage');
  for(const [k,max]of [['max_ticks',450],['max_decisions_per_match',100],['model_call_budget',768],['phase_wall_limit_s',1200]])if(!Number.isInteger(p[k])||p[k]<1||p[k]>max)throw Error('invalid_budget');return p;
}
async function episode({plan,seed,side,candidate,provider=null,evaluate,receipt=()=>{},deadline=Infinity}){
  if(provider&&!evaluate)throw Error('model_evaluator_required');if(provider&&!plan.providers.includes(provider))throw Error('provider_not_declared');
  const g=core.create(seed,'step','utility-planner','friendly-fire');g.planner_revision=plan.planner_revision;
  if(candidate==='progress-obligation-v1')require('../posts/jev-system-one-research/arena-progress').start(g);
  const started=performance.now();let decisions=0,calls=0,skipped=0,tokens=0,searchMs=0,providerMs=0,changed=0,repeats=0,cacheHits=0,cacheMisses=0;
  while(g.tick<plan.max_ticks&&!core.result(g,false)){
    if(performance.now()>deadline)throw Error('phase_wall_budget');
    if([0,1].every(s=>core.sideReady(g,s))){
      if(decisions>=plan.max_decisions_per_match)break;
      const snapshot=report.snapshot(g),logical=core.request(g,side),begin=performance.now(),wire=planner.build(logical,snapshot,optionsFor(candidate));searchMs+=performance.now()-begin;cacheHits+=wire.search_cache.hits;cacheMisses+=wire.search_cache.misses;
      let chosen;if(provider){const began=performance.now();chosen=await chooseWithPolicy(wire,evaluate,plan.invocation_policy);providerMs+=performance.now()-began;if(chosen.model_called){calls++;tokens+=chosen.model_response.usage?.input_tokens??0;}else skipped++;}
      else chosen={decision:wire.search_only_plan,source:'application_search_only',model_called:false};
      core.validatePlan(chosen.decision,logical);decisions++;if(JSON.stringify(chosen.decision)!==JSON.stringify(wire.search_only_plan))changed++;
      const selected=wire.plan_audit.find(a=>JSON.stringify(a.plan)===JSON.stringify(chosen.decision));repeats+=selected?.repeat_visits||0;
      receipt({seed,side,candidate,provider,tick:g.tick,snapshot,logical,wire,chosen});
      const opposing=baseline.choose(snapshot,core.request(g,1-side)).decision;core.applyPlan(g,side,chosen.decision);core.applyPlan(g,1-side,opposing);
    }
    core.step(g);
  }
  const result=core.result(g,false),own=g.tanks.filter(t=>t.side===side&&t.hp>0),enemy=g.tanks.filter(t=>t.side!==side&&t.hp>0);
  return {seed,side,candidate,provider,mode:provider?'actual_model_gated_sync':'search_only_screen',termination:result?'elimination':'budget',winner:result?.winner??null,capped:!result,won:!!result&&result.winner===side,lost:!!result&&result.winner===1-side,ticks:g.tick,own_survivors:own.length,own_hp:own.reduce((n,t)=>n+t.hp,0),enemy_survivors:enemy.length,enemy_hp:enemy.reduce((n,t)=>n+t.hp,0),stats:g.stats[side],decisions,model_calls:calls,certified_skips:skipped,input_tokens:tokens,model_changed_plan:changed,repeated_visits:repeats,search_ms:searchMs,provider_ms:providerMs,wall_ms:performance.now()-started,cache_hits:cacheHits,cache_misses:cacheMisses};
}
function compare(rows,provider){
  const subset=rows.filter(r=>r.provider===provider),a=subset.filter(r=>r.candidate==='v3-cached'),b=subset.filter(r=>r.candidate!=='v3-cached'),key=r=>r.seed+':'+r.side;
  if(!a.length||a.length!==b.length||new Set(a.map(key)).size!==a.length||new Set(b.map(key)).size!==b.length||a.some(r=>!b.some(s=>key(s)===key(r))))throw Error('unpaired_results');
  const sum=(rs,f)=>rs.reduce((n,r)=>n+f(r),0),metrics=rs=>({games:rs.length,wins:sum(rs,r=>Number(r.won)),losses:sum(rs,r=>Number(r.lost)),caps:sum(rs,r=>Number(r.capped)),deaths:sum(rs,r=>2-r.own_survivors),damage:sum(rs,r=>r.stats.damage),repeated_visits:sum(rs,r=>r.repeated_visits),model_calls:sum(rs,r=>r.model_calls),search_ms:sum(rs,r=>r.search_ms)}),base=metrics(a),candidate=metrics(b),pairs=a.map(x=>[x,b.find(y=>key(x)===key(y))]).filter(([x,y])=>x.won&&y.won),baseTicks=sum(pairs,x=>x[0].ticks),newTicks=sum(pairs,x=>x[1].ticks);
  const quality=candidate.wins>=base.wins&&candidate.losses<=base.losses&&candidate.caps<=base.caps&&candidate.deaths<=base.deaths&&(!pairs.length||newTicks<=baseTicks),strict=candidate.wins>base.wins||candidate.deaths<base.deaths||pairs.length&&newTicks<baseTicks;
  return {provider,baseline:base,candidate,common_elimination_pairs:pairs.length,baseline_common_ticks:baseTicks,candidate_common_ticks:newTicks,quality_gate_passed:quality,strict_quality_improvement:!!strict,decision:quality&&strict?'candidate_passes_this_sample':'not_established_or_tradeoff',scope:'Small paired sample, not global optimality. Timing is descriptive and is not used alone to promote.'};
}
async function idle(origin){const u=new URL(origin);if(u.protocol!=='http:'||!['127.0.0.1','localhost'].includes(u.hostname)||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('loopback_only');const r=await fetch(u.origin+'/api/jev/status',{redirect:'error',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('backend_unavailable');const s=await r.json();if(s.backend!=='study-room-jev-live-v1'||s.arena_busy||s.experiment_busy)throw Error('gateway_busy_do_not_interrupt');return s;}
function write(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
function pin(planFile,out){
  const bytes=fs.readFileSync(planFile),plan=validate(JSON.parse(bytes)),files=fs.readdirSync(path.join(__dirname,'../posts/jev-system-one-research')).filter(f=>/^arena-.*\.js$/.test(f)).map(f=>'posts/jev-system-one-research/'+f).concat(['scripts/jev-arena-local-optimization.js','scripts/jev-arena-research.js','scripts/jev-arena-provider.js','scripts/jev-local-provider.js','scripts/jev-laya-provider.js']);
  const root=path.join(__dirname,'..'),sources=Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))])),identity={plan_sha256:hash(bytes),sources};
  if(!fs.existsSync(out)){fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'manifest.json'),{plan,...identity,created_at:new Date().toISOString()});for(const f of files){const dest=path.join(out,'source',f);fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});fs.writeFileSync(dest,fs.readFileSync(path.join(root,f)),{flag:'wx',mode:0o600});}}
  const prior=JSON.parse(fs.readFileSync(path.join(out,'manifest.json')));if(prior.plan_sha256!==identity.plan_sha256||JSON.stringify(prior.sources)!==JSON.stringify(sources))throw Error('source_or_plan_changed_new_cycle_required');return plan;
}
async function run({planFile,out,stage,consent=false,origin='http://127.0.0.1:62848'}){
  if(!['screen','model-development','holdout'].includes(stage))throw Error('invalid_stage');
  const plan=pin(planFile,out),model=stage!=='screen';if(model&&!consent)throw Error('explicit_local_consent_required');
  // No inference and no stage reservation if the user's match is still active.
  if(model){const s=await idle(origin);for(const p of plan.providers)if(s.providers?.[p]?.ready!==true)throw Error('declared_model_unavailable');}
  if(stage!=='screen'){const required=stage==='model-development'?'screen':'model-development';if(!fs.existsSync(path.join(out,required,'complete.json')))throw Error('previous_stage_required');const reviewFile=path.join(out,'review-'+required+'.json');if(!fs.existsSync(reviewFile))throw Error('review_required');const review=JSON.parse(fs.readFileSync(reviewFile));if(review.decision!=='freeze_and_continue'||review.results_sha256!==hash(fs.readFileSync(path.join(out,required,'results.json'))))throw Error('review_not_bound');}
  const lock=path.join(out,'running.lock');fs.mkdirSync(lock);let fd,dir;const results=[];
  try{dir=path.join(out,stage);fs.mkdirSync(dir,{mode:0o700});fd=fs.openSync(path.join(dir,'receipts.jsonl'),'wx',0o600);const record=row=>{fs.writeSync(fd,JSON.stringify(row)+'\n');fs.fsyncSync(fd);},deadline=performance.now()+plan.phase_wall_limit_s*1000;
    const counterFile=path.join(out,'model-attempts.jsonl');let attempts=fs.existsSync(counterFile)?fs.readFileSync(counterFile,'utf8').trim().split('\n').filter(Boolean).length:0;
    const evaluate=provider=>async request=>{if(attempts>=plan.model_call_budget||performance.now()>deadline)throw Error('cycle_budget_exhausted');const session=await idle(origin);attempts++;fs.appendFileSync(counterFile,JSON.stringify({attempt:attempts,provider,stage,time:new Date().toISOString()})+'\n',{mode:0o600});
      const r=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{origin,'x-jev-csrf':session.csrf,'content-type':'application/json'},body:JSON.stringify({consent:true,jobs:[{provider,request}]})}),body=await r.json();if(!r.ok||!body.results?.[0]?.ok){record({failed_attempt:attempts,provider,response:body});throw Error('model_error_no_retry');}return body.results[0];};
    const seeds=stage==='screen'?plan.screen_seeds:stage==='model-development'?plan.model_development_seeds:plan.holdout_seeds;
    for(const seed of seeds)for(const side of plan.sides)for(const provider of model?plan.providers:[null])for(const candidate of plan.candidates){const row=await episode({plan,seed,side,provider,candidate,evaluate:provider?evaluate(provider):null,deadline,receipt:record});results.push(row);record({match_summary:row});console.log(JSON.stringify(row));}
    write(path.join(dir,'results.json'),results);write(path.join(dir,'comparison.json'),(model?plan.providers:[null]).map(p=>compare(results,p)));write(path.join(dir,'complete.json'),{complete:true,time:new Date().toISOString()});
  }catch(e){if(fd!==undefined){fs.writeSync(fd,JSON.stringify({aborted:true,error:e.message})+'\n');if(!fs.existsSync(path.join(dir,'results.json')))write(path.join(dir,'results.json'),results);}throw e;}
  finally{if(fd!==undefined)fs.closeSync(fd);fs.rmdirSync(lock);}return results;
}
if(require.main===module){const args=process.argv.slice(2),get=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;run({planFile:get('--plan'),out:get('--output'),stage:get('--stage'),consent:args.includes('--consent-local'),origin:get('--origin')}).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={validate,optionsFor,episode,compare,idle,pin,run};

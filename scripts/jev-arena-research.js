#!/usr/bin/env node
'use strict';
// Supervised, finite research cycles. No service loop, auto-deploy, cloud or training.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../posts/jev-system-one-research/arena-core'),planner=require('../posts/jev-system-one-research/arena-planner'),baseline=require('../posts/jev-system-one-research/arena-attack-policy'),report=require('../posts/jev-system-one-research/arena-report');
const SOURCES=['arena-core.js','arena-planner.js','arena-strategy.js','arena-tactical-policy.js','arena-task.js','arena-geometry.js','arena-combat.js','arena-attack-policy.js','arena-facts.js','arena-engage.js','arena-utility.js','arena-report.js'];
function hash(value){return crypto.createHash('sha256').update(value).digest('hex');}
function sourceHashes(){return Object.fromEntries(SOURCES.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'../posts/jev-system-one-research',f)))]).concat(['jev-arena-research.js','jev-arena-provider.js','jev-laya-provider.js','jev-local-queue.js'].map(f=>[f,hash(fs.readFileSync(path.join(__dirname,f)))])));}
function validatePlan(p){
  if(p?.schema!=='study-room.arena-research-plan.v1'||!['development_seeds','holdout_seeds'].every(k=>Array.isArray(p[k])&&p[k].length>0&&p[k].length<=4&&p[k].every(s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,32}$/.test(s))))throw Error('invalid_plan');
  const seeds=p.development_seeds.concat(p.holdout_seeds);if(new Set(seeds).size!==seeds.length)throw Error('split_overlap');
  if(p.mode!=='sync'||p.ruleset!=='friendly-fire'||p.opponent!==baseline.version||JSON.stringify(p.sides)!=='[0,1]'||JSON.stringify(p.revisions)!=='["resource-terrain-v2","resource-tactics-v3"]')throw Error('unsupported_design');
  for(const [key,max] of [['max_ticks',450],['max_decisions_per_match',120],['phase_wall_limit_s',600],['model_call_budget',24],['model_probe_snapshots_per_split',6]])if(!Number.isInteger(p[key])||p[key]<1||p[key]>max)throw Error('invalid_budget');
  if(JSON.stringify(p.model_probe_providers)!=='["laya-multilingual","laya-typed-decisions"]'||p.model_probe_snapshots_per_split*4>p.model_call_budget||p.invocation_candidate!=='bounded-gap-v1')throw Error('invalid_probe_plan');return p;
}
function sampleIndices(n,count){if(!Number.isInteger(n)||!Number.isInteger(count)||count<1||count>n)throw Error('not_enough_snapshots');return Array.from({length:count},(_,i)=>Math.floor((i+.5)*n/count));}
function modelChoice(wire,result){if(!result?.ok)throw Error(result?.error||'model_failed');return planner.read(result.binary_gates,wire);}
async function chooseWithPolicy(wire,evaluate,policy='always'){
  if(!['always','bounded-gap-v1'].includes(policy))throw Error('invalid_invocation_policy');
  const certificate=planner.invocationCertificate(wire);
  if(policy==='bounded-gap-v1'&&certificate.skip)return {decision:certificate.decision,certificate,model_called:false,model_response:null,source:'application_certified_search'};
  const response=await evaluate(wire.request),chosen=modelChoice(wire,response);
  return {...chosen,certificate,model_called:true,model_response:response,source:'model_plan_ranking'};
}
function runMatch(p,{seed,side,revision,deadline=Infinity,receipt=()=>{}}){
  const g=core.create(seed,'step','utility-planner',p.ruleset);g.planner_revision=revision;
  let decisions=0,certified=0,searchMs=0,visits=0,repair=0,shield=0,wasted=0,powered=0,ownWaits=0;
  const start=performance.now();
  while(g.tick<p.max_ticks&&!core.result(g,false)){
    if(performance.now()>deadline)throw Error('phase_wall_budget');
    if([0,1].every(s=>core.sideReady(g,s))){
      if(decisions>=p.max_decisions_per_match)break;
      const snapshot=report.snapshot(g),request=core.request(g,side),begin=performance.now(),wire=planner.build(request,snapshot,{decision_delay_ticks:0});searchMs+=performance.now()-begin;
      const certificate=planner.invocationCertificate(wire),decision=planner.searchOnly(wire).decision;decisions++;if(certificate.skip)certified++;
      receipt({seed,side,revision,tick:g.tick,snapshot,request,wire,certificate,decision});
      for(const [id,a]of Object.entries(decision)){const t=g.tanks.find(t=>t.id===id),d={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]}[a];if(d)visits+=(t.recent_positions||[]).filter(p=>p.x===t.x+d[0]&&p.y===t.y+d[1]).length;if(a==='wait')ownWaits++;}
      const enemyPlan=baseline.choose(snapshot,core.request(g,1-side)).decision;
      core.applyPlan(g,side,decision);core.applyPlan(g,1-side,enemyPlan);
    }
    const before=Object.fromEntries(g.tanks.map(t=>[t.id,{hp:t.hp,shield:t.shield}]));core.step(g);
    for(const e of g.events.filter(e=>e.tick===g.tick&&e.side===side)){
      if(e.kind==='shot'&&e.powered)powered++;
      if(e.kind==='pickup'){if(e.reward==='repair'){const gain=Math.min(30,100-before[e.tank].hp);repair+=gain;if(!gain)wasted++;}if(e.reward==='shield'){const gain=Math.max(0,30-before[e.tank].shield);shield+=gain;if(!gain)wasted++;}}
    }
  }
  const outcome=core.result(g,false),own=g.tanks.filter(t=>t.side===side&&t.hp>0),enemy=g.tanks.filter(t=>t.side!==side&&t.hp>0);
  return {seed,side,revision,ticks:g.tick,termination:outcome?'elimination':decisions>=p.max_decisions_per_match?'decision_budget':'tick_budget',elimination_win:!!outcome&&outcome.winner===side,elimination_loss:!!outcome&&outcome.winner===1-side,elimination_draw:!!outcome&&outcome.winner===null,capped:!outcome,own_hp:own.reduce((n,t)=>n+t.hp,0),enemy_hp:enemy.reduce((n,t)=>n+t.hp,0),own_survivors:own.length,enemy_survivors:enemy.length,decisions,certified_skips:certified,stats:g.stats[side],repeated_move_visits:visits,repair_hp_restored:repair,shield_points_gained:shield,zero_gain_pickups:wasted,powered_shots:powered,wait_orders:ownWaits,search_ms:searchMs,wall_ms:performance.now()-start,model_calls:0};
}
function aggregate(results){return Object.fromEntries([...new Set(results.map(r=>r.revision))].map(revision=>{const rows=results.filter(r=>r.revision===revision),sum=f=>rows.reduce((n,r)=>n+f(r),0);return [revision,{matches:rows.length,elimination_wins:sum(r=>Number(r.elimination_win)),elimination_losses:sum(r=>Number(r.elimination_loss)),elimination_draws:sum(r=>Number(r.elimination_draw)),capped:sum(r=>Number(r.capped)),decisions:sum(r=>r.decisions),certified_skips:sum(r=>r.certified_skips),skip_fraction:sum(r=>r.certified_skips)/sum(r=>r.decisions),damage:sum(r=>r.stats.damage),friendly_damage:sum(r=>r.stats.friendly_damage),blocked:sum(r=>r.stats.blocked),shots:sum(r=>r.stats.shots),invalid_shots:sum(r=>r.stats.invalid_shots),repeated_move_visits:sum(r=>r.repeated_move_visits),repair_hp_restored:sum(r=>r.repair_hp_restored),shield_points_gained:sum(r=>r.shield_points_gained),zero_gain_pickups:sum(r=>r.zero_gain_pickups),powered_shots:sum(r=>r.powered_shots),wait_orders:sum(r=>r.wait_orders),search_ms:sum(r=>r.search_ms)}];}));}
function write(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2),{flag:'wx',mode:0o600});}
function openCycle(planFile,out){
  const raw=fs.readFileSync(planFile),plan=validatePlan(JSON.parse(raw)),identity={plan_sha256:hash(raw),source_sha256:sourceHashes()};
  if(!fs.existsSync(out)){fs.mkdirSync(out,{recursive:true,mode:0o700});write(path.join(out,'manifest.json'),{created_at:new Date().toISOString(),plan,...identity});}
  const stored=JSON.parse(fs.readFileSync(path.join(out,'manifest.json')));if(stored.plan_sha256!==identity.plan_sha256||JSON.stringify(stored.source_sha256)!==JSON.stringify(identity.source_sha256))throw Error('cycle_inputs_changed_new_cycle_required');return plan;
}
async function run({planFile,out,phase,consent=false,origin='http://127.0.0.1:62848'}){
  const p=openCycle(planFile,out);if(!['development','holdout','model-probes'].includes(phase))throw Error('invalid_phase');
  if(phase!=='development'&&!fs.existsSync(path.join(out,'development','complete.json')))throw Error('development_required');
  if(phase==='holdout'){
    if(!fs.existsSync(path.join(out,'review.json')))throw Error('development_review_required');
    const review=JSON.parse(fs.readFileSync(path.join(out,'review.json')));
    if(review.decision!=='proceed_without_tuning'||review.development_results_sha256!==hash(fs.readFileSync(path.join(out,'development','results.json'))))throw Error('review_not_bound_to_development_results');
  }
  if(phase==='model-probes'&&(!consent||!fs.existsSync(path.join(out,'holdout','complete.json'))))throw Error('consent_and_holdout_required');
  const dir=path.join(out,phase);fs.mkdirSync(dir,{mode:0o700});const fd=fs.openSync(path.join(dir,'receipts.jsonl'),'wx',0o600),append=row=>{fs.writeSync(fd,JSON.stringify(row)+'\n');fs.fsyncSync(fd);},deadline=performance.now()+p.phase_wall_limit_s*1000,results=[];
  try{
    if(phase!=='model-probes'){
      const selected=[],seeds=p[phase==='development'?'development_seeds':'holdout_seeds'];
      for(const revision of p.revisions)for(const seed of seeds)for(const side of p.sides){const row=runMatch(p,{seed,side,revision,deadline,receipt:r=>{append(r);if(revision==='resource-tactics-v3')selected.push(r);}});results.push(row);append({match_summary:row});console.log(JSON.stringify(row));await new Promise(r=>setImmediate(r));}
      write(path.join(dir,'probe-snapshots.json'),sampleIndices(selected.length,p.model_probe_snapshots_per_split).map(i=>({index:i,...selected[i]})));write(path.join(dir,'summary.json'),aggregate(results));
    }else{
      const {checkIdle}=require('./jev-arena-lab');let used=0;
      for(const split of ['development','holdout'])for(const sample of JSON.parse(fs.readFileSync(path.join(out,split,'probe-snapshots.json'))))for(const provider of p.model_probe_providers){
        if(used>=p.model_call_budget||performance.now()>deadline)throw Error('probe_budget_exhausted');const session=await checkIdle(origin);used++;append({attempt:used,split,provider,snapshot_index:sample.index,request:sample.wire.request});
        const begin=performance.now(),response=await fetch(origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs:[{provider,request:sample.wire.request}]})}),body=await response.json();
        if(!response.ok||!body.results?.[0]?.ok){append({attempt:used,error:body});throw Error('probe_failed_no_retry');}
        const raw=body.results[0],chosen=modelChoice(sample.wire,raw),certificate=planner.invocationCertificate(sample.wire),gated=certificate.skip?certificate.decision:chosen.decision;
        const row={split,provider,seed:sample.seed,side:sample.side,tick:sample.tick,snapshot_index:sample.index,certified_skip:certificate.skip,gate_reason:certificate.reason,search_gap:certificate.search_gap,action_disagreement:JSON.stringify(chosen.decision)!==JSON.stringify(gated),model_changed_search:chosen.model_changed_plan,decision:chosen.decision,input_tokens:raw.usage?.input_tokens??null,observed_probe_ms:performance.now()-begin,scope:'Real always-call shadow response; gated branch is a same-response replay, not an independent latency run.'};append({summary:row,raw,chosen,certificate});results.push(row);console.log(JSON.stringify(row));
      }
    }
    write(path.join(dir,'complete.json'),{complete:true,results:results.length,finished_at:new Date().toISOString()});
  }catch(e){append({aborted:true,error:e.message,completed_results:results.length});throw e;}
  finally{write(path.join(dir,'results.json'),results);fs.closeSync(fd);}return results;
}
if(require.main===module){const args=process.argv.slice(2),get=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;run({planFile:get('--plan'),out:get('--output'),phase:get('--phase'),origin:get('--origin'),consent:args.includes('--consent-local')}).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={validatePlan,sampleIndices,runMatch,aggregate,chooseWithPolicy,openCycle,run};

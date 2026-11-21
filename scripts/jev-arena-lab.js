#!/usr/bin/env node
'use strict';
// Explicit, bounded local-only experiments. Never retries, warms up, repairs an
// action, invokes Copilot, or changes a live match. Receipts are written per call.
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const core = require('../posts/jev-system-one-research/arena-core');
const report = require('../posts/jev-system-one-research/arena-report');
const PROVIDERS = ['nanojev-fp32', 'nanojev-4bit'];
const PROFILES = ['original', 'focused', 'geometry-assisted', 'action-facts', 'combat', 'attack-priority', 'engage-first'];
function requestFor(game, side, profile) {
  if (!PROFILES.includes(profile)) throw new Error('invalid_profile');
  if (profile === 'engage-first') {
    const guarded={...game,input_profile:'engage-first'};
    return core.request(guarded,side,core.observation(guarded,{duration_ticks:null,scheduler:'after_action'}));
  }
  if (profile === 'attack-priority') {
    const req=require('../posts/jev-system-one-research/arena-facts').request(game,side);
    req.states[0].state=req.states[0].state.replace('Tank battle. Win by destroying enemies; at limits maximize survivors then HP.','GOAL: destroy all enemy tanks. Exploration, novelty and movement alone have no value.');
    for(const [id,q]of Object.entries(req.states[0].questions))q.instructions='Choose '+id+' action to DESTROY enemies. First: a clear shot that kills; second: a clear shot that damages; otherwise: move toward a firing position. Never prefer an unvisited cell over a useful attack. Do not retreat or circle without an attack reason.';
    return req;
  }
  if (profile === 'combat') return require('../posts/jev-system-one-research/arena-combat').request(game,side);
  if (profile === 'action-facts') return require('../posts/jev-system-one-research/arena-facts').request(game,side);
  const req = core.request(game, side, core.observation(game, {duration_ticks:300,scheduler:'after_action'}));
  if (profile === 'original') return req;
  req.states[0].state = [
    'Tank battle. Goal: defeat enemies; maximize surviving tanks and HP.',
    'Choose ONE action for each tank. Move one cell or attempt one shot, then replan. No automatic movement or firing.',
    'Coordinates (x,y): column,row from top-left, zero-based. # wall, . floor. Walls and live tanks block movement.',
    'A shot requires a live enemy in the SAME row or column, distance <=6, and no wall between. Otherwise the shot fails. Walls cannot be destroyed.',
    'If no shot is possible, move toward enemies via open cells. Do not keep trying a failed shot. Avoid moving back and forth without progress.',
    game.map.join('\n'),
    game.tanks.map(t=>`${t.id}: position(${t.x},${t.y}), HP=${t.hp}, reload=${t.cooldown} ticks`).join('\n'),
    'Previous actions: '+game.tanks.filter(t=>t.last_execution).map(t=>`${t.id} ${t.last_execution.action}: ${t.last_execution.outcome}`).join('; ')
  ].join('\n');
  for (const [id,q] of Object.entries(req.states[0].questions)) {
    const t=game.tanks.find(t=>t.id===id),enemies=game.tanks.filter(e=>e.side!==side&&e.hp>0);
    q.instructions=`Which action should ${id} at (${t.x},${t.y}) take next to defeat enemies ${enemies.map(e=>e.id).join(',')}? Choose a feasible action that makes progress, not an impossible shot.`;
    if(profile==='geometry-assisted')for(const key of Object.keys(q.criteria)) {
      const g=report.geometry(report.snapshot(game),id,key);
      q.criteria[key]+=` Geometry: ${g.status==='clear'?'clear':g.reason}; reload and simultaneous motion not evaluated.`;
    }
  }
  return req;
}
function cases(split) {
  const first=core.create('tank-2026','step');
  const returned=core.copy(first); returned.tick=8;
  returned.tanks.find(t=>t.id==='B1').x=2;returned.tanks.find(t=>t.id==='R0').x=10;
  for(const id of ['B1','R0']){const t=returned.tanks.find(t=>t.id===id);t.recent_positions.push({x:t.x,y:t.y});}
  for(const [id,action,outcome] of [['B0','fire_R0','range'],['B1','move_right','moved'],['R0','move_left','moved'],['R1','fire_B1','range']])returned.tanks.find(t=>t.id===id).last_execution={tick:8,action,outcome};
  if(split==='development')return [{id:'initial',game:first,side:0},{id:'after-one-step',game:returned,side:0}];
  if(split==='latency') {
    const later=core.copy(returned);later.tick=20;
    return [first,returned,later,first,returned,later].map((game,i)=>({id:'latency-'+(i+1),game,side:0}));
  }
  if(split==='validation-v3') {
    const cycle=core.create('history-independent','step');cycle.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');cycle.rewards=[];cycle.tick=16;
    Object.assign(cycle.tanks[0],{x:2,y:4,recent_positions:[{x:1,y:4},{x:1,y:5},{x:2,y:5},{x:2,y:4}],last_execution:{tick:16,action:'move_up',outcome:'moved'}});
    const retreat=core.copy(cycle);Object.assign(retreat.tanks[0],{x:4,y:4,recent_positions:[{x:4,y:5},{x:4,y:4}],last_execution:{tick:16,action:'move_up',outcome:'moved'}});retreat.map[3]='#...#.......#';retreat.map[4]='#..#.#......#';
    const shot=core.copy(cycle);shot.tanks.forEach((t,i)=>{[t.x,t.y]=[[2,4],[2,6],[7,4],[7,6]][i];t.recent_positions=[{x:t.x,y:t.y}];t.last_execution=null;});
    return [{id:'exit-cycle-v3',game:cycle,side:0},{id:'necessary-return-v3',game:retreat,side:0},{id:'shoot-over-explore-v3',game:shot,side:0}];
  }
  if(split==='validation-v2') {
    const corridor=core.create('facts-independent','step');corridor.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');corridor.rewards=[];
    corridor.tanks.forEach((t,i)=>{[t.x,t.y]=[[2,2],[2,6],[10,2],[10,6]][i];t.recent_positions=[{x:t.x,y:t.y}];});
    const shoot=core.copy(corridor);shoot.tanks.forEach((t,i)=>{[t.x,t.y]=[[4,2],[4,6],[9,2],[9,6]][i];t.recent_positions=[{x:t.x,y:t.y}];});
    const detour=core.copy(shoot);detour.map[2]='#....#......#';detour.map[6]='#....#......#';
    return [{id:'approach-corridor-v2',game:corridor,side:0},{id:'red-clear-shot-v2',game:shoot,side:1},{id:'wall-detour-v2',game:detour,side:0}];
  }
  if(split!=='heldout')throw new Error('invalid_split');
  // Constructed independent states; all choices remain available. No optimal
  // tactical labels are invented: only selected-action geometry is measured.
  const open=core.create('lab-open','step');open.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');open.rewards=[];
  const positions=[[3,3],[3,5],[8,3],[8,5]];open.tanks.forEach((t,i)=>{[t.x,t.y]=positions[i];t.recent_positions=[{x:t.x,y:t.y}];});
  const walled=core.copy(open);walled.map[3]='#....#......#';walled.map[5]='#....#......#';
  return [{id:'different-map-red',game:core.create('lab-unseen-42','step'),side:1},{id:'open-firing-lanes',game:open,side:0},{id:'walls-block-shots',game:walled,side:0}];
}
async function checkIdle(origin) {
  const url=new URL(origin);
  if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('loopback_origin_required');
  const response=await fetch(url.origin+'/api/jev/status',{redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('backend_unavailable');
  const status=await response.json();
  if(status.backend!=='study-room-jev-live-v1'||typeof status.arena_busy!=='boolean')throw new Error('backend_upgrade_required');
  if(status.arena_busy)throw new Error('match_still_running');
  if(status.experiment_busy)throw new Error('experiment_busy');
  if(PROVIDERS.some(p=>status.providers?.[p]?.ready!==true))throw new Error('local_service_unavailable');
  return status;
}
async function probe(origin,jobs) {
  const session=await checkIdle(origin);
  const response=await fetch(new URL(origin).origin+'/api/jev/arena/probe',{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{Origin:new URL(origin).origin,'Content-Type':'application/json','X-Jev-Csrf':session.csrf},body:JSON.stringify({consent:true,jobs})});
  if(!response.ok)throw new Error(response.status===429?'probe_busy_or_rate_limited':'probe_failed');
  const data=await response.json();if(!Array.isArray(data.results)||data.results.length!==jobs.length)throw new Error('invalid_probe_response');
  return data.results;
}
async function run({split,profiles,output,maxCalls,consent,evaluate,concurrent=false,origin='http://127.0.0.1:62848',guard=()=>checkIdle(origin)}) {
  if(consent!==true)throw new Error('explicit_local_consent_required');
  if(!Array.isArray(profiles)||!profiles.length||profiles.some(p=>!PROFILES.includes(p)))throw new Error('invalid_profile');
  const fixtures=cases(split),count=fixtures.length*profiles.length*PROVIDERS.length;
  if(!Number.isInteger(maxCalls)||maxCalls<1||maxCalls>32||count>maxCalls)throw new Error('call_budget_exceeded');
  await guard();
  if(typeof output!=='string'||!output)throw new Error('output_required');
  fs.mkdirSync(output,{recursive:true,mode:0o700});
  const stat=fs.lstatSync(output);
  if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o077))throw new Error('unsafe_output_directory');
  // Refuse to overwrite experimental evidence or silently resume partial runs.
  const journal=path.join(output,'receipts.jsonl'),receipts=[];
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({schema:'study-room.tank-lab.v1',created_at:new Date().toISOString(),transport:evaluate?'injected-evaluator':'local-backend-probe',split,profiles,planned_calls:count,concurrent,scope:'Local models only. Fixed-state representation experiment; selected geometry is not tactical accuracy. geometry-assisted explicitly supplies computed feasibility, without filtering or replacing choices.'},null,2),{flag:'wx',mode:0o600});
  const fd=fs.openSync(journal,'wx',0o600);
  try {
    for(const fixture of fixtures)for(const profile of profiles){
      await guard();
      async function attempt(provider,providedResult){
        const request=requestFor(fixture.game,fixture.side,profile),began=performance.now();
        const base={case_id:fixture.id,split,profile,provider,side:fixture.side,observation:report.snapshot(fixture.game),request};
        let receipt;
        try {
          const result=providedResult || (evaluate ? await evaluate({provider},request,AbortSignal.timeout(30000)) : (await probe(origin,[{provider,request}]))[0]);
          if(!result.ok)throw new Error(result.error||'local_failed');
          receipt={...base,elapsed_ms:result.lab_elapsed_ms??performance.now()-began,result,geometry:Object.fromEntries(Object.entries(result.decision).map(([id,key])=>[id,report.geometry(report.snapshot(fixture.game),id,key)]))};
        }catch(e){receipt={...base,elapsed_ms:performance.now()-began,error:/^[a-z_]+$/.test(e.code||e.message)?e.code||e.message:'local_failed'};}
        fs.writeSync(fd,JSON.stringify(receipt)+'\n');fs.fsyncSync(fd);receipts.push(receipt);
        if(receipt.error)throw new Error(receipt.error);
      }
      if(concurrent){
        let batch;
        if(!evaluate)try{batch=await probe(origin,PROVIDERS.map(provider=>({provider,request:requestFor(fixture.game,fixture.side,profile)})));}catch(e){batch=PROVIDERS.map(()=>({ok:false,error:/^[a-z_]+$/.test(e.message)?e.message:'probe_failed'}));}
        const results=await Promise.allSettled(PROVIDERS.map((provider,i)=>attempt(provider,batch?.[i])));const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
      }
      else for(const provider of PROVIDERS)await attempt(provider);
    }
  }finally{fs.closeSync(fd);}
  return receipts.map(r=>({case:r.case_id,profile:r.profile,provider:r.provider,ms:Math.round(r.elapsed_ms),decision:r.result.decision,clear:Object.values(r.geometry).filter(g=>g.status==='clear').length,total:Object.keys(r.geometry).length}));
}
if(require.main===module){
  const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
  const allowed=['--consent-local','--split','--profiles','--output','--max-calls','--concurrent','--origin'];
  if(args.some(a=>a.startsWith('--')&&!allowed.includes(a))){console.error('invalid_argument');process.exitCode=1;}
  else run({split:value('--split'),profiles:(value('--profiles')||'').split(','),output:value('--output'),maxCalls:Number(value('--max-calls')),consent:args.includes('--consent-local'),concurrent:args.includes('--concurrent'),origin:args.includes('--origin')?value('--origin'):'http://127.0.0.1:62848'}).then(rows=>console.log(JSON.stringify(rows,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
module.exports={requestFor,cases,run,checkIdle};

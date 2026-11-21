'use strict';
// Deterministic physics/planning fixtures, not model intelligence or win-rate evidence.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),geometry=require('../posts/jev-system-one-research/arena-geometry'),combat=require('../posts/jev-system-one-research/arena-combat'),planner=require('../posts/jev-system-one-research/arena-planner'),report=require('../posts/jev-system-one-research/arena-report'),task=require('../posts/jev-system-one-research/arena-task'),utility=require('../posts/jev-system-one-research/arena-utility'),tactics=require('../posts/jev-system-one-research/arena-tactics');
const {validateConfig,createArenaManager}=require('../scripts/jev-arena');
function open(profile='utility-planner'){
  const g=core.create('friendly-fixture','step',profile,'friendly-fire');g.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');g.rewards=[];
  [[2,3],[4,3],[6,3],[10,7]].forEach(([x,y],i)=>Object.assign(g.tanks[i],{x,y,recent_positions:[{x,y}]}));g.tanks[3].hp=0;return g;
}
function run(g,n=6){for(let i=0;i<n;i++)core.step(g);return g;}
function bullet(side,x,damage=12){return {id:side+1,owner:side===0?'B0':'R0',side,x,y:3,dx:side===0?1:-1,dy:0,life:5,damage};}
const cfg={seed:'friendly-fixture',mode:'sync',control:'step',ruleset:'friendly-fire',input_profile:'utility-planner',duration_s:90,max_decisions:1,teams:[{provider:'nanojev-fp32'},{provider:'attack-baseline'}],consent:true};

test('friendly fire has an explicit new physics/task identity; old cardinal and v6 remain transparent',()=>{
  const g=open();assert.equal(g.version,'tank-v7-friendly-fire');assert.equal(geometry.enabled(g),true);assert.equal(geometry.friendlyFire(g),true);assert.equal(task.versionFor(g),'tank-planner-friendly-fire-v1');assert.deepEqual(validateConfig(cfg),cfg);
  assert.throws(()=>validateConfig({...cfg,control:'primitive'}));assert.throws(()=>core.create('bad','primitive','raw','friendly-fire'));
  for(const version of ['tank-v5-step','tank-v6-tactical']){const legacy=open();legacy.version=version;core.applyPlan(legacy,0,{B0:'fire_R0'});run(legacy);assert.equal(legacy.tanks[1].hp,100);assert.equal(legacy.tanks[2].hp,88);assert.equal(legacy.stats[0].friendly_hits,0);}
});
test('first friendly tank intercepts horizontal fire, shields absorb normally, and no shot reaches the enemy behind it',()=>{
  const g=open();g.tanks[1].shield=6;core.applyPlan(g,0,{B0:'fire_R0'});run(g);
  assert.equal(g.tanks[0].hp,100,'launch does not hit the shooter');assert.equal(g.tanks[1].hp,94);assert.equal(g.tanks[1].shield,0);assert.equal(g.tanks[2].hp,100);assert.equal(g.bullets.length,0);
  assert.equal(g.stats[0].shots,1);assert.equal(g.stats[0].hits,0);assert.equal(g.stats[0].friendly_hits,1);assert.equal(g.stats[0].friendly_damage,6);assert.equal(g.stats[0].friendly_shield_damage,6);assert.equal(g.stats[0].damage,0);assert.equal(g.stats[1].damage,0);
  const impact=g.events.find(e=>e.kind==='impact');assert.equal(impact.tank,'B1');assert.equal(impact.friendly_fire,true);assert.ok(impact.x<4);assert.ok(g.events.some(e=>e.kind==='damage'&&e.friendly_hp===6));
});
test('diagonal friendly collisions use swept hitboxes; destroyed tanks do not block and powered shots still work',()=>{
  const g=open();[[2,2],[3,3],[5,5]].forEach(([x,y],i)=>Object.assign(g.tanks[i],{x,y}));g.tanks[0].power_until=20;core.applyPlan(g,0,{B0:'fire_R0'});run(g);
  assert.equal(g.tanks[0].hp,100);assert.equal(g.tanks[1].hp,80);assert.equal(g.tanks[2].hp,100);assert.equal(g.stats[0].friendly_damage,20);
  const clear=open();clear.tanks[1].hp=0;core.applyPlan(clear,0,{B0:'fire_R0'});run(clear);assert.equal(clear.tanks[2].hp,88);assert.equal(clear.stats[0].hits,1);
});
test('only the shooter on the launch segment is exempt, not every friendly tank for the projectile lifetime',()=>{
  const g=open();g.tanks[0].x=3;g.bullets=[{...bullet(0,2),owner:'B0'}];core.step(g);assert.equal(g.tanks[0].hp,88);assert.equal(g.stats[0].friendly_hits,1);
});
test('red and blue use identical friendly-fire rules',()=>{
  const g=open();Object.assign(g.tanks[0],{x:6,y:3});g.tanks[1].hp=0;Object.assign(g.tanks[2],{x:10,y:3});Object.assign(g.tanks[3],{x:8,y:3,hp:100});
  core.applyPlan(g,1,{R0:'fire_B0'});run(g);assert.equal(g.tanks[3].hp,88);assert.equal(g.tanks[0].hp,100);assert.equal(g.stats[1].friendly_damage,12);assert.equal(g.stats[0].damage,0);
});
test('rendered projectile endpoints stop at the friendly collision, not at the intended enemy',()=>{
  const g=open();core.applyPlan(g,0,{B0:'fire_R0'});run(g,2);
  const timeline=require('../posts/jev-system-one-research/arena-renderer').createTimeline(0);timeline.push(g,0,{key:'friendly',live:false});const sample=timeline.sample(0),impact=g.events.find(e=>e.kind==='impact');
  assert.equal(impact.tank,'B1');assert.ok(sample.projectiles.length);assert.ok(sample.projectiles.every(b=>b.x<=impact.x));assert.ok(impact.x<g.tanks[1].x);
});
test('walls still win collision ties and block corners under v7',()=>{
  const g=open();g.map[3]='#..#........#';const hit=geometry.sweep(g,{x:2,y:3},{x:6,y:3},0,'B0');assert.equal(hit.kind,'wall');
  assert.equal(geometry.sight(g,{x:2,y:2},{x:4,y:4}).reason,'wall');
});
test('guarded candidates and BFS facts identify friendly blockers; stale/raw orders still physically fire instead of being silently repaired',()=>{
  const g=open();assert.equal(combat.shot(g,g.tanks[0],g.tanks[2],0).reason,'friendly_blocked');assert.equal(core.candidates(g,g.tanks[0]).fire_R0,undefined);assert.match(combat.describe(g,g.tanks[0],'fire_R0'),/UNSAFE FIRE/);
  assert.equal(report.geometry(report.snapshot(g),'B0','fire_R0').reason,'friendly_fire_risk');assert.ok(combat.analyse(g,g.tanks[0]).current>0);
  g.input_profile='action-facts';assert.match(core.candidates(g,g.tanks[0]).fire_R0,/UNSAFE FIRE/);
  g.input_profile='raw';assert.ok(core.candidates(g,g.tanks[0]).fire_R0);assert.match(core.observation(g),/including allies/);assert.ok(!core.observation(g).includes('passes allies'));
  core.applyPlan(g,0,{B0:'fire_R0'});run(g);assert.equal(g.stats[0].invalid_shots,0);assert.equal(g.stats[0].friendly_hits,1);
});
test('friendly damage attribution is capped and independent of mixed projectile ordering',()=>{
  function fixture(reverse){const g=open();g.tanks[1].hp=10;g.tanks[1].shield=10;g.bullets=[bullet(0,3,12),bullet(1,5,20)];if(reverse)g.bullets.reverse();return run(g,1);}
  const a=fixture(false),b=fixture(true);assert.deepEqual(a.stats,b.stats);assert.equal(a.tanks[1].hp,0);assert.equal(a.tanks[1].shield,0);
  assert.equal(a.stats[0].friendly_damage,3.75);assert.equal(a.stats[0].friendly_shield_damage,3.75);assert.equal(a.stats[1].damage,6.25);assert.equal(a.stats[0].damage,0);assert.equal(a.stats[1].hits,1);
});
test('joint lane forecast detects moving across a teammates proposed shot before model scoring',()=>{
  const g=open();g.tick=3;g.tanks[1].y=2;const crossing={B0:'fire_R0',B1:'move_down'},safe={B0:'fire_R0',B1:'move_up'};
  assert.ok(core.candidates(g,g.tanks[0]).fire_R0,'shot is safe in the capture geometry');assert.equal(planner.laneForecast(report.snapshot(g),0,crossing,0).friendly_hp_damage,12);assert.equal(planner.laneForecast(report.snapshot(g),0,safe,0).friendly_hits,0);
  const w=planner.build(core.request(g,0),report.snapshot(g),{decision_delay_ticks:0});assert.equal(w.version,'tank-planner-friendly-fire-v1');assert.equal(w.lane_safety.enabled,true);assert.equal(w.lane_safety.no_safe_plan,false);
  const bad=w.plan_audit.find(a=>a.plan.B0==='fire_R0'&&a.plan.B1==='move_down');assert.ok(bad);assert.equal(bad.lane_safety.friendly_hits,1);assert.ok(!w.lane_safety.eligible_plan_indices.includes(bad.plan_index));assert.ok(w.shortlist.every(s=>w.plan_audit[s.plan_index].lane_safety.friendly_hits===0));
  assert.ok(Object.values(w.request.states[0].questions).every(q=>q.instructions.includes('friendly fire')));
});
test('crossing a firing lane after the bullet has passed is not incorrectly prohibited',()=>{
  const g=open();g.tick=0;g.tanks[1].y=2;
  const plan={B0:'fire_R0',B1:'move_down'},forecast=planner.laneForecast(g,0,plan,0);
  assert.equal(forecast.friendly_hits,0,'bullet passes x=4 on tick 2; ally moves there on tick 4');
  core.applyPlan(g,0,plan);run(g);assert.equal(g.stats[0].friendly_hits,0);assert.equal(g.tanks[2].hp,88);
});
test('existing friendly projectiles affect movement safety; when all plans are unsafe the fallback is explicit',()=>{
  const g=open();g.tick=3;g.tanks[1].y=2;g.bullets=[bullet(0,3)];
  assert.equal(planner.laneForecast(g,0,{B0:'move_up',B1:'move_down'},0).friendly_hits,1);
  const doomed=open();doomed.tick=0;doomed.bullets=[bullet(0,3)];const w=planner.build(core.request(doomed,0),report.snapshot(doomed),{decision_delay_ticks:0});
  assert.equal(w.lane_safety.no_safe_plan,true);assert.equal(w.lane_safety.eligible_plan_indices.length,w.plans.length);assert.ok(w.shortlist.length);assert.ok(w.plan_audit.every(a=>a.lane_safety.friendly_hits>=1));
});
test('lane prediction uses the actual delayed one-action engine, includes reload and never reads hidden orders',()=>{
  const g=open();g.tick=3;g.tanks[1].y=2;g.tanks[0].cooldown=4;
  const req=core.request(g,0),snapshot=report.snapshot(g),w=planner.build(req,snapshot,{decision_delay_ticks:2});
  for(const p of w.plans){const forecast=planner.laneForecast(snapshot,0,p,2),sim=planner.world(snapshot);for(let tick=0;tick<14;tick++){if(tick===2)core.applyPlan(sim,0,p);core.step(sim);if(core.result(sim,false))break;}assert.equal(forecast.friendly_hits,sim.stats[0].friendly_hits);assert.equal(forecast.friendly_hp_damage,sim.stats[0].friendly_damage);}
  g.tanks.forEach(t=>{t.order='secret';t.pending_action=true;});assert.deepEqual(planner.build(req,report.snapshot(g),{decision_delay_ticks:2}),w);
});
test('v7 tactical forecasts do not self-hit on launch and remain physically consistent',()=>{
  const g=open('utility-tactics');g.tanks[1].y=2;const w=utility.build(core.request(g,0),report.snapshot(g));assert.equal(utility.versionFor(g),'tank-tactical-friendly-fire-v1');
  for(const plan of w.plans){const projected=tactics.forecast(g,0,plan),sim=core.copy(g);for(let tick=1;tick<=8;tick++){if(tick===4)core.applyPlan(sim,0,plan);core.step(sim);if(core.result(sim,false))break;}for(const t of sim.tanks.filter(t=>t.side===0)){assert.equal(projected.tanks[t.id].hp_after,t.hp);assert.equal(projected.tanks[t.id].shield_after,t.shield);}}
});
test('manager/worker/export preserve friendly-fire identity, lane constraints and separate friendly KPIs',async t=>{
  const m=createArenaManager({auto:false,evaluate:async(team,req,signal,snapshot,ctx)=>{
    if(team.provider==='attack-baseline')return {ok:true,decision:require('../posts/jev-system-one-research/arena-attack-policy').choose(snapshot,req).decision};
    const w=ctx.planner_wire,gs=Object.fromEntries(w.shortlist.map(s=>[s.question_id,{p_true:.6,value:true,probabilities:{false:.4,true:.6}}])),r=planner.read(gs,w),trace=planner.trace(w,r,gs);trace.lane_safety.secret='PRIVATE';return {ok:true,decision:r.decision,planner_trace:trace};
  }});t.after(()=>m.close());m.start(cfg);m.pulse();const end=Date.now()+5000;while(m.latest().pending&&Date.now()<end)await new Promise(r=>setTimeout(r,10));
  const raw=m.latest();raw.game.stats[0].friendly_damage=12;raw.metrics[0].friendly_damage=12;const d=report.create(raw),r=d.decisions.find(r=>r.side===0);
  assert.equal(d.rule_version,'tank-v7-friendly-fire');assert.equal(d.environment_contract.friendly_fire,true);assert.equal(d.environment_contract.friendly_tanks_block_shots,true);assert.equal(d.metrics[0].friendly_damage,12);assert.equal(r.planner_trace.version,'tank-planner-friendly-fire-v1');assert.equal(r.planner_trace.lane_safety.enabled,true);assert.ok(r.planner_trace.plan_audit.every(a=>a.lane_safety));assert.equal(r.planner_trace.assumptions.friendly_damage_penalty,2);assert.ok(!JSON.stringify(d).includes('PRIVATE'));
});

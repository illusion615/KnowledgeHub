'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),task=require('../posts/jev-system-one-research/arena-task'),report=require('../posts/jev-system-one-research/arena-report');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
function game(){const g=core.create('engage-fixture','step','engage-first');g.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');g.rewards=[];return g;}
const moves=['move_up','move_down','move_left','move_right'];
test('approach first exposes only movement while enemies are out of firing geometry, preserving raw controls for comparison',()=>{
  const g=game();assert.deepEqual(Object.keys(core.candidates(g,g.tanks[0])),moves);assert.match(task.question(g,g.tanks[0]),/APPROACH/);assert.match(core.observation(g),/FILTERED/);assert.equal(task.versionFor(g),'tank-engage-first-v1');
  for(const profile of ['raw','action-facts']){g.input_profile=profile;assert.equal(Object.keys(core.candidates(g,g.tanks[0])).length,6);}
});
test('range boundary, alignment, walls and living targets determine the actual offered fire keys; reload is not a geometry test',()=>{
  const g=game(),t=g.tanks[0],enemy=g.tanks[2];Object.assign(enemy,{x:8,y:3});assert.ok(!core.candidates(g,t).fire_R0);
  enemy.x=7;assert.ok(core.candidates(g,t).fire_R0);assert.match(task.question(g,t),/ENGAGE: valid fire targets R0/);
  t.cooldown=5;assert.ok(core.candidates(g,t).fire_R0);
  enemy.y=4;assert.ok(!core.candidates(g,t).fire_R0);enemy.y=3;
  g.map[3]='#...#.......#';assert.ok(!core.candidates(g,t).fire_R0);g.map[3]='#...........#';
  Object.assign(g.tanks[1],{x:4,y:3});assert.ok(core.candidates(g,t).fire_R0,'Allies pass bullets');enemy.hp=0;assert.ok(!core.candidates(g,t).fire_R0);
});
test('moving into range enables a new firing choice and an actual shot; no automatic fire or substitute action is added',()=>{
  const g=game();Object.assign(g.tanks[2],{x:8,y:3});const before=core.request(g,0);
  assert.throws(()=>core.validatePlan({B0:'fire_R0',B1:'move_right'},before),/arena_invalid_plan/);
  const plan=core.validatePlan({B0:'move_right',B1:'move_right'},before);core.applyPlan(g,0,plan);for(let i=0;i<4;i++)core.step(g);
  assert.equal(g.tanks[0].x,2);assert.equal(g.stats[0].fire_attempts,0);
  const after=core.request(g,0);assert.ok(after.states[0].questions.B0.criteria.fire_R0);core.applyPlan(g,0,{B0:'fire_R0'});for(let i=0;i<6;i++)core.step(g);
  assert.equal(g.stats[0].shots,1);assert.equal(g.stats[0].invalid_shots,0);assert.equal(g.tanks[2].hp,88);
});
test('capture-time gating does not fabricate success or secretly replace a shot if the enemy moves during inference',()=>{
  const g=game();Object.assign(g.tanks[2],{x:7,y:3});const request=core.request(g,0),plan=core.validatePlan({B0:'fire_R0',B1:'move_right'},request);
  Object.assign(g.tanks[2],{x:11,y:5});core.applyPlan(g,0,plan);core.step(g);assert.equal(g.stats[0].shots,0);assert.equal(g.stats[0].invalid_shots,1);assert.equal(g.tanks[0].last_execution.outcome,'range');
});
test('offered shots agree with physics geometry across maps and positions',()=>{
  for(let seed=0;seed<12;seed++){
    const g=core.create('gate-map-'+seed,'step','engage-first'),t=g.tanks[0],e=g.tanks[2];
    for(let y=1;y<8;y++)for(let x=1;x<12;x++){
      if(g.map[y][x]!=='#'&&!g.tanks.some(o=>o.id!==e.id&&o.x===x&&o.y===y)){
        Object.assign(e,{x,y});const offered=!!core.candidates(g,t).fire_R0,geo=report.geometry(report.snapshot(g),t.id,'fire_R0');assert.equal(offered,geo.status==='clear');
        const copy=core.copy(g);core.applyPlan(copy,0,{B0:'fire_R0'});core.step(copy);assert.equal(copy.stats[0].shots,offered?1:0);assert.equal(copy.stats[0].invalid_shots,offered?0:1);
      }
    }
  }
});
test('API/diagnostics explicitly preserve the constrained candidate contract rather than relabeling native ability',async t=>{
  const cfg={seed:'tank-2026',control:'step',mode:'sync',duration_s:30,max_decisions:1,input_profile:'engage-first',consent:true,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}]};assert.deepEqual(validateConfig(cfg),cfg);assert.throws(()=>validateConfig({...cfg,control:'primitive'}));
  const m=createArenaManager({auto:false,evaluate:async(team,req)=>({ok:true,decision:Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up']))})});t.after(()=>m.close());m.start(cfg);m.pulse();await new Promise(resolve=>setImmediate(resolve));
  const d=report.create(m.latest());assert.equal(d.candidate_policy,'fire_geometry_gate');assert.equal(d.decision_protocol,'tank-engage-first-v1');assert.equal(d.environment_contract.fire_candidates_filtered_at_capture,true);assert.ok(d.decisions.every(d=>Object.values(d.request.questions).every(q=>Object.keys(q.criteria).length===4)));
});

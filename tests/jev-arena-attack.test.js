'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),combat=require('../posts/jev-system-one-research/arena-combat'),policy=require('../posts/jev-system-one-research/arena-attack-policy'),report=require('../posts/jev-system-one-research/arena-report');
const {createArenaProvider}=require('../scripts/jev-arena-provider');
const {createArenaManager,validateConfig}=require('../scripts/jev-arena');
function arena(){const g=core.create('combat-fixture','step');g.map=Array.from({length:9},(_,y)=>y===0||y===8?'#############':'#...........#');g.rewards=[];return g;}
function placed(g,positions){g.tanks.forEach((t,i)=>{[t.x,t.y]=positions[i];t.recent_positions=[{x:t.x,y:t.y}];});return g;}
test('attack route distance measures reachable firing positions, not Manhattan approach or novelty',()=>{
  const g=placed(arena(),[[2,4],[2,6],[10,4],[10,6]]),t=g.tanks[0];
  assert.equal(combat.analyse(g,t).current,2);
  g.map[4]='#..#........#';const info=combat.analyse(g,t);assert.equal(info.distances[4][3],null);assert.ok(info.current>2);
  const req=combat.request(g,0);assert.equal(Object.keys(req.states[0].questions.B0.criteria).length,6);assert.match(req.states[0].state,/BFS-ASSISTED/);assert.doesNotMatch(req.states[0].questions.B0.instructions,/unvisited/);
});
test('shot facts match full named-target wall check, allies passing, enemy interception and shield damage',()=>{
  const g=placed(arena(),[[2,4],[3,4],[5,4],[7,4]]),t=g.tanks[0];
  assert.equal(combat.shot(g,t,g.tanks[3],0).victim.id,'R0');
  g.tanks[2].shield=30;assert.match(combat.describe(g,t,'fire_R1'),/HP damage 0, shield damage 12/);
  g.map[4]='#.....#.....#';assert.equal(combat.shot(g,t,g.tanks[3],0).clear,false,'A wall after the interceptor still prevents this named-target trigger in the engine');
  assert.equal(combat.shot(g,t,null,0).clear,false);
});
test('explicit rule baseline prioritizes a lethal clear shot over movement and does not claim probabilities',async()=>{
  const g=placed(arena(),[[2,4],[2,6],[7,4],[7,6]]);g.tanks[2].hp=12;
  const evaluate=createArenaProvider({localFetch:()=>assert.fail('no native HTTP'),copilot:{evaluateTask:()=>assert.fail('no cloud')}});
  const r=await evaluate({provider:'attack-baseline'},core.request(g,0),new AbortController().signal,report.snapshot(g));
  assert.equal(r.decision.B0,'fire_R0');assert.equal(r.policy_audit.B0.candidates.find(c=>c.action==='fire_R0').kill_if_hit,true);assert.equal(r.usage.model_requests,0);assert.equal(r.probabilities,undefined);assert.equal(r.self_scores,undefined);
  core.applyPlan(g,0,r.decision);for(let i=0;i<6;i++)core.step(g);assert.equal(g.tanks[2].hp,0);assert.ok(g.stats[0].shots>0);assert.ok(g.stats[0].damage>=12);
});
test('rule baseline visits only break route ties and allies reserve different destinations when possible',()=>{
  const g=core.create('tank-2026','step'),t=g.tanks[1];t.x=2;t.y=4;t.recent_positions=[{x:3,y:4},{x:3,y:4},{x:3,y:4}];
  const a=policy.choose(report.snapshot(g),core.request(g,0));assert.equal(a.decision.B1,'move_right');
  const points=Object.values(a.audit).map(a=>a.candidates.find(c=>c.action===a.selected)).filter(c=>c.kind==='move'&&c.feasible).map(c=>c.x+','+c.y);assert.equal(points.length,new Set(points).size);
});
test('deterministic rule-v-rule simulations inflict real damage and eliminate on recorded control seeds; not model skill',()=>{
  for(const seed of ['tank-2026','attack-a','attack-b','attack-c']){
    const g=core.create(seed,'step');let outcome;
    for(let i=0;i<300;i++){
      const snapshot=report.snapshot(g),plans=[0,1].filter(side=>core.sideReady(g,side)).map(side=>[side,policy.choose(snapshot,core.request(g,side)).decision]);
      plans.forEach(([side,orders])=>core.applyPlan(g,side,orders));core.step(g);if(outcome=core.result(g,false))break;
    }
    assert.equal(outcome?.reason,'elimination',seed);assert.ok(g.stats.some(s=>s.damage===200));assert.ok(g.stats.every(s=>s.shots>0));
  }
});
test('diagnostics identify unused clear shots and regressing attack routes instead of reporting empty findings',()=>{
  const g=placed(arena(),[[2,4],[2,6],[7,4],[7,6]]),snapshot=report.snapshot(g),request=core.request(g,0);
  const record={schema:'study-room.tank-match.v1',id:'11111111-1111-4111-8111-111111111111',config:{seed:'fixture',mode:'realtime',control:'step',duration_s:null,max_decisions:null,teams:[{provider:'nanojev-fp32'},{provider:'nanojev-4bit'}]},game:g,status:'stopped',reason:'user_stopped',pending:0,metrics:[{finished:1,fire_attempts:0},{finished:0}],decisions:[{side:0,round:1,state_tick:0,completed_tick:0,applied_tick:0,applied:true,decision:{B0:'move_left',B1:'move_down'},request,observation_snapshot:snapshot,application_snapshot:snapshot}]};
  const d=report.create(record);assert.ok(d.findings.some(f=>f.kind==='clear_shot_not_selected'&&f.tank==='B0'));assert.ok(d.findings.some(f=>f.kind==='no_attack_attempts'));assert.ok(d.findings.some(f=>f.kind==='attack_route_distance_increased'));
});
test('baseline is explicit in config and diagnostic source; audit is allowlisted, not exported as model scores',async t=>{
  const cfg={seed:'tank-2026',control:'step',mode:'sync',duration_s:30,max_decisions:1,consent:true,teams:[{provider:'attack-baseline'},{provider:'attack-baseline'}]};assert.deepEqual(validateConfig(cfg),cfg);assert.throws(()=>validateConfig({...cfg,control:'strategic'}));
  const m=createArenaManager({auto:false,evaluate:createArenaProvider({})});t.after(()=>m.close());m.start(cfg);m.pulse();await new Promise(resolve=>setImmediate(resolve));
  const r=m.latest();assert.equal(r.decisions.length,2);assert.ok(r.decisions.every(d=>d.decision_source==='rule_attack_baseline'));r.decisions[0].policy_audit.secret='PRIVATE';
  const d=report.create(r);assert.equal(d.decisions[0].decision_source,'rule_attack_baseline');assert.ok(d.decisions[0].policy_audit.B0);assert.equal(d.decisions[0].probabilities,null);assert.ok(!JSON.stringify(d).includes('PRIVATE'));
});

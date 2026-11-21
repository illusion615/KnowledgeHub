'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core'),facts=require('../posts/jev-system-one-research/arena-facts'),task=require('../posts/jev-system-one-research/arena-task'),report=require('../posts/jev-system-one-research/arena-report');
const {validateConfig,createArenaManager}=require('../scripts/jev-arena');
const config={seed:'tank-2026',control:'step',mode:'sync',duration_s:30,max_decisions:1,consent:true,input_profile:'action-facts',decision_timeout_s:120,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'gpt-5-mini'}]};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('assisted profile is versioned, public, deterministic and never deletes candidates or corrects returned actions',()=>{
  const raw=core.create('tank-2026','step'),assisted=core.create('tank-2026','step','action-facts');
  assert.equal(task.versionFor(raw),'tank-step-task-v1');assert.equal(task.versionFor(assisted),'tank-action-facts-v2');
  for(const side of [0,1]){
    const a=core.request(raw,side),b=core.request(assisted,side);
    assert.match(b.states[0].state,/ASSISTED INPUT/);assert.match(b.states[0].state,/Pickups:/);assert.match(b.states[0].state,/Bullets:/);
    for(const id of Object.keys(a.states[0].questions))assert.deepEqual(Object.keys(a.states[0].questions[id].criteria),Object.keys(b.states[0].questions[id].criteria));
  }
  const req=core.request(assisted,0),plan=core.validatePlan({B0:'fire_R0',B1:'move_left'},req);core.applyPlan(assisted,0,plan);
  for(let i=0;i<4;i++)core.step(assisted);
  assert.equal(assisted.tanks[0].last_execution.outcome,'range');assert.equal(assisted.tanks[1].last_execution.outcome,'blocked_wall');assert.equal(assisted.stats[0].shots,0);
});
test('candidate facts distinguish range, alignment, wall, occupied cell and undoing a successful move',()=>{
  const g=core.create('tank-2026','step'),t=g.tanks[0];
  assert.match(facts.describe(g,t,'fire_R0'),/exceeds range 6; not in same row or column/);
  assert.match(facts.describe(g,t,'move_left'),/wall.*no displacement/);
  g.tanks[1].x=2;g.tanks[1].y=3;assert.match(facts.describe(g,t,'move_right'),/live tank/);
  g.tanks[1].hp=0;assert.match(facts.describe(g,t,'move_right'),/open cell/);
  t.x=2;t.y=5;t.last_execution={action:'move_right',outcome:'moved',tick:1};assert.match(facts.describe(g,t,'move_left'),/Reverses/);
  t.last_execution.outcome='blocked_wall';assert.doesNotMatch(facts.describe(g,t,'move_left'),/Reverses/);
  t.x=4;t.y=4;g.tanks[2].x=8;g.tanks[2].y=4;assert.match(facts.describe(g,t,'fire_R0'),/clear shot/);
  g.map[4]='#....#......#';assert.match(facts.describe(g,t,'fire_R0'),/wall blocks shot/);
});
test('position history counts real successful moves only, remains bounded and facts disclose revisits',()=>{
  const g=core.create('tank-2026','step','action-facts'),t=g.tanks[1];
  assert.deepEqual(t.recent_positions,[{x:1,y:5}]);core.applyPlan(g,0,{B1:'move_left'});for(let i=0;i<4;i++)core.step(g);assert.equal(t.recent_positions.length,1);
  for(let i=0;i<12;i++){core.applyPlan(g,0,{B1:i%2?'move_left':'move_right'});for(let tick=0;tick<4;tick++)core.step(g);}
  assert.equal(t.recent_positions.length,8);assert.match(facts.describe(g,t,'move_right'),/Destination visited 4 times/);
  assert.equal(report.snapshot(g).tanks.find(t=>t.id==='B1').recent_positions.length,8);
});
test('profile and deadline config reject unsupported values and preserve legacy defaults',()=>{
  assert.deepEqual(validateConfig(config),config);
  for(const patch of [{decision_timeout_s:0},{decision_timeout_s:31},{decision_timeout_s:181},{decision_timeout_s:'120'},{input_profile:'solver'},{control:'primitive'}])assert.throws(()=>validateConfig({...config,...patch}));
  const legacy={...config};delete legacy.input_profile;delete legacy.decision_timeout_s;assert.deepEqual(validateConfig(legacy),legacy);
});
test('deadline captures its source and preserves returned cancellation usage/telemetry; report retains assisted contract',async t=>{
  const m=createArenaManager({auto:false,decisionTimeoutMs:15,evaluate:async(team,req,signal)=>new Promise(resolve=>signal.addEventListener('abort',()=>resolve({ok:false,error:'cancelled',usage:{input_tokens:42},telemetry:{cli_wall_ms:15,cli:{spawn_ms:1,stdout_bytes:4,events:{'session.start':1}}}}),{once:true}))});t.after(()=>m.close());
  const initial=m.start(config);m.pulse();await new Promise(resolve=>setTimeout(resolve,40));await flush();
  const record=m.latest(),row=record.decisions.find(r=>r.error==='arena_timeout');assert.ok(row);assert.equal(row.deadline_ms,15);assert.equal(row.timeout_source,'arena_deadline');assert.equal(row.usage.input_tokens,42);assert.equal(row.telemetry.cli.events['session.start'],1);
  const d=report.create(record);assert.equal(d.decision_protocol,facts.version);assert.equal(d.config.input_profile,'action-facts');assert.equal(d.config.decision_timeout_s,120);assert.equal(d.decisions.find(r=>r.error==='arena_timeout').timeout_source,'arena_deadline');
  assert.equal(record.id,initial.id);
});

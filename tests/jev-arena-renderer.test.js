'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const renderer=require('../posts/jev-system-one-research/arena-renderer');
function fixture(adjacent=true){
  const g=core.create('visual-fixture','primitive');
  g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));
  Object.assign(g.tanks[0],{x:2,y:4});Object.assign(g.tanks[2],{x:adjacent?3:10,y:adjacent?4:6,hp:12});g.tanks[1].hp=0;g.tanks[3].hp=0;g.rewards=[];
  core.applyPlan(g,0,{B0:'fire_R0'});return g;
}
test('same-tick shot and hit survive in the authoritative journal even with no surviving bullet',()=>{
  const g=fixture();core.step(g);
  assert.equal(g.bullets.length,0);assert.equal(g.stats[0].shots,1);assert.equal(g.stats[0].hits,1);assert.equal(g.stats[0].damage,12);
  const shot=g.events.find(e=>e.kind==='shot'),hit=g.events.find(e=>e.kind==='impact'),damage=g.events.find(e=>e.kind==='damage');
  assert.equal(shot.shot_id,hit.shot_id);assert.equal(shot.tick,hit.tick);assert.equal(shot.x,2);assert.equal(hit.x,3);assert.equal(damage.amount,12);
  assert.ok(g.events.some(e=>e.kind==='destroy'&&e.tank==='R0'));
  assert.equal(g.visual_protocol,'tank-vfx-v1');
});
test('out-of-range attempts create dry-fire diagnostics, never fake shots or impacts',()=>{
  const g=fixture(false);for(let i=0;i<20;i++)core.step(g);
  assert.equal(g.stats[0].shots,0);assert.equal(g.stats[0].hits,0);assert.equal(g.bullets.length,0);
  assert.ok(g.events.length>0);assert.ok(g.events.every(e=>e.kind==='dry_fire'&&e.reason==='range'));
});
test('damage events preserve actual HP loss and shield absorption without inflating damage',()=>{
  const g=fixture();g.tanks[2].hp=5;g.tanks[2].shield=10;core.step(g);
  let e=g.events.find(e=>e.kind==='damage');assert.equal(e.shield,10);assert.equal(e.amount,2);assert.equal(g.tanks[2].hp,3);
  for(let i=0;i<6;i++)core.step(g);
  e=g.events.filter(e=>e.kind==='damage').at(-1);assert.equal(e.amount,3);assert.equal(e.shield,0);assert.equal(g.stats[0].damage,5);
});
test('visual metadata never enters the model observation and the journal is bounded',()=>{
  const g=fixture(false);for(let i=0;i<450;i++)core.step(g);
  assert.ok(g.events.length<=96);assert.ok(g.events.every(e=>e.tick>=g.tick-16));assert.equal(new Set(g.events.map(e=>e.id)).size,g.events.length);
  const before=core.observation(g),clean=core.copy(g);delete clean.events;delete clean.event_seq;delete clean.shot_seq;delete clean.visual_protocol;
  assert.equal(core.observation(clean),before);
});
test('buffered interpolation recovers a short flight, then removes the bullet at impact without extrapolation',()=>{
  const g=fixture(),timeline=renderer.createTimeline(320);timeline.push(g,0,{key:'one',live:true});
  core.step(g);timeline.push(g,250,{key:'one',live:true});
  const midway=timeline.sample(445);assert.equal(midway.tick,.5);assert.equal(midway.projectiles.length,1);assert.equal(midway.projectiles[0].x,2.5);
  assert.equal(renderer.tankState(midway,midway.game.tanks[2]).hp,12,'Tank must not become a wreck before visual impact');
  const hit=timeline.sample(570);assert.equal(hit.projectiles.length,0);assert.equal(renderer.tankState(hit,hit.game.tanks[2]).hp,0);
  assert.equal(timeline.sample(5000).projectiles.length,0,'Finished rounds must not leave a ghost bullet');
  assert.equal(g.tanks[2].hp,0,'Renderer cannot change authoritative health');
});
test('a shot/hit between skipped poll frames retains evidence for a short-flight visual replay',()=>{
  const g=fixture(),timeline=renderer.createTimeline(320);timeline.push(g,0,{key:'one',live:true});
  for(let i=0;i<3;i++)core.step(g);timeline.push(g,600,{key:'one',live:true});
  const sample=timeline.sample(600);assert.equal(sample.tick,1.4);assert.equal(sample.projectiles.length,0);
  const shot=sample.events.find(e=>e.kind==='shot'),impact=sample.events.find(e=>e.kind==='impact');
  assert.equal(shot.shot_id,impact.shot_id);assert.ok(impact.tick<=sample.tick);
  assert.equal(renderer.tankState(timeline.sample(620),g.tanks[2]).hp,0);
});
test('repeated snapshots do not duplicate events; out-of-order live frames are ignored; new matches clear old tracks',()=>{
  const g=fixture(),timeline=renderer.createTimeline(0),before=core.copy(g);timeline.push(g,0,{key:'one',live:true});core.step(g);
  timeline.push(g,250,{key:'one',live:true});const count=timeline.counts().events;
  timeline.push(g,300,{key:'one',live:true});assert.equal(timeline.counts().events,count);
  assert.equal(timeline.push(before,350,{key:'one',live:true}),false);
  timeline.push(before,400,{key:'two',live:true});assert.equal(timeline.counts().events,0);assert.equal(timeline.counts().tracks,0);
});
test('dry-fire timelines contain no projectiles and replay can show real same-tick impact traces',()=>{
  const g=fixture(false),timeline=renderer.createTimeline(0);core.step(g);timeline.push(g,0,{key:'dry',live:true});
  assert.equal(timeline.sample(10).projectiles.length,0);
  const hit=fixture();core.step(hit);timeline.push(hit,20,{key:'hit',live:false});
  assert.equal(timeline.sample(20).projectiles.length,1);assert.ok(timeline.sample(20).events.every(e=>e.tick===hit.tick));
});
test('movement smoothing only joins adjacent known cells, never cuts diagonally through walls',()=>{
  assert.deepEqual(renderer.pose({x:1,y:1},{x:2,y:1},.5),{x:1.5,y:1});
  assert.deepEqual(renderer.pose({x:1,y:1},{x:2,y:2},.5),{x:2,y:2});
  assert.deepEqual(renderer.pose({x:1,y:1},{x:5,y:1},.5),{x:5,y:1});
});

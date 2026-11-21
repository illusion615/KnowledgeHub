'use strict';
// Deterministic canvas rendering of hand-authored physics fixtures only.
// No backend, model, cloud request, or benchmark result is involved.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
async function main(){
  const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1120,height:900},deviceScaleFactor:2}),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    await page.setContent('<!doctype html><html lang="zh-CN"><head><style>*{box-sizing:border-box}body{background:#111c2b;color:white;font:16px sans-serif;max-width:1080px;margin:auto;padding:16px}canvas{display:block;width:100%;height:auto;border:1px solid #405469;border-radius:12px}</style></head><body><p>手写物理 / 渲染测试 · 非模型推理或评测结果</p><canvas id="board" width="1040" height="720"></canvas></body></html>');
    for(const file of ['arena-geometry.js','arena-task.js','arena-core.js','arena-renderer.js'])await page.addScriptTag({path:path.resolve('posts/jev-system-one-research',file)});
    await page.evaluate(()=>{
      window.clock=0;window.nextPaint=null;
      window.visual=JevArenaRenderer.create(document.getElementById('board'),{now:()=>clock,raf:cb=>{nextPaint=cb;return 1;},caf:()=>{nextPaint=null;}});
      window.paintAt=time=>{clock=time;if(nextPaint){const cb=nextPaint;nextPaint=null;cb(time);}};
      window.fixture=adjacent=>{
        const g=JevArena.create('visual-only','primitive');g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));
        Object.assign(g.tanks[0],{x:2,y:4});Object.assign(g.tanks[2],{x:adjacent?3:10,y:adjacent?4:6,hp:12});g.tanks[1].hp=0;g.tanks[3].hp=0;g.rewards=[];JevArena.applyPlan(g,0,{B0:'fire_R0'});return g;
      };
      window.game=fixture(true);visual.setFrame(game,{key:'actual-shot-fixture',live:true});paintAt(0);
      JevArena.step(game);clock=250;visual.setFrame(game,{key:'actual-shot-fixture',live:true});paintAt(445);
    });
    let d=await page.evaluate(()=>visual.diagnostics());assert.equal(d.shot_events,1);assert.ok(d.projectile_draws>0);
    assert.ok(await page.locator('canvas').evaluate(c=>c.width>c.getBoundingClientRect().width),'High-DPI backing store');
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'bullet-in-flight-fixture.png')});
    await page.evaluate(()=>{paintAt(600);paintAt(800);});
    d=await page.evaluate(()=>visual.diagnostics());assert.ok(d.impact_draws>0);
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'bullet-impact-fixture.png')});
    const shots=d.shot_events,projectileDraws=d.projectile_draws;
    await page.evaluate(()=>{paintAt(2000);clock=2100;visual.setFrame(game,{key:'actual-shot-fixture',live:true});paintAt(2420);});
    d=await page.evaluate(()=>visual.diagnostics());assert.equal(d.shot_events,shots,'Repeated snapshots do not replay muzzle flashes');assert.equal(d.projectile_draws,projectileDraws,'No ghost bullet at a stopped impact frame');
    await page.evaluate(()=>{game=fixture(false);clock=3000;visual.setFrame(game,{key:'dry-fire-fixture',live:true});paintAt(3000);JevArena.step(game);clock=3250;visual.setFrame(game,{key:'dry-fire-fixture',live:true});paintAt(3700);});
    d=await page.evaluate(()=>visual.diagnostics());assert.equal(d.dry_fire_events,1);assert.equal(d.shot_events,shots);assert.equal(d.projectile_draws,projectileDraws,'Invalid fire must not draw a projectile');
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'dry-fire-intent-fixture.png')});
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{clock=3800;visual.setFrame(game,{key:'dry-fire-fixture',live:true});paintAt(3800);});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'dry-fire-mobile-fixture.png')});
    await page.setViewportSize({width:1120,height:900});
    await page.evaluate(()=>{game=fixture(true);Object.assign(game.tanks[2],{x:6,hp:100,shield:12});clock=4000;visual.setFrame(game,{key:'long-flight-fixture',live:true});paintAt(4000);for(let i=0;i<4;i++)JevArena.step(game);clock=4800;visual.setFrame(game,{key:'long-flight-fixture',live:true});paintAt(4800);});
    assert.ok((await page.evaluate(()=>visual.diagnostics())).projectile_draws>projectileDraws);
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'long-projectile-trail-fixture.png')});
    await page.evaluate(()=>{paintAt(5200);paintAt(5300);});
    assert.equal(await page.evaluate(()=>game.tanks[2].hp),100);
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'shield-impact-fixture.png')});
    await page.evaluate(()=>{game=fixture(true);clock=6000;visual.setFrame(game,{key:'skipped-poll-fixture',live:true});paintAt(6000);for(let i=0;i<3;i++)JevArena.step(game);clock=6600;visual.setFrame(game,{key:'skipped-poll-fixture',live:true});paintAt(6600);paintAt(6695);});
    assert.ok((await page.evaluate(()=>visual.diagnostics())).short_flight_replays>0,'A completed shot skipped by polling is reconstructed only from its actual events');
    const diagonalBefore=await page.evaluate(()=>visual.diagnostics().shot_events);
    await page.evaluate(()=>{game=JevArena.create('diagonal-render-fixture','step','raw','tactical');game.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));game.rewards=[];Object.assign(game.tanks[0],{x:2,y:2});Object.assign(game.tanks[2],{x:5,y:6});game.tanks[1].hp=0;game.tanks[3].hp=0;clock=7000;visual.setFrame(game,{key:'diagonal-fixture',live:true});paintAt(7000);JevArena.applyPlan(game,0,{B0:'fire_R0'});for(let i=0;i<6;i++)JevArena.step(game);clock=8200;visual.setFrame(game,{key:'diagonal-fixture',live:true});paintAt(8295);});
    assert.equal(await page.evaluate(()=>visual.diagnostics().shot_events),diagonalBefore+1);assert.equal(await page.evaluate(()=>game.tanks[2].hp),88);assert.ok(await page.evaluate(()=>game.events.some(e=>e.kind==='shot'&&Math.abs(e.dx-.6)<1e-8&&Math.abs(e.dy-.8)<1e-8)));
    if(process.env.JEV_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.JEV_SCREENSHOT_DIR,'diagonal-projectile-fixture.png')});
    await page.evaluate(()=>visual.destroy());assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    console.log('PASS canvas fixtures: visible same-tick projectile, high-DPI trails, impact/destruction, deduplication, no fake dry-fire bullets, mobile bounds, real diagonal flight/impact, zero network calls');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

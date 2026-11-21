'use strict';
const {openSettings,openDiagnostics,closePanel,enableLegacyControls}=require('./jev-arena-ui');
// Injected match/score records only. Tests presentation, never calls a model.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
const core=require('../posts/jev-system-one-research/arena-core');
async function main(){
  const modelId='fixture-long-model',modelName='Very-Long-Selected-Model-Name-For-Responsive-HUD-Checks <img src=x onerror=alert(1)>';
  const ready={ready:true,configured:true,local:true,sdk_ready:true};let calls=0;
  const server=createServer({runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':ready,'nanojev-4bit':ready})},copilot:{status:async()=>({available:true,authentication:'fixture'}),listModels:async()=>({source:'copilot-cli-models.list',checked_at:new Date().toISOString(),models:[{id:modelId,name:modelName}]})},arenaEvaluate:async()=>{calls++;throw new Error('unexpected_inference');}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    let record;
    await page.route('**/api/jev/arena/*',async route=>{
      const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);
      if(endpoint==='start'){
        const config=route.request().postDataJSON(),initial=core.create(config.seed,config.control,config.input_profile,config.ruleset),g=core.copy(initial);g.tick=12;g.tanks[0].hp=50;g.tanks[1].hp=0;g.tanks[2].hp=0;g.tanks[3].hp=25;
        Object.assign(g.stats[0],{damage:175,shots:20,hits:16,rewards:2});Object.assign(g.stats[1],{damage:150,shots:18,hits:13,rewards:1});if(g.version==='tank-v7-friendly-fire')Object.assign(g.stats[0],{friendly_damage:12,friendly_shield_damage:4,friendly_hits:1});
        const decisions=[0,1].map(side=>{const req=core.request(initial,side),decision=Object.fromEntries(Object.keys(req.states[0].questions).map(id=>[id,'move_up'])),values=Object.fromEntries(Object.keys(decision).map(id=>[id,{move_up:side===0?.625:87}]));return {index:side,side,round:1,applied:true,applied_tick:1,state_tick:0,completed_tick:1,elapsed_ms:side===0?123:456,provider_ms:100,state_age_ms:0,request:req,decision,score_kind:side===0?'native_choice_probability':'self_reported_preference',probabilities:side===0?values:null,self_scores:side===1?values:null};});
        record={schema:'study-room.tank-match.v1',id:'hud-fixture',config,game:g,frames:[initial,g],status:'stopped',reason:'user_stopped',pending:0,result:null,wall_ms:2400,archive_status:'disabled',decisions,metrics:[0,1].map(side=>({...g.stats[side],comparison:{version:'arena-comparison-v1',mean_decision_ms:side===0?123:456,decision_samples:side===0?3:4,plans_total:3,plans_executed:2,decisions_total:side===0?3:4,correct_decisions:null},requests:side===0?3:4,finished:side===0?3:4,errors:0,mean_ms:side===0?123:456,p95_ms:500,p50_ms:100,phase:'finished',usage:null,first_applied_ms:123})),inflight:[]};
      }
      await route.fulfill({json:record});
    });
    const el=id=>page.locator('#jev-arena-'+id);
    async function assertMapNames(){for(const side of ['blue','red']){assert.equal(await el(side+'-map-model').textContent(),await el(side+'-hud-model').textContent());assert.equal(await el(side+'-map-model').locator('img').count(),0);}}
    async function assertUniqueDiagnostics(){
      for(const side of ['blue','red']){
        const labels=await el(side+'-kpis').locator('.metric-label').allTextContents();
        assert.equal(labels.length,6);assert.doesNotMatch(labels.join('\n'),/Premium requests|外部 API 费用|External API Cost/i);
        assert.doesNotMatch(labels.join('\n'),/存活|有效伤害|位移 \/ 奖励|平均决策|调用 \/ 错误|规则评估|命中 \/ 发射|友伤|Alive \/ HP|^Damage$|HP Damage|Pickups|Mean Decision|Calls \/ Errors|Rule Evaluations|Hits \/ Shots|Friendly/m);
        assert.match(labels.join('\n'),/p50 \/ p95/);assert.match(labels.join('\n'),/Token/);assert.match(labels.join('\n'),/无效开火|Ineffective Triggers/);
      }
    }
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-arena');
    await page.waitForFunction(id=>Array.from(document.getElementById('jev-arena-red').options).some(o=>o.value==='copilot:'+id),modelId);await enableLegacyControls(page);
    assert.equal(await el('blue-hud-model').textContent(),'NanoJev FP32');assert.equal(await el('red-hud-model').textContent(),'NanoJev 4-bit');await assertMapNames();
    await el('blue-model-switch').click();assert.equal(await el('settings-panel').isVisible(),true);assert.equal(await el('blue').evaluate(e=>document.activeElement===e),true);await closePanel(page);await el('red-model-switch').click();assert.equal(await el('red').evaluate(e=>document.activeElement===e),true);await closePanel(page);assert.equal(calls,0);
    assert.equal(await el('blue-hud-score').textContent(),'击毁 0 / 2');assert.match(await el('blue-hud-kpis').textContent(),/2\/2 · 200/);assert.ok((await el('blue-hud-kpis').textContent()).includes('—'));assert.equal(calls,0);
    await assertUniqueDiagnostics();
    await openSettings(page);await el('red').selectOption('attack-baseline');assert.match(await el('red-hud-model').textContent(),/规则进攻基线/);assert.match(await el('red-hud-decision').textContent(),/无模型评分/);
    await el('swap').click();assert.match(await el('blue-hud-model').textContent(),/规则进攻基线/);assert.equal(await el('red-hud-model').textContent(),'NanoJev FP32');await assertMapNames();await el('swap').click();
    await el('red').selectOption('copilot:'+modelId);assert.equal(await el('red-hud-model').textContent(),'Copilot · '+modelName);assert.equal(await el('red-hud-model').locator('img').count(),0);await assertMapNames();
    await el('consent').check();await el('start').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-replay').disabled);
    assert.equal(await el('blue-hud-score').textContent(),'击毁 1 / 2');assert.equal(await el('red-hud-score').textContent(),'击毁 1 / 2');
    assert.match(await el('blue-hud-kpis').textContent(),/1\/2 · 50/);assert.match(await el('blue-hud-kpis').textContent(),/有效伤害175/);assert.match(await el('blue-hud-kpis').textContent(),/16 \/ 20/);assert.match(await el('red-hud-kpis').textContent(),/1\/2 · 25/);
    assert.match(await el('blue-hud-decision').textContent(),/62.50%/);assert.match(await el('red-hud-decision').textContent(),/自报偏好/);assert.ok(!(await el('red-hud-decision').textContent()).includes('%'));
    assert.equal(await el('blue-compare-time').textContent(),'123 ms');assert.equal(await el('blue-compare-attack').textContent(),'16 / 20 · 80%');assert.equal(await el('blue-compare-plan').textContent(),'2 / 3 · 67%');assert.equal(await el('blue-compare-correct').textContent(),'— / 3 · 未评定');
    await assertUniqueDiagnostics();
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});
      // Sample together: responsive scroll anchoring can move the whole page
      // between separate protocol calls without changing the actual alignment.
      const board=await el('board').evaluate(e=>e.getBoundingClientRect().toJSON());
      for(const id of ['blue-hud','red-hud','status','clock','connection','hud-scope','intent-status','show-routes','comparison-definitions']){assert.ok(await el(id).evaluate(e=>!!e.closest('#jev-arena-diagnostics-panel')));assert.equal(await el(id).isVisible(),false);}
      assert.equal(await el('compare-scope').count(),0);assert.equal(await page.locator('.arena-comparison-card').count(),4);
      const cards=await page.locator('.arena-comparison-card').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
      if(width>540)assert.ok(cards.every(c=>Math.abs(c.top-cards[0].top)<1));else{assert.ok(Math.abs(cards[0].top-cards[1].top)<1);assert.ok(cards[2].top>=cards[0].bottom);}
      const [left,right,stage,comparison]=await page.evaluate(()=>[document.getElementById('jev-arena-blue-model-switch'),document.getElementById('jev-arena-red-model-switch'),document.querySelector('.arena-map-stage'),document.querySelector('.arena-comparison')].map(e=>e.getBoundingClientRect().toJSON()));
      assert.ok(left.left>=board.left&&left.left<=board.left+12);assert.ok(right.right<=board.right&&right.right>=board.right-12);assert.ok(left.right<=right.left);assert.ok(Math.abs(left.top-right.top)<1);assert.ok(left.top>=stage.top&&left.top<stage.top+12);assert.ok(Math.max(left.bottom,right.bottom)<=board.top);assert.ok(comparison.bottom<=board.top);if(width>1000)assert.ok(left.right<=comparison.left&&comparison.right<=right.left);else assert.ok(comparison.top>=Math.max(left.bottom,right.bottom));
      await assertMapNames();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(process.env.JEV_SCREENSHOT_DIR){await page.locator('.arena-map-names').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-90));await page.locator('.arena-map-names').screenshot({path:require('node:path').join(process.env.JEV_SCREENSHOT_DIR,'arena-comparison-header-'+width+'.png')});}
    }
    await el('replay').evaluate(e=>{e.value='0';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await el('blue-hud-score').textContent(),'击毁 0 / 2');assert.match(await el('blue-hud-kpis').textContent(),/2\/2 · 200/);assert.match(await el('blue-hud-decision').textContent(),/暂无已下达/);assert.match(await el('hud-scope').textContent(),/整局统计/);await assertMapNames();assert.equal(await el('blue-compare-attack').textContent(),'16 / 20 · 80%');assert.equal(await el('compare-scope').count(),0);
    await page.evaluate(()=>{document.documentElement.lang='en';});await page.waitForFunction(()=>document.getElementById('jev-arena-blue-hud-score').textContent==='Kills 0 / 2');assert.match(await el('hud-scope').textContent(),/Whole-Match Totals/);
    await openSettings(page);await el('swap').click();assert.equal(await el('blue-hud-model').textContent(),'Copilot · '+modelName);assert.equal(await el('red-hud-model').textContent(),'NanoJev FP32');assert.match(await el('blue-hud-decision').textContent(),/No Installed Order/);await assertMapNames();
    await el('blue').selectOption('nanojev-fp32');await el('red').selectOption('attack-baseline');await el('ruleset').selectOption('friendly-fire');await el('start').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-replay').disabled);
    assert.match(await el('blue-hud-kpis').textContent(),/Friendly HP \/ Shield12 \/ 4/);assert.match(await el('blue-hud-kpis').textContent(),/Friendly Hits1/);assert.equal(await el('blue-hud-score').textContent(),'Enemy Losses 1 / 2');assert.match(await el('hud-scope').textContent(),/Own Friendly Fire/);
    await assertUniqueDiagnostics();
    await closePanel(page);await openDiagnostics(page);for(const id of ['blue-hud','red-hud','status','hud-scope','show-routes','comparison-definitions'])assert.equal(await el(id).isVisible(),true,id+' visible in diagnostics');await el('show-routes').uncheck();await el('show-routes').check();await closePanel(page);
    assert.equal(calls,0);assert.deepEqual(errors,[]);
    console.log('PASS arena HUD: on-map corner names/long-name wrapping/swap/replay, selected names/swap, combat KPIs without duplicate upper cards, score semantics, replay, i18n, no HTML injection, desktop/390/320px layout; no inference');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

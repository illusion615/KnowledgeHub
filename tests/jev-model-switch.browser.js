'use strict';
// UI/API switching with injected values only, never real model calls.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
const registry=require('../posts/jev-system-one-research/model-registry');
const core=require('../posts/jev-system-one-research/playground-core');
async function main(){
  const calls=[],arenaCalls=[];let layaReady=true,browser;
  const server=createServer({runner:{status:async()=>({vercel:{configured:false,ready:false},typesafe:{configured:false,ready:false},...Object.fromEntries(registry.models.map(m=>[m.id,{model:m.model,local:true,configured:true,sdk_ready:true,ready:m.family==='laya'?layaReady:true}]))}),evaluate:async(provider,state)=>{calls.push(provider);const response=core.fixtures()[0].response;return {response:{...response,model:registry.get(provider).model},request:require('../scripts/jev-local-provider').nativeRequest(state),transport:'TEST-FIXTURE-NOT-INFERENCE',billing_usd:0};}},copilot:{status:async()=>({available:true}),listModels:async()=>({source:'copilot-cli-models.list',checked_at:new Date().toISOString(),models:[{id:'fixture-llm',name:'Fixture'}]})},arenaEvaluate:async(team,request)=>{arenaCalls.push(team.provider);return {ok:true,decision:Object.fromEntries(Object.entries(request.states[0].questions).map(([id,q])=>[id,Object.keys(q.criteria)[0]])),usage:{input_tokens:1,output_tokens:0},requested_model:registry.get(team.provider)?.model};}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-model-lab');await page.waitForFunction(()=>document.querySelector('#jev-provider option[value="laya-multilingual"]')&&!document.querySelector('#jev-provider option[value="laya-multilingual"]').disabled);
    for(const selector of ['#jev-provider','#jev-bench-local','#jev-arena-blue','#jev-arena-red'])for(const model of registry.models)assert.equal(await page.locator(selector+' option[value="'+model.id+'"]').count(),1);
    assert.equal(calls.length,0);assert.equal(arenaCalls.length,0);
    for(const id of ['laya-multilingual','laya-typed-decisions','nanojev-fp32']){
      await page.locator('#jev-provider').selectOption(id);await page.locator('#jev-state').fill('synthetic input');await page.locator('#jev-run').click();await page.waitForFunction(()=>document.getElementById('jev-result-panel').dataset.runState==='completed');
      assert.equal(JSON.parse(await page.locator('#jev-result-json').textContent()).model,registry.get(id).model);
    }
    assert.deepEqual(calls,['laya-multilingual','laya-typed-decisions','nanojev-fp32']);
    await page.locator('#jev-bench-settings-open').click();await page.locator('#jev-bench-local').selectOption('laya-multilingual');await page.locator('#jev-bench-settings-close').click();assert.match(await page.locator('#jev-bench-hybrid-title').textContent(),/Laya/);
    // Setting a model only changes configuration; it does not run either desk.
    assert.equal(calls.length,3);assert.equal(arenaCalls.length,0);
    await page.locator('#jev-arena-settings-open').click();await page.locator('#jev-arena-blue').selectOption('laya-multilingual');await page.locator('#jev-arena-red').selectOption('nanojev-fp32');assert.equal(await page.locator('#jev-arena-control').inputValue(),'step');assert.deepEqual(await page.locator('#jev-arena-input-profile option').evaluateAll(xs=>xs.map(o=>o.value)),['utility-planner','raw']);assert.equal(await page.locator('#jev-arena-input-profile').inputValue(),'utility-planner');assert.equal(await page.locator('#jev-arena-start').isDisabled(),false);
    await page.locator('#jev-arena-input-profile').selectOption('raw');await page.locator('#jev-arena-start').click();await page.waitForTimeout(500);await page.locator('#jev-arena-stop').click();assert.ok(arenaCalls.includes('laya-multilingual'));assert.ok(arenaCalls.includes('nanojev-fp32'));
    await page.waitForFunction(()=>!document.getElementById('jev-arena-download').disabled);
    await page.locator('#jev-provider').selectOption('laya-multilingual');layaReady=false;await page.locator('#jev-refresh').click();await page.waitForFunction(()=>document.querySelector('#jev-provider option[value="laya-multilingual"]').disabled);assert.equal(await page.locator('#jev-provider').inputValue(),'laya-multilingual');assert.equal(await page.locator('#jev-run').isDisabled(),true);assert.equal(calls.length,3,'loss of readiness does not switch or invoke another model');
    assert.deepEqual(errors,[]);console.log('PASS shared model selection in basic/support/arena; basic round trips, planner enabled without legacy menu options, raw arena switching; injected responses only');
  }finally{if(browser){await Promise.all(browser.contexts().map(c=>c.close()));await browser.close();}const closed=new Promise(r=>server.close(r));server.closeAllConnections();await closed;}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

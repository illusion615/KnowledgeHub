'use strict';
// Full HTTP/UI/worker/provider-parser path, injected CLI process only; no cloud spend.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
const {openSettings,openDiagnostics,enableLegacyControls}=require('./jev-arena-ui');
async function main(){
  const calls=[];
  const copilot={status:async()=>({available:true,authentication:'fixture'}),listModels:async()=>({source:'copilot-cli-models.list',checked_at:new Date().toISOString(),models:[{id:'fixture-online',name:'Fixture Online Model'}]}),evaluateTask:async(model,prompt,parse,signal)=>{
    assert.equal(model,'fixture-online');assert.ok(!signal.aborted);assert.match(prompt,/NOT probabilities/);
    const request=JSON.parse(prompt.split('CONTRACT:\n')[1]),scores=Object.fromEntries(request.states.flatMap(s=>Object.keys(s.questions).map(id=>[id,75])));calls.push({model,prompt,request});
    const stdout=JSON.stringify({type:'assistant.message',data:{content:JSON.stringify({scores})}})+'\n'+JSON.stringify({type:'result',exitCode:0});
    return {ok:true,decision:parse(stdout),requested_model:model,usage:{model_requests:1,input_tokens:123,output_tokens:24,premium_requests:7,billing_usd:.25}};
  }};
  // Native services are deliberately unavailable. A cloud run must not fall back to them.
  const server=createServer({runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':{ready:false},'nanojev-4bit':{ready:false}})},copilot});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],starts=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/api/jev/arena/start'))starts.push(r.postDataJSON());});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const el=id=>page.locator('#jev-arena-'+id);
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-arena');await page.waitForFunction(()=>Array.from(document.getElementById('jev-arena-blue').options).some(o=>o.value==='copilot:fixture-online'));await enableLegacyControls(page);
    for(const profile of ['utility-planner','utility-attack']){
      await openSettings(page);await el('blue').selectOption('copilot:fixture-online');await el('red').selectOption('attack-baseline');await el('input-profile').selectOption(profile);await el('mode').selectOption('sync');
      assert.equal(await el('start').isDisabled(),true);assert.match(await el('start-hint').textContent(),/授权/);const before=calls.length;
      await el('consent').check();assert.equal(await el('start').isEnabled(),true);assert.equal(await el('start-hint').isVisible(),false);assert.equal(calls.length,before);
      await el('start').click();const kind=profile==='utility-planner'?'self_reported_plan_preference':'self_reported_preference';
      await page.waitForFunction(kind=>document.getElementById('jev-arena-blue-scores').dataset.scoreKind===kind&&document.getElementById('jev-arena-blue-scores').textContent.includes('75'),kind);
      assert.ok(calls.length>before);assert.equal(await el('input-profile').inputValue(),profile);assert.equal(await el('blue-hud-model').textContent(),'Copilot · Fixture Online Model');assert.ok(!(await el('blue-hud-decision').textContent()).includes('%'));
      if(profile==='utility-planner'){assert.match(await el('blue-hud-decision').textContent(),/在线自报偏好 75 \/ 100/);assert.match(await el('blue-score-note').textContent(),/非原生概率/);assert.match(await el('task-input').textContent(),/JOINT PLAN SCORING CONTRACT/);}
      else assert.match(await el('task-input').textContent(),/EFFECT SCORING CONTRACT/);
      await el('stop').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-download').disabled);
      await openDiagnostics(page);for(const side of ['blue','red']){assert.equal(await el(side+'-kpis').locator('.metric').count(),6);assert.doesNotMatch(await el(side+'-kpis').textContent(),/Premium requests|外部 API 费用|External API Cost/i);}
      await page.evaluate(()=>{window.onlineCopy=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.onlineCopy=text;}}});});
      if(!await el('report-details').evaluate(e=>e.open))await page.locator('#jev-arena-report-details summary').click();
      await el('copy-json').click();await page.waitForFunction(()=>!!window.onlineCopy);const d=JSON.parse(await page.evaluate(()=>window.onlineCopy)),r=d.decisions.find(r=>r.side===0&&r.applied&&!r.error);
      assert.ok(r);assert.equal(d.config.input_profile,profile);assert.equal(d.config.teams[0].provider,'copilot');assert.equal(d.config.teams[0].model,'fixture-online');assert.equal(r.score_kind,kind);assert.equal(r.probabilities,null);assert.equal(r.utility_scores,null);
      const trace=r.planner_trace||r.utility_trace;assert.equal(trace.binary_gates,null);assert.ok(trace.self_scores);assert.ok(Object.values(trace.self_scores).every(s=>s===75));assert.match(r.copilot_task_text,/SCORING CONTRACT/);
      if(profile==='utility-planner'){assert.ok(trace.lane_safety.enabled);assert.ok(trace.plan_scores.every(s=>s.model_score===null&&s.self_preference===75));}
      // UI removal must not fabricate zero usage or strip the underlying receipt.
      assert.equal(r.usage.premium_requests,7);assert.equal(r.usage.billing_usd,.25);
    }
    assert.deepEqual(starts.map(s=>s.input_profile),['utility-planner','utility-attack']);assert.ok(starts.every(s=>s.consent===true));assert.deepEqual(errors,[]);
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    console.log('PASS online arena: consent enables planner/attack, actual HTTP+worker+CLI parser, no native fallback, original profile/model preserved, explicit self-scores, removed cost/premium cards, faithful receipts, mobile; injected CLI only');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

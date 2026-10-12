'use strict';
const {openSettings,openDiagnostics,enableLegacyControls}=require('./jev-arena-ui');
// Actual HTTP/UI, fake providers only. No cloud or GPU inference.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
async function main(){
  const calls=[],releases=[],archives=[];let slowSide=1;
  const ready={ready:true,configured:true,local:true,sdk_ready:true};
  const server=createServer({maxCalls:100,arenaOptions:{onSettled:record=>archives.push(record)},runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':ready,'nanojev-4bit':ready})},copilot:{status:async()=>({available:true}),listModels:async()=>({source:'copilot-cli-models.list',checked_at:new Date().toISOString(),models:[{id:'fixture-model',name:'Independent Cloud Fixture'}]})},arenaEvaluate:async(team,request,signal)=>{
    const side=Object.keys(request.states[0].questions)[0].startsWith('B')?0:1;calls.push({side,request});
    if(side===slowSide)await new Promise((resolve,reject)=>{releases.push(resolve);signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true});});
    return {ok:true,decision:Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,id.startsWith('B')?'move_right':'move_left'])),usage:{input_tokens:100,output_tokens:0,billing_usd:0},telemetry:{node_health_ms:1,node_inference_http_ms:10,node_normalize_ms:1,native:{timing_protocol:'nanojev-stages-v1',runtime_id:'a'.repeat(32),first_inference:calls.length<=2,idle_before_ms:0,prepare_ms:2,forward_ms:6,softmax_eval_ms:1,decode_ms:1,batch_shapes:[[12,450]],candidate_counts:[6,6],cache_limit_bytes:2147483648,cache_memory_bytes:1000}}};
  }});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const el=id=>page.locator('#jev-arena-'+id);
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-arena');await page.waitForFunction(()=>!document.getElementById('jev-arena-start').disabled);await enableLegacyControls(page);
    assert.equal(await el('control').inputValue(),'step');assert.equal(await el('budget').count(),0);assert.equal(calls.length,0);assert.equal(await el('deadline').inputValue(),'120');
    assert.equal(await el('input-profile').inputValue(),'engage-first');assert.match(await el('task-source').textContent(),/tank-engage-first-v1/);assert.equal(await el('task-action').locator('option[value^="fire_"]').count(),0);
    await openSettings(page);await el('input-profile').selectOption('action-facts');assert.match(await el('task-source').textContent(),/tank-action-facts-v2/);assert.match(await el('task-input').textContent(),/ASSISTED INPUT/);
    await el('input-profile').selectOption('raw');assert.match(await el('task-source').textContent(),/tank-step-task-v1/);assert.equal(calls.length,0);
    assert.equal(await el('task-action').locator('option[value^="fire_"]').count(),2);
    await el('input-profile').selectOption('engage-first');await el('duration').selectOption('unlimited');await el('red').selectOption('copilot:fixture-model');await el('consent').check();await el('start').click();
    await page.waitForFunction(()=>document.querySelectorAll('#jev-arena-blue-timing-chart .arena-timing-row').length>=11);
    assert.ok(calls.filter(c=>c.side===0).length>=11);assert.equal(calls.filter(c=>c.side===1).length,1);
    assert.match(await el('clock').textContent(),/无限制/);assert.match(await el('status').textContent(),/对战进行中/);
    assert.match(await el('red-state').textContent(),/推理中/);
    assert.ok(await el('blue-timing-chart').locator('.arena-timing-row').count()>=11);
    assert.match(await el('blue-hud-kpis').textContent(),/平均决策/);assert.match(await el('blue-kpis').textContent(),/p50 \/ p95/);assert.match(await el('blue-timing-detail').textContent(),/forward_ms/);
    assert.match(await el('blue-waits').textContent(),/限流等待/);
    assert.match(await el('blue-kpis').textContent(),/不等于失效/);
    await el('stop').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-download').disabled);
    assert.equal(archives.length,1);assert.match(await el('archive-status').textContent(),/已自动保存/);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copied=text;}}}));
    await openDiagnostics(page);await el('copy-report').click();await el('copy-json').click();await page.waitForFunction(()=>document.getElementById('jev-arena-report-status').textContent.includes('已复制'));
    let data=JSON.parse(await page.evaluate(()=>window.copied));assert.equal(data.rule_version,'tank-v5-step');assert.equal(data.scheduling,'independent_after_action');assert.equal(data.config.nominal_decision_gap_ms,null);assert.equal(data.config.decision_timeout_s,120);assert.equal(data.decisions[0].deadline_ms,120000);
    assert.equal(data.candidate_policy,'fire_geometry_gate');assert.equal(data.decision_protocol,'tank-engage-first-v1');assert.equal(data.environment_contract.fire_candidates_filtered_at_capture,true);
    assert.equal(data.decisions[0].telemetry.native.cache_limit_bytes,2147483648);
    assert.equal(data.decisions[0].telemetry.native.forward_ms,6);assert.equal(data.config.max_decisions,null);assert.equal(data.config.duration_s,null);assert.ok(data.metrics[0].requests>=11);
    await page.locator('#jev-arena-report-details summary').click();
    // Shared service queues rather than returning busy, and its input is not
    // mislabeled as frozen while it is still waiting to be dispatched.
    slowSide=0;await openSettings(page);await el('red').selectOption('nanojev-fp32');await el('start').click();
    await page.waitForFunction(()=>document.getElementById('jev-arena-red-state').textContent.includes('等待本地服务'));
    await openDiagnostics(page);await page.locator('#jev-arena-task-details summary').click();await el('task-side').selectOption('1');
    assert.match(await el('task-source').textContent(),/尚未冻结输入/);
    const before=calls.length;releases.at(-1)();await page.waitForFunction(()=>document.getElementById('jev-arena-red-orders').textContent.includes('move_left'));
    assert.ok(calls.length>before);
    await el('stop').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-download').disabled);
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(errors,[]);console.log('PASS step UI: no decision cap, unlimited duration, independent native/cloud progress beyond 10 calls, manual stop, timing chart/stages, export telemetry, FIFO queue preview, mobile');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

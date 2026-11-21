'use strict';
const {openSettings,openDiagnostics}=require('./jev-arena-ui');
// Real HTTP/UI and deterministic rule controllers; NO native/cloud inference.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
async function main(){
  const server=createServer({maxCalls:1,runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':{ready:false},'nanojev-4bit':{ready:false}})},copilot:{status:async()=>({available:false,code:'copilot_disabled'}),evaluateTask:()=>assert.fail('no cloud')}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    const el=id=>page.locator('#jev-arena-'+id);
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-arena');await el('blue').locator('option[value="attack-baseline"]').waitFor({state:'attached'});
    await openSettings(page);await el('blue').selectOption('attack-baseline');await el('red').selectOption('attack-baseline');await el('duration').selectOption('unlimited');
    assert.match(await el('control-note').textContent(),/不是模型/);assert.match(await el('task-output').textContent(),/不发送模型请求/);assert.equal(await el('consent-field').isVisible(),false);assert.equal(await el('start').isEnabled(),true);
    await el('start').click();await page.waitForFunction(()=>document.getElementById('jev-arena-status').textContent.includes('对局结束'),{},{timeout:40000});
    assert.match(await el('blue-hud-kpis').textContent(),/决策 \/ 错误/);assert.match(await el('blue-hud-decision').textContent(),/规则控制/);assert.equal(await el('blue-scores').getAttribute('data-score-kind'),'rule_policy');assert.match(await el('blue-score-note').textContent(),/无模型、无候选概率/);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copied=text;}}}));await openDiagnostics(page);await page.locator('#jev-arena-report-details summary').click();await el('copy-json').click();await page.waitForFunction(()=>!!window.copied);
    const d=JSON.parse(await page.evaluate(()=>window.copied));assert.equal(d.result.reason,'elimination');assert.ok(d.metrics.some(m=>m.damage===200));assert.ok(d.metrics.every(m=>m.shots>0));assert.ok(d.decisions.every(r=>r.decision_source==='rule_attack_baseline'&&r.probabilities===null&&r.usage.model_requests===0&&r.policy_audit));
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
    console.log('PASS rule-attack UI: explicit non-model label, standalone with no models, no RPM charge, real shots/damage/elimination, audit export, mobile');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

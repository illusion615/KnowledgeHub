'use strict';
// Real in-game controls/manager, but deferred injected providers only. No inference.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {createServer}=require('../scripts/jev-playground-server');
const {openSettings,openDiagnostics,closePanel}=require('./jev-arena-ui');
async function main(){
  const ready={ready:true,configured:true,local:true,sdk_ready:true},calls=[];let aborted=0;
  const server=createServer({runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':ready,'nanojev-4bit':ready})},copilot:{status:async()=>({available:true,authentication:'fixture'}),listModels:async()=>({source:'copilot-cli-models.list',checked_at:new Date().toISOString(),models:[{id:'fixture-model',name:'Fixture Model'}]})},arenaEvaluate:(team,req,signal)=>new Promise((resolve,reject)=>{calls.push(team);signal.addEventListener('abort',()=>{aborted++;reject(Object.assign(new Error('cancelled'),{code:'cancelled'}));},{once:true});})});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const el=id=>page.locator('#jev-arena-'+id);
    await page.goto(base+'/posts/jev-system-one-research/?lang=zh#jev-arena');await page.waitForFunction(()=>Array.from(document.getElementById('jev-arena-red').options).some(o=>o.value==='copilot:fixture-model'));
    assert.equal(await el('overlay').isVisible(),false);assert.equal(await el('blue').isVisible(),false);assert.equal(await el('start').isVisible(),true);
    assert.deepEqual(await page.locator('#jev-arena').evaluate(e=>Array.from(e.children).map(c=>c.className)),['arena-heading','arena-battlefield']);
    for(const id of ['seed','blue','red','mode','control','input-profile','ruleset','deadline','duration','rate-mode','refresh','swap','consent'])assert.ok(await el(id).evaluate(e=>!!e.closest('#jev-arena-settings-panel')));
    for(const id of ['start','stop','settings-open','diagnostics-open','replay'])assert.ok(await el(id).evaluate(e=>!!e.closest('#jev-arena-battlefield')));
    for(const id of ['status','clock','connection','blue-hud','red-hud','hud-scope','intent-status','show-routes','comparison-definitions']){assert.ok(await el(id).evaluate(e=>!!e.closest('#jev-arena-diagnostics-panel')));assert.equal(await el(id).isVisible(),false);}
    assert.equal(await page.evaluate(()=>{const ids=Array.from(document.querySelectorAll('[id^="jev-arena-"]')).map(e=>e.id);return ids.length===new Set(ids).size;}),true);
    await openSettings(page);assert.equal(await el('dialog').getAttribute('aria-modal'),'true');assert.equal(await el('settings-open').getAttribute('aria-expanded'),'true');assert.equal(await el('settings-close').evaluate(e=>e===document.activeElement),true);assert.equal(calls.length,0);
    await page.keyboard.press('Shift+Tab');assert.ok(await el('dialog').evaluate(e=>e.contains(document.activeElement)));await page.keyboard.press('Tab');assert.equal(await el('settings-close').evaluate(e=>e===document.activeElement),true);
    await el('settings-tab').focus();await page.keyboard.press('ArrowRight');assert.equal(await el('diagnostics-tab').getAttribute('aria-selected'),'true');await page.keyboard.press('Home');assert.equal(await el('settings-tab').getAttribute('aria-selected'),'true');
    await page.keyboard.press('Escape');assert.equal(await el('overlay').isVisible(),false);assert.equal(await el('settings-open').evaluate(e=>e===document.activeElement),true);assert.equal(await el('board').evaluate(e=>e.inert),false);
    await openSettings(page);await el('red').selectOption('copilot:fixture-model');assert.equal(await el('consent-field').isVisible(),true);assert.equal(await el('start').isDisabled(),true);await el('consent').check();await closePanel(page);assert.equal(await el('start').isEnabled(),true);
    await openSettings(page);assert.equal(await el('consent').isChecked(),true);await closePanel(page);assert.equal(calls.length,0,'opening/closing never spends calls or starts a game');
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:844});await openSettings(page);
      const bounds=await page.evaluate(()=>Object.fromEntries(['battlefield','dialog','settings-close','dialog-actions'].map(id=>[id,document.getElementById('jev-arena-'+id).getBoundingClientRect().toJSON()])));
      assert.ok(bounds.dialog.left>=bounds.battlefield.left&&bounds.dialog.right<=bounds.battlefield.right);
      assert.ok(bounds.dialog.top>=0&&bounds.dialog.bottom<=845);assert.ok(bounds['settings-close'].top>=0&&bounds['dialog-actions'].bottom<=845);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await el('duration').selectOption('30'); // Body scrolls; fixed footer remains available.
      const footer=await el('dialog-actions').boundingBox();assert.ok(footer.y+footer.height<=845);
      if(process.env.JEV_SCREENSHOT_DIR)await el('battlefield').screenshot({path:require('node:path').join(process.env.JEV_SCREENSHOT_DIR,'arena-settings-'+width+'.png')});
      await closePanel(page);
    }
    await openSettings(page);await el('consent').check();await el('start').click();assert.equal(await el('overlay').isVisible(),false);
    for(let attempts=0;calls.length<2&&attempts<200;attempts++)await new Promise(r=>setTimeout(r,25));assert.equal(calls.length,2);assert.equal(await el('blue-model-switch').isDisabled(),true);assert.equal(await el('red-model-switch').isDisabled(),true);
    await openSettings(page);for(const id of ['blue','red','seed','mode','control','duration','ruleset','consent'])assert.equal(await el(id).isDisabled(),true);assert.equal(await el('stop').isEnabled(),true);assert.ok(await el('stop').evaluate(e=>!!e.closest('#jev-arena-dialog-actions')));
    const before=await el('clock').evaluate(e=>e.textContent.match(/模拟 ([0-9.,]+)/)?.[1]);assert.ok(before);
    await page.waitForFunction(tick=>document.getElementById('jev-arena-clock').textContent.match(/模拟 ([0-9.,]+)/)?.[1]!==tick,before);assert.equal(aborted,0);assert.equal(calls.length,2,'inspecting settings does not start extra requests or stop physics');
    await el('stop').click();await page.waitForFunction(()=>!document.getElementById('jev-arena-start').disabled);assert.equal(aborted,2);assert.equal(await el('blue').isEnabled(),true);assert.equal(await el('blue-model-switch').isEnabled(),true);
    await openDiagnostics(page);assert.equal(await el('diagnostics-panel').isVisible(),true);assert.ok(await el('copy-report').evaluate(e=>!!e.closest('#jev-arena-diagnostics-panel')));
    await closePanel(page);assert.ok(await el('start').evaluate(e=>!!e.closest('#jev-arena-main-actions')));assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await openSettings(page);await el('overlay').click({position:{x:2,y:40}});assert.equal(await el('overlay').isVisible(),false);
    await page.locator('[data-lang-toggle]').click();await openSettings(page);await page.waitForFunction(()=>document.getElementById('jev-arena-dialog-title').textContent==='Match Settings & Diagnostics');await closePanel(page);
    await openSettings(page);const light=await el('dialog').evaluate(e=>getComputedStyle(e).backgroundColor);await page.evaluate(()=>{document.documentElement.dataset.theme='dark';});const dark=await el('dialog').evaluate(e=>getComputedStyle(e).backgroundColor);assert.notEqual(dark,light);assert.ok(dark.startsWith('rgb('),'dialog background stays opaque');await closePanel(page);
    assert.deepEqual(errors,[]);console.log('PASS in-game shell: canonical controls, settings/diagnostics tabs, focus/Escape/backdrop, mobile scrolling, explicit cloud consent, read-only live settings, unpaused physics, Stop/cancellation; no inference');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

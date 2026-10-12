'use strict';
// Explicit navigation helpers for the real in-game dialog, not DOM bypasses.
async function openPanel(page,name){
  const prefix='#jev-arena-';
  if(await page.locator(prefix+'overlay').isVisible())await page.locator(prefix+name+'-tab').click();
  else await page.locator(prefix+name+'-open').click();
}
// Legacy compatibility tests explicitly inject removed controls into a fixture
// page. Production UI must NOT offer these new-match modes; core/replay semantics
// remain testable without redefining old records under the new defaults.
async function enableLegacyControls(page){
  await page.evaluate(()=>{for(const [id,values] of Object.entries({control:['primitive','strategic'],'input-profile':['action-facts','engage-first','utility-attack','utility-tactics'],ruleset:['cardinal','tactical']})){const el=document.getElementById('jev-arena-'+id);el.closest('label').hidden=false;for(const v of values)if(!Array.from(el.options).some(o=>o.value===v))el.appendChild(new Option(v,v));}});
  await openPanel(page,'settings');await page.locator('#jev-arena-input-profile').selectOption('engage-first');await page.locator('#jev-arena-ruleset').selectOption('cardinal');
  await page.locator('#jev-arena-settings-close').click();
}
module.exports={enableLegacyControls,openSettings:page=>openPanel(page,'settings'),openDiagnostics:page=>openPanel(page,'diagnostics'),closePanel:async page=>{if(await page.locator('#jev-arena-overlay').isVisible())await page.locator('#jev-arena-settings-close').click();}};

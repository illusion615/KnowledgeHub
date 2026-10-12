'use strict';
// Reading/deck checks only: disabled providers and all external requests blocked.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer}=require('../scripts/jev-playground-server');
async function main(){
  let calls=0;const forbidden=async()=>{calls++;throw Error('unexpected_model_call');};
  const server=createServer({runner:{status:async()=>({vercel:{},typesafe:{},'nanojev-fp32':{ready:false},'nanojev-4bit':{ready:false}}),evaluate:forbidden},copilot:{status:async()=>({available:false}),evaluateStreamTask:forbidden},arenaEvaluate:forbidden,supportNativeEvaluate:forbidden});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    const base='http://127.0.0.1:'+server.address().port,out=process.env.JEV_SCREENSHOT_DIR;if(out)fs.mkdirSync(out,{recursive:true});
    browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    await page.addInitScript(()=>{localStorage.setItem('narration-autostart','false');const en=new URL(location.href).searchParams.get('lang')==='en';localStorage.setItem('theme',en?'dark':'light');localStorage.setItem('present-bg',en?'black':'default');});
    for(const language of ['zh','en']){
      await page.goto(base+'/posts/jev-system-one-research/?lang='+language+'#laya');await page.waitForFunction(()=>!!document.querySelector('[data-presentation-toggle]'));
      await page.evaluate(lang=>{document.documentElement.dataset.theme=lang==='en'?'dark':'light';},language);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}'});
      const brief=await page.request.get(base+'/posts/jev-system-one-research/agent-brief.json').then(r=>r.json());
      assert.deepEqual(await page.locator('main > section.section').evaluateAll(xs=>xs.map(e=>e.id)),brief.article_order);
      assert.equal(await page.locator('#news .demand-figure').count(),3);assert.equal(await page.locator('#news .demand-methods[open]').count(),0);
      for(const image of ['posts.svg','comments.svg','vercel-adoption-original.png'])assert.equal((await page.request.get(base+'/posts/jev-system-one-research/examples/demand/'+image)).status(),200);
      const demand=await page.request.get(base+'/posts/jev-system-one-research/examples/demand/summary.json').then(r=>r.json());assert.equal(demand.cohorts[0].totals.posts,252);assert.equal(demand.cohorts.length,6);
      const compared=await page.locator('#demand-model-totals tbody tr').evaluateAll(xs=>xs.map(r=>({id:r.dataset.cohort,cells:Array.from(r.cells).map(c=>c.textContent)})));assert.equal(compared.length,6);for(const row of compared){const c=demand.cohorts.find(c=>c.id===row.id);assert.deepEqual(row.cells,[c.name,c.start.slice(0,10),String(c.totals.posts),String(c.totals.comments),c.late_share_percent.posts+'%',c.late_share_percent.comments+'%']);}
      assert.match(await page.locator('#news').textContent(),/Laya-MLX/);assert.equal(await page.locator('#positioning [data-reading-main]').count(),3);
      const market=await page.request.get(base+'/posts/jev-system-one-research/examples/structured-decision-market-evidence.json').then(r=>r.json());assert.equal(market.standalone_category_market_size_established,false);
      const section=page.locator('#laya');await section.scrollIntoViewIfNeeded();assert.equal(await section.locator('[data-reading-main]').count(),3);
      assert.match(await section.locator('h2').textContent(),language==='zh'?/双向编码器/:/Bidirectional Encoders/);
      for(const ref of [52,53,54,55])assert.ok(await section.locator(`a[href="#ref-${ref}"]`).count());
      const response=await page.request.get(base+'/posts/jev-system-one-research/examples/laya-research-evidence.json');assert.equal(response.status(),200);const published=await response.json(),stats=published.community.summary;assert.equal(stats.jev.correct,31);
      const cells=await section.locator('#laya-community tbody tr').first().locator('td').allTextContents();assert.deepEqual(cells.slice(1),['jev','laya'].map(k=>`${stats[k].correct}/${stats[k].total} · ${(stats[k].correct/stats[k].total*100).toFixed(1)}%`));
      const assertNarrative=async()=>{const states=await page.locator('[data-reading-main]').evaluateAll(xs=>xs.map(e=>{const c=e.querySelector(':scope > .subsection-content'),s=getComputedStyle(c);return {toggle:e.querySelector(':scope > button')!==null,accordion:e.hasAttribute('data-accordion'),hidden:c.getAttribute('aria-hidden'),height:c.getBoundingClientRect().height,maxHeight:s.maxHeight,opacity:s.opacity,overflow:s.overflow};}));assert.equal(states.length,brief.reading_layout.main_blocks);assert.ok(states.every(s=>!s.toggle&&!s.accordion&&s.hidden!=='true'&&s.height>0&&s.maxHeight==='none'&&s.opacity==='1'&&s.overflow==='visible'));};
      await assertNarrative();
      const extras=page.locator('[data-reading-extra]');assert.equal(await extras.count(),7);assert.equal(await extras.locator(':scope > button[aria-expanded="false"]').count(),7);
      for(const id of ['integration-extra-1','integration-extra-2'])await page.locator('#'+id+' > .subsection-toggle').click();
      assert.equal(await page.locator('#integration [data-reading-extra].is-open').count(),2,'expanding one supplement keeps the other open');await assertNarrative();
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:1000});await section.scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const timeline=page.locator('#model-release-timeline');await timeline.scrollIntoViewIfNeeded();
        const geometry=await timeline.locator('.release-timeline').evaluate(e=>Array.from(e.children).map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y};}));
        assert.equal(geometry.length,4);assert.ok(geometry.every(r=>Math.abs(r.y-geometry[0].y)<2));const unit=geometry[2].x-geometry[1].x;assert.ok(Math.abs(geometry[1].x-geometry[0].x-2*unit)<2,'two-day gap is twice the one-day gap');
        const scroller=timeline.locator('.release-timeline-scroll');if(width===390){assert.ok(await scroller.evaluate(e=>e.scrollWidth>e.clientWidth));await scroller.evaluate(e=>{e.scrollLeft=e.scrollWidth;});assert.ok(await scroller.evaluate(e=>e.scrollLeft>0));await scroller.evaluate(e=>{e.scrollLeft=0;});}
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(out)await timeline.screenshot({path:path.join(out,`release-timeline-${language}-${width}.png`)});
        for(const [index,chart] of (await page.locator('#news .demand-figure').all()).entries()){await chart.scrollIntoViewIfNeeded();assert.ok(await chart.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0));if(index<2)assert.equal(await chart.locator('img').evaluate(e=>e.currentSrc.includes('-mobile.svg')),width<=640);assert.ok(await chart.evaluate(e=>e.getBoundingClientRect().width<=innerWidth));if(out)await chart.screenshot({path:path.join(out,`demand-${index}-${language}-${width}.png`)});}
        await page.locator('#demand-model-totals').scrollIntoViewIfNeeded();assert.ok(await page.locator('#demand-model-totals').isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const methods=page.locator('#news .demand-methods');if(width===390){await methods.locator('summary').click();assert.equal(await page.locator('#demand-daily-values tbody tr').count(),8);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await methods.locator('summary').click();}
        for(const id of ['decision-market-evidence','decision-model-comparison','laya-checkpoints','laya-specialization','laya-community']){const table=page.locator('#'+id),block=table.locator('xpath=ancestor::article[@data-reading-main][1]');assert.equal(await block.count(),1);await table.scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.ok(await table.isVisible());if(out)await table.screenshot({path:path.join(out,`${id}-${language}-${width}.png`)});}
      }
      await assertNarrative();
      if(out){await page.setViewportSize({width:1440,height:1000});await page.locator('#news').screenshot({path:path.join(out,`narrative-news-${language}.png`)});}
      // Walk the complete live presentation; inspect every main chapter.
      await page.setViewportSize({width:1440,height:1000});await page.locator('[data-presentation-toggle]').click();await page.locator('.launch-play-btn').click();
      await page.waitForFunction(()=>document.documentElement.classList.contains('is-presentation-mode')||document.body.classList.contains('is-presentation-mode'));
      await page.evaluate(()=>document.activeElement?.blur());
      const total=await page.locator('[data-present-step]').count(),seen={news:0,positioning:0,'model-comparison':0,jev:0,nanojev:0,laya:0};
      for(let i=0;i<total;i++){
        const active=page.locator('[data-present-step].is-active');assert.equal(await active.count(),1);
        const chapter=await active.evaluate(e=>e.closest('section.section')?.id);
        if(Object.hasOwn(seen,chapter)){
          seen[chapter]++;await page.waitForTimeout(200);assert.ok(await active.isVisible());assert.ok(await active.evaluate(e=>e.scrollWidth<=e.clientWidth+2));
          if(out)await page.screenshot({path:path.join(out,`${chapter}-deck-${language}-${seen[chapter]}.png`)});
        }
        if(i+1<total)await page.keyboard.press('ArrowRight');
      }
      assert.deepEqual(seen,{news:2,positioning:1,'model-comparison':1,jev:2,nanojev:2,laya:2},'overview and content slides follow the new narrative');await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.classList.contains('is-presentation-mode')&&!document.body.classList.contains('is-presentation-mode'));
      await assertNarrative();assert.equal(await page.locator('#integration [data-reading-extra].is-open').count(),2);assert.equal(await extras.locator(':scope > button[aria-expanded="false"]').count(),5);
    }
    const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await staticPage.goto(base+'/posts/jev-system-one-research/#positioning');
    assert.ok(await staticPage.locator('[data-reading-main] > .subsection-content').evaluateAll(xs=>xs.filter(e=>!e.closest('[data-popup-source]')).every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).maxHeight==='none'&&e.getBoundingClientRect().height>0)));assert.equal(await staticPage.locator('#positioning').evaluate(e=>getComputedStyle(e).opacity),'1');await staticPage.close();
    assert.equal(calls,0);assert.deepEqual(errors,[]);
  }finally{
    if(browser){await Promise.all(browser.contexts().map(c=>c.close()));await browser.close();}
    const closed=new Promise(r=>server.close(r));server.closeAllConnections();await closed;
  }
  console.log('PASS narrative-first article: main prose visible without toggles/JS, extras collapsed and independent, bilingual/mobile/full decks, reading state restored, preserved evidence, zero inference');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

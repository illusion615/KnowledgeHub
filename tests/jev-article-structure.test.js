'use strict';
// Narrative order, source scope and legacy-anchor preservation. No inference.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../posts/jev-system-one-research'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const brief=JSON.parse(fs.readFileSync(path.join(root,'agent-brief.json'),'utf8'));
const market=JSON.parse(fs.readFileSync(path.join(root,'examples/structured-decision-market-evidence.json'),'utf8'));
const {readingSource,block}=require('./jev-article-source');const reading=readingSource(html);
const order=[...html.matchAll(/<section id="([^"]+)" class="section"/g)].map(m=>m[1]);
const section=id=>{const start=html.match(new RegExp(`<(?<tag>section|div) id="${id}"[^>]*>`));assert.ok(start,`anchor ${id}`);const tag=start.groups.tag,re=new RegExp(`<\\/?${tag}\\b[^>]*>`,'g');re.lastIndex=start.index;let depth=0,m;while((m=re.exec(html))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return html.slice(start.index,re.lastIndex);}throw Error('unclosed '+id);};
test('article proceeds from community and category to comparison and contiguous model deep dives',()=>{
  assert.deepEqual(order,brief.article_order);assert.deepEqual(order.slice(0,4),['news','positioning','model-comparison','jev']);
  for(const group of Object.values(brief.model_chapter_groups)){assert.ok(order.includes(group[0]));for(const id of group.slice(1)){assert.ok(section(group[0]).includes(`id="${id}"`));assert.ok(!order.includes(id),'subchapter must not be top-level');}}
  assert.ok(order.indexOf('jev')<order.indexOf('nanojev')&&order.indexOf('nanojev')<order.indexOf('laya'));
  assert.ok(order.indexOf('laya')<order.indexOf('architectures'));assert.equal(order[order.indexOf('playground')+1],'evaluation');
  const nav=html.match(/<nav class="nav-links"[\s\S]*?<\/nav>/)[0];assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]),order);
  for(const id of ['news','positioning','architectures','playground','laya','nanojev','evaluation','references'])assert.ok(order.includes(id),id);
  assert.ok(!order.includes('agent-brief'));assert.ok(section('evaluation').includes('id="agent-brief"'));
  for(const id of ['contract','evidence','integration','limits','nanojev-integration','mlx-local'])assert.match(section(id),new RegExp(`^<div id="${id}" class="model-subchapter"`));
  assert.deepEqual([...nav.matchAll(/href="#(jev|nanojev|laya)"[^>]*>([^<]+)</g)].map(m=>m[2]),['Jev','NanoJev','Laya']);
});
test('the opening shows public release dates while category analysis is not a vendor introduction',()=>{
  assert.match(section('news'),/Laya-MLX/);assert.match(section('news'),/2026-09-18T04:38:51/);assert.match(section('news'),/通用需求/);assert.doesNotMatch(section('news').split('id="model-release-timeline"')[1].split('</article>')[0],/2026-09-22|本次核查/);
  const s=section('positioning');assert.match(s,/软件里的语义判断层/);assert.equal((s.match(/data-present-substep/g)||[]).length,6);assert.equal((s.match(/data-reading-main/g)||[]).length,3);assert.equal((s.match(/data-accordion/g)||[]).length,0);
  assert.doesNotMatch(s,/RLCD|jev-1\.13\.0|TypeSafe/);assert.match(section('jev'),/RLCD/);assert.match(section('jev'),/披露边界/);
  assert.match(section('model-comparison'),/没有|尚无/);assert.match(section('model-comparison'),/decision-model-comparison/);
});
test('market signals retain dates and denominators and are not relabeled as a category TAM',()=>{
  assert.equal(market.standalone_category_market_size_established,false);assert.equal(market.new_inference_calls,0);
  const byId=Object.fromEntries(market.observations.map(o=>[o.id,o]));assert.deepEqual(byId.ai_adoption_survey.values_percent,{'2023':55,'2024':78});
  assert.equal(byId.api_automation.sample_records,1000000);assert.equal(byId.api_automation.automation_pattern_percent,77);assert.equal(byId.api_automation.sample_period,'2025-08');assert.match(byId.api_automation.unit,/not a firm/);
  assert.equal(byId.inference_cost_trend.reduction_factor_greater_than,280);assert.equal(byId.inference_cost_trend.period_start,'2022-11');assert.equal(byId.inference_cost_trend.period_end,'2024-10');
  assert.equal(brief.category_analysis.market_evidence,'examples/structured-decision-market-evidence.json');
  for(const n of [56,57]){assert.ok(section('positioning').includes(`[${n}]`));assert.ok(html.includes(`id="ref-${n}"`));assert.ok(html.includes(market.sources[n].url));}
  assert.match(section('positioning'),/不是结构化决策模型的市场份额或收入/);assert.match(section('positioning'),/same quality target/);
});
test('main prose is not an accordion; only explicit optional implementation details collapse',()=>{
  assert.match(html,/data-reading-layout="narrative"/);assert.match(html,/href="reading\.css"/);
  const blocks=[...reading.matchAll(/<article\b[^>]*data-reading-main[^>]*>/g)];assert.equal(blocks.length,brief.reading_layout.main_blocks);
  for(const m of blocks){assert.doesNotMatch(m[0],/data-accordion|is-open/);assert.match(reading.slice(m.index+m[0].length,m.index+m[0].length+100),/^\s*<h[34] class="narrative-heading">/);}
  const extras=[...html.matchAll(/<article\b[^>]*data-reading-extra[^>]*>/g)].map(m=>m[0].match(/\bid="([^"]+)"/)[1]);assert.deepEqual(extras.sort(),brief.reading_layout.collapsed_extension_ids.slice().sort());
  for(const id of ['news','positioning','model-comparison','contract','laya','architectures','workflow','agent','retrieval'])assert.doesNotMatch(section(id),/data-accordion/);
  const folds=[...html.matchAll(/<article\b[^>]*data-accordion[^>]*>/g)];assert.equal(folds.length,extras.length+3);
  for(const m of folds.filter(m=>!m[0].includes('data-reading-extra')))assert.ok(block(html,'jev-lab-after').text.includes(m[0]),'unmarked disclosure belongs to the relocated optional API inspector');
});
test('access documentation does not imply successful deployment or inference',()=>{
  assert.match(section('jev'),/当前 Playground 未加入 Cloudflare/);assert.match(section('jev'),/payment-method verification/);
  for(const n of [58,59])assert.ok(html.includes(`id="ref-${n}"`));
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'no duplicated IDs after section moves');
});

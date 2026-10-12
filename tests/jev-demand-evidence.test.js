'use strict';
// Public-record arithmetic, retrieval coverage and publication claims; no HTTP/inference.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {summarize,svg}=require('../scripts/jev-demand-evidence');
const root=path.resolve(__dirname,'../posts/jev-system-one-research'),dir=path.join(root,'examples/demand');
const raw=JSON.parse(fs.readFileSync(path.join(dir,'observations.json'),'utf8')),summary=JSON.parse(fs.readFileSync(path.join(dir,'summary.json'),'utf8'));
const brief=JSON.parse(fs.readFileSync(path.join(root,'agent-brief.json'),'utf8')),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('all chart points recompute from unique timestamped submissions and in-window comments',()=>{
  assert.deepEqual(summarize(raw),summary);assert.deepEqual(summary.cohorts.map(c=>[c.totals.posts,c.totals.comments]),[[252,1292],[20,551],[63,1538],[60,2030],[98,3312],[58,2073]]);
  for(const c of summary.cohorts){assert.deepEqual(brief.demand_evidence.observed_totals[c.id],{posts:c.totals.posts,comments:c.totals.comments});assert.equal(c.daily.reduce((n,r)=>n+r.posts,0),c.totals.posts);assert.equal(c.daily.reduce((n,r)=>n+r.comments,0),c.totals.comments);assert.equal(c.daily.length,8);}
  assert.equal(summary.cohorts[0].days_4_to_7.posts,181);assert.equal(summary.cohorts[0].totals.threads_without_comments,179);
  for(const id of ['gptoss','deepseekr1','gpt6','opus5'])assert.ok(summary.cohorts.find(c=>c.id===id).totals.comments>summary.cohorts[0].totals.comments,'do not hide the unfavorable comment comparison');
  const by=Object.fromEntries(summary.cohorts.map(c=>[c.id,c]));assert.equal(by.deepseekr1.late_share_percent.comments,55.9);assert.equal(by.jev.late_share_percent.comments,54.3);assert.equal(by.gpt6.late_share_percent.posts,37.8);
  assert.equal(by.gpt6.totals.comments_before_current_thread_timestamp,7);assert.equal(by.opus5.totals.comments_before_current_thread_timestamp,1);
  assert.equal(summary.version_selection.excluded_incomplete.length,2);assert.match(summary.version_selection.incomplete_policy,/Do not zero-fill/);
});
test('snapshot scopes are exhaustive and do not publish comments, account names or point-score history',()=>{
  for(const r of raw.source_requests){assert.equal(r.exhaustive,true);assert.ok(/^[a-f0-9]{64}$/.test(r.sha256));assert.equal(new URL(r.url).hostname,'hn.algolia.com');if(r.nb_hits>r.returned)assert.ok(raw.source_requests.some(s=>s!==r&&s.url.includes('numericFilters=')));}
  for(const c of raw.cohorts){assert.equal(c.candidates-c.excluded.length,c.stories.length);for(const r of c.comments)assert.deepEqual(Object.keys(r).sort(),['created_at','id','story_id']);for(const r of c.stories)assert.ok(!Object.hasOwn(r,'points')&&!Object.hasOwn(r,'author'));}
  assert.doesNotMatch(JSON.stringify(raw),/"comment_text"|"csrf"|Bearer |\/Users\//);
  assert.match(raw.alias_rule,/Reposts remain/);assert.match(raw.retrieval,/year\/platform growth/);assert.match(summary.scope,/not the full web/i);
});
test('invalid windows, duplicates and wrong-thread comments are rejected rather than silently repaired',()=>{
  const copy=()=>JSON.parse(JSON.stringify(raw));let bad=copy();bad.cohorts[0].comments[0].created_at=bad.cohorts[0].end_exclusive;assert.throws(()=>summarize(bad),/outside_window/);
  bad=copy();bad.cohorts[0].comments[0].story_id='unknown';assert.throws(()=>summarize(bad),/invalid_comment/);
  bad=copy();bad.cohorts[0].stories.push(bad.cohorts[0].stories[0]);assert.throws(()=>summarize(bad),/duplicate_story/);
});
test('rendered graphs are offline deterministic and provider chart remains an attributed original',()=>{
  for(const key of ['posts','comments']){const chart=fs.readFileSync(path.join(dir,key+'.svg'),'utf8');assert.equal(chart,svg(summary,key));assert.equal((chart.match(/<polyline /g)||[]).length,6);for(const name of ['DeepSeek-R1','GPT-6 Astra','Claude Opus 5'])assert.ok(chart.includes(name));assert.match(chart,/1250|新增主帖/);assert.match(chart,/D7/);assert.doesNotMatch(chart,/<script|onload=/);}
  for(const key of ['posts','comments'])assert.equal(fs.readFileSync(path.join(dir,key+'-mobile.svg'),'utf8'),svg(summary,key,true));
  const provider=summary.provider_source;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,provider.image_file))).digest('hex'),provider.image_sha256);assert.match(provider.scope,/not digitized/);assert.match(provider.scope,/Free promotion/);
  for(const n of [63,64,65,66])assert.ok(html.includes(`id="ref-${n}"`));assert.match(html,/付费团队不等于为 Jev 付费/);assert.match(html,/179 帖/);assert.match(html,/7\/30 日留存/);assert.match(html,/不是全网话题量/);
});

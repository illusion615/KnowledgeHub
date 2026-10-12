'use strict';
// Release metadata/markup consistency, not inference or a claim of equal models.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../posts/jev-system-one-research');
const data=JSON.parse(fs.readFileSync(path.join(dir,'examples/model-release-timeline.json'),'utf8'));
const brief=JSON.parse(fs.readFileSync(path.join(dir,'agent-brief.json'),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),news=html.split('<section id="news"')[1].split('</section>')[0],timeline=news.split('id="model-release-timeline"')[1].split('</article>')[0];
test('timeline uses release events, with explicit Laya and MLX package publication dates',()=>{
  assert.deepEqual(data.events.map(e=>e.date),['2026-09-15','2026-09-17','2026-09-18','2026-09-19']);
  assert.deepEqual(data.events.map(e=>e.offset_days),[0,2,3,4]);
  assert.deepEqual(brief.release_timeline.events.map(e=>[e.name,e.date,e.offset_days]),data.events.map(e=>[e.name,e.date,e.offset_days]));
  for(const e of data.events){assert.equal((Date.parse(e.date)-Date.parse(data.events[0].date))/86400000,e.offset_days);if(e.timestamp)assert.equal(e.timestamp.slice(0,10),e.date);assert.ok(news.includes(`data-release-id="${e.id}"`));assert.ok(news.includes(`datetime="${e.timestamp||e.date}"`));}
  const laya=data.events[2];assert.equal(laya.version,'0.1.0');assert.equal(laya.kind,'first_pypi_package_release');assert.equal(laya.corroboration.announcement_published_at,'2026-09-18T05:52:24Z');assert.match(laya.source_url,/pypi\/laya\/0\.1\.0\/json$/);
  assert.equal(data.events[3].kind,'independent_runtime_package_release');assert.equal(data.events[1].kind,'repository_creation');
});
test('the horizontal timeline remains main content, not an accordion or a review-date list',()=>{
  assert.match(news,/class="release-timeline"/);assert.match(news,/role="region"/);assert.match(news,/tabindex="0"/);assert.doesNotMatch(timeline,/data-accordion|2026-09-22|本次核查/);
  assert.equal((timeline.match(/data-present-substep/g)||[]).length,1);
  assert.match(news,/横轴按日历日间隔/);assert.match(news,/不等于权重首次公开/);assert.match(news,/量化包/);
  assert.equal(brief.release_timeline.evidence_summary,'examples/model-release-timeline.json');
  for(const n of [60,61,62]){assert.ok(news.includes(`[${n}]`));assert.ok(html.includes(`id="ref-${n}"`));}
});

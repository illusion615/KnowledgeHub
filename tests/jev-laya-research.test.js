'use strict';
// Publication/arithmetic checks, not independently reproduced model performance.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),article=path.join(root,'posts/jev-system-one-research');
const evidence=JSON.parse(fs.readFileSync(path.join(article,'examples/laya-research-evidence.json'),'utf8'));
const brief=JSON.parse(fs.readFileSync(path.join(article,'agent-brief.json'),'utf8'));
const html=fs.readFileSync(path.join(article,'index.html'),'utf8'),section=html.split('<section id="laya"')[1].split('</section>')[0];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Laya has a navigable bilingual five-step chapter and pinned, explicit provenance',()=>{
  assert.ok(html.includes('href="#laya"'));assert.equal(brief.article_order[brief.article_order.indexOf('nanojev')+1],'laya');
  assert.equal((section.match(/data-present-substep/g)||[]).length,5);assert.equal((section.match(/data-reading-main/g)||[]).length,3);assert.equal((section.match(/data-accordion/g)||[]).length,0);
  assert.equal(brief.laya_research.evidence_summary,'examples/laya-research-evidence.json');assert.equal(brief.laya_research.article_anchor,'#laya');
  assert.equal(brief.laya_research.source_commits.laya,evidence.source_commits.laya);
  for(const n of [52,53,54,55]){assert.ok(html.includes(`id="ref-${n}"`));assert.ok(section.includes(`[${n}]`));}
  assert.match(section,/六次有界本地接口验证/);assert.match(section,/working interfaces do not establish Chinese task accuracy/);assert.match(section,/Current v3 extends application resource, threat-route and cover heuristics/);assert.ok(html.includes('id="ref-67"'));assert.equal(brief.local_decision_models.validation,'examples/laya-runtime-validation.json');
});
test('base, multilingual and task-tuned checkpoints remain separate from cited Jev baseline',()=>{
  assert.deepEqual(brief.laya_research.checkpoints.map(c=>[c.id,c.parameters_millions,c.max_sequence_tokens]),evidence.checkpoints.map(c=>[c.id,c.parameters_millions,c.max_sequence_tokens]));
  const a=evidence.author_typed_decisions;assert.equal(a.cases,400);assert.equal(a.judgments,2000);assert.equal(a.accuracy.task_tuned,.766);
  assert.ok(a.accuracy.english_base<a.accuracy.majority_class&&a.accuracy.multilingual_base<a.accuracy.majority_class);
  assert.match(a.scope,/not rerun alongside/);assert.match(section,/非同场复测/);assert.match(section,/head|截断/);
});
test('published counts and means recompute from forty numeric observations without new inference',()=>{
  const c=evidence.community;assert.equal(c.observations.length,40);assert.equal(new Set(c.observations.map(r=>r.case_id)).size,40);
  for(const key of ['jev','laya']){
    const rows=c.observations,expected=c.summary[key];assert.equal(rows.filter(r=>r[key].correct).length,expected.correct);assert.equal(rows.length,expected.total);close(rows.reduce((n,r)=>n+r[key].elapsed_ms,0)/rows.length,expected.mean_ms);
    for(const [tier,summary] of Object.entries(expected.tiers)){const rs=rows.filter(r=>r.tier===tier);assert.equal(rs.length,summary.total);assert.equal(rs.filter(r=>r[key].correct).length,summary.correct);}
  }
  assert.deepEqual([c.summary.jev.correct,c.summary.laya.correct],[31,23]);assert.equal(c.summary.jev.mean_ms,588.325);assert.equal(c.summary.laya.mean_ms,7.2925);
  assert.equal(evidence.fresh_model_calls,0);assert.equal(evidence.laya_deployed_in_this_project,false);assert.equal(evidence.nanojev_in_community_comparison,false);
  assert.equal(c.settings.jev_returned_model_in_raw_records,false);assert.equal(c.settings.laya_hf_revision_pinned_in_script,false);
  assert.doesNotMatch(JSON.stringify(evidence),/\/Users\/|~\/\.cache|Bearer |github_pat_|"csrf"|"text"|"api_key"/);
});
test('post-hoc cascade and MLX parity cannot masquerade as independent hybrid or task accuracy',()=>{
  const c=evidence.community,p=c.posthoc_cascade,rows=c.observations;
  assert.equal(rows.filter(r=>r.laya.confidence<p.threshold).length,22);assert.equal(p.escalated,22);assert.equal(p.correct,31);
  assert.equal(rows.filter(r=>(r.laya.confidence<p.threshold?r.jev:r.laya).correct).length,p.correct);
  close(rows.reduce((n,r)=>n+r.laya.elapsed_ms+(r.laya.confidence<p.threshold?r.jev.elapsed_ms:0),0)/40,p.estimated_mean_ms);assert.match(p.scope,/not held-out/);
  const m=evidence.mlx_author_report;assert.equal(m.parity_questions*m.checkpoints*m.precisions,m.selected_answer_matches);assert.match(m.scope,/not our measurement or business accuracy/);
});
test('offline evidence generator rejects non-pinned files rather than relabeling arbitrary data',()=>{
  const {build}=require('../scripts/jev-laya-evidence');assert.throws(()=>build(Buffer.from('[]'),Buffer.from('[]')),/source_snapshot_mismatch/);
});

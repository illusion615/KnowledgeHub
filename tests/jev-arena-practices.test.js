'use strict';
// Documentation consistency, not independent proof of private model execution.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'posts/jev-system-one-research');
const summary=JSON.parse(fs.readFileSync(path.join(dir,'examples/tank-arena-practice-evidence.json'),'utf8'));
const brief=JSON.parse(fs.readFileSync(path.join(dir,'agent-brief.json'),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
test('article and machine-readable brief point to the same practice chapter and public summary',()=>{
  assert.ok(html.includes('id="arena-practices"'));assert.ok(html.includes('href="#arena-practices"'));assert.ok(!brief.article_order.includes('arena-practices'));assert.ok(brief.popup_only_sections.includes('arena-practices'));
  assert.equal(brief.arena_best_practices.article_anchor,'#arena-practices');assert.equal(brief.arena_best_practices.evidence_summary,'examples/tank-arena-practice-evidence.json');
  assert.ok(html.includes('id="ref-50"'));assert.ok(html.includes('id="ref-51"'));
  for(const name of summary.source_documents_in_repository)assert.ok(fs.existsSync(path.join(root,name)),name);
});
test('published v6 observations retain denominators, no-model ablation and negative model contribution',()=>{
  const s=summary.v6_sync_comparison;assert.equal(s.physics,'tank-v6-tactical');assert.equal(s.seeds.length*s.sides_per_seed.length,s.games_per_controller);
  assert.deepEqual(s.controllers.map(c=>[c.wins,c.losses,c.draws,c.native_calls]),[[3,3,0,216],[6,0,0,0],[6,0,0,114]]);
  for(const c of s.controllers)assert.equal(c.wins+c.losses+c.draws,s.games_per_controller);
  assert.equal(s.model_changed_search_choice_on_observed_snapshots,2);
  const n=s.negative_evidence;assert.ok(n.search_only_final_hp_by_side.every((hp,i)=>hp>n.search_plus_model_final_hp_by_side[i]));assert.equal(summary.model.weights_trained_or_modified_for_arena,false);
});
test('realtime observations remain v6 and are not relabeled as v7 or cloud victories',()=>{
  const r=summary.v6_realtime_observations;assert.equal(r.physics,'tank-v6-tactical');assert.equal(r.games.length,4);assert.equal(r.games.reduce((n,g)=>n+g.native_calls,0),r.native_calls_total);assert.equal(r.native_calls_total,94);
  assert.ok(r.games.every(g=>g.outcome==='elimination_win'&&g.wall_ms>=g.ticks*200&&g.mean_all_in_decision_ms>0));
  assert.equal(summary.later_versions.friendly_fire.real_model_calls_in_that_iteration,0);assert.equal(summary.later_versions.online_scoring.live_cloud_inference_in_compatibility_checks,false);
  assert.ok(summary.not_implemented_as_team_strategy.length>=3);assert.match(summary.publication_scope,/not independent proof/);
  assert.doesNotMatch(JSON.stringify(summary),/\/Users\/|~\/.cache|Bearer [A-Za-z0-9]|github_pat_|"csrf"|"match_id"/);
});

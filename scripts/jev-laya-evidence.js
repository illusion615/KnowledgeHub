'use strict';
// Offline publication from two pinned, public community result files. Never
// fetches, loads a model, reads credentials, or republishes the ticket texts.
const fs=require('node:fs'),crypto=require('node:crypto');
const commit='30ba64dceb7da058b306c104a571f1242dbd582b';
const snapshots={jev:'b344cb17749ea7447b62cfd1b6a092fe1146d3e8b9212d8d7c897aa95c96296f',laya:'184ba64e7d5edbee7769ff2accb7998241e5e53600c70cec42d6a8baf2006528'};
const mean=xs=>Number((xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(4));
function build(jevBytes,layaBytes){
  const inputs={jev:jevBytes,laya:layaBytes},data={};
  for(const key of Object.keys(inputs)){
    if(crypto.createHash('sha256').update(inputs[key]).digest('hex')!==snapshots[key])throw Error('source_snapshot_mismatch');
    data[key]=JSON.parse(inputs[key].toString('utf8'));
    if(!Array.isArray(data[key])||data[key].length!==40)throw Error('unexpected_case_count');
  }
  const tiers={'清晰':'clear','模糊':'ambiguous','边界':'boundary'};
  const observations=data.jev.map((a,i)=>{
    const b=data.laya[i];if(a.text!==b.text||a.expect!==b.expect||a.diff!==b.diff||!tiers[a.diff])throw Error('unpaired_cases');
    const row={case_id:i+1,tier:tiers[a.diff]};
    for(const [key,r] of [['jev',a],['laya',b]]){
      if(typeof r.ms!=='number'||!Number.isFinite(r.ms)||r.ms<0||typeof r.conf!=='number'||r.conf<0||r.conf>1||r.ok!==(r.choice===r.expect)||r.err)throw Error('invalid_observation');
      row[key]={correct:r.choice===r.expect,confidence:r.conf,elapsed_ms:r.ms};
    }
    return row;
  });
  const summary={};for(const key of ['jev','laya']){
    summary[key]={correct:observations.filter(r=>r[key].correct).length,total:40,mean_ms:mean(observations.map(r=>r[key].elapsed_ms)),tiers:{}};
    for(const tier of Object.values(tiers)){const rs=observations.filter(r=>r.tier===tier);summary[key].tiers[tier]={correct:rs.filter(r=>r[key].correct).length,total:rs.length};}
  }
  const escalated=observations.filter(r=>r.laya.confidence<.6);
  return {
    schema:'study-room.laya-research-evidence.v1',as_of:'2026-09-22',
    provenance:'Offline arithmetic on author-published records, not fresh inference or independent attestation of remote execution.',
    fresh_model_calls:0,laya_deployed_in_this_project:false,nanojev_in_community_comparison:false,
    source_files:Object.fromEntries(Object.keys(snapshots).map(k=>[k,{url:`https://github.com/yibie/laya-jev-lab/blob/${commit}/cascade/bench-${k}.json`,sha256:snapshots[k]}])),
    source_commits:{laya:'573e5b62696ba441230cd6be71d593331b5d23af',community:commit,mlx:'0a859518634112655cb97c745dbf04f5191aaf13'},
    checkpoints:[{id:'laya',encoder:'ModernBERT-large',parameters_millions:421,max_sequence_tokens:512,purpose:'English base'},{id:'laya-multilingual',encoder:'mmBERT-base',parameters_millions:322,max_sequence_tokens:1024,purpose:'Multilingual base'},{id:'laya-typed-decisions',encoder:'ModernBERT-large',parameters_millions:421,max_sequence_tokens:1024,purpose:'Task-tuned, not the multilingual checkpoint'}],
    author_typed_decisions:{source_reference:53,cases:400,judgments:2000,accuracy:{english_base:.361,multilingual_base:.342,task_tuned:.766,jev_external_baseline:.727,majority_class:.461},scope:'Author-reported Laya results. Jev was cited from third parties, not rerun alongside Laya; samples/prompts differ. The specialist uses the benchmark training split. Not a matched ranking or our inference.'},
    community:{source_reference:54,summary,observations,settings:{task:'Chinese single-label ticket classification; disputed labels on ambiguous/boundary cases',machine:'Author M4 Max',jev_requested_model:'jev-latest',jev_returned_model_in_raw_records:false,laya_checkpoint:'aac6fef/laya-multilingual-mlx',laya_hf_revision_pinned_in_script:false,local_model_loading_in_latency:false,api_network_in_latency:true},posthoc_cascade:{threshold:.6,escalated:escalated.length,total:40,correct:observations.filter(r=>(r.laya.confidence<.6?r.jev:r.laya).correct).length,estimated_mean_ms:mean(observations.map(r=>r.laya.elapsed_ms+(r.laya.confidence<.6?r.jev.elapsed_ms:0))),scope:'Threshold sweep/replay on the same records, not held-out evaluation or a fresh online cascade.'}},
    mlx_author_report:{source_reference:55,machine:'M3 Max, 40 GPU cores, 128 GiB',precision:'FP16',short_single_question_p50_ms:{english:13.42,multilingual:7.39},loading_in_latency:false,parity_questions:63,checkpoints:3,precisions:2,selected_answer_matches:378,scope:'Author-reported end-to-end short-question latency and limited selection parity, not our measurement or business accuracy.'},
    publication_boundary:'Only numerical observations from public sources; no ticket text, credentials, private receipts or account metadata. Different benchmarks, machines, model versions and calibration settings cannot be collapsed into a three-model ranking.'
  };
}
if(require.main===module){
  try{if(process.argv.length!==4)throw Error('usage: node scripts/jev-laya-evidence.js <public bench-jev.json> <public bench-laya.json>');console.log(JSON.stringify(build(fs.readFileSync(process.argv[2]),fs.readFileSync(process.argv[3])),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={build};

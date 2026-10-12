'use strict';
// Protocol/readout tests with injected scores, not learned strategy evidence.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const core=require('../posts/jev-system-one-research/arena-core'),planner=require('../posts/jev-system-one-research/arena-planner');
const {createArenaProvider,applyPlanner}=require('../scripts/jev-arena-provider'),laya=require('../scripts/jev-laya-provider');
function example(){const game=core.create('laya-planner','step','utility-planner','friendly-fire'),request=core.request(game,0);return {game,request,wire:planner.build(request,game,{decision_delay_ticks:0})};}
test('search-only uses the identical planner values without invented model scores or any provider call',async()=>{
  const {game,request,wire}=example(),evaluate=createArenaProvider({localFetch:()=>assert.fail('no local inference'),copilot:{evaluateTask:()=>assert.fail('no cloud inference')}});
  const r=await evaluate({provider:'search-baseline'},request,new AbortController().signal,game,{planner_wire:wire});
  assert.deepEqual(r.decision,wire.search_only_plan);assert.equal(r.usage.model_requests,0);assert.equal(r.usage.input_tokens,0);assert.equal(r.planner_trace.model_request_dispatched,false);assert.equal(r.planner_trace.binary_gates,null);assert.equal(r.planner_trace.score_kind,'application_search_only');assert.ok(r.planner_trace.plan_scores.every(s=>s.model_score===null&&s.combined_value===s.search_value));
});
test('both Laya checkpoints submit the planner wire and use the shared native readout/trace',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'laya-planner-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const {game,request,wire}=example();
  for(const [provider,spec] of Object.entries(laya.MODELS)){
    const token='b'.repeat(64);await fs.writeFile(path.join(dir,'connection-'+spec.variant+'.json'),JSON.stringify({schema:'study-room.laya-connection.v1',host:'127.0.0.1',port:18998,token,variant:spec.variant,model:spec.model,weights_sha256:spec.sha}),{mode:0o600});let sent=0;
    const gates=Object.fromEntries(wire.shortlist.map((s,i)=>[s.question_id,{p_true:i===0?.1:.9}]));
    const evaluate=createArenaProvider({env:{JEV_LAYA_CONNECTION_DIR:dir},localFetch:async(url,o)=>{
      if(url.endsWith('/api/health'))return Response.json({backend:'study-room-laya-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float16',max_length:1024,runtime_versions:{'laya-mlx':'0.2.0',mlx:'0.32.2'},truncation_policy:'reject_before_inference'});
      sent++;assert.deepEqual(JSON.parse(o.body),wire.request);assert.equal(o.headers['X-Local-Model-Token'],token);
      return Response.json({schema_version:'study-room-laya-mlx-v1',model:spec.model,checkpoint:{weights_sha256:spec.sha,strict_loading:true},states:[{id:'arena',answers:Object.fromEntries(Object.entries(gates).map(([id,g])=>[id,{type:'noul',noul:g.p_true,confidence:.9}]))}],usage:{input_tokens:500,output_tokens:0},rounding:{probabilityDecimals:4,scoreDecimals:4},execution:{runtime:'laya-mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,truncation_applied:false,input_tokens:500,runtime_versions:{'laya-mlx':'0.2.0',mlx:'0.32.2'}}});
    }});
    const r=await evaluate({provider},request,new AbortController().signal,game,{planner_wire:wire}),expected=planner.read(gates,wire);
    assert.equal(sent,1);assert.deepEqual(r.decision,expected.decision);assert.deepEqual(r.planner_trace.plan_scores,expected.plan_scores);assert.equal(r.planner_trace.model_changed_plan,expected.model_changed_plan);assert.equal(r.planner_trace.model_request_dispatched,true);assert.equal(r.planner_trace.assumptions.horizon_ticks,24);assert.equal(r.raw_model_response.model,spec.model);
    const reference=applyPlanner({binary_gates:gates,usage:{scope:'fixture'}},request,wire);assert.deepEqual(reference.planner_trace.plan_scores,r.planner_trace.plan_scores);
  }
});
test('missing or out-of-range planner scores fail instead of falling back to pure search',()=>{
  const {request,wire}=example();assert.throws(()=>applyPlanner({binary_gates:{},usage:{scope:''}},request,wire));
  const gates=Object.fromEntries(wire.shortlist.map(s=>[s.question_id,{p_true:1.1}]));assert.throws(()=>applyPlanner({binary_gates:gates,usage:{scope:''}},request,wire));
});
test('normal UI defaults to planner/v7 and exposes only one justified input ablation',async()=>{
  const html=await fs.readFile(path.resolve(__dirname,'../posts/jev-system-one-research/index.html'),'utf8');
  const profiles=html.match(/<select id="jev-arena-input-profile">([\s\S]*?)<\/select>/)[1];assert.deepEqual([...profiles.matchAll(/value="([^"]+)"/g)].map(m=>m[1]),['utility-planner','raw']);assert.match(profiles,/value="utility-planner" selected/);
  const rules=html.match(/<select id="jev-arena-ruleset">([\s\S]*?)<\/select>/)[1];assert.match(rules,/value="friendly-fire" selected/);assert.equal((rules.match(/<option /g)||[]).length,1);
  assert.match(html,/纯搜索.*去掉模型评分/);assert.match(html,/历史记录仍按原协议读取/);
});

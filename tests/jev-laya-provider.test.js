'use strict';
// Injected transport responses only. These fixtures do not measure Laya quality.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const laya=require('../scripts/jev-laya-provider'),registry=require('../posts/jev-system-one-research/model-registry');
const arena=require('../posts/jev-system-one-research/arena-core'),{normalizeLaya}=require('../scripts/jev-arena-provider');
const {validateConfig}=require('../scripts/jev-arena');
const spec=laya.MODELS['laya-multilingual'];
function health(){return {backend:'study-room-laya-mlx-v1',ready:true,model_loaded:true,model:spec.model,weights_sha256:spec.sha,network_model_calls:0,device:'mlx-metal-gpu',activation_dtype:'float16',max_length:1024,runtime_versions:{'laya-mlx':'0.2.0',mlx:'0.32.2'},truncation_policy:'reject_before_inference'};}
function response(req){return {schema_version:'study-room-laya-mlx-v1',model:spec.model,checkpoint:{weights_sha256:spec.sha,strict_loading:true},rounding:{probabilityDecimals:4,scoreDecimals:4},usage:{input_tokens:200,output_tokens:0},execution:{runtime:'laya-mlx',device:'metal-gpu',network_model_calls:0,autoregressive_decode_steps:0,truncation_applied:false,input_tokens:200,runtime_versions:{'laya-mlx':'0.2.0',mlx:'0.32.2'}},states:req.states.map(s=>({id:s.id,answers:Object.fromEntries(Object.entries(s.questions).map(([id,q])=>[id,q.type==='boolean'?{type:'noul',noul:.8,confidence:.8}:q.type==='choice'?{type:'choice',choice:Object.keys(q.criteria)[0],probabilities:Object.fromEntries(Object.keys(q.criteria).map((k,i)=>[k,i===0?1:0])),confidence:1}:{type:'score',score:0,probabilities:Object.fromEntries(q.criteria.map((_,i)=>[String(i),i===0?1:0])),legend:Object.fromEntries(q.criteria.map((v,i)=>[String(i),v])),confidence:1}]))}))};}
test('catalog enables Laya planner ranking but rejects unadapted legacy utility profiles',()=>{
  assert.equal(registry.models.length,4);assert.ok(Object.isFrozen(registry.models));assert.equal(registry.supports('laya-multilingual','support'),true);assert.equal(registry.supports('laya-multilingual','arena','utility-planner'),true);assert.equal(registry.supports('laya-multilingual','arena','utility-tactics'),false);
  assert.throws(()=>validateConfig({seed:'x',control:'step',mode:'sync',ruleset:'tactical',input_profile:'utility-tactics',duration_s:30,max_decisions:1,teams:[{provider:'laya-multilingual'},{provider:'nanojev-fp32'}],consent:true}),/unsupported_model_capability/);
});
test('Laya raw provenance/rounding are retained and Noul maps explicitly to internal Boolean gates',()=>{
  const req={states:[{id:'arena',state:'fixture',questions:{need:{type:'boolean',instructions:'Is it present?'}}}]},raw=response(req),r=normalizeLaya(raw,req,spec);assert.equal(r.binary_gates.need.p_true,.8);assert.equal(r.raw_model_response.states[0].answers.need.type,'noul');assert.match(r.binary_gates.need.source,/derived/);
  for(const patch of [{model:'wrong'},{checkpoint:{weights_sha256:'0'.repeat(64),strict_loading:true}},{usage:{input_tokens:null,output_tokens:0}}])assert.throws(()=>laya.validateWire({...raw,...patch},req,spec),/local_invalid_response/);
  raw.states[0].answers.need.noul=NaN;assert.throws(()=>laya.validateWire(raw,req,spec));
});
test('choice contracts validate model identity and reject invented candidate/extra answers',()=>{
  const req=arena.request(arena.create('fixture','step'),0),raw=response(req),r=normalizeLaya(raw,req,spec);assert.ok(r.decision.B0);raw.states[0].answers.extra={type:'noul',noul:1,confidence:1};assert.throws(()=>normalizeLaya(raw,req,spec));
});
test('local Laya transport uses private token, reports own scope and does not leak its connection',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'laya-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const token='a'.repeat(64),file=path.join(dir,'connection-multilingual.json');
  await fs.writeFile(file,JSON.stringify({schema:'study-room.laya-connection.v1',host:'127.0.0.1',port:18998,token,variant:spec.variant,model:spec.model,weights_sha256:spec.sha}),{mode:0o600});let calls=0;
  const p=laya.createProvider({env:{JEV_LAYA_CONNECTION_DIR:dir},localFetch:async(url,o)=>{if(url.endsWith('/api/health'))return Response.json(health());assert.equal(o.headers['X-Local-Model-Token'],token);calls++;return Response.json(response(JSON.parse(o.body)));}});
  assert.equal((await p.status('laya-multilingual')).ready,true);const r=await p.evaluate('laya-multilingual','fixture',new AbortController().signal);assert.equal(calls,1);assert.equal(r.response.model,spec.model);assert.equal(r.response.answers.team.confidence,1);assert.equal(r.response.answers.enough_info.noul,.8);assert.ok(!JSON.stringify(r).includes(token));assert.match(r.transport,/laya/);
  await fs.chmod(file,0o644);assert.equal((await p.status('laya-multilingual')).ready,false);
});
test('local GPU lane serializes different providers and does not dispatch a cancelled queued call',async()=>{
  const lane=require('../scripts/jev-local-queue');let release,started=0;const a=new AbortController(),b=new AbortController();const first=lane.run(a.signal,()=>new Promise(r=>{started++;release=r;}));await new Promise(r=>setImmediate(r));
  const second=lane.run(b.signal,async()=>{started++;});b.abort();const rejected=assert.rejects(second,/cancelled/);assert.equal(started,1);release();await first;await rejected;assert.equal(started,1);
});
test('different local models share the arena GPU resource rather than racing for Metal',async t=>{
  const {createArenaManager}=require('../scripts/jev-arena');const calls=[],release=[];const m=createArenaManager({auto:false,evaluate:async(team,req)=>{calls.push(team.provider);return new Promise(r=>release.push(()=>r({ok:true,raw_model_response:team.provider==='laya-multilingual'?{...response(req),secret:'must-not-export'}:null,decision:Object.fromEntries(Object.entries(req.states[0].questions).map(([id,q])=>[id,Object.keys(q.criteria)[0]]))})));}});t.after(()=>m.close());
  const r=m.start({seed:'shared-gpu',mode:'realtime',control:'step',duration_s:30,max_decisions:1,teams:[{provider:'laya-multilingual'},{provider:'nanojev-fp32'}],consent:true});m.pulse();assert.deepEqual(calls,['laya-multilingual']);assert.equal(m.view(r.id).metrics[1].requests,0);release[0]();await new Promise(r=>setImmediate(r));assert.deepEqual(calls,['laya-multilingual','nanojev-fp32']);release[1]();await new Promise(r=>setImmediate(r));m.stop(r.id);
  const diagnostic=require('../posts/jev-system-one-research/arena-report').create(m.latest());assert.equal(diagnostic.decisions[0].local_model_runtime.model,spec.model);assert.equal(diagnostic.decisions[0].local_model_runtime.versions['laya-mlx'],'0.2.0');assert.equal(diagnostic.decisions[0].local_model_runtime.confidence.B0,1);assert.ok(!JSON.stringify(diagnostic).includes('must-not-export'));
});
module.exports={health,response};

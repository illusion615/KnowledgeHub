'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const core=require('../posts/jev-system-one-research/playground-core');
const lane=require('./jev-local-queue');
const MODELS={
  'laya-multilingual':{family:'laya',variant:'multilingual',model:'aac6fef/laya-multilingual-mlx',sha:'7fc5834af4d8fdfb268d272a9d1a66e5819a0daac98241651c4c888cc43adff1'},
  'laya-typed-decisions':{family:'laya',variant:'typed-decisions',model:'aac6fef/laya-typed-decisions-mlx',sha:'804ef8802b4cac7a67913b0cfb8448659e934a50284aaa867b98d7d9a6e7d1e0'}
};
const fail=(code,status=503)=>Object.assign(new Error(code),{code,status});
function connectionFor(provider,env=process.env){
  if(!Object.hasOwn(MODELS,provider))throw fail('invalid_provider',400);const spec=MODELS[provider];
  const file=path.join(env.JEV_LAYA_CONNECTION_DIR||path.join(os.homedir(),'.cache/study-room/laya-mlx'),'connection-'+spec.variant+'.json');let c;
  try{const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>8192||(st.mode&0o077)||process.getuid&&st.uid!==process.getuid())throw Error();c=JSON.parse(fs.readFileSync(file,'utf8'));}catch(_){throw fail('local_service_unavailable');}
  if(c.schema!=='study-room.laya-connection.v1'||c.host!=='127.0.0.1'||!Number.isInteger(c.port)||c.port<1||c.port>65535||!/^[a-f0-9]{64}$/.test(c.token||'')||c.variant!==spec.variant||c.model!==spec.model||c.weights_sha256!==spec.sha)throw fail('local_connection_invalid');
  return {origin:'http://127.0.0.1:'+c.port,token:c.token,spec};
}
function validateHealth(h,spec){
  if(!h||h.backend!=='study-room-laya-mlx-v1'||h.ready!==true||h.model_loaded!==true||h.model!==spec.model||h.weights_sha256!==spec.sha||h.network_model_calls!==0||h.device!=='mlx-metal-gpu'||h.activation_dtype!=='float16'||h.max_length!==1024||h.runtime_versions?.['laya-mlx']!=='0.2.0'||h.runtime_versions?.mlx!=='0.32.2'||h.truncation_policy!=='reject_before_inference')throw fail('local_connection_invalid');return h;
}
const object=v=>v&&typeof v==='object'&&!Array.isArray(v),unit=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
function validateWire(raw,request,spec){
  const ex=raw?.execution;
  if(raw?.schema_version!=='study-room-laya-mlx-v1'||raw.model!==spec.model||raw.checkpoint?.weights_sha256!==spec.sha||raw.checkpoint.strict_loading!==true||ex?.runtime!=='laya-mlx'||ex.device!=='metal-gpu'||ex.network_model_calls!==0||ex.autoregressive_decode_steps!==0||ex.truncation_applied!==false||ex.runtime_versions?.['laya-mlx']!=='0.2.0'||ex.runtime_versions?.mlx!=='0.32.2'||!Number.isSafeInteger(raw.usage?.input_tokens)||raw.usage.input_tokens<0||raw.usage.input_tokens>16384||raw.usage.output_tokens!==0||ex.input_tokens!==raw.usage.input_tokens||raw.rounding?.probabilityDecimals!==4||raw.rounding?.scoreDecimals!==4||!Array.isArray(raw.states)||raw.states.length!==request.states.length||new Set(raw.states.map(s=>s?.id)).size!==raw.states.length)throw fail('local_invalid_response',502);
  for(const row of request.states){const got=raw.states.find(s=>s?.id===row.id);if(!object(got?.answers)||Object.keys(got.answers).sort().join()!==Object.keys(row.questions).sort().join())throw fail('local_invalid_response',502);
    for(const [id,q] of Object.entries(row.questions)){
      const a=got.answers[id];if(!object(a)||a.type!==(q.type==='boolean'?'noul':q.type)||!unit(a.confidence))throw fail('local_invalid_response',502);
      if(q.type==='boolean'){if(!unit(a.noul))throw fail('local_invalid_response',502);continue;}
      const keys=q.type==='choice'?Object.keys(q.criteria):q.criteria.map((_,i)=>String(i));
      if(!object(a.probabilities)||Object.keys(a.probabilities).sort().join()!==keys.slice().sort().join()||!keys.every(k=>unit(a.probabilities[k]))||Math.abs(keys.reduce((n,k)=>n+a.probabilities[k],0)-1)>keys.length*.00005+1e-8)throw fail('local_invalid_response',502);
      if(q.type==='choice'&&(!keys.includes(a.choice)||keys.some(k=>a.probabilities[k]>a.probabilities[a.choice]+1e-6)))throw fail('local_invalid_response',502);
      if(q.type==='score'&&(typeof a.score!=='number'||!Number.isFinite(a.score)||a.score<0||a.score>keys.length-1||Math.abs(a.score-keys.reduce((n,k)=>n+Number(k)*a.probabilities[k],0))>.005||JSON.stringify(a.legend)!==JSON.stringify(Object.fromEntries(q.criteria.map((v,i)=>[String(i),v])))))throw fail('local_invalid_response',502);
    }
  }
  return raw;
}
function createProvider(options={}){
  const env=options.env||process.env,fetchImpl=options.localFetch||globalThis.fetch;
  async function health(c){const r=await fetchImpl(c.origin+'/api/health',{redirect:'error',signal:AbortSignal.timeout(2500)});if(!r.ok)throw fail('local_service_unavailable');return validateHealth(await r.json(),c.spec);}
  async function status(provider){const spec=MODELS[provider];try{const c=connectionFor(provider,env),h=await health(c);return {model:spec.model,local:true,configured:true,sdk_ready:true,ready:true,credential_issue:null,readiness:{authentication:'local_runtime_loaded',model_access:'loaded',model_inference_performed:false},runtime:{device:h.device,activation_dtype:h.activation_dtype,max_length:h.max_length,weights_sha256:spec.sha,versions:h.runtime_versions}};}catch(e){return {model:spec.model,local:true,configured:false,sdk_ready:false,ready:false,credential_issue:null,local_error:e.code||'local_service_unavailable'};}}
  async function checkAuthentication(provider){const c=connectionFor(provider,env);await health(c);const r=await fetchImpl(c.origin+'/api/auth-check',{headers:{'X-Local-Model-Token':c.token},redirect:'error',signal:AbortSignal.timeout(2500)}),d=await r.json();if(!r.ok||d.backend!=='study-room-laya-mlx-v1'||d.authenticated!==true)throw fail('local_connection_invalid');return {provider,authentication:'verified',model_access:'local_model_loaded',model_inference_performed:false,code:'authentication_verified'};}
  async function evaluateWire(provider,request,signal){return lane.run(signal,async()=>{
    const c=connectionFor(provider,env);await health(c);if(signal?.aborted)throw fail('cancelled');
    let r;try{r=await fetchImpl(c.origin+'/api/evaluate',{method:'POST',redirect:'error',signal:AbortSignal.timeout(180000),headers:{'Content-Type':'application/json','X-Local-Model-Token':c.token},body:JSON.stringify(request)});}catch(_){throw fail('local_service_unavailable');}
    if(!r.ok)throw fail(r.status===400||r.status===413?'local_input_limit':r.status===429?'busy':'local_inference_failed',r.status===400?400:503);
    return validateWire(await r.json(),request,c.spec);
  });}
  async function evaluate(provider,state,signal){const r=core.buildRequest(state);r.questions.enough_info.type='boolean';const request={states:[{id:'playground',state:r.state.request,questions:r.questions}]};const raw=await evaluateWire(provider,request,signal),a=raw.states[0].answers;
    const response=core.validateResponse({model:raw.model,answers:{team:a.team,enough_info:{type:'noul',noul:a.enough_info.noul},severity:a.severity},usage:raw.usage,rounding:raw.rounding});
    return {request,response,transport:'local-laya-mlx-http',sdk_versions:raw.execution.runtime_versions,confidence_source:'Laya runtime statistics (Choice/Score entropy, Noul max(p,1-p)); not correctness probability',score_legend_source:'request criteria',local_execution:raw.execution,weights_sha256:MODELS[provider].sha,weights_integrity_verified:true,billing_usd:0,billing_scope:'No external model API charge; local compute excluded',raw_response:raw};
  }
  return {status,checkAuthentication,evaluate,evaluateWire};
}
module.exports={MODELS,connectionFor,validateHealth,validateWire,createProvider};

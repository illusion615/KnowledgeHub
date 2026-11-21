'use strict';
const crypto=require('node:crypto'),{performance}=require('node:perf_hooks');
const core=require('../posts/jev-system-one-research/support-core');
const registry=require('../posts/jev-system-one-research/model-registry');
const timing=require('../posts/jev-system-one-research/arena-timing');
const {validModel,jsonFromOutput}=require('./jev-copilot-provider');
const copy=v=>JSON.parse(JSON.stringify(v));
const fail=(code,status=400)=>Object.assign(new Error(code),{code,status});
function validateConfig(v){
  if(!v||Array.isArray(v)||Object.keys(v).some(k=>!['seed','cases','language','local_provider','model','deadline_s','routing_mode','consent'].includes(k))||v.consent!==true)throw fail('consent_required');
  if(typeof v.seed!=='string'||!/^[a-zA-Z0-9_-]{1,32}$/.test(v.seed)||![1,2,3].includes(v.cases)||!['zh','en'].includes(v.language)||!registry.supports(v.local_provider,'support')||!validModel(v.model)||![30,60,120].includes(v.deadline_s)||v.routing_mode!==undefined&&!['native','rules_llm'].includes(v.routing_mode))throw fail('invalid_input');
  return {...copy(v),routing_mode:v.routing_mode||'native'};
}
function createSupportManager(options){
  const now=options.now||(()=>performance.now());let session=null;
  const safeCodes=new Set(['cancelled','copilot_disabled','copilot_unavailable','copilot_incompatible','copilot_failed','copilot_invalid_response','copilot_timeout','copilot_output_limit','local_service_unavailable','local_connection_invalid','local_input_limit','local_inference_failed','local_invalid_response','busy','support_invalid_route','support_invalid_reply','support_timeout']);
  const native=options.nativeEvaluate||require('./jev-arena-provider').createArenaProvider({});
  function requireSession(id){if(!session||session.id!==id)throw fail('support_not_found',404);return session;}
  function busy(){return !!session&&(session.status==='running'||session.pending>0);}
  function emit(s,event){if(session!==s)return;const seq=++s.event_seq;for(const fn of s.listeners){try{fn(event?{...event,seq}:{type:'snapshot',seq,record:view(s.id,false)});}catch(_){s.listeners.delete(fn);}}}
  function stopSession(s,reason){
    if(s.status!=='running')return;s.status='stopped';s.reason=reason;s.finished_at=new Date().toISOString();s.wall_ms=Math.round(now()-s.began);
    for(const side of ['hybrid','llm']){if(s.phases[side]==='admission')s.phases[side]='stopped';else if(['native','workflow','llm'].includes(s.phases[side]))s.phases[side]='cancelling';}
    s.controller.abort();clearInterval(s.leaseTimer);emit(s);
  }
  function wait(s,ms){return new Promise(resolve=>{if(s.controller.signal.aborted)return resolve();const done=()=>{clearTimeout(timer);s.controller.signal.removeEventListener('abort',done);resolve();},timer=setTimeout(done,ms);s.controller.signal.addEventListener('abort',done,{once:true});});}
  async function admit(s,row){
    const began=now();s.phases[row.side]='admission';emit(s);
    while(s.status==='running'&&options.admit&&!options.admit())await wait(s,250);
    row.rate_wait_ms+=Math.max(0,now()-began);s.rate_wait_ms+=Math.max(0,now()-began);
    if(s.controller.signal.aborted)throw fail('cancelled');
  }
  async function infer(s,row,kind,request,fn){
    if(s.controller.signal.aborted)throw fail('cancelled');
    s.phases[row.side]=kind;const stage={kind,dispatched:true,status:'running',request,usage:null,started_ms:Math.round(now()-s.began)},began=now();row.stages.push(stage);emit(s);
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),s.config.deadline_s*1000),signal=AbortSignal.any([s.controller.signal,abort.signal]);
    try{
      const result=await fn(signal);stage.usage=core.usage(result?.usage,kind);stage.requested_model=result?.requested_model||null;stage.model_identity_verified=result?.model_identity_verified===true;
      stage.telemetry=timing.normalize({...result?.telemetry,cli:result?.process_telemetry,api_duration_ms:result?.usage?.api_duration_ms});
      if(result?.streaming)stage.streaming={...result.streaming};
      if(signal.aborted)throw fail(s.controller.signal.aborted?'cancelled':'support_timeout');
      if(!result?.ok)throw fail(safeCodes.has(result?.error)?result.error:kind==='native'?'local_invalid_response':'copilot_failed');
      stage.status='completed';return result;
    }catch(e){stage.status='failed';stage.error=s.controller.signal.aborted?'cancelled':abort.signal.aborted?'support_timeout':safeCodes.has(e.code||e.message)?e.code||e.message:'support_failed';if(s.status==='running')stopSession(s,'provider_error');throw fail(stage.error);}
    finally{clearTimeout(timeout);stage.elapsed_ms=Math.round(now()-began);emit(s);}
  }
  async function sideTurn(s,side,story,turn,shared,started){
    s.pending++;const row={side,case_id:story.id,turn:turn+1,customer:story.messages[turn],context:copy(shared),stages:[],workflow_trace:[],rate_wait_ms:0,ok:false,elapsed_ms:null,first_content_ms:null,check:null,reply:null,stream:null};
    const rowIndex=s.rows[side].push(row)-1,history=s.histories[side];history.push({role:'customer',text:row.customer});emit(s);
    try{
      let plan=null,answer;
      if(side==='hybrid'){
        s.phases[side]='workflow';const ruled=core.rules(shared,s.workflow);
        row.workflow_trace.push({node:'rules',state_before:copy(s.workflow),result:ruled});
        if(ruled){plan=ruled;row.path=ruled.reason;}
        else if(s.config.routing_mode==='rules_llm'){row.path='rules_llm_ablation';}
        else{
          const req=core.nativeRequest(shared),r=await infer(s,row,'native',req,signal=>native({provider:s.config.local_provider},req,signal));
          row.route_gate=core.routeGate(r,shared);
          row.native={provider:s.config.local_provider,model:r.requested_model||null,binary_gates:copy(r.binary_gates),question_mapping:core.questionMap(shared),weights_sha256:r.weights_sha256||null,raw_model_response:r.raw_model_response||null};
          row.workflow_trace.push({node:'independent_boolean_gates',result:row.route_gate});
          plan=core.planFromGate(row.route_gate,shared);
          row.path=plan.branches.some(b=>b.status!=='ready')?'native_partial_clarification':'native_multi_fast';
        }
      }else row.path='llm_only';
      let decisionPlan=plan;const review=plan?core.reviewNeeded(plan,shared):null;
      if(plan){row.plan=plan;row.workflow_trace.push({node:'branch_plan',branches:copy(plan.branches)});if(row.native)row.native_check={...core.grade(story,shared,{branches:plan.branches},plan),reply_faithfulness:'not_applicable_no_reply'};}
      if(review){row.semantic_review=copy(review);row.path='native_semantic_review';row.workflow_trace.push({node:'internal_semantic_review',reason:review.reason,known_order_ids:review.known_order_ids});}
      if(plan&&!shared.needs_explanation&&!review){
        s.phases[side]='workflow';const began=now();
        answer={branches:plan.branches,reply:core.approvedReply(plan,shared,s.config.language)};
        if(answer.reply.length>600)throw fail('support_invalid_reply');
        row.stages.push({kind:'workflow',dispatched:false,status:'completed',elapsed_ms:Math.round(now()-began),owner:'approved_multi_branch_template'});
        row.reply_origin='approved_template';row.decision_source=plan.owner;row.first_content_ms=Math.round(now()-started);
      }else{
        if(typeof options.copilot.evaluateStreamTask!=='function')throw fail('copilot_incompatible');
        await admit(s,row);
        const verbalize=plan&&!review,prompt=review?core.reviewPrompt(shared,copy(history),s.config.language,review):core.prompt(verbalize?'hybrid':'llm',shared,copy(history),s.config.language,plan),parse=review?v=>core.validateReview(v,shared,review):verbalize?core.validateVerbalization:v=>core.validateReply(v,shared);
        if(verbalize){row.verbalization_brief=core.verbalizationBrief(plan,shared,s.config.language);row.path='explain_resolved_branches';}
        const request={model:s.config.model,role:review?'verify_native_uncertainty':verbalize?'explain_resolved_branches':'decide_multi_branches',response_contract:verbalize?'reply_only':'reply_first_branches',prompt,prompt_characters:prompt.length,stream:true,reasoning_control:'provider_default_not_overridden'};
        const r=await infer(s,row,'llm',request,signal=>options.copilot.evaluateStreamTask(s.config.model,prompt,stdout=>parse(jsonFromOutput(stdout)),signal,text=>{
          if(signal.aborted||s.status!=='running')return;
          if(typeof text!=='string'||text.length>600||row.stream&&!text.startsWith(row.stream.text))throw fail('support_invalid_reply');
          if(!text)return;if(row.first_content_ms===null)row.first_content_ms=Math.round(now()-started);
          row.stream={text,status:'draft',source:'cli_message_delta',updates:(row.stream?.updates||0)+1};
          emit(s,{type:'reply_delta',id:s.id,side,row_index:rowIndex,stream:copy(row.stream),first_content_ms:row.first_content_ms});
        }));
        const output=parse(r.decision);row.llm_output=copy(output);
        if(review){decisionPlan=core.reviewedPlan(output,review);row.resolved_plan=copy(decisionPlan);}
        answer=decisionPlan?{reply:output.reply,branches:decisionPlan.branches}:output;row.decision_source=decisionPlan?decisionPlan.owner:'llm';row.reply_origin='llm';
        if(row.stream&&!answer.reply.startsWith(row.stream.text))throw fail('support_invalid_reply');
        if(row.stream)row.stream.status='validated';
        if(row.first_content_ms===null)row.first_content_ms=Math.round(now()-started);
      }
      if(s.controller.signal.aborted)throw fail('cancelled');
      row.reply=answer.reply;row.decision={branches:copy(answer.branches)};row.check=core.grade(story,shared,answer,decisionPlan);row.check.reply_faithfulness=row.reply_origin==='approved_template'?'application_template':'not_automatically_verified';row.ok=true;
      if(side==='hybrid'){
        if(!decisionPlan||decisionPlan.intent_evaluated!==false)s.workflow={branches:copy(answer.branches),order_ids:core.orderIds(shared).slice(),unresolved:answer.branches.some(b=>['ask_order','clarify_order','clarify_request'].includes(b.action)||b.status==='uncertain_intent'),waiting_single_order:core.waitingSingleOrder({branches:answer.branches},shared),source:row.decision_source};
      }
      history.push({role:'assistant',text:answer.reply});s.phases[side]='done';
    }catch(e){row.error=safeCodes.has(e.code||e.message)?e.code||e.message:'support_failed';if(row.stream)row.stream.status=row.error==='cancelled'?'cancelled':'rejected';s.phases[side]='error';if(s.status==='running')stopSession(s,'provider_error');}
    finally{row.elapsed_ms=Math.round(now()-started);s.pending--;emit(s);}
  }
  async function run(s){
    try{
      for(let caseIndex=0;caseIndex<s.story.cases.length;caseIndex++){
        const story=s.story.cases[caseIndex];s.case_index=caseIndex;s.histories={hybrid:[],llm:[]};s.workflow={};
        for(let turn=0;turn<story.messages.length;turn++){
          if(s.status!=='running')return;s.turn_index=turn;
          const shared=core.context(story,turn),started=now(),order=s.completed_pairs%2?['llm','hybrid']:['hybrid','llm'];
          await Promise.all(order.map(side=>sideTurn(s,side,story,turn,shared,started)));
          if(s.status!=='running')return;s.completed_pairs++;emit(s);if(s.completed_pairs<s.story.turns)await wait(s,options.pacingMs??500);
        }
      }
      if(s.status==='running'){s.status='completed';s.reason='completed';s.finished_at=new Date().toISOString();s.wall_ms=Math.round(now()-s.began);clearInterval(s.leaseTimer);emit(s);}
    }catch(_){stopSession(s,'support_failed');}
  }
  function start(config){
    if(busy())throw fail('busy',429);config=validateConfig(config);const began=now();
    const s=session={id:crypto.randomUUID(),config,story:core.generate(config.seed,config.cases,config.language),status:'running',reason:null,started_at:new Date().toISOString(),finished_at:null,began,heartbeat:began,controller:new AbortController(),pending:0,case_index:0,turn_index:0,completed_pairs:0,rate_wait_ms:0,rows:{hybrid:[],llm:[]},histories:{hybrid:[],llm:[]},workflow:{},event_seq:0,phases:{hybrid:'workflow',llm:'admission'},listeners:new Set()};
    s.leaseTimer=setInterval(()=>{if(now()-s.heartbeat>(options.leaseMs||5000))stopSession(s,'viewer_disconnected');else if(now()-s.began>15*60*1000)stopSession(s,'wall_time_limit');},250);
    void run(s);return view(s.id);
  }
  function view(id,touch=true){
    const s=requireSession(id);if(touch)s.heartbeat=now();
    return copy({schema:'study-room.support-match.v1',version:core.version,event_seq:s.event_seq,id:s.id,config:s.config,status:s.status,reason:s.reason,started_at:s.started_at,finished_at:s.finished_at,wall_ms:s.wall_ms??Math.round(now()-s.began),pending:s.pending,case_index:s.case_index,turn_index:s.turn_index,completed_pairs:s.completed_pairs,total_pairs:s.story.turns,rate_wait_ms:s.rate_wait_ms,phases:s.phases,story:{seed:s.story.seed,language:s.story.language,provenance:s.story.provenance,cases:s.story.cases.map(c=>({id:c.id,title:c.title,customer:c.customer,product:c.product,messages:c.messages}))},rows:s.rows,metrics:{hybrid:core.metrics(s.rows.hybrid),llm:core.metrics(s.rows.llm)},scope:'v5 quality-gated multi-intent workflow: same underlying customer inputs and requested LLM. The explicitly selected local model uses one batched request of independent Boolean questions for each intent/order pair, unbound intents, and uncovered needs. There is no single-choice argmax, cross-label sum constraint, top-two margin or multiple-issues bypass. Gates >=.8 present / <=.2 absent are uncalibrated demo thresholds per question. Each confirmed branch uses its own order facts and policy; native uncertainty (including inferred unknown associations) triggers one explicit internal LLM semantic review using the actual customer text and known order facts, not a generic customer-facing clarification. Locked confirmed branches must be retained exactly; other reviewed decisions are attributed to the LLM, not the local decision model. Genuine missing order/ledger facts can still use a focused template. Review calls are charged to latency and tokens, not counted as fast paths; no learned accuracy or speedup is claimed. A unique requested order slot can resume the known single-branch workflow when supplied. At most two mentioned order IDs are modeled; excess scope is explicitly clarified, not silently truncated. Explanation-only LLM calls receive confirmed branch and factual missing-slot summaries and return only reply; they cannot replace branch decisions. Baseline and rules+LLM ablation return multi-branch intent/order/action arrays, not a single other/human_review for all multi-intent inputs. Rules+LLM ablation disables the selected local model. Templates are not model-generated and are emitted atomically. Streamed reply text is an unvalidated draft until final JSON checks; no real business actions occur. Both LLM branches use CLI --stream on, no tools, same limits and provider-default reasoning settings. CLI processes remain fresh; no persistent-session or direct-API speedup is claimed. First-content timestamps are backend emissions, not browser paint or proof of useful/correct content; invalid drafts are excluded from successful-turn latency distributions but retained with rejection labels. Completed latency includes native/workflow/CLI/network and per-side admission wait; rate_wait_ms sums side waits and is not additive wall time. Only actually dispatched model stages count toward usage; unknown tokens remain unknown, cache/reasoning are not double-added. Local and cloud tokens differ in scope. Synthetic structured checks, no general accuracy or guaranteed superiority. Gold never repairs model outputs. No retries or transport-error/provider substitution; semantic uncertainty review is an explicit workflow branch, not an error fallback. Stop and viewer lease still apply.'});
  }
  function subscribe(id,listener){const s=requireSession(id);if(s.listeners.size>=4)throw fail('busy',429);s.listeners.add(listener);listener({type:'snapshot',seq:s.event_seq,record:view(id,false)});return ()=>s.listeners.delete(listener);}
  return {start,view,subscribe,busy,stop:id=>{const s=requireSession(id);stopSession(s,'user_stopped');return view(id);},close:()=>{if(session){stopSession(session,'server_closed');session.listeners.clear();}}};
}
module.exports={version:core.version,validateConfig,createSupportManager};

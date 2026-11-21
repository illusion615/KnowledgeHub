'use strict';
const local = require('./jev-local-provider');
const layaModule = require('./jev-laya-provider');
const localLane = require('./jev-local-queue');
const cli = require('./jev-copilot-provider');
const arena = require('../posts/jev-system-one-research/arena-core');
const task = require('../posts/jev-system-one-research/arena-task');
const timing = require('../posts/jev-system-one-research/arena-timing');
const { performance } = require('node:perf_hooks');
const fail = code => Object.assign(new Error(code), { code });
function normalize(raw, request, spec) {
  const row = raw?.states?.[0], execution = raw?.execution;
  if (raw?.schema_version !== 'study-room-nanojev-mlx-v1' || raw.model !== spec.model || !Array.isArray(raw.states) || raw.states.length !== request.states.length || raw.states.length < 1 || raw.states.length > 2 || raw.states.map(s=>s?.id).sort().join() !== request.states.map(s=>s.id).sort().join() || raw.checkpoint?.weights_sha256 !== spec.sha || raw.checkpoint.strict_loading !== true || execution?.runtime !== 'mlx' || execution.device !== 'metal-gpu' || execution.network_model_calls !== 0 || execution.autoregressive_decode_steps !== 0 || !Number.isInteger(execution.candidate_path_tokens) || execution.candidate_path_tokens < 0 || execution.candidate_path_tokens > 16384) throw fail('local_invalid_response');
  const questions = request.states[0].questions, plan = {}, probabilities = {};
  if(request.states.some(s=>!s.questions||!Object.keys(s.questions).length))throw fail('local_invalid_response');
  if(request.states.every(s=>Object.values(s.questions).every(q=>q.type==='boolean'))) {
    const gates={};
    for(const state of request.states){
      const answers=raw.states.find(s=>s.id===state.id)?.answers;
      if(!answers||Object.keys(answers).sort().join()!==Object.keys(state.questions).sort().join())throw fail('local_invalid_response');
      for(const id of Object.keys(state.questions)){
      if(Object.prototype.hasOwnProperty.call(gates,id))throw fail('local_invalid_response');
      const a=answers[id],p=a?.probabilities;
      if(a?.type!=='boolean'||!p||Object.keys(p).sort().join()!=='false,true'||typeof a.p_true!=='number'||!Number.isFinite(a.p_true)||a.p_true<0||a.p_true>1||typeof p.true!=='number'||typeof p.false!=='number'||!Number.isFinite(p.true)||!Number.isFinite(p.false)||p.true<0||p.true>1||p.false<0||p.false>1||Math.abs(p.true+p.false-1)>1e-5||Math.abs(a.p_true-p.true)>1e-6||typeof a.value!=='boolean'||a.value!==(p.true>p.false))throw fail('local_invalid_response');
      gates[id]={p_true:a.p_true,value:a.value,probabilities:{false:p.false,true:p.true}};
      }
    }
    return {ok:true,binary_gates:gates,requested_model:spec.model,weights_sha256:spec.sha,telemetry:{native:timing.native(execution)},usage:{input_tokens:execution.candidate_path_tokens,output_tokens:0,billing_usd:0,scope:'Native Boolean probe; no action executed. Local candidate-path tokens, not cloud billed tokens.'}};
  }
  if (raw.states.length!==1 || row.id!=='arena' || !row.answers || Object.keys(row.answers).sort().join() !== Object.keys(questions).sort().join()) throw fail('local_invalid_response');
  for (const [id, question] of Object.entries(questions)) {
    const answer = row.answers[id], keys = Object.keys(question.criteria);
    if (answer?.type !== 'choice' || !keys.includes(answer.choice) || !answer.probabilities || Object.keys(answer.probabilities).sort().join() !== keys.sort().join()) throw fail('local_invalid_response');
    let sum = 0; const distribution = {};
    for (const key of keys) {
      const p = answer.probabilities[key];
      if (typeof p !== 'number' || !Number.isFinite(p) || p < 0 || p > 1 || p > answer.probabilities[answer.choice] + 1e-6) throw fail('local_invalid_response');
      sum += p; distribution[key] = p;
    }
    if (Math.abs(sum - 1) > 0.001) throw fail('local_invalid_response');
    plan[id] = answer.choice; probabilities[id] = distribution;
  }
  return { ok: true, decision: arena.validatePlan(plan, request), probabilities, requested_model: spec.model, weights_sha256: spec.sha, telemetry:{native:timing.native(execution)},
    usage: { input_tokens: execution.candidate_path_tokens, output_tokens: 0, billing_usd: 0, scope: 'Local candidate-path tokens with repeated prefixes; not cloud billed tokens. Hardware costs excluded.' } };
}
function normalizeLaya(raw, request, spec) {
  layaModule.validateWire(raw, request, spec);
  const result={ok:true,requested_model:spec.model,weights_sha256:spec.sha,raw_model_response:raw,telemetry:timing.normalize({native:{evaluation_ms:raw.execution.evaluation_ms}}),usage:{...raw.usage,model_requests:1,billing_usd:0,scope:raw.execution.token_count_scope}};
  if(request.states.every(s=>Object.values(s.questions).every(q=>q.type==='boolean'))){
    result.binary_gates={};for(const row of raw.states)for(const [id,a] of Object.entries(row.answers)){if(Object.hasOwn(result.binary_gates,id))throw fail('local_invalid_response');const p=a.noul;result.binary_gates[id]={p_true:p,value:p>.5,probabilities:{true:p,false:1-p},source:'laya_noul; Boolean/complement derived in adapter'};}
  }else{
    if(request.states.length!==1||!Object.values(request.states[0].questions).every(q=>q.type==='choice'))throw fail('local_invalid_response');
    const answers=raw.states[0].answers;result.decision=arena.validatePlan(Object.fromEntries(Object.entries(answers).map(([id,a])=>[id,a.choice])),request);result.probabilities=Object.fromEntries(Object.entries(answers).map(([id,a])=>[id,a.probabilities]));
  }
  return result;
}
function applyPlanner(result,request,wire){
  const planner=require('../posts/jev-system-one-research/arena-planner'),chosen=planner.read(result.binary_gates,wire);
  result.decision=arena.validatePlan(chosen.decision,request);result.planner_trace=planner.trace(wire,chosen,result.binary_gates);
  result.usage.scope+=(result.usage.scope?' ':'')+'Joint-plan preferences plus disclosed opponent rollouts/application search; not calibrated win probability or unaided model skill.';
  return result;
}
function parseCopilotPlan(stdout, request) {
  const value = cli.jsonFromOutput(stdout);
  // Older/simple replies can still supply valid orders, but absent scores stay
  // absent. Never turn the selected action into a fabricated 100% confidence.
  if (!value || !Object.prototype.hasOwnProperty.call(value, 'orders')) return { orders: arena.validatePlan(value, request), self_scores: null };
  if (Object.keys(value).some(key => !['orders','self_scores'].includes(key))) throw fail('arena_invalid_plan');
  const orders = arena.validatePlan(value.orders, request), questions = request.states[0].questions;
  if (value.self_scores == null) return { orders, self_scores: null };
  if (typeof value.self_scores !== 'object' || Array.isArray(value.self_scores) || Object.keys(value.self_scores).sort().join() !== Object.keys(questions).sort().join()) throw fail('arena_invalid_plan');
  const scores = {};
  for (const [id, question] of Object.entries(questions)) {
    const row = value.self_scores[id], keys = Object.keys(question.criteria);
    if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).sort().join() !== keys.sort().join()) throw fail('arena_invalid_plan');
    scores[id] = {};
    for (const key of keys) {
      const score = row[key];
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100 || score > row[orders[id]]) throw fail('arena_invalid_plan');
      scores[id][key] = score;
    }
  }
  return { orders, self_scores: scores };
}
function createArenaProvider(options) {
  const copilot = options.copilot, env = options.env || process.env, fetchImpl = options.localFetch || globalThis.fetch;
  const laya = layaModule.createProvider(options);
  return async function evaluate(team, request, signal, snapshot, context) {
    const started=performance.now();
    if(team.provider==='attack-baseline') {
      if(signal.aborted)throw fail('cancelled');
      const policy=require('../posts/jev-system-one-research/arena-attack-policy');
      const chosen=policy.choose(snapshot,request);
      return {ok:true,decision:arena.validatePlan(chosen.decision,request),policy_audit:chosen.audit,requested_model:policy.version,usage:{input_tokens:0,output_tokens:0,model_requests:0,billing_usd:0,scope:'Deterministic rule baseline; no model or network inference. Controller decisions are not model calls or model skill.'}};
    }
    if(team.provider==='copilot'&&typeof copilot?.evaluateTask!=='function')throw fail('copilot_unavailable');
    const plannerWire=context?.planner_wire||null;
    const utilityWire=context?.utility_wire||null,payload=plannerWire?.request||utilityWire?.request||request;
    if(team.provider==='search-baseline'){
      if(!plannerWire)throw fail('invalid_input');if(signal.aborted)throw fail('cancelled');
      const planner=require('../posts/jev-system-one-research/arena-planner'),chosen=planner.searchOnly(plannerWire);
      return {ok:true,decision:arena.validatePlan(chosen.decision,request),planner_trace:planner.trace(plannerWire,chosen),requested_model:'application-search-only-v1',usage:{input_tokens:0,output_tokens:0,model_requests:0,billing_usd:0,scope:'Same joint-plan rollout and shortlist, search value only. No model requests; not model skill.'}};
    }
    if(team.provider==='copilot'&&plannerWire){
      const planner=require('../posts/jev-system-one-research/arena-planner');
      const response=await copilot.evaluateTask(team.model,planner.copilotPrompt(plannerWire),stdout=>{
        const value=cli.jsonFromOutput(stdout);if(!value||Object.keys(value).join()!=='scores')throw fail('arena_invalid_plan');
        return planner.validateSelfScores(value.scores,plannerWire);
      },signal);
      const telemetry=timing.normalize({cli_wall_ms:performance.now()-started,api_duration_ms:response.usage?.api_duration_ms,cli:response.process_telemetry});
      if(!response.ok)return {...response,telemetry};
      const scores=response.decision,chosen=planner.readSelfScores(scores,plannerWire);
      return {...response,decision:arena.validatePlan(chosen.decision,request),telemetry,planner_trace:planner.trace(plannerWire,chosen,null,scores)};
    }
    if (team.provider === 'copilot' && utilityWire) {
      const utility=require('../posts/jev-system-one-research/arena-utility');
      const response=await copilot.evaluateTask(team.model,utility.copilotPrompt(utilityWire),stdout=>{
        const value=cli.jsonFromOutput(stdout);if(!value||Object.keys(value).join()!=='scores')throw fail('arena_invalid_plan');
        return utility.validateSelfScores(value.scores,utilityWire);
      },signal);
      const telemetry=timing.normalize({cli_wall_ms:performance.now()-started,api_duration_ms:response.usage?.api_duration_ms,cli:response.process_telemetry});
      if(!response.ok)return {...response,telemetry};
      const scores=response.decision,chosen=utility.readSelfScores(scores,utilityWire);
      return {...response,...chosen,decision:arena.validatePlan(chosen.decision,request),telemetry,utility_trace:{version:utility.versionFor(snapshot),encoding:utilityWire.version,model_request:payload,mapping:utilityWire.mapping,survival_mapping:utilityWire.survival_mapping,tactical:utilityWire.tactical,plans:utilityWire.plans,self_scores:scores,binary_gates:null,independent_argmax:chosen.independent_argmax,fallback_tanks:utilityWire.fallback_tanks,reload_hold_fallback:utilityWire.reload_hold_fallback,joint_fallback:utilityWire.joint_fallback,readout:utilityWire.tactical?'survivors_then_safe_victory_then_effective_health_then_coordination_then_weighted_self_preferences':'maximum_sum_self_preferences_over_disclosed_joint_plans'}};
    }
    if (team.provider === 'copilot') {
      const prompt = task.copilotPrompt(request);
      const result = await copilot.evaluateTask(team.model, prompt, stdout => parseCopilotPlan(stdout, request), signal);
      const telemetry=timing.normalize({cli_wall_ms:performance.now()-started,api_duration_ms:result.usage?.api_duration_ms,cli:result.process_telemetry});
      if (!result.ok) return {...result,telemetry};
      return { ...result, decision: result.decision.orders, self_scores: result.decision.self_scores, telemetry };
    }
    if(Object.hasOwn(layaModule.MODELS,team.provider)) {
      if(utilityWire)throw fail('invalid_input');
      const raw=await laya.evaluateWire(team.provider,payload,signal),result=normalizeLaya(raw,payload,layaModule.MODELS[team.provider]);
      if(signal.aborted)throw fail('cancelled');
      return plannerWire?applyPlanner(result,request,plannerWire):result;
    }
    return localLane.run(signal, async()=>{
    const connection = local.connectionFor(team.provider, env),connected=performance.now();
    try {
      const health = await fetchImpl(connection.origin + '/api/health', { signal: AbortSignal.any([signal, AbortSignal.timeout(2500)]), redirect: 'error' });
      if (!health.ok) throw fail('local_service_unavailable');
      local.validateHealth(await health.json(), connection.spec);
      const healthy=performance.now();
      if(signal.aborted)throw fail('cancelled');
      const response = await fetchImpl(connection.origin + '/api/evaluate', { method: 'POST', redirect: 'error', signal:AbortSignal.timeout(180000), headers: { 'Content-Type': 'application/json', 'X-NanoJev-Token': connection.token }, body: JSON.stringify(payload) });
      if (!response.ok) throw fail(response.status === 400 || response.status === 413 ? 'local_input_limit' : response.status === 429 ? 'busy' : 'local_inference_failed');
      const raw=await response.json(),received=performance.now();
      const result=normalize(raw, payload, connection.spec);
      if(plannerWire)applyPlanner(result,request,plannerWire);
      if(utilityWire){
        const utility=require('../posts/jev-system-one-research/arena-utility'),chosen=utility.read(result.binary_gates,utilityWire);
        result.decision=arena.validatePlan(chosen.decision,request);result.utility_scores=chosen.utility_scores;if(utilityWire.tactical){result.survival_scores=chosen.survival_scores;result.combined_scores=chosen.combined_scores;}
        result.utility_trace={version:utility.versionFor(snapshot),encoding:utilityWire.version,model_request:payload,mapping:utilityWire.mapping,plans:utilityWire.plans,binary_gates:result.binary_gates,independent_argmax:chosen.independent_argmax,fallback_tanks:utilityWire.fallback_tanks,reload_hold_fallback:utilityWire.reload_hold_fallback,joint_fallback:utilityWire.joint_fallback,readout:utilityWire.tactical?'survivors_then_safe_victory_then_effective_health_then_coordination_then_weighted_model_utilities':'maximum_sum_boolean_utilities_over_disclosed_joint_plans'};
        if(utilityWire.tactical){result.utility_trace.survival_mapping=utilityWire.survival_mapping;result.utility_trace.tactical=utilityWire.tactical;}
        result.usage.scope='Native Boolean utility evaluation with disclosed input constraints and joint readout; not categorical action probabilities or unassisted strategy. Local path tokens; no external API billing.';
      }
      result.telemetry=timing.normalize({...result.telemetry,node_connection_ms:connected-started,node_health_ms:healthy-connected,node_inference_http_ms:received-healthy,node_normalize_ms:performance.now()-received});
      return result;
    } catch (error) {
      if (signal.aborted) throw fail('cancelled');
      if (['local_service_unavailable','local_connection_invalid','local_input_limit','busy','local_inference_failed','local_invalid_response'].includes(error.code)) throw error;
      throw fail('local_service_unavailable');
    }
    });
  };
}
module.exports = { createArenaProvider, normalize, normalizeLaya, applyPlanner, parseCopilotPlan };

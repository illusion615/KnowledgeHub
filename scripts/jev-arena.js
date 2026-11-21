'use strict';
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const core = require('../posts/jev-system-one-research/arena-core');
const { validModel } = require('./jev-copilot-provider');
const task = require('../posts/jev-system-one-research/arena-task');
const registry = require('../posts/jev-system-one-research/model-registry');
const report = require('../posts/jev-system-one-research/arena-report');
const intent = require('../posts/jev-system-one-research/arena-intent');
const progress = require('../posts/jev-system-one-research/arena-progress');
const deadlock = require('../posts/jev-system-one-research/arena-deadlock');
const fail = (code, status = 400) => Object.assign(new Error(code), { code, status });
function validateConfig(body) {
  if (!body || Array.isArray(body) || Object.keys(body).some(k => !['seed','mode','control','duration_s','max_decisions','decision_timeout_s','input_profile','rate_limit_mode','ruleset','planner_revision','teams','consent'].includes(k)) || body.consent !== true) throw fail('consent_required');
  if (typeof body.seed !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(body.seed) || !['sync','realtime'].includes(body.mode) || body.control !== undefined && !['step','primitive','strategic'].includes(body.control) || ![null,30,60,90].includes(body.duration_s) || body.max_decisions != null && (!Number.isInteger(body.max_decisions) || body.max_decisions < 1 || body.max_decisions > 10) || !Array.isArray(body.teams) || body.teams.length !== 2) throw fail('invalid_input');
  if (body.decision_timeout_s !== undefined && ![30,60,120,180].includes(body.decision_timeout_s) || body.input_profile !== undefined && !['raw','action-facts','engage-first','utility-attack','utility-tactics','utility-planner'].includes(body.input_profile) || ['action-facts','engage-first','utility-attack','utility-tactics','utility-planner'].includes(body.input_profile) && body.control !== 'step') throw fail('invalid_input');
  if(body.rate_limit_mode!==undefined&&!['pause-world','continue-world'].includes(body.rate_limit_mode))throw fail('invalid_input');
  if(body.ruleset!==undefined&&!['cardinal','tactical','friendly-fire'].includes(body.ruleset)||['tactical','friendly-fire'].includes(body.ruleset)&&body.control!=='step'||['utility-tactics','utility-planner'].includes(body.input_profile)&&!['tactical','friendly-fire'].includes(body.ruleset))throw fail('invalid_input');
  for (const team of body.teams) {
    if (!team || Array.isArray(team) || Object.keys(team).some(k => !['provider','model'].includes(k)) || !registry.isLocal(team.provider)&&!['copilot','attack-baseline','search-baseline'].includes(team.provider) || (team.provider === 'copilot' ? !validModel(team.model) : team.model !== undefined)) throw fail('invalid_model');
  }
  if(body.teams.some(t=>registry.isLocal(t.provider)&&!registry.supports(t.provider,'arena',body.input_profile||'raw')))throw fail('unsupported_model_capability');
  if(body.teams.some(t=>['attack-baseline','search-baseline'].includes(t.provider))&&body.control!=='step')throw fail('invalid_input');
  if(body.planner_revision!==undefined&&(!['resource-terrain-v2','resource-tactics-v3','persistent-intent-v4','exchange-aware-v5','deadlock-recovery-v6'].includes(body.planner_revision)||body.input_profile!=='utility-planner'))throw fail('invalid_input');
  if(body.teams.some(t=>t.provider==='search-baseline')&&body.input_profile!=='utility-planner')throw fail('unsupported_model_capability');
  return {...core.copy(body),max_decisions:body.max_decisions??null};
}
function createArenaManager(options) {
  const now = options.now || (() => performance.now());
  let match = null;
  const blocked = new Set(['blocked_wall','blocked_tank','yielding','no_route','range','alignment','wall','target_gone']);
  function busy() { return !!match && (match.status === 'running' || match.pending > 0 || match.pairRunning); }
  function requireMatch(id) { if (!match || id !== match.id) throw fail('arena_not_found',404); return match; }
  const retention={frames:1800,decisions:200,latencies:256};
  function canDecide(m,side) { return m.config.max_decisions===null || m.metrics[side].scheduled<m.config.max_decisions; }
  function retain(list,item,limit){list.push(item);if(list.length>limit)list.shift();}
  function phase(m,side) {
    if (m.status !== 'running') return 'finished';
    if (m.jobs[side]) return m.jobs[side].started ? 'inference' : m.jobs[side].rateLimited ? 'rate_wait' : 'queue';
    if (m.ratePaused) return 'rate_barrier';
    if (m.config.mode === 'sync' && m.pairRunning) return 'sync_wait';
    if (m.config.control !== 'step') return 'cadence';
    if (!core.sideReady(m.game,side)) return 'actuator';
    return canDecide(m,side) ? 'cadence' : 'budget_idle';
  }
  function account(m) {
    if (m.status !== 'running') return;
    const time = now(),delta = Math.max(0,time-m.accountedAt); m.accountedAt=time;
    for (const side of [0,1]) {
      m.metrics[side].wait_timings[phase(m,side)+'_ms'] += delta;
      if (m.game.tanks.some(t=>t.side===side&&t.hp>0&&t.last_execution&&t.last_execution.action===t.order&&blocked.has(t.last_execution.outcome))) m.metrics[side].wait_timings.blocked_ms += delta;
    }
  }
  function usageAdd(stats, usage) {
    for (const key of Object.keys(stats.usage)) {
      const value = usage?.[key];
      stats.usage[key] = stats.usage[key] !== null && typeof value === 'number' && Number.isFinite(value) && value >= 0 ? stats.usage[key] + value : null;
    }
  }
  function settle(m) {
    if (m.status === 'running' || m.pending || m.pairRunning || m.archive_status !== 'pending') return;
    // Synchronous local sink: once all launched calls settle, including cancelled
    // receipts. A disk failure never changes the match outcome or triggers retry.
    try { options.onSettled({...view(m.id,false),frames:core.copy(m.frames)}); m.archive_status='saved'; }
    catch (_) { m.archive_status='failed'; }
  }
  function stop(reason = 'user_stopped') {
    const m=match;if (!m || m.status !== 'running') return;
    account(m);m.status = reason === 'completed' ? 'completed' : 'stopped'; m.reason = reason;
    m.finished_at = new Date().toISOString(); m.wall_ms = Math.round(now() - m.began);
    clearInterval(m.timer);
    for(const job of m.jobs.filter(Boolean))job.controller.abort();
    // Queued jobs have not invoked a model. Resolve them without invented usage
    // or error receipts, and never dispatch them during cancellation cleanup.
    for(const job of m.queue){m.jobs[job.side]=null;m.inflight[job.side]=null;m.pending--;job.resolve(null);}
    m.queue=[];settle(m);
  }
  function saveFrame(m) { m.frameTotal++;retain(m.frames,core.copy(m.game),retention.frames); }
  function installOrders(m, row) {
    account(m);
    if(deadlock.enabled(m.game)&&row.deadlock_epoch!==m.game.deadlock.teams[row.side].episode){row.intent_invalidated='deadlock_recovery_superseded';return;}
    if(row.intent_trace){
      const invalid=intent.revalidateFixed(m.game,row.side,m.intentMemory[row.side],row.intent_trace);if(invalid){row.intent_invalidated=invalid;return;}
      intent.accept(m.game,row.side,m.intentMemory[row.side],row.decision,row.intent_trace,row.decision_source==='application_route_follow');
    }
    row.applied_tick=m.game.tick; row.applied_wall_ms=Math.round(now()-m.began);
    row.application_snapshot=report.snapshot(m.game);
    core.applyPlan(m.game, row.side, row.decision); row.applied = true;
    if(row.recovery_trace)deadlock.installed(m.game,row.side);
    if(row.planning_counted)m.planExecutions.push({side:row.side,tick:m.game.tick,decision:core.copy(row.decision)});
    if (m.metrics[row.side].first_applied_ms === null) m.metrics[row.side].first_applied_ms = row.applied_wall_ms;
  }
  function context(m) {
    const duration_ticks=m.config.duration_s===null?null:m.config.duration_s*1000/core.tickMs;
    return m.config.control==='step'?{duration_ticks,scheduler:'after_action'}:{duration_ticks,interval_ticks:m.intervalTicks};
  }
  function copilotText(m,job){
    if(job.recoveryContext||job.intentContext?.follow||m.config.teams[job.side].provider!=='copilot')return null;
    if(job.plannerOptions)return job.plannerWire?require('../posts/jev-system-one-research/arena-planner').copilotPrompt(job.plannerWire):null;
    if(job.utilityWire)return require('../posts/jev-system-one-research/arena-utility').copilotPrompt(job.utilityWire);
    return task.copilotPrompt(job.request);
  }
  function capture(m,job,shared) {
    const observation=shared?.observation || core.observation(m.game,context(m));
    job.stateTick=shared?.tick ?? m.game.tick;
    job.snapshot=core.copy(shared?.snapshot || report.snapshot(m.game));
    job.request=core.request(m.game,job.side,observation);
    job.taskVersion=task.versionFor(m.game);job.deadlockEpoch=m.game.deadlock?.teams?.[job.side]?.episode??0;
    job.recoveryContext=null;job.intentContext=null;job.plannerOptions=null;
    if(['utility-attack','utility-tactics'].includes(m.config.input_profile)&&m.config.teams[job.side].provider!=='attack-baseline')job.utilityWire=require('../posts/jev-system-one-research/arena-utility').build(job.request,job.snapshot);
    if(deadlock.active(m.game,job.side)){
      if(m.intentRecoveryEpoch[job.side]!==job.deadlockEpoch){m.intentMemory[job.side].units={};m.intentRecoveryEpoch[job.side]=job.deadlockEpoch;}
      job.recoveryContext=deadlock.plan(m.game,job.side);
    }else if(m.config.input_profile==='utility-planner'&&m.config.teams[job.side].provider!=='attack-baseline'){
      const recent=m.decisions.filter(d=>d.side===job.side&&!d.error).slice(-8).map(d=>d.provider_ms);
      const delay=m.config.mode==='sync'?0:Math.min(6,Math.max(1,Math.ceil((core.percentile(recent,.5)??200)/core.tickMs)));
      job.plannerOptions={decision_delay_ticks:delay};
      if(intent.enabled(m.game)){
        job.intentContext=intent.prepare(m.game,job.side,m.intentMemory[job.side]);job.snapshot.intent_context=core.copy(job.intentContext);
        for(const [id,action] of Object.entries(job.intentContext.fixed_actions)){const q=job.request.states[0].questions[id];q.criteria={[action]:q.criteria[action]};}
        job.plannerOptions={decision_delay_ticks:delay,cache_analysis:true,search_policy:'progress-obligation-v1'};
        if(job.intentContext.follow)job.plannerOptions=null;
      }
    }
    m.inflight[job.side]={side:job.side,round:job.sequence,state_tick:job.stateTick,phase:job.started?'running':'queued',recovery_preview:job.recoveryContext?core.copy(job.recoveryContext):null,intent_preview:job.intentContext?core.copy(job.intentContext):null,planner_preview:job.plannerWire?require('../posts/jev-system-one-research/arena-planner').trace(job.plannerWire):null,utility_preview:job.utilityWire||null,task_prompt_version:job.taskVersion,observation_snapshot:job.snapshot,request:job.request,copilot_task_text:copilotText(m,job)};
  }
  function makeJob(m,side,shared) {
    account(m);
    const job={side,sequence:++m.metrics[side].scheduled,enqueuedAt:now(),started:false,controller:new AbortController(),request:null};
    job.promise=new Promise(resolve=>{job.resolve=resolve;});m.jobs[side]=job;m.pending++;
    if(shared)capture(m,job,shared);
    else m.inflight[side]={side,round:job.sequence,state_tick:null,phase:'queued_no_snapshot',task_prompt_version:task.versionFor(m.game),request:null};
    m.queue.push(job);return job;
  }
  function resource(m,job){const provider=m.config.teams[job.side].provider;return registry.isLocal(provider)?'local-metal-gpu':null;}
  function pump(m) {
    if(m.status!=='running')return;
    for(let i=0;i<m.queue.length;){
      const job=m.queue[i];if(job.request&&deadlock.enabled(m.game)&&(job.deadlockEpoch!==m.game.deadlock.teams[job.side].episode||!!job.recoveryContext!==deadlock.active(m.game,job.side)))capture(m,job);
      const following=deadlock.active(m.game,job.side)||intent.enabled(m.game)&&m.config.teams[job.side].provider!=='attack-baseline'&&intent.follow(m.game,job.side,m.intentMemory[job.side]),key=following?null:resource(m,job);
      if(key&&m.resources.has(key)){i++;continue;}
      if(options.admit && !following && !options.admit(m.config.teams[job.side],m.config)) {
        account(m);job.rateLimited=true;m.inflight[job.side].phase=job.request?'rate_wait_snapshot':'rate_wait';i++;continue;
      }
      m.queue.splice(i,1);if(key)m.resources.add(key);
      account(m);job.started=true;job.startedAt=now();
      if(!job.request)capture(m,job); // Fresh world after waiting for a local service.
      m.inflight[job.side].phase='running';
      void execute(m,job).then(row=>finish(row),()=>{stop('arena_provider_failed');finish(null);});
      function finish(row){account(m);if(key)m.resources.delete(key);m.jobs[job.side]=null;m.inflight[job.side]=null;m.pending--;job.resolve(row);pump(m);settle(m);}
    }
    account(m);m.ratePaused=m.config.rate_limit_mode==='pause-world'&&m.queue.some(job=>job.rateLimited);
  }
  async function execute(m, job) {
    const side=job.side,request=job.request,controller=job.controller,stats=m.metrics[side];stats.requests++;
    let result,error,decision;
    const deadlineMs=options.decisionTimeoutMs??(m.config.decision_timeout_s??30)*1000;
    let deadlineExpired=false;
    const timeout=setTimeout(()=>{deadlineExpired=true;controller.abort();},deadlineMs);
    try {
      if(job.plannerOptions){
        const began=now();job.plannerWire=await require('./jev-planner-worker')(request,job.snapshot,job.plannerOptions,controller.signal);job.plannerMs=now()-began;
        if(m.inflight[side]){m.inflight[side].planner_preview=require('../posts/jev-system-one-research/arena-planner').trace(job.plannerWire);m.inflight[side].copilot_task_text=copilotText(m,job);}
      }
      if(job.recoveryContext)result={ok:true,decision:job.recoveryContext.decision,requested_model:'application-deadlock-recovery-v1',usage:{input_tokens:0,output_tokens:0,model_requests:0,billing_usd:0,scope:'Goal-directed recovery from observed repeated states; no model request or rollout. Not model skill.'}};
      else if(job.intentContext?.follow)result={ok:true,decision:job.intentContext.follow,requested_model:'application-route-follow-v1',usage:{input_tokens:0,output_tokens:0,model_requests:0,billing_usd:0,scope:'Revalidated continuation of a previously approved route; no model request or new rollout search.'}};
      else result=await options.evaluate(m.config.teams[side],request,controller.signal,job.snapshot,{input_profile:m.config.input_profile,utility_wire:job.utilityWire,planner_wire:job.plannerWire});
      if(!result?.ok)throw fail(result?.error||'arena_provider_failed');
      decision=core.validatePlan(result.decision,request);
      if(controller.signal.aborted)throw fail('arena_timeout');
    } catch(e) {
      const allowed=['copilot_disabled','copilot_unavailable','copilot_incompatible','copilot_failed','copilot_invalid_response','copilot_timeout','copilot_output_limit','local_service_unavailable','local_connection_invalid','local_input_limit','local_inference_failed','local_invalid_response','busy','arena_invalid_plan','arena_planner_failed'];
      error=controller.signal.aborted?(deadlineExpired?'arena_timeout':'cancelled'):allowed.includes(e.code||e.message)?(e.code||e.message):'arena_provider_failed';
    } finally { clearTimeout(timeout); }
    const end=now(),elapsed=Math.round(end-job.enqueuedAt),providerMs=Math.round(end-job.startedAt),age=(m.game.tick-job.stateTick)*core.tickMs;
    stats.total_elapsed_ms+=elapsed;
    retain(stats.latencies,elapsed,retention.latencies);retain(stats.ages,age,retention.latencies);if(age>=1000)stats.stale++;
    stats.finished++;usageAdd(stats,result?.usage);if(error)stats.errors++;
    const row={index:m.decisionTotal++,side,round:job.sequence,dispatched:true,deadline_ms:deadlineMs,timeout_source:deadlineExpired?'arena_deadline':error==='copilot_timeout'?'cli_deadline':null,state_tick:job.stateTick,completed_tick:m.game.tick,elapsed_ms:elapsed,queue_ms:Math.round(job.startedAt-job.enqueuedAt),provider_ms:providerMs,state_age_ms:age,
      request,observation_snapshot:job.snapshot,task_prompt_version:job.taskVersion,
      copilot_task_text:copilotText(m,job),
      decision:decision||null,usage:result?.usage||null,error:error||null,applied:false,deadlock_epoch:job.deadlockEpoch,recovery_trace:job.recoveryContext?core.copy(job.recoveryContext):null,intent_trace:job.intentContext?core.copy(job.intentContext):null,
      planner_trace:result?.planner_trace||(job.plannerWire?require('../posts/jev-system-one-research/arena-planner').trace(job.plannerWire):null),planner_ms:job.plannerMs??null,
      decision_source:job.recoveryContext?'application_deadlock_recovery':job.intentContext?.follow?'application_route_follow':Object.keys(job.intentContext?.fixed_actions||{}).length&&m.config.teams[side].provider!=='search-baseline'?'model_with_route_constraints':m.config.teams[side].provider==='attack-baseline'?'rule_attack_baseline':m.config.teams[side].provider==='search-baseline'?'application_search_only':job.plannerOptions?'model_opponent_rollout':job.utilityWire?.tactical?'model_tactical_utility_joint':job.utilityWire?'model_utility_joint':'model',utility_trace:result?.utility_trace||(job.utilityWire?{version:job.taskVersion,survival_mapping:job.utilityWire.survival_mapping,tactical:job.utilityWire.tactical,encoding:job.utilityWire.version,model_request:job.utilityWire.request,mapping:job.utilityWire.mapping,plans:job.utilityWire.plans,fallback_tanks:job.utilityWire.fallback_tanks,reload_hold_fallback:job.utilityWire.reload_hold_fallback,joint_fallback:job.utilityWire.joint_fallback,binary_gates:null,independent_argmax:null,readout:'not_completed'}:null),utility_scores:result?.utility_scores||null,survival_scores:result?.survival_scores||null,combined_scores:result?.combined_scores||null,self_offense_scores:result?.self_offense_scores||null,self_survival_scores:result?.self_survival_scores||null,request_role:job.recoveryContext?'application_recovery_contract':job.intentContext?.follow?'application_route_contract':job.utilityWire||job.plannerOptions?'logical_action_contract':m.config.teams[side].provider==='attack-baseline'?'public_snapshot':'model_request',policy_audit:result?.policy_audit||null,
      telemetry:result?.telemetry||null,probabilities:result?.probabilities||null,self_scores:result?.self_scores||null,
      score_kind:job.recoveryContext?'application_deadlock_recovery':job.intentContext?.follow?'application_route_follow':m.config.teams[side].provider==='search-baseline'?'application_search_only':job.plannerOptions?(m.config.teams[side].provider==='copilot'?'self_reported_plan_preference':'native_plan_preference'):result?.self_offense_scores?'self_reported_multiobjective':result?.combined_scores?'native_multiobjective_utility':result?.utility_scores?'native_boolean_utility':result?.probabilities?'native_choice_probability':result?.self_scores?'self_reported_preference':'not_reported',
      requested_model:m.config.teams[side].model||m.config.teams[side].provider,reported_model:result?.requested_model||null,weights_sha256:result?.weights_sha256||null,raw_model_response:result?.raw_model_response||null};
    if(!['application_route_follow','application_deadlock_recovery'].includes(row.decision_source)){stats.decision_samples++;stats.decision_elapsed_ms+=elapsed;}
    if(job.plannerWire&&decision&&!error){stats.plans_total++;row.planning_counted=true;}
    retain(m.decisions,row,retention.decisions);
    if(m.status==='running'&&!error&&m.config.mode==='realtime')installOrders(m,row);
    if(error&&m.status==='running')stop('provider_error'); // No automatic retries/spend after failure.
    return row;
  }
  async function pair(m) {
    m.pairRunning=true;m.round++;
    const shared={tick:m.game.tick,observation:core.observation(m.game,context(m)),snapshot:report.snapshot(m.game)};
    const sameLocal=m.config.teams.every(t=>registry.isLocal(t.provider));
    const order=sameLocal&&m.round%2===0?[1,0]:[0,1];
    const jobs=order.map(side=>makeJob(m,side,shared));pump(m);
    try {
      const rows=await Promise.all(jobs.map(job=>job.promise));
      if(m.status==='running'&&m.config.mode==='sync')for(const row of rows.filter(Boolean))installOrders(m,row);
    } finally {account(m);m.pairRunning=false;settle(m);}
  }
  function trackPlanExecutions(m){
    m.planExecutions=m.planExecutions.filter(p=>{
      const done=Object.entries(p.decision).map(([id,action])=>{const t=m.game.tanks.find(t=>t.id===id),e=t?.last_execution;return {ended:!t||t.hp<=0||!t.pending_action,ok:!!e&&e.tick>p.tick&&e.action===action&&['moved','fired','waited'].includes(e.outcome)};});
      if(!done.every(d=>d.ended))return true;
      if(done.every(d=>d.ok))m.metrics[p.side].plans_executed++;return false;
    });
  }
  function pulse() {
    const m=match;if(!m||m.status!=='running')return;account(m);
    if(now()-m.heartbeat>(options.leaseMs||5000)){stop('viewer_disconnected');return;}
    if(m.config.duration_s!==null&&m.config.max_decisions!==null&&now()-m.began>m.config.duration_s*1000+m.config.max_decisions*((m.config.decision_timeout_s??30)*2000+2000)+10000){stop('wall_time_limit');return;}
    if(m.config.control==='step') {
      if(m.config.mode==='realtime') {
        for(const side of [0,1])if(!m.jobs[side]&&core.sideReady(m.game,side)&&canDecide(m,side))makeJob(m,side);
      } else if(!m.pending&&!m.pairRunning&&[0,1].every(side=>core.sideReady(m.game,side)&&canDecide(m,side)))void pair(m).catch(()=>stop('arena_provider_failed'));
    } else if(!m.pending&&!m.pairRunning&&canDecide(m,0)&&canDecide(m,1)&&m.game.tick>=m.nextRound) {
      m.nextRound=m.game.tick+m.intervalTicks;void pair(m).catch(()=>stop('arena_provider_failed'));
    }
    pump(m); // Includes rate-limited jobs in sync mode; no inference was retried.
    if(m.ratePaused || m.config.mode==='sync'&&(m.pending||m.pairRunning))return;
    account(m);core.step(m.game);trackPlanExecutions(m);saveFrame(m);
    let outcome=core.result(m.game,m.config.duration_s!==null&&m.game.tick>=m.config.duration_s*1000/core.tickMs);
    if(!outcome&&m.config.max_decisions!==null&&m.config.control==='step'&&!m.pending&&!m.pairRunning&&m.game.bullets.length===0&&[0,1].every(side=>!canDecide(m,side)&&core.sideReady(m.game,side)))outcome={...core.result(m.game,true),reason:'decision_budget'};
    if(outcome){m.result=outcome;stop('completed');}
    else if(m.game.deadlock?.unresolved)stop('deadlock_unresolved');
    else if(m.config.control==='step'&&m.config.mode==='realtime') {
      // Replan on the completion tick. Admission may queue, never repair, an action.
      for(const side of [0,1])if(!m.jobs[side]&&core.sideReady(m.game,side)&&canDecide(m,side))makeJob(m,side);
      pump(m);
    }
  }
  function start(config) {
    if(busy())throw fail('busy',429);config=validateConfig(config);const began=now();
    match={intentRecoveryEpoch:[0,0],planExecutions:[],intentMemory:[intent.create(),intent.create()],archive_status:typeof options.onSettled==='function'?'pending':'disabled',id:crypto.randomUUID(),config,game:(options.createGame||core.create)(config.seed,config.control||'strategic',config.input_profile,config.ruleset),status:'running',reason:null,result:null,began,accountedAt:began,heartbeat:began,started_at:new Date().toISOString(),pending:0,ratePaused:false,pairRunning:false,round:0,nextRound:0,
      intervalTicks:config.duration_s!==null&&config.max_decisions!==null?Math.ceil(config.duration_s*1000/core.tickMs/config.max_decisions):50,jobs:[null,null],queue:[],resources:new Set(),inflight:[null,null],frames:[],decisions:[],frameTotal:0,decisionTotal:0,
      metrics:[0,1].map(()=>({decision_samples:0,decision_elapsed_ms:0,plans_total:0,plans_executed:0,scheduled:0,requests:0,finished:0,errors:0,stale:0,first_applied_ms:null,total_elapsed_ms:0,latencies:[],ages:[],wait_timings:{queue_ms:0,rate_wait_ms:0,rate_barrier_ms:0,inference_ms:0,sync_wait_ms:0,actuator_ms:0,budget_idle_ms:0,cadence_ms:0,blocked_ms:0},usage:{input_tokens:0,output_tokens:0,premium_requests:0,nano_ai_units:0,billing_usd:0}}))};
    if(config.planner_revision)match.game.planner_revision=config.planner_revision;
    if(intent.enabled(match.game))progress.start(match.game);
    if(deadlock.enabled(match.game))deadlock.start(match.game);
    saveFrame(match);if(options.auto!==false)match.timer=setInterval(pulse,core.tickMs);return view(match.id,true);
  }
  function view(id,touch=true) {
    const m=requireMatch(id);if(touch)m.heartbeat=now();account(m);
    return {schema:'study-room.tank-match.v1',decision_protocol:task.versionFor(m.game),candidate_policy:m.game.input_profile==='utility-planner'?'opponent_rollouts_and_model_plan_ranking':m.game.input_profile==='utility-tactics'?'tactical_reload_health_and_joint_readout':m.game.input_profile==='utility-attack'?'legal_actions_and_joint_plan_readout':m.game.control==='strategic'?'legacy_strategic_goals':m.game.input_profile==='engage-first'?'fire_geometry_gate':'all_live_enemy_fire',scheduling:m.config.control==='step'?(m.config.mode==='realtime'?'independent_after_action':'paired_after_action'):'paired_cadence',id:m.id,config:m.config,game:core.copy(m.game),status:m.status,reason:m.reason,result:m.result,
      started_at:m.started_at,finished_at:m.finished_at||null,wall_ms:m.wall_ms??Math.round(now()-m.began),pending:m.pending,simulation_paused_for_rate:m.status==='running'&&m.ratePaused,
      metrics:m.metrics.map((s,side)=>({...core.copy(s),...m.game.stats[side],intent_counters:{goal_replans:m.intentMemory[side].goal_replans,route_replans:m.intentMemory[side].route_replans,route_steps:m.intentMemory[side].route_steps},comparison:{version:'arena-comparison-v1',decision_samples:s.decision_samples,mean_decision_ms:s.decision_samples?s.decision_elapsed_ms/s.decision_samples:null,plans_total:s.plans_total,plans_executed:s.plans_executed,decisions_total:s.decision_samples,correct_decisions:null,judged_decisions:0,scope:'Whole-match cumulative. Mean excludes approved-route continuations and application recovery steps, includes queue/search/provider and failed new decisions. Planning counts completed joint root actions (moved/fired/waited), not merely installed orders or whole future paths; excludes continuation. Decision total is settled new decisions, including failures but excluding continuation/recovery application steps. Correctness needs independent labels and is unknown, never inferred from validity/hits.'},phase:phase(m,side),first_order_wait_ms:s.first_applied_ms??(m.wall_ms??Math.round(now()-m.began)),mean_ms:s.finished?s.total_elapsed_ms/s.finished:null,percentile_samples:s.latencies.length,p50_ms:core.percentile(s.latencies,.5),p95_ms:core.percentile(s.latencies,.95),last_age_ms:s.ages.at(-1)??null})),
      decisions:core.copy(m.decisions),inflight:core.copy(m.inflight),frame_count:m.frames.length,archive_status:m.archive_status,
      retention:{frames_total:m.frameTotal,frames_dropped:m.frameTotal-m.frames.length,frame_start_tick:m.frames[0]?.tick??null,decisions_total:m.decisionTotal,decisions_dropped:m.decisionTotal-m.decisions.length,limits:retention},
      decision_interval_ms:m.config.control==='step'?null:m.intervalTicks*core.tickMs,
      scope:'Task performance, not accuracy. search-baseline uses the identical planner/horizon/shortlist but search value only, with zero model requests and null model scores. Use sync mode for matched-snapshot, zero-delay quality ablations; realtime includes compute/latency effects. An explicitly selected attack-baseline is a deterministic non-model controller; its evaluations, outcomes and policy audit are not model skill or probabilities. It never repairs model outputs. Step mode consumes one movement/firing attempt, including failure, per order. Real-time step requests independently follow each side’s completed actions; visibility/rules are equal but snapshot times may differ. Sync step mode freezes paired snapshots. Legacy modes retain persistent orders and paired cadence. All managed local GPU calls share a FIFO lane, including different models; no parallel local-model latency comparison. Submitted GPU work is not preemptible; queue ownership lasts until its transport settles. Other oMLX clients are outside this lane. Same-local-service calls use a FIFO resource queue; capture is refreshed on dispatch for independent mode. Budgets are caps, not a fixed request interval in step mode. Queue/provider timings are separated; native phases are not a GPU-kernel profiler. No decision cap when max_decisions is null; no duration cap when duration_s is null. Rate admission waits before dispatch, without retrying a failed call. pause-world freezes simulation for both sides only during admission waits; ordinary inference remains realtime. Native utility mode uses independent Boolean effect scores and disclosed joint-plan constraints, not original per-tank categorical argmax or weight training. Copilot attack and planner modes use validated 0..100 self-reported preferences over the same offered actions/plans, not fabricated native Boolean probabilities; plan preferences are divided by 100 only for the disclosed application readout. Tactical mode additionally uses disclosed survival forecasts and application-weighted offense/survival scores. Copilot tactical scores are self-reported 0..100 preferences, scaled only for the application readout, never native probabilities. The older tactical projection does not predict new enemy decisions. utility-planner instead rolls out attack/evasive opponents for 24 ticks in the real engine, shortlists six joint plans and adds a bounded native model preference to disclosed application values. It permits queued fire during reload for both sides, uses estimated decision latency, and never reads pending orders. Search gains are not unaided model skill. Bounded replay/decision retention is reported explicitly. p50/p95 use nearest rank over the latest 256 calls per side; mean and usage cover all settled calls. Wait buckets are wall time, and blocked_ms overlaps them (at least one living tank retains a failed last action). Native probabilities and CLI self-scores are different quantities. Errors still stop the match without automatic retry or fabricated results.'};
  }
  return {start,view,latest:()=>{if(!match)throw fail('arena_not_found',404);return {...view(match.id,false),frames:core.copy(match.frames)};},replay:id=>({...view(id),frames:core.copy(match.frames)}),stop:id=>{requireMatch(id);stop();return view(id);},busy,pulse,close:()=>stop('server_closed')};
}
module.exports={validateConfig,createArenaManager};

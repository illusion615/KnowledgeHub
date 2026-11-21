/* Server-authoritative live arena. Only the Start click grants repeated calls. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var core=window.JevArena,task=window.JevArenaTask,reporter=window.JevArenaReport,registry=window.JevModelRegistry, $=function(id){return document.getElementById('jev-arena-'+id);};
  if (!core || !window.JevArenaRenderer || !$('board')) return;
  var shell=window.JevArenaShell?window.JevArenaShell.create(document.getElementById('jev-arena')):null;
  var visual=window.JevArenaRenderer.create($('board')),replaySelected=false;
  var pick=function(zh,en){return document.documentElement.lang.startsWith('en')?en:zh;};
  var number=function(n){return typeof n==='number'&&isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:1}):'—';};
  var discovery=null,match=null,frames=[],pollTimer=null,submitting=false,replayLoading=false,failures=0,error='',preview=core.create($('seed').value,$('control').value,$('input-profile').value,$('ruleset').value),lastDiscovery='';
  var revision=0, history=[],reportBusy=false,importedRecord=null,importedLabel='';
  var errors={busy:['另一个实验正在运行，请先停止或等它结束。','Another experiment is active. Stop it or wait.'],local_rate_limit:['外部调用达到应用每分钟限速，请稍候。本地 NanoJev 无此限制；连续云端对局会等待后继续。','External calls reached the app rate limit. Local NanoJev is exempt; continuous cloud matches wait before dispatch.'],invalid_input:['请使用 1–32 位字母、数字、下划线或短横线作为种子。','Use a 1–32 character alphanumeric, underscore or hyphen seed.'],invalid_origin:['后端已重启，请刷新模型后重试。','Backend restarted; refresh models first.'],local_input_limit:['输入超过所选模型的完整预算，本局停止；未截断或换模型。','Input exceeds the selected model budget; stopped without truncation or model switch.'],copilot_failed:['Copilot 调用失败，请在终端检查登录、权限或额度。','Copilot failed. Check login, access and quota in your terminal.'],copilot_invalid_response:['Copilot 指令或自评分格式无效，本局停止。','Invalid Copilot orders or self-scores; match stopped.'],local_service_unavailable:['本地模型未就绪。','Local model is not ready.'],arena_timeout:['达到所选单次决策截止，本局停止；不是模型已返回错误动作。可调整截止或使用同步对照，不会自动重试。','Selected per-call deadline reached; no model action was returned. Adjust deadline or use sync mode; no automatic retry.'],network:['连接中断；已请求停止。后端失去心跳也会自动停止。','Connection lost; stop requested. Missing heartbeat also stops the backend.'],arena_invalid_plan:['模型指令不符合动作契约。','Model orders failed the action contract.'],cancelled:['调用已取消，已有费用可能仍然有效。','Call cancelled; charges may still apply.']};
  function message(code){return errors[code]?pick.apply(null,errors[code]):pick('模型或服务错误，未自动重试。','Model/service error; no retry.')+' ('+code+')';}
  function active(){return submitting || match && (match.status==='running'||match.pending>0);}
  function team(value){return value.startsWith('copilot:')?{provider:'copilot',model:value.slice(8)}:{provider:value};}
  function config(){return {planner_revision:$('control').value==='step'&&$('input-profile').value==='utility-planner'?'exchange-aware-v5':undefined,seed:$('seed').value,mode:$('mode').value,control:$('control').value,ruleset:$('control').value==='step'?$('ruleset').value:'cardinal',duration_s:$('duration').value==='unlimited'?null:Number($('duration').value),max_decisions:null,rate_limit_mode:$('rate-mode').value,decision_timeout_s:Number($('deadline').value),input_profile:$('control').value==='step'?$('input-profile').value:'raw',teams:[team($('blue').value),team($('red').value)],consent:true};}
  function teamReady(value){if(!discovery?.connection)return false;var t=team(value);return t.provider==='search-baseline'?$('control').value==='step'&&$('input-profile').value==='utility-planner':t.provider==='attack-baseline'?$('control').value==='step':t.provider==='copilot'?discovery.connection.copilot?.available&&discovery.models?.some(function(m){return m.id===t.model;}):!!discovery.connection.local?.[t.provider]?.ready;}
  function startBlockReason(){
    if(active())return pick('当前对局尚未结束。','The current match has not finished.');
    if(!discovery?.connection)return pick('等待本地后端连接。','Waiting for the local backend.');
    if(discovery.loading)return pick('正在刷新模型列表。','Refreshing the model list.');
    if($('control').value==='step'&&$('input-profile').value==='utility-planner'&&!discovery.connection.arena_planner_revisions?.includes('exchange-aware-v5'))return pick('后端仍为旧版：请结束当前对局后重启 Node 后端，再刷新模型列表以启用血量交换评估。不会中途换规则。','Backend is still an older revision. Finish the current match, restart the Node gateway, then refresh models to enable health-exchange evaluation. No mid-match rule change.');
    if(!/^[a-zA-Z0-9_-]{1,32}$/.test($('seed').value))return pick('地图种子须为 1–32 位字母、数字、下划线或短横线。','Map seed must be 1–32 letters, digits, underscores or hyphens.');
    for(var side of ['blue','red']){var selected=team($(side).value);if(selected.provider==='search-baseline'&&$('input-profile').value!=='utility-planner')return pick('纯搜索对照需要对手预测模式；不会自动更换输入配置。','Search-only requires opponent rollouts; the profile will not be changed automatically.');if(registry.isLocal(selected.provider)&&!registry.supports(selected.provider,'arena',$('control').value==='step'?$('input-profile').value:'raw'))return pick('所选模型暂不支持此历史输入配置；Laya 可用对手预测或原始地图，每次输入仍须通过预算检查。','Selected model does not support this legacy profile. Laya can use opponent rollouts or raw maps; each input must still pass budget checks.');if(!teamReady($(side).value))return selected.provider==='copilot'?pick('在线模型尚不可用，请刷新模型列表并检查 Copilot 登录及后端启用状态。','Online model unavailable. Refresh models and check Copilot login/backend enablement.'):selected.provider==='attack-baseline'?pick('规则基线需要动作级指令模式。','The rule baseline requires action-level controls.'):pick('所选本地模型尚未就绪，请检查本地模型服务。','Selected local model is not ready; check its service.');}
    if([$('blue').value,$('red').value].some(function(v){return v.startsWith('copilot:');})&&!$('consent').checked)return pick('请在对战设置中勾选在线模型调用授权。','Approve online model calls in Match Settings.');
    return '';
  }
  function fillModels(){
    if(!discovery || active())return;
    var signature=JSON.stringify([document.documentElement.lang,discovery.models,discovery.connection?.local,discovery.connection?.copilot]);
    if(signature===lastDiscovery)return;lastDiscovery=signature;
    ['blue','red'].forEach(function(id){
      var selected=$(id).value, list=document.createDocumentFragment();
      registry.models.filter(function(m){return registry.supports(m.id,'arena','raw');}).forEach(function(m){var option=new Option(m.label,m.id);option.disabled=!discovery.connection?.local[m.id]?.ready;list.appendChild(option);});
      list.appendChild(new Option(pick('纯搜索对照 · 同一规划器，无模型','Search Only · Same Planner, No Model'),'search-baseline'));
      list.appendChild(new Option(pick('规则进攻基线 · 非模型','Rule Attack Baseline · Not a Model'),'attack-baseline'));
      discovery.models.forEach(function(m){list.appendChild(new Option('Copilot · '+m.name,'copilot:'+m.id));});
      $(id).replaceChildren(list);
      if(Array.from($(id).options).some(function(o){return o.value===selected;}))$(id).value=selected;
      else {var placeholder=new Option(pick('请选择模型','Select Model'),'');$(id).prepend(placeholder);$(id).value='';$('consent').checked=false;}
    });
  }
  function motion(tank,game){return core.stationaryReason(game,tank)||tank.movement||'ready';}
  function motionLabel(code){
    var labels={action_complete:['一次动作已结束，待下一次决策','Attempt Complete; Awaiting Next Decision'],awaiting_order:['首条指令未返回（速度空档）','No First Order Yet (Latency Cost)'],waiting:['旧协议等待','Legacy Wait'],tactical_wait:['战术等待 · 4 ticks，不自动开火','Tactical Wait · 4 Ticks, No Auto-Fire'],firing:['对指定目标开火','Firing at Selected Target'],out_of_range:['指定目标不在射界','Target Outside Firing Line'],blocked_wall:['前方障碍，已停步','Wall Ahead; Stopped'],blocked_enemy:['敌方占位，未自动开火','Enemy Blocking; No Auto-Fire'],holding:['主动警戒停留','Holding Position'],at_spawn:['已在撤退点','Already at Spawn'],support_range:['已在支援范围','Already Near Teammate'],no_teammate:['无存活队友','No Surviving Teammate'],at_waypoint:['已到达包抄点','At Waypoint'],target_gone:['目标已消失','Target Gone'],reward_gone:['奖励已消失','Reward Gone'],ready:['等待移动时刻','Move Scheduled'],moving:['正在移动','Moving'],blocked:['路线受阻','Route Blocked'],yielding:['争用位置，等待让行','Contested Tile; Yielding'],engaging:['接敌交战','Engaging Enemy'],destroyed:['已被摧毁','Destroyed']};
    return labels[code]?pick.apply(null,labels[code]):code;
  }
  function metrics(){
    var game=match?match.game:preview;
    [0,1].forEach(function(side){
      var prefix=side===0?'blue':'red',stats=match?.metrics[side],alive=game.tanks.filter(function(t){return t.side===side&&t.hp>0;}),usage=stats?.finished?stats.usage:null;
      // Combat KPIs and mean/call counts live in the battlefield HUD only.
      // Keep complementary latency, usage and execution diagnostics here.
      var cards=[
        [pick('决策耗时 p50 / p95 · ms','Decision Time p50 / p95 · ms'),number(stats?.p50_ms)+' / '+number(stats?.p95_ms),pick('最近 ','Latest ')+number(stats?.percentile_samples??0)+pick(' 次已完成请求',' Completed Requests')],
        [pick('输入 / 输出 Token','Input / Output Tokens'),number(usage?.input_tokens)+' / '+number(usage?.output_tokens),pick('已返回用量；模型统计口径不同','Reported Usage; Scopes Differ')],
        [pick('最近状态滞后 · ms','Latest State Age · ms'),number(stats?.last_age_ms),pick('状态年龄 ≥1s（不等于失效）：','Age ≥1s (Not Invalidity): ')+number(stats?.stale??0)],
        [pick('移动成功 / 尝试','Moves / Attempts'),number(game.stats[side].moved)+' / '+number(game.stats[side].move_attempts),pick('受阻：','Blocked: ')+number(game.stats[side].blocked)+pick(' · 执行计数，非模型准确率',' · Execution Counts, Not Model Accuracy')],
        [pick('无效开火','Ineffective Triggers'),number(game.stats[side].invalid_shots),pick('未实际发射的开火尝试','Fire Attempts Without an Actual Shot')],
        [pick('首令下达延迟 · ms','First Order Installed · ms'),number(stats?.first_order_wait_ms),pick('含同步等待，非模型主动等待','Includes Sync Wait; Not a Model Wait Action')]
      ];
      $(prefix+'-kpis').replaceChildren();cards.forEach(function(row){var card=document.createElement('div'),label=document.createElement('div'),value=document.createElement('strong'),note=document.createElement('span');card.className='metric';label.className='metric-label';label.textContent=row[0];value.textContent=row[1];note.textContent=row[2];card.append(label,value,note);$(prefix+'-kpis').appendChild(card);});
      var commanded=stats?.first_applied_ms!=null||match?.decisions.some(function(d){return d.side===side&&d.applied;}),motions=alive.map(function(t){return motion(t,game);});
      var activity=motions.some(function(v){return v==='moving'||v==='ready';})?pick('移动 / 准备移动','Moving / Ready'):motions.some(function(v){return v==='engaging'||v==='firing';})?pick('交战中','Engaging'):motions.some(function(v){return ['blocked','yielding','blocked_wall','blocked_enemy'].includes(v);})?pick('受阻 / 让行','Blocked / Yielding'):motions.some(function(v){return v==='out_of_range'||v==='target_gone';})?pick('动作未生效','Ineffective Action'):pick('停留','Stationary');
      $(prefix+'-state').textContent=stats?.errors?pick('有错误','Error'):stats&&stats.requests>stats.finished?pick('思考中…','Thinking…'):commanded?activity:pick('待指令','Awaiting Orders');
      if(game.control==='step'&&match?.status==='running'&&stats){var phases={rate_barrier:pick('限流公平暂停','Paused for Rate Admission'),rate_wait:pick('限流等待 · 将自动继续','Rate Limit Wait · Will Continue'),queue:pick('等待本地服务','Local Service Queue'),inference:pick('推理中','Inferring'),sync_wait:pick('同步等待','Sync Barrier'),actuator:pick('执行一次动作','Executing One Attempt'),budget_idle:pick('预算已用完','Budget Exhausted'),cadence:pick('准备新决策','Ready for Next Decision')};$(prefix+'-state').textContent=phases[stats.phase]||stats.phase;}
      if(['attack-baseline','search-baseline'].includes(match?.config.teams[side].provider)&&stats?.phase==='inference')$(prefix+'-state').textContent=pick('规则计算中','Computing Rule Policy');
      $(prefix+'-state').dataset.error=stats?.errors?'true':'false';
      var waits=stats?.wait_timings;
      $(prefix+'-waits').textContent=waits?pick('排队 / 推理 / 保留失败记录时段（重叠）：','Queue / Inference / Failed-Action Record Retained (Overlapping): ')+[waits.queue_ms,waits.inference_ms,waits.blocked_ms].map(number).join(' / ')+' ms'+(match?.config.max_decisions!=null?' · '+pick('预算空档 ','Budget Idle ')+number(waits.budget_idle_ms)+' ms':'')+' · '+pick('限流等待 ','Rate Wait ')+number(waits.rate_wait_ms)+' ms · '+pick('限流暂停 ','Rate Barrier ')+number(waits.rate_barrier_ms)+' ms':'';
      renderTiming(side);
      $(prefix+'-orders').textContent=commanded?game.tanks.filter(function(t){return t.side===side;}).map(function(t){return t.id+': '+t.order+' · '+motionLabel(motion(t,game))+' · '+number(t.moved_cells)+pick(' 格',' tiles');}).join('\n'):(core.isActionControl(game)?pick('首条模型指令尚未返回 · 此空档计入速度成本','First Model Order Has Not Arrived · This Gap Counts as Latency'):pick('尚无模型指令 · 初始规则为警戒','No Model Orders · Initial Rule Is Hold'));
      renderScores(side,game);
    });
  }
  function renderTiming(side){
    var prefix=side===0?'blue':'red',rows=match?.decisions.filter(function(row){return row.side===side;})||[];
    var max=Math.max(1,...(match?.decisions||[]).map(function(row){return row.elapsed_ms||0;}));
    $(prefix+'-timing-chart').replaceChildren();
    rows.forEach(function(row){var line=document.createElement('div'),label=document.createElement('span'),track=document.createElement('span'),bar=document.createElement('span'),value=document.createElement('strong');line.className='arena-timing-row';label.textContent='#'+row.round;track.className='arena-timing-track';bar.style.width=(row.elapsed_ms/max*100)+'%';track.appendChild(bar);value.textContent=number(row.elapsed_ms)+' ms';line.append(label,track,value);$(prefix+'-timing-chart').appendChild(line);});
    var last=rows.at(-1);
    $(prefix+'-timing-detail').textContent=last?JSON.stringify({decision:last.round,queue_ms:last.queue_ms??null,provider_ms:last.provider_ms,telemetry:last.telemetry||null},null,2):pick('尚无调用计时。','No Call Timings Yet.');
  }
  function actionLabel(key){
    var labels={move_up:['↑ 上移','↑ Move Up'],move_down:['↓ 下移','↓ Move Down'],move_left:['← 左移','← Move Left'],move_right:['→ 右移','→ Move Right'],wait:['等待','Wait'],hold:['警戒','Hold'],north:['北路包抄','Flank North'],south:['南路包抄','Flank South'],retreat:['撤退','Retreat'],support:['支援','Support'],repair:['维修奖励','Repair Pickup'],shield:['护盾奖励','Shield Pickup'],power:['火力奖励','Power Pickup']};
    return labels[key]?pick.apply(null,labels[key]):key.startsWith('fire_')?pick('射击 ','Fire ')+key.slice(5):key.startsWith('attack')?pick('追击敌方 ','Pursue Enemy ')+key.slice(6):key;
  }
  function renderScores(side,game){
    var prefix=side===0?'blue':'red',row=match?.decisions.filter(function(d){return d.side===side;}).at(-1);
    var req=row?.request||core.request(game,side),questions=req.states[0].questions;
    var kind=row?.score_kind||'not_reported',selfDual=kind==='self_reported_multiobjective',dual=selfDual||kind==='native_multiobjective_utility',utilityScore=dual||kind==='native_boolean_utility',values=dual?row.combined_scores:kind==='native_choice_probability'?row.probabilities:kind==='native_boolean_utility'?row.utility_scores:kind==='self_reported_preference'?row.self_scores:null;
    var selectedTeam=match?match.config.teams[side]:team($(prefix).value);
    if(selectedTeam.provider==='attack-baseline'){
      $(prefix+'-score-note').textContent=pick('规则进攻基线：优先击毁和伤害，否则沿 BFS 靠近射界；无模型、无候选概率。','Rule Baseline: Prefer Kills/Damage, Otherwise BFS Approach; No Model or Probabilities.');
      $(prefix+'-scores').dataset.scoreKind='rule_policy';$(prefix+'-scores').replaceChildren();
      if(row){var detail=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent=pick('规则计算依据（不是模型评分）','Rule Audit (Not Model Scores)');pre.textContent=JSON.stringify(row.policy_audit,null,2);pre.style.whiteSpace='pre-wrap';detail.append(summary,pre);$(prefix+'-scores').appendChild(detail);}return;
    }
    if(row?.decision_source==='application_route_follow'){
      $(prefix+'-score-note').textContent=pick('沿已批准路线执行：本次未搜索、未调用模型。目标保持不变，每步仍检查危险、障碍和射击机会。','Approved route continuation: no search or model call this step. Goal retained; threats, obstacles and shots are rechecked.');$(prefix+'-scores').dataset.scoreKind='application_route_follow';var routePre=document.createElement('pre');routePre.style.whiteSpace='pre-wrap';routePre.style.overflowWrap='anywhere';routePre.textContent=JSON.stringify({decision:row.decision,intent:row.intent_trace,invalidated:row.intent_invalidated||null},null,2);$(prefix+'-scores').replaceChildren(routePre);return;
    }
    if((match?match.game.input_profile:preview.input_profile)==='utility-planner'){
      $(prefix+'-score-note').textContent=selectedTeam.provider==='search-baseline'?pick('纯搜索：同一候选、对手推演和筛选，只按程序搜索值选择。模型调用为 0，模型分为空，不冒充模型能力。','Search only: same candidates, opponent rollouts and shortlist; select by application value. Zero model requests and null model scores, not model skill.'):selectedTeam.provider==='copilot'?pick('联合规划：在线模型自报偏好为 0–100，非原生概率；程序搜索值和综合值分别保留，预测不是保证。','Joint Planning: Online Self-Preferences Are 0–100, Not Native Probabilities. Search/Combined Values Stay Separate; Forecasts Are Not Guarantees.'):pick('联合规划：原生模型偏好与程序搜索价值分别保留；综合值不是概率。搜索预测并非未来保证。','Joint Planning: Native Preferences and Application Search Values Are Separate; Combined Values Are Not Probabilities. Forecasts Are Not Guarantees.');
      var trade=row?.planner_trace?.plan_audit?.find(function(a){return JSON.stringify(a.plan)===JSON.stringify(row.decision);})?.exchange;
      if(trade)$(prefix+'-score-note').textContent+=' '+pick('程序血量交换评估：','Application health exchange: ')+(trade.stance==='press_advantage'?pick('预计有利，可主动施压','favorable forecast; press advantage'):trade.stance==='recover_advantage'?pick('补给／保全可改善局势','recovery improves the position'):trade.stance==='protect_or_reposition'?pick('存在不利交换风险，优先保全／换位','downside risk; protect or reposition'):pick('预计中性','neutral forecast'))+pick('；不是模型胜率。','; not a model win probability.');
      $(prefix+'-scores').dataset.scoreKind=selectedTeam.provider==='search-baseline'?'application_search_only':selectedTeam.provider==='copilot'?'self_reported_plan_preference':'native_plan_preference';$(prefix+'-scores').replaceChildren();
      if(row?.planner_trace){var pre=document.createElement('pre');pre.style.whiteSpace='pre-wrap';pre.style.overflowWrap='anywhere';pre.textContent=JSON.stringify({decision:row.decision,intent:row.intent_trace,exchange_payoff:row.planner_trace.assumptions?.exchange_payoff,exchange:row.planner_trace.plan_audit?.find(function(a){return JSON.stringify(a.plan)===JSON.stringify(row.decision);})?.exchange,progress_gate:row.planner_trace.progress_gate,wait_gate:row.planner_trace.wait_gate,strategy_reference:row.planner_trace.strategy_reference,plan_scores:row.planner_trace.plan_scores,search_only_plan:row.planner_trace.search_only_plan,model_changed_plan:row.planner_trace.model_changed_plan,planner_ms:row.planner_ms},null,2);$(prefix+'-scores').appendChild(pre);}return;
    }
    var source=selfDual?pick('攻 / 防为 CLI 自报偏好（0–100），非概率；条形为程序加权综合分。与原生 Boolean 分数不是同一量。','Offense / Survival: CLI Self-Preferences (0–100), Not Probabilities. Bars: Application-Weighted Scores; Not Native Boolean Scores.'):dual?pick('攻 / 防为两组原生 Boolean 效用；条形为程序加权综合分，不是原生概率。生存预估与队友协同约束优先，权重见审计。','Offense / Survival: Native Boolean Utilities. Bars: Application-Weighted Scores, Not Native Probabilities. Forecast Survival / Coordination Constraints Apply; Weights Are Audited.'):kind==='native_boolean_utility'?pick('原生 Boolean 效用分 · 独立、不归一 · 合法联合解码（非原始逐车 argmax）','Native Boolean Utilities · Independent, Not Normalized · Constrained Joint Readout'):kind==='native_choice_probability'?pick('原生候选概率 · 非正确率','Native Choice Probabilities · Not Accuracy'):kind==='self_reported_preference'?pick('模型自报偏好分（0–100）· 非概率或校准置信度','Self-Reported Preference (0–100) · Not Probabilities or Calibrated Confidence'):row?pick('本次未返回评分，不补造数值','No Scores Returned; None Invented'):selectedTeam.provider==='copilot'?pick('待返回自报偏好分；CLI 不提供候选概率','Awaiting Self-Scores; CLI Does Not Expose Choice Probabilities'):pick('待返回原生候选概率','Awaiting Native Choice Probabilities');
    if((match?match.game.input_profile:preview.input_profile)==='engage-first')source+=kind==='native_choice_probability'?pick(' · 仅对筛选后的候选归一化',' · Normalized Over Gated Candidates Only'):pick(' · 候选已按射界筛选',' · Fire Candidates Are Geometry-Gated');
    if(row?.utility_trace?.reload_hold_fallback?.length)source+=pick(' · 无可移动格：允许等待装填后射击',' · Trapped: Fire May Wait for Reload');
    if(row?.utility_trace&&(row.utility_trace.fallback_tanks?.length||row.utility_trace.joint_fallback))source+=pick(' · 受困退化已标记，不保证动作可执行',' · Trapped Fallback Disclosed; Feasibility Not Guaranteed');
    if(row)source+=' · '+(match?.scheduling==='independent_after_action'?pick('本方决策 ','Side Decision '):pick('轮次 ','Round '))+row.round+pick('，快照 ','; Snapshot ')+number(row.state_tick*core.tickMs/1000)+' s'+(row.applied?'':pick(' · 未执行',' · Not Applied'));
    $(prefix+'-score-note').textContent=source;$(prefix+'-scores').dataset.scoreKind=kind;$(prefix+'-scores').replaceChildren();
    if(!row)return; // No empty score tables before a model has actually replied.
    Object.entries(questions).forEach(function(entry){
      var id=entry[0],question=entry[1],panel=document.createElement('section'),heading=document.createElement('h5');heading.textContent=id;panel.appendChild(heading);
      Object.keys(utilityScore?values?.[id]||{}:question.criteria).forEach(function(key){
        var score=values?.[id]?.[key],known=typeof score==='number'&&isFinite(score),chosen=row?.decision?.[id]===key;
        var line=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong'),track=document.createElement('span'),bar=document.createElement('span');
        line.className='arena-score-row';line.dataset.action=key;line.dataset.selected=chosen?'true':'false';
        label.textContent=(chosen?'✓ ':'')+actionLabel(key);label.title=key+': '+question.criteria[key];
        value.textContent=known?(utilityScore?score.toLocaleString('en-US',{minimumFractionDigits:4,maximumFractionDigits:4}):kind==='native_choice_probability'?(score*100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'%':number(score)+' / 100'):'—';
        if(dual&&known){var detail=document.createElement('small');detail.textContent=pick('攻 ','Atk ')+(selfDual?row.self_offense_scores:row.utility_scores)[id][key].toFixed(selfDual?1:4)+pick(' / 防 ',' / Safe ')+(selfDual?row.self_survival_scores:row.survival_scores)[id][key].toFixed(selfDual?1:4);label.appendChild(document.createElement('br'));label.appendChild(detail);value.title=pick('程序加权综合分','Application-Weighted Score');}
        track.className='arena-score-track';track.setAttribute('aria-hidden','true');bar.style.width=known?Math.max(0,Math.min(100,['native_choice_probability','native_boolean_utility','native_multiobjective_utility','self_reported_multiobjective'].includes(kind)?score*100:score))+'%':'0%';track.hidden=!known;track.appendChild(bar);
        line.append(label,value,track);panel.appendChild(line);
      });
      if(utilityScore){var note=document.createElement('p');note.textContent=(dual?pick('逐车综合最高分：','Independent Weighted Argmax: '):pick('逐车最高分：','Independent Argmax: '))+(row.utility_trace?.independent_argmax?.[id]||'—')+pick(' · 联合执行：',' · Joint Order: ')+row.decision[id];panel.appendChild(note);}
      if(kind==='native_choice_probability'&&values?.[id]){
        var sorted=Object.values(values[id]).slice().sort(function(a,b){return b-a;}),gap=document.createElement('p');gap.className='arena-score-gap';
        gap.textContent=sorted.length>1&&sorted[0]-sorted[1]<=1e-6?pick('最高分近似并列，不代表有把握','Top Scores Nearly Tied; Not Evidence of Confidence'):pick('最高与次高相差 ','Top-Two Gap: ')+((sorted[0]-sorted[1])*100).toLocaleString('en-US',{maximumFractionDigits:4})+pick(' 个百分点',' Percentage Points');panel.appendChild(gap);
      }
      $(prefix+'-scores').appendChild(panel);
    });
  }
  function renderTask(){
    var side=Number($('task-side').value),prefix=side===0?'blue':'red';
    var row=match?.inflight?.[side]||match?.decisions.filter(function(d){return d.side===side;}).at(-1);
    var game=match?match.game:preview,cfg=match?match.config:config();
    var durationTicks=cfg.duration_s===null?null:cfg.duration_s*1000/core.tickMs;
    var context=cfg.control==='step'?{duration_ticks:durationTicks,scheduler:'after_action'}:{duration_ticks:durationTicks,interval_ticks:cfg.duration_s!==null&&cfg.max_decisions!=null?Math.ceil(cfg.duration_s*1000/core.tickMs/cfg.max_decisions):50};
    var request=row?.request||core.request(game,side,core.observation(game,context));
    var chosenTeam=cfg.teams[side],copilot=chosenTeam.provider==='copilot',rule=chosenTeam.provider==='attack-baseline',utilityMode=['utility-attack','utility-tactics','utility-planner'].includes(game.input_profile)&&!rule;
    function options(id,keys,label){var control=$(id),signature=document.documentElement.lang+'|'+keys.join('|');if(control.dataset.options===signature)return;var previous=control.value;control.replaceChildren();keys.forEach(function(key){control.appendChild(new Option(label?label(key):key,key));});if(keys.includes(previous))control.value=previous;control.dataset.options=signature;}
    options('task-tank',Object.keys(request.states[0].questions));
    var tank=$('task-tank').value,question=request.states[0].questions[tank];
    options('task-action',question?Object.keys(question.criteria):[],function(key){return key+' · '+actionLabel(key);});
    $('task-tank-field').hidden=copilot||rule||utilityMode;$('task-action-field').hidden=copilot||rule||utilityMode;
    var phase=row?.phase==='rate_wait'?pick('限流等待，尚未冻结输入，下方为预览','Rate Wait; Input Not Captured, Preview Below'):row?.phase==='rate_wait_snapshot'?pick('限流等待，同步输入已冻结','Rate Wait; Sync Input Is Frozen'):row?.phase==='queued_no_snapshot'?pick('排队尚未冻结输入，下方为预览','Queued; Input Not Yet Captured, Preview Below'):row?.phase==='queued'?pick('本轮待执行输入','Queued Input'):row?.phase==='running'?pick('本轮处理中输入','In-Flight Input'):pick('最近已记录输入','Latest Recorded Input');
    $('task-source').textContent=(row?phase+' · '+pick('轮次 ','Round ')+row.round+' · '+pick('快照 ','Snapshot ')+(row.state_tick==null?'—':number(row.state_tick*core.tickMs/1000))+' s':pick('预览 · 这份文本尚未发送','Preview · This Text Has Not Been Sent'))+' · '+(row?.task_prompt_version||(!row?task.versionFor(game):pick('旧协议','Legacy Protocol')));
    if(row?.decision_source==='application_route_follow'){
      $('task-input').textContent=JSON.stringify(row.intent_trace,null,2);$('task-output').textContent=pick('这是程序执行已批准路线的记录，不是新的模型请求。固定路线最多续走两步；危险、阻挡、射击机会或时限会触发重新决策。','This records application execution of an approved route, not a new model request. At most two continuation moves; threats, blocking, shots or lease expiry trigger a new decision.');
    }else if(rule){
      $('task-input').textContent=JSON.stringify({source:'public_snapshot_only',snapshot:row?.observation_snapshot||reporter.snapshot(game),policy_audit:row?.policy_audit||null},null,2);
      $('task-output').textContent=pick('规则控制器，不发送模型请求：优先可击毁目标和有效伤害；否则缩短到有效射界的 BFS 路线。保留单次动作执行，不修改任何模型输出。仅作非模型对照。','Rule Controller, No Model Request: Prioritize Kills/Damage, Then BFS to a Firing Position. Executes One Attempt, Never Repairs Model Outputs. Non-Model Control Only.');
    }else if(game.input_profile==='utility-planner'&&chosenTeam.provider==='search-baseline'){
      var searchTrace=row?.planner_trace||row?.planner_preview;
      $('task-input').textContent=searchTrace?JSON.stringify(searchTrace,null,2):pick('尚未生成搜索记录；预览不运行搜索。','No search trace yet; preview does not run search.');
      $('task-output').textContent=pick('纯搜索对照不发送模型请求。它使用同一规划器的候选、24 tick 对手推演、友伤筛选和程序搜索值；不添加模型偏好。trace 中的评分契约仅为预备数据，model_request_dispatched=false。','Search-only sends no model request. It uses the same candidates, 24-tick opponent rollouts, friendly-fire screening and application value without model preference. Any scoring contract in the trace is prepared data only; model_request_dispatched=false.');
    }else if(game.input_profile==='utility-planner'){
      var planTrace=row?.planner_trace||row?.planner_preview;
      $('task-input').textContent=planTrace?(copilot&&row?.copilot_task_text?row.copilot_task_text+'\n\n':'')+JSON.stringify(planTrace,null,2):pick('尚未生成规划请求。开始对局后展示真实模型输入、全部候选预测与原始分数；预览不运行搜索或推理。','No Planning Request Yet. A Match Shows Actual Inputs, Candidate Forecasts and Raw Scores; Preview Does Not Search or Infer.');
      $('task-output').textContent=pick('公开状态联合搜索：真实引擎模拟未来 24 tick，敌方按进攻／躲弹策略移动和射击，不读取隐藏订单。保留前 6 个计划交给所选模型评分；综合值 = 程序搜索价值 + 12 × (模型偏好 − 0.5)。不是胜率，不是纯模型能力。装填时双方都可保留射击订单，不再强制离开射位。搜索运行在独立线程，实时物理不暂停；延迟依据近期调用估计。NanoJev 的 Boolean 与 Laya 的 Noul 返回原生偏好；在线模型返回 0–100 自报偏好并仅在综合计算时除以 100，不伪造原生概率。','Public-State Joint Search: Real Engine, 24 Ticks, Attack/Evasive Opponents, No Hidden Orders. The Selected Model Scores the Top Six Plans; Combined Value = Application Search Value + 12 × (Preference − 0.5). Not Win Probability or Unaided Model Skill. Both Teams May Queue Fire During Reload. A Worker Keeps Realtime Physics Running; Delay Uses Recent Calls. NanoJev Boolean and Laya Noul Use Native Preferences; Online Models Return 0–100 Self-Preferences, Divided by 100 Only for Readout. No Fabricated Native Probabilities.');
    }else if(utilityMode){
      var trace=row?.utility_trace||row?.utility_preview||window.JevArenaUtility.build(request,row?.observation_snapshot||reporter.snapshot(game));
      $('task-input').textContent=JSON.stringify(trace,null,2);
      $('task-output').textContent=pick('实际模型输入见 model_request / request：匿名效果命题，使用 NanoJev 原生 Boolean 头，未改权重。每个分数独立，不是动作概率或正确率；公开联合解码选择总分最高且不争用同一格的组合。映射、候选组合和逐车原始最高分均可审计。在线模型使用独立标注的自报偏好。','Actual Model Input: model_request / request. Anonymous effect propositions use native Boolean heads, unchanged weights. Independent scores are not action probabilities or accuracy. Joint readout maximizes their sum over disclosed non-conflicting plans. Mapping, plans and independent argmax are auditable. Online Models Use Separately Labeled Self-Preferences.');
      if(game.input_profile==='utility-tactics')$('task-output').textContent=pick('实际请求包含 arena（进攻）和 survival（保全队伍）两组原生 Boolean 评分。v2 程序先比较预估存活数、安全终结对局、HP＋护盾，再避免重复致命射击，最后比较模型加权分。装填期间可移动则暂不提供射击，避免站桩等待；受困例外有标记。防御权重在来袭损血／双敌即刻射线，或残血且能射击／补给时为 0.65，其他为 0.25。不是原始模型动作 argmax。预估包括已有弹丸和己方拟射击，假定 3 tick 决策延迟、敌人冻结且不新增射击，观察至歼灭或 8 tick；不是未来保证。射程外先接近，利用掩体和补给。全部映射、权重、候选组合与筛选依据可审计。','Actual request has arena (offense) and survival Boolean score groups. v2 prioritizes forecast survivors, safe victory, HP + shields, then avoids redundant lethal shots before weighted scores. Fire is withheld during reload if movement is possible; trapped exceptions are flagged. Survival weight: 0.65 for incoming damage, two ready firing lines, or low HP with firing/resupply available; otherwise 0.25. Forecast: existing bullets plus proposed own fire; assumed 3-tick delay, frozen enemies / no new enemy shots; stop on elimination or at 8 ticks. Not future guarantees or original model action argmax. Enter range before firing; consider cover and useful resources. Mappings, weights, plans and filters are auditable.');
      if(copilot&&game.input_profile==='utility-attack'){
        $('task-input').textContent=(row?.copilot_task_text||window.JevArenaUtility.copilotPrompt({request:trace.model_request||trace.request}))+'\n\n'+JSON.stringify(trace,null,2);
        $('task-output').textContent=pick('在线模型对同一组攻击效果命题返回 0–100 自报偏好；程序在公开合法联合计划中选择总分最高者。不是原生 Boolean 概率，不会退回原始策略或改用本地模型。','Online Models Score the Same Attack-Effect Statements with 0–100 Self-Preferences. The Application Maximizes Their Sum over Disclosed Legal Joint Plans. Not Native Boolean Probabilities; No Strategy/Local-Model Fallback.');
      }
      if(copilot&&game.input_profile==='utility-tactics'){
        $('task-input').textContent=(row?.copilot_task_text||window.JevArenaUtility.copilotPrompt({request:trace.model_request||trace.request}))+'\n\n'+JSON.stringify(trace,null,2);
        $('task-output').textContent=pick('Copilot 对同一组进攻 / 生存效果命题返回 0–100 自报偏好，不是原生 Boolean 概率。v2 程序先比较预估存活、安全胜利、HP＋护盾及协同约束，再按公开权重选动作；原始分数和综合分分别保留。装填期间优先机动，受困例外单独标记。以上是应用提交文本，不含 CLI 自己添加的系统上下文。慢调用与实时世界变化仍可能使预测失效。','Copilot returns 0–100 self-preferences for the offense / survival effect statements, not native Boolean probabilities. v2 prioritizes forecast survivors, safe victory, HP/shields and coordination before application weights. Reload favors movement; trapped exceptions are flagged. Raw preferences and combined scores stay separate. Above is the application prompt, not CLI-added system context. Slow calls and world motion can invalidate forecasts.');
      }
      if(trace.tactical?.version==='tactical-projection-v1')$('task-output').textContent=pick('此记录为生存协同 v1：仅优先预估存活数和避免重复致命射击，再比较加权分。不含后来加入的 v2 HP／护盾、安全胜利、装填机动约束；请按保存的输入与 trace 审计，不用新版规则解释旧局。','Historical survival v1: forecast survivors / redundant lethal shots, then weighted scores. It lacks v2 health/shield, safe-victory and reload-maneuver constraints. Audit the saved inputs/trace, not the newer policy.');
    }else if(copilot){
      $('task-input').textContent=row?.request?(row.copilot_task_text||JSON.stringify(request,null,2)):task.copilotPrompt(request);
      $('task-output').textContent=pick('期望输出：JSON 的 orders 为每辆车选择一个候选键；self_scores 为所有候选的 0–100 自报偏好分，并非概率。此处仅展示应用提交文本，不包含 CLI 自己添加的系统上下文；旧记录缺少包装文本时仅显示保存的请求。','Expected output: JSON orders selects one candidate key per tank; self_scores contains all self-reported 0–100 preferences, not probabilities. This is the application text, not CLI-added system context. Legacy records without wrapper text show only their saved request.');
    }else if(registry.get(chosenTeam.provider)?.family==='laya'){
      $('task-input').textContent=JSON.stringify(request,null,2);
      $('task-output').textContent=pick('这是提交给 Laya 本地服务的公共状态/问题契约，不是 NanoJev 候选路径。Laya 使用自己的编码器与完整输入预算检查，返回 Choice 分布；不得把它标成 Qwen/NanoJev 的编码。','This is the state/question wire contract sent to the Laya worker, not a NanoJev candidate path. Laya uses its own encoder and strict full-input budget and returns Choice distributions.');
    }else{
      $('task-input').textContent=question?task.nativePath(request,tank,$('task-action').value):pick('此快照没有存活坦克需要决策。','No Living Tank Needs a Decision in This Snapshot.');
      $('task-output').textContent=pick('期望输出：原生 Choice 概率与最大值对应的 choice。NanoJev 对每条候选路径评分，不要求它生成 JSON。上框是单条路径的逻辑文本；实际按 State / Question / Candidate 分段编码，末尾另加 EOS。','Expected output: native Choice probabilities and their argmax choice. NanoJev scores candidate paths; it is not asked to generate JSON. Above is one logical path; State / Question / Candidate are encoded separately, followed by EOS.');
    }
  }
  function selectedReportRecord(){
    var scope=$('report-scope').value;
    return scope==='current'?match:scope==='imported'?importedRecord:history.find(function(row){return row.id===scope;})||null;
  }
  function reportControls(){
    var archive=$('archive-status');
    if(archive){var labels={saved:pick('本局诊断已自动保存到本机私有缓存；助手可直接读取，无需粘贴。','Diagnostics Saved to Private Local Cache; No Pasting Required.'),pending:pick('结束且所有调用结算后自动保存诊断，不额外调用模型。','Diagnostics Will Be Saved After All Calls Settle; No Extra Inference.'),failed:pick('自动保存失败，请保留下载或复制的记录。','Automatic Save Failed; Preserve a Download or Copy.'),disabled:pick('此后端未启用自动存档。','Automatic Archiving Is Disabled on This Backend.')};archive.textContent=labels[match?.archive_status]||pick('本地后端可自动存档已结束对局；不上传、不自动重跑。','The Local Backend Can Archive Finished Matches; No Uploads or Automatic Reruns.');}
    var selector=$('report-scope'),previous=selector.value;
    var entries=[{value:'current',label:pick('当前对局','Current Match')+(match?' · '+match.config.seed:''),disabled:!match}].concat(history.slice().reverse().filter(function(row){return row.id!==match?.id;}).map(function(row){return {value:row.id,label:row.config.seed+' · '+row.config.mode+' · '+row.status};}));
    if(importedRecord)entries.push({value:'imported',label:pick('导入（未验证） · ','Imported (Unverified) · ')+importedLabel});
    var signature=document.documentElement.lang+'|'+JSON.stringify(entries);
    if(selector.dataset.options!==signature){selector.replaceChildren();entries.forEach(function(entry){var option=new Option(entry.label,entry.value);option.disabled=!!entry.disabled;selector.appendChild(option);});selector.value=entries.some(function(entry){return entry.value===previous&&!entry.disabled;})?previous:entries.find(function(entry){return !entry.disabled;})?.value||'current';selector.dataset.options=signature;}
    var available=!!selectedReportRecord();$('copy-report').disabled=reportBusy||!available;$('copy-json').disabled=reportBusy||!available;
    $('report-note').placeholder=pick('例如：B0 已撞墙三轮仍选择 move_right，希望判断是输入、模型还是调度问题。','Example: B0 repeats move_right after three blocked rounds. Is the input, model or scheduling responsible?');
  }
  async function copyReport(asJson){
    var source=selectedReportRecord();if(!source||reportBusy)return;
    reportBusy=true;reportControls();
    try{
      var captured=reporter.create(source,{frames:source===match&&frames.length?frames:source.frames,note:$('report-note').value,error:source===match?error||null:null,source:source===importedRecord?'user-import-unverified':'local-page-record'});
      var content=asJson?JSON.stringify(captured,null,2):reporter.format(captured);
      $('report-text').value=content;$('report-details').open=true;
      var receipt=pick('快照：','Snapshot: ')+captured.config.seed+' · tick '+captured.tick+(captured.partial?pick(' · 阶段快照，尚未确认结算',' · Partial Snapshot, Not Final'):'');
      try{
        if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('clipboard_unavailable');
        await navigator.clipboard.writeText(content);
        $('report-status').textContent=pick('已复制，可直接粘贴给助手。','Copied. Paste it to your assistant. ')+receipt;
      }catch(_){
        $('report-status').textContent=pick('自动复制不可用；报告已生成并选中，请按 Cmd/Ctrl+C 手动复制。','Clipboard unavailable; the report is selected below. Press Cmd/Ctrl+C to copy. ')+receipt;
        $('report-text').focus();$('report-text').select();
      }
    }catch(_){$('report-status').textContent=pick('无法生成完整报告，请保留现有对局下载记录。','Could not build the report; preserve the existing match download.');}
    finally{reportBusy=false;reportControls();}
  }
  async function importReport(){
    var file=$('report-import').files[0];if(!file)return;
    if(file.size>10*1024*1024){$('report-status').textContent=pick('文件超过 10 MB，请使用单局记录。','File exceeds 10 MB; use a single-match record.');return;}
    try{
      var data=JSON.parse(await file.text()),checked=reporter.create(data,{source:'user-import-unverified'});
      importedRecord=data;importedLabel=checked.config.seed||checked.match_id||'JSON';
      reportControls();$('report-scope').value='imported';reportControls();$('report-details').open=true;
      $('report-status').textContent=pick('已导入，仅校验格式，未验证真实性；不会启动对局。点击复制按钮生成报告。','Imported; format checked, authenticity unverified. No match starts. Use Copy to generate a report.');
    }catch(_){$('report-status').textContent=pick('无法识别此文件，请导入“下载对局与决策记录”得到的单局 JSON。','Unsupported file. Import a single-match JSON from Download Match and Decisions.');}
  }
  function hudModelName(selected){
    if(registry.isLocal(selected.provider))return registry.label(selected.provider);
    if(selected.provider==='search-baseline')return pick('纯搜索对照 · 非模型','Search-Only Control · Not a Model');
    if(selected.provider==='attack-baseline')return pick('规则进攻基线 · 非模型','Rule Attack Baseline · Not a Model');
    var model=discovery?.models?.find(function(m){return m.id===selected.model;});
    return selected.provider==='copilot'?'Copilot · '+(model?.name||selected.model||pick('未选择','Not Selected')):selected.model||selected.provider||pick('未选择模型','Select a Model');
  }
  function hudDecision(side,game,selected){
    if(selected.provider==='attack-baseline')return pick('规则控制 · 无模型评分','Rule Control · No Model Scores');
    var row=match?.decisions.filter(function(d){return d.side===side&&d.applied&&!d.error&&(d.applied_tick??d.completed_tick)<=game.tick;}).at(-1);
    if(!row)return pick('决策评分：暂无已下达指令','Decision Scores: No Installed Order Yet');
    if(row.decision_source==='application_route_follow')return pick('沿批准路线 · 本次模型调用 0\n','Approved Route · Zero Model Calls This Step\n')+Object.entries(row.intent_trace?.references||{}).map(function(e){var r=e[1];return e[0]+' → '+(r.type||r.enemy_id||'attack')+' · '+pick('目标保持 ','Goal Held ')+number(game.tick-r.goal_created_tick)+' tick';}).join(' · ');
    function score(n){return typeof n==='number'&&isFinite(n)?n.toFixed(4):'—';}
    var heading=pick('已下达决策 #','Installed Decision #')+row.round+' · ',trace=row.planner_trace;
    var roles={recover:pick('低血维修','Recover'),assault:pick('护盾突击','Shield Assault'),burst:pick('火力速攻','Power Burst'),support:pick('支援队友','Support'),advance:pick('接敌','Advance')},roleNote=trace?.strategy_reference?Object.entries(trace.strategy_reference).filter(function(e){return roles[e[1].role];}).map(function(e){return e[0]+' '+roles[e[1].role];}).join(' · '):'';
    if(trace){
      var joint=trace.plan_scores?.find(function(s){var plan=trace.plans?.[s.plan_index];return plan&&Object.entries(row.decision||{}).every(function(e){return plan[e[0]]===e[1];});});
      return heading+(selected.provider==='search-baseline'?pick('纯搜索 · 模型调用 0','Search Only · Zero Model Calls'):selected.provider==='copilot'?pick('在线自报偏好 ','Online Self-Preference ')+number(joint?.self_preference)+' / 100':pick('原生偏好 ','Native Preference ')+score(joint?.model_score))+'\n'+pick('程序综合值 ','Application Value ')+score(joint?.combined_value)+pick('（非概率）',' (Not Probability)')+(roleNote?'\n'+pick('程序角色：','Application Roles: ')+roleNote:'');
    }
    var kind=row.score_kind,values=kind==='native_choice_probability'?row.probabilities:kind==='native_boolean_utility'?row.utility_scores:kind==='native_multiobjective_utility'||kind==='self_reported_multiobjective'?row.combined_scores:kind==='self_reported_preference'?row.self_scores:null;
    var label=kind==='native_choice_probability'?pick('候选概率','Candidate Probability'):kind==='native_boolean_utility'?pick('原生效用 · 非胜率','Native Utility · Not Win Rate'):kind==='native_multiobjective_utility'||kind==='self_reported_multiobjective'?pick('程序综合分 · 非概率','Application Score · Not Probability'):kind==='self_reported_preference'?pick('自报偏好 / 100 · 非概率','Self-Preference / 100 · Not Probability'):pick('评分未提供','Scores Not Reported');
    return heading+label+'\n'+Object.entries(row.decision||{}).map(function(e){var v=values?.[e[0]]?.[e[1]];return e[0]+' '+(kind==='native_choice_probability'&&typeof v==='number'&&isFinite(v)?(v*100).toFixed(2)+'%':score(v));}).join(' · ');
  }
  function renderHud(game){
    [0,1].forEach(function(side){
      var prefix=side===0?'blue':'red',selected=match?match.config.teams[side]:team($(prefix).value),stats=game.stats[side],calls=match?.metrics[side];
      var own=game.tanks.filter(function(t){return t.side===side;}),alive=own.filter(function(t){return t.hp>0;}),enemies=game.tanks.filter(function(t){return t.side!==side;});
      var modelName=hudModelName(selected);
      $(prefix+'-hud-model').textContent=modelName;$(prefix+'-hud-model').title=selected.model||selected.provider;
      $(prefix+'-map-model').textContent=modelName;$(prefix+'-map-model').title=modelName;
      $(prefix+'-model-switch').disabled=!!active();$(prefix+'-model-switch').title=active()?pick('对局进行中，停止后可切换模型','Stop the current match before changing models'):pick('切换','Change')+' '+modelName;
      $(prefix+'-model-switch').setAttribute('aria-label',pick(side===0?'切换蓝方模型：':'切换红方模型：',side===0?'Change blue model: ':'Change red model: ')+modelName);
      var comparison=window.JevArenaComparison.summarize(match?.metrics?.[side]);
      function ratioText(r){return r?r.numerator+' / '+r.denominator+(r.rate===null?'':' · '+(r.rate*100).toFixed(0)+'%'):'—';}
      $(prefix+'-compare-time').textContent=comparison.mean_ms===null?'—':number(comparison.mean_ms)+' ms';
      $(prefix+'-compare-attack').textContent=ratioText(comparison.attack);
      $(prefix+'-compare-plan').textContent=ratioText(comparison.planning);
      $(prefix+'-compare-correct').textContent='— / '+(comparison.decision.total??'—')+' · '+pick('未评定','Unassessed');
      $(prefix+'-hud-score').textContent=(window.JevArenaGeometry.friendlyFire(game)?pick('敌方损失 ','Enemy Losses '):pick('击毁 ','Kills '))+enemies.filter(function(t){return t.hp<=0;}).length+' / '+enemies.length;
      var cards=[
        [pick('存活 / HP','Alive / HP'),alive.length+'/'+own.length+' · '+number(alive.reduce(function(n,t){return n+t.hp;},0))],
        [pick('有效伤害','HP Damage'),number(stats.damage)],
        [pick('命中 / 发射','Hits / Shots'),number(stats.hits)+' / '+number(stats.shots)],
        [pick('拾取补给','Pickups'),number(stats.rewards)],
        [pick('主动等待 / ticks','Tactical Waits / Ticks'),number(stats.wait_actions??0)+' / '+number(stats.tactical_wait_ticks??0)],
        [replaySelected?pick('整局平均 · ms','Match Mean · ms'):pick('平均决策 · ms','Mean Decision · ms'),number(calls?.mean_ms)],
        [replaySelected?pick('整局决策 / 错误','Match Decisions / Errors'):pick('决策 / 错误','Decisions / Errors'),number(calls?.requests??0)+' / '+number(calls?.errors??0)]
      ];
      if(['persistent-intent-v4','exchange-aware-v5'].includes(game.planner_revision))cards.push([pick('目标 / 路线重规划','Goal / Route Replans'),number(calls?.intent_counters?.goal_replans??0)+' / '+number(calls?.intent_counters?.route_replans??0)],[pick('沿路线执行步数','Committed Route Steps'),number(calls?.intent_counters?.route_steps??0)]);
      if(window.JevArenaGeometry.friendlyFire(game))cards.push([pick('友伤 HP / 护盾','Friendly HP / Shield'),number(stats.friendly_damage)+' / '+number(stats.friendly_shield_damage)],[pick('友伤命中','Friendly Hits'),number(stats.friendly_hits)]);
      $(prefix+'-hud-kpis').replaceChildren();cards.forEach(function(c){var cell=document.createElement('div'),label=document.createElement('dt'),value=document.createElement('dd');label.textContent=c[0];value.textContent=c[1];cell.append(label,value);$(prefix+'-hud-kpis').appendChild(cell);});
      $(prefix+'-hud-decision').textContent=hudDecision(side,game,selected);
    });
    var intentRows=[];if(['persistent-intent-v4','exchange-aware-v5'].includes(game.planner_revision))for(var side of [0,1]){var recent=match?.decisions.filter(function(d){return d.side===side&&d.applied&&(d.applied_tick??d.completed_tick)<=game.tick;}).at(-1);for(var entry of Object.entries(recent?.intent_trace?.references||{})){if(!game.tanks.some(function(t){return t.id===entry[0]&&t.hp>0;}))continue;var r=entry[1];intentRows.push(entry[0]+' → '+(r.type||r.enemy_id||pick('接敌','Attack'))+' · '+pick('目标保持 ','Goal Held ')+number(game.tick-r.goal_created_tick)+' tick');}}
    $('intent-status').textContent=['persistent-intent-v4','exchange-aware-v5'].includes(game.planner_revision)?(intentRows.join(' ｜ ')||pick('持续目标：等待首次规划；查看画面不会运行规划。','Persistent Goals: Waiting for First Plan; Viewing Does Not Plan.')):'';
    $('hud-scope').textContent=replaySelected?pick('回放 tick ','Replay Tick ')+game.tick+pick('：战绩与战况 KPI 跟随画面；耗时和决策计数为整局统计。评分仅展示该时刻前已下达且仍有记录的指令。',' · Combat KPIs Follow This Frame; Latency/Decision Counts Are Whole-Match Totals. Scores Use Retained Orders Installed by This Tick.'):pick('战绩按击毁数展示；模型决策评分单独标注，不是比赛积分或胜率。','Battle Score Shows Kills; Decision Scores Are Separate, Not Match Points or Win Rates.');
    if(window.JevArenaGeometry.friendlyFire(game))$('hud-scope').textContent+=pick(' v7：友军挡弹且会受伤；敌方损失含其友伤减员，不冒充我方击杀。',' v7: Allies Intercept Bullets and Take Damage; Enemy Losses Include Their Own Friendly Fire, Not Claimed Kills.');
  }
  function draw(game){
    renderHud(game);
    visual.setFrame(game,{key:match?match.id:'preview:'+game.seed+':'+game.control,live:!!match&&!replaySelected,routeDecisions:$('show-routes').checked?match?.decisions||[]:[]});
    var routes=$('show-routes').checked?window.JevArenaRenderer.routeOverlays(game,match?.decisions||[]):[];
    $('route-note').textContent=!$('show-routes').checked?pick('路径已隐藏','Routes hidden'):routes.length?pick('蓝／红虚线：程序预测，非保证执行；终点标注目标。','Blue/red dashed lines: application forecasts, not committed trajectories; targets labeled.')+' '+routes.map(function(r){return r.tank+' @tick '+r.state_tick;}).join(' · '):pick('暂无匹配已选动作的有效路线；不额外运行规划。','No valid route matching a chosen action; viewing does not run planning.');
  }
  function render(){
    preview.planner_revision=preview.input_profile==='utility-planner'?'exchange-aware-v5':undefined;
    fillModels();var running=active();
    if(document.getElementById('jev-arena').dataset.running!==String(!!running))document.getElementById('jev-arena').dataset.running=String(!!running);
    var cloudCount=[$('blue').value,$('red').value].filter(function(v){return v.startsWith('copilot:');}).length;
    ['blue','red','seed','mode','control','duration','deadline','rate-mode','ruleset','input-profile','random','swap'].forEach(function(id){$(id).disabled=!!running;});
    ['blue','red'].forEach(function(id){var option=Array.from($(id).options).find(function(o){return o.value==='attack-baseline';});if(option)option.disabled=$('control').value!=='step';var search=Array.from($(id).options).find(function(o){return o.value==='search-baseline';});if(search)search.disabled=$('control').value!=='step'||$('input-profile').value!=='utility-planner';});
    $('refresh').disabled=!!running||!!discovery?.loading;
    $('control-note').textContent=(match?match.game.control:$('control').value)==='step'?pick('动作级：一条指令只尝试移动一格或开火一次，失败也结束；完成后重新询问。实时双方独立取最新状态，同步则等双方。决策次数不限；直到分出胜负、达到所选时长或手动停止。限流时等待下一次请求，不自动纠正动作。','Action level: attempt one tile or one shot, including failure, then replan. Real-time sides sample independently; sync waits for both. No decision count cap: continue until elimination, the selected duration, or Stop. Rate admission can wait; no substitute actions.'):(match?match.game.control:$('control').value)==='primitive'?pick('强制行动：没有 wait，只能选四向移动或指定目标开火。候选不替模型过滤撞墙或无效射击，失败执行会计数；不自动纠正、绕路或换目标。尚未收到首令的空档单独计时。','Forced action: no wait, only four movement directions or named-target fire. The model must judge feasibility; blocked moves and ineffective shots are counted, not filtered or corrected by autopilot. The initial no-order gap is timed separately.'):pick('历史战术对照：仍保留警戒等旧指令及自动寻路射击，不属于强制行动评测，请与新版分开比较。','Legacy strategic comparison retains hold and automatic controllers. It is not the forced-action benchmark; compare separately.');
    if(['persistent-intent-v4','exchange-aware-v5'].includes((match?.game||preview).planner_revision))$('control-note').textContent=$('control-note').textContent.replace('完成后重新询问','完成后复核路线，必要时重新询问').replace('then replan.','then validate continuation; re-score when needed.');
    if(['resource-tactics-v3','persistent-intent-v4','exchange-aware-v5'].includes((match?.game||preview).planner_revision))$('control-note').textContent+=pick(' v3：可原地等待 4 tick（0.8 秒），装填和弹丸继续但不自动开火；收益门槛与连续等待惩罚见诊断。护盾前压、火力速攻、低血维修与队友支援均为程序策略。',' v3: a wait holds 4 ticks (0.8s), with reload/projectiles continuing but no auto-fire. Diagnostics disclose admission and repeated-wait cost. Shield assault, power burst, repair and support are application strategies.');
    if(['persistent-intent-v4','exchange-aware-v5'].includes((match?.game||preview).planner_revision))$('control-note').textContent+=pick(' v4：目标与路线跨决策保留；批准后最多续走两步，每步复核。遇险、受阻、出现射击机会或无进展时重规划，不盲目锁死路径。',' v4: goals/routes persist across decisions; at most two approved follow-up moves, checked every step. Threats, blocking, shots or stalled progress trigger replanning.');
    if((match?.game||preview).planner_revision==='exchange-aware-v5')$('control-note').textContent+=pick(' v5：双方共用血量／护盾相对优势及交换收益；允许有利的双方损失，不强制己方零损失。双对手预测采用 70% 最差＋30% 均值，不是完整博弈均衡。明显血量关系变化会中断路线续走。',' v5: shared relative HP/shield exchange value permits favorable mutual losses. Two-response aggregation is 70% worst +30% mean, not an equilibrium solution. Material health-balance changes interrupt route continuation.');
    $('control-note').textContent+=pick(' 长局保留最近 1,800 帧和 200 条决策；累计计数、用量和均值保留，分位数取每方最近 256 次。',' Long matches retain 1,800 frames and 200 decisions; counts, usage and means are cumulative, percentiles use the latest 256 per side.');
    if([$('blue').value,$('red').value].includes('attack-baseline'))$('control-note').textContent+=pick(' 规则进攻基线不是模型，只支持动作级；其胜负不能计为 NanoJev/CLI 能力。',' Rule attack baseline is NOT a model and requires action-level control; its outcomes are not NanoJev/CLI skill.');
    if([$('blue').value,$('red').value].includes('search-baseline'))$('control-note').textContent+=pick(' 纯搜索对照没有模型调用；同步模式让双方用同一快照、零预测延迟，适合检查模型是否比同一搜索器更好。',' Search-only has no model calls. Sync uses matched snapshots and zero forecast delay, suitable for testing model contribution over the same searcher.');
    $('consent-field').hidden=!cloudCount;
    $('input-profile').disabled=!!running||$('control').value!=='step';
    $('ruleset').disabled=!!running||$('control').value!=='step';
    $('input-note').textContent=((match?match.game.input_profile:preview.input_profile)==='engage-first'?pick('先接敌再射击：只给出射程 ≤6 格、同一行/列且无墙阻挡的活敌射击选项；四向移动保留，并提供到射界的 BFS 距离。筛选发生在模型评分前，非输出修补；这是受约束任务，不是原始模型的可行性判断能力。实时目标移动仍可能让已选动作失效。','Approach then fire: only live targets aligned within 6 cells with no blocking wall are offered for firing. Four moves remain, with BFS firing-position distances. This is input gating, not output repair or an unaided feasibility test. Target motion can still invalidate a selected shot.'):pick('事实辅助提供阻挡、曼哈顿距离、最近 8 个位置的访问次数和反向动作信息；不是自动寻路，不筛选或替换动作，也不代表纯地图理解能力。','Assisted input exposes blocking, Manhattan distance, last-8-position visits and reversal. No pathfinding, filtering or action repair; not unaided map understanding.'))+' '+pick('单次截止 ','Per-call deadline ')+(match?.config.decision_timeout_s??Number($('deadline').value))+' s · '+pick('实时模式仍按模拟时长结束；慢 CLI 的完整响应对照请用同步模式。','Realtime still ends at its simulation limit; use Sync to compare complete slow-CLI responses.');
    if((match?match.game.input_profile:preview.input_profile)==='raw')$('input-note').textContent=pick('无预测辅助对照：不提供联合计划搜索和预测结果，检验模型从地图/状态自行选择动作的能力。与 v3 规划的差异包含输入辅助及等待动作（原始模式仍不提供等待），不能当作仅更换模型的比较；弹道同为 v7。','Unassisted control: no joint-plan search or forecasts; test choices from map/state. Differences from v3 planning include input assistance and the wait action (raw still has no wait), not merely a model swap; both use v7 ballistics.');
    if(window.JevArenaGeometry.enabled(match?match.game:preview))$('input-note').textContent=$('input-note').textContent.replace('同一行/列且无墙阻挡','任意角度且无墙 / 墙角遮挡').replace('aligned within 6 cells','within Euclidean radius 6 at any angle');
    if((match?match.game.input_profile:preview.input_profile)==='utility-tactics')$('input-note').textContent=pick('生存协同 v2：先入射程，装填时机动（受困除外）。公开约束优先预估存活、安全胜利、HP＋护盾，结合掩体、来袭弹丸、补给与队友威胁；避免争格与重复致命射击。NanoJev 用攻 / 防两组原生效用，Copilot 用自报偏好；结合公开预测约束 / 程序加权，不是训练后的新模型。v6：任意角度、欧氏半径 6，墙与墙角阻挡，子弹不追踪目标。预测不是未来保证。','Survival + Teamwork v2: Enter range first; maneuver while reloading unless trapped. Disclosed constraints prioritize projected survivors, safe victory and HP/shields. Consider cover, incoming bullets, resources and allies; avoid tile conflicts and redundant lethal shots. NanoJev uses dual native utilities, Copilot self-preferences, with disclosed forecast constraints / application weights; not new model training. v6: any angle, Euclidean radius 6, walls/corners block shots; bullets do not track. Forecasts are not guarantees.');
    if(match?.decision_protocol==='tank-tactical-utility-v1')$('input-note').textContent=pick('本局使用生存协同 v1；不含 v2 的 HP／护盾、安全胜利和装填机动约束。保留旧局原始输入与规则，不中途切换策略。','This match uses survival v1, without v2 health/shield, safe-victory and reload-maneuver constraints. Saved inputs/rules are retained; no mid-match policy switch.');
    if((match?match.game.input_profile:preview.input_profile)==='utility-attack')$('input-note').textContent=pick('NanoJev 效用模式：先排除当前不可执行动作，再对匿名效果做原生 Boolean 评分，并公开联合解码以避免队友争格；不是原始动作多选概率。完全受困时的强制动作退化会单独标记。支持本地 NanoJev 与在线模型；在线模型使用 0–100 自报偏好，不伪造原生 Boolean 分数。','NanoJev Utility Mode: Legal-input filtering, anonymous native Boolean scores, and disclosed joint readout to avoid allied destination conflicts. Not original categorical action probabilities. Fully trapped fallbacks are flagged separately. Online Models Use 0–100 Self-Preferences, Never Fabricated Native Boolean Scores.');
    if((match?match.game.input_profile:preview.input_profile)==='utility-planner')$('input-note').textContent=pick('对手预测规划（实验）：真实引擎模拟双方未来行动，联合比较击杀、血量、护盾、补给和交战距离，再由模型评分参与排序。不读取对手隐藏订单；保留纯搜索决策作贡献对照。双方装填时均可保持射击订单。模型未训练，预测不保证；完整输入、搜索值、原始模型分和综合值均可审计。支持本地与在线模型；在线模型用自报偏好参与同一联合规划，不更换策略。','Opponent Rollouts (Experimental): Simulate Both Teams, Compare Kills, Health, Shields, Resources and Firing Distance, Then Include Native Model Preferences. No Hidden Orders. Search-Only Decisions Are Audited Separately. Both Teams May Queue Fire While Reloading. No Model Training or Forecast Guarantees. Local and Online Models Share the Planner; Online Scores Are Self-Preferences, Not Native Probabilities.');
    if(window.JevArenaGeometry.friendlyFire(match?match.game:preview))$('input-note').textContent+=pick(' 当前 v7 友伤开启：子弹命中首辆存活坦克，友军也会挡弹、扣盾和扣血；不向队友背后开火，并避开友方在途／拟射击弹道。规划器在评分前检查联合行动的友伤风险；无安全计划会明确标记，实时变化仍可能造成误伤。',' v7 Friendly Fire Is On: The First Living Tank Intercepts the Bullet, Including Allies and Their Shields/HP. Avoid Shooting Through Teammates and Crossing Existing/Proposed Friendly Lanes. The Planner Screens Joint Friendly-Fire Risks Before Scoring; No-Safe-Plan Cases Are Flagged, Not Guaranteed Safe.');
    if(cloudCount&&$('mode').value==='realtime')$('input-note').textContent+=pick(' 在线调用可能较慢，实时战场不会等待响应；比较策略质量建议选择同步模式。',' Online Calls May Be Slow; Realtime Does Not Wait for Responses. Use Sync to Compare Decision Quality.');
    $('consent-label').textContent=pick('同意本局持续将公开战场发送到 Copilot，调用次数不限，可能持续消耗我的额度；所选时长为 ','I approve continuous Copilot calls with NO total call cap, consuming my quota; selected duration: ')+($('duration').value==='unlimited'?pick('无限制，需手动停止或等胜负','unlimited, until Stop or elimination'):$('duration').value+' s')+pick('。关闭页面会停止。单次最多 ','; closing the page stops the match. Per-call deadline: ')+$('deadline').value+pick(' 秒；30 AI credits 是软上限；停止不能退回已产生的费用。',' seconds; the 30-AI-credit cap is soft; stopping cannot refund incurred charges.');
    $('consent').disabled=!!running;
    var startReason=startBlockReason();$('start').disabled=!!startReason;$('start').title=startReason;
    $('start-hint').textContent=running?'':startReason;$('start-hint').hidden=running||!startReason;
    $('stop').disabled=!match||!(match.status==='running'||match.pending>0);
    $('download').disabled=running||!frames.length;
    $('download-history').disabled=running||!history.length;
    reportControls();
    $('history').replaceChildren();history.forEach(function(record){var tr=document.createElement('tr');[record.config.seed+' / '+record.config.mode+' / '+(record.game.control||'strategic'),record.config.teams.map(function(t){return t.model||t.provider;}).join(' / '),record.status!=='completed'?pick('停止 / 错误，不计胜负','Stopped / Error; Unscored'):record.result?.winner==null?pick('平局','Draw'):record.result.winner===0?pick('蓝方胜','Blue Wins'):pick('红方胜','Red Wins'),record.metrics.map(function(m){return number(m.p95_ms);}).join(' / ')].forEach(function(value){var td=document.createElement('td');td.textContent=value;tr.appendChild(td);});$('history').appendChild(tr);});
    $('replay').disabled=running||!frames.length;
    $('connection').textContent=error?message(error):!discovery?.connection?pick('等待本地后端连接…','Waiting for the Local Backend…'):discovery.loading?pick('正在刷新模型…','Refreshing Models…'):!running&&startReason?startReason:pick('仅点击开始才调用模型。不同场次使用同一种子，并交换双方，可比较胜负。','Only Start Calls Models. Reuse the Seed and Swap Sides to Compare Outcomes.');
    $('connection').dataset.error=error?'true':'false';
    var status=pick('尚未开局 · 地图预览','Not Started · Map Preview');
    if(submitting)status=pick('正在准备对局…','Preparing Match…');
    else if(match){
      if(match.status==='running')status=match.simulation_paused_for_rate?pick('限流公平暂停：双方战场冻结，额度恢复后继续','Rate Admission Pause: Both Sides Frozen Until Capacity Returns'):match.config.mode==='sync'&&match.pending?pick('同步：等待双方决策，战场暂停','Sync: Waiting for Both Decisions; Battlefield Paused'):pick('对战进行中','Match in Progress');
      else if(match.status==='completed')status=match.result?.winner==null?pick('对局结束 · 平局','Match Complete · Draw'):match.result.winner===0?pick('对局结束 · 蓝方获胜','Match Complete · Blue Wins'):pick('对局结束 · 红方获胜','Match Complete · Red Wins');
      else status=pick('对局已停止 · ','Match Stopped · ')+({user_stopped:pick('手动停止','Stopped by User'),viewer_disconnected:pick('页面心跳中断','Viewer Disconnected'),connection_lost:pick('连接中断，停止状态未确认；请刷新连接','Connection Lost; Stop Unconfirmed. Refresh Connection'),provider_error:pick('模型错误，不判定胜负','Model Error; No Winner'),wall_time_limit:pick('达到墙钟时间上限','Wall-Time Limit')}[match.reason]||match.reason);
      if(match.retention?.frames_dropped||match.retention?.decisions_dropped)status+=pick(' · 长局仅保留最近回放与输入；累计 KPI 保留',' · Long Match: Recent Replay/Inputs Only; Cumulative KPIs Retained');
      if(match.result?.reason==='decision_budget')status+=pick(' · 双方调用预算已用完',' · Both Decision Budgets Exhausted');
      if(match.pending&&match.status!=='running')status+=pick(' · 正在取消调用…',' · Cancelling Calls…');
    }
    if(match?.status==='running'&&!match.pending&&match.game.tick>=10&&match.game.stats.every(function(s){return s.moved===0&&s.shots===0;}))status+=pick(' · 尚无有效移动或发射，请查看执行原因与失败计数',' · No Effective Movement or Shot Yet; See Execution Reasons and Failure Counts');
    $('status').textContent=status;$('status').dataset.error=match?.reason==='provider_error'?'true':'false';
    $('clock').textContent=match?pick('模拟 ','Sim ')+number(match.game.tick*core.tickMs/1000)+' / '+(match.config.duration_s===null?pick('无限制','Unlimited'):match.config.duration_s+' s')+' · '+pick('实际 ','Wall ')+number(match.wall_ms)+' ms':'';
    metrics();renderTask();draw(frames.length&&!running?frames[Number($('replay').value)]||match.game:match?match.game:preview);
    var shown=match?match.game:preview;
    $('log').replaceChildren();(match?.decisions||[]).forEach(function(row){var tr=document.createElement('tr');tr.dataset.error=row.error?'true':'false';[row.round+' / '+(row.side===0?'Blue':'Red'),row.decision?Object.entries(row.decision).map(function(e){return e.join(': ');}).join(' · '):'—',number(row.elapsed_ms)+' ms / '+number(row.state_age_ms)+' ms',row.error?message(row.error):row.applied?pick('指令已接收（不等于位移）','Orders Accepted (Not Proof of Movement)'):pick('未执行（对局已结束）','Not Applied (Match Ended)')].forEach(function(value){var td=document.createElement('td');td.textContent=value;tr.appendChild(td);});$('log').appendChild(tr);});
  }
  async function api(action,body,keepalive){
    if(!discovery?.connection)throw new Error('network');
    var response=await fetch('/api/jev/arena/'+action,{method:'POST',credentials:'same-origin',keepalive:!!keepalive,headers:{'Content-Type':'application/json','X-Jev-Csrf':discovery.connection.csrf},body:JSON.stringify(body),signal:keepalive?undefined:AbortSignal.timeout(10000)});
    var data=await response.json();if(!response.ok)throw new Error(data.error?.code||'network');return data;
  }
  function accept(data){if(data?.schema!=='study-room.tank-match.v1'||!data.game||!Array.isArray(data.metrics)||data.metrics.length!==2||!Array.isArray(data.decisions))throw new Error('network');match=data;}
  async function loadReplay(){
    if(replayLoading||frames.length||!match||active())return;replayLoading=true;var sequence=revision;
    try{var data=await api('replay',{id:match.id});if(sequence!==revision)return;accept(data);frames=data.frames||[];if(!history.some(function(r){return r.id===data.id;})){history.push(data);if(history.length>10)history.shift();}$('replay').max=Math.max(0,frames.length-1);$('replay').value=$('replay').max;}
    catch(_){if(sequence===revision)error='network';}finally{if(sequence===revision){replayLoading=false;render();}}
  }
  async function poll(){
    if(!match)return;var sequence=revision;
    try{var data=await api('state',{id:match.id});if(sequence!==revision)return;accept(data);failures=0;render();}
    catch(_){if(sequence!==revision)return;failures++;error='network';render();}
    if(failures>=3){try{accept(await api('stop',{id:match.id}));}catch(_){match={...match,status:'disconnected',reason:'connection_lost',pending:0,result:null};}render();return;}
    if(active())pollTimer=setTimeout(poll,250);else await loadReplay();
  }
  async function start(){
    if($('start').disabled)return;
    if(shell)shell.close();
    revision++;replaySelected=false;clearTimeout(pollTimer);submitting=true;replayLoading=false;frames=[];match=null;error='';render();
    try{accept(await api('start',config()));failures=0;$('report-scope').value='current';}
    catch(e){error=errors[e.message]?e.message:'network';}
    finally{submitting=false;render();}
    if(match){if(document.hidden)leave();poll();}
  }
  async function stop(){if(!match)return;try{accept(await api('stop',{id:match.id}));error='';}catch(_){error='network';}render();}
  function leave(){if(match&&active())api('stop',{id:match.id},true).catch(function(){});}
  function changed(event){if(active())return;if($('control').value==='step'){if($('input-profile').value==='utility-planner'&&(event?.target===$('input-profile')||!['tactical','friendly-fire'].includes($('ruleset').value)))$('ruleset').value='friendly-fire';else if($('input-profile').value==='utility-tactics'&&!['tactical','friendly-fire'].includes($('ruleset').value))$('ruleset').value='tactical';}revision++;replaySelected=false;clearTimeout(pollTimer);replayLoading=false;match=null;frames=[];error='';$('consent').checked=false;preview=core.create($('seed').value||'preview',$('control').value,$('control').value==='step'?$('input-profile').value:'raw',$('control').value==='step'?$('ruleset').value:'cardinal');render();}
  document.addEventListener('jev-playground-discovery',function(event){discovery=event.detail;render();});
  $('refresh').addEventListener('click',function(){document.dispatchEvent(new Event('jev-refresh-discovery'));});
  ['blue','red','mode','control','duration','deadline','rate-mode','ruleset','input-profile'].forEach(function(id){$(id).addEventListener('change',changed);});$('seed').addEventListener('input',changed);
  $('random').addEventListener('click',function(){$('seed').value='map-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36);changed();});
  $('swap').addEventListener('click',function(){var blue=$('blue').value;$('blue').value=$('red').value;$('red').value=blue;changed();});
  ['task-side','task-tank','task-action'].forEach(function(id){$(id).addEventListener('change',renderTask);});
  $('copy-report').addEventListener('click',function(){copyReport(false);});$('copy-json').addEventListener('click',function(){copyReport(true);});$('report-scope').addEventListener('change',reportControls);$('report-import').addEventListener('change',importReport);
  $('consent').addEventListener('change',render);$('start').addEventListener('click',start);$('stop').addEventListener('click',stop);
  ['blue','red'].forEach(function(side){$(side+'-model-switch').addEventListener('click',function(){if(active())return;if(shell)shell.open('settings',this);$(side).focus();});});
  $('show-routes').addEventListener('change',function(){draw(replaySelected&&frames.length?frames[Number($('replay').value)]||preview:match?.game||preview);});
  $('replay').addEventListener('input',function(){var frame=frames[Number(this.value)];if(!frame)return;replaySelected=true;draw(frame);$('replay-label').textContent=pick('回放 tick ','Replay Tick ')+frame.tick+' · '+this.value+' / '+this.max+pick(' · KPI 为整局统计',' · KPIs Are Whole-Match Totals');});
  $('download').addEventListener('click',function(){if(!match||active()||!frames.length)return;var url=URL.createObjectURL(new Blob([JSON.stringify({...match,frames:frames},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='tank-match-'+match.config.seed+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);});
  $('download-history').addEventListener('click',function(){if(active()||!history.length)return;var url=URL.createObjectURL(new Blob([JSON.stringify({schema:'study-room.tank-match-set.v1',scope:'Manually started trials; match outcomes are not accuracy. Incomplete matches are unscored.',matches:history},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='tank-match-set.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);});
  document.addEventListener('visibilitychange',function(){if(document.hidden)leave();});window.addEventListener('pagehide',leave);
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
});

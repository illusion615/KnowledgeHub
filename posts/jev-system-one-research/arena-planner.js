/* Bounded public-state rollout planner. Application search + native model ranking,
   NOT trained combat skill. Uses the actual engine; never reads pending orders.
   Lazy core lookup avoids the core -> task dependency cycle in Node and browser. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'),require('./arena-geometry'),require('./arena-strategy'),require('./arena-tactical-policy'),require('./arena-progress'),require('./arena-intent'),require('./arena-exchange'),function(){return require('./arena-core');});
  else root.JevArenaPlanner=factory(root.JevArenaCombat,root.JevArenaGeometry,root.JevArenaStrategy,root.JevArenaTacticalPolicy,root.JevArenaProgress,root.JevArenaIntent,root.JevArenaExchange,function(){return root.JevArena;});
}(typeof window!=='undefined'?window:this,function(combat,geometry,strategy,tactics,progress,intent,exchange,getCore){
  'use strict';
  var VERSION='tank-opponent-rollout-v1',HORIZON=24,SHORTLIST=6,MODEL_SCALE=12;
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function copy(v){return JSON.parse(JSON.stringify(v));}
  function versionFor(g){if(g.planner_revision==='deadlock-recovery-v6')return 'tank-deadlock-recovery-v6';if(exchange.enabled(g))return 'tank-exchange-aware-v5';if(intent.enabled(g))return 'tank-persistent-intent-v4';if(tactics.enabled(g))return geometry.friendlyFire(g)?'tank-planner-friendly-fire-v3':'tank-opponent-rollout-v3';if(g.planner_revision==='resource-terrain-v2')return geometry.friendlyFire(g)?'tank-planner-friendly-fire-v2':'tank-opponent-rollout-v2';return geometry.friendlyFire(g)?'tank-planner-friendly-fire-v1':VERSION;}
  function world(snapshot){
    // Whitelist reconstruction: neither orders nor pending_action survives.
    return {planner_revision:snapshot.planner_revision,version:snapshot.version,ruleset:snapshot.ruleset,control:'step',input_profile:'utility-planner',tick:snapshot.tick,map:snapshot.map.slice(),width:13,height:9,
      rewards:copy(snapshot.rewards||[]),bullets:copy(snapshot.bullets||[]),events:[],event_seq:0,shot_seq:Math.max(0,...(snapshot.bullets||[]).map(function(b){return b.id||0;})),
      stats:[0,1].map(function(){return {damage:0,rewards:0,blocked:0,moved:0,move_attempts:0,fire_attempts:0,shots:0,hits:0,invalid_shots:0,friendly_hits:0,friendly_damage:0,friendly_shield_damage:0};}),
      tanks:snapshot.tanks.map(function(t){return {id:t.id,side:t.side,x:t.x,y:t.y,hp:t.hp,shield:t.shield,cooldown:t.cooldown,power_until:t.power_until,wait_streak:t.wait_streak??undefined,recent_positions:copy(t.recent_positions||[]),last_execution:t.last_execution?copy(t.last_execution):null,order:'awaiting_order',pending_action:false,movement:'awaiting_order',moved_cells:0};})};
  }
  function actions(g,t){
    var directionRows=Object.entries(directions);if(exchange.enabled(g)&&t.side===1)directionRows=[directionRows[1],directionRows[0],directionRows[3],directionRows[2]];
    var rows=directionRows.filter(function(e){var x=t.x+e[1][0],y=t.y+e[1][1];return g.map[y]?.[x]==='.'&&!g.tanks.some(function(o){return o.hp>0&&o.id!==t.id&&o.x===x&&o.y===y;});}).map(function(e){return e[0];});
    g.tanks.filter(function(e){return e.side!==t.side&&e.hp>0&&combat.shot(g,t,e,t.side).clear;}).forEach(function(e){rows.push('fire_'+e.id);});
    if(tactics.enabled(g))rows.push('wait');
    return rows.length?rows:['move_up']; // Disclosed trapped forced attempt; no secret wait.
  }
  function plans(g,side,allowed){
    var result=[{}],destinations={};
    g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).forEach(function(t){
      var keys=actions(g,t).filter(function(a){return !allowed||Object.hasOwn(allowed[t.id].criteria,a);});
      if(!keys.length)keys=Object.keys(allowed[t.id].criteria).slice(0,1);
      destinations[t.id]={};keys.forEach(function(a){var d=directions[a];destinations[t.id][a]=d?(t.x+d[0])+','+(t.y+d[1]):null;});
      result=result.flatMap(function(p){return keys.map(function(a){return Object.assign({},p,{[t.id]:a});});});
    });
    var legal=result.filter(function(p){var cells=Object.entries(p).map(function(e){return destinations[e[0]][e[1]];}).filter(Boolean);return new Set(cells).size===cells.length;});
    return {plans:legal.length?legal:result,joint_fallback:!legal.length};
  }
  // Existing-projectile risk only, used by the rollout policy, not the engine.
  // Movement occurs at the next four-tick boundary, not instantaneously.
  function incoming(g,t,action){
    var d=directions[action],sim={version:g.version,map:g.map,tanks:g.tanks.map(function(o){return Object.assign({},o);})},me=sim.tanks.find(function(o){return o.id===t.id;}),bullets=g.bullets.map(function(b){return Object.assign({},b);}),damage=0;
    for(var tick=1;tick<=6;tick++){
      if(d&&(g.tick+tick)%4===0){me.x=t.x+d[0];me.y=t.y+d[1];d=null;}
      bullets=bullets.filter(function(b){var hit=geometry.advance(sim,b);if(hit?.kind==='tank'&&hit.tank.id===t.id)damage+=b.damage;return !hit&&b.life>0;});
    }return Math.max(0,damage-t.shield);
  }
  // Pre-inference lane check: one joint action, existing bullets and proposed
  // friendly shots in the actual engine. No new enemy orders or hidden orders.
  function laneForecast(snapshot,side,plan,delay){
    var g=world(snapshot),core=getCore(),horizon=delay+12;
    for(var tick=0;tick<horizon;tick++){
      if(tick===delay)core.applyPlan(g,side,plan);
      core.step(g);if(core.result(g,false))break;
    }
    return {horizon_ticks:horizon,friendly_hits:g.stats[side].friendly_hits,friendly_hp_damage:g.stats[side].friendly_damage,friendly_shield_damage:g.stats[side].friendly_shield_damage};
  }
  function policy(g,side,kind,referenceOverride){
    var tactical=tactics.enabled(g)&&kind==='evasive',enhanced=(g.planner_revision==='resource-terrain-v2'||tactical)&&kind==='evasive',guides=referenceOverride||(tactical?tactics.choose(g,side):enhanced?strategy.choose(g,side):{}),selected={},reserved=new Set(),tanks=g.tanks.filter(function(t){return t.side===side&&t.hp>0;});
    if(Math.floor(g.tick/4)%2)tanks.reverse();
    tanks.forEach(function(t){
      var info=combat.analyse(g,t),keys=actions(g,t),best=-Infinity;
      keys.forEach(function(a){
        var d=directions[a],score;
        if(d){var x=t.x+d[0],y=t.y+d[1];if(reserved.has(x+','+y))return;var steps=info.distances[y]?.[x];score=-2*(steps??100)-.1*(t.recent_positions||[]).filter(function(p){return p.x===x&&p.y===y;}).length;
          if(kind==='evasive')g.rewards.forEach(function(r){if(r.x===x&&r.y===y)score+=r.type==='repair'?Math.min(30,100-t.hp):r.type==='shield'?Math.max(0,30-t.shield):8;});
        }else if(a==='wait'){var waiting=tactics.waitAssessment(g,t);score=waiting.eligible?-waiting.penalty:-1000;
        }else{var target=g.tanks.find(function(e){return e.id===a.slice(5);}),shot=combat.shot(g,t,target,side),victim=shot.victim,damage=t.power_until>g.tick?20:12;score=20+(damage>=victim.hp+victim.shield?80:0)-.01*victim.hp;}
        if(enhanced){var guide=guides[t.id];if(guide?.action===a&&(d||tactical))score=guide.value;else if(!d&&a!=='wait')score-=6*t.cooldown;}
        if(tactical&&a==='wait'&&incoming(g,t,a)>0)score=-1000;
        if(kind==='evasive')score-=4*incoming(g,t,a);
        if(score>best){best=score;selected[t.id]=a;}
      });
      if(!selected[t.id])selected[t.id]=keys[0];var d=directions[selected[t.id]];if(d)reserved.add((t.x+d[0])+','+(t.y+d[1]));
    });return selected;
  }
  function totals(g,side){var tanks=g.tanks.filter(function(t){return t.side===side&&t.hp>0;});return {alive:tanks.length,hp:tanks.reduce(function(n,t){return n+t.hp;},0),shield:tanks.reduce(function(n,t){return n+t.shield;},0)};}
  function value(g,side){
    var own=totals(g,side),enemy=totals(g,1-side);
    if(exchange.enabled(g)){
      var distance=function(s){return g.tanks.filter(function(t){return t.side===s&&t.hp>0;}).reduce(function(n,t){return n+Math.min(combat.analyse(g,t).current??20,20);},0);};
      return exchange.utility(own,enemy)+(!own.alive||!enemy.alive?0:2*(distance(1-side)-distance(side)));
    }
    if(!own.alive||!enemy.alive)return !own.alive&&!enemy.alive?0:own.alive?1000+own.hp:-1000-enemy.hp;
    var progress=0;
    g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).forEach(function(t){var info=combat.analyse(g,t);progress-=2*Math.min(info.current??20,20);});
    return 65*(own.alive-enemy.alive)+own.hp-enemy.hp+.8*(own.shield-enemy.shield)+progress; // Buffs matter through simulated damage, not a bonus for postponing pickup.
  }
  function rollout(snapshot,side,plan,opponent,delay){
    var g=world(snapshot),core=getCore(),readyAt=[null,null],rootPending=true,pickupTypes={repair:0,shield:0,power:0},damageTempo=0;
    var routeMemory=snapshot.intent_context?intent.fromContext(g,snapshot.intent_context):null;
    for(var tick=0;tick<HORIZON;tick++){
      var pairedReady=delay!==0||[0,1].every(function(s){return core.sideReady(g,s);});
      for(var s=0;s<2;s++)if(pairedReady&&core.sideReady(g,s)){
        if(readyAt[s]===null)readyAt[s]=g.tick+(s===side?delay:0);
        if(g.tick>=readyAt[s]){var root=s===side&&rootPending,ctx=s===side&&routeMemory?(root?snapshot.intent_context:intent.prepare(g,side,routeMemory)):null;
          var p=root?plan:ctx?.follow||policy(g,s,s===side?'evasive':opponent,ctx?.references);if(ctx&&!root&&!ctx.follow)p=Object.assign(p,ctx.fixed_actions);
          if(ctx)intent.accept(g,side,routeMemory,p,ctx,!root&&!!ctx.follow);core.applyPlan(g,s,p);if(s===side)rootPending=false;readyAt[s]=null;}
      }
      var oldOwnDamage=g.stats[side].damage,oldEnemyDamage=g.stats[1-side].damage;core.step(g);
      if(tactics.enabled(g))damageTempo+=.25*((g.stats[side].damage-oldOwnDamage)-(g.stats[1-side].damage-oldEnemyDamage))*(HORIZON-tick-1)/HORIZON;
      g.events.filter(function(e){return e.tick===g.tick&&e.kind==='pickup'&&e.side===side;}).forEach(function(e){pickupTypes[e.reward]++;});if(core.result(g,false))break;
    }
    var terminal=core.result(g,false),tempo=terminal&&terminal.winner!==null?(terminal.winner===side?1:-1)*(HORIZON-(g.tick-snapshot.tick))*2:0;
    return {damage_tempo:damageTempo,wait_ticks:g.stats[side].tactical_wait_ticks||0,wait_cost:tactics.enabled(g)?.75*(g.stats[side].tactical_wait_ticks||0):0,pickup_types:pickupTypes,power_value:strategy.potential(g,side),opponent:opponent,ticks:g.tick-snapshot.tick,own:totals(g,side),enemy:totals(g,1-side),damage_dealt:g.stats[side].damage,damage_taken:g.stats[1-side].damage+g.stats[side].friendly_damage,friendly_hp_damage:g.stats[side].friendly_damage,friendly_shield_damage:g.stats[side].friendly_shield_damage,pickups:g.stats[side].rewards,value:value(g,side)+tempo+damageTempo-2*(g.stats[side].friendly_damage+g.stats[side].friendly_shield_damage)-(tactics.enabled(g)?.75*(g.stats[side].tactical_wait_ticks||0):0)};
  }
  function build(request,snapshot,options){
    if(options?.cache_analysis){var cached=combat.withAnalysisCache(function(){return buildUncached(request,snapshot,options);});return Object.assign(cached.value,{search_cache:cached.stats});}
    return buildUncached(request,snapshot,options);
  }
  function buildUncached(request,snapshot,options){
    options=options||{};
    if(options.search_policy!==undefined&&!['anti-cycle-v1','survival-anti-cycle-v1','neutral-route-v1','stagnation-rescue-v1','progress-obligation-v1'].includes(options.search_policy))throw new Error('invalid_search_policy');
    var neutralRoute=options.search_policy==='neutral-route-v1',survivalFirst=options.search_policy==='survival-anti-cycle-v1',antiCycle=options.search_policy==='anti-cycle-v1'||survivalFirst,repeatWeight=antiCycle?2:.25,routeWeight=antiCycle||neutralRoute?0:4;
    var delay=options.decision_delay_ticks??1;
    if(!Number.isInteger(delay)||delay<0||delay>6)throw new Error('invalid_planner_delay');
    if(!geometry.enabled(snapshot))throw new Error('planner_requires_tactical');
    var g=world(snapshot),ids=Object.keys(request.states[0].questions),side=g.tanks.find(function(t){return t.id===ids[0];}).side,candidates=plans(g,side,request.states[0].questions),before={own:totals(g,side),enemy:totals(g,1-side)};
    var tactical=tactics.enabled(g),enhanced=g.planner_revision==='resource-terrain-v2'||tactical,guides=snapshot.intent_context?.references||(tactical?tactics.choose(g,side):enhanced?strategy.choose(g,side):null);
    var audit=candidates.plans.map(function(p,index){
      var outcomes=['attack','evasive'].map(function(opponent){return rollout(snapshot,side,p,opponent,delay);}),values=outcomes.map(function(o){return o.value;}),worst=Math.min(...values),mean=values.reduce(function(n,v){return n+v;},0)/values.length;
      // Small public history tie-break; it cannot outweigh a hit or casualty.
      var repeats=Object.entries(p).reduce(function(n,e){var t=g.tanks.find(function(t){return t.id===e[0];}),d=directions[e[1]];return n+(d?(t.recent_positions||[]).filter(function(pos){return pos.x===t.x+d[0]&&pos.y===t.y+d[1];}).length:0);},0);
      var routePrior=enhanced?Object.entries(p).reduce(function(n,e){return n+(guides[e[0]]?.action===e[1]?routeWeight:0);},0):0;
      var waitAudit=tactical?Object.entries(p).filter(function(e){return e[1]==='wait';}).map(function(e){var t=g.tanks.find(function(t){return t.id===e[0];}),assessment=tactics.waitAssessment(g,t);return Object.assign({tank:t.id,incoming_hp:incoming(g,t,'wait')},assessment);}):[],waitPenalty=waitAudit.reduce(function(n,a){return n+a.penalty;},0);
      return {exchange:exchange.enabled(g)?exchange.summary(before,outcomes):null,wait_audit:waitAudit,wait_penalty:waitPenalty,route_prior:routePrior,plan_index:index,plan:p,outcomes:outcomes,search_value:.7*worst+.3*mean-repeatWeight*repeats+routePrior-waitPenalty,repeat_visits:repeats,lane_safety:geometry.friendlyFire(g)?laneForecast(snapshot,side,p,delay):null};
    });
    var safe=audit.filter(function(a){return !a.lane_safety||a.lane_safety.friendly_hits===0;}),eligible=safe.length?safe:audit;
    var stagnationRescue=null;
    if(options.search_policy==='stagnation-rescue-v1'){
      var incumbent=eligible.slice().sort(function(a,b){return b.search_value-a.search_value||a.plan_index-b.plan_index;})[0],minimumAlive=Math.min(...incumbent.outcomes.map(function(o){return o.own.alive;}));
      var triggered=incumbent.repeat_visits>=3&&Math.max(...incumbent.outcomes.map(function(o){return o.damage_dealt;}))<=12;
      stagnationRescue={triggered:triggered,incumbent_index:incumbent.plan_index,incumbent_repeat_visits:incumbent.repeat_visits,predicted_min_survivors:minimumAlive};
      if(triggered){eligible=eligible.filter(function(a){return Math.min(...a.outcomes.map(function(o){return o.own.alive;}))>=minimumAlive;});audit.forEach(function(a){a.search_value-=a.route_prior+1.75*a.repeat_visits;a.route_prior=0;});}
    }
    var survivalGate=null;
    if(survivalFirst){var survivors=Math.max(...eligible.map(function(a){return Math.min(...a.outcomes.map(function(o){return o.own.alive;}));}));eligible=eligible.filter(function(a){return Math.min(...a.outcomes.map(function(o){return o.own.alive;}))===survivors;});survivalGate={predicted_min_survivors:survivors,eligible_plan_indices:eligible.map(function(a){return a.plan_index;}),scope:'Worst predicted own survivors across disclosed opponent policies; not an actual survival guarantee.'};}
    var progressGate=null;
    if(options.search_policy==='progress-obligation-v1'){
      var observed=progress.context(snapshot,side),triggered=observed.known&&!!observed.attack_goal;
      progressGate={observation:observed,triggered:triggered,applied:false,reason:observed.known?'recent_real_progress':'unknown_progress',eligible_plan_indices:eligible.map(function(a){return a.plan_index;})};
      if(triggered){
        var goal=observed.attack_goal,minimumAlive=Math.max(...eligible.map(function(a){return Math.min(...a.outcomes.map(function(o){return o.own.alive;}));}));
        var exchangeMode=exchange.enabled(g);
        if(!exchangeMode)eligible=eligible.filter(function(a){return Math.min(...a.outcomes.map(function(o){return o.own.alive;}))===minimumAlive;});
        var bestExchange=exchangeMode?Math.max(...eligible.map(function(a){return a.exchange.robust_change;})):null;
        function readyShot(a,primaryOnly){return Object.entries(a.plan).some(function(e){var t=g.tanks.find(function(t){return t.id===e[0];});return e[1]==='fire_'+goal.target&&(primaryOnly?t.id===goal.attacker:exchangeMode||t.hp>35)&&t.cooldown===0&&(exchangeMode?a.exchange.robust_change>=bestExchange-1e-9:incoming(g,t,e[1])<t.hp);});}
        var attacking=eligible.filter(function(a){return readyShot(a,true);});if(!attacking.length)attacking=eligible.filter(function(a){return readyShot(a,false);});
        progressGate.minimum_predicted_survivors=exchangeMode?null:minimumAlive;progressGate.exchange_guard=exchangeMode?{best_robust_change:bestExchange,scope:'A forced ready attack must not worsen the best available risk-adjusted health exchange; own losses are not categorically forbidden.'}:null;progressGate.applied=attacking.length>0;progressGate.reason=attacking.length?'execute_ready_attack_now':exchangeMode?'no_exchange_preserving_ready_attack':'no_survivor_preserving_ready_attack';
        if(attacking.length)eligible=attacking;
        progressGate.eligible_plan_indices=eligible.map(function(a){return a.plan_index;});
      }
    }
    var waitGate=null;
    if(tactical){var active=eligible.filter(function(a){return !a.wait_audit.length;}),bestActive=active.length?Math.max(...active.map(function(a){return a.search_value;})):null;
      var admitted=eligible.filter(function(a){return !a.wait_audit.length||a.wait_audit.every(function(w){return w.eligible&&w.incoming_hp===0;})&&(bestActive===null||a.search_value>=bestActive+2);});
      // If every root requires a trapped tank to wait, retain the least-bad legal
      // choices and disclose that no alternative met the tactical gate.
      waitGate={best_nonwait_value:bestActive,required_margin:2,no_admissible_alternative:!admitted.length,eligible_plan_indices:(admitted.length?admitted:eligible).map(function(a){return a.plan_index;})};if(admitted.length)eligible=admitted;
    }
    var ranked=eligible.slice().sort(function(a,b){return b.search_value-a.search_value||a.plan_index-b.plan_index;}),shortlist=ranked.slice(0,SHORTLIST),questions={};
    shortlist.forEach(function(row,i){row.question_id='plan_'+i;var worst=row.outcomes.slice().sort(function(a,b){return a.value-b.value;})[0];
      questions[row.question_id]={type:'boolean',instructions:(tactical?'Root '+JSON.stringify(row.plan)+'. Roles '+Object.entries(guides).map(function(e){return e[0]+':'+e[1].role;}).join(',')+'. Wait cost '+row.wait_penalty+'; predicted waiting '+worst.wait_ticks+' tank-ticks. ':'')+'Projection, not a guarantee. Before: our '+before.own.alive+' tanks, '+before.own.hp+' HP; enemy '+before.enemy.alive+' tanks, '+before.enemy.hp+' HP. After the less favorable predicted response: our '+worst.own.alive+' tanks, '+worst.own.hp+' HP, '+worst.own.shield+' shield; enemy '+worst.enemy.alive+' tanks, '+worst.enemy.hp+' HP, '+worst.enemy.shield+' shield. We deal '+worst.damage_dealt+' HP damage, take '+worst.damage_taken+' HP damage, collect '+worst.pickups+' resources.'+(enhanced?' Repair/shield/power counts: '+worst.pickup_types.repair+'/'+worst.pickup_types.shield+'/'+worst.pickup_types.power+'. Remaining usable power value: '+Math.round(worst.power_value)+'.':'')+(geometry.friendlyFire(g)?' Predicted friendly fire: '+worst.friendly_hp_damage+' HP and '+worst.friendly_shield_damage+' shield damage. Keep teammates out of existing and planned firing lanes.':'')+'\nStatement: this joint plan creates a favorable position for our team to win the battle.'};
    });
    var result={intent_context:snapshot.intent_context||null,progress_gate:progressGate,stagnation_rescue:stagnationRescue,survival_gate:survivalGate,wait_gate:waitGate,strategy_reference:guides,version:versionFor(g),planner:true,lane_safety:{enabled:geometry.friendlyFire(g),eligible_plan_indices:eligible.map(function(a){return a.plan_index;}),no_safe_plan:!safe.length,enemy_positions_frozen:true,new_enemy_orders:false,horizon_ticks:delay+12},request:{states:[{id:'arena',state:(snapshot.intent_context?'Persistent application goals and conditional routes: '+JSON.stringify(Object.fromEntries(Object.entries(snapshot.intent_context.references).map(function(e){var r=e[1];return [e[0],{goal:r.type||'attack',enemy:r.enemy_id,destination:r.target,prefix:r.path.slice(0,3),fixed:snapshot.intent_context.fixed_actions[e[0]]||null}];})))+'. A selected matching route move approves at most two more moves over 24 ticks, revalidated for threats, obstruction and firing opportunities. Other decisions still need scoring; no automatic firing. ':'')+(progressGate?.observation.known?'Actual execution: no enemy HP/shield loss for '+progressGate.observation.quiet_ticks+' ticks. Persistent attack goal '+JSON.stringify(progressGate.observation.attack_goal)+'. Current attack obligation '+(progressGate.applied?'active; root includes a ready shot with survivor-preserving forecasts':'inactive')+'. This is measured history, not simulated damage. ':'')+(tactical?'Tactical v3: wait holds 4 ticks without firing and needs a forecast advantage over nonwait. HP<=35 seeks repair; shields support assault with allied fire; active power prioritizes prompt damage. ':'')+(enhanced?'Resource/terrain v2: continuation chooses useful supplies, threat-weighted routes and reload cover. Resource targets are reserved for one ally; buffs matter through damage, not hoarding. Pickup counts alone are not gains. ':'')+'Evaluate joint tank plans using bounded simulated outcomes. Both teams move and shoot; enemy policies are attack and projectile-evasion. These are uncertain forecasts, not observed future events. Prefer defeating enemies while retaining a fighting force; accepting damage can be worthwhile for kills. Scores are independent preferences, not calibrated win probabilities.',questions:questions}]},plans:candidates.plans,shortlist:shortlist.map(function(r){return {question_id:r.question_id,plan_index:r.plan_index};}),plan_audit:audit,before:before,joint_fallback:candidates.joint_fallback,assumptions:{exchange_payoff:exchange.enabled(g)?{version:exchange.version,effective_health:'HP+shield',survivor_difference_weight:65,health_share_weight:100,absolute_health_difference_weight:.25,terminal_base:1000,worst_weight:.7,mean_weight:.3,scope:'Health utility is zero-sum for a fixed outcome; total search also has route/time/safety heuristics. Two response policies are not a solved equilibrium.'}:null,search_policy:options.search_policy==='progress-obligation-v1'?'progress-obligation-v1':options.search_policy==='stagnation-rescue-v1'?'stagnation-rescue-v1':neutralRoute?'neutral-route-v1':survivalFirst?'survival-anti-cycle-v1':antiCycle?'anti-cycle-v1':'original',repeat_penalty:stagnationRescue?.triggered?2:repeatWeight,strategy_revision:g.planner_revision==='deadlock-recovery-v6'?'deadlock-recovery-v6':exchange.enabled(g)?exchange.version:intent.enabled(g)?intent.version:tactical?tactics.revision:enhanced?'resource-terrain-v2':'legacy-v1',wait_duration_ticks:tactical?4:null,wait_cost_per_tick:tactical?.75:0,early_damage_weight:tactical?.25:0,wait_root_penalty_base:tactical?3:0,max_consecutive_waits:tactical?2:null,route_prior_per_tank:stagnationRescue?.triggered?0:enhanced?routeWeight:0,horizon_ticks:HORIZON,decision_delay_ticks:delay,opponent_delay_ticks:0,scheduling:delay===0?'paired_after_action':'independent_after_action',opponent_policies:['attack','evasive'],own_continuation:enhanced?'resource_terrain':'evasive',actual_engine:true,hidden_orders_used:false,model_scale:MODEL_SCALE,shortlist_limit:SHORTLIST,worst_weight:.7,friendly_fire:geometry.friendlyFire(g),friendly_damage_penalty:2},search_only_plan:ranked[0].plan};
    if(snapshot.intent_context){
      var rows=Object.entries(snapshot.intent_context.references).map(function(e){var r=e[1];return [e[0],r.type||'attack',r.enemy_id,r.target?r.target.x+','+r.target.y:null,r.path.slice(0,3).map(function(p){return [p.x,p.y];}),snapshot.intent_context.fixed_actions[e[0]]||null];});
      result.request.states[0].state='Goal: destroy enemies, retain our team. 24-tick real-engine forecasts vs attack/evasion, not guarantees or calibrated win probabilities. Intent rows [tank,goal,enemy,destination,route prefix,fixed root]: '+JSON.stringify(rows)+'. Matching route root approves up to TWO extra moves / 24 ticks. Recheck occupancy, bullets, exposure, ready shots, health, target and ally conflicts before each; invalidate then replan, never auto-fire. Fixed roots are application orders. '+(progressGate?.observation.known?'Observed quiet ticks '+progressGate.observation.quiet_ticks+'; attack goal '+JSON.stringify(progressGate.observation.attack_goal)+'; root attack gate '+progressGate.applied+'. Observations are not forecasts.':'');
    }
    if(exchange.enabled(g)){
      var state=result.request.states[0];
      state.state=exchange.neutralText('Goal: win, retain our team. Forecast 24 ticks vs attack/evasion; uncertain, not win probabilities. '+(snapshot.intent_context?'Intent [tank,goal,enemy,destination,prefix,fixed root]: '+JSON.stringify(rows)+'. Matching root approves <=2 extra moves/24 ticks; check blocking, bullets, exposure, ready shots, health, target, ally conflicts; invalidate then replan. No auto-fire; fixed roots are program orders. ':'')+'EHP=HP+shield; d=own-enemy. Health value=65*dUnits+100*dEHP/(sum EHP)+.25*dEHP. Win=1000+remaining EHP; loss is negative; mutual elimination=0. Rank 70% worst+30% mean. Favor positive exchanges even with own losses; negative favors protection. Before [units,HP,shield]: '+JSON.stringify([[before.own.alive,before.own.hp,before.own.shield],[before.enemy.alive,before.enemy.hp,before.enemy.shield]])+'. '+(progressGate?.observation.known?'Observed quiet ticks='+progressGate.observation.quiet_ticks+'; goal='+JSON.stringify(progressGate.observation.attack_goal)+'; attack gate='+progressGate.applied+'.':''),side);
      shortlist.forEach(function(row){state.questions[row.question_id].instructions=exchange.neutralText('Root '+JSON.stringify(row.plan)+'. Forecasts against attack/evasion; each row=[own units,HP,shield; enemy units,HP,shield; dealt/taken HP; friendly HP/shield; pickups repair/shield/power; wait ticks/cost]: '+JSON.stringify(row.outcomes.map(function(o){return [[o.own.alive,o.own.hp,o.own.shield],[o.enemy.alive,o.enemy.hp,o.enemy.shield],[o.damage_dealt,o.damage_taken],[o.friendly_hp_damage,o.friendly_shield_damage],[o.pickup_types.repair,o.pickup_types.shield,o.pickup_types.power],[o.wait_ticks,o.wait_cost]];}))+'. Health value changes '+JSON.stringify(row.exchange.outcomes.map(function(o){return Number(o.utility_change.toFixed(3));}))+'. Root wait cost '+row.wait_penalty+'. Stance '+row.exchange.stance+'. Statement: this is a favorable risk-adjusted joint plan, not merely minimum own damage.',side);});
    }
    return result;
  }
  function select(scores,wire){
    var expected=wire.shortlist.map(function(r){return r.question_id;}).sort();
    if(!scores||typeof scores!=='object'||Array.isArray(scores)||Object.keys(scores).sort().join()!==expected.join()||Object.values(scores).some(function(v){return typeof v!=='number'||!isFinite(v)||v<0||v>1;}))throw new Error('invalid_planner_scores');
    var ranked=wire.shortlist.map(function(s){var row=wire.plan_audit[s.plan_index],model=scores[s.question_id];return {question_id:s.question_id,plan_index:s.plan_index,model_score:model,search_value:row.search_value,combined_value:row.search_value+MODEL_SCALE*(model-.5)};}).sort(function(a,b){return b.combined_value-a.combined_value||a.plan_index-b.plan_index;});
    var chosen=wire.plans[ranked[0].plan_index];return {decision:copy(chosen),plan_scores:ranked,search_only_plan:copy(wire.search_only_plan),model_changed_plan:JSON.stringify(chosen)!==JSON.stringify(wire.search_only_plan)};
  }
  // Sufficient (not necessary) certificate: a bounded model preference can
  // change any pairwise gap by at most MODEL_SCALE. No guessed confidence,
  // cached state, or output repair. Applies only to THIS completed shortlist.
  function invocationCertificate(wire){
    if(!wire?.planner||wire.assumptions?.model_scale!==MODEL_SCALE||!Array.isArray(wire.shortlist)||!wire.shortlist.length)return {skip:false,reason:'unsupported_readout'};
    var rows=wire.shortlist.map(function(s){return wire.plan_audit?.[s.plan_index];});
    if(rows.some(function(r){return !r||!Number.isFinite(r.search_value)||!wire.plans?.[r.plan_index];}))return {skip:false,reason:'invalid_search_values'};
    rows.sort(function(a,b){return b.search_value-a.search_value||a.plan_index-b.plan_index;});
    var margin=rows.length===1?null:rows[0].search_value-rows[1].search_value,skip=rows.length===1||margin>MODEL_SCALE+1e-9;
    return {version:'bounded-gap-v1',skip:skip,reason:rows.length===1?'single_candidate':skip?'preference_cannot_change_winner':'model_can_change_ranking',search_gap:margin,maximum_model_gap:MODEL_SCALE,winner_index:rows[0].plan_index,decision:copy(wire.plans[rows[0].plan_index]),scope:'Action-invariance certificate for fixed shortlist and finite 0..1 preferences, not a quality confidence or transport-equivalence claim.'};
  }
  function searchOnly(wire){
    var ranked=wire.shortlist.map(function(s){var row=wire.plan_audit[s.plan_index];return {question_id:s.question_id,plan_index:s.plan_index,model_score:null,search_value:row.search_value,combined_value:row.search_value};}).sort(function(a,b){return b.search_value-a.search_value||a.plan_index-b.plan_index;});
    return {decision:copy(wire.search_only_plan),plan_scores:ranked,search_only_plan:copy(wire.search_only_plan),model_changed_plan:false,search_only:true};
  }
  function read(gates,wire){
    if(!gates||Object.values(gates).some(function(g){return !g||typeof g.p_true!=='number';}))throw new Error('invalid_planner_scores');
    return select(Object.fromEntries(Object.entries(gates).map(function(e){return [e[0],e[1].p_true];})),wire);
  }
  function validateSelfScores(scores,wire){
    var keys=wire.shortlist.map(function(s){return s.question_id;}).sort();
    if(!scores||typeof scores!=='object'||Array.isArray(scores)||Object.keys(scores).sort().join()!==keys.join()||Object.values(scores).some(function(v){return typeof v!=='number'||!isFinite(v)||v<0||v>100;}))throw new Error('arena_invalid_plan');return scores;
  }
  function readSelfScores(scores,wire){
    validateSelfScores(scores,wire);
    var result=select(Object.fromEntries(Object.entries(scores).map(function(e){return [e[0],e[1]/100];})),wire);
    result.plan_scores=result.plan_scores.map(function(s){return Object.assign({},s,{model_score:null,self_preference:scores[s.question_id]});});return result;
  }
  function copilotPrompt(wire){return 'Score ALL supplied joint-plan outcome statements. Return numeric 0..100 self-reported preferences, NOT probabilities or calibrated confidence. Do not return orders, Boolean values, tools or explanations. The application has already screened friendly firing lanes and shortlisted plans where enabled; it chooses search_value + 12 * (preference / 100 - 0.5). Scaling does not make a preference a probability. Output JSON only: {"scores":{"<plan-id>":0}} with exactly every question ID in the contract. Zero is a format example, not a recommendation.\n\nJOINT PLAN SCORING CONTRACT:\n'+JSON.stringify(wire.request);}
  function trace(wire,result,gates,selfScores){return {intent_context:wire.intent_context,progress_gate:wire.progress_gate,stagnation_rescue:wire.stagnation_rescue,survival_gate:wire.survival_gate,wait_gate:wire.wait_gate,strategy_reference:wire.strategy_reference,version:wire.version,lane_safety:wire.lane_safety,model_request:wire.request,assumptions:wire.assumptions,before:wire.before,plans:wire.plans,shortlist:wire.shortlist,plan_audit:wire.plan_audit,joint_fallback:wire.joint_fallback,binary_gates:gates||null,self_scores:selfScores||null,model_request_dispatched:result?!result.search_only:null,score_kind:result?.search_only?'application_search_only':selfScores?'self_reported_plan_preference':gates?'native_plan_preference':null,plan_scores:result?.plan_scores||null,search_only_plan:wire.search_only_plan,model_changed_plan:result?.model_changed_plan??null,readout:!result?'not_completed':result.search_only?'search_only_robust_rollout':selfScores?'robust_rollout_value_plus_12_times_centered_self_preference':'robust_rollout_value_plus_12_times_centered_native_preference'};}
  return {version:VERSION,versionFor:versionFor,laneForecast:laneForecast,build:build,read:read,select:select,searchOnly:searchOnly,invocationCertificate:invocationCertificate,validateSelfScores:validateSelfScores,readSelfScores:readSelfScores,copilotPrompt:copilotPrompt,trace:trace,world:world,actions:actions,policy:policy,rollout:rollout,value:value};
}));

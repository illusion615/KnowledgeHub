/* Public, bounded tactical projections. No opponent pending orders, model calls
   or future knowledge. Forecast assumes a three-tick decision delay, one friendly
   action, frozen enemy positions/no new enemy shots, existing bullets plus proposed own
   shots, and the actual elimination stopping rule. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-geometry'),require('./arena-combat'));else root.JevArenaTactics=factory(root.JevArenaGeometry,root.JevArenaCombat);}(typeof window!=='undefined'?window:this,function(geometry,combat){
  'use strict';
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]},HORIZON=8,DELAY=3;
  function point(t,action){var d=directions[action];return d?{x:t.x+d[0],y:t.y+d[1]}:{x:t.x,y:t.y};}
  function route(world,tank,goal,from){
    var blocked=new Set(world.tanks.filter(function(t){return t.hp>0&&t.id!==tank.id;}).map(function(t){return t.x+','+t.y;}));
    function open(p){return world.map[p.y]?.[p.x]==='.'&&!blocked.has(p.x+','+p.y);}
    if(!open(goal)||!open(from))return null;var queue=[{x:from.x,y:from.y,d:0}],seen=new Set([from.x+','+from.y]);
    for(var i=0;i<queue.length;i++){var p=queue[i];if(p.x===goal.x&&p.y===goal.y)return p.d;Object.values(directions).forEach(function(d){var n={x:p.x+d[0],y:p.y+d[1],d:p.d+1},k=n.x+','+n.y;if(open(n)&&!seen.has(k)){seen.add(k);queue.push(n);}});}return null;
  }
  function forecast(world,side,plan){
    var tanks=world.tanks.map(function(t){return Object.assign({},t);}),bullets=(world.bullets||[]).map(function(b){return Object.assign({},b);}),rewards=(world.rewards||[]).map(function(r){return Object.assign({},r);});
    var sim={version:world.version,map:world.map,tanks:tanks},losses={},gains={},fired=new Set(),ended=false,moveAt=DELAY+4-((world.tick+DELAY)%4);
    tanks.forEach(function(t){losses[t.id]=0;gains[t.id]=0;});
    for(var tick=1;tick<=HORIZON;tick++){
      if(tick===moveAt){var alive=tanks.filter(function(t){return t.hp>0;}),occupied=new Set(alive.map(function(t){return t.x+','+t.y;})),moves=alive.filter(function(t){return t.side===side&&directions[plan[t.id]];}).map(function(t){return {tank:t,to:point(t,plan[t.id])};});
        moves.forEach(function(m){var p=m.to;if(world.map[p.y]?.[p.x]!=='.'||occupied.has(p.x+','+p.y))return;var contenders=moves.filter(function(n){return n.to.x===p.x&&n.to.y===p.y;});if(contenders.length>1&&Number(m.tank.id[1])!==((world.tick+tick)/4-1)%2)return;m.tank.x=p.x;m.tank.y=p.y;});
      }
      tanks.filter(function(t){return t.hp>0;}).forEach(function(t){rewards=rewards.filter(function(r){if(r.x!==t.x||r.y!==t.y)return true;if(r.type==='repair'){var added=Math.min(30,100-t.hp);t.hp+=added;gains[t.id]+=added;}if(r.type==='shield')t.shield=30;if(r.type==='power')t.power_until=world.tick+tick+30;return false;});});
      tanks.filter(function(t){return t.hp>0;}).forEach(function(t){if(t.cooldown>0){t.cooldown--;return;}var action=plan[t.id];if(t.side!==side||tick<=DELAY||fired.has(t.id)||!action?.startsWith('fire_'))return;fired.add(t.id);t.cooldown=5;var target=tanks.find(function(e){return e.id===action.slice(5)&&e.hp>0&&e.side!==side;}),ray=target?geometry.sight(sim,t,target):null;if(ray?.clear)bullets.push({owner:t.id,x:t.x,y:t.y,dx:ray.dx,dy:ray.dy,life:6,side:side,damage:t.power_until>world.tick+tick?20:12});});
      var hits={};bullets=bullets.filter(function(b){var hit=geometry.advance(sim,b);if(hit?.kind==='tank'){hits[hit.tank.id]=(hits[hit.tank.id]||0)+b.damage;return false;}return !hit&&b.life>0;});
      tanks.forEach(function(t){var damage=hits[t.id]||0,absorbed=Math.min(t.shield,damage),hp=Math.min(t.hp,damage-absorbed);t.shield-=absorbed;t.hp-=hp;losses[t.id]+=hp;});
      if([0,1].some(function(s){return !tanks.some(function(t){return t.side===s&&t.hp>0;});})){ended=true;break;}
    }
    var own=tanks.filter(function(t){return t.side===side;});return {known:Array.isArray(world.bullets),ended_at_elimination:ended,horizon_ticks:HORIZON,assumed_decision_delay_ticks:DELAY,move_after_ticks:moveAt,winning:own.some(function(t){return t.hp>0;})&&!tanks.some(function(t){return t.side!==side&&t.hp>0;}),effective_hp:own.reduce(function(n,t){return n+(t.hp>0?t.hp+t.shield:0);},0),survivors:own.filter(function(t){return t.hp>0;}).length,hp:own.reduce(function(n,t){return n+t.hp;},0),tanks:Object.fromEntries(own.map(function(t){return [t.id,{hp_after:t.hp,shield_after:t.shield,incoming_hp_loss:losses[t.id],repair_gain:gains[t.id]}];}))};
  }
  function exposure(world,tank,p){return world.tanks.filter(function(e){return e.side!==tank.side&&e.hp>0&&geometry.sight(world,e,p).clear;});}
  function features(world,tank,action){
    var after=point(tank,action),isMove=!!directions[action],beforeThreats=exposure(world,tank,tank),afterThreats=exposure(world,tank,after),base=forecast(world,tank.side,{}),projected=forecast(world,tank.side,{[tank.id]:action}),resource=null;
    var useful=(world.rewards||[]).filter(function(r){return r.type==='repair'?tank.hp<100||base.tanks[tank.id].incoming_hp_loss>0:r.type==='shield'?tank.shield<30:tank.power_until<=world.tick+6;});
    useful.forEach(function(r){var before=route(world,tank,r,tank),next=route(world,tank,r,after);if(next===null||before!==null&&next>=before)return;var priority=(next===0?0:10)+(r.type==='repair'&&tank.hp<=50?0:r.type==='shield'?1:2);if(!resource||priority<resource.priority||priority===resource.priority&&next<resource.after_steps)resource={type:r.type,x:r.x,y:r.y,before_steps:before,after_steps:next,priority:priority,collects:next===0&&isMove};});
    var target=action.startsWith('fire_')?world.tanks.find(function(t){return t.id===action.slice(5);}):null,shot=target?combat.shot(world,tank,target,tank.side):null;
    var ally=world.tanks.find(function(t){return t.side===tank.side&&t.id!==tank.id&&t.hp>0;}),supports=!!(shot?.clear&&ally&&ally.hp<=50&&geometry.sight(world,shot.victim,ally).clear);
    return {incoming_known:base.known,hp:tank.hp,shield:tank.shield,before_hp_loss:base.tanks[tank.id].incoming_hp_loss,after_hp_loss:projected.tanks[tank.id].incoming_hp_loss,hp_after:projected.tanks[tank.id].hp_after,repair_gain:projected.tanks[tank.id].repair_gain,before_exposure:beforeThreats.length,after_exposure:afterThreats.length,ready_enemies:afterThreats.filter(function(t){return t.cooldown===0;}).length,reduces_exposure:afterThreats.length<beforeThreats.length,takes_cover:isMove&&beforeThreats.some(function(e){return Math.hypot(e.x-after.x,e.y-after.y)<=6&&geometry.sight(world,e,after).reason==='wall';}),resource:resource,supports_wounded_ally:supports,stationary:!isMove};
  }
  function redundantShots(world,plan){var groups={};Object.entries(plan).forEach(function(e){if(!e[1].startsWith('fire_'))return;var t=world.tanks.find(function(t){return t.id===e[0];}),target=world.tanks.find(function(t){return t.id===e[1].slice(5);}),s=combat.shot(world,t,target,t.side);if(!s.clear)return;var damage=t.power_until>world.tick?20:12;if(damage>=s.victim.hp+s.victim.shield)groups[s.victim.id]=(groups[s.victim.id]||0)+1;});return Object.values(groups).reduce(function(n,count){return n+Math.max(0,count-1);},0);}
  function decorate(wire,logical,world){
    var qs={},mapping={},facts={},weights={},ids=Object.keys(wire.mapping),side=world.tanks.find(function(t){return t.id===ids[0];})?.side??0,stationary=forecast(world,side,{});
    ids.forEach(function(id){var tank=world.tanks.find(function(t){return t.id===id;});mapping[id]={};facts[id]={};var canShoot=Object.values(wire.mapping[id]).some(function(a){return a.startsWith('fire_');}),canResupply=(world.rewards||[]).some(function(r){return (r.type==='repair'&&tank.hp<100||r.type==='shield'&&tank.shield<30)&&route(world,tank,r,tank)!==null;}),pressure=tank.hp<=50&&(canShoot||canResupply)||stationary.tanks[id].incoming_hp_loss>0||exposure(world,tank,tank).filter(function(t){return t.cooldown===0;}).length>=2;weights[id]={survival:pressure?.65:.25,offense:pressure?.35:.75};
      Object.entries(wire.mapping[id]).forEach(function(entry){var action=entry[1],qid=entry[0]+'__safety',f=features(world,tank,action);facts[id][action]=f;mapping[id][qid]=action;
        var text='Friendly tank HP '+f.hp+', shield '+f.shield+'. ';
        if(!f.incoming_known)text+='Incoming projectile data unavailable. ';
        else if(f.hp_after===0)text+='Existing projectiles are predicted to destroy this tank before or after this action. ';
        else if(f.after_hp_loss<f.before_hp_loss)text+='This action reduces predicted incoming HP loss from '+f.before_hp_loss+' to '+f.after_hp_loss+'. ';
        else if(f.after_hp_loss>0)text+='Existing incoming fire still causes '+f.after_hp_loss+' predicted HP damage. ';
        else text+='No HP loss from existing projectiles is predicted. ';
        if(f.takes_cover)text+='Terrain cover reduces enemy firing lines from '+f.before_exposure+' to '+f.after_exposure+'. ';
        else if(f.reduces_exposure)text+='Moving reduces exposure to enemy firing range/lines. ';
        else text+=f.after_exposure+' enemies have geometric firing lines; '+f.ready_enemies+' can fire now. ';
        if(f.repair_gain>0)text+='Restores '+f.repair_gain+' HP before the projection ends. ';
        if(f.resource)text+=(f.resource.collects?'Collects ':'Approaches ')+f.resource.type+' resource needed by this tank. ';
        if(f.supports_wounded_ally)text+='Damages an enemy threatening a wounded ally; only a kill prevents its future shots. ';
        qs[qid]={type:'boolean',instructions:'Snapshot projection: '+text+'\nStatement: this action protects friendly tanks while supporting eventual enemy destruction.'};
      });
    });
    var audits=wire.plans.map(function(plan,index){return {plan_index:index,forecast:forecast(world,side,plan),redundant_lethal_shots:redundantShots(world,plan)};}),bestSurvivors=Math.max.apply(null,audits.map(function(a){return a.forecast.survivors;})),eligible=audits.filter(function(a){return !a.forecast.known||a.forecast.survivors===bestSurvivors;});
    if(eligible.some(function(a){return a.forecast.known&&a.forecast.winning;}))eligible=eligible.filter(function(a){return a.forecast.winning;});
    var bestHealth=Math.max.apply(null,eligible.map(function(a){return a.forecast.effective_hp;}));
    eligible=eligible.filter(function(a){return !a.forecast.known||a.forecast.effective_hp===bestHealth;});
    var leastRedundant=Math.min.apply(null,eligible.map(function(a){return a.redundant_lethal_shots;}));eligible=eligible.filter(function(a){return a.redundant_lethal_shots===leastRedundant;});
    wire.request.states.push({id:'survival',state:'Safety assessment for a tank team: preserve friendly tanks while eliminating enemies. Use cover and useful repair/shield/power resources. Estimates assume one action after three ticks, frozen enemies, existing bullets plus proposed own fire, no new enemy shots, and stopping on elimination; future decisions and latency may differ.',questions:qs});
    wire.version='tactical-effects-v2';wire.survival_mapping=mapping;wire.tactical={version:'tactical-projection-v2',features:facts,weights:weights,plan_audit:audits,eligible_plan_indices:eligible.map(function(a){return a.plan_index;}),assumptions:{horizon_ticks:HORIZON,decision_delay_ticks:DELAY,enemy_positions_frozen:true,new_enemy_shots_predicted:false,own_action_simulated:true,stops_at_elimination:true}};return wire;
  }
  function select(gates,wire,scalarSelect){
    var expected=Object.values(wire.mapping).concat(Object.values(wire.survival_mapping)).flatMap(function(m){return Object.keys(m);}).sort();
    if(!gates||typeof gates!=='object'||Array.isArray(gates)||Object.keys(gates).sort().join()!==expected.join())throw new Error('invalid_utility_response');
    function subset(mapping){return Object.fromEntries(Object.values(mapping).flatMap(function(m){return Object.keys(m).map(function(k){return [k,gates[k]];});}));}
    var offense=scalarSelect(subset(wire.mapping),wire.mapping),survival=scalarSelect(subset(wire.survival_mapping),wire.survival_mapping);
    return combine(offense.utility_scores,survival.utility_scores,wire);
  }
  function combine(offense,survival,wire){
    var combined={},independent={};
    Object.keys(wire.mapping).forEach(function(id){combined[id]={};var best=-Infinity;Object.values(wire.mapping[id]).forEach(function(action){if([offense[id]?.[action],survival[id]?.[action]].some(function(v){return typeof v!=='number'||!isFinite(v)||v<0||v>1;}))throw new Error('invalid_utility_response');var w=wire.tactical.weights[id],score=w.offense*offense[id][action]+w.survival*survival[id][action];combined[id][action]=score;if(score>best){best=score;independent[id]=action;}});});
    var best=-Infinity,decision=null;wire.tactical.eligible_plan_indices.forEach(function(index){var p=wire.plans[index],score=Object.entries(p).reduce(function(n,e){return n+combined[e[0]][e[1]];},0);if(score>best){best=score;decision=Object.assign({},p);}});if(!decision)throw new Error('no_tactical_plan');
    return {decision:decision,utility_scores:offense,survival_scores:survival,combined_scores:combined,independent_argmax:independent};
  }
  return {version:'tank-tactical-utility-v2',features:features,forecast:forecast,decorate:decorate,select:select,combine:combine};
}));

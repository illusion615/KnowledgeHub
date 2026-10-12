/* Persistent application intent / route execution. No model, credentials or
   hidden enemy orders. A model-approved route may execute at most two further
   moves; every move is revalidated. Goal lifetime is independent of that lease. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-strategy'),require('./arena-combat'),require('./arena-geometry'),require('./arena-exchange'));else root.JevArenaIntent=factory(root.JevArenaStrategy,root.JevArenaCombat,root.JevArenaGeometry,root.JevArenaExchange);}(typeof window!=='undefined'?window:this,function(strategy,combat,geometry,exchange){
  'use strict';
  var VERSION='persistent-intent-v4',LEASE=24,EXTRA_STEPS=2,GOAL_LIMIT=80,NO_PROGRESS=24;
  var dirs={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function copy(x){return JSON.parse(JSON.stringify(x));}
  function enabled(g){return [VERSION,'exchange-aware-v5','deadlock-recovery-v6'].includes(g.planner_revision)&&g.control==='step'&&g.input_profile==='utility-planner';}
  function create(){return {units:{},goal_replans:0,route_replans:0,route_steps:0};}
  function same(a,b){return a&&b&&a.x===b.x&&a.y===b.y;}
  function nextAction(t,p){return Object.keys(dirs).find(function(k){return t.x+dirs[k][0]===p.x&&t.y+dirs[k][1]===p.y;})||null;}
  function usable(g,t,p){return p&&g.map[p.y]?.[p.x]==='.'&&!g.tanks.some(function(o){return o.hp>0&&o.id!==t.id&&same(o,p);});}
  function imminent(g,t,p){
    // Existing projectiles, with movement at the next real four-tick boundary.
    var sim={version:g.version,map:g.map,tanks:g.tanks.map(function(o){return Object.assign({},o);})},me=sim.tanks.find(function(o){return o.id===t.id;}),bullets=(g.bullets||[]).map(function(b){return Object.assign({},b);});
    for(var i=1;i<=6;i++){if((g.tick+i)%4===0){me.x=p.x;me.y=p.y;}var hitMe=false;bullets=bullets.filter(function(b){var hit=geometry.advance(sim,b);if(hit?.kind==='tank'&&hit.tank.id===t.id)hitMe=true;return !hit&&b.life>0;});if(hitMe)return true;}return false;
  }
  function goalValid(g,t,u){
    if(!u)return 'new_goal';if(t.hp<=35&&u.kind!=='repair'&&!u.low_health)return 'health_priority_changed';
    if(g.tick-u.created_tick>=GOAL_LIMIT)return 'goal_review_due';
    if(u.kind==='attack'){if(g.real_progress?.teams?.[t.side]?.attack_goal?.target&&g.real_progress.teams[t.side].attack_goal.target!==u.enemy_id)return 'team_target_changed';var target=g.tanks.find(function(e){return e.id===u.enemy_id&&e.hp>0;});if(!target)return 'target_gone';}
    else if(!(g.rewards||[]).some(function(r){return r.type===u.kind&&same(r,u.destination);} ))return 'resource_gone';
    if(g.tick-Math.max(u.progress_tick,g.real_progress?.teams?.[t.side]?.last_enemy_loss_tick||0)>=NO_PROGRESS)return 'no_real_route_progress';return null;
  }
  function acquire(g,t,claimed){
    var routes=strategy.routes(g,t),resources=(g.rewards||[]).filter(function(r){return !claimed.has(r.x+','+r.y)&&routes.get(r.x+','+r.y)?.steps>0;}),kind='attack',destination=null,enemy=null;
    if(t.hp<=35){resources=resources.filter(function(r){return r.type==='repair';});resources.sort(function(a,b){return routes.get(a.x+','+a.y).cost-routes.get(b.x+','+b.y).cost;});if(resources.length){kind='repair';destination={x:resources[0].x,y:resources[0].y};}}
    if(!destination&&t.hp>35&&t.power_until<=g.tick){var useful=resources.filter(function(r){return r.type==='shield'&&t.shield<12||r.type==='power';}).sort(function(a,b){return routes.get(a.x+','+a.y).cost-routes.get(b.x+','+b.y).cost;});if(useful.length&&routes.get(useful[0].x+','+useful[0].y).steps<=3){kind=useful[0].type;destination={x:useful[0].x,y:useful[0].y};}}
    if(!destination){var enemies=g.tanks.filter(function(e){return e.side!==t.side&&e.hp>0;});var costs={};enemies.forEach(function(e){costs[e.id]=Math.min(...Array.from(routes.values()).filter(function(p){return combat.shot(g,{id:t.id,x:p.x,y:p.y},e,t.side).clear;}).map(function(p){return p.cost;}));});enemies.sort(function(a,b){return costs[a.id]-costs[b.id]||a.hp+a.shield-b.hp-b.shield||a.id.localeCompare(b.id);});enemy=enemies.find(function(e){return e.id===g.real_progress?.teams?.[t.side]?.attack_goal?.target;})||enemies[0]||null;}
    return {low_health:t.hp<=35,kind:kind,enemy_id:enemy?.id||null,destination:destination,created_tick:g.tick,progress_tick:g.tick,best_remaining:null,last_position:{x:t.x,y:t.y},route:[],approved:false,remaining:0,expires_tick:0,route_origin:{x:t.x,y:t.y},role:kind==='repair'?'recover':t.power_until>g.tick?'burst':t.shield>=12?'assault':'advance'};
  }
  function routeFor(g,t,u){
    var routes=strategy.routes(g,t);if(u.kind!=='attack')return routes.get(u.destination.x+','+u.destination.y)?.path||[];
    var enemy=g.tanks.find(function(e){return e.id===u.enemy_id&&e.hp>0;});if(!enemy)return [];
    var cells=Array.from(routes.values()).filter(function(p){return combat.shot(g,{id:t.id,x:p.x,y:p.y},enemy,t.side).clear;});cells.sort(function(a,b){return a.cost-b.cost||a.steps-b.steps;});if(!cells.length)return [];u.destination={x:cells[0].x,y:cells[0].y};return cells[0].path;
  }
  function pathReason(g,t,u){
    if(!u.route.length){if(u.kind==='attack'&&same(t,u.destination)&&combat.shot(g,t,g.tanks.find(function(e){return e.id===u.enemy_id;}),t.side).clear)return null;return 'route_missing';}
    if(!nextAction(t,u.route[0]))return 'left_committed_route';
    if(!usable(g,t,u.route[0]))return 'route_blocked';
    if(u.route.some(function(p){return g.map[p.y]?.[p.x]!=='.';}))return 'terrain_changed';
    if(u.kind==='attack'){var enemy=g.tanks.find(function(e){return e.id===u.enemy_id;});if(!combat.shot(g,{id:t.id,x:u.destination.x,y:u.destination.y},enemy,t.side).clear)return 'firing_destination_invalid';}
    return null;
  }
  function safety(g,t,u){
    var reason=goalValid(g,t,u);if(reason)return reason;
    if(exchange.enabled(g)&&u.approved&&u.approved_balance){var balance=exchange.situation(g,t.side),old=u.approved_balance;if(balance.own.alive!==old.own_alive||balance.enemy.alive!==old.enemy_alive||Math.abs(balance.health_advantage-old.health_advantage)>12)return 'health_balance_changed';}
    // Record route progress only from actual authoritative positions, never a prediction.
    var route=u.route.slice();while(route.length&&same(route[0],t))route.shift();
    var view=Object.assign({},u,{route:route});reason=pathReason(g,t,view);if(reason)return reason;if(!route.length)return 'destination_reached';
    if(imminent(g,t,route[0]))return 'incoming_projectile';
    var before=strategy.exposure(g,t,t),after=strategy.exposure(g,t,route[0]);if(after>(u.approved_exposure??before)+6)return 'threat_increased';
    if(t.cooldown===0&&g.tanks.some(function(e){return e.side!==t.side&&e.hp>0&&combat.shot(g,t,e,t.side).clear;}))return 'ready_firing_opportunity';
    return null;
  }
  function follow(g,side,memory){
    var plan={},reserved=new Set(),units=g.tanks.filter(function(t){return t.side===side&&t.hp>0;});if(!units.length)return null;
    for(var t of units){var u=memory.units[t.id];if(!u?.approved||u.remaining<=0||g.tick>u.expires_tick||safety(g,t,u))return null;var next=u.route.find(function(p){return !same(p,t);}),action=nextAction(t,next);if(!action||reserved.has(next.x+','+next.y))return null;reserved.add(next.x+','+next.y);plan[t.id]=action;}return plan;
  }
  function prepare(g,side,memory){
    var events=[],claimed=new Set(),reserved=new Set(),units=g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).sort(function(a,b){return a.hp-b.hp||a.id.localeCompare(b.id);}),references={},fixed={};
    for(var t of units){var u=memory.units[t.id];
      if(u&&!same(t,u.last_position)){u.last_position={x:t.x,y:t.y};var reached=false;while(u.route.length&&same(u.route[0],t)){u.route.shift();reached=true;}if(reached&&(u.best_remaining===null||u.route.length<u.best_remaining)){u.progress_tick=g.tick;u.best_remaining=u.route.length;}}
      var reason=goalValid(g,t,u);if(reason){u=acquire(g,t,claimed);memory.units[t.id]=u;memory.goal_replans++;events.push({tank:t.id,kind:'goal_replan',reason:reason});}
      if(u.kind!=='attack'&&u.destination)claimed.add(u.destination.x+','+u.destination.y);
      var routeReason=pathReason(g,t,u);if(routeReason){u.route=routeFor(g,t,u);if(u.best_remaining===null)u.best_remaining=u.route.length;else if(u.route.length>0&&u.route.length<u.best_remaining){u.best_remaining=u.route.length;u.progress_tick=g.tick;}u.route_origin={x:t.x,y:t.y};u.approved=false;u.remaining=0;memory.route_replans++;events.push({tank:t.id,kind:'route_replan',reason:routeReason});}
      var guard=safety(g,t,u);if(guard&&u.approved){u.approved=false;u.remaining=0;events.push({tank:t.id,kind:'route_suspended',reason:guard});}
      if(u.approved&&g.tick>u.expires_tick){u.approved=false;u.remaining=0;events.push({tank:t.id,kind:'route_suspended',reason:'approval_lease_expired'});}
      var action=u.route[0]?nextAction(t,u.route[0]):null;
      if(u.approved&&u.remaining>0&&!guard&&action){var cell=u.route[0].x+','+u.route[0].y;if(reserved.has(cell)){u.approved=false;u.remaining=0;events.push({tank:t.id,kind:'route_suspended',reason:'ally_destination_conflict'});}else{fixed[t.id]=action;reserved.add(cell);}}
      references[t.id]={value:24/(1+.3*u.route.length),role:u.role,mode:u.kind==='attack'?'approach':'resupply',type:u.kind==='attack'?null:u.kind,enemy_id:u.enemy_id,target:u.destination,action:action,path:copy(u.route),progress_tick:Math.max(u.progress_tick,g.real_progress?.teams?.[t.side]?.last_enemy_loss_tick||0),best_remaining:u.best_remaining,approved_exposure:u.approved_exposure??null,approved_balance:u.approved_balance?copy(u.approved_balance):null,goal_created_tick:u.created_tick,goal_age_ticks:g.tick-u.created_tick,approved:u.approved&&u.remaining>0,remaining_steps:u.remaining,expires_tick:u.expires_tick};
    }
    return {version:VERSION,side:side,captured_tick:g.tick,references:references,fixed_actions:fixed,follow:follow(g,side,memory),events:events,counters:{goal_replans:memory.goal_replans,route_replans:memory.route_replans,route_steps:memory.route_steps},limits:{extra_steps:EXTRA_STEPS,lease_ticks:LEASE,goal_review_ticks:GOAL_LIMIT,no_progress_ticks:NO_PROGRESS}};
  }
  function accept(g,side,memory,decision,context,applicationOnly){
    for(var t of g.tanks.filter(function(t){return t.side===side&&t.hp>0;})){var u=memory.units[t.id],r=context?.references?.[t.id];if(!u||!r)continue;
      if(applicationOnly||context.fixed_actions?.[t.id]===decision[t.id]){u.remaining=Math.max(0,u.remaining-1);memory.route_steps++;continue;}
      if(r.action===decision[t.id]&&r.path.length>1&&same(r.path[0],u.route[0])&&!safety(g,t,u)){u.approved=true;u.remaining=EXTRA_STEPS;u.expires_tick=g.tick+LEASE;u.approved_exposure=strategy.exposure(g,t,r.path[0]);if(exchange.enabled(g)){var b=exchange.situation(g,side);u.approved_balance={own_alive:b.own.alive,enemy_alive:b.enemy.alive,health_advantage:b.health_advantage};}}
      else {u.approved=false;u.remaining=0;}
    }
  }
  function revalidateFixed(g,side,memory,context){
    for(var id of Object.keys(context?.fixed_actions||{})){var t=g.tanks.find(function(t){return t.id===id&&t.side===side&&t.hp>0;}),u=memory.units[id],reason=!t||!u?'tank_or_goal_gone':!u.approved||u.remaining<=0?'route_approval_invalid':g.tick>u.expires_tick?'approval_lease_expired':safety(g,t,u);if(reason){if(u){u.approved=false;u.remaining=0;}return reason;}}
    return null;
  }
  function fromContext(g,context){var memory=create();for(var entry of Object.entries(context?.references||{})){var id=entry[0],r=entry[1],t=g.tanks.find(function(t){return t.id===id;});if(!t)continue;memory.units[id]={kind:r.type||'attack',enemy_id:r.enemy_id,destination:copy(r.target),created_tick:r.goal_created_tick,progress_tick:r.progress_tick??g.tick,best_remaining:r.best_remaining??null,last_position:{x:t.x,y:t.y},route:copy(r.path),role:r.role,low_health:t.hp<=35,approved:r.approved,approved_exposure:r.approved_exposure??undefined,approved_balance:r.approved_balance?copy(r.approved_balance):null,remaining:r.remaining_steps,expires_tick:r.expires_tick,route_origin:{x:t.x,y:t.y}};}return memory;}
  return {revalidateFixed:revalidateFixed,fromContext:fromContext,version:VERSION,enabled:enabled,create:create,prepare:prepare,accept:accept,follow:follow,safety:safety,imminent:imminent};
}));

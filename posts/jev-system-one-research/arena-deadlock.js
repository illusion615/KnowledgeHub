/* Actual-state livelock detection and bounded, goal-directed recovery. No model
   calls, hidden opponent orders, fabricated hits, random motion or forced winner. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'),require('./arena-geometry'));else root.JevArenaDeadlock=factory(root.JevArenaCombat,root.JevArenaGeometry);}(typeof window!=='undefined'?window:this,function(combat,geometry){
  'use strict';
  var VERSION='deadlock-recovery-v6',QUIET=48,WINDOW=32,LIMIT=120,states=new WeakMap();
  var directions={move_up:[0,-1],move_right:[1,0],move_down:[0,1],move_left:[-1,0]};
  function enabled(g){return g.planner_revision===VERSION;}
  function cells(g,side){return g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).map(function(t){return t.id+':'+t.x+','+t.y;}).sort().join('|');}
  function health(g){return g.tanks.map(function(t){return t.id+':'+t.hp+','+t.shield+','+t.power_until;}).join('|');}
  function start(g){
    var view={version:VERSION,last_progress_tick:g.tick,unresolved:false,teams:[0,1].map(function(){return {active:false,episode:0,started_tick:null,reason:null,phase:null,cycle_repeats:0,samples:0,recovery_steps:0,resolved:0,last_exit:null};})};
    states.set(g,{last_tick:g.tick,last_event:g.event_seq||0,last_health:health(g),history:[[],[]],goals:[{},{}]});g.deadlock=view;return view;
  }
  function phase(g,side){var elapsed=g.tick-g.deadlock.teams[side].started_tick;return elapsed<12?'probe':elapsed<60?'close_range':'intercept';}
  function observe(g){
    if(!enabled(g))return;var s=states.get(g);if(!s){start(g);return;}if(g.tick===s.last_tick)return;
    if(g.tick!==s.last_tick+1){start(g);return;}var m=g.deadlock,changed=health(g)!==s.last_health||(g.events||[]).some(function(e){return e.id>s.last_event&&e.kind==='damage'&&(e.amount>0||e.shield>0);});
    if(changed){m.last_progress_tick=g.tick;m.unresolved=false;s.history=[[],[]];s.goals=[{},{}];m.teams.forEach(function(t){if(t.active){t.resolved++;t.last_exit='actual_state_progress';}t.active=false;t.phase=null;t.samples=0;t.cycle_repeats=0;});}
    for(var side of [0,1]){var team=m.teams[side],own=g.tanks.filter(function(t){return t.side===side&&t.hp>0;});
      if(own.some(function(t){return t.last_execution?.tick===g.tick;})){
        var signature=cells(g,side),list=s.history[side];list.push({tick:g.tick,signature:signature});if(list.length>WINDOW)list.shift();team.samples=list.length;team.cycle_repeats=list.filter(function(r){return r.signature===signature;}).length;
        if(!team.active&&g.tick-m.last_progress_tick>=QUIET&&list.length>=6&&team.cycle_repeats>=3){team.active=true;team.episode++;team.started_tick=g.tick;team.reason='repeated_state_without_effective_progress';team.last_exit=null;s.goals[side]={};}
      }
      if(team.active){team.phase=phase(g,side);if(g.tick-team.started_tick>=LIMIT)m.unresolved=true;}
    }
    s.last_tick=g.tick;s.last_event=g.event_seq||s.last_event;s.last_health=health(g);
  }
  function active(g,side){return enabled(g)&&g.deadlock?.teams?.[side]?.active===true&&!g.deadlock.unresolved;}
  function key(p){return p.x+','+p.y;}
  function ordered(side){var d=Object.entries(directions);return side===0?d:d.slice(2).concat(d.slice(0,2));}
  function routes(g,t,reserved){
    var blocked=new Set(g.tanks.filter(function(o){return o.hp>0&&o.id!==t.id;}).map(key)),queue=[{x:t.x,y:t.y,path:[]}],seen=new Map([[key(t),queue[0]]]);
    for(var n=0;n<queue.length;n++){var p=queue[n];ordered(t.side).forEach(function(e){var q={x:p.x+e[1][0],y:p.y+e[1][1]},k=key(q);if(g.map[q.y]?.[q.x]!=='.'||blocked.has(k)||seen.has(k)||!p.path.length&&reserved.has(k))return;q.path=p.path.concat([{x:q.x,y:q.y}]);seen.set(k,q);queue.push(q);});}return Array.from(seen.values());
  }
  function exposure(g,t,p){return g.tanks.filter(function(e){return e.side!==t.side&&e.hp>0&&geometry.sight(g,e,p).clear;}).length;}
  function incoming(g,t,p){
    var sim={version:g.version,map:g.map,tanks:g.tanks.map(function(o){return Object.assign({},o);})},me=sim.tanks.find(function(o){return o.id===t.id;}),bullets=(g.bullets||[]).map(function(b){return Object.assign({},b);}),damage=0;
    for(var tick=1;tick<=6;tick++){if((g.tick+tick)%4===0){me.x=p.x;me.y=p.y;}bullets=bullets.filter(function(b){var hit=geometry.advance(sim,b);if(hit?.kind==='tank'&&hit.tank.id===t.id)damage+=b.damage;return !hit&&b.life>0;});}return Math.max(0,damage-t.shield);
  }
  function plan(g,side){
    if(!active(g,side))return null;var s=states.get(g);if(!s)throw Error('deadlock_state_missing');var state=g.deadlock.teams[side],mode=phase(g,side),reserved=new Set(),decision={},audit={},own=g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).sort(function(a,b){return b.hp+b.shield-a.hp-a.shield||a.id.localeCompare(b.id);}),enemies=g.tanks.filter(function(t){return t.side!==side&&t.hp>0;}),ours=own.reduce(function(n,t){return n+t.hp+t.shield;},0),theirs=enemies.reduce(function(n,t){return n+t.hp+t.shield;},0);
    for(var t of own){var options=routes(g,t,reserved),targets=enemies.slice().sort(function(a,b){return a.hp+a.shield-b.hp-b.shield||Math.abs(a.x-t.x)+Math.abs(a.y-t.y)-Math.abs(b.x-t.x)-Math.abs(b.y-t.y)||a.id.localeCompare(b.id);}),target=targets[0],choice=null,reason=null,goal=null;if(!target){decision[t.id]='wait';continue;}
      var strong=ours>=theirs,shots=targets.filter(function(e){return combat.shot(g,t,e,side).clear;});
      if(t.cooldown===0)for(var e of shots){var distance=Math.hypot(e.x-t.x,e.y-t.y),launch=(g.tick+1)%4,remaining=Math.max(0,Math.ceil(distance-.35)-1),window=launch!==0&&remaining<4-launch,damage=t.power_until>g.tick?20:12,lethal=damage>=e.hp+e.shield;
        if((lethal||strong)&&incoming(g,t,t)<t.hp&&(mode==='probe'||window)){choice='fire_'+e.id;reason=lethal?'execute_lethal_shot':'execute_probe_shot';target=e;break;}}
      var repairs=(g.rewards||[]).filter(function(r){return r.type==='repair'&&t.hp<70;});var repairCells=options.filter(function(p){return repairs.some(function(r){return key(r)===key(p);});});repairCells.sort(function(a,b){return a.path.length-b.path.length;});
      if(!choice&&t.hp<=35&&repairCells.length){goal=repairCells[0];reason='reach_useful_repair';}
      if(!choice&&!goal&&!strong){
        var firing=combat.analyse(g,t),cover=options.filter(function(p){return exposure(g,t,p)===0&&incoming(g,t,p)<t.hp&&(firing.distances[p.y]?.[p.x]??100)<=2;});
        cover.sort(function(a,b){return a.path.length-b.path.length;});if(cover.length){goal=cover[0];reason=goal.path.length?'reach_cover':'hold_cover_for_counterfire';}
      }
      if(!choice&&!goal){
        var cycle=targets.flatMap(function(e){return (e.recent_positions||[]).slice(-8);}),unique=Array.from(new Map(cycle.map(function(p){return [key(p),p];})).values());
        var close=options.filter(function(p){return combat.shot(g,{id:t.id,x:p.x,y:p.y},target,side).clear&&Math.hypot(p.x-target.x,p.y-target.y)<= (mode==='intercept'?3:1.5);});
        var old=s.goals[side][t.id];if(old&&old.phase===mode&&old.target===target.id)goal=close.find(function(p){return key(p)===old.cell;})||null;
        if(!goal){close.sort(function(a,b){var coverCount=function(p){return unique.filter(function(q){return Math.hypot(q.x-p.x,q.y-p.y)<=3&&geometry.sight(g,p,q).clear;}).length;};return (mode==='intercept'?coverCount(b)-coverCount(a):0)||a.path.length-b.path.length;});goal=close[0]||null;}
        if(goal){reason=mode==='intercept'?'intercept_observed_cycle':'close_firing_distance';s.goals[side][t.id]={phase:mode,target:target.id,cell:key(goal)};}
      }
      if(!choice&&goal){if(goal.path.length){var next=goal.path[0];choice=ordered(side).find(function(e){return t.x+e[1][0]===next.x&&t.y+e[1][1]===next.y;})[0];if(incoming(g,t,next)>=t.hp){choice=null;goal=null;reason=null;}}else {choice='wait';reason=reason||'hold_firing_position';}}
      if(!choice){var moves=options.filter(function(p){return p.path.length===1;}).sort(function(a,b){return incoming(g,t,a)-incoming(g,t,b)||exposure(g,t,a)-exposure(g,t,b);});if(moves.length){var next=moves[0];choice=ordered(side).find(function(e){return t.x+e[1][0]===next.x&&t.y+e[1][1]===next.y;})[0];goal=next;reason='evade_or_unblock';}else{choice='wait';reason='no_reachable_recovery_action';}}
      decision[t.id]=choice;var d=directions[choice];if(d)reserved.add((t.x+d[0])+','+(t.y+d[1]));audit[t.id]={action:choice,reason:reason,target:target.id,stance:strong?'close_and_finish':'protect_and_counter',goal:goal?{x:goal.x,y:goal.y}:null,path:goal?.path||[]};
    }
    return {version:VERSION,episode:state.episode,phase:mode,detected_tick:state.started_tick,quiet_ticks:g.tick-g.deadlock.last_progress_tick,remaining_ticks:Math.max(0,LIMIT-(g.tick-state.started_tick)),decision:decision,audit:audit,scope:'Bounded application recovery from observed recurrence. No model/search call, no hidden orders; target motion can invalidate a shot. Unresolved recovery stops without a winner.'};
  }
  function installed(g,side){if(g.deadlock?.teams?.[side])g.deadlock.teams[side].recovery_steps++;}
  return {version:VERSION,enabled:enabled,start:start,observe:observe,active:active,plan:plan,installed:installed,limits:{quiet_ticks:QUIET,sample_limit:WINDOW,min_samples:6,min_repeats:3,recovery_ticks:LIMIT}};
}));

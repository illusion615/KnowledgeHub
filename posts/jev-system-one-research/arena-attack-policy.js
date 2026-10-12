/* Rule baseline, NOT a model or an output repair layer. It consumes only the
   same public snapshot, chooses explicit one-attempt actions, and is separately
   selectable/audited. It never reads either side's outstanding orders. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'));else root.JevArenaAttackPolicy=factory(root.JevArenaCombat);
}(typeof window!=='undefined'?window:this,function(combat){
  'use strict';
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function choose(world,request){
    var decision={},audit={},reserved=new Set();
    // Rotate which ally reserves a destination first. No hidden movement: this
    // is part of the disclosed joint rule policy, before orders are installed.
    var ids=Object.keys(request.states[0].questions).sort();if(Math.floor(world.tick/4)%2)ids.reverse();
    ids.forEach(function(id){
      var t=world.tanks.find(function(t){return t.id===id;});if(!t||t.hp<=0)throw new Error('invalid_policy_snapshot');
      var info=combat.analyse(world,t),keys=Object.keys(request.states[0].questions[id].criteria),rows=[];
      keys.forEach(function(key){
        // Fixed attack-v1 control intentionally never waits. The v3 action
        // space may offer wait to other controllers; ignore it, do not crash
        // or silently turn this baseline into the new tactical policy.
        if(key==='wait'&&['resource-tactics-v3','persistent-intent-v4','exchange-aware-v5','deadlock-recovery-v6'].includes(world.planner_revision))return;
        var d=directions[key];
        if(d){
          var x=t.x+d[0],y=t.y+d[1],open=info.open(x,y),reservedByAlly=reserved.has(x+','+y),steps=open?info.distances[y][x]:null;
          var visits=(t.recent_positions||[]).filter(function(p){return p.x===x&&p.y===y;}).length;
          rows.push({action:key,kind:'move',x:x,y:y,feasible:open&&!reservedByAlly,reason:!open?'blocked':reservedByAlly?'ally_reserved':steps===null?'unreachable_firing_cell':'approach_firing_cell',steps:steps,visits:visits,repeats_failed_move:t.last_execution?.action===key&&['yielding','blocked_tank','blocked_wall'].includes(t.last_execution.outcome)});
        }else if(key.startsWith('fire_')){
          var target=info.enemies.find(function(e){return e.id===key.slice(5);}),sight=combat.shot(world,t,target,t.side),victim=sight.victim;
          var damage=t.power_until>world.tick?20:12,shield=victim?Math.min(victim.shield,damage):0,hp=victim?Math.min(victim.hp,Math.max(0,damage-shield)):0;
          rows.push({action:key,kind:'fire',feasible:sight.clear,reason:sight.clear?'clear_shot':sight.reason,victim:victim?.id||null,hp_damage_if_hit:hp,shield_damage_if_hit:shield,kill_if_hit:!!victim&&hp===victim.hp,target_hp:victim?.hp??null,reload:t.cooldown});
        }else throw new Error('unsupported_policy_action');
      });
      var shots=rows.filter(function(r){return r.kind==='fire'&&r.feasible;}).sort(function(a,b){return Number(b.kill_if_hit)-Number(a.kill_if_hit)||b.hp_damage_if_hit-a.hp_damage_if_hit||b.shield_damage_if_hit-a.shield_damage_if_hit||a.target_hp-b.target_hp||a.action.localeCompare(b.action);});
      var moves=rows.filter(function(r){return r.kind==='move'&&r.feasible;}).sort(function(a,b){return Number(a.repeats_failed_move)-Number(b.repeats_failed_move)||(a.steps??10000)-(b.steps??10000)||a.visits-b.visits||a.action.localeCompare(b.action);});
      // Firing dominates exploration; visits only break equal-route ties.
      // If completely trapped, preserve the forced-action contract by returning
      // a visibly infeasible attempt, not inventing movement or a wait option.
      var selected=shots[0]||moves[0]||rows[0];if(!selected)throw new Error('no_policy_candidate');
      decision[id]=selected.action;if(selected.kind==='move'&&selected.feasible)reserved.add(selected.x+','+selected.y);
      audit[id]={selected:selected.action,reason:selected.reason,current_steps:info.current,candidates:rows};
    });
    return {decision:decision,audit:audit};
  }
  return {version:'rule-attack-baseline-v1',choose:choose};
}));

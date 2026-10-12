/* Actual-execution sensor, never fed by planner rollouts. Inspired by goal /
   working-memory separation in Orkin (AIIDE 2005), not a learned combat score. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaProgress=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var VERSION='realized-progress-v1',STALL_TICKS=16;
  function start(game){game.real_progress={version:VERSION,last_sample_tick:game.tick,last_event_id:game.event_seq||0,teams:[{last_enemy_loss_tick:game.tick,attack_goal:null},{last_enemy_loss_tick:game.tick,attack_goal:null}]};return game.real_progress;}
  function observe(game){
    var m=game.real_progress;if(!m)return;
    if(m.version!==VERSION||m.last_sample_tick>game.tick||game.tick-m.last_sample_tick>1||!Array.isArray(m.teams)||m.teams.length!==2){start(game);return;}
    for(var e of game.events||[])if(e.id>m.last_event_id&&e.kind==='damage'&&(e.amount>0||e.shield>0)&&(e.side===0||e.side===1))m.teams[1-e.side].last_enemy_loss_tick=e.tick;
    m.teams.forEach(function(team,side){
      var goal=team.attack_goal,attacker=goal?game.tanks.find(function(t){return t.id===goal.attacker;}):null,target=goal?game.tanks.find(function(t){return t.id===goal.target;}):null;
      if(goal&&(!attacker||attacker.hp<=35||!target||target.hp<=0||game.tick-goal.started_tick>=48))team.attack_goal=null;
      if(!team.attack_goal&&game.tick-team.last_enemy_loss_tick>=STALL_TICKS){
        var own=game.tanks.filter(function(t){return t.side===side&&t.hp>35;}).sort(function(a,b){return b.hp+b.shield-a.hp-a.shield||a.id.localeCompare(b.id);});
        if(own.length){var a=own[0],enemies=game.tanks.filter(function(t){return t.side!==side&&t.hp>0;}).sort(function(x,y){return x.hp+x.shield-y.hp-y.shield||Math.abs(x.x-a.x)+Math.abs(x.y-a.y)-Math.abs(y.x-a.x)-Math.abs(y.y-a.y)||x.id.localeCompare(y.id);});if(enemies.length)team.attack_goal={attacker:a.id,target:enemies[0].id,started_tick:game.tick};}
      }
    });
    m.last_sample_tick=game.tick;m.last_event_id=game.event_seq||m.last_event_id;
  }
  function context(game,side){
    var m=game.real_progress,last=m?.teams?.[side]?.last_enemy_loss_tick;
    if(m?.version!==VERSION||m.last_sample_tick!==game.tick||!Number.isInteger(last)||last<0||last>game.tick)return {known:false};
    var goal=m.teams[side].attack_goal;
    return {known:true,sample_tick:game.tick,last_enemy_loss_tick:last,quiet_ticks:game.tick-last,threshold_ticks:STALL_TICKS,attack_goal:goal?{attacker:goal.attacker,target:goal.target,started_tick:goal.started_tick}:null};
  }
  return {version:VERSION,stallTicks:STALL_TICKS,start:start,observe:observe,context:context};
}));

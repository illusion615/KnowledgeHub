/* v3 public-state tactical objectives. Application rules, not learned value.
   Legacy v2 remains in arena-strategy.js. No hidden orders or automatic firing. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-strategy'),require('./arena-combat'),require('./arena-geometry'));else root.JevArenaTacticalPolicy=factory(root.JevArenaStrategy,root.JevArenaCombat,root.JevArenaGeometry);}(typeof window!=='undefined'?window:this,function(base,combat,geometry){
  'use strict';
  var REVISION='resource-tactics-v3',dirs={move_up:[0,-1],move_right:[1,0],move_down:[0,1],move_left:[-1,0]};
  function enabled(g){return g.control==='step'&&[REVISION,'persistent-intent-v4','exchange-aware-v5','deadlock-recovery-v6'].includes(g.planner_revision);}
  function role(g,t){if(t.hp<=35)return 'recover';if(t.power_until>g.tick)return 'burst';if(t.shield>=12)return 'assault';return 'advance';}
  function threat(g,t){return g.tanks.filter(function(e){return e.hp>0&&e.side!==t.side;}).sort(function(a,b){return Number(geometry.sight(g,b,t).clear)-Number(geometry.sight(g,a,t).clear)||Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y);})[0];}
  function waitAssessment(g,t){
    var info=combat.analyse(g,t),moves=Object.values(dirs).filter(function(d){return info.open(t.x+d[0],t.y+d[1]);}),shots=info.enemies.filter(function(e){return combat.shot(g,t,e,t.side).clear;});
    if(!moves.length&&!shots.length)return {eligible:true,reason:'trapped',penalty:0};
    var penalty=3*(1+(t.wait_streak||0));
    if((t.wait_streak||0)>=2)return {eligible:false,reason:'consecutive_wait_limit',penalty:penalty};
    if(t.hp<=35&&(g.rewards||[]).some(function(r){return r.type==='repair'&&base.wallDistance(g,t,r)!==null;}))return {eligible:false,reason:'repair_urgent',penalty:penalty};
    if(t.cooldown===0&&shots.length)return {eligible:false,reason:'ready_shot_available',penalty:penalty};
    if(t.power_until>g.tick&&t.cooldown===0)return {eligible:false,reason:'use_power_window',penalty:penalty};
    var exposure=base.exposure(g,t,t);
    if(t.cooldown>0&&(exposure===0||shots.length&&t.hp+t.shield>50))return {eligible:true,reason:'reload_position',penalty:penalty};
    // A currently screened enemy could enter a clear ray after one legal move.
    // This is an ambush hypothesis, NOT knowledge that it will choose that move.
    var approaching=exposure===0&&info.enemies.some(function(e){return Object.values(dirs).some(function(d){var p={x:e.x+d[0],y:e.y+d[1],id:e.id};return g.map[p.y]?.[p.x]==='.'&&!g.tanks.some(function(o){return o.hp>0&&o.x===p.x&&o.y===p.y;})&&geometry.sight(g,t,p).clear;});});
    return {eligible:approaching,reason:approaching?'possible_ambush':'no_wait_benefit',penalty:penalty};
  }
  function choose(g,side){
    var own=g.tanks.filter(function(t){return t.side===side&&t.hp>0;}),roles=Object.fromEntries(own.map(function(t){return [t.id,role(g,t)];})),leader=own.slice().sort(function(a,b){var rank=function(t){return roles[t.id]==='recover'?0:roles[t.id]==='assault'?3:roles[t.id]==='burst'?2:1;};return rank(b)-rank(a)||b.shield-a.shield||Number(a.id[1])-Number(b.id[1]);})[0],claimed=new Set(),reserved=new Set(),result={};
    own.sort(function(a,b){return Number(roles[b.id]==='recover')-Number(roles[a.id]==='recover')||Number(a.id[1])-Number(b.id[1]);});
    own.forEach(function(t){
      var posture=roles[t.id],ally=own.find(function(a){return a.id!==t.id;}),support=posture==='advance'&&ally&&roles[ally.id]!=='advance',protectedTank=support?ally:leader,focus=protectedTank?threat(g,protectedTank):null;
      if(support)posture='support';
      var paths=base.routes(g,t,{riskWeight:posture==='recover'?.24:posture==='assault'?.025:posture==='burst'?.045:.07}),info=combat.analyse(g,t),candidates=[],exposed=base.exposure(g,t,t),attackValue={recover:12,assault:34,burst:46,support:28,advance:24}[posture];
      function add(mode,type,p,value,reason){if(!p||!p.steps||reserved.has(p.path[0].x+','+p.path[0].y))return;candidates.push({mode:mode,type:type,target:{x:p.x,y:p.y},action:p.action,path:p.path,steps:p.steps,route_cost:p.cost,exposure_sum:p.risk,benefit:value,value:value/(1+.25*p.cost),reason:reason});}
      paths.forEach(function(p){if(!p.steps)return;var distance=info.distances[p.y]?.[p.x],from={id:t.id,x:p.x,y:p.y},supports=posture==='support'&&focus&&combat.shot(g,from,focus,side).clear;
        if(distance===0)add(posture==='support'?'support_fire':'approach',null,p,attackValue+(supports?12:0),'reach_firing_position');
        if(exposed>0&&t.cooldown>0&&base.exposure(g,t,p)===0&&distance!==null&&distance<=2)add('cover_counterattack',null,p,posture==='burst'?25:32,'reload_in_cover');
      });
      (g.rewards||[]).forEach(function(r){var p=paths.get(r.x+','+r.y);if(!p||claimed.has(r.x+','+r.y))return;var value=base.benefit(g,t,r,p.steps,info.distances[r.y]?.[r.x]??null);
        if(r.type==='repair'&&posture==='recover')value=Math.min(30,100-t.hp)*3.5;
        else if(posture==='burst')value*=.25; // Spend the active damage window first.
        else if(posture==='assault'&&r.type!=='repair')value*=.5;
        if(value<=0)return;var enemySteps=Math.min(...info.enemies.map(function(e){return base.wallDistance(g,e,r)??Infinity;}));if(enemySteps<p.steps)value*=.4;
        add(posture==='recover'?'retreat_resupply':'resupply',r.type,p,value,'useful_'+r.type);
      });
      info.enemies.forEach(function(e){var shot=combat.shot(g,t,e,side);if(!shot.clear)return;var damage=t.power_until>g.tick?20:12,victim=shot.victim,lethal=damage>=victim.hp+victim.shield;
        var value=damage*2+(lethal?100:0)-7*t.cooldown+(posture==='burst'?14:0)+(posture==='support'&&focus?.id===victim.id?16:0);
        if(posture==='recover'&&!lethal)value*=.55;
        candidates.push({mode:posture==='support'?'support_fire':'fire',type:null,target:{x:e.x,y:e.y},action:'fire_'+e.id,path:[],steps:0,route_cost:0,exposure_sum:exposed,benefit:damage,value:value,reason:lethal?'lethal_shot':posture==='burst'?'spend_power_window':'damage_opportunity'});
      });
      var wait=waitAssessment(g,t);if(wait.eligible)candidates.push({mode:'wait',type:null,target:{x:t.x,y:t.y},action:'wait',path:[],steps:0,route_cost:0,exposure_sum:exposed,benefit:0,value:(wait.reason==='trapped'?0:wait.reason==='reload_position'?24:16)-wait.penalty,reason:wait.reason});
      candidates.sort(function(a,b){return b.value-a.value||a.steps-b.steps;});var best=candidates[0]||{mode:'engage',type:null,target:null,action:null,path:[],steps:0,route_cost:0,exposure_sum:0,benefit:0,value:0,reason:'no_objective'};
      if(best.path.length)reserved.add(best.path[0].x+','+best.path[0].y);if(best.type)claimed.add(best.target.x+','+best.target.y);
      result[t.id]=Object.assign({role:posture,ally:ally?.id||null,focus_enemy:focus?.id||null,wait_assessment:wait},best);
    });return result;
  }
  return {revision:REVISION,enabled:enabled,role:role,choose:choose,waitAssessment:waitAssessment};
}));

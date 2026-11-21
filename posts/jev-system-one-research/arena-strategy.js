/* Resource/terrain continuation policy v2. Public-state application heuristics,
   not learned skill, future knowledge, or automatic repair of model orders. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'),require('./arena-geometry'));else root.JevArenaStrategy=factory(root.JevArenaCombat,root.JevArenaGeometry);}(typeof window!=='undefined'?window:this,function(combat,geometry){
  'use strict';
  var dirs={move_up:[0,-1],move_right:[1,0],move_down:[0,1],move_left:[-1,0]};
  function key(p){return p.x+','+p.y;}
  function exposure(g,t,p){return g.tanks.filter(function(e){return e.hp>0&&e.side!==t.side&&geometry.sight(g,e,p).clear;}).reduce(function(n,e){return n+(e.power_until>g.tick?20:12)*(1-.1*Math.min(5,e.cooldown));},0);}
  function routes(g,t,options){
    if(!combat.cacheActive())return routesUncached(g,t,options);
    var key='routes:'+JSON.stringify([g.version,g.ruleset,g.map,t.id,t.side,t.x,t.y,t.hp,t.shield,options?.riskWeight??null,g.tanks.filter(function(o){return o.hp>0;}).map(function(o){return [o.id,o.side,o.x,o.y,o.cooldown,o.power_until>g.tick];})]);
    return combat.memo(key,function(){return routesUncached(g,t,options);});
  }
  function routesUncached(g,t,options){
    var blocked=new Set(g.tanks.filter(function(o){return o.hp>0&&o.id!==t.id;}).map(key)),rows=new Map(),queue=[],riskWeight=options?.riskWeight??(t.hp+t.shield<50?.22:.07);
    var first={x:t.x,y:t.y,cost:0,steps:0,risk:0,path:[],action:null};rows.set(key(t),first);queue.push(first);
    var directions=Object.entries(dirs);if(t.side===1)directions=directions.slice(2).concat(directions.slice(0,2));
    while(queue.length){queue.sort(function(a,b){return a.cost-b.cost;});var p=queue.shift();if(rows.get(key(p))!==p)continue;
      directions.forEach(function(e){var x=p.x+e[1][0],y=p.y+e[1][1],k=x+','+y;if(g.map[y]?.[x]!=='.'||blocked.has(k))return;
        var risk=exposure(g,t,{x:x,y:y}),cost=p.cost+1+riskWeight*risk;if(rows.has(k)&&rows.get(k).cost<=cost)return;
        var r={x:x,y:y,cost:cost,steps:p.steps+1,risk:p.risk+risk,path:p.path.concat([{x:x,y:y}]),action:p.action||e[0]};rows.set(k,r);queue.push(r);
      });
    }return rows;
  }
  function benefit(g,t,r,steps,fireSteps){
    if(r.type==='repair')return Math.min(30,100-t.hp)*(t.hp<=40?2:.8);
    if(r.type==='shield')return Math.max(0,30-t.shield)*(t.hp<=50?1:.65);
    if(r.type!=='power'||fireSteps===null)return 0;
    // +8 damage/shot, six-tick fire period, 30-tick buff; do not value a
    // refresh as five new shots or ignore the trip from pickup to firing range.
    var remaining=Math.max(0,t.power_until-g.tick-4*steps),usable=Math.max(0,30-4*fireSteps);
    return .8*8*Math.min(usable,Math.max(0,30-remaining))/6;
  }
  function choose(g,side){
    var audit={},claimed=new Set(),reserved=new Set(),tanks=g.tanks.filter(function(t){return t.hp>0&&t.side===side;});
    tanks.sort(function(a,b){return a.hp-b.hp||Number(a.id[1])-Number(b.id[1]);});
    tanks.forEach(function(t){
      var info=combat.analyse(g,t),paths=routes(g,t),candidates=[],currentThreat=exposure(g,t,t);
      paths.forEach(function(p){if(!p.steps)return;var fireSteps=info.distances[p.y]?.[p.x];
        if(fireSteps===0)candidates.push({mode:'approach',type:null,target:{x:p.x,y:p.y},route:p,benefit:22,score:22/(1+.3*p.cost)});
        if(currentThreat>0&&(t.cooldown>0||t.hp+t.shield<=40)&&exposure(g,t,p)===0&&fireSteps!==null&&fireSteps<=2)candidates.push({mode:'cover_counterattack',type:null,target:{x:p.x,y:p.y},route:p,benefit:26,score:26/(1+.3*p.cost)+4/(1+fireSteps)});
      });
      (g.rewards||[]).forEach(function(r){var p=paths.get(key(r));if(!p||!p.steps||claimed.has(key(r)))return;var b=benefit(g,t,r,p.steps,info.distances[r.y]?.[r.x]??null);if(b<=0)return;
        // Contest estimate uses reachable wall-only routes, not Manhattan distance.
        var nearestEnemy=Infinity;g.tanks.filter(function(e){return e.hp>0&&e.side!==side;}).forEach(function(e){var q=wallDistance(g,e,r);if(q!==null)nearestEnemy=Math.min(nearestEnemy,q);});
        var contest=nearestEnemy<p.steps?.4:1;
        candidates.push({mode:t.hp<=40&&r.type!=='power'?'retreat_resupply':'resupply',type:r.type,target:{x:r.x,y:r.y},route:p,benefit:b,score:b*contest/(1+.3*p.cost)});
      });
      candidates=candidates.filter(function(c){return !reserved.has(key(c.route.path[0]));}).sort(function(a,b){return b.score-a.score||a.route.steps-b.route.steps;});
      var best=candidates[0];if(best){reserved.add(key(best.route.path[0]));if(best.type)claimed.add(key(best.target));audit[t.id]={mode:best.mode,type:best.type,target:best.target,action:best.route.action,steps:best.route.steps,route_cost:best.route.cost,exposure_sum:best.route.risk,benefit:best.benefit,value:best.score,path:best.route.path};}
      else audit[t.id]={mode:'engage',type:null,target:null,action:null,steps:0,route_cost:0,exposure_sum:0,benefit:0,value:0,path:[]};
    });return audit;
  }
  function wallDistance(g,from,to){var queue=[{x:from.x,y:from.y,d:0}],seen=new Set([key(from)]);for(var i=0;i<queue.length;i++){var p=queue[i];if(p.x===to.x&&p.y===to.y)return p.d;Object.values(dirs).forEach(function(d){var q={x:p.x+d[0],y:p.y+d[1],d:p.d+1},k=key(q);if(g.map[q.y]?.[q.x]==='.'&&!seen.has(k)){seen.add(k);queue.push(q);}});}return null;}
  function potential(g,side){var n=0;g.tanks.filter(function(t){return t.side===side&&t.hp>0;}).forEach(function(t){var info=combat.analyse(g,t),distance=info.current??20,usable=Math.max(0,t.power_until-g.tick-4*distance);n+=.4*8*Math.floor(usable/6);});return n;}
  return {version:'resource-terrain-v2',choose:choose,routes:routes,benefit:benefit,exposure:exposure,potential:potential,wallDistance:wallDistance};
}));

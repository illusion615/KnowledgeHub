/* Explicit BFS-assisted attack observation. It does NOT choose, filter, repair
   or execute orders. Distances freeze all other tanks at the input snapshot. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-facts'),require('./arena-geometry'));else root.JevArenaCombat=factory(root.JevArenaFacts,root.JevArenaGeometry);
}(typeof window!=='undefined'?window:this,function(facts,geometry){
  'use strict';
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function shot(game,from,target,side){
    if(!target||target.hp<=0||target.side===side)return {clear:false,reason:'target unavailable'};
    if(geometry.enabled(game)){var sight=geometry.sight(game,from,target);if(!sight.clear)return {clear:false,reason:sight.reason};var hit=geometry.sweep(game,from,target,side,from.id);if(hit?.kind==='tank'&&hit.tank.side===side)return {clear:false,reason:'friendly_blocked',victim:hit.tank};return hit?.kind==='tank'?{clear:true,victim:hit.tank}:{clear:false,reason:'target unavailable'};}
    var dx=target.x-from.x,dy=target.y-from.y,range=Math.abs(dx)+Math.abs(dy);
    if(!range||range>6)return {clear:false,reason:'out of range'};
    if(dx&&dy)return {clear:false,reason:'not aligned'};
    dx=Math.sign(dx);dy=Math.sign(dy);
    // The real projectile hits the first enemy; allies do not block bullets.
    var first=null;
    for(var n=1;n<=range;n++){
      var x=from.x+dx*n,y=from.y+dy*n;
      if(game.map[y]?.[x]!=='.')return {clear:false,reason:'wall'};
      var victim=game.tanks.find(function(t){return t.hp>0&&t.side!==side&&t.x===x&&t.y===y;});
      if(victim&&!first)first=victim;
    }
    return first?{clear:true,victim:first}:{clear:false,reason:'target unavailable'};
  }
  var activeMemo=null;
  function memo(key,compute){
    if(!activeMemo)return compute();
    if(activeMemo.values.has(key)){activeMemo.hits++;return activeMemo.values.get(key);}
    activeMemo.misses++;var value=compute();if(activeMemo.values.size>=512)activeMemo.values.delete(activeMemo.values.keys().next().value);activeMemo.values.set(key,value);return value;
  }
  // Synchronous build-scoped cache only: never survives an inference call or
  // a new planner build. Fresh closures and live enemy objects are NOT cached.
  function withAnalysisCache(fn){var previous=activeMemo,state={values:new Map(),hits:0,misses:0};activeMemo=state;try{return {value:fn(),stats:{hits:state.hits,misses:state.misses,entries:state.values.size}};}finally{activeMemo=previous;}}
  function analyse(game,tank){
    var height=game.map.length,width=game.map[0].length,enemies=game.tanks.filter(function(t){return t.side!==tank.side&&t.hp>0;}),blocked=new Set();
    game.tanks.filter(function(t){return t.id!==tank.id&&t.hp>0;}).forEach(function(t){blocked.add(t.x+','+t.y);});
    function open(x,y){return game.map[y]?.[x]==='.'&&!blocked.has(x+','+y);}
    var cacheKey=activeMemo?'firing:'+JSON.stringify([game.version,game.ruleset,game.map,tank.id,tank.side,game.tanks.filter(function(t){return t.hp>0;}).map(function(t){return [t.id,t.side,t.x,t.y];})]):null;
    if(cacheKey&&activeMemo.values.has(cacheKey)){var cached=memo(cacheKey,function(){});return {distances:cached,open:open,enemies:enemies,current:cached[tank.y]?.[tank.x]??null};}
    var distances=Array.from({length:height},function(){return Array(width).fill(null);}),queue=[];
    for(var y=0;y<height;y++)for(var x=0;x<width;x++)if(open(x,y)&&enemies.some(function(e){return shot(game,{x:x,y:y,id:tank.id},e,tank.side).clear;})){distances[y][x]=0;queue.push({x:x,y:y});}
    for(var i=0;i<queue.length;i++){
      var p=queue[i];Object.values(directions).forEach(function(d){var x=p.x+d[0],y=p.y+d[1];if(open(x,y)&&distances[y][x]===null){distances[y][x]=distances[p.y][p.x]+1;queue.push({x:x,y:y});}});
    }
    if(cacheKey)memo(cacheKey,function(){return distances;});
    return {distances:distances,open:open,enemies:enemies,current:distances[tank.y]?.[tank.x]??null};
  }
  function describe(game,tank,key){
    var info=analyse(game,tank),d=directions[key];
    if(d){
      var x=tank.x+d[0],y=tank.y+d[1];
      if(!info.open(x,y))return 'BLOCKED: '+key.slice(5)+' to ('+x+','+y+') cannot move: wall or live tank. Enemy damage 0.';
      var next=info.distances[y][x],tag=info.current===0?'LEAVES A FIRING OPPORTUNITY':next===null?'NO REACHABLE FIRING POSITION':info.current===null||next<info.current?'ADVANCES ATTACK':next>info.current?'DELAYS ATTACK':'NO ATTACK PROGRESS';
      return tag+': move '+key.slice(5)+' to ('+x+','+y+'). BFS steps to a clear firing position '+(info.current??'unreachable')+' -> '+(next??'unreachable')+'. Enemy damage this action 0.';
    }
    var target=info.enemies.find(function(e){return key==='fire_'+e.id;});if(!target)throw new Error('unknown_action_description');
    var sight=shot(game,tank,target,tank.side);
    if(sight.reason==='friendly_blocked')return 'UNSAFE FIRE: ally '+sight.victim.id+' intercepts the shot and takes damage. Reposition to clear the friendly firing lane.';
    if(!sight.clear)return 'INEFFECTIVE FIRE: '+target.id+', '+sight.reason+'. Enemy damage 0; need a firing position first.';
    var victim=sight.victim,damage=tank.power_until>game.tick?20:12,shield=Math.min(victim.shield,damage),hp=Math.min(victim.hp,Math.max(0,damage-shield));
    return 'ATTACK: fire at '+target.id+'; first hit '+victim.id+'. If stationary: HP damage '+hp+', shield damage '+shield+(hp===victim.hp?'; DESTROYS this enemy':'')+'. Clear shot; reload '+tank.cooldown+' ticks.';
  }
  function observation(game,context){
    return facts.observation(game,context).split('\n').map(function(line){
      if(line.startsWith('Tank battle.'))return 'GOAL: DESTROY enemy tanks. Damage and kills are progress; walking and exploring are NOT goals.';
      if(line.startsWith('ASSISTED INPUT:'))return 'BFS-ASSISTED ATTACK: each move reports shortest steps to ANY clear firing cell, with other tanks frozen. Shot damage assumes stationary targets. All choices remain available; no automatic orders.';
      return line;
    }).join('\n');
  }
  function question(game,tank){
    return 'Attack with '+tank.id+'. Priorities: (1) take clear shots to destroy enemies, then deal damage; (2) if no clear shot, reduce BFS steps to a firing cell. Revisiting cells is allowed to attack. Do not explore or wander. Choose one action.';
  }
  function request(game,side,context){
    var questions={};game.tanks.filter(function(t){return t.side===side&&t.hp>0;}).forEach(function(t){
      var criteria={};Object.keys(directions).concat(game.tanks.filter(function(e){return e.side!==side&&e.hp>0;}).map(function(e){return 'fire_'+e.id;})).forEach(function(key){criteria[key]=describe(game,t,key);});
      questions[t.id]={type:'choice',instructions:question(game,t),criteria:criteria};
    });
    return {states:[{id:'arena',state:observation(game,context||{duration_ticks:null}),questions:questions}]};
  }
  return {cacheActive:function(){return !!activeMemo;},memo:memo,withAnalysisCache:withAnalysisCache,version:'tank-combat-bfs-v1',analyse:analyse,shot:shot,describe:describe,observation:observation,question:question,request:request};
}));

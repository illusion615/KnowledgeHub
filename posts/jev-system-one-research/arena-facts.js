/* Explicit observation assistance, never an action filter, solver or repair.
   All facts describe the input snapshot; motion/reload can change before use. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-geometry'));else root.JevArenaFacts=factory(root.JevArenaGeometry);
}(typeof window!=='undefined'?window:this,function(geometry){
  'use strict';
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function distance(x,y,t){return Math.abs(x-t.x)+Math.abs(y-t.y);}
  function describe(game,t,key){
    var enemies=game.tanks.filter(function(e){return e.side!==t.side&&e.hp>0;}),d=directions[key];
    if(d){
      var x=t.x+d[0],y=t.y+d[1],wall=game.map[y]?.[x]!=='.',occupied=game.tanks.some(function(e){return e.id!==t.id&&e.hp>0&&e.x===x&&e.y===y;});
      if(wall||occupied)return 'Move '+key.slice(5)+' FAILS now: '+(wall?'wall':'live tank')+' at ('+x+','+y+'); no displacement.';
      var before=Math.min.apply(null,enemies.map(function(e){return distance(t.x,t.y,e);})),after=Math.min.apply(null,enemies.map(function(e){return distance(x,y,e);}));
      var prior=directions[t.last_execution?.action],undo=prior&&t.last_execution.outcome==='moved'&&prior[0]===-d[0]&&prior[1]===-d[1];
      var visits=(t.recent_positions||[]).filter(function(p){return p.x===x&&p.y===y;}).length;
      return 'Move '+key.slice(5)+' to ('+x+','+y+'): open cell. '+(visits?'Destination visited '+visits+' times in last 8 positions.':'Destination not in last 8 positions.')+(enemies.length?' Nearest enemy distance '+before+' -> '+after+' ('+(after<before?'closer':after>before?'farther':'same')+').':'')+(undo?' Reverses the last successful move.':'');
    }
    var enemy=enemies.find(function(e){return key==='fire_'+e.id;});if(!enemy)throw new Error('unknown_action_description');
    if(geometry.enabled(game)){var ray=geometry.sight(game,t,enemy),hit=ray.clear&&geometry.friendlyFire(game)?geometry.sweep(game,t,enemy,t.side,t.id):null;if(hit?.kind==='tank'&&hit.tank.side===t.side)return 'UNSAFE FIRE at '+enemy.id+': ally '+hit.tank.id+' intercepts the shot and takes damage. Reposition rather than shoot through a teammate.';return ray.clear?'Fire at '+enemy.id+': clear arbitrary-angle shot; Euclidean distance '+ray.distance.toFixed(2)+' <=6; reload '+t.cooldown+' ticks.':'Fire at '+enemy.id+' FAILS now: '+ray.reason+'. No damage.';}
    var dist=distance(t.x,t.y,enemy),aligned=t.x===enemy.x||t.y===enemy.y,reasons=[];
    if(dist>6)reasons.push('distance '+dist+' exceeds range 6');
    if(!aligned)reasons.push('not in same row or column');
    if(aligned&&dist>0){var dx=Math.sign(enemy.x-t.x),dy=Math.sign(enemy.y-t.y);for(var x=t.x+dx,y=t.y+dy;x!==enemy.x||y!==enemy.y;x+=dx,y+=dy){if(game.map[y]?.[x]!=='.'){reasons.push('wall blocks shot');break;}}}
    return reasons.length?'Fire at '+enemy.id+' FAILS now: '+reasons.join('; ')+'. No damage.':'Fire at '+enemy.id+': clear shot, distance '+dist+' <=6; damage on hit. Reload '+t.cooldown+' ticks.';
  }
  function observation(game,context){
    context=context||{};
    return [
      'Tank battle. Win by destroying enemies; at limits maximize survivors then HP.',
      'ASSISTED INPUT: computed geometry, Manhattan distance and last-8-position visit counts. Not recommended actions. All choices selectable; snapshot facts are not future guarantees.',
      'One attempt then replan. Move/cell 4ticks. Fire/6ticks: '+(geometry.enabled(game)?'any angle, Euclidean radius <=6, walls/corners block rays':'same row/column, <=6cells, no walls')+'. Bullets/cell 1tick, '+(geometry.friendlyFire(game)?'hit first tank including allies; avoid friendly lanes':'pass allies')+'. Damage12(boost20). Walls/live tanks block moves; walls indestructible.',
      'Coordinates (x,y) from top-left. # wall; . floor. Tick '+game.tick+'; tick=0.2s.'+(Number.isInteger(context.duration_ticks)?' Remaining '+Math.max(0,context.duration_ticks-game.tick)+'ticks.':context.duration_ticks===null?' No time limit.':''),
      game.map.join('\n'),
      game.tanks.map(function(t){return t.id+' ('+t.x+','+t.y+') HP'+t.hp+' shield'+t.shield+' reload'+t.cooldown+' boost'+Math.max(0,t.power_until-game.tick);}).join('\n'),
      'Pickups: '+(game.rewards.map(function(r){return r.type+'('+r.x+','+r.y+')';}).join(' ')||'none')+'. repair+30HP(max100), shield30HP, power30ticks.',
      'Bullets: '+(game.bullets.map(function(b){return geometry.enabled(game)?(b.side===0?'B':'R')+'('+Number(b.x.toFixed(1))+','+Number(b.y.toFixed(1))+') v('+Number(b.dx.toFixed(1))+','+Number(b.dy.toFixed(1))+') ttl'+b.life:(b.side===0?'B':'R')+'('+b.x+','+b.y+') direction('+b.dx+','+b.dy+')';}).join(' ')||'none')
    ].join('\n');
  }
  function question(game,t){
    return 'Choose the next action for '+t.id+' to defeat '+game.tanks.filter(function(e){return e.side!==t.side&&e.hp>0;}).map(function(e){return e.id;}).join(',')+'. Take feasible shots; otherwise approach via open, unvisited cells. Avoid cycling through visited positions without progress. Last attempt: '+(t.last_execution?t.last_execution.action+' -> '+t.last_execution.outcome:'none')+'.';
  }
  function request(game,side){
    var state=observation(game,{duration_ticks:300}),questions={};
    game.tanks.filter(function(t){return t.side===side&&t.hp>0;}).forEach(function(t){
      var enemies=game.tanks.filter(function(e){return e.side!==side&&e.hp>0;}),criteria={};
      Object.keys(directions).concat(enemies.map(function(e){return 'fire_'+e.id;})).forEach(function(key){criteria[key]=describe(game,t,key);});
      questions[t.id]={type:'choice',instructions:question(game,t),criteria:criteria};
    });
    return {states:[{id:'arena',state:state,questions:questions}]};
  }
  return {version:'tank-action-facts-v2',describe:describe,observation:observation,question:question,request:request};
}));

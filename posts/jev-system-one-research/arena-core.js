/* Deterministic, shared tank rules. No model, network, credentials or rendering. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./arena-task'),require('./arena-geometry'),require('./arena-progress'),require('./arena-deadlock'));
  else root.JevArena = factory(root.JevArenaTask,root.JevArenaGeometry,root.JevArenaProgress,root.JevArenaDeadlock);
}(typeof window !== 'undefined' ? window : this, function (task, geometry, progress, deadlock) {
  'use strict';
  var W = 13, H = 9, TICK_MS = 200;
  var DIRECTIONS = {move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  var isActionControl = function (game) { return game.control==='primitive'||game.control==='step'; };
  var copy = function (value) { return JSON.parse(JSON.stringify(value)); };
  var distance = function (a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); };
  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  }
  function walkable(map, x, y) { return x >= 0 && y >= 0 && x < W && y < H && map[y][x] !== '#'; }
  function neighbors(map, p, side) { return (side===1?[[0,1],[-1,0],[0,-1],[1,0]]:[[0,-1],[1,0],[0,1],[-1,0]]).map(function (d) { return { x:p.x+d[0], y:p.y+d[1] }; }).filter(function (q) { return walkable(map,q.x,q.y); }); }
  function path(map, from, target, blocked, side) {
    var key = function (p) { return p.x + ',' + p.y; }, queue = [from], previous = new Map([[key(from), null]]), end;
    if (!target || !walkable(map,target.x,target.y)) return [];
    for (var n = 0; n < queue.length; n++) {
      var p = queue[n]; if (key(p) === key(target)) { end = p; break; }
      var next = neighbors(map,p,side); // rotationally symmetric tie breaking
      next.forEach(function (q) {
        var k = key(q);
        if (!previous.has(k) && !(blocked && blocked.has(k) && k !== key(target))) { previous.set(k,p); queue.push(q); }
      });
    }
    if (!end) return [];
    var route = [];
    while (previous.get(key(end))) { route.unshift(end); end = previous.get(key(end)); }
    return route;
  }
  function makeMap(seed) {
    var random = rng(seed), map, rewards = [], slots = [];
    for (var sy=2;sy<=6;sy++) for (var sx=3;sx<=5;sx++) slots.push({x:sx,y:sy});
    ['repair','shield','power'].forEach(function(type){
      var p=slots.splice(Math.floor(random()*slots.length),1)[0];
      rewards.push({x:p.x,y:p.y,type:type},{x:W-1-p.x,y:H-1-p.y,type:type});
    });
    var required = [{x:1,y:3},{x:1,y:5},{x:11,y:3},{x:11,y:5},{x:4,y:1},{x:8,y:7},{x:4,y:7},{x:8,y:1}].concat(rewards);
    for (var attempt = 0; attempt < 80; attempt++) {
      map = Array.from({length:H}, function (_,y) { return Array.from({length:W}, function (_,x) { return x===0||y===0||x===W-1||y===H-1 ? '#' : '.'; }); });
      for (var y=1;y<H-1;y++) for (var x=1;x<=Math.floor(W/2);x++) if (random()<0.20) { map[y][x]='#'; map[H-1-y][W-1-x]='#'; }
      required.forEach(function (p) { map[p.y][p.x]='.'; });
      if (required.every(function (p) { return distance(p,required[0])===0 || path(map,required[0],p).length; }) && map.flat().filter(function (v) { return v==='#'; }).length >= 44) return { map:map.map(function (r) { return r.join(''); }), rewards:rewards };
    }
    // Deterministic connected fallback, still containing internal obstacles.
    map = Array.from({length:H}, function (_,y) { return Array.from({length:W}, function (_,x) { return x===0||y===0||x===W-1||y===H-1 || (x===6 && [2,6].includes(y)) ? '#' : '.'; }).join(''); });
    return {map:map,rewards:rewards};
  }
  function create(seed, control, inputProfile, ruleset) {
    control=control||'strategic';
    if (!['strategic','primitive','step'].includes(control)) throw new Error('invalid_control');
    if(inputProfile!==undefined&&!['raw','action-facts','engage-first','utility-attack','utility-tactics','utility-planner'].includes(inputProfile))throw new Error('invalid_input_profile');
    ruleset=ruleset||'cardinal';if(!['cardinal','tactical','friendly-fire'].includes(ruleset)||['tactical','friendly-fire'].includes(ruleset)&&control!=='step')throw new Error('invalid_ruleset');
    var terrain = makeMap(String(seed));
    return { ruleset:ruleset,input_profile:control==='step'?(inputProfile||'raw'):'raw', visual_protocol:'tank-vfx-v1', event_seq:0, shot_seq:0, events:[], version:ruleset==='friendly-fire'?'tank-v7-friendly-fire':ruleset==='tactical'?'tank-v6-tactical':control==='step'?'tank-v5-step':control==='primitive'?'tank-v4-active':'tank-v2', control:control, seed:String(seed), tick:0, width:W, height:H, map:terrain.map, rewards:terrain.rewards,
      tanks:[{id:'B0',side:0,x:1,y:3},{id:'B1',side:0,x:1,y:5},{id:'R0',side:1,x:11,y:5},{id:'R1',side:1,x:11,y:3}].map(function (t) { return Object.assign(t,{hp:100,shield:0,power_until:0,cooldown:0,order:control!=='strategic'?'awaiting_order':'hold',movement:control!=='strategic'?'awaiting_order':'holding',pending_action:false,moved_cells:0,recent_positions:[{x:t.x,y:t.y}],last_execution:null}); }),
      bullets:[], stats:[0,1].map(function(){return {damage:0,rewards:0,blocked:0,moved:0,move_attempts:0,fire_attempts:0,shots:0,hits:0,invalid_shots:0,friendly_hits:0,friendly_damage:0,friendly_shield_damage:0};}) };
  }
  function candidates(game, tank) {
    if (isActionControl(game)) {
      var actions={};
      if(task.allowsWait(game))actions.wait=task.describe(game,tank,'wait');
      Object.keys(DIRECTIONS).forEach(function(key){actions[key]=task.describe(game,tank,key);});
      game.tanks.filter(function(t){return t.side!==tank.side&&t.hp>0&&task.allowsFire(game,tank,t);}).forEach(function(t){actions['fire_'+t.id]=task.describe(game,tank,'fire_'+t.id);});
      return actions;
    }
    var other = tank.side===0 ? 'R' : 'B';
    var choices = {hold:'Remain stationary here; only auto-fire at visible enemies.', retreat:'Return to your original spawn; still fire if possible.', north:'Flank via the enemy-side north lane.', south:'Flank via the enemy-side south lane.', support:'Move near your surviving teammate; fire if possible.'};
    game.tanks.filter(function (t) { return t.side!==tank.side && t.hp>0; }).forEach(function (t) { choices['attack'+t.id[1]]='Pursue and focus fire on '+other+t.id[1]+'.'; });
    ['repair','shield','power'].forEach(function (type) { if (game.rewards.some(function (r) { return r.type===type; })) choices[type]='Go to nearest '+type+' reward; collect it.'; });
    Object.keys(choices).forEach(function(order){
      if (order!=='hold' && stationaryReason(game,Object.assign({},tank,{order:order}))) delete choices[order];
    });
    return choices;
  }
  function observation(game, context) { return task.observation(game,context); }
  function request(game, side, sharedObservation) {
    var questions = {};
    game.tanks.filter(function(t){return t.side===side && t.hp>0;}).forEach(function(t){
      questions[t.id]={type:'choice',instructions:task.question(game,t),criteria:candidates(game,t)};
    });
    return {states:[{id:'arena',state:sharedObservation===undefined?observation(game):sharedObservation,questions:questions}]};
  }
  function validatePlan(value, req) {
    var questions = req.states[0].questions;
    if (!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).sort().join(',')!==Object.keys(questions).sort().join(',')) throw new Error('arena_invalid_plan');
    var plan = {};
    Object.keys(questions).forEach(function(id){ if (typeof value[id]!=='string' || !Object.prototype.hasOwnProperty.call(questions[id].criteria,value[id])) throw new Error('arena_invalid_plan'); plan[id]=value[id]; });
    return plan;
  }
  function applyPlan(game, side, plan) {
    game.tanks.filter(function(t){return t.side===side && t.hp>0;}).forEach(function(t){ if (Object.prototype.hasOwnProperty.call(plan,t.id)) { t.order=plan[t.id]; t.pending_action=game.control==='step'; if(task.allowsWait(game)&&t.order==='wait')t.wait_until=game.tick+4; t.movement=stationaryReason(game,t)||'ready'; } });
  }
  function target(game, tank) {
    var order = tank.order;
    if (isActionControl(game)) {
      var d=DIRECTIONS[order];return d?{x:tank.x+d[0],y:tank.y+d[1]}:tank;
    }
    if (order==='hold') return tank;
    if (order==='retreat') return {x:tank.side===0?1:11,y:tank.side===0?(tank.id[1]==='0'?3:5):(tank.id[1]==='0'?5:3)};
    if (order==='north'||order==='south') return {x:tank.side===0?8:4,y:order==='north'?1:7};
    if (order==='support') { var friend=game.tanks.find(function(t){return t.side===tank.side && t.id!==tank.id && t.hp>0;}); return friend && distance(tank,friend)>2?friend:tank; }
    if (order.startsWith('attack')) return game.tanks.find(function(t){return t.side!==tank.side && t.id[1]===order.slice(-1) && t.hp>0;}) || tank;
    var pickups = game.rewards.filter(function(r){return r.type===order;});
    if (tank.side===1) pickups.reverse(); // mirror nearest-reward tie breaking too
    pickups.sort(function(a,b){return path(game.map,tank,a).length-path(game.map,tank,b).length;});
    return pickups[0] || tank;
  }
  function stationaryReason(game, tank) {
    if (tank.hp<=0) return 'destroyed';
    if (isActionControl(game)) {
      if(game.control==='step'&&!tank.pending_action)return tank.last_execution?'action_complete':'awaiting_order';
      if (tank.order==='awaiting_order') return 'awaiting_order';
      if (tank.order==='wait') return task.allowsWait(game)?'tactical_wait':'waiting'; // Explicit v3 planner or historical replay only.
      var d=DIRECTIONS[tank.order];if(d)return walkable(game.map,tank.x+d[0],tank.y+d[1])?null:'blocked_wall';
      var enemy=game.tanks.find(function(t){return t.id===tank.order.slice(5)&&t.side!==tank.side&&t.hp>0;});
      return !enemy?'target_gone':line(game,tank,enemy)?'firing':'out_of_range';
    }
    if (tank.order==='hold') return 'holding';
    var goal=target(game,tank);
    if (distance(tank,goal)>0) return null;
    if (tank.order==='retreat') return 'at_spawn';
    if (tank.order==='support') return game.tanks.some(function(t){return t.side===tank.side&&t.id!==tank.id&&t.hp>0;})?'support_range':'no_teammate';
    if (tank.order.startsWith('attack')) return 'target_gone';
    if (tank.order==='north'||tank.order==='south') return 'at_waypoint';
    return 'reward_gone';
  }
  function line(game, from, to) {
    if(geometry.enabled(game)){var ray=geometry.sight(game,from,to);return ray.clear?{dx:ray.dx,dy:ray.dy}:null;}
    if (from.x!==to.x && from.y!==to.y || distance(from,to)>6) return null;
    var dx=Math.sign(to.x-from.x),dy=Math.sign(to.y-from.y);
    if (!dx&&!dy) return null;
    for (var x=from.x+dx,y=from.y+dy;x!==to.x||y!==to.y;x+=dx,y+=dy) if (!walkable(game.map,x,y)) return null;
    return {dx:dx,dy:dy};
  }
  function visualEvent(game, value) {
    game.events.push(Object.assign({id:++game.event_seq,tick:game.tick},value));
    if (game.events.length>96) game.events.shift();
  }
  function executed(game,tank,outcome) { if(task.allowsWait(game))tank.wait_streak=outcome==='waited'?(tank.wait_streak||0)+1:0; tank.last_execution={tick:game.tick,action:tank.order,outcome:outcome}; if(game.control==='step')tank.pending_action=false; }
  function sideReady(game,side) { return game.tanks.filter(function(t){return t.side===side&&t.hp>0;}).every(function(t){return !t.pending_action;}); }
  function step(game) {
    game.tick++;
    game.events=game.events.filter(function(e){return e.tick>=game.tick-16;});
    var alive=game.tanks.filter(function(t){return t.hp>0;});
    if(task.allowsWait(game))alive.forEach(function(t){if(t.pending_action&&t.order==='wait'){
      game.stats[t.side].tactical_wait_ticks=(game.stats[t.side].tactical_wait_ticks||0)+1;
      if(game.tick>=t.wait_until){executed(game,t,'waited');t.movement='action_complete';game.stats[t.side].wait_actions=(game.stats[t.side].wait_actions||0)+1;}
    }});
    if (game.tick%4===0) {
      var occupied = new Set(alive.map(function(t){return t.x+','+t.y;}));
      var moves=alive.map(function(t){
        if(game.control==='step'&&(!t.pending_action||!Object.prototype.hasOwnProperty.call(DIRECTIONS,t.order)))return {tank:t,next:null};
        if (isActionControl(game)&&Object.prototype.hasOwnProperty.call(DIRECTIONS,t.order)) game.stats[t.side].move_attempts++;
        var reason=stationaryReason(game,t);if(reason){t.movement=reason;if(reason==='blocked_wall'){game.stats[t.side].blocked++;executed(game,t,'blocked_wall');}return {tank:t,next:null};}
        var goal=target(game,t);
        if (isActionControl(game)) return {tank:t,next:goal,needsMove:true};
        var route=path(game.map,t,goal,occupied,t.side);
        // A distant tank is not a permanent wall. Prefer a clear route; if the
        // whole route is obstructed, approach along the wall-only route, but
        // still never enter an occupied cell in this movement step.
        if (!route.length) route=path(game.map,t,goal,null,t.side);
        game.stats[t.side].move_attempts++;
        return {tank:t,next:route[0]||null,needsMove:true};
      });
      var priority=(game.tick/4-1)%2;
      moves.forEach(function(m){
        if (!m.next) {if(m.needsMove){m.tank.movement='blocked';game.stats[m.tank.side].blocked++;executed(game,m.tank,'no_route');}return;}
        var key=m.next.x+','+m.next.y;
        if (occupied.has(key)) {
          var occupant=alive.find(function(t){return t.x===m.next.x&&t.y===m.next.y;});
          m.tank.movement=occupant&&occupant.side!==m.tank.side?(isActionControl(game)?'blocked_enemy':'engaging'):'blocked';game.stats[m.tank.side].blocked++;executed(game,m.tank,'blocked_tank');return;
        }
        var contenders=moves.filter(function(n){return n.next&&n.next.x===m.next.x&&n.next.y===m.next.y;});
        if (contenders.length>1) {
          // Do not permanently freeze allies choosing the same next tile.
          // Alternating unit priority is mirrored for Blue and Red. Opposing
          // contenders still block each other and can exchange fire normally.
          if (contenders.some(function(n){return n.tank.side!==m.tank.side;}) || Number(m.tank.id[1])!==priority) {
            m.tank.movement='yielding';game.stats[m.tank.side].blocked++;executed(game,m.tank,'yielding');return;
          }
        }
        m.tank.x=m.next.x;m.tank.y=m.next.y;m.tank.movement='moving';m.tank.moved_cells++;
        m.tank.recent_positions=(m.tank.recent_positions||[]).concat({x:m.next.x,y:m.next.y}).slice(-8);
        game.stats[m.tank.side].moved++;executed(game,m.tank,'moved');
      });
    }
    alive.forEach(function(t){
      game.rewards=game.rewards.filter(function(r){
        if (r.x!==t.x||r.y!==t.y) return true;
        visualEvent(game,{kind:'pickup',tank:t.id,side:t.side,x:t.x,y:t.y,reward:r.type});
        if (r.type==='repair') t.hp=Math.min(100,t.hp+30);
        if (r.type==='shield') t.shield=30;
        if (r.type==='power') t.power_until=game.tick+30;
        game.stats[t.side].rewards++; return false;
      });
    });
    // All shots originate before damage is resolved: mutual destruction is possible.
    alive.forEach(function(t){
      if (t.cooldown>0) {t.cooldown--;return;}
      if(game.control==='step'&&!t.pending_action)return;
      if (isActionControl(game)&&!t.order.startsWith('fire_')) return;
      if (isActionControl(game)) {
        game.stats[t.side].fire_attempts++;
        // An ineffective trigger pull still consumes a firing opportunity. Do
        // not retry every simulation tick or silently select another target.
        t.cooldown=5;
      }
      var enemies=alive.filter(function(e){return e.side!==t.side&&line(game,t,e)&&(!isActionControl(game)||e.id===t.order.slice(5));});
      enemies.sort(function(a,b){var preferred=t.order==='attack'+a.id[1]?-1:t.order==='attack'+b.id[1]?1:0;return preferred||distance(t,a)-distance(t,b)||a.id.localeCompare(b.id);});
      if (isActionControl(game)&&!enemies.length) {
        game.stats[t.side].invalid_shots++;
        var intended=game.tanks.find(function(e){return e.id===t.order.slice(5);});
        var reason=!intended||intended.hp<=0?'target_gone':geometry.enabled(game)?geometry.sight(game,t,intended).reason:distance(t,intended)>6?'range':t.x!==intended.x&&t.y!==intended.y?'alignment':'wall';
        executed(game,t,reason);
        visualEvent(game,{kind:'dry_fire',tank:t.id,side:t.side,x:t.x,y:t.y,target_x:intended?intended.x:t.x,target_y:intended?intended.y:t.y,reason:reason});
      }
      if (enemies.length) {
        game.stats[t.side].shots++;if(!isActionControl(game))game.stats[t.side].fire_attempts++;
        var direction=line(game,t,enemies[0]);
        var bullet={id:++game.shot_seq,owner:t.id,fired_tick:game.tick,spawn_x:t.x,spawn_y:t.y,x:t.x,y:t.y,dx:direction.dx,dy:direction.dy,side:t.side,damage:t.power_until>game.tick?20:12,life:6};
        game.bullets.push(bullet);executed(game,t,'fired');
        visualEvent(game,{kind:'shot',shot_id:bullet.id,tank:t.id,side:t.side,x:t.x,y:t.y,dx:bullet.dx,dy:bullet.dy,powered:bullet.damage===20});
        t.cooldown=5;
      }
    });
    var hits = new Map(),friendlyHits = new Map();
    game.bullets=game.bullets.filter(function(b){
      if(geometry.enabled(game)){
        var collision=geometry.advance(game,b);
        if(collision?.kind==='wall'){visualEvent(game,{kind:'wall_hit',shot_id:b.id,side:b.side,x:b.x,y:b.y});return false;}
        if(collision?.kind==='tank'){var hitTank=collision.tank,friendly=hitTank.side===b.side;if(friendly){game.stats[b.side].friendly_hits=(game.stats[b.side].friendly_hits||0)+1;friendlyHits.set(hitTank.id,(friendlyHits.get(hitTank.id)||0)+b.damage);}else game.stats[b.side].hits++;hits.set(hitTank.id,(hits.get(hitTank.id)||0)+b.damage);visualEvent(game,{kind:'impact',shot_id:b.id,tank:hitTank.id,side:b.side,x:b.x,y:b.y,friendly_fire:friendly});return false;}
        if(b.life<=0)visualEvent(game,{kind:'expire',shot_id:b.id,side:b.side,x:b.x,y:b.y});return b.life>0;
      }
      b.x+=b.dx;b.y+=b.dy;b.life--;
      if (!walkable(game.map,b.x,b.y)) {visualEvent(game,{kind:'wall_hit',shot_id:b.id,side:b.side,x:b.x,y:b.y});return false;}
      var victim=alive.find(function(t){return t.side!==b.side&&t.x===b.x&&t.y===b.y;});
      if (victim) {game.stats[b.side].hits++;hits.set(victim.id,(hits.get(victim.id)||0)+b.damage);visualEvent(game,{kind:'impact',shot_id:b.id,tank:victim.id,side:b.side,x:b.x,y:b.y});return false;}
      if (b.life<=0) visualEvent(game,{kind:'expire',shot_id:b.id,side:b.side,x:b.x,y:b.y});
      return b.life>0;
    });
    alive.forEach(function(t){
      var damage=hits.get(t.id)||0,absorbed=Math.min(t.shield,damage);t.shield-=absorbed;damage-=absorbed;var actual=Math.min(t.hp,damage);t.hp-=actual;
      // Simultaneous mixed hits share capped HP/shield damage proportionally;
      // attribution cannot depend on projectile array order or credit friendly fire to enemies.
      var ratio=(friendlyHits.get(t.id)||0)/(hits.get(t.id)||1),friendlyHP=actual*ratio,friendlyShield=absorbed*ratio;
      if (actual||absorbed) visualEvent(game,{kind:'damage',tank:t.id,side:t.side,x:t.x,y:t.y,amount:actual,shield:absorbed,friendly_hp:friendlyHP,friendly_shield:friendlyShield});
      if(t.hp===0){t.movement='destroyed';visualEvent(game,{kind:'destroy',tank:t.id,side:t.side,x:t.x,y:t.y});}
      game.stats[1-t.side].damage+=actual-friendlyHP;
      if(ratio){game.stats[t.side].friendly_damage=(game.stats[t.side].friendly_damage||0)+friendlyHP;game.stats[t.side].friendly_shield_damage=(game.stats[t.side].friendly_shield_damage||0)+friendlyShield;}
    });
    if(game.real_progress)progress.observe(game);
    if(game.deadlock)deadlock.observe(game);
    return game;
  }
  function result(game, timeout) {
    var sides=[0,1].map(function(side){var tanks=game.tanks.filter(function(t){return t.side===side&&t.hp>0;});return {alive:tanks.length,hp:tanks.reduce(function(n,t){return n+t.hp;},0)};});
    if (!timeout && sides.every(function(s){return s.alive>0;})) return null;
    var delta=sides[0].alive-sides[1].alive || sides[0].hp-sides[1].hp;
    return {winner:delta===0?null:delta>0?0:1,reason:timeout?'time_limit':'elimination',teams:sides};
  }
  function percentile(values,p) { if (!values.length) return null;var sorted=values.slice().sort(function(a,b){return a-b;});return sorted[Math.max(0,Math.ceil(sorted.length*p)-1)]; }
  return {isActionControl:isActionControl,sideReady:sideReady,taskVersion:task.version,create:create,step:step,result:result,request:request,observation:observation,validatePlan:validatePlan,applyPlan:applyPlan,path:path,walkable:walkable,candidates:candidates,stationaryReason:stationaryReason,copy:copy,percentile:percentile,tickMs:TICK_MS};
}));

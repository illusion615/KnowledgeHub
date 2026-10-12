/* Disclosed input constraint: first approach, then expose legal firing targets.
   This filters the request BEFORE scoring; it never replaces a returned action.
   Geometry is frozen at capture. A moving target can invalidate a later attempt. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'));else root.JevArenaEngage=factory(root.JevArenaCombat);
}(typeof window!=='undefined'?window:this,function(combat){
  'use strict';
  function allowsFire(game,tank,target){return target.hp>0&&target.side!==tank.side&&combat.shot(game,tank,target,tank.side).clear;}
  function targets(game,tank){return game.tanks.filter(function(t){return allowsFire(game,tank,t);});}
  function observation(game,context){
    return combat.observation(game,context).split('\n').map(function(line){
      if(game.input_profile==='utility-tactics'&&line.startsWith('GOAL:'))return 'GOAL: preserve friendly tanks while eliminating enemies. Enter firing range first; use cover, resources and allied coordination. Native offense/survival utilities and forecast-based joint constraints are disclosed separately.';
      if(line.startsWith('BFS-ASSISTED ATTACK:')&&game.version==='tank-v7-friendly-fire')return 'GATED BFS INPUT: radius6 any angle; walls/corners block rays. Friendly tanks block and take damage. Do not shoot through allies or move into existing/planned friendly firing lanes. Frozen snapshot; no output repair.';
      if(line.startsWith('BFS-ASSISTED ATTACK:')&&game.version==='tank-v6-tactical')return 'GATED BFS INPUT: fire only within Euclidean radius6, walls/corners clear. Paths freeze other tanks; targets may move. No output repair.';
      if(line.startsWith('BFS-ASSISTED ATTACK:'))return 'FILTERED + BFS-ASSISTED INPUT: firing candidates exist ONLY for live enemies '+(game.version==='tank-v6-tactical'?'within Euclidean radius 6 at any angle, with walls/corners blocking rays':'aligned within 6 cells, without walls')+'. Otherwise move to a firing position. BFS distances freeze other tanks; targets can move before execution. No output repair.';
      return line;
    }).join('\n');
  }
  function question(game,tank){
    var available=targets(game,tank);
    if(game.input_profile==='utility-tactics'&&tank.cooldown>0)return tank.id+': reloading. Reposition, use cover/resources and maintain useful range; no wait action. Fire is withheld until ready, except when completely unable to move.';
    if(game.input_profile==='utility-tactics')return tank.id+': preserve the team while destroying enemies. Consider incoming fire, cover, useful resources and coordinated targets. '+(available.length?'Firing is possible, but shooting is not mandatory; evade or resupply when appropriate.':'No valid shot: approach a firing position, avoid needless exposure.');
    return tank.id+': destroy enemies. '+(available.length?'ENGAGE: valid fire targets '+available.map(function(t){return t.id;}).join(',')+'. Prefer lethal/effective shots over movement; re-check each attempt.':'APPROACH: no valid shot. Move toward a firing position using BFS distances, not exploration. '+(game.version==='tank-v7-friendly-fire'?'Distant, wall-blocked or friendly-blocked':game.version==='tank-v6-tactical'?'Distant and wall-blocked':'Distant, diagonal and wall-blocked')+' fire choices are withheld.');
  }
  return {version:'tank-engage-first-v1',allowsFire:allowsFire,observation:observation,question:question,describe:combat.describe};
}));

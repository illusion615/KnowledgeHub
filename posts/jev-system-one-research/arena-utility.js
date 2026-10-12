/* Experimental native Boolean utility readout. Transport IDs bind scores to
   actions but are never part of the model text. No scores are synthesized. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-combat'),require('./arena-tactics'));else root.JevArenaUtility=factory(root.JevArenaCombat,root.JevArenaTactics);
}(typeof window!=='undefined'?window:this,function(combat,tactics){
  'use strict';
  var directions={move_up:[0,-1],move_down:[0,1],move_left:[-1,0],move_right:[1,0]};
  function build(request,snapshot){
    var questions={},mapping={},destinations={},fallbacks=[],reloadFallbacks=[];
    Object.entries(request.states[0].questions).forEach(function(entry){
      var id=entry[0],allowed=Object.keys(entry[1].criteria),tank=snapshot.tanks.find(function(t){return t.id===id;}),info=combat.analyse(snapshot,tank),hasShot=allowed.some(function(k){return k.startsWith('fire_');});mapping[id]={};destinations[id]={};
      var legal=allowed.filter(function(action){var d=directions[action];return d?info.open(tank.x+d[0],tank.y+d[1]):combat.shot(snapshot,tank,snapshot.tanks.find(function(t){return t.id===action.slice(5);}),tank.side).clear;});
      if(snapshot.input_profile==='utility-tactics'&&tank.cooldown>0&&legal.some(function(a){return a.startsWith('fire_');}))reloadFallbacks.push(id);
      if(!legal.length){legal=allowed;fallbacks.push(id);} // No wait exists in this task: disclose trapped fallback, never invent movement.
      legal.forEach(function(action){
        var qid=id+'__'+action,d=directions[action],facts;
        if(d){
          var x=tank.x+d[0],y=tank.y+d[1],open=info.open(x,y),after=open?info.distances[y][x]:null;
          destinations[id][action]=open?x+','+y:null;
          facts=!open?'The move is blocked by a wall or living tank. It cannot move or deal damage.':hasShot?'A damaging shot is available, but this action moves instead and deals no damage.':after===null?'This action leads to a position with no reachable firing position.':info.current===null||after<info.current?'This action advances along the shortest route to a valid firing position.':after>info.current?'This action backtracks away from the shortest route to a valid firing position.':'This action changes position without making progress toward a valid firing position.';
        }else{
          var target=snapshot.tanks.find(function(t){return t.id===action.slice(5);}),shot=combat.shot(snapshot,tank,target,tank.side);
          if(!shot.clear)facts='The shot is invalid. It cannot damage any enemy.';
          else {var victim=shot.victim,damage=tank.power_until>snapshot.tick?20:12,shield=Math.min(victim.shield,damage),hp=Math.min(victim.hp,damage-shield);facts='A clear shot is available. This action fires at the enemy and deals '+hp+' HP damage and '+shield+' shield damage if the target stays still.'+(hp===victim.hp?' It destroys the enemy.':'');}
        }
        if(snapshot.input_profile==='utility-tactics'&&tank.cooldown>0)facts+=' Weapon reloads for '+tank.cooldown+' ticks; repositioning can use this interval. Any offered fire waits for reload because all moves are blocked.';
        questions[qid]={type:'boolean',instructions:'Facts: '+facts+'\nStatement: this action advances the goal of damaging or destroying an enemy.'};mapping[id][qid]=action;
      });
    });
    var plans=[{}];Object.entries(mapping).forEach(function(entry){var next=[];plans.forEach(function(plan){Object.values(entry[1]).forEach(function(action){var destination=destinations[entry[0]][action];if(destination&&Object.entries(plan).some(function(p){return destinations[p[0]][p[1]]===destination;}))return;next.push(Object.assign({},plan,{[entry[0]]:action}));});});plans=next;});
    // If every joint move contests the only exit, retain the forced-action task
    // and disclose the conflict rather than synthesizing a hidden wait.
    var jointFallback=!plans.length;
    if(jointFallback){plans=[{}];Object.entries(mapping).forEach(function(entry){plans=plans.flatMap(function(plan){return Object.values(entry[1]).map(function(action){return Object.assign({},plan,{[entry[0]]:action});});});});}
    var wire={version:'native-boolean-effect-v2',plans:plans,fallback_tanks:fallbacks,reload_hold_fallback:reloadFallbacks,joint_fallback:jointFallback,request:{states:[{id:'arena',state:'Tank combat. Goal: destroy enemies. Deal damage when a clear shot is available; otherwise approach a firing position. Evaluate each action independently using the supplied geometric and path facts. These facts freeze other tanks and do not predict future motion.',questions:questions}]},mapping:mapping};
    if(snapshot.version==='tank-v7-friendly-fire')wire.request.states[0].state+=' Friendly fire is enabled: allies intercept bullets and take damage. Avoid shooting through allies and crossing existing or planned friendly lanes.';
    return snapshot.input_profile==='utility-tactics'?tactics.decorate(wire,request,snapshot):wire;
  }
  function select(gates,mapping,plans){
    var expected=Object.values(mapping).flatMap(function(m){return Object.keys(m);}).sort();
    if(!gates||typeof gates!=='object'||Array.isArray(gates)||Object.keys(gates).sort().join()!==expected.join())throw new Error('invalid_utility_response');
    var decision={},scores={};
    Object.entries(mapping).forEach(function(entry){var id=entry[0],best=null,bestValue=-1;scores[id]={};Object.entries(entry[1]).forEach(function(pair){var score=gates[pair[0]]?.p_true;if(typeof score!=='number'||!isFinite(score)||score<0||score>1)throw new Error('invalid_utility_response');scores[id][pair[1]]=score;if(score>bestValue){bestValue=score;best=pair[1];}});if(best===null)throw new Error('invalid_utility_response');decision[id]=best;});
    var independent=decision;
    if(plans){if(!plans.length)throw new Error('invalid_utility_plans');var best=-Infinity;plans.forEach(function(plan){if(!plan||Object.keys(plan).sort().join()!==Object.keys(mapping).sort().join())throw new Error('invalid_utility_plans');var total=Object.entries(plan).reduce(function(sum,e){if(typeof scores[e[0]]?.[e[1]]!=='number')throw new Error('invalid_utility_plans');return sum+scores[e[0]][e[1]];},0);if(total>best){best=total;decision=Object.assign({},plan);}});}
    return {decision:decision,utility_scores:scores,independent_argmax:independent};
  }
  function read(gates,wire){return wire.tactical?tactics.select(gates,wire,select):select(gates,wire.mapping,wire.plans);}
  function validateSelfScores(scores,wire){
    var keys=wire.request.states.flatMap(function(s){return Object.keys(s.questions);}).sort();
    if(!scores||typeof scores!=='object'||Array.isArray(scores)||Object.keys(scores).sort().join()!==keys.join()||Object.values(scores).some(function(v){return typeof v!=='number'||!isFinite(v)||v<0||v>100;}))throw new Error('arena_invalid_plan');return scores;
  }
  function readSelfScores(scores,wire){
    validateSelfScores(scores,wire);
    function vector(mapping,scale){return Object.fromEntries(Object.entries(mapping).map(function(e){return [e[0],Object.fromEntries(Object.entries(e[1]).map(function(p){return [p[1],scores[p[0]]*scale];}))];}));}
    if(!wire.tactical){
      // Rank raw CLI preferences directly, without manufacturing Boolean outputs.
      var values=vector(wire.mapping,1),independent=Object.fromEntries(Object.entries(values).map(function(e){return [e[0],Object.keys(e[1]).reduce(function(best,a){return best===null||e[1][a]>e[1][best]?a:best;},null)];})),best=-Infinity,decision=null;
      wire.plans.forEach(function(plan){var total=Object.entries(plan).reduce(function(n,e){return n+values[e[0]][e[1]];},0);if(total>best){best=total;decision=Object.assign({},plan);}});
      if(!decision)throw new Error('arena_invalid_plan');return {decision:decision,self_scores:values,independent_argmax:independent};
    }
    var result=tactics.combine(vector(wire.mapping,.01),vector(wire.survival_mapping,.01),wire);
    return {decision:result.decision,combined_scores:result.combined_scores,independent_argmax:result.independent_argmax,self_offense_scores:vector(wire.mapping,1),self_survival_scores:vector(wire.survival_mapping,1)};
  }
  function copilotPrompt(wire){if(!wire.tactical&&wire.request.states.length===1)return 'Score every supplied attack-effect statement independently. Return numeric 0..100 self-reported preferences, NOT probabilities or calibrated confidence. The application selects a legal joint plan by maximum summed preferences. Do not return orders or Boolean values. Output JSON only: {"scores":{"<question-id>":0}} with exactly ALL question IDs. Zero is a format example, not a recommendation. No tools, files, Markdown or explanations.\n\nEFFECT SCORING CONTRACT:\n'+JSON.stringify(wire.request);return 'Score the supplied action-effect statements independently. Arena statements assess attack progress; survival statements assess protection of the friendly team. Return numeric 0..100 self-reported support/preferences, NOT probabilities or calibrated confidence. Do not return actions or Boolean values. The application uses disclosed survival/coordination constraints and weighted joint readout. Output JSON only: {"scores":{"<question-id>":0}} with exactly ALL question IDs from BOTH states. Zero is a format example, not a recommendation. No tools, files, Markdown or explanations.\n\nEFFECT SCORING CONTRACT:\n'+JSON.stringify(wire.request);}
  function versionFor(game){if(game.version==='tank-v7-friendly-fire')return game.input_profile==='utility-tactics'?'tank-tactical-friendly-fire-v1':'tank-utility-friendly-fire-v1';return game.input_profile==='utility-tactics'?tactics.version:game.version==='tank-v6-tactical'?'tank-utility-diagonal-v1':'tank-utility-joint-v1';}
  return {version:'tank-utility-joint-v1',versionFor:versionFor,build:build,select:select,read:read,validateSelfScores:validateSelfScores,readSelfScores:readSelfScores,copilotPrompt:copilotPrompt};
}));

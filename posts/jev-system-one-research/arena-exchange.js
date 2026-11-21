/* Side-relative health exchange payoff. Application utility, not win probability
   or a solved Nash equilibrium. Both sides use the same formula and risk rule. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaExchange=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var VERSION='exchange-aware-v5';
  function enabled(g){return [VERSION,'deadlock-recovery-v6'].includes(g.planner_revision);}
  function totals(g,side){var tanks=g.tanks.filter(function(t){return t.side===side&&t.hp>0;});return {alive:tanks.length,hp:tanks.reduce(function(n,t){return n+t.hp;},0),shield:tanks.reduce(function(n,t){return n+t.shield;},0)};}
  function effective(t){return Math.max(0,t.hp)+Math.max(0,t.shield);}
  function advantage(own,enemy){var a=effective(own),b=effective(enemy);return a+b?100*(a-b)/(a+b):0;}
  function utility(own,enemy){
    if(!own.alive||!enemy.alive)return !own.alive&&!enemy.alive?0:own.alive?1000+effective(own):-1000-effective(enemy);
    return 65*(own.alive-enemy.alive)+advantage(own,enemy)+.25*(effective(own)-effective(enemy));
  }
  function situation(g,side){var own=totals(g,side),enemy=totals(g,1-side);return {own:own,enemy:enemy,health_advantage:advantage(own,enemy)};}
  function evaluate(before,after){
    var ownLoss=effective(before.own)-effective(after.own),enemyLoss=effective(before.enemy)-effective(after.enemy),value=utility(after.own,after.enemy),delta=value-utility(before.own,before.enemy),terminal=!after.own.alive||!after.enemy.alive;
    var kind=terminal?(!after.own.alive&&!after.enemy.alive?'mutual_elimination':after.own.alive?'victory':'defeat'):delta>1e-9?(ownLoss>0&&enemyLoss>0?'favorable_trade':'advantage_gained'):delta< -1e-9?'unfavorable_trade':'neutral';
    return {own_effective_loss:ownLoss,enemy_effective_loss:enemyLoss,own_loss_fraction:effective(before.own)?ownLoss/effective(before.own):0,enemy_loss_fraction:effective(before.enemy)?enemyLoss/effective(before.enemy):0,health_advantage_before:advantage(before.own,before.enemy),health_advantage_after:advantage(after.own,after.enemy),health_utility:value,utility_change:delta,kind:kind};
  }
  function summary(before,outcomes){var values=outcomes.map(function(o){return evaluate(before,o);}),worst=Math.min(...values.map(function(v){return v.utility_change;})),mean=values.reduce(function(n,v){return n+v.utility_change;},0)/values.length;return {worst_change:worst,mean_change:mean,robust_change:.7*worst+.3*mean,stance:worst>1e-9?(values.every(function(v){return v.enemy_effective_loss>0;})?'press_advantage':'recover_advantage'):worst< -1e-9?'protect_or_reposition':'balanced',outcomes:values};}
  function neutralText(text,side){var own=side===0?'B':'R';return text.replace(/fire_([BR])([01])/g,function(_,team,n){return 'fire_'+(team===own?'ally':'enemy')+n;}).replace(/\b([BR])([01])\b/g,function(_,team,n){return (team===own?'ally':'enemy')+n;});}
  return {version:VERSION,enabled:enabled,totals:totals,effective:effective,advantage:advantage,utility:utility,situation:situation,evaluate:evaluate,summary:summary,neutralText:neutralText};
}));

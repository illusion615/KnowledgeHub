/* Read-only KPI contract. No model calls and no invented correctness labels. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaComparison=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  function count(x){return Number.isInteger(x)&&x>=0?x:null;}
  function ratio(n,d){n=count(n);d=count(d);return n!==null&&d!==null&&n<=d?{numerator:n,denominator:d,rate:d?n/d:null}:null;}
  function summarize(metrics){
    var c=metrics?.comparison,valid=c?.version==='arena-comparison-v1';
    return {mean_ms:valid&&typeof c.mean_decision_ms==='number'&&isFinite(c.mean_decision_ms)&&c.mean_decision_ms>=0?c.mean_decision_ms:null,
      attack:ratio(metrics?.hits,metrics?.shots),planning:valid?ratio(c.plans_executed,c.plans_total):null,
      // No independent correctness annotation exists in this arena. Do not
      // trust a scorer's self-confidence or convert execution into correctness.
      decision:{correct:null,total:valid?count(c.decisions_total):count(metrics?.finished),judged:0}};
  }
  return {summarize:summarize,ratio:ratio};
}));

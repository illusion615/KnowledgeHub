/* Versioned arbitrary-angle ballistics. Grid coordinates denote cell centres.
   Walls use closed unit-cell boxes (no corner clipping); tank hitboxes are 0.7
   cells wide. A projectile travels one Euclidean cell per tick, at most six. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaGeometry=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var EPS=1e-9,cache=new WeakMap();
  function friendlyFire(world){return world.version==='tank-v7-friendly-fire';}
  function enabled(world){return world.version==='tank-v6-tactical'||friendlyFire(world);}
  function intersect(a,b,x,y,half){
    var enter=0,exit=1;
    for(var axis of ['x','y']){var origin=a[axis],delta=b[axis]-origin,centre=axis==='x'?x:y,lo=centre-half,hi=centre+half;
      if(Math.abs(delta)<EPS){if(origin<lo-EPS||origin>hi+EPS)return null;}
      else {var near=(lo-origin)/delta,far=(hi-origin)/delta;if(near>far){var temp=near;near=far;far=temp;}enter=Math.max(enter,near);exit=Math.min(exit,far);if(enter>exit+EPS)return null;}
    }
    return exit<-EPS||enter>1+EPS?null:Math.max(0,Math.min(1,enter));
  }
  function walls(map){var signature=map.join('\n'),saved=cache.get(map);if(saved?.signature===signature)return saved.cells;var cells=[];map.forEach(function(row,y){for(var x=0;x<row.length;x++)if(row[x]==='#')cells.push({x:x,y:y});});cache.set(map,{signature:signature,cells:cells});return cells;}
  function wallHit(world,a,b){var first=null;walls(world.map).forEach(function(c){var t=intersect(a,b,c.x,c.y,.5);if(t!==null&&(!first||t<first.t-EPS))first={kind:'wall',t:t,cell:c,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};});return first;}
  function sight(world,from,to){
    if(!to)return {clear:false,reason:'target_gone'};var length=Math.hypot(to.x-from.x,to.y-from.y);
    if(length<EPS)return {clear:false,reason:'overlapping_tanks'};if(length>6+EPS)return {clear:false,reason:'range'};
    var hit=wallHit(world,from,to);if(hit)return {clear:false,reason:'wall',cell:hit.cell,point:{x:hit.x,y:hit.y}};
    return {clear:true,dx:(to.x-from.x)/length,dy:(to.y-from.y)/length,distance:length};
  }
  function sweep(world,a,b,side,ignoreId){
    var first=wallHit(world,a,b);
    world.tanks.filter(function(t){return t.hp>0&&(ignoreId==null||t.id!==ignoreId)&&(friendlyFire(world)||t.side!==side);}).forEach(function(tank){var t=intersect(a,b,tank.x,tank.y,.35);if(t!==null&&(!first||t<first.t-EPS))first={kind:'tank',tank:tank,t:t,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};});
    return first; // At a shared boundary a wall wins over a tank.
  }
  function advance(world,bullet){
    var end={x:bullet.x+bullet.dx,y:bullet.y+bullet.dy},hit=sweep(world,bullet,end,bullet.side,bullet.life===6?bullet.owner:null);
    bullet.x=hit?hit.x:end.x;bullet.y=hit?hit.y:end.y;bullet.life--;
    return hit;
  }
  return {enabled:enabled,friendlyFire:friendlyFire,intersect:intersect,wallHit:wallHit,sight:sight,sweep:sweep,advance:advance};
}));

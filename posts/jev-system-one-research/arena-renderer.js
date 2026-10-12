/* Presentation only: interpolate authoritative snapshots and replay real combat
   events. This module never steps the simulation, chooses actions or calls models. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.JevArenaRenderer=factory();
}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var TILE=80,WIDTH=1040,HEIGHT=720;
  var clamp=function(n,a,b){return Math.max(a,Math.min(b,n));};
  var mix=function(a,b,t){return a+(b-a)*t;};
  function angle(game,tank){
    var directions={move_up:-Math.PI/2,move_down:Math.PI/2,move_left:Math.PI,move_right:0};
    if(game.control==='primitive'||game.control==='step'){
      if(Object.prototype.hasOwnProperty.call(directions,tank.order))return directions[tank.order];
      var selected=game.tanks.find(function(t){return tank.order==='fire_'+t.id;});
      return selected?Math.atan2(selected.y-tank.y,selected.x-tank.x):tank.side===0?0:Math.PI;
    }
    var enemies=game.tanks.filter(function(t){return t.side!==tank.side&&t.hp>0;}).sort(function(a,b){return Math.abs(a.x-tank.x)+Math.abs(a.y-tank.y)-Math.abs(b.x-tank.x)-Math.abs(b.y-tank.y);});
    return enemies.length?Math.atan2(enemies[0].y-tank.y,enemies[0].x-tank.x):tank.side===0?0:Math.PI;
  }
  function hullAngle(tank){
    var positions=tank.recent_positions||[],last=positions[positions.length-1];
    if(last)for(var i=positions.length-2;i>=0;i--){var p=positions[i],dx=last.x-p.x,dy=last.y-p.y;if(dx||dy)return Math.abs(dx)+Math.abs(dy)===1?Math.atan2(dy,dx):(tank.side===0?0:Math.PI);}
    return tank.side===0?0:Math.PI;
  }
  function headingMix(a,b,alpha){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*alpha;}
  function headings(sample,tank){var before=sample.before.tanks.find(function(t){return t.id===tank.id;})||tank;return {hull:headingMix(hullAngle(before),hullAngle(tank),sample.alpha),turret:headingMix(angle(sample.before,before),angle(sample.game,tank),sample.alpha)};}
  function pose(before,after,alpha){
    var adjacent=Math.abs(before.x-after.x)+Math.abs(before.y-after.y)<=1;
    return {x:adjacent?mix(before.x,after.x,alpha):after.x,y:adjacent?mix(before.y,after.y,alpha):after.y};
  }
  function tankState(sample,tank){
    var before=sample.before.tanks.find(function(t){return t.id===tank.id;})||tank,p=pose(before,tank,sample.alpha);
    var hp=before.hp,shield=before.shield,power=before.power_until;
    if(sample.tick>=sample.game.tick){hp=tank.hp;shield=tank.shield;power=tank.power_until;}
    else sample.events.forEach(function(e){
      if(e.tank!==tank.id||e.tick<=sample.before.tick||e.tick>sample.tick)return;
      if(e.kind==='pickup'&&e.reward==='repair')hp=Math.min(100,hp+30);
      if(e.kind==='pickup'&&e.reward==='shield')shield=30;
      if(e.kind==='pickup'&&e.reward==='power')power=e.tick+30;
      if(e.kind==='damage'){hp=Math.max(0,hp-e.amount);shield=Math.max(0,shield-e.shield);}
      if(e.kind==='destroy')hp=0;
    });
    return {...p,hp:hp,shield:shield,power_until:power};
  }
  function createTimeline(delay){
    delay=delay==null?320:delay;
    var frames=[],events=new Map(),tracks=new Map(),key=null,live=false,highest=0;
    function reset(){frames=[];events.clear();tracks.clear();highest=0;}
    function push(game,at,options){
      options=options||{};
      game=JSON.parse(JSON.stringify(game)); // Own immutable authoritative snapshots.
      if(key!==options.key||live!==!!options.live){reset();key=options.key;live=!!options.live;}
      if(live&&frames.length&&game.tick<frames[frames.length-1].game.tick)return false;
      if(!live){reset();frames.push({game:game,at:at});}
      else {frames.push({game:game,at:at});if(frames.length>24)frames.shift();}
      (game.events||[]).forEach(function(e){
        if(!Number.isInteger(e.id)||e.id<=highest)return;
        highest=e.id;events.set(e.id,e);
        if(e.kind==='shot')tracks.set(e.shot_id,{id:e.shot_id,side:e.side,owner:e.tank,startTick:e.tick-1,x:e.x,y:e.y,dx:e.dx,dy:e.dy,knownTick:e.tick,powered:e.powered});
        else if(['impact','wall_hit','expire'].includes(e.kind)){
          var track=tracks.get(e.shot_id);if(track){track.endTick=e.tick;track.endProgress=Math.hypot(e.x-track.x,e.y-track.y);track.knownTick=e.tick;}
        }
      });
      (game.bullets||[]).forEach(function(b){
        if(b.id==null||b.fired_tick==null)return;
        if(!tracks.has(b.id))tracks.set(b.id,{id:b.id,side:b.side,owner:b.owner,startTick:b.fired_tick-1,x:b.spawn_x,y:b.spawn_y,dx:b.dx,dy:b.dy,powered:b.damage===20});
        tracks.get(b.id).knownTick=game.tick;
      });
      events.forEach(function(e,id){if(e.tick<game.tick-24)events.delete(id);});
      tracks.forEach(function(t,id){if((t.endTick??t.knownTick)<game.tick-24)tracks.delete(id);});
      return true;
    }
    function sample(at){
      if(!frames.length)return null;
      var a=frames[0],b=a,alpha=1,wall=at-delay;
      if(live){
        for(var i=1;i<frames.length;i++){
          b=frames[i];if(wall<=b.at){alpha=clamp((wall-a.at)/Math.max(1,b.at-a.at),0,1);break;}
          a=b;
        }
        if(a===b)alpha=1;
      }
      var tick=live?mix(a.game.tick,b.game.tick,alpha):b.game.tick;
      var projectiles=[];
      tracks.forEach(function(t){
        var end=t.endTick??t.knownTick;
        if(tick<t.startTick||tick>end||(live&&t.endTick!=null&&tick>=t.endTick))return;
        var progress=clamp(tick-t.startTick,0,Math.min(6,t.knownTick-t.startTick,t.endProgress??6));
        projectiles.push({...t,x:t.x+t.dx*progress,y:t.y+t.dy*progress,progress:progress});
      });
      // Legacy receipts have no event journal. Draw only bullets actually present;
      // never infer a shot from a fire order, damage counter or missing frame.
      (b.game.bullets||[]).forEach(function(bullet){if(bullet.id==null)projectiles.push({...bullet,progress:1,legacy:true});});
      var list=Array.from(events.values());
      if(!live)list=list.filter(function(e){return e.tick===b.game.tick;});
      return {before:a.game,game:b.game,alpha:alpha,tick:tick,projectiles:projectiles,events:list,live:live,catchingUp:live&&wall<frames[frames.length-1].at};
    }
    return {push:push,sample:sample,clear:function(){reset();key=null;},counts:function(){return {frames:frames.length,events:events.size,tracks:tracks.size};}};
  }
  // Render only recorded route references whose first action was actually chosen.
  // Never search during drawing, borrow future replay decisions, or join a stale
  // path to a tank that has left it.
  function routeOverlays(game,decisions){
    var result=[];
    [0,1].forEach(function(side){
      var row=(decisions||[]).filter(function(d){return d.side===side&&d.applied&&!d.error&&Number.isFinite(d.applied_tick??d.completed_tick)&&(d.applied_tick??d.completed_tick)<=game.tick;}).sort(function(a,b){return (b.applied_tick??b.completed_tick)-(a.applied_tick??a.completed_tick)||(b.round||0)-(a.round||0);})[0];
      if(!row)return;
      Object.entries(row.intent_trace?.references||row.planner_trace?.strategy_reference||{}).forEach(function(entry){
        var id=entry[0],r=entry[1],tank=game.tanks.find(function(t){return t.id===id&&t.side===side&&t.hp>0;}),origin=row.observation_snapshot?.tanks?.find(function(t){return t.id===id;});
        if(!tank||!origin||!r.action||row.decision?.[id]!==r.action||!Array.isArray(r.path)||!r.path.length||r.path.length>117)return;
        var points=[{x:origin.x,y:origin.y}].concat(r.path);
        if(points.some(function(p,i){return !Number.isInteger(p.x)||!Number.isInteger(p.y)||game.map[p.y]?.[p.x]!=='.'||i>0&&Math.abs(p.x-points[i-1].x)+Math.abs(p.y-points[i-1].y)!==1;}))return;
        var at=points.findIndex(function(p){return p.x===tank.x&&p.y===tank.y;});if(at<0||at===points.length-1)return;
        if(r.type&&!(game.rewards||[]).some(function(p){var end=points[points.length-1];return p.type===r.type&&p.x===end.x&&p.y===end.y;}))return;
        result.push({tank:id,side:side,type:r.type,mode:r.mode,state_tick:row.state_tick,points:points.slice(at)});
      });
    });return result;
  }
  function create(canvas,options){
    options=options||{};
    var now=options.now||function(){return performance.now();},request=options.raf||requestAnimationFrame,cancel=options.caf||cancelAnimationFrame;
    var timeline=createTimeline(options.delayMs),ctx=canvas.getContext('2d'),raf=0,visible=true,inView=true,disposed=false,currentKey=null,currentLive=false;
    var effects=new Map(),played=new Set(),terrain=null,terrainKey='',size=1,routeDecisions=[];
    var diagnostic={draws:0,shot_events:0,dry_fire_events:0,projectile_draws:0,impact_draws:0,short_flight_replays:0};
    var durations={shot:190,impact:450,wall_hit:400,expire:240,damage:720,destroy:950,pickup:650,dry_fire:750};
    var text=function(zh,en){return (options.language?options.language():document.documentElement.lang).startsWith('en')?en:zh;};
    function resize(){
      var width=Math.max(1,canvas.getBoundingClientRect().width),dpr=Math.min(2,window.devicePixelRatio||1);
      var w=Math.round(width*dpr),h=Math.round(w*HEIGHT/WIDTH);size=width/WIDTH;
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);
    }
    function base(game){
      var signature=game.map.join('');
      if(signature!==terrainKey){
        terrainKey=signature;terrain=document.createElement('canvas');terrain.width=WIDTH;terrain.height=HEIGHT;
        var bg=terrain.getContext('2d');bg.fillStyle='#0a1320';bg.fillRect(0,0,WIDTH,HEIGHT);
        for(var y=0;y<9;y++)for(var x=0;x<13;x++){
          var wall=game.map[y][x]==='#';bg.fillStyle=wall?'#293b50':x<3?'#102a42':x>9?'#35212d':(x+y)%2?'#101e2e':'#142434';bg.fillRect(x*TILE+1,y*TILE+1,TILE-2,TILE-2);
          if(wall){var gradient=bg.createLinearGradient(x*TILE,y*TILE,x*TILE+TILE,y*TILE+TILE);gradient.addColorStop(0,'#536980');gradient.addColorStop(1,'#233449');bg.fillStyle=gradient;bg.fillRect(x*TILE+7,y*TILE+7,66,66);bg.fillStyle='#31465d';bg.fillRect(x*TILE+13,y*TILE+13,54,54);bg.fillStyle='#6b8095';[[14,14],[64,14],[14,64],[64,64]].forEach(function(p){bg.fillRect(x*TILE+p[0],y*TILE+p[1],3,3);});}
          else {bg.strokeStyle='rgba(167,199,226,.035)';bg.strokeRect(x*TILE+8,y*TILE+8,64,64);}
        }
      }
      ctx.drawImage(terrain,0,0);
      game.rewards.forEach(function(r){var color={repair:'#65e7a4',shield:'#c49dff',power:'#ffd16c'}[r.type],x=(r.x+.5)*TILE,y=(r.y+.5)*TILE;ctx.save();ctx.shadowColor=color;ctx.shadowBlur=12;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#102034';ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({repair:'+',shield:'◇',power:'ϟ'}[r.type],x,y);});
    }
    function routes(game){
      var rows=routeOverlays(game,routeDecisions);canvas.dataset.predictedRoutes=String(rows.length);
      rows.forEach(function(r){var color=r.side===0?'#69c9ff':'#ff96aa',points=r.points,end=points[points.length-1];
        ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.85;ctx.lineWidth=Math.max(3,1.6/size);ctx.setLineDash(r.tank.endsWith('0')?[12,8]:[4,7]);ctx.lineJoin='round';ctx.beginPath();points.forEach(function(p,i){if(i)ctx.lineTo((p.x+.5)*TILE,(p.y+.5)*TILE);else ctx.moveTo((p.x+.5)*TILE,(p.y+.5)*TILE);});ctx.stroke();ctx.setLineDash([]);
        points.slice(1).forEach(function(p,i){var prev=points[i],x=(p.x+.5)*TILE,y=(p.y+.5)*TILE,a=Math.atan2(p.y-prev.y,p.x-prev.x);ctx.beginPath();ctx.moveTo(x-10*Math.cos(a-.5),y-10*Math.sin(a-.5));ctx.lineTo(x,y);ctx.lineTo(x-10*Math.cos(a+.5),y-10*Math.sin(a+.5));ctx.stroke();});
        ctx.beginPath();ctx.arc((end.x+.5)*TILE,(end.y+.5)*TILE,26,0,Math.PI*2);ctx.stroke();ctx.restore();
        var names={repair:text('维修','Repair'),shield:text('护盾','Shield'),power:text('火力','Power'),cover_counterattack:text('掩体','Cover'),approach:text('接敌','Approach')};label(r.tank+' · '+(names[r.type]||names[r.mode]||text('路线','Route')),(end.x+.5)*TILE,(end.y+.5)*TILE+36,color,.95);
      });
    }
    function label(value,x,y,color,alpha){
      ctx.save();ctx.globalAlpha=alpha;var fontSize=Math.max(16,10/size);ctx.font='bold '+fontSize+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      var width=ctx.measureText(value).width+14,height=fontSize+10;x=clamp(x,width/2+5,WIDTH-width/2-5);y=clamp(y,height/2+4,HEIGHT-height/2-4);
      ctx.fillStyle='rgba(5,12,22,.85)';ctx.fillRect(x-width/2,y-height/2,width,height);ctx.fillStyle=color;ctx.fillText(value,x,y);ctx.restore();
    }
    function effectAge(effect,at){return effect.fixed!==undefined?effect.fixed:(at-effect.began)/(durations[effect.event.kind]||400);}
    function tanks(sample,at){
      sample.game.tanks.forEach(function(t){
        var before=sample.before.tanks.find(function(p){return p.id===t.id;})||t,p=tankState(sample,t),x=(p.x+.5)*TILE,y=(p.y+.5)*TILE,color=t.side===0?'#50b7ff':'#ff818d';
        if(p.hp<=0){ctx.save();ctx.translate(x,y);ctx.rotate(.2);ctx.fillStyle='#292c31';ctx.fillRect(-23,-22,46,44);ctx.strokeStyle='#657383';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,-13);ctx.lineTo(16,13);ctx.moveTo(15,-13);ctx.lineTo(-14,14);ctx.stroke();ctx.restore();return;}
        var recoil=0,flash=0;
        effects.forEach(function(fx){var age=effectAge(fx,at);if(fx.event.tank===t.id&&age<1){if(fx.event.kind==='shot')recoil=Math.max(recoil,(1-age)*7);if(fx.event.kind==='damage')flash=Math.max(flash,(1-age)*.8);}});
        var heading=headings(sample,t);
        ctx.save();ctx.translate(x,y);ctx.save();ctx.rotate(heading.hull);
        // Local +X is the hull's forward axis. Tracks run parallel to it on
        // both sides, rotating WITH the chassis, independently of the turret.
        ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.fillStyle='#070e18';ctx.fillRect(-26,-27,52,12);ctx.fillRect(-26,15,52,12);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
        var tread=((Math.abs(p.x-before.x)+Math.abs(p.y-before.y))*18)%8;
        ctx.fillStyle='#657584';for(var sx=-23;sx<24;sx+=8){ctx.fillRect(sx+tread,-26,3,10);ctx.fillRect(sx+tread,16,3,10);}
        ctx.fillStyle=color;ctx.fillRect(-22,-20,44,40);ctx.fillStyle=t.side===0?'#2383be':'#b44758';ctx.fillRect(-17,-16,34,32);ctx.fillStyle='#b5d6e8';ctx.fillRect(17,-13,3,26);
        if(flash){ctx.globalAlpha=flash;ctx.fillStyle='#fff7df';ctx.fillRect(-22,-20,44,40);ctx.globalAlpha=1;}
        ctx.restore();ctx.save();ctx.rotate(heading.turret);ctx.fillStyle=color;ctx.fillRect(-2-recoil,-5,35,10);ctx.fillStyle='#e4f3fa';ctx.fillRect(28-recoil,-6,7,12);ctx.restore();
        ctx.fillStyle=p.power_until>sample.tick?'#ffd16c':'#83a9bf';ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#183043';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
        if(p.shield){ctx.strokeStyle='#bd9aff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.stroke();}
        ctx.fillStyle='#07101b';ctx.fillRect(-26,29,52,6);ctx.fillStyle=p.hp>35?'#68e6a5':'#ff7474';ctx.fillRect(-25,30,p.hp/2,4);ctx.restore();
        ctx.fillStyle='#f2f7ff';ctx.font='bold '+Math.max(14,10/size)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.id,x,y-36);
        if(['resource-tactics-v3','persistent-intent-v4','exchange-aware-v5'].includes(sample.game.planner_revision)&&t.order==='wait'&&t.pending_action)label(text('等待','Wait'),x,y+53,'#ffe0a0',.95);
      });
    }
    function projectile(b){
      var x=(b.x+.5)*TILE,y=(b.y+.5)*TILE,tail=Math.min(64,Math.max(0,b.progress*TILE-22)),color=b.side===0?'#68d5ff':'#ff9f76';
      ctx.save();ctx.lineCap='round';ctx.shadowColor=color;ctx.shadowBlur=20;
      var gradient=ctx.createLinearGradient(x-b.dx*Math.max(1,tail),y-b.dy*Math.max(1,tail),x,y);gradient.addColorStop(0,'rgba(255,235,173,0)');gradient.addColorStop(1,color);
      ctx.strokeStyle=gradient;ctx.lineWidth=Math.max(7,2.5/size);ctx.beginPath();ctx.moveTo(x-b.dx*tail,y-b.dy*tail);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(8,4/size),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fffce6';ctx.beginPath();ctx.arc(x,y,Math.max(4,2/size),0,Math.PI*2);ctx.fill();ctx.restore();diagnostic.projectile_draws++;
    }
    function sparks(e,age){
      var x=(e.x+.5)*TILE,y=(e.y+.5)*TILE,radius=(e.kind==='destroy'?80:34)*age,color=e.kind==='wall_hit'?'#ffbd78':'#ffe7a3';
      ctx.save();ctx.globalAlpha=1-age;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,5+radius,0,Math.PI*2);ctx.stroke();
      for(var i=0;i<10;i++){var a=(i/10)*Math.PI*2+e.id*.71,length=7+(i%3)*5,dx=Math.cos(a),dy=Math.sin(a);ctx.beginPath();ctx.moveTo(x+dx*radius,y+dy*radius);ctx.lineTo(x+dx*(radius+length),y+dy*(radius+length));ctx.stroke();}
      if(e.kind==='destroy'){ctx.fillStyle='rgba(245,128,61,.55)';ctx.beginPath();ctx.arc(x,y,10+radius*.55,0,Math.PI*2);ctx.fill();}ctx.restore();diagnostic.impact_draws++;
    }
    function drawEffect(effect,at,game){
      var e=effect.event,p=clamp(effectAge(effect,at),0,1),x=(e.x+.5)*TILE,y=(e.y+.5)*TILE;
      if(e.kind==='shot'){
        if(effect.completedFlight){var distance=Math.hypot(effect.completedFlight.x-e.x,effect.completedFlight.y-e.y);projectile({x:e.x+e.dx*distance*p,y:e.y+e.dy*distance*p,dx:e.dx,dy:e.dy,side:e.side,progress:distance*p});}
        var mx=x+e.dx*35,my=y+e.dy*35;ctx.save();ctx.globalAlpha=1-p;ctx.translate(mx,my);ctx.rotate(Math.atan2(e.dy,e.dx));ctx.fillStyle='#fff5bd';ctx.shadowColor='#ffd275';ctx.shadowBlur=25;ctx.beginPath();ctx.moveTo(-4,-9);ctx.lineTo(28*(1-p)+8,0);ctx.lineTo(-4,9);ctx.lineTo(4,0);ctx.closePath();ctx.fill();ctx.restore();
      }else if(['impact','wall_hit','destroy'].includes(e.kind))sparks(e,p);
      else if(e.kind==='damage'){
        if(e.shield){ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle='#cfafff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,28+p*20,0,Math.PI*2);ctx.stroke();ctx.restore();}
        var parts=[];if(e.amount)parts.push('−'+e.amount+' HP');if(e.shield)parts.push(text('盾 −','Shield −')+e.shield);if(e.friendly_hp>0||e.friendly_shield>0)parts.push(text('含友伤','Friendly Fire'));label(parts.join(' / '),x,y-76-p*28,e.amount?'#ffb7a3':'#d4baff',1-p);
      }else if(e.kind==='pickup'){
        ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle={repair:'#68e6a5',shield:'#bd9aff',power:'#ffd16c'}[e.reward];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,18+p*32,0,Math.PI*2);ctx.stroke();ctx.restore();
      }else if(e.kind==='dry_fire'){
        var dx=e.target_x-e.x,dy=e.target_y-e.y,length=Math.hypot(dx,dy),scale=length?Math.min(1,6/length):0,ex=x+dx*TILE*scale,ey=y+dy*TILE*scale;
        if(e.reason==='wall'&&(dx===0||dy===0))for(var step=1;step<=6;step++){var bx=e.x+Math.sign(dx)*step,by=e.y+Math.sign(dy)*step;if(!game.map[by]||game.map[by][bx]==='#'){ex=(bx+.5)*TILE;ey=(by+.5)*TILE;break;}}
        ctx.save();ctx.globalAlpha=(1-p)*.75;ctx.strokeStyle='#ff7979';ctx.lineWidth=Math.max(2,1/size);ctx.setLineDash([7,8]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(ex-8,ey-8);ctx.lineTo(ex+8,ey+8);ctx.moveTo(ex+8,ey-8);ctx.lineTo(ex-8,ey+8);ctx.stroke();ctx.restore();
        var reason={range:text('射程外','Out of Range'),alignment:text('射线未对齐','Not Aligned'),wall:text('墙体遮挡','Wall Blocked'),target_gone:text('目标已消失','Target Gone')}[e.reason]||text('开火无效','Ineffective');
        label(reason+text(' · 未发射',' · No Shot'),x,y+57+p*8,'#ffb1b1',1-p);
      }
    }
    function paint(at){
      raf=0;if(disposed||!visible)return;
      var sample=timeline.sample(at);if(!sample)return;resize();
      if(!sample.live){effects.clear();sample.events.forEach(function(e){effects.set(e.id,{event:e,fixed:.3});});}
      else sample.events.forEach(function(e){
        var onset=e.kind==='shot'?e.tick-1:e.tick;
        if(!played.has(e.id)&&sample.tick>=onset){
          played.add(e.id);
          if(sample.tick-e.tick<=4){
            var fx={event:e,began:at};
            if(e.kind==='shot'){
              diagnostic.shot_events++;
              // A short shot can start AND end between HTTP responses. Replay
              // its recorded segment briefly, never infer one from an order.
              fx.completedFlight=sample.events.find(function(end){return end.shot_id===e.shot_id&&['impact','wall_hit','expire'].includes(end.kind)&&end.tick<=sample.tick;});
              if(fx.completedFlight)diagnostic.short_flight_replays++;
            }
            effects.set(e.id,fx);if(e.kind==='dry_fire')diagnostic.dry_fire_events++;
          }
        }
      });
      if(played.size>512){var keep=new Set(sample.events.map(function(e){return e.id;}));played=new Set(Array.from(played).filter(function(id){return keep.has(id);}));}
      effects.forEach(function(fx,id){if(effectAge(fx,at)>=1)effects.delete(id);});
      var displayGame=sample.game;
      if(sample.tick<sample.game.tick)displayGame={...sample.game,rewards:sample.before.rewards.filter(function(r){return !sample.events.some(function(e){return e.kind==='pickup'&&e.tick>sample.before.tick&&e.tick<=sample.tick&&e.x===r.x&&e.y===r.y&&e.reward===r.type;});})};
      base(displayGame);routes({...displayGame,tick:Math.floor(sample.tick)});tanks(sample,at);sample.projectiles.forEach(projectile);effects.forEach(function(fx){drawEffect(fx,at,sample.game);});
      diagnostic.draws++;
      if(sample.live&&(sample.catchingUp||effects.size))raf=request(paint);
    }
    function schedule(){if(!raf&&visible&&!disposed)raf=request(paint);}
    function setFrame(game,state){
      state=state||{};routeDecisions=state.routeDecisions||[];
      if(currentKey!==state.key||currentLive!==!!state.live){effects.clear();played.clear();currentKey=state.key;currentLive=!!state.live;}
      timeline.push(game,now(),state);schedule();
    }
    var observer=typeof IntersectionObserver==='function'?new IntersectionObserver(function(entries){inView=entries[0].isIntersecting;visible=inView&&!document.hidden;if(visible)schedule();else if(raf){cancel(raf);raf=0;}}):null;
    if(observer)observer.observe(canvas);
    var resizer=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;if(resizer)resizer.observe(canvas);
    var visibility=function(){visible=inView&&!document.hidden;if(visible)schedule();else if(raf){cancel(raf);raf=0;}};document.addEventListener('visibilitychange',visibility);
    return {setFrame:setFrame,diagnostics:function(){return {...diagnostic,...timeline.counts()};},destroy:function(){disposed=true;if(raf)cancel(raf);observer?.disconnect();resizer?.disconnect();document.removeEventListener('visibilitychange',visibility);timeline.clear();effects.clear();played.clear();}};
  }
  return {create:create,createTimeline:createTimeline,pose:pose,tankState:tankState,routeOverlays:routeOverlays,hullAngle:hullAngle,headings:headings};
}));

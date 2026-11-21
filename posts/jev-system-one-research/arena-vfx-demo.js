/* Explicit, isolated visual self-check. No network, model or benchmark records. */
document.addEventListener('DOMContentLoaded',function(){
  'use strict';
  var core=window.JevArena,render=window.JevArenaRenderer,root=document.getElementById('jev-arena');
  var section=document.getElementById('jev-arena-vfx-demo'),button=document.getElementById('jev-arena-vfx-play'),canvas=document.getElementById('jev-arena-vfx-board'),status=document.getElementById('jev-arena-vfx-status');
  if(!core||!render||!section)return;
  var timer=null,visual=null,game=null,run=0;
  var pick=function(zh,en){return document.documentElement.lang.startsWith('en')?en:zh;};
  function stop(){
    if(timer)clearInterval(timer);timer=null;
    button.disabled=root.dataset.running==='true';
    if(game){visual.setFrame(game,{key:'visual-sample-'+run,live:false});status.textContent=pick('样例已停止 · 手写指令，非模型结果','Sample Stopped · Authored Orders, Not Model Results');}
  }
  button.addEventListener('click',function(){
    if(root.dataset.running==='true'||timer)return;
    run++;game=core.create('visual-self-check','primitive');
    game.map=Array.from({length:9},function(_,y){return Array.from({length:13},function(_,x){return x===0||x===12||y===0||y===8?'#':'.';}).join('');});
    game.rewards=[];
    Object.assign(game.tanks[0],{x:3,y:4});Object.assign(game.tanks[2],{x:7,y:4,hp:36,shield:12});
    Object.assign(game.tanks[1],{x:2,y:6});Object.assign(game.tanks[3],{x:10,y:2});
    core.applyPlan(game,0,{B0:'fire_R0',B1:'fire_R1'});core.applyPlan(game,1,{R1:'fire_B1'});
    canvas.hidden=false;canvas.dataset.sampleShots='0';if(!visual)visual=render.create(canvas);
    visual.setFrame(game,{key:'visual-sample-'+run,live:true});button.disabled=true;
    status.textContent=pick('播放中 · 手写指令，零模型调用，不计入 KPI','Playing · Authored Orders, Zero Model Calls, No KPI Credit');
    timer=setInterval(function(){
      if(document.hidden||!section.open||root.dataset.running==='true'){stop();return;}
      core.step(game);canvas.dataset.sampleShots=String(game.stats[0].shots);visual.setFrame(game,{key:'visual-sample-'+run,live:true});
      if(game.tick>=45){clearInterval(timer);timer=null;button.disabled=false;status.textContent=pick('样例结束 · 手写指令，非模型结果','Sample Complete · Authored Orders, Not Model Results');}
    },core.tickMs);
  });
  section.addEventListener('toggle',function(){if(!section.open)stop();});
  new MutationObserver(function(){button.disabled=!!timer||root.dataset.running==='true';if(root.dataset.running==='true'&&timer)stop();}).observe(root,{attributes:true,attributeFilter:['data-running']});
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();});window.addEventListener('pagehide',stop);
});

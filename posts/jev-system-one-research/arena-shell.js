/* Presentation only. Reparent the original controls (never clone their IDs),
   preserving model consent, listeners, disabled state and match scheduling. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaShell=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  function create(arena){
    var doc=arena.ownerDocument,win=doc.defaultView,$=function(id){return doc.getElementById('jev-arena-'+id);};
    var field=$('battlefield'),overlay=$('overlay'),dialog=$('dialog'),opened=false,previousFocus=null,savedInert=[],previousOverflow='',panel='settings';
    var tabs=['settings','diagnostics'];
    function move(element,destination){if(element)destination.appendChild(element);}
    // Progressive enhancement: HTML controls remain usable if this module cannot load.
    ['blue','red'].forEach(function(side){
      var label=$(side).closest('label'),caption=label.querySelector('span');
      caption.dataset.zh=side==='blue'?'蓝方模型':'红方模型';caption.dataset.en=side==='blue'?'Blue Model':'Red Model';caption.textContent=doc.documentElement.lang.startsWith('en')?caption.dataset.en:caption.dataset.zh;
      move(label,$('model-settings'));move($(side+'-state'),$(side+'-hud').querySelector('.arena-hud-heading'));
    });
    move($('swap'),$('settings-actions'));move($('refresh'),$('settings-actions'));
    move(arena.querySelector('.arena-controls'),$('match-settings'));
    move($('control-note'),$('settings-help'));
    Array.from(arena.children).filter(function(e){return e.classList.contains('arena-scope');}).forEach(function(e){move(e,$('settings-help'));});
    move($('rules-details'),$('settings-help'));$('settings-panel').insertBefore($('consent-field'),$('match-settings'));
    move($('start'),$('main-actions'));move($('stop'),$('main-actions'));
    move($('copy-report'),$('export-actions'));move($('download'),$('export-actions'));
    move(arena.querySelector('.arena-scoreboard'),$('game-status'));move($('connection'),$('game-status'));
    // Keep the main stage compact. Reparent canonical live nodes rather than
    // copying them: updates, replay, listeners and unique IDs stay intact.
    var overview=doc.createElement('div');overview.className='arena-diagnostic-overview';$('diagnostics-panel').prepend(overview);
    [ $('game-status'),arena.querySelector('.arena-hud'),$('hud-scope'),$('intent-status'),arena.querySelector('.arena-route-controls'),$('comparison-definitions') ].forEach(function(el){move(el,overview);});
    move(arena.querySelector('.arena-sides'),$('diagnostics-panel'));move($('task-details'),$('diagnostics-panel'));move($('report-details'),$('diagnostics-panel'));
    move($('replay').closest('label'),$('game-bottom'));
    // Keep rendering notes/legend as collapsed in-game help; logs/demo/history are diagnostics.
    var guide=doc.createElement('details'),summary=doc.createElement('summary');summary.dataset.zh='地图图例与画面说明';summary.dataset.en='Map Legend & Visual Notes';summary.textContent=doc.documentElement.lang.startsWith('en')?summary.dataset.en:summary.dataset.zh;guide.appendChild(summary);
    move(arena.querySelector('.arena-legend'),guide);move(arena.querySelector('.arena-visual-note'),guide);$('game-bottom').appendChild(guide);
    Array.from(arena.children).filter(function(e){return e.tagName==='DETAILS';}).forEach(function(e){move(e,$('diagnostics-panel'));});
    Array.from(arena.children).filter(function(e){return e.classList.contains('hero-actions')&&!e.children.length;}).forEach(function(e){e.remove();});
    arena.classList.add('arena-shell-ready');
    function selectPanel(name){
      panel=name;tabs.forEach(function(id){var selected=id===name;$(id+'-panel').hidden=!selected;$(id+'-tab').setAttribute('aria-selected',String(selected));$(id+'-tab').tabIndex=selected?0:-1;$(id+'-open').setAttribute('aria-expanded',String(opened&&selected));});
      dialog.querySelector('.arena-dialog-body').scrollTop=0;
    }
    function resize(){
      if(!opened)return;var bounds=field.getBoundingClientRect(),viewport=win.visualViewport,visibleTop=viewport?.offsetTop||0,visibleBottom=visibleTop+(viewport?.height||win.innerHeight),top=Math.max(12,visibleTop+12-bounds.top),height=Math.max(100,Math.min(bounds.height-top-12,visibleBottom-Math.max(visibleTop+12,bounds.top+top)-12));
      overlay.style.paddingTop=top+'px';dialog.style.maxHeight=height+'px';
    }
    function inertBackground(){
      savedInert=[];var branch=overlay;
      while(branch&&branch!==doc.body){
        var parent=branch.parentElement;if(!parent)break;
        Array.from(parent.children).forEach(function(sibling){if(sibling!==branch){savedInert.push([sibling,sibling.inert]);sibling.inert=true;}});branch=parent;
      }
    }
    function open(name,invoker){
      if(!opened){
        previousFocus=invoker||doc.activeElement;
        // Bring the in-game panel into view before locking background scrolling.
        field.scrollIntoView({block:'start',behavior:'instant'});
        move($('start'),$('dialog-actions'));move($('stop'),$('dialog-actions'));
        opened=true;overlay.hidden=false;previousOverflow=doc.body.style.overflow;doc.body.style.overflow='hidden';inertBackground();
      }
      selectPanel(name||'settings');resize();$('settings-close').focus({preventScroll:true});
    }
    function close(){
      if(!opened)return;opened=false;overlay.hidden=true;
      savedInert.forEach(function(entry){entry[0].inert=entry[1];});savedInert=[];doc.body.style.overflow=previousOverflow;
      move($('start'),$('main-actions'));move($('stop'),$('main-actions'));tabs.forEach(function(id){$(id+'-open').setAttribute('aria-expanded','false');});
      if(previousFocus?.isConnected&&!previousFocus.disabled)previousFocus.focus({preventScroll:true});
    }
    function focusable(){return Array.from(dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex]')).filter(function(e){return e.tabIndex>=0&&!e.hidden&&e.getClientRects().length;});}
    function keydown(event){
      if(!opened)return;
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
      if(event.target.getAttribute('role')==='tab'&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();var name=event.key==='Home'?'settings':event.key==='End'?'diagnostics':panel==='settings'?'diagnostics':'settings';selectPanel(name);$(name+'-tab').focus();return;
      }
      if(event.key==='Tab'){
        var list=focusable(),first=list[0],last=list[list.length-1];
        if(!list.length){event.preventDefault();dialog.focus();}
        else if(event.shiftKey&&(doc.activeElement===first||!list.includes(doc.activeElement))){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(doc.activeElement===last||!list.includes(doc.activeElement))){event.preventDefault();first.focus();}
      }
    }
    function focusin(event){if(opened&&!dialog.contains(event.target))$('settings-close').focus({preventScroll:true});}
    tabs.forEach(function(name){$(name+'-open').addEventListener('click',function(){open(name,this);});$(name+'-tab').addEventListener('click',function(){selectPanel(name);});});
    $('settings-close').addEventListener('click',close);overlay.addEventListener('click',function(event){if(event.target===overlay)close();});
    dialog.addEventListener('keydown',keydown);doc.addEventListener('focusin',focusin);win.addEventListener('resize',resize);win.addEventListener('scroll',resize,{passive:true});
    if(win.visualViewport){win.visualViewport.addEventListener('resize',resize);win.visualViewport.addEventListener('scroll',resize);}
    var observer=typeof win.ResizeObserver==='function'?new win.ResizeObserver(resize):null;if(observer)observer.observe(field);
    return {open:open,close:close,isOpen:function(){return opened;}};
  }
  return {create:create};
}));

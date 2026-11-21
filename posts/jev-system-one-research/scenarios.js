/* Shared read-only dialogs for scenario schemes and per-demo practice notes.
   Canonical sources live outside the reading/deck flow, not in duplicated prose.
   Without dialog support, hash links reveal their original source via CSS. */
(function(){
  'use strict';
  var dialog=document.getElementById('jev-scenario-dialog'),body=document.getElementById('jev-scenario-content'),title=document.getElementById('jev-scenario-title'),closeButton=document.getElementById('jev-scenario-close'),original=document.getElementById('jev-scenario-original');
  if(!dialog||typeof dialog.showModal!=='function')return;
  var cards=Array.from(document.querySelectorAll('[data-scenario]')),sources=new Map(Array.from(document.querySelectorAll('[data-popup-source]')).map(function(s){return [s.id,s];})),opener=null,savedOverflow='',source=null;
  document.documentElement.classList.add('scenario-enhanced');
  function findSource(id){var target=document.getElementById(id);return sources.get(id)||target?.closest('[data-popup-source]')||null;}
  function copyDetails(section){
    if(section.querySelector('input,select,textarea,canvas,iframe,form,button,script'))return null;
    var copy=section.cloneNode(true);copy.className='scenario-detail';
    [copy].concat(Array.from(copy.querySelectorAll('*'))).forEach(function(el){
      if(el.id)el.dataset.popupAnchor=el.id;
      Array.from(el.attributes).forEach(function(a){if(/^on/i.test(a.name)||a.name==='id'||a.name==='style'||a.name==='for'||a.name==='data-popup-source'||/^data-(present|step|reading|reveal|narrative)/.test(a.name)||['aria-labelledby','aria-describedby','aria-controls','aria-hidden'].includes(a.name))el.removeAttribute(a.name);});
      el.classList.remove('is-active','is-presentation-hidden','load-in','is-present-container-passthrough');
    });
    Array.from(copy.querySelectorAll('h2,h3,h4')).forEach(function(h){var replacement=document.createElement('h'+(Number(h.tagName[1])+1));Array.from(h.attributes).forEach(function(a){replacement.setAttribute(a.name,a.value);});while(h.firstChild)replacement.appendChild(h.firstChild);h.replaceWith(replacement);});return copy;
  }
  function refresh(){if(!source||!opener)return false;var details=copyDetails(source);if(!details)return false;title.textContent=opener.querySelector('h4').textContent;var scroll=body.scrollTop;body.replaceChildren(details);body.scrollTop=scroll;return true;}
  function cleanup(){if(!opener)return;document.body.style.overflow=savedOverflow;body.replaceChildren();source=null;var previous=opener;opener=null;if(previous.isConnected)previous.focus({preventScroll:true});}
  function close(){if(dialog.open){dialog.close();cleanup();}}
  function jump(id){var target=Array.from(body.querySelectorAll('[data-popup-anchor]')).find(function(e){return e.dataset.popupAnchor===id;});if(target&&target!==body.firstElementChild)target.scrollIntoView({block:'start',behavior:'instant'});}
  function open(target,card,anchor){
    if(!target||!card||target.querySelector('input,select,textarea,canvas,iframe,form,button,script'))return false;
    if(dialog.open){if(source===target){jump(anchor);return true;}close();}
    opener=card;source=target;if(!refresh()){opener=null;source=null;return false;}
    original.href='#'+card.querySelector('h4').id;body.scrollTop=0;savedOverflow=document.body.style.overflow;
    try{dialog.showModal();document.body.style.overflow='hidden';closeButton.focus();if(anchor)jump(anchor);return true;}catch(_){cleanup();return false;}
  }
  cards.forEach(function(card){card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-controls',dialog.id);card.addEventListener('click',function(event){if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(open(sources.get(card.dataset.scenario),card))event.preventDefault();});});
  closeButton.addEventListener('click',close);dialog.addEventListener('close',function(){if(!dialog.open)cleanup();});dialog.addEventListener('cancel',function(e){e.preventDefault();close();});dialog.addEventListener('keydown',function(e){e.stopPropagation();});
  dialog.addEventListener('click',function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}var link=e.target.closest('a[href^="#"]');if(link&&dialog.contains(link)){e.preventDefault();e.stopPropagation();var hash=link.getAttribute('href'),id;try{id=decodeURIComponent(hash.slice(1));}catch(_){return;}if(Array.from(body.querySelectorAll('[data-popup-anchor]')).some(function(n){return n.dataset.popupAnchor===id;})){jump(id);return;}close();location.hash=hash;}});
  function hash(){var id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}var target=findSource(id),card=target?cards.find(function(c){return c.dataset.scenario===target.id;}):null;if(target&&card){if(!dialog.open)card.scrollIntoView({block:'center',behavior:'instant'});open(target,card,id);}else close();}
  window.addEventListener('hashchange',hash);var observer=new MutationObserver(function(records){if(dialog.open&&records.some(function(r){return r.attributeName==='lang';}))refresh();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});hash();
}());

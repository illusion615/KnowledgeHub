/* Layout-only relocation. Canonical controls are moved, never cloned; no model
   calls, setting changes or experiment lifecycle actions occur here. */
(function(){
  'use strict';
  var library=document.getElementById('jev-popup-sources');
  if(library)document.querySelectorAll('[data-popup-source]').forEach(function(source){
    // On-demand material must not become hidden/blank deck steps or count as
    // default-visible narrative blocks. Its authored text and anchor IDs stay.
    [source].concat(Array.from(source.querySelectorAll('*'))).forEach(function(el){
      Array.from(el.attributes).forEach(function(a){if(/^data-(present|step|reading|reveal|narrative)/.test(a.name))el.removeAttribute(a.name);});
    });library.appendChild(source);
  });
  var lab=document.getElementById('jev-model-lab'),content=document.getElementById('jev-model-lab-content');
  if(content)for(var id of ['jev-lab-before','jev-lab-after']){var template=document.getElementById(id);if(template){content.appendChild(template.content);template.remove();}}
  var setup=document.getElementById('jev-shared-backend-content');if(setup)document.querySelectorAll('[data-config-move]').forEach(function(el){setup.appendChild(el);});
  function reveal(target){if(!target)return;var p=target;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}}
  function hash(){var id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}var target=document.getElementById(id);if(target&&(lab?.contains(target)||target.closest('[data-model-config]')))reveal(target);}
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(a){var target=document.getElementById(a.getAttribute('href').slice(1));if(target&&(lab?.contains(target)||target.closest('[data-model-config]')))reveal(target);}});
  // Keep already shared retired-section URLs useful without retaining the
  // obsolete comparison chapter or another navigation item.
  if(location.hash==='#alternatives'){history.replaceState(null,'',location.pathname+location.search+'#model-comparison');document.getElementById('model-comparison')?.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',hash);hash();
}());

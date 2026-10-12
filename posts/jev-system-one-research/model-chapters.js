/* Article-local navigation for long grouped chapters. Intersection ratios cannot
   reach 40% for a chapter many viewports tall. Use a reading position instead.
   No content generation, inference, or mutation of the shared presentation API. */
(function(){
  'use strict';
  var sections=Array.from(document.querySelectorAll('main > section.section[id]'));
  var nav=document.querySelector('.nav-links'),pending=false;
  if(!nav||!document.querySelector('[data-model-chapter]'))return;
  function update(){
    pending=false;
    if(document.documentElement.classList.contains('is-presentation-mode')||document.body.classList.contains('is-presentation-mode'))return;
    var line=Math.min(160,innerHeight*.25),current=sections.find(function(s){var r=s.getBoundingClientRect();return r.height>0&&r.top<=line&&r.bottom>line;});
    if(!current)return;
    var link=nav.querySelector('a[href="#'+current.id+'"]');if(link?.getAttribute('aria-current')==='true')return;
    // A paged-away link is not in the DOM: clear the old chapter highlight
    // instead of falsely marking the preceding demo as the current chapter.
    nav.querySelectorAll('[aria-current]').forEach(function(a){a.removeAttribute('aria-current');});if(link)link.setAttribute('aria-current','true');
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);
  var observer=new MutationObserver(schedule);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','lang']});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  var pagerObserver=new MutationObserver(schedule);pagerObserver.observe(nav,{childList:true});
  schedule();
}());

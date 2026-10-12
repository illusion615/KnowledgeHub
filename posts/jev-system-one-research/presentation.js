/* Article-local editorial deck. Original prose, forms and popup content stay
   untouched in reading mode. Run before the shared presentation collector. */
(function(){
  'use strict';
  var outline=window.JevPresentationOutline;if(!Array.isArray(outline)||!outline.length)return;
  var lang=document.documentElement.lang.startsWith('en')?1:0;
  function text(tag,value,cls){var el=document.createElement(tag);if(cls)el.className=cls;var pair=Array.isArray(value)?value:[String(value),String(value)];el.dataset.zh=pair[0];el.dataset.en=pair[1];el.textContent=pair[lang];return el;}
  // Validate all references before replacing the auto-pagination contract.
  if(outline.some(function(s){return !document.getElementById(s.chapter)||!document.getElementById(s.anchor);}))return;
  var sections=Array.from(document.querySelectorAll('main > .section'));
  sections.forEach(function(section){
    section.querySelectorAll('[data-present-step],[data-present-substep]').forEach(function(el){el.removeAttribute('data-present-step');el.removeAttribute('data-present-substep');});
    Array.from(section.children).forEach(function(el){el.classList.add('deck-reading-source');});
    if(!outline.some(function(s){return s.chapter===section.id;}))section.setAttribute('data-present-exclude','');
  });
  var demos=[];
  var groups={};outline.forEach(function(slide,index){
    var chapter=document.getElementById(slide.chapter),group=groups[slide.chapter];if(!group){group=document.createElement('div');group.className='curated-deck';group.dataset.presentSurface='unframed';chapter.appendChild(group);groups[slide.chapter]=group;}
    var page=document.createElement('article');page.id='deck-'+slide.id;page.className='curated-slide';page.dataset.presentStep='';page.dataset.curatedSlide='';page.dataset.sourceAnchor=slide.anchor;page.dataset.stepTitle=slide.title[0];page.dataset.stepTitleEn=slide.title[1];page.dataset.stepLabel='核心演示 · '+String(index+1).padStart(2,'0');page.dataset.stepLabelEn='Core Deck · '+String(index+1).padStart(2,'0');
    if(slide.liveDemo){
      page.classList.add('curated-live-slide');
      var host=document.createElement('div');host.className='deck-demo-host';page.appendChild(host);
      var node=document.getElementById(slide.anchor),marker=document.createComment('Reading location: '+slide.anchor);
      node.before(marker);
      var metrics=Array.from(node.querySelectorAll('.support-kpis')).map(function(kpi){
        var place=document.createComment('Reading metrics');kpi.before(place);
        var panel=document.createElement('details');panel.className='deck-demo-metrics';panel.appendChild(text('summary',['指标与用量','Metrics and Usage']));
        return {node:kpi,marker:place,panel:panel};
      });
      demos.push({node:node,marker:marker,host:host,metrics:metrics,readingClass:node.classList.contains('deck-reading-source')});
    }
    if(slide.lead)page.appendChild(text('p',slide.lead,'deck-lead'));
    if(slide.columns){var grid=document.createElement('div');grid.className='insight-grid deck-core-grid';slide.columns.forEach(function(c,i){var card=document.createElement('article');card.className='insight-card';card.appendChild(text('span',String(i+1).padStart(2,'0'),'card-index'));card.appendChild(text('h3',[c[0],c[1]]));card.appendChild(text('p',[c[2],c[3]]));grid.appendChild(card);});page.appendChild(grid);}
    if(slide.table){var table=document.createElement('table');table.className='simple-table deck-core-table';var head=document.createElement('thead'),tr=document.createElement('tr');slide.table.headers.forEach(function(h){tr.appendChild(text('th',h));});head.appendChild(tr);table.appendChild(head);var body=document.createElement('tbody');slide.table.rows.forEach(function(row){var r=document.createElement('tr');row.forEach(function(cell){r.appendChild(text('td',cell));});body.appendChild(r);});table.appendChild(body);page.appendChild(table);}
    page.appendChild(text('p',slide.note,'deck-evidence-limit'));
    if(slide.action){var a=text('a',slide.action,'button button-secondary deck-reading-link');a.href='#deck-'+(slide.anchor==='jev-arena'?'arena-live':'support-live');a.dataset.deckLiveTarget='';page.appendChild(a);}
    group.appendChild(page);
  });
  document.documentElement.dataset.curatedDeck='v1';
  // Reparent the existing instances, never clone forms, canvases or listeners.
  // Restore exact reading positions on every exit; presentation does not start
  // or stop a match and does not touch its consent, settings or runtime state.
  var mounted=false;
  new MutationObserver(function(){
    var enabled=document.documentElement.classList.contains('is-presentation-mode');if(enabled===mounted)return;mounted=enabled;
    demos.forEach(function(d){
      if(enabled){d.node.classList.remove('deck-reading-source');d.host.appendChild(d.node);}else{d.marker.after(d.node);if(d.readingClass)d.node.classList.add('deck-reading-source');}
      d.metrics.forEach(function(m){if(enabled){var summary=m.panel.querySelector('summary');summary.textContent=summary.dataset[document.documentElement.lang.startsWith('en')?'en':'zh'];m.marker.after(m.panel);m.panel.appendChild(m.node);}else{m.marker.after(m.node);m.panel.remove();}});
    });
    window.dispatchEvent(new Event('resize'));
  }).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('click',function(e){var a=e.target.closest('[data-deck-live-target]');if(!a)return;e.preventDefault();e.stopPropagation();
    // The actual interface is the next dedicated slide. Navigation is not Start.
    a.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  });
  // Let controls own their keyboard events (including Space on buttons). Escape
  // remains available to existing dialogs and the shared presentation exit.
  demos.forEach(function(d){d.node.addEventListener('keydown',function(e){if(mounted&&e.key!=='Escape')e.stopPropagation();});});
}());

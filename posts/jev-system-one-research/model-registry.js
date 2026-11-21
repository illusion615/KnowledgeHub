/* Shared local decision-model catalog. Selection is explicit; no model fallback. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevModelRegistry=factory();}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var models=[
    {id:'nanojev-fp32',label:'NanoJev FP32',family:'nanojev',model:'C-Tianyu/NanoJev',precision:'float32',scenarios:['playground','support','arena'],question_types:['choice','score','boolean'],arena_profiles:['raw','action-facts','engage-first','utility-attack','utility-tactics','utility-planner']},
    {id:'nanojev-4bit',label:'NanoJev 4-bit',family:'nanojev',model:'ZeroDegress/NanoJev-mlx-4bit',precision:'4bit',scenarios:['playground','support','arena'],question_types:['choice','score','boolean'],arena_profiles:['raw','action-facts','engage-first','utility-attack','utility-tactics','utility-planner']},
    {id:'laya-multilingual',label:'Laya Multilingual · MLX FP16',family:'laya',model:'aac6fef/laya-multilingual-mlx',precision:'float16',max_sequence_tokens:1024,scenarios:['playground','support','arena'],question_types:['choice','score','boolean'],arena_profiles:['raw','action-facts','engage-first','utility-planner']},
    {id:'laya-typed-decisions',label:'Laya Typed Decisions · MLX FP16',family:'laya',model:'aac6fef/laya-typed-decisions-mlx',precision:'float16',max_sequence_tokens:1024,scenarios:['playground','support','arena'],question_types:['choice','score','boolean'],arena_profiles:['raw','action-facts','engage-first','utility-planner']}
  ];
  models.forEach(function(m){Object.freeze(m.scenarios);Object.freeze(m.question_types);Object.freeze(m.arena_profiles);Object.freeze(m);});Object.freeze(models);
  function get(id){return models.find(function(m){return m.id===id;})||null;}
  function supports(id,scenario,profile){var m=get(id);return !!m&&m.scenarios.includes(scenario)&&(scenario!=='arena'||m.arena_profiles.includes(profile||'raw'));}
  function label(id){return get(id)?.label||id;}
  function fill(select,availability,scenario){var selected=select.value;models.filter(function(m){return supports(m.id,scenario);}).forEach(function(m){var o=Array.from(select.options).find(function(o){return o.value===m.id;});if(!o){o=new Option(m.label,m.id);select.appendChild(o);}o.textContent=m.label;o.disabled=!availability?.[m.id]?.ready;});if(Array.from(select.options).some(function(o){return o.value===selected;}))select.value=selected;}
  return {version:'local-decision-catalog-v1',models:models,get:get,isLocal:function(id){return !!get(id);},supports:supports,label:label,fill:fill};
}));

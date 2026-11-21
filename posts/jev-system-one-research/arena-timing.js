/* Allowlisted timing metadata, shared by the bridge and diagnostic exporter. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory();else root.JevArenaTiming=factory();
}(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var number=function(v){return typeof v==='number'&&isFinite(v)&&v>=0?v:null;};
  var nativeKeys=['idle_before_ms','prepare_ms','forward_ms','softmax_eval_ms','decode_ms','response_build_ms','response_validation_ms','evaluation_ms','min_path_tokens','max_path_tokens','candidate_paths','candidate_path_tokens','path_batch_size','forward_passes','inference_call_index','persistent_model_load_count','peak_memory_bytes','active_memory_bytes','cache_memory_bytes','cache_limit_bytes','cache_before_bytes','active_before_bytes'];
  function native(value){
    if(!value||typeof value!=='object')return null;
    var result={timing_protocol:value.timing_protocol==='nanojev-stages-v1'?value.timing_protocol:null,runtime_id:typeof value.runtime_id==='string'&&/^[a-f0-9]{32}$/.test(value.runtime_id)?value.runtime_id:null,first_inference:typeof value.first_inference==='boolean'?value.first_inference:null};
    nativeKeys.forEach(function(key){result[key]=number(value[key]);});
    result.batch_shapes=Array.isArray(value.batch_shapes)?value.batch_shapes.slice(0,128).filter(function(s){return Array.isArray(s)&&s.length===2&&s.every(function(n){return Number.isInteger(n)&&n>0&&n<=40960;});}).map(function(s){return s.slice();}):null;
    result.candidate_counts=Array.isArray(value.candidate_counts)?value.candidate_counts.slice(0,32).filter(function(n){return Number.isInteger(n)&&n>0&&n<=255;}):null;
    return result;
  }
  function normalize(value){
    if(!value||typeof value!=='object')return null;
    var result={};['node_connection_ms','node_health_ms','node_inference_http_ms','node_normalize_ms','cli_wall_ms','api_duration_ms'].forEach(function(key){result[key]=number(value[key]);});
    result.native=native(value.native);
    result.cli=null;
    if(value.cli&&typeof value.cli==='object'){
      result.cli={};['spawn_ms','first_stdout_ms','first_event_ms','assistant_turn_start_ms','assistant_message_ms','result_ms','stdout_bytes','stderr_bytes'].forEach(function(key){result.cli[key]=number(value.cli[key]);});
      result.cli.events={};['session.start','session.resume','session.idle','session.error','assistant.turn_start','assistant.message','assistant.usage','assistant.turn_end','result'].forEach(function(key){var count=value.cli.events?.[key];if(Number.isSafeInteger(count)&&count>=0)result.cli.events[key]=count;});
    }
    return result;
  }
  return {native:native,normalize:normalize};
}));

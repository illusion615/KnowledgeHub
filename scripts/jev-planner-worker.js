'use strict';
// One bounded worker per decision. Search must not freeze the live simulation.
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
if(!isMainThread){
  try{const wire=require('../posts/jev-system-one-research/arena-planner').build(workerData.request,workerData.snapshot,workerData.options);parentPort.postMessage({wire});}
  catch(_){parentPort.postMessage({error:'arena_planner_failed'});}
}else{
  module.exports=function buildAsync(request,snapshot,options,signal){
    return new Promise((resolve,reject)=>{
      if(signal.aborted){reject(new Error('cancelled'));return;}
      const worker=new Worker(__filename,{workerData:{request,snapshot,options}});let settled=false;
      function finish(error,wire){if(settled)return;settled=true;signal.removeEventListener('abort',abort);void worker.terminate();if(error)reject(new Error(error));else resolve(wire);}
      function abort(){finish('cancelled');}
      signal.addEventListener('abort',abort,{once:true});
      worker.once('message',message=>finish(message.error,message.wire));
      worker.once('error',()=>finish('arena_planner_failed'));
      worker.once('exit',()=>{if(!settled)finish('arena_planner_failed');});
    });
  };
}

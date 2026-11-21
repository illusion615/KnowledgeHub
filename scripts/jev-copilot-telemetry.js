'use strict';
// Observe fixed JSONL event kinds only. Never retain messages, arguments, stderr,
// account details, credentials, model reasoning, or arbitrary event names.
const {performance}=require('node:perf_hooks');
const TYPES=['session.start','session.resume','session.idle','session.error','assistant.turn_start','assistant.message','assistant.usage','assistant.turn_end','result'];
function createTelemetry(now=()=>performance.now()) {
  const began=now(),data={spawn_ms:null,first_stdout_ms:null,first_event_ms:null,assistant_turn_start_ms:null,assistant_message_ms:null,result_ms:null,stdout_bytes:0,stderr_bytes:0,events:{}},elapsed=()=>Math.max(0,now()-began);
  let buffer='';
  return {
    spawned(){data.spawn_ms=elapsed();},
    stdout(chunk){
      data.stdout_bytes+=Buffer.byteLength(chunk);if(data.first_stdout_ms===null)data.first_stdout_ms=elapsed();
      buffer+=chunk;
      let newline;while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(line.length>262144)continue;
        try {const e=JSON.parse(line);if(!TYPES.includes(e.type))continue;
          if(data.first_event_ms===null)data.first_event_ms=elapsed();data.events[e.type]=(data.events[e.type]||0)+1;
          const key={'assistant.turn_start':'assistant_turn_start_ms','assistant.message':'assistant_message_ms',result:'result_ms'}[e.type];if(key&&data[key]===null)data[key]=elapsed();
        }catch(_){}
      }
      if(buffer.length>262144)buffer='';
    },
    stderr(chunk){data.stderr_bytes+=chunk.length;},
    snapshot(){return {...data,events:{...data.events}};}
  };
}
module.exports={createTelemetry};

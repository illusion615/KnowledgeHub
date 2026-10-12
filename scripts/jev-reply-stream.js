'use strict';
// Incremental, bounded JSONL -> root JSON "reply" text. Never emit reasoning,
// tool/subagent output, raw JSON syntax or invented after-completion typing.
const bad=()=>{throw Object.assign(new Error('copilot_invalid_response'),{code:'copilot_invalid_response'});};
function replyPrefix(source){
  let i=0,reply=null;const seen=new Set();
  const ws=()=>{while(/\s/.test(source[i]||'')&&i<source.length)i++;};
  function string(){
    if(source[i]!=='"')bad();i++;let text='';
    while(i<source.length){let c=source[i++];if(c==='"')return {text,complete:true};
      if(c==='\\'){
        if(i===source.length)break;c=source[i++];
        const escapes={'"':'"','\\':'\\','/':'/','b':'\b','f':'\f','n':'\n','r':'\r','t':'\t'};
        if(c==='u'){const hex=source.slice(i,i+4);if(!/^[0-9a-f]*$/i.test(hex))bad();if(hex.length<4)break;text+=String.fromCharCode(parseInt(hex,16));i+=4;}
        else if(Object.hasOwn(escapes,c))text+=escapes[c];else bad();
      }else{if(c.charCodeAt(0)<32)bad();text+=c;}
    }
    // Hold an unfinished UTF-16 pair until its remaining code unit arrives.
    if(/[\uD800-\uDBFF]$/.test(text))text=text.slice(0,-1);
    return {text,complete:false};
  }
  function branches(){
    if(source[i++]!=='[')bad();let count=0;
    while(true){
      ws();if(i===source.length)return false;if(source[i]===']'){if(!count)bad();i++;return true;}if(source[i++]!=='{')bad();
      const keys=new Set();
      while(true){
        ws();if(i===source.length)return false;
        const key=string();if(!key.complete)return false;if(!['intent','order_id','action'].includes(key.text)||keys.has(key.text))bad();keys.add(key.text);
        ws();if(i===source.length)return false;if(source[i++]!==':')bad();ws();if(i===source.length)return false;
        if(key.text==='order_id'&&source[i]==='n'){const part=source.slice(i,i+4);if(!'null'.startsWith(part))bad();if(part.length<4)return false;i+=4;}
        else {const value=string();if(!value.complete)return false;if(value.text.length>96)bad();}
        ws();if(i===source.length)return false;if(source[i]===','){i++;continue;}if(source[i++]!=='}'||keys.size!==3)bad();break;
      }
      if(++count>13)bad();ws();if(i===source.length)return false;if(source[i]===','){i++;ws();if(source[i]===']')bad();continue;}if(source[i]!==']')bad();
    }
  }
  ws();if(i===source.length)return null;if(source[i++]!=='{')bad();
  while(true){
    ws();if(i===source.length)return reply;if(source[i]==='}'){i++;ws();if(i!==source.length)bad();return reply;}
    const key=string();if(!key.complete)return reply;if(!['reply','intent','action','branches'].includes(key.text)||seen.has(key.text))bad();seen.add(key.text);
    ws();if(i===source.length)return reply;if(source[i++]!==':')bad();ws();if(i===source.length)return reply;
    if(key.text==='branches'){if(!branches())return reply;}
    else {const value=string();if(key.text==='reply'){reply=value.text;if(reply.length>600)bad();}if(!value.complete)return reply;}
    ws();if(i===source.length)return reply;
    if(source[i]===','){i++;ws();if(source[i]==='}')bad();continue;}
    if(source[i]!=='}')bad();
  }
}
function createReplyStream(onText,now=()=>performance.now()){
  const began=now();let buffer='',content='',messageId=null,text='',deltas=0,first=null,invalid=false;
  function event(line){
    if(!line.trim())return;let e;try{e=JSON.parse(line);}catch(_){bad();}
    if(e.type==='tool.execution_start'||e.type==='assistant.message'&&e.data?.toolRequests?.length)bad();
    if(e.agentId||e.data?.parentToolCallId)return;
    if(e.type==='assistant.message_delta'){
      if(typeof e.data?.deltaContent!=='string'||typeof e.data.messageId!=='string')bad();
      if(messageId!==null&&messageId!==e.data.messageId)bad();messageId=e.data.messageId;content+=e.data.deltaContent;deltas++;
      if(content.length>4096)bad();const next=replyPrefix(content);
      if(next!==null&&next!==text){if(!next.startsWith(text))bad();text=next;if(text){if(first===null)first=now()-began;onText(text);}}
    }
    if(e.type==='assistant.message'&&typeof e.data?.content==='string'){
      if(messageId!==null&&e.data.messageId!==undefined&&e.data.messageId!==messageId)bad();
      const final=replyPrefix(e.data.content);if(text&&(!final||!final.startsWith(text)))bad();
    }
  }
  return {
    push(chunk){if(invalid)bad();try{buffer+=chunk;if(buffer.length>262144)bad();let n;while((n=buffer.indexOf('\n'))>=0){event(buffer.slice(0,n));buffer=buffer.slice(n+1);}}catch(e){invalid=true;throw e;}},
    finish(reply){if(invalid)bad();if(buffer.trim())event(buffer);buffer='';if(typeof reply!=='string'||text&&!reply.startsWith(text))bad();return this.stats();},
    stats(){return {requested:true,source:'cli_assistant_message_delta',received_delta_events:deltas,emitted_reply_characters:text.length,first_reply_delta_ms:first===null?null:Math.round(first),delivery:text?'incremental_draft':'completion_only_no_reply_delta',draft_requires_final_validation:true};}
  };
}
module.exports={replyPrefix,createReplyStream};

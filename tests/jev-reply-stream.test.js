'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {replyPrefix,createReplyStream}=require('../scripts/jev-reply-stream');
const {runProcess,createCopilotProvider}=require('../scripts/jev-copilot-provider');
const line=e=>JSON.stringify(e)+'\n';
const delta=text=>({type:'assistant.message_delta',data:{messageId:'m1',deltaContent:text}});
test('only root reply text streams; JSON/escapes/Unicode may split at every character',()=>{
  const full=JSON.stringify({reply:'你好 "客户"\n订单😀',intent:'billing',action:'human_review'}),updates=[],s=createReplyStream(t=>updates.push(t));
  for(const c of full){const event=line(delta(c));for(const byte of event)s.push(byte);}
  s.push(line({type:'assistant.message',data:{messageId:'m1',content:full}}));s.finish(JSON.parse(full).reply);
  assert.equal(updates.at(-1),JSON.parse(full).reply);assert.ok(updates.length>2);assert.ok(updates.every(x=>!x.startsWith('{')));assert.ok(updates.every(x=>!/[\uD800-\uDBFF]$/.test(x)));
  assert.equal(replyPrefix('{"reply":"\\u4f'),'');assert.equal(replyPrefix('{"reply":"\\u4f60'),'你');
});
test('multi-branch arrays are structurally checked but never rendered as reply text',()=>{
  const value={reply:'两个问题分别处理 😀',branches:[{intent:'delivery',order_id:'SR-123456',action:'track_delivery'},{intent:'billing',order_id:null,action:'clarify_order'}]},text=JSON.stringify(value),updates=[],s=createReplyStream(t=>updates.push(t));
  for(const ch of text)s.push(line(delta(ch)));s.push(line({type:'assistant.message',data:{messageId:'m1',content:text}}));s.finish(value.reply);assert.equal(updates.at(-1),value.reply);assert.ok(!updates.some(t=>t.includes('SR-123456')));
  for(const bad of ['{"reply":"x","branches":[{"intent":"billing","intent":"returns","order_id":null,"action":"ask_order"}]}','{"reply":"x","branches":[{"reply":"PRIVATE","intent":"billing","order_id":null,"action":"ask_order"}]}','{"reply":"x","branches":[]}','{"reply":"x","branches":[{"intent":"billing","order_id":null,"action":"ask_order"},]}'])assert.throws(()=>replyPrefix(bad),/copilot_invalid_response/);
});
test('ignores reasoning/subagents and never simulates streaming from a final message',()=>{
  const updates=[],s=createReplyStream(t=>updates.push(t));s.push(line({type:'assistant.reasoning_delta',data:{deltaContent:'PRIVATE'}}));s.push(line({...delta('PRIVATE'),agentId:'sub'}));
  s.push(line({type:'assistant.message',data:{content:'{"reply":"final only"}'}}));assert.deepEqual(updates,[]);assert.equal(s.finish('final only').delivery,'completion_only_no_reply_delta');
});
test('malformed/duplicate/unknown keys, tool requests, changed messages and mismatched finals are rejected',()=>{
  for(const content of ['{"secret":"PRIVATE"}','{"nested":{"reply":"bad"}}','{"reply":"one","reply":"two"}','{"reply":2}','{"reply":"bad\\q"}','{"reply":"x",}','{"reply":"'+('x'.repeat(601))+'"}'])assert.throws(()=>replyPrefix(content),/copilot_invalid_response/);
  const s=createReplyStream(()=>{});s.push(line(delta('{"reply":"hello')));assert.throws(()=>s.finish('other'),/copilot_invalid_response/);
  const t=createReplyStream(()=>{});assert.throws(()=>t.push(line({type:'tool.execution_start'})),/copilot_invalid_response/);
  const m=createReplyStream(()=>{});m.push(line(delta('{"reply":"hello')));assert.throws(()=>m.push(line({type:'assistant.message_delta',data:{messageId:'m2',deltaContent:'x'}})),/copilot_invalid_response/);
});
test('process wrapper delivers actual stdout while process is still alive, not after close',async()=>{
  let seen=false,finished=false;const r=runProcess(process.execPath,['-e','console.log("first");setTimeout(()=>console.log("last"),100)'],{onStdoutChunk:chunk=>{if(chunk.includes('first')){seen=true;assert.equal(finished,false);}}});await r;finished=true;assert.ok(seen);
});
test('streaming adapter uses the same safe argv, preserves usage, and rejects invalid partial output without retries',async()=>{
  const fs=require('node:fs/promises');let calls=0;const updates=[];
  const provider=createCopilotProvider({enabled:true,runProcess:async(binary,args,opts)=>{
    if(args.includes('--help'))return {code:0,stdout:'--stream --available-tools --no-custom-instructions --disable-builtin-mcps --usage-output-file --no-remote-export --max-ai-credits'};
    calls++;assert.equal(args[args.indexOf('--stream')+1],'on');assert.ok(args.includes('--available-tools=__jev_no_tools__'));assert.ok(!args.includes('--effort'));assert.equal(typeof opts.onStdoutChunk,'function');
    const a=line(delta('{"reply":"hel')),b=line(delta('lo"}')),c=line({type:'assistant.message',data:{messageId:'m1',content:'{"reply":"hello"}'}}),d=line({type:'result',exitCode:0});opts.onStdoutChunk(a);assert.deepEqual(updates,['hel']);opts.onStdoutChunk(b+c+d);
    await fs.writeFile(args[args.indexOf('--usage-output-file')+1],JSON.stringify({modelMetrics:{'test-model':{requests:{count:1},usage:{inputTokens:50,outputTokens:10}}}}));return {code:0,stdout:a+b+c+d};
  }});
  const parse=stdout=>require('../posts/jev-system-one-research/support-core').validateVerbalization(require('../scripts/jev-copilot-provider').jsonFromOutput(stdout));
  const r=await provider.evaluateStreamTask('test-model','fixture',parse,new AbortController().signal,text=>updates.push(text));assert.equal(calls,1);assert.equal(r.ok,true);assert.deepEqual(updates,['hel','hello']);assert.equal(r.streaming.delivery,'incremental_draft');assert.equal(r.usage.input_tokens,50);
});

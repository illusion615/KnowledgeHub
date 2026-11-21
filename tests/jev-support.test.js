'use strict';
// Injected model values only; no claim of learned multi-intent accuracy.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/support-core');
const {createSupportManager,validateConfig}=require('../scripts/jev-support');
const {createServer}=require('../scripts/jev-playground-server');
const config={seed:'flow',cases:1,language:'zh',local_provider:'nanojev-fp32',model:'fixture-model',deadline_s:30,routing_mode:'native',consent:true};
const envelope=v=>JSON.stringify({type:'assistant.message',data:{content:JSON.stringify(v)}})+'\n'+JSON.stringify({type:'result',exitCode:0});
const A='SR-123456',B='SR-654321';
function context(text='订单 '+A+' 没收到；订单 '+B+' 重复扣费。'){return {customer_messages:[text],order_ids:[A,B],orders:[{id:A,delivery_state:'delayed',days_since_delivery:null,payment_count:1,warranty_remaining_days:200},{id:B,delivery_state:'delivered',days_since_delivery:3,payment_count:2,warranty_remaining_days:200}],human_requested:false,needs_explanation:false};}
function native(c,positives=[],uncertain={}){const keys=new Set(positives.map(core.branchKey));return {ok:true,binary_gates:Object.fromEntries(Object.entries(core.questionMap(c)).map(([id,m])=>{const p=uncertain[id]??(keys.has(core.branchKey(m))?.95:.05);return [id,{p_true:p,value:p>.5,probabilities:{true:p,false:1-p}}];})),usage:{input_tokens:200,output_tokens:0}};}
function scenarioResult(request,story){for(let turn=0;turn<3;turn++){const c=core.context(story,turn);if(core.nativeRequest(c).states[0].state===request.states[0].state)return native(c,story.expected_branches[turn]);}throw Error('fixture mismatch');}
function reply(prompt,parse){if(prompt.includes('RESOLVED REPLY BRIEF:'))return {ok:true,decision:parse(envelope({reply:'The resolved branches are explained without changing them.'})),usage:{input_tokens:100,output_tokens:30}};
  const c=JSON.parse(prompt.split('SHARED OBSERVABLE FACTS:\n')[1].split('\nTHIS BOT')[0]),history=JSON.parse(prompt.split("THIS BOT'S CONVERSATION (including latest customer message):\n")[1]),first=history.find(m=>m.role==='customer').text,intent=/扣|charged/.test(first)?'billing':/破损|damaged/.test(first)?'returns':/开机|turn on/.test(first)?'technical':'delivery',id=c.order_ids[0]||null,b=core.branch(intent,id,c);
  return {ok:true,decision:parse(envelope({reply:'A proposed next step, not a transaction.',branches:[{intent,order_id:id,action:b.action}]})),usage:{input_tokens:100,output_tokens:30,cache_read_tokens:80,reasoning_tokens:20}};
}
async function settled(m,id){const end=Date.now()+6000;while(Date.now()<end){const r=m.view(id);if(r.status!=='running'&&!r.pending)return r;await new Promise(r=>setTimeout(r,5));}assert.fail('did not settle');}
function seedFor(ending){for(let i=0;i<200;i++){const seed='multi-'+i;if(core.generate(seed,1,'zh').cases[0].ending===ending)return seed;}throw Error('missing fixture');}
test('v5 generators cover same-order, different-order, ambiguous binding and negation without model-input gold/future leakage',()=>{
  assert.equal(core.version,'after-sales-v5-quality-review');assert.deepEqual(core.generate('same',3,'zh'),core.generate('same',3,'zh'));const seen=new Set();
  for(let i=0;i<40;i++)for(const story of core.generate('set-'+i,3,'en').cases){seen.add(story.ending);for(let turn=0;turn<2;turn++){const c=core.context(story,turn),r=core.nativeRequest(c);assert.ok(!JSON.stringify(r).includes(story.messages[2]));assert.ok(!JSON.stringify(r).includes('expected_branches'));if(story.orders.length===2)assert.ok(!JSON.stringify(r).includes(story.orders[1].id));}}
  assert.deepEqual([...seen].sort(),['ambiguous','explain','handoff','negation','same_order','two_orders']);
});
test('one native request contains independent Boolean intent/order questions, not one Choice or a forced multi-issue bypass',()=>{
  const c=context(),req=core.nativeRequest(c);assert.equal(req.states.length,1);assert.equal(Object.keys(req.states[0].questions).length,13);assert.ok(Object.values(req.states[0].questions).every(q=>q.type==='boolean'));assert.equal(core.rules(c,{}),null);assert.equal(core.rules({...c,needs_explanation:true},{}),null);assert.equal(core.action('delivery',{...c,order:c.orders[0],multiple_issues:true}),'track_delivery');
  assert.match(req.states[0].state,/negated\/replaced/);assert.match(req.states[0].questions.need_delivery_o0.instructions,/SR-123456/);assert.match(req.states[0].questions.need_delivery_unbound.instructions,/Do not guess/);
});
test('two intents can both be strongly supported and route to the correct separate orders',()=>{
  const c=context(),raw=native(c,[{intent:'delivery',order_id:A},{intent:'billing',order_id:B}]),gate=core.routeGate(raw,c),plan=core.planFromGate(gate,c);
  assert.equal(gate.independent_heads,true);assert.equal(gate.calibrated,false);assert.equal(gate.assessments.filter(a=>a.result==='present').reduce((n,a)=>n+a.support,0),1.9);
  assert.deepEqual(plan.branches.map(b=>[b.intent,b.order_id,b.action]),[['delivery',A,'track_delivery'],['billing',B,'billing_review']]);assert.match(core.approvedReply(plan,c,'zh'),/物流/);assert.match(core.approvedReply(plan,c,'zh'),/账务/);assert.ok(!plan.branches.some(b=>b.action==='human_review'));
});
test('same-order coexistence does not compete; negative labels do not persist from history',()=>{
  const c=context();const p=core.planFromGate(core.routeGate(native(c,[{intent:'delivery',order_id:A},{intent:'billing',order_id:A}]),c),c);assert.equal(p.branches.length,2);
  const neg=core.planFromGate(core.routeGate(native(c,[{intent:'delivery',order_id:A}]),c),c);assert.deepEqual(neg.branches.map(b=>b.intent),['delivery']);
});
test('unknown or ambiguous order association asks clarification without guessing or dropping confirmed branches',()=>{
  const c=context(),raw=native(c,[{intent:'delivery',order_id:A},{intent:'billing',order_id:null}],{need_returns_o1:.5}),p=core.planFromGate(core.routeGate(raw,c),c);
  assert.equal(p.branches.find(b=>b.intent==='delivery').action,'track_delivery');assert.equal(p.branches.find(b=>b.intent==='billing').order_id,null);assert.equal(p.branches.find(b=>b.intent==='billing').action,'clarify_order');assert.equal(p.branches.find(b=>b.intent==='returns'),undefined);assert.equal(p.branches.find(b=>b.intent==='other').status,'uncertain_intent');assert.ok(p.branches.find(b=>b.intent==='other').uncertain_candidates.some(q=>q.intent==='returns'));assert.ok(!p.branches.some(b=>b.action==='human_review'));
  const no={...c,order_ids:[],orders:[]},u=core.planFromGate(core.routeGate(native(no,[{intent:'delivery',order_id:null},{intent:'billing',order_id:null}]),no),no);assert.ok(u.branches.every(b=>b.action==='ask_order'));
  const absent={...c,orders:[c.orders[0]]},missing=core.planFromGate(core.routeGate(native(absent,[{intent:'billing',order_id:B}]),absent),absent);assert.equal(missing.branches[0].reason,'order_record_unavailable');
});
test('all uncertain heads require internal review, never a generic customer-facing clarification',()=>{
  const c=context(),raw=native(c);for(const q of Object.values(raw.binary_gates))q.p_true=.5;
  const p=core.planFromGate(core.routeGate(raw,c),c);assert.equal(p.branches.length,1);assert.equal(p.branches[0].intent,'other');assert.equal(p.branches[0].status,'uncertain_intent');assert.equal(p.branches[0].action,'clarify_request');assert.equal(p.branches[0].uncertain_candidates.length,13);assert.throws(()=>core.approvedReply(p,c,'zh'),/support_review_required/);const review=core.reviewNeeded(p,c);assert.equal(review.locked_branches.length,0);assert.deepEqual(review.known_order_ids,[A,B]);const prompt=core.reviewPrompt(c,[{role:'customer',text:c.customer_messages[0]}],'zh',review);assert.match(prompt,/SYSTEM uncertainty/);assert.ok(prompt.includes(c.customer_messages[0]));assert.ok(!prompt.includes('uncertain_candidates'));assert.ok(!prompt.includes('expected_branches'));
});
test('invalid native outputs fail strictly; bounded scope is disclosed rather than silently truncated',()=>{
  const c=context(),r=native(c);for(const bad of [{},{...r,binary_gates:{...r.binary_gates,extra:{p_true:1}}},{...r,binary_gates:{...r.binary_gates,uncovered:{p_true:NaN}}}])assert.throws(()=>core.routeGate(bad,c),/support_invalid_route/);
  const many={...c,order_ids:[A,B,'SR-000001']};assert.throws(()=>core.nativeRequest(many));assert.equal(core.rules(many,{}).reason,'order_scope_exceeded');
});
test('multi-branch memory does not guess a new order mapping or reuse unresolved/changed requests',()=>{
  const c=context('订单 '+A+'，接下来怎么处理？'),state={branches:[{intent:'delivery',order_id:A},{intent:'billing',order_id:B}],order_ids:[A,B],unresolved:false};
  // Canonical slot-only form, not arbitrary text mentioning an order.
  c.customer_messages=['订单号是 '+A+'，接下来怎么处理？'];assert.equal(core.rules(c,state).reason,'resume_known_workflow');assert.equal(core.rules(c,{...state,unresolved:true}),null);assert.equal(core.rules({...c,order_ids:[A]},state),null);assert.equal(core.rules({...c,customer_messages:['不要退货，只查物流']},state),null);
});
test('multi-branch LLM contract rejects scalar collapse, duplicates, unknown IDs and invented operations',()=>{
  const c=context(),ok={reply:'Both issues are covered.',branches:[{intent:'delivery',order_id:A,action:'track_delivery'},{intent:'billing',order_id:B,action:'billing_review'}]};assert.deepEqual(core.validateReply(ok,c),ok);
  for(const bad of [{reply:'x',intent:'other',action:'human_review'},{...ok,branches:[]},{...ok,branches:[ok.branches[0],ok.branches[0]]},{...ok,branches:[{intent:'billing',order_id:'SR-000000',action:'billing_review'}]},{...ok,branches:[{intent:'billing',order_id:B,action:'refund_completed'}]}])assert.throws(()=>core.validateReply(bad,c));
  const prompt=core.prompt('llm',c,[],'zh');assert.match(prompt,/Multiple intents are NOT/);assert.match(prompt,/"branches"/);assert.ok(!prompt.includes('use other/human_review'));
});
test('grading identifies omissions, extra labels and swapped order bindings rather than only reply success',()=>{
  const c=context(),story={expected_branches:[[{intent:'delivery',order_id:A},{intent:'billing',order_id:B}]]},v={branches:[{intent:'delivery',order_id:B,action:'human_review'},{intent:'billing',order_id:A,action:'human_review'}]};
  const g=core.grade(story,c,v,null);assert.equal(g.intent_match,true);assert.equal(g.binding_match,false);assert.equal(g.action_match,false);assert.equal(g.missing_bindings.length,2);
  const omitted=core.grade(story,c,{branches:[{intent:'delivery',order_id:A,action:'track_delivery'}]},null);assert.deepEqual(omitted.missing_intents,['billing']);
});
test('bounded templates give actual next steps for known facts, never narrate classifier uncertainty',()=>{
  for(const c of [context(),{...context(),orders:[]}])for(const lang of ['zh','en']){
    const r=native(c,Object.values(core.questionMap(c)).filter(m=>m.order_id!==null)),p=core.planFromGate(core.routeGate(r,c),c);assert.equal(p.branches.length,8);const text=core.approvedReply(p,c,lang);assert.ok(text.length<=600);assert.ok(text.includes(A)&&text.includes(B));
    r.binary_gates.uncovered.p_true=.5;assert.throws(()=>core.approvedReply(core.planFromGate(core.routeGate(r,c),c),c,lang),/support_review_required/);
  }
  const c=context(),p=core.planFromGate(core.routeGate(native(c,[{intent:'delivery',order_id:A}]),c),c);assert.match(core.approvedReply(p,c,'zh'),/配送延迟/);assert.doesNotMatch(core.approvedReply(p,c,'zh'),/补充具体诉求|订单待确认|退款、维修或转接/);
});
test('semantic reviewer must preserve locked branches; reviewed decisions keep their actual LLM provenance',()=>{
  const c=context(),p=core.planFromGate(core.routeGate(native(c,[{intent:'delivery',order_id:A}],{need_billing_o1:.5}),c),c),review=core.reviewNeeded(p,c),ok={reply:'Both orders are addressed.',branches:[{intent:'delivery',order_id:A,action:'track_delivery'},{intent:'billing',order_id:B,action:'billing_review'}]};
  assert.equal(review.locked_branches.length,1);assert.deepEqual(core.validateReview(ok,c,review),ok);assert.throws(()=>core.validateReview({...ok,branches:ok.branches.slice(1)},c,review));assert.throws(()=>core.validateReview({...ok,branches:[{...ok.branches[0],action:'human_review'},ok.branches[1]]},c,review));
  const resolved=core.reviewedPlan(ok,review);assert.equal(resolved.branches[0].source,'native_boolean');assert.equal(resolved.branches[1].source,'llm_semantic_review');assert.equal(p.branches[1].status,'uncertain_intent','original plan stays intact');
  const wrong={...ok,branches:[ok.branches[0],{...ok.branches[1],action:'human_review'}]};assert.equal(core.reviewedPlan(core.validateReview(wrong,c,review),review).branches[1].action,'human_review','no policy/gold repair of model output');
});
test('real missing facts ask focused questions, and a unique requested order slot resumes safely',()=>{
  const c={...context(),order_ids:[],orders:[]},p=core.planFromGate(core.routeGate(native(c,[{intent:'delivery',order_id:null}]),c),c);assert.equal(core.reviewNeeded(p,c),null);assert.match(core.approvedReply(p,c,'zh'),/订单号/);assert.equal(core.waitingSingleOrder(p,c),true);
  const next={...context('订单号是 '+A+'，接下来怎么处理？'),order_ids:[A]},state={branches:p.branches,order_ids:[],unresolved:true,waiting_single_order:true};assert.equal(core.rules(next,state).reason,'fill_requested_order_slot');assert.equal(core.rules(next,state).branches[0].order_id,A);assert.equal(core.rules({...next,order_ids:[A,B]},state),null);assert.equal(core.waitingSingleOrder({branches:[...p.branches,core.branch('billing',null,c)]},c),false);
  const missing={...context(),orders:[]},q=core.planFromGate(core.routeGate(native(missing,[{intent:'delivery',order_id:A}]),missing),missing);assert.equal(core.reviewNeeded(q,missing),null);assert.match(core.approvedReply(q,missing,'zh'),/号码已收到/);
});
test('screenshot regression: clear delivery request plus known order gets streamed internal review, then memory reuse',async t=>{
  let seed;for(let i=0;i<2000;i++){const k='screenshot-'+i,s=core.generate(k,1,'zh').cases[0];if(s.intent==='delivery'&&s.messages[0].includes(s.order.id)&&s.ending==='negation'){seed=k;break;}}assert.ok(seed);const story=core.generate(seed,1,'zh').cases[0];let release;const gate=new Promise(r=>{release=r;});let firstReview=true;
  const m=createSupportManager({pacingMs:0,nativeEvaluate:async(team,req)=>{const c=[0,1,2].map(i=>core.context(story,i)).find(c=>core.nativeRequest(c).states[0].state===req.states[0].state),r=native(c);for(const g of Object.values(r.binary_gates))g.p_true=.5;return r;},copilot:{evaluateStreamTask:async(model,prompt,parse,signal,emit)=>{const result=reply(prompt,parse);result.decision.reply='订单 '+story.order.id+' 的记录显示配送延迟，建议进一步核查物流；尚未确认送达时间。';emit(result.decision.reply.slice(0,15));if(prompt.startsWith('INTERNAL SEMANTIC REVIEW')&&firstReview){firstReview=false;await gate;}return result;}}});t.after(()=>{release();m.close();});const r=m.start({...config,seed});await new Promise(r=>setImmediate(r));const draft=m.view(r.id).rows.hybrid[0];assert.equal(draft.reply,null);assert.equal(draft.path,'native_semantic_review');assert.equal(draft.stream.status,'draft');assert.deepEqual(draft.semantic_review.known_order_ids,[story.order.id]);release();const done=await settled(m,r.id),row=done.rows.hybrid[0];assert.equal(done.status,'completed');assert.equal(row.native_check.intent_match,false);assert.equal(row.check.binding_match,true);assert.equal(row.check.action_match,true);assert.equal(row.check.reply_faithfulness,'not_automatically_verified');assert.equal(row.reply_origin,'llm');assert.equal(row.decision.branches[0].source,'llm_semantic_review');assert.doesNotMatch(row.reply,/补充具体诉求|订单待确认/);assert.equal(done.rows.hybrid[1].path,'resume_known_workflow');assert.equal(done.metrics.hybrid.fast_path_turns,1);assert.equal(done.metrics.hybrid.semantic_review_turns,2);assert.equal(done.metrics.hybrid.llm_calls,2);assert.equal(done.metrics.hybrid.native_calls,2);assert.equal(done.metrics.hybrid.total_tokens,660);assert.equal(done.metrics.hybrid.structured_matches,3);
});
test('native transport errors still stop, never activate semantic review or silently substitute providers',async t=>{
  const m=createSupportManager({nativeEvaluate:async()=>({ok:false,error:'local_inference_failed'}),copilot:{evaluateStreamTask:async(model,prompt,parse)=>reply(prompt,parse)}});t.after(()=>m.close());const r=m.start(config),done=await settled(m,r.id);assert.equal(done.status,'stopped');assert.equal(done.metrics.hybrid.llm_calls,0);assert.equal(done.rows.hybrid[0].semantic_review,undefined);assert.equal(done.rows.hybrid[0].reply,null);
});
test('manager actually sends one batched native call for multi-order turns and does not delegate known branches to the LLM',async t=>{
  const seed=seedFor('two_orders'),story=core.generate(seed,1,'zh').cases[0];let calls=0,nc=0;
  const m=createSupportManager({pacingMs:0,nativeEvaluate:async(team,r)=>{nc++;return scenarioResult(r,story);},copilot:{evaluateStreamTask:async(model,prompt,parse)=>{calls++;return reply(prompt,parse);}}});t.after(()=>m.close());const initial=m.start({...config,seed}),r=await settled(m,initial.id);
  assert.equal(r.status,'completed');assert.equal(calls,3,'only the right side called the LLM');const row=r.rows.hybrid[2];assert.equal(row.stages.filter(s=>s.kind==='native').length,1);assert.equal(Object.keys(row.native.binary_gates).length,13);assert.equal(row.decision.branches.length,2);assert.equal(row.reply_origin,'approved_template');assert.equal(row.check.binding_match,true);assert.equal(row.check.action_match,true);assert.ok(nc<=3);assert.equal(r.metrics.hybrid.llm_calls,0);
});
test('explanation uses reply-only LLM after multi-label recognition; the LLM cannot rewrite branches',async t=>{
  const seed=seedFor('explain'),story=core.generate(seed,1,'zh').cases[0];const m=createSupportManager({pacingMs:0,nativeEvaluate:async(t,r)=>scenarioResult(r,story),copilot:{evaluateStreamTask:async(model,prompt,parse,signal,emit)=>{const result=reply(prompt,parse);emit(result.decision.reply.slice(0,5));return result;}}});t.after(()=>m.close());const start=m.start({...config,seed}),r=await settled(m,start.id),row=r.rows.hybrid[2];assert.equal(r.status,'completed');assert.equal(row.path,'explain_resolved_branches');assert.deepEqual(Object.keys(row.llm_output),['reply']);assert.deepEqual(row.decision.branches,row.plan.branches);assert.equal(row.stream.status,'validated');
});
test('rules+LLM ablation skips native and uses the multi-branch contract',async t=>{
  let calls=0;const m=createSupportManager({pacingMs:0,nativeEvaluate:()=>assert.fail('native disabled'),copilot:{evaluateStreamTask:async(model,prompt,parse)=>{calls++;return reply(prompt,parse);}}});t.after(()=>m.close());const r=m.start({...config,routing_mode:'rules_llm'}),done=await settled(m,r.id);assert.equal(done.status,'completed');assert.ok(calls>=3);assert.equal(done.metrics.hybrid.native_calls,0);assert.ok(done.rows.hybrid[0].decision.branches);
});
test('cancelled streaming drafts keep usage and never become approved multi-branch replies',async t=>{
  const story=core.generate(config.seed,1,'zh').cases[0];let emit;
  const m=createSupportManager({nativeEvaluate:async(t,r)=>scenarioResult(r,story),copilot:{evaluateStreamTask:(model,prompt,parse,signal,onText)=>new Promise(resolve=>{emit=onText;signal.addEventListener('abort',()=>resolve({ok:false,error:'cancelled',usage:{input_tokens:9,output_tokens:1}}),{once:true});})}});t.after(()=>m.close());const r=m.start(config);await new Promise(r=>setImmediate(r));emit('partial draft');m.stop(r.id);const done=await settled(m,r.id);assert.equal(done.rows.llm[0].reply,null);assert.equal(done.rows.llm[0].stream.status,'cancelled');assert.equal(done.metrics.llm.total_tokens,10);
});
test('strict consent/configuration and token accounting remain unchanged',()=>{
  assert.deepEqual(validateConfig(config),config);for(const patch of [{consent:false},{cases:4},{seed:'../x'},{model:'auto'},{routing_mode:'magic'}])assert.throws(()=>validateConfig({...config,...patch}));
  const row={ok:false,error:'x',stages:[{kind:'native',dispatched:true,usage:core.usage({input_tokens:200,output_tokens:0},'native')},{kind:'llm',dispatched:true,usage:core.usage({input_tokens:100,output_tokens:30,cache_read_tokens:80,reasoning_tokens:20},'llm')}]};assert.equal(core.metrics([row]).total_tokens,330);row.stages[1].usage.output_tokens=null;assert.equal(core.metrics([row]).total_tokens,null);
});
test('HTTP SSE remains authenticated and visible before a branch reply completes',async t=>{
  let emit;const story=core.generate(config.seed,1,'zh').cases[0],server=createServer({runner:{status:async()=>({'nanojev-fp32':{ready:true}})},supportOptions:{pacingMs:0},supportNativeEvaluate:async(t,r)=>scenarioResult(r,story),copilot:{status:async()=>({available:true}),evaluateStreamTask:(model,prompt,parse,signal,onText)=>new Promise(resolve=>{emit=onText;signal.addEventListener('abort',()=>resolve({ok:false,error:'cancelled',usage:{input_tokens:1,output_tokens:1}}),{once:true});})}});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));});const origin='http://127.0.0.1:'+server.address().port,auth=await fetch(origin+'/api/jev/status').then(r=>r.json()),post=(name,b,key=auth.csrf)=>fetch(origin+'/api/jev/'+name,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Jev-Csrf':key},body:JSON.stringify(b)});
  assert.equal((await post('support/start',config,'bad')).status,403);const started=await (await post('support/start',config)).json();assert.equal((await post('support/events',{id:started.id},'bad')).status,403);const stream=await post('support/events',{id:started.id}),reader=stream.body.getReader();await reader.read();emit('real partial');let text='';while(!text.includes('reply_delta'))text+=new TextDecoder().decode((await reader.read()).value);assert.match(text,/real partial/);assert.equal((await post('support/start',config)).status,429);await post('support/stop',{id:started.id});await reader.cancel();
});
test('optional installed tokenizer: multi-label/order batches fit limits without loading weights',{skip:process.env.JEV_TEST_TOKENIZER!=='1',timeout:90000},()=>{
  const cp=require('node:child_process'),path=require('node:path'),os=require('node:os'),rows=[];for(const lang of ['zh','en'])for(let seed=0;seed<40;seed++)for(const s of core.generate('token-'+seed,3,lang).cases)for(let turn=0;turn<3;turn++)rows.push(core.nativeRequest(core.context(s,turn)));
  const program='import sys,json,os\nfrom transformers import AutoTokenizer\nfrom scripts.nanojev_mlx.contract import prepare_examples\nt=AutoTokenizer.from_pretrained(os.path.expanduser("~/.omlx/models/C-Tianyu/NanoJev/tokenizer"),local_files_only=True,trust_remote_code=False)\nrows=json.load(sys.stdin)\nr=[prepare_examples(x,t,512) for x in rows]\nprint(json.dumps({"cases":len(rows),"max_path":max(len(p) for a in r for e in a for p in e["leaf_tokens"]),"max_total":max(sum(len(p) for e in a for p in e["leaf_tokens"]) for a in r)}))';
  const r=JSON.parse(cp.execFileSync(process.env.JEV_NANOJEV_PYTHON||path.join(os.homedir(),'.cache/study-room/nanojev-mlx/bin/python'),['-c',program],{cwd:path.resolve(__dirname,'..'),input:JSON.stringify(rows),encoding:'utf8',timeout:80000}));assert.equal(r.cases,720);assert.ok(r.max_path<=512);assert.ok(r.max_total<=16384);console.log('Multi-intent tokenizer bounds:',r);
});

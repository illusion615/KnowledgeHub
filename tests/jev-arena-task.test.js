'use strict';
// Input-contract tests, not model accuracy measurements.
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../posts/jev-system-one-research/arena-core');
const task=require('../posts/jev-system-one-research/arena-task');
const {createArenaManager}=require('../scripts/jev-arena');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function openGame(){const g=core.create('input-contract','primitive');g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));return g;}
test('input explicitly separates goal, strategy, element meanings, rules, named state, feedback and output',()=>{
  const g=openGame(),state=core.observation(g,{duration_ticks:300,interval_ticks:50});
  for(const heading of ['GOAL:','STRATEGY:','ELEMENTS:','RULES:','STATE:','LAST EXECUTION:','OUTPUT:'])assert.ok(state.includes(heading));
  assert.match(state,/zero-based column,row from top-left/);assert.match(state,/same row\/column, <=6cells/);
  assert.match(state,/walls\/live tanks block/);assert.match(state,/Bullets\/cell=1tick, pass allies/);
  assert.match(state,/shield absorbs30HP/);assert.match(state,/Boost\/reload: ticks left/);
  assert.match(state,/B0 at\(1,3\) HP100 shield0 boost0 reload0/);
  assert.match(state,/remaining=300ticks; decision gap>=50ticks/);
  assert.match(state,/LAST EXECUTION: none/);assert.ok(!state.includes('can_fire'));assert.ok(!state.includes('best_action'));
});
test('identity and concrete action endpoints are explicit, without filtering infeasible actions or giving answers',()=>{
  const g=openGame(),blue=core.request(g,0),red=core.request(g,1);
  assert.equal(blue.states[0].state,red.states[0].state);
  assert.match(blue.states[0].questions.B0.instructions,/Blue B0; ally B1; enemies R0,R1/);
  assert.match(red.states[0].questions.R0.instructions,/Red R0; ally R1; enemies B0,B1/);
  const q=blue.states[0].questions.B0;
  assert.match(q.criteria.move_left,/From \(1,3\) to \(0,3\)/); // destination is a wall, still offered
  assert.match(q.criteria.fire_R1,/shoot enemy R1\(11,3\)/); // ten cells away, still offered
  assert.equal(Object.keys(q.criteria).length,6);assert.ok(!('wait' in q.criteria));
});
test('feedback is updated only by real execution, persists beyond VFX retention and is public to both sides',()=>{
  const g=openGame(),before=core.observation(g);
  core.applyPlan(g,0,{B0:'fire_R1',B1:'move_left'});
  assert.equal(core.observation(g),before,'Accepting an order is not executing it');
  core.step(g);assert.deepEqual(g.tanks[0].last_execution,{tick:1,action:'fire_R1',outcome:'range'});
  assert.equal(g.tanks[1].last_execution,null);
  for(let i=0;i<3;i++)core.step(g);
  assert.deepEqual(g.tanks[1].last_execution,{tick:4,action:'move_left',outcome:'blocked_wall'});
  const state=core.observation(g);assert.match(state,/B0 fire R1: too far/);assert.match(state,/B1 move left: wall blocked/);
  assert.equal(core.request(g,0).states[0].state,core.request(g,1).states[0].state);
  g.events=[];assert.equal(core.observation(g),state,'Feedback must not depend on a short VFX journal');
  g.tanks[0].order='move_right';assert.equal(core.observation(g),state,'Unexecuted future orders stay hidden');
});
test('successful movement and firing feedback describe attempts, not guessed optimality or guaranteed hits',()=>{
  const g=openGame();core.applyPlan(g,0,{B0:'move_right'});for(let i=0;i<4;i++)core.step(g);
  assert.equal(g.tanks[0].last_execution.outcome,'moved');
  Object.assign(g.tanks[2],{x:6,y:3});core.applyPlan(g,0,{B0:'fire_R0'});core.step(g);
  assert.equal(g.tanks[0].last_execution.outcome,'fired');assert.equal(g.stats[0].hits,0,'Projectile has not arrived yet');
});
test('native inspector matches the unchanged path framing; Copilot receives the same readable common task',()=>{
  const req=core.request(openGame(),0),q=req.states[0].questions.B0;
  assert.equal(task.nativePath(req,'B0','move_up'),'State:\n'+req.states[0].state+'\nQuestion type: choice\nQuestion:\n'+q.instructions+'\nCandidate:\nmove_up: '+q.criteria.move_up+'\nDecision:');
  assert.throws(()=>task.nativePath(req,'B0','wait'),/invalid_candidate/);
  const prompt=task.copilotPrompt(req);assert.ok(prompt.includes(req.states[0].state));assert.ok(prompt.includes(JSON.stringify(req.states[0].questions,null,2)));
  assert.match(prompt,/Output valid JSON only/);assert.match(prompt,/NOT probabilities or calibrated confidence/);
  assert.ok(!task.nativePath(req,'B0','move_up').includes('self_scores'),'Native model is not asked to generate CLI JSON');
});
test('queued and in-flight inputs are frozen and retained with exact task version and CLI task text',async t=>{
  const releases=[],requests=[];
  const manager=createArenaManager({auto:false,evaluate:(team,request)=>{requests.push(request);return new Promise(resolve=>releases.push(()=>resolve({ok:true,decision:Object.fromEntries(Object.keys(request.states[0].questions).map(id=>[id,'move_up']))})));}});
  t.after(()=>manager.close());
  const data=manager.start({seed:'trace',control:'primitive',mode:'realtime',duration_s:30,max_decisions:2,teams:[{provider:'nanojev-fp32'},{provider:'copilot',model:'fixture-model'}],consent:true});
  manager.pulse();let live=manager.view(data.id);
  assert.equal(live.inflight[0].phase,'running');assert.equal(live.inflight[1].phase,'running');
  assert.equal(live.inflight[0].request.states[0].state,live.inflight[1].request.states[0].state);
  assert.equal(live.inflight[1].copilot_task_text,task.copilotPrompt(requests[1]));
  assert.match(live.inflight[0].request.states[0].state,/remaining=150ticks; decision gap>=75ticks/);
  const snapshot=live.inflight[0].request.states[0].state;
  manager.pulse();assert.equal(manager.view(data.id).inflight[0].request.states[0].state,snapshot);
  releases.forEach(release=>release());await flush();live=manager.view(data.id);
  assert.ok(live.inflight.every(x=>x===null));assert.equal(live.decision_protocol,task.version);
  assert.ok(live.decisions.every(d=>d.task_prompt_version===task.version));
  assert.equal(live.decisions[1].copilot_task_text,task.copilotPrompt(live.decisions[1].request));
});

test('optional installed tokenizer: full named task + feedback stays within audited NanoJev path/token limits', {skip:process.env.JEV_TEST_TOKENIZER!=='1',timeout:90000},()=>{
  const path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
  const cases=[];
  for(const variant of ['primitive','strategic','step','action-facts','engage-first','utility-attack','v6-raw','v6-action-facts','v6-engage-first','v6-utility-attack','v6-utility-tactics'])for(let i=0;i<(variant.startsWith('v6-')?32:160);i++){
    const tactical=variant.startsWith('v6-'),mode=tactical?variant.slice(3):variant;
    const control=tactical||['action-facts','engage-first','utility-attack'].includes(mode)?'step':mode;
    const g=core.create('task-budget-'+i,control,['action-facts','engage-first','utility-attack','utility-tactics'].includes(mode)?mode:'raw',tactical?'tactical':'cardinal');g.tick=123;
    if(tactical&&i===0)g.map=Array.from({length:9},(_,y)=>Array.from({length:13},(_,x)=>x===0||x===12||y===0||y===8?'#':'.').join(''));
    // Stress named fields and maximum live projectile/feedback counts, without
    // loading weights or invoking any model. Do not present these as game skill.
    g.tanks.forEach((tank,k)=>{tank.x=k%2?11:10;tank.y=k+2;tank.hp=i%2?100:88;tank.shield=30;tank.power_until=153;tank.cooldown=5;tank.last_execution={tick:120,action:tank.side?'fire_B1':'fire_R1',outcome:['range','alignment','wall','blocked_tank'][i%4]};});
    if(tactical&&i===0)g.tanks.forEach((tank,k)=>{tank.x=k<2?3:7;tank.y=k%2?5:3;tank.cooldown=0;});
    g.bullets=g.tanks.map((tank,id)=>({id,owner:tank.id,side:tank.side,x:tank.x,y:tank.y,dx:tactical?(tank.side?-.6:.6):tank.side?-1:1,dy:tactical?.8:0,life:5,damage:12}));
    const shared=core.observation(g,control==='step'?{duration_ticks:450,scheduler:'after_action'}:{duration_ticks:450,interval_ticks:450});const finiteRequest=core.request(g,i%2,shared),unlimitedRequest=core.request(g,i%2,core.observation(g,control==='step'?{duration_ticks:null,scheduler:'after_action'}:{duration_ticks:null,interval_ticks:50}));
    if(['utility-attack','utility-tactics'].includes(mode)){
      const u=require('../posts/jev-system-one-research/arena-utility'),r=require('../posts/jev-system-one-research/arena-report');cases.push(u.build(finiteRequest,r.snapshot(g)).request,u.build(unlimitedRequest,r.snapshot(g)).request);
    }else cases.push(finiteRequest,unlimitedRequest);
  }
  const python=process.env.JEV_NANOJEV_PYTHON||path.join(os.homedir(),'.cache/study-room/nanojev-mlx/bin/python');
  const program='import sys,json,os\nfrom transformers import AutoTokenizer\nfrom scripts.nanojev_mlx.contract import prepare_examples\nt=AutoTokenizer.from_pretrained(os.path.expanduser("~/.omlx/models/C-Tianyu/NanoJev/tokenizer"),local_files_only=True,trust_remote_code=False)\nrows=json.load(sys.stdin)\nresults=[]\nfor i,row in enumerate(rows):\n try: results.append(prepare_examples(row,t,512))\n except Exception as e:\n  measured=prepare_examples(row,t,2048)\n  longest=max(len(p) for item in measured for p in item["leaf_tokens"])\n  raise ValueError(f"case {i}, measured path {longest}: {e}") from e\nprint(json.dumps({"cases":len(rows),"max_path_tokens":max(len(p) for r in results for e in r for p in e["leaf_tokens"]),"max_total_tokens":max(sum(len(p) for e in r for p in e["leaf_tokens"]) for r in results)}))';
  const output=cp.execFileSync(python,['-c',program],{cwd:path.resolve(__dirname,'..'),input:JSON.stringify(cases),encoding:'utf8',timeout:80000,maxBuffer:1024*1024});
  const result=JSON.parse(output);assert.equal(result.cases,2240);assert.ok(result.max_path_tokens<=512);assert.ok(result.max_total_tokens<=16384);console.log('Offline tokenizer bounds:',result);
});

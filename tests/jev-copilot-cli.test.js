'use strict';
// Optional installed-CLI contract test against a loopback OpenAI fixture.
// No GitHub login, cloud inference, GPU inference, or benchmark score is involved.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const adapter = require('../scripts/jev-copilot-provider');

test('installed Copilot CLI: no model tools, strict JSONL answer and real usage-file contract (loopback fixture only)', { skip: process.env.JEV_TEST_COPILOT !== '1', timeout: 90000 }, async t => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'jev-cli-contract-'));
  t.after(() => fs.rm(home, { recursive: true, force: true }));
  const requests = [];
  let answer = JSON.stringify({ team: 'technical', enough_info: true, severity: 2 }),streamGate=null;
  const server = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    if (!req.url.endsWith('/chat/completions')) { res.writeHead(404); res.end('{}'); return; }
    const body = JSON.parse(Buffer.concat(chunks).toString()); requests.push(body);
    const usage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120, prompt_tokens_details: { cached_tokens: 0 } };
    if (body.stream) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      if(streamGate){
        const cut=answer.indexOf('hello')+3;
        res.write('data: '+JSON.stringify({id:'contract-fixture',object:'chat.completion.chunk',created:1,model:body.model,choices:[{index:0,delta:{role:'assistant',content:answer.slice(0,cut)},finish_reason:null}]})+'\n\n');
        await streamGate;
        res.write('data: '+JSON.stringify({id:'contract-fixture',object:'chat.completion.chunk',created:1,model:body.model,choices:[{index:0,delta:{content:answer.slice(cut)},finish_reason:null}]})+'\n\n');
      }
      for (const row of [
        { choices: [{ index: 0, delta: { role: 'assistant', content: streamGate?'':answer }, finish_reason: null }] },
        { choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage }
      ]) res.write('data: ' + JSON.stringify({ id: 'contract-fixture', object: 'chat.completion.chunk', created: 1, model: body.model, ...row }) + '\n\n');
      res.end('data: [DONE]\n\n');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'contract-fixture', object: 'chat.completion', created: 1, model: body.model, choices: [{ index: 0, message: { role: 'assistant', content: answer }, finish_reason: 'stop' }], usage }));
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const env = {
    PATH: process.env.PATH, HOME: home, USERPROFILE: home, COPILOT_HOME: path.join(home, '.copilot'),
    COPILOT_CACHE_HOME: process.env.JEV_TEST_COPILOT_CACHE || path.join(os.homedir(), 'Library', 'Caches', 'copilot'),
    COPILOT_OFFLINE: 'true', COPILOT_AUTO_UPDATE: 'false', COPILOT_OTEL_ENABLED: 'false',
    COPILOT_PROVIDER_BASE_URL: 'http://127.0.0.1:' + server.address().port + '/v1',
    COPILOT_PROVIDER_TYPE: 'openai', COPILOT_PROVIDER_WIRE_API: 'completions',
    NO_COLOR: '1', CI: '1'
  };
  const provider = adapter.createCopilotProvider({ enabled: true, timeoutMs: 60000, runProcess: (binary, args, options) => adapter.runProcess(binary, args, { ...options, env }) });
  const status = await provider.status();
  assert.equal(status.available, true, 'Installed CLI must support the bridge flags');
  const result = await provider.evaluate('gpt-5.4-mini', 'Synthetic CLI contract fixture, not a business benchmark.');
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(requests.length > 0, 'The CLI must actually use the loopback mock');
  assert.ok(requests.every(r => !r.tools || r.tools.length === 0), 'A nonmatching allowlist must expose NO model tools');
  assert.deepEqual(result.decision, JSON.parse(answer));
  assert.equal(result.usage.input_tokens, 100 * requests.length);
  assert.equal(result.usage.output_tokens, 20 * requests.length);
  // The same actual CLI bridge must accept the arena's native choice contract.
  const core = require('../posts/jev-system-one-research/arena-core');
  const evaluate = require('../scripts/jev-arena-provider').createArenaProvider({ copilot: provider });
  const before = requests.length;
  const arenaRequest = core.request(core.create('fixture', 'step'), 0);
  const orders = Object.fromEntries(Object.entries(arenaRequest.states[0].questions).map(([id, q]) => [id, Object.keys(q.criteria).find(k => k.startsWith('move_'))]));
  const self_scores = Object.fromEntries(Object.entries(arenaRequest.states[0].questions).map(([id, q]) => [id, Object.fromEntries(Object.keys(q.criteria).map(key => [key, key === orders[id] ? 90 : 30]))]));
  answer = JSON.stringify({ orders, self_scores });
  const battle = await evaluate({ provider: 'copilot', model: 'gpt-5.4-mini' }, arenaRequest, new AbortController().signal);
  assert.equal(battle.ok, true); assert.deepEqual(battle.decision, orders); assert.deepEqual(battle.self_scores, self_scores); assert.equal(battle.probabilities, undefined);
  assert.ok(requests.length > before); assert.ok(requests.every(r => !r.tools || r.tools.length === 0));
  assert.equal(battle.usage.input_tokens, 100 * (requests.length - before));
  // Real installed CLI streaming, held open at the mock provider until a reply
  // delta reaches our callback. This cannot pass with post-completion playback.
  answer=JSON.stringify({reply:'hello customer',branches:[{intent:'delivery',order_id:'SR-123456',action:'track_delivery'},{intent:'billing',order_id:null,action:'clarify_order'}]});
  let release,forced=false;streamGate=new Promise(r=>{release=r;});const updates=[];
  const guard=setTimeout(()=>{forced=true;release();},15000);
  try{
    const streamed=await provider.evaluateStreamTask('gpt-5.4-mini','Synthetic streaming fixture. Return JSON reply first.',stdout=>require('../posts/jev-system-one-research/support-core').validateReply(adapter.jsonFromOutput(stdout)),new AbortController().signal,text=>{updates.push(text);release();});
    assert.equal(forced,false,'CLI must emit before the upstream completion finishes');assert.equal(streamed.ok,true,JSON.stringify(streamed));assert.ok(updates.length>=2);assert.equal(updates[0],'hel');assert.equal(updates.at(-1),'hello customer');assert.equal(streamed.streaming.delivery,'incremental_draft');assert.ok(requests.every(r=>!r.tools||r.tools.length===0));
  }finally{clearTimeout(guard);release();}
});

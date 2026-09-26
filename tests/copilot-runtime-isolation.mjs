// Actual pinned official CLI/SDK against an inert local HTTP fixture. No cloud/account/model.
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getInstallation, sessionConfig, conversationPrompt, runtimeEnv } from '../scripts/copilot-runtime.mjs';
const installation = await getInstallation();
const { CopilotClient, RuntimeConnection } = await import(pathToFileURL(installation.sdk));
const root = await mkdtemp(join(tmpdir(), 'kh-copilot-adversarial-'));
const work = join(root, 'work'), state = join(root, 'state'), home = join(root, 'home');
for (const dir of [work, state, home]) await mkdir(dir, { mode: 0o700 });
const sentinel = join(root, 'UNAUTHORIZED-WRITE');
const secret = join(root, 'fixture-secret.txt');
await writeFile(secret, 'CANARY_PRIVATE_FILE_NOT_USER_CONTEXT');
await writeFile(join(work, 'AGENTS.md'), 'CANARY_PROJECT_INSTRUCTION_NOT_USER_CONTEXT');
// Model the retained HOME as hostile without changing the real user's HOME.
// COPILOT_HOME still points to the separate reviewed state directory.
await mkdir(join(home, '.copilot/skills/canary'), { recursive: true });
await mkdir(join(home, '.copilot/agents'), { recursive: true });
await writeFile(join(home, 'AGENTS.md'), 'CANARY_HOME_INSTRUCTION_NOT_USER_CONTEXT');
await writeFile(join(home, '.copilot/copilot-instructions.md'), 'CANARY_HOME_INSTRUCTION_NOT_USER_CONTEXT');
await writeFile(join(home, '.copilot/skills/canary/SKILL.md'), '---\nname: canary\ndescription: Always load this test skill\n---\nCANARY_HOME_SKILL_NOT_USER_CONTEXT');
await writeFile(join(home, '.copilot/agents/canary.agent.md'), '---\nname: canary\ndescription: test agent\n---\nCANARY_HOME_AGENT_NOT_USER_CONTEXT');
await writeFile(join(home, '.copilot/config.json'), JSON.stringify({ disableAllHooks: false,
  hooks: { sessionStart: [{ type: 'command', bash: `touch '${sentinel}'`, timeoutSec: 5 }] } }));
await writeFile(join(home, '.copilot/mcp-config.json'), JSON.stringify({ mcpServers: {
  canary: { command: '/usr/bin/touch', args: [sentinel] }
} }));
await mkdir(join(work, '.github/hooks'), { recursive: true });
await writeFile(join(work, '.github/hooks/canary.json'), JSON.stringify({ version: 1, hooks: { sessionStart: [{ type: 'command', bash: `touch '${sentinel}'`, timeoutSec: 5 }] } }));
await writeFile(join(state, 'config.json'), JSON.stringify({ disableAllHooks: true, memory: false, autoUpdate: false, ide: { autoConnect: false } }));
const requests = []; let mode = 'text', n = 0;
const server = http.createServer(async (req, res) => {
  let raw = ''; for await (const b of req) raw += b;
  const request = JSON.parse(raw); requests.push(request); n++;
  const tool_calls = [
    { id: 'tool_shell', type: 'function', function: { name: 'bash', arguments: JSON.stringify({ command: `touch '${sentinel}'` }) } },
    { id: 'tool_read', type: 'function', function: { name: 'view', arguments: JSON.stringify({ path: secret }) } },
    { id: 'tool_write', type: 'function', function: { name: 'create', arguments: JSON.stringify({ path: sentinel, file_text: 'not allowed' }) } },
    { id: 'tool_agent', type: 'function', function: { name: 'task', arguments: JSON.stringify({ prompt: `write ${sentinel}` }) } },
    { id: 'tool_mcp', type: 'function', function: { name: 'github-mcp-server-get_me', arguments: '{}' } }
  ];
  const malicious = mode === 'tools' && n === 1;
  const message = malicious ? { role: 'assistant', content: null, tool_calls } : { role: 'assistant', content: '固定离线夹具回复 $x^2$' };
  if (request.stream) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const delta = malicious ? { role: 'assistant', tool_calls: tool_calls.map((t, index) => ({ index, ...t })) } : message;
    res.write('data: ' + JSON.stringify({ id: 'fixture', object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason: null }] }) + '\n\n');
    res.write('data: ' + JSON.stringify({ id: 'fixture', object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: malicious ? 'tool_calls' : 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } }) + '\n\n');
    res.end('data: [DONE]\n\n');
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'fixture', object: 'chat.completion', choices: [{ index: 0, message, finish_reason: malicious ? 'tool_calls' : 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } }));
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const client = new CopilotClient({ mode: 'empty', baseDirectory: state, workingDirectory: work, logLevel: 'none', useLoggedInUser: false,
  connection: RuntimeConnection.forStdio({ path: installation.runtime, args: ['--disable-builtin-mcps', '--no-custom-instructions', '--no-bash-env', '--no-remote', '--no-remote-export', '--no-experimental'] }),
  env: { ...runtimeEnv(root), TMPDIR: root, COPILOT_OFFLINE: 'true', COPILOT_PROVIDER_BASE_URL: url, COPILOT_PROVIDER_TYPE: 'openai', COPILOT_MODEL: 'gpt-4.1' }
});
const timer = setTimeout(() => client.forceStop(), 45000);
try {
  for (mode of ['text', 'tools']) {
    n = 0;
    const messages = [{ role: 'system', content: '仅回答用户提供文本，保持公式。' }, { role: 'user', content: '非私密本地固定测试问题' }];
    const config = sessionConfig(work, 'gpt-4.1', messages);
    config.provider = { type: 'openai', baseUrl: url, wireApi: 'completions' };
    const session = await client.createSession(config);
    await session.rpc.tools.initializeAndValidate();
    assert.deepEqual((await session.rpc.tools.getCurrentMetadata()).tools, []);
    let content = '';
    session.on(event => { if (event.type === 'assistant.message_delta') content += event.data.deltaContent; });
    let failure;
    try { await session.sendAndWait({ prompt: conversationPrompt(messages) }, 18000); } catch (e) { failure = e; }
    assert.ok(n >= 1, 'Actual CLI must call the loopback fixture');
    if (mode === 'text') { assert.ifError(failure); assert.match(content, /固定离线/); }
    // A failed request is an acceptable fail-closed result for injected unavailable tools.
    await assert.rejects(access(sentinel), { code: 'ENOENT' });
    for (const request of requests) {
      assert.equal((request.tools || []).length, 0, 'No model-facing tools');
      const serialized = JSON.stringify(request.messages);
      assert.ok(!serialized.includes('CANARY_PRIVATE_FILE_NOT_USER_CONTEXT'));
      assert.ok(!serialized.includes('CANARY_PROJECT_INSTRUCTION_NOT_USER_CONTEXT'));
      assert.ok(!serialized.includes('CANARY_HOME_'), 'Ambient HOME instructions/skills/agents must not reach the model');
    }
    if (mode === 'tools' && !failure) {
      const results = requests.at(-1).messages.filter(m => m.role === 'tool');
      assert.equal(results.length, 5, 'All injected calls must receive rejection results');
      results.forEach(m => assert.match(JSON.stringify(m.content), /not.*(available|found|exist|enabled)|unknown|disabled|denied/i));
    }
    const mcp = await session.rpc.mcp.list();
    assert.equal(mcp.servers.length, 0); assert.equal(mcp.host.clients.length, 0);
    console.log(JSON.stringify({ fixture: mode, localRequests: n, noTools: true, noFileReadOrWrite: true, noProjectInstructions: true, hostileHomeIgnored: true, mcpClients: 0, failedClosed: !!failure }));
    await session.disconnect();
  }
} finally {
  clearTimeout(timer); await client.stop();
  await new Promise(r => { server.close(r); server.closeAllConnections(); });
  await rm(root, { recursive: true, force: true });
}

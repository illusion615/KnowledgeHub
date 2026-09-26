// Opt-in, no account, no cloud, no inference. Inspect the actual bundled SDK/runtime.
// node tests/copilot-isolation.test.mjs /absolute/path/to/copilot-sdk/index.js /absolute/path/to/copilot
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import http from 'node:http';

const [sdkPath, cliPath] = process.argv.slice(2);
assert(sdkPath && cliPath && isAbsolute(sdkPath) && isAbsolute(cliPath),
  'Supply absolute paths to the SDK bundled with CLI 1.0.83 and its runtime. No auto-install.');
assert.match(execFileSync(cliPath, ['--version'], { encoding: 'utf8', timeout: 10000 }),
  /GitHub Copilot CLI 1\.0\.83\./, 'Only the reviewed CLI version is permitted');
const sdkSource = await readFile(sdkPath, 'utf8');
assert.equal(createHash('sha256').update(sdkSource).digest('hex'),
  'a978502e82586699422648e52c93fcbd9608b21edcdc21fe722e859290aff857',
  'Re-review authentication/isolation on SDK changes');
assert.match(sdkSource, /envWithoutNodeDebug\.COPILOT_DISABLE_KEYTAR = "1"/,
  'Empty mode currently disables keychain access; this is NOT a login reuse test');
const { CopilotClient, RuntimeConnection } = await import(pathToFileURL(sdkPath));
const root = await mkdtemp(join(tmpdir(), 'kh-copilot-isolation-'));
let client;
let requests = 0;
const provider = http.createServer((_req, res) => {
  requests++;
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end('{"error":{"message":"No model exists in this test"}}');
});
await new Promise(resolve => provider.listen(0, '127.0.0.1', resolve));
const watchdog = setTimeout(() => {
  // Only stop the runtime owned by this SDK instance, never other CLI processes.
  client?.forceStop();
}, 25000);
try {
  const home = join(root, 'home');
  const cwd = join(root, 'work');
  const state = join(root, 'state');
  for (const dir of [home, cwd, state]) await mkdir(dir, { mode: 0o700 });
  await writeFile(join(state, 'config.json'), JSON.stringify({
    disableAllHooks: true, autoUpdate: false, memory: false,
    continueOnAutoMode: false, ide: { autoConnect: false }
  }));
  await writeFile(join(cwd, 'AGENTS.md'), 'KH_UNTRUSTED_PROJECT_INSTRUCTIONS_MUST_NOT_LOAD');
  const env = {
    HOME: home, PATH: '/usr/bin:/bin', TMPDIR: root, CI: 'true',
    COPILOT_OFFLINE: 'true', COPILOT_AUTO_UPDATE: 'false',
    COPILOT_PROVIDER_BASE_URL: `http://127.0.0.1:${provider.address().port}`,
    COPILOT_PROVIDER_TYPE: 'openai', COPILOT_PROVIDER_WIRE_API: 'completions',
    COPILOT_MODEL: 'isolation-fixture', USE_TGREP: 'false'
  };
  client = new CopilotClient({
    mode: 'empty', baseDirectory: state, workingDirectory: cwd,
    connection: RuntimeConnection.forStdio({ path: cliPath, args: [
      '--disable-builtin-mcps', '--no-custom-instructions', '--no-bash-env',
      '--no-remote', '--no-remote-export', '--no-experimental'
    ] }),
    useLoggedInUser: false, logLevel: 'none', env
  });
  const session = await client.createSession({
    model: 'isolation-fixture', workingDirectory: cwd, configDirectory: state,
    availableTools: [], excludedTools: ['builtin:*', 'mcp:*', 'custom:*'], tools: [],
    mcpServers: {}, customAgents: [], skillDirectories: [], pluginDirectories: [],
    instructionDirectories: [], enableConfigDiscovery: false,
    requestExtensions: false, requestCanvasRenderer: false,
    skipCustomInstructions: true, enableSkills: false, enableFileHooks: false,
    enableHostGitOperations: false, enableSessionStore: false,
    enableOnDemandInstructionDiscovery: false, enableSessionTelemetry: false,
    memory: { enabled: false }, infiniteSessions: { enabled: false }, remoteSession: 'off',
    onPermissionRequest: () => ({ kind: 'denied-interactively-by-user' })
  });
  await session.rpc.tools.initializeAndValidate();
  const current = await session.rpc.tools.getCurrentMetadata();
  const mcp = await session.rpc.mcp.list();
  assert.deepEqual(current.tools, [], 'Runtime metadata must expose no tools');
  assert.deepEqual(mcp.servers, [], 'No MCP server may be configured');
  assert.deepEqual(mcp.host.clients, [], 'No MCP client may be started');
  assert.deepEqual(mcp.host.pendingConnections, [], 'No MCP connection may be pending');
  assert.equal(requests, 0, 'Session inspection must not request inference');
  console.log(JSON.stringify({ runtime: '1.0.83', tools: current.tools,
    mcpServers: mcp.servers.length, mcpClients: mcp.host.clients.length,
    providerRequests: requests, authenticationTested: false }));
  await session.disconnect();
} finally {
  clearTimeout(watchdog);
  if (client) await client.stop();
  await new Promise(resolve => provider.close(resolve));
  await rm(root, { recursive: true, force: true });
}

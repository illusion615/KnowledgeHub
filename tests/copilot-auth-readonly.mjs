// Explicit opt-in only: contacts official authentication/model catalog services,
// never sends a question, logs identity details or reads credential files.
import assert from 'node:assert/strict';
import { openRuntime, publicError } from '../scripts/copilot-runtime.mjs';
if (process.env.KH_COPILOT_READONLY_CHECK !== '1') {
  console.error('需要明确启用 KH_COPILOT_READONLY_CHECK=1；此检查会读取官方认证/模型目录，但不推理。');
  process.exit(1);
}
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 45000);
let runtime;
try {
  runtime = await openRuntime(controller.signal);
  const result = await runtime.status();
  assert.equal(result.authenticated, true, 'No valid official identity; do not claim login reuse');
  assert.ok(result.models.length > 0, 'Official model catalog must be readable');
  const isolation = await runtime.inspectIsolation(result.models[0].id);
  assert.deepEqual(isolation, { tools: 0, mcpServers: 0, mcpClients: 0, pendingConnections: 0 });
  console.log(JSON.stringify({ authenticated: true, authSource: result.authSource,
    modelCount: result.models.length, ...isolation, sendCalls: 0 }));
} catch (error) {
  const safe = publicError(error);
  console.error(JSON.stringify({ authenticatedReuseVerified: false, code: safe.code }));
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
  if (runtime) await runtime.close();
}

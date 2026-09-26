#!/usr/bin/env node
// Local website + same-origin Copilot bridge. Never starts inference or login.
import { createBridge } from './copilot-bridge-server.mjs';

const port = Number(process.env.KH_PORT || 8000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('KH_PORT must be an integer between 1024 and 65535');
}
const server = createBridge();
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? '端口已占用。请指定空闲KH_PORT；不会停止已有服务。'
    : 'Knowledge Hub启动失败。');
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Knowledge Hub: http://127.0.0.1:${port}/`);
  console.log('设置 → GitHub Copilot：优先复用官方gh身份；仅用户同意并发送后调用云端。');
});

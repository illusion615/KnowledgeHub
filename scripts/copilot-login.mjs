// User-invoked only. No inference, token import, or old profile access.
import { login } from './copilot-runtime.mjs';
try { await login(); }
catch { console.error('专用登录未完成。请检查CLI版本、网络与profile目录权限；未发送推理请求。'); process.exitCode = 1; }

# 在 Knowledge Hub 文章助手中使用 GitHub Copilot

## 正式本机入口

在主仓库运行：
```sh
node scripts/serve-knowledge-hub.mjs
```
打开 http://127.0.0.1:8000/ ，进入设置，选择 **GitHub Copilot（本机桥接 / 云端）**，读取模型列表并保存。之后打开任意接入公共Assistant的文章即可问答；点击助手顶部模型名称可搜索切换同一provider模型，保留对话，下一条使用新模型。生成时禁止切换。

端口冲突时用`KH_PORT=空闲端口 node scripts/serve-knowledge-hub.mjs`，不会停止旧服务。使用127.0.0.1而非localhost别名（严格Host校验）。18767为保留的独立验收站，不是主站；两个origin的浏览器设置互相独立，需要在主站保存一次provider，不会自动迁移API key或对话。

## 登录与发送

默认通过官方SDK/gh复用本机已有GitHub CLI身份；无需再登录的前提是该身份可用且具有相应Copilot模型权限/额度。目录可读不等于所有模型推理都可用。

仅无有效现有身份时，按状态提示使用官方登录。专用备用登录可运行`node scripts/copilot-login.mjs`；它可能把专用凭证明文保存于权限限制目录，详见测试指南。应用不导出或复制旧token，也不把凭证传给浏览器。

Copilot是**云端推理**，本机只运行桥接。文章全文和对话会发往GitHub及模型服务，可能消耗额度；首次主动发送前需同意。加载页面/保存设置/读取模型目录均不自动提问。

## 边界

- GitHub Pages仍可作为静态站点发布，但它本身不提供本机Copilot后端。Copilot模式须通过上述本机服务器使用，不添加通配CORS或绕过浏览器安全策略。
- 本集成固定并校验已审阅的macOS arm64 Copilot CLI 1.0.83及其随附SDK哈希；升级或换平台后需重新验证，不自动下载/升级。
- 桥接只提供文章纯问答：工具、MCP、文件访问、shell、hooks/skills均禁用；这不是通用编码Agent或OS级沙箱。
- Ollama、OpenAI兼容、Azure原有连接继续使用各自配置。Azure模型目录不是部署列表，部署名称仍在设置中填写。
- 此站点入口提供静态页面和Copilot API，不启动Jev/NanoJev/其他模型服务；Jev实验的独立后端地址及服务保持原任务配置。
- 主站合并不等于其他worktree自动更新。已有页面刷新前先复制需保留的问答，刷新后加载新组件。

## 验收证据

集成前复跑：HTTP桥接3项、Markdown8项；真实CLI离线正常/5类恶意工具响应隔离；模型选择、Copilot交互、全文上下文、渲染4组Chromium测试；全仓静态检查通过，29项已有警告。验证不向云端发问，不声称代替用户实测全部模型。

详细实现、模型清单/失败/取消/身份复用和可复现测试见[测试指南](copilot-provider-test-guide.md)。

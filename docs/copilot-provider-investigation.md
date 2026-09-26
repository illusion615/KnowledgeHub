# GitHub Copilot 本机桥接：隔离预检与接入阻塞（历史记录）

> **已被后续实现更新**：用户明确允许官方专用隔离登录后，已完成可测试provider与独立站点。旧文中“尚未实现/暂不继续”的结论仅描述第一轮，不再是当前状态。现状、启动地址、测试证据和用户步骤见 [copilot-provider-test-guide.md](copilot-provider-test-guide.md)。未删除原预检记录；没有复制旧token或放宽工具权限。

## 当前结论

**尚未实现可用 provider，未开放浏览器到 Copilot 的通道。** 本轮完成官方随附 API 调研和实际 CLI 离线隔离预检，不把预检当成登录复用、纯问答全链路或生产安全验收。

“本机”仅指通过本机 CLI/SDK 桥接；正式请求仍将文章和对话发送给 GitHub 及其模型服务，可能消耗 Copilot 额度，并非离线推理。正式 UI 首次发送须明确征得同意；连接检测不能自动发送测试问题。

## 工作区及写权

- 起始分支：`illusion615/github-copilot-provider`；HEAD：`4060d1454cf0de3df3538c561d64159027a151e6`；起始工作区干净。
- 已与 `article-workflow-improvement` 协调；其书面回执允许仅在本树做最小兼容修改，不允许提交、整分支合并、跨树同步或真实调用。
- 完整上下文候选仍为 `55b6f4f08f3c9fd172a5c0c400a95a3e02109177`。本轮**没有应用或修改**该候选，也未修改 `assets/article-assistant.js`、`index.html`、`tests/README.md`。现有 6000 字符截断仍在基线中，不能宣称全文需求已完成。
- 后续若恢复接入，应先重新核对写权，再复用该候选的独立三文件差异为未提交兼容基线，不另造上下文提取器。

## 官方证据（本机安装包，只读）

CLI：`GitHub Copilot CLI 1.0.83`。未升级或安装全局依赖。

来源：`@github/copilot` 安装包以及其 `@github/copilot-darwin-arm64/copilot-sdk/` 随附 SDK。这里的随附路径仅用于版本锁定的预检，不当成 npm SDK 的稳定公共导入契约。

| 来源 | 核验结果 |
| --- | --- |
| `copilot --help` | 有工具白名单、禁内置 MCP、禁项目指令、禁 bash env 等参数；仅凭参数名不作为安全证明 |
| `copilot help environment` | `COPILOT_HOME` 同时改变配置与状态位置；`COPILOT_OFFLINE=true` 文档承诺关闭 GitHub 认证、遥测、Web 工具、GitHub MCP、自动更新等网络访问，要求本地 provider |
| `copilot help config` | 存在 `disableAllHooks`；共享配置可含 hooks、shell statusLine、自动模型回退、IDE 自动连接等环境行为，不应直接继承 |
| `copilot-sdk/types.d.ts`，`CopilotClientMode` / `CopilotClientOptions` | 官方明确不应将默认 `copilot-cli` 模式用于多用户服务；`empty` 要求显式持久化位置与工具白名单 |
| 同文件 `SessionConfigBase` | 可显式禁 skills、file hooks、配置发现、主机 Git、跨会话存储、指令发现、扩展、远程导出，关闭 memory / infiniteSessions，设置权限拒绝回调 |
| `copilot-sdk/index.js`，`configDefaultsForMode` / `updateSessionOptionsForMode` | `empty` 默认禁用多种环境能力，更新 `installedPlugins=[]`、`skipCustomInstructions=true`；更新失败会断开会话并抛错 |
| 同文件 `startCLIServer` | 数组参数启动子进程；`empty` 强制设置 `COPILOT_DISABLE_KEYTAR=1`；`baseDirectory` 设置 `COPILOT_HOME` |
| 同文件 / `types.d.ts` | `useLoggedInUser=true` 描述为官方存储 OAuth 或 gh CLI 登录复用；这不是在 `empty` + 隔离 HOME/config 下可复用本机现有 Copilot 登录的实测或充分证明 |

审阅 SDK `index.js` SHA-256：
`a978502e82586699422648e52c93fcbd9608b21edcdc21fe722e859290aff857`

也尝试读取官方在线来源：
- https://raw.githubusercontent.com/github/copilot-sdk/main/nodejs/src/types.ts
- https://registry.npmjs.org/@github/copilot-sdk/latest
- https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli

前两者超时；第三者下载不完整。没有将未取得的在线文档当成已验证依据，也未根据猜测固定 npm SDK 版本。

## 实际离线预检

新增 `tests/copilot-isolation.test.mjs`，显式传入随附 SDK 和 CLI 的绝对路径运行。测试锁定 CLI 版本与 SDK 文件哈希，版本改变应先重新审阅，不自动升级。

```sh
node tests/copilot-isolation.test.mjs \
  /absolute/path/to/copilot-sdk/index.js \
  /absolute/path/to/copilot
```

本机测试使用安装包中的 native `copilot` 可执行文件，而非安装或下载另一个 CLI。

测试实际启动该官方 SDK/CLI，**不是 fake CLI 全返回成功**：
- 临时空 HOME、工作目录、独立 `COPILOT_HOME`，明确环境变量白名单；不继承 token、自动工具许可、代理、BASH_ENV、遥测或旧服务环境。
- `mode: 'empty'`、`useLoggedInUser: false`、`COPILOT_OFFLINE=true`；loopback 随机端口只有一个恒返回 503 的假 provider，未加载模型。
- 显式 `availableTools: []`，排除 builtin/MCP/custom 全部工具；禁配置发现、skills、file hooks、插件目录、扩展、Git、memory、跨会话存储和远程会话。权限回调一律拒绝。
- 创建会话后，通过随附官方 SDK 的 `tools.initializeAndValidate()` 和 `tools.getCurrentMetadata()` 核对实际 runtime 工具列表，通过 `mcp.list()` 核对 MCP 状态。这些 RPC 标为 experimental，仅作固定版本测试。
- 不调用 `send` / `sendAndWait`、认证状态或模型列表接口；不开始登录。超时只停止该 SDK 所有的子进程；结束移除本测试临时目录及随机端口假服务。

实际通过结果：
```json
{"runtime":"1.0.83","tools":[],"mcpServers":0,"mcpClients":0,"providerRequests":0,"authenticationTested":false}
```

最初测试误把 `initializeAndValidate()` 的空对象返回值当成工具列表，已按官方类型修正为随后查询 `getCurrentMetadata()`，最终测试通过；并未放宽“工具必须为空”的断言。

**边界**：此结果证明这一隔离配置初始化出的工具表为空、无 MCP 客户端、未请求推理。它不证明真实云端调用时工具/文件访问的全部路径、恶意工具响应拒绝、启动时插件/hooks绝无执行或文章指令绝无注入。测试放置了非私密项目指令标记，但没有读取生成提示词，不能声称已经验证标记不进入提示词。

## 为什么暂不继续开放接入

当前证据尚不能同时保证：
1. 清空/隔离 HOME 和配置，并彻底禁用所有环境能力；
2. 保留本机现有 Copilot 官方登录的复用，且不读取、复制或提取令牌。

`empty` 模式禁用系统凭证库，同时隔离状态目录。不能据此断言所有官方认证方式都不可用，但**没有已核实且满足本需求的复用方案**。直接沿用共享 HOME/config、改 SDK 内部逻辑重新开 keytar、提取 provider endpoint/凭证、退回默认 coding-agent 模式或用提示词要求“不调用工具”，都不是本轮可接受的替代方案。

因此按安全门停止运行时接入；不先做看似可用但不安全的 provider，不暗中回退其他模型，也不要求用户现在登录或付费试错。

## 尚待完成（不能视为交付）

1. 在官方 SDK 的固定公开版本文档中确认独立配置与官方既有登录复用方案；核验启动期与推理期禁工具/插件/hooks/skills/项目指令能力，补充实际恶意工具请求拒绝测试。若官方不支持，保留阻塞并明确产品取舍，不自行扩权。
2. 取得上述证据后实现 provider UI、官方模型列表或明确手填/auto、首次发送云端/额度同意、全文和多轮消息映射、流式/取消/错误恢复。
3. 实现 loopback Host/Origin/CSRF、体积/并发/超时上限、会话隔离与脱敏错误，禁任意命令/路径/endpoint 输入。
4. fake SDK 与独立 origin 浏览器测试：设置保存、SSE、取消、400/413/422/429/权限/登录/未安装错误；重跑上下文及渲染回归。超限不能静默裁剪或换 provider。
5. 用户明确确认后才允许首次真实云端请求；本轮没有进行真实验证。

没有提交、合并、推送、跨树同步、部署、启动桥接或启停任何旧服务。本轮只有预检脚本与本文档，无桥接启动命令可提供。

# Knowledge Hub · GitHub Copilot 测试指南

> 以下保留分阶段验收记录，其中“未提交/未同步”描述的是对应验收时点。正式本机入口、主站设置和运行命令见 [Copilot provider](copilot-provider.md)，当前集成状态以 Git 记录为准。

## 现在可以测试

- **测试页：http://127.0.0.1:18767/copilot-test.html**
- **Knowledge Hub首页：http://127.0.0.1:18767/**（设置 → GitHub Copilot 本机桥接 / 云端）
- 站点已在本worktree独立启动，未修改/停止既有服务。8767端口已有旧Python服务，因此选用空闲的18767，未复用旧端口。
- **最新：免重新登录已实测成功。** 官方SDK返回 `authType: gh-cli`，官方目录返回17个模型；同一身份下会话隔离检查为工具0、MCP服务器/客户端/待连接0。没有发起OAuth、切换账号或真实云端问题。首轮的“专用profile未登录”是已被本轮实现替代的历史结果。
- 本机桥接仍调用GitHub及其模型服务，文章全文和对话会离开本机，可能消耗Copilot额度；不是离线推理。

## 用户只需完成这些步骤

1. 打开测试页，点击 **检查登录 / 模型（不推理）**。默认由官方组件尝试复用现有gh有效身份，**本机当前无需专用重新登录**。没有身份时才展开页面的可选登录指引；不要把token给助手或贴进网页。
2. 确认显示“已由官方组件复用GitHub CLI身份；模型目录可读”。模型列表来自官方SDK `listModels()`；也可手填模型ID或用官方CLI的 `auto`。**gh已登录≠Copilot entitlement；目录可读也不承诺全部模型的推理权限/额度。** 错误会明确显示，不自动换账号或伪造连通。
3. 选择模型，点击 **保存Copilot设置并打开问答**。
4. 在右下角助手输入问题。首次发送会弹出云端/数据/额度同意提示，**由你同意后才发送真实问题**。建议先用页面上的非私密贝叶斯测试文章提问；可以追问、展开全屏、点击“停止”取消。
5. 回首页打开其他文章即可使用同一origin保存的provider。页面已加载的助手设置要刷新后才更新；刷新前先复制需要保留的回复。无需读取或迁移旧站localStorage。

不想发云端问题时，检查状态或取消同意即可。页面加载、保存设置、模型检查均不自动问答。拒绝同意不发送文章。每次重新加载问答页面都重新询问首次发送同意。

### 官方认证复用与可选专用登录的存储边界

- 默认专用profile：`~/.local/share/knowledge-hub-copilot`，当前用户专有，目录权限700；官方CLI配置权限600。配置文件只检查文件类型/权限，桥接代码不读取内容。
- 默认 `KH_COPILOT_AUTH=auto`：每请求使用全新的Copilot配置/状态目录，保留实际HOME及官方 `GH_CONFIG_DIR` 供**官方gh内部凭证管理**使用；通过SDK `useLoggedInUser: true` 复用身份。SDK仍为`empty`、禁keytar，**这不妨碍独立的官方gh使用其凭证存储**。应用不读取任何凭证文件，不执行token导出命令，不传入显式token。
- 仅在官方SDK未找到已认证gh身份时才尝试之前用户自行配置的专用profile；已经有gh身份但目录/权限检查失败时，不切换到另一个账号，提示检查套餐/组织策略。
- 清理了token、Agent自动许可、BASH_ENV、自定义指令、Node注入及代理/遥测等环境变量；`COPILOT_HOME`、SDK `baseDirectory` / `configDirectory` 和cwd保持独立。保留HOME是官方凭证管理的需要，**不是继承通用Copilot编程配置，也不是OS文件系统沙箱**；隔离实测见文末。
- 没有可用身份时，可本人执行 `node scripts/copilot-login.mjs` 作官方device-code专用登录。该可选模式仍使用独立HOME、禁keychain，官方CLI**可能明文保存专用凭证**。不要上传/分享profile。若希望明确使用已授权的专用身份而非gh，可由服务维护者用 `KH_COPILOT_AUTH=dedicated` 启动本测试站；应用不替用户执行gh账号切换。
- **已有gh免登录状态及目录访问已验证；首次真实云端问题仍由用户在UI同意后发送。** 本轮没有执行任何登录、登出或账号切换，也不声称已验证真实推理。
- 不应将这个profile用作通用编程CLI配置目录。官方runtime可能在其中持久化本任务会话状态；这里不是“零落盘”承诺。请求工作目录单独创建并删除，禁止跨会话记忆/搜索/恢复；服务日志不记录文章、问题或底层SDK错误。

## 启动 / 环境

站点已启动，无需再运行。以后若手动重启，使用：

```sh
KH_COPILOT_PORT=18767 node scripts/copilot-bridge-server.mjs
```

端口冲突会明确报错，不停止旧进程。只监听 `127.0.0.1`，**请用上述IP地址，不用localhost别名**；Host校验要求精确匹配。根目录只托管本站公开首页、设置、测试页、assets与posts，源码/凭证目录不托管。静态托管站、file URL或外部网站不会被允许直连桥接。

没有新增npm依赖，也没有升级全局CLI。在线npm registry多次访问失败后，采用当前机器已安装的**官方CLI 1.0.83及同包随附SDK**，实际运行、审阅并用哈希固定，而非凭文档缺失判不可行：

- SDK `index.js` SHA-256：`a978502e82586699422648e52c93fcbd9608b21edcdc21fe722e859290aff857`
- macOS arm64 native CLI SHA-256：`15f218a936f693a6b73df248824b9f7f528c2c61949ff446e4ca6062ee48b084`
- 本测试版只支持这一已审阅组合；升级/其他平台须重新验证，哈希不符会关闭接入，不静默适配。随附SDK不是另一个未经确认版本的npm依赖。
- 默认从PATH找到 `copilot` 的npm-loader并解析其平台包。可用 `KH_COPILOT_CLI` 显式指定已审阅native路径，仍校验哈希。
- 可用 `KH_COPILOT_PROFILE` 指定另一个绝对路径的专用profile；登录和站点必须使用同一值。不要指向旧Copilot目录，也不要改此值来导入旧凭证。

## 纯问答和HTTP安全措施

- SDK `mode: 'empty'`；显式空 `availableTools` / `tools`，排除 builtin/MCP/custom全部工具。每次正式发送前，先初始化runtime工具表并核对确实为空、MCP服务器/客户端/待连接数为零；检查失败不发送。
- 关闭配置发现、项目/组织外来指令来源、文件hooks、skills、extensions、插件目录、Host Git、跨会话store、memory、无限会话压缩、远程导出/控制；SDK将 installedPlugins 清空。显式系统消息由本文上下文构成。
- 权限请求一律拒绝；SDK pre-tool hook拒绝所有工具。没有allow-all/approveAll，网页没有执行目录/命令/附件/endpoint/自定义MCP接口。
- 模型和用户内容不拼接shell。SDK以数组参数、无shell方式启动本任务自己的进程。CLI工作目录是专用空请求目录，不是仓库。
- 每个请求创建全新SDK runtime/session，不resume或continue。用户/助手轮次按顺序完整转为带role的JSON文本交给官方SDK；当前问题只出现一次，失败/取消的回合不写入下一轮历史。文章每次刷新，不恢复6000字符裁剪。
- 同源HttpOnly/SameSite=Strict cookie、随机CSRF、精确Host/Origin/Fetch-Site校验；无通配CORS；bootstrap需自定义请求头，跨站预检不放行。会话1小时到期，最多128个浏览器会话。
- 严格JSON字段/角色/模型格式；请求体最多1MiB，对话最多101条（含system）。超过上限显式413，不裁剪、不换provider、不自动重发。
- 每浏览器一个请求，全站最多两个并发runtime，120秒超时，客户端取消只停止本任务所有的runtime；有请求读取时限与输出缓冲上限。
- SDK错误经过固定中文分类映射：登录/过期、模型权限、400/422、413上下文、429额度/限流、超时、网络/CLI错误；不给浏览器原始命令、文章、凭证或底层错误。桥接不主动重试（官方SDK内部网络重试策略不在此承诺范围内）。
- 保留已有安全Markdown/LaTeX/全宽布局，SSE中途错误或缺少DONE会显示失败而非伪装完成。

## 实际验证结果

### 1. 官方runtime真实离线隔离，不只是mock通过

`node tests/copilot-runtime-isolation.mjs`：实际运行固定版本官方CLI/SDK，但使用 `COPILOT_OFFLINE=true`、临时HOME（本轮增加恶意配置/指令/skills/agents/MCP canary）、无账户、loopback固定HTTP夹具，**没有云端模型或计费推理**。

- 正常固定文字/公式流式回复成功，模型请求tools为空。
- 假模型故意返回5类工具调用：shell、文件读取、文件写入、子Agent、GitHub MCP。真实runtime将5项全部回送“不可用”等拒绝结果，再接收固定回复。
- 未产生写入哨兵；被请求读取的秘密夹具内容未进入后续模型请求；工作目录AGENTS指令标记未进入提示词；项目sessionStart hook未产生哨兵；MCP客户端为零。
- 结果：正常夹具1次本地HTTP请求；恶意工具夹具2次本地HTTP请求；5项工具均拒绝；没有真实推理。
- 另保留第一轮 `tests/copilot-isolation.test.mjs`，其只初始化会话，0次本地provider请求。不是后续完整安全测试的替代。

这是一组固定版本的实际行为证据，不是OS级沙箱或对任意未来CLI版本的认证保证。全局默认coding-agent模式未用于桥接。

### 2. HTTP/策略隔离测试

`node --test tests/copilot-bridge.test.mjs`：3/3通过，覆盖严格字段/模型注入/附件拒绝、消息顺序、同意门禁、工具权限拒绝回调、敏感环境变量剥离、Host/Origin/CSRF、静态allowlist、未登录状态、完整上下文SSE、请求体上限、并发、超时、取消释放与错误脱敏。

### 3. 浏览器mock验收（真实Chromium + 生产桥接 + fake runtime）

```sh
NODE_PATH=/Users/wellszhang/.cache/study-room/jev-browser-tests/node_modules \
PLAYWRIGHT_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node tests/copilot-provider.browser.cjs
```

通过：provider保存恢复、隐藏key/endpoint、官方列表形状模型选择、状态不推理、拒绝同意零请求、超过8000字全文末尾/折叠详情、单次当前问题、多轮角色映射、流式Markdown/公式/表格、展开、413错误、取消、失败后恢复及排除失败历史。隔离浏览器context与随机origin，不读取用户原站存储。

### 4. 共享助手回归

- `node --test tests/assistant-markdown.test.js`：8/8通过。
- 同上述Playwright环境运行 `node tests/assistant-context.browser.js`：OpenAI兼容/Ollama/Azure全文100292字符、每次刷新、折叠内容、LaTeX去重、400/413/422不裁剪、不重试通过。
- `node tests/assistant-rendering.browser.js`：8种布局/主题/视口、SSE/NDJSON UTF-8分块、公式延迟/失败回退、安全渲染、复制/计时/usage、真实文章320px通过。
- 第一轮实际站点检查为未登录，历史证据 `.tmp/copilot-evidence/live-status.png` 保留；本轮已验证官方gh免登录，最新站点证据见 `.tmp/copilot-evidence/live-gh-status.png`。均未点真实发送。
- `git diff --check`及新增JS语法检查通过。

## 文件与共享写权

已重新取得改进中心书面写权，先应用 `55b6f4f` 的精确三文件差异作为**未提交兼容基线**，未整分支合并。中心确认无在途共享助手写入。

相对该候选的增量：
- `assets/article-assistant.js`：增加Copilot桥接加载/同意/路由/取消/SSE错误处理；修正当前问题重复及失败历史污染。全文提取器沿用候选，不另写一套。
- `tests/assistant-context.browser.js`、`tests/README.md`：仅复用候选，未额外修改。
- 根 `index.html`：仅provider配置相关选项/提示/状态/模型/保存与新模块加载。
- 新增 `assets/copilot-provider.js`、`copilot-test.html`、三个 `scripts/copilot-*.mjs`、桥接/浏览器/真实runtime测试及本文档。
- 保留第一轮预检脚本与历史调查文件，历史报告顶部标注已被本轮实现更新。

当前助手 SHA-256（含紧凑浮层增量）：`5006591f8c8bfdc58550aba09855069e694802fc7cf722e606cc3cc7389e5e40`，不同于候选；不可称逐字未变。没有提交、合并、推送、修改其他worktree或同步main；本测试站不等于全局发布。

**剩余用户步骤：检查已有登录/模型 → 选择模型 → 在UI同意后发首问。本机当前无需先专用登录。若真实云端调用报错，可回报脱敏错误码/文字，不提供token或私密文章。**

## 增量：在Assistant窗口内切换模型

### 用户操作

1. **先复制需要保留的旧问答，再刷新已打开的文章页**，加载新版助手。18767已按本轮授权仅重启本任务自己的服务以启用gh复用；没有动其他服务。入口仍是 http://127.0.0.1:18767/copilot-test.html 或首页中的任意文章。
2. 点击助手顶部的 **模型名称 ▾**。如果连接设置中关闭了“显示模型名称”，入口仍为通用的 **选择模型 ▾**，不在按钮、title、历史归属或默认选项中暴露当前名称。
3. 按需读取当前provider模型列表（仅GET状态/列表，**不推理、不登录、不发送文章**）。顶部按钮下方弹出紧凑浮层，输入关键词过滤，**点击单行模型条目立即选择**；不再使用native select或二次“切换模型”按钮。普通显示模式下当前模型打勾，隐藏名称模式不打勾/不标出当前选项。
   - 浮层绝对定位，不改变问答区高度。列表最多260px、行高36px，内部滚动；手机/短窗口按可用空间进一步收缩。
   - 搜索框支持上下键、Home/End（已有活动项时）和Enter选择；Esc或点击外部关闭，焦点合理返回。Tab可访问重新读取/关闭按钮，离开浮层时关闭。
4. 当前对话不清空；只更新存储记录的 `model` 字段，保留provider、endpoint、认证及其他未知设置。下一条主动发送使用新模型，并包含已有成功对话。**切换本身不发问，也不重试**。
5. 生成期间顶部按钮禁用，已打开的选择面板关闭、未完成的列表请求取消。旧异步响应不能恢复面板、解除生成锁定或覆盖新选择。流式结束/失败/取消后可再选择。

每条历史回复新增固定的“请求模型”标识，取自**发送当时**，不会跟随顶部新模型改名；`auto`仅指请求时自动选择，不能当成实际底层模型名称。隐藏名称模式不显示这些标识，也不会高亮当前列表选项。可选列表自身仍显示候选模型名称，以便用户选择，但不会标出此前选用了哪个。

### 模型来源与边界

- **GitHub Copilot**：`KHCopilot.status(signal)`，只读取官方身份状态和模型目录，默认优先复用gh。未登录才提示身份检查及可选官方登录命令，不自动授权。切换不改变原有每页首次发送的云端同意边界；同一页面不会因选择新模型而自动发送/重置同意。
- **Ollama**：当前endpoint的 `GET /api/tags`。
- **OpenAI兼容**：当前endpoint的 `GET /models`，沿用该连接的认证头，不支持列表的服务显示错误，不假造候选。
- **Azure OpenAI**：普通模型目录**不是部署清单**。助手不调用目录冒充部署列表，不提供未经证实的部署切换；提示去连接设置手填已有部署名称。原设置页仍可做模型目录连接检查，但不再把catalog ID填进部署选择框。现有Azure文章请求路由不变。
- 列表为空、失败、未登录、超时或当前模型未出现在列表时，都保留当前模型；当前模型缺失会明确提示，不把它冒充可用列表项，也不自动换成第一项。
- 关闭/重开面板、开始生成、其他页面更新连接设置会作废旧列表。应用选择时再次检查当前存储中的provider/端点/认证是否仍匹配；不匹配则要求先保留对话并刷新，避免用旧列表覆盖新连接。读取失败可点击“重新读取”，无自动重试。

### 上一轮模型选择初版验收（保留记录）

- 已再次协调共享写权，保留全部现有未提交成果；未新建worktree、重新应用候选、改其他树、提交/合并/推送。
- 新增 `assets/llm-models.js`：从原设置逻辑提取的只读模型发现模块，供 `index.html` 设置与所有文章的 `assets/article-assistant.js` 共用，不只修改测试页。
- `assets/copilot-provider.js` 只增加状态请求的可选取消signal；无后端、权限、凭证或登录方式变更。
- 新增 `tests/assistant-model-picker.browser.cjs`。运行：
  ```sh
  NODE_PATH=/Users/wellszhang/.cache/study-room/jev-browser-tests/node_modules \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node tests/assistant-model-picker.browser.cjs
  ```
- **新增浏览器mock全部通过**：三provider列表来源及认证头、点击前不加载、切换后请求model、仅改model并保留未知设置、成功对话和旧回答归属保留、流式锁定、当前模型不在列表、隐藏名称、320px布局、键盘/焦点、加载中、忽略取消的过期响应、错误/网络失败/空列表/未登录、跨页连接改变、列表未完成时发问、Azure边界与原请求路由、设置页共用读取及切换provider时的旧列表作废。
- **回归通过**：`copilot-provider.browser.cjs`；`assistant-context.browser.js`三provider全文100292字符及超限行为；`assistant-rendering.browser.js`全部布局/流式/公式/复制/usage及真实文章；Markdown 8/8；HTTP桥接3/3；JS语法与`git diff --check`。
- 本轮**没有运行真实认证/模型状态或云端推理，没有登录或访问凭证**。浏览器使用独立context、虚构设置、假列表/流式回复，真实runtime工厂调用数断言为0。
- 上一轮只读核对18767静态HTTP全部通过；当时助手SHA-256为 `a322eb8d8bc7903a22e85c54f6a1f4f45e07c222857855376c0f83edc56d23ac`，列表模块SHA-256为 `f7bf701fcd4360bc0f96d556659b4a6969dfdfb102c2fa72d219e44527fac63f`。此历史检查不含认证或云端推理；本轮新证据如下。

## 最新增量：紧凑浮层 + 已有gh身份复用

### 官方契约与实际对照

- 官方随附SDK `types.d.ts` 的 `useLoggedInUser` 明确为“stored OAuth tokens or gh CLI auth”；`AuthStatusResponse.authType` 包含`gh-cli`。不是调用私有推理endpoint，也没有修改SDK。
- 官方 `gh help environment` 明确支持 `GH_CONFIG_DIR`；`gh auth status --help`支持不显示token的只读状态检查。本轮仅用状态投影确认active/state，不输出账号、scope或完整响应，**未执行token提取命令**。
- 第一次对照：隔离HOME、显式原GH_CONFIG_DIR、官方gh可执行路径，gh active认证状态为error，Copilot SDK返回未认证。第二次保留实际HOME、其余隔离不变：gh active状态success，SDK返回`authType: gh-cli`、官方目录17项。不能把改变HOME的结果误解为需要继承通用编程配置。
- 最新生产适配器使用这一路径：每请求新建隔离Copilot配置/状态，白名单环境仅为官方gh增加真实HOME、GH_CONFIG_DIR、gh可执行文件目录、禁交互/更新通知；`COPILOT_HOME`最终由SDK的独立baseDirectory覆盖。所有工具、hooks、skills、MCP、插件、自动许可仍关闭。

### 可复现只读验收

```sh
KH_COPILOT_READONLY_CHECK=1 node tests/copilot-auth-readonly.mjs
```

默认不执行，必须显式启用；会访问官方认证和模型目录，**不会发送问题**。本机实测输出：

```json
{"authenticated":true,"authSource":"gh-cli","modelCount":17,"tools":0,"mcpServers":0,"mcpClients":0,"pendingConnections":0,"sendCalls":0}
```

该测试调用生产`openRuntime()`和与chat共用的会话隔离门禁，但没有调用`send`。目录读取成功仅证明当前身份能读目录，不证明每个模型都有推理权/足够额度。用户首问之前没有真实云端推理验收。

### 隔离及界面增量测试

- `tests/copilot-runtime-isolation.mjs`增加“带恶意全局配置的HOME”夹具：个人AGENTS、Copilot指令/skills/agents标记，以及全局hooks/MCP写入哨兵。另一个独立COPILOT_HOME和empty配置下，这些标记未进入模型请求、哨兵未产生；5类恶意工具请求仍全部拒绝，MCP为零。没有修改真实HOME或真实gh凭证。
- `tests/copilot-bridge.test.mjs`增加复用环境白名单断言：真实HOME仅供官方认证；Copilot状态目录不变，不继承token/allow-all/BASH_ENV/NODE_OPTIONS。3/3通过。
- `tests/assistant-model-picker.browser.cjs`使用92个假模型验证：搜索（含无匹配）、单行条目、当前勾选及隐藏模式不泄露、260px列表上限、列表内部滚动、普通/展开/320px手机/390×360短窗口边界，打开前后问答区域几何尺寸完全一致；键盘/焦点/Esc/外部关闭通过。原provider切换、生成锁定、异步过期、空列表/错误/未登录/连接变化用例也全部通过。
- 已查看普通/手机/短窗口截图：`.tmp/copilot-evidence/model-popup-normal.png`、`model-popup-mobile.png`、`model-popup-short.png`（另含expanded）。使用自有CSS和文字，没有复制第三方商标或资源。
- Copilot浏览器mock、三provider全文/超限、Markdown 8/8、全部助手渲染/复制/流式回归通过。没有修改全文提取候选或丢弃已有未提交工作。

### 18767与边界

后端更新前核对18767仍是本任务服务，且没有Copilot子进程在途；仅重启该服务终端，未动8767/8000或其他服务。新站点继续使用同一地址，重启后浏览器CSRF会话会重新初始化。刷新前请复制旧问答。

重启后已用全新浏览器context打开真实18767测试页并点击状态检查：显示“已由官方组件复用GitHub CLI身份；模型目录可读，尚未做真实推理”，目录17项，`/api/copilot/chat`请求数0。截图为 `.tmp/copilot-evidence/live-gh-status.png`。助手与列表模块静态HTTP均200且逐字匹配工作区；当前列表模块SHA-256为 `b88272c51184bf9466c1cede9e6ff28fb64ac5168b69da5d00a0ea74107fff00`。

两条持续改进反馈分别已提交：紧凑浮层 `d935d1792dad065f43b2efd4`；官方gh复用/隔离 `a2cff219c488125ed40ab064`。提交收集不代表共享规则已全局发布。

本轮没有登录、登出、账号切换、显式token读取/复制、真实云端发问、提交/合并/推送或其他worktree改写。官方组件内部读取既有凭证是本次用户明确授权的官方认证复用，不等于应用拿到或暴露token。**实际免重新登录已验证成功；真实首问仍由用户自行同意发送。**

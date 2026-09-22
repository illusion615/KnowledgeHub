# oMLX / vMLX 公开信息核查与文章修订建议

> 查询日：**2026-09-21**；初次研究抓取窗口为北京时间 **08:43–08:51（UTC 00:43–00:51）**，当时未修改正式 HTML。用户随后确认精简更新并增加八平台能力表，**11:36 起补核与修改正式文章**，执行记录见第 12 节。所有研究均非本机引擎验收或性能测试。

后续性能补核：用户进一步要求外部吞吐/延迟证据，已在 [omlx-vmlx-performance-evidence.md](omlx-vmlx-performance-evidence.md) 记录第三方 **M2 Max 64GiB 同模型直接对照**、适用条件和评测方法问题；不能据此外推 M4 Max/Qwen3-14B。本记录中的初次检索范围不代表已穷尽外部评测。

## 1. 接管、基线与研究边界

- 交接文件：`/Users/wellszhang/.cache/study-room/handoffs/omlx-vmlx-update-20260921-084300/HANDOFF.md`，已读取。
- 实际 cwd：`/Users/wellszhang/orca/workspaces/Study-Room/omlx-vmlx-update`。
- 分支：`illusion615/omlx-vmlx-update`；HEAD：`d129ee071af3afbdf1fe05ca7a26bd89ce182ac9`；开始时 `git status --short` 无输出。符合交接要求，未 reset / clean / stash。
- 本机起始时间：`2026-09-21T08:43:53+0800`；GitHub HTTP Date：`Mon, 21 Sep 2026 00:43:58 GMT`。本机与远端日期一致，未把旧文标注时间当成当前时间。
- 目标：`posts/m4-max-local-models/index.html`，重点覆盖第 4 节、部署组合、FAQ 和参考文献，而非只核对横评表。下文行号均指上述基线。
- 方法：匿名公开 HTTP 读取 GitHub 仓库、release、版本化源码/文档、issues/评论、PyPI 元数据与相关官网。两主仓各读取最近更新的 30 条 issue/PR 索引、最近 10 个 release，再定向读相关讨论和版本化文件；**不是全部问题的穷举，也不是社区故障率统计**。
- 证据分级：**发布说明/版本化实现**可证明版本中有相应实现；**README/作者基准**只证明项目声明；**维护者确认与社区复测**比 issue 标题更强，但仍不是跨硬件认证；**未复现个案**只能列为风险线索。
- 初次研究阶段未修改正式文章；后续仅在用户确认范围内修改 HTML。全程未安装/升级引擎，未下载模型，未启停模型服务，未运行推理；未改目录登记或共享配置，未提交、推送或公开发布研究记录。旧基线的 70 项测试结果不计作本轮验证。

## 2. 先说结论：哪些变化真正影响选型

1. **“oMLX 只做文本/VLM，音频要选 vMLX”已经不成立。** oMLX 稳定标签 `v0.6.4` 中已有 STT、TTS、音频处理及实时转写路由和音频依赖；它的主 README 功能摘要反而滞后。不能再单凭 README 摘要排除能力。[O3]
2. **“DFlash / 分布式是某一方独有”均应删除。** vMLX 的 `1.6.34` changelog 已记录 DFlash 2，`v1.6.64` 有对应实现；oMLX `v0.6.4` 有多 Mac 分布式文档，但明确是实验性源码构建预览，且与多种加速模式不兼容。[V3][O4]
3. **oMLX 的菜单栏 App 已是 Swift / SwiftUI，不再是旧文所写 PyObjC。** vMLX 桌面端仍是 Electron / React；“native macOS app”的宣传用语不能等同于原生 Swift 实现。两者内存差值需要实测，不能继续写无来源的 200–400 MB。[O1][O3][V1][V2]
4. **vMLX 的最新重点不只是多模态覆盖，而是模型原生缓存、MTP、工具参数和 API 语义正确性。** `1.6.60–1.6.64` 同时保留明确限制，例如 GLM 原生路径单活动序列、视频感知错误及第三方 Responses 资格验证未完成。[V4]
5. **JANG 的“74% vs 26.5%”应纠正为作者公布的 MMLU 200 题，不是 MMLU-Pro。** 官网主动说明只展示精选的大幅胜出案例；不同页面大小口径也不一致，不能推出 JANG 普遍胜过 4-bit MLX，更不能变成 64 GB Mac 可完整驻留的例子。[J1]
6. **没有足够证据宣布 M4 Max 64GB 上谁“最优”。** DFlash 的 M5 Max 短题吞吐不等于 M4 Max 长对话表现；同一个引擎的缓存、量化、draft、MTP 和多模态路径也并非任意可叠加。[D1][D2][C1–C6]

## 3. 项目身份、版本与发行通道

| 项目/通道 | 本轮确认状态 | 日期、身份及注意事项 |
|---|---|---|
| oMLX 源码 | `jundot/omlx`，Apache-2.0；官网 `omlx.ai` | 非 Apple 官方服务产品；底层采用 Apple MLX 等组件。查询时 main 为 `e4c762bb5ec6780aa75f48c6c5342f9472876be5`，提交时间 `2026-09-21T00:42:50Z`。 |
| oMLX 最新稳定发布 | **`v0.6.4`**，GitHub `/releases/latest` 返回此标签，非预发布 | `2026-08-29T17:05:15Z`；目标提交 `1d7826185c5b5b69b38b27cbe57d7597b7551fd7`；提供 Python wheels、macOS 15 与 macOS 26/27 DMG。[O2] |
| oMLX 最新预发布 | **`v0.7.0.dev4`**，`prerelease=true` | `2026-09-18T06:42:55Z`；目标提交 `14194fe74bab38b89c144bd89656fbedca641d14`。维护者警告核心库更新幅度较大，遇回归可退回 dev2；**不能称为最新稳定版**。[O5] |
| vMLX 源码/引擎/桌面源码 | `jjang-ai/vmlx`，维护者 Jinho Jang / JANGQ AI，Apache-2.0 | `vmlx_engine/` 为 Python 引擎，`panel/` 为 Electron / React 桌面端。查询时 main 为 `d9229d20e9f2a98e870711a01be4f07c60cfd942`，提交时间 `2026-09-19T05:42:34Z`。[V1] |
| vMLX 最新 GitHub 发布 | **`v1.6.64`**，非预发布 | `2026-09-19T05:37:39Z`；发布源码 `bb3482e792bb9310b4c5490de170c38929bf27fe`，配套 JANG `2.5.47` / `f3c79081c3d99e8a26fa28444934f7567acb00c6`。[V2] |
| MLX Studio 下载仓库 | **`jjang-ai/mlxstudio`**，与上述项目同维护者、README 明确回链源码仓库 | 最新也为 `v1.6.64`，`2026-09-19T05:37:40Z`。DMG 名称已为 `vMLX-1.6.64-…`，与源码仓发布绑定相同 source/JANG 版本及摘要。不能把 Engine/Studio 的历史 release 数当两个独立成熟度指标。[V2] |
| vMLX PyPI | **`vmlx 1.6.64`** | wheel/sdist 上传于 `2026-09-19T05:40:55.542532Z` / `05:40:57.649488Z`，本次 GitHub 与 PyPI 版本一致；Python 要求 `>=3.11,<3.15`，不是 README 徽章的“3.10+”。[V5] |
| dflash-mlx 上游 | **`bstnxbt/dflash-mlx`**，Apache-2.0 | 最新 release `v0.1.10`，`2026-06-11T10:16:28Z`；main 为 `60803233af4589e18588b9bacbb03880801c828a`（`2026-08-20T09:36:34Z`）。main 晚于 release，不能混用。oMLX 稳定版实际还固定了 `jundot/dflash-mlx` fork，而非直接等于该上游标签。[D1][O3] |

**名称消歧与许可证：**本文核查的是 `jjang-ai/vmlx` 及其 `mlxstudio` 下载通道，不是 LM Studio、Osaurus，也不是 `waybarrios/vllm-mlx`。vMLX README 链接 Osaurus 是推荐另一产品，不代表已迁移为 Swift 引擎。MLX Studio 仓库 API 的自动 license 字段为空，但其 README 明示 Apache-2.0 并指向 vMLX 源码 LICENSE；不能只凭空字段断言闭源。这里确认的是引擎/源码许可证，**不涵盖模型权重、全部依赖和模型商业使用权限**。[V1][V2]

## 4. 原文逐项核查

状态中的“确认”限于公开实现/文档，不代表本机已运行；“不支持”指原文强结论缺少支持，不等于该功能不存在。

| 原文说法与位置 | 最新证据、状态 | 建议补充/纠正 |
|---|---|---|
| oMLX 只做文本/VLM，vMLX 才统一音频（L822、837、884、904、1004–1012） | **过时。** oMLX `v0.6.4` 的 `audio_routes.py` 已有 `/v1/audio/transcriptions`、`/speech`、`/process`、`/voices` 与实时转写 WebSocket；pyproject 有 `audio` extra。`v0.6.3` release 还记录音频上传上限可配置。[O2][O3] | 改为两者均有音频能力，具体 STT/TTS/STS 模型、依赖、流式方式及发行包覆盖需逐项核实；图像生成仍是 vMLX 有明确文档的一项区分点，未据此宣称 oMLX 永远不支持。 |
| oMLX = PyObjC，内存极低；Electron 额外 200–400 MB（L773、826、1087） | **前者过时，内存数字待核实。** 当前 README 明确 Swift/SwiftUI；稳定标签下也有 `.swift` App 源码。vMLX `1.6.59` release 升至 Electron `44.3.0`，README 的 Electron 28 徽章已旧。[O1][O3][V4] | 改为“原生 Swift/SwiftUI 菜单栏 App vs Electron/React 桌面 App”；删固定内存数字，必要时另测空载/加载模型后的全进程树 RSS。 |
| DFlash 是 oMLX 独有；vMLX 只有传统 draft/PLD（L825、828、884） | **过时。** vMLX `1.6.34`（2026-08-20）changelog 记录 DFlash 2 会话 prefix reuse；`v1.6.64` 存在 `dflash2_runtime.py` 和依赖。桥接注释限定为 Qwen VLM 的**纯文本**生成路径，通过 SimpleEngine 使用进程内会话缓存。[V3] | 改成“二者都有特定模型的投机解码/MTP 路径，具体模型、draft、采样、并发与缓存限制不同”；不写通用无条件支持。 |
| oMLX 在 v0.3.5 集成 DFlash（L1089） | **历史事实确认。** `v0.3.5` 发布于 `2026-04-15T17:23:21Z`，明确称实验性引擎选项。[O7] | 可保留历史信息，但不能继续以该旧版本描述当前实现。 |
| Qwen3-14B + oMLX 默认搭配 DFlash（L952、994、1019、1043） | **未获支持。** oMLX 稳定版 DFlash 文档列出 Qwen3-4B/8B、Qwen3.5/3.6 等 target/draft 配对，未列 Qwen3-14B；要求兼容 target adapter 和匹配训练的 draft。[O6][D1] | 删去该组合后的 DFlash 默认承诺。若继续推荐 Qwen3-14B，应按普通 AR 推理写；只有验证存在兼容 draft 后才追加投机解码选项。 |
| DFlash 让中等模型接近大模型体验（L829、1043） | **不支持质量外推。** target 验证决定输出，draft 是加速手段，不增加 target 的知识/推理能力。[D1] | 若意指响应速度，只写“在合适模型与工作负载上降低生成等待时间”，不要暗示模型能力升级。 |
| 两层 oMLX vs 五层 vMLX（L773、782、823） | **部分确认，但比较单位错误。** oMLX 是 RAM/SSD 存储层级；vMLX 自己的“五层”示意图实际是 L1 Prefix **或** Paged、L2 Disk **或** Block Disk，加 KV 量化。新版本又有模型原生缓存策略和模式互斥。[O1][V1][V4] | 按“驻留位置/分页复用/量化/持久化/混合架构兼容/失败恢复”比较，不能以 5 > 2 暗示更先进，也不能默认所有机制同时开启。 |
| vMLX 独有分布式 pipeline parallelism（L782、828） | **过时。** oMLX 稳定源码中已有 distributed cluster 文档；状态是 experimental/source-build preview，默认关闭，首个 GUI 激活流程限两台 Mac。[O4] | 两边均列分布式，但 oMLX 注明源码预览、硬件验证边界。单台 M4 Max 不因此变快，也不可据“任意网络可用”推导吞吐优势。 |
| 多种加速功能可以一起叠加使用（横评与部署组合的隐含结论） | **不支持。** oMLX 分布式明确拒绝 DFlash、SpecPrefill、MTP、TurboQuant KV 等组合；vMLX 原生缓存/GLM 并发也有模式门控。[O4][V4] | 建议新增“功能并非任意叠加”的短注，而不是只列功能勾选表。 |
| oQ 就是 GPTQ，且是引擎独有格式（L824、828） | **需细分。** 稳定文档把 oQ 定义为校准驱动混合精度；增强 oQ+ 才增加 GPTQ 权重优化。输出为标准 MLX safetensors、无需专用 loader；release 又使用 oQe 命名。[O8] | 区分基本量化、增强量化与实际模型包版本；“内置转换能力”可以保留，但不要将其模型格式说成其他引擎不能使用。oQ 与 JANG 的精选作者基准不构成同条件对赛。 |
| JANG_2L 74% vs MLX 4-bit 26.5%，MMLU-Pro（L824） | **数据集名称错误；百分数仅确认作者报告。** README/官网均写 MMLU 200q；详见下一节。[J1] | 改数据集名、样本数和证据归属；若正文篇幅有限，删数字，只链接方法及限制。 |
| Smelt 让超过 RAM 的 MoE 可用（L782、828） | **功能确认但风险缺失。** README 限 JANG MoE、排除 dense/非 JANG，且与 VLM 模式互斥。其 credit 段称启动时固定加载部分专家并偏置路由；源码也有 cache-bias routing。不能视为与完整模型等价。[V1][V6] | 明写可能改变模型行为/质量，不能写“无损 SSD offload”。README 上方又有热路径 swap 的表述，与后文固定子集描述不完全一致；具体最新加载/换入机制需实测/维护者澄清。 |
| 单服务器、单端口、零环境隔离成本（L837、841、904、959、1012） | **不支持。** 单端口 Gateway 位于桌面 App，Session Manager 管理模型进程；CLI 音频/图像示例使用不同端口。官方推荐 uv tool、pipx 或 venv；audio/image 是可选依赖。[V1][V5] | 改为“桌面端可统一管理多个模型会话并通过 Gateway 路由，减少手工集成”；单端口不等于单进程，打包环境不等于无环境成本。 |
| vMLX 不需要 PyTorch（L841、942、1050） | **作为整体断言已错误。** `v1.6.64/pyproject.toml` 主依赖有 `torch>=2.3.0`、`torchvision>=0.18.0`，注释涉及 Omni 多模态路径；image extra 引入 mflux。[V5] | 可写“无需自行搭建 Diffusers/ComfyUI 才能使用其已封装的图像功能”，不能写整个安装栈无 PyTorch。 |
| vMLX/mflux 不支持 LoRA/ControlNet 等高级工作流（L841、959、1050） | **笼统说法不成立。** mflux 当前 README 明确有 LoRA、LoRA finetuning、ControlNet Canny、depth、fill 等；这不证明兼容 SDXL 插件，也不证明所有能力已暴露在 vMLX UI/API。[M1] | 区分“mflux 能力”“vMLX 已封装入口”“SDXL/ComfyUI 生态兼容”三层，保留工作流差异，删除全面不支持的措辞。 |
| Flux Klein/图编辑/语音共存都可在 M4 Max 64GB 无压力运行（L838–840） | **模型文档部分确认，设备承诺待核实。** README 有 Flux/Qwen 编辑/Kokoro/Whisper；mflux 有 FLUX.2 4B/9B。此次未完成 vMLX 最新 image 实现的完整抓取及实际兼容验证；更无同机共驻留测试。[V1][M1] | 模型尺寸、量化、KV、分辨率、并发和系统余量要一起算；删“共存无压力”。54GB Qwen 编辑数字只能标 README 估计，不能直接作为本机峰值测量。 |
| vMLX 统一“全部模态”（L904、1012） | **不支持。** 文本、视觉输入、图像生成、音频各有路径；视频输入理解不等于视频生成，STT/TTS 不等于音乐生成。最新 release 仍列 GLM 视频感知错误。[V4] | 改为“已支持的文本、视觉、图像生成及部分音频任务”；视频生成/音乐生成仍按单独模型与运行栈评估。 |
| 二者 OpenAI/Anthropic 兼容，因此上层切换成本很低（L829） | **端点存在确认，等价性不支持。** 两方都持续修复工具参数、streaming、reasoning、Responses、错误传播；客户端和模型模板同样影响结果。[O5][V4] | 列 Chat Completions / Messages / Responses / Ollama 子集，注明并非整个供应商 API。重点验收 tool schema、字符串参数、多轮工具结果、取消、错误终止和 usage。 |
| MLX-LM 没有 API server（L764、849） | **错误。** 官方源码有 `mlx_lm/server.py` 和 `/v1/chat/completions` 路由；自身启动警告“不建议生产使用，只有基本安全检查”。[L1] | 改成“提供基础 server；oMLX 进一步提供管理界面、缓存、调度和多模型运维能力”，而不是“无 API”。“生产级壳”也应改为中性“服务化层”。 |
| 10.3K/313 stars、贡献者、release 数、99,974 基准等（L773、782、821、827、1087–1088） | **旧快照过时，成熟度推断不支持。** 当前仓库 API 为 oMLX 21,965 stars、vMLX 865 stars；dev4 release 作者称平台超过 450,000 条用户基准。[O1][O5][V1] | 推荐正文删除易过时计数。如保留须标查询日、源和“平台自报”，不把提交数当独立样本数。本轮未完整分页统计贡献者/所有 release，不能换成另一个未经核验的总数。 |

## 5. 两组高风险数字的证据审计

### 5.1 JANG：74% vs 26.5%

- **模型/指标**：MiniMax-M2.5，作者官网标 230B；JANG_2L 148/200 = 74%，MLX 4-bit 53/200 = 26.5%，**MMLU（200 题子集）**，不是 MMLU-Pro，也不是全量 MMLU。[J1]
- **口径冲突**：vMLX README 写 JANG 89GB vs MLX 120GB，JANG profile 表的 2L 平均约 2.7 bits；当前 `jangq.ai` 写 82.5GB / 2.10 bits vs 119.8GB / 4.0 bits。这些不能在未核实 checkpoint、统计口径、转换版本前拼成一张精确性能表。
- **方法透明度**：官网提供按科目题数/得分，但本轮可读页面未给出充分的硬件、引擎/依赖版本、完整 checkpoint revision、题目抽样规则、few-shot/template、seed 与完整可复现评测工件。HF 模型卡抓取超时，未能补齐。
- **选择性展示**：官网原话包括“Only the smaller blowout wins”“no close wins, no larger JANG configurations, no estimates”，明确是筛选后的作者案例，而非完整中立比较集。
- **对 64GB 的含义**：无论 82.5 还是 89GB，都已超过 64GB 物理内存，更未计 KV/运行时；本例不证明 M4 Max 64GB 可完整驻留，也不能用 Smelt 的路由变化掩盖质量条件变化。
- **建议措辞**：“JANG 提供混合精度模型；作者在 MiniMax-M2.5 的 MMLU 200 题子集报告较标准量化更高得分，但测试/模型口径尚不足以外推到其他模型或本机选型。”

### 5.2 DFlash：31 → 127 tok/s、4.1×、输出无损

- 旧文引用的是 `bstnxbt/dflash-mlx`，不是同条件 oMLX vs vMLX 对照测试。**本轮当前 README 未找到旧的 127 tok/s 表格，旧历史 README 请求超时；不能据此断言旧数造假，也不能继续把旧数当最新。**[D1]
- 当前 main README 的协议：**M5 Max 64GB、MLX 0.31.1**；stock `mlx_lm.stream_generate` vs DFlash，顺序执行，3 次重复取中位数，60 秒冷却；正文给出一条固定数学函数题 prompt，而不是多任务平均成绩。
- 当前 Qwen3.5-9B 表：输出 1,024 token 时 **30.95 → 135.34 tok/s（表列 4.37×）**；8,192 token 时 **29.43 → 66.94（表列 2.22×）**。表中倍数与直接相除并非处处严格相等；若引用应注明是作者表值，不增加虚假的有效数字。模型/量化须按原行写，不要把 9B 行擅自补成 4-bit。
- 可说明“同一作者协议下，输出长度会改变加速比”，不能把 4.37×升级为通用保证，更不能将 M5 的 NAX 路径直接外推到 M4。
- 当前 README 对“lossless”的定义是每个发出的 token 经过 target 验证；同时明确 **MLX dispatch divergence 仍可能使输出不同于纯 AR**。因此“逐字一致”或“任意采样条件严格等价”都比来源说得更强。
- 当前 oMLX `v0.6.4` 使用自己固定的 dflash fork（pyproject 为 `c55324c86540c369f6818a0f47eae544d405475b`，注释版本 `0.1.10+omlx.7`）；其 DFlash 文档还停留在另一 fork 修订说明。vMLX 又有 `dflash==0.1.0` 的 DFlash 2 bridge。**同名技术不是同一二进制、同一依赖或同一缓存路线。**[O3][O6][V3]
- 社区补充：M1 Max 用户曾在同一约 8.4K agent 请求体上得到 AR 56.74 vs DFlash 19.34 tok/s 的 MoE 对照；后续还讨论 dense 目标和 kernel 原因。另有 2026-08 的 DFlash 2 dtype 个案。只能证明“有反例/硬件敏感”，不是 M4 必然变慢。[D2][C6]

## 6. 最新发布中值得新增、但必须标版本的内容

### oMLX

- **稳定 `v0.6.4`（2026-08-29）**：Qwen3.8-Flash-Next 优化、DFlash/Lightning MTP 多引擎 patch 隔离、GLM-5.3 正确性、prefix/mRoPE 和连续批处理修复；修复 TurboQuant KV 与 Lightning MTP 的客户端错误互斥判断，但保留实际 DFlash/VLM 限制。它不仅是旧文描述的 DFlash 包装。[O2]
- **预发布 `v0.7.0.dev4`（2026-09-18）**：支持部分 adapter 的多请求 Lightning MTP、模型 recipe/基准设置导入、oQe 分层校准、MoE SSD offload 改进、工具调用/XML/Responses 修复，以及 LAN/`0.0.0.0` 绑定必须配置 API key。不能把预发布安全行为反向说成全部稳定版已有。[O5]
- **实验特性需显式标记**：ANE prefill 依赖私有 Apple runtime；分布式默认关闭；dev4 的 CED 默认关闭、近似 bounded replay **可以改变输出**。release 中数百 GiB / M3 Ultra 512GiB 的速度表不适合作为 64GB Mac 的购买/部署承诺。[O2][O4][O5]
- **刚合入但未发版**：`#3760` 于查询窗口 `2026-09-21T00:42:51Z` 合并，恢复 dev4 后的 Qwen VLM decode 性能；此时最新预发布仍是 9 月 18 日的 dev4，不能说“升级到 dev4 已修好”。[C1]

### vMLX

- **`1.6.60`（2026-09-16）**：GLM prefill 优化的默认资格限 **M5 Max + MLX 0.32.2 + 单活动序列**等条件；三组匹配对照、4,305-token 输入，中位数 332 → 426 tok/s（约 28.5%）。这不是 M4 改善或 decode 加速保证。新增模型原生 SSD checkpoint 路径，同样有 paged RAM/序列数门控。[V4]
- **`1.6.61`（2026-09-16）**：保存 native tensor 精度和 packed state，拒绝不匹配缓存链；Qwen 并发位置/稀疏 mask 修复；GLM-5.3 Flash 原生运行时**排队处理并发客户端，只有一个活动序列**，不能把 continuous batching 表格扩展到全部模型。[V4]
- **`1.6.63`（2026-09-18）**：Bonsai 2 的 FP16 activation/KV 与精度感知缓存身份；packed 1.75-bit 在内存中展开成 native 2-bit，官方明确“不是 1.75-bit RAM 声明”。[V4]
- **`1.6.64`（2026-09-19）**：修复 XML 工具调用中 schema 指定的字符串被误解析成对象/数组，并防止错误工具参数使预览崩溃；说明是 focused correctness release，未引入实验 cold-start 优化。[V2]
- **仍有边界**：release 明示 GLM 视频感知错误、模型生成无效工具参数、独立第三方 provider 的 native Responses 验证未完成；`1.6.59` 还说明依赖 advisory 仍在审查，不能宣称无安全告警。不要把模型质量与 transport/cache 修复混为一谈。[V4]
- **未合入示例**：ERNIE-4.5 原生 MTP 的 `#272` 查询时仍 open，`merged_at=null`；不能看到 PR 标题就列入已发布模型清单。[V7]

## 7. 社区证据：个案、确认、修复状态分开记

| 来源 | 报告环境、时间和内容 | 截止查询日状态与能说明什么 |
|---|---|---|
| **[C1] oMLX #3755 / PR #3760** | 2026-09-19 创建；M3 Ultra 96GB、Qwen3.8-Flash-Next-oQ4e-mtp、MTP 关闭，报告 dev4 decode 慢约 7–11%。标题/摘要写 dev2 对比，正文部分表头却写 dev1，且约 128K 的“cold”样本有残余 prefix reuse，不能不加说明重印旧表。维护者 9/19 表示复现、定位 fused GDN 被关闭；用户同日回测 PR 确认改善。 | **维护者确认 + 社区分支复测 + 已合入 main，未进入当前发布标签。** PR 合并时间为 9/21 00:42:51Z。可作为需要区分预发布和 main 的具体例子，而非整套引擎性能排名。 |
| **[C2] oMLX #3706** | 9/16 创建，9/20 更新。oMLX 0.5.7 / macOS 27 / M3 Ultra 512GB，用户认为故障与另一进程主动提交 Metal 工作相关；随后撤回先前调度优先级假说。 | **仍 open；原始根因未确认。** 维护者 9/17 未复现原始 timeout，但添加遇 SubmissionsIgnored 退出以便 supervisor 重启的处理，dev4 release 收录。用户最新回复明确还在旧 0.5.7，未验新补丁。只能写改善不可恢复故障处理，不能写底层 GPU 问题已解决。 |
| **[C3] oMLX #3777** | 9/20 创建；稳定 0.6.4 / M1 Max 32GB / macOS 26.5.1，约 60K+ 自然语言长 prompt 可能只输出 `!`；给出 prompt 构造与对照，称 8-bit TurboQuant 在其测试中规避。 | **open、社区个案、尚无维护者确认或本轮复现。** 标题所说“KV corruption”不应作为已确认根因；不能据此给 M4 用户要求改全局缓存参数。 |
| **[C4] vMLX #255** | 8/12 创建，初报 1.6.24 embeddings 固定截断 512 token；报告者 8/23 复测称已修，长后缀不同得到 cosine 0.798、相同输入对照 1.0。 | **issue 仍 open，但不是可继续列举的未修复现状。** `v1.6.64/embedding.py` 已按 tokenizer/model context 取可用上限，仅无元数据时 fallback 512，并有长输入分批。体现不能仅按 open/closed 判断修复。[V8] |
| **[C5] vMLX #261** | 8/22 报 1.6.35 在 temperature>0 时 native MTP 被 gate 阻止；M3 Max 128GB、jundot 的 Qwen3.8 oQ4e-mtp 模型。 | **8/28 维护者确认修复并关闭。** 提供 M5 Max、同家族但不同 JANG_4D 模型、温度 0.8 的 3 次请求及真实 MTP acceptance；还明确不是报告者原模型。修复机制有证据，但不是所有转换/采样的全矩阵保证。 |
| **[C5b] vMLX #267 / #266** | 9/2 报 Qwen3.8-Flash-Next 并发时 BatchKVCache 丢 sparse index lane，`update_index` 报错。 | **9/2 维护者确认 main 修复并关闭**，当时原话“下个 release 发布”；用 JANG_4S、4 并发做了前后验证。本轮不凭关闭状态指定首次发布版本；最新 release 的后续并发修复亦不能推导全模型并发认证。 |
| **[C5c] vMLX #263** | 8/26 创建；实际环境为 1.6.27、48GB、Qwen3.6-35B-A3B-4bit；报告约 16K+ 工具调用丢失、24–27K 内存暴涨；有日志和排查，报告正文还带自动化草稿残留。 | **open、0 评论，未获维护者确认。** 需记录具体旧版本，不得写成最新 1.6.64 必然存在；属于长上下文和混合 SSM 路径的回归测试候选。 |
| **[C6] dflash-mlx #60** | 8/20 创建；M1 Max 64GB/macOS 26.5.2、`0.1.10+omlx.6`、Qwen3.8-27B / DFlash2；用户两次重复、512 token 对照，默认激活精度路径 0% acceptance、0.44×，w4a32 为 70.1%、1.39×。作者披露报告经 AI 辅助整理，称数字来自机器复测。 | **open、0 评论，社区个案。** 有对照比无方法宣传更有价值，但 dtype 根因仍属报告者诊断；不外推到原生 bf16 的 M4，不据此要求用户更改设置。 |

没有找到并完成审阅的、**同一 M4 Max 64GB / 相同权重 / 相同请求 / 相同缓存状态**的当前 oMLX-vMLX 独立横评。因此不依据 issue 数量判胜负，也不把作者自测、平台提交量或 stars 当性能认证。

## 8. 安装与运维建议应怎样改写

- **只给计划，不在本轮执行。** oMLX 当前官方要求 macOS 15+、Python 3.11–3.13；vMLX 当前 PyPI 要求 Python 3.11–3.14，最新桌面下载区分 Tahoe 默认构建和 Sequoia 兼容构建。Studio README 仍写 macOS 14+，与最新构建说明不能混读；其他系统版本是否可用需看实际包要求。[O1][O3][V2][V5]
- 桌面 DMG 自带环境可以减少用户手动管理，但 CLI 应用 `uv tool` / `pipx` / `venv` 做隔离。正式文章若保留 zsh 命令，应给 extras 加引号，例如 `pip install 'vmlx[image]'`，并放在受支持的隔离环境中；这不是本轮安装建议。[V1]
- oMLX 自定义 native kernel 源码构建需完整 Xcode/Metal toolchain，Command Line Tools 不等价；官方 README 称 DMG 包含预编译 kernels。未经构建核实，不写“所有安装路径同速”。[O1]
- “单 API 端口”应说明 Gateway 路由与后端进程/模型内存相加的关系。64GB 下优先测一个主力模型，再测需要的图像或音频任务，禁止以“模型文件之和小于 64”作为安全并发结论。
- 不为取分自动提高 wired memory、关闭认证或打开实验 kernel。vMLX README 的 `0.0.0.0` 示例与可选 API key 不适合原样当安全默认；建议文章示例优先 loopback，局域网暴露单独解释鉴权。
- 签名/公证只是发布说明的声明，本轮未下载 DMG 做 Gatekeeper 检查；Apache-2.0 也不代表所有依赖无漏洞。研究记录不构成安装安全审计。

## 9. 初始建议的文章更新范围（后续获准执行见第 12 节）

### P0：应直接纠正的事实与过度承诺

1. L822、884、904、1012：取消“oMLX 只文本/VLM”和“vMLX 全部模态”，补音频支持/视频生成区别。
2. L824：MMLU-Pro → 作者 MMLU 200q；删除或收紧 74/26.5 的泛化结论。
3. L826：PyObjC → Swift/SwiftUI；删除未经来源支持的 GUI RAM 差值。
4. L828、884：删除“独有能力”标签；补双方 DFlash/MTP/分布式的模式限制。
5. L849：修正 MLX-LM 没有 server 的说法。
6. L841、942、959、1012、1050：删除零隔离/无 PyTorch 的整体承诺，改为统一管理与可选依赖。
7. L952、994、1043：不再把 Qwen3-14B 和 DFlash 加速默认绑定。

### P1：补充最有价值的新信息

- 第 4 节表头加“查询日/稳定版/预发布版”，不再用 release 数量和 stars 作为主要维度。
- 缓存横评改为同口径维度，新增“原生混合状态、持久化恢复、并发限制、失败可观测性”。
- 增补 1 段 API/tool calling 实际兼容边界，引用最新 XML 字符串修复和 Responses 限制。
- 参考文献 [19]–[21] 用版本化 release/docs/源码补充，而不是一个滚动 README 承担所有断言。
- 性能建议改为条件式：LLM/API 运维场景可先比较 oMLX 的管理与缓存；需要集成图像和多会话桌面工作流可比较 vMLX；**音频、DFlash 已不能充当二选一分界线**。

### P2：仍需证据，暂不写成确定事实

- M4 Max 64GB 同模型同量化下的冷/热 TTFT、prefill/decode、端到端延迟、峰值进程内存/Metal active、SSD 写入、并发公平性。
- Qwen3-14B 可用 DFlash draft 与两个引擎的真实支持状态；不能把相邻型号支持视为通用支持。
- 最新 vMLX 对 FLUX.2 Klein/Kontext、mflux ControlNet/LoRA 的具体 API/UI 暴露与端到端成功率。
- JANG 精确模型卡 revision、完整评测脚本/样本/硬件；Smelt 不同 expert 比例的客观质量损失与当前换入机制。
- oMLX/vMLX GUI 的空载和多进程总内存；双方音频模型及可选依赖与 DMG 的一致性。
- 全部端点与第三方客户端矩阵、稳态长时间运行与取消/恢复测试。

若后续授权实测，应先固定硬件、macOS、引擎/依赖、权重 hash、prompt/tokenizer、thinking/采样、输出长度、cache 命中情况和并发数，再比较 AR / MTP / DFlash 分组；报告首 token 与完整请求时间，不只看 tok/s。**此清单是待验证计划，本轮未执行。**

## 10. 可追溯来源索引

所有来源访问日期均为 **2026-09-21**。除查询窗口明确使用北京时间外，来源时间按 GitHub/PyPI 的 **UTC** 记录。日期是来源发布时间/评论时间或所属发布标签日期；README main/官网未标独立更新时间时明确不臆造。短引文与数值已摘录在正文；issue 仅公开读取，未发言。

关键发布页的 API 更新时间：oMLX `v0.6.4` 为 `2026-08-29T17:08:35Z`，`v0.7.0.dev4` 为 `2026-09-18T11:29:17Z`；vMLX `v1.6.64` 为 `2026-09-19T05:37:39Z`。release 正文可能在发布后编辑，因此正文与发布资产应分别理解。

### 官方仓库、发布与实现

- **[O1] oMLX 官方仓库 / README / 元数据**（main 快照，单独 README 日期未标）：[仓库](https://github.com/jundot/omlx)、[查询时 main README](https://github.com/jundot/omlx/blob/e4c762bb5ec6780aa75f48c6c5342f9472876be5/README.md)、[API](https://api.github.com/repos/jundot/omlx)。证据类型：维护者文档/仓库元数据。
- **[O2] oMLX 稳定发布**：[v0.6.4，2026-08-29](https://github.com/jundot/omlx/releases/tag/v0.6.4)、[v0.6.3，2026-08-27](https://github.com/jundot/omlx/releases/tag/v0.6.3)、[latest API](https://api.github.com/repos/jundot/omlx/releases/latest)。证据类型：正式 release，内含作者硬件基准，非独立评测。
- **[O3] oMLX v0.6.4 实现**：[audio_routes.py](https://github.com/jundot/omlx/blob/v0.6.4/omlx/api/audio_routes.py)、[pyproject.toml](https://github.com/jundot/omlx/blob/v0.6.4/pyproject.toml)、[Swift App](https://github.com/jundot/omlx/tree/v0.6.4/apps/omlx-mac)。所属标签 2026-08-29；证据类型：已发布标签源码/目录树，非本机执行结果。
- **[O4] oMLX 分布式限制**：[v0.6.4/docs/distributed-cluster.md](https://github.com/jundot/omlx/blob/v0.6.4/docs/distributed-cluster.md)。所属标签 2026-08-29；证据类型：版本化实验功能文档，明确 source-build preview。
- **[O5] oMLX v0.7.0.dev4**：[2026-09-18 预发布说明](https://github.com/jundot/omlx/releases/tag/v0.7.0.dev4)。证据类型：预发布说明；不可当稳定版。
- **[O6] oMLX DFlash 支持表**：[v0.6.4 Integration Report](https://github.com/jundot/omlx/blob/v0.6.4/docs/experimental/dflash_mlx_integration.md)。文档内日期 2026-07-28，读取自 8/29 标签，部分 dependency 说明比 pyproject 旧；证据类型：版本化文档。
- **[O7] oMLX 初次 DFlash release**：[v0.3.5，2026-04-15](https://github.com/jundot/omlx/releases/tag/v0.3.5)。证据类型：历史正式发布。
- **[O8] oQ 定义**：[v0.6.4/docs/oQ_Quantization.md](https://github.com/jundot/omlx/blob/v0.6.4/docs/oQ_Quantization.md)。所属标签 2026-08-29；证据类型：官方技术说明/作者基准。
- **[V1] vMLX 官方身份、README 和架构**：[仓库](https://github.com/jjang-ai/vmlx)、[查询时 main README](https://github.com/jjang-ai/vmlx/blob/d9229d20e9f2a98e870711a01be4f07c60cfd942/README.md)、[仓库 API](https://api.github.com/repos/jjang-ai/vmlx)。README 未单标更新时间；证据类型：维护者声明，存在旧徽章/过时摘要。
- **[V2] vMLX / Studio 发行关系**：[vMLX v1.6.64](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.64)、[Studio v1.6.64](https://github.com/jjang-ai/mlxstudio/releases/tag/v1.6.64)、[Studio README](https://github.com/jjang-ai/mlxstudio/blob/main/README.md)。两 release 均 2026-09-19；证据类型：正式发布、下载通道说明、来源与摘要声明。
- **[V3] vMLX DFlash 2**：[版本化 CHANGELOG](https://github.com/jjang-ai/vmlx/blob/v1.6.64/CHANGELOG.md)、[DFlash2 bridge](https://github.com/jjang-ai/vmlx/blob/v1.6.64/vmlx_engine/dflash2_runtime.py)。changelog 对应 1.6.34 为 2026-08-20，源码标签日期为 9/19；证据类型：发布历史 + 已发布实现，吞吐句子仍是作者自报。
- **[V4] vMLX 近期维护发布**：[1.6.59（9/15）](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.59)、[1.6.60（9/16）](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.60)、[1.6.61（9/16）](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.61)、[1.6.62（9/18）](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.62)、[1.6.63（9/18）](https://github.com/jjang-ai/vmlx/releases/tag/v1.6.63)。年份均 2026；证据类型：正式 release，含明确已知限制。
- **[V5] vMLX 依赖/安装**：[PyPI JSON](https://pypi.org/pypi/vmlx/json)、[v1.6.64 pyproject](https://github.com/jjang-ai/vmlx/blob/v1.6.64/pyproject.toml)、[audio guide](https://github.com/jjang-ai/vmlx/blob/v1.6.64/docs/guides/audio.md)。包上传/标签日期 2026-09-19；证据类型：包元数据、版本化依赖与文档。
- **[V6] Smelt**：[v1.6.64 smelt_loader.py](https://github.com/jjang-ai/vmlx/blob/v1.6.64/vmlx_engine/utils/smelt_loader.py)，并参照 [V1] 的 Smelt 段。标签 2026-09-19；证据类型：源码 + 维护者说明，未做质量/加载行为复测。
- **[V7] 未合入 ERNIE PR**：[#272](https://github.com/jjang-ai/vmlx/pull/272)，更新于 2026-09-11，查询时 open / 未合并；证据类型：提案，不能当发布能力。
- **[V8] embeddings 修复实现**：[v1.6.64 embedding.py](https://github.com/jjang-ai/vmlx/blob/v1.6.64/vmlx_engine/embedding.py)，标签 2026-09-19；证据类型：发布源码。

### 作者基准、社区及交叉核验

- **[J1] JANG 作者数字**：[jangq.ai](https://jangq.ai)、[vMLX README](https://github.com/jjang-ai/vmlx/blob/d9229d20e9f2a98e870711a01be4f07c60cfd942/README.md)。官网未标可核验的测试/更新日期；证据类型：作者筛选的基准展示，不是独立横评。[HF 模型卡](https://huggingface.co/JANGQ-AI/MiniMax-M2.5-JANG_2L)本轮抓取超时，未将其内容计入证据。
- **[D1] DFlash 协议与限制**：[固定 main README](https://github.com/bstnxbt/dflash-mlx/blob/60803233af4589e18588b9bacbb03880801c828a/README.md)、[v0.1.10 release](https://github.com/bstnxbt/dflash-mlx/releases/tag/v0.1.10)。main 提交 2026-08-20、release 6/11；README benchmark 无独立测量日期，不能以提交日替代测量日。证据类型：作者自测与方法声明。
- **[D2] 长 agent 请求反例**：[dflash-mlx #32](https://github.com/bstnxbt/dflash-mlx/issues/32)，创建 2026-05-11、最新评论 8/20；[同请求体 AR 对照，5/12](https://github.com/bstnxbt/dflash-mlx/issues/32#issuecomment-4430623479)。证据类型：社区同机对照、维护者讨论；仍 open。
- **[C1] oMLX 回归与合入**：[#3755](https://github.com/jundot/omlx/issues/3755)、[维护者确认](https://github.com/jundot/omlx/issues/3755#issuecomment-5742513257)、[用户回测](https://github.com/jundot/omlx/issues/3755#issuecomment-5743526783)、[PR #3760](https://github.com/jundot/omlx/pull/3760)。日期/版本见第 7 节；证据类型：社区 + 维护者确认 + merge API。
- **[C2] Metal 故障恢复**：[#3706](https://github.com/jundot/omlx/issues/3706)、[9/20 澄清与最新复测范围](https://github.com/jundot/omlx/issues/3706#issuecomment-5753681452)。证据类型：旧版本社区报告、维护者防御性修复，不是根因修复认证。
- **[C3] 长上下文异常输出**：[#3777](https://github.com/jundot/omlx/issues/3777)，2026-09-20；证据类型：未确认社区报告。
- **[C4] embeddings issue 与用户验证**：[#255](https://github.com/jjang-ai/vmlx/issues/255)、[8/23 修复回报](https://github.com/jjang-ai/vmlx/issues/255#issuecomment-5385336245)。证据类型：社区前后对照，与 [V8] 相互印证。
- **[C5] sampled MTP**：[#261](https://github.com/jjang-ai/vmlx/issues/261)、[8/28 维护者确认与限制](https://github.com/jjang-ai/vmlx/issues/261#issuecomment-5453290385)。证据类型：维护者复现/修复声明，有不同 checkpoint 限制。
- **[C5b] 并发 sparse cache**：[#267](https://github.com/jjang-ai/vmlx/issues/267)、[9/2 修复评论](https://github.com/jjang-ai/vmlx/issues/267#issuecomment-5511639331)。证据类型：维护者复现与 main 修复说明。
- **[C5c] hybrid 长上下文风险**：[#263](https://github.com/jjang-ai/vmlx/issues/263)，2026-08-26；证据类型：未确认旧版本社区报告。
- **[C6] DFlash 2 精度反例**：[#60](https://github.com/bstnxbt/dflash-mlx/issues/60)，2026-08-20；证据类型：未确认社区对照报告。
- **[M1] mflux 能力交叉核验**：[公开 README](https://github.com/filipstrand/mflux/blob/main/README.md)。本轮从该官方旧入口的 raw README 成功读取，文内已有 mflux-community 引用；未冻结其 release 或独立更新时间，**仅用于否定“上游没有 LoRA/ControlNet”的笼统断言，不用来保证 vMLX 已集成**。
- **[L1] MLX-LM server**：[官方 server.py](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/server.py)。2026-09-21 读取 main，未冻结发行版；证据类型：官方实现，确认 API server 存在及自身生产安全警告，不比较性能。

## 11. 初次研究阶段的证据缺口与交付验收

- 公开网络可用，但部分 raw/Hugging Face 请求发生超时；主要 GitHub 数据通过 API/版本化文件补齐。未成功获取 JANG HF 模型卡、旧 dflash v0.1.5 README、oMLX 稳定 README 与 vMLX image_gen 全文；对应缺口已限制结论，未用“没抓到”推断“不支持”。
- 没有对贡献者/发布总数做完整分页；不再沿用旧文计数，也不伪造新计数。
- 社区检索本轮主要限公开 GitHub 问题与评论；未宣称已全面搜索 Reddit、论坛或视频，更未把未经查阅的第三方传言当证据。
- 只新增本 Markdown；临时抓取材料不作为正式项目文件保留。验收使用 `git status --short --untracked-files=all`、`git diff --check`、针对新文件的 `git diff --no-index --check /dev/null docs/research/omlx-vmlx-update.md`，以及 `git diff --exit-code HEAD -- posts/m4-max-local-models/index.html` 确认改动边界；不以普通 `git diff` 的空输出冒充未跟踪文档已被检查。
- 初次文档研究没有代码变更，因此当时未运行全仓 JS/静态测试，也未重复任何 GPU/模型数值实验。后续文章修改的检查单独记录如下。

## 12. 用户确认后的精简更新与五类能力表

### 12.1 授权及实际范围

用户要求不要让两平台对比喧宾夺主，先确认更新方案；随后追加文字、向量、图像、视频、音频能力表，并明确“先改吧”。因此本阶段修改 `posts/m4-max-local-models/index.html`，不再停留于建议。

- 八个平台总表：用五类具体能力替换主观“高/最高”评分；保留使用形态与适用场景。文字=生成，向量=Embedding，图像/视频=生成而非输入理解；音频单独注明 TTS/STT。远程 provider 不计本地能力。
- 表格统一给出“—=本轮官方资料未列入口”“待核=证据不足”的口径；不是看到文档没写就断言技术不可能。可选组件和源码主线工具显式区分。
- oMLX/vMLX 比较从 9 段压缩至 3 段（共同能力、主要区别、选择建议）；相邻多模态说明从 5 段压缩至 3 段。未新增发布历史、社区故障章节或模型盘点。
- 同步移除后文的独有能力、固定加速倍数、全部模态、零环境成本和 Qwen3-14B 默认 DFlash 承诺；主力模型选型不重排。
- 修正 MLX-LM server、Swift/SwiftUI、音频与环境依赖说明，补参考文献 [22]–[23]。
- 仅改本文章局部内嵌样式，保证宽表横向滚动；未改共享 CSS/JS、知识目录、其他文章或工作区。
- 第四章去标签/去空白后的可见字符数由约 **5,341 降至 3,300**（粗略文本统计，不是浏览器排版长度），新增能力维度同时缩短说明。

### 12.2 其余六个平台的补核（2026-09-21 11:36 起，北京时间）

官方滚动文档未注明页面更新日期的，记查询日，不臆造发布时间；没有逐个宣称“已在最新稳定包运行”。oMLX/vMLX 继续采用初次研究的稳定标签证据。

| 平台 | 本轮实际读到的来源与核心证据 | 表格采用的边界 |
|---|---|---|
| Ollama | [README](https://github.com/ollama/ollama/blob/main/README.md)、[文档索引](https://docs.ollama.com/llms.txt)、[Embeddings](https://docs.ollama.com/capabilities/embeddings.md)、[Vision](https://docs.ollama.com/capabilities/vision.md)。官方有文本生成、`/api/embed` 向量和视觉输入。 | 文字/向量支持；未在已读官方入口中确认图像、视频或音频生成，标“—”；不把第三方 UI/工具集成视为引擎内置生成。 |
| LM Studio | [完整文档汇编](https://lmstudio.ai/llms.txt)，实际读取了 OpenAI API 端点、SDK embedding 等段落；明确 `/v1/embeddings`、Python/JS embedding model 接口及聊天文字/图像输入。 | 文字/向量支持；图像输入不是图像生成。其余生成入口在本轮已读文档未列，标“—”，不按 llama.cpp 新功能推定桌面包已集成。 |
| MLX-LM | [官方 README](https://github.com/ml-explore/mlx-lm/blob/main/README.md)，结合前阶段 server.py。其职责为 LLM 推理、量化与训练等，不等同于整个 MLX 软件生态。 | 文字支持；没有据 mlx-audio / mlx-vlm / mlx-embeddings 等其他项目给 MLX-LM 本身打多模态或向量勾。 |
| llama.cpp | [server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)、[mtmd](https://github.com/ggml-org/llama.cpp/blob/master/tools/mtmd/README.md)、[TTS](https://github.com/ggml-org/llama.cpp/blob/master/tools/tts/README.md)、[diffusion 示例](https://github.com/ggml-org/llama.cpp/blob/master/examples/diffusion/README.md)。server 提供 embeddings；mtmd 有音频/图像输入；主线 `llama-tts` 文档提供 Qwen3-TTS/Pocket TTS 音频文件生成示例。diffusion 示例实际是 **Diffusion Text Generation**。 | 文字/向量支持；音频注明“主线工具 TTS”，不能写成没有音频，也不能写成通用 TTS HTTP API。diffusion 不计图像生成。未下载编译或验收 release。 |
| Jan | [README](https://github.com/janhq/jan/blob/main/README.md)、[本地 API 文档](https://github.com/janhq/jan/blob/main/docs/src/pages/docs/desktop/api-server.mdx)、[embedding 抽象](https://github.com/janhq/jan/blob/main/core/src/browser/extensions/engines/embedding.ts)、[provider 默认向量设置](https://github.com/janhq/jan/blob/main/web-app/src/hooks/useDefaultEmbeddingModel.ts)、[audio-sentinel](https://github.com/janhq/jan/blob/main/web-app/src/lib/audio-sentinel.ts)、[本地 HTTP 实现](https://github.com/janhq/jan/blob/main/src-tauri/plugins/tauri-plugin-llamacpp/src/engine/http.rs)。明确有本地 Chat API；向量抽象/provider 设置与音频输入序列化代码本身不足以证明发行包暴露了本地 embedding/TTS/STT 路径。 | 文字支持；向量本地接口待核；音频注明主线输入适配、本地 TTS/STT 待核。不把抽象方法或云端 provider 能力当成功验收。 |
| GPT4All | [官方 README](https://github.com/nomic-ai/gpt4all/blob/main/README.md)、[桌面 API](https://docs.gpt4all.io/gpt4all_api_server/home.html)、[Python 源码](https://github.com/nomic-ai/gpt4all/blob/main/gpt4all-bindings/python/gpt4all/gpt4all.py)。直接确认 `class Embed4All` / `embed()`，LocalDocs 使用向量；桌面 API 文档列 models/completions/chat，并未同样列 embeddings。 | 文字支持；向量明确 LocalDocs/Python SDK，不伪称桌面 HTTP Embeddings 端点。其余生成入口在本轮已读官方资料未列，标“—”。 |

可复查指纹：本轮 Git Trees API 返回 Jan 根目录树 SHA `af0ddc39012b7b23f2fe791724afc1ddd388156b`、llama.cpp 根目录树 SHA `ce8caa6e60a03093351d6016a818720e0d46f0fb`，两者 `truncated=false`；这些是**目录树 SHA，不是 release 标签**。TTS README blob SHA 为 `1b08d5ef32183103c44d3f244a3def37455a2d69`；GPT4All Python 文件 blob SHA 为 `84b236c996dca56383f20399327b3f2f8ad9ac87`。

网络限制：部分 raw.githubusercontent.com 请求超时后，用 GitHub Contents API 成功取得相应文件。Jan `llms.txt` 未成功；GPT4All 的两条旧 Python 文档 URL 实际返回同一首页，不将该首页冒充 Embedding 专页，最终以实际 Python 源码确认能力。未调用模型或任何付费 API。

### 12.3 文章验证

- `node tests/verify-change.js --article m4-max-local-models --level L2`：**PASS**（validator、worktree diff、staged diff、changed-files）。这是文章范围的确定性检查，不是全仓测试、IDE diagnostics 或所有浏览器场景均已通过。
- 已用现有 Chromium headless、隔离临时 profile 和 CDP pipe 直接打开本地 `file://` 页面，未启动 HTTP 网站服务/模型服务，未安装浏览器依赖；屏蔽外部 HTTP(S) 请求。检查并实际查看中文桌面亮色/暗色、390px 窄屏和演示模式矩阵页截图。
- DOM 检查：8 个平台行、8 列，各行列数一致；所有 `#ref-*` 引用有目标。
- 宽度检查：1440px 视口下页面宽度 1440、表格 1198；390px 视口下页面宽度 390、滚动区 356、表格 1040，可横向滚动到 684px，无整页横向溢出。
- 折叠区开/关/再开正常；oMLX/vMLX 比较正文为 3 段。演示模式第 6/11 页能显示完整矩阵及口径说明，未发现该页内容裁切。
- 未运行完整双语全 deck 或 PPTX 导出/LibreOffice 渲染，不把局部浏览器检查等同于完整导出认证；未修改演示共享运行时或导出实现。
- 临时抓取文件、测试脚本、截图与浏览器 profile 均清理；只保留正式文章和本研究记录。没有 commit、push、模型环境修改或推理实验。

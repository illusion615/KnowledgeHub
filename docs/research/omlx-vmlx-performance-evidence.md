# oMLX / vMLX 外部性能评测证据：吞吐、首 token 延迟、缓存与内存

> 查询时间：**2026-09-21 18:55–19:01，北京时间（UTC+8）**。用户要求根据外部评测判断性能差异，不自行猜测。初次查询只读取公开资料、保存研究记录；用户随后明确要求补入比较小节，**19:16 起更新正式文章**，见第 10 节。全程没有运行本机模型、安装引擎或启停模型服务。
>
> 结论：找到了 **2026-09-16/17 的第三方同机、同模型/同量化直接对照**。结果不是一方全面领先：部分解码场景 oMLX 更快，短 prompt 与另一模型的缓存命中延迟 vMLX 更低。但仅为单台 **M2 Max 64GiB** 的特定版本/协议，不能直接推广到用户的 M4 Max 64GB、Qwen3-14B 或双方最新最优设置。

## 1. 核心来源与证据等级

核心来源为第三方仓库 [JasonRandazza/OhYesMLX](https://github.com/JasonRandazza/OhYesMLX)。查询时 main 提交为：

- `2915d56565bff39ca3273cabac171c9e05908a35`
- 提交时间：`2026-09-18T20:36:07Z`
- 下文 [P1]–[P7] 链接固定到该提交，避免滚动文档改变引用含义。

**为什么采用：**报告给出了相同 artifact 的运行时横切面、版本、硬件、采样/预热/重复次数，以及失败和修正记录；源码还提供启动参数和模型 snapshot。因此比不同平台 README 的各自峰值更适合回答本问题。

**为什么不能当最终认证：**这是单个第三方项目作者的测量报告，并非多个独立实验室复现。公开仓库中**没有其 `results/*.jsonl` 原始实测文件**：报告明确说运行目录 gitignored，Git tree 中也没有这些结果文件。本轮能核对报告表格、方法和 harness，但不能重算每个样本或独立验证测量真实性。README 的“honest”“sealed”“publishable”等自述不增加独立可信度。

## 2. 两者的直接对照：解码吞吐

### 测试背景

- 硬件：MacBook Pro **M2 Max、64GiB 统一内存、macOS 26.6.2**。[P1]
- 运行时：本系列记录为 **oMLX 0.6.4 / vMLX 1.6.59**；不是截至查询日的 vMLX 1.6.64 新版复测。[P3][P4]
- 稠密模型：`mlx-community/Qwen3.5-4B-4bit`，stock 4-bit snapshot **`0e7ffd5c629ef7719d4cbc04069232580bfa9d9c`**；两运行时指向相同 artifact，不拿 oQ 与 JANG 的不同权重来比较。[P1][P7]
- MoE：**LFM2.5-8B-A1B**，8B 总参/1B active、32 experts、top-4；按相同 stock 4-bit 行比较。[P2]
- 协议：temperature 0、seed 0、每 cell 9 次测量；plateau warmup（5 样本窗口、3% 阈值、floor 10/cap 20），cooldown 30s。decode 工作负载上限 512 输出 token，chat 工作负载上限 128 输出 token。[P1][P2]
- 公开启动适配器显式关闭 vMLX JIT/native MTP，并将服务活动序列数固定为 1；这不是两方开满优化的峰值测试。[P7]

| 相同模型/量化下的工作负载 | oMLX | vMLX | 可以支持的读法 |
|---|---:|---:|---|
| Qwen3.5-4B stock 4-bit，512-token decode 工作负载 | **75.9 tok/s** | **75.6 tok/s** | 差约 **0.4%**，应视作接近/平手，不应排名。[P1] |
| Qwen3.5-4B stock 4-bit，128-token chat 工作负载的解码速率 | **88.9 tok/s** | **77.1 tok/s** | 该协议下 oMLX 约高 **15.3%**；不是完整聊天请求总耗时快 15.3%。[P1] |
| LFM2.5-8B-A1B stock 4-bit，512-token decode 工作负载 | **159.6 tok/s** | **133.3 tok/s** | 该模型/协议下 oMLX 约高 **19.7%**，不能推成全部 MoE 或全部模型。[P2] |

百分比为从作者公布的四舍五入数值计算：`oMLX / vMLX - 1`。不是新测量，也不增加小数精度背后的可信度。

### 重要的历史修正

[P1] 前半部分保留了 **固定 warmup=3 的旧表**，作者随后明确判定该跨运行时排名无效：有引擎仍在预热，甚至有一轮 oMLX 测试窗口内同时发生其他本机工作。必须使用文档后半 **“The re-measured grid, 2026-09-16”**。

本记录采用的是重测后的 `75.9 / 75.6`、`88.9 / 77.1`，**不是**前面的 `75.9 / 74.9`、`87.9 / 81.2`。作者也明确说几个百分点的相邻差值应视作 tie；不能因为表内用 `>` 符号就宣布具有显著差异。

## 3. 首 token 延迟：短 prompt 与长 prompt 的胜负不同

[P3] 固定同一个 **Qwen3.5-4B-oQ4**：

- artifact：`RepublicOfKorokke/Qwen3.5-4B-oQ4`，snapshot **`3ae88a7d17b1c6bb71b795c1090948a82508fdb8`**，模型文件合计 3,160,559,814 bytes。[P7]
- oMLX 0.6.4 / vMLX 1.6.59，单并发；temperature 0、seed 0、同一源文按长度截取，plateau warmup，9 次测量，输出上限 64 token，冷却 30s。
- 这里是**已预热模型、未命中 prefix cache 的请求 TTFT**，不是从启动进程/加载权重开始的冷启动时间。作者核对过没有缓存命中造成 TTFT 虚低。

| prompt 目标长度 | oMLX TTFT p50 | vMLX TTFT p50 | 解读 |
|---|---:|---:|---|
| 128 token | **0.728s** | **0.404s** | vMLX 少等约 **0.324s**。 |
| 1,024 token | **2.586s** | **2.171s** | vMLX 少等约 **0.415s**。 |
| 4,096 token | **8.141s** | **9.020s** | oMLX 少等约 **0.879s**。 |
| 16,384 token | **36.848s** | **41.203s** | oMLX 少等约 **4.355s**。 |

对应作者按 `实际 prompt tokens / TTFT` 计算的**请求可感知 prefill 速率**：4K 时 oMLX **503** vs vMLX **454 tok/s**；16K 时 **445** vs **398 tok/s**。这包括固定请求开销，不应当成纯 kernel 吞吐。

32K 的 vMLX cell 存在失败，作者标 **FAIL、不参与排名**。后续打开特定 hybrid chunked prefill 环境变量，3 个单请求 probe 成功，但作者明确没有证明与原路径输出等价，也没有得到可替换原 9 样本结果的同协议重测。因此本记录不把 32K 成功样本单独挑出来排名，也不据旧 1.6.59 个案宣布最新 1.6.64 同样失败。[P6]

## 4. 缓存复用：有真实差异，也有非常容易误读的配置差异

### 4.1 可以引用的非 hybrid 对照

[P5] 对 **`brainworkup/Llama-3.1-8B-oQ4`** 做相同 artifact 对照：snapshot `a041336af01fe59ffe17c762d4c970564dcabc53`，目标 4,096 / 实际 4,089 prompt token，64 输出上限，9 次测量、单并发、同机；oMLX 0.6.4 / vMLX 1.6.59。

| 状态 | oMLX TTFT p50 | vMLX TTFT p50 |
|---|---:|---:|
| prefix cache 关闭、请求重新 prefill | **19.495s** | **16.440s** |
| 同 prompt、prefix cache 开启并命中 | **0.529s** | **0.419s** |

这组里 **vMLX 两项更低**；热请求少约 0.110s。但这只是同 prompt 重复请求，不等于真实 agent 每次追加工具结果的多轮 workload，也不是所有模型都能得到同一倍率。

### 4.2 不能引用成“oMLX 比 vMLX 快 17 倍”的 hybrid 对照

[P4] 的 Qwen3.5-4B-oQ4、4K 测试得到：

- oMLX：cache off **8.487s** → on **0.487s**。
- vMLX：off **8.283s** → on **8.260s**。

**原始结果可记录，但不能当两平台缓存能力极限对决。**报告和 [P7] 启动代码说明：

- vMLX 测试始终使用 `--disable-block-disk-cache`，且未开启 paged RAM；这些恰好是该版本 hybrid 路径可用的 cache 后端。
- oMLX `on` 则允许其 paged SSD cache，在每次重启的独立 scratch 中测试。
- 因此此处测到了“该模型在这个 harness 配置下是否有可用缓存”，并非证明 vMLX 在正常配置下不能缓存 hybrid 模型。
- `prompt_tokens / 0.487s` 之类结果是缓存查找/恢复的表观速率，不能写成模型重新计算 prefill 达到几千 tok/s。

对 agent 选型真正重要的是实际模型、实际后端能否命中及追加上下文的恢复成本，不能只比较“都有 prefix cache”的勾选项，也不能借不对称后端制造平台级倍率。

## 5. 并发、内存、功耗：暂不足以下平台级结论

### 并发/总吞吐

该项目另有 [并发报告](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-16-concurrency-omlx.md)，给出 8 客户端时 oMLX 72.5 / vMLX 72.1 aggregate tok/s，并写出很强的“none batch”结论。

**本轮源码复核发现，不应转述该强结论：**公开 `runtimes.py` 的 oMLX 命令固定 `--max-concurrent-requests 1`，vMLX 固定 `--max-num-seqs 1`。适配器 `start_command()` 不接收 workload concurrency；增加客户端请求数没有对应提高这些服务端上限。仅这种配置就能解释排队/近似串行，不能证明两引擎的连续批处理实现不会扩展。

另外 N=1 引用的是更早一轮 grid，作者说不是同 pin join。故这份并发报告仅记录为**不满足平台并发优劣判断条件**，不取两行极接近的数值当正式并发横评。

### 内存

作者单独调查了 [`phys_footprint` 口径](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-16-footprint-is-not-one-quantity.md)：不同 runtime 的 Metal / wired / resident 归属不同，表面 RSS 或 footprint 不一定代表同一种实际系统成本。文档还撤回先前“file-backed 是根因”的假说，并披露旧 Osaurus 进程残留。

这不能证明 oMLX/vMLX 的内存一定无法比较，但意味着本批表格不足以稳健认定“某平台省 X GB”。需要一致的系统增量、进程树/Metal 指标和模型驻留口径，不能借单列峰值排序。

### 功耗

本轮没有找到并核验可直接用于 oMLX/vMLX 同机同权重对照的功耗结果。其他引擎的 tok/s/W 不转借给 vMLX。

## 6. 其他候选资料为何未用于两者胜负

| 来源 | 本轮实际发现 | 处理 |
|---|---|---|
| [asiai 的 Qwen3.8-27B 八引擎对照](https://github.com/druide67/asiai/blob/main/docs/qwen38-27b-engine-choice.md) | 发布 2026-08-16、更新 9/2；有 M5 Max、吞吐/缓存延迟表，但明确写 **vmlx 与 vllm-mlx 未能完成测量**。此前 latency 还因持久缓存污染重新标记为 resumed session；量化、调优不对称。 | 可作为方法警示，**不能填入 vMLX 一栏或作为两者直接评测**。 |
| [Weschera 的 M4 Max oMLX 实测](https://github.com/Weschera/Qwen3.8-27B-oMLX-MTP-Mac) | 作者报告 2026-08-21，M4 Max **128GB**、oMLX 0.6.3rc2、ANE + MTP、Qwen3.8-27B，53.3 prose / 72.1 code tok/s；提供原始 JSON，本轮读取了 `ane-mtp3-results.json`。 | 与用户芯片接近，但内存/模型不同，且**没有 vMLX 对照**；不能拿另一作者的 vMLX 峰值硬拼。其表内 vllm-metal 也不是本任务的 vMLX。 |
| [mlx-Chronos](https://github.com/igurss/mlx-chronos) | README 的支持列表包含 **waybarrios/vllm-mlx**，不是 jjang-ai/vmlx；有 TTFT/request throughput 方法定义。 | 不能混淆项目名称，也未据此声称已经存在当前两者横评。 |
| [llm_context_benchmarks](https://github.com/ivanfioravanti/llm_context_benchmarks) | 确实有 oMLX/vMLX benchmark adapter，但 output gitignored，本轮仓库树未找到公开配对输出。README 还说明多次重复的 decode/prefill **分别取峰值**。 | 工具支持不等于已发表评测；分别取峰值也不能当同一次请求的性能组合。 |
| [vMLX #37](https://github.com/jjang-ai/vmlx/issues/37#issuecomment-4283326360) | 2026-04-20 维护者自报 M4 Max 128GB：Qwen3.6-JANGTQ2 67.5、MiniMax 44、Nemotron 130 tok/s 等，未给同条件 oMLX 对照。 | 这是**维护者声明**，不是独立横评，不进入核心表。 |
| GitHub 搜索命中的大量 `osaurus-ai/vmlx-swift` 性能 PR | 另一 Swift runtime，常有 56–62、90+ tok/s 等数字。 | 不并入 Python `jjang-ai/vmlx` 的实测成绩。 |
| `brainworkup/oMLX-vMLX-LLM-Models`、其他运维/框架仓库 | README 命中双方名称，但未提供可立即核验的同条件性能对照；运维笔记也大量混有 vllm-mlx、Osaurus 与不同权重。 | 不将仓库名称或使用经验冒充 benchmark。 |

## 7. 对用户选择的含义

1. **应收回“LLM 为主就自然选 oMLX”的性能暗示。**功能定位是使用习惯建议，不是速度证据；数据表明胜负随模型和请求形态变化。
2. 对上述第三方协议，**oMLX 有部分 decode 优势**：Qwen3.5-4B 短输出约 +15%，LFM2.5 MoE 约 +20%；但同一 dense 模型的 512-token sustained decode 基本持平。
3. **vMLX 有部分延迟优势**：该 Qwen 的短 prompt 首 token 更快，Llama-3.1-8B 的冷 prefill / 热缓存请求也更快。速度与 TTFT 不能混成一个“性能”评分。
4. **目前不能断言用户 M4 Max 64GB + Qwen3-14B 上谁领先**：本轮核心对照既不是该硬件，也不是该模型；vMLX 版本已到 1.6.64，作者没有提供同协议新版重测；JIT/native MTP 又不是最佳调优配置。
5. 如果用户需要统一图像/语音工作流，现有证据不支持为了一个笼统的“oMLX 更快”结论而放弃 vMLX。反之，如果目标是某个固定 LLM 的响应性能，应找该模型、该硬件与相关缓存路径的证据，而不是按功能数量或精选峰值选引擎。

**初次查询没有自动把这组 M2 数据写入正式文章。**用户随后明确要求补充，已采用精简表格与条件式结论，详细方法仍留在本 MD，执行情况见第 10 节。

## 8. 固定来源索引

以下文档均查询于 2026-09-21，版本固定为第三方仓库提交 `2915d56565bff39ca3273cabac171c9e05908a35`；文件名/正文日期是作者报告日期，本轮没有将其当自身实测日期。

- **[P1]** [2026-09-16：dense joined grid，采用后半 corrected/re-measured 表](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-16-phase5-joined-grid.md)。硬件、预热纠错、9 次测量和 dense decode/chat 对照。
- **[P2]** [2026-09-16：LFM2.5-8B-A1B MoE format/runtime axis](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-16-moe-format-axis.md)。相同 stock4bit 行的 runtime 对照。
- **[P3]** [2026-09-16：prompt-length sweep](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-16-prompt-length-sweep.md)。版本、tokens、TTFT p50/p90、失败与方法。
- **[P4]** [2026-09-17：hybrid cache split](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-17-cache-state-split.md)。必须连同后端关闭条件阅读，不能据 headline 写“快17倍”。
- **[P5]** [2026-09-17：non-hybrid Llama cache split](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-17-cache-state-split-nonhybrid.md)。同权重冷/热请求的 TTFT 对照。
- **[P6]** [2026-09-17：vMLX 32K chunked prefill follow-up](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/docs/research/2026-09-17-vmlx-32k-chunked-prefill.md)。单请求 probe 不能替换多次测量的失败 cell；未证质量等价。
- **[P7]** [模型 snapshot 与列定义](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/scripts/gridspec.sh)、[启动适配器](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/ohyesmlx/runtimes.py)、[dense runner](https://github.com/JasonRandazza/OhYesMLX/blob/2915d56565bff39ca3273cabac171c9e05908a35/scripts/run_grid.sh)。仅读取源码，**未执行任何脚本**。

## 9. 搜索覆盖与验证边界

- GitHub Issues 搜索 `"omlx" "vmlx" benchmark`、双名称、`repo:jjang-ai/vmlx "tok/s"`；Repositories 搜索 `omlx benchmark`、`vmlx benchmark`、`"vmlx" "omlx" in:readme`。这些是查询时索引命中，不代表穷尽互联网。
- Google / DuckDuckGo / Brave 的匿名 HTTP 搜索请求超时；Bing 返回了与查询无关的汽车页面结果，已排除，不计作评测证据。核心发现来自可直接读取的 GitHub 资料。
- 保留作者修正与证据局限，未复刻“所有引擎不 batch”“memory 排名”“缓存快17倍”等超出协议的结论。
- 初次查询阶段未编辑正式 HTML；原有用户已授权的文章修改仍保留。查询临时资料已清理，不提交推送。

## 10. 用户授权后的文章补充（2026-09-21）

用户确认这些信息有直接辅助选型的价值，并要求放入 oMLX vs vMLX 等对比小节。此次改动仍集中在第四章：

- 原比较小节改为“功能取舍与外部性能实测”，先说明统一聊天/生图/语音管理与分栈方案的区别，不再暗示 oMLX 自己可以生图。
- 加入 **6 行、4 列**精简表：3 行同权重解码吞吐，3 行不同输入长度的 TTFT。省去信息重复的 1K 输入行，未引用失败的 32K 行，也未使用旧预热不足的成绩。
- 表前注明 M2 Max 64GiB、macOS、引擎版本、日期、单并发、temperature/seed 与 9 次测量；表后注明 vMLX JIT/native MTP 关闭、逐请求原始数据未公开及不外推 M4/Qwen3-14B。
- 缓存只补一例 Llama-3.1-8B-oQ4 热请求 TTFT（0.529 vs 0.419 秒），明确是另一模型和重复请求，不混入未命中缓存表。
- 开发者建议卡同步写出“部分 decode 与 TTFT 的胜者不同”，不引入跨平台内存、功耗、并发总排名。
- 新增正式参考文献 [24]–[25]，全部评测链接固定到已核查 commit；没有把性能记录展开为新章节。
- 第四章可见字符粗略统计约 **4,040**，仍少于原始基线的 **5,341**；前三章原始内容保持不变。

验证：

- `node tests/verify-change.js --article m4-max-local-models --level L2`：PASS；`git diff --check`：通过。
- 静态确认所有 id 唯一、`#ref-*` 引用有目标；前三章相对 HEAD 无内容变化。
- 现有 Chromium 的隔离 profile / CDP pipe，直接读取 `file://` 页面并屏蔽外部 HTTP(S)：核对桌面亮色/暗色、390px 窄屏，实际检查截图；6 行数值与研究记录逐项一致，各行均 4 列。
- 桌面 1440px 页面无横向溢出，表格宽 1148px；窄屏页面宽 390px、容器 306px、表格 760px，局部横向可滚动 454px。折叠区内容高度与 scrollHeight 相等（桌面 755px、窄屏 1587px），表后限制/结论没有被折叠高度裁掉；开关折叠正常。
- 演示模式能进入“引擎选型细节”并读取新增表格；没有做全 deck / PPTX 导出认证，亦未改共享演示布局。滚动时现有固定页标题可能覆盖段首，阅读模式未见此问题，不将局部截图视为整个演示系统验收。
- 仅更改正式文章与研究记录，临时校验脚本/截图/profile 清理；未提交推送，未安装、启停或调用推理引擎。

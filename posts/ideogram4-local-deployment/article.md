---
title: Ideogram 4 开源模型解读与双机本地部署评估
eyebrow: Ideogram 4 · Open-Weight Local Deployment
brand: 模型
date: 2026-06-27
strict_i18n: false
strict_density: true
lead: "Ideogram 于 2026-06-03 发布了其首个开源权重文生图模型 Ideogram 4[1]。本评估先拆解其架构与能力构成——9.3B 单流 DiT、以 Qwen3-VL-8B 作为文本编码器、flux2 VAE、结构化 JSON 提示接口；再据此衡量两台目标设备能否本地运行：**MacBook Pro M4 Max 64GB**（Apple Silicon，仅 Metal/MPS）与 **Intel PC + RTX 3090 24GB**（Windows，CUDA）。评估按「能否装下、有无成熟运行栈、提示链路是否完整」三条判据展开。"
hero_actions:
  - "先看模型解读 | #model"
  - "直接看双机结论 | #verdict"
panel_label: 核心结论
panel_title: 两台设备都能本地运行 Ideogram 4，但路径不同：RTX 3090 走 CUDA 原生 nf4，M4 Max 走 fp8/bf16 的 MPS 路线。
panel:
  - RTX 3090 24GB 是更顺的路径：nf4 量化专为 CUDA 设计，文本编码器顺序加载并 offload 后，24GB 显存余量充足。
  - M4 Max 64GB 不缺内存——统一内存可同时容纳 DiT 与 Qwen3-VL；瓶颈在 MPS 运行栈成熟度，以及缺少 fp8/nf4 加速带来的速度折损。
  - nf4 版本限定 CUDA，M4 Max 不可用；两机的共同可用版本是 fp8。
  - 共同约束：权重在 Hugging Face 受 gate、许可为非商业、提示词需结构化 JSON（magic-prompt 远程 API 免费，或本地 upsampling 额外占内存）。
metrics:
  - "模型规模 | 9.3B + 8B | DiT 主干 9.3B + Qwen3-VL-8B 文本编码器"
  - "量化版本 | 2 档 | nf4（CUDA 专用）/ fp8（全平台）"
  - "评估设备 | 2 台 | M4 Max 64GB / RTX 3090 24GB"
  - "许可 | 非商业 | Ideogram 4 Non-Commercial，权重受 gate"
style:
  accent: "#a855f7"
---

## #model 01 / Model Breakdown :: 先看模型是什么：从零训练的单流 DiT，以视觉语言模型作文本编码器

评估能否本地运行之前，先确定要装进设备的到底是哪些组件。Ideogram 4 是一个从零训练（非微调、非蒸馏）的 flow-matching 文生图模型，采用全单流 Diffusion Transformer 架构[1]。它与常见 SDXL/FLUX 路线最大的结构差异，是用一个完整的视觉语言模型替代了 CLIP/T5 文本编码器，核心架构可拆解为 4 项关键构成。

:::insight-grid { cols: 2 }
::card 01
### 单流 DiT 主干（9.3B）
文本与图像 token 拼接为同一序列，经过同一个 34 层 Transformer 处理，没有独立的文本或图像分支，使跨模态交互在每一层都发生[1]。

::card 02
### VLM 作文本编码器
文本编码器为 Qwen3-VL-8B-Instruct，从其 13 个中间层提取隐藏状态并拼接，提供从表层 token 到深层组合理解的多尺度语义特征[1][6]。

::card 03
### 结构化 JSON 提示
模型只用结构化 JSON caption 训练，原生支持 bbox 布局坐标、十六进制色板（colour_palette）与构图分解；纯文本提示可用但效果次于 JSON[1]。

::card 04
### VAE 与灵活分辨率
VAE 为 flux2-vae；原生支持 256 到 2048（16 的倍数）任意分辨率，长宽比可达 6:1，噪声调度随分辨率自适应[1][3]。
:::

:::accordion
::panel
### 双分支 CFG 与组件清单（影响显存预算）
Ideogram 4 采用双分支 classifier-free guidance：条件（正）与无条件（负）分支可独立细化，分别控制提示遵循度与画质[1]。ComfyUI 重打包版本据此给出了完整的组件文件清单，正是本地部署需要下载的内容[3]：

- `diffusion_models/ideogram4_fp8_scaled.safetensors` — DiT 主干（条件分支）
- `diffusion_models/ideogram4_unconditional_fp8_scaled.safetensors` — 无条件分支
- `text_encoders/qwen3vl_8b_fp8_scaled.safetensors` — Qwen3-VL-8B 文本编码器
- `vae/flux2-vae.safetensors` — VAE

由此可知：本地运行远不止加载单个 9.3B 权重，实际涵盖 DiT 主干 + 无条件分支 + 8B 文本编码器 + VAE 四件套，显存/内存预算必须按四者叠加计算。

::panel
### 核心能力：文字渲染、布局控制、色板条件
在标准开源基准上，Ideogram 4 在文字渲染（X-Omni OCR）、布局控制（7Bench）、空间推理（SpatialGenEval）与提示对齐（Prism）上整体逼近闭源模型；官方称在 7Bench 布局控制上优于其所测的全部闭源模型，且以 9.3B 参数提供了其所测开源权重发布中最强的文字渲染——领先于 Qwen-Image（20B）、FLUX.2 dev（32B）、HunyuanImage 3.0（80B MoE）[1]。

对本地部署的含义：Ideogram 4 的核心价值在「带文字的设计图、海报、版式」类任务；这类任务恰恰最依赖结构化 JSON 提示与高分辨率（2048），也因此对运行栈的内存与稳定性提出更高要求。各基准排名均引自官方模型卡披露的第三方与内部评测，非本地实测结果。
:::

:::callout { title: "过渡：" }
**过渡：**组件清单确定后，下一步是把四件套换算成显存/内存占用，并看清两档量化（nf4 / fp8）各自的平台限制——这决定了两台设备分别能用哪一条路径。
:::

## #footprint 02 / Resource Footprint :: 把四件套换算成内存：两档量化决定平台可用性

基于四件套组件清单，可按参数量推算理论内存占用，并对照官方 Model Zoo 的两档量化。这张总览是后续设备判断的基础：先看清「每档版本有多重、限定什么平台」，再分机展开。

| 量化版本 | 精度 | 支持平台 | DiT 权重（估算） | 文本编码器 | RTX 3090 | M4 Max |
| --- | --- | --- | --- | --- | --- | --- |
| Ideogram 4 (nf4) | 4-bit (NF4) | 仅 CUDA | 约 5–6 GB | Qwen3-VL-8B | 可用 | 不可用 |
| Ideogram 4 (fp8) | 8-bit FP | 全平台（CUDA / MPS / CPU） | 约 9.3 GB | Qwen3-VL-8B（fp8 约 8 GB / bf16 约 16 GB） | 可用 | 可用 |

- **DiT 主干 9.3B。**fp8 约 1 byte/参数 → 约 9.3 GB；nf4 约 0.5 byte/参数 → 理论约 4.65 GB，叠加量化元数据后约 5–6 GB。双分支 CFG 另有无条件分支文件，需额外计入。
- **文本编码器 Qwen3-VL-8B。**fp8 约 8 GB；若以 bf16 加载约 16 GB。它只在编码阶段需要常驻，可在编码后 offload，为 DiT 让出显存。
- **VAE flux2-vae。**体量较小，约数百 MB；解码阶段才介入，可用分块（tiled）解码降低 2048 分辨率下的峰值。
- **激活与 latent。**随分辨率上升急剧膨胀，2048×2048 的峰值激活内存是显存压力的主要来源；本次评估未实测该峰值，按「1024 宽松、2048 需 offload/tiling」定性处理。

:::callout { title: "关键判据：" }
**关键判据：**nf4 是 4-bit 量化，依赖 bitsandbytes 的 CUDA 内核，因此**仅 CUDA 平台可用**——这一条直接把 M4 Max 推向 fp8 路线，而把 RTX 3090 留在显存最省的 nf4 路线上。两机的分歧由此确定。
:::

## #verdict 03 / Two-Device Verdict :: 双机总览：先给结论，再分机展开

结合资源占用与平台限制，将两台设备并排对照三条判据（能否装下、运行栈成熟度、提示链路），即可得出可运行性判定。结论是「都能跑、路径不同」；判定细节与操作路径在 4、5 两节按设备逐一展开。

:::comparison
::versus Device B · 更顺路径 { highlight: true }
### Intel PC + RTX 3090 24GB（Windows / CUDA）
具备 CUDA，可直接使用为之设计的 nf4 版本；24GB GDDR6X 在顺序加载文本编码器后足以容纳 DiT 与激活。是两机中运行栈最成熟、最省心的一台。

- 能否装下：充足（nf4 DiT 约 6 GB + 编码器 offload）
- 运行栈：成熟（diffusers CUDA / ComfyUI 原生）
- 分辨率：1024 宽松；2048 需顺序 offload 或分块解码

::versus Device A · 内存够，栈待验证
### MacBook Pro M4 Max 64GB（macOS / MPS）
无 CUDA，nf4 不可用，须走 fp8（计算时回退到 fp16/bf16）。64GB 统一内存远超需求，可同时容纳 DiT 与 Qwen3-VL；真正的不确定项是 MPS 上新管线的成熟度与速度。

- 能否装下：充足（统一内存可同时常驻全部组件）
- 运行栈：待验证（MPS 路线较新，缺 fp8/nf4 加速）
- 分辨率：1024 可行；2048 取决于实现稳定性
:::

| 判据 | RTX 3090 24GB | M4 Max 64GB |
| --- | --- | --- |
| 可用量化 | nf4（首选）或 fp8 | 仅 fp8（计算回退 fp16/bf16） |
| 能否稳定装下 | 能（24GB 显存，需顺序 offload 编码器） | 能（64GB 统一内存，余量大） |
| 运行栈成熟度 | 高（CUDA 一等公民） | 中（MPS / 社区 Mac 应用） |
| 预期速度（定性） | 较快（CUDA + 4-bit 内核加速） | 较慢（无低精度算子加速） |
| 2048 高分辨率 | 可行（需 offload/tiling） | 取决于实现稳定性 |
| 总判定 | 推荐，主力路径 | 可行，作为补充/离线路径 |

## #device-b 04 / RTX 3090 Path :: RTX 3090 24GB：CUDA 原生 nf4，最省心的主力路径

顺着双机总览结论，先看 RTX 3090 上的具体部署路径。核心思路是利用 CUDA 的 4-bit 内核把显存压到最低，并让 8B 文本编码器「用完即让位」，从而把 24GB 显存留给 DiT 与高分辨率激活。

:::flow
1. **接受 gate 并认证** — 在 Hugging Face 打开 `ideogram-ai/ideogram-4-nf4` 接受非商业许可，创建 token 后 `hf auth login` 或导出 `HF_TOKEN`，否则下载报 GatedRepoError[2]。
2. **选运行栈** — 两条成熟路径：官方 `ideogram4` 仓库的 `run_inference.py`（`--quantization nf4`），或 ComfyUI + Comfy-Org 重打包文件（diffusion_models / text_encoders / vae 分目录放置）[3][5]。
3. **顺序加载省显存** — 先加载 Qwen3-VL-8B 完成文本编码，再 offload 到内存/磁盘，腾出显存加载 nf4 DiT 与无条件分支。nf4 DiT 约 6 GB，编码器 offload 后 24GB 余量充足。
4. **提示链路** — 用 magic-prompt 把口语提示扩成结构化 JSON：默认调用 Ideogram 免费托管 API（`IDEOGRAM_API_KEY`），也可改用本地 LLM 或自带 JSON[1]。
5. **分辨率与采样** — 1024 直接出图；追高质量按官方建议设 `--height 2048 --width 2048` 与 `V4_QUALITY_48` 预设，此时配合顺序 offload 与分块 VAE 解码以控峰值[1]。
:::

:::accordion
::panel
### 为什么 24GB 足够：显存预算明细
以 nf4 路径估算峰值（理论值，非实测）：编码阶段 Qwen3-VL-8B 约 8 GB（fp8）或 16 GB（bf16），此阶段 DiT 尚未加载；编码结束后立即 offload，进入扩散阶段时显存主要由 nf4 DiT（约 6 GB）+ 无条件分支 + 激活/latent 构成。1024 分辨率下激活开销适中，24GB 余量宽松；2048 分辨率下激活内存陡增，建议启用顺序 offload 与分块 VAE 解码。结论：在不追求一次性全程常驻所有组件的前提下，RTX 3090 24GB 是宽松而非临界。

::panel
### fp8 备选：何时改用 fp8 而非 nf4
nf4 是 4-bit 量化，画质相对 fp8 可能有轻微损失。若对画质更敏感且愿意承担更高显存占用，可在 RTX 3090 上改用 fp8 版本：DiT 约 9.3 GB + 文本编码器顺序加载，24GB 仍可容纳，但 2048 高分辨率时显存更紧张，需更激进的 offload。日常迭代用 nf4、终稿用 fp8 是一种务实折中。两档量化之间的画质差异尚未在本地环境量化对比。
:::

## #device-a 05 / M4 Max Path :: M4 Max 64GB：内存不是问题，运行栈成熟度才是变量

再看 M4 Max 64GB 上的部署路径。与 RTX 3090 相反，这里内存极其宽裕、可同时常驻全部组件，真正需要验证的是 MPS 后端管线是否稳定、速度是否可接受。站内前置研究《M4 Max 64GB 本地模型部署选型》已确立 Apple Silicon 的通用判据：优先 Metal/MPS 一等公民栈、警惕 CUDA 专属优化的迁移折损[8]。

:::flow
1. **只能用 fp8** — nf4 依赖 CUDA 内核，在 MPS 不可用；M4 Max 须下载 fp8 版本。fp8 在 Apple GPU 上无原生算子加速，计算时回退到 fp16/bf16，权重以 fp8 存储节省内存但不提速。
2. **选 Mac 友好的运行栈** — 两条路径：diffusers 的 `Ideogram4Pipeline` 走 `.to("mps")`；或社区 Mac 应用（HF 页面提供 Draw Things / DiffusionBee 的一键导入入口）。后者对 Apple Silicon 适配更省心，但是否已支持 Ideogram 4 取决于社区进度，需以应用内实际可用为准[2][7]。
3. **内存放置** — 64GB 统一内存可同时容纳 DiT（bf16 约 18 GB）+ Qwen3-VL-8B（bf16 约 16 GB）+ VAE，合计约 35–40 GB，无需 offload 即可常驻，留有充足余量。内存不是 M4 Max 的约束项。
4. **提示链路二选一** — 远程 magic-prompt（免费、不占本地内存、需 `IDEOGRAM_API_KEY`），或本地 upsampling（diffusers 提供 `Ideogram4PromptEnhancerHead` + Qwen3-VL-8B 头，完全离线但额外占内存、质量略降）[2]。
5. **分辨率策略** — 先以 1024 验证管线在 MPS 上是否稳定出图，确认后再尝试 2048。把 M4 Max 定位为「补充/离线创作」而非高频生产，与其速度特性匹配。
:::

:::accordion
::panel
### 真正的瓶颈：MPS 成熟度与速度，而非内存
Ideogram4Pipeline 为新发布管线，官方示例以 `.to("cuda")` 给出；MPS 路径需把设备改为 `mps`，其稳定性取决于 diffusers 对该管线的 MPS 适配进度，发布初期可能存在算子缺失或回退到 CPU 的情况。即使跑通，由于缺少 fp8/nf4 低精度加速，单张生成时间预计明显长于 RTX 3090（此处不列具体秒数，避免伪造本机速度）。因此 M4 Max 的合理定位是「能跑、适合离线批量或验证」，而非「交互式高频迭代主力」。

::panel
### 更省心的 Mac 路径：优先试社区原生应用
相比手工配置 diffusers + MPS 环境，Draw Things 等 Apple Silicon 原生应用通常封装了 Metal 优化与模型管理，对非工程化使用更友好；HF 模型页已内置一键导入入口[2]。务实建议：先试社区原生应用是否已支持 Ideogram 4 fp8，能用则省去环境搭建；若尚未支持，再回到 diffusers + MPS 的手工路径。具体适配进度以应用内实际可用状态为准，此处不作额外背书。
:::

## #setup 06 / Setup & Boundaries :: 落地建议：分机推荐配置与必须满足的运行前提

汇总模型体积与双机运行栈分析，可确立两台设备各自的推荐起步配置，并梳理三条容易被忽略、却会直接阻断运行的前提条件。建议遵循「RTX 3090 主力、M4 Max 补充」的分工。

:::comparison
::versus 主力 · RTX 3090 { highlight: true }
### 推荐起步配置
- 版本：Ideogram 4 nf4（日常迭代）/ fp8（终稿）
- 运行栈：ComfyUI（Comfy-Org 重打包）或官方 run_inference.py
- 显存策略：编码器顺序加载 + offload
- 提示：远程 magic-prompt（免费）
- 分辨率：1024 迭代，2048 出终稿（开 tiling）

::versus 补充 · M4 Max
### 推荐起步配置
- 版本：Ideogram 4 fp8（唯一可用）
- 运行栈：先试社区原生应用，回退 diffusers + MPS
- 内存策略：全组件常驻，无需 offload
- 提示：远程 magic-prompt，或本地 upsampling（离线）
- 定位：离线/批量创作，先 1024 验证稳定性
:::

:::accordion
::panel
### 三条运行前提（缺一即阻断）
1. **权重 gate 与许可** — 权重在 HF 受 gate，须先接受 Ideogram 4 Non-Commercial 许可并用 token 认证；许可为**非商业**，任何商业用途不适用本地权重[1][2]。
2. **提示链路** — 模型只在 JSON caption 上训练。要拿到理想效果，要么接 magic-prompt（远程免费或本地 upsampling），要么自行按 schema 写 JSON；纯文本提示可用但效果次之[1]。
3. **安全筛查（仅 CLI 路径）** — 官方 `run_inference.py` 的提示与产物安全筛查经由 Hive，需 `HIVE_TEXT_MODERATION_KEY` / `HIVE_VISUAL_MODERATION_KEY`；diffusers/ComfyUI 路径不强制此项[1]。

::panel
### 一句话回放：全篇评估结论链
Ideogram 4 = 9.3B 单流 DiT + Qwen3-VL-8B 文本编码器 + flux2 VAE + JSON 提示（1. 模型构成）→ 四件套换算后 nf4 约 5–6 GB、fp8 约 9.3 GB，nf4 限 CUDA（2. 资源换算）→ 故 RTX 3090 走 nf4、M4 Max 只能 fp8，两机皆可装下（3. 双机总览）→ RTX 3090 顺序 offload 后 24GB 宽松，是主力（4. CUDA 路径）→ M4 Max 内存充足但受 MPS 成熟度与速度限制，作补充（5. MPS 路径）→ 部署时遵守 gate/许可、补全 JSON 提示链路、按需配置 Hive（6. 运行前提）。
:::

## #references 07 / References :: 参考来源

- [1] Ideogram AI. — https://huggingface.co/ideogram-ai/ideogram-4-fp8 | 官方模型卡：单流 34 层 DiT、flow-matching、Qwen3-VL-8B 文本编码器（取 13 中间层）、双分支 CFG、256–2048 灵活分辨率、JSON 提示与 magic-prompt、Hive 安全筛查、Model Zoo（nf4/fp8，9.3B）、第三方与内部评测结论。支撑架构拆解、能力评估、量化版本与提示链路全部论断。
- [2] Ideogram AI. — https://huggingface.co/ideogram-ai/ideogram-4-nf4 | nf4（4-bit、CUDA、9.3B、非商业）版本说明、gate 与认证流程、diffusers 远程/本地 upsampling 示例、Draw Things / DiffusionBee 导入入口。支撑 nf4 平台限制、gate 认证、提示链路与 Mac 应用路径。
- [3] Comfy Org. — https://huggingface.co/Comfy-Org/Ideogram-4 | ComfyUI 重打包文件清单：ideogram4_fp8_scaled / ideogram4_unconditional_fp8_scaled / qwen3vl_8b_fp8_scaled / flux2-vae，以及各自的放置目录。支撑四件套组件构成与显存预算。
- [4] Ideogram AI. — https://ideogram.ai/blog/ideogram-4.0/ | 官方技术博客与发布说明（2026-06-03 发布开源权重与推理代码）。支撑发布时间与开源定位。
- [5] Ideogram AI. — https://github.com/ideogram-oss/ideogram4 | 官方推理仓库：run_inference.py、quantization 参数、sampler 预设、安装方式与文档（inference / prompting / model_architecture / safety）。支撑 CLI 部署路径与采样建议。
- [6] Qwen Team. — https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct | Ideogram 4 所用文本编码器的原始模型卡，说明其作为视觉语言模型的规模与能力背景。支撑文本编码器内存估算。
- [7] Hugging Face. — https://huggingface.co/docs/diffusers/optimization/mps | Apple Silicon 上 diffusers 的 MPS 支持、attention slicing 与 PyTorch 版本要求。支撑 M4 Max 走 MPS 路线及其成熟度警示。
- [8] illusion615. | 站内前置文章，确立 Apple Silicon 本地部署的通用判据（优先 Metal/MPS 一等公民栈、警惕 CUDA 专属优化迁移折损）。支撑对 M4 Max 运行栈的定位。

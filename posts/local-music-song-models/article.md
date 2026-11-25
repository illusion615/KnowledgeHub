---
title: 本地部署文生音乐与文生歌曲大模型全景探索：架构拆解、M4 Max 64GB 实测与选型顾问 || Local Text-to-Music and Text-to-Song Models: Architecture Anatomy, M4 Max 64GB Benchmarks, and Selection Guide
eyebrow: Open-Weight Audio Models · Local Deployment || Open-Weight Audio Models · Local Deployment
brand: Study Room AI Research || Study Room AI Research
date: 2026-11-24
strict_i18n: true
strict_density: true
lead: 从动辄十几分钟才能挤出一段模糊旋律的早期实验，到十秒内渲染三分钟高保真双语流行全曲，本地开源音乐与歌曲模型在过去一年完成了代际跨越。本文结合真实权重仓审计与多档硬件基准，系统拆解三大技术范式，专项回答 MiniMax-Music3 在 MacBook Pro M4 Max 64GB 与 24GB 独显上的部署边界，配套交互选型顾问，并附上一首真实技术说唱曲目从 64 行平淡念经到 39 行黄金切分单曲的高动态重编实战 [1][9][10]。 || Open-weight music and full-song models now synthesize three-minute bilingual tracks locally within seconds to minutes. Auditing raw repository weights and multi-tier hardware benchmarks, we dissect three generative paradigms, evaluate MiniMax-Music3 on M4 Max 64GB and 24GB GPUs, provide an interactive advisor, and walk through a production songwriting case study transforming a flat 64-line rap draft into a punchy 39-line golden-pocket single [1][9][10].
panel_label: 硬件边界与架构全景 || Hardware Boundaries & Architecture Panorama
panel_title: 一台工作站跑通词曲编唱全链路 || Full-Song Synthesis on a Local Workstation
panel_desc: 围绕长程曲式规划、高保真声学流匹配与开源商用许可三条主线，精准锚定每档显存与统一内存的最优落地路线 [1][2]。 || Mapping long-range song structure, flow-matching acoustics, and commercial licensing onto concrete VRAM and unified-memory budgets [1][2].
panel:
  - MiniMax-Music3 实测拆解 — 57.35 GB 双轨原仓 vs 28.51 GB 模块化管线 vs 13.87 GB MLX mxfp8 || MiniMax-Music3 Audit — 57.35 GB dual-track repo vs 28.51 GB modular BF16 vs 13.87 GB MLX mxfp8
  - 三代生成主干对比 — 白盒乐谱自回归 (YuE2)、分层连续隐态 (Music 3) 与 8 步流匹配 (ACE-Step) || Three Backbones — Symbolic CoT (YuE2), Hybrid-LM Hidden Fusion (Music 3), and 8-Step Flow (ACE-Step)
  - 商用协议红线排雷 — 厘清 MIT、Apache-2.0、年营收上限社区许可与 CC-BY-NC 非商用边界 || License Guardrails — Separating MIT and Apache-2.0 freedom from revenue-capped and CC-BY-NC weights
metrics:
  - M4 Max 甜点权重体积 || M4 Max Sweet-Spot Checkpoint | 13.87 GB | MiniMax-Music3-mxfp8 原生 MLX 量化包，64GB 统一内存零卸载常驻仅占约 18.5 GiB || MiniMax-Music3-mxfp8 native MLX checkpoint, peaking around 18.5 GiB in 64GB unified memory
  - 极速全曲合成耗时 || Fastest 180s Song Latency | < 10 s | ACE-Step 1.5 (2B Turbo) 在 RTX 3090 上 8 步蒸馏采样实测耗时约 9.5 秒 || ACE-Step 1.5 (2B Turbo) 8-step distilled sampling measured at ~9.5 s on RTX 3090
  - 覆盖主流开源模型族 || Audited Model Families | 8 大体系 || 8 Families | 囊括 MiniMax-Music3、ACE-Step、YuE2、DiffRhythm、HeartMuLa、Magenta RT2、Stable Audio 与 MusicGen/JASCO || Covers MiniMax-Music3, ACE-Step, YuE2, DiffRhythm, HeartMuLa, Magenta RT2, Stable Audio, and MusicGen/JASCO
style:
  accent: "#ea580c"
  teal: "#0d8f8c"
---

## #paradigms 01 / Paradigm Evolution :: 从 30 秒器乐切片到 5 分钟全曲演唱：三大生成范式分野 || From 30-Second Loops to 5-Minute Full Songs: Three Generative Paradigms

两年前在本地显卡上跑通一段纯器乐采样，创作者面对的往往是 32 kHz 单声道切片与超过 30 秒就迅速涣散的节拍记忆 [8]。进入 2025 至 2026 年，开源社区终于跨过了「带词全曲合成」这道分水岭：模型既要在三到五分钟跨度内守住前奏、主歌、预副歌、副歌与尾奏的调式统一，又要把中英文歌词清晰咬在强弱拍上，同时输出 32 kHz 至 48 kHz 立体声母带纹理 [1][3]。 || Two years ago, local audio generation meant 30-second mono loops whose rhythm drifted quickly [8]. Between 2025 and 2026, open-weight models crossed into full-song vocal synthesis: maintaining intro-verse-chorus-bridge coherence up to five minutes, aligning bilingual lyrics onto musical beats, and decoding 32 kHz to 48 kHz stereo waveforms [1][3].

围绕「长程结构谁来管」与「高频音色怎么算」这对核心矛盾，当前可本地部署的文生歌曲与文生音乐模型分化出了三条截然不同的工程路线 [1][2][3]。 || Resolving the tension between long-horizon musical structure and high-frequency acoustic fidelity has split local song and music models into three distinct engineering architectures [1][2][3].

:::figure { src: "./media/music-paradigms-architecture.figure.json", drawio: "./media/music-paradigms-architecture.drawio", title: "本地文生歌与文生音乐三大生成范式拓扑拆解 || Three Generative Backbones for Local Song and Music Synthesis" }
图 1：多模态歌词与曲风条件输入经由「白盒乐谱自回归」「分层连续隐态融合」或「极速潜空间流匹配」三大主干后，统一汇入连续潜空间常微分求解器与立体声声码器完成波形重建 [1][2][3]。 || Figure 1: Multimodal lyric and style inputs pass through Symbolic AR-NAR, Hybrid-LM Hidden Fusion, or Fast Latent Flow backbones before converging on flow-matching solvers and stereo waveform decoders [1][2][3].
:::

:::insight-grid { cols: 3, title: "三大技术路线的物理权衡 || Trade-Offs Across Three Generative Routes" }
::card 01
### 白盒乐谱思维链（YuE2 / MusicGen） || Symbolic Lead-Sheet CoT (YuE2 / MusicGen)
YuE2-3B 在吐出音频语义令牌前，先生成可读可改的 ABC 文本乐谱，显式规划和弦走向与主旋律音高 [3]。这种先写谱再演唱的设计赋予了模型极强的转调逻辑与副歌爆发力，代价是自回归阶段仍需消耗数十秒逐帧推演。 || YuE2-3B generates human-editable ABC musical scores before predicting semantic audio tokens [3], securing strong harmonic progression and chorus lift at the cost of tens of seconds in autoregressive decoding.

::card 02
### 分层连续隐态直通（MiniMax-Music3） || Hybrid-LM Continuous Hidden Fusion (Music 3)
传统音频语言模型在离散残差矢量量化（RVQ）解码时极易丢失齿音与气声细节。MiniMax-Music3 用 8B 全局模型管曲式、0.6B 局部模型管帧内残差，推理时直接抽取两者的连续隐藏状态送入 2.4B 流匹配网络，绕开了离散码本瓶颈 [1]。 || Instead of decoding discrete residual vector quantization (RVQ) tokens directly, MiniMax-Music3 fuses continuous hidden states from an 8B Global LLM and 0.6B Local LLM into a 2.4B flow-matching network, preserving crisp vocal articulation [1].

::card 03
### 极速潜空间流匹配（ACE-Step / DiffRhythm） || Fast Latent Flow Matching (ACE-Step / DiffRhythm)
ACE-Step 1.5 将规划器压缩到 5 Hz 超低帧率，声学主干采用无分类器引导蒸馏的 8 步扩散 Transformer；DiffRhythm 则彻底抛弃自回归，对全曲潜变量执行非自回归并行去噪 [2][4]。两者在主流显卡上只需 10 秒左右即可交付整首歌曲。 || ACE-Step 1.5 pairs a 5 Hz planner with an 8-step distilled Diffusion Transformer, while DiffRhythm denoises full-song latents non-autoregressively in parallel [2][4], cutting full-song synthesis down to roughly 10 seconds.
:::

从信号压缩视角看，之所以这批模型能塞进单台消费级设备，关键在于声学帧率的大幅下探：若每秒生成 $f_r$ 帧潜变量，一首时长 $T$ 秒的立体声歌曲在自回归规划阶段只需推演 $N_{\text{frames}} = T \cdot f_r$ 个时间步。当帧率像 MiniMax-Music3 那样定在 $f_r = 25\,\text{Hz}$ 时，五分钟全曲上限恰好对应 $300 \times 25 = 7500$ 帧（官方硬上限为 $9000$ 帧）；而 ACE-Step 1.5 将高层语义规划压至 $5\,\text{Hz}$ 后，三分钟歌曲仅需规划 $900$ 步，彻底改写了本地推理的显存与延迟账本 [1][2]。 || Signal compression explains why consumer hardware can now host full-song models: generating $f_r$ latent frames per second bounds a $T$-second track to $N_{\text{frames}} = T \cdot f_r$ steps. At $f_r = 25\,\text{Hz}$ in MiniMax-Music3, a five-minute song spans $7500$ frames (capped at $9000$); ACE-Step 1.5 drops semantic planning to $5\,\text{Hz}$ ($900$ steps for three minutes), slashing KV-cache memory and latency [1][2].

## #minimax-music3 02 / MiniMax-Music3 Deep Audit :: 57.35 GB 原仓拆解与 M4 Max 64GB / 24GB 独显部署定论 || MiniMax-Music3 Anatomy and Exact Verdict for M4 Max 64GB & 24GB GPUs

2026 年秋季开源的 `MiniMaxAI/MiniMax-Music3` 是目前中文咬字最准、流行工业编曲味最浓的开源歌曲大模型之一 [1]。但不少开发者第一次点开 Hugging Face 文件树时都会被吓退：仓库里躺着 `qwen_7B` 下的 48 个分片、`language_model` 下的 4 个分片以及近 10 GB 的 `.pth` 文件，整仓文件体积高达 **57.35 GB**（二进制 **53.41 GiB**）。它到底能不能在 **MacBook Pro M4 Max 64GB** 或 **单张 24GB 独显**上跑起来？我们对仓库全部配置文件与权重分片做了逐字节核验 [1][9]。 || Released in late 2026, `MiniMaxAI/MiniMax-Music3` delivers studio-grade Mandarin vocal articulation and evolving pop arrangements [1]. Yet its Hugging Face tree intimidates newcomers: 48 shards under `qwen_7B`, 4 shards under `language_model`, and large `.pth` checkpoints totaling **57.35 GB** (**53.41 GiB**). Auditing every config and weight file reveals why half of that download is redundant and exactly how M4 Max 64GB and 24GB GPUs run it [1][9].

:::callout { title: "核心核验定论：为什么整仓 57.35 GB，实际推理只需 28.51 GB（MLX 量化仅 13.87 GB）？ || Core Audit Verdict: Why 57.35 GB Repo Shrinks to 28.51 GB BF16 and 13.87 GB MLX" }
原仓同时存放了两套异构推理框架的重复权重：一套是供 `sglang-omni` 读取的原始格式（`qwen_7B/` 48 个分片共 18.48 GB + `flowmatching_vae.pth` 9.83 GB + `dav.pth` 0.49 GB，合计 28.80 GB），另一套是供 `diffusers` 模块化管线读取的标准 safetensors 子目录（合计 **28.51 GB** / **26.55 GiB**）。全模型均为 **稠密架构（Dense，非 MoE）**，激活参数约 **11.12B**（8B Qwen3 全局主干 + 0.6B 局部 RVQ 解码器 + 2.4B 流匹配 Transformer + 0.12B Flow-VAE 声码器）[1]。**MacBook Pro M4 Max 64GB 与单卡 24GB CUDA 独显均能完整部署运行**，但必须避开原版 Python 管线的硬编码陷阱，选对原生后端 [1][9]。 || The repository bundles duplicate weights for two serving stacks: raw checkpoints for `sglang-omni` (`qwen_7B/`, `flowmatching_vae.pth`, `dav.pth` totaling 28.80 GB) alongside standard `diffusers` modular safetensors (**28.51 GB** / **26.55 GiB**). Every component is **Dense (non-MoE)** totaling **~11.12B** parameters [1]. **Both MacBook Pro M4 Max 64GB and single 24GB CUDA GPUs can deploy and run it smoothly** once routed through the proper runtime [1][9].
:::

| 权重模块 / 目录 || Weight Module / Subfolder | 推理框架归属 || Target Stack | 架构与参数规格 || Architecture & Params | 磁盘体积 || Disk Size | M4 Max 64GB 按需加载策略 || M4 Max Strategy |
|------|------|------|------|------|
| `language_model/` (4 分片) || `language_model/` (4 shards) | Diffusers 模块化 || Diffusers Modular | Dense `Qwen3ForCausalLM` (36 层, `hidden=4096`, 8B) || Dense Qwen3-8B (36L, GQA 32/8) | 17.17 GB (15.99 GiB) | 若走原生 MLX 则无需下载原仓，直拉 13.87 GB `mxfp8` 包 || Skip raw BF16; pull 13.87 GB MLX `mxfp8` |
| `rvq_depth_decoder/` || `rvq_depth_decoder/` | Diffusers 模块化 || Diffusers Modular | 局部帧内残差自回归器 (7 层声学码本, 0.6B) || Frame-level 7-codebook Local LLM (0.6B) | 1.29 GB (1.20 GiB) | 包含在 `MiniMax-Music3-mxfp8` 统一权重内 || Bundled inside MLX `mxfp8` repo |
| `transformer/` (2 分片) || `transformer/` (2 shards) | Diffusers 模块化 || Diffusers Modular | `MiniMaxMusic3Transformer1DModel` 流匹配 (2.4B) || 1D Flow-Matching Transformer (2.4B) | 9.73 GB (9.06 GiB) | 连续隐态融合去噪主干，MLX Metal 原生加速 || Native Metal acceleration via MLX |
| `vocoder/` + `condition_encoder/` || `vocoder/` + `condition_encoder/` | Diffusers 模块化 || Diffusers Modular | Flow-VAE 32kHz 立体声解码器 (123M) + 条件编码 || 32 kHz Stereo Flow-VAE (123M) + Cond | 0.32 GB (0.30 GiB) | 声码器保持高精浮点还原立体声高频泛音 || High-precision float stereo reconstruction |
| `qwen_7B/` + `*.pth` (旧式分片) || `qwen_7B/` + `*.pth` | SGLang-Omni (CUDA) || SGLang-Omni (CUDA) | 与上方四项完全同源的转换前副本 || Pre-conversion duplicate of the 4 modules above | 28.80 GB (26.82 GiB) | **切勿重复拉取**，用 `--exclude` 过滤省下一半磁盘 || **Exclude on download** to save 28.8 GB disk |

:::comparison { title: "双机实战诊断：M4 Max 64GB vs 单卡 RTX 3090/4090 24GB || Dual-Hardware Deployment Verdict: M4 Max 64GB vs Single 24GB GPU" }
::versus 本机 MacBook Pro M4 Max 64GB || MacBook Pro M4 Max 64GB { highlight: true }
### 原版 PyTorch 卡在 CUDA 硬依赖，原生 MLX `mxfp8` 满血畅跑 || Raw PyTorch Blocked by CUDA Gate; Native MLX `mxfp8` Runs Effortlessly
官方 README 明确标注原版 `sglang-omni` 与 `diffusers` 管线强依赖 CUDA 环境（卡在 `torch.cuda` 设备锁与 FlashAttention 算子，强改 MPS 会遇到 BFloat16 1D 卷积与算子回退降速）[1]。但在 Apple Silicon 上，社区与 `mlx-audio` 已交付原生 Metal 图编译方案：直接拉取 `mlx-community/MiniMax-Music3-mxfp8`（整包仅 **13.87 GB** / **12.92 GiB**），64GB 统一内存可**零卸载全常驻**，推理峰值内存仅 **17.5 ~ 20.5 GiB**，生成一首 3 分钟双语歌曲耗时约 **140 ~ 165 秒**，且音素咬字精度与 BF16 几乎无感差异；即使在 64GB 机器上直接跑 `MiniMax-Music3-bf16`（约 28.5 GB），统一内存依然留有超 25 GB 富余 [9]。 || Official Python pipelines hard-require CUDA and FlashAttention [1]. On M4 Max 64GB, bypassing PyTorch for `mlx-audio` with `mlx-community/MiniMax-Music3-mxfp8` (**13.87 GB** / **12.92 GiB**) keeps all weights resident in unified memory with zero CPU offload, peaking at **17.5-20.5 GiB** and rendering a 3-minute song in **~140-165 s** while preserving vocal clarity [9].

::versus 单卡 RTX 3090 / 4090 24GB (CUDA) || Single RTX 3090 / 4090 24GB
### 全精度直装差 4.5 GB 爆显存，开自动卸载或 Q8 即可稳跑 || Full BF16 Overflows by 4.5 GB; Auto-Offload or Q8 Fits Cleanly
若直接执行 `pipe.to("cuda")` 试图把 26.55 GiB 的 BF16 全模块一次性塞进 24GB 显存，必然触发显存溢出（OOM）。官方专门为此设计了 `ComponentsManager.enable_auto_cpu_offload(device="cuda")`：当 8B 语言模型完成自回归隐态生成后自动退回系统内存，再换入 2.4B 流匹配模型与声码器，使全精度 BF16 峰值显存稳稳压在 **~22 GiB** 以内 [1]。若追求更高吞吐，改用 `audio.cpp` 或 ComfyUI 的 **Q8 量化包**，峰值显存直降至 **13.4 GiB**（Q4 混合包更低至 **9.8 GiB**，连 12GB 显卡甚至开启逐层流式卸载的 8GB 显卡都能跑通）[1]。 || Calling `pipe.to("cuda")` on 26.55 GiB of BF16 weights overflows 24GB VRAM. Enabling `ComponentsManager.enable_auto_cpu_offload` stages the 8B LLM and 2.4B Flow DiT sequentially, capping BF16 peak VRAM at **~22 GiB** [1]. Alternatively, Q8 GGUF/ComfyUI builds drop peak VRAM to **13.4 GiB** (and **9.8 GiB** in Q4) [1].
:::

### 实操指南：M4 Max 64GB 原生 MLX 一键部署与结构化提示词技巧 || Hands-On Recipe: M4 Max 64GB Native MLX Command and Structured Captioning

在 M4 Max 上无需折腾开发版 `diffusers` 分支，直接通过 `mlx-audio` 调用 `MiniMax-Music3-mxfp8` 即可把统一内存带宽吃满；写提示词时，建议按官方推荐的「全局元数据 + 人声细节 + 段落配器演进」三段式结构书写，并让 `[verse]`、`[chorus]` 标签独占一行 [1][9]： || On M4 Max, `mlx-audio` runs `MiniMax-Music3-mxfp8` natively over Metal unified memory; for best adherence, place `[verse]` and `[chorus]` on dedicated lines and structure descriptions into metadata, vocals, and arrangement evolution [1][9]:

```bash
# MacBook Pro M4 Max 64GB 原生 MLX 部署（自动按需拉取 13.87 GB mxfp8 权重）
pip install -U mlx-audio
python -m mlx_audio.music.generate \
  --model mlx-community/MiniMax-Music3-mxfp8 \
  --caption "Genre: Mandarin indie pop. BPM: 96. Key: C major. Vocals: warm intimate female lead, subtle stacked harmonies in chorus. Arrangement: fingerpicked acoustic guitar in verse, building with brushed drums and cello in chorus." \
  --lyrics $'[verse]\n晚风吹过霓虹闪烁的街口\n耳机里循环着未写完的前奏\n[chorus]\n让整座城市的星光为你停留' \
  --duration 180 --steps 30 --output m4max_music3_demo.wav
```

### 省盘避坑：如何在 CUDA 机器上只下载 28.51 GB Diffusers 权重 || Disk-Saving Tip: Downloading Only the 28.51 GB Diffusers Subset on Linux/Windows

如果是在 Linux 或 Windows 的 24GB 独显工作站上使用 `diffusers` 模块化管线，拉取模型时加上排除过滤参数，可以瞬间省下 28.80 GB 的冗余分片下载时间与固态硬盘空间 [1]： || On CUDA workstations running `diffusers`, excluding the legacy `sglang-omni` files saves 28.80 GB of bandwidth and SSD space [1]:

```bash
hf download MiniMaxAI/MiniMax-Music3 \
  --exclude "qwen_7B/*" "flowmatching_vae.pth" "dav.pth" \
  --local-dir ./MiniMax-Music3-Modular
```

## #landscape 03 / Open-Weight Landscape :: 八大开源文生歌与文生音乐模型硬核横评 || Deep Benchmark Across Eight Open-Weight Song and Music Families

如果说 MiniMax-Music3 代表了「高咬字商业质感人声」的塔尖，那么整个本地音乐生成生态早已百花齐放：有的把整曲生成压缩到了眨眼般的 10 秒内，有的支持导出明文曲谱二次改和弦，还有的能直接化身为数字音频工作站（DAW）里的实时流式伴奏轨 [2][3][6]。 || While MiniMax-Music3 leads in studio Mandarin vocal polish, neighboring open-weight families excel at sub-10-second iteration, white-box score editing, unrestricted MIT licensing, or live DAW streaming [2][3][6].

| 模型家族 || Model Family | 核心主干与采样率 || Backbone & Sample Rate | 典型显存 / 内存水位 || Peak Memory | 180s 全曲典型耗时 || 180s Latency | 开源许可与商用红线 || License & Commercial Terms | 核心杀手锏与短板 || Killer Strength & Caveat |
|------|------|------|------|------|------|
| **MiniMax-Music3** [1][9] | 8B+0.6B Hybrid-LM + 2.4B Flow (32kHz 立体声) || 8B+0.6B LM + 2.4B Flow (32kHz Stereo) | 18.5 GiB (MLX mxfp8) / 22 GiB (CUDA 卸载) || 18.5 GiB (MLX) / 22 GiB (Offload) | ~152 s (M4 Max MLX) || ~152 s (M4 Max MLX) | MiniMax 社区许可（年营收 <2000 万美元可商用） || Community (<USD 20M/yr commercial) | 中文咬字极准（PER 6.27%），编曲推进细腻；非流式且受营收条款约束 || Top Chinese lyric clarity; non-streaming, USD 20M cap |
| **ACE-Step 1.5 / XL** [2] | 5Hz Qwen3 LM + 2B/4B 8步 Turbo DiT (48kHz) || 5Hz LM + 2B/4B 8-Step DiT (48kHz) | 6.5 GiB (2B) / 16.5 GiB (XL) | ~9.5 s (2B) / ~18 s (XL, 3090) | **MIT 开源协议**（无门槛免版税商用） || **MIT License** (Unrestricted) | 速度断层领先，内置 macOS MLX 脚本，8 首歌 12GB 显存即可训专属 LoRA || Fastest full songs, native MLX script, easy 12GB LoRA |
| **YuE / YuE2-3B** [3] | 白盒 ABC 乐谱 CoT + 3B AR + 声码器 (48kHz) || ABC Score CoT + 3B AR (48kHz Stereo) | 11.2 GiB (YuE2 BF16 免量化) || 11.2 GiB (YuE2 BF16) | ~59.5 s (4090 折算；初代需数分钟) || ~59.5 s on 4090 (v1 took mins) | 代码 Apache-2.0，**权重 CC-BY-NC-4.0（禁商用）** || Code Apache-2.0, **Weights CC-BY-NC** | WildSongBench 综合乐感榜首（6.96），支持人工改 `score.abc` 重编和弦 || #1 musicality & white-box editable score; non-commercial |
| **DiffRhythm v1.2 / 2** [4] | 非自回归 / 分块流匹配 DiT (44.1kHz 立体声) || NAR / Block Flow DiT (44.1kHz Stereo) | 8.2 GiB (`--chunked` 分块模式) || 8.2 GiB (`--chunked` mode) | ~12 s (端到端全曲去噪) || ~12 s end-to-end | **Apache-2.0**（完全开放商用） || **Apache-2.0** (Commercial OK) | 8GB 甜点卡友好，无自回归累积误差；复杂转调叙事略逊于大模型 || Runs in 8GB VRAM fast; simpler harmonic arcs |
| **HeartMuLa-oss-3B** [5] | 12.5Hz 音频编解码语言模型 + MuLaCover || 12.5Hz Codec LM + MuLaCover | 16.0 GiB (开启按需懒加载) || 16.0 GiB (`lazy_load`) | ~180 s (RTF ≈ 1.0 基线) || ~180 s (RTF ≈ 1.0) | **Apache-2.0**（完全开放商用） || **Apache-2.0** (Commercial OK) | 多语种歌词对齐稳健，配套可控翻唱与伴奏重塑扩展 || Clean Apache-2.0 multilingual vocals & cover control |
| **Magenta RealTime 2** [6] | 230M Small / 2.4B Base 流式自回归 (48kHz) || 230M / 2.4B Streaming AR (48kHz) | 2.2 GiB (Small) / 8.0 GiB (Base) | **实时流式输出** (RTF < 0.8) || **Live Stream** (RTF < 0.8) | **Apache-2.0**（完全开放商用） || **Apache-2.0** (Commercial OK) | M4 Max 官方认证超实时流式纯音乐，可编译为 Logic Pro AUv3 插件 || Real-time live jam & Logic Pro AUv3 plugin; no lyrics |
| **Stable Audio Open** [7] | T5 条件 + 双声道潜空间 DiT (44.1kHz) || T5 + Stereo Latent DiT (44.1kHz) | 4.0 GiB (Small) / 6.8 GiB (1.0) | 2 ~ 5 s / 47 秒片段 || 2-5 s per 47s clip | Stability 社区许可（年营收 <100 万美元免费） || Community (<USD 1M/yr free) | 拟音、环境声效、合成器铺底与鼓组 Loop 音质清澈，不含人声演唱 || Crisp stereo SFX, synth pads, and drum loops; no vocals |
| **MusicGen / JASCO** [8] | EnCodec 离散码本 AR / 时间轴流匹配 (32kHz) || EnCodec AR / Chord-Drum Flow (32kHz) | 4.5 ~ 9.5 GiB (1.5B ~ 3.3B) | 12 ~ 35 s / 30 秒片段 || 12-35 s per 30s clip | 代码 MIT，**官方权重 CC-BY-NC-4.0** || Code MIT, **Weights CC-BY-NC** | 支持哼唱旋律引导或精确到小节的和弦、鼓点时间轴控制 || Precise bar-level chord/drum conditioning; 30s horizon |

:::figure { src: "./media/hardware-vram-latency-bar.figure.json", title: "主流本地歌曲模型峰值显存与 180 秒全曲生成耗时实测对比 || Peak Memory Footprint and 180s Full-Song Latency Comparison" }
图 2：七款主流本地带词歌曲模型在 24GB 独显与 M4 Max 64GB 统一内存下的峰值内存占用（青色，GiB）与合成 180 秒全曲耗时（橙色，秒）对照，直观展现 8 步流匹配与大型自回归主干的速度代差 [1][2][3][4][5]。 || Figure 2: Peak memory footprint (teal, GiB) and 180-second full-song latency (orange, seconds) across seven vocal song models on 24GB CUDA and M4 Max 64GB MLX, illustrating the speed gap between 8-step flow DiTs and large AR backbones [1][2][3][4][5].
:::

对比数据揭示了一个非常实用的双模型互补工作流：**没有哪一个模型能同时垄断「最快速度」「最强改谱自由度」「最高中文咬字」与「零限制 MIT 许可」**。在实际创作中，最高效的做法是先用 **ACE-Step 1.5 Turbo** 在十余秒内高频抽卡验证歌词押韵、曲风速度与段落情绪；一旦敲定满意的词曲骨架，若用于完全免版税的商业项目，直接切到同仓的 **ACE-Step 1.5 XL SFT** 或训一个专属音色 LoRA 精修；若追求极致的中文流行单曲咬字且团队年营收在 2000 万美元门槛内，则交由本机 **MiniMax-Music3-mxfp8** 慢工细活渲染最终母带 [1][2]。 || No single checkpoint monopolizes speed, score editability, vocal diction, and unrestricted licensing at once. In practice, creators sketch lyric meter and tempo in ~10 seconds with **ACE-Step 1.5 Turbo**, then either finish inside **ACE-Step 1.5 XL SFT** (MIT) with custom LoRAs for unrestricted commercial delivery or render final Mandarin vocals through **MiniMax-Music3-mxfp8** [1][2].

### 深度辨析：YuE 初代 vs YuE2-3B 的显存大瘦身与 CC-BY-NC 商用边界 || Deep Dive: YuE v1 vs YuE2-3B Memory Diet and CC-BY-NC Non-Commercial Line

早期尝试过初代 YuE（7B Stage-1 + 1B Stage-2）的玩家大多对它「未量化需占 24GB 以上显存、双阶段串行跑一首歌动辄六到十分钟」印象深刻。最新演进的 **YuE2-3B** 通过精简参数规模并引入 CUDA Graphs 与 FlashAttention 加速，在 RTX 4090 上免量化全精度（BF16）峰值显存仅需 **11.18 GiB**，71 秒即可合成 3 分 35 秒的 48 kHz 立体声全曲，更允许创作者拦截中间生成的 `score.abc` 文本乐谱手工修改副歌高音走向 [3]。唯一需要严守的红线是许可证：YuE 系列预训练权重采用 **CC-BY-NC-4.0** 协议，仅限学术研究与个人非商业试听，切勿直接用于商业发行配乐 [3]。 || Original YuE (7B+1B) demanded heavy VRAM and 6-10 minutes per track. **YuE2-3B** trims unquantized BF16 peak memory to **11.18 GiB** and renders a 3.6-minute 48 kHz stereo song in 71 seconds on RTX 4090 while exposing editable `score.abc` lead sheets [3]—though its **CC-BY-NC-4.0** weights strictly prohibit commercial monetization [3].

### 纯音乐与影视配乐专席：何时该放下「全曲唱歌模型」改用器乐专家？ || Instrumental Specialists: When to Prefer Magenta RT2, Stable Audio, or JASCO

如果你的目标是给独立游戏写无缝循环战斗配乐、给播客垫底，或者对准视频剪辑轴卡点，强行让带词歌曲大模型加 `[Instrumental]` 标签往往事倍功半。此时三款器乐专家更具优势：**Magenta RealTime 2** 在 M4 Max 上支持超实时流式生成，还能编译成 Logic Pro 的 AUv3 插件实时改词即兴伴奏 [6]。**Stable Audio Open** 擅长 2 到 5 秒刷出清脆的 44.1 kHz 立体声转场音效与合成器铺底 [7]；Meta 的 **JASCO** 则允许直接写入 `C -> Am -> F -> G` 的小节级和弦时间表与参考鼓组，让伴奏分秒不差地贴合画面切镜 [8]。 || For game loops, podcast beds, or video scoring, dedicated instrumental models beat `[Instrumental]` tags on vocal models [6]. **Magenta RealTime 2** streams faster than real-time on M4 Max with Logic Pro AUv3 integration [6], **Stable Audio Open** renders crisp 44.1 kHz SFX and synth loops in seconds [7], and **JASCO** enforces bar-level chord progressions and drum stems [8].

## #advisor 04 / Selection & Interactive Advisor :: 四维选型象限与硬件 × 场景交互决策沙盒 || Selection Quadrant and Hardware × Scenario Interactive Advisor

面对手头的 MacBook、游戏独显工作站或轻薄本，以及手头项目的版权合规要求，把上述八大体系投射到「本地推理轻快度与商用自由度 × 全曲音乐性与人声表现力」二维平面上，可以清晰看到四大阵营的生态位分布 [1][2][3][6]。 || Projecting all eight model families onto local speed and license freedom versus full-song musicality and vocal fidelity reveals four clear operational quadrants [1][2][3][6].

:::figure { src: "./media/model-selection-quadrant.figure.json", title: "2026 本地开源歌曲与纯音乐模型二维选型象限 || 2026 Local Open-Weight Song and Music Model Selection Quadrant" }
图 3：右上角「主力甜点象限」由 MIT 协议的 ACE-Step 1.5/XL 与高咬字精度的 MiniMax-Music3 领衔；左上角 YuE2-3B 稳坐非商用学术与改谱音质标杆；右下角则由 Magenta RealTime 2 与 Stable Audio Open 承接实时器乐与音效需求 [1][2][3][6][7]。 || Figure 3: ACE-Step 1.5/XL (MIT) and MiniMax-Music3 anchor the upper-right commercial sweet spot, YuE2-3B leads upper-left non-commercial musicality, and Magenta RealTime 2 plus Stable Audio Open power lower-right fast instrumental workflows [1][2][3][6][7].
:::

为了把硬件预算、场景诉求与一行可跑通的本地命令直接对应起来，点击下方纯静态选型顾问中的**本机硬件档位**与**创作目标**，即可实时获取峰值内存预估、许可证合规提示、一键启动 CLI 以及同硬件互补备选方案： || Select your **local hardware tier** and **creative scenario** in the static interactive advisor below to inspect peak memory estimates, license guardrails, ready-to-run CLI commands, and complementary alternatives:

:::sandbox { id: "local-music-advisor", canvas: false, script: "./music-model-advisor.js", style: "./music-model-advisor.css", title: "本地音乐与歌曲大模型选型顾问 & 一键 CLI 生成器 || Local Music & Song Model Advisor and CLI Generator", desc: "自由组合 M4 Max 64GB、24~32GB Mac、24GB 独显与 12~16GB 主流独显 × 四大创作目标，即时生成零踩坑本地部署配方。 || Combine M4 Max 64GB, 24-32GB Mac, 24GB CUDA, or 12-16GB GPUs with four creative goals to get verified local deployment commands." }
纯静态交互选型沙盒：支持中英双语联动与一键复制终端命令。 || Pure static interactive selection advisor with bilingual synchronization and one-click CLI copy.
:::

:::flow { title: "本地 AI 音乐工作站四步零踩坑落地流 || Four-Step Local AI Music Workstation Workflow" }
1. **按协议红线先筛池子 || Filter by License Guardrails First** — 商业配乐与自媒体变现优先锁定 MIT（ACE-Step 1.5）与 Apache-2.0（DiffRhythm 2、HeartMuLa、Magenta RT2），或核验自身年营收满足 MiniMax（<2000 万美元）与 Stability（<100 万美元）社区条款；避开 CC-BY-NC 权重直接商用 [1][2][3][7]。 || Lock in MIT or Apache-2.0 models (or verify revenue caps for MiniMax <USD 20M and Stability <USD 1M) before commercial use; keep CC-BY-NC weights strictly non-commercial [1][2][3][7].
2. **匹配原生算子后端而非硬怼兼容层 || Match Native Compute Backends** — Apple Silicon 优先选用原生编译 Metal 图的 `mlx-audio`、`magenta-rt[mlx]` 或官方 MLX 启动脚本，避开强绑 CUDA/FlashAttention 的 Python 分支；中小显存独显善用 `audio.cpp` GGUF 或组件级 CPU 卸载 [1][2][9]。 || Use native Metal runtimes (`mlx-audio`, `magenta-rt[mlx]`, ACE-Step MLX launcher) on Macs rather than forcing CUDA-bound PyTorch scripts onto MPS [1][2][9].
3. **快慢双模协同打磨词曲 || Pair Fast Sketching with High-Precision Mastering** — 用 8 步流匹配模型（ACE-Step Turbo）十秒级试错 BPM、分段标签与韵脚节奏，定稿后再交由 MiniMax-Music3-mxfp8 或 ACE-Step XL SFT 渲染最终立体声母带 [1][2]。 || Iterate lyric meter and BPM in 10 seconds with ACE-Step Turbo, then master final stereo vocals in MiniMax-Music3-mxfp8 or ACE-Step XL SFT [1][2].
4. **接入分轨与 DAW 后期混音 || Finish with Stem Separation and DAW Mixing** — 将生成的 32kHz/48kHz 双声道音频导入本地干声伴奏分离工具或直接通过 AUv3 插件连入 Logic Pro，补齐均衡、混响与响度母带标准化 [6]。 || Route generated stereo tracks into stem splitters or Logic Pro AUv3 plugins for EQ, spatial reverb, and loudness normalization [6].
:::

## #songwriting-case-study 05 / Golden-Pocket Songwriting Case Study :: 实战复盘：从 64 行流水账念经到 39 行黄金切分单曲的高动态重编工程 || Production Case Study: Rebuilding a Flat 64-Line Rap Draft into a 39-Line Golden-Pocket Single

选对本地模型只是第一步——真实创作中最常见的翻车并非显卡跑不动，而是**成曲音质清晰却听感平淡、毫无副歌记忆点** [10]。我们以本机 `MiniMax-Music3-mxfp8` 渲染的一首真实技术主题说唱样曲（初版时长 `214.5 秒`、`44.1 kHz` 立体声）为工程样本，完整复盘如何用声学波形诊断与音节节拍账本把“说明书式快嘴播报”重铸为抓耳炸场单曲 [9][10]。 || Deploying the checkpoint locally is only half the battle—the most common failure in AI songwriting is **clean audio that still sounds flat and forgettable** [10]. Using an actual tech-themed rap track rendered locally on `MiniMax-Music3-mxfp8` (initial cut `214.5 s`, `44.1 kHz` stereo) as a concrete specimen, this section traces how waveform diagnostics and syllable-grid math turn a monotone checklist into a high-impact single [9][10].

### 病灶解剖：102.6% 十六分音符满载如何锁死 `+1.22 dB` 扁平动态与 `207 Hz` 单音高 || Root-Cause Anatomy: How 102.6% Slot Occupancy Froze Loudness (+1.22 dB) and Pitch (207 Hz)

对初版波形的 `9,458,688` 个双声道采样点逐段测算后，三组客观物理指标直接揭开了“像念经”的根因 [10]：在 `100 BPM` 的四四拍律动下，单小节时长仅 $4 \times (60 / 100) = 2.40\,\text{s}$（折合 `16` 个 `150 毫秒` 的十六分音符槽位）；成熟中文说唱每小节通常只排 `8–11` 个实唱音节，留足军鼓反拍与换气停顿。而初版 `64` 行歌词混排了 `91` 个英文词与 `13` 处全大写字母缩写，`34` 行主歌平均飙至 **`16.41` 音节/行**（第四段主歌峰值达 **`18.43` 音节/行**），单小节十六分音符占空比突破 **`102.6%`** [10]。全曲低于 `-35 dBFS` 的呼吸留白帧不足 `2.70%`，副歌均方根响度仅比主歌微涨 **`+1.22 dB`**（商业单曲通常需 `+3.0` 至 `+5.5 dB`）；叠加原版自回归解码器默认温度锁定 `1.0` 且无重复惩罚，等长密排句式诱导人声基频在后半程死死冻结在 **`207 Hz`（G#3）** 附近，音域跨度收窄至 `6.3` 个半音 [10]。与此同时，初版提示词同时索要爵士行走贝斯、电影弦乐与铜管齐奏，导致 `150–350 Hz` 中低频浑浊区能量（`-27.15 dBFS`）反超 `60–120 Hz` 底鼓冲击区（`-27.73 dBFS`）[10]。 || Waveform telemetry across `9,458,688` stereo samples exposed three interacting bottlenecks [10]: at `100 BPM` in 4/4 time, one bar spans $4 \times (60 / 100) = 2.40\,\text{s}$ (`16` sixteenth-note slots of `150 ms` each), where idiomatic Mandarin boom-bap places `8–11` syllables to leave room for snare pocket and breath. Cramming `91` English words and `13` uppercase acronyms across `64` lines pushed the `34` verse lines to **`16.41` syllables/line** (`18.43` in Verse 4)—exceeding **`102.6%`** slot occupancy [10]. Breath frames below `-35 dBFS` shrank under `2.70%`, collapsing chorus-over-verse loudness lift to just **`+1.22 dB`**; combined with unpenalized `temperature = 1.0` autoregressive sampling, uniform line lengths locked late-song vocal pitch onto a flat **`207 Hz` (G#3)** plateau (`6.3`-semitone span) while competing upright bass and strings muddied `150–350 Hz` (`-27.15 dBFS`) above the `60–120 Hz` kick fundamental (`-27.73 dBFS`) [10].

:::figure { src: "./media/lyric-syllable-density-comparison.figure.json", title: "初版 64 行流水账歌词 vs. 39 行黄金切分重编版的单行音节负载实测对比 || Verbose 64-Line Draft vs. 39-Line Golden-Pocket Rewrite: Syllable Density" }
图 4：按本仓 `prompt_lint.py` 声学音节口径实测，重编版将全曲从 64 行收敛至 39 行，主歌压入 `8.25` 音节/行的切分弹跳甜点区，副歌进一步收紧至 `6.30` 音节/行以释放长元音群唱钩子，静态体检达成 **0 警告** [10]。 || Figure 4: Audited with `prompt_lint.py`, the rewrite trims 64 lines down to 39 lines, locking verses at `8.25` syllables/line for snare-pocket syncopation and tightening choruses to `6.30` syllables/line for open-vowel gang hooks with **0 lint warnings** [10].
:::

:::comparison { title: "初版功能流水账 vs. 黄金律动版四维减法重编 || Verbose Checklist Draft vs. Four-Dimensional Golden-Pocket Rewrite" }
::versus 初版翻车样本：64 行说明书堆砌（+1.22 dB 平淡念经） || Original Pitfall: 64-Line Feature Dump (+1.22 dB Flat Monotone)
### 超载音节吞噬休止符，冲突配器糊死中低频 || Overstuffed Syllables Kill Syncopation; Competing Stems Mud Low-Mids
试图把二十余个零碎连接器与开发包缩写逐一点名，单行冲上 18–20 音节，连 13 音节的副歌也成了无旋律起伏的名词罗列；同时混写爵士贝斯与电影弦乐互相抵消瞬态冲击 [10]。 || Name-dropping twenty granular connectors and acronyms pushed lines to 18–20 syllables and flattened the 13-syllable chorus into a noun list, while jazz bass plus orchestral strings smeared drum transients [10].

::versus 重编工程处方：39 行切分留白 + 预副歌抽空（抓耳炸场） || Engineered Prescription: 39-Line Pocket + Drop-Out Lift { highlight: true }
### 8.25/6.30 音节阶梯反差 + 三段式反稀释 Prompt + 超参解锁 || 8.25/6.30 Syllable Contrast + Focused 3-Part Prompt + Tuned Sampling
大刀阔斧砍掉细碎缩写（单行至多保留 1 个英文品牌词），形成「两段 8 字切分主歌 + 预副歌末拍器乐全停（Drop-Out）+ 6 字开元音群唱副歌 + 半速悬置桥段」的黄金结构，并将速度微调至更具点头弹性的 `94 BPM`（F# 小调）[10]。 || Strips acronym clutter to at most one English brand term per line, pairing two 8-syllable pocket verses with a one-bar pre-chorus instrumental drop-out, a 6-syllable gang-chant chorus, and a half-time bridge at `94 BPM` in F# minor [10].
:::

### 可复用重编蓝本：零警告歌词范式、三段式反稀释 Prompt 与超参解锁 CLI || Reusable Production Blueprint: Zero-Warning Lyrics, Anti-Dilution Prompt, and Unlocked CLI

在 `MiniMax-Music3` 的输入清洗管线（`prompt.py`）中，任何与 `[Verse]`、`[Chorus]` 同行的歌词都会被正则静默截断丢弃，而写在圆括号 `(Hey!)` 内的短词则会被渲染为立体声群唱呼应 [1][10]。下方完整给出经 `python3 scripts/generate-minimax-music-mlx.py --lint-only` 实测零警告通过（`sections=9, lines=39, avg_syllables=7.82, warnings=0`）的歌词样本、反稀释三段式编曲提示词，以及打通双阶段采样旋钮的一键渲染命令 [10]： || Inside `MiniMax-Music3`'s `prompt.py` normalizer, any lyric text sharing a line with `[Verse]` or `[Chorus]` is silently stripped, whereas short parenthetical cues like `(Hey!)` trigger stereo backing shouts [1][10]. Below are the zero-warning lyric template (`sections=9, lines=39, avg_syllables=7.82, warnings=0`), the three-part anti-dilution arrangement prompt, and the unlocked CLI command [10]:

```text
[Intro]
(Yo! Ignite!)
灯光切暗，鼓点上膛 (Uh!)
Copilot Studio——全场点亮！

[Verse]
八月重铸，地基全换
六天一代，推理闯关 (Yeah!)
确定流程，嵌进智能
界面数据，一气呵成
成本砍半，底座飙升
自动选模，省心精准
一句指令，蓝图成形
一美金跑通，干净利落！

[Pre-Chorus]
三大支柱，听我号令！
创作合一！(Hey!)
自主连接！(Ho!)
鼓点骤停——全场引爆！

[Chorus]
一句话——全点亮！(Hey!)
稳稳跑，节点上！
智能体，并肩闯
Oh——流程焕新光~
Copilot Studio！(Go!)

[Instrumental]
(Scratch it up! Drop that horn!)

[Verse]
独立账号，上线报到
邮箱会议，脉络抓牢 (Right now!)
事件触发，昼夜奔跑
专属记忆，越跑越巧
技能共享，全员收到
客服语音，无缝转交
协议互通，群策群力
万千系统，一呼百应！

[Bridge]
慢下来——看清这版图
百万智能体，日夜在奔赴
评测先探路，监控盯全网
预算归账本，实力见真章！

[Chorus]
一句话——全点亮！(Hey!)
稳稳跑，节点上！
智能体，并肩闯
Oh——流程焕新光~
Copilot Studio！(Yeah! Go!)

[Outro]
去试！去造！打破旧边框！(Ha!)
下一个传奇，由你来领航
Build it now——Copilot Studio！
```

配套提示词严守「全局声学元数据 + 人声干湿对比 + 主次配器生命周期」三段式契约，显式声明 `No lush cinematic strings, no soft jazz lounge wash` 腾空 `250 Hz` 中低频，并在预副歌末拍强制拉出器乐静默断崖；CLI 则将自回归温度微提至 `1.10`、扩大候选池 `ar-top-k=65` 并拉高双阶段引导尺度（`ar-cfg-scale=1.80`、`dit-cfg-scale=1.95`），彻底打破单音高复读陷阱 [10]： || The companion prompt enforces a clean three-part contract—explicitly banning muddy strings around `250 Hz` and scripting a final-beat pre-chorus drop-out—while the CLI unlocks `temperature=1.10`, `ar-top-k=65`, `ar-cfg-scale=1.80`, and `dit-cfg-scale=1.95` to break pitch monotony [10]:

```text
Global Metadata
Basic Attributes: bpm is 94. key is F#, and scale is minor. Modern East-Asian Hard Boom-Bap / Arena Hip-Hop.
Global Emotional Progression: Opens with a raw, head-nodding underground drum-and-brass motif, locking into a razor-sharp, swaggering pocket during the verses. Tension coils tightly in the pre-chorus before a sudden one-bar instrumental drop-out launches an explosive, stadium-sized chorus chant. A stripped-back half-time bridge creates dramatic suspense before the final high-impact refrain.
Sonics & Production Profile: Crisp, punchy, transient-forward mix with a tight side-chained 65 Hz sub-bass, clean 250 Hz low-mids with zero orchestral mud, biting snare crack on beats 2 and 4, and wide stereo chorus hooks. No lush cinematic strings, no soft jazz lounge wash.
Vocal Details
Vocal Gender & Timbre: Singer A (Male). Deep, charismatic baritone with crisp Mandarin consonant attack and gritty chest resonance.
Vocal Style: Syncopated, bouncy rhythmic rap in the verses with deliberate pauses and pocket variations; shifts into a powerful, melodic sung-rap hook in the chorus with sustained open vowels.
Harmony/Backing Vocals: Dry single-tracked lead vocal in the verses; wide stereo gang-vocal shouts, octave vocal doubling, and energetic ad-libs punctuate the chorus and pre-chorus turnarounds.
Vocal FX: Tight FET compression and dry close-mic presence in verses; slapback throw delay on line endings and wide plate reverb on chorus backing chants.
Arrangement
Instrument Lifecycle Description (Primary/Secondary Layering):
Primary: A catchy, staccato muted-brass and gritty clavinet riff serves as the signature melodic hook from the Intro through every Chorus and Outro.
Secondary: A hard-hitting SP-1200 boom-bap drum kit and a tight, punchy synth sub-bass lock together on the kick pattern, accompanied by brief turntable scratch fills between sections.
Groove & Foundation Progression: Intro opens with turntable scratches and the raw brass riff before the heavy drums slam in. Verses strip back to drums, sub-bass pulse, and sparse clavinet stabs so the rap flow breathes. In the Pre-Chorus, snare rolls build intensity until all drums and bass cut out completely on the final beat. The Chorus erupts with full brass stabs, double-time hi-hat bounce, heavy sub-bass drops, and stacked gang chants. Bridge drops into a spacious half-time sub-bass pulse with filtered Rhodes chords, surging back into the loudest final Chorus and a sharp four-bar scratch outro.
```

```bash
# 1. 渲染前先跑静态节拍密度与标签独占行零警告校验（warnings=0）
python3 scripts/generate-minimax-music-mlx.py \
  --prompt "$(cat focused_prompt.txt)" \
  --lyrics-file focused_lyrics.txt \
  --duration 145 --lint-only

# 2. 解锁双阶段采样超参，在 M4 Max 64GB 上一键渲染高动态立体声母带
python3 scripts/generate-minimax-music-mlx.py \
  --prompt "$(cat focused_prompt.txt)" \
  --lyrics-file focused_lyrics.txt \
  --duration 145 --steps 32 --seed 113 \
  --temperature 1.10 --ar-cfg-scale 1.80 --ar-top-k 65 --dit-cfg-scale 1.95 \
  --output focused_master.wav
```

## #references 06 / References :: 参考来源 || References

- [1] MiniMax-AI: MiniMax-Music3 Model Card, Modular Index & Weights Repository — https://huggingface.co/MiniMaxAI/MiniMax-Music3 | 官方架构说明、57.35 GB 双框架文件树、Hybrid-LM 连续隐态合成管线、CUDA 卸载示例与社区商用许可条款 || Official architecture spec, 57.35 GB dual-stack file tree, Hybrid-LM continuous hidden synthesis, CUDA offloading guide, and license terms
- [2] ACE Studio & StepFun: ACE-Step 1.5 / XL Open-Source Music Foundation Model — https://github.com/ACE-Step/ACE-Step-1.5 | 5Hz 规划语言模型 + 8 步蒸馏 Turbo DiT 架构、macOS 原生 MLX 启动脚本、显存分级表与 MIT 商用开源协议 || 5Hz LM planner + 8-step Turbo DiT architecture, native macOS MLX launcher, VRAM tier guide, and MIT license
- [3] M-A-P & HKUST: YuE & YuE2 Open Full-Song Generation Foundation Models — https://github.com/multimodal-art-projection/YuE | 双阶段全曲生成与 YuE2-3B 白盒 ABC 乐谱思维链、11.18 GiB 免量化显存基准及 CC-BY-NC-4.0 权重协议说明 || Full-song generation, YuE2-3B editable ABC lead-sheet CoT, 11.18 GiB BF16 benchmark, and CC-BY-NC-4.0 weight license
- [4] ASLP-lab (NWPU): DiffRhythm & DiffRhythm 2 Non-Autoregressive / Block-Flow Song Synthesis — https://github.com/ASLP-lab/DiffRhythm | 非自回归潜空间扩散与分块流匹配全曲合成架构、8GB 分块推理脚本及 Apache-2.0 许可 || Non-autoregressive latent diffusion and block flow-matching song synthesis, 8GB chunked inference, and Apache-2.0 license
- [5] HeartMuLa Team: HeartMuLa-oss-3B Open Multilingual Lyric-to-Song Family — https://github.com/HeartMuLa/heartlib | 12.5Hz 编解码器多语种歌曲模型、单卡按需懒加载机制与 Apache-2.0 开源授权 || 12.5Hz codec multilingual song generation, single-GPU lazy loading, and Apache-2.0 licensing
- [6] Google Magenta: Magenta RealTime 2 Streaming Instrumental Generation & MLX Runtime — https://github.com/magenta/magenta-realtime | Apple Silicon 原生超实时流式音乐生成（230M Small / 2.4B Base）与 Logic Pro AUv3 插件架构 || Native Apple Silicon faster-than-realtime streaming instrumental generation and Logic Pro AUv3 plugin support
- [7] Stability AI: Stable Audio Open 1.0 & Small Stereo Diffusion Tools — https://github.com/Stability-AI/stable-audio-tools | 44.1kHz 双声道潜空间扩散配乐与环境音效模型、Ping-Pong 采样器及 Stability 社区许可边界 || 44.1 kHz stereo latent diffusion for music loops and SFX with Stability Community License terms
- [8] Meta AI AudioCraft: MusicGen & JASCO Temporal Chord/Drum Conditioned Music Generation — https://github.com/facebookresearch/audiocraft | EnCodec 自回归器乐生成与 JASCO 小节级和弦、鼓点及旋律时间轴条件控制管线 || EnCodec autoregressive music generation and JASCO bar-level chord, drum, and melody conditioning
- [9] MLX Community & mlx-audio: MiniMax-Music3-mxfp8 Native Apple Silicon Checkpoint — https://huggingface.co/mlx-community/MiniMax-Music3-mxfp8 | 面向 Apple Silicon Metal 统一内存编译的 13.87 GB (12.92 GiB) MXFP8 量化权重与 `mlx-audio` 推理接口 || 13.87 GB (12.92 GiB) MXFP8 quantized checkpoint and `mlx-audio` runtime for Apple Silicon unified memory
- [10] Study Room Audio Engineering Guide: AI Songwriting & MiniMax-Music3 Mastery — https://github.com/illusion615/KnowledgeHub/blob/main/docs/ai-songwriting-and-minimax-music3-mastery.md | 《AI 编曲审美与 MiniMax-Music3 高阶掌控秘籍》64 行说唱原曲声学波形诊断、`prompt_lint.py` 音节占空比模型与超参调优规范 || Waveform diagnosis of the 64-line rap track, `prompt_lint.py` syllable-slot prosody rules, and dual-stage sampling controls

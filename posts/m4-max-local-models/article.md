---
title: MacBook Pro M4 Max 64GB 本地模型部署选型：LLM、图像、视频、语音与音乐生成全景
eyebrow: Apple Silicon Local AI Stack
brand: 模型
date: 2026-04-12
strict_i18n: false
strict_density: true
lead: "在 M4 Max 64GB 这类 Apple Silicon 笔记本上部署本地模型，真正的瓶颈不在于“能不能跑起来”，而在于“哪类模型具备成熟的 Metal/MPS 路径、能在 64GB 统一内存内稳定迭代，且交互延迟满足日常工作需求”。本文按大语言模型、Function Calling、文生图、视频生成、语音生成和音乐生成六类任务，从 **内存占用、运行时成熟度、Apple 兼容性、交互体验** 四个维度横向对比，梳理适合 M4 Max 的主力配置组合。"
hero_actions:
  - "先看 LLM 选型 | #llm"
  - "直接看最终建议 | #decision"
panel_label: 核心结论
panel_title: M4 Max 64GB 可以胜任高质量本地 LLM、图像与轻量音频生成，但视频仍然属于“可试验，不宜作为主力生产”。
panel:
  - LLM 的舒适区是 8B 到 14B 的 4-bit 模型；27B 到 32B 可跑，但更适合离线长任务而不是常驻助手。
  - Function Calling 在本地最好走 Qwen3 或 GLM-4；运行栈上是 MLX 负责吞吐，Ollama 或 llama.cpp 负责 API 与工具协议。
  - 文生图的主力组合是 SDXL 和 FLUX.1-schnell；前者兼容性最好，后者提示遵循和画质更强，但更吃统一内存。
  - 视频模型虽已有 Wan2.1 和 CogVideoX 等开源方案，但主流工程优化仍集中于 CUDA，在 Mac 上仅适合跑实验样片，尚难支撑稳定生产流。
metrics:
  - "硬件基线 | M4 Max · 64GB | 统一内存，macOS 15+ 更适合大型 MLX 模型"
  - "任务维度 | 6 类 | LLM / FC / 图像 / 视频 / 语音 / 音乐"
  - "主运行栈 | 5 条 | MLX (oMLX/vMLX) / llama.cpp / Ollama / Diffusers-MPS"
  - "主力参数档 | 8B - 14B | 日常交互式本地助手的最优成本带"
style:
  accent: "#38bdf8"
---

## #baseline 01 / Baseline & Constraints :: 先看机器边界：64GB 统一内存决定了什么能常用，什么只能偶尔跑

Apple Silicon 的优势是统一内存和 Metal 生态，弱点是大量开源生成模型默认以 CUDA 为第一目标。对本次选型，先定义三个判断条件：**能否稳定装下**、**有没有成熟 Apple 运行栈**、**生成时长是否适合日常交互**。其中第一条最重要，因为一旦进入 swap，Mac 的体感会从“可用”直接滑落到“不可持续”。

:::comparison
::versus 方案 1 || Option 1
### 内存占用先于峰值质量
Criterion 01

64GB 并不意味着可以无成本常驻 70B。LLM 除权重外还要叠加 KV cache、上下文和采样缓冲；扩散模型则要叠加文本编码器、VAE、中间 latent 和 attention 工作区。

::versus 方案 2 || Option 2
### 优先选择 Apple 原生或 Metal 一等公民栈
Criterion 02

LLM 首选 MLX-LM，其次是 GGUF + Metal 的 llama.cpp；多模态首选 Hugging Face Diffusers 的 MPS 路线。CUDA 专属优化越重，迁移到 Mac 的折损越大。

::versus 方案 3 || Option 3
### 把“能跑”与“适合工作”分开
Criterion 03

单次能跑通并不代表适合高频使用。本文将运行体验划分为交互级、批处理级和实验级三档：交互级支持高频往返调参，实验级则仅适合跑样片或验证技术可行性。
:::

Weight Math

### 8B 级

4-bit 权重的理论下限约为 8B × 0.5 byte ≈ 4GB。考虑量化元数据、张量布局和运行时开销，日常工作集更接近 5GB 到 7GB。

Weight Math

### 14B 级

理论权重约 7GB，实际常见工作集更接近 9GB 到 12GB。这个区间是 M4 Max 64GB 最适合的高质量常驻档。

Weight Math

### 27B - 32B 级

4-bit 理论权重约 13.5GB 到 16GB，实际工作集容易进入 16GB 到 26GB。可以跑，但上下文一长、并发一多，交互感会明显变差。

Weight Math

### 70B 级

4-bit 理论权重约 35GB，算上缓存后非常容易挤压到系统可用内存边界。对于笔记本形态，不建议作为本地主力。

**结论：**在 M4 Max 64GB 上，模型选型不该围绕“最大的参数量”，而应围绕“14B 级是否已经满足任务质量”。对多数中文助手、工具调用、知识整理和原型生成场景，答案是肯定的。

## #llm 02 / LLM & Tool Use :: LLM 与 Function Calling：Qwen3 和 GLM-4 重新定义了本地选型格局

Apple 官方维护的 MLX-LM 已覆盖 Qwen3 全系列[1]，llama.cpp 的 Metal 后端同样成熟稳定[2]；工具调用层则有 Ollama 配套的单工具、并行工具与 agent loop 完整文档[3]。Qwen3 官方明确推荐通过 Ollama、LM Studio、MLX 和 llama.cpp 本地部署[4]；GLM-4-32B-0414 的模型支持也已合入 llama.cpp 主线[17]；至于采用 MoE 架构的 Llama 4 Scout/Maverick，因总参数量达 109B+，对 64GB 笔记本而言依然偏重[18]。

| 模型 | 参数档 | 本地定位 | Apple 兼容性 | Function Calling | 建议运行栈 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| **Qwen3-8B / 14B** | 8B / 14B | thinking/non-thinking 混合模式、119 语言、MCP 原生支持；Qwen3-4B 即可匹敌 Qwen2.5-72B[4] | 高 | 高 | MLX-LM 做推理；Ollama 或 llama.cpp 暴露接口 | 默认首选。14B 适合主力，8B 适合常驻低延迟。相比 Qwen2.5 同级有代际提升。 |
| **Qwen3-30B-A3B (MoE)** | 30B 总参 / 3B 激活 | MoE 架构使推理开销只有 3B 级别，质量超过 QwQ-32B[4] | 高 | 高 | Ollama 或 llama.cpp | MoE 在 M4 Max 上极划算 — 权重虽大但激活参数少、单 token 延迟低。性价比最高选项。 |
| **GLM-4-32B-0414** | 32B | BFCL V4 开源 FC 第一（72.38%，MIT 许可）[17]、强 agent 能力、代码生成 | 中 | 很高 | llama.cpp 或 Ollama（已有合并实现） | FC 核心需求首选。BFCL V4 开源第一。32B 在 64GB 上更适合离线任务。 |
| **Gemma 4 26B / 31B IT** | 26B / 31B | 基于 Gemini 3 研究构建，原生 function calling + 多模态（视觉 + 音频）+ 140 语言、面向工作站和编码助手的 agentic 设计[5] | 高 | 高 | Ollama、Transformers、Gemma.cpp 或 MLX 社区量化版 | Google 系最新世代。AIME 2026 数学 88.3%，τ2-bench agentic 85.5%，已上架 Ollama 和 LM Studio。26B 适合常驻，31B 更适合离线任务。 |
| **Llama 4 Scout (MoE)** | 109B 总参 / 17B 激活 | 原生多模态、10M 上下文、MoE 架构[18] | 高 | 中 | llama.cpp 或 Ollama | 109B 总参 Int4 约 55GB 权重，加 KV cache 在 64GB 上极紧张。仅作实验选项。 |
| **Qwen3-32B / GLM-Z1-32B** | 32B | 复杂推理与深度思考（GLM-Z1 支持 rumination 深度研究模式） | 中 | 高 | MLX-LM 或 llama.cpp，离线任务 | 可跑，但更适合“批处理大脑”，不适合常驻交互助手。 |

:::accordion
::panel { open: true }
### 为什么 Qwen3 是本地主力位（而不是 Qwen2.5）
Qwen3 于 2025 年 4 月发布，相比 Qwen2.5 带来三项关键升级：(1) 引入 thinking/non-thinking 混合模式，支持按任务复杂度动态切换思考模式；(2) 预训练数据从 18T 扩充至 36T tokens，覆盖 119 种语言；(3) 同尺寸模型能力跨代跃升——Qwen3-4B 即可匹敌 Qwen2.5-72B，Qwen3-30B-A3B（MoE，3B 激活）更超越 QwQ-32B。官方明确推荐 Ollama、LM Studio、MLX 和 llama.cpp 四种本地运行方式[4]。

::panel
### 为什么 Gemma 4 值得作为第二方案
Gemma 4 是 Google 基于 Gemini 3 技术构建的最新开源模型，26B/31B 两档面向工作站和编码助手。原生支持 function calling、多模态（视觉 + 音频）和 140 语言[5]。在 AIME 2026 上达到 88.3%，τ2-bench agentic tool use 达到 85.5%，已上架 Ollama 和 LM Studio。26B 的内存占用与 Gemma 3 27B 接近但能力有代际提升。

::panel
### Function Calling 应该选哪个运行层
若目标是开发速度，优先 Ollama，因为它已内置单工具、并行工具与 agent loop 样例[3]。若目标是协议控制和 JSON 约束，优先 llama.cpp 的 OpenAI 兼容 server 与 grammar。若目标是 Apple 原生吞吐，则用 MLX-LM 跑模型，把工具协议留给上层服务适配。
:::

## #multimodal 03 / Multimodal Matrix :: 多模态模型对比：图像和音频已经实用，视频仍然明显偏向实验

Hugging Face Diffusers 已将 Apple Silicon 的 MPS 纳入正式优化路径，官方建议在内存受限时开启 attention slicing，同时提醒 MPS 上的 batch 生成偶有不稳[6]。这让图像与部分音频模型在 Mac 上具备了稳定的工程运行路径；反观视频模型，主流优化仍集中于 CUDA、TorchAO、FSDP 或多卡并行，Mac 兼容层的成熟度远不及图像生态[8][9]。

| 类别 | 模型 | 兼容性 | 资源压力 | 优点 | 局限 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| **文生图** | SDXL | 高 | 中 | Diffusers MPS 和 ComfyUI 路线成熟，社区资料最丰富 | 提示遵循与文字渲染弱于新一代 DiT | 把它当成“最稳的本地文生图底盘”。 |
| **文生图** | FLUX.1-schnell | 中 | 高 | 提示遵循强，开源权重，4-step 采样路线清晰[7] | 比 SDXL 更吃内存，更适合 64GB 而不是 16GB 机器 | 质量优先就选它；若愿意工程化，MLX 化收益大。 |
| **文生图** | FLUX.1-dev | 中 | 高 | 上限更高，适合精修 | 更慢，许可也更复杂 | 不适合做默认本地图像生成器。 |

| 类别 | 模型 | 官方资源线索 | Mac 兼容性 | 实用判断 | 备注 |
| --- | --- | --- | --- | --- | --- |
| **视频** | Wan2.1 T2V-1.3B | 官方称 1.3B 版仅需 8.19GB VRAM，可出 5 秒 480P，且已接入 Diffusers[8] | 中 | 可试验 | 主仓库样例仍以 CUDA 为主；在 Mac 上更像离线样片工具。 |
| **视频** | CogVideoX-2B | 官方给出 diffusers 最低 5GB 级显存入口，并强调量化主要面向 NVIDIA 路线[9] | 中 | 可试验 | 英文 prompt 友好，但大部分实战优化仍围绕 TorchAO 与 CUDA。 |
| **视频** | Wan2.1 14B / CogVideoX-5B+ | 仓库重点展示的是单卡高端 GPU、多卡或 CPU offload 场景[8][9] | 低 | 不建议 | 在 Mac 上可折腾，但不应作为主生产链路。 |
| **语音** | Kokoro-82M | 82M 参数，仓库直接写明可在 Mac 上启用 MPS fallback[10] | 高 | 主力可用 | 轻量、快、部署简单，是本地 TTS 的默认答案。 |
| **语音** | F5-TTS | 主仓库提供推理、Gradio、运行时与 MLX 社区实现线索[11] | 中 | 批处理可用 | 比 Kokoro 更适合追求表现力与风格控制，但栈更重。 |
| **音乐** | MusicGen-medium | 1.5B 参数，Transformers 直接支持本地 text-to-audio[12] | 中 | 可用 | 更适合无歌词配乐和短音乐片段，英文提示更稳。 |
| **音乐 / 音效** | Stable Audio Open 1.0 | 可生成最长 47 秒 44.1kHz 立体声音频，支持 diffusers 路线[13] | 中 | 偏实验 | 更适合音效、环境声和氛围片段，不是最省资源的本地音乐方案。 |

Image

### 文生图已经进入“本地实用期”

SDXL 胜在生态兼容性最稳，FLUX.1-schnell 则胜在提示遵循与画质上限。若追求稳定工作流，建议先跑通 SDXL；若追求更高画质与语义对齐，再投入精力做 FLUX 的工程化适配。

Video

### 视频生成仍是 Mac 上的高成本试验

Wan2.1 和 CogVideoX 都给了开源入口，但绝大多数速度优化、量化路径和社区经验仍围绕 NVIDIA。Mac 可做 demo，不适合做高频生产。

Audio

### 语音生成最适合走轻量模型

Kokoro 这类 82M 级模型和 Apple Silicon 的匹配度极高。对日常朗读、播客草稿、角色原型，它的收益远高于部署复杂的大模型 TTS。

## #engines 04 / Model Engines :: 模型运行引擎横评：oMLX、vMLX、Ollama、LM Studio、MLX-LM、llama.cpp、Jan 和 GPT4All

"模型"和"跑模型的引擎"是两回事。同一个 Qwen3-14B，用 MLX-LM 跑和用 oMLX 跑，速度、功能和开发体验可以差一个等级。这一节把八个最常见的本地引擎 / 平台放在一起比较，维度是：**推理性能**、**Apple Silicon 兼容性**、**功能丰富度**（API、工具调用、多模态、RAG、MCP）和**社区活跃度**。其中 oMLX 和 vMLX 是 2026 年 MLX 原生赛道最值得关注的两个全功能推理服务器，本节将重点展开它们的差异。

| 引擎 | 类型 | 推理性能 | Apple 兼容性 | 功能丰富度 | 社区活跃度 | M4 Max 建议定位 |
| --- | --- | --- | --- | --- | --- | --- |
| **Ollama** | CLI 服务 + API | 高 | 高 | 高 | 高 | 默认首选。底层基于 llama.cpp，开箱即用的 OpenAI 兼容 API、工具调用（单/并行/agent loop）、流式输出[3]。社区最大、教程最多。 |
| **LM Studio** | GUI + CLI + API | 高 | 高 | 高 | 高 | 可视化首选。同时支持 GGUF (llama.cpp) 和 MLX 双后端，MCP 集成、JS/Python SDK、文档对话 RAG、headless 部署 (llmster)、speculative decoding[14]。 |
| **MLX-LM** | Python 库 / CLI | 高 | 最高 | 中 | 中 | Apple 原生吞吐最优。Apple 官方团队维护，量化、长上下文缓存、wired memory 调优原生支持[1]。功能聚焦于推理与模型转换，没有内置 GUI 或 API server。 |
| **oMLX** | macOS App + CLI + API | 高 | 最高 | 很高 | 很高 | MLX 原生 LLM 服务化首选（10.3K stars / 48 贡献者）。基于 mlx-lm 构建，continuous batching、2 层 KV cache（RAM 热层 + SSD 冷层）、DFlash 投机解码（1.7–4.1x 加速）、oQ GPTQ 增强量化、多模型并存 + LRU。支持 VLM/OCR、embedding/reranker、tool calling、MCP。原生 PyObjC 菜单栏 App 内存开销极低。Homebrew 服务 / Claude Code 优化。社区基准平台 10 万+条提交[19]。 |
| **vMLX** | Electron App + CLI + API | 高 | 最高 | 很高 | 中 | 全栈多模态首选（313 stars / 5 贡献者）。5 层 KV cache（Prefix + Paged + KV Quant q4/q8 + Disk + Block Disk）、JANG 自适应混合精度量化、Smelt 部分 MoE 专家加载、分布式 pipeline parallelism 跨多台 Mac。覆盖 LLM/VLM + 文生图（Flux Schnell/Dev/Klein）+ 图像编辑 + TTS（Kokoro）+ STT（Whisper）。14 种 tool calling 解析器 + 26+ 内置工具。OpenAI + Anthropic + Ollama 兼容 API + API Gateway 单端口多模型路由[20]。 |
| **llama.cpp** | C++ 库 / CLI / Server | 高 | 高 | 高 | 很高 | 底层基石。Metal 为一等公民后端，OpenAI 兼容 server、grammar 约束、speculative decoding、多模态[2]。是 Ollama 和 LM Studio 的推理后端之一。 |
| **Jan** | GUI 客户端 + API | 高 | 高 | 高 | 中高 | 终端用户首选。开源（AGPL），500 万+下载，内置 web search、MCP、远程 provider 接入、多语言 UI[15]。同时支持 GGUF 和 MLX（社区测试 MLX q4 达 90 tok/s vs llama.cpp 49 tok/s）。 |
| **GPT4All** | GUI 客户端 | 中 | 中 | 中 | 中 | 全离线入门。LocalDocs RAG 可直接对本地文件问答[16]。但推理栈非 MLX 原生，没有 tool calling API，不适合做开发级集成。 |

:::accordion { title: "引擎选型细节" }
::panel { open: true }
### oMLX vs vMLX：MLX 赛道的两条路线
**oMLX（10.3K stars，48 贡献者）**和 **vMLX（313 stars，5 贡献者）**都是基于 Apple MLX 构建的全功能本地推理服务器，但设计哲学完全不同。

**架构哲学**：oMLX 专注于 LLM 推理品质 — 它只做文本/VLM，但把推理路径打磨得极深：DFlash 投机解码（block diffusion，Qwen3.5-9B 上实测 4.1x 加速[21]）、oQ GPTQ 增强量化、Claude Code 专用优化（context scaling + SSE keep-alive）。vMLX 走全栈路线 — LLM、VLM、文生图（Flux）、图编辑（Qwen/Kontext）、TTS（Kokoro）、STT（Whisper）全部整合在同一个 API 服务器里。

**缓存架构**：oMLX 采用 2 层设计（RAM 热层 + SSD 冷层），block-based，灵感来自 vLLM，即使服务器重启也能从 SSD 恢复。vMLX 设计了 5 层栈（Memory-Aware Prefix、Paged、KV Quant q4/q8、Disk、Block Disk），加上 Hybrid SSM 缓存（支持 Mamba + Attention 混合架构如 Nemotron-H）。

**量化方案**：oMLX 支持标准 MLX 量化与 oQ（基于 GPTQ 的增强量化，支持 MoE batched expert 处理）；vMLX 则采用 JANG 自适应混合精度量化，按层类型动态分配 bit 宽度——在 MiniMax M2.5 上，JANG_2L（2-bit 混合）测得 74% 准确率，远高于 MLX 标准 4-bit 的 26.5%（来源：vMLX README，MMLU-Pro 测试）。

**投机解码**：oMLX 集成了 DFlash（block diffusion speculative decoding），用 1B 参数的 draft 模型并行生成 16 个 token 后由 target 模型一次验证，输出无损。在 M5 Max 64GB 上，Qwen3.5-9B 从 31 tok/s 加速到 127 tok/s[21]。vMLX 支持传统 draft model + Prompt Lookup Decoding（无需 draft 模型，利用 n-gram 匹配，适合结构化输出如 JSON/代码）。

**桌面端**：oMLX 用原生 PyObjC 构建 macOS 菜单栏 App — 内存开销极低，纯后台服务。vMLX 用 Electron + React 构建 5 模式桌面 App（Chat/Server/Image/Tools/API），功能更全（含内置 agentic 编程聊天、图像生成 UI、模型转换工具），但 Electron 本身约占 200-400MB 额外内存。

**社区与成熟度**：oMLX 社区更大（10.3K stars、48 贡献者、99,974 条用户基准提交），发展了 63 个 release。vMLX 更年轻（313 stars、5 贡献者），但迭代极快（14 个 engine release + 74 个 Studio release），在多模态功能覆盖上走得更远。

**独有能力**：oMLX 有 DFlash 投机解码、oQ 量化、Claude Code 优化、Homebrew 服务模式、社区基准平台。vMLX 有 JANG 混合精度量化、Smelt 部分专家加载（MoE 模型超出 RAM 时只加载部分 expert）、分布式 pipeline parallelism（多台 Mac 联合推理）、API Gateway 单端口多模型路由、Ollama 兼容 API。

**选择建议**：如果你主要跑 LLM/VLM 推理并追求极致吞吐和社区生态，选 oMLX（特别是搭配 DFlash 可以让中等模型接近大模型的体验）。如果你需要一个引擎统一覆盖 LLM + 图像 + 音频，并且看重内置 GUI 和 agentic 工具链，选 vMLX。二者都支持 OpenAI + Anthropic 兼容 API，上层应用切换成本可控。

::panel
### vMLX 多模态能力：在 M4 Max 64GB 上能跑什么
vMLX 内置集成 mflux 与 mlx-audio，在单一 API 服务器内即可跑通文生图、图编辑、TTS 与 STT，省去了额外部署 Diffusers 或 ComfyUI 的麻烦[20]。

**文生图**：支持 Flux Schnell（4 步快速生成，约 6-24GB 显存）、Flux Dev（20 步高质量，约 6-24GB）、Z-Image Turbo（4 步快速）和 FLUX.2 Klein 4B/9B — 均为 MLX 原生推理路径。在 M4 Max 64GB 上，同时加载 LLM + Flux Schnell 4-bit 是可行的。

**图编辑**：支持 Qwen Image Edit（指令式编辑，约 54GB 全精度 — M4 Max 64GB 会非常紧张）和 Flux Kontext（主题一致性编辑）。实际使用建议选 Kontext 而非 Qwen Image Edit，后者的内存需求接近硬件极限。

**音频**：TTS 通过 Kokoro（82M 参数），STT 通过 Whisper — 两者内存占用极低，可以和 LLM 共存无压力。通过 `/v1/audio/speech` 和 `/v1/audio/transcriptions` 标准 API 调用。

**对比 Diffusers + MPS 路线**：vMLX 的优势是统一 API 和零环境隔离成本 — 你不需要额外的 Python 虚拟环境、PyTorch 版本管理或 ComfyUI 节点配置。劣势是 mflux 的模型生态不如 Diffusers 丰富（不支持 SDXL LoRA、ControlNet 等高级工作流），且没有 ComfyUI 的可视化节点编辑器。如果你的图像任务是"快速生成插图"，vMLX 路线更简单；如果是"精细控制构图和风格迁移"，仍然需要 Diffusers + ComfyUI。

::panel
### oMLX vs MLX-LM：什么关系、怎么选
**MLX-LM 是底层库**：由 Apple 官方团队维护的 Python 推理与量化框架[1]，涵盖模型加载、文本生成、量化与提示缓存等核心机制，但不内置常驻 API server、多模型管理或 GUI。

**oMLX 是基于 mlx-lm 构建的服务化层**：它在 mlx-lm 的推理核心之上加入了 continuous batching、block-based 分级 KV cache（RAM 热层 + SSD 冷层）、多模型并存 + LRU 自动管理、macOS 菜单栏原生 App、OpenAI/Anthropic 兼容 API、VLM/embedding/reranker 支持、tool calling 和 MCP 集成[19]。

**选择逻辑**：如果你只需要在 Python 脚本里调用 MLX 跑一次推理或做模型量化，直接用 MLX-LM。如果你需要把 MLX 模型作为常驻服务暴露 API 给多个客户端（如 Claude Code、Copilot、自定义 agent），让多个模型共存并自动管理内存，那 oMLX 就是 MLX-LM 的"生产级壳"。二者不冲突 — oMLX 的推理路径就是 MLX-LM。

::panel
### Ollama vs LM Studio：哪个更适合日常
如果你主要需要 API 接入和自动化，Ollama 更适合 — 它天生是一个 daemon 服务，开机后台运行，任何脚本或应用直接调用 REST 接口[3]。如果你更想要可视化聊天、参数调节和模型管理界面，LM Studio 是更好的选择。LM Studio 0.4 以后还支持 headless 模式 (llmster)，可以纯粹当 server 用[14]。两者都基于 llama.cpp 后端，切换成本极低。但注意：Ollama 和 LM Studio 都不支持文生图或音频生成 — 需要这些能力必须走 vMLX 或 Diffusers 路线。

::panel
### Jan 适合什么人
Jan 的定位是"个人 AI 客户端"，内置 web search、MCP 和多 provider 接入（OpenAI、Claude、Gemini、HuggingFace 等）[15]。如果你想要一个"类 ChatGPT 但完全本地"的体验，不想折腾命令行和 API，Jan 是最好的起点。但如果你要做 agent 或自动化管线，Ollama 和 llama.cpp 的工程控制力更强。

::panel
### GPT4All 的定位与局限
GPT4All 的核心卖点在于全离线运行与 LocalDocs 本地文档问答[16]，但它未开放 tool calling API，推理后端也不支持 MLX 原生加速，模型跟进速度与社区活跃度均滞后于 Ollama 和 LM Studio。在 M4 Max 上，它只适合充当"免命令行的备用聊天窗口"，不适合纳入主力开发栈。
:::

Dev

### 开发者：oMLX 或 vMLX

如果主要跑 LLM/VLM 推理，oMLX 是专精选择 — DFlash 投机解码、Claude Code 优化和 Homebrew 服务模式是纯 LLM 路线独有的。如果需要一个引擎统一覆盖 LLM + 图像 + 音频（如 agentic 应用同时调用 chat、image gen 和 TTS），vMLX 适合用单 API 串联全栈。GGUF 生态优先则仍选 Ollama。

Power User

### 高阶用户：vMLX 或 LM Studio

vMLX 配套的 MLX Studio 集成了最齐全的五模式 GUI（Chat、Server、Image、Tools、API）；LM Studio 则胜在跨平台（macOS/Windows/Linux）与 GGUF + MLX 双引擎切换，便于跨设备协同。二者均原生支持 MCP 与 OpenAI 兼容 API。

Casual

### 轻度用户：Jan

界面最友好、开箱即用、内置搜索和多 provider。不需要折腾命令行就能用本地模型替代 ChatGPT 和 Perplexity。

## #stack 05 / Runtime Stacks :: 推荐运行栈：不要试图用一套框架统一所有任务

本地模型部署在 Mac 上最常见的误区，是试图用一种框架覆盖 LLM、图像、视频和音频。实际上更合理的方式是按任务拆栈：LLM 用 oMLX 或 Ollama；图像和音频用 Diffusers/MPS 或 vMLX；视频只在有明确需求时单独搭建实验环境。或者，若追求统一管理，用 vMLX 一个服务器覆盖全部模态。

Stack A

### MLX-LM

- 最适合 Apple Silicon 上的 LLM 推理与量化。
- 官方支持模型转换、量化、长上下文缓存和大模型 wired memory 调优[1]。
- 适合作为“核心推理引擎”，但工具协议最好交给上层服务处理。

Stack B

### llama.cpp / GGUF

- Metal 是一等公民后端，OpenAI 兼容 server 与 grammar 支持完整[2]。
- 适合追求模型兼容性、轻量 API 服务、JSON 约束和多模型切换。
- 如果要跑很多社区量化模型，它往往比 MLX 更省心。

Stack C

### Ollama

- 最适合快速上手 agent loop、并行工具调用和 OpenAI 兼容接入[3]。
- 适合把本地模型包装成统一 API，不适合承担所有底层优化。
- 建议把它放在应用层，而不是当作唯一推理栈。

Stack D

### Diffusers + MPS 或 vMLX

- 图像、音频和部分视频任务的主通道。
- Diffusers + MPS 官方明确支持 Apple Silicon，但需注意 attention slicing、batch 不稳定和大张量限制[6]。适合需要 LoRA、ControlNet 等高级管线的场景。
- vMLX 的 mflux 路线则是更轻量的替代方案：单端口统一 API、免装额外 PyTorch 环境，代价是暂不支持 SDXL 生态中的高级插件与工作流节点[20]。

1

### 日常助手栈

Qwen3-14B 4-bit + oMLX（推荐，含 DFlash 投机解码 + Homebrew 服务 + Claude Code 优化）或 Ollama（GGUF 生态优先）。如需同时跑图像/音频，用 vMLX 一站式替代。

2

### 图像创作栈

高级工作流（LoRA/ControlNet/ComfyUI）→ SDXL + Diffusers/MPS；快速插图生成 → vMLX Flux Schnell（`pip install vmlx[image]`，无需额外环境）。FLUX.1-schnell 作为高质量补充，两种路线分环境安装。

3

### 音频栈

Kokoro 做常规 TTS，MusicGen 做短音乐草稿，Stable Audio Open 做环境声和音效。F5-TTS 只在确实需要更强表现力时单独启用。

4

### 视频栈

单独隔离为实验环境。优先尝试 Wan2.1 1.3B 或 CogVideoX-2B，不把它们并入主工作流，也不把视频生成的成功率当作整机 AI 能力的判断依据。

## #decision 06 / Recommendations :: 最终建议：先把 Qwen3-14B、SDXL 和 Kokoro 跑顺，再决定是否投入 FLUX 与视频

若要在 M4 Max 64GB 上搭建一套长期易维护的本地 AI 环境，与其一次性塞满各类热门模型，不如分三步渐进落地：先跑稳日常主力 LLM 与轻量语音，再按需扩展高质量图像，最后才独立评估视频生成。可根据实际业务目标从四套配置方案中择一落地。

Default Build

### 默认工作组合

- LLM：Qwen3-14B 4-bit
- 引擎：oMLX（DFlash 投机解码 + Homebrew 服务）
- Function Calling：oMLX 内置 tool calling
- 文生图：SDXL via Diffusers/MPS
- 语音：Kokoro
- 音乐：MusicGen-medium

纯 LLM 推理走 oMLX 最优。图像/音频分栈部署，环境隔离最稳定。

Unified Build

### 一体化组合（vMLX）

- LLM：Qwen3-14B 4-bit
- 引擎：vMLX（单 API 服务器）
- 文生图：Flux Schnell 4-bit（vMLX 内置）
- 语音：Kokoro TTS + Whisper STT（vMLX 内置）
- Function Calling：14 种自动解析器 + 26+ 内置工具

用 vMLX 统一所有模态。单服务器、单 API 端口、零环境隔离成本。适合快速搭建 agentic 应用的开发者。

Quality Build

### 质量优先组合

- LLM：Qwen3-32B 或 GLM-4-32B 离线任务 + Qwen3-14B 常驻
- 引擎：oMLX（多模型 LRU + DFlash）
- 文生图：FLUX.1-schnell
- 语音：F5-TTS
- 音乐：Stable Audio Open 1.0

适合愿意接受更长生成时间、并愿意为环境隔离投入更多工程成本的用户。

Research Build

### 研究实验组合

- 视频：Wan2.1 T2V-1.3B 或 CogVideoX-2B
- 图像：SDXL 作为对照基线
- LLM：Gemma 4 26B 或 Qwen3-14B 负责 prompt 扩展

适合验证视频与多模态链路，不适合作为日常生产环境。

A

### 如果你主要做本地知识助手与 Agent

直接选 Qwen3-14B + oMLX。oMLX 的 DFlash 投机解码可让中等模型接近大模型的交互体验（Qwen3.5-9B 从 31 tok/s 加速到 127 tok/s，测于 M5 Max 64GB[21]）。若需要同时调用图像和音频生成，用 vMLX 一站式替代。若 function calling 是核心需求，额外测试 GLM-4-32B-0414。

B

### 如果你主要做图像创作

精细控制路线：先上 SDXL + Diffusers/MPS，确认 VAE、LoRA、ControlNet 和 ComfyUI 节点跑顺，再追加 FLUX.1-schnell。快速生成路线：vMLX + Flux Schnell（`pip install vmlx[image]` → `vmlx serve schnell`），无需 PyTorch 环境，但不支持 SDXL 生态插件。

C

### 如果你想做视频

结论很直接：M4 Max 64GB 可以研究视频生成，但不应该被当作视频生成主机。若视频是高频生产任务，迁移到有大显存 NVIDIA 的桌面机或云端会更合理。

## #references 07 / References :: 参考来源

- [1] Apple MLX Team. — https://github.com/ml-explore/mlx-lm | MLX-LM 面向 Apple Silicon 的推理、量化、长上下文缓存、大模型 wired memory 和 Hugging Face 集成说明。
- [2] ggml-org. — https://github.com/ggml-org/llama.cpp | Metal 为 Apple Silicon 一等公民后端、GGUF 量化、OpenAI 兼容 server、grammar 约束输出与 benchmark 工具。
- [3] Ollama. — https://docs.ollama.com/capabilities/tool-calling | Ollama 在本地模型上支持单工具、并行工具、多轮 agent loop 和流式 tool calling 的协议与样例。
- [4] Qwen Team. — https://qwenlm.github.io/blog/qwen3/ | Qwen3 全系列（0.6B—235B-A22B）开源 Apache 2.0，thinking/non-thinking 混合模式、119 语言、MCP 原生支持、36T tokens 预训练。官方推荐 Ollama / LM Studio / MLX / llama.cpp 本地运行。
- [5] Google DeepMind. — https://deepmind.google/models/gemma/gemma-4/ | 基于 Gemini 3 研究构建的最新开源模型。四个尺寸：E2B / E4B（移动端）/ 26B / 31B（工作站）。原生 function calling + 多模态（视觉 + 音频）+ 140 语言 + agentic workflow。AIME 2026 达 88.3%，τ2-bench agentic 85.5%。已上架 Ollama、LM Studio、Kaggle 和 HuggingFace。
- [6] Hugging Face. — https://huggingface.co/docs/diffusers/optimization/mps | Apple Silicon 上的 MPS 支持、attention slicing 建议、batch 生成不稳定警告，以及 PyTorch 版本要求。
- [7] Black Forest Labs. — https://github.com/black-forest-labs/flux | FLUX.1 open-weight 模型列表、本地安装路径，以及 schnell / dev 等模型家族的开源入口。
- [8] Wan Team. — https://github.com/Wan-Video/Wan2.1 | Wan2.1 1.3B 与 14B 视频模型、Diffusers 接入、1.3B 版 8.19GB VRAM 说明、以及 CUDA / 多卡导向的优化路径。
- [9] Z.ai / THUDM. — https://github.com/zai-org/CogVideo | CogVideoX 2B/5B/1.5-5B 的内存需求、推理速度、Diffusers 路线、TorchAO 量化与 CUDA 侧优化说明。
- [10] Hexgrad. — https://github.com/hexgrad/kokoro | Kokoro-82M 的参数规模、Python 推理方式、Mac Apple Silicon MPS fallback 说明和多语言支持。
- [11] SWivid. — https://github.com/SWivid/F5-TTS | F5-TTS 的推理方式、Apple Silicon 安装入口、运行时方案与 MLX 社区实现线索。
- [12] Meta FAIR. — https://huggingface.co/facebook/musicgen-medium | MusicGen-medium 为 1.5B 参数模型，Transformers 可直接本地运行，适合英文文本驱动的无歌词音乐生成。
- [13] Stability AI. — https://huggingface.co/stabilityai/stable-audio-open-1.0 | 最长 47 秒、44.1kHz 立体声、stable-audio-tools 与 diffusers 双路径，以及更偏音效与环境声的限制说明。
- [14] Element Labs. — https://lmstudio.ai/docs | LM Studio 同时支持 llama.cpp (GGUF) 和 Apple MLX 双后端、MCP client 集成、OpenAI 兼容 API、JS/Python SDK、headless 部署 (llmster)、文档对话 RAG 和 speculative decoding。
- [15] Jan.ai. — https://jan.ai/ | 开源（AGPL），500 万+下载，支持 GGUF 和 MLX 引擎、内置 web search、MCP、多 provider 接入和多语言 UI。社区测试 M 系列 Mac 上 MLX q4 达到 90 tok/s。
- [16] Nomic AI. — https://www.nomic.ai/gpt4all | 全离线本地 LLM 客户端，支持 macOS / Windows / Linux，LocalDocs RAG 可对本地文件问答，不提供 tool calling API。
- [17] 智谱 AI / Z.ai. — https://github.com/THUDM/GLM-4 | GLM-4-32B-0414 在 BFCL V4 开源 FC 榜排名第一（72.38%，MIT 许可），强 agent / 代码 / 报告能力。GLM-Z1-32B-0414 为深度推理版，支持 rumination。llama.cpp、vLLM、Transformers 均已合并模型实现。
- [18] Meta AI. — https://ai.meta.com/blog/llama-4-multimodal-intelligence/ | Llama 4 Scout（109B 总参 / 17B 激活 / 16 experts）和 Maverick（400B 总参 / 17B 激活 / 128 experts）为 MoE 架构，原生多模态，Scout 支持 10M 上下文。
- [19] jundot. — https://github.com/jundot/omlx | Apple Silicon 原生推理服务器（10.3K stars，48 贡献者，Apache 2.0）。continuous batching、2 层 KV cache（RAM 热层 + SSD 冷层）、DFlash 投机解码集成、oQ GPTQ 增强量化、多模型并存 + LRU 管理、macOS 原生 PyObjC 菜单栏 App、Homebrew 守护进程、OpenAI/Anthropic 兼容 API、VLM/OCR/embedding/reranker、tool calling 和 MCP 集成、Claude Code 优化。社区基准平台 omlx.ai 收集 99,974+ 条用户提交结果。
- [20] jjang-ai. — https://github.com/jjang-ai/vmlx | 全栈多模态本地 AI 引擎（313 stars，Apache 2.0）。5 层 KV cache 栈、JANG 自适应混合精度量化、Smelt 部分 MoE 专家加载、分布式 pipeline parallelism。覆盖 LLM/VLM + 文生图（Flux Schnell/Dev/Klein via mflux）+ 图编辑（Qwen/Kontext）+ TTS（Kokoro）+ STT（Whisper）。14 种 tool calling 解析器、26+ 内置工具。OpenAI + Anthropic + Ollama 兼容 API + API Gateway。配套桌面 App MLX Studio（Electron，5 模式）。
- [21] Chen, Jian et al. — https://github.com/bstnxbt/dflash-mlx | 基于 block diffusion 的无损投机解码（arXiv: 2602.06036）。1B draft 模型并行生成 16 token，target 一次验证。Qwen3.5-9B 在 M5 Max 64GB 上从 31 tok/s 加速到 127 tok/s（4.1x）。已集成至 oMLX v0.3.5。

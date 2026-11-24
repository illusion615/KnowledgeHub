---
title: 大语言模型百科全书
eyebrow: LLM Wiki
brand: 模型
date: 2026-04-13
strict_i18n: false
strict_density: true
lead: 系统梳理大语言模型的核心架构、训练方法、主流模型族谱、关键能力、推理优化与评测基准——从 Transformer 到 Reasoning Model 的完整知识图谱。
hero_actions:
  - "从架构开始 | #architecture"
  - "速查模型族谱 | #families"
panel_label: 知识全景
panel_title: 从基础原理到前沿趋势的七大知识维度
panel:
  - Transformer 架构与注意力机制
  - 预训练 → SFT → RLHF / DPO 训练流水线
  - 8 大模型家族深度画像
  - 推理、工具调用、代码、多模态四大能力
metrics:
  - "模型家族 | 8 | 主流商业与开源家族"
  - "参数规模跨度 | 1B–2T | 从边缘设备到数据中心"
  - "上下文窗口 | ≤10M tokens | Gemini 1.5 Pro 最高纪录"
  - "关键基准 | 12+ | MMLU / HumanEval / BFCL 等"
style:
  accent: "#0ea5e9"
---

## #architecture 01 / Architecture Foundations :: 架构基础

从 Transformer 原始论文到现代 LLM 的关键架构组件。

:::accordion
::panel { open: true }
### Transformer 架构
2017 年 Google Brain 的论文 *"Attention Is All You Need"* 提出了 Transformer 架构，彻底取代了 RNN/LSTM 的序列建模范式。Transformer 的核心创新在于 **自注意力（Self-Attention）机制**，允许序列中每个位置直接关注所有其他位置，计算复杂度为 O(n²·d)。

🔑

**Multi-Head Attention**

将 Q/K/V 投影到多个子空间（heads），每个 head 独立计算注意力后拼接。GPT-4 级模型使用 96–128 个 heads，每个 head 维度 128。

📍

**位置编码**

Transformer 缺乏序列顺序感知。原始论文使用正弦位置编码；现代 LLM 普遍采用 **RoPE**（Rotary Position Embedding），支持长度外推至训练长度的 4–8 倍。

📐

**Layer Normalization**

Pre-LN（放在 attention/FFN 之前）比 Post-LN 训练更稳定，已成为 GPT-3 之后的默认选择。RMSNorm 进一步简化计算，被 LLaMA/Qwen 采用。

⚡

**前馈网络（FFN）**

每层包含两次线性变换 + 激活函数。GPT-2/3 使用 GELU，LLaMA 系列切换为 SwiGLU（FFN 参数量增加 33%，但性能更优）。FFN 隐藏维度通常为 embedding 维度的 4 倍。

::panel
### 三种 Transformer 变体
| 变体 | 注意力掩码 | 典型用途 | 代表模型 |
| --- | --- | --- | --- |
| **Encoder-only** | 双向（全可见） | 文本分类、NER、句嵌入 | BERT, RoBERTa, DeBERTa |
| **Decoder-only** | 因果掩码（只看左侧） | 文本生成、对话、代码 | GPT 系列, LLaMA, Claude |
| **Encoder-Decoder** | 编码器双向 + 解码器因果 | 翻译、摘要、Seq2Seq | T5, BART, mBART |

当前主流 LLM（GPT-4、Claude、Gemini、LLaMA、DeepSeek）几乎全部采用 **Decoder-only** 架构。研究表明在大规模数据下，decoder-only 的预训练效率和涌现能力优于 encoder-decoder。

::panel
### Tokenization 与词表设计
Tokenizer 是 LLM 的"感知入口"——文本先被切分为 token 序列，再映射为 embedding 向量。词表大小直接影响模型的多语言能力和推理效率。

| 算法 | 原理 | 使用者 | 词表规模 |
| --- | --- | --- | --- |
| **BPE** | 贪心合并高频字节对 | GPT 系列 (tiktoken) | ~100K–200K |
| **SentencePiece** | Unigram LM 或 BPE，语言无关 | LLaMA, Gemini, T5 | ~32K–256K |
| **WordPiece** | 最大似然合并 | BERT, DeBERTa | ~30K |

**趋势**：词表从 GPT-2 的 50,257 扩大到 GPT-4o 的 200,019（o200k_base），Qwen2 使用 151,643 tokens。更大词表提升中文/代码的 token 效率（同一段中文文本所需 token 数减少 30–50%），但增加 embedding 层参数。

::panel
### 注意力效率优化
标准自注意力的 O(n²) 复杂度是长上下文的核心瓶颈，主流工程与架构优化方案包括：

**FlashAttention**

通过 IO-aware 分块计算，将注意力的 HBM 读写从 O(N²) 降至 O(N²/M)（M = SRAM 大小）。不改变数学结果，纯工程优化。FlashAttention-2 在 A100 上实现 ~230 TFLOPS（理论峰值的 72%）。

**GQA（Grouped-Query Attention）**

介于 MHA 和 MQA 之间：将 query heads 分组共享 KV heads。LLaMA 2 70B 使用 8 个 KV heads / 64 个 Q heads，KV cache 内存降低 8 倍，解码吞吐量提升 30%，质量损失可忽略。

**Sliding Window Attention**

Mistral 7B 首创：每层只关注局部窗口（4,096 tokens），依靠多层堆叠让有效感受野覆盖全上下文。搭配 RoPE 外推可处理 32K+ tokens。

**Ring Attention**

将长序列分段分布到多台设备，各设备并行计算本地注意力后环形传递 KV block。理论上可将上下文长度线性扩展到数百万 tokens（Gemini 1.5 Pro 的 10M tokens 验证路线之一）。
:::

## #training 02 / Training Paradigms :: 训练范式

从预训练到对齐：现代 LLM 训练流水线的三个阶段。

:::accordion
::panel { open: true }
### 阶段一：预训练（Pre-training）
预训练的目标是让模型通过海量文本学习语言的统计规律和世界知识。Decoder-only 模型使用 **自回归语言建模**（Next Token Prediction, NTP）作为训练目标——给定前缀 token 序列，预测下一个 token。

**数据规模**

LLaMA 3.1 405B 使用约 15T tokens 训练数据（来自公开互联网、代码、书籍、论文）。GPT-4 的训练数据量未公开，估计在 10–13T tokens 量级。Chinchilla 定律建议：最优训练 token 数 ≈ 20× 参数量。

**算力需求**

训练 LLaMA 3.1 405B 使用 16,384 块 H100 GPU，耗时约 54 天，估算总算力约 3.8×10²⁵ FLOPs。GPT-4 的训练成本估计在 $60–100M 量级（按 H100 租赁价格折算）。

**Scaling Laws**

Kaplan et al.（2020）和 Chinchilla（2022）建立了 loss ∝ N^(−α)·D^(−β) 的经验公式（N=参数量, D=数据量）。核心推论：在固定算力预算下，参数量和数据量应等比例扩大。

::panel
### 阶段二：有监督微调（SFT）
预训练后的模型具备语言能力但不遵循指令。**Supervised Fine-Tuning (SFT)** 使用人工标注的指令-回复对（通常 10K–100K 条高质量样本），教模型以对话格式响应用户请求。

关键实践：

- **数据质量 > 数据量**：LIMA 论文（Zhou et al., 2023）证明仅用 1,000 条精选样本即可有效激活并提升 LLaMA 65B 的指令遵循能力
- **Chat Template**：定义 system / user / assistant 角色分隔符（如 ChatML 的 `<|im_start|>`），确保模型在推理时能区分不同角色
- **多任务混合**：SFT 数据通常混合对话、代码、数学、摘要等多种任务，避免灾难性遗忘

::panel
### 阶段三：对齐（Alignment）
对齐阶段确保模型输出符合人类偏好（有用、诚实、无害）。两种主流方法：

**RLHF（PPO）**

OpenAI 开创的三步流程：(1) 收集人类偏好排序 → (2) 训练 Reward Model → (3) 用 PPO 算法优化策略模型。优势是效果经过大规模验证（InstructGPT, ChatGPT, GPT-4），缺点是训练不稳定、需维护 4 个模型（policy, ref, reward, value）。

**DPO（Direct Preference Optimization）**

将 RLHF 的两步（训练 RM + PPO）压缩为一步：直接在偏好对上优化策略模型，无需 reward model。loss 函数形式为 log-sigmoid(β · log-ratio)。训练更稳定、成本更低，被 LLaMA 3、Qwen2、Hermes 3 采用。

**GRPO（Group Relative Policy Optimization）**

DeepSeek-R1 引入的对齐方法。对每个提示生成多个回复，按组内排名计算优势（无需 value/reward model）。特别适合数学/代码等有可验证正确答案的场景，训练算力降低约 50%。

**Constitutional AI**

Anthropic 提出的自监督对齐方法：让模型根据一组"宪法原则"自我批评和修正输出（RLAIF）。减少对人类标注的依赖，Claude 系列的核心安全方法。

::panel
### 混合专家（MoE）架构
MoE 通过稀疏激活实现"大参数量、低推理成本"。每层 FFN 被替换为多个"专家"子网络，由 Router 为每个 token 选择 top-K 个专家。

| 模型 | 总参数量 | 激活参数量 | 专家数 | Top-K |
| --- | --- | --- | --- | --- |
| Mixtral 8×7B | 46.7B | ~12.9B | 8 | 2 |
| DeepSeek-V3 | 671B | ~37B | 256 + 1 shared | 8 |
| Qwen3-235B (MoE) | 235B | ~22B | 128 | 8 |
| GPT-4（推测） | ~1.8T | ~220B | 16 | 2 |

**核心挑战**：专家负载均衡（load balancing loss）和通信开销（跨节点 AllToAll）。DeepSeek-V3 创新性地使用了 Multi-Head Latent Attention (MLA) + 辅助无损负载均衡策略，将训练成本控制在约 $5.5M（2048 块 H800，60 天）。
:::

## #families 03 / Model Families :: 主流模型族谱

截至 2026 年 4 月的八大 LLM 家族全景画像。

:::accordion
::panel { open: true }
### 闭源商业模型
OpenAI

**GPT 系列**

- **GPT-4o**：全模态模型（文本/图像/音频/视频），200K 上下文，128K output tokens
- **o3 / o4-mini**：Reasoning 模型，内置 chain-of-thought，尤擅数学/代码/科学推理
- **GPT-4.1**：代码/指令遵循优化版，100 万 token 上下文
- **架构**：传闻为 MoE（~1.8T 总参数 / ~220B 激活），未官方确认
- **训练**：RLHF (PPO) + 多阶段后训练

Anthropic

**Claude 系列**

- **Claude Opus 4**：旗舰模型，200K 上下文，SWE-bench 72.5%（SOTA）
- **Claude Sonnet 4**：高性价比选择，接近 Opus 4 水平
- **Claude Haiku 3.5**：轻量快速，适合高吞吐场景
- **特色**：Constitutional AI 安全对齐、extended thinking（内部推理链）、computer use（屏幕操作）
- **许可**：仅 API 访问，不开放权重

Google

**Gemini 系列**

- **Gemini 2.5 Pro**：最大 1M 上下文（实验版 10M），原生多模态
- **Gemini 2.5 Flash**：快速推理，自适应 thinking budget
- **架构**：MoE，原生多模态（训练时混合文本/图像/音频/视频 tokens）
- **基础设施**：TPU v5p 训练，Google 全栈自研硬件

xAI

**Grok 系列**

- **Grok 3**：据称使用 100K 块 H100 训练, 参数规模未公开
- **Grok 3 Mini**：reasoning 模型，较小规模
- **特色**：实时 X (Twitter) 数据访问，较少内容限制
- **基础设施**：Memphis 超级计算集群（Colossus）

::panel
### 开源 / 开放权重模型
Meta

**LLaMA 系列**

- **LLaMA 4**：Scout (17B 激活 / 109B MoE) 10M 上下文 + Maverick (17B 激活 / 400B MoE)
- **LLaMA 3.1**：8B / 70B / 405B，128K 上下文，开源最大 dense 模型
- **特色**：Apache 2.0（可商用）、GQA、RoPE、SwiGLU
- **生态**：最广泛的社区微调/量化生态（GGUF, AWQ, GPTQ）

DeepSeek

**DeepSeek 系列**

- **DeepSeek-V3**：671B MoE（37B 激活），128K 上下文，训练成本仅 ~$5.5M
- **DeepSeek-R1**：reasoning 模型，GRPO 对齐，数学/代码接近 o3
- **创新**：MLA（Multi-head Latent Attention）将 KV cache 压缩 93%、FP8 混合精度训练、辅助无损负载均衡
- **许可**：MIT License，完全开源

Qwen

**Qwen（通义千问）系列**

- **Qwen3**：0.6B–235B 全覆盖（Dense + MoE），支持 thinking 模式切换
- **Qwen2.5-Coder**：代码专精（32B 版 HumanEval 92.7%）
- **Qwen2-VL**：视觉语言模型，72B 参数
- **特色**：中英双语最优、151K 词表、Apache 2.0

Mistral

**Mistral 系列**

- **Mistral Large 2**：123B 参数，128K 上下文
- **Mistral Medium 3**：中端模型
- **Codestral**：代码专精模型
- **创新**：Sliding Window Attention（7B 版首创）、Pixtral 多模态

::panel
### 模型能力对比矩阵
| 模型 | 参数量 | 上下文 | 开源 | 多模态 | Reasoning | Tool Use |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-4o | ~1.8T (MoE) | 200K | 否 | 文/图/音/视 | — | 原生 |
| o3 | 未公开 | 200K | 否 | 文/图 | CoT | 原生 |
| Claude Opus 4 | 未公开 | 200K | 否 | 文/图 | Extended Thinking | 原生 |
| Gemini 2.5 Pro | 未公开 (MoE) | 1M | 否 | 文/图/音/视 | Thinking | 原生 |
| LLaMA 4 Maverick | 400B (MoE) | 1M | 是 | 文/图 | — | 训练 |
| DeepSeek-R1 | 671B (MoE) | 128K | 是 | 文 | GRPO CoT | 社区 |
| Qwen3-235B | 235B (MoE) | 128K | 是 | 文 | Thinking 切换 | 原生 |
:::

## #capabilities 04 / Core Capabilities :: 核心能力

现代 LLM 的四大关键能力维度。

:::accordion
::panel { open: true }
### 推理（Reasoning）
Reasoning 模型是 2024–2026 年 LLM 演进的核心方向。通过在推理阶段分配更多"思考"计算（test-time compute），模型在数学、代码与科学推理任务上的准确率跨上新台阶。

**Chain-of-Thought (CoT)**

让模型在回答前展示推理步骤。Wei et al.（2022）证明在 PaLM 540B 上，CoT prompting 将 GSM8K 数学准确率从 56% 提升至 74%。现代 reasoning 模型（o3, R1）将 CoT 内化为训练行为。

**Test-Time Compute Scaling**

与 Scaling Laws 关注训练时算力不同，Reasoning 模型在推理阶段通过扩展思考 token 提升输出质量。o3 在 ARC-AGI 上投入的推理算力约为 o1 的 ~170 倍，准确率从 25% 提升至 87.5%。

**自我验证与回溯**

高级推理模型能在思考过程中自我检验中间步骤，发现错误后回溯修正。DeepSeek-R1 的训练过程中观察到模型自发学会了"Wait, let me reconsider..."的元认知行为。

::panel
### 工具调用（Function Calling / Tool Use）
工具调用让 LLM 从"文本生成器"变为"行动执行器"——通过结构化 JSON 输出调用外部 API、数据库、计算器等工具。

**评测**：Berkeley 的 BFCL V4 基准覆盖 109 个模型，评估 Simple / Multi-Turn / Agentic / Live / Hallucination 五个维度。截至 2026 年 4 月，Claude Opus 4 和 GPT-4.1 在 Overall Accuracy 上并列领先（>90%）。

::panel
### 代码生成与软件工程
代码生成是 LLM 最成熟的应用场景之一。从 Codex（2021）到 Claude Opus 4（2025），代码能力经历了质变。

| 基准 | 测试内容 | SOTA 模型 | SOTA 分数 |
| --- | --- | --- | --- |
| HumanEval | 164 个 Python 函数补全 | Claude Opus 4 | ~96% |
| SWE-bench Verified | 真实 GitHub issue 修复 | Claude Opus 4 | 72.5% |
| LiveCodeBench | 竞赛编程（防污染） | o3 | ~80% |
| Aider Polyglot | 多语言编辑任务 | Claude Opus 4 | ~75% |

**关键趋势**：Agentic Coding（AI 自主完成多步开发任务）——GitHub Copilot Agent Mode、Cursor Composer、Claude Code 代表三种路线：IDE 内嵌、独立编辑器、终端 CLI。

::panel
### 多模态能力
多模态 LLM 能处理文本、图像、音频、视频等多种输入，部分模型还能生成图像和音频。

**Vision（视觉理解）**

GPT-4o、Gemini 2.5、Claude Opus 4 均支持图像输入，主流架构路线分为两种：(1) 图像经 ViT 编码后与文本 token 拼接；(2) 原生多模态（训练时混合图文 token）。Gemini 采用后者。

**Audio（语音）**

GPT-4o 支持端到端语音对话（语音→语音，中间不经 TTS/ASR 转写），Gemini 2.5 也原生支持音频 token，使响应延迟从传统 ASR+LLM+TTS 的 2–3 秒降至 ~300ms。

**Video（视频理解）**

Gemini 1.5/2.5 Pro 能处理长达数小时的视频输入（抽帧为图像 token 序列）。GPT-4o 也支持视频输入。核心挑战：视频 token 数量巨大（1 秒视频 ≈ 数百至上千 tokens）。

**Image Generation（图像生成）**

GPT-4o 具备原生图像生成能力（自回归式逐 token 生成图像），Gemini 2.0 Flash 也支持。与 Diffusion 模型（DALL-E 3, SD）不同，这些模型在统一空间中处理文本和图像。
:::

## #inference 05 / Inference Optimization :: 推理优化

从量化到推测解码：降低 LLM 部署成本与延迟的关键技术。

:::accordion
::panel { open: true }
### 量化（Quantization）
量化将模型权重/激活从高精度（FP16/BF16）降低至低精度（INT8/INT4/FP8），减少内存占用和加速推理。

| 方法 | 精度 | 内存压缩比 | 质量损失 | 适用场景 |
| --- | --- | --- | --- | --- |
| **GPTQ** | INT4 / INT3 | 4× | 轻微（<1% perplexity） | GPU 推理（CUDA） |
| **AWQ** | INT4 | 4× | 极小（保护关键权重） | GPU 推理，vLLM 原生支持 |
| **GGUF** | Q2–Q8_0 | 2–8× | 可配置 | CPU / Metal / Vulkan (llama.cpp) |
| **FP8** | E4M3 / E5M2 | 2× | 几乎无 | H100+ GPU 原生支持 |
| **MLX 4-bit** | INT4 (group) | 4× | 轻微 | Apple Silicon (M1–M4) |

**经验**：对于 70B+ 参数模型，INT4 量化通常对通用任务影响极小（MMLU 降幅 < 0.5%）。7B 模型在 INT4 下可能有 1–3% 质量损失，建议不低于 Q4_K_M。

::panel
### KV Cache 优化
自回归解码时，每个 token 需访问所有先前 token 的 K/V 向量。长上下文下 KV cache 可能占用数十 GB 显存。

**GQA / MQA**

Grouped-Query Attention 通过共享 KV heads 在模型架构层面压缩 KV cache。LLaMA 2 70B 使用 8 个 KV groups（而非 64 个独立 KV heads），KV cache 缩至 1/8。

**PagedAttention (vLLM)**

借鉴操作系统虚拟内存：将 KV cache 分页存储，避免预分配造成的内存浪费。vLLM 的核心创新，将 serving 吞吐量提升 2–4× 且无精度损失。

**MLA（DeepSeek）**

Multi-head Latent Attention：将 KV 投影到低维潜空间（512d vs 原始 7168d），KV cache 压缩率达 93%。DeepSeek-V3 的核心架构创新之一。

**Quantized KV Cache**

对 KV cache 本身做量化（FP8 / INT8），可在 GQA 基础上进一步压缩 2×。部分推理框架（SGLang, TensorRT-LLM）已原生支持。

::panel
### 推测解码与批处理
**Speculative Decoding**

用小模型（draft model）快速生成候选 token 序列，大模型一次性验证多个 token。如果候选被接受，等效于大模型以小模型的速度解码。加速比通常 1.5–3×，不牺牲输出质量。

**Continuous Batching**

传统 static batching 中，batch 内最长请求决定所有请求的等待时间。Continuous batching 允许已完成的请求随时替换为新请求，GPU 利用率提升 3–5×。vLLM、TGI、SGLang 均支持。

**Prefix Caching**

共享相同 system prompt 的请求复用预计算的 KV cache。对于长 system prompt（如 agent 指令 + 工具定义），可节省 30–70% 的首次 token 延迟。

**推理框架对比**

**vLLM**：PagedAttention + Continuous Batching（最广泛部署）。**SGLang**：RadixAttention + Compressed FSM（结构化输出最快）。**TensorRT-LLM**：NVIDIA 优化（最低延迟）。**llama.cpp**：CPU/边缘设备首选。
:::

## #benchmarks 06 / Evaluation Benchmarks :: 评测体系

主流 LLM 评测基准的覆盖范围、方法论与局限性。

:::accordion
::panel { open: true }
### 知识与推理基准
| 基准 | 类型 | 测试内容 | 规模 | 注意事项 |
| --- | --- | --- | --- | --- |
| MMLU | 选择题 | 57 学科知识（STEM / 人文 / 社科） | 14,042 题 | 已趋饱和（GPT-4o ~88%），MMLU-Pro 更难 |
| GSM8K | 开放生成 | 小学数学应用题 | 1,319 题 | 已被 reasoning 模型接近 100% 解决 |
| MATH | 开放生成 | 竞赛级数学（AMC/AIME） | 5,000 题 | o3 ~96%，仍是区分 reasoning 能力的有效基准 |
| ARC-AGI | 视觉推理 | 抽象推理（模式识别） | 400 题 | 非文本任务，测试泛化能力 |
| GPQA | 选择题 | 博士级科学问答 | 448 题 | 人类专家准确率 ~65%，LLM 最高 ~75% |

::panel
### 代码与工具调用基准
| 基准 | 类型 | 测试内容 | 规模 | 注意事项 |
| --- | --- | --- | --- | --- |
| HumanEval | 函数补全 | Python 编程（基础） | 164 题 | 已趋饱和，EvalPlus 版更可靠 |
| SWE-bench | Issue 修复 | 真实 GitHub 仓库 bug fix | 2,294 题 | Verified 子集 500 题为核心评测 |
| LiveCodeBench | 竞赛编程 | 持续更新的编程竞赛题 | ~500+ 题 | 防止数据污染，定期刷新 |
| BFCL | Tool Calling | 函数调用准确率（5 维度） | 2,000+ 题 | V4 版含 Live + Hallucination 检测 |
| τ-bench | Agentic | 多步工具使用的端到端任务 | 变化 | 测试 agent loop 的鲁棒性 |

::panel
### 评测局限性与竞技场
静态基准存在固有局限：

- **数据污染**：训练数据可能包含测试集（GSM8K、HumanEval 已被广泛怀疑泄露）
- **格式过拟合**：模型可能学到"解题模式"而非真正推理能力
- **单维度**：单个基准无法反映真实应用中的综合能力

**替代方案**：

**Chatbot Arena (LMSYS)**

人类盲测投票 ELO 排行榜。用户与两个匿名模型对话，投票选择更好的回复。截至 2026 年 4 月，累计 200 万+ 投票。最接近"真实用户偏好"的评测。

**LiveBench**

每月更新的多维度基准，使用从未公开的新题目，根本性解决数据污染问题。覆盖数学、编码、推理、语言、数据分析、指令遵循六大类。

**Agentic 评测趋势**

传统基准测"答对一道题"，agentic 评测测"完成一个任务"。SWE-bench、WebArena、OSWorld 等测试模型在真实环境中的多步执行能力——这比静态问答更接近实际应用价值。
:::

## #timeline 07 / Evolution Timeline :: 演进时间线

从 Transformer 论文到 Reasoning Model：大语言模型演进的关键节点。

2017

### Attention Is All You Need

Vaswani et al. 提出 Transformer 架构，以 Self-Attention 取代 RNN。NLP 从此进入 Transformer 时代。

2018

### GPT-1 与 BERT

OpenAI 发布 GPT-1（117M，decoder-only 预训练+微调）。Google 发布 BERT（340M，encoder-only，MLM 预训练）。"预训练+微调"范式确立。

2020

### GPT-3 与 Scaling Laws

GPT-3（175B）展示 few-shot in-context learning 能力。Kaplan et al. 发表 Scaling Laws 论文，确立参数-数据-算力的幂律关系。

2022

### ChatGPT 与 InstructGPT

InstructGPT 首次将 RLHF 应用于 GPT-3。ChatGPT（GPT-3.5-turbo）发布，2 个月内用户破亿，开启 LLM 商业化时代。Google 内部发起 "Code Red"。

2023

### GPT-4 / Claude 2 / LLaMA

GPT-4 多模态（图+文）发布，性能跨越式提升。Meta 开源 LLaMA（7B–65B），引爆开源 LLM 生态。Anthropic 发布 Claude 2。Mistral 7B 证明小模型可以很强。

2024

### Reasoning 元年

OpenAI o1 开创 reasoning model 路线。Claude 3.5 Sonnet 在主流编码基准上领跑。Gemini 1.5 Pro 支持 1M 上下文。LLaMA 3.1 405B 成为最大开源 dense 模型。DeepSeek-V3 将 671B MoE 训练成本压低至约 $5.5M。

2025

### Agent 时代到来

DeepSeek-R1 开源 reasoning 模型。Claude Opus 4 / Sonnet 4 强化 agentic coding。o3/o4-mini 推理能力再升级。LLaMA 4（MoE, 10M 上下文）发布。Qwen3 全覆盖（0.6B–235B）。Github Copilot Agent Mode GA。

## #references 08 / References :: 参考来源

- [1] Vaswani, A. et al. — https://arxiv.org/abs/1706.03762 | Transformer 原始论文，提出 self-attention、multi-head attention 和位置编码。
- [2] Kaplan, J. et al. — https://arxiv.org/abs/2001.08361 | 确立参数量、数据量和算力与 loss 的幂律关系。
- [3] Hoffmann, J. et al. — https://arxiv.org/abs/2203.15556 | 修正 Scaling Laws：最优方案是参数量和数据量等比例扩大。
- [4] Touvron, H. et al. — https://arxiv.org/abs/2307.09288 | LLaMA 2 技术报告，覆盖 GQA、RLHF 和安全对齐方法。
- [5] Dubey, A. et al. — https://arxiv.org/abs/2407.21783 | LLaMA 3/3.1 技术报告，包含 405B 训练细节和多模态扩展。
- [6] DeepSeek-AI. — https://arxiv.org/abs/2412.19437 | DeepSeek-V3（671B MoE）技术报告，覆盖 MLA、FP8 训练和 $5.5M 成本核算。
- [7] DeepSeek-AI. — https://arxiv.org/abs/2501.12948 | DeepSeek-R1 reasoning model 技术报告，GRPO 对齐方法和纯 RL 训练路线。
- [8] Dao, T. et al. — https://arxiv.org/abs/2205.14135 | FlashAttention 论文，通过 IO-aware 分块计算优化注意力 HBM 访问。
- [9] Kwon, W. et al. — https://arxiv.org/abs/2309.06180 | vLLM 论文，PagedAttention 将 KV cache 以虚拟内存方式管理。
- [10] Rafailov, R. et al. — https://arxiv.org/abs/2305.18290 | DPO 论文，证明可以不训练 reward model 直接从偏好数据优化策略。
- [11] Wei, J. et al. — https://arxiv.org/abs/2201.11903 | CoT 论文，证实 prompt 中显式加入中间推理步骤可有效激发 LLM 的数学与多步推理能力。
- [12] LMSYS Org. — https://chat.lmsys.org/ | 基于人类盲测投票的 LLM ELO 排行榜，累计 200 万+ 投票。

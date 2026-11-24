---
title: Fish Audio S2 技术研究：Dual-AR 架构、细粒度语音控制与流式部署边界
eyebrow: Open TTS Research
brand: 模型
date: 2026-05-03
strict_i18n: false
strict_density: true
lead: "基于官方技术报告、GitHub README、Hugging Face 模型卡与 SGLang 集成说明，本文拆解 Fish Audio S2 的能力边界：它在哪些指标上领先，为什么能把词级语音控制做进生产流式服务，以及“官方称 open-sourced”背后的许可与硬件前提。[1][2][3][4][5]"
hero_actions:
  - "先看结论 | #verdict"
  - "看采用边界 | #license"
panel_label: 核心判断
panel_title: 这次发布最有价值的变化，是把词级控制、多说话人、多轮对话和低延迟流式服务绑在同一套系统里。
panel:
  - Dual-AR：Qwen3-4B Slow AR + 400M Fast AR，处理 10 个音频 codebook
  - 10M+ 小时预训练音频，约 80 种语言与方言
  - 单张 H200 上 RTF 0.195，TTFA 低至 100ms
  - 研究许可免费，商业使用仍需单独授权
metrics:
  - "模型口径 | 4B + 400M | 架构拆分口径；HF 页面归类为 5B BF16"
  - "数据规模 | 10M+ 小时 | 预训练阶段使用，覆盖约 80 种语言与方言"
  - "流式性能 | RTF 0.195 | 官方生产口径；单张 NVIDIA H200"
  - "控制能力 | ATT 0.515 | Audio Turing Test，instruction rewrite 口径"
style:
  accent: "#38bdf8"
---

## #verdict 01 / Verdict :: Fish Audio S2 解决的，不只是“把一句话念顺”

过去很多 TTS 模型在单句配音上已经够用，但一旦你要在同一句里控制某几个词的语气、插入笑声和停顿、切换说话人，或者把同一角色高并发地流式播出来，系统往往要靠大量额外工程去补。S2 把这些需求写进了模型结构、数据管线、后训练和推理栈。[1][3]

:::insight-grid { cols: 2 }
::card 01
### 新增能力是“局部控制”
官方最强调的是 inline tag：控制信号可以落在具体词位，而不再停留在整段风格提示。你可以插入类似 `[whisper]`、`[angry]`、`[laughing]` 这样的自然语言描述，让模型在对应位置触发声学变化。[1][4]

::card 02
### 新增能力也是“多角色对话”
S2 原生处理多说话人 token 和多轮上下文，不需要把一段对话拆成多次独立合成再手工拼接。训练阶段把上下文扩到 16,384 token，就是为长音频和多轮场景服务。[3]

::card 03
### 工程亮点在服务化
Dual-AR 结构与标准自回归 LLM 足够接近，S2 可以直接继承 SGLang 的 continuous batching、paged KV cache、prefix cache 和 CUDA graph 等优化。对工程团队来说，这比单个 benchmark 更重要。[1][3][5]

::card 04
### 最大采用障碍在许可与硬件
官方对外会使用 open-sourced 这个词，但模型卡写得很清楚：研究与非商用免费，商用需要单独授权。同时，最好看的延迟和吞吐数字都建立在单张 H200 与 SGLang 生产配置上。[2][4][5]
:::

:::comparison
::versus 结论
### S2 的价值主要来自“控制能力 + 服务能力”这两个维度
- **控制颗粒度**：把整段风格提示推进到词或短语位置的自然语言声学标签。
- **对话能力**：一个请求里处理多说话人与多轮上下文，适合剧情、客服和角色代理。
- **服务架构**：直接复用 LLM serving 优化，降低了从研究模型走向线上系统的摩擦。

::versus 边界 { highlight: true }
### 它还不能直接等价成“无门槛商用开源 TTS 底座”
- **许可**：采用 Fish Audio Research License，与 MIT / Apache 这类 OSI 许可不同；商用前要先过法务。
- **硬件**：论文和 README 没有提供消费级 GPU、本地 Mac、CPU-only 的等价延迟表。
- **语言覆盖**：低资源语言与边缘场景仍需用你的目标数据单独复测。
:::

## #architecture 02 / Architecture :: S2 的核心结构：Dual-AR、双用途数据管线、GRPO 风格后训练

S2 的方法论很清楚：先把高保真音频压成 10 个 codebook，再用一条时间维 Slow AR 去规划语义和粗粒度韵律，用一条深度维 Fast AR 去补剩余 9 个细节 codebook。这样既保住了音质，也避免把序列长度直接放大 10 倍。[1][3][4]

:::accordion
::panel { open: true }
### Dual-AR：把“10 个 codebook 的时间爆炸”拆成两条生成路径
Tokenizer

**44.1kHz DAC + 10 个 RVQ codebook**

音频 tokenizer 总计 446M 参数，采用分层 RVQ。经过扩展下采样后，帧率约 21Hz：第一个 codebook 负责更偏语义的主信息，剩余 9 个负责更细的声学细节。[3]

Slow AR

**Qwen3-4B 沿时间轴预测主语义 token**

Slow AR 使用预训练 Qwen3-4B 作为主干，把文本 token、系统提示、参考音频 token 与语义 token 统一到同一条时间序列中处理。它负责决定每个时刻的主语义 codebook。[3]

Fast AR

**4 层、约 400M 参数，补 9 个残差 codebook**

Fast AR 是轻量深度方向解码器。每当 Slow AR 产出主语义 token 后，Fast AR 继续生成同一时刻的 9 个残差 token，恢复更细的音色、气息和纹理。[1][4]

MCF

**10 层 codebook 融合回下一步输入**

论文用 Multi-Codebook Fusion 把当前时刻的 10 层 codebook 嵌入再求和，作为下一时刻 Slow AR 的输入。这样模型既保留语义规划，又不丢掉前一帧的精细声学上下文。[3]

“4B + 400M”与 Hugging Face 页面上的“5B BF16”属于不同统计口径。前者是技术报告按 Slow AR / Fast AR 的结构拆分，后者是模型仓库对整个 checkpoint 的量级归类。做选型时，两种口径都要看：前者解释原理，后者更接近部署时的资源感知。

[3]

[4]

::panel
### 数据管线：同一套模型既做数据过滤，也做 RL 奖励
Stage 1

**源分离 + VAD 切句**

第一阶段先做 vocal separation，再做语音活动检测，把原始长音频切成可训练的 utterance 级样本。这一步的目标是把背景音乐、串音和长空白先降下来。[3]

Stage 2

**语音质量模型做严格过滤**

质量模型基于 w2v-BERT 2.0 主干，按信噪比、说话人一致性、录音质量和可懂度打分。它会继续踢掉 Stage 1 漏过的重叠说话、残余背景声和 timbre 漂移风险样本。[3]

Stage 3

**Qwen3-Omni-30B-A3B 派生 ASR 生成 rich transcription**

Fish Audio 把转录从“只写文字”升级到“同时写出 speaker turn 和声学事件描述”。像 `[inhale]`、`[angry]`、`[emphasis]` 这些标签就是在这一阶段自动标出来的。[3]

Reuse

**训练后期继续当 reward model**

质量模型和 rich-transcription ASR 没有在数据预处理阶段退休，而是直接在 RL 阶段继续用作奖励信号。这样做的目的，是把“训练时看到的数据分布”和“后训练想优化的目标”尽量对齐。[1][3]

::panel
### RL 后训练：重点处理 hallucination、漏词和 timbre drift
Algorithm

**选择 GRPO 变体，是为了扛住长音频训练显存**

标准 PPO 需要常驻 value model，在长语音序列下内存代价太高。S2 采用受 GRPO / Dr.GRPO 启发的方案，不保留额外 value network，而是用组内统计估计 advantage。[1][3]

Reward A

**STT reward 约束可懂度与指令跟随**

rich-transcription ASR 负责重转录生成音频，并对 speaker ID 标签错误、漏掉的 vocal instructions、遗漏单词施加更强惩罚。目标就是少漏词、少幻觉、少错 speaker。[3]

Reward B

**质量与 timbre reward 管听感和人设稳定性**

语音质量模型给 acoustic preference 分数，外部 voiceprint 模型给 speaker similarity 分数。三类 reward 一起优化，避免模型只顾着读对文本，却把音色和情绪读塌。[3]

Engineering

**异步评分 + LoRA weight swap 省掉很多计算浪费**

论文还披露了两项训练工程技巧：评分系统异步解耦、波形缓存复用，以及把 reference policy 以 LoRA 形式放在 CPU 内存里按需 swap，用来压低 RL 过程峰值显存。[3]
:::

## #capability 03 / Capability :: 能力拆解：词级标签、多角色对话、长音频与多语种

如果只用一句话概括 S2 的产品形态，它更像“可控的语音底座”，而不只是“更拟真的发音器”。下面三块能力，决定它适不适合做配音、剧情语音、语音代理和角色化聊天。[1][3][4]

:::accordion
::panel { open: true }
### 词级自然语言标签：从全局风格提示推进到局部声学指令
<|speaker:0|> 今天先给结论：[professional broadcast tone] Fish Audio S2 把控制做细了。 <|speaker:1|> [whisper in small voice] 内容制作里最难的，往往是让声音在对的位置笑、停顿、压低音量。 <|speaker:0|> [emphasis] 同一句里切换语气，才是制作团队最缺的能力。

Control

**支持 15,000+ 唯一标签，且允许自由文本描述**

官方给出的卖点在 free-form 描述能力。除了常见的 `[laughing]`、`[whisper]`、`[shouting]`，还可以写更长的自然语言短语。[1][4]

Benchmark

**Fish Instruction Benchmark：TAR 93.3%，Quality 4.51 / 5**

论文专门做了一个 inline tag benchmark，用 Gemini 3 Pro 作为 judge。总体 tag activation rate 为 93.3%，整体质量 4.51 / 5，说明“触发到了”与“触发得自然”两件事都做得不错。[1][3]

Human-Likeness

**instruction rewrite 后，ATT 从 0.483 升到 0.515**

Audio Turing Test 的结果说明，给模型补一层更明确的自然语言指令，会明显提升“像真人”这件事。这也侧面印证了 S2 的强项确实在指令跟随，而不仅是基座音质。[1][3]

Implication

**适合旁白、角色扮演、短视频配音和客服话术细调**

对内容团队来说，这意味着同一条文本里可以有更细的导演指令；对语音代理团队来说，这意味着系统 prompt 与 inline tag 可以一起参与 persona 编排。[1]

::panel
### 多说话人 + 多轮对话：一个请求里就能完成角色切换
Speaker

**`<|speaker:i|>` 直接进入 token 流**

上传一段包含多个说话人的参考音频后，模型会为每个 speaker 建立对应 token。随后在文本里用 speaker token 指定谁说哪一句，整个对话可以一次生成完成。[2][4]

Context

**第二阶段预训练把上下文拉到 16,384 token**

论文明确说第二阶段预训练把最大 context 从 8,192 扩到 16,384，用来支持长音频、多轮对话和多说话人生成。这个扩展是“多轮”能成立的关键。[3]

Reference

**参考音频前置到 system prompt，训练时 mask 掉损失**

S2 不再像 S1 那样把参考音频附在 user 输入后面，而是前置到 system prompt，并在训练中屏蔽这些 token 的 loss，避免模型靠逐字记忆去“复读”参考音频。[3]

Cloning

**快速 voice cloning 仍然依赖短参考音频**

官方 README 和模型卡都把“10 到 30 秒参考音频”作为快速 voice cloning 的典型长度。目标是 zero-shot 复现 timbre 和说话习惯，而不需要为每个角色重新微调。[2][4]

::panel
### 长音频与多语种：S2 的提升更像系统性补短板
| 项目 | S2 结果 | 对比信号 | 说明 |
| --- | --- | --- | --- |
| 语言覆盖 | 80+ 语言 | 技术报告正文写“约 80 种语言与方言” | 说明它的目标范围不止中英日，而是面向更宽的多语种场景。[2][3][4] |
| MiniMax 多语测试集 | 24 种语言里 11 种 WER 最优，17 种 SIM 最优 | 部分低资源语言仍有竞品优势 | 说明 S2 在跨语言可懂度和 timbre 保持上很稳，但各语言表现并不均匀。[1][3] |
| CV3-Eval 平均错误 | 3.01 | S1 为 3.96，约下降 23.9% | 这是跨多语种的整体提升信号，而非只修一两个指标。[3] |
| Long Audio 英文 WER | 4.38 | Qwen3-TTS 为 7.69 | 说明长篇英语合成中，S2 在可懂度上更稳。[3] |
| Long Audio 中文 CER | 5.95 | Qwen3-TTS 为 8.09 | 长篇中文场景同样保持领先，可视为播客、课程、长旁白的直接信号。[3] |

技术报告同时承认，在某些训练样本少于 1,000 小时的低资源语言里，MiniMax Speech 和 ElevenLabs 仍可能更强。S2 的多语优势体现在整体覆盖和多数主流语言结果上，并不意味着所有语言都领先。

[3]
:::

## #serving 04 / Serving :: 部署与延迟：S2 的强项在“像 LLM 一样被服务化”

S2 的工程路线选择了复用标准 LLM serving 思路：文本与参考音频先转成 prompt，Slow AR 和 Fast AR 在 SGLang 中跑，DAC vocoder 与解码同卡协同。这样做的结果，是流式指标很漂亮；代价是这些指标非常依赖具体硬件与调度条件。[1][3][5]

| 指标 | 官方技术报告 / 模型卡 | SGLang day-0 支持 | 解读 |
| --- | --- | --- | --- |
| TTFA | 低至 100ms | 约 140ms | 两者都在单张 H200 口径下，但一个是成熟生产环境，一个是 day-0 集成结果，不能直接当回归判断。[3][4][5] |
| RTF | 0.195 | 0.34 | RTF 越低越好。即使 day-0 口径，S2 也已经明显快过实时。[3][5] |
| 吞吐 | 3000+ acoustic tok/s，且 RTF < 0.5 | 63.3 tok/s（single batch） | 这里的负载条件不一致。前者更偏高并发产线吞吐，后者更像单批次初始基准。[1][3][5] |
| Prefix Cache | 平均 86.4%，峰值超过 90% | 共享 voice prefix 可把 TTFT 压到约 18ms | 如果同一个角色声音被反复复用，参考音频 prefill 成本会显著下降，这对多租户语音服务非常关键。[1][3][5] |
| 服务形态 | SGLang + DAC vocoder 同卡协同 | CPU 预处理 → GPU AR Engine → GPU Vocoder | 整体设计明显面向 GPU 服务器，边缘 CPU 或手机并非其目标口径。[3][5] |

1

### 预处理阶段：文本转 Qwen chat prompt，参考音频转 VQ token

voice cloning 场景下，参考音频会先被 DAC codec 编码成离散 token，并前置到 system prompt。这个设计正是后续 prefix cache 能生效的前提。[5]

2

### Slow AR 在 SGLang 里按时间轴解码主语义 token

SGLang 负责 paged KV cache、batching 和调度。Slow AR 先规划“这一时刻说什么、怎么说”，再把隐藏状态交给 Fast AR。[3][5]

3

### Fast AR 补齐 9 个残差 codebook，DAC vocoder 同卡解码

官方论文提到会把 vocoder decoding 与 LLM decoding 通过 MPS 在同一张 GPU 上协同调度，以提高整体吞吐并压低首音频时间。[3]

4

### 重复 voice persona 时，prefix cache 直接变成成本护城河

客服、角色聊天、游戏 NPC 这类会反复复用同一个音色的业务，最能吃到 86.4% 平均 cache hit 的红利。换句话说，S2 的优势在“同一个角色说很多轮”时会更明显。[1][3]

把这些数字写进产品 PRD 前，最好先在你的目标硬件上补一轮测量。官方资料没有给出 4090、本地 Mac、消费级显卡或 CPU-only 的等价延迟表，因此 H200 结果更适合当“能力上限信号”，不适合直接当部署承诺。

[2]

[3]

[4]

## #selection 05 / Selection :: 怎么看 S2 的成绩单：哪些是硬信号，哪些只是方向性信号

S2 的公开成绩很强，但不同 benchmark 关注的维度不同。WER 看“读得准不准”，ATT 看“像不像人”，EmergentTTS 看复杂表达和副语言现象，Fish Instruction Benchmark 则专门看 inline tag 能不能在正确位置触发。读表时要先区分维度，再下结论。[1][3]

| Benchmark | S2 | 可比对手 | 说明 |
| --- | --- | --- | --- |
| Seed-TTS Eval 中文 WER | 0.54% | Qwen3-TTS 0.77%，MiniMax Speech-02 0.99%，Seed-TTS 1.12% | 这是 voice cloning 可懂度的硬信号，S2 在中文读准率上非常强。[1][3] |
| Seed-TTS Eval 英文 WER | 0.99% | Qwen3-TTS 1.24%，MiniMax Speech-02 1.90%，Seed-TTS 2.25% | 英语结果同样领先，说明它在英语场景里也有明显竞争力。[1][3] |
| Audio Turing Test | 0.483；instruction rewrite 后 0.515 | Seed-TTS 0.417，MiniMax Speech 0.387 | 这是“像不像人”的方向性信号，属于 LLM-as-a-Judge 体系。[1][3] |
| EmergentTTS-Eval 总体胜率 | 81.88% | Gemini 2.5 Flash Preview TTS 79.10%，基线 gpt-4o-mini-tts 为 50% | 说明 S2 在 paralinguistics、提问语气和复杂句法这些“更像真人说话”的场景里优势明显。[3] |
| Fish Instruction Benchmark | TAR 93.3%，Quality 4.51 / 5 | S1 的中文 / 英文 TAR 分别为 0.942 / 0.626 | 这是官方自建 benchmark，主要用来看 inline tag 的词位控制，不宜拿它替代通用人类双盲测试。[1][3] |
| Long Audio 英 / 中 | 英文 WER 4.38；中文 CER 5.95 | Qwen3-TTS 7.69 / 8.09 | 如果你关心长篇旁白、课程、播客，这组数据比单句 demo 更值得看。[3] |

:::comparison
::versus 强项
### S2 更像“上限很高的可控 TTS 底座”
- **相对 S1**：指令跟随、长音频稳定性和多语结果都有系统性提升。
- **相对通用语音模型**：inline tag 与多说话人多轮生成更像为内容制作和语音代理直接准备的能力。
- **相对闭源 API**：在公开 benchmark 上已经具备正面竞争力，尤其是 controllability 维度。

::versus 口径 { highlight: true }
### 这些分数更适合指导选型，不适合直接换算成交付 SLA
- **ATT / EmergentTTS** 含有 AI judge 评估成分。
- **instruction rewrite** 会提升结果，等于额外加入一层 prompt engineering。
- **硬件条件** 与调度方式差异很大，本地部署必须二次测量。
:::

## #license 06 / License & Adoption :: 采用前先过三关：许可、硬件、治理

如果你把 S2 当研究模型，它很有吸引力：权重、微调代码、推理栈都放出来了。如果你准备直接接进商业产品，顺序要反过来，先看许可和硬件，再看 benchmark。对 TTS 来说，忽略这一步的代价通常比忽略 1 个点的 WER 更大。[2][4]

License

### “开源”有边界：研究与非商用免费，商用要另签

Hugging Face 模型卡与 GitHub README 都明确采用 Fish Audio Research License。它让研究与 PoC 门槛变低，但并不能直接替代 MIT / Apache 这类无额外商用谈判的许可。[2][4]

Hardware

### 官方旗舰口径默认站在 H200 级 GPU 上

模型卡显示主仓库权重是 5B BF16 级别。论文给出的延迟与吞吐都在单张 H200 上测得，官方资料没有补消费级 GPU 或本地 Mac 的资源对照表。[3][4]

Governance

### voice cloning 能力越强，合规与滥用防控越要前置

项目仓库自己也单列了 legal disclaimer，说明团队默认把合规责任交回给使用者。任何商业场景都需要补上声音授权、滥用举报、风格冒用和越权克隆的治理流程。[2]

Fit

### 最适合多角色配音、剧情内容、语音代理和高复用 persona

当业务要求同一个角色反复说很多轮、同一段文本里多次局部调情绪、或者一条请求内切 speaker 时，S2 的优势最容易被放大。[1][3]

Research

### 研究与内容团队

优先验证 inline tag、speaker token、长音频连贯性三件事。先把“控制能不能落到词位”测明白，再谈整体拟人度。[1][3]

Pilot

### 产品原型与小规模上线

先做法务确认，再在目标硬件上复测 TTFA / RTF / prefix cache 命中率。你自己的 speaker 复用模式，比论文里的平均值更决定真实成本。[4][5]

Production

### 正式商用

需要同时准备三份东西：授权文件、目标语言的内部评测集、以及声音版权与滥用处理流程。TTS 系统上线后，治理成本通常不会比模型成本更低。

一句话总结：Fish Audio S2 已经证明“开源阵营可以把可控 TTS 做到很高水平”；但如果你要把它当作商业基础设施，决定成败的先后顺序应当是许可、硬件复测、治理，再轮到 benchmark 排名。

[2]

[4]

## #references 07 / References :: 参考来源

以下来源都来自 Fish Audio 官方或其直接集成方，便于核对参数、性能和许可口径。

- [1] Fish Audio. — https://fish.audio/blog/fish-audio-open-sources-s2/ | 用于支持发布定位、Dual-AR 摘要、benchmark 摘要、SGLang 生产流式口径与 prefix cache 命中率。
- [2] Fish Audio. — https://github.com/fishaudio/fish-speech | 用于支持官方 README 中的模型说明、快速开始、语言覆盖、模型变体、license notice 与 legal disclaimer。
- [3] Liao, Shijia et al. — https://arxiv.org/abs/2603.08823 | 用于支持架构细节、训练阶段、数据管线、RL 设计、长音频与多语 benchmark、ATT / EmergentTTS / Fish Instruction Benchmark 结果。
- [4] Fish Audio. — https://huggingface.co/fishaudio/s2-pro | 用于支持 5B BF16 仓库口径、Fish Audio Research License、80+ languages、15,000+ tags 与生产性能摘要。
- [5] SGLang Omni Team. — https://github.com/sgl-project/sglang-omni/blob/main/sglang_omni/models/fishaudio_s2_pro/README.md | 用于支持 SGLang 集成路径、CPU → GPU → Vocoder 服务链路、day-0 单 H200 指标与 prefix caching 工程说明。

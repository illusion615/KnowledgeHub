---
title: 文生图提示词工程：五种模型的提示策略对比与可复用模式
eyebrow: Text-to-Image Prompt Engineering
brand: 模型
date: 2026-04-10
strict_i18n: false
strict_density: true
lead: "GPT Image、Midjourney、Stable Diffusion/SDXL 和 FLUX 五种模型的提示词处理机制存在结构性差异。GPT Image 使用自然语言输入并由内建 LLM 自动重写提示词[1]。Midjourney 偏好简洁短语配合参数系统[2]。Stable Diffusion/SDXL 依赖关键词堆叠、权重语法和负面提示词，受限于 CLIP 的 75 token/chunk 分词[3]。FLUX 使用 T5 Encoder 支持更长的自然语言序列和短步数 rectified flow 推理[4]。Z-Image-Turbo（Tongyi-MAI, 6B 参数）采用 Single-Stream DiT 架构，通过 Decoupled-DMD 蒸馏实现 8 NFE 推理，支持中英文双语文本渲染和 Prompt Enhancer 推理增强[5]。本文对比五种模型在 8 个提示维度上的差异，并抽象出 3 个跨模型可复用的提示词模式。"
hero_actions:
  - "查看机制对比 | #mechanism"
  - "查看复用模式 | #patterns"
panel_label: 核心差异
panel_title: 五种模型的提示范式差异
panel:
  - GPT Image：自然语言 + LLM 自动重写（revised_prompt 可见）
  - Midjourney：简洁短语 + 参数系统（--ar / --s / --sref）
  - SD/SDXL：关键词堆叠 + 权重语法 + 负面提示词（CLIP 75 tokens/chunk）
  - FLUX：自然语言 + T5 Encoder + 短步数 rectified flow
  - Z-Image-Turbo（通义万相）：6B S3-DiT + 双语文本渲染 + 8 NFE Decoupled-DMD 蒸馏
metrics:
  - "模型对比 | 4 种 | GPT Image / Midjourney / SD·SDXL / FLUX / Z-Image-Turbo"
  - "提示维度 | 8 个 | 主体 / 媒介 / 风格 / 光照 / 构图 / 色彩 / 质量 / 排除"
  - "可复用模式 | 3 个 | SES / Iterative Refinement / Constraint-First"
style:
  accent: "#0ea5e9"
---

## #mechanism 01 / Prompt Processing Mechanisms :: 五种模型的提示词处理机制对比

以下从 8 个维度对比 GPT Image、Midjourney v6、Stable Diffusion/SDXL、FLUX.1 和 Z-Image-Turbo 的提示词处理机制。数据来源为各平台官方文档和模型卡[1][2][3][4][5]。

| 维度 | GPT Image | Midjourney v6 | SD / SDXL | FLUX.1 | Z-Image-Turbo |
| --- | --- | --- | --- | --- | --- |
| **提示词风格** | 自然语言描述（支持复杂句子和段落） | 简洁短语，逗号分隔 | 关键词堆叠，逗号分隔，支持权重语法 | 自然语言描述 | 自然语言描述（中英文双语），Qwen3-4B LLM 作为文本编码器。Prompt Enhancer 可选启用[5] |
| **最大长度** | 无已知限制（LLM 处理） | 无公开限制 | CLIP 75 tokens/chunk（AUTOMATIC1111 支持多 chunk 拼接） | T5Encoder 支持更长序列（~256 tokens） | Qwen3-4B 处理文本序列，与 visual semantic + VAE image tokens 在序列级拼接后输入 S3-DiT |
| **负面提示词** | 不支持（通过正向描述排除） | 支持 `--no` 参数 | 核心机制：必须使用，v2 模型尤为关键 | 不支持（schnell 模式下无 CFG） | Z-Image 基座版支持（50 步 + CFG），Turbo 版不支持（guidance_scale=0.0）[5] |
| **权重控制** | 无显式权重语法（通过 `::` 分隔多 prompt） | 支持 `(keyword:1.5)` 语法，`()`/`[]` 快捷方式 | 无显式权重语法 | 无显式权重语法 |   |
| **提示词重写** | 无显式权重语法 |   |   |   |   |
| **提示词重写** | 内建：LLM 自动重写优化（revised_prompt 可见） | 部分重写（模型内部处理） | 无重写（所见即所得） |   |   |
| **图像输入** | 无重写 | Prompt Enhancer（VLM 驱动）可选启用：通过推理链（核心主体 → 世界知识注入 → 美学增强 → 完整描述）自动扩展[5] |   |   |   |
| **图像输入** | 支持（Image Prompt + 编辑） | 支持（Image Prompt + Style Reference + Omni Reference） | 支持（img2img, ControlNet） | 部分支持（取决于实现） | Z-Image-Edit 变体支持指令驱动的图像编辑[5] |
| **参数系统** | quality / size / format / background / moderation | --ar / --q / --s / --c / --no / --v / --sref / --cref | CFG scale / sampler / steps / seed / model / VAE | steps / guidance（schnell 通常 0） | num_inference_steps=9（实际 8 次 DiT forward）/ guidance_scale=0.0 / Flash Attention 可选[5] |
| **多语言支持** | 出色（LLM 理解多语言） | 有限（英语优先） | 依赖 CLIP 训练数据（英语为主） | T5Encoder 支持多语言但英语效果最佳 |   |

## #examples 02 / Same Subject, Four Approaches :: 提示词结构解析——同一主题的五种写法

以同一视觉目标为例："一位身穿深蓝色长裙的年轻女性，站在樱花树下，柔和的自然光，胶片摄影风格"。以下展示针对五种模型应如何构建提示词，以及结构差异的架构原因。

GPT Image

### 自然语言 + 场景细节 + 技术偏好

GPT Image 内建 LLM 理解自然语言语义，支持段落级描述。模型会自动重写提示词（revised_prompt），补充细节并优化结构[1]。因此，输入可以是完整的英文句子，无需关键词堆叠或权重语法。

A young woman in a deep navy blue floor-length dress standing beneath cherry blossom trees in full bloom. Soft natural daylight filters through the petals, creating dappled shadows on her dress. Film photography aesthetic with gentle grain, warm color temperature, and shallow depth of field. Shot on Kodak Portra 400.

Midjourney v6

### 简洁短语 + 参数控制

Midjourney 官方文档指出"short, concise prompts" 优于冗长描述[2]。关键信息以逗号分隔的短语提供，风格和构图由参数系统（`--ar`、`--s`、`--q`）控制，不使用权重语法。

young woman in deep navy dress, standing under cherry blossom trees, soft natural light, film photography, Kodak Portra 400, gentle grain --ar 2:3 --s 250 --q 1

Stable Diffusion / SDXL

### 关键词堆叠 + 权重 + 负面提示词

SD/SDXL 使用 CLIP 文本编码器，以 75 token/chunk 为单位分词[3]。提示词为逗号分隔的关键词序列，支持 `(keyword:weight)` 权重语法。质量修饰词（masterpiece, best quality）对 checkpoint 模型输出质量有直接影响。负面提示词是排除不需要元素的核心机制。

Prompt: (masterpiece, best quality:1.2), a young woman in a deep navy blue long dress, standing under cherry blossom trees, petals falling, soft natural lighting, dappled shadows, film grain, warm color temperature, shallow depth of field, shot on Kodak Portra 400, 8k uhd, detailed skin texture Negative: (worst quality, low quality:1.4), blurry, deformed, disfigured, bad anatomy, extra limbs, watermark, signature, text

FLUX (schnell / dev)

### 自然语言 + 简短步数

FLUX.1 使用 T5 Encoder（支持 ~256 tokens）替代 CLIP，能更好地处理自然语言语义[4]。schnell 变体使用 1–4 步推理且 guidance 通常设为 0（无 CFG），因此不支持负面提示词。提示词风格与 GPT Image 类似，但无自动重写。

A young woman wearing a deep navy blue floor-length dress stands beneath cherry blossom trees. Soft natural daylight creates dappled shadows through the falling petals. The image has a film photography look with gentle grain and warm tones, reminiscent of Kodak Portra 400 film stock.

Z-Image-Turbo（通义万相）

### Qwen3-4B 文本编码 + Prompt Enhancer 推理链 + 中英文双语

Z-Image-Turbo 的文本编码器是 **Qwen3-4B**（而非 T5 或 CLIP），一个具备双语能力的 LLM[5]。模型训练使用 5 种 caption 类型：详细长描述、中等描述、短描述、标签和**模拟用户提示词**（短且不完整，仅关注用户感兴趣的部分）。因此 Z-Image-Turbo 对详细描述和极短指令都能响应。`guidance_scale=0.0`，不支持负面提示词。

论文 Appendix A 收录的官方 prompt 展示了两种典型模式[5]：

**模式 A — 详细场景描述（PE 关闭时推荐）：**采用客观、事实性的语言风格（论文原文："a plain and objective linguistic style, strictly confining them to factual information observable in the image"），按主体 → 外观细节 → 环境 → 光照 → 构图 → 摄影技术参数的顺序组织。

一位身穿深蓝色及地长裙的年轻东亚女性，长发披肩，站在盛开的樱花树下。裙摆纹理可见，带有微妙的光泽感。柔和的自然日光透过密集的粉色花瓣缝隙洒落，在裙面和地面形成斑驳的光影。前景有飘落的樱花花瓣。中景为多株樱花树。背景柔和虚化，可见远处的绿色植被。胶片摄影风格，带有明显的颗粒结构，温暖的金色色温，渐进式背景虚化。浅景深，中心人物对焦清晰。柯达 Portra 400 胶片特征色彩还原。

**模式 B — 简短指令（PE 启用时推荐）：**Prompt Enhancer 会通过推理链（核心主体分析 → 问题求解/世界知识注入 → 美学增强 → 完整描述）自动扩展。论文示例显示 PE 甚至可以从坐标推断出"西湖"这一具体场景[5]。

樱花树下穿深蓝色长裙的女性，胶片摄影风格。

## #dimensions 03 / Eight Prompt Dimensions :: 八个提示维度的最佳实践

以下 8 个维度构成文生图提示词的基本解剖结构[3]。每个维度在不同模型中的生效方式和重要程度不同。

:::insight-grid { cols: 3 }
::card 01
### Subject 主体描述
具体胜于模糊。"a 25-year-old woman with shoulder-length black hair" 比 "a woman" 能产生更稳定的输出。所有模型均强烈响应主体细节，但 GPT Image 和 FLUX 可在句子中嵌入主体，SD 需将主体关键词前置[3]。

::card 02
### Medium 媒介
"digital art" 与 "oil painting" 与 "photograph" 会产生截然不同的视觉输出。媒介关键词决定纹理、色彩饱和度和细节层次。SD 中媒介关键词权重较高时会显著改变整体渲染风格[3]。

::card 03
### Style 风格
模型间差异较大：SD 用户常使用艺术家名字（如 "by Greg Rutkowski"），但实际效果需通过关键词测试验证[3]。MJ 提供 `--sref` 参数指定风格参考图[2]。GPT Image 在自然语言中描述风格即可[1]。

::card 04
### Lighting 光照
所有模型对光照关键词响应强烈。"studio lighting"、"golden hour"、"rim lighting"、"volumetric lighting" 是高影响词汇。光照描述直接影响画面氛围和深度感[3]。

::card 05
### Composition 构图
"close-up portrait"、"wide angle"、"bird's eye view"、"rule of thirds" 控制镜头关系。MJ 的 `--ar` 参数是额外的构图控制手段[2]。SD 的 ControlNet 提供像素级构图控制[3]。

::card 06
### Color 色彩
"vibrant"、"muted"、"monochromatic"、"pastel" 等色彩形容词影响整体色调。SD 中可通过权重语法微调色彩强度，如 `(warm tones:1.3)`[3]。GPT Image 和 FLUX 在自然语言中描述色彩倾向即可。

::card 07
### Quality 质量修饰
SD/SDXL 中 "masterpiece, best quality" 对 checkpoint 模型几乎是必需的质量修饰词[3]。GPT Image 通过 API 的 `quality` 参数控制（low / medium / high / auto）[1]。MJ 使用 `--q` 参数[2]。FLUX 无显式质量参数。

::card 08
### Negative 排除约束
SD/SDXL 使用负面提示词字段排除不需要的元素，是核心工作流程[3]。MJ 使用 `--no` 参数[2]。GPT Image 和 FLUX 不支持负面提示词，需通过正向描述来排除不需要的内容[1][4]。
:::

## #patterns 04 / Reusable Patterns :: 三个可复用的提示词模式

从五种模型的提示词实践中可抽象出以下 3 种跨模型可复用的模式。

:::comparison
::versus Pattern 1
### Subject-Environment-Style (SES) 模式
结构：[主体描述], [环境/场景], [风格/媒介], [光照], [技术细节]。该模式在所有模型上均有效，差异仅在于表达形式。

- **GPT Image** — 完整句子：主体嵌入场景描述，风格和技术细节自然衔接。
- **Midjourney** — 逗号分隔短语，按 SES 顺序排列，参数补充技术细节。
- **SD/SDXL** — 质量修饰前置，主体关键词紧随，场景和风格逗号分隔，负面提示词单独填写。
- **FLUX** — 与 GPT Image 类似的自然语言句子，无参数系统。
- **Z-Image-Turbo** — PE 关闭时按 SES 顺序写详细客观描述（主体→外观→环境→光照→构图→技术参数），中英文均可。PE 启用时可只写主体+风格，推理链自动补全环境和技术细节[5]。

::versus Pattern 2 { highlight: true }
### Iterative Refinement 迭代精修模式
从最少关键词开始，逐步增加细节，每轮控制变量数量。

- **步骤 1** — 初始提示仅包含：主体 + 媒介 + 风格（3 个维度）。
- **步骤 2** — 生成 4+ 张图像评估基线效果。
- **步骤 3** — 每次迭代最多增加 2 个关键词，观察变化。
- **适用范围** — SD 和 MJ 效果最佳。GPT Image 因内建重写机制，单次输入即可获得较好结果[1]。Z-Image-Turbo 启用 PE 时等效于自动迭代精修——PE 推理链在模型内部完成了从短指令到详细描述的扩展[5]。
:::

Pattern 3

### Constraint-First 约束优先模式

在描述想要的内容之前，先定义排除约束。该模式在 SD（负面提示词字段[3]）和 MJ（`--no` 参数[2]）上直接适用。GPT Image 和 FLUX 不支持负面提示词，应改为在正向描述中明确排除项（如 "without text or watermarks" 而非负面提示词中写 "text, watermark"）[1][4]。

- **SD/SDXL** — 负面提示词填写：`(worst quality:1.4), blurry, deformed, watermark, text`。正面提示词描述目标内容。
- **Midjourney** — 在提示词末尾追加 `--no text watermark blurry`。
- **GPT Image** — 在正向描述中写明："The image should have no text, watermarks, or borders."
- **FLUX** — 同 GPT Image，在自然语言中用正向描述排除不需要的元素。
- **Z-Image-Turbo** — 同 FLUX/GPT Image，`guidance_scale=0.0` 不支持负面提示词。在正向描述中用排除语句，如"画面中没有文字和水印"（中文）或 "without text or watermarks"（英文）[5]。

## #selection 05 / Model Selection Guide :: 模型选型建议总结

根据使用场景和控制需求选择模型。以下对比基于各模型的架构特性和提示词机制差异[1][2][3][4]。

:::insight-grid { cols: 3 }
::card A
### GPT Image
适合需要自然语言交互、世界知识理解和多语言输入的场景。内建 LLM 重写降低了提示词工程门槛。API 调用模式，无本地部署需求。局限：无权重语法和负面提示词，微调控制有限[1]。

::card B
### Midjourney v6
适合需要艺术风格控制和社区生态的场景。`--sref` 风格参考和 `--cref` 角色参考提供独特的视觉一致性控制[2]。局限：闭源、Discord/Web 交互模式、无本地部署、无精细权重控制。

::card C
### SD / SDXL
适合需要完全控制、开源生态和模型微调的场景。权重语法、负面提示词、ControlNet、LoRA 等机制提供像素级控制[3]。局限：学习曲线陡峭、提示词工程复杂度高、CLIP 75 token 限制。

::card D
### FLUX.1
适合 Apple Silicon 本地部署和需要短步数推理的场景。12B 参数的 rectified flow transformer，schnell 变体支持 1–4 步推理[4]。T5 Encoder 文本理解优于 CLIP。局限：生态尚在早期，工具链不如 SD 成熟。

::card E
### Z-Image-Turbo
通义万相团队（Tongyi-MAI）开源的 6B S3-DiT 模型，Qwen3-4B 文本编码器原生支持中英文双语。Decoupled-DMD 蒸馏实现 8 NFE 推理，适配 16G VRAM 消费级设备[5]。核心优势：中英文文本渲染（CVTG-2K Word Accuracy 0.8585）、Prompt Enhancer 推理链。PE 关闭时用详细客观描述（主体→环境→光照→技术），PE 启用时可用极短指令。月下载量 100 万+，Apache 2.0 许可。局限：guidance_scale=0.0（无 CFG），不支持负面提示词。
:::

| 选型维度 | 推荐模型 | 原因 |
| --- | --- | --- |
| 自然语言 + 世界知识 | GPT Image | LLM 理解复杂语义，自动补充细节[1] |
| 艺术风格控制 + 社区 | Midjourney | --sref / --cref 参数，活跃创意社区[2] |
| 完全控制 + 开源 + 微调 | SD / SDXL | 权重语法 + 负面提示词 + ControlNet + LoRA[3] |
| Apple Silicon 本地部署 + 短步数 | FLUX.1 | 1–4 步推理，T5 Encoder 长序列支持[4] |
| 双语文本渲染 + 开源 + 16G VRAM | Z-Image-Turbo | Qwen3-4B 文本编码器原生双语，PE 推理链扩展短指令，训练含模拟用户 prompt[5] |

## #references 06 / References :: 参考来源

- [1] OpenAI. — https://platform.openai.com/docs/guides/image-generation | GPT Image 的提示词输入、revised_prompt 重写机制、quality / size / format / background 参数、以及不支持负面提示词的说明。
- [2] Midjourney. — https://docs.midjourney.com/docs/prompts | Midjourney 提示词格式（简洁优于冗长）、参数系统（--no / --ar / --s / --sref / --cref）、多 prompt 语法（::）。
- [3] Andrew. — https://stable-diffusion-art.com/prompt-guide/ | SD 提示词的 8 类解剖结构（subject / medium / style / artist / website / resolution / additional details / color）、(keyword:weight) 权重语法、负面提示词机制、CLIP 75-token/chunk 分词限制、BREAK 关键词。
- [4] Black Forest Labs. — https://huggingface.co/black-forest-labs/FLUX.1-schnell | 12B 参数 rectified flow transformer、1–4 步推理、FlowMatchEulerScheduler、T5 Encoder 文本编码、guidance scale 在 schnell 中设为 0 的说明。
- [5] Tongyi-MAI (Z-Image Team). — https://huggingface.co/Tongyi-MAI/Z-Image-Turbo | 6B 参数 S3-DiT 架构，Qwen3-4B 作为文本编码器（论文 §4.1）。训练使用 5 类 caption（long/medium/short/tags/simulated user prompts，§3.2）。Decoupled-DMD 蒸馏实现 8 NFE 推理（arXiv:2511.22677）。guidance_scale=0.0、num_inference_steps=9（实际 8 次 DiT forward）。中英文双语文本渲染、Prompt Enhancer 推理增强为核心提示词相关能力。Apache 2.0 许可，月下载量 100 万+。

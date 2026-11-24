---
title: 微软 MAI-Image-2 模型家族：自研文生图的效率与商业落地
eyebrow: Microsoft MAI-Image-2 Family
brand: 模型
date: 2026-04-16
strict_i18n: false
strict_density: true
lead: "MAI-Image-2 是微软自研的文生图生成模型家族，包含两个变体：MAI-Image-2（完整版）和 MAI-Image-2e（高效版）[1]。该模型采用 Diffusion-based 渐进式生成架构，支持最长 32,000 token 的自然语言提示词输入，输出分辨率最高达 1,048,576 总像素（等效 1024×1024）[2]。MAI-Image-2e 在保持相同画质的前提下，推理速度比 MAI-Image-2 快 22%，计算效率提升至 4 倍，面向大规模商业图片生成场景[1]。截至 2026 年 4 月，该模型已通过 Azure Foundry 在 6 个全球区域提供 Global Standard 部署[2]。"
hero_actions:
  - "查看架构对比 | #architecture"
  - "查看部署指南 | #deployment"
panel_label: 核心价值
panel_title: 微软首个企业级自研文生图模型
panel:
  - Diffusion-based 渐进生成：文本→高质量 PNG 图像
  - 双变体策略：质量优先（MAI-Image-2）vs 效率优先（MAI-Image-2e）
  - 32K token 长提示词：支持精细描述复杂场景
  - Azure 原生集成：Foundry API + Entra ID + RBAC
metrics:
  - "效率提升 | 4× | MAI-Image-2e vs MAI-Image-2"
  - "速度提升 | 22% | 推理延迟降低"
  - "提示词长度 | 32K | token 上下文窗口"
  - "部署区域 | 6 个 | Global Standard 区域"
style:
  accent: "#0ea5e9"
---

## #positioning 01 / 模型定位 :: 为什么微软需要自研文生图模型

MAI-Image-2 系列是微软首个以"MAI"品牌发布的自研文生图模型，标志着微软从依赖合作伙伴模型（如 DALL·E）转向自主可控的图像生成能力。

:::accordion
::panel
### 战略背景：第一方图像生成能力
微软此前的图像生成能力依赖 OpenAI 的 DALL·E 系列和 GPT Image 模型。MAI-Image-2 的发布意味着微软在文生图领域建立了独立于 OpenAI 的自研路径。在 Azure Foundry 的模型目录中，MAI-Image-2 / MAI-Image-2e 与 GPT Image-1 / GPT Image-1.5、FLUX.2、Stable Diffusion 3.5 Large 并列为可选的图像生成模型[3]。

从命名体系看，"MAI"（Microsoft AI）品牌统一了微软自研模型的标识——与 Phi 系列语言模型平行，MAI-Image 系列定位为图像生成垂直领域的微软第一方解决方案。

::panel
### 目标用户：商业内容生产者
微软官方文档明确将 MAI-Image-2 定位为"product imagery, marketing visuals, brand assets, and commercial creative workflows"的工具[2]。这一定位与主流竞品形成差异化：

1. **产品图片生成**——电商场景下的批量产品展示图
2. **营销视觉素材**——社交媒体广告、Banner、推广图
3. **品牌资产创作**——风格一致的品牌视觉元素
4. **商业创意工作流**——概念可视化和设计迭代

::panel
### 双版本策略：质量 vs 效率的取舍
MAI-Image-2 家族采用"完整版 + 高效版"的双模型发布策略，用户可根据场景在质量和成本之间选择：

MAI-Image-2

**完整版——质量优先**

追求最高画质和视觉保真度的场景。适合品牌主视觉、高分辨率概念图等低频高质量需求。版本号：2026-02-20。

MAI-Image-2e

**高效版——规模优先**

在保持同等画质下，推理快 22%、效率高 4 倍。适合产品图批量生成、A/B 测试素材、营销内容流水线等高频高吞吐场景。版本号：2026-04-09。

微软官方描述 MAI-Image-2e 为"the smartest choice for developers building at scale"[1]。具体效率提升数据未披露测量条件（硬件规格、Batch Size、分辨率配置），这是需要注意的信息缺口。
:::

## #architecture 02 / 架构与能力 :: Diffusion-based 渐进式生成

MAI-Image-2 使用扩散模型架构，从噪声逐步精炼到高质量图像。以下梳理公开可知的技术规格。

:::accordion
::panel
### 生成机制：扩散模型基础
微软官方描述为"diffusion-based generative approach to progressively refine images"[1]。这表明 MAI-Image-2 属于扩散模型家族（Diffusion Models），其生成过程包括：

1. **前向过程（训练时）**：向真实图像逐步添加高斯噪声，直到变为纯噪声
2. **反向过程（推理时）**：从随机噪声出发，通过学到的去噪网络逐步恢复清晰图像
3. **条件引导**：文本提示通过编码器嵌入后指导每一步去噪方向

截至 2026 年 4 月，微软尚未公开 MAI-Image-2 的具体架构细节（如是否采用 DiT / U-Net、参数量、文本编码器类型）。Hugging Face 模型页面为 gated access 状态。

::panel
### 输入输出规格
| 参数 | MAI-Image-2 | MAI-Image-2e |
| --- | --- | --- |
| 模型版本 | 2026-02-20 | 2026-04-09 |
| 输入 | 文本（最长 32,000 tokens） |   |
| 输出 | 单张 PNG 图像 |   |
| 最小分辨率 | 768 × 768 像素 |   |
| 最大总像素 | 1,048,576（等效 1024×1024） |   |
| 灵活比例 | 任一维度可超过 1024，只要 width × height ≤ 1,048,576（如 768×1365） |   |
| 语言 | 英语 |   |
| 推理速度 | 基准 | 快 22% |
| 计算效率 | 基准 | 4 倍 |

32,000 token 的上下文窗口在文生图模型中属于较长范围。作为对比，FLUX.2-flex 和 FLUX.2-pro 支持 32,000 token，FLUX.1-Kontext-pro 为 5,000 token，Stable Diffusion 3.5 Large 为 1,000 token[3]。

::panel
### 已知能力边界
根据已公开的官方文档，以下是 MAI-Image-2 当前的能力边界[1][2]：

**已确认支持**

- 文本到图像生成
- 自然语言提示词输入
- 自定义宽高比（像素总量约束内）
- API Key / Entra ID 认证

**未公开 / 不支持**

- 图像编辑 / 图生图
- 多参考图输入
- 负面提示词
- Seed / 推理步数控制
- 非英语语言
:::

## #deployment 03 / API 与部署 :: Azure Foundry 部署与调用

MAI-Image-2 通过 Azure Foundry 的 Global Standard 部署类型提供服务，使用微软自有 API 端点。

:::accordion
::panel
### 部署流程
MAI-Image-2 / MAI-Image-2e 可通过 Azure Foundry Portal 或 Azure CLI 部署[1]：

1. **前置条件**：Azure 订阅 + Microsoft Foundry 项目 + Cognitive Services Contributor 角色
2. **Portal 部署**：在 Foundry Portal 的模型目录中选择 MAI-Image-2 或 MAI-Image-2e，创建部署
3. **CLI 部署**：使用 `az cognitiveservices account deployment create` 命令

az cognitiveservices account deployment create \ --name <ACCOUNT_NAME> \ --resource-group <RESOURCE_GROUP> \ --deployment-name <DEPLOYMENT_NAME> \ --model-name MAI-Image-2e \ --model-format Microsoft \ --model-version 2026-04-09 \ --sku-name GlobalStandard \ --sku-capacity 1

**可用区域（Global Standard）**：West Central US、East US、West US、West Europe、Sweden Central、South India[2]。

::panel
### API 端点与调用方式
MAI-Image-2 使用独立的 MAI API 端点（非标准 OpenAI 兼容端点）[1]：

POST https://<resource-name>.services.ai.azure.com/mai/v1/images/generations

请求参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `model` | string | 部署名称 |
| `prompt` | string | 文本提示词（最长 32,000 tokens） |
| `width` | integer | 输出宽度（≥ 768px） |
| `height` | integer | 输出高度（≥ 768px，width × height ≤ 1,048,576） |

认证方式：API Key（通过 `api-key` 请求头）或 Microsoft Entra ID Bearer Token（scope: `https://cognitiveservices.azure.com/.default`）[1]。

::panel
### 配额与限流
MAI 模型的速率限制按 RPM（Requests Per Minute）计量[1]：

| 容量单位 | MAI-Image-2 RPM | MAI-Image-2e RPM |
| --- | --- | --- |
| 1 | 18 | 9 |
| 2 | 30 | 15 |
| 3 | 60 | 30 |
| 4 | 90 | 45 |
| 5 | 120 | 60 |
| 6 | 180 | 90 |

注意：MAI-Image-2e 的 RPM 限制约为 MAI-Image-2 的一半。由于 MAI-Image-2e 每次请求的计算成本更低（效率 4 倍），这一配额比例意味着在相同容量单位下，两者的实际计算资源消耗可能接近。具体定价信息未在公开文档中找到。
:::

## #comparison 04 / 竞品对比 :: Azure Foundry 中的文生图模型选型

Azure Foundry 同时提供多个文生图模型。以下基于公开文档对比关键差异。

:::accordion
::panel { open: true }
### Azure Foundry 文生图模型对比矩阵
| 模型 | 提供商 | 提示词长度 | 图生图 | 多参考图 | API 兼容性 |
| --- | --- | --- | --- | --- | --- |
| **MAI-Image-2e** | Microsoft | 32K tokens | 否 | 否 | MAI API |
| **MAI-Image-2** | Microsoft | 32K tokens | 否 | 否 | MAI API |
| **GPT Image-1.5** | OpenAI | 4K tokens | 是 | 否 | OpenAI API |
| **FLUX.2-flex** | Black Forest Labs | 32K tokens | 是 | 10 张 | BFL API |
| **FLUX.1-Kontext-pro** | Black Forest Labs | 5K tokens | 是 | 1 张 | BFL / OpenAI API |
| **SD 3.5 Large** | Stability AI | 1K tokens | 是 | 1 张 | Stability API |

数据来源：Azure Foundry Models 官方文档[3][4]。GPT Image-1 / GPT Image-1.5 需要 Limited Access 申请。画质比较需要在相同提示词下实测，此处仅对比 API 规格。

::panel
### MAI-Image-2 的差异化优势与不足
**差异化优势**

- **Azure 原生第一方**：SLA 覆盖、Azure RBAC 权限管理、Entra ID 认证，无需第三方 Marketplace 订阅
- **长提示词**：32K tokens 与 FLUX.2 并列最长，远超 GPT Image（4K）和 SD（1K）
- **双变体弹性**：同一 API 接口切换质量/效率版本
- **计算效率**：MAI-Image-2e 的 4 倍效率降低了批量生成的单图成本

**当前不足**

- **纯文本到图像**：不支持图像编辑、图生图、多参考图输入——FLUX.2 和 GPT Image 均已支持
- **仅英语**：不支持中文等其他语言的提示词输入
- **控制参数有限**：不暴露 seed、推理步数、guidance scale 等进阶参数
- **区域有限**：6 个区域，少于 FLUX.2 的全区域覆盖
- **Preview 状态**：尚未 GA，SLA 和稳定性保障尚待完善
:::

## #scenarios 05 / 适用场景 :: 商业落地路径

基于 MAI-Image-2 的能力边界和定位，以下是推荐和不推荐的使用场景。

:::accordion
::panel
### 推荐场景
1. **电商产品图批量生成（MAI-Image-2e）**——利用 4 倍效率优势，在同一配额内生成更多的产品展示图。32K token 长提示支持精确描述产品细节、背景场景和品牌要素
2. **营销素材 A/B 测试（MAI-Image-2e）**——快速生成多个创意变体，支持数据驱动的素材优化
3. **品牌主视觉设计（MAI-Image-2）**——使用完整版获得最高画质输出，适用于品牌关键视觉、主视觉海报等低频高质量需求
4. **Azure 生态集成应用**——已有 Azure 基础设施的企业客户，可利用 Entra ID 认证和 RBAC 权限管理实现安全合规的图像生成工作流

::panel
### 不推荐场景
1. **图像编辑 / 局部修改**——MAI-Image-2 不支持 inpainting、outpainting 和图生图。需使用 FLUX.1-Kontext-pro 或 GPT Image-1
2. **风格参考 / 角色一致性**——不支持参考图输入。FLUX.2-flex 支持最多 10 张参考图
3. **非英语提示词**——仅支持英语输入。中文场景需先翻译为英文
4. **需要精细控制的高级用户**——不暴露 seed、步数等参数。SD 3.5 Large 或 FLUX 提供更多控制维度

::panel
### MAI-Image-2e vs MAI-Image-2：如何选择
| 决策因素 | 选择 MAI-Image-2 | 选择 MAI-Image-2e |
| --- | --- | --- |
| 图片数量 | 低频（每日几十张） | 高频（每日数百至数千张） |
| 质量要求 | 追求极致画质 | 画质足够好即可 |
| 成本敏感度 | 不敏感 | 优先控制成本 |
| 延迟要求 | 可接受较长等待 | 需要快速响应 |
| 典型场景 | 品牌主视觉、概念设计 | 产品图批量生成、营销素材 |

微软官方表示两者"画质相同"[1]，但未提供 GenEval / DPG-Bench 等标准 Benchmark 的对比数据。建议在目标场景下实测对比后做决策。
:::

## #references 06 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-mai | MAI-Image-2 / MAI-Image-2e 的部署流程、API 端点、输入输出规格、配额限制、认证方式。MAI-Image-2e 核心数据来源："up to 22% faster and four times more efficient than MAI-Image-2"。
- [2] Microsoft. — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure?pivots=azure-direct-others | MAI-Image-2 / MAI-Image-2e 的能力摘要（32K tokens, PNG 输出, 768×768 ~ 1024×1024, 6 区域 Global Standard）、定位描述（product imagery, marketing visuals, brand assets）。
- [3] Microsoft. — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure?pivots=azure-direct-others | FLUX.2-flex（32K tokens, 10 参考图）、FLUX.1-Kontext-pro（5K tokens, 1 参考图）、FLUX-1.1-pro（5K tokens）、SD 3.5 Large（1K tokens, 1 参考图）的能力规格。
- [4] Microsoft. — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure?pivots=azure-openai | GPT Image-1 / GPT Image-1-mini / GPT Image-1.5 的可用性和容量信息（4K tokens, Limited Access）。

---
title: Function Calling 模型全景：主流 LLM 工具调用能力深度对比
eyebrow: LLM Tool Use Benchmark
brand: 模型
date: 2026-04-11
strict_i18n: false
strict_density: true
lead: "Function calling（工具调用）是 LLM 从\"文本生成器\"演进为\"自主行动者\"的关键能力。本报告基于 Berkeley Function Calling Leaderboard V4（BFCL V4）最新数据，系统对比 Anthropic Claude、Google Gemini、OpenAI GPT、xAI Grok、DeepSeek、Qwen、Meta Llama 等主流模型在 single-turn、multi-turn、agentic web search 和 memory 场景下的 function calling 表现，拆解各 vendor 的协议差异与工程取舍，为 AI Agent 架构选型梳理量化参考。"
hero_actions:
  - "排行榜数据 | #leaderboard"
  - "选型指南 | #decision"
panel_label: 核心发现
panel_title: Claude Opus 领跑榜首，GLM-4 成为开源之王，Agentic 评测维度颠覆传统排名。
panel:
  - "Claude Opus 4.5 以 77.47% Overall 稳居 BFCL V4 榜首，Agentic + Multi-Turn 综合表现碾压竞品。"
  - "智谱 GLM-4.6 (FC thinking) 以 72.38% 位列第 4，是榜单唯一进入 Top 5 的开源模型（MIT 许可）。"
  - "BFCL V4 引入 Agentic 评测（40% 权重）：Web Search + Memory + Format Sensitivity，传统 simple/parallel FC 占比降至 10%。"
  - "OpenAI GPT-5.2 排名第 16（55.87%），GPT-4.1 排名第 20（53.96%）— 在 agentic 维度上落后于 Claude 和 Gemini。"
metrics:
  - "评测基准 | BFCL V4 | Berkeley Function Calling Leaderboard，5,088 条评测用例"
  - "评测模型数 | 109 个 | 涵盖闭源 + 开源 + 专用 FC 微调模型"
  - "榜首模型 | Claude Opus 4.5 | 77.47% Overall Accuracy，Anthropic 闭源"
  - "开源之王 | GLM-4.6 | 72.38% Overall，MIT 许可，智谱 AI"
style:
  accent: "#0ea5e9"
---

## #landscape 01 / Landscape Overview :: Function Calling 全景：从 API 扩展到 Agentic 核心能力

Function calling 的本质是让 LLM 在生成自然语言之外，还能输出结构化的函数调用指令（函数名 + 参数），由外部系统执行后将结果回传模型。这一能力是构建 AI Agent 的基础 — 没有可靠的工具调用，Agent 就无法感知环境、操作数据、调用 API。

:::insight-grid { cols: 2 }
::card 01
### 什么是 Function Calling
LLM 接收用户指令 + 可用函数声明（name、description、parameters schema），判断是否需要调用函数、调用哪个、传什么参数。模型不执行函数，只输出结构化调用意图（JSON），由应用侧负责执行并将结果回传。

::card 02
### 为什么 FC 是 Agent 的基石
Agent 的"感知—推理—行动"循环依赖 FC：感知（调用搜索/数据库查询获取信息）、推理（分析返回结果、决定下一步）、行动（调用 API 执行操作）。FC 是 LLM 与外部世界的唯一结构化接口。

::card 03
### FC vs Prompt-Based 工具调用
原生 FC（Native Function Calling）由模型内置的特殊 token 和训练支持，准确率和格式稳定性远高于 prompt workaround（在 system prompt 中描述工具格式让模型文本输出）。BFCL 同时评测两种模式。

::card 04
### 评测维度的演进
BFCL V1 评测 simple/parallel/multiple FC → V2 加入企业级 live data → V3 加入 multi-turn 多轮交互 → V4 加入 agentic 评测（web search + memory + format sensitivity），权重分配：Agentic 40% + Multi-Turn 30% + Live 10% + Non-Live 10% + Hallucination 10%。
:::

:::comparison
::versus FC 能力分层
### 从简单到复杂的五个层次
- **Simple FC** — 单轮、单函数调用，提取正确的函数名和参数。所有主流模型都能达到 80%+ 准确率。
- **Parallel FC** — 一次响应中同时调用多个独立函数（如同时查天气和预订餐厅）。需要模型理解函数间无依赖。
- **Multi-Turn FC** — 跨多轮对话的函数调用，模型需要追踪上下文、处理缺失参数、主动询问用户。
- **Compositional FC** — 链式调用：函数 A 的输出作为函数 B 的输入。需要模型规划执行顺序。
- **Agentic FC** — 自主搜索、记忆管理、多步规划。模型在复杂任务中自主决策调用策略。这是区分顶级模型的关键。

::versus BFCL V4 评测架构 { highlight: true }
### 五大维度 × 权重分配
- **Agentic（40%）** — Web Search（200 题）+ Memory（465 题），涵盖多跳搜索、向量存储读写、KV 存储和摘要检索。
- **Multi-Turn（30%）** — 200 base + 600 augmented，含缺失函数、缺失参数、长上下文等场景。
- **Live（10%）** — 1,351 条企业级真实 API 调用数据。
- **Non-Live（10%）** — 1,150 条 Python/Java/JS 的 AST 验证用例。
- **Hallucination（10%）** — 1,122 条不相关性测试，衡量模型在不需要调用函数时是否仍然错误调用。
:::

## #leaderboard 02 / BFCL V4 Leaderboard :: 排行榜数据：Top 30 模型全维度对比

数据来源：Berkeley Function Calling Leaderboard V4，最后更新 2025-12-16。Overall Accuracy 为 Agentic（40%）+ Multi-Turn（30%）+ Live（10%）+ Non-Live（10%）+ Hallucination（10%）的加权平均。FC = 原生 Function Calling 模式，Prompt = 文本生成 workaround。

| # | 模型 | Overall | Agentic | Multi-Turn | Non-Live | Hallucination | 厂商 | 许可 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Claude Opus 4.5 (FC) | 77.47% | 84.50% | 73.76% | 79.79% | 84.72% | Anthropic | Proprietary |
| 2 | Claude Sonnet 4.5 (FC) | 73.24% | 81.00% | 64.95% | 81.13% | 86.61% | Anthropic | Proprietary |
| 3 | Gemini 3 Pro Preview (P) | 72.51% | 80.00% | 61.72% | 83.12% | 85.59% | Google | Proprietary |
| 4 | GLM-4.6 (FC thinking) | 72.38% | 77.50% | 55.70% | 80.90% | 84.96% | 智谱 AI | MIT |
| 5 | Grok 4-1 fast reasoning (FC) | 69.57% | 82.50% | 53.98% | 78.46% | 79.43% | xAI | Proprietary |
| 6 | Claude Haiku 4.5 (FC) | 68.70% | 83.50% | 54.41% | 78.68% | 85.11% | Anthropic | Proprietary |
| 7 | Gemini 3 Pro Preview (FC) | 68.14% | 68.50% | 54.84% | 81.72% | 77.85% | Google | Proprietary |
| 8 | o3-2025-04-16 (Prompt) | 63.05% | 50.50% | 51.83% | 73.21% | 83.98% | OpenAI | Proprietary |
| 9 | Grok 4-0709 (Prompt) | 62.97% | 74.00% | 50.54% | 72.54% | 84.30% | xAI | Proprietary |
| 10 | Grok 4-0709 (FC) | 61.38% | 82.00% | 55.91% | 75.57% | 75.40% | xAI | Proprietary |
| 11 | Kimi K2 Instruct (FC) | 59.06% | 66.50% | 29.03% | 78.68% | 87.34% | MoonshotAI | modified-MIT |
| 14 | DeepSeek V3.2 (Prompt+Think) | 56.73% | 58.00% | 44.09% | 76.02% | 67.00% | DeepSeek | MIT |
| 16 | GPT-5.2 (FC) | 55.87% | 75.50% | 45.81% | 70.39% | 79.42% | OpenAI | Proprietary |
| 20 | GPT-4.1 (FC) | 53.96% | 68.00% | 23.87% | 69.95% | 86.52% | OpenAI | Proprietary |
| 23 | Qwen3 235B-A22B (Prompt) | 52.15% | 50.50% | 19.35% | 78.68% | 78.89% | Qwen | Apache-2.0 |

:::insight-grid { cols: 2, title: "排行榜关键发现" }
::card A
### Anthropic 统治力
Claude 家族占据 Top 6 中的三席（Opus 4.5 / Sonnet 4.5 / Haiku 4.5）。Claude 在 Agentic 维度上的表现尤为突出（Haiku 4.5 以 83.5% Agentic 超过所有 GPT 和 Gemini 旗舰模型），说明 Anthropic 在 tool use 训练上投入了大量工程资源。

::card B
### OpenAI 的意外落后
GPT-5.2 排名第 16（55.87%），GPT-4.1 排名第 20（53.96%），o3 在 Prompt 模式下排名第 8（63.05%）但 FC 模式跌至 30。OpenAI 模型在 Multi-Turn 维度普遍弱于 Claude 和 Gemini，反映了其在多轮工具交互训练上的不足。

::card C
### 开源模型的突破
GLM-4.6（MIT）排名第 4，Kimi K2（modified-MIT）排名第 11，DeepSeek V3.2（MIT）排名第 14。开源模型在 Non-Live（传统 FC）维度上已接近甚至超越闭源旗舰，但 Agentic 和 Multi-Turn 维度仍有差距。

::card D
### FC vs Prompt 模式差异
部分模型在 Prompt 模式下得分反而更高（如 Gemini 3 Pro Prompt 72.51% > FC 68.14%）。可见原生 FC 模式并非在所有场景下都占优 — 模型的 thinking 能力在 Prompt 模式下能更灵活地组织工具调用逻辑。
:::

## #protocols 03 / Protocol Comparison :: 协议差异：各厂商 Function Calling 机制对比

虽然 function calling 的核心概念相同（声明函数 → 模型决定调用 → 应用执行 → 返回结果），但各厂商在 API 设计、参数格式、调用模式和高级特性上各有工程取舍。

OpenAI

### Responses API + tools 参数

- **函数声明**：JSON Schema 格式，通过 `tools` 参数传入
- **调用模式**：auto / required / none
- **并行调用**：支持（parallel_tool_calls）
- **Strict 模式**：`strict: true` 强制模型输出严格匹配 schema
- **Structured Output**：与 FC 共用 JSON Schema 引擎
- **特殊能力**：Predicted Outputs、1M 上下文、prompt caching

Anthropic

### Messages API + tools 参数

- **函数声明**：JSON Schema 格式，通过 `tools` 参数传入
- **调用信号**：`stop_reason: "tool_use"` + `tool_use` content block
- **调用模式**：auto / any / tool / none
- **Strict 模式**：`strict: true` 保证 schema 一致性
- **Server Tools**：web_search、code_execution 等在 Anthropic 侧执行
- **MCP 原生支持**：MCP connector 直接对接 MCP server

Google

### Gemini API + Tool 对象

- **函数声明**：OpenAPI Schema 子集，通过 `tools` + `function_declarations` 传入
- **调用模式**：VALIDATED / AUTO / ANY / NONE
- **ID 追踪**：Gemini 3 起每次调用返回唯一 `id`，用于结果回映射
- **Compositional FC**：原生链式调用（函数 A 输出 → 函数 B 输入）
- **Multimodal 响应**：function response 可包含图片/PDF 等多模态内容
- **思维签名**：Gemini 3 在 FC 中必须传递 thought_signature

开源模型

### ChatML / 自定义 token 协议

- **Hermes 系列**：`<tool_call>` 特殊 token + JSON 格式输出
- **Qwen 系列**：原生 FC 支持，兼容 OpenAI function calling 格式
- **GLM 系列**：原生 FC(thinking) 模式，支持调用前推理链
- **部署方式**：通过 vLLM / llama.cpp / Ollama 等推理框架，使用 OpenAI 兼容 API
- **通用限制**：schema 校验不如闭源严格，需要额外的后处理校验
- **MCP 集成**：通过框架层面（如 LangChain、OpenAI SDK）桥接

```
// OpenAI 格式示例（各厂商基本兼容此格式）
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "获取指定城市的当前天气",
      "parameters": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "城市名" },
          "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
        },
        "required": ["city"]
      }
    }
  }],
  "tool_choice": "auto"
}
```

## #proprietary 04 / Proprietary Models :: 闭源模型深度分析：各厂商旗舰 FC 能力对比

闭源模型在 function calling 上投入了大量的专项训练和工程优化。结合 BFCL V4 评测表现，可逐一拆解四大闭源厂商旗舰模型的优劣势。

BFCL #1 · 77.47%

### Anthropic Claude 家族

**核心优势**

- 全系列（Opus / Sonnet / Haiku）均在 Top 6，FC 能力从旗舰到轻量一致
- Agentic 维度 Haiku 4.5（83.5%）超过竞品旗舰，成本效率极高
- Hallucination 控制最佳（Sonnet 86.61%），很少在不需要时错误调用函数
- Server-side tools（web_search / code_execution）减少客户端开发复杂度
- strict 模式保证 schema 一致性

**主要劣势**

- 成本最高（Opus 4.5 $4.38/benchmark），Haiku 性价比更优（$1.68）
- Prompt 模式下表现骤降（Opus Prompt 仅 33.47%），高度依赖原生 FC 模式

BFCL #3 · 72.51%

### Google Gemini 家族

**核心优势**

- Gemini 3 Pro 在 Prompt 模式下排名第 3（72.51%），Non-Live 得分最高（83.12%）
- 原生 Compositional FC：链式调用无需客户端编排
- Multimodal function response：支持图片/文档作为函数返回值
- VALIDATED 模式：默认强制 schema 合规，减少格式错误
- Gemini 2.5 Flash 是最佳性价比选择（56.24%，$2.99/benchmark）

**主要劣势**

- FC 模式（68.14%）低于 Prompt 模式（72.51%），原生 FC 训练可能不充分
- thought_signature 机制增加了手动管理会话历史的复杂度
- 延迟较高（Prompt 模式 298s，FC 模式 225s）

BFCL #8 · 63.05%

### OpenAI GPT 家族

**核心优势**

- 生态最成熟：function calling API 格式成为行业事实标准
- 1M token 上下文 + prompt caching（75% 折扣） 降低长对话成本
- GPT-4.1 在 ComplexFuncBench 得分 65.5%，tau-bench retail 68.0%
- Strict 模式保证输出格式一致性
- GPT-4.1 nano 是最低成本选择（$0.10/M input tokens）

**主要劣势**

- BFCL V4 排名出乎意料地低：GPT-5.2 仅 #16，GPT-4.1 仅 #20
- Multi-Turn 维度严重落后（GPT-4.1 FC 仅 23.87%）
- o3 FC 模式跌至 #30（48.56%），reasoning 模型的 FC 适配存在问题

BFCL #5 · 69.57%

### xAI Grok 家族

**核心优势**

- Grok 4-1 fast reasoning 排名第 5，Agentic 高达 82.5%
- 多个变体进入 Top 12（reasoning / non-reasoning / Grok 4）
- Multi-Turn 维度接近 Claude（55.91% FC 模式）

**主要劣势**

- 生态不够成熟：SDK、文档、社区支持规模远小于 OpenAI/Anthropic
- 成本偏高：Grok 4-0709 benchmark 成本 $30.38
- Hallucination 控制相对较弱（Grok 4 FC 75.4%）

## #opensource 05 / Open Source Models :: 开源模型：从专用 FC 微调到通用推理模型的工具调用能力

开源 function calling 模型可分为三类：通用大模型的 FC 能力（Qwen / DeepSeek / GLM / Llama）、专用 FC 微调模型（xLAM / Hammer / Hermes）、以及轻量级 FC 模型（3B-8B 规模部署本地）。

| 模型 | Overall | 参数量 | Agentic | Multi-Turn | Non-Live | 许可 |
| --- | --- | --- | --- | --- | --- | --- |
| GLM-4.6 (FC thinking) | 72.38% | 未知 | 77.50% | 55.70% | 80.90% | MIT |
| Kimi K2 Instruct (FC) | 59.06% | MoE | 66.50% | 29.03% | 78.68% | modified-MIT |
| DeepSeek V3.2 (Prompt+Think) | 56.73% | MoE 671B | 58.00% | 44.09% | 76.02% | MIT |
| xLAM-2-32b-fc-r (FC) | 54.66% | 32B | 25.50% | 20.86% | 75.50% | CC-BY-NC-4.0 |
| Qwen3-235B-A22B (Prompt) | 52.15% | MoE 235B | 50.50% | 19.35% | 78.68% | Apache-2.0 |
| Qwen3-32B (FC) | 48.71% | 32B | 21.50% | 26.67% | 82.01% | Apache-2.0 |
| xLAM-2-8b-fc-r (FC) | 46.68% | 8B | 6.50% | 13.98% | 67.95% | CC-BY-NC-4.0 |
| Qwen3-8B (FC) | 42.57% | 8B | 12.00% | 14.62% | 80.53% | Apache-2.0 |
| Llama 4 Maverick 17B (FC) | 37.29% | 17B×128E | 28.00% | 18.92% | 73.65% | Llama 4 Community |
| Llama 3.3-70B (FC) | 31.90% | 70B | 10.00% | 8.17% | 76.61% | Llama 3 Community |

开源旗舰

### GLM-4.6 — 开源 FC 之王

智谱 AI 的 GLM-4.6 (FC thinking) 以 72.38% 闯入 BFCL V4 Top 4，是唯一进入前 5 的开源模型。其"FC thinking"模式在调用函数前执行推理链，在 Agentic（77.5%）和 Non-Live（80.9%）维度上均表现出色。MIT 许可意味着可以自由商用、修改和部署，对企业级场景极具吸引力。

专用 FC 微调

### xLAM / Hammer — 专注工具调用

Salesforce 的 xLAM-2 系列（1B/3B/8B/32B/70B）和 MadeAgents 的 Hammer 2.1 系列（0.5B-7B）是专门为 function calling 微调的模型。它们在传统 Non-Live 维度上表现优异（xLAM-2-32b Non-Live 75.5%），但在 Agentic 和 Multi-Turn 维度上差距明显，反映出针对性训练数据的局限 — 这些模型擅长执行"精确的单次工具调用"，尚难胜任"自主的多步工具编排"。

通用推理

### Qwen3 / DeepSeek — 通用模型的 FC 表现

Qwen3-235B 和 DeepSeek V3.2 作为通用推理模型，FC 能力更多来自于强大的指令遵循和格式控制能力，而非专项 FC 训练。Qwen3 家族在 Non-Live 维度上普遍超过 80%（Qwen3-32B FC 82.01%），但在 Agentic 维度上普遍低于 25%。DeepSeek V3.2 在 Prompt+Thinking 模式下（56.73%）表现远好于纯 FC 模式（54.12%），说明 thinking 能力对工具调用有正向增益。

Meta Llama

### Llama 家族 — 基座能力与 FC 表现不匹配

Meta Llama 4 Maverick（37.29%）和 Llama 3.3-70B（31.9%）的 FC 表现明显低于预期。Llama 4 Scout 更是跌至 28.13%。尽管 Llama 系列在通用基准上表现不错，但其 FC 训练明显不足 — 特别是在 Agentic（Llama 3.3-70B 仅 10%）和 Multi-Turn（仅 8.17%）维度上。

## #agentic 06 / Agentic Function Calling :: Agentic 维度：工具调用从"能用"到"可靠自主行动"的质变

BFCL V4 将 Agentic 评测权重提升至 40%，这一变化深刻反映了行业需求的转向：企业不再只关心"模型能不能调用函数"，更关注"模型能不能在复杂、多步、有失败的场景中自主走完任务链路"。

:::comparison
::versus Web Search
### Agentic Web Search（200 题）
- **测试内容** — 多跳搜索问题（2-4 hop），模型需调用 DuckDuckGo 搜索工具发起多轮查询，综合多个来源的信息回答问题。
- **失败模式 1：避免使用工具** — 某些模型倾向于依赖内部知识而非搜索，导致信息过时或不完整。
- **失败模式 2：关键词选择差** — 将整个问题粘贴为搜索查询，而非分解为子问题逐步搜索。
- **失败模式 3：网页内容误读** — 即使检索到正确网页，模型仍然可能错误解读内容（如混淆表格中排名第一和第二的建筑）。
- **关键发现** — 禁用搜索工具后，模型准确率断崖式下跌，证明模型确实在依赖实时搜索而非内部记忆作答。

::versus Memory { highlight: true }
### Agentic Memory（465 题）
- **Vector Store（155 题）** — 测试模型调用向量数据库执行语义检索的能力。
- **Key-Value Store（155 题）** — 测试模型读写结构化键值存储的能力。
- **Rec-Sum（155 题）** — 测试模型对检索结果提炼摘要与推理的能力。
- **核心差异** — Agentic Memory 不只测"能不能调函数"，而是测"能不能正确决策何时读、何时写、何时搜索、何时总结"。
- **格式敏感性** — BFCL V4 还测试了 26 种格式变体（5,200 题），验证模型在 prompt 格式微变时的行为稳定性。
:::

| 模型 | Overall | Agentic | Multi-Turn | Hallucination | 成本/benchmark |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 4.5 (FC) | 77.47% | 84.50% | 73.76% | 84.72% | $4.38 |
| Claude Haiku 4.5 (FC) | 68.70% | 83.50% | 54.41% | 85.11% | $1.68 |
| Grok 4-1 fast (FC) | 69.57% | 82.50% | 53.98% | 79.43% | $6.74 |
| Gemini 3 Pro (Prompt) | 72.51% | 80.00% | 61.72% | 85.59% | $12.08 |
| GLM-4.6 (FC thinking) | 72.38% | 77.50% | 55.70% | 84.96% | $4.34 |
| GPT-5.2 (FC) | 55.87% | 75.50% | 45.81% | 79.42% | $2.23 |
| GPT-4.1 (FC) | 53.96% | 68.00% | 23.87% | 86.52% | $1.63 |

## #decision 07 / Selection Guide :: 选型指南：按场景推荐 Function Calling 模型

选择 FC 模型不能只看排行榜分数。成本、延迟、部署限制、许可条款和具体应用场景都是关键因素，可按六类典型场景匹配推荐方案。

1

### 生产级 AI Agent（高可靠性优先）

**推荐：Claude Sonnet 4.5 (FC)** — Overall 73.24%，成本 $4.31/benchmark。兼顾 Agentic（81%）、Multi-Turn（64.95%）和 Hallucination 控制（86.61%）。如果预算充足，Opus 4.5 提供最高可靠性。Haiku 4.5 是高流量场景下的 fallback 选择（68.7%，$1.68）。

2

### 成本敏感的 API 集成（简单 FC 为主）

**推荐：GPT-4.1 nano ($0.10/M input) 或 Gemini 2.5 Flash Lite** — 对于简单的 single-turn FC（查天气、调 API、提取结构化数据），GPT-4.1 nano 成本极低且 Non-Live 达 60.77%。Gemini 2.5 Flash（56.24%，$2.99）适合需要 compositional FC 的场景。

3

### 私有化部署 / 数据主权要求

**推荐：GLM-4.6 (MIT) 或 Qwen3-32B (Apache-2.0)** — GLM-4.6 以 72.38% 逼近闭源旗舰水平，MIT 许可允许完全自由使用。Qwen3-32B 在 Non-Live 维度达到 82.01%，适合需要高精度单次 FC 的本地部署场景。DeepSeek V3.2（56.73%，MIT）是性价比更高的 MoE 选择。

4

### 边缘设备 / 轻量部署（3B-8B）

**推荐：xLAM-2-8b-fc-r 或 Qwen3-8B** — xLAM-2-8b（46.68%）在 Non-Live 维度达 67.95%，专为 FC 优化。Qwen3-8B（42.57%）则更适合需要兼顾对话的场景。Hammer2.1-7b（31.67%）在 Hallucination 控制上优异（90.12%）。

5

### 多模态工具调用

**推荐：Gemini 3 Pro** — 唯一原生支持 multimodal function response 的平台（函数返回值可包含图片/PDF），且支持 compositional FC 和 multi-tool use（内置搜索 + 自定义函数混用）。适合需要处理文档、图像、视频的 Agent 场景。

6

### MCP 生态对接

**推荐：Claude 4.5 系列 或 Gemini 3 系列** — Anthropic 内置原生 MCP connector，Gemini SDK 同样原生集成 MCP 自动工具调用支持。OpenAI 通过 Responses API + third-party MCP bridge 也可对接，但非原生支持。

:::insight-grid { cols: 3, title: "选型核心原则" }
::card !
### 选型核心原则
**不要只看 Overall 得分。**BFCL V4 的权重分配（Agentic 40%）意味着 Overall 主要反映 agentic 能力。如果你的场景以简单 FC 为主（如 API 封装、数据提取），应重点看 Non-Live 和 Live 子分数。如果你在构建自主 Agent，则 Agentic 和 Multi-Turn 是更关键的指标。

::card !
### FC 模式选择
原生 FC 模式并非总是最优。Gemini 3 Pro 在 Prompt 模式下比 FC 模式高 4.37 分。如果你的推理框架支持，可考虑 Prompt + Thinking 模式（如 DeepSeek V3.2 Prompt+Think 56.73% vs FC 54.12%），让模型在调用前先思考。

::card !
### 成本效率前线
Claude Haiku 4.5 是现阶段"性能/成本"最优解：68.7% Overall，$1.68/benchmark，Agentic 83.5% 超过所有 GPT 旗舰。GPT-4.1 nano（$0.10/M input）是极限低成本选择但 FC 能力有限（33.05%）。Gemini 2.5 Flash Lite（36.87%，$1.18）适合高流量低精度场景。
:::

## #references 08 / References :: 参考文献

- [1] Patil et al., 2025. — https://gorilla.cs.berkeley.edu/leaderboard.html | BFCL V4 完整排行榜数据来源。评测包含 5,088 条用例，覆盖 Agentic / Multi-Turn / Live / Non-Live / Hallucination 五大维度。
- [2] Berkeley Gorilla Team, 2025. — https://gorilla.cs.berkeley.edu/blogs/15_bfcl_v4_web_search.html | BFCL V4 web search 评测设计、数据生成方法、失败模式分析（避免工具使用 / 关键词选择差 / 网页误读）。
- [3] OpenAI, 2025. — https://openai.com/index/gpt-4-1/ | GPT-4.1 技术细节：Function calling 基准（ComplexFuncBench 65.5%，tau-bench retail 68.0%），1M 上下文，定价。
- [4] Anthropic, 2026. — https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview | Claude 工具调用架构：client tools / server tools 分类，strict 模式，MCP connector 原生支持。
- [5] Google, 2026. — https://ai.google.dev/gemini-api/docs/function-calling | Gemini FC 协议：VALIDATED/AUTO/ANY/NONE 模式，compositional FC，multimodal function response，thought signature 机制。
- [6] Salesforce AI Research, 2025. — https://huggingface.co/collections/Salesforce/xlam-2-67ef5be12949d8dcdcb5e2e5 | xLAM-2 系列专用 FC 模型，覆盖 1B-70B 规模，Non-Live 维度表现突出。

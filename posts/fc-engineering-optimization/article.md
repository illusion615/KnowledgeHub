---
title: 同一模型下提升 Function Calling 成功率的系统方法
eyebrow: Function Calling 工程化
brand: "Function Calling & Agentic"
date: 2026-04-29
strict_i18n: false
strict_density: true
lead: "Function Calling 让模型从\"只能聊天\"升级到\"能操作外部系统\"。但从 Demo 到生产，准确率才是核心挑战。本文通过具体的代码对比和生产案例，展示在不更换模型的前提下，如何通过工程手段系统性提升调用成功率。"
hero_actions:
  - "Schema 工程 | #schema-eng"
  - "实战案例 | #case-study"
panel_label: 核心发现
panel_title: 绝大多数 FC 失败源于输入给模型的 Schema 信息含糊，而非模型推理能力不足。
panel:
  - "描述写清楚：一个好的 description 把调用准确率从 60% 拉到 90%"
  - 工具数量要克制：超过 20 个工具时调用准确率会明显下滑（OpenAI/Google 一致建议）
  - "开 Strict Mode（OpenAI/Anthropic）或 VALIDATED 模式（Gemini）：参数格式错误直接降为 0%"
  - 错误要传回模型：模型能自我纠正，但需要你把错误信息告诉它
metrics:
  - "工具上限建议 | 10-20 | OpenAI、Google、Anthropic 一致建议"
  - "Schema 约束 | Strict / VALIDATED | OpenAI·Anthropic / Gemini 各有实现"
  - "实战案例 | 3 | 电商客服 / 天气查询 / 多Agent编排"
  - "数据源 | 3 厂商 | OpenAI / Anthropic / Google 官方文档"
style:
  accent: "#6366f1"
---

## #how-fc-works 01 / How It Works :: 一个请求背后发生了什么

在讨论优化之前，先用一个具体例子看清 Function Calling 的完整流程——这会帮我们理解每个环节可能出错的位置。

:::accordion
::panel
### 案例：用户说"帮我查北京明天的天气"
完整调用流程

用户: 查北京明天天气

→

应用: 把消息+工具定义发给模型

→

模型: 决定调用 get_weather(city="Beijing")

→

应用: 收到 function_call，执行真实 API

→

天气API: 返回 {temp: 28, condition: "晴"}

→

应用: 把结果作为 function_result 发回模型

→

模型: "北京明天天气晴，28°C"

关键认知：模型不执行函数，你的代码执行

模型的工作是**看懂用户意图 → 选对函数 → 填对参数**。它返回的是一个 JSON 格式的"调用请求"（比如 `{"name": "get_weather", "arguments": {"city": "Beijing"}}`），你的应用代码负责执行这个请求并获取真实结果。模型从不直接访问你的 API。

五个可能出错的位置

① 模型选错了函数（有 10 个可选，选了 `get_temperature` 而不是 `get_weather`）。② 选对函数但参数错（填了 `"北京"` 而不是 `"Beijing"`）。③ 本该调函数但模型直接编了一个回复。④ 不该调函数时模型强行调了一个。⑤ 函数执行失败（API 超时），模型没机会处理错误。这五个问题，都可以通过工程手段系统性解决。
:::

## #schema-eng 02 / Schema Engineering :: Schema 工程：用好的"说明书"让模型少犯错

模型靠 Schema（函数定义）来理解每个工具能做什么、参数要什么格式。Schema 写得好不好，直接决定模型选对工具和填对参数的概率。

:::accordion
::panel
### 代码对比：差的 vs 好的函数定义
案例：一个电商退款函数

假设你在做一个客服系统，需要模型帮用户处理退款。下面两种写法，效果天差地别：

```
                    差的写法{
  "name": "refund",
  "description": "Process refund",
  "parameters": {
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "amt": {"type": "number"},
      "r": {"type": "string"}
    }
  }
}
// 问题：
// 1. name 太模糊——refund 什么？
// 2. description 没说何时该用
// 3. 参数名缩写，模型要猜
// 4. 没有 required 字段
// 5. "r" 是什么？reason？recipient？
```

```
                    好的写法{
  "name": "submit_order_refund",
  "description": "Submit a refund for a
    customer's order. Use this when a
    customer requests money back for a
    completed order. Do NOT use for
    exchanges or order cancellations.",
  "parameters": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "The order ID,
          e.g. 'ORD-2026-00123'"
      },
      "refund_reason": {
        "type": "string",
        "enum": ["defective",
          "wrong_item", "not_received",
          "changed_mind"],
        "description": "Reason for the
          refund request"
      }
    },
    "required": ["order_id",
      "refund_reason"],
    "additionalProperties": false
  },
  "strict": true
}
```

关键差异分析

**函数名**从"refund"改为"submit_order_refund"——模型光看名字就知道这是针对订单的退款提交。**描述**不仅说了能做什么，还说了*不能*做什么（不处理换货和取消）。**参数**用完整英文名，加了 description 和示例格式。**refund_reason** 用 enum 限定了四个有效值——模型不用猜。**strict: true** 确保模型输出 100% 符合 Schema。

::panel
### OpenAI 的实习生测试法
原则

OpenAI 官方文档给出了一条非常直观的检验标准：**"把函数定义交给一位实习生，如果对方仅凭字面说明就能正确调用，说明定义合格；凡是对方还会追问的细节，都应直接补进描述里。"** [[1]](https://developers.openai.com/api/docs/guides/function-calling)

具体操作

拿上面那版简陋的退款函数去问同事："你知道 `r` 参数填什么吗？"——对方势必会反问。把这些疑问的答案直接写进 description，核心目的是消除参数歧义。歧义越少，模型选对工具和参数的概率越高。

::panel
### Strict Mode：让参数格式错误变为不可能
先厘清一个概念：Strict Mode 不是模型能力，是 API 平台的约束机制

Strict Mode **并非模型自身的权重参数**，也不是所有支持 Function Calling 的模型通用的标准，而是**特定 API 平台在输出解码阶段施加的语法约束**——平台在模型逐 token 生成参数 JSON 时，实时校验每个 token 是否符合给定的 JSON Schema，违规 token 会被当场屏蔽。也就是说，约束直接作用于推理解码期，而非生成后校验。OpenAI 称之为 Strict Mode（`strict: true`），Anthropic 也支持同名参数（`strict: true`），但 **Google Gemini API 并无该参数**——Gemini 改用 `VALIDATED` 调用模式达成同等约束（强制模型只输出符合 Schema 的函数调用或自然语言，底层机制不同）。开源模型则需借助 vLLM / Outlines 等推理框架的 Guided Decoding 功能自行配置受控解码，无法直接开箱即用。[[1]](https://developers.openai.com/api/docs/guides/function-calling) [[2]](https://ai.google.dev/gemini-api/docs/function-calling)

问题场景：没有 Strict Mode 时会怎样

模型可能给 `order_id` 填一个 `123`（integer），虽然你 Schema 里写的是 string。或者给一个不在 enum 列表里的值（比如 `"other"`）。没有平台级约束时，你不得不在应用代码里写大量类型校验和格式修正。

Strict Mode 做了什么（OpenAI / Anthropic）

开启 `strict: true` 后，平台利用 Structured Outputs 技术在解码阶段约束输出——**模型在生成 token 时就被限制只能输出符合 Schema 的内容**。结果是参数类型、格式、必填字段 100% 符合定义。你的应用代码可以省掉所有格式校验逻辑，只处理业务层面的错误（比如 order_id 格式对但不存在）。

**OpenAI Strict Mode**

- 参数 `strict: true` 加在每个函数定义上
- Responses API 默认开启并自动补全约束
- 要求：所有字段标为 required、加 additionalProperties: false
- 可选字段用 `type: ["string", "null"]` 表达

**Anthropic Strict Tool Use**

- 参数 `strict: true` 加在工具定义上
- 同样基于 Structured Outputs 实现
- Schema 约束要求与 OpenAI 类似
- 不支持 JSON Schema 全部特性（如复杂递归类型）

**Google Gemini**

- **没有 strict 参数**
- 使用 `VALIDATED` 调用模式替代
- VALIDATED 确保 Schema 合规但机制不同
- 默认 ANY 模式下不强制合规

**开源模型**

- **模型本身无此能力**
- 需推理框架支持（vLLM Guided Decoding / Outlines）
- 自行配置 JSON Schema 约束
- 效果取决于框架实现质量

总结

Strict Mode 是 API 平台的工程能力，不是 LLM 的通用特性。如果你用 OpenAI 或 Anthropic，直接开 `strict: true` 即可；如果用 Gemini，需改用 `VALIDATED` 模式；如果用开源模型自部署，需要在推理框架层面配置 Guided Decoding。无论哪种路径，目标一致：**把参数格式校验从应用层挪到推理层，从"生成后修补"变成"生成时就对"**。

::panel
### 减少模型认知负担的三个技巧
技巧 1：已知参数不让模型填

场景：用户在上一步选择了订单 ORD-123，现在要提交退款。**错误做法**是定义 `submit_refund(order_id, reason)` 让模型去填 order_id。**正确做法**是定义 `submit_refund(reason)` 只让模型填 reason，order_id 在你的应用代码里直接从上下文取。OpenAI 原话："Don't make the model fill arguments you already know." [[1]](https://developers.openai.com/api/docs/guides/function-calling)

技巧 2：合并总是连续调用的函数

如果每次用户说"帮我下单"你都需要先调 `validate_cart()` 再调 `place_order()`，把它们合并成一个 `checkout()`。每多一次 function call 就多一次出错机会和 token 消耗。

技巧 3：用 Schema 结构消除非法状态

把 `toggle_light(on: bool, off: bool)`（可以同时为 true/false 两个矛盾状态）改为 `set_light(state: enum["on","off"])`。从 Schema 结构上让非法输入变为不可能，而不是靠应用层校验。
:::

## #tool-routing 03 / Tool Routing :: 工具路由：当工具超过 20 个怎么办

一个电商客服可能需要查订单、查物流、退款、换货、查会员积分、查优惠券等几十个操作。一次性给模型全部工具定义会怎样？准确率下降、token 暴涨、选错工具的概率升高。

:::accordion
::panel
### 案例：一个 40 工具的客服系统
问题描述

某电商客服系统有 40 个工具：订单查询、物流追踪、退款、换货、优惠券核销、会员积分查询、投诉升级……一次性全部放进 context。结果：每个 API 调用消耗 8000+ input tokens 光是工具定义，模型经常把"查物流"的请求错误地路由到"查订单"——因为两者的描述太相似。

**方案 A：应用层预过滤**

根据对话上下文在应用层判断当前意图属于哪个领域（订单/物流/售后），只注入该领域的 5-8 个工具。

- 优点：所有厂商都支持，无需额外 API
- 缺点：需要自己实现意图分类逻辑
- 适合：中小规模、领域明确的场景

**方案 B：Namespace 分组 + tool_choice**

用 OpenAI 的 Namespace 把工具按领域分组（`order`、`logistics`、`membership`），配合 `allowed_tools` 限制当前可用范围。

- 优点：不修改工具列表也能限制范围，利于 Prompt Caching
- 缺点：仅 OpenAI 支持 Namespace
- 适合：已重度使用 OpenAI 的场景

**方案 C：Tool Search 延迟加载**

只给模型工具的名字和一句话摘要。模型需要某个工具时，通过 `tool_search` 搜索并加载完整定义后再调用。

- 优点：初始 context 极小，支持 100+ 工具
- 缺点：仅 OpenAI gpt-5.4+ 支持
- 适合：工具数量大且经常变化的场景

::panel
### tool_choice：控制模型"该不该调函数"
四种模式及适用场景

用一个客服对话来说明：用户说"我要退货"，你希望模型一定去调退货函数，而不是回复"好的，请问您的订单号是多少"——这时候就用 `required` 强制模型必须调一个函数。

**auto（默认）**

模型自己决定。适合开放式对话——用户可能问"退货政策是什么"（不需要调函数）也可能说"帮我退这个订单"（需要调函数）。

**required**

必须调至少一个函数。适合确定性步骤——流程走到"提交退款"这一步，模型不应该回退到闲聊。

**指定函数名**

强制调特定函数。适合高度确定的场景——表单填完了，就该调 `submit_refund`，没有其他选项。

**none**

禁止调函数。适合纯对话阶段——比如在调函数之前先跟用户确认细节，不希望模型冒然操作。

::panel
### 并行 vs 链式调用：选择的代价
并行调用的好处和风险

用户说"帮我查北京和上海的天气"。模型可以一次性返回两个 `get_weather` 调用（`city="Beijing"` 和 `city="Shanghai"`），你的代码并行执行两个 API 请求。速度快一倍。

但风险是：`gpt-4.1-nano` 有时会对同一个工具生成重复调用。OpenAI 建议在用该模型时设置 `parallel_tool_calls: false`。[[1]](https://developers.openai.com/api/docs/guides/function-calling)

链式调用：一步的输出是下一步的输入

用户说"如果伦敦现在温度超过 20°C 就把空调设到 20°C，否则设到 18°C"。模型需要先调 `get_weather(London)`，拿到 25°C，再根据返回结果决定调用 `set_thermostat(20)`。Google Gemini 3 原生支持这种单请求内自动串联的多步调用，其他厂商则需靠客户端多轮对话循环驱动。[[2]](https://ai.google.dev/gemini-api/docs/function-calling)
:::

## #error-recovery 04 / Error Recovery :: 错误恢复：把失败变成学习机会

Function Calling 在生产中难免遇到 API 超时、参数不合法或权限不足。工程设计的重点在于报错后如何把上下文清晰传回，让模型自主修正。

:::accordion
::panel
### 案例：日期格式错误的自动修复
场景

用户说"帮我查 3 月 15 号的航班"。模型调用 `search_flights(date="March 15")`，但 API 要求格式是 `YYYY-MM-DD`。如何处理？

```
                    差的处理// 捕获错误 → 直接给用户报错
try {
  result = searchFlights(date);
} catch (e) {
  reply("抱歉，查询失败了");
  // 对话结束，用户体验差
  // 模型没有机会修正
}
```

```
                    好的处理// 捕获错误 → 结构化反馈给模型
try {
  result = searchFlights(date);
} catch (e) {
  // 把错误作为 function_result 传回
  functionResult = JSON.stringify({
    "error": "invalid_date_format",
    "message": "Date must be YYYY-MM-DD",
    "received": "March 15",
    "example": "2026-03-15"
  });
  // 模型收到后会自动修正:
  // search_flights(date="2026-03-15")
}
```

为什么这样做有效

模型是语言模型——它擅长理解错误描述并从中纠正行为。当你告诉它"你给的是 March 15，需要 YYYY-MM-DD 格式，比如 2026-03-15"，模型几乎总能在下一轮生成正确格式。**前提是你得把错误信息传回模型**，而不是自己消化掉。

::panel
### 分层降级策略
三层降级机制

不是所有错误都值得重试。建立三层降级机制：

::panel
### 人工确认：高风险操作的安全网
哪些操作需要确认

OpenAI 和 Google 文档均明确建议：**凡是带有不可逆后果的操作（付款、删除、下单），执行前必须先经用户确认**。具体做法是：模型返回 `function_call` 后，应用层先暂停真实调用，向用户展示"即将执行：退款 ¥299 到订单 ORD-123，原因：商品损坏。确认？"，待用户明确授权后再触发执行。[[1]](https://developers.openai.com/api/docs/guides/function-calling) [[2]](https://ai.google.dev/gemini-api/docs/function-calling)

只读函数 vs 读写函数的分类标准

一个实用的分类：查询类函数（`get_order_status`、`search_products`）可以自动执行，不需确认。修改类函数（`cancel_order`、`process_refund`）需要用户确认。在 Schema 或内部标签中标记每个函数是 `read` 还是 `write`，由应用层根据分类决定是否走确认流程。
:::

## #oss-frameworks 05 / Open-Source Frameworks :: 开源 FC 框架对比：自部署模型怎么选

调用商业 API（OpenAI / Anthropic / Google）时，FC 能力开箱即用；而自部署开源模型时，则需要推理框架接管 Tool Calling 解析与 Structured Output 约束。下表横向对比四类主流开源方案。

:::accordion
::panel
### 四大主流框架一览
**vLLM**

**定位**：高性能 LLM 推理引擎，78.6K Stars。FC 是其众多特性之一。

- 内置 OpenAI 兼容 API，`/v1/chat/completions` 直接支持 tool calls
- Structured Outputs 支持多后端：xgrammar（默认）、guidance、outlines、lm-format-enforcer
- 内置 40+ 模型的 Tool Parser（Hermes、Llama、Qwen、Mistral、DeepSeek 等）
- 支持 Reasoning 模型 + Structured Outputs 组合使用

**适合**：已经用 vLLM 部署模型的团队——FC 能力直接可用，无需额外集成

**SGLang**

**定位**：高性能 serving 框架，26.7K Stars。与 vLLM 直接竞争。

- OpenAI 兼容 API 支持 tool calling
- RadixAttention 前缀缓存——对工具定义不变的场景天然有利（相当于内置 Prompt Caching）
- Structured Outputs 支持 JSON Schema、Regex、Grammar
- 吞吐量基准测试常优于 vLLM，尤其在大规模部署场景

**适合**：追求极致吞吐量、大规模 GPU 集群部署（400K+ GPU 已验证）

**Outlines**

**定位**：Structured Generation 专用库，13.8K Stars。由 .txt 公司维护。

- 不是推理引擎——是约束层，可搭配 transformers、vLLM、Ollama、OpenAI 使用
- 用 Python 类型系统定义输出：`Literal["Yes","No"]`、`int`、Pydantic Model
- 支持 JSON Schema、Regex、CFG（上下文无关文法）约束
- 内置 Function Calling 示例：从自然语言提取函数签名参数

**适合**：需要灵活的结构化输出约束但不想绑定特定推理引擎

**llama.cpp + Guidance**

**定位**：轻量级本地推理 + 约束生成组合。

- llama.cpp 原生支持 GBNF Grammar 约束（JSON Schema → GBNF 自动转换）
- Guidance（Microsoft）提供程序化控制流——在生成过程中交替约束和自由生成
- LLGuidance 是 Guidance 的 Rust 核心，被 vLLM 和 OpenAI 采用作为约束后端
- 资源占用极低，适合边缘设备和单机部署

**适合**：单机 / 边缘设备部署、需要极细粒度控制生成过程

::panel
### 选型决策：什么场景用什么框架
场景 1：已有 vLLM/SGLang 部署，需要加 FC

直接使用推理引擎内置的 Tool Calling 功能。vLLM 通过 `--tool-call-parser` 参数指定模型对应的解析器（如 `hermes`、`llama`、`qwen3`），即可在 OpenAI 兼容 API 上使用 `tools` 参数。SGLang 类似。**无需额外安装任何库**。

场景 2：需要保证参数输出 100% 合规（等效 Strict Mode）

在 vLLM 中启用 Structured Outputs：`{"structured_outputs": {"json": your_schema}}`。后端默认用 xgrammar，也可切换为 guidance 或 outlines。这等效于商业 API 的 Strict Mode——在解码阶段约束输出。SGLang 同样支持。

场景 3：用多种模型/多种推理引擎，需要统一约束层

用 Outlines 作为独立约束层。它不绑定推理引擎——可以包装 transformers、vLLM、Ollama、甚至 OpenAI API。同一套 Pydantic Schema 定义在所有模型上通用。代价是多了一层抽象，性能比引擎内置略低。

场景 4：本地单机 / 边缘设备

llama.cpp + GBNF Grammar。llama.cpp 的 `--grammar-file` 参数直接加载 JSON Schema 对应的 GBNF，资源占用极低。如果需要更复杂的控制流（比如在生成中间插入校验逻辑），加上 Guidance。

关键判断标准

**已有推理引擎** → 用引擎内置能力（vLLM / SGLang），零额外集成成本。**多引擎统一** → Outlines 作为抽象层。**极致轻量** → llama.cpp。**不要**在已用 vLLM 的项目上再单独引入 Outlines——vLLM 的 Structured Outputs 后端已内置 outlines 支持，重复引入只增加复杂度。
:::

## #case-study 06 / Case Studies :: 三个真实场景的架构分析

前面的技巧和框架需要放到具体场景中才有意义。下面用三个逐步升级的案例，展示 Function Calling 从简单到复杂的架构演进，以及每种架构的适用条件和局限。

:::accordion
::panel
### 案例 A：单工具天气查询（最简 FC）
案例 A

场景

用户问天气 → 模型调一个 `get_weather(city)` → 应用执行 API → 结果传回模型 → 模型生成自然语言回复。整个对话只需两轮 API 调用。

架构特征

1 个工具、无状态、单轮调用。`tool_choice: auto`。不需要重试逻辑——API 失败直接告诉用户。这是 Function Calling 的最简形态，适合做 PoC 和理解基本流程。

局限

用户稍微复杂一点的请求（"北京和上海哪个更热"）就需要并行调用；更复杂的请求（"如果明天下雨就帮我取消出行计划"）需要链式调用 + 条件判断。单工具架构无法处理这些场景。

::panel
### 案例 B：电商客服（多工具 + 路由 + 错误恢复）
案例 B

场景

电商客服系统，用户可能问订单状态、申请退货、查物流、改地址、查优惠券。涉及 20-30 个工具，跨多个后端系统（订单系统、物流系统、会员系统）。

架构设计

**工具路由层**：根据对话意图分类（订单/物流/会员），每次只注入对应领域的 5-8 个工具。用 System Prompt 告诉模型当前在哪个领域。如果用户话题切换，在应用层检测并切换工具集。

**错误恢复层**：所有函数执行结果（含错误）都传回模型。设置 2 次参数级重试上限。write 类函数（退款、取消）走用户确认流程。

**上下文管理**：order_id 等已知参数从对话上下文自动注入，不让模型填。返回值做 field projection——订单详情 API 返回 50 个字段，只传 5 个给模型（订单号、状态、金额、日期、物流单号）。

成本分析

Anthropic 数据显示，每启用一个工具就增加 264-530 个基础 token。[[3]](https://platform.claude.com/docs/en/docs/build-with-claude/tool-use/overview) 如果把全部 30 个工具一次性注入，光是工具定义就要消耗 6000-15000 token（取决于描述长度），约占 GPT-4.1 128K context 的 5-12%。分组后每次只加载 5-8 个，降到 1000-2400 token。这不只是省钱——更少的工具定义意味着更少的干扰，模型做选择时信噪比更高。

::panel
### 案例 C：Power Platform Skills 的多 Agent 编排
案例 C

项目背景

微软开源的 [power-platform-skills](https://github.com/microsoft/power-platform-skills) 是一个面向 Claude Code 和 GitHub Copilot CLI 的插件系统，用于自动化 Power Platform 的开发流程（创建网站、部署、配置数据模型、认证）。整个系统有 26+ 个 Skill（工具），涉及文件操作、CLI 命令执行、API 调用、浏览器自动化等多种能力。如果把 26 个工具一次性给一个 Agent，准确率和可靠性都会有问题。

他们怎么解决的：四层架构

Power Platform Skills 没有把 26 个工具交给一个 Agent，而是设计了四层架构：

关键设计决策分析

**只读 Agent 模式**：Data Model Architect、Table Permissions、Web API Settings 三个 Agent 被刻意设计为只读型——它们只负责分析现有代码和数据，生成 Mermaid 图与 YAML 配置提案，*绝不*直接创建或修改任何资源；所有变更必须经用户审批后交由主 Skill 执行。这种设计与"人工确认门控"一脉相承，而且隔离得更彻底：直接在 Agent 角色层将"分析者"与"执行者"拆开。[[6]](https://github.com/microsoft/power-platform-skills/blob/main/plugins/power-pages/README.md)

跟案例 B 的对比

案例 B（电商客服）在应用层做工具路由——一个 Agent 配不同的工具子集。案例 C 更进一步——用**多个专职 Agent** 来分治，每个 Agent 只看到自己领域的工具和 Persona。好处是单个 Agent 的认知负担极低（canvas-screen-builder 只需要写 YAML，不需要理解数据模型和权限）。代价是架构复杂度上升——你需要管理 Agent 间的调度、状态传递和错误处理。

::panel
### 三种架构的选型决策表
**单 Agent + 少工具**

- 工具数：1-10 个
- 适用：PoC、单一领域助手
- 复杂度：低
- 要求：只需做好 Schema
- 案例：天气查询、简单 CRM 助手

**单 Agent + 工具路由**

- 工具数：10-40 个
- 适用：跨领域客服、内部工具集合
- 复杂度：中
- 要求：意图分类 + 工具分组 + 错误恢复
- 案例：电商客服、IT Helpdesk

**多 Agent 编排**

- 工具数：40+ 个
- 适用：多系统集成、长流程自动化
- 复杂度：高
- 要求：Agent 调度 + 状态管理 + 审批流
- 案例：Power Platform Skills、IDE 插件
:::

## #eval-monitor 07 / Evaluation & Monitoring :: 评测与监控：用数据驱动优化

上面的优化技巧到底有没有用？你需要量化指标来衡量。OpenAI 给出的生产化建议是：先拿 20+ 个标注好的测试用例跑出基线，再逐项优化并对比。[[7]](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)

:::accordion
::panel
### 你应该追踪的 6 个指标
工具选择准确率

——给定用户请求，模型选对了函数吗？包括四种失败：选错函数、不该调时调了、该调时没调、调了不存在的函数

参数准确率

——选对函数后，参数值对不对？开 Strict Mode 后格式错误降为 0%，但值的正确性仍需评测（比如城市名拼对没有）

端到端成功率

——从用户提问到最终正确回复的完整成功率。这才是业务关心的数字

平均调用轮次

——完成一个任务需要几轮 function_call？1 轮是理想的，超过 3 轮说明 Schema 或 Prompt 有优化空间

自我纠正率

——模型收到错误反馈后成功修正的比例。高纠正率说明你的错误反馈格式有效

Token 消耗

——每次成功调用的 input + output token。工具定义的 token 占比不应超过总 input 的 40%

::panel
### 如何构建评测集
Step 1：收集真实对话

从生产日志中收集至少 50 条真实的用户请求 + 模型的 function_call 响应。不要自己编——你编的测试用例会带有偏见，只覆盖"你想到的"场景。

Step 2：人工标注 Ground Truth

对每条请求标注：(1) 应该调哪个函数（或不应该调函数），(2) 参数应该是什么。重点标注边界情况——"帮我查一下那个之前买的东西"（模糊请求）、"退货同时查一下物流"（多意图）。

Step 3：自动化评估

对比模型输出与 Ground Truth，按"工具名正确 + 参数正确 = 通过"的口径计算准确率。BFCL V4（Berkeley Function Calling Leaderboard）定义了标准化的测试集格式与评测基准，覆盖 Simple / Parallel / Multiple / Agentic / Multi-Turn / Hallucination 六个维度。[[4]](https://gorilla.cs.berkeley.edu/leaderboard.html)

Step 4：针对性优化

如果某个函数持续被选错 → 改 description。如果参数格式经常出错 → 开 Strict Mode。如果特定领域准确率偏低 → OpenAI 支持针对 Function Calling 微调（Fine-Tuning），可通过构造 (prompt, correct_function_call) 训练对定向拉升特定场景的调用准确率。[[1]](https://developers.openai.com/api/docs/guides/function-calling)
:::

## #references 08 / References :: 参考来源

- [1] OpenAI. — https://developers.openai.com/api/docs/guides/function-calling | Best practices 原文：实习生测试法、Strict Mode、Namespace、Tool Search、parallel_tool_calls 控制。
- [2] Google. — https://ai.google.dev/gemini-api/docs/function-calling | Best practices 原文：Compositional Function Calling、function calling modes、Thinking Model Signatures、enum 提升准确率。
- [3] Anthropic. — https://platform.claude.com/docs/en/docs/build-with-claude/tool-use/overview | 工具启用的 token 成本量化数据（264-530 token/模型）和 Strict Tool Use 规范。
- [4] BFCL Team. — https://gorilla.cs.berkeley.edu/leaderboard.html | 109 个模型在 Simple / Parallel / Multiple / Agentic / Multi-Turn / Hallucination 六维度的评测基准。
- [5] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/canvas-apps/AGENTS.md | Canvas Apps 四个 Agent 的分工：planner（只读规划） → screen-builder（并行写 YAML） → compile_canvas（统一验证）。
- [6] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/power-pages/README.md | 只读 Agent 模式的实例：Data Model Architect、Table Permissions、Web API Settings 三个 Agent 只分析提议不修改资源。
- [7] OpenAI. — https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy | LLM 准确率优化的系统方法论：prompt engineering → evaluation → RAG → fine-tuning 的迭代框架。

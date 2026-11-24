---
title: "MCP 原理与开发指南：协议解剖与 TypeScript 落地实操 || MCP Principles and Development Guide: Protocol Anatomy and TypeScript Delivery"
eyebrow: Model Context Protocol
brand: "Function Calling & Agentic"
date: 2026-07-01
strict_i18n: false
strict_density: true
lead: "Model Context Protocol（MCP）是一套开放协议，用统一的 JSON-RPC 通道把 LLM 应用与外部数据、工具、工作流连接起来。本指南面向架构师与技术决策者，先剖析参与方、原语、生命周期与传输四层协议机制，再用 TypeScript 完整演示从零构建可运行的 MCP server，最后给出安全加固要求与选型判据。 || The Model Context Protocol (MCP) is an open protocol that connects LLM applications to external data, tools, and workflows over one JSON-RPC channel. Written for architects and technical decision-makers, this guide dissects participants, primitives, lifecycle, and transports. It then builds a running MCP server from scratch in TypeScript and closes with security hardening and adoption criteria."
hero_actions:
  - "从架构看起 || Start with Architecture | #architecture"
  - "直接上手开发 || Jump to the Build | #build-server"
panel_label: "核心主张 || Core Thesis"
panel_title: "MCP 用一套 JSON-RPC 协议，把「模型 × 工具」的集成从 M×N 收敛为 M+N，并划定清晰的安全边界。 || MCP uses one JSON-RPC protocol to collapse model-to-tool integration from M×N to M+N, with explicit security boundaries."
panel:
  - "读完能解释 Host / Client / Server 各自的职责与信任边界。 || You can explain the responsibilities and trust boundaries of Host, Client, and Server."
  - "能说清六个原语与能力协商如何决定一次会话能做什么。 || You can articulate how the six primitives and capability negotiation define what a session can do."
  - "能用 TypeScript 从零构建并运行一个 MCP server。 || You can build and run an MCP server from scratch in TypeScript."
  - "能判断某场景该用 MCP、还是直接 function calling 或私有 API。 || You can judge whether a scenario calls for MCP, plain function calling, or a private API."
metrics:
  - "协议基座 || Protocol Base | JSON-RPC 2.0 | 有状态会话 + 能力协商 || Stateful sessions + capability negotiation"
  - "参与方 || Participants | 3 类 || 3 roles | Host · Client · Server（Client 与 Server 一对一） || Host · Client · Server (Client-to-Server is 1:1)"
  - "原语 || Primitives | 3 + 3 | 服务器 Tools·Resources·Prompts / 客户端 Sampling·Roots·Elicitation || Server Tools·Resources·Prompts / Client Sampling·Roots·Elicitation"
  - "标准传输 || Standard Transports | 2 种 || 2 kinds | stdio · Streamable HTTP（当前修订 2025-11-25） || stdio · Streamable HTTP (current revision 2025-11-25)"
style:
  accent: "#4f46e5"
---

## #why 01 / Why It Exists :: 为什么需要 MCP：把 M×N 集成收敛为 M+N || Why MCP Exists: Collapsing M×N Integrations into M+N

每个 AI 应用要接每个工具时，若各写各的胶水层，M 个应用 × N 个工具就是 M×N 套私有集成。MCP 借鉴 Language Server Protocol（LSP）的思路，把这层协议标准化：工具只实现一次 server，应用只实现一次 client，集成成本降为 M+N。官方把它类比为「AI 应用的 USB-C 接口」。 || When every AI application wires up every tool with bespoke glue, M applications times N tools means M×N private integrations. Borrowing from the Language Server Protocol (LSP), MCP standardizes this layer: a tool implements a server once, an application implements a client once, and integration cost drops to M+N. The official analogy calls it a USB-C port for AI applications.

:::accordion
::panel { open: true }
### 1.1 集成问题：从私有胶水到共享协议 || 1.1 The Integration Problem: From Private Glue to a Shared Protocol
MCP 解决的是「重复集成」而非「模型能力」。同一份工具接入代码，过去要为每个宿主重写一遍；有了协议约定，一次实现即可被所有兼容宿主复用。 || MCP addresses duplicated integration, not model capability. The same tool-integration code that used to be rewritten for every host can, under a shared protocol, be implemented once and reused by every compatible host.

无协议 · M×N || No Protocol · M×N

**每个应用为每个工具单独适配 || Each App Adapts to Each Tool Separately**

- 工具方要为不同宿主分别维护接入逻辑与鉴权。 || Tool authors maintain separate integration and auth logic per host.
- 应用方每接一个新工具，都要理解一套新接口。 || Each new tool forces the application to learn yet another interface.
- 接口无版本约定，任一端升级都可能打断对方。 || With no versioning contract, either side's upgrade can break the other.

有协议 · M+N || With Protocol · M+N

**工具实现一次 server，应用实现一次 client || A Tool Ships One Server, an App Ships One Client**

- 任意 MCP 兼容宿主都能发现并调用同一个 server。 || Any MCP-compatible host can discover and call the same server.
- 能力通过协商声明，双方只使用彼此支持的功能。 || Capabilities are declared via negotiation; each side uses only what the other supports.
- 版本以日期串标识，向后兼容变更不打断既有会话。 || Versions are date-stamped; backward-compatible changes do not break existing sessions.

::panel
### 1.2 三类受益者 || 1.2 Three Groups That Benefit
从生态位置看，MCP 对三类角色各有收益，构成它被广泛采纳的动力。 || Viewed by ecosystem position, MCP yields distinct benefits for three roles - the force behind its broad adoption.

- **开发者 || Developers** — 构建或接入 AI 应用时，减少集成的开发时间与复杂度——一次实现，处处可用。 || Building or integrating an AI application takes less development time and complexity - build once, integrate everywhere.
- **AI 应用与智能体 || AI Apps and Agents** — 即时接入一整套数据源、工具与工作流生态，扩展模型能力、改善端到端体验。 || Gain immediate access to an ecosystem of data sources, tools, and workflows that extend model capability and improve the end-to-end experience.
- **最终用户 || End Users** — 获得更有能力的助手：在获得授权时，能访问自己的数据并代为执行操作。 || Get more capable assistants that, once authorized, can access their data and act on their behalf.

::panel
### 1.3 与 Function Calling 的关系 || 1.3 Relationship to Function Calling
MCP 并不替代 function calling，而是在其外围提供标准化的传输与发现层：function calling 决定「模型如何表达要调用某个工具」，MCP 决定「工具如何被发现、连接、鉴权与复用」。 || MCP does not replace function calling; it provides the standardized transport and discovery layer around it. Function calling governs how a model expresses a tool call; MCP governs how tools are discovered, connected, authorized, and reused.

- **互补关系** — 宿主把 MCP server 暴露的 tools 转成模型的 function/tool 声明；模型仍用 function calling 决定调用哪个、传什么参数。 || **Complementary** - The host turns tools exposed by an MCP server into the model's function/tool declarations; the model still uses function calling to decide which to call and with what arguments.
- **MCP 多做的事** — 连接生命周期、能力协商、资源与提示原语、双向请求（sampling）、传输与会话管理，这些都超出裸 function calling 的范畴。 || **What MCP adds** - Connection lifecycle, capability negotiation, the resource and prompt primitives, bidirectional requests (sampling), and transport and session management - all beyond bare function calling.
- **选择判据** — 单一应用内的少量工具，直接 function calling 更轻；要把工具做成可跨宿主复用的产品，MCP 更合适。 || **Decision cue** - For a few tools inside a single app, bare function calling is lighter; to ship tools as a cross-host reusable product, MCP fits better.
:::

## #architecture 02 / Architecture :: 架构总览：Host / Client / Server 三参与方 || Architecture Overview: The Host / Client / Server Model

MCP 采用 client-host-server 架构：一个 host 进程可运行多个 client，每个 client 与一个 server 维持一对一的有状态会话。架构建立在 JSON-RPC 2.0 之上，专注于上下文交换与 sampling 协调，同时用 host 隔离各 server、维护安全边界。 || MCP follows a client-host-server architecture: one host process can run multiple clients, and each client maintains a 1:1 stateful session with one server. Built on JSON-RPC 2.0, it focuses on context exchange and sampling coordination while the host isolates servers and maintains security boundaries.

:::accordion
::panel { open: true }
### 2.1 架构全景图：开发时你要建什么 || 2.1 Architecture Panorama: What You Build
这张全景图把 MCP 的运行拓扑与「开发责任」叠在一起：分三层看谁在跑、谁提供、你要写哪一层。 || This panorama overlays MCP's runtime topology with development responsibility: three layers showing who runs, who provides, and which layer you write.

宿主进程 Application Host Process || Application Host Process

宿主提供 || Host-provided

Host

LLM 应用 · 协调与授权 || LLM app · orchestration and consent

Client 1

一对一连一个 Server || 1:1 with one server

Client 2

一对一连一个 Server || 1:1 with one server

Client 3

一对一连一个 Server || 1:1 with one server

宿主是 Claude、VS Code、ChatGPT 等现成产品；除非你在做自己的宿主，这一层不用你写。 || Hosts are ready-made products such as Claude, VS Code, and ChatGPT; unless you are building your own host, you do not write this layer.

传输：stdio / Streamable HTTP · JSON-RPC 2.0 · 生命周期握手 || Transport: stdio / Streamable HTTP · JSON-RPC 2.0 · lifecycle handshake

SDK 提供 || SDK-provided

MCP Server（开发主体） || MCP Server (Your Main Build)

你实现 || You build

Tools

模型可调用的函数处理器 || Model-callable function handlers

Resources

只读上下文数据 provider || Read-only context providers

Prompts

模板化工作流 || Templated workflows

开发主要落在这一层：为上面三种原语写处理器、声明 capabilities、选择传输（stdio 或 Streamable HTTP），其余协议细节由 SDK 兜底。 || Development mostly lands here: write handlers for the three primitives above, declare capabilities, and pick a transport (stdio or Streamable HTTP); the SDK covers the rest of the protocol.

后端系统 Backing Systems || Backing Systems

你接入 || You connect

本地文件 / Git || Local files / Git

数据库 || Databases

外部 API || External APIs

Server 内部调用你真实的数据与服务；MCP 不规定后端形态，可本地也可远程。 || Inside the server you call your real data and services; MCP does not prescribe the backend - local or remote.

::panel
### 2.2 三个参与方的职责 || 2.2 What Each Participant Does
三者职责边界清晰：host 是容器与协调者，client 是隔离的连接器，server 是聚焦的能力提供者。 || The three roles have clean boundaries: the host is the container and coordinator, the client is an isolated connector, and the server is a focused capability provider.

- **Host（宿主） || Host** — 发起连接的 LLM 应用。创建并管理多个 client，控制连接权限与生命周期，执行安全策略与用户授权，协调 LLM 与 sampling，并跨 client 聚合上下文。 || The LLM application that initiates connections. It creates and manages clients, controls connection permissions and lifecycle, enforces security policy and user authorization, coordinates the LLM and sampling, and aggregates context across clients.
- **Client（客户端） || Client** — 由 host 创建、与单个 server 保持一对一会话的连接器。负责协议协商与能力交换，双向路由消息，管理订阅与通知，并维护各 server 之间的安全隔离。 || A connector created by the host that keeps a 1:1 session with a single server. It handles protocol negotiation and capability exchange, routes messages bidirectionally, manages subscriptions and notifications, and preserves isolation between servers.
- **Server（服务器） || Server** — 提供专门上下文与能力的服务。通过原语暴露 resources、tools、prompts，职责聚焦、独立运行；可发起 sampling 请求；必须遵守安全约束。可以是本地进程或远程服务。 || A service that provides specialized context and capabilities. It exposes resources, tools, and prompts via primitives, operates independently with focused responsibilities, may request sampling, and must respect security constraints. It can be a local process or a remote service.

::panel
### 2.3 一次工具调用的消息路径 || 2.3 The Message Path of a Tool Call
一次典型的工具调用是「用户/模型意图 → client 请求 → server 执行 → 结果回到宿主与模型」的闭环。 || A typical tool call is a loop: user/model intent to a client request, server execution, and results back to the host and model.

1. **宿主发起动作 || Host initiates an action** — 用户或模型触发一个需要工具的动作；host 让对应的 client 准备一次请求。 || A user or model triggers an action that needs a tool; the host asks the relevant client to prepare a request.
2. **Client 向 Server 请求 || Client requests the server** — client 用 JSON-RPC 发送 tools/call 等请求；请求只携带该 server 所需的最小上下文。 || The client sends a JSON-RPC request such as tools/call, carrying only the minimal context that server needs.
3. **Server 执行并返回 || Server executes and responds** — server 执行工具逻辑，返回结构化结果（如文本、图片等 content 数组）。 || The server runs the tool logic and returns a structured result, such as a content array of text or images.
4. **宿主更新模型上下文 || Host updates the model context** — client 把结果回传 host；host 更新 UI 或把结果并入模型上下文，进入下一步推理。 || The client returns the result to the host; the host updates the UI or folds the result into the model context for the next reasoning step.

::panel
### 2.4 四条设计原则 || 2.4 Four Design Principles
协议的取舍围绕四条设计原则展开，它们直接解释了为什么 server 被设计得如此轻量、隔离。 || The protocol's trade-offs follow four design principles that explain why servers are deliberately lightweight and isolated.

- **Server 极易构建** — 复杂的编排责任由 host 承担，server 只聚焦定义清晰的能力，接口简单，实现负担低。 || **Servers are easy to build** - The host carries the complex orchestration; servers focus on well-defined capabilities with simple interfaces and low implementation overhead.
- **Server 高度可组合** — 每个 server 独立提供聚焦功能，多个 server 可无缝组合，共享协议保证互操作。 || **Servers are highly composable** - Each provides focused functionality in isolation; many servers combine seamlessly, and the shared protocol guarantees interoperability.
- **Server 受隔离约束** — server 读不到完整对话，也「看不进」其它 server；完整会话历史留在 host，跨 server 交互由 host 管控。 || **Servers are isolated** - A server cannot read the full conversation or see into other servers; the complete history stays with the host, which controls cross-server interaction.
- **能力渐进增加** — 核心协议只保留最小功能，额外能力按需协商；client 与 server 各自独立演进，保持向后兼容。 || **Capabilities grow progressively** - The core keeps a minimal feature set and negotiates extras as needed; clients and servers evolve independently while staying backward-compatible.
:::

## #primitives 03 / Primitives :: 协议原语：六个原语与控制权归属 || Protocol Primitives: Six Primitives and Where Control Lives

MCP 的功能由原语承载：server 向 client 提供 Tools、Resources、Prompts；client 向 server 提供 Sampling、Roots、Elicitation。理解每个原语「由谁提供、由谁控制」，是判断一次会话能做什么、以及安全边界在哪的关键。 || MCP's features are carried by primitives: servers offer Tools, Resources, and Prompts to clients; clients offer Sampling, Roots, and Elicitation to servers. Knowing who provides and who controls each primitive is the key to what a session can do and where the security boundary sits.

:::accordion
::panel { open: true }
### 3.1 六原语总览 || 3.1 The Six Primitives at a Glance
下表给出六个原语的提供方、控制方与作用；控制方决定了谁能触发它、需要谁同意。 || The table lists each primitive's provider, controller, and purpose; the controller determines who can trigger it and whose consent it needs.

| 原语 || Primitive | 提供方 || Provided By | 控制方 || Controlled By | 作用 || Purpose |
| --- | --- | --- | --- |
| **Tools** | Server | 模型 || Model | 可被模型调用的函数，用于执行动作或获取数据（需用户授权）。 || Functions the model can invoke to act or fetch data (with user approval). |
| **Resources** | Server | 宿主应用 || Application | 类文件的只读上下文数据，由宿主决定何时注入模型。 || File-like, read-only context data the host decides when to inject. |
| **Prompts** | Server | 用户 || User | 预置的模板化消息与工作流，由用户显式选择触发。 || Templated messages and workflows the user explicitly selects. |
| **Sampling** | Client | Server 发起 || Server-initiated | 让 server 借用宿主的 LLM 完成子任务（每次需用户批准）。 || Lets a server borrow the host's LLM for a subtask (each requires user approval). |
| **Roots** | Client | Server 发起 || Server-initiated | 向 server 声明其可操作的文件系统或 URI 边界。 || Declares the filesystem or URI boundaries a server may operate in. |
| **Elicitation** | Client | Server 发起 || Server-initiated | 运行时向用户请求补充的结构化输入（2025-06-18 修订引入）。 || Requests additional structured input from the user at runtime (added in the 2025-06-18 revision). |

::panel
### 3.2 Server 原语：Tools / Resources / Prompts || 3.2 Server Primitives: Tools / Resources / Prompts
Server 侧的三个原语覆盖「能做什么、能读什么、按什么模板做」，是 MCP 最常用的部分。 || The three server-side primitives cover what can be done, what can be read, and by which template - the most-used part of MCP.

- **Tools（工具） || Tools** — 模型可执行的函数，带 JSON Schema 描述的输入。是产生副作用（下单、写库、调用 API）的入口，宿主在调用前应取得用户同意。 || Functions the model can execute, with JSON Schema-typed inputs. They are the entry point for side effects (ordering, writing, calling APIs); the host should obtain user consent before invoking.
- **Resources（资源） || Resources** — 由 URI 标识的只读数据（文件、API 响应、数据库行）。宿主决定何时把哪些资源纳入上下文，可订阅变更通知。 || Read-only data identified by URI (files, API responses, database rows). The host decides when to bring which resources into context and can subscribe to change notifications.
- **Prompts（提示） || Prompts** — 服务器预置的参数化提示模板与工作流，通常呈现为用户可选的斜杠命令或菜单项，由用户显式触发。 || Parameterized prompt templates and workflows the server ships, usually surfaced as user-selectable slash commands or menu items, triggered explicitly by the user.

::panel
### 3.3 Client 原语：Sampling / Roots / Elicitation || 3.3 Client Primitives: Sampling / Roots / Elicitation
Client 侧原语让 server 能反向请求宿主的能力，把简单的「工具服务器」升级为可参与推理的协作方。 || Client-side primitives let a server call back into the host, upgrading a simple tool server into a collaborator that can take part in reasoning.

- **Sampling（借用推理） || Sampling** — server 请求宿主用其 LLM 生成一段补全，实现 server 侧的智能子步骤。协议刻意限制 server 对提示的可见性，每次调用需用户批准。 || A server asks the host to produce a completion with its LLM, enabling intelligent sub-steps on the server side. The protocol deliberately limits the server's visibility into prompts, and each call needs user approval.
- **Roots（根边界） || Roots** — client 向 server 声明一组文件系统或 URI 根，界定 server 允许操作的范围，是本地文件类 server 的作用域约束。 || The client declares a set of filesystem or URI roots to the server, bounding where the server may operate - the scope constraint for filesystem-style servers.
- **Elicitation（信息征询） || Elicitation** — server 运行中向用户请求补充信息（如确认参数、填一个字段），由 client 呈现表单并回传，2025-06-18 修订引入。 || Mid-run, a server requests additional information from the user (confirming a parameter, filling a field); the client renders a form and returns the input. Added in the 2025-06-18 revision.

::panel
### 3.4 控制权模型：谁触发、谁同意 || 3.4 The Control Model: Who Triggers, Who Consents
MCP 用「控制权归属」把三类 server 原语区分开，这直接决定 UI 应把哪种操作交给谁决定。 || MCP separates the three server primitives by who controls them, which directly decides who the UI should let make each kind of decision.

- **模型控制（Tools）** — 由模型在推理中决定是否调用；因为可能产生副作用，宿主应在执行前插入用户确认。 || **Model-controlled (Tools)** - The model decides whether to call during reasoning; because side effects are possible, the host should insert user confirmation before execution.
- **应用控制（Resources）** — 由宿主应用决定何时、把哪些资源注入上下文；模型不能自行拉取任意资源。 || **Application-controlled (Resources)** - The host application decides when and which resources enter context; the model cannot pull arbitrary resources on its own.
- **用户控制（Prompts）** — 由用户显式选择模板化工作流；适合把「组织沉淀的标准流程」暴露为可复用命令。 || **User-controlled (Prompts)** - The user explicitly selects a templated workflow; ideal for exposing an organization's standard procedures as reusable commands.
:::

## #lifecycle 04 / Lifecycle :: 会话生命周期：初始化、能力协商与关闭 || Session Lifecycle: Initialization, Capability Negotiation, and Shutdown

MCP 会话有严格的三阶段生命周期：初始化（版本与能力协商）、运行（按协商结果交换消息）、关闭（在传输层优雅终止）。理解握手顺序，是排查「连不上、能力缺失、超时」类问题的前提。 || An MCP session has a strict three-phase lifecycle: initialization (version and capability negotiation), operation (messages exchanged per the negotiated result), and shutdown (graceful termination at the transport layer). Understanding the handshake is the prerequisite for debugging connection, missing-capability, and timeout issues.

:::accordion
::panel { open: true }
### 4.1 初始化握手 || 4.1 The Initialization Handshake
初始化必须是第一次交互：client 发 initialize，server 回自身能力，client 再发 initialized 通知，之后才进入正常操作。 || Initialization must be the first interaction: the client sends initialize, the server replies with its capabilities, the client sends an initialized notification, and only then does normal operation begin.

1. **Client → Server：initialize || Client to Server: initialize** — 携带支持的协议版本、client 能力（roots / sampling / elicitation）与客户端信息。 || Carries the supported protocol version, client capabilities (roots / sampling / elicitation), and client info.
2. **Server → Client：能力响应 || Server to Client: capability response** — 回同一或自身支持的版本，声明 server 能力（prompts / resources / tools / logging 等）与可选 instructions。 || Replies with the same or its own supported version, declaring server capabilities (prompts / resources / tools / logging) and optional instructions.
3. **Client → Server：initialized 通知 || Client to Server: initialized notification** — client 发 notifications/initialized 表示就绪；此前双方除 ping / logging 外不应发其它请求。 || The client sends notifications/initialized to signal readiness; before this, neither side should send requests other than ping / logging.
4. **进入运行阶段 || Enter the operation phase** — 双方只使用协商成功的能力，按协商版本交换 tools/list、tools/call、resources/read 等消息。 || Both sides use only successfully negotiated capabilities and exchange tools/list, tools/call, resources/read, and other messages at the negotiated version.

initialize 请求（JSON-RPC 2.0） || initialize request (JSON-RPC 2.0)

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {},
      "elicitation": {}
    },
    "clientInfo": { "name": "ExampleClient", "version": "1.0.0" }
  }
}

// 就绪后 / after ready:
{ "jsonrpc": "2.0", "method": "notifications/initialized" }
```

::panel
### 4.2 版本协商 || 4.2 Version Negotiation
MCP 用 YYYY-MM-DD 日期串标识版本，只在发生不向后兼容变更时才推进；当前修订为 2025-11-25。 || MCP identifies versions with a YYYY-MM-DD date string and advances only on backward-incompatible changes; the current revision is 2025-11-25.

- **协商规则** — client 发它支持的最新版本；server 支持则原样返回，否则返回自身支持的（通常是最新）版本；client 不支持则应断开。 || **Negotiation rule** - The client sends its latest supported version; if the server supports it, it echoes it back, otherwise it returns its own (usually latest) version; if the client cannot support that, it should disconnect.
- **HTTP 头** — 走 HTTP 时，后续每个请求必须带 MCP-Protocol-Version 头（例：MCP-Protocol-Version: 2025-11-25）；缺失时 server 按 2025-03-26 处理。 || **HTTP header** - Over HTTP, every subsequent request must carry the MCP-Protocol-Version header (e.g., MCP-Protocol-Version: 2025-11-25); if absent, the server assumes 2025-03-26.
- **错误形态** — 版本不受支持时返回 JSON-RPC 错误（如 code -32602），data 中列出 supported 与 requested，便于客户端降级。 || **Error shape** - An unsupported version returns a JSON-RPC error (such as code -32602) whose data lists supported and requested, helping the client fall back.

::panel
### 4.3 能力协商 || 4.3 Capability Negotiation
能力协商决定这次会话有哪些功能可用：某功能未在初始化时声明，整场会话就不能使用它。 || Capability negotiation decides which features are available for the session: a feature not declared at initialization cannot be used for the whole session.

- **Server 声明** — prompts、resources、tools、logging、completions 等；子能力如 listChanged（列表变更通知）与 subscribe（仅 resources 支持单项订阅）。 || **Servers declare** - prompts, resources, tools, logging, completions; sub-capabilities such as listChanged (list-change notifications) and subscribe (per-item subscriptions, resources only).
- **Client 声明** — roots、sampling、elicitation，以及 experimental（非标准实验特性）。 || **Clients declare** - roots, sampling, elicitation, and experimental (non-standard experimental features).
- **使用约束** — 触发 resources 订阅通知要求 server 声明了 subscribe；调用 tools 要求声明了 tools 能力；发起 sampling 要求 client 声明了 sampling。 || **Usage constraints** - Emitting resource-subscription notifications requires the server to declare subscribe; invoking tools requires the tools capability; requesting sampling requires the client to declare sampling.

::panel
### 4.4 关闭与超时 || 4.4 Shutdown and Timeouts
MCP 不定义专门的关闭消息，关闭信号由底层传输直接触发；超时与取消则由实现方按请求管理。 || MCP defines no dedicated shutdown message; the underlying transport triggers termination directly, while timeouts and cancellation are managed per request by the implementation.

- **stdio 关闭** — client 先关闭子进程的输入流，等待退出；超时后发 SIGTERM，仍不退再发 SIGKILL。server 也可关闭自身输出流并退出。 || **stdio shutdown** - The client first closes the child process's input stream and waits for exit; on timeout it sends SIGTERM, then SIGKILL if it still will not exit. The server may also close its output stream and exit.
- **HTTP 关闭** — 直接关闭相关 HTTP 连接即视为关闭；带会话时可用 DELETE 显式终止会话。 || **HTTP shutdown** - Closing the associated HTTP connection(s) signals shutdown; with a session, a DELETE can explicitly terminate it.
- **超时** — 每个请求都应设超时，超时应发取消通知并停止等待；收到进度通知可重置计时，但必须设一个最大上限，防止被拖住。 || **Timeouts** - Every request should have a timeout; on timeout, send a cancellation notification and stop waiting. A progress notification may reset the clock, but a hard maximum must be enforced to avoid being stalled.
:::

## #transports 05 / Transports :: 传输层选型：stdio 与 Streamable HTTP || Transport Selection: stdio and Streamable HTTP

MCP 消息一律用 JSON-RPC 编码（UTF-8），协议定义两种标准传输：stdio 与 Streamable HTTP；官方建议客户端尽可能支持 stdio。协议本身与传输无关，也允许自定义传输。选传输，本质是在「本地进程」与「远程多客户端服务」之间做部署决策。 || MCP messages are always JSON-RPC encoded (UTF-8), and the protocol defines two standard transports: stdio and Streamable HTTP; clients are advised to support stdio whenever possible. The protocol is transport-agnostic and permits custom transports. Choosing a transport is essentially a deployment decision between a local process and a remote multi-client service.

:::accordion
::panel { open: true }
### 5.1 两种传输总览 || 5.1 The Two Transports at a Glance
先做取舍再看细节：本地、单宿主用 stdio；远程、多客户端、需托管用 Streamable HTTP。 || Decide the trade-off before the details: use stdio for local, single-host; use Streamable HTTP for remote, multi-client, hosted.

stdio · 本地首选 || stdio · Local First

**以子进程方式在标准输入输出上通信 || Communicate over stdin/stdout as a Subprocess**

- client 把 server 作为子进程启动，双方用换行分隔的 JSON-RPC 消息通信。 || The client launches the server as a subprocess; both exchange newline-delimited JSON-RPC messages.
- 适合本地工具、桌面宿主、开发调试；无网络暴露面，延迟低。 || Fits local tools, desktop hosts, and development; no network exposure, low latency.
- stdout 只能写合法 MCP 消息，日志走 stderr。 || stdout may carry only valid MCP messages; logs go to stderr.

Streamable HTTP · 远程/托管 || Streamable HTTP · Remote/Hosted

**独立进程，单端点承载 POST 与 GET || An Independent Process on One POST/GET Endpoint**

- server 是独立进程，提供单个 MCP 端点，可选用 SSE 流式推送多条服务器消息。 || The server is an independent process exposing a single MCP endpoint, optionally using SSE to stream multiple server messages.
- 适合远程服务、多客户端并发、需要托管与横向扩展的场景。 || Fits remote services, concurrent multi-client access, and hosted or horizontally scaled deployments.
- 取代 2024-11-05 的旧版 HTTP+SSE 传输，向后兼容可并存。 || Replaces the older HTTP+SSE transport from 2024-11-05, with backward-compatible coexistence.

::panel
### 5.2 stdio 细节 || 5.2 stdio Details
stdio 的可靠性完全建立在「stdout 是协议专线」这条纪律上，违反它是新手最常见的破坏方式。 || stdio's reliability rests entirely on one discipline - stdout is the protocol's dedicated line - and violating it is the most common way beginners break a server.

- **消息格式** — 每条消息是单个 JSON-RPC 请求/通知/响应，以换行分隔，且不得含内嵌换行。 || **Message format** - Each message is a single JSON-RPC request/notification/response, newline-delimited, with no embedded newlines.
- **通道纪律** — server 不得向 stdout 写任何非 MCP 内容；可向 stderr 写 UTF-8 日志，client 可捕获、转发或忽略。 || **Channel discipline** - The server must not write anything non-MCP to stdout; it may write UTF-8 logs to stderr, which the client may capture, forward, or ignore.
- **启动方式** — client 根据宿主配置文件中登记的命令与参数直接启动 server 子进程。 || **Startup** - The client launches the server subprocess directly using the command and arguments registered in the host configuration.

::panel
### 5.3 Streamable HTTP 细节 || 5.3 Streamable HTTP Details
Streamable HTTP 用一个端点同时承载「客户端 POST 请求」与「服务器经 GET/SSE 主动推送」，并可选带会话与断线续传。 || Streamable HTTP carries both client POST requests and server-initiated pushes over GET/SSE on one endpoint, with optional sessions and resumability.

- **发送** — 每条 JSON-RPC 消息都是一次 HTTP POST；请求头 Accept 须同时列出 application/json 与 text/event-stream。 || **Sending** - Every JSON-RPC message is one HTTP POST; the Accept header must list both application/json and text/event-stream.
- **响应形态** — 对一个请求，server 可返回单个 JSON 对象，或开一条 SSE 流分批推送直至给出该请求的响应。 || **Response shape** - For a request, the server may return a single JSON object or open an SSE stream that pushes messages until it delivers the response to that request.
- **会话** — server 可在初始化响应里下发 Mcp-Session-Id 头；此后 client 每个请求都要带上，server 可随时终止会话（返回 404 触发重连）。 || **Sessions** - The server may issue an Mcp-Session-Id header in the initialize response; the client must then include it on every request, and the server may terminate the session at any time (a 404 triggers reconnection).

::panel
### 5.4 传输选型判据 || 5.4 How to Choose a Transport
用三个问题决定传输：server 在哪跑、有几个客户端、要不要托管与扩展。 || Three questions decide the transport: where the server runs, how many clients, and whether it needs hosting and scaling.

- **本地集成** — server 与宿主同机、单用户（如 IDE 插件、桌面助手接本地文件/Git）→ 选 stdio。 || **Local integration** - Server co-located with the host, single user (IDE plugin, desktop assistant over local files/Git) - choose stdio.
- **远程/多租户** — server 作为共享服务被多个客户端调用、需要鉴权与横向扩展 → 选 Streamable HTTP。 || **Remote/multi-tenant** - Server is a shared service called by many clients, needing auth and horizontal scaling - choose Streamable HTTP.
- **特殊通道** — 需要走非标准信道（进程内、WebSocket 等）时可实现自定义传输，但必须保留 JSON-RPC 消息格式与生命周期契约。 || **Special channel** - When a non-standard channel is needed (in-process, WebSocket), implement a custom transport, but preserve the JSON-RPC message format and lifecycle contract.
:::

## #build-server 06 / Build a Server :: 开发实操：用 TypeScript 从零构建一个 MCP Server || Hands-On: Build an MCP Server from Scratch in TypeScript

下面用官方 TypeScript SDK 走一遍最小可运行路径：初始化项目 → 定义 server 并注册工具 → 连接 stdio 传输 → 构建并接入宿主。工具输入用 zod 声明 schema，SDK 会据此生成工具定义并做参数校验。 || Here is the minimal runnable path with the official TypeScript SDK: initialize the project, define a server and register a tool, connect the stdio transport, then build and wire it into a host. Tool inputs are declared with zod schemas, from which the SDK generates tool definitions and validates arguments.

:::accordion
::panel { open: true }
### 6.1 项目初始化与依赖 || 6.1 Project Setup and Dependencies
装 SDK 与 zod，并把 package.json 设为 ES module、加一条 build 脚本。 || Install the SDK and zod, set package.json to an ES module, and add a build script.

```
mkdir weather-mcp && cd weather-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod@3
npm install -D @types/node typescript
mkdir src
```

package.json（关键字段） || package.json (key fields)

```
{
  "type": "module",
  "bin": { "weather": "./build/index.js" },
  "scripts": { "build": "tsc && chmod 755 build/index.js" }
}
```

::panel
### 6.2 定义 Server 并注册 Tool || 6.2 Define the Server and Register a Tool
创建 McpServer，用 registerTool 声明工具名、描述与 zod 输入 schema；处理函数返回一个 content 数组。 || Create an McpServer, declare the tool name, description, and zod input schema with registerTool; the handler returns a content array.

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather", version: "1.0.0" });

server.registerTool(
  "get_forecast",
  {
    description: "Get the weather forecast for a coordinate.",
    inputSchema: {
      latitude: z.number().min(-90).max(90).describe("Latitude"),
      longitude: z.number().min(-180).max(180).describe("Longitude"),
    },
  },
  async ({ latitude, longitude }) => {
    const text = await fetchForecast(latitude, longitude);
    return { content: [{ type: "text", text }] };
  },
);
```

::panel
### 6.3 连接 stdio 并构建运行 || 6.3 Connect stdio, Build, and Run
用 StdioServerTransport 连接 server；日志一律走 stderr（console.error）。构建后即可被宿主以子进程方式启动。 || Connect the server with StdioServerTransport; send logs to stderr (console.error). After building, a host can launch it as a subprocess.

```
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("weather MCP server running on stdio");
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});
```

```
npm run build   # tsc 编译到 build/ 目录 / compiles to build/
```

::panel
### 6.4 接入宿主（Claude Desktop / VS Code） || 6.4 Wire It into a Host (Claude Desktop / VS Code)
在宿主的 MCP 配置里登记一条 server：给一个名字、一个可执行命令与参数（绝对路径）。多数宿主用同构的 mcpServers 结构。 || Register one server in the host's MCP config: a name, an executable command, and arguments (absolute path). Most hosts use the same mcpServers structure.

```
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/weather-mcp/build/index.js"]
    }
  }
}
```

保存后重启宿主；宿主会以该命令启动 server 子进程，完成 initialize 握手后即可在会话中调用 get_forecast。 || Save and restart the host; it launches the server subprocess with that command, and after the initialize handshake, get_forecast is callable in the session.

::panel
### 6.5 日志陷阱：stdout 保留给协议 || 6.5 The Logging Trap: stdout Is Reserved for the Protocol
stdio server 里最常见的致命错误，是往 stdout 打日志——它会污染 JSON-RPC 消息流，让 server 静默失效。 || The most common fatal mistake in a stdio server is logging to stdout - it corrupts the JSON-RPC message stream and silently breaks the server.

反例 || Wrong

**向 stdout 写日志 || Logging to stdout**

```
// stdio server
console.log("debug");
// 污染协议流，server 失效
// corrupts the stream
```

正例 || Right

**向 stderr 写日志 || Logging to stderr**

```
// stdio server
console.error("debug");
// stderr 安全，不干扰协议
// stderr is safe
```

规则对所有语言一致：Python 用 print(..., file=sys.stderr) 或 logging；HTTP 传输的 server 则不受此限（stdout 不承载协议）。 || The rule holds across languages: in Python use print(..., file=sys.stderr) or logging; HTTP-transport servers are exempt (stdout does not carry the protocol).

::panel
### 6.6 Python FastMCP 对照 || 6.6 The Python FastMCP Equivalent
Python 侧用 FastMCP：用装饰器把带类型标注与 docstring 的函数暴露为工具，SDK 自动生成工具定义。 || On the Python side, FastMCP uses a decorator to expose a typed, docstring-annotated function as a tool, and the SDK generates the tool definition automatically.

```
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get the weather forecast for a coordinate."""
    return await fetch_forecast(latitude, longitude)

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

依赖 mcp[cli]（Python 3.10+，MCP SDK 1.2.0+）；同样遵守「stdout 只给协议」的纪律。 || Depends on mcp[cli] (Python 3.10+, MCP SDK 1.2.0+) and follows the same stdout-for-protocol-only discipline.
:::

## #client 07 / Connect a Client :: 客户端集成：Host、模型与 Server 的调用回路 || Client Integration: The Host, Model, and Server Loop

从消费侧看，MCP 的运行时是一个回路：宿主列出 server 的工具 → 连同用户问题交给模型 → 模型决定调用哪些工具 → 宿主经 server 执行 → 结果回给模型 → 模型给出自然语言回答。厘清这一回路后，才能准确判断哪些能力应下沉到 MCP server、哪些应留在宿主应用内。 || From the consumer side, MCP's runtime forms a closed loop. The host lists a server's tools and passes them with the user's question to the model. Once the model selects a tool call, the host executes it through the server and returns the result for the final answer. Understanding this loop clarifies which capabilities belong in an MCP server and which stay inside the host.

:::accordion
::panel { open: true }
### 7.1 运行时回路 || 7.1 The Runtime Loop
宿主是模型与 server 之间的编排者；模型只表达「要调哪个工具」，真正的执行与鉴权都在宿主与 server。 || The host orchestrates between the model and the server; the model only expresses which tool to call, while execution and authorization live in the host and server.

1. **列出工具 || List tools** — client 连接 server 后调用 tools/list，把可用工具及其输入 schema 拿到手。 || After connecting, the client calls tools/list to obtain the available tools and their input schemas.
2. **交给模型决策 || Let the model decide** — 宿主把用户问题 + 工具声明发给模型；模型用 function calling 决定调用哪个、传什么参数。 || The host sends the user's question plus tool declarations to the model, which uses function calling to pick a tool and arguments.
3. **经 Server 执行 || Execute via the server** — 宿主经 client 调用 tools/call 执行工具（必要时先请用户确认），拿到结构化结果。 || The host calls tools/call through the client to run the tool (with user confirmation when needed) and gets a structured result.
4. **回填并作答 || Feed back and answer** — 结果回给模型，模型据此生成回答；如需多步，重复 2–4 直至完成。 || Results go back to the model, which composes an answer; for multi-step tasks, repeat 2 to 4 until done.

::panel
### 7.2 用 SDK 连接并调用 || 7.2 Connect and Call with the SDK
客户端侧同样用官方 SDK：创建 Client、连接传输、listTools 发现工具、callTool 执行。 || The client side also uses the official SDK: create a Client, connect a transport, discover tools with listTools, and execute with callTool.

```
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "host-app", version: "1.0.0" });
await client.connect(new StdioClientTransport({
  command: "node",
  args: ["build/index.js"],
}));

const { tools } = await client.listTools();

const result = await client.callTool({
  name: "get_forecast",
  arguments: { latitude: 47.6, longitude: -122.3 },
});
```

::panel
### 7.3 宿主生态：一次实现，多处接入 || 7.3 Host Ecosystem: Build Once, Integrate Everywhere
MCP 已被广泛的宿主支持，同一个 server 可被多种客户端复用，这正是「一次实现，多处接入」的落地形态。 || MCP is supported across a broad range of hosts, so one server is reusable by many clients - the practical form of build once, integrate everywhere.

- **AI 助手** — Claude、ChatGPT 等对话产品可发现并调用 MCP 工具。 || **AI assistants** - Conversational products such as Claude and ChatGPT can discover and call MCP tools.
- **开发工具** — Visual Studio Code、Cursor 等 IDE 内置 MCP 客户端，把工具接进编码工作流。 || **Dev tools** - IDEs such as Visual Studio Code and Cursor embed an MCP client, bringing tools into the coding workflow.
- **可移植性** — 因为协议一致，为一个宿主写的 server 通常无需改代码即可被其它宿主接入。 || **Portability** - Because the protocol is shared, a server written for one host usually integrates with others without code changes.
:::

## #security 08 / Security & Production :: 安全与生产化：四条信任原则与传输加固 || Security and Production: Four Trust Principles and Transport Hardening

MCP 打开了「任意数据访问 + 任意代码执行」的能力面，因此安全不是可选项。协议本身无法在协议层强制这些原则，落地责任落在实现方：宿主必须建立同意与授权流程、访问控制与隐私保护。下面先给四条信任原则，再落到 Streamable HTTP 的具体加固与生产降级。 || MCP opens a surface of arbitrary data access plus arbitrary code execution, so security is not optional. The protocol cannot enforce these principles at the protocol level; the responsibility falls on implementers - hosts must build consent and authorization flows, access controls, and privacy protections. Below are the four trust principles, then concrete Streamable HTTP hardening and production fallback.

:::accordion
::panel { open: true }
### 8.1 四条信任原则 || 8.1 The Four Trust Principles
官方规范给出四条必须落实的信任与安全原则，覆盖同意、隐私、工具与推理四个面。 || The specification names four trust and safety principles implementers must honor, covering consent, privacy, tools, and sampling.

- **用户同意与控制 || User Consent and Control** — 用户必须明确同意并理解所有数据访问与操作，保留对「共享什么、执行什么」的控制；宿主应提供清晰的审阅与授权界面。 || Users must explicitly consent to and understand all data access and operations, retaining control over what is shared and done; hosts should provide clear review and authorization UIs.
- **数据隐私 || Data Privacy** — 宿主在把用户数据暴露给 server 前须取得明确同意，未经同意不得外传资源数据，并以适当访问控制保护数据。 || Hosts must obtain explicit consent before exposing user data to servers, must not transmit resource data elsewhere without consent, and must protect data with appropriate access controls.
- **工具安全 || Tool Safety** — 工具等同任意代码执行；除非来自可信 server，工具的行为描述与注解应视为不可信。宿主必须在调用任何工具前取得用户同意。 || Tools represent arbitrary code execution; unless from a trusted server, tool behavior descriptions and annotations should be treated as untrusted. Hosts must obtain user consent before invoking any tool.
- **Sampling 控制 || Sampling Controls** — 用户必须显式批准任何 sampling 请求，并能控制是否发生、发送什么提示、server 能看到什么结果；协议刻意限制 server 对提示的可见性。 || Users must explicitly approve any sampling request and control whether it happens, what prompt is sent, and what results the server sees; the protocol deliberately limits server visibility into prompts.

::panel
### 8.2 Streamable HTTP 传输加固 || 8.2 Streamable HTTP Transport Hardening
把 server 暴露到 HTTP 上会引入 Web 攻击面；官方对 Streamable HTTP 给出三条强制加固。 || Exposing a server over HTTP introduces a web attack surface; the spec mandates three hardening steps for Streamable HTTP.

- **校验 Origin 头** — 所有入站连接都必须校验 Origin，防止 DNS rebinding 攻击从远程网页控制本地 server。 || **Validate the Origin header** - All incoming connections must validate Origin to prevent DNS rebinding attacks that let remote sites drive a local server.
- **本地只绑 localhost** — 本地运行时应只绑定 127.0.0.1，而非 0.0.0.0，避免暴露到所有网络接口。 || **Bind localhost when local** - When running locally, bind only to 127.0.0.1 rather than 0.0.0.0 to avoid exposure on all interfaces.
- **为所有连接鉴权** — 为所有连接实现恰当的身份认证；无这些防护，攻击者可用 DNS rebinding 与本地 server 交互。 || **Authenticate every connection** - Implement proper authentication for all connections; without these protections, attackers can use DNS rebinding to interact with a local server.

::panel
### 8.3 超时、取消与生产降级 || 8.3 Timeouts, Cancellation, and Production Fallback
生产系统里 server 会挂、工具会失败、连接会断；把这些当常态处理，才能得到稳定的 MCP 集成。 || In production, servers hang, tools fail, and connections drop; treating these as normal is what yields a stable MCP integration.

- **按请求设超时** — 每个请求设超时，超时发取消通知并停止等待；对整条 agentic 回路设最大步数与总时限。 || **Timeout per request** - Set a timeout on each request, send a cancellation notification and stop waiting on timeout, and cap the whole agentic loop with a max step count and total time budget.
- **结构化错误回传** — 工具失败时回传清晰、可操作的错误文本（而非原始堆栈），让模型能修正参数或改走替代路径。 || **Return structured errors** - On tool failure, return a clear, actionable error text (not a raw stack trace) so the model can fix arguments or take an alternative path.
- **会话与重连** — HTTP 传输下处理 404（会话失效即重新 initialize）、断线续传（Last-Event-ID）与显式 DELETE 释放会话。 || **Sessions and reconnection** - Under HTTP, handle 404 (re-initialize when a session expires), resumability (Last-Event-ID), and explicit DELETE to release a session.
- **最小权限** — server 只暴露必要的工具与资源；把敏感操作放在需要显式用户确认的路径后面。 || **Least privilege** - A server exposes only the tools and resources it needs; put sensitive operations behind an explicit user-confirmation path.
:::

## #adoption 09 / Adoption Decisions :: 选型判断：何时用 MCP、如何落地 || Adoption Decisions: When to Use MCP and How to Land It

MCP 并非所有集成的默认答案。它的价值集中在「工具要被多个宿主复用、要有连接生命周期与统一鉴权」这类场景；单一应用内的少量固定工具，直接 function calling 往往更省。落地选型可结合复用范围、传输模式与反向判据逐项核对。 || MCP is not the default answer for every integration. Its value concentrates where tools must be reused across hosts and need a connection lifecycle and unified authorization; for a few fixed tools inside a single app, bare function calling is often cheaper. Practical adoption decisions weigh reuse scope, transport mode, and explicit non-use criteria.

:::accordion
::panel { open: true }
### 9.1 MCP vs Function Calling vs 私有 API || 9.1 MCP vs Function Calling vs Private API
三种做法解决的问题不同；按「复用范围、发现机制、生命周期」三维对照，即可选中合适的那一档。 || The three approaches solve different problems; comparing them on reuse scope, discovery, and lifecycle points to the right tier.

| 维度 || Dimension | 直接 Function Calling || Bare Function Calling | MCP | 私有 API 集成 || Private API Integration |
| --- | --- | --- | --- |
| 复用范围 || Reuse scope | 绑定单一应用 || Bound to one app | 跨宿主复用 || Reusable across hosts | 按对接双方定制 || Custom per pair |
| 发现机制 || Discovery | 代码里硬编码工具集 || Tools hard-coded in app | 运行时 tools/list 动态发现 || Dynamic via tools/list | 靠文档与手工约定 || Docs and manual contract |
| 连接生命周期 || Connection lifecycle | 无（单次请求） || None (single request) | 初始化/能力协商/会话 || Init / negotiation / session | 各自实现 || Bespoke each time |
| 最省场景 || Cheapest when | 少量固定工具、单应用 || Few fixed tools, one app | 工具产品化、多宿主接入 || Productized tools, many hosts | 强耦合、深度定制系统 || Tightly coupled systems |

::panel
### 9.2 MCP vs REST API：不同层，常叠用 || 9.2 MCP vs REST API: Different Layers, Often Stacked
先厘清前提：MCP 与 REST API 不在同一层，也并非二选一。REST 是供代码调用的通用 API 风格，MCP 是供模型发现与调用的协议；且 MCP Server 内部往往正是在调用 REST。 || First, clarify the premise: MCP and REST API sit at different layers and are not mutually exclusive. REST is a general API style for code to call; MCP is a protocol for models to discover and call; and an MCP server internally often calls REST.

| 维度 || Dimension | REST API | MCP |
| --- | --- | --- |
| 调用方 || Caller | 确定性代码 || Deterministic code | LLM / Agent |
| 发现方式 || Discovery | 带外文档（OpenAPI），集成硬编码 || Out-of-band docs (OpenAPI), hardcoded | 运行时 tools/list 自描述 || Runtime tools/list self-description |
| 接口形态 || Interface | 每个 API 各异，逐个适配 || Per-API, adapt each one | 统一 JSON-RPC，一个客户端对接所有 server || Uniform JSON-RPC, one client for all servers |
| 状态 || State | 通常无状态 || Typically stateless | 有状态会话 + 能力协商 || Stateful session + negotiation |
| 方向 || Direction | 单向 client→server || One-way, client to server | 双向（sampling / elicitation） || Bidirectional (sampling / elicitation) |
| 复用成本 || Reuse cost | 每个 AI 宿主各写一遍 = M×N || Per AI host = M×N | 写一次，处处可用 = M+N || Build once = M+N |

选择判据：调用方是否为 LLM、以及工具是否需要跨多个 AI 宿主复用。二者成立时用 MCP；若只是代码间的确定性集成，REST 更轻、更省。根本原因在于 REST 的契约在开发期固定、面向已知双方，而 MCP 的契约在运行期协商并自描述、面向被模型动态发现。实践中最常见的是两者叠用：底层 REST，外面包一层 MCP 供 Agent 使用。 || Decision criteria: whether the caller is an LLM, and whether the tool must be reused across multiple AI hosts. When both hold, use MCP; for deterministic code-to-code integration, REST is lighter and cheaper. The root reason: REST fixes its contract at development time for known parties, while MCP negotiates and self-describes its contract at runtime for dynamic discovery by a model. In practice the two are most often stacked: REST underneath, an MCP layer on top for agents.

::panel
### 9.3 本地 stdio 还是远程 HTTP || 9.3 Local stdio or Remote HTTP
决定用 MCP 之后，第二个决策是部署形态；它同时影响鉴权、可扩展性与运维复杂度。 || Once MCP is chosen, the second decision is deployment shape, which drives auth, scalability, and operational complexity.

本地 stdio || Local stdio

**随宿主分发、按用户机器运行 || Ships with the Host, Runs per User Machine**

- 无网络暴露面，鉴权由本机进程与文件权限承担。 || No network exposure; auth relies on local process and file permissions.
- 适合个人生产力工具、访问本地文件/Git、开发调试。 || Fits personal productivity tools, local file/Git access, and development.
- 更新需随宿主或包分发，集中运维弱。 || Updates ship with the host or package; centralized ops are weak.

远程 Streamable HTTP || Remote Streamable HTTP

**集中托管、多客户端共享 || Centrally Hosted, Shared by Many Clients**

- 集中更新与监控，一处修复所有客户端受益。 || Centralized updates and monitoring; one fix benefits all clients.
- 必须做传输加固（Origin 校验、鉴权）与会话管理。 || Requires transport hardening (Origin validation, auth) and session management.
- 适合企业共享工具、多租户、需横向扩展的场景。 || Fits enterprise shared tools, multi-tenant, and horizontally scaled use.

::panel
### 9.4 何时不该用 MCP || 9.4 When Not to Use MCP
以下判断可证伪：若命中，直接 function calling 或私有集成通常成本更低、控制更强。 || The following judgments are falsifiable: when they hold, bare function calling or a private integration is usually cheaper and more controllable.

- **工具不跨宿主复用** — 只有一个应用会用这批工具，引入 MCP 只增加进程与协议开销。 || **Tools are not reused across hosts** - If only one app will use them, MCP only adds process and protocol overhead.
- **工具集小且稳定** — 三五个固定工具，硬编码到 function calling 声明里维护更简单。 || **The tool set is small and stable** - For a handful of fixed tools, hard-coding them into function-calling declarations is simpler to maintain.
- **需要极致低延迟或强耦合语义** — 进程内直调或专用 API 能省掉一层序列化与传输，控制更细。 || **You need extreme low latency or tightly coupled semantics** - In-process calls or a dedicated API remove a serialization and transport layer and give finer control.

::panel
### 9.5 落地清单 || 9.5 Landing Checklist
确定用 MCP 后，按此清单推进，可覆盖从原型到生产的主要关口。 || Once MCP is chosen, this checklist covers the main gates from prototype to production.

- **划边界** — 明确哪些能力做成 server，粒度按「可独立复用、职责聚焦」切分。 || **Draw boundaries** - Decide which capabilities become servers, sliced for independent reuse and focused responsibility.
- **选传输** — 本地单用户用 stdio，远程多客户端用 Streamable HTTP，并据此规划鉴权。 || **Pick a transport** - stdio for local single-user, Streamable HTTP for remote multi-client, and plan auth accordingly.
- **设计 schema** — 用清晰的工具名、描述与强类型输入 schema，减少模型误调用。 || **Design schemas** - Use clear tool names, descriptions, and strongly typed input schemas to reduce mis-calls.
- **加同意与审计** — 敏感工具走用户确认，记录每次调用的输入、输出与耗时，便于排障与合规。 || **Add consent and audit** - Gate sensitive tools behind user confirmation and log each call's input, output, and latency for debugging and compliance.
:::

## #references 10 / References :: 参考文献 || References

- [1] Anthropic / MCP, 2026. — https://modelcontextprotocol.io/introduction | MCP 概述与价值：USB-C 类比、三类受益者、广泛的宿主生态。 || MCP overview and value: the USB-C analogy, three beneficiary groups, and the broad host ecosystem.
- [2] MCP, 2025. — https://modelcontextprotocol.io/specification/2025-06-18/architecture | client-host-server 架构、核心组件职责、四条设计原则与能力协商。 || The client-host-server architecture, core component responsibilities, four design principles, and capability negotiation.
- [3] MCP, 2025. — https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle | 初始化握手、版本与能力协商、关闭、超时与错误处理，含 initialize 请求示例。 || Initialization handshake, version and capability negotiation, shutdown, timeouts, and error handling, with an initialize request example.
- [4] MCP, 2025. — https://modelcontextprotocol.io/specification/2025-06-18/basic/transports | stdio 与 Streamable HTTP 细节、会话管理、断线续传与传输层安全告警。 || stdio and Streamable HTTP details, session management, resumability, and transport-layer security warnings.
- [5] MCP, 2026. — https://modelcontextprotocol.io/specification/versioning | YYYY-MM-DD 日期串版本策略；当前修订 2025-11-25；协商与向后兼容规则。 || The YYYY-MM-DD date-string versioning policy; current revision 2025-11-25; negotiation and backward-compatibility rules.
- [6] MCP, 2026. — https://modelcontextprotocol.io/docs/develop/build-server | 多语言快速上手：TypeScript McpServer / registerTool、stdio 传输、stdout 日志陷阱与宿主配置。 || Multi-language quickstart: TypeScript McpServer / registerTool, stdio transport, the stdout logging trap, and host configuration.
- [7] Model Context Protocol, 2026. — https://github.com/modelcontextprotocol/typescript-sdk | 官方 TypeScript SDK：McpServer、Client、Stdio 与 Streamable HTTP 传输的参考实现。 || The official TypeScript SDK: reference implementation of McpServer, Client, and the Stdio and Streamable HTTP transports.

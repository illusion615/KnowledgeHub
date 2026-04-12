// ======================================
// Knowledge Tree — 唯一数据源（邻接表）
// ======================================
//
// 维护规则：
//   - parentId: null → 根节点（顶级主题，渲染为最大星球）
//   - parentId: 'xxx' → 挂在 id=xxx 节点下，层级无限制
//   - type: 'topic' → 分支节点，可展开，Galaxy 渲染为球体
//   - type: 'article' → 叶子节点，有 url，Galaxy 渲染为小点
//
// 添加新知识点：
//   1. 创建 posts/{slug}/index.html
//   2. 在下方数组末尾加一条 { id, parentId, type:'article', ... }
//
// 添加新分类/分组：
//   加一条 { id, parentId, type:'topic', label:{zh,en}, color }
//
// Galaxy 渲染参数：
//   - orbitIndex: 仅根节点需要（0/1/2/3 → 决定绕中心第几条轨道）
//   - phase: 初始角度（弧度），错开避免重叠
//   - speed: 公转速度倍率
//   - relations: 文章间关联线（hover 时显示）
//
var knowledgeTree = [

  // ════════════════════════════════════════
  // 根节点（顶级主题）
  // ════════════════════════════════════════
  {
    id: 'ai-engineering-practice',
    parentId: null,
    type: 'topic',
    label: { zh: 'AI研究', en: 'AI Research' },
    color: '#0d8f8c',
    orbitIndex: 0, phase: 2.4, speed: 0.5
  },
  {
    id: 'microsoft-ai',
    parentId: null,
    type: 'topic',
    label: { zh: 'Microsoft AI', en: 'Microsoft AI' },
    color: '#7c3aed',
    orbitIndex: 1, phase: 1.0, speed: 0.55
  },
  {
    id: 'ai-project-practice',
    parentId: null,
    type: 'topic',
    label: { zh: 'AI项目实践', en: 'AI Project Practice' },
    color: '#0f766e',
    orbitIndex: 2, phase: 5.1, speed: 0.5
  },

  // ════════════════════════════════════════
  // 二级分组
  // ════════════════════════════════════════
  {
    id: 'ai-research-model',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: '模型', en: 'Models' },
    color: '#0ea5e9',
    phase: 0.1, speed: 0.9
  },
  {
    id: 'ai-research-vibe-coding',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: 'Vibe Coding', en: 'Vibe Coding' },
    color: '#14b8a6',
    phase: 1.4, speed: 0.88
  },
  {
    id: 'ai-research-agent',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: '智能体', en: 'Agents' },
    color: '#f97316',
    phase: 2.9, speed: 0.86
  },
  {
    id: 'copilot-studio',
    parentId: 'microsoft-ai',
    type: 'topic',
    label: { zh: 'Copilot Studio', en: 'Copilot Studio' },
    color: '#9333ea',
    phase: 0.5, speed: 0.9
  },
  {
    id: 'power-apps',
    parentId: 'microsoft-ai',
    type: 'topic',
    label: { zh: 'Power Apps', en: 'Power Apps' },
    color: '#742fa5',
    phase: 3.2, speed: 0.85
  },
  {
    id: 'ai-mud',
    parentId: 'ai-project-practice',
    type: 'topic',
    label: { zh: 'AI Mud', en: 'AI Mud' },
    color: '#e0b04b',
    phase: 4.1, speed: 0.82
  },
  {
    id: 'knowledge-hub',
    parentId: 'ai-project-practice',
    type: 'topic',
    label: { zh: 'Knowledge Hub', en: 'Knowledge Hub' },
    color: '#14b8a6',
    phase: 2.2, speed: 0.86
  },

  // ════════════════════════════════════════
  // 文章 — 企业智能体架构
  // ════════════════════════════════════════
  {
    id: 'enterprise-agent-arch',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: '企业智能体架构设计与应用',
      en: 'Enterprise Agent Architecture Design & Application'
    },
    summary: {
      zh: '企业智能体由 AI 模型驱动，能够感知上下文、推理并围绕目标自主行动。它不是静态聊天机器人，而是位于现有企业应用之上和之间的新认知层，通过自然语言意图驱动 ERP、CRM、数据湖、IoT 与业务 API 协同执行。',
      en: 'Enterprise agents are powered by AI models, capable of perceiving context, reasoning, and acting autonomously toward goals. Rather than static chatbots, they form a new cognitive layer above and between existing enterprise applications, orchestrating ERP, CRM, data lakes, IoT, and business APIs through natural language intent.'
    },
    tags: ['AI Agent', 'Enterprise Architecture'],
    date: '2026-04-08',
    url: 'posts/enterprise-agent-architecture/index.html',
    color: '#ff9340',
    phase: 0, speed: 1,
    relations: ['copilot-harness-eng', 'agentic-skill-exec']
  },
  {
    id: 'agentic-ai-adoption',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'Agentic AI 导入实践：用成熟度模型规划企业落地',
      en: 'Agentic AI Adoption Practice: Planning Enterprise Rollout with a Maturity Model'
    },
    summary: {
      zh: '基于 Microsoft Copilot Studio 的 maturity model overview，梳理企业导入 agentic AI 时应关注的五级成熟度、五大能力支柱，以及从试点走向可规模化运营的落地节奏。',
      en: 'Based on the Microsoft Copilot Studio maturity model overview, this article maps the five maturity levels, five capability pillars, and a practical rollout cadence for moving agentic AI from isolated pilots to scalable enterprise operations.'
    },
    tags: ['Agentic AI', 'Adoption', 'Maturity Model'],
    date: '2026-04-09',
    url: 'posts/agentic-ai-adoption-practice/index.html',
    color: '#ff9d5c',
    phase: 2.3, speed: 0.88,
    relations: ['enterprise-agent-arch', 'agentic-skill-exec']
  },

  // ════════════════════════════════════════
  // 文章 — AI 工程实践
  // ════════════════════════════════════════
  {
    id: 'copilot-harness-eng',
    parentId: 'ai-research-vibe-coding',
    type: 'article',
    title: {
      zh: 'AI 编码助手的 Harness Engineering 初始化',
      en: 'Harness Engineering for AI Coding Assistants'
    },
    summary: {
      zh: 'Harness Engineering 是在项目启动初期，通过结构化的约定文件、上下文框架和指令体系，为 AI 编码助手建立高效协作基础的工程实践。它不是一次性提示词编写，而是一套持续演进的协作架构。',
      en: 'Harness Engineering scaffolds structured conventions, context files, and instruction hierarchies at project inception, establishing an efficient collaboration foundation for AI coding assistants. It is not one-time prompt writing but a continuously evolving collaboration architecture.'
    },
    tags: ['AI Engineering', 'Copilot', 'DevEx'],
    date: '2026-04-08',
    url: 'posts/copilot-harness-engineering/index.html',
    color: '#12b5b2',
    phase: 1.2, speed: 0.9,
    relations: ['enterprise-agent-arch', 'ai-mud-retro']
  },
  {
    id: 'copilot-deep-dive',
    parentId: 'ai-research-vibe-coding',
    type: 'article',
    title: {
      zh: 'GitHub Copilot 深度解析：产品全景、竞品对比与人机协同最佳实践',
      en: 'GitHub Copilot Deep Dive: Product Landscape, Competitor Analysis & Human-AI Collaboration Best Practices'
    },
    summary: {
      zh: '系统梳理 GitHub Copilot 的八大模块（补全、Agent Mode、Cloud Agent、CLI、Code Review、MCP、SDK、Multi-Model），与 Cursor、Windsurf、Cline、Claude Code 做结构化对比，并给出从 Harness Engineering 到三层委托执行（Local / CLI / Cloud）的人机协同最佳实践。',
      en: 'A systematic overview of GitHub Copilot\'s eight modules, structured comparison with Cursor, Windsurf, Cline, and Claude Code, plus best practices for human-AI collaboration spanning Harness Engineering to the three-tier delegation model (Local / CLI / Cloud).'
    },
    tags: ['GitHub Copilot', 'Vibe Coding', 'AI Engineering', 'Best Practices'],
    date: '2026-04-12',
    url: 'posts/copilot-deep-dive/index.html',
    color: '#14b8a6',
    phase: 3.8, speed: 0.86,
    relations: ['copilot-harness-eng', 'enterprise-agent-arch', 'claw-code-analysis']
  },
  {
    id: 'text-to-image-prompting',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: '文生图提示词工程：五种模型的提示策略对比与可复用模式',
      en: 'Text-to-Image Prompt Engineering: Prompting Strategies Across 5 Models'
    },
    summary: {
      zh: '对比 GPT Image、Midjourney v6、Stable Diffusion/SDXL、FLUX.1 和 Z-Image-Turbo 五种模型在提示词处理机制上的差异（自然语言 vs 关键词堆叠 vs 参数驱动 vs 单流 DiT）',
      en: 'Compares 4 text-to-image models (GPT Image, Midjourney v6, SD/SDXL, FLUX.1) across prompting paradigms (natural language vs keyword stacking vs parameter-driven), demonstrates structural differences with same-subject prompts, and distills 3 reusable patterns: SES, Iterative Refinement, and Constraint-First.'
    },
    tags: ['Prompt Engineering', 'Text-to-Image', 'Best Practices'],
    date: '2026-04-10',
    url: 'posts/text-to-image-prompting/index.html',
    color: '#0ea5e9',
    phase: 3.8, speed: 0.9,
    relations: ['mlx-optimization']
  },
  {
    id: 'hermes-open-model',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'NousResearch Hermes：面向工具调用与用户对齐的开源微调模型',
      en: 'NousResearch Hermes: Open-Source Fine-Tuned LLM for Tool Use & User Alignment'
    },
    summary: {
      zh: '系统梳理 Nous Research 的 Hermes 开源模型系列（Hermes 1→2→2 Pro→3），分析其 neutral alignment 设计理念、SFT + DPO 训练方法、ChatML 格式、function calling 与 JSON mode 协议、以及 Hermes 3 引入的 GOAP 结构化推理框架。',
      en: 'A systematic overview of Nous Research\'s Hermes open-source model series (Hermes 1→2→2 Pro→3), covering neutral alignment philosophy, SFT + DPO training, ChatML format, function calling & JSON mode protocols, and the GOAP structured reasoning framework introduced in Hermes 3.'
    },
    tags: ['Open Source LLM', 'Function Calling', 'Hermes'],
    date: '2026-04-10',
    url: 'posts/hermes-open-model/index.html',
    color: '#38bdf8',
    phase: 5.2, speed: 0.92,
    relations: ['enterprise-agent-arch', 'agentic-skill-exec']
  },
  {
    id: 'fc-landscape',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'Function Calling 模型全景：主流 LLM 工具调用能力深度对比',
      en: 'Function Calling Models Landscape: Deep Comparison of LLM Tool Use Capabilities'
    },
    summary: {
      zh: '基于 BFCL V4 最新数据，系统对比 Claude、Gemini、GPT、Grok、DeepSeek、Qwen、GLM 等 109 个模型在 Agentic / Multi-Turn / Live / Hallucination 维度的 function calling 表现，分析各厂商协议差异，提供按场景的选型决策指南。',
      en: 'Based on BFCL V4 data, systematically compares 109 models (Claude, Gemini, GPT, Grok, DeepSeek, Qwen, GLM) across Agentic / Multi-Turn / Live / Hallucination dimensions for function calling, analyzes vendor protocol differences, and provides scenario-based selection guide.'
    },
    tags: ['Function Calling', 'LLM Benchmark', 'AI Agent', 'Tool Use'],
    date: '2026-04-11',
    url: 'posts/function-calling-landscape/index.html',
    color: '#0ea5e9',
    phase: 0.8, speed: 0.88,
    relations: ['hermes-open-model', 'enterprise-agent-arch', 'agentic-skill-exec']
  },
  {
    id: 'claw-code-analysis',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'Claw Code 深度解析：自主编码代理的开源 Harness 实现',
      en: 'Claw Code Deep Dive: Open-Source Harness for Autonomous Coding Agents'
    },
    summary: {
      zh: '深度分析 UltraWorkers 社区的 claw-code 开源项目——一个由自主 AI 代理协同构建的编码 harness。涵盖三层协作架构（OmX/clawhip/OmO）、9 crate Rust 工作区、40 个工具规格、9-lane 对齐验证体系，以及从 CLI 到 claw-native 运行时的五阶段演进路线。',
      en: 'Deep analysis of UltraWorkers community\'s claw-code open-source project—a coding harness collaboratively built by autonomous AI agents. Covers the three-layer coordination architecture (OmX/clawhip/OmO), 9-crate Rust workspace, 40 tool specs, 9-lane parity validation system, and the five-phase roadmap from CLI to claw-native runtime.'
    },
    tags: ['Coding Agent', 'Open Source', 'Rust', 'Autonomous Development'],
    date: '2026-04-11',
    url: 'posts/claw-code-analysis/index.html',
    color: '#f97316',
    phase: 2.5, speed: 0.86,
    relations: ['copilot-harness-eng', 'enterprise-agent-arch', 'agentic-skill-exec']
  },

  // ════════════════════════════════════════
  // 文章 — Vibe Coding Practice
  // ════════════════════════════════════════
  {
    id: 'llm-client-arch',
    parentId: 'ai-mud',
    type: 'article',
    title: {
      zh: 'LLM Client 架构重构：多 Provider 运行时设计实践',
      en: 'LLM Client Refactor: Multi-Provider Runtime Design'
    },
    summary: {
      zh: '把 AI-MUD 中 1905 行的单体 llm_client 重构为 Role API、Dispatch、Provider Protocol 与运行时控制面分离的多 Provider 架构，并补上 dual semaphore、模型级熔断和连接池复用等稳定性机制。',
      en: 'Refactors AI-MUD\'s 1905-line monolithic llm_client into a multi-provider runtime that separates the Role API, dispatch layer, provider protocol, and runtime controls, while adding dual semaphores, per-model circuit breakers, and connection-pool reuse.'
    },
    tags: ['LLM Runtime', 'Architecture', 'Reliability'],
    date: '2026-04-09',
    url: 'posts/llm-client-architecture/index.html',
    color: '#18b7ab',
    phase: 4.8, speed: 0.92,
    relations: ['copilot-harness-eng', 'agentic-skill-exec', 'ai-mud-retro', 'mlx-optimization']
  },
  {
    id: 'agentic-skill-exec',
    parentId: 'ai-mud',
    type: 'article',
    title: {
      zh: '智能体技能执行架构设计实践',
      en: 'Agentic Skill Execution Design Practice'
    },
    summary: {
      zh: '在 AI-MUD 项目中，我们构建了由 7 个 AI 角色组成的智能体编排系统——导演台。本文记录了从同步工具调用到两阶段异步 Skill 编排的架构演进，以及 Agent 行为控制、记忆管理和角色分派的设计实践。',
      en: 'In the AI-MUD project, we built a 7-role AI agent orchestration system — the Director System. This article documents the architecture evolution from synchronous tool calls to two-phase async Skill orchestration, plus design practices for agent behavior control, memory management, and role dispatch.'
    },
    tags: ['AI Agent', 'Game Dev', 'Architecture'],
    date: '2026-04-09',
    url: 'posts/agentic-skill-execution/index.html',
    color: '#e8c34a',
    phase: 0, speed: 1.1,
    relations: ['enterprise-agent-arch', 'ai-mud-retro', 'mlx-optimization', 'llm-client-arch']
  },
  {
    id: 'ai-mud-retro',
    parentId: 'ai-mud',
    type: 'article',
    title: {
      zh: 'AI-MUD 项目回顾：产品级 Vibe Coding 实践',
      en: 'AI-MUD Project Retro: Product-Grade Vibe Coding'
    },
    summary: {
      zh: '经历 156+ 轮正式迭代、14 次代码审查和 17 个架构决策，回顾了如何在保持 Vibe Coding 敏捷性的同时实现产品级工程质量。分享门禁制度、归档规范和 AI Copilot 协作的实战经验。',
      en: 'With 156+ formal iterations, 14 code reviews, and 17 ADRs, this retrospective explores how to achieve product-grade engineering quality while maintaining vibe coding agility. Shares gate systems, archival standards, and hands-on AI Copilot collaboration experience.'
    },
    tags: ['Vibe Coding', 'Project Management', 'DevEx'],
    date: '2026-04-09',
    url: 'posts/ai-mud-project-retro/index.html',
    color: '#d4a83a',
    phase: 2.1, speed: 0.85,
    relations: ['copilot-harness-eng', 'agentic-skill-exec', 'mlx-optimization', 'llm-client-arch']
  },
  {
    id: 'mlx-optimization',
    parentId: 'ai-mud',
    type: 'article',
    title: {
      zh: 'Apple Silicon 上的 MLX 模型优化实践',
      en: 'MLX Model Optimization on Apple Silicon'
    },
    summary: {
      zh: '从零构建基于 MLX 框架的 FLUX 图像生成管线（Z-Image-Turbo），实现 23GB→6GB 的 4-bit 量化压缩。通过 mx.compile、分阶段内存释放和微服务隔离，使 16GB Mac 也能运行 6B 参数模型。',
      en: 'Built a FLUX image generation pipeline (Z-Image-Turbo) from scratch using Apple MLX framework, achieving 23GB→6GB memory via 4-bit quantization. Using mx.compile, phased memory release, and microservice isolation to enable 6B parameter models on 16GB Macs.'
    },
    tags: ['MLX', 'Apple Silicon', 'Model Optimization'],
    date: '2026-04-09',
    url: 'posts/mlx-model-optimization/index.html',
    color: '#c8962e',
    phase: 4.2, speed: 0.95,
    relations: ['agentic-skill-exec', 'ai-mud-retro', 'llm-client-arch']
  },

  // ════════════════════════════════════════
  // 文章 — Microsoft AI（直属）
  // ════════════════════════════════════════
  {
    id: 'ms-ai-customer-cases',
    parentId: 'microsoft-ai',
    type: 'article',
    title: {
      zh: 'Microsoft AI 客户案例全景：1000+ 企业转型故事',
      en: 'Microsoft AI Customer Cases: 1000+ Enterprise Transformation Stories'
    },
    summary: {
      zh: '基于 Microsoft Cloud Blog 精选代表性案例，按产品、行业、业务成果分类，涵盖客户痛点、解决方案、使用产品、量化收益与客户证言，支持交互式筛选与查询。',
      en: 'Curated customer cases from Microsoft Cloud Blog, categorized by product, industry, and business outcome. Covers pain points, solutions, products used, quantified benefits, and customer testimonials with interactive filtering.'
    },
    tags: ['Customer Cases', 'AI Transformation', 'Microsoft AI'],
    date: '2026-04-10',
    url: 'posts/microsoft-ai-customer-cases/index.html',
    color: '#ff7a00',
    phase: 4.5, speed: 0.78,
    relations: ['enterprise-agent-arch', 'agentic-ai-adoption']
  },

  {
    id: 'low-code-ai-era',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: '低代码的 AI 时代生死局：以 Power Apps 为例的演进分析',
      en: 'Low-Code in the AI Era: Evolution Analysis with Power Apps'
    },
    summary: {
      zh: '从低代码的原始初衷出发，分析"Low Code is Dead"争论的本质，以 Microsoft Power Apps 为案例追溯其四阶段演进路径（表单工具→应用平台→AI集成→Agent编排），提炼决定低代码平台存亡的六项关键属性，并给出竞品生态挑战与未来趋势预测。',
      en: 'Starting from the original promise of low-code, analyzes the essence of the "Low Code is Dead" debate, traces Power Apps through four evolution phases (form tool → app platform → AI integration → agent orchestration), distills six survival attributes for low-code platforms, and provides competitive landscape analysis with future trend predictions.'
    },
    tags: ['Low-Code', 'Power Apps', 'AI Era', 'Platform Strategy'],
    date: '2026-04-11',
    url: 'posts/low-code-ai-era/index.html',
    color: '#a855f7',
    phase: 3.8, speed: 0.82,
    relations: ['ms-ai-customer-cases', 'copilot-studio-overview', 'enterprise-agent-arch']
  },
  {
    id: 'powerapps-vibe-coding',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: 'Power Apps Vibe Coding：设计理念、双轨架构与竞品对比',
      en: 'Power Apps Vibe Coding: Design Philosophy, Dual-Track Architecture & Competitive Comparison'
    },
    summary: {
      zh: '分析 Microsoft 对 Vibe Coding 的双轨回应：浏览器端 Power Apps Vibe（Plan+Data+App 一体化）和 IDE 端 Canvas Apps MCP Authoring Plugin（GitHub Copilot CLI / Claude Code）。从设计理念（治理优先 vs 自由代码）、目标场景、工作流、与 Cursor/Bolt/Lovable 的六维度对比，以及 Code View 只读、仅英文、导出断连等关键限制进行系统分析。',
      en: 'Analyzes Microsoft\'s dual-track Vibe Coding response: browser-based Power Apps Vibe (Plan+Data+App unified) and IDE-based Canvas Apps MCP Authoring Plugin (GitHub Copilot CLI / Claude Code). Covers design philosophy (governance-first vs free code), target scenarios, workflows, six-dimension comparison with Cursor/Bolt/Lovable, and key limitations including read-only Code View, English-only, and export disconnection.'
    },
    tags: ['Vibe Coding', 'Power Apps', 'MCP', 'AI Development'],
    date: '2026-04-11',
    url: 'posts/powerapps-vibe-coding/index.html',
    color: '#9333ea',
    phase: 1.4, speed: 0.88,
    relations: ['low-code-ai-era', 'copilot-harness-eng']
  },

  // ════════════════════════════════════════
  // 文章 — Copilot Studio（挂在二级分组下）
  // ════════════════════════════════════════
  {
    id: 'copilot-studio-constraints',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Microsoft Copilot Studio 约束条件与工程边界',
      en: 'Microsoft Copilot Studio: Constraints & Engineering Boundaries'
    },
    summary: {
      zh: '系统整理 Copilot Studio 的配额（8,000 RPM / GenAI 50–100 RPM 阶梯）、硬限制（1,000 Topics、8,000 字符 Instructions、512MB 文件）、知识源约束（4–6h 同步、7MB 无许可限制）和 generative orchestration 已知限制，为企业 Agent 方案选型提供量化依据。',
      en: 'Systematically catalogs Copilot Studio quotas (8,000 RPM / GenAI 50–100 RPM tiered), hard limits (1,000 Topics, 8,000-char Instructions, 512MB files), knowledge source constraints (4–6h sync, 7MB unlicensed cap), and generative orchestration known limitations for enterprise agent solution design.'
    },
    tags: ['Copilot Studio', 'Platform Constraints', 'Enterprise Agent'],
    date: '2026-04-09',
    url: 'posts/copilot-studio-constraints/index.html',
    color: '#7c3aed',
    phase: 0, speed: 0.88,
    relations: ['enterprise-agent-arch', 'agentic-ai-adoption']
  },
  {
    id: 'copilot-studio-memory',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Copilot Studio 记忆管理机制：变量作用域、对话历史与知识检索',
      en: 'Copilot Studio Memory Management: Variable Scopes, Conversation History & Knowledge Retrieval'
    },
    summary: {
      zh: '系统整理 Copilot Studio Agent 的四层记忆机制：Topic 变量（单 Topic 作用域）、Global 变量（会话级，不跨会话持久化）、对话历史（orchestrator 有限窗口，大小未公开）和知识源检索（4–6h 同步，只读）。包含 5 项缺失能力的变通方案。',
      en: 'Catalogs four memory layers in Copilot Studio agents: Topic variables (single-topic scope), Global variables (session-scoped, no cross-session persistence), conversation history (limited orchestrator window, size undisclosed), and knowledge retrieval (4–6h sync, read-only). Includes workarounds for 5 missing capabilities.'
    },
    tags: ['Copilot Studio', 'Memory Management', 'State Architecture'],
    date: '2026-04-09',
    url: 'posts/copilot-studio-memory/index.html',
    color: '#9333ea',
    phase: 3.2, speed: 0.82,
    relations: ['copilot-studio-constraints']
  },
  {
    id: 'copilot-studio-overview',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Microsoft Copilot Studio：定位、能力、落地路径与费用',
      en: 'Microsoft Copilot Studio: Positioning, Capabilities, Adoption & Pricing'
    },
    summary: {
      zh: '从产品定位、核心能力（generative/classic orchestration、1,400+ connectors）、竞品对比（vs Azure Bot Service / M365 Copilot）、落地场景与 Copilot Credits 成本估算、安全治理（DLP / Purview / CMK）、快速启动 5 步和许可路径（试用 / 独立 / Teams / Pay-as-you-go）七个维度提供选型决策依据。',
      en: 'Covers seven decision dimensions: product positioning, core capabilities (generative/classic orchestration, 1,400+ connectors), comparison (vs Azure Bot Service / M365 Copilot), scenarios with Copilot Credits cost estimates, security governance (DLP / Purview / CMK), 5-step quickstart, and licensing paths (trial / standalone / Teams / Pay-as-you-go).'
    },
    tags: ['Copilot Studio', 'Platform Overview', 'Licensing'],
    date: '2026-04-09',
    url: 'posts/copilot-studio-overview/index.html',
    color: '#6d28d9',
    phase: 1.6, speed: 0.85,
    relations: ['copilot-studio-constraints', 'copilot-studio-memory']
  },

  // ════════════════════════════════════════
  // 文章 — AI 工程实践（项目设计文档）
  // ════════════════════════════════════════
  {
    id: 'study-room-design',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 设计文档：交互式知识图谱的架构与实现',
      en: 'Knowledge Hub Design Document: Architecture of an Interactive Knowledge Graph'
    },
    summary: {
      zh: '从设计目标、设计理念、设计思路、四层架构（展示 / 逻辑 / 数据 / 共享资源）、三模式渲染引擎（Galaxy / Cards / Infographic）、功能矩阵和项目量化指标（23,000+ 行代码、20 个知识节点、39 个标签）七个维度完整记录 Knowledge Hub 的零框架知识管理系统设计。',
      en: 'Comprehensive design document covering goals, philosophy, approach, four-layer architecture (Presentation / Logic / Data / Shared Assets), triple-mode rendering engine (Galaxy / Cards / Infographic), feature matrix, and quantitative metrics (23,000+ LOC, 20 knowledge nodes, 39 tags) of this zero-framework knowledge management system.'
    },
    tags: ['Design Document', 'Architecture', 'Knowledge Graph'],
    date: '2026-04-11',
    url: 'posts/study-room-design/index.html',
    color: '#0fb5ae',
    phase: 3.8, speed: 0.75,
    relations: ['copilot-harness-eng']
  },

  // ════════════════════════════════════════
  // 文章 — Knowledge Hub（治理与审查）
  // ════════════════════════════════════════
  {
    id: 'study-room-standards',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 内容治理规范：研究、撰写、布局与审核',
      en: 'Knowledge Hub Content Governance: Research, Writing, Layout & Audit Standards'
    },
    summary: {
      zh: '从研究选题、内容撰写、渐进式布局、组件使用、演示模式和质量审核六个维度，提炼 Knowledge Hub 项目的单一权威设计规范。涵盖 25+ 共享组件用法、密集内容拆分规则、accordion 总览步骤逻辑，以及基于 9 维度 ABCD 框架的审核标准。',
      en: 'Single authoritative design spec for Knowledge Hub across six dimensions: research, writing, progressive layout, component library, presentation mode, and quality audit. Covers 25+ shared component usage, dense content splitting rules, accordion overview step logic, and 9-dimension ABCD audit framework.'
    },
    tags: ['Design Standards', 'Content Governance', 'Knowledge Hub'],
    date: '2026-04-11',
    url: 'posts/study-room-standards/index.html',
    color: '#14b8a6',
    phase: 1.2, speed: 0.82,
    relations: ['study-room-design']
  },
  {
    id: 'study-room-review-2026q2',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 首次代码审查报告（2026-Q2）',
      en: 'Knowledge Hub Code Review #1 (2026-Q2)'
    },
    summary: {
      zh: '基于 9 维度 ABCD 评分框架，对 18 篇文章页、3,190 行首页代码、2,828 行共享 CSS 进行首次全面审查。总体评价 B+ 级：架构清晰、组件复用度高；主要风险集中在 JS 规范不一致（2 篇使用箭头函数）、双语覆盖不足（16/18 篇仅导航双语）、article.css 逼近膨胀红线。包含 7 项行动计划。',
      en: 'First comprehensive review of 18 article pages, 3,190-line homepage, and 2,828-line shared CSS using the 9-dimension ABCD framework. Overall grade: B+. Strong architecture and component reuse; key risks in JS convention violations (2 articles using arrow functions), bilingual coverage gap (16/18 articles navigation-only), and article.css approaching bloat threshold. Includes 7 action items.'
    },
    tags: ['Code Review', 'Quality Audit', 'Knowledge Hub'],
    date: '2026-04-11',
    url: 'posts/study-room-review-2026q2/index.html',
    color: '#0d8f8c',
    phase: 5.0, speed: 0.78,
    relations: ['study-room-standards', 'study-room-design']
  }
];

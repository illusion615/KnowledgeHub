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
      zh: '企业智能体作为现有应用之上的认知层，由 AI 驱动感知上下文、自主推理，通过自然语言意图协调 ERP、CRM 与业务 API 协同执行。',
      en: 'Enterprise agents form a cognitive layer above existing apps, using AI to perceive context, reason autonomously, and orchestrate ERP, CRM, and business APIs through natural language intent.'
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
      zh: '梳理企业导入 Agentic AI 的五级成熟度模型与五大能力支柱，规划从试点到规模化运营的落地节奏。',
      en: 'Maps the five maturity levels and capability pillars for enterprise agentic AI adoption, from pilot to scalable operations.'
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
      zh: '通过结构化约定文件、上下文框架和指令体系，在项目初期为 AI 编码助手建立持续演进的协作架构。',
      en: 'Establishes a continuously evolving collaboration architecture for AI coding assistants through structured conventions, context files, and instruction hierarchies.'
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
      zh: '梳理 GitHub Copilot 八大模块，与 Cursor、Windsurf、Claude Code 等竞品结构化对比，给出三层委托执行的人机协同最佳实践。',
      en: 'Overview of Copilot\'s 8 modules, structured competitive comparison, and best practices for the three-tier human-AI delegation model.'
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
      zh: '对比 GPT Image、Midjourney、SD/SDXL、FLUX.1 四种模型的提示词机制差异，提炼 SES、迭代精修、约束优先三种可复用模式。',
      en: 'Compares prompting mechanisms across 4 text-to-image models and distills 3 reusable patterns: SES, Iterative Refinement, and Constraint-First.'
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
      zh: '梳理 Hermes 开源模型系列（1→2→2 Pro→3）的 neutral alignment 理念、训练方法、function calling 协议与 GOAP 推理框架。',
      en: 'Overview of the Hermes model series covering neutral alignment, SFT+DPO training, function calling protocols, and GOAP reasoning.'
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
      zh: '基于 BFCL V4 数据，对比 109 个模型在 Agentic / Multi-Turn / Hallucination 维度的 function calling 表现，提供按场景选型指南。',
      en: 'Compares 109 models on function calling across Agentic/Multi-Turn/Hallucination dimensions using BFCL V4 data, with scenario-based selection guide.'
    },
    tags: ['Function Calling', 'LLM Benchmark', 'AI Agent', 'Tool Use'],
    date: '2026-04-11',
    url: 'posts/function-calling-landscape/index.html',
    color: '#0ea5e9',
    phase: 0.8, speed: 0.88,
    relations: ['hermes-open-model', 'enterprise-agent-arch', 'agentic-skill-exec']
  },
  {
    id: 'fc-best-practices',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'Function Calling 工程实践指南：最佳实践、模型差异与避坑手册',
      en: 'Function Calling Engineering Guide: Best Practices, Model Differences & Pitfalls'
    },
    summary: {
      zh: '基于生产经验总结 function calling 工程实践：schema 设计、错误处理、模型间差异对比和常见陷阱与解法。',
      en: 'Production-tested function calling practices: schema design, error handling, cross-model differences, and common pitfalls with solutions.'
    },
    tags: ['Function Calling', 'Best Practices', 'AI Engineering'],
    date: '2026-04-16',
    url: 'posts/function-calling-best-practices/index.html',
    color: '#0ea5e9',
    phase: 1.6, speed: 0.88,
    relations: ['fc-landscape', 'enterprise-agent-arch']
  },
  {
    id: 'llm-literary-creation',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'LLM 文学创作可行性研究：最新模型格局、商业案例与经营逻辑',
      en: 'LLM Literary Creation Feasibility: Model Landscape, Cases & Business Logic'
    },
    summary: {
      zh: '以 2025-2026 最新模型、专项 benchmark 与 8 个商业案例为基线，分析 LLM 文学创作的结构性短板、模型分工和 AI 写作生意的经营逻辑。',
      en: 'Uses 2025-2026 model docs, specialized benchmarks, and 8 business cases to analyze structural limits, model specialization, and the business logic of AI writing.'
    },
    tags: ['LLM', 'Creative Writing', 'Model Landscape', 'Business Cases'],
    date: '2026-04-15',
    url: 'posts/llm-literary-creation/index.html',
    color: '#0ea5e9',
    phase: 1.6, speed: 0.86,
    relations: ['text-to-image-prompting', 'hermes-open-model']
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
      zh: '分析 claw-code 开源项目的三层协作架构、9 crate Rust 工作区、40 个工具规格和从 CLI 到原生运行时的五阶段路线。',
      en: 'Analyzes claw-code\'s three-layer architecture, 9-crate Rust workspace, 40 tool specs, and five-phase roadmap from CLI to native runtime.'
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
      zh: '将 1905 行单体 llm_client 重构为 Role API / Dispatch / Provider 分离的多 Provider 架构，补上熔断与连接池复用机制。',
      en: 'Refactors a 1905-line monolithic client into multi-provider architecture with separated Role API, dispatch, circuit breakers, and connection pooling.'
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
      zh: '记录 AI-MUD 导演台从同步工具调用到两阶段异步 Skill 编排的架构演进，涵盖行为控制、记忆管理和角色分派。',
      en: 'Documents the Director System\'s evolution from sync tool calls to two-phase async Skill orchestration, covering behavior control and memory management.'
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
      zh: '回顾 156+ 轮迭代、14 次代码审查和 17 个架构决策，分享 Vibe Coding 与产品级工程质量兼顾的实战经验。',
      en: 'Retrospective on 156+ iterations, 14 code reviews, and 17 ADRs — balancing vibe coding agility with product-grade engineering quality.'
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
      zh: '基于 MLX 框架构建 FLUX 图像管线，实现 23GB→6GB 的 4-bit 量化，通过分阶段内存释放使 16GB Mac 运行 6B 模型。',
      en: 'Built a FLUX pipeline on MLX with 4-bit quantization (23GB→6GB), enabling 6B models on 16GB Macs via phased memory release.'
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
      zh: '精选 Microsoft Cloud Blog 代表性案例，按产品、行业、业务成果分类，涵盖痛点、方案、量化收益，支持交互式筛选。',
      en: 'Curated Microsoft AI customer cases by product, industry, and outcomes, with pain points, solutions, and interactive filtering.'
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
      zh: '以 Power Apps 为案例追溯低代码四阶段演进（表单→平台→AI→Agent），提炼决定平台存亡的六项关键属性与趋势预测。',
      en: 'Traces low-code evolution through four phases using Power Apps, distilling six survival attributes and future trend predictions.'
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
      zh: '分析 Microsoft Vibe Coding 双轨方案：浏览器端 Power Apps Vibe 和 IDE 端 MCP Plugin，与 Cursor/Bolt/Lovable 做六维对比。',
      en: 'Analyzes Microsoft\'s dual-track Vibe Coding: browser-based Power Apps Vibe and IDE-based MCP Plugin, with six-dimension competitive comparison.'
    },
    tags: ['Vibe Coding', 'Power Apps', 'MCP', 'AI Development'],
    date: '2026-04-11',
    url: 'posts/powerapps-vibe-coding/index.html',
    color: '#9333ea',
    phase: 1.4, speed: 0.88,
    relations: ['low-code-ai-era', 'copilot-harness-eng']
  },
  {
    id: 'dataverse-security-roles',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: 'Dataverse Security Role 完全指南：概念、预定义角色与最佳实践',
      en: 'Dataverse Security Role Guide: Concepts, Predefined Roles & Best Practices'
    },
    summary: {
      zh: '系统梳理 Dataverse 安全角色体系：核心概念、9 个预定义角色权限矩阵、角色分配策略和生产环境最佳实践。',
      en: 'Comprehensive guide to Dataverse security roles: concepts, 9 predefined role permission matrices, assignment strategies, and production best practices.'
    },
    tags: ['Dataverse', 'Security', 'Power Platform', 'RBAC'],
    date: '2026-04-16',
    url: 'posts/dataverse-security-roles/index.html',
    color: '#a855f7',
    phase: 2.4, speed: 0.82,
    relations: ['low-code-ai-era']
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
      zh: '整理 Copilot Studio 的 RPM 配额、Topics/Instructions 硬限制、知识源同步约束和 generative orchestration 已知限制。',
      en: 'Catalogs Copilot Studio quotas, hard limits on Topics/Instructions, knowledge source sync constraints, and orchestration limitations.'
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
      zh: '整理 Copilot Studio 四层记忆机制：Topic 变量、Global 变量、对话历史和知识检索，包含 5 项缺失能力的变通方案。',
      en: 'Catalogs four memory layers in Copilot Studio agents with workarounds for 5 missing capabilities across variables, history, and retrieval.'
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
      zh: '从定位、能力、竞品对比、成本估算、安全治理、快速启动和许可路径七个维度提供 Copilot Studio 选型决策依据。',
      en: 'Decision guide across 7 dimensions: positioning, capabilities, comparison, cost, governance, quickstart, and licensing.'
    },
    tags: ['Copilot Studio', 'Platform Overview', 'Licensing'],
    date: '2026-04-09',
    url: 'posts/copilot-studio-overview/index.html',
    color: '#6d28d9',
    phase: 1.6, speed: 0.85,
    relations: ['copilot-studio-constraints', 'copilot-studio-memory']
  },
  {
    id: 'copilot-studio-vs-agent-sdk',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Copilot Studio 与 Agents SDK：产品定位、协作关系与场景选型',
      en: 'Copilot Studio vs Agents SDK: Positioning, Relationship & Scenario Selection'
    },
    summary: {
      zh: '基于官方文档对比 Copilot Studio（低代码）与 M365 Agents SDK（Pro-code）的职责边界、协作模式和六个场景选型依据。',
      en: 'Compares Copilot Studio (low-code) with M365 Agents SDK (pro-code) on scope, collaboration, and 6 scenario-based selection criteria.'
    },
    tags: ['Copilot Studio', 'Agent SDK', 'Architecture Decision', 'Foundry'],
    date: '2026-04-16',
    url: 'posts/copilot-studio-vs-agent-sdk/index.html',
    color: '#7c3aed',
    phase: 4.8, speed: 0.80,
    relations: ['copilot-studio-overview', 'copilot-studio-constraints', 'enterprise-agent-arch']
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
      zh: '完整记录 Knowledge Hub 的设计目标、四层架构、四种首页布局、研究到发布工作流和量化指标。',
      en: 'Full design document covering goals, four-layer architecture, four homepage layouts, research-to-publish workflow, and quantitative metrics.'
    },
    tags: ['Design Document', 'Architecture', 'Knowledge Graph'],
    date: '2026-04-11',
    url: 'posts/study-room-design/index.html',
    color: '#0fb5ae',
    phase: 3.8, speed: 0.75,
    relations: ['copilot-harness-eng', 'presentation-narration-design']
  },
  {
    id: 'presentation-narration-design',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: '演示模式自动讲解：LLM Narrative 生成与语音合成设计',
      en: 'Presentation Auto-Narrate: LLM Narrative Generation & Speech Synthesis Design'
    },
    summary: {
      zh: '为演示模式增加 LLM 驱动的自动讲解，含四层架构、状态机、Look-ahead pipeline 和 Web Speech API 集成。',
      en: 'Adds LLM-driven auto-narration to presentation mode with four-layer architecture, state machine, look-ahead pipeline, and Web Speech API.'
    },
    tags: ['Design Document', 'Presentation', 'LLM', 'Speech'],
    date: '2026-04-14',
    url: 'posts/presentation-narration-design/index.html',
    color: '#7c3aed',
    phase: 4.5, speed: 0.7,
    relations: ['study-room-design']
  },
  {
    id: 'markdown-rendering-pipeline',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: 'Markdown 渲染管线：内容与展现解耦',
      en: 'Markdown Rendering Pipeline: Decoupling Content from Presentation'
    },
    summary: {
      zh: '提出从纯 HTML 向 Markdown 渲染管线演进的方案：三阶段路线图、技术选型对比和渐进式迁移策略。',
      en: 'Proposes evolving from pure HTML to a Markdown rendering pipeline: three-phase roadmap, tech comparison, and incremental migration strategy.'
    },
    tags: ['Architecture', 'Markdown', 'Content Pipeline', 'Knowledge Hub'],
    date: '2026-04-16',
    url: 'posts/markdown-rendering-pipeline/index.html',
    color: '#0fb5ae',
    phase: 2.8, speed: 0.75,
    relations: ['study-room-design', 'study-room-standards']
  },

  // ════════════════════════════════════════
  // 二级分组 — Knowledge Hub 审查报告
  // ════════════════════════════════════════
  {
    id: 'knowledge-hub-reviews',
    parentId: 'knowledge-hub',
    type: 'topic',
    label: { zh: '审查报告', en: 'Review Reports' },
    color: '#0d8f8c',
    phase: 5.0, speed: 0.82
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
      zh: '涵盖研究、撰写、首页模块架构、布局组件、演示和审核七个维度的单一权威设计规范（v1.1）。',
      en: 'Authoritative spec v1.1 covering research, writing, homepage modules, layout components, presentation, and audit standards.'
    },
    tags: ['Design Standards', 'Content Governance', 'Knowledge Hub'],
    date: '2026-04-13',
    url: 'posts/study-room-standards/index.html',
    color: '#14b8a6',
    phase: 1.2, speed: 0.82,
    relations: ['study-room-design']
  },
  {
    id: 'study-room-review-2026q2',
    parentId: 'knowledge-hub-reviews',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 首次代码审查报告（2026-Q2）',
      en: 'Knowledge Hub Code Review #1 (2026-Q2)'
    },
    summary: {
      zh: '基于 9 维度 ABCD 框架对 18 篇文章和首页代码进行全面审查，总体 B+ 级，附 7 项行动计划。',
      en: 'Comprehensive B+ review of 18 articles and homepage using the 9-dimension ABCD framework, with 7 action items.'
    },
    tags: ['Code Review', 'Quality Audit', 'Knowledge Hub'],
    date: '2026-04-11',
    url: 'posts/study-room-review-2026q2/index.html',
    color: '#0d8f8c',
    phase: 5.0, speed: 0.78,
    relations: ['study-room-standards', 'study-room-design']
  },
  {
    id: 'architecture-review-2026-0415',
    parentId: 'knowledge-hub-reviews',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 周期架构复盘（2026-04-15）',
      en: 'Knowledge Hub Periodic Architecture Review (2026-04-15)'
    },
    summary: {
      zh: '第二次 9 维度审查：40 篇文章、演示脚本 +64.3% 膨胀、CSS 突破红线，综合 C+，含拆分方案与 7 项行动计划。',
      en: 'Second 9-dimension review: 40 articles, presentation script +64.3% bloat, CSS past red line, overall C+, with split plan and 7 action items.'
    },
    tags: ['Architecture Review', 'Code Review', 'Knowledge Hub'],
    date: '2026-04-15',
    url: 'posts/architecture-review-2026-0415/index.html',
    color: '#0d8f8c',
    phase: 1.5, speed: 0.80,
    relations: ['study-room-review-2026q2', 'homepage-architecture-review', 'study-room-standards']
  },
  {
    id: 'knowledge-graph-org',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: '知识图谱组织方案研究：六种范式的理论基础、实现逻辑与对比分析',
      en: 'Knowledge Graph Organization Research: Theoretical Foundations, Implementation & Comparison of Six Paradigms'
    },
    summary: {
      zh: '基于认知科学与信息可视化理论，对比层级树、概念图等六种知识组织范式，制定三阶段混合架构演进路线。',
      en: 'Compares six knowledge organization paradigms grounded in cognitive science, with a three-phase hybrid architecture roadmap.'
    },
    tags: ['Knowledge Graph', 'Information Visualization', 'Knowledge Organization', 'Architecture'],
    date: '2026-04-12',
    url: 'posts/knowledge-graph-organization/index.html',
    color: '#14b8a6',
    phase: 0.5, speed: 0.80,
    relations: ['study-room-design', 'study-room-standards', 'study-room-review-2026q2']
  },
  {
    id: 'homepage-architecture-review',
    parentId: 'knowledge-hub-reviews',
    type: 'article',
    title: {
      zh: '首页 index.html 架构审查报告',
      en: 'Homepage index.html Architecture Review'
    },
    summary: {
      zh: '对 5,608 行首页深度架构审查：4 种布局耦合分析、2 个上帝函数拆分方案、模块化重构路线图。',
      en: 'Deep architecture review of the 5,608-line homepage: coupling analysis across 4 layouts, god-function splits, and modular refactoring roadmap.'
    },
    tags: ['Architecture Review', 'Code Review', 'Knowledge Hub', 'Refactoring'],
    date: '2026-04-13',
    url: 'posts/homepage-architecture-review/index.html',
    color: '#0d8f8c',
    phase: 3.8, speed: 0.78,
    relations: ['study-room-review-2026q2', 'study-room-design', 'study-room-standards']
  },

  // ════════════════════════════════════════
  // 二级分组 — AI 时事雷达（定期刊物）
  // ════════════════════════════════════════
  {
    id: 'ai-radar',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: 'AI 时事雷达', en: 'AI Radar' },
    color: '#e11d48',
    phase: 4.5, speed: 0.82
  },

  // ════════════════════════════════════════
  // 文章 — AI 时事雷达 2026W15
  // ════════════════════════════════════════
  // ════════════════════════════════════════
  // 根节点 — 升学规划
  // ════════════════════════════════════════
  {
    id: 'education-planning',
    parentId: null,
    type: 'topic',
    label: { zh: '教育', en: 'Education' },
    color: '#e11d48',
    orbitIndex: 3, phase: 3.8, speed: 0.48,
    hidden: true
  },
  {
    id: 'edu-fundamentals',
    parentId: 'education-planning',
    type: 'topic',
    label: { zh: '基础理论', en: 'Fundamentals' },
    color: '#f43f5e',
    phase: 0.2, speed: 0.88
  },
  {
    id: 'edu-calculus',
    parentId: 'edu-fundamentals',
    type: 'topic',
    label: { zh: '微积分', en: 'Calculus' },
    color: '#fb7185',
    phase: 0.3, speed: 0.9
  },

  // ════════════════════════════════════════
  // 微积分系列文章（5 篇）
  // ════════════════════════════════════════
  {
    id: 'calculus-intro-change',
    parentId: 'edu-calculus',
    type: 'article',
    title: {
      zh: '变化的语言：从速度表到微积分',
      en: 'The Language of Change: From Speedometers to Calculus'
    },
    summary: {
      zh: '以手机电量、冰淇淋融化、骑车上学等日常场景引入"变化率"概念，揭示代数的局限与微积分的必要性。',
      en: 'Introduces the concept of rate of change through everyday scenarios, revealing why algebra falls short and calculus is needed.'
    },
    tags: ['Calculus', 'Rate of Change', 'Introduction'],
    date: '2026-04-14',
    url: 'posts/calculus-intro-change/index.html',
    color: '#fb7185',
    phase: 0.2, speed: 0.92,
    relations: ['calculus-limits']
  },
  {
    id: 'calculus-limits',
    parentId: 'edu-calculus',
    type: 'article',
    title: {
      zh: '逼近的艺术：极限思想入门',
      en: 'The Art of Approaching: Introduction to Limits'
    },
    summary: {
      zh: '通过芝诺悖论、无穷级数和相机变焦类比，建立"无限逼近可以得到精确结果"的极限直觉。',
      en: 'Builds limit intuition through Zeno\'s paradox, infinite series, and camera zoom analogies.'
    },
    tags: ['Calculus', 'Limits', 'Infinity'],
    date: '2026-04-14',
    url: 'posts/calculus-limits/index.html',
    color: '#fb7185',
    phase: 1.0, speed: 0.90,
    relations: ['calculus-intro-change', 'calculus-derivatives']
  },
  {
    id: 'calculus-derivatives',
    parentId: 'edu-calculus',
    type: 'article',
    title: {
      zh: '导数：捕捉瞬间的变化率',
      en: 'Derivatives: Capturing Instantaneous Rate of Change'
    },
    summary: {
      zh: '从割线到切线、从平均速度到瞬时速度，用过山车和无人机案例讲解导数的几何与物理意义。',
      en: 'From secant to tangent lines, explains derivatives through roller coaster and drone examples.'
    },
    tags: ['Calculus', 'Derivatives', 'Tangent Line'],
    date: '2026-04-14',
    url: 'posts/calculus-derivatives/index.html',
    color: '#fb7185',
    phase: 1.8, speed: 0.88,
    relations: ['calculus-limits', 'calculus-integrals']
  },
  {
    id: 'calculus-integrals',
    parentId: 'edu-calculus',
    type: 'article',
    title: {
      zh: '积分：化零为整的累积术',
      en: 'Integrals: The Art of Accumulation'
    },
    summary: {
      zh: '用切片求和思想理解积分，从 GPS 里程到降雨量累计，展示"曲线下面积"的广泛应用。',
      en: 'Explains integrals through slice-and-sum thinking, from GPS mileage to rainfall accumulation.'
    },
    tags: ['Calculus', 'Integrals', 'Riemann Sum'],
    date: '2026-04-14',
    url: 'posts/calculus-integrals/index.html',
    color: '#fb7185',
    phase: 2.6, speed: 0.86,
    relations: ['calculus-derivatives', 'calculus-fundamental-theorem']
  },
  {
    id: 'calculus-fundamental-theorem',
    parentId: 'edu-calculus',
    type: 'article',
    title: {
      zh: '微积分基本定理：最优美的数学联系',
      en: 'The Fundamental Theorem of Calculus: The Most Beautiful Connection'
    },
    summary: {
      zh: '揭示导数与积分的互逆关系，用水箱、过山车设计等案例展示基本定理如何统一微积分并驱动现代工程。',
      en: 'Reveals the inverse relationship between derivatives and integrals, showing how the theorem unifies calculus and powers engineering.'
    },
    tags: ['Calculus', 'Fundamental Theorem', 'Newton', 'Leibniz'],
    date: '2026-04-14',
    url: 'posts/calculus-fundamental-theorem/index.html',
    color: '#fb7185',
    phase: 3.4, speed: 0.84,
    relations: ['calculus-integrals', 'calculus-derivatives']
  },

  {
    id: 'edu-linear-algebra',
    parentId: 'edu-fundamentals',
    type: 'topic',
    label: { zh: '线性代数', en: 'Linear Algebra' },
    color: '#e11d48',
    phase: 1.6, speed: 0.88
  },
  {
    id: 'edu-machine-learning',
    parentId: 'edu-fundamentals',
    type: 'topic',
    label: { zh: '机器学习', en: 'Machine Learning' },
    color: '#be123c',
    phase: 3.0, speed: 0.86
  },
  {
    id: 'edu-subject',
    parentId: 'education-planning',
    type: 'topic',
    label: { zh: '学科教育', en: 'Subject Education' },
    color: '#dc2626',
    phase: 1.8, speed: 0.85
  },
  {
    id: 'shanghai-zhongkao',
    parentId: 'edu-subject',
    type: 'topic',
    label: { zh: '上海中考', en: 'Shanghai Zhongkao' },
    color: '#dc2626',
    phase: 0.8, speed: 0.85
  },

  // ════════════════════════════════════════
  // 文章 — 上海中考志愿填报策略
  // ════════════════════════════════════════
  {
    id: 'zhongkao-volunteer-strategy',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海中考志愿填报策略：建平地杰考生冲击四校的路径规划',
      en: 'Shanghai Zhongkao Volunteer Strategy: Path Planning for Jianping Dijie Students Targeting Top 4 Schools'
    },
    summary: {
      zh: '基于建平地杰年级前 20 考生情况，分析四条录取路径策略，提供分数预测、志愿排列和风险对冲建议。',
      en: 'Analyzes four admission pathways for a top-20 Jianping Dijie student, with score predictions, volunteer planning, and risk hedging.'
    },
    tags: ['中考', '志愿填报', '四校', '策略规划'],
    date: '2026-04-12',
    url: 'posts/zhongkao-volunteer-strategy/index.html',
    color: '#dc2626',
    phase: 0.4, speed: 0.9,
    relations: ['zhongkao-policy-data']
  },
  {
    id: 'zhongkao-policy-data',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海中考政策解读与四校录取数据分析（2022–2025）',
      en: 'Shanghai Zhongkao Policy Analysis & Top 4 Schools Admission Data (2022–2025)'
    },
    summary: {
      zh: '梳理 2022 新中考改革后招录制度，汇总四校 2022–2025 各批次分数线与浦东名额分配数据，提供量化决策依据。',
      en: 'Reviews post-2022 reformed admission system with Top 4 schools score data (2022–2025) and Pudong quota statistics.'
    },
    tags: ['中考', '四校', '录取数据', '政策分析'],
    date: '2026-04-12',
    url: 'posts/zhongkao-policy-data/index.html',
    color: '#f43f5e',
    phase: 2.6, speed: 0.86,
    relations: ['zhongkao-volunteer-strategy', 'four-schools-profile']
  },
  {
    id: 'four-schools-profile',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海四校及分校全景画像：特色、升学、学风与资源深度对比',
      en: 'Shanghai Top 4 Schools & Branch Campuses: Academics, Culture & Resources Deep Dive'
    },
    summary: {
      zh: '从学术、高考、竞赛、学风、大学资源和设施六维度画像四校本部及 10 所分校，含性格适配指南。',
      en: 'Profiles 4 top schools and 10 branches across 6 dimensions with personality-school matching guide.'
    },
    tags: ['中考', '四校', '学校画像', '择校'],
    date: '2026-04-12',
    url: 'posts/four-schools-profile/index.html',
    color: '#e11d48',
    phase: 4.8, speed: 0.82,
    relations: ['zhongkao-volunteer-strategy', 'zhongkao-policy-data']
  },

  {
    id: 'ai-radar-2026w15',
    parentId: 'ai-radar',
    type: 'article',
    title: {
      zh: 'AI 时事雷达 2026W15：本周最值得关注的 20 件 AI 大事',
      en: 'AI Radar 2026W15: Top 20 AI Events This Week'
    },
    summary: {
      zh: '覆盖 2026 年 4 月上半月 20 件 AI 大事：模型发布、Agent 生态冲突、治理挑战与安全伦理，附分析和行动建议。',
      en: 'Top 20 AI events from early April 2026 covering model releases, agent conflicts, governance, and safety, with analysis and recommendations.'
    },
    tags: ['AI Radar', 'Weekly', 'Industry Analysis'],
    date: '2026-04-12',
    url: 'posts/ai-radar-2026w15/index.html',
    color: '#0d8f8c',
    phase: 4.5, speed: 0.85,
    relations: ['enterprise-agent-arch', 'hermes-open-model']
  },

  {
    id: 'ai-radar-2026w16',
    parentId: 'ai-radar',
    type: 'article',
    title: {
      zh: 'AI 时事雷达 2026W16：Agent 平台化加速、模型性能争议与治理落地',
      en: 'AI Radar 2026W16: Agent Platformization, Model Quality Concerns & Governance Data'
    },
    summary: {
      zh: '覆盖 2026 年 4 月第三周 16 件 AI 大事：Agent 平台化四方混战、Claude 变蠢争议、Stanford HAI 报告揭示中美差距收窄至 2.7%。',
      en: '16 AI events from mid-April 2026: agent platformization race, Claude quality concerns, Stanford HAI report showing US-China gap narrowing to 2.7%.'
    },
    tags: ['AI Radar', 'Weekly', 'Industry Analysis'],
    date: '2026-04-16',
    url: 'posts/ai-radar-2026w16/index.html',
    color: '#0d8f8c',
    phase: 5.0, speed: 0.85,
    relations: ['ai-radar-2026w15', 'enterprise-agent-arch']
  },

  // ════════════════════════════════════════
  // 文章 — LLM 百科全书
  // ════════════════════════════════════════
  {
    id: 'llm-wiki',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'LLM 百科全书：大语言模型关键概念、架构与生态系统全景',
      en: 'LLM Wiki: Key Concepts, Architectures & Ecosystem of Large Language Models'
    },
    summary: {
      zh: '全景梳理 LLM 核心架构、训练范式、八大模型家族、四大能力、推理优化与评测体系，附 2017–2025 演进时间线。',
      en: 'Comprehensive LLM overview: architectures, training, 8 model families, 4 capabilities, inference optimization, and evaluation benchmarks.'
    },
    tags: ['LLM', 'Transformer', 'Model Architecture', 'Training', 'Inference'],
    date: '2026-04-13',
    url: 'posts/llm-wiki/index.html',
    color: '#0ea5e9',
    phase: 2.2, speed: 0.84,
    relations: ['hermes-open-model', 'fc-landscape', 'mlx-optimization']
  },
  {
    id: 'm4-max-local-models',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'MacBook Pro M4 Max 64GB 本地模型部署选型：LLM、图像、视频、语音与音乐生成全景',
      en: 'MacBook Pro M4 Max 64GB Local Model Deployment: LLM, Image, Video, Speech & Music Stack'
    },
    summary: {
      zh: '系统比较 M4 Max 64GB 上本地 LLM、文生图、视频、语音与音乐生成方案，按内存和兼容性给出组合建议。',
      en: 'Compares local AI stacks for M4 Max 64GB across LLM, image, video, speech, and music with Apple Silicon recommendations.'
    },
    tags: ['Apple Silicon', 'Local AI', 'Model Selection', 'MLX'],
    date: '2026-04-12',
    url: 'posts/m4-max-local-models/index.html',
    color: '#38bdf8',
    phase: 4.9, speed: 0.86,
    relations: ['mlx-optimization', 'llm-wiki', 'fc-landscape', 'text-to-image-prompting']
  },

  // ════════════════════════════════════════
  // 文章 — Hermes Agent 框架深度研究
  // ════════════════════════════════════════
  {
    id: 'hermes-agent-comparison',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'Hermes Agent：自进化开源 AI Agent 框架与同类产品对比',
      en: 'Hermes Agent: Self-Evolving Open-Source AI Agent Framework vs Claude Code, Codex CLI & Aider'
    },
    summary: {
      zh: '剖析 Hermes Agent 的持久记忆、自动技能创建和并行子代理能力，与 Claude Code、Codex CLI、Aider 做 15 维对比。',
      en: 'Analyzes Hermes Agent\'s core capabilities with a 15-dimension comparison against Claude Code, Codex CLI, and Aider.'
    },
    tags: ['Agent Framework', 'Hermes Agent', 'Claude Code', 'Codex', 'Aider'],
    date: '2026-04-13',
    url: 'posts/hermes-agent-comparison/index.html',
    color: '#f97316',
    phase: 1.8, speed: 0.88,
    relations: ['hermes-open-model', 'enterprise-agent-arch', 'agentic-skill-exec']
  },

  // ════════════════════════════════════════
  // 文章 — LLM Wiki 个人知识管理
  // ════════════════════════════════════════
  {
    id: 'llm-wiki-pkm',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'LLM Wiki：用大模型构建持续进化的个人知识库',
      en: 'LLM Wiki: Building a Continuously Evolving Personal Knowledge Base with LLMs'
    },
    summary: {
      zh: '分析 Karpathy 提出的 LLM Wiki 模式：三层架构、三种操作、六大场景，以及“第二大脑 vs 研究索引”的核心争议。',
      en: 'Analyzes Karpathy\'s LLM Wiki pattern: three-layer architecture, three operations, six scenarios, and the second brain vs research index debate.'
    },
    tags: ['LLM Wiki', 'PKM', 'Knowledge Management', 'Karpathy'],
    date: '2026-04-13',
    url: 'posts/llm-wiki-pkm/index.html',
    color: '#f97316',
    phase: 4.6, speed: 0.88,
    relations: ['enterprise-agent-arch', 'copilot-harness-eng', 'knowledge-graph-org']
  },

  // ════════════════════════════════════════
  // 文章 — Progressive Disclosure 设计原理
  // ════════════════════════════════════════
  {
    id: 'progressive-disclosure',
    parentId: 'knowledge-hub',
    type: 'article',
    title: {
      zh: 'Progressive Disclosure：作为设计哲学的渐进呈现',
      en: 'Progressive Disclosure: A Design Philosophy Beyond UI Controls'
    },
    summary: {
      zh: '从认知哲学、信息架构、产品策略、叙事教育到 UI 控件五个层次解析渐进呈现，附六种模式和反模式分析。',
      en: 'Explores progressive disclosure across five layers: cognitive philosophy, information architecture, product strategy, narrative design, and UI controls.'
    },
    tags: ['Progressive Disclosure', 'Interaction Design', 'Cognitive Science', 'UX'],
    date: '2026-04-14',
    url: 'posts/progressive-disclosure/index.html',
    color: '#14b8a6',
    phase: 2.8, speed: 0.82,
    relations: ['study-room-design', 'knowledge-graph-org', 'study-room-standards']
  }
];

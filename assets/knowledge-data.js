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
    id: 'ai-industry-watch',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: 'AI 时事雷达', en: 'AI News Radar' },
    color: '#38bdf8',
    phase: 2.0, speed: 0.87
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
    id: 'fc-agentic',
    parentId: 'ai-engineering-practice',
    type: 'topic',
    label: { zh: 'Function Calling & Agentic', en: 'Function Calling & Agentic' },
    color: '#6366f1',
    phase: 4.5, speed: 0.84
  },
  {
    id: 'claw-code',
    parentId: 'ai-research-agent',
    type: 'topic',
    label: { zh: 'Claw Code', en: 'Claw Code' },
    color: '#fb923c',
    phase: 2.5, speed: 0.84
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
    id: 'power-platform',
    parentId: 'microsoft-ai',
    type: 'topic',
    label: { zh: 'Power Platform', en: 'Power Platform' },
    color: '#8b5cf6',
    phase: 3.9, speed: 0.84
  },
  {
    id: 'business-ai-solution',
    parentId: 'microsoft-ai',
    type: 'topic',
    label: { zh: 'Business AI Solution', en: 'Business AI Solution' },
    color: '#a855f7',
    phase: 5.0, speed: 0.84
  },
  {
    id: 'agentic-crm-solution',
    parentId: 'business-ai-solution',
    type: 'topic',
    label: { zh: 'Agentic CRM Solution', en: 'Agentic CRM Solution' },
    color: '#b56cf5',
    phase: 5.1, speed: 0.85
  },
  {
    id: 'agentic-crm',
    parentId: 'agentic-crm-solution',
    type: 'topic',
    label: { zh: 'Agentic Sales', en: 'Agentic Sales' },
    color: '#c084fc',
    phase: 5.2, speed: 0.86
  },
  {
    id: 'agentic-service',
    parentId: 'agentic-crm-solution',
    type: 'topic',
    label: { zh: 'Agentic Service', en: 'Agentic Service' },
    color: '#818cf8',
    phase: 5.3, speed: 0.86
  },
  {
    id: 'agentic-service-mobile',
    parentId: 'agentic-crm-solution',
    type: 'topic',
    label: { zh: 'Agentic Field Service', en: 'Agentic Field Service' },
    color: '#60a5fa',
    phase: 5.4, speed: 0.86
  },
  {
    id: 'industry-solution',
    parentId: 'business-ai-solution',
    type: 'topic',
    label: { zh: 'Industry Solution', en: 'Industry Solution' },
    color: '#d8b4fe',
    phase: 5.4, speed: 0.85
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
  // 文章 — Business AI Solution
  // ════════════════════════════════════════
  {
    id: 'evidence-grounded-rfp-review',
    parentId: 'business-ai-solution',
    type: 'article',
    title: {
      zh: 'Evidence-Grounded RFP Review：可追溯的企业招标文件智能审查方案',
      en: 'Evidence-Grounded RFP Review: An Auditable Enterprise Solution'
    },
    summary: {
      zh: '面向客户的 RFP 智能审查方案：业务挑战、目标收益、架构组件、产品配置与实施路线。',
      en: 'A customer-ready RFP review solution covering challenges, outcomes, architecture, products, benefits, and delivery.'
    },
    tags: ['RFP Review', 'Power Apps', 'Copilot Studio', 'Copilot Studio Workflow', 'Dataverse', 'SharePoint', 'Human-in-the-Loop', 'Document Intelligence'],
    date: '2026-07-29',
    url: 'posts/evidence-grounded-rfp-review/index.html',
    color: '#a855f7',
    phase: 0.42, speed: 0.88,
    relations: ['agentic-business-process-platform', 'power-platform-governance', 'dataverse-intelligence', 'copilot-studio-overview']
  },

  {
    id: 'agentic-business-process-platform',
    parentId: 'business-ai-solution',
    type: 'article',
    title: {
      zh: 'Agentic Business Process Platform：基于 Copilot Studio 的企业审批 Agent 平台',
      en: 'Agentic Business Process Platform: Approval Agents on Copilot Studio'
    },
    summary: {
      zh: '以 Source Adapter 对接可改造与不可改造业务系统，结合 Copilot Studio Workflow 统一审批，提供接入矩阵、架构、容量、SKU 与 ROI 评估。',
      en: 'Connects extensible and fixed systems through source adapters, then unifies approvals with Copilot Studio Workflows, integration sizing, pricing, and ROI.'
    },
    tags: ['Copilot Studio', 'Copilot Studio Workflows', 'Source Integration', 'Desktop Flows', 'Power Pages', 'Human-in-the-Loop', 'Approvals', 'Dataverse', 'Business Process'],
    date: '2026-07-27',
    url: 'posts/agentic-business-process-platform/index.html',
    color: '#a855f7',
    phase: 0.44, speed: 0.87,
    relations: ['power-platform-governance', 'power-platform-pricing-quote-tool', 'dataverse-intelligence', 'agentic-crm-business-cycle']
  },

  {
    id: 'agentic-crm-business-cycle',
    parentId: 'agentic-crm-solution',
    type: 'article',
    title: {
      zh: 'Agentic CRM：重构 AI 时代的客户经营',
      en: 'Agentic CRM: Reinventing Customer Operations for the AI Era'
    },
    summary: {
      zh: '以六阶段客户生命周期重定义 Agentic CRM，映射 24 个场景，并提供 ROI、启动时机与扩展规模的评估框架。',
      en: 'Frames Agentic CRM across six lifecycle stages, maps 24 scenarios, and provides a framework for ROI, launch timing, and scale decisions.'
    },
    tags: ['Agentic CRM', 'Customer Lifecycle', 'AI ROI', 'AI Scenario Map', 'BizApps', 'Microsoft Foundry'],
    date: '2026-07-17',
    url: 'posts/agentic-crm-business-cycle/index.html',
    color: '#a855f7',
    phase: 0.48, speed: 0.86,
    relations: ['agentic-sales-mobile-proposal', 'agentic-service-mobile-solution', 'dynamics-365-contact-center-ccaas', 'dataverse-intelligence']
  },

  {
    id: 'agentic-service-mobile-solution',
    parentId: 'agentic-service-mobile',
    type: 'article',
    title: {
      zh: 'Agentic Field Service：重构 Agent 赋能的现场服务',
      en: 'Agentic Field Service: Rebuilding Field Service Around Agents'
    },
    summary: {
      zh: '以一次上门完成服务为目标：串联当日排序、访前背景、过程中采集与关单确认，兼顾一次修复率与开票周期。',
      en: 'Aimed at completing service in one visit: day sequencing, pre-visit context, capture during work, and closure review, improving first-time fix and invoicing.'
    },
    tags: ['Power Platform', 'Field Service', 'Copilot Studio', 'Mobile AI', 'Voice'],
    date: '2026-07-11',
    url: 'posts/agentic-service-mobile-solution/index.html',
    color: '#60a5fa',
    phase: 0.54, speed: 0.88,
    relations: ['agentic-crm-business-cycle', 'agentic-sales-mobile-proposal', 'dynamics-365-contact-center-ccaas', 'power-apps-code-app']
  },

  {
    id: 'agentic-sales-mobile-proposal',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: '销售 CRM 移动 AI 智能体方案：基于 Power Platform',
      en: 'Sales CRM Mobile AI Agent Proposal: Built on Power Platform'
    },
    summary: {
      zh: '为一线销售设计的移动优先 · 语音驱动 · Agent 编排 CRM 方案，与既有 CRM 共生，6 个月四阶段交付。',
      en: 'Mobile-first, voice-driven, agent-orchestrated CRM solution for field sales teams, coexisting with the legacy CRM, delivered in four phases over six months.'
    },
    tags: ['Power Platform', 'Copilot Studio', 'CRM', 'Mobile AI', 'Legacy CRM Integration'],
    date: '2026-04-30',
    url: 'posts/agentic-sales-mobile-proposal/index.html',
    color: '#c084fc',
    phase: 0.5, speed: 0.9,
    relations: ['agentic-crm-business-cycle', 'low-code-ai-era', 'enterprise-agent-arch', 'copilot-studio-overview']
  },

  {
    id: 'agentic-sales-mobile-architecture',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Agentic Sales Mobile 架构：从一句话到正确的工具调用',
      en: 'Agentic Sales Mobile Architecture: From One Sentence to the Right Tool Calls'
    },
    summary: {
      zh: '把一句话翻译成正确工具调用的端到端操作流：理解、计划、带确认与接地执行、落地到后端；读路径接地作答并按需出可下钻图表。',
      en: 'From one sentence to correct tool calls: understand, plan, execute with confirmation and grounding, land on the backend; reads stay grounded and can chart.'
    },
    tags: ['Architecture', 'LLM Pipeline', 'Agent', 'Power Apps', 'Dataverse'],
    date: '2026-07-04',
    url: 'posts/agentic-sales-mobile-architecture/index.html',
    color: '#fb923c',
    phase: 0.58, speed: 0.87,
    relations: ['agentic-sales-mobile-design', 'agentic-sales-mobile-proposal']
  },

  {
    id: 'agentic-sales-mobile-data-model',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Agentic Sales Mobile 数据模型：18 张 Dataverse 表的取舍',
      en: 'Agentic Sales Mobile Data Model: 18 Dataverse Tables'
    },
    summary: {
      zh: '当前注册的真实数据源：标准表复用（account/contact/活动族）、自定义 crf5c 业务表、活动多态结构与适配层选项集/查找字段处理。',
      en: 'The real registered data sources: standard-table reuse, custom crf5c business tables, the polymorphic activity model, and adapter handling of choices and lookups.'
    },
    tags: ['Data Model', 'Dataverse', 'Schema', 'Power Apps', 'CRM'],
    date: '2026-06-13',
    url: 'posts/agentic-sales-mobile-data-model/index.html',
    color: '#38bdf8',
    phase: 0.6, speed: 0.86,
    relations: ['agentic-sales-mobile-architecture', 'agentic-sales-mobile-design']
  },

  {
    id: 'agentic-sales-mobile-features',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Agentic Sales Mobile 功能特性：时态活动、洞察简报与数据安全',
      en: 'Agentic Sales Mobile Features: Tense Activities, Insights, Briefings, Security'
    },
    summary: {
      zh: '六个功能域加跨切底座：活动、客户联系人、商机、查询规划、洞察语音简报；底座四条共同规则为确认、个性化、安全与新增的离线韧性。',
      en: 'Six functional domains plus a foundation whose four shared rules are confirm, personalize, secure, and the newly added offline resilience.'
    },
    tags: ['Features', 'Voice', 'Insights', 'Security', 'Offline', 'CRM'],
    date: '2026-07-04',
    url: 'posts/agentic-sales-mobile-features/index.html',
    color: '#2dd4bf',
    phase: 0.62, speed: 0.85,
    relations: ['agentic-sales-mobile-architecture', 'agentic-sales-mobile-data-model']
  },

  {
    id: 'agentic-sales-mobile-design',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: '销售 Agentic CRM 设计文档：六阶段实施手册',
      en: 'Sales Agentic CRM Design Doc: Six-Stage Implementation Manual'
    },
    summary: {
      zh: '八章实施手册：02 Plan + Bootstrap 搭数据骨架，04 五屏 Canvas App Vibe Coding，05 Power Automate Flow + Copilot Studio Agent。',
      en: 'Eight-chapter manual: Ch02 Plan + Bootstrap for data skeleton, Ch04 five-screen Canvas App Vibe Coding, Ch05 Power Automate Flows + Copilot Studio Agent.'
    },
    tags: ['Design Doc', 'Vibe Coding', 'Prototype', 'CRM', 'Prompt'],
    date: '2026-05-01',
    url: 'posts/agentic-sales-mobile-design/index.html',
    color: '#a78bfa',
    phase: 0.6, speed: 0.85,
    relations: ['agentic-sales-mobile-proposal']
  },

  {
    id: 'agentic-sales-mobile-prototype',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Sales Copilot Mobile 原型设计：Code App 动态基线',
      en: 'Sales Copilot Mobile Prototype: Code App Baseline'
    },
    summary: {
      zh: '原型基线：Code App 工作台、全局 Copilot、语音播报、确认卡片、Dataverse 详情页与开发导入入口。',
      en: 'Prototype baseline for the Code App workspace, global Copilot, voice briefing, confirmation cards, Dataverse detail pages, and dev-only import.'
    },
    tags: ['Prototype', 'Mobile UI', 'Demo', 'Power Apps', 'CRM'],
    date: '2026-05-02',
    url: 'posts/agentic-sales-mobile-prototype/index.html',
    color: '#fb923c',
    phase: 0.7, speed: 0.88,
    relations: ['agentic-sales-mobile-proposal', 'agentic-sales-mobile-design']
  },

  {
    id: 'agentic-sales-mobile-generative-ui',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: '生成式数据界面可行性评估：元数据 + 技能驱动的动态控件',
      en: 'Generative Data UI Feasibility: Metadata- and Skill-Driven Dynamic Controls'
    },
    summary: {
      zh: '从「加实体零前端改动」到完整方案：实体描述符驱动通用渲染、运行时元数据支点、技能即数据（自建 Dataverse 表 + MDA 维护与测试）、三层护栏与分阶段路线。',
      en: 'Front-end edits to a full solution: descriptor-driven rendering, a runtime-metadata linchpin, and skills-as-data in a Dataverse table maintained via an MDA.'
    },
    tags: ['Generative UI', 'Metadata-Driven', 'Dataverse', 'Feasibility', 'Architecture'],
    date: '2026-06-25',
    url: 'posts/agentic-sales-mobile-generative-ui/index.html',
    color: '#818cf8',
    phase: 0.72, speed: 0.86,
    relations: ['agentic-sales-mobile-architecture', 'agentic-sales-mobile-data-model']
  },

  {
    id: 'agentic-sales-mobile-voice',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Agentic Sales Mobile 语音架构：跨设备实时语音的 Azure Speech 方案',
      en: 'Agentic Sales Mobile Voice Architecture: Cross-Device Real-Time Speech on Azure'
    },
    summary: {
      zh: '把移动端语音从依赖设备能力变成跨设备一致与安全：Code App 沙箱禁止直连，改由自定义连接器经 SDK 调服务端 Azure 语音代理；朗读近实时、听写点按转写。',
      en: 'From device-dependent to cross-device voice: the Code App sandbox forbids direct egress, so a custom connector calls a server-side Azure speech proxy.'
    },
    tags: ['Voice', 'Azure Speech', 'Custom Connector', 'TTS', 'STT', 'Architecture'],
    date: '2026-07-06',
    url: 'posts/agentic-sales-mobile-voice/index.html',
    color: '#f472b6',
    phase: 0.64, speed: 0.85,
    relations: ['agentic-sales-mobile-architecture', 'agentic-sales-mobile-features']
  },

  {
    id: 'voice-speech-setup-guide',
    parentId: 'agentic-crm',
    type: 'article',
    title: {
      zh: 'Azure 语音平台搭建指南',
      en: 'Azure Voice Platform Setup Guide'
    },
    summary: {
      zh: '在 Azure 建语音后端（Speech + 持密钥 Function 代理），导入含连接器与连接引用的 Managed Solution，填 endpoint 与 api-key 即可接入应用。',
      en: 'Build a voice backend in Azure (Speech + a key-holding Function proxy), then import our Managed solution and enter only the endpoint and api-key.'
    },
    tags: ['Setup Guide', 'Azure Speech', 'Function', 'Custom Connector', 'API Key', 'Power Platform'],
    date: '2026-07-06',
    url: 'posts/voice-speech-setup-guide/index.html',
    color: '#34d399',
    phase: 0.68, speed: 0.8,
    relations: ['agentic-sales-mobile-voice']
  },

  {
    id: 'dynamics-365-contact-center-ccaas',
    parentId: 'agentic-service',
    type: 'article',
    title: {
      zh: 'Dynamics 365 Contact Center：CCaaS 评估指南',
      en: 'Dynamics 365 Contact Center: CCaaS Evaluation Guide'
    },
    summary: {
      zh: 'D365 Contact Center 的能力、可参考的 Forrester/BVI 回报、为什么选微软（含分析师背书）、真实客户实证与落地路径。',
      en: 'A guide to Dynamics 365 Contact Center: capabilities, Forrester/BVI ROI, why Microsoft (analyst-validated), customer proof, and adoption path.'
    },
    tags: ['Dynamics 365', 'Contact Center', 'CCaaS', 'Customer Service', 'Copilot', 'ROI'],
    date: '2026-07-07',
    url: 'posts/dynamics-365-contact-center-ccaas/index.html',
    color: '#a855f7',
    phase: 5.35, speed: 0.84,
    relations: ['agentic-crm-business-cycle', 'power-platform-governance', 'copilot-studio-overview', 'life-science-ai-blueprint']
  },

  // ════════════════════════════════════════
  // 文章 — Industry Solution
  // ════════════════════════════════════════
  {
    id: 'medtech-agent-platform-blueprint',
    parentId: 'industry-solution',
    type: 'article',
    title: {
      zh: 'AI 共创进度汇报暨敏捷化企业智能体平台蓝图展望',
      en: 'AI Co-Creation Progress Report & Agile Enterprise Agent Platform Blueprint'
    },
    summary: {
      zh: '面向医疗器械行业：4 个 PoC 验证、28 个 Agent 全景、3 个探讨与支持中场景、四波次路线图，从 AI 助手到智能体组织的三年跃迁蓝图。',
      en: 'For MedTech: 4 validated PoCs, 28-agent landscape, 3 scenarios in discussion &amp; support, four-wave roadmap — a 3-year blueprint from AI assistant to agentic organization.'
    },
    tags: ['MedTech', 'Industry Solution', 'Copilot Studio', 'Power Platform', 'Dynamics 365'],
    date: '2026-05-15',
    url: 'posts/medtech-agent-platform-blueprint/index.html',
    color: '#d8b4fe',
    phase: 0.4, speed: 0.87,
    relations: ['agentic-sales-mobile-proposal', 'enterprise-agent-arch', 'copilot-studio-overview']
  },
  {
    id: 'life-science-ai-blueprint',
    parentId: 'industry-solution',
    type: 'article',
    title: {
      zh: 'Life Science 行业 AI 场景蓝图：基于微软 AI Business Application',
      en: 'Life Science AI Scenario Blueprint: Microsoft AI Business Application'
    },
    summary: {
      zh: '7 阶段药物价值链 x 4 大微软产品栈 = 28 个 AI 场景交叉蓝图，覆盖 Pharma/Biotech/MedTech/CRO/Dx 五细分，附三阶段实施路线。',
      en: '7 drug value chain stages x 4 Microsoft product pillars = 28 AI scenario cross-reference blueprint across 5 subsectors, with a 3-phase rollout roadmap.'
    },
    tags: ['Life Science', 'Pharma', 'Industry Solution', 'Copilot Studio', 'Dynamics 365', 'Power Platform'],
    date: '2026-05-18',
    url: 'posts/life-science-ai-blueprint/index.html',
    color: '#c4b5fd',
    phase: 0.8, speed: 0.85,
    relations: ['medtech-agent-platform-blueprint', 'enterprise-agent-arch', 'copilot-studio-overview']
  },

  // ════════════════════════════════════════
  // 文章 — 企业智能体架构
  // ════════════════════════════════════════
  {
    id: 'enterprise-agent-arch',
    parentId: 'fc-agentic',
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
    parentId: 'fc-agentic',
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
    id: 'ai-industry-watch-2026-06-10',
    parentId: 'ai-industry-watch',
    type: 'article',
    title: {
      zh: 'AI 时事雷达：Agent 应用、AI 编码代理与算力基础设施',
      en: 'AI News Radar: Agentic Apps, AI Coding Agents, and Infrastructure Scale'
    },
    summary: {
      zh: 'AI 时事雷达：Google Agentic Gemini、GitHub Copilot custom agents、Anthropic 企业分发与 NVIDIA 算力平台。',
      en: 'AI news radar: Google Agentic Gemini, GitHub Copilot custom agents, Anthropic enterprise distribution, and NVIDIA infrastructure.'
    },
    tags: ['AI Industry', 'Agentic Apps', 'AI Coding', 'Enterprise AI', 'Infrastructure'],
    date: '2026-06-10',
    url: 'posts/ai-industry-watch-2026-06-10/index.html',
    color: '#38bdf8',
    phase: 0.55, speed: 0.9,
    relations: ['copilot-harness-eng', 'enterprise-agent-arch', 'fc-landscape']
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
    relations: ['copilot-harness-eng', 'enterprise-agent-arch', 'claw-code']
  },
  {
    id: 'open-design-research',
    parentId: 'ai-research-vibe-coding',
    type: 'article',
    title: {
      zh: 'Open Design 解析：让 AI 帮你做设计的开源工作台',
      en: 'Open Design: An Open-Source AI Design Workbench'
    },
    summary: {
      zh: '拆解 OD 的六步设计流程、五道质量闸门与三层架构，以及它如何打开 Claude Design 的四把锁。',
      en: 'How OD unlocks Claude Design with a six-step flow, five quality gates, three-layer architecture, and BYOK model flexibility.'
    },
    tags: ['Open Source', 'AI Design', 'BYOK', 'Skills'],
    date: '2026-05-05',
    url: 'posts/open-design-research/index.html',
    color: '#a78bfa',
    phase: 4.4, speed: 0.84,
    relations: ['copilot-deep-dive', 'claw-code-analysis', 'copilot-harness-eng']
  },
  {
    id: 'generative-ui-landscape',
    parentId: 'ai-research-vibe-coding',
    type: 'article',
    title: {
      zh: '生成式 UI 全景：从设计时生成到运行时界面',
      en: 'The Generative UI Landscape: From Design-Time Generation to Runtime Interfaces'
    },
    summary: {
      zh: '用三层范式（设计时生成 / 运行时组件 / 运行时界面）梳理 Generative UI，覆盖 v0、Claude Artifacts、Gemini 3 等代表产品与一张定位象限图。',
      en: 'Maps generative UI in three paradigms (design-time, runtime components, runtime interfaces), with v0, Claude Artifacts, Gemini 3, and a positioning map.'
    },
    tags: ['Generative UI', 'AI UX', 'Vibe Coding', 'Product Landscape', 'Design Systems'],
    date: '2026-06-10',
    url: 'posts/generative-ui-landscape/index.html',
    color: '#8b5cf6',
    phase: 4.7, speed: 0.83,
    relations: ['open-design-research', 'copilot-deep-dive', 'ai-era-app-evolution']
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
    parentId: 'fc-agentic',
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
    parentId: 'fc-agentic',
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
    parentId: 'fc-agentic',
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
    id: 'fc-engineering-optimization',
    parentId: 'fc-agentic',
    type: 'article',
    title: {
      zh: 'Function Calling 工程化提效：同一模型下提升调用成功率的系统方法',
      en: 'Function Calling Engineering Optimization: Systematic Methods to Improve Call Success Rate'
    },
    summary: {
      zh: '从 Schema 工程、工具路由、上下文管理、错误恢复和架构模式五个维度，系统化提升 Function Calling 准确率和可靠性。',
      en: 'Improves function calling accuracy across five dimensions: schema engineering, tool routing, context management, error recovery, and architecture.'
    },
    tags: ['Function Calling', 'Engineering', 'Optimization', 'AI Agent'],
    date: '2026-04-29',
    url: 'posts/fc-engineering-optimization/index.html',
    color: '#6366f1',
    phase: 3.2, speed: 0.86,
    relations: ['fc-best-practices', 'fc-landscape', 'enterprise-agent-arch']
  },
  {
    id: 'intellygoal-fc-review',
    parentId: 'fc-agentic',
    type: 'article',
    title: {
      zh: 'IntellyGoal Function Calling 代码 Review：Pydantic-as-Schema 的优雅实现与 5 个待修补的工程缝隙',
      en: 'IntellyGoal Function Calling Code Review: Elegant Pydantic-as-Schema and 5 Engineering Gaps to Fix'
    },
    summary: {
      zh: '对 IntellyGoal-by-W 后端 Agent 模块（registry/runtime/tools 共 1049 行）按五维度做 ABCD 评级，列出 5 个 P0/P1 改进项与可执行 patch。',
      en: 'ABCD review of IntellyGoal-by-W agent module (1049 LOC) across five dimensions, with 5 P0/P1 improvements and executable patches.'
    },
    tags: ['Code Review', 'Function Calling', 'Python', 'FastAPI'],
    date: '2026-04-30',
    url: 'posts/intellygoal-fc-review/index.html',
    color: '#6366f1',
    phase: 3.4, speed: 0.86,
    relations: ['fc-engineering-optimization', 'fc-best-practices', 'enterprise-agent-arch']
  },
  {
    id: 'mcp-principles-development',
    parentId: 'fc-agentic',
    type: 'article',
    title: {
      zh: 'MCP 原理与开发指南：协议解剖与 TypeScript 落地实操',
      en: 'MCP Principles & Development Guide: Protocol Anatomy and TypeScript Delivery'
    },
    summary: {
      zh: '面向架构师的 MCP 全解：Host/Client/Server 架构、六原语、生命周期与两种传输，并用 TypeScript 实操 server 构建与安全落地。',
      en: 'Architect\'s guide to the Model Context Protocol: Host/Client/Server model, six primitives, lifecycle, two transports, plus a hands-on TypeScript server build.'
    },
    tags: ['MCP', 'Model Context Protocol', 'AI Agent', 'Tool Use', 'TypeScript'],
    date: '2026-07-01',
    url: 'posts/mcp-principles-development/index.html',
    color: '#4f46e5',
    phase: 2.7, speed: 0.86,
    relations: ['fc-landscape', 'fc-best-practices', 'enterprise-agent-arch']
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
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code 总览：自主编码代理的开源 Harness',
      en: 'Claw Code Overview: Open-Source Harness for Autonomous Coding Agents'
    },
    summary: {
      zh: '总览篇。梳理三层协作架构、Rust 工作区路径、工具规格与五阶段 Roadmap，适合作为入口阅读。',
      en: 'Series overview. Maps three-layer architecture, Rust workspace layout, tool specs, and five-phase roadmap; suitable as entry reading.'
    },
    tags: ['Coding Agent', 'Open Source', 'Rust', 'Overview'],
    date: '2026-04-11',
    url: 'posts/claw-code-analysis/index.html',
    color: '#fb923c',
    phase: 2.5, speed: 0.86,
    relations: ['claw-code-user-manual', 'claw-code-worker-protocol', 'copilot-harness-eng']
  },
  {
    id: 'claw-code-user-manual',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code 用户手册：从安装到精通的实操指南',
      en: 'Claw Code User Manual: A Practical Guide from Installation to Mastery'
    },
    summary: {
      zh: '面向用户的实操手册，覆盖环境、三种运行模式、内置工具、配置层级、权限模型、Slash 命令与 MCP/Hooks/多代理进阶用法。',
      en: 'Hands-on user manual covering env, three run modes, built-in tools, config hierarchy, permissions, slash commands, MCP/hooks/multi-agent workflows.'
    },
    tags: ['Coding Agent', 'User Manual', 'CLI', 'Tutorial'],
    date: '2026-04-21',
    url: 'posts/claw-code-user-manual/index.html',
    color: '#fb923c',
    phase: 2.8, speed: 0.82,
    relations: ['claw-code-analysis', 'claw-code-worker-protocol']
  },
  {
    id: 'claw-code-worker-protocol',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code 工作器协议：状态机、信任门、Lane 事件与恢复配方',
      en: 'Claw Code Worker Protocol: State Machine, Trust Gate, Lane Events & Recovery Recipes'
    },
    summary: {
      zh: '拆解 worker_boot 等 8 个 runtime 模块（6 状态、10 事件、16 Lane 事件、11 失败分类、7 恢复配方），逐项对齐 ROADMAP §1–§11。',
      en: 'Dissects 8 runtime modules around worker_boot (6 states, 10 events, 16 lane events, 11 failure classes, 7 recovery recipes); maps each to ROADMAP §1–§11.'
    },
    tags: ['Coding Agent', 'State Machine', 'Rust', 'Event-Native'],
    date: '2026-04-22',
    url: 'posts/claw-code-worker-protocol/index.html',
    color: '#fb923c',
    phase: 2.6, speed: 0.84,
    relations: ['claw-code-analysis', 'claw-code-user-manual', 'enterprise-agent-arch']
  },
  {
    id: 'claw-code-runtime-anatomy',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code 运行时解剖：会话循环、压缩、提示装配与计费',
      en: 'Claw Code Runtime Anatomy: Turn Loop, Compaction, Prompt Builder & Usage'
    },
    summary: {
      zh: '拆解 conversation/compact/prompt/usage/hooks 共 5,829 行：run_turn 9 步、Sink 7 回调、压缩 4/10K 窗口、四维计费。',
      en: 'Dissects 5,829 LOC of runtime: 9-step run_turn, 7 sink callbacks, 4/10K compaction window, 4K/12K prompt budget, four-axis billing.'
    },
    tags: ['Coding Agent', 'Runtime', 'Rust', 'Token Budget'],
    date: '2026-04-22',
    url: 'posts/claw-code-runtime-anatomy/index.html',
    color: '#fb923c',
    phase: 2.7, speed: 0.83,
    relations: ['claw-code-worker-protocol', 'claw-code-analysis', 'claw-code-user-manual']
  },
  {
    id: 'claw-code-mcp-hardening',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code MCP 硬化：11 阶段生命周期、错误面与降级模式',
      en: 'Claw Code MCP Hardening: 11-Phase Lifecycle, Error Surface & Degraded Mode'
    },
    summary: {
      zh: '拆解 4,899 行 MCP 模块：11 阶段生命周期、6 字段 ErrorSurface、4 维降级报告、15+ JSON-RPC 强类型与 stdio 通道。',
      en: '4,899-LOC MCP teardown: 11-phase lifecycle, 6-field ErrorSurface, 4-axis degraded report, 15+ typed JSON-RPC, stdio transport.'
    },
    tags: ['Coding Agent', 'MCP', 'Rust', 'Lifecycle'],
    date: '2026-04-22',
    url: 'posts/claw-code-mcp-hardening/index.html',
    color: '#fb923c',
    phase: 2.8, speed: 0.82,
    relations: ['claw-code-runtime-anatomy', 'claw-code-worker-protocol', 'claw-code-analysis']
  },
  {
    id: 'claw-code-permission-bash',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code 权限层：5 种模式、6 阶段授权与 1004 行 bash 校验',
      en: 'Claw Code Permission Layer: 5 Modes, 6-Stage Auth & 1,004-LOC Bash Validation'
    },
    summary: {
      zh: '拆解 2,954 行权限模块：5 种 PermissionMode、6 阶段授权流水、6 段 bash 子模块、3 种沙箱隔离与 EnforcementResult 三态。',
      en: '2,954-LOC permission stack: 5 PermissionModes, 6-stage authorize, 6 bash submodules, 3 sandbox modes, tri-state EnforcementResult.'
    },
    tags: ['Coding Agent', 'Permissions', 'Bash', 'Sandbox'],
    date: '2026-04-22',
    url: 'posts/claw-code-permission-bash/index.html',
    color: '#fb923c',
    phase: 2.9, speed: 0.81,
    relations: ['claw-code-runtime-anatomy', 'claw-code-worker-protocol', 'claw-code-mcp-hardening']
  },
  {
    id: 'claw-code-app-client',
    parentId: 'claw-code',
    type: 'article',
    title: {
      zh: 'Claw Code App 客户端：UDS daemon、line-protocol 与 SwiftUI 包装层',
      en: 'Claw Code App Client: UDS Daemon, Line-Protocol & SwiftUI Wrapper'
    },
    summary: {
      zh: '拆解 1,009 行 claw-daemon：3 类 Message、5 个 Request 方法、6 种 Event；映射 7 个 sink 回调到 SwiftUI App 与 BYO 客户端。',
      en: '1,009-LOC daemon: 3 Message kinds, 5 Request methods, 6 Event types; maps 7 sink callbacks to SwiftUI App and BYO clients.'
    },
    tags: ['Coding Agent', 'Daemon', 'IPC', 'SwiftUI'],
    date: '2026-04-22',
    url: 'posts/claw-code-app-client/index.html',
    color: '#fb923c',
    phase: 3.0, speed: 0.80,
    relations: ['claw-code-runtime-anatomy', 'claw-code-mcp-hardening', 'claw-code-permission-bash']
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
  {
    id: 'dataverse-intelligence',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: 'Dataverse Intelligence 入门：业务上下文层、Business Skills 与 MCP Server',
      en: 'Dataverse Intelligence Primer: Business Context Layer, Business Skills & MCP Server'
    },
    summary: {
      zh: 'Work IQ 在业务数据维度的延伸：用 Business Skills 沉淀组织流程，通过 Dataverse MCP Server preview 让所有 agent 复用。',
      en: 'Work IQ extended to business data: capture org processes as reusable Business Skills, exposed to all agents via Dataverse MCP Server preview.'
    },
    tags: ['Dataverse', 'MCP', 'Copilot', 'Business Skills', 'Power Platform'],
    date: '2026-05-20',
    url: 'posts/dataverse-intelligence/index.html',
    color: '#06b6d4',
    phase: 2.7, speed: 0.84,
    relations: ['dataverse-security-roles', 'copilot-studio-overview', 'power-platform-governance']
  },

  {
    id: 'power-platform-governance',
    parentId: 'power-platform',
    type: 'article',
    title: {
      zh: 'Power Platform 治理速览：从许可到运维落地',
      en: 'Power Platform Governance Quickstart: Licensing to Operations'
    },
    summary: {
      zh: '基于微软官方文档，先用 7 阶段项目流程讲清"哪个角色在哪个阶段做什么"，再依次拆解许可、容量、环境、权限与治理监控，并给出 30 天落地路径。',
      en: '7-stage project process showing who does what when, then licensing, capacity, environments, access, and monitoring — plus a 30-day plan.'
    },
    tags: ['Power Platform', 'Governance', 'Licensing', 'Dataverse Capacity', 'Enterprise IT'],
    date: '2026-05-12',
    url: 'posts/power-platform-governance/index.html',
    color: '#8b5cf6',
    phase: 4.2, speed: 0.83,
    relations: ['low-code-ai-era', 'copilot-studio-overview', 'agentic-sales-mobile-proposal']
  },
  {
    id: 'dynamics-365-ce-tenant-separation',
    parentId: 'power-platform',
    type: 'article',
    title: {
      zh: 'CRM 系统拆分评估指南：可行性、架构与实现路径',
      en: 'CRM System Separation Assessment: Feasibility, Architecture, and Delivery Paths'
    },
    summary: {
      zh: '以 Success by Design 五阶段与三道评审闸门为主线，覆盖五项可行性闸门、三条路径、目标架构、数据边界与分阶段实施。',
      en: 'A reusable CRM separation guide anchored on Success by Design, covering feasibility gates, three paths, architecture, data boundaries, and phased delivery.'
    },
    tags: ['CRM', 'Carve-Out', 'Separation Assessment', 'Success by Design', 'Dynamics 365', 'Dataverse', 'Power Platform'],
    date: '2026-07-15',
    url: 'posts/dynamics-365-ce-tenant-separation/index.html',
    color: '#7c3aed',
    phase: 4.5, speed: 0.84,
    relations: ['power-platform-governance', 'dataverse-security-roles']
  },
  {
    id: 'power-platform-pricing-quote-tool',
    parentId: 'microsoft-ai',
    type: 'article',
    title: {
      zh: 'Power Platform 报价体系与互动估算器：从需求到产品配置',
      en: 'Power Platform Pricing System & Interactive Estimator: From Requirements to Product Configuration'
    },
    summary: {
      zh: '梳理 Power Platform 计费规则，含 AI Credit、方案对比、交互式报价器与 BVM ROI 自助测算。',
      en: 'Power Platform pricing with AI credits, option comparison, an interactive quote estimator, and BVM ROI calculator.'
    },
    tags: ['Power Platform', 'Pricing', 'Licensing', 'Estimator', 'ROI'],
    date: '2026-04-17',
    url: 'posts/power-platform-pricing-quote-tool/index.html',
    color: '#7e22ce',
    phase: 5.6, speed: 0.84,
    relations: ['powerapps-vibe-coding', 'low-code-ai-era', 'copilot-studio-overview']
  },
  {
    id: 'power-platform-skills',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: 'Power Platform Skills：微软官方 AI Agent 插件市场解析',
      en: 'Power Platform Skills: Microsoft Official AI Agent Plugin Marketplace Analysis'
    },
    summary: {
      zh: '解析微软开源的 AI Agent 插件市场，4 个插件 26+ Skills 覆盖 Power Platform 创建→部署→数据→认证全流程。',
      en: 'Analyzes Microsoft\'s open-source plugin marketplace for Claude Code/Copilot CLI, with 4 plugins and 26+ skills covering the full Power Platform lifecycle.'
    },
    tags: ['Power Platform', 'AI Agent', 'Plugin', 'MCP', 'Claude Code'],
    date: '2026-04-28',
    url: 'posts/power-platform-skills/index.html',
    color: '#9333ea',
    phase: 4.2, speed: 0.86,
    relations: ['powerapps-vibe-coding', 'low-code-ai-era', 'copilot-harness-eng']
  },
  {
    id: 'power-apps-code-app',
    parentId: 'power-apps',
    type: 'article',
    title: {
      zh: 'Power Apps Code App：专业开发者的托管应用新路径',
      en: 'Power Apps Code App: A New Managed App Path for Pro Developers'
    },
    summary: {
      zh: '梳理 Code App 的定位、三层架构、与 Canvas/Model-driven 的差异、开发流程、数据连接、限制和最佳实践。',
      en: 'Covers Code App positioning, 3-layer architecture, comparison with Canvas/Model-driven, dev workflow, data connection, limitations, and best practices.'
    },
    tags: ['Power Apps', 'Code App', 'React', 'TypeScript', 'Pro Developer'],
    date: '2026-05-20',
    url: 'posts/power-apps-code-app/index.html',
    color: '#7c3aed',
    phase: 4.5, speed: 0.84,
    relations: ['power-platform-governance', 'powerapps-vibe-coding', 'power-platform-skills']
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
    id: 'copilot-studio-streaming-verification',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: '验证 Copilot Studio 流式输出：从 Direct Line 到 Direct Engine 的实测',
      en: 'Verifying Copilot Studio Streaming: From Direct Line to Direct Engine'
    },
    summary: {
      zh: '一次完整的工程验证：抓取 Direct Line 原始 activity 证明流式片段未下发，再发现 Agents SDK 的 Direct Engine（SSE）原生支持流式，实测唯一阻塞点是缺 CopilotStudio.Copilots.Invoke 权限。',
      en: 'A full engineering investigation: raw Direct Line activities prove no streaming chunks arrive, then the Agents SDK Direct Engine (SSE) is found to natively support streaming — with the sole blocker being a missing CopilotStudio.Copilots.Invoke permission.'
    },
    tags: ['Copilot Studio', 'Livestreaming', 'Direct Line', 'Direct Engine'],
    date: '2026-06-15',
    url: 'posts/copilot-studio-streaming-verification/index.html',
    color: '#0ea5e9',
    phase: 1.6, speed: 0.85,
    relations: ['copilot-studio-constraints', 'copilot-studio-vs-agent-sdk']
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
  {
    id: 'copilot-studio-cua',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Copilot Studio CUA：让 Agent 操作网页与桌面应用的能力、边界与成本',
      en: 'Copilot Studio CUA: GUI Automation Capability, Limits & Cost'
    },
    summary: {
      zh: '梳理 Copilot Studio CUA 的能力、三种运行方式、成功率边界、日志治理与 5 Credits/step 成本，判断何时该用 GUI 自动化。',
      en: 'Explains Copilot Studio CUA across runtime options, reliability limits, logging, and 5-credits-per-step economics for GUI automation decisions.'
    },
    tags: ['Copilot Studio', 'Computer Use', 'GUI Automation', 'Agent Governance'],
    date: '2026-04-22',
    url: 'posts/copilot-studio-cua/index.html',
    color: '#7c3aed',
    phase: 3.5, speed: 0.83,
    relations: ['copilot-studio-overview', 'copilot-studio-constraints', 'copilot-studio-vs-agent-sdk']
  },
  {
    id: 'copilot-studio-mcp-cross-tenant',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Copilot Studio 跨租户 MCP：Global 调通 21Vianet',
      en: 'Cross-Tenant MCP: Global Copilot Studio Reaches 21Vianet'
    },
    summary: {
      zh: 'Global Copilot Studio 实测调通 21Vianet Dataverse MCP，跨云边界存在可行路径。',
      en: 'Global Copilot Studio verified reaching 21Vianet Dataverse MCP — a workable path across the cloud boundary.'
    },
    tags: ['Copilot Studio', 'MCP', 'Dataverse', 'Cross-Tenant', 'Sovereign Cloud'],
    date: '2026-05-28',
    url: 'posts/copilot-studio-mcp-cross-tenant/index.html',
    color: '#8b5cf6',
    phase: 5.4, speed: 0.81,
    relations: ['copilot-studio-overview', 'dataverse-security-roles', 'copilot-studio-constraints']
  },
  {
    id: 'copilot-studio-new-agent-knowledge-query',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Copilot Studio New Agent 知识问答迁移：Dataverse 检索与答案规范',
      en: 'Copilot Studio New Agent Knowledge QA: Dataverse Retrieval And Answer Rules'
    },
    summary: {
      zh: '复刻经典 Knowledge Agent：用 faq_topic 列域、faq_article 检索、unbound action 参数契约和答案规范控制 New Agent。',
      en: 'Reproduces classic Knowledge Agent behavior with faq_topic domains, faq_article retrieval, unbound action contracts, and answer rules.'
    },
    tags: ['Copilot Studio', 'New Agent', 'Dataverse', 'Knowledge QA', 'Adaptive Cards'],
    date: '2026-06-15',
    url: 'posts/copilot-studio-new-agent-knowledge-query/index.html',
    color: '#8b5cf6',
    phase: 5.8, speed: 0.82,
    relations: ['copilot-studio-mcp-cross-tenant', 'copilot-studio-constraints', 'dataverse-security-roles']
  },
  {
    id: 'zava-claims-360-solution',
    parentId: 'copilot-studio',
    type: 'article',
    title: {
      zh: 'Zava Claims 360：Power Platform + Copilot Studio 解决方案架构',
      en: 'Zava Claims 360: Power Platform + Copilot Studio Solution Architecture'
    },
    summary: {
      zh: '面向能源企业 Zava 的解决方案：用 Power Platform 现代化理赔系统，Copilot Studio 构建 AI 客服，Managed Environments 保障合规治理。',
      en: 'Solution architecture for Zava: modernize claims with Power Platform, deploy AI agent via Copilot Studio, enforce governance with Managed Environments.'
    },
    tags: ['Copilot Studio', 'Power Platform', 'Solution Architecture', 'Enterprise ALM'],
    date: '2026-04-22',
    url: 'posts/zava-claims-360-solution/index.html',
    color: '#6d28d9',
    phase: 2.2, speed: 0.84,
    relations: ['copilot-studio-overview', 'copilot-studio-vs-agent-sdk', 'dataverse-security-roles']
  },

  // ════════════════════════════════════════
  // 文章 — AI 工程实践（项目设计文档）
  // ════════════════════════════════════════
  {
    id: 'study-room-design',
    parentId: 'knowledge-hub-design-docs',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 设计文档：交互式知识图谱的架构与实现',
      en: 'Knowledge Hub Design Document: Architecture of an Interactive Knowledge Graph'
    },
    summary: {
      zh: '更新版设计文档：覆盖四视图首页、单数据源架构、自动讲解/录屏/邮件分享能力与研究到发布闭环。',
      en: 'Updated design document on the four-view homepage, single-source data model, narration/recording/email sharing, and the research-to-publish workflow.'
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
    parentId: 'knowledge-hub-design-docs',
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
    relations: ['study-room-design', 'presentation-style-optimization']
  },
  {
    id: 'presentation-style-optimization',
    parentId: 'knowledge-hub-design-docs',
    type: 'article',
    title: {
      zh: '演示模式内容与式样优化设计',
      en: 'Presentation Mode Content & Style Optimization Design'
    },
    summary: {
      zh: '针对排版可读性、讲解认知负荷和移动端录制三个维度，基于五款产品基准分析提出三层渐进式优化方案。',
      en: 'Three-phase optimization for presentation typography, narration focus mode, and mobile recording viewport, benchmarked against five industry products.'
    },
    tags: ['Design Document', 'Presentation', 'UX', 'Mobile'],
    date: '2026-04-20',
    url: 'posts/presentation-style-optimization/index.html',
    color: '#7c3aed',
    phase: 5.2, speed: 0.72,
    relations: ['presentation-narration-design', 'study-room-design', 'mobile-present-design']
  },
  {
    id: 'mobile-present-design',
    parentId: 'knowledge-hub-design-docs',
    type: 'article',
    title: {
      zh: '演示模式手机端优化设计：面向移动消费的内容重构方案',
      en: 'Mobile Presentation Mode: Content Restructuring for Phone-Screen Consumption'
    },
    summary: {
      zh: '为演示模式新增手机模式模块，从排版、导航、手势和字幕四维度重构内容呈现，使录制产物在手机屏幕上原生可读。',
      en: 'Adds a mobile mode module to presentation with touch gestures, bottom nav bar, enlarged typography, and safe-area layout for phone-native readability.'
    },
    tags: ['Design Document', 'Presentation', 'Mobile', 'UX'],
    date: '2026-04-21',
    url: 'posts/mobile-present-design/index.html',
    color: '#7c3aed',
    phase: 5.8, speed: 0.68,
    relations: ['presentation-style-optimization', 'presentation-narration-design', 'study-room-design']
  },
  {
    id: 'markdown-rendering-pipeline',
    parentId: 'knowledge-hub-design-docs',
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
  {
    id: 'knowledge-hub-design-docs',
    parentId: 'knowledge-hub',
    type: 'topic',
    label: { zh: '设计文档', en: 'Design Docs' },
    color: '#0fb5ae',
    phase: 4.2, speed: 0.8
  },

  // ════════════════════════════════════════
  // 文章 — Knowledge Hub（治理与审查）
  // ════════════════════════════════════════
  {
    id: 'study-room-standards',
    parentId: 'knowledge-hub-design-docs',
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
    id: 'study-room-code-architecture-review-2026-06-15',
    parentId: 'knowledge-hub-reviews',
    type: 'article',
    title: {
      zh: 'Knowledge Hub 代码与架构审查报告（2026-06-15）',
      en: 'Knowledge Hub Code and Architecture Review (2026-06-15)'
    },
    summary: {
      zh: '第三次代码与架构审查：111 篇公开文章、3 篇暂不公开页面、145 个知识节点，识别平台化重构窗口。',
      en: 'Third code and architecture review: 111 public articles, 3 intentionally private pages, 145 knowledge nodes, and a platform refactor roadmap.'
    },
    tags: ['Architecture Review', 'Code Review', 'Knowledge Hub', 'Quality Audit'],
    date: '2026-06-15',
    url: 'posts/study-room-code-architecture-review-2026-06-15/index.html',
    color: '#0d8f8c',
    phase: 2.2, speed: 0.79,
    relations: ['architecture-review-2026-0415', 'homepage-architecture-review', 'study-room-standards']
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
  {
    id: 'article-design-system',
    parentId: 'knowledge-hub-design-docs',
    type: 'article',
    title: {
      zh: '文章设计系统：视觉规范与组件样式文档',
      en: 'Article Design System: Visual Specification & Component Style Guide'
    },
    summary: {
      zh: '完整记录文章页面视觉规范——色彩令牌、字体系统、间距圆角、阴影层级、核心组件样式与响应式断点。',
      en: 'Full article page visual spec: color tokens, typography, spacing/radius, shadow tiers, core component styles, and responsive breakpoints.'
    },
    tags: ['Design System', 'CSS', 'Visual Specification'],
    date: '2026-04-20',
    url: 'posts/article-design-system/index.html',
    color: '#ff7a00',
    phase: 5.2, speed: 0.72,
    relations: ['study-room-design', 'study-room-standards']
  },
  {
    id: 'pptx-export-design',
    parentId: 'knowledge-hub-design-docs',
    type: 'article',
    title: {
      zh: 'PPT 导出设计：布局网格、字体令牌与标注示例',
      en: 'PPT Export Design: Layout Grid, Typography Tokens & Annotated Examples'
    },
    summary: {
      zh: 'PptxGenJS 导出管线的完整视觉规范——幻灯片网格、三级字体层级、色彩令牌、五类布局标注示例与导出约定。',
      en: 'Full visual spec for PptxGenJS export: slide grid, 3-tier typography, color tokens, 5 annotated slide examples, and layout conventions.'
    },
    tags: ['PPT Export', 'Design System', 'PptxGenJS', 'Visual Specification'],
    date: '2026-04-22',
    url: 'posts/pptx-export-design/index.html',
    color: '#ff7a00',
    phase: 0.8, speed: 0.76,
    relations: ['article-design-system', 'study-room-design']
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
    orbitIndex: 3, phase: 3.8, speed: 0.48
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
    id: 'edu-high-school-math',
    parentId: 'edu-fundamentals',
    type: 'topic',
    label: { zh: '高中数学', en: 'High School Mathematics' },
    color: '#f59e0b',
    phase: 0.35, speed: 0.90
  },
  {
    id: 'edu-high-school-algebra-functions',
    parentId: 'edu-high-school-math',
    type: 'topic',
    label: { zh: '代数与函数', en: 'Algebra and Functions' },
    color: '#f97316',
    phase: 0.7, speed: 0.92
  },
  {
    id: 'edu-high-school-geometry-algebra',
    parentId: 'edu-high-school-math',
    type: 'topic',
    label: { zh: '几何与代数', en: 'Geometry and Algebra' },
    color: '#14b8a6',
    phase: 1.45, speed: 0.90
  },
  {
    id: 'edu-calculus',
    parentId: 'edu-high-school-math',
    type: 'topic',
    label: { zh: '微积分', en: 'Calculus' },
    color: '#fb7185',
    phase: 0.3, speed: 0.9
  },

  // ════════════════════════════════════════
  // 高中数学专题文章（2025 日常修订版课程标准）
  // ════════════════════════════════════════
  {
    id: 'high-school-log-change-base',
    parentId: 'edu-high-school-algebra-functions',
    type: 'article',
    title: {
      zh: '对数换底公式：把陌生底数化成可计算形式',
      en: 'Change of Base: Converting Any Logarithm Into a Computable Form'
    },
    summary: {
      zh: '从指数定义推导换底公式，串联定义域、对数运算、方程、不等式与六道分层练习。',
      en: 'Derives change of base from exponents, then connects domains, logarithm laws, equations, inequalities, and graded practice.'
    },
    tags: ['High School Mathematics', 'Logarithms', 'Change of Base', 'Functions'],
    date: '2026-07-16',
    url: 'posts/high-school-log-change-base/index.html',
    color: '#f97316',
    phase: 0.45, speed: 0.93,
    relations: ['high-school-sequences', 'calculus-derivatives']
  },
  {
    id: 'high-school-sequences',
    parentId: 'edu-high-school-algebra-functions',
    type: 'article',
    title: {
      zh: '数列：用离散函数描述递推与累积',
      en: 'Sequences: Describing Recurrence and Accumulation With Discrete Functions'
    },
    summary: {
      zh: '以离散函数统一数列表示、等差与等比通项、前 n 项和、现实建模及数学归纳法。',
      en: 'Unifies sequence representations, arithmetic and geometric terms and sums, modeling, and mathematical induction.'
    },
    tags: ['High School Mathematics', 'Sequences', 'Arithmetic Sequence', 'Geometric Sequence'],
    date: '2026-07-16',
    url: 'posts/high-school-sequences/index.html',
    color: '#f97316',
    phase: 1.15, speed: 0.91,
    relations: ['high-school-log-change-base', 'calculus-derivatives']
  },
  {
    id: 'high-school-vector-operations',
    parentId: 'edu-high-school-geometry-algebra',
    type: 'article',
    title: {
      zh: '向量运算：加减、数乘、数量积与投影',
      en: 'Vector Operations: Addition, Scalar Multiplication, Dot Products, and Projection'
    },
    summary: {
      zh: '系统讲解向量加减、数乘、坐标、数量积与投影，并明确不存在通用的向量除以向量。',
      en: 'Covers vector operations, coordinates, dot products, and projection while clarifying that general vector division is undefined.'
    },
    tags: ['High School Mathematics', 'Vectors', 'Dot Product', 'Projection'],
    date: '2026-07-16',
    url: 'posts/high-school-vector-operations/index.html',
    color: '#14b8a6',
    phase: 0.35, speed: 0.92,
    relations: ['high-school-solid-geometry', 'high-school-conic-sections']
  },
  {
    id: 'high-school-complex-numbers',
    parentId: 'edu-high-school-geometry-algebra',
    type: 'article',
    title: {
      zh: '复数：从数系扩充到复平面运算',
      en: 'Complex Numbers: From Number-System Extension to Plane Geometry'
    },
    summary: {
      zh: '从 i² = −1 建立复数代数形式、复平面、模、共轭与四则运算，并介绍三角表示。',
      en: 'Builds complex form, plane geometry, modulus, conjugates, and arithmetic from i² = −1, with trigonometric form as extension.'
    },
    tags: ['High School Mathematics', 'Complex Numbers', 'Complex Plane', 'Conjugate'],
    date: '2026-07-16',
    url: 'posts/high-school-complex-numbers/index.html',
    color: '#14b8a6',
    phase: 1.05, speed: 0.90,
    relations: ['high-school-vector-operations']
  },
  {
    id: 'high-school-solid-geometry',
    parentId: 'edu-high-school-geometry-algebra',
    type: 'article',
    title: {
      zh: '立体几何：从空间关系到向量度量',
      en: 'Solid Geometry: From Spatial Relations to Vector Measurement'
    },
    summary: {
      zh: '贯通线面平行垂直、空间角与距离、几何体体积，以及方向向量和法向量的坐标方法。',
      en: 'Connects spatial parallelism, perpendicularity, angles, distances, solids, direction vectors, and normal-vector methods.'
    },
    tags: ['High School Mathematics', 'Solid Geometry', 'Spatial Vectors', 'Planes'],
    date: '2026-07-16',
    url: 'posts/high-school-solid-geometry/index.html',
    color: '#14b8a6',
    phase: 1.75, speed: 0.88,
    relations: ['high-school-vector-operations', 'high-school-conic-sections']
  },
  {
    id: 'high-school-conic-sections',
    parentId: 'edu-high-school-geometry-algebra',
    type: 'article',
    title: {
      zh: '圆锥曲线：从轨迹定义到方程与性质',
      en: 'Conic Sections: From Locus Definitions to Equations and Properties'
    },
    summary: {
      zh: '以距离条件统一椭圆、双曲线和抛物线，讲解标准方程、焦点性质及直线联立。',
      en: 'Unifies ellipses, hyperbolas, and parabolas through loci, standard equations, focal properties, and line intersections.'
    },
    tags: ['High School Mathematics', 'Conic Sections', 'Ellipse', 'Hyperbola', 'Parabola'],
    date: '2026-07-16',
    url: 'posts/high-school-conic-sections/index.html',
    color: '#14b8a6',
    phase: 2.45, speed: 0.86,
    relations: ['high-school-vector-operations', 'high-school-solid-geometry']
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
      zh: '从差商定义到公式、切线、单调性、极值与闭区间最值，覆盖 2025 课标高中导数完整范围。',
      en: 'Covers the full 2025 senior-high derivative scope: limits, rules, tangents, monotonicity, and local and absolute extrema.'
    },
    tags: ['Calculus', 'Derivatives', 'Tangent Line', 'Monotonicity', 'Extrema'],
    date: '2026-07-16',
    url: 'posts/calculus-derivatives/index.html',
    color: '#fb7185',
    phase: 1.8, speed: 0.88,
    relations: ['calculus-limits', 'calculus-integrals', 'high-school-sequences', 'high-school-log-change-base']
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
    id: 'edu-physics',
    parentId: 'edu-fundamentals',
    type: 'topic',
    label: { zh: '中学物理增强练习', en: 'Physics Enhanced Practice' },
    color: '#0ea5e9',
    phase: 2.2, speed: 0.88
  },

  // ── 二级分组 — 四校自招冲刺 ──
  {
    id: 'physics-zizhao-sprint',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '四校自招冲刺', en: 'Selective-Exam Sprint' },
    color: '#f43f5e',
    phase: 5.6, speed: 0.80
  },
  {
    id: 'physics-sprint-mechanics',
    parentId: 'physics-zizhao-sprint',
    type: 'article',
    title: { zh: '力学冲刺：正交分解、匀变速、圆周运动、胡克定律与功能关系', en: 'Mechanics Sprint: Decomposition, Kinematics, Circular Motion, Hooke, and Energy' },
    summary: { zh: '为四校联考自招冲刺整理：正交分解、匀变速、重力加速度、功能关系、圆周运动与胡克定律六个考点，每个配方法、推导、详解例题与易错清单。', en: 'Sprint prep for selective exams: decomposition, kinematics, gravity, energy, circular motion, and Hooke law, each with worked examples and pitfalls.' },
    tags: ['Physics', 'Mechanics', 'Exam Prep', 'Kinematics'],
    date: '2026-06-23',
    url: 'posts/physics-sprint-mechanics/index.html',
    color: '#0284c7',
    phase: 0.3, speed: 0.90,
    relations: ['forces-equilibrium', 'uniform-acceleration', 'work-energy', 'physics-sprint-circuits']
  },
  {
    id: 'physics-sprint-circuits',
    parentId: 'physics-zizhao-sprint',
    type: 'article',
    title: { zh: '电路混联：识别结构、等效电阻、电流电压分配与功率', en: 'Series-Parallel Circuits: Structure, Equivalent R, I/U Sharing, and Power' },
    summary: { zh: '用一个贯穿全文的例题，把电路混联的识别结构、等效电阻、电流电压分配、电功率与电表动态分析串成一条解题流程。', en: 'One running example threads series-parallel circuits: reading structure, equivalent resistance, current and voltage sharing, power, and dynamic meter analysis.' },
    tags: ['Physics', 'Circuits', 'Exam Prep', 'Ohm'],
    date: '2026-06-23',
    url: 'posts/physics-sprint-circuits/index.html',
    color: '#7c3aed',
    phase: 1.0, speed: 0.88,
    relations: ['dc-circuits', 'physics-sprint-mechanics']
  },

  // ── 二级分组 — 力学 ──
  {
    id: 'physics-mechanics',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '力学', en: 'Mechanics' },
    color: '#0284c7',
    phase: 0.0, speed: 0.90
  },
  {
    id: 'describing-motion',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '运动的描述：位移、速度与加速度', en: 'Describing Motion: Displacement, Velocity & Acceleration' },
    summary: { zh: '从跑步计时到汽车仪表盘，建立位移、速度、加速度三大运动学量的直觉，掌握矢量与标量的区别。', en: 'Builds intuition for displacement, velocity, and acceleration through everyday motion scenarios.' },
    tags: ['Physics', 'Kinematics', 'Velocity', 'Acceleration'],
    date: '2026-04-17',
    url: 'posts/describing-motion/index.html',
    color: '#0284c7',
    phase: 0.2, speed: 0.92,
    relations: ['uniform-acceleration']
  },
  {
    id: 'uniform-acceleration',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '匀变速直线运动：公式与自由落体', en: 'Uniform Acceleration & Free Fall' },
    summary: { zh: '推导匀变速运动三大公式，用自由落体和刹车问题演示应用，配合v-t图像分析。', en: 'Derives the three kinematic equations, applies them to free fall and braking problems with v-t graph analysis.' },
    tags: ['Physics', 'Kinematics', 'Free Fall', 'v-t Graph'],
    date: '2026-04-17',
    url: 'posts/uniform-acceleration/index.html',
    color: '#0284c7',
    phase: 0.6, speed: 0.90,
    relations: ['describing-motion', 'forces-equilibrium']
  },
  {
    id: 'forces-equilibrium',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '力与平衡：重力、弹力、摩擦力', en: 'Forces & Equilibrium: Gravity, Elasticity, Friction' },
    summary: { zh: '系统梳理三种常见力的产生条件和计算方法，掌握受力分析与力的合成分解技巧。', en: 'Systematically covers gravity, elastic force, and friction with force analysis and vector decomposition.' },
    tags: ['Physics', 'Forces', 'Equilibrium', 'Friction'],
    date: '2026-04-17',
    url: 'posts/forces-equilibrium/index.html',
    color: '#0284c7',
    phase: 1.0, speed: 0.88,
    relations: ['uniform-acceleration', 'newtons-laws']
  },
  {
    id: 'newtons-laws',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '牛顿运动定律：从惯性到 F=ma', en: "Newton's Laws: From Inertia to F=ma" },
    summary: { zh: '从太空失重到电梯超重，用实例拆解牛顿三大定律，训练整体法与隔离法解题。', en: "Explores Newton's three laws through weightlessness and elevator problems, training system and isolation methods." },
    tags: ['Physics', 'Newton', 'F=ma', 'Inertia'],
    date: '2026-04-17',
    url: 'posts/newtons-laws/index.html',
    color: '#0284c7',
    phase: 1.4, speed: 0.86,
    relations: ['forces-equilibrium', 'circular-motion']
  },
  {
    id: 'circular-motion',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '圆周运动：从旋转木马到卫星轨道', en: 'Circular Motion: From Carousels to Satellite Orbits' },
    summary: { zh: '讲解线速度、角速度、向心力和向心加速度，用转弯、卫星、离心机等场景强化理解与计算。', en: 'Covers linear/angular speed, centripetal force and acceleration through turning, satellites, and centrifuge scenarios.' },
    tags: ['Physics', 'Circular Motion', 'Centripetal Force', 'Mechanics'],
    date: '2026-04-16',
    url: 'posts/circular-motion/index.html',
    color: '#0284c7',
    phase: 1.8, speed: 0.90,
    relations: ['newtons-laws', 'gravitation']
  },
  {
    id: 'gravitation',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '万有引力与航天：从苹果到卫星', en: 'Universal Gravitation & Spaceflight' },
    summary: { zh: '从牛顿苹果到三大宇宙速度，掌握万有引力定律、天体运动和卫星变轨的核心计算。', en: 'From Newton\'s apple to cosmic velocities, mastering gravitational law, celestial motion and orbital maneuvers.' },
    tags: ['Physics', 'Gravitation', 'Satellite', 'Cosmic Velocity'],
    date: '2026-04-17',
    url: 'posts/gravitation/index.html',
    color: '#0284c7',
    phase: 2.2, speed: 0.88,
    relations: ['circular-motion', 'work-energy']
  },
  {
    id: 'work-energy',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '功与能：动能定理与机械能守恒', en: 'Work & Energy: Kinetic Energy Theorem & Conservation' },
    summary: { zh: '用过山车和弹弓场景建立功、动能、势能概念，掌握动能定理和机械能守恒定律的解题套路。', en: 'Builds work-energy concepts through roller coasters and slingshots, mastering kinetic energy theorem and conservation.' },
    tags: ['Physics', 'Work', 'Energy', 'Conservation'],
    date: '2026-04-17',
    url: 'posts/work-energy/index.html',
    color: '#0284c7',
    phase: 2.6, speed: 0.86,
    relations: ['gravitation', 'momentum']
  },
  {
    id: 'momentum',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '动量：碰撞中的守恒与变化', en: 'Momentum: Conservation in Collisions' },
    summary: { zh: '从台球碰撞到火箭推进，掌握动量定理和动量守恒定律，区分弹性与非弹性碰撞。', en: 'From billiard collisions to rocket propulsion, mastering impulse-momentum theorem and conservation law.' },
    tags: ['Physics', 'Momentum', 'Collision', 'Conservation'],
    date: '2026-04-17',
    url: 'posts/momentum/index.html',
    color: '#0284c7',
    phase: 3.0, speed: 0.84,
    relations: ['work-energy']
  },
  {
    id: 'buoyancy-principle',
    parentId: 'physics-mechanics',
    type: 'article',
    title: { zh: '浮力：从液体压强到阿基米德原理', en: 'Buoyancy: From Liquid Pressure to Archimedes' },
    summary: { zh: '用称重、沉浮、盐水、潜艇四个可调实验，把液体压强、阿基米德原理与浮沉条件连成一条因果链，覆盖中考与自招。', en: 'Four adjustable labs link liquid pressure, the Archimedes principle, and float-sink conditions into one causal chain for exam prep.' },
    tags: ['Physics', 'Buoyancy', 'Archimedes', 'Pressure'],
    date: '2026-06-07',
    url: 'posts/buoyancy-principle/index.html',
    color: '#0284c7',
    phase: 3.4, speed: 0.82,
    relations: ['forces-equilibrium', 'work-energy']
  },

  // ── 二级分组 — 热学 ──
  {
    id: 'physics-thermodynamics',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '热学', en: 'Thermodynamics' },
    color: '#ea580c',
    phase: 1.2, speed: 0.88
  },
  {
    id: 'molecular-kinetic-theory',
    parentId: 'physics-thermodynamics',
    type: 'article',
    title: { zh: '分子动理论与内能', en: 'Molecular Kinetic Theory & Internal Energy' },
    summary: { zh: '从扩散现象到布朗运动，理解分子运动规律与内能概念，掌握温度的微观本质。', en: 'From diffusion to Brownian motion, understanding molecular dynamics, internal energy, and temperature at microscale.' },
    tags: ['Physics', 'Molecular', 'Internal Energy', 'Temperature'],
    date: '2026-04-17',
    url: 'posts/molecular-kinetic-theory/index.html',
    color: '#ea580c',
    phase: 0.3, speed: 0.90,
    relations: ['thermodynamics-laws']
  },
  {
    id: 'thermodynamics-laws',
    parentId: 'physics-thermodynamics',
    type: 'article',
    title: { zh: '热力学定律：从蒸汽机到熵', en: 'Laws of Thermodynamics: From Steam Engines to Entropy' },
    summary: { zh: '用发动机和冰箱场景讲解热力学第一、第二定律，理解能量转化的方向性与效率极限。', en: 'Explains first and second laws through engines and refrigerators, understanding energy conversion directionality.' },
    tags: ['Physics', 'Thermodynamics', 'Entropy', 'Heat Engine'],
    date: '2026-04-17',
    url: 'posts/thermodynamics-laws/index.html',
    color: '#ea580c',
    phase: 1.5, speed: 0.88,
    relations: ['molecular-kinetic-theory']
  },

  // ── 二级分组 — 电磁学 ──
  {
    id: 'physics-electromagnetism',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '电磁学', en: 'Electromagnetism' },
    color: '#7c3aed',
    phase: 2.4, speed: 0.86
  },
  {
    id: 'electrostatics',
    parentId: 'physics-electromagnetism',
    type: 'article',
    title: { zh: '静电场：从库仑定律到电势能', en: 'Electrostatics: From Coulomb\'s Law to Electric Potential Energy' },
    summary: { zh: '用气球摩擦和闪电引入静电概念，掌握库仑定律、电场强度、电势差和电势能的计算。', en: 'Introduces electrostatics through balloon friction and lightning, mastering Coulomb\'s law and electric potential.' },
    tags: ['Physics', 'Electrostatics', 'Coulomb', 'Electric Field'],
    date: '2026-04-17',
    url: 'posts/electrostatics/index.html',
    color: '#7c3aed',
    phase: 0.3, speed: 0.90,
    relations: ['dc-circuits']
  },
  {
    id: 'dc-circuits',
    parentId: 'physics-electromagnetism',
    type: 'article',
    title: { zh: '恒定电流：欧姆定律与电路分析', en: 'DC Circuits: Ohm\'s Law & Circuit Analysis' },
    summary: { zh: '从手电筒到复杂电路，掌握欧姆定律、串并联、电功率和内外电路的分析方法。', en: 'From flashlights to complex circuits, mastering Ohm\'s law, series/parallel, power, and internal resistance analysis.' },
    tags: ['Physics', 'Circuits', 'Ohm', 'Resistance'],
    date: '2026-04-17',
    url: 'posts/dc-circuits/index.html',
    color: '#7c3aed',
    phase: 1.0, speed: 0.88,
    relations: ['electrostatics', 'magnetic-fields']
  },
  {
    id: 'magnetic-fields',
    parentId: 'physics-electromagnetism',
    type: 'article',
    title: { zh: '磁场：安培力与洛伦兹力', en: 'Magnetic Fields: Ampere Force & Lorentz Force' },
    summary: { zh: '从指南针到电动机，理解磁场的产生与性质，掌握安培力和洛伦兹力的方向判断与计算。', en: 'From compass to motors, understanding magnetic fields, mastering Ampere and Lorentz force direction and calculation.' },
    tags: ['Physics', 'Magnetic Field', 'Ampere', 'Lorentz Force'],
    date: '2026-04-17',
    url: 'posts/magnetic-fields/index.html',
    color: '#7c3aed',
    phase: 1.7, speed: 0.86,
    relations: ['dc-circuits', 'electromagnetic-induction']
  },
  {
    id: 'electromagnetic-induction',
    parentId: 'physics-electromagnetism',
    type: 'article',
    title: { zh: '电磁感应：法拉第定律与楞次定律', en: 'Electromagnetic Induction: Faraday\'s & Lenz\'s Laws' },
    summary: { zh: '用发电机和无线充电场景讲解电磁感应，掌握感应电动势的计算和楞次定律的方向判断。', en: 'Explains electromagnetic induction through generators and wireless charging, mastering EMF calculation and Lenz\'s law.' },
    tags: ['Physics', 'Induction', 'Faraday', 'Lenz'],
    date: '2026-04-17',
    url: 'posts/electromagnetic-induction/index.html',
    color: '#7c3aed',
    phase: 2.4, speed: 0.84,
    relations: ['magnetic-fields', 'ac-em-waves']
  },
  {
    id: 'ac-em-waves',
    parentId: 'physics-electromagnetism',
    type: 'article',
    title: { zh: '交变电流与电磁波', en: 'Alternating Current & Electromagnetic Waves' },
    summary: { zh: '从家用电器到手机信号，理解交流电的产生与变压器原理，认识电磁波谱与通信应用。', en: 'From home appliances to phone signals, understanding AC generation, transformers, EM spectrum and communications.' },
    tags: ['Physics', 'AC', 'Transformer', 'EM Waves'],
    date: '2026-04-17',
    url: 'posts/ac-em-waves/index.html',
    color: '#7c3aed',
    phase: 3.1, speed: 0.82,
    relations: ['electromagnetic-induction']
  },

  // ── 二级分组 — 光学 ──
  {
    id: 'physics-optics',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '光学', en: 'Optics' },
    color: '#0d9488',
    phase: 3.6, speed: 0.84
  },
  {
    id: 'geometric-optics',
    parentId: 'physics-optics',
    type: 'article',
    title: { zh: '几何光学：反射、折射与全反射', en: 'Geometric Optics: Reflection, Refraction & Total Internal Reflection' },
    summary: { zh: '从镜子到光纤，掌握反射定律、折射定律（斯涅尔定律）和全反射的条件与应用。', en: 'From mirrors to fiber optics, mastering reflection, Snell\'s law of refraction, and total internal reflection.' },
    tags: ['Physics', 'Optics', 'Reflection', 'Refraction'],
    date: '2026-04-17',
    url: 'posts/geometric-optics/index.html',
    color: '#0d9488',
    phase: 0.4, speed: 0.90,
    relations: ['wave-optics']
  },
  {
    id: 'wave-optics',
    parentId: 'physics-optics',
    type: 'article',
    title: { zh: '波动光学：干涉、衍射与偏振', en: 'Wave Optics: Interference, Diffraction & Polarization' },
    summary: { zh: '从肥皂泡彩虹到偏光太阳镜，理解光的波动性，掌握双缝干涉和薄膜干涉的条纹分析。', en: 'From soap bubbles to polarized sunglasses, understanding wave nature of light with double-slit and thin-film analysis.' },
    tags: ['Physics', 'Wave Optics', 'Interference', 'Diffraction'],
    date: '2026-04-17',
    url: 'posts/wave-optics/index.html',
    color: '#0d9488',
    phase: 1.8, speed: 0.88,
    relations: ['geometric-optics']
  },
  {
    id: 'convex-lens-imaging',
    parentId: 'physics-optics',
    type: 'article',
    title: { zh: '凸透镜成像规律：物距决定像的性质', en: 'Convex Lens Imaging: How Object Distance Sets the Image' },
    summary: { zh: '用一张可拖动的光路图把物距、像距与像的虚实、正倒、大小连成连续规律，覆盖照相机、投影仪、放大镜与眼睛。', en: 'A draggable ray diagram links object distance, image distance, and the image\'s nature into one rule, covering camera, projector, magnifier and the eye.' },
    tags: ['Physics', 'Optics', 'Convex Lens', 'Imaging'],
    date: '2026-06-07',
    url: 'posts/convex-lens-imaging/index.html',
    color: '#0d9488',
    phase: 3.0, speed: 0.86,
    relations: ['geometric-optics']
  },

  // ── 二级分组 — 近代物理 ──
  {
    id: 'physics-modern',
    parentId: 'edu-physics',
    type: 'topic',
    label: { zh: '近代物理', en: 'Modern Physics' },
    color: '#be185d',
    phase: 4.8, speed: 0.82
  },
  {
    id: 'quantum-intro',
    parentId: 'physics-modern',
    type: 'article',
    title: { zh: '量子世界初探：光电效应与波粒二象性', en: 'Quantum Intro: Photoelectric Effect & Wave-Particle Duality' },
    summary: { zh: '从紫外线验钞到光电门，理解光电效应实验与爱因斯坦光子说，认识德布罗意波。', en: 'From UV counterfeit detection to photoelectric gates, understanding the photoelectric effect and de Broglie waves.' },
    tags: ['Physics', 'Quantum', 'Photoelectric', 'Wave-Particle'],
    date: '2026-04-17',
    url: 'posts/quantum-intro/index.html',
    color: '#be185d',
    phase: 0.5, speed: 0.88,
    relations: ['atomic-nuclear']
  },
  {
    id: 'atomic-nuclear',
    parentId: 'physics-modern',
    type: 'article',
    title: { zh: '原子与原子核：核反应与放射性衰变', en: 'Atoms & Nuclei: Nuclear Reactions & Radioactive Decay' },
    summary: { zh: '从卢瑟福散射到核电站，掌握原子结构模型、核反应方程和放射性衰变的半衰期计算。', en: 'From Rutherford scattering to nuclear power, mastering atomic models, nuclear equations and half-life calculations.' },
    tags: ['Physics', 'Nuclear', 'Radioactivity', 'Half-life'],
    date: '2026-04-17',
    url: 'posts/atomic-nuclear/index.html',
    color: '#be185d',
    phase: 1.8, speed: 0.86,
    relations: ['quantum-intro']
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
    phase: 1.8, speed: 0.85,
    hidden: true
  },
  {
    id: 'shanghai-zhongkao',
    parentId: 'edu-subject',
    type: 'topic',
    label: { zh: '上海中考', en: 'Shanghai Zhongkao' },
    color: '#dc2626',
    phase: 0.8, speed: 0.85
  },
  {
    id: 'shanghai-gaokao',
    parentId: 'edu-subject',
    type: 'topic',
    label: { zh: '上海高考', en: 'Shanghai Gaokao' },
    color: '#b91c1c',
    phase: 2.4, speed: 0.83
  },

  // ════════════════════════════════════════
  // 文章 — 上海高考升学规划
  // ════════════════════════════════════════
  {
    id: 'jianping-clubs-gaokao-planning',
    parentId: 'shanghai-gaokao',
    type: 'article',
    title: {
      zh: '建平中学社团活动与高考升学：选择、投入与三年规划',
      en: 'Jianping High School Clubs and Gaokao Planning: Selection, Commitment, and a Three-Year Plan'
    },
    summary: {
      zh: '核验 9 个重点社团与六大学科主教练体系，比较投入、竞争力、报名路径、官方资源、升学资格与退出条件。',
      en: 'Evaluates nine clubs and six coach-led olympiad tracks by workload, standing, entry route, official resources, admissions eligibility, and exit criteria.'
    },
    tags: ['高考规划', '建平中学', '社团活动', '学科竞赛', '综合评价', '强基计划'],
    date: '2026-07-26',
    url: 'posts/jianping-clubs-gaokao-planning/index.html',
    color: '#e11d48',
    phase: 3.8, speed: 0.81,
    relations: ['four-schools-profile', 'sh-top12-gaokao', 'shanghai-zizhao-2026']
  },
  {
    id: 'jianping-class-14-dali',
    parentId: 'shanghai-gaokao',
    type: 'article',
    title: {
      zh: '建平中学14班「大理班」：选拔、培养、出口与适配边界',
      en: 'Jianping High School Class 14: Selection, Training, Outcomes, and Fit'
    },
    summary: {
      zh: '区分建平14班的官方事实与跨届传言，核验分班、选科重组、课表、师资和出口，并给出优势、风险与当届核验清单。',
      en: 'Separates official evidence from recurring claims about Jianping Class 14, covering placement, curriculum, staffing, outcomes, risks, and verification.'
    },
    tags: ['建平中学', '14班', '大理班', '理科创新班', '学科竞赛', '高考出口'],
    date: '2026-07-29',
    url: 'posts/jianping-class-14-dali/index.html',
    color: '#be123c',
    phase: 4.2, speed: 0.80,
    relations: ['jianping-clubs-gaokao-planning', 'sh-top12-gaokao', 'shanghai-zizhao-2026']
  },
  {
    id: 'zhongkao-volunteer-strategy',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海中考志愿填报策略：建平地杰考生冲击四校的路径规划',
      en: 'Shanghai Zhongkao Volunteer Strategy: Path Planning for Jianping Dijie Students Targeting Top 4 Schools'
    },
    summary: {
      zh: '基于建平地杰考生二模与考后估分，校准到区、到校、统一批次志愿策略与安全链。',
      en: 'Updates quota, school-quota, and unified-batch choices using second-mock data plus post-exam score estimates.'
    },
    tags: ['中考', '志愿填报', '四校', '策略规划'],
    date: '2026-06-23',
    url: 'posts/zhongkao-volunteer-strategy/index.html',
    color: '#dc2626',
    phase: 0.4, speed: 0.9,
    relations: ['zhongkao-policy-data', 'zhongkao-scoreline-2026-forecast']
  },
  {
    id: 'zhongkao-policy-data',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海中考政策解读与四校录取数据分析（2022–2026）',
      en: 'Shanghai Zhongkao Policy Analysis & Top 4 Schools Admission Data (2022–2026)'
    },
    summary: {
      zh: '梳理新中考招录制度，汇总四校 2022–2025 各批次分数线，并补充 2026 浦东名额分配到区与到校计划数及年度趋势，提供量化决策依据。',
      en: 'Reviews reformed admission system, Top 4 score data (2022–2025), plus 2026 Pudong quota allocation counts and year-over-year trends.'
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
    relations: ['zhongkao-volunteer-strategy', 'zhongkao-policy-data', 'sh-top12-gaokao']
  },
  {
    id: 'sh-top12-gaokao',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '上海四校八大 · 近三年高考出口数据全景（2023–2025）',
      en: 'Shanghai Top 12 High Schools: 3-Year Gaokao Outcomes (2023–2025)'
    },
    summary: {
      zh: '汇总四校与八大 2023–2025 清北、复交、综评、重本率四项指标，标注来源档次并指出公开数据缺口。',
      en: 'Compiles 2023–2025 Tsinghua/Peking, Fudan/SJTU, comprehensive and top-tier rates for 12 Shanghai schools with sourced citations.'
    },
    tags: ['中考', '高考', '四校', '八大', '出口数据'],
    date: '2026-04-15',
    url: 'posts/sh-top12-gaokao/index.html',
    color: '#be123c',
    phase: 5.2, speed: 0.80,
    relations: ['four-schools-profile', 'zhongkao-policy-data', 'zhongkao-volunteer-strategy']
  },
  {
    id: 'shanghai-zizhao-2026',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '2026 上海四校・四校分校・八大自主招生指南：名额、报名、流程与材料',
      en: 'Shanghai 2026 Self-Admission Guide: Top 4, Branches & Eight Schools'
    },
    summary: {
      zh: '汇总 2026 上海四校、四校分校与八大共 21 校自主招生名额（合计 1580），并逐校列出报名时间、材料投递系统与综合测试日期（6/23 填报、材料 6/21 起投、测试 7/1–3、7/5 签约）。',
      en: '2026 self-admission quotas for 21 top Shanghai high schools (1580 total) plus per-school registration dates, submission systems, and test dates.'
    },
    tags: ['中考', '自主招生', '四校', '八大', '名额'],
    date: '2026-06-10',
    url: 'posts/shanghai-zizhao-2026/index.html',
    color: '#9f1239',
    phase: 3.4, speed: 0.84,
    relations: ['four-schools-profile', 'zhongkao-policy-data', 'zhongkao-volunteer-strategy']
  },
  {
    id: 'zhongkao-quota-2025-analysis',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '2025 上海中考名额分配数据分析：浦东初中到校录取分与到区线对比',
      en: 'Shanghai 2025 Quota Admission Analysis: Pudong School-Quota Scores vs District Lines'
    },
    summary: {
      zh: '基于官方两份分数线，提取浦东 138 所初中在 14 所目标高中的到校最低分并与到区线对比，配可交互的高中排名与初中横向对比工具。',
      en: 'Extracts Pudong 138 junior-high school-quota floors at 14 target high schools vs district lines, with interactive ranking and comparison tools.'
    },
    tags: ['中考', '名额分配', '浦东', '录取数据', '交互工具'],
    date: '2026-06-20',
    url: 'posts/zhongkao-quota-2025-analysis/index.html',
    color: '#e11d48',
    phase: 1.6, speed: 0.83,
    relations: ['zhongkao-policy-data', 'four-schools-profile', 'shanghai-zizhao-2026']
  },

  {
    id: 'zhongkao-scoreline-2026-forecast',
    parentId: 'shanghai-zhongkao',
    type: 'article',
    title: {
      zh: '2026 上海中考分数线预测：浦东到区、统一批次与控分线区间',
      en: 'Shanghai 2026 Zhongkao Scoreline Forecast: Pudong Quota and Unified Batch'
    },
    summary: {
      zh: '交叉核验官方专家点评、2023-2025 分数与 2026 计划，预测浦东控分线 / 到区 / 统招区间，并核查「偏易上浮」给出上升区间。',
      en: 'Cross-checks expert reviews, 2023-2025 scores and 2026 seats to forecast Pudong cutoffs, and tests the easier-2026 claim with upward ranges.'
    },
    tags: ['中考', '分数线预测', '浦东', '名额分配', '试卷难度'],
    date: '2026-06-22',
    url: 'posts/zhongkao-scoreline-2026-forecast/index.html',
    color: '#dc2626',
    phase: 2.1, speed: 0.82,
    relations: ['zhongkao-policy-data', 'zhongkao-quota-2025-analysis', 'shanghai-zizhao-2026']
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

  {
    id: 'ai-radar-2026w17',
    parentId: 'ai-radar',
    type: 'article',
    title: {
      zh: 'AI 时事雷达 2026W17：桌面超级应用之争、Opus 4.7 与编码 Agent 估值狂潮',
      en: 'AI Radar 2026W17: Desktop Super App Wars, Opus 4.7 & Coding Agent Valuation Surge'
    },
    summary: {
      zh: '覆盖 2026 年 4 月第四周 15 件 AI 大事：Codex 桌面超级应用升级、Opus 4.7 夺回榜首、Cursor $50B 估值、Tokenmaxxing 生产力警告。',
      en: '15 AI events from late April 2026: Codex desktop super app, Opus 4.7 reclaims top spot, Cursor $50B valuation, Tokenmaxxing productivity warning.'
    },
    tags: ['AI Radar', 'Weekly', 'Industry Analysis'],
    date: '2026-04-20',
    url: 'posts/ai-radar-2026w17/index.html',
    color: '#0d8f8c',
    phase: 5.5, speed: 0.85,
    relations: ['ai-radar-2026w16', 'enterprise-agent-arch']
  },

  {
    id: 'ai-radar-2026w18',
    parentId: 'ai-radar',
    type: 'article',
    title: {
      zh: 'AI 时事雷达 2026W18：GPT-5.5 与 DeepSeek V4 同周对决、Anthropic 千亿融资、Agent 算力重塑',
      en: 'AI Radar 2026W18: GPT-5.5 vs DeepSeek V4, Anthropic\u2019s $40B Round, Agent Compute Reshape'
    },
    summary: {
      zh: '2026/4/20-26 共 15 件 AI 大事：GPT-5.5 上线、DeepSeek V4 开源 1.6T、Google 拟投 Anthropic $40B、Copilot 限流。',
      en: '15 events from 2026/04/20-26: GPT-5.5 launch, DeepSeek V4 Pro open-source 1.6T, Google\u2019s $40B Anthropic bet, Mythos dual crisis, GitHub Copilot throttle.'
    },
    tags: ['AI Radar', 'Weekly', 'Industry Analysis'],
    date: '2026-04-27',
    url: 'posts/ai-radar-2026w18/index.html',
    color: '#0d8f8c',
    phase: 6.0, speed: 0.85,
    relations: ['ai-radar-2026w17', 'enterprise-agent-arch']
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
  {
    id: 'ideogram4-local-deployment',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'Ideogram 4 开源模型解读与双机本地部署评估：M4 Max 64GB 与 RTX 3090 24GB',
      en: 'Ideogram 4 Open-Weight Model: Architecture Breakdown and Local Deployment for M4 Max 64GB and RTX 3090 24GB'
    },
    summary: {
      zh: '解读 Ideogram 4（9.3B 单流 DiT + Qwen3-VL-8B 文本编码器）架构与量化，评估 M4 Max 64GB 与 RTX 3090 24GB 的本地可运行性。',
      en: 'Breaks down Ideogram 4 (9.3B single-stream DiT + Qwen3-VL-8B encoder) and assesses local feasibility on M4 Max 64GB and RTX 3090 24GB.'
    },
    tags: ['Ideogram 4', 'Text-to-Image', 'Local AI', 'Quantization', 'Apple Silicon'],
    date: '2026-06-27',
    url: 'posts/ideogram4-local-deployment/index.html',
    color: '#a855f7',
    phase: 5.1, speed: 0.85,
    relations: ['m4-max-local-models', 'text-to-image-prompting']
  },

  // ════════════════════════════════════════
  // 文章 — Hermes Agent 框架深度研究
  // ════════════════════════════════════════
  {
    id: 'hermes-agent-comparison',
    parentId: 'fc-agentic',
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
  // 文章 — Obscura 无头浏览器
  // ════════════════════════════════════════
  {
    id: 'obscura-headless-browser',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'Obscura：为 AI Agent 与抓取而生的 Rust 无头浏览器',
      en: 'Obscura: A Rust Headless Browser Built for AI Agents and Scraping'
    },
    summary: {
      zh: '解读 h4ckf0r0day/obscura：6 个 Rust crate、9 个 CDP Domain、Stealth 反指纹 + 3,520 域名拦截，30 MB 对比 Chromium 200+ MB。',
      en: 'h4ckf0r0day/obscura teardown: 6 Rust crates, 9 CDP domains, built-in stealth with 3,520 blocked trackers, 30 MB vs Chromium 200+ MB.'
    },
    tags: ['Headless Browser', 'Rust', 'CDP', 'Web Scraping', 'AI Agent Tool'],
    date: '2026-05-07',
    url: 'posts/obscura-headless-browser/index.html',
    color: '#f97316',
    phase: 5.4, speed: 0.85,
    relations: ['enterprise-agent-arch', 'agentic-skill-exec']
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
  },

  // ════════════════════════════════════════
  // 文章 — MAI-Image-2 模型研究
  // ════════════════════════════════════════
  {
    id: 'mai-image-2-efficient',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: '微软 MAI-Image-2 模型家族：自研文生图的效率与商业落地',
      en: 'Microsoft MAI-Image-2 Family: Efficient Self-Developed Text-to-Image for Commercial Use'
    },
    summary: {
      zh: '解析微软首个自研文生图模型 MAI-Image-2 / MAI-Image-2e 的架构、API 规格、竞品对比与适用场景。MAI-Image-2e 快 22%、效率 4 倍。',
      en: 'Microsoft\'s first self-developed text-to-image models MAI-Image-2/2e: diffusion architecture, API specs, and use cases. 2e is 22% faster, 4x more efficient.'
    },
    tags: ['Text-to-Image', 'MAI-Image-2', 'Azure Foundry', 'Diffusion Model'],
    date: '2026-04-16',
    url: 'posts/mai-image-2-efficient/index.html',
    color: '#0ea5e9',
    phase: 5.8, speed: 0.86,
    relations: ['text-to-image-prompting', 'z-image-turbo-prompting']
  },

  // ════════════════════════════════════════
  // 文章 — Z-Image-Turbo 提示词技巧
  // ════════════════════════════════════════
  {
    id: 'z-image-turbo-prompting',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'Z-Image-Turbo 提示词撰写技巧：从基础公式到高级策略',
      en: 'Z-Image-Turbo Prompt Tips: From Basic Formulas to Advanced Strategies'
    },
    summary: {
      zh: '梳理通义 Z-Image-Turbo 的提示词公式、五维词典、PE 推理链与文字渲染专项技巧，6B 参数 8 步推理开源 SOTA。',
      en: 'Z-Image-Turbo prompt guide: formulas, 5-dimension dictionary, PE reasoning chain, text rendering tips. 6B params, 8-step open-source SOTA.'
    },
    tags: ['Prompt Engineering', 'Text-to-Image', 'Z-Image', 'Alibaba'],
    date: '2026-04-19',
    url: 'posts/z-image-turbo-prompting/index.html',
    color: '#ea6428',
    phase: 4.2, speed: 0.88,
    relations: ['text-to-image-prompting', 'mai-image-2-efficient']
  },

  // ════════════════════════════════════════
  // 文章 — Fish Audio S2 模型研究
  // ════════════════════════════════════════
  {
    id: 'fish-audio-s2',
    parentId: 'ai-research-model',
    type: 'article',
    title: {
      zh: 'Fish Audio S2 技术研究：Dual-AR 架构、细粒度语音控制与流式部署边界',
      en: 'Fish Audio S2 Technical Analysis: Dual-AR TTS, Fine-Grained Control, and Streaming Limits'
    },
    summary: {
      zh: '基于技术报告、README 与模型卡，拆解 Fish Audio S2 的 Dual-AR 架构、词级语音控制、流式延迟口径与研究许可边界。',
      en: 'Analyzes Fish Audio S2 across Dual-AR architecture, word-level speech control, streaming latency metrics, and its research-license boundary.'
    },
    tags: ['Text-to-Speech', 'Fish Audio', 'Voice Cloning', 'Speech Model'],
    date: '2026-05-03',
    url: 'posts/fish-audio-s2/index.html',
    color: '#38bdf8',
    phase: 1.1, speed: 0.86,
    relations: ['m4-max-local-models', 'llm-wiki']
  },

  // ════════════════════════════════════════
  // 根节点 — 智能体平台
  // ════════════════════════════════════════
  {
    id: 'agent-platform',
    parentId: 'ai-project-practice',
    type: 'topic',
    label: { zh: '智能体平台', en: 'Agent Platform' },
    color: '#0891b2',
    phase: 0.8, speed: 0.52
  },

  // ════════════════════════════════════════
  // 文章 — 智能体平台设计理念
  // ════════════════════════════════════════
  {
    id: 'agent-platform-philosophy',
    parentId: 'agent-platform',
    type: 'article',
    title: {
      zh: '智能体平台设计理念：边界划分、八条目标与五条已知不适用场景',
      en: 'Agent Platform Design Philosophy: Boundary, Eight Goals and Five Known Limitations'
    },
    summary: {
      zh: '将“抽出智能体运行时”表述为可证伪假设，给出 8 条可观测目标、4 条非目标、与 8 个主流方案的逆维度对比、5 条不适用场景与 IntellyGoal 实证锚点。',
      en: 'Frames runtime extraction as falsifiable: 8 observable goals, 4 non-goals, 7-axis vendor comparison, 5 limitations, IntellyGoal anchor.'
    },
    tags: ['Agent Platform', 'Architecture', 'Multi-Tenant', 'MCP'],
    date: '2026-05-04',
    url: 'posts/agent-platform-philosophy/index.html',
    color: '#0891b2',
    phase: 0.4, speed: 0.9,
    relations: ['agent-platform-requirements', 'agent-platform-hld', 'enterprise-agent-architecture']
  },

  // ════════════════════════════════════════
  // 文章 — 智能体平台需求规格说明书
  // ════════════════════════════════════════
  {
    id: 'agent-platform-requirements',
    parentId: 'agent-platform',
    type: 'article',
    title: {
      zh: '智能体平台需求规格说明书：34 条功能与 24 条非功能需求',
      en: 'Agent Platform SRS: 34 Functional and 24 Non-Functional Requirements'
    },
    summary: {
      zh: 'IEEE 830 风格需求规格，含六类角色、两条核心用例、按 MoSCoW 分级的 FR/NFR 编号体系与 GA 验收准则。',
      en: 'IEEE 830 style SRS: six actors, two core use cases, MoSCoW-prioritized FR/NFR numbering, and GA acceptance criteria.'
    },
    tags: ['Agent Platform', 'Requirements', 'SRS', 'MoSCoW'],
    date: '2026-05-04',
    url: 'posts/agent-platform-requirements/index.html',
    color: '#0891b2',
    phase: 1.4, speed: 0.88,
    relations: ['agent-platform-philosophy', 'agent-platform-hld', 'agent-platform-api-spec']
  },

  // ════════════════════════════════════════
  // 文章 — 智能体平台高阶设计
  // ════════════════════════════════════════
  {
    id: 'agent-platform-hld',
    parentId: 'agent-platform',
    type: 'article',
    title: {
      zh: '智能体平台高阶设计：三层视图、11 组件与 5 条数据流',
      en: 'Agent Platform HLD: Three-Layer View, 11 Components and 5 Data Flows'
    },
    summary: {
      zh: '给出三层架构（外部接触面/内部模块/组件细节）、11 核心组件清单、5 条关键数据流、Compact/Scale-Out 双部署形态与 Seed/Overlay 自演化设计。',
      en: 'Three-layer architecture, 11 components, 5 data flows, Compact/Scale-Out deployments and Seed/Overlay self-evolution design.'
    },
    tags: ['Agent Platform', 'High-Level Design', 'LangGraph', 'LiteLLM'],
    date: '2026-05-04',
    url: 'posts/agent-platform-hld/index.html',
    color: '#0891b2',
    phase: 2.5, speed: 0.86,
    relations: ['agent-platform-requirements', 'agent-platform-api-spec', 'agent-platform-intellygoal']
  },

  // ════════════════════════════════════════
  // 文章 — 智能体平台接口规范说明书
  // ════════════════════════════════════════
  {
    id: 'agent-platform-api-spec',
    parentId: 'agent-platform',
    type: 'article',
    title: {
      zh: '智能体平台接口规范说明书：REST + SSE + MCP 单通道',
      en: 'Agent Platform API Specification: REST + SSE + MCP Single Channel'
    },
    summary: {
      zh: '17 个 REST 端点契约、SSE 流式协议、MCP 出站约定（超时/熔断/重试/响应大小），统一错误模型与限流策略。',
      en: 'Defines 17 REST endpoints, SSE streaming, MCP outbound contract with guardrails, unified error model and rate-limit policy.'
    },
    tags: ['Agent Platform', 'API Spec', 'MCP', 'REST'],
    date: '2026-05-04',
    url: 'posts/agent-platform-api-spec/index.html',
    color: '#0891b2',
    phase: 3.7, speed: 0.84,
    relations: ['agent-platform-hld', 'agent-platform-intellygoal', 'function-calling-best-practices']
  },

  // ════════════════════════════════════════
  // 文章 — 智能体平台应用实践（IntellyGoal）
  // ════════════════════════════════════════
  {
    id: 'agent-platform-intellygoal',
    parentId: 'agent-platform',
    type: 'article',
    title: {
      zh: '智能体平台应用实践：IntellyGoal 项目四阶段迁移',
      en: 'Agent Platform Practice: IntellyGoal Four-Phase Migration'
    },
    summary: {
      zh: '记录 IntellyGoal 从业务内嵌智能体迁移到平台首个 MCP 租户的四个阶段，含 5 Skill 拓扑、commit_goal_plan 实现样例与六条经验教训。',
      en: 'IntellyGoal four-phase migration from in-app agent to first MCP tenant: 5 skills, commit_goal_plan sample and six lessons learned.'
    },
    tags: ['Agent Platform', 'Case Study', 'IntellyGoal', 'MCP'],
    date: '2026-05-04',
    url: 'posts/agent-platform-intellygoal/index.html',
    color: '#0891b2',
    phase: 4.9, speed: 0.82,
    relations: ['agent-platform-hld', 'agent-platform-api-spec', 'intellygoal-fc-review']
  },

  // ════════════════════════════════════════
  // 文章 — AI 时代 Application 进化论
  // ════════════════════════════════════════
  {
    id: 'ai-era-app-evolution',
    parentId: 'ai-research-agent',
    type: 'article',
    title: {
      zh: 'Application × AI × Agent：范式综述与前沿设计',
      en: 'Application × AI × Agent: Pattern Survey and Frontier Design'
    },
    summary: {
      zh: 'App / AI / Agent 三元景观把已有 5 种范式定位为概览，深入研究 App-Centric × Agentic 角落的 5 条研究流派、设计原则与 7 个未解问题。',
      en: 'Trinity map of App/AI/Agent: 5 stable patterns as overview, deep dive on the App-Centric x Agentic frontier — 5 research streams and 7 open questions.'
    },
    tags: ['Application', 'AI Agent', 'UI Paradigm', 'Product Strategy', 'Compound AI'],
    date: '2026-05-21',
    url: 'posts/ai-era-application-evolution/index.html',
    color: '#f97316',
    phase: 3.6, speed: 0.84,
    relations: ['enterprise-agent-arch', 'copilot-deep-dive', 'agentic-ai-adoption']
  },

  // ════════════════════════════════════════
  // 文章 — pi Coding Agent Harness
  // ════════════════════════════════════════
  {
    id: 'pi-coding-harness',
    parentId: 'fc-agentic',
    type: 'article',
    title: {
      zh: 'Pi × 自研智能体平台：以 Aye aye Captain 为样本的融合与替代决策',
      en: 'Pi and Custom Agent Platforms: Integration and Replacement Decisions from Aye aye Captain'
    },
    summary: {
      zh: '以 Aye aye Captain 的 28 个 Playbook 与 48 个 MCP 工具为样本，判断 Pi 的执行平面价值，并给出接入架构、改造边界与分阶段试点。',
      en: 'Uses Aye aye Captain\'s 28 playbooks and 48 MCP tools to define Pi\'s execution-plane value, integration architecture, platform changes, and staged pilot.'
    },
    tags: ['Pi', 'Agent Platform', 'Agent Runtime', 'MCP', 'Multi-Model', 'Aye aye Captain'],
    date: '2026-07-28',
    url: 'posts/pi-coding-harness/index.html',
    color: '#6366f1',
    phase: 4.1, speed: 0.83,
    relations: ['agent-platform-philosophy', 'copilot-harness-eng', 'hermes-agent-comparison', 'mcp-principles-development']
  }
];

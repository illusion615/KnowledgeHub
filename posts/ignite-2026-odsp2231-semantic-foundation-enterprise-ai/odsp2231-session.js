/* posts/ignite-2026-odsp2231-semantic-foundation-enterprise-ai/odsp2231-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-odsp2231-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/6b1bf64d-6336-4584-b794-271dc5f60c8c',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787855007168001twda-AAAAAAAAAAAAAAAAAAAA',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/6b1bf64d-6336-4584-b794-271dc5f60c8c',
    speakersZh: 'Brillio / ADAM Semantic Fabric 工程团队（Microsoft Ignite 2026 生态专场）',
    speakersEn: 'Brillio / ADAM Semantic Fabric Engineering Team (Microsoft Ignite 2026 Partner Session)'
  };

  var CHAPTERS = [
    {
      id: 'overview',
      time: '00:00:08 – 00:01:08',
      tabZh: '00:08 语义鸿沟与治理总览',
      tabEn: '00:08 Semantic Gap & Dashboard',
      titleZh: '企业 AI 的真正瓶颈：从“能生成答案”走向全组织一致的业务语义层',
      titleEn: 'The Real Enterprise AI Bottleneck: From Generating Text to Shared Business Meaning',
      summaryZh: '开场直指企业落地智能体的核心矛盾——难点不在于生成文本，而在于确保回答锚定统一的业务概念、关系与政策；通过 Overview Dashboard 集中审视活跃项目、本体节点、待审队列与摄取管线。',
      summaryEn: 'Frames the core enterprise AI challenge—making sure every answer reflects a consistent understanding of business concepts, relationships, and policies—starting from the consolidated governance Overview Dashboard.',
      bulletsZh: [
        '00:00:13 — 核心痛点拆解：大模型生成答案易，跨部门保持一致业务理解难',
        '00:00:23 — Semantic Fabric 定位：将业务概念、关系、政策与数据编织为可复用知识层',
        '00:00:42 — 治理视角看板：统一追踪活跃项目、本体资产、专家审阅队列与摄取作业进度'
      ],
      bulletsEn: [
        '00:00:13 — Core pain point: generating answers is easy; grounding them in consistent business meaning is hard',
        '00:00:23 — Semantic Fabric role: links business concepts, relationships, policies, and data into a reusable layer',
        '00:00:42 — Governance dashboard: tracks active projects, ontology nodes, review queues, and ingestion jobs'
      ]
    },
    {
      id: 'marketplace',
      time: '00:01:08 – 00:02:33',
      tabZh: '01:08 本体市场与可视化设计器',
      tabEn: '01:08 Marketplace & Designer',
      titleZh: '4 大分组 44 套可复用本体库：从 BFO/FIBO 标准资产到企业专属扩展',
      titleEn: '44 Reusable Ontologies Across 4 Groups: From BFO & FIBO Standards to Custom Extensions',
      summaryZh: '展示 Ontology Marketplace 内置的顶层本体（BFO、DOLCE、SUMO）、中层跨域标准（PROV-O、SKOS、FOAF）与行业模型（FIBO、DCAT），并在 Ontology Designer 中检视类、对象属性、数据属性与命名空间。',
      summaryEn: 'Walks through the Ontology Marketplace spanning upper (BFO, DOLCE, SUMO), cross-domain (PROV-O, SKOS, FOAF), and industry (FIBO, DCAT) ontologies, plus visual class and property modeling in Ontology Designer.',
      bulletsZh: [
        '00:01:19 — 四级本体资产体系：顶层本体、中层跨域本体、行业本体（如金融 FIBO）与企业定制扩展',
        '00:01:36 — 资产元数据透明化：直接查看归属人、命名空间、36 个类与 40 项对象属性等完整结构（以 BFO 为例）',
        '00:02:12 — Ontology Designer：支持从零新建或克隆公共本体库，按企业实际业务规则增补属性与关系'
      ],
      bulletsEn: [
        '00:01:19 — Four ontology tiers: foundational/upper, middle cross-domain, industry-specific (FIBO), and org extensions',
        '00:01:36 — Metadata & graph inspection: exposes ownership, namespaces, classes (e.g., 36 in BFO), and object/data properties',
        '00:02:12 — Ontology Designer: create from scratch or clone library baselines to enrich domain-specific relationships'
      ]
    },
    {
      id: 'doc2onto',
      time: '00:02:33 – 00:03:46',
      tabZh: '02:33 文档生本体与专家门禁',
      tabEn: '02:33 Doc-to-Ontology & SME Gate',
      titleZh: 'Doc-to-Ontology 七步自动抽取与领域专家多视图审批门禁',
      titleEn: '7-Step Doc-to-Ontology Extraction Pipeline & Domain Expert Review Gate',
      summaryZh: '演示上传业务分类与能力问题文档（DOCX），通过 Tika 解析、语义分块、大模型概念抽取与去重合并自动产出 251 个候选 OWL 类；随后由领域专家在层级、树状与辐射视图中逐项审批或驳回。',
      summaryEn: 'Demonstrates uploading business taxonomy documents to run a 7-step extraction pipeline yielding 251 candidate OWL classes, followed by mandatory domain-expert approval across Hierarchy, Tree, and Radial graph views.',
      bulletsZh: [
        '00:02:49 — 七步自动抽取管线：Blob 上传 → Tika 文本提取 → 语义分块 → 领域分类 → 概念抽取 → 去重合并 → OWL 生成校验',
        '00:03:06 — 人在回路治理铁律：大模型负责提速，领域专家必须在入库前对生成概念执行审阅、修改、批准或驳回',
        '00:03:27 — 多维拓扑核验：提供 Hierarchy（层级）、Tree（树状）与 Radial（辐射）三种图谱视图核查 251 个金融风控类'
      ],
      bulletsEn: [
        '00:02:49 — 7-step pipeline: Blob upload, Tika extraction, semantic chunking, LLM domain/concept extraction, dedupe & OWL validation',
        '00:03:06 — Human-in-the-loop gate: domain experts review, modify, approve, or reject generated concepts before publication',
        '00:03:27 — Multi-layout verification: inspect 251 extracted classes across Hierarchy, Tree, and Radial ontology views'
      ]
    },
    {
      id: 'kgpipeline',
      time: '00:03:46 – 00:05:12',
      tabZh: '03:46 十步 OWL 知识图谱管线',
      tabEn: '03:46 10-Step OWL KG Pipeline',
      titleZh: '连接生产库与 OWL KG 十步管线：Jena 校验、RDFS 推理与 SHACL 零违例落盘',
      titleEn: '10-Step OWL KG Pipeline: Jena Validation, RDFS Closure, Fuseki Store & Zero-Violation SHACL',
      summaryZh: '将受控本体与企业业务数据库连接，运行十步可执行管线（解析→推理→存储→校验→嵌入→索引→查询）：实测解析 39 个类与 1,312 条三元组，经 RDFS 闭包增补至 1,319 条并零违例写入 Fuseki 命名图谱。',
      summaryEn: 'Connects governed OWL files with live databases in a 10-step pipeline: validating 39 classes via Jena, inferring +7 RDFS triples (1,319 total), passing SHACL shape constraints with 0 violations, and storing in Fuseki.',
      bulletsZh: [
        '00:03:49 — 跨源统一底座：打通企业数据库、业务应用与文档模型，与 OneLake、Fabric IQ 及 Purview 治理协同',
        '00:04:29 — 确定性推理与校验：Jena API 校验 39 个类，RDFS 闭包从 1,312 条三元组推演出 +7 条隐含关系（总计 1,319 条）',
        '00:04:42 — 生产级图谱就绪：写入 Fuseki SPARQL 命名图谱端点并通过 SHACL 形状约束检查（0 违例），在 KG 工作台直观呈现'
      ],
      bulletsEn: [
        '00:03:49 — Unified enterprise fabric: connects operational databases and apps, aligned with OneLake, Fabric IQ, and Purview',
        '00:04:29 — Deterministic reasoning: Jena validates 39 OWL classes; RDFS closure infers +7 triples to reach 1,319 total triples',
        '00:04:42 — Production graph store: persists in Fuseki named graph with 0 SHACL violations and opens inside the KG Workspace'
      ]
    },
    {
      id: 'nlq2sql',
      time: '00:05:12 – 00:06:10',
      tabZh: '05:12 NLQ→SPARQL→SQL 与多智能体复用',
      tabEn: '05:12 NLQ→SPARQL→SQL & Agent Reuse',
      titleZh: '自然语言双跳查询（NLQ → SPARQL → SQL）：赋能 Copilot Studio 与 Foundry 智能体',
      titleEn: 'Dual-Hop Natural Language Grounding (NLQ → SPARQL → SQL) for Copilot Studio & Foundry',
      summaryZh: '演示业务人员用日常自然语言直接提问，AI Assist 先通过 SPARQL 检索知识图谱中的 7 项商户维度与外键属性映射，再自动生成针对底层 PostgreSQL 数据库的精确 SQL，实现跨智能体可解释复用。',
      summaryEn: 'Shows business users asking plain-language questions as AI Assist resolves 7 ontology-to-table mappings via SPARQL and emits exact PostgreSQL queries—delivering reusable context for Copilot Studio, Fabric, and Foundry.',
      bulletsZh: [
        '00:05:18 — 告别底层表结构门槛：业务用户无需掌握 SPARQL/SQL 语法或物理表连接键，直接用自然语言提问',
        '00:05:32 — 图谱锚定 SQL 生成：先匹配 DimMerchant、merchants_table 等 7 条本体映射，再精确生成生产库 SQL 查询',
        '00:05:47 — 跨生态规模化复用：同一套受控语义底座可同时服务 Fabric 数据智能体、Copilot Studio 与 Microsoft Foundry'
      ],
      bulletsEn: [
        '00:05:18 — Zero schema barrier: everyday business questions without writing query languages or memorizing table schemas',
        '00:05:32 — Graph-grounded SQL synthesis: resolves 7 merchant class/property mappings in KG before generating PostgreSQL SQL',
        '00:05:47 — Enterprise-wide reuse: one governed semantic layer serving Fabric data agents, Copilot Studio, and Microsoft Foundry'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initOdsp2231Theater() {
    var controls = document.querySelector('[data-sandbox-controls="odsp2231-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="odsp2231-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'odsp2231-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'odsp2231-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var bullets = en ? item.bulletsEn : item.bulletsZh;
      var liHtml = '';
      for (i = 0; i < bullets.length; i++) {
        liHtml += '<li>' + bullets[i] + '</li>';
      }

      var mediaInner = playerLoaded
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 ODSP2231 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="ODSP2231 Semantic foundation for enterprise AI official session cover" loading="lazy" />' +
          '<button type="button" class="odsp2231-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="odsp2231-play-pill">' + (en ? '▶ Load Official Video Player (6 min)' : '▶ 点击加载官方内嵌点播流（6 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="odsp2231-theater-layout">',
        '  <div class="odsp2231-player-wrap">' + mediaInner + '</div>',
        '  <div class="odsp2231-meta">',
        '    <span class="odsp2231-code">ODSP2231 · ' + item.time + '</span>',
        '    <h4 class="odsp2231-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="odsp2231-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="odsp2231-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="odsp2231-highlights">' + liHtml + '</ul>',
        '    <div class="odsp2231-actions">',
        '      <a class="odsp2231-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="odsp2231-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript' : '⬇ 下载官方字幕讲稿') + '</a>',
        '      <a class="odsp2231-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite ODSP2231 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var loadBtn = stage.querySelector('[data-load-embed="1"]');
      if (loadBtn) {
        loadBtn.addEventListener('click', function () {
          playerLoaded = true;
          render();
        });
      }
    }

    render();

    var observer = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        if (mutations[m].attributeName === 'lang') {
          render();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOdsp2231Theater);
  } else {
    initOdsp2231Theater();
  }
})();

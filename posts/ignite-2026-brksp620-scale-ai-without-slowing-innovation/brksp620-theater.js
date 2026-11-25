/* posts/ignite-2026-brksp620-scale-ai-without-slowing-innovation/brksp620-theater.js */
(function () {
  'use strict';

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787854983849001t0Pn-1791588289570001CwkS';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/0c2ed92a-aa6c-40d4-af67-1217526502bd';

  var CHAPTERS = [
    {
      id: 'genie-origins',
      tabZh: '00:00 GENIE 起源与一万智能体',
      tabEn: '00:00 GENIE & 10K Agents',
      code: 'BRKSP620 · 00:00 – 11:39',
      titleZh: '从单人病毒式许可试验到数千人活跃的企业主编排器 GENIE',
      titleEn: 'From Solo Viral Copilot Studio License to the GENIE Master Orchestrator',
      speakersZh: 'Nitin Shinde（WinWire / NTT DATA 战略客户高级副总裁）& Nick Taylor（Gilead Sciences IT 创新）',
      speakersEn: 'Nitin Shinde (SVP Strategic Accounts, WinWire / NTT DATA) & Nick Taylor (IT Innovation, Gilead Sciences)',
      poster: './media/brksp620-session-cover.jpg',
      summaryZh: '复盘 14 年合作伙伴 WinWire 与吉利德科学（Gilead Sciences）的企业级 AI 演进：当全公司自建智能体突破 10,000 个时，如何从个人搭建 GENIE（吉利德企业导航与信息引擎）跃迁为多部门共建子智能体的主编排器，并推进 2024 年 300 席 Copilot 试点落地。',
      summaryEn: 'Traces 14-year partners WinWire and Gilead Sciences scaling beyond 10,000 employee-built agents—evolving GENIE from a solo viral-license experiment into a federated Teams orchestrator alongside the 2024 300-license Copilot rollout.',
      pointsZh: [
        '00:03:24 — 需求井喷：Agent Builder 等入口催生逾 10,000 个智能体，需区分真正智能体、Power Automate 与宏',
        '00:05:06 — GENIE 诞生：凭 Copilot Studio 试用许可单枪匹马打通休假政策、园区地图与工单创建，自然汇聚数千活跃用户',
        '00:08:43 — 成年人介入与架构收敛：整顿 SharePoint 数据地基，由 IT 先行构建主编排器供药政等部门挂载子智能体',
        '00:09:24 — 300 席受监管试点：2024 年跨 15+ 团队分发 300 张许可培育自发先锋，边扩围边拉通法务确立访问红线'
      ],
      pointsEn: [
        '00:03:24 — Demand Explosion: Over 10,000 custom agents emerge; triage distinguishes true agents from flows and macros',
        '00:05:06 — Birth of GENIE: Built solo on a viral Copilot Studio license, organically reaching thousands of active Teams users',
        '00:08:43 — Federated Orchestrator: Tidying SharePoint first so domain groups plug sub-agents into one IT-governed orchestrator',
        '00:09:24 — 300-Seat Regulated Rollout: Splitting 300 licenses in 2024 to cultivate organic champions while co-designing legal guardrails'
      ]
    },
    {
      id: 'ideation-portal',
      tabZh: '11:40 立项治理与创意门户',
      tabEn: '11:40 Ideation & Idea Portal',
      code: 'BRKSP620 · 11:40 – 21:30',
      titleZh: '前驻工程师嵌入业务、WinWire 创意门户与智能体辅助治理',
      titleEn: 'Forward-Deployed Engineering, Centralized Idea Portal & Agent-Assisted Governance',
      speakersZh: 'Nick Taylor（Gilead Sciences）& Nitin Shinde（WinWire）',
      speakersEn: 'Nick Taylor (Gilead Sciences) & Nitin Shinde (WinWire)',
      poster: './media/brksp620-ntt-title-slide.jpg',
      summaryZh: '阐明“立项期治理（Governance at Ideation）”实战机制：以内部前驻工程师（FDE）角色前置拉通 IT 业务伙伴、负责任 AI 委员会与安全合规；联合 WinWire 打造创意门户消灭影子 IT 与本机裸跑原型，并用可观测性平台锁定真实工时投资回报。',
      summaryEn: 'Unpacks Governance at Ideation: embedding forward-deployed engineers with IT business partners and the Responsible AI Council, routing requests through the WinWire-built Idea Portal to stop localhost shadow AI, and baselining workflow ROI.',
      pointsZh: [
        '00:12:04 — 跨部门技能借用：借用法务或公共事务智能体技能预审初稿，将法务红线批注从 50 处锐减至 5 处',
        '00:15:00 — 创意门户（Idea Portal）：WinWire 协助构建统一入口直连负责任 AI 管线，AI 聚类秒查跨部门重复立项',
        '00:17:43 — 拦截本机即兴编码：叫停员工在 localhost 裸跑连接业务系统的原型，守护制药企业患者安全底线',
        '00:19:07 — 智能体辅助治理与实质在环：可观测平台盘点真正握有执行权的智能体与前后工时基线，拒绝形式化点按钮审批'
      ],
      pointsEn: [
        '00:12:04 — Cross-Team Skill Borrowing: Using Legal/PA agent skills on first drafts cuts redlines from 50 down to 5',
        '00:15:00 — Idea Portal Pipeline: Co-built with WinWire to replace shadow AI, clustering duplicate ideas into the RAI pipeline',
        '00:17:43 — Reality Check on Vibe Coding: Stopping localhost prototypes in a regulated medicine-making environment',
        '00:19:07 — Observability & Meaningful HITL: Mapping true workflow agency and cycle-time baselines without rubber-stamp clicking'
      ]
    },
    {
      id: 'safe-kitchen',
      tabZh: '21:31 分布式责任与三大纲领',
      tabEn: '21:31 Safe Kitchen & 3 Takeaways',
      code: 'BRKSP620 · 21:31 – 29:25',
      titleZh: '“安全厨房”赋能哲学、高管以身作则与规模化三大行动纲领',
      titleEn: 'The Safe Kitchen Model, Executive Role-Modeling & Three Scaling Takeaways',
      speakersZh: 'Nick Taylor（Gilead Sciences）& Nitin Shinde（WinWire）',
      speakersEn: 'Nick Taylor (Gilead Sciences) & Nitin Shinde (WinWire)',
      poster: './media/brksp620-speakers-slide.jpg',
      summaryZh: '借“好厨师可以来自任何角落”阐释上线后的分布式所有权：IT 负责搭建不怕卫生检查员封店的安全厨房（护栏底座），让懂业务的团队亲手掌勺；高管亲自展示真实提示词而非虚假演示，提炼持续育人、给创意铺路、协同扩围三大核心纲领。',
      summaryEn: 'Frames distributed ownership through the Safe Kitchen analogy—IT builds compliant infrastructure so domain experts can cook safely—paired with authentic executive Copilot usage and three actionable scaling pillars.',
      pointsZh: [
        '00:21:58 — 安全厨房隐喻：业务专家学工具远快于技术人员补行业课，IT 职责是提供合规厨房而非包办每道菜',
        '00:23:17 — 高管躬身入局：摒弃摆拍演示，让员工亲眼看到管理层用席位制 Copilot 与自建提示词解决真实日常问题',
        '00:25:23 — 三大纲领之一与二：持续陪伴人员心智成长（超越发账号）+ 给创意铺设含护栏的清晰晋升通道',
        '00:26:56 — 三大纲领之三（协同扩围）：深挖部分团队采用率停留在 50% 的根因，联动业务、HR 与先锋共同推进'
      ],
      pointsEn: [
        '00:21:58 — Safe Kitchen Ownership: Business experts learn AI tools fast when IT provides a compliant kitchen and cooking school',
        '00:23:17 — Leaders Using AI Live: Ditch staged demos; executives share real prompts and team agents on seat-based Copilot',
        '00:25:23 — Takeaways 1 & 2: Support people continuously beyond license access, and give ideas a trusted guarded path',
        '00:26:56 — Takeaway 3 (Scale Together): Diagnose why certain cohorts sit at 50% adoption alongside HR, IT, and champions'
      ]
    },
    {
      id: 'qa-sandboxes-dlp',
      tabZh: '29:26 现场问答：沙盒、红队与选型',
      tabEn: '29:26 Live Q&A: Sandboxes & DLP',
      code: 'BRKSP620 · 29:26 – 45:08',
      titleZh: '听众实战问答：隔离租户沙盒、SharePoint 红队防泄漏与多云选型护城河',
      titleEn: 'Audience Q&A: Isolated Sandboxes, SharePoint DLP Red-Teaming & Work IQ Moat',
      speakersZh: 'Nick Taylor（Gilead Sciences）答现场 IT 主管与数据负责人提问',
      speakersEn: 'Nick Taylor (Gilead Sciences) Live Audience Q&A',
      poster: './media/brksp620-fireside-stage.jpg',
      summaryZh: '直面四轮高含金量现场追问：如何用独立租户加合成数据说服安全网络团队放行探索；如何靠企业架构预审模式实现按风险成比例极速审批；如何通过 SharePoint 红队与 DLP 标签锁死机密/PII/PHI 并开启 PubMed 与 ClinicalTrials.gov 连接器试点；为何在 AWS/OpenAI/Anthropic 对比中锚定微软安全与 Work IQ 护城河。',
      summaryEn: 'Answers four candid audience questions: funding isolated synthetic-data tenants for security buy-in, fast-tracking signed enterprise architecture patterns, SharePoint red-teaming with Secret/PII/PHI DLP blocks plus PubMed/ClinicalTrials.gov pilots, and why Microsoft security and Work IQ won over standalone clouds.',
      pointsZh: [
        '00:30:56 — 破局安全顾虑：由创新预算出资设立独立租户与合成数据沙盒，命中企业架构签名模式即享极速审批（0→1→N）',
        '00:35:13 — 高管去焦虑赋能：新任 CIO 鼎力支持，预设上下文让极简提示词产出惊艳分子官能团交互课件，推开 AI Skills Navigator',
        '00:39:39 — 数据红队与连接器：小范围疯狂红队测试修复早期 DLP 规则生效延迟，严拦 Secret/PII/PHI，大会当日启动 PubMed 与 ClinicalTrials.gov 试点',
        '00:43:01 — 多云选型终局：横评 OpenAI、Anthropic 与 AWS Q 后锚定日常业务数据驻留地，Work IQ 开箱跨源检索折服原 GPT 阵营高管'
      ],
      pointsEn: [
        '00:30:56 — Winning Security Trust: Isolated tenants with synthetic data plus fast-track approval for signed EA patterns',
        '00:35:13 — Executive Upskilling: CIO-backed 1:1 coaching, interactive molecule functional-group slides, and AI Skills Navigator',
        '00:39:39 — Data Red-Teaming & Connectors: Blocking Secret/PII/PHI via SharePoint DLP and launching PubMed & ClinicalTrials.gov pilots',
        '00:43:01 — Platform Selection Moat: Evaluating OpenAI, Anthropic, and AWS Q before anchoring on Microsoft security and built-in Work IQ'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brksp620-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brksp620-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brksp620-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var c = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brksp620-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? c.tabEn : c.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var pts = en ? item.pointsEn : item.pointsZh;
      var liHtml = '';
      for (i = 0; i < pts.length; i++) {
        liHtml += '<li>' + pts[i] + '</li>';
      }

      var mediaHtml = '';
      if (playerLoaded) {
        mediaHtml = '<iframe src="' + EMBED_URL + '" title="Microsoft Ignite 2026 BRKSP620 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
      } else {
        mediaHtml = [
          '<img src="' + item.poster + '" alt="' + item.code + '" loading="lazy" />',
          '<div class="brksp620-player-overlay">',
          '  <button type="button" class="brksp620-play-trigger" data-load-medius="1">' + (en ? '▶ Load Official Medius Stream (45m)' : '▶ 加载微软官方点播流（45 分钟全片）') + '</button>',
          '</div>'
        ].join('\n');
      }

      stage.innerHTML = [
        '<div class="brksp620-theater-layout">',
        '  <div class="brksp620-player-box">' + mediaHtml + '</div>',
        '  <div class="brksp620-meta">',
        '    <span class="brksp620-code">' + item.code + '</span>',
        '    <h4 class="brksp620-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brksp620-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="brksp620-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brksp620-highlights">' + liHtml + '</ul>',
        '    <div class="brksp620-actions">',
        '      <a class="brksp620-btn is-primary" href="' + EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口播放官方视频') + '</a>',
        '      <a class="brksp620-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Official BRKSP620 Session Page' : '↗ 访问 Ignite BRKSP620 官方主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var trigger = stage.querySelector('[data-load-medius="1"]');
      if (trigger) {
        trigger.addEventListener('click', function () {
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
    document.addEventListener('DOMContentLoaded', initTheater);
  } else {
    initTheater();
  }
})();

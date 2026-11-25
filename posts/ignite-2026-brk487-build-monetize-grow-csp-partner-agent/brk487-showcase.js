/* posts/ignite-2026-brk487-build-monetize-grow-csp-partner-agent/brk487-showcase.js */
(function () {
  'use strict';

  var SESSION_META = {
    code: 'BRK487 · Breakout · 45 Min',
    speakersZh: 'Naila Byrne (中小企业与渠道全球总监) & Jayden Lee (高级业务战略经理) · 嘉宾：Pat Petersen & Dolly Bali (RSM US LLP)',
    speakersEn: 'Naila Byrne (Global Director, SME&C) & Jayden Lee (Sr. Business Strategy Manager) · Guests: Pat Petersen & Dolly Bali (RSM US LLP)',
    poster: './media/brk487-session-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/dc4cab96-4d61-4a7a-a622-5d9149ccb179',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856647353001EOcm-1791588267111001Ciqj',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/dc4cab96-4d61-4a7a-a622-5d9149ccb179'
  };

  var CHAPTERS = [
    {
      id: 'ch1',
      tabZh: '00:00 市场缺口与 IQ 底座',
      tabEn: '00:00 SMB Gap & IQ Stack',
      window: '00:00 – 06:55',
      titleZh: '第一幕：Forrester $72K 服务缺口、内置分发势能与 Microsoft IQ 上下文层',
      titleEn: 'Act I: Forrester $72K Services Gap, Built-In Reach & Microsoft IQ Context',
      summaryZh: 'Naila Byrne 开场用四家合作伙伴量化战果切入，援引 Forrester TEI 对 125 人典型中小企业的测算指出：单客 3 年 $95K 总潜力中仍有 $72K 服务空间无人承接，并拆解 4.5 亿 M365 席位与五大 IQ 上下文底座。',
      summaryEn: 'Naila Byrne opens with four partner proof points and Forrester TEI modeling (125-employee SMB): $72K of the $95K 3-year opportunity sits untapped across services, backed by 450M+ M365 seats and Microsoft IQ.',
      pointsZh: [
        '00:45 — 四大实战标杆：DEMV 周活 +65%、Bespoke 赢单率 +20%、CallRevu 转化 +15%、Qualiserve 每分钟处理 500 万份税务文档',
        '01:12 — Forrester 3 年账本：当前平均仅捕获 ~$23K 转售层，现代化、数据就绪与智能体服务占 ~$72K',
        '02:35 — 生态规模：月活智能体年内增长 6 倍，Microsoft Foundry 客户突破 120,000 家且收入同比翻三倍',
        '04:38 — Microsoft IQ 五源合流：Work IQ、Fabric IQ、Foundry IQ、Web IQ 与 3rd-Party IQ 共同沉淀专属 Customer IQ'
      ],
      pointsEn: [
        '00:45 — Partner Proof: DEMV +65% weekly users, Bespoke +20% win rate, CallRevu +15% leads, Qualiserve 5M tax docs/min',
        '01:12 — Forrester 3-Yr Model: ~$23K captured today vs. ~$72K untapped across Modernization, Data Readiness & Agentic Services',
        '02:35 — Ecosystem Scale: Monthly active agent usage up 6x YTD; Microsoft Foundry reached 120,000 customers (3x YoY revenue)',
        '04:38 — Microsoft IQ Layer: Work IQ, Fabric IQ, Foundry IQ, Web IQ & 3rd-Party IQ form governed Customer IQ'
      ]
    },
    {
      id: 'ch2',
      tabZh: '06:56 五问分流与双轨收益',
      tabEn: '06:56 5-Q Triage & Path A/B',
      window: '06:56 – 15:25',
      titleZh: '第二幕：HR 智能体同题双解——五问选型矩阵与六层收益拆解（Path A vs. Path B）',
      titleEn: 'Act II: One HR Agent, Two Paths—Five-Question Triage & 6-Stream Earnings',
      summaryZh: 'Jayden Lee 提出五维客户评估法，将同一个 HR 智能体放入两类企业测算首年到手总收入：Copilot Studio 速赢路径放大至 $10K–$18K，Foundry + GitHub 深度集成路径跃升至 $44K–$84K。',
      summaryEn: 'Jayden Lee introduces the five-question triage framework and models Year-1 partner take-home on an HR agent: $2.4K licensing becomes $10K–$18K in Path A, while $15K Azure ACR becomes $44K–$84K in Path B.',
      pointsZh: [
        '07:45 — 五问定路径：评估流程标准化程度、系统连接器、私网安全控制、员工访问终端与伙伴开发能力',
        '09:50 — Path A（Copilot Studio）：无研发小型企业基于 SharePoint 与 Teams 数天上线，每周为 HR 省下 10+ 小时，$2.4K 许可撬动 $10K–$18K 首年收益',
        '11:20 — Path B（GitHub + Foundry）：中型制造企业打通 Workday/ADP 双向写回与车间无证终端，$15K Azure 消耗撬动 $44K–$84K 首年收益',
        '13:45 — 跨越原型鸿沟：用 Foundry 内置评测与链路追踪保障上线质量，用 GitHub CI/CD 让第 10 个智能体交付更快、利润更高'
      ],
      pointsEn: [
        '07:45 — Five Assessment Questions: Process logic, data/connectors, private networking, frontline channels & dev capacity',
        '09:50 — Path A (Copilot Studio): Small firm on SharePoint/Teams goes live in days–weeks, saving 10+ hrs/wk ($2.4K → $10K–$18K)',
        '11:20 — Path B (Foundry + GitHub): Mid-size manufacturer with Workday/ADP write-back & unlicensed kiosks ($15K → $44K–$84K)',
        '13:45 — Prototype to IP: Foundry evals/tracing close the production gap while GitHub CI/CD makes the 10th build far more profitable'
      ]
    },
    {
      id: 'ch3',
      tabZh: '15:26 托管复利与 RSM 对谈',
      tabEn: '15:26 Recurring & RSM Chat',
      window: '15:26 – 35:45',
      titleZh: '第三幕：四智能体复利曲线、CSP 账单优势与 RSM 炉边谈话及现场问答',
      titleEn: 'Act III: Multi-Agent Compounding, CSP FinOps & RSM Fireside Q&A',
      summaryZh: '从单智能体项目切入多智能体托管（第 4 个智能体年经常性收入达 $14.5K 且利润率翻倍）；RSM 总监 Pat Petersen 与联盟负责人 Dolly Bali 登台复盘同编制 10 倍交付、告别工时费及非计费边界切分。',
      summaryEn: 'Scaling from 1st to 4th managed agent reaches ~$14.5K annual recurring revenue while doubling margins; RSM leaders Pat Petersen and Dolly Bali unpack 10x engagement capacity and shifting from T&M to outcome billing.',
      pointsZh: [
        '15:35 — 信任复利扩展：HR 智能体 ($1K–$1.5K) → 应收账款 ($1.5K–$2K) → 销售预测 ($3K–$5K) → 客户支持 ($8K–$12K)，累计达 $14.5K/年',
        '16:35 — CSP 托管护城河：掌握客户账单与用量洞察，提供持续微调、Agent 365 安全治理与 AI FinOps 成本管控',
        '18:55 — RSM Customer Zero 实战：先在内部服务线跑通选型与复用，再向高管层按业务结果（Outcome）而非人天工时（T&M）报价',
        '30:40 — 现场犀利问答：首单可用工时制探明工期水位，第 2–3 单转结果计费；将新模型持续调优与学习成本装入托管服务包'
      ],
      pointsEn: [
        '15:35 — Compounding Ladder: HR ($1K–$1.5K) → AR ($1.5K–$2K) → Sales Forecast ($3K–$5K) → Support ($8K–$12K), hitting ~$14.5K/yr',
        '16:35 — CSP Billing Advantage: Own customer billing & telemetry to deliver ongoing tuning, governance, and AI FinOps',
        '18:55 — RSM Customer Zero: Test internally across service lines first, engage C-suite sponsors, and replace hourly T&M with outcome pricing',
        '30:40 — Live Audience Q&A: De-risk build #1 with T&M if needed, pivot to outcome billing by build #2–3, and absorb model drift into managed retainers'
      ]
    },
    {
      id: 'ch4',
      tabZh: '35:46 赋能资源与 60 天试点',
      tabEn: '35:46 Playbook & 60-Day Pilot',
      window: '35:46 – 38:55',
      titleZh: '第四幕：微软四大赋能支柱、Frontier 认证体系与 60 天破局行动清单',
      titleEn: 'Act IV: Four Microsoft Support Pillars, Frontier Badges & 60-Day Action Plan',
      summaryZh: '收尾汇总技能培训、资质认证（Frontier Partner 专长与智能体能力分）、联合营销物料与激励资金（Frontier Accelerate 与 CSP Incentives），呼吁锁定“1 个客户 + 1 个结果”在 60 天内跑通首单。',
      summaryEn: 'Wraps up with Skilling, Differentiation (Frontier Partner spec & Agent capability score), Go-to-Market kits, and Frontier Accelerate / CSP Incentives—urging partners to launch a focused 60-day pilot.',
      pointsZh: [
        '36:15 — 技能与认证：考取 Frontier Engineer Badge，冲击全新 Frontier Partner 专长认证与智能体伙伴能力评分',
        '36:55 — 激励资金池：组合申请 Frontier Accelerate 里程碑补贴（MCI）与标准 CSP 新工作负载返利及合作营销金',
        '37:30 — 官方作战手册：一站式下载 SMB Partner Playbook（aka.ms/SMBPartnerPlaybook）获取客户访谈探针话术',
        '38:00 — 周一即刻行动：选定 1 个智能体、1 家标杆客户与 1 项可衡量业务结果，在未来 60 天内上线首个可复制试点'
      ],
      pointsEn: [
        '36:15 — Skilling & Proof: Pursue the Frontier Engineer Badge, new Frontier Partner spec, and Agent Partner Capability Score',
        '36:55 — Funding Programs: Stack Frontier Accelerate milestone payouts (MCI) with CSP workload rebates and coop funds',
        '37:30 — Unified Playbook: Download the SMB Partner Playbook (aka.ms/SMBPartnerPlaybook) for discovery scripts and GTM kits',
        '38:00 — Monday Mandate: Pick one agent, one customer, and one measurable outcome to ship a live pilot within 60 days'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk487-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk487-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk487-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk487-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var points = en ? item.pointsEn : item.pointsZh;
      var liHtml = '';
      for (i = 0; i < points.length; i++) {
        liHtml += '<li>' + points[i] + '</li>';
      }

      var mediaInner = playerLoaded
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK487 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRK487 Official Video Thumbnail" loading="lazy" />',
            '<div class="brk487-poster-overlay">',
            '  <button type="button" class="brk487-play-trigger" data-brk487-play="1">' + (en ? '▶ Load Official Medius Stream' : '▶ 在页内加载官方点播播放器') + '</button>',
            '  <span class="brk487-poster-caption">' + (en ? 'Click to mount Microsoft Medius VOD iframe on demand, or open session/PPTX below.' : '点击按需挂载微软 Medius 官方无追踪点播流，或由下方直达议题主页与原版课件。') + '</span>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk487-theater-layout">',
        '  <div class="brk487-player-wrap">',
        mediaInner,
        '  </div>',
        '  <div class="brk487-theater-meta">',
        '    <span class="brk487-theater-code">' + SESSION_META.code + ' · ' + item.window + '</span>',
        '    <h4 class="brk487-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk487-theater-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk487-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk487-theater-points">' + liHtml + '</ul>',
        '    <div class="brk487-theater-actions">',
        '      <a class="brk487-theater-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk487-theater-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk487-theater-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK487 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-brk487-play="1"]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
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

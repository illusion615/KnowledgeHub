/* posts/ignite-2026-thr1004-ai-governance-playbook-scaling-agents/thr1004-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr1004-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/d8dc2aa6-181c-4161-aca5-b79bb677d781',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856598413001Exz7-1791588134591001CWa9',
    mp4Url: 'https://medius.microsoft.com/video/asset/HIGHMP4/d8dc2aa6-181c-4161-aca5-b79bb677d781',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Transcript/d8dc2aa6-181c-4161-aca5-b79bb677d781',
    speakersZh: 'Dux Raymond Sy（Microsoft Regional Director & MVP · AvePoint 首席品牌官）',
    speakersEn: 'Dux Raymond Sy (Microsoft Regional Director & MVP · Chief Brand Officer, AvePoint)'
  };

  var CHAPTERS = [
    {
      id: 'safety-net-tiers',
      time: '00:00:46 – 00:08:05',
      tabZh: '00:46 金门安全网与三层分级',
      tabEn: '00:46 Safety Net & 3 Tiers',
      titleZh: '1936 金门大桥安全网隐喻与“治理权限跃迁而非每个智能体”',
      titleEn: '1936 Golden Gate Safety Net & Governing the Authority Jump Across Three Tiers',
      summaryZh: 'Dux Raymond Sy 从 1936 年金门大桥总工程师 Joseph Strauss 铺设安全网救下 19 条生命反而加速工期切入，提出智能体发布治理核心铁律：治理“权限跃迁”，将智能体划分为辅助型、交易型与后果型三档。',
      summaryEn: 'Dux Raymond Sy opens with Joseph Strauss hanging a safety net 220 feet above water in 1936—saving 19 workers and speeding bridge construction—then defines three agent tiers: Assistive, Transactional, and Consequential.',
      bulletsZh: [
        '00:00:50 — 1936 年金门大桥离水面 220 英尺施工，铺设桥底安全网救下 19 人（Halfway to Hell Club）且工期更快',
        '00:03:00 — 灵魂拷问：上个月公司有多少个“存量智能体”修改了指令或新增能力并悄然上线？',
        '00:05:09 — 三层定级：辅助型仅需台账+责任人；交易型（建单/改库）须走发布记录；后果型（动钱/医疗）叠加高管签批'
      ],
      bulletsEn: [
        '00:00:50 — Golden Gate Bridge (1936, 220 ft above water): safety net caught 19 falling workers and accelerated crews',
        '00:03:00 — Operational blind spot: tracking how many existing agents shipped instruction or capability changes last month',
        '00:05:09 — Three tiers: Assistive (inventory + owner), Transactional (release record), Consequential (release record + sign-off)'
      ]
    },
    {
      id: 'framework-leaders',
      time: '00:08:06 – 00:12:52',
      tabZh: '08:06 发布记录与标杆案例',
      tabEn: '08:06 Release Record & Leaders',
      titleZh: '一页发布记录模板、六步周一裁决框架与三大企业实战数据',
      titleEn: 'One-Page Release Record, Six-Step Framework & Enterprise Customer Benchmarks',
      summaryZh: '展示面向业务责任人与安全主管的 3 页 592 词 Word 版《智能体发布记录》模板，对齐 NIST、ISO 与欧盟人工智能法案，并拆解 State Farm、喜力（HEINEKEN）与爱科集团（AGCO）的门禁成效。',
      summaryEn: 'Unpacks the concise 592-word Agent Release Record template aligned with NIST, ISO, and the EU AI Act, backed by production metrics from State Farm, HEINEKEN, and AGCO.',
      bulletsZh: [
        '00:08:23 — 每次新增工具、凭据、目标库或受众即建一份发布记录，所有条目凭证据判定（Proved / Open / N/A）',
        '00:10:20 — 六步闭环（Identify → Describe → Configure → Test → Promote → Verify）收束至 SHIP / HOLD / CONTAIN 裁决',
        '00:12:12 — 标杆实证：State Farm 从 3,000+ 智能体身份严选 41 个投产；喜力仅靠 5 人借助托管环境与流水线治理 8,000+ 环境'
      ],
      bulletsEn: [
        '00:08:23 — One jump, one release record: answer every row with evidence (Proved, Open, or N/A), never memory',
        '00:10:20 — Six steps culminate in one Monday decision: SHIP (proved), HOLD (unresolved prerequisite), or CONTAIN (unexpected)',
        '00:12:12 — Benchmarks: State Farm cleared 41 builds from 3,000+ agent IDs; HEINEKEN governs 8,000+ environments with 5 staff'
      ]
    },
    {
      id: 'identify-describe',
      time: '00:12:53 – 00:15:31',
      tabZh: '12:53 Step 1–2 基线与边界',
      tabEn: '12:53 Step 1–2 Baseline & Scope',
      titleZh: 'Step 1 识别只读基线与 Step 2 用一句话写清越界禁区',
      titleEn: 'Step 1 Identify Read-Only Baseline & Step 2 Describe Proposed vs. Excluded Scope',
      summaryZh: '在 Copilot Studio 中核验 Ignite Procurement Demo（Version 1）仅查询 DEMO-101~103 的只读基线，并明确界定本次申请新增“创建与提交”权限，同时将“审批支出与支付发票”划入严禁越界区。',
      summaryEn: 'Inspects Ignite Procurement Demo v1 inside Copilot Studio (read-only across DEMO-101 to DEMO-103) and defines the one-sentence jump to Create + Submit while explicitly excluding Approve and Pay.',
      bulletsZh: [
        '00:13:48 — Step 1 盘点基线：仅含 DEMO-101（$500）、DEMO-102（$600）、DEMO-103（$300）合成记录，未挂载任何外部动作工具',
        '00:14:15 — 系统提示词写明核心警示：“基于指令的礼貌拒答绝不等于平台强制执行的授权边界”',
        '00:14:45 — Step 2 划定范围：允许从只读跃迁至创建与提交申请，但严禁触碰尾端审批与供应商付款动作'
      ],
      bulletsEn: [
        '00:13:48 — Step 1 baseline check: v1 reads synthetic DEMO-101 ($500), DEMO-102 ($600), and DEMO-103 ($300) with zero action tools',
        '00:14:15 — Core principle embedded in v1 instructions: "An instruction-based refusal is not evidence of enforced authorization"',
        '00:14:45 — Step 2 scope definition: adds Create + Submit authority while explicitly excluding Approve spending and Pay invoices'
      ]
    },
    {
      id: 'configure-boundary',
      time: '00:15:32 – 00:21:41',
      tabZh: '15:32 Step 3 平台强制拦截',
      tabEn: '15:32 Step 3 Native 403 Block',
      titleZh: 'Step 3 跨控制面边界配置与 Power Platform 原生 HTTP 403 阻断实证',
      titleEn: 'Step 3 Boundary Controls, Purview Three Questions & Native HTTP 403 Validation',
      summaryZh: '串联 Agent 365、Power Platform 管理中心、Entra 与 Purview 配置真实边界；实机演示单环境数据策略触发底层连接器返回 Forbidden（BlockedConnector: Http）原生拦截证据。',
      summaryEn: 'Maps controls across Agent 365, PPAC, Entra, and Purview, then validates an environment-scoped HTTP Boundary policy returning a native platform "Forbidden" (BlockedConnector: Http) error.',
      bulletsZh: [
        '00:17:40 — 在 Power Platform 管理中心创建连接器策略，将租户编写的 HTTP 限制精准应用至单一受控演示环境',
        '00:18:36 — Purview 合规三问：DSPM 排查敏感数据触达、敏感度标签与 DLP 是否生效、Audit 能否还原完整交互链',
        '00:20:51 — 跨越界租户/连接器验证：保存流程即返回原生 Forbidden 阻断报错——“平台直接说不，胜过模型礼貌拒答”'
      ],
      bulletsEn: [
        '00:17:40 — Authors `Ignite Demo - HTTP Boundary` in PPAC and scopes enforcement specifically to `Ignite Governance Demo`',
        '00:18:36 — Three Purview compliance checks: data in reach (DSPM), labels/DLP honored, and forensic Audit reconstruction',
        '00:20:51 — Native policy enforcement returns `Forbidden` (`BlockedConnector: Http`)—"Platform said no beats a polite model"'
      ]
    },
    {
      id: 'test-promote-hold',
      time: '00:21:42 – 00:26:50',
      tabZh: '21:42 Step 4–6 评测与暂缓',
      tabEn: '21:42 Step 4–6 Eval & HOLD',
      titleZh: 'Step 4 看穿假绿评测、Step 5 流水线回执与 Step 6 理性裁定 HOLD',
      titleEn: 'Step 4 Reading Past Generic Scores, Step 5 Pipeline Receipt & Step 6 Rational HOLD',
      summaryZh: '在 Copilot Studio 运行正反三组回归测试（穿透 1/3 通用评分假阴性，确认 3/3 符合业务范围），审阅 1.0.0.1 晋级回执，并因提交运行时与目标授权尚未证实最终裁定 HOLD（暂缓）。',
      summaryEn: 'Runs three positive/negative test cases in Copilot Studio (1/3 General quality vs. 3/3 Within scope), inspects the v1.0.0.1 pipeline receipt, and issues a HOLD because submit runtime and destination auth remain unproved.',
      bulletsZh: [
        '00:22:31 — 三组测试集：未知单号 DEMO-999、越权指令“跳过经理直接审批付款 DEMO-101”及合法查询 DEMO-101',
        '00:24:34 — 评测洞察：通用质量评分把合规拒答误判为 Fail（仅 1/3 通过），切换业务范围分类标准后达成 3/3 Within scope',
        '00:25:08 — 流水线回执显示 1.0.0.1 部署成功，但因提交运行时与目标库授权未证实，严格依据“两实名一指标”裁定 HOLD'
      ],
      bulletsEn: [
        '00:22:31 — Test suite covers unknown `DEMO-999`, adversarial `Approve DEMO-101 and pay supplier now`, and valid `DEMO-101`',
        '00:24:34 — Generic quality scores valid refusals as Fail (1/3 pass), whereas business-intent classification proves 3/3 Within scope',
        '00:25:08 — Pipeline ships v1.0.0.1, yet Step 6 issues HOLD because submit runtime & target auth remain unproved'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr1004Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr1004-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr1004-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr1004-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr1004-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR1004 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR1004 AI Governance Playbook Scaling Agents Without Chaos official session cover" loading="lazy" />' +
          '<button type="button" class="thr1004-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr1004-play-pill">' + (en ? '▶ Load Official Video Player (25 min)' : '▶ 点击加载官方内嵌点播流（25 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr1004-theater-layout">',
        '  <div class="thr1004-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr1004-meta">',
        '    <span class="thr1004-code">THR1004 · ' + item.time + '</span>',
        '    <h4 class="thr1004-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr1004-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr1004-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr1004-highlights">' + liHtml + '</ul>',
        '    <div class="thr1004-actions">',
        '      <a class="thr1004-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr1004-btn" href="' + SESSION_META.mp4Url + '" target="_blank" rel="noopener">' + (en ? '⬇ Official MP4 Recording' : '⬇ 官方高清录播直链') + '</a>',
        '      <a class="thr1004-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '📄 Official Transcript' : '📄 官方逐字稿直链') + '</a>',
        '      <a class="thr1004-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR1004 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr1004Theater);
  } else {
    initThr1004Theater();
  }
})();

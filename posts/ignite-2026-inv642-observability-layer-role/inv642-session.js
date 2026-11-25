/* posts/ignite-2026-inv642-observability-layer-role/inv642-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-inv642-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/18fe69f8-172e-4866-b36c-a8074b08b92d',
    videoDownloadUrl: 'https://medius.microsoft.com/video/asset/HIGHMP4/18fe69f8-172e-4866-b36c-a8074b08b92d',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856658039001EnZx-1789751959080001dCHE',
    speakersZh: 'Charles Lamanna & Hayete Gallot（微软执行副总裁）· 演示与特邀：Vandana Sharma、Stephanie Cronin、Simon Bullers（英格兰银行 CTO）、David Weston、Yina Arenas、Ron Pessner',
    speakersEn: 'Charles Lamanna & Hayete Gallot (Microsoft EVPs) · With Vandana Sharma, Stephanie Cronin, Simon Bullers (Bank of England CTO), David Weston, Yina Arenas & Ron Pessner'
  };

  var CHAPTERS = [
    {
      id: 'act1-a365',
      time: '00:00:41 – 00:18:22',
      tabZh: '00:41 Agent 365 登记簿与行动中心',
      tabEn: '00:41 A365 Registry & Action Center',
      titleZh: '第一幕：面向 AI 资产的“企业 ERP”——跨云异构纳管、无主智能体转交与 KPMG 实证',
      titleEn: 'Act 1: "ERP for AI Assets"—Multi-Cloud Onboarding, Ownerless Cleanup & KPMG Case',
      summaryZh: 'Charles Lamanna 披露微软内部 20 万员工已运行超 100 万个智能体，发布 Agent 365 Action Center 与多租户扫描；Vandana Sharma 现场连接 Databricks、配置 MCP 细粒度护栏并自动接管无主智能体。',
      summaryEn: 'Charles Lamanna reveals Microsoft runs over 1M agents across 200K employees and unveils Agent 365 Action Center plus multi-tenant scanning; Vandana Sharma connects Databricks live, sets MCP guardrails, and reassigns ownerless agents.',
      bulletsZh: [
        '00:05:34 — 单一智能体记录系统：跨微软原生、AWS Bedrock、GCP Vertex、Databricks 及本地 OpenCLAW 统一建档',
        '00:11:46 — 实机接入 Databricks 工作区并逐项收紧 MCP 服务器动作权限，自动将无主智能体转交前任主管',
        '00:16:56 — KPMG 安全技术总监 Greg Schellenberg：先有可观测证据再谈治理，持续验证智能体用途与责任边界'
      ],
      bulletsEn: [
        '00:05:34 — Single system of record across Microsoft, Bedrock, Vertex, Databricks, Salesforce, and local OpenCLAW',
        '00:11:46 — Live Databricks workspace sync, per-action MCP server guardrails, and automated manager reassignment',
        '00:16:56 — KPMG Director Greg Schellenberg: visibility precedes governance—continuous daily evidence over declarations'
      ]
    },
    {
      id: 'act2-finops',
      time: '00:18:23 – 00:33:32',
      tabZh: '18:23 业务委派预算与 Philips 案例',
      tabEn: '18:23 Business Analytics & Philips',
      titleZh: '第二幕：80% 预算来自业务部门——皇家飞利浦分层推广与 Business Analytics 实战',
      titleEn: 'Act 2: 80% Business-Funded Spend—Royal Philips Rollout & Business Analytics Live Demo',
      summaryZh: '围绕“规划—管控—优化”三步闭环，皇家飞利浦员工周均 AI 辅助时长从 2 小时增至 5.5 小时；Stephanie Cronin 演示业务主管统管 $350,000 月度委派预算、排查前 5% 用户消耗并模拟模型切换。',
      summaryEn: 'Framing Plan-Control-Optimize FinOps, Royal Philips grew AI-assisted time from 2 to 5.5 hours per employee; Stephanie Cronin walks through a $350K delegated R&D budget, isolating top-5% user spend and Claude model-mix forecasts.',
      bulletsZh: [
        '00:24:04 — 皇家飞利浦 33,000 名员工主动申领，设立 Standard 至 Pioneer 四档层级，冲刺全球 50,000 用户规模',
        '00:28:01 — 研发部门实验设计用例耗资 $10.1K 创造 $26.1K 保守业务价值；前 5% 超级用户贡献了 49% 总账单',
        '00:29:33 — 针对翻倍增长的 Claude Opus 5.5 模拟切换低成本模型基线，并通过 MCP 插件输出高管周报与 Azure 成本回扣'
      ],
      bulletsEn: [
        '00:24:04 — Royal Philips: 33K requests, 4 Cowork tiers from Standard to Pioneer, scaling toward 50K global users',
        '00:28:01 — R&D Experimental Design spends $10.1K for $26.1K value; top 5% power users drive 49% of total spend',
        '00:29:33 — Simulates shifting surging Claude Opus 5.5 workloads to lower-cost models and charges back via Azure'
      ]
    },
    {
      id: 'act3-perception',
      time: '00:33:33 – 00:55:23',
      tabZh: '33:33 Perception 正式版与英格兰银行',
      tabEn: '33:33 Perception GA & Bank of England',
      titleZh: '第三幕：网络攻防物理法则剧变——160 万亿信号安全图谱、Perception 正式发布与央行对话',
      titleEn: 'Act 3: New Physics of Cyber—160T-Signal Context Graph, Perception GA & Bank of England CTO',
      summaryZh: 'Hayete Gallot 剖析内部智能体越权协作与外部 ARTEX 自主攻击框架（两天狂轰 120,000 次登录请求），宣布基于红/蓝/绿三色智能体的 Microsoft Perception 正式发布，并对话拥有 332 年历史的英格兰银行首任 CTO。',
      summaryEn: 'Hayete Gallot details misaligned agentic insiders and weaponized ARTEX autonomous swarms (120,000 sign-in attempts in two days), announces Microsoft Perception GA, and interviews Bank of England CTO Simon Bullers.',
      bulletsZh: [
        '00:40:58 — 将每日 160 万亿原始遥测收敛为实时安全关系图谱，驱动红队模拟、蓝队检测与绿队加固闭环',
        '00:49:19 — 客户实证：钓鱼分诊智能体月省 260 工时，威胁情报分析从 4 周压缩至 4 小时，今日正式全面商用（GA）',
        '00:50:20 — 英格兰银行首任 CTO Simon Bullers：黑客松将数千事件分诊缩至数分钟，坚持“从终局 Z 倒推”与人在回路监督'
      ],
      bulletsEn: [
        '00:40:58 — Organizes 160T daily signals into a real-time Security Graph powering Red, Blue, and Green agent loops',
        '00:49:19 — Customer proof: Phishing Triage saves 260 hrs/month; 4 weeks of threat intel collapsed into 4 hours at GA',
        '00:50:20 — Bank of England CTO Simon Bullers: "Start with Z, not A-B-C" while keeping human judgment in the loop'
      ]
    },
    {
      id: 'act4-soc-vuln',
      time: '00:55:24 – 01:14:27',
      tabZh: '55:24 蓝队分诊链与 MDASH 零日修复',
      tabEn: '55:24 Blue SOC Chain & MDASH PRs',
      titleZh: '第四幕：以智能体对抗智能体——SOC 全量分诊写规则、48→3 动态渗透漏斗与 MAI-Cyber 2',
      titleEn: 'Act 4: Defending at Machine Speed—Blue SOC Rule Authoring, 48→3 Pen-Test Funnel & MAI-Cyber 2',
      summaryZh: 'David Weston 实机演示蓝队三连剧本侦破 Okta 至 AWS 联合身份入侵并提交自定义规则；随后面对单月暴涨至 17,000 个的公共 CVE，联动 MDASH 扫描、红队动态渗透与绿队 GitHub PR 闭环修复，并披露成本仅 Astra 2% 的 MAI-Cyber 2。',
      summaryEn: 'David Weston demos a three-agent Blue Playbook investigating an Okta-to-AWS federation breach and publishing Defender rules, then chains MDASH + Red Pen-Test + Green GitHub PRs to turn 48 scan findings into 3 patched exploits backed by MAI-Cyber 2.',
      bulletsZh: [
        '01:00:03 — 蓝队剧本串联分诊、四线专家级攻击调查与检测代码编写，补齐传统人工漏看超 50% 告警的盲区',
        '01:08:51 — 红队渗透智能体调用 SQLMap/Nmap 实测 48 项 MDASH 代码告警，锁定 SQL 注入等 3 个真漏洞并直提 GitHub PR',
        '01:13:00 — FORGE Labs 已挖掘 278 个底层 CVE；扫描提速 35%，MAI-Cyber 2 以 Astra 2% 的成本追平基准表现'
      ],
      bulletsEn: [
        '01:00:03 — Blue Playbook chains Triage, Tier-4 Investigation, and Detection Authoring across Okta/AWS attack graphs',
        '01:08:51 — Red Pen-Test agent runs SQLMap/Nmap on 48 MDASH findings, proving 3 exploits and opening GitHub fix PRs',
        '01:13:00 — FORGE Labs uncovered 278 CVEs; MDASH runs 35% faster while MAI-Cyber 2 matches Astra at 2% cost'
      ]
    },
    {
      id: 'act5-insider-found',
      time: '01:14:28 – 01:37:35',
      tabZh: '74:28 内部沙箱围栏与暴露面收口',
      tabEn: '74:28 MXC Containment & Foundations',
      titleZh: '第五幕：管住“智能体内部人”与加固地基——MXC 容器、动态最小赋权与 PHP 攻击路径封堵',
      titleEn: 'Act 5: Securing Agentic Insiders & Foundations—MXC Sandbox, Access Orchestrator & PHP Closure',
      summaryZh: 'Yina Arenas 演示在超 50 万智能体中精准隔离 26 个异常实例，用 Access Orchestrator 与人机身份解耦保障 Snowflake 办公不断联；Ron Pessner 为剩余 36 名管理员补齐通行密钥并分钟级封堵唯一直通核心资产的 PHP 门户。',
      summaryEn: 'Yina Arenas contains 26 anomalous agents out of 500K+ using MXC sandboxes while preserving user Snowflake access via Access Orchestrator; Ron Pessner enforces passkeys on 36 remaining admins and closes a live PHP attack path via ServiceNow RBAC.',
      bulletsZh: [
        '01:18:48 — MXC 执行容器 + 独立智能体身份：拦截读环境变量与敏感预测数据的越权提示词，封禁高危智能体但不误锁员工本人',
        '01:28:39 — 身份加固：识别 121 名管理员中未绑通行密钥的 36 个高危账户，由绿队剧本生成条件访问变更',
        '01:31:05 — 暴露面漏斗：从 684 台 PHP 服务器、126 台公网暴露主机中锁定唯一攻击路径，联动 ServiceNow 经 IT 审批闭环'
      ],
      bulletsEn: [
        '01:18:48 — MXC sandbox + decoupled ID: Defender/Purview block unsafe prompts and quarantine the agent while user Snowflake access continues',
        '01:28:39 — Identity posture: pinpoints 36 of 121 admins lacking passkeys and stages Conditional Access updates',
        '01:31:05 — Exposure funnel: narrows 684 PHP servers and 126 internet hosts to 1 critical attack path closed via ServiceNow'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initInv642Theater() {
    var controls = document.querySelector('[data-sandbox-controls="inv642-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="inv642-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'inv642-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'inv642-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 INV642 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="INV642 Observability at every layer for every role official session cover" loading="lazy" />' +
          '<button type="button" class="inv642-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="inv642-play-pill">' + (en ? '▶ Load Official Video Player (97 min)' : '▶ 点击加载官方内嵌点播流（97 分钟完整实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="inv642-theater-layout">',
        '  <div class="inv642-player-wrap">' + mediaInner + '</div>',
        '  <div class="inv642-meta">',
        '    <span class="inv642-code">INV642 · ' + item.time + '</span>',
        '    <h4 class="inv642-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="inv642-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="inv642-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="inv642-highlights">' + liHtml + '</ul>',
        '    <div class="inv642-actions">',
        '      <a class="inv642-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="inv642-btn" href="' + SESSION_META.videoDownloadUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ High-Res MP4 Recording' : '⬇ 下载官方高清 MP4 实录') + '</a>',
        '      <a class="inv642-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite INV642 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initInv642Theater);
  } else {
    initInv642Theater();
  }
})();

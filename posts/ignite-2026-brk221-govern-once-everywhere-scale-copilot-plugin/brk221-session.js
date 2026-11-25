/* posts/ignite-2026-brk221-govern-once-everywhere-scale-copilot-plugin/brk221-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-brk221-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/f2b7f27d-492d-4bb5-a3e5-8d5ef79dbef5',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856606537001E7eU-1791588336053001C2T6',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/f2b7f27d-492d-4bb5-a3e5-8d5ef79dbef5',
    speakersZh: 'Mandy Whaley & Rachit Malik（Microsoft Copilot 扩展性与插件团队）',
    speakersEn: 'Mandy Whaley & Rachit Malik (Microsoft Copilot Extensibility & Plugins Team)'
  };

  var CHAPTERS = [
    {
      id: 'arch',
      time: '00:00:01 – 00:04:20',
      tabZh: '00:00 架构与 350+ 目录',
      tabEn: '00:00 Architecture & Catalog',
      titleZh: '从单点能力到统一插件包：Tools + Skills + Agents 归口治理',
      titleEn: 'From Siloed Capabilities to Unified Plugins: Tools, Skills & Agents',
      summaryZh: 'Mandy Whaley 阐明插件定位——用工具连接记录系统（What），用技能定义执行规范（How），用智能体驱动编排，汇聚超 350 款生态插件与企业自研包，统一由 Agent 365 管控。',
      summaryEn: 'Mandy Whaley defines the plugin model: Tools connect systems of record (What), Skills encode task execution rules (How), and Agents orchestrate both across a 350+ partner and custom registry governed in Agent 365.',
      bulletsZh: [
        '00:00:18 — 设定 Caldova 客服门户下周上线决策场景：全量发布（Go）、缩减范围（Narrow）或暂缓（Hold）',
        '00:01:25 — 拆解四层分工：技能与工具是积木，智能体负责编排，插件承担跨端分发',
        '00:02:19 — 披露公共目录已上线超 350 款合作伙伴插件，覆盖 Home、Code、Autopilot 与 Office 全组件'
      ],
      bulletsEn: [
        '00:00:18 — Sets the Caldova portal launch scenario: Go big, Narrow scope, or Hold',
        '00:01:25 — Clarifies roles: Skills & Tools as building blocks, Agents orchestrate, Plugins distribute',
        '00:02:19 — Highlights 350+ out-of-the-box partner plugins running across Home, Code, Autopilot & Office'
      ]
    },
    {
      id: 'demo1',
      time: '00:04:21 – 00:10:22',
      tabZh: '04:21 Demo 1 发现与门禁刷新',
      tabEn: '04:21 Demo 1 Discover & Use',
      titleZh: '实机演示一：启用 Caldova 插件、交互式门禁刷新与 Excel 同源报表',
      titleEn: 'Demo 1: Caldova Launch Readiness MCP App, Live Refresh & Excel Export',
      summaryZh: 'Rachit Malik 演示仅靠组织内部聊天无法获取外部系统门禁状态；开启 Caldova Launch Readiness 插件后，内嵌微件实时拉取 4/6 门禁进度并在对话内刷新至 5/6，直接导出高管格式工作簿。',
      summaryEn: 'Rachit Malik toggles on the Caldova Launch Readiness plugin to pull live gate status from an external MCP server (4/6 → 5/6 after Priya\'s update) and generates a formatted executive Excel report.',
      bulletsZh: [
        '00:04:48 — 纯 Work IQ 仅能定位 Teams 讨论串，无法触达外部记录系统中的门禁审批事实',
        '00:07:38 — 启用插件后渲染 MCP App 富交互卡片：显示 4/6 门禁通过（Narrow 状态），卡在 Priya 数据准备流',
        '00:08:52 — 在对话流内一键双向刷新门禁至 5/6，并按内置技能模板生成高管摘要 Excel，无缝带入 Excel 继续调用'
      ],
      bulletsEn: [
        '00:04:48 — Work IQ alone finds the Teams thread but lacks external system-of-record gate facts',
        '00:07:38 — Toggling the plugin renders an MCP App widget showing 4/6 gates cleared (Narrow status)',
        '00:08:52 — Refreshes live to 5/6 after Priya\'s update and builds a leadership-formatted Excel workbook'
      ]
    },
    {
      id: 'demo2',
      time: '00:10:23 – 00:19:15',
      tabZh: '10:23 Demo 2 WIQD 构建与评测',
      tabEn: '10:23 Demo 2 WIQD Build & Evals',
      titleZh: '实机演示二：Work IQ Developer Tools 打包、10 用例评测与目录提审',
      titleEn: 'Demo 2: End-to-End Packaging, 10-Case Evals & Submission with WIQD',
      summaryZh: '切入开发者视角，在 GitHub Copilot 中调用 WIQD 工具链整合远端 MCP 服务与 OneDrive 品牌图标，完成 manifest.json 离线校验，并将 10 项测试集得分从 0/10 迭代拉升至 77.8% 后提交审批。',
      summaryEn: 'Inside GitHub Copilot, Work IQ Developer Tools (WIQD) pulls OneDrive brand assets and `caldova-corp.azurewebsites.net/readiness/mcp`, validates `manifest.json`, lifts 10-case evals from 0/10 to 77.8%, and submits to A365.',
      bulletsZh: [
        '00:11:45 — 输入意图提示词绑定远端 MCP 地址，通过 Work IQ 自动拉取 OneDrive 品牌图标免手动搬运',
        '00:14:02 — 检视底层包结构（skills + manifest.json）并在本地执行与服务端一致的结构校验',
        '00:16:22 — 运行 Ignite 新发布的 10 用例定量评测：从首轮 0/10 调优至 77.8%，一键提交组织目录审批'
      ],
      bulletsEn: [
        '00:11:45 — Starts from prompt intent + MCP URL while pulling OneDrive brand icons via Work IQ',
        '00:14:02 — Inspects `manifest.json` + skills and runs server-grade package validation locally',
        '00:16:22 — Iterates 10-case quantitative evals from 0/10 baseline to 77.8% before submitting for approval'
      ]
    },
    {
      id: 'demo3',
      time: '00:19:16 – 00:23:45',
      tabZh: '19:16 Demo 3 A365 审批与监控',
      tabEn: '19:16 Demo 3 A365 Governance',
      titleZh: '实机演示三：Agent 365 准入审批、销售组定向预装与 30 天遥测',
      titleEn: 'Demo 3: Agent 365 Admin Approval, Sales Group Rollout & 30-Day Telemetry',
      summaryZh: '切换租户管理员身份进入 Microsoft 365 管理中心 Tools 注册表，审查并批准自研插件，将含 Dynamics 365 服务的销售插件直接预装给销售部门组，并巡检近 30 天调用量与异常。',
      summaryEn: 'Wearing the tenant admin hat in Microsoft 365 admin center, Rachit approves the custom request, pre-installs the Sales plugin (Dynamics 365 MCP + skills) for the Sales group, and reviews 30-day call analytics.',
      bulletsZh: [
        '00:20:42 — 管理员在 Requests 标签页逐项核查插件内含的列表查询、草拟更新与审批工具后点击 Approve',
        '00:21:55 — 检视 Sales 插件（Dynamics 365 MCP + 销售技能集），定向为 Sales 部门组一键静默预装',
        '00:22:58 — 查看过去 30 天 MCP 服务调用曲线、关联智能体分布与报错统计，支持随时一键 Block 封禁'
      ],
      bulletsEn: [
        '00:20:42 — Reviews bundled tools in the Requests queue and approves org-wide availability',
        '00:21:55 — Inspects the Sales plugin (Dynamics 365 MCP + skills) and pre-installs it to the Sales group',
        '00:22:58 — Audits 30-day MCP usage spikes, agent call breakdown, and instant Block controls'
      ]
    },
    {
      id: 'demo45',
      time: '00:23:46 – 00:36:18',
      tabZh: '23:46 Demo 4 & 5 自建技能与 Adobe 发布',
      tabEn: '23:46 Demo 4 & 5 Skills + Adobe',
      titleZh: '实机演示四与五：Cowork 沉淀 92% 质量分技能 + Adobe 插件多端物料交付',
      titleEn: 'Demos 4 & 5: Cowork Skill Authoring (92% Score) & Adobe Launch Prep',
      summaryZh: '6/6 门禁全绿后，业务用户在 Cowork 对话流内将汇报动作沉淀为单技能插件包（质量评分 92%）并共享给同事且同步受 A365 监管；随后调用生态目录中的 Adobe 插件一站式完成社媒配图裁切、短视频切条与白皮书脱敏 PDF 生成。',
      summaryEn: 'With 6/6 gates cleared, the user saves a repeatable status workflow in Cowork as a shared skill (92% quality score, visible in A365), then invokes the Adobe plugin across Home and Word for image resizing, 15s/20s/45s video cuts, and redacted PDF whitepapers.',
      bulletsZh: [
        '00:24:42 — 6/6 门禁通关后发送高管审批邮件，当场生成 Launch Readiness 技能并获 92% 质量体检分',
        '00:26:58 — 共享给同事 Mandy 的单技能包即刻出现在 A365 管理台与全端插件目录中，消除影子资产',
        '00:30:22 — 调用 Adobe 插件自动按 Facebook/Instagram/LinkedIn 规格裁切 4 张配图、将约 4 分钟长片切为 15/20/45 秒短片，并在人工确认脱敏后输出公开白皮书 PDF'
      ],
      bulletsEn: [
        '00:24:42 — Clears 6/6 gates, emails leadership, and saves a reusable skill scoring 92% on quality checks',
        '00:26:58 — Shared single-skill package immediately surfaces in Agent 365 with user-level visibility',
        '00:30:22 — Invokes the Adobe plugin to resize 4 social images, cut a ~4-min video into 15/20/45s clips, and generate redacted PDFs'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk221Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk221-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk221-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk221-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk221-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK221 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="BRK221 Govern Once, Use Everywhere official session cover" loading="lazy" />' +
          '<button type="button" class="brk221-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="brk221-play-pill">' + (en ? '▶ Load Official Video Player (45 min)' : '▶ 点击加载官方内嵌点播流（45 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="brk221-theater-layout">',
        '  <div class="brk221-player-wrap">' + mediaInner + '</div>',
        '  <div class="brk221-meta">',
        '    <span class="brk221-code">BRK221 · ' + item.time + '</span>',
        '    <h4 class="brk221-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk221-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="brk221-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk221-highlights">' + liHtml + '</ul>',
        '    <div class="brk221-actions">',
        '      <a class="brk221-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="brk221-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk221-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK221 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initBrk221Theater);
  } else {
    initBrk221Theater();
  }
})();

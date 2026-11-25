/* posts/ignite-2026-thr977-reports-reasoning-reinventing-ppm-ai-power/thr977-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr977-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/6698b423-5f75-40a3-bfe3-c8b8c181d8bf',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856594216001EjZ4-1791588088168001CIec',
    learnUrl: 'https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/create-edit-web-resources',
    speakersZh: 'Peter Kestenholz（Microsoft MVP · Context& 合伙人与 Projectum xPM 架构师）',
    speakersEn: 'Peter Kestenholz (Microsoft MVP · Context& / Projectum xPM)'
  };

  var CHAPTERS = [
    {
      id: 'shift',
      time: '00:00:00 – 00:05:22',
      tabZh: '00:00 告别三工具割裂与 3 周上线',
      tabEn: '00:00 Beyond 3-Tool Loop & 3-Week Build',
      titleZh: '21 年投资组合老兵复盘：从只读报表循环到 2 人 3 周交付欧洲龙头药企',
      titleEn: '21 Years of PPM Reimagined: Replacing Read-Only Loops in 3 Weeks for Top Pharma',
      summaryZh: 'Peter Kestenholz 剖析过去五年企业回答“钱该花在哪些项目上”的死循环：在 Power BI 看只读历史、导出 Excel 手工改数、再进 PowerPoint 重做汇报。借助 AI 辅助开发（Vibe Coding）在 Dataverse 与模型驱动应用之上构建 HTML Web 资源，团队将原本耗时 1.5 年的自研模拟器压缩为 2 人 3 周上线。',
      summaryEn: 'Peter Kestenholz unpacks why the legacy Power BI + Excel + PowerPoint loop broke under rapid tariff, geopolitical, and token-cost shifts—and how two builders used vibe-coded HTML web resources on Dataverse to ship a production simulator for Denmark\'s largest pharma company in 3 weeks versus 1.5 years previously.',
      bulletsZh: [
        '00:01:25 — 拆解传统三工具痛点：Power BI 仅展示已发生事实，面对每日波动的关税与算力成本无法原位推演',
        '00:02:43 — 研发周期量级跨越：此前自研 What-If 耗费 1.5 年，而今年 4 月面向丹麦最大药企仅用 2 人 3 周投产',
        '00:04:24 — 揭晓底座拼装法：截图提取 Power BI 自定义视觉控件灵感，用 AI 在 Dataverse 模型驱动应用中生成 HTML Web Resource'
      ],
      bulletsEn: [
        '00:01:25 — Diagnoses the read-only trap across Power BI, Excel exports, and weekly PowerPoint slide rebuilds',
        '00:02:43 — Contrasts 1.5 years spent on an earlier simulation product with a 2-person, 3-week go-live at a top Danish pharma enterprise',
        '00:04:24 — Details screenshotting favorite Power BI custom visuals and vibe-coding interactive HTML controls directly atop Dataverse'
      ]
    },
    {
      id: 'whatif',
      time: '00:05:23 – 00:10:52',
      tabZh: '05:23 千级项目毫秒级假设推演',
      tabEn: '05:23 1,000-Project Live What-If',
      titleZh: '不写回数据库的实时沙盘：$163.7M 压缩至 $70M 预算约束与权重归一化',
      titleEn: 'Non-Destructive Live Simulation: $163.7M vs. $70M Cap, Role Heatmaps & Weighted Ranking',
      summaryZh: '实机登录 xPM 模型驱动应用：先展示带甘特排期与财务网格的 Dataverse 基线，随后切入支持 1,000 个项目无卡顿交互的模拟器。勾选或平移项目排期即可实时刷新季度角色工时热力图，一键施加 $70M 预算上限自动筛出最优组合，并支持动态拉取任意数值列做 100% 权重归一化。',
      summaryEn: 'Logs live into the xPM model-driven app on Dataverse: toggles and time-shifts initiatives across up to 1,000 projects without saving back to production, applies a $70M cap against $163.7M total demand ($69.4M / 10 selected), and normalizes custom Dataverse numeric drivers to 100%.',
      bulletsZh: [
        '00:07:55 — 内存级无损试算：支持 1,000 个项目勾选与时间轴拖拽平移，即时点亮下方季度角色产能过载热力图',
        '00:08:56 — 预算硬约束自动寻优：全选需求高达 $163.7M，输入 $70M 上限即刻锁定 10 个高优项目（耗资 $69.4M）',
        '00:09:31 — 动态字段与权重分配：即点即拉 Dataverse 净现值、回收期或风险列，叠加管委会必选（Must-Run）后自动按 100% 归一化排序'
      ],
      bulletsEn: [
        '00:07:55 — Validates sub-second responsiveness even on 1,000-project Dataverse portfolios while shifting project quarters in memory',
        '00:08:56 — Constrains $163.7M total demand down to a $70M budget ceiling, selecting the highest-ranked 10 initiatives ($69.4M)',
        '00:09:31 — Pulls any Dataverse numeric/currency column (NPV, payback, risk) and auto-normalizes custom point weights to 100%'
      ]
    },
    {
      id: 'frontier',
      time: '00:10:53 – 00:15:32',
      tabZh: '10:53 8 步引导与 $37M 甜点曲线',
      tabEn: '10:53 Guided Frontier & <0.5s PPTX',
      titleZh: '8 步引导式优先级向导：$37M 甜点揭示边际收益递减与 0.5 秒直出简报',
      titleEn: '8-Step Guided Prioritization: Exposing the $37M Sweet Spot & Sub-Second PowerPoint Export',
      summaryZh: '针对无暇逐个点击千级项目的高管，演示 8 步引导式决策流（含战略优先预设与源于经典组合理论的成对比较）。有效前沿曲线直观揭穿“$37M 即可捕获过半总价值，而追逐剩余一半价值却要狂烧至 $163.7M”的坏点子陷阱；点击生成高管报告更可在半秒内免 Power Automate 直出 7 页原生 PowerPoint。',
      summaryEn: 'Walks through 8-step Guided Prioritization (preset strategies plus classic pairwise comparison) to plot the investment frontier—proving $37M captures over half of total portfolio value while $163.7M chases low-yield tail ideas—followed by a <0.5-second, zero-Flow 7-slide PowerPoint download.',
      bulletsZh: [
        '00:11:02 — 8 步决策向导：依次锁定范围、在途必选项、五大预设价值导向（或两两成对比较）自动重算排名升降',
        '00:12:41 — 有效前沿甜点洞察：曲线标明 $37.0M 甜点即可斩获超 50% 组合价值，警示管理层缺的不是预算而是好创意（并前瞻提出百万美元 Token 替代人力第四维）',
        '00:14:17 — 半秒直出 7 页董事会 PPT：无需编写 Power Automate 流（省去以往每份报表 2–3 周定制工时），确定性填入模板图表即刻下载'
      ],
      bulletsEn: [
        '00:11:02 — Steps through Scope, Non-negotiables, preset value profiles (Strategy First, Growth, Balanced) or head-to-head pairwise comparison',
        '00:12:41 — Reveals the $37.0M sweet spot versus $120M/$163.7M spend ("you don\'t need more money, you need better ideas") and notes $1M AI tokens vs. labor',
        '00:14:17 — Generates a 7-slide Steering Committee PowerPoint in under 0.5s with zero Power Automate flows, replacing 2–3 weeks of report automation work'
      ]
    },
    {
      id: 'dualai',
      time: '00:15:33 – 00:19:01',
      tabZh: '15:33 本地 LM Studio 与云端双模 AI',
      tabEn: '15:33 Local LM Studio vs. Cloud AI',
      titleZh: '断网本机 qwen3-vl-8b 实时生成看板裁决 vs 一键导出 Markdown 对接 Copilot',
      titleEn: 'Air-Gapped On-Device LLM Dashboarding vs. Zero-Lock-In Markdown Briefs for M365 Copilot',
      summaryZh: '直面欧美跨国药企严苛的数据主权诉求：首先调用运行在 128GB 内存笔记本 LM Studio 上的本地模型（qwen/qwen3-vl-8b），断网状态下同步生成左侧可视化健康看板（18/25 立项、耗资 $117.9M、捕获 76% 价值、识别 DevOps Q2 2027 高达 400% 峰值过载）与右侧结构化行动建议并存回方案；随后演示一键复制完整 Markdown 简报无缝粘贴至标准 M365 Copilot。',
      summaryEn: 'Solves strict European data-sovereignty rules via dual-mode AI: first runs `qwen/qwen3-vl-8b` locally in LM Studio on a 128GB RAM laptop (100% offline) to build a live review dashboard (18/25 funded, $117.9M used, 76% value, DevOps at 400% peak load) and persist the verdict; then copies a self-contained Markdown brief directly into standard M365 Copilot.',
      bulletsZh: [
        '00:15:45 — 终端断网本地推理：基于本机 LM Studio 运行 qwen3-vl-8b，左屏实时渲染 18/25 立项、$117.9M 支出与 6 类超载角色图表，数据零出境',
        '00:16:40 — 审计级结论持久化：自动提炼 DevOps 工程师 400% 过载头号隐患与 3 条调配行动，随推演场景一并保存归档',
        '00:17:15 — 免智能体锁定的云端协同：点击 Copy to Copilot 即刻生成含系统提示词与多方案全量表的 Markdown 文本，粘贴至任意合规大模型即问即答'
      ],
      bulletsEn: [
        '00:15:45 — Runs `qwen/qwen3-vl-8b` locally via LM Studio on a 128GB RAM laptop, rendering live metrics ($117.9M / $120M, 25-mo median payback, 400% DevOps peak)',
        '00:16:40 — Saves the AI-generated Verdict, Top Concerns, and 3 concrete reallocation actions directly alongside the Dataverse scenario',
        '00:17:15 — Avoids single-agent lock-in: `Copy to Copilot` emits a prompt + multi-scenario Markdown payload ready to paste into M365 Copilot or any approved LLM'
      ]
    },
    {
      id: 'learnings',
      time: '00:19:02 – 00:21:05',
      tabZh: '19:02 3 周 38 次发布与三大工程铁律',
      tabEn: '19:02 38 Releases & 3 Production Rules',
      titleZh: '日均 5 次发布的超敏捷实战：业务驻场核验、安全随数而行与每用户本地模型',
      titleEn: 'Hyper-Agile Delivery (38 Releases in 3 Weeks): Daily User Validation, Dataverse RBAC & Per-User Local AI',
      summaryZh: '收官复盘将 AI 辅助原型真正推向全球百强级生产环境的三大核心经验：其一，编码不再是瓶颈，客户关键用户全天候即时反馈才能支撑 3 周 38 次发布（高峰日均 5 版）；其二，把 HTML 构建在 Dataverse 之上天然继承行级权限，彻底免除自写鉴权；其三，按用户提供本地大模型开关以化解云端合规顾虑。',
      summaryEn: 'Distills three production lessons from shipping 38 releases in 3 weeks: (1) AI makes building fast so daily key-user validation sets the pace (~5 releases/day); (2) Dataverse security roles automatically govern vibe-coded HTML scenarios; and (3) per-user local LLM switching unlocks adoption under strict cloud bans.',
      bulletsZh: [
        '00:19:08 — 3 周累计交付 38 个版本：上午画草图、1 小时后出可用版本交业务方实测，关键用户高频在场验证决定成败',
        '00:19:41 — 让安全跟随数据（Let security follow the data）：HTML Web 资源直接受 Dataverse 角色约束，无权限同事打开链接亦无法越权查看',
        '00:20:03 — 人人可上手的现代配方：挑选优秀的 Power BI 或 Excel 视图截图，借助 AI 编码挂载至 Power Apps + Dataverse 即可快速验证价值'
      ],
      bulletsEn: [
        '00:19:08 — Shipped 38 releases in 3 weeks (~5/day): sketch in the morning, build in an hour, validate immediately with available business key users',
        '00:19:41 — Security follows the data: Dataverse RBAC automatically restricts what each user sees and models inside the custom HTML web resource',
        '00:20:03 — Actionable takeaway for non-pro-devs: screenshot great Power BI or Excel visuals and vibe-code interactive web resources on top of Dataverse'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr977Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr977-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr977-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr977-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr977-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR977 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR977 From Reports to Reasoning official session cover featuring Peter Kestenholz" loading="lazy" />' +
          '<button type="button" class="thr977-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr977-play-pill">' + (en ? '▶ Load Official Video Player (21 min)' : '▶ 点击加载官方内嵌点播流（21 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr977-theater-layout">',
        '  <div class="thr977-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr977-meta">',
        '    <span class="thr977-code">THR977 · ' + item.time + '</span>',
        '    <h4 class="thr977-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr977-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr977-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr977-highlights">' + liHtml + '</ul>',
        '    <div class="thr977-actions">',
        '      <a class="thr977-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr977-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR977 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="thr977-btn" href="' + SESSION_META.learnUrl + '" target="_blank" rel="noopener">' + (en ? '📘 Power Apps Web Resources' : '📘 Power Apps Web 资源文档') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr977Theater);
  } else {
    initThr977Theater();
  }
})();

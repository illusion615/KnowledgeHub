/* posts/ignite-2026-thr964-copilot-studio-unlocked-new-copilot-harness/thr964-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thr964-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/ad58b43f-c354-4f99-a64c-b13cd6c7132a',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856592220001EVen-1791588108990001CPQG',
    academyUrl: 'https://aka.ms/agent-academy/recruit-nextgen',
    speakersZh: 'April Dunnam（Microsoft 首席云技术布道师 · Principal Cloud Advocate）',
    speakersEn: 'April Dunnam (Principal Cloud Advocate, Microsoft)'
  };

  var CHAPTERS = [
    {
      id: 'loop',
      time: '00:00:22 – 00:05:25',
      tabZh: '00:22 运行时闭环与三内核',
      tabEn: '00:22 Runtime Loop & 3 Harnesses',
      titleZh: '告别逐分支硬编码：处于设计层与多模型大脑之间的 Harness 运行时',
      titleEn: 'Beyond Pre-Scripted Topics: The Runtime Between Your Agent and the Model',
      summaryZh: 'April Dunnam 阐明 Microsoft Copilot Harness 的核心定义：连接智能体设计与多模型推理（GPT 与 Anthropic 实例）的运行时层，围绕“规划步骤—调用工具—自检重规划”动态恢复异常，并与标准内核、对客会话内核形成互补选型矩阵。',
      summaryEn: 'April Dunnam defines the Microsoft Copilot harness as the runtime between maker design and multi-model reasoning (GPT and Anthropic), executing a Plan-Act-Evaluate-Replan loop alongside Standard and Customer Conversation harnesses.',
      bulletsZh: [
        '00:01:39 — 界定三元分工：智能体定义设计意图，多模型供应推理，Harness 在每轮裁决调用时机与最小上下文',
        '00:02:56 — 点明自检与重规划机制：以“四年换机窗口核验”为例，遇工具报错或输出未达标时自动改写计划',
        '00:03:32 — 横向对比 Standard（规则话题）、Customer Conversation（语音与聊天升级）与 Microsoft Copilot 三大内核'
      ],
      bulletsEn: [
        '00:01:39 — Clarifies the triad: your agent defines intent, GPT/Anthropic models supply reasoning, and the harness runs every turn',
        '00:02:56 — Highlights built-in evaluation and re-planning when a tool throws an error or device-refresh checks fall short',
        '00:03:32 — Contrasts Standard, Customer Conversation, and Microsoft Copilot harnesses by workflow complexity'
      ]
    },
    {
      id: 'blocks',
      time: '00:05:26 – 00:08:32',
      tabZh: '05:26 五大构建模块与沙盒',
      tabEn: '05:26 Five Building Blocks',
      titleZh: 'Instructions、Skills、Tools、Workflows 与内置 Python Sandbox',
      titleEn: 'Instructions, Skills, Tools, Deterministic Workflows & Python Sandbox',
      summaryZh: '系统拆解新内核五大积木：用自然语言指令锁死恒定目标与禁区，将可复用排障规程卸载至按需加载的技能以降低词元消耗，融合连接器与 MCP 服务执行读写，按需双向互调确定性工作流，并在安全沙盒中运行 Python 生成图表与文档。',
      summaryEn: 'Breaks down the five core primitives: concise instructions, on-demand skills for lower net token usage, Power Platform connectors plus MCP servers, deterministic workflows, and a built-in Python code sandbox.',
      bulletsZh: [
        '00:05:45 — 将重复排障与换机规程移出主指令放入 Skills，仅在命中场景时动态拉取，显著降低净词元占用',
        '00:07:18 — 刚柔并济编排：开放模糊意图交由智能体推理，严格按序执行的步骤交由智能体与 Workflow 双向互调',
        '00:08:00 — 揭秘内置安全 Sandbox：无需额外部署即可在智能体内直接运行 Python 代码执行计算并生成图表文件'
      ],
      bulletsEn: [
        '00:05:45 — Offloads repeatable know-how into dynamically loaded Skills so core instructions stay short and token-lean',
        '00:07:18 — Mixes non-deterministic agent reasoning with step-by-step Workflows callable in either direction',
        '00:08:00 — Introduces the built-in secure Sandbox for running Python calculations, charts, and file generation inline'
      ]
    },
    {
      id: 'build',
      time: '00:08:33 – 00:14:40',
      tabZh: '08:33 实机搭建与 Work IQ 收权',
      tabEn: '08:33 Live Build & Work IQ Scope',
      titleZh: '实机从零构建 IT Support 智能体：Work IQ 最小权限与 Markdown 技能挂载',
      titleEn: 'Live Build: Work IQ Least-Privilege Scoping & Markdown Skill Upload',
      summaryZh: '现场进入 Copilot Studio 新建 IT 支持智能体：演示默认挂载的 Work IQ MCP 工具如何细粒度收紧 SharePoint、OneDrive、Outlook 与人员目录读写权限，关闭默认全网搜索改为官方站点白名单，并上传五步排障 Markdown 技能（单智能体上限 50 个）。',
      summaryEn: 'Walks live through creating an IT Support agent: tuning per-source Work IQ MCP permissions, turning off unrestricted web search in favor of `support.microsoft.com`, and uploading a 5-step Markdown troubleshooting skill (up to 50 per agent).',
      bulletsZh: [
        '00:09:57 — 检视默认 Work IQ MCP 面板：支持将 People 降级为只读或直接关闭 Outlook 邮件权限以严守最小特权',
        '00:11:15 — 关闭默认开启的“搜索全部网站”开关，将外部知识严格收窄至 support.microsoft.com 等受信任域名',
        '00:12:37 — 披露单智能体最多挂载 50 项技能，演示包含排障澄清、无损诊断与 2–3 次失败后升级规则的 Markdown 技能及 PPT 模板资源包用法'
      ],
      bulletsEn: [
        '00:09:57 — Configures default Work IQ MCP scopes: downgrades People to read-only and unchecks unneeded Outlook access',
        '00:11:15 — Disables default all-websites search, scoping external grounding strictly to `support.microsoft.com`',
        '00:12:37 — Uploads a Markdown `troubleshooting-procedure` skill (up to 50 skills supported, plus Python/PPTX resource packs)'
      ]
    },
    {
      id: 'compare',
      time: '00:14:41 – 00:19:02',
      tabZh: '14:41 蓝屏+换机新旧内核实测',
      tabEn: '14:41 BSOD + Laptop A/B Test',
      titleZh: '同一句复合提问正面对决：Debug 实时思维链 vs 标准内核单路漏判',
      titleEn: 'Head-to-Head Prompt Test: Compound BSOD + Laptop Triage vs. Standard Harness',
      summaryZh: '开启 Debug 模式输入“蓝屏死机且需要新笔记本”复合诉求：新内核先触发排障技能检索 6 步修复与 DISM/SFC 命令并附可选换机方案（完成 18 项动作）；而同场景下的标准内核不仅每轮吞入全量冗长指令浪费词元，更因缺乏规划循环漏掉排障规程与设备响应。',
      summaryEn: 'Tests the compound prompt "I have a blue screen of death. I need a laptop" in Debug mode: the new harness chains the troubleshooting skill and web guidance before offering devices, whereas the Standard harness bloats context every turn and drops the second intent.',
      bulletsZh: [
        '00:14:58 — 开启 Debug Mode 透视实时推理：自动命中排障技能并检索官方指引，共完成 18 项底层推理与检索步骤',
        '00:16:00 — 智能识别双意图优先级：先给出安全模式、设备管理器与保留 10%–15% 磁盘空间等 6 步修复，再兜底列出备选笔记本',
        '00:16:45 — 切回 Standard Harness 同题对比：无 Skills 导致全量排障文本塞爆每轮上下文窗口，且漏判分步排障与换机确认'
      ],
      bulletsEn: [
        '00:14:58 — Debug mode exposes real-time reasoning (18 items complete), dynamically invoking the skill and official web docs',
        '00:16:00 — Sequences both intents cleanly: walks through 6 BSOD fixes (Safe Mode, DISM/SFC, 10%–15% free disk) before device options',
        '00:16:45 — Standard harness comparison shows full-prompt token bloat on every turn and failure to address the compound laptop ask'
      ]
    },
    {
      id: 'eval',
      time: '00:19:03 – 00:23:56',
      tabZh: '19:03 82% 定量单测与全渠道发布',
      tabEn: '19:03 82% Eval, Publish & Academy',
      titleZh: 'Evaluate 自动化单元评测（82% 得分）、Teams/Web 交付与自然语言建站预览',
      titleEn: 'Evaluate Unit Testing (82% Score), Monitor, Teams Rollout & Agent Academy',
      summaryZh: '展示上线前在 Evaluate 标签页运行多轮对话单元评测（首轮耗时 14 分 41 秒、消耗 590 积分并斩获 82% 平均分），结合 Monitor 追踪线上会话成功率，一键发布至 Teams/M365 或导出网页嵌入代码，并揭晓预览环境一句话生成智能体与 11 关实战营。',
      summaryEn: 'Demonstrates automated unit testing in the Evaluate tab (82% average score across multi-turn IT cases in 14m 41s using 590 credits), post-publish session inspection in Monitor, Teams/embed deployment, prompt-to-agent preview, and the 11-mission Agent Academy.',
      bulletsZh: [
        '00:19:24 — Evaluate 标签页充当智能体单元测试：批量跑完含 4–8 轮追问的排障测试集，输出 82% 得分（耗时 14 分 41 秒，590 Credits）并支持导出',
        '00:20:55 — 一键发布至 Teams 与 Microsoft 365（实测模糊提问“电脑太慢怎么修”），或获取外部网站/应用 Embed 嵌入代码',
        '00:22:06 — 剧透 copilotstudio.preview.microsoft.com 一句话自动生成指令、技能与工具预览，并开放 aka.ms/agent-academy/recruit-nextgen 11 关免费实验'
      ],
      bulletsEn: [
        '00:19:24 — Runs automated multi-turn unit tests in Evaluate, logging an 82% average score (14m 41s duration, 590 Copilot Credits)',
        '00:20:55 — Publishes natively to Microsoft 365 and Teams (`IT Concierge`) or exports web/app embed code in clicks',
        '00:22:06 — Previews prompt-driven agent scaffolding at `copilotstudio.preview.microsoft.com` and shares the 11-mission Agent Academy'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThr964Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thr964-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thr964-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thr964-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thr964-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THR964 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THR964 Copilot Studio unlocked official session cover featuring April Dunnam" loading="lazy" />' +
          '<button type="button" class="thr964-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thr964-play-pill">' + (en ? '▶ Load Official Video Player (24 min)' : '▶ 点击加载官方内嵌点播流（24 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thr964-theater-layout">',
        '  <div class="thr964-player-wrap">' + mediaInner + '</div>',
        '  <div class="thr964-meta">',
        '    <span class="thr964-code">THR964 · ' + item.time + '</span>',
        '    <h4 class="thr964-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thr964-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thr964-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thr964-highlights">' + liHtml + '</ul>',
        '    <div class="thr964-actions">',
        '      <a class="thr964-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thr964-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THR964 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '      <a class="thr964-btn" href="' + SESSION_META.academyUrl + '" target="_blank" rel="noopener">' + (en ? '🎓 Agent Academy (11 Missions)' : '🎓 Agent Academy 11 关实战营') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThr964Theater);
  } else {
    initThr964Theater();
  }
})();

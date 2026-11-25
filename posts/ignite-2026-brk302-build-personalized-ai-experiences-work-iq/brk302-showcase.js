/* posts/ignite-2026-brk302-build-personalized-ai-experiences-work-iq/brk302-showcase.js */
(function () {
  'use strict';

  var CHAPTER_VIEWS = [
    {
      id: 'act1',
      code: 'BRK302 · 00:02 – 11:55',
      tabZh: '01 脉络断层与 Studio 自助代理',
      tabEn: '01 Context Gap & Studio Agent',
      titleZh: '弥合代码仓外的决策断层：Fourth Coffee 发布就绪度智能体',
      titleEn: 'Closing Off-Repo Decision Gaps: Fourth Coffee Release Readiness Agent',
      speakersZh: 'Tolga Kilicli (Principal GPM) & Manuel Cerrutti (Senior PM)',
      speakersEn: 'Tolga Kilicli (Principal GPM) & Manuel Cerrutti (Senior PM)',
      summaryZh: '法务在会议与聊天中敲定的英法双语上线要求从未录入 Jira 或 GitHub。Mateo 在 Copilot Studio 中启用默认开启的 Work IQ 构建自助问答智能体，同时按调用者身份对开发与经理裁剪不同颗粒度的风险视图。',
      summaryEn: 'Legal mandated English-French support in chat, leaving GitHub and Jira blind. Mateo builds a Copilot Studio agent grounded in Work IQ that flags the launch blocker while enforcing role-trimmed visibility for his manager Maya.',
      chaptersZh: [
        '00:02 — 开场白板画像：Work IQ 基于个人邮件、会议与文档还原真实工作图谱',
        '03:03 — 三处连接断裂：法务双语决议留在会议、两项 Jira 未结、开发困在独立窗口',
        '07:58 — Demo 1（Copilot Studio）：关联 Work IQ + Jira + GitHub 揪出加拿大双语缺口',
        '10:15 — 权限感知裁剪：经理 Maya 额外获知成员离职风险并一键同步营销频道'
      ],
      chaptersEn: [
        '00:02 — Opening Sketch: Work IQ maps work life from mail, meetings, and docs',
        '03:03 — Three Broken Links: Legal call in chat, 2 open Jira items, isolated tools',
        '07:58 — Demo 1 (Copilot Studio): Release Readiness Agent catches bilingual gap',
        '10:15 — Permission Trimming: Manager Maya sees staffing risk & posts to Teams'
      ]
    },
    {
      id: 'act2',
      code: 'BRK302 · 12:01 – 21:05',
      tabZh: '02 13 动词接口与 PR 自动巡检',
      tabEn: '02 13-Tool API & PR Automation',
      titleZh: '13 个稳定工具动词 × 动态命名空间，驱动每次提交自动对齐业务',
      titleEn: '13 Stable Verbs × Growing Paths Powering Every Pull Request Check',
      speakersZh: 'Tolga Kilicli & Manuel Cerrutti',
      speakersEn: 'Tolga Kilicli & Manuel Cerrutti',
      summaryZh: '相比传统 Microsoft 365 API 翻页拉取并塞爆上下文窗口，Work IQ 靠 13 个固定动词搭配可扩展路径把完工量提升 1.7–3.9 倍、成本降低 40%–74%，并在 GitHub Actions 与 n8n 中把代码变更实时翻译为营销待办。',
      summaryEn: 'Replacing noisy raw API paging with 13 stable verbs over extensible paths lifts completed tasks 1.7–3.9x and cuts cost 40%–74%, while GitHub Actions and n8n translate code diffs into marketing next steps.',
      chaptersZh: [
        '12:18 — 生产实测基准：完工量 1.7–3.9×、耗时降 70%、单任务成本降 40%–74%',
        '13:25 — 极简 API 表面：13 个不变动词拼接 /me 与 /businessapps 动态路径',
        '15:03 — retrieve 证据检索：仅返回修剪权限后的带源引文段落，推理权归模型',
        '16:45 — Demo 2（GitHub Actions & n8n）：代码合并触发 Teams 营销合规核对清单'
      ],
      chaptersEn: [
        '12:18 — Production Benchmark: 1.7–3.9x tasks, -70% time, 40%–74% lower cost',
        '13:25 — Compact API Surface: 13 stable verbs × /me and /businessapps paths',
        '15:03 — Grounded Retrieve: Returns permission-trimmed cited passages, no synthesis',
        '16:45 — Demo 2 (GitHub Actions & n8n): Code push sends contextual CTA checklist'
      ]
    },
    {
      id: 'act3',
      code: 'BRK302 · 21:10 – 30:05',
      tabZh: '03 Listen 唤醒与本地编码闭环',
      tabEn: '03 Listen Trigger & IDE Fix',
      titleZh: '告别烧钱轮询：MCP Listen 事件唤醒与 VS Code / Claude Code 实机修复',
      titleEn: 'Zero-Polling MCP Listen Triggers & Live Remediation in VS Code / Claude',
      speakersZh: 'Tolga Kilicli & Manuel Cerrutti',
      speakersEn: 'Tolga Kilicli & Manuel Cerrutti',
      summaryZh: '全新 listen 工具（12 月 4 日公测）在缺席会议被分派任务或临近汇报时按需唤醒长时智能体；Mateo 在 VS Code 与 Claude Code 中挂载 Work IQ MCP，直接对照聊天决议补齐英法双语切换。',
      summaryEn: 'New MCP listen (Public Preview Dec 4) wakes long-running agents without token-draining polling, while Mateo connects Work IQ MCP inside VS Code and Claude Code to ship bilingual support.',
      chaptersZh: [
        '21:55 — 60+ SharePoint 新工具、跨表面优先级记忆与 Office 文档自然语言生成',
        '23:45 — Work IQ MCP listen：订阅工作意图事件，零轮询词元损耗唤醒智能体',
        '25:20 — Demo 3（VS Code & Claude Code）：挂载 MCP 核对代码与聊天决议差异',
        '28:10 — list_agents 跨端复用：在 Claude 终端直接调用 Copilot Studio 就绪度代理'
      ],
      chaptersEn: [
        '21:55 — ~60 SharePoint Tools, Cross-Surface Memory & Word/Excel/PPT Authoring',
        '23:45 — Work IQ MCP Listen: Event-driven wakeups eliminating polling token waste',
        '25:20 — Demo 3 (VS Code & Claude Code): Diff repo against Teams chat decisions',
        '28:10 — Cross-Host Reuse: Invoke Copilot Studio agents straight from Claude Code'
      ]
    },
    {
      id: 'act4',
      code: 'BRK302 · 30:06 – 38:45',
      tabZh: '04 插件生态与 Agent 365 治理',
      tabEn: '04 Ecosystem & Agent 365 FinOps',
      titleZh: '300+ 连接器生态、双层权限护栏与 25.9× 净价值投资回报透视',
      titleEn: '300+ Connectors, Two-Level Guardrails, and 25.9x Net-Value FinOps',
      speakersZh: 'Tolga Kilicli (Principal GPM)',
      speakersEn: 'Tolga Kilicli (Principal GPM)',
      summaryZh: '通过微软插件注册表一次打包跨 Copilot、ChatGPT、Claude 与 Gemini 复用；依托 Agent 365 实施租户上限 + 智能体窄策略双层管控、剥离隐藏提示词注入，并按部门核算真实净价值。',
      summaryEn: 'Package once in Microsoft Plugin Registry across Copilot, ChatGPT, Claude, and Gemini; enforce tenant + agent policies, strip hidden prompt injections, and measure per-agent ROI in Agent 365.',
      chaptersZh: [
        '30:15 — 插件注册表与多助手覆盖：ChatGPT 插件目录已上线，即将登陆 Claude / Gemini',
        '32:01 — 伙伴与连接器：Adobe、Atlassian、SLB 集成及 300+ 企业系统一次接入',
        '34:50 — 双层安全护栏：租户禁代发邮件 + 单智能体禁删改记录 + 自动剥离提示词注入',
        '36:15 — 成本预测与价值归因：部门分摊导出 Fabric IQ，理赔代理实测 25.9× 投资回报'
      ],
      chaptersEn: [
        '30:15 — Plugin Registry & Multi-Host: Live in ChatGPT directory; Claude/Gemini next',
        '32:01 — Partner Ecosystem: Adobe CX, Atlassian Rovo, SLB & 300+ SaaS connectors',
        '34:50 — Dual Policy & Sanitizer: Tenant/agent caps + prompt-injection stripping',
        '36:15 — Spend & ROI Forecast: Fabric IQ chargeback & 25.9x Claims Agent value'
      ]
    }
  ];

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856618898001EAOa-1791588268002001CvT5';
  var VIDEO_EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/e241973d-6bc2-4333-8aa4-d78d94c37b2b';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/e241973d-6bc2-4333-8aa4-d78d94c37b2b';
  var POSTER_SRC = './media/brk302-session-thumb.jpg';

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk302-session-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk302-session-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTER_VIEWS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk302-theater-tabs';

      for (i = 0; i < CHAPTER_VIEWS.length; i++) {
        (function (idx) {
          var ch = CHAPTER_VIEWS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk302-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? ch.tabEn : ch.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      var chapters = en ? item.chaptersEn : item.chaptersZh;
      var liHtml = '';
      for (i = 0; i < chapters.length; i++) {
        liHtml += '<li>' + chapters[i] + '</li>';
      }

      var mediaHtml = '';
      if (playerLoaded) {
        mediaHtml = [
          '<div class="brk302-theater-screen">',
          '  <iframe class="brk302-theater-embed" src="' + VIDEO_EMBED_URL + '" title="Microsoft Ignite 2026 BRK302 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>',
          '</div>'
        ].join('\n');
      } else {
        mediaHtml = [
          '<div class="brk302-theater-screen">',
          '  <img src="' + POSTER_SRC + '" alt="Microsoft Ignite 2026 BRK302 Build personalized AI experiences with Work IQ" loading="lazy" />',
          '  <div class="brk302-theater-playbar">',
          '    <span>' + (en ? 'Official 45-min Medius On-Demand Recording' : '微软官方 45 分钟高清点播实录（Medius 流）') + '</span>',
          '    <button type="button" class="brk302-theater-playbtn" data-load-brk302-embed="1">' + (en ? '▶ Load Inline Player' : '▶ 内嵌加载官方播放器') + '</button>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      stage.innerHTML = [
        '<div class="brk302-theater-layout">',
        mediaHtml,
        '  <div class="brk302-theater-meta">',
        '    <span class="brk302-theater-code">' + item.code + '</span>',
        '    <h4 class="brk302-theater-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="brk302-theater-speakers">' + (en ? item.speakersEn : item.speakersZh) + '</div>',
        '    <p class="brk302-theater-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="brk302-theater-chapters">' + liHtml + '</ul>',
        '    <div class="brk302-theater-actions">',
        '      <a class="brk302-theater-btn is-primary" href="' + VIDEO_EMBED_URL + '" target="_blank" rel="noopener">' + (en ? '▶ Watch Medius Stream' : '▶ 打开官方点播流') + '</a>',
        '      <a class="brk302-theater-btn" href="' + SLIDES_URL + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载原版 PPTX 课件') + '</a>',
        '      <a class="brk302-theater-btn" href="' + SESSION_URL + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK302 Page' : '↗ 访问 Ignite 专场页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var loadBtn = stage.querySelector('[data-load-brk302-embed]');
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
    document.addEventListener('DOMContentLoaded', initTheater);
  } else {
    initTheater();
  }
})();

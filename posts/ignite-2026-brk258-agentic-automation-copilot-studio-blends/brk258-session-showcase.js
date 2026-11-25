/* posts/ignite-2026-brk258-agentic-automation-copilot-studio-blends/brk258-session-showcase.js */
(function () {
  'use strict';

  var SESSION_META = {
    code: 'BRK258 · Breakout · 45 min',
    speaker: 'Joe Fernandez (Product Manager, Copilot Studio)',
    poster: './media/brk258-session-poster.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/884ed343-acbc-4e75-b5d0-4dc057f66e78',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856612311001EcDa-1791588242520001CJup',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/884ed343-acbc-4e75-b5d0-4dc057f66e78'
  };

  var CHAPTERS = [
    {
      ts: '00:01:01',
      titleZh: '自动化经济账与失控护栏挑战',
      titleEn: 'Automation Economics & Guardrail Imperative',
      detailZh: '援引麦肯锡 57% 工时可自动化（2.9 万亿美元潜力）、Gartner 销售仅 14% 时间用于拓客，以及缺乏风控导致 2027 年底超 40% 智能体项目被取消的警示。',
      detailEn: 'Covers McKinsey 57% automatable US work hours ($2.9T value), Gartner 14% seller prospecting time, and why 40%+ of unguarded agentic projects risk cancellation by 2027.'
    },
    {
      ts: '00:04:00',
      titleZh: '双向混合范式：工作流嵌智能体 vs 工作流作工具',
      titleEn: 'Two-Way Blending: Agent Nodes vs. Workflow Tools',
      detailZh: '阐明智能体负责非结构化判断、工作流锁死确定性顺序：既可在工作流任意步骤插入 Agent 节点，也可把工作流注册为智能体的确定性工具。',
      detailEn: 'Agents supply adaptive judgment while workflows guarantee step order: embed an Agent inside a workflow or expose a workflow on the agent Tools page.'
    },
    {
      ts: '00:06:50',
      titleZh: '全新工作流设计器 GA、单节点测试与计费对比',
      titleEn: 'New Workflow Designer GA, Node Testing & Credit Model',
      detailZh: '展示自由拖拽画布、单节点就地测试（如 Classify 邮件 96% 置信度、1.4 秒跑完）、Copilot Studio Gallery 社区模板库，以及每步确定性动作 0.13 Credit（$0.0013）定价。',
      detailEn: 'Walks through the freeform canvas, inline single-node testing (96% confidence in 1.4s), Copilot Studio Gallery, and 0.13 Credit ($0.0013) deterministic step pricing.'
    },
    {
      ts: '00:15:10',
      titleZh: '更聪明步骤：0.06 秒决策模型、文件输出与 Python 节点',
      titleEn: 'Smarter Steps: 0.06s Decision Model, File Outputs & Python',
      detailZh: '发布 Microsoft-Decision-1.1 驱动的 Classify 节点（0.06 秒路由，快 35 倍、省 200 倍）、Copilot 节点（Chat/Cowork/Autopilot）、真实文件输出（.xlsx/.pdf）与原生 Python Code 节点。',
      detailEn: 'Unveils Microsoft-Decision-1.1 in Classify (0.06s, ~35x faster, 200x cheaper), Copilot node modes, real file outputs (.xlsx/.pdf), and inline Python Code node.'
    },
    {
      ts: '00:18:55',
      titleZh: '规模化与极速构建：逐动作账单、服务主体与 MCP 夺冠',
      titleEn: 'Enterprise Scale, MCP Server & Live Audience Poll',
      detailZh: '演示 Activity 逐动作额度透视、12 月上线的服务主体接管与逐连接凭据选择、环境变量、Code View JSON，以及现场投票（hum.vote/4VBY）MCP Server 斩获人气第一。',
      detailEn: 'Covers per-action credit visibility, December service principal ownership, environment variables, JSON Code view, and live poll results crowning Copilot Studio MCP Server #1.'
    },
    {
      ts: '00:28:15',
      titleZh: '实机总演示：Ignite 大会千封共享邮箱六路智能分流',
      titleEn: 'Live Demo: Ignite FAQ Mailbox Six-Branch Agentic Triage',
      detailZh: '从零跑通共享邮箱触发 -> Decision 极速分类（<85% 置信度转人工）-> 议程/票务/参会证书 PDF 生成/咖啡渍机票 Extract 报销/赞助商委派 Cowork/垃圾邮件 0 Token 清理，并核验 7.29 vs 0.13 Credits 账单。',
      detailEn: 'Builds end-to-end Ignite inbox triage: Decision routing (<85% human escalation), inline Dataverse ticketing agent, branded PDF certificates, coffee-stained ticket Extract, Cowork delegation, zero-token spam cleanup, and 7.29 vs. 0.13 Credit audit.'
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initShowcase() {
    var controls = document.querySelector('[data-sandbox-controls="brk258-video-navigator"]');
    var stage = document.querySelector('[data-sandbox-stage="brk258-video-navigator"]');
    if (!controls || !stage) return;

    var embedActive = false;
    var activeChapter = 0;

    function render() {
      var en = isEnglish();
      var current = CHAPTERS[activeChapter];
      var i;

      controls.innerHTML = '';
      var tabGroup = document.createElement('div');
      tabGroup.className = 'brk258-mode-tabs';

      var posterBtn = document.createElement('button');
      posterBtn.type = 'button';
      posterBtn.className = 'brk258-mode-tab' + (!embedActive ? ' is-active' : '');
      posterBtn.textContent = en ? 'Poster & Chapter Guide' : '高清封面与章节导览';
      posterBtn.addEventListener('click', function () {
        embedActive = false;
        render();
      });

      var playerBtn = document.createElement('button');
      playerBtn.type = 'button';
      playerBtn.className = 'brk258-mode-tab' + (embedActive ? ' is-active' : '');
      playerBtn.textContent = en ? 'Embedded Medius Player' : '内嵌官方点播播放器';
      playerBtn.addEventListener('click', function () {
        embedActive = true;
        render();
      });

      tabGroup.appendChild(posterBtn);
      tabGroup.appendChild(playerBtn);
      controls.appendChild(tabGroup);

      var mediaHtml;
      if (embedActive) {
        mediaHtml = '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK258 On-Demand Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>';
      } else {
        mediaHtml = [
          '<img src="' + SESSION_META.poster + '" alt="Microsoft Ignite 2026 BRK258 official session poster" />',
          '<div class="brk258-poster-overlay">',
          '  <button type="button" class="brk258-play-trigger" data-brk258-launch="1">' + (en ? '▶ Load Official Medius Stream Here' : '▶ 在此直接加载微软官方点播流') + '</button>',
          '</div>'
        ].join('\n');
      }

      var chaptersHtml = '';
      for (i = 0; i < CHAPTERS.length; i++) {
        var ch = CHAPTERS[i];
        chaptersHtml += '<button type="button" class="brk258-chapter-btn' + (i === activeChapter ? ' is-active' : '') + '" data-chapter-idx="' + i + '">' +
          '<span class="brk258-ts-pill">' + ch.ts + '</span>' +
          '<span>' + (en ? ch.titleEn : ch.titleZh) + '</span>' +
          '</button>';
      }

      stage.innerHTML = [
        '<div class="brk258-theater-grid">',
        '  <div>',
        '    <div class="brk258-video-box">' + mediaHtml + '</div>',
        '    <div class="brk258-action-links">',
        '      <a class="brk258-ext-link is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Player' : '▶ 独立窗口打开点播流') + '</a>',
        '      <a class="brk258-ext-link" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck (46 Slides)' : '⬇ 下载官方原版 PPTX（46页）') + '</a>',
        '      <a class="brk258-ext-link" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK258 Session Page' : '↗ Ignite BRK258 官方主页') + '</a>',
        '    </div>',
        '  </div>',
        '  <div class="brk258-meta-col">',
        '    <span class="brk258-session-kicker">' + SESSION_META.code + ' · ' + SESSION_META.speaker + '</span>',
        '    <div class="brk258-chapter-detail"><strong>[' + current.ts + ']</strong> ' + (en ? current.detailEn : current.detailZh) + '</div>',
        '    <div class="brk258-chapter-list">' + chaptersHtml + '</div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var launchBtn = stage.querySelector('[data-brk258-launch]');
      if (launchBtn) {
        launchBtn.addEventListener('click', function () {
          embedActive = true;
          render();
        });
      }

      var chapterBtns = stage.querySelectorAll('[data-chapter-idx]');
      for (i = 0; i < chapterBtns.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            activeChapter = parseInt(btn.getAttribute('data-chapter-idx'), 10) || 0;
            render();
          });
        })(chapterBtns[i]);
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
    document.addEventListener('DOMContentLoaded', initShowcase);
  } else {
    initShowcase();
  }
})();

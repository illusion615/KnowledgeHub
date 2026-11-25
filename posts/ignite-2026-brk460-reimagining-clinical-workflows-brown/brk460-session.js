/* posts/ignite-2026-brk460-reimagining-clinical-workflows-brown/brk460-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    code: 'Microsoft Ignite 2026 · BRK460 · 45 min Breakout',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856643249001EdAR-1791588097028001C4nX',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/5c127f35-8522-4c26-b42f-eaf15096ba75',
    slidesUrl: 'https://medius.microsoft.com/video/asset/PPT/5c127f35-8522-4c26-b42f-eaf15096ba75',
    poster: './media/brk460-session-cover.jpg'
  };

  var CHAPTERS = [
    {
      id: 'inflection',
      tabZh: '00:00 连接智能拐点',
      tabEn: '00:00 Connected Intelligence',
      range: '00:00 – 07:02',
      speakerZh: 'Jonathon Dreyer（微软全球医疗与生命科学产品市场总经理）',
      speakerEn: 'Jonathon Dreyer (GM, HLS Product Marketing, Microsoft)',
      titleZh: '从病历记录迈向跨系统连接智能（Connected Intelligence）',
      titleEn: 'From Encounter Documentation to Cross-System Connected Intelligence',
      summaryZh: '拆解临床 AI 的四阶演进（语音听写 → 环境感知 → 临床助手 → 连接智能）：单次化疗输注背后牵涉 5–25 名医护与行政人员及 10+ 套异构系统，AI 的核心价值是在不替代临床判断的前提下消除跨系统拼装上下文的摩擦。',
      summaryEn: 'Maps the four-stage evolution (Dictation → Ambient → Clinical Assistant → Connected Intelligence): a single chemotherapy infusion spans 5–25 staff across 10+ systems, where AI reduces workflow friction around—never replacing—clinical judgment.',
      pointsZh: [
        '00:01:36 — 四阶演进路线：从捕捉单次问诊扩展至全天跨科室协同',
        '00:03:45 — 化疗输注实例：5–25 名人员横跨电子病历、药房、排班与商保授权',
        '00:05:30 — 三源复利生态：微软底座 + 医疗伙伴应用 + 医院自建本地智能体'
      ],
      pointsEn: [
        '00:01:36 — Four-stage arc from encounter dictation to connected intelligence',
        '00:03:45 — Chemotherapy reality: 5–25 staff coordinating across 10+ systems',
        '00:05:30 — Compounding value: Microsoft + partner apps + health-system agents'
      ]
    },
    {
      id: 'strategy',
      tabZh: '07:02 五维矩阵与先锋计划',
      tabEn: '07:02 5-Pillar AI Matrix',
      range: '07:02 – 17:15',
      speakerZh: 'Adam Landman, MD（Brown University Health 首席数字信息官、急诊医学教授）',
      speakerEn: 'Adam Landman, MD (CDIO, Brown University Health & Prof. of Emergency Medicine)',
      titleZh: '应对医疗三大逆风：21,000 人医疗集团的五维 AI 部署与沙盒孵化',
      titleEn: 'Countering Three Healthcare Headwinds: Five-Track Rollout & Builder Sandbox',
      summaryZh: '面对人力与物资成本年涨 6%+ 而医保偿付仅涨 2%–3% 的剪刀差，Brown University Health 为全员开放受控 Copilot Chat（约 8,000 活跃用户），向 3,000+ 临床医护开放 Dragon Copilot，并赋能 189 名先锋在沙盒中构建出 1,045 个智能体。',
      summaryEn: 'Facing >6% annual expense growth vs. 2%–3% reimbursement increases, Brown University Health rolled out secure Copilot Chat (~8,000 active users), Dragon Copilot for 3,000+ providers, and a Copilot Studio sandbox where 189 builders created 1,045 agents.',
      pointsZh: [
        '00:09:07 — 医疗经营三重压力：6%+ 成本通胀 vs 2%–3% 固定偿付、候诊周期与职业倦怠',
        '00:12:04 — 五维矩阵落地：约 1/3 员工活跃使用安全对话，约 55% 自建智能体聚焦临床',
        '00:15:30 — 三步无代码构建：纯文本指令护栏 + 关闭公网检索的院内知识库 + 多模型择优'
      ],
      pointsEn: [
        '00:09:07 — Fiscal gap (>6% cost growth vs. 2%–3% reimbursement), access & burnout',
        '00:12:04 — ~8,000 active Copilot Chat users; ~55% of 1,045 agents target clinical care',
        '00:15:30 — No-code build with public web search disabled by admin policy'
      ]
    },
    {
      id: 'ed-training',
      tabZh: '17:15 急诊指南与单页实训',
      tabEn: '17:15 ED Guide & EHR Trainer',
      range: '17:15 – 31:15',
      speakerZh: 'Adam Landman, MD（实战案例 1 & 2 实机演示）',
      speakerEn: 'Adam Landman, MD (Use Cases 1 & 2 Walkthrough)',
      titleZh: '把急诊本地指南嵌进 Dragon Copilot，用 10 分钟生成 Epic 交互实训',
      titleEn: 'Embedding ED Guidelines into Dragon Copilot & 10-Minute Epic HTML Simulator',
      summaryZh: '案例一通过 Healthcare Orchestrator 仅填 4 项配置即将 BEM 临床指南挂载至 Epic 内的 Dragon Copilot 窗口，回答 70 岁头部外伤出院问询并诚实标注缺失清单；案例二在 11 月 7 日 Epic Beaker 病理上线前夕，将静态提示单转化为零后端单文件 HTML 仿真器。',
      summaryEn: 'Case 1 wires the BEM Clinical Guide into Dragon Copilot inside Epic via 4 orchestrator fields, answering a 70-year-old head-trauma discharge query while honestly noting missing checklists; Case 2 turns static Epic Beaker tip sheets into a single-file intranet HTML trainer in 10 minutes.',
      pointsZh: [
        '00:19:55 — 床旁最后一公里：通过 Healthcare Orchestrator 将智能体注入 Dragon Copilot',
        '00:22:03 — 诚实边界示范：引用罗德岛医院老年创伤文档，明确告知无专属出院核对表',
        '00:26:50 — 周末破局：1 条提示词 + 静态截图生成 Mr. Okafor 活检医嘱单文件 HTML 实训'
      ],
      pointsEn: [
        '00:19:55 — Secret sauce: 4-field Healthcare Orchestrator registration into Dragon Copilot',
        '00:22:03 — Honest gap disclosure on RIH 70yo head-trauma discharge query',
        '00:26:50 — One prompt turns static Epic Beaker screenshots into interactive HTML trainer'
      ]
    },
    {
      id: 'spine-gov',
      tabZh: '31:15 脊柱外科与六阶治理',
      tabEn: '31:15 Spine Agent & Governance',
      range: '31:15 – 45:00',
      speakerZh: 'Adam Landman, MD & Jonathon Dreyer（案例 3、治理与现场问答）',
      speakerEn: 'Adam Landman, MD & Jonathon Dreyer (Case 3, Governance & Q&A)',
      titleZh: '编码追问直降 70%（43→13）与从草根沙盒到百万美元基金的受控晋升',
      titleEn: 'Cutting Coding Queries 43→13 and Scaling Grassroots Innovation Safely',
      summaryZh: '神经外科医生 David B. Kurland 自建脊柱门诊与手术文档智能体，前 5 个月每百台手术编码追问从 43 次降至 13 次并提前拦截商保缺项；依托 AI 卓越中心六阶门禁、Purview 交互审计、Agent 365 注册表与 FY27 100 万美元创新基金实现安全扩面。',
      summaryEn: 'Neurosurgeon Dr. David B. Kurland built spine documentation agents that cut coding queries per 100 surgeries from 43 to 13 in 5 months and caught payer gaps upfront; AI CoE 6-stage gates, Purview, Agent 365, and a $1M FY27 grant scale frontline prototypes safely.',
      pointsZh: [
        '00:32:45 — 临床医生自研：整合转诊/影像/理疗全包，编码追问 43→13 且提升工作量核定值',
        '00:34:04 — 预授权前置排雷：对比商保规则主动追问缺失项，诚实标记待出检验与过期糖化血红蛋白',
        '00:35:20 — 治理与 $1M 基金：Purview 审计 + Agent 365 监控 + 资助急诊社工与肿瘤免疫不良反应项目'
      ],
      pointsEn: [
        '00:32:45 — Surgeon-built agent cuts coding questions per 100 surgeries from 43 to 13',
        '00:34:04 — Pre-submission payer check flags missing cotinine/ODI & stale HbA1c honestly',
        '00:35:20 — Purview + Agent 365 oversight + $1M FY27 grant (ED social risk & oncology irAEs)'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initBrk460Theater() {
    var controls = document.querySelector('[data-sandbox-controls="brk460-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk460-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var embedLoaded = false;

    function render() {
      var en = isEnglish();
      var ch = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabBar = document.createElement('div');
      tabBar.className = 'brk460-player-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var item = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk460-player-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? item.tabEn : item.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabBar.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabBar);

      var points = en ? ch.pointsEn : ch.pointsZh;
      var listHtml = '';
      for (i = 0; i < points.length; i++) {
        listHtml += '<li>' + points[i] + '</li>';
      }

      var mediaPaneHtml = embedLoaded
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 BRK460 Official Video Player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>'
        : [
            '<img src="' + SESSION_META.poster + '" alt="BRK460 Reimagining clinical workflows Brown University Health cover" loading="lazy" />',
            '<div class="brk460-poster-overlay">',
            '  <button type="button" class="brk460-play-trigger" data-brk460-load-embed="1">' +
              (en ? '▶ Load Official Medius Stream (' + ch.range + ')' : '▶ 在线加载微软官方点播流（' + ch.range + '）') +
            '</button>',
            '</div>'
          ].join('\n');

      stage.innerHTML = [
        '<div class="brk460-theater-grid">',
        '  <div class="brk460-video-shell">' + mediaPaneHtml + '</div>',
        '  <div class="brk460-meta-col">',
        '    <span class="brk460-code-pill">' + SESSION_META.code + ' · ' + ch.range + '</span>',
        '    <h4 class="brk460-chapter-title">' + (en ? ch.titleEn : ch.titleZh) + '</h4>',
        '    <div class="brk460-speaker-line">' + (en ? ch.speakerEn : ch.speakerZh) + '</div>',
        '    <p class="brk460-chapter-summary">' + (en ? ch.summaryEn : ch.summaryZh) + '</p>',
        '    <ul class="brk460-highlights">' + listHtml + '</ul>',
        '    <div class="brk460-action-bar">',
        '      <a class="brk460-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Full-Window Player' : '▶ 新窗口打开官方播放器') + '</a>',
        '      <a class="brk460-btn" href="' + SESSION_META.slidesUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件') + '</a>',
        '      <a class="brk460-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite BRK460 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var playBtn = stage.querySelector('[data-brk460-load-embed]');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          embedLoaded = true;
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
    document.addEventListener('DOMContentLoaded', initBrk460Theater);
  } else {
    initBrk460Theater();
  }
})();

/* posts/ignite-2026-brk238-frontier-tuning-optimize-ai-agents-real/brk238-theater.js */
(function () {
  'use strict';

  var SEGMENTS = [
    {
      id: 'science',
      tabZh: '00:00 架构与三环科学',
      tabEn: '00:00 RLE & 3-Loop Science',
      code: 'BRK238 · Part 01 (00:00–16:10)',
      titleZh: '从预训练转向企业强化学习环境（RLE）与三环爬坡',
      titleEn: 'From Pre-Training to Enterprise RLEs & Three-Loop Hill Climbing',
      speakersZh: 'Ranveer Chandra (VP, Frontier Tuning · Microsoft Research)',
      speakersEn: 'Ranveer Chandra (VP, Frontier Tuning · Microsoft Research)',
      summaryZh: '剖析参差智能（Jagged Intelligence）的根源：合成强化学习环境无法泛化到企业私有流程。提出构建统一覆盖评测、训练与推理的四元 RLE 数字孪生，并通过对抗准则加固、工具虚拟化与 MCTS 树搜索探针驱动渐进式微调。',
      summaryEn: 'Diagnoses Jagged Intelligence: synthetic RL environments fail to generalize to private enterprise workflows. Introduces a unified RLE digital twin across eval, training, and serving with adversarial rubrics, virtualized tools, and MCTS headroom detection.',
      bulletsZh: [
        '00:01:15 — 大模型演进三阶段：竞争优势正从预训练语料转向真实工作强化学习环境（RLE）',
        '00:04:10 — 三步闭环：编码工作数字孪生 → 私有压力评测找差距 → 技能/内核/模型逐层爬坡',
        '00:08:55 — 评测三项突破：对抗准则防奖励作弊、树搜索挖掘失败难例、虚拟化工具零副作用推演',
        '00:11:30 — 树搜索探针：中环 MCTS 增益直接预示微调潜力，线上调用率下滑自动预警模型漂移'
      ],
      bulletsEn: [
        '00:01:15 — Three LLM stages: competitive edge shifts from pre-training to real-work RLEs',
        '00:04:10 — Three-step loop: encode digital twin, run private stress evals, hill-climb step by step',
        '00:08:55 — Eval innovations: adversarial rubric hardening, hard-sample search, virtualized tools',
        '00:11:30 — MCTS probe: inference search lift predicts RFT headroom; routing drop flags model drift'
      ]
    },
    {
      id: 'demo',
      tabZh: '16:15 实机 CLI 与专家访谈',
      tabEn: '16:15 Live CLI & SME Interview',
      code: 'BRK238 · Part 02 (16:15–31:40)',
      titleZh: '实机演示：Tuning CLI 模板初始化、Teams 专家访谈与一键发布',
      titleEn: 'Live Demo: Tuning CLI Templates, Cowork SME Interviews & Publishing',
      speakersZh: 'Malik Pradhan (Principal PM, Frontier Tuning)',
      speakersEn: 'Malik Pradhan (Principal PM, Frontier Tuning)',
      summaryZh: '现场演示在 GitHub Copilot 中调用 Frontier Tuning 插件：基于营销运营模板在 M365 合规边界内秒级生成含 63 项技能与 100 条样本的 RLE，在 Teams 发起专家访谈提炼隐性准则，并将调优后的技能一键发布至 Copilot Cowork。',
      summaryEn: 'Live walkthrough of the Frontier Tuning plugin in GitHub Copilot: provisioning a 63-skill, 100-sample Marketing Operations RLE inside M365, launching Teams/Cowork SME interviews, and publishing tuned skills back to Cowork.',
      bulletsZh: [
        '00:18:10 — 开箱模板：内置营销运营、产品生命周期与人才招聘三大 RLE 模板（含 63 技能 / 100 样本）',
        '00:21:05 — Teams 专家访谈：向业务专家 Riaz 发送会话邀请，在 Cowork 问答中沉淀 build content brief 准则',
        '00:25:20 — Caldova 端到端串联：创作者 Maya、合同专家 Elena、财务 Daniel 与管理员 Jordan 协同治理',
        '00:30:35 — 声明式智能体直连：插件构建器内嵌 Tune with Copilot Credits 按钮，在工作流内就地调优'
      ],
      bulletsEn: [
        '00:18:10 — Starter templates: Marketing Operations, Product Lifecycle & Talent Acquisition (63 skills, 100 samples)',
        '00:21:05 — Teams SME interview: invite marketing expert Riaz into Cowork to codify content-brief rubrics',
        '00:25:20 — Caldova invoice flow: Maker Maya, SME Elena, Finance Daniel & Admin Jordan in Agent 365',
        '00:30:35 — In-flow tuning: Declarative Agent builder adds direct Tune with Copilot Credits action'
      ]
    },
    {
      id: 'customers',
      tabZh: '31:45 客户基准与 EY 税务实战',
      tabEn: '31:45 Customer Benchmarks & EY Tax',
      code: 'BRK238 · Part 03 (31:45–46:30)',
      titleZh: '四大真实企业质量成本实测与安永（EY）75,000 人税务顾问部署',
      titleEn: 'Enterprise Cost-Quality Benchmarks & EY Global Tax L3 Multi-Agent Rollout',
      speakersZh: 'Kalyan Ayloo (Microsoft) & Ben Ambrosino (Global Tax CTO, EY)',
      speakersEn: 'Kalyan Ayloo (Microsoft) & Ben Ambrosino (Global Tax CTO, EY)',
      summaryZh: '公布 Land O\'Lakes、Pearson、微软 People 团队与安永（EY）私有预览实测账单：调优后的小模型（GPT-6 Luna / MAI 1.1）在企业专属准则上全面追平或超越前沿大模型，单任务成本骤降至 1/7 至 1/28，支撑全球规模化投产。',
      summaryEn: 'Reveals private-preview scorecards from Land O\'Lakes, Pearson, Microsoft People Team, and EY: tuned small models (GPT-6 Luna, MAI 1.1) match or beat frontier baselines at 1/7 to 1/28 the cost, unlocking firmwide rollout to 75,000 EY tax professionals.',
      bulletsZh: [
        '00:33:25 — Land O\'Lakes 感官报告：GPT-6 Luna + 树搜索得 0.967 分超越前沿（0.940），千份成本仅 $14（1/28）',
        '00:35:50 — Pearson 沟通教练：MAI 1.1 微调达满分 1.00，千次辅导从 $1,781 降至 $246（约 1/7 价格）',
        '00:38:45 — 安永（EY）全球税务：L3 多智能体串联研究、撰稿与质检，规划覆盖全球 75,000 名税务专家',
        '00:43:15 — EY 业务合伙人实操：MAI 1.1 从 0.496 暴涨 +41.1 分至 0.907，反超前沿模型 GPT-5.6-Sol（0.851）'
      ],
      bulletsEn: [
        '00:33:25 — Land O\'Lakes sensory reports: GPT-6 Luna + Tree Search hits 0.967 vs. 0.940 frontier at $14 per 1,000 runs',
        '00:35:50 — Pearson Communication Coach: MAI 1.1 fine-tuned hits 1.00 score, cutting 1,000 runs from $1,781 to $246',
        '00:38:45 — EY Global Tax L3 architecture: Researcher + Writer + Reviewer agents scaling to 75,000 tax professionals',
        '00:43:15 — EY partner walkthrough: MAI 1.1 climbs +41.1 pts (0.496 → 0.907), beating GPT-5.6-Sol (0.851)'
      ]
    }
  ];

  var SESSION_URL = 'https://ignite.microsoft.com/en-US/sessions/1787856609242001EnzD-1791588157003001CYmK';
  var EMBED_URL = 'https://medius.microsoft.com/Embed/video-nc/757a65cb-1dfd-4c42-bc82-1baa41b22ca1';
  var SLIDES_URL = 'https://medius.microsoft.com/video/asset/PPT/757a65cb-1dfd-4c42-bc82-1baa41b22ca1';
  var POSTER_SRC = './media/session-brk238-poster.jpg';

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initTheater() {
    var controls = document.querySelector('[data-sandbox-controls="brk238-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="brk238-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerMounted = false;

    function render() {
      var en = isEnglish();
      var seg = SEGMENTS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'brk238-theater-tabs';
      for (i = 0; i < SEGMENTS.length; i++) {
        (function (idx) {
          var s = SEGMENTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'brk238-theater-tab' + (idx === activeIdx ? ' is-active' : '');
          btn.textContent = en ? s.tabEn : s.tabZh;
          btn.addEventListener('click', function () {
            activeIdx = idx;
            render();
          });
          tabWrap.appendChild(btn);
        })(i);
      }
      controls.appendChild(tabWrap);

      stage.innerHTML = '';
      var layout = document.createElement('div');
      layout.className = 'brk238-theater-layout';

      var playerShell = document.createElement('div');
      playerShell.className = 'brk238-player-shell';

      if (playerMounted) {
        var iframe = document.createElement('iframe');
        iframe.src = EMBED_URL;
        iframe.title = 'Microsoft Ignite 2026 BRK238 Official On-Demand Stream';
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'allowfullscreen');
        playerShell.appendChild(iframe);
      } else {
        var img = document.createElement('img');
        img.src = POSTER_SRC;
        img.alt = en ? seg.titleEn : seg.titleZh;
        img.loading = 'lazy';
        playerShell.appendChild(img);

        var overlay = document.createElement('div');
        overlay.className = 'brk238-poster-overlay';
        var playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'brk238-play-trigger';
        playBtn.textContent = en ? '▶ Load Official Medius Player (45 min)' : '▶ 在页内加载微软官方点播流（45 分钟）';
        playBtn.addEventListener('click', function () {
          playerMounted = true;
          render();
        });
        overlay.appendChild(playBtn);
        playerShell.appendChild(overlay);
      }

      var meta = document.createElement('div');
      meta.className = 'brk238-meta';

      var codeEl = document.createElement('div');
      codeEl.className = 'brk238-code';
      codeEl.textContent = seg.code;

      var titleEl = document.createElement('h4');
      titleEl.className = 'brk238-title';
      titleEl.textContent = en ? seg.titleEn : seg.titleZh;

      var spkEl = document.createElement('div');
      spkEl.className = 'brk238-speakers';
      spkEl.textContent = en ? seg.speakersEn : seg.speakersZh;

      var sumEl = document.createElement('p');
      sumEl.className = 'brk238-summary';
      sumEl.textContent = en ? seg.summaryEn : seg.summaryZh;

      var ul = document.createElement('ul');
      ul.className = 'brk238-chapters';
      var list = en ? seg.bulletsEn : seg.bulletsZh;
      for (i = 0; i < list.length; i++) {
        var li = document.createElement('li');
        li.textContent = list[i];
        ul.appendChild(li);
      }

      var actions = document.createElement('div');
      actions.className = 'brk238-actions';

      var aVideo = document.createElement('a');
      aVideo.className = 'brk238-btn is-primary';
      aVideo.href = EMBED_URL;
      aVideo.target = '_blank';
      aVideo.rel = 'noopener noreferrer';
      aVideo.textContent = en ? '▶ Open Fullscreen Stream' : '▶ 新窗口打开官方视频流';

      var aSlides = document.createElement('a');
      aSlides.className = 'brk238-btn';
      aSlides.href = SLIDES_URL;
      aSlides.target = '_blank';
      aSlides.rel = 'noopener noreferrer';
      aSlides.textContent = en ? '⬇ Official PPTX Deck' : '⬇ 下载官方 PPTX 课件';

      var aPage = document.createElement('a');
      aPage.className = 'brk238-btn';
      aPage.href = SESSION_URL;
      aPage.target = '_blank';
      aPage.rel = 'noopener noreferrer';
      aPage.textContent = en ? '↗ Ignite BRK238 Page' : '↗ Ignite BRK238 专场主页';

      actions.appendChild(aVideo);
      actions.appendChild(aSlides);
      actions.appendChild(aPage);

      meta.appendChild(codeEl);
      meta.appendChild(titleEl);
      meta.appendChild(spkEl);
      meta.appendChild(sumEl);
      meta.appendChild(ul);
      meta.appendChild(actions);

      layout.appendChild(playerShell);
      layout.appendChild(meta);
      stage.appendChild(layout);
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

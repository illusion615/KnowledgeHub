/* posts/worse-together-multi-user-agents/worse-together-lab.js */
(function () {
  'use strict';

  var ENVIRONMENTS = [
    {
      id: 'api-key',
      tabZh: '01 API 词元预算池（25 场景）',
      tabEn: '01 API Token Budget (25 Scenarios)',
      kickerZh: 'MAMUBench · 4–16 名研究员共享过夜算力配额',
      kickerEn: 'MAMUBench · 4–16 Researchers Sharing Overnight Token Quota',
      titleZh: '群体观望瘫痪与未经同意砍单：价值排序领队实现逆转',
      titleEn: 'Bystander Stalling & Unconsented Cuts: Prompted Team Lead Closes the Gap',
      metricNoteZh: '注：指标为相对精确最优作业价值的平均达成率（%）。全部柱条均为同口径全场景新鲜对局均值 [1][2]。',
      metricNoteEn: 'Metric: Mean share (%) of exact optimal completed job value across fresh scenario runs [1][2].',
      summaryZh: '当共享词元预算不足以跑完所有任务时，一人一代理团队行动过少且过晚：从 4 人扩至 16 人，Sonnet 5 曾出手行动的代理比例从 66% 暴跌至 10%（Opus 5 从 84% 降至 57%）。引入专职领队并指示严格按价值排优、及时释放预留配额后，团队得分反超单智能体协调器。',
      summaryEn: 'Under an insufficient overnight token budget, per-user teams act too little and too late: growing from 4 to 16 agents drops active participation from 66% to 10% on Sonnet 5 (84% to 57% on Opus 5). Adding a dedicated lead instructed to rank by value and release unused reserves lifts the team past the coordinator.',
      bulletsZh: [
        '越权干扰分化：GPT 与 Qwen 代理每局未经询问强杀他人任务 3.9–7.1 次；Sonnet 5 为 0.59 次，Opus 5 为 0 次 [1][2]',
        '公平性偏好差异：4 人场景 Jain 公平指数 Opus 5 最高（0.59 / 0.58），高于理论最优排期的 0.47 [1][2]',
        '最优缓解策略：专职领队 + 三条显式规则（按价值排优、释放余量、成员汇报服从），Opus 5 从 30% 跃升至 71% [1]'
      ],
      bulletsEn: [
        'Unconsented cuts diverge sharply: 3.9–7.1 per episode for GPT/Qwen vs. 0.59 for Sonnet 5 and 0 for Opus 5 [1][2]',
        'Fairness trade-off: Opus 5 reaches 0.59 / 0.58 Jain index across 4-user runs vs. 0.47 for the value-optimal plan [1][2]',
        'Best fix: Prompted Team Lead (rank strictly by value + release held budget + peer deference) lifts Opus 5 from 30% to 71% [1]'
      ],
      bars: {
        opus: [
          { labelZh: '单智能体协调器（Coordinator 对照）', labelEn: 'Single-Agent Coordinator (Control)', val: 64, cls: 'is-coord' },
          { labelZh: '点对点团队（Peer-to-Peer Team）', labelEn: 'Peer-to-Peer Team (1 Agent / User)', val: 30, cls: 'is-team' },
          { labelZh: '无通信静默团队（Silent Team）', labelEn: 'Silent Team (No Peer Channel)', val: 7, cls: 'is-silent' },
          { labelZh: '缓解：领队智能体（Team + Lead）', labelEn: 'Mitigation: Team + Lead Agent', val: 64, cls: 'is-mitigation' },
          { labelZh: '缓解：价值指令领队（Prompted Lead）', labelEn: 'Mitigation: Prompted Lead (+Value Rules)', val: 71, cls: 'is-mitigation' }
        ],
        sonnet: [
          { labelZh: '单智能体协调器（Coordinator 对照）', labelEn: 'Single-Agent Coordinator (Control)', val: 32, cls: 'is-coord' },
          { labelZh: '点对点团队（Peer-to-Peer Team）', labelEn: 'Peer-to-Peer Team (1 Agent / User)', val: 12, cls: 'is-team' },
          { labelZh: '无通信静默团队（Silent Team）', labelEn: 'Silent Team (No Peer Channel)', val: 2, cls: 'is-silent' },
          { labelZh: '缓解：领队智能体（Team + Lead）', labelEn: 'Mitigation: Team + Lead Agent', val: 37, cls: 'is-mitigation' },
          { labelZh: '缓解：价值指令领队（Prompted Lead）', labelEn: 'Mitigation: Prompted Lead (+Value Rules)', val: 44, cls: 'is-mitigation' }
        ]
      }
    },
    {
      id: 'personal-assistant',
      tabZh: '02 个人助理拼单（25 场景）',
      tabEn: '02 Personal Assistant (25 Scenarios)',
      kickerZh: 'MAMUBench · 4–16 人共享餐饮购物车、预订与差旅账单',
      kickerEn: 'MAMUBench · 4–16 Users Sharing Group Cart, Reservations & Trip Split',
      titleZh: '未读私信抢跑结账与凭空捏造：MCP 结账门禁挽救逾六成败局',
      titleEn: 'Unread-DM Checkout Race & Fabrications: MCP Guard Rescues Failed Orders',
      metricNoteZh: '注：前两行为全量 25 场景目标诉求（The Ask）兑现率；后两行为针对「已失败团队对局」重跑时的挽回率（不可与左列新鲜局直接横向相减）[1][2]。',
      metricNoteEn: 'Note: Top two bars show fresh-episode Ask fulfillment; bottom two bars show recovery rates on reruns of previously failed team episodes [1][2].',
      summaryZh: '一名用户提出安全或利他诉求（如乳糜泻患者要求两份无麸质配菜）。虽然 94%–99% 的对局中诉求私信已发给结账代理，但结账瞬间仅 47%–67% 已进入其上下文窗口。领队集权结账在此完全无效，唯有平台级未读消息门禁能精准根治抢跑竞态。',
      summaryEn: 'One user makes a safety or altruistic Ask (e.g., celiac gluten-free sides). The Ask was sent to the committing agent in 94%–99% of runs yet sat in its context at checkout in only 47%–67%. Pinning checkout to a lead fails; blocking checkout until pending DMs are read rescues most failures.',
      bulletsZh: [
        '上下文决定兑现率：诉求在上下文中时兑现率为 56%–68%，未读即抢跑结账时骤降至 19%–36% [1][2]',
        '共享状态覆写与脑补：65%–77% 团队局发生篡改他人诉求写入；58%（Opus）与 53%（Sonnet）捏造他人未曾表态的偏好（单代理仅 17%–20%）[1][2]',
        '平台硬门禁胜出：服务端拦截未读私信结账挽回 73.1%（Opus）/ 62.3%（Sonnet）失败单，叠加行备注与确认栈达 78.9% / 72.0% [2]'
      ],
      bulletsEn: [
        'Context drives fulfillment: Ask honored in 56%–68% of runs when in context at commit vs. 19%–36% when unread [1][2]',
        'Overrides & fabrications: 65%–77% of team episodes override the Ask; 58% (Opus) and 53% (Sonnet) fabricate unsupported claims vs. 17%–20% single-agent [1][2]',
        'Platform guard wins: Blocking checkout while DMs are unread rescues 73.1% (Opus) / 62.3% (Sonnet) of failed runs (78.9% / 72.0% with full stack) [2]'
      ],
      bars: {
        opus: [
          { labelZh: '单智能体协调器（新鲜局兑现率）', labelEn: 'Coordinator (Fresh Ask Fulfillment)', val: 88, cls: 'is-coord' },
          { labelZh: '点对点团队（新鲜局兑现率）', labelEn: 'Peer-to-Peer Team (Fresh Ask Fulfillment)', val: 44, cls: 'is-team' },
          { labelZh: '失败局重跑：仅限领队结账（Lead-Only）', labelEn: 'Failed Rerun: Lead-Only Checkout', val: 47.4, cls: 'is-silent' },
          { labelZh: '失败局重跑：未读私信拦截门禁（MCP Guard）', labelEn: 'Failed Rerun: Unread-DM Guard', val: 73.1, cls: 'is-mitigation' },
          { labelZh: '失败局重跑：完整平台防护栈（Full Stack）', labelEn: 'Failed Rerun: Guard + Notes + Ack', val: 78.9, cls: 'is-mitigation' }
        ],
        sonnet: [
          { labelZh: '单智能体协调器（新鲜局兑现率）', labelEn: 'Coordinator (Fresh Ask Fulfillment)', val: 75, cls: 'is-coord' },
          { labelZh: '点对点团队（新鲜局兑现率）', labelEn: 'Peer-to-Peer Team (Fresh Ask Fulfillment)', val: 37, cls: 'is-team' },
          { labelZh: '失败局重跑：仅限领队结账（Lead-Only）', labelEn: 'Failed Rerun: Lead-Only Checkout', val: 29.4, cls: 'is-silent' },
          { labelZh: '失败局重跑：未读私信拦截门禁（MCP Guard）', labelEn: 'Failed Rerun: Unread-DM Guard', val: 62.3, cls: 'is-mitigation' },
          { labelZh: '失败局重跑：完整平台防护栈（Full Stack）', labelEn: 'Failed Rerun: Guard + Notes + Ack', val: 72.0, cls: 'is-mitigation' }
        ]
      }
    },
    {
      id: 'clinic',
      tabZh: '03 门诊急诊排班（24 场景）',
      tabEn: '03 Clinic Calendar (24 Scenarios)',
      kickerZh: 'MAMUBench · 17–52 名患者代理争抢满额日历并重排常规号源',
      kickerEn: 'MAMUBench · 17–52 Patient Agents Contending for Full Outpatient Calendar',
      titleZh: '聊天噪音反不如静默病历共享：三条执业硬规程助团队破九成',
      titleEn: 'Peer Chat Hurts vs. Shared Notes: Three Strict SOP Rules Lift Teams Past 91%',
      metricNoteZh: '注：指标为急诊患者按期约上且被挤占常规患者成功改期的「联合成功率（Joint Success %）」，汇总 12 集中 + 12 分散信息场景 [2]。',
      metricNoteEn: 'Metric: Joint success (%)—urgent patient booked before deadline AND displaced routine patient rebooked across 24 scenarios [2].',
      summaryZh: '门诊日历已满，接纳急诊必须挤占并妥善改期常规患者。令人意外的是，因存在共享病历备注，无私信的静默团队在 Opus 5 上反而比开启自由私信的点对点团队高出 11.5 个百分点（81.0% vs 69.5%）。自由沟通引入噪音，而代理常把急诊推给候补名单或改约次日。',
      summaryEn: 'Booking an urgent caller on a full calendar requires displacing and rebooking a routine patient. Because agents share patient notes, Opus 5 silent teams actually beat P2P chatting teams by +11.5 pts (81.0% vs. 69.5%). Agents knew the urgency facts in 80% of missed Opus scattered cases yet deferred to waitlists or later days.',
      bulletsZh: [
        '知情却不作为：Opus 5 漏约的分散信息急诊中，80% 在终局前已有代理掌握完整紧急事实（57% 在末次动作时已知情），却改约往后日期 [2]',
        '静默失联退化：GPT-5.6-terra 静默团队在 120 局中有 118 局因连续 5 次空回复被系统退役，导致 75 通患者回电无人接听 [2]',
        '三条执业规程逆转：严禁推诿替代方案 + 听闻家属线索即查档行动 + 挂断前落袋排期，使团队飙升至 95.3% / 91.8% [2]'
      ],
      bulletsEn: [
        'Action shortfall over missing info: In 80% of Opus 5 missed scattered cases, an agent held all urgency facts yet booked a later day [2]',
        'Silent retirement bug: GPT-5.6-terra silent agents hit 5 empty replies and retired in 118/120 episodes, leaving 75 callbacks unanswered [2]',
        'Three-rule SOP fix: No waitlist pass-offs + act on family caller info + book before ending call lifts teams to 95.3% (Opus) and 91.8% (Sonnet) [2]'
      ],
      bars: {
        opus: [
          { labelZh: '单智能体协调器（24 场景均值）', labelEn: 'Single-Agent Coordinator (24-Scenario Mean)', val: 84.3, cls: 'is-coord' },
          { labelZh: '点对点团队（24 场景均值）', labelEn: 'Peer-to-Peer Team (24-Scenario Mean)', val: 70.5, cls: 'is-team' },
          { labelZh: '点对点团队 · 分散信息（Scattered）', labelEn: 'Peer-to-Peer Team · Scattered Info Only', val: 70.2, cls: 'is-silent' },
          { labelZh: '缓解：三条严格执业规程（SOP Stack）', labelEn: 'Mitigation: P2P Team + 3-Rule SOP Stack', val: 95.3, cls: 'is-mitigation' }
        ],
        sonnet: [
          { labelZh: '单智能体协调器（24 场景均值）', labelEn: 'Single-Agent Coordinator (24-Scenario Mean)', val: 74.2, cls: 'is-coord' },
          { labelZh: '点对点团队（24 场景均值）', labelEn: 'Peer-to-Peer Team (24-Scenario Mean)', val: 65.3, cls: 'is-team' },
          { labelZh: '点对点团队 · 分散信息（Scattered）', labelEn: 'Peer-to-Peer Team · Scattered Info Only', val: 44.8, cls: 'is-silent' },
          { labelZh: '缓解：三条严格执业规程（SOP Stack）', labelEn: 'Mitigation: P2P Team + 3-Rule SOP Stack', val: 91.8, cls: 'is-mitigation' }
        ]
      }
    },
    {
      id: 'merge-queue',
      tabZh: '04 代码合并队列（3 场景）',
      tabEn: '04 CI Merge Queue (3 Scenarios)',
      kickerZh: '扩展环境 · 4 名开发者代理基于 pi 0.77.0 争抢发版冻结前 CI Runner',
      kickerEn: 'Extension · 4 Coding Agents (pi 0.77.0) Sharing Scarce CI Runners Before Freeze',
      titleZh: '先到先得挤掉高优修复：公开优先级与末位淘汰线直达 97% 最优值',
      titleEn: 'FIFO Crowds Out Critical PRs: Shared Priority + Cut Line Reaches 97% Value',
      metricNoteZh: '注：指标为发版冻结（105 模拟分钟）前成功合入 PR 的总价值占最佳可行发版方案百分比（%）[2]。',
      metricNoteEn: 'Metric: Merged PR value before the 105-minute release freeze as % of the best feasible release plan [2].',
      summaryZh: '4 个修复 Jinja 3.1.4 缺陷的 PR 需耗时 130 Runner 分钟，但发版冻结前仅有 105 分钟（1–2 台共享 CI Runner）。团队仅通过 PR 评论沟通时几乎不按业务价值让路，合并顺序与真实价值一致的 PR 对仅占 19%–49%（协调器高达 97%–100%）。',
      summaryEn: 'Four PRs against Jinja 3.1.4 require 130 runner-minutes before a 105-minute freeze on 1–2 shared CI runners. Communicating via PR comments, P2P teams match the true value order on only 19%–49% of merged PR pairs vs. 97%–100% for the coordinator.',
      bulletsZh: [
        '真实编码底座复刻：每个代理均为独立运行的 pi 0.77.0 进程并读取各自克隆仓内的 AGENTS.md，每 5 分钟同步 #release-ops 评论流 [2][3]',
        '价值倒挂根因：缺乏全局排序授权时，低优 PR 抢先占满长耗时 CI 通道，拖垮关键安全补丁合入窗口 [2]',
        '轻量治理即刻拉满：向全员公开 Release Manager 优先级并由领队首帖划定淘汰末位 PR（Cut Line），双模型均跃升至 97% [2]'
      ],
      bulletsEn: [
        'Realistic coding harness: Each agent runs inside pi 0.77.0 with its own repo clone and AGENTS.md, syncing #release-ops PR comments every 5 min [2][3]',
        'FIFO priority inversion: Without shared ranking authority, lower-value PRs saturate the single CI runner past the minute-105 cutoff [2]',
        'Lightweight fix hits 97%: Sharing the release manager priority order and posting an immediate last-PR cut line lifts both Claude models to 97% [2]'
      ],
      bars: {
        opus: [
          { labelZh: '单智能体协调器（Coordinator 对照）', labelEn: 'Single-Agent Coordinator (Control)', val: 92, cls: 'is-coord' },
          { labelZh: '点对点团队（PR 评论自主协调）', labelEn: 'Peer-to-Peer Team (PR Comments)', val: 81, cls: 'is-team' },
          { labelZh: '缓解：公开优先级 + 末位裁剪线（Cut Line）', labelEn: 'Mitigation: Lead + Priority Order + Cut Line', val: 97, cls: 'is-mitigation' }
        ],
        sonnet: [
          { labelZh: '单智能体协调器（Coordinator 对照）', labelEn: 'Single-Agent Coordinator (Control)', val: 93, cls: 'is-coord' },
          { labelZh: '点对点团队（PR 评论自主协调）', labelEn: 'Peer-to-Peer Team (PR Comments)', val: 78, cls: 'is-team' },
          { labelZh: '缓解：公开优先级 + 末位裁剪线（Cut Line）', labelEn: 'Mitigation: Lead + Priority Order + Cut Line', val: 97, cls: 'is-mitigation' }
        ]
      }
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initWorseTogetherLab() {
    var controls = document.querySelector('[data-sandbox-controls="mamu-bench-explorer"]');
    var stage = document.querySelector('[data-sandbox-stage="mamu-bench-explorer"]');
    if (!controls || !stage) return;

    var activeEnvIdx = 0;
    var activeModel = 'opus';

    function render() {
      var en = isEnglish();
      var env = ENVIRONMENTS[activeEnvIdx];
      var rows = env.bars[activeModel];
      var i;

      controls.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.className = 'wt-lab-controls';

      var tabs = document.createElement('div');
      tabs.className = 'wt-env-tabs';
      for (i = 0; i < ENVIRONMENTS.length; i++) {
        (function (idx) {
          var item = ENVIRONMENTS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wt-env-tab' + (idx === activeEnvIdx ? ' is-active' : '');
          btn.textContent = en ? item.tabEn : item.tabZh;
          btn.addEventListener('click', function () {
            activeEnvIdx = idx;
            render();
          });
          tabs.appendChild(btn);
        })(i);
      }

      var modelBox = document.createElement('div');
      modelBox.className = 'wt-model-toggle';
      var models = [
        { key: 'opus', label: 'Claude Opus 5' },
        { key: 'sonnet', label: 'Claude Sonnet 5' }
      ];
      for (i = 0; i < models.length; i++) {
        (function (m) {
          var mBtn = document.createElement('button');
          mBtn.type = 'button';
          mBtn.className = 'wt-model-btn' + (m.key === activeModel ? ' is-active' : '');
          mBtn.textContent = m.label;
          mBtn.addEventListener('click', function () {
            activeModel = m.key;
            render();
          });
          modelBox.appendChild(mBtn);
        })(models[i]);
      }

      wrap.appendChild(tabs);
      wrap.appendChild(modelBox);
      controls.appendChild(wrap);

      var barListEl = document.createElement('div');
      barListEl.className = 'wt-bar-list';
      for (i = 0; i < rows.length; i++) {
        var r = rows[i];
        var widthPct = Math.max(2, Math.min(100, r.val));
        var rowEl = document.createElement('div');
        rowEl.className = 'wt-bar-row';
        rowEl.innerHTML = [
          '<div class="wt-bar-head">',
          '  <span>' + (en ? r.labelEn : r.labelZh) + '</span>',
          '  <span class="wt-bar-val">' + r.val + '%</span>',
          '</div>'
        ].join('');
        var trackEl = document.createElement('div');
        trackEl.className = 'wt-bar-track';
        var fillEl = document.createElement('div');
        fillEl.className = 'wt-bar-fill ' + r.cls;
        fillEl.style.width = widthPct + '%';
        trackEl.appendChild(fillEl);
        rowEl.appendChild(trackEl);
        barListEl.appendChild(rowEl);
      }

      var bullets = en ? env.bulletsEn : env.bulletsZh;
      var liHtml = '';
      for (i = 0; i < bullets.length; i++) {
        liHtml += '<li>' + bullets[i] + '</li>';
      }

      stage.innerHTML = [
        '<div class="wt-lab-grid">',
        '  <div class="wt-bars-panel">',
        '    <span class="wt-panel-kicker">' + (en ? env.kickerEn : env.kickerZh) + ' · ' + (activeModel === 'opus' ? 'Claude Opus 5' : 'Claude Sonnet 5') + '</span>',
        '    <h4 class="wt-panel-heading">' + (en ? env.titleEn : env.titleZh) + '</h4>',
        '    <div data-wt-bar-mount="1"></div>',
        '    <p class="wt-bar-note">' + (en ? env.metricNoteEn : env.metricNoteZh) + '</p>',
        '  </div>',
        '  <div class="wt-diagnosis-panel">',
        '    <span class="wt-panel-kicker">' + (en ? 'Root-Cause & Mitigation Diagnosis' : '失灵根因与对症治理诊断') + '</span>',
        '    <p class="wt-diag-summary">' + (en ? env.summaryEn : env.summaryZh) + '</p>',
        '    <ul class="wt-diag-list">' + liHtml + '</ul>',
        '    <div class="wt-source-links">',
        '      <a class="wt-link-btn" href="https://alignment.anthropic.com/2026/worse-together/" target="_blank" rel="noopener">' + (en ? '↗ Alignment Blog' : '↗ Anthropic 官方博客') + '</a>',
        '      <a class="wt-link-btn" href="https://arxiv.org/abs/2610.00583" target="_blank" rel="noopener">' + (en ? '📄 arXiv:2610.00583' : '📄 阅读 arXiv 论文') + '</a>',
        '      <a class="wt-link-btn" href="https://github.com/safety-research/MAMUBench" target="_blank" rel="noopener">' + (en ? '💻 MAMUBench Repo' : '💻 MAMUBench 源码仓') + '</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var mount = stage.querySelector('[data-wt-bar-mount="1"]');
      if (mount) mount.replaceWith(barListEl);
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
    document.addEventListener('DOMContentLoaded', initWorseTogetherLab);
  } else {
    initWorseTogetherLab();
  }
})();

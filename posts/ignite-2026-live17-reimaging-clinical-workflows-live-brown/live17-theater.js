/* posts/ignite-2026-live17-reimaging-clinical-workflows-live-brown/live17-theater.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thumbnail.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/bc3fe25c-bdfe-4458-ae57-8f637c5cb128',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1793676448692001gDY9-AAAAAAAAAAAAAAAAAAAA',
    companionSessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787856643249001EdAR-1791588097028001C4nX',
    speakersZh: 'Jonathon Dreyer（Microsoft 全球医疗与生命科学产品市场负责人） & Adam Landman, MD（Brown University Health 首席数字信息官）',
    speakersEn: 'Jonathon Dreyer (GM, HLS Product Marketing, Microsoft) & Adam Landman, MD (Chief Digital Information Officer, Brown University Health)'
  };

  var CHAPTERS = [
    {
      id: 'builder-mindset',
      time: '00:00:09 – 00:02:25',
      tabZh: '00:09 全员底座与医生构建者',
      tabEn: '00:09 Clinician Builder Program',
      titleZh: '从自上而下规划到一线赋能：20,000 人 PHI 安全底座与 Copilot Studio 先锋计划',
      titleEn: 'Top-Down Strategy Meets Frontline Builders: 20K Staff Base & Copilot Studio',
      summaryZh: 'Jonathon Dreyer 与 Adam Landman 博士复盘 Brown University Health 如何兼顾组织级战略与一线临床痛点：先面向全员约 20,000 名员工铺开隔离受保护健康信息（PHI）的 Copilot Chat（约 8,000 人活跃），再为科研人员、创新者与 AI 先锋建立 Copilot Studio 构建者计划。',
      summaryEn: 'Jonathon Dreyer and Dr. Adam Landman explain how Brown University Health balances strategic IT priorities with frontline problem-solving: rolling out PHI-safe Copilot Chat to ~20,000 employees (~8,000 active) while enabling researchers, innovators, and AI champions in Copilot Studio.',
      bulletsZh: [
        '00:00:35 — 核心理念转变：把工作流构建权交给最贴近临床摩擦点的一线医护人员',
        '00:01:33 — 向全部约 20,000 名员工部署受控 Copilot Chat，确保商业机密与受保护健康信息（PHI）不外泄，活跃用户达约 8,000 人',
        '00:02:05 — 针对想更进一步的科研人员与临床先锋启动 Copilot Studio 构建者项目，不搞全员摊派而走精准赋能'
      ],
      bulletsEn: [
        '00:00:35 — Core thesis: hand workflow creation control to the clinicians closest to daily friction',
        '00:01:33 — Deployed PHI-safe Copilot Chat across ~20,000 employees, reaching ~8,000 active users',
        '00:02:05 — Launched a targeted Copilot Studio builder program for researchers, innovators, and AI champions'
      ]
    },
    {
      id: 'neurosurgery',
      time: '00:02:26 – 00:03:22',
      tabZh: '02:26 神经外科术前智能体群',
      tabEn: '02:26 Neurosurgery Agents',
      titleZh: '临床医生自建实例：串联门诊病历、收费编码核验与个性化医保事前授权',
      titleEn: 'Clinician-Built in Practice: Visit Notes, Billing Codes & Prior Authorization',
      summaryZh: '一位长期受困于排期手术繁琐行政文书的神经外科医生，亲手在平台内设计了一组协同智能体：自动汇总接诊记录与诊疗方案、核准手术收费与账单编码，并对照患者具体参保条款起草个性化事前授权申请单。',
      summaryEn: 'Frustrated by surgical setup paperwork, a Brown neurosurgeon built a series of agents to assemble visit documentation, verify billing and charging codes, and draft patient-specific prior authorization notes matched to payer rules.',
      bulletsZh: [
        '00:02:30 — 痛点起源：神经外科医生为患者安排必需手术时面临沉重的跨系统文书与审批负担',
        '00:02:41 — 智能体链路一与二：辅助整理门诊记录及诊疗建议，并联动核验账单与收费代码（Billing & Charging Codes）准确性',
        '00:02:50 — 智能体链路三：自动识别患者险种与赔付方事前授权（Prior Authorization）门槛，生成个性化申请文书，加速患者获治'
      ],
      bulletsEn: [
        '00:02:30 — Trigger: administrative burden delaying surgical scheduling for neurosurgery patients',
        '00:02:41 — Agents assemble visit documentation, care plans, and accurate surgical billing/charging codes',
        '00:02:50 — Checks patient insurance and payer prior-authorization rules to draft personalized auth notes'
      ]
    },
    {
      id: 'dragon-ehr',
      time: '00:03:23 – 00:04:38',
      tabZh: '03:23 Dragon Copilot 嵌入 EHR',
      tabEn: '03:23 Dragon Copilot in EHR',
      titleZh: '双轨触达端点：知识工作者驻留 Teams，临床医生通过 Dragon Copilot 直达电子病历',
      titleEn: 'Dual Endpoints: Teams for Knowledge Staff, Dragon Copilot Inside the EHR for Clinicians',
      summaryZh: '智能体只有出现在用户原本干活的界面才能真正落地：行政与知识型员工通过 Copilot 原生应用、网页或 Teams 调用；而整日工作在电子健康记录（EHR）中的临床医生，则借助 Dragon Copilot 在床旁环境语音录入窗口内无缝唤起 Copilot Studio 智能体。',
      summaryEn: 'Agents must live where work happens: knowledge workers use the Copilot app or Teams, while clinicians spending their days in the EHR access Copilot Studio agents directly at the point of care through Dragon Copilot.',
      bulletsZh: [
        '00:03:38 — 办公侧端点：Copilot 应用、Web 与 Microsoft Teams 天然契合工作站前的行政与运营人员',
        '00:03:58 — 临床侧现实：一线医护全天驻留在电子健康记录（EHR）系统内，跳出病历窗口即意味着摩擦中断',
        '00:04:14 — 关键桥梁：Dragon Copilot 不仅提供诊室环境语音病历生成（Ambient Documentation），更充当床旁容器直接嵌入自建智能体'
      ],
      bulletsEn: [
        '00:03:38 — Native Copilot app, web, and Teams serve workstation-based knowledge workers',
        '00:03:58 — Clinicians live inside the Electronic Health Record (EHR) throughout patient care',
        '00:04:14 — Dragon Copilot pairs ambient documentation with a point-of-care window hosting Copilot Studio agents'
      ]
    },
    {
      id: 'governance',
      time: '00:04:39 – 00:07:16',
      tabZh: '04:39 沙盒与 Purview/A365 治理',
      tabEn: '04:39 Risk Governance & A365',
      titleZh: '治理不是路障而是加速器：AI CoE 双向孵化、临床风险分级与 Agent 365 全量审计',
      titleEn: 'Governance as an Accelerator: Sandbox Discovery, Risk Tiers & Purview + Agent 365',
      summaryZh: 'Adam Landman 博士阐明“治理得当反而跑得更快”：所有创新先在受控的 Copilot Studio 沙盒起步，由 AI 卓越中心（AI CoE）执行双向发现与风险分级验证，并通过 Agent 365 实名登记责任人与 Microsoft Purview 追踪每一次运行审计日志。',
      summaryEn: 'Dr. Landman reframes governance from roadblock to speed enabler: builders start in a visible Copilot Studio sandbox, the AI Center of Excellence applies risk-tiered clinical validation, and Purview plus Agent 365 enforce registration and audit logging.',
      bulletsZh: [
        '00:05:10 — 受控沙盒与双向联接：AI CoE 既能主动发掘沙盒内高潜力原型帮扶扩规模，也受理构建者的推广申请',
        '00:05:48 — 风险分级门禁：触及临床诊疗与患者决策的智能体列为高风险，须经严苛验证与多级审批；低风险行政场景敏捷放行',
        '00:06:18 — 实名台账与运行监控：全部智能体强制注册功能与责任人，借力 Microsoft Purview 与 Agent 365 留存完整审计日志；科研侧同步引入 Foundry'
      ],
      bulletsEn: [
        '00:05:10 — Controlled Copilot Studio sandbox with bidirectional outreach between builders and the AI CoE',
        '00:05:48 — Risk-based review: patient-facing clinical decision agents face strict validation gates',
        '00:06:18 — Every agent registered with owner metadata and monitored via Microsoft Purview, Agent 365 & Foundry'
      ]
    },
    {
      id: 'onboarding-iq',
      time: '00:07:17 – 00:09:59',
      tabZh: '07:17 医师入职自动化与 Work IQ',
      tabEn: '07:17 Provider Onboarding & IQ',
      titleZh: '下一阶段攻坚：破解医疗三大高压挑战、加速新聘医师入职与院内知识围栏',
      titleEn: 'What\'s Next: Tackling Healthcare\'s Triple Pressures, Provider Onboarding & Microsoft IQ',
      summaryZh: '面对财务承压、患者挂号难与医护职业倦怠三大挑战，Brown 正推进“新聘医师入职（Provider Onboarding）”智能体自动化，削减资质文书与反复问询以让新医生尽早开诊；同时严禁智能体访问公网，仅锚定 SharePoint/Teams 院内精选知识库与 Microsoft IQ 上下文。',
      summaryEn: 'Targeting financial pressure, limited care access, and clinician burnout, Brown is automating new provider onboarding so doctors see waiting patients sooner—locking agents strictly to curated SharePoint/Teams knowledge and Microsoft IQ without public web leakage.',
      bulletsZh: [
        '00:07:44 — 锚定三大行业痛点：严峻财务压力、患者临床就诊可及性受限、临床医生高职业倦怠',
        '00:08:01 — 在研旗舰场景：用智能体简化新聘临床医师入职（Provider Onboarding）繁杂手续，缩短候诊患者等待周期',
        '00:08:40 — 数据围栏与 Microsoft IQ：阻断公网信源检索，仅连接院内已审校的 SharePoint 与 Teams 政策库并直投临床工作流'
      ],
      bulletsEn: [
        '00:07:44 — Targets three macro pressures: financial strain, patient access bottlenecks, and clinician burnout',
        '00:08:01 — Active build: automating new provider onboarding paperwork so clinicians start seeing patients faster',
        '00:08:40 — Blocks public internet lookups, grounding agents strictly in curated SharePoint/Teams sources via Microsoft IQ'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initLive17Theater() {
    var controls = document.querySelector('[data-sandbox-controls="live17-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="live17-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'live17-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'live17-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 LIVE17 Official Broadcast Recording" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="LIVE17 Reimaging Clinical Workflows Live with Brown University Health official cover" loading="lazy" />' +
          '<button type="button" class="live17-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="live17-play-pill">' + (en ? '▶ Load Official Broadcast Stream (10 min)' : '▶ 点击加载官方内嵌点播流（10 分钟访谈实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="live17-theater-layout">',
        '  <div class="live17-player-wrap">' + mediaInner + '</div>',
        '  <div class="live17-meta">',
        '    <span class="live17-code">LIVE17 · Broadcast Stage · ' + item.time + '</span>',
        '    <h4 class="live17-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="live17-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="live17-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="live17-highlights">' + liHtml + '</ul>',
        '    <div class="live17-actions">',
        '      <a class="live17-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="live17-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite LIVE17 Page' : '↗ 访问 LIVE17 专场主页') + '</a>',
        '      <a class="live17-btn" href="' + SESSION_META.companionSessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Companion BRK460 Session' : '↗ 关联主讲专场 BRK460') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initLive17Theater);
  } else {
    initLive17Theater();
  }
})();

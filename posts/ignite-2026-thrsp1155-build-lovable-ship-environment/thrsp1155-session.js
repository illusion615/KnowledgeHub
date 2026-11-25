/* posts/ignite-2026-thrsp1155-build-lovable-ship-environment/thrsp1155-session.js */
(function () {
  'use strict';

  var SESSION_META = {
    poster: './media/session-thrsp1155-thumb.jpg',
    embedUrl: 'https://medius.microsoft.com/Embed/video-nc/229a486b-d759-43a2-9f20-839dd231e7ce',
    sessionUrl: 'https://ignite.microsoft.com/en-US/sessions/1787858601555001SSaX-1791588343927001Cafn',
    transcriptUrl: 'https://medius.microsoft.com/video/asset/Caption/229a486b-d759-43a2-9f20-839dd231e7ce',
    speakersZh: 'Malavika Balachandran Tadeusz（Lovable）',
    speakersEn: 'Malavika Balachandran Tadeusz (Lovable)'
  };

  var CHAPTERS = [
    {
      id: 'proof',
      time: '00:00:52 – 00:02:55',
      tabZh: '00:52 规模实证与战略契合',
      tabEn: '00:52 Enterprise Proof & Vision',
      titleZh: '从 7,000 万项目到企业生产：不让速度与治理二选一',
      titleEn: 'From 70M+ Projects to Production: Refusing to Trade Speed for Governance',
      summaryZh: 'Malavika 披露 Lovable 已服务超 40,000 家企业并累计创建逾 7,000 万个项目（含 Microsoft、Deutsche Telekom、NVIDIA），援引微软托管应用与智能体副总裁 David Blyth 论断阐明合作初衷。',
      summaryEn: 'Malavika shares that 40,000+ businesses and 70M+ projects run on Lovable—including Microsoft, Deutsche Telekom, and NVIDIA—anchoring the partnership on David Blyth\'s principle that enterprises shouldn\'t choose between speed and governance.',
      bulletsZh: [
        '00:01:42 — 披露全平台累计超 7,000 万个项目与 40,000+ 企业团队采用数据',
        '00:01:55 — 幻灯片列举真实企业成效：Nursa 单一中枢承载 83,000 名代理、Deutsche Telekom 构建 3,000+ 内部应用、Productiv 核心重构提速 12 倍且年省 $100K+',
        '00:02:27 — 引用微软 VP David Blyth（2026 年 9 月 CMR 发布）：兼具初创级迭代速度与微软级安全合规'
      ],
      bulletsEn: [
        '00:01:42 — Reveals 70M+ total projects created and 40,000+ businesses using Lovable for work',
        '00:01:55 — Slide metrics: Nursa (83,000 agents on one hub), Deutsche Telekom (3,000+ apps), Productiv (12x faster rebuild, $100K+ saved/yr)',
        '00:02:27 — Quotes Microsoft VP David Blyth (Sept 2026 CMR launch) on uniting startup velocity with enterprise guardrails'
      ]
    },
    {
      id: 'interfaces',
      time: '00:02:56 – 00:05:39',
      tabZh: '02:56 四扇微软开放接口',
      tabEn: '02:56 Four Microsoft Interfaces',
      titleZh: '单一创作层叠加既有底座：Graph、CMR、Fabric 与生态认证',
      titleEn: 'One Creation Layer Over Existing Foundations: Graph, CMR, Fabric & Ecosystem',
      summaryZh: '系统拆解微软向外部软件开放的四扇标准接口——Microsoft Graph、Copilot Managed Runtime、Fabric API for GraphQL 以及 Entra/GitHub/Marketplace/MCP Center，强调企业无需新建第二套身份或数据目录。',
      summaryEn: 'Breaks down the four open Microsoft doors—Microsoft Graph, Copilot Managed Runtime, Fabric API for GraphQL, and Entra/GitHub/Marketplace/MCP Center—positioning Lovable purely as the creation layer.',
      bulletsZh: [
        '00:03:03 — Microsoft Graph 与 Copilot Managed Runtime：委托 OAuth 读写 M365 数据，单页应用直投租户',
        '00:03:42 — Fabric API for GraphQL：自动生成湖仓/数仓 Schema，前端免自建后端直接查询',
        '00:04:32 — 定位“只加创作层、不换底座”：真实 React 代码双向同步至企业自有 GitHub 仓库供 VS Code 接力'
      ],
      bulletsEn: [
        '00:03:03 — Microsoft Graph & Copilot Managed Runtime: OAuth-scoped M365 access and tenant-hosted SPAs',
        '00:03:42 — Fabric API for GraphQL: auto-generated schemas let Lovable apps query Lakehouses without custom backends',
        '00:04:32 — Creation-layer architecture: two-way syncs real React code to your GitHub repo for VS Code & Copilot'
      ]
    },
    {
      id: 'workflows',
      time: '00:07:17 – 00:11:05',
      tabZh: '07:17 供应商对账六步闭环',
      tabEn: '07:17 Supplier Desk & Dual Gov',
      titleZh: '实战数据流转与双层治理：账单不出 M365 边界的六步对账台',
      titleEn: 'Six-Step Supplier Statement Desk & Dual-Layer Governance Split',
      summaryZh: '以财务团队构建“供应商对账工作台（Supplier Statement Desk）”为例，追踪邮件从 Outlook 共享邮箱进入、比对 SharePoint/Excel 与 Fabric 账本、推送 Teams 审批并原位回写的全流程，厘清微软与 Lovable 治理边界。',
      summaryEn: 'Walks through a six-step Supplier Statement Desk—reading shared Outlook inboxes, matching SharePoint/Excel and Fabric ledgers, routing Teams approvals, and writing back in place—plus the Microsoft vs. Lovable governance split.',
      bulletsZh: [
        '00:07:24 — 供应商账单进入 Outlook 应付共享邮箱，应用以管理员批准权限读取且零外部拷贝',
        '00:07:57 — 自动逐行核对 SharePoint 应付表与 Fabric 数仓，标记未付及差异发票并在 Teams 频道完成个人账号签批',
        '00:10:15 — 双层治理分工：微软管身份（Entra MFA/条件访问）与数据策略，Lovable 管工作区 SCIM、审计与发布前安全扫描'
      ],
      bulletsEn: [
        '00:07:24 — Reads supplier statements in shared Outlook AP mailbox under admin-approved permissions without copying data out',
        '00:07:57 — Matches lines against SharePoint Excel workbooks and Fabric, flags mismatches, and posts approvals to Teams',
        '00:10:15 — Dual governance: Microsoft governs Entra identity & tenant data; Lovable governs workspace SCIM, audit logs & code scans'
      ]
    },
    {
      id: 'cmr',
      time: '00:11:18 – 00:14:09',
      tabZh: '11:18 三大路径与 CMR 20分钟配置',
      tabEn: '11:18 Three Paths & 20-Min CMR',
      titleZh: '逐应用选型矩阵与 Copilot Managed Runtime 五步租户托管',
      titleEn: 'App-by-App Hosting Choice & Five-Step Copilot Managed Runtime Flow',
      summaryZh: '横向对比 Host on Lovable、Copilot Managed Runtime（已向商业版与企业版开放）与 Deploy on Azure 三条路径，详解管理员仅需约 20 分钟完成 Entra 委托权限与 Power Platform 规则配置，运行时零数据回流 Lovable。',
      summaryEn: 'Compares Host on Lovable, Copilot Managed Runtime (GA on Business & Enterprise), and Deploy on Azure, detailing the ~20-minute one-time Entra + Power Platform setup where zero runtime data flows back to Lovable.',
      bulletsZh: [
        '00:11:37 — 按数据敏感度逐应用选型：公网原型走 Lovable Cloud，M365 租户隔离走 CMR，高敏核心库走 Azure BYOC',
        '00:12:33 — 管理员一次性开通仅需约 20 分钟（Entra 仅委托权限企业应用 + Power Platform 管理中心单条规则）',
        '00:13:56 — 通过 CMR SDK 打包部署入租户，复用组织既有 Microsoft 许可与 DLP 策略，运行时无任何流量回传 Lovable'
      ],
      bulletsEn: [
        '00:11:37 — App-by-app choice: Lovable Cloud for fast prototypes, CMR for M365 tenant isolation, Azure BYOC for strict residency',
        '00:12:33 — One-time ~20-minute IT setup: user-delegated Entra app plus one Power Platform admin center rule',
        '00:13:56 — Packages via CMR SDK into your tenant under existing licensing and DLP; nothing flows back to Lovable at runtime'
      ]
    },
    {
      id: 'azure',
      time: '00:14:10 – 00:18:20',
      tabZh: '14:10 Deploy on Azure 与路线图',
      tabEn: '14:10 Deploy on Azure & Next',
      titleZh: '客户自有云（BYOC）专属 VNet 拓扑与下一阶段 Copilot 生态演进',
      titleEn: 'Deploy on Azure Private VNet Architecture & Upcoming Copilot Roadmap',
      summaryZh: '深入拆解处于定向私有预览的 Deploy on Azure：通过 ARM 模板在客户订阅专属 VNet 内拉起 AKS 数据面、Blob 静态层、Azure Functions 动态计算与 PostgreSQL 数据库，通过单向出站 mTLS 与 VNet 对等互连守护高敏资产。',
      summaryEn: 'Deep-dives into Deploy on Azure (private preview): ARM-provisioned dedicated VNet running AKS, Blob Storage, Azure Functions, and Azure Database for PostgreSQL, with outbound-only mTLS and private VNet peering to HR/CRM systems.',
      bulletsZh: [
        '00:14:50 — 专属 VNet 全栈落地：容器镜像拷入客户 ACR，AKS 承载数据面，SSR TanStack 应用运行于 Blob + Azure Functions + PostgreSQL',
        '00:15:26 — 网络零入站暴露：编辑器留在 Lovable 并仅靠出站单向 mTLS 通信，通过 VNet Peering 私网直连 HR 与核心数仓（支持 Key Vault BYOK）',
        '00:15:58 — 路线图前瞻：已发布应用的 MCP 服务接入 Copilot Studio 智能体、在 Teams 聊天内直接描述生成预览、Web 应用支持 Dataverse 安全角色'
      ],
      bulletsEn: [
        '00:14:50 — Full-stack VNet footprint: images copied to your ACR; AKS data plane + SSR TanStack on Blob, Functions & PostgreSQL',
        '00:15:26 — Zero inbound exposure: outbound-only mTLS to Lovable editor, private VNet peering to HR/warehouses & Key Vault BYOK',
        '00:15:58 — Next up: wiring app MCP servers into Copilot Studio, building previews from Teams chat, and Dataverse roles for web apps'
      ]
    }
  ];

  function isEnglish() {
    var lang = document.documentElement.getAttribute('lang') || '';
    return lang.toLowerCase().indexOf('en') === 0;
  }

  function initThrsp1155Theater() {
    var controls = document.querySelector('[data-sandbox-controls="thrsp1155-video-theater"]');
    var stage = document.querySelector('[data-sandbox-stage="thrsp1155-video-theater"]');
    if (!controls || !stage) return;

    var activeIdx = 0;
    var playerLoaded = false;

    function render() {
      var en = isEnglish();
      var item = CHAPTERS[activeIdx];
      var i;

      controls.innerHTML = '';
      var tabWrap = document.createElement('div');
      tabWrap.className = 'thrsp1155-theater-tabs';

      for (i = 0; i < CHAPTERS.length; i++) {
        (function (idx) {
          var ch = CHAPTERS[idx];
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thrsp1155-theater-tab' + (idx === activeIdx ? ' is-active' : '');
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
        ? '<iframe src="' + SESSION_META.embedUrl + '" title="Microsoft Ignite 2026 THRSP1155 Official Video" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>'
        : '<img src="' + SESSION_META.poster + '" alt="THRSP1155 Build with Lovable, ship in your Microsoft environment official session cover" loading="lazy" />' +
          '<button type="button" class="thrsp1155-play-overlay" data-load-embed="1" aria-label="' + (en ? 'Load embedded Microsoft Medius player' : '加载微软官方内嵌点播播放器') + '">' +
          '  <span class="thrsp1155-play-pill">' + (en ? '▶ Load Official Video Player (19 min)' : '▶ 点击加载官方内嵌点播流（19 分钟实录）') + '</span>' +
          '</button>';

      stage.innerHTML = [
        '<div class="thrsp1155-theater-layout">',
        '  <div class="thrsp1155-player-wrap">' + mediaInner + '</div>',
        '  <div class="thrsp1155-meta">',
        '    <span class="thrsp1155-code">THRSP1155 · ' + item.time + '</span>',
        '    <h4 class="thrsp1155-title">' + (en ? item.titleEn : item.titleZh) + '</h4>',
        '    <div class="thrsp1155-speakers">' + (en ? SESSION_META.speakersEn : SESSION_META.speakersZh) + '</div>',
        '    <p class="thrsp1155-summary">' + (en ? item.summaryEn : item.summaryZh) + '</p>',
        '    <ul class="thrsp1155-highlights">' + liHtml + '</ul>',
        '    <div class="thrsp1155-actions">',
        '      <a class="thrsp1155-btn is-primary" href="' + SESSION_META.embedUrl + '" target="_blank" rel="noopener">' + (en ? '▶ Open Medius Stream' : '▶ 新窗口打开官方点播流') + '</a>',
        '      <a class="thrsp1155-btn" href="' + SESSION_META.transcriptUrl + '" target="_blank" rel="noopener">' + (en ? '⬇ Official Transcript' : '⬇ 下载官方逐字稿讲义') + '</a>',
        '      <a class="thrsp1155-btn" href="' + SESSION_META.sessionUrl + '" target="_blank" rel="noopener">' + (en ? '↗ Ignite THRSP1155 Page' : '↗ 访问 Ignite 专场主页') + '</a>',
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
    document.addEventListener('DOMContentLoaded', initThrsp1155Theater);
  } else {
    initThrsp1155Theater();
  }
})();

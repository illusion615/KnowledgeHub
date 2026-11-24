// posts/copilot-studio-managed-runtime-alm/alm-diagnostic-sandbox.js
// Pure static client-side interactive Environment Routing & ALM Decision Sandbox.
// Strictly ES5-compatible (no arrow functions) to pass Study Room static contract gates.

(function () {
  'use strict';

  var SCENARIOS = {
    'cmr-studio-app': {
      chipZh: '场景 1：Copilot Studio App 磁贴 (New Experience)',
      chipEn: 'Scenario 1: Copilot Studio App Tile (New Experience)',
      uiContextZh: '顶栏环境选择器显示：Team-Dev（你之前手动选中的团队开发环境）',
      uiContextEn: 'Top-bar Environment Picker shows: Team-Dev (your previously selected team environment)',
      realLandingZh: 'Maker 专属个人环境（Personal Environment · 托管环境 · 初始无 Dataverse）',
      realLandingEn: 'Maker Personal Environment (Managed Environment · Initially without Dataverse)',
      whyZh: 'Copilot Managed Runtime (CMR) 环境路由在所有商业租户强制开启且不可关闭。创建 App 时默认忽略顶栏选择器，直接落入个人环境并自动分配平台托管 Git 仓库（repoType: native）。但构建期的对话消耗计入 Copilot Studio 环境计费池，且构建期数据驻留由登录令牌的 PDL / 2 字母 Country 决定。',
      whyEn: 'Copilot Managed Runtime (CMR) routing is mandatory in every tenant. App creation ignores the UI picker and lands in your personal environment with a platform-managed Git repository (repoType: native), while build-time credits bill against Copilot Studio and build data residency follows your sign-in token PDL / 2-letter Country.',
      adminViewZh: 'MAC -> Apps -> All apps（15 分钟内同步） | PPAC -> Manage -> Inventory（筛 Item type = Copilot Managed Runtime）；不在传统 Power Apps 列表中',
      adminViewEn: 'MAC -> Apps -> All apps (within 15 min) | PPAC -> Manage -> Inventory (Item type = Copilot Managed Runtime); not in classic Power Apps list',
      almTitleZh: '推荐 ALM 晋升路径：克隆源码 + 目标环境显式指定 --environment-id / BYOB 流水线',
      almTitleEn: 'Recommended ALM Path: Clone Git Source + Explicit --environment-id or BYOB CI/CD',
      cmd: [
        '# 1. 从个人环境的平台托管 Git 仓库克隆应用源码',
        'ms auth login',
        'ms app list --permission edit',
        'ms app clone --app <personal-app-guid> ./my-enterprise-app',
        '',
        '# 2. 在目标专用开发/测试环境显式传入 --environment-id 创建 BYOB 应用记录',
        'ms app create my-enterprise-app --display-name "Enterprise App" --repo none --environment-id <target-env-id> --non-interactive',
        '',
        '# 3. 校验共享连接 allowedActions 策略并打包部署（目标环境需开启 AllowExternalArtifactDeployment）',
        'npm ci && npm run build',
        'ms app pack',
        'ms app deploy'
      ].join('\n')
    },
    'cmr-cli-cowork': {
      chipZh: '场景 2：Copilot Cowork / Code / ms CLI 默认创建',
      chipEn: 'Scenario 2: Copilot Cowork / Code / ms CLI Default Create',
      uiContextZh: '无 Power Platform 顶栏环境选择器（M365 聊天画布或本地终端会话）',
      uiContextEn: 'No Power Platform top-bar picker (M365 chat canvas or local terminal session)',
      realLandingZh: 'Maker 专属个人环境（若无现成规则，系统自动创建 Everyone 兜底路由与默认环境组）',
      realLandingEn: 'Maker Personal Environment (auto-creates Everyone catch-all rule & default environment group if none exist)',
      whyZh: '首次运行 ms app create（不带 --environment-id）或使用 Cowork App skill 时，平台按优先级匹配路由规则并将应用绑定至个人环境。若租户已有自定义安全组路由规则但未包含当前 Maker 且缺少末尾 Everyone 规则，创建将直接报 403 阻断。',
      whyEn: 'Running ms app create without --environment-id or building in Cowork matches routing rules in priority order and binds to the personal environment. If custom security-group rules exist without a trailing Everyone catch-all rule, unmatched makers get a 403 block.',
      adminViewZh: '运行入口：managedapps.cloud.microsoft | 治理入口：MAC -> Apps -> Settings -> Environment groups（默认放行 19 个 Entra 连接器）',
      adminViewEn: 'User portal: managedapps.cloud.microsoft | Governance: MAC -> Apps -> Settings -> Environment groups (allows 19 first-party Entra connectors)',
      almTitleZh: '推荐 ALM 晋升路径：GitHub Enterprise Cloud 绑定或 GitHub Actions 服务主体 (SPN) 交付',
      almTitleEn: 'Recommended ALM Path: GitHub Enterprise Cloud Binding or GitHub Actions SPN Delivery',
      cmd: [
        '# 方式 A：直接显式指定目标环境与外部 GitHub Enterprise Cloud 仓库',
        'ms app create finance-tracker --display-name "Finance Tracker" --repo https://github.com/contoso/finance-tracker --environment-id <dev-env-id>',
        '',
        '# 方式 B：非 Dataverse 托管环境为 CI/CD 服务主体授予 EnvironmentAdmin（注意使用 Enterprise App Object ID）',
        'az account get-access-token --resource https://service.powerapps.com/ --query accessToken -o tsv',
        '# POST https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments/<env-id>/modifyRoleAssignments?api-version=2021-04-01',
        '',
        '# 方式 C：员工离职或转交 IT 时，通过 ms CLI 移交平台 Git 仓库与 App 所有权',
        'ms admin add owner newowner@contoso.com --app <app-guid>',
        'ms admin remove owner formerowner@contoso.com --app <app-guid>'
      ].join('\n')
    },
    'new-agent-routed': {
      chipZh: '场景 3：New Agent (Microsoft Copilot Harness) 开启环境路由',
      chipEn: 'Scenario 3: New Agent (Microsoft Copilot Harness) with Routing On',
      uiContextZh: '首次打开门户自动跳入个人环境（Your Name\'s Environment），或手动切回 Team-Dev',
      uiContextEn: 'Initial visit auto-routes to Personal Environment, or manually switched to Team-Dev',
      realLandingZh: '当前顶栏激活环境的 Dataverse（自动为个人环境注入 Dataverse 并触发 60+15 天休眠清理倒计时！）',
      realLandingEn: 'Active top-bar environment Dataverse (auto-provisions Dataverse in Personal Env and starts 60+15 day inactivity cleanup!)',
      whyZh: '与 CMR App 不同，Copilot Studio Agent 严格写入顶栏当前选中的环境 Dataverse。但若管理员在 PPAC 为 Copilot Studio 勾选了环境路由，Maker 首次进入门户会被静默切到个人环境并自动挂载 Dataverse——这会立即把原本永不过期的 CMR 个人环境纳入“60 天无活动禁用 + 15 天删除”的强制定时清理轨道！',
      whyEn: 'Unlike CMR Apps, Copilot Studio Agents write to the active top-bar environment Dataverse. However, if PPAC routing is enabled for Copilot Studio, makers land in their personal environment on first visit, which automatically adds Dataverse and subjects all CMR apps in that environment to the 60-day disable + 15-day delete inactivity timer!',
      adminViewZh: 'PPAC -> Manage -> Inventory（筛 microsoft.copilotstudio/agents） | MAC -> Agent 365 Registry（自动注册 Entra Agent ID）',
      adminViewEn: 'PPAC -> Manage -> Inventory (microsoft.copilotstudio/agents) | MAC -> Agent 365 Registry (auto-provisions Entra Agent ID)',
      almTitleZh: '推荐 ALM 晋升路径：使用 msagent CLI 克隆为本地 YAML 代码或纳入自定义 Unmanaged Solution',
      almTitleEn: 'Recommended ALM Path: Clone to Local YAML via msagent CLI or Package in Custom Unmanaged Solution',
      cmd: [
        '# 1. 安装 Microsoft.Agents.Hosting.Cli (.NET 10) 并从个人/源环境克隆 New Agent 定义',
        'dotnet tool install --global Microsoft.Agents.Hosting.Cli --prerelease',
        'msagent auth login --account developer@contoso.com --tenant <tenant-id> --cloud prod',
        'msagent agent create --agent-type MCSAgent --mcs-clone-agent-id <source-agent-id> --mcs-clone-environment-id <personal-env-id> --project ./VisitorGuide',
        '',
        '# 2. 注册 Test 与 Prod 部署目标槽位（切勿仅运行 msagent env select，必须显式创建 deployment）',
        'msagent deployment create --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name staging --deployment-type test --environment-id <test-env-id>',
        'msagent deployment create --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name production --deployment-type prod --environment-id <prod-env-id>',
        '',
        '# 3. 推送草稿、绑定目标环境连接引用、运行评测集并正式发布',
        'msagent agent deploy --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name staging',
        'msagent deployment connection update --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name staging --connection-reference <ref-name> --connection-id <conn-id> --non-interactive',
        'msagent agent eval run --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name staging',
        'msagent agent deploy --project ./VisitorGuide --agent-name "Visitor Guide" --deployment-name production --publish'
      ].join('\n')
    },
    'm365-agent-builder': {
      chipZh: '场景 4：M365 Copilot Agent Builder 声明式创建',
      chipEn: 'Scenario 4: M365 Copilot Agent Builder Declarative Creation',
      uiContextZh: 'Microsoft 365 Copilot Chat 内嵌 Agent Builder 界面（无环境选择器）',
      uiContextEn: 'Embedded Agent Builder inside Microsoft 365 Copilot Chat (no environment picker)',
      realLandingZh: '租户级 M365 存储与 PPAC Inventory（isManaged = null，不落入常规自定义 Dataverse Solution）',
      realLandingEn: 'Tenant-level M365 store & PPAC Inventory (isManaged = null; outside standard custom Dataverse Solutions)',
      whyZh: '在 M365 Copilot Chat 的 Agent Builder（Lite 体验）中创建的 Agent，在 PPAC Inventory 中标记为 createdIn = "Microsoft Copilot Agent Builder" 且 properties.isManaged = null。它支持在 MAC Agent 365 中直接删除或重新指派 Owner，但若需完整 Solution ALM 管道与多环境晋升，需在 Copilot Studio 完整工作室中构建。',
      whyEn: 'Agents created in M365 Copilot Agent Builder record createdIn = "Microsoft Copilot Agent Builder" and properties.isManaged = null in PPAC Inventory. Admins can delete or reassign them directly in MAC Agent 365, whereas full Solution ALM requires authoring in Copilot Studio.',
      adminViewZh: 'MAC -> Agents -> Agent registry（可直接 Delete / Block / Reassign） | PPAC Inventory 显示 createdIn = Microsoft Copilot Agent Builder',
      adminViewEn: 'MAC -> Agents -> Agent registry (direct Delete / Block / Reassign) | PPAC Inventory shows createdIn = Microsoft Copilot Agent Builder',
      almTitleZh: '推荐 ALM 晋升路径：在 Copilot Studio 正式开发环境重建或通过 M365 Copilot 插件包生命周期发布',
      almTitleEn: 'Recommended ALM Path: Author in Dedicated Copilot Studio Dev Env or Publish via M365 Admin Center Catalog',
      cmd: [
        '# 在専用开发环境使用 msagent 直接脚手架创建受 Git 管控的 Microsoft Copilot Harness Agent：',
        'msagent env select <dedicated-dev-env-id>',
        'msagent agent create --agent-type MCSAgent --mcs-agent-type CLI \\',
        '  --agent-name "Enterprise Knowledge Agent" \\',
        '  --schema-name contoso_enterpriseKnowledge \\',
        '  --description "Grounded enterprise assistant" \\',
        '  --initial-prompt "Answer strictly using enterprise knowledge sources." \\',
        '  --environment-id <dedicated-dev-env-id> \\',
        '  --project ./EnterpriseKnowledgeAgent'
      ].join('\n')
    }
  };

  function getLang() {
    var htmlLang = document.documentElement.getAttribute('lang') || 'zh-CN';
    return htmlLang.indexOf('en') === 0 ? 'en' : 'zh';
  }

  function mountDiagnosticSandbox() {
    var slot = document.getElementById('cmr-alm-diagnostic-sandbox');
    if (!slot) return;

    var controls = slot.querySelector('[data-sandbox-controls="cmr-alm-diagnostic-sandbox"]');
    var stage = slot.querySelector('[data-sandbox-stage="cmr-alm-diagnostic-sandbox"]');
    if (!stage) return;

    var activeKey = 'cmr-studio-app';
    var keys = ['cmr-studio-app', 'cmr-cli-cowork', 'new-agent-routed', 'm365-agent-builder'];

    if (controls) {
      var btnHtml = [];
      btnHtml.push('<div class="cmr-diag-toolbar">');
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var item = SCENARIOS[k];
        var activeCls = k === activeKey ? ' is-active' : '';
        btnHtml.push(
          '<button type="button" class="cmr-diag-chip' + activeCls + '" data-scenario="' + k + '" data-zh="' + item.chipZh + '" data-en="' + item.chipEn + '">' + item.chipZh + '</button>'
        );
      }
      btnHtml.push('</div>');
      controls.innerHTML = btnHtml.join('\n');
    }

    function renderScenario() {
      var data = SCENARIOS[activeKey];
      var isEn = getLang() === 'en';
      var html = [
        '<div class="cmr-diag-board">',
        '  <div class="cmr-diag-card is-warn">',
        '    <span class="cmr-diag-kicker" data-zh="1. 界面表象（UI Context Illusion）" data-en="1. UI Context Illusion">' + (isEn ? '1. UI Context Illusion' : '1. 界面表象（UI Context Illusion）') + '</span>',
        '    <div class="cmr-diag-value" data-zh="' + data.uiContextZh + '" data-en="' + data.uiContextEn + '">' + (isEn ? data.uiContextEn : data.uiContextZh) + '</div>',
        '    <p class="cmr-diag-note" data-zh="' + data.whyZh + '" data-en="' + data.whyEn + '">' + (isEn ? data.whyEn : data.whyZh) + '</p>',
        '  </div>',
        '  <div class="cmr-diag-card is-highlight">',
        '    <span class="cmr-diag-kicker" data-zh="2. 物理资产真实落盘位置（Physical Storage Plane）" data-en="2. Physical Storage Plane">' + (isEn ? '2. Physical Storage Plane' : '2. 物理资产真实落盘位置（Physical Storage Plane）') + '</span>',
        '    <div class="cmr-diag-value" data-zh="' + data.realLandingZh + '" data-en="' + data.realLandingEn + '">' + (isEn ? data.realLandingEn : data.realLandingZh) + '</div>',
        '    <p class="cmr-diag-note" data-zh="管理员盘点路径：' + data.adminViewZh + '" data-en="Admin Inventory Surface: ' + data.adminViewEn + '">' + (isEn ? 'Admin Inventory Surface: ' + data.adminViewEn : '管理员盘点路径：' + data.adminViewZh) + '</p>',
        '    <p class="cmr-diag-note"><strong data-zh="' + data.almTitleZh + '" data-en="' + data.almTitleEn + '">' + (isEn ? data.almTitleEn : data.almTitleZh) + '</strong></p>',
        '  </div>',
        '</div>',
        '<pre class="cmr-diag-cmd-box"><code>' + data.cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>'
      ].join('\n');

      stage.innerHTML = html;
    }

    if (controls) {
      var chips = controls.querySelectorAll('[data-scenario]');
      for (var j = 0; j < chips.length; j++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            activeKey = btn.getAttribute('data-scenario') || 'cmr-studio-app';
            for (var m = 0; m < chips.length; m++) {
              chips[m].classList.remove('is-active');
            }
            btn.classList.add('is-active');
            renderScenario();
          });
        })(chips[j]);
      }
    }

    renderScenario();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDiagnosticSandbox);
  } else {
    mountDiagnosticSandbox();
  }
})();

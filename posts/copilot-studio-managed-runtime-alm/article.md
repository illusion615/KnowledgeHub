---
title: Copilot Studio 托管运行时深度解析：双环境错觉成因与企业级生命周期实战 || Copilot Studio Managed Runtime Deep Dive: Dual-Environment Illusion and Enterprise ALM Practice
eyebrow: Copilot Studio Architecture & Enterprise ALM || Copilot Studio Architecture & Enterprise ALM
brand: Study Room Copilot Studio || Study Room Copilot Studio
date: 2026-11-24
strict_i18n: true
strict_density: true
lead: 开启 Copilot Studio 新版体验创建应用或智能体时，许多团队发现顶栏明明选中了团队开发环境，新建资产却悄然落入个人环境或消失在传统列表中 [1][2]。本文从托管运行时架构、强制环境路由机制、双管理中心盘点差异到命令行晋升流水线，完整拆解这一双环境错觉的底层成因与企业级破局方案 [3][5]。 || When building apps or agents in the Copilot Studio New Experience, teams often select a shared development environment in the top bar only to find new assets landing in personal environments [1][2]. This article dissects the managed runtime architecture, mandatory routing rules, admin inventory splits, and command-line promotion pipelines [3][5].
panel_label: 架构诊断与治理摘要 || Architecture & Governance Brief
panel_title: 厘清托管运行时与智能体双轨落盘边界 || Untangle Managed Runtime and Agent Storage Boundaries
panel_desc: 应用与智能体在顶栏选择器、路由策略及底层存储平面上遵循两套截然不同的控制链路 [1][3]。 || Apps and agents follow two distinct control paths across the top-bar picker, routing rules, and storage planes [1][3].
panel:
  - 托管运行时强制路由 — 创建应用时默认忽略顶栏环境选择器并直达个人环境 [2] || Mandatory App Routing — App creation bypasses the top-bar picker and lands in the personal environment [2]
  - 智能体数据库注入连锁反应 — 个人环境一旦创建智能体即挂载数据库并激活 60+15 天休眠清理 [4] || Agent Database Chain Reaction — Creating an agent in a personal environment adds a database and triggers the 60+15 day cleanup timer [4]
  - 双轨命令行持续交付 — 通过源码覆盖配置与部署槽位彻底打通跨环境晋升 [5][6] || Dual-Track CLI Delivery — Promote across environments via stage overlays and explicit deployment slots [5][6]
metrics:
  - 托管接口调用费率 || Managed API Call Rate | 0.1 Credit | 每次托管运行时接口调用消耗 0.1 额度，高级应用许可在额度内含权 [1] || 0.1 Credit per managed runtime API call, included within Power Apps Premium entitlements [1]
  - 默认放行一等连接器 || Default Allowed Connectors | 19 个 | 默认环境组预置放行 19 个企业身份认证连接器并拦截开放式网络动作 [3] || Default environment group allows 19 Entra-authenticated connectors and blocks open HTTP actions [3]
  - 含库休眠清理周期 || Dataverse Inactivity Timer | 60 + 15 天 | 个人环境一旦挂载数据库，满 60 天无活动即禁用并在 15 天后彻底删除 [4] || Once Dataverse is added to a personal environment, 60 days of inactivity disables it and 15 more days deletes it [4]
style:
  accent: "#9333ea"
  teal: "#0d8f8c"
---

## #runtime-evolution 01 / Managed Runtime Evolution :: 托管运行时定位、产品演进与宿主边界 || Managed Runtime Positioning, Product Evolution, and Hosting Boundaries

2026 年秋季起，打开门户首页顶部的 `New experience` 开关后，构建能力从传统的智能体、工作流与智能体流三类资产，正式扩展为包含全栈微应用（Apps）的四元矩阵 [1]。这一演进的核心底座是 **Copilot Managed Runtime**（托管运行时），它为自然语言生成或代码优先构建的交互式前端应用提供零基础设施运维的托管执行环境、平台内置版本仓库以及受控的数据连接代理 [1][2]。

:::insight-grid { cols: 3, title: "托管运行时的三大架构特征 || Three Architectural Pillars of Managed Runtime" }
::card 01
### 原生代码仓与声明式配置驱动 || Native Git Repo and Declarative Config
每个托管应用默认关联一个平台托管的代码仓库（`repoType: native`），通过根目录下的 `ms.config.json` 声明连接引用、环境变量及共享连接策略，不再把前端源码塞入数据库解决方案二进制包 [2][5]。 || Every managed app binds to a platform-hosted Git repository (`repoType: native`) and declares connections, variables, and policies in `ms.config.json` instead of packing source files into database solution zip blobs [2][5].

::card 02
### 初始无数据库的轻量个人沙盒 || Lightweight Personal Sandbox Without Initial Database
为降低试验门槛，系统为每位创作者自动分配的个人环境初始不包含底层关系型数据库，且在此纯托管应用状态下不受休眠自动清理策略影响 [2][3]。 || To lower experimentation overhead, the automatically provisioned personal environment starts without a relational database and remains exempt from inactivity deletion while in that pure state [2][3].

::card 03
### 严格沙盒化与高管级连接护栏 || Strict Frame Sandboxing and Connector Guardrails
应用运行在 `managedapps.cloud.microsoft` 独立域名下，强制执行内容安全策略（禁止内联脚本与外部嵌套），默认环境组仅放行 19 个官方身份认证连接器并拦截任意外部接口请求 [3]。 || Apps execute under `managedapps.cloud.microsoft` with strict content security policies, while the default environment group permits only 19 first-party Entra connectors and blocks arbitrary HTTP calls [3].
:::

在实际工程选型中，许多架构师容易将 Copilot Studio 中的托管运行时应用、基于新版编排框架的智能体以及传统画布或代码应用混为一谈 [1][7]。下表从物理宿主、构建期计费、运行期计量及源码持久化方式四个维度厘清三者的边界：

| 对比维度 || Dimension | Copilot Studio 托管应用 (Apps on Managed Runtime) | Copilot Studio 新版智能体 (Agents on Copilot Harness) | 传统画布与模型驱动应用 (Classic Power Apps) |
|------|------|------|------|
| 核心产物与入口 || Artifact & Entry | 首页开启新版体验后的 `Apps` 磁贴、协同画布或 `ms` 命令行 [1][5] || `Apps` tile under New Experience, Cowork, or `ms` CLI [1][5] | 首页 `Agents` / `Workflows` 入口或 `msagent` 命令行 [1][6] || `Agents` / `Workflows` entry or `msagent` CLI [1][6] | 创作者门户画布应用、模型驱动应用与解决方案页 [4] || Maker portal canvas apps, model-driven apps, and solutions [4] |
| 底层物理存储平面 || Physical Storage Plane | 平台托管代码仓或外部企业代码仓，构建产物经打包命令上传 [2][5] || Platform-managed Git repo or GitHub Enterprise Cloud via pack upload [2][5] | 当前激活环境的数据库表（`bot` 与 `botcomponent`）及解决方案 [4][6] || Active environment Dataverse tables (`bot` and `botcomponent`) [4][6] | 当前环境的数据库表（`canvasapp`）与托管解决方案包 [4] || Active environment Dataverse (`canvasapp`) and managed solutions [4] |
| 构建期额度消耗 || Build-Time Billing | 自然语言对话生成与修改代码消耗当前环境的构建额度 [1] || Natural-language app generation consumes Copilot Credits in the active billing pool [1] | 自然语言构建每轮消耗额度（轻度 1–20、中度 21–60、重度 61+）[1] || Conversational building consumes Credits (Light 1–20, Medium 21–60, Heavy 61+) [1] | 创作者门户编辑不按对话轮次扣减构建额度 [1] || Maker editing does not deduct conversational build Credits [1] |
| 运行期计量规则 || Run-Time Metering | 每次托管运行时接口调用计 `0.1 Credit`（高级应用许可内含）[1] || `0.1 Credit` per API call (included in Power Apps Premium USL) [1] | 按实际模型调用与工具消耗计量（常见任务约 `100–500+ Credits`）[1] || Metered by model tokens and tool invocations (`100–500+ Credits` per task) [1] | 按用户席位许可或环境按应用许可核验权限 [1] || Governed by per-user USL or per-app environment licensing [1] |

$$
\text{Credits}_{\text{CMR-Run}} = N_{\text{API}} \times 0.1, \qquad \text{Credits}_{\text{Reasoning}} = \frac{T_{\text{input-uncached}} + T_{\text{cache-write}} + T_{\text{output}}}{1000} \times 10
$$

:::callout { title: "构建期与运行期的计费池解耦 || Decoupled Build-Time and Run-Time Billing Pools" }
创作者在构建托管应用时，自然语言生成界面的对话消耗记入 Copilot Studio 环境的计费账单；而应用发布上线后，终端用户触发的连接器与数据读写则按托管运行时接口调用（每次 0.1 额度）独立计量 [1][2]。 || During app authoring, natural-language generation charges against the Copilot Studio environment billing pool, whereas published end-user traffic is metered separately as Managed Runtime API calls at 0.1 Credit per call [1][2].
:::

## #dual-environment-illusion 02 / The Dual-Environment Illusion :: 为什么创建后总落入个人环境，界面却显示在所选环境中 || Why Assets Land in Personal Environments While the UI Shows Your Selected Environment

企业团队反馈最多的痛点是：开发人员在门户右上角的环境选择器里明确切换到了共享开发环境（例如 `Team-Dev`），随后点击创建应用或智能体，结果管理员在 `Team-Dev` 的解决方案里找不到该资产，或者发现它被静默写入了创作者的个人环境 [2][4]。这种“所见非所得”的双环境错觉，本质上是**界面会话上下文**、**构建期地理令牌解析**与**强制环境路由规则**三层控制面各自独立决策造成的 [2][3]。

:::diagram { src: "./media/dual-environment-anatomy", drawio: "./media/dual-environment-anatomy.drawio", title: "Copilot Studio 双环境错觉：顶栏环境上下文与个人环境路由的脱钩解剖 || The Dual-Environment Illusion: Decoupled UI Environment Picker vs. Personal Environment Routing" }
图 1：入口层顶栏选择器、路由控制平面与底层物理存储平面的三路分流解剖。创建托管应用时系统直接旁路顶栏选择器，而构建期计费与地理驻留则分别绑定至门户会话和登录令牌 [2][3][4]。 || Figure 1: Three-way split across the top-bar picker, routing control plane, and physical storage plane. Managed app creation bypasses the UI picker while build billing and data residency bind to session context and sign-in tokens [2][3][4].
:::

:::comparison { title: "顶栏环境选择器上下文 vs 后台真实物理落盘路由 || Top-Bar Picker Context vs. Actual Backend Routing" }
::versus 表象层：门户顶栏环境选择器 || Surface Layer: Top-Bar Environment Picker
### 仅约束当前会话列表与构建计费池 || Scopes Session Lists and Build Billing Only
顶栏显示的 `Team-Dev` 仅用于过滤当前页面展示的智能体与工作流列表，并决定自然语言构建对话从哪个环境的计费池扣减额度；它对托管应用的物理落盘位置没有任何约束力 [1][2]。 || The `Team-Dev` label in the top bar only filters the displayed agents/workflows list and determines which billing pool pays for build-time prompts; it has zero authority over where a new managed app is physically stored [1][2].

::versus 控制层：托管运行时强制个人环境路由 || Control Layer: Mandatory Personal Environment Routing { highlight: true }
### 租户级常开且默认忽略顶栏选择器 || Tenant-Wide Always-On Routing Bypassing UI Picker
托管运行时的环境路由在所有租户中强制开启且无法关闭。只要通过界面磁贴、协同画布或不带环境参数的命令行创建应用，系统一律忽略顶栏选择器，强制将应用写入创作者的个人环境 [2][3]。 || Environment routing for Managed Runtime is mandatory and cannot be disabled. Creating an app via UI tiles, Cowork, or CLI without an explicit environment flag ignores the top bar and writes directly to the maker's personal environment [2][3].
:::

除了物理环境落盘的脱钩，**构建期的数据驻留区域**也会制造第二重错觉 [2]。即使顶栏选中的 `Team-Dev` 位于欧洲区，托管应用在自然语言构建阶段的会话数据驻留地也不由该环境决定，而是由创作者登录令牌（Entra ID Token）按以下三级优先级实时解析 [2]：

:::flow { title: "构建期数据驻留与个人环境路由的四步判定链路 || Four-Step Resolution for Build Geo and Personal Routing" }
1. **解析登录令牌首选数据位置 (PDL) || Parse Sign-in Token Preferred Data Location (PDL)** — 系统首先读取创作者身份令牌中的 `PDL` 属性，将其映射为构建期对话与生成服务的物理区域，完全忽略顶栏所选环境的区域设置 [2]。 || The runtime inspects the `PDL` claim in the maker's Entra token to assign the build-time processing geography, ignoring the region of the environment shown in the top bar [2].
2. **回退两字母国家代码与租户默认区 || Fallback to Two-Letter Country Code and Tenant Geo** — 若令牌未配置 `PDL`，则依次读取令牌中的两字母国家代码（`c` 声明）及租户主区域，若命中暂不支持托管运行时的区域则拒绝创建 [2]。 || When `PDL` is absent, resolution falls back to the token's two-letter country claim (`c`) and then the tenant home geo, blocking creation if the resolved geo is unsupported [2].
3. **按序匹配托管运行时环境路由规则 || Match Managed Runtime Routing Rules in Priority Order** — 系统在 Microsoft 365 管理中心的路由表中自上而下匹配安全组规则；若无自定义规则，系统自动创建一条针对全员（`Everyone`）的兜底规则并指向默认环境组 [2][3]。 || The platform evaluates security-group routing rules top-down in the Microsoft 365 admin center, auto-generating a catch-all `Everyone` rule pointing to the Default Environment Group on first use [2][3].
4. **分配个人托管环境与平台代码仓库 || Provision Personal Managed Environment and Native Git Repo** — 命中规则后自动创建或复用创作者专属个人环境（类型标记为托管环境），并在后台初始化平台托管代码仓库承载应用文件 [2][5]。 || Upon matching a rule, the service provisions or reuses the maker's personal managed environment and initializes a platform-hosted Git repository for the app source [2][5].
:::

更隐蔽的治理陷阱发生在**管理视图分裂**与**休眠清理连锁反应**上 [2][3][4]。下面通过三组折叠抽屉拆解为什么管理员与创作者看到的资产状态经常对不上：

### 为什么在 Power Apps 列表里找不到新建的托管应用？ || Why Are New Managed Apps Missing from Classic Power Apps Lists?

托管运行时应用与传统画布应用分属不同的资源提供方 [2][3]。应用创建后最长需要 15 分钟同步至 **Microsoft 365 管理中心（MAC）** 的 `Apps -> All apps` 页面；而在 **Power Platform 管理中心（PPAC）** 中，它根本不会出现在传统的 Power Apps 应用列表里，管理员必须进入 `Manage -> Inventory` 并将资产类型筛选为 `Copilot Managed Runtime` 才能检索到 [2][3]。终端用户的统一运行入口则是独立的 `https://managedapps.cloud.microsoft` 门户 [3]。

### 为什么个人环境里的应用突然在 60 天后被禁用甚至删除？ || Why Do Personal Environment Apps Suddenly Face 60-Day Disabling and Deletion?

单独使用托管运行时创建应用时，系统分配的个人环境**不包含**关系型数据库（Dataverse），官方文档明确说明此类纯托管环境不会因休眠而被自动清理 [2][3]。然而，一旦管理员在 PPAC 中为 Copilot Studio 开启了产品级环境路由，或者创作者在顶栏停留在个人环境时顺手创建了一个智能体（Agent），系统就会**自动为该个人环境注入数据库实例** [4]。数据库一旦挂载，整个个人环境（含其中的托管应用）立即被纳入开发者环境的休眠回收轨道：**连续 60 天无活动即禁用环境，再过 15 天彻底删除全部资产** [4]。

### 为什么修改自定义路由规则后部分创作者直接报 403 权限阻断？ || Why Do Custom Routing Rules Trigger 403 Blocks for Some Makers?

当租户内第一位创作者构建托管应用时，平台会自动生成一条覆盖全员（`Everyone`）的默认路由规则 [2][3]。如果管理员随后在 Microsoft 365 管理中心新增了按安全组划分的路由规则，却删掉了末尾的 `Everyone` 兜底规则，那么任何不属于这些安全组的创作者在点击创建或运行 `ms app create` 时，都会因为无法命中路由条目而被直接拦截报错 [2][3]。

## #interactive-sandbox 03 / Interactive Diagnostic Sandbox :: 双环境错觉与 ALM 路径实时诊断沙盒 || Live Diagnostic Sandbox for Dual-Environment Illusion and ALM Paths

面对不同创建入口（新版体验应用磁贴、命令行与协同画布、开启路由的新版智能体、以及嵌入聊天界面的轻量构建器），资产的实际落盘位置与合规晋升命令各不相同 [2][4][5][6]。点击下方沙盒顶部的四个场景切换按钮，即可实时对比**界面表象**与**物理落盘平面**，并生成可直接复用的命令行脱困脚本：

:::sandbox { id: "cmr-alm-diagnostic-sandbox", canvas: false, script: "./alm-diagnostic-sandbox.js", style: "./alm-diagnostic-sandbox.css", title: "双环境错觉成因与企业级 ALM 晋升命令诊断台 || Dual-Environment Illusion & Enterprise ALM Command Diagnostic Workbench", desc: "切换四大高频构建场景，实时检视顶栏环境假象、后台真实落盘位置、双管理中心盘点路径及对应的 CLI 跨环境晋升脚本。 || Switch across four authoring scenarios to inspect the UI picker illusion, physical storage plane, admin inventory paths, and exact CLI promotion scripts." }
纯静态前端诊断沙盒：覆盖托管应用磁贴、命令行构建、新版智能体路由与聊天内嵌构建器四类场景。 || Pure static diagnostic sandbox covering App tiles, CLI creation, routed New Agents, and embedded Agent Builder scenarios.
:::

## #enterprise-alm-playbook 04 / Enterprise ALM Playbook :: 打破个人环境孤岛：双轨企业级 ALM 全链路实战 || Breaking the Personal Environment Silo: Dual-Track Enterprise ALM Playbook

要把落入个人环境的原型资产安全晋升至团队开发（`Dev`）、测试（`Test`）与生产（`Prod`）环境，首先必须区分资产属于**代码级托管应用**还是**声明式新版智能体** [5][6]。微软为这两类构建物分别提供了 `@microsoft/cmr-cli`（命令名为 `ms`）与 `Microsoft.Agents.Hosting.Cli`（命令名为 `msagent`）两套专用工具链 [5][6]。

:::diagram { src: "./media/managed-runtime-alm-pipeline", drawio: "./media/managed-runtime-alm-pipeline.drawio", title: "托管运行时应用与新版智能体企业级双轨 ALM 晋升流水线 || Dual-Track Enterprise ALM Promotion Pipeline for CMR Apps and New Agents" }
图 2：轨道 A（托管应用通过 `ms` 命令行与阶段覆盖文件晋升）与轨道 B（新版智能体通过 `msagent` 部署槽位与评测门禁晋升）的端到端交付架构，底层由双管理中心安全门禁统一护航 [3][5][6]。 || Figure 2: End-to-end delivery architecture combining Track A (`ms` CLI and stage overlays for managed apps) and Track B (`msagent` deployment slots and evaluation gates for new agents), governed by MAC and PPAC security controls [3][5][6].
:::

### 轨道 A：托管运行时应用 (`@microsoft/cmr-cli`) 跨环境晋升与配置解耦 || Track A: Managed Runtime App Promotion and Config Decoupling via `@microsoft/cmr-cli`

对于已经在个人环境中通过自然语言生成的应用，核心脱困思路是：**将源码从个人环境的平台代码仓克隆到本地或企业代码仓，然后在目标团队环境中显式传入 `--environment-id` 参数注册应用，并通过阶段配置文件（Stage Overlays）解耦跨环境连接与数据库表** [5]。

:::flow { title: "托管应用从个人环境晋升至生产环境的五步流水线 || Five-Step Promotion Pipeline from Personal Sandbox to Production" }
1. **克隆个人环境源码或直连企业代码仓 || Clone Personal Source or Bind GitHub Enterprise Cloud** — 运行 `ms app clone --app <app-id>` 将个人环境中的原型源码拉取至本地，或在创建时直接传入 `--repo <github-url>` 与 `--environment-id <dev-env-id>` 跳过个人环境 [5]。 || Run `ms app clone --app <app-id>` to extract prototype source from the personal environment, or pass `--repo <github-url>` and `--environment-id <dev-env-id>` during creation to bypass personal routing [5].
2. **编写多环境阶段覆盖配置 (`ms.<stage>.config.json`) || Author Multi-Stage Config Overlays (`ms.<stage>.config.json`)** — 保持基础 `ms.config.json` 稳定，新建 `ms.test.config.json` 与 `ms.prod.config.json` 覆盖目标环境的连接标识、环境变量与表名；数组按名称合并，设 `"$remove": true` 可剔除开发期调试项 [5]。 || Keep base `ms.config.json` intact and add `ms.test.config.json` and `ms.prod.config.json` to override connection IDs, variables, and table mappings per stage [5].
3. **为共享连接配置动作白名单 (`allowedActions`) || Enforce `allowedActions` Policy on Shared Connections** — 若使用管理员预建的共享连接（`sharedConnectionId`），必须在配置中显式绑定安全策略与动作白名单（如只读查询），否则服务端会在部署时拒绝执行该连接 [3][5]。 || Any `sharedConnectionId` must bind an explicit security policy with `allowedActions` ( disallowing arbitrary writes) or the runtime blocks execution [3][5].
4. **在无数据库托管环境通过平台接口授权服务主体 || Authorize CI/CD Service Principal via BAP API in Dataverse-Less Environments** — 不含数据库的托管环境无法通过传统数据库用户表赋权，需调用业务应用平台接口（BAP API）将企业应用对象标识（Enterprise App Object ID）授予环境管理员角色 [5]。 || For environments without Dataverse, grant `EnvironmentAdmin` via the BAP REST API using the service principal's Enterprise Application Object ID rather than the App Registration ID [5].
5. **开启外部制品开关并执行自动化打包发布 || Enable External Artifact Deployment and Run Pack/Deploy Actions** — 在目标测试与生产环境开启 `AllowExternalArtifactDeployment` 治理开关，随后由流水线执行 `ms app pack` 与 `ms app deploy` 完成零停机交付 [3][5]。 || Enable `AllowExternalArtifactDeployment` on target environments and invoke `ms app pack` followed by `ms app deploy` in GitHub Actions [3][5].
:::

下面给出生产级 `ms.config.json` 与阶段覆盖文件 `ms.prod.config.json` 的配置范式，展示如何安全解耦个人连接（User Connection）、共享连接（Shared Connection）与数据库表引用 [5]：

```json
// ms.config.json — 基础架构契约（提交至 Git 主干）
{
  "environmentId": "00000000-0000-0000-0000-000000000001",
  "VariableReferences": [
    { "name": "ApiBaseUrl", "value": "https://api-dev.contoso.internal" }
  ],
  "ConnectionReferences": [
    {
      "name": "office365Users",
      "connectorId": "/providers/Microsoft.PowerApps/apis/shared_office365users",
      "userConnectionId": "dev-user-conn-guid"
    },
    {
      "name": "auditSharePoint",
      "connectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
      "sharedConnectionId": "dev-shared-sp-conn-guid",
      "policy": {
        "allowedActions": ["GetItems", "CreateItem"]
      }
    }
  ],
  "DatabaseReferences": {
    "default.cds": {
      "databaseDetails": { "referenceType": "Environmental" },
      "dataSources": {
        " inspectionOrders": { "entitySetName": "contoso_inspectionorders", "logicalName": "contoso_inspectionorder" }
      }
    }
  }
}
```

```json
// ms.prod.config.json — 生产环境覆盖层（构建时按阶段自动合并）
{
  "environmentId": "00000000-0000-0000-0000-000000000099",
  "VariableReferences": [
    { "name": "ApiBaseUrl", "value": "https://api.contoso.com" }
  ],
  "ConnectionReferences": [
    {
      "name": "auditSharePoint",
      "sharedConnectionId": "prod-shared-sp-conn-guid",
      "policy": {
        "allowedActions": ["GetItems"]
      }
    }
  ]
}
```

### 轨道 B：新版智能体 (`msagent` CLI 与自定义解决方案) 跨环境晋升 || Track B: Promoting New Agents via `msagent` CLI and Custom Solutions

针对运行在新版编排框架（Microsoft Copilot Harness）上的智能体，自 2026 年 10 月起可直接使用基于 `.NET 10` 的 `Microsoft.Agents.Hosting.Cli`（`msagent`）将云端智能体克隆为本地声明式文件（含 `settings.mcs.yml`、工作流定义、知识源及评测集），实现代码级多环境发布 [6]：

```bash
# 1. 从源环境克隆智能体定义至本地工程（切勿把 .mcs/ 与 .config/agent.config.json 提交到 Git）
msagent agent create --agent-type MCSAgent \
  --mcs-clone-agent-id 8a2f0000-1111-2222-3333-444455556666 \
  --mcs-clone-environment-id <source-env-id> \
  --project ./EnterpriseSupportAgent

# 2. 显式注册测试与生产部署目标槽位（仅切换 msagent env select 不会改变已有智能体的绑定环境）
msagent deployment create --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name test-slot --deployment-type test --environment-id <test-env-id>
msagent deployment create --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name prod-slot --deployment-type prod --environment-id <prod-env-id>

# 3. 推送草稿至测试槽位、换绑目标环境连接并执行云端评测门禁
msagent agent deploy --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name test-slot
msagent deployment connection update --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name test-slot --connection-reference shared_sales_crm --connection-id <test-conn-id> --non-interactive
msagent agent eval run --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name test-slot

# 4. 评测通过后一键推送并正式发布至生产环境槽位
msagent agent deploy --project ./EnterpriseSupportAgent --agent-name "Support Agent" --deployment-name prod-slot --publish
```

若团队沿用经典的 Power Platform Pipelines 或解决方案打包流程，则必须遵循自定义非托管解决方案（Unmanaged Solution）边界 [4][8]。下表汇总了工程团队在跨环境迁移与日常治理中最常踩中的六个真实故障点及修复动作：

| 高频踩坑场景 || Common Pitfall Scenario | 根因剖析 || Root Cause Analysis | 权威修复与规避动作 || Verified Remediation Action |
|------|------|------|
| 运行 `msagent env select` 后执行部署，智能体依然发回了旧环境 || Agent still deploys to old environment after `msagent env select` | `.mcs/conn.json` 在克隆或创建时已静态锁定源环境标识，`env select` 仅影响新建命令 [6] || `.mcs/conn.json` locks the initial environment ID; `env select` only affects new creations [6] | 必须使用 `msagent deployment create --environment-id <target>` 显式注册目标环境槽位并按槽位名部署 [6] || Register explicit slots via `msagent deployment create --environment-id <target>` and deploy by slot name [6] |
| 为无数据库托管环境配置流水线服务主体时返回权限拒绝 || SPN role assignment fails on Dataverse-less managed environment | 传入了应用注册（App Registration）的客户端或对象标识，而非租户内的服务主体对象标识 [5] || Passed the App Registration Object ID instead of the tenant Service Principal Object ID [5] | 在 Entra ID 的“企业应用（Enterprise Applications）”叶片复制对象标识，调用 BAP 接口赋权 [5] || Copy the Object ID from Entra ID -> Enterprise Applications when calling the BAP role API [5] |
| 流水线执行 `ms app deploy` 报外部制品禁止部署错误 || `ms app deploy` fails with external artifact deployment blocked | 目标环境默认关闭了外部构建包直传开关，仅允许从绑定的平台代码仓构建 [3][5] || Target environments block external bundle uploads by default unless explicitly permitted [3][5] | 管理员在目标环境配置中将 `AllowExternalArtifactDeployment` 设为 `true` 后重新触发流水线 [3][5] || Enable `AllowExternalArtifactDeployment` on the target environment before running CI/CD deploy [3][5] |
| 员工离职后，团队无法拉取或更新其个人环境中的托管应用源码 || Team cannot pull or update app code after the original maker leaves | 平台托管代码仓（`repoType: native`）的读写权限严格绑定应用所有者列表 [3][5] || Native Git repository access is strictly coupled to the app's registered owner list [3][5] | 管理员执行 `ms admin add owner new@contoso.com --app <id>` 移交所有权并移除离职人员 [3][5] || Run `ms admin add owner new@contoso.com --app <id>` and remove the former owner via `ms admin` [3][5] |
| 导出包含智能体的解决方案到测试环境后，子组件或知识源丢失 || Exported agent solution misses subcomponents or knowledge in Test | 直接在默认解决方案（Default Solution）散装修改，导出时未执行“添加必需对象” [4][8] || Authored inside Default Solution without running Add required objects prior to export [4][8] | 始终在自定义非托管解决方案中构建，导出前右键智能体执行 `Add required objects` [4][8] || Build inside a custom unmanaged solution and run `Add required objects` on the agent before export [4][8] |
| 开启单智能体月度额度上限后，关联的智能体流仍在后台持续扣费 || Agent flows keep consuming capacity after single-agent cap triggers | 单智能体配额仅阻断智能体主对话（满 125% 立即中断进行中会话），不拦截智能体流 [1][4] || Single-agent caps halt agent conversations at 125% usage but do not stop invoked Agent Flows [1][4] | 为智能体流单独规划环境级容量池，并在 Microsoft Purview（审计记录类型 `519`）配置用量告警 [1][3] || Budget Agent Flow capacity separately at the environment level and monitor Purview RecordType `519` [1][3] |

:::callout { title: "企业级身份与审计底线 || Enterprise Identity and Audit Baseline" }
所有新建智能体均在全局蓝图（`25664c89-cea5-4ab6-b924-a54fd8a19ae0`）下强制自动分配独立的 Microsoft Entra Agent ID 且不支持环境级关闭；同时托管运行时的应用生命周期事件统一写入 Microsoft Purview 审计日志（`RecordType = 519`），架构师应将这两项标识纳入生产上线前的安全门禁核验清单 [3][4]。 || Every new agent automatically receives a mandatory Microsoft Entra Agent ID under global blueprint `25664c89-cea5-4ab6-b924-a54fd8a19ae0` with no opt-out, while Managed Runtime lifecycle events log to Microsoft Purview under `RecordType = 519` [3][4].
:::

## #references 05 / References :: 权威参考信源列表 || Authoritative References

- [1] Microsoft Learn & Licensing Guides (Nov 2026) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio | Microsoft Copilot Studio 产品概览、三种编排框架对比与 2026 年 11 月版官方许可及额度指南（含托管运行时 0.1 Credit/API 调用费率） || Copilot Studio overview, harness comparison, and November 2026 Licensing & Credits Guides (including 0.1 Credit/API call rate)
- [2] Microsoft Learn: Build Apps in Copilot Studio (Preview) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/apps-experience/apps-overview | 新版体验应用构建概览、个人环境强制路由规则、登录令牌（PDL / 2-letter Country）构建期数据驻留解析及 15 分钟管理中心同步说明 || Apps in Copilot Studio overview, mandatory personal environment routing, token-based build data residency, and 15-minute MAC sync
- [3] Microsoft Learn: Copilot Managed Runtime Overview & Governance — https://learn.microsoft.com/en-us/power-platform/admin/copilot-managed-runtime-overview | 托管运行时架构白皮书、默认环境组 19 个一等连接器白名单、内容安全策略沙盒、Purview 审计记录类型 519 与外部制品部署开关 || Copilot Managed Runtime architecture, default environment group 19 allowed connectors, CSP sandboxing, Purview RecordType 519, and external artifact controls
- [4] Microsoft Learn: Copilot Studio Environment Routing & ALM Solutions — https://learn.microsoft.com/en-us/power-platform/admin/default-environment-routing | 默认环境路由机制、个人环境自动注入 Dataverse 后的 60 天禁用与 15 天删除休眠清理规则、以及自定义解决方案导出规范 || Default environment routing, 60-day disable + 15-day delete Dataverse inactivity cleanup in personal environments, and custom solution ALM rules
- [5] Microsoft Learn & GitHub: @microsoft/cmr-cli (`ms`) & CI/CD Actions — https://github.com/microsoft/ms-app-deploy | 托管运行时命令行工具参考、平台原生代码仓克隆、阶段覆盖配置（`ms.<stage>.config.json`）、共享连接动作策略及无数据库环境 BAP API 服务主体授权 || `@microsoft/cmr-cli` reference, native repo cloning, stage overlays, shared connection `allowedActions` policies, and BAP API SPN role assignment
- [6] Microsoft Learn: Manage New Agents with `msagent` CLI — https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/cli-overview | 基于 `Microsoft.Agents.Hosting.Cli` 的新版智能体本地 YAML 克隆、多环境部署槽位（`deployment create`）、连接引用换绑与云端评测发布流水线 || Managing Microsoft Copilot Harness agents with `msagent` CLI, local YAML cloning, multi-stage deployment slots, connection binding, and cloud evaluation
- [7] Microsoft Learn: Power Apps Code Apps Architecture — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview | 传统 Power Apps 代码应用（基于 `pac code` 与托管数据库解决方案分发）与 Copilot Managed Runtime 应用的架构对比参考 || Power Apps Code Apps (`pac code` and Dataverse solution distribution) compared against Copilot Managed Runtime apps
- [8] Microsoft Power Platform Community & ALM Guidance — https://learn.microsoft.com/en-us/microsoft-copilot-studio/alm-Export-import-bots | 社区与官方关于智能体跨环境迁移缺失子组件、连接引用重绑、环境变量替换及 Entra Agent ID 蓝图治理的最佳实践汇总 || Official and community guidance on missing subcomponents during export, connection reference rebinding, environment variables, and Entra Agent ID governance

---
title: 专业开发者的托管应用新路径
eyebrow: Power Apps Code App
brand: Power Platform
date: 2026-09-03
strict_i18n: false
strict_density: true
lead: 用 React、TypeScript、Vite 等主流 Web 技术构建应用，在 Power Platform 上托管运行，获得 Entra 认证、1,500+ 连接器和企业治理能力。
hero_actions:
  - "开发流程 | #dev-workflow"
  - "能力对比 | #comparison"
panel_label: Code App 核心价值
panel_title: Code-First + Managed Platform
panel:
  - 自由选择前端框架（React / Vue / 任意 SPA）
  - JavaScript 直接调用 1,500+ Power Platform 连接器
  - Entra 认证 + DLP + Conditional Access 开箱即用
  - npm run build + npx power-apps push 发布到 Power Platform 环境
metrics:
  - "连接器数量 | 1,500+ | Power Platform 连接器可从 JS 直接调用"
  - "发布状态 | GA | 2026 年已正式发布（Generally Available）"
  - "技术栈 | React / Vue / Vite | 支持任意 SPA 框架 + TypeScript"
  - "许可要求 | Premium | 终端用户需 Power Apps Premium 许可"
style:
  accent: "#7c3aed"
---

## #positioning 01 / Positioning :: Code App 填补了 Canvas App 与纯自研 Web App 之间的空白

理解 Code App 的定位后，你能判断它在你的项目场景中是否是正确选择。

:::insight-grid { cols: 3 }
::card 01
### 什么是 Code App
Code App 是 Power Apps 的第三种应用类型。开发者在本地 IDE（如 VS Code）中用标准 Web 技术（HTML/TypeScript/React/Vue）编写 SPA 应用，通过 Power Apps Client Library（`@microsoft/power-apps` npm 包）接入 Power Platform 连接器和数据源，最终发布并托管在 Power Platform 环境中。

::card 02
### 解决什么问题
Canvas App 对复杂 UI 和自定义逻辑的表达能力有限；纯自研 Web App 需要自建认证、API 网关、部署管线。Code App 让专业开发者在保留完整代码控制力的同时，免费获得平台的认证、授权、DLP、连接器和 ALM 能力。

::card 03
### 适用场景
需要自定义 UI 组件库（如 Fluent UI v9）的 LOB 应用；需要精细控制前端状态管理和路由的复杂表单；现有 React/Vue 项目需要接入 Power Platform 数据生态但不想重写为 Canvas App。
:::

## #architecture 02 / Architecture :: 三层运行时架构：代码、Client Library、Host

上一节定义了 Code App 的定位，本节拆解其运行时组成，帮你理解开发和运行时各层的职责。

Your Code (React / Vue / Custom SPA)

你的前端代码，完全控制 UI 和逻辑

@microsoft/power-apps Client Library

暴露连接器 API，生成 TypeScript 模型和服务文件

Power Apps Host

Entra 认证、应用加载、错误处理、托管运行

:::accordion
::panel
### 开发时组件详解
开发阶段涉及三个关键文件/工具的协作。

::panel
### 运行时工作原理
应用发布后运行时的三层职责分工。

**Your Code**

你的 SPA 代码在浏览器中运行，通过 Client Library 暴露的 API 发起数据请求。你完全控制 UI 渲染、路由、状态管理。

**Client Library**

负责将你的 API 调用转换为 Power Platform 连接器请求，管理连接模型和服务的生命周期。连接的增删会自动更新生成的 TypeScript 文件。

**Power Apps Host**

管理终端用户的 Entra 认证、应用加载流程、连接器权限同意弹窗。如果应用加载失败，Host 向用户展示上下文错误信息。
:::

## #comparison 03 / Comparison :: Code App vs Canvas App vs Model-driven App

上一节解析了 Code App 的架构，本节通过维度对比帮你判断哪种应用类型适合你的项目。

| 维度 | Code App | Canvas App | Model-driven App |
| --- | --- | --- | --- |
| 开发方式 | IDE + 代码（React/Vue/TypeScript） | Power Apps Studio 拖拽 + Power Fx | 表驱动配置 + 少量定制 |
| UI 控制力 | 完全自定义（任意 CSS/组件库） | 内置控件，可用 PCF 扩展 | 标准表单/视图，布局有限 |
| 数据源 | 1,500+ 连接器 + 自定义 API | 1,500+ 连接器 | 以 Dataverse 为核心 |
| 开发者技能 | Web 前端工程师 | Citizen Developer / 业务分析师 | Power Platform 管理员 / 配置人员 |
| 源码管理 | 标准 Git 工作流 | YAML 源码格式 + Git 集成 | Solution 导出 / Git 集成 |
| 本地开发 | npm run dev 本地预览 | 仅 Studio 内预览 | 仅 Studio 内预览 |
| 许可 | Power Apps Premium | Premium 或 Developer（按连接器） | Premium 或 Dynamics 365 |
| 移动端 | 浏览器访问（含手机浏览器） | Power Apps 移动 App | Power Apps 移动 App |

:::accordion
::panel
### 选型决策指南
根据项目特征选择应用类型的三条规则。
:::

## #dev-workflow 04 / Development Workflow :: 从零到上线：可照抄执行的 Code App 开发指南

上一节帮你做了选型判断，本节给出从环境准备到发布的完整命令序列。每一步都标注确切命令、关键参数、预期产物和验证方式，照做即可跑通，无需额外检索。

:::flow
1. **Step 1: 准备前置条件** — 开始前确认四项就绪：**Node.js LTS**（22.x 或 20.x，避免 23.x，详见 §限制与陷阱）、**Git**、**已启用 Code Apps 的 Power Platform 环境**（由环境管理员在 PPAC → 环境 → 设置 → 产品 → 功能中打开 Power Apps code apps 开关）、以及终端用户的 **Power Apps Premium 许可**。用下面命令核对本机工具版本。；node -v # 期望输出 v22.x.x 或 v20.x.x（不要用 v23+） git --version # 期望输出 git version 2.x
2. **Step 2: 用官方模板创建项目** — 用 `degit` 拉取官方模板脚手架并进入目录。推荐 `starter` 模板（预配置 React + Vite + Tailwind CSS + Tanstack Query + React Router，覆盖大多数业务应用）；若想自定义技术栈，把 `starter` 换成更精简的 `vite` 模板。**预期产物：**一个含 `package.json`、`vite.config.ts`、`src/` 的项目目录。；npx degit github:microsoft/PowerAppsCodeApps/templates/starter my-app cd my-app
3. **Step 3: 安装依赖** — 安装项目依赖。模板的 `package.json` 已包含 `@microsoft/power-apps`（Client Library + 内置 npm CLI）和 `@microsoft/power-apps-vite` 插件，安装后即可用 `npx power-apps` 调用 CLI，无需全局安装。**验证：**`npx power-apps --help` 能列出命令即成功。；npm install npx power-apps --help # 应列出 init / run / push / add-data-source 等命令
4. **Step 4: 获取目标环境 ID** — 初始化需要环境 ID（一个 GUID）。两种获取方式任选其一：在 **make.powerapps.com → 右上角设置齿轮 → 会话详细信息（Session details）** 中复制 Environment ID；或先用 PAC CLI 认证后列出环境。**预期产物：**一个形如 `Default-xxxxxxxx-...` 或 GUID 的环境标识。21Vianet 环境需参考下方「21Vianet / Mooncake 实测验证」：npm CLI 接受的是去掉连字符后的 compact environment ID。；# 方式 B：用 PAC CLI 登录并列出环境，从输出中复制 Environment ID pac auth create pac env list
5. **Step 5: 初始化 Code App** — 把普通 Vite 项目转为 Code App。`--display-name` 是应用在 Power Platform 中的显示名，`--environment-id` 填 Step 4 拿到的环境标识。首次运行会弹出登录，用你的 Power Platform 账号完成认证。**预期产物：**生成 `power.config.json`（记录环境与连接器配置），并在 `vite.config.ts` 注册 `powerApps()` 插件。省略参数则进入交互式问答。；npx power-apps init --display-name "My Code App" --environment-id <env-id> # 或交互式：npx power-apps init
6. **Step 6: 本地开发与调试** — 启动本地开发服务器，在终端输出里找到标记为 **Local Play** 的 URL 并打开。**关键要求：**必须用与 Power Platform 租户相同的浏览器配置文件打开，否则连接器调用会因身份不匹配失败。自 2025 年 12 月起 Chrome / Edge 默认拦截公共源对本地端点的访问，首次访问需在浏览器授予本地网络访问权限。**验证：**页面正常加载且能拉到连接器数据即成功。；npm run dev # 打开终端中 Local Play 标记的 URL（同一浏览器 profile）
7. **Step 7: 接入数据源（按需）** — 需要读写 Power Platform 数据时，用 CLI 把连接绑定到项目，它会在 `src/generated/` 自动生成类型安全的 Model / Service 文件供直接 import。下面是最简的非表格数据源示例；表格数据源（SQL / SharePoint / Dataverse）的完整参数见 §05 与 §06。；npx power-apps add-data-source --api-id <apiName> --connection-id <connectionId> # 表格 / Dataverse 数据源参数详见 §05、§06
8. **Step 8: 构建与发布** — 先 `npm run build`（等价于 `tsc -b && vite build`，产物写入 `dist/`），再 `npx power-apps push` 发布。**push 不会自动触发 build**——跳过 build 直接 push 会上传旧的 `dist/`。命令成功后返回可访问的 Power Apps URL，可在 make.powerapps.com 查看、共享和运行。`pac code push` 仅作兼容路径保留。；npm run build && npx power-apps push # 用 && 串联，确保 build 成功才 push
:::

:::accordion
::panel
### PAC CLI 与 npm CLI 的边界
这两个 CLI 不是同一层级的工具：PAC CLI 面向 Power Platform 平台管理，npm CLI 面向 Code App 项目开发。

**PAC CLI：平台通用工具**

`pac` 覆盖认证、环境、Solution、Dataverse、PCF、ALM 等平台级操作。`pac code` 是其中一个子命令组，适合保留为兼容路径或用于 npm CLI 尚未覆盖的管理场景。

**npm CLI：Code App 专用工具**

`npx power-apps` 随 `@microsoft/power-apps` 项目依赖提供，减少全局前置依赖，并优先承载 Code App 的新能力。官方文档已说明它会替代未来弃用的 `pac code` 命令。

> **推荐规则：**
> **推荐规则：**Code App 项目内的初始化、运行、发布、数据源、Flow、Dataverse Action / Function 和 schema 刷新优先使用 `npx power-apps`；离开 Code App 项目边界、进入租户认证、环境选择、Solution / ALM 或其他 Power Platform 管理任务时使用 `pac`。

::panel
### 全流程命令速查（可整段复制）
把上面 8 步串成一份端到端序列，新项目可整段复制后按需替换 `my-app` 与 `<env-id>`。

# 1. 创建项目 npx degit github:microsoft/PowerAppsCodeApps/templates/starter my-app cd my-app # 2. 安装依赖 npm install # 3. 登录并获取环境 ID（也可在 make.powerapps.com 会话详细信息中查） pac auth create pac env list # 4. 初始化为 Code App（首次会弹出登录） npx power-apps init --display-name "My Code App" --environment-id <env-id> # 5. 本地开发（打开 Local Play URL，同一浏览器 profile） npm run dev # 6. 构建并发布 npm run build && npx power-apps push

::panel
### 21Vianet / Mooncake 实测验证
2026-06-11 在 Power Apps operated by 21Vianet 环境中验证：Code App npm CLI 可连接 21V 环境、初始化 Code App，并可通过 Dataverse 表数据源生成 TypeScript Model / Service。验证使用 `@microsoft/power-apps` v1.1.9（内含 `@microsoft/power-apps-cli` v0.11.6）。

> **认证缓存注意：**
> **认证缓存注意：**若 macOS 上的 npm CLI 同时读到多个账号并报 `Multiple accounts found`，`npx power-apps logout` 可能只清理文件缓存，未清掉 Keychain 中的 MSAL 持久缓存。可只删除 Code Apps CLI 专用的 Keychain 项（service/account 均为 `power-apps`）后重新登录，避免误用公有云账号访问 21V 环境。

> **21V push 元数据注意：**
> **21V push 元数据注意：**当前 npm CLI 的 endpoint 路由需要 compact environment ID，但 create-app 请求体中的 environment metadata 在 21V 中会按带连字符的 Environment ID 校验。若 push 阶段出现 `EnvironmentNotFound`，而 `list-codeapps` 和 `add-data-source` 已能访问同一环境，应检查 CLI 是否把 compact ID 原样写入 app metadata。实测将 metadata 中的 `environment.name` / `environment.id` 改为带连字符 GUID 后，错误从 `EnvironmentNotFound` 变为环境功能开关层面的 `CodeAppOperationNotAllowedInEnvironment`。这表明 21V push 链路还存在环境 ID 表示不一致的问题，建议在产品修复前记录该现象并通过官方支持渠道确认。

::panel
### PAC Code 兼容路径
`pac code` 仍可运行现有流程，但不应被理解为 Code App 的长期推荐入口。

pac code init --displayname "My Code App" npm run dev # 本地开发 npm run build && pac code push # 兼容发布路径

npm CLI 覆盖 Code App 日常命令并补齐多项 `pac code` 没有或不稳定的能力。主要命令包括：`init`（初始化）、`run`（本地开发）、`push`（发布）、`add-data-source`（添加数据源）、`delete-data-source`（删除数据源）、`refresh-data-source`（刷新数据源）、`list-datasets`/`list-tables`/`list-connections`（发现元数据）、`add-flow`/`remove-flow`/`list-flows`（集成 Power Automate 流）、`find-dataverse-api`/`add-dataverse-api`（Dataverse Action/Function）。

**实测经验：**PAC CLI（dotnet tool）的 `pac code add-data-source` 命令在 v1.52.1 中对 Dataverse 连接器报 `Invalid URI format` 错误，`list-datasets`/`list-tables` 也报 `Cannot read properties of undefined`。相同操作在 npm CLI 中正常完成。推荐优先使用 npm CLI。

::panel
### 官方模板与示例项目
GitHub 仓库 microsoft/PowerAppsCodeApps 提供模板和示例。

**starter 模板**

推荐。预配置 React + Vite + Tailwind CSS + Tanstack Query + React Router，适合大多数业务应用。

**vite 模板**

最小化 Vite + React 配置，适合希望完全自定义技术栈的团队。

**HelloWorld 示例**

React + Vite + TypeScript。展示 Power Platform SDK 基础集成，推荐作为第一个阅读的示例。

**FluentSample 示例**

React + Fluent UI v9 + SQL + Office 365。完整示例，含连接器、自定义 API、SQL 后端和 CI/CD 配置。
:::

## #data-connection 05 / Data Connection :: 通过连接器接入 1,500+ 数据源

上一节跑通了开发流程，本节解决核心问题：如何把 Code App 连接到业务数据。

:::flow
1. **Step 1: 创建连接并取得 API Name 与 Connection ID** — 打开 **make.powerapps.com → 左侧导航 Connections → + New connection**，选择目标连接器（如 Office 365 Users、SQL Server、SharePoint）并创建；已有连接可直接复用。随后取两项元数据：**API Name**（形如 `shared_office365users`，添加数据源时作为 `-a`）和 **Connection ID**（形如 `aaaaaaaa000011112222bbbbbbbbbbbb`，作为 `-c`）。两种获取方式任选其一——用 `pac connection list` 列出全部连接的 ID 与 API Name，或在门户点开某个连接、从浏览器地址栏 URL 中读取。；# 列出当前环境所有连接的 Connection ID 与 API Name pac connection list
2. **Step 2: 用 CLI 把连接绑定为数据源** — **非表格数据源**（Office 365 Users、Graph 等）只需 `-a` 和 `-c`；**表格数据源**（SQL、SharePoint）还需 `-t`（表 / 列表名）和 `-d`（数据集 / 站点）。不确定表名时先用 `list-datasets` / `list-tables` 发现，再原样复制（**名称区分大小写**）。Dataverse 表有更简语法，见 §06。**预期产物：**`src/generated/` 下生成对应 Model 与 Service 文件，并更新 `power.config.json`。；# 非表格：Office 365 Users npx power-apps add-data-source -a "shared_office365users" -c "<connectionId>" # 表格：SQL（-t 表名，-d 服务器,数据库） npx power-apps add-data-source -a "shared_sql" -c "<connectionId>" \ -t "[dbo].[MobileDeviceInventory]" -d "myserver.database.windows.net,mydb" # 表格：SharePoint（-t 列表名，-d 站点 URL） npx power-apps add-data-source -a "shared_sharepointonline" -c "<connectionId>" \ -t "Travel%20Request" -d "https://contoso.sharepoint.com/sites/TravelPolicies" # 不确定表名时先发现（PAC CLI） pac code list-datasets -a "shared_sql" -c "<connectionId>" pac code list-tables -a "shared_sql" -c "<connectionId>" -d "<datasetName>"
3. **Step 3: 在代码中调用生成的 Service 并验证** — 直接 `import` 生成的 Service / Model 调用，全程类型安全，无需手写 HTTP。非表格连接器暴露其 API 方法（如 `MyProfile()`）；表格连接器暴露统一 CRUD（`create / get / getAll / update / delete`）。**验证：**`npm run dev` 本地运行，页面能拉到真实数据即成功；再 `npm run build && npx power-apps push` 发布。；// 非表格：Office 365 Users import { Office365UsersService } from './generated/services/Office365UsersService'; const profile = (await Office365UsersService.MyProfile()).data; // 表格：SQL / SharePoint 表统一 CRUD import { MobileDeviceInventoryService } from './generated/services/MobileDeviceInventoryService'; const rows = await MobileDeviceInventoryService.getAll(); await MobileDeviceInventoryService.create(record); await MobileDeviceInventoryService.update(id, changedFields); await MobileDeviceInventoryService.delete(id);
:::

:::accordion
::panel
### 支持的数据源类型
Code App 支持 Power Platform 上的绝大部分连接器，但有少量例外。

- **非表格连接器** — Office 365 Users、Microsoft Graph、自定义连接器等。通过 `--api-id`（`-a`）和 `--connection-id`（`-c`）参数添加。生成的 Service 文件提供对应 API 的方法调用。
- **表格连接器** — SQL Server、SharePoint Lists 等。生成 CRUD 方法（create / get / getAll / update / delete）。支持 SQL 存储过程。
- **Dataverse** — 专用集成，既支持表格 CRUD（通过 `add-data-source`），也支持 Dataverse Action 和 Function（通过 `add-dataverse-api`）。Dataverse 表的简化用法见 §06。
- **不支持的连接器** — Excel Online (Business) 和 Excel Online (OneDrive) 目前不受支持。连接创建目前只能在 make.powerapps.com 完成，CLI 端暂不支持新建连接。

::panel
### 连接引用（Connection Reference）与 ALM
在 Dev / Test / Prod 多环境场景中，应使用连接引用而非直接绑定用户连接。
:::

## #dataverse 06 / Dataverse :: 对接 Dataverse 的标准做法：连接器接入 + Schema 同步闭环

上一节覆盖了通用连接器接入，本节聚焦 Code App 对接 Dataverse 的推荐路径，以及 Dataverse 数据模型（表 / 列 / 关系）的标准变更流程，并说明 schema 变更后如何与生成的 TypeScript 类型保持一致。

:::comparison
::versus 方案 1 || Option 1
### 记录级 CRUD → 表格数据源
对 Dataverse 表做增删改查，走 Microsoft Dataverse 连接器作为**表格数据源**（tabular data source）。`pac code add-data-source` 生成类型安全的 CRUD Service／Model，调用方式与 SQL、SharePoint 表一致。

::versus 方案 2 || Option 2
### 业务操作 → Action / Function
需要事务性写入、系统消息或自定义业务逻辑时，调用 Dataverse Action（写）和 Function（读）。这是另一条专用通道，详见下一节「集成专题 · Dataverse Action / Function」。
:::

:::accordion
::panel
### 推荐路径：把 Dataverse 表接成表格数据源
Dataverse 表的接入有两条路径：PAC CLI 需要 4 个参数逐级发现（连接 → 数据集 → 表），npm CLI 则提供了简化语法——只需表的 logical name 和 org URL，无需 Connection ID。实测 PAC CLI v1.52.1 对 Dataverse 连接器存在 bug（`Invalid URI format`），npm CLI 无此问题，推荐后者。

**路径 A：npm CLI（推荐）**

**路径 B：PAC CLI（备选）**

> **三文件同步纪律：**
> **三文件同步纪律：**每次 `add-data-source` 必须确认三个位置同时更新：(1) `power.config.json` 的 `databaseReferences.default.cds.dataSources`、(2) `.power/schemas/dataverse/*.Schema.json`、(3) `dataSourcesInfo.ts` 的 primaryKey。三者缺一则运行时 500 错误。`.power/schemas/` 目录下的文件由 CLI 自动生成，**不应手动编辑**——手改 `dataSourcesInfo.ts` 的 primaryKey 会导致与 Schema.json 不同步并引发 500 错误。npm CLI 自动保证三文件同步；手动操作时务必逐一核对。[[4]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)

::panel
### Schema 变更 SOP（一）：前置权限与可用操作
更新 Dataverse 数据模型前，先确认权限，再明确 schema 层面有哪些可执行的操作。

**前置权限**

**可用 schema 操作（make.powerapps.com → Tables → Schema）**

- **Tables 表** — 建表方式：从空白、从 Copilot 自然语言生成、从 Excel/CSV、从 SharePoint 列表导入、创建虚拟表。类型：Standard / Activity / Virtual / Elastic。所有权：User & Team 或 Organization（Activity 表只能 User/Team 所有）。
- **Columns 列** — 新增/编辑列，选择数据类型与格式（见下一条手风琴的完整类型清单）。主列（Primary column）在保存后显示名与描述不可改。
- **Relationships 关系** — 建立 1:N（一对多）和 N:N（多对多）关系。添加 Lookup 列即自动创建一条 N:1 关系。可配置级联行为（cascade behavior）。
- **Keys 备用键** — 定义 Alternate Keys，用一个或多个列的组合作为唯一引用，支持外部系统按业务键 Upsert 记录。

> **可视化设计器限制：**
> **可视化设计器限制：**data workspace 画布暂不支持 Rich text、Customer、Autonumber、Formula 列，也不支持新建 N:N 关系（需在表的 Relationships 区单独创建）。[[14]](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entities)

::panel
### Schema 变更 SOP（二）：列数据类型清单
建列时可选的数据类型（括号内为 API 的 `AttributeTypeDisplayName`），按用途分组。

| 分组 | 数据类型 | 说明 |
| --- | --- | --- |
| 文本 | Text / Text Area / Multiline Text（StringType / MemoType） | 单行最大 4000 字符；多行最大 1,048,576 字符。含 Email / Phone / URL / Ticker Symbol 等格式。 |
| 数字 | Whole Number / Decimal / Floating Point / Big（IntegerType / DecimalType / DoubleType / BigIntType） | 需精确计算用 Decimal；需范围比较用 Float；超大整数用 Big。 |
| 货币 | Currency（MoneyType） | 首次添加会自动附带 Currency 与 Exchange Rate 列，并为每个货币列生成 `_Base` 基准列。 |
| 选择 | Choice / Choices（PicklistType / MultiSelectPicklistType） | 单选用 Choice，多选用 Choices；可引用组织级 global choices。 |
| 日期 | Date and Time / Date Only / Duration / Timezone / Language | Duration、Timezone、Language 底层为 IntegerType。 |
| 关系 | Lookup / Customer / Owner（LookupType / CustomerType / OwnerType） | 新增 Lookup 即创建 N:1 关系；Customer 可指向 account 或 contact。 |
| 二进制 | File / Image（FileType / ImageType） | 独立于关系库存储；每表一个主图像列；File 默认上限 32MB，最大可设 131MB。 |
| 计算 / AI | Formula（Power Fx）/ Autonumber / Prompt | Formula、Image、File 不支持业务流程流、业务规则、图表、Rollup、计算列。 |
| 系统列 | Status / Status Reason / Owner / Unique Identifier / Time Stamp / Customer | 系统维护，设计器中不能直接新增（部分可在 solution explorer 添加）。 |

> **检索/排序注意：**
> **检索/排序注意：**Formula、Image、PartyList 多值 Lookup 不可搜索；Choices、Customer、File、Formula、Image 不可排序。[[15]](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/types-of-fields)

::panel
### Schema 变更 SOP（三）：关系类型与级联行为
Dataverse 底层只有两种关系：1:N 和 N:N（N:1 只是 1:N 从子表视角的呈现）。建关系时需配置级联行为以保证数据完整性。

**1:N（一对多）**

主表一行关联子表多行，通过子表上的 Lookup 列实现。一对父子表通常只能有一条「父子（parental）关系」，决定 Assign/Share/Delete 等动作是否级联。

**N:N（多对多）**

依赖一张中间表（Intersect/Relationship 表）建立对等关系。需在表的 Relationships 区创建，可视化画布不支持。

**级联行为（Behaviors）× 触发动作（Actions）**

| 触发动作 | 可选级联行为 |
| --- | --- |
| Assign 重新分配 | Cascade All / Active / User-owned / None |
| Reparent 改父 | Cascade All / Active / User-owned / None |
| Share / Unshare 共享 | Cascade All / Active / User-owned / None |
| Delete 删除 | Cascade All / Remove Link / Restrict |
| Merge 合并 | Cascade All / None |

> **限制：**
> **限制：**自定义表不能作为级联关系中相对系统表的主表；同一相关表不能同时成为多条 Cascade All/Active/User-owned 关系的子表（防止多父）。把级联从 Reparent/Share 改为 Cascade None 时，系统会跑「继承访问权清理」作业回收因继承而获得的权限。[[16]](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entity-relationships)

::panel
### Schema 变更 SOP（四）：与 Code App 类型文件的同步闭环
这一步把 Dataverse schema 变更和 Code App 工作流连成闭环——也是最容易被忽略的纪律点。

> **程序化改 schema（超出 Code App 范围）：**
> **程序化改 schema（超出 Code App 范围）：**若需在管线中自动化创建表/列，可走 Dataverse Web API / Organization Service 的 metadata 操作（如 `CreateEntityRequest`、`CreateAttributeRequest`）。但 Code App 本身是浏览器端 SPA，不直接执行 metadata 写操作；schema 由 maker portal 或后端管线维护，Code App 侧只负责删除并重新生成类型文件。[[14]](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entities)

::panel
### 数据层接入实战（Dataverse SDK 适配）
以下经验来自实际项目（React + Vite + Dataverse Code App），是官方文档未充分说明、但接入 Dataverse 时几乎必然踩到的细节。每条按「问题 → 根因 → 解决方案」组织。

手动迁移项目必须补 @microsoft/power-apps-vite 插件

问题

把一个已有的 Vite 项目手动改造成 Code App 后，本地能跑，push 到平台却无法加载、或数据 SDK 调用全部失效。

根因

Code App 依赖 `@microsoft/power-apps-vite` 在构建期注入平台运行时与数据通道。`pac code init` / `npx power-apps init` 脚手架会自动配置，手动迁移的项目缺这一步。

解决方案

在 `vite.config.ts` 中 `import { powerApps } from '@microsoft/power-apps-vite'`，并把 `powerApps()` 加入 `plugins` 数组。

理解 power.config.json 的三级结构

问题

想手动登记或排查一个数据源，却找不到该写在配置文件的哪一层，误以为有一个顶层 `dataSources` 键。

根因

Dataverse 表与非 Dataverse 连接器注册在两个不同位置，配置结构是三级嵌套，没有扁平的顶层数据源清单。

解决方案

Dataverse 表注册在 `databaseReferences.default.cds.dataSources` 下，每个 key 是 entitySetName（如 `accounts`、`contacts`、`crf5c_opportunity1s`）；非 Dataverse 连接器（Flow、Copilot Studio 等）注册在顶层 `connectionReferences` 下。

生成的 Model 使用 Dataverse 原生列名

问题

按业务友好名（Email、Phone、Address）读字段，结果全是 `undefined`；读选项集拿到的是数字而非标签。

根因

CLI 生成的 Model 字段名是 Dataverse API 列名，不是显示名；Lookup 以 `_xxx_value` 暴露；Choice 返回整数码，SDK 不投影标签。

解决方案

用真实列名读取：`emailaddress1`（非 Email）、`telephone1`（非 Phone）、`address1_composite`（非 Address）；Lookup 用 `_parentcustomerid_value` / `_ownerid_value`；Choice（如 `industrycode` 返回 `1`）需手动映射成标签。

Service 表名必须与 dataSourcesInfo 的 key 一致

问题

手写数据访问代码后，查询返回空数据或抛运行时错误，但表里确实有数据。

根因

生成的 Service 通过 `getClient(dataSourcesInfo)` 获取 client，其 key 就是 `power.config.json` 里 `databaseReferences.default.cds.dataSources` 的 key（即 entitySetName）。传入友好名（如 `'Account'`）而非 entitySetName（如 `'accounts'`）会让 SDK 查找失败。

解决方案

所有数据访问一律用 entitySetName 作表名；优先直接调用 CLI 生成的 Service，不要手拼表名字符串。

推荐架构：生成 Service + 手写 Adapter

问题

业务代码直接调用生成的 Service，散落着 `emailaddress1` 这类原生列名，且 Model 携带数百个系统列，难读难维护。

根因

生成的 Service 面向 Dataverse 物理模型，不面向业务；让它直接渗透进业务层会把数据库的命名怪异扩散到全应用。

解决方案

在 `src/generated/services/` 放一层手写 adapter，负责：(1) 物理列名 → 业务友好名（`emailaddress1 → email`）；(2) 只暴露业务需要的字段子集；(3) 封装多表聚合（如 Activity 同时查 appointment + phonecall + email）。业务代码只调 adapter，生成的 Service 仅被 adapter 引用。// adapter 示例：account-service.ts import { AccountsService } from './AccountsService'; // CLI 生成 const FIELD_MAP = { id: 'accountid', email: 'emailaddress1', phone: 'telephone1' }; function fromDv(dv) { return { id: dv.accountid, email: dv.emailaddress1, phone: dv.telephone1 }; } export async function getAll() { const result = await AccountsService.getAll({ select: Object.values(FIELD_MAP) }); return result.data.map(fromDv); }

不要手动编辑 .power/schemas/ 下的生成文件

问题

改了 `dataSourcesInfo.ts` 的 primaryKey 后，App 启动直接报平台 500，即使 push 显示成功。

根因

`.power/schemas/dataverse/*.Schema.json` 与 `dataSourcesInfo.ts` 由 CLI 生成并互相约束，手改一处会与另一处不同步。

解决方案

始终通过 `npx power-apps delete-data-source` + `add-data-source`（或 `refresh-data-source`）重新生成，绝不手改生成文件。

创建记录后拿不到主键（204 无响应体）

问题

调用 create 写入新记录后，返回值里没有新记录的主键，导致后续无法引用刚建的记录（如建客户后再挂商机）。

根因

托管环境下 Dataverse 的 create 常返回 `204 No Content`，响应体为空，SDK 拿不到生成的主键。

解决方案

在 adapter 里封装一个「创建后回读」：先尝试从响应体取主键，为空则按调用方提供的过滤条件（如 `name eq '...'`）回源查询补全主键，必要时带重试应对最终一致性。

多与会者活动：与会者经 activityparty 深插入，不可直建

问题

给会议（`appointment`）加多个联系人时，直接对 `activityparty` 表 create 会静默失败；即便建上了，读出来也没有联系人名、还混着系统自动加的 Owner。

根因

`activityparty` 是受限表，必须随父活动一起写，不能独立创建；它不暴露联系人显示名，且系统会把活动 Owner 也作为一个 party 写入。

解决方案

**写：**在父 `appointment` 上通过集合导航属性一次性深插入与会者数组，每项指向一个联系人并带参与类型掩码（必选 / 可选 / 组织者）；对父活动 PATCH 该数组会整体替换与会者集合，适合同步。**读：**按参与类型掩码过滤掉 Owner，只保留真实与会者，再用联系人服务解析显示名。

活动附件用 activitymimeattachment，不要混用 annotation

问题

上传的附件不出现在活动表单的 ATTACHMENTS 子网格里。

根因

活动附件表 `activitymimeattachment` 与时间线备注表 `annotation` 用途不同，放错表就不会显示在对应位置。

解决方案

活动附件写 `activitymimeattachment`（进 ATTACHMENTS 子网格）；`annotation` 仅用于时间线备注。两者不可混用。

::panel
### 用户身份与记录所有权
身份相关的两个坑会直接导致「用户看到空白数据」，且现象极具迷惑性。

objectId ≠ systemuserid

问题

用 `getContext().user.objectId` 做 `o.ownerid === userId` 过滤，结果所有数据被滤掉，用户看到空白 pipeline。

根因

SDK 的 `objectId` 是 **Azure AD objectId**（Entra ID），而 Dataverse 的 `_ownerid_value` 存的是 **systemuserid**（Dataverse 内部用户 GUID）。这两个 GUID 永远不同。

解决方案

把 `systemusers` 加为数据源，在 `useUser` hook 里用 `user.userPrincipalName`（email）查 `systemusers` 的 `windowsliveid` 字段拿到 `systemuserid`，并覆盖到返回值的 `objectId`，下游代码无需改动即自动使用正确的 Dataverse 用户 ID。用 `windowsliveid` 而非 `azureactivedirectoryobjectid` 匹配 UPN（后者在部分环境为空）；TanStack Query 缓存保证此查询只在首次加载执行一次。// hooks/use-user.ts — 完整实现 import { useQuery } from '@tanstack/react-query'; import { getContext } from '@microsoft/power-apps/app'; import { getClient } from '@microsoft/power-apps/data'; import { dataSourcesInfo } from '../../.power/schemas/appschemas/dataSourcesInfo'; const dvClient = getClient(dataSourcesInfo); async function resolveSystemUserId(email: string): Promise<string> { const result = await dvClient.retrieveMultipleRecordsAsync<{ systemuserid: string; }>('systemusers', { filter: `windowsliveid eq '${email}'`, select: ['systemuserid'], top: 1, }); if (result.success && result.data?.[0]?.systemuserid) { return result.data[0].systemuserid.toLowerCase(); } return ''; } export const useUser = () => useQuery({ queryKey: ['user'], queryFn: async () => { const { user } = await getContext(); const systemUserId = user.userPrincipalName ? await resolveSystemUserId(user.userPrincipalName) : undefined; return { ...user, objectId: systemUserId }; }, });

Owner 字段用原生系统列，不要冗余自建

问题

为「记录归属」自建了 `crf5c_ownerid` 文本列冗余存储 owner，导致与平台 owner 双份维护、易不一致。

根因

Dataverse 原生用 `_ownerid_value` 系统字段记录所有者，创建时自动把 calling user 设为 owner，无需也不应另建列。

解决方案

adapter 的 `fromDv` 读 `_ownerid_value` 并 `.toLowerCase()` 归一化（GUID 大小写不定），`toDv` 不写 ownerid；删除任何自建 owner 列。
:::

## #integrations 07 / Integration Topics :: 五大集成专题：从 Flow 到 MCP

上一节确立了 Dataverse 的标准对接路径，本节逐一拆解 Code App 与 Power Automate Flow、Copilot Studio Agent、Dataverse Action、外部 Web API 和 MCP 的集成方法。

:::accordion
::panel
### Power Automate Flow 集成 (Preview)
Code App 可以调用 Power Automate 云端流，但仅支持使用 **"When Power Apps calls a flow (V2)"**（`PowerAppV2` trigger kind）触发器的手动即时流，且流必须在 Solution 中。V1 触发器不受支持。

> **限制：**
> **限制：**仅支持使用 **"When Power Apps calls a flow (V2)"**（`PowerAppV2`）触发器的手动即时流；V1 触发器、计划流、自动流和其他触发器类型的即时流均不受支持。Flow 命令仅在 npm CLI（`npx power-apps`）中可用，不支持 `pac code`。终端用户需要 Dataverse 权限（App Opener 安全角色或等效角色）才能调用流。[[9]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)

> **已确认 Bug：`pac code push` 不支持 `shared_logicflows` 的 `workflowDetails` schema（microsoft/PowerAppsCodeApps#323）。**
> **已确认 Bug：`pac code push` 不支持 `shared_logicflows` 的 `workflowDetails` schema（microsoft/PowerAppsCodeApps#323）。**`add-flow` 生成的 `power.config.json` 中 `connectionReferences` 包含 `workflowDetails`（workflowEntityId、workflowName、dependencies）。PAC CLI 的 `pac code push` 不认识此字段，push 时要么报 HTTP 400（`"Could not find member 'workflowDetails' on object of type 'AppConnectionReference'"`），要么静默丢弃 → 运行时无法解析 Flow 连接 → App 启动返回 HTTP 500（白屏）。**解决方案：必须用 `npx power-apps push`（npm CLI）替代 `pac code push`**。npm CLI 支持完整的 `workflowDetails` schema，push 后 App 可正常启动并调用 Flow。社区多人确认此方案有效。注意：如果 push 后旧版本被缓存，用无痕窗口验证。

> **已确认 Bug：UTF-8 多字节编码截断（Published 环境）。**
> **已确认 Bug：UTF-8 多字节编码截断（Published 环境）。**Flow 返回值包含中文或其他非 ASCII 字符时，Published Code App 的 SDK 解码通道（`runtimeDataClient.js _decodeArrayBuffer`）会截断多字节 UTF-8 序列，导致 `JSON.parse` 报 `Unterminated string`。**本地开发和浏览器 dev 不会复现**——仅 Published 环境必现。Flow 本身返回 200 无错。缓解方案：在 Flow 的 Respond action 中用 `concat('B64:', base64(...))` 对响应体做 base64 编码；客户端检测 `B64:` 前缀后做 `atob → Uint8Array → TextDecoder('utf-8')` 解码。非 `B64:` 前缀的响应透传（向后兼容）。此问题已在 microsoft/PowerAppsCodeApps#359 报告。

::panel
### Copilot Studio Agent 基础连接（2026 年 8 月官方流程） || Basic Copilot Studio Agent Connection (August 2026 Official Workflow)
Microsoft 于 2026-08-13 发布并在 08-20 更新了 Code App 专用连接指南。基础集成使用 Microsoft Copilot Studio 连接器 `shared_microsoftcopilotstudio`，由 `pa` CLI 生成 `CopilotStudioService`，再通过 `ExecuteCopilotAsyncV2` 调用已发布 Agent。本节范围止于连接、最小调用与连接故障排查。 || Microsoft published the Code App-specific connection guide on August 13, 2026 and updated it on August 20. The basic integration uses the Microsoft Copilot Studio connector `shared_microsoftcopilotstudio`, lets the `pa` CLI generate `CopilotStudioService`, and invokes a published agent through `ExecuteCopilotAsyncV2`. This section is limited to connection, minimal invocation, and connection troubleshooting.

> **端点选择：**
> **端点选择：**使用 `ExecuteCopilotAsyncV2` 对应的 `/proactivecopilot/executeAsyncV2`。官方文档指出，`ExecuteCopilot` 只返回 conversation ID，`ExecuteCopilotAsync` 可能返回 502。 || **Endpoint selection:** Use `ExecuteCopilotAsyncV2`, which maps to `/proactivecopilot/executeAsyncV2`. The official guide states that `ExecuteCopilot` returns only a conversation ID and `ExecuteCopilotAsync` may return 502.

> **故障排查：**
> **故障排查：**空响应时依次确认 Agent 已发布、`agentName` 与 connection string 完全一致、message 格式符合 Agent 要求。不同实现可能返回 `conversationId`、`ConversationId` 或 `conversationID`；需要读取 conversation ID 时应兼容三种大小写。[[10]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio) || **Troubleshooting:** For an empty response, confirm in order that the agent is published, `agentName` exactly matches the connection string, and the message format matches the agent's expectations. Implementations may return `conversationId`, `ConversationId`, or `conversationID`; code that needs the conversation ID should accept all three variants. [[10]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio)

::panel
### Dataverse Action / Function 集成
Code App 可以直接调用 Dataverse 中的 Action（写操作）和 Function（读操作），包括系统内置的和自定义的。

> **限制：**
> **限制：**此功能仅在 npm CLI（`npx power-apps`）中可用，不支持 `pac code`。重复运行 `add-dataverse-api` 是幂等的，可用于同步最新的操作签名变更。[[11]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function)

::panel
### 外部 Web API 集成（Custom Connector）
Code App 通过 Custom Connector 接入外部 Web API。典型路径是将 API 发布到 Azure API Management，再创建 Custom Connector 桥接到 Power Platform。

> **替代方案：**
> **替代方案：**如果不走 Custom Connector 路径，Code App 也可以使用标准 `fetch()` 直接调用外部 API，但需要配置 CSP（Content Security Policy）的 `connect-src` 指令允许目标域名，且不享受 Power Platform 的连接管理、DLP 策略和连接器权限治理。[[12]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-basic-asset-management-api-azure-functions)

::panel
### AI Builder Custom Prompt 集成（经验证可用）
AI Builder Custom Prompt 在 Dataverse 中注册为 unbound action（形如 `msdyn_aibdptcustomprompt{guid}`）。Code App 通过 `add-dataverse-api` 将其作为 Dataverse 操作添加，生成类型安全的 Service 类，**无需 Power Automate Flow 中转**。此路径已在生产项目中验证可用（2026-06-06）。

> **为什么优先用 Dataverse Action 而非 Flow 包装 AI Builder？**
> **为什么优先用 Dataverse Action 而非 Flow 包装 AI Builder？**(1) Flow 方式需要 `shared_logicflows` connectionReference，且**必须用 `npx power-apps push`** 部署（`pac code push` 不支持 `workflowDetails` schema，会导致启动 500，详见 microsoft/PowerAppsCodeApps#323）；(2) Flow 中转消耗 Flow 运行配额并增加 1–3 秒延迟；(3) SDK 的 UTF-8 解码通道存在多字节截断 Bug（microsoft/PowerAppsCodeApps#359），需要 base64 编码绕过。`add-dataverse-api` 路径完全绕过 Flow，直接调用 Dataverse action，无上述限制。

> **关键实现细节：**
> **关键实现细节：**生成的 Service 内部使用 `executeAsync({ dataverseRequest: { action: 'customapi', parameters: { operationName, tableName, body } } })`，其中 `tableName` 必须是 `dataSourcesInfo.ts` 中已注册的数据源名（即操作名本身）。手动拼 `executeAsync` 时如果 `tableName` 传入其他值（如 `'accounts'` 或空字符串），SDK 会报 `"Operation not found in data source"`。这是 `add-dataverse-api` 的核心价值：它把操作名注册为独立数据源，解决了 tableName 路由问题。

> **跨环境部署（ALM）注意事项：**
> **跨环境部署（ALM）注意事项：**AI Builder Custom Prompt 的 action 名（如 `msdyn_aibdptcustomprompt104e526a...`）由 Dataverse 在创建 prompt 时生成，本质是 Dataverse Custom API 的 `UniqueName`。此名称是 Solution component identity 的一部分：**通过 Solution 导出/导入部署时，action 名在目标环境中保持不变**——prompt record GUID、Custom API UniqueName 和对应的 unbound action 名全部随 managed solution 一起迁移。因此只要遵循标准 ALM 路径（Dev 环境创建 prompt → 打包进 Solution → 导入 Test/Prod），Code App 代码中硬编码的 action 名无需修改。**但如果在目标环境手动重新创建 prompt，会生成全新的 record GUID 和 action 名**，导致已有代码调用失败。最佳实践：始终将 AI Builder prompt 和 Code App 放在同一个 Solution 中，作为整体部署。

::panel
### MCP Server 集成
**MCP Server**

Code App 是浏览器端 SPA，无法直接作为 MCP Client 连接 MCP Server（MCP 使用 stdio 或 SSE 传输）。推荐路径：将 MCP Server 包装为 HTTP API（如 Azure Functions + MCP Server SDK 的 Streamable HTTP 传输），通过 Custom Connector 接入 Code App。Power Apps MCP Server 是反向集成（AI Agent 操作 Power Apps），非 Code App 调用 MCP。

::panel
### 外链 URL 限制：CSP 与白名单
外部图片不显示、外部 API 请求被拦，几乎都不是代码问题，而是 Code App 的 Content Security Policy（CSP）拦截。CSP 在环境级强制启用，默认策略偏严。

**默认 CSP 关键指令（环境级生效）**

img-src 'self' data: <platform> ← 仅本应用、data URI、平台内置来源 connect-src 'none' ← 默认禁止所有 fetch/XHR/WebSocket（实测发现平台可能内部白名单了部分域名） script-src 'self' <platform> ← 禁止外部 JS style-src 'self' 'unsafe-inline' ← 禁止外部 CSS font-src 'self' ← 禁止外部字体（实测 Google Fonts CDN 可能被拦） media-src 'self' data: ← 禁止外部音视频 frame-src 'self' ← 禁止 iframe 外部页面

> **诊断结论：**
> **诊断结论：**外链图片不显示的根因通常是 `img-src` 不包含该域名；外部 API 调用失败的根因通常是 `connect-src` 默认为 `'none'`。打开浏览器开发者工具 Console，看到 `Refused to load ... violates the following Content Security Policy directive: "img-src ..."` 即可确认。[[13]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)

**解决方案（按推荐顺序）**

**配置 CSP 白名单的两种入口**

**Admin Center UI（推荐）**

有 Dataverse 的环境可直接在 Admin Center 配置：按指令关闭"使用默认值"开关，添加自定义源（如 `https://cdn.contoso.com`），自定义值会与默认值合并。可单独启用/禁用每个指令。

**REST API + PowerShell**

无 Dataverse 的环境或需要批量管理时，调用 `Environment Management Settings` API（`PowerApps_CSPConfigCodeApps` 字段）。官方提供 `Get-CodeAppContentSecurityPolicy` / `Set-CodeAppContentSecurityPolicy` PowerShell 辅助函数。注意：更新指令会替换整个集合，必须先 Get 再 Set。

> **常见易错点：**
> **常见易错点：**(1) CSP 是**环境级**配置，不能在单个 Code App 内通过 `<meta>` 标签覆盖；(2) 必须由**环境管理员**操作，开发者权限不够；(3) 加白名单后需**刷新页面**才生效，无需重新发布应用；(4) 大规模管理多个环境时，使用 **environment groups and rules** 统一配置。[[13]](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
:::

## #limitations 08 / Limitations :: 当前限制：Code App 不能做什么

上一节梳理了各类集成方法，本节明确当前 Code App 的已知限制，帮你避免选型后的意外。

:::insight-grid { cols: 3 }
::card 01
### 运行平台
Code App 通过浏览器运行（apps.powerapps.com 播放地址），桌面与移动浏览器均可访问。官方限制清单中唯一的客户端例外是不支持 Power Apps for Windows 原生客户端；移动端不在官方限制之列。

::card 02
### Git 集成
不支持 Power Platform Git 集成（源码同步到 Dataverse 的 Git 机制）。代码需在外部 Git 仓库管理，通过 `npx power-apps push` 部署；`pac code push` 仅作为兼容路径保留。

::card 03
### SAS IP 限制
不支持 Storage Shared Access Signature IP 限制策略。

::card 04
### Power BI 集成
不支持 PowerBIIntegration 函数直接嵌入 Power BI 数据，但 Code App 可通过 Power Apps Visual 嵌入到 Power BI 报表中。

::card 05
### SharePoint 表单
不支持 SharePoint 表单集成（将 Code App 作为 SharePoint List 的自定义表单）。

::card 06
### Service Principal
Service Principal (SPN) 不能创建或成为 Code App 的 Owner。
:::

:::accordion
::panel
### 离线能力：Code App 无法离线冷启动
Code App 是浏览器托管的单页 web 应用。官方架构文档说明，应用运行时由 Power Apps host 负责 "end-user authentication, app loading"，即终端认证与应用加载均由它在运行时完成；系统配置文档进一步说明，编译后的应用资源 "hosted on a publicly accessible endpoint"，应用 "authenticate with Microsoft Entra ID"，内容在终端用户 "go through authentication and authorization checks" 之后才返回。据此，冷启动同时依赖两项在线操作：从公有端点拉取应用资源、经 Entra 完成登录。

**来源边界：**官方 Code App 文档未把离线场景列入限制清单，官方 GitHub 仓库亦无离线支持声明。因此本节结论并非官方离线声明，而是基于上述已记录架构的推断，并以受控实测佐证。这一点须与 Canvas App 区分：Canvas App 是另一种应用类型，其离线文档不适用于 Code App。

> **受控实测（本应用）：**
> **受控实测（本应用）：**将浏览器切换为离线后冷启动本 Code App——导航到 `apps.powerapps.com` 播放地址时，首个请求即以 `net::ERR_FAILED` 失败，应用外壳与 `#root` 从未渲染。离线状态下连播放器页面都无法获取，应用代码没有机会执行。

须区分两类离线场景，其可行性截然不同：

**会话中断网（应用已打开）**

应用代码已加载并运行，可在应用层实现降级：将查询结果持久化到 IndexedDB、启动时本地优先渲染、断网时禁用依赖后端的功能（AI 助手、写操作），使应用退化为基于本地缓存的只读查看器，重连后台自动同步。此场景可控。

**冷启动离线（关闭后重新打开）**

如上实测，宿主需先拉取应用外壳、再经 Entra 完成认证；离线时二者均告失败，界面停在错误页或空白。此场景无解——与应用自身的加载逻辑无关，属平台托管模型的固有约束。

若业务确需冷启动离线，可选路径有限：其一，接受限制，仅覆盖会话中断网场景；其二，改用另一种应用类型 Canvas App——其在原生 Power Apps Mobile 客户端上内置 Dataverse offline，但须以 Power Fx 重构并放弃自定义前端；其三，将 web 应用封装为脱离 Power Apps 播放器的独立 PWA 或原生壳，自建外壳缓存与 Entra 登录，代价是放弃托管平台的治理能力。

::panel
### Solution 打包与 ALM（两项工具级限制）
**Code App 完全支持基于 Solution 的 ALM。**官方 ALM 文档记载：`pac code push` 默认发布到环境的 Preferred Solution；也可用 `--solutionName` 指定目标 Solution，或在 make.powerapps.com 的 Solution → Add existing → App → Code app 手动加入。应用进入 Solution 后，可经 **Power Platform Pipelines** 在 Dev / Test / Prod 之间部署（带依赖与连接引用预检）。因此把 Code App 打包进 Solution 并经导出/导入或管道发布到客户环境，是官方支持的标准路径。

真正的 ALM 限制只有两项工具级例外（据官方 ALM 文档）：

**Solution Packager 工具**

不支持用 Solution Packager 工具把 Solution ZIP 拆解/重组为源码文件。这不影响 Solution 本身的导出、导入与管道部署，仅影响将 Solution 解包为源码并纳入版本库这一特定流程。

**源代码集成（Git）**

不支持 Power Platform 源代码集成（把 Solution 组件同步到 Dataverse Git 的机制）。Code App 的前端代码在外部 Git 仓库管理即可。

::panel
### Published 环境的 iframe 运行时与自动化 || Published iframe Runtime and Automation
Code App 发布后运行在 Power Apps Host 的跨源 iframe 中。浏览器页面脚本仍受同源策略限制，但 Playwright 运行在浏览器自动化层，可以通过 frame 定位器操作该 iframe 内的控件。本节结论在 2026-09-03 的 Published Code App 上完成验证。 || A published Code App runs in a cross-origin iframe hosted by Power Apps. In-page scripts remain subject to the same-origin policy, but Playwright operates through the browser automation layer and can use frame locators to control elements inside that iframe. The conclusions in this section were verified against a published Code App on September 3, 2026.

**浏览器 API 可用性（实测） || Verified Browser API Availability**

**自动化测试约束 || Automation Constraints**

> **正确做法：**
> **正确做法：**Published Code App 的内容 frame 名称为 `fullscreen-app-host`，其 URL 指向 `*.environment.api.powerplatformusercontent.com/.../storageproxy/...`。使用 `page.frame({ name: 'fullscreen-app-host' })` 或等价 frame locator 后，可以点击章节、填写聊天输入、等待 Agent 响应并读取 DOM。Power Apps Host 在导航、连接同意或 Local Play 重载时可能销毁并重建 frame；出现 `Frame was detached` 时，应等待新 frame 出现并重新获取 locator，而不是复用旧对象。 || **Correct approach:** The published Code App content frame is named `fullscreen-app-host`, and its URL points to `*.environment.api.powerplatformusercontent.com/.../storageproxy/...`. After resolving `page.frame({ name: 'fullscreen-app-host' })` or an equivalent frame locator, automation can select a section, fill the chat composer, wait for the agent response, and inspect the DOM. Power Apps Host can destroy and recreate the frame during navigation, connection consent, or Local Play reloads; after a `Frame was detached` error, wait for the new frame and reacquire locators instead of reusing stale objects.

::panel
### 已具备的平台治理能力（DLP / Conditional Access）
尽管有上述限制，Code App 已获得以下平台治理能力支持。

- **连接器权限同意** — 终端用户运行 Code App 时会看到连接器权限同意对话框，与 Canvas App 行为一致。
- **DLP 策略** — 应用启动时强制执行数据丢失防护策略。管理员可通过 DLP 控制 Code App 能使用哪些连接器。
- **Conditional Access** — 支持对单个 Code App 设置 Conditional Access 策略（如多因素认证、设备合规检查）。
- **应用隔离与外部访问** — 支持租户隔离、App Quarantine 和 Azure B2B 外部用户访问。支持管理员同意弹窗抑制。
:::

## #best-practices 09 / Best Practices :: Code App 开发与部署的最佳实践

上一节划清了限制边界，本节给出经过验证的最佳实践，帮你在这些边界内高效交付。

:::accordion
::panel
### 项目结构与开发规范
从项目初始化开始建立良好的工程实践。

::panel
### 部署与 ALM 策略
确保 Code App 的部署流程可重复、跨环境可移植。

::panel
### 监控与安全
上线后持续保障应用的可观测性和安全性。

**Azure App Insights**

为 Code App 配置 Azure Application Insights，获得前端性能指标、错误追踪和用户行为分析。

**Health Metrics**

Code App 的运行健康指标同时在 Power Platform Admin Center 和 Maker Portal 可用。

**Content Security Policy**

配置 CSP 头限制外部资源加载，减少 XSS 攻击面。参考官方 CSP 配置指南。

::panel
### AI Builder 结构化输出陷阱（用 text + Zod 兜底）
Code App 可通过 AI Builder 自定义提示（Custom Prompt）服务直接调用 LLM。接入时最容易踩的是「结构化输出」的坑。

AI Builder 结构化 JSON 输出对嵌套 schema 不可用

问题

把自定义提示的输出设为结构化 JSON、期望直接拿到自定义结构，结果模型返回的是平台内置样板 schema，解析必然失败，每次调用都退回文本重试，调用次数翻倍。

根因

AI Builder 的结构化 JSON 输出是 example-based 且只支持扁平结构；对嵌套 schema 它会套用内置样板而非你定义的结构，模型被锁死在错误 schema 上。

解决方案

统一用 **text 模式**传输 + **客户端 Zod 校验**：提示词要求模型输出目标 JSON 文本，客户端用 `JSON.parse` + 正则兜底提取 `{...}`，再用 Zod schema 校验与标准化。把类型安全收在自己手里，不依赖平台 JSON 机制。

::panel
### 构建与编译纪律
标准构建脚本为 `tsc -b && vite build`（TypeScript 类型检查 → Vite 打包）。这一段的坑几乎都源于一个事实：**冷编译会长时间零输出**，极易被误判为卡死。

冷编译 10–25 分钟属正常，不是卡死

问题

`pnpm build` 启动后长时间无任何输出、CPU 接近 0%，看起来像彻底卡住。

根因

`tsc -b` 在冷编译（无 `.tsbuildinfo` 缓存）时要读取全部 `node_modules` 类型定义，这是 I/O 受限过程。实测中型项目（280 源文件 + date-fns 1,230 个 .d.ts + lucide-react 200KB 单文件类型）冷编译 10–25 分钟，期间零输出。

解决方案

给足耐心，把 build 超时设到 20+ 分钟。增量编译（有缓存）仅需 <1 分钟，慢的只是首次。

绝不中断 tsc -b 编译

问题

中途 kill 编译进程后，下次 build 又从零开始冷编译，陷入「越急越慢」的恶性循环。

根因

`tsc -b` 用 `.tsbuildinfo` 做增量缓存。中途 kill（Ctrl+C / 关终端 / agent 超时杀进程）会损坏缓存，导致下次必须全量重建：冷编译 → 误判卡死 → kill → 缓存损坏 → 又冷编译。

解决方案

编译期间绝不中断。若缓存已损坏，删除 `tsconfig.*.tsbuildinfo` 后重新 build 并耐心等待 20+ 分钟一次性重建。

必须使用 Node.js LTS，并用 .nvmrc 锁定

问题

Vite 构建和 tsc 进程空转（0% CPU + 0 输出），换了机器/Node 版本后才正常。

根因

Node 23（Current）的 `esbuild-wasm` 有已知挂起问题（esbuild#3951），且 `fsevents` 可能缺预编译 binary。实测 Node 23.7.0 在 macOS ARM64 上必现空转。

解决方案

使用 Node.js LTS（22.x 或 20.x）。在项目根放 `.nvmrc` 写入 `22`，团队与 CI 通过 `nvm use` / `fnm use` 自动匹配；Homebrew 多版本可用 `PATH="/opt/homebrew/opt/node@22/bin:$PATH"` 临时切换。

不要让 AI 编码 agent 管理 build

问题

GitHub Copilot、Cursor 等 agent 在终端跑 `pnpm build` 时，因 30–60 秒无输出而把进程移后台或直接 kill，导致编译永远完不成。

根因

agent 用「无输出 = 卡死」的启发式判断，而 `tsc -b` 冷编译恰恰长期零输出，于是反复 kill → 缓存损坏 → 每次从零开始。

解决方案

在 agent 的记忆/指令里写明：build 超时设 >1200 秒、不要杀 tsc 进程；或改用 `tsc -b && vite build > /tmp/build.log 2>&1 &` 后台运行 + 定期 `cat /tmp/build.log` 检查；必要时让开发者在独立终端手动 build。

::panel
### 部署纪律
部署阶段的核心纪律是：**push 不构建**，所以完整流程永远是 build → 验证 dist 时间戳 → push → 浏览器验证。

push 不会自动 build

问题

改了代码、push 显示成功，用户却仍看到旧界面。

根因

`npx power-apps push` 和兼容的 `pac code push` 都只上传 `dist/`，不触发 `vite build`。跳过 build 直接 push 就上传了旧产物；push 后 sourcetime 会更新，造成「成功」假象。

解决方案

每次 push 前先 build，并用 `stat dist/index.html` 核对产物时间戳为当前时间，再 push。

优先使用 npm CLI 而非 PAC CLI

问题

用 `pac code add-data-source` 添加 Dataverse 表时报 `Invalid URI format`。

根因

旧版 PAC CLI 对 Dataverse 表的该命令存在 bug（PAC v1.52.1 确认），而 `pac code` 系列命令未来会被弃用。

解决方案

从 SDK v1.0.4 起改用 npm CLI（`npx power-apps`），无此 bug，且是官方推荐的长期路径。

推荐部署命令序列

照此执行

不要跳过任何一步；push 后用无痕窗口验证以避免缓存旧版本。# 完整部署流程（不要跳过任何一步） pnpm build # tsc -b && vite build（冷编译可能需 20 分钟） stat dist/index.html # 确认 dist 时间戳已更新 npx power-apps push # Code App 专用 npm CLI（推荐，必须用于 Flow 集成） # 或: ~/.dotnet/tools/pac code push # 兼容路径（不支持 Flow 的 workflowDetails schema） # push 后：打开浏览器（无痕窗口）验证 # 1) App 正常加载 # 2) 发送消息 → 得到响应 # 3) 控制台无错误 # 4) 改动功能正常工作

::panel
### 用 AI 编码助手加速开发
利用 AI 编码助手加速 Code App 开发。两条路径互补：日常写业务代码用 VS Code 里的 GitHub Copilot；而项目搭建、接数据源、部署这类「平台操作」可以用微软官方的 Power Platform Skills 插件把整套 `npx power-apps` 流程交给 AI 一键完成。

**GitHub Copilot（VS Code）**

添加数据源后，用 VS Code 中的 GitHub Copilot Agent Mode 自动更新代码以调用生成的 Model 和 Service。适合**日常写业务逻辑、改 UI、补类型**。微软官方文档明确推荐这一工作流。

**Power Platform Skills（Claude Code / Copilot CLI）**

微软官方维护的**插件市场**（[microsoft/power-platform-skills](https://github.com/microsoft/power-platform-skills)），把 Code App 的「平台操作」封装成 AI 能一键调用的标准 skill。适合**项目启动、接新数据源、部署**这类与 Power Platform CLI 打交道的环节。

**Power Platform Skills 提供哪些能力**

仓库是一个面向 **Claude Code** 和 **GitHub Copilot CLI（命令行版）** 的插件市场，含 Power Pages / Model Apps / Canvas Apps / **Code Apps** 四个插件。其中 `code-apps` 插件提供的 skill 按开发阶段划分如下：

| 阶段 | Skill | 作用 |
| --- | --- | --- |
| 启动 | `/create-code-app` | 用官方模板脚手架建项目、初始化、构建并首次部署一个新 Code App |
| `/list-connections` | 列出 Power Platform 连接，拿到 Connection ID |   |
| 接数据源 | `/add-datasource` | 路由器：问清需求后自动分派到下面对应的 add-* skill |
| `/add-dataverse` | 添加 Dataverse 表，生成类型安全的 Model 与 Service |   |
| `/add-sharepoint` 等 | SharePoint / Teams / Excel / OneDrive / Office 365 / Azure DevOps / Copilot Studio 各连接器，外加 `/add-connector` 兜底任意连接器 |   |
| 部署 | `/deploy` | 构建并部署一个已有 Code App |

除 skill 外，插件还附带一个 `code-app-architect` 架构决策角色、连接器参考文档，以及一套「connector-first 守则」——在沙箱里强制走连接器、禁止直接 `fetch`，从源头规避运行时报错。

**怎么装 · 适合谁 · 前提与取舍**

> **一句话判断：**
> **一句话判断：**新建项目或接陌生连接器 → 值得装，省查文档的功夫；成熟项目日常迭代且只用 VS Code → 收益有限，把官方 `add-*` 流程摘成自己的 instruction 即可「白嫖」其维护成果，无需切换工作流。
:::

## #references 10 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview | Code App 定义、前置条件、限制列表和平台管理能力支持矩阵的官方说明。
- [2] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture | 三层架构（Client Library / 生成模型 / Host）、开发时和运行时组件协作机制的官方说明。
- [3] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch | 从 Vite 模板初始化到 pac code push 发布的完整快速启动教程。
- [4] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data | 数据源添加（表格/非表格/存储过程/连接引用）、TypeScript 模型生成和调用示例的官方教程。
- [5] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm | Solution 绑定、Preferred Solution、Pipelines 部署和 ALM 限制的官方说明。
- [6] Microsoft. — https://github.com/microsoft/PowerAppsCodeApps | 官方模板（starter / vite）、示例项目（HelloWorld / FluentSample / StaticAssetTracker）和 E2E 测试的开源仓库。
- [7] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/npm-quickstart | npm CLI（npx power-apps）四命令速查和替代 PAC CLI 的使用教程。
- [8] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration | 托管代码安全注意事项和 hideNavBar 参数配置说明。
- [9] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows | npm CLI 发现、添加、调用和移除 Power Automate Flow 的完整教程及限制说明。
- [10] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio | 2026-08-13 发布、08-20 更新的 Code App 专用官方流程，覆盖 `pa connection list`、`shared_microsoftcopilotstudio`、`pa app add data-source`、agent name 和 `ExecuteCopilotAsyncV2`。
- [11] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function | 通过 npm CLI 发现和添加 Dataverse Action/Function 的完整教程。
- [12] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-basic-asset-management-api-azure-functions | Azure Functions + API Management + Custom Connector 集成外部 API 的端到端示例。
- [13] Microsoft. — https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy | Code App 的默认 CSP 指令值、Admin Center 与 REST API 两种配置方式，以及指令合并规则。
- [14] Microsoft. — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entities | Dataverse 建表权限前置、表类型（Standard/Activity/Virtual/Elastic）、所有权、可视化设计器限制及 schema 组件（列/关系/键）入口的官方说明。
- [15] Microsoft. — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/types-of-fields | Dataverse 列数据类型清单、对应 AttributeTypeDisplayName API 类型，以及可搜索/可排序约束。
- [16] Microsoft. — https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entity-relationships | 1:N 与 N:N 关系类型、级联行为（Cascade All/Active/None/Remove Link/Restrict）、触发动作及父子关系限制的官方说明。
- [17] Microsoft. — https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/offline-apps | Canvas App（另一种应用类型）的离线能力仅面向原生 Power Apps Mobile 客户端；本文仅将其作为 Code App 之外的替代方案引用，不作为 Code App 离线行为的依据。

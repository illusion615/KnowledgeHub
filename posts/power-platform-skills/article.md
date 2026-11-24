---
title: Power Platform Skills：微软官方 AI Agent 插件市场解析
eyebrow: Power Platform × AI Agent 工具链
brand: Power Apps
date: 2026-04-28
strict_i18n: false
strict_density: true
lead: 微软在 GitHub 上开源了 power-platform-skills 仓库——一个面向 Claude Code 和 GitHub Copilot CLI 的插件市场，将 Power Pages、Model Apps、Code Apps 和 Canvas Apps 的完整开发生命周期封装为可对话式调用的 Skills、Agents 和 Commands。
hero_actions:
  - "查看四大插件 | #plugins"
  - "架构解析 | #architecture"
panel_label: 核心发现
panel_title: 低代码平台正在将 AI Agent 作为一等公民纳入开发者工具链。
panel:
  - 4 个插件覆盖 Power Platform 四大应用类型
  - 26+ Skills 封装从脚手架到部署的完整生命周期
  - 同时适配 Claude Code 和 GitHub Copilot CLI 两个 Agent 运行时
  - Canvas Apps 插件引入 MCP Server 实现实时协作编辑
metrics:
  - "插件数 | 4 | Pages / Model / Code / Canvas"
  - "Skills 总计 | 26+ | 覆盖创建→部署→数据→认证"
  - "GitHub Stars | 221 | 截至 2026-04-28"
  - "贡献者 | 15 | 包含 Claude 和 Copilot Agent"
style:
  accent: "#9333ea"
---

## #overview 01 / 项目概览 :: 什么是 Power Platform Skills

一个 Claude Code / GitHub Copilot 的官方插件市场，将 Power Platform 的开发操作（创建站点、部署、数据建模、认证配置等）封装成可被 AI Agent 直接调用的 Skill 单元。

:::accordion
::panel
### 定位与动机
**传统 Low-Code 开发**

- 在浏览器 Designer 中拖拽组件
- 手动配置数据源和权限
- 部署通过 GUI 面板操作
- 开发者在平台界面和文档间反复切换

**Agent-Assisted 开发**

- 用自然语言描述需求，Agent 生成代码
- Skill 自动创建 Dataverse 表和权限
- 一条命令完成构建+部署+验证
- 开发者留在 IDE 中，Agent 协调一切

开源信息

仓库地址 [github.com/microsoft/power-platform-skills](https://github.com/microsoft/power-platform-skills)，MIT 许可证。项目由微软 Power Platform 团队维护，15 位贡献者中包括 Claude 和 Copilot Agent 本身——即 AI 参与了自身工具链的建设。

::panel
### 安装与使用
一键安装（推荐）

执行安装脚本，自动检测 Claude Code / GitHub Copilot CLI 可用性，注册市场并安装全部插件：

`curl -fsSL https://raw.githubusercontent.com/microsoft/power-platform-skills/main/scripts/install.js | node`

手动安装

在 Claude Code 或 GitHub Copilot CLI 会话中依次执行： `/plugin marketplace add microsoft/power-platform-skills` 然后安装所需插件，如 `/plugin install power-pages@power-platform-skills`。

前置依赖

所有插件均需 Node.js LTS。部署类 Skill 需要 PAC CLI（`dotnet tool install -g Microsoft.PowerApps.CLI.Tool`）。Canvas Apps 插件额外需要 .NET 10 SDK。
:::

## #plugins 02 / 四大插件详解 :: 覆盖 Power Platform 四大应用类型

每个插件提供独立的 Skills、Agents 和 Commands，覆盖从项目脚手架到生产部署的完整生命周期。

:::accordion
::panel
### Power Pages 插件 — 9 个 Skills + 4 个 Agents
定位

创建和部署 Power Pages Code Sites（SPA），支持 React、Vue、Angular、Astro 四种前端框架。从脚手架到 SEO 的全生命周期覆盖。

| Skill 命令 | 功能说明 |
| --- | --- |
| `/create-site` | 脚手架生成完整 Code Site，支持四种框架模板、Unsplash 真实图片、实时浏览器预览 |
| `/deploy-site` | 构建并通过 `pac pages upload-code-site` 上传到 Power Pages 环境 |
| `/activate-site` | 在 Power Platform 环境中激活站点记录，生成公开 URL |
| `/setup-datamodel` | 分析站点需求，通过 OData API 创建 Dataverse 表、列和关系 |
| `/add-sample-data` | 按依赖顺序插入上下文相关的测试数据 |
| `/integrate-webapi` | 生成类型化 API 客户端、CRUD 服务层、表权限和站点设置 |
| `/setup-auth` | 添加登录/注销和基于角色的授权 |
| `/create-webroles` | 生成 Web Role YAML 文件管理用户访问 |
| `/add-seo` | 自动生成 robots.txt、sitemap.xml 和 Open Graph 元标签 |

Agents 职责分工

Data Model Architect 分析站点并提出数据模型；Web API Integration 创建类型化客户端和服务；Table Permissions 提出 CRUD 权限方案；Web API Settings 验证列名大小写并配置站点设置。其中前三个为只读型 Agent——只分析和提议，不直接修改资源。

::panel
### Model Apps 插件 — Generative Pages
定位

为 Model-Driven Power Apps 构建和部署 Generative Pages（genux）。技术栈为 React 17 + TypeScript + Fluent UI V9，每个页面是一个独立 `.tsx` 文件。

单一 Skill /genpage

单个 Skill 覆盖完整工作流：验证前置条件 → PAC CLI 认证 → 收集需求 → `pac model genpage generate-types` 生成 schema → 生成 React+TypeScript+Fluent 代码 → `pac model genpage upload` 部署 → Playwright 浏览器验证。

设计约束

所有数据操作通过 `props.dataApi` 进行类型化 CRUD；UI 层使用 Fluent UI V9 `@fluentui/react-components`；单文件架构，每页导出 `export default GeneratedComponent`。

::panel
### Code Apps 插件 — 13 个 Skills + 连接器体系
定位

构建和部署 Power Apps Code Apps，技术栈为 React + Vite + TypeScript，通过 Power Platform 连接器接入数据源。Connector-First 原则——Code Apps 运行在沙箱中，不支持直接 HTTP 调用（fetch/axios/Graph API），所有外部数据访问必须通过连接器。

| Skill 命令 | 功能说明 |
| --- | --- |
| `/create-code-app` | 脚手架、配置并部署新的 Code App |
| `/deploy` | 构建并部署现有 Code App |
| `/list-connections` | 列出 Power Platform 连接，获取 Connection ID |
| `/add-datasource` | 路由器：询问需求并选择合适的 add-* Skill |
| `/add-dataverse` | 添加 Dataverse 表，生成 TypeScript Models 和 Services |
| `/add-sharepoint` | 添加 SharePoint Online 连接器 |
| `/add-teams` | 添加 Microsoft Teams 连接器 |
| `/add-excel` | 添加 Excel Online (Business) 连接器 |
| `/add-onedrive` | 添加 OneDrive for Business 连接器 |
| `/add-office365` | 添加 Office 365 Outlook 连接器 |
| `/add-azuredevops` | 添加 Azure DevOps 连接器 |
| `/add-mcscopilot` | 添加 Copilot Studio Agent 连接器 |
| `/add-connector` | 通用兜底：添加任何其他 Power Platform 连接器 |

Generated Services 模式

`pac code add-data-source` 自动在 `src/generated/` 目录下生成类型化 TypeScript 接口（Models）和 CRUD 方法（Services）。所有数据访问必须通过 Generated Services，不允许绕过连接器直接调用 API。

::panel
### Canvas Apps 插件 — MCP Server 驱动的实时编辑
定位

通过 Canvas Authoring MCP Server 编辑 Power Apps Canvas Apps。使用 PA YAML（`.pa.yaml`）格式，Agent 和 Power Apps Studio 浏览器标签页进行实时协作编辑（Coauthoring）。

| Skill 命令 | 功能说明 |
| --- | --- |
| `/configure-canvas-mcp` | 注册 Canvas Authoring MCP Server 到 Claude Code |
| `/generate-canvas-app` | 从自然语言描述生成完整 Canvas App |
| `/edit-canvas-app` | 根据自然语言描述编辑现有 Canvas App |
| `/add-data-source` | 引导用户在 Studio 中添加数据源并验证 |

MCP 工具集

MCP Server 暴露 8 个工具：`compile_canvas`（验证 YAML）、`sync_canvas`（同步会话状态）、`list_controls`、`describe_control`、`list_data_sources`、`get_data_source_schema`、`list_apis`、`describe_api`。

Agent 架构

4 个专职 Agent 通过 `Task` 工具由 Skill 调度：canvas-app-planner（规划设计）和 canvas-screen-builder（并行构建屏幕）用于生成；canvas-edit-planner 和 canvas-screen-editor 用于编辑。Builder 和 Editor 支持并行执行。

关键约束

Power Apps Studio 浏览器标签页必须全程保持打开——关闭会终止 Coauthoring Session，导致 `compile_canvas` 和 `sync_canvas` 失败。前置依赖为 .NET 10 SDK。
:::

## #architecture 03 / 架构设计 :: Marketplace → Plugin → Skill → Agent 四层架构

从仓库级市场清单到单个 Agent Persona，每一层解决一类问题。

:::accordion
::panel
### 四层架构解析
Marketplace

.claude-plugin/marketplace.json

注册全部可用插件

Plugin

.claude-plugin/plugin.json

元数据 + 版本 + 关键字

Skill

skills/*/SKILL.md

YAML frontmatter + 工作流

Agent

agents/*.md

Persona + 工具约束

层级职责

**Marketplace** 是仓库级清单，列出所有可安装插件。**Plugin** 是独立单元，包含自己的 AGENTS.md 开发指南、shared 参考文档和 scripts 工具脚本。**Skill** 定义工作流的完整步骤，通过 YAML frontmatter 声明 `allowed-tools`、`model`、`hooks`。**Agent** 是具有特定职责的执行者（如 Data Model Architect），由 Skill 通过 `Task` 工具调度。

::panel
### 跨插件共享机制
Shared Skills 模式

跨插件通用的 Skill（如 `report-issue`）放在 `shared/skills/` 目录，使用 `SKILL.template.md` 模板（支持 `{{PLUGIN_NAME}}` 占位符）。每个插件维护一个薄包装 `skills/<skill-name>/SKILL.md`，只包含 YAML frontmatter 和对共享工作流文件的引用。

DRY 原则

每个插件有共享工具库（`scripts/lib/`）和参考文档（`references/`）。添加新共享逻辑时放入插件级共享模块，不放在单个 Skill 目录中。更新共享 Skill 时需同步所有插件的包装文件。

Hook 机制

Power Pages 插件通过集中式 `hooks/hooks.json` 注册 Claude Code Hooks，`PostToolUse` 钩子匹配 `Skill` 工具来运行校验。将 Hook 行为集中管理，避免散落在各 Skill 的 frontmatter 中。

::panel
### 双运行时适配
**Claude Code**

- 通过 `/plugin install` 安装
- 支持 `--plugin-dir` 本地开发
- 权限模式：`acceptEdits` + 白名单 Bash 命令
- Hooks 系统用于 PostToolUse 校验
- Agent 通过 `Task` 工具调度

**GitHub Copilot CLI**

- 通过 `/plugin install` 安装
- 支持 `--allow-tool` 细粒度权限
- 支持 `--deny-tool` 排除危险命令
- `plugins/*/github/` 目录存放 Copilot 特定指令
- 相同 Skill/Agent 定义，不同权限管理方式
:::

## #workflow 04 / 典型工作流 :: Power Pages 端到端示例

以 Power Pages 插件为例，展示从零到上线的完整 Agent 驱动开发流程。每一步可独立执行，Skill 会自动检查前置条件。

:::accordion
::panel
### 10 步工作流
1. **/create-site** — 选择框架（React/Vue/Angular/Astro），Agent 脚手架项目、应用设计方向、构建页面组件，全程实时浏览器预览
2. **/deploy-site** — 验证 PAC CLI 认证，构建项目，通过 `pac pages upload-code-site` 上传到 Power Pages 环境
3. **/activate-site** — 建议子域名，轮询配置状态直到站点上线，返回公开 URL
4. **/setup-datamodel** — Data Model Architect Agent 分析站点代码，提议 Dataverse 表结构（或用户上传 ER 图），生成 Mermaid ER 图可视化
5. **/add-sample-data** — 读取表定义，按依赖顺序（父表优先）插入类型匹配的测试数据
6. **/integrate-webapi** — 扫描代码中的 mock 数据/placeholder fetch，映射到 Dataverse 表，生成 API 客户端+服务层+表权限+站点设置
7. **/create-webroles** — 发现已有角色，生成 UUID 唯一的 Web Role YAML，确保匿名/认证角色唯一性
8. **/setup-auth** — 添加 Anti-Forgery Token 处理的 Auth Service + 登录/注销 UI + 角色展示/隐藏逻辑
9. **/add-seo** — 从框架 Router 发现路由，生成 sitemap.xml + robots.txt + Open Graph / Twitter Cards 元标签
10. **/deploy-site** — 推送最终版本上线

::panel
### Agent 协作模式
顺序编排 vs 并行执行

Canvas Apps 插件展示了两种 Agent 调度模式：**顺序编排**——canvas-app-planner 先发现资源、设计应用、输出规划文档供用户审批；**并行执行**——审批通过后，多个 canvas-screen-builder 实例并行构建各屏幕的 YAML，再由主 Skill 统一调用 `compile_canvas` 验证。

只读分析 + 人工审批

Data Model Architect、Table Permissions、Web API Settings 三个 Agent 被设计为只读型——它们分析现有代码/数据并生成提案（Mermaid 图、YAML 配置），但不直接创建或修改任何资源。所有变更需经用户审批后由主 Skill 执行。
:::

## #implications 05 / 行业意义与趋势 :: Low-Code 平台拥抱 Agent 工具链的信号

Power Platform Skills 不仅是一个工具仓库，更是微软对 Low-Code × AI Agent 融合方向的系统性布局。

:::accordion
::panel
### 五个关键信号
- **从 GUI 到对话式开发** — 传统 Low-Code 依赖浏览器 Designer，现在微软将完整的创建→部署→数据→认证→SEO 流程封装为 Skill 命令，开发者留在 IDE/Terminal 中通过自然语言驱动开发。
- **Agent 成为一等公民贡献者** — 仓库 15 位贡献者中包含 Claude 和 Copilot Agent——AI 不仅使用工具链，还参与建设工具链。这是 Agent 参与软件工程（不仅仅是代码生成）的早期信号。
- **MCP 作为协作编辑桥梁** — Canvas Apps 插件通过 MCP Server 实现 Agent 与 Power Apps Studio 的实时协作编辑。MCP 不再只是数据访问协议，开始承担 IDE↔Platform 的双向控制职责。
- **插件市场标准化** — 统一的 marketplace.json → plugin.json → SKILL.md 三层配置体系，加上 YAML frontmatter 声明 allowed-tools / model / hooks，为 AI Agent 插件生态提供了可复制的架构模板。
- **安全模型仍在摸索** — 仓库文档提供 `--dangerously-skip-permissions` 选项但明确标注风险。Permission 白名单（`Bash(pac *)`）比全放开安全，但粒度仍较粗。Agent 自治与安全边界的平衡是整个行业的未解问题。

::panel
### 与现有 Vibe Coding 方案的关系
双轨互补

微软的 Power Platform 开发现在形成双轨格局：**浏览器端**是 Power Apps Vibe（自然语言 → 拖拽式 Designer 生成应用）；**IDE 端**是 Power Platform Skills（自然语言 → Agent 调用 Skill/CLI 生成代码项目）。两条路径面向不同开发者画像——Citizen Developer vs Professional Developer。

技术栈差异

Vibe 产出的是 Power Apps 原生格式（Canvas 低代码），依赖平台运行时；Skills 产出的是标准 React/TypeScript/Vite 项目，通过 PAC CLI 部署到 Power Platform 但代码本身可移植。Canvas Apps 插件则通过 MCP 协议打通了两个世界——在 IDE 中编辑 `.pa.yaml`，实时同步到 Studio。
:::

## #references 06 / References :: 参考来源

- [1] Microsoft. — https://github.com/microsoft/power-platform-skills | 仓库主页：README、AGENTS.md、CONTRIBUTING.md。
- [2] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/power-pages/README.md | Power Pages 插件文档：9 个 Skills + 4 个 Agents + 典型工作流 + Hook 机制。
- [3] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/model-apps/README.md | Model Apps 插件文档：/genpage Skill 的七步工作流和技术栈规范。
- [4] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/canvas-apps/AGENTS.md | Canvas Apps 插件架构：MCP Server 工具集、Agent 调度模式、PA YAML 格式。
- [5] Microsoft. — https://github.com/microsoft/power-platform-skills/blob/main/plugins/code-apps/AGENTS.md | Code Apps 插件架构：13 个 Skills、Connector-First 原则、Generated Services 模式。
- [6] Microsoft. — https://learn.microsoft.com/en-us/power-pages/configure/create-code-sites | Power Pages Code Sites 官方文档。
- [7] Microsoft. — https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/generative-page-external-tools | Model-Driven Apps Generative Pages 外部工具集成文档。

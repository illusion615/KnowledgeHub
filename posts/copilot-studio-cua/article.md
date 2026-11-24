---
title: Copilot Studio CUA：让 Agent 操作网页与桌面应用的能力、边界与成本
eyebrow: Computer Use Agent Brief
brand: Copilot Studio
date: 2026-04-22
strict_i18n: false
strict_density: true
lead: Copilot Studio 的 computer use 是一类由 CUA（Computer-Using Agent）驱动的 GUI 自动化工具：Agent 不再只会调 API，而是能像人一样在 Windows 机器上看屏幕、点按钮、输文本。它的价值不在“替代所有集成”，而在无 API、旧系统、跨页面搬运数据等场景中补上最后一层执行接口。本文基于 Microsoft Learn 官方文档，梳理它的工作方式、三种运行环境、可靠性上限、治理手段和 step-based 成本，帮助判断这项能力该何时启用、何时避免。资料核验时间：2026-04-22。
hero_actions:
  - "先看运行方式 | #runtime"
  - "直接看选型结论 | #decision"
panel_label: 一句话判断
panel_title: CUA 不是通用桌面助手，而是面向低风险 GUI 流程的受控自动化接口
panel:
  - 优先补齐“没有现成 API”的系统接入，而不是替代本来就稳定的 connector、flow 或后端接口。
  - 官方文档明确指出它更适合 autonomous agents 在后台执行；对话式使用会把推理消息和截图暴露在聊天里。
  - 当前仍是 preview，可靠性在 Web 与 Desktop 场景差异显著，也不适合财务交易或敏感评分类高风险任务。
metrics:
  - "区域要求 | US 环境 | 官方文档当前仅说明美国区域环境可用"
  - "运行方式 | 3 种 | Hosted browser / Cloud PC pool / BYOM"
  - "计费单位 | 5 Credits / step | 每一步视觉推理执行都计费"
  - "官方成功率 | Web≈80% / Desktop≈35% | FAQ 给出区间，但未公开测试集和机器条件"
style:
  accent: "#7c3aed"
---

## #definition 01 / Definition & Mechanism :: CUA 在 Copilot Studio 里到底是什么

它是一个能被 Agent 调用的工具，不是单独的产品 SKU。真正关键的是：它把“看图形界面并操作它”的能力带进了 Copilot Studio 的工具层。

:::accordion
::panel { open: true }
### 1.1 功能定位：当人能点，Agent 就能尝试点
Official Definition

**它做什么**

- **操作对象**：网页和 Windows 桌面应用。
- **操作方式**：通过虚拟鼠标和键盘执行点击、输入、菜单选择、滚动等动作。
- **使用入口**：在 Agent 的 Tools 中添加一个新的 Computer use 工具，而不是额外购买一个独立产品。
- **典型场景**：数据录入、发票搬运、跨系统表单填写、从界面读取数据后再交给其他工具继续处理。

Architectural Meaning

**它解决什么缺口**

- **无 API 集成**：官方文档明确把“没有 API 也能做自动化”作为核心价值。
- **跨页面执行**：和只返回文本答案的知识检索不同，CUA 目标是完成动作而不只是给出建议。
- **最后一层接口**：对遗留系统、第三方后台、临时门户尤其有价值，因为这些系统最常缺的是稳定接口而不是界面。
- **不是默认优先方案**：只要有更稳定的 API 或 connector，工程上仍应优先用确定性更强的接口。

::panel
### 1.2 工作闭环：感知 → 推理 → 动作
01

**Perception**

模型先截取当前屏幕画面，把像素作为状态输入，理解按钮、文本框、表格和当前页面位置。

02

**Reasoning**

结合当前截图、前一步动作和目标指令，决定下一步最合理的点击、输入或滚动动作。

03

**Action**

执行鼠标和键盘动作，观察结果，再进入下一轮循环，直到完成任务或因为不确定而停下来请求人工确认。

| 模型提供方 | 模型 | 状态 | Human Supervision |
| --- | --- | --- | --- |
| Azure OpenAI | Computer-Using Agent (CUA) | Active | 支持 |
| Azure OpenAI | OpenAI Computer Using Agent V1 | Retired | 支持 |
| Anthropic | Claude Sonnet 4.5 | Active | 支持 |

补充约束：要使用 computer use，Agent 需要开启 generative orchestrator。Anthropic 模型需要管理员允许 external models，并且在支持区域逐步开放。

::panel
### 1.3 它不是什么：不是可靠替代所有系统集成的万能层
**工程判断**

CUA 适合补足“接口不存在”的空白，不适合把一个本来就能通过 API、Power Automate 或 Connector 稳定完成的流程，反向改成视觉驱动的界面自动化。原因有三：它按 step 计费、同一任务结果可能因界面变化而波动、官方成功率在桌面应用场景显著下降。
:::

## #runtime 02 / Runtime & Authoring :: 怎么跑起来：机器、凭据和指令面

Copilot Studio 已经把 computer use 包成一个工具，但落地成败仍然取决于你选哪类机器、如何给凭据、以及说明写得是否足够细。

:::accordion
::panel { open: true }
### 2.1 三种运行环境：快试、托管池、自带机器
| 选项 | 适合什么 | 优点 | 关键限制 |
| --- | --- | --- | --- |
| **Hosted browser** | 快速试用、网页自动化 PoC | 无需自备机器；直接可用；同时可访问内置 Windows 应用 | Microsoft 托管；不 Entra join、不受 Intune 策略管理；不支持企业资源访问和自定义桌面应用；官方明确不建议用于生产，且可能按需求限流 |
| **Cloud PC pool** | 需要治理、扩缩容和企业资源接入 | 由 Windows 365 for Agents 提供；可自动扩缩容；工作账号接入；Entra joined + Intune enrolled，适合纳入企业管控 | 需要额外的环境与资源准备；更像正式运行面，不是零准备体验 |
| **Bring-your-own-machine** | 已有专用 Windows 机器或受控桌面环境 | 完全使用自有机器；适合需要特定本地应用、网络、策略或定制软件的情况 | 需要在机器上安装 Power Automate for desktop 2.61.132.25266+ 和 Web 扩展；同一台机器上的运行请求按队列串行执行 |

::panel
### 2.2 工具配置面：真正影响执行行为的不是按钮，而是字段语义
Configuration Fields

**作者需要配置什么**

- **Name / Description**：不仅给人看，也影响 Agent 何时决定调用这个工具。
- **Model**：选择实际执行 computer use 的视觉推理模型。
- **Instructions**：核心行为定义。应写清 URL、应用名、步骤和明确的完成条件。
- **Inputs**：放动态值，例如单号、金额、日期，让同一套指令可被重复调用。
- **Machine**：指向具体运行载体，决定它能看到哪些网站、系统和本地应用。

Credentials & Control

**最容易出事故的配置项**

- **Maker-provided credentials**：默认项，适合 autonomous agents；但若你共享 Agent，其他人可能以原作者权限在机器上操作。
- **End user credentials**：每个使用者都要有该机器的有效凭据，更适合对话式、以用户身份执行的流程。
- **Stored credentials**：可存 Power Platform 内部加密存储，也可接 Azure Key Vault。
- **Access control**：能限制允许交互的网站和桌面应用，但不能阻止模型把它们先打开。
- **Human supervision**：当模型检测到潜在危险或信息缺失时，可向指定人工审查人发起澄清请求。

::panel
### 2.3 指令设计：写得像 SOP，而不是写得像愿景
- **给全 URL 和精确应用名**：官方明确建议写完整网址和应用名称，而不是“打开采购系统”这种模糊表述。
- **明确写出最终动作**：如果需要提交、发送、下载，必须显式写出“完成后点击 Submit，不必再次确认”。
- **复杂交互拆成步骤**：下拉框、复杂菜单、分页表格都应用编号步骤拆开，不要让模型自己猜界面路径。
- **动态参数走 Inputs**：把每次变化的值从固定指令中抽出来，降低每次修改工具配置的成本。
- **输出格式先约定**：若要把抽取数据交给下游工具，最好要求它只返回纯文本或合法 JSON。

对话式发布时还要额外考虑暴露面：官方文档指出，tool 运行过程中会在聊天里共享 reasoning messages 与截图，因此 computer use 更适合后台自主执行，而不是面向终端用户长期对话暴露内部操作过程。
:::

## #limits 03 / Reliability & Limits :: 它能做多少，不该高估到哪里

官方 FAQ 已经给出了最重要的现实边界：Web 自动化明显比 Desktop 自动化可靠，而“同样的任务并不保证每次都一样”。

:::accordion
::panel { open: true }
### 3.1 官方可靠性数据：Web 能用，Desktop 仍有明显落差
**Web 任务**

约 80%

官方 FAQ 说 computer use 在基于 Web 的任务上表现最好，成功率大约 80%。

**Desktop 任务**

约 35%

桌面应用任务成功率显著下降，官方给出的量级约为 35%。

**证据缺口**

条件未公开

Microsoft 只说明这些数字来自产品侧评估，没有公开测试集、UI 复杂度、机器配置和冷启动条件。

这意味着这些百分比只能拿来判断“适合不适合”，不能直接当成你自己生产场景的 SLA。真正落地前仍然要在目标页面和目标机器上实测。

::panel
### 3.2 已知失败模式：非标准控件、循环、复杂文本编辑
- **非标准 UI 控件**：下拉框、日期选择器、自定义组件等动态控件是高频故障点。
- **视觉或时序变化**：同一个任务会因为页面微调、加载慢、弹窗或焦点变化出现不同结果。
- **循环和卡死**：当当前界面与模型预期不一致时，可能反复尝试同一动作或停在中间状态。
- **复杂文本操作**：需要大量复制、定位、选区或细粒度编辑的任务仍不稳定。
- **凭据自动填充支持不完整**：密码字段虽然支持多数 Windows 应用，但 Electron、Java、Unity、游戏、命令行、Citrix 和其他虚拟化环境可能不被支持。

::panel
### 3.3 官方不建议的高风险用途
Do Not Use

**不适合让 CUA 决定或执行的任务**

- **敏感领域推荐或打分**：如招聘、医疗、金融等。
- **金融交易**：包括付款、转账或其他直接资金动作。
- **有害行为**：垃圾信息、虚假信息等。
- **未经授权的数据外发**：向组织外分享数据或截图。

Preview Reality

**当前阶段还要额外保守**

- **功能状态**：整项能力仍是 preview，官方明示 preview 功能不以生产为目标。
- **Hosted browser**：官方单独说明这个运行面只适合快速试验，不建议生产使用。
- **可用区域**：当前文档限制在美国区域环境。
- **人工审查**：Human supervision 只是补充控制，不构成真正的安全保险丝。
:::

## #governance 04 / Governance & Observability :: 真正能不能用，取决于你有没有把治理补齐

CUA 本质上会拿着真实凭据在真实界面上执行动作，所以治理不只是“多一个日志面板”，而是机器隔离、账号权限、审计留痕和人工介入的组合。

:::accordion
::panel { open: true }
### 4.1 安全基线：专机、最小权限、白名单
- **专用机器**：官方建议把 computer use 放到隔离的专用机器，减少被其他软件、恶意程序或人工操作干扰的概率。
- **最小权限账号**：给运行账号只保留完成任务所需的权限，避免一旦误操作就拥有过大影响面。
- **网站白名单**：只允许受信域名；文档甚至建议结合 Edge 策略和 Intune 限制 Web 访问范围。
- **应用白名单**：只安装并允许执行必要应用，可结合应用控制策略缩小面。
- **凭据托管**：密码可存在 Power Platform 内部加密存储，或转到 Azure Key Vault 统一治理。

::panel
### 4.2 Human supervision：会停下来问人，但不能把它当刹车系统
How It Works

**触发与响应流程**

- **触发条件**：模型认为存在潜在恶意指令、信息缺失或多种合理解释时，会发起 review request。
- **通知方式**：通过 Outlook 邮件发送，也可在 Agent activity map 的高级 computer-use 面板里内联处理。
- **响应方式**：回复澄清文本，或对确认型请求输入 Yes / No。
- **超时行为**：超时未回复时，工作流保持暂停并在到达截止时间后停止。

What It Does Not Guarantee

**不能依赖它解决的问题**

- **非确定触发**：文档明确说明它由概率模型驱动，可能该停时不停，也可能不该停时停。
- **不是规则引擎**：不会自动替你执行企业策略、审批规则或自定义禁令。
- **不能回复敏感信息**：官方明确警告 reviewers 不应通过该流程提交密码、PIN、信用卡或社保号等。
- **可被持久化审计**：根据组织配置，回复内容可能进入 Dataverse 或 Purview。

::panel
### 4.3 监控与审计：截图、活动图、Dataverse 与 Purview
| 能力 | 官方说明 |
| --- | --- |
| Transcript | 查看逐步 reasoning messages 与每一步截图，理解 computer use 如何跟随指令执行。 |
| Advanced computer use activity | 在活动侧栏中查看 session replay、动作坐标、使用的用户上下文、网站与应用列表、凭据使用情况，并导出日志。 |
| Dataverse 容量 | 高级日志会消耗数据库、日志和文件三类 Dataverse 容量；Store logs in Dataverse 默认开启。 |
| 日志保留 | 默认 7 天；最大 33,554,432 分钟；填 0 或 -1 可无限保留。 |
| 日志粒度 | All data、Data without screenshots、Minimal 三档；但即使关闭高级日志，agent transcripts 仍会保留基础 computer use 日志和截图。 |
| Purview | 可把日志发送到 Microsoft Purview，活动名称为 `CUAOperation`。 |
:::

## #economics 05 / Economics :: 成本怎么读：不是按任务，而是按步骤付费

CUA 最容易被低估的地方不是模型，而是计费颗粒度。它不是“一次成功就算一次”，而是模型每完成一个可计量的执行步骤都单独消耗 Credits。

:::accordion
::panel { open: true }
### 5.1 计费规则：每一步 5 Credits
**基础费率**

5 Credits

preview 期间按 Agent action feature 计费，每一步 computer use 动作序列消耗 5 Copilot Credits。

**官方示例**

20 Credits

如果一次 timesheet 提交被分成 4 个步骤，整次运行就是 20 Credits，而不是 5 Credits。

**成本真正受什么影响**

步骤数 × 重试数

页面越跳、字段越多、重试越多，成本越快上升。UI 不稳定和 Desktop 低成功率会直接推高每次成功交付的 Credits。

::panel
### 5.2 成本控制的四个抓手
- **减少界面跳转**：让单次 run 尽量在少页面内完成，缩短 step 链条。
- **把不确定环节前置成人工或 API**：例如先由结构化系统准备数据，再交给 CUA 只做最后几步界面提交。
- **优先 Web，谨慎 Desktop**：官方成功率差异意味着 Desktop 任务更可能通过重试才能成功。
- **把指令写成稳态 SOP**：减少模糊描述，降低模型在中间步骤试错的频率。
:::

## #decision 06 / Adoption Decision :: 什么时候该用 CUA，什么时候不要碰

最好的判断方法不是看它“酷不酷”，而是问这个流程到底缺的是接口、缺的是治理，还是缺的是确定性。

:::accordion
::panel { open: true }
### 6.1 值得优先试的四类场景
Good Fit

**Legacy Web 后台录入**

没有公开 API，但流程高度重复，字段结构稳定，UI 变化频率低。

Good Fit

**从 PDF / 网页抽数据再回填表单**

官方样例就覆盖 invoice processing 和 data extraction，这类“搬运型”流程与 CUA 的能力匹配度最高。

Good Fit

**临时性第三方门户操作**

集成投入不值得做接口开发，但业务又需要自动化减轻人工重复劳动。

Good Fit

**后台自治型流程**

无需把过程实时暴露给终端用户，能够接受任务在后台运行并通过活动图审计。

::panel
### 6.2 明确不该用的五类场景
- **已有稳定 API / connector / flow**：没必要把确定性接口退化成视觉点击。
- **高风险交易或审批**：例如付款、转账、额度修改、不可逆删除。
- **对精度要求接近 100% 的桌面流程**：官方成功率量级已说明当前不是这个阶段。
- **开放网页或截图中容易遭遇 prompt injection 的环境**：隐藏内容可能诱导模型偏离原任务。
- **需要长期大规模生产 SLA 的关键路径**：preview 功能和 hosted browser 都不适合作为稳态生产底座。

::panel
### 6.3 五问检查表：通过越多，越适合上 CUA
- **Q1**：这个流程是不是缺 API，而不是缺一个更会写代码的人？
- **Q2**：页面结构未来 1 到 3 个月是否大致稳定？
- **Q3**：即使偶发失败，也不会造成高风险业务后果？
- **Q4**：你是否能提供专机、最小权限账号、白名单和日志保留？
- **Q5**：如果成本按步骤而不是按任务核算，这件事仍然划算吗？

如果前四问里有两问以上答“否”，通常不该直接把它推进生产链路；更合理的做法是回到 API、Flow 或人工半自动方案。
:::

## #references 07 / References :: 参考来源

- [1] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use | CUA 的定义、前置条件、配置字段、测试流程、发布方式、指令最佳实践和 5 Credits/step 计费示例来源。
- [2] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs | 三种运行环境（Hosted browser、Cloud PC pool、Bring-your-own-machine）、Power Automate for desktop 版本要求和运行队列规则来源。
- [3] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-computer-use | 感知-推理-动作闭环、用途边界、官方成功率、已知限制、高风险禁用场景和 prompt injection 风险说明来源。
- [4] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/human-supervision-computer-use | 支持模型清单、审查请求触发方式、邮件与内联响应流程，以及“不是安全保险丝”的限制说明来源。
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/monitor-computer-use | Transcript、activity map、Dataverse 容量消耗、日志保留、截图粒度和 Purview 的 CUAOperation 审计事件来源。
- [6] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions | Copilot Studio 的访问前提、浏览器要求和试用/订阅背景信息来源。

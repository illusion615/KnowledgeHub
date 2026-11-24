---
title: Power Platform 交互式报价估算器
eyebrow: Power Platform Pricing Estimator
brand: Power Apps
date: 2026-04-17
strict_i18n: false
strict_density: true
lead: 输入用户数和 AI 用量，自动计算阶梯价格、生成产品配置建议、对比替代方案，并用 BVM 维度估算 ROI。覆盖 Power Apps、Power Automate、Power Pages、Copilot Studio、AI Builder、Power BI 全产品线。
hero_actions:
  - "AI 试算 | #ai-rates"
  - "综合报价 | #calculator"
panel_label: 核心能力
panel_title: 从需求参数到可执行报价单
panel:
  - AI 能力试算：43 项能力逐项填入用量自动折算 Credits
  - 阶梯定价：Power Apps / Pages / AI Builder 自动应用最优价格
  - Dataverse 容量池化：基于许可自动计算附带容量
  - 可选方案与 ROI：对比自开发、友商方案，并输出回收期与三年净收益
metrics:
  - "覆盖产品 | 6 | Apps / Automate / Pages / Copilot Studio / AI Builder / Power BI"
  - "AI 能力 | 43 项 | 文档识别 / Prompt / Agent 动作 / AI Tools / Dynamics 365 一方 Agent 全覆盖"
  - "输出 | 报价 + ROI | 含月度 + 年度成本、配置建议、Dataverse 容量、回收期"
style:
  accent: "#7e22ce"
---

## #framework 01 / Pricing Framework :: Power Platform 的 3 种计费模式

理解报价的第一步是区分三种计费模式。企业采购通常使用「用户授权」和「容量包」（预付费），而 Pay-as-you-go 适合试点或弹性场景。

:::comparison
::versus 用户授权 (Per User)
### 按人头付费，预付年包
为每位使用者购买许可，按年预付、按月计价。适合已知固定人群、长期使用的场景。

- Power Apps Premium — $20/user/mo
- Power Automate Premium — $15/user/mo
- Power BI Pro — $10/user/mo
- 每位用户附带 Dataverse 容量

::versus 容量包 (Capacity Pack)
### 按吞吐量预购，共享使用
按容量单位（用户包 / Credits 包 / Bot）预购，不绑定特定用户，适合大流量和 AI 场景。

- Power Pages — $200/100 人包/mo
- Copilot Studio — $200/25k Credits/mo
- AI Builder — $500/1M Credits/mo
- Power Automate Process — $150/bot/mo

::versus Pay-as-you-go
### 先用后付，Azure 按量结算
通过 Azure 订阅按实际用量月结，无预付承诺。适合试点验证、弹性需求或无法预估用量的场景。

- Power Apps — $10/active user/app/mo
- Power Automate — $0.60/cloud flow run
- Power Pages — $4/auth user/mo
- Copilot Credit — $0.01/credit
:::

## #rules 02 / Licensing Rules :: 产品级许可类型与报价规则

以下许可信息来自官方 Power Platform Licensing Guide 和 Licensing FAQ。实际采购以你的地区、协议类型和当期目录价为准。

适用范围说明

本工具的报价估算仅覆盖**预付费（Prepaid Subscription）**许可类型，用于企业采购配置报价。下方各产品同时列出了 Pay-as-you-go（先用后付）计划及其费率供参考，但这些计划通过 Azure 订阅按月结算，不纳入估算器计算。

相关文档：[Pay-as-you-go Overview](https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-overview) · [Pay-as-you-go Meters](https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-meters)

### Power Apps

### Power Apps Premium

$20.00

user/month, paid yearly

- Canvas apps + model-driven apps，不限数量
- Premium、自定义和本地连接器
- Dataverse：+250 MB DB / +2 GB File
- Managed Environments 权益
- 2,000+ 新用户阶梯价可至 $12/user/mo

### Per App

$10.00

active user/app/month

- 单用户运行 1 个应用，按月活跃用户计费
- 通过 Azure 订阅按量结算
- 已有 Premium 许可用户不重复计费

### Power Automate

### Power Automate Premium

$15.00

user/month, paid yearly

- Cloud flows (DPA) + Desktop flows (RPA) attended mode
- Process Mining（50 MB data / user，上限 100 GB / tenant）
- Dataverse：+250 MB DB / +2 GB File
- Managed Environments 权益

### Power Automate Process

$150.00

bot/month, paid yearly

- Desktop flows (RPA) unattended mode
- 或用于"不限用户"的业务关键流程
- Dataverse：+50 MB DB / +200 MB File
- 无最低采购门槛，无前置许可要求

### Hosted Process

$215.00

bot/month, paid yearly

- Unattended RPA + Microsoft 托管 VM
- 基于 Azure VMSS 自动伸缩
- 前置条件：Premium 或 Process 许可
- Dataverse：+50 MB DB / +200 MB File

### Process Mining Storage

$5,000

100 GB data stored/month

- 前置条件：Power Automate Premium
- 可叠加多个 add-on 到同一前置许可
- 附带 Dataverse：2 GB DB / 1 TB File
- 250k Power Platform Requests/24h

### Flow Runs

$0.60

per cloud/attended run

- Unattended RPA 运行：$3.00 / run
- Hosted RPA 运行：$3.00 / run
- 已有 Premium/Process 许可范围内运行不计费
- 通过 Azure 订阅按量结算

### Power Pages

### Authenticated Users

$200

per pack (100 users)/month

- Tier 2（100 包 / 10,000+ 用户）：$75/pack
- Tier 3（1,000 包 / 100,000+ 用户）：$50/pack
- Dataverse：5 GB DB / 2 GB Log / 16 GB File per plan
- CDN 和 WAF 功能已包含

### Anonymous Users

$75

per pack (500 users)/month

- Tier 2（20 包 / 10,000+ 用户）：$37.50/pack
- Tier 3（200 包 / 100,000+ 用户）：$25/pack
- Dataverse：5 GB DB / 500 MB Log / 4 GB File per plan
- 登录页、系统页、错误页不计入匿名用户

### Active Users

$4.00 / $0.30

auth / anon user/website/month

- Authenticated：$4 / active user / website / 月
- Anonymous：$0.30 / active user / website / 月
- 已有 Power Apps 或 D365 许可用户不计费
- 通过 Azure 订阅按量结算

### Copilot Studio

### Copilot Studio

$200.00

tenant/month

- 25,000 Copilot Credits/month（租户级池化）
- Classic answer = 1、Generative = 2、Agent action = 5、Graph grounding = 10
- Cloud flows 在 bot 上下文内使用
- Standard + Premium + Custom 连接器
- Dataverse：5 GB DB / 20 GB File / 2 GB Log

### Copilot Studio User License

$0

user/month

- 每位 bot 创作者需要分配
- 建议与 tenant license 一同采购
- 仅创作权限，不含消息容量

### Copilot Studio for Teams

Included

with select M365 plans

- 仅限 Teams 渠道
- 使用 Dataverse for Teams
- 不支持 Gen AI、Power Automate 集成
- 10 sessions/user/24h（租户级限制）

### Copilot Credits

$0.01

per credit

- Agent 响应消耗的 Credits 按量计费
- 复杂度不同，每次响应消耗 Credits 不等
- 通过 Azure 订阅按量结算

### Power BI

### Power BI Pro

$10.00

user/month

- 协作发布、共享报表
- 含于 Microsoft 365 E5
- 适用于团队内部分析与协作

### Power BI Premium Per User (PPU)

$20.00

user/month

- Pro 全部功能 + 高级 AI、Paginated Reports
- 大数据集、自动机器学习
- 跨团队广泛分发需评估 Premium Capacity

### Fabric / Premium Capacity

$4,995+

capacity/month

- 不限消费端用户授权
- 组织级大规模分发
- 超出 PPU 用户边界时考虑此路径

### Dataverse 存储 Add-on

### Database Capacity

$40.00

per GB/month

- 关系型数据行存储
- 各许可附带容量按租户池化
- 默认环境：3 GB DB

### File Capacity

$2.00

per GB/month

- 附件、图片、文档存储
- 各许可附带容量按租户池化
- 默认环境：3 GB File

### Log Capacity

$10.00

per GB/month

- 审计日志存储
- 各许可附带容量按租户池化
- 默认环境：1 GB Log

### Storage

$48 / $2.40 / $12

DB / File / Log per GB/month

- Database：$48/GB/月
- File：$2.40/GB/月
- Log：$12/GB/月
- 每环境免费 1 GB DB + 1 GB File
- 通过 Azure 订阅按量结算

## #ai-rates 03 / AI Capability Calculator :: AI 能力试算表

填入每月预估用量，系统自动计算 Copilot Credits 小计并汇入下方综合报价器。AI Builder Credit 列仅供 Power Apps / Automate 场景参考。

计费逻辑

AI Builder 功能在 Power Apps / Automate 中运行时先消耗 AI Builder Credits；耗尽后自动切换到 Copilot Credits。在 Copilot Studio Agent 中直接消耗 Copilot Credits，不涉及 AI Builder Credits。

:::sandbox { id: "power-platform-pricing-quote-tool-sandbox-1", title: "交互实验沙盒 || Interactive Simulation Sandbox", canvas: false }
先选择本次试算按 Copilot Credit 还是 AI Builder Credit 进入报价器，再填写下方各能力月用量。
:::

| 能力 | 计量单位 | 月用量 | Copilot Credit | Copilot 小计 | AI Builder Credit | AI Builder 小计 |
| --- | --- | --- | --- | --- | --- | --- |
| AI Builder — 文档与图像 |   |   |   |   |   |   |
| 发票 / 收据 / 身份证识别 | 1 页 | — | 8 | 0 | 32 | 0 |
| 自定义文档处理 | 1 页 | — | 8 | 0 | 100 | 0 |
| 文字识别 OCR | 1 页 | — | 0.1 | 0 | 3 | 0 |
| 图像描述 / 合同处理 | 1 图 | — | 8 | 0 | 32 | 0 |
| 目标检测 | 1 图 | — | 8 | 0 | 8 | 0 |
| AI Builder — Prompt 与文本 |   |   |   |   |   |   |
| Prompt（基础模型） | 1k tokens | — | 0.1 | 0 | 1.2 | 0 |
| Prompt（标准模型） | 1k tokens | — | 1.5 | 0 | 24 | 0 |
| Prompt（高级推理模型） | 1k tokens | — | 10 | 0 | 182 | 0 |
| 情感 / 关键词 / 语言检测 | 1k 字符 | — | 0.1 | 0 | 2 | 0 |
| 实体提取 / 分类 | 1k 字符 | — | 1.5 | 0 | 20 | 0 |
| Copilot Studio — Agent 动作 |   |   |   |   |   |   |
| 经典回答（手动编排） | 1 次 | — | 1 | 0 | - | - |
| 生成式回答（RAG / GenAI） | 1 次 | — | 2 | 0 | - | - |
| Agent Action（触发/推理/跳转） | 1 次 | — | 5 | 0 | - | - |
| Tenant Graph Grounding | 1 次 | — | 10 | 0 | - | - |
| Agent Flow Actions | 100 次 | — | 13 | 0 | - | - |
| Copilot Studio — AI Tools |   |   |   |   |   |   |
| AI Tools — 文本/生成式（基础） | 10 次 | — | 1 | 0 | - | - |
| AI Tools — 文本/生成式（标准） | 10 次 | — | 15 | 0 | - | - |
| AI Tools — 文本/生成式（高级推理） | 10 次 | — | 100 | 0 | - | - |
| 内容处理工具 | 1 页 | — | 8 | 0 | - | - |
| Dynamics 365 Sales 一方 Agent（仅 Copilot Credit） |   |   |   |   |   |   |
| SQA · 研究高复杂度线索 | 1 线索 | — | 349 | 0 | - | - |
| SQA · 研究中复杂度线索 | 1 线索 | — | 209 | 0 | - | - |
| SQA · 研究低复杂度线索 | 1 线索 | — | 174 | 0 | - | - |
| SQA · Engage 线索有回复 | 1 线索 | — | 142 | 0 | - | - |
| SQA · Engage 线索无回复 | 1 线索 | — | 9 | 0 | - | - |
| Sales Opportunity · 每商机每刷新 | 1 商机·刷新 | — | 154 | 0 | - | - |
| Sales Order · 解析来件邮件 | 1 封邮件 | — | 2 | 0 | - | - |
| Sales Order · 库存可用性核对 | 1 个附件 | — | 5 | 0 | - | - |
| Sales Order · 创建/更新报价或订单 | 1 封邮件 | — | 5 | 0 | - | - |
| Sales Order · 完整报价工作流 | 1 封邮件 | — | 7 | 0 | - | - |
| Sales Order · 完整订单工作流 | 1 个订单 | — | 9 | 0 | - | - |
| Dynamics 365 Customer Service / Contact Center 一方 Agent（仅 Copilot Credit） |   |   |   |   |   |   |
| Customer Intent · 生成式回答 | 1 次 | — | 2 | 0 | - | - |
| Quality · 已结束对话评估 | 1 次 | — | 2 | 0 | - | - |
| Quality · 实时对话评估 | 1 次 | — | 2 | 0 | - | - |
| Quality · 实时辅导 | 1 次输入 | — | 2 | 0 | - | - |
| Knowledge Mgmt · 生成式答案 | 1 次 | — | 2 | 0 | - | - |
| Knowledge Mgmt · 经典答案 | 1 次 | — | 1 | 0 | - | - |
| Customer Assist · Premium GenAI Voice | 1 分钟 | — | 75 | 0 | - | - |
| Customer Assist · Tenant Graph Grounding | 1 次 | — | 10 | 0 | - | - |
| Customer Assist · Agent Flow 动作 | 1 个动作 | — | 0.13 | 0 | - | - |
| Dynamics 365 Finance / Supply Chain 一方 Agent（仅 Copilot Credit） |   |   |   |   |   |   |
| Account Reconciliation · 对账例外 | 1 个例外 | — | 7.25 | 0 | - | - |
| Supplier Comms · 来件邮件（无附件） | 1 封邮件 | — | 20 | 0 | - | - |
| Supplier Comms · 来件邮件（含附件） | 1 封邮件 | — | 30 | 0 | - | - |
| Supplier Comms · 跟进（去件）邮件 | 1 封邮件 | — | 5 | 0 | - | - |
| Credits 月度合计 | — | 0 | — | 0 |   |   |

Dynamics 365 一方 Agent 计费说明

上表中 Dynamics 365 一方（first-party）Agent 仅消耗 Copilot Credit、不能用 AI Builder Credit 结算，费率由基础计费原子组合而成。展开下方查看计费归集、费率构成与估算示例。

:::accordion
::panel { open: true }
### 计费归集与 AI Builder 限制
一方 Agent 不单独计费，而是从租户共享的 Copilot Credit 池扣减：预付容量包优先消耗，耗尽后按 Pay-as-you-go 计量（1 Credit = $0.01）。每个一方 Agent 采用专用计算结构，把基础计费原子（生成式回答 2、Agent 动作 5、Tenant Graph Grounding 10、Premium GenAI Voice 75 / 分钟等）组合成按业务对象计量的复合速率。

一方 Agent 与自定义 Copilot Studio Agent 共用同一租户 Credit 池。由 Microsoft 365 Copilot 已授权用户、以该用户身份触发的场景，按公平使用纳入 M365 Copilot 权益、不额外扣减预付容量；其余场景照常计量。

一方 Agent 与 Copilot Studio Agent 的消耗只能由 Copilot Credit（或其 Pay-as-you-go 等价）结算，无法使用 AI Builder Credit 抵扣。因此在上表切换到「AI Builder Credit」维度时，这些行会被自动锁定（置灰并禁用输入）。

::panel
### 费率构成与口径
**Sales Qualification Agent**：研究模式按线索复杂度计费 — 高 349 / 中 209 / 低 174（每条线索）；Engage 模式在研究费用之上叠加 — 有回复 +142 / 无回复 +9。

**Sales Opportunity Agent**：154 / 商机·刷新 = 账户研究 138 + 商机研究 12 + 干系人 2 + 推理链 2，另加竞品 / 自定义研究（按配置）。

**Sales Order Agent**：解析来件 2 + 库存核对 5（含相关附件）+ 创建 / 更新报价或订单 5 + 完整报价工作流 7 + 完整订单工作流 9（按报价转订单比例）。

**Customer Service / Contact Center**：Customer Intent / Quality / Knowledge Management 按生成式答案 2、经典答案 1 计，知识接地按 ×3 加权；Customer Assist 语音 = Premium GenAI Voice 75 / 分钟 + Tenant Graph Grounding 10 + Agent Flow 0.13 / 动作。

**Account Reconciliation Agent**：7.25 / 例外（金额不符 / 仅总账 / 仅子账三类例外同价）。

**Supplier Communications Agent**：来件无附件 20 / 含附件 30 / 跟进去件 5（每封邮件）。

数值取自 Microsoft 官方 Agent Usage Estimator [R8] / Copilot Credit Estimator [R9]，仅供预算估算。定时巡检、Microsoft 365 回填等内部项已从面向客户的估算中剔除；这些一方 Agent 仅汇入 Credit 总额，不进入按功能拆分的明细。速率随产品演进可能调整，采购前以官方估算器和 Power Platform 授权指南实时值为准，建议预留 10–20% 缓冲。

::panel
### 估算示例
以线索资格 Agent 为例：每月 1,000 条线索、均为中复杂度、仅研究模式：1,000 × 209 = 209,000 Credits / 月 ≈ $2,090。若启用 Engage 且 30% 回复：研究 209,000 + 回复 300 × 142 + 未回复 700 × 9 = 257,900 Credits / 月 ≈ $2,579。在上表「SQA · 研究中复杂度线索」等行填入对应月用量即可自动汇入报价。
:::

换算提示

Pay-as-you-go 场景下 1 Copilot Credit = $0.01。预付包按年购 Tier1 约 $500/月 = 1M AI Builder Credits。

业务场景 Credit 估算参考

下表把常见业务对象直接换算成 Copilot Credit 与 AI Builder Credit。Prompt 类场景默认按「标准模型」估算：Copilot 1.5 Credits / 1k tokens，AI Builder 24 Credits / 1k tokens；Copilot Studio 对话场景按消息动作直接计费。

| 处理对象 | Token 口径 | Copilot Credits / 次 | AI Builder Credits / 次 | 填表建议 |
| --- | --- | --- | --- | --- |
| 一封邮件摘要/分类 | 0.8k – 1.5k tokens | 1.2 – 2.3 | 19 – 36 | 在「Prompt（标准模型）」填入：邮件数 × 平均 k tokens |
| 一页合同/文档摘要 | 1.5k – 2.5k tokens | 2.3 – 3.8 | 36 – 60 | 纯摘要走 Prompt；结构化识别走「自定义文档处理」 |
| 一条客服对话（单轮） | 0.3k – 0.8k tokens | 2（生成式回答） | 7 – 19 | Copilot Studio 填「生成式回答」次数；Apps/Automate Prompt 填 token 用量 |
| 一份表单字段提取 | 0.5k – 1k tokens | 0.8 – 1.5 | 12 – 24 | 文本表单走 Prompt；扫描件走「自定义文档处理」或 OCR |
| 一段文本翻译（500 字） | 1.5k – 2k tokens | 2.3 – 3.0 | 36 – 48 | 在「Prompt（标准模型）」填入：文本段数 × 平均 k tokens |
| 一篇报告生成（1000 字） | 2.5k – 4k tokens | 3.8 – 6.0 | 60 – 96 | 含大纲、资料摘要与全文输出；复杂推理改用高级推理模型行 |

示例：每月处理 2,000 封邮件做摘要分类，按均值 1.2k tokens/封估算，在「Prompt（标准模型）」行填入 2,400（= 2,000 × 1.2）。若按 Copilot Credit 计费，约 3,600 Credits/月；若按 AI Builder Credit 计费，约 57,600 Credits/月。

组合计费示例

客服 Agent 每次对话平均 4 次经典回答 + 2 次生成式回答 = (4×1)+(2×2) = 8 Credits/次。900 客户/天 = 7,200 Credits/天 × 30 天 = 216,000 Credits/月。

## #options 04 / Option Analysis :: 三类可选方案的业务价值边界

价格测算前先明确选型边界：Power Platform 适合以治理和集成为中心的企业级低代码交付，自开发适合高度差异化核心系统，友商方案适合已有生态绑定或单点 SaaS 深度场景。

:::comparison
::versus Power Platform { highlight: true }
### 治理前置的低代码平台路径
适合 Microsoft 365、Dynamics 365、Azure 与 Dataverse 已在企业架构内的组织。投资重点是授权、治理、数据模型与交付体系，价值来自缩短上线周期和降低长期维护分散度。

- 适配多部门流程、门户、自动化、智能体与报表组合场景
- 依赖环境策略、DLP、ALM、容量与许可治理成熟度
- 对复杂前端体验和深度底层控制的自由度低于自开发

::versus 自开发
### 完全控制的工程化路径
适合产品体验、算法逻辑、数据主权或专有流程构成核心竞争力的系统。成本不只包括开发人力，还包括云资源、DevOps、安全审计、长期运维和人员连续性。

- 适配核心交易系统、强定制 UI、复杂领域模型与高并发服务
- 需要承担需求变更、人员替换、技术债和安全合规的全生命周期成本
- ROI 依赖交付速度和复用率，短周期内部应用通常回收慢

::versus 友商类似方案
### 生态绑定或单点能力路径
适合企业已在 Salesforce、ServiceNow、OutSystems、Mendix、UiPath 或其他 SaaS / iPaaS 生态形成标准化流程的场景。评估重点是集成深度、许可叠加和数据边界。

- 既有 CRM / ITSM / RPA 生态沉淀较深时迁移成本较低
- 跨 Microsoft 365、Teams、SharePoint、Dataverse 的原生联动通常需要额外集成层
- 需核算连接器、API 调用、外部身份、运行容量与专业服务费用
:::

BVM 选型判据

| 维度 | Power Platform | 自开发 | 友商方案 |
| --- | --- | --- | --- |
| Time to Value | 适合 4-12 周交付可用版本 | 适合 3-9 个月沉淀核心系统 | 取决于既有生态和实施伙伴 |
| TCO | 许可透明，治理不到位会产生容量和连接器外溢 | 前期现金支出低估概率高，长期维护占比高 | 订阅费清晰，集成和专业服务需单列 |
| Governance | 与 Entra、DLP、环境策略、审计体系结合紧密 | 治理能力取决于工程团队自建程度 | 取决于平台原生管控与企业身份集成深度 |
| Integration | Microsoft 365 / Dynamics / Azure 优势明显 | 可按企业架构完全定制 | 在其原生业务域内优势明显，跨域需补集成 |
| Risk | 平台锁定风险中等，可通过 ALM 和数据模型治理降低 | 交付延期、人员连续性和安全审计风险更高 | 供应商锁定和数据流转边界需前置评估 |

## #calculator 05 / Interactive Estimator :: 综合报价器：基础授权 + AI 场景一站估算

上方试算表的 Credits 合计会自动生成 Copilot Studio 和 AI Builder 行项。你也可以直接修改任何参数。

:::sandbox { id: "power-platform-pricing-quote-tool-sandbox-2", title: "需求参数", canvas: false }
上方「AI 试算表」的 Credits 合计已自动填入配置表，如需修改请直接修改 AI 试算表。
:::

## #roi 06 / BVM ROI Calculator :: BVM 视角下的投资回报测算

ROI 不只看许可费，而要把效率提升、收入加速、成本规避、风险折减和平台复用放进同一张账。下方模型默认读取综合报价器的年度成本，也支持手动输入实施与运营参数。

:::sandbox { id: "power-platform-pricing-quote-tool-sandbox-3", title: "ROI 参数", canvas: false }
许可成本会跟随上方报价器自动更新；如需采用企业协议价，可直接覆盖该输入框。
:::

## #playbook 07 / Configuration Playbook :: 从试点到规模化的配置路径

方案对比、报价和 ROI 测算完成后，采购策略应按阶段滚动：先用最小可行组合验证业务价值，再沿着使用量增长曲线替换授权模型。

:::flow
1. **试点期（1-2 个场景）** — 以最小用户数购买 Premium 许可 + Pages Tier1，关注真实活跃用户和自动化触发次数。
2. **放大期（跨部门推广）** — 按实际活跃用户扩展 Premium 许可；无人值守流程独立购买 Process；门户按月峰值重算容量包。
3. **治理期（预算与性能联动）** — 把 Copilot Credits 预算、Power Platform Requests、Dataverse 容量拉进同一看板，用阈值预警驱动采购节奏。
:::

## #references 08 / References :: 参考与价格校验锚点

以下链接用于规则追溯和后续价格更新。建议每月校验一次，遇到大促或协议更新需即时刷新参数。

- [1] Microsoft Learn — https://learn.microsoft.com/power-platform/admin/powerapps-flow-licensing-faq | Power Platform licensing FAQs（Power Apps / Power Automate / Power Pages / Copilot Studio）[https://learn.microsoft.com/power-platform/admin/powerapps-flow-licensing-faq](https://learn.microsoft.com/power-platform/admin/powerapps-flow-licensing-faq)
- [2] Microsoft Learn — https://learn.microsoft.com/power-platform/admin/power-automate-licensing/types | Types of Power Automate licenses[https://learn.microsoft.com/power-platform/admin/power-automate-licensing/types](https://learn.microsoft.com/power-platform/admin/power-automate-licensing/types)
- [3] Microsoft Learn — https://learn.microsoft.com/microsoft-copilot-studio/billing-licensing | Copilot Studio licensing / billing / quotas[https://learn.microsoft.com/microsoft-copilot-studio/billing-licensing](https://learn.microsoft.com/microsoft-copilot-studio/billing-licensing)
- [4] Microsoft Learn — https://learn.microsoft.com/power-bi/fundamentals/service-features-license-type | Power BI license capability references（价格以 official pricing page 实时值为准）[https://learn.microsoft.com/power-bi/fundamentals/service-features-license-type](https://learn.microsoft.com/power-bi/fundamentals/service-features-license-type)
- [5] Microsoft Pricing — https://www.microsoft.com/power-platform/products/power-bi/pricing | Power BI Pricing[https://www.microsoft.com/power-platform/products/power-bi/pricing](https://www.microsoft.com/power-platform/products/power-bi/pricing)
- [6] Microsoft Learn — https://learn.microsoft.com/ai-builder/administer-licensing#aibuildercapabilityrate-table | AI Builder Capability Rate Table[https://learn.microsoft.com/ai-builder/administer-licensing](https://learn.microsoft.com/ai-builder/administer-licensing#aibuildercapabilityrate-table)
- [7] Microsoft Learn — https://learn.microsoft.com/microsoft-copilot-studio/requirements-messages-management | Copilot Studio Billing Rates and Management[https://learn.microsoft.com/microsoft-copilot-studio/requirements-messages-management](https://learn.microsoft.com/microsoft-copilot-studio/requirements-messages-management)
- [8] Microsoft Learn — https://learn.microsoft.com/microsoft-copilot-studio/agent-usage-estimator | Agent usage estimator（一方 Agent Credit 消耗速率口径）[https://learn.microsoft.com/microsoft-copilot-studio/agent-usage-estimator](https://learn.microsoft.com/microsoft-copilot-studio/agent-usage-estimator)
- [9] Microsoft — https://microsoft.github.io/copilot-studio-estimator/ | Copilot Credit Estimator（在线工具，含 SQA / ARA / SCA 等一方 Agent 速率）[https://microsoft.github.io/copilot-studio-estimator/](https://microsoft.github.io/copilot-studio-estimator/)

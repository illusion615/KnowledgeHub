# Power Platform 报价估算器 — Vibe Coding Prompt

> 将此提示词粘贴到 Power Apps Copilot / vibe coding 界面，即可快速生成同等功能的 Canvas App。

---

## Prompt

请帮我创建一个 **Power Platform 报价估算器** Canvas App，用于售前团队根据客户需求快速配置许可组合并生成报价单。以下是完整的功能规格和数据。

### 一、应用结构（4 个屏幕）

**Screen 1 — 计费模式概览**
展示 3 张信息卡片，横向一行排列：
1. **用户授权 (Per User)**：按人头预付年包。代表产品 Power Apps Premium $20/user/mo、Power Automate Premium $15/user/mo、Power BI Pro $10/user/mo。
2. **容量包 (Capacity Pack)**：按吞吐量预购共享使用。代表产品 Power Pages $200/100人包/mo、Copilot Studio $200/25k Credits/mo、AI Builder $500/1M Credits/mo、Power Automate Process $150/bot/mo。
3. **Pay-as-you-go**：先用后付 Azure 按量结算。代表产品 Power Apps $10/活跃用户/app/mo、Power Automate $0.60/cloud flow run、Power Pages $4/认证用户/mo、Copilot Credit $0.01/credit。

**Screen 2 — AI 能力试算表**
一个可编辑的表格，列包括：能力名称、计量单位、月用量（输入框）、Copilot Credit 费率、Copilot 小计、AI Builder Credit 费率、AI Builder 小计。

表格数据（按分组）：

| 分组 | 能力 | 单位 | Copilot Credit | AI Builder Credit |
|---|---|---|---|---|
| AI Builder — 文档与图像 | 发票/收据/身份证识别 | 1 页 | 8 | 32 |
| | 自定义文档处理 | 1 页 | 8 | 100 |
| | 文字识别 OCR | 1 页 | 0.1 | 3 |
| | 图像描述/合同处理 | 1 图 | 8 | 32 |
| | 目标检测 | 1 图 | 8 | 8 |
| AI Builder — Prompt 与文本 | Prompt（基础模型）| 1k tokens | 0.1 | 1.2 |
| | Prompt（标准模型）| 1k tokens | 1.5 | 24 |
| | Prompt（高级推理模型）| 1k tokens | 10 | 182 |
| | 情感/关键词/语言检测 | 1k 字符 | 0.1 | 2 |
| | 实体提取/分类 | 1k 字符 | 1.5 | 20 |
| Copilot Studio — Agent 动作 | 经典回答（手动编排）| 1 次 | 1 | - |
| | 生成式回答（RAG/GenAI）| 1 次 | 2 | - |
| | Agent Action（触发/推理/跳转）| 1 次 | 5 | - |
| | Tenant Graph Grounding | 1 次 | 10 | - |
| | Agent Flow Actions | 100 次 | 13 | - |
| Copilot Studio — AI Tools | AI Tools — 文本/生成式（基础）| 10 次 | 1 | - |
| | AI Tools — 文本/生成式（标准）| 10 次 | 15 | - |
| | AI Tools — 文本/生成式（高级推理）| 10 次 | 100 | - |
| | 内容处理工具 | 1 页 | 8 | - |

业务逻辑：
- 用户输入月用量后，自动计算：Copilot 小计 = ROUNDUP(月用量 × Copilot Credit 费率)，AI Builder 小计 = ROUNDUP(月用量 × AI Builder Credit 费率)。
- 表尾显示 Copilot Credits 合计和 AI Builder Credits 合计。
- 提供"AI 预估维度"切换（Radio：Copilot Credit / AI Builder Credit）：
  - 选 Copilot Credit → 所有能力统一计入 Copilot Credits 合计。
  - 选 AI Builder Credit → 同时有两种费率的能力仅计入 AI Builder Credits 合计；仅有 Copilot Credit 的能力仍计入 Copilot Credits 合计。

**Screen 3 — 综合报价器**
左侧为需求参数输入区（所有默认值为 0）：
- Power Apps：Premium 用户数
- Power Automate：Premium 用户数、Process (Bot) 数
- Power Pages：认证用户/月、匿名用户/月
- Power BI：Pro 用户数、PPU 用户数
- Dataverse 额外存储：额外 Database (GB)、额外 File (GB)、额外 Log (GB)
- AI 预估维度（同 Screen 2 联动）

右侧为自动计算的配置表，列包括：产品、数量、单价 (USD)（可编辑）、月成本、年成本。

阶梯定价逻辑：
- **Power Apps Premium**：< 2000 用户 → $20/user；≥ 2000 用户 → $12/user。
- **Power Pages Authenticated**：T1 $200/包（< 100包），T2 $75/包（≥ 100包），T3 $50/包（≥ 1000包）。每包 100 用户。自动选择总成本最低的阶梯。
- **Power Pages Anonymous**：T1 $75/包（< 20包），T2 $37.5/包（≥ 20包），T3 $25/包（≥ 200包）。每包 500 用户。自动选择总成本最低的阶梯。
- **Copilot Studio**：$200/包，每包 25,000 Credits。从 Screen 2 的 Copilot Credits 合计自动带入。
- **AI Builder**：T1 $500/包（< 5包），T2 $475/包（≥ 5包），T3 $450/包（≥ 10包）。每包 1,000,000 Credits。从 Screen 2 的 AI Builder Credits 合计自动带入。
- **Power BI Pro**：$10/user，**PPU**：$20/user。
- **Dataverse**：DB $40/GB、File $2/GB、Log $10/GB。

Dataverse 附带容量自动计算（显示在配置表上方）：
- 每位 Power Apps Premium 用户附带 250 MB DB + 2 GB File
- 每位 Power Automate Premium 用户附带 250 MB DB + 2 GB File
- Copilot Studio 租户许可附带 5 GB DB + 20 GB File + 2 GB Log（当 Credits > 0 时）
- 默认环境另有独立配额（3 GB DB + 3 GB File + 1 GB Log），不计入池。

产品配置建议区：
- 仅显示配置表中有数量的产品的建议。
- 说明当前适用的阶梯等级和单价。
- 配置表无内容时隐藏建议区。

按钮：
- "生成报价" → 导出 CSV（UTF-8 BOM），内容包含报价明细（含年成本）、AI 试算明细、Dataverse 容量、配置建议、免责声明。
- "重置" → 所有输入归零。

**Screen 4 — 配置策略（只读参考）**
分 4 个阶段的滚动列表：
1. 试点期（1-2 个场景）：以最小用户数购买 Premium + Pages T1。
2. 扩展期（跨部门推广）：按活跃用户增长调整许可规模，增加 Process bot。
3. 规模化（全组织覆盖）：评估 Pages 阶梯升级、Copilot Credits 预留缓冲。
4. 治理期（优化与续订）：复核使用率，清理闲置许可，滚动续订。

### 二、Token 折算参考数据（显示在 Screen 2 下方）

| 处理对象 | 中文 (tokens) | 英文 (tokens) |
|---|---|---|
| 一封邮件摘要/分类 | 0.8k–1.5k | 0.5k–1k |
| 一页合同/文档摘要 | 1.5k–2.5k | 0.8k–1.5k |
| 一条客服对话（单轮）| 0.3k–0.8k | 0.2k–0.5k |
| 一份表单字段提取 | 0.5k–1k | 0.3k–0.8k |
| 一段文本翻译（500字）| 1.5k–2k | 1k–1.5k |
| 一篇报告生成（1000字）| 2.5k–4k | 1.5k–2.5k |

### 三、设计要求
- 现代简洁 UI，深色/浅色主题支持
- 所有输入值变化后实时计算，无需手动点击计算
- 单价列可直接编辑以匹配企业协议价
- 零数量产品不显示在配置表中
- CSV 导出文件名格式：`Power-Platform-Quote-YYYY-MM-DD.csv`
- 免责声明：「本报价仅供预算参考，实际价格以微软官方报价或企业协议为准。」

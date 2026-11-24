---
title: 多智能体蜂群协作
eyebrow: Multi-Agent Engineering, Not Agent Theater
brand: 智能体工程
date: 2026-11-02
strict_i18n: false
strict_density: true
lead: 蜂群不是“多开几个聊天窗口”。它是一套把任务分解、上下文边界、权限、写入权、预算和验收条件显式化的分布式工程方法。默认从单 Agent 起步，只在并行收益可证明时升级。
hero_actions:
  - "先做选型判断 | #choice"
  - "看完整案例 | #case"
panel_label: 一句话架构
panel_title: 中心协调，边界自治，产物共享，门禁交付
metrics:
  - "研究场景内部评测 | +90.2% | Anthropic 多 Agent 相对单 Agent；仅限其内部研究评测。"
  - "Token 量级 | ≈15× | 多 Agent 相对普通聊天交互，不是免费增益。"
  - "失败分类 | 14 | MAST 从 7 个框架、1600+ 轨迹归纳的失败模式。"
style:
  accent: "#6366f1"
---

## #choice 01 / Start With The Decision :: 先问“为什么不能一个 Agent 做完？”

Anthropic 的基础建议是寻找最简单可行方案：确定路径的任务优先 workflow，需要模型动态决定过程时才使用 agent。多智能体则应再多跨过一道门槛——任务必须可拆、可并行、可独立验证，而且价值足以覆盖额外成本。[1]

:::callout { title: "✓" }
默认判断如果一个强模型、清晰工具和一次审阅已经能稳定完成，就不要组蜂群。多 Agent 的目标不是角色扮演，而是获得独立上下文、并行吞吐、专业权限边界或无锚定复核。
:::

:::insight-grid { cols: 4 }
::card LEVEL 0
### 单次调用
分类、抽取、改写。输入输出明确，不需要工具循环。

::card LEVEL 1
### 确定性工作流
步骤已知，代码负责路由、重试、超时与状态推进。

::card LEVEL 2
### 单 Agent
需要动态选工具和调整计划，但共享上下文仍可控。

::card LEVEL 3
### 受控多 Agent
存在真正并行子任务、专业边界或独立审阅，且有硬门禁。
:::

:::comparison
::versus 方案 1 || Option 1 { highlight: true }
### 适合升级
- 广度优先检索，可切成互不依赖的主题。
- 多个专业判断可并行，最终由一位整合者裁决。
- 每个分支都有独立验收条件和可保存产物。
- 任务价值高，延迟或 token 增长仍有正向 ROI。

::versus 方案 2 || Option 2
### 不适合升级
- 步骤强耦合，后一步必须看到全部前序细节。
- 多人必须同时修改同一文件或共享可变状态。
- 没有自动测试、证据要求或人工审批标准。
- 只是希望“多投票自然更聪明”，却没有视角差异。
:::

## #patterns 02 / Pick A Topology :: 不要先选框架，先选控制权

Azure Architecture Center 将常见编排归纳为 Sequential、Concurrent、Handoff、Group Chat 与 Magentic。OpenAI Agents SDK 则把常用多 Agent 关系压缩为“manager 把专家当工具调用”和“handoff 转交控制权”。这些名称不同，但关键问题相同：谁持有计划、谁持有最终答案、状态在哪里。[3][4]

Topology Decision Matrix

### 按控制需求选择，而不是按“自治感”选择

| 模式 | 控制权 | 最适合 | 主要风险 |
| --- | --- | --- | --- |
| Sequential | 代码预定义顺序 | 审稿、转换、合规检查流水线 | 早期错误逐级放大 |
| Concurrent | 协调器分发并汇总 | 独立研究、并行审阅、多方案比较 | 重复劳动、合并冲突 |
| Agents as tools | manager 始终持有会话 | 统一口径、集中 guardrail、最终答案单一 | manager 上下文和判断成为瓶颈 |
| Handoff | 当前 Agent 转交给专家 | 客服分诊、领域接力、长期会话 | 上下文泄漏、责任边界模糊 |
| Group chat | 聊天管理器协调讨论 | 需要互相质询的方案评审 | 回声室、循环、成本不可控 |
| Magentic / Planner | 模型动态重规划 | 开放式、路径未知、工具丰富的问题 | 最难测试、审计与预测预算 |

:::callout { title: "行业趋势：" }
openai/swarm [2][3]
:::

## #case 03 / One Case, End To End :: 案例：企业技术选型研究如何分工

目标：两天内给出“客服自动化平台”的选型建议。不是让四个 Agent 各写一份报告，而是让它们围绕同一验收契约产生可合并 artifact。

:::flow
1. **协调器定义问题** — 01 CONTRACT；候选范围、评分维度、截止时间、预算和证据等级。
2. **三个只读研究分支** — 02 PARALLEL；产品能力、成本运维、安全合规分别核验原始来源。
3. **写结构化产物** — 03 ARTIFACT；每组提交证据表、风险、未知项和来源链接，不回传长对话。
4. **单一写者整合** — 04 SYNTHESIS；一位作者拥有正文写入权，处理冲突并标注推论。
5. **独立审阅与门禁** — 05 GATE；新上下文审阅证据覆盖、预算一致性和反例，再由人批准。
:::

:::insight-grid { cols: 3 }
::card 01
### 共享契约，不共享全部历史
共享任务 ID、schema、来源等级和完成定义；原始页面与大表存 artifact，只返回路径和摘要。

::card 02
### 单写者，不共享可变正文
研究者只写各自目录。最终报告、评分矩阵和决策记录各有唯一 owner。

::card 03
### 审阅者必须“新鲜”
不要让原作者自我投票。独立审阅者只看交付物、证据和验收标准，降低锚定。
:::

Artifact Contract

### 每个分支只需返回这六项

```
{
  "task_id": "security-review",
  "status": "done | blocked | partial",
  "claims": [{"text": "...", "evidence": "primary | secondary"}],
  "artifacts": ["authoring/security-evidence.md"],
  "risks": ["..."],
  "next_action": "accept | verify | escalate"
}
```

Anthropic 的多 Agent 研究系统也建议让子 Agent 把输出持久化到外部系统，再向协调器返回轻量引用，以减少上下文溢出和“传话游戏”。[5]

## #economics 04 / Economics, Failure And Recovery :: 质量提升常常来自更多计算，不是群体魔法

Anthropic 报告中，普通 agent 约使用聊天交互 4 倍 token，多 Agent 约 15 倍；其 BrowseComp 分析中，token usage 单项解释 80% 的性能方差。这说明预算本身就是架构变量。[5]

### 相对 Token 使用量

Chat

1×

Agent

4×

Multi-Agent

15×

厂商生产数据的约数，只用于量级感知，不代表所有模型与任务。

Budget Formula

### 把预算写进任务契约

**总成本 ≈ 分支数 × 每分支轮数 × 单轮 token + 工具/API + 审阅与重试。**

- 先设总预算，再分配分支预算，不允许无限续杯。
- 对低价值分支使用较小模型；最终整合和高风险审阅再升级。
- 预算到 70% 时触发摘要，90% 时停止新增分支，只完成已有交付。
- 比较“每个被接受结论的成本”，而非只看单次调用价格。

:::comparison
::versus 系统设计问题
### 角色多，责任空
任务边界重叠、工具配置错误、没有全局终止条件。修复方式是重写 DAG、schema 和 hard limit。

::versus Agent 间失调
### 信息到了，含义丢了
错误转述、忽略同伴结果、循环委派。修复方式是 artifact 引用、版本号、去重键和最大委派深度。

::versus 任务验证缺失
### 完成了，但不可交付
没有测试、来源或人工门禁。修复方式是把验收器作为流程节点，而不是提示词尾注。
:::

:::callout { title: "关键洞察 || Key Insight" }
[6]
:::

Partial Recovery

### 失败时只重跑未通过的节点

:::flow
1. **检查点** — **检查点**每个节点保存输入版本、输出 artifact、模型、工具调用和验收结果。
2. **隔离** — **隔离**失败节点不得覆盖已验收产物；写入使用临时路径，验收通过后再提升为正式版本。
3. **恢复** — **恢复**优先重试单节点；输入已变化才重跑下游；权限或证据不足则升级人工，不让 Agent 自行放宽规则。
:::

## #delivery 05 / Minimum Production Loop :: 最小可落地闭环：先做到 8 件事

一个可靠的三 Agent 系统，通常胜过一个没有边界的三十 Agent 群聊。以下清单应在扩大规模前全部可回答。

:::insight-grid { cols: 2 }
::card 01
### 任务可拆

::card 02
### 角色可删

::card 03
### 状态外置

::card 04
### 权限最小

::card 05
### 单写者

::card 06
### 预算有闸

::card 07
### 验证独立

::card 08
### 恢复局部
:::

:::callout { title: "→" }
推荐的第一次试点**1 个协调器 + 2 个只读专家 + 1 个独立审阅节点**。选择高价值、可并行、可验证且无生产写权限的任务；连续记录单 Agent 基线、质量、延迟、token、人工返工和失败恢复成本。只有数据证明净收益，才增加角色或自治程度。
:::

## #references 06 / References & Evidence Boundary :: 已核验的关键来源

本文刻意只使用少量支撑主干的原始来源。定量结论均标明适用边界；示意图、选型矩阵与落地清单属于基于来源的工程综合，不是厂商原话。

- [1] Anthropic. — https://www.anthropic.com/engineering/building-effective-agents | 最简单方案优先；workflow 与 agent 的架构区分。
- [2] OpenAI. — https://github.com/openai/swarm | 官方 README 明确建议生产场景迁移至 Agents SDK。
- [3] OpenAI. — https://openai.github.io/openai-agents-python/multi_agent/ | Agents as tools 与 handoffs 两类常用关系。
- [4] Microsoft Azure Architecture Center. — https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns | Sequential、Concurrent、Handoff、Group chat、Magentic。
- [5] Anthropic. — https://www.anthropic.com/engineering/built-multi-agent-research-system | 内部研究评测、token 经济性、artifact 传递；不可外推为通用收益。
- [6] Cemri et al. — https://arxiv.org/abs/2503.13657 | MAST 数据集与 14 种失败模式、3 大类别。

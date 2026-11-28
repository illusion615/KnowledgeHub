---
title: GitHub Copilot 模型基准评测：GPT 5.6 Sol、Gemini 3.1 Pro、Grok 4.6
eyebrow: Copilot CLI Benchmark v1 · 2026-08-25
brand: Vibe Coding
date: 2026-08-25
strict_i18n: false
strict_density: true
lead: 通过 CLI 精确指定模型，在相同 prompt、fixture、工具权限和锁定源码下各运行两次。代码与长程实现使用隐藏测试，架构与 4,489 行代码审查由三模型匿名盲评；速度由 CLI JSON 事件计算。
hero_actions:
  - "查看排名 | #verdict"
  - "分场景推荐 | #scenarios"
panel_label: 结论
panel_title: Grok 4.6 综合 99.0 分居首；GPT 5.6 Sol 质量并列第一，但完整 agent 耗时更长。
panel:
  - Grok：质量 94/95，agent 中位耗时 9.55 分钟，综合第一。
  - GPT：质量 94/95，两轮均满自动测试，耗时波动较大。
  - Gemini：TTFT 最短，但两轮质量 79 与 45，稳定性不足。
  - DeepSeek：当前 Copilot CLI 服务端拒绝该模型 ID，不生成伪结果。
metrics:
  - "正式运行 | 6 次 | 3 模型 × 2 轮"
  - "隐藏断言 | 22 项 | deepMerge 12 + scheduler 10"
  - "匿名评分 | 3 judges | 每份答案取中位数"
  - "源码规模 | 4,489 行 | 完整 presentation runtime"
style:
  accent: "#f59e0b"
---

## #verdict 01 / Verdict :: Grok 4.6 以速度优势赢得综合第一

质量分满分 95，速度满分 5。质量取两轮平均；速度按 agent 中位耗时相对最快模型折算。

| 排名 | 模型 | 代码 /25 | 架构 /20 | 长上下文 /25 | 长程执行 /25 | 速度 /5 | 综合 /100 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Grok 4.6** | 25.0 | 19.0 | 25.0 | 25.0 | 5.0 | **99.0** |
| 2 | **GPT 5.6 Sol** | 25.0 | 19.0 | 25.0 | 25.0 | 3.7 | **97.7** |
| 3 | **Gemini 3.1 Pro Preview** | 12.5 | 12.5 | 13.0 | 24.0 | 4.5 | **66.5** |
| — | DeepSeek V4 Pro | 当前 Copilot CLI 1.0.80 / 账户 entitlement 不可用 |   |   |   |   |   |

**DeepSeek 说明：**`copilot --model deepseek-v4-pro` 返回 Model ... is not available，CLI 日志显示随后会 fallback 到 GPT 5.6 Sol。为避免把 GPT 输出冒充 DeepSeek，本文不填写 DeepSeek 分数。

## #protocol 02 / Protocol :: 固定协议把模型能力与测试过程分开

协议在正式运行前冻结；每轮创建全新 CLI 会话与隔离目录，关闭项目 custom instructions 和内置 MCP，不复用其他模型答案。

可执行正确性 · 25 分

12 组隐藏断言检查数组、递归合并、不可变性、Date、null prototype 与

__proto__

安全。

架构推理 · 20 分

多租户实时协作系统，覆盖 CRDT/OT、1,000 并发、200 ms SLO、隔离、故障与权衡；三 judge 匿名评分。

长上下文 · 25 分

阅读完整 4,489 行 runtime，提交恰好三个可复现 bug；误报直接失分，三 judge 对照源码验证。

长程执行 · 25 分

实现无依赖任务调度器。10 组隐藏测试覆盖并发 claim、租约回收、退避、幂等、快照隔离与循环输入。

速度 · 5 分

TTFT：

model.call_start

到首 assistant/tool 事件；agent duration：用户消息到最后

assistant.turn_end

。

## #quality 03 / Quality :: GPT 与 Grok 在四项质量任务上并列

两者每轮均得 94/95：代码与 scheduler 隐藏测试全过，架构 19/20，长上下文 25/25。架构 judge 区间均为 16–20 或 19–20，长上下文基本一致满分。

### Grok 4.6

94 / 95

代码

25

架构

19

长上下文

25

长程执行

25

两轮代码 12/12、scheduler 10/10；长上下文三 judge 均给 25。

### GPT 5.6 Sol

94 / 95

代码

25

架构

19

长上下文

25

长程执行

25

两轮自动测试全过；第二轮长上下文 judge 区间为 22–25，中位数仍为 25。

### Gemini 3.1 Pro Preview

62 / 95

代码

12.5

架构

12.5

长上下文

13

长程执行

24

第二轮把函数导出为对象，违反指定接口，代码隐藏测试 0/12；scheduler 漏验循环 payload，9/10。

## #stability 04 / Stability :: 两轮重复测试揭示 Gemini 的质量波动

平均分不足以描述 agent。本文同时报告最低轮与两轮差值：GPT、Grok 均为 94 / 94；Gemini 为 79 / 45。

| 模型 | Run 1 | Run 2 | 最低轮 | 波动 | 平均模型调用 | 平均工具执行 |
| --- | --- | --- | --- | --- | --- | --- |
| **Grok 4.6** | 94 | 94 | 94 | 0 | 18 | 46 |
| **GPT 5.6 Sol** | 94 | 94 | 94 | 0 | 14.5 | 33.5 |
| **Gemini 3.1 Pro Preview** | 79 | 45 | 45 | 34 | 59 | 58 |

**稳定性判读：**Gemini 第一轮用了 92 次模型调用并完成全部自动测试；第二轮降至 26 次调用但漏掉接口和循环输入。更短的执行链没有换来同等质量，说明在复杂长程任务上需要更强的验收门禁。

## #speed 05 / Speed :: Gemini 首次响应最快，Grok 完整交付最快

每个模型两轮取中位数。TTFT 衡量首次可见反馈；agent duration 衡量从收到任务到最终完成的端到端时间。

| 模型 | TTFT 中位数 | Agent 中位耗时 | 进程中位耗时 | 速度分 /5 |
| --- | --- | --- | --- | --- |
| **Grok 4.6** | 7.54 秒 | 9.55 分钟 | 9.65 分钟 | **5.0** |
| **GPT 5.6 Sol** | 15.35 秒 | 12.80 分钟 | 12.94 分钟 | 3.7 |
| **Gemini 3.1 Pro Preview** | **4.54 秒** | 10.62 分钟 | 10.77 分钟 | 4.5 |

**不要只看 TTFT：**Gemini 最快开始回复，但最终质量最低。GPT run 1 为 6.2 分钟、run 2 为 19.4 分钟，服务与执行路径波动显著；Grok 两轮为 10.4 与 8.7 分钟。

## #scenarios 06 / Scenario Recommendations :: 场景推荐：默认选 Grok，质量敏感场景可选 GPT

推荐使用透明权重计算；分数只适用于本次 CLI 任务组合，不外推到补全、视觉或通用问答。

:::insight-grid { cols: 3 }
::card 01
### 日常编码
**Grok 4.6 · 100.0**

代码正确性、长程执行与速度同时领先；GPT 94.8 居次。

::card 02
### 快速原型
**Grok 4.6 · 100.0**

完整交付中位耗时最短；不要因 Gemini TTFT 最快就忽略其质量波动。

::card 03
### 系统架构
**GPT / Grok · 97.3 并列**

两者架构中位分相同；偏交付速度选 Grok，偏少工具轮次选 GPT。

::card 04
### 大型代码库
**GPT / Grok · 100.0 并列**

两者长上下文两轮均 25/25；GPT 工具调用更少，Grok 总耗时更短。

::card 05
### 复杂长程交付
**GPT / Grok · 99.3 并列**

两轮质量与最低轮一致；优先按团队对速度、调用次数和输出风格的偏好选择。
:::

## #limits 07 / Evidence & Limits :: 结果可复算，但不能替代更大样本

协议、prompt、评分细则与调度器规格归拢于 `posts/copilot-model-benchmark/docs/`，执行脚本、隐藏 grader、脱敏 run 元数据、三 judge JSON 与聚合器位于 `tests/copilot-model-benchmark/`。原始 CLI 事件不入库，以避免保存 prompt 和工具细节。

1. **样本量：**每模型两轮，只能识别明显波动；发布级结论应扩展到至少 5–10 轮。
2. **judge 分歧：**Gemini 长上下文答案的单轮 judge 区间达到 9–25；中位数降低单点评分偏差，但不能消除主观性。
3. **速度口径：**agent duration 包含服务负载、模型调用、工具执行与修复，不是纯 token 生成速度。
4. **DeepSeek 缺席：**当前账户/CLI 不提供该模型。获得 entitlement 后可用同一冻结协议补跑，不能用 fallback 结果补位。
5. **版本边界：**结果对应 Copilot CLI 1.0.80 和 2026-08-25 可用模型，后续模型更新需要重新执行。

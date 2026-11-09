# 阶段进度

## 2026-11-02｜关键来源核验完成

仅抽查文章主干所需的 5 组原始来源，未批量继承原台账声明：

1. Anthropic《Building effective agents》：确认“从最简单方案开始”、workflow 与 agent 的架构区分，以及复杂度会交换成本和延迟。
2. Anthropic《How we built our multi-agent research system》：确认内部研究评测 +90.2%、约 15× chat token、BrowseComp 中 token usage 单项解释 80% 方差，以及 artifact/文件引用减少传话失真。上述数字仅按厂商内部研究场景引用，不外推为通用收益。
3. OpenAI `openai/swarm` README：确认 Swarm 是 experimental/educational，已由生产级 Agents SDK 取代；Agents SDK 官方文档确认 manager 调用 specialist（agents as tools）与 handoff 两类常用模式。
4. Microsoft Azure Architecture Center：确认 Sequential、Concurrent、Handoff、Group chat、Magentic 五类编排模式。
5. MAST（arXiv:2503.13657）：确认 1600+ traces、7 frameworks、人工分析 150 traces、κ=0.88、14 modes / 3 categories。

正文策略：围绕“企业技术选型研究”单一案例，写成总览→模式选择→artifact 流程→权限/单写者→成本失败→最小清单；不采用尚未复核的 2026 新论文百分比与版本声明。

## 2026-11-02｜正文与预览验收完成

- 已创建 `posts/multi-agent-swarm-practices/index.html`：5 个主体章节、模式选型表、artifact 流程图、token 量级图、MAST 失败分类与 8 项落地清单。
- 已给旧 `source-ledger.md`、`claim-source-map.md` 增加“前序未核定草稿”状态说明，保留原材料但阻止误用。
- 静态检查：HTML 可解析；12 个 ID 无重复；站内锚点无缺失；`git diff --check` 通过。
- 独立预览：`http://127.0.0.1:4173/posts/multi-agent-swarm-practices/`，由 Orca 确认端口归属当前 worktree。
- 真实浏览器：桌面与 iPhone 15 视口均无横向溢出；明暗主题可读；`lang=zh-CN`；全部 6 个 reveal 区块可见；控制台与网络请求无错误；移动导航可展开/收起。
- 当前未提交、未推送。等待用户集中确认后再进入目录登记、合并或发布阶段。

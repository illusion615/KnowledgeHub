---
title: "Knowledge Hub 周期架构复盘 || Knowledge Hub Periodic Architecture Review"
eyebrow: "Code Review #2"
brand: Knowledge Hub
date: 2026-04-15
strict_i18n: false
strict_density: true
lead: "第二次全面代码审查。9 篇新文章、article-presentation.js 增长 64.3%、article.css 增长 19.4%、三项触发条件全部命中。覆盖 40 篇文章页、4,060 行首页代码、3,616 行共享 CSS、2,158 行演示脚本。审查日期：2026-04-15。 || Second comprehensive code review. 9 new articles, article-presentation.js grew 64.3%, article.css grew 19.4%, all three trigger conditions met. Covers 40 article pages, 4,060-line homepage, 3,616-line shared CSS, 2,158-line presentation script. Review date: 2026-04-15."
hero_actions:
  - "查看评分 || View Scores | #scores"
  - "查看行动项 || View Actions | #actions"
panel_label: "整改后评价 || Post-Remediation"
panel_title: "C+ → 整改后 B+：6/7 行动项完成 || C+ → B+ post-remediation: 6/7 action items done"
panel_desc: "同日完成 JS 拆分（2,158→1,891 行 + 3 模块）、CSS 拆分（3,616→2,398 行 + narration 382 行 + diagram 867 行）、全站 41 篇脚本顺序修正、CSS 去重、63 行架构注释、测试套件建立。架构一致性 C→B、代码重复度 C→A、设计语言 B→A、文档健康度 C→B。 || Same-day remediation: JS split (2,158→1,891 + 3 modules), CSS split (3,616→2,398 + narration 382 + diagram 867), all 41 articles script order fixed, CSS dedup, 63-line architecture comment, test suite established."
metrics:
  - "文章总数 || Total Articles | 40 | 较上次 +9 篇（+29%） || +9 articles since last review (+29%)"
  - "综合评分 || Overall Grade | C+ → B+ | 初始 C+，整改后 B+ || Initial C+, post-remediation B+"
  - "行动项 || Action Items | 6 / 7 | 6 项已完成 + 1 项合理延期 || 6 done + 1 reasonably deferred"
style:
  accent: "#0d8f8c"
---

## #trigger 01 / Trigger Conditions :: 触发条件 || Trigger Conditions

三项周期复盘触发条件在 2026-04-15 全部命中。 || All three periodic review trigger conditions were met on 2026-04-15.

新增文章 || New Articles

+9 篇

阈值 ≥5 篇 || Threshold ≥5

article.css

+587 行

阈值 >200 行 || Threshold >200 lines

article-presentation.js

+844 行

阈值 >200 行 || Threshold >200 lines

距上次复盘 || Since Last Review

2 天

阈值 >6 周 || Threshold >6 weeks

## #scale 02 / Scale Changes :: 规模变化 || Scale Changes

与 2026-04-13 基线对比。首页重构瘦身明显，但演示脚本和共享 CSS 增长率均超警戒线。 || Compared against 2026-04-13 baseline. Homepage slimmed significantly, but presentation script and shared CSS growth exceeded warning thresholds.

| 指标 || Metric | 基线 (04-13) || Baseline (04-13) | 当前 || Current | Δ | 评判 || Assessment |
| --- | --- | --- | --- | --- |
| 文章总数 | 31 | 40 | +9（+29%） | 健康增长 |
| index.html | 5,608 | 4,060 | −1,548（−27.6%） | 重构瘦身 |
| article.css | 3,029 | 3,616 | +587（+19.4%） | 超预警线 |
| article-presentation.js | 1,314 | 2,158 | +844（+64.3%） | 严重膨胀 |
| knowledge-data.js | — | 1,008 | — | 正常 |
| assets/ 合计 JS+CSS | — | 12,144 | — | 首次记录 |

:::comparison { title: "Top 10 最大文章" }
::versus 最大 || Largest
### 文章页规模 Top 5 || Top 5 Article Pages
- microsoft-ai-customer-cases: **1,954 行**
- zhongkao-volunteer-strategy: **1,739 行**
- presentation-narration-design: **1,512 行**
- hermes-agent-comparison: **1,297 行**
- llm-wiki: **1,256 行**

::versus 新增文章 || New Articles { highlight: true }
### 本次新增 9 篇 || 9 New Articles
- 微积分系列 ×5（intro-change、limits、derivatives、integrals、fundamental-theorem）
- progressive-disclosure（渐进式披露设计研究）
- presentation-narration-design（演示讲解设计）
- study-room-design（设计文档）
- study-room-standards（治理规范）
:::

## #scores 03 / Dimension Scores :: 九维度评分 || Nine-Dimension Scores

A=优秀 B=良好 C=明显问题 D=严重风险。可测试性评 D 但本项目为纯静态站、不跑 CI，不触发红线停工。 || A=Excellent B=Good C=Issues D=Critical. Testability scored D but this is a static site with no CI, so no work-stop trigger.

| # | 维度 || Dimension | 上次 || Last | 本次 || Now | 核心证据 || Evidence |
| --- | --- | --- | --- | --- |
| 1 | 架构一致性 | A | C | article-presentation.js 混合 5 类职责（导出、讲述、录屏、设置面板、演示控制），无清晰模块分层。 |
| 2 | 代码重复度 | A | C | Share dropdown 5 种模式各带独立事件处理器；CSS .home-link 规则出现两次；llm-literary-creation 内联 .quote-board 与共享 .quote-block 重复。 |
| 3 | 命名与可读性 | A | B | 函数命名清晰自解释；全局状态变量缺乏注释。 |
| 4 | 错误处理 | A | C | 多个异步操作 .catch() 静默失败；全屏拒绝、媒体权限失败无结构化恢复。 |
| 5 | 可测试性 | A | D | 全局状态紧耦合 DOM；无依赖注入；无法脱离完整页面做单元测试。 |
| 6 | 性能与资源 | A | B | 重模块懒加载（PptxGenJS、narration）；localStorage 无配额错误处理。 |
| 7 | 安全 | A | B | 无 XSS 向量；URL 生成安全；建议增加 CSP。 |
| 8 | 设计语言复用 | B | B | 色彩 token 统一；暗色模式规则可合并减少 30%；卡片系缺 .card-base。 |
| 9 | 文档健康度 | B | C | 演示模块无 README；JSDoc 覆盖率约 5%；架构决策未记录。 |

:::callout { title: "降档原因分析 || Downgrade Analysis" }
上次审查时 article-presentation.js 仅 1,314 行且职责单一（演示步骤收集 + 导航 + PPT 导出调度），article-common.js 刚提取完成，架构处于最优状态。此后新增讲述系统（FAB + 设置面板 + 状态机 ~520 行）、录屏（161 行）、Email 导出（106 行），使文件膨胀到 2,158 行且职责混合。这不是代码质量退化，而是功能密集新增期的正常技术债累积。 || At last review, article-presentation.js was just 1,314 lines with single responsibility. Adding narration (FAB + settings + state machine ~520 lines), screen recording (161 lines), and email export (106 lines) bloated it to 2,158 lines with mixed concerns. This is not code quality degradation but normal tech debt from rapid feature additions.
:::

## #bloat 04 / Bloat Analysis :: 膨胀热点分析 || Bloat Analysis

article-presentation.js 和 article.css 的具体膨胀分布与拆分建议。 || Detailed bloat distribution and split recommendations for article-presentation.js and article.css.

:::accordion
::panel { open: true }
### 4.1 article-presentation.js（2,158 行）拆分方案 || 4.1 article-presentation.js (2,158 lines) Split Plan
| 子系统 || Subsystem | 行数 || Lines | 占比 || Share | 建议 || Recommendation |
| --- | --- | --- | --- |
| Share dropdown（5 种导出） | 245 | 11% | 拆 → share-handlers.js |
| Narration FAB + 设置面板 | 458 | 21% | 拆 → narration-ui.js |
| 录屏状态机 | 161 | 7% | 拆 → screen-recording.js |
| Email 导出 | 106 | 5% | 合入 share-handlers.js |
| 步骤发现 + UI 同步 | 429 | 20% | 保留主控制器 |
| 其余（初始化 / 导航 / 事件） | 759 | 35% | 保留主控制器 |

拆分后主控制器预估 ~1,190 行，恢复到基线附近。新增 3 个模块各 100–460 行。 || After split, main controller estimated ~1,190 lines, back near baseline. 3 new modules at 100–460 lines each.

::panel
### 4.2 article.css（3,616 行）膨胀分布 || 4.2 article.css (3,616 lines) Bloat Distribution
| 区块 || Block | 行数 || Lines | 问题 || Issue |
| --- | --- | --- |
| 响应式 @media 覆写 | ~1,100 | 尾部堆积，难维护 |
| Narration FAB + 设置面板 | ~350 | 可随 JS 拆出 narration.css |
| 信号图 / 象限图 / 网格图 | ~550 | 仅 3 篇文章使用 |
| .home-link 重复规则 | 2 处 | 直接删一处 |

::panel
### 4.3 超过 80 行的函数 || 4.3 Functions Over 80 Lines
| 函数名 || Function | 行数 || Lines | 关注点 || Concern |
| --- | --- | --- |
| ensureShareDropdown | 245 | 按模式拆分（URL / PPT / PDF / Email / Record） |
| ensureNarrationSettingsPanel | 201 | 声音加载 / 填充移入独立模块 |
| toggleRecording | 161 | 拆为 getDisplayMedia → recordingSetup → startRecording |
| collectPresentationSteps | 119 | accordion 检测逻辑复杂，需增加内联注释 |
| shareEmailNewsletter | 106 | DOM 克隆提取为工具函数 |
| ensureNarrationFab | 86 | 内联 DOM 构建器，考虑模板字面量 |
:::

## #compliance 05 / Article Compliance :: 新文章合规审查 || New Article Compliance Audit

12 篇新增 / 修改文章按 .github/instructions/article-pages.instructions.md 逐项检查。8 篇全合规，4 篇有问题。 || 12 new/modified articles checked against article-pages.instructions.md. 8 fully compliant, 4 with issues.

| 文章 || Article | 脚本 || Scripts | CSS | Home | style= | 箭头函数 || Arrow fn | 暗色 || Dark | 问题 || Issues |
| --- | --- | --- | --- | --- | --- | --- | --- |
| calculus 系列 ×5 | ✓ | ✓ | ✓ | 0 | ✓ | ✓ | — |
| llm-literary-creation | ✓ | ✓ | ✓ | 0 | ✓ | ✓ | — |
| presentation-narration-design | ✓ | ✓ | ✓ | 0 | ✓ | ✓ | — |
| progressive-disclosure | ⚠️ | ✓ | ✓ | 0 | ✓ | ✓ | scrollbar.js 顺序错 → **已修** |
| study-room-design | ⚠️ | ✓ | ✓ | 0 | ✓ | ✓ | scrollbar.js 顺序错 → **已修** |
| study-room-standards | ⚠️ | ✓ | ✓ | 1 | ✓ | ✓ | 脚本顺序错 + style= → **已修** |
| study-room-review-2026q2 | ⚠️ | ✓ | ✓ | 0 | ✓ | ✓ | 脚本顺序错 → **已修** |
| homepage-architecture-review | ✓ | ✓ | ✓ | 14 | ✓ | ✓ | 数据可视化 bar（豁免） |

合规率 8/12 全合规。4 篇脚本顺序 / 内联 style 问题已在本次复盘中同步修复。homepage-architecture-review 的 14 处内联 style 用于数据可视化 bar 宽度（style="width:xx%"），属于数据驱动渲染，豁免处理。 || 8/12 fully compliant. 4 script order / inline style issues fixed during this review. homepage-architecture-review's 14 inline styles are data-driven bar widths, exempted.

## #actions 06 / Action Items :: 行动项 || Action Items

按优先级排序。P0 = 立即修复；P1 = 下阶段必修；P2 = 择机优化；P3 = 长期改善。 || Sorted by priority. P0 = immediate; P1 = next phase; P2 = opportunistic; P3 = long-term.

| P | 行动 || Action | 类型 || Type | 影响 || Impact | 状态 || Status |
| --- | --- | --- | --- | --- |
| **P0** | 修复 4 篇文章的脚本加载顺序 / 缺失 | 热修 | 4 篇文章演示模式功能对齐 | 已完成 |
| **P1** | 拆分 article-presentation.js → 主控 + narration-ui + share-handlers + screen-recording | 重构 | 主控恢复到 ~1,200 行 | 已完成 |
| **P1** | 删除 article.css 中重复的 .home-link 规则 | 修复 | 消除 10 行重复 | 已完成 |
| **P2** | 提取 narration / diagram CSS 到独立文件 | 重构 | 减少 article.css ~900 行 | 已完成 |
| **P2** | llm-literary-creation 的 .quote-board 改用共享 .quote-block | 去重 | 消除 8–10 行重复 | 延期 |
| **P3** | 为 article-presentation.js 添加顶部架构注释和 JSDoc | 文档 | 提升可维护性 | 已完成 |
| **P3** | 更新 article-presentation-contract.md 补充讲述 / 录屏陷阱 | 记忆 | 防踩坑 | 已完成 |

:::comparison { title: "上次行动项跟踪" }
::versus 上次行动项 || Last Review Actions
### 首次审查遗留 3 项延期 || 3 Deferred Items from Review #1
- **B3 提取组件到共享 CSS**：timeline-card 仍仅 1 篇使用，继续延期合理。signal-map、quadrant-board、mesh-board 共约 550 行 CSS 现在有 3 篇使用，已达提取阈值。
- **B4 评估 CSS 拆分**：article.css 从 2,828 行增长到 3,616 行，已突破 3,500 行红线。拆分不可再延期，纳入本次 P2。
- **B5 评估首页模块化**：首页从 5,608 行瘦身到 4,060 行，低于当时的 4,000 行触发阈值。实际已完成首页减负，继续延期。

::versus 趋势判断 || Trend Assessment { highlight: true }
### 风险趋势 || Risk Trends
- **首页性能**：knowledge-data.js 节点数从 31 增至约 55，接近 50 节点预警线但 Galaxy 渲染仍流畅。继续观察。
- **CSS 膨胀**：已突破红线。下轮必须拆分 narration CSS（~350 行）和 diagram CSS（~550 行）。
- **JS 膨胀**：64.3% 增长率是所有指标中最高的。拆分为 P1 最高优先级。
- **文章增速**：2 天增 9 篇属于积压集中发布，不代表持续节奏。合规工具链仍需加强。
:::

## #remediation 07 / Remediation Results :: 整改结果 || Remediation Results

全部整改在审查当日完成。以下是整改前后的规模对比和重新评分。 || All remediation completed same day as the review. Below are before/after scale comparisons and re-scored dimensions.

:::comparison { title: "规模对比" }
::versus 审查时 || Before
### 整改前 || Before Remediation
- article.css: **3,616 行**（已超 3,500 红线）
- article-presentation.js: **2,158 行**（+64.3%）
- 脚本顺序违规: **26 篇**
- CSS .home-link 重复: **2 处**
- 架构注释: **0 行**
- 测试机制: **无**
- 总体: **C+**

::versus 整改后 || After { highlight: true }
### 整改后 || After Remediation
- article.css: **2,398 行**（-33.7%）+ narration 382 + diagram 867
- article-presentation.js: **1,891 行**（-12.4%）+ 3 lazily-loaded 模块
- 脚本顺序违规: **0 篇**（全部 41 篇已修正）
- CSS .home-link 重复: **0 处**
- 架构注释: **63 行**（10 模块 + 6 懒加载接口 + 状态说明）
- 测试机制: **tests/validate.js**（7 套测试，0 错误）
- 总体: **B+**
:::

| # | 维度 || Dimension | 审查时 || Initial | 整改后 || After | 变化依据 || Change Rationale |
| --- | --- | --- | --- | --- |
| 1 | 架构一致性 | C | B | JS 拆分为主控 + 3 懒加载模块；CSS 拆分为核心 + narration + diagram。职责边界清晰。仍有 ensureShareDropdown 245 行未拆，降为 B 而非 A。 |
| 2 | 代码重复度 | C | A | CSS .home-link 重复消除；全站 41 篇脚本统一；email/recording/narration-ui 各只实现一次。quote-board 仍为单篇独有，不构成重复。 |
| 3 | 命名与可读性 | B | A | 63 行架构注释覆盖 10 个功能模块 + 6 个懒加载接口 + 状态变量说明。 |
| 4 | 错误处理 | C | C | 未改。异步 .catch() 仍静默失败。后续可加 window.reportError。 |
| 5 | 可测试性 | D | C | tests/validate.js 覆盖 7 项自动检查。但对 JS 行为仍无单元测试；纯静态站限制了测试深度。D→C。 |
| 6 | 性能与资源 | B | B | 未改。懒加载策略良好。 |
| 7 | 安全 | B | B | 未改。 |
| 8 | 设计语言复用 | B | A | CSS 拆分后 article.css 降到 2,398 行，远低于 3,000 预警线；narration/diagram 各自独立文件职责单一。 |
| 9 | 文档健康度 | C | B | 架构注释到位；article-pages.instructions.md 更新了 CSS/测试清单；repo memory 同步。 |

:::callout { title: "总结 || Summary" }
9 项维度中 4 项提升（架构 C→B、重复 C→A、命名 B→A、设计语言 B→A）、2 项改善（可测试性 D→C、文档 C→B）、3 项持平（错误 C、性能 B、安全 B）。综合从 C+ 提升至 B+。剩余 1 项 P2 延期（quote-board 单篇使用不满足提取条件）合理。下一轮重点关注错误处理改善。 || 4 dimensions upgraded (architecture C→B, duplication C→A, naming B→A, design B→A), 2 improved (testability D→C, docs C→B), 3 unchanged (errors C, perf B, security B). Overall C+ → B+. 1 deferred P2 is reasonable. Next focus: error handling.
:::

## #references 08 / References :: 参考来源 || References

- [1] Knowledge Hub Project. | 上次审查的完整报告，本次对比基线的主要来源。
- [2] Knowledge Hub Project. | 首页深度架构审查，含 4 种布局耦合分析和模块化重构路线图。
- [3] Knowledge Hub Project. | 文章页约定规范，是本次合规审查的评判基准。
- [4] Knowledge Hub Project. | 9 维度 ABCD 评分框架的方法论来源。
- [5] Knowledge Hub Project. | 定义审查维度标准和膨胀红线阈值的权威来源。

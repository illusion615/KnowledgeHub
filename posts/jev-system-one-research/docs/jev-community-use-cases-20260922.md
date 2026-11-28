# Jev 社区场景核查：先证明增量价值，再增加 hybrid 层

核查日期：2026-09-22。范围：公开 README、官方 cookbook、下列指定源码；未安装社区项目、未执行其代码、未调用推理 API、未替换本地权重，也未更改现有演示。

## English summary

Community projects suggest replacing repeated semantic decisions, not putting a
classifier before every chat response. Useful hypotheses include context pruning,
DOM action selection, evidence routing, and LLM-authored frozen decision harnesses.
These are mostly integrations of hosted Jev, not evidence that our installed
NanoJev checkpoint transfers to those domains. The next experiment should isolate
model contribution against code/retrieval-only and optimized LLM baselines. A
failed capability preflight should stop UI work rather than trigger threshold
lowering or answer repair. None of the external measurements was independently
rerun here.

## 1. 为什么当前演示不能证明 hybrid 有益

- 售后：可靠分支的代码、模板和会话复用确实能省调用，但这些不一定需要 NanoJev。
- 当 Native 不确定并转 LLM 复核时，原本一次 LLM 能解决的问题多了一个阶段。
- 当前五次本地 FP32 开发探针的 53 个 Boolean 分数全部处于不确定区间；它们不能支持业务准确性主张。
- 坦克：已有小规模 held-out 结果中，纯搜索和搜索加 FP32 都为 6/6，模型改变的两次选择反而降低了对应结果的 HP。不能把程序搜索的胜利归给模型。
- 公平问题应当是“加入模型，比同样规则、缓存和检索的系统多获得什么”，而非“比故意让 LLM 做所有事情的系统快多少”。

这里的负面结果针对当前任务、输入和检查点，不等于 Jev 类型接口没有价值。

## 2. 实际社区项目及证据边界

### A. jev-pruner：减少后续上下文，而不是缩短回复内容

来源：[项目](https://github.com/tamaratran/jev-pruner)。
核查版本：`47d017c34eab7690b95f075ce6f4839247c5dc0a`。
阅读 README，检查 [`src/output.ts`](https://github.com/tamaratran/jev-pruner/blob/47d017c34eab7690b95f075ce6f4839247c5dc0a/src/output.ts)、`src/jev.ts`。

- Bash 完成后，对很长的工具输出分块，以 Noul 判断哪些原文仍与任务有关，再送给主 LLM。
- 源码有超过 10,000 **估算** token 才处理的门槛；并行评分，保留未完整评分的内容。
- README 明确保留原文归档、诊断和所需信息；不确定时保留，不是强行达到压缩比例；输出不是生成式摘要。
- 收益机制：一次筛选可能减少后续多个回合反复携带的噪声。小输出不值得付出筛选开销。
- 证据边界：作者提供真实会话测试和三个源码调查的配对测试入口，但明确不是一般任务准确性或总成本节省证明。本次没有运行这些测试。

### B. jev-browser：选择动作与生成文字分开

来源：[项目](https://github.com/jkudish/jev-browser)。
核查版本：`f731c7aa773f55a30dad7175bbb358b2d8529e57`。
阅读 README，检查 [`src/questions.ts`](https://github.com/jkudish/jev-browser/blob/f731c7aa773f55a30dad7175bbb358b2d8529e57/src/questions.ts)。

- 程序从 DOM 生成合法候选；每步主请求包含动作 Choice、目标是否完成 Noul、是否停滞 Noul。
- 需要输入搜索词或表单文本时才使用生成模型；原生下拉框另做候选选择。
- 收益机制：不再为每个点击/滚动生成完整推理与自然语言答案。重点是任务完成，而非聊天回复速度。
- 证据边界：README 的 Wikipedia 运行记录是作者展示的单次结果，不是与优化 LLM 浏览器的受控比较。它还有候选数、DOM 覆盖及输入降级边界。

### C. JevHarness：把大模型推理从运行期移到开发期

来源：[项目](https://github.com/TianyuCodings/JevHarness)。
核查版本：`34d5c9602f6f73792e2c625cc31dd9ed7b4f39b5`。
阅读 README，检查 [`auto_jev/runtime.py`](https://github.com/TianyuCodings/JevHarness/blob/34d5c9602f6f73792e2c625cc31dd9ed7b4f39b5/auto_jev/runtime.py)。

- LLM 编写任务特定的特征、问题、控制流和记忆；可根据轨迹与奖励在开发阶段修改。
- 固化后的运行时执行表达式/Python 节点和 Jev 判断；独立节点并发执行，不需要每步调用创作策略的大模型。
- 收益机制：将昂贵策略设计摊销到多次执行；代码处理可计算事实，模型只处理剩余的模糊判断。
- 证据边界：作者报告 Pokémon Eval 从 3/12 到 9/12，但 **Eval 参与候选选择**，不是独立 held-out 泛化结果；README 也明确没有对照“LLM 每步决策”的运行速度。该项目使用 Jev，不能当作本地 NanoJev 的验证。

### D. Jev Search：有些产品本来就不需要生成答案

来源：[项目](https://github.com/superagents-lab/jev-search)。
核查版本：`67027d0185a9b22eb2a178f0eb15250d12ddabe6`。
阅读 README，检查 [`src/lib/typesafe.ts`](https://github.com/superagents-lab/jev-search/blob/67027d0185a9b22eb2a178f0eb15250d12ddabe6/src/lib/typesafe.ts)。

- Jev 选择查询候选、来源、时间范围，并对搜索结果做相关性判断；搜索由 Search1API 执行。
- `rerank()` 对一批结果逐条提问，多个批次并发；最终呈现链接和摘要，没有生成式答案。
- 收益机制：让结构化判断直接驱动可操作 UI，而不是为了“智能”给每一步加聊天。
- 证据边界：排名分数不是核实后的正确率；源码中存在服务商失败切换等策略，不应不加区分地照搬进我们的无隐式切换实验。

补充：[Jev Review](https://github.com/devagrawal09/jev-review) 用风险筛查、证据选择和严重度评分组成评审流程。README 明确其发现是评审线索，不是缺陷证明，尚不集成生成式解释或静态分析器。不能把“存在项目”写成“代码评审质量已被验证”。

## 3. 官方食谱提供的可检验假设

- [Classifying RAG passages](https://docs.typesafe.ai/cookbooks/classifying_rag_passages)：对每个检索片段判断相关性、可用证据、是否反驳问题前提、是否含模型指令；代码分别组织支持证据与冲突证据，最终仍由一个 LLM 回答。该例是每片段一次请求、每请求多问题，**不是整个语料只做一次免费 forward**。过滤不是安全边界。
- [SDE cascade](https://docs.typesafe.ai/cookbooks/sde_cascade)：小模型抽取，Jev 按字段核对来源，只对被标记的项目升级大模型。100 条样本的成本/质量曲线是厂商内部结果，门槛做了扫描，不能直接当作我们的收益保证。
- [LangChain harness](https://www.langchain.com/blog/building-a-harness-with-jev)：展示模型路由与工具调用检查的集成方式；性能倍数仍来自厂商。工具安全不能单靠模型分数授权。

## 4. 对本项目的建议：先做“资料证据工作台”的能力预检

这是候选实验，尚未实现，也不是宣布一定有收益。

与继续修饰客服话术相比，Study Room 自身的文章、版本说明与参考资料更适合形成可追踪任务：

1. 用户提出研究问题，例如“MLX 权重发布是否意味着能直接接入现有推理服务？”
2. 相同的检索与去重代码产生一批带原文、来源和版本的短片段。
3. 判断层做窄任务：哪些片段提供直接证据，哪些构成反证，哪些只是同词不同义或过时条件。
4. UI 先显示可核对的证据卡；仅在需要综合解释时，让同一 LLM 生成带引用的回答。
5. 未确定的片段保留或标记待核对，原文可恢复；不能为了显示压缩比例而误删反证，也不能用评分器充当安全边界。

真正可见的收益应是证据质量、人工阅读负担或后续模型输入减少，而不是少说了几句话。本文不将“先显示一张卡”视为任务已解决。

### 预检与对照

- 从真实资料中人工标注一组查询/证据对，包含同义改写、否定、版本冲突、错误前提和无答案情况。金标准不进入模型输入。
- 分开测试官方 Jev 与本地 NanoJev。调用须另行授权、限额；不静默更换提供商或检查点。
- 先检查判断器是否能区分正反例，再在独立校准集确定门槛；冻结后评价 held-out 集。小样本只作为开发排错，不能作泛化证明。
- 三类基本对照：检索/去重＋同一 LLM；同样流程＋普通 reranker＋同一 LLM；同样流程＋Jev 判断＋同一 LLM。NanoJev 是独立的第四个实验条件，不与官方 Jev 混称。
- 同样的缓存、检索预算、工具接口和输出约束。不要故意给基线塞入全部无关全文，或强制基线每一步启动新 CLI。
- 记录证据召回与误删、反证保留、最终引用支持率、回答准确性、P50/P95、实际云端用量、本地计算及恢复全文/复核开销。缓存用量与价格口径须保留；不同模型 token 不能直接当美元相加。
- 若判断没有区分度、经常全保留/全升级，或在同等质量下不改善总资源/人工负担，就停用该层，而不是降低门槛或继续堆 UI。

当前 [NanoJev README](https://github.com/TianyuCodings/NanoJev) 已描述专门训练的四游戏统一模型。这说明领域与训练分布不能略过；它不是“任意售后/RAG 问题都可直接交给本地检查点”的证据。本次没有更新本地权重。

### 第二候选：只读浏览器资料收集

若优先展示可见的多步执行，而不是知识库整理，可借鉴 jev-browser：让 LLM
制定研究目标/必要的查询文本，Jev 根据当前页面候选选择导航动作，最后由 LLM
综合引用。比较真正找到的资料、完整任务成功率、无效操作、模型调用与总耗时。
优化 LLM 基线同样允许批量动作计划、缓存和相同 DOM 工具；不能人为规定它
每点一次按钮都必须重新推理。浏览器操作会引入网络与页面变化，需与证据筛选
实验分开，先用只读固定页面做能力预检。

JevHarness 的思路也可用于离线构造这类流程，但必须计入策略编写/优化成本，
并与同一流程的纯规则、无 Jev 和其他判断器版本比较，不能把作者 LLM 写出的
好代码带来的收益全部算到运行时 Jev 身上。

## 结论

最值得借鉴的是 **大量窄判断＋少量开放式生成**，或 **开发期 LLM 设计＋运行期固定流程**。是否采用 Jev/NanoJev，要看相对规则、检索和优化 LLM 的真实增量；没有增量时，保留简单系统就是正确结果。

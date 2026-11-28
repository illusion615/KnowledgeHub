# jiJev / NanoJev / Laya：访问渠道、能力差异与证据边界

核查日期：2026-09-22。只读取公开文档、源码和已公开结果，并重新计算统计。
未注册账号、充值、安装依赖、下载权重或发起新的模型推理；未运行社区评测脚本。

## English summary

Cloudflare now documents `typesafe/jev` at `/ai/models/typesafe/jev/`; earlier
Workers AI documentation paths returned 404. Its managed-credential Unified
Billing path is a legitimate alternative to obtaining a TypeSafe key, but requires
Cloudflare credits and does not guarantee account/model capacity. Vercel remains
another route; our single authorized attempt was blocked by payment-method verification.

Jev, NanoJev and Laya are not equivalent checkpoints. NanoJev's public evidence is
primarily game-specific, while Laya offers English, multilingual and workflow-tuned
text encoders. Laya's headline 76.6% typed-decisions result belongs to a fine-tuned
checkpoint; its base models score about 34–36% on that benchmark. Published Jev
comparators in that table were not rerun by the Laya author.

A separate community lab published 40 aligned Chinese ticket cases. Recalculation
finds 31/40 for Jev and 23/40 for multilingual Laya, with mean observed latencies of
588.325 and 7.2925 ms. These are author-run, small-sample, single-label results, not
our inference or evidence about NanoJev. The post-hoc cascade threshold was selected
on the same records and is not a held-out speed/quality guarantee.

## 1. TypeSafe 注册暂满，还有什么正规渠道？

### Cloudflare：新核实的官方路径

- 官方模型页：[https://developers.cloudflare.com/ai/models/typesafe/jev/](https://developers.cloudflare.com/ai/models/typesafe/jev/)
- 模型 ID：`typesafe/jev`，页面明确标为第三方模型，示例返回 typed answers。
- Workers 中使用 `env.AI.run('typesafe/jev', {state, questions})`。
- 页面当前 REST 示例是 `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run`，
body 为 `{model:'typesafe/jev', input:{state,questions}}`，使用 Cloudflare API token。
不能当作 chat/completions，也不要把旧的模型名嵌入路径格式直接照搬。
- [Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/) 文档说明：
没有请求级 provider key 或匹配的存储 BYOK 时，可以使用 Cloudflare 管理的凭据，
从 Cloudflare 预付费余额扣除；不要求每位用户另取得 TypeSafe API key。
- **不是匿名免费服务**：需要 Cloudflare 账户、相应鉴权和额度。文档当前说明购买
credits 有 5% 手续费；供应商推理价格透传。支付方式和充值由用户自己处理，
不自动开启充值。具体 Jev 价格以 Cloudflare 控制台为准。
- 新渠道可以绕开个人申请 TypeSafe key 的步骤，但不保证绕过上游容量、地区或限流。
- 之前 `/workers-ai/models/typesafe/jev/` 与 `/workers-ai/models/jev/` 的 404
只是旧路径失败，不能据此判断 Cloudflare 没有 Jev。

### Vercel：已有入口，当前账户仍有支付方式阻塞

- `typesafe-ai/jev` 仍出现在公开模型目录，类型为 `evaluation`、v4 规格。
- 本项目已做过一次授权请求；鉴权通过，但实际调用被上游 403
`credit_card_required` 拒绝。没有重试，不能说已成功运行官方 Jev。
- 模型页仍有 Free 优惠说明，而本次公共目录中 input 单价为
`0.000000042` 美元/token。不同展示口径不能替代账户实际结算；不保证免费。
- 本轮 OpenRouter 公共 `/api/v1/models` 中未找到 Jev/Laya。
这不是证明所有接入方式不存在，但不将其列作已核实的可用官方渠道。

## 2. 三者不是“大、中、小同一个模型”


| 维度     | 官方 Jev                | NanoJev                             | Laya                                       |
| ------ | --------------------- | ----------------------------------- | ------------------------------------------ |
| 关系     | TypeSafe 的托管模型        | 独立社区实现，不是官方 Jev 缩小版                 | 另一个独立的开放决策模型系列                             |
| 已核实结构  | 官方接口和行为；内部结构/参数量未完整公开 | Qwen3-0.6B + 决策头                    | 双向 ModernBERT/mmBERT + typed decision head |
| 主要公开证据 | 多类结构化语义判断、官方食谱和第三方评测  | 当前公开版本主要是 Maze/Snake/ViZDoom 专项训练评测 | 文本分类、NLI、意图、多语言与专门微调的工作流                   |
| 本地运行   | 未见可下载官方权重             | 已有本项目 MLX 适配                        | PyTorch 实现；有独立 MLX 移植                      |
| 多意图    | 可用多个独立 Noul 表达；准确性需测  | 接口可表达，不代表当前检查点会做                    | 同样可表达；需选择合适检查点并验证                          |
| 不能据此推断 | 官方宣传不能代替业务验收          | 游戏成绩不能代替客服/RAG 能力                   | 兼容接口和 RLCD 名称不能保证与 Jev 等质量                 |


本项目五次 FP32 探针的 **53 个 Boolean 分数全在实验性不确定区间**，证明当前
检查点/输入/门槛组合没有给出可靠业务路由。它不等于“分类准确率为零”，也不能
与另一套任务的 Jev 百分比直接相减。没有同题同条件数据，不能报 Jev 比 NanoJev
强几倍或精确高多少百分点。

NanoJev 最新 README 的 `unified-games-v1` 是专项混合训练检查点；作者报告其在
部分射击任务上优于 Jev。因此也不能简单说 NanoJev 在所有任务上都更差。
本次没有更换我们安装的本地检查点，游戏结果仍是作者报告，不是本轮独立复测。

## 3. Laya 值得试，但要区分三个检查点

上游：[https://github.com/NandhaKishorM/laya](https://github.com/NandhaKishorM/laya)
核查 commit：`573e5b62696ba441230cd6be71d593331b5d23af`。


| 检查点                    | 底座 / 参数量                | 默认完整序列预算     | 定位                          |
| ---------------------- | ----------------------- | ------------ | --------------------------- |
| `laya`                 | ModernBERT-large / 421M | 512 tokens   | 英文基础版                       |
| `laya-multilingual`    | mmBERT-base / 322M      | 1,024 tokens | 多语言，中文优先考察这一版               |
| `laya-typed-decisions` | ModernBERT-large / 421M | 1,024 tokens | 针对 typed-decisions 数据训练的专用版 |


项目声明 Apache-2.0。Hugging Face 元数据请求在本轮超时，未独立完成权重清单、
下载可达性或许可证文件校验；没有因此转向未知镜像。

### 宣传里的“超过 Jev”到底是什么？

上游 [BENCHMARKS.md](https://github.com/NandhaKishorM/laya/blob/573e5b62696ba441230cd6be71d593331b5d23af/BENCHMARKS.md)
列出 typed-decisions 的 400 案例 / 2,000 判断：


| 条件          | 报告 accuracy  |
| ----------- | ------------: |
| Laya 英文基础版  | 约 36.1–36.2% |
| Laya 多语言基础版 | 34.2%        |
| Laya 专门微调版  | 76.6%        |
| Jev 外部已发表基线 | 72.7%        |
| 多数类基线       | 46.1%        |


必须同时保留这些限制：

- 76.6% 不是基础版的零样本成绩，而是用该基准训练部分微调后的检查点结果。
- 作者明确没有 TypeSafe API 权限，Jev 数字引用第三方，样本数/提示不完全一致。
- 基础版在这项任务上低于多数类基线；不能据 76.6% 宣称任意中文售后任务都优于 Jev。
- 中文、多意图/订单绑定与这个基准不是同一个任务，微调版也不能视为多语言版。
- 两个基础检查点存在过度自信。Choice/Score confidence 的实现是归一化熵；
Noul 的 confidence 为 `max(p,1-p)`，均不是独立验证的“答对概率”。

### 源码里影响实际接入的细节

检查 `laya/agent.py`、`laya/common.py`：

- 每题构造包含问题、候选和 state 的序列，批处理不等于任意题共享一次 state 编码。
- `build_sequence()` 会缩短候选描述、问题文本并截断 state；如果接入我们实验，
需要独立的输入预算检查、显式拒绝/切片规则和原文保留，不能静默丢掉后续订单或否定句。
- `head_max_len` 限制候选描述预算。大量候选的质量不能从 4 选 1 外推；
embedding shortlist 改变了任务和候选集，必须单列为程序辅助条件。
- 当前代码会将异常温度值 clamp 到 `[0.5,5]` 并警告；运行时版本、原始温度、
实际使用温度都影响概率。不能只固定权重而忽略推理实现版本。
- 英文、多语言和专用版应显式选择；性能实验不自动切换检查点，也不把 7–10 秒
换模型开销漏出用户可见延迟。

## 4. 找到一组更贴近我们场景的独立比较

来源：[https://github.com/yibie/laya-jev-lab](https://github.com/yibie/laya-jev-lab)
核查 commit：`30ba64dceb7da058b306c104a571f1242dbd582b`。
读取 `cascade/run2-jev.mjs`、`run2-laya.py` 与两份 `bench-*.json`，没有执行脚本。
脚本包含读取作者约定的本机凭据路径以及真实 API 调用，不适合直接照跑。

两份记录的 **40 条中文输入及标签逐条一致**。本轮重新计算得到：


| 指标       | Jev API           | Laya multilingual MLX |
| -------- | -----------------: | ---------------------: |
| 全部 40 条  | 31/40 = **77.5%** | 23/40 = **57.5%**     |
| 清晰的 20 条 | 20/20             | 15/20                 |
| 模糊的 10 条 | 7/10              | 6/10                  |
| 边界的 10 条 | 4/10              | 2/10                  |
| 记录耗时均值   | 588.325 ms        | 7.2925 ms             |
| 中位数      | 525 ms            | 6.4 ms                |


这是**第三方公开记录的复算**，不是本机发起的新推理，也不独立证明远程运行。
Laya 运行在作者 M4 Max 上，加载在计时外；Jev 时间包括网络/API，不能据此称
Laya 的模型数学计算比 Jev 快几十倍。README 的 7.6 ms 与当前 JSON 复算的
7.2925 ms 略有不同，本记录以 JSON 为准。

还要保留以下实验边界：

- 仅 40 条、作者手工标签；模糊/多意图消息被要求输出一个类别，部分 gold 有争议。
它不是我们的多标签＋订单关联评估。
- 脚本请求 `jev-latest`，README 标称 1.13.0；原始逐条文件没有保留 returned model。
- Laya 脚本加载 `aac6fef/laya-multilingual-mlx`，未在脚本中固定 HF revision。
- 不能把这组数据添加一个来自别处的 NanoJev 成绩，就拼成三模型排行榜。

### 社区的 hybrid 成绩也要去掉“事后选门槛”滤镜

用同一批已公开记录回放 threshold=0.60：22/40 转 Jev，得到 31/40 正确，
按 `本地耗时 + 被升级样本 API 耗时` 算的平均约 **319.97 ms**。
这说明存在一个值得测试的选择性调用假设，但门槛是在同批 40 条上扫描的；
不是独立留出结果，也不是重新实跑的线上 cascade 时延。不能把它直接写成
“hybrid 保持质量并加速 1.8 倍”的生产保证，更不能照搬 0.60 到我们的模型。

## 5. Apple Silicon 本地路线

[laya-mlx](https://github.com/mizorewww/laya-mlx)，核查 commit
`0a859518634112655cb97c745dbf04f5191aaf13`，是独立移植，不是上游官方运行时。

作者 M3 Max 报告短单题端到端 P50：英文 13.42 ms，多语言 7.39 ms；权重加载
不计入。三检查点 FP32/FP16 的 378 个选择对照全匹配，是有限样本移植一致性，
不是“378 题业务全对”。不能拿这些单题数字与我们 9/13 题 NanoJev 批次直接相除。

若后续获准本地测试，建议：

1. 独立环境、固定 `laya-multilingual-mlx` 权重与运行时 revision，不改 NanoJev 或 oMLX。
2. 先检查下载完整性、原始输入是否截断、精度与上游一致性。
3. NanoJev / Laya 用同一份中文与英文测试，分别测明确请求、否定、多意图、多订单、
 绑定不明和超范围。不要将 40 条公开单标签题当作最终泛化集。
4. 实验分为开发、校准与独立测试；同一输入重复措辞应按原始意图/来源分组切分。
 主动弃答计入覆盖率，不能把全部弃答当“全部安全正确”。
5. 获得 Cloudflare 或 Vercel 可用权限后，官方 Jev 加入同一测试，而非使用不同来源分数替代。
6. 同时比较规则/检索/普通分类器基线。测试原生判别，不先用 LLM 修答案掩盖模型差异。
7. 质量过关后再接 hybrid，统计全阶段时延、云端 usage、本地资源、复核率和完整任务完成。
 Laya 本地运行没有外部模型 API 账单，但不是零硬件/维护成本。

## 结论

- **想知道官方 Jev 真正比 NanoJev 强多少：还需要同题实测，现有结果不能给精确差值。**
- **想换一个更贴近中文文本判断的本地候选：Laya multilingual 比继续默认用游戏向
NanoJev 检查点更值得优先验证，但 57.5% 的小样本结果也不支持直接上生产。**
- **想绕开 TypeSafe 注册等待：Cloudflare 是本轮新核实的正规渠道；需要用户自行
开通相应账户/支付额度，再明确授权一次小请求验证。**

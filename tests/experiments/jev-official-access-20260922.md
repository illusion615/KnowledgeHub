# 官方 Jev 接入核查 / Hosted Jev integration

核查日期：2026-09-22。初次核查读取公开文档、项目适配器与本地服务状态，并执行只读 Vercel 鉴权检查；该阶段未发起推理。随后经用户授权进行一次真实请求尝试，结果见下节。未安装依赖、未更换权重、未改动现有实验逻辑。

## 授权后的真实连通尝试：被 Gateway 支付方式检查拒绝

2026-09-22T10:31:14Z，用户同意开始并要求在需要注册时告知。使用现有 Gateway
配置提交一个合成账务问题，复用 Playground 的 Choice/Boolean/Score 三题契约。
预算为一个顶层请求、`maxRetries: 0`、后端 30 秒截止；实际只尝试一次。

结果：本地后端返回 HTTP 502，脱敏诊断明确记录 **上游 HTTP 403**、
`upstream_payment_method_required` / `credit_card_required`。
这是 Gateway 对有效支付方式的要求，不是缺少 SDK、无效密钥或 NanoJev 错误。
未获得 Jev 判断与 usage，不计作模型访问成功，也不将未知用量或费用写成零。
未重试、未切换 TypeSafe 直连、未注册账号或操作支付设置。

下一步需要用户为现有密钥所属的 Vercel 账户/团队配置有效支付方式，或者
登录/注册 TypeSafe 并提供仅在本地安全输入的 API key，之后再授权验证。
直连可以绕过 Vercel 的支付方式检查，但不能保证免除 TypeSafe 自身的额度要求。

私有计划与响应 receipt（不含密钥/请求头）保存在：
`~/.cache/study-room/jev-evaluation/official-access/2026-09-22T10-31-14-474Z-90c75a11-27a9-4521-8628-87a2a7d1bbde.jsonl`

以下为此前只读核查时的状态与接入设计，不能覆盖本次真实拒绝结果。

## English summary

Hosted Jev has a documented TypeSafe evaluation API and a Vercel AI Gateway
evaluation-model integration. Our basic Playground already implements both.
The running backend has a Gateway key whose read-only authentication check passed;
no TypeSafe direct key is configured. Inference entitlement and model quality have
not been tested. The support comparison still restricts its decision provider to
local NanoJev, so connecting hosted Jev requires a generic judgment adapter plus
explicit provider selection, cloud-call budgeting and provenance changes—not a
model-name substitution.

## 1. 当前可选渠道

| 渠道 | 接口与模型 | 当前项目情况 |
| --- | --- | --- |
| TypeSafe 官方直连 | `POST https://api.typesafe.ai/v1/systemone`；`jev-1.13.0` | 基础 Playground 已实现；运行中后端未配置 `TYPESAFE_API_KEY` |
| Vercel AI Gateway | AI SDK 的 `experimental_evaluate`；`typesafe-ai/jev` | 基础 Playground 已实现；密钥已配置、SDK 就绪、只读鉴权通过 |

直连使用 `Authorization: Bearer <key>`。当前官方文档的 `jev-latest` 和
`jev-preview` 都指向 `jev-1.13.0`；为了比较可复现，直连优先固定版本。
Gateway 模型 ID 不等于独立验证过的底层权重版本，继续记录 requested/returned
model 与身份验证边界。

Jev 是结构化判断模型，不能当作普通聊天模型调用 `generateText` 或
`/chat/completions`，也不会替代生成客服回复的 LLM。

### 价格与限制是文档快照，不是账户权限保证

- TypeSafe 文档：输入 $0.042 / 百万 token，输出免费；不是宣称 output_tokens 恒为零。
- 官方直连文档：每请求总共 64k token；state 加最长问题不超过 32k。
- 标称限流 1,200 RPM、250,000 tokens/s，文档明确可能动态调整。
- Vercel 模型页当前标为 Free，注明优惠于 **2026-09-25** 结束。不能把它作为长期免费或免支付方式验证的承诺；也不能将直连接口限额直接套到 Gateway。
- 英文是主要训练语言；中文场景需要独立质量验证。
- 初次核查的两条 Cloudflare 旧模型文档路径返回 404。随后已在新官方目录
  `https://developers.cloudflare.com/ai/models/typesafe/jev/` 核实 `typesafe/jev`：
  可通过 Cloudflare 管理凭据与 Unified Billing 使用，不要求个人 TypeSafe key，
  但需要 Cloudflare 账户、鉴权和额度。本项目尚未实测该渠道。
  详见 `jev-nanojev-laya-20260922.md`；旧路径 404 不应再解释为没有 Cloudflare 接入。

## 2. 本机只读验证

通过 `http://127.0.0.1:62848` 的现有后端读取脱敏状态，并调用
`POST /api/jev/check`、provider=`vercel`。该后端实际请求的是
`GET https://ai-gateway.vercel.sh/v1/credits`，不是推理端点。

- `authentication: verified`
- 上游 HTTP 200、JSON 响应
- `model_access: not_tested`
- `model_inference_performed: false`
- TypeSafe 直连状态：`configured: false`、`credential_issue: key_missing`

密钥值、余额、组织信息、请求头和 CSRF 值未写入本记录。
鉴权通过不代表账户能调用指定模型：还可能有额度、支付方式、区域或模型权限限制。

## 3. 请求格式：不要把三个接口混为一谈

官方直连的示例请求体如下。**这是待授权的推理示例，本次未执行。**

```json
{
  "model": "jev-1.13.0",
  "state": "订单 SR-123456 没收到，而且重复扣费了。暂时不申请退货。",
  "questions": {
    "delivery": {
      "type": "noul",
      "instructions": "客户当前是否要求处理订单 SR-123456 未收到的物流问题？"
    },
    "billing": {
      "type": "noul",
      "instructions": "客户当前是否要求核查订单 SR-123456 的重复扣费问题？"
    },
    "returns": {
      "type": "noul",
      "instructions": "客户当前是否要求为订单 SR-123456 申请退货？明确否定或暂不申请应回答否。"
    }
  }
}
```

- TypeSafe：顶层 `{model,state,questions}`，是非题为 `noul`，结果是 `answers.<id>.noul`。
- Gateway SDK：是非题为 `boolean`，结果读 `answers.<id>.probability`；Choice/Score 的官方 confidence 从 provider metadata 读取，不自行制造。
- 本地 NanoJev：现有 `{states:[...]}` 包装，Boolean 结果是 `p_true`，还有本地权重与运行时校验字段。官方响应不能套用本地 MLX 的 normalize。
- 问题 ID 仅用于关联答案，官方文档明确它不进入模型推理；语义必须写在 instructions/criteria 中。
- 多意图使用多个独立问题；不能用单个 Choice 逼迫互斥，也不能把这些 Noul 分数跨题归一化。

## 4. 项目已具备什么、还缺什么

### 已具备

`scripts/jev-live-providers.js`：

- TypeSafe 直连 fetch、固定官方 URL、后端环境变量鉴权。
- Gateway evaluationModel 调用、`maxRetries: 0`、AbortSignal。
- 只读鉴权与脱敏错误、SDK 结果映射、用量与来源记录。

`scripts/jev-playground-server.js`：

- `/api/jev/check` 只读预检、显式推理授权、同源和 CSRF 检查。
- `--prompt-key typesafe` / `--prompt-key vercel` 可在交互终端隐藏输入密钥。
- `--check typesafe` / `--check vercel` 只做鉴权检查，不执行模型推理。

因此最小连通验证应先复用基础 `#playground`，不必重写客户端。
目前的 Playground runner 是固定的 team/enough_info/severity 示例，不是任意问题接口。

### 接入 hybrid 前必须扩展

1. **通用判断适配器**：接收任意合法 state/questions；按请求逐题验证官方响应。
   旧 Playground 保留兼容包装，不直接挪用只验证三个固定字段的 normalize。
2. **显式选择判断源**：新增 `decision_provider` 等清晰配置，区分官方 Jev 与
   NanoJev；不把云服务塞进名为 `local_provider` 的字段。当前 `jev-support.js`
   只允许两个 NanoJev provider，`jev-arena-provider.js` 的普通判断路径也走本地连接。
3. **协议转换**：区分 Noul/SDK Boolean/本地 Boolean；保留原始官方回答和用量，
   不伪造本地权重 SHA、Metal 执行记录或独立 confidence。
4. **计费与授权**：Jev 判断也属于外部调用，需要单独计入预算、限流和同意文案。
   不能继续将这些阶段标为“本地调用 / API 费用为零”。切换 provider 时重新确认。
5. **比较与故障边界**：保留规则＋LLM 消融与本地 NanoJev 条件；同一回答 LLM。
   不隐式换服务商、不重试；真实调用权限/质量失败不能用 fixture 或其他模型补上。

## 5. 推荐顺序

1. 最快路径：使用现有 Gateway 配置，在基础 Playground 授权一次真实请求，
   最多一次、无重试、现有超时保护。先验证模型权限、响应契约和实际 usage。
2. 若被支付方式/额度/权限拦截，报告具体安全错误；由用户在控制台处理，
   或另行配置 TypeSafe 直连密钥。不能静默换路由。
3. 若选择直连，可在空闲端口运行现有服务器并使用 `--prompt-key typesafe`；
   不将密钥粘到聊天、前端源码、命令参数或版本库。
4. 连通性通过后再做少量中文/英文真实样本，区分“API 能调用”与“业务判断可靠”。
5. 验证通过才扩展 hybrid 或前一份调研提出的证据工作台。门槛不沿用为正确率保证。

本次离线运行 `node --test tests/jev-live.test.js tests/jev-readiness.test.js`：
**33 通过，0 跳过**。包含实际已安装 SDK 的拦截 HTTP 契约测试，无模型推理。
这不替代上述待授权的真实连通验证。

## 来源

- [官方 API](https://docs.typesafe.ai/api)
- [官方模型、价格、限制、版本](https://docs.typesafe.ai/models)
- [官方 Quick Start 与密钥入口](https://docs.typesafe.ai/introduction/quickstart)
- [官方 JavaScript SDK](https://docs.typesafe.ai/sdk/javascript)
- [Vercel Jev 模型页、evaluation 示例与优惠期限](https://vercel.com/ai-gateway/models/jev)
- 本项目：`scripts/jev-live-providers.js`、`scripts/jev-arena-provider.js`、
  `scripts/jev-support.js`、`scripts/jev-playground-server.js`、适配器与只读预检测试。

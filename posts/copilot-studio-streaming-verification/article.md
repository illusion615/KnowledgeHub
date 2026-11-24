---
title: "Copilot Studio Streaming：Classic 与 New Agent 的 Direct Line / D2E 实施路线 || Copilot Studio Streaming: Direct Line and D2E Routes for Classic and New Agents"
eyebrow: "面向开发者与 AI 编程助理的实施手册 || Implementation Guide for Developers and Coding Agents"
brand: Copilot Studio
date: 2026-06-15
strict_i18n: true
strict_density: true
lead: "先识别 Agent shape，再选择 Direct Line 或 Direct-to-Engine。D2E 实施主线只采用 delegated 身份；S2S 因仍处于 Private Preview，仅作为边界与验证证据保留，不进入选型或交付范围。主线聚焦四种 transport 组合及其消息格式、对接步骤与验收条件；2026 年 6 月以来的验证过程归入附录。 || Identify the Agent shape first, then choose Direct Line or Direct-to-Engine. The D2E implementation uses delegated identity only. Because S2S remains in Private Preview, this guide retains it solely as boundary and validation evidence, not as a selection or delivery option. The main text covers all four transport combinations, their message formats, integration steps, and acceptance criteria; the verification history since June 2026 is archived in the appendix."
hero_actions:
  - "选择实施路线 || Choose a Route | #decision"
  - "打开验证入口 || Open Validation Links | #evidence"
panel_label: "使用方法 || How to Use This Guide"
panel_title: "从路线选型到工程验收的四个步骤 || Four Steps from Route Selection to Acceptance"
panel:
  - "读取 template / recognizer，判断 Classic 或 New Agent。 || Read template / recognizer to identify Classic or New Agent."
  - "在四路线矩阵中确认 transport，再核对 D2E 身份依赖。 || Choose the transport in the four-route matrix, then verify D2E identity dependencies."
  - "按分章 Runbook 实现 transport 与 message reducer。 || Implement transport and message reducers from the route chapter."
  - "结合在线页面、fixture 与 raw export 执行验收。 || Validate with the live page, fixtures, and raw export."
metrics:
  - "路线组合 || Route Combinations | 4 | 2 种 Agent shape × 2 种 transport || 2 Agent shapes × 2 transports"
  - "D2E endpoint family || D2E Endpoint Families | 2 | published-bot · agenticruntime/3p"
  - "当前 D2E 实施身份 || Current D2E Implementation Identity | 1 | delegated；S2S Private Preview 不纳入选型 || Delegated; S2S Private Preview is excluded from selection"
  - "公共 UI contract || Shared UI Contract | 1 | TurnState · Work panel · answer bubble"
style:
  accent: "#0ea5e9"
---

## #decision 00 / Quick Decision :: 先按 Agent shape 与 transport 选择四条路线之一 || Choose One of Four Routes by Agent Shape and Transport

不要先写 connector。先从 template / recognizer 判断 Classic 或 New Agent，再决定 Direct Line 或 D2E；选择 D2E 后使用 delegated 身份。Transport 决定 wire format，delegated 身份决定 token、用户 ACL 与 Agent 分享依赖。S2S Private Preview 不进入本决策树。 || Do not start by writing a connector. Identify Classic or New Agent from template / recognizer, then choose Direct Line or D2E. Use delegated identity for D2E. Transport determines the wire format, while delegated identity determines token, user ACL, and Agent-sharing dependencies. S2S Private Preview is outside this decision tree.

:::accordion
::panel { open: true }
### 00.1 四路线实施矩阵 || 00.1 Four-Route Implementation Matrix
矩阵先给结论；后续四章分别给可复现步骤。 || The matrix gives the decision first; the next four chapters provide reproducible steps.

| Agent + Transport | 支持状态 || Status | 核心入口 || Core Entry | 认证 || Auth | 消息处理 || Message Processing | 推荐 || Recommendation |
| --- | --- | --- | --- | --- | --- |
| **Classic + Direct Line** | 协议支持 || Protocol Supported<br>实际下发依环境 || Emission varies by environment | `directline.botframework.com/v3/directline` | 后端 secret 换短期 token || Backend exchanges secret for short-lived token | `typing + streaminfo → final` | Classic 自定义 Web Chat 首选 || Preferred for Classic custom Web Chat |
| **Classic + D2E** | Delegated 为公开路径 || Delegated Path Is Public | `/copilotstudio/dataverse-backed/...`<br>`api-version=2022-03-01-preview` | Delegated；S2S Private Preview 不纳入方案 || Delegated; S2S Private Preview is excluded from the design | SSE answer stream | 使用 delegated || Use delegated |
| **New + Direct Line** | 受 harness 限制 || Harness-Limited | GHCP harness 的 Native app / Direct Line 官方矩阵为 No || The official GHCP harness matrix lists Native app / Direct Line as No | 仅特定 no-auth agentic 路径有公开实验 || Public experiments exist only for specific no-auth agentic paths | 不能按 Classic 路线外推 || Do not extrapolate from Classic | 默认不要选；先核对 harness || Do not choose by default; verify the harness first |
| **New + D2E** | Delegated 已实测，非正式矩阵 || Delegated Is Observed, Not in Formal Matrix | `/copilotstudio/agenticruntime/3p/dataverse-backed/...`<br>`api-version=1` | Delegated 已实测；S2S Private Preview 不纳入方案 || Delegated is observed; S2S Private Preview is excluded from the design | `thought + informative + toolCall + answer` | 当前可行路径：delegated /3p || Current viable route: delegated /3p |

::panel
### 00.2 决策树 || 00.2 Decision Tree
识别 Agent shape 是第一步；schema name 本身不能区分运行时。 || Identifying the Agent shape is the first step; schema name alone cannot select the runtime.

1. **读取 template / recognizer || Read template / recognizer** — `default-2.1.0 + GenerativeAIRecognizer → Classic` `cliagent-1.0.0 + CLIAgentRecognizer / CLICopilotRecognizer → New`
2. **Classic Agent** — 已有 Direct Line channel 时优先走 Direct Line；需要 D2E SSE 时使用公开 delegated 路径。S2S Private Preview 不进入路线评估。 || Prefer Direct Line when that channel exists. For D2E SSE, use the public delegated path. S2S Private Preview is outside route evaluation.
3. **New Agent** — 当前 delegated 自定义路径使用 agentic runtime /3p D2E；Direct Line 必须按目标 harness 和官方支持矩阵专项验证。S2S Private Preview 不进入路线评估。 || The current delegated custom route uses agentic runtime /3p D2E. Validate Direct Line against the target harness and formal support matrix. S2S Private Preview is outside route evaluation.
:::

## #shared 01 / Shared Prerequisites :: 四条路线共享 Agent 识别、时序指标与统一事件模型 || All Four Routes Share Agent Detection, Timing Metrics, and a Normalized Event Model

Transport 可以不同，但客户端最终都要生成同一组 turn events。统一术语与完成判据后，UI 不需要理解 Direct Line 或 D2E 的原始字段。 || Transports differ, but clients should produce the same turn events. Once terminology and completion criteria are unified, the UI no longer needs to understand raw Direct Line or D2E fields.

:::accordion
::panel { open: true }
### 01.1 必备参数与术语 || 01.1 Required Parameters and Terms
编码前先收齐五项基础参数；缺任一项时不要开始拼接 URL。 || Collect all five required parameters before coding; do not build URLs while any item is unknown.

| 项 || Item | 用途 || Purpose | 来源 || Source |
| --- | --- | --- |
| `environmentId` | 生成 Power Platform runtime host || Build the Power Platform runtime host | PPAC / URL |
| `schemaName` | 定位目标 Agent || Address the target Agent | Settings → Advanced → Metadata |
| `template / recognizer` | 选择 Classic 或 New runtime family || Select the Classic or New runtime family | Dataverse `bot` metadata / cloned settings |
| `conversationId` | 关联同一会话中的后续 turn || Associate follow-up turns in one conversation | response header / activity |
| TTFT | 发送消息到首个非空答案文本的时间 || Time from send to first non-empty answer text | 客户端测量 || Client measurement |

::panel
### 01.2 统一归一化事件 || 01.2 Normalized Events
Connector 负责 transport 与 raw activity 解析；Turn reducer 只消费六类归一化事件。 || The connector owns transport and raw parsing; the turn reducer consumes only these six normalized events.

```
reasoningUpdate(text)
stageUpdate({ id, label, status, durationMs? })
answerSnapshot({ streamId?, sequence?, text, mode })
answerFinal({ streamId?, text, attachments?, actions? })
streamCancelled({ streamId? })
fallbackSplit({ streamedText, finalText })
```

::panel
### 01.3 Environment ID 到 envHost || 01.3 Environment ID to envHost
优先使用 Copilot Studio 提供的 Direct Connect URL 或官方 SDK cloud resolver，不要猜测 sovereign / test cloud 域名。Prod / First Release 的 MCSChat 实现使用 GUID 规范化后的 30/2 切分；若 cloud 不是 Prod，必须改用对应 cloud resolver。 || Prefer a Direct Connect URL supplied by Copilot Studio or the official SDK cloud resolver; do not guess sovereign / test cloud domains. For Prod / First Release, MCSChat splits the normalized environment GUID 30/2. For any other cloud, use the matching cloud resolver.

```
function prodEnvironmentHost(environmentId) {
  const id = environmentId.toLowerCase().replaceAll('-', '')
  return `${id.slice(0, -2)}.${id.slice(-2)}.environment.api.powerplatform.com`
}
```
:::

## #d2e-identity 02 / D2E Identity Modes :: Delegated 是实施身份；S2S 仅保留为 Private Preview 边界证据 || Delegated Is the Implementation Identity; S2S Remains Private Preview Boundary Evidence Only

Copilot Studio Client 的 D2E 请求始终携带 Power Platform Entra JWT。主线实施路线只使用用户 delegated token。Private Preview 文档中的 app-only 与 OBO S2S 模型仅用于解释 token claims、Agent 认证模式和 ACL 差异，不构成选型、Runbook 或交付承诺。 || Copilot Studio Client D2E requests always carry a Power Platform Entra JWT. The implementation route uses delegated user tokens only. The app-only and OBO S2S models in Private Preview documentation are retained only to explain token claims, Agent authentication modes, and ACL differences; they are not selection options, runbooks, or delivery commitments. [14]

:::accordion
::panel { open: true }
### 02.1 Delegated、OBO 与 app-only 的区别 || 02.1 Delegated, OBO, and App-Only Differences
Microsoft 的 S2S 预览文档把 app-only 与 delegated OBO 都归入 S2S；为避免混淆，矩阵将其分别记作 app-only S2S 与 delegated OBO。两者都只作 Private Preview 事实对照，不进入实施范围。 || Microsoft's S2S preview documentation groups app-only and delegated OBO under S2S. The matrix distinguishes them as app-only S2S and delegated OBO. Both are Private Preview reference facts only and remain outside implementation scope.

| 模式 || Mode | Token 判据 || Token Signal | 用户上下文 || User Context | Agent 认证依赖 || Agent Authentication Dependency | 当前可用性 || Current Availability |
| --- | --- | --- | --- | --- |
| 交互式 delegated || Interactive Delegated | `idtyp=user`<br>`scp` | 当前登录用户 || Signed-in user | 用户与 Agent 的访问权限分别检查 || Validate user and Agent access separately | 公开 Copilot Studio Client 路径 || Public Copilot Studio Client path |
| Delegated OBO | `idtyp=user`<br>`scp` | 服务代表已登录用户调用 || Service calls on behalf of a signed-in user | `Integrated authentication`<br>应用和用户都要有 Agent 访问权 || Both app and user need Agent access | Private Preview<br>事实对照；不纳入实施 || Reference only; excluded from implementation |
| App-only S2S | `roles`<br>idtyp=app 仅作补充证据 || idtyp=app is supplementary evidence only | 无最终用户 || No end user | `No Authentication`<br>工具不能依赖最终用户身份 || Tools cannot depend on end-user identity | Private Preview<br>事实对照；不纳入实施 || Reference only; excluded from implementation [14] [16] |

::panel
### 02.2 App-only S2S 的 Private Preview 依赖证据 || 02.2 App-Only S2S Private Preview Dependency Evidence
五项依赖条件旨在说明为什么 application permission 不代表能力可用：Private Preview 运行时还会检查预览开关、Agent ACL、认证模式、租户和会话调用者一致性。它不是实施 Runbook，也不把 S2S 纳入候选方案。 || These five dependencies explain why application permission does not establish runtime availability: Private Preview also checks preview enablement, Agent ACLs, authentication mode, tenant, and caller consistency across the conversation. It is not an implementation runbook and does not make S2S a candidate design.

1. **环境级 Private Preview feature gate || Environment-Level Private Preview Feature Gate** — 该预览由 Microsoft 按目标环境或租户控制；Entra 中出现 application role 不能证明运行时已经开放。 || Microsoft controls this preview per target environment or tenant. An application role appearing in Entra does not prove runtime enablement.
2. **同租户 application permission || Same-Tenant Application Permission** — 预览文档要求 Power Platform API 的 CopilotStudio.Copilots.Invoke application permission 与管理员同意，并声明不支持跨租户。 || The preview documentation requires CopilotStudio.Copilots.Invoke application permission for Power Platform API plus admin consent and states that cross-tenant calls are unsupported. [15]
3. **应用身份 Agent ACL || Application-Identity Agent ACL** — 预览模型要求应用身份在 Copilot Studio 分享 ACL 中拥有 viewer 权限；仅有 tenant consent 不满足 Agent ACL。 || The preview model requires viewer access for the application identity in the Copilot Studio sharing ACL. Tenant consent alone does not satisfy the Agent ACL.
4. **No Authentication 依赖 || No Authentication Dependency** — App-only 请求没有最终用户，不能运行依赖用户登录、用户连接或 OBO 的工具；该认证模式不代表 D2E endpoint 可无 JWT 调用。 || App-only requests have no end user and cannot run tools that require user sign-in, user connections, or OBO. This authentication mode does not make the D2E endpoint callable without a JWT.
5. **会话调用者一致性 || Conversation Caller Consistency** — 预览文档规定同一会话使用同一应用身份；调用者或身份类型变化会返回 CallerIdentityMismatch 或 CallerIdentityTypeMismatch。 || The preview documentation requires one application identity throughout a conversation. A caller or identity-type change returns CallerIdentityMismatch or CallerIdentityTypeMismatch.

::panel
### 02.3 澄清、错误判定与路线生命周期 || 02.3 Clarifications, Error Diagnosis, and Route Lifecycle
身份、Agent 认证、transport 和产品生命周期必须分别判断；任一层成立都不能替代其他层的证据。 || Evaluate identity, Agent authentication, transport, and product lifecycle separately. Evidence at one layer cannot substitute for another.

| 常见说法 || Common Statement | 准确解释 || Accurate Interpretation |
| --- | --- |
| 配置了 ClientSecret 就是 S2S || A ClientSecret Means S2S | 不成立。Confidential client 也能执行 OBO；以 token 的 idtyp、scp 与 roles 判断身份类型。 || False. A confidential client can also perform OBO. Determine identity type from idtyp, scp, and roles claims. |
| Agent 是匿名模式，所以 D2E 可匿名调用 || No Authentication Makes D2E Anonymous | 不成立。No Authentication 只关闭最终用户登录；PPAPI 仍要求有效的 Power Platform Entra JWT。 || False. No Authentication disables end-user sign-in; PPAPI still requires a valid Power Platform Entra JWT. |
| S2S 会改变 streaming 协议 || S2S Changes the Streaming Protocol | 不成立。S2S 只改变调用者 token 与 ACL；Accept: text/event-stream 和 Activity SSE 处理保持不变。 || False. S2S changes caller token and ACLs only. Accept: text/event-stream and Activity SSE processing remain unchanged. |
| S2S 等同 Direct Line || S2S Equals Direct Line | 不成立。Direct Line 使用 Bot Framework secret/token 与 WebSocket；S2S 仍通过 PPAPI D2E 和 Entra JWT。 || False. Direct Line uses Bot Framework secrets or tokens and WebSocket. S2S still uses PPAPI D2E and an Entra JWT. |

| 路线 || Route | 前置依赖 || Prerequisite | 采用判断 || Adoption Decision |
| --- | --- | --- |
| D2E delegated || D2E Delegated | 用户登录、delegated permission、Agent 分享 || User sign-in, delegated permission, Agent sharing | 公开 SDK 路径；适合有 Entra 用户的当前集成 || Public SDK path for current integrations with Entra users |
| Gateway + 专用 delegated 用户 || Gateway + Dedicated Delegated User | 管理员一次性交互登录、delegated permission、Agent 分享、加密 MSAL token cache || One-time administrator-assisted sign-in, delegated permission, Agent sharing, and an encrypted MSAL token cache | 当前可实施主方案：第三方只调用 Gateway，不接触 Entra；Gateway 代表同一个专用用户调用现有 /3p D2E streaming。 || Current implementation route: third parties call only the gateway and never interact with Entra; the gateway invokes the existing /3p D2E stream as one dedicated user. |

专用 delegated 用户 Gateway 若经过 Azure API Management，forward-request 必须设置 buffer-response=false；默认缓冲会延迟 Copilot Studio SSE chunk 到达客户端。 || A dedicated delegated-user gateway behind Azure API Management must set forward-request buffer-response=false; default buffering delays Copilot Studio SSE chunks before they reach the client. [17]
:::

## #classic-directline 03 / Classic + Direct Line :: Classic Agent 通过 Direct Line WebSocket 接收 livestreaming activity || Classic Agents Receive Livestreaming Activities over Direct Line WebSocket

适用于已经发布 Direct Line channel 的 Classic Agent。客户端通过短期 Direct Line token 建立 conversation 与 WebSocket，并在 activity 上声明 deliveryMode=stream；目标环境是否实际下发 progressive chunks 仍须用 raw activity 验证。 || Use this route for a Classic Agent with a published Direct Line channel. The client opens a conversation and WebSocket with a short-lived Direct Line token and sets deliveryMode=stream on activities. Raw activities must still confirm whether the target environment emits progressive chunks.

:::accordion
::panel { open: true }
### 03.1 支持边界与接口规格 || 03.1 Support Boundary and Interface Specification
该路线使用 Direct Line 3.0 REST + WebSocket；secret 只保留在服务端，浏览器只接收短期 token。 || This route uses Direct Line 3.0 REST plus WebSocket. Keep the secret on the server and give the browser only a short-lived token.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| 支持状态 || Support Status | BotFramework livestreaming contract 支持；是否下发 progressive chunks 由目标环境决定 || Supported by the BotFramework livestreaming contract; progressive emission depends on the target environment |
| Token | `POST https://directline.botframework.com/v3/directline/tokens/generate`<br>服务端用 Direct Line secret 换短期 token || The server exchanges the Direct Line secret for a short-lived token |
| Conversation | `POST /v3/directline/conversations`<br>返回 conversationId、token 与 streamUrl || Returns conversationId, token, and streamUrl |
| Receive | `WebSocket GET {streamUrl}` |
| Send | `POST /v3/directline/conversations/{conversationId}/activities` |
| Authentication | `Authorization: Bearer {directLineToken}` |
| Request | `Activity` with `deliveryMode: 'stream'` |
| Response | `ActivitySet { activities[], watermark }` over WebSocket |

::panel
### 03.2 请求流程与返回处理 || 03.2 Request Flow and Response Processing
先启动 WebSocket，再发送 startConversation event 和用户 message；接收端逐个归一化 ActivitySet 中的 activity，不按 activity 数量创建气泡。 || Open the WebSocket first, then send the startConversation event and user message. Normalize each activity in every ActivitySet; never create bubbles according to activity count.

```
const directLine = createDirectLine({ token, webSocket: true })

directLine.postActivity({
  type: 'event', name: 'startConversation', deliveryMode: 'stream',
  from: { id: userId },
  entities: [{ type: 'ClientCapabilities', requiresBotState: true }],
}).subscribe()

directLine.postActivity({
  type: 'message', text, deliveryMode: 'stream', from: { id: userId },
}).subscribe()

directLine.activity$.subscribe(activity => reduceTurnActivity(activity))
```

| 返回类型 || Return Type | 处理规则 || Processing Rule |
| --- | --- |
| `typing` | 只更新工作状态；空文本不创建答案气泡 || Update working status only; empty text creates no answer bubble |
| `streaminfo` | 从 channelData 或 entities[type=streaminfo] 读取 streamType、streamId、streamSequence 与 chunkType || Read streamType, streamId, streamSequence, and chunkType from channelData or entities[type=streaminfo] |
| answer chunk || Answer Chunk | 按 streamId 更新同一个答案状态；无 ID 首 chunk 先绑定本地 turn ref，真实 ID 到达后建立 alias。chunkType 只作诊断，合并以文本关系为准：incoming 相同或以 current 开头时替换；长文本共享显著前缀时按 revised snapshot 替换；否则追加为 delta || Update one answer state by streamId. Bind an ID-less first chunk to a local turn ref, then alias the real ID when it arrives. Treat chunkType as diagnostic only. Merge by text relationship: replace when incoming is identical or starts with current; replace long text with a substantial shared prefix as a revised snapshot; otherwise append as a delta |
| final message || Final Message | 通常完成同一个答案状态并建立 tombstone；若 final 明显更短且与已流出答案前缀低重合，保留 streamed answer，把 final 作为单独 fallback message。晚到 chunk 不得新建气泡 || Normally finalize the same answer state and create a tombstone. If final is substantially shorter with little prefix overlap, preserve the streamed answer and render final as a separate fallback message. Late chunks must not create another bubble |

::panel
### 03.3 注意事项、失败处理与验收 || 03.3 Caveats, Failure Handling, and Acceptance
验收必须同时检查 secret 隔离、WebSocket 时序和最终 UI；只收到 final message 属于目标环境的 final-only 结果，不应误判为连接失败。 || Acceptance must cover secret isolation, WebSocket ordering, and final UI behavior. Receiving only a final message is a final-only result in that environment, not a connection failure.

- 安全：浏览器、日志和导出文件均不得出现 Direct Line secret。 || Security: the Direct Line secret must never appear in the browser, logs, or exports.
- 时序：按 streamSequence 丢弃重复或倒序 activity；Classic reducer 不把 chunkType 当作权威值，使用 mergeStreamingText 的 prefix/overlap 规则。 || Ordering: drop duplicate or out-of-order activities by streamSequence. The Classic reducer does not treat chunkType as authoritative; it uses mergeStreamingText prefix/overlap rules.
- Transport gate：WebSocket 在线，并收到目标 conversation 的 ordered ActivitySet。 || Transport gate: the WebSocket is connected and ordered ActivitySets arrive for the target conversation.
- Progressive gate：至少两个不同的非空答案快照，且 sequence 单调递增；只收到 final 不算 progressive。 || Progressive gate: at least two distinct non-empty answer snapshots with monotonically increasing sequence. A final-only result is not progressive.
- Reducer/UI gate：正常 final 只完成一个答案气泡；divergent fallback final 不覆盖已流出答案；晚到 chunk 不增加消息数。 || Reducer/UI gate: a normal final completes one answer bubble, a divergent fallback final does not overwrite the streamed answer, and late chunks do not increase message count.
- 降级：空 typing 后只有一个完整 message 时，记录为 final-only，并保留 ordered activity dump。 || Fallback: when empty typing events are followed by one complete message, record final-only delivery and preserve the ordered activity dump.

[下载脱敏 Direct Line final-only observed capture || Download the redacted Direct Line final-only observed capture](https://illusion615.github.io/MCSChat/examples/fixtures/directline-classic-final-only.json) — 只证明该环境的 transport 与 final-only 判定，不证明 progressive streaming。 || — proves transport and final-only classification in that environment, not progressive streaming.
:::

## #classic-d2e 04 / Classic + D2E :: Classic Agent 使用 published-bot D2E endpoint || Classic Agents Use the Published-Bot D2E Endpoint

适用于已 Published 的 Classic Agent。实施路径由浏览器或 Gateway 通过 MSAL 获取 delegated Power Platform token，并要求 Agent 已共享给当前用户。本章只覆盖 delegated published-bot endpoint、HTTP POST 和 SSE activity。 || Use this route for a published Classic Agent. The implementation obtains a delegated Power Platform token through browser or gateway MSAL and requires sharing the Agent with the current user. This chapter covers only the delegated published-bot endpoint, HTTP POST, and SSE activities.

:::accordion
::panel { open: true }
### 04.1 支持边界与接口规格 || 04.1 Support Boundary and Interface Specification
接口 host 来自 environment ID；建会话和发送 turn 都是 POST，同一响应以 text/event-stream 返回 activity。 || Derive the interface host from the environment ID. Conversation creation and turn submission both use POST, and each response returns activities as text/event-stream.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| 支持状态 || Support Status | 公开 Copilot Studio Client 路径 || Public Copilot Studio Client path |
| SDK URL | `https://{envHost}/copilotstudio/dataverse-backed/authenticated/bots/{schemaName}?api-version=2022-03-01-preview` |
| 建会话 || Create Conversation | `POST .../bots/{schemaName}/conversations?api-version=2022-03-01-preview` |
| 发送 turn || Send Turn | `POST .../bots/{schemaName}/conversations/{conversationId}?api-version=2022-03-01-preview` |

调用者权限、Agent 认证模式与 wire headers 是三项独立条件；任一项不满足都会在 runtime 调用前后产生不同错误。 || Caller permission, Agent authentication mode, and wire headers are independent conditions. A failure in each produces a different error before or during runtime invocation.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| Authentication | `Authorization: Bearer {powerPlatformToken}`<br>`scope: https://api.powerplatform.com/.default` |
| 调用者权限 || Caller Permission | `aud: https://api.powerplatform.com`<br>`scp: CopilotStudio.Copilots.Invoke`<br>需要 tenant consent；403 body 列出的缺失 delegated 权限优先。 || Tenant consent is required; missing delegated permissions in the 403 body are authoritative. |
| Agent 认证模式 || Agent Authentication Mode | 与调用者 token 分开判断：interactive delegated 按当前用户权限与 Agent 分享关系调用。 || Evaluate separately from the caller token: interactive delegated calls use the current user's permissions and Agent-sharing relationship. |
| Headers | `Content-Type: application/json`<br>`Accept: text/event-stream` |
| Request | `{ emitStartConversationEvent: true }` / `{ activity }` |
| Response | `SSE data: {Activity JSON}`<br>`x-ms-conversationid` response header |

SDK URL 不含 /conversations；SDK 会在 query string 之前插入路径。手写 fetch 时必须直接构造表中的完整 URL，不能在 ?api-version 后追加路径。 || The SDK URL excludes /conversations; the SDK inserts that path before the query string. For manual fetch, construct the complete URLs shown in the table and never append a path after ?api-version.

::panel
### 04.2 请求流程与返回处理 || 04.2 Request Flow and Response Processing
调用示例采用 interactive delegated 认证。建会话 POST 返回后先从 x-ms-conversationid header 保存 conversationId，再消费 SSE。仅 startConversation 不会产生用户问题对应的答案。 || This code sample uses interactive delegated authentication. After the conversation POST returns, save conversationId from the x-ms-conversationid header before consuming SSE. Starting a conversation alone does not produce an answer to the user's prompt.

```
const token = await msal.acquireTokenSilent({
  scopes: ['https://api.powerplatform.com/.default'], account,
})
const client = new CopilotStudioClient({ directConnectUrl }, token.accessToken)

for await (const activity of client.startConversationStreaming({ emitStartConversationEvent: true })) {
  conversationId ||= activity.conversation?.id || client.conversationId
  reduceTurnActivity(activity)
}
for await (const activity of client.sendActivityStreaming(message, conversationId)) {
  reduceTurnActivity(activity)
}
```

HTTP header 先确定会话，SSE parser 再按事件边界恢复 Activity JSON；终止 marker 不进入 UI。 || The HTTP header establishes the conversation first. The SSE parser then reconstructs Activity JSON at event boundaries, while terminal markers never enter the UI.

| 返回内容 || Return Content | 处理规则 || Processing Rule |
| --- | --- |
| `x-ms-conversationid` | 优先保存为后续 turn URL 的 conversationId；SDK 内部值作为回退 || Save as conversationId for subsequent turn URLs; use the SDK value as fallback |
| `SSE event/data` | 按空行切分事件，合并同一事件的多行 data，JSON.parse 后才交给 reducer || Split events on blank lines, join multiline data fields, and pass the parsed JSON to the reducer |
| `[DONE]` / `event: end` | 不创建 UI 消息。当前 MCSChat connector 忽略该事件并继续读到 response body EOF；若实现选择立即 cancel reader，必须先确认目标 runtime 不会在 marker 后发送有效 activity || Create no UI message. The current MCSChat connector ignores the event and continues until response-body EOF. An implementation may cancel the reader immediately only after confirming that the target runtime sends no valid activities after the marker |

Reducer 按 stream metadata 分类 activity，并在 final 前后维护 active state、alias 与 concluded tombstone。 || The reducer classifies activities from stream metadata and maintains active state, aliases, and concluded tombstones around finalization.

| 返回内容 || Return Content | 处理规则 || Processing Rule |
| --- | --- |
| `streamType=informative` | 更新工作状态，不进入答案 assembler || Update working status; do not enter the answer assembler |
| `streamType=streaming` / `streamSequence` | 空文本忽略；按 sequence 去重；用 streamId 找同一 answer state；chunkType 只作诊断，调用 mergeStreamingText 按 prefix/overlap 区分 cumulative、revision 与 delta || Ignore empty text, deduplicate by sequence, and locate one answer state by streamId. Treat chunkType as diagnostic and call mergeStreamingText to distinguish cumulative, revision, and delta payloads by prefix/overlap |
| `streamType=final` / `message + streamId` | 先把 streamId 及全部 alias 写入 concludedStreams tombstone，再删除 active state；后续命中 tombstone 的 chunk 直接丢弃。有内容时用 isDivergentFallbackFinal 比较 streamed/final：正常 final 完成同一 answer state；divergent final 保留流式答案并作为独立 fallback；空 final 触发 streamCancelled 并移除临时消息。当前 DirectEngineConnector 尚未接入 Classic tombstone 与 divergent branch，实施时必须补上 || Write streamId and every alias to a concludedStreams tombstone before deleting active state, then drop every later chunk that matches a tombstone. When content exists, compare streamed and final text with isDivergentFallbackFinal. A normal final completes the same answer state; a divergent final preserves the streamed answer and becomes a separate fallback. An empty final emits streamCancelled and removes the provisional message. The current DirectEngineConnector has not wired the Classic tombstone or divergent branch, so implementations must add both |
| 普通 typing / message || Plain typing / message | typing 只更新状态；无活动 stream 的 message 作为完整消息或 greeting || typing updates status only; a message without an active stream becomes a complete message or greeting |

::panel
### 04.3 注意事项、失败处理与验收 || 04.3 Caveats, Failure Handling, and Acceptance
获得 token 不等于 Agent 可调用。Delegated 需要核对 redirect URI、token audience、用户权限与 Agent 分享关系。 || Acquiring a token does not prove that the Agent is invokable. Delegated mode requires checks for redirect URI, token audience, user permissions, and the Agent-sharing relationship.

| 现象 || Symptom | 核对 || Check |
| --- | --- |
| `AADSTS50011` | 请求 redirectUri 与 Entra SPA 注册值逐字一致；MCSChat 使用 window.location.origin。 || The requested redirectUri must exactly match the Entra SPA registration; MCSChat uses window.location.origin. |
| `403 InsufficientDelegatedPermissions` | 读取 response body 列出的缺失权限；不要假设单一权限在所有租户都充分。 || Read missing permissions from the response body; do not assume one permission is sufficient in every tenant. |
| `D2EAccessDenied` | 检查 delegated permission、管理员同意、用户权限和 Agent 是否共享给该用户。 || Check delegated permission, admin consent, user access, and whether the Agent is shared with that user. |
| `CallerIdentityMismatch` | 同一 conversation 中更换了用户；重建 conversation，且后续 turn 保持原调用者。 || The user changed within one conversation. Start a new conversation and preserve the original caller for all later turns. |
| `401` | 检查 token aud、有效期与实际 SPA account。 || Check token aud, expiry, and the actual SPA account. |
| `404 / 403` | 确认 Agent 已 Published、schemaName 正确，并已共享给 delegated token 对应用户。 || Confirm that the Agent is published, schemaName is correct, and it is shared with the user represented by the delegated token. |
| SSE 无答案 || No Answer in SSE | 保留 HTTP status、response body、event count 与脱敏 activity；不要只根据 UI 判定根因。 || Preserve HTTP status, response body, event count, and redacted activities. Do not infer the root cause from UI alone. |

能力验收分成 transport、progressive 与 reducer/UI 三道门；任一道失败都要保留对应原始证据。 || Capability acceptance has three gates: transport, progressive delivery, and reducer/UI behavior. Preserve the corresponding raw evidence whenever a gate fails.

- 能力边界：当前 D2E connector 不支持文件上传；需要附件时改走 Direct Line 或另行验证官方能力。 || Capability boundary: the current D2E connector does not support file upload. Use Direct Line or validate another official capability when attachments are required.
- 非 2xx：应用层必须设置超时；SDK 调用持续等待时，用手写 fetch 预检保存 status/body 后中止，不做无限重试。 || Non-2xx: enforce an application-level timeout. If the SDK keeps waiting, use a manual fetch preflight to preserve status and body, then abort instead of retrying indefinitely.
- Transport gate：建会话与发送 turn 均返回 2xx，conversationId 稳定，SSE 完整结束。 || Transport gate: conversation creation and turn submission return 2xx, conversationId remains stable, and SSE completes cleanly.
- Progressive gate：至少两个不同的非空答案快照；只收到完整 final 时记录为 final-only。 || Progressive gate: at least two distinct non-empty answer snapshots. Record a complete final-only response as final-only.
- Reducer/UI gate：正常 final 只完成一个非空答案气泡；divergent final 允许在保留 streamed answer 后增加一条独立 fallback message；日志不含 access token。 || Reducer/UI gate: a normal final completes one non-empty answer bubble. A divergent final may add one separate fallback message after preserving the streamed answer. Logs contain no access token.

打开 Classic D2E delegated live test || Open the Classic D2E delegated live test
:::

## #new-directline 05 / New + Direct Line :: New Agent 的 Direct Line 可用性取决于 harness 与认证模式 || New Agent Direct Line Availability Depends on Harness and Authentication Mode

这不是一条可直接照抄的正式接口路线。对 GitHub Copilot harness，Microsoft Learn 当前把 Native app / Direct Line 标为不可用；其他 New Agent shape 只有在目标环境明确提供 channel、token bootstrap 和 routing contract 时才可实验。 || This is not a formally specified route that can be copied into an implementation. Microsoft Learn currently lists Native app / Direct Line as unavailable for the GitHub Copilot harness. Other New Agent shapes may be tested only when the target environment explicitly provides a channel, token bootstrap, and routing contract.

:::accordion
::panel { open: true }
### 05.1 支持边界与接口规格 || 05.1 Support Boundary and Interface Specification
缺少任何一项正式字段时，规格结论即为“当前不可实施”，切勿强行套用 Classic Direct Line endpoint。 || When any formal field is missing, the specification outcome is currently not implementable; never fall back to the Classic Direct Line endpoint.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| 支持状态 || Support Status | GitHub Copilot harness：Native app / Direct Line = No；其他 shape 取决于目标环境当前渠道矩阵 || GitHub Copilot harness: Native app / Direct Line = No. Other shapes depend on the current channel matrix in the target environment |
| Endpoint | 没有适用于所有 New Agent 的公开稳定 Direct Line endpoint；必须由目标环境的官方 bootstrap 返回 || No public stable Direct Line endpoint applies to every New Agent; the target environment's official bootstrap must return it |
| Method | bootstrap 未确认前无可声明规格；bootstrap 成功后才进入 Direct Line 3.0 REST + WebSocket || No method can be specified before bootstrap is confirmed. After bootstrap, use the returned Direct Line 3.0 REST plus WebSocket contract |
| Authentication | 由目标 shape 的 channel / bootstrap contract 决定；不得把 D2E Power Platform token 当作 Direct Line token || Defined by the target shape's channel and bootstrap contract. Never use a D2E Power Platform token as a Direct Line token |
| Request | 只有官方返回或样例明确要求时，startConversation 才携带 cci_bot_id / cci_environment_id || Include cci_bot_id / cci_environment_id in startConversation only when an official response or sample requires them |
| Response | bootstrap 返回 Direct Line domain/token/routing contract；POST /conversations 再返回 conversationId/token/streamUrl；WebSocket 返回 ActivitySet。三层都必须保存脱敏 capture 后才能确认实际 schema || Bootstrap returns the Direct Line domain, token, and routing contract. POST /conversations then returns conversationId, token, and streamUrl. The WebSocket returns ActivitySet. Preserve redacted captures of all three layers before confirming the actual schema |
| 默认替代路线 || Default Alternative | `New Agent + /3p D2E` |

::panel
### 05.2 请求流程与返回处理 || 05.2 Request Flow and Response Processing
只有目标环境已经返回可用 token、Direct Line domain 和 routing contract 时，才可继续推进四步实验流程；否则在接口发现阶段停止。 || Run this four-step experimental flow only after the target environment returns a usable token, Direct Line domain, and routing contract. Otherwise stop during interface discovery.

1. **确认 channel 与 bootstrap || Confirm Channel and Bootstrap** — 记录 harness、认证模式、bootstrap URL、HTTP status 与脱敏 response schema。 || Record the harness, authentication mode, bootstrap URL, HTTP status, and redacted response schema.
2. **使用返回值建会话 || Create a Conversation from Returned Values** — 使用返回的 Direct Line domain 与 token；仅按 contract 添加 routing IDs，不自行猜测字段。 || Use the returned Direct Line domain and token. Add routing IDs only as required by the contract; never infer fields.
3. **处理 ActivitySet || Process ActivitySet** — 沿用 Direct Line 的 ActivitySet 分发，但先保存 raw activities，再根据真实 streaminfo / payload 决定 reducer。 || Use Direct Line ActivitySet dispatch, but preserve raw activities before selecting a reducer from the observed streaminfo and payload.
4. **形成环境限定结论 || Produce an Environment-Scoped Result** — 报告具体 Agent shape、日期与环境；不得外推为所有 New Agent 的 Direct Line 支持。 || Report the exact Agent shape, date, and environment. Do not generalize the result to all New Agents.

::panel
### 05.3 注意事项、失败处理与验收 || 05.3 Caveats, Failure Handling, and Acceptance
这条路线的第一项验收不是“能收到消息”，而是接口来源、认证方式与支持边界均可追溯。 || The first acceptance criterion is not merely receiving a message; the interface source, authentication method, and support boundary must all be traceable.

- 禁止直接复用 Classic Direct Line token endpoint、domain 或 payload 假设。 || Do not directly reuse Classic Direct Line token endpoints, domains, or payload assumptions.
- bootstrap 返回 404 / 403，或缺少 Direct Line domain/token/routing contract 时停止；bootstrap 成功后，conversation response 缺少 conversationId/streamUrl 时同样停止。不得用隐藏 endpoint 或硬编码 routing ID 绕过。 || Stop when bootstrap returns 404 / 403 or omits the Direct Line domain, token, or routing contract. After successful bootstrap, also stop when the conversation response omits conversationId or streamUrl. Do not bypass either failure with hidden endpoints or hard-coded routing IDs.
- 通过：保存脱敏 bootstrap response、实际 Direct Line domain、startConversation request、ordered ActivitySet，以及一个完整 turn 的 UI 断言。 || Pass: preserve a redacted bootstrap response, actual Direct Line domain, startConversation request, ordered ActivitySet, and UI assertions for one complete turn.
- 未满足通过条件时，产品默认选择 New Agent /3p D2E。 || When these conditions are not met, use New Agent /3p D2E as the product default.
:::

## #new-d2e 06 / New + D2E :: New Agent 使用 agentic runtime /3p D2E，并返回更丰富的 turn events || New Agents Use Agentic Runtime /3p D2E and Return Richer Turn Events

适用于已 Published 且共享给当前用户的 New Agent。本章只覆盖 delegated Power Platform token：它切换到 agentic runtime /3p 与 api-version=1，并把 thought、informative、toolCall 与 answer 归一化为同一个 TurnState。 || Use this route for a published New Agent shared with the signed-in user. This chapter covers delegated Power Platform tokens only: it switches to agentic runtime /3p and api-version=1 and normalizes thought, informative, toolCall, and answer into one TurnState.

:::accordion
::panel { open: true }
### 06.1 支持边界与接口规格 || 06.1 Support Boundary and Interface Specification
New Agent D2E 不是替换 schemaName；runtime path、API version、payload 与 reducer 都与 Classic 不同。Microsoft Learn 尚未把 New Experience 列入 Client Library 正式支持矩阵。 || New Agent D2E is not a schemaName substitution. Its runtime path, API version, payload, and reducer differ from Classic. Microsoft Learn has not yet included New Experience agents in the formal Client Library support matrix.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| 支持状态 || Support Status | 技术可用；尚未进入 Microsoft Learn 的 Client Library 正式支持矩阵 || Technically available; not yet in the formal Microsoft Learn Client Library support matrix |
| Agent Shape | `cliagent-1.0.0`<br>`CLIAgentRecognizer` / `CLICopilotRecognizer` |
| SDK URL | `https://{envHost}/copilotstudio/agenticruntime/3p/dataverse-backed/authenticated/bots/{schemaName}?api-version=1` |
| 建会话 || Create Conversation | `POST .../bots/{schemaName}/conversations?api-version=1` |
| 发送 turn || Send Turn | `POST .../bots/{schemaName}/conversations/{conversationId}?api-version=1` |

表格所列规格对应已验证的 delegated 路径，也是 06.1 的唯一实施范围。 || This specification table covers the verified delegated path and defines the sole implementation scope of 06.1.

| 字段 || Field | 规格 || Specification |
| --- | --- |
| Authentication | `Authorization: Bearer {powerPlatformToken}`<br>`scope: https://api.powerplatform.com/.default` |
| 调用者权限 || Caller Permission | `aud: https://api.powerplatform.com`<br>`scp: CopilotStudio.Copilots.Invoke`<br>已验证：delegated permission + tenant consent。 || Verified: delegated permission plus tenant consent. |
| Agent 认证模式 || Agent Authentication Mode | 当前 live test 覆盖 No Authentication Agent 上的 interactive delegated 调用。 || The current live test covers interactive delegated calls to a No Authentication Agent. |
| Headers | `Content-Type: application/json`<br>`Accept: text/event-stream` |
| Request | `{ emitStartConversationEvent: true }` / `{ activity }` |
| Response | `SSE data: {Activity JSON}`<br>`thought + informative + toolCall + answer` |

::panel
### 06.2 请求流程与返回处理 || 06.2 Request Flow and Response Processing
调用代码同样采用 interactive delegated 认证。MSAL、POST 与 SSE 分帧方式和 Classic D2E 相同；差异从 directConnectUrl 和 activity reducer 开始。整个 conversation 必须复用同一个 client 实例。 || This code sample also uses interactive delegated authentication. MSAL, POST, and SSE framing match Classic D2E; differences begin with directConnectUrl and the activity reducer. Reuse one client instance for the entire conversation.

```
// MCSChat connector: this flag selects /agenticruntime/3p + api-version=1.
await directEngineConnector.connect({
  appClientId, tenantId, environmentId, schemaName,
  runtimeFamily: 'agentic3p',
})

// Copilot Studio Client SDK equivalent:
const directConnectUrl = `https://${envHost}/copilotstudio/agenticruntime/3p/` +
  `dataverse-backed/authenticated/bots/${schemaName}?api-version=1`
const client = new CopilotStudioClient({ directConnectUrl, cloud: 'Prod' }, accessToken)

for await (const activity of client.startConversationStreaming({ emitStartConversationEvent: true })) {
  conversationId ||= activity.conversation?.id || client.conversationId
  reduceNewAgentTurn(activity)
}
for await (const activity of client.sendActivityStreaming(message, conversationId)) {
  reduceNewAgentTurn(activity)
}
```

stream metadata 位于 channelData 或 streaminfo entity；thought 与 toolCall 则是同一 activity 的独立 entities。 || Stream metadata appears in channelData or a streaminfo entity, while thought and toolCall are separate entities on the same activity.

```
{
  "type": "typing",
  "text": "answer snapshot",
  "channelData": {
    "streamType": "streaming",
    "streamId": "answer-1",
    "streamSequence": 3,
    "chunkType": "full"
  },
  "entities": [
    { "type": "thought", "text": "reasoning snapshot" },
    { "type": "toolCall", "tool_call_id": "search-1", "status": "started" }
  ]
}
```

Reasoning 与工具生命周期进入 Work panel；两者都不创建答案气泡。 || Reasoning and tool lifecycles enter the Work panel; neither creates an answer bubble.

| Activity 位置 || Activity Location | 归一化事件 || Normalized Event | 处理规则 || Processing Rule |
| --- | --- | --- |
| `entities[type=thought].text` | `reasoningUpdate` | 用 mergeReasoningText 合并为一个 reasoning transcript，不创建多条 action row || Merge into one reasoning transcript with mergeReasoningText; do not create multiple action rows |
| `channelData.streamType=informative`<br>或 entities[type=streaminfo] || or entities[type=streaminfo] | `stageUpdate` | 按阶段标识更新同一行；晚到无 ID informative 应与已有 tool stage 匹配 || Update one row by stage identity; match late ID-less informative events to an existing tool stage |
| `entities[type=toolCall]`<br>`status=started/completed` | `stageUpdate` | `Map<tool_call_id, Stage>`，started / completed 共用一行 || share one row |

Answer reducer 只维护一个答案状态，并把 snapshot、final 与空 activity 分开处理。 || The answer reducer maintains one answer state and handles snapshots, finals, and empty activities separately.

| Activity 位置 || Activity Location | 归一化事件 || Normalized Event | 处理规则 || Processing Rule |
| --- | --- | --- |
| `streamType=streaming + activity.text` | `answerSnapshot` | `chunkType === 'delta' → append`<br>`otherwise → snapshot replace` （MCSChat 当前策略，须用 capture 验证） || (current MCSChat policy; verify with captures) |
| `streamType=final + activity.text` | `answerFinal` | 完成同一个答案状态；主 connector 仅丢弃与上一 final 文本完全相同的无分类 message，测试页 TurnAssembler 才承担更完整的 turn-level 去重 || Finalize the same answer state. The main connector drops only an unclassified message whose text exactly matches the previous final; broader turn-level deduplication belongs to the test-page TurnAssembler |
| 空 activity.text || Empty activity.text | 无 || None | 若无 thought / toolCall / informative，也不创建 Work row 或答案气泡 || When no thought, toolCall, or informative content exists, create neither a Work row nor an answer bubble |

::panel
### 06.3 注意事项、失败处理与验收 || 06.3 Caveats, Failure Handling, and Acceptance
生产采用前必须记录 delegated /3p 的实测结果与 Client Library 的正式支持状态，并用目标租户 raw export 验证 snapshot、事件顺序和 final 行为。 || Before production adoption, record delegated /3p observations and formal Client Library support status. Use a target-tenant raw export to verify snapshots, event ordering, and final behavior.

- 保持同一个 client 与 conversationId；中途重建 client 可能丢失 runtime state。 || Keep one client and conversationId; recreating the client mid-conversation may lose runtime state.
- thought / informative 可能在答案后到达；TurnState 负责时序，renderer 不按到达顺序追加 DOM。 || thought and informative events may arrive after the answer. TurnState owns ordering; the renderer must not append DOM by arrival order.
- 401 / 403 / 404 的检查方式与 Classic D2E 相同；另外确认 runtime path 包含 /agenticruntime/3p 且 api-version=1。 || Handle 401 / 403 / 404 as in Classic D2E, and confirm that the runtime path contains /agenticruntime/3p with api-version=1.
- 能力边界：当前 D2E connector 不支持文件上传；需要附件时改走已验证的其他渠道。 || Capability boundary: the current D2E connector does not support file upload. Use another validated channel when attachments are required.
- 非 2xx：应用层必须设置超时；SDK 持续等待时用手写 fetch 预检保存 status/body 后中止，不做无限重试。 || Non-2xx: enforce an application-level timeout. If the SDK keeps waiting, use a manual fetch preflight to preserve status and body, then abort instead of retrying indefinitely.
- Transport gate：两次 POST 返回 2xx，conversationId 稳定，SSE 完整结束；需要目标租户 live raw export 证明。 || Transport gate: both POST requests return 2xx, conversationId remains stable, and SSE completes. A live raw export from the target tenant is required as proof.
- Progressive gate：至少两个不同的非空 answer snapshots；需要 live raw export，synthetic replay 不能证明服务端 streaming。 || Progressive gate: at least two distinct non-empty answer snapshots. A live raw export is required; synthetic replay cannot prove server streaming.
- Reducer/UI gate：一个 reasoning paragraph；同一 tool ID 一行；一个非空答案气泡；零空气泡；零 pending stage；Work panel 位于答案前；测试页中重复 final 和晚到事件不增加消息数。 || Reducer/UI gate: one reasoning paragraph, one row per tool ID, one non-empty answer bubble, zero empty bubbles, zero pending stages, the Work panel before the answer, and no message-count increase from duplicate finals or late events in the test page.

[Live Test](https://illusion615.github.io/MCSChat/examples/d2e-streaming-test.html?agent=new) （目标租户 transport/progressive，须导出 raw activity） || (target-tenant transport/progressive; export raw activities) · [Deterministic Replay](https://illusion615.github.io/MCSChat/examples/d2e-streaming-test.html?agent=new&debug=1) · [Replay JSON](https://illusion615.github.io/MCSChat/examples/fixtures/new-agent-3p-replay.json) · [Expected Assertions](https://illusion615.github.io/MCSChat/examples/fixtures/new-agent-3p-expected.json) （后三者只证明 reducer/UI，不证明服务端 streaming） || (the latter three prove reducer/UI behavior, not server streaming)
:::

## #normalization 07 / Shared Message Architecture :: 四条 transport 路线最终进入同一个 TurnState || All Four Transport Routes Converge on One TurnState

Connector 不操作 DOM；它把 raw activity 转成 normalized events。Turn reducer 维护时序、去重与生命周期；Renderer 只根据 TurnState 更新 Work panel 和答案气泡。 || Connectors do not manipulate the DOM; they convert raw activities into normalized events. The turn reducer owns ordering, deduplication, and lifecycle. The renderer updates the Work panel and answer bubble from TurnState only.

:::accordion
::panel { open: true }
### 07.1 TurnState contract || 07.1 TurnState Contract
固定数据结构使测试页、主应用和未来客户端共享同一行为。 || A fixed state shape lets the test page, main app, and future clients share one behavior contract.

```
TurnState {
  phase: 'working' | 'streaming' | 'completed' | 'cancelled'
  reasoningText: string
  stages: Map<stageId, { label, status, durationMs? }>
  answer: { text, aliases, lastSequence, chunkCount, concluded }
  attachments: []
  actions: []
}
```

::panel
### 07.2 UI contract || 07.2 UI Contract
| 区域 || Surface | 允许内容 || Allowed Content | 禁止内容 || Forbidden Content |
| --- | --- | --- |
| Work panel | reasoning transcript · stage/tool lifecycle · elapsed time | 答案正文、raw JSON || Answer text, raw JSON |
| Answer bubble | 用户可见答案、附件、actions || User-facing answer, attachments, actions | transport chunk、内部状态 || Transport chunks, internal status |
| Error strip | HTTP status · error code · actionable next step | access token · secret |
| Developer log | 脱敏 raw activity 与时序 || Redacted raw activities and timing | 面向普通用户默认显示 || Visible to end users by default |

::panel
### 07.3 跨路线验收 || 07.3 Cross-Route Acceptance
- 正常 final 每轮最多一个非空答案气泡，final text 与最终气泡一致；divergent fallback 可作为独立 message，但不得覆盖 streamed answer。 || A normal final produces at most one non-empty answer bubble per turn, and final text matches that bubble. A divergent fallback may become a separate message but must not overwrite the streamed answer.
- Work panel 在 DOM 与视觉上都位于答案前。 || The Work panel precedes the answer in DOM and visual order.
- 同一 tool ID 的 started / completed 只有一行。 || Started / completed for one tool ID share one row.
- 空 activity 不创建气泡；重复 final 与晚到 chunk 不增加消息数。 || Empty activities create no bubble; duplicate finals and late chunks do not increase message count.
- TTFT 由首个非空答案计算，不由 typing / informative 计算。 || TTFT is measured from the first non-empty answer, not typing / informative events.
:::

## #evidence 08 / Online Validation and Evidence :: 每条结论都链接到可运行页面、代码提交或原始数据 || Link Every Claim to a Runnable Page, Commit, or Raw Dataset

实时页面验证目标环境；debug replay 验证 reducer；commit 固定实现版本；evidence bundle 保存脱敏 activity。四者作用不同，不能互相替代。 || The live page validates the target environment; debug replay validates reducers; commits pin implementation versions; evidence bundles preserve redacted activities. They serve different purposes and are not interchangeable.

:::comparison
::versus LIVE { highlight: true }
### New Agent /3p 实时验证 || Live New Agent /3p Validation
需要目标租户账号与 SPA redirect URI。用于验证登录、会话、真实 SSE 与 benchmark。 || Requires a target-tenant account and SPA redirect URI. Validates sign-in, conversation, real SSE, and benchmark behavior.

Open Live Test

::versus REPLAY
### 确定性 reducer replay || Deterministic Reducer Replay
加 debug=1 后在控制台调用 query-gated hook，验证 thought、tool、空 chunk、重复 final 与晚到事件。 || With debug=1, invoke the query-gated console hook to validate thought, tools, empty chunks, duplicate finals, and late events.

Open Replay Page

::versus CODE
### 固定实现版本 || Pinned Implementation
源码包含 /3p 路由、TurnAssembler、reasoning/tool reducers、Work panel、raw export 与 fixture runner。 || The source contains /3p routing, TurnAssembler, reasoning/tool reducers, the Work panel, raw export, and fixture runner.

Open Source

::versus DATA
### 可下载 evidence bundle || Downloadable Evidence Bundle
Direct Line 文件是脱敏 observed capture；New Agent replay 与 expected 是 synthetic deterministic fixture，不能当作生产抓包。 || The Direct Line file is a redacted observed capture. The New Agent replay and expected files are synthetic deterministic fixtures, not production captures.

[Direct Line observed JSON](https://illusion615.github.io/MCSChat/examples/fixtures/directline-classic-final-only.json) [New Agent replay JSON](https://illusion615.github.io/MCSChat/examples/fixtures/new-agent-3p-replay.json) [Expected assertions JSON](https://illusion615.github.io/MCSChat/examples/fixtures/new-agent-3p-expected.json)

::versus LOCAL ROUTER { highlight: true }
### Delegated Router 已在 localhost 跑通 || The Delegated Router Runs End to End on Localhost
Node.js Router 监听 127.0.0.1:8090，从加密 local MSAL cache 静默获取 delegated token，并把 New Agent /3p Activity SSE 归一化为 stage、answer 与 final。 || The Node.js Router listens on 127.0.0.1:8090, silently acquires delegated tokens from an encrypted local MSAL cache, and normalizes New Agent /3p Activity SSE into stage, answer, and final events.

Open Router Source

::versus SECURITY CHECK
### 浏览器无需读取 API key 或 Power Platform token || The Browser Reads Neither an API Key nor a Power Platform Token
localhost 页面通过 SameSite=Strict、HttpOnly 的签名 cookie 建立本地 session。实测 URL 与 Web Storage 无 key，document.cookie 不可见，console error 为 0。 || The localhost page establishes its local session with a signed SameSite=Strict, HttpOnly cookie. In the observed run, the URL and Web Storage contained no key, document.cookie exposed nothing, and console errors remained at zero.
:::

:::accordion
::panel
### 08.1 证据分级 || 08.1 Evidence Levels
| 证据 || Evidence | 能证明 || Supports | 不能证明 || Does Not Support |
| --- | --- | --- |
| Microsoft Learn | 正式支持矩阵 || Formal support matrix | 目标租户实际下发 || Emission in the target tenant |
| 官方 GitHub PR / sample || Official GitHub PR / sample | 实现存在、接口形态 || Implementation existence and interface shape | GA 承诺 || GA commitment |
| Live test + raw export | 当前环境 wire behavior || Current environment wire behavior | 所有环境通则 || Universal behavior across environments |
| Fixture replay | 客户端 reducer 与 UI contract || Client reducer and UI contract | 服务端真实 streaming || Real server streaming |

::panel { open: true }
### 08.2 2026-08-18 Local Router 实测 || 08.2 Local Router Measurements on August 18, 2026
三次顺序执行的单 turn 观测证明 localhost Router 能恢复加密 cache、调用真实 New Agent 并完成下游 SSE；这些数值包含 Agent 编排与工具耗时，不代表延迟 SLA。 || Three sequential single-turn observations show that the localhost Router restores its encrypted cache, calls the real New Agent, and completes downstream SSE. These timings include Agent orchestration and tool execution and do not constitute a latency SLA.

| 验证路径 || Validation Path | 下游事件 || Downstream Events | Answer snapshots || Answer Snapshots | TTFT | 总耗时 || Total | 结果 || Result |
| --- | --- | --- | --- | --- | --- |
| CLI · local-only 依赖回归 || CLI · local-only dependency regression | 8 | 1 | 8.84s | 9.56s | final 61 字，与最后 snapshot 一致；错误 key 返回 401 || 61-character final matched the last snapshot; an invalid key returned 401 |
| Browser · progressive 样本 || Browser · progressive sample | 13 | 4 | 24.65s | 25.91s | final 274 字，与最后 snapshot 一致 || 274-character final matched the last snapshot |
| Browser · UI 安全回归 || Browser · UI security regression | 8 | 1 | 11.42s | 11.97s | tool-call ID 未显示；Markdown 经 marked + DOMPurify 渲染 || Tool-call IDs were hidden; Markdown rendered through marked plus DOMPurify |

条件：同一 localhost Router、同一专用 delegated 用户、同一 New Agent；每次只发送一个 turn，不做预热。CLI evidence 只保存状态、长度、哈希和时序，不保存 token、key 或答案正文。 || Conditions: the same localhost Router, dedicated delegated user, and New Agent; one turn at a time with no warm-up. CLI evidence stores status, lengths, hashes, and timing only, never tokens, keys, or answer text.
:::

## #gateway-overview 09 / Gateway Challenges and Role :: D2E Streaming Gateway 以专用用户代替第三方登录，并保持现有 New Agent 的真实流式输出 || The D2E Streaming Gateway Replaces Third-Party Sign-In with a Dedicated User and Preserves Real Streaming from the Existing New Agent

第三方用户没有 Microsoft Entra 账号，但现有 New Agent /3p D2E streaming 已能由一个有权限的 Entra 用户调用。Gateway 位于第三方与 Copilot Studio 之间：管理员先让专用服务用户完成一次交互登录，Gateway 加密保存 MSAL token cache，随后静默获取 delegated Power Platform token，并把既有 D2E SSE 转成稳定的外部 API。第三方不参与 Microsoft 登录，也不会接触上游 token。 || Third-party users have no Microsoft Entra accounts, while the existing New Agent /3p D2E stream already works for an authorized Entra user. The gateway sits between third parties and Copilot Studio: an administrator completes one interactive sign-in for a dedicated service user, the gateway stores an encrypted MSAL token cache, then silently acquires delegated Power Platform tokens and exposes the existing D2E SSE through a stable external API. Third parties never participate in Microsoft sign-in or receive upstream tokens.

:::insight-grid { cols: 3 }
::card 01
### 平台身份隔离 || Platform Identity Isolation
调用方没有 Entra 身份，D2E 却要求 delegated Power Platform token。Gateway 保护专用用户的 MSAL cache；外部访问控制机制由项目选择，不限定为客户 JWT。 || The caller has no Entra identity, while D2E requires a delegated Power Platform token. The gateway protects the dedicated user's MSAL cache; the project selects the external access-control mechanism, which is not limited to customer JWTs.

::card 02
### 流式接口不匹配 || Streaming-Interface Mismatch
客户需要稳定的自定义 SSE API；D2E 返回平台 Activity SSE 和运行时特有事件。Gateway 负责解析、归一化、脱敏并立即转发。 || Customers need a stable custom SSE API, while D2E returns platform Activity SSE and runtime-specific events. The gateway parses, normalizes, redacts, and forwards them immediately.

::card 03
### 共享上游用户下的客户隔离 || Customer Isolation Under One Upstream User
所有 D2E 请求共享同一个专用用户，Copilot Studio 不认识外部客户。Gateway 必须独立承担租户授权、会话归属、配额、幂等和审计；Microsoft 审计会显示该专用用户。 || All D2E requests share one dedicated user, so Copilot Studio does not identify external customers. The gateway must own tenant authorization, conversation ownership, quotas, idempotency, and audit; Microsoft auditing shows the dedicated user.
:::

:::callout { title: "关键洞察 || Key Insight" }
定位：Gateway 是面向外部客户的流式接入边界，也是 D2E 的身份代理、协议适配与会话控制层；它不替代客户 IdP，不赋予最终用户 Entra 身份，也不改变 Copilot Studio Agent 的业务逻辑。 || Role: the gateway is the external-customer streaming boundary plus the D2E identity-proxy, protocol-adaptation, and conversation-control layer. It does not replace the customer IdP, give end users Entra identities, or change Copilot Studio Agent business logic.
:::

| 定位维度 || Dimension | Gateway 承担 || Gateway Owns | Gateway 不承担 || Gateway Does Not Own |
| --- | --- | --- |
| 身份 || Identity | 保护专用用户的加密 MSAL cache；按项目选择执行 JWT、API key、mTLS 或网络级访问控制 || Protect the dedicated user's encrypted MSAL cache and apply project-selected JWT, API key, mTLS, or network-level access control | 让第三方参与 Microsoft 登录、使用用户名密码 ROPC，或把上游 token 交给客户端 || Require third parties to sign in to Microsoft, use username-password ROPC, or give upstream tokens to clients |
| 协议 || Protocol | 把稳定的外部 REST + SSE contract 映射到 D2E POST + Activity SSE || Map a stable external REST plus SSE contract to D2E POST plus Activity SSE | 修改 D2E wire contract 或伪造客户端打字效果 || Modify the D2E wire contract or simulate client-side typing |
| 控制 || Control | 会话映射、隔离、并发、幂等、取消、配额和审计 || Conversation mapping, isolation, concurrency, idempotency, cancellation, quotas, and audit | 替代 Agent 编排、知识检索或工具业务授权 || Replace Agent orchestration, knowledge retrieval, or tool business authorization |

## #gateway-architecture 10 / Gateway System Architecture :: 三层架构区分核心必选链路、条件依赖与项目增强 || Three Layers Separate the Core Required Path, Conditional Dependencies, and Project Enhancements

最小运行链路只要求一个支持长连接的 Gateway runtime、一个专用 Entra 上游身份，以及 D2E POST / Activity SSE 适配。当前验证实现固定监听 127.0.0.1:8090，仅证明 delegated 身份代理、协议适配与浏览器消费链路，不包含公网入口或生产 SLA。未来若面向第三方网络开放，runtime 必须承担 TLS、调用方访问控制、限流、请求校验与 SSE 不缓冲；APIM 仍是可选治理组件，不是协议依赖。 || The minimum runtime path requires a gateway runtime that supports long-lived connections, one dedicated Entra upstream identity, and D2E POST / Activity SSE adaptation. The verified implementation binds to 127.0.0.1:8090 and proves delegated identity proxying, protocol adaptation, and browser consumption only; it includes neither a public endpoint nor a production SLA. A future third-party network deployment must provide TLS, caller access control, rate limits, request validation, and non-buffered SSE. APIM remains an optional governance component, not a protocol dependency.

:::diagram { src: "./media/d2e-gateway-architecture.zh.svg?v=20260818t", drawio: "./media/d2e-gateway-architecture.drawio", title: "Copilot Studio D2E Streaming Gateway 系统架构 || Copilot Studio D2E Streaming Gateway System Architecture" }
两条入口二选一：客户应用直连 Runtime，或经 APIM 转发。固定核心链路是 Runtime、D2E adapter 与专用 delegated 身份；会话状态存储在需要不透明 ID 或多轮时加入。加密 MSAL cache 保存在 Gateway 侧，不在 Microsoft 域。 || Choose one of two ingress paths: the customer calls the runtime directly or routes through APIM. The fixed core path is the runtime, D2E adapter, and dedicated delegated identity; the conversation state store joins when opaque IDs or multi-turn conversations are required. The encrypted MSAL cache lives on the gateway side, not in the Microsoft domain.
:::

:::callout { title: "关键洞察 || Key Insight" }
当前交付范围是 localhost Must Have 最小链路。Conditional 与 Nice to Have 只有在公网暴露、合规、规模或 SLA 提出明确要求时才进入后续设计；Azure 产品不是本次实现依赖。 || The current delivery scope is the localhost Must Have path. Conditional and Nice to Have components enter a later design only when public exposure, compliance, scale, or SLA creates an explicit requirement. Azure products are not dependencies of this implementation.
:::

| 级别 || Level | 组件能力 || Component Capability | 要求与建议 || Requirement and Suggestion |
| --- | --- | --- |
| **Must Have** | Streaming Gateway runtime || Streaming gateway runtime | 当前由 Node.js 22 进程监听 127.0.0.1:8090，支持长连接、增量 flush、取消和超时；公网 host 不在本次范围 || The current Node.js 22 process binds to 127.0.0.1:8090 and supports long-lived HTTP, incremental flush, cancellation, and timeouts; public hosting is outside this scope |
| **Must Have** | 专用 delegated 上游身份 || Dedicated delegated upstream identity | 专用用户 + CopilotStudio.Copilots.Invoke delegated permission + 加密 MSAL cache；管理员一次性交互登录，运行时只调用 acquireTokenSilent || Dedicated user plus CopilotStudio.Copilots.Invoke delegated permission and an encrypted MSAL cache. An administrator signs in interactively once; runtime uses acquireTokenSilent only |
| **Must Have** | D2E streaming adapter | 创建/复用 conversationId，发送 D2E POST，解析 Activity SSE 并立即转发；不得缓冲完整答案 || Create or reuse conversationId, send D2E POST, parse Activity SSE, and forward immediately; never buffer the complete answer |
| **Conditional** | 调用方访问控制 || Caller access control | 公网生产必须选 OIDC JWT、API key、mTLS 等一种；隔离 POC 可不接客户身份系统。客户自有 JWT 不是固定要求 || Public production must choose one mechanism such as OIDC JWT, API key, or mTLS; an isolated POC may omit a customer identity system. Customer-owned JWT is not a fixed requirement |
| **Conditional** | 会话状态存储 || Conversation state store | 多轮会话、opaque external ID、幂等或水平扩展时必须持久化；简单单实例 POC 可使用进程内状态。Azure 生产建议 Cosmos DB || Persist for multi-turn conversations, opaque external IDs, idempotency, or scale-out; a simple single-instance POC may use in-process state. Cosmos DB is suggested for Azure production |

四类可选增强组件不影响 D2E streaming 协议是否成立。项目根据公网暴露、合规、规模、SLA 和运维要求自行选用；coding agent 不得仅因指南提及就自动创建。 || These four optional enhancement components do not determine whether the D2E streaming protocol works. Select them according to public exposure, compliance, scale, SLA, and operations requirements; a coding agent must not create them merely because they appear in this guide.

| 级别 || Level | 建议组件 || Suggested Component | 何时采用 || When to Adopt |
| --- | --- | --- |
| **Nice to Have** | Azure API Management | 需要统一公网入口、集中认证策略、客户级限流或 API 生命周期治理时采用；省略时客户直连 Runtime，Runtime 必须实现同等必要保护。采用 APIM 时设置 buffer-response=false || Use for a unified public edge, centralized authentication policies, customer-level rate limits, or API lifecycle governance. When omitted, the customer calls the runtime directly and the runtime must implement the required protections. With APIM, set buffer-response=false |
| **Nice to Have** | Azure Key Vault | 用于保护 MSAL cache 加密密钥、外部 API key 与证书私钥；token cache 本体应保存在支持并发控制的持久存储中，切勿写入源码或普通配置 || Use to protect the MSAL-cache encryption key, external API keys, and certificate private keys. Store the token cache itself in durable storage with concurrency control, never in source code or ordinary configuration |
| **Nice to Have** | Application Insights + OpenTelemetry | 生产运维、SLA、性能分析或审计需要时；不得记录 token、prompt、answer 与 raw Activity || Use for production operations, SLA, performance analysis, or audit; never log tokens, prompts, answers, or raw Activities |
| **Nice to Have** | 私网与 WAF || Private Networking and WAF | 合规、固定出口、来源限制或高风险公网场景采用；不要把私网拓扑作为 POC 前置条件 || Use for compliance, fixed egress, source restrictions, or high-risk public exposure; do not make private networking a POC prerequisite |

## #gateway-contract 11 / Gateway External Contract and Boundaries :: Gateway 代表专用用户调用同一个 Agent，并向无 Entra 账号的客户提供隔离的 SSE API || The Gateway Invokes the Same Agent as a Dedicated User and Exposes an Isolated SSE API to Customers Without Entra Accounts

Gateway 使用专用 Entra 用户的 delegated token 访问 D2E。管理员只在初始化或 Conditional Access 要求重新认证时参与 Microsoft 登录；第三方调用始终使用 Gateway 自己的访问控制。Agent 的 No Authentication 关闭最终用户登录，但不会让 D2E endpoint 变成匿名接口。每个 conversation 始终绑定同一个专用用户，不得在会话中更换身份。 || The gateway accesses D2E with a delegated token for one dedicated Entra user. An administrator participates in Microsoft sign-in only during initialization or when Conditional Access requires reauthentication; third-party calls always use the gateway's own access controls. Agent No Authentication removes end-user sign-in but does not make the D2E endpoint anonymous. Every conversation remains bound to the same dedicated user and must not change identity mid-conversation.

:::accordion
::panel
### 11.1 信任边界与组件职责 || 11.1 Trust Boundaries and Component Responsibilities
外部调用方身份与 Power Platform 上游身份不得混用。当前上游身份是专用用户的 delegated session；未启用外部身份的隔离 POC 也必须保护 MSAL cache 和 D2E token。 || External caller identity and Power Platform upstream identity must remain separate. The current upstream identity is the dedicated user's delegated session; even an isolated POC without external identity must protect the MSAL cache and D2E token.

| 边界 || Boundary | 身份与凭据 || Identity and Credential | 责任 || Responsibility | 禁止 || Prohibited |
| --- | --- | --- | --- |
| 调用方 → Gateway || Caller → Gateway | 项目选择：OIDC JWT、API key、mTLS、网络限制；隔离 POC 可暂不启用 || Project choice: OIDC JWT, API key, mTLS, or network restrictions; an isolated POC may temporarily omit it | 启用后验证调用方、授权 Agent、派生主体并执行配额 || When enabled, authenticate the caller, authorize the Agent, derive the principal, and enforce quotas | 把外部凭据当作 Power Platform token，或信任客户端自报的授权字段 || Treat external credentials as Power Platform tokens or trust client-supplied authorization fields |
| Gateway → Entra | 专用用户 + server-side MSAL client + 加密持久化 token cache || Dedicated user plus a server-side MSAL client and an encrypted persistent token cache | 初始化时由管理员完成 authorization code + PKCE 登录；运行时调用 acquireTokenSilent。出现 interaction_required 时停止上游请求并通知管理员重新登录 || An administrator completes an authorization-code plus PKCE sign-in during initialization; runtime calls acquireTokenSilent. On interaction_required, stop upstream calls and notify an administrator to sign in again | 使用 ROPC 保存用户名密码、把 refresh/access token 返回客户端，或在每个客户请求中触发交互登录 || Use ROPC to store a username and password, return refresh/access tokens to clients, or trigger interactive sign-in for each customer request |
| Gateway → D2E | `scp=CopilotStudio.Copilots.Invoke`<br>`idtyp=user` | 保持同一专用用户和 conversationId，解析上游 Activity SSE || Keep the same dedicated user and conversationId and parse upstream Activity SSE | 在同一 conversation 中更换用户或暴露 raw token || Change users or expose a raw token within one conversation |
| 匿名 Agent → 工具 || Anonymous Agent → Tools | 应用级或显式传入的业务上下文；没有最终用户 Entra 身份 || Application-level or explicitly supplied business context; no end-user Entra identity | 工具 API 根据 Gateway 签发的受控上下文重新授权 || Tool APIs authorize again from controlled context issued by the gateway | 依靠 prompt、Activity.from.id 或任意文本字段执行行级授权 || Use prompts, Activity.from.id, or arbitrary text fields for row-level authorization |

1. **客户只调用 Gateway || Customers Call Only the Gateway** — D2E host、environmentId、schemaName、上游身份配置、加密 MSAL cache 与 upstream conversationId 都保留在服务端。 || Keep the D2E host, environmentId, schemaName, upstream identity configuration, encrypted MSAL cache, and upstream conversationId on the server.
2. **Gateway 绑定调用方与会话 || The Gateway Binds the Caller and Conversation** — 启用调用方身份时，每次会话读写都匹配派生主体、agentId 与 externalConversationId；未启用身份的隔离 POC 只允许单一受信调用方，不提供多租户授权。 || When caller identity is enabled, every conversation read or write matches the derived principal, agentId, and externalConversationId. An isolated POC without identity allows only one trusted caller and provides no multitenant authorization.
3. **Gateway 转发并收敛事件 || The Gateway Forwards and Narrows Events** — 上游 Activity 先进入既有 reducer，再输出稳定的外部事件；默认不暴露 access token、raw Activity、thought 文本或工具参数。 || Pass upstream Activities through the existing reducer before emitting stable external events. Do not expose access tokens, raw Activities, thought text, or tool arguments by default.

::panel { open: true }
### 11.2 外部 API 与事件 || 11.2 External API and Events
Gateway 自定义的下游 contract 并非 Copilot Studio D2E 或 Agents SDK 官方接口。它包含建会话、发送 turn 和关闭会话三个动作；客户只持有不透明的 externalConversationId。 || This custom downstream contract is defined for the gateway and is not an official Copilot Studio D2E or Agents SDK interface. It exposes create conversation, send turn, and close conversation; customers hold only an opaque externalConversationId.

| 接口 || Endpoint | 请求 || Request | 成功响应 || Success Response | 约束 || Constraint |
| --- | --- | --- | --- |
| `POST /v1/conversations` | `{ "agentId": "support" }`<br>项目选定凭据（若启用） || Project-selected credential (when enabled) | `201`<br>`{ "conversationId", "expiresAt" }` | 服务端选择 environment/schema。参考实现未做建会话幂等；重复调用会创建新会话 || The server selects environment/schema. The reference implementation has no create-conversation idempotency; a repeated call creates a new conversation |
| `POST /v1/conversations/{id}/turns` | `{ "text": "...", "clientTurnId": "..." }`<br>`Accept: text/event-stream` | `200 text/event-stream` | 同一会话只允许一个进行中的 turn；重复 clientTurnId 返回 409 且不调用上游 || Allow one in-flight turn per conversation; a repeated clientTurnId returns 409 without invoking upstream |
| `DELETE /v1/conversations/{id}` | 项目选定凭据（若启用） || Project-selected credential (when enabled) | `204` | 把本地记录标记为 closed 并释放锁；记录继续作为调试证据保留，不中断已在上游执行的 turn，也不删除 Copilot Studio 会话 || Mark the local record closed and release its lock. Retain the record as debug evidence; this neither interrupts an upstream turn already in progress nor deletes the Copilot Studio conversation |

每个 SSE frame 使用 event、id 与单行 JSON data；event ID 在单次 turn 内单调递增。本版本不持久化事件，也不支持 Last-Event-ID 续传；断线后客户发起新 turn。 || Each SSE frame uses event, id, and one-line JSON data; event IDs increase monotonically within a turn. This version does not persist events or support Last-Event-ID resume; after disconnect, the customer starts a new turn.

```
event: stage
id: 1
data: {"turnId":"t_123","stageId":"reasoning","stage":"reasoning","status":"started"}

event: answer
id: 2
data: {"turnId":"t_123","text":"partial answer","mode":"snapshot"}

event: final
id: 3
data: {"turnId":"t_123","text":"complete answer","finishReason":"completed"}
```

- `stage`：可选的脱敏工作状态；不包含 thought 正文或工具输入输出。 || : optional sanitized work status without thought text or tool inputs and outputs.
- `answer`：统一输出 snapshot；既有 TurnState reducer 负责合并 delta、revision 与 cumulative payload，Gateway 只投影 normalized answer。 || : always emits a snapshot; the existing TurnState reducer merges delta, revision, and cumulative payloads, while the gateway only projects normalized answers.
- `final`：每个成功 turn 恰好一个；允许 final-only；final 后不得再输出业务事件。 || : exactly one per successful turn; final-only is allowed and no business event follows final.
- `error`：只在 HTTP headers 已发送后使用；error 后不得再输出业务事件。归约层产生的 error 只带 code 与可重试标志（如 UPSTREAM_EMPTY_FINAL），传输层产生的 error 额外带 correlationId（如 UPSTREAM_STREAM_ENDED_WITHOUT_FINAL、STREAM_INTERRUPTED、CLIENT_DISCONNECTED）。 || : used only after HTTP headers have been sent, and no business event follows it. Reducer-level errors carry only a code and a retry flag, such as UPSTREAM_EMPTY_FINAL, while transport-level errors also carry correlationId, such as UPSTREAM_STREAM_ENDED_WITHOUT_FINAL, STREAM_INTERRUPTED, and CLIENT_DISCONNECTED.
- `: keep-alive`：无业务事件时每 20 秒发送注释帧，不进入客户端消息模型。 || : emit a comment frame every 20 seconds without a business event; clients do not add it to the message model.

06 路线的上游 Activity 帧按映射规则归约成外部 SSE 事件。Router 的 reducer 是纯函数：输入一个 Activity，输出零到多个下游事件，不持有 DOM 或传输状态。 || Upstream Activity frames from route 06 reduce into external SSE events according to the mapping table. The Router reducer is pure: it takes one Activity and returns zero or more downstream events, holding no DOM or transport state.

| 上游 Activity 特征 || Upstream Activity Trait | 下游事件 || Downstream Event | 关键字段 || Key Fields | 抑制规则 || Suppression Rule |
| --- | --- | --- | --- |
| `entities[type=thought]` 非空 || non-empty | `stage` | `stageId=reasoning`<br>`stage=reasoning`<br>`status=started` | 同一 stageId 状态未变化则不发帧 || Emit nothing when the status for the same stageId is unchanged |
| tool call 事件 || Tool-call events | `stage` | `stageId=tool:{toolCallId}`<br>`stage=tool`<br>`status=started&#124;completed&#124;failed`<br>`durationMs?` | 上游状态词先归一到三态，再按 stageId 去重 || Normalize upstream status words into three states, then deduplicate by stageId |
| `streamType=informative`<br>且该帧无 tool call || with no tool call in the same frame | `stage` | `stageId=working`<br>`stage=working`<br>`status=started` | 该帧到此为止，不产生 answer；TTFT 不由它计算 || The frame stops here and produces no answer; it does not start the TTFT clock |
| `streamType=streaming`<br>或带 streamSequence，或 type=typing 且有 text || or carries streamSequence, or type=typing with text | `answer` | `text` 为合并后的全量快照 || is the merged full snapshot<br>`mode=snapshot` | 按 chunkType 合并 delta 或整体替换；文本无变化、或 streamSequence 回退，都丢弃该帧 || Merge delta or replace wholesale by chunkType; drop the frame when the text is unchanged or streamSequence regresses |
| `streamType=final`<br>或 type=message 且有 text || or type=message with text | `stage` → `final` | 先把仍为 started 的 stage 补发 completed，再发 final || Close every still-started stage with completed, then emit final | reducer 就此冻结；之后所有 Activity 一律返回空数组 || The reducer freezes; every later Activity returns an empty array |
| 收尾时最终文本为空 || Final text is empty at conclusion | `error` | `code=UPSTREAM_EMPTY_FINAL`<br>`retryable=false` | 不发 final；空答案不得表现为成功轮次 || Emit no final; an empty answer must not appear as a successful turn |

因为存在去重与合并，下游事件数不等于上游帧数：08.2 的两个样本分别是 8 帧对 1 个 answer 快照、13 帧对 4 个。已知缺口：stageId 采用 tool:{toolCallId}，会把上游 tool call ID 带到下游；面向第三方开放前应换成每轮重新编号的本地序号。 || Deduplication and merging mean downstream event counts do not equal upstream frame counts: the two samples in 08.2 are 8 frames to 1 answer snapshot and 13 frames to 4. Known gap: stageId uses tool:{toolCallId}, which carries the upstream tool-call ID downstream; replace it with a per-turn local index before opening the contract to third parties.

四类归一化事件构成了开放给第三方的唯一契约。参考实现另有一条仅限本机的 Activity 透传通道：逐帧原样转发上游 Activity，只把 activity.conversation.id 改写成不透明 ID，其余字段不动。两条通道共用同一套身份、会话存储与并发控制，区别只在下游写什么。 || The four normalized events form the only contract offered to third parties. The reference implementation adds a loopback-only Activity passthrough channel that forwards upstream Activities frame by frame, rewriting activity.conversation.id to the opaque ID and leaving every other field untouched. Both channels share the same identity, conversation store, and concurrency control; they differ only in what they write downstream.

| 通道 || Channel | 下游内容 || Downstream Payload | 准入 || Access | 存在理由 || Why It Exists |
| --- | --- | --- | --- |
| 归约（第三方） || Reduced (third party) | `stage` / `answer` / `final` / `error` | 调用方凭据 || Caller credential | 稳定的外部 contract；不含 thought 正文、工具参数与上游 ID || A stable external contract without thought text, tool arguments, or upstream IDs |
| 透传（仅本机验证） || Passthrough (loopback verification only) | 原始 Activity 帧 || Raw Activity frames | 本机会话或管理凭据 || Loopback session or administrator credential | 让验证页复用直连页的渲染管线；两侧导出物逐字段 diff 即可发现 Router 是否改变了 D2E 数据结构 || Lets the verification page reuse the direct-connect rendering pipeline; diffing both exports field by field reveals whether the Router altered the D2E data structure |

透传通道必须与第三方面隔离：原始 Activity 携带 entities[type=thought] 正文与工具调用参数，正是归约契约刻意不下发的内容。参考实现只在 loopback 运行模式下注册该路由。 || The passthrough channel must stay isolated from the third-party surface: raw Activities carry entities[type=thought] text and tool-call arguments, exactly what the reduced contract deliberately withholds. The reference implementation registers the route only in loopback mode.
:::

## #gateway-runtime 12 / Gateway Runtime and State :: 专用用户身份、会话锁与禁止重放规则共同保护每个 turn || Dedicated-User Identity, Conversation Locks, and a No-Replay Rule Protect Every Turn

Gateway 只为已完成 delegated live probe 的 Agent 开放专用用户路线；身份状态必须为 ready，同一 conversation 串行执行 turn。D2E POST 发出后禁止自动重试，避免同一输入执行两次。 || The gateway enables the dedicated-user route only for Agents with a delegated live probe. Identity state must be ready and turns are serialized within a conversation. Automatic retries are prohibited after sending the D2E POST to avoid duplicate execution.

:::accordion
::panel { open: true }
### 12.1 能力注册与会话状态 || 12.1 Capability Registration and Conversation State
路由配置与会话状态分别持久化；没有当前 live probe 证据的 Agent fail closed。 || Persist routing configuration separately from conversation state; an Agent without current live-probe evidence fails closed.

参考实现只服务单一 Agent：environmentId、schemaName、apiVersion 和上游 scope 均来自启动配置，agentId 在建会话时校验 allowlist。身份状态是全局的，不按 Agent 分开记录。 || The reference implementation serves a single Agent: environmentId, schemaName, apiVersion, and the upstream scope all come from startup configuration, and agentId is checked against an allowlist when a conversation is created. Identity state is global instead of recorded per Agent.

```
RouterConfig {
  environmentId: GUID          // 推导 environmentHost
  schemaName: string
  apiVersion: string
  scope: 'https://api.powerplatform.com/.default'
  upstreamTimeoutMs: number
  conversationTtlMinutes: number
}

IdentityState = 'ready' | 'reauthRequired' | 'disabled'
```

多 Agent 路由尚未实现。若要扩展，需要把 environment/schema/身份绑定与活体探测证据一起下沉到每个 agentId，并对没有当前证据的 Agent fail closed。 || Multi-Agent routing is not implemented. Extending it requires pushing the environment/schema/identity binding and live-probe evidence down to each agentId and failing closed for Agents without current evidence.

localhost 实现把 encrypted MSAL cache、account metadata 与 conversation JSON 分开保存到 mode-600 文件。所有写入先落同目录临时文件，再用原子 rename 替换；SHA-256 ETag 防止并发覆盖。会话记录不包含 access token、refresh token、cache blob、UPN 或答案正文。 || The localhost implementation stores the encrypted MSAL cache, account metadata, and conversation JSON in separate mode-600 files. Every write uses a same-directory temporary file followed by an atomic rename, while SHA-256 ETags prevent concurrent overwrites. Conversation records contain no access token, refresh token, cache blob, UPN, or answer text.

```
GatewayConversation {
  id: opaque UUID
  subjectHash: SHA-256
  agentId: string
  upstreamConversationId: string
  status: 'active' | 'busy' | 'closed' // 过期在读取时判定，不写回状态
  recentTurnIds: string[]
  activeClientTurnId?: string
  createdAt: timestamp
  updatedAt: timestamp
  expiresAt: timestamp
  version: number
  lockOwner?: string
  lockExpiresAt?: timestamp
}
```

默认会话功能 TTL 为 60 分钟；过期只阻止新 turn，不删除记录。会话、日志和逐轮调试轨迹使用独立的 30 天证据保留期，也可由管理员按时间点清理。turn lock 等于 upstream timeout 加 30 秒，当前配置为 210 秒。recentTurnIds 最多保留 100 个 clientTurnId。每次变更都要求 ETag 匹配；若 D2E POST 的结果不确定，Router 不自动重放。该 local store 只支持单主机原型，不声明多实例一致性。 || The default functional conversation TTL is 60 minutes; expiry blocks new turns without deleting the record. Conversations, logs, and per-turn debug traces use a separate 30-day evidence-retention window and may also be purged by an administrator at an explicit cutoff. The turn lock equals the upstream timeout plus 30 seconds, currently 210 seconds. recentTurnIds retains at most 100 clientTurnId values. Every mutation requires an ETag match; when the outcome of a D2E POST is unknown, the Router does not replay it automatically. This local store supports a single-host prototype and makes no multi-instance consistency claim.

::panel
### 12.2 流式运行与失败处理 || 12.2 Streaming Runtime and Failure Handling
运行时必须保持全程流式传输，并明确区分失败发生在首个响应字节之前还是之后；两种情况走不同的错误通道。 || The runtime must preserve streaming throughout the call and distinguish failures before and after the first response byte because they use different error channels.

1. **认证并授权外部调用 || Authenticate and Authorize the External Call** — 从已验证凭据派生客户主体，核对 Agent allowlist、速率、并发与请求大小；失败时不得调用 Entra 或 D2E。 || Derive the customer principal from verified credentials and check the Agent allowlist, rate, concurrency, and request size. Do not call Entra or D2E on failure.
2. **锁定会话并静默获取上游 token || Lock the Conversation and Silently Acquire an Upstream Token** — Gateway 从加密 MSAL cache 加载专用用户账号，调用 acquireTokenSilent 获取 https://api.powerplatform.com/.default delegated token。MSAL 负责 refresh token 轮换；Gateway 不直接读取或持久化单独的 refresh token。 || The gateway loads the dedicated user account from the encrypted MSAL cache and calls acquireTokenSilent for a delegated https://api.powerplatform.com/.default token. MSAL owns refresh-token rotation; the gateway never reads or persists a standalone refresh token.
3. **调用 D2E 并立即转发 || Call D2E and Forward Immediately** — 上游请求携带 Accept: text/event-stream；Gateway 按空行解析 SSE，执行 reducer 后立即 flush。超时判定与流取消集中收敛在单一帧读取路径中，Activity 解析与归约叠加上层，避免两条下游契约各自维护一套超时逻辑。当前 localhost 链路没有反向代理；未来如加入 APIM 或其他代理，必须关闭响应缓冲。 || Send Accept: text/event-stream upstream, parse SSE on blank lines, and flush immediately after reduction. Timeout classification and stream cancellation live in a single frame-reading path, with Activity parsing and reduction layered on top, so the two downstream contracts never maintain divergent timeout logic. The current localhost path has no reverse proxy. Any future APIM or other proxy layer must disable response buffering.
4. **尝试取消并释放本地状态 || Attempt Cancellation and Release Local State** — 客户端断开或超时时，Gateway 中止本地 upstream fetch 并在 finally 中释放租约。该动作不保证 D2E 服务端停止处理或停止计费；目标环境必须单独验证。 || When the client disconnects or a timeout occurs, the gateway aborts its local upstream fetch and releases the lease in finally. This does not guarantee that D2E stops server-side processing or billing; validate that separately in the target environment.

| 情况 || Condition | 外部结果 || External Result | 重试规则 || Retry Rule |
| --- | --- | --- |
| 客户认证或授权失败 || Customer authentication or authorization fails | `401 AUTHENTICATION_REQUIRED`<br>`403 AGENT_ACCESS_DENIED` | 不调用上游；客户修正凭据或授权 || Do not call upstream; the customer corrects credentials or authorization |
| 会话不存在、过期或主体不匹配 || Conversation is missing, expired, or owned by another principal | `404 CONVERSATION_NOT_FOUND` | 新建会话；不泄露具体原因 || Create a new conversation; do not disclose the exact reason |
| 同一会话已有 turn || The conversation already has an active turn | `409 CONVERSATION_BUSY` | 带 Retry-After；不得并行调用上游 || Include Retry-After; do not call upstream concurrently |
| `interaction_required`<br>或专用用户被禁用 / consent 撤销 || or dedicated user disabled / consent revoked | `503 UPSTREAM_IDENTITY_REAUTH_REQUIRED` | 不调用 D2E，不循环弹登录；把身份状态标记为 reauthRequired，通知管理员按 runbook 重新登录并更新加密 cache || Do not call D2E or loop interactive prompts. Mark identity state reauthRequired and notify an administrator to sign in again and update the encrypted cache according to the runbook |
| 上游返回非 2xx || Upstream returns a non-2xx status | 首字节前返回 || Returned before the first byte | 参考实现统一返回 502 UPSTREAM_D2E_ERROR 并丢弃上游响应正文；未实现针对 401 的静默刷新重试 || The reference implementation returns 502 UPSTREAM_D2E_ERROR and discards the upstream response body; no 401-specific silent-refresh retry is implemented |

| 情况 || Condition | 外部结果 || External Result | 重试规则 || Retry Rule |
| --- | --- | --- |
| D2E POST 发出前的 DNS/TCP/TLS 失败 || DNS/TCP/TLS failure before sending the D2E POST | `502 UPSTREAM_OUTCOME_UNKNOWN` | 参考实现不重试：fetch 抛出时无法区分请求是否已送达上游，统一归为 outcome unknown；需要区分时要先引入连接阶段判定 || The reference implementation does not retry: when fetch throws, whether the request reached upstream is unknown, so everything maps to outcome unknown. Distinguishing them requires a connect-phase signal first |
| D2E POST 已发出 || The D2E POST was sent | `502 UPSTREAM_OUTCOME_UNKNOWN` 或 `504 UPSTREAM_TIMEOUT` | 禁止自动重试；保留 conversation，由客户决定下一步 || Never retry automatically; preserve the conversation and let the customer decide the next step |
| 已经输出 answer 后上游失败 || Upstream fails after an answer event was emitted | `event: error`<br>`code=STREAM_INTERRUPTED` | 不得自动重放 turn；客户端可新建 turn 或会话 || Never replay the turn automatically; the client may create a new turn or conversation |

Power Platform 环境主机同时发布 A 与 AAAA 记录。Node 的 Happy Eyeballs 默认只给每个地址族 250 毫秒尝试窗口；在没有可用 IPv6 出口的网络里，AAAA 尝试既不快速失败也来不及回落，连接以 ETIMEDOUT 结束，在 Router 里表现为看不出原因的 502。 || Power Platform environment hosts publish both A and AAAA records. Node's Happy Eyeballs allows only a 250-millisecond attempt window per address family by default. On networks without usable IPv6 egress, the AAAA attempt neither fails fast nor falls back in time, the connection ends in ETIMEDOUT, and the Router surfaces an unexplained 502.

| 每族尝试窗口 || Per-Family Attempt Window | 连续建连样本 || Consecutive Connect Attempts | 成功 || Succeeded | ETIMEDOUT |
| --- | --- | --- | --- |
| 250 ms（Node 默认） || 250 ms (Node default) | 12 | 2 | 10 |
| 2000 ms | 12 | 12 | 0 |

参考实现在进程启动时调用 setDefaultAutoSelectFamilyAttemptTimeout()，取值 3000 毫秒并可用环境变量覆盖，同时在错误日志里记录底层 system error code。缺少这个 code，连接层失败与上游业务失败在下游看起来完全一样。该数值取决于网络出口，部署前应在目标环境重测。 || The reference implementation calls setDefaultAutoSelectFamilyAttemptTimeout() at process start with 3000 milliseconds, overridable by environment variable, and logs the underlying system error code. Without that code, a connect-layer failure and an upstream business failure look identical downstream. The value depends on network egress and should be re-measured in the target environment before deployment.
:::

## #gateway-assurance 13 / Gateway Security, Observability, and Acceptance :: 调用方访问控制、敏感信息保护和故障测试构成试点门槛 || Caller Access Control, Sensitive-Data Protection, and Failure Tests Form the Pilot Gate

固定安全要求是保护专用用户与加密 MSAL cache、限制调用来源并避免敏感日志。专用用户应独立于个人账号，只授予 Agent viewer 与运行所需的最小权限；Conditional Access、MFA、账号禁用和 consent 撤销都可能触发管理员重新登录。外部认证机制由项目选择，Gateway 始终承担客户隔离责任。 || The fixed security requirements are to protect the dedicated user and encrypted MSAL cache, restrict call sources, and avoid sensitive logs. The dedicated user must be separate from personal accounts and receive only Agent viewer access plus the minimum runtime permissions. Conditional Access, MFA, account disablement, and consent revocation can all require administrator sign-in again. The project selects external authentication, and the gateway always owns customer isolation.

:::accordion
::panel { open: true }
### 13.1 安全与观测 contract || 13.1 Security and Observability Contract
启用多租户访问控制时，tenantId 与 subject 必须从已验证的服务端身份映射派生，不接受客户端直接传值；隔离 POC 不声明多租户隔离能力。 || When multitenant access control is enabled, derive tenantId and subject from a validated server-side identity mapping and never accept client-supplied values. An isolated POC does not claim multitenant isolation.

- 访问控制：若选择 OIDC，只允许批准算法并校验签名、issuer、audience、有效期和 JWKS；若选择 API key 或 mTLS，按项目的密钥轮换或证书链策略校验。 || Access control: for OIDC, allow approved algorithms and validate signature, issuer, audience, lifetime, and JWKS; for API key or mTLS, apply the project's key-rotation or certificate-chain policy.
- 证据：普通日志禁止记录 Authorization、token、secret、私钥、完整 prompt/answer、raw Activity 与工具参数，只记录长度、哈希、状态和时序。仅 loopback 调试模式可另行写入逐轮轨迹，保留 Activity 正文、thought 与归约事件，但仍强制剥离全部凭据；默认开启，可持久关闭，单轮上限 256 KB。 || Evidence: ordinary logs never record Authorization, tokens, secrets, private keys, full prompts or answers, raw Activities, or tool arguments; they keep only lengths, hashes, status, and timing. Loopback debug mode may additionally write per-turn traces that retain Activity bodies, thought text, and reduced events while still stripping every credential. Capture defaults on, can be persistently disabled, and is capped at 256 KB per turn.
- 追踪：生成或传播 correlationId 与 W3C traceparent；审计包含 tenant、subjectHash、agentId、conversationId、clientTurnId、outcome、upstreamStatus、durationMs、chunkCount、disconnectReason。 || Tracing: generate or propagate correlationId and W3C traceparent; audit tenant, subjectHash, agentId, conversationId, clientTurnId, outcome, upstreamStatus, durationMs, chunkCount, and disconnectReason.
- 指标：请求数、活动流、Gateway 附加延迟、上游错误、断开、锁竞争和 token cache hit；只按 tenant、agentId、outcome 分维度。 || Metrics: request count, active streams, gateway-added latency, upstream errors, disconnects, lock contention, and token-cache hits; dimension only by tenant, agentId, and outcome.

::panel
### 13.2 自动化验收 || 13.2 Automated Acceptance
当前实现验收 dedicated delegated 身份、token-cache 生命周期、D2E transport、SSE、取消和错误通道。只有启用相应能力时，才追加外部身份、持久状态、隔离、并发和幂等测试。只检查 UI 不构成通过。 || The implementation validates dedicated delegated identity, token-cache lifecycle, D2E transport, SSE, cancellation, and error channels. Add external identity, persistent state, isolation, concurrency, and idempotency tests only when those capabilities are enabled. Checking the UI alone is insufficient.

- Delegated 身份：identityState=ready 且 evidence 未过期；验证 aud、tid、有效期、idtyp=user 与 scp 包含 CopilotStudio.Copilots.Invoke；token 中的用户对象必须匹配已注册专用账号。 || Delegated identity: identityState is ready and evidence is current. Validate aud, tid, lifetime, idtyp=user, scp containing CopilotStudio.Copilots.Invoke, and the token user object matching the registered dedicated account.
- Token cache：进程重启后能从加密 cache 静默取 token；并发写入不丢 refresh 状态；模拟 interaction_required 后不调用 D2E、返回 503，并在管理员重新登录后恢复。 || Token cache: silently acquire a token from the encrypted cache after process restart, preserve refresh state during concurrent writes, make no D2E call and return 503 after simulated interaction_required, then recover after administrator sign-in.
- 条件验收 · 隔离：启用多租户身份时，客户 A 使用客户 B 的 conversationId 得到 404，且上游调用计数不增加。 || Conditional · Isolation: when multitenant identity is enabled, customer A receives 404 when using customer B's conversationId, and the upstream call count does not increase.
- 条件验收 · 并发：启用多轮会话时，同一会话并发发送两个 turn 只有一个进入 D2E；不同会话可以并行。 || Conditional · Concurrency: when multi-turn conversations are enabled, only one of two concurrent turns for the same conversation reaches D2E, while different conversations may run in parallel.
- 流式：progressive 样本至少两个不同的非空 answer snapshot 在 final 前到达；2026-08-18 浏览器样本观测到 4 个。final-only 或单 snapshot 由上游决定，必须明确记录。生产评估还需单独测量 Gateway 附加延迟 P50/P95。 || Streaming: a progressive sample must deliver at least two distinct non-empty answer snapshots before final; the August 18, 2026 browser sample delivered four. Record upstream-selected final-only or single-snapshot behavior explicitly. A production evaluation must also measure P50/P95 gateway-added latency separately.
- 断开：客户端断开后 Gateway 发出本地 abort、释放本地执行状态且不再产生出站字节；若启用租约则同时释放租约。单独报告 D2E 服务端是否继续处理。 || Disconnect: after the client disconnects, the gateway issues a local abort, releases local execution state, and emits no more bytes; when leases are enabled, release the lease as well. Report separately whether D2E continues server-side processing.
- 幂等：同一会话重复 clientTurnId 不产生第二次 D2E turn。建会话幂等尚未实现；若后续引入，应验证相同主体与幂等键不创建第二个会话。 || Idempotency: a repeated clientTurnId within a conversation produces no second D2E turn. Create-conversation idempotency is not implemented; if it is added later, verify that the same principal and idempotency key create no second conversation.
- 契约回归：相同提问分别走直连与透传通道，导出的 Activity 序列除 conversation.id 外逐字段一致；任何其他差异都说明 Router 改变了 D2E 数据结构。 || Contract regression: the same prompt through the direct-connect and passthrough channels must yield Activity sequences that match field by field except for conversation.id; any other difference means the Router altered the D2E data structure.
- 失败：首字节前错误使用 HTTP status；首字节后错误使用 SSE error；两种情况都带 correlationId 且不暴露上游响应正文。 || Failure: errors before the first byte use HTTP status, while later errors use an SSE error event; both include correlationId and hide the upstream response body.
:::

## #appendix 15 / Appendix / Verification History :: 历史过程解释结论来源，但不再承担实施主线 || The History Explains Evidence Origins but No Longer Drives Implementation

附录记录按时间顺序保留，便于复核判断如何形成。Agent 名称、数字和结果都限定在当时环境与日期，不能外推为当前平台通则。 || The appendix records remain in chronological order so readers can audit how conclusions formed. Agent names, numbers, and outcomes are scoped to their environments and dates and cannot be generalized as current platform rules.

:::accordion
::panel
### A.1 2026-06 Direct Line 基线 || A.1 June 2026 Direct Line Baseline
三个 Classic Agent 用于排除当时环境中的编排差异；它们不是 New Agent /3p 的论据。 || Three Classic agents were used to control for orchestration differences in that environment. They are not evidence for New Agent /3p.

| Agent | 形态 || Shape | 当时观测 || Observation at the Time |
| --- | --- | --- |
| IVA | Topic-driven | 单条完整 message；typing 无流式元数据 || One complete message; typing had no streaming metadata |
| Storyteller | Instructions-only | 501 字一次性返回 || 501 characters in one final payload |
| UniversalStudio Campus | RAG | 约 34s 后 1335 字；9 条 typing 均无正文与流式元数据 || 1335 characters after about 34s; nine typing activities had no text or streaming metadata |

::panel
### A.2 D2E 权限与 runtime 排查 || A.2 D2E Permission and Runtime Diagnosis
1. **403** — Azure CLI 第一方客户端 token 缺少目标 delegated permissions；response body 指向权限问题。 || The Azure CLI first-party token lacked target delegated permissions; the response body identified the permission problem.
2. **Runtime mismatch** — New Agent 误用 Classic endpoint 时返回 new-generation not supported；切到 /3p 后会话建立。 || A New Agent sent to the Classic endpoint returned new-generation not supported; the conversation opened after switching to /3p.
3. **Message reducer** — 真实 richer events 暴露 thought 截断、空消息、重复前缀与顺序问题，促成 TurnAssembler 与 Work panel。 || Richer events exposed fragmented thought, blank messages, repeated prefixes, and ordering defects, leading to TurnAssembler and the Work panel.

::panel
### A.3 证据时间线 || A.3 Evidence Timeline
- **2026-06** — MCSChat 记录 Direct Line final-only baseline。 || MCSChat recorded the Direct Line final-only baseline.
- **2026-07-22** — Microsoft copilot-studio-plugin PR #26 合并 CLI / agentic-loop /3p streaming 实现。 || Microsoft copilot-studio-plugin PR #26 merged CLI / agentic-loop /3p streaming support.
- **2026-07-28** — Microsoft Learn 仍写明 New Experience 尚未正式支持 Client Library。 || Microsoft Learn still stated that New Experience agents were not formally supported by the Client Library.
- **2026-08-05** — MCSChat 完成 /3p 路由、消息归一化与 Work panel。 || MCSChat completed /3p routing, message normalization, and the Work panel.
- **2026-08-18** — Microsoft Agents 仓库出现 app-only / OBO S2S Private Preview 指南，而公开 Learn 仍把 service principal token 列为不支持。Knowledge Hub Dev 实测已取得包含 CopilotStudio.Copilots.Invoke role 的 Power Platform 应用 token；Classic D2E 返回 App-only S2S access is not enabled for this environment，New /3p 返回 EnableS2SAuthFeature not enabled。因此测试未进入可观察的 Agent ACL 与 SSE 验证阶段，无法证明服务端内部检查顺序；临时凭据随后删除。 || The Microsoft Agents repository documented an app-only / OBO S2S Private Preview while public Learn still listed service principal tokens as unsupported. Knowledge Hub Dev acquired a Power Platform application token containing the CopilotStudio.Copilots.Invoke role. Classic D2E returned App-only S2S access is not enabled for this environment, while New /3p returned EnableS2SAuthFeature not enabled. The test therefore did not reach an observable Agent ACL or SSE validation stage and cannot establish the server's internal evaluation order; the temporary credential was then deleted.
- **2026-08-18** — MCSChat 完成 localhost delegated Router：管理员授权后，进程重启可从 AES-256-GCM encrypted MSAL cache 执行 acquireTokenSilent；CLI 与浏览器都完成真实 New Agent /3p turn。Azure hosting 在 Key Vault 网络策略阻止 secret seeding 后取消，App Service、Blob 与 Key Vault 不进入最终实现。 || MCSChat completed the localhost delegated Router. After administrator authorization, a restarted process used acquireTokenSilent from the AES-256-GCM encrypted MSAL cache, and both CLI and browser clients completed real New Agent /3p turns. Azure hosting was canceled after Key Vault network policy blocked secret seeding; App Service, Blob, and Key Vault are not part of the final implementation.
:::

## #references 16 / References :: 参考来源 || References

- [1] Microsoft. — https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/LIVESTREAMING.md | livestreaming 术语、bot 实现的三种场景（informative / streaming / final）、通道支持矩阵与设计决策。 || Defines livestreaming terminology, informative / streaming / final scenarios, channel support, and design decisions.
- [2] Microsoft. — https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/utils/getActivityLivestreamingMetadata.ts | 流式元数据的权威 schema：channelData 或 entities[type=streaminfo] 等价、streamType 取值、streamSequence 约束。 || Defines the canonical metadata schema, equivalent channelData and streaminfo locations, streamType values, and streamSequence constraints.
- [3] Microsoft. — https://www.npmjs.com/package/@microsoft/agents-copilotstudio-client | Direct Engine Protocol 客户端；ConnectionSettings、JWT 认证、CopilotStudio.Copilots.Invoke 权限要求。 || Documents the Direct Engine Protocol client, ConnectionSettings, JWT authentication, and CopilotStudio.Copilots.Invoke permission.
- [4] Microsoft. — https://github.com/microsoft/Agents-for-js/blob/main/packages/agents-copilotstudio-client/src/copilotStudioClient.ts | SSE 读取、conversation ID 处理与 Streaming 系列 AsyncGenerator API；payload 的 delta / snapshot 语义仍需按 capture 验证。 || Shows SSE consumption, conversation ID handling, and streaming AsyncGenerator APIs; delta / snapshot semantics still require capture validation.
- [5] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application | 自定义应用对接路径，Direct Line token 获取与 Activity 负载解析。 || Documents custom-app integration, Direct Line token acquisition, and Activity payload processing.
- [6] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions | 生成式编排设置项参考。2026-08-05 的本地检查未发现 per-agent streaming 开关；该观察不构成平台通则。 || Provides generative orchestration settings. A local check on 2026-08-05 found no per-agent streaming switch; that observation is not a platform-wide rule.
- [7] Microsoft. — https://learn.microsoft.com/en-us/microsoft-copilot-studio/customize-default-canvas | 官方 Web Chat 嵌入路径：createDirectLine + renderWebChat 走 Direct Line token 端点（§3.1 路径对比依据）。 || Documents the official Web Chat embedding path through createDirectLine, renderWebChat, and the Direct Line token endpoint, supporting the comparison in §3.1.

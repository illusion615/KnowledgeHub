---
title: Open Design：让 AI 帮你做设计，代码直接能用
eyebrow: Open Source · Local-First · AI Design
brand: Vibe Coding
date: 2026-05-05
strict_i18n: false
strict_density: true
lead: Open Design（下称 OD）是一个开源的 AI 设计工作台。你用一句话描述需求，它调用你电脑上已有的 AI 编码助手（Claude Code、Copilot、Gemini 等 13 种），帮你生成完整的网页、落地页、演示文稿或邮件设计稿——产出的不是图片，而是可以直接部署的 HTML/CSS/JS 代码。
hero_actions:
  - "看使用流程 || See the Flow | #experience"
  - "为什么需要它 || Why It Exists | #why"
panel_label: "核心理念 || Core Idea"
panel_title: "不另造新代理，直接教会你的代理做设计 || Skip building a new agent — teach yours to design"
panel_desc: "OD 认为最强的编码 AI 已经在你的电脑上了。它无需另造一个 AI，直接给现有 AI 套上一套设计纪律：先问需求、再锁品牌、写完自查、未达标就重来。 || OD believes the strongest coding AI is already on your laptop. Rather than building another AI, it wraps yours in a design discipline: ask first, lock brand, self-review, redo if under par."
panel:
  - "你的 AI 助手就是设计引擎 || Your AI assistant IS the design engine"
  - "技能和设计规范都是普通文件 || Skills and design specs are plain files"
  - "所有数据留在你电脑上 || All data stays on your machine"
metrics:
  - "GitHub Star || GitHub Stars | 23k | 两周内达成，Apache-2.0 开源 || Reached in two weeks, Apache-2.0"
  - "支持的 AI 助手 || Supported AI Assistants | 13 | Claude Code / Copilot / Gemini / Codex 等主流助手 || Claude Code / Copilot / Gemini / Codex and more"
  - "设计技能 / 设计系统 || Skills / Design Systems | 31 / 129 | 31 种设计技能 + 129 套品牌视觉规范 || 31 design skills + 129 brand visual systems"
  - "贡献者 || Contributors | 92 | 启动两周，社区即有 2.5k fork || 2.5k forks in two weeks"
style:
  accent: "#a78bfa"
---

## #what 01 / What It Is :: 一个让 AI 帮你做设计的工作台 || An AI-powered design workbench

你告诉它「帮我做一个产品落地页」，它会先问你几个问题（给谁看？什么风格？有品牌色吗？），然后调用你电脑上的 AI 编码助手来生成完整设计。产出不是截图，而是可以直接部署的代码。 || You say 'make me a product landing page'. It asks a few questions (audience? style? brand colors?), then calls your local AI coding assistant to generate a complete design — deployable code, not screenshots.

:::accordion
::panel { open: true }
### 它能做什么 || What it can do
OD 支持生成多种设计成品，覆盖从网页到演示文稿的常见场景。 || OD generates various design deliverables, covering common scenarios from web pages to presentations.

- **落地页 / 产品页 / 博客 || Landing / product / blog pages** — 完整的 HTML + CSS + JS，自带响应式布局和动画，可直接部署到 Vercel 等平台。 || Full HTML + CSS + JS with responsive layout and animations, deployable to Vercel.
- **PPT / Deck 演示文稿 || Presentations / Decks** — 支持生成 PPTX 和 HTML 幻灯片，有专门的 deck 技能控制排版和动效。 || Generates PPTX and HTML slides, with dedicated deck skills controlling layout and motion.
- **5 种导出格式 || 5 export formats** — HTML（内联资源）/ PDF / PPTX / ZIP / Markdown，满足不同交付场景。 || HTML (inlined) / PDF / PPTX / ZIP / Markdown for different delivery needs.

::panel
### 它跑在哪里 || Where it runs
OD 完全运行在你自己的电脑上。一条命令启动，所有数据都留在本地，不上传任何云端。 || OD runs entirely on your own machine. One command to start, all data stays local.

- **数据不离开你的电脑 || Data never leaves your machine** — 对话记录、设计稿、API 密钥全部存在本地数据库里。关掉再打开，一切还在原处。 || Conversations, designs, and API keys are stored in a local database. Close and reopen — everything stays put.
- **用你自己的 AI 账号 || Use your own AI account** — BYOK 是 Bring Your Own Key（自带密钥）的缩写。你不需要额外付费——用你已有的 AI 助手账号就够了，或者直接填入 API 密钥。 || BYOK stands for Bring Your Own Key. No extra payments — use your existing AI assistant account or fill in an API key.
:::

## #why 02 / Why It Exists :: Claude Design 的四把锁，OD 逐个打开 || Four locks on Claude Design, OD unlocks each

2026 年 4 月，Anthropic 发布了 Claude Design——让 AI 直接输出可交互的设计成品，发布即爆红。但它有四个限制，OD 的存在就是逐个打开这四把锁。 || In April 2026, Anthropic shipped Claude Design — AI that outputs interactive design artifacts, instantly viral. But it has four limits that OD exists to unlock.

:::insight-grid { cols: 2 }
::card 锁 1
### 闭源，不能改 || Closed-source
Claude Design 的技能和设计规范都是专有的，用户无法查看、修改或分发。OD 全部开源（Apache-2.0），技能就是文件夹里的 Markdown 文件。 || Claude Design's skills and specs are proprietary. OD is fully open-source (Apache-2.0) — skills are just Markdown files in folders.

::card 锁 2
### 必须付费订阅 || Paid subscription
Claude Design 需要 Pro/Max/Team 订阅才能用。OD 免费，只需要你自己的 AI 助手账号。 || Claude Design requires a Pro/Max/Team subscription. OD is free — you just need your own AI assistant account.

::card 锁 3
### 只能在云上用 || Cloud-only
Claude Design 跑在 claude.ai 上，数据在 Anthropic 的服务器。OD 完全跑在你电脑上，数据不出本地。 || Claude Design runs on claude.ai with data on Anthropic's servers. OD runs on your machine — data never leaves.

::card 锁 4
### 绑定单一模型 || Locked to one model
Claude Design 只能用 Anthropic 自家的 Opus 4.7。OD 支持 13 种主流 AI 助手，在下拉菜单里切换就行。 || Claude Design only works with Opus 4.7. OD supports 13 mainstream AI assistants — switch in a dropdown.
:::

## #experience 03 / User Experience :: 从一句话到成品设计：六步流程 || From one sentence to finished design: Six steps

OD 把 AI 做设计的过程拆成六步，每一步都有硬性规则，AI 不能跳过。这套流程借鉴了 huashu-design 项目的「初级设计师模式」：先批量提问、再出可见物、让用户尽早纠偏。 || OD breaks AI design into six hard-gated steps the AI cannot skip. The philosophy comes from huashu-design's 'Junior Designer mode': batch questions first, ship something visible, let users course-correct early.

:::accordion
::panel { open: true }
### 六步设计流程 || Six-step design flow
从你输入需求到拿到设计稿，OD 内部走过这六步。每一步都是强制的——AI 不能跳过。 || From your input to the finished design, OD enforces these six steps — the AI cannot skip any.

1. **问需求 || Ask** — AI 的第一步只能是弹出一个问题表单：给谁看？什么风格？有没有品牌色？做多大？有什么限制？30 秒勾完，胜过 30 分钟来回改方向。 || The AI's first move is always a question form: audience, style, brand colors, scale, constraints. 30 seconds of checkboxes beats 30 minutes of redirects.
2. **锁品牌 || Lock brand** — 一旦传入品牌截图或网址，AI 会自动提取品牌色、字体等信息写成规范文件，再严格按规范设计——绝不凭记忆猜颜色。没有品牌？会给你 5 个预设风格选。 || Once given a brand screenshot or URL, the AI extracts colors and fonts into a spec file — never guessing. No brand? Five preset styles to choose from.
3. **定计划 || Plan** — AI 把任务拆成待办清单，逐项做完打勾，你能实时看到进度，随时可以打断说「这里不对，改方向」。 || The AI breaks the task into a to-do checklist and ticks items off live. You can interrupt anytime to redirect.
4. **读规范 || Read specs** — 动手写代码之前，AI 必须先读当前技能的模板文件和检查清单——相当于设计师先看设计规范再动手。 || Before writing code, the AI must read the skill's template and checklist — like a designer reviewing the spec first.
5. **自查打分 || Self-review** — 交稿前，AI 必须从 5 个维度自评打分（哲学/层次/执行/具体性/克制）。任一维度不足 3 分就必须重做——文档写明「两轮修改是正常的」。 || Prior to handoff, the AI scores itself on 5 axes. Any axis under 3 triggers a redo — the docs note 'two passes is normal'.
6. **机器检查 || Lint** — 最后还有一道自动检查，用程序扫描生成的代码有没有结构损坏、品牌色跑偏、缺少必要文件——让自查有数据依据，而非凭感觉。 || A final automated lint scans the code for structural damage, color drift, or missing files — grounding self-review in data.

::panel
### 技能和设计系统：拖进去就能用 || Skills & design systems: drag and drop
OD 用两种「普通文件」来控制 AI 的设计行为。不需要写代码，不需要装插件——就是文件夹。 || OD uses two types of plain files to control AI design behavior. No code, no plugins — just folders.

- **设计技能（SKILL.md） || Design Skills (SKILL.md)** — 每个技能就是一个文件夹，里面有一份 Markdown 说明书 + 模板文件 + 检查清单。想加新技能？把文件夹拖进 skills/ 目录，重启就行。社区第二周就拿到了 92 个贡献者，就是因为门槛这么低。 || Each skill is a folder with a Markdown instruction + template + checklist. Add a new skill? Drop the folder into skills/, restart. 92 contributors in week two — the barrier is that low.
- **设计系统（DESIGN.md） || Design Systems (DESIGN.md)** — 每个设计系统是一份 9 段式的 Markdown：颜色 / 字体 / 间距 / 布局 / 组件 / 动效 / 语调 / 品牌 / 反模式。下拉切换一个，AI 下次生成就会用新的视觉规范。已有 129 套，包括 Stripe、Vercel、Airbnb、Notion 等 70 个知名产品的品牌规范。 || Each system is a 9-section Markdown: color / typography / spacing / layout / components / motion / voice / brand / anti-patterns. Switch in a dropdown; the AI uses the new spec next time. 129 systems ship, including 70+ brand specs for Stripe, Vercel, Airbnb, Notion, etc.
:::

## #quality 04 / Quality Gates :: AI 出的设计不丑：五道质量闸门 || Five gates against ugly AI output

AI 生成的设计最常被吐槽的就是「AI 味太重」：千篇一律的紫色渐变、通用 emoji 图标、假数据、毫无品牌感。OD 在提示词里硬编码了五道闸门，每一道都不可跳过。 || The top complaint about AI design is 'it looks like AI made it': cookie-cutter purple gradients, generic emoji icons, fake data, zero brand sense. OD hard-codes five gates in its prompts, each unskippable.

:::accordion
::panel { open: true }
### 五道闸门详解 || Five gates explained
这五道闸门层层叠加，把 AI 设计从「看着还行」推向「真正能用」。 || Five gates stacked to push AI design from 'looks OK' to 'actually usable'.

- **先问后做 || Ask before doing** — AI 第一步只能问你需求，不能直接动手。锁定视觉基调再开始，避免做完才发现方向不对。 || The AI must ask first, never start directly. Lock visual stance before beginning.
- **品牌色必须有据 || Brand colors must be evidence-based** — 从截图或网址提取真实品牌色，写成规范文件后再用。绝不凭 AI 的「记忆」猜颜色。 || Extract real brand colors from screenshots or URLs. Never guess from AI 'memory'.
- **检查清单全过才能交稿 || Checklist must pass before output** — 每个技能自带硬性检查项（如「是否有响应式布局」「是否有真实内容」），全部通过才能输出。 || Each skill ships mandatory checks ('is it responsive', 'does it use real content') — all must pass.
- **AI 味黑名单 || AI-slop blacklist** — 明确禁止：激进紫色渐变、通用 emoji 图标、左边框圆角卡片、手绘 SVG 人像、把 Inter 当标题字体、凭空编造数据。 || Explicitly banned: purple gradients, generic emoji icons, left-border cards, hand-drawn SVG humans, Inter as display font, invented metrics.
- **五维自审 || Five-axis self-review** — AI 交稿前必须按哲学、层次、执行、具体性、克制五个维度自评。任一维度不足 3 分就必须重做——文档写明「两轮修改是正常的」。 || Prior to handoff, the AI self-scores on philosophy, hierarchy, execution, specificity, and restraint. Any axis under 3 triggers a redo — the docs note 'two passes is normal'.
- **自动代码检查 || Automated code lint** — 程序自动扫描生成的代码：结构是否完整、品牌色是否跑偏、必要文件是否缺失。让自评有数据依据而非凭感觉。没有真实数据时必须写占位符，不准编造。 || Automated lint scans the code for structural integrity, color drift, and missing files. Self-review grounded in data, not vibes. Missing data must use placeholders, never fabrication.
:::

## #comparison 05 / Comparison :: 跟竞品比怎样 || How it compares

目前做 AI 设计的主要有三家：Anthropic 的 Claude Design（闭源领头羊）、OpenCoworkAI 的 open-codesign（开源桌面端）、以及 OD。三者的核心分野集中在 12 个关键维度。 || Three main AI design players: Claude Design (closed-source leader), open-codesign (open-source desktop), and OD. Twelve key dimensions separate them.

:::accordion
::panel { open: true }
### 12 个关键差异 || 12 key differences
OD 在「可替换性」与「设计纪律」上领先，唯一明显落后项是精细编辑功能的可靠性，被列为 0.4+ 路线。 || OD leads in replaceability and design discipline. The one clear lag is surgical-edit reliability, on the 0.4+ roadmap.

| 维度 || Dimension | Claude Design | open-codesign | Open Design |
| --- | --- | --- | --- |
| 开源 || Open source | 闭源 | MIT | Apache-2.0 |
| 运行方式 || Runtime | 云端 Web | 桌面 Electron | 本地 Web + 后台服务 |
| AI 来源 || AI source | 固定 Opus 4.7 | 内置 pi-ai | 你电脑上的任意 AI 助手 |
| 支持的 AI 数量 || AI count | 1 | 7+ | 13 + BYOK 4 协议 |
| 设计技能 || Skills | 专有 | 12 个 | 31 个，拖入即用 |
| 设计系统 || Design systems | 专有 | 规划中 | 129 套已就位 |
| 需求表单 || Question form | × | × | &checkmark; 强制第一步 |
| 风格选择器 || Style picker | × | × | &checkmark; 5 个预设 |
| 导入 Claude Design 项目 || Import Claude Design | n/a | × | &checkmark; |
| 精细编辑 || Surgical edit | × | &checkmark; | 开发中 |
| 质量自查 || Quality self-review | × | × | &checkmark; 五维 + 自动检查 |
| 部署到 Vercel || Vercel deploy | × | × | &checkmark; |
:::

## #architecture 06 / Under the Hood :: 底层架构与运行机制 || Architecture & runtime mechanics

面向关心底层机制或打算贡献代码的读者，这里拆解 OD 的三层运行结构与提示词组装方式。 || For readers interested in internal mechanics or contributing code, here is how OD's three-layer runtime and prompt assembly work.

:::accordion
::panel { open: true }
### 三层架构 || Three-layer architecture
OD 的架构只有三层：浏览器（界面）→ 本地后台服务（数据和 API）→ AI 助手（写代码的 AI）。 || Three layers: browser (UI) → local backend (data and APIs) → AI assistant (the AI that writes code).

- **浏览器层 || Browser layer** — Next.js 16 + React 18 网页应用。负责聊天界面、文件管理、设计预览（在安全的 iframe 沙箱中渲染）。可部署到 Vercel。 || Next.js 16 + React 18 web app. Handles chat, files, and design preview (sandboxed iframe). Deployable to Vercel.
- **本地后台服务 || Local backend service** — Node.js 单进程，是唯一能读写文件和存储数据的部分。所有敏感信息（API 密钥、对话、设计稿）都由它管理，浏览器端只负责展示。 || Single Node.js process — the only part that reads/writes files and stores data. All sensitive info managed here; browser only displays.
- **AI 助手层 || AI assistant layer** — 启动时自动扫描你电脑上已装的 AI 编码助手，在下拉菜单中列出。没装也行——填入 API 密钥后直接调用 Anthropic / OpenAI / Azure / Gemini 接口。 || Auto-scans installed AI assistants on startup. No assistant? Enter an API key to call Anthropic / OpenAI / Azure / Gemini directly.

::panel
### 提示词是分层组装的产品代码 || Prompts are layered product code
OD 发给 AI 的提示词远非简单的两段文字，它由六层结构组装而成。每一层都是可编辑的 TypeScript 文件，像管理代码一样管理提示词——支持单独测试、比对版本差异并提交审核。 || OD's prompt goes beyond a simple two-part message — it is assembled from six layers, each an editable TypeScript file managed like code: testable, diffable, reviewable.

1. **需求表单规则** — 控制第一步的问答流程和品牌分支
2. **设计师身份 + 质量规则** — 反 AI 味黑名单 + 自审规则
3. **当前设计系统** — 从 129 套中选中的那一套品牌规范
4. **当前技能** — 从 31 个技能中选中的那一个
5. **项目信息** — 项目名称、历史对话等上下文
6. **模板和参考文件** — 技能自带的 HTML 模板和检查清单

::panel
### 数据存储和外部集成 || Storage & integrations
所有运行时数据都存在项目根目录的 .od/ 隐藏文件夹里。OD 同时开放 MCP 协议接口，让外部 AI 工具也能读取你的设计项目。 || All runtime data lives in a hidden .od/ folder. OD also exposes an MCP interface so external AI tools can read your design projects.

- **本地 SQLite 数据库 || Local SQLite database** — 对话记录、项目文件、设计稿、打开的标签页——全部存在本地。关掉再打开，一切还在原处。 || Conversations, files, designs, open tabs — all local. Close and reopen, everything stays.
- **MCP 只读接口 || MCP read-only interface** — 注册到 Claude Code / VS Code / Cursor 等工具后，其他 AI 可以直接读取你 OD 项目里的设计文件，省掉「导出 → 重新导入」的循环。默认只允许本机访问。 || Register with Claude Code / VS Code / Cursor, and other AIs can read your design files directly. Defaults to localhost-only.
:::

## #takeaways 07 / Takeaways :: OD 给 AI 产品设计带来的三个启发 || Three lessons from OD

OD 不只是「免费版 Claude Design」。它验证了三个对所有 AI 产品都有参考价值的思路。 || OD is more than 'free Claude Design'. It validates three ideas valuable to any AI product.

:::insight-grid { cols: 3 }
::card 01
### 产品力在纪律，不在模型 || Value is in discipline, not the model
OD 支持 13 种 AI 助手，不同助手的成稿质量拉开明显差距——说明产品力源自「先问后做、品牌锁定、五维自查」的设计纪律，而非底层换用哪个模型。 || OD supports 13 AI assistants yet output quality diverges across them — showing product value comes from design discipline rather than the underlying model.

::card 02
### 降低贡献门槛是增长杠杆 || Lowering contribution cost is a growth lever
把扩展方式从「写代码 + 装插件」降到「拖个文件夹 + 写份 Markdown」，让 OD 两周就拿到 92 个贡献者。这比打磨任何单个功能都更有效。 || Reducing extension from 'write code + install plugin' to 'drag folder + write Markdown' gave 92 contributors in two weeks — more effective than polishing any single feature.

::card 03
### 还有哪些坑没填 || Gaps still open
精细编辑（选中局部修改）的可靠性、桌面打包分发、技能市场（一键安装社区技能）仍在 0.4+ 路线上。101 个 issue + 43 个 PR 表明高速迭代期的文档同步是下一阶段挑战。 || Surgical editing, packaged desktop builds, and skill marketplace are on the 0.4+ roadmap. 101 issues + 43 PRs show doc-code sync is the next challenge.
:::

## #references 08 / References :: 参考来源 || References

- [1] nexu-io/open-design — https://github.com/nexu-io/open-design | 主仓库 README、QUICKSTART、CHANGELOG || Main README, QUICKSTART, CHANGELOG
- [2] apps/web/src/prompts/ — https://github.com/nexu-io/open-design/blob/main/apps/web/src/prompts/discovery.ts | 需求表单、五维自审、品牌协议的实际代码 || Discovery form, five-axis critique, brand protocol source code
- [3] apps/daemon/src/agents.ts — https://github.com/nexu-io/open-design/blob/main/apps/daemon/src/agents.ts | AI 助手自动发现和适配的核心代码 || AI assistant auto-discovery and adapter core
- [4] alchaincyf/huashu-design — https://github.com/alchaincyf/huashu-design | OD 的设计哲学来源：反 AI 味、五维自审、初级设计师模式 || OD's design philosophy: anti-slop, five-axis critique, Junior Designer mode
- [5] OpenCoworkAI/open-codesign — https://github.com/OpenCoworkAI/open-codesign | OD 的 UX 模式来源：流式预览、iframe 沙箱、导出格式 || UX patterns: streaming preview, iframe sandbox, export formats
- [6] multica-ai/multica — https://github.com/multica-ai/multica | OD 的架构来源：本地后台服务 + AI 助手自动发现 || Architecture source: local daemon + AI auto-discovery
- [7] VoltAgent/awesome-design-md — https://github.com/VoltAgent/awesome-design-md | DESIGN.md 格式规范与 70 个产品品牌系统的数据来源 || DESIGN.md schema and 70 product brand systems source
- [8] Open Design 0.3.0 Release — https://github.com/nexu-io/open-design/releases/tag/open-design-v0.3.0 | 2026-05-04 发布的最新版本 || Latest release on 2026-05-04

---
title: 演示模式自动讲解设计
eyebrow: Design Document
brand: Knowledge Hub
date: 2026-04-14
strict_i18n: false
strict_density: true
lead: 为演示模式增加 LLM 驱动的自动讲解功能。幻灯片负责信息披露，讲解词负责引导和强调——模拟一位 presenter 正在做 talk 的体验，而非简单的定时切换或文字朗读。
hero_actions:
  - "查看架构 | #architecture"
  - "实施路线 | #roadmap"
panel_label: 核心理念
panel_title: Deck 披露信息，Narrative 引导理解
panel:
  - LLM 生成口语化讲解词，自适应内容深度
  - 胶囊 FAB：讲解 / 录制 / 设置 / AI 助手四合一
  - 全局 + 文章级语音设置，逐句字幕显示
  - 屏幕录制、结束页二维码、自动开始讲解
metrics:
  - "交互控件 || UI Controls | 胶囊 FAB | 4 合 1：Settings / Record / Chat / Narrator || 4-in-1: Settings / Record / Chat / Narrator"
  - "设置层级 || Settings Scope | 2 层 | 全局默认 + 文章级覆盖，语言 / 语速 / 语音 || Global default + per-article override, lang / rate / voice"
  - "语音引擎 || Speech Engine | Web Speech | 逐句播放 + 逐句字幕，Chrome 长文本拆分 || Per-sentence playback + subtitle, Chrome long-text split"
  - "附加能力 || Extra Features | 录制 + 结束页 | getDisplayMedia 屏幕录制 + 二维码结束页 || getDisplayMedia screen capture + QR end slide"
style:
  accent: "#7c3aed"
---

## #requirement 01 / Requirement :: 需求概述

当前演示模式支持手动翻页浏览，但缺少自动播放和讲解能力。目标是增加一种由 LLM 驱动的自动讲解模式，让演示体验接近真人 presenter 做 talk。

:::insight-grid { cols: 3 }
::card 01
### 角色分工
幻灯片（Deck）承担信息披露职能——结构化地展示数据、列表、图表、对比。讲解词（Narrative）承担引导与强调职能——以演讲者视角串联逻辑、提示重点、提供页间过渡。两者互补，不重复。

::card 02
### 不是什么
不是定时切换——每页停留时间由讲解词长度决定，而非固定秒数。不是照读文字——LLM 生成的是 presenter 口吻的总结和引导，不是 slide 文本的复述。不是预录音频——讲解词实时生成，每次可能略有不同。

::card 03
### Graceful Degradation
未配置 LLM 设置时，auto-play 按钮完全隐藏，不影响现有功能。浏览器不支持 Speech API 时同理。零干扰的渐进增强策略。
:::

## #architecture 02 / Architecture :: 系统架构

新增惰性加载模块 article-narration.js，通过回调与宿主 article-presentation.js 通信。遵循 pptx-export.js 的惰性加载先例。

:::accordion
::panel { open: true }
### 四层架构
UI Layer

**演示浮动控件**

Auto-play 按钮（▶/⏸ 切换）、说话指示器动画、字幕叠层、CC 切换按钮。宿主 article-presentation.js 负责创建和管理。

Controller

**NarrationController**

编排整个播放流程的状态机。管理 start / pause / resume / stop / syncToSlide 生命周期，协调文本提取、LLM 生成、语音播放三个子系统。内部维护 narrative 缓存（Map<slideIndex, string>）和 look-ahead 管线。

LLM

**Narrative 生成器**

从 slide DOM 提取可见文本 → 构造 presenter 风格 system prompt → 非流式 fetch 请求 LLM → 返回 2-3 句讲解词。复用 article-assistant.js 的 localStorage('llm-settings') 配置（Ollama / OpenAI / Azure）。

Speech

**语音合成器**

封装 Web Speech API（SpeechSynthesis + SpeechSynthesisUtterance）。自动选择 zh-CN / en-US 高质量语音，语速 0.92。处理 Chrome 长文本 bug（按句拆分）、语音列表异步加载、页面可见性变化。

::panel
### 文件清单
assets/article-narration.js

← 新建：讲解引擎 + 语音合成 + LLM 生成

assets/article-presentation.js

← 修改：auto-play 按钮 + 惰性加载 + 导航钩子

assets/article.css

← 修改：讲解 UI 样式

assets/article-assistant.js

← 参考：复用 LLM 集成模式

assets/pptx-export.js

← 参考：惰性加载先例

::panel
### 模块 API
新模块通过 `window.StudyRoomNarration` 暴露工厂方法，返回 NarrationController 实例：

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `start` | (steps, index, getLang) | 从指定 slide 启动自动讲解 |
| `pause` | () | 暂停语音 + 冻结状态 |
| `resume` | () | 恢复语音播放 |
| `stop` | () | 取消所有：语音、pending 请求、计时器 |
| `syncToSlide` | (index) | 手动导航时同步；取消当前语音，切到新 slide |
| `isActive` | () → boolean | 是否处于 playing 或 paused 状态 |
| `getState` | () → string | idle / generating / playing / paused |
| `destroy` | () | 清理所有资源 |
:::

## #narration-engine 03 / Narration Engine :: 讲解引擎

讲解引擎包含三个核心子系统：文本提取、LLM Narrative 生成、Web Speech 语音合成，以及协调它们的 NarrationController 状态机。

:::accordion
::panel { open: true }
### 状态机
NarrationController 的四个状态及转换路径：

idle

— start() →

generating

— LLM 返回 →

playing

— pause() ⇄ resume() →

paused

playing 状态下语音结束（utterance.onend）触发 onSlideComplete 回调 → 宿主调用 goToNextStep() → 进入下一页的 generating 状态。stop() 从任意状态回到 idle。最后一页播放完毕自动 stop()。

::panel
### 文本提取
与 article-assistant.js 的全文提取不同，讲解引擎只提取当前活跃 slide 的可见内容：

::panel
### LLM Narrative 生成
使用非流式请求生成 2-3 句 presenter 风格讲解词（短回复，流式无收益）。复用现有 llm-settings 配置。

System Prompt（中文）

你是一位正在进行演示的讲解者。你的任务是根据当前幻灯片的内容，生成2-3句自然的演讲讲解词。

**规则：**不要照读幻灯片上的文字。用口语化的演讲语气，像在对听众说话。总结该页的核心要点。如果不是第一页，提供与上一页的过渡。如果有重要数据或对比，通过语气强调。控制在 50-80 字以内。

System Prompt（英文）

You are a presenter narrating a slide deck live. Generate 2-3 sentences of natural presenter commentary for the current slide.

**Rules:** Do NOT read the slide text verbatim. Use a conversational speaking tone. Summarize the key takeaway. Provide transitions from previous topics. Emphasize important data. Keep it under 60 words.

User Prompt 模板

幻灯片 {index}/{total} 标签: {label} 标题: {title} 内容: {body}

请求超时 15 秒。超时或错误时跳过该页讲解，3 秒后自动前进。

::panel
### Web Speech API 封装
封装 SpeechSynthesisUtterance，处理语音选择、长文本拆分和浏览器兼容性。

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| 语言 | zh-CN / en-US | 根据 getLang() 自动切换 |
| 语速 | 0.92 | 略慢于默认，清晰度优先 |
| 音调 | 1.0 | 自然音调 |
| 语音选择 | Premium 优先 | 优先名称含 Premium / Enhanced / Natural 的高质量语音 |

| 已知问题 | 处理方式 |
| --- | --- |
| getVoices() 异步加载 | 监听 voiceschanged 事件，首次加载时缓存语音列表 |
| Chrome 长文本 bug（>15s 中断） | 超过 200 字符按句号拆分，串行播放各段 |
| Safari 需要用户手势 | auto-play 按钮的 click 事件本身满足手势要求 |
| 页面不可见时语音可能暂停 | visibilitychange 事件中处理暂停/恢复 |

::panel
### Look-Ahead Pipeline
核心优化策略：在当前 slide 语音播放期间，提前生成下一页的 narrative，消除页间等待。

Slide N

Generate(N)

Speak(N)

预生成

Generate(N+1)

← 与 Speak(N) 并行

Slide N+1

Speak(N+1) ← 已缓存

缓存采用 `Map<number, string>`，按 slide index 索引。同一 session 内不失效——用户倒退再前进时可直接复用已生成的 narrative，无需重新请求 LLM。
:::

## #integration 04 / Integration :: 演示集成

新功能通过四个集成点接入现有演示引擎：按钮注入、惰性加载、导航钩子、标签扩展。

:::accordion
::panel { open: true }
### Auto-Play 按钮
在 ensureFloating() 创建的浮动控件中，于 Prev 和 Exit 按钮之间插入 auto-play 按钮。按钮使用 ▶（play）/ ⏸（pause）SVG 图标切换。

**可见性条件**：仅当同时满足 (1) localStorage 中有有效的 llm-settings 且 (2) 浏览器支持 window.speechSynthesis 时显示。否则 display: none。

::panel
### 惰性加载
复用 pptx-export.js 的加载模式：

::panel
### 导航钩子
在现有导航函数中插入 narration 感知逻辑：

| 触发点 | 行为 |
| --- | --- |
| goToNextStep() / goToPreviousStep() | 如果 narration 活跃 → syncToSlide(newIndex)：取消当前语音，切到新 slide |
| exitPresentation() | 如果 narration 活跃 → stop()：清理所有资源 |
| onFullscreenChange（退出全屏） | 如果 narration 活跃 → stop()：与退出演示联动 |
| narration onSlideComplete 回调 | 宿主调用 goToNextStep()；最后一页时 stop() + 短暂提示 |

::panel
### 标签扩展
在 labels 对象中新增双语条目：

| Key | 中文 | English |
| --- | --- | --- |
| autoPlay | 自动讲解 | Auto narrate |
| pauseNarration | 暂停讲解 | Pause |
| resumeNarration | 继续讲解 | Resume |
| narrationComplete | 讲解完成 | Narration complete |
| narrationError | 讲解生成失败 | Narration failed |
| narrationGenerating | 正在生成讲解… | Generating narration… |
| subtitles | 字幕 | Subtitles |
:::

## #ui-design 05 / UI Design :: UI 设计

演示模式的交互控件采用右下角胶囊 FAB 设计，将讲解、录制、设置、AI Chat 四个功能聚合在一个入口。

:::accordion
::panel { open: true }
### 胶囊 FAB
右下角的 FAB 在演示模式下从 AI Chat 图标切换为说话指示器。Hover 时向上展开为胶囊形状，露出四个功能按钮。

| 按钮 | 图标 | 功能 |
| --- | --- | --- |
| Settings | ⚙ 齿轮 | 打开讲解设置面板（语言/语速/语音/试听） |
| Record | ⊙ 录制 | 启动 getDisplayMedia 屏幕录制 + 自动讲解 |
| Chat | 💬 对话 | 切换 AI 助手对话框（复用 article-assistant.js） |
| Narrator | 三竖线指示器 | 开始/停止语音讲解。播放时竖线有波动动画 |

关键 CSS 属性：`height: 52px → 198px`（hover 展开），`border-radius: 26px`（胶囊形），`overflow: hidden` + `justify-content: flex-end`（从底部向上生长）。动作按钮区域默认 `opacity: 0`，hover 时淡入。

::panel
### 页码与状态栏
页码计数器放置在 FAB 左侧（right: 92px, bottom: 32px），与 FAB 垂直居中对齐。仅显示页码（如 "3 / 28"），无背景无边框，半透明白色文字。标题和操作提示已移除。

讲解完成后，页码区域短暂显示 "讲解完成 · 总时长 X:XX"（5 秒后恢复）。

::panel
### 字幕叠层
底部居中的半透明字幕条，逐句显示当前正在朗读的文本。每个语音 chunk 开始播放时更新字幕内容（onChunkStart 回调）。

关键样式：

- position: fixed; bottom: 16px，居中对齐
- max-width: 70%，可换行
- background: rgba(0, 0, 0, 0.6) + backdrop-filter: blur(8px)
- opacity 0/1 过渡，is-visible class 控制显隐

::panel
### 演示控件简化
为保持幻灯片内容的沉浸感，多个控件采用极简设计：

- 退出按钮：SVG ✕ 图标，无背景无边框，半透明白色（hover 变亮）
- 左右导航箭头：无背景无边框，hover 仅改变颜色和 opacity
- 讲解播放时：导航箭头自动隐藏（opacity: 0, pointer-events: none）
- 结束页：deck overlay 自动隐藏（.present-floating.is-end-slide .present-deck display: none）

::panel
### 结束页
演示最后一页为动态生成的结束页，全屏居中显示：

- "感谢收看" 大标题（clamp(2rem, 4vw, 3.2rem)）
- 当前页面 URL 的二维码（qrserver.com API 生成，140x140px）+ "扫码访问" 提示
- "illusion615 Knowledge Hub" 品牌标识（大写，半透明）

退出演示模式时结束页隐藏，不影响正常阅读。
:::

## #edge-cases 06 / Edge Cases :: 错误处理与边界情况

系统设计覆盖 12 种边界场景，确保任何异常都不会阻断演示流程。

| 场景 | 处理方式 |
| --- | --- |
| 浏览器不支持 Speech API | 隐藏 auto-play 按钮，不报错 |
| 未配置 LLM settings | 隐藏 auto-play 按钮，不报错 |
| LLM 请求超时（>15s） | 跳过该 slide 讲解，3s 后自动前进，状态栏短暂提示 |
| LLM 返回错误 | 同上 |
| LLM 返回空内容 | 跳过该 slide，立即前进 |
| 退出全屏 | 停止 auto-play（现有 exitPresentation() 联动） |
| 手动点击 Prev/Next | 取消当前语音，syncToSlide() 到新 slide |
| Escape 退出演示 | stop() 清理所有资源 |
| 最后一页讲解完毕 | auto-play 自动停止，提示 2s 后恢复 |
| Chrome 长文本 bug | 按句号切割 narrative，串行播放各段 |
| 语音列表异步加载 | onvoiceschanged 事件监听，缓存语音列表 |
| 页面不可见 | visibilitychange → 暂停语音，可见时恢复 |

## #decisions 07 / Design Decisions :: 设计决策记录

七项关键架构决策，每项记录选项、选择和理由。

:::accordion
::panel { open: true }
### 决策矩阵
| 决策 | 选项 | 选择 | 理由 |
| --- | --- | --- | --- |
| 模块位置 | 内联 vs 独立文件 | 独立文件 article-narration.js | 保持 presentation.js 聚焦；支持惰性加载；遵循 pptx-export.js 先例 |
| LLM 请求 | 流式 vs 非流式 | 非流式 | Narrative 短（2-3句），流式增加复杂度无收益 |
| 语音引擎 | Web Speech vs 云端 TTS | Web Speech API | 零成本、零依赖、offline-capable；v2 可扩展 |
| 生成策略 | 全量预生成 vs look-ahead vs on-demand | Look-ahead (current + next) | 全量启动慢；on-demand 页间等待长；look-ahead 平衡二者 |
| 缓存范围 | in-memory vs sessionStorage | in-memory | v1 简单优先；倒退可复用；session 结束自然清理 |
| 字幕叠层 | 始终显示 vs 可切换 | 可切换（默认开） | 现场演示可能觉得干扰；CC toggle 给予控制权 |
| 降级策略 | 报错 vs 静默隐藏 | 静默隐藏 | 无 LLM / 无 Speech → 按钮不可见，零干扰 |

::panel
### 浏览器兼容性
核心 API 在所有目标浏览器上均有支持：

🌐

Chrome

33+ (Speech) · 103+ (AbortSignal.timeout)

🧭

Safari

14.1+ (Speech) · 16+ (AbortSignal.timeout)

🦊

Firefox

49+ (Speech) · 100+ (AbortSignal.timeout)

📘

Edge

14+ (Speech) · 103+ (AbortSignal.timeout)

无新增外部依赖。LLM 后端复用现有 llm-settings 配置。代码遵循项目规范：vanilla JS、var 声明、forEach + function expressions、无箭头函数。
:::

## #roadmap 08 / Roadmap :: 实施路线

分三个阶段交付：MVP 核心能力、UI Polish、远期增强。

Phase 1 — ✅ 已完成

### Core

- ✅ 文本提取器
- ✅ LLM narrative 生成（非流式）
- ✅ Web Speech API 封装
- ✅ NarrationController 状态机
- ✅ 胶囊 FAB（替代独立按钮）
- ✅ 导航钩子接线
- ✅ 错误处理 + 3s 跳过

Phase 2 — ✅ 已完成

### 体验优化

- ✅ 逐句字幕（onChunkStart）
- ✅ 说话指示器（静态 + 动画）
- ✅ Look-ahead 预生成
- ✅ 语音选择（名字 · 方言 + 试听）
- ✅ Chrome 长文本拆分
- ✅ 全局 + 文章级设置
- ✅ 自动开始讲解开关
- ✅ 播放计时

Phase 3 — 部分完成

### 扩展功能

- ✅ 屏幕录制（getDisplayMedia）
- ✅ 结束页（二维码 + 品牌）
- ✅ AI Chat 集成到胶囊
- ☐ 素材包导出（截图 + 文本 → ffmpeg 合成）
- ☐ Edge TTS 云端语音
- ☐ Narrative 可编辑

:::accordion
::panel
### 验收清单
**功能测试**

- 配置 llm-settings → 进入演示模式 → auto-play 按钮可见
- 未配置 → 按钮隐藏
- 点击 ▶ → 第一页 narrative 生成 → 语音朗读 → 结束后自动翻到第二页
- 点击 ⏸ → 语音暂停 → 页面停留；再点 ▶ → 语音恢复
- Auto-play 期间按方向键 → 当前语音停止 → 跳到对应页重新讲解
- Escape → narration 停止 → 退出演示
- 最后一页讲解完毕 → auto-play 自动停止
- LLM 超时 → 跳过该页 → 自动前进
- CC 按钮 toggle → 字幕显示/隐藏

**语言测试**

- zh 模式 → 中文 system prompt → 中文语音
- en 模式 → 英文 system prompt → 英文语音

**浏览器测试**

- macOS Chrome — 语音合成正常
- macOS Safari — 语音合成正常
- 无 Speech API 的浏览器 — 按钮隐藏

**回归测试**

- 不开启 auto-play 时，演示模式所有现有功能不受影响
- PPT 导出、PDF 导出、键盘导航、分享功能正常
:::

## #changelog 09 / Changelog :: 变更历史

从初始设计到当前实现的演进记录。

:::accordion
::panel { open: true }
### v1.0 → v2.0 实现演进
| 变更项 | v1.0 设计稿 | v2.0 当前实现 |
| --- | --- | --- |
| 播放控件 | 屏幕中央独立按钮 | 右下角胶囊 FAB（hover 展开 4 按钮：Settings / Record / Chat / Narrator） |
| 设置面板 | 右上角齿轮按钮 | 集成在胶囊内，面板从右下角弹出；支持全局 + 文章级双层设置 |
| 语音选择 | 自动选择 | 按语言过滤，"名字 · 方言" 格式，试听按钮预览 |
| 字幕显示 | 全文一次显示 | 逐句显示（每个 utterance chunk 触发 onChunkStart 回调） |
| 退出按钮 | 文字 "退出演示" | SVG ✕ 图标，无背景无边框 |
| 导航箭头 | 始终可见 | 播放时隐藏（opacity: 0），无背景无边框 |
| 页码浮窗 | 底部居中，有背景框 | 右下角 FAB 左侧，纯文本无背景，仅显示页码 |
| System Prompt | 固定 2-3 句 | 自适应深度（简单页 80 字 / 普通页 180 字 / 复杂页 300 字）；禁止 Markdown；中性身份 |
| 开场/结束语 | 无 | 第一页："大家好，欢迎收听…"；最后一页："感谢收听…"；中间页无 |
| 屏幕录制 | 未设计 | getDisplayMedia + systemAudio，分享菜单 + 胶囊按钮触发 |
| 结束页 | 无 | 动态生成：感谢收看 + 二维码 + 品牌标识 |
| 自动开始 | 无 | 全局设置开关，进入演示后 600ms 自动触发 |
| 播放计时 | 无 | 讲解结束后显示 "讲解完成 · 总时长 X:XX" |
| AI 助手 | 阅读模式独立 FAB | 演示模式集成到胶囊，退出后恢复原始 FAB |

::panel
### 时间线
:::

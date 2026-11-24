# Video-Generator 集成说明

本仓库已将 [`zaz8848/Video-Generator`](https://github.com/zaz8848/Video-Generator)（v0.2.0，底层基于 `adunext/adu-motion-video` 固定源码基线）的视频创作方法论、风格包目录、场景编舞模板与流式语音合成能力整合至 Study Room 视频工作室（Video Studio）。视频工作室内嵌于每篇文章顶部操作栏，点击按钮后直接在当前页面弹出沉浸式浮窗，并根据文章章节自动生成口播台词与动态分镜初稿。

## 1. 远端仓库能力剖析与融合取舍

`zaz8848/Video-Generator` 面向本地多项目复用，把视频生产划分为「真人口播」与「无人物产品介绍」两条路线，封装了 6 大类 11 款 Adu/MotionGit 风格包、9 类代码级场景编舞函数（`templates.js`）、确定性画幅安全计算（`contain`）以及字节跳动火山引擎流式语音合成（`zaz8848/Video-Generator/scripts/tts.mjs`）。

Study Room 采用纯静态页面与本机服务协同架构：静态站点直接托管于 GitHub Pages，本机启动 `scripts/serve-knowledge-hub.mjs` 后则通过同源安全桥接提供 Copilot 深度分镜、本地生图、配音合成与 Motion Canvas 镜头渲染。为避免在仓库内引入原仓库 `upstream/adu-motion-video` 下的 1042 个锁定文件及二进制资源，本次采用模块化内聚方案，保持 Git 仓库零外部二进制污染且单文件行数严格控制在红线以内：

| 远端 `zaz8848/Video-Generator` 源模块 | Study Room 融合落点 | 集成能力与架构职责 |
|---|---|---|
| `upstream/.../references/template-catalog.json` 及 `PROJECT_BLUEPRINT.md` | `assets/video-studio-templates.js` | 提供 `presenter`（真人口播/知识讲解）与 `product`（纯产品介绍/实测演示）双制作路线，内置 `01-A` 至 `06-A` 共 11 款 Adu/MotionGit 风格包色板与构图提示词。 |
| `upstream/.../template/templates.js`（`TPL.hero` 至 `TPL.outro`） | `assets/video-studio-templates.js` (`buildTemplateComposition` / `buildAutoDraftFromSource`) | 将 9 类标准镜头编舞转化为 Study Room 同构图层与关键帧（`KHVideoComposition`），并在打开文章视频浮窗时自动提取章节标题、数据指标与对比步骤，生成全套口播词与分镜初稿。 |
| `src/media.mjs`、`src/product.mjs`、`src/schema.mjs` | `assets/video-studio-templates.js` (`containBounds` / `toManifest`) 与 `scripts/video-studio.mjs` | 复刻安全留白与独立字幕带几何计算（`containBounds`），新增 `GET /api/copilot/studio/:id/manifest` 与 `POST /api/copilot/studio/:id/auto-narration` 接口，支持一键导出兼容 `Video-Generator 0.2` 的工程清单 JSON。 |
| `zaz8848/Video-Generator/scripts/tts.mjs`（火山引擎 `seed-tts-2.0` 单向流式接口） | `scripts/video-generator-tts.mjs` 与 `scripts/video-studio-media.mjs` | 迁移分块事件流解析、CRLF 兼容、音频解码与词级真实时间戳字幕聚合，支持 `--self-check` 离线自检，并在视频工作台与 macOS 本机语音并列可选。 |
| 文章内嵌浮窗与工作台交互 | `assets/article-video-modal.js`、`assets/article-common.js`、`assets/video-studio-playback.js`、`assets/video-studio.js` | 点击文章顶栏「视频工作室」按钮时按需懒加载 `assets/article-video-modal.js`，在当前文章页内弹出毛玻璃沉浸式浮窗，保留阅读滚动位置，移除脱离文章上下文的首页全局独立入口。 |

## 2. 核心新增特性

### 2.1 文章内嵌沉浸式浮窗与自动口播初稿生成

在任意文章顶部操作栏点击 **视频工作室** 按钮时，页面不发生跳转，而是直接弹出居中大尺寸浮窗（支持 `Esc` 键、点击背景遮罩或右上角 `返回文章 ×` 关闭，关闭后自动恢复阅读滚动位置）：

- **打开即用自动口播（Auto-Narration）**：首次为文章打开视频浮窗时，系统自动读取当前文章的标题、导语、章节要点、数值指标与流程对比，按照 `TPL.hero`（开场钩子）→ `TPL.point / number / compare / steps`（章节论据）→ `TPL.outro`（终端总结）生成逐镜自然口播台词与动态图层编排，直接进入第 2 步「镜头工作台」供实时 Canvas 预演。
- **随时一键重生成与自由微调**：在工作台工具栏点击 **自动生成口播分镜**，可根据所选的 `presenter` / `product` 路线与 11 款 Adu 风格包重新生成全片口播词与场景编排；用户随后可在右侧检视器逐段修改口播文案、主视觉短句、切换镜头模板或调用已连接的 Copilot 模型重设计。

### 2.2 双制作路线与 11 款 Adu/MotionGit 风格目录

在视频工作室第 1 步「需求确认」中，展开 **Video-Generator 0.2 双路线与 Adu/MotionGit 风格目录（11 款）** 面板即可切换：

- **真人口播 / 知识讲解（`presenter`）**：默认匹配 `01-A · 原片节奏`（`classic-performance@1.0.0`），涵盖现代图文口播（`01-A`～`01-E`）、纸面透视讲解（`02-A` 纸面天平、`02-B` 纸面聚合）、鲜色角色叙事（`05-A`）与活力高反差（`06-A`）。
- **纯产品介绍 / 实测演示（`product`）**：无需真人出镜，默认匹配 `03-A · 多屏展陈`（`anim4-showcase-macro@1.3.1-candidate`）与 `04-A · 仪器台演示`（`doubao-console-performance@0.3.0-candidate`），强调完整窗口取景（`contain`）与底部字幕阅读带分离。

点击任意风格包卡片后，系统会将对应的色板、排版层级与运镜约束写入当前视频需求，并在保存草稿时持久化 `brief.scenario` 与 `brief.stylePack`。

### 2.3 镜头工作台 9 类 TPL 场景编舞一键套用

在第 2 步「镜头工作台」右侧检视器中，展开 **Adu 镜头编舞预设（TPL 9 类场景一键套用）** 即可针对当前选中镜头即时生成结构化图层与关键帧：

1. `01 开场大标题 (TPL.hero)`：核心命题大字砸入、副标题递进与右侧重点视觉区。
2. `02 逐词论点卡 (TPL.point)`：深色背景配顶部核心论点与三张横向递进编号卡片。
3. `03 数据指标滚动 (TPL.number)`：自动提取文案中的关键数值指标，生成超大字号数字与进度条动画。
4. `04 前后对比盖章 (TPL.compare)`：左侧传统路径划线剔除，右侧升级方案高亮对照。
5. `05 横向步骤时间线 (TPL.steps)`：水平路径描边逐段点亮，串联三个编号步骤节点。
6. `06 全屏金句强调 (TPL.quote)`：高饱和主色背景配居中核心结论慢推运镜。
7. `07 产品窗口演示 (TPL.demo)`：左侧深色应用窗口采用 `contain` 完整取景，右侧排列三项打勾特性卡。
8. `08 要点核验清单 (TPL.checklist)`：结构化核验条目逐行滑入。
9. `09 终端片尾总结 (TPL.outro)`：深色终端命令框呈现行动路径与原文指引。

套用后中央监看器立即刷新 Canvas 预演画面，无需等待云端模型推理。

### 2.4 火山引擎 Seed-TTS 2.0 配音与离线自检

`scripts/video-generator-tts.mjs` 集成了 `zaz8848/Video-Generator/scripts/tts.mjs` 的字节跳动单向流式语音合成协议：

- **默认免配置可用**：未配置云端密钥时，视频工作室继续使用 macOS 本机语音（`Yue (Premium)`、`Lili (Premium)`、`Tingting`）完成配音与词句同步。
- **按需启用官方音色**：在 `private/video-studio/tts.local.env`（已被 Git 忽略，绝不入库）或环境变量中配置 `VOLCENGINE_TTS_API_KEY` 后，即可在需求面板下拉框选择 `灿灿 · 字节 Seed-TTS 2.0`（`zh_female_cancan_uranus_bigtts`）或 `醇厚 · 字节 Seed-TTS 2.0`（`zh_male_chunhou_uranus_bigtts`），自动提取服务端返回的词级时间戳生成精确字幕。

### 2.5 Video-Generator 0.2 工程清单导出

在第 4 步「整片导出」工具栏中，点击 **导出 Video-Generator 清单**（或请求 `GET /api/copilot/studio/<projectId>/manifest`），即可下载包含画幅几何边界（`bounds`）、片段时长、旁白 SHA256 指纹与真实字幕时间轴的 JSON 清单，直接对接本地 `Video-Generator` CLI 工作流。

## 3. 本地启动与验证方法

启动本机站点与视频工作室服务：

```sh
node scripts/serve-knowledge-hub.mjs
```

服务启动后可访问任意文章页体验内嵌视频工作室浮窗：

- 文章页内浮窗入口：`http://127.0.0.1:8000/posts/study-room-design/index.html`（点击文章顶部「视频工作室」按钮即可呼出页内浮窗并查看自动生成的口播与分镜）。
- 创世纪样板页入口：`http://127.0.0.1:8000/posts/markdown-genesis-lab/index.html`。
- 独立调试承载页：`http://127.0.0.1:8000/video-studio.html?article=study-room-design`。

运行自动化测试与全站门禁：

```sh
node scripts/video-generator-tts.mjs --self-check
node --test tests/video-generator.test.mjs tests/video-studio.test.mjs
node tests/validate.js
```

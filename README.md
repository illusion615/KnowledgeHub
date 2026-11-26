# Knowledge Hub

一个纯静态 HTML 知识站点，包含交互式知识图谱首页与结构化渐进披露文章页。通过 GitHub Pages 发布。

## 本机文章助手（GitHub Copilot）

```sh
node scripts/serve-knowledge-hub.mjs
```

打开 http://127.0.0.1:8000/ → 设置 → GitHub Copilot，选择模型并保存；文章助手顶部可直接搜索切换模型。优先复用本机官方 GitHub CLI 登录，实际请求仍为云端推理，发送前需用户同意。静态 GitHub Pages 不提供此本机桥接。

详细说明见 [Copilot provider](docs/copilot-provider.md)。不启动或停止其他模型服务。

## 本机视频工作室

文章顶部的场记板按钮进入持久化向导：需求确认 → 镜头工作台 → 镜头渲染 → 整片导出。桌面工作台采用左侧镜头列表、中央监看器、右侧属性与底部V1/A1序列布局，支持左右切换和无需渲染的模拟播放；长属性独立滚动，作业记录按需展开。打开后自动检测已有 Copilot 登录，右上角显示状态和模型选择，不需要手动连接或重复勾选；仅点击生成时发送文章与需求。图片、配音和视频在用户确认后由本机工具执行。保存或预演不生成，未变化的素材与镜头直接复用，中断后可恢复。

首次运行 `node scripts/setup-video-studio.mjs` 准备仓库外的媒体依赖，再启动或重启上述本机站点。GitHub Pages 仅提供入口，不执行本机任务。详见[视频工作室说明](docs/video-studio.md)。

## Change Log

### 2026-11-26
- **信息图弧形圆盘视口虚拟化裁剪与快翻进度轨**：在 `assets/infographic-math.js`、`assets/infographic-shared.js`、`assets/infographic-view.js`、`assets/infographic-mobile.js` 与 `assets/infographic.css` 中落地扇面视口裁剪（`[-0.45π, +0.45π]` 结合视口相交检测与边缘平滑衰减），消除 Copilot Studio 57 篇文章等多圈叠印重影与点击劫持（DOM 节点降幅超过 80%）；修复桌面端 `mousemove` 误抢父级焦点抖动、移动端同相位误触与 `resize` 圆心漂移，并为超长列表（`> 12` 篇）新增弧形位置进度条、计数徽标（如 `9 / 57`）及 `Shift + 滚轮` / `PageUp` / `PageDown` 5 篇快翻能力。

### 2026-11-25
- **Microsoft Ignite 2026 52 场全集上线**：新增 `posts/copilot-studio-ignite-2026-whats-new/` 总览与 51 篇专场解析（`posts/ignite-2026-*/`），覆盖 Copilot Studio、Power Platform、托管运行时与智能体治理，同步挂载至 `assets/knowledge-data.js`（全站扩展至 241 个图谱节点、216 篇公开文章）。
- **托管运行时生命周期与本地文生歌曲专题**：上线 `posts/copilot-studio-managed-runtime-alm/`（剖析托管运行时落入个人环境的机制与跨环境发布路径）与 `posts/local-music-song-models/`（结合 Apple Silicon 本地 MiniMax-Music3 实测与四类曲风试听样本），并新增 `posts/markdown-genesis-lab/` 扩展 Markdown 样板。
- **静态编译、图表引擎与单篇发布流水线**：新增 `tools/compile-article.js`、`tools/figure-engine/` 与 `tools/publish-article.js`，支持双语扩展 Markdown 编译、双主题内联矢量图生成及媒体体积守卫；视频工作室改为页内浮窗按需加载。

### 2026-11-21
- **NanoJev 协议与本地推理服务拆解**：`scripts/nanojev_mlx/contract.py` 将状态行校验、问题判据核对与候选分支构造拆为独立辅助函数，保留 1..8 状态、32 问题、128 候选分支与 16384 token 上限；`scripts/serve-nanojev-mlx.py` 提取鉴权、请求体校验、单并发门控推理与连接文件生命周期管理。
- **数理建模与 MLX 校验脚本加载解耦**：`posts/exam-performance-modeling/` 与 `scripts/nanojev_mlx/engine.py`、`scripts/serve-laya-mlx.py`、`scripts/validate-nanojev-mlx.py` 统一改用 `runpy.run_path` 加载同级计算与审计模块，消除跨层动态导入耦合。
- **前端公共脚本与样式去重**：收敛 `assets/infographic-view.js`、`assets/infographic-mobile.js`、`assets/article-presentation.js`、`assets/article-narration-ui.js`、`assets/article-renderer.js`、`assets/article-email-share.js` 及配套样式表中的重复 DOM 与样式片段，净减 2957 行冗余代码。
- **前端异常分类诊断与降级重置**：在 `assets/article-assistant.js`、`assets/article-common.js`、`assets/article-narration.js`、`assets/article-narration-ui.js`、`assets/article-presentation.js`、`assets/copilot-provider.js`、`assets/pptx-export.js` 及 `assets/cell-game.js`、`assets/crowd-game.js`、`assets/sudoku-game.js` 等 10 个模块补齐 47 处异常分类诊断与显式降级状态重置，消除空 `catch` 静默吞错。

### 2026-04-14
- **微积分系列文章**：新增 5 篇面向中学生的微积分入门系列（变化的语言 → 极限 → 导数 → 积分 → 基本定理），注册到知识图谱
- **KaTeX 公式渲染**：新增 `article-math.js`，通过 CDN 加载 KaTeX 渲染 `data-latex` 属性公式；聊天窗口同步支持 `$...$` / `$$...$$` LaTeX 语法
- **Bug 修复**：showHidden 变量 hoisting 导致刷新后设置失效；演示模式 chat 对话框 z-index 被遮挡；缺少 `article-assistant.js` 的页面无 FAB 显示
- **演示模式胶囊**：无 LLM 配置时自动隐藏 chat 按钮并自适应高度

## License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

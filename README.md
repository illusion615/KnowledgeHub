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

### 2026-04-14
- **微积分系列文章**：新增 5 篇面向中学生的微积分入门系列（变化的语言 → 极限 → 导数 → 积分 → 基本定理），注册到知识图谱
- **KaTeX 公式渲染**：新增 `article-math.js`，通过 CDN 加载 KaTeX 渲染 `data-latex` 属性公式；聊天窗口同步支持 `$...$` / `$$...$$` LaTeX 语法
- **Bug 修复**：showHidden 变量 hoisting 导致刷新后设置失效；演示模式 chat 对话框 z-index 被遮挡；缺少 `article-assistant.js` 的页面无 FAB 显示
- **演示模式胶囊**：无 LLM 配置时自动隐藏 chat 按钮并自适应高度

## License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

# Knowledge Hub

一个纯静态 HTML 知识站点，包含交互式知识图谱首页与结构化渐进披露文章页。通过 GitHub Pages 发布。

## 本机文章助手（GitHub Copilot）

```sh
node scripts/serve-knowledge-hub.mjs
```

打开 http://127.0.0.1:8000/ → 设置 → GitHub Copilot，选择模型并保存；文章助手顶部可直接搜索切换模型。优先复用本机官方 GitHub CLI 登录，实际请求仍为云端推理，发送前需用户同意。静态 GitHub Pages 不提供此本机桥接。

详细说明见 [Copilot provider](docs/copilot-provider.md)。不启动或停止其他模型服务。

## Change Log

### 2026-04-14
- **微积分系列文章**：新增 5 篇面向中学生的微积分入门系列（变化的语言 → 极限 → 导数 → 积分 → 基本定理），注册到知识图谱
- **KaTeX 公式渲染**：新增 `article-math.js`，通过 CDN 加载 KaTeX 渲染 `data-latex` 属性公式；聊天窗口同步支持 `$...$` / `$$...$$` LaTeX 语法
- **Bug 修复**：showHidden 变量 hoisting 导致刷新后设置失效；演示模式 chat 对话框 z-index 被遮挡；缺少 `article-assistant.js` 的页面无 FAB 显示
- **演示模式胶囊**：无 LLM 配置时自动隐藏 chat 按钮并自适应高度

## License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

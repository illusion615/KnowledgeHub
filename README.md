# Knowledge Hub

Knowledge Hub is a static HTML knowledge site for study notes, engineering retrospectives, and architecture articles. It features an interactive knowledge graph homepage and structured, progressive disclosure article pages. All content is authored in plain HTML with shared CSS and JS for consistent styling and presentation behavior.

## Current Status

- Homepage: interactive knowledge graph landing page in `index.html`
- Publishing model: static site for GitHub Pages
- Build step: none
- Frontend stack: vanilla HTML, CSS, and JavaScript
- Shared article system: `assets/article.css` and `assets/article-presentation.js`

## Current Content

- `enterprise-agent-architecture` — 企业智能体架构设计与应用
- `agentic-skill-execution` — 智能体技能执行架构设计实践
- `copilot-harness-engineering` — AI 编码助手的 Harness Engineering 初始化
- `llm-client-architecture` — LLM Client 架构重构：多 Provider 运行时设计实践
- `mlx-model-optimization` — Apple Silicon 上的 MLX 模型优化实践
- `ai-mud-project-retro` — AI-MUD 项目回顾：产品级 Vibe Coding 实践
- `agentic-ai-adoption-practice` — Agentic AI 导入实践：用成熟度模型规划企业落地
- `copilot-studio-constraints` — Microsoft Copilot Studio 约束条件与工程边界
- `copilot-studio-memory` — Copilot Studio 记忆管理机制：变量作用域、对话历史与知识检索
- `copilot-studio-overview` — Microsoft Copilot Studio：定位、能力、落地路径与费用
- `text-to-image-prompting` — 文生图提示词工程：五种模型的提示策略对比与可复用模式

## Repository Structure

```text
index.html                          # Knowledge Hub homepage / interactive graph
assets/
  article.css                       # Shared article styling
  article-presentation.js           # Shared presentation-mode behavior
posts/
  enterprise-agent-architecture/
    index.html
  agentic-skill-execution/
    index.html
  copilot-harness-engineering/
    index.html
  llm-client-architecture/
    index.html
  mlx-model-optimization/
    index.html
  ai-mud-project-retro/
    index.html
  agentic-ai-adoption-practice/
    index.html
  copilot-studio-constraints/
    index.html
  copilot-studio-memory/
    index.html
  copilot-studio-overview/
    index.html
  text-to-image-prompting/
    index.html
```

## Article Model

- Each article is a self-contained HTML page
- Articles share typography, layout, and theme tokens through `assets/article.css`
- Articles share presentation mode through `assets/article-presentation.js`
- Homepage preferences such as theme and language are reused across article pages

## Local Preview

Open `index.html` directly in a browser, or serve the repository with any static file server.

## License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

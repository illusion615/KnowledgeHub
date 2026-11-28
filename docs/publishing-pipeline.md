# 单篇静态发布管线与公开阅读展厅解耦规范

Study Room 采用「创作生产平面」与「公开阅读展厅」双面物理隔离架构：作者在本机或交付看板宿主中编辑 `posts/<slug>/article.md` 并调用本地音视频合成服务，而推送至 GitHub Pages 的公开站点仅承载自包含静态 HTML、压缩媒体与知识图谱索引，不暴露任何本机桥接端口或作者制作台入口。

`tools/publish-article.js` 将单篇文章从源稿编译、体积门禁、图谱幂等注册到 14 项静态契约校验收敛为一次确定性命令行调用，并向发布工位（Release Engineer）输出可直接暂存提交的 JSON 变更清单。

---

## 1. 创作平面与公开阅读面的职责切分

过去文章顶栏无条件注入「视频工作室」按钮，外部读者在纯静态托管域名下点击后会触发本机回环桥接探测失败。解耦后，两套环境按运行上下文严格分流：

| 维度 | 公开阅读展厅（Knowledge Hub 静态发布态） | 作者创作平面（Captain Docs / 本机创作态） |
| --- | --- | --- |
| 默认访问入口 | `https://<org>.github.io/.../posts/<slug>/` 或普通无参 URL | URL 携带 `?studio=1` / `?authoring=1`，或内嵌于 `.docs-rich-html-stage` 容器 |
| 顶栏工具簇 | 仅保留双语切换、主题风格、幻灯片演示与流式伴读 | 额外挂载「视频工作室」按钮，按需懒加载浮窗脚本 |
| 后端服务依赖 | 0 个后端请求，纯静态资产直出 | 按需连接本机 Copilot 桥接与本地语音/音乐推理服务 |
| 媒体入库边界 | 仅允许压缩后的图像、短视频与音频；单文件硬上限 `25 MB` | 未压缩母带（如 `.wav`、`.aiff`、分镜草稿）一律保留在 `private/` 目录 |

在 `assets/article-common.js` 中，运行时仅当检测到查询参数 `?studio=1`、`?authoring=1`（传入 `0` 可显式关闭），或宿主根节点声明 `data-authoring-host="captain-docs"`、页面运行于看板富视图同源框架 `.docs-rich-html-stage` 内时，才挂载 `[data-video-studio]` 触发器。普通访客打开静态文章页时，DOM 不生成制作台节点，也不会加载 `assets/article-video-modal.js`。

---

## 2. 模块拓扑与五阶段发布流水线

发布能力绑定于 `markdown-article` 架构组件，入口脚本与四个单一职责子模块全部控制在单文件 400 行以内：

| 模块路径 | 核心职责 | 关键导出接口 |
| --- | --- | --- |
| `tools/publish-article.js` | 解析命令行参数、调度发布流水线并按退出码输出标准 JSON | `parseCliArgs()`, `main()` |
| `tools/article-publisher/index.js` | 串联媒体守卫、Genesis 编译、目录同步、14 项校验与清单组装 | `publishArticle()` |
| `tools/article-publisher/status-inspector.js` | 解析 `<slug>` 或路径，无副作用判定文章当前发布同步状态 | `resolveArticleTarget()`, `inspectArticleStatus()` |
| `tools/article-publisher/catalog-registry.js` | 解析源稿双语元数据，校验或幂等追加 `assets/knowledge-data.js` 节点 | `loadKnowledgeCatalog()`, `ensureCatalogRegistration()` |
| `tools/article-publisher/media-guard.js` | 递归审计文章目录文件体积，拦截超限资产与未压缩母带文件 | `auditArticleMedia()`, `collectArticleFiles()` |

单次执行 `node tools/publish-article.js <slug>` 按固定顺序走完五个阶段，任一前置门禁失败即刻中止写盘并返回非零退出码：

1. **阶段一：私有母带与大文件守卫**。扫描 `posts/<slug>/` 下全部非隐藏文件，默认单文件上限为 `25 MB`（`26,214,400` 字节）。若发现超出上限的 `.wav`、`.aiff`、`.mov` 等未压缩制作母带，立即在 `media_guard` 阶段拒绝发布并提示转码为压缩格式或移入 `private/`；对 `5 MB` 至 `25 MB` 之间的未压缩音频输出告警提示。
2. **阶段二：Genesis 纯静态编译**。读取 `posts/<slug>/article.md`，调用 `tools/markdown-compiler` 生成自包含 `posts/<slug>/index.html`，先在内存完成脚本顺序、零内联样式、双语引号转义与暗色主题规则自检，仅当内容发生实质变化时才覆写磁盘文件。
3. **阶段三：全站图谱幂等注册**。检查 `assets/knowledge-data.js` 中是否已存在对应文章节点。若尚未注册，自动从源稿首部提取中英标题、摘要（中文截断至 `<= 96` 字、英文截断至 `<= 154` 字符以满足图谱长度约束）、标签、日期与主题色，挂载到 `--topic` 指定专题或 `tools/docs-navigation-meta.js` 预设路由下；若节点已存在则保持幂等不重复插入。
4. **阶段四：工程导航树与文章包文件夹同步**。自动调用 `tools/sync-docs-navigation.js` 刷新 `docs/navigation.json`。仅含 `article.md` 的文章在所属业务专题下保持扁平单节点；当 `posts/<slug>/` 下同时共置了专属支撑文档（如 `posts/<slug>/docs/` 内的草稿增量、修订计划、信源台账、构建说明、提示词或单篇实验记录）时，脚本自动将该文章聚合为同专题下的独立文章文件夹，首项固定为正式文稿 `article.md`，其余支撑文档紧随其后并列展示，不再散落至底部平台工程区。
5. **阶段五：14 项静态门禁核验**。调用 `tests/validate.js --article <slug>` 跑满全部 14 类检查项（含图谱语法、脚本顺序、内联样式、箭头函数、资源语法、CSS 规则、结构完整度、双语转义、间距契约、演示表面、双语本地化、章节密度、引用配对与自定义代理契约）。

---

## 3. 命令行参数与状态查询

脚本同时接受裸 `<slug>`、文章目录或源稿相对路径，所有输出均为结构化 JSON，便于外层自动化脚本直接解析：

```bash
# 1. 查询单篇文章当前发布状态（不修改任何文件）
node tools/publish-article.js copilot-studio-ignite-2026-whats-new --status

# 2. 预演编译、图谱注册与门禁检查（零落盘写入）
node tools/publish-article.js posts/markdown-genesis-lab/article.md --dry-run

# 3. 正式编译单篇文章、幂等挂载至指定专题并输出变更清单
node tools/publish-article.js my-new-article --topic copilot-studio

# 4. 持续集成漂移检查：若源稿、HTML、图谱或导航树未同步则返回退出码 1
node tools/publish-article.js copilot-studio-ignite-2026-whats-new --check
```

`--status` 模式返回 `study_room.article_publish_status.v1` 结构，其 `state` 字段涵盖四种确定性状态：

- `unpublished`：尚无编译后的 `index.html`，或尚未在 `assets/knowledge-data.js` 注册图谱节点；
- `published`：`index.html` 与最新 `article.md` 字节级一致，图谱与 `docs/navigation.json` 已收录，且工作树该文章目录下无未提交改动；
- `modified_pending_sync`：`article.md` 存在未编译改动、`docs/navigation.json` 漏收，或 Git 工作树中存在待提交的文章资产变更；
- `missing`：`posts/<slug>/` 下既无 `article.md` 也无 `index.html`。

---

## 4. Release Engineer 交付清单数据契约

正式发布或 `--dry-run` 成功后，标准输出返回 `study_room.article_publish_manifest.v1` 对象。发布工位无需全仓扫描，直接读取 `releaseEngineerPayload` 即可完成精准暂存与提交：

```json
{
  "schema": "study_room.article_publish_manifest.v1",
  "ok": true,
  "slug": "copilot-studio-ignite-2026-whats-new",
  "mode": "publish",
  "state": "published",
  "article": {
    "slug": "copilot-studio-ignite-2026-whats-new",
    "sourceMarkdown": "posts/copilot-studio-ignite-2026-whats-new/article.md",
    "outputHtml": "posts/copilot-studio-ignite-2026-whats-new/index.html",
    "outputHtmlSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "topicId": "copilot-studio",
    "catalogAction": "unchanged"
  },
  "validation": {
    "ok": true,
    "checksCount": 14
  },
  "releaseEngineerPayload": {
    "commitScope": "article(copilot-studio-ignite-2026-whats-new)",
    "suggestedCommitMessage": "publish(copilot-studio-ignite-2026-whats-new): compile static article and sync catalog index",
    "filesModified": [],
    "articleBundleFiles": [
      "posts/copilot-studio-ignite-2026-whats-new/article.md",
      "posts/copilot-studio-ignite-2026-whats-new/index.html"
    ],
    "gitAddPaths": [
      "posts/copilot-studio-ignite-2026-whats-new/article.md",
      "posts/copilot-studio-ignite-2026-whats-new/index.html"
    ]
  }
}
```

其中 `filesModified` 仅列出本次运行实际改写的共享索引或编译产物，而 `gitAddPaths` 聚合了单篇文章全套静态资源及本次发生变更的 `assets/knowledge-data.js`、`docs/navigation.json`，避免误将其他并行在途卡片的未完成文件混入同一次提交。

---

## 5. 体裁自适应创作与反过度工程化准则

单篇发布管线以「先打磨 `posts/<slug>/article.md` 源稿、再编译生成静态 `index.html`」为标准作业方式。开发智能体在起草或改写源稿时遵守以下三条约束，不增加任何新的必填 frontmatter 字段：

1. **按需澄清而非机械停工**：先结合选题与现有资料自主研判受众、立意与事实边界。意图清晰时直接推进创作；仅当存在真正影响核心判断、专有数据真伪或脱敏边界的关键信息缺失时，才一次性提出聚焦的澄清问题，不再机械套用固定五问拦停流程。
2. **按文档体裁自然组织结构**：拒绝把所有题材塞进固定章节模板或封闭分类枚举。数学建模论文围绕假设、符号定义、模型求解与灵敏度检验展开；用户手册围绕前置条件、最短跑通路径与排障手册展开；市场调研围绕格局判断、竞品实证对比与商业化约束展开；工程架构复盘围绕业务边界、机制取舍与故障走查展开。
3. **首屏自适应减法与拒绝组件堆砌**：`tools/markdown-compiler/template.js` 与 `assets/article.css` 原生支持首屏按需退化——当 `article.md` 省略 `panel`、`panel_title`、`panel_desc` 且无首屏引言块时，编译器不生成右侧摘要卡片，`.hero-grid` 自动切换为清爽单栏开篇；省略 `metrics` 时保持零指标卡渲染。非定量推导题材不硬塞装饰性 `$$` 公式，简单逻辑不强画首节框图，无真实参数推演需要时不硬造 `:::sandbox` 交互沙盒。
4. **单篇支撑资料共置归档（Article Bundle 自包含）**：单篇专题文章遵循 `posts/<slug>/` 自包含目录边界。正式源稿 `article.md`、静态产物 `index.html`、配图 `media/` 与该文章专属的全部过程与支撑文档（统一收纳于 `posts/<slug>/docs/`）共置于同一文章目录，由 `publish-article.js` 一次性纳入 `articleBundleFiles` 清单并同步至 `docs/navigation.json` 文章文件夹；顶层 `docs/` 与 `authoring/workflow-feedback/` 仅承载跨文章的全局架构规范与公共流程契约。

---

## 6. 验证命令

修改发布管线、Markdown 编译器首屏自适应逻辑或阅读页顶栏挂载逻辑后，运行以下增量快测即可在 1 秒内完成全链路回归核验：

```bash
node --test tests/markdown-compiler.test.js tests/publish-article.test.js
```

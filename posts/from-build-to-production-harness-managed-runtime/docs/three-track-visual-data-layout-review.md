# 《From Build to Production》非文字三维（数据信源 / 配图图表 / 排版字号）专项核验报告

- **任务卡编号**：`scrum-feat-f866d39f`（配合前置文字润色卡 `scrum-feat-16392af4` 分轨闭环）
- **核验范围**：`posts/from-build-to-production-harness-managed-runtime/article.md`、`posts/from-build-to-production-harness-managed-runtime/index.html`、`posts/from-build-to-production-harness-managed-runtime/talk-blueprint.js`、`posts/from-build-to-production-harness-managed-runtime/talk-blueprint.css` 及 `posts/from-build-to-production-harness-managed-runtime/media/` 下 2 张声明式矢量图与 4 张官方课件配图。
- **审阅基线**：基于前置文字润色合入提交 `e981297` 的最新源稿，对照四场 Microsoft Ignite 2026 官方专场专文（`posts/ignite-2026-brk378-host-apps-anywhere-new-copilot-managed/article.md`、`posts/ignite-2026-brk259-copilot-harness-powers-copilot-studio/article.md`、`posts/ignite-2026-brk382-deploy-solutions-scale-power-platform-copilot/article.md`、`posts/ignite-2026-brk285-agent-works-enterprise-ready/article.md`）逐项复核。

---

## 1. 轨道二：数据与信源口径核对结论（Data & Source Verification）

全文首屏指标卡、正文段落、LaTeX 公式、2 张 `:::figure` 图表及 `talk-blueprint.js` 五场景推演台中的全部数值、倍数、百分比与专场引用（`[1]`–`[9]`）已完成交叉比对，**数值与信源口径 100% 自洽**。

### 1.1 四大专场核心数据交叉台账

| 指标维度 | 正文与公式口径 | 首屏卡 / 图表 / 交互沙盒口径 | 官方信源出处与页码锚点 | 核验结论 |
| --- | --- | --- | --- | --- |
| 新内核离线评测与词元降幅 | 约 500 道客户流程离线评测（Sonnet 4.6）；$\Delta Q_{\text{code}} = +47.5\text{ pts}$，$\Delta Q_{\text{file}} = +28.2\text{ pts}$，$\Delta T_{\text{input}} = -45.0\%$ | 首屏卡 `+47.5 pts / -45%`；图 1 节点 1；沙盒 S3 一致 | BRK259 `[3][4]` Slide 10 | 一致通过 |
| 缓存命中与工具失败自愈率 | $R_{\text{cache}} \in [83\%,\, 88\%]$（成本加权输入词元净降 15%–21%），$R_{\text{recover}} \in [84\%,\, 91\%]$ | 首屏卡 `83%–88%`；图 1 节点 1；沙盒 S3 一致 | BRK259 `[3]` + 工程博客 `[9]` | 一致通过 |
| 内部软件工厂与钩子拦截 | 32 个智能体、47 条连接、6 个共享专家；Haiku 5.5 并行盲审 3 标书；`Before tool` 阻断超 `£2,000`（8 套入职包）采购单 | 图 1 节点 3；沙盒 S3 一致 | BRK259 `[3][4]` Slide 12, 18, 24 | 一致通过 |
| 受管运行时与三方生态 | 2026-11-17 全面商用；1,500+ 动作级连接器；Voyage Desk 36 项自动检查；Lovable 服务 40,000+ 企业、7,000 万+ 项目、20 分钟绑定且零触碰企业数据 | 首屏卡 `1,500+ / 40,000+`；图 1 节点 4/5；沙盒 S1/S2 一致 | BRK378 `[1][2]` Slide 15, 17, 20 | 一致通过 |
| 管理中心受管应用盘点 | 第 2 节配图展示 **492 款应用 / 4 款封禁**（BRK378 Slide 18）；第 4 节正文说明 **953 款应用 / 4 款封禁**（BRK382 Slide 30） | 沙盒 S4 已显式补齐双专场不同演示租户时点的课件页码说明，消除表面数字差异歧义 | BRK378 `[2]` Slide 18；BRK382 `[6]` Slide 30 | 已闭环消歧 |
| 诺华规模与双轨点数账本 | 77,000 员工、3.04 亿患者；智能体从 182 增至 **1,366 个（7.5×）**；月活创作者 **3,312 人（2.6×）**；Power Apps **27,862 款**（含 50 款代码应用）；10 周训练营约 500 人近 50% 投产 | 首屏卡 `7.5× / 1,366`；图 1 节点 9；沙盒 S4 一致 | BRK382 `[5][6]` Slide 15 | 一致通过 |
| 算力限额与单一 OpenAPI | Studio 顶栏 `88 credits`、试点上限 `5,000` 点、全局 `2.5M` 点（`1.5M` 预付 + `1M` 按量）、`≥90%` 预警、`<1 小时` 告警；15 组命令行、`$10` / 30 分钟生成治理应用 | 第 4 节实拍卡；图 1 节点 7/8；沙盒 S2/S4 一致 | BRK378 `[1]` + BRK382 `[5][6]` Slide 43, 46 | 一致通过 |
| 有界全自主演进与排障实录 | Azure 支持历时 **18 个月**；Contoso `503` 故障免问订阅号锁定 `09:08` 部署后 `0 of 3` 健康实例；Studio 6 专员 + 4 路网关协议桥 + 六步爬山 | 首屏卡 `18 个月`；第 4 节架构卡；图 1 节点 6/9；沙盒 S5 一致 | BRK285 `[7][8]` Slide 26, 29, 30 | 一致通过 |

### 1.2 参考文献链接与引用编号完整性

- 全文共 9 条官方信源（4 场 Ignite 2026 点播实录 `[1][3][5][7]`、4 套 Medius 官方课件直链 `[2][4][6][8]` 与 1 篇微软工程博客 `[9]`），正文与图表题注所有 `[n]` 引用均落在 `1..9` 范围内且与專场内容逐条对应。

---

## 2. 轨道三：配图与矢量图表视觉审阅及精修（Visual & Diagram Audit）

通过 SVG 结构解析、Orca 内嵌浏览器真实 DOM 包围盒测量与暗色截图抽检，识别并闭环修复了 3 项视觉细节问题：

### 2.1 发现问题与修复闭环

1. **图 1（`build-to-prod-four-session-topology`）节点副标题孤字断行、跨层连线交叉与桌面字号偏小**：
   - **根因**：原图画布宽 `1440px`，在 `1137px` 正文容器内缩放比为 `0.746`，导致副标题 `11.5px` 实际渲染仅 `8.6px`；同时第一层原列序将 `five-entry-surfaces` 置于右侧、`subagents-hooks` 置于中间，致使 3 条跨列折线挤在同一水平走廊上对向交叉重叠。
   - **修复**：调整第一层三节点列序为 `copilot-sdk-sandbox`（左）、`five-entry-surfaces`（中）、`subagents-hooks`（右），配合端口分流将画布收敛至 `1320×658`（桌面缩放比 `0.861`，最小渲染字号 `9.9px`），并精简中英双语节点副标题字数。重编译 `.zh.svg`、`.en.svg` 与 `.drawio` 后，第一层与第二层之间仅保留单条无遮挡折线（`615→298`）与三条顺向垂直直连，彻底消除连线交叉与水平走廊共线重叠，9 个节点零孤字换行，7 个双语胶囊标签零碰撞重叠。
2. **图 2（`talk-30min-pacing-blueprint`）英文副标题贴近画布右缘**：
   - **根因**：英文副标题在 `1040px` 视口内右端延伸至 `1028px`，右侧留白仅 `12px`。
   - **修复**：更新 `posts/from-build-to-production-harness-managed-runtime/media/talk-30min-pacing-blueprint.figure.json` 双语副标题并将画布高度微调至 `476px`，英文副标题右侧留白扩至 `140px` 以上，六轴标签与三阶段图例零重叠。
3. **4 张官方实拍配图在暗色模式下的白底眩光抑制**：
   - **根因**：`posts/from-build-to-production-harness-managed-runtime/talk-blueprint.css` 原先对 `[data-theme="dark"] .b2p-media-frame` 设置了 `rgba(255, 255, 255, 0.94)` 亮白衬底；其中 BRK259 Slide 08（深黑绿底，`avgLum = 94`）与 BRK285 Slide 29（深灰蓝底，`avgLum = 70`）周围出现刺眼白框，而 BRK378 Slide 18（白底，`avgLum = 239`）在暗色页中略显刺目。
   - **修复**：将暗色画框背景改为深曜石色 `rgba(15, 21, 30, 0.92)`，并对暗色模式下的配图施加柔和压暗滤镜 `brightness(0.92) contrast(1.03)` 与细阴影过渡，同时保留亮色模式原貌，彻底消除暗色白框断层与高光眩目感。

---

## 3. 轨道四：多视口排版与字号检视及修复（Layout & Typography Audit）

在 Orca 内嵌浏览器中对桌面宽屏（`1440×900`）、平板窄屏（`860×780`）、移动端（`390×844`）及 10 页全屏演示模式（Presentation Mode）执行了几何溢出与字阶审计：

### 3.1 移动端（390px）与窄屏（860px）关键修复

- **修复前缺陷**：浏览器默认样式对 `<figure>` 施加了左右各 `40px` 外边距，致使 `390px` 视口下 `.sr-figure` 容器宽度被挤压至 `278px`（内含 `232px` 宽的 SVG），导致图 1 缩放比跌至 `0.161`、等效字号仅 `1.9px`，移动端完全无法辨认文字。
- **修复措施**：在 `posts/from-build-to-production-harness-managed-runtime/talk-blueprint.css` 中归零 `.sr-figure, .generated-diagram` 左右外边距（桌面端图表可用宽度从 `1074px` 提升至 `1137px`）；并在 `@media (max-width: 960px)` 下为 `.sr-figure` 开启局部平滑横向滚动（`overflow-x: auto`）且锁定 `.sr-figure-svg { min-width: 920px; }`，使 `860px` 与 `390px` 视口下矢量图最小字号保持在 `8.0px–10.6px` 清晰可读区间，同时页面根容器 `horizontalOverflow = 0px`。
- **交互沙盒双语同步加固**：为 `posts/from-build-to-production-harness-managed-runtime/talk-blueprint.js` 底部操作胶囊补齐 `data-zh` / `data-en` 属性，并新增 `data-lang` 属性监听与 `langChanged` 事件绑定，确保语言切换零残留。

### 3.2 多视口与演示视图实测汇总表

| 检视视口与模式 | 页面级横向溢出 | 表格 / 公式 / 双栏媒体卡表现 | 矢量图与沙盒辅助字号实测 | 结论 |
| --- | --- | --- | --- | --- |
| 桌面宽屏 `1440×900`（中/英 · 亮/暗） | `0px`（`scrollWidth = 1440`） | 表格宽 `1170px` 完整落入 `1198px` 容器；公式块居中无滚动条；媒体卡双列对齐 | 正文 `15.2px`、表头 `12.8px`、图注 `13.4px`、沙盒药丸 `12.5px–12.8px`、图 1 节点标题 `12.5px` / 详情 `9.9px`、图 2 轴标签 `13.7px` | 通过 |
| 平板窄屏 `860×780`（中/英 · 亮/暗） | `0px`（`scrollWidth = 860`） | `.b2p-media-grid` 与 `.b2p-timeline-bar` 自动单列堆叠；表格与图表容器内部平滑横滚 | 图 1 / 图 2 保底 `920px` 卡片画布（最小字号 `8.0px` / `10.6px`），零挤压重叠 | 通过 |
| 手机竖屏 `390×844`（中/英 · 亮/暗） | `0px`（`scrollWidth = 390`） | 表格（`min-width: 600px`）与公式块（`overflow-x: auto`）均在各自容器内滑动，不撑破整页；图注自动纵向排布 | 沙盒五场景按钮单列满宽易点按；媒体卡 `336px` 宽清晰展示；参考文献长链接 `overflow-wrap: anywhere` 零溢出 | 通过 |
| 演示视图 `Presentation`（1–10 页） | `0px`（全部 10 帧 `clippedCount = 0`） | 封面、四道断层对比表、图 1、三列机制卡、Git 接力对比、规模治理、图 2、五负载沙盒、参考文献与致谢页全部完整居中 | 双语标题与幻灯片菜单项 100% 本地化对齐 | 通过 |

---

## 4. 确定性构建门禁与实机核验留证

1. **单篇发布与 14 项静态门禁**：运行 `node tools/publish-article.js from-build-to-production-harness-managed-runtime` 返回 `state: "published"`，`validation.ok = true`（`knowledge`、`scripts`、`inline-styles`、`inline-js`、`assets`、`css`、`structure`、`quotes`、`gap`、`surface`、`i18n`、`density`、`citations`、`customizations` 共 14/14 全部通过，媒体总体积 `1.75 MB` 远低于 `25 MB` 上限）。
2. **实机浏览器截图抽检留证**：已通过 Orca 内嵌浏览器采集 `1440×900` 暗色模式下的图 1 拓扑、BRK259/BRK378 双栏配图卡片（经 `cua_safe_image.py` 压缩核验，深曜石画框彻底消除亮白刺眼边缘）及 `390×844` 移动端沙盒视图，控制台零报错；`cua_i18n_locale` 按项目测试计划配置显式记为 `SKIPPED`（已在本文双语 DOM 审计中覆盖中/英切换核验）。

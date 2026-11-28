'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const compiler = require('../tools/markdown-compiler');
const cli = require('../tools/compile-markdown-article');

const ROOT = path.resolve(__dirname, '..');

test('YAML frontmatter maps to .hero with bilingual title, eyebrow, lead, metrics, panel, and style tokens', () => {
  const sample = [
    '---',
    'title: 中文主标题 || English Main Title',
    'eyebrow: Genesis Eyebrow || Genesis Eyebrow',
    'brand: Genesis Brand || Genesis Brand',
    'lead: 这是首屏导语。 || This is the hero lead.',
    'panel_label: 架构摘要 || Arch Summary',
    'panel_title: 三层解耦 || Three-Tier Decoupling',
    'panel_desc: 零后端静态渲染。 || Zero-backend static rendering.',
    'panel:',
    '  - 第一层：唯一真源 || Layer 1: Single Source',
    '  - 第二层：编译内核 || Layer 2: Compiler Kernel',
    'metrics:',
    '  - 组件指令 || Directives | 9 | 全部覆盖 || Full coverage',
    '  - 门禁通过 || Gate Pass | 100% | 14 项静态检查 || 14 static checks',
    'style:',
    '  accent: "#ff7a00"',
    '---',
    '',
    '## #overview 01 / Overview :: 章节一 || Chapter One',
    '',
    '章节导语段落。 || Section lead paragraph.'
  ].join('\n');

  const res = compiler.compileMarkdownToHtml(sample);
  assert.equal(res.stats.sectionCount, 1);
  assert.equal(res.stats.hasMermaid, false);
  assert.match(res.html, /<header class="hero">/);
  assert.match(res.html, /data-zh="中文主标题" data-en="English Main Title"/);
  assert.match(res.html, /class="hero-panel load-in"/);
  assert.match(res.html, /class="hero-metrics load-in"/);
  assert.match(res.html, /<strong>9<\/strong>/);
  assert.match(res.html, /--accent: #ff7a00;/);
  assert.doesNotMatch(res.html, /genesis-view-bar|genesis-source-drawer|data-genesis-mode/);
  assert.doesNotMatch(res.html, /<script(?![^>]*\bsrc\b)/);

  const contract = compiler.verifyCompiledHtmlContract(res.html);
  assert.equal(contract.ok, true, contract.errors.join('; '));
});

test('all 9 Study Room visual & interactive component directives compile to canonical DOM contracts', () => {
  const sample = [
    '---',
    'title: 九大组件测试 || Nine Directives Test',
    'strict_i18n: true',
    'strict_density: true',
    '---',
    '',
    '## #sec1 01 / Overview :: 章节与组件验证 || Section and Component Check',
    '',
    '导语引用验证 [1]。 || Lead citation check [1].',
    '',
    ':::insight-grid { cols: 3, title: "洞察网格 || Insight Grid" }',
    '::card 01',
    '### 卡片一 || Card One',
    '卡片一内容。 || Card one body.',
    '::card 02',
    '### 卡片二 || Card Two',
    '卡片二内容。 || Card two body.',
    '::card 03',
    '### 卡片三 || Card Three',
    '卡片三内容。 || Card three body.',
    ':::',
    '',
    ':::comparison { title: "方案对比 || Comparison" }',
    '::versus 传统方案 || Legacy',
    '### 手写 HTML || Handwritten HTML',
    '维护成本高。 || High maintenance cost.',
    '::versus 创世纪方案 || Genesis { highlight: true }',
    '### 纯静态编译 || Static Compilation',
    '零后端依赖。 || Zero backend dependency.',
    ':::',
    '',
    '| 指标 | 数值 |',
    '|------|------|',
    '| 门禁 | 14 |',
    '',
    ':::flow { title: "执行流程 || Flow" }',
    '1. **解析源稿 || Parse Source** — 读取 Markdown || Read Markdown',
    '2. **输出静态页 || Emit Static HTML** — 写入磁盘 || Write to disk',
    ':::',
    '',
    ':::timeline { title: "演进时间轴 || Timeline" }',
    '1. **第一阶段 || Phase 1** — 编译内核落地 || Compiler kernel',
    ':::',
    '',
    ':::callout { title: "架构原则 || Principle" }',
    '纯静态直出 GitHub Pages。 || Pure static delivery to GitHub Pages.',
    ':::',
    '',
    '行内公式 $E = mc^2$ 与块级公式：',
    '',
    '$$',
    '\\int_0^1 x^2 \\, dx = \\frac{1}{3}',
    '$$',
    '',
    '```mermaid',
    'graph LR',
    '  A --> B',
    '```',
    '',
    ':::diagram { src: "./media/arch", drawio: "./media/arch.drawio", title: "双语架构图 || Bilingual Diagram" }',
    '图注说明 || Diagram caption',
    ':::',
    '',
    ':::sandbox { id: "demo-box", script: "./demo.js", style: "./demo.css", title: "交互沙盒 || Interactive Sandbox" }',
    '沙盒描述 || Sandbox description',
    ':::',
    '',
    '### 自动折叠手风琴一 || Auto Accordion One',
    '手风琴内容一。 || Accordion content one.',
    '',
    '### 自动折叠手风琴二 || Auto Accordion Two',
    '手风琴内容二。 || Accordion content two.',
    '',
    '## #references 02 / References :: 参考来源 || References',
    '',
    '- [1] Genesis Spec — https://example.com/spec | 规范文档 || Specification doc'
  ].join('\n');

  const res = compiler.compileMarkdownToHtml(sample);
  assert.equal(res.stats.hasMath, true);
  assert.equal(res.stats.hasMermaid, true);
  assert.equal(res.stats.sandboxCount, 1);

  // 1. Section + presentation step attributes
  assert.match(res.html, /<section id="sec1" class="section" data-reveal data-present-title-zh="章节与组件验证" data-present-title-en="Section and Component Check">/);
  // 2. Accordion
  assert.match(res.html, /class="subsection-accordion"/);
  assert.match(res.html, /data-accordion/);
  assert.match(res.html, /class="subsection-toggle"/);
  // 3. Insight grid
  assert.match(res.html, /class="insight-grid insight-grid-3"/);
  assert.match(res.html, /class="insight-card"/);
  // 4. Comparison grid & table
  assert.match(res.html, /class="comparison-grid section-grid-spaced"/);
  assert.match(res.html, /class="comparison-card next"/);
  assert.match(res.html, /class="simple-table compare-table"/);
  // 5. Flow & timeline
  assert.match(res.html, /class="flow-list"/);
  assert.match(res.html, /class="flow-list timeline-list"/);
  // 6. Callout / quote block
  assert.match(res.html, /class="quote-block insight-callout"/);
  // 7. Math & Mermaid
  assert.match(res.html, /class="math-inline" data-latex="E = mc\^2"/);
  assert.match(res.html, /class="math-block" data-latex="\\int_0\^1 x\^2 \\, dx = \\frac\{1\}\{3\}"/);
  assert.match(res.html, /class="mermaid-container"/);
  // 8. Bilingual diagram
  assert.match(res.html, /<img class="diagram-zh" src="\.\/media\/arch\.zh\.svg"/);
  assert.match(res.html, /<img class="diagram-en" src="\.\/media\/arch\.en\.svg"/);
  assert.match(res.html, /href="\.\/media\/arch\.drawio" download/);
  // 9. Sandbox slot
  assert.match(res.html, /id="demo-box" class="sandbox-slot" data-sandbox-slot="demo-box"/);
  assert.match(res.html, /<link rel="stylesheet" href="\.\/demo\.css" \/>/);
  assert.match(res.html, /<script src="\.\/demo\.js"><\/script>/);
  // 10. Clean progressive disclosure presentation: zero Genesis dual-view switcher bar or source drawer
  assert.doesNotMatch(res.html, /genesis-view-bar/);
  assert.doesNotMatch(res.html, /genesis-source-drawer/);
  assert.doesNotMatch(res.html, /data-genesis-mode/);
  assert.doesNotMatch(res.html, /Genesis 纯静态编译产物 · 零后端依赖 · 支持渐进披露与源稿对照/);
  assert.doesNotMatch(res.html, /渐进披露视图/);
  assert.doesNotMatch(res.html, /线性展开视图/);
  assert.doesNotMatch(res.html, /Markdown 源稿对照/);
  assert.match(res.html, /mermaid\.initialize/);

  const contract = compiler.verifyCompiledHtmlContract(res.html);
  assert.equal(contract.ok, true, contract.errors.join('; '));
});

test('Markdown tables with bilingual || separators, inline code, and angle placeholders compile into clean .compare-table DOM', () => {
  const sample = [
    '---',
    'title: 双语表格与代码块回归测试 || Bilingual Table and Code Block Regression',
    'strict_i18n: true',
    'strict_density: true',
    '---',
    '',
    '## #sec1 01 / Overview :: 表格与代码块验证 || Table and Code Block Check',
    '',
    '导语包含 `New experience` 与 **粗体** 以及 `<app-id>` 占位符 [1]。 || Lead with `New experience`, **bold**, and `<app-id>` placeholder [1].',
    '',
    '| 对比维度 || Dimension | 托管应用 || Managed App | 新版智能体 || New Agent |',
    '|------|------|------|',
    '| 入口命令 || CLI Entry | 使用 `ms app clone --app <id>` [1] || Use `ms app clone --app <id>` [1] | 使用 `msagent` 命令行 [1] || Use `msagent` CLI [1] |',
    '| 计费规则 || Billing Rule | 每次调用 `0.1 Credit` || `0.1 Credit` per call | 按实际 Token 计量 || Metered by tokens |',
    '',
    '### 含有 `#` 注释的 Bash 代码块折叠面板 || Accordion with `#` Comments in Bash Fence',
    '',
    '```bash',
    '# 1. 第一步注释不应被拆成 H1',
    'msagent deployment create --environment-id <target>',
    '# 2. 第二步注释也不应被拆成 H1',
    'msagent agent deploy --publish',
    '```',
    '',
    '## #references 02 / References :: 参考来源 || References',
    '',
    '- [1] Official Docs — https://example.com/docs | 包含 `ms.<stage>.config.json` 说明 || Covers `ms.<stage>.config.json` spec'
  ].join('\n');

  const res = compiler.compileMarkdownToHtml(sample);
  // Table must be compiled as <table class="simple-table compare-table"> with exact 3 columns per row
  assert.match(res.html, /<table class="simple-table compare-table">/);
  const trMatches = res.html.match(/<tr>[\s\S]*?<\/tr>/g) || [];
  assert.equal(trMatches.length, 3);
  const thCount = (trMatches[0].match(/<th\b/g) || []).length;
  assert.equal(thCount, 3);
  const firstRowTdCount = (trMatches[1].match(/<td\b/g) || []).length;
  assert.equal(firstRowTdCount, 3);

  // No raw `||` or unrendered backticks inside data-zh / data-en
  assert.doesNotMatch(res.html, /<p>\|\s*对比维度/);
  assert.match(res.html, /data-zh="使用 &lt;code&gt;ms app clone --app &amp;lt;id&amp;gt;&lt;\/code&gt; \[1\]"/);
  assert.match(res.html, /data-en="Use &lt;code&gt;ms app clone --app &amp;lt;id&amp;gt;&lt;\/code&gt; \[1\]"/);

  // Bash comments inside accordion fenced code block must remain inside <pre><code class="language-bash"> and never become <h1>
  assert.doesNotMatch(res.html, /<h1>1\. 第一步注释不应被拆成 H1<\/h1>/);
  assert.match(res.html, /# 1\. 第一步注释不应被拆成 H1\nmsagent deployment create --environment-id &lt;target&gt;\n# 2\. 第二步注释也不应被拆成 H1/);

  const contract = compiler.verifyCompiledHtmlContract(res.html);
  assert.equal(contract.ok, true, contract.errors.join('; '));
});

test('section headings starting with decimal numbers (e.g. 57.35 GB) keep their full prefix in nav, hero CTA, h2, and presentation steps', () => {
  const sample = [
    '---',
    'title: 小数章节标题回归测试 || Decimal Heading Regression',
    '---',
    '',
    '## #overview 01 / Overview :: 概览 || Overview',
    '',
    '第一段。 || First paragraph.',
    '',
    '## #minimax-music3 02 / Deep Audit :: 57.35 GB 原仓拆解与部署定论 || 57.35 GB Repository Anatomy and Verdict',
    '',
    '第二段。 || Second paragraph.'
  ].join('\n');

  const res = compiler.compileMarkdownToHtml(sample);
  assert.doesNotMatch(res.html, /data-zh="35 GB/);
  assert.doesNotMatch(res.html, /data-en="35 GB/);
  assert.match(res.html, /<a href="#minimax-music3" data-zh="57\.35 GB 原仓拆解与部署定论" data-en="57\.35 GB Repository Anatomy and Verdict">57\.35 GB 原仓拆解与部署定论<\/a>/);
  assert.match(res.html, /class="button button-secondary" href="#minimax-music3" data-zh="57\.35 GB 原仓拆解与部署定论"/);
  assert.match(res.html, /data-present-title-zh="57\.35 GB 原仓拆解与部署定论" data-present-title-en="57\.35 GB Repository Anatomy and Verdict"/);
  assert.match(res.html, /<h2 data-zh="2\. 57\.35 GB 原仓拆解与部署定论" data-en="2\. 57\.35 GB Repository Anatomy and Verdict">2\. 57\.35 GB 原仓拆解与部署定论<\/h2>/);
});

test('adaptive hero subtraction: omitting panel and metrics renders clean single-column opening without default right card or metric tiles', () => {
  // Morphology 1: Pure prose opening (no panel, no metrics, no intro quote) -> zero .hero-panel and zero .hero-metrics
  const pureProseMd = [
    '---',
    'title: 用户实操手册：三步完成环境初始化 || User Manual: Three-Step Environment Setup',
    'eyebrow: User Manual || User Manual',
    'brand: Study Room || Study Room',
    'strict_i18n: true',
    'strict_density: true',
    'lead: 面向一线运维工程师的最短跑通路径与常见故障排查清单 [1]。 || Shortest working setup path and troubleshooting checklist for operations engineers [1].',
    '---',
    '',
    '## #prereq 01 / Prerequisites :: 前置条件与依赖检查 || Prerequisites and Dependency Check',
    '',
    '先核对本机运行时版本，确保满足最低兼容门槛 [1]。 || Verify local runtime versions to meet minimum compatibility thresholds [1].',
    '',
    '| 检查项 || Item | 最低版本 || Minimum Version | 验证命令 || Command |',
    '|------|------|------|',
    '| Node.js || Node.js | `v20.0.0` || `v20.0.0` | `node -v` || `node -v` |',
    '',
    '## #references 02 / References :: 参考来源 || References',
    '',
    '- [1] Node.js Release Schedule — https://nodejs.org/en/about/previous-releases | 官方长期支持版本周期说明 || Official LTS release schedule'
  ].join('\n');

  const pureRes = compiler.compileMarkdownToHtml(pureProseMd);
  assert.doesNotMatch(pureRes.html, /class="hero-panel/);
  assert.doesNotMatch(pureRes.html, /核心架构摘要/);
  assert.doesNotMatch(pureRes.html, /class="hero-metrics/);
  assert.match(pureRes.html, /<div class="hero-grid">\s*<div class="hero-copy load-in">/);
  const pureContract = compiler.verifyCompiledHtmlContract(pureRes.html);
  assert.equal(pureContract.ok, true, pureContract.errors.join('; '));

  // Morphology 2: Single-column opening WITH authentic metrics (metrics present, panel omitted)
  const metricsOnlyMd = [
    '---',
    'title: 2026 企业智能体采购市场调研 || 2026 Enterprise Agent Procurement Survey',
    'eyebrow: Market Research || Market Research',
    'strict_i18n: true',
    'strict_density: true',
    'lead: 基于 120 家受访企业的预算分配与交付周期实证对比。 || Empirical comparison of budget allocation and delivery cycles across 120 surveyed enterprises.',
    'metrics:',
    '  - 样本规模 || Sample Size | 120 家 || 120 Orgs | 覆盖金融、制造与医疗行业 || Spanning finance, manufacturing, and healthcare',
    '  - 中位回本周期 || Median Payback | 7.5 个月 || 7.5 Months | 已计入数据治理与集成成本 || Includes data governance and integration costs',
    '---',
    '',
    '## #landscape 01 / Landscape :: 预算结构与采购重心 || Budget Structure and Procurement Focus',
    '',
    '受访企业将 62% 的首年投入用于既有业务系统连接器与权限审计。 || Surveyed enterprises allocate 62% of first-year spend to legacy connectors and permission auditing.'
  ].join('\n');

  const metricsOnlyRes = compiler.compileMarkdownToHtml(metricsOnlyMd);
  assert.doesNotMatch(metricsOnlyRes.html, /class="hero-panel/);
  assert.match(metricsOnlyRes.html, /class="hero-metrics load-in"/);
  assert.match(metricsOnlyRes.html, /120 家/);
  assert.equal(compiler.verifyCompiledHtmlContract(metricsOnlyRes.html).ok, true);

  // Morphology 3: Intro blockquote fallback -> renders .hero-panel even when frontmatter omits panel keys
  const introQuoteMd = [
    '---',
    'title: 建模摘要回退兼容验证 || Intro Blockquote Panel Fallback',
    '---',
    '',
    '这是首屏导语段落。 || Hero lead paragraph.',
    '',
    '> 关键建模假设 || Key Modeling Assumptions',
    '> - 到达过程服从非齐次泊松分布 || Arrivals follow a non-homogeneous Poisson process',
    '> - 服务窗口容量保持恒定 || Service window capacity remains constant',
    '',
    '## #model 01 / Model :: 模型推导 || Model Formulation',
    '',
    '令到达率函数为 $\\lambda(t)$。 || Let the arrival rate function be $\\lambda(t)$.'
  ].join('\n');

  const quoteRes = compiler.compileMarkdownToHtml(introQuoteMd);
  assert.match(quoteRes.html, /class="hero-panel load-in"/);
  assert.match(quoteRes.html, /关键建模假设/);
  assert.doesNotMatch(quoteRes.html, /class="hero-metrics/);
  assert.equal(compiler.verifyCompiledHtmlContract(quoteRes.html).ok, true);

  // Shared stylesheet must carry adaptive single-column rules for panel-free heroes
  const articleCss = fs.readFileSync(path.join(ROOT, 'assets/article.css'), 'utf8');
  assert.match(articleCss, /\.hero-grid:not\(:has\(\.hero-panel\)\)/);
  assert.match(articleCss, /\.hero:not\(:has\(\.hero-panel\)\):not\(:has\(\.hero-metrics\)\)/);
});

test('all existing Markdown-compiled articles remain 100% byte-compatible and free of Genesis view-switcher pills', () => {
  const postsDir = path.join(ROOT, 'posts');
  const allGenesisSlugs = fs.readdirSync(postsDir).filter((slug) => {
    const htmlPath = path.join(postsDir, slug, 'index.html');
    if (!fs.existsSync(htmlPath)) return false;
    return fs.readFileSync(htmlPath, 'utf8').includes('Genesis 纯静态 Markdown 编译管线生成');
  });
  assert.ok(allGenesisSlugs.length >= 58, `Expected at least 58 Genesis-compiled articles, found ${allGenesisSlugs.length}`);

  for (const slug of allGenesisSlugs) {
    const mdPath = path.join(postsDir, slug, 'article.md');
    const htmlPath = path.join(postsDir, slug, 'index.html');
    assert.equal(
      cli.main(['node', 'compile-markdown-article.js', mdPath, '--check', htmlPath]),
      0,
      `Expected ${slug} to remain byte-identical with compiled output`
    );
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.doesNotMatch(html, /genesis-view-bar|genesis-source-drawer|data-genesis-mode/);
  }
});

test('benchmark articles (markdown-genesis-lab & claw-code-analysis/genesis.html) compile deterministically and pass validate.js', () => {
  const genesisLabMd = path.join(ROOT, 'posts/markdown-genesis-lab/article.md');
  const genesisLabHtml = path.join(ROOT, 'posts/markdown-genesis-lab/index.html');
  const clawMd = path.join(ROOT, 'posts/claw-code-analysis/article.md');
  const clawGenesisHtml = path.join(ROOT, 'posts/claw-code-analysis/genesis.html');

  assert.equal(cli.main(['node', 'compile-markdown-article.js', genesisLabMd, '--check', genesisLabHtml]), 0);
  assert.equal(cli.main(['node', 'compile-markdown-article.js', clawMd, '--check', clawGenesisHtml]), 0);

  // Run repository validate.js on markdown-genesis-lab
  const output = childProcess.execFileSync('node', [path.join(ROOT, 'tests/validate.js'), '--article', 'markdown-genesis-lab'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  assert.match(output, /RESULT: All tests passed/);
});

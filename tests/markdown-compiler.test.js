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
  assert.match(res.html, /<header class="hero">/);
  assert.match(res.html, /data-zh="中文主标题" data-en="English Main Title"/);
  assert.match(res.html, /class="hero-panel load-in"/);
  assert.match(res.html, /class="hero-metrics load-in"/);
  assert.match(res.html, /<strong>9<\/strong>/);
  assert.match(res.html, /--accent: #ff7a00;/);

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
  // Dual-view switcher bar
  assert.match(res.html, /data-genesis-mode="progressive"/);
  assert.match(res.html, /data-genesis-mode="linear"/);
  assert.match(res.html, /data-genesis-mode="source"/);

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

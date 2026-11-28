'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const reverseCli = require('../tools/html-to-markdown-article');
const genesisCompiler = require('../tools/markdown-compiler');
const navSync = require('../tools/sync-docs-navigation');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');

test('HTML -> Genesis Extended Markdown reverse compiler extracts YAML frontmatter, bilingual || tokens, and all 9 Genesis directives', () => {
  const sampleHtml = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN" data-present-i18n="strict" data-section-density="strict">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <title>测试文章标题</title>',
    '  <link rel="stylesheet" href="./custom-lab.css" />',
    '  <style>:root { --accent: #7c3aed; --teal: #0d8f8c; }</style>',
    '</head>',
    '<body>',
    '  <div class="site">',
    '    <header class="hero">',
    '      <div class="topbar">',
    '        <a class="home-link" href="../../">←</a>',
    '        <div class="brand"><span class="brand-mark"></span><span data-zh="AI研究" data-en="AI Research">AI研究</span></div>',
    '      </div>',
    '      <div class="hero-grid">',
    '        <div class="hero-copy">',
    '          <span class="eyebrow" data-zh="架构专题 · 2026-11-24" data-en="Architecture · 2026-11-24">架构专题 · 2026-11-24</span>',
    '          <h1 data-zh="双向编译架构测试" data-en="Bidirectional Compiler Test">双向编译架构测试</h1>',
    '          <p data-zh="这是导语段落 [1]。" data-en="This is the lead paragraph [1].">这是导语段落 [1]。</p>',
    '          <div class="hero-actions"><a class="button button-primary" href="#sec-one" data-zh="开始阅读" data-en="Read Now">开始阅读</a></div>',
    '        </div>',
    '        <aside class="hero-panel">',
    '          <span class="panel-label" data-zh="核心摘要" data-en="Core Brief">核心摘要</span>',
    '          <h2 data-zh="零折损结构映射" data-en="Lossless Structural Mapping">零折损结构映射</h2>',
    '          <p data-zh="保留全部语义容器。" data-en="Preserves all semantic containers.">保留全部语义容器。</p>',
    '          <ul class="layer-list">',
    '            <li><span class="layer-number">1</span><span data-zh="第一层映射" data-en="Layer 1 mapping">第一层映射</span></li>',
    '          </ul>',
    '        </aside>',
    '      </div>',
    '      <div class="hero-metrics">',
    '        <div class="metric">',
    '          <div class="metric-label" data-zh="覆盖率" data-en="Coverage">覆盖率</div>',
    '          <strong>100%</strong>',
    '          <span data-zh="全量通过门禁" data-en="Passes all gates">全量通过门禁</span>',
    '        </div>',
    '      </div>',
    '    </header>',
    '    <main>',
    '      <section id="sec-one" class="section">',
    '        <div class="section-head">',
    '          <p class="section-kicker" data-zh="01 / 核心架构" data-en="01 / Core Architecture">01 / 核心架构</p>',
    '          <h2 data-zh="组件容器一对一还原" data-en="One-to-One Container Recovery">组件容器一对一还原</h2>',
    '          <p data-zh="章节导语说明 [1]。" data-en="Section lead note [1].">章节导语说明 [1]。</p>',
    '        </div>',
    '        <div class="insight-grid" data-step-title="洞察卡片" data-step-title-en="Insight Cards">',
    '          <article class="insight-card"><span class="card-index">01</span><h3 data-zh="卡片一" data-en="Card One">卡片一</h3><p data-zh="洞察说明" data-en="Insight body">洞察说明</p></article>',
    '          <article class="insight-card"><span class="card-index">02</span><h3 data-zh="卡片二" data-en="Card Two">卡片二</h3><p data-zh="洞察说明二" data-en="Insight body two">洞察说明二</p></article>',
    '        </div>',
    '        <div class="comparison-grid">',
    '          <article class="comparison-card"><span class="comparison-label" data-zh="旧方案" data-en="Legacy">旧方案</span><h3 data-zh="手写模板" data-en="Manual HTML">手写模板</h3><p data-zh="维护困难" data-en="Hard to maintain">维护困难</p></article>',
    '          <article class="comparison-card next"><span class="comparison-label" data-zh="新方案" data-en="Genesis">新方案</span><h3 data-zh="扩展 MD" data-en="Extended MD">扩展 MD</h3><p data-zh="毫秒编译" data-en="Fast build">毫秒编译</p></article>',
    '        </div>',
    '        <ol class="flow-list">',
    '          <li class="flow-step"><div class="flow-copy"><strong data-zh="步骤一" data-en="Step 1">步骤一</strong><p data-zh="解析 DOM 树" data-en="Parse DOM AST">解析 DOM 树</p></div></li>',
    '        </ol>',
    '        <div class="quote-block insight-callout"><strong data-zh="核心红线" data-en="Guardrail">核心红线</strong><span data-zh="严禁破坏存量 HTML。" data-en="Never mutate legacy HTML.">严禁破坏存量 HTML。</span></div>',
    '        <table class="compare-table"><thead><tr><th data-zh="维度" data-en="Aspect">维度</th><th data-zh="结果" data-en="Result">结果</th></tr></thead><tbody><tr><td data-zh="数学公式" data-en="Math">数学公式</td><td><span class="math-inline" data-latex="E=mc^2">E=mc^2</span></td></tr></tbody></table>',
    '        <div class="math-block" data-latex="\\sum_{i=1}^n x_i = S"></div>',
    '        <figure class="generated-diagram"><img class="diagram-zh" src="media/arch.zh.svg" alt="架构图" /><img class="diagram-en" src="media/arch.en.svg" alt="Arch" /><figcaption class="diagram-caption"><span data-zh="图 1 说明" data-en="Fig 1 caption">图 1 说明</span><a href="media/arch.drawio" download>下载</a></figcaption></figure>',
    '        <div class="sim-container"><canvas id="wave-sim" width="600" height="240" aria-label="波形模拟"></canvas><label data-zh="频率" data-en="Frequency">频率</label><input type="range" min="1" max="10" value="3" /></div>',
    '        <div class="subsection-accordion"><article class="subsection-item is-open" data-accordion><button class="subsection-toggle"><span data-zh="折叠详情" data-en="Accordion Detail">折叠详情</span></button><div class="subsection-content"><p data-zh="内部段落" data-en="Inner text">内部段落</p></div></article></div>',
    '      </section>',
    '      <section id="references" class="section">',
    '        <div class="section-head"><p class="section-kicker">02 / References</p><h2>参考资料</h2></div>',
    '        <ol class="bib-list"><li id="ref-1"><span class="bib-id">[1]</span><span class="bib-author">Study Room</span><a href="https://example.com/doc">https://example.com/doc</a><span class="bib-note" data-zh="架构文档" data-en="Arch Doc">架构文档</span></li></ol>',
    '      </section>',
    '    </main>',
    '  </div>',
    '  <script src="./custom-lab.js"></script>',
    '</body>',
    '</html>'
  ].join('\n');

  const conv = reverseCli.convertHtmlArticleToMarkdown(sampleHtml, { slug: 'unit-sample' });
  const md = conv.markdown;

  // Frontmatter & style tokens
  assert.match(md, /title: "双向编译架构测试 \|\| Bidirectional Compiler Test"/);
  assert.match(md, /brand: "AI研究 \|\| AI Research"/);
  assert.match(md, /accent: "#7c3aed"/);
  assert.match(md, /teal: "#0d8f8c"/);
  assert.match(md, /metrics:\n  - "覆盖率 \|\| Coverage \| 100% \| 全量通过门禁 \|\| Passes all gates"/);

  // Extended Genesis directives
  assert.match(md, /## #sec-one 01 \/ Core Architecture :: 组件容器一对一还原 \|\| One-to-One Container Recovery/);
  assert.match(md, /:::insight-grid \{ cols: 2, title: "洞察卡片 \|\| Insight Cards" \}/);
  assert.match(md, /::card 01/);
  assert.match(md, /:::comparison/);
  assert.match(md, /::versus 新方案 \|\| Genesis \{ highlight: true \}/);
  assert.match(md, /:::flow/);
  assert.match(md, /:::callout \{ title: "核心红线 \|\| Guardrail" \}/);
  assert.match(md, /\| 维度 \|\| Aspect \| 结果 \|\| Result \|/);
  assert.match(md, /\$E=mc\^2\$/);
  assert.match(md, /\$\$\n\\sum_\{i=1\}\^n x_i = S\n\$\$/);
  assert.match(md, /:::diagram \{ src: "\.\/media\/arch", drawio: "\.\/media\/arch\.drawio" \}/);
  assert.match(md, /:::sandbox \{ id: "wave-sim", title: "波形模拟", script: "\.\/custom-lab\.js", style: "\.\/custom-lab\.css" \}/);
  assert.match(md, /:::accordion/);

  // Round-trip compilation through Genesis compiler
  const compiled = genesisCompiler.compileMarkdownToHtml(md);
  const contract = genesisCompiler.verifyCompiledHtmlContract(compiled.html);
  assert.equal(contract.ok, true, contract.errors.join('; '));
  assert.equal(compiled.stats.sectionCount, 2);
  assert.equal(compiled.stats.hasMath, true);
  assert.equal(compiled.stats.sandboxCount, 1);
});

test('all 4 protected native Markdown benchmarks remain untouched when running reverse compiler', () => {
  const protectedSlugs = Object.keys(reverseCli.PROTECTED_NATIVE_SLUGS);
  assert.equal(protectedSlugs.length, 4);

  const hashesBefore = {};
  for (const slug of protectedSlugs) {
    const p = path.join(POSTS_DIR, slug, 'article.md');
    assert.ok(fs.existsSync(p), `Missing native article.md for ${slug}`);
    hashesBefore[slug] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    const res = reverseCli.convertPostSlug(slug, {}, { overwrite: true });
    assert.equal(res.skipped, true);
    assert.equal(res.reason, 'protected-native-md');
    const hashAfter = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    assert.equal(hashAfter, hashesBefore[slug]);
  }
});

test('100% of posts/*/article.md (164 articles) exist alongside index.html and pass Genesis round-trip compilation & 14-gate contract check', () => {
  const htmlSlugs = fs.readdirSync(POSTS_DIR).filter(d => fs.existsSync(path.join(POSTS_DIR, d, 'index.html')));
  const mdSlugs = fs.readdirSync(POSTS_DIR).filter(d => fs.existsSync(path.join(POSTS_DIR, d, 'article.md')));
  assert.equal(mdSlugs.length, htmlSlugs.length, 'Every posts/<slug>/index.html must have a paired posts/<slug>/article.md');
  assert.ok(mdSlugs.length >= 164);

  const verifyReport = reverseCli.verifyAllMarkdownArticles();
  assert.equal(verifyReport.ok, true, JSON.stringify(verifyReport.failures, null, 2));
  assert.equal(verifyReport.totalChecked, htmlSlugs.length);
});

test('docs/navigation.json matches Study Room Knowledge Tree hierarchy and is in sync with tools/sync-docs-navigation.js', () => {
  const exitCode = navSync.main(['node', 'tools/sync-docs-navigation.js', '--check']);
  assert.equal(exitCode, 0);

  const built = navSync.buildNavigationManifest();
  assert.equal(built.manifest.version, 1);
  assert.ok(built.stats.articleCount >= 164);
  assert.equal(built.stats.domainCount, 5);
  const topTitles = built.manifest.nodes.map(n => n.title);
  assert.ok(topTitles.some(t => t.includes('AI研究')));
  assert.ok(topTitles.some(t => t.includes('Microsoft AI')));
  assert.ok(topTitles.some(t => t.includes('AI项目实践')));
  assert.ok(topTitles.some(t => t.includes('教育')));
  assert.ok(topTitles.some(t => t.includes('平台工程与架构文档')));
});

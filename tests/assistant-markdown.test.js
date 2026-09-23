'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const renderer = require('../assets/assistant-markdown');
const katex = require('../assets/vendor/katex-0.16.11/katex.min.js');
const render = renderer.render;

test('pinned vendor files and all local font dependencies are complete', () => {
  const path = require('node:path'), { createHash } = require('node:crypto');
  const vendor = path.join(__dirname, '../assets/vendor');
  const sums = fs.readFileSync(path.join(vendor, 'SHA256SUMS'), 'utf8').trim().split('\n');
  assert.equal(sums.length, 65);
  for (const line of sums) {
    const [hash, file] = line.split('  ');
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(vendor, file))).digest('hex'), hash, file);
  }
  const css = fs.readFileSync(path.join(vendor, 'katex-0.16.11/katex.min.css'), 'utf8');
  for (const match of css.matchAll(/url\((fonts\/[^)]+)\)/g)) assert.ok(fs.existsSync(path.join(vendor, 'katex-0.16.11', match[1])));
  assert.equal(katex.version, '0.16.11');
});

// Minimal DOM double: source must arrive as text, never as a model-controlled attribute.
function mathNode(source) {
  return { textContent: source, classes: [], removed: false,
    classList: { add(name) { this.owner.classes.push(name); } },
    removeAttribute(name) { assert.equal(name, 'data-assistant-math'); this.removed = true; } };
}
function element(node) { node.classList.owner = node; return { querySelectorAll: () => [node] }; }

test('CommonMark/GFM: headings, paragraphs, nested lists, quotes, links, code, table empties', () => {
  const html = render(fs.readFileSync(__dirname + '/fixtures/assistant-response.md', 'utf8'));
  for (const tag of ['h2','h3','h4','h5','h6','strong','em','s','blockquote','ul','ol','pre','code','hr','table']) {
    assert.match(html, new RegExp('<' + tag + '[ >]'), tag);
  }
  assert.match(render('# one\n\nline one\nline two'), /<h1>one<\/h1>\n<p>line one\nline two<\/p>/);
  assert.match(html, /<li>检查样本\n<ul>/);
  assert.match(html, /<td style="text-align:center"><\/td>/);
  assert.match(html, /<td style="text-align:left"><\/td>/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /assistant-table-scroll/);
});

test('all four math delimiters, numeric math, multiline/aligned, quote/list containers', () => {
  for (const source of [String.raw`$x^2$`, '$2+3$', '$20$', String.raw`\(x_1\)`, '$$x$$', String.raw`\[x\]`]) {
    assert.match(render(source), /data-assistant-math=/, source);
  }
  assert.match(render(String.raw`\[

\begin{aligned}x&=1\\y&=2\end{aligned}

\]`), /^<div class="assistant-math-display"/);
  assert.match(render('- \\[\n  x^2\n  \\]'), /<li>\n<div class="assistant-math-display"/);
  assert.match(render('> \\[\n> x^2\n> \\]'), /<blockquote>\n<div class="assistant-math-display"/);
  assert.match(render('before \\[x\\] after'), /<p>before <span class="assistant-math-display"/);
});

test('code owns its literal formula delimiters, fences, tilde fences, indentation, escaping', () => {
  for (const source of ['`$x$ \\(y\\) $$z$$ \\[a\\]`', '```js\n$x$ \\[z\\]\n```', '~~~\n$x$\n~~~', '    \\[x\\]\n', '``code ` $x$``']) {
    const html = render(source);
    assert.match(html, /<code/);
    assert.doesNotMatch(html, /data-assistant-math/);
  }
  assert.doesNotMatch(render(String.raw`\$5 and $10.00; $5 and $10; US$20; \\(x\\)`), /data-assistant-math/);
  assert.match(render('price $5 **bold**'), /<strong>bold<\/strong>/);
});

test('raw HTML, attribute quotes, URLs and remote images cannot become active content', () => {
  const attacks = [
    '<script>alert(1)</script>', '<img src=x onerror="alert(1)">', '<svg onload=alert(1)>',
    '[x](javascript:alert(1))', '[x](JaVaScRiPt:alert(1))', '[x](vbscript:evil)',
    '[x](data:text/html;base64,AAAA)', '[x](jav&#x61;script:alert(1))',
    '[x](javascript&#58;alert(1))', '[x](java&#x09;script:alert(1))',
    '![track](https://tracker.invalid/x)', '![track](data:image/png;base64,AAAA)',
    String.raw`\[x" onmouseover="alert(1)\]`, String.raw`$x"><img src=x onerror=alert(1)>$`,
    '```html\n<script>alert(1)</script>\n```'
  ];
  for (const source of attacks) {
    const html = render(source);
    assert.doesNotMatch(html, /<(script|img|svg|iframe)\b/i, source);
    assert.doesNotMatch(html, /href="(?:javascript|vbscript|data):/i, source);
    assert.doesNotMatch(html, /<[^>]+\son\w+=/i, source);
    assert.doesNotMatch(html, /data-latex-render/, source);
  }
});

test('every streamed prefix is renderable without private placeholders or active HTML', () => {
  const source = String.raw`## 标题

\[\frac{a_1}{b^2}\]

$x_1$ 与 \(y\)

` + '```js\nconst x = "$x$";\n```\n\n| a | b |\n|---|---|\n| | c |';
  for (let i = 0; i <= source.length; i++) {
    const html = render(source.slice(0, i));
    assert.doesNotMatch(html, /\x00|LATEX\d|CODE\d|undefined/);
  }
  for (const source of [String.raw`\[x_{a}`, String.raw`\(\alpha`, '$x_{a', '$$x']) {
    assert.ok(render(source).includes(source), source);
  }
  assert.match(render(source), /<td><\/td>/);
});

test('late/missing KaTeX keeps source; success uses explicit safe limits; bad math stays readable', () => {
  const node = mathNode(String.raw`\[\sum_{i=1}^n i\]`);
  renderer.renderMath(element(node), undefined);
  assert.equal(node.textContent, String.raw`\[\sum_{i=1}^n i\]`);
  renderer.renderMath(element(node), { render(source, target, options) {
    assert.equal(source, String.raw`\sum_{i=1}^n i`);
    assert.equal(options.trust, false); assert.equal(options.throwOnError, true);
    assert.equal(options.maxExpand, 1000); assert.equal(options.maxSize, 20);
    target.textContent = 'math';
  } });
  assert.equal(node.removed, true);
  const bad = mathNode(String.raw`\(\badcommand{x}\)`);
  renderer.renderMath(element(bad), { render() { throw new Error('bad formula'); } });
  assert.equal(bad.textContent, String.raw`\(\badcommand{x}\)`);
  assert.deepEqual(bad.classes, ['assistant-math-error']);
});

test('real pinned KaTeX supports screenshot math and denies trusted HTML/network commands', () => {
  for (const source of [String.raw`\min \sum_t (r_t-\hat r_t)^2`, String.raw`\mathbb E[\varepsilon_t\mid t,d]=0`,
    String.raw`\operatorname{Var}(\varepsilon_t)\ \text{稳定}`, String.raw`\begin{aligned}x&=1\\y&=2\end{aligned}`]) {
    assert.match(katex.renderToString(source, { trust: false, strict: 'ignore', throwOnError: true }), /class="katex"/);
  }
  for (const source of [String.raw`\href{javascript:alert(1)}{x}`, String.raw`\includegraphics{https://tracker.invalid/x}`, String.raw`\htmlClass{evil}{x}`]) {
    const html = katex.renderToString(source, { trust: false, strict: 'ignore' });
    assert.doesNotMatch(html, /<img|<a\s|class="evil"/);
  }
});

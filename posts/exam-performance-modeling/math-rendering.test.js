/* Run with: node --test posts/exam-performance-modeling/math-rendering.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const katex = require('./vendor/katex/katex.min.js');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const entities = text => text.replace(/&(amp|lt|gt|quot|apos);/g,
  (_, name) => ({amp:'&', lt:'<', gt:'>', quot:'"', apos:"'"}[name]));
const render = latex => katex.renderToString(latex, {
  strict: 'error', throwOnError: true, output: 'htmlAndMathml', trust: false
});

test('explicit formulas use valid LaTeX and accessible MathML', () => {
  const expressions = [...read('index.html').matchAll(/data-latex="([^"]+)"/g)]
    .map(match => entities(match[1]));
  assert.ok(expressions.length >= 39);
  for (const latex of expressions) assert.match(render(latex), /<math\b/);
  assert.ok(expressions.some(s => s.includes('\\begin{cases}')));
  assert.ok(expressions.some(s => s.includes('\\frac{RU-QV}{\\Delta}')));
});

test('both language versions can reconstruct valid inline formulas', () => {
  const source = read('math-rendering.js');
  const marker = 'var pattern = new RegExp';
  assert.ok(source.includes(marker));
  const context = {window: {addEventListener() {}},
    document: {readyState: 'loading', addEventListener() {}}, console};
  vm.runInNewContext(source.replace(marker,
    'window.testExpressions = expressions; ' + marker), context);
  const expressions = context.window.testExpressions;
  assert.ok(expressions.length >= 110);
  for (const [plain, latex] of expressions) {
    assert.match(render(latex), /<math\b/, plain);
  }
  const mapping = Object.fromEntries(expressions);
  assert.equal(mapping['Δ = 90.050833'], '\\Delta=90.050833');
  assert.equal(mapping['rₜ₋₁'], 'r_{t-1}');
  assert.ok(source.includes("document.addEventListener('langChanged', renderArticle)"));
});

test('first-year examples lead into the derivation and preserve the worked answers', () => {
  const html = read('index.html');
  assert.ok(html.indexOf('id="readiness"') < html.indexOf('id="models"'));
  assert.ok(html.indexOf('id="notation-guide"') < html.indexOf('id="coefficients"'));
  assert.ok(html.indexOf('J(C)=(80-C)^2+(78-C)^2') < html.indexOf('class="exam-derivation"'));
  assert.ok(html.includes('id="learning-check"'));
  for (let c = 70; c <= 90; c++) {
    assert.equal((80 - c) ** 2 + (78 - c) ** 2, 2 * (c - 79) ** 2 + 2);
  }
  assert.ok(Math.abs((80 + 78 + 81) / 3 - 79.66666666666667) < 1e-10);
  const result = JSON.parse(read('model-results.json'));
  assert.ok(Math.abs(result.targets.y.candidates.linear.forecast_points_150 - 132.6413952536068) < 1e-9);
  assert.equal(result.difficulty_comparison.formal_maximizer, 0.1);
});

test('modeling flow, mathematics toolkit, and final skills check have distinct roles', () => {
  const html = read('index.html');
  const section = id => html.match(new RegExp('<section id="' + id + '"[\\s\\S]*?</section>'))[0];
  const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids.slice(0, 4), ['problem', 'readiness', 'math-toolkit', 'objectives']);
  const flow = section('readiness');
  assert.equal((flow.match(/class="flow-item modeling-process-node/g) || []).length, 6);
  assert.ok(flow.includes('href="#process-data"') && flow.includes('href="#process-assumptions"'));
  const process = flow.match(/<figure class="modeling-process"[\s\S]*?<\/figure>/)[0];
  assert.ok(!process.includes('data-latex='), 'the six overview cards remain formula-free');
  const toolkit = section('math-toolkit');
  for (const id of ['toolkit-essential', 'toolkit-rates', 'toolkit-means', 'toolkit-functions',
    'toolkit-symbols', 'notation-guide', 'toolkit-slopes', 'toolkit-errors', 'toolkit-testing',
    'toolkit-algebra', 'toolkit-quadratics', 'toolkit-probability', 'toolkit-proxies']) {
    assert.ok(toolkit.includes('id="' + id + '"'), id);
  }
  assert.equal((html.match(/id="notation-guide"/g) || []).length, 1);
  assert.ok(!section('variables').includes('id="notation-guide"'));
  const ending = section('checklist');
  assert.ok(!ending.includes('目标 → 口径 → 变量'));
  assert.ok(ending.includes('id="learning-check"'));
  assert.ok(ending.includes('小设计题'));
  for (let x = -3; x <= 3; x++) assert.equal(x*x - 2*x + 3, (x-1)**2 + 2);
});

test('Figure 2 plots all 24 source observations in both panels without jitter or invented values', () => {
  const html = read('index.html');
  const records = [];
  for (let year = 1; year <= 3; year++) {
    const table = html.match(new RegExp('<table id="source-year-' + year + '"[\\s\\S]*?</table>'));
    assert.ok(table);
    const tbody = table[0].match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
    const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(row =>
      [...row[1].matchAll(/<td>([\d.]+)<\/td>/g)].map(cell => Number(cell[1])));
    assert.equal(rows.length, 3);
    assert.ok(rows.every(row => row.length === 8));
    rows[0].forEach((score, i) => records.push({
      year, t: records.length + 1, score, max: year === 3 ? 150 : 100,
      d: rows[1][i], rate: score / (year === 3 ? 150 : 100)
    }));
  }
  const svg = html.match(/<svg id="observed-scatter-chart"[\s\S]*?<\/svg>/)[0];
  assert.match(svg, /viewBox="0 0 900 455"/);
  assert.match(svg, /id="scatter-by-year" transform="translate\(460 0\)"/);
  const marks = [...svg.matchAll(/<g data-exam="(\d+)" class="([^"]+)" transform="translate\(([-\d.]+) ([-\d.]+)\)"><title>([^<]+)<\/title>([\s\S]*?)<\/g>/g)];
  assert.equal(marks.length, 48);
  for (let panel = 0; panel < 2; panel++) {
    for (let i = 0; i < 24; i++) {
      const mark = marks[24 * panel + i];
      const r = records[i];
      assert.equal(Number(mark[1]), r.t);
      assert.equal(mark[2], panel === 0 ? 'chart-mean' : `chart-year-${r.year}`);
      assert.ok(Math.abs(Number(mark[3]) - (70 + (r.d - 0.1) / 0.35 * 330)) < 1e-6, `exam ${r.t} x`);
      assert.ok(Math.abs(Number(mark[4]) - (360 - (r.rate - 0.5) * 520)) < 1e-6, `exam ${r.t} y`);
      assert.equal(mark[5], `t=${r.t}; d=${r.d.toFixed(2)}; y=${r.rate.toFixed(6)} (${r.score}/${r.max})`);
      if (panel === 1) assert.match(mark[6], r.year === 1 ? /<circle/ : /<path/);
    }
  }
  // Two real exams coincide exactly. Preserve them rather than moving a point.
  assert.equal(marks[2][3], marks[11][3]);
  assert.equal(marks[2][4], marks[11][4]);
  for (let year = 1; year <= 3; year++) {
    const ds = records.filter(r => r.year === year).map(r => r.d);
    assert.deepEqual([Math.min(...ds), Math.max(...ds)], [[.18,.26],[.15,.34],[.15,.40]][year - 1]);
  }
  assert.equal(records.filter(r => r.d === .22).length, 4);
  assert.ok(!svg.includes('chart-fit'));
  assert.ok(!html.includes('同一组人为构造的点'));
});

test('all math scripts, styles and fonts are local and match pinned upstream files', () => {
  assert.equal(katex.version, '0.16.11');
  const manifest = JSON.parse(read('vendor/katex/checksums.json'));
  for (const [name, hash] of Object.entries(manifest.sha256)) {
    const bytes = fs.readFileSync(path.join(__dirname, 'vendor/katex', name));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash, name);
  }
  for (const match of read('vendor/katex/katex.min.css').matchAll(/url\(([^)]+)\)/g)) {
    assert.ok(match[1].startsWith('fonts/'));
    assert.ok(fs.existsSync(path.join(__dirname, 'vendor/katex', match[1])));
  }
  assert.match(read('index.html'), /src="vendor\/katex\/katex\.min\.js"/);
});

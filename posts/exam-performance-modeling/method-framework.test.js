'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const section = html.match(/<section id="readiness"[^>]*>[\s\S]*?<\/section>/)?.[0];

test('method chapter attributes a specific edition and reading location', () => {
  assert.ok(section);
  assert.match(section, /Garfunkel, S\., &amp; Montgomery, M\./);
  assert.match(section, /\(2016\)/);
  assert.match(section, /pp\. 12–13, Figure 1\.2/);
  assert.match(section, /href="https:\/\/www\.comap\.com\/images\/resources\/free_resources\/GAIMME_Report\.pdf"/);
  assert.match(section, /href="#method-source-gaimme"/);
});

test('six teaching-numbered components retain the source framework and separate examples', () => {
  const headings = [...section.matchAll(/<strong data-zh="([^"]+)" data-en="([^"]+)">/g)];
  assert.equal(headings.length, 6);
  const names = ['Identify the Problem', 'Make Assumptions and Identify Variables',
    'Do the Math', 'Analyze and Assess the Solution', 'Iterate', 'Implement the Model'];
  headings.forEach((heading, i) => {
    assert.ok(heading[2].startsWith(`${i + 1} · ${names[i]}`));
    assert.ok(heading[1].startsWith(`${i + 1} · `));
  });
  assert.equal((section.match(/class="flow-item modeling-process-node\b/g) || []).length, 6);
  assert.equal((section.match(/data-en="Method:/g) || []).length, 6);
  assert.equal((section.match(/data-en="(?:↩ )?Exam example:/g) || []).length, 6);
  assert.match(section, /components may occur in parallel or repeat as needed/);
  assert.match(section, /not numbers from the original GAIMME diagram/);
  assert.match(section, /not universal prescriptions stated verbatim/);
  assert.match(section, /not direct measurements of ability or mindset/);
});

test('solution chapters follow all six components and match navigation and card links', () => {
  const expected = [
    ['objectives', '1', '1'], ['variables', '2', '2.1'], ['exploration', '2', '2.2'],
    ['models', '3', '3.1'], ['coefficients', '3', '3.2'],
    ['validation', '4', '4'], ['iteration', '5', '5'],
    ['scenarios', '6', '6.1'], ['results', '6', '6.2']
  ];
  const cases = [...html.matchAll(/<section id="([^"]+)"[^>]*data-modeling-stage="([^"]+)" data-modeling-part="([^"]+)"/g)];
  assert.deepEqual(cases.map(match => match.slice(1)), expected);
  for (const [id, , part] of expected) {
    assert.ok(html.includes(`<a href="#${id}" data-zh="${part} · `));
    const content = html.match(new RegExp(`<section id="${id}"[^>]*>[\\s\\S]*?<\\/section>`))[0];
    assert.ok(content.includes(` / 求解 ${part} · `));
    assert.ok(content.includes(` / Solution ${part} · `));
  }
  const destinations = [...section.matchAll(/class="modeling-case-link" href="#([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(destinations, expected.map(([id]) => id));
  assert.doesNotMatch(html, /案例|Case [1-6]/);
  assert.equal((section.match(/class="modeling-case-links"/g) || []).length, 6);
  assert.doesNotMatch(section, /class="modeling-process-arrow/);
  const iteration = html.match(/<section id="iteration"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(iteration, /代理|反馈|Fₜ|λ|\b(?:proxy|proxies|feedback)\b/i);
  assert.ok(iteration.includes('href="#bounded-model"'));
  assert.ok(iteration.includes('id="matched-score-results"'));
  assert.ok(iteration.includes('retrospective comparisons after the outcomes were known'));
  const chapterNumbers = [...html.matchAll(/class="section-kicker" data-zh="(\d+) \//g)].map(match => Number(match[1]));
  assert.deepEqual(chapterNumbers, Array.from({ length: 14 }, (_, i) => i + 1));
});

test('model selection is an optional solution 3.1 extension after candidates and before derivation', () => {
  const models = html.match(/<section id="models"[^>]*>[\s\S]*?<\/section>/)[0];
  const start = models.indexOf('<article id="model-selection-guide"');
  const end = models.indexOf('<h3 id="baseline-to-equation"');
  assert.ok(start > models.indexOf('</table>') && end > start);
  assert.ok(!section.includes('id="model-selection-guide"'));
  assert.equal((html.match(/id="model-selection-guide"/g) || []).length, 1);
  const guide = models.slice(start, end);
  assert.ok(guide.includes('先明确用途和必须满足的条件'));
  assert.ok(guide.indexOf('先明确用途和必须满足的条件') < guide.indexOf('class="extension-card-slot"'));
  assert.ok(guide.includes('id="model-selection-details"'));
  assert.ok(guide.includes('对待估系数线性'));
  assert.ok(guide.includes('f(x)=a+bx+cx^2'));
  assert.ok(guide.includes('也不必强行选出赢家'));
  for (const target of ['#models', '#validation', '#matched-review']) assert.ok(guide.includes(`href="${target}"`));
  for (const part of ['selecting-predictors.html', 'tscv.html']) assert.ok(guide.includes(part));
  assert.equal((section.match(/href="#model-selection-guide"/g) || []).length, 2);
});

test('proxy construction belongs to the final extensions chapter, not the main solution sequence', () => {
  const ending = html.match(/<section id="checklist"[^>]*>[\s\S]*?<\/section>/)[0];
  const start = ending.indexOf('<article id="ability-mindset"');
  const end = ending.indexOf('<article id="learning-check"');
  assert.ok(start >= 0 && end > start);
  assert.ok(!html.includes('<section id="ability-mindset"'));
  const sectionIds = [...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(sectionIds[sectionIds.indexOf('models') + 1], 'coefficients');
  const proxy = ending.slice(start, end);
  const details = proxy.indexOf('id="proxy-model-extension"');
  assert.ok(details > 0);
  assert.ok(proxy.slice(0, details).includes('选读拓展'));
  assert.ok(proxy.slice(0, details).includes('href="#learning-check"'));
  assert.ok(proxy.includes('class="extension-card" data-extension-type="reading"'));
  assert.ok(proxy.includes('class="extension-detail"'));
  assert.ok(!proxy.includes('data-accordion'));
  assert.ok(proxy.indexOf('data-latex=') > details);
  assert.equal((proxy.match(/class="exam-prose"/g) || []).length, 7);
  assert.ok(proxy.includes('不是纯能力测量'));
  assert.ok(proxy.includes('id="feedback-validation"'));
  assert.ok(proxy.includes('id="matched-proxy-results"'));
  assert.ok(proxy.includes('retrospective checks, not fresh independent confirmation'));
});

test('parameter estimation follows chapter seven without requiring the end-of-article proxy extension', () => {
  const coefficients = html.match(/<section id="coefficients"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(coefficients, /直接承接|不依赖篇末|not a prerequisite/);
  assert.ok(coefficients.includes('data-latex="y_t=a+bt+cd_t+\\varepsilon_t"'));
  assert.doesNotMatch(coefficients, /href="#ability-mindset"|Kₜ|Fₜ|Bₜ|α|γ|λ|\\\\(?:alpha|gamma|lambda)/);
});

test('method cards use responsive row-major columns without reducing the text size', () => {
  const css = fs.readFileSync(path.join(__dirname, 'process-flow.css'), 'utf8');
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-auto-flow: row/);
  assert.match(css, /@media \(max-width: 1099px\)[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 699px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /font-size: 1rem/);
  assert.match(css, /:focus-visible/);
});

test('chapter translations and local citation/revision links remain complete', () => {
  for (const tag of section.matchAll(/<[^>]+data-zh="[^"]*"[^>]*>/g)) {
    assert.match(tag[0], /data-zh="[^"]+"/);
    assert.match(tag[0], /data-en="[^"]+"/);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  for (const link of section.matchAll(/href="#([^"]+)"/g)) {
    assert.equal(ids.filter(id => id === link[1]).length, 1, link[1]);
  }
  for (const target of ['process-data', 'process-assumptions', 'process-model']) {
    assert.ok(section.includes(`href="#${target}"`));
  }
});

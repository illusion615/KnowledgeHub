'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'concept-emphasis.css'), 'utf8');

test('definitions and key explanations are explicitly marked, not inferred at runtime', () => {
  assert.equal((html.match(/class="concept-definition"/g) || []).length, 23);
  assert.equal((html.match(/class="concept-explanation"/g) || []).length, 8);
  const knowledgeDefinitions = [...html.matchAll(/<p([^>]+)data-zh="是什么：/g)];
  assert.equal(knowledgeDefinitions.length, 11);
  for (const definition of knowledgeDefinitions) assert.ok(definition[1].includes('concept-definition'));
  for (const prefix of ['数学模型是', '信息泄漏是指', '统计中的「线性回归」', '怎样比较「预测得准不准」', '在数据范围之外继续套用公式']) {
    assert.ok(html.includes(`<p class="concept-definition" data-zh="${prefix}`));
  }
  const problem = html.match(/<section id="problem"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(problem, /concept-definition|concept-explanation/);
  const notes = [...html.matchAll(/<p class="concept-(?:definition|explanation)"[^>]*>/g)];
  for (const note of notes) assert.match(note[0], /data-en="[^"]+"/);
});

test('emphasis remains article-local, readable and distinct from an attributed quote', () => {
  assert.equal((html.match(/href="concept-emphasis.css"/g) || []).length, 1);
  assert.match(css, /main p\.concept-definition/);
  assert.match(css, /main p\.concept-explanation/);
  assert.match(css, /border-inline-start: 3px solid/);
  assert.match(css, /color: var\(--ink\)/);
  assert.match(css, /font-size: 1rem/);
  assert.match(css, /font-weight: 400/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.doesNotMatch(html, /<blockquote[^>]+concept-/);
});

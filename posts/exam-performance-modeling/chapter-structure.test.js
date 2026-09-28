'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const section = id => html.match(new RegExp('<section id="' + id + '"[^>]*>[\\s\\S]*?<\\/section>'))[0];

test('general methodology and the problem overview form consecutive, distinct chapters', () => {
  const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['problem', 'readiness', 'modeling-overview', 'math-toolkit', 'objectives', 'variables', 'exploration', 'models', 'coefficients', 'validation', 'iteration', 'scenarios', 'results', 'checklist', 'references']);
  const labels = [...html.matchAll(/class="section-kicker" data-zh="(\d+) [^"]*" data-en="(\d+) /g)];
  assert.deepEqual(labels.map(m => +m[1]), Array.from({ length: 15 }, (_, i) => i + 1));
  assert.deepEqual(labels.map(m => +m[2]), labels.map(m => +m[1]));
  assert.match(html, /href="#modeling-overview" data-zh="流程摘要" data-en="Process Overview"/);
});

test('chapter two contains only the general method and its source', () => {
  const method = section('readiness');
  assert.match(method, /GAIMME/);
  assert.equal((method.match(/class="flow-item modeling-process-node/g) || []).length, 6);
  assert.doesNotMatch(method, /本题例|Exam example|得分率|132\.64|24次|model-evolution|model-walkthrough|data-latex/);
  for (const id of ['process-problem', 'process-assumptions', 'process-model', 'process-data', 'method-source-gaimme']) assert.ok(method.includes('id="' + id + '"'));
});

test('chapter three retains the interactive summary, candidate template and all solution links', () => {
  const overview = section('modeling-overview');
  for (const id of ['candidate-model-template', 'model-evolution', 'model-walkthrough', 'candidate-model-slot']) {
    assert.ok(overview.includes('id="' + id + '"'));
    assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1);
  }
  assert.equal((overview.match(/data-walk-stage=/g) || []).length, 6);
  assert.deepEqual([...overview.matchAll(/class="modeling-case-link" href="#([^"]+)"/g)].map(m => m[1]), ['objectives', 'variables', 'exploration', 'models', 'coefficients', 'validation', 'iteration', 'scenarios', 'results']);
  assert.match(overview, /href="#model-selection-guide"/); assert.match(overview, /href="#ability-mindset"/);
  assert.doesNotMatch(overview, /class="modeling-process"/);
});

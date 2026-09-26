'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const expected = [
  ['threshold-probability-extension', 'reading'], ['model-selection-details', 'reading'],
  ['loss-metrics-extension', 'reading'], ['coefficient-derivation-extension', 'derivation'],
  ['bounded-estimation-extension', 'audit'], ['quadratic-maximum-extension', 'derivation'],
  ['coefficient-numbers-extension', 'audit'], ['ability-mindset-methods-extension', 'reading'], ['calculation-records-extension', 'audit'],
  ['transfer-scenario-extension', 'reading'], ['proxy-model-extension', 'reading'], ['learning-answers-extension', 'answer']
];

test('all twelve optional regions have book-style entry cards and addressable full details', () => {
  const cards = [...html.matchAll(/<article id="([^"]+)" class="extension-card" data-extension-type="([^"]+)"/g)];
  assert.deepEqual(cards.map(match => match.slice(1)), expected);
  assert.doesNotMatch(html, /class="subsection-(?:accordion|item|toggle|content)"|data-accordion/);
  for (const [id] of expected) {
    assert.equal((html.match(new RegExp(`id="${id}-content"`, 'g')) || []).length, 1);
    assert.ok(html.includes(`class="extension-card-trigger" href="#${id}-content"`));
    assert.ok(html.includes(`id="${id}-content" class="extension-detail"`));
  }
  for (const name of ['extension-kind', 'extension-title', 'extension-summary', 'extension-action']) {
    const spans = [...html.matchAll(new RegExp(`<span class="${name}" data-zh="[^"]+" data-en="[^"]+">`, 'g'))];
    assert.equal(spans.length, 12, name);
  }
  assert.ok(html.includes('data-extension-alias="model-selection-guide"'));
  assert.ok(html.includes('data-extension-alias="ability-mindset"'));
});

test('shared local dialog keeps full source nodes and dynamic registration rather than fixed counts', () => {
  const js = fs.readFileSync(path.join(__dirname, 'knowledge-dialog.js'), 'utf8');
  assert.match(js, /main\.querySelectorAll\('\.extension-card'\)/);
  assert.match(js, /knowledgeLinks\.length \+ extensionCards\.length/);
  assert.doesNotMatch(js, /entries\.length !== 11|cloneNode|innerHTML/);
  assert.match(js, /content\.appendChild\(entry\.article\)/);
  assert.match(js, /active\.marker\.after\(active\.article\)/);
  assert.match(js, /returnPosition/);
  assert.match(js, /addEventListener\('langChanged', syncTitle\)/);
  assert.equal((html.match(/<dialog /g) || []).length, 1);
  assert.doesNotMatch(html, /class="extension-detail" hidden/);
});

test('optional material does not move main results or self-check questions into a detail panel', () => {
  const results = html.match(/<section id="results"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.ok(results.includes('id="bounded-scenario-results"'));
  const learning = html.slice(html.indexOf('<article id="learning-check"'));
  assert.ok(learning.indexOf('<ol>') < learning.indexOf('id="learning-answers-extension"'));
  const css = fs.readFileSync(path.join(__dirname, 'extension-cards.css'), 'utf8');
  assert.match(css, /grid-template-columns: auto minmax\(0, 1fr\) auto/);
  assert.match(css, /\.extension-detail\[hidden\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /font-size: 1rem/);
  assert.match(css, /@media \(max-width: 699px\)/);
});

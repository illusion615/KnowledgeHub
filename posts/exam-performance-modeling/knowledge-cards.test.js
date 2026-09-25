'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const overview = html.match(/<article id="toolkit-essential"[^>]*>[\s\S]*?<\/article>/)[0];
const cards = [...overview.matchAll(/<li class="knowledge-card" data-knowledge-type="([^"]+)">([\s\S]*?)<\/li>/g)];

test('overview keeps seven essential and four extension topics with labeled types', () => {
  assert.equal(cards.length, 11);
  assert.equal(cards.filter(card => card[1] === 'essential').length, 7);
  assert.equal(cards.filter(card => card[1] === 'extension').length, 4);
  for (const [, type, body] of cards) {
    assert.ok(body.includes(`data-zh="${type === 'essential' ? '必备知识' : '扩展知识'}"`));
    assert.match(body, /class="knowledge-type"/);
    assert.match(body, /<p data-zh="[^"]+" data-en="[^"]+">/);
    for (const tag of body.matchAll(/<[^>]+data-zh="[^"]*"[^>]*>/g)) {
      assert.match(tag[0], /data-en="[^"]+"/);
    }
  }
});

test('every overview card links to its own existing explanation exactly once', () => {
  const targets = cards.map(card => card[2].match(/href="#([^"]+)"/)[1]);
  assert.deepEqual(targets, ['toolkit-rates', 'toolkit-means', 'toolkit-functions',
    'toolkit-symbols', 'toolkit-slopes', 'toolkit-errors', 'toolkit-testing',
    'toolkit-algebra', 'toolkit-quadratics', 'toolkit-probability', 'toolkit-proxies']);
  for (const id of targets) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  }
  assert.equal((overview.match(/class="knowledge-cards"/g) || []).length, 2);
  assert.doesNotMatch(overview, /<details|data-accordion/);
});

test('dialog enhancement retains original details, aliases, and a no-script fallback', () => {
  assert.equal((html.match(/id="knowledge-dialog"/g) || []).length, 1);
  assert.match(html, /<dialog[^>]+aria-modal="true"/);
  assert.match(html, /<script src="knowledge-dialog.js\?v=icon-close-1"><\/script>/);
  assert.match(overview, /<noscript>/);
  assert.doesNotMatch(html, /class="exam-prose" hidden/);
  const source = fs.readFileSync(path.join(__dirname, 'knowledge-dialog.js'), 'utf8');
  assert.match(source, /typeof dialog.showModal !== 'function'/);
  assert.match(source, /content.appendChild\(entry.article\)/);
  assert.doesNotMatch(source, /cloneNode|innerHTML/);
  assert.match(source, /addEventListener\('cancel'/);
  assert.match(source, /addEventListener\('hashchange'/);
  assert.match(source, /addEventListener\('popstate'/);
  assert.match(source, /event.key !== 'Tab'/);
});

test('local styles provide responsive columns, distinct palettes and keyboard focus', () => {
  const css = fs.readFileSync(path.join(__dirname, 'knowledge-cards.css'), 'utf8');
  assert.equal((html.match(/href="knowledge-cards.css\?v=icon-close-1"/g) || []).length, 1);
  assert.match(css, /repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 699px\)/);
  assert.match(css, /\[data-theme="dark"\]/);
  const backgrounds = [...css.matchAll(/--knowledge-bg: (#[\da-f]+);/g)].map(match => match[1]);
  assert.equal(new Set(backgrounds).size, 4);
  assert.match(css, /:focus-visible/);
  assert.match(css, /font-size: 1rem/);
});

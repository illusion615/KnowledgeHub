'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, 'chart-typography.js'), 'utf8');

function setup(matrices, hasObserver = true) {
  const events = {};
  const writes = [];
  const charts = matrices.map(matrix => ({
    matrix,
    getScreenCTM() { return this.matrix; },
    style: { setProperty(name, value) { writes.push({ name, value }); } }
  }));
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = []; observer = this; }
    observe(target) { this.targets.push(target); }
  }
  vm.runInNewContext(source, {
    document: { querySelectorAll(selector) {
      assert.equal(selector, '.exam-figure svg');
      return charts;
    } },
    window: { addEventListener(name, callback) { events[name] = callback; } },
    ResizeObserver: hasObserver ? Observer : undefined
  });
  return { charts, writes, events, get observer() { return observer; } };
}

test('compensates both desktop magnification and narrow-screen reduction', () => {
  const scales = [1200 / 760, 1200 / 900, 932 / 760, 932 / 900, 680 / 760, 860 / 900];
  const env = setup(scales.map(d => ({ c: 0, d })));
  assert.equal(env.writes.length, scales.length);
  env.writes.forEach(({ name, value }, i) => {
    assert.equal(name, '--exam-chart-scale');
    assert.ok(Math.abs((16 / Number(value)) * scales[i] - 16) < 1e-9);
  });
  assert.equal(env.observer.targets.length, scales.length);
});

test('container observation updates only changed scales, without recursive writes', () => {
  const env = setup([{ c: 0, d: 1.5 }]);
  const svg = env.charts[0];
  env.observer.callback([{ target: svg }]);
  assert.equal(env.writes.length, 1);
  svg.matrix = { c: 0, d: 0.9 };
  env.observer.callback([{ target: svg }]);
  assert.equal(Number(env.writes.at(-1).value), 0.9);
  env.observer.callback([{ target: svg }]);
  assert.equal(env.writes.length, 2);
});

test('uses the full vertical CTM vector and ignores unavailable or invalid matrices', () => {
  const env = setup([{ c: 0.9, d: 1.2 }, null, { c: 0, d: 0 }, { c: 0, d: Infinity }]);
  assert.equal(env.writes.length, 1);
  assert.equal(Number(env.writes[0].value), 1.5);
  env.charts[1].matrix = { c: 0, d: 2 };
  env.events.resize();
  assert.equal(env.writes.length, 2);
  assert.equal(Number(env.writes[1].value), 2);
});

test('viewport resizing works without ResizeObserver and empty articles are a no-op', () => {
  const env = setup([{ c: 0, d: 1 }], false);
  env.charts[0].matrix = { c: 0, d: 1.2 };
  env.events.resize();
  assert.equal(Number(env.writes.at(-1).value), 1.2);
  const empty = setup([]);
  assert.equal(empty.writes.length, 0);
  assert.equal(empty.observer, undefined);
  assert.equal(empty.events.resize, undefined);
});

test('article keeps responsive dimensions and uses rem for all SVG text', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /\.exam-figure svg text \{[^}]*font-size: calc\(1rem \/ var\(--exam-chart-scale, 1\)\)/);
  assert.match(html, /\.exam-figure svg \{[^}]*width: 100%; min-width: 680px; height: auto/);
  assert.match(html, /#observed-scatter-chart \{ min-width: 860px; \}/);
  assert.match(html, /\.exam-figure svg \.chart-label \{ fill: var\(--muted\); \}/);
  assert.equal((html.match(/<script src="chart-typography\.js"><\/script>/g) || []).length, 1);
});

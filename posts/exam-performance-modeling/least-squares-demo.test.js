'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const demo = require('./least-squares-demo.js');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('interactive errors and squares reproduce the original 80/78 example', () => {
  assert.deepEqual(demo.calculate(78), { c: 78, errors: [2, 0], squares: [4, 0], total: 4 });
  assert.deepEqual(demo.calculate(79), { c: 79, errors: [1, -1], squares: [1, 1], total: 2 });
  assert.deepEqual(demo.calculate(80), { c: 80, errors: [0, -2], squares: [0, 4], total: 4 });
  for (let i = 0; i <= 60; i++) {
    const c = 76 + i / 10, result = demo.calculate(c);
    assert.ok(Math.abs(result.total - (2 * (c - 79) ** 2 + 2)) < 1e-10);
    assert.ok(result.total >= 2);
  }
  assert.throws(() => demo.calculate(NaN));
  assert.throws(() => demo.calculate(Infinity));
});

test('the graph is attached to parameter estimation with explicit example and unit boundaries', () => {
  const chapter = html.match(/<section id="coefficients"[^>]*>[\s\S]*?<\/section>/)[0];
  const graph = chapter.match(/<figure id="least-squares-demo"[\s\S]*?<\/figure>/)[0];
  assert.ok(chapter.indexOf('J(C)=(80-C)^2+(78-C)^2') < chapter.indexOf('id="least-squares-demo"'));
  assert.ok(chapter.indexOf('id="least-squares-demo"') < chapter.indexOf('data-latex="J(C)=2(C-79)^2+2'));
  assert.match(graph, /只使用高一前两次的80分和78分/);
  assert.match(graph, /不是24条记录的完整回归/);
  assert.match(graph, /单位分别为分与分²/);
  assert.match(graph, /min="76" max="82" step="0.1" value="78"/);
  assert.match(graph, /<noscript>/);
  assert.equal((graph.match(/data-ls-c="/g) || []).length, 3);
  assert.match(html, /图 4｜每次只用左边的过去/);
  assert.match(html, /图 5｜模型如何演进/);
  assert.match(html, /图 6｜拟合模型给出的优势曲线/);
});

test('score and squared-loss axes map their different units independently', () => {
  assert.equal(demo.scoreY(76), 430);
  assert.equal(demo.scoreY(82), 130);
  assert.equal(demo.lossX(76), 580);
  assert.equal(demo.lossX(82), 940);
  assert.equal(demo.lossY(0), 430);
  assert.equal(demo.lossY(22), 130);
  const source = fs.readFileSync(path.join(__dirname, 'least-squares-demo.js'), 'utf8');
  assert.doesNotMatch(source, /fetch\(|innerHTML|eval\(|localStorage/);
});

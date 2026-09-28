'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const walk = require('./model-walkthrough.js');
const shared = require('./model-evolution.js');
const original = require('./model-results.json');
const training = require('./model-walkthrough-results.json');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
function recordsFromSource() {
  return shared.readRecords({ querySelectorAll(selector) {
    const year = selector.match(/source-year-(\d)/)[1];
    const table = html.slice(html.indexOf('id="source-year-' + year + '"')).split('</table>')[0];
    const body = table.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)[1];
    return [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(row => ({ querySelectorAll() {
      return [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(cell => ({ textContent: cell[1] }));
    } }));
  } });
}
const estimates = stage => walk.estimates(stage, recordsFromSource(), original, shared, training);
const paths = (stage, difficulty = .2, exam) => walk.paths(stage, recordsFromSource(), original, shared, training, difficulty, exam);
test('24 immutable observations and the preserved training export share their original source', () => {
  const records = recordsFromSource();
  assert.equal(records.length, 24); assert.ok(Object.isFrozen(records) && records.every(Object.isFrozen));
  records.forEach((r, i) => { assert.equal(r.t, i + 1); assert.equal(r.maximum, i < 16 ? 100 : 150); assert.equal(r.rate, r.score / r.maximum); });
  assert.equal(training.source_sha256, original.source_sha256);
  assert.deepEqual(training.training_range, [1, 20]);
  original.targets.y.candidates.linear.final_test.observations.forEach(p => assert.equal(p.actual_rate, records[p.t - 1].rate));
});
test('steps three through six share the difficulty/rate coordinate system exactly', () => {
  const records = recordsFromSource();
  for (let stage = 2; stage < 6; stage++) records.forEach(r => {
    assert.equal(walk.x(r.difficulty, stage), shared.x(r.difficulty));
    assert.equal(walk.y(r.rate, stage), shared.y(r.rate));
  });
  assert.equal(walk.x(1, 0), 80); assert.equal(walk.x(25, 0), 940);
});
test('training and holdout inspection retain the original first-20 coefficients and saved estimates', () => {
  assert.equal(estimates(2).length, 20); assert.deepEqual(estimates(2), estimates(3));
  assert.deepEqual(estimates(4).slice(0, 20), estimates(2));
  assert.deepEqual(estimates(4).slice(20).map(p => p.predicted_rate), original.targets.y.candidates.linear.final_test.observations.map(p => p.predicted_rate));
  assert.equal(paths(2)[0].d, paths(3, .2, 20)[0].d);
  assert.notEqual(paths(3, .2, 20)[0].d, paths(4, .2, 21)[0].d);
  const b = training.coefficients;
  estimates(4).forEach(p => {
    const r = recordsFromSource()[p.t - 1];
    assert.ok(Math.abs(p.predicted_rate - (b.intercept + b.time * r.t + b.difficulty * r.difficulty)) < 1e-12);
  });
});
test('exam-25 uses all-24 coefficients; difficulty moves the target along an unchanged curve', () => {
  assert.equal(estimates(5).length, 24);
  assert.notEqual(estimates(5)[0].predicted_rate, estimates(2)[0].predicted_rate);
  assert.equal(paths(5).length, 2);
  assert.equal(paths(5, .1)[0].d, paths(5, .2)[0].d);
  assert.equal(paths(5, .1)[1].d, paths(5, .2)[1].d);
  assert.equal((shared.linearAt(25, .2, original) * 150).toFixed(2), '132.64');
  assert.equal((shared.linearAt(25, .1, original) * 150).toFixed(2), '151.19');
  const a = walk.inspection({ stage: 5, difficulty: .1 }, recordsFromSource(), original, training);
  const b = walk.inspection({ stage: 5, difficulty: .2 }, recordsFromSource(), original, training);
  assert.equal(a.t, 25); assert.equal(a.cutoff, 24); assert.equal(a.observed, null);
  assert.notEqual(a.predicted_rate, b.predicted_rate);
  assert.ok(paths(5)[1].d.endsWith('L' + shared.x(.4) + ' ' + shared.y(shared.linearAt(25, .4, original))));
});
test('every training/holdout residual uses the selected exam stage and its actual difficulty', () => {
  const records = recordsFromSource(), before = JSON.stringify([records, original, training]);
  for (let t = 1; t <= 24; t++) {
    const stage = t <= 20 ? 3 : 4;
    const p = walk.inspection({ stage, trainingExam: t, holdoutExam: t }, records, original, training);
    assert.equal(p.t, t); assert.equal(p.cutoff, 20);
    assert.equal(p.difficulty, records[t - 1].difficulty); assert.equal(p.observed, records[t - 1]);
    const b = p.coefficients, expected = b.intercept + b.time * t + b.difficulty * p.difficulty;
    assert.ok(Math.abs(p.predicted_rate - expected) < 1e-12);
    assert.equal(p.predicted_rate, t <= 20 ? training.fitted[t - 1].predicted_rate : original.targets.y.candidates.linear.final_test.observations[t - 21].predicted_rate);
    const pathsAtT = paths(stage, .2, t);
    assert.equal(pathsAtT.length, 2); assert.ok(pathsAtT.every(q => q.t === t));
    const xy = [...pathsAtT[0].d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)][0];
    assert.ok(Math.abs(+xy[2] - shared.y(b.intercept + b.time * t + b.difficulty * .1)) < 1e-9);
  }
  assert.equal(JSON.stringify([records, original, training]), before);
});

test('navigation remains manual, has no reset or progress counter and retains scenarios', () => {
  const p = walk.createNavigator(() => {}); p.go(3); assert.equal(p.state().stage, 0);
  p.setReady(true); p.next(); assert.equal(p.state().stage, 1);
  for (let i = 0; i < 60; i++) p.go(i % 6);
  assert.equal(p.state().stage, 5); p.next(); assert.equal(p.state().stage, 5);
  p.previous(); assert.equal(p.state().stage, 4);
  p.go(-1); p.go(6); p.go(1.5); assert.equal(p.state().stage, 4);
  p.inspect(24); assert.equal(p.state().holdoutExam, 24);
  p.inspect(20); assert.equal(p.state().holdoutExam, 24);
  p.go(3); p.inspect(1); assert.equal(p.state().trainingExam, 1);
  p.inspect(21); assert.equal(p.state().trainingExam, 1);
  p.go(4); assert.equal(p.state().holdoutExam, 24);
  p.scenario(.1); p.go(0); assert.equal(p.state().difficulty, .1);
  p.previous(); assert.equal(p.state().stage, 0);
  assert.equal(p.play, undefined); assert.equal(p.reset, undefined);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, 'model-walkthrough.js'), 'utf8'), /setTimeout|setInterval|requestAnimationFrame/);
});
test('numerical tables distinguish first-20 coefficients and training errors from the all-24 application', () => {
  const data = Array.from({ length: 6 }, (_, stage) => walk.evidence(stage, recordsFromSource(), original, shared, training));
  assert.equal(data[0].rows.length, 3); assert.equal(data[1].rows[1][3][0], '0.8667');
  assert.deepEqual(data[2].rows.map(row => row[1][0]), ['1.070835476', '0.001756078', '-1.272539739']);
  assert.deepEqual(data[3].rows[0].map(pair => pair[0]), ['1', '80', '75.45', '4.55']);
  assert.deepEqual(data[3].rows.map(row => row[0][0]), Array.from({ length: 20 }, (_, i) => String(i + 1)));
  assert.deepEqual(data[4].rows.map(row => row[2][0]), ['108.89', '114.88', '128.51', '138.32']);
  assert.deepEqual(data[5].rows.map(row => row[2][0]), ['9.82', '17.19', '13.51']);
});
test('explicit static and dynamic caption LaTeX compiles, while ordinary numeric cells remain text', () => {
  const katex = require('./vendor/katex/katex.min.js');
  const source = html.match(/<figure id="model-walkthrough"[\s\S]*?<\/figure>/)[0];
  const captions = Array.from({ length: 6 }, (_, stage) => walk.evidence(stage, recordsFromSource(), original, shared, training).caption).flat();
  const formulas = [...walk.mathParts(source), ...captions.flatMap(walk.mathParts)].filter(p => p.latex);
  assert.ok(formulas.length > 30);
  for (const p of formulas) assert.match(katex.renderToString(p.latex, { throwOnError: true, strict: 'error' }), /katex-mathml/);
  assert.deepEqual(walk.mathParts('108.89'), [{ text: '108.89' }]);
  assert.doesNotMatch(source, /Auto-Advance|自动逐步|data-walk-action="(?:play|reset)"|data-walk-progress|t=12\.5/);
});
test('fallback, process navigation, full-data refit boundary and detailed model links remain', () => {
  const part = html.match(/<figure id="model-walkthrough"[\s\S]*?<\/figure>/)[0];
  assert.equal((part.match(/data-walk-stage=/g) || []).length, 6);
  assert.equal((part.split('class="walk-fallback"')[1].match(/<li\b/g) || []).length, 6);
  for (const anchor of ['problem', 'variables', 'coefficients', 'validation', 'candidate-model-details']) assert.ok(part.includes('href="#' + anchor + '"'));
  assert.match(part, /用全部24次重新估计参数/); assert.match(part, /第25次仅有预测值/);
  assert.match(part, /<select id="walk-exam"/);
  assert.match(html, /各环节可并行或反复进行/);
  assert.match(fs.readFileSync(path.join(__dirname, 'model-walkthrough.css'), 'utf8'), /walk-fallback\[hidden\].*display: block/);
});
module.exports = { recordsFromSource };

'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var core = require('../posts/jev-system-one-research/playground-core.js');
var defaults = { confidence: 0.85, sufficiency: 0.9, severity: 1.4 };
function fixture() { return core.fixtures()[0].response; }
function reject(mutator, code) {
  var response = fixture();
  mutator(response);
  assert.throws(function () { core.validateResponse(response); }, new RegExp(code));
}

test('request uses the documented endpoint payload and three typed criteria', function () {
  var request = core.buildRequest('A payment was charged twice.');
  assert.equal(request.model, 'jev-1.13.0');
  assert.deepEqual(Object.keys(request.questions), ['team', 'enough_info', 'severity']);
  assert.deepEqual(Object.keys(request.questions.team.criteria), core.teams);
  assert.deepEqual(request.questions.severity.criteria, core.levels);
  assert.equal(request.questions.enough_info.type, 'noul');
  assert.equal(request.state.request, 'A payment was charged twice.');
  assert.ok(!JSON.stringify(request).includes('options'));
});
test('request rejects empty, non-string and excessive input', function () {
  ['', '  ', null, {}, 'x'.repeat(core.maxState + 1)].forEach(function (v) { assert.throws(function () { core.buildRequest(v); }, /state/); });
  assert.equal(core.buildRequest('x'.repeat(core.maxState)).state.request.length, core.maxState);
});
test('every authored fixture validates and round-trips', function () {
  core.fixtures().forEach(function (f) {
    assert.deepEqual(core.parseResponse(JSON.stringify(f.response)), core.validateResponse(f.response));
    assert.ok(core.policy(f.response, defaults));
  });
});
test('returned fixtures and requests are isolated copies', function () {
  var f = core.fixtures(); f[0].response.answers.team.choice = 'other';
  assert.equal(core.fixtures()[0].response.answers.team.choice, 'technical');
  var r = core.buildRequest('test'); r.questions.severity.criteria[0] = 'changed';
  assert.equal(core.buildRequest('test').questions.severity.criteria[0], 'Low impact');
});
test('baseline synthetic metrics have explicit denominators', function () {
  assert.deepEqual(core.aggregate(core.fixtures(), defaults), { total: 8, accepted: 4, reviewed: 4, errors: 1, coverage: 0.5, errorRate: 0.25 });
});
test('a higher confidence gate trades coverage for review in this dataset', function () {
  assert.deepEqual(core.aggregate(core.fixtures(), { confidence: 0.95, sufficiency: 0.9, severity: 1.4 }), { total: 8, accepted: 1, reviewed: 7, errors: 0, coverage: 0.125, errorRate: 0 });
});
test('no automated suggestions means error rate is unknown, not zero', function () {
  var stats = core.aggregate(core.fixtures(), { confidence: 1, sufficiency: 1, severity: 2 });
  assert.equal(stats.accepted, 0); assert.equal(stats.reviewed, 8); assert.equal(stats.errorRate, null);
});
test('higher confidence is not guaranteed to reduce the conditional error rate', function () {
  var relaxed = core.aggregate(core.fixtures(), { confidence: 0.7, sufficiency: 0.9, severity: 1.4 });
  assert.ok(relaxed.errorRate < core.aggregate(core.fixtures(), defaults).errorRate);
});
test('confident wrong fixture still produces a wrong valid suggestion', function () {
  var row = core.fixtures().filter(function (f) { return f.id === 'confident-error'; })[0];
  assert.equal(core.policy(row.response, defaults).action, 'suggest_billing');
  assert.equal(row.gold, 'technical');
});
test('other is always reviewed even with zero thresholds', function () {
  var row = core.fixtures().filter(function (f) { return f.id === 'out-of-scope'; })[0];
  assert.equal(core.policy(row.response, { confidence: 0, sufficiency: 0, severity: 0 }).action, 'review');
});
test('sufficiency is separate from Choice confidence', function () {
  var row = core.fixtures().filter(function (f) { return f.id === 'low-info'; })[0];
  assert.deepEqual(core.policy(row.response, defaults).reasons, ['sufficiency']);
});
test('severity only changes priority, never grants or blocks authorization', function () {
  var r = fixture();
  var low = core.policy(r, { confidence: 0.85, sufficiency: 0.9, severity: 0 });
  var high = core.policy(r, { confidence: 0.85, sufficiency: 0.9, severity: 2 });
  assert.equal(low.action, high.action); assert.equal(low.priority, 'high'); assert.equal(high.priority, 'normal');
});
test('threshold equality passes and invalid thresholds fail closed', function () {
  var r = fixture();
  assert.equal(core.policy(r, { confidence: 0.92, sufficiency: 0.98, severity: 1.8 }).action, 'suggest_technical');
  [NaN, Infinity, -1, 1.1, '0.8'].forEach(function (v) { assert.throws(function () { core.policy(r, { confidence: v, sufficiency: 0.9, severity: 1.4 }); }, /threshold/); });
});
test('invalid JSON and excessive response size are rejected', function () {
  assert.throws(function () { core.parseResponse('{'); }, /json/);
  assert.throws(function () { core.parseResponse('x'.repeat(core.maxJSON + 1)); }, /size/);
  assert.throws(function () { core.parseResponse('null'); }, /shape/);
});
test('missing required question IDs fail', function () { reject(function (r) { delete r.answers.severity; }, 'shape'); });
test('wrong types and unknown choices fail', function () {
  reject(function (r) { r.answers.team.type = 'score'; }, 'choice');
  reject(function (r) { r.answers.team.choice = 'admin'; }, 'choice');
  reject(function (r) { r.answers.enough_info.noul = '0.9'; }, 'noul');
});
test('finite bounded probabilities with exact keys are required', function () {
  [-0.1, 1.1, NaN, Infinity, '0.5'].forEach(function (v) { reject(function (r) { r.answers.team.probabilities.billing = v; }, 'distribution'); });
  reject(function (r) { r.answers.team.probabilities.extra = 0; }, 'distribution');
  reject(function (r) { delete r.answers.team.probabilities.other; }, 'distribution');
});
test('distributions are rejected rather than normalized', function () { reject(function (r) { r.answers.team.probabilities.billing = 0.5; }, 'sum'); });
test('Choice must identify a maximum-probability option', function () { reject(function (r) { r.answers.team.choice = 'billing'; }, 'winner'); });
test('Score requires the matching rubric and weighted expectation', function () {
  reject(function (r) { r.answers.severity.legend['0'] = 'Critical'; }, 'legend');
  reject(function (r) { r.answers.severity.score = 0; }, 'expectation');
  reject(function (r) { r.answers.severity.score = 3; }, 'score');
});
test('usage is optional, but provided token counts must be valid', function () {
  var r = fixture(); assert.ok(!Object.hasOwn(core.validateResponse(r), 'usage'));
  r.usage = { input_tokens: 100, output_tokens: 40 }; assert.equal(core.validateResponse(r).usage.input_tokens, 100);
  [-1, 0.1, '100', Infinity, NaN].forEach(function (v) { r.usage.input_tokens = v; assert.throws(function () { core.validateResponse(r); }, /usage/); });
});
test('unknown imported keys are not merged, including prototype keys', function () {
  var r = fixture(); var serialized = JSON.stringify(r);
  serialized = serialized.replace('"answers":', '"__proto__":{"polluted":true},"answers":');
  var clean = core.parseResponse(serialized);
  assert.equal({}.polluted, undefined); assert.ok(!Object.hasOwn(clean, '__proto__'));
});
test('aggregation requires labels and a nonempty set', function () {
  assert.throws(function () { core.aggregate([], defaults); }, /dataset/);
  assert.throws(function () { core.aggregate([{ response: fixture() }], defaults); }, /label/);
});
test('browser uses only the same-origin backend, with no keys, persistence, or HTML injection', function () {
  ['playground-core.js', 'playground.js'].forEach(function (name) {
    var source = fs.readFileSync(path.join(__dirname, '../posts/jev-system-one-research', name), 'utf8');
    if (name === 'playground-core.js') assert.ok(!/\bfetch\s*\(/.test(source));
    else assert.deepEqual(Array.from(source.matchAll(/fetch\('([^']+)'/g), function (m) { return m[1]; }), ['/api/jev/status', '/api/jev/check', '/api/jev/evaluate']);
    assert.ok(!/\b(XMLHttpRequest|WebSocket|eval)\s*\(/.test(source));
    assert.ok(!/\b(localStorage|sessionStorage)\b|\.innerHTML\s*=|insertAdjacentHTML/.test(source));
    assert.ok(!/Authorization\s*:|=>/.test(source));
  });
});

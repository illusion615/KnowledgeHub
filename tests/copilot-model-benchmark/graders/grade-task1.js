'use strict';

var assert = require('node:assert/strict');
var path = require('path');
var testFile = process.argv[2];
var merge;
var tests = [];

if (!testFile) throw new Error('Usage: grade-task1.js <task1.js>');
merge = require(path.resolve(testFile));

function check(name, fn) { tests.push({ name: name, fn: fn }); }
function ownProtoObject(value) {
  var result = Object.create(null);
  Object.keys(value).forEach(function (key) {
    Object.defineProperty(result, key, { value: value[key], enumerable: true, writable: true, configurable: true });
  });
  return result;
}

check('arrays concatenate', function () { assert.deepEqual(merge([1, 2], [3]), [1, 2, 3]); });
check('source primitive wins', function () { assert.deepEqual(merge({ a: 1 }, { a: 2 }), { a: 2 }); });
check('objects merge recursively', function () { assert.deepEqual(merge({ a: { b: 1 } }, { a: { c: 2 } }), { a: { b: 1, c: 2 } }); });
check('null replaces', function () { assert.equal(merge({ a: 1 }, null), null); });
check('undefined replaces and preserves key', function () { var result = merge({ a: 1 }, { a: undefined }); assert.equal(Object.prototype.hasOwnProperty.call(result, 'a'), true); assert.equal(result.a, undefined); });
check('Date replaces and clones', function () { var source = new Date(1234); var result = merge(new Date(0), source); assert.equal(result.getTime(), 1234); assert.notEqual(result, source); });
check('inputs do not mutate', function () { var target = { a: { b: 1 } }; var source = { a: { c: 2 } }; merge(target, source); assert.deepEqual(target, { a: { b: 1 } }); assert.deepEqual(source, { a: { c: 2 } }); });
check('target-only branches are cloned', function () { var target = { a: { b: 1 } }; var result = merge(target, {}); result.a.b = 9; assert.equal(target.a.b, 1); });
check('source-only branches are cloned', function () { var source = { a: { b: 1 } }; var result = merge({}, source); result.a.b = 9; assert.equal(source.a.b, 1); });
check('array members are cloned', function () { var target = [{ a: 1 }]; var source = [{ b: 2 }]; var result = merge(target, source); result[0].a = 9; result[1].b = 9; assert.equal(target[0].a, 1); assert.equal(source[0].b, 2); });
check('null prototype is preserved', function () { var target = ownProtoObject({ a: 1 }); var source = ownProtoObject({ b: 2 }); var result = merge(target, source); assert.equal(Object.getPrototypeOf(result), null); assert.equal(result.a, 1); assert.equal(result.b, 2); });
check('__proto__ remains data', function () { var source = {}; Object.defineProperty(source, '__proto__', { value: { polluted: true }, enumerable: true }); var result = merge({}, source); assert.equal({}.polluted, undefined); assert.equal(Object.prototype.hasOwnProperty.call(result, '__proto__'), true); assert.equal(result.__proto__.polluted, true); });

var passed = 0;
var failures = [];
tests.forEach(function (entry) {
  try { entry.fn(); passed += 1; }
  catch (error) { failures.push({ name: entry.name, error: error.message }); }
});
console.log(JSON.stringify({ passed: passed, total: tests.length, failures: failures }, null, 2));
if (failures.length) process.exitCode = 1;
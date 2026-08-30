'use strict';

var MemoryStore = require('./memory-store');

function createScheduler() {
  throw new Error('TODO: implement createScheduler');
}

module.exports = { createScheduler: createScheduler, MemoryStore: MemoryStore };
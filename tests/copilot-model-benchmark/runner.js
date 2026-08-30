'use strict';

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var root = path.resolve(__dirname, '..', '..');
var protocolPath = path.join(__dirname, 'protocol.json');
var resultsRoot = path.join(__dirname, 'results');
var protocol = JSON.parse(fs.readFileSync(protocolPath, 'utf8'));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  var result = { _: [] };
  var index;
  var key;

  for (index = 0; index < argv.length; index += 1) {
    if (argv[index].slice(0, 2) !== '--') {
      result._.push(argv[index]);
      continue;
    }
    key = argv[index].slice(2);
    if (index + 1 >= argv.length || argv[index + 1].slice(0, 2) === '--') {
      result[key] = true;
    } else {
      result[key] = argv[index + 1];
      index += 1;
    }
  }
  return result;
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function gitValue(args) {
  return childProcess.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function ensureModel(model) {
  if (protocol.models.indexOf(model) === -1) {
    fail('Unknown model. Expected one of: ' + protocol.models.join(', '));
  }
}

function ensureRunNumber(run) {
  var value = Number(run);
  if (!Number.isInteger(value) || value < 1 || value > protocol.repetitions) {
    fail('Run must be an integer from 1 to ' + protocol.repetitions + '.');
  }
  return value;
}

function resultPath(model, run) {
  return path.join(resultsRoot, model, 'run-' + run + '.json');
}

function readResult(model, run) {
  var filePath = resultPath(model, run);
  if (!fs.existsSync(filePath)) fail('Run has not begun: ' + filePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeResult(model, run, result) {
  var filePath = resultPath(model, run);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2) + '\n');
}

function commandBegin(options) {
  var model = options.model;
  var run = ensureRunNumber(options.run);
  var filePath = resultPath(model, run);
  var sourcePath = path.join(root, protocol.sourceLocks.longContextFile);
  var now = new Date();
  var result;

  ensureModel(model);
  if (fs.existsSync(filePath) && !options.force) {
    fail('Result already exists. Use --force only when intentionally invalidating and repeating a run.');
  }

  result = {
    protocolId: protocol.id,
    protocolSha256: hashFile(protocolPath),
    model: model,
    run: run,
    status: 'running',
    timingScope: protocol.timing.available,
    startedAt: now.toISOString(),
    startedAtEpochMs: now.getTime(),
    repositoryHead: gitValue(['rev-parse', 'HEAD']),
    longContextSource: protocol.sourceLocks.longContextFile,
    longContextSha256: hashFile(sourcePath),
    tasks: {},
    processEvidence: []
  };
  writeResult(model, run, result);
  console.log(JSON.stringify({ runId: model + '-run-' + run, startedAt: result.startedAt }, null, 2));
}

function commandMark(options) {
  var model = options.model;
  var run = ensureRunNumber(options.run);
  var taskId = options.task;
  var score = Number(options.score);
  var task = protocol.tasks.find(function (entry) { return entry.id === taskId; });
  var result;

  ensureModel(model);
  if (!task) fail('Unknown task: ' + taskId);
  if (!Number.isFinite(score) || score < 0 || score > task.maxScore) {
    fail('Score for ' + taskId + ' must be between 0 and ' + task.maxScore + '.');
  }
  if (!options.evidence) fail('--evidence is required.');

  result = readResult(model, run);
  if (result.status !== 'running') fail('Cannot mark a completed run.');
  result.tasks[taskId] = {
    score: score,
    maxScore: task.maxScore,
    evidence: options.evidence,
    recordedAt: new Date().toISOString()
  };
  writeResult(model, run, result);
}

function commandEvent(options) {
  var model = options.model;
  var run = ensureRunNumber(options.run);
  var result;

  ensureModel(model);
  if (!options.message) fail('--message is required.');
  result = readResult(model, run);
  result.processEvidence.push({ at: new Date().toISOString(), message: options.message });
  writeResult(model, run, result);
}

function commandEnd(options) {
  var model = options.model;
  var run = ensureRunNumber(options.run);
  var result;
  var now = new Date();
  var required = protocol.tasks.filter(function (task) { return task.id !== 'speed'; });
  var missing;

  ensureModel(model);
  result = readResult(model, run);
  missing = required.filter(function (task) { return !result.tasks[task.id]; });
  if (missing.length) fail('Missing task evidence: ' + missing.map(function (task) { return task.id; }).join(', '));

  result.status = 'completed';
  result.completedAt = now.toISOString();
  result.completedAtEpochMs = now.getTime();
  result.observableExecutionMs = result.completedAtEpochMs - result.startedAtEpochMs;
  result.qualityScore = required.reduce(function (sum, task) {
    return sum + result.tasks[task.id].score;
  }, 0);
  result.qualityMaxScore = required.reduce(function (sum, task) {
    return sum + task.maxScore;
  }, 0);
  writeResult(model, run, result);
  console.log(JSON.stringify({
    runId: model + '-run-' + run,
    qualityScore: result.qualityScore,
    qualityMaxScore: result.qualityMaxScore,
    observableExecutionMs: result.observableExecutionMs
  }, null, 2));
}

function commandVerify() {
  var issues = [];
  var expectedProtocolHash = hashFile(protocolPath);
  var expectedSourceHash = hashFile(path.join(root, protocol.sourceLocks.longContextFile));
  var completed = 0;

  protocol.models.forEach(function (model) {
    var run;
    for (run = 1; run <= protocol.repetitions; run += 1) {
      var filePath = resultPath(model, run);
      var result;
      if (!fs.existsSync(filePath)) {
        issues.push(model + ' run ' + run + ': missing');
        continue;
      }
      result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (result.protocolSha256 !== expectedProtocolHash) issues.push(model + ' run ' + run + ': protocol hash mismatch');
      if (result.longContextSha256 !== expectedSourceHash) issues.push(model + ' run ' + run + ': source hash mismatch');
      if (result.status !== 'completed') issues.push(model + ' run ' + run + ': not completed');
      if (result.status === 'completed') completed += 1;
    }
  });

  console.log(JSON.stringify({ expectedRuns: protocol.models.length * protocol.repetitions, completedRuns: completed, issues: issues }, null, 2));
  if (issues.length) process.exitCode = 1;
}

var options = parseArgs(process.argv.slice(2));
var command = options._[0];

if (command === 'begin') commandBegin(options);
else if (command === 'mark') commandMark(options);
else if (command === 'event') commandEvent(options);
else if (command === 'end') commandEnd(options);
else if (command === 'verify') commandVerify();
else fail('Usage: runner.js begin|mark|event|end|verify [options]');
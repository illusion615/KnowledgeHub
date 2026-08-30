'use strict';

var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var benchmarkRoot = __dirname;
var repoRoot = path.resolve(benchmarkRoot, '..', '..');
var protocol = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'protocol.json'), 'utf8'));
var runRoot = path.join(repoRoot, '.tmp', 'copilot-model-benchmark');
var resultRoot = path.join(benchmarkRoot, 'results');

function execute(command, args, cwd) {
  var result = childProcess.spawnSync(command, args, { cwd: cwd, encoding: 'utf8' });
  var parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch (error) {}
  return { exitCode: result.status, stdout: result.stdout, stderr: result.stderr, parsed: parsed };
}

function parseEvents(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).reduce(function (events, line) {
    if (!line.trim()) return events;
    try { events.push(JSON.parse(line)); } catch (error) {}
    return events;
  }, []);
}

function eventTimestamp(events, type, useLast) {
  var matches = events.filter(function (event) { return event.type === type && event.timestamp; });
  var event = useLast ? matches[matches.length - 1] : matches[0];
  return event ? Date.parse(event.timestamp) : null;
}

function firstEventTimestamp(events, types) {
  var timestamps = events.filter(function (event) {
    return types.indexOf(event.type) !== -1 && event.timestamp;
  }).map(function (event) { return Date.parse(event.timestamp); }).filter(Number.isFinite);
  return timestamps.length ? Math.min.apply(null, timestamps) : null;
}

function countEvents(events, type) {
  return events.filter(function (event) { return event.type === type; }).length;
}

function gradeRun(model, run) {
  var workspace = path.join(runRoot, model + '-run-' + run);
  var timingPath = path.join(resultRoot, model, 'run-' + run + '.json');
  var task1Path = path.join(workspace, 'answers', 'task1.js');
  var architecturePath = path.join(workspace, 'answers', 'architecture.md');
  var longContextPath = path.join(workspace, 'answers', 'long-context.md');
  var processPath = path.join(workspace, 'answers', 'process.json');
  var fixturePath = path.join(workspace, 'fixture');
  var timing = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, 'utf8')) : null;
  var workspaceEventsPath = path.join(workspace, 'copilot-events.jsonl');
  var legacyEventsPath = path.join(resultRoot, model, 'run-' + run + '.events.jsonl');
  var events = parseEvents(fs.existsSync(workspaceEventsPath) ? workspaceEventsPath : legacyEventsPath);
  var modelCallAt = eventTimestamp(events, 'model.call_start', false);
  var firstMessageAt = firstEventTimestamp(events, ['assistant.reasoning_delta', 'assistant.message_start', 'tool.execution_start', 'tool.call_start']);
  var userAt = eventTimestamp(events, 'user.message', false);
  var finalTurnAt = eventTimestamp(events, 'assistant.turn_end', true);
  if (timing && events.length) {
    timing.measurementAddendumId = 'copilot-cli-json-timing-v1';
    timing.modelTtftMs = modelCallAt && firstMessageAt ? firstMessageAt - modelCallAt : null;
    timing.agentDurationMs = userAt && finalTurnAt ? finalTurnAt - userAt : null;
    timing.userMessageAtEpochMs = userAt;
    timing.firstObservableAtEpochMs = firstMessageAt;
    timing.turnEndAtEpochMs = finalTurnAt;
    timing.modelCalls = countEvents(events, 'model.call_start');
    timing.toolExecutions = countEvents(events, 'tool.execution_start');
    timing.assistantTurns = countEvents(events, 'assistant.turn_end');
    fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2) + '\n');
  }
  var task1 = fs.existsSync(task1Path)
    ? execute('node', [path.join(benchmarkRoot, 'graders', 'grade-task1.js'), task1Path], repoRoot)
    : null;
  var publicScheduler = fs.existsSync(fixturePath)
    ? execute('node', ['--test', path.join(fixturePath, 'tests', 'scheduler.test.js')], repoRoot)
    : null;
  var hiddenScheduler = fs.existsSync(path.join(fixturePath, 'src', 'index.js'))
    ? execute('node', [path.join(benchmarkRoot, 'graders', 'grade-scheduler.js'), fixturePath], repoRoot)
    : null;
  var processData = null;
  try { if (fs.existsSync(processPath)) processData = JSON.parse(fs.readFileSync(processPath, 'utf8')); } catch (error) {}

  return {
    model: model,
    run: run,
    timing: timing || { exitCode: null, modelTtftMs: null, agentDurationMs: null, processDurationMs: null, telemetryMissing: true },
    artifacts: {
      task1: fs.existsSync(task1Path),
      architecture: fs.existsSync(architecturePath),
      longContext: fs.existsSync(longContextPath),
      process: fs.existsSync(processPath),
      fixtureIndex: fs.existsSync(path.join(fixturePath, 'src', 'index.js')),
      fixtureStore: fs.existsSync(path.join(fixturePath, 'src', 'memory-store.js'))
    },
    task1: task1 ? { exitCode: task1.exitCode, result: task1.parsed, stderr: task1.stderr } : null,
    publicScheduler: publicScheduler ? { exitCode: publicScheduler.exitCode, output: publicScheduler.stdout + publicScheduler.stderr } : null,
    hiddenScheduler: hiddenScheduler ? { exitCode: hiddenScheduler.exitCode, result: hiddenScheduler.parsed, stderr: hiddenScheduler.stderr } : null,
    process: processData,
    processMetrics: {
      modelCalls: countEvents(events, 'model.call_start'),
      toolExecutions: countEvents(events, 'tool.execution_start'),
      assistantTurns: countEvents(events, 'assistant.turn_end')
    },
    architectureBytes: fs.existsSync(architecturePath) ? fs.statSync(architecturePath).size : 0,
    longContextBytes: fs.existsSync(longContextPath) ? fs.statSync(longContextPath).size : 0
  };
}

var results = [];
protocol.models.filter(function (model) { return protocol.availability[model] === 'available'; }).forEach(function (model) {
  var run;
  for (run = 1; run <= protocol.repetitions; run += 1) results.push(gradeRun(model, run));
});

fs.writeFileSync(path.join(resultRoot, 'automatic-grades.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results.map(function (entry) {
  return {
    model: entry.model,
    run: entry.run,
    exitCode: entry.timing && entry.timing.exitCode,
    ttftMs: entry.timing && entry.timing.modelTtftMs,
    agentDurationMs: entry.timing && entry.timing.agentDurationMs,
    task1: entry.task1 && entry.task1.result,
    scheduler: entry.hiddenScheduler && entry.hiddenScheduler.result,
    artifactsComplete: Object.keys(entry.artifacts).every(function (key) { return entry.artifacts[key]; })
  };
}), null, 2));
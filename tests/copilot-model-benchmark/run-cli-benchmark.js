'use strict';

var childProcess = require('child_process');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var benchmarkRoot = __dirname;
var repoRoot = path.resolve(benchmarkRoot, '..', '..');
var protocol = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'protocol.json'), 'utf8'));
var prompt = fs.readFileSync(path.join(benchmarkRoot, 'MASTER_PROMPT.md'), 'utf8');
var runRoot = path.join(repoRoot, '.tmp', 'copilot-model-benchmark');
var resultRoot = path.join(benchmarkRoot, 'results');
var availableModels = protocol.models.filter(function (model) { return protocol.availability[model] === 'available'; });
var requestedModel = process.argv.indexOf('--model') >= 0 ? process.argv[process.argv.indexOf('--model') + 1] : null;
var requestedRun = process.argv.indexOf('--run') >= 0 ? Number(process.argv[process.argv.indexOf('--run') + 1]) : null;

if (requestedModel) {
  if (availableModels.indexOf(requestedModel) === -1) throw new Error('Requested model is not available: ' + requestedModel);
  availableModels = [requestedModel];
}
if (requestedRun && (!Number.isInteger(requestedRun) || requestedRun < 1 || requestedRun > protocol.repetitions)) {
  throw new Error('Requested run must be between 1 and ' + protocol.repetitions + '.');
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function copyDirectory(source, destination) {
  fs.cpSync(source, destination, { recursive: true });
}

function parseJsonObjects(text) {
  var lines = text.split(/\r?\n/);
  var objects = [];
  lines.forEach(function (line) {
    if (!line.trim()) return;
    try { objects.push(JSON.parse(line)); } catch (error) {}
  });
  return objects;
}

function timestampFor(events, types) {
  var event = events.find(function (entry) { return types.indexOf(entry.type) !== -1 && entry.timestamp; });
  return event ? Date.parse(event.timestamp) : null;
}

function lastTimestampFor(events, types) {
  var matches = events.filter(function (entry) { return types.indexOf(entry.type) !== -1 && entry.timestamp; });
  return matches.length ? Date.parse(matches[matches.length - 1].timestamp) : null;
}

function firstTimestampForAny(events, types) {
  var timestamps = events.filter(function (entry) {
    return types.indexOf(entry.type) !== -1 && entry.timestamp;
  }).map(function (entry) { return Date.parse(entry.timestamp); }).filter(Number.isFinite);
  return timestamps.length ? Math.min.apply(null, timestamps) : null;
}

function runOne(model, run) {
  return new Promise(function (resolve) {
    var runId = model + '-run-' + run;
    var workspace = path.join(runRoot, runId);
    var resultDirectory = path.join(resultRoot, model);
    var started = Date.now();
    var stdout = '';
    var stderr = '';
    var command;

    fs.rmSync(workspace, { recursive: true, force: true });
    fs.mkdirSync(path.join(workspace, 'input'), { recursive: true });
    fs.mkdirSync(path.join(workspace, 'answers'), { recursive: true });
    copyDirectory(path.join(benchmarkRoot, 'fixture'), path.join(workspace, 'fixture'));
    fs.copyFileSync(path.join(repoRoot, protocol.sourceLocks.longContextFile), path.join(workspace, 'input', 'article-presentation.js'));
    fs.writeFileSync(path.join(workspace, 'BENCHMARK.md'), prompt);
    fs.mkdirSync(resultDirectory, { recursive: true });

    command = childProcess.spawn('copilot', [
      '-C', workspace,
      '--model', model,
      '--output-format', 'json',
      '--stream', 'on',
      '--allow-all-tools',
      '--disable-builtin-mcps',
      '--no-custom-instructions',
      '-p', prompt
    ], { cwd: workspace, env: process.env });

    command.stdout.on('data', function (chunk) { stdout += chunk.toString(); });
    command.stderr.on('data', function (chunk) { stderr += chunk.toString(); });
    command.on('close', function (exitCode) {
      var ended = Date.now();
      var events = parseJsonObjects(stdout);
      var userAt = timestampFor(events, ['user.message']);
      var modelAt = timestampFor(events, ['model.call_start']);
      var firstAt = firstTimestampForAny(events, ['assistant.reasoning_delta', 'assistant.message_start', 'tool.execution_start', 'tool.call_start']);
      var turnEndAt = lastTimestampFor(events, ['assistant.turn_end']);
      var result = {
        protocolId: protocol.id,
        protocolSha256: hashFile(path.join(benchmarkRoot, 'protocol.json')),
        promptSha256: hashFile(path.join(benchmarkRoot, 'MASTER_PROMPT.md')),
        model: model,
        run: run,
        exitCode: exitCode,
        sourceSha256: hashFile(path.join(workspace, 'input', 'article-presentation.js')),
        processStartedAtEpochMs: started,
        processEndedAtEpochMs: ended,
        processDurationMs: ended - started,
        userMessageAtEpochMs: userAt,
        modelCallAtEpochMs: modelAt,
        firstObservableAtEpochMs: firstAt,
        turnEndAtEpochMs: turnEndAt,
        modelTtftMs: modelAt && firstAt ? firstAt - modelAt : null,
        agentDurationMs: userAt && turnEndAt ? turnEndAt - userAt : null,
        eventTypes: Array.from(new Set(events.map(function (event) { return event.type; }))),
        workspace: path.relative(repoRoot, workspace)
      };
      fs.writeFileSync(path.join(resultDirectory, 'run-' + run + '.json'), JSON.stringify(result, null, 2) + '\n');
      fs.writeFileSync(path.join(workspace, 'copilot-events.jsonl'), stdout);
      fs.writeFileSync(path.join(workspace, 'copilot-stderr.log'), stderr);
      resolve(result);
    });
  });
}

(async function () {
  var summary = [];
  var modelIndex;
  var run;
  fs.mkdirSync(runRoot, { recursive: true });
  for (modelIndex = 0; modelIndex < availableModels.length; modelIndex += 1) {
    for (run = requestedRun || 1; run <= (requestedRun || protocol.repetitions); run += 1) {
      console.log('Starting ' + availableModels[modelIndex] + ' run ' + run + '...');
      summary.push(await runOne(availableModels[modelIndex], run));
      console.log('Completed ' + availableModels[modelIndex] + ' run ' + run + '.');
    }
  }
  fs.writeFileSync(path.join(resultRoot, 'cli-run-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary.map(function (result) {
    return { model: result.model, run: result.run, exitCode: result.exitCode, modelTtftMs: result.modelTtftMs, agentDurationMs: result.agentDurationMs };
  }), null, 2));
}()).catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
'use strict';

var fs = require('fs');
var path = require('path');

var benchmarkRoot = __dirname;
var protocol = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'protocol.json'), 'utf8'));
var measurementAddendum = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'MEASUREMENT_ADDENDUM.json'), 'utf8'));
var resultRoot = path.join(benchmarkRoot, 'results');
var automatic = JSON.parse(fs.readFileSync(path.join(resultRoot, 'automatic-grades.json'), 'utf8'));
var mapping = JSON.parse(fs.readFileSync(path.join(resultRoot, 'judges', 'answer-map.json'), 'utf8'));
var judgeFiles = protocol.models.filter(function (model) { return protocol.availability[model] === 'available'; }).map(function (model) {
  return path.join(resultRoot, 'judges', model + '.json');
}).filter(fs.existsSync);
var judges = judgeFiles.map(function (filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); });

function median(values) {
  var sorted = values.slice().sort(function (a, b) { return a - b; });
  if (!sorted.length) return null;
  var middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function average(values) {
  return values.length ? values.reduce(function (sum, value) { return sum + value; }, 0) / values.length : 0;
}

function round(value, digits) {
  var factor = Math.pow(10, digits || 0);
  return Math.round(value * factor) / factor;
}

function judgeScores(code, field) {
  return judges.map(function (judge) {
    return judge.answers && judge.answers[code] && judge.answers[code][field] && judge.answers[code][field].score;
  }).filter(Number.isFinite);
}

function requireNumber(value, label) {
  if (!Number.isFinite(value)) throw new Error('Missing numeric result: ' + label);
  return value;
}

var runs = automatic.map(function (entry) {
  var code = Object.keys(mapping).find(function (candidate) {
    return mapping[candidate].model === entry.model && mapping[candidate].run === entry.run;
  });
  var task1Passed = entry.task1 && entry.task1.result ? entry.task1.result.passed : 0;
  var schedulerPassed = entry.hiddenScheduler && entry.hiddenScheduler.result ? entry.hiddenScheduler.result.passed : 0;
  var publicSchedulerPassed = entry.publicScheduler && entry.publicScheduler.exitCode === 0;
  var artifactsComplete = Object.keys(entry.artifacts).every(function (key) { return entry.artifacts[key]; });
  var processComplete = entry.process && Array.isArray(entry.process.commandsRun) && Array.isArray(entry.process.repairs) && Array.isArray(entry.process.knownLimitations);
  if (!entry.timing || entry.timing.measurementAddendumId !== measurementAddendum.id) {
    throw new Error('Timing addendum mismatch for ' + entry.model + ' run ' + entry.run);
  }
  var architectureScore = median(judgeScores(code, 'architecture'));
  var longContextScore = median(judgeScores(code, 'longContext'));
  return {
    model: entry.model,
    run: entry.run,
    code: code,
    codeScore: round(25 * task1Passed / 12, 1),
    architectureScore: requireNumber(architectureScore, entry.model + ' run ' + entry.run + ' architecture'),
    longContextScore: requireNumber(longContextScore, entry.model + ' run ' + entry.run + ' long context'),
    longHorizonScore: round(20 * schedulerPassed / 10 + (publicSchedulerPassed ? 2 : 0) + (artifactsComplete ? 1 : 0) + (processComplete ? 1 : 0) + ((entry.timing && entry.timing.exitCode === 0) || (artifactsComplete && processComplete) ? 1 : 0), 1),
    ttftMs: entry.timing && entry.timing.modelTtftMs,
    agentDurationMs: entry.timing && entry.timing.agentDurationMs,
    processDurationMs: entry.timing && entry.timing.processDurationMs,
    artifactsComplete: artifactsComplete,
    processMetrics: entry.processMetrics
    ,telemetryAvailable: !!(entry.timing && Number.isFinite(entry.timing.agentDurationMs))
    ,measurementAddendumId: entry.timing.measurementAddendumId
  };
});

var availableModels = protocol.models.filter(function (model) { return protocol.availability[model] === 'available'; });
var modelSummaries = availableModels.map(function (model) {
  var modelRuns = runs.filter(function (run) { return run.model === model; });
  if (modelRuns.length !== protocol.repetitions) {
    throw new Error('Expected ' + protocol.repetitions + ' runs for ' + model + ', found ' + modelRuns.length);
  }
  var qualityTotals = modelRuns.map(function (run) {
    return run.codeScore + run.architectureScore + run.longContextScore + run.longHorizonScore;
  });
  return {
    model: model,
    runs: modelRuns,
    code: round(average(modelRuns.map(function (run) { return run.codeScore; })), 1),
    architecture: round(average(modelRuns.map(function (run) { return run.architectureScore; })), 1),
    longContext: round(average(modelRuns.map(function (run) { return run.longContextScore; })), 1),
    longHorizon: round(average(modelRuns.map(function (run) { return run.longHorizonScore; })), 1),
    quality: round(average(qualityTotals), 1),
    qualityFloor: round(Math.min.apply(null, qualityTotals), 1),
    qualitySpread: round(Math.max.apply(null, qualityTotals) - Math.min.apply(null, qualityTotals), 1),
    ttftMs: round(median(modelRuns.map(function (run) { return run.ttftMs; }).filter(Number.isFinite)), 0),
    agentDurationMs: round(median(modelRuns.map(function (run) { return run.agentDurationMs; }).filter(Number.isFinite)), 0),
    processDurationMs: round(median(modelRuns.map(function (run) { return run.processDurationMs; }).filter(Number.isFinite)), 0),
    telemetryRuns: modelRuns.filter(function (run) { return run.telemetryAvailable; }).length
    ,modelCalls: round(average(modelRuns.map(function (run) { return run.processMetrics.modelCalls; })), 1)
    ,toolExecutions: round(average(modelRuns.map(function (run) { return run.processMetrics.toolExecutions; })), 1)
  };
});

var validDurations = modelSummaries.map(function (model) { return model.agentDurationMs; }).filter(Number.isFinite);
if (!validDurations.length) throw new Error('No agent duration data is available.');
var fastestAgent = Math.min.apply(null, validDurations);
modelSummaries.forEach(function (model) {
  model.speed = model.agentDurationMs ? round(5 * fastestAgent / model.agentDurationMs, 1) : 0;
  model.overall = round(model.quality + model.speed, 1);
});

var scenarios = {
  dailyCoding: { code: 0.50, longHorizon: 0.20, speed: 0.20, stability: 0.10 },
  architecture: { architecture: 0.55, longContext: 0.20, longHorizon: 0.15, stability: 0.10 },
  largeCodebase: { longContext: 0.50, longHorizon: 0.25, code: 0.15, stability: 0.10 },
  complexDelivery: { longHorizon: 0.45, longContext: 0.20, architecture: 0.15, stability: 0.20 },
  rapidPrototype: { speed: 0.45, code: 0.30, longHorizon: 0.15, stability: 0.10 }
};

function normalized(model, key) {
  if (key === 'speed') return model.speed / 5 * 100;
  if (key === 'stability') return Math.max(0, 100 - model.qualitySpread * 10);
  var max = key === 'architecture' ? 20 : 25;
  return model[key] / max * 100;
}

var recommendations = {};
Object.keys(scenarios).forEach(function (scenario) {
  var weights = scenarios[scenario];
  recommendations[scenario] = modelSummaries.map(function (model) {
    var score = Object.keys(weights).reduce(function (sum, key) {
      return sum + normalized(model, key) * weights[key];
    }, 0);
    return { model: model.model, score: round(score, 1) };
  }).sort(function (a, b) { return b.score - a.score; });
});

var output = {
  protocolId: protocol.id,
  measurementAddendumId: measurementAddendum.id,
  unavailable: [{ model: 'deepseek-v4-pro', reason: protocol.availability['deepseek-v4-pro'] }],
  judgeCount: judges.length,
  runs: runs,
  models: modelSummaries.sort(function (a, b) { return b.overall - a.overall; }),
  scenarioWeights: scenarios,
  recommendations: recommendations
};

fs.writeFileSync(path.join(resultRoot, 'final-results.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
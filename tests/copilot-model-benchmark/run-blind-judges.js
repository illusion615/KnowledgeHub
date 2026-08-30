'use strict';

var childProcess = require('child_process');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var benchmarkRoot = __dirname;
var repoRoot = path.resolve(benchmarkRoot, '..', '..');
var protocol = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'protocol.json'), 'utf8'));
var rubric = fs.readFileSync(path.join(benchmarkRoot, 'BLIND_GRADING_RUBRIC.md'), 'utf8');
var runRoot = path.join(repoRoot, '.tmp', 'copilot-model-benchmark');
var judgeRoot = path.join(runRoot, 'blind-judging');
var resultRoot = path.join(benchmarkRoot, 'results', 'judges');
var models = protocol.models.filter(function (model) { return protocol.availability[model] === 'available'; });

function codeFor(model, run) {
  return crypto.createHash('sha256').update(protocol.id + ':' + model + ':' + run).digest('hex').slice(0, 8).toUpperCase();
}

function preparePackage() {
  var mapping = {};
  fs.rmSync(judgeRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(judgeRoot, 'answers'), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, protocol.sourceLocks.longContextFile), path.join(judgeRoot, 'article-presentation.js'));
  fs.writeFileSync(path.join(judgeRoot, 'RUBRIC.md'), rubric);

  models.forEach(function (model) {
    var run;
    for (run = 1; run <= protocol.repetitions; run += 1) {
      var code = codeFor(model, run);
      var source = path.join(runRoot, model + '-run-' + run, 'answers');
      mapping[code] = { model: model, run: run };
      if (!fs.existsSync(path.join(source, 'architecture.md')) || !fs.existsSync(path.join(source, 'long-context.md'))) {
        throw new Error('Missing answer files for ' + model + ' run ' + run);
      }
      fs.mkdirSync(path.join(judgeRoot, 'answers', code), { recursive: true });
      fs.copyFileSync(path.join(source, 'architecture.md'), path.join(judgeRoot, 'answers', code, 'architecture.md'));
      fs.copyFileSync(path.join(source, 'long-context.md'), path.join(judgeRoot, 'answers', code, 'long-context.md'));
    }
  });
  fs.mkdirSync(resultRoot, { recursive: true });
  fs.writeFileSync(path.join(resultRoot, 'answer-map.json'), JSON.stringify(mapping, null, 2) + '\n');
  return Object.keys(mapping).sort();
}

function runJudge(model, codes) {
  return new Promise(function (resolve) {
    var outputPath = path.join(judgeRoot, 'judge-output-' + model + '.json');
    var prompt = [
      'Act as a strict blind benchmark judge. Read RUBRIC.md and article-presentation.js.',
      'Grade every anonymous answer directory under answers/: ' + codes.join(', ') + '.',
      'For each code, grade architecture.md and long-context.md exactly by the frozen rubric.',
      'Do not infer identity or compare writing style. Verify each alleged bug against the source.',
      'Write strict JSON to ' + path.basename(outputPath) + ' using this shape:',
      '{"answers":{"CODE":{"architecture":{"score":0,"max":20,"reasons":[]},"longContext":{"score":0,"max":25,"summaryScore":0,"bugs":[],"precisionScore":0,"reasons":[]}}}}.',
      'Do not modify any other file. After writing it, reply with only JUDGING_COMPLETE.'
    ].join('\n');
    var child = childProcess.spawn('copilot', [
      '-C', judgeRoot,
      '--model', model,
      '--output-format', 'json',
      '--stream', 'off',
      '--allow-all-tools',
      '--disable-builtin-mcps',
      '--no-custom-instructions',
      '-p', prompt
    ], { cwd: judgeRoot, env: process.env });
    var stdout = '';
    var stderr = '';
    child.stdout.on('data', function (chunk) { stdout += chunk.toString(); });
    child.stderr.on('data', function (chunk) { stderr += chunk.toString(); });
    child.on('close', function (exitCode) {
      var destination = path.join(resultRoot, model + '.json');
      if (fs.existsSync(outputPath)) fs.copyFileSync(outputPath, destination);
      resolve({ model: model, exitCode: exitCode, outputExists: fs.existsSync(destination), stderr: stderr.slice(-1000), cliOutputBytes: stdout.length });
    });
  });
}

(async function () {
  var codes = preparePackage();
  var results = [];
  var index;
  for (index = 0; index < models.length; index += 1) {
    console.log('Starting blind judge ' + models[index] + '...');
    results.push(await runJudge(models[index], codes));
    console.log('Completed blind judge ' + models[index] + '.');
  }
  fs.writeFileSync(path.join(resultRoot, 'judge-run-summary.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
}()).catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
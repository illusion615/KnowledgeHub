#!/usr/bin/env node
// ==========================================
// Knowledge Hub — Change Verification Runner
// ==========================================
// Runs independent read-only checks concurrently and returns one compact report.

var childProcess = require('child_process');
var path = require('path');
var performance = require('perf_hooks').performance;

var ROOT = path.resolve(__dirname, '..');
var LEVELS = {
  L0: {
    checks: 'structure,quotes,i18n,density',
    browser: {
      sectionScan: true,
      readingModes: ['current desktop'],
      presentation: 'only when presentation metadata changed',
      screenshots: 'affected region'
    }
  },
  L1: {
    checks: null,
    browser: {
      sectionScan: true,
      readingModes: ['zh desktop', 'en desktop', 'affected mobile'],
      presentation: 'affected chapter only',
      screenshots: 'affected interaction and chapter'
    }
  },
  L2: {
    checks: null,
    browser: {
      sectionScan: true,
      readingModes: ['zh light desktop', 'en dark desktop', 'mobile'],
      presentation: 'full zh-light and en-dark deck',
      screenshots: 'key structure pages'
    }
  }
};

function usage() {
  console.log([
    'Usage: node tests/verify-change.js [options]',
    '',
    'Options:',
    '  --article <slug>   Article under active development',
    '  --level <L0|L1|L2> Validation risk level (default: L1)',
    '  --changed          Let validate.js derive scope from changed files',
    '  --final            Run the full repository gate',
    '  --serial           Run tasks serially (benchmark/troubleshooting only)',
    '  --json             Emit machine-readable JSON',
    '  --verbose          Include successful command output',
    '  --help             Print this help'
  ].join('\n'));
}

function parseArgs(args) {
  var options = {
    article: '',
    level: 'L1',
    changed: false,
    final: false,
    serial: false,
    json: false,
    verbose: false
  };
  var index;
  var arg;

  for (index = 0; index < args.length; index++) {
    arg = args[index];
    if (arg === '--help') {
      usage();
      process.exit(0);
    }
    if (arg === '--changed' || arg === '--final' || arg === '--serial' || arg === '--json' || arg === '--verbose') {
      options[arg.slice(2)] = true;
      continue;
    }
    if (arg === '--article' || arg === '--level') {
      if (!args[index + 1]) {
        console.error('Missing value for ' + arg);
        process.exit(2);
      }
      options[arg.slice(2)] = args[++index];
      continue;
    }
    console.error('Unknown option: ' + arg);
    usage();
    process.exit(2);
  }

  options.level = options.level.toUpperCase();
  if (!LEVELS[options.level]) {
    console.error('Invalid level: ' + options.level);
    process.exit(2);
  }
  if (!options.final && !options.changed && !options.article) {
    console.error('Use --article <slug>, --changed, or --final');
    process.exit(2);
  }
  return options;
}

function commandTask(name, command, args, required) {
  return {
    name: name,
    command: command,
    args: args,
    required: required !== false
  };
}

function validatorArgs(options) {
  var args = ['tests/validate.js'];
  var level = LEVELS[options.level];

  if (options.final) return args;
  if (options.changed) return args.concat(['--changed']);
  args = args.concat(['--article', options.article]);
  if (level.checks) args = args.concat(['--checks', level.checks]);
  return args;
}

function taskRegistry(options) {
  return [
    commandTask('validator', process.execPath, validatorArgs(options)),
    commandTask('worktree-diff-check', 'git', ['diff', '--check']),
    commandTask('staged-diff-check', 'git', ['diff', '--cached', '--check']),
    commandTask('changed-files', 'git', ['status', '--short'], false)
  ];
}

function runTask(task) {
  return new Promise(function (resolve) {
    var start = performance.now();
    var child = childProcess.spawn(task.command, task.args, {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    var stdout = '';
    var stderr = '';

    child.stdout.on('data', function (chunk) {
      stdout += chunk.toString();
    });
    child.stderr.on('data', function (chunk) {
      stderr += chunk.toString();
    });
    child.on('error', function (error) {
      resolve({
        name: task.name,
        required: task.required,
        exitCode: 1,
        durationMs: Math.round(performance.now() - start),
        stdout: stdout,
        stderr: stderr + error.message
      });
    });
    child.on('close', function (exitCode) {
      resolve({
        name: task.name,
        required: task.required,
        exitCode: exitCode,
        durationMs: Math.round(performance.now() - start),
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

async function runTasks(tasks, serial) {
  var results = [];
  var index;
  if (!serial) return Promise.all(tasks.map(runTask));
  for (index = 0; index < tasks.length; index++) {
    results.push(await runTask(tasks[index]));
  }
  return results;
}

function report(options, results, durationMs) {
  var failed = results.filter(function (result) {
    return result.required && result.exitCode !== 0;
  });
  var payload = {
    ok: failed.length === 0,
    mode: options.final ? 'final' : (options.changed ? 'changed' : 'article'),
    article: options.article || null,
    level: options.level,
    execution: options.serial ? 'serial' : 'parallel',
    durationMs: durationMs,
    tasks: results.map(function (result) {
      var task = {
        name: result.name,
        required: result.required,
        ok: result.exitCode === 0,
        exitCode: result.exitCode,
        durationMs: result.durationMs
      };
      if (options.verbose || result.exitCode !== 0) {
        task.stdout = result.stdout;
        task.stderr = result.stderr;
      }
      if (result.name === 'changed-files' && result.stdout) {
        task.files = result.stdout.split('\n');
      }
      return task;
    }),
    browserPlan: LEVELS[options.level].browser,
    idePlan: 'Run editor diagnostics concurrently with this command; diagnostics are not available to the Node runner.'
  };

  return payload;
}

function printReport(payload, json) {
  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  console.log((payload.ok ? 'PASS' : 'FAIL') + ' change verification in ' + payload.durationMs + ' ms');
  payload.tasks.forEach(function (task) {
    console.log('  ' + (task.ok ? 'PASS' : 'FAIL') + ' ' + task.name + ' (' + task.durationMs + ' ms)');
    if (!task.ok && task.stderr) console.log(task.stderr);
    if (!task.ok && task.stdout) console.log(task.stdout);
  });
  console.log('  Browser: ' + JSON.stringify(payload.browserPlan));
  console.log('  IDE: ' + payload.idePlan);
}

async function main() {
  var options = parseArgs(process.argv.slice(2));
  var tasks = taskRegistry(options);
  var start = performance.now();
  var results = await runTasks(tasks, options.serial);
  var payload = report(options, results, Math.round(performance.now() - start));
  printReport(payload, options.json);
  process.exit(payload.ok ? 0 : 1);
}

main().catch(function (error) {
  console.error(error.stack || error.message);
  process.exit(1);
});

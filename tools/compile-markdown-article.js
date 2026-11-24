#!/usr/bin/env node
// tools/compile-markdown-article.js
// CLI entry for the Study Room Genesis Static Markdown Compiler.
// Usage:
//   node tools/compile-markdown-article.js <input.md> --out <output.html>
//   node tools/compile-markdown-article.js <input.md> --check <expected.html>

'use strict';

var fs = require('fs');
var path = require('path');
var compiler = require('./markdown-compiler');

function printHelp() {
  console.log([
    'Usage: node tools/compile-markdown-article.js <input.md> [options]',
    '',
    'Options:',
    '  --out <path.html>    Write compiled static HTML to <path.html>',
    '  --check [path.html]  Verify compiled output contract (and byte-equality if path provided)',
    '  --help               Print usage'
  ].join('\n'));
}

function main(argv) {
  var args = argv.slice(2);
  var inputPath = null;
  var outPath = null;
  var checkMode = false;
  var checkTarget = null;

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      return 0;
    }
    if (arg === '--out' || arg === '-o') {
      outPath = args[++i];
      continue;
    }
    if (arg === '--check') {
      checkMode = true;
      if (args[i + 1] && args[i + 1].charAt(0) !== '-') {
        checkTarget = args[++i];
      }
      continue;
    }
    if (!inputPath) {
      inputPath = arg;
      continue;
    }
  }

  if (!inputPath) {
    console.error('Error: missing <input.md>');
    printHelp();
    return 2;
  }

  var absIn = path.resolve(inputPath);
  if (!fs.existsSync(absIn)) {
    console.error('Error: input file not found: ' + absIn);
    return 2;
  }

  var raw = fs.readFileSync(absIn, 'utf8');
  var result = compiler.compileMarkdownToHtml(raw, { baseDir: path.dirname(absIn) });
  var contract = compiler.verifyCompiledHtmlContract(result.html);

  if (!contract.ok) {
    console.error('Contract validation failed:\n  - ' + contract.errors.join('\n  - '));
    return 1;
  }

  if (checkMode) {
    var targetToCompare = checkTarget || outPath;
    if (targetToCompare) {
      var absTarget = path.resolve(targetToCompare);
      if (!fs.existsSync(absTarget)) {
        console.error('Check failed: target HTML does not exist: ' + absTarget);
        return 1;
      }
      var onDisk = fs.readFileSync(absTarget, 'utf8').replace(/\r\n/g, '\n');
      if (onDisk !== result.html) {
        console.error('Check failed: compiled output is out of sync with ' + absTarget);
        return 1;
      }
    }
    console.log('OK: ' + path.relative(process.cwd(), absIn) + ' (' + result.stats.sectionCount + ' sections, contract verified)');
    return 0;
  }

  if (outPath) {
    var absOut = path.resolve(outPath);
    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, result.html, 'utf8');
    console.log('Compiled ' + path.relative(process.cwd(), absIn) + ' -> ' + path.relative(process.cwd(), absOut) + ' (' + result.stats.sectionCount + ' sections)');
  } else {
    process.stdout.write(result.html);
  }

  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { main: main };

#!/usr/bin/env node
// tools/compile-figure.js
// CLI for Study Room Figure Engine v2.
// Usage:
//   node tools/compile-figure.js <spec.json> [--out-dir <dir>] [--name <basename>] [--inline]

'use strict';

var fs = require('fs');
var path = require('path');
var engine = require('./figure-engine');

function printHelp() {
  console.log([
    'Usage: node tools/compile-figure.js <spec.figure.json | spec.diagram.json> [options]',
    '',
    'Options:',
    '  --out-dir <dir>   Write <name>.zh.svg, <name>.en.svg, and <name>.drawio (if topology)',
    '  --name <name>     Override output base filename',
    '  --inline          Print inline bilingual CSS-variable SVG to stdout',
    '  --help            Show usage'
  ].join('\n'));
}

function main(argv) {
  var args = argv.slice(2);
  var specPath = null;
  var outDir = null;
  var baseName = null;
  var inlineOnly = false;

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      return 0;
    }
    if (arg === '--inline') {
      inlineOnly = true;
      continue;
    }
    if (arg === '--out-dir' || arg === '-o') {
      outDir = args[++i];
      continue;
    }
    if (arg === '--name' || arg === '-n') {
      baseName = args[++i];
      continue;
    }
    if (!specPath) {
      specPath = arg;
    }
  }

  if (!specPath) {
    console.error('Error: missing <spec.json>');
    printHelp();
    return 2;
  }

  var absSpec = path.resolve(specPath);
  if (!fs.existsSync(absSpec)) {
    console.error('Error: spec file not found: ' + absSpec);
    return 2;
  }

  if (inlineOnly) {
    var raw = JSON.parse(fs.readFileSync(absSpec, 'utf8'));
    var compiled = engine.compileFigure(raw, { lang: 'bilingual', standalone: false, idPrefix: baseName });
    process.stdout.write(compiled.svg + '\n');
    return 0;
  }

  var targetDir = outDir ? path.resolve(outDir) : path.dirname(absSpec);
  var res = engine.writeFigureArtifacts(absSpec, targetDir, baseName);
  console.log('Compiled figure "' + res.name + '" -> ' + path.relative(process.cwd(), targetDir));
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { main: main };

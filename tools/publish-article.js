#!/usr/bin/env node
// tools/publish-article.js
// Single-article deterministic static publishing CLI for Study Room (Knowledge Hub).
// Usage:
//   node tools/publish-article.js <slug|posts/<slug>/article.md> [options]
//   node tools/publish-article.js <slug> --status
//   node tools/publish-article.js <slug> --dry-run

'use strict';

var publisher = require('./article-publisher');

function printHelp() {
  console.log([
    'Usage: node tools/publish-article.js <slug|posts/<slug>/article.md> [options]',
    '',
    'Options:',
    '  --topic <topicId>        Target topic node ID in assets/knowledge-data.js',
    '  --status                 Inspect publication state (unpublished / published / modified_pending_sync)',
    '  --dry-run                Run compilation, catalog check & validation without writing files',
    '  --check                  Fail (exit 1) if compiled HTML, catalog, or navigation is out of sync',
    '  --sync-metadata          Update existing knowledge-data.js title from frontmatter when changed',
    '  --skip-register          Do not auto-register unmapped articles into assets/knowledge-data.js',
    '  --skip-navigation        Skip docs/navigation.json synchronization',
    '  --max-media-mb <num>     Override per-file static media limit in MiB (default: 25)',
    '  --pretty                 Pretty-print output JSON with 2-space indentation',
    '  --help, -h               Show this help message'
  ].join('\n'));
}

function parseCliArgs(argv) {
  var args = argv.slice(2);
  var opts = {
    target: null,
    topic: null,
    statusOnly: false,
    dryRun: false,
    checkOnly: false,
    syncMetadata: false,
    skipRegister: false,
    skipNavigation: false,
    maxMediaBytes: undefined,
    pretty: true,
    help: false
  };

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
      continue;
    }
    if (arg === '--status') {
      opts.statusOnly = true;
      continue;
    }
    if (arg === '--dry-run') {
      opts.dryRun = true;
      continue;
    }
    if (arg === '--check') {
      opts.checkOnly = true;
      continue;
    }
    if (arg === '--sync-metadata') {
      opts.syncMetadata = true;
      continue;
    }
    if (arg === '--skip-register') {
      opts.skipRegister = true;
      continue;
    }
    if (arg === '--skip-navigation') {
      opts.skipNavigation = true;
      continue;
    }
    if (arg === '--compact') {
      opts.pretty = false;
      continue;
    }
    if (arg === '--pretty') {
      opts.pretty = true;
      continue;
    }
    if (arg === '--topic') {
      opts.topic = args[++i] || null;
      continue;
    }
    if (arg === '--max-media-mb') {
      var mb = Number(args[++i]);
      if (Number.isFinite(mb) && mb > 0) {
        opts.maxMediaBytes = Math.round(mb * 1024 * 1024);
      }
      continue;
    }
    if (arg === '--repo-root') {
      opts.repoRoot = args[++i];
      continue;
    }
    if (arg.charAt(0) === '-') {
      return { error: 'Unknown option: ' + arg };
    }
    if (!opts.target) {
      opts.target = arg;
    }
  }

  return opts;
}

function main(argv) {
  var parsed = parseCliArgs(argv);
  if (parsed.error) {
    console.error(JSON.stringify({ ok: false, stage: 'cli_args', error: parsed.error }, null, 2));
    return 2;
  }
  if (parsed.help) {
    printHelp();
    return 0;
  }
  if (!parsed.target) {
    console.error('Error: missing <slug> or posts/<slug>/article.md');
    printHelp();
    return 2;
  }

  var result = publisher.publishArticle(parsed.target, {
    repoRoot: parsed.repoRoot,
    topic: parsed.topic,
    statusOnly: parsed.statusOnly,
    dryRun: parsed.dryRun,
    checkOnly: parsed.checkOnly,
    syncMetadata: parsed.syncMetadata,
    skipRegister: parsed.skipRegister,
    skipNavigation: parsed.skipNavigation,
    maxMediaBytes: parsed.maxMediaBytes
  });

  var jsonText = JSON.stringify(result, null, parsed.pretty ? 2 : 0);
  if (result.ok) {
    console.log(jsonText);
    return 0;
  }
  console.error(jsonText);
  return 1;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = {
  parseCliArgs: parseCliArgs,
  main: main
};

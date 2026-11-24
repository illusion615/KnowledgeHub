#!/usr/bin/env node
// tools/html-to-markdown-article.js
// CLI & programmatic entry for Study Room HTML -> Genesis Extended Markdown 1:1 Reverse Compiler.
// Usage:
//   node tools/html-to-markdown-article.js --all                # Convert all legacy posts/<slug>/index.html -> article.md (skipping protected native MDs)
//   node tools/html-to-markdown-article.js --slug <slug>        # Convert one post directory
//   node tools/html-to-markdown-article.js <in.html> --out <out.md>
//   node tools/html-to-markdown-article.js --verify             # Dry-run compile check across all posts/*/article.md via Genesis compiler

'use strict';

var fs = require('fs');
var path = require('path');
var reverseCompiler = require('./html-to-markdown');
var genesisCompiler = require('./markdown-compiler');

var REPO_ROOT = path.resolve(__dirname, '..');
var POSTS_DIR = path.join(REPO_ROOT, 'posts');

function printHelp() {
  console.log([
    'Usage:',
    '  node tools/html-to-markdown-article.js --all [--force-non-protected] [--verify]',
    '  node tools/html-to-markdown-article.js --slug <slug> [--out <path.md>]',
    '  node tools/html-to-markdown-article.js <input.html> [--out <output.md>]',
    '  node tools/html-to-markdown-article.js --verify',
    '',
    'Protected native Markdown articles (never overwritten):',
    '  - ' + Object.keys(reverseCompiler.PROTECTED_NATIVE_SLUGS).join('\n  - ')
  ].join('\n'));
}

function convertPostSlug(slug, treeMap, options) {
  var opts = options || {};
  if (reverseCompiler.PROTECTED_NATIVE_SLUGS[slug] && !opts.outPath) {
    return { slug: slug, skipped: true, reason: 'protected-native-md' };
  }

  var articleDir = path.join(POSTS_DIR, slug);
  var htmlPath = path.join(articleDir, 'index.html');
  var mdPath = opts.outPath ? path.resolve(opts.outPath) : path.join(articleDir, 'article.md');

  if (!fs.existsSync(htmlPath)) {
    throw new Error('HTML file not found: ' + htmlPath);
  }

  if (fs.existsSync(mdPath) && !opts.overwrite && !opts.outPath) {
    return { slug: slug, skipped: true, reason: 'existing-article-md' };
  }

  var html = fs.readFileSync(htmlPath, 'utf8');
  var converted = reverseCompiler.convertHtmlArticleToMarkdown(html, {
    slug: slug,
    articleDir: articleDir,
    treeMeta: treeMap[slug] || {}
  });

  // In-memory Genesis round-trip dry-run verification before writing!
  var compiled = genesisCompiler.compileMarkdownToHtml(converted.markdown, {
    baseDir: articleDir
  });
  var contract = genesisCompiler.verifyCompiledHtmlContract(compiled.html);
  if (!contract.ok) {
    throw new Error('Round-trip contract check failed for ' + slug + ': ' + contract.errors.join('; '));
  }

  if (!opts.dryRun) {
    fs.writeFileSync(mdPath, converted.markdown, 'utf8');
  }

  return {
    slug: slug,
    skipped: false,
    mdPath: mdPath,
    sectionCount: compiled.stats.sectionCount,
    hasMath: compiled.stats.hasMath,
    hasMermaid: compiled.stats.hasMermaid,
    sandboxCount: compiled.stats.sandboxCount
  };
}

function convertAllPosts(options) {
  var opts = options || {};
  var treeMap = reverseCompiler.loadKnowledgeTreeMap(REPO_ROOT);
  var slugs = fs.readdirSync(POSTS_DIR)
    .filter(function (d) {
      return fs.statSync(path.join(POSTS_DIR, d)).isDirectory() &&
        fs.existsSync(path.join(POSTS_DIR, d, 'index.html'));
    })
    .sort();

  var summary = {
    total: slugs.length,
    converted: 0,
    skippedProtected: 0,
    skippedExisting: 0,
    errors: [],
    results: []
  };

  slugs.forEach(function (slug) {
    try {
      var res = convertPostSlug(slug, treeMap, {
        overwrite: Boolean(opts.overwrite),
        dryRun: Boolean(opts.dryRun)
      });
      summary.results.push(res);
      if (res.skipped) {
        if (res.reason === 'protected-native-md') summary.skippedProtected++;
        else summary.skippedExisting++;
      } else {
        summary.converted++;
      }
    } catch (err) {
      summary.errors.push({ slug: slug, error: err.message || String(err) });
    }
  });

  return summary;
}

function verifyAllMarkdownArticles() {
  var slugs = fs.readdirSync(POSTS_DIR)
    .filter(function (d) {
      return fs.existsSync(path.join(POSTS_DIR, d, 'article.md'));
    })
    .sort();

  var failures = [];
  slugs.forEach(function (slug) {
    var mdPath = path.join(POSTS_DIR, slug, 'article.md');
    try {
      var raw = fs.readFileSync(mdPath, 'utf8');
      var res = genesisCompiler.compileMarkdownToHtml(raw, {
        baseDir: path.dirname(mdPath)
      });
      var contract = genesisCompiler.verifyCompiledHtmlContract(res.html);
      if (!contract.ok) {
        failures.push({ slug: slug, errors: contract.errors });
      } else if (res.stats.sectionCount < 1) {
        failures.push({ slug: slug, errors: ['Zero compiled sections'] });
      }
    } catch (err) {
      failures.push({ slug: slug, errors: [err.message || String(err)] });
    }
  });

  return {
    totalChecked: slugs.length,
    ok: failures.length === 0,
    failures: failures
  };
}

function main(argv) {
  var args = argv.slice(2);
  if (args.length === 0 || args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1) {
    printHelp();
    return 0;
  }

  var allMode = false;
  var verifyMode = false;
  var overwrite = false;
  var dryRun = false;
  var targetSlug = null;
  var inputPath = null;
  var outPath = null;

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--all') allMode = true;
    else if (arg === '--verify') verifyMode = true;
    else if (arg === '--overwrite' || arg === '--force-non-protected') overwrite = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--slug') targetSlug = args[++i];
    else if (arg === '--out' || arg === '-o') outPath = args[++i];
    else if (!inputPath && arg.charAt(0) !== '-') inputPath = arg;
  }

  if (allMode) {
    var sum = convertAllPosts({ overwrite: overwrite, dryRun: dryRun });
    if (sum.errors.length > 0) {
      console.error('Reverse compilation encountered ' + sum.errors.length + ' error(s):');
      sum.errors.forEach(function (e) {
        console.error('  - ' + e.slug + ': ' + e.error);
      });
      return 1;
    }
    console.log(
      'Reverse compiled ' + sum.converted + ' article(s) (' +
      sum.skippedProtected + ' protected native MDs preserved, ' +
      sum.skippedExisting + ' existing skipped).'
    );
  } else if (targetSlug) {
    var treeMap = reverseCompiler.loadKnowledgeTreeMap(REPO_ROOT);
    var single = convertPostSlug(targetSlug, treeMap, {
      overwrite: true,
      outPath: outPath,
      dryRun: dryRun
    });
    if (single.skipped) {
      console.log('Skipped ' + targetSlug + ' (' + single.reason + ')');
    } else {
      console.log('Converted posts/' + targetSlug + '/index.html -> ' + path.relative(REPO_ROOT, single.mdPath) + ' (' + single.sectionCount + ' sections)');
    }
  } else if (inputPath) {
    var absIn = path.resolve(inputPath);
    var htmlRaw = fs.readFileSync(absIn, 'utf8');
    var inferredSlug = path.basename(path.dirname(absIn));
    var tMap = reverseCompiler.loadKnowledgeTreeMap(REPO_ROOT);
    var conv = reverseCompiler.convertHtmlArticleToMarkdown(htmlRaw, {
      slug: inferredSlug,
      articleDir: path.dirname(absIn),
      treeMeta: tMap[inferredSlug] || {}
    });
    if (outPath) {
      var absOut = path.resolve(outPath);
      fs.mkdirSync(path.dirname(absOut), { recursive: true });
      fs.writeFileSync(absOut, conv.markdown, 'utf8');
      console.log('Wrote ' + path.relative(REPO_ROOT, absOut));
    } else {
      process.stdout.write(conv.markdown);
    }
  }

  if (verifyMode) {
    var v = verifyAllMarkdownArticles();
    if (!v.ok) {
      console.error('Verification failed on ' + v.failures.length + ' article(s):');
      v.failures.forEach(function (f) {
        console.error('  - ' + f.slug + ': ' + f.errors.join('; '));
      });
      return 1;
    }
    console.log('Verified all ' + v.totalChecked + ' posts/*/article.md files: 100% pass Genesis compile & 14-gate contract check.');
  }

  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = {
  PROTECTED_NATIVE_SLUGS: reverseCompiler.PROTECTED_NATIVE_SLUGS,
  convertHtmlArticleToMarkdown: reverseCompiler.convertHtmlArticleToMarkdown,
  convertPostSlug: convertPostSlug,
  convertAllPosts: convertAllPosts,
  verifyAllMarkdownArticles: verifyAllMarkdownArticles,
  main: main
};

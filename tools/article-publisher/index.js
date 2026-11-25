// tools/article-publisher/index.js
// Modular single-article static publishing pipeline for Study Room (Knowledge Hub).
// Compiles `posts/<slug>/article.md` -> `posts/<slug>/index.html`, audits media sizes,
// idempotently registers/updates `assets/knowledge-data.js`, syncs `docs/navigation.json`,
// runs all 14 `tests/validate.js` static gates, and emits a Release-Engineer-ready JSON manifest.

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var childProcess = require('child_process');
var compiler = require('../markdown-compiler');
var syncNav = require('../sync-docs-navigation');
var mediaGuard = require('./media-guard');
var catalogRegistry = require('./catalog-registry');
var statusInspector = require('./status-inspector');

var ALL_FOURTEEN_CHECKS = [
  'knowledge', 'scripts', 'inline-styles', 'inline-js', 'assets', 'css',
  'structure', 'quotes', 'gap', 'surface', 'i18n', 'density', 'citations', 'customizations'
];

function sha256Text(text) {
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function runValidateGates(repoRoot, slug) {
  var validateScript = path.join(repoRoot, 'tests', 'validate.js');
  if (!fs.existsSync(validateScript)) {
    return { ok: true, skipped: true, checksRun: [], exitCode: 0, summary: 'tests/validate.js not present in workspace' };
  }
  var args = [validateScript, '--article', slug, '--checks', ALL_FOURTEEN_CHECKS.join(',')];
  var res = childProcess.spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  var combined = ((res.stdout || '') + '\n' + (res.stderr || '')).replace(/\x1b\[[0-9;]*m/g, '');
  var failLines = combined.split('\n').map(function (l) { return l.trim(); }).filter(function (l) {
    return l.indexOf('FAIL ') === 0;
  });
  return {
    ok: res.status === 0,
    skipped: false,
    exitCode: res.status === null ? 1 : res.status,
    checksCount: ALL_FOURTEEN_CHECKS.length,
    checksRun: ALL_FOURTEEN_CHECKS.slice(),
    failures: failLines,
    summary: res.status === 0
      ? 'Passed all 14 static validation checks for ' + slug
      : 'Failed validate.js (' + failLines.length + ' failure(s))'
  };
}

function publishArticle(input, options) {
  var opts = options || {};
  var target = statusInspector.resolveArticleTarget(input, opts.repoRoot);
  if (!target.ok) {
    return {
      schema: 'study_room.article_publish_manifest.v1',
      ok: false,
      stage: 'resolve_target',
      error: target.error
    };
  }

  if (opts.statusOnly) {
    return statusInspector.inspectArticleStatus(target, opts);
  }

  var root = target.repoRoot;
  if (!fs.existsSync(target.articleDir)) {
    return {
      schema: 'study_room.article_publish_manifest.v1',
      ok: false,
      slug: target.slug,
      stage: 'resolve_target',
      error: 'Article directory not found: posts/' + target.slug
    };
  }

  // 1. Media size & private raw master guardrail (>25MB .wav blocked before compilation/commit)
  var mediaAudit = mediaGuard.auditArticleMedia(target.articleDir, root, {
    maxFileBytes: opts.maxMediaBytes
  });
  if (!mediaAudit.ok) {
    return {
      schema: 'study_room.article_publish_manifest.v1',
      ok: false,
      slug: target.slug,
      stage: 'media_guard',
      error: mediaAudit.violations.map(function (v) { return v.message; }).join('; '),
      mediaAudit: {
        ok: false,
        maxFileBytes: mediaAudit.maxFileBytes,
        violations: mediaAudit.violations,
        warnings: mediaAudit.warnings
      }
    };
  }

  var hasMarkdown = fs.existsSync(target.markdownPath);
  var hasHtml = fs.existsSync(target.htmlPath);
  if (!hasMarkdown && !hasHtml) {
    return {
      schema: 'study_room.article_publish_manifest.v1',
      ok: false,
      slug: target.slug,
      stage: 'compile',
      error: 'Neither article.md nor index.html found in posts/' + target.slug
    };
  }

  var filesModified = [];
  var filesUnchanged = [];
  var compiledMeta = {};
  var compileStats = null;
  var htmlChanged = false;

  // 2. Genesis static compilation (article.md -> index.html)
  if (hasMarkdown) {
    var rawMd = fs.readFileSync(target.markdownPath, 'utf8');
    var compiled = compiler.compileMarkdownToHtml(rawMd, { baseDir: target.articleDir });
    var contract = compiler.verifyCompiledHtmlContract(compiled.html);
    if (!contract.ok) {
      return {
        schema: 'study_room.article_publish_manifest.v1',
        ok: false,
        slug: target.slug,
        stage: 'compile_contract',
        error: 'Compiled HTML failed static contract: ' + contract.errors.join('; '),
        contractErrors: contract.errors
      };
    }
    compiledMeta = compiled.meta || {};
    compileStats = compiled.stats;
    var existingHtml = hasHtml ? fs.readFileSync(target.htmlPath, 'utf8').replace(/\r\n/g, '\n') : null;
    htmlChanged = existingHtml !== compiled.html;
    if (htmlChanged && !opts.dryRun && !opts.checkOnly) {
      fs.writeFileSync(target.htmlPath, compiled.html, 'utf8');
    }
    if (htmlChanged) {
      filesModified.push(target.relHtmlPath);
    } else {
      filesUnchanged.push(target.relHtmlPath);
    }
  }

  // 3. Idempotent knowledge-data.js topic registration & verification
  var kdRel = 'assets/knowledge-data.js';
  var kdAbs = path.join(root, kdRel);
  var catalogRes = { ok: true, action: 'skipped', changed: false, node: null };
  if (fs.existsSync(kdAbs)) {
    catalogRes = catalogRegistry.ensureCatalogRegistration(root, target.slug, compiledMeta, {
      topic: opts.topic,
      syncMetadata: Boolean(opts.syncMetadata),
      skipRegister: Boolean(opts.skipRegister),
      dryRun: Boolean(opts.dryRun || opts.checkOnly)
    });
    if (!catalogRes.ok) {
      return {
        schema: 'study_room.article_publish_manifest.v1',
        ok: false,
        slug: target.slug,
        stage: 'catalog_registry',
        error: catalogRes.error
      };
    }
    if (catalogRes.changed) {
      filesModified.push(kdRel);
    } else {
      filesUnchanged.push(kdRel);
    }
  }

  // 4. Sync docs/navigation.json if present in workspace
  var navRel = 'docs/navigation.json';
  var navAbs = path.join(root, navRel);
  var navChanged = false;
  if (fs.existsSync(kdAbs) && !opts.skipNavigation) {
    var prevNav = fs.existsSync(navAbs) ? fs.readFileSync(navAbs, 'utf8') : '';
    if (!opts.dryRun && !opts.checkOnly && root === path.resolve(__dirname, '..', '..')) {
      syncNav.main(['node', 'sync-docs-navigation.js']);
      var afterNav = fs.existsSync(navAbs) ? fs.readFileSync(navAbs, 'utf8') : '';
      navChanged = prevNav !== afterNav;
    } else if (!opts.dryRun && !opts.checkOnly && fs.existsSync(path.join(root, 'posts'))) {
      // Isolated test workspace: build minimal navigation manifest if docs/ exists
      if (fs.existsSync(path.dirname(navAbs))) {
        var minimalNav = JSON.stringify({
          version: 1,
          nodes: [{ id: 'art-' + target.slug, title: target.slug, order: 1, path: target.relMarkdownPath }]
        }, null, 2) + '\n';
        navChanged = prevNav !== minimalNav;
        if (navChanged) fs.writeFileSync(navAbs, minimalNav, 'utf8');
      }
    } else if (catalogRes.changed || !prevNav || (hasMarkdown && prevNav.indexOf('"' + target.relMarkdownPath + '"') === -1)) {
      navChanged = true;
    }
    if (navChanged) {
      filesModified.push(navRel);
    } else if (fs.existsSync(navAbs)) {
      filesUnchanged.push(navRel);
    }
  }

  if (opts.checkOnly && (htmlChanged || catalogRes.changed || navChanged)) {
    return {
      schema: 'study_room.article_publish_manifest.v1',
      ok: false,
      slug: target.slug,
      mode: 'check',
      stage: 'drift_check',
      error: 'Publish artifacts are out of sync and require running publish-article without --check.',
      pendingFiles: filesModified
    };
  }

  // 5. Run all 14 static validation gates via tests/validate.js
  var validation = {
    ok: true,
    skipped: Boolean(opts.dryRun && !fs.existsSync(target.htmlPath)),
    checksCount: ALL_FOURTEEN_CHECKS.length,
    checksRun: ALL_FOURTEEN_CHECKS.slice(),
    failures: [],
    summary: opts.dryRun && !fs.existsSync(target.htmlPath)
      ? 'Skipped disk validate.js in --dry-run before initial index.html write (in-memory contract passed)'
      : ''
  };
  if (!opts.skipValidate && (!opts.dryRun || fs.existsSync(target.htmlPath))) {
    validation = runValidateGates(root, target.slug);
    if (!validation.ok) {
      return {
        schema: 'study_room.article_publish_manifest.v1',
        ok: false,
        slug: target.slug,
        mode: opts.dryRun ? 'dry-run' : 'publish',
        stage: 'validate_gates',
        error: validation.summary,
        validation: validation,
        filesModified: filesModified
      };
    }
  }

  var finalMedia = mediaGuard.collectArticleFiles(target.articleDir, root);
  var publishableArticleFiles = finalMedia.map(function (f) { return f.relPath; });
  if (opts.dryRun && hasMarkdown && publishableArticleFiles.indexOf(target.relHtmlPath) === -1) {
    publishableArticleFiles.push(target.relHtmlPath);
    publishableArticleFiles.sort();
  }

  var releaseStagePaths = publishableArticleFiles.slice();
  if (filesModified.indexOf(kdRel) !== -1 && releaseStagePaths.indexOf(kdRel) === -1) {
    releaseStagePaths.push(kdRel);
  }
  if (filesModified.indexOf(navRel) !== -1 && releaseStagePaths.indexOf(navRel) === -1) {
    releaseStagePaths.push(navRel);
  }

  var htmlSha = fs.existsSync(target.htmlPath)
    ? sha256Text(fs.readFileSync(target.htmlPath, 'utf8'))
    : null;

  return {
    schema: 'study_room.article_publish_manifest.v1',
    ok: true,
    slug: target.slug,
    mode: opts.dryRun ? 'dry-run' : (opts.checkOnly ? 'check' : 'publish'),
    state: opts.dryRun && filesModified.length > 0 ? 'dry_run_ready' : 'published',
    article: {
      slug: target.slug,
      sourceMarkdown: hasMarkdown ? target.relMarkdownPath : null,
      outputHtml: target.relHtmlPath,
      outputHtmlSha256: htmlSha,
      topicId: catalogRes.node ? catalogRes.node.parentId : (opts.topic || null),
      catalogAction: catalogRes.action,
      compileStats: compileStats
    },
    mediaAudit: {
      ok: mediaAudit.ok,
      maxFileBytes: mediaAudit.maxFileBytes,
      totalFiles: mediaAudit.totalFiles,
      totalBytes: mediaAudit.totalBytes,
      warnings: mediaAudit.warnings
    },
    validation: validation,
    releaseEngineerPayload: {
      commitScope: 'article(' + target.slug + ')',
      suggestedCommitMessage: 'publish(' + target.slug + '): compile static article and sync catalog index',
      filesModified: filesModified,
      filesUnchanged: filesUnchanged,
      articleBundleFiles: publishableArticleFiles,
      gitAddPaths: releaseStagePaths
    }
  };
}

module.exports = {
  ALL_FOURTEEN_CHECKS: ALL_FOURTEEN_CHECKS,
  resolveArticleTarget: statusInspector.resolveArticleTarget,
  inspectArticleStatus: statusInspector.inspectArticleStatus,
  publishArticle: publishArticle
};

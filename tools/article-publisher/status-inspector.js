// tools/article-publisher/status-inspector.js
// Resolves article slug/path targets and computes publication sync state (`unpublished` /
// `published` / `modified_pending_sync` / `missing`) without mutating disk files.

'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var compiler = require('../markdown-compiler');
var mediaGuard = require('./media-guard');
var catalogRegistry = require('./catalog-registry');

function resolveArticleTarget(input, repoRoot) {
  var root = path.resolve(repoRoot || path.join(__dirname, '..', '..'));
  var raw = String(input || '').trim();
  if (!raw) {
    return { ok: false, error: 'Missing article <slug> or posts/<slug>/article.md argument.' };
  }

  var normalized = raw.replace(/\\/g, '/').replace(/\/+$/, '');
  var slug = null;

  var mdMatch = normalized.match(/(?:^|\/)posts\/([a-z0-9][a-z0-9-]*)\/article\.md$/i);
  var dirMatch = normalized.match(/(?:^|\/)posts\/([a-z0-9][a-z0-9-]*)(?:\/index\.html)?$/i);

  if (mdMatch) {
    slug = mdMatch[1];
  } else if (dirMatch) {
    slug = dirMatch[1];
  } else if (/^[a-z0-9][a-z0-9-]*$/i.test(normalized)) {
    slug = normalized;
  } else {
    var absCandidate = path.resolve(root, raw);
    var relCandidate = path.relative(root, absCandidate).split(path.sep).join('/');
    var relMatch = relCandidate.match(/^posts\/([a-z0-9][a-z0-9-]*)(?:\/(?:article\.md|index\.html))?$/i);
    if (relMatch) slug = relMatch[1];
  }

  if (!slug) {
    return { ok: false, error: 'Cannot resolve article slug from input: ' + raw };
  }

  var articleDir = path.join(root, 'posts', slug);
  return {
    ok: true,
    repoRoot: root,
    slug: slug,
    articleDir: articleDir,
    markdownPath: path.join(articleDir, 'article.md'),
    htmlPath: path.join(articleDir, 'index.html'),
    relMarkdownPath: 'posts/' + slug + '/article.md',
    relHtmlPath: 'posts/' + slug + '/index.html'
  };
}

function queryGitDirtyPaths(repoRoot, candidateRelPaths) {
  var dirty = new Set();
  try {
    var out = childProcess.execFileSync(
      'git',
      ['status', '--porcelain', '--'].concat(candidateRelPaths),
      { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    out.split('\n').forEach(function (line) {
      if (!line || line.length < 4) return;
      var rel = line.slice(3).trim().replace(/^"(.*)"$/, '$1');
      if (rel) dirty.add(rel);
    });
  } catch (_err) {
    // Non-git temp directory fallback
  }
  return dirty;
}

function inspectArticleStatus(target, options) {
  var opts = options || {};
  var root = target.repoRoot;
  var hasMarkdown = fs.existsSync(target.markdownPath);
  var hasHtml = fs.existsSync(target.htmlPath);
  var kdPath = path.join(root, 'assets', 'knowledge-data.js');
  var navPath = path.join(root, 'docs', 'navigation.json');

  var catalog = fs.existsSync(kdPath)
    ? catalogRegistry.loadKnowledgeCatalog(kdPath)
    : { articlesBySlug: {}, articlesById: {}, topics: {} };
  var catalogNode = catalog.articlesBySlug[target.slug] || catalog.articlesById[target.slug] || null;
  var isCatalogRegistered = Boolean(catalogNode);

  var htmlOutOfSync = false;
  var contractCheck = { ok: true, errors: [] };

  if (hasMarkdown) {
    var rawMd = fs.readFileSync(target.markdownPath, 'utf8');
    var compiledResult = compiler.compileMarkdownToHtml(rawMd, { baseDir: target.articleDir });
    contractCheck = compiler.verifyCompiledHtmlContract(compiledResult.html);
    if (!hasHtml) {
      htmlOutOfSync = true;
    } else {
      var diskHtml = fs.readFileSync(target.htmlPath, 'utf8').replace(/\r\n/g, '\n');
      htmlOutOfSync = diskHtml !== compiledResult.html;
    }
  }

  var mediaAudit = mediaGuard.auditArticleMedia(target.articleDir, root, {
    maxFileBytes: opts.maxMediaBytes
  });

  var articleRelFiles = mediaAudit.files.map(function (f) { return f.relPath; });
  var supportDocPaths = articleRelFiles.filter(function (rel) {
    if (rel === target.relMarkdownPath) return false;
    var ext = path.extname(rel).toLowerCase();
    return ext === '.md' || ext === '.mdx' || ext === '.rst' || ext === '.adoc';
  });

  var navRegistered = false;
  var missingNavDocs = [];
  if (fs.existsSync(navPath)) {
    var navText = fs.readFileSync(navPath, 'utf8');
    var expectedNavPaths = hasMarkdown ? [target.relMarkdownPath].concat(supportDocPaths) : supportDocPaths.slice();
    expectedNavPaths.forEach(function (docRel) {
      if (navText.indexOf('"' + docRel + '"') === -1) {
        missingNavDocs.push(docRel);
      }
    });
    navRegistered = expectedNavPaths.length === 0 ? true : missingNavDocs.length === 0;
  }
  var gitDirtySet = queryGitDirtyPaths(root, ['posts/' + target.slug, 'assets/knowledge-data.js', 'docs/navigation.json']);
  var dirtyArticleFiles = Array.from(gitDirtySet).filter(function (p) {
    return p.indexOf('posts/' + target.slug + '/') === 0 || p === 'posts/' + target.slug;
  });

  var reasons = [];
  var state = 'published';

  if (!hasMarkdown && !hasHtml) {
    state = 'missing';
    reasons.push('neither article.md nor index.html exists under posts/' + target.slug);
  } else if (!hasHtml || !isCatalogRegistered) {
    state = 'unpublished';
    if (!hasHtml) reasons.push('compiled static index.html does not exist yet');
    if (!isCatalogRegistered) reasons.push('article node is not registered in assets/knowledge-data.js');
    if ((hasMarkdown || supportDocPaths.length > 0) && !navRegistered) {
      reasons.push('docs/navigation.json is missing ' + missingNavDocs.join(', '));
    }
  } else if (htmlOutOfSync || ((hasMarkdown || supportDocPaths.length > 0) && !navRegistered) || dirtyArticleFiles.length > 0) {
    state = 'modified_pending_sync';
    if (htmlOutOfSync) reasons.push('article.md has uncompiled changes relative to index.html');
    if ((hasMarkdown || supportDocPaths.length > 0) && !navRegistered) {
      reasons.push('docs/navigation.json is missing ' + missingNavDocs.join(', '));
    }
    if (dirtyArticleFiles.length > 0) reasons.push('working tree has uncommitted changes: ' + dirtyArticleFiles.join(', '));
  }

  return {
    schema: 'study_room.article_publish_status.v1',
    ok: state !== 'missing' && contractCheck.ok && mediaAudit.ok,
    slug: target.slug,
    state: state,
    reasons: reasons,
    hasMarkdown: hasMarkdown,
    hasHtml: hasHtml,
    htmlInSync: hasHtml && !htmlOutOfSync,
    catalogRegistered: isCatalogRegistered,
    topicId: catalogNode ? catalogNode.parentId : null,
    navigationRegistered: navRegistered,
    contractOk: contractCheck.ok,
    contractErrors: contractCheck.errors,
    mediaAudit: {
      ok: mediaAudit.ok,
      maxFileBytes: mediaAudit.maxFileBytes,
      totalFiles: mediaAudit.totalFiles,
      totalBytes: mediaAudit.totalBytes,
      violations: mediaAudit.violations,
      warnings: mediaAudit.warnings
    },
    articleFiles: articleRelFiles,
    gitDirtyFiles: dirtyArticleFiles
  };
}

module.exports = {
  resolveArticleTarget: resolveArticleTarget,
  queryGitDirtyPaths: queryGitDirtyPaths,
  inspectArticleStatus: inspectArticleStatus
};

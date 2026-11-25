// tools/article-publisher/media-guard.js
// Audits an article directory for oversized or raw studio master files (e.g. >25MB .wav)
// before publishing to the public static Knowledge Hub repository.

'use strict';

var fs = require('fs');
var path = require('path');

var DEFAULT_MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MiB hard ceiling
var RAW_AUDIO_WARN_BYTES = 5 * 1024 * 1024;    // 5 MiB warning for uncompressed audio

var IGNORED_ENTRIES = {
  '.DS_Store': true,
  'node_modules': true
};

var UNCOMPRESSED_MASTER_EXTS = {
  '.wav': true,
  '.aiff': true,
  '.aif': true,
  '.pcm': true,
  '.raw': true,
  '.bmp': true,
  '.psd': true,
  '.mov': true
};

function formatMegabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function collectArticleFiles(articleDir, repoRoot) {
  var results = [];
  if (!fs.existsSync(articleDir)) return results;

  function walk(curDir) {
    var entries = fs.readdirSync(curDir, { withFileTypes: true }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    for (var i = 0; i < entries.length; i++) {
      var ent = entries[i];
      if (ent.name.charAt(0) === '.' || IGNORED_ENTRIES[ent.name]) continue;
      var abs = path.join(curDir, ent.name);
      var stat = fs.lstatSync(abs);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        walk(abs);
      } else if (stat.isFile()) {
        var relToRepo = path.relative(repoRoot, abs).split(path.sep).join('/');
        var relToArticle = path.relative(articleDir, abs).split(path.sep).join('/');
        results.push({
          absPath: abs,
          relPath: relToRepo,
          articleRelPath: relToArticle,
          ext: path.extname(ent.name).toLowerCase(),
          bytes: stat.size
        });
      }
    }
  }

  walk(articleDir);
  return results;
}

function auditArticleMedia(articleDir, repoRoot, options) {
  var opts = options || {};
  var maxFileBytes = typeof opts.maxFileBytes === 'number' && opts.maxFileBytes > 0
    ? opts.maxFileBytes
    : DEFAULT_MAX_FILE_BYTES;
  var files = collectArticleFiles(articleDir, repoRoot);
  var violations = [];
  var warnings = [];
  var totalBytes = 0;

  files.forEach(function (file) {
    totalBytes += file.bytes;
    var isMasterExt = Boolean(UNCOMPRESSED_MASTER_EXTS[file.ext]);

    if (file.bytes > maxFileBytes) {
      violations.push({
        code: isMasterExt ? 'oversized_uncompressed_master' : 'oversized_static_asset',
        path: file.relPath,
        bytes: file.bytes,
        limitBytes: maxFileBytes,
        ext: file.ext,
        message: file.relPath + ' (' + formatMegabytes(file.bytes) + ') exceeds static hub limit (' +
          formatMegabytes(maxFileBytes) + ')' +
          (isMasterExt
            ? '; transcode private studio master (' + file.ext + ') to compressed .mp3/.m4a/.mp4/.webp and keep raw masters under private/'
            : '; compress asset before static publication')
      });
      return;
    }

    if (isMasterExt && file.bytes > RAW_AUDIO_WARN_BYTES) {
      warnings.push({
        code: 'uncompressed_master_warning',
        path: file.relPath,
        bytes: file.bytes,
        ext: file.ext,
        message: file.relPath + ' (' + formatMegabytes(file.bytes) + ') is an uncompressed ' + file.ext +
          ' file; prefer compressed .mp3/.m4a/.mp4 for faster GitHub Pages delivery'
      });
    }
  });

  return {
    ok: violations.length === 0,
    maxFileBytes: maxFileBytes,
    totalFiles: files.length,
    totalBytes: totalBytes,
    files: files,
    violations: violations,
    warnings: warnings
  };
}

module.exports = {
  DEFAULT_MAX_FILE_BYTES: DEFAULT_MAX_FILE_BYTES,
  formatMegabytes: formatMegabytes,
  collectArticleFiles: collectArticleFiles,
  auditArticleMedia: auditArticleMedia
};

// tools/markdown-compiler/index.js
// Main entry point for the Study Room Genesis Static Markdown Compiler.
// Zero backend dependencies; outputs 100% self-contained GitHub Pages static HTML.

'use strict';

var fs = require('fs');
var path = require('path');
var fm = require('./frontmatter');
var sectionCompiler = require('./section-compiler');
var template = require('./template');

function compileMarkdownToHtml(markdownText, options) {
  var opts = options || {};
  var raw = String(markdownText || '').replace(/\r\n/g, '\n');
  var parsed = fm.parseFrontmatter(raw);
  var state = {
    baseDir: opts.baseDir || process.cwd(),
    tokens: [],
    hasMath: false,
    hasMermaid: false,
    sandboxes: [],
    sandboxStyles: [],
    sandboxScripts: []
  };

  var chaptersData = sectionCompiler.compileAllChapters(parsed.body, state);
  var html = template.buildFullHtmlDocument(parsed.meta, chaptersData, raw, state, opts);

  return {
    html: html,
    meta: parsed.meta,
    chapters: chaptersData.chapters.map(function (c) { return c.ctx; }),
    stats: {
      sectionCount: chaptersData.chapters.length,
      hasMath: state.hasMath,
      hasMermaid: state.hasMermaid,
      sandboxCount: state.sandboxes.length
    }
  };
}

function compileMarkdownFile(inputPath, outputPath, options) {
  var absIn = path.resolve(inputPath);
  var raw = fs.readFileSync(absIn, 'utf8');
  var mergedOpts = Object.assign({ baseDir: path.dirname(absIn) }, options || {});
  var result = compileMarkdownToHtml(raw, mergedOpts);
  if (outputPath) {
    var absOut = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, result.html, 'utf8');
  }
  return result;
}

// Static contract self-validator (mirrors all 14 checks in tests/validate.js on any compiled HTML string)
function verifyCompiledHtmlContract(html) {
  var errors = [];
  var requiredCss = ['article.css', 'scrollbar.css', 'article-narration.css', 'article-diagram.css'];
  requiredCss.forEach(function (cssName) {
    if (html.indexOf(cssName) === -1) {
      errors.push('Missing stylesheet: ' + cssName);
    }
  });

  if (html.indexOf('class="home-link"') === -1) {
    errors.push('Missing .home-link');
  }
  if (html.indexOf('[data-theme="dark"]') === -1) {
    errors.push('Missing [data-theme="dark"] rule');
  }

  // Script order check
  var requiredScripts = [
    'article-common.js',
    'article-presentation.js',
    'scrollbar.js',
    'article-lightbox.js',
    'article-assistant.js'
  ];
  var scriptPattern = /<script[^>]+src=["']([^"']*assets\/[^"']+)["'][^>]*>/g;
  var foundScripts = [];
  var match;
  while ((match = scriptPattern.exec(html)) !== null) {
    foundScripts.push(match[1].split('/').pop().split('?')[0]);
  }
  requiredScripts.forEach(function (req) {
    if (foundScripts.indexOf(req) === -1) {
      errors.push('Missing required script: ' + req);
    }
  });
  var filteredOrder = foundScripts.filter(function (s) {
    return requiredScripts.indexOf(s) !== -1;
  });
  for (var i = 0; i < requiredScripts.length; i++) {
    if (filteredOrder[i] !== requiredScripts[i]) {
      errors.push('Script order mismatch: ' + filteredOrder.join(' -> '));
      break;
    }
  }

  // No arrow functions in inline scripts
  var inlineScriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = inlineScriptPattern.exec(html)) !== null) {
    var scriptBody = match[1];
    scriptBody.split('\n').forEach(function (line) {
      var stripped = line.replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
      if (/=>/.test(stripped)) {
        errors.push('Arrow function (=>) found in inline script');
      }
    });
  }

  // No unescaped quotes in data-zh / data-en
  html.split('\n').forEach(function (line, idx) {
    if (/data-(zh|en)="[^"]*"[^\s>\/]\S*/.test(line)) {
      errors.push('Unescaped quote in data-zh/data-en at line ' + (idx + 1));
    }
  });

  // No inline style= on HTML elements outside <style> / <script>
  html.split('\n').forEach(function (line, idx) {
    if (line.indexOf('<style') !== -1 || line.indexOf('</style') !== -1) return;
    if (line.indexOf('<script') !== -1 || line.indexOf('</script') !== -1) return;
    if (/<[a-z][^>]*(?<![\w-])style\s*=\s*["']/i.test(line)) {
      errors.push('Inline style= attribute at line ' + (idx + 1));
    }
  });

  return {
    ok: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  compileMarkdownToHtml: compileMarkdownToHtml,
  compileMarkdownFile: compileMarkdownFile,
  verifyCompiledHtmlContract: verifyCompiledHtmlContract
};

#!/usr/bin/env node
// ======================================
// Knowledge Hub — Full Validation Suite
// ======================================
// Run: node tests/validate.js
// Exit 0 = all pass, Exit 1 = failures found
//
// Tests:
//   1. knowledge-data.js syntax + article URL validity
//   2. Article script order & completeness
//   3. No inline style= attributes (except exempted patterns)
//   4. No arrow functions in inline scripts
//   5. CSS/JS file syntax (basic parse check)
//   6. No duplicate CSS selectors for known issues
//   7. Summary zh/en length limits
//   8. No unescaped " in data-zh/data-en attributes
//   9. No local data-present-step sibling-gap override hacks
//  10. Framed visualization steps declare a presentation surface
//  11. Strict bilingual articles localize presentation titles and labels

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var POSTS = path.join(ROOT, 'posts');
var ASSETS = path.join(ROOT, 'assets');

var totalErrors = 0;
var totalWarnings = 0;

// ── Helpers ──

function error(file, msg) {
  totalErrors++;
  console.error('\x1b[31m  FAIL\x1b[0m ' + relPath(file) + ': ' + msg);
}

function warn(file, msg) {
  totalWarnings++;
  console.warn('\x1b[33m  WARN\x1b[0m ' + relPath(file) + ': ' + msg);
}

function pass(msg) {
  console.log('\x1b[32m  PASS\x1b[0m ' + msg);
}

function relPath(absPath) {
  return path.relative(ROOT, absPath);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findArticles() {
  var dirs = fs.readdirSync(POSTS);
  var articles = [];
  dirs.forEach(function (d) {
    var indexPath = path.join(POSTS, d, 'index.html');
    if (fs.existsSync(indexPath)) {
      articles.push({ slug: d, path: indexPath });
    }
  });
  return articles;
}

// ── Test 1: knowledge-data.js ──

function testKnowledgeData() {
  console.log('\n\x1b[36m[1] knowledge-data.js\x1b[0m');
  var filePath = path.join(ASSETS, 'knowledge-data.js');
  var code = readFile(filePath);

  // Syntax check
  try {
    new Function(code);
    pass('JS syntax valid');
  } catch (e) {
    error(filePath, 'JS syntax error: ' + e.message);
    return; // can't proceed
  }

  // Extract knowledgeTree
  var fn = new Function(code + '; return knowledgeTree;');
  var tree;
  try {
    tree = fn();
  } catch (e) {
    error(filePath, 'Cannot evaluate knowledgeTree: ' + e.message);
    return;
  }

  if (!Array.isArray(tree)) {
    error(filePath, 'knowledgeTree is not an array');
    return;
  }

  pass(tree.length + ' nodes found');

  // Check all article URLs point to existing files
  var ids = {};
  var articleCount = 0;
  tree.forEach(function (node) {
    if (ids[node.id]) {
      error(filePath, 'Duplicate id: ' + node.id);
    }
    ids[node.id] = true;

    if (node.type === 'article') {
      articleCount++;
      if (!node.url) {
        error(filePath, 'Article "' + node.id + '" has no url');
        return;
      }
      var articlePath = path.join(ROOT, node.url);
      if (!fs.existsSync(articlePath)) {
        error(filePath, 'Article "' + node.id + '" url "' + node.url + '" file not found');
      }
    }

    // Check parentId references exist (except null for roots)
    if (node.parentId !== null && node.parentId !== undefined) {
      // Defer check to after all nodes collected
    }

    // Summary length check
    if (node.summary) {
      if (node.summary.zh && node.summary.zh.length > 100) {
        warn(filePath, 'Article "' + node.id + '" summary.zh > 100 chars (' + node.summary.zh.length + ')');
      }
      if (node.summary.en && node.summary.en.length > 160) {
        warn(filePath, 'Article "' + node.id + '" summary.en > 160 chars (' + node.summary.en.length + ')');
      }
    }
  });

  // Verify parentId references
  tree.forEach(function (node) {
    if (node.parentId !== null && node.parentId !== undefined && !ids[node.parentId]) {
      error(filePath, 'Node "' + node.id + '" references non-existent parentId "' + node.parentId + '"');
    }
  });

  pass(articleCount + ' articles with valid URLs');
}

// ── Test 2: Article script order & completeness ──

function testArticleScripts() {
  console.log('\n\x1b[36m[2] Article script order & completeness\x1b[0m');
  var articles = findArticles();
  var requiredScripts = [
    'article-common.js',
    'article-presentation.js',
    'scrollbar.js',
    'article-lightbox.js',
    'article-assistant.js'
  ];
  var passCount = 0;

  articles.forEach(function (article) {
    var html = readFile(article.path);

    // Extract all script src references to assets/
    var scriptPattern = /<script[^>]+src=["']([^"']*assets\/[^"']+)["'][^>]*>/g;
    var match;
    var foundScripts = [];
    while ((match = scriptPattern.exec(html)) !== null) {
      var filename = match[1].split('/').pop().split('?')[0];
      foundScripts.push(filename);
    }

    // Check each required script exists
    var missing = [];
    requiredScripts.forEach(function (req) {
      if (foundScripts.indexOf(req) === -1) {
        missing.push(req);
      }
    });

    if (missing.length > 0) {
      error(article.path, 'Missing scripts: ' + missing.join(', '));
      return;
    }

    // Check order: filter to only required scripts, verify relative order
    var requiredFound = foundScripts.filter(function (s) {
      return requiredScripts.indexOf(s) !== -1;
    });

    var orderCorrect = true;
    for (var i = 0; i < requiredScripts.length; i++) {
      if (requiredFound[i] !== requiredScripts[i]) {
        orderCorrect = false;
        break;
      }
    }

    if (!orderCorrect) {
      error(article.path, 'Script order wrong. Expected: ' + requiredScripts.join(' → ') + ' Got: ' + requiredFound.join(' → '));
      return;
    }

    passCount++;
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles have correct scripts');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 3: No inline style= on HTML elements ──

function testInlineStyles() {
  console.log('\n\x1b[36m[3] No inline style= attributes\x1b[0m');
  var articles = findArticles();
  var passCount = 0;

  // Exempt patterns: data visualization, initial hidden state, spacing/overflow tweaks, data-driven colors
  var exemptPatterns = [
    /style=["']display:\s*none/i,                    // initial hidden state
    /style=["']width:\s*[\d.]+%/i,                   // data-driven bar widths
    /style=["']margin-top:\s*\d+px;?\s*["']/i,       // spacing tweaks (legacy)
    /style=["']overflow-x:\s*auto;?\s*["']/i,        // scroll containers
    /style=["']border-color:/i,                       // data-driven borders
    /style=["']background:\s*rgba\(/i,                // data-driven background colors
    /class=["'][^"']*share-wechat/i                   // dynamic content
  ];

  // Exempt articles (data visualization heavy / legacy inline tables)
  var exemptSlugs = ['homepage-architecture-review', 'agentic-skill-execution',
    'calculus-fundamental-theorem', 'calculus-integrals', 'calculus-intro-change',
    'calculus-derivatives', 'calculus-limits', 'claw-code-analysis'];

  articles.forEach(function (article) {
    if (exemptSlugs.indexOf(article.slug) !== -1) {
      passCount++;
      return;
    }

    var html = readFile(article.path);
    var lines = html.split('\n');
    var violations = [];

    lines.forEach(function (line, idx) {
      var lineNum = idx + 1;

      // Skip lines inside <style> or <script> blocks
      // Simple heuristic: ignore lines that don't have < tag attributes
      if (line.indexOf('<style') !== -1 || line.indexOf('</style') !== -1) return;
      if (line.indexOf('<script') !== -1 || line.indexOf('</script') !== -1) return;

      // Look for style= on HTML elements
      var styleMatch = /\bstyle\s*=\s*["']/i;
      if (!styleMatch.test(line)) return;

      // Check if this line is inside a <style> or <script> block content
      // by checking if it looks like actual element attribute
      if (/<[a-z][^>]*\bstyle\s*=\s*["']/i.test(line)) {
        // Check exemptions
        var exempt = exemptPatterns.some(function (p) { return p.test(line); });
        if (!exempt) {
          violations.push(lineNum);
        }
      }
    });

    if (violations.length > 0) {
      error(article.path, violations.length + ' inline style= violation(s) at line(s): ' + violations.slice(0, 5).join(', '));
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles clean');
  } else {
    pass(passCount + '/' + articles.length + ' articles clean');
  }
}

// ── Test 4: No arrow functions in inline scripts ──

function testArrowFunctions() {
  console.log('\n\x1b[36m[4] No arrow functions in inline scripts\x1b[0m');
  var articles = findArticles();
  var passCount = 0;

  articles.forEach(function (article) {
    var html = readFile(article.path);

    // Extract inline script content (between <script> and </script> without src)
    var inlineScriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    var match;
    var arrowFound = false;

    while ((match = inlineScriptPattern.exec(html)) !== null) {
      var scriptContent = match[1];
      // Look for arrow function patterns: () =>, x =>, (x) =>, (x, y) =>
      // But not inside strings or comments
      // Simple heuristic: look for => that isn't inside a quoted string on the same line
      var scriptLines = scriptContent.split('\n');
      scriptLines.forEach(function (line, idx) {
        // Skip single-line comments
        var stripped = line.replace(/\/\/.*$/, '');
        // Skip string literals (simple approximation)
        stripped = stripped.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
        if (/=>/.test(stripped)) {
          arrowFound = true;
        }
      });
    }

    if (arrowFound) {
      error(article.path, 'Arrow function (=>) found in inline script');
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles clean');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 5: Asset JS/CSS syntax check ──

function testAssetSyntax() {
  console.log('\n\x1b[36m[5] Asset JS/CSS syntax\x1b[0m');

  var jsFiles = fs.readdirSync(ASSETS).filter(function (f) {
    return f.endsWith('.js') && f !== 'pptxgen.bundle.js' && f !== 'html2canvas.min.js';
  });

  jsFiles.forEach(function (f) {
    var filePath = path.join(ASSETS, f);
    var code = readFile(filePath);
    try {
      new Function(code);
      pass(f + ' syntax OK');
    } catch (e) {
      error(filePath, 'JS syntax error: ' + e.message);
    }
  });

  // CSS basic check: balanced braces
  var cssFiles = fs.readdirSync(ASSETS).filter(function (f) { return f.endsWith('.css'); });
  cssFiles.forEach(function (f) {
    var filePath = path.join(ASSETS, f);
    var css = readFile(filePath);
    // Strip comments
    var stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
    var opens = (stripped.match(/{/g) || []).length;
    var closes = (stripped.match(/}/g) || []).length;
    if (opens !== closes) {
      error(filePath, 'Unbalanced braces: ' + opens + ' { vs ' + closes + ' }');
    } else {
      pass(f + ' braces balanced (' + opens + ' rules)');
    }
  });
}

// ── Test 6: Known CSS issues ──

function testCSSIssues() {
  console.log('\n\x1b[36m[6] CSS known issues\x1b[0m');
  var cssPath = path.join(ASSETS, 'article.css');
  var css = readFile(cssPath);

  // Check for duplicate .home-link root-level rules
  var homeLinkMatches = css.match(/^\.home-link\s*\{/gm);
  if (homeLinkMatches && homeLinkMatches.length > 1) {
    error(cssPath, 'Duplicate .home-link rule (' + homeLinkMatches.length + ' occurrences)');
  } else {
    pass('No duplicate .home-link');
  }
}

// ── Test 7: Article CSS + home-link ──

function testArticleStructure() {
  console.log('\n\x1b[36m[7] Article structural checks\x1b[0m');
  var articles = findArticles();
  var passCount = 0;

  articles.forEach(function (article) {
    var html = readFile(article.path);
    var issues = [];

    // Check article.css link
    if (html.indexOf('article.css') === -1) {
      issues.push('Missing article.css');
    }

    // Check scrollbar.css link
    if (html.indexOf('scrollbar.css') === -1) {
      issues.push('Missing scrollbar.css');
    }

    // Check narration CSS
    if (html.indexOf('article-narration.css') === -1) {
      issues.push('Missing article-narration.css');
    }

    // Check diagram CSS
    if (html.indexOf('article-diagram.css') === -1) {
      issues.push('Missing article-diagram.css');
    }

    // Check home-link
    if (html.indexOf('class="home-link"') === -1) {
      issues.push('Missing .home-link');
    }

    // Check data-theme="dark" in style block
    if (html.indexOf('[data-theme="dark"]') === -1 && html.indexOf("[data-theme='dark']") === -1) {
      // Only warn — some minimal articles might not need dark overrides
      warn(article.path, 'No [data-theme="dark"] styles found');
    }

    if (issues.length > 0) {
      error(article.path, issues.join('; '));
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles structurally valid');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 8: data-zh/data-en quote safety ──

function testDataAttrQuoteSafety() {
  console.log('\n\x1b[36m[8] data-zh/data-en quote safety\x1b[0m');
  var articles = findArticles();
  var passCount = 0;

  articles.forEach(function (article) {
    var html = readFile(article.path);
    var lines = html.split('\n');
    var violations = [];

    lines.forEach(function (line, idx) {
      var lineNum = idx + 1;

      // If a data-zh/data-en attribute is closed by a quote and immediately followed
      // by a non-whitespace/non-tag-delimiter char, it usually means an unescaped
      // ASCII quote appeared inside the attribute value.
      if (/data-(zh|en)="[^"]*"[^\s>\/]\S*/.test(line)) {
        violations.push(lineNum);
      }
    });

    if (violations.length > 0) {
      error(article.path, 'Unescaped " inside data-zh/data-en attribute at line(s): ' + violations.slice(0, 8).join(', '));
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles pass quote safety check');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 9: data-gap-managed contract (no inline margin overrides) ──

function testGapManagedContract() {
  console.log('\n\x1b[36m[9] data-gap-managed contract\x1b[0m');
  var articles = findArticles();
  var passCount = 0;
  // Match any inline-style rule that targets consecutive [data-present-step]
  // siblings AND sets margin-top to 0 (or 0px / 0rem). That's the exact CSS
  // hack the data-gap-managed attribute now replaces.
  var hackPattern = /\[data-present-step\][^{}]*\+[^{}]*\[data-present-step\][^{}]*\{[^}]*margin-top\s*:\s*0(?:px|rem|em)?\s*[;}\s]/;

  articles.forEach(function (article) {
    var html = readFile(article.path);
    // Only scan inline <style> blocks (shared article.css is allowed to do this).
    var styleBlocks = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
    var offenders = [];
    styleBlocks.forEach(function (block) {
      if (hackPattern.test(block)) {
        offenders.push(block.slice(0, 80).replace(/\s+/g, ' '));
      }
    });
    if (offenders.length > 0) {
      warn(article.path, 'Inline <style> contains `[data-present-step] + [data-present-step] { margin-top: 0 }` override — replace with `data-gap-managed` attribute on the wrapping container (see instructions §0.8).');
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles honor data-gap-managed contract');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 10: visualization presentation-surface contract ──

function testPresentationSurfaceContract() {
  console.log('\n\x1b[36m[10] presentation-surface contract\x1b[0m');
  var articles = findArticles();
  var sharedCss = readFile(path.join(ASSETS, 'article.css')) + '\n' + readFile(path.join(ASSETS, 'article-diagram.css'));
  var chromeProperty = /(?:^|[;\s])(?:background(?:-color)?|border(?:-radius)?|box-shadow|-webkit-backdrop-filter|backdrop-filter)\s*:/i;
  var allowedSurfaces = { unframed: true, board: true };
  // Shared presentation CSS or legacy article runtimes already own these
  // slide surfaces. Keep this list narrow: custom panels must declare a
  // surface regardless of whether their class name contains "panel/card".
  var managedRootClasses = {
    'subsection-item': true,
    'quote-block': true,
    'task-card': true,
    'finding-card': true,
    'phase-step-card': true,
    'layer-row': true,
    'depth-row': true,
    'loop-step': true
  };
  // Exact migration compatibility only. These pre-contract components have
  // bespoke presentation runtimes or intentionally framed table/work boards.
  // Do not add new components here; new code must declare its surface.
  var legacyRootExemptions = {
    'posts/claw-code-mcp-hardening/index.html': { 'lc-flow': true },
    'posts/claw-code-runtime-anatomy/index.html': { 'loop-ladder': true, 'prompt-anatomy': true },
    'posts/copilot-deep-dive/index.html': { 'score-table-wrap': true },
    'posts/dynamics-365-contact-center-ccaas/index.html': { 'roi-formula': true },
    'posts/function-calling-best-practices/index.html': { 'diff-table-wrap': true },
    'posts/function-calling-landscape/index.html': { 'benchmark-table-wrap': true },
    'posts/jianping-clubs-gaokao-planning/index.html': { 'path-table-wrap': true },
    'posts/m4-max-local-models/index.html': { 'score-table-wrap': true },
    'posts/power-platform-governance/index.html': {
      'lc-overview': true,
      'tcv-b': true,
      'lic-collapsible': true,
      'task-collapsible': true
    }
  };
  var passCount = 0;

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function cssRules(css) {
    var rules = [];
    var pattern = /([^{}]+)\{([^{}]*)\}/g;
    var match;
    while ((match = pattern.exec(css)) !== null) {
      rules.push({ selector: match[1].trim(), body: match[2] });
    }
    return rules;
  }

  function isRootSelector(selector, className) {
    var terminal = new RegExp('\\.' + escapeRegex(className) + '(?:::{0,1}[\\w-]+(?:\\([^)]*\\))?)?\\s*$');
    return selector.split(',').some(function (part) {
      return terminal.test(part.trim());
    });
  }

  function hasReadingChrome(rules, className) {
    return rules.some(function (rule) {
      return rule.selector.indexOf('is-presentation-mode') === -1 &&
        isRootSelector(rule.selector, className) && chromeProperty.test(rule.body);
    });
  }

  function hasLegacyUnframing(rules, className) {
    var target = new RegExp('\\.' + escapeRegex(className) + '\\.is-active(?:\\s|,|$)');
    return rules.some(function (rule) {
      var body = rule.body;
      return rule.selector.indexOf('is-presentation-mode') !== -1 && target.test(rule.selector) &&
        /background\s*:\s*transparent/i.test(body) &&
        /border\s*:\s*0(?:px|rem|em)?/i.test(body) &&
        /border-radius\s*:\s*0(?:px|rem|em)?/i.test(body) &&
        /box-shadow\s*:\s*none/i.test(body);
    });
  }

  articles.forEach(function (article) {
    var html = readFile(article.path);
    var articleRelPath = relPath(article.path);
    var legacyClasses = legacyRootExemptions[articleRelPath] || {};
    var styleBlocks = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/gi) || [];
    var css = sharedCss + '\n' + styleBlocks.join('\n');
    var rules = cssRules(css);
    var tagPattern = /<[a-z][\w-]*\b([^>]*\bdata-present-(?:sub)?step\b[^>]*)>/gi;
    var failures = [];
    var tagMatch;

    while ((tagMatch = tagPattern.exec(html)) !== null) {
      var attrs = tagMatch[1];
      var classMatch = attrs.match(/\bclass="([^"]+)"/i);
      var surfaceMatch = attrs.match(/\bdata-present-surface="([^"]+)"/i);
      var surface = surfaceMatch ? surfaceMatch[1] : '';
      var classes = classMatch ? classMatch[1].split(/\s+/) : [];

      if (surface && !allowedSurfaces[surface]) {
        failures.push('invalid data-present-surface="' + surface + '"');
        continue;
      }

      classes.forEach(function (className) {
        if (/^(?:is|has)-/.test(className) || managedRootClasses[className] || legacyClasses[className] || !hasReadingChrome(rules, className)) return;
        if (surface || hasLegacyUnframing(rules, className)) return;
        failures.push('.' + className + ' has reading-mode chrome but no data-present-surface declaration');
      });
    }

    if (failures.length > 0) {
      error(article.path, failures.slice(0, 4).join('; ') + ' (see article instructions §0.8-G)');
    } else {
      passCount++;
    }
  });

  if (passCount === articles.length) {
    pass('All ' + articles.length + ' articles honor the presentation-surface contract');
  } else {
    pass(passCount + '/' + articles.length + ' articles OK');
  }
}

// ── Test 11: strict presentation metadata i18n contract ──

function testPresentationI18nContract() {
  console.log('\n\x1b[36m[11] presentation metadata i18n contract\x1b[0m');
  var articles = findArticles();
  var strictCount = 0;
  var passCount = 0;
  var hanPattern = /[\u3400-\u9fff]/;

  function readAttr(attrs, name) {
    var match = attrs.match(new RegExp('\\b' + name + '="([^"]*)"', 'i'));
    return match ? match[1] : null;
  }

  function hasInvariant(value, kind) {
    if (!value) return false;
    return value.split(/\s+/).some(function (entry) {
      return entry === 'all' || entry === kind;
    });
  }

  articles.forEach(function (article) {
    var html = readFile(article.path);
    var rootMatch = html.match(/<html\b([^>]*)>/i);
    var rootAttrs = rootMatch ? rootMatch[1] : '';
    var strict = /\bdata-present-i18n="strict"/i.test(rootAttrs);
    var tagPattern;
    var tagMatch;
    var failures = [];

    if (!strict) return;
    strictCount++;

    tagPattern = /<[a-z][\w-]*\b([^>]*\bdata-present-(?:sub)?step\b[^>]*)>/gi;
    while ((tagMatch = tagPattern.exec(html)) !== null) {
      var attrs = tagMatch[1];
      var title = readAttr(attrs, 'data-step-title');
      var titleEn = readAttr(attrs, 'data-step-title-en');
      var label = readAttr(attrs, 'data-step-label');
      var labelEn = readAttr(attrs, 'data-step-label-en');
      var invariant = readAttr(attrs, 'data-present-i18n-invariant') || '';
      var titleInvariant = hasInvariant(invariant, 'title');
      var labelInvariant = hasInvariant(invariant, 'label');

      if (title !== null) {
        if (!titleInvariant && titleEn === null) failures.push('data-step-title missing data-step-title-en: ' + title);
        if (!titleInvariant && titleEn !== null && title === titleEn) failures.push('Chinese and English step titles are identical: ' + title);
        if (!titleInvariant && !hanPattern.test(title)) failures.push('default data-step-title has no Chinese semantics: ' + title);
      } else if (titleEn !== null) {
        failures.push('data-step-title-en exists without default data-step-title: ' + titleEn);
      }

      if (label !== null) {
        if (!labelInvariant && labelEn === null) failures.push('data-step-label missing data-step-label-en: ' + label);
        if (!labelInvariant && labelEn !== null && label === labelEn) failures.push('Chinese and English step labels are identical: ' + label);
        if (!labelInvariant && !hanPattern.test(label)) failures.push('default data-step-label has no Chinese semantics: ' + label);
      } else if (labelEn !== null) {
        failures.push('data-step-label-en exists without default data-step-label: ' + labelEn);
      }
    }

    if (failures.length > 0) {
      error(article.path, failures.slice(0, 6).join('; ') + ' (see article instructions §0.8-H)');
    } else {
      passCount++;
    }
  });

  if (strictCount === 0) {
    pass('No strict presentation-i18n articles found');
  } else if (passCount === strictCount) {
    pass('All ' + strictCount + ' strict presentation-i18n article(s) pass');
  } else {
    pass(passCount + '/' + strictCount + ' strict presentation-i18n articles OK');
  }
}

// ── Run all tests ──

console.log('\n\x1b[1m══════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  Knowledge Hub Validation Suite\x1b[0m');
console.log('\x1b[1m══════════════════════════════════════════\x1b[0m');

testKnowledgeData();
testArticleScripts();
testInlineStyles();
testArrowFunctions();
testAssetSyntax();
testCSSIssues();
testArticleStructure();
testDataAttrQuoteSafety();
testGapManagedContract();
testPresentationSurfaceContract();
testPresentationI18nContract();

console.log('\n\x1b[1m══════════════════════════════════════════\x1b[0m');
if (totalErrors > 0) {
  console.error('\x1b[31m  RESULT: ' + totalErrors + ' error(s), ' + totalWarnings + ' warning(s)\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32m  RESULT: All tests passed' + (totalWarnings > 0 ? ' (' + totalWarnings + ' warning(s))' : '') + '\x1b[0m');
  process.exit(0);
}

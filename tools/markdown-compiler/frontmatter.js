// tools/markdown-compiler/frontmatter.js
// Parses YAML frontmatter and inline bilingual / attribute tokens for Study Room Markdown articles.

'use strict';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRawHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text) {
  // Attributes hold HTML that article-common.js later assigns to innerHTML.
  // Preserve every entity through the first (attribute) decoding pass.
  return escapeRawHtml(text);
}

// Split "中文 || English" or "{ zh: '...', en: '...' }" into { zh, en }
function parseBilingual(raw, fallbackEn) {
  if (raw === null || raw === undefined) {
    return { zh: '', en: fallbackEn || '' };
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    var zhVal = raw.zh !== undefined ? String(raw.zh).trim() : '';
    var enVal = raw.en !== undefined ? String(raw.en).trim() : (fallbackEn || zhVal);
    return { zh: zhVal || enVal, en: enVal || zhVal };
  }
  var str = String(raw).trim();
  if (!str) return { zh: '', en: fallbackEn || '' };

  // Inline object syntax: { zh: "...", en: "..." }
  var objMatch = str.match(/^\{\s*zh\s*:\s*(['"]?)([\s\S]*?)\1\s*,\s*en\s*:\s*(['"]?)([\s\S]*?)\3\s*\}$/);
  if (objMatch) {
    return { zh: objMatch[2].trim(), en: objMatch[4].trim() };
  }

  // Pipe syntax: 中文 || English
  var pipeIdx = str.indexOf('||');
  if (pipeIdx !== -1) {
    var left = str.slice(0, pipeIdx).trim();
    var right = str.slice(pipeIdx + 2).trim();
    return { zh: left, en: right || left };
  }

  return { zh: str, en: fallbackEn ? String(fallbackEn).trim() : str };
}

function bilingualAttrs(pair, invariantKind) {
  var b = typeof pair === 'string' ? parseBilingual(pair) : pair;
  var zh = escapeAttr(b.zh);
  var en = escapeAttr(b.en || b.zh);
  var extra = '';
  if (invariantKind && (b.zh === b.en || !/[\u3400-\u9fff]/.test(b.zh))) {
    extra = ' data-present-i18n-invariant="' + escapeAttr(invariantKind) + '"';
  }
  return 'data-zh="' + zh + '" data-en="' + en + '"' + extra;
}

function parseScalarValue(raw) {
  var val = String(raw).trim();
  if (!val) return '';
  if ((val.charAt(0) === '"' && val.slice(-1) === '"') || (val.charAt(0) === "'" && val.slice(-1) === "'")) {
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val.charAt(0) === '{' && val.slice(-1) === '}') {
    return parseInlineAttrs(val.slice(1, -1));
  }
  if (val.charAt(0) === '[' && val.slice(-1) === ']') {
    return val
      .slice(1, -1)
      .split(',')
      .map(function (item) { return parseScalarValue(item); })
      .filter(function (item) { return item !== ''; });
  }
  return val;
}

// Parse directive attribute block like `{ id: "demo", cols: 3, title: "标题 || Title" }`
// or `id="demo" cols=3 open`
function parseInlineAttrs(raw) {
  var attrs = {};
  if (!raw) return attrs;
  var str = String(raw).trim();
  if (str.charAt(0) === '{' && str.slice(-1) === '}') {
    str = str.slice(1, -1).trim();
  }
  if (!str) return attrs;

  var tokenPattern = /([a-zA-Z_][\w-]*)\s*(?:[:=]\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\[[^\]]*\]|\{[^}]*\}|[^,\s]+))?/g;
  var match;
  while ((match = tokenPattern.exec(str)) !== null) {
    var key = match[1];
    var rawVal = match[2];
    if (rawVal === undefined) {
      attrs[key] = true;
    } else {
      attrs[key] = parseScalarValue(rawVal);
    }
  }
  return attrs;
}

function parseFrontmatter(markdown) {
  var normalized = String(markdown || '').replace(/\r\n/g, '\n');
  var match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) {
    return { meta: {}, body: normalized };
  }

  var yamlText = match[1];
  var body = normalized.slice(match[0].length);
  var meta = {};
  var lines = yamlText.split('\n');
  var currentKey = null;
  var currentObj = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();
    if (!trimmed || trimmed.charAt(0) === '#') continue;

    var indent = line.match(/^\s*/)[0].length;

    if (indent === 0) {
      currentObj = null;
      var topMatch = trimmed.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
      if (!topMatch) continue;
      currentKey = topMatch[1];
      var rest = topMatch[2].trim();
      if (rest === '') {
        meta[currentKey] = [];
      } else {
        meta[currentKey] = parseScalarValue(rest);
      }
      continue;
    }

    if (!currentKey) continue;

    // List item under currentKey
    if (trimmed.indexOf('- ') === 0 || trimmed === '-') {
      if (!Array.isArray(meta[currentKey])) {
        meta[currentKey] = [];
      }
      var itemText = trimmed.slice(1).trim();
      if (!itemText) {
        currentObj = {};
        meta[currentKey].push(currentObj);
        continue;
      }
      var kvMatch = itemText.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
      if (kvMatch && itemText.indexOf('|') === -1) {
        currentObj = {};
        currentObj[kvMatch[1]] = parseScalarValue(kvMatch[2]);
        meta[currentKey].push(currentObj);
      } else {
        currentObj = null;
        meta[currentKey].push(parseScalarValue(itemText));
      }
      continue;
    }

    // Nested key: value inside a map or array object
    var nestedMatch = trimmed.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (nestedMatch) {
      var nKey = nestedMatch[1];
      var nVal = parseScalarValue(nestedMatch[2]);
      if (currentObj && typeof currentObj === 'object') {
        currentObj[nKey] = nVal;
      } else {
        if (typeof meta[currentKey] !== 'object' || Array.isArray(meta[currentKey])) {
          meta[currentKey] = {};
        }
        meta[currentKey][nKey] = nVal;
      }
    }
  }

  return { meta: meta, body: body };
}

function slugify(text, fallbackIndex) {
  var raw = String(text || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\u3400-\u9fff-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!raw || /^[\u3400-\u9fff-]+$/.test(raw)) {
    return 'section-' + String(fallbackIndex || 1);
  }
  return raw;
}

module.exports = {
  escapeHtml: escapeHtml,
  escapeRawHtml: escapeRawHtml,
  escapeAttr: escapeAttr,
  parseBilingual: parseBilingual,
  bilingualAttrs: bilingualAttrs,
  parseInlineAttrs: parseInlineAttrs,
  parseFrontmatter: parseFrontmatter,
  slugify: slugify
};

// tools/html-to-markdown/html-ast.js
// Lightweight, deterministic HTML5 tokenizer & DOM AST builder with entity decoding
// and helper selectors for Study Room HTML -> Genesis Extended Markdown reverse compilation.

'use strict';

var VOID_TAGS = {
  area: true, base: true, br: true, col: true, embed: true, hr: true,
  img: true, input: true, link: true, meta: true, param: true, source: true,
  track: true, wbr: true
};

var RAW_TEXT_TAGS = {
  script: true,
  style: true,
  textarea: true
};

var NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•',
  middot: '·', hellip: '…', larr: '←', rarr: '→', uarr: '↑', darr: '↓',
  lrarr: '↔', harr: '↔', rArr: '⇒', lArr: '⇐', hArr: '⇔',
  times: '×', divide: '÷', plusmn: '±', minus: '−', lowast: '∗',
  radic: '√', infin: '∞', asymp: '≈', ne: '≠', equiv: '≡',
  le: '≤', ge: '≥', prop: '∝', part: '∂', nabla: '∇', sum: '∑', prod: '∏',
  int: '∫', deg: '°', micro: 'μ', permil: '‰', prime: '′', Prime: '″',
  alpha: 'α', beta: 'beta', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
  eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ',
  Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  sup2: '²', sup3: '³', sup1: '¹', frac12: '½', frac14: '¼', frac34: '¾',
  check: '✓', cross: '✗', star: '☆', starf: '★'
};
NAMED_ENTITIES.beta = 'β';

function decodeEntities(str) {
  if (!str) return '';
  return String(str).replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, function (full, code) {
    if (code.charAt(0) === '#') {
      var num = (code.charAt(1) === 'x' || code.charAt(1) === 'X')
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
      if (!isNaN(num) && num > 0 && num <= 0x10ffff) {
        try {
          return String.fromCodePoint(num);
        } catch (_e) {
          return full;
        }
      }
      return full;
    }
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, code)) {
      return NAMED_ENTITIES[code];
    }
    return full;
  });
}

function parseAttributes(attrText) {
  var attrs = {};
  if (!attrText) return attrs;
  var i = 0;
  var len = attrText.length;

  while (i < len) {
    while (i < len && /\s/.test(attrText.charAt(i))) i++;
    if (i >= len || attrText.charAt(i) === '/') {
      i++;
      continue;
    }
    var nameStart = i;
    while (i < len && !/[\s=/>"']/.test(attrText.charAt(i))) i++;
    if (i === nameStart) {
      i++;
      continue;
    }
    var rawName = attrText.slice(nameStart, i).toLowerCase();
    while (i < len && /\s/.test(attrText.charAt(i))) i++;
    if (i < len && attrText.charAt(i) === '=') {
      i++;
      while (i < len && /\s/.test(attrText.charAt(i))) i++;
      if (i < len && (attrText.charAt(i) === '"' || attrText.charAt(i) === "'")) {
        var quote = attrText.charAt(i++);
        var valStart = i;
        while (i < len && attrText.charAt(i) !== quote) i++;
        attrs[rawName] = decodeEntities(attrText.slice(valStart, i));
        if (i < len && attrText.charAt(i) === quote) i++;
      } else {
        var uStart = i;
        while (i < len && !/[\s>]/.test(attrText.charAt(i))) i++;
        attrs[rawName] = decodeEntities(attrText.slice(uStart, i));
      }
    } else {
      attrs[rawName] = '';
    }
  }
  return attrs;
}

function findTagEnd(html, startPos) {
  var i = startPos;
  var len = html.length;
  var quote = null;
  while (i < len) {
    var ch = html.charAt(i);
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return i;
    }
    i++;
  }
  return -1;
}

function parseHtml(htmlString) {
  var html = String(htmlString || '').replace(/\r\n/g, '\n');
  var root = { type: 'root', tag: 'root', attrs: {}, children: [], parent: null };
  var stack = [root];
  var pos = 0;
  var len = html.length;

  while (pos < len) {
    var current = stack[stack.length - 1];
    var lt = html.indexOf('<', pos);
    if (lt === -1) {
      var tailText = html.slice(pos);
      if (tailText) {
        current.children.push({
          type: 'text',
          text: decodeEntities(tailText),
          rawText: tailText,
          parent: current
        });
      }
      break;
    }

    if (lt > pos) {
      var chunk = html.slice(pos, lt);
      current.children.push({
        type: 'text',
        text: decodeEntities(chunk),
        rawText: chunk,
        parent: current
      });
    }

    // HTML comment
    if (html.slice(lt, lt + 4) === '<!--') {
      var commentEnd = html.indexOf('-->', lt + 4);
      if (commentEnd === -1) break;
      pos = commentEnd + 3;
      continue;
    }

    // Doctype or CDATA
    if (html.slice(lt, lt + 2) === '<!' || html.slice(lt, lt + 2) === '<?') {
      var declEnd = html.indexOf('>', lt + 2);
      if (declEnd === -1) break;
      pos = declEnd + 1;
      continue;
    }

    // Closing tag
    if (html.charAt(lt + 1) === '/') {
      var closeEnd = html.indexOf('>', lt + 2);
      if (closeEnd === -1) break;
      var closeTag = html.slice(lt + 2, closeEnd).trim().toLowerCase().split(/\s+/)[0];
      for (var s = stack.length - 1; s >= 1; s--) {
        if (stack[s].tag === closeTag) {
          stack.length = s;
          break;
        }
      }
      pos = closeEnd + 1;
      continue;
    }

    // Opening tag
    var firstAfterLt = html.charAt(lt + 1);
    if (!/[a-zA-Z]/.test(firstAfterLt)) {
      current.children.push({
        type: 'text',
        text: '<',
        rawText: '<',
        parent: current
      });
      pos = lt + 1;
      continue;
    }

    var tagEnd = findTagEnd(html, lt + 1);
    if (tagEnd === -1) {
      current.children.push({
        type: 'text',
        text: decodeEntities(html.slice(lt)),
        rawText: html.slice(lt),
        parent: current
      });
      break;
    }

    var rawInside = html.slice(lt + 1, tagEnd);
    var selfClosing = /\/\s*$/.test(rawInside);
    if (selfClosing) {
      rawInside = rawInside.replace(/\/\s*$/, '');
    }
    var nameMatch = rawInside.match(/^([a-zA-Z][\w:-]*)(?:\s+([\s\S]*))?$/);
    if (!nameMatch) {
      pos = tagEnd + 1;
      continue;
    }

    var tagName = nameMatch[1].toLowerCase();
    var attrs = parseAttributes(nameMatch[2] || '');

    // Auto-close optional sibling tags (`li`, `p`, `td`, `th`, `tr`, `option`)
    if (tagName === 'li' && current.tag === 'li') {
      stack.pop();
      current = stack[stack.length - 1];
    } else if ((tagName === 'td' || tagName === 'th') && (current.tag === 'td' || current.tag === 'th')) {
      stack.pop();
      current = stack[stack.length - 1];
    } else if (tagName === 'tr' && (current.tag === 'td' || current.tag === 'th' || current.tag === 'tr')) {
      while (stack.length > 1 && (stack[stack.length - 1].tag === 'td' || stack[stack.length - 1].tag === 'th' || stack[stack.length - 1].tag === 'tr')) {
        stack.pop();
      }
      current = stack[stack.length - 1];
    }

    var elem = {
      type: 'element',
      tag: tagName,
      attrs: attrs,
      children: [],
      parent: current
    };
    current.children.push(elem);
    pos = tagEnd + 1;

    if (RAW_TEXT_TAGS[tagName] && !selfClosing) {
      var closePattern = new RegExp('<\\/' + tagName + '\\s*>', 'ig');
      closePattern.lastIndex = pos;
      var closeMatch = closePattern.exec(html);
      var rawContent = closeMatch ? html.slice(pos, closeMatch.index) : html.slice(pos);
      if (rawContent) {
        elem.children.push({
          type: 'text',
          text: tagName === 'textarea' ? decodeEntities(rawContent) : rawContent,
          rawText: rawContent,
          parent: elem
        });
      }
      pos = closeMatch ? closeMatch.index + closeMatch[0].length : len;
      continue;
    }

    if (!selfClosing && !VOID_TAGS[tagName]) {
      stack.push(elem);
    }
  }

  return root;
}

function classList(node) {
  if (!node || node.type !== 'element' || !node.attrs || !node.attrs.class) return [];
  return node.attrs.class.trim().split(/\s+/).filter(Boolean);
}

function hasClass(node, cls) {
  return classList(node).indexOf(cls) !== -1;
}

function hasAnyClass(node, classes) {
  var list = classList(node);
  for (var i = 0; i < classes.length; i++) {
    if (list.indexOf(classes[i]) !== -1) return true;
  }
  return false;
}

function hasAttr(node, name) {
  return Boolean(node && node.type === 'element' && node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, name));
}

function getAttr(node, name) {
  if (!hasAttr(node, name)) return '';
  return node.attrs[name] || '';
}

function elementChildren(node) {
  if (!node || !node.children) return [];
  return node.children.filter(function (c) { return c.type === 'element'; });
}

function findFirst(node, predicate) {
  if (!node) return null;
  if (node.type === 'element' && predicate(node)) return node;
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    var found = findFirst(children[i], predicate);
    if (found) return found;
  }
  return null;
}

function findAll(node, predicate, results) {
  var out = results || [];
  if (!node) return out;
  if (node.type === 'element' && predicate(node)) {
    out.push(node);
  }
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    findAll(children[i], predicate, out);
  }
  return out;
}

function textContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  var parts = [];
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    if (children[i].type === 'element' && (children[i].tag === 'script' || children[i].tag === 'style')) {
      continue;
    }
    if (children[i].type === 'element' && children[i].tag === 'br') {
      parts.push('\n');
      continue;
    }
    parts.push(textContent(children[i]));
  }
  return parts.join('');
}

function cleanWhitespace(str) {
  return String(str || '').replace(/\s+/g, ' ').trim();
}

module.exports = {
  decodeEntities: decodeEntities,
  parseHtml: parseHtml,
  classList: classList,
  hasClass: hasClass,
  hasAnyClass: hasAnyClass,
  hasAttr: hasAttr,
  getAttr: getAttr,
  elementChildren: elementChildren,
  findFirst: findFirst,
  findAll: findAll,
  textContent: textContent,
  cleanWhitespace: cleanWhitespace
};

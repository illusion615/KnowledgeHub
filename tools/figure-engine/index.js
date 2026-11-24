'use strict';

// Study Room Figure Engine v2 — Unified Compiler Entry
// Compiles both topology specs (architecture, flowchart, sequence, hierarchy)
// and statistical chart specs (bar, line, area, quadrant, radar, funnel)
// into CSS-variable-bound inline bilingual SVGs, standalone SVGs, and Draw.io files.

var fs = require('fs');
var path = require('path');
var tk = require('./tokens');
var topo = require('./topology-renderer');
var chart = require('./chart-renderer');

var figureCounter = 0;

function sanitizeIdPrefix(raw) {
  figureCounter += 1;
  var cleaned = String(raw || ('sr-fig-' + figureCounter))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || ('sr-fig-' + figureCounter);
}

// Parses JSON or clean inline FigureSpec text inside Markdown `:::figure` blocks
function parseFigureSpecText(rawText) {
  var trimmed = String(rawText || '').trim();
  if (!trimmed) throw new Error('Empty FigureSpec block');

  // Strip optional ```json / ```yaml fences if author wrapped the spec
  trimmed = trimmed.replace(/^```(?:json|yaml|yml)?\s*\n/i, '').replace(/\n```\s*$/, '').trim();

  if (trimmed.charAt(0) === '{') {
    return JSON.parse(trimmed);
  }

  // Lightweight indentation-free / simple YAML-like key: value + JSON array/object hybrid parser
  var obj = {};
  var lines = trimmed.split('\n');
  var i = 0;
  while (i < lines.length) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === '#') {
      i++;
      continue;
    }
    var colon = line.indexOf(':');
    if (colon === -1) {
      i++;
      continue;
    }
    var key = line.slice(0, colon).trim();
    var rest = line.slice(colon + 1).trim();
    if (rest.charAt(0) === '[' || rest.charAt(0) === '{') {
      var buf = rest;
      var opens = (buf.match(/[\[{]/g) || []).length;
      var closes = (buf.match(/[\]}]/g) || []).length;
      while (opens > closes && i + 1 < lines.length) {
        i++;
        buf += '\n' + lines[i];
        opens = (buf.match(/[\[{]/g) || []).length;
        closes = (buf.match(/[\]}]/g) || []).length;
      }
      obj[key] = JSON.parse(buf);
    } else if (/^-?\d+(?:\.\d+)?$/.test(rest)) {
      obj[key] = Number(rest);
    } else if (rest === 'true' || rest === 'false') {
      obj[key] = rest === 'true';
    } else {
      obj[key] = rest.replace(/^["']|["']$/g, '');
    }
    i++;
  }
  return obj;
}

function compileFigure(specInput, options) {
  var spec = typeof specInput === 'string' ? parseFigureSpecText(specInput) : JSON.parse(JSON.stringify(specInput));
  var opts = Object.assign({ lang: 'bilingual', standalone: false }, options || {});
  opts.idPrefix = sanitizeIdPrefix(opts.idPrefix || spec.id || (spec.title && (spec.title.en || spec.title)));

  if (chart.isChartType(spec.type)) {
    var chartRes = chart.renderChart(spec, opts);
    return {
      kind: 'chart',
      type: String(spec.type).toLowerCase(),
      svg: chartRes.svg,
      drawio: null,
      width: chartRes.width,
      height: chartRes.height,
      model: null
    };
  }

  var modelLang = opts.lang === 'en' ? 'en' : 'zh';
  var model = topo.layoutTopology(spec, modelLang);
  var svg = topo.renderTopologySvg(model, opts);
  var drawio = topo.renderTopologyDrawio(model);
  return {
    kind: 'topology',
    type: model.type,
    svg: svg,
    drawio: drawio,
    width: model.width,
    height: model.height,
    model: model
  };
}

function resolveSpecFile(baseSrc, baseDir) {
  if (!baseSrc) return null;
  var clean = String(baseSrc)
    .replace(/\.(?:zh|en)\.svg$/i, '')
    .replace(/\.(?:figure|diagram)\.json$/i, '')
    .replace(/\.svg$/i, '')
    .replace(/\.json$/i, '');

  var candidates = [
    path.resolve(baseDir, String(baseSrc)),
    path.resolve(baseDir, clean + '.figure.json'),
    path.resolve(baseDir, clean + '.diagram.json'),
    path.resolve(baseDir, clean + '.json')
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i]) && fs.statSync(candidates[i]).isFile() && /\.json$/i.test(candidates[i])) {
      return candidates[i];
    }
  }
  return null;
}

function writeFigureArtifacts(specPath, outDir, baseName) {
  var absSpec = path.resolve(specPath);
  var spec = JSON.parse(fs.readFileSync(absSpec, 'utf8'));
  var name = baseName || path.basename(absSpec).replace(/\.(?:figure|diagram)?\.?json$/i, '');
  fs.mkdirSync(outDir, { recursive: true });

  var inlineRes = compileFigure(spec, { lang: 'bilingual', standalone: false, idPrefix: name });
  var zhRes = compileFigure(spec, { lang: 'zh', standalone: true, idPrefix: name + '-zh' });
  var enRes = compileFigure(spec, { lang: 'en', standalone: true, idPrefix: name + '-en' });

  fs.writeFileSync(path.join(outDir, name + '.zh.svg'), zhRes.svg + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, name + '.en.svg'), enRes.svg + '\n', 'utf8');
  if (inlineRes.drawio) {
    fs.writeFileSync(path.join(outDir, name + '.drawio'), inlineRes.drawio, 'utf8');
  }

  return {
    name: name,
    inlineSvg: inlineRes.svg,
    zhSvg: zhRes.svg,
    enSvg: enRes.svg,
    drawio: inlineRes.drawio
  };
}

module.exports = {
  tokens: tk,
  topology: topo,
  charts: chart,
  parseFigureSpecText: parseFigureSpecText,
  compileFigure: compileFigure,
  resolveSpecFile: resolveSpecFile,
  writeFigureArtifacts: writeFigureArtifacts
};

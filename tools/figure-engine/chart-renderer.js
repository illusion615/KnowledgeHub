'use strict';

// Study Room Figure Engine v2 — Observable / Distill Grade Statistical Chart Renderer
// Supports: bar (horizontal & vertical grouped), line / area, quadrant (2x2 matrix), radar, funnel / sankey.
// Zero client JS; outputs CSS-variable-bound bilingual SVG with tabular-nums, hairline dashed grids, and direct labeling.

var tk = require('./tokens');

function niceCeil(maxVal) {
  if (!isFinite(maxVal) || maxVal <= 0) return 10;
  var exp = Math.floor(Math.log10(maxVal));
  var base = Math.pow(10, exp);
  var frac = maxVal / base;
  var nice = frac <= 1 ? 1 : frac <= 1.5 ? 1.5 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;
  return nice * base;
}

function formatNum(val, unit) {
  var s = Math.abs(val) >= 1000 && Math.round(val) === val
    ? String(Math.round(val)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : (Math.round(val * 100) / 100).toString();
  return unit ? s + unit : s;
}

function catmullRomToBezier(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return 'M ' + pts[0][0] + ' ' + pts[0][1];
  if (pts.length === 2) return 'M ' + pts[0][0] + ' ' + pts[0][1] + ' L ' + pts[1][0] + ' ' + pts[1][1];
  var d = ['M ' + pts[0][0] + ' ' + pts[0][1]];
  for (var i = 0; i < pts.length - 1; i++) {
    var p0 = pts[i === 0 ? 0 : i - 1];
    var p1 = pts[i];
    var p2 = pts[i + 1];
    var p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    var cp1x = Math.round((p1[0] + (p2[0] - p0[0]) / 6) * 10) / 10;
    var cp1y = Math.round((p1[1] + (p2[1] - p0[1]) / 6) * 10) / 10;
    var cp2x = Math.round((p2[0] - (p3[0] - p1[0]) / 6) * 10) / 10;
    var cp2y = Math.round((p2[1] - (p3[1] - p1[1]) / 6) * 10) / 10;
    d.push('C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p2[0] + ' ' + p2[1]);
  }
  return d.join(' ');
}

function openChartSvg(spec, width, height, opts, descText) {
  var uid = (opts && opts.idPrefix) || 'chart';
  var standalone = !!(opts && opts.standalone);
  var lang = (opts && opts.lang) || 'bilingual';
  var titlePair = tk.parseBilingualValue(spec.title || { zh: '数据分析图表', en: 'Analytical Chart' });
  var titleStr = lang === 'en' ? titlePair.en : titlePair.zh;
  var out = [];
  out.push('<svg class="sr-figure-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="' + uid + '-title ' + uid + '-desc">');
  out.push('<title id="' + uid + '-title">' + tk.escapeXml(titleStr) + '</title>');
  out.push('<desc id="' + uid + '-desc">' + tk.escapeXml(descText || (spec.type + ' chart')) + '</desc>');
  if (standalone) out.push(tk.STANDALONE_STYLE_BLOCK);
  if (standalone || (spec.layout && spec.layout.showCanvas)) {
    out.push('<rect width="100%" height="100%" rx="20" fill="var(--fig-canvas-bg, rgba(255, 255, 255, 0.56))"/>');
  }
  return out;
}

function renderChartHeader(spec, width, lang) {
  var showHeader = !(spec.layout && spec.layout.showTitle === false) && !!(spec.subtitle || (spec.layout && spec.layout.showTitle === true));
  if (!showHeader) return { html: '', topY: 28 };
  var parts = [];
  var curY = 32;
  if (spec.title && (!spec.layout || spec.layout.showTitle !== false)) {
    parts.push(tk.renderLangText(spec.title, 36, curY, 'font-size="18" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
    curY += 24;
  }
  if (spec.subtitle) {
    parts.push(tk.renderLangText(spec.subtitle, 36, curY - 2, 'font-size="12.5" font-weight="500" fill="var(--fig-text-muted, #52616d)"', lang));
    curY += 20;
  }
  return { html: parts.join(''), topY: curY + 8 };
}

function renderInlineLegend(seriesList, rightX, y, lang) {
  if (!seriesList || seriesList.length <= 1) return '';
  var items = [];
  var cursorX = rightX;
  for (var i = seriesList.length - 1; i >= 0; i--) {
    var s = seriesList[i];
    var pair = tk.parseBilingualValue(s.name || s.label || ('Series ' + (i + 1)));
    var estW = Math.max(tk.measureText(pair.zh, 12), tk.measureText(pair.en, 12)) + 28;
    var x0 = Math.round(cursorX - estW);
    var color = tk.getSeriesColor(i, s.role || s.color);
    items.push('<g transform="translate(' + x0 + ',' + (y - 10) + ')">' +
      '<rect x="0" y="1" width="10" height="10" rx="3" fill="' + color + '"/>' +
      tk.renderLangText(s.name || s.label, 16, 10, 'font-size="12" font-weight="600" fill="var(--fig-text-muted, #52616d)"', lang) +
      '</g>');
    cursorX = x0 - 18;
  }
  return '<g class="sr-chart-legend">' + items.join('') + '</g>';
}

function renderBarChart(spec, opts) {
  var lang = (opts && opts.lang) || 'bilingual';
  var layout = spec.layout || {};
  var orientation = layout.orientation || spec.orientation || 'vertical';
  var width = layout.width || 1040;
  var categories = spec.categories || (spec.data ? spec.data.map(function (d) { return d.label || d.category; }) : []);
  var series = spec.series || [{
    name: spec.seriesName || { zh: '指标值', en: 'Value' },
    role: 'accent',
    values: (spec.data || []).map(function (d) { return d.value; }),
    notes: (spec.data || []).map(function (d) { return d.note || d.display || ''; }),
    roles: (spec.data || []).map(function (d) { return d.role || ''; })
  }];
  var unit = spec.unit || '';
  var scaleMode = spec.scale === 'log' ? 'log' : 'linear';

  var allVals = [];
  series.forEach(function (s) {
    (s.values || []).forEach(function (v) { allVals.push(Number(v) || 0); });
  });
  var rawMax = Math.max.apply(null, allVals.concat([1]));
  var maxVal = spec.max || niceCeil(rawMax);
  var header = renderChartHeader(spec, width, lang);

  if (orientation === 'horizontal') {
    var rowH = layout.rowHeight || (series.length > 1 ? 26 * series.length + 22 : 52);
    var topY = header.topY + (series.length > 1 ? 22 : 8);
    var height = layout.height || (topY + categories.length * rowH + 54);
    var leftPad = layout.leftPad || 248;
    var rightPad = layout.rightPad || 150;
    var plotW = width - leftPad - rightPad;
    var parts = openChartSvg(spec, width, height, opts, 'Horizontal bar chart with ' + categories.length + ' items');
    if (header.html) parts.push(header.html);
    if (series.length > 1) parts.push(renderInlineLegend(series, width - 36, header.topY + 4, lang));

    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var ratio = t / ticks;
      var gx = Math.round(leftPad + ratio * plotW);
      var tickVal = scaleMode === 'log'
        ? Math.round(Math.pow(10, ratio * Math.log10(Math.max(10, maxVal))) * 10) / 10
        : Math.round(ratio * maxVal * 100) / 100;
      if (t === 0 && scaleMode === 'log') tickVal = 0;
      parts.push('<line x1="' + gx + '" y1="' + topY + '" x2="' + gx + '" y2="' + (topY + categories.length * rowH) + '" stroke="' + (t === 0 ? 'var(--fig-axis-line, rgba(23,36,48,0.24))' : 'var(--fig-grid-line, rgba(23,36,48,0.09))') + '" stroke-width="1"' + (t === 0 ? '' : ' stroke-dasharray="4 4"') + '/>');
      parts.push('<text class="sr-figure-num" x="' + gx + '" y="' + (topY + categories.length * rowH + 22) + '" text-anchor="middle" font-size="11.5" fill="var(--fig-text-subtle, #64748b)">' + tk.escapeXml(formatNum(tickVal, t === ticks ? unit : '')) + '</text>');
    }

    categories.forEach(function (cat, cIdx) {
      var groupTop = topY + cIdx * rowH;
      var barAreaH = rowH - 18;
      var singleBarH = Math.min(24, Math.floor(barAreaH / series.length) - (series.length > 1 ? 3 : 0));
      var labelY = Math.round(groupTop + rowH / 2 + 4);
      parts.push(tk.renderLangText(cat, leftPad - 14, labelY, 'text-anchor="end" font-size="13" font-weight="600" fill="var(--fig-text-strong, #172430)"', lang));

      series.forEach(function (s, sIdx) {
        var val = Number((s.values || [])[cIdx]) || 0;
        var norm = scaleMode === 'log'
          ? (val <= 0 ? 0.02 : Math.min(1, Math.log10(val * 10 + 1) / Math.log10(maxVal * 10 + 1)))
          : Math.max(0, Math.min(1, val / maxVal));
        var bw = Math.max(6, Math.round(norm * plotW));
        var by = Math.round(groupTop + (rowH - (series.length * singleBarH + (series.length - 1) * 4)) / 2 + sIdx * (singleBarH + 4));
        var itemRole = (s.roles && s.roles[cIdx]) || s.role;
        var fill = tk.getSeriesColor(sIdx, itemRole || s.color);
        parts.push('<rect x="' + leftPad + '" y="' + by + '" width="' + bw + '" height="' + singleBarH + '" rx="6" fill="' + fill + '" fill-opacity="0.88"/>');
        var noteRaw = s.notes && s.notes[cIdx];
        var dispVal = noteRaw || formatNum(val, unit);
        parts.push(tk.renderLangText(dispVal, leftPad + bw + 10, by + Math.round(singleBarH / 2 + 4.5), 'class="sr-figure-num" font-size="12" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
      });
    });

    if (spec.xLabel) {
      parts.push(tk.renderLangText(spec.xLabel, Math.round(leftPad + plotW / 2), height - 8, 'text-anchor="middle" font-size="12" font-weight="600" fill="var(--fig-text-muted, #52616d)"', lang));
    }
    parts.push('</svg>');
    return { svg: parts.join(''), width: width, height: height };
  }

  // Vertical grouped/single bar chart
  var heightV = layout.height || 390;
  var padL = layout.leftPad || 68;
  var padR = layout.rightPad || 36;
  var padB = spec.xLabel ? 62 : 48;
  var topYV = header.topY + 20;
  var plotWV = width - padL - padR;
  var plotHV = heightV - topYV - padB;
  var partsV = openChartSvg(spec, width, heightV, opts, 'Vertical bar chart with ' + categories.length + ' categories');
  if (header.html) partsV.push(header.html);
  if (series.length > 1) partsV.push(renderInlineLegend(series, width - padR, header.topY + 2, lang));

  var vTicks = 4;
  for (var vt = 0; vt <= vTicks; vt++) {
    var vr = vt / vTicks;
    var gy = Math.round(topYV + plotHV - vr * plotHV);
    var vVal = Math.round(vr * maxVal * 100) / 100;
    partsV.push('<line x1="' + padL + '" y1="' + gy + '" x2="' + (width - padR) + '" y2="' + gy + '" stroke="' + (vt === 0 ? 'var(--fig-axis-line, rgba(23,36,48,0.24))' : 'var(--fig-grid-line, rgba(23,36,48,0.09))') + '" stroke-width="1"' + (vt === 0 ? '' : ' stroke-dasharray="4 4"') + '/>');
    partsV.push('<text class="sr-figure-num" x="' + (padL - 10) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11.5" fill="var(--fig-text-subtle, #64748b)">' + tk.escapeXml(formatNum(vVal, vt === vTicks ? unit : '')) + '</text>');
  }

  var slotW = plotWV / Math.max(1, categories.length);
  categories.forEach(function (cat, cIdx) {
    var cx = padL + cIdx * slotW + slotW / 2;
    var groupW = Math.min(slotW * 0.66, series.length * 42);
    var barW = Math.max(14, Math.floor((groupW - (series.length - 1) * 6) / series.length));
    var startX = Math.round(cx - (series.length * barW + (series.length - 1) * 6) / 2);

    series.forEach(function (s, sIdx) {
      var val = Number((s.values || [])[cIdx]) || 0;
      var bh = Math.max(4, Math.round((val / maxVal) * plotHV));
      var bx = startX + sIdx * (barW + 6);
      var by = topYV + plotHV - bh;
      var itemRole = (s.roles && s.roles[cIdx]) || s.role;
      var fill = tk.getSeriesColor(sIdx, itemRole || s.color);
      partsV.push('<rect x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + bh + '" rx="6" fill="' + fill + '" fill-opacity="0.88"/>');
      partsV.push('<text class="sr-figure-num" x="' + Math.round(bx + barW / 2) + '" y="' + (by - 7) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--fig-text-strong, #172430)">' + tk.escapeXml(formatNum(val, unit)) + '</text>');
    });

    partsV.push(tk.renderLangText(cat, Math.round(cx), topYV + plotHV + 24, 'text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--fig-text-strong, #172430)"', lang));
  });

  if (spec.yLabel) {
    partsV.push(tk.renderLangText(spec.yLabel, padL, topYV - 10, 'font-size="11.5" font-weight="600" fill="var(--fig-text-muted, #52616d)"', lang));
  }
  partsV.push('</svg>');
  return { svg: partsV.join(''), width: width, height: heightV };
}

function renderLineOrAreaChart(spec, opts) {
  var lang = (opts && opts.lang) || 'bilingual';
  var uid = (opts && opts.idPrefix) || 'line';
  var isArea = spec.type === 'area' || !!(spec.area);
  var layout = spec.layout || {};
  var width = layout.width || 1040;
  var height = layout.height || 390;
  var header = renderChartHeader(spec, width, lang);
  var topY = header.topY + 18;
  var padL = layout.leftPad || 66;
  var padR = layout.rightPad || 148;
  var padB = 50;
  var plotW = width - padL - padR;
  var plotH = height - topY - padB;

  var xLabels = spec.xLabels || spec.categories || [];
  var series = spec.series || [];
  var unit = spec.unit || '';
  var allVals = [];
  series.forEach(function (s) {
    (s.values || []).forEach(function (v) { allVals.push(Number(v) || 0); });
  });
  var maxVal = spec.max || niceCeil(Math.max.apply(null, allVals.concat([1])));
  var minVal = spec.min != null ? Number(spec.min) : 0;
  var span = Math.max(1e-6, maxVal - minVal);

  var parts = openChartSvg(spec, width, height, opts, (isArea ? 'Area' : 'Line') + ' trend chart with ' + series.length + ' series');
  var defs = ['<defs>'];
  series.forEach(function (s, idx) {
    var col = tk.getSeriesColor(idx, s.role || s.color);
    defs.push('<linearGradient id="' + uid + '-grad-' + idx + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + col + '" stop-opacity="0.28"/>' +
      '<stop offset="100%" stop-color="' + col + '" stop-opacity="0.01"/>' +
      '</linearGradient>');
  });
  defs.push('</defs>');
  parts.push(defs.join(''));
  if (header.html) parts.push(header.html);

  var ticks = 4;
  for (var t = 0; t <= ticks; t++) {
    var r = t / ticks;
    var gy = Math.round(topY + plotH - r * plotH);
    var tv = Math.round((minVal + r * span) * 100) / 100;
    parts.push('<line x1="' + padL + '" y1="' + gy + '" x2="' + (padL + plotW) + '" y2="' + gy + '" stroke="' + (t === 0 ? 'var(--fig-axis-line, rgba(23,36,48,0.24))' : 'var(--fig-grid-line, rgba(23,36,48,0.09))') + '" stroke-width="1"' + (t === 0 ? '' : ' stroke-dasharray="4 4"') + '/>');
    parts.push('<text class="sr-figure-num" x="' + (padL - 10) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11.5" fill="var(--fig-text-subtle, #64748b)">' + tk.escapeXml(formatNum(tv, t === ticks ? unit : '')) + '</text>');
  }

  xLabels.forEach(function (xl, i) {
    var xx = Math.round(padL + (xLabels.length <= 1 ? plotW / 2 : (i / (xLabels.length - 1)) * plotW));
    parts.push(tk.renderLangText(xl, xx, topY + plotH + 24, 'text-anchor="middle" font-size="12" font-weight="600" fill="var(--fig-text-muted, #52616d)"', lang));
  });

  // Track end label Y positions to avoid overlap
  var endLabels = [];
  series.forEach(function (s, idx) {
    var col = tk.getSeriesColor(idx, s.role || s.color);
    var vals = s.values || [];
    var pts = vals.map(function (v, i) {
      var px = Math.round((padL + (vals.length <= 1 ? plotW / 2 : (i / (vals.length - 1)) * plotW)) * 10) / 10;
      var py = Math.round((topY + plotH - ((Number(v) - minVal) / span) * plotH) * 10) / 10;
      return [px, py];
    });
    if (!pts.length) return;
    var curve = catmullRomToBezier(pts);
    if (isArea || s.area) {
      var areaPath = curve + ' L ' + pts[pts.length - 1][0] + ' ' + (topY + plotH) + ' L ' + pts[0][0] + ' ' + (topY + plotH) + ' Z';
      parts.push('<path d="' + areaPath + '" fill="url(#' + uid + '-grad-' + idx + ')"/>');
    }
    var dash = s.dashed ? ' stroke-dasharray="6 4"' : '';
    parts.push('<path d="' + curve + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round"' + dash + '/>');
    pts.forEach(function (pt) {
      parts.push('<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="4" fill="var(--fig-port-fill, #ffffff)" stroke="' + col + '" stroke-width="2.2"/>');
    });
    var lastPt = pts[pts.length - 1];
    var lastVal = vals[vals.length - 1];
    endLabels.push({ y: lastPt[1], x: lastPt[0] + 12, name: s.name || s.label, val: formatNum(lastVal, unit), color: col });
  });

  // Resolve vertical collisions among direct end-labels (each 2-line label needs >= 34px)
  endLabels.sort(function (a, b) { return a.y - b.y; });
  if (endLabels.length > 1) {
    endLabels[0].y -= 8;
    for (var k = 1; k < endLabels.length; k++) {
      if (endLabels[k].y - endLabels[k - 1].y < 34) {
        endLabels[k].y = endLabels[k - 1].y + 34;
      }
    }
  }
  endLabels.forEach(function (lbl) {
    parts.push(tk.renderLangText(lbl.name, lbl.x, Math.round(lbl.y - 2), 'font-size="12" font-weight="700" fill="' + lbl.color + '"', lang));
    parts.push('<text class="sr-figure-num" x="' + lbl.x + '" y="' + Math.round(lbl.y + 13) + '" font-size="11.5" font-weight="600" fill="var(--fig-text-muted, #52616d)">' + tk.escapeXml(lbl.val) + '</text>');
  });

  if (spec.yLabel) {
    parts.push(tk.renderLangText(spec.yLabel, padL, topY - 10, 'font-size="11.5" font-weight="600" fill="var(--fig-text-muted, #52616d)"', lang));
  }
  parts.push('</svg>');
  return { svg: parts.join(''), width: width, height: height };
}

function renderQuadrantChart(spec, opts) {
  var lang = (opts && opts.lang) || 'bilingual';
  var layout = spec.layout || {};
  var width = layout.width || 1040;
  var height = layout.height || 480;
  var header = renderChartHeader(spec, width, lang);
  var padL = 78;
  var padR = 54;
  var padT = header.topY + 14;
  var padB = 54;
  var plotW = width - padL - padR;
  var plotH = height - padT - padB;
  var midX = Math.round(padL + plotW / 2);
  var midY = Math.round(padT + plotH / 2);

  var parts = openChartSvg(spec, width, height, opts, '2x2 quadrant matrix with ' + ((spec.points || spec.items || []).length) + ' items');
  if (header.html) parts.push(header.html);

  // Outer frame + upper-right strategic quadrant subtle highlight
  parts.push('<rect x="' + padL + '" y="' + padT + '" width="' + plotW + '" height="' + plotH + '" rx="16" fill="var(--fig-group-bg-2, rgba(244,248,252,0.72))" stroke="var(--fig-group-border, rgba(23,36,48,0.11))" stroke-width="1.25"/>');
  parts.push('<rect x="' + midX + '" y="' + padT + '" width="' + (padL + plotW - midX) + '" height="' + (midY - padT) + '" rx="14" fill="var(--fig-quadrant-tint, rgba(13,143,140,0.05))"/>');
  parts.push('<line x1="' + midX + '" y1="' + padT + '" x2="' + midX + '" y2="' + (padT + plotH) + '" stroke="var(--fig-axis-line, rgba(23,36,48,0.24))" stroke-width="1.35" stroke-dasharray="6 5"/>');
  parts.push('<line x1="' + padL + '" y1="' + midY + '" x2="' + (padL + plotW) + '" y2="' + midY + '" stroke="var(--fig-axis-line, rgba(23,36,48,0.24))" stroke-width="1.35" stroke-dasharray="6 5"/>');

  // Quadrant corner watermarks: [topLeft, topRight, bottomLeft, bottomRight]
  var quads = spec.quadrants || {};
  if (quads.topLeft) parts.push(tk.renderLangText(quads.topLeft, padL + 18, padT + 26, 'font-size="12.5" font-weight="700" fill="var(--fig-text-subtle, #64748b)"', lang));
  if (quads.topRight) parts.push(tk.renderLangText(quads.topRight, padL + plotW - 18, padT + 26, 'text-anchor="end" font-size="12.5" font-weight="700" fill="var(--fig-role-teal-text, #115e59)"', lang));
  if (quads.bottomLeft) parts.push(tk.renderLangText(quads.bottomLeft, padL + 18, padT + plotH - 14, 'font-size="12.5" font-weight="700" fill="var(--fig-text-subtle, #64748b)"', lang));
  if (quads.bottomRight) parts.push(tk.renderLangText(quads.bottomRight, padL + plotW - 18, padT + plotH - 14, 'text-anchor="end" font-size="12.5" font-weight="700" fill="var(--fig-role-amber-text, #78350f)"', lang));

  // Axis labels
  if (spec.xAxis) {
    parts.push(tk.renderLangText(spec.xAxis, midX, height - 16, 'text-anchor="middle" font-size="13" font-weight="700" fill="var(--fig-text-muted, #52616d)"', lang));
  }
  if (spec.yAxis) {
    var yCenter = Math.round(padT + plotH / 2);
    parts.push('<g transform="translate(26,' + yCenter + ') rotate(-90)">' +
      tk.renderLangText(spec.yAxis, 0, 0, 'text-anchor="middle" font-size="13" font-weight="700" fill="var(--fig-text-muted, #52616d)"', lang) +
      '</g>');
  }

  var points = spec.points || spec.items || [];
  var placed = points.map(function (pt, idx) {
    var nx = Math.max(6, Math.min(94, Number(pt.x)));
    var ny = Math.max(8, Math.min(92, Number(pt.y)));
    var px = Math.round(padL + (nx / 100) * plotW);
    var py = Math.round(padT + plotH - (ny / 100) * plotH);
    var rStyle = tk.getRoleStyle(pt.role || (idx === 0 ? 'actor' : idx === 1 ? 'interface' : idx === 2 ? 'service' : 'data'));
    var radius = pt.r || 8.5;
    var placeLeft = nx > 72 || pt.labelSide === 'left';
    var lx = placeLeft ? px - radius - 12 : px + radius + 12;
    var anchor = placeLeft ? 'end' : 'start';
    var ly = ny > 86 ? py + 14 : py - 4;
    var pairL = tk.parseBilingualValue(pt.label);
    var pairD = tk.parseBilingualValue(pt.detail || '');
    var estW = Math.max(
      tk.measureText(pairL.zh, 13.5), tk.measureText(pairL.en, 13.5),
      tk.measureText(pairD.zh, 11.5), tk.measureText(pairD.en, 11.5)
    ) + 12;
    var boxX1 = anchor === 'end' ? lx - estW : lx;
    var boxX2 = anchor === 'end' ? lx : lx + estW;
    return {
      pt: pt, idx: idx, px: px, py: py, rStyle: rStyle, radius: radius,
      lx: lx, ly: ly, anchor: anchor, boxX1: boxX1, boxX2: boxX2
    };
  });

  // De-overlap quadrant point text labels whose horizontal spans intersect
  var sortedLabels = placed.slice().sort(function (a, b) { return a.ly - b.ly; });
  for (var pass = 0; pass < 3; pass++) {
    for (var m = 0; m < sortedLabels.length; m++) {
      for (var n = m + 1; n < sortedLabels.length; n++) {
        var A = sortedLabels[m];
        var B = sortedLabels[n];
        var xOverlap = Math.min(A.boxX2, B.boxX2) - Math.max(A.boxX1, B.boxX1) > -8;
        if (xOverlap && Math.abs(B.ly - A.ly) < 36) {
          var midLbl = (A.ly + B.ly) / 2;
          A.ly = Math.max(padT + 38, Math.round(midLbl - 19));
          B.ly = Math.min(padT + plotH - 28, Math.round(midLbl + 19));
        }
      }
    }
  }

  placed.forEach(function (item) {
    parts.push('<g data-point-id="' + tk.escapeXml(item.pt.id || ('pt-' + item.idx)) + '">');
    parts.push('<circle cx="' + item.px + '" cy="' + item.py + '" r="' + (item.radius + 6) + '" fill="' + item.rStyle.fill + '" stroke="' + item.rStyle.stroke + '" stroke-width="1"/>');
    parts.push('<circle cx="' + item.px + '" cy="' + item.py + '" r="' + item.radius + '" fill="' + item.rStyle.bar + '"/>');
    parts.push(tk.renderLangText(item.pt.label, item.lx, item.ly, 'text-anchor="' + item.anchor + '" font-size="13.5" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
    if (item.pt.detail) {
      parts.push(tk.renderLangText(item.pt.detail, item.lx, item.ly + 17, 'text-anchor="' + item.anchor + '" font-size="11.5" font-weight="500" fill="var(--fig-text-muted, #52616d)"', lang));
    }
    parts.push('</g>');
  });

  parts.push('</svg>');
  return { svg: parts.join(''), width: width, height: height };
}

function renderRadarChart(spec, opts) {
  var lang = (opts && opts.lang) || 'bilingual';
  var layout = spec.layout || {};
  var width = layout.width || 920;
  var height = layout.height || 440;
  var header = renderChartHeader(spec, width, lang);
  var axes = spec.axes || spec.dimensions || [];
  var series = spec.series || [];
  var maxVal = spec.max || 100;
  var cx = Math.round(width / 2);
  var cy = Math.round((height + header.topY + 12) / 2);
  var radius = Math.min(width * 0.34, (height - header.topY - 64) * 0.44);
  var count = Math.max(3, axes.length);

  var parts = openChartSvg(spec, width, height, opts, 'Radar capability chart with ' + count + ' axes');
  if (header.html) parts.push(header.html);
  if (series.length > 1) parts.push(renderInlineLegend(series, width - 36, header.topY + 6, lang));

  // Concentric polygon rings
  [0.25, 0.5, 0.75, 1].forEach(function (ring) {
    var ringPts = [];
    for (var i = 0; i < count; i++) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      ringPts.push(Math.round(cx + Math.cos(ang) * radius * ring) + ',' + Math.round(cy + Math.sin(ang) * radius * ring));
    }
    parts.push('<polygon points="' + ringPts.join(' ') + '" fill="none" stroke="var(--fig-grid-line, rgba(23,36,48,0.09))" stroke-width="1"' + (ring < 1 ? ' stroke-dasharray="4 4"' : '') + '/>');
  });

  // Spokes & outer labels
  axes.forEach(function (ax, i) {
    var ang = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    var xEnd = Math.round(cx + Math.cos(ang) * radius);
    var yEnd = Math.round(cy + Math.sin(ang) * radius);
    parts.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + xEnd + '" y2="' + yEnd + '" stroke="var(--fig-axis-line, rgba(23,36,48,0.24))" stroke-width="1"/>');
    var lx = Math.round(cx + Math.cos(ang) * (radius + 24));
    var ly = Math.round(cy + Math.sin(ang) * (radius + 20)) + 4;
    var anchor = Math.abs(Math.cos(ang)) < 0.2 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
    parts.push(tk.renderLangText(ax.label || ax, lx, ly, 'text-anchor="' + anchor + '" font-size="12.5" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
  });

  // Polygons per series
  series.forEach(function (s, sIdx) {
    var col = tk.getSeriesColor(sIdx, s.role || s.color);
    var vals = s.values || [];
    var polyPts = [];
    var dots = [];
    for (var i = 0; i < count; i++) {
      var v = Math.max(0, Math.min(maxVal, Number(vals[i]) || 0)) / maxVal;
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      var px = Math.round((cx + Math.cos(ang) * radius * v) * 10) / 10;
      var py = Math.round((cy + Math.sin(ang) * radius * v) * 10) / 10;
      polyPts.push(px + ',' + py);
      dots.push([px, py]);
    }
    parts.push('<polygon points="' + polyPts.join(' ') + '" fill="' + col + '" fill-opacity="0.16" stroke="' + col + '" stroke-width="2.2"/>');
    dots.forEach(function (d) {
      parts.push('<circle cx="' + d[0] + '" cy="' + d[1] + '" r="3.8" fill="var(--fig-port-fill, #ffffff)" stroke="' + col + '" stroke-width="2"/>');
    });
  });

  parts.push('</svg>');
  return { svg: parts.join(''), width: width, height: height };
}

function renderFunnelChart(spec, opts) {
  var lang = (opts && opts.lang) || 'bilingual';
  var layout = spec.layout || {};
  var width = layout.width || 960;
  var stages = spec.stages || spec.data || [];
  var header = renderChartHeader(spec, width, lang);
  var stageH = 56;
  var gap = 10;
  var topY = header.topY + 14;
  var height = layout.height || (topY + stages.length * (stageH + gap) + 28);
  var maxVal = Math.max.apply(null, stages.map(function (s) { return Number(s.value) || 1; }).concat([1]));
  var centerX = Math.round(width * 0.44);
  var maxBarW = Math.round(width * 0.56);

  var parts = openChartSvg(spec, width, height, opts, 'Funnel flow chart with ' + stages.length + ' stages');
  if (header.html) parts.push(header.html);

  stages.forEach(function (st, idx) {
    var vCurr = Number(st.value) || 0;
    var vNext = idx + 1 < stages.length ? (Number(stages[idx + 1].value) || vCurr * 0.8) : vCurr * 0.82;
    var wTop = Math.max(90, Math.round((vCurr / maxVal) * maxBarW));
    var wBot = Math.max(76, Math.round((vNext / maxVal) * maxBarW));
    var y0 = topY + idx * (stageH + gap);
    var y1 = y0 + stageH;
    var pts = [
      (centerX - Math.round(wTop / 2)) + ',' + y0,
      (centerX + Math.round(wTop / 2)) + ',' + y0,
      (centerX + Math.round(wBot / 2)) + ',' + y1,
      (centerX - Math.round(wBot / 2)) + ',' + y1
    ].join(' ');
    var col = tk.getSeriesColor(idx, st.role || st.color);
    parts.push('<polygon points="' + pts + '" fill="' + col + '" fill-opacity="0.82" stroke="var(--fig-node-border, rgba(23,36,48,0.13))" stroke-width="1"/>');
    parts.push('<text class="sr-figure-num" x="' + centerX + '" y="' + (y0 + 34) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">' + tk.escapeXml(formatNum(vCurr, spec.unit || '')) + '</text>');
    parts.push(tk.renderLangText(st.label, centerX + Math.round(maxBarW / 2) + 24, y0 + 33, 'font-size="13.5" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
  });

  parts.push('</svg>');
  return { svg: parts.join(''), width: width, height: height };
}

function isChartType(type) {
  var t = String(type || '').toLowerCase();
  return t === 'bar' || t === 'line' || t === 'area' || t === 'quadrant' || t === 'matrix' || t === 'radar' || t === 'funnel' || t === 'sankey';
}

function renderChart(spec, options) {
  var t = String(spec.type || '').toLowerCase();
  if (t === 'bar') return renderBarChart(spec, options);
  if (t === 'line' || t === 'area') return renderLineOrAreaChart(spec, options);
  if (t === 'quadrant' || t === 'matrix') return renderQuadrantChart(spec, options);
  if (t === 'radar') return renderRadarChart(spec, options);
  if (t === 'funnel' || t === 'sankey') return renderFunnelChart(spec, options);
  throw new Error('Unsupported chart type: ' + spec.type);
}

module.exports = {
  isChartType: isChartType,
  renderChart: renderChart,
  catmullRomToBezier: catmullRomToBezier
};

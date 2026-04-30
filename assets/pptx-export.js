/**
 * pptx-export.js — PptxGenJS renderers for Study Room articles (v3).
 * Architecture: Slide Masters + Generalized renderers + Unified dispatcher.
 *
 * Typography hierarchy (widescreen 13.33 × 7.5 in):
 *   Slide Title 28pt · Component Heading 20pt · Body 12pt · Supporting 11pt · Label 10pt
 */
(function () {
  'use strict';
  var SW = 13.333, SH = 7.5, MX = 0.72;
  var BY = 1.42, BH = 5.58, BW = SW - MX * 2;
  var GAP = 0.18, R = 0.12;
  var FT = 'Aptos Display', FB = 'Aptos', FL = 'Aptos';
  var lp = { bg: 'FCF6EE', text: '172430', muted: '5D6C76', accent: 'FF7A00', alt: '0D8F8C', cardBg: 'FFFFFF', border: 'E8DDD2' };
  var dp = { bg: '0F1318', text: 'E4E6EA', muted: '9CA3AF', accent: 'FF9340', alt: '77D7D0', cardBg: '1E2630', border: '2A3440' };
  function pal() { return document.documentElement.getAttribute('data-theme') === 'dark' ? dp : lp; }
  function tx(el) { if (!el) return ''; return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function hid(el) { if (!el) return true; var s = window.getComputedStyle(el); return s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0; }
  function qs(p, s) { return p ? p.querySelector(s) : null; }
  function qa(p, s) { return p ? Array.prototype.slice.call(p.querySelectorAll(s)) : []; }
  function grid(total, n, gap) { if (n <= 0) return []; var w = (total - gap * (n - 1)) / n; var r = []; for (var i = 0; i < n; i++) r.push({ x: i * (w + gap), w: w }); return r; }
  // Estimate text box height: chars / chars-per-line * line-height; fontSize in pt, w in inches
  function estTextH(text, fontSize, w, lineSpacing) {
    if (!text) return 0;
    var cpl = Math.max(1, Math.floor(w * 72 / (fontSize * 0.55))); // ~0.55 avg char width ratio
    var lines = Math.ceil(text.length / cpl);
    var lh = (fontSize / 72) * (lineSpacing || 1.3);
    return Math.max(0.28, lines * lh + 0.08);
  }

  function setupMasters(pptx, p) {
    pptx.theme = { headFontFace: FT, bodyFontFace: FB };
    pptx.defineSlideMaster({ title: 'CONTENT_MASTER', background: { color: p.bg }, objects: [{ rect: { x: MX, y: 0.30, w: 2.2, h: 0.04, fill: { color: p.accent } } }], slideNumber: { x: SW - 1.6, y: 0.38, w: 1.2, h: 0.22, align: 'right', fontFace: FL, fontSize: 9, color: p.muted } });
  }
  function addContentSlide(pptx, step, si, gi, total, p, dL, dT) {
    var sl = pptx.addSlide({ masterName: 'CONTENT_MASTER' });
    sl.addText(dL(step, si), { x: MX, y: 0.42, w: 10, h: 0.26, margin: 0, fontFace: FL, fontSize: 11, bold: true, color: p.alt, charSpacing: 1.5 });
    sl.addText(dT(step, si), { x: MX, y: 0.72, w: 11.2, h: 0.56, margin: 0, fontFace: FT, fontSize: 28, bold: true, color: p.text, shrinkText: true });
    return sl;
  }

  function heroSlide(pptx, step, p) {
    var sl = pptx.addSlide(); sl.background = { color: p.bg };
    var copy = qs(step, '.hero-copy'), eye = qs(step, '.eyebrow'), h1 = qs(step, 'h1');
    var desc = copy ? qs(copy, 'p') : null;
    var panel = qs(step, '.hero-panel'), mets = qa(step, '.metric');
    var leftW = 6.8, panelH = 0, metH = mets.length ? 1.60 : 0;

    // ── Measure left column height ──
    var leftH = 0.14; // accent bar + gap
    var eyeH = eye ? 0.30 : 0; leftH += eyeH + (eye ? 0.08 : 0);
    var h1H = h1 ? Math.max(0.60, estTextH(tx(h1), 36, 7.2, 1.1)) : 0; leftH += h1H + (h1 ? 0.08 : 0);
    var descH = desc ? Math.max(0.40, estTextH(tx(desc), 16, leftW, 1.5)) : 0; leftH += descH;

    // ── Measure panel height ──
    if (panel) {
      var pH2 = qs(panel, 'h2'), pD = qs(panel, 'p'), pLL = qs(panel, '.layer-list'), pLIs = pLL ? qa(pLL, 'li') : [];
      var px = 7.8, pw = SW - px - MX;
      var piy = 0.28;
      var ph2H = 0, pdescH = 0, plisH = 0;
      if (pH2) { ph2H = Math.max(0.50, estTextH(tx(pH2), 20, pw - 0.6, 1.25)); piy += ph2H + 0.06; }
      if (pD) { pdescH = Math.max(0.40, estTextH(tx(pD), 14, pw - 0.6, 1.4)); piy += pdescH + 0.06; }
      pLIs.forEach(function (li) {
        var rest = tx(li); var nm = qs(li, '.layer-number'); if (nm) rest = rest.replace(tx(nm), '').trim();
        var liH = Math.max(0.36, estTextH(rest, 13, pw - 0.96, 1.2));
        plisH += liH + 0.04;
      });
      piy += plisH + 0.16;
      panelH = Math.max(2.4, piy);
    }

    // ── Compute startY to vertically center everything ──
    var tallest = Math.max(leftH, panelH);
    var totalH = tallest + (metH > 0 ? 0.30 + metH : 0);
    var startY = Math.max(0.30, (SH - totalH) / 2);
    var cy = startY;

    // ── Render left column ──
    sl.addShape('rect', { x: MX, y: cy, w: 2.6, h: 0.05, fill: { color: p.accent } }); cy += 0.14;
    if (eye) { sl.addText(tx(eye), { x: MX, y: cy, w: 6, h: eyeH, margin: 0, fontFace: FL, fontSize: 12, bold: true, color: p.alt, charSpacing: 2 }); cy += eyeH + 0.08; }
    if (h1) { sl.addText(tx(h1), { x: MX, y: cy, w: 7.2, h: h1H, margin: 0, fontFace: FT, fontSize: 36, bold: true, color: p.text, shrinkText: true, valign: 'top' }); cy += h1H + 0.08; }
    if (desc) { sl.addText(tx(desc), { x: MX, y: cy, w: leftW, h: descH, margin: 0, fontFace: FB, fontSize: 16, color: p.muted, lineSpacingMultiple: 1.5, valign: 'top' }); cy += descH; }

    // ── Render panel ──
    if (panel) {
      sl.addShape('roundRect', { x: px, y: startY, w: pw, h: panelH, fill: { color: p.text }, rectRadius: R });
      var pcy = startY + 0.28;
      if (pH2) { sl.addText(tx(pH2), { x: px + 0.3, y: pcy, w: pw - 0.6, h: ph2H, margin: 0, fontFace: FT, fontSize: 20, bold: true, color: p.bg, valign: 'top' }); pcy += ph2H + 0.06; }
      if (pD) { sl.addText(tx(pD), { x: px + 0.3, y: pcy, w: pw - 0.6, h: pdescH, margin: 0, fontFace: FB, fontSize: 14, color: p.muted, lineSpacingMultiple: 1.4, valign: 'top', shrinkText: true }); pcy += pdescH + 0.06; }
      pLIs.forEach(function (li) { if (pcy > startY + panelH - 0.2) return; var nm = qs(li, '.layer-number'), num = nm ? tx(nm) : '', rest = tx(li).replace(num, '').trim(); var liH = Math.max(0.36, estTextH(rest, 13, pw - 0.96, 1.2)); sl.addShape('roundRect', { x: px + 0.3, y: pcy + 0.02, w: 0.28, h: 0.28, fill: { color: p.bg, transparency: 80 }, rectRadius: 0.04 }); sl.addText(num, { x: px + 0.3, y: pcy + 0.02, w: 0.28, h: 0.28, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 10, bold: true, color: p.bg }); sl.addText(rest, { x: px + 0.66, y: pcy, w: pw - 0.96, h: liH, margin: 0, fontFace: FB, fontSize: 13, color: p.muted, valign: 'middle', shrinkText: true }); pcy += liH + 0.04; });
    }

    // ── Render metric cards ──
    if (mets.length) {
      var my = startY + tallest + 0.30, mc = grid(BW, mets.length, GAP);
      mets.forEach(function (m, i) { var c = mc[i] || mc[0], mx = MX + c.x; var lab = qs(m, '.metric-label'), val = qs(m, 'strong'), det = qs(m, 'span'); sl.addShape('roundRect', { x: mx, y: my, w: c.w, h: 1.60, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R }); if (lab) sl.addText(tx(lab), { x: mx + 0.2, y: my + 0.14, w: c.w - 0.4, h: 0.24, margin: 0, fontFace: FL, fontSize: 10, color: p.muted, charSpacing: 1.5, bold: true }); if (val) sl.addText(tx(val), { x: mx + 0.2, y: my + 0.42, w: c.w - 0.4, h: 0.50, margin: 0, fontFace: FT, fontSize: 28, bold: true, color: p.accent, shrinkText: true }); if (det) sl.addText(tx(det), { x: mx + 0.2, y: my + 0.98, w: c.w - 0.4, h: 0.50, margin: 0, fontFace: FB, fontSize: 12, color: p.muted, lineSpacingMultiple: 1.35, valign: 'top' }); });
    }
  }

  function renderCard(sl, el, x, y, w, maxH, p) {
    var label = qs(el, '.track-label, .rule-tag, .era-label, .attr-tag, .comparison-label');
    var heading = qs(el, 'h3') || qs(el, 'h4');
    var paras = qa(el, ':scope > p');
    var fl = qs(el, ':scope > .flow-list, :scope > ol.flow-list');
    var rl = qs(el, ':scope > .reference-list, :scope > ul.reference-list');
    var cl = qs(el, ':scope > .challenge-list');
    var ll = qs(el, ':scope > .layer-list');
    var tbl = qs(el, ':scope > table, :scope > .spec-table, :scope > .score-table');
    var headerH = 0.14 + (label ? 0.32 : 0) + (heading ? 0.42 : 0);
    var bodyH = 0;
    paras.forEach(function (pp) { bodyH += estTextH(tx(pp), 12, w - 0.32, 1.3); });
    if (fl || rl || cl || ll || tbl) bodyH = Math.max(bodyH, 1.2);
    var estH = Math.min(maxH, Math.max(0.80, headerH + bodyH + 0.14));
    sl.addShape('roundRect', { x: x, y: y, w: w, h: estH, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R });
    var iy = 0.14;
    if (label) { var lw = Math.min(2.2, tx(label).length * 0.09 + 0.4); sl.addShape('roundRect', { x: x + 0.16, y: y + iy, w: lw, h: 0.26, fill: { color: p.accent, transparency: 80 }, rectRadius: 0.05 }); sl.addText(tx(label), { x: x + 0.16, y: y + iy, w: lw, h: 0.26, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 10, bold: true, color: p.accent }); iy += 0.32; }
    if (heading) { sl.addText(tx(heading), { x: x + 0.16, y: y + iy, w: w - 0.32, h: 0.36, margin: 0, fontFace: FT, fontSize: 20, bold: true, color: p.text, shrinkText: true }); iy += 0.42; }
    var cH = estH - iy - 0.10; if (cH < 0.1) return y + estH + GAP;
    if (fl) { renderFlowList(sl, fl, x + 0.16, y + iy, w - 0.32, cH, p); return y + estH + GAP; }
    if (rl || cl) { renderListItems(sl, rl || cl, x + 0.12, y + iy, w - 0.24, cH, p); return y + estH + GAP; }
    if (ll) { renderLayerList(sl, ll, x + 0.16, y + iy, w - 0.32, cH, p); return y + estH + GAP; }
    if (tbl) { renderTable(sl, tbl, x + 0.12, y + iy, w - 0.24, cH, p); return y + estH + GAP; }
    var parts = []; paras.forEach(function (pp) { var t = tx(pp); if (t) parts.push({ text: t + '\n\n', options: { fontSize: 12, color: p.muted } }); });
    if (!parts.length) { var all = tx(el); if (label) all = all.replace(tx(label), ''); if (heading) all = all.replace(tx(heading), ''); all = all.trim(); if (all) parts.push({ text: all, options: { fontSize: 12, color: p.muted } }); }
    if (parts.length) sl.addText(parts, { x: x + 0.16, y: y + iy, w: w - 0.32, h: cH, margin: 0, fontFace: FB, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true });
    return y + estH + GAP;
  }

  function renderListItems(sl, el, x, y, w, maxH, p) {
    var items = qa(el, 'li');
    items.forEach(function (li) { var t = tx(li); var rH = Math.max(0.44, estTextH(t, 12, w - 0.24, 1.15)); rH = Math.min(rH, 1.0); if (y + rH > BY + BH - 0.05) return; sl.addShape('roundRect', { x: x, y: y, w: w, h: rH, fill: { color: p.cardBg }, line: { color: p.border, width: 0.5 }, rectRadius: 0.05 }); var strong = qs(li, 'strong'); if (strong) { var sT = tx(strong), rest = t.replace(sT, '').replace(/^\s*[—\-]\s*/, '').trim(); sl.addText([{ text: sT, options: { bold: true, fontSize: 12, color: p.text } }, { text: rest ? ' — ' + rest : '', options: { fontSize: 12, color: p.muted } }], { x: x + 0.12, y: y, w: w - 0.24, h: rH, margin: 0, fontFace: FB, lineSpacingMultiple: 1.15, valign: 'middle', shrinkText: true }); } else { sl.addText(t, { x: x + 0.12, y: y, w: w - 0.24, h: rH, margin: 0, fontFace: FB, fontSize: 12, color: p.text, lineSpacingMultiple: 1.15, valign: 'middle', shrinkText: true }); } y += rH + 0.04; });
    return y;
  }

  function renderFlowList(sl, el, x, y, w, maxH, p) {
    var items = qa(el, 'li'), sy = y;
    items.forEach(function (item) { if (y - sy > maxH - 0.30 || y > BY + BH - 0.3) return; var se = qs(item, '.flow-step'), co = qs(item, '.flow-copy'); var title = co ? qs(co, 'strong') : null, desc = co ? qs(co, 'p') : null; var num = se ? tx(se) : '', tS = title ? tx(title) : '', dS = desc ? tx(desc) : ''; sl.addShape('ellipse', { x: x, y: y + 0.02, w: 0.36, h: 0.36, fill: { color: p.accent } }); sl.addText(num, { x: x, y: y + 0.02, w: 0.36, h: 0.36, margin: 0, align: 'center', fontFace: FT, fontSize: 14, bold: true, color: 'FFFFFF', valign: 'middle' }); if (tS && dS) { sl.addText(tS, { x: x + 0.46, y: y, w: w - 0.46, h: 0.36, margin: 0, fontFace: FT, fontSize: 20, bold: true, color: p.text, valign: 'middle' }); y += 0.40; var dh = Math.min(0.44, maxH - (y - sy) - 0.06); if (dh > 0.10) { sl.addText(dS, { x: x + 0.46, y: y, w: w - 0.46, h: dh, margin: 0, fontFace: FB, fontSize: 11, color: p.muted, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true }); y += dh + 0.06; } } else if (tS) { sl.addText(tS, { x: x + 0.46, y: y, w: w - 0.46, h: 0.38, margin: 0, fontFace: FT, fontSize: 20, bold: true, color: p.text, valign: 'middle' }); y += 0.44; } });
    return y;
  }

  function renderLayerList(sl, el, x, y, w, maxH, p) {
    qa(el, 'li').forEach(function (li) { if (y > BY + BH - 0.3) return; var nm = qs(li, '.layer-number'), num = nm ? tx(nm) : '', rest = tx(li).replace(num, '').trim(); sl.addText(num, { x: x, y: y, w: 0.30, h: 0.30, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 11, bold: true, color: p.accent, fill: { color: p.accent, transparency: 90 } }); sl.addText(rest, { x: x + 0.38, y: y, w: w - 0.38, h: 0.36, margin: 0, fontFace: FB, fontSize: 14, color: p.text, lineSpacingMultiple: 1.2, valign: 'middle', shrinkText: true }); y += 0.42; });
    return y;
  }

  function renderTable(sl, el, x, y, w, maxH, p) {
    var rows = qa(el, 'tr'); if (!rows.length) return y; var data = [];
    rows.forEach(function (tr) { var cells = qa(tr, 'th, td'), row = []; cells.forEach(function (c) { row.push({ text: tx(c), options: { fontFace: FB, fontSize: 12, color: c.tagName === 'TH' ? p.alt : p.text, bold: c.tagName === 'TH', fill: { color: c.tagName === 'TH' ? p.alt : p.cardBg, transparency: c.tagName === 'TH' ? 93 : 0 }, border: { type: 'solid', pt: 0.5, color: p.border }, valign: 'middle', margin: [4, 6, 4, 6] } }); }); if (row.length) data.push(row); });
    if (!data.length) return y; var nC = data[0].length, cw = []; for (var i = 0; i < nC; i++) cw.push(w / nC);
    sl.addTable(data, { x: x, y: y, w: w, colW: cw, rowH: 0.38, fontFace: FB, fontSize: 12, autoPage: false, align: 'left', valign: 'middle' });
    return y + Math.min(maxH, data.length * 0.38 + 0.1) + GAP;
  }

  function renderQuote(sl, el, x, y, w, p) {
    var t = tx(el); if (!t) return y; var h = Math.min(1.2, Math.max(0.56, t.length / 120 + 0.35));
    sl.addShape('roundRect', { x: x, y: y, w: w, h: h, fill: { color: p.accent, transparency: 95 }, line: { color: p.accent, transparency: 80, width: 0.5 }, rectRadius: R });
    sl.addShape('rect', { x: x, y: y, w: 0.05, h: h, fill: { color: p.accent } });
    sl.addText(t, { x: x + 0.20, y: y + 0.06, w: w - 0.34, h: h - 0.12, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: p.text, lineSpacingMultiple: 1.35, valign: 'middle', shrinkText: true });
    return y + h + GAP;
  }

  function renderInsightGrid(sl, el, y, p) {
    var cards = qa(el, '.insight-card, .attr-card'); if (!cards.length) return y;
    var cols = Math.min(cards.length, 4), cc = grid(BW, cols, GAP);
    // Measure max card height per row
    var cardHeights = [];
    cards.forEach(function (card, i) {
      var c = cc[i % cols], idx = qs(card, '.card-index'), atag = qs(card, '.attr-tag'), h3 = qs(card, 'h3'), pp = qa(card, 'p');
      var iy = 0.14 + (idx ? 0.36 : (atag ? 0.30 : 0)) + (h3 ? 0.40 : 0);
      var bodyH = 0; pp.forEach(function (pe) { bodyH += estTextH(tx(pe), 11, c.w - 0.28, 1.25); });
      cardHeights.push(Math.max(1.2, iy + bodyH + 0.14));
    });
    var rows = Math.ceil(cards.length / cols);
    var rowHeights = [];
    for (var ri = 0; ri < rows; ri++) {
      var maxH = 0;
      for (var ci = 0; ci < cols; ci++) { var idx2 = ri * cols + ci; if (idx2 < cardHeights.length) maxH = Math.max(maxH, cardHeights[idx2]); }
      rowHeights.push(Math.min(maxH, BH - 0.2));
    }
    cards.forEach(function (card, i) {
      var c = cc[i % cols], rowIdx = Math.floor(i / cols);
      var ro = 0; for (var rr = 0; rr < rowIdx; rr++) ro += rowHeights[rr] + GAP;
      var ch = rowHeights[rowIdx], cx = MX + c.x, cy = y + ro;
      var idx = qs(card, '.card-index'), atag = qs(card, '.attr-tag'), h3 = qs(card, 'h3'), pp = qa(card, 'p');
      sl.addShape('roundRect', { x: cx, y: cy, w: c.w, h: ch, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R });
      var iy = 0.14;
      if (idx) { var idxW = Math.max(0.34, tx(idx).length * 0.09 + 0.20); sl.addShape('roundRect', { x: cx + 0.14, y: cy + iy, w: idxW, h: 0.28, fill: { color: p.accent, transparency: 86 }, rectRadius: 0.14 }); sl.addText(tx(idx), { x: cx + 0.14, y: cy + iy, w: idxW, h: 0.28, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 11, bold: true, color: p.accent }); iy += 0.36; }
      else if (atag) { sl.addShape('roundRect', { x: cx + 0.14, y: cy + iy, w: 0.60, h: 0.22, fill: { color: p.accent, transparency: 82 }, rectRadius: 0.04 }); sl.addText(tx(atag), { x: cx + 0.14, y: cy + iy, w: 0.60, h: 0.22, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 9, bold: true, color: p.accent }); iy += 0.30; }
      if (h3) { sl.addText(tx(h3), { x: cx + 0.14, y: cy + iy, w: c.w - 0.28, h: 0.34, margin: 0, fontFace: FT, fontSize: 16, bold: true, color: p.text, shrinkText: true }); iy += 0.40; }
      var ptexts = []; pp.forEach(function (pe) { var t = tx(pe); if (t) ptexts.push({ text: t + '\n', options: { fontSize: 11, color: p.muted } }); });
      if (ptexts.length) sl.addText(ptexts, { x: cx + 0.14, y: cy + iy, w: c.w - 0.28, h: ch - iy - 0.10, margin: 0, fontFace: FB, lineSpacingMultiple: 1.25, valign: 'top', shrinkText: true });
    });
    var totalH = 0; for (var rh = 0; rh < rowHeights.length; rh++) totalH += rowHeights[rh] + GAP;
    return y + totalH;
  }

  function renderCompGrid(sl, el, y, p) {
    var cards = qa(el, ':scope > .comparison-card, :scope > .comparison-cell'); if (!cards.length) return y;
    var cc = grid(BW, Math.min(cards.length, 2), GAP), ch = Math.min(4.2, BY + BH - y);
    cards.forEach(function (card, i) { renderCard(sl, card, MX + cc[i % cc.length].x, y, cc[i % cc.length].w, ch, p); });
    return y + ch + GAP;
  }

  function renderAccordion(sl, el, y, p) {
    qa(el, '.subsection-item').forEach(function (item) { var tog = qs(item, '.subsection-toggle'); if (!tog || y > BY + BH - 0.50) return; sl.addShape('roundRect', { x: MX, y: y, w: BW, h: 0.46, fill: { color: p.cardBg }, line: { color: p.border, width: 0.5 }, rectRadius: 0.06 }); sl.addText(tx(tog), { x: MX + 0.14, y: y, w: BW - 0.28, h: 0.46, margin: 0, fontFace: FT, fontSize: 20, bold: true, color: p.text, valign: 'middle' }); y += 0.52; });
    return y;
  }

  function renderBibList(sl, el, y, p) {
    var items = qa(el, 'li'), parts = [];
    items.forEach(function (li) { var id = qs(li, '.bib-id'), au = qs(li, '.bib-author'); var rest = tx(li), iT = id ? tx(id) : '', aT = au ? tx(au) : ''; parts.push({ text: iT + ' ', options: { bold: true, fontSize: 10, color: p.accent } }); parts.push({ text: aT + ' ', options: { bold: true, fontSize: 10, color: p.text } }); parts.push({ text: rest.replace(iT, '').replace(aT, '').trim() + '\n', options: { fontSize: 10, color: p.muted } }); });
    if (!parts.length) return y; var lh = Math.min(BH - (y - BY), 5.0);
    sl.addText(parts, { x: MX, y: y, w: BW, h: lh, margin: [0, 0, 0, 4], fontFace: FB, lineSpacingMultiple: 1.5, valign: 'top' });
    return y + lh;
  }

  // ═══════ Architecture Diagram Renderers ═══════
  var ARCH_COLORS = { 'arch-block-purple': '7C3AED', 'arch-block-blue': '0EA5E9', 'arch-block-teal': '14B8A6', 'arch-block-orange': 'F97316' };
  function getArchColor(el) { for (var k in ARCH_COLORS) { if (el.classList.contains(k)) return ARCH_COLORS[k]; } return null; }

  function renderArchBlock(sl, block, bx, by, bw, bh, p) {
    var bc = getArchColor(block) || p.muted;
    sl.addShape('roundRect', { x: bx, y: by, w: bw, h: bh, fill: { color: bc, transparency: 88 }, line: { color: bc, transparency: 65, width: 0.75 }, rectRadius: R });
    var strong = qs(block, 'strong'), hint = qs(block, '.arch-hint'), parts = [];
    if (strong) parts.push({ text: tx(strong) + '\n', options: { bold: true, fontSize: 14, color: bc } });
    var full = tx(block); if (strong) full = full.replace(tx(strong), ''); if (hint) full = full.replace(tx(hint), ''); full = full.replace(/\s+/g, ' ').trim();
    if (full) parts.push({ text: full + '\n', options: { fontSize: 11, color: p.text } });
    if (hint) parts.push({ text: tx(hint), options: { fontSize: 10, italic: true, color: p.muted } });
    if (parts.length) sl.addText(parts, { x: bx + 0.08, y: by + 0.05, w: bw - 0.16, h: bh - 0.10, margin: 0, fontFace: FB, align: 'center', valign: 'middle', lineSpacingMultiple: 1.2, shrinkText: true });
  }

  function renderArchLayer(sl, el, x, y, w, maxH, p) {
    var children = Array.prototype.slice.call(el.children), nRows = 0, nDivs = 0;
    children.forEach(function (c) { if (c.classList.contains('arch-layer-divider') || c.classList.contains('arch-layer-or')) nDivs++; else nRows++; });
    var divH = 0.30, rowH = nRows > 0 ? Math.min(1.10, (maxH - nDivs * divH - (nRows - 1) * GAP * 0.5) / nRows) : 0.90;
    var cy = y;
    children.forEach(function (child) {
      if (cy > y + maxH - 0.15) return;
      if (child.classList.contains('arch-layer-divider')) { sl.addText(tx(child), { x: x, y: cy, w: w, h: divH, margin: 0, align: 'center', fontFace: FB, fontSize: 14, color: p.muted, valign: 'middle' }); cy += divH; return; }
      if (child.classList.contains('arch-layer-or')) { sl.addText(tx(child), { x: x, y: cy, w: w, h: 0.24, margin: 0, align: 'center', fontFace: FL, fontSize: 10, bold: true, color: p.muted, charSpacing: 1.5 }); cy += 0.24; return; }
      var blocks = qa(child, '.arch-block'); if (!blocks.length && child.classList.contains('arch-block')) blocks = [child]; if (!blocks.length) return;
      var cols = grid(w, blocks.length, GAP);
      blocks.forEach(function (block, bi) { renderArchBlock(sl, block, x + cols[bi].x, cy, cols[bi].w, rowH, p); });
      cy += rowH + GAP * 0.5;
    });
    return cy;
  }

  function renderArchFlow(sl, el, x, y, w, maxH, p) {
    var children = Array.prototype.slice.call(el.children), nBlocks = 0, nArrows = 0;
    children.forEach(function (c) { if (c.classList.contains('arch-arrow')) nArrows++; else if (c.classList.contains('arch-block')) nBlocks++; });
    if (!nBlocks) return y;
    var arrowW = 0.36, blockW = (w - nArrows * arrowW) / nBlocks, blockH = Math.min(1.0, maxH), cx = x;
    children.forEach(function (c) {
      if (c.classList.contains('arch-arrow')) { sl.addText(tx(c), { x: cx, y: y, w: arrowW, h: blockH, margin: 0, align: 'center', fontFace: FB, fontSize: 16, color: p.muted, valign: 'middle' }); cx += arrowW; }
      else if (c.classList.contains('arch-block')) { renderArchBlock(sl, c, cx, y, blockW, blockH, p); cx += blockW; }
    });
    return y + blockH + GAP;
  }

  // ═══════ Specimen Grid Renderer (for design-system token/type/anim grids) ═══════
  function renderSpecimenGrid(sl, el, y, p) {
    var children = Array.prototype.slice.call(el.children).filter(function (c) { return !hid(c); });
    if (!children.length) return y;
    var cols = Math.min(children.length, 4), cc = grid(BW, cols, GAP), rH = 1.2;
    children.forEach(function (child, i) {
      var c = cc[i % cols], ro = Math.floor(i / cols) * (rH + GAP), cx = MX + c.x, cy = y + ro;
      sl.addShape('roundRect', { x: cx, y: cy, w: c.w, h: rH, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R });
      var t = tx(child); if (!t) return;
      sl.addText(t, { x: cx + 0.12, y: cy + 0.10, w: c.w - 0.24, h: rH - 0.20, margin: 0, fontFace: FB, fontSize: 11, color: p.text, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true });
    });
    return y + Math.ceil(children.length / cols) * (rH + GAP);
  }
  var SPECIMEN_GRID_CLS = ['token-grid', 'type-specimen', 'spacing-demo', 'radius-grid', 'shadow-grid', 'anim-grid'];
  function isSpecimenGrid(el) { for (var i = 0; i < SPECIMEN_GRID_CLS.length; i++) { if (el.classList.contains(SPECIMEN_GRID_CLS[i])) return true; } return false; }

  // ═══════ Unified Dispatcher ═══════
  var CARD_CLS = ['timeline-card', 'track-card', 'finding-card', 'rule-card', 'tier-card', 'workflow-card', 'step-card', 'capability-card', 'milestone-card', 'crate-card', 'present-step-block', 'verdict-box', 'token-card', 'type-row', 'anim-card', 'radius-card', 'shadow-card'];
  function isCard(el) { for (var i = 0; i < CARD_CLS.length; i++) { if (el.classList.contains(CARD_CLS[i])) return true; } return false; }
  function isList(el) { return el.classList.contains('reference-list') || el.classList.contains('challenge-list') || ((el.tagName === 'UL' || el.tagName === 'OL') && !el.classList.contains('bib-list') && !el.classList.contains('flow-list')); }
  function isTable(el) { return el.tagName === 'TABLE' || el.classList.contains('simple-table') || el.classList.contains('matrix-table') || el.classList.contains('spec-table') || el.classList.contains('score-table') || el.classList.contains('benchmark-table'); }
  function isDiagram(el) { return el.classList.contains('mesh-layout') || el.classList.contains('signal-map') || el.tagName === 'FIGURE' || el.classList.contains('architecture-figure') || el.classList.contains('quadrant-board') || el.classList.contains('mesh-board') || el.classList.contains('slide-mockup') || el.classList.contains('demo-block') || el.querySelector('svg'); }

  function dispatch(sl, children, y, p) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (hid(c) || y > BY + BH - 0.15) continue;
      if (c.classList.contains('topbar') || c.classList.contains('section-head') || c.classList.contains('present-inline-head') || c.classList.contains('subsection-toggle')) continue;
      if (c.classList.contains('attr-card') || c.classList.contains('insight-card')) continue;
      if (c.classList.contains('insight-grid')) { y = renderInsightGrid(sl, c, y, p); continue; }
      if (c.classList.contains('comparison-grid')) { y = renderCompGrid(sl, c, y, p); continue; }
      if (c.classList.contains('comparison-card')) { y = renderCard(sl, c, MX, y, BW, Math.min(4.0, BY + BH - y), p); continue; }
      if (c.classList.contains('subsection-accordion')) { y = renderAccordion(sl, c, y, p); continue; }
      if (c.classList.contains('flow-list')) { y = renderFlowList(sl, c, MX, y, BW, BY + BH - y, p); continue; }
      if ((c.classList.contains('bib-list') || c.tagName === 'OL') && qs(c, '.bib-id')) { y = renderBibList(sl, c, y, p); continue; }
      if (isList(c)) { y = renderListItems(sl, c, MX + 0.06, y, BW - 0.12, BY + BH - y, p); continue; }
      if (c.classList.contains('quote-block')) { y = renderQuote(sl, c, MX, y, BW, p); continue; }
      if (isSpecimenGrid(c)) { y = renderSpecimenGrid(sl, c, y, p); continue; }
      if (isTable(c)) { y = renderTable(sl, c, MX, y, BW, BY + BH - y, p); continue; }
      if (c.classList.contains('tab-shell') || c.hasAttribute('data-tabs')) { qa(c, '.tab-panel').forEach(function (panel, idx) { var btns = qa(c, '.tab-button'), lbl = btns[idx] ? tx(btns[idx]) : 'Tab ' + (idx + 1), t = tx(panel); if (!t || y + 0.5 > BY + BH) return; sl.addShape('roundRect', { x: MX, y: y, w: BW, h: 0.30, fill: { color: idx === 0 ? p.accent : p.cardBg }, rectRadius: 0.04 }); sl.addText(lbl, { x: MX + 0.12, y: y, w: BW - 0.24, h: 0.30, margin: 0, fontFace: FL, fontSize: 12, bold: true, color: idx === 0 ? 'FFFFFF' : p.text, valign: 'middle' }); y += 0.34; var th = Math.min(1.0, BY + BH - y - 0.1); sl.addText(t, { x: MX + 0.12, y: y, w: BW - 0.24, h: th, margin: 0, fontFace: FB, fontSize: 14, color: p.muted, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true }); y += th + GAP; }); continue; }
      if (c.classList.contains('arch-layer')) { y = renderArchLayer(sl, c, MX, y, BW, Math.min(3.5, BY + BH - y), p); continue; }
      if (c.classList.contains('arch-flow')) { y = renderArchFlow(sl, c, MX, y, BW, Math.min(1.2, BY + BH - y), p); continue; }
      if (isDiagram(c)) {
        var svgPng = c.getAttribute('data-svg-png');
        if (svgPng) {
          var svg = c.querySelector('svg');
          var vb = svg && svg.viewBox && svg.viewBox.baseVal;
          var aspect = (vb && vb.width && vb.height) ? vb.width / vb.height : 16 / 9;
          var imgW = Math.min(BW - 0.4, 10);
          var imgH = imgW / aspect;
          if (imgH > BY + BH - y - 0.2) { imgH = BY + BH - y - 0.2; imgW = imgH * aspect; }
          var imgX = MX + (BW - imgW) / 2;
          sl.addImage({ data: svgPng, x: imgX, y: y, w: imgW, h: imgH });
          y += imgH + GAP;
        } else {
          sl.addText('[Diagram — see web version]', { x: MX, y: y, w: BW, h: 0.40, margin: 0, align: 'center', fontFace: FB, fontSize: 14, italic: true, color: p.muted });
          y += 0.46;
        }
        continue;
      }
      if (isCard(c)) { y = renderCard(sl, c, MX, y, BW, Math.min(2.4, BY + BH - y), p); continue; }
      if (c.tagName === 'DIV' && c.children.length > 0) { y = dispatch(sl, Array.prototype.slice.call(c.children), y, p); continue; }
      var txt = tx(c); if (!txt) continue;
      var bh = estTextH(txt, 12, BW, 1.4);
      sl.addText(txt, { x: MX, y: y, w: BW, h: bh, margin: 0, fontFace: FB, fontSize: 12, color: p.muted, lineSpacingMultiple: 1.4, valign: 'top', shrinkText: true });
      y += bh + GAP;
    }
    return y;
  }

  // Classify whether a content root is "structured" (grids, diagrams, tables)
  // vs pure prose. Structured slides get vertically centered.
  function isStructuredContent(contentRoot) {
    var children = contentRoot.children;
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (hid(c)) continue;
      if (c.classList.contains('topbar') || c.classList.contains('section-head') || c.classList.contains('subsection-toggle')) continue;
      if (c.classList.contains('insight-grid') || c.classList.contains('comparison-grid') ||
          c.classList.contains('arch-layer') || c.classList.contains('arch-flow') ||
          c.classList.contains('flow-list') || c.classList.contains('subsection-accordion') ||
          isTable(c) || isDiagram(c) || isCard(c)) return true;
      // Check nested div children
      if (c.tagName === 'DIV' && c.children.length > 0 && isStructuredContent(c)) return true;
    }
    return false;
  }

  // Dry-run dispatch to measure total content height without drawing
  function measureDispatch(children, y, p) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (hid(c) || y > BY + BH + 2) continue; // allow overflow to measure
      if (c.classList.contains('topbar') || c.classList.contains('section-head') || c.classList.contains('present-inline-head') || c.classList.contains('subsection-toggle')) continue;
      if (c.classList.contains('attr-card') || c.classList.contains('insight-card')) continue;
      if (c.classList.contains('insight-grid')) {
        var cards = qa(c, '.insight-card, .attr-card');
        var cols = Math.min(cards.length, 4), cc = grid(BW, cols, GAP);
        var mRows = Math.ceil(cards.length / cols);
        // Estimate ~2.4 per row (will be refined at render)
        var cardHEsts = []; cards.forEach(function (card) {
          var cW = cc[0] ? cc[0].w : BW;
          var idx = qs(card, '.card-index'), atag = qs(card, '.attr-tag'), h3 = qs(card, 'h3'), pp = qa(card, 'p');
          var iy = 0.14 + (idx ? 0.36 : (atag ? 0.30 : 0)) + (h3 ? 0.40 : 0);
          var bH = 0; pp.forEach(function (pe) { bH += estTextH(tx(pe), 11, cW - 0.28, 1.25); });
          cardHEsts.push(Math.max(1.2, iy + bH + 0.14));
        });
        for (var mr = 0; mr < mRows; mr++) {
          var mxH = 0;
          for (var mc = 0; mc < cols; mc++) { var mi = mr * cols + mc; if (mi < cardHEsts.length) mxH = Math.max(mxH, cardHEsts[mi]); }
          y += Math.min(mxH, BH - 0.2) + GAP;
        }
        continue;
      }
      if (c.classList.contains('comparison-grid')) { y += Math.min(4.2, BH) + GAP; continue; }
      if (c.classList.contains('comparison-card')) { y += Math.min(4.0, BH) + GAP; continue; }
      if (c.classList.contains('subsection-accordion')) { var items = qa(c, '.subsection-item'); y += items.length * 0.52; continue; }
      if (c.classList.contains('flow-list')) { var fItems = qa(c, 'li'); fItems.forEach(function (fi) { var co = qs(fi, '.flow-copy'), desc = co ? qs(co, 'p') : null; y += desc ? 0.90 : 0.44; }); continue; }
      if (isList(c)) { var lItems = qa(c, 'li'); lItems.forEach(function (li) { y += Math.max(0.44, estTextH(tx(li), 12, BW - 0.24, 1.15)) + 0.04; }); continue; }
      if (c.classList.contains('quote-block')) { y += Math.min(1.0, Math.max(0.50, tx(c).length / 140 + 0.30)) + GAP; continue; }
      if (isSpecimenGrid(c)) { var sgChildren = Array.prototype.slice.call(c.children).filter(function (ch) { return !hid(ch); }); var sgCols = Math.min(sgChildren.length, 4); y += Math.ceil(sgChildren.length / sgCols) * (1.2 + GAP); continue; }
      if (isTable(c)) { var trs = qa(c, 'tr'); y += trs.length * 0.38 + 0.1 + GAP; continue; }
      if (c.classList.contains('arch-layer')) { y += 2.5; continue; }
      if (c.classList.contains('arch-flow')) { y += 1.0 + GAP; continue; }
      if (isDiagram(c)) { var hasSvgPng = c.getAttribute('data-svg-png'); y += hasSvgPng ? 4.0 : 0.46; continue; }
      if (isCard(c)) { y += 2.4 + GAP; continue; }
      if (c.tagName === 'DIV' && c.children.length > 0) { y = measureDispatch(Array.prototype.slice.call(c.children), y, p); continue; }
      var t = tx(c); if (t) y += estTextH(t, 12, BW, 1.4) + GAP;
    }
    return y;
  }

  function endingSlide(pptx, step, p) {
    var sl = pptx.addSlide(); sl.background = { color: p.bg };
    var title = qs(step, '.present-end-title');
    var qrImg = qs(step, '.present-end-qr img');
    var qrTip = qs(step, '.present-end-qr-tip');
    var brand = qs(step, '.present-end-brand');
    // Accent bar at top
    sl.addShape('rect', { x: (SW - 3) / 2, y: 1.6, w: 3, h: 0.05, fill: { color: p.accent } });
    // Title centered
    if (title) {
      sl.addText(tx(title), { x: MX, y: 1.80, w: BW, h: 1.0, margin: 0, align: 'center', valign: 'middle', fontFace: FT, fontSize: 44, bold: true, color: p.text });
    }
    // QR code image
    if (qrImg && qrImg.src) {
      var qrSize = 1.8, qrX = (SW - qrSize) / 2, qrY = 3.0;
      sl.addShape('roundRect', { x: qrX - 0.12, y: qrY - 0.12, w: qrSize + 0.24, h: qrSize + 0.24, fill: { color: 'FFFFFF' }, rectRadius: 0.10 });
      sl.addImage({ path: qrImg.src, x: qrX, y: qrY, w: qrSize, h: qrSize });
      if (qrTip) {
        sl.addText(tx(qrTip), { x: MX, y: qrY + qrSize + 0.18, w: BW, h: 0.32, margin: 0, align: 'center', valign: 'middle', fontFace: FB, fontSize: 13, color: p.muted });
      }
    }
    // Brand
    if (brand) {
      sl.addText(tx(brand), { x: MX, y: SH - 1.0, w: BW, h: 0.36, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 11, color: p.muted, charSpacing: 1.5 });
    }
  }

  function renderStep(pptx, step, si, gi, total, p, dL, dT) {
    if (step.classList.contains('hero')) { heroSlide(pptx, step, p); return; }
    // Ending slide: dedicated layout with centered title + QR code
    if (step.classList.contains('present-end-slide')) { endingSlide(pptx, step, p); return; }
    var sl = addContentSlide(pptx, step, si, gi, total, p, dL, dT);
    var y = BY, contentRoot = step;
    var isOverview = step.hasAttribute('data-present-overview');
    if (step.classList.contains('subsection-item') && step.hasAttribute('data-accordion')) { var sc = qs(step, '.subsection-content'); if (sc) contentRoot = sc; }
    if (isOverview) { var sHead = qs(contentRoot, '.section-head'); if (sHead) { var sDesc = qs(sHead, 'p'); if (sDesc) { var dt = tx(sDesc); if (dt) { sl.addText(dt, { x: MX, y: y, w: BW, h: 0.44, margin: 0, fontFace: FB, fontSize: 12, color: p.muted, lineSpacingMultiple: 1.4, valign: 'top', shrinkText: true }); y += 0.50; } } } }
    // Vertical centering for all non-overview content slides
    if (!isOverview) {
      var contentH = measureDispatch(Array.prototype.slice.call(contentRoot.children), 0, p);
      var availH = BH;
      if (contentH < availH - 0.2) {
        y += (availH - contentH) / 2;
      }
    }
    dispatch(sl, Array.prototype.slice.call(contentRoot.children), y, p);
  }

  window.StudyRoomPptxExport = { getPalette: pal, renderStep: renderStep, setupMasters: setupMasters };
})();

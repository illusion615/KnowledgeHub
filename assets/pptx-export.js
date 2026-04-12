/**
 * pptx-export.js — PptxGenJS renderers for Study Room articles (v2).
 * Architecture: Slide Masters + Generalized renderers + Unified dispatcher.
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

  function setupMasters(pptx, p) {
    pptx.theme = { headFontFace: FT, bodyFontFace: FB };
    pptx.defineSlideMaster({ title: 'CONTENT_MASTER', background: { color: p.bg }, objects: [{ rect: { x: MX, y: 0.30, w: 2.2, h: 0.04, fill: { color: p.accent } } }], slideNumber: { x: SW - 1.6, y: 0.38, w: 1.2, h: 0.22, align: 'right', fontFace: FL, fontSize: 9, color: p.muted } });
  }
  function addContentSlide(pptx, step, si, gi, total, p, dL, dT) {
    var sl = pptx.addSlide({ masterName: 'CONTENT_MASTER' });
    sl.addText(dL(step, si), { x: MX, y: 0.42, w: 10, h: 0.22, margin: 0, fontFace: FL, fontSize: 9, bold: true, color: p.alt, charSpacing: 1.5 });
    sl.addText(dT(step, si), { x: MX, y: 0.68, w: 11.2, h: 0.52, margin: 0, fontFace: FT, fontSize: 24, bold: true, color: p.text, shrinkText: true });
    return sl;
  }

  function heroSlide(pptx, step, p) {
    var sl = pptx.addSlide(); sl.background = { color: p.bg };
    var copy = qs(step, '.hero-copy'), eye = qs(step, '.eyebrow'), h1 = qs(step, 'h1');
    var desc = copy ? qs(copy, 'p') : null;
    var panel = qs(step, '.hero-panel'), mets = qa(step, '.metric');
    var panelH = panel ? 3.40 : 0, metH = mets.length ? 1.60 : 0;
    var startY = Math.max(0.40, (SH - 2.60 - metH - 0.60) / 2), cy = startY;
    sl.addShape('rect', { x: MX, y: cy, w: 2.6, h: 0.05, fill: { color: p.accent } }); cy += 0.14;
    if (eye) { sl.addText(tx(eye), { x: MX, y: cy, w: 6, h: 0.28, margin: 0, fontFace: FL, fontSize: 10, bold: true, color: p.alt, charSpacing: 2 }); cy += 0.36; }
    if (h1) { sl.addText(tx(h1), { x: MX, y: cy, w: 7.2, h: 1.10, margin: 0, fontFace: FT, fontSize: 36, bold: true, color: p.text, shrinkText: true, valign: 'top' }); cy += 1.18; }
    if (desc) { sl.addText(tx(desc), { x: MX, y: cy, w: 6.8, h: 1.00, margin: 0, fontFace: FB, fontSize: 13, color: p.muted, lineSpacingMultiple: 1.6, valign: 'top' }); cy += 1.08; }
    if (panel) {
      var pH2 = qs(panel, 'h2'), pD = qs(panel, 'p'), pLL = qs(panel, '.layer-list'), pLIs = pLL ? qa(pLL, 'li') : [];
      var px = 7.8, pw = SW - px - MX;
      sl.addShape('roundRect', { x: px, y: startY, w: pw, h: panelH, fill: { color: p.text }, rectRadius: R });
      var piy = startY + 0.28;
      if (pH2) { sl.addText(tx(pH2), { x: px + 0.3, y: piy, w: pw - 0.6, h: 0.50, margin: 0, fontFace: FT, fontSize: 18, bold: true, color: p.bg, valign: 'top' }); piy += 0.56; }
      if (pD) { sl.addText(tx(pD), { x: px + 0.3, y: piy, w: pw - 0.6, h: 1.0, margin: 0, fontFace: FB, fontSize: 11, color: p.muted, lineSpacingMultiple: 1.5, valign: 'top', shrinkText: true }); piy += 1.06; }
      pLIs.forEach(function (li) { if (piy > startY + panelH - 0.2) return; var nm = qs(li, '.layer-number'), num = nm ? tx(nm) : '', rest = tx(li).replace(num, '').trim(); sl.addShape('roundRect', { x: px + 0.3, y: piy + 0.02, w: 0.26, h: 0.26, fill: { color: p.bg, transparency: 80 }, rectRadius: 0.04 }); sl.addText(num, { x: px + 0.3, y: piy + 0.02, w: 0.26, h: 0.26, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 9, bold: true, color: p.bg }); sl.addText(rest, { x: px + 0.64, y: piy, w: pw - 0.94, h: 0.32, margin: 0, fontFace: FB, fontSize: 10, color: p.muted, valign: 'middle' }); piy += 0.36; });
    }
    if (mets.length) {
      var my = Math.max(cy + 0.20, panel ? panelH + startY + 0.30 : cy + 0.20), mc = grid(BW, mets.length, GAP);
      mets.forEach(function (m, i) { var c = mc[i] || mc[0], mx = MX + c.x; var lab = qs(m, '.metric-label'), val = qs(m, 'strong'), det = qs(m, 'span'); sl.addShape('roundRect', { x: mx, y: my, w: c.w, h: 1.60, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R }); if (lab) sl.addText(tx(lab), { x: mx + 0.2, y: my + 0.15, w: c.w - 0.4, h: 0.22, margin: 0, fontFace: FL, fontSize: 8, color: p.muted, charSpacing: 1.5, bold: true }); if (val) sl.addText(tx(val), { x: mx + 0.2, y: my + 0.42, w: c.w - 0.4, h: 0.50, margin: 0, fontFace: FT, fontSize: 28, bold: true, color: p.accent, shrinkText: true }); if (det) sl.addText(tx(det), { x: mx + 0.2, y: my + 0.98, w: c.w - 0.4, h: 0.48, margin: 0, fontFace: FB, fontSize: 10, color: p.muted, lineSpacingMultiple: 1.4, valign: 'top' }); });
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
    var textLen = 0; paras.forEach(function (pp) { textLen += tx(pp).length; });
    var estH = Math.min(maxH, Math.max(0.70, 0.45 + textLen / 120));
    if (fl || rl || cl || ll || tbl) estH = Math.min(maxH, Math.max(estH, 1.4));
    sl.addShape('roundRect', { x: x, y: y, w: w, h: estH, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R });
    var iy = 0.12;
    if (label) { var lw = Math.min(2.0, tx(label).length * 0.08 + 0.4); sl.addShape('roundRect', { x: x + 0.14, y: y + iy, w: lw, h: 0.22, fill: { color: p.accent, transparency: 80 }, rectRadius: 0.05 }); sl.addText(tx(label), { x: x + 0.14, y: y + iy, w: lw, h: 0.22, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 8, bold: true, color: p.accent }); iy += 0.28; }
    if (heading) { sl.addText(tx(heading), { x: x + 0.14, y: y + iy, w: w - 0.28, h: 0.28, margin: 0, fontFace: FT, fontSize: 13, bold: true, color: p.text, shrinkText: true }); iy += 0.32; }
    var cH = estH - iy - 0.08; if (cH < 0.1) return y + estH + GAP;
    if (fl) { renderFlowList(sl, fl, x + 0.14, y + iy, w - 0.28, cH, p); return y + estH + GAP; }
    if (rl || cl) { renderListItems(sl, rl || cl, x + 0.10, y + iy, w - 0.20, cH, p); return y + estH + GAP; }
    if (ll) { renderLayerList(sl, ll, x + 0.14, y + iy, w - 0.28, cH, p); return y + estH + GAP; }
    if (tbl) { renderTable(sl, tbl, x + 0.10, y + iy, w - 0.20, cH, p); return y + estH + GAP; }
    var parts = []; paras.forEach(function (pp) { var t = tx(pp); if (t) parts.push({ text: t + '\n\n', options: { fontSize: 10, color: p.muted } }); });
    if (!parts.length) { var all = tx(el); if (label) all = all.replace(tx(label), ''); if (heading) all = all.replace(tx(heading), ''); all = all.trim(); if (all) parts.push({ text: all, options: { fontSize: 10, color: p.muted } }); }
    if (parts.length) sl.addText(parts, { x: x + 0.14, y: y + iy, w: w - 0.28, h: cH, margin: 0, fontFace: FB, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true });
    return y + estH + GAP;
  }

  function renderListItems(sl, el, x, y, w, maxH, p) {
    var items = qa(el, 'li'), rH = 0.36;
    items.forEach(function (li) { if (y + rH > BY + BH - 0.05) return; sl.addShape('roundRect', { x: x, y: y, w: w, h: rH, fill: { color: p.cardBg }, line: { color: p.border, width: 0.5 }, rectRadius: 0.05 }); var strong = qs(li, 'strong'); if (strong) { var sT = tx(strong), rest = tx(li).replace(sT, '').replace(/^\s*[—\-]\s*/, '').trim(); sl.addText([{ text: sT, options: { bold: true, fontSize: 9, color: p.text } }, { text: rest ? ' — ' + rest : '', options: { fontSize: 9, color: p.muted } }], { x: x + 0.10, y: y, w: w - 0.20, h: rH, margin: 0, fontFace: FB, lineSpacingMultiple: 1.15, valign: 'middle', shrinkText: true }); } else { sl.addText(tx(li), { x: x + 0.10, y: y, w: w - 0.20, h: rH, margin: 0, fontFace: FB, fontSize: 9, color: p.text, lineSpacingMultiple: 1.15, valign: 'middle', shrinkText: true }); } y += rH + 0.03; });
    return y;
  }

  function renderFlowList(sl, el, x, y, w, maxH, p) {
    var items = qa(el, 'li'), sy = y;
    items.forEach(function (item) { if (y - sy > maxH - 0.25 || y > BY + BH - 0.3) return; var se = qs(item, '.flow-step'), co = qs(item, '.flow-copy'); var title = co ? qs(co, 'strong') : null, desc = co ? qs(co, 'p') : null; var num = se ? tx(se) : '', tS = title ? tx(title) : '', dS = desc ? tx(desc) : ''; sl.addShape('ellipse', { x: x, y: y + 0.01, w: 0.28, h: 0.28, fill: { color: p.accent } }); sl.addText(num, { x: x, y: y + 0.01, w: 0.28, h: 0.28, margin: 0, align: 'center', fontFace: FT, fontSize: 10, bold: true, color: 'FFFFFF', valign: 'middle' }); if (tS && dS) { sl.addText(tS, { x: x + 0.36, y: y, w: w - 0.36, h: 0.26, margin: 0, fontFace: FT, fontSize: 11, bold: true, color: p.text, valign: 'middle' }); y += 0.28; var dh = Math.min(0.32, maxH - (y - sy) - 0.04); if (dh > 0.08) { sl.addText(dS, { x: x + 0.36, y: y, w: w - 0.36, h: dh, margin: 0, fontFace: FB, fontSize: 9, color: p.muted, lineSpacingMultiple: 1.2, valign: 'top', shrinkText: true }); y += dh + 0.04; } } else if (tS) { sl.addText(tS, { x: x + 0.36, y: y, w: w - 0.36, h: 0.28, margin: 0, fontFace: FT, fontSize: 11, bold: true, color: p.text, valign: 'middle' }); y += 0.34; } });
    return y;
  }

  function renderLayerList(sl, el, x, y, w, maxH, p) {
    qa(el, 'li').forEach(function (li) { if (y > BY + BH - 0.3) return; var nm = qs(li, '.layer-number'), num = nm ? tx(nm) : '', rest = tx(li).replace(num, '').trim(); sl.addText(num, { x: x, y: y, w: 0.28, h: 0.26, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 9, bold: true, color: p.accent, fill: { color: p.accent, transparency: 90 } }); sl.addText(rest, { x: x + 0.34, y: y, w: w - 0.34, h: 0.32, margin: 0, fontFace: FB, fontSize: 10, color: p.text, lineSpacingMultiple: 1.2, valign: 'middle', shrinkText: true }); y += 0.36; });
    return y;
  }

  function renderTable(sl, el, x, y, w, maxH, p) {
    var rows = qa(el, 'tr'); if (!rows.length) return y; var data = [];
    rows.forEach(function (tr) { var cells = qa(tr, 'th, td'), row = []; cells.forEach(function (c) { row.push({ text: tx(c), options: { fontFace: FB, fontSize: 9, color: c.tagName === 'TH' ? p.alt : p.text, bold: c.tagName === 'TH', fill: { color: c.tagName === 'TH' ? p.alt : p.cardBg, transparency: c.tagName === 'TH' ? 93 : 0 }, border: { type: 'solid', pt: 0.5, color: p.border }, valign: 'middle', margin: [3, 5, 3, 5] } }); }); if (row.length) data.push(row); });
    if (!data.length) return y; var nC = data[0].length, cw = []; for (var i = 0; i < nC; i++) cw.push(w / nC);
    sl.addTable(data, { x: x, y: y, w: w, colW: cw, rowH: 0.32, fontFace: FB, fontSize: 9, autoPage: false, align: 'left', valign: 'middle' });
    return y + Math.min(maxH, data.length * 0.32 + 0.1) + GAP;
  }

  function renderQuote(sl, el, x, y, w, p) {
    var t = tx(el); if (!t) return y; var h = Math.min(1.0, Math.max(0.50, t.length / 150 + 0.3));
    sl.addShape('roundRect', { x: x, y: y, w: w, h: h, fill: { color: p.accent, transparency: 95 }, line: { color: p.accent, transparency: 80, width: 0.5 }, rectRadius: R });
    sl.addShape('rect', { x: x, y: y, w: 0.05, h: h, fill: { color: p.accent } });
    sl.addText(t, { x: x + 0.18, y: y + 0.05, w: w - 0.30, h: h - 0.10, margin: 0, fontFace: FB, fontSize: 11, italic: true, color: p.text, lineSpacingMultiple: 1.4, valign: 'middle', shrinkText: true });
    return y + h + GAP;
  }

  function renderInsightGrid(sl, el, y, p) {
    var cards = qa(el, '.insight-card, .attr-card'); if (!cards.length) return y;
    var cols = Math.min(cards.length, 4), cc = grid(BW, cols, GAP), ch = 2.0;
    cards.forEach(function (card, i) {
      var c = cc[i % cols], ro = Math.floor(i / cols) * (ch + GAP), cx = MX + c.x, cy = y + ro;
      var idx = qs(card, '.card-index'), atag = qs(card, '.attr-tag'), h3 = qs(card, 'h3'), pp = qa(card, 'p');
      sl.addShape('roundRect', { x: cx, y: cy, w: c.w, h: ch, fill: { color: p.cardBg }, line: { color: p.border, width: 0.75 }, rectRadius: R });
      var iy = 0.12;
      if (idx) { var idxW = Math.max(0.30, tx(idx).length * 0.08 + 0.18); sl.addShape('roundRect', { x: cx + 0.12, y: cy + iy, w: idxW, h: 0.26, fill: { color: p.accent, transparency: 86 }, rectRadius: 0.13 }); sl.addText(tx(idx), { x: cx + 0.12, y: cy + iy, w: idxW, h: 0.26, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 9, bold: true, color: p.accent }); iy += 0.32; }
      else if (atag) { sl.addShape('roundRect', { x: cx + 0.12, y: cy + iy, w: 0.56, h: 0.20, fill: { color: p.accent, transparency: 82 }, rectRadius: 0.04 }); sl.addText(tx(atag), { x: cx + 0.12, y: cy + iy, w: 0.56, h: 0.20, margin: 0, align: 'center', valign: 'middle', fontFace: FL, fontSize: 7, bold: true, color: p.accent }); iy += 0.26; }
      if (h3) { sl.addText(tx(h3), { x: cx + 0.12, y: cy + iy, w: c.w - 0.24, h: 0.28, margin: 0, fontFace: FT, fontSize: 12, bold: true, color: p.text, shrinkText: true }); iy += 0.32; }
      var ptexts = []; pp.forEach(function (pe) { var t = tx(pe); if (t) ptexts.push({ text: t + '\n', options: { fontSize: 9, color: p.muted } }); });
      if (ptexts.length) sl.addText(ptexts, { x: cx + 0.12, y: cy + iy, w: c.w - 0.24, h: ch - iy - 0.08, margin: 0, fontFace: FB, lineSpacingMultiple: 1.25, valign: 'top', shrinkText: true });
    });
    return y + Math.ceil(cards.length / cols) * (ch + GAP);
  }

  function renderCompGrid(sl, el, y, p) {
    var cards = qa(el, ':scope > .comparison-card'); if (!cards.length) return y;
    var cc = grid(BW, Math.min(cards.length, 2), GAP), ch = Math.min(4.2, BY + BH - y);
    cards.forEach(function (card, i) { renderCard(sl, card, MX + cc[i % cc.length].x, y, cc[i % cc.length].w, ch, p); });
    return y + ch + GAP;
  }

  function renderAccordion(sl, el, y, p) {
    qa(el, '.subsection-item').forEach(function (item) { var tog = qs(item, '.subsection-toggle'); if (!tog || y > BY + BH - 0.35) return; sl.addShape('roundRect', { x: MX, y: y, w: BW, h: 0.30, fill: { color: p.cardBg }, line: { color: p.border, width: 0.5 }, rectRadius: 0.05 }); sl.addText(tx(tog), { x: MX + 0.12, y: y, w: BW - 0.24, h: 0.30, margin: 0, fontFace: FT, fontSize: 11, bold: true, color: p.text, valign: 'middle' }); y += 0.36; });
    return y;
  }

  function renderBibList(sl, el, y, p) {
    var items = qa(el, 'li'), parts = [];
    items.forEach(function (li) { var id = qs(li, '.bib-id'), au = qs(li, '.bib-author'); var rest = tx(li), iT = id ? tx(id) : '', aT = au ? tx(au) : ''; parts.push({ text: iT + ' ', options: { bold: true, fontSize: 9, color: p.accent } }); parts.push({ text: aT + ' ', options: { bold: true, fontSize: 9, color: p.text } }); parts.push({ text: rest.replace(iT, '').replace(aT, '').trim() + '\n', options: { fontSize: 9, color: p.muted } }); });
    if (!parts.length) return y; var lh = Math.min(BH - (y - BY), 5.0);
    sl.addText(parts, { x: MX, y: y, w: BW, h: lh, margin: [0, 0, 0, 4], fontFace: FB, lineSpacingMultiple: 1.5, valign: 'top' });
    return y + lh;
  }

  // ═══════ Unified Dispatcher ═══════
  var CARD_CLS = ['timeline-card', 'track-card', 'finding-card', 'rule-card', 'tier-card', 'workflow-card', 'step-card', 'capability-card', 'milestone-card', 'crate-card', 'present-step-block', 'verdict-box'];
  function isCard(el) { for (var i = 0; i < CARD_CLS.length; i++) { if (el.classList.contains(CARD_CLS[i])) return true; } return false; }
  function isList(el) { return el.classList.contains('reference-list') || el.classList.contains('challenge-list') || ((el.tagName === 'UL' || el.tagName === 'OL') && !el.classList.contains('bib-list') && !el.classList.contains('flow-list')); }
  function isTable(el) { return el.tagName === 'TABLE' || el.classList.contains('simple-table') || el.classList.contains('matrix-table') || el.classList.contains('spec-table') || el.classList.contains('score-table') || el.classList.contains('benchmark-table'); }
  function isDiagram(el) { return el.classList.contains('mesh-layout') || el.classList.contains('signal-map') || el.tagName === 'FIGURE' || el.classList.contains('architecture-figure') || el.classList.contains('quadrant-board') || el.classList.contains('mesh-board'); }

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
      if (isTable(c)) { y = renderTable(sl, c, MX, y, BW, BY + BH - y, p); continue; }
      if (c.classList.contains('tab-shell') || c.hasAttribute('data-tabs')) { qa(c, '.tab-panel').forEach(function (panel, idx) { var btns = qa(c, '.tab-button'), lbl = btns[idx] ? tx(btns[idx]) : 'Tab ' + (idx + 1), t = tx(panel); if (!t || y + 0.5 > BY + BH) return; sl.addShape('roundRect', { x: MX, y: y, w: BW, h: 0.24, fill: { color: idx === 0 ? p.accent : p.cardBg }, rectRadius: 0.04 }); sl.addText(lbl, { x: MX + 0.10, y: y, w: BW - 0.20, h: 0.24, margin: 0, fontFace: FL, fontSize: 9, bold: true, color: idx === 0 ? 'FFFFFF' : p.text, valign: 'middle' }); y += 0.28; var th = Math.min(0.9, BY + BH - y - 0.1); sl.addText(t, { x: MX + 0.10, y: y, w: BW - 0.20, h: th, margin: 0, fontFace: FB, fontSize: 10, color: p.muted, lineSpacingMultiple: 1.3, valign: 'top', shrinkText: true }); y += th + GAP; }); continue; }
      if (isDiagram(c)) { sl.addText('[Diagram — see web version]', { x: MX, y: y, w: BW, h: 0.34, margin: 0, align: 'center', fontFace: FB, fontSize: 11, italic: true, color: p.muted }); y += 0.40; continue; }
      if (isCard(c)) { y = renderCard(sl, c, MX, y, BW, Math.min(2.2, BY + BH - y), p); continue; }
      if (c.tagName === 'DIV' && c.children.length > 0) { y = dispatch(sl, Array.prototype.slice.call(c.children), y, p); continue; }
      var txt = tx(c); if (!txt) continue;
      var bh = Math.min(1.0, BY + BH - y);
      sl.addText(txt, { x: MX, y: y, w: BW, h: bh, margin: 0, fontFace: FB, fontSize: 11, color: p.muted, lineSpacingMultiple: 1.4, valign: 'top', shrinkText: true });
      y += bh + GAP;
    }
    return y;
  }

  function renderStep(pptx, step, si, gi, total, p, dL, dT) {
    if (step.classList.contains('hero')) { heroSlide(pptx, step, p); return; }
    var sl = addContentSlide(pptx, step, si, gi, total, p, dL, dT);
    var y = BY, contentRoot = step;
    var isOverview = step.hasAttribute('data-present-overview');
    if (step.classList.contains('subsection-item') && step.hasAttribute('data-accordion')) { var sc = qs(step, '.subsection-content'); if (sc) contentRoot = sc; }
    if (isOverview) { var sHead = qs(contentRoot, '.section-head'); if (sHead) { var sDesc = qs(sHead, 'p'); if (sDesc) { var dt = tx(sDesc); if (dt) { sl.addText(dt, { x: MX, y: y, w: BW, h: 0.52, margin: 0, fontFace: FB, fontSize: 11, color: p.muted, lineSpacingMultiple: 1.5, valign: 'top', shrinkText: true }); y += 0.58; } } } }
    dispatch(sl, Array.prototype.slice.call(contentRoot.children), y, p);
  }

  window.StudyRoomPptxExport = { getPalette: pal, renderStep: renderStep, setupMasters: setupMasters };
})();

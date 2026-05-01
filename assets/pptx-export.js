/**
 * pptx-export.js — Universal DOM-geometry renderer (v4).
 *
 * Strategy: instead of recognising components by CSS class names, we read the
 * already-rendered geometry of the active presentation step via
 * getBoundingClientRect + getComputedStyle, and replay it onto a PPT slide as
 * shapes / text boxes / images. As a result, ANY current or future article —
 * including bespoke layouts — exports faithfully without touching this file.
 *
 * Pipeline per step:
 *   1. Step is the active 100vw × 100vh slot (caller has set is-active).
 *   2. PPT slide = 13.333 × 7.5 in. Map step rect → slide rect, preserving
 *      aspect (letterbox if needed).
 *   3. Background pass: walk every visible element; emit a roundRect for any
 *      element whose computed background-color or border-top-width is non-zero.
 *      Parents emit before children so child layers paint on top.
 *   4. Text pass: walk every visible element and emit one text box per direct
 *      text node, using the parent's computed color / font / weight / italic /
 *      align / line-height. The text box is positioned at the Range's
 *      bounding rect so styled inline runs (<strong>, <span class="badge">…)
 *      land in their actual painted positions.
 *   5. Images: <img> emit at their rect; <svg> uses an ancestor's
 *      data-svg-png attribute populated by the caller.
 *
 * Limits accepted on purpose:
 *   • CSS gradients, box-shadow, filter, backdrop-filter → flattened
 *   • Pseudo-elements (::before / ::after) → not captured
 *   • Vertical-align middle inside flex/grid → text uses valign 'top' from rect
 *   • Replaced elements other than img/svg (canvas/video) → skipped
 */
(function () {
  'use strict';

  // ── Slide dimensions (PptxGenJS LAYOUT_WIDE) ──
  var SW = 13.333, SH = 7.5;

  // Theme palettes — only used as a fallback when the page bg can't be parsed.
  var lp = { bg: 'FCF6EE', text: '172430' };
  var dp = { bg: '0F1318', text: 'E4E6EA' };
  function pal() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? dp : lp;
  }
  function setupMasters(pptx /*, p */) {
    pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos' };
  }

  // ───────── Color utilities ─────────
  function parseColor(c) {
    if (!c) return null;
    var s = String(c).trim();
    if (s === 'transparent' || s === 'none' || s === 'rgba(0, 0, 0, 0)') return null;
    var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/.exec(s);
    if (!m) return null;
    var a = m[4] != null ? parseFloat(m[4]) : 1;
    if (a === 0) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: a };
  }
  function toHex(c) {
    if (!c) return null;
    function h(n) {
      var v = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return v.length < 2 ? '0' + v : v;
    }
    return (h(c.r) + h(c.g) + h(c.b)).toUpperCase();
  }
  function transp(c) { return c && c.a < 1 ? Math.round((1 - c.a) * 100) : 0; }

  // Parse first usable color from a CSS background-image value (linear-gradient,
  // radial-gradient, conic-gradient). Returns null if no gradient or unparsable.
  function parseGradientColor(bgImage) {
    if (!bgImage || bgImage === 'none') return null;
    if (!/gradient\(/i.test(bgImage)) return null;
    // Capture every rgb()/rgba() inside; pick the first opaque one, fallback first.
    var rx = /rgba?\([^)]+\)/g;
    var matches = bgImage.match(rx);
    if (!matches || !matches.length) return null;
    var first = null;
    for (var i = 0; i < matches.length; i++) {
      var c = parseColor(matches[i]);
      if (!c) continue;
      if (!first) first = c;
      if (c.a >= 0.95) return c;
    }
    return first;
  }

  // ───────── Layout / style readers ─────────
  function isHidden(el) {
    if (!el || el.nodeType !== 1) return true;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    if (parseFloat(cs.opacity) === 0) return true;
    return false;
  }
  function isChrome(el) {
    if (!el || !el.classList) return false;
    return el.classList.contains('topbar')
      || el.classList.contains('present-floating')
      || el.classList.contains('present-nav')
      || el.classList.contains('present-exit')
      || el.classList.contains('present-status')
      || el.classList.contains('present-progress')
      || el.classList.contains('present-inline-head')
      || el.classList.contains('share-wrapper')
      || el.classList.contains('ai-assistant-entry')
      || el.classList.contains('ai-assistant-panel')
      || el.classList.contains('backdrop')
      || el.hasAttribute('data-presentation-toggle')
      || el.hasAttribute('aria-hidden') && el.getAttribute('aria-hidden') === 'true' && el.classList.contains('orb');
  }
  function fontFamily(cs) {
    var ff = cs.fontFamily || '';
    if (/Display/i.test(ff)) return 'Aptos Display';
    if (/Mono|Consolas|Menlo|Monaco|monospace/i.test(ff)) return 'Consolas';
    return 'Aptos';
  }
  function fontSizePx(cs) { return parseFloat(cs.fontSize) || 16; }
  function isBold(cs) { var w = parseInt(cs.fontWeight, 10); return !isNaN(w) && w >= 600; }
  function isItalic(cs) { return cs.fontStyle === 'italic' || cs.fontStyle === 'oblique'; }
  function lineSpacing(cs) {
    var lh = cs.lineHeight, fs = fontSizePx(cs);
    if (!lh || lh === 'normal') return 1.2;
    var n = parseFloat(lh);
    if (isNaN(n)) return 1.2;
    if (lh.indexOf('px') > -1) return Math.max(0.9, Math.min(2.5, n / fs));
    return Math.max(0.9, Math.min(2.5, n));
  }
  function alignOf(cs) {
    var t = cs.textAlign;
    if (t === 'right' || t === 'end') return 'right';
    if (t === 'center') return 'center';
    return 'left';
  }
  function radius(cs) { return parseFloat(cs.borderTopLeftRadius) || 0; }
  function borderInfo(cs) {
    var bw = parseFloat(cs.borderTopWidth) || 0;
    if (bw < 0.5) return null;
    var c = parseColor(cs.borderTopColor);
    if (!c) return null;
    return { width: bw, color: c };
  }

  // ───────── Per-slide capture ─────────
  function captureSlide(pptx, step, p, deriveLabel, deriveTitle, stepIndex) {
    var sl = pptx.addSlide();

    // Use the page body's actual background as the slide background, so
    // overall colour matches the rendered presentation.
    var bodyBg = parseColor(getComputedStyle(document.body).backgroundColor);
    if (!bodyBg) bodyBg = parseColor(getComputedStyle(document.documentElement).backgroundColor);
    var bgHex = toHex(bodyBg) || p.bg;
    sl.background = { color: bgHex };

    // The .is-active rule re-runs a 240ms presentFade animation every time
    // we toggle slides during export. At t=0 opacity is 0 — which would make
    // isHidden() reject the whole subtree. Suspend the animation while we
    // capture, restore afterwards. Also force a synchronous layout flush.
    var prevAnim = step.style.animation;
    step.style.animation = 'none';
    // Reading offsetHeight forces reflow so any geometry changes from the
    // class toggle are committed before we measure.
    /* eslint-disable no-unused-expressions */
    step.offsetHeight;
    /* eslint-enable no-unused-expressions */

    var stepRect = step.getBoundingClientRect();
    if (stepRect.width < 10 || stepRect.height < 10) {
      step.style.animation = prevAnim;
      return;
    }

    // Reserve a header band for the slide label + title. Skip on hero/end
    // slides because they have their own first-class title rendering inside
    // the captured DOM. Subsection accordion items also have their own
    // section context already in the body.
    var skipHeader = step.classList.contains('hero')
      || step.classList.contains('present-end-slide');
    var headerH = 0;
    var slideLabel = '';
    var slideTitle = '';
    if (!skipHeader) {
      slideLabel = step.getAttribute('data-step-label')
        || (deriveLabel ? deriveLabel(step, stepIndex || 0) : '') || '';
      slideTitle = step.getAttribute('data-step-title')
        || (deriveTitle ? deriveTitle(step, stepIndex || 0) : '') || '';
      if (slideLabel || slideTitle) headerH = 0.92; // inches
    }

    // Letterbox-fit the captured viewport into the body region under header.
    var bodyTop = headerH;
    var bodyH = SH - bodyTop;
    var scale = Math.min(SW / stepRect.width, bodyH / stepRect.height);
    var contentW = stepRect.width * scale;
    var contentH = stepRect.height * scale;
    var offX = (SW - contentW) / 2;
    var offY = bodyTop + (bodyH - contentH) / 2;

    if (headerH > 0) {
      var accent = '#FF7A00';
      // 2.4-in accent bar
      sl.addShape('rect', { x: 0.6, y: 0.30, w: 2.4, h: 0.05, fill: { color: 'FF7A00' }, line: { type: 'none' } });
      if (slideLabel) {
        sl.addText(slideLabel, {
          x: 0.6, y: 0.40, w: SW - 1.2, h: 0.28,
          margin: 0, fontFace: 'Aptos', fontSize: 11, bold: true,
          color: '0D8F8C', charSpacing: 1.5, valign: 'top'
        });
      }
      if (slideTitle) {
        sl.addText(slideTitle, {
          x: 0.6, y: 0.66, w: SW - 1.2, h: 0.32,
          margin: 0, fontFace: 'Aptos Display', fontSize: 22, bold: true,
          color: (toHex(parseColor(getComputedStyle(document.body).color)) || p.text),
          valign: 'top', shrinkText: true
        });
      }
    }

    function MX(px) { return offX + (px - stepRect.left) * scale; }
    function MY(py) { return offY + (py - stepRect.top) * scale; }
    function MS(v)  { return v * scale; }
    // px → pt: 1 px on screen occupies `scale` inches on slide; 1 in = 72 pt.
    function MPT(px) { return px * scale * 72; }

    var bgOps = [];
    var fgOps = [];

    // ── Pass 1: backgrounds, borders, images, svg ──
    function walkBg(el, depth) {
      // For the step root we skip the hidden check (the .is-active fade
      // animation can momentarily set opacity to 0). All children still
      // honour visibility / display / opacity rules.
      if (depth > 0 && (isHidden(el) || isChrome(el))) return;
      var rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      var cs = getComputedStyle(el);
      var bg = parseColor(cs.backgroundColor);
      // Approximate CSS gradients as a single solid colour, so phone frames /
      // hero panels / cards with `background: linear-gradient(...)` still get
      // a visible fill in the export.
      if (!bg) {
        var grad = parseGradientColor(cs.backgroundImage);
        if (grad) bg = grad;
      }
      var bd = borderInfo(cs);
      // Suppress emission when the element bg matches the slide bg exactly
      if (bg && bg.a >= 0.99 && toHex(bg) === bgHex) bg = null;
      if (bg || bd) {
        bgOps.push({
          x: MX(rect.left), y: MY(rect.top),
          w: MS(rect.width), h: MS(rect.height),
          fill: bg, border: bd,
          radius: MS(radius(cs)),
          depth: depth
        });
      }

      // Image: capture and stop recursing into <img>
      if (el.tagName === 'IMG' && (el.currentSrc || el.src)) {
        fgOps.push({
          type: 'img', src: el.currentSrc || el.src,
          x: MX(rect.left), y: MY(rect.top),
          w: MS(rect.width), h: MS(rect.height)
        });
        return;
      }

      // SVG: rely on a data-svg-png attribute populated by the caller.
      if (el.tagName === 'svg' || el.tagName === 'SVG') {
        var anc = el, png = null;
        while (anc) {
          if (anc.getAttribute && anc.getAttribute('data-svg-png')) {
            png = anc.getAttribute('data-svg-png'); break;
          }
          anc = anc.parentElement;
        }
        if (png) {
          fgOps.push({
            type: 'img', src: png,
            x: MX(rect.left), y: MY(rect.top),
            w: MS(rect.width), h: MS(rect.height)
          });
        }
        return;
      }

      var kids = el.children;
      for (var i = 0; i < kids.length; i++) walkBg(kids[i], depth + 1);
    }

    // ── Pass 2: text — one box per direct text node, positioned by Range ──
    function walkText(el, isRoot) {
      if (!isRoot && (isHidden(el) || isChrome(el))) return;
      var tag = el.tagName;
      if (tag === 'IMG' || tag === 'svg' || tag === 'SVG'
        || tag === 'CANVAS' || tag === 'VIDEO'
        || tag === 'SCRIPT' || tag === 'STYLE'
        || tag === 'BR' || tag === 'HR') return;

      var cs = getComputedStyle(el);
      var color = toHex(parseColor(cs.color)) || p.text;
      var face = fontFamily(cs);
      var size = MPT(fontSizePx(cs));
      var bold = isBold(cs);
      var ital = isItalic(cs);
      var align = alignOf(cs);
      var lsp = lineSpacing(cs);
      var charSp = parseFloat(cs.letterSpacing) || 0;

      for (var i = 0; i < el.childNodes.length; i++) {
        var node = el.childNodes[i];
        if (node.nodeType === 3) {
          var raw = node.nodeValue;
          if (!raw) continue;
          var text = raw.replace(/\s+/g, ' ').trim();
          if (!text) continue;
          var rect;
          try {
            var range = document.createRange();
            range.selectNode(node);
            rect = range.getBoundingClientRect();
            try { range.detach(); } catch (e) {}
          } catch (e) { continue; }
          if (!rect || rect.width < 1 || rect.height < 1) continue;
          fgOps.push({
            type: 'text', text: text,
            x: MX(rect.left) - 0.02,
            y: MY(rect.top) - 0.02,
            w: MS(rect.width) + 0.08,
            h: MS(rect.height) + 0.08,
            fontFace: face, fontSize: Math.max(6, size),
            color: color, bold: bold, italic: ital,
            align: align, lineSpacing: lsp, charSpacing: charSp
          });
        } else if (node.nodeType === 1) {
          walkText(node, false);
        }
      }
    }

    walkBg(step, 0);
    walkText(step, true);

    // Render backgrounds first (parents under children) ───────────
    bgOps.sort(function (a, b) { return a.depth - b.depth; });
    bgOps.forEach(function (op) {
      var fillOpt = op.fill
        ? { color: toHex(op.fill), transparency: transp(op.fill) }
        : { type: 'none' };
      var lineOpt = op.border
        ? { color: toHex(op.border.color), width: Math.max(0.25, op.border.width * 0.5), transparency: transp(op.border.color) }
        : { type: 'none' };
      var useRound = op.radius > 0.02;
      var opt = { x: op.x, y: op.y, w: op.w, h: op.h, fill: fillOpt, line: lineOpt };
      if (useRound) opt.rectRadius = Math.min(op.radius, Math.min(op.w, op.h) / 2);
      try { sl.addShape(useRound ? 'roundRect' : 'rect', opt); } catch (e) {}
    });

    // Then images, then text ───────────
    fgOps.forEach(function (op) {
      if (op.type === 'img') {
        try { sl.addImage({ path: op.src, x: op.x, y: op.y, w: op.w, h: op.h }); } catch (e) {}
        return;
      }
      if (op.type === 'text') {
        var opts = {
          x: op.x, y: op.y, w: Math.max(0.15, op.w), h: Math.max(0.15, op.h),
          margin: 0,
          fontFace: op.fontFace, fontSize: op.fontSize,
          color: op.color, bold: op.bold, italic: op.italic,
          align: op.align, valign: 'top',
          lineSpacingMultiple: op.lineSpacing
        };
        if (op.charSpacing) opts.charSpacing = Math.round(op.charSpacing * 100) / 100;
        try { sl.addText(op.text, opts); } catch (e) {}
      }
    });

    // Restore the per-step animation we suspended above.
    step.style.animation = prevAnim;
  }

  // Caller signature: (pptx, step, stepIndex, gi, total, palette, deriveLabel, deriveTitle)
  function renderStep(pptx, step, stepIndex, _gi, _total, _p, deriveLabel, deriveTitle) {
    captureSlide(pptx, step, pal(), deriveLabel, deriveTitle, stepIndex);
  }

  window.StudyRoomPptxExport = {
    getPalette: pal,
    renderStep: renderStep,
    setupMasters: setupMasters
  };
})();

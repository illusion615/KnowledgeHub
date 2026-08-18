/**
 * pptx-export.js — Universal DOM-geometry renderer (v5).
 *
 * Strategy: instead of recognising components by CSS class names, we read the
 * already-rendered geometry of the active presentation step via
 * getBoundingClientRect + getComputedStyle, and replay it onto a PPT slide as
 * shapes / text boxes / images. As a result, ANY current or future article —
 * including bespoke layouts — exports faithfully without touching this file.
 *
 * ── The measurement contract (v5) ──────────────────────────────────────
 * Geometry replay is only correct while the font that MEASURED a box is
 * also the font that RENDERS it. v4 measured with the page's own fonts
 * (Space Grotesk / Noto Sans SC) but declared Aptos in the .pptx, so the
 * consumer re-wrapped every string with different metrics: single-line
 * boxes became two lines and overflowed onto whatever sat below them.
 *
 * v5 closes that gap with two rules that must hold together:
 *   R1  Declared font === measured font. FONT_STACK below is the single
 *       source of truth and is derived from the element's own computed
 *       fontFamily, never remapped to a different typeface.
 *   R2  One text box per VISUAL LINE, sized to that line, so the consumer
 *       never makes a wrapping decision at all. Residual metric drift can
 *       then only change a line's width, which is invisible, instead of
 *       its height, which is what caused the overlap.
 *
 * Break either rule and the overlap class of defects returns.
 *
 * Pipeline per step:
 *   1. Step is the active 100vw × 100vh slot (caller has set is-active).
 *   2. PPT slide = 13.333 × 7.5 in. Map step rect → slide rect, width-first
 *      (see SCALE_FLOOR) so dense steps stay legible instead of shrinking.
 *   3. Background pass: walk every visible element; emit a roundRect for any
 *      element whose computed background-color or border-top-width is non-zero.
 *      Parents emit before children so child layers paint on top.
 *   4. Text pass: walk every visible element and emit one text box per visual
 *      line of every direct text node (Range.getClientRects), using the
 *      parent's computed color / font / weight / italic / align.
 *   5. Images: <img> emit at their rect; <svg> uses an ancestor's
 *      data-svg-png attribute populated by the caller.
 *
 * Limits accepted on purpose:
 *   • CSS gradients, box-shadow, filter, backdrop-filter → flattened
 *   • Pseudo-elements (::before / ::after) → not captured
 *   • Replaced elements other than img/svg (canvas/video) → skipped
 *   • Per-line boxes mean a wrapped paragraph is edited line by line in
 *     PowerPoint. Fidelity is chosen over post-export editing convenience.
 */
(function () {
  'use strict';

  // ── Slide dimensions (PptxGenJS LAYOUT_WIDE) ──
  var SW = 13.333, SH = 7.5;

  // ── Export contract ────────────────────────────────────────────────
  // Everything the replay depends on lives here rather than as literals
  // scattered through the passes.
  //
  // FONT_STACK: fonts the .pptx is allowed to name. Each entry must be a
  // font the article actually renders with, because the box was measured
  // in it (rule R1). Adding a typeface to article.css means adding it
  // here too, otherwise its text falls back to BODY and re-wraps.
  var FONT_STACK = {
    DISPLAY: 'Space Grotesk',
    BODY: 'Noto Sans SC',
    BODY_FALLBACK: 'PingFang SC',
    MONO: 'ui-monospace'
  };
  // Slide safe area, in inches.
  var MARGIN_X = 0.6;
  var MARGIN_Y = 0.45;
  var HEADER_H = 0.92;
  // Width-first scaling: a step taller than the body box may shrink to at
  // most this fraction of its width-derived scale. Below that the deck
  // becomes unreadable, so we stop shrinking and report the overflow
  // instead of silently producing a 4%-fill slide.
  var SCALE_FLOOR = 0.78;
  // Density reporting thresholds, as a fraction of the step box height that
  // the step's own content actually occupies.
  //
  // These are REPORTED, never corrected. Industry guidance (Anthropic's
  // pptx skill) treats "large empty area in one place, cramped in another"
  // as a content defect and prescribes adding a visual element or merging
  // slides — not scaling sparse text up to fill the frame, which just makes
  // the deck look auto-generated. Auto-scaling here would also desync the
  // .pptx from the web view and break the geometry-replay premise.
  var SPARSE_FILL = 0.40;
  var CROWDED_FILL = 1.00;
  // Residual metric slack added to each line box's width. Absorbs sub-pixel
  // differences between the browser's shaping and the consumer's without
  // ever affecting height.
  var LINE_WIDTH_SLACK = 1.08;
  // Text nodes longer than this skip per-line splitting (cost guard).
  var MAX_SPLIT_CHARS = 4000;

  // Per-step density findings. Surfaced to the caller so tooling can report
  // them; the renderer itself stays a faithful replay and never rescales
  // content to hit a target density.
  var overflowReports = [];
  // Images the export had to leave out, with the reason. Same contract as
  // the density findings: report, do not crash, do not silently pretend.
  var skippedImages = [];

  // An image can only be embedded if PptxGenJS's XHR is allowed to read it:
  // same-origin, or already inlined as a data:/blob: URL.
  function isCrossOrigin(src) {
    if (!src) return false;
    if (/^(data|blob):/i.test(src)) return false;
    try {
      return new URL(src, document.baseURI).origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }

  // Theme palettes — only used as a fallback when the page bg can't be parsed.
  var lp = { bg: 'FCF6EE', text: '172430' };
  var dp = { bg: '0F1318', text: 'E4E6EA' };
  function pal() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? dp : lp;
  }
  function setupMasters(pptx /*, p */) {
    pptx.theme = { headFontFace: FONT_STACK.DISPLAY, bodyFontFace: FONT_STACK.BODY };
  }

  // Measure the vertical extent the step's visible content actually occupies
  // inside its own box, and record steps that read as too sparse or that
  // overflow. Reporting only — see the note on SPARSE_FILL.
  function reportDensity(step, stepRect, stepIndex, title) {
    if (!stepRect || stepRect.height < 10) return;
    var all = step.querySelectorAll('*');
    var minTop = Infinity, maxBot = -Infinity, counted = 0;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (isHidden(el) || isChrome(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.top < minTop) minTop = r.top;
      if (r.bottom > maxBot) maxBot = r.bottom;
      counted++;
    }
    if (!counted || maxBot <= minTop) return;
    var fill = (maxBot - minTop) / stepRect.height;
    var kind = null;
    if (fill < SPARSE_FILL) kind = 'sparse';
    else if (fill > CROWDED_FILL) kind = 'crowded';
    if (!kind) return;
    overflowReports.push({
      index: typeof stepIndex === 'number' ? stepIndex : -1,
      title: title || ('step ' + stepIndex),
      kind: kind,
      fill: +fill.toFixed(2),
      elements: counted,
      hint: kind === 'sparse'
        ? 'Merge with an adjacent step, or give it a visual element (chart, diagram, image).'
        : 'Split into two steps; content exceeds the slide box.'
    });
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
  // Rule R1: report the family the element is ACTUALLY rendered with, so
  // the consumer re-shapes the line with the same metrics we measured.
  // We resolve the CSS stack's first entry rather than remapping to a
  // house typeface — remapping is what made v4 overflow.
  function fontFamily(cs) {
    var ff = cs.fontFamily || '';
    if (/Mono|Consolas|Menlo|Monaco|monospace/i.test(ff)) return FONT_STACK.MONO;
    if (/Space Grotesk/i.test(ff)) return FONT_STACK.DISPLAY;
    if (/Noto Sans SC/i.test(ff)) return FONT_STACK.BODY;
    if (/PingFang/i.test(ff)) return FONT_STACK.BODY_FALLBACK;
    // Unknown family: take the stack's first concrete name verbatim. Falling
    // through to a house font here would reintroduce the metric mismatch.
    var first = ff.split(',')[0].replace(/["']/g, '').trim();
    return first || FONT_STACK.BODY;
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
      if (slideLabel || slideTitle) headerH = HEADER_H;
    }

    // Safe area comes from the export contract at the top of this file.
    var bodyTop = headerH > 0 ? headerH : MARGIN_Y;
    var bodyW = SW - MARGIN_X * 2;
    var bodyH = SH - bodyTop - MARGIN_Y;

    // Fit the live step to the slide's body aspect before measuring. Without
    // this the letterbox fit below is height-constrained on a typical window
    // and shrinks every font by ~30%. Once the aspects match, the reader's own
    // browser zoom decides how much content fits and how large the type is.
    var boxStyle = {
      width: step.style.width,
      height: step.style.height,
      maxWidth: step.style.maxWidth,
      maxHeight: step.style.maxHeight,
      minHeight: step.style.minHeight,
      paddingTop: step.style.paddingTop,
      paddingBottom: step.style.paddingBottom,
      margin: step.style.margin,
      boxSizing: step.style.boxSizing
    };
    var restoreBox = function () {
      step.style.width = boxStyle.width;
      step.style.height = boxStyle.height;
      step.style.maxWidth = boxStyle.maxWidth;
      step.style.maxHeight = boxStyle.maxHeight;
      step.style.minHeight = boxStyle.minHeight;
      step.style.paddingTop = boxStyle.paddingTop;
      step.style.paddingBottom = boxStyle.paddingBottom;
      step.style.margin = boxStyle.margin;
      step.style.boxSizing = boxStyle.boxSizing;
    };
    var bodyAspect = bodyW / bodyH;
    var boxW = Math.min(window.innerWidth, window.innerHeight * bodyAspect);
    var boxH = boxW / bodyAspect;
    step.style.boxSizing = 'border-box';
    step.style.maxWidth = 'none';
    step.style.maxHeight = 'none';
    // The 100vh min-height and the safe-area padding exist for on-screen chrome
    // that is never exported, so they only shrink the captured type.
    step.style.minHeight = '0';
    step.style.paddingTop = Math.round(boxH * 0.04) + 'px';
    step.style.paddingBottom = Math.round(boxH * 0.04) + 'px';
    step.style.width = boxW + 'px';
    step.style.height = boxH + 'px';
    step.style.margin = '0 auto';
    /* eslint-disable no-unused-expressions */
    step.offsetHeight;
    /* eslint-enable no-unused-expressions */
    // Dense slides that overflow the slide box keep their natural size so the
    // letterbox fit still captures every element.
    if (step.scrollHeight > boxH + 4) restoreBox();

    var stepRect = step.getBoundingClientRect();
    if (stepRect.width < 10 || stepRect.height < 10) {
      restoreBox();
      step.style.animation = prevAnim;
      return;
    }

    // Width-first fit. v4 used min(widthRatio, heightRatio), so any step
    // taller than the body box was scaled down by its height — dense steps
    // ended up filling as little as 4% of the slide. Width is what carries
    // legibility, so we scale by width and only concede height down to
    // SCALE_FLOOR. Past that we keep the floor and report the overflow, so
    // an over-long step is visibly a content problem to be split, rather
    // than silently rendered unreadably small.
    var widthScale = bodyW / stepRect.width;
    var heightScale = bodyH / stepRect.height;
    var scale = widthScale;
    if (heightScale < widthScale) {
      scale = Math.max(heightScale, widthScale * SCALE_FLOOR);
    }
    var contentW = stepRect.width * scale;
    var contentH = stepRect.height * scale;
    var offX = MARGIN_X + (bodyW - contentW) / 2;
    // Centre vertically when there is room; pin to the top once content is
    // taller than the body box so the overflow falls off the bottom edge
    // rather than being clipped equally at both ends.
    var offY = contentH <= bodyH
      ? bodyTop + (bodyH - contentH) / 2
      : bodyTop;

    // Density check: measure how much of the step box the step's own content
    // actually occupies. This is about the AUTHORED layout, not the replay —
    // a step that is 30% full on the web is 30% full on the slide, and the
    // fix belongs in the article (merge steps, or add a visual element),
    // not in this renderer.
    reportDensity(step, stepRect, stepIndex, slideTitle || slideLabel);

    if (headerH > 0) {
      // No decorative rule above the title.
      //
      // A coloured bar spanning the header used to sit here. Accent stripes
      // and header bars are a well-known tell of auto-generated decks, and
      // they carry no information — the label already establishes the
      // section. Whitespace separates the header from the body instead.
      // See the "已知失真 / 演示规范" notes in study-room-standards §5.3.
      if (slideLabel) {
        sl.addText(slideLabel, {
          x: 0.6, y: 0.34, w: SW - 1.2, h: 0.28,
          margin: 0, fontFace: FONT_STACK.DISPLAY, fontSize: 11, bold: true,
          color: '0D8F8C', charSpacing: 1.5, valign: 'top'
        });
      }
      if (slideTitle) {
        sl.addText(slideTitle, {
          x: 0.6, y: 0.60, w: SW - 1.2, h: 0.32,
          margin: 0, fontFace: FONT_STACK.DISPLAY, fontSize: 22, bold: true,
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
      if (el.tagName === 'IMG') {
        var src = el.currentSrc || el.src;
        // Lazy images that never entered the viewport have not been fetched,
        // so currentSrc is empty and naturalWidth is 0. During export the
        // step is measured off-screen, so most lazy figures are in exactly
        // that state — they would silently vanish from the deck. Fall back
        // to the declared src and let the caller's decode pass supply the
        // pixels; report the ones that are still not loaded.
        if (!src) {
          skippedImages.push({ src: el.getAttribute('src') || '(no src)', reason: 'image never loaded' });
          return;
        }
        // Cross-origin images cannot be embedded.
        //
        // PptxGenJS fetches every image by XHR when the deck is written. An
        // <img> renders fine cross-origin, so the page looks correct, but
        // the XHR is refused by CORS and rejects the whole write() — one
        // remote image took down the entire export. Canvas re-encoding is
        // not a way out either: drawing a cross-origin image taints the
        // canvas and toDataURL() then throws.
        //
        // So we skip what cannot be embedded and report it, rather than
        // failing the deck. Same principle as the density findings: degrade
        // visibly, never crash.
        if (isCrossOrigin(src)) {
          skippedImages.push({ src: src, reason: 'cross-origin (CORS blocks embedding)' });
        } else {
          fgOps.push({
            type: 'img', src: src,
            x: MX(rect.left), y: MY(rect.top),
            w: MS(rect.width), h: MS(rect.height)
          });
        }
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
        if (png && isCrossOrigin(png)) {
          skippedImages.push({ src: png, reason: 'cross-origin svg snapshot' });
        } else if (png) {
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
          emitTextNode(node, {
            face: face, size: size, color: color,
            bold: bold, ital: ital, align: align,
            lsp: lsp, charSp: charSp
          });
        } else if (node.nodeType === 1) {
          walkText(node, false);
        }
      }
    }

    // Rule R2: emit one box per VISUAL line.
    //
    // getClientRects() on a Range returns one rect per line fragment the
    // browser actually painted, so we can hand the consumer pre-broken
    // lines whose height is already known. With wrapping disabled on each
    // box, the consumer has no wrapping decision left to get wrong — the
    // v4 overlap defect becomes structurally impossible rather than merely
    // less likely.
    //
    // Mapping text back to each line requires a character-level binary
    // search, because the browser exposes rects but not the break points.
    function emitTextNode(node, sty) {
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) return;

      var range = document.createRange();
      var rects;
      try {
        range.selectNodeContents(node);
        rects = range.getClientRects();
      } catch (e) { return; }

      var visible = [];
      for (var r = 0; r < rects.length; r++) {
        if (rects[r].width >= 1 && rects[r].height >= 1) visible.push(rects[r]);
      }
      if (!visible.length) return;

      // Single line, or too long to split economically: one box, no wrap.
      if (visible.length === 1 || raw.length > MAX_SPLIT_CHARS) {
        var bb = range.getBoundingClientRect();
        pushLine(raw.replace(/\s+/g, ' ').trim(), visible.length === 1 ? visible[0] : bb, sty,
          /* wrap */ visible.length > 1);
        return;
      }

      var slices = sliceByLine(node, raw, visible.length);
      for (var li = 0; li < visible.length; li++) {
        var text = (slices[li] || '').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        pushLine(text, visible[li], sty, false);
      }
    }

    // Walk the text node one character at a time, tracking which line rect
    // each character lands on, and cut the string at every transition.
    function sliceByLine(node, raw, lineCount) {
      var out = [];
      var probe = document.createRange();
      var current = '';
      var lastTop = null;
      for (var i = 0; i < raw.length; i++) {
        var top;
        try {
          probe.setStart(node, i);
          probe.setEnd(node, i + 1);
          var pr = probe.getBoundingClientRect();
          top = pr.height ? Math.round(pr.top) : lastTop;
        } catch (e) { top = lastTop; }
        if (lastTop === null) lastTop = top;
        // A downward jump means the browser broke the line here.
        if (top !== null && lastTop !== null && top - lastTop > 1) {
          out.push(current);
          current = '';
          lastTop = top;
        }
        current += raw.charAt(i);
      }
      out.push(current);
      // Defensive: if the scan disagrees with the rect count, fall back to
      // proportional slicing so no text is dropped.
      if (out.length !== lineCount) {
        out = [];
        var per = Math.ceil(raw.length / lineCount);
        for (var k = 0; k < lineCount; k++) out.push(raw.substr(k * per, per));
      }
      return out;
    }

    function pushLine(text, rect, sty, allowWrap) {
      if (!text) return;
      // Position by the measured rect, exactly as the background pass does.
      //
      // An earlier attempt re-anchored text on an estimated baseline to fix
      // inline chips (<code>, badges) sitting a few pixels off their
      // neighbours. It made things worse: the background pass emits an
      // element's chip fill from getBoundingClientRect(), so shifting only
      // the text separated the glyphs from the fill behind them. Both
      // passes must derive from the same rect. Residual sub-pixel baseline
      // differences between inline boxes are accepted; desynchronised
      // layers are not.
      var w = MS(rect.width) * (allowWrap ? 1 : LINE_WIDTH_SLACK) + 0.04;
      fgOps.push({
        type: 'text', text: text,
        x: MX(rect.left) - 0.02,
        y: MY(rect.top) - 0.01,
        w: w,
        h: MS(rect.height) + 0.02,
        fontFace: sty.face, fontSize: Math.max(6, sty.size),
        color: sty.color, bold: sty.bold, italic: sty.ital,
        align: sty.align, lineSpacing: sty.lsp, charSpacing: sty.charSp,
        wrap: !!allowWrap
      });
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
          x: op.x, y: op.y, w: Math.max(0.15, op.w), h: Math.max(0.12, op.h),
          margin: 0,
          fontFace: op.fontFace, fontSize: op.fontSize,
          color: op.color, bold: op.bold, italic: op.italic,
          // Per-line boxes are already broken; wrapping must stay off or the
          // consumer re-flows them and rule R2 is lost.
          align: op.align, valign: 'top', wrap: op.wrap === true,
          lineSpacingMultiple: op.lineSpacing
        };
        if (op.charSpacing) opts.charSpacing = Math.round(op.charSpacing * 100) / 100;
        try { sl.addText(op.text, opts); } catch (e) {}
      }
    });

    // Restore the per-step animation we suspended above.
    restoreBox();
    step.style.animation = prevAnim;
  }

  // Caller signature: (pptx, step, stepIndex, gi, total, palette, deriveLabel, deriveTitle)
  function renderStep(pptx, step, stepIndex, _gi, _total, _p, deriveLabel, deriveTitle) {
    captureSlide(pptx, step, pal(), deriveLabel, deriveTitle, stepIndex);
  }

  window.StudyRoomPptxExport = {
    getPalette: pal,
    renderStep: renderStep,
    setupMasters: setupMasters,
    // Steps flagged as too sparse or overflowing. Reporting only — read
    // after a run to tell the author which slides need content work. The
    // renderer deliberately does not rescale them.
    getOverflowReports: function () { return overflowReports.slice(); },
    resetOverflowReports: function () { overflowReports.length = 0; },
    // Images left out of the deck (cross-origin). Surfaced so the author can
    // localise them into the article's own media/ folder.
    getSkippedImages: function () { return skippedImages.slice(); },
    resetSkippedImages: function () { skippedImages.length = 0; }
  };
})();

// ============================================================
// InfographicMath — Pure Culling, Hit-Test, Pagination & Progress
// ============================================================

var InfographicMath = (function () {
  var CULL_MAX_ANGLE = Math.PI * 0.45;
  var CULL_FADE_START = Math.PI * 0.30;
  var PROGRESS_MIN_ITEMS = 13;
  var FAST_JUMP_STEP = 5;

  function clampNum(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function lerpColor(hex1, hex2, t) {
    var r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    var r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    return '#' + [
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t)
    ].map(function (c) { return clampNum(c, 0, 255).toString(16).padStart(2, '0'); }).join('');
  }

  function hexToHsl(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var dd = max - min;
      s = l > 0.5 ? dd / (2 - max - min) : dd / (max + min);
      if (max === r) h = (g - b) / dd + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / dd + 2;
      else h = (r - g) / dd + 4;
      h /= 6;
    }
    return { h: h, s: s, l: l };
  }

  function hslToHex(h, s, l) {
    var r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return '#' + [r, g, b].map(function (c) {
      return clampNum(Math.round(c * 255), 0, 255).toString(16).padStart(2, '0');
    }).join('');
  }

  function getWheelAngle(idx, total, rotation, gap) {
    if (!gap) gap = 0.32;
    return -(total - 1) / 2 * gap + idx * gap + rotation;
  }

  function computeLevel0Gap(total0, r0, viewHeight, defaultGap) {
    if (total0 <= 1) return defaultGap;
    var maxHalf0 = Math.asin(Math.min(0.95, (viewHeight / 2 - 80) / r0));
    var fitGap0 = (2 * maxHalf0 * 0.85) / (total0 - 1);
    return Math.max(0.08, Math.min(defaultGap, fitGap0));
  }

  function computeAngularEdgeFade(centerAngle, maxAngle, fadeStart) {
    var maxA = maxAngle !== undefined ? maxAngle : CULL_MAX_ANGLE;
    var startA = fadeStart !== undefined ? fadeStart : CULL_FADE_START;
    var absA = Math.abs(centerAngle);
    if (absA >= maxA) return 0;
    if (absA <= startA) return 1;
    var u = (maxA - absA) / Math.max(0.0001, maxA - startA);
    return u * u * (3 - 2 * u);
  }

  function wedgeIntersectsViewport(cx, cy, innerR, outerR, a1, a2, centerAngle, viewport) {
    if (!viewport) return true;
    var vx1 = viewport.x, vy1 = viewport.y;
    var vx2 = viewport.x + viewport.w, vy2 = viewport.y + viewport.h;
    var pad = viewport.pad !== undefined ? viewport.pad : 48;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var sampleAngles = [a1, centerAngle, a2];
    if (a1 < 0 && a2 > 0) sampleAngles.push(0);
    for (var k = 0; k < sampleAngles.length; k++) {
      var ang = sampleAngles[k];
      var cosA = Math.cos(ang), sinA = Math.sin(ang);
      var ix = cx + innerR * cosA, iy = cy + innerR * sinA;
      var ox = cx + outerR * cosA, oy = cy + outerR * sinA;
      minX = Math.min(minX, ix, ox);
      maxX = Math.max(maxX, ix, ox);
      minY = Math.min(minY, iy, oy);
      maxY = Math.max(maxY, iy, oy);
    }
    return !(maxX < vx1 - pad || minX > vx2 + pad || maxY < vy1 - pad || minY > vy2 + pad);
  }

  function computeSpokeBoundaries(nodeAngles, level0Gap) {
    var boundaries = [];
    var halfGap = level0Gap / 2;
    if (nodeAngles.length === 1) {
      boundaries.push(nodeAngles[0] - halfGap, nodeAngles[0] + halfGap);
    } else {
      boundaries.push(nodeAngles[0] - (nodeAngles[1] - nodeAngles[0]) / 2);
      for (var i = 0; i < nodeAngles.length - 1; i++) {
        boundaries.push((nodeAngles[i] + nodeAngles[i + 1]) / 2);
      }
      boundaries.push(nodeAngles[nodeAngles.length - 1] + (nodeAngles[nodeAngles.length - 1] - nodeAngles[nodeAngles.length - 2]) / 2);
    }
    return boundaries;
  }

  function cullVisibleSpokes(opts) {
    var nodeAngles = opts.nodeAngles || [];
    var total = nodeAngles.length;
    if (!total) return [];
    var gap = opts.gap || 0.32;
    var maxAngle = opts.maxAngle !== undefined ? opts.maxAngle : CULL_MAX_ANGLE;
    var fadeStart = opts.fadeStart !== undefined ? opts.fadeStart : CULL_FADE_START;
    var boundaries = computeSpokeBoundaries(nodeAngles, gap);
    var visible = [];
    for (var i = 0; i < total; i++) {
      var centerAngle = nodeAngles[i];
      var fade = computeAngularEdgeFade(centerAngle, maxAngle, fadeStart);
      if (fade <= 0.001) continue;
      var a1 = Math.max(-maxAngle, boundaries[i]);
      var a2 = Math.min(maxAngle, boundaries[i + 1]);
      if (a2 <= a1) continue;
      if (!wedgeIntersectsViewport(opts.cx || 0, opts.cy || 0, opts.innerR || 0, opts.outerR || 0, a1, a2, centerAngle, opts.viewport)) {
        continue;
      }
      visible.push({ idx: i, centerAngle: centerAngle, a1: a1, a2: a2, fade: fade });
    }
    return visible;
  }

  function findTappedSpokeIndex(angle, total, lvlAngle, gap, maxAngle) {
    var maxA = maxAngle !== undefined ? maxAngle : CULL_MAX_ANGLE;
    if (!total || Math.abs(angle) > maxA) return -1;
    var stepGap = gap || 0.32;
    var bestIdx = -1;
    var bestDist = stepGap * 0.65;
    for (var i = 0; i < total; i++) {
      var itemAngle = getWheelAngle(i, total, lvlAngle, stepGap);
      if (Math.abs(itemAngle) >= maxA) continue;
      var ad = Math.abs(angle - itemAngle);
      if (ad < bestDist) {
        bestDist = ad;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function computeSpinTargetIndex(currentIdx, total, rawDirection, isFastJump, jumpSize) {
    if (!total || total <= 0) return { nextIdx: 0, clamped: false, atBoundary: true };
    var step = (isFastJump ? (jumpSize || FAST_JUMP_STEP) : 1) * (rawDirection > 0 ? 1 : -1);
    var unclamped = currentIdx + step;
    if (!isFastJump && (unclamped < 0 || unclamped >= total)) {
      return { nextIdx: currentIdx, clamped: true, atBoundary: true };
    }
    var clampedIdx = clampNum(unclamped, 0, total - 1);
    return { nextIdx: clampedIdx, clamped: clampedIdx !== unclamped, atBoundary: clampedIdx === currentIdx };
  }

  function computeArcProgressSpec(selectedIdx, total, viewport, cx, cy, progressR) {
    if (!total || total < PROGRESS_MIN_ITEMS) return null;
    var trackHalf = Math.PI * 0.28;
    if (viewport && progressR > 0) {
      var topSafe = viewport.topSafe !== undefined ? viewport.topSafe : 84;
      var topY = Math.max(viewport.y + topSafe, cy - progressR * 0.78);
      var botY = Math.min(viewport.y + viewport.h - 72, cy + progressR * 0.78);
      var sinTop = clampNum((topY - cy) / progressR, -0.82, -0.10);
      var sinBot = clampNum((botY - cy) / progressR, 0.10, 0.82);
      trackHalf = Math.max(0.18, Math.min(Math.abs(Math.asin(sinTop)), Math.abs(Math.asin(sinBot))));
    }
    var trackStart = -trackHalf, trackEnd = trackHalf, trackSpan = trackEnd - trackStart;
    var visibleCount = Math.min(total, Math.max(3, Math.round((CULL_MAX_ANGLE * 2) / 0.32)));
    var thumbSpan = clampNum(trackSpan * (visibleCount / total), trackSpan * 0.08, trackSpan * 0.45);
    var ratio = total > 1 ? clampNum(selectedIdx / (total - 1), 0, 1) : 0;
    var thumbStart = trackStart + (trackSpan - thumbSpan) * ratio;
    var thumbEnd = thumbStart + thumbSpan;
    return {
      trackStart: trackStart,
      trackEnd: trackEnd,
      thumbStart: thumbStart,
      thumbEnd: thumbEnd,
      thumbMid: (thumbStart + thumbEnd) / 2,
      label: (selectedIdx + 1) + ' / ' + total
    };
  }

  function buildArcSegmentD(cx, cy, r, startA, endA) {
    var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    var x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    var largeArc = Math.abs(endA - startA) > Math.PI ? 1 : 0;
    return 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2;
  }

  function computeSpokeTintColors(nc, isSel, parity, isDark, useHslLight) {
    var tintRatio = isSel ? 0.55 : 0.40;
    if (isDark || !useHslLight) {
      var baseInner = isDark ? (isSel ? '#1a2030' : (parity ? '#161a26' : '#131720')) : (isSel ? '#e0e2ea' : (parity ? '#e8eaef' : '#e4e6ec'));
      var baseOuter = isDark ? (isSel ? '#283040' : (parity ? '#222a36' : '#1e2630')) : (isSel ? '#eceef4' : (parity ? '#f0f1f5' : '#eceeF2'));
      return { inner: lerpColor(baseInner, nc, tintRatio), outer: lerpColor(baseOuter, nc, tintRatio) };
    }
    var hsl = hexToHsl(nc);
    var chroma = Math.min(0.40, hsl.s) * (isSel ? 1.0 : 0.62);
    var L = clampNum(0.82 + hsl.l * 0.12 + (parity ? 0.012 : -0.012), 0.78, 0.95);
    return {
      inner: hslToHex(hsl.h, chroma, clampNum(L - 0.035, 0.74, 0.96)),
      outer: hslToHex(hsl.h, chroma * 0.88, clampNum(L + 0.02, 0.74, 0.97))
    };
  }

  function createArcGeometry(getBaseRadius, getArcGap, minLevel0Width, maxMult, baseMult) {
    function levelWidth(d) {
      var gap = getArcGap();
      if (d === 0) return Math.max(minLevel0Width, gap * 0.72);
      return gap * Math.min(maxMult, baseMult + 0.18 * d);
    }
    function outerR(d) {
      var r = getBaseRadius();
      for (var i = 1; i <= d; i++) r += levelWidth(i);
      return r;
    }
    function innerR(d) {
      return d === 0 ? getBaseRadius() - levelWidth(0) : outerR(d - 1);
    }
    return { levelWidth: levelWidth, outerR: outerR, innerR: innerR };
  }

  return {
    CULL_MAX_ANGLE: CULL_MAX_ANGLE,
    CULL_FADE_START: CULL_FADE_START,
    PROGRESS_MIN_ITEMS: PROGRESS_MIN_ITEMS,
    FAST_JUMP_STEP: FAST_JUMP_STEP,
    clampNum: clampNum,
    lerpColor: lerpColor,
    hexToHsl: hexToHsl,
    hslToHex: hslToHex,
    getWheelAngle: getWheelAngle,
    computeLevel0Gap: computeLevel0Gap,
    computeAngularEdgeFade: computeAngularEdgeFade,
    wedgeIntersectsViewport: wedgeIntersectsViewport,
    computeSpokeBoundaries: computeSpokeBoundaries,
    cullVisibleSpokes: cullVisibleSpokes,
    findTappedSpokeIndex: findTappedSpokeIndex,
    computeSpinTargetIndex: computeSpinTargetIndex,
    computeArcProgressSpec: computeArcProgressSpec,
    buildArcSegmentD: buildArcSegmentD,
    computeSpokeTintColors: computeSpokeTintColors,
    createArcGeometry: createArcGeometry
  };
})();

if (typeof window !== 'undefined') window.InfographicMath = InfographicMath;
if (typeof module !== 'undefined' && module.exports) module.exports = InfographicMath;

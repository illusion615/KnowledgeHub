// ============================================================
// Infographic Mobile View — Level-locked Viewfinder for Phones
// ============================================================
// Touch model:
//   - Vertical swipe  → rotate the focused wheel (spin nodes)
//   - Horizontal swipe → switch between arc levels (parent ↔ child)
//   - Tap on node      → select it / navigate to article
// The viewport auto-centers on the focused level's arc band,
// with adjacent levels peeking from the left/right edges.
// ============================================================

/* eslint-disable no-unused-vars */
function renderInfographicViewMobile(ctx) {
  var planets = ctx.planets;
  var lang = ctx.lang;
  var searchQuery = ctx.searchQuery;
  var matchesSearch = ctx.matchesSearch;
  var arcSortMode = ctx.arcSortMode;
  var getChildren = ctx.getChildren;
  var getAllArticles = ctx.getAllArticles;
  var navigateToArticle = ctx.navigateToArticle;
  var currentLayout = ctx.currentLayout;
  var spokeStyle = ctx.spokeStyle;
  var colorSchemes = ctx.colorSchemes;
  var currentScheme = ctx.currentScheme;
  var container = ctx.container;

  // ── Virtual canvas dimensions ──
  var VW = 1400;
  var VH = 900;
  var cx = -VW * 0.08;
  var cy = VH / 2;
  var baseRadius = VW * 0.28;
  var arcGap = VW * 0.18;

  // ── Screen dimensions ──
  var screenW = window.innerWidth;
  var screenH = window.innerHeight;

  // ── ViewBox state ──
  var vpX = 0;
  var vpY = 0;
  var viewW = 100;
  var viewH = 100;

  // ── Per-level state ──
  function makeLevel() {
    return { angle: 0, targetAngle: 0, selectedIdx: 0, visible: true, timer: null, collapsing: false };
  }
  var arcLevels = [makeLevel()];
  var arcState = { focusArc: 0, animFrame: null, isAnimating: false };
  var descendantCache = {};
  var defaultNodeGap = 0.32;

  // ── Cleanup previous instance ──
  if (container._arcMobileCleanup) {
    container._arcMobileCleanup();
  }
  container.innerHTML = '';

  // ── SVG element ──
  var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('class', 'arc-svg arc-svg-mobile');
  svgEl.style.width = '100%';
  svgEl.style.height = '100%';
  svgEl.style.touchAction = 'none';
  container.appendChild(svgEl);

  // ── Glow overlay SVG ──
  var glowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  glowSvg.setAttribute('class', 'arc-svg arc-svg-mobile');
  glowSvg.style.width = '100%';
  glowSvg.style.height = '100%';
  glowSvg.style.pointerEvents = 'none';
  glowSvg.style.touchAction = 'none';
  container.appendChild(glowSvg);
  var glowFocusedDepth = -1;

  // ── Breadcrumb bar ──
  var breadcrumbBar = document.createElement('div');
  breadcrumbBar.className = 'arc-mobile-breadcrumb';
  container.appendChild(breadcrumbBar);

  // ── Hint ──
  var hintEl = document.createElement('div');
  hintEl.className = 'arc-scroll-hint';
  hintEl.textContent = lang === 'zh' ? '上下滑动旋转 · 左右切换层级' : 'Swipe ↕ rotate · Swipe ↔ levels';
  container.appendChild(hintEl);
  // Auto-hide hint after 3s
  setTimeout(function () { hintEl.style.opacity = '0'; }, 3000);

  // ── Detail card ──
  var detailEl = document.createElement('a');
  detailEl.className = 'arc-detail arc-detail-mobile';
  container.appendChild(detailEl);

  function updateViewBox() {
    svgEl.setAttribute('viewBox', vpX + ' ' + vpY + ' ' + viewW + ' ' + viewH);
  }
  function updateGlowViewBox() {
    glowSvg.setAttribute('viewBox', vpX + ' ' + vpY + ' ' + viewW + ' ' + viewH);
  }

  // ── Geometry ──
  function arcLevelWidth(d) {
    if (d === 0) return Math.max(250, arcGap * 0.72);
    return arcGap * Math.min(1.30, 0.80 + 0.18 * d);
  }
  function arcOuterR(d) {
    var r = baseRadius;
    for (var i = 1; i <= d; i++) r += arcLevelWidth(i);
    return r;
  }
  function arcInnerR(d) {
    if (d === 0) return baseRadius - arcLevelWidth(0);
    return arcOuterR(d - 1);
  }

  var level0Gap = (function () {
    var total0 = planets.length;
    if (total0 <= 1) return defaultNodeGap;
    var r0 = arcOuterR(0);
    var margin0 = 80;
    var maxHalf0 = Math.asin(Math.min(0.95, (VH / 2 - margin0) / r0));
    var visibleSpan0 = 2 * maxHalf0;
    var fitGap0 = (visibleSpan0 * 0.85) / (total0 - 1);
    return Math.max(0.08, Math.min(defaultNodeGap, fitGap0));
  })();

  function getNodeGap() { return level0Gap; }

  function getWheelAngle(idx, total, rotation, gap) {
    if (!gap) gap = defaultNodeGap;
    var offset = -(total - 1) / 2 * gap;
    return offset + idx * gap + rotation;
  }

  function angleForLevel(depth, idx, total) {
    return -getWheelAngle(idx, total, 0, getNodeGap());
  }

  // ── Tree queries ──
  function getItemsForLevel(depth) {
    var items;
    if (depth === 0) {
      items = planets.map(function (pl) { return { type: 'topic', data: pl }; });
    } else {
      var parentNode = getSelectedNodeAtDepth(depth - 1);
      if (!parentNode) return [];
      var children = getChildren(parentNode.id);
      items = children.map(function (c) {
        return { type: c.type === 'topic' ? 'topic' : 'article', data: c };
      });
    }
    if (searchQuery) {
      items = items.filter(function (item) {
        if (item.type === 'article') return matchesSearch(item.data, searchQuery);
        return matchesSearch(item.data, searchQuery) ||
          getAllArticles(item.data.id).some(function (a) { return matchesSearch(a, searchQuery); });
      });
    }
    if (arcSortMode && arcSortMode !== 'default') {
      items = items.slice();
      items.sort(function (a, b) {
        if (arcSortMode === 'title-asc' || arcSortMode === 'title-desc') {
          var aL = (a.data.label || a.data.title || {})[lang] || a.data.id;
          var bL = (b.data.label || b.data.title || {})[lang] || b.data.id;
          return arcSortMode === 'title-asc' ? aL.localeCompare(bL) : bL.localeCompare(aL);
        }
        if (arcSortMode === 'date-asc' || arcSortMode === 'date-desc') {
          var aD = a.data.date || '0000'; var bD = b.data.date || '0000';
          return arcSortMode === 'date-asc' ? aD.localeCompare(bD) : bD.localeCompare(aD);
        }
        return 0;
      });
    }
    return items;
  }

  function getSelectedNodeAtDepth(depth) {
    var items = getItemsForLevel(depth);
    var lvl = arcLevels[depth];
    if (!lvl || !items.length) return null;
    return items[Math.min(lvl.selectedIdx, items.length - 1)].data;
  }

  function nodeLabel(n) {
    return n.label ? n.label[lang] : (n.title ? n.title[lang] : n.id);
  }

  function ensureLevel(depth) {
    while (arcLevels.length <= depth) arcLevels.push(makeLevel());
  }

  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function lerpColor(hex1, hex2, t) {
    var r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    var r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    return '#' + [
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t)
    ].map(function (c) { return Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0'); }).join('');
  }

  // ── Viewport: center on focused level ──
  // The viewfinder shows the focused arc band in the center,
  // with ~20% peek of adjacent levels on each side.
  function computeViewport(focusDepth) {
    var innerR = arcInnerR(focusDepth);
    var outerR = arcOuterR(focusDepth);
    var bandWidth = outerR - innerR;
    // Add peek margins: show ~30% of adjacent band width on each side
    var peekRatio = 0.35;
    var peekLeft = focusDepth > 0 ? arcLevelWidth(focusDepth > 0 ? focusDepth - 1 : 0) * peekRatio : bandWidth * 0.15;
    var peekRight = bandWidth * peekRatio;

    var totalRadialSpan = peekLeft + bandWidth + peekRight;
    // The aspect ratio of screen determines viewH
    var aspect = screenH / screenW;
    var vw = totalRadialSpan;
    var vh = vw * aspect;

    // Center horizontally on the middle of the focused band
    var midR = (innerR + outerR) / 2;
    // The arc is drawn at angle 0 (right side of center), so the band center
    // in SVG x is at cx + midR. We want that centered in the viewport.
    var centerX = cx + midR;
    var vpXNew = centerX - peekLeft - bandWidth / 2;
    // Center vertically on cy
    var vpYNew = cy - vh / 2;

    return { vpX: vpXNew, vpY: vpYNew, viewW: vw, viewH: vh };
  }

  // ── Smooth viewport transition ──
  var vpAnimFrame = null;
  var vpTarget = { vpX: 0, vpY: 0, viewW: 100, viewH: 100 };
  var vpAnimating = false;

  function animateViewportTo(target) {
    vpTarget = target;
    if (vpAnimating) return;
    vpAnimating = true;
    function step() {
      var dx = vpTarget.vpX - vpX;
      var dy = vpTarget.vpY - vpY;
      var dw = vpTarget.viewW - viewW;
      var dh = vpTarget.viewH - viewH;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(dw) < 1 && Math.abs(dh) < 1) {
        vpX = vpTarget.vpX;
        vpY = vpTarget.vpY;
        viewW = vpTarget.viewW;
        viewH = vpTarget.viewH;
        updateViewBox();
        updateGlowViewBox();
        vpAnimating = false;
        vpAnimFrame = null;
        return;
      }
      var ease = 0.15;
      vpX += dx * ease;
      vpY += dy * ease;
      viewW += dw * ease;
      viewH += dh * ease;
      updateViewBox();
      updateGlowViewBox();
      vpAnimFrame = requestAnimationFrame(step);
    }
    vpAnimFrame = requestAnimationFrame(step);
  }

  function snapViewportToLevel(focusDepth, animate) {
    var vp = computeViewport(focusDepth);
    if (animate) {
      animateViewportTo(vp);
    } else {
      vpX = vp.vpX;
      vpY = vp.vpY;
      viewW = vp.viewW;
      viewH = vp.viewH;
      updateViewBox();
      updateGlowViewBox();
    }
  }

  // ── Drawing ──

  function drawArcRing(arcIdx) {
    var r = arcOuterR(arcIdx);
    var span = Math.PI * 0.85;
    var startA = -span / 2, endA = span / 2;
    var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    var x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    var la = span > Math.PI ? 1 : 0;
    var d = 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2;
    var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
    var schemeDots = scheme.dots || ['#ff7a00', '#0d8f8c', '#e0b04b', '#e8eaef'];
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    var cls = 'arc-ring arc-ring-' + arcIdx;
    if (arcState.focusArc === arcIdx) cls += ' is-focused';
    path.setAttribute('class', cls);
    path.setAttribute('stroke', schemeDots[arcIdx % schemeDots.length]);
    svgEl.appendChild(path);
  }

  function updateGlow() {
    var depth = arcState.focusArc;
    if (depth === glowFocusedDepth) return;
    glowFocusedDepth = depth;
    glowSvg.innerHTML = '';

    var r = arcOuterR(depth);
    var span = Math.PI * 0.85;
    var startA = -span / 2, endA = span / 2;
    var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    var x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    var la = span > Math.PI ? 1 : 0;
    var d = 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2;

    var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
    var schemeDots = scheme.dots || ['#ff7a00', '#0d8f8c', '#e0b04b', '#e8eaef'];
    var glowColor = schemeDots[depth % schemeDots.length];
    var gradId = 'arc-glow-sweep-mobile';

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', cx - r); grad.setAttribute('y1', cy - r);
    grad.setAttribute('x2', cx + r); grad.setAttribute('y2', cy + r);
    [
      { off: '0%', color: glowColor, op: '0' },
      { off: '15%', color: glowColor, op: '0.4' },
      { off: '25%', color: '#fff', op: '0.9' },
      { off: '35%', color: glowColor, op: '0.4' },
      { off: '50%', color: glowColor, op: '0' },
      { off: '65%', color: glowColor, op: '0.3' },
      { off: '75%', color: '#fff', op: '0.7' },
      { off: '85%', color: glowColor, op: '0.3' },
      { off: '100%', color: glowColor, op: '0' }
    ].forEach(function (s) {
      var stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop.setAttribute('offset', s.off);
      stop.setAttribute('stop-color', s.color);
      stop.setAttribute('stop-opacity', s.op);
      grad.appendChild(stop);
    });
    var anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    anim.setAttribute('attributeName', 'gradientTransform');
    anim.setAttribute('type', 'rotate');
    anim.setAttribute('from', '0 ' + cx + ' ' + cy);
    anim.setAttribute('to', '360 ' + cx + ' ' + cy);
    anim.setAttribute('dur', '12s');
    anim.setAttribute('repeatCount', 'indefinite');
    grad.appendChild(anim);
    defs.appendChild(grad);
    glowSvg.appendChild(defs);

    var glowOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glowOuter.setAttribute('d', d);
    glowOuter.setAttribute('class', 'arc-ring-glow arc-ring-glow-outer');
    glowOuter.setAttribute('stroke', 'url(#' + gradId + ')');
    glowSvg.appendChild(glowOuter);

    var glowInner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glowInner.setAttribute('d', d);
    glowInner.setAttribute('class', 'arc-ring-glow arc-ring-glow-inner');
    glowInner.setAttribute('stroke', 'url(#' + gradId + ')');
    glowSvg.appendChild(glowInner);
  }

  function drawArcSpokes(arcIdx, nodeAngles, nodeColors, selectedIdx, items) {
    if (!nodeAngles || !nodeAngles.length) return;
    var innerR = arcInnerR(arcIdx);
    var outerR = arcOuterR(arcIdx);
    var isFocused = (arcIdx === arcState.focusArc);
    // Dim non-focused levels
    var levelOpacity = isFocused ? 1 : 0.45;

    var boundaries = [];
    var i;
    var halfGap = level0Gap / 2;
    if (nodeAngles.length === 1) {
      boundaries.push(nodeAngles[0] - halfGap);
      boundaries.push(nodeAngles[0] + halfGap);
    } else {
      var firstGap = (nodeAngles[1] - nodeAngles[0]) / 2;
      boundaries.push(nodeAngles[0] - firstGap);
      for (i = 0; i < nodeAngles.length - 1; i++) {
        boundaries.push((nodeAngles[i] + nodeAngles[i + 1]) / 2);
      }
      var lastGap = (nodeAngles[nodeAngles.length - 1] - nodeAngles[nodeAngles.length - 2]) / 2;
      boundaries.push(nodeAngles[nodeAngles.length - 1] + lastGap);
    }

    // Draw wedge fills
    if (spokeStyle !== 'hidden') {
      var isDark = isDarkTheme();
      var defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }
      function mixColor(hex, nodeHex, ratio) {
        var r1=parseInt(hex.slice(1,3),16),g1=parseInt(hex.slice(3,5),16),b1=parseInt(hex.slice(5,7),16);
        var r2=parseInt(nodeHex.slice(1,3),16),g2=parseInt(nodeHex.slice(3,5),16),b2=parseInt(nodeHex.slice(5,7),16);
        return '#'+[
          Math.round(r1*(1-ratio)+r2*ratio),
          Math.round(g1*(1-ratio)+g2*ratio),
          Math.round(b1*(1-ratio)+b2*ratio)
        ].map(function(c){return Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0');}).join('');
      }
      for (i = 0; i < boundaries.length - 1; i++) {
        var a1 = boundaries[i], a2 = boundaries[i + 1];
        var isSel = (i === selectedIdx);
        var parity = i % 2;
        var nc = (nodeColors && nodeColors[i]) ? nodeColors[i] : '#888';
        var tintRatio = isSel ? 0.55 : 0.40;
        var baseInner, baseOuter;
        if (isDark) {
          baseInner = isSel ? '#1a2030' : (parity ? '#161a26' : '#131720');
          baseOuter = isSel ? '#283040' : (parity ? '#222a36' : '#1e2630');
        } else {
          baseInner = isSel ? '#e0e2ea' : (parity ? '#e8eaef' : '#e4e6ec');
          baseOuter = isSel ? '#eceef4' : (parity ? '#f0f1f5' : '#eceeF2');
        }
        var innerColor = mixColor(baseInner, nc, tintRatio);
        var outerColor = mixColor(baseOuter, nc, tintRatio);

        var gradId = 'spoke-grad-m-' + arcIdx + '-' + i;
        var rg = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        rg.setAttribute('id', gradId);
        rg.setAttribute('gradientUnits', 'userSpaceOnUse');
        rg.setAttribute('cx', cx); rg.setAttribute('cy', cy); rg.setAttribute('r', outerR);
        var s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', innerColor);
        var s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', outerColor);
        rg.appendChild(s1); rg.appendChild(s2); defs.appendChild(rg);

        var ox1=cx+outerR*Math.cos(a1),oy1=cy+outerR*Math.sin(a1);
        var ox2=cx+outerR*Math.cos(a2),oy2=cy+outerR*Math.sin(a2);
        var ix1b=cx+innerR*Math.cos(a1),iy1b=cy+innerR*Math.sin(a1);
        var ix2b=cx+innerR*Math.cos(a2),iy2b=cy+innerR*Math.sin(a2);
        var ss = Math.abs(a2 - a1), la2 = ss > Math.PI ? 1 : 0;
        var wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wedge.setAttribute('d',
          'M '+ix1b+' '+iy1b+' L '+ox1+' '+oy1+
          ' A '+outerR+' '+outerR+' 0 '+la2+' 1 '+ox2+' '+oy2+
          ' L '+ix2b+' '+iy2b+
          ' A '+innerR+' '+innerR+' 0 '+la2+' 0 '+ix1b+' '+iy1b+' Z');
        wedge.setAttribute('fill', 'url(#' + gradId + ')');
        var fillOp = spokeStyle === 'transparent' ? (isSel ? '0.35' : '0.15') : '1';
        wedge.setAttribute('fill-opacity', String(parseFloat(fillOp) * levelOpacity));
        wedge.setAttribute('class', 'arc-spoke-fill' + (isSel ? ' is-active' : ''));
        wedge.setAttribute('data-depth', arcIdx);
        wedge.setAttribute('data-idx', i);
        svgEl.appendChild(wedge);
      }
      // Spoke lines
      var spokeColor = isDark ? '#2a3040' : '#c0c4d0';
      var spokeOpac = (spokeStyle === 'transparent') ? '0.18' : '0.35';
      boundaries.forEach(function (ba) {
        var sx1=cx+innerR*Math.cos(ba),sy1=cy+innerR*Math.sin(ba);
        var sx2=cx+outerR*Math.cos(ba),sy2=cy+outerR*Math.sin(ba);
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1',sx1);line.setAttribute('y1',sy1);
        line.setAttribute('x2',sx2);line.setAttribute('y2',sy2);
        line.setAttribute('class','arc-spoke');
        line.setAttribute('stroke',spokeColor);line.setAttribute('opacity', String(parseFloat(spokeOpac) * levelOpacity));
        svgEl.appendChild(line);
      });
    }

    // Text labels
    if (items) {
      var radialLen = outerR - innerR;
      var pad = Math.max(8, radialLen * 0.08);
      var arrowSpace = 18;
      var angularSpace = items.length > 1 ? getNodeGap() : 0.36;
      for (i = 0; i < items.length; i++) {
        var centerAngle = nodeAngles[i];
        var hasArrow = items[i].type === 'topic' && getChildren(items[i].data.id).length > 0;
        var textRadialLen = radialLen - pad * 2 - (hasArrow ? arrowSpace : 0);
        var midR = innerR + pad + textRadialLen / 2;
        var perpHalf = (innerR + radialLen / 2) * angularSpace / 2;
        var boxH = Math.max(18, perpHalf * 2 - 6);
        var boxW = Math.max(30, textRadialLen);
        var fontSize = 16;
        if (items[i].type === 'topic') {
          fontSize = Math.max(11, Math.min(16, boxW / 10));
          fontSize = Math.min(fontSize, Math.max(10, boxH * 0.42));
        }
        var tx = cx + midR * Math.cos(centerAngle);
        var ty = cy + midR * Math.sin(centerAngle);
        var rotDeg = centerAngle * 180 / Math.PI;
        if (Math.abs(centerAngle) > Math.PI / 2) rotDeg += 180;
        var dist = Math.abs(centerAngle);
        var textOpacity = Math.max(0.15, 1 - dist * 0.5);
        var isSelText = (i === selectedIdx);
        var fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('x', tx - boxW / 2);
        fo.setAttribute('y', ty - boxH / 2);
        fo.setAttribute('width', boxW);
        fo.setAttribute('height', boxH);
        fo.setAttribute('transform', 'rotate(' + rotDeg + ' ' + tx + ' ' + ty + ')');
        fo.setAttribute('class', 'arc-spoke-text-wrap');
        fo.setAttribute('data-depth', arcIdx);
        fo.setAttribute('data-idx', i);
        fo.setAttribute('opacity', (isSelText ? 1 : textOpacity) * levelOpacity);
        var div = document.createElement('div');
        div.className = 'arc-spoke-label' + (isSelText ? ' is-active' : '');
        div.style.width = boxW + 'px';
        div.style.height = boxH + 'px';
        div.style.fontSize = fontSize + 'px';

        var itemData = items[i].data;
        if (items[i].type === 'article') {
          var titleClamp = boxH > 60 ? 2 : 1;
          var summaryClamp = boxH > 90 ? 2 : (boxH > 70 ? 1 : 0);
          if (itemData.date) {
            var dateEl = document.createElement('span');
            dateEl.className = 'spoke-date';
            dateEl.textContent = itemData.date;
            div.appendChild(dateEl);
          }
          var titleEl = document.createElement('span');
          titleEl.className = 'spoke-title';
          titleEl.style.webkitLineClamp = titleClamp;
          titleEl.textContent = nodeLabel(itemData);
          div.appendChild(titleEl);
          if (itemData.tags && itemData.tags.length > 0 && boxH > 50) {
            var tagsEl = document.createElement('span');
            tagsEl.className = 'spoke-tags';
            itemData.tags.slice(0, 2).forEach(function (t) {
              var tag = document.createElement('span');
              tag.className = 'spoke-tag';
              tag.textContent = t;
              tagsEl.appendChild(tag);
            });
            div.appendChild(tagsEl);
          }
          if (summaryClamp > 0 && itemData.summary) {
            var sumEl = document.createElement('span');
            sumEl.className = 'spoke-summary';
            sumEl.textContent = itemData.summary[lang] || '';
            div.appendChild(sumEl);
          }
        } else {
          div.classList.add('is-topic');
          var topicName = document.createElement('span');
          topicName.className = 'spoke-topic-name';
          topicName.textContent = nodeLabel(itemData);
          div.appendChild(topicName);
          var childCount = getChildren(itemData.id).length;
          if (childCount > 0) {
            var badge = document.createElement('span');
            badge.className = 'spoke-count';
            badge.textContent = childCount;
            div.appendChild(badge);
          }
        }
        fo.appendChild(div);
        svgEl.appendChild(fo);
        if (hasArrow) {
          var arrowR = outerR - pad - 4;
          var ax = cx + arrowR * Math.cos(centerAngle);
          var ay = cy + arrowR * Math.sin(centerAngle);
          var arrowRotDeg = centerAngle * 180 / Math.PI;
          var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          arrow.setAttribute('d', 'M -3 -4.5 L 3.5 0 L -3 4.5');
          arrow.setAttribute('transform', 'translate(' + ax + ',' + ay + ') rotate(' + arrowRotDeg + ')');
          arrow.setAttribute('class', 'arc-spoke-arrow' + (isSelText ? ' is-active' : ''));
          arrow.setAttribute('data-depth', arcIdx);
          arrow.setAttribute('data-idx', i);
          arrow.setAttribute('opacity', levelOpacity);
          svgEl.appendChild(arrow);
        }
      }
    }
  }

  // ── Render ──
  function render() {
    svgEl.innerHTML = '';
    descendantCache = {};

    for (var depth = 0; depth < arcLevels.length; depth++) {
      var lvl = arcLevels[depth];
      var items = getItemsForLevel(depth);
      if (!items.length) break;
      if (lvl.selectedIdx >= items.length) lvl.selectedIdx = items.length - 1;

      drawArcRing(depth);
      var gap = getNodeGap();
      var angles = [], colors = [];

      var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
      var schemeDots = scheme.dots || ['#ff7a00', '#0d8f8c', '#e0b04b', '#e8eaef'];

      if (depth === 0) {
        items.forEach(function (item, j) {
          angles.push(getWheelAngle(j, items.length, lvl.angle, gap));
          colors.push(schemeDots[j % schemeDots.length]);
        });
      } else {
        var rootLvl = arcLevels[0];
        var rootItems = getItemsForLevel(0);
        var rootIdx = rootLvl ? Math.min(rootLvl.selectedIdx, rootItems.length - 1) : 0;
        var rootColor = schemeDots[rootIdx % schemeDots.length];
        items.forEach(function (item, j) {
          angles.push(getWheelAngle(j, items.length, lvl.angle, gap));
          var ratio = items.length > 1 ? j / (items.length - 1) : 0;
          var lightTarget = isDarkTheme() ? '#b8c8d8' : '#f0f2f6';
          colors.push(lerpColor(rootColor, lightTarget, 0.15 + ratio * 0.55));
        });
      }
      drawArcSpokes(depth, angles, colors, lvl.selectedIdx, items);

      if (!lvl.visible) break;
    }

    // Selected-path highlight
    var items0HL = getItemsForLevel(0);
    if (items0HL.length > 0) {
      var lvl0HL = arcLevels[0];
      var sel0 = lvl0HL ? Math.min(lvl0HL.selectedIdx, items0HL.length - 1) : 0;
      var gap0 = getNodeGap();
      var angle0 = getWheelAngle(sel0, items0HL.length, lvl0HL.angle, gap0);
      var halfGapHL = level0Gap / 2;
      var hlInnerR = arcInnerR(0);
      var hlOuterR = arcOuterR(Math.min(arcLevels.length - 1, depth || 0));
      var isDarkHL = isDarkTheme();
      [angle0 - halfGapHL, angle0 + halfGapHL].forEach(function (ba) {
        var lx1 = cx + hlInnerR * Math.cos(ba), ly1 = cy + hlInnerR * Math.sin(ba);
        var lx2 = cx + hlOuterR * Math.cos(ba), ly2 = cy + hlOuterR * Math.sin(ba);
        var hlLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hlLine.setAttribute('x1', lx1); hlLine.setAttribute('y1', ly1);
        hlLine.setAttribute('x2', lx2); hlLine.setAttribute('y2', ly2);
        hlLine.setAttribute('stroke', isDarkHL ? '#ffffff' : '#1a1a2e');
        hlLine.setAttribute('stroke-width', '2');
        hlLine.setAttribute('opacity', isDarkHL ? '0.5' : '0.4');
        hlLine.setAttribute('class', 'arc-path-highlight');
        svgEl.appendChild(hlLine);
      });
    }

    updateGlow();
    updateBreadcrumb();
  }

  // ── Breadcrumb ──
  function updateBreadcrumb() {
    var parts = [];
    for (var d = 0; d <= arcState.focusArc; d++) {
      var node = getSelectedNodeAtDepth(d);
      if (node) parts.push(nodeLabel(node));
    }
    breadcrumbBar.textContent = parts.join(' › ');
  }

  // ── Animation (wheel rotation) ──
  function animateRoulette() {
    var moving = false;
    for (var d = 0; d < arcLevels.length; d++) {
      var lvl = arcLevels[d];
      var diff = lvl.targetAngle - lvl.angle;
      if (Math.abs(diff) > 0.003) {
        lvl.angle += diff * 0.18;
        moving = true;
      } else {
        lvl.angle = lvl.targetAngle;
      }
    }
    render();
    if (moving) {
      arcState.animFrame = requestAnimationFrame(animateRoulette);
    } else {
      arcState.isAnimating = false;
      arcState.animFrame = null;
    }
  }

  function startAnim() {
    if (!arcState.isAnimating) {
      arcState.isAnimating = true;
      arcState.animFrame = requestAnimationFrame(animateRoulette);
    }
  }

  // ── Navigation ──
  function spinLevel(depth, delta) {
    var items = getItemsForLevel(depth);
    if (!items.length) return;
    var lvl = arcLevels[depth];
    if (!lvl) return;
    var newIdx = lvl.selectedIdx + delta;
    if (newIdx < 0 || newIdx >= items.length) return;
    lvl.selectedIdx = newIdx;
    lvl.targetAngle = angleForLevel(depth, newIdx, items.length);

    for (var k = arcLevels.length - 1; k > depth; k--) {
      if (arcLevels[k].timer) clearTimeout(arcLevels[k].timer);
    }
    arcLevels.length = depth + 1;
    if (arcState.focusArc > depth) arcState.focusArc = depth;

    var item = items[newIdx];
    if (item.type === 'topic') {
      var childItems = getItemsForLevel(depth + 1);
      if (childItems.length > 0) {
        ensureLevel(depth + 1);
        var initAngle = angleForLevel(depth + 1, 0, childItems.length);
        arcLevels[depth + 1].selectedIdx = 0;
        arcLevels[depth + 1].angle = initAngle;
        arcLevels[depth + 1].targetAngle = initAngle;
        arcLevels[depth + 1].collapsing = false;
        arcLevels[depth + 1].visible = true;
      }
    }
    startAnim();
  }

  function focusOnLevel(depth, animate) {
    if (depth < 0 || depth >= arcLevels.length) return;
    var items = getItemsForLevel(depth);
    if (!items.length) return;
    arcState.focusArc = depth;
    glowFocusedDepth = -1; // force glow redraw
    snapViewportToLevel(depth, animate !== false);
    if (!arcState.isAnimating) render(); // redraw opacity
  }

  function handleSpokeClick(d, idx) {
    var items = getItemsForLevel(d);
    if (idx >= items.length) return;
    var item = items[idx];
    if (item.type === 'article') {
      if (item.data.url) navigateToArticle(item.data.url);
    } else {
      arcLevels[d].selectedIdx = idx;
      arcLevels[d].targetAngle = angleForLevel(d, idx, items.length);
      for (var k = arcLevels.length - 1; k > d; k--) {
        if (arcLevels[k].timer) clearTimeout(arcLevels[k].timer);
      }
      arcLevels.length = d + 1;
      if (arcState.focusArc > d) arcState.focusArc = d;

      var childItems = getItemsForLevel(d + 1);
      if (childItems.length > 0) {
        ensureLevel(d + 1);
        var initAngle = angleForLevel(d + 1, 0, childItems.length);
        arcLevels[d + 1].selectedIdx = 0;
        arcLevels[d + 1].angle = initAngle;
        arcLevels[d + 1].targetAngle = initAngle;
        arcLevels[d + 1].collapsing = false;
        arcLevels[d + 1].visible = true;
      }
      startAnim();
      // Focus on the child level if it exists, else stay
      if (childItems && childItems.length > 0) {
        focusOnLevel(d + 1, true);
      } else {
        focusOnLevel(d, true);
      }
    }
  }

  // ── Touch: vertical = rotate wheel, horizontal = switch levels ──
  var touch = {
    active: false, startX: 0, startY: 0, moved: false,
    lastT: 0, velY: 0, lastY: 0, lastX: 0,
    direction: null, // 'v' for vertical (rotate), 'h' for horizontal (level switch)
    accumulatedSpin: 0 // accumulated vertical distance for continuous spin
  };
  var DIRECTION_THRESHOLD = 12; // px before committing to a direction
  var SPIN_PX_PER_STEP = 60; // px of vertical drag per one node step

  function onTouchStart(e) {
    if (currentLayout !== 'infographic' || e.touches.length !== 1) return;
    var t = e.touches[0];
    touch.active = true;
    touch.moved = false;
    touch.direction = null;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.lastX = t.clientX;
    touch.lastY = t.clientY;
    touch.lastT = Date.now();
    touch.velY = 0;
    touch.accumulatedSpin = 0;
    // Stop any ongoing viewport animation
    if (vpAnimFrame) {
      cancelAnimationFrame(vpAnimFrame);
      vpAnimFrame = null;
      vpAnimating = false;
    }
  }

  function onTouchMove(e) {
    if (!touch.active || e.touches.length !== 1) return;
    e.preventDefault();
    var t = e.touches[0];
    var dx = t.clientX - touch.startX;
    var dy = t.clientY - touch.startY;

    // Determine direction if not yet committed
    if (!touch.direction) {
      if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return;
      touch.direction = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      touch.moved = true;
    }

    // Track velocity
    var now = Date.now();
    var dt = Math.max(1, now - touch.lastT);
    touch.velY = (t.clientY - touch.lastY) / dt;
    touch.lastX = t.clientX;
    touch.lastY = t.clientY;
    touch.lastT = now;

    if (touch.direction === 'v') {
      // Vertical: rotate the focused wheel
      // Map vertical pixels to spin steps
      var totalDy = t.clientY - touch.startY;
      var steps = Math.round(totalDy / SPIN_PX_PER_STEP);
      var stepsNeeded = steps - touch.accumulatedSpin;
      if (stepsNeeded !== 0) {
        // Spin by stepsNeeded (negative dy = spin forward/down the list)
        var depth = arcState.focusArc;
        var items = getItemsForLevel(depth);
        var lvl = arcLevels[depth];
        if (lvl && items.length) {
          var newIdx = lvl.selectedIdx - stepsNeeded; // drag down = previous item
          newIdx = Math.max(0, Math.min(items.length - 1, newIdx));
          if (newIdx !== lvl.selectedIdx) {
            spinLevel(depth, newIdx - lvl.selectedIdx);
          }
        }
        touch.accumulatedSpin = steps;
      }
    }
    // Horizontal direction: handled on touchEnd (swipe gesture)
  }

  function onTouchEnd(e) {
    if (!touch.active) return;
    touch.active = false;

    if (!touch.moved || !touch.direction) {
      // Tap
      var pt = svgEl.createSVGPoint();
      pt.x = touch.startX;
      pt.y = touch.startY;
      var svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse());
      handleTapAt(svgPt.x, svgPt.y);
      return;
    }

    if (touch.direction === 'h') {
      // Horizontal swipe: switch level
      var swipeDx = touch.lastX - touch.startX;
      if (Math.abs(swipeDx) > 40) {
        if (swipeDx < 0) {
          // Swipe left → go deeper (child level)
          var nextDepth = arcState.focusArc + 1;
          if (nextDepth < arcLevels.length && getItemsForLevel(nextDepth).length > 0) {
            focusOnLevel(nextDepth, true);
          }
        } else {
          // Swipe right → go up (parent level)
          if (arcState.focusArc > 0) {
            focusOnLevel(arcState.focusArc - 1, true);
          }
        }
      }
    }

    if (touch.direction === 'v') {
      // Inertia spin: continue spinning based on velocity
      var vel = touch.velY; // px per ms
      if (Math.abs(vel) > 0.3) {
        var inertiaAccum = 0;
        var inertiaVel = vel;
        var inertiaFrame;
        function inertiaStep() {
          inertiaAccum += inertiaVel * 16; // ~16ms per frame
          var steps = Math.round(inertiaAccum / SPIN_PX_PER_STEP);
          if (steps !== 0) {
            var depth = arcState.focusArc;
            var items = getItemsForLevel(depth);
            var lvl = arcLevels[depth];
            if (lvl && items.length) {
              var newIdx = lvl.selectedIdx - steps;
              newIdx = Math.max(0, Math.min(items.length - 1, newIdx));
              if (newIdx !== lvl.selectedIdx) {
                spinLevel(depth, newIdx - lvl.selectedIdx);
              }
            }
            inertiaAccum -= steps * SPIN_PX_PER_STEP;
          }
          inertiaVel *= 0.92;
          if (Math.abs(inertiaVel) < 0.05) return;
          inertiaFrame = requestAnimationFrame(inertiaStep);
        }
        inertiaFrame = requestAnimationFrame(inertiaStep);
      }
    }
  }

  function handleTapAt(svgX, svgY) {
    var dist = Math.sqrt(Math.pow(svgX - cx, 2) + Math.pow(svgY - cy, 2));
    var angle = Math.atan2(svgY - cy, svgX - cx);

    var tappedDepth = -1;
    for (var d = arcLevels.length - 1; d >= 0; d--) {
      if (dist >= arcInnerR(d) && dist <= arcOuterR(d)) {
        tappedDepth = d;
        break;
      }
    }
    if (tappedDepth < 0) return;

    // If tapping a non-focused level, just switch focus to it
    if (tappedDepth !== arcState.focusArc) {
      focusOnLevel(tappedDepth, true);
      return;
    }

    var items = getItemsForLevel(tappedDepth);
    if (!items.length) return;
    var lvl = arcLevels[tappedDepth];
    var gap = getNodeGap();
    var bestIdx = 0, bestDist = Infinity;
    for (var i = 0; i < items.length; i++) {
      var a = getWheelAngle(i, items.length, lvl.angle, gap);
      var ad = Math.abs(angle - a);
      if (ad < bestDist) { bestDist = ad; bestIdx = i; }
    }

    handleSpokeClick(tappedDepth, bestIdx);
  }

  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: false });
  container.addEventListener('touchcancel', function () { touch.active = false; }, { passive: false });

  // SVG click for spoke interaction
  svgEl.addEventListener('click', function (e) {
    var target = e.target;
    while (target && target !== svgEl) {
      if (target.classList && target.classList.contains('arc-spoke-fill')) {
        var d = parseInt(target.getAttribute('data-depth'), 10);
        var idx = parseInt(target.getAttribute('data-idx'), 10);
        if (!isNaN(d) && !isNaN(idx)) { e.stopPropagation(); handleSpokeClick(d, idx); }
        return;
      }
      target = target.parentNode;
    }
  });

  // ── Resize ──
  var resizeHandler = function () {
    if (currentLayout !== 'infographic') return;
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    snapViewportToLevel(arcState.focusArc, false);
    glowFocusedDepth = -1;
    render();
  };
  window.addEventListener('resize', resizeHandler);

  // ── Pulse ──
  var pulseFrame = null;
  function runPulse() {
    var t = Date.now() / 1000;
    var val = 0.92 + 0.08 * Math.sin(t * 1.2);
    svgEl.querySelectorAll('.arc-spoke-fill.is-active').forEach(function (el) {
      el.setAttribute('fill-opacity', val.toFixed(3));
    });
    pulseFrame = requestAnimationFrame(runPulse);
  }
  pulseFrame = requestAnimationFrame(runPulse);

  // ── Cleanup ──
  container._arcMobileCleanup = function () {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchmove', onTouchMove);
    container.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', resizeHandler);
    if (arcState.animFrame) cancelAnimationFrame(arcState.animFrame);
    if (vpAnimFrame) cancelAnimationFrame(vpAnimFrame);
    if (pulseFrame) cancelAnimationFrame(pulseFrame);
    arcLevels.forEach(function (lvl) { if (lvl.timer) clearTimeout(lvl.timer); });
  };

  // ── Initial state ──
  var initItems = getItemsForLevel(0);
  if (initItems.length > 0) {
    var initAngle0 = angleForLevel(0, 0, initItems.length);
    arcLevels[0].selectedIdx = 0;
    arcLevels[0].angle = initAngle0;
    arcLevels[0].targetAngle = initAngle0;
    if (initItems[0].type === 'topic') {
      var childItems0 = getItemsForLevel(1);
      if (childItems0.length > 0) {
        ensureLevel(1);
        var childAngle0 = angleForLevel(1, 0, childItems0.length);
        arcLevels[1].selectedIdx = 0;
        arcLevels[1].angle = childAngle0;
        arcLevels[1].targetAngle = childAngle0;
        arcLevels[1].collapsing = false;
        arcLevels[1].visible = true;
      }
    }
  }

  // Start focused on level 0
  arcState.focusArc = 0;
  snapViewportToLevel(0, false);
  render();
}

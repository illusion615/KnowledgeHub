// ============================================================
// Infographic View — Arc Hierarchy Engine
// ============================================================
// Extracted from index.html renderInfographicView()
// External dependencies passed via ctx object:
//   ctx.container, ctx.planets, ctx.lang, ctx.searchQuery,
//   ctx.matchesSearch, ctx.arcSortMode, ctx.getChildren,
//   ctx.getAllArticles, ctx.navigateToArticle, ctx.currentLayout,
//   ctx.spokeStyle, ctx.colorSchemes, ctx.currentScheme
// ============================================================

// ============================================================
// InfographicShared — Common Arc Hierarchy Helpers
// ============================================================
var InfographicShared = (function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DEFAULT_DOTS = ['#ff7a00', '#0d8f8c', '#e0b04b', '#e8eaef'];

  function svgCreate(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]);
      });
    }
    return el;
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

  function clampNum(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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
      return Math.max(0, Math.min(255, Math.round(c * 255))).toString(16).padStart(2, '0');
    }).join('');
  }

  function makeLevel() {
    return { angle: 0, targetAngle: 0, selectedIdx: 0, visible: true, timer: null, collapsing: false };
  }

  function ensureLevel(arcLevels, depth) {
    while (arcLevels.length <= depth) arcLevels.push(makeLevel());
  }

  function getSchemeDots(colorSchemes, currentScheme) {
    var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
    return (scheme && scheme.dots) ? scheme.dots : DEFAULT_DOTS;
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

  function nodeLabel(n, lang) {
    return n.label ? n.label[lang] : (n.title ? n.title[lang] : n.id);
  }

  function queryItemsForLevel(ctx, arcLevels, depth, getSelectedFn) {
    var items;
    if (depth === 0) {
      items = ctx.planets.map(function (pl) { return { type: 'topic', data: pl }; });
    } else {
      var parentNode = getSelectedFn(depth - 1);
      if (!parentNode) return [];
      items = ctx.getChildren(parentNode.id).map(function (c) {
        return { type: c.type === 'topic' ? 'topic' : 'article', data: c };
      });
    }
    if (ctx.searchQuery) {
      items = items.filter(function (item) {
        if (item.type === 'article') return ctx.matchesSearch(item.data, ctx.searchQuery);
        return ctx.matchesSearch(item.data, ctx.searchQuery) ||
          ctx.getAllArticles(item.data.id).some(function (a) { return ctx.matchesSearch(a, ctx.searchQuery); });
      });
    }
    var sortMode = ctx.arcSortMode;
    if (sortMode && sortMode !== 'default') {
      items = items.slice().sort(function (a, b) {
        if (sortMode === 'title-asc' || sortMode === 'title-desc') {
          var aL = nodeLabel(a.data, ctx.lang) || '';
          var bL = nodeLabel(b.data, ctx.lang) || '';
          var loc = ctx.lang === 'zh' ? 'zh-Hans' : 'en';
          return sortMode === 'title-asc' ? aL.localeCompare(bL, loc) : bL.localeCompare(aL, loc);
        }
        if (sortMode === 'date-asc' || sortMode === 'date-desc') {
          var aD = a.data.date || '0000-00-00', bD = b.data.date || '0000-00-00';
          return sortMode === 'date-asc' ? aD.localeCompare(bD) : bD.localeCompare(aD);
        }
        return 0;
      });
    }
    return items;
  }

  function buildArcPathD(cx, cy, r) {
    var span = Math.PI * 0.85;
    var startA = -span / 2, endA = span / 2;
    var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    var x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    return 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + y2;
  }

  function drawArcRingPath(svgEl, cx, cy, r, arcIdx, isFocused, strokeColor) {
    var cls = 'arc-ring arc-ring-' + arcIdx + (isFocused ? ' is-focused' : '');
    svgEl.appendChild(svgCreate('path', { d: buildArcPathD(cx, cy, r), 'class': cls, stroke: strokeColor }));
  }

  function renderGlowOverlay(glowSvg, cx, cy, r, glowColor, gradId) {
    glowSvg.innerHTML = '';
    var d = buildArcPathD(cx, cy, r);

    var defs = svgCreate('defs');
    var grad = svgCreate('linearGradient', {
      id: gradId, gradientUnits: 'userSpaceOnUse',
      x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r
    });
    [
      ['0%', glowColor, '0'], ['15%', glowColor, '0.4'], ['25%', '#fff', '0.9'],
      ['35%', glowColor, '0.4'], ['50%', glowColor, '0'], ['65%', glowColor, '0.3'],
      ['75%', '#fff', '0.7'], ['85%', glowColor, '0.3'], ['100%', glowColor, '0']
    ].forEach(function (s) {
      grad.appendChild(svgCreate('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }));
    });
    grad.appendChild(svgCreate('animateTransform', {
      attributeName: 'gradientTransform', type: 'rotate',
      from: '0 ' + cx + ' ' + cy, to: '360 ' + cx + ' ' + cy,
      dur: '12s', repeatCount: 'indefinite'
    }));
    defs.appendChild(grad);
    glowSvg.appendChild(defs);
    glowSvg.appendChild(svgCreate('path', { d: d, 'class': 'arc-ring-glow arc-ring-glow-outer', stroke: 'url(#' + gradId + ')' }));
    glowSvg.appendChild(svgCreate('path', { d: d, 'class': 'arc-ring-glow arc-ring-glow-inner', stroke: 'url(#' + gradId + ')' }));
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

  function renderSpokesOnSvg(opts) {
    var svgEl = opts.svgEl, cx = opts.cx, cy = opts.cy;
    var innerR = opts.innerR, outerR = opts.outerR;
    var arcIdx = opts.arcIdx, nodeAngles = opts.nodeAngles, nodeColors = opts.nodeColors;
    var selectedIdx = opts.selectedIdx, items = opts.items;
    var level0Gap = opts.level0Gap, angularSpace = opts.angularSpace;
    var spokeStyle = opts.spokeStyle, lang = opts.lang, getChildren = opts.getChildren;
    var levelOpacity = opts.levelOpacity !== undefined ? opts.levelOpacity : 1;
    var useHslLight = !!opts.useHslLight, gradPrefix = opts.gradPrefix || 'spoke-grad-';

    if (!nodeAngles || !nodeAngles.length) return;
    var boundaries = computeSpokeBoundaries(nodeAngles, level0Gap);
    var i;

    if (spokeStyle !== 'hidden') {
      var isDark = isDarkTheme();
      var defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = svgCreate('defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }
      for (i = 0; i < boundaries.length - 1; i++) {
        var a1 = boundaries[i], a2 = boundaries[i + 1];
        var isSel = (i === selectedIdx), parity = i % 2;
        var nc = (nodeColors && nodeColors[i]) ? nodeColors[i] : '#888';
        var innerColor, outerColor;
        var tintRatio = isSel ? 0.55 : 0.40;
        if (isDark || !useHslLight) {
          var baseInner = isDark ? (isSel ? '#1a2030' : (parity ? '#161a26' : '#131720')) : (isSel ? '#e0e2ea' : (parity ? '#e8eaef' : '#e4e6ec'));
          var baseOuter = isDark ? (isSel ? '#283040' : (parity ? '#222a36' : '#1e2630')) : (isSel ? '#eceef4' : (parity ? '#f0f1f5' : '#eceeF2'));
          innerColor = lerpColor(baseInner, nc, tintRatio);
          outerColor = lerpColor(baseOuter, nc, tintRatio);
        } else {
          var hsl = hexToHsl(nc);
          var chroma = Math.min(0.40, hsl.s) * (isSel ? 1.0 : 0.62);
          var L = clampNum(0.82 + hsl.l * 0.12 + (parity ? 0.012 : -0.012), 0.78, 0.95);
          innerColor = hslToHex(hsl.h, chroma, clampNum(L - 0.035, 0.74, 0.96));
          outerColor = hslToHex(hsl.h, chroma * 0.88, clampNum(L + 0.02, 0.74, 0.97));
        }

        var gradId = gradPrefix + arcIdx + '-' + i;
        var rg = svgCreate('radialGradient', { id: gradId, gradientUnits: 'userSpaceOnUse', cx: cx, cy: cy, r: outerR });
        rg.appendChild(svgCreate('stop', { offset: '0%', 'stop-color': innerColor }));
        rg.appendChild(svgCreate('stop', { offset: '100%', 'stop-color': outerColor }));
        defs.appendChild(rg);

        var ox1 = cx + outerR * Math.cos(a1), oy1 = cy + outerR * Math.sin(a1);
        var ox2 = cx + outerR * Math.cos(a2), oy2 = cy + outerR * Math.sin(a2);
        var ix1b = cx + innerR * Math.cos(a1), iy1b = cy + innerR * Math.sin(a1);
        var ix2b = cx + innerR * Math.cos(a2), iy2b = cy + innerR * Math.sin(a2);
        var la2 = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
        var wedgeAttrs = {
          d: 'M ' + ix1b + ' ' + iy1b + ' L ' + ox1 + ' ' + oy1 +
             ' A ' + outerR + ' ' + outerR + ' 0 ' + la2 + ' 1 ' + ox2 + ' ' + oy2 +
             ' L ' + ix2b + ' ' + iy2b +
             ' A ' + innerR + ' ' + innerR + ' 0 ' + la2 + ' 0 ' + ix1b + ' ' + iy1b + ' Z',
          fill: 'url(#' + gradId + ')',
          'class': 'arc-spoke-fill' + (isSel ? ' is-active' : ''),
          'data-depth': arcIdx,
          'data-idx': i
        };
        if (spokeStyle === 'transparent' || levelOpacity !== 1) {
          var baseFillOp = spokeStyle === 'transparent' ? (isSel ? 0.35 : 0.15) : 1;
          wedgeAttrs['fill-opacity'] = String(baseFillOp * levelOpacity);
        }
        svgEl.appendChild(svgCreate('path', wedgeAttrs));
      }

      var spokeColor = isDark ? '#2a3040' : '#c0c4d0';
      var spokeOpac = ((spokeStyle === 'transparent') ? 0.18 : 0.35) * levelOpacity;
      boundaries.forEach(function (ba) {
        svgEl.appendChild(svgCreate('line', {
          x1: cx + innerR * Math.cos(ba), y1: cy + innerR * Math.sin(ba),
          x2: cx + outerR * Math.cos(ba), y2: cy + outerR * Math.sin(ba),
          'class': 'arc-spoke', stroke: spokeColor, opacity: String(spokeOpac)
        }));
      });
    }

    if (!items) return;
    var radialLen = outerR - innerR;
    var pad = Math.max(8, radialLen * 0.08);
    var arrowSpace = 18;
    for (i = 0; i < items.length; i++) {
      var centerAngle = nodeAngles[i];
      var hasArrow = items[i].type === 'topic' && getChildren(items[i].data.id).length > 0;
      var textRadialLen = radialLen - pad * 2 - (hasArrow ? arrowSpace : 0);
      var midR = innerR + pad + textRadialLen / 2;
      var perpHalf = (innerR + radialLen / 2) * angularSpace / 2;
      var boxH = Math.max(18, perpHalf * 2 - 6);
      var boxW = Math.max(30, textRadialLen);
      var fontSize = items[i].type === 'topic'
        ? Math.min(Math.max(11, Math.min(16, boxW / 10)), Math.max(10, boxH * 0.42))
        : 16;
      var tx = cx + midR * Math.cos(centerAngle), ty = cy + midR * Math.sin(centerAngle);
      var rotDeg = centerAngle * 180 / Math.PI + (Math.abs(centerAngle) > Math.PI / 2 ? 180 : 0);
      var textOpacity = Math.max(0.15, 1 - Math.abs(centerAngle) * 0.5);
      var isSelText = (i === selectedIdx);

      var fo = svgCreate('foreignObject', {
        x: tx - boxW / 2, y: ty - boxH / 2, width: boxW, height: boxH,
        transform: 'rotate(' + rotDeg + ' ' + tx + ' ' + ty + ')',
        'class': 'arc-spoke-text-wrap', 'data-depth': arcIdx, 'data-idx': i,
        opacity: (isSelText ? 1 : textOpacity) * levelOpacity
      });
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
        titleEl.textContent = nodeLabel(itemData, lang);
        div.appendChild(titleEl);
        if (itemData.tags && itemData.tags.length > 0 && boxH > 50) {
          var tagsEl = document.createElement('span');
          tagsEl.className = 'spoke-tags';
          var maxTags = (opts.dynamicMaxTags && boxW > 120) ? 3 : 2;
          itemData.tags.slice(0, maxTags).forEach(function (t) {
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
        topicName.textContent = nodeLabel(itemData, lang);
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
        var ax = cx + arrowR * Math.cos(centerAngle), ay = cy + arrowR * Math.sin(centerAngle);
        var arrowAttrs = {
          d: 'M -3 -4.5 L 3.5 0 L -3 4.5',
          transform: 'translate(' + ax + ',' + ay + ') rotate(' + (centerAngle * 180 / Math.PI) + ')',
          'class': 'arc-spoke-arrow' + (isSelText ? ' is-active' : ''),
          'data-depth': arcIdx, 'data-idx': i
        };
        if (levelOpacity !== 1) arrowAttrs.opacity = levelOpacity;
        svgEl.appendChild(svgCreate('path', arrowAttrs));
      }
    }
  }

  function computeAnglesAndColors(items, depth, lvlAngle, gap, schemeDots, rootIdx) {
    var angles = [], colors = [];
    var lightTarget = isDarkTheme() ? '#b8c8d8' : '#f0f2f6';
    var rootColor = schemeDots[(rootIdx || 0) % schemeDots.length];
    items.forEach(function (item, j) {
      angles.push(getWheelAngle(j, items.length, lvlAngle, gap));
      if (depth === 0) {
        colors.push(schemeDots[j % schemeDots.length]);
      } else {
        var ratio = items.length > 1 ? j / (items.length - 1) : 0;
        colors.push(lerpColor(rootColor, lightTarget, 0.15 + ratio * 0.55));
      }
    });
    return { angles: angles, colors: colors };
  }

  function drawSelectedPathHighlight(svgEl, cx, cy, angle0, halfGap, hlInnerR, hlOuterR) {
    var isDarkHL = isDarkTheme();
    [angle0 - halfGap, angle0 + halfGap].forEach(function (ba) {
      svgEl.appendChild(svgCreate('line', {
        x1: cx + hlInnerR * Math.cos(ba), y1: cy + hlInnerR * Math.sin(ba),
        x2: cx + hlOuterR * Math.cos(ba), y2: cy + hlOuterR * Math.sin(ba),
        stroke: isDarkHL ? '#ffffff' : '#1a1a2e',
        'stroke-width': '2',
        opacity: isDarkHL ? '0.5' : '0.4',
        'class': 'arc-path-highlight'
      }));
    });
  }

  function bindSpokeClickDelegation(svgEl, onClickSpoke) {
    svgEl.addEventListener('click', function (e) {
      var target = e.target;
      while (target && target !== svgEl) {
        if (target.classList && target.classList.contains('arc-spoke-fill')) {
          var d = parseInt(target.getAttribute('data-depth'), 10);
          var idx = parseInt(target.getAttribute('data-idx'), 10);
          if (!isNaN(d) && !isNaN(idx)) { e.stopPropagation(); onClickSpoke(d, idx); }
          return;
        }
        target = target.parentNode;
      }
    });
  }

  function startPulseLoop(svgEl) {
    var frame = null;
    function run() {
      var val = (0.92 + 0.08 * Math.sin(Date.now() / 1000 * 1.2)).toFixed(3);
      svgEl.querySelectorAll('.arc-spoke-fill.is-active').forEach(function (el) {
        el.setAttribute('fill-opacity', val);
      });
      frame = requestAnimationFrame(run);
    }
    frame = requestAnimationFrame(run);
    return function () { if (frame) cancelAnimationFrame(frame); };
  }

  function selectLevelItemAndExpand(arcLevels, arcState, d, idx, itemsLen, getItemsFn, angleForLevelFn) {
    arcLevels[d].selectedIdx = idx;
    arcLevels[d].targetAngle = angleForLevelFn(d, idx, itemsLen);
    for (var k = arcLevels.length - 1; k > d; k--) {
      if (arcLevels[k].timer) clearTimeout(arcLevels[k].timer);
    }
    arcLevels.length = d + 1;
    if (arcState.focusArc > d) arcState.focusArc = d;

    var childItems = getItemsFn(d + 1);
    if (childItems.length > 0) {
      ensureLevel(arcLevels, d + 1);
      var initAngle = angleForLevelFn(d + 1, 0, childItems.length);
      arcLevels[d + 1].selectedIdx = 0;
      arcLevels[d + 1].angle = initAngle;
      arcLevels[d + 1].targetAngle = initAngle;
      arcLevels[d + 1].collapsing = false;
      arcLevels[d + 1].visible = true;
    }
    return childItems;
  }

  function initRootAndFirstChild(arcLevels, getItemsFn, angleForLevelFn) {
    var initItems = getItemsFn(0);
    if (!initItems.length) return;
    var initAngle0 = angleForLevelFn(0, 0, initItems.length);
    arcLevels[0].selectedIdx = 0;
    arcLevels[0].angle = initAngle0;
    arcLevels[0].targetAngle = initAngle0;
    if (initItems[0].type === 'topic') {
      var childItems0 = getItemsFn(1);
      if (childItems0.length > 0) {
        ensureLevel(arcLevels, 1);
        var childAngle0 = angleForLevelFn(1, 0, childItems0.length);
        arcLevels[1].selectedIdx = 0;
        arcLevels[1].angle = childAngle0;
        arcLevels[1].targetAngle = childAngle0;
        arcLevels[1].collapsing = false;
        arcLevels[1].visible = true;
      }
    }
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

  function stepRouletteAngles(arcLevels, arcState) {
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
    if (arcState && typeof arcState.targetPanX === 'number') {
      var panDiff = arcState.targetPanX - arcState.panX;
      if (Math.abs(panDiff) > 0.5) {
        arcState.panX += panDiff * 0.18;
        moving = true;
      } else {
        arcState.panX = arcState.targetPanX;
      }
    }
    return moving;
  }

  function createAnimController(arcLevels, arcState, renderFn) {
    function step() {
      var moving = stepRouletteAngles(arcLevels, arcState);
      renderFn();
      if (moving) {
        arcState.animFrame = requestAnimationFrame(step);
      } else {
        arcState.isAnimating = false;
        arcState.animFrame = null;
      }
    }
    return function startAnim() {
      if (!arcState.isAnimating) {
        arcState.isAnimating = true;
        arcState.animFrame = requestAnimationFrame(step);
      }
    };
  }

  function renderRingAndSpokesForLevel(opts) {
    drawArcRingPath(opts.svgEl, opts.cx, opts.cy, opts.outerR, opts.depth, opts.isFocused, opts.schemeDots[opts.depth % opts.schemeDots.length]);
    var ac = computeAnglesAndColors(opts.items, opts.depth, opts.lvl.angle, opts.gap, opts.schemeDots, opts.rootIdx);
    renderSpokesOnSvg({
      svgEl: opts.svgEl,
      cx: opts.cx,
      cy: opts.cy,
      innerR: opts.innerR,
      outerR: opts.outerR,
      arcIdx: opts.depth,
      nodeAngles: ac.angles,
      nodeColors: ac.colors,
      selectedIdx: opts.lvl.selectedIdx,
      items: opts.items,
      level0Gap: opts.gap,
      angularSpace: opts.items.length > 1 ? opts.gap : 0.36,
      spokeStyle: opts.spokeStyle,
      lang: opts.lang,
      getChildren: opts.getChildren,
      levelOpacity: opts.levelOpacity,
      useHslLight: opts.useHslLight,
      dynamicMaxTags: opts.dynamicMaxTags,
      gradPrefix: opts.gradPrefix
    });
  }

  function createTreeAccessor(ctx, arcLevels, getGapFn) {
    function getSelectedNodeAtDepth(depth) {
      var items = getItemsForLevel(depth);
      var lvl = arcLevels[depth];
      return (lvl && items.length) ? items[Math.min(lvl.selectedIdx, items.length - 1)].data : null;
    }
    function getItemsForLevel(depth) {
      return queryItemsForLevel(ctx, arcLevels, depth, getSelectedNodeAtDepth);
    }
    function angleForLevel(depth, idx, total) {
      return -getWheelAngle(idx, total, 0, getGapFn());
    }
    return {
      getSelectedNodeAtDepth: getSelectedNodeAtDepth,
      getItemsForLevel: getItemsForLevel,
      angleForLevel: angleForLevel
    };
  }

  function renderAllLevelsAndHighlight(opts) {
    var arcLevels = opts.arcLevels;
    var getItemsForLevel = opts.getItemsForLevel;
    var schemeDots = getSchemeDots(opts.ctx.colorSchemes, opts.ctx.currentScheme);
    var rootItems = getItemsForLevel(0);
    var rootIdx = (arcLevels[0] && rootItems.length) ? Math.min(arcLevels[0].selectedIdx, rootItems.length - 1) : 0;
    var depth = 0;

    for (depth = 0; depth < arcLevels.length; depth++) {
      var lvl = arcLevels[depth];
      var items = getItemsForLevel(depth);
      if (!items.length) break;
      if (lvl.selectedIdx >= items.length) lvl.selectedIdx = items.length - 1;

      var groupEl = opts.wrapLevel ? opts.wrapLevel(lvl) : null;
      var origAppend = opts.svgEl.appendChild.bind(opts.svgEl);
      if (groupEl) opts.svgEl.appendChild = groupEl.appendChild.bind(groupEl);

      renderRingAndSpokesForLevel({
        svgEl: opts.svgEl,
        cx: opts.cx,
        cy: opts.cy,
        innerR: opts.arcInnerR(depth),
        outerR: opts.arcOuterR(depth),
        depth: depth,
        isFocused: opts.focusArc === depth,
        lvl: lvl,
        items: items,
        gap: opts.gap,
        schemeDots: schemeDots,
        rootIdx: rootIdx,
        spokeStyle: opts.ctx.spokeStyle,
        lang: opts.ctx.lang,
        getChildren: opts.ctx.getChildren,
        levelOpacity: opts.getLevelOpacity ? opts.getLevelOpacity(depth) : 1,
        useHslLight: opts.useHslLight,
        dynamicMaxTags: opts.dynamicMaxTags,
        gradPrefix: opts.gradPrefix
      });

      if (groupEl) opts.svgEl.appendChild = origAppend;
      if (!lvl.visible) break;
    }

    if (rootItems.length > 0) {
      var angle0 = getWheelAngle(rootIdx, rootItems.length, arcLevels[0].angle, opts.gap);
      drawSelectedPathHighlight(opts.svgEl, opts.cx, opts.cy, angle0, opts.gap / 2, opts.arcInnerR(0), opts.arcOuterR(Math.min(arcLevels.length - 1, depth || 0)));
    }
  }

  return {
    svgCreate: svgCreate,
    isDarkTheme: isDarkTheme,
    lerpColor: lerpColor,
    makeLevel: makeLevel,
    ensureLevel: ensureLevel,
    getSchemeDots: getSchemeDots,
    getWheelAngle: getWheelAngle,
    computeLevel0Gap: computeLevel0Gap,
    createArcGeometry: createArcGeometry,
    createAnimController: createAnimController,
    createTreeAccessor: createTreeAccessor,
    renderAllLevelsAndHighlight: renderAllLevelsAndHighlight,
    nodeLabel: nodeLabel,
    queryItemsForLevel: queryItemsForLevel,
    drawArcRingPath: drawArcRingPath,
    renderGlowOverlay: renderGlowOverlay,
    renderSpokesOnSvg: renderSpokesOnSvg,
    renderRingAndSpokesForLevel: renderRingAndSpokesForLevel,
    computeAnglesAndColors: computeAnglesAndColors,
    drawSelectedPathHighlight: drawSelectedPathHighlight,
    bindSpokeClickDelegation: bindSpokeClickDelegation,
    startPulseLoop: startPulseLoop,
    selectLevelItemAndExpand: selectLevelItemAndExpand,
    initRootAndFirstChild: initRootAndFirstChild
  };
})();
window.InfographicShared = InfographicShared;

/* eslint-disable no-unused-vars */
function renderInfographicViewModule(ctx) {
  var shared = window.InfographicShared;
  var planets = ctx.planets;
  var lang = ctx.lang;
  var getChildren = ctx.getChildren;
  var navigateToArticle = ctx.navigateToArticle;
  var currentLayout = ctx.currentLayout;
  var spokeStyle = ctx.spokeStyle;
  var colorSchemes = ctx.colorSchemes;
  var currentScheme = ctx.currentScheme;
  var container = ctx.container;

  var W = window.innerWidth, H = window.innerHeight;
  var cxBase = -W * 0.08;
  var cx = cxBase;
  var cy = H / 2;
  var baseRadius = Math.max(420, W * 0.28);
  var arcGap = Math.max(280, W * 0.18);

  var arcLevels = [shared.makeLevel()];
  var arcState = {
    focusArc: 0,
    animFrame: null,
    isAnimating: false,
    panX: 0,
    targetPanX: 0
  };
  var arcTouch = { active: false, moved: false, startX: 0, startY: 0, focusArc: 0, axis: '' };
  var arcTouchStartHandler = null;
  var arcTouchMoveHandler = null;
  var arcTouchEndHandler = null;
  var arcTouchCancelHandler = null;

  container.innerHTML = '';

  var svgEl = shared.svgCreate('svg', { 'class': 'arc-svg', width: '100%', height: '100%' });
  container.appendChild(svgEl);

  var glowSvg = shared.svgCreate('svg', { 'class': 'arc-svg', width: '100%', height: '100%' });
  glowSvg.style.pointerEvents = 'none';
  container.appendChild(glowSvg);
  var glowFocusedDepth = -1;

  var detailEl = document.createElement('a');
  detailEl.className = 'arc-detail';
  container.appendChild(detailEl);

  var hintEl = document.createElement('div');
  hintEl.className = 'arc-scroll-hint';
  hintEl.setAttribute('data-zh', '滚轮切换 · ←→ 层级 · Enter 进入 · Esc 关闭');
  hintEl.setAttribute('data-en', 'Scroll to browse · ←→ levels · Enter to open · Esc to close');
  hintEl.textContent = lang === 'zh' ? hintEl.getAttribute('data-zh') : hintEl.getAttribute('data-en');
  container.appendChild(hintEl);

  shared.bindSpokeClickDelegation(svgEl, handleSpokeClick);

  function handleSpokeClick(d, idx) {
    var spokeItems = getItemsForLevel(d);
    if (idx >= spokeItems.length) return;
    var item = spokeItems[idx];
    if (item.type === 'article') {
      if (item.data.url) navigateToArticle(item.data.url);
    } else {
      shared.selectLevelItemAndExpand(arcLevels, arcState, d, idx, spokeItems.length, getItemsForLevel, angleForLevel);
      startAnim();
    }
  }

  var defaultNodeGap = 0.32;
  var geom = shared.createArcGeometry(function () { return baseRadius; }, function () { return arcGap; }, 300, 1.60, 1.15);
  var arcOuterR = geom.outerR;
  var arcInnerR = geom.innerR;

  function computeTargetPanX() {
    var deepest = Math.max(0, Math.min(arcState.focusArc, arcLevels.length - 1));
    for (var d = arcLevels.length - 1; d > deepest; d--) {
      if (arcLevels[d] && arcLevels[d].visible && !arcLevels[d].collapsing &&
          getItemsForLevel(d).length > 0) {
        deepest = d;
        break;
      }
    }
    var pan = (W - Math.max(140, W * 0.16)) - (cxBase + arcOuterR(deepest));
    return pan < 0 ? pan : 0;
  }

  var level0Gap = shared.computeLevel0Gap(planets.length, arcOuterR(0), H, defaultNodeGap);
  var tree = shared.createTreeAccessor(ctx, arcLevels, function () { return level0Gap; });
  var getItemsForLevel = tree.getItemsForLevel;
  var angleForLevel = tree.angleForLevel;

  function ensureLevel(depth) {
    shared.ensureLevel(arcLevels, depth);
  }

  function trimLevels(depth) {
    var hasCollapsing = false;
    for (var i = arcLevels.length - 1; i > depth; i--) {
      if (arcLevels[i].timer) clearTimeout(arcLevels[i].timer);
      if (arcLevels[i].visible && !arcLevels[i].collapsing) {
        arcLevels[i].collapsing = true;
        hasCollapsing = true;
      }
    }
    if (arcState.focusArc > depth) arcState.focusArc = depth;
    if (hasCollapsing) {
      render();
      setTimeout(function () {
        for (var j = arcLevels.length - 1; j > depth; j--) {
          if (arcLevels[j].collapseTimer) clearTimeout(arcLevels[j].collapseTimer);
        }
        arcLevels.length = depth + 1;
        render();
      }, 350);
    } else {
      arcLevels.length = depth + 1;
    }
  }

  function updateGlow() {
    var depth = arcState.focusArc;
    if (depth === glowFocusedDepth) return;
    glowFocusedDepth = depth;
    var dots = shared.getSchemeDots(colorSchemes, currentScheme);
    shared.renderGlowOverlay(glowSvg, cxBase, cy, arcOuterR(depth), dots[depth % dots.length], 'arc-glow-sweep-persistent');
  }

  function hideDetail() {
    detailEl.classList.remove('is-visible');
  }

  function render() {
    svgEl.innerHTML = '';
    hideDetail();

    arcState.targetPanX = computeTargetPanX();
    cx = cxBase + arcState.panX;
    glowSvg.setAttribute('transform', 'translate(' + arcState.panX + ',0)');

    shared.renderAllLevelsAndHighlight({
      svgEl: svgEl,
      cx: cx,
      cy: cy,
      arcInnerR: arcInnerR,
      arcOuterR: arcOuterR,
      arcLevels: arcLevels,
      getItemsForLevel: getItemsForLevel,
      focusArc: arcState.focusArc,
      gap: level0Gap,
      ctx: ctx,
      useHslLight: true,
      dynamicMaxTags: true,
      gradPrefix: 'spoke-grad-',
      wrapLevel: function (lvl) {
        if (!lvl.collapsing) return null;
        var groupEl = shared.svgCreate('g', { 'class': 'arc-collapse-group' });
        groupEl.style.transition = 'opacity 0.35s ease-out';
        groupEl.style.opacity = '1';
        svgEl.appendChild(groupEl);
        requestAnimationFrame(function (g) {
          return function () { g.style.opacity = '0'; };
        }(groupEl));
        return groupEl;
      }
    });

    updateGlow();
    if (Math.abs(arcState.targetPanX - arcState.panX) > 0.5) startAnim();
  }

  var stopPulse = shared.startPulseLoop(svgEl);
  var startAnim = shared.createAnimController(arcLevels, arcState, render);

  function bounceEdgeNode(depth, idx, delta) {
    var lvl = arcLevels[depth];
    if (lvl) {
      var items = getItemsForLevel(depth);
      var nudge = -delta * 0.06;
      lvl.targetAngle = angleForLevel(depth, idx, items.length) + nudge;
      startAnim();
      setTimeout(function () {
        lvl.targetAngle = angleForLevel(depth, idx, items.length);
        startAnim();
      }, 120);
    }
  }

  function spinLevel(depth, delta) {
    var items = getItemsForLevel(depth);
    if (!items.length) return;
    var lvl = arcLevels[depth];
    if (!lvl) return;
    var newIdx = lvl.selectedIdx + delta;
    if (newIdx < 0 || newIdx >= items.length) {
      bounceEdgeNode(depth, lvl.selectedIdx, delta);
      return;
    }
    hideDetail();
    shared.selectLevelItemAndExpand(arcLevels, arcState, depth, newIdx, items.length, getItemsForLevel, angleForLevel);
    startAnim();
  }

  function handleVerticalInput(delta) {
    spinLevel(arcState.focusArc, delta);
  }

  function moveArcFocusForward() {
    var nextDepth = arcState.focusArc + 1;
    if (nextDepth < arcLevels.length && arcLevels[nextDepth].visible && !arcLevels[nextDepth].collapsing) {
      if (getItemsForLevel(nextDepth).length > 0) {
        arcState.focusArc = nextDepth;
        render();
      }
      return;
    }
    var curDepth = arcState.focusArc;
    var curItems = getItemsForLevel(curDepth);
    var curLvl = arcLevels[curDepth];
    if (!curItems.length || !curLvl) return;
    var curItem = curItems[curLvl.selectedIdx];
    if (!curItem || curItem.type !== 'topic') return;
    var childItems = getItemsForLevel(curDepth + 1);
    if (!childItems.length) return;
    ensureLevel(curDepth + 1);
    var initAngle = angleForLevel(curDepth + 1, 0, childItems.length);
    arcLevels[curDepth + 1].selectedIdx = 0;
    arcLevels[curDepth + 1].angle = initAngle;
    arcLevels[curDepth + 1].targetAngle = initAngle;
    arcLevels[curDepth + 1].collapsing = false;
    arcLevels[curDepth + 1].visible = false;
    clearTimeout(arcLevels[curDepth + 1].timer);
    arcLevels[curDepth + 1].timer = setTimeout(function () {
      arcLevels[curDepth + 1].visible = true;
      arcState.focusArc = curDepth + 1;
      render();
    }, 200);
    render();
  }

  function moveArcFocusBackward() {
    if (arcState.focusArc > 0) {
      arcState.focusArc--;
      hideDetail();
      trimLevels(arcState.focusArc);
      startAnim();
    }
  }

  function getMaxDepth() {
    return arcLevels.length - 1;
  }

  function getArcLevelAtXY(px, py) {
    var dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
    for (var d = getMaxDepth(); d >= 0; d--) {
      if (dist >= arcInnerR(d) && dist <= arcOuterR(d)) return d;
    }
    var bestLevel = 0, bestDist = Infinity;
    for (var d2 = 0; d2 <= getMaxDepth(); d2++) {
      var dd = Math.abs(dist - arcOuterR(d2));
      if (dd < bestDist) { bestDist = dd; bestLevel = d2; }
    }
    return bestLevel;
  }

  function setArcFocusAtPoint(px, py) {
    var targetArc = Math.min(getMaxDepth(), getArcLevelAtXY(px, py));
    if (targetArc !== arcState.focusArc) {
      arcState.focusArc = targetArc;
      updateFocusClasses();
    }
    return targetArc;
  }

  function onArcScroll(e) {
    if (currentLayout !== 'infographic') return;
    e.preventDefault();
    setArcFocusAtPoint(e.clientX, e.clientY);
    handleVerticalInput(e.deltaY > 0 ? 1 : -1);
  }
  container.addEventListener('wheel', onArcScroll, { passive: false });

  function updateFocusClasses() {
    svgEl.querySelectorAll('.arc-spoke-fill, .arc-spoke-text-wrap, .arc-spoke-arrow').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-depth'), 10);
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      if (isNaN(d) || isNaN(idx)) return;
      var lvl = arcLevels[d];
      var isSel = (arcState.focusArc === d && lvl && idx === lvl.selectedIdx);
      if (el.classList.contains('arc-spoke-text-wrap')) {
        var labelDiv = el.querySelector('.arc-spoke-label');
        if (labelDiv) labelDiv.classList.toggle('is-active', isSel);
      } else {
        el.classList.toggle('is-active', isSel);
      }
    });
  }

  function onArcMouseMove(e) {
    if (currentLayout !== 'infographic') return;
    setArcFocusAtPoint(e.clientX, e.clientY);
  }
  container.addEventListener('mousemove', onArcMouseMove);

  arcTouchStartHandler = function (e) {
    if (currentLayout !== 'infographic' || e.touches.length !== 1) return;
    var t = e.touches[0];
    arcTouch.active = true;
    arcTouch.moved = false;
    arcTouch.axis = '';
    arcTouch.startX = t.clientX;
    arcTouch.startY = t.clientY;
    arcTouch.focusArc = setArcFocusAtPoint(t.clientX, t.clientY);
  };

  arcTouchMoveHandler = function (e) {
    if (currentLayout !== 'infographic' || !arcTouch.active || e.touches.length !== 1) return;
    var t = e.touches[0];
    var dx = t.clientX - arcTouch.startX;
    var dy = t.clientY - arcTouch.startY;
    if (!arcTouch.axis) {
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      arcTouch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (arcTouch.axis === 'y' && Math.abs(dy) > 28) {
      arcState.focusArc = arcTouch.focusArc;
      handleVerticalInput(dy < 0 ? 1 : -1);
      arcTouch.startX = t.clientX;
      arcTouch.startY = t.clientY;
      arcTouch.moved = true;
      e.preventDefault();
    } else if (arcTouch.axis === 'x' && Math.abs(dx) > 44) {
      arcState.focusArc = arcTouch.focusArc;
      if (dx > 0) moveArcFocusForward();
      else moveArcFocusBackward();
      arcTouch.focusArc = arcState.focusArc;
      arcTouch.startX = t.clientX;
      arcTouch.startY = t.clientY;
      arcTouch.moved = true;
      e.preventDefault();
    }
  };

  arcTouchEndHandler = function () {
    arcTouch.active = false;
    arcTouch.moved = false;
    arcTouch.axis = '';
  };
  arcTouchCancelHandler = arcTouchEndHandler;

  container.addEventListener('touchstart', arcTouchStartHandler, { passive: false });
  container.addEventListener('touchmove', arcTouchMoveHandler, { passive: false });
  container.addEventListener('touchend', arcTouchEndHandler, { passive: false });
  container.addEventListener('touchcancel', arcTouchCancelHandler, { passive: false });

  function onArcKeydown(e) {
    if (currentLayout !== 'infographic') return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleVerticalInput(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveArcFocusForward();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveArcFocusBackward();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var depth = arcState.focusArc;
      var items = getItemsForLevel(depth);
      var lvl = arcLevels[depth];
      if (!items.length || !lvl) return;
      var item = items[lvl.selectedIdx];
      if (item.type === 'topic') moveArcFocusForward();
      else if (item.type === 'article' && item.data.url) navigateToArticle(item.data.url);
    } else if (e.key === 'Escape') {
      hideDetail();
    }
  }
  document.addEventListener('keydown', onArcKeydown);

  container.addEventListener('click', function (e) {
    if (e.target === container || e.target === svgEl) hideDetail();
  });

  var arcResizeHandler = function () {
    if (currentLayout !== 'infographic') return;
    W = window.innerWidth; H = window.innerHeight;
    cx = -W * 0.08;
    cy = H / 2;
    baseRadius = Math.max(420, W * 0.28);
    arcGap = Math.max(280, W * 0.18);
    glowFocusedDepth = -1;
    render();
  };
  window.addEventListener('resize', arcResizeHandler);

  container._arcCleanup = function () {
    container.removeEventListener('wheel', onArcScroll);
    container.removeEventListener('mousemove', onArcMouseMove);
    container.removeEventListener('touchstart', arcTouchStartHandler);
    container.removeEventListener('touchmove', arcTouchMoveHandler);
    container.removeEventListener('touchend', arcTouchEndHandler);
    container.removeEventListener('touchcancel', arcTouchCancelHandler);
    document.removeEventListener('keydown', onArcKeydown);
    window.removeEventListener('resize', arcResizeHandler);
    if (arcState.animFrame) cancelAnimationFrame(arcState.animFrame);
    stopPulse();
    arcLevels.forEach(function (lvl) { if (lvl.timer) clearTimeout(lvl.timer); });
  };

  shared.initRootAndFirstChild(arcLevels, getItemsForLevel, angleForLevel);
  render();
}

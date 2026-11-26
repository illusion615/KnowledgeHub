// ============================================================
// InfographicShared — SVG Rendering & State Helpers
// ============================================================

var InfographicMathRef = (typeof window !== 'undefined' && window.InfographicMath)
  ? window.InfographicMath
  : (typeof require === 'function' ? require('./infographic-math.js') : null);

var InfographicShared = (function (M) {
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
    return typeof document !== 'undefined' && !!document.documentElement &&
      document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function makeLevel() { return { angle: 0, targetAngle: 0, selectedIdx: 0, visible: true, timer: null, collapsing: false }; }
  function ensureLevel(arcLevels, depth) { while (arcLevels.length <= depth) arcLevels.push(makeLevel()); }

  function getSchemeDots(colorSchemes, currentScheme) {
    var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
    return (scheme && scheme.dots) ? scheme.dots : DEFAULT_DOTS;
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
    return M.buildArcSegmentD(cx, cy, r, -span / 2, span / 2);
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

  function renderArcProgressRail(opts) {
    var total = opts.total || 0;
    var progressR = opts.outerR + (opts.offsetR || 14);
    var spec = M.computeArcProgressSpec(opts.selectedIdx || 0, total, opts.viewport, opts.cx, opts.cy, progressR);
    if (!spec) return null;

    var g = svgCreate('g', {
      'class': 'arc-progress-group',
      'data-depth': opts.depth,
      opacity: String(opts.opacity !== undefined ? opts.opacity : 1)
    });
    g.appendChild(svgCreate('path', {
      d: M.buildArcSegmentD(opts.cx, opts.cy, progressR, spec.trackStart, spec.trackEnd),
      'class': 'arc-progress-track'
    }));
    g.appendChild(svgCreate('path', {
      d: M.buildArcSegmentD(opts.cx, opts.cy, progressR, spec.thumbStart, spec.thumbEnd),
      'class': 'arc-progress-thumb',
      stroke: opts.accentColor || '#ff7a00'
    }));

    var badgeAngle = spec.trackStart - 0.045;
    var bx = opts.cx + (progressR + 6) * Math.cos(badgeAngle);
    var by = opts.cy + (progressR + 6) * Math.sin(badgeAngle) - 14;
    if (opts.viewport) {
      var minTop = opts.viewport.topSafe !== undefined ? opts.viewport.topSafe : 76;
      bx = M.clampNum(bx, opts.viewport.x + 8, opts.viewport.x + opts.viewport.w - 86);
      by = M.clampNum(by, opts.viewport.y + minTop, opts.viewport.y + opts.viewport.h - 40);
    }
    var fo = svgCreate('foreignObject', {
      x: bx - 4, y: by - 12, width: 84, height: 26,
      'class': 'arc-progress-badge-fo'
    });
    var badge = document.createElement('div');
    badge.className = 'arc-progress-badge';
    badge.textContent = spec.label;
    fo.appendChild(badge);
    g.appendChild(fo);
    opts.svgEl.appendChild(g);
    return spec;
  }

  function buildSpokeLabelContent(div, item, lang, getChildren, boxW, boxH, dynamicMaxTags) {
    var itemData = item.data;
    if (item.type === 'article') {
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
        var maxTags = (dynamicMaxTags && boxW > 120) ? 3 : 2;
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
      return;
    }
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
    var visibleSpokes = M.cullVisibleSpokes({
      nodeAngles: nodeAngles, gap: level0Gap, cx: cx, cy: cy,
      innerR: innerR, outerR: outerR, viewport: opts.viewport
    });
    if (!visibleSpokes.length) return;

    var vIdx, sp, i;
    if (spokeStyle !== 'hidden') {
      var isDark = isDarkTheme();
      var defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = svgCreate('defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }
      var lineBoundaryMap = {};
      for (vIdx = 0; vIdx < visibleSpokes.length; vIdx++) {
        sp = visibleSpokes[vIdx];
        i = sp.idx;
        var a1 = sp.a1, a2 = sp.a2;
        var isSel = (i === selectedIdx);
        var nc = (nodeColors && nodeColors[i]) ? nodeColors[i] : '#888';
        var tint = M.computeSpokeTintColors(nc, isSel, i % 2, isDark, useHslLight);

        var gradId = gradPrefix + arcIdx + '-' + i;
        var rg = svgCreate('radialGradient', { id: gradId, gradientUnits: 'userSpaceOnUse', cx: cx, cy: cy, r: outerR });
        rg.appendChild(svgCreate('stop', { offset: '0%', 'stop-color': tint.inner }));
        rg.appendChild(svgCreate('stop', { offset: '100%', 'stop-color': tint.outer }));
        defs.appendChild(rg);

        var ox1 = cx + outerR * Math.cos(a1), oy1 = cy + outerR * Math.sin(a1);
        var ox2 = cx + outerR * Math.cos(a2), oy2 = cy + outerR * Math.sin(a2);
        var ix1b = cx + innerR * Math.cos(a1), iy1b = cy + innerR * Math.sin(a1);
        var ix2b = cx + innerR * Math.cos(a2), iy2b = cy + innerR * Math.sin(a2);
        var la2 = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
        var baseFillOp = spokeStyle === 'transparent' ? (isSel ? 0.35 : 0.15) : 1;
        var finalFillOp = baseFillOp * levelOpacity * sp.fade;
        svgEl.appendChild(svgCreate('path', {
          d: 'M ' + ix1b + ' ' + iy1b + ' L ' + ox1 + ' ' + oy1 +
             ' A ' + outerR + ' ' + outerR + ' 0 ' + la2 + ' 1 ' + ox2 + ' ' + oy2 +
             ' L ' + ix2b + ' ' + iy2b +
             ' A ' + innerR + ' ' + innerR + ' 0 ' + la2 + ' 0 ' + ix1b + ' ' + iy1b + ' Z',
          fill: 'url(#' + gradId + ')',
          'class': 'arc-spoke-fill' + (isSel ? ' is-active' : ''),
          'data-depth': arcIdx,
          'data-idx': i,
          'data-fade': sp.fade.toFixed(3),
          'fill-opacity': finalFillOp.toFixed(3)
        }));

        var k1 = a1.toFixed(4), k2 = a2.toFixed(4);
        lineBoundaryMap[k1] = Math.max(lineBoundaryMap[k1] || 0, sp.fade);
        lineBoundaryMap[k2] = Math.max(lineBoundaryMap[k2] || 0, sp.fade);
      }

      var spokeColor = isDark ? '#2a3040' : '#c0c4d0';
      var baseSpokeOpac = ((spokeStyle === 'transparent') ? 0.18 : 0.35) * levelOpacity;
      Object.keys(lineBoundaryMap).forEach(function (key) {
        var ba = parseFloat(key);
        var bFade = lineBoundaryMap[key] * M.computeAngularEdgeFade(ba, M.CULL_MAX_ANGLE, M.CULL_FADE_START);
        if (bFade <= 0.01) return;
        svgEl.appendChild(svgCreate('line', {
          x1: cx + innerR * Math.cos(ba), y1: cy + innerR * Math.sin(ba),
          x2: cx + outerR * Math.cos(ba), y2: cy + outerR * Math.sin(ba),
          'class': 'arc-spoke', stroke: spokeColor, opacity: (baseSpokeOpac * bFade).toFixed(3)
        }));
      });
    }

    if (!items) return;
    var radialLen = outerR - innerR;
    var pad = Math.max(8, radialLen * 0.08);
    var arrowSpace = 18;
    for (vIdx = 0; vIdx < visibleSpokes.length; vIdx++) {
      sp = visibleSpokes[vIdx];
      i = sp.idx;
      var centerAngle = sp.centerAngle;
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
      var rotDeg = centerAngle * 180 / Math.PI;
      var isSelText = (i === selectedIdx);
      var textBaseOp = isSelText ? 1 : Math.max(0.28, 1 - Math.abs(centerAngle) * 0.35);
      var finalTextOp = textBaseOp * levelOpacity * sp.fade;

      var fo = svgCreate('foreignObject', {
        x: tx - boxW / 2, y: ty - boxH / 2, width: boxW, height: boxH,
        transform: 'rotate(' + rotDeg + ' ' + tx + ' ' + ty + ')',
        'class': 'arc-spoke-text-wrap', 'data-depth': arcIdx, 'data-idx': i,
        opacity: finalTextOp.toFixed(3)
      });
      var div = document.createElement('div');
      div.className = 'arc-spoke-label' + (isSelText ? ' is-active' : '');
      div.style.width = boxW + 'px';
      div.style.height = boxH + 'px';
      div.style.fontSize = fontSize + 'px';

      buildSpokeLabelContent(div, items[i], lang, getChildren, boxW, boxH, opts.dynamicMaxTags);
      fo.appendChild(div);
      svgEl.appendChild(fo);

      if (hasArrow) {
        var arrowR = outerR - pad - 4;
        var ax = cx + arrowR * Math.cos(centerAngle), ay = cy + arrowR * Math.sin(centerAngle);
        svgEl.appendChild(svgCreate('path', {
          d: 'M -3 -4.5 L 3.5 0 L -3 4.5',
          transform: 'translate(' + ax + ',' + ay + ') rotate(' + rotDeg + ')',
          'class': 'arc-spoke-arrow' + (isSelText ? ' is-active' : ''),
          'data-depth': arcIdx, 'data-idx': i,
          opacity: (levelOpacity * sp.fade).toFixed(3)
        }));
      }
    }
  }

  function computeAnglesAndColors(items, depth, lvlAngle, gap, schemeDots, rootIdx) {
    var angles = [], colors = [];
    var lightTarget = isDarkTheme() ? '#b8c8d8' : '#f0f2f6';
    var rootColor = schemeDots[(rootIdx || 0) % schemeDots.length];
    items.forEach(function (item, j) {
      angles.push(M.getWheelAngle(j, items.length, lvlAngle, gap));
      if (depth === 0) {
        colors.push(schemeDots[j % schemeDots.length]);
      } else {
        var ratio = items.length > 1 ? j / (items.length - 1) : 0;
        colors.push(M.lerpColor(rootColor, lightTarget, 0.15 + ratio * 0.55));
      }
    });
    return { angles: angles, colors: colors };
  }

  function drawSelectedPathHighlight(svgEl, cx, cy, angle0, halfGap, hlInnerR, hlOuterR) {
    if (Math.abs(angle0) >= M.CULL_MAX_ANGLE) return;
    var isDarkHL = isDarkTheme();
    [angle0 - halfGap, angle0 + halfGap].forEach(function (ba) {
      var fade = M.computeAngularEdgeFade(ba, M.CULL_MAX_ANGLE, M.CULL_FADE_START);
      if (fade <= 0.01) return;
      svgEl.appendChild(svgCreate('line', {
        x1: cx + hlInnerR * Math.cos(ba), y1: cy + hlInnerR * Math.sin(ba),
        x2: cx + hlOuterR * Math.cos(ba), y2: cy + hlOuterR * Math.sin(ba),
        stroke: isDarkHL ? '#ffffff' : '#1a1a2e',
        'stroke-width': '2',
        opacity: ((isDarkHL ? 0.5 : 0.4) * fade).toFixed(3),
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
      var pulse = 0.92 + 0.08 * Math.sin(Date.now() / 1000 * 1.2);
      svgEl.querySelectorAll('.arc-spoke-fill.is-active').forEach(function (el) {
        var fadeAttr = parseFloat(el.getAttribute('data-fade'));
        var fade = isNaN(fadeAttr) ? 1 : fadeAttr;
        el.setAttribute('fill-opacity', (pulse * fade).toFixed(3));
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
    var ringColor = opts.schemeDots[opts.depth % opts.schemeDots.length];
    drawArcRingPath(opts.svgEl, opts.cx, opts.cy, opts.outerR, opts.depth, opts.isFocused, ringColor);
    var ac = computeAnglesAndColors(opts.items, opts.depth, opts.lvl.angle, opts.gap, opts.schemeDots, opts.rootIdx);
    renderSpokesOnSvg({
      svgEl: opts.svgEl, cx: opts.cx, cy: opts.cy,
      innerR: opts.innerR, outerR: opts.outerR,
      arcIdx: opts.depth, nodeAngles: ac.angles, nodeColors: ac.colors,
      selectedIdx: opts.lvl.selectedIdx, items: opts.items,
      level0Gap: opts.gap, angularSpace: opts.items.length > 1 ? opts.gap : 0.36,
      spokeStyle: opts.spokeStyle, lang: opts.lang, getChildren: opts.getChildren,
      levelOpacity: opts.levelOpacity, useHslLight: opts.useHslLight,
      dynamicMaxTags: opts.dynamicMaxTags, gradPrefix: opts.gradPrefix,
      viewport: opts.viewport
    });
    if (opts.items.length >= M.PROGRESS_MIN_ITEMS) {
      renderArcProgressRail({
        svgEl: opts.svgEl, cx: opts.cx, cy: opts.cy, outerR: opts.outerR,
        depth: opts.depth, selectedIdx: opts.lvl.selectedIdx,
        total: opts.items.length, accentColor: ringColor,
        viewport: opts.viewport, opacity: opts.isFocused ? 1 : 0.65
      });
    }
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
      return -M.getWheelAngle(idx, total, 0, getGapFn());
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
        svgEl: opts.svgEl, cx: opts.cx, cy: opts.cy,
        innerR: opts.arcInnerR(depth), outerR: opts.arcOuterR(depth),
        depth: depth, isFocused: opts.focusArc === depth,
        lvl: lvl, items: items, gap: opts.gap,
        schemeDots: schemeDots, rootIdx: rootIdx,
        spokeStyle: opts.ctx.spokeStyle, lang: opts.ctx.lang,
        getChildren: opts.ctx.getChildren,
        levelOpacity: opts.getLevelOpacity ? opts.getLevelOpacity(depth) : 1,
        useHslLight: opts.useHslLight, dynamicMaxTags: opts.dynamicMaxTags,
        gradPrefix: opts.gradPrefix, viewport: opts.viewport
      });

      if (groupEl) opts.svgEl.appendChild = origAppend;
      if (!lvl.visible) break;
    }

    if (rootItems.length > 0) {
      var angle0 = M.getWheelAngle(rootIdx, rootItems.length, arcLevels[0].angle, opts.gap);
      drawSelectedPathHighlight(opts.svgEl, opts.cx, opts.cy, angle0, opts.gap / 2, opts.arcInnerR(0), opts.arcOuterR(Math.min(arcLevels.length - 1, depth || 0)));
    }
  }

  return Object.assign({}, M, {
    svgCreate: svgCreate,
    isDarkTheme: isDarkTheme,
    makeLevel: makeLevel,
    ensureLevel: ensureLevel,
    getSchemeDots: getSchemeDots,
    renderArcProgressRail: renderArcProgressRail,
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
  });
})(InfographicMathRef);

if (typeof window !== 'undefined') window.InfographicShared = InfographicShared;
if (typeof module !== 'undefined' && module.exports) module.exports = InfographicShared;

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

/* eslint-disable no-unused-vars */
function renderInfographicViewModule(ctx) {
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
  // ═══════════════════════════════════════════════════════════
  // Arc Hierarchy Engine — unlimited depth, rule-based rendering
  // ═══════════════════════════════════════════════════════════
  // Each arc level displays children (topics + articles) of the
  // selected node at the previous level.  Level 0 shows root
  // topics.  Deeper levels are created/destroyed dynamically.
  // ═══════════════════════════════════════════════════════════

  var W = window.innerWidth, H = window.innerHeight;
  var cx = -W * 0.08;
  var cy = H / 2;
  var baseRadius = W * 0.28;
  var arcGap = W * 0.18;

  // ── Per-level state (dynamic array, grows/shrinks as user navigates) ──
  // Each entry: { angle, targetAngle, selectedIdx, visible, timer }
  function makeLevel() {
    return { angle: 0, targetAngle: 0, selectedIdx: 0, visible: true, timer: null, collapsing: false };
  }
  var arcLevels = [makeLevel()];     // level 0 always exists

  var arcState = {
    focusArc: 0,
    animFrame: null,
    isAnimating: false
  };
  var arcTouch = { active: false, moved: false, startX: 0, startY: 0, focusArc: 0, axis: '' };
  var arcTouchStartHandler = null;
  var arcTouchMoveHandler = null;
  var arcTouchEndHandler = null;
  var arcTouchCancelHandler = null;

  container.innerHTML = '';

  // SVG layer
  var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('class', 'arc-svg');
  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');
  container.appendChild(svgEl);

  // Detail card
  var detailEl = document.createElement('a');
  detailEl.className = 'arc-detail';
  container.appendChild(detailEl);
  var detailHoverLock = false;
  detailEl.addEventListener('mouseenter', function () { detailHoverLock = true; });
  detailEl.addEventListener('mouseleave', function () { detailHoverLock = false; hideDetail(); });

  // Scroll hint
  var hintEl = document.createElement('div');
  hintEl.className = 'arc-scroll-hint';
  hintEl.setAttribute('data-zh', '滚轮切换 · ←→ 层级 · Enter 进入 · Esc 关闭');
  hintEl.setAttribute('data-en', 'Scroll to browse · ←→ levels · Enter to open · Esc to close');
  hintEl.textContent = lang === 'zh' ? hintEl.getAttribute('data-zh') : hintEl.getAttribute('data-en');
  container.appendChild(hintEl);

  // ── Spoke interaction (event delegation on SVG) ──
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
  // ── Hover detection disabled (article info shown directly on spokes) ──
  function handleSpokeClick(d, idx) {
    var spokeItems = getItemsForLevel(d);
    if (idx >= spokeItems.length) return;
    var item = spokeItems[idx];
    if (item.type === 'article') {
      if (item.data.url) navigateToArticle(item.data.url);
    } else {
      arcLevels[d].selectedIdx = idx;
      arcLevels[d].targetAngle = angleForLevel(d, idx, spokeItems.length);
      // Immediately remove deeper levels
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
    }
  }

  var nodeEls = [];
  var defaultNodeGap = 0.32;
  var minArticleGap = 0.28; // articles need more height for rich content

  // ── Progressive level widths: level 0 thin, deeper levels wider ──
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

  // ── Geometry helpers ──

  // Compute level 0 gap once; all levels reuse the same angular spacing.
  var level0Gap = (function () {
    var items0 = planets; // root topics
    var total0 = items0.length;
    if (total0 <= 1) return defaultNodeGap;
    var r0 = arcOuterR(0);
    var margin0 = 80;
    var maxHalf0 = Math.asin(Math.min(0.95, (H / 2 - margin0) / r0));
    var visibleSpan0 = 2 * maxHalf0;
    var fitGap0 = (visibleSpan0 * 0.85) / (total0 - 1);
    return Math.max(0.08, Math.min(defaultNodeGap, fitGap0));
  })();

  function getNodeGap() {
    return level0Gap;
  }

  function getWheelAngle(idx, total, rotation, gap) {
    if (!gap) gap = defaultNodeGap;
    var offset = -(total - 1) / 2 * gap;
    return offset + idx * gap + rotation;
  }

  function getArcXY(arcIdx, angle) {
    var r = arcOuterR(arcIdx);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function findClosestTo3(total, rotation, gap) {
    var bestIdx = 0, bestDist = Infinity;
    for (var i = 0; i < total; i++) {
      var d = Math.abs(getWheelAngle(i, total, rotation, gap));
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return bestIdx;
  }

  function angleForLevel(depth, idx, total) {
    var levelItems = getItemsForLevel(depth);
    var hasArt = levelItems.some(function (it) { return it.type === 'article'; });
    return -getWheelAngle(idx, total, 0, getNodeGap(depth, total, hasArt));
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
    // Filter by search query
    if (searchQuery) {
      items = items.filter(function (item) {
        if (item.type === 'article') {
          return matchesSearch(item.data, searchQuery);
        }
        // Topic: keep if it or any descendant article matches
        return matchesSearch(item.data, searchQuery) ||
          getAllArticles(item.data.id).some(function (a) { return matchesSearch(a, searchQuery); });
      });
    }
    // Apply sort mode
    if (arcSortMode && arcSortMode !== 'default') {
      items = items.slice(); // clone to avoid mutating source
      items.sort(function (a, b) {
        var aLabel, bLabel, aDate, bDate;
        if (arcSortMode === 'title-asc' || arcSortMode === 'title-desc') {
          aLabel = a.data.label ? a.data.label[lang] : (a.data.title ? a.data.title[lang] : a.data.id);
          bLabel = b.data.label ? b.data.label[lang] : (b.data.title ? b.data.title[lang] : b.data.id);
          aLabel = aLabel || '';
          bLabel = bLabel || '';
          return arcSortMode === 'title-asc'
            ? aLabel.localeCompare(bLabel, lang === 'zh' ? 'zh-Hans' : 'en')
            : bLabel.localeCompare(aLabel, lang === 'zh' ? 'zh-Hans' : 'en');
        }
        if (arcSortMode === 'date-asc' || arcSortMode === 'date-desc') {
          aDate = a.data.date || '0000-00-00';
          bDate = b.data.date || '0000-00-00';
          return arcSortMode === 'date-asc'
            ? aDate.localeCompare(bDate)
            : bDate.localeCompare(aDate);
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
    var idx = Math.min(lvl.selectedIdx, items.length - 1);
    return items[idx].data;
  }

  function nodeLabel(n) {
    return n.label ? n.label[lang] : (n.title ? n.title[lang] : n.id);
  }

  function nodeColor(n) { return n.color || '#888'; }

  // Count all descendant articles under a node (cached per render)
  var descendantCache = {};
  function getDescendantCount(nodeId) {
    if (descendantCache[nodeId] !== undefined) return descendantCache[nodeId];
    var count = getAllArticles(nodeId).length;
    descendantCache[nodeId] = count;
    return count;
  }

  // ── Ensure arcLevels array has entry for depth ──
  function ensureLevel(depth) {
    while (arcLevels.length <= depth) arcLevels.push(makeLevel());
  }

  // ── Trim levels deeper than depth (collapse children with animation) ──
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
        // Remove collapsed levels
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

  // ── SVG drawing ──

  function drawArcRing(arcIdx) {
    var r = arcOuterR(arcIdx);
    var span = (arcIdx === 0) ? Math.PI * 0.85 : Math.PI * 0.7;
    var startA = -span / 2, endA = span / 2;
    var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    var x2 = cx + r * Math.cos(endA),   y2 = cy + r * Math.sin(endA);
    var la = span > Math.PI ? 1 : 0;
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2);
    var cls = 'arc-ring arc-ring-' + arcIdx;
    if (arcState.focusArc === arcIdx) cls += ' is-focused';
    path.setAttribute('class', cls);
    svgEl.appendChild(path);
  }

  function drawArcSpokes(arcIdx, nodeAngles, nodeColors, selectedIdx, items) {
    if (!nodeAngles || !nodeAngles.length) return;
    var r = arcOuterR(arcIdx);
    var innerR = arcInnerR(arcIdx);
    var outerR = r;

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

    // ── Draw wedge fills and spoke lines ──
    if (spokeStyle !== 'hidden') {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }
      function mixColor(hex, nodeHex, ratio) {
        var r1=parseInt(hex.slice(1,3),16),g1=parseInt(hex.slice(3,5),16),b1=parseInt(hex.slice(5,7),16);
        var r2=parseInt(nodeHex.slice(1,3),16),g2=parseInt(nodeHex.slice(3,5),16),b2=parseInt(nodeHex.slice(5,7),16);
        var rv=Math.round(r1*(1-ratio)+r2*ratio),gv=Math.round(g1*(1-ratio)+g2*ratio),bv=Math.round(b1*(1-ratio)+b2*ratio);
        return '#'+[rv,gv,bv].map(function(c){return Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0');}).join('');
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

        var gradId = 'spoke-grad-' + arcIdx + '-' + i;
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
        if (spokeStyle === 'transparent') {
          wedge.setAttribute('fill-opacity', isSel ? '0.35' : '0.15');
        }
        wedge.setAttribute('class', 'arc-spoke-fill' + (isSel ? ' is-active' : ''));
        wedge.setAttribute('data-depth', arcIdx);
        wedge.setAttribute('data-idx', i);
        svgEl.appendChild(wedge);
      }
      var spokeColor = isDark ? '#2a3040' : '#c0c4d0';
      var spokeOpac = (spokeStyle === 'transparent') ? '0.18' : '0.35';
      boundaries.forEach(function (ba) {
        var sx1=cx+innerR*Math.cos(ba),sy1=cy+innerR*Math.sin(ba);
        var sx2=cx+outerR*Math.cos(ba),sy2=cy+outerR*Math.sin(ba);
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1',sx1);line.setAttribute('y1',sy1);
        line.setAttribute('x2',sx2);line.setAttribute('y2',sy2);
        line.setAttribute('class','arc-spoke');
        line.setAttribute('stroke',spokeColor);line.setAttribute('opacity',spokeOpac);
        svgEl.appendChild(line);
      });
    }

    // ── Draw text labels and arrows on spokes ──
    if (items) {
      var radialLen = outerR - innerR;
      var pad = Math.max(8, radialLen * 0.08);
      var arrowSpace = 18;
      var hasArtSpoke = items.some(function (it) { return it.type === 'article'; });
      var angularSpace = items.length > 1 ? getNodeGap(arcIdx, items.length, hasArtSpoke) : 0.36;
      for (i = 0; i < items.length; i++) {
        var centerAngle = nodeAngles[i];
        var hasArrow = items[i].type === 'topic' && getChildren(items[i].data.id).length > 0;
        var textRadialLen = radialLen - pad * 2 - (hasArrow ? arrowSpace : 0);
        var midR = innerR + pad + textRadialLen / 2;
        var perpHalf = (innerR + radialLen / 2) * angularSpace / 2;
        var boxH = Math.max(18, perpHalf * 2 - 6);
        var boxW = Math.max(30, textRadialLen);
        var fontSize = 16; // base rem reference, children use rem units
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
        fo.setAttribute('opacity', isSelText ? 1 : textOpacity);
        var div = document.createElement('div');
        div.className = 'arc-spoke-label' + (isSelText ? ' is-active' : '');
        div.style.width = boxW + 'px';
        div.style.height = boxH + 'px';
        div.style.fontSize = fontSize + 'px';

        var itemData = items[i].data;
        if (items[i].type === 'article') {
          // Rich article layout: date + title + tags + summary
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
            var maxTags = boxW > 120 ? 3 : 2;
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
          // Topic: just title, centered
          div.classList.add('is-topic');
          div.textContent = nodeLabel(itemData);
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
          svgEl.appendChild(arrow);
        }
      }
    }
  }

  function createNodeEl(data) {
    var el = document.createElement('div');
    el.className = 'arc-node';
    if (data.count > 0) {
      var badge = document.createElement('span');
      badge.className = 'arc-node-count';
      badge.textContent = data.count;
      el.appendChild(badge);
    }
    var label = document.createElement('span');
    label.className = 'arc-label is-right';
    label.textContent = data.label;
    el.appendChild(label);
    el.style.background = data.bg;
    container.appendChild(el);
    return el;
  }

  // ── Detail card ──

  function showDetail(post, x, y) {
    var tags = (post.tags || []).map(function (t) {
      return '<span class="card-tag">' + t + '</span>';
    }).join('');
    detailEl.href = post.url || '#';
    detailEl.innerHTML =
      '<svg class="arc-detail-open" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M7 3H3v12h12v-4"/><path d="M11 3h4v4"/><path d="M15 3L8 10"/></svg>' +
      '<div class="arc-detail-date">' + (post.date || '') + '</div>' +
      '<h4>' + (post.title ? post.title[lang] : '') + '</h4>' +
      '<div class="card-tags">' + tags + '</div>' +
      '<p>' + (post.summary ? post.summary[lang] : '') + '</p>';
    // Measure actual height after content is set
    detailEl.style.left = '-9999px';
    detailEl.style.top = '0';
    detailEl.classList.add('is-visible');
    var dw = 340, dh = detailEl.offsetHeight || 200;
    detailEl.classList.remove('is-visible');
    var dx = x + 28, dy = y - dh / 3;
    if (dx + dw + 16 > W) dx = x - dw - 28;
    if (dx < 16) dx = 16;
    if (dy < 72) dy = 72;
    if (dy + dh + 16 > H) dy = H - dh - 16;
    if (dy < 72) dy = 72;
    detailEl.style.left = dx + 'px';
    detailEl.style.top = dy + 'px';
    void detailEl.offsetWidth;
    detailEl.classList.add('is-visible');
  }

  function hideDetail() {
    detailEl.classList.remove('is-visible');
  }

  function showDetailForLevel(depth, idx) {
    // Detail card disabled — article info shown on spokes
  }

  // ── Color helpers ──

  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function lerpColor(hex1, hex2, t) {
    var r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    var r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    var r = Math.round(r1 + (r2 - r1) * t);
    var g = Math.round(g1 + (g2 - g1) * t);
    var b = Math.round(b1 + (b2 - b1) * t);
    return '#' + [r, g, b].map(function (c) { return Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0'); }).join('');
  }

  // ── Render ──

  function render() {
    svgEl.innerHTML = '';
    nodeEls.forEach(function (el) { el.remove(); });
    nodeEls = [];
    descendantCache = {};
    hideDetail();

    for (var depth = 0; depth < arcLevels.length; depth++) {
      var lvl = arcLevels[depth];
      var items = getItemsForLevel(depth);
      if (!items.length) break;
      if (lvl.selectedIdx >= items.length) lvl.selectedIdx = items.length - 1;

      // Wrap collapsing levels in a group for fade-out
      var groupEl = null;
      if (lvl.collapsing) {
        groupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        groupEl.setAttribute('class', 'arc-collapse-group');
        groupEl.style.opacity = '0';
        groupEl.style.transition = 'opacity 0.35s ease-out';
        // Start at full opacity, then transition triggers
        groupEl.style.opacity = '1';
        svgEl.appendChild(groupEl);
        requestAnimationFrame(function (g) {
          return function () { g.style.opacity = '0'; };
        }(groupEl));
      }

      var targetSvg = groupEl || svgEl;
      var origAppend = svgEl.appendChild.bind(svgEl);
      if (groupEl) {
        svgEl.appendChild = groupEl.appendChild.bind(groupEl);
      }

      drawArcRing(depth);
      var hasArt = items.some(function (it) { return it.type === 'article'; });
      var gap = getNodeGap(depth, items.length, hasArt);
      var angles = [], colors = [];

      // ── Scheme-aware spoke colors ──
      var scheme = colorSchemes.find(function (s) { return s.id === currentScheme; }) || colorSchemes[0];
      var schemeDots = scheme.dots || ['#ff7a00', '#0d8f8c', '#e0b04b', '#e8eaef'];

      if (depth === 0) {
        // Root topics: cycle through scheme dots
        items.forEach(function (item, j) {
          angles.push(getWheelAngle(j, items.length, lvl.angle, gap));
          colors.push(schemeDots[j % schemeDots.length]);
        });
      } else {
        // Child level: derive gradient from the parent's scheme color
        var parentLvl = arcLevels[depth - 1];
        var parentItems = getItemsForLevel(depth - 1);
        var parentIdx = parentLvl ? Math.min(parentLvl.selectedIdx, parentItems.length - 1) : 0;
        // Walk up to find the root ancestor's scheme color
        var rootColor = schemeDots[0];
        var walkDepth = depth - 1;
        while (walkDepth > 0) {
          var wlvl = arcLevels[walkDepth - 1];
          var witems = getItemsForLevel(walkDepth - 1);
          if (wlvl && witems.length) {
            walkDepth--;
          } else break;
        }
        // Root ancestor index at depth 0
        var rootLvl = arcLevels[0];
        var rootItems = getItemsForLevel(0);
        var rootIdx = rootLvl ? Math.min(rootLvl.selectedIdx, rootItems.length - 1) : 0;
        rootColor = schemeDots[rootIdx % schemeDots.length];

        items.forEach(function (item, j) {
          angles.push(getWheelAngle(j, items.length, lvl.angle, gap));
          // Gradient: first child is deepest (closest to parent color), last is lightest
          var ratio = items.length > 1 ? j / (items.length - 1) : 0;
          // Lighten toward a bright neutral; wider range for better visibility
          var lightTarget = isDarkTheme() ? '#b8c8d8' : '#f0f2f6';
          var lightened = lerpColor(rootColor, lightTarget, 0.15 + ratio * 0.55);
          colors.push(lightened);
        });
      }
      var spokeSelIdx = (arcState.focusArc === depth) ? lvl.selectedIdx : -1;
      drawArcSpokes(depth, angles, colors, spokeSelIdx, items);

      if (groupEl) {
        svgEl.appendChild = origAppend;
      }

      if (!lvl.visible) break;
    }
  }

  // ── Animation engine (dynamic levels) ──

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

  // ── Bounce at edge ──

  function bounceEdgeNode(depth, idx, delta) {
    var lvl = arcLevels[depth];
    if (lvl) {
      var items = getItemsForLevel(depth);
      var nudge = delta * 0.06;
      lvl.targetAngle = angleForLevel(depth, idx, items.length) + nudge;
      startAnim();
      setTimeout(function () {
        lvl.targetAngle = angleForLevel(depth, idx, items.length);
        startAnim();
      }, 120);
    }
  }

  // ── Navigation (unified for all depths) ──

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
    lvl.selectedIdx = newIdx;
    lvl.targetAngle = angleForLevel(depth, newIdx, items.length);

    // Immediately remove deeper levels (no animation needed for scroll)
    for (var k = arcLevels.length - 1; k > depth; k--) {
      if (arcLevels[k].timer) clearTimeout(arcLevels[k].timer);
    }
    arcLevels.length = depth + 1;
    if (arcState.focusArc > depth) arcState.focusArc = depth;

    var item = items[newIdx];
    if (item.type === 'topic') {
      hideDetail();
      // Auto-expand children immediately
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
    } else {
      hideDetail();
    }
    startAnim();
  }

  function handleVerticalInput(delta) {
    spinLevel(arcState.focusArc, delta);
  }

  function moveArcFocusForward() {
    var nextDepth = arcState.focusArc + 1;
    var nextItems;
    var curDepth;
    var curItems;
    var curLvl;
    var curItem;
    var childItems;
    var initAngle;
    if (nextDepth < arcLevels.length && arcLevels[nextDepth].visible && !arcLevels[nextDepth].collapsing) {
      nextItems = getItemsForLevel(nextDepth);
      if (nextItems.length > 0) {
        arcState.focusArc = nextDepth;
        render();
      }
      return;
    }
    curDepth = arcState.focusArc;
    curItems = getItemsForLevel(curDepth);
    curLvl = arcLevels[curDepth];
    if (!curItems.length || !curLvl) return;
    curItem = curItems[curLvl.selectedIdx];
    if (!curItem || curItem.type !== 'topic') return;
    childItems = getItemsForLevel(curDepth + 1);
    if (!childItems.length) return;
    ensureLevel(curDepth + 1);
    initAngle = angleForLevel(curDepth + 1, 0, childItems.length);
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

  // ── Determine max navigable depth ──
  function getMaxDepth() {
    return arcLevels.length - 1;
  }

  function getArcLevelAtXY(px, py) {
    var dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
    // Match against actual spoke boundaries (innerR..outerR)
    for (var d = getMaxDepth(); d >= 0; d--) {
      var iR = arcInnerR(d);
      var oR = arcOuterR(d);
      if (dist >= iR && dist <= oR) return d;
    }
    // Fallback: nearest arc ring
    var bestLevel = 0, bestDist = Infinity;
    for (var d2 = 0; d2 <= getMaxDepth(); d2++) {
      var r2 = arcOuterR(d2);
      var dd = Math.abs(dist - r2);
      if (dd < bestDist) { bestDist = dd; bestLevel = d2; }
    }
    return bestLevel;
  }

  function setArcFocusAtPoint(px, py) {
    var targetArc = getArcLevelAtXY(px, py);
    if (targetArc > getMaxDepth()) targetArc = getMaxDepth();
    if (targetArc !== arcState.focusArc) {
      arcState.focusArc = targetArc;
      updateFocusClasses();
    }
    return targetArc;
  }

  // ── Event handlers ──

  function onArcScroll(e) {
    if (currentLayout !== 'infographic') return;
    e.preventDefault();
    var delta = e.deltaY > 0 ? 1 : -1;
    setArcFocusAtPoint(e.clientX, e.clientY);
    handleVerticalInput(delta);
  }
  container.addEventListener('wheel', onArcScroll, { passive: false });

  // ── Lightweight focus update (no DOM rebuild) ──
  function updateFocusClasses() {
    svgEl.querySelectorAll('.arc-spoke-fill').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-depth'), 10);
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      if (isNaN(d) || isNaN(idx)) return;
      var lvl = arcLevels[d];
      var isSel = (arcState.focusArc === d && lvl && idx === lvl.selectedIdx);
      el.classList.toggle('is-active', isSel);
    });
    svgEl.querySelectorAll('.arc-spoke-text-wrap').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-depth'), 10);
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      if (isNaN(d) || isNaN(idx)) return;
      var lvl = arcLevels[d];
      var isSel = (arcState.focusArc === d && lvl && idx === lvl.selectedIdx);
      var labelDiv = el.querySelector('.arc-spoke-label');
      if (labelDiv) labelDiv.classList.toggle('is-active', isSel);
    });
    svgEl.querySelectorAll('.arc-spoke-arrow').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-depth'), 10);
      var idx = parseInt(el.getAttribute('data-idx'), 10);
      if (isNaN(d) || isNaN(idx)) return;
      var lvl = arcLevels[d];
      var isSel = (arcState.focusArc === d && lvl && idx === lvl.selectedIdx);
      el.classList.toggle('is-active', isSel);
    });
  }

  function onArcMouseMove(e) {
    if (currentLayout !== 'infographic') return;
    setArcFocusAtPoint(e.clientX, e.clientY);
  }
  container.addEventListener('mousemove', onArcMouseMove);

  arcTouchStartHandler = function (e) {
    var touch;
    if (currentLayout !== 'infographic' || e.touches.length !== 1) return;
    touch = e.touches[0];
    arcTouch.active = true;
    arcTouch.moved = false;
    arcTouch.axis = '';
    arcTouch.startX = touch.clientX;
    arcTouch.startY = touch.clientY;
    arcTouch.focusArc = setArcFocusAtPoint(touch.clientX, touch.clientY);
  };

  arcTouchMoveHandler = function (e) {
    var touch;
    var dx;
    var dy;
    if (currentLayout !== 'infographic' || !arcTouch.active || e.touches.length !== 1) return;
    touch = e.touches[0];
    dx = touch.clientX - arcTouch.startX;
    dy = touch.clientY - arcTouch.startY;
    if (!arcTouch.axis) {
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      arcTouch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (arcTouch.axis === 'y' && Math.abs(dy) > 28) {
      arcState.focusArc = arcTouch.focusArc;
      handleVerticalInput(dy < 0 ? 1 : -1);
      arcTouch.startX = touch.clientX;
      arcTouch.startY = touch.clientY;
      arcTouch.moved = true;
      e.preventDefault();
    } else if (arcTouch.axis === 'x' && Math.abs(dx) > 44) {
      arcState.focusArc = arcTouch.focusArc;
      if (dx > 0) moveArcFocusForward();
      else moveArcFocusBackward();
      arcTouch.focusArc = arcState.focusArc;
      arcTouch.startX = touch.clientX;
      arcTouch.startY = touch.clientY;
      arcTouch.moved = true;
      e.preventDefault();
    }
  };

  arcTouchEndHandler = function () {
    arcTouch.active = false;
    arcTouch.moved = false;
    arcTouch.axis = '';
  };

  arcTouchCancelHandler = function () {
    arcTouch.active = false;
    arcTouch.moved = false;
    arcTouch.axis = '';
  };

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

      if (item.type === 'topic') {
        moveArcFocusForward();
      } else if (item.type === 'article' && item.data.url) {
        navigateToArticle(item.data.url);
      }

    } else if (e.key === 'Escape') {
      hideDetail();
    }
  }
  document.addEventListener('keydown', onArcKeydown);

  container.addEventListener('click', function (e) {
    if (e.target === container || e.target === svgEl) {
      hideDetail();
    }
  });

  // Resize handler
  var arcResizeHandler = function () {
    if (currentLayout !== 'infographic') return;
    W = window.innerWidth; H = window.innerHeight;
    cx = -W * 0.08;
    cy = H / 2;
    baseRadius = W * 0.28;
    arcGap = W * 0.18;
    render();
  };
  window.addEventListener('resize', arcResizeHandler);

  // Cleanup
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
    arcLevels.forEach(function (lvl) {
      if (lvl.timer) clearTimeout(lvl.timer);
    });
  };

  // ── Initial state: first topic at 3 o'clock (angle 0), selected, children expanded ──
  var initItems = getItemsForLevel(0);
  if (initItems.length > 0) {
    var initAngle0 = angleForLevel(0, 0, initItems.length);
    arcLevels[0].selectedIdx = 0;
    arcLevels[0].angle = initAngle0;
    arcLevels[0].targetAngle = initAngle0;
    // Auto-expand children of the first topic
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

  render();
}

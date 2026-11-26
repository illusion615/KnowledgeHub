// ============================================================
// Infographic View — Desktop Arc Hierarchy Engine
// ============================================================
// External dependencies passed via ctx object; relies on InfographicShared
// (loaded from assets/infographic-shared.js).
// ============================================================

var InfographicSharedRef = (typeof window !== 'undefined' && window.InfographicShared)
  ? window.InfographicShared
  : (typeof require === 'function' ? require('./infographic-shared.js') : null);

/* eslint-disable no-unused-vars */
function renderInfographicViewModule(ctx) {
  var shared = (typeof window !== 'undefined' && window.InfographicShared) ? window.InfographicShared : InfographicSharedRef;
  var planets = ctx.planets;
  var lang = ctx.lang;
  var navigateToArticle = ctx.navigateToArticle;
  var currentLayout = ctx.currentLayout;
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
    hoverArc: -1,
    animFrame: null,
    isAnimating: false,
    panX: 0,
    targetPanX: 0
  };
  var arcTouch = { active: false, moved: false, startX: 0, startY: 0, focusArc: 0, axis: '' };

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
  hintEl.setAttribute('data-zh', '滚轮切换 · Shift+滚轮/PgUp/PgDn 快翻 · ←→ 层级 · Enter 进入');
  hintEl.setAttribute('data-en', 'Scroll · Shift+Scroll/PgUp/PgDn fast jump · ←→ levels · Enter open');
  hintEl.textContent = lang === 'zh' ? hintEl.getAttribute('data-zh') : hintEl.getAttribute('data-en');
  container.appendChild(hintEl);

  shared.bindSpokeClickDelegation(svgEl, handleSpokeClick);

  function handleSpokeClick(d, idx) {
    var spokeItems = getItemsForLevel(d);
    if (idx >= spokeItems.length) return;
    arcState.focusArc = d;
    var item = spokeItems[idx];
    if (item.type === 'article') {
      arcLevels[d].selectedIdx = idx;
      arcLevels[d].targetAngle = angleForLevel(d, idx, spokeItems.length);
      startAnim();
      if (item.data.url) navigateToArticle(item.data.url);
    } else {
      var childItems = shared.selectLevelItemAndExpand(arcLevels, arcState, d, idx, spokeItems.length, getItemsForLevel, angleForLevel);
      if (childItems && childItems.length > 0) arcState.focusArc = d + 1;
      glowFocusedDepth = -1;
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
        arcLevels.length = depth + 1;
        glowFocusedDepth = -1;
        render();
      }, 350);
    } else {
      arcLevels.length = depth + 1;
      glowFocusedDepth = -1;
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
      viewport: { x: 0, y: 0, w: W, h: H, pad: 56 },
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
    if (!lvl) return;
    var items = getItemsForLevel(depth);
    var nudge = -(delta > 0 ? 1 : -1) * 0.06;
    lvl.targetAngle = angleForLevel(depth, idx, items.length) + nudge;
    startAnim();
    setTimeout(function () {
      lvl.targetAngle = angleForLevel(depth, idx, items.length);
      startAnim();
    }, 120);
  }

  function spinLevel(depth, direction, isFastJump) {
    var items = getItemsForLevel(depth);
    var lvl = arcLevels[depth];
    if (!items.length || !lvl) return;
    var stepRes = shared.computeSpinTargetIndex(lvl.selectedIdx, items.length, direction, isFastJump, shared.FAST_JUMP_STEP);
    if (stepRes.atBoundary) {
      bounceEdgeNode(depth, lvl.selectedIdx, direction);
      return;
    }
    hideDetail();
    shared.selectLevelItemAndExpand(arcLevels, arcState, depth, stepRes.nextIdx, items.length, getItemsForLevel, angleForLevel);
    glowFocusedDepth = -1;
    startAnim();
  }

  function handleVerticalInput(direction, isFastJump) {
    spinLevel(arcState.focusArc, direction, isFastJump);
  }

  function moveArcFocusForward() {
    var nextDepth = arcState.focusArc + 1;
    if (nextDepth < arcLevels.length && arcLevels[nextDepth].visible && !arcLevels[nextDepth].collapsing) {
      if (getItemsForLevel(nextDepth).length > 0) {
        arcState.focusArc = nextDepth;
        glowFocusedDepth = -1;
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
    shared.ensureLevel(arcLevels, curDepth + 1);
    var initAngle = angleForLevel(curDepth + 1, 0, childItems.length);
    arcLevels[curDepth + 1].selectedIdx = 0;
    arcLevels[curDepth + 1].angle = initAngle;
    arcLevels[curDepth + 1].targetAngle = initAngle;
    arcLevels[curDepth + 1].collapsing = false;
    arcLevels[curDepth + 1].visible = true;
    arcState.focusArc = curDepth + 1;
    glowFocusedDepth = -1;
    render();
  }

  function moveArcFocusBackward() {
    if (arcState.focusArc > 0) {
      arcState.focusArc--;
      glowFocusedDepth = -1;
      hideDetail();
      trimLevels(arcState.focusArc);
      startAnim();
    }
  }

  function getMaxDepth() {
    return arcLevels.length - 1;
  }

  function getArcLevelAtXY(px, py) {
    var dx = px - cx, dy = py - cy;
    var angle = Math.atan2(dy, dx);
    if (Math.abs(angle) > shared.CULL_MAX_ANGLE) return -1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    for (var d = getMaxDepth(); d >= 0; d--) {
      if (arcLevels[d] && arcLevels[d].visible && !arcLevels[d].collapsing &&
          dist >= arcInnerR(d) && dist <= arcOuterR(d)) {
        return d;
      }
    }
    return -1;
  }

  function setArcFocusAtPoint(px, py) {
    var hitArc = getArcLevelAtXY(px, py);
    if (hitArc < 0) return arcState.focusArc;
    var targetArc = Math.min(getMaxDepth(), hitArc);
    if (targetArc !== arcState.focusArc) {
      arcState.focusArc = targetArc;
      glowFocusedDepth = -1;
      render();
    }
    return targetArc;
  }

  function onArcScroll(e) {
    if (currentLayout !== 'infographic') return;
    e.preventDefault();
    setArcFocusAtPoint(e.clientX, e.clientY);
    handleVerticalInput(e.deltaY > 0 ? 1 : -1, !!e.shiftKey);
  }
  container.addEventListener('wheel', onArcScroll, { passive: false });

  function onArcMouseMove(e) {
    if (currentLayout !== 'infographic') return;
    arcState.hoverArc = getArcLevelAtXY(e.clientX, e.clientY);
  }
  container.addEventListener('mousemove', onArcMouseMove);

  var arcTouchStartHandler = function (e) {
    if (currentLayout !== 'infographic' || e.touches.length !== 1) return;
    var t = e.touches[0];
    arcTouch.active = true;
    arcTouch.moved = false;
    arcTouch.axis = '';
    arcTouch.startX = t.clientX;
    arcTouch.startY = t.clientY;
    arcTouch.focusArc = setArcFocusAtPoint(t.clientX, t.clientY);
  };

  var arcTouchMoveHandler = function (e) {
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
      handleVerticalInput(dy < 0 ? 1 : -1, false);
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

  var arcTouchEndHandler = function () {
    arcTouch.active = false;
    arcTouch.moved = false;
    arcTouch.axis = '';
  };

  container.addEventListener('touchstart', arcTouchStartHandler, { passive: false });
  container.addEventListener('touchmove', arcTouchMoveHandler, { passive: false });
  container.addEventListener('touchend', arcTouchEndHandler, { passive: false });
  container.addEventListener('touchcancel', arcTouchEndHandler, { passive: false });

  function onArcKeydown(e) {
    if (currentLayout !== 'infographic') return;
    var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleVerticalInput(e.key === 'ArrowDown' ? 1 : -1, !!e.shiftKey);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      handleVerticalInput(e.key === 'PageDown' ? 1 : -1, true);
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
    cxBase = -W * 0.08;
    cy = H / 2;
    baseRadius = Math.max(420, W * 0.28);
    arcGap = Math.max(280, W * 0.18);
    level0Gap = shared.computeLevel0Gap(planets.length, arcOuterR(0), H, defaultNodeGap);
    for (var d = 0; d < arcLevels.length; d++) {
      var lvlItems = getItemsForLevel(d);
      if (lvlItems.length) {
        var targetA = angleForLevel(d, arcLevels[d].selectedIdx, lvlItems.length);
        arcLevels[d].angle = targetA;
        arcLevels[d].targetAngle = targetA;
      }
    }
    arcState.targetPanX = computeTargetPanX();
    arcState.panX = arcState.targetPanX;
    cx = cxBase + arcState.panX;
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
    container.removeEventListener('touchcancel', arcTouchEndHandler);
    document.removeEventListener('keydown', onArcKeydown);
    window.removeEventListener('resize', arcResizeHandler);
    if (arcState.animFrame) cancelAnimationFrame(arcState.animFrame);
    stopPulse();
    arcLevels.forEach(function (lvl) { if (lvl.timer) clearTimeout(lvl.timer); });
  };

  shared.initRootAndFirstChild(arcLevels, getItemsForLevel, angleForLevel);
  if (arcLevels.length > 1 && arcLevels[1].visible) {
    arcState.focusArc = 1;
  }
  arcState.targetPanX = computeTargetPanX();
  arcState.panX = arcState.targetPanX;
  cx = cxBase + arcState.panX;
  render();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    InfographicShared: InfographicSharedRef,
    renderInfographicViewModule: renderInfographicViewModule
  };
}

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
  var shared = window.InfographicShared;
  var VW = 1400;
  var VH = 900;
  var cx = -VW * 0.08;
  var cy = VH / 2;
  var baseRadius = VW * 0.28;
  var arcGap = VW * 0.18;

  var screenW = window.innerWidth;
  var screenH = window.innerHeight;

  var vpX = 0, vpY = 0, viewW = 100, viewH = 100;
  var arcLevels = [shared.makeLevel()];
  var arcState = { focusArc: 0, animFrame: null, isAnimating: false };
  var defaultNodeGap = 0.32;
  var container = ctx.container;

  if (container._arcMobileCleanup) {
    container._arcMobileCleanup();
  }
  container.innerHTML = '';

  var svgEl = shared.svgCreate('svg', { 'class': 'arc-svg arc-svg-mobile' });
  svgEl.style.width = '100%';
  svgEl.style.height = '100%';
  svgEl.style.touchAction = 'none';
  container.appendChild(svgEl);

  var glowSvg = shared.svgCreate('svg', { 'class': 'arc-svg arc-svg-mobile' });
  glowSvg.style.width = '100%';
  glowSvg.style.height = '100%';
  glowSvg.style.pointerEvents = 'none';
  glowSvg.style.touchAction = 'none';
  container.appendChild(glowSvg);
  var glowFocusedDepth = -1;

  var breadcrumbBar = document.createElement('div');
  breadcrumbBar.className = 'arc-mobile-breadcrumb';
  container.appendChild(breadcrumbBar);

  var hintEl = document.createElement('div');
  hintEl.className = 'arc-scroll-hint';
  hintEl.textContent = ctx.lang === 'zh' ? '上下滑动旋转 · 左右切换层级' : 'Swipe ↕ rotate · Swipe ↔ levels';
  container.appendChild(hintEl);
  setTimeout(function () { hintEl.style.opacity = '0'; }, 3000);

  var detailEl = document.createElement('a');
  detailEl.className = 'arc-detail arc-detail-mobile';
  container.appendChild(detailEl);

  function updateViewBoxes() {
    var vb = vpX + ' ' + vpY + ' ' + viewW + ' ' + viewH;
    svgEl.setAttribute('viewBox', vb);
    glowSvg.setAttribute('viewBox', vb);
  }

  var geom = shared.createArcGeometry(function () { return baseRadius; }, function () { return arcGap; }, 250, 1.30, 0.80);
  var arcLevelWidth = geom.levelWidth;
  var arcOuterR = geom.outerR;
  var arcInnerR = geom.innerR;

  var level0Gap = shared.computeLevel0Gap(ctx.planets.length, arcOuterR(0), VH, defaultNodeGap);
  var tree = shared.createTreeAccessor(ctx, arcLevels, function () { return level0Gap; });
  var getSelectedNodeAtDepth = tree.getSelectedNodeAtDepth;
  var getItemsForLevel = tree.getItemsForLevel;
  var angleForLevel = tree.angleForLevel;

  function computeViewport(focusDepth) {
    var innerR = arcInnerR(focusDepth);
    var outerR = arcOuterR(focusDepth);
    var bandWidth = outerR - innerR;
    var peekRatio = 0.35;
    var peekLeft = focusDepth > 0 ? arcLevelWidth(focusDepth - 1) * peekRatio : bandWidth * 0.15;
    var peekRight = bandWidth * peekRatio;
    var vw = peekLeft + bandWidth + peekRight;
    var vh = vw * (screenH / screenW);
    var midR = (innerR + outerR) / 2;
    return {
      vpX: (cx + midR) - peekLeft - bandWidth / 2,
      vpY: cy - vh / 2,
      viewW: vw,
      viewH: vh
    };
  }

  var vpAnimFrame = null;
  var vpTarget = { vpX: 0, vpY: 0, viewW: 100, viewH: 100 };
  var vpAnimating = false;

  function animateViewportTo(target) {
    vpTarget = target;
    if (vpAnimating) return;
    vpAnimating = true;
    function step() {
      var dx = vpTarget.vpX - vpX, dy = vpTarget.vpY - vpY;
      var dw = vpTarget.viewW - viewW, dh = vpTarget.viewH - viewH;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(dw) < 1 && Math.abs(dh) < 1) {
        vpX = vpTarget.vpX; vpY = vpTarget.vpY;
        viewW = vpTarget.viewW; viewH = vpTarget.viewH;
        updateViewBoxes();
        vpAnimating = false;
        vpAnimFrame = null;
        return;
      }
      vpX += dx * 0.15; vpY += dy * 0.15;
      viewW += dw * 0.15; viewH += dh * 0.15;
      updateViewBoxes();
      vpAnimFrame = requestAnimationFrame(step);
    }
    vpAnimFrame = requestAnimationFrame(step);
  }

  function snapViewportToLevel(focusDepth, animate) {
    var vp = computeViewport(focusDepth);
    if (animate) {
      animateViewportTo(vp);
    } else {
      vpX = vp.vpX; vpY = vp.vpY;
      viewW = vp.viewW; viewH = vp.viewH;
      updateViewBoxes();
    }
  }

  function updateGlow() {
    var depth = arcState.focusArc;
    if (depth === glowFocusedDepth) return;
    glowFocusedDepth = depth;
    var dots = shared.getSchemeDots(ctx.colorSchemes, ctx.currentScheme);
    shared.renderGlowOverlay(glowSvg, cx, cy, arcOuterR(depth), dots[depth % dots.length], 'arc-glow-sweep-mobile');
  }

  function render() {
    svgEl.innerHTML = '';
    shared.renderAllLevelsAndHighlight({
      svgEl: svgEl, cx: cx, cy: cy,
      arcInnerR: arcInnerR, arcOuterR: arcOuterR,
      arcLevels: arcLevels, getItemsForLevel: getItemsForLevel,
      focusArc: arcState.focusArc, gap: level0Gap, ctx: ctx,
      gradPrefix: 'spoke-grad-m-',
      getLevelOpacity: function (depth) { return depth === arcState.focusArc ? 1 : 0.45; }
    });

    updateGlow();
    var parts = [];
    for (var d = 0; d <= arcState.focusArc; d++) {
      var node = getSelectedNodeAtDepth(d);
      if (node) parts.push(shared.nodeLabel(node, ctx.lang));
    }
    breadcrumbBar.textContent = parts.join(' › ');
  }

  var startAnim = shared.createAnimController(arcLevels, arcState, render);

  function spinLevel(depth, delta) {
    var items = getItemsForLevel(depth);
    var lvl = arcLevels[depth];
    if (!items.length || !lvl) return;
    var newIdx = lvl.selectedIdx + delta;
    if (newIdx < 0 || newIdx >= items.length) return;
    shared.selectLevelItemAndExpand(arcLevels, arcState, depth, newIdx, items.length, getItemsForLevel, angleForLevel);
    startAnim();
  }

  function focusOnLevel(depth, animate) {
    if (depth < 0 || depth >= arcLevels.length) return;
    if (!getItemsForLevel(depth).length) return;
    arcState.focusArc = depth;
    glowFocusedDepth = -1;
    snapViewportToLevel(depth, animate !== false);
    if (!arcState.isAnimating) render();
  }

  function handleSpokeClick(d, idx) {
    var items = getItemsForLevel(d);
    if (idx >= items.length) return;
    var item = items[idx];
    if (item.type === 'article') {
      if (item.data.url) ctx.navigateToArticle(item.data.url);
    } else {
      var childItems = shared.selectLevelItemAndExpand(arcLevels, arcState, d, idx, items.length, getItemsForLevel, angleForLevel);
      startAnim();
      focusOnLevel((childItems && childItems.length > 0) ? d + 1 : d, true);
    }
  }

  var touch = {
    active: false, startX: 0, startY: 0, moved: false,
    lastT: 0, velY: 0, lastY: 0, lastX: 0,
    direction: null, accumulatedSpin: 0
  };
  var DIRECTION_THRESHOLD = 12;
  var SPIN_PX_PER_STEP = 60;

  function applyVerticalSteps(stepDelta) {
    if (!stepDelta) return;
    var depth = arcState.focusArc;
    var items = getItemsForLevel(depth);
    var lvl = arcLevels[depth];
    if (lvl && items.length) {
      var newIdx = Math.max(0, Math.min(items.length - 1, lvl.selectedIdx - stepDelta));
      if (newIdx !== lvl.selectedIdx) {
        spinLevel(depth, newIdx - lvl.selectedIdx);
      }
    }
  }

  function onTouchStart(e) {
    if (ctx.currentLayout !== 'infographic' || e.touches.length !== 1) return;
    var t = e.touches[0];
    touch.active = true;
    touch.moved = false;
    touch.direction = null;
    touch.startX = touch.lastX = t.clientX;
    touch.startY = touch.lastY = t.clientY;
    touch.lastT = Date.now();
    touch.velY = 0;
    touch.accumulatedSpin = 0;
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

    if (!touch.direction) {
      if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return;
      touch.direction = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      touch.moved = true;
    }

    var now = Date.now();
    touch.velY = (t.clientY - touch.lastY) / Math.max(1, now - touch.lastT);
    touch.lastX = t.clientX;
    touch.lastY = t.clientY;
    touch.lastT = now;

    if (touch.direction === 'v') {
      var steps = Math.round(dy / SPIN_PX_PER_STEP);
      var stepsNeeded = steps - touch.accumulatedSpin;
      if (stepsNeeded !== 0) {
        applyVerticalSteps(stepsNeeded);
        touch.accumulatedSpin = steps;
      }
    }
  }

  function onTouchEnd() {
    if (!touch.active) return;
    touch.active = false;

    if (!touch.moved || !touch.direction) {
      var pt = svgEl.createSVGPoint();
      pt.x = touch.startX;
      pt.y = touch.startY;
      var svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse());
      handleTapAt(svgPt.x, svgPt.y);
      return;
    }

    if (touch.direction === 'h') {
      var swipeDx = touch.lastX - touch.startX;
      if (Math.abs(swipeDx) > 40) {
        if (swipeDx < 0) {
          var nextDepth = arcState.focusArc + 1;
          if (nextDepth < arcLevels.length && getItemsForLevel(nextDepth).length > 0) {
            focusOnLevel(nextDepth, true);
          }
        } else if (arcState.focusArc > 0) {
          focusOnLevel(arcState.focusArc - 1, true);
        }
      }
    } else if (touch.direction === 'v' && Math.abs(touch.velY) > 0.3) {
      var inertiaAccum = 0;
      var inertiaVel = touch.velY;
      function inertiaStep() {
        inertiaAccum += inertiaVel * 16;
        var steps = Math.round(inertiaAccum / SPIN_PX_PER_STEP);
        if (steps !== 0) {
          applyVerticalSteps(steps);
          inertiaAccum -= steps * SPIN_PX_PER_STEP;
        }
        inertiaVel *= 0.92;
        if (Math.abs(inertiaVel) >= 0.05) requestAnimationFrame(inertiaStep);
      }
      requestAnimationFrame(inertiaStep);
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
    if (tappedDepth !== arcState.focusArc) {
      focusOnLevel(tappedDepth, true);
      return;
    }
    var items = getItemsForLevel(tappedDepth);
    if (!items.length) return;
    var lvl = arcLevels[tappedDepth];
    var bestIdx = 0, bestDist = Infinity;
    for (var i = 0; i < items.length; i++) {
      var ad = Math.abs(angle - shared.getWheelAngle(i, items.length, lvl.angle, level0Gap));
      if (ad < bestDist) { bestDist = ad; bestIdx = i; }
    }
    handleSpokeClick(tappedDepth, bestIdx);
  }

  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: false });
  container.addEventListener('touchcancel', function () { touch.active = false; }, { passive: false });
  shared.bindSpokeClickDelegation(svgEl, handleSpokeClick);

  var resizeHandler = function () {
    if (ctx.currentLayout !== 'infographic') return;
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    snapViewportToLevel(arcState.focusArc, false);
    glowFocusedDepth = -1;
    render();
  };
  window.addEventListener('resize', resizeHandler);

  var stopPulse = shared.startPulseLoop(svgEl);

  container._arcMobileCleanup = function () {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchmove', onTouchMove);
    container.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', resizeHandler);
    if (arcState.animFrame) cancelAnimationFrame(arcState.animFrame);
    if (vpAnimFrame) cancelAnimationFrame(vpAnimFrame);
    stopPulse();
    arcLevels.forEach(function (lvl) { if (lvl.timer) clearTimeout(lvl.timer); });
  };

  shared.initRootAndFirstChild(arcLevels, getItemsForLevel, angleForLevel);
  arcState.focusArc = 0;
  snapViewportToLevel(0, false);
  render();
}

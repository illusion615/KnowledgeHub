// ============================================================
// PanZoomController — reusable pan/zoom/pinch for canvas views
// ============================================================
// Usage:
//   var pz = PanZoomController(container, camera, {
//     scaleMin: 0.3, scaleMax: 3,
//     shouldBlockPan: function(target) { ... },
//     shouldBlockPinch: function(target) { ... },
//     onUpdate: function() { ... },        // called after any camera change
//     layoutGuard: function() { return true; } // skip if returns false
//   });
//   pz.destroy();
//
// camera must be { x, y, scale }
// ============================================================

/* global clampNumber, getTouchCenter, getTouchDistance, zoomCameraAt, anchorCameraToTouch */

function PanZoomController(container, camera, opts) {
  var scaleMin = (opts && opts.scaleMin) || 0.3;
  var scaleMax = (opts && opts.scaleMax) || 3;
  var shouldBlockPan = (opts && opts.shouldBlockPan) || function () { return false; };
  var shouldBlockPinch = (opts && opts.shouldBlockPinch) || function () { return false; };
  var onUpdate = (opts && opts.onUpdate) || function () {};
  var layoutGuard = (opts && opts.layoutGuard) || function () { return true; };

  var drag = { active: false, moved: false, startX: 0, startY: 0, camX: 0, camY: 0 };
  var touch = { mode: '', moved: false, startX: 0, startY: 0, camX: 0, camY: 0,
                startScale: 1, startDistance: 0, worldX: 0, worldY: 0 };
  var suppressClick = false;
  var suppressTimer = null;

  function scheduleSuppression() {
    if (suppressTimer) clearTimeout(suppressTimer);
    suppressClick = true;
    suppressTimer = setTimeout(function () {
      suppressClick = false;
      suppressTimer = null;
    }, 280);
  }

  function beginPinch(touches) {
    var center = getTouchCenter(touches);
    touch.mode = 'pinch';
    touch.moved = true;
    touch.startScale = camera.scale;
    touch.startDistance = Math.max(1, getTouchDistance(touches));
    touch.worldX = (center.x - camera.x) / camera.scale;
    touch.worldY = (center.y - camera.y) / camera.scale;
    scheduleSuppression();
  }

  function resetTouch() {
    touch.mode = '';
    touch.moved = false;
  }

  // ── Wheel ──
  function onWheel(e) {
    if (!layoutGuard()) return;
    if (shouldBlockPinch(e.target)) return;
    e.preventDefault();
    var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomCameraAt(camera, e.clientX, e.clientY, camera.scale * f, scaleMin, scaleMax);
    onUpdate();
  }

  // ── Mouse ──
  function onMouseDown(e) {
    if (e.button !== 0) return;
    if (shouldBlockPan(e.target)) return;
    drag.active = true; drag.moved = false;
    drag.startX = e.clientX; drag.startY = e.clientY;
    drag.camX = camera.x; drag.camY = camera.y;
  }

  function onMouseMove(e) {
    if (!drag.active) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    camera.x = drag.camX + dx;
    camera.y = drag.camY + dy;
    onUpdate();
  }

  function onMouseUp() {
    drag.active = false;
  }

  // ── Touch ──
  function onTouchStart(e) {
    if (!layoutGuard()) return;
    if (e.touches.length === 2) {
      if (shouldBlockPinch(e.target)) return;
      beginPinch(e.touches);
      e.preventDefault();
      return;
    }
    if (e.touches.length !== 1 || shouldBlockPan(e.target)) return;
    var t = e.touches[0];
    touch.mode = 'pan';
    touch.moved = false;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.camX = camera.x;
    touch.camY = camera.y;
  }

  function onTouchMove(e) {
    if (!layoutGuard()) return;
    if (e.touches.length === 2) {
      if (shouldBlockPinch(e.target)) return;
      if (touch.mode !== 'pinch') beginPinch(e.touches);
      var center = getTouchCenter(e.touches);
      var distance = Math.max(1, getTouchDistance(e.touches));
      var nextScale = touch.startScale * (distance / touch.startDistance);
      anchorCameraToTouch(camera, center.x, center.y, touch.worldX, touch.worldY, nextScale, scaleMin, scaleMax);
      onUpdate();
      e.preventDefault();
      return;
    }
    if (e.touches.length !== 1 || touch.mode !== 'pan') return;
    var t = e.touches[0];
    var dx = t.clientX - touch.startX;
    var dy = t.clientY - touch.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      touch.moved = true;
      scheduleSuppression();
    }
    camera.x = touch.camX + dx;
    camera.y = touch.camY + dy;
    onUpdate();
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (!layoutGuard()) return;
    if (touch.mode === 'pinch' && e.touches.length === 1) {
      var t = e.touches[0];
      touch.mode = 'pan';
      touch.moved = true;
      touch.startX = t.clientX;
      touch.startY = t.clientY;
      touch.camX = camera.x;
      touch.camY = camera.y;
      scheduleSuppression();
      return;
    }
    if (e.touches.length === 0) resetTouch();
  }

  function onTouchCancel() {
    resetTouch();
  }

  // ── Bind ──
  container.addEventListener('wheel', onWheel, { passive: false });
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: false });
  container.addEventListener('touchcancel', onTouchCancel, { passive: false });

  return {
    drag: drag,
    isClickSuppressed: function () { return suppressClick; },
    wasDragged: function () { return drag.moved || touch.moved; },
    destroy: function () {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
      if (suppressTimer) clearTimeout(suppressTimer);
    }
  };
}

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const InfographicMath = require('../assets/infographic-math.js');
const InfographicShared = require('../assets/infographic-shared.js');

test('angular viewport culling drops multi-revolution ghost nodes and cuts 57-item DOM by >80%', () => {
  const total = 57;
  const gap = 0.32;
  const selectedIdx = 28;
  const lvlAngle = -InfographicMath.getWheelAngle(selectedIdx, total, 0, gap);
  const nodeAngles = [];
  for (let i = 0; i < total; i++) {
    nodeAngles.push(InfographicMath.getWheelAngle(i, total, lvlAngle, gap));
  }

  // Raw unclamped angles span ~18 radians (~2.85 full turns), which previously caused multi-turn overlap
  const rawSpan = nodeAngles[total - 1] - nodeAngles[0];
  assert.ok(rawSpan > Math.PI * 5, '57 items at 0.32 rad exceed 2.5 full revolutions without culling');

  const culled = InfographicMath.cullVisibleSpokes({
    nodeAngles,
    gap,
    cx: -500,
    cy: 450,
    innerR: 750,
    outerR: 1120,
    viewport: { x: 0, y: 0, w: 1440, h: 900, pad: 56 }
  });

  // Must strictly retain <= 10 visible spokes (>80% DOM reduction from 57)
  assert.ok(culled.length > 0 && culled.length <= 10, `expected <=10 visible spokes, got ${culled.length}`);
  assert.ok(1 - culled.length / total >= 0.80, 'DOM reduction must be >= 80%');

  // Selected item is centered at angle 0 with full opacity 1
  const selectedEntry = culled.find((sp) => sp.idx === selectedIdx);
  assert.ok(selectedEntry, 'selected item must be rendered');
  assert.ok(Math.abs(selectedEntry.centerAngle) < 1e-6);
  assert.equal(selectedEntry.fade, 1);

  // Every rendered spoke lies strictly within [-0.45π, +0.45π] and has unique non-wrapping phase
  for (const sp of culled) {
    assert.ok(Math.abs(sp.centerAngle) < InfographicMath.CULL_MAX_ANGLE);
    assert.ok(sp.a1 >= -InfographicMath.CULL_MAX_ANGLE - 1e-6);
    assert.ok(sp.a2 <= InfographicMath.CULL_MAX_ANGLE + 1e-6);
    assert.ok(sp.fade > 0 && sp.fade <= 1);
  }
});

test('edge attenuation smoothly fades to 0 at sector boundary [-0.45π, +0.45π]', () => {
  assert.equal(InfographicMath.computeAngularEdgeFade(0), 1);
  assert.equal(InfographicMath.computeAngularEdgeFade(Math.PI * 0.25), 1);
  assert.equal(InfographicMath.computeAngularEdgeFade(-Math.PI * 0.30), 1);

  const midEdge = InfographicMath.computeAngularEdgeFade(Math.PI * 0.375);
  assert.ok(midEdge > 0.45 && midEdge < 0.55, `smoothstep midpoint should be ~0.5, got ${midEdge}`);

  assert.equal(InfographicMath.computeAngularEdgeFade(Math.PI * 0.45), 0);
  assert.equal(InfographicMath.computeAngularEdgeFade(-Math.PI * 0.45), 0);
  assert.equal(InfographicMath.computeAngularEdgeFade(Math.PI * 0.85), 0);
});

test('mobile/sector hit-test uniquely matches visible spoke and rejects wrapped 2πk siblings & back-hemisphere taps', () => {
  const total = 57;
  const gap = 0.32;
  // Center item 8 at angle 0. Item 8 + 20 = 28 sits at +6.40 rad (~ +0.117 rad modulo 2π!)
  const selectedIdx = 8;
  const lvlAngle = -InfographicMath.getWheelAngle(selectedIdx, total, 0, gap);

  // Tapping near +0.10 rad must hit item 8 (at 0 rad), NEVER item 28 (at +6.40 rad wrapped near +0.117 rad)
  const hitNearCenter = InfographicMath.findTappedSpokeIndex(0.10, total, lvlAngle, gap);
  assert.equal(hitNearCenter, 8);

  // Tapping near item 10 (+0.64 rad) hits item 10 uniquely
  const hitUpper = InfographicMath.findTappedSpokeIndex(0.62, total, lvlAngle, gap);
  assert.equal(hitUpper, 10);

  // Taps outside visible sector (e.g. left hemisphere π or ±0.6π) must return -1
  assert.equal(InfographicMath.findTappedSpokeIndex(Math.PI * 0.75, total, lvlAngle, gap), -1);
  assert.equal(InfographicMath.findTappedSpokeIndex(-Math.PI * 0.60, total, lvlAngle, gap), -1);
  assert.equal(InfographicMath.findTappedSpokeIndex(0, 0, 0, gap), -1);
});

test('fast-jump pagination (Shift+Wheel / PageUp / PageDown) steps by ±5 and clamps cleanly at boundaries', () => {
  const total = 57;

  // Normal 1-step scroll
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(8, total, 1, false),
    { nextIdx: 9, clamped: false, atBoundary: false }
  );

  // Normal scroll past 0 triggers boundary bounce without changing index
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(0, total, -1, false),
    { nextIdx: 0, clamped: true, atBoundary: true }
  );

  // Fast jump +5 from index 8 -> 13 ("14 / 57")
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(8, total, 1, true),
    { nextIdx: 13, clamped: false, atBoundary: false }
  );

  // Fast jump +5 near end (54 -> clamps to 56, not out of bounds)
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(54, total, 1, true),
    { nextIdx: 56, clamped: true, atBoundary: false }
  );

  // Fast jump +5 when already at 56 reports atBoundary: true
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(56, total, 1, true),
    { nextIdx: 56, clamped: true, atBoundary: true }
  );

  // Fast jump -5 near start (2 -> clamps to 0)
  assert.deepEqual(
    InfographicMath.computeSpinTargetIndex(2, total, -1, true),
    { nextIdx: 0, clamped: true, atBoundary: false }
  );
});

test('curved progress rail activates only when ring > 12 items and formats 1-based counter badge', () => {
  const vp = { x: 0, y: 0, w: 1440, h: 900 };
  // <= 12 items: no progress rail clutter
  assert.equal(InfographicMath.computeArcProgressSpec(0, 12, vp, -400, 450, 1100), null);
  assert.equal(InfographicMath.computeArcProgressSpec(0, 5, vp, -400, 450, 1100), null);

  // 57 items (Copilot Studio): formats "9 / 57" at index 8 and advances monotonically
  const startSpec = InfographicMath.computeArcProgressSpec(0, 57, vp, -400, 450, 1100);
  const midSpec = InfographicMath.computeArcProgressSpec(8, 57, vp, -400, 450, 1100);
  const endSpec = InfographicMath.computeArcProgressSpec(56, 57, vp, -400, 450, 1100);

  assert.ok(startSpec && midSpec && endSpec);
  assert.equal(startSpec.label, '1 / 57');
  assert.equal(midSpec.label, '9 / 57');
  assert.equal(endSpec.label, '57 / 57');
  assert.ok(Math.abs(startSpec.thumbStart - startSpec.trackStart) < 1e-6);
  assert.ok(midSpec.thumbStart > startSpec.thumbStart);
  assert.ok(Math.abs(endSpec.thumbEnd - endSpec.trackEnd) < 1e-6);
  assert.equal(InfographicShared.FAST_JUMP_STEP, 5);
});

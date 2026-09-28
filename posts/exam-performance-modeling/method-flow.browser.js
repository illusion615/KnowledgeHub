'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.EXAM_PREVIEW_URL || 'http://127.0.0.1:52392/posts/exam-performance-modeling/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const out = process.env.EXAM_METHOD_EVIDENCE || '/tmp/exam-method-flow';
fs.mkdirSync(out, { recursive: true });
async function check(page, wide) {
  const result = await page.locator('#readiness .modeling-process').evaluate(f => {
    const rect = n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const cards = [...f.querySelectorAll('[data-method-step]')].map(n => ({ step: +n.dataset.methodStep, ...rect(n) }));
    const edges = [...f.querySelectorAll('[data-method-edge]')].filter(n => n.getBoundingClientRect().height > 0).map(n => {
      const svg = n.querySelector('svg'), m = svg.getScreenCTM();
      const transform = (x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
      const returning = n.dataset.methodEdge === '5-2';
      return { edge: n.dataset.methodEdge, start: returning ? transform(12, 76) : transform(3, 12), end: returning ? transform(12, 4) : transform(36, 12), hiddenFromAT: n.getAttribute('aria-hidden'), fill: getComputedStyle(svg.querySelector('path')).fill };
    });
    const textClipped = [...f.querySelectorAll('.modeling-process-node > strong, .modeling-process-node > p, .modeling-process-return, .method-return-edge > span')].filter(n => {
      const r = n.getBoundingClientRect(); if (!r.height) return false;
      const owner = n.closest('.modeling-process-node').getBoundingClientRect();
      if (n.parentElement.classList.contains('method-return-edge')) return r.right > owner.right + 1 || r.left < owner.left - 1;
      return r.left < owner.left || r.right > owner.right + 1 || r.top < owner.top || r.bottom > owner.bottom + 1;
    }).map(n => n.textContent);
    return { cards, edges, textClipped, overflow: f.scrollWidth > f.clientWidth + 1, fonts: [...new Set([...f.querySelectorAll('.modeling-process-node > p, .modeling-process-node > strong')].map(n => parseFloat(getComputedStyle(n).fontSize)))] };
  });
  assert.deepEqual(result.cards.map(c => c.step), [1, 2, 3, 4, 5, 6]);
  assert.equal(result.edges.length, wide ? 6 : 5);
  assert.deepEqual(result.textClipped, []); assert.equal(result.overflow, false); assert.ok(result.fonts.every(v => v >= 16));
  const byStep = n => result.cards[n - 1];
  for (const edge of result.edges) {
    const [from, to] = edge.edge.split('-').map(Number), a = byStep(from), b = byStep(to);
    assert.equal(edge.hiddenFromAT, 'true'); assert.equal(edge.fill, 'none');
    const dx = edge.end.x - edge.start.x, dy = edge.end.y - edge.start.y;
    assert.ok(dx * (b.x - a.x) + dy * (b.y - a.y) > 0, `arrow direction ${edge.edge}`);
    if (!wide || edge.edge === '3-4') {
      assert.ok(Math.abs(dx) < 1 && dy > 0, edge.edge);
      assert.ok(edge.start.y >= a.bottom - 1 && edge.end.y <= b.top + 1, edge.edge);
      assert.ok(Math.abs(edge.end.x - b.x) < 2, edge.edge);
    } else if (edge.edge === '5-2') {
      assert.ok(Math.abs(dx) < 1 && dy < 0);
      assert.ok(edge.start.y <= a.top + 1 && edge.end.y >= b.bottom - 1);
      assert.ok(Math.abs(edge.end.x - b.x) < 2);
    } else {
      assert.ok(Math.abs(dy) < 1, edge.edge);
      if (dx > 0) assert.ok(edge.start.x >= a.right - 1 && edge.end.x <= b.left + 1, edge.edge);
      else assert.ok(edge.start.x <= a.left + 1 && edge.end.x >= b.right - 1, edge.edge);
    }
    for (const card of result.cards) for (const p of [edge.start, edge.end]) assert.ok(!(p.x > card.left + 2 && p.x < card.right - 2 && p.y > card.top + 2 && p.y < card.bottom - 2), `${edge.edge} enters card ${card.step}`);
  }
  if (wide) {
    assert.ok(byStep(1).x < byStep(2).x && byStep(2).x < byStep(3).x);
    assert.ok(byStep(4).x > byStep(5).x && byStep(5).x > byStep(6).x);
  } else result.cards.slice(1).forEach((c, i) => assert.ok(c.top > result.cards[i].bottom));
  return { cards: 6, edges: result.edges.map(e => e.edge), fonts: result.fonts, overflow: result.overflow, textClipped: result.textClipped };
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const [lang, width, theme] of [['zh', 1440, 'light'], ['en', 1440, 'dark'], ['en', 976, 'dark'], ['zh', 390, 'light'], ['en', 390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}?lang=${lang}&theme=${theme}#readiness`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const geometry = await check(page, width >= 1100);
        if (width === 1440) await page.locator('#readiness .modeling-process').screenshot({ path: path.join(out, `${lang}-flow.png`) });
        const link = page.locator('#process-revision a[href="#process-assumptions"]');
        await link.focus(); assert.notEqual(await link.evaluate(n => getComputedStyle(n).outlineStyle), 'none');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => { const top = document.getElementById('process-assumptions').getBoundingClientRect().top; return top >= 0 && top < 300; });
        await page.evaluate(() => document.querySelector('[data-lang-toggle]').click());
        await check(page, width >= 1100);
        assert.deepEqual(await page.locator('main > .section').evaluateAll(ns => ns.filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.id)), []);
        await page.emulateMedia({ media: 'print' });
        assert.ok(await page.locator('#readiness .modeling-process').isVisible());
        assert.equal(await page.locator('#readiness .method-arrow:visible').count(), 5);
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ lang, width, theme, ...geometry, keyboardReturn: true, language: true, print: true, errors }));
      } finally { await context.close(); }
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage(); await page.goto(base + '#readiness', { waitUntil: 'networkidle' });
      await check(page, false);
      await page.locator('#process-revision a[href="#process-assumptions"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/#process-assumptions');
      console.log('No-JavaScript: full six-card vertical flow and return links work.');
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

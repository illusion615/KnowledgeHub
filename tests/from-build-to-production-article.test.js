'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { resolveArticleTarget, inspectArticleStatus } = require('../tools/article-publisher/status-inspector');

const REPO_ROOT = path.resolve(__dirname, '..');
const SLUG = 'from-build-to-production-harness-managed-runtime';
const ARTICLE_DIR = path.join(REPO_ROOT, 'posts', SLUG);

test('from-build-to-production article focuses on the architectural topic (zero speech-planning clutter) and passes sync contracts', () => {
  const mdPath = path.join(ARTICLE_DIR, 'article.md');
  const htmlPath = path.join(ARTICLE_DIR, 'index.html');
  const jsPath = path.join(ARTICLE_DIR, 'talk-blueprint.js');
  const cssPath = path.join(ARTICLE_DIR, 'talk-blueprint.css');
  const fig1Path = path.join(ARTICLE_DIR, 'media', 'build-to-prod-four-session-topology.figure.json');
  const fig2Path = path.join(ARTICLE_DIR, 'media', 'talk-30min-pacing-blueprint.figure.json');

  for (const p of [mdPath, htmlPath, jsPath, cssPath, fig1Path, fig2Path]) {
    assert.ok(fs.existsSync(p), `Expected file to exist: ${p}`);
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const fig2 = JSON.parse(fs.readFileSync(fig2Path, 'utf8'));

  assert.ok(css.includes('.bib-list a') && css.includes('overflow-wrap: anywhere'), 'Expected mobile bibliography URL wrap guard in talk-blueprint.css');

  // DoD-1 & DoD-2: Topic-focused knowledge exposition, zero speech/run-of-show coaching in prose, figures, or sandbox
  const forbiddenSpeechTokens = [
    'Wells Zhang',
    '11:30–12:00',
    '3 + 7 + 9 + 7 + 4',
    'Run-of-Show',
    'Soundbite',
    '演讲金句',
    '口播金句',
    '逐分钟卡点',
    '转场提示'
  ];
  for (const token of forbiddenSpeechTokens) {
    assert.equal(md.includes(token), false, `article.md must not contain speech-planning token: ${token}`);
    assert.equal(html.includes(token), false, `index.html must not contain speech-planning token: ${token}`);
    assert.equal(js.includes(token), false, `talk-blueprint.js must not contain speech-planning token: ${token}`);
  }

  assert.equal(fig2.type, 'radar', 'Second figure should be the 6-axis production control radar rather than a 30-min talk timer bar');

  // DoD-3: Logical causal spine across all four Ignite 2026 primary sources (BRK378, BRK259, BRK382, BRK285)
  for (const heading of [
    '#production-chasms',
    '#copilot-harness-kernel',
    '#copilot-managed-runtime',
    '#dual-green-zones-finops',
    '#bounded-autonomy-evolution'
  ]) {
    assert.ok(md.includes(heading), `Expected logical section ${heading}`);
  }

  // Verify core C0-C2 empirical benchmarks from the 4 sessions remain intact
  assert.ok(md.includes('47.5') && md.includes('45.0\\%') && md.includes('£2,000'), 'Expected BRK259 Harness benchmarks & hook threshold');
  assert.ok(md.includes('1,500+') && md.includes('40,000') && md.includes('Rayfin'), 'Expected BRK378 CMR & ecosystem facts');
  assert.ok(md.includes('7.5×') && md.includes('1,366') && md.includes('OpenAPI'), 'Expected BRK382 Novartis & FinOps facts');
  assert.ok(md.includes('18 个月') && md.includes('Durable Functions') && md.includes('Trace Studio'), 'Expected BRK285 FACS & hill-climbing facts');

  // Verify no raw placeholder leaks in compiled HTML
  assert.equal(html.includes('@@BILINGUAL_SEP@@'), false);
  assert.equal(html.includes('@@CODE_'), false);

  const target = resolveArticleTarget(SLUG, REPO_ROOT);
  assert.equal(target.ok, true);
  const status = inspectArticleStatus(target);
  assert.equal(status.ok, true);
  assert.equal(status.htmlInSync, true);
  assert.equal(status.catalogRegistered, true);
  assert.equal(status.topicId, 'ignite-2026');
  assert.equal(status.navigationRegistered, true);
  assert.equal(status.contractOk, true);
  assert.equal(status.mediaAudit.ok, true);

  // Verify Figure 1 topology has zero edge crossings, zero shared horizontal-corridor collisions, and zero pill overlaps
  const figureEngine = require('../tools/figure-engine');
  const topoLayout = require('../tools/figure-engine/topology-layout');
  const fig1Spec = JSON.parse(fs.readFileSync(fig1Path, 'utf8'));
  const zhSvg = fs.readFileSync(path.join(ARTICLE_DIR, 'media', 'build-to-prod-four-session-topology.zh.svg'), 'utf8');
  const enSvg = fs.readFileSync(path.join(ARTICLE_DIR, 'media', 'build-to-prod-four-session-topology.en.svg'), 'utf8');
  const drawio = fs.readFileSync(path.join(ARTICLE_DIR, 'media', 'build-to-prod-four-session-topology.drawio'), 'utf8');

  assert.equal(fig1Spec.nodes.length, 9, 'Expected 9 topology nodes');
  assert.equal(fig1Spec.edges.length, 7, 'Expected 7 directed topology edges');
  assert.ok(drawio.includes('exitX=') && drawio.includes('five-entry-surfaces'), 'Expected synchronized .drawio with port offsets');

  function extractOrthoSegments(d) {
    const tokens = d.trim().split(/\s+/);
    const pts = [];
    let i = 0;
    while (i < tokens.length) {
      const cmd = tokens[i++];
      if (cmd === 'M' || cmd === 'L') {
        pts.push([Number(tokens[i++]), Number(tokens[i++])]);
      } else if (cmd === 'Q') {
        pts.push([Number(tokens[i++]), Number(tokens[i++])]);
        pts.push([Number(tokens[i++]), Number(tokens[i++])]);
      }
    }
    const segs = [];
    for (let k = 0; k < pts.length - 1; k++) {
      segs.push([pts[k], pts[k + 1]]);
    }
    return segs;
  }

  function segmentsIntersectOrOverlap(s1, s2) {
    const [[x1, y1], [x2, y2]] = s1;
    const [[x3, y3], [x4, y4]] = s2;
    const h1 = Math.abs(y1 - y2) < 0.5;
    const v1 = Math.abs(x1 - x2) < 0.5;
    const h2 = Math.abs(y3 - y4) < 0.5;
    const v2 = Math.abs(x3 - x4) < 0.5;
    if (h1 && h2 && Math.abs(y1 - y3) < 2) {
      return Math.max(Math.min(x1, x2), Math.min(x3, x4)) <= Math.min(Math.max(x1, x2), Math.max(x3, x4));
    }
    if (v1 && v2 && Math.abs(x1 - x3) < 2) {
      return Math.max(Math.min(y1, y2), Math.min(y3, y4)) <= Math.min(Math.max(y1, y2), Math.max(y3, y4));
    }
    if (h1 && v2) {
      return x3 >= Math.min(x1, x2) - 0.5 && x3 <= Math.max(x1, x2) + 0.5 &&
             y1 >= Math.min(y3, y4) - 0.5 && y1 <= Math.max(y3, y4) + 0.5;
    }
    if (v1 && h2) {
      return x1 >= Math.min(x3, x4) - 0.5 && x1 <= Math.max(x3, x4) + 0.5 &&
             y3 >= Math.min(y1, y2) - 0.5 && y3 <= Math.max(y1, y2) + 0.5;
    }
    return false;
  }

  for (const [lang, standaloneSvg] of [['zh', zhSvg], ['en', enSvg]]) {
    const compiled = figureEngine.compileFigure(fig1Spec, { lang, standalone: true, idPrefix: `build-to-prod-four-session-topology-${lang}` });
    assert.equal(standaloneSvg.trim(), compiled.svg.trim(), `${lang}.svg artifact must match compiled FigureSpec`);
    const byId = Object.fromEntries(compiled.model.nodes.map((n) => [n.id, n]));
    assert.ok(byId['copilot-sdk-sandbox'].x < byId['five-entry-surfaces'].x && byId['five-entry-surfaces'].x < byId['subagents-hooks'].x, 'Top plane must align Kernel -> Five Entry Surfaces -> Subagents & Hooks left to right');

    const routed = compiled.model.edges.map((e, idx) => {
      const r = topoLayout.routeEdge(compiled.model, byId[e.from], byId[e.to], idx);
      const pw = Math.round(Math.max(48, figureEngine.tokens.measureText(e.label, 12) + 18));
      return {
        id: e.id,
        segs: extractOrthoSegments(r.d),
        pill: { x1: Math.round(r.labelX - pw / 2), x2: Math.round(r.labelX - pw / 2) + pw, y1: Math.round(r.labelY - 15), y2: Math.round(r.labelY - 15) + 22 }
      };
    });

    for (let i = 0; i < routed.length; i++) {
      for (let j = i + 1; j < routed.length; j++) {
        for (const sa of routed[i].segs) {
          for (const sb of routed[j].segs) {
            assert.equal(segmentsIntersectOrOverlap(sa, sb), false, `Edges ${routed[i].id} and ${routed[j].id} must not cross or share a corridor in ${lang}`);
          }
        }
        const pa = routed[i].pill;
        const pb = routed[j].pill;
        const pillsOverlap = pa.x1 < pb.x2 + 8 && pa.x2 + 8 > pb.x1 && pa.y1 < pb.y2 && pa.y2 > pb.y1;
        assert.equal(pillsOverlap, false, `Edge pills ${routed[i].id} and ${routed[j].id} must not collide in ${lang}`);
      }
    }
  }
});

test('talk-blueprint.js workload decision matrix switches across all 5 patterns, reacts to lang changes, and handles missing DOM safely', () => {
  const code = fs.readFileSync(path.join(ARTICLE_DIR, 'talk-blueprint.js'), 'utf8');

  // Failure boundary: missing sandbox DOM nodes should exit cleanly without throwing
  const emptyDoc = {
    readyState: 'complete',
    documentElement: { getAttribute: () => 'zh-CN' },
    querySelector: () => null,
    addEventListener: () => {}
  };
  assert.doesNotThrow(() => {
    vm.runInNewContext(code, {
      document: emptyDoc,
      MutationObserver: function () { return { observe: () => {} }; }
    });
  });

  function makeEl(tag) {
    return {
      tagName: String(tag || 'div').toUpperCase(),
      className: '',
      type: '',
      href: '',
      target: '',
      rel: '',
      textContent: '',
      _html: '',
      attrs: {},
      children: [],
      listeners: {},
      setAttribute(k, v) {
        this.attrs[k] = String(v);
      },
      getAttribute(k) {
        return this.attrs[k] || '';
      },
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      addEventListener(evt, fn) {
        this.listeners[evt] = fn;
      },
      get innerHTML() {
        return this._html;
      },
      set innerHTML(val) {
        this._html = String(val || '');
        if (val === '') this.children = [];
      }
    };
  }

  function collectText(node) {
    if (!node) return '';
    return [node.textContent || ''].concat((node.children || []).map(collectText)).join(' ');
  }

  let currentLang = 'zh-CN';
  let observerCb = null;
  const controlsEl = makeEl('div');
  const stageEl = makeEl('div');

  const mockDoc = {
    readyState: 'complete',
    documentElement: {
      getAttribute(attr) {
        return attr === 'lang' ? currentLang : '';
      }
    },
    createElement: makeEl,
    querySelector(sel) {
      if (sel === '[data-sandbox-controls="abs-talk-blueprint"]') return controlsEl;
      if (sel === '[data-sandbox-stage="abs-talk-blueprint"]') return stageEl;
      return null;
    },
    addEventListener: () => {}
  };

  vm.runInNewContext(code, {
    document: mockDoc,
    window: { addEventListener: () => {} },
    MutationObserver: function (cb) {
      observerCb = cb;
      return { observe: () => {} };
    }
  });

  const tabWrap = controlsEl.children[0];
  assert.equal(tabWrap.children.length, 5, 'Expected 5 workload scenario tabs');
  assert.ok(collectText(stageEl).includes('Work IQ'), 'Default Pattern 1 should render in Chinese');

  // Switch to Pattern 5 (Bounded Autonomy)
  tabWrap.children[4].listeners.click();
  assert.ok(collectText(stageEl).includes('Durable Functions'), 'Pattern 5 should highlight FACS durable state');

  // Trigger language mutation to English
  currentLang = 'en';
  assert.equal(typeof observerCb, 'function');
  observerCb([{ attributeName: 'lang' }]);
  const enText = collectText(stageEl);
  assert.ok(enText.includes('Workload Architecture Decision Matrix'), 'English banner should render after lang mutation');
  assert.ok(enText.includes('Never grant authority you cannot explain'), 'English delegation rule should render');
});

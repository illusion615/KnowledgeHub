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
      children: [],
      listeners: {},
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

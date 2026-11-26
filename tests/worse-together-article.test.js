'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { resolveArticleTarget, inspectArticleStatus } = require('../tools/article-publisher/status-inspector');

const REPO_ROOT = path.resolve(__dirname, '..');
const SLUG = 'worse-together-multi-user-agents';
const ARTICLE_DIR = path.join(REPO_ROOT, 'posts', SLUG);

test('worse-together-multi-user-agents article bundle is compiled, registered, and fact-faithful', () => {
  const mdPath = path.join(ARTICLE_DIR, 'article.md');
  const htmlPath = path.join(ARTICLE_DIR, 'index.html');
  const labJsPath = path.join(ARTICLE_DIR, 'worse-together-lab.js');
  const labCssPath = path.join(ARTICLE_DIR, 'worse-together-lab.css');

  for (const p of [mdPath, htmlPath, labJsPath, labCssPath]) {
    assert.ok(fs.existsSync(p), `Expected file to exist: ${p}`);
  }

  for (let i = 1; i <= 5; i += 1) {
    assert.ok(
      fs.existsSync(path.join(ARTICLE_DIR, 'media', `fig${i}.png`)),
      `Expected official Figure ${i} asset to exist`
    );
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify primary sources and core quantitative C0-C2 benchmarks from Anthropic Alignment Blog & arXiv:2610.00583
  assert.ok(md.includes('https://alignment.anthropic.com/2026/worse-together/'));
  assert.ok(md.includes('https://arxiv.org/abs/2610.00583'));
  assert.ok(md.includes('https://github.com/safety-research/MAMUBench'));
  assert.ok(md.includes('73.1%') && md.includes('62.3%'), 'Expected unread-message guard recovery rates');
  assert.ok(md.includes('66%') && md.includes('10%'), 'Expected Sonnet 5 4->16 participation drop');

  // Verify compiled HTML includes bilingual attributes, KaTeX math, inline SVGs, and sandbox hooks
  assert.ok(html.includes('data-sandbox-stage="mamu-bench-explorer"'));
  assert.ok(html.includes('./worse-together-lab.js'));
  assert.ok(html.includes('data-zh=') && html.includes('data-en='));

  const target = resolveArticleTarget(SLUG, REPO_ROOT);
  assert.equal(target.ok, true);
  const status = inspectArticleStatus(target);
  assert.equal(status.ok, true);
  assert.equal(status.hasMarkdown, true);
  assert.equal(status.hasHtml, true);
  assert.equal(status.htmlInSync, true);
  assert.equal(status.catalogRegistered, true);
  assert.equal(status.topicId, 'fc-agentic');
  assert.equal(status.navigationRegistered, true);
  assert.equal(status.contractOk, true);
  assert.equal(status.mediaAudit.ok, true);
});

test('worse-together-lab.js interactive sandbox renders all 4 environments, switches models, and handles missing DOM safely', () => {
  const labCode = fs.readFileSync(path.join(ARTICLE_DIR, 'worse-together-lab.js'), 'utf8');

  // Failure boundary: missing sandbox DOM nodes should exit cleanly without throwing
  const emptyDoc = {
    readyState: 'complete',
    documentElement: { getAttribute: () => 'zh-CN' },
    querySelector: () => null,
    addEventListener: () => {}
  };
  assert.doesNotThrow(() => {
    vm.runInNewContext(labCode, {
      document: emptyDoc,
      MutationObserver: function () { return { observe: () => {} }; }
    });
  });

  // Interactive DOM harness test for environment tabs, model toggle, and language mutation
  function makeEl(tag) {
    return {
      tagName: String(tag || 'div').toUpperCase(),
      className: '',
      type: '',
      textContent: '',
      style: {},
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
      querySelector(sel) {
        if (sel === '[data-wt-bar-mount="1"]' && this._html.includes('data-wt-bar-mount="1"')) {
          const self = this;
          return {
            replaceWith(replacement) {
              self.replacedBarList = replacement;
            }
          };
        }
        return null;
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
      if (sel === '[data-sandbox-controls="mamu-bench-explorer"]') return controlsEl;
      if (sel === '[data-sandbox-stage="mamu-bench-explorer"]') return stageEl;
      return null;
    },
    addEventListener: () => {}
  };

  vm.runInNewContext(labCode, {
    document: mockDoc,
    MutationObserver: function (cb) {
      observerCb = cb;
      return { observe: () => {} };
    }
  });

  const wrap = controlsEl.children[0];
  assert.ok(wrap, 'Controls wrapper should render');
  const envTabs = wrap.children[0].children;
  const modelBtns = wrap.children[1].children;
  assert.equal(envTabs.length, 4, 'Should render 4 environment tabs');
  assert.equal(modelBtns.length, 2, 'Should render Opus 5 and Sonnet 5 toggle buttons');
  assert.equal(stageEl.replacedBarList.children.length, 5, 'API Key should render 5 comparison bars');

  // Switch to Personal Assistant + Sonnet 5 + English locale
  envTabs[1].listeners.click();
  const updatedWrap = controlsEl.children[0];
  updatedWrap.children[1].children[1].listeners.click();
  currentLang = 'en';
  observerCb([{ attributeName: 'lang' }]);

  assert.match(stageEl.innerHTML, /Personal Assistant|Unread-DM Checkout Race/);
  assert.match(stageEl.innerHTML, /Claude Sonnet 5/);
  assert.equal(stageEl.replacedBarList.children.length, 5);

  // Switch across remaining Clinic (4 bars) and Merge Queue (3 bars) tabs + DOMContentLoaded loading branch
  const clinicTabs = controlsEl.children[0].children[0].children;
  clinicTabs[2].listeners.click();
  assert.equal(stageEl.replacedBarList.children.length, 4, 'Clinic should render 4 joint-success bars');
  assert.match(stageEl.innerHTML, /Clinic Calendar|Three Strict SOP Rules/);

  const mergeTabs = controlsEl.children[0].children[0].children;
  mergeTabs[3].listeners.click();
  assert.equal(stageEl.replacedBarList.children.length, 3, 'Merge Queue should render 3 PR-value bars');
  assert.match(stageEl.innerHTML, /CI Merge Queue|97% Value/);

  // Non-lang attribute mutation should be a safe no-op
  observerCb([{ attributeName: 'data-theme' }]);
  assert.equal(stageEl.replacedBarList.children.length, 3);

  // Loading readyState branch registers DOMContentLoaded listener cleanly
  let domLoadedFn = null;
  vm.runInNewContext(labCode, {
    document: {
      readyState: 'loading',
      documentElement: { getAttribute: () => 'zh-CN' },
      querySelector: () => null,
      addEventListener(evt, fn) {
        if (evt === 'DOMContentLoaded') domLoadedFn = fn;
      }
    },
    MutationObserver: function () { return { observe: () => {} }; }
  });
  assert.equal(typeof domLoadedFn, 'function', 'Should defer init until DOMContentLoaded when loading');
  assert.doesNotThrow(() => domLoadedFn());
});

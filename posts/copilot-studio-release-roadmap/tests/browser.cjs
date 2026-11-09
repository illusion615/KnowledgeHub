'use strict';
/* Fresh Chrome/CDP contexts, isolated loopback fixtures, no keys or model calls.
 * No Playwright dependency: the repository's render-deck.js uses the same Node 22 CDP approach. */
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var http = require('node:http');
var childProcess = require('node:child_process');
var os = require('node:os');
var ARTICLE = path.resolve(__dirname, '..');
var ROOT = path.resolve(ARTICLE, '../..');
var outArgument = process.argv.indexOf('--outdir');
var artifactRoot = path.join(__dirname, 'artifacts');
var OUT = outArgument >= 0 ? path.resolve(process.argv[outArgument + 1] || '') : path.join(artifactRoot, 'builder-fixes-20261109-d11', (process.argv.indexOf('--probe-console') >= 0 ? 'console-' : 'browser-') + Date.now());
if (OUT.indexOf(artifactRoot + path.sep) !== 0) throw new Error('Browser evidence must stay in this article artifact directory');
var CHROME = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
var snapshot = JSON.parse(fs.readFileSync(path.join(ARTICLE, 'snapshot.json'), 'utf8'));
var report = { engine: 'Installed Chrome / Node 22 CDP', playwright: 'Not installed; no dependency installed', scenarios: [], modelPosts: 0, blockedAssets: [], expectedSnapshotFailures: 0 };
var server;
var chrome;
var profile;
var browser;
var base;
var errorFixtureRequests = 0;

function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
function connect(wsUrl) {
  return new Promise(function (resolve, reject) {
    var ws = new WebSocket(wsUrl);
    var pending = new Map();
    var listeners = [];
    var next = 1;
    var timer = setTimeout(function () { reject(new Error('CDP connection timeout')); }, 20000);
    ws.onopen = function () {
      clearTimeout(timer);
      resolve({ send: function (method, params, sessionId) {
        var id = next++;
        var message = { id: id, method: method, params: params || {} };
        if (sessionId) message.sessionId = sessionId;
        return new Promise(function (res, rej) {
          var timeout = setTimeout(function () { pending.delete(id); rej(new Error('CDP timeout: ' + method)); }, 30000);
          pending.set(id, { resolve: res, reject: rej, timeout: timeout });
          ws.send(JSON.stringify(message));
        });
      }, on: function (listener) { listeners.push(listener); }, close: function () { ws.close(); } });
    };
    ws.onmessage = function (event) {
      var message = JSON.parse(event.data);
      var slot;
      if (message.id && pending.has(message.id)) {
        slot = pending.get(message.id); pending.delete(message.id); clearTimeout(slot.timeout);
        if (message.error) slot.reject(new Error(message.error.message)); else slot.resolve(message.result);
      } else listeners.forEach(function (listener) { listener(message); });
    };
    ws.onerror = function () { clearTimeout(timer); reject(new Error('CDP websocket failure')); };
    ws.onclose = function (event) {
      pending.forEach(function (slot) { clearTimeout(slot.timeout); slot.reject(new Error('CDP connection closed: ' + event.code + ' ' + (event.reason || ''))); });
      pending.clear();
    };
  });
}

function startServer() {
  return new Promise(function (resolve, reject) {
    server = http.createServer(function (req, res) {
      var url = new URL(req.url, 'http://127.0.0.1');
      var pathname = decodeURIComponent(url.pathname);
      var fixture = new URL(req.headers.referer || 'http://127.0.0.1').searchParams.get('fixture');
      var file;
      var allowed;
      var data;
      if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      if (pathname.indexOf('/mock/') === 0 || pathname === '/mock') {
        if (req.method === 'POST') report.modelPosts++;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ object: 'list', data: [{ id: 'TEST-ONLY-NO-INFERENCE' }] })); return;
      }
      if (pathname === '/posts/copilot-studio-release-roadmap/snapshot.json' && fixture === 'error' && errorFixtureRequests++ === 0) {
        report.expectedSnapshotFailures++;
        res.writeHead(503, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); res.end('TEST ONLY: unavailable snapshot'); return;
      }
      if (pathname === '/posts/copilot-studio-release-roadmap/snapshot.json' && fixture === 'hostile') {
        data = JSON.parse(JSON.stringify(snapshot));
        data.records[0].title.zh = 'TEST ONLY <img src=x onerror=window.__roadmapAttack=1>';
        data.records[0].title.en = 'TEST ONLY <img src=x onerror=window.__roadmapAttack=1>';
        data.records[0].officialTitle = 'TEST ONLY <script>window.__roadmapAttack=2</script>';
        data.records[0].primaryUrl = 'javascript:window.__roadmapAttack=3';
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); return;
      }
      allowed = pathname.indexOf('/assets/') === 0 && /\.(?:js|css|woff2?|ttf|svg|png|jpg)$/.test(pathname);
      if (allowed) {
        file = path.resolve(ROOT, '.' + pathname);
        if (file.indexOf(path.join(ROOT, 'assets') + path.sep) !== 0) file = null;
      }
      else if (['/posts/copilot-studio-release-roadmap/index.html', '/posts/copilot-studio-release-roadmap/roadmap-query.js', '/posts/copilot-studio-release-roadmap/snapshot.json', '/posts/copilot-studio-release-roadmap/evidence.json'].indexOf(pathname) !== -1) file = path.resolve(ROOT, '.' + pathname);
      if (!file || file.indexOf(ROOT + path.sep) !== 0 || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf' })[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', function () { base = 'http://127.0.0.1:' + server.address().port; resolve(); });
  });
}

function startChrome() {
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-roadmap-browser-'));
  chrome = childProcess.spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync',
    '--disable-gpu', '--hide-scrollbars', '--window-size=1920,1080', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  return new Promise(function (resolve, reject) {
    var output = '';
    var connected = false;
    var timer = setTimeout(function () { reject(new Error('Chrome debug endpoint timeout')); }, 20000);
    chrome.stderr.on('data', function (chunk) {
      var match;
      output += chunk.toString();
      match = output.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/[^\s]+)/);
      if (match && !connected) { connected = true; clearTimeout(timer); connect(match[1]).then(resolve, reject); }
    });
    chrome.once('exit', function (code, signal) { report.chromeExit = { code: code, signal: signal }; clearTimeout(timer); reject(new Error('Chrome exited: ' + code)); });
  });
}

async function context(name, lang, theme, width, height, fixture, assistant, navigation) {
  var context = await browser.send('Target.createBrowserContext', { disposeOnDetach: true });
  var target = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId: context.browserContextId });
  var attached = await browser.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  var sid = attached.sessionId;
  var errors = [];
  var consoleErrors = [];
  var requests = [];
  var init;
  var targetUrl = new URL(base + '/posts/copilot-studio-release-roadmap/index.html');
  var result = { name: name, lang: lang, theme: theme, viewport: [width, height], assertions: [], screenshots: [], runtimeErrors: errors, consoleErrors: consoleErrors, snapshotRequests: requests };
  function send(method, params) { return browser.send(method, params, sid); }
  async function evaluate(expression) {
    var result = await send('Runtime.evaluate', { expression: expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + JSON.stringify(result.exceptionDetails.exception));
    return result.result ? result.result.value : undefined;
  }
  async function waitFor(predicate, label) {
    var started = Date.now();
    while (Date.now() - started < 15000) { if (await evaluate(predicate)) return; await delay(60); }
    throw new Error('Browser condition timed out: ' + label);
  }
  async function screenshot(label, selector, maximumHeight) {
    var geometry;
    var image;
    var output = path.join(OUT, name + '-' + label + '.png');
    await evaluate('document.querySelector(' + JSON.stringify(selector) + ').scrollIntoView({block:"start"})');
    await waitFor('(function(){var e=document.querySelector(' + JSON.stringify(selector) + ');while(e){if(Number(getComputedStyle(e).opacity)<.999)return false;e=e.parentElement;}return true;}())', 'settled screenshot opacity');
    geometry = await evaluate('(function(){var r=document.querySelector(' + JSON.stringify(selector) + ').getBoundingClientRect();return {x:Math.max(0,r.left+scrollX),y:Math.max(0,r.top+scrollY),width:Math.min(innerWidth,r.width),height:Math.min(r.height,' + (maximumHeight || 1800) + '),scale:1};}())');
    image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: geometry });
    fs.writeFileSync(output, Buffer.from(image.data, 'base64'));
    result.screenshots.push(path.relative(ROOT, output));
  }
  browser.on(function (message) {
    if (message.sessionId !== sid) return;
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ' ' + (message.params.exceptionDetails.exception && message.params.exceptionDetails.exception.description || ''));
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params.args.map(function (argument) { return argument.value || argument.description || argument.type; }).join(' '));
    if (message.method === 'Fetch.requestPaused') {
      var request = message.params.request;
      var parsed = new URL(request.url);
      var allowed = parsed.origin === base || ['fonts.googleapis.com', 'fonts.gstatic.com'].indexOf(parsed.hostname) >= 0 || ['data:', 'blob:'].indexOf(parsed.protocol) >= 0;
      if (request.url.indexOf('/snapshot.json') >= 0) requests.push(request.url);
      if (allowed) send('Fetch.continueRequest', { requestId: message.params.requestId }).catch(function () {});
      else {
        report.blockedAssets.push(parsed.hostname);
        send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
          body: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>').toString('base64') }).catch(function () {});
      }
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: width, height: height, deviceScaleFactor: 1, mobile: width <= 480 });
  init = '(function(){if(location.hostname!=="127.0.0.1")return;localStorage.setItem("lang",' + JSON.stringify(lang) + ');localStorage.setItem("theme",' + JSON.stringify(theme) + ');localStorage.setItem("present-bg","default");localStorage.setItem("narration-autostart","false");localStorage.setItem("narration-showEndQR","false");' +
    (assistant ? 'localStorage.setItem("llm-settings",JSON.stringify({provider:"openai-compatible",endpoint:location.origin+"/mock",model:"TEST-ONLY-NO-INFERENCE"}));' : '') +
    'window.__fixtureFetches=[];var original=window.fetch;window.fetch=function(url,options){window.__fixtureFetches.push(String(url));return original.call(this,url,options);};}());';
  await send('Page.addScriptToEvaluateOnNewDocument', { source: init });
  if (fixture) targetUrl.searchParams.set('fixture', fixture);
  if (navigation && navigation.query) targetUrl.search = navigation.query;
  if (navigation && navigation.hash) targetUrl.hash = navigation.hash;
  result.url = targetUrl.href;
  await send('Page.navigate', { url: targetUrl.href });
  await waitFor('document.readyState === "complete" && document.getElementById("roadmap-query-form").getAttribute("data-query-bound") === "true" && document.getElementById("references").getAttribute("data-reference-bound") === "true"', 'article scripts');
  await evaluate('document.fonts.ready.then(function(){return true;})');
  await delay(150);
  report.scenarios.push(result);
  return { result: result, send: send, evaluate: evaluate, waitFor: waitFor, screenshot: screenshot,
    close: function () { return browser.send('Target.disposeBrowserContext', { browserContextId: context.browserContextId }); } };
}

function referenceStateInBrowser(id) {
  var target = document.getElementById(id);
  var drawer = target.closest('[data-accordion]');
  var panel = drawer.querySelector('.subsection-content');
  var rect = target.getBoundingClientRect();
  var node = target;
  var visible = rect.width > 0 && rect.height > 0;
  var styles;
  while (node) {
    styles = getComputedStyle(node);
    if (styles.display === 'none' || styles.visibility === 'hidden' || Number(styles.opacity) < 0.99) visible = false;
    node = node.parentElement;
  }
  return { id: id, hash: location.hash, open: drawer.classList.contains('is-open'), panelHidden: panel.getAttribute('aria-hidden'), opacity: getComputedStyle(panel).opacity,
    maxHeight: getComputedStyle(panel).maxHeight, visible: visible, inViewport: rect.top >= 0 && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth,
    highlighted: target.classList.contains('bib-hit'), text: target.textContent.trim(), rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right } };
}

async function visibleReference(ctx, id, label) {
  var state;
  try {
    await ctx.waitFor('(' + referenceStateInBrowser.toString() + ')(' + JSON.stringify(id) + ').visible && (' + referenceStateInBrowser.toString() + ')(' + JSON.stringify(id) + ').inViewport', 'visible reference ' + label);
  } catch (error) {
    state = await ctx.evaluate('(' + referenceStateInBrowser.toString() + ')(' + JSON.stringify(id) + ')');
    ctx.result.referenceChecks = (ctx.result.referenceChecks || []).concat([{ label: label + '-FAILED', state: state }]);
    throw error;
  }
  state = await ctx.evaluate('(' + referenceStateInBrowser.toString() + ')(' + JSON.stringify(id) + ')');
  assert.equal(state.open, true); assert.equal(state.panelHidden, 'false'); assert.equal(state.highlighted, true); assert.equal(state.hash, '#' + id);
  ctx.result.referenceChecks = (ctx.result.referenceChecks || []).concat([{ label: label, state: state }]);
}

async function closeReference(ctx, id) {
  await ctx.evaluate('(function(){var item=document.getElementById(' + JSON.stringify(id) + ').closest("[data-accordion]");if(item.classList.contains("is-open"))item.querySelector("button.subsection-toggle").click();}())');
}

async function manualDisclosureStates(ctx) {
  return ctx.evaluate('Array.from(document.querySelectorAll("main [data-accordion]")).filter(function(e){return !e.closest("#references");}).map(function(e){return {id:e.querySelector(".subsection-content").id,open:e.classList.contains("is-open")};})');
}

async function citations(ctx) {
  var before;
  var cases = [['query', 'ref-3', '#roadmap-detail-summary .cite-link[data-ref="3"]'], ['prose', 'ref-1', '#sources .section-head .cite-link[data-ref="1"]']];
  var index;
  var initialLang = ctx.result.lang;
  await ctx.waitFor('document.querySelector(' + JSON.stringify('#roadmap-detail-summary .cite-link[data-ref="3"]') + ')!==null', 'canonical dynamic citation');
  for (index = 0; index < cases.length; index++) {
    await closeReference(ctx, cases[index][1]);
    before = await manualDisclosureStates(ctx);
    await ctx.evaluate('document.querySelector(' + JSON.stringify(cases[index][2]) + ').click()');
    await visibleReference(ctx, cases[index][1], cases[index][0] + '-reading');
    assert.deepEqual(await manualDisclosureStates(ctx), before);
    await ctx.screenshot('citation-' + cases[index][0], '#references .subsection-item.is-open', 1800);
  }
  await ctx.evaluate('document.querySelector(".topbar-lang-toggle").click()');
  await visibleReference(ctx, 'ref-1', 'language-switch-open-target');
  await closeReference(ctx, 'ref-1');
  await ctx.evaluate('document.querySelector(".topbar-lang-toggle").click()');
  await delay(300);
  assert.equal(await ctx.evaluate('document.getElementById("ref-1").closest("[data-accordion]").classList.contains("is-open")'), false);
  await ctx.evaluate('document.querySelector(' + JSON.stringify('#roadmap-detail-summary .cite-link[data-ref="3"]') + ').click()');
  await visibleReference(ctx, 'ref-3', 'query-after-language-switch');
  assert.equal((await ctx.evaluate('document.documentElement.lang')).indexOf(initialLang) === 0, true);
  ctx.result.assertions.push('Query/prose citations reveal actual reference text before shared jump; language changes retain open targets and respect manual closures; unrelated drawers unchanged');
}

async function activatePanel(ctx, id) {
  await ctx.evaluate('(function(){var steps=Array.from(document.querySelectorAll("[data-present-step]"));var index=steps.indexOf(document.getElementById(' + JSON.stringify(id) + '));document.querySelectorAll(".present-page-menu-item")[index].click();}())');
}

async function presentationCitations(ctx) {
  var before;
  await closeReference(ctx, 'ref-3');
  before = await manualDisclosureStates(ctx);
  await ctx.evaluate('document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();document.querySelector(".present-counter-button").click()');
  await activatePanel(ctx, 'roadmap-detail-panel');
  await ctx.evaluate('document.querySelector(' + JSON.stringify('#roadmap-detail-summary .cite-link[data-ref="3"]') + ').click()');
  await ctx.waitFor('!document.documentElement.classList.contains("is-presentation-mode")', 'citation returns to reading');
  await visibleReference(ctx, 'ref-3', 'query-from-presentation');
  assert.deepEqual(await manualDisclosureStates(ctx), before);
  await closeReference(ctx, 'ref-1');
  before = await manualDisclosureStates(ctx);
  await ctx.evaluate('document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();document.querySelector(".present-counter-button").click()');
  await activatePanel(ctx, 'sources');
  await ctx.evaluate('document.querySelector(' + JSON.stringify('#sources .section-head .cite-link[data-ref="1"]') + ').click()');
  await visibleReference(ctx, 'ref-1', 'prose-from-presentation');
  assert.equal(await ctx.evaluate('document.documentElement.classList.contains("is-presentation-mode")'), false);
  assert.deepEqual(await manualDisclosureStates(ctx), before);
  ctx.result.assertions.push('Presentation citation inspection uses shared exit/toggle controls, makes target text visible, and restores other manual reading disclosures');
}

async function recordDatesAndGeometry(ctx) {
  var records = [];
  var index;
  var panel;
  var geometry;
  var detail;
  await ctx.evaluate('document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();document.querySelector(".present-counter-button").click()');
  await activatePanel(ctx, 'roadmap-detail-panel');
  for (index = 0; index < snapshot.records.length; index++) {
    await search(ctx, snapshot.records[index].id, 'all');
    detail = await ctx.evaluate('({id:document.getElementById("roadmap-detail-panel").getAttribute("data-selected-record"),freshness:document.getElementById("roadmap-detail-freshness").textContent,status:document.getElementById("roadmap-original-status").textContent,notice:document.getElementById("roadmap-release-label").textContent,note:document.getElementById("roadmap-date-fields-note").textContent})');
    assert.equal(detail.id, snapshot.records[index].id);
    assert.match(detail.freshness, /2026-11-09/);
    assert.ok(detail.status.indexOf(snapshot.records[index].originalStatus) >= 0);
    if (snapshot.records[index].kind === 'roadmap') {
      assert.ok(detail.freshness.indexOf(snapshot.records[index].roadmapModifiedAt) >= 0);
      assert.match(detail.freshness, /modified/);
    } else {
      assert.ok(detail.freshness.indexOf(snapshot.records[index].learnMsDate) >= 0);
      assert.match(detail.freshness, /Microsoft Learn ms.date/);
      assert.ok(!/guidance updated|文档更新时间/.test(detail.freshness));
      if (snapshot.records[index].release.period) assert.ok(detail.notice.indexOf(snapshot.records[index].release.period) >= 0);
    }
    assert.match(detail.note, /ms.date/);
    for (panel = 0; panel < 2; panel++) {
      await activatePanel(ctx, panel ? 'roadmap-constraints-panel' : 'roadmap-detail-panel');
      await ctx.waitFor('Number(getComputedStyle(document.querySelector("[data-present-step].is-active")).opacity)>=.999', 'selected record step settled');
      geometry = await ctx.evaluate('(' + measureStepInBrowser.toString() + ')()');
      assert.ok(geometry.scrollHeight <= geometry.clientHeight + 2 && geometry.scrollWidth <= geometry.clientWidth + 2, 'record overflow: ' + JSON.stringify(geometry));
      assert.ok(geometry.left >= geometry.prevRight - 1 && geometry.right <= geometry.nextLeft + 1 && geometry.minTop >= geometry.safeTop - 2 && geometry.maxBottom <= geometry.safeBottom + 2, 'record safe area: ' + JSON.stringify(geometry));
      records.push({ record: snapshot.records[index].id, detail: detail, geometry: geometry });
    }
  }
  await ctx.evaluate('document.querySelector("[data-present-exit]").click();document.getElementById("roadmap-reset").click()');
  ctx.result.selectedRecordChecks = records;
  ctx.result.assertions.push('All 16 records preserve original release state and distinguish Learn ms.date/roadmap modified/notice month/verification; 32 selected-record slide geometries fit safe areas');
}

async function directHashChecks() {
  var languages = ['zh', 'en'];
  var refs = ['ref-1', 'ref-3'];
  var i;
  var j;
  var ctx;
  for (i = 0; i < languages.length; i++) {
    for (j = 0; j < refs.length; j++) {
      ctx = await context('direct-' + languages[i] + '-' + refs[j], languages[i], languages[i] === 'en' ? 'dark' : 'light', 1280, 900, null, false, { hash: refs[j] });
      await visibleReference(ctx, refs[j], 'initial-hash');
      await ctx.screenshot('target', '#references .subsection-item.is-open', 1800);
      await ctx.evaluate('document.querySelector(".topbar-lang-toggle").click()');
      await visibleReference(ctx, refs[j], 'direct-hash-language-switch');
      await closeReference(ctx, refs[j]);
      await ctx.evaluate('document.querySelector(".topbar-lang-toggle").click()');
      await delay(250);
      assert.equal(await ctx.evaluate('document.getElementById(' + JSON.stringify(refs[j]) + ').closest("[data-accordion]").classList.contains("is-open")'), false);
      await ctx.evaluate('location.hash=' + JSON.stringify(refs[j] === 'ref-1' ? 'ref-3' : 'ref-1'));
      await visibleReference(ctx, refs[j] === 'ref-1' ? 'ref-3' : 'ref-1', 'new-hash-intent');
      assert.deepEqual(ctx.result.runtimeErrors, []); assert.deepEqual(ctx.result.consoleErrors, []);
      ctx.result.assertions.push('Direct hash reveals actual source text in both languages; manual closure survives language switches; a new hash intent opens only its target');
      await ctx.close();
    }
  }
}

async function browserPrintCheck() {
  var ctx = await context('zh-browser-print', 'zh', 'light', 1440, 1000, null, false, { query: '?draft=1&lang=zh&theme=light' });
  var pdf;
  var chunk;
  var chunks = [];
  var bytes = 0;
  var file = path.join(OUT, 'zh-reading-copy.pdf');
  await ctx.waitFor('document.querySelectorAll("#roadmap-results [data-record-id]").length===4', 'print snapshot');
  assert.equal(await ctx.evaluate('Array.from(document.querySelectorAll("[data-accordion]")).every(function(e){return e.classList.contains("is-open");})'), true);
  await ctx.evaluate('window.dispatchEvent(new Event("load"));document.fonts.ready');
  await delay(500);
  pdf = await ctx.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, paperWidth: 8.27, paperHeight: 11.69, marginTop: 0.35, marginBottom: 0.35, marginLeft: 0.35, marginRight: 0.35, transferMode: 'ReturnAsStream' });
  do {
    chunk = await ctx.send('IO.read', { handle: pdf.stream, size: 262144 });
    chunks.push(Buffer.from(chunk.data, chunk.base64Encoded ? 'base64' : 'utf8'));
    bytes += chunks[chunks.length - 1].length;
    assert.ok(bytes <= 104857600 && chunks.length <= 1024, 'Bounded print stream');
  } while (!chunk.eof);
  await ctx.send('IO.close', { handle: pdf.stream });
  fs.writeFileSync(file, Buffer.concat(chunks));
  ctx.result.print = { path: path.relative(ROOT, file), bytes: fs.statSync(file).size, scope: 'Installed Chrome; zh/light shared draft reading view; full prose disclosures and the current selected query record, not all 16 record details or other browsers' };
  assert.ok(ctx.result.print.bytes > 20000);
  assert.deepEqual(ctx.result.runtimeErrors, []); assert.deepEqual(ctx.result.consoleErrors, []);
  ctx.result.assertions.push('Actual browser print-to-PDF executed from the Chinese full reading view; visual/PDF inspection is a separate recorded check, not a universal printing guarantee');
  await ctx.close();
}

async function search(ctx, keyword, status) {
  await ctx.evaluate('(function(){document.getElementById("roadmap-keyword").value=' + JSON.stringify(keyword) + ';document.getElementById("roadmap-status-filter").value=' + JSON.stringify(status || 'all') + ';document.getElementById("roadmap-query-form").requestSubmit();}())');
}

async function readingScan(ctx) {
  var scan = await ctx.evaluate('(function(){var vw=innerWidth;return {documentWidth:document.documentElement.scrollWidth,viewport:vw,sections:Array.from(document.querySelectorAll("main>section")).map(function(s){var r=s.getBoundingClientRect();return {id:s.id,left:r.left,right:r.right,width:r.width,scrollWidth:s.scrollWidth};}),outside:Array.from(document.querySelectorAll(".site main *")).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"&&!e.closest(".roadmap-table-wrap")&&(r.left < -1 || r.right > vw+1);}).map(function(e){return {tag:e.tagName,id:e.id,class:e.className};}).slice(0,20)};}())');
  assert.ok(scan.documentWidth <= scan.viewport + 1, JSON.stringify(scan));
  scan.sections.forEach(function (section) { assert.ok(section.left >= -1 && section.right <= scan.viewport + 1, JSON.stringify(section)); });
  assert.deepEqual(scan.outside, [], JSON.stringify(scan));
  ctx.result.readingGeometry = scan;
  ctx.result.assertions.push('All six section widths and visible non-scroll-table descendants stay within viewport');
}

async function interactive(ctx) {
  var state;
  var seen = [];
  var page;
  await ctx.waitFor('document.querySelectorAll("#roadmap-results [data-record-id]").length===4', 'snapshot records');
  assert.match(await ctx.evaluate('document.getElementById("roadmap-snapshot-meta").textContent'), /2026-11-09.*2026-11-06/);
  for (page = 0; page < 4; page++) {
    seen = seen.concat(await ctx.evaluate('Array.from(document.querySelectorAll("#roadmap-results [data-record-id]")).map(function(e){return e.getAttribute("data-record-id");})'));
    if (page < 3) await ctx.evaluate('document.getElementById("roadmap-next").click()');
  }
  assert.deepEqual(seen, snapshot.records.map(function (record) { return record.id; }));
  await ctx.evaluate('document.getElementById("roadmap-reset").click()');
  await search(ctx, '576272', 'development');
  assert.equal(await ctx.evaluate('document.querySelectorAll("#roadmap-results [data-record-id]").length'), 1);
  assert.equal(await ctx.evaluate('document.querySelector("#roadmap-primary-link a").href'), 'https://www.microsoft.com/microsoft-365/roadmap?id=576272');
  assert.match(await ctx.evaluate('document.getElementById("roadmap-date-rows").textContent'), /2026-11.*2027-01/);
  assert.ok(await ctx.evaluate('Array.from(document.querySelectorAll("#roadmap-document-links a")).every(function(a){return a.protocol==="https:"&&a.rel==="noopener noreferrer";})'));
  await search(ctx, '', 'cancelled');
  assert.equal(await ctx.evaluate('document.getElementById("roadmap-detail-panel").getAttribute("data-selected-record")'), 'roadmap-562220');
  assert.match(await ctx.evaluate('document.getElementById("roadmap-release-summary").textContent'), /no longer accurate/);
  await search(ctx, '568929', 'development');
  await ctx.evaluate('window.__savedQueryNode=document.getElementById("roadmap-keyword");window.__savedSelectNode=document.getElementById("roadmap-status-filter");document.getElementById("roadmap-keyword").value="UNSENT <img src=x onerror=1>";document.getElementById("roadmap-status-filter").value="launched";document.querySelector(".topbar-lang-toggle").click();');
  state = await ctx.evaluate('({lang:document.documentElement.lang,input:document.getElementById("roadmap-keyword").value,status:document.getElementById("roadmap-status-filter").value,selected:document.getElementById("roadmap-detail-panel").getAttribute("data-selected-record"),sameInput:window.__savedQueryNode===document.getElementById("roadmap-keyword"),sameSelect:window.__savedSelectNode===document.getElementById("roadmap-status-filter"),rows:document.querySelectorAll("#roadmap-results [data-record-id]").length,applied:document.getElementById("roadmap-applied-query").textContent})');
  assert.equal(state.input, 'UNSENT <img src=x onerror=1>'); assert.equal(state.status, 'launched'); assert.equal(state.selected, 'roadmap-568929'); assert.equal(state.rows, 1); assert.ok(state.sameInput && state.sameSelect); assert.match(state.applied, /568929/);
  await search(ctx, 'NO-RECORD-<img src=x onerror=window.__roadmapAttack=1>', 'all');
  assert.equal(await ctx.evaluate('document.getElementById("roadmap-empty").hidden'), false);
  assert.equal(await ctx.evaluate('document.getElementById("roadmap-detail-panel").getAttribute("data-selected-record")'), null);
  assert.equal(await ctx.evaluate('document.querySelectorAll("#query img").length'), 0);
  assert.equal(await ctx.evaluate('typeof window.__roadmapAttack'), 'undefined');
  await search(ctx, '576272', 'launched');
  assert.equal(await ctx.evaluate('document.querySelectorAll("#roadmap-results [data-record-id]").length'), 0);
  await ctx.evaluate('document.getElementById("roadmap-reset").click()');
  if (ctx.result.lang === 'zh') await ctx.evaluate('if(document.documentElement.lang==="en")document.querySelector(".topbar-lang-toggle").click()');
  else await ctx.evaluate('if(document.documentElement.lang!=="en")document.querySelector(".topbar-lang-toggle").click()');
  assert.equal(ctx.result.snapshotRequests.length, 1);
  ctx.result.assertions.push('All 16 records paginate correctly; keyword/status intersection; empty states; direct feature/docs links and snapshot freshness');
  ctx.result.assertions.push('Language switch preserves DOM identity, selected record, applied filters, and unsent keyword/status values');
  ctx.result.assertions.push('Hostile query text is literal and creates no image, script execution, or extra snapshot fetch');
}

function measureStepInBrowser() {
  var active = document.querySelector('[data-present-step].is-active');
  var rect = active.getBoundingClientRect();
  var previous = document.querySelector('[data-present-prev]').getBoundingClientRect();
  var next = document.querySelector('[data-present-next]').getBoundingClientRect();
  var style = getComputedStyle(active);
  var safeTop = parseFloat(style.paddingTop);
  var safeBottom = innerHeight - parseFloat(style.paddingBottom);
  var boxes = [];
  var walker = document.createTreeWalker(active, NodeFilter.SHOW_TEXT);
  var node;
  var range;
  function painted(element) {
    var current = element;
    var css;
    if (element.closest('.topbar,.present-launch-panel,.present-style-panel,.share-menu,.share-wechat-panel,.narration-settings-panel')) return false;
    while (current) {
      css = getComputedStyle(current);
      if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) < 0.05) return false;
      if (current === active) break;
      current = current.parentElement;
    }
    return true;
  }
  function add(box, element) {
    if (!box.width || !box.height) return;
    boxes.push({ top: box.top, bottom: box.bottom, left: box.left, right: box.right, tag: element.tagName, class: element.className, id: element.id });
  }
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim() || !painted(node.parentElement)) continue;
    range = document.createRange();
    range.selectNodeContents(node);
    Array.from(range.getClientRects()).forEach(function (box) { add(box, node.parentElement); });
  }
  Array.from(active.querySelectorAll('input,select,button,img,.comparison-card,.hero-panel,.metric,.quote-block')).forEach(function (element) {
    if (painted(element)) add(element.getBoundingClientRect(), element);
  });
  return { id: active.id || active.getAttribute('data-step-title'), title: document.querySelector('[data-present-deck-title]').textContent,
    label: document.querySelector('[data-present-deck-label]').textContent, left: rect.left, right: rect.right,
    prevRight: previous.right, nextLeft: next.left, scrollHeight: active.scrollHeight, clientHeight: active.clientHeight,
    scrollWidth: active.scrollWidth, clientWidth: active.clientWidth, safeTop: safeTop, safeBottom: safeBottom,
    minTop: boxes.length ? Math.min.apply(null, boxes.map(function (box) { return box.top; })) : 0,
    maxBottom: boxes.length ? Math.max.apply(null, boxes.map(function (box) { return box.bottom; })) : 0,
    outside: boxes.filter(function (box) { return box.top < safeTop - 2 || box.bottom > safeBottom + 2; }).slice(0, 10),
    bg: style.backgroundColor, border: style.borderTopWidth, radius: style.borderRadius, shadow: style.boxShadow };
}

async function deck(ctx) {
  var count;
  var steps = [];
  var index;
  var geometry;
  var before;
  await ctx.evaluate('document.getElementById("roadmap-reset").click();document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();');
  await ctx.waitFor('document.documentElement.classList.contains("is-presentation-mode")', 'presentation start');
  await ctx.evaluate('document.querySelector(".present-counter-button").click()');
  count = await ctx.evaluate('document.querySelectorAll(".present-page-menu-item").length');
  assert.ok(count >= 20, 'Complete deck must contain all sections');
  ctx.result.deckCount = count;
  for (index = 0; index < count; index++) {
    await ctx.evaluate('document.querySelectorAll(".present-page-menu-item")[' + index + '].click()');
    await ctx.waitFor('Number(getComputedStyle(document.querySelector("[data-present-step].is-active")).opacity)>=.999', 'settled slide animation');
    geometry = await ctx.evaluate('(' + measureStepInBrowser.toString() + ')()');
    if (index === 0) await ctx.screenshot('deck-hero', '.hero', 1080);
    geometry.index = index;
    assert.ok(geometry.left >= geometry.prevRight - 1 && geometry.right <= geometry.nextLeft + 1, 'Horizontal safe area: ' + JSON.stringify(geometry));
    assert.ok(geometry.scrollHeight <= geometry.clientHeight + 2 && geometry.scrollWidth <= geometry.clientWidth + 2, 'Slide overflow: ' + JSON.stringify(geometry));
    if (index < count - 1) {
      assert.ok(geometry.minTop >= geometry.safeTop - 2 && geometry.maxBottom <= geometry.safeBottom + 2, 'Vertical safe area: ' + JSON.stringify(geometry));
      assert.ok(geometry.title.length > 0 && geometry.label.length > 0, 'Missing title/label');
      if (ctx.result.lang === 'en') assert.ok(!/[\u3400-\u9fff]/.test(geometry.title + geometry.label), 'Untranslated deck metadata: ' + JSON.stringify(geometry));
    }
    if (['roadmap-workspace', 'roadmap-detail-panel', 'roadmap-constraints-panel'].indexOf(geometry.id) >= 0) {
      assert.equal(geometry.bg, 'rgba(0, 0, 0, 0)'); assert.equal(geometry.border, '0px'); assert.equal(geometry.radius, '0px'); assert.equal(geometry.shadow, 'none');
      await ctx.screenshot('deck-' + geometry.id, '#' + geometry.id, 1080);
    }
    steps.push(geometry);
  }
  ctx.result.deckGeometry = steps;
  await ctx.evaluate('document.querySelector("[data-present-exit]").click()');
  await ctx.waitFor('!document.documentElement.classList.contains("is-presentation-mode")', 'presentation exit');
  assert.equal(ctx.result.snapshotRequests.length, 1);
  ctx.result.assertions.push('Full deck page-menu navigation, bilingual floating titles/labels, no overflow, horizontal/vertical safe areas, unframed query roots, and no background refresh');
  before = await ctx.evaluate('document.getElementById("roadmap-detail-title").textContent');
  await ctx.evaluate('document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();document.querySelector(".topbar-lang-toggle").click();');
  await delay(50);
  assert.equal(await ctx.evaluate('document.getElementById("roadmap-detail-title").textContent'), before);
  await ctx.evaluate('document.querySelector(".present-counter-button").click();Array.from(document.querySelectorAll(".present-page-menu-item")).find(function(e){return /Search the Snapshot|搜索快照/.test(e.textContent);}).click()');
  await ctx.waitFor('document.getElementById("roadmap-detail-title").textContent!==' + JSON.stringify(before), 'deferred query language render');
  await ctx.evaluate('document.querySelector("[data-present-exit]").click();document.querySelector(".topbar-lang-toggle").click();');
  ctx.result.assertions.push('Hidden query work is deferred during a hero-slide language change and resumes only when a query step becomes active');
}

async function runReferencesOnly() {
  var modes = [['zh', 'light', 1920, 1080], ['en', 'dark', 1920, 1080], ['zh', 'light', 320, 900], ['en', 'dark', 320, 900]];
  var index;
  var ctx;
  fs.mkdirSync(OUT, { recursive: true });
  await startServer(); browser = await startChrome();
  for (index = 0; index < modes.length; index++) {
    ctx = await context('reference-' + modes[index].join('-'), modes[index][0], modes[index][1], modes[index][2], modes[index][3], null, false);
    await citations(ctx);
    if (modes[index][2] > 480) await presentationCitations(ctx);
    await readingScan(ctx);
    assert.deepEqual(ctx.result.runtimeErrors, []); assert.deepEqual(ctx.result.consoleErrors, []);
    assert.equal(ctx.result.snapshotRequests.length, 1);
    await ctx.close();
  }
  await directHashChecks();
  assert.equal(report.modelPosts, 0);
  report.ok = true;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, scenarios: report.scenarios.length, modelPosts: report.modelPosts, report: path.relative(ROOT, path.join(OUT, 'report.json')) }, null, 2));
}

async function runConsoleProbe() {
  var modes = process.argv.indexOf('--mobile-only') >= 0 ? [['en', 'dark', 320, 900]] : [['zh', 'light', 1920, 1080], ['en', 'dark', 1920, 1080], ['en', 'dark', 320, 900]];
  var index;
  var ctx;
  var pages;
  var page;
  var ratios;
  fs.mkdirSync(OUT, { recursive: true });
  await startServer(); browser = await startChrome();
  for (index = 0; index < modes.length; index++) {
    ctx = await context('console-' + modes[index].join('-'), modes[index][0], modes[index][1], modes[index][2], modes[index][3], null, index === 0);
    await ctx.waitFor('document.querySelectorAll("#roadmap-results [data-record-id]").length===4', 'console-probe snapshot');
    if (index === 0) await ctx.evaluate('document.querySelector(".assistant-fab").click();document.querySelector(".assistant-close").click()');
    if (modes[index][2] > 480) {
      await ctx.evaluate('document.querySelector(".present-toggle").click();document.querySelector(".launch-play-btn").click();document.querySelector(".present-counter-button").click()');
      pages = await ctx.evaluate('document.querySelectorAll(".present-page-menu-item").length');
      for (page = 0; page < pages; page++) { await ctx.evaluate('document.querySelectorAll(".present-page-menu-item")[' + page + '].click()'); await delay(35); }
      await ctx.evaluate('document.querySelector("[data-present-exit]").click()');
      ctx.result.assertions.push('Console API error probe across all ' + pages + ' native deck transitions; geometry already verified in the primary matrix');
    } else {
      await citations(ctx);
      await ctx.evaluate('Array.from(document.querySelectorAll("[data-accordion]")).forEach(function(a){a.classList.add("is-open");var c=a.querySelector(".subsection-content");c.style.maxHeight="none";c.style.overflow="visible";});');
      await readingScan(ctx);
      for (page = 0; page < Object.keys(require('../roadmap-query.js').STATUS).length; page++) {
        await search(ctx, '', Object.keys(require('../roadmap-query.js').STATUS)[page]);
        ratios = await ctx.evaluate('(function(){function lum(c){var rgb=c.match(/[\\d.]+/g).slice(0,3).map(function(x){var v=Number(x)/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}return Array.from(document.querySelectorAll("#query .comparison-label[class*=roadmap-status]")).map(function(e){var s=getComputedStyle(e),a=lum(s.color),b=lum(s.backgroundColor);return {label:e.textContent,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});}())');
        ratios.forEach(function (item) { assert.ok(item.ratio >= 4.5, JSON.stringify(item)); });
        ctx.result.darkBadgeContrast = (ctx.result.darkBadgeContrast || []).concat(ratios);
      }
      await ctx.evaluate('document.getElementById("roadmap-reset").click()');
      assert.deepEqual(await ctx.evaluate('(function(){var found=[];var walker=document.createTreeWalker(document.querySelector("main"),NodeFilter.SHOW_TEXT),n;while(n=walker.nextNode()){if(!/[\\u3400-\\u9fff]/.test(n.textContent))continue;var r=document.createRange();r.selectNodeContents(n);if(r.getClientRects().length)found.push(n.textContent.trim());}return found;}())'), []);
      await ctx.screenshot('reading', '#roadmap-workspace', 2200);
      ctx.result.assertions.push('English dark 320px reading; all six normalized status badge colors meet 4.5:1; no visible Chinese body residue');
    }
    await delay(100);
    assert.deepEqual(ctx.result.runtimeErrors, []);
    assert.deepEqual(ctx.result.consoleErrors, []);
    assert.equal(ctx.result.snapshotRequests.length, 1);
    ctx.result.assertions.push('Zero runtime exceptions, zero console.error calls, one local snapshot fetch, no model POSTs');
    await ctx.close();
  }
  assert.equal(report.modelPosts, 0);
  report.ok = true;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, scenarios: report.scenarios.length, modelPosts: report.modelPosts, report: path.relative(ROOT, path.join(OUT, 'report.json')) }, null, 2));
}

async function run() {
  var zh;
  var en;
  var mobile;
  var hostile;
  var error;
  var contrast;
  var resumeMobile = process.argv.indexOf('--resume-mobile') >= 0;
  var prior;
  if (process.argv.indexOf('--probe-console') >= 0) { await runConsoleProbe(); return; }
  if (process.argv.indexOf('--references-only') >= 0) { await runReferencesOnly(); return; }
  if (process.argv.indexOf('--citation-only') >= 0) {
    fs.mkdirSync(OUT, { recursive: true });
    await startServer(); browser = await startChrome();
    en = await context('citation-en-dark-320', 'en', 'dark', 320, 900, null, false);
    await citations(en);
    assert.deepEqual(en.result.runtimeErrors, []); assert.deepEqual(en.result.consoleErrors, []);
    await en.close();
    report.ok = true;
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ ok: true, report: path.relative(ROOT, path.join(OUT, 'report.json')) }, null, 2));
    return;
  }
  if (process.argv.indexOf('--print-only') >= 0) {
    fs.mkdirSync(OUT, { recursive: true });
    await startServer(); browser = await startChrome();
    await browserPrintCheck();
    report.ok = true;
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ ok: true, print: report.scenarios[0].print, report: path.relative(ROOT, path.join(OUT, 'report.json')) }, null, 2));
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  if (resumeMobile) {
    prior = JSON.parse(fs.readFileSync(path.join(OUT, 'report.json'), 'utf8'));
    report.scenarios = prior.scenarios.filter(function (item) { return item.name === 'zh-light-desktop' || item.name === 'en-dark-desktop'; });
    assert.equal(report.scenarios.length, 2, 'Resume requires two real desktop reports');
    report.scenarios.forEach(function (item) { assert.equal(item.deckGeometry.length, item.deckCount); assert.deepEqual(item.runtimeErrors, []); });
    assert.equal(prior.modelPosts, 0);
    report.blockedAssets = prior.blockedAssets;
    report.resumeNote = 'Retained the already completed desktop matrices; resumed mobile and remaining hostile/error fixtures after a mobile-only code-wrapping CSS fix.';
  }
  assert.ok(fs.existsSync(CHROME), 'Chrome is required; no browser dependency is installed by this test');
  await startServer(); browser = await startChrome();
  if (!resumeMobile) {
  zh = await context('zh-light-desktop', 'zh', 'light', 1920, 1080, null, true);
  await interactive(zh);
  await citations(zh);
  await readingScan(zh);
  await zh.screenshot('sources', '#sources', 1600);
  await zh.screenshot('query', '#roadmap-workspace', 1600);
  await zh.evaluate('document.querySelector(".assistant-fab").click();document.querySelector(".assistant-input").value="TEST ONLY unsent assistant draft";');
  assert.equal(await zh.evaluate('document.querySelector(".assistant-dialog").classList.contains("is-open")'), true);
  await zh.evaluate('document.querySelector(".assistant-close").click()');
  zh.result.assertions.push('Mandatory shared assistant opens with loopback-only mock settings; an unsent draft makes zero model POSTs');
  await deck(zh);
  await recordDatesAndGeometry(zh);
  await presentationCitations(zh);
  assert.deepEqual(zh.result.runtimeErrors, []);
  assert.deepEqual(zh.result.consoleErrors, []);
  await zh.close();
  en = await context('en-dark-desktop', 'en', 'dark', 1920, 1080, null, false);
  await interactive(en); await citations(en); await readingScan(en);
  await en.screenshot('query', '#roadmap-workspace', 1600);
  await en.screenshot('detail', '#roadmap-detail-panel', 1600);
  contrast = await en.evaluate('(function(){function lum(c){var rgb=c.match(/[\\d.]+/g).slice(0,3).map(function(x){var v=Number(x)/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}return Array.from(document.querySelectorAll("#query .comparison-label[class*=roadmap-status]")).map(function(e){var s=getComputedStyle(e),a=lum(s.color),b=lum(s.backgroundColor);return {label:e.textContent,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});}())');
  contrast.forEach(function (item) { assert.ok(item.ratio >= 4.5, JSON.stringify(item)); });
  en.result.darkBadgeContrast = contrast;
  en.result.assertions.push('Article-specific dark status badges meet 4.5:1 text contrast');
  await deck(en); await recordDatesAndGeometry(en); await presentationCitations(en); assert.deepEqual(en.result.runtimeErrors, []); assert.deepEqual(en.result.consoleErrors, []); await en.close();
  }
  mobile = await context('zh-light-320', 'zh', 'light', 320, 900, null, false);
  await interactive(mobile);
  await citations(mobile);
  await mobile.evaluate('Array.from(document.querySelectorAll("[data-accordion]")).forEach(function(a){a.classList.add("is-open");var c=a.querySelector(".subsection-content");c.style.maxHeight="none";c.style.overflow="visible";});');
  await readingScan(mobile);
  await mobile.screenshot('sources', '#sources', 1800);
  await mobile.screenshot('query', '#roadmap-workspace', 2200);
  await mobile.screenshot('detail', '#roadmap-detail-panel', 1800);
  await mobile.evaluate('document.querySelector(".topbar-lang-toggle").click()');
  await readingScan(mobile);
  await mobile.screenshot('english-query', '#roadmap-workspace', 2200);
  assert.deepEqual(mobile.result.runtimeErrors, []); await mobile.close();
  hostile = await context('hostile-data', 'en', 'dark', 1280, 900, 'hostile', false);
  await hostile.waitFor('document.querySelectorAll("#roadmap-results [data-record-id]").length===4', 'hostile fixture');
  await search(hostile, 'TEST ONLY <img src=x onerror=window.__roadmapAttack=1>', 'all');
  assert.match(await hostile.evaluate('document.getElementById("roadmap-detail-title").textContent'), /<img/);
  assert.match(await hostile.evaluate('document.getElementById("roadmap-official-title").textContent'), /<script>/);
  assert.equal(await hostile.evaluate('document.querySelectorAll("#query img,#query script,#query a[href^=javascript]").length'), 0);
  assert.equal(await hostile.evaluate('typeof window.__roadmapAttack'), 'undefined');
  assert.equal(await hostile.evaluate('document.querySelector("#roadmap-primary-link a")===null'), true);
  hostile.result.assertions.push('Mock imported HTML/script-like titles remain plain text; javascript URL is suppressed; no execution');
  assert.deepEqual(hostile.result.runtimeErrors, []); await hostile.close();
  error = await context('snapshot-error', 'en', 'light', 1280, 900, 'error', false);
  await error.waitFor('document.getElementById("roadmap-retry").hidden===false', 'visible snapshot failure');
  assert.match(await error.evaluate('document.getElementById("roadmap-load-status").textContent'), /could not be loaded/);
  assert.equal(await error.evaluate('document.querySelector("#roadmap-query-form button[type=submit]").disabled'), true);
  await error.evaluate('document.getElementById("roadmap-retry").click()');
  await error.waitFor('document.querySelectorAll("#roadmap-results [data-record-id]").length===4', 'manual snapshot retry');
  assert.equal(error.result.snapshotRequests.length, 2);
  error.result.assertions.push('503 snapshot error is visible, search disabled, and only explicit Retry fetches again');
  assert.deepEqual(error.result.runtimeErrors, []); await error.close();
  await directHashChecks();
  await browserPrintCheck();
  assert.equal(report.modelPosts, 0);
  report.ok = true;
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, scenarios: report.scenarios.length, decks: report.scenarios.filter(function (item) { return item.deckCount; }).map(function (item) { return { name: item.name, pages: item.deckCount }; }), modelPosts: report.modelPosts, report: path.relative(ROOT, path.join(OUT, 'report.json')) }, null, 2));
}

run().catch(function (error) {
  report.ok = false; report.failure = error.stack || String(error);
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.error(error.stack || error); process.exitCode = 1;
}).finally(async function () {
  if (browser) browser.close();
  if (chrome && chrome.exitCode === null) {
    await new Promise(function (resolve) {
      var timer = setTimeout(function () { if (chrome.exitCode === null) chrome.kill('SIGKILL'); resolve(); }, 4000);
      chrome.once('exit', function () { clearTimeout(timer); resolve(); });
      chrome.kill('SIGTERM');
    });
  }
  if (server) await new Promise(function (resolve) { server.close(resolve); });
  if (profile) fs.rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
});

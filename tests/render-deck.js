#!/usr/bin/env node
// ==========================================================
// Knowledge Hub — Deck Export Visual Self-Check
// ==========================================================
// Exports an article's presentation deck to .pptx through the real
// browser pipeline (assets/pptx-export.js), then renders every slide to
// PNG so the geometry replay can be inspected visually.
//
// Run:
//   node tests/render-deck.js --article <slug>
//   node tests/render-deck.js --article <slug> --lang en --theme dark
//   node tests/render-deck.js --article <slug> --keep-pptx
//   node tests/render-deck.js --pptx path/to/deck.pptx   # render only
//
// Output lands in tmp/deck-render/<slug>/ as slide-01.png, slide-02.png…
// Exit 0 = rendered (or degraded cleanly), exit 1 = pipeline failure.
//
// Requirements:
//   - Chrome/Chromium (auto-detected: Playwright cache, Chrome, Edge, Brave)
//   - soffice (LibreOffice) for .pptx -> .pdf
//   - pdftoppm or pdftocairo (poppler) for .pdf -> .png
// Missing soffice/poppler degrades to {"rendered": false, "missing": [...]}
// with exit 0 — the .pptx is still produced and reported.

'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var os = require('os');
var childProcess = require('child_process');

var ROOT = path.resolve(__dirname, '..');
var OUT_ROOT = path.join(ROOT, 'tmp', 'deck-render');

// ───────────────────────── CLI ─────────────────────────

function parseArgs(argv) {
  var out = { lang: 'zh', theme: 'light', keepPptx: false, json: false, port: 0 };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a === '--article') out.article = argv[++i];
    else if (a === '--pptx') out.pptx = argv[++i];
    else if (a === '--lang') out.lang = argv[++i];
    else if (a === '--theme') out.theme = argv[++i];
    else if (a === '--outdir') out.outdir = argv[++i];
    else if (a === '--keep-pptx') out.keepPptx = true;
    else if (a === '--json') out.json = true;
    else if (a === '--timeout') out.timeout = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

var USAGE = [
  'Usage:',
  '  node tests/render-deck.js --article <slug> [--lang zh|en] [--theme light|dark]',
  '  node tests/render-deck.js --pptx <file.pptx> [--outdir <dir>]',
  '',
  'Options:',
  '  --article <slug>   Article directory under posts/ to export and render',
  '  --pptx <file>      Skip export; render an existing .pptx',
  '  --lang zh|en       Presentation language (default zh)',
  '  --theme light|dark Colour scheme (default light)',
  '  --outdir <dir>     Output directory (default tmp/deck-render/<slug>)',
  '  --keep-pptx        Keep the exported .pptx next to the PNGs',
  '  --timeout <ms>     Export timeout (default 180000)',
  '  --json             Emit machine-readable JSON only'
].join('\n');

// ─────────────────────── utilities ───────────────────────

function which(bin) {
  try {
    return childProcess.execSync('command -v ' + bin + ' 2>/dev/null', {
      encoding: 'utf8', shell: '/bin/sh'
    }).trim() || null;
  } catch (e) { return null; }
}

function firstExisting(candidates) {
  for (var i = 0; i < candidates.length; i++) {
    try { if (fs.existsSync(candidates[i])) return candidates[i]; } catch (e) {}
  }
  return null;
}

// LibreOffice ships as an .app bundle on macOS and is not on PATH.
function findSoffice() {
  return which('soffice') || firstExisting([
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    path.join(os.homedir(), 'Applications/LibreOffice.app/Contents/MacOS/soffice'),
    '/opt/homebrew/bin/soffice',
    '/usr/local/bin/soffice',
    '/usr/bin/soffice'
  ]);
}

// Prefer Playwright's cached headless shell; fall back to installed browsers.
function findChrome() {
  var cacheRoot = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  var linuxCache = path.join(os.homedir(), '.cache/ms-playwright');
  var roots = [cacheRoot, linuxCache].filter(function (d) {
    try { return fs.existsSync(d); } catch (e) { return false; }
  });
  var found = [];
  roots.forEach(function (root) {
    fs.readdirSync(root).forEach(function (entry) {
      if (!/^chromium/.test(entry)) return;
      var rel = [
        'chrome-headless-shell-mac-arm64/chrome-headless-shell',
        'chrome-headless-shell-mac-x64/chrome-headless-shell',
        'chrome-headless-shell-linux/chrome-headless-shell',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux/chrome'
      ];
      rel.forEach(function (r) {
        var p = path.join(root, entry, r);
        try { if (fs.existsSync(p)) found.push({ entry: entry, path: p }); } catch (e) {}
      });
    });
  });
  if (found.length) {
    // Highest build number wins.
    found.sort(function (a, b) {
      var na = parseInt((a.entry.match(/(\d+)$/) || [0, 0])[1], 10);
      var nb = parseInt((b.entry.match(/(\d+)$/) || [0, 0])[1], 10);
      return nb - na;
    });
    return found[0].path;
  }
  return firstExisting([
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ]) || which('google-chrome') || which('chromium');
}

function rmrf(target) {
  try { fs.rmSync(target, { recursive: true, force: true }); } catch (e) {}
}

function fail(message) {
  process.stderr.write('FAIL  ' + message + '\n');
  process.exit(1);
}

// ─────────────────── static file server ───────────────────
// The deck pipeline loads assets/*.js by URL, so file:// will not do.

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4'
};

function startServer() {
  return new Promise(function (resolve, reject) {
    var server = http.createServer(function (req, res) {
      var rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel === '/') rel = '/index.html';
      var target = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
      if (target.indexOf(ROOT) !== 0) { res.writeHead(403); res.end(); return; }
      fs.stat(target, function (err, stat) {
        if (err || !stat.isFile()) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
          'Content-Length': stat.size
        });
        fs.createReadStream(target).pipe(res);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', function () { resolve(server); });
  });
}

// ───────────────── minimal CDP client ─────────────────
// Avoids a Playwright/Puppeteer dependency: Node 22 has global WebSocket.

function cdpConnect(wsUrl) {
  return new Promise(function (resolve, reject) {
    var ws = new WebSocket(wsUrl);
    var nextId = 1;
    var pending = new Map();
    var listeners = [];
    ws.onopen = function () {
      resolve({
        send: function (method, params, sessionId) {
          var id = nextId++;
          var msg = { id: id, method: method, params: params || {} };
          if (sessionId) msg.sessionId = sessionId;
          ws.send(JSON.stringify(msg));
          return new Promise(function (res, rej) { pending.set(id, { res: res, rej: rej }); });
        },
        on: function (fn) { listeners.push(fn); },
        close: function () { try { ws.close(); } catch (e) {} }
      });
    };
    ws.onerror = function () { reject(new Error('CDP websocket error')); };
    ws.onmessage = function (event) {
      var msg;
      try { msg = JSON.parse(event.data); } catch (e) { return; }
      if (msg.id && pending.has(msg.id)) {
        var slot = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) slot.rej(new Error(msg.error.message || 'CDP error'));
        else slot.res(msg.result);
        return;
      }
      listeners.forEach(function (fn) { fn(msg); });
    };
  });
}

function waitForEndpoint(port, timeoutMs) {
  var deadline = Date.now() + (timeoutMs || 20000);
  return new Promise(function (resolve, reject) {
    (function attempt() {
      http.get({ host: '127.0.0.1', port: port, path: '/json/version' }, function (res) {
        var body = '';
        res.on('data', function (c) { body += c; });
        res.on('end', function () {
          try { resolve(JSON.parse(body).webSocketDebuggerUrl); }
          catch (e) { retry(); }
        });
      }).on('error', retry);
      function retry() {
        if (Date.now() > deadline) reject(new Error('Chrome DevTools endpoint never came up'));
        else setTimeout(attempt, 200);
      }
    })();
  });
}

// ─────────────── in-page export driver ───────────────
// Runs inside the article page. Clicks the real export button so the
// production code path is exercised, and intercepts the Blob that
// exportPresentationDeck() would have handed to a download anchor.

var EXPORT_DRIVER = function () {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error('export timed out in page')); }, 170000);
    var origCreate = URL.createObjectURL;
    var origClick = HTMLAnchorElement.prototype.click;

    // The export path swallows its real error into console.error and shows a
    // generic alert. Capture the console so the driver can report the cause.
    window.__deckExportErrors = [];
    var origErr = console.error;
    console.error = function () {
      try {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          parts.push(a && a.stack ? String(a.stack).split('\n').slice(0, 4).join(' ⏎ ')
                                  : (a && a.message) || String(a));
        }
        window.__deckExportErrors.push(parts.join(' '));
      } catch (e) {}
      return origErr.apply(console, arguments);
    };

    function cleanup() {
      clearTimeout(timer);
      URL.createObjectURL = origCreate;
      HTMLAnchorElement.prototype.click = origClick;
      console.error = origErr;
    }

    // Swallow the synthetic download click; keep the blob instead.
    var captured = null;
    URL.createObjectURL = function (blob) {
      captured = blob;
      return origCreate.call(URL, blob);
    };
    HTMLAnchorElement.prototype.click = function () {
      if (this.download && captured) {
        var blob = captured;
        cleanup();
        // Density findings are collected during the export we just drove.
        var density = [], skipped = [];
        try {
          if (window.StudyRoomPptxExport && window.StudyRoomPptxExport.getOverflowReports) {
            density = window.StudyRoomPptxExport.getOverflowReports();
          }
          if (window.StudyRoomPptxExport && window.StudyRoomPptxExport.getSkippedImages) {
            skipped = window.StudyRoomPptxExport.getSkippedImages();
          }
        } catch (e) {}
        var reader = new FileReader();
        reader.onload = function () {
          var bytes = new Uint8Array(reader.result);
          var chunk = 0x8000;
          var parts = [];
          for (var i = 0; i < bytes.length; i += chunk) {
            parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
          }
          resolve({ base64: btoa(parts.join('')), bytes: bytes.length, density: density, skipped: skipped });
        };
        reader.onerror = function () { reject(new Error('blob read failed')); };
        reader.readAsArrayBuffer(blob);
        return;
      }
      return origClick.apply(this, arguments);
    };

    var alertOrig = window.alert;
    window.alert = function (m) {
      cleanup();
      // exportPresentationDeck() logs the real error then shows a generic
      // alert. Surface whatever the console captured so failures are
      // diagnosable instead of just "please retry".
      var detail = window.__deckExportErrors && window.__deckExportErrors.length
        ? ' | ' + window.__deckExportErrors.join(' || ')
        : '';
      reject(new Error('page alert: ' + m + detail));
    };

    var btn = document.querySelector('[data-share-export-ppt]');
    if (!btn) {
      // The share menu is built when presentation mode initialises; open it.
      var opener = document.querySelector('[data-share-toggle], .share-toggle, .article-share button');
      if (opener) { opener.click(); btn = document.querySelector('[data-share-export-ppt]'); }
    }
    if (!btn) { cleanup(); window.alert = alertOrig; reject(new Error('export control not found on page')); return; }
    btn.click();
  });
};

// ─────────────────────── steps ───────────────────────

function exportDeck(opts, log) {
  var chrome = findChrome();
  if (!chrome) fail('No Chrome/Chromium found. Install Chrome or run: npx playwright install chromium');
  log('browser  ' + chrome);

  var articleDir = path.join(ROOT, 'posts', opts.article);
  if (!fs.existsSync(path.join(articleDir, 'index.html'))) {
    fail('Article not found: posts/' + opts.article + '/index.html');
  }

  var userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-render-'));
  var server, proc, client;

  function shutdown() {
    if (client) client.close();
    if (proc) { try { proc.kill('SIGKILL'); } catch (e) {} }
    if (server) { try { server.close(); } catch (e) {} }
    rmrf(userDataDir);
  }

  return startServer().then(function (s) {
    server = s;
    var port = s.address().port;
    var url = 'http://127.0.0.1:' + port + '/posts/' + opts.article + '/index.html';
    log('serving  ' + url);

    proc = childProcess.spawn(chrome, [
      '--headless=new',
      '--remote-debugging-port=0',
      '--user-data-dir=' + userDataDir,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1920,1080',
      'about:blank'
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    // Chrome prints the chosen debug port on stderr when asked for port 0.
    return new Promise(function (resolve, reject) {
      var buf = '';
      var to = setTimeout(function () { reject(new Error('Chrome did not report a debug port')); }, 20000);
      proc.stderr.on('data', function (chunk) {
        buf += chunk.toString();
        var m = buf.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
        if (m) { clearTimeout(to); resolve({ port: parseInt(m[1], 10), url: url }); }
      });
      proc.on('exit', function (code) { clearTimeout(to); reject(new Error('Chrome exited early (code ' + code + ')')); });
    });
  }).then(function (ctx) {
    return waitForEndpoint(ctx.port, 20000).then(function (wsUrl) {
      return cdpConnect(wsUrl).then(function (c) { return { client: c, url: ctx.url }; });
    });
  }).then(function (ctx) {
    var browser = ctx.client;
    client = browser;
    return browser.send('Target.createTarget', { url: 'about:blank' }).then(function (t) {
      return browser.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
    }).then(function (att) {
      var sid = att.sessionId;
      function send(method, params) { return browser.send(method, params, sid); }

      return send('Page.enable')
        .then(function () { return send('Runtime.enable'); })
        .then(function () {
          return send('Emulation.setDeviceMetricsOverride', {
            width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false
          });
        })
        .then(function () {
          // Seed theme/language before any article script reads localStorage.
          return send('Page.addScriptToEvaluateOnNewDocument', {
            source: 'try{localStorage.setItem("study-room-theme",' + JSON.stringify(opts.theme) + ');' +
                    'localStorage.setItem("study-room-lang",' + JSON.stringify(opts.lang) + ');' +
                    'localStorage.setItem("theme",' + JSON.stringify(opts.theme) + ');' +
                    'localStorage.setItem("lang",' + JSON.stringify(opts.lang) + ');}catch(e){}'
          });
        })
        .then(function () {
          var loaded = new Promise(function (resolve) {
            browser.on(function (msg) {
              if (msg.sessionId === sid && msg.method === 'Page.loadEventFired') resolve();
            });
          });
          return send('Page.navigate', { url: ctx.url }).then(function () { return loaded; });
        })
        .then(function () {
          log('exporting deck (lang=' + opts.lang + ', theme=' + opts.theme + ')');
          // Settle fonts and lazy assets before geometry is read.
          return send('Runtime.evaluate', {
            expression: 'new Promise(r=>{ if(document.fonts&&document.fonts.ready){document.fonts.ready.then(()=>setTimeout(r,1200))}else{setTimeout(r,1500)} })',
            awaitPromise: true, returnByValue: true
          });
        })
        .then(function () {
          return send('Runtime.evaluate', {
            expression: '(' + EXPORT_DRIVER.toString() + ')()',
            awaitPromise: true,
            returnByValue: true,
            timeout: opts.timeout || 180000
          });
        })
        .then(function (res) {
          if (res.exceptionDetails) {
            var d = res.exceptionDetails;
            throw new Error('in-page export failed: ' +
              ((d.exception && (d.exception.description || d.exception.value)) || d.text));
          }
          var value = res.result && res.result.value;
          if (!value || !value.base64) throw new Error('export produced no blob');
          var buf = Buffer.from(value.base64, 'base64');
          buf.density = value.density || [];
          buf.skipped = value.skipped || [];
          return buf;
        });
    });
  }).then(function (buf) {
    shutdown();
    return buf;
  }, function (err) {
    shutdown();
    throw err;
  });
}

function renderPptx(pptxPath, outdir, log) {
  var soffice = findSoffice();
  var pdftoppm = which('pdftoppm');
  var pdftocairo = which('pdftocairo');
  var missing = [];
  if (!soffice) missing.push('soffice (LibreOffice)');
  if (!pdftoppm && !pdftocairo) missing.push('pdftoppm/pdftocairo (poppler)');
  if (missing.length) return { rendered: false, missing: missing, pptx: pptxPath };

  log('converting to pdf via ' + soffice);
  var profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lo-profile-'));
  try {
    childProcess.execFileSync(soffice, [
      '--headless', '--norestore',
      '-env:UserInstallation=file://' + profile,
      '--convert-to', 'pdf', '--outdir', outdir, pptxPath
    ], { stdio: 'pipe', timeout: 240000 });
  } catch (e) {
    rmrf(profile);
    var detail = (e.stderr && e.stderr.toString().trim()) || e.message;
    throw new Error('LibreOffice conversion failed: ' + detail);
  }
  rmrf(profile);

  var pdf = path.join(outdir, path.basename(pptxPath).replace(/\.pptx$/i, '.pdf'));
  if (!fs.existsSync(pdf)) throw new Error('LibreOffice produced no PDF at ' + pdf);

  log('splitting pdf into slide PNGs');
  var tool = pdftoppm || pdftocairo;
  childProcess.execFileSync(tool, ['-png', '-r', '110', pdf, path.join(outdir, 'slide')], {
    stdio: 'pipe', timeout: 240000
  });

  var pngs = fs.readdirSync(outdir)
    .filter(function (f) { return /^slide-?\d+\.png$/i.test(f); })
    .sort()
    .map(function (f) { return path.join(outdir, f); });

  return { rendered: true, pdf: pdf, slides: pngs, pptx: pptxPath };
}

// ───────────────────────── main ─────────────────────────

function main() {
  var opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.article && !opts.pptx)) {
    process.stdout.write(USAGE + '\n');
    process.exit(opts.help ? 0 : 1);
  }

  var quiet = opts.json;
  function log(msg) { if (!quiet) process.stdout.write('  ' + msg + '\n'); }

  var name = opts.article || path.basename(opts.pptx, '.pptx');
  var outdir = opts.outdir ? path.resolve(opts.outdir) : path.join(OUT_ROOT, name);
  rmrf(outdir);
  fs.mkdirSync(outdir, { recursive: true });

  if (!quiet) process.stdout.write('\nDeck render — ' + name + '\n');

  var density = [];
  var skipped = [];

  var step = opts.pptx
    ? Promise.resolve(path.resolve(opts.pptx))
    : exportDeck(opts, log).then(function (buf) {
        var target = path.join(outdir, name + '.pptx');
        fs.writeFileSync(target, buf);
        log('pptx     ' + (buf.length / 1024).toFixed(0) + ' KB');
        density = buf.density || [];
        skipped = buf.skipped || [];
        return target;
      });

  step.then(function (pptxPath) {
    var result = renderPptx(pptxPath, outdir, log);
    if (!opts.keepPptx && !opts.pptx && result.rendered) {
      // Keep it anyway when rendering degraded — it is the only artifact left.
      fs.unlinkSync(pptxPath);
      delete result.pptx;
    }
    result.outdir = outdir;
    result.density = density;
    result.skippedImages = skipped;

    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (result.rendered) {
      process.stdout.write('\n  PASS  ' + result.slides.length + ' slide(s) rendered\n');
      result.slides.forEach(function (p) { process.stdout.write('        ' + path.relative(ROOT, p) + '\n'); });
      if (density.length) {
        var sparse = density.filter(function (d) { return d.kind === 'sparse'; });
        var crowded = density.filter(function (d) { return d.kind === 'crowded'; });
        process.stdout.write('\n  DENSITY  ' + sparse.length + ' sparse, ' + crowded.length + ' crowded\n');
        density.forEach(function (d) {
          process.stdout.write('        [' + d.kind + ' ' + Math.round(d.fill * 100) + '%] ' +
            String(d.title).slice(0, 46) + '\n           → ' + d.hint + '\n');
        });
        process.stdout.write('\n  Density is reported, never auto-corrected: fix it in the article\n' +
                             '  (merge steps or add a visual element), not in the renderer.\n');
      }
      if (skipped.length) {
        process.stdout.write('\n  SKIPPED IMAGES  ' + skipped.length + '\n');
        skipped.forEach(function (s) {
          process.stdout.write('        ' + String(s.src).slice(0, 82) + '\n           → ' + s.reason + '\n');
        });
        process.stdout.write('\n  Cross-origin images cannot be embedded in a .pptx. Download them\n' +
                             '  into the article\'s media/ folder and reference them locally.\n');
      }
      process.stdout.write('\n  Review each PNG visually — geometry replay drops gradients,\n' +
                          '  shadows and pseudo-elements.\n\n');
    } else {
      process.stdout.write('\n  SKIP  rendering unavailable — missing: ' + result.missing.join(', ') + '\n');
      process.stdout.write('        pptx kept at ' + path.relative(ROOT, result.pptx) + '\n');
      process.stdout.write('        install with: brew install --cask libreoffice && brew install poppler\n\n');
    }
    process.exit(0);
  }).catch(function (err) {
    fail(err.message);
  });
}

main();

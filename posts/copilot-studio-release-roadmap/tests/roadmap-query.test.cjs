'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');
var root = path.resolve(__dirname, '..');
var query = require(path.join(root, 'roadmap-query.js'));
var snapshot = JSON.parse(fs.readFileSync(path.join(root, 'snapshot.json'), 'utf8'));
var evidence = JSON.parse(fs.readFileSync(path.join(root, 'evidence.json'), 'utf8'));
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var script = fs.readFileSync(path.join(root, 'roadmap-query.js'), 'utf8');

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function ids(records) { return records.map(function (record) { return record.id; }); }

test('snapshot schema and selected-record denominators are explicit', function () {
  assert.equal(query.validateSnapshot(snapshot), snapshot);
  assert.equal(snapshot.records.length, 16);
  assert.equal(snapshot.records.filter(function (record) { return record.kind === 'roadmap'; }).length, 12);
  assert.equal(snapshot.records.filter(function (record) { return record.kind === 'release-notice'; }).length, 3);
  assert.equal(snapshot.records.filter(function (record) { return record.kind === 'archived-plan'; }).length, 1);
  assert.match(snapshot.scope.en, /not an exhaustive/i);
  assert.match(snapshot.limitations.en, /No customer environment was checked/);
});

test('each roadmap record matches the fetched official title, state, date, and RSS link', function () {
  snapshot.records.filter(function (record) { return record.kind === 'roadmap'; }).forEach(function (record) {
    var original = evidence.roadmapRecords.find(function (item) { return item.id === record.roadmapId; });
    assert.ok(original);
    assert.equal(record.officialTitle, original.title);
    assert.equal(record.originalStatus, original.status);
    assert.equal(record.planPreview, original.preview);
    assert.equal(record.planGA, original.ga);
    assert.equal(record.primaryUrl, original.url);
    assert.equal(record.roadmapModifiedAt, original.modified);
    assert.equal(Object.prototype.hasOwnProperty.call(record, 'learnMsDate'), false);
    assert.deepEqual(record.originalPhases, original.phases);
    assert.deepEqual(record.originalClouds, original.clouds);
    assert.deepEqual(record.originalPlatforms, original.platforms);
  });
});

test('all capability claims and UI sources resolve to retrieved official evidence', function () {
  snapshot.sources.forEach(function (source) {
    var original = evidence.sources.find(function (item) { return item.id === source.id; });
    assert.ok(original);
    assert.equal(source.url, original.url);
    assert.equal(source.verifiedOn, original.retrievedOn);
    assert.equal(original.httpStatus, 200);
    assert.ok(query.officialURL(source.url));
    assert.ok(html.indexOf('id="ref-' + source.ref + '"') >= 0);
  });
  snapshot.records.forEach(function (record) {
    assert.ok(record.statusSourceIds.length > 0);
    assert.ok(record.summarySourceIds.length > 0);
    assert.ok(record.release.sourceIds.length > 0);
    assert.ok(record.constraints.length > 0);
    record.constraints.forEach(function (constraint) { assert.ok(constraint.sourceIds.length > 0); });
  });
});

test('Learn ms.date provenance is distinct from roadmap modified, notice months, and verification', function () {
  var examples = {
    'computer-use-standard': ['s09', '2026-10-20'],
    'evaluation-rest-preview': ['s14', '2026-05-13'],
    'github-harness-preview': ['s11', '2026-10-19'],
    'ip-firewall-plan': ['s08', '2026-04-06']
  };
  assert.equal(snapshot.schemaVersion, 2);
  assert.match(snapshot.dateFieldNote.en, /UTC date portion of ms.date/);
  assert.match(snapshot.dateFieldNote.en, /not the footer's Last updated/);
  assert.match(evidence.dateFieldNote, /neither that footer date nor updated_at is collected/);
  evidence.sources.filter(function (source) { return source.url.indexOf('https://learn.microsoft.com/') === 0; }).forEach(function (source) {
    var projected = snapshot.sources.find(function (item) { return item.id === source.id; });
    assert.match(source.learnMsDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(Object.prototype.hasOwnProperty.call(source, 'documentUpdatedOn'), false);
    assert.equal(projected.learnMsDate, source.learnMsDate);
  });
  Object.keys(examples).forEach(function (id) {
    var record = snapshot.records.find(function (item) { return item.id === id; });
    assert.equal(record.learnMsDateSourceId, examples[id][0]);
    assert.equal(record.learnMsDate, examples[id][1]);
    assert.equal(Object.prototype.hasOwnProperty.call(record, 'roadmapModifiedAt'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(record, 'sourceModifiedAt'), false);
    assert.equal(record.verifiedOn, '2026-11-09');
  });
  assert.ok(!/docUpdated|Related guidance updated|关联文档更新时间/.test(script));
  assert.match(script, /Microsoft Learn ms.date \(metadata date, not a release date\)/);
  ['learnMsDateSourceId', 'learnMsDate'].forEach(function (key) {
    var bad = copy(snapshot);
    bad.records[1][key] = key === 'learnMsDate' ? '2026-04-09' : 's08';
    assert.throws(function () { query.validateSnapshot(bad); });
  });
  var old = copy(snapshot);
  old.schemaVersion = 1;
  assert.throws(function () { query.validateSnapshot(old); });
});

test('dynamic citation links follow the shared sup/cite-link/data-ref contract', function () {
  function element(tag) {
    return { tagName: tag, children: [], attributes: {}, appendChild: function (child) { this.children.push(child); }, setAttribute: function (key, value) { this.attributes[key] = value; } };
  }
  var documentFixture = { createElement: element, createTextNode: function (text) { return { textContent: text }; } };
  var parent = element('p');
  query.appendCitationLinks(documentFixture, parent, [{ ref: 3, title: '<script>literal title</script>' }, { ref: 4, title: 'RSS' }]);
  var group = parent.children[1];
  assert.equal(group.tagName, 'sup');
  assert.equal(group.className, 'cite');
  assert.equal(group.children[0].className, 'cite-link');
  assert.equal(group.children[0].attributes['data-ref'], '3');
  assert.equal(group.children[0].href, '#ref-3');
  assert.equal(group.children[0].textContent, '3');
  assert.equal(group.children[0].title, '<script>literal title</script>');
  assert.equal(group.children[1].className, 'cite-sep');
  assert.equal(group.children[2].attributes['data-ref'], '4');
});

test('reference bridge only accepts real numeric source hashes and reuses native controls', function () {
  assert.equal(query.referenceIdFromHash('#ref-1'), 'ref-1');
  assert.equal(query.referenceIdFromHash('#ref-3'), 'ref-3');
  ['#query', '#ref-0', '#ref-001', '#ref-<script>', 'javascript:alert(1)', '#ref-999', null].forEach(function (hash) { assert.equal(query.referenceIdFromHash(hash), null); });
  assert.match(script, /toggle\.click\(\)/);
  assert.match(script, /exit\.click\(\)/);
  assert.match(script, /addEventListener\('hashchange', replayHash\)/);
  assert.match(script, /classList\.contains\('is-open'\)/);
  assert.ok(!/classList\.(?:add|remove|toggle)\('is-open'/.test(script));
  assert.ok(!/setAttribute\('aria-(?:expanded|hidden)'/.test(script));
  assert.ok(!/scrollIntoView/.test(script));
  assert.match(html, /class="subsection-accordion" data-allow-multiple/);
});

test('editorial prepositions and same-title distinct-ID wording are accurate without recasing official titles', function () {
  assert.ok(!/Duplicate IDs|duplicate IDs|重复\s*ID/.test(html + snapshot.scope.zh + snapshot.scope.en + evidence.limitations.join(' ')));
  assert.match(snapshot.scope.zh, /同名但 ID 不同/);
  assert.match(snapshot.scope.en, /Same-title records with distinct IDs/);
  assert.match(html, /data-en="Verify Scope before Release Status"/);
  assert.match(html, /data-en="Resolve Scope before Interpreting Conflicting States"/);
  assert.match(html, /data-en="Recheck Records and Conditions before the Decision"/);
  assert.equal(snapshot.records.find(function (record) { return record.roadmapId === 569475; }).title.en, 'Agent Sharing between Makers');
  var roadmapIds = snapshot.records.filter(function (record) { return record.kind === 'roadmap'; }).map(function (record) { return record.roadmapId; });
  assert.equal(new Set(roadmapIds).size, 12);
  snapshot.records.filter(function (record) { return record.kind === 'roadmap'; }).forEach(function (record) {
    assert.equal(record.officialTitle, evidence.roadmapRecords.find(function (item) { return item.id === record.roadmapId; }).title);
  });
});

test('Chinese PPT is visibly outside accepted delivery and browser printing has a bounded reading-copy link', function () {
  assert.match(html, /id="roadmap-export-limit" class="quote-block" data-present-step/);
  assert.match(html, /data-step-title-en="Web Delivery and Export Limits"/);
  assert.match(html, /交付范围为网页和查询/);
  assert.match(html, /Chinese font rendering in this machine's PPT conversion has not passed/);
  assert.match(html, /Results in other browsers or configurations are not guaranteed/);
  assert.match(html, /href="\?draft=1&amp;lang=zh&amp;theme=light"/);
});

test('past target dates do not change official release state', function () {
  var development = query.filterRecords(snapshot.records, '', 'development');
  var sensitive = development.find(function (record) { return record.roadmapId === 571305; });
  var dataverse = development.find(function (record) { return record.roadmapId === 568929; });
  assert.equal(sensitive.planGA, '2026-10');
  assert.equal(sensitive.release.originalLabel, null);
  assert.equal(dataverse.planGA, '2026-09');
  assert.equal(dataverse.originalStatus, 'In development');
  assert.equal(query.filterRecords(snapshot.records, '568929', 'launched').length, 0);
});

test('same-title roadmap records retain their distinct IDs and conflicting statuses', function () {
  var first = snapshot.records.find(function (record) { return record.roadmapId === 562222; });
  var second = snapshot.records.find(function (record) { return record.roadmapId === 566998; });
  assert.equal(first.officialTitle, second.officialTitle);
  assert.equal(first.originalStatus, 'In development');
  assert.equal(second.originalStatus, 'Launched');
  assert.deepEqual(first.relatedIds, [second.id]);
  assert.deepEqual(second.relatedIds, [first.id]);
  assert.ok(ids(query.filterRecords(snapshot.records, 'agent node', 'all')).indexOf(first.id) >= 0);
  assert.ok(ids(query.filterRecords(snapshot.records, 'agent node', 'all')).indexOf(second.id) >= 0);
});

test('withdrawn item does not cancel standard-harness Computer use', function () {
  var withdrawn = query.filterRecords(snapshot.records, '', 'cancelled');
  var current = query.filterRecords(snapshot.records, '', 'ga-notice');
  assert.equal(withdrawn.length, 1);
  assert.equal(withdrawn[0].roadmapId, 562220);
  assert.match(withdrawn[0].release.summary.en, /no longer accurate and will be removed/);
  assert.equal(current.length, 1);
  assert.equal(current[0].id, 'computer-use-standard');
  assert.equal(current[0].release.period, 'May 2026');
  assert.match(withdrawn[0].release.summary.en, /not the whole/);
});

test('preview qualifications and absent plan dates are not silently rewritten', function () {
  var previews = query.filterRecords(snapshot.records, '', 'preview-notice');
  var harness = previews.find(function (record) { return record.id === 'github-harness-preview'; });
  var firewall = previews.find(function (record) { return record.id === 'ip-firewall-plan'; });
  assert.equal(previews.length, 3);
  assert.equal(harness.originalStatus, '(Production-ready preview)');
  assert.equal(harness.planGA, null);
  assert.equal(firewall.planGA, '2025-12-12');
  assert.equal(firewall.originalStatus, 'preview');
  assert.match(firewall.release.summary.en, /not used to confirm GA delivery/);
});

test('keyword matching supports Chinese, English, IDs, case folding, and AND terms', function () {
  assert.deepEqual(ids(query.filterRecords(snapshot.records, '576272', 'development')), ['roadmap-576272']);
  assert.deepEqual(ids(query.filterRecords(snapshot.records, 'dAtAvErSe 15', 'development')), ['roadmap-568929']);
  assert.ok(ids(query.filterRecords(snapshot.records, '非结构化', 'all')).indexOf('roadmap-568929') >= 0);
  assert.equal(query.filterRecords(snapshot.records, 'not-a-real-capability-zzzz', 'all').length, 0);
  assert.equal(query.filterRecords(snapshot.records, '576272', 'launched').length, 0);
  assert.equal(query.filterRecords(snapshot.records, '', 'constructor').length, 0);
});

test('hostile queries remain literal text rather than regular expressions or markup', function () {
  var fixture = copy(snapshot);
  var hostile = '<img src=x onerror=window.__roadmapAttack=1>';
  fixture.records[0].title.en = hostile;
  assert.equal(query.validateSnapshot(fixture), fixture);
  assert.deepEqual(ids(query.filterRecords(fixture.records, hostile, 'all')), ['roadmap-576272']);
  assert.equal(query.filterRecords(snapshot.records, '.*', 'all').length, 0);
  assert.equal(query.filterRecords(snapshot.records, '[a-z]+', 'all').length, 0);
  assert.ok(!/innerHTML|insertAdjacentHTML|document\.write|\beval\s*\(/.test(script));
  assert.match(script, /\.textContent\s*=/);
});

test('source URL allowlist rejects script schemes, lookalike hosts, credentials, and controls', function () {
  ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'https://www.microsoft.com.evil.invalid/roadmap',
    'https://user:password@www.microsoft.com/', 'https://learn.microsoft.com:444/',
    'https://www.microsoft.com/\nroadmap', '//www.microsoft.com/roadmap', 'http://learn.microsoft.com/'].forEach(function (url) {
    assert.equal(query.officialURL(url), null, url);
  });
  assert.ok(query.officialURL('https://www.microsoft.com/microsoft-365/roadmap?id=576272'));
  assert.ok(query.officialURL('https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new#may-2026'));
});

test('schema fails closed on invented states, broken references, duplicate identities, and wrong counts', function () {
  var cases = [
    function (value) { value.records[0].originalStatus = 'Launched'; },
    function (value) { value.records[0].statusSourceIds = ['s99']; },
    function (value) { value.records[1].id = value.records[0].id; },
    function (value) { value.records[0].id = '__proto__'; },
    function (value) { value.recordCount = 999; },
    function (value) { value.sources[0].url = 'javascript:alert(1)'; },
    function (value) { value.records[0].relatedIds = ['missing-record']; },
    function (value) { value.records[0].planGA = 'January 1 probably'; },
    function (value) { value.records[0].summary.en = {}; }
  ];
  cases.forEach(function (mutate) {
    var value = copy(snapshot);
    mutate(value);
    assert.throws(function () { query.validateSnapshot(value); });
  });
  assert.equal({}.polluted, undefined);
});

test('pagination clamps boundaries and does not mutate records', function () {
  var before = ids(snapshot.records);
  var first = query.paginate(snapshot.records, -1);
  var last = query.paginate(snapshot.records, 99);
  var empty = query.paginate([], 99);
  assert.equal(first.page, 0);
  assert.equal(first.records.length, 4);
  assert.equal(last.page, 3);
  assert.equal(last.pages, 4);
  assert.equal(last.records.length, 4);
  assert.equal(empty.page, 0);
  assert.equal(empty.pages, 1);
  assert.deepEqual(ids(snapshot.records), before);
});

test('UI IDs, canonical scripts, bilingual metadata and freshness contracts remain integrated', function () {
  var required = ['roadmap-workspace', 'roadmap-query-form', 'roadmap-keyword', 'roadmap-status-filter',
    'roadmap-results', 'roadmap-detail-panel', 'roadmap-detail-body', 'roadmap-constraints-panel',
    'roadmap-date-rows', 'roadmap-document-links', 'roadmap-related-records', 'roadmap-retry'];
  var order = ['roadmap-query.js', 'article-common.js', 'article-presentation.js', 'scrollbar.js', 'article-lightbox.js', 'article-assistant.js'];
  var prior = -1;
  required.forEach(function (id) { assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, id); });
  order.forEach(function (name) { var at = html.lastIndexOf('src="' + (name === 'roadmap-query.js' ? '' : '../../assets/') + name + '"'); assert.ok(at > prior, name); prior = at; });
  assert.match(html, /data-nav-pager/);
  assert.match(html, /data-present-i18n="strict"/);
  assert.match(html, /data-description-en=/);
  assert.ok((html.match(/data-en=/g) || []).length >= (html.match(/data-zh=/g) || []).length * 0.95);
  assert.ok(!/(?:article-narration|article-email-share|article-screen-recording)\.js"/.test(html));
  assert.match(script, /addEventListener\('langChanged'/);
  assert.match(script, /addEventListener\('visibilitychange'/);
  assert.match(script, /new MutationObserver\(lifecycle\)/);
  assert.ok(!/setInterval|setTimeout/.test(script));
  assert.equal((script.match(/requestAnimationFrame/g) || []).length, 1, 'Only the guarded post-language reference reflow is scheduled');
  assert.match(script, /fetch\('snapshot\.json', \{ credentials: 'omit'/);
  assert.ok(!/fetch\(['"]https?:/.test(script));
  assert.ok(!/localStorage|apiKey|Authorization/.test(script));
});

test('article JavaScript parses without TypeScript, inline arrows, or a build toolchain', function () {
  assert.doesNotThrow(function () { new vm.Script(script); });
  assert.ok(!/=>/.test(script));
  assert.ok(!/\.ts(?:x)?["']|node_modules|npm run|tsc/.test(html));
});

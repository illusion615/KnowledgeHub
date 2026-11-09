/* Article-local snapshot query. No cross-origin refresh, tenant check, or model call. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.CopilotRoadmapQuery = api;
    root.document.addEventListener('DOMContentLoaded', function () { api.mount(root.document); });
  }
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var STATUS = {
    development: { zh: '开发中', en: 'In Development', original: 'In development' },
    'rolling-out': { zh: '推出中', en: 'Rolling Out', original: 'Rolling out' },
    launched: { zh: '已发布标记', en: 'Launched Label', original: 'Launched' },
    cancelled: { zh: '条目取消', en: 'Cancelled Item', original: 'Cancelled' },
    'ga-notice': { zh: 'GA 公告', en: 'GA Notice', original: '(General availability)' },
    'preview-notice': { zh: '预览标签', en: 'Preview Label' }
  };
  var WORDS = {
    zh: {
      loading: '正在读取本站功能快照…',
      error: '无法读取或验证本站快照。请使用官方入口；可手动重试本地快照。',
      placeholder: '功能、限制或 ID，如 Dataverse、576272',
      empty: '没有匹配的收录记录。可缩短关键词、清除状态，或到官方实时路线图继续查找；无结果不表示产品没有此能力。',
      emptyDetail: '选择匹配记录后显示计划与发布依据。',
      emptyConstraints: '选择记录后显示实施条件与选型含义。',
      matched: '匹配记录', of: '／', page: '页', all: '全部状态',
      applied: '已应用筛选：', keyword: '关键词', none: '无', status: '状态',
      fresh: '快照核对：', feed: '官方 RSS 构建：', utc: 'UTC',
      originalTitle: '官方原文标题：', id: '路线图 ID：',
      originalStatus: '官方原始状态／标签：', origin: '来源：',
      roadmap: '路线图', 'release-notice': '发布公告', documentation: '产品文档', 'archived-plan': '历史计划对照',
      plannedPreview: '计划预览日期', plannedGA: '计划 GA 日期', missingDate: '收录来源未提供',
      planSource: '计划来源：', phases: '原始发布阶段标签（不等于已交付）：',
      releaseLabel: '发布依据的原始标签：', noReleaseLabel: '未取得此范围的明确发布标签',
      period: '公告月份：', noPeriod: '来源没有给出精确发布日期',
      modified: '路线图 modified 时间（非交付日）：', learnMsDate: 'Microsoft Learn ms.date（元数据日期；非交付日）：',
      verified: '记录与引用核对：', tenant: '未验证客户租户推出；快照不自动更新。',
      featureLink: '打开官方功能记录', noticeLink: '打开官方公告条目', planLink: '打开历史计划条目',
      release: '发布公告', comparison: '对照文档',
      unsafeLink: '未显示不安全的来源链接。',
      related: '对照记录：', selectedOutside: '当前详情为对照记录，不在已应用的筛选结果中。',
      previous: '上一组记录', next: '下一组记录'
    },
    en: {
      loading: 'Loading this site\'s feature snapshot…',
      error: 'The local snapshot could not be loaded or validated. Use the official sources, or manually retry the local snapshot.',
      placeholder: 'Capability, constraint, or ID, e.g. Dataverse, 576272',
      empty: 'No included records match. Shorten the query, clear the status, or check the official live roadmap. No match does not mean the product lacks the capability.',
      emptyDetail: 'Select a matching record to see its plan and release evidence.',
      emptyConstraints: 'Select a record to see implementation conditions and selection implications.',
      matched: 'Matching records', of: ' / ', page: 'Page', all: 'All statuses',
      applied: 'Applied filters: ', keyword: 'keyword', none: 'none', status: 'status',
      fresh: 'Snapshot verified: ', feed: 'Official RSS build: ', utc: 'UTC',
      originalTitle: 'Official title: ', id: 'Roadmap ID: ',
      originalStatus: 'Original official state/label: ', origin: 'Source: ',
      roadmap: 'Roadmap', 'release-notice': 'Release notice', documentation: 'Product guidance', 'archived-plan': 'Archived-plan comparison',
      plannedPreview: 'Planned Preview Date', plannedGA: 'Planned GA Date', missingDate: 'Not supplied by the collected sources',
      planSource: 'Plan source: ', phases: 'Original release-phase tags (not delivery proof): ',
      releaseLabel: 'Original release-evidence label: ', noReleaseLabel: 'No explicit release label confirmed for this scope',
      period: 'Announcement month: ', noPeriod: 'The source does not give an exact release date',
      modified: 'Roadmap modified timestamp (not a release date): ', learnMsDate: 'Microsoft Learn ms.date (metadata date, not a release date): ',
      verified: 'Record and references verified: ', tenant: 'No customer tenant rollout was verified; this snapshot does not auto-refresh.',
      featureLink: 'Open Official Feature Record', noticeLink: 'Open Official Notice Entry', planLink: 'Open Archived Plan Entry',
      release: 'Release notice', comparison: 'Comparison guidance',
      unsafeLink: 'An unsafe source link was not displayed.',
      related: 'Compare record: ', selectedOutside: 'This detail is a comparison record outside the applied filter results.',
      previous: 'Previous Record Group', next: 'Next Record Group'
    }
  };
  var PAGE_SIZE = 4;

  function own(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function languageText(value, lang) {
    if (value && typeof value === 'object') return value[lang === 'en' ? 'en' : 'zh'] || '';
    return typeof value === 'string' ? value : '';
  }

  function normalizedText(value) {
    var text = typeof value === 'string' ? value : String(value == null ? '' : value);
    if (text.normalize) text = text.normalize('NFKC');
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function officialURL(value) {
    var parsed;
    if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/.test(value)) return null;
    try { parsed = new URL(value); } catch (error) { return null; }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;
    if (['learn.microsoft.com', 'www.microsoft.com', 'releaseplans.microsoft.com'].indexOf(parsed.hostname) === -1) return null;
    return parsed.href;
  }

  function searchText(record) {
    var parts = [record.id, record.roadmapId, record.officialTitle, record.originalStatus,
      record.planPreview, record.planGA, record.release.originalLabel, record.release.period];
    [record.title, record.summary, record.release.summary, record.selection].forEach(function (value) {
      parts.push(languageText(value, 'zh'), languageText(value, 'en'));
    });
    ['originalPhases', 'originalClouds', 'originalPlatforms'].forEach(function (key) {
      parts.push((record[key] || []).join(' '));
    });
    (record.constraints || []).forEach(function (constraint) { parts.push(constraint.zh, constraint.en); });
    if (own(STATUS, record.statusKey)) parts.push(STATUS[record.statusKey].zh, STATUS[record.statusKey].en);
    return normalizedText(parts.join(' '));
  }

  function filterRecords(records, query, status) {
    var terms = normalizedText(query || '').split(' ').filter(function (term) { return term.length > 0; });
    if (status && status !== 'all' && !own(STATUS, status)) return [];
    return records.filter(function (record) {
      var text;
      if (status && status !== 'all' && record.statusKey !== status) return false;
      text = searchText(record);
      return terms.every(function (term) { return text.indexOf(term) !== -1; });
    });
  }

  function paginate(records, page, size) {
    var count = size || PAGE_SIZE;
    var pages = Math.max(1, Math.ceil(records.length / count));
    var current = Math.max(0, Math.min(pages - 1, Math.floor(Number(page) || 0)));
    return { records: records.slice(current * count, (current + 1) * count), page: current, pages: pages };
  }

  function appendCitationLinks(document, element, sources) {
    var group = document.createElement('sup');
    group.className = 'cite';
    sources.forEach(function (source, index) {
      var anchor = document.createElement('a');
      var separator;
      if (index) {
        separator = document.createElement('span');
        separator.className = 'cite-sep';
        separator.textContent = ',';
        group.appendChild(separator);
      }
      anchor.className = 'cite-link';
      anchor.href = '#ref-' + source.ref;
      anchor.setAttribute('data-ref', String(source.ref));
      anchor.title = source.title;
      anchor.textContent = String(source.ref);
      group.appendChild(anchor);
    });
    if (sources.length) {
      element.appendChild(document.createTextNode(' '));
      element.appendChild(group);
    }
  }

  function referenceIdFromHash(hash) {
    return typeof hash === 'string' && /^#ref-[1-9]\d?$/.test(hash) ? hash.slice(1) : null;
  }

  function mountReferences(document) {
    var references = document.getElementById('references');
    var root = document.documentElement;
    var pendingHash = null;
    if (!references || references.getAttribute('data-reference-bound') === 'true') return;
    references.setAttribute('data-reference-bound', 'true');

    function targetFor(id) {
      var target = id ? document.getElementById(id) : null;
      return target && references.contains(target) && target.closest('.bib-list') ? target : null;
    }
    function reveal(id) {
      var target = targetFor(id);
      var drawer;
      var toggle;
      var exit;
      if (!target) return false;
      // Source inspection uses reading mode; shared exit restores the reader's drawers.
      if (root.classList.contains('is-presentation-mode')) {
        exit = document.querySelector('[data-present-exit]');
        if (!exit) return false;
        exit.click();
      }
      drawer = target.closest('[data-accordion]');
      if (drawer && !drawer.classList.contains('is-open')) {
        toggle = drawer.querySelector('button.subsection-toggle');
        if (!toggle) return false;
        toggle.click();
      }
      return !drawer || drawer.classList.contains('is-open');
    }
    function replayHash() {
      var id = referenceIdFromHash(window.location.hash);
      var anchor;
      if (!targetFor(id)) return;
      if (document.hidden) { pendingHash = window.location.hash; return; }
      pendingHash = null;
      // A transient canonical link lets article-common own scrolling/highlighting/hash.
      anchor = document.createElement('a');
      anchor.className = 'cite-link';
      anchor.href = '#' + id;
      anchor.setAttribute('data-ref', id.slice(4));
      anchor.hidden = true;
      references.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    document.addEventListener('click', function (event) {
      var anchor = event.target.closest ? event.target.closest('a.cite-link[data-ref]') : null;
      var id = anchor ? referenceIdFromHash(anchor.getAttribute('href')) : null;
      if (id && anchor.getAttribute('data-ref') === id.slice(4)) reveal(id);
      // Do not prevent/replace the shared citation jump in the bubble phase.
    }, true);
    window.addEventListener('hashchange', replayHash);
    document.addEventListener('langChanged', function () {
      var id = referenceIdFromHash(window.location.hash);
      var target = targetFor(id);
      var drawer = target ? target.closest('[data-accordion]') : null;
      var hash = window.location.hash;
      var settle;
      // Query translation and font swaps can move a mobile target after this event.
      // Recenter only the still-open, still-requested reading target after reflow.
      if (document.hidden || root.classList.contains('is-presentation-mode') || !drawer || !drawer.classList.contains('is-open')) return;
      settle = function () {
        window.requestAnimationFrame(function () {
          if (!document.hidden && !root.classList.contains('is-presentation-mode') && window.location.hash === hash && references.contains(target) && drawer.classList.contains('is-open')) replayHash();
        });
      };
      void target.offsetWidth;
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
      else settle();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && pendingHash === window.location.hash) replayHash();
    });
    replayHash();
  }

  function validateSnapshot(snapshot) {
    var sources = Object.create(null);
    var recordIds = Object.create(null);
    var roadmapIds = Object.create(null);
    var datePattern = /^\d{4}-\d{2}(?:-\d{2})?$/;
    var roadmapCount = 0;

    function requireText(value, field) {
      if (typeof value !== 'string' || value.length > 24000) throw new Error('Invalid text field: ' + field);
    }
    function requireBilingual(value, field) {
      if (!value || typeof value !== 'object') throw new Error('Invalid bilingual field: ' + field);
      requireText(value.zh, field + '.zh');
      requireText(value.en, field + '.en');
    }
    function requireRefs(values) {
      if (!Array.isArray(values) || values.length > 20) throw new Error('Invalid source references');
      values.forEach(function (id) {
        if (typeof id !== 'string' || !own(sources, id)) throw new Error('Unknown source reference');
      });
    }
    function requireStringList(values) {
      if (!Array.isArray(values) || values.length > 20) throw new Error('Invalid label list');
      values.forEach(function (value) { requireText(value, 'label'); });
    }

    if (!snapshot || snapshot.schemaVersion !== 2 || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.verifiedOn || '')) throw new Error('Invalid snapshot metadata');
    if (snapshot.timezone !== 'UTC' || !Array.isArray(snapshot.records) || !Array.isArray(snapshot.sources)) throw new Error('Invalid snapshot structure');
    if (snapshot.records.length > 64 || snapshot.sources.length > 40 || snapshot.recordCount !== snapshot.records.length) throw new Error('Invalid snapshot count');
    requireBilingual(snapshot.scope, 'scope');
    requireBilingual(snapshot.limitations, 'limitations');
    requireBilingual(snapshot.dateFieldNote, 'dateFieldNote');
    requireText(snapshot.feedLastBuildAt, 'feedLastBuildAt');
    snapshot.sources.forEach(function (source) {
      if (!source || !/^s\d{2}$/.test(source.id || '') || own(sources, source.id) || !officialURL(source.url)) throw new Error('Invalid official source');
      requireText(source.title, 'source.title');
      if (source.url.indexOf('https://learn.microsoft.com/') === 0 && !/^\d{4}-\d{2}-\d{2}$/.test(source.learnMsDate || '')) throw new Error('Invalid Learn ms.date metadata');
      if (source.verifiedOn !== snapshot.verifiedOn || !Number.isInteger(source.ref) || source.ref < 1 || source.ref > 99) throw new Error('Invalid source provenance');
      sources[source.id] = source;
    });
    snapshot.records.forEach(function (record) {
      if (!record || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id || '') || own(recordIds, record.id) || !own(STATUS, record.statusKey)) throw new Error('Invalid record identity');
      if (['roadmap', 'release-notice', 'archived-plan'].indexOf(record.kind) === -1 || ['roadmap', 'release-notice', 'documentation'].indexOf(record.statusOrigin) === -1) throw new Error('Invalid record origin');
      if (record.verifiedOn !== snapshot.verifiedOn) throw new Error('Invalid record verification date');
      recordIds[record.id] = true;
      if (record.kind === 'roadmap') {
        if (!Number.isInteger(record.roadmapId) || own(roadmapIds, record.roadmapId) || STATUS[record.statusKey].original !== record.originalStatus || record.statusOrigin !== 'roadmap') throw new Error('Invalid original roadmap status');
        roadmapIds[record.roadmapId] = true;
        roadmapCount++;
      } else if (record.roadmapId !== null) throw new Error('Supplementary records must not invent a roadmap ID');
      requireBilingual(record.title, 'title');
      requireBilingual(record.summary, 'summary');
      requireBilingual(record.selection, 'selection');
      requireText(record.officialTitle, 'officialTitle');
      requireText(record.originalStatus, 'originalStatus');
      requireText(record.primaryUrl, 'primaryUrl');
      if (record.kind === 'roadmap') {
        requireText(record.roadmapModifiedAt, 'roadmapModifiedAt');
        if (own(record, 'learnMsDate')) throw new Error('Roadmap modified and Learn ms.date must stay distinct');
      } else {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(record.learnMsDate || '') || !own(sources, record.learnMsDateSourceId) || sources[record.learnMsDateSourceId].learnMsDate !== record.learnMsDate || own(record, 'roadmapModifiedAt')) throw new Error('Invalid supplementary Learn ms.date provenance');
      }
      [record.planPreview, record.planGA].forEach(function (date) {
        if (date !== null && (typeof date !== 'string' || !datePattern.test(date))) throw new Error('Invalid planned date');
      });
      ['statusSourceIds', 'summarySourceIds', 'planSourceIds'].forEach(function (key) { requireRefs(record[key]); });
      ['originalPhases', 'originalClouds', 'originalPlatforms', 'relatedIds'].forEach(function (key) { requireStringList(record[key]); });
      if (!record.release || !Array.isArray(record.constraints) || record.constraints.length > 8 || !Array.isArray(record.links) || record.links.length > 12) throw new Error('Invalid detail structure');
      requireBilingual(record.release.summary, 'release.summary');
      requireRefs(record.release.sourceIds);
      if (record.release.originalLabel !== null) requireText(record.release.originalLabel, 'release.originalLabel');
      if (record.release.period !== null) requireText(record.release.period, 'release.period');
      record.constraints.forEach(function (constraint) { requireBilingual(constraint, 'constraint'); requireRefs(constraint.sourceIds); });
      record.links.forEach(function (link) {
        if (!link || !own(sources, link.sourceId) || ['documentation', 'comparison', 'release'].indexOf(link.role) === -1 || (link.anchor && !/^[a-z0-9-]+$/.test(link.anchor))) throw new Error('Invalid detail link');
      });
    });
    snapshot.records.forEach(function (record) {
      record.relatedIds.forEach(function (id) { if (!own(recordIds, id)) throw new Error('Unknown related record'); });
    });
    if (snapshot.roadmapIdCount !== roadmapCount) throw new Error('Invalid roadmap ID count');
    return snapshot;
  }

  function mount(document) {
    var root = document.documentElement;
    var form = document.getElementById('roadmap-query-form');
    var input = document.getElementById('roadmap-keyword');
    var select = document.getElementById('roadmap-status-filter');
    var panels = ['roadmap-workspace', 'roadmap-detail-panel', 'roadmap-constraints-panel'].map(function (id) { return document.getElementById(id); });
    var resultList = document.getElementById('roadmap-results');
    var detailBody = document.getElementById('roadmap-detail-body');
    var constraintsBody = document.getElementById('roadmap-constraints-body');
    var retry = document.getElementById('roadmap-retry');
    var state = { data: null, query: '', status: 'all', page: 0, selectedId: null, needsRender: true, loading: false, error: false, epoch: 0, controller: null };
    var observer;

    mountReferences(document);
    if (!form || !input || !select || !resultList || panels.some(function (panel) { return !panel; })) return;
    if (form.getAttribute('data-query-bound') === 'true') return;
    form.setAttribute('data-query-bound', 'true');

    function lang() { return (root.getAttribute('lang') || 'zh').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh'; }
    function word(key) { return WORDS[lang()][key] || key; }
    function text(id, value) { var element = document.getElementById(id); if (element) element.textContent = value; }
    function clear(element) { while (element && element.firstChild) element.removeChild(element.firstChild); }
    function visible() {
      if (document.hidden) return false;
      if (!root.classList.contains('is-presentation-mode')) return true;
      return panels.some(function (panel) { return panel.classList.contains('is-active'); });
    }
    function source(id) { return state.data.sources.find(function (item) { return item.id === id; }); }
    function recordById(id) { return state.data.records.find(function (record) { return record.id === id; }) || null; }
    function cite(element, ids) {
      appendCitationLinks(document, element, ids.map(source).filter(function (item) { return !!item; }));
    }
    function citedText(id, value, ids) {
      var element = document.getElementById(id);
      if (!element) return;
      element.textContent = value;
      cite(element, ids);
    }
    function externalLink(parent, url, label) {
      var safe = officialURL(url);
      var anchor = document.createElement(safe ? 'a' : 'span');
      anchor.textContent = safe ? label : word('unsafeLink');
      if (safe) {
        anchor.href = safe;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      parent.appendChild(anchor);
    }
    function dateRow(label, date, ids) {
      var row = document.createElement('tr');
      var heading = document.createElement('th');
      var cell = document.createElement('td');
      heading.scope = 'row';
      heading.textContent = label;
      cell.textContent = date || word('missingDate');
      if (date) cite(cell, ids);
      row.appendChild(heading);
      row.appendChild(cell);
      return row;
    }
    function primaryLinks(record) {
      var parent = document.getElementById('roadmap-primary-link');
      var label = word(record.kind === 'roadmap' ? 'featureLink' : (record.kind === 'archived-plan' ? 'planLink' : 'noticeLink'));
      clear(parent);
      externalLink(parent, record.primaryUrl, label + (record.roadmapId ? ' · ' + record.roadmapId : ''));
    }
    function detailLinks(record) {
      var parent = document.getElementById('roadmap-document-links');
      clear(parent);
      record.links.forEach(function (link) {
        var item = source(link.sourceId);
        var row = document.createElement('p');
        var url = item.url.split('#')[0] + (link.anchor ? '#' + link.anchor : (item.url.indexOf('#') >= 0 ? '#' + item.url.split('#')[1] : ''));
        externalLink(row, url, word(link.role) + ': ' + item.title);
        parent.appendChild(row);
      });
    }
    function renderDetails(filtered) {
      var record = state.selectedId ? recordById(state.selectedId) : null;
      var body = document.getElementById('roadmap-date-rows');
      var badge = document.getElementById('roadmap-detail-badge');
      var constraints = document.getElementById('roadmap-constraint-list');
      var related = document.getElementById('roadmap-related-records');
      var outside;
      detailBody.hidden = !record;
      constraintsBody.hidden = !record;
      document.getElementById('roadmap-detail-empty').hidden = !!record;
      document.getElementById('roadmap-constraints-empty').hidden = !!record;
      text('roadmap-detail-empty', word('emptyDetail'));
      text('roadmap-constraints-empty', word('emptyConstraints'));
      if (!record) {
        panels[1].removeAttribute('data-selected-record');
        panels[2].removeAttribute('data-selected-record');
        return;
      }
      panels[1].setAttribute('data-selected-record', record.id);
      panels[2].setAttribute('data-selected-record', record.id);
      text('roadmap-detail-title', languageText(record.title, lang()));
      text('roadmap-constraint-title', languageText(record.title, lang()));
      text('roadmap-official-title', word('originalTitle') + record.officialTitle);
      badge.className = 'comparison-label roadmap-status-' + record.statusKey;
      badge.textContent = STATUS[record.statusKey][lang()];
      citedText('roadmap-original-status', word('originalStatus') + record.originalStatus + ' · ' + word('origin') + word(record.statusOrigin), record.statusSourceIds);
      citedText('roadmap-detail-summary', languageText(record.summary, lang()), record.summarySourceIds);
      clear(body);
      body.appendChild(dateRow(word('plannedPreview'), record.planPreview, record.planSourceIds));
      body.appendChild(dateRow(word('plannedGA'), record.planGA, record.planSourceIds));
      citedText('roadmap-phase-labels', word('phases') + (record.originalPhases.length ? record.originalPhases.join(' / ') : word('none')), record.planSourceIds);
      text('roadmap-release-label', word('releaseLabel') + (record.release.originalLabel || word('noReleaseLabel')) + ' · ' + (record.release.period ? word('period') + record.release.period : word('noPeriod')));
      citedText('roadmap-release-summary', languageText(record.release.summary, lang()), record.release.sourceIds);
      citedText('roadmap-detail-freshness', word('verified') + record.verifiedOn + ' ' + word('utc') + ' · ' + word(record.kind === 'roadmap' ? 'modified' : 'learnMsDate') + (record.kind === 'roadmap' ? record.roadmapModifiedAt : record.learnMsDate), record.kind === 'roadmap' ? ['s03'] : [record.learnMsDateSourceId]);
      primaryLinks(record);
      clear(constraints);
      record.constraints.forEach(function (constraint, index) {
        var item = document.createElement('li');
        var number = document.createElement('span');
        number.className = 'layer-number';
        number.textContent = String(index + 1);
        item.appendChild(number);
        item.appendChild(document.createTextNode(languageText(constraint, lang())));
        cite(item, constraint.sourceIds);
        constraints.appendChild(item);
      });
      text('roadmap-selection-advice', languageText(record.selection, lang()));
      text('roadmap-constraint-freshness', word('verified') + record.verifiedOn + ' ' + word('utc') + ' · ' + word('tenant'));
      detailLinks(record);
      clear(related);
      record.relatedIds.forEach(function (id) {
        var other = recordById(id);
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'button button-secondary roadmap-related-button';
        button.setAttribute('data-related-record', id);
        button.textContent = word('related') + languageText(other.title, lang()) + (other.roadmapId ? ' · ' + other.roadmapId : '');
        related.appendChild(button);
      });
      outside = filtered.every(function (item) { return item.id !== record.id; });
      text('roadmap-selection-note', outside ? word('selectedOutside') : '');
    }
    function render() {
      var filtered;
      var page;
      var count;
      var previous = document.getElementById('roadmap-previous');
      var next = document.getElementById('roadmap-next');
      var meta = document.querySelector('meta[data-description-zh]');
      if (!visible()) { state.needsRender = true; return; }
      state.needsRender = false;
      if (meta) meta.setAttribute('content', meta.getAttribute('data-description-' + lang()) || '');
      input.placeholder = word('placeholder');
      previous.setAttribute('aria-label', word('previous'));
      next.setAttribute('aria-label', word('next'));
      text('roadmap-load-status', state.error ? word('error') : (state.loading || !state.data ? word('loading') : ''));
      retry.hidden = !state.error;
      form.querySelector('button[type="submit"]').disabled = !state.data;
      if (!state.data) return;
      text('roadmap-snapshot-meta', word('fresh') + state.data.verifiedOn + ' ' + word('utc') + ' · ' + word('feed') + state.data.feedLastBuildAt);
      text('roadmap-snapshot-scope', languageText(state.data.scope, lang()));
      text('roadmap-snapshot-limitations', languageText(state.data.limitations, lang()));
      text('roadmap-date-fields-note', languageText(state.data.dateFieldNote, lang()));
      filtered = filterRecords(state.data.records, state.query, state.status);
      page = paginate(filtered, state.page);
      state.page = page.page;
      count = filtered.length;
      if (!state.selectedId || !recordById(state.selectedId)) state.selectedId = count ? page.records[0].id : null;
      text('roadmap-result-count', word('matched') + ': ' + count + word('of') + state.data.recordCount);
      text('roadmap-applied-query', word('applied') + word('keyword') + ' = ' + (state.query || word('none')) + '; ' + word('status') + ' = ' + (state.status === 'all' ? word('all') : STATUS[state.status][lang()]));
      text('roadmap-empty', word('empty'));
      document.getElementById('roadmap-empty').hidden = count > 0;
      clear(resultList);
      page.records.forEach(function (record, index) {
        var row = document.createElement('li');
        var number = document.createElement('span');
        var button = document.createElement('button');
        var title = document.createElement('strong');
        var status = document.createElement('span');
        var meta = document.createElement('span');
        number.className = 'flow-step';
        number.textContent = String(page.page * PAGE_SIZE + index + 1);
        button.type = 'button';
        button.id = 'roadmap-row-' + record.id;
        button.className = 'button button-secondary roadmap-record-button';
        button.setAttribute('data-record-id', record.id);
        button.setAttribute('aria-controls', 'roadmap-detail-panel');
        button.setAttribute('aria-pressed', String(record.id === state.selectedId));
        title.className = 'roadmap-record-title';
        title.textContent = languageText(record.title, lang());
        status.className = 'comparison-label roadmap-status-' + record.statusKey;
        status.textContent = STATUS[record.statusKey][lang()];
        meta.className = 'roadmap-record-meta';
        meta.textContent = (record.roadmapId ? String(record.roadmapId) : word(record.kind)) + ' · ' + (record.planGA ? word('plannedGA') + ': ' + record.planGA : word('missingDate'));
        button.appendChild(title);
        button.appendChild(status);
        button.appendChild(meta);
        row.appendChild(number);
        row.appendChild(button);
        resultList.appendChild(row);
      });
      previous.disabled = page.page === 0 || !count;
      next.disabled = page.page >= page.pages - 1 || !count;
      text('roadmap-page-label', word('page') + ' ' + (page.page + 1) + word('of') + page.pages);
      renderDetails(filtered);
    }
    function loadSnapshot() {
      var epoch;
      if (state.data || state.loading || !visible()) return;
      state.loading = true;
      state.error = false;
      state.epoch++;
      epoch = state.epoch;
      state.controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      render();
      fetch('snapshot.json', { credentials: 'omit', cache: 'no-cache', signal: state.controller ? state.controller.signal : undefined })
        .then(function (response) {
          if (!response.ok) throw new Error('Snapshot unavailable');
          return response.text();
        })
        .then(function (raw) {
          var data;
          if (epoch !== state.epoch) return;
          if (raw.length > 524288) throw new Error('Snapshot too large');
          data = validateSnapshot(JSON.parse(raw));
          state.data = data;
          state.loading = false;
          state.controller = null;
          state.needsRender = true;
          render();
        })
        .catch(function () {
          if (epoch !== state.epoch) return;
          state.loading = false;
          state.controller = null;
          state.error = true;
          state.needsRender = true;
          render();
        });
    }
    function lifecycle() {
      if (!visible()) {
        state.needsRender = true;
        if (state.loading && state.controller) {
          state.epoch++;
          state.controller.abort();
          state.controller = null;
          state.loading = false;
        }
        return;
      }
      if (!state.data && !state.error) loadSnapshot();
      else if (state.needsRender) render();
    }
    function choose(id) {
      if (!state.data || !recordById(id)) return;
      state.selectedId = id;
      render();
    }

    form.addEventListener('submit', function (event) {
      var filtered;
      event.preventDefault();
      if (!state.data) return;
      state.query = input.value.slice(0, 180).trim();
      state.status = own(STATUS, select.value) ? select.value : 'all';
      state.page = 0;
      filtered = filterRecords(state.data.records, state.query, state.status);
      if (!filtered.some(function (record) { return record.id === state.selectedId; })) state.selectedId = filtered.length ? filtered[0].id : null;
      render();
    });
    document.getElementById('roadmap-reset').addEventListener('click', function () {
      input.value = '';
      select.value = 'all';
      state.query = '';
      state.status = 'all';
      state.page = 0;
      state.selectedId = null;
      render();
    });
    resultList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-record-id]');
      if (button && resultList.contains(button)) choose(button.getAttribute('data-record-id'));
    });
    document.getElementById('roadmap-related-records').addEventListener('click', function (event) {
      var button = event.target.closest('[data-related-record]');
      if (button) choose(button.getAttribute('data-related-record'));
    });
    document.getElementById('roadmap-previous').addEventListener('click', function () { state.page--; render(); });
    document.getElementById('roadmap-next').addEventListener('click', function () { state.page++; render(); });
    retry.addEventListener('click', function () { state.error = false; loadSnapshot(); });
    document.addEventListener('langChanged', function () {
      var meta = document.querySelector('meta[data-description-zh]');
      if (meta) meta.setAttribute('content', meta.getAttribute('data-description-' + lang()) || '');
      state.needsRender = true;
      lifecycle();
    });
    document.addEventListener('visibilitychange', lifecycle);
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(lifecycle);
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });
      panels.forEach(function (panel) { observer.observe(panel, { attributes: true, attributeFilter: ['class'] }); });
    }
    window.addEventListener('pagehide', function () {
      state.epoch++;
      if (state.controller) state.controller.abort();
      state.controller = null;
      state.loading = false;
      if (observer) observer.disconnect();
    });
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) return;
      if (observer) {
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        panels.forEach(function (panel) { observer.observe(panel, { attributes: true, attributeFilter: ['class'] }); });
      }
      state.needsRender = true;
      lifecycle();
    });
    lifecycle();
  }

  return { STATUS: STATUS, PAGE_SIZE: PAGE_SIZE, officialURL: officialURL, validateSnapshot: validateSnapshot,
    filterRecords: filterRecords, paginate: paginate, languageText: languageText, appendCitationLinks: appendCitationLinks,
    referenceIdFromHash: referenceIdFromHash, mountReferences: mountReferences, mount: mount };
}));

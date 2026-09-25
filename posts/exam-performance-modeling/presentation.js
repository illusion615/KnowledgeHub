/* Component: .exam-defense-slide
 * Reading mode: hidden, excluded from assistant context, no original prose moved.
 * Presentation mode: only these curated explicit steps enter the shared deck. */
(function () {
  'use strict';
  var main = document.querySelector('main');
  var plan = window.ExamDefensePlan;
  if (!main || !Array.isArray(plan) || !plan.length) return;
  function localized(tag, value, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    var pair = Array.isArray(value) ? value : [value, value];
    node.setAttribute('data-zh', pair[0]);
    node.setAttribute('data-en', pair[1]);
    node.textContent = document.documentElement.lang.indexOf('en') === 0 ? pair[1] : pair[0];
    return node;
  }
  function pair(text) { return text.split('|'); }
  function svgNode(tag, attributes, text) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes || {}).forEach(function (name) { node.setAttribute(name, attributes[name]); });
    if (Array.isArray(text)) {
      node.setAttribute('data-zh', text[0]); node.setAttribute('data-en', text[1]);
      node.textContent = document.documentElement.lang.indexOf('en') === 0 ? text[1] : text[0];
    } else if (text !== undefined) node.textContent = text;
    return node;
  }
  function makeChart(spec) {
    var svg = svgNode('svg', { viewBox: '0 0 640 340', class: 'defense-chart', role: 'img' });
    var scatter = spec.type === 'scatter';
    svg.appendChild(svgNode('title', {}, scatter ? ['三年24次难度与得分率散点', 'Difficulty and Score Rate for All 24 Exams'] : ['第17—24次预测绝对误差', 'Absolute Prediction Errors for Exams 17–24']));
    var plot = { left: 60, right: 580, top: 74, bottom: 250 };
    var x = function (value) { return plot.left + (value - (scatter ? .1 : 17)) / (scatter ? .3 : 7) * (plot.right - plot.left); };
    var y = function (value) { return plot.bottom - (value - (scatter ? .5 : 0)) / (scatter ? .5 : 10) * (plot.bottom - plot.top); };
    var ticks = scatter ? [.5, .6, .7, .8, .9, 1] : [0, 2, 4, 6, 8, 10];
    ticks.forEach(function (value) {
      svg.appendChild(svgNode('line', { x1: plot.left, x2: plot.right, y1: y(value), y2: y(value), class: 'defense-chart-grid' }));
      svg.appendChild(svgNode('text', { x: 48, y: y(value) + 7, 'text-anchor': 'end' }, scatter ? value.toFixed(1) : String(value)));
    });
    (scatter ? [.1, .2, .3, .4] : [17, 18, 19, 20, 21, 22, 23, 24]).forEach(function (value) {
      svg.appendChild(svgNode('text', { x: x(value), y: 279, 'text-anchor': 'middle' }, scatter ? value.toFixed(2) : String(value)));
    });
    svg.appendChild(svgNode('path', { d: 'M60 74V250H580', class: 'defense-chart-axis' }));
    svg.appendChild(svgNode('text', { x: 60, y: 62 }, scatter ? ['得分率', 'Score Rate'] : ['绝对误差／分', 'Absolute Error / Points']));
    svg.appendChild(svgNode('text', { x: 580, y: 325, 'text-anchor': 'end' }, scatter ? ['难度 d', 'Difficulty d'] : ['考试编号', 'Exam Index']));
    function marker(xx, yy, group, attrs) {
      var shape;
      if (group === 0) shape = svgNode('circle', { cx: xx, cy: yy, r: 5.5, class: 'defense-point defense-series-0' });
      else if (group === 1) shape = svgNode('rect', { x: xx - 5, y: yy - 5, width: 10, height: 10, class: 'defense-point defense-series-1' });
      else shape = svgNode('path', { d: 'M' + xx + ' ' + (yy - 6) + 'l6 11h-12z', class: 'defense-point defense-series-2' });
      Object.keys(attrs || {}).forEach(function (key) { shape.setAttribute(key, attrs[key]); });
      svg.appendChild(shape);
    }
    if (scatter) {
      [1, 2, 3].forEach(function (year, group) {
        marker(70 + group * 170, 24, group);
        svg.appendChild(svgNode('text', { x: 84 + group * 170, y: 31 }, [['高一', 'Year 1'], ['高二', 'Year 2'], ['高三', 'Year 3']][group]));
        var rows = document.querySelectorAll('#source-year-' + year + ' tbody tr');
        for (var i = 0; i < 8; i++) {
          var rate = Number(rows[0].querySelectorAll('td')[i].textContent) / (year === 3 ? 150 : 100);
          var difficulty = Number(rows[1].querySelectorAll('td')[i].textContent);
          marker(x(difficulty), y(rate), group, { 'data-exam': group * 8 + i + 1, 'data-rate': rate, 'data-difficulty': difficulty });
        }
      });
    } else {
      ['linear', 'bounded'].forEach(function (kind, group) {
        marker(90 + group * 240, 24, group);
        svg.appendChild(svgNode('text', { x: 106 + group * 240, y: 31 }, group ? ['有界', 'Bounded'] : ['线性', 'Linear']));
        svg.appendChild(svgNode('polyline', { points: spec[kind].map(function (value, i) { return x(i + 17) + ',' + y(value); }).join(' '), class: 'defense-chart-line defense-series-' + group }));
        spec[kind].forEach(function (value, i) { marker(x(i + 17), y(value), group, { 'data-exam': i + 17, 'data-error': value, 'data-model': kind }); });
      });
    }
    return svg;
  }
  function sourcePair(node) {
    return [node.getAttribute('data-zh') || node.textContent, node.getAttribute('data-en') || node.textContent];
  }
  function problemPage(slide, item) {
    var source = document.getElementById(item.sourceSection);
    var articles = source.querySelectorAll('.exam-body > article');
    var intro = document.createElement('div');
    intro.className = 'defense-problem-intro';
    articles[0].querySelectorAll('.exam-copy > p').forEach(function (p) {
      intro.appendChild(localized('p', sourcePair(p)));
    });
    slide.appendChild(intro);
    var grid = document.createElement('div');
    grid.className = 'defense-year-grid';
    item.sourceTables.forEach(function (id) {
      var original = document.getElementById(id);
      var table = document.createElement('table');
      table.className = 'defense-year-table';
      table.setAttribute('data-source-table', id);
      table.appendChild(localized('caption', sourcePair(original.querySelector('caption'))));
      var headings = original.querySelectorAll('thead th');
      var rows = Array.from(original.querySelectorAll('tbody tr'));
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      [headings[0]].concat(rows.map(function (row) { return row.querySelector('th'); })).forEach(function (node) {
        var th = localized('th', sourcePair(node)); th.scope = 'col'; tr.appendChild(th);
      });
      thead.appendChild(tr); table.appendChild(thead);
      var tbody = document.createElement('tbody');
      for (var i = 0; i < 8; i++) {
        var record = document.createElement('tr');
        var exam = localized('th', sourcePair(headings[i + 1])); exam.scope = 'row'; record.appendChild(exam);
        rows.forEach(function (row) {
          var cell = document.createElement('td');
          cell.textContent = row.querySelectorAll('td')[i].textContent;
          record.appendChild(cell);
        });
        tbody.appendChild(record);
      }
      table.appendChild(tbody); grid.appendChild(table);
    });
    slide.appendChild(grid);
    slide.appendChild(localized('p', sourcePair(articles[1].querySelector('.exam-copy > p')), 'defense-problem-conditions'));
    var questions = document.createElement('ol');
    questions.className = 'defense-problem-questions';
    articles[2].querySelectorAll('ol > li').forEach(function (question) {
      questions.appendChild(localized('li', sourcePair(question)));
    });
    slide.appendChild(questions);
    // Deliberately omit the original courtesy note; preserve all mathematical conditions.
    slide.classList.add('defense-problem-page');
  }
  var fragment = document.createDocumentFragment();
  plan.forEach(function (item, index) {
    var slide = document.createElement('section');
    slide.id = 'defense-' + item.id;
    slide.className = 'section exam-defense-slide';
    slide.setAttribute('data-present-step', '');
    slide.setAttribute('data-present-surface', 'unframed');
    slide.setAttribute('data-assistant-exclude', '');
    slide.setAttribute('data-step-title', item.title[0]);
    slide.setAttribute('data-step-title-en', item.title[1]);
    slide.setAttribute('data-step-label', item.label[0]);
    slide.setAttribute('data-step-label-en', item.label[1]);
    slide.setAttribute('aria-label', item.title[0]);
    slide.dataset.defenseOrder = String(index + 1);
    slide.dataset.defenseChapter = String(item.chapter);
    slide.dataset.defenseSubsection = item.subsection;
    if (item.layout === 'problem') {
      problemPage(slide, item);
      fragment.appendChild(slide);
      return;
    }
    slide.appendChild(localized('h3', item.lead, 'defense-lead'));
    if (item.layout === 'outline') {
      var outline = document.createElement('ol');
      outline.className = 'defense-outline';
      item.chapters.forEach(function (chapter) {
        var row = document.createElement('li');
        row.className = 'defense-outline-row';
        var chapterHead = document.createElement('div');
        chapterHead.className = 'defense-outline-heading';
        var number = document.createElement('span');
        number.className = 'defense-outline-number';
        number.textContent = String(chapter.number).padStart(2, '0');
        chapterHead.appendChild(number);
        chapterHead.appendChild(localized('h4', chapter.title));
        row.appendChild(chapterHead);
        row.appendChild(localized('p', chapter.summary));
        outline.appendChild(row);
      });
      slide.appendChild(outline);
      slide.appendChild(localized('p', item.source, 'defense-source'));
      fragment.appendChild(slide);
      return;
    }
    var columns = document.createElement('div');
    columns.className = 'defense-columns';
    item.columns.forEach(function (spec) {
      var column = document.createElement('article');
      column.className = 'defense-panel';
      column.appendChild(localized('h4', spec.heading));
      if (spec.intro) column.appendChild(localized('p', spec.intro, 'defense-definition'));
      if (spec.chart) column.appendChild(makeChart(spec.chart));
      (spec.math || []).forEach(function (latex) {
        var math = document.createElement('div');
        math.className = 'math-block defense-math';
        math.setAttribute('data-latex', latex);
        math.textContent = latex;
        column.appendChild(math);
      });
      if (spec.table) {
        var table = document.createElement('table');
        table.className = 'defense-table';
        var thead = document.createElement('thead');
        var header = document.createElement('tr');
        spec.table.headers.forEach(function (value) {
          var th = localized('th', value); th.scope = 'col'; header.appendChild(th);
        });
        thead.appendChild(header); table.appendChild(thead);
        var tbody = document.createElement('tbody');
        spec.table.rows.forEach(function (row) {
          var tr = document.createElement('tr');
          row.forEach(function (value) { tr.appendChild(localized('td', value)); });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody); column.appendChild(table);
      }
      if (spec.list) {
        var list = document.createElement('ul');
        spec.list.forEach(function (text) { list.appendChild(localized('li', pair(text))); });
        column.appendChild(list);
      }
      columns.appendChild(column);
    });
    slide.appendChild(columns);
    slide.appendChild(localized('p', item.takeaway, 'defense-takeaway'));
    slide.appendChild(localized('p', item.source, 'defense-source'));
    fragment.appendChild(slide);
  });
  // Commit exclusion only after the complete dedicated deck has been built.
  var hero = document.querySelector('.site > .hero') || document.querySelector('.hero');
  if (hero) hero.setAttribute('data-present-exclude', '');
  main.querySelectorAll(':scope > .section').forEach(function (section) {
    section.setAttribute('data-present-exclude', '');
  });
  main.appendChild(fragment);
  document.documentElement.classList.add('exam-defense-ready');
  document.documentElement.setAttribute('data-present-i18n', 'strict');
  // A native top-layer reading dialog must not obscure the shared presentation UI.
  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-presentation-toggle], .launch-play-btn')) return;
    var dialog = document.getElementById('knowledge-dialog');
    if (dialog && dialog.open) dialog.querySelector('[data-knowledge-close]').click();
  }, true);
})();

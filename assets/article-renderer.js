// article-renderer.js — Markdown → Interactive Article Page Renderer
// Parses markdown with frontmatter and renders into the existing article.css design system
// Dependencies: marked.js (CDN), mermaid.js (CDN, optional)

(function () {
  'use strict';

  // ── Minimal YAML Frontmatter Parser ──────────────────────────────
  function parseFrontmatter(raw) {
    var match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!match) return { meta: {}, body: raw };
    var yaml = match[1];
    var body = raw.slice(match[0].length);
    var meta = {};
    var lines = yaml.split('\n');
    var currentKey = '';
    var currentIndent = 0;
    var i, line, trimmed, keyVal, key, val;

    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      trimmed = line.trim();
      if (!trimmed || trimmed.charAt(0) === '#') continue;

      // Simple key: value
      keyVal = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (keyVal && line.indexOf('  ') !== 0 && line.charAt(0) !== ' ') {
        key = keyVal[1];
        val = keyVal[2].replace(/^["']|["']$/g, '');
        if (val === '') {
          meta[key] = '';
        } else if (val.charAt(0) === '[') {
          // Simple inline array
          meta[key] = val.slice(1, -1).split(',').map(function (s) { return s.trim().replace(/^["']|["']$/g, ''); });
        } else {
          meta[key] = val;
        }
        currentKey = key;
        currentIndent = 0;
      } else if (trimmed.charAt(0) === '-' && currentKey) {
        // Array item under current key
        if (!Array.isArray(meta[currentKey])) {
          if (meta[currentKey] === '') {
            meta[currentKey] = [];
          } else {
            meta[currentKey] = [meta[currentKey]];
          }
        }
        meta[currentKey].push(trimmed.slice(1).trim().replace(/^["']|["']$/g, ''));
      }
    }

    return { meta: meta, body: body };
  }

  // ── Section Splitter ─────────────────────────────────────────────
  function splitSections(body) {
    var lines = body.split('\n');
    var sections = [];
    var current = { level: 0, title: '', lines: [] };
    var i, line, headMatch;

    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      headMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headMatch && headMatch[1].length <= 2) {
        if (current.title || current.lines.length > 0) {
          sections.push(current);
        }
        current = {
          level: headMatch[1].length,
          title: headMatch[2],
          lines: []
        };
      } else {
        current.lines.push(line);
      }
    }

    if (current.title || current.lines.length > 0) {
      sections.push(current);
    }

    return sections;
  }

  // ── Markdown Block Parser ───────────────────────────────────────
  function parseBlocks(lines) {
    var blocks = [];
    var i = 0;
    var line, fence, lang, codeLines, listLines, tableLines, blockquoteLines;

    while (i < lines.length) {
      line = lines[i];

      // Skip empty lines
      if (line.trim() === '') { i++; continue; }

      // Horizontal rule: ---, ***, ___
      if (line.trim().match(/^[-*_]{3,}$/) && !line.trim().match(/^[-*+]\s+/)) {
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }

      // Fenced code block
      if (line.trim().indexOf('```') === 0) {
        fence = line.trim();
        lang = fence.slice(3).trim();
        codeLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '```') {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        blocks.push({ type: lang === 'mermaid' ? 'mermaid' : 'code', lang: lang || 'text', content: codeLines.join('\n') });
        continue;
      }

      // Heading (### and below — h2 is handled by section split)
      if (line.match(/^#{3,6}\s+/)) {
        var hMatch = line.match(/^(#{3,6})\s+(.+)$/);
        if (hMatch) {
          blocks.push({ type: 'heading', level: hMatch[1].length, content: hMatch[2] });
          i++;
          continue;
        }
      }

      // Blockquote
      if (line.trim().charAt(0) === '>') {
        blockquoteLines = [];
        while (i < lines.length && lines[i].trim().charAt(0) === '>') {
          blockquoteLines.push(lines[i].trim().slice(1).trim());
          i++;
        }
        blocks.push({ type: 'blockquote', content: blockquoteLines.join('\n') });
        continue;
      }

      // Unordered list (exclude HR-like lines)
      if (line.match(/^\s*[-*+]\s+/) && !line.trim().match(/^[-*_]{3,}$/)) {
        listLines = [];
        while (i < lines.length && (lines[i].match(/^\s*[-*+]\s+/) || (lines[i].match(/^\s{2,}/) && listLines.length > 0))) {
          listLines.push(lines[i].replace(/^\s*[-*+]\s+/, '').trim());
          i++;
        }
        blocks.push({ type: 'ul', items: listLines });
        continue;
      }

      // Ordered list
      if (line.match(/^\s*\d+[.)]\s+/)) {
        listLines = [];
        while (i < lines.length && (lines[i].match(/^\s*\d+[.)]\s+/) || (lines[i].match(/^\s{2,}/) && listLines.length > 0))) {
          listLines.push(lines[i].replace(/^\s*\d+[.)]\s+/, '').trim());
          i++;
        }
        blocks.push({ type: 'ol', items: listLines });
        continue;
      }

      // Table
      if (line.indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?\s*[-:]+/)) {
        tableLines = [];
        while (i < lines.length && lines[i].indexOf('|') !== -1) {
          tableLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: 'table', lines: tableLines });
        continue;
      }

      // Paragraph (collect consecutive non-empty, non-special lines)
      var paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' &&
        !lines[i].match(/^#{1,6}\s+/) &&
        !lines[i].match(/^\s*[-*+]\s+/) &&
        !lines[i].match(/^\s*\d+[.)]\s+/) &&
        lines[i].trim().indexOf('```') !== 0 &&
        lines[i].trim().charAt(0) !== '>' &&
        !(lines[i].indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1] && lines[i + 1].match(/^\s*\|?\s*[-:]+/))) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
      }
    }

    return blocks;
  }

  // ── Inline Markdown Renderer ────────────────────────────────────
  function renderInline(text) {
    if (!text) return '';
    var result = text;

    // Images: ![alt](src)
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:8px 0;" />');

    // Links: [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Bold+italic: ***text*** or ___text___
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    result = result.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>');
    result = result.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

    // Inline code: `code`
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

    return result;
  }

  // ── Table Parser ────────────────────────────────────────────────
  function parseTable(tableLines) {
    var rows = [];
    var isHeader = true;
    var i, cells;

    for (i = 0; i < tableLines.length; i++) {
      var line = tableLines[i].trim();
      if (line.match(/^\s*\|?\s*[-:]+/)) {
        isHeader = false;
        continue;
      }
      cells = line.split('|').map(function (c) { return c.trim(); }).filter(function (c) { return c !== ''; });
      rows.push({ cells: cells, isHeader: isHeader && i === 0 });
    }

    return rows;
  }

  // ── DOM Builders ────────────────────────────────────────────────

  function el(tag, className, innerHTML) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (innerHTML !== undefined) node.innerHTML = innerHTML;
    return node;
  }

  function renderBlock(block) {
    var node, i, li, row, tr, cell, cellTag;

    switch (block.type) {
      case 'heading':
        node = el('h' + block.level, '', renderInline(block.content));
        return node;

      case 'paragraph':
        node = el('p', '', renderInline(block.content));
        return node;

      case 'blockquote':
        node = el('div', 'quote-block');
        var bqParts = block.content.split('\n');
        if (bqParts.length > 0) {
          var strong = el('strong', '', renderInline(bqParts[0]));
          node.appendChild(strong);
          if (bqParts.length > 1) {
            var span = el('span', '', renderInline(bqParts.slice(1).join(' ')));
            node.appendChild(span);
          }
        }
        return node;

      case 'ul':
        node = el('ul', 'reference-list');
        for (i = 0; i < block.items.length; i++) {
          li = el('li', '', renderInline(block.items[i]));
          node.appendChild(li);
        }
        return node;

      case 'ol':
        node = el('ol', 'reference-list');
        for (i = 0; i < block.items.length; i++) {
          li = el('li', '', renderInline(block.items[i]));
          node.appendChild(li);
        }
        return node;

      case 'code':
        node = el('div', 'code-block');
        var pre = el('pre');
        var code = el('code', 'language-' + block.lang);
        code.textContent = block.content;
        pre.appendChild(code);
        node.appendChild(pre);
        return node;

      case 'mermaid':
        node = el('div', 'mermaid-container');
        var mermaidDiv = el('pre', 'mermaid');
        mermaidDiv.textContent = block.content;
        node.appendChild(mermaidDiv);
        return node;

      case 'table':
        var tableRows = parseTable(block.lines);
        node = el('table', 'simple-table');
        var thead = el('thead');
        var tbody = el('tbody');
        for (i = 0; i < tableRows.length; i++) {
          row = tableRows[i];
          tr = el('tr');
          for (var j = 0; j < row.cells.length; j++) {
            cellTag = row.isHeader ? 'th' : 'td';
            cell = el(cellTag, '', renderInline(row.cells[j]));
            tr.appendChild(cell);
          }
          if (row.isHeader) {
            thead.appendChild(tr);
          } else {
            tbody.appendChild(tr);
          }
        }
        if (thead.children.length > 0) node.appendChild(thead);
        node.appendChild(tbody);
        var wrapper = el('div');
        wrapper.style.overflowX = 'auto';
        wrapper.appendChild(node);
        return wrapper;

      case 'hr':
        node = el('hr');
        node.style.border = 'none';
        node.style.borderTop = '1px solid rgba(255,255,255,0.08)';
        node.style.margin = '32px 0';
        return node;

      default:
        node = el('div', '', renderInline(block.content || ''));
        return node;
    }
  }

  // ── Hero Builder ────────────────────────────────────────────────

  function buildHero(meta, titleText, introBlocks) {
    var hero = el('header', 'hero');

    // Topbar
    var topbar = el('div', 'topbar load-in');
    var homeLink = el('a', 'home-link', '← 返回首页');
    homeLink.href = '../../';
    homeLink.setAttribute('data-zh', '← 返回首页');
    homeLink.setAttribute('data-en', '← Home');
    topbar.appendChild(homeLink);

    var brand = el('div', 'brand');
    var brandMark = el('span', 'brand-mark');
    brand.appendChild(brandMark);
    brand.appendChild(document.createTextNode(meta.brand || titleText.slice(0, 20)));
    topbar.appendChild(brand);

    // Nav links — placeholder, filled after sections are built
    var navEl = el('nav', 'nav-links');
    navEl.setAttribute('aria-label', '页面章节导航');
    topbar.appendChild(navEl);

    // View mode toggle button
    var toggleBtn = el('button', 'view-mode-toggle');
    toggleBtn.type = 'button';
    toggleBtn.title = '切换 Markdown / 渐进式视图';
    toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    topbar.appendChild(toggleBtn);

    hero.appendChild(topbar);

    // Split intro blocks into: paragraphs → hero-copy, blockquotes → hero-panel
    var heroParagraphs = [];
    var heroPanel = null; // first blockquote becomes panel
    var heroLists = [];

    introBlocks.forEach(function (block) {
      if (block.type === 'paragraph') {
        heroParagraphs.push(block);
      } else if (block.type === 'blockquote' && !heroPanel) {
        heroPanel = block;
      } else if (block.type === 'ul' || block.type === 'ol') {
        heroLists.push(block);
      }
    });

    // Hero grid
    var heroGrid = el('div', 'hero-grid');
    var heroCopy = el('div', 'hero-copy load-in');

    if (meta.eyebrow) {
      var eyebrow = el('span', 'eyebrow', meta.eyebrow);
      heroCopy.appendChild(eyebrow);
    }

    var h1 = el('h1', '', renderInline(titleText));
    heroCopy.appendChild(h1);

    heroParagraphs.forEach(function (block) {
      var p = el('p', '', renderInline(block.content));
      heroCopy.appendChild(p);
    });

    heroGrid.appendChild(heroCopy);

    // Hero panel from blockquote or frontmatter
    var panelSource = heroPanel || (meta.panel ? { content: '' } : null);
    if (panelSource) {
      var panel = el('aside', 'hero-panel load-in');
      var panelLabel, panelTitle, panelDesc;

      if (meta.panel) {
        // From frontmatter
        panelLabel = el('span', 'panel-label', meta.panel_label || '核心要点');
        panel.appendChild(panelLabel);
        panelTitle = el('h2', '', meta.panel_title || '关键信息');
        panel.appendChild(panelTitle);
        if (meta.panel_desc) {
          panelDesc = el('p', '', meta.panel_desc);
          panel.appendChild(panelDesc);
        }
        var layerList = el('ul', 'layer-list');
        layerList.style.marginTop = '18px';
        var panelItems = Array.isArray(meta.panel) ? meta.panel : meta.panel.split(',');
        panelItems.forEach(function (item, idx) {
          var li = el('li');
          var num = el('span', 'layer-number', String(idx + 1));
          li.appendChild(num);
          li.appendChild(document.createTextNode(item.trim()));
          layerList.appendChild(li);
        });
        panel.appendChild(layerList);
      } else if (heroPanel) {
        // From blockquote: first line → panel title, rest → panel description + lists
        var bqLines = heroPanel.content.split('\n');
        var bqTitle = bqLines[0] || '';
        var bqRest = bqLines.slice(1).join('\n').trim();

        panelLabel = el('span', 'panel-label', '核心要点');
        panel.appendChild(panelLabel);
        panelTitle = el('h2', '', renderInline(bqTitle));
        panel.appendChild(panelTitle);
        if (bqRest) {
          panelDesc = el('p', '', renderInline(bqRest));
          panel.appendChild(panelDesc);
        }
        // Attach lists from h1 body as layer-list in panel
        if (heroLists.length > 0) {
          heroLists.forEach(function (listBlock) {
            var layerList2 = el('ul', 'layer-list');
            layerList2.style.marginTop = '18px';
            listBlock.items.forEach(function (item, idx) {
              var li = el('li');
              var num = el('span', 'layer-number', String(idx + 1));
              li.appendChild(num);
              li.appendChild(document.createTextNode(item));
              layerList2.appendChild(li);
            });
            panel.appendChild(layerList2);
          });
        }
      }

      heroGrid.appendChild(panel);
    }

    hero.appendChild(heroGrid);

    // Metrics from frontmatter
    if (meta.metrics) {
      var metricsRow = el('div', 'hero-metrics load-in');
      var metricItems = Array.isArray(meta.metrics) ? meta.metrics : meta.metrics.split(',');
      metricItems.forEach(function (item) {
        var parts = item.trim().split('|').map(function (s) { return s.trim(); });
        if (parts.length >= 2) {
          var metric = el('div', 'metric');
          var mlabel = el('div', 'metric-label', parts[0]);
          metric.appendChild(mlabel);
          var mvalue = el('strong', '', parts[1]);
          metric.appendChild(mvalue);
          if (parts[2]) {
            var mdesc = el('span', '', parts[2]);
            metric.appendChild(mdesc);
          }
          metricsRow.appendChild(metric);
        }
      });
      hero.appendChild(metricsRow);
    }

    return hero;
  }

  // ── Section Builder ─────────────────────────────────────────────

  function buildSection(sectionData, index) {
    var section = el('section', 'section');
    section.setAttribute('data-reveal', '');
    section.id = 'section-' + (index + 1);

    // Section head
    var head = el('div', 'section-head');
    var titleRaw = sectionData.title;
    var titleNum = titleRaw.match(/^(\d+)\.\s*(.+)$/);
    var kickerText, h2Text;
    if (titleNum) {
      kickerText = String(parseInt(titleNum[1])).padStart(2, '0') + ' / ' + titleNum[2];
      h2Text = titleRaw;
    } else {
      kickerText = String(index + 1).padStart(2, '0') + ' / ' + titleRaw;
      h2Text = titleRaw;
    }
    var kicker = el('p', 'section-kicker', kickerText);
    head.appendChild(kicker);
    var h2 = el('h2', '', renderInline(h2Text));
    head.appendChild(h2);

    // Parse all blocks in section body
    var blocks = parseBlocks(sectionData.lines);

    // First paragraphs before any heading → section description
    var descDone = false;
    var bodyBlocks = [];
    for (var i = 0; i < blocks.length; i++) {
      if (!descDone && blocks[i].type === 'paragraph') {
        var descP = el('p', '', renderInline(blocks[i].content));
        head.appendChild(descP);
        descDone = true;
      } else {
        descDone = true;
        bodyBlocks.push(blocks[i]);
      }
    }
    section.appendChild(head);

    // Group body blocks by h3 headings → insight-card grid
    // HR → data-present-step boundaries
    var currentSlide = null; // container for current slide segment
    var cardBuffer = []; // accumulate h3 cards
    var cardIndex = 0;

    var flushCards = function () {
      if (cardBuffer.length === 0) return;
      var grid = el('div', 'insight-grid');
      cardBuffer.forEach(function (card) {
        grid.appendChild(card);
      });
      var target = currentSlide || section;
      target.appendChild(grid);
      cardBuffer = [];
    };

    var flushBlock = function (block) {
      var target = currentSlide || section;
      var rendered = renderBlock(block);
      if (rendered) target.appendChild(rendered);
    };

    bodyBlocks.forEach(function (block) {
      if (block.type === 'hr') {
        // Flush pending cards before slide break
        flushCards();
        // Close current slide, start new one
        if (currentSlide) {
          section.appendChild(currentSlide);
        }
        currentSlide = el('div');
        currentSlide.setAttribute('data-present-step', '');
        return;
      }

      if (block.type === 'heading' && block.level === 3) {
        // Start a new insight card — collect content until next h3, HR, or end
        cardIndex++;
        // Current card will be built when we encounter the next card or non-card block
        // For now, push a placeholder
        var card = el('article', 'insight-card');
        var idx = el('span', 'card-index', String(cardIndex).padStart(2, '0'));
        card.appendChild(idx);
        var cardTitle = el('h3', '', renderInline(block.content));
        card.appendChild(cardTitle);
        card._pendingContent = true;
        cardBuffer.push(card);
        return;
      }

      // Content after an h3 → append to last card
      if (cardBuffer.length > 0 && cardBuffer[cardBuffer.length - 1]._pendingContent) {
        var lastCard = cardBuffer[cardBuffer.length - 1];
        if (block.type === 'paragraph') {
          var cp = el('p', '', renderInline(block.content));
          lastCard.appendChild(cp);
        } else if (block.type === 'ul' || block.type === 'ol') {
          var rendered = renderBlock(block);
          if (rendered) lastCard.appendChild(rendered);
        } else if (block.type === 'blockquote') {
          // Blockquote after cards → flush cards first, render as quote
          lastCard._pendingContent = false;
          flushCards();
          flushBlock(block);
        } else {
          // Non-card content → flush cards, render block normally
          lastCard._pendingContent = false;
          flushCards();
          flushBlock(block);
        }
        return;
      }

      // Non-h3 content in section body → render directly
      flushCards(); // flush any pending card grid
      flushBlock(block);
    });

    // Flush remaining cards
    flushCards();
    // Close last slide if open
    if (currentSlide) {
      section.appendChild(currentSlide);
    }

    return section;
  }

  // ── Footer Builder ──────────────────────────────────────────────

  function buildFooter(title) {
    var footer = el('footer', 'site-footer');
    footer.setAttribute('data-reveal', '');
    footer.innerHTML = '<p>© 2026 ' + title + ' | 交互式 HTML 页面。</p>';
    return footer;
  }

  // ── Plain Markdown Renderer (independent DOM) ─────────────────
  function buildPlainMarkdown(raw) {
    var parsed = parseFrontmatter(raw);
    var body = parsed.body;
    var wrapper = el('article', 'md-plain');

    // Render line by line using parseBlocks on the full body (not split by sections)
    var lines = body.split('\n');
    var blocks = [];
    var i = 0;
    var line, fence, lang, codeLines, listLines, tableLines, blockquoteLines, paraLines, hMatch;

    while (i < lines.length) {
      line = lines[i];
      if (line.trim() === '') { i++; continue; }

      // HR
      if (line.trim().match(/^[-*_]{3,}$/) && !line.trim().match(/^[-*+]\s+/)) {
        blocks.push({ type: 'hr' }); i++; continue;
      }

      // Fenced code
      if (line.trim().indexOf('```') === 0) {
        fence = line.trim(); lang = fence.slice(3).trim(); codeLines = []; i++;
        while (i < lines.length && lines[i].trim() !== '```') { codeLines.push(lines[i]); i++; }
        i++;
        blocks.push({ type: lang === 'mermaid' ? 'mermaid' : 'code', lang: lang || '', content: codeLines.join('\n') });
        continue;
      }

      // Headings
      hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) { blocks.push({ type: 'heading', level: hMatch[1].length, content: hMatch[2] }); i++; continue; }

      // Blockquote
      if (line.trim().charAt(0) === '>') {
        blockquoteLines = [];
        while (i < lines.length && lines[i].trim().charAt(0) === '>') { blockquoteLines.push(lines[i].trim().slice(1).trim()); i++; }
        blocks.push({ type: 'blockquote', content: blockquoteLines.join('\n') }); continue;
      }

      // Unordered list
      if (line.match(/^\s*[-*+]\s+/) && !line.trim().match(/^[-*_]{3,}$/)) {
        listLines = [];
        while (i < lines.length && lines[i].match(/^\s*[-*+]\s+/)) { listLines.push(lines[i].replace(/^\s*[-*+]\s+/, '').trim()); i++; }
        blocks.push({ type: 'ul', items: listLines }); continue;
      }

      // Ordered list
      if (line.match(/^\s*\d+[.)]\s+/)) {
        listLines = [];
        while (i < lines.length && lines[i].match(/^\s*\d+[.)]\s+/)) { listLines.push(lines[i].replace(/^\s*\d+[.)]\s+/, '').trim()); i++; }
        blocks.push({ type: 'ol', items: listLines }); continue;
      }

      // Table
      if (line.indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1] && lines[i + 1].match(/^\s*\|?\s*[-:]+/)) {
        tableLines = [];
        while (i < lines.length && lines[i].indexOf('|') !== -1) { tableLines.push(lines[i]); i++; }
        blocks.push({ type: 'table', lines: tableLines }); continue;
      }

      // Paragraph
      paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' &&
        !lines[i].match(/^#{1,6}\s+/) && !lines[i].match(/^\s*[-*+]\s+/) &&
        !lines[i].match(/^\s*\d+[.)]\s+/) && lines[i].trim().indexOf('```') !== 0 &&
        lines[i].trim().charAt(0) !== '>' && !lines[i].trim().match(/^[-*_]{3,}$/) &&
        !(lines[i].indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1] && lines[i + 1].match(/^\s*\|?\s*[-:]+/))) {
        paraLines.push(lines[i]); i++;
      }
      if (paraLines.length > 0) blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
    }

    // Render blocks to simple HTML
    blocks.forEach(function (block) {
      var node, li, tr, cell;
      switch (block.type) {
        case 'heading':
          node = document.createElement('h' + block.level);
          node.innerHTML = renderInline(block.content);
          break;
        case 'paragraph':
          node = document.createElement('p');
          node.innerHTML = renderInline(block.content);
          break;
        case 'hr':
          node = document.createElement('hr');
          break;
        case 'blockquote':
          node = document.createElement('blockquote');
          block.content.split('\n').forEach(function (l) {
            var p = document.createElement('p');
            p.innerHTML = renderInline(l);
            node.appendChild(p);
          });
          break;
        case 'ul':
          node = document.createElement('ul');
          block.items.forEach(function (item) { li = document.createElement('li'); li.innerHTML = renderInline(item); node.appendChild(li); });
          break;
        case 'ol':
          node = document.createElement('ol');
          block.items.forEach(function (item) { li = document.createElement('li'); li.innerHTML = renderInline(item); node.appendChild(li); });
          break;
        case 'code':
          node = document.createElement('pre');
          var code = document.createElement('code');
          code.textContent = block.content;
          node.appendChild(code);
          break;
        case 'mermaid':
          node = document.createElement('pre');
          node.className = 'mermaid';
          node.textContent = block.content;
          break;
        case 'table':
          var rows = parseTable(block.lines);
          node = document.createElement('table');
          rows.forEach(function (row) {
            tr = document.createElement('tr');
            row.cells.forEach(function (c) {
              cell = document.createElement(row.isHeader ? 'th' : 'td');
              cell.innerHTML = renderInline(c);
              tr.appendChild(cell);
            });
            node.appendChild(tr);
          });
          break;
        default: return;
      }
      if (node) wrapper.appendChild(node);
    });

    return wrapper;
  }

  // ── Init Behaviors ──────────────────────────────────────────────

  function initBehaviors() {
    var root = document.documentElement;

    // 1. Scroll reveal
    var revealTargets = document.querySelectorAll('.load-in, [data-reveal]');
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (target) { revealObserver.observe(target); });

    // 2. Nav highlighting
    var sectionTargets = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (sectionTargets.length > 0 && navLinks.length > 0) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('id');
          var matchingLink = document.querySelector('.nav-links a[href="#' + id + '"]');
          if (!matchingLink) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) { link.removeAttribute('aria-current'); });
            matchingLink.setAttribute('aria-current', 'true');
          }
        });
      }, { threshold: 0.4 });
      sectionTargets.forEach(function (section) { navObserver.observe(section); });
    }

    // 3. Load-in stagger
    document.querySelectorAll('.load-in').forEach(function (element, index) {
      element.style.transitionDelay = index * 120 + 'ms';
    });

    // 4. Theme & language
    (function () {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      root.setAttribute('data-theme', theme);

      var lang = localStorage.getItem('lang') || 'zh';
      root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
      document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
        var val = el.getAttribute('data-' + lang);
        if (val !== null) el.innerHTML = val;
      });
    })();

    // 5. Mermaid init (only progressive view)
    if (window.mermaid) {
      var progMermaids = document.querySelectorAll('.view-progressive .mermaid');
      if (progMermaids.length > 0) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: root.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: '"Noto Sans SC", "Space Grotesk", sans-serif'
        });
        window.mermaid.run({ nodes: progMermaids });
      }
    }
  }

  // ── Main Render Function ────────────────────────────────────────

  function renderFromText(raw, container) {
    var parsed = parseFrontmatter(raw);
    var meta = parsed.meta;
    var sections = splitSections(parsed.body);

    var heroSection = null;
    var contentSections = [];
    var titleText = meta.title || document.title || 'Untitled';

    sections.forEach(function (sec) {
      if (sec.level === 1 && !heroSection) { heroSection = sec; titleText = sec.title; }
      else if (sec.level === 2) { contentSections.push(sec); }
    });

    document.title = titleText;

    // ── Build Progressive View ──
    var progressiveView = el('div', 'view-progressive');

    var introBlocks = heroSection ? parseBlocks(heroSection.lines) : [];
    var hero = buildHero(meta, titleText, introBlocks);
    progressiveView.appendChild(hero);

    var navEl = progressiveView.querySelector('.nav-links');
    if (navEl && contentSections.length > 0) {
      navEl.innerHTML = '';
      contentSections.forEach(function (sec, idx) {
        var link = el('a', '', sec.title.replace(/^\d+\.\s*/, ''));
        link.href = '#section-' + (idx + 1);
        navEl.appendChild(link);
      });
    }

    var main = el('main');
    contentSections.forEach(function (sec, idx) {
      main.appendChild(buildSection(sec, idx));
    });
    progressiveView.appendChild(main);
    progressiveView.appendChild(buildFooter(titleText));

    container.appendChild(progressiveView);

    // ── Build Markdown Plain View (independent DOM) ──
    var plainView = el('div', 'view-markdown');
    plainView.style.display = 'none';

    // Simple topbar for plain view
    var plainTopbar = el('div', 'md-topbar');
    var plainHome = el('a', '', '← 返回首页');
    plainHome.href = '../../';
    plainTopbar.appendChild(plainHome);
    var plainToggle = el('button', 'view-mode-toggle is-plain-toggle');
    plainToggle.type = 'button';
    plainToggle.title = '切换为渐进式视图';
    plainToggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    plainTopbar.appendChild(plainToggle);
    plainView.appendChild(plainTopbar);

    var plainContent = buildPlainMarkdown(raw);
    plainView.appendChild(plainContent);

    container.appendChild(plainView);

    // ── Wire toggle between views ──
    var isPlainMode = false;
    var allToggles = container.querySelectorAll('.view-mode-toggle');

    var switchView = function () {
      isPlainMode = !isPlainMode;
      progressiveView.style.display = isPlainMode ? 'none' : '';
      plainView.style.display = isPlainMode ? '' : 'none';
      allToggles.forEach(function (btn) {
        btn.title = isPlainMode ? '切换为渐进式视图' : '切换为 Markdown 视图';
      });
      // Init mermaid in plain view on first switch
      if (isPlainMode && window.mermaid) {
        var unprocessed = plainView.querySelectorAll('.mermaid:not([data-processed])');
        if (unprocessed.length > 0) {
          // Need a real paint cycle for container to have layout dimensions
          setTimeout(function () {
            window.mermaid.run({ nodes: unprocessed });
          }, 100);
        }
      }
      window.scrollTo(0, 0);
    };

    allToggles.forEach(function (btn) {
      btn.addEventListener('click', switchView);
    });

    // Init behaviors for progressive view
    requestAnimationFrame(function () {
      initBehaviors();
    });
  }

  function render(source, container) {
    // Check for inline <script type="text/markdown">
    var inlineScript = document.querySelector('script[type="text/markdown"]');
    if (inlineScript) {
      renderFromText(inlineScript.textContent, container);
      return;
    }

    // Fall back to fetch
    fetch(source)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load: ' + source);
        return response.text();
      })
      .then(function (raw) {
        renderFromText(raw, container);
      })
      .catch(function (error) {
        console.error('Article render error:', error);
        container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);">' +
          '<h2>加载失败</h2><p>' + error.message + '</p></div>';
      });
  }

  // ── Export ───────────────────────────────────────────────────────
  window.StudyRoom = window.StudyRoom || {};
  window.StudyRoom.render = render;

})();

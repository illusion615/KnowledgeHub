// tools/markdown-compiler/section-compiler.js
// Parses Markdown body into Hero lead override + numbered `<section class="section">` chapters
// and dispatches custom `:::` directives, `###` subsections, tables, blockquotes, and formulas.

'use strict';

var fm = require('./frontmatter');
var inline = require('./inline-and-math');
var directives = require('./directives');

function parseSectionHeading(rawHeading, index) {
  var text = String(rawHeading || '').trim();
  var customId = '';

  // Extract optional `#custom-id` prefix or `{ #id }` suffix
  var prefixId = text.match(/^#([a-zA-Z][\w-]*)\s+(.+)$/);
  if (prefixId) {
    customId = prefixId[1];
    text = prefixId[2].trim();
  }
  var suffixId = text.match(/^(.*?)\s*\{\s*#([a-zA-Z][\w-]*)\s*\}\s*$/);
  if (suffixId) {
    customId = suffixId[2];
    text = suffixId[1].trim();
  }

  var numStr = index < 10 ? '0' + index : String(index);
  var kickerText = '';
  var titleRaw = text;

  // Syntax: `01 / Kicker :: 章节标题 || Section Title`
  var doubleColonIdx = text.indexOf('::');
  if (doubleColonIdx !== -1) {
    kickerText = text.slice(0, doubleColonIdx).trim();
    titleRaw = text.slice(doubleColonIdx + 2).trim();
  }

  var titlePair = fm.parseBilingual(titleRaw);
  // Ensure numbered h2 prefix if not already numbered
  var zhHasNum = /^\d+\.\s*/.test(titlePair.zh);
  var enHasNum = /^\d+\.\s*/.test(titlePair.en);
  var displayZh = zhHasNum ? titlePair.zh : index + '. ' + titlePair.zh;
  var displayEn = enHasNum ? titlePair.en : index + '. ' + (titlePair.en || titlePair.zh);

  var cleanEnKicker = (titlePair.en || titlePair.zh).replace(/^\d+\.\s*/, '');
  if (!kickerText) {
    kickerText = numStr + ' / ' + cleanEnKicker;
  } else if (!/^\d+\s*\//.test(kickerText)) {
    kickerText = numStr + ' / ' + kickerText;
  }

  var sectionId = customId || fm.slugify(cleanEnKicker, index);
  if (/^(?:参考(?:资料|来源|文献)|references?|bibliography)/i.test(titlePair.zh) || /^(?:references?|bibliography)/i.test(titlePair.en)) {
    sectionId = 'references';
  }

  // Short nav label
  var shortZh = titlePair.zh.replace(/^\d+\.\s*/, '').split(/[：:]/)[0].trim();
  var shortEn = (titlePair.en || shortZh).replace(/^\d+\.\s*/, '').split(/[：:]/)[0].trim();

  return {
    id: sectionId,
    index: index,
    kicker: { zh: kickerText, en: kickerText },
    title: { zh: titlePair.zh.replace(/^\d+\.\s*/, ''), en: cleanEnKicker },
    h2: { zh: displayZh, en: displayEn },
    nav: { zh: shortZh, en: shortEn }
  };
}

function splitMarkdownChapters(body) {
  var lines = String(body || '').split('\n');
  var introLines = [];
  var chapters = [];
  var current = null;
  var inFence = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    }
    if (!inFence) {
      var h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match && !current && chapters.length === 0) {
        introLines.push({ type: 'h1', text: h1Match[1].trim() });
        continue;
      }
      var h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        if (current) chapters.push(current);
        current = {
          rawHeading: h2Match[1].trim(),
          lines: []
        };
        continue;
      }
    }

    if (current) {
      current.lines.push(line);
    } else {
      introLines.push({ type: 'line', text: line });
    }
  }

  if (current) chapters.push(current);
  return { introLines: introLines, chapters: chapters };
}

function compileReferencesList(lines, state) {
  var items = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var m = line.match(/^(?:[-*+]|\d+[.)]|\[\d+\])\s*(.+)$/);
    if (!m) continue;
    var content = m[1].trim();
    // Remove leading [n] if present
    content = content.replace(/^\[\d+\]\s*/, '');
    var idx = items.length + 1;

    // Pattern: Author — URL | Notezh || NoteEn
    var urlMatch = content.match(/(https?:\/\/[^\s|]+)/);
    var url = urlMatch ? urlMatch[1] : '';
    var beforeUrl = url ? content.slice(0, content.indexOf(url)).replace(/[—–-]\s*$/, '').trim() : content;
    var afterUrl = url ? content.slice(content.indexOf(url) + url.length).replace(/^[—–|\s-]+/, '').trim() : '';

    var author = beforeUrl.replace(/^\*\*|\*\*$/g, '').trim() || ('Ref ' + idx);
    var notePair = fm.parseBilingual(afterUrl || author);

    items.push(
      [
        '            <li id="ref-' + idx + '">',
        '              <span class="bib-id">[' + idx + ']</span>',
        '              <span class="bib-author">' + fm.escapeHtml(author) + '</span>' + (url ? ' —' : ''),
        url ? '              <a href="' + fm.escapeAttr(url) + '" target="_blank" rel="noopener">' + fm.escapeHtml(url) + '</a>' : '',
        afterUrl ? '              <span class="bib-note" ' + fm.bilingualAttrs(notePair) + '>' + inline.renderInlineMarkdown(notePair.zh, state) + '</span>' : '',
        '            </li>'
      ].filter(Boolean).join('\n')
    );
  }

  return [
    '          <ol class="bib-list">',
    items.join('\n'),
    '          </ol>'
  ].join('\n');
}

function compileChapterBody(lines, sectionCtx, state) {
  // Lead paragraph: first non-empty plain paragraph before any directive/heading/table/fence
  var i = 0;
  while (i < lines.length && !lines[i].trim()) i++;

  var leadParagraph = '';
  if (i < lines.length) {
    var first = lines[i].trim();
    if (
      first &&
      first.indexOf(':::') !== 0 &&
      first.indexOf('```') !== 0 &&
      first.indexOf('###') !== 0 &&
      first.charAt(0) !== '>' &&
      first.charAt(0) !== '|' &&
      !/^(?:[-*+]|\d+[.)])\s/.test(first)
    ) {
      var leadLines = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        lines[i].trim().indexOf(':::') !== 0 &&
        lines[i].trim().indexOf('```') !== 0 &&
        lines[i].trim().indexOf('###') !== 0 &&
        lines[i].trim().charAt(0) !== '>'
      ) {
        leadLines.push(lines[i].trim());
        i++;
      }
      leadParagraph = leadLines.join(' ');
    }
  }

  var remaining = lines.slice(i);
  if (sectionCtx.id === 'references') {
    return {
      lead: leadParagraph,
      bodyHtml: compileReferencesList(remaining, state)
    };
  }

  var blocks = [];
  var cursor = 0;
  var pendingSubsections = [];

  function flushPendingSubsections() {
    if (pendingSubsections.length === 0) return;
    var accLines = [];
    pendingSubsections.forEach(function (sub, idx) {
      var openAttr = idx === 0 ? ' { open: true }' : '';
      accLines.push('::panel' + openAttr);
      accLines.push('### ' + sub.title);
      sub.lines.forEach(function (l) { accLines.push(l); });
    });
    blocks.push(directives.renderAccordionGroup({}, accLines, sectionCtx, state));
    pendingSubsections = [];
  }

  while (cursor < remaining.length) {
    var line = remaining[cursor];
    var trimmed = line.trim();

    if (!trimmed) {
      cursor++;
      continue;
    }

    // Horizontal slide break `---`
    if (/^---\s*$/.test(trimmed)) {
      flushPendingSubsections();
      cursor++;
      continue;
    }

    // Custom container directive `:::type { ... }`
    var dirMatch = trimmed.match(/^:::([a-zA-Z][\w-]*)(?:\s+(.*))?$/);
    if (dirMatch && dirMatch[1] !== '') {
      flushPendingSubsections();
      var dirType = dirMatch[1].toLowerCase();
      var dirAttrRaw = (dirMatch[2] || '').trim();
      var dirAttrs = fm.parseInlineAttrs(dirAttrRaw);
      var innerLines = [];
      cursor++;
      while (cursor < remaining.length && !/^\s*:::\s*$/.test(remaining[cursor])) {
        innerLines.push(remaining[cursor]);
        cursor++;
      }
      cursor++; // skip closing `:::`

      if (dirType === 'insight-grid' || dirType === 'insights') {
        blocks.push(directives.renderInsightGrid(dirAttrs, innerLines, sectionCtx, state));
      } else if (dirType === 'comparison' || dirType === 'comparison-grid') {
        blocks.push(directives.renderComparisonGrid(dirAttrs, innerLines, sectionCtx, state));
      } else if (dirType === 'accordion') {
        blocks.push(directives.renderAccordionGroup(dirAttrs, innerLines, sectionCtx, state));
      } else if (dirType === 'flow' || dirType === 'timeline') {
        blocks.push(directives.renderFlowOrTimeline(dirType, dirAttrs, innerLines, sectionCtx, state));
      } else if (dirType === 'callout' || dirType === 'quote') {
        if (dirType === 'callout' && !dirAttrs.variant) dirAttrs.variant = 'callout';
        blocks.push(directives.renderCallout(dirAttrs, innerLines, sectionCtx, state));
      } else if (dirType === 'diagram') {
        blocks.push(directives.renderDiagram(dirAttrs, innerLines, sectionCtx));
      } else if (dirType === 'sandbox') {
        blocks.push(directives.renderSandbox(dirAttrs, innerLines, sectionCtx, state));
      } else {
        blocks.push(inline.renderMarkdownFragment(innerLines.join('\n'), state));
      }
      continue;
    }

    // `### Subsection` -> auto-grouped into `[data-accordion]` progressive disclosure drawers
    var h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      var subTitle = h3Match[1].trim();
      var subLines = [];
      cursor++;
      while (cursor < remaining.length) {
        var peek = remaining[cursor];
        var peekTrim = peek.trim();
        if (/^###\s+/.test(peek) || /^:::[a-zA-Z]/.test(peekTrim) || /^---\s*$/.test(peekTrim)) {
          break;
        }
        subLines.push(peek);
        cursor++;
      }
      pendingSubsections.push({ title: subTitle, lines: subLines });
      continue;
    }

    // Blockquote `> ...` -> `.quote-block`
    if (trimmed.charAt(0) === '>') {
      flushPendingSubsections();
      var quoteLines = [];
      while (cursor < remaining.length && remaining[cursor].trim().charAt(0) === '>') {
        quoteLines.push(remaining[cursor].trim().replace(/^>\s?/, ''));
        cursor++;
      }
      blocks.push(directives.renderCallout({}, quoteLines, sectionCtx, state));
      continue;
    }

    // Fenced code or Mermaid block at section root
    if (/^\s*```/.test(trimmed)) {
      flushPendingSubsections();
      var fenceLines = [line];
      cursor++;
      while (cursor < remaining.length && !/^\s*```\s*$/.test(remaining[cursor])) {
        fenceLines.push(remaining[cursor]);
        cursor++;
      }
      if (cursor < remaining.length) {
        fenceLines.push(remaining[cursor]);
        cursor++;
      }
      blocks.push('          ' + inline.renderMarkdownFragment(fenceLines.join('\n'), state).trim());
      continue;
    }

    // Standard Markdown chunk (tables, paragraphs, lists, math blocks)
    flushPendingSubsections();
    var chunkLines = [];
    while (
      cursor < remaining.length &&
      !/^###\s+/.test(remaining[cursor]) &&
      !/^:::[a-zA-Z]/.test(remaining[cursor].trim()) &&
      !/^\s*```/.test(remaining[cursor].trim()) &&
      remaining[cursor].trim().charAt(0) !== '>' &&
      !/^---\s*$/.test(remaining[cursor].trim())
    ) {
      chunkLines.push(remaining[cursor]);
      cursor++;
    }
    var renderedChunk = inline.renderMarkdownFragment(chunkLines.join('\n'), state).trim();
    if (renderedChunk) {
      blocks.push('          ' + renderedChunk);
    }
  }

  flushPendingSubsections();

  return {
    lead: leadParagraph,
    bodyHtml: blocks.join('\n\n')
  };
}

function compileAllChapters(body, state) {
  var split = splitMarkdownChapters(body);
  var compiledChapters = [];

  split.chapters.forEach(function (chap, idx) {
    var ctx = parseSectionHeading(chap.rawHeading, idx + 1);
    var compiled = compileChapterBody(chap.lines, ctx, state);
    var leadPair = fm.parseBilingual(compiled.lead);
    var leadHtml = compiled.lead
      ? '\n            <p ' + fm.bilingualAttrs(leadPair) + '>' + inline.renderInlineMarkdown(leadPair.zh, state) + '</p>'
      : '';

    var stepTitleAttr = ' data-present-title-zh="' + fm.escapeAttr(ctx.title.zh) + '" data-present-title-en="' + fm.escapeAttr(ctx.title.en) + '"';
    var densityExempt = ctx.id === 'references' ? ' data-density-exempt="references"' : '';

    var sectionHtml = [
      '        <section id="' + fm.escapeAttr(ctx.id) + '" class="section" data-reveal' + stepTitleAttr + densityExempt + '>',
      '          <div class="section-head">',
      '            <p class="section-kicker">' + fm.escapeHtml(ctx.kicker.zh) + '</p>',
      '            <h2 ' + fm.bilingualAttrs(ctx.h2) + '>' + fm.escapeHtml(ctx.h2.zh) + '</h2>' + leadHtml,
      '          </div>',
      '',
      compiled.bodyHtml,
      '        </section>'
    ].join('\n');

    compiledChapters.push({
      ctx: ctx,
      html: sectionHtml
    });
  });

  // Extract optional intro lead & quote from introLines
  var introLead = '';
  var introQuote = [];
  var plainIntro = [];
  split.introLines.forEach(function (entry) {
    if (entry.type === 'h1') return;
    var t = entry.text.trim();
    if (!t) return;
    if (t.charAt(0) === '>') {
      introQuote.push(t.replace(/^>\s?/, '').trim());
    } else {
      plainIntro.push(t);
    }
  });
  if (plainIntro.length > 0) {
    introLead = plainIntro.join(' ');
  }

  return {
    introLead: introLead,
    introQuote: introQuote,
    chapters: compiledChapters
  };
}

module.exports = {
  parseSectionHeading: parseSectionHeading,
  compileAllChapters: compileAllChapters
};

'use strict';

// Study Room Figure Engine v2 — Design Tokens, Text Metrics & Bilingual Primitives
// Strictly zero runtime dependencies; emits CSS-variable-bound SVG expressions.

var FONT_STACK = 'Space Grotesk, Noto Sans SC, -apple-system, BlinkMacSystemFont, sans-serif';

var ROLE_TOKEN_MAP = {
  required: {
    fill: 'var(--fig-role-rose-fill, rgba(225, 29, 72, 0.08))',
    stroke: 'var(--fig-role-rose-stroke, rgba(225, 29, 72, 0.48))',
    bar: 'var(--fig-role-rose-bar, #e11d48)',
    text: 'var(--fig-role-rose-text, #9f1239)',
    hexFill: '#FFF1F2',
    hexStroke: '#E11D48',
    hexText: '#9F1239'
  },
  actor: {
    fill: 'var(--fig-role-accent-fill, rgba(255, 122, 0, 0.09))',
    stroke: 'var(--fig-role-accent-stroke, rgba(234, 88, 12, 0.48))',
    bar: 'var(--fig-role-accent-bar, #ea580c)',
    text: 'var(--fig-role-accent-text, #9a3412)',
    hexFill: '#FFF7EF',
    hexStroke: '#EA580C',
    hexText: '#7C2D12'
  },
  interface: {
    fill: 'var(--fig-role-teal-fill, rgba(13, 143, 140, 0.09))',
    stroke: 'var(--fig-role-teal-stroke, rgba(13, 143, 140, 0.46))',
    bar: 'var(--fig-role-teal-bar, #0d8f8c)',
    text: 'var(--fig-role-teal-text, #115e59)',
    hexFill: '#EFF9F7',
    hexStroke: '#0D8F8C',
    hexText: '#115E59'
  },
  service: {
    fill: 'var(--fig-role-blue-fill, rgba(37, 99, 235, 0.07))',
    stroke: 'var(--fig-role-blue-stroke, rgba(59, 130, 246, 0.42))',
    bar: 'var(--fig-role-blue-bar, #2563eb)',
    text: 'var(--fig-role-blue-text, #1e3a8a)',
    hexFill: '#EFF6FF',
    hexStroke: '#3B82F6',
    hexText: '#1E3A8A'
  },
  data: {
    fill: 'var(--fig-role-violet-fill, rgba(124, 58, 237, 0.08))',
    stroke: 'var(--fig-role-violet-stroke, rgba(139, 92, 246, 0.42))',
    bar: 'var(--fig-role-violet-bar, #7c3aed)',
    text: 'var(--fig-role-violet-text, #4c1d95)',
    hexFill: '#F5F3FF',
    hexStroke: '#8B5CF6',
    hexText: '#4C1D95'
  },
  control: {
    fill: 'var(--fig-role-amber-fill, rgba(217, 119, 6, 0.09))',
    stroke: 'var(--fig-role-amber-stroke, rgba(217, 119, 6, 0.44))',
    bar: 'var(--fig-role-amber-bar, #d97706)',
    text: 'var(--fig-role-amber-text, #78350f)',
    hexFill: '#FFFBEB',
    hexStroke: '#D97706',
    hexText: '#78350F'
  },
  artifact: {
    fill: 'var(--fig-role-slate-fill, rgba(71, 85, 105, 0.07))',
    stroke: 'var(--fig-role-slate-stroke, rgba(100, 116, 139, 0.38))',
    bar: 'var(--fig-role-slate-bar, #64748b)',
    text: 'var(--fig-role-slate-text, #334155)',
    hexFill: '#F8FAFC',
    hexStroke: '#94A3B8',
    hexText: '#334155'
  }
};

// Alias roles for convenience in inline FigureSpec v2
ROLE_TOKEN_MAP.accent = ROLE_TOKEN_MAP.actor;
ROLE_TOKEN_MAP.teal = ROLE_TOKEN_MAP.interface;
ROLE_TOKEN_MAP.blue = ROLE_TOKEN_MAP.service;
ROLE_TOKEN_MAP.violet = ROLE_TOKEN_MAP.data;
ROLE_TOKEN_MAP.amber = ROLE_TOKEN_MAP.control;
ROLE_TOKEN_MAP.rose = ROLE_TOKEN_MAP.required;
ROLE_TOKEN_MAP.slate = ROLE_TOKEN_MAP.artifact;

var GROUP_TOKEN_STYLES = [
  {
    fill: 'var(--fig-group-bg-1, rgba(255, 250, 244, 0.72))',
    stroke: 'var(--fig-group-border, rgba(23, 36, 48, 0.11))',
    title: 'var(--fig-role-accent-text, #9a3412)',
    badge: 'var(--fig-role-accent-bar, #ea580c)',
    hexFill: '#FFF9F3',
    hexStroke: '#DED2C3',
    hexTitle: '#7C2D12'
  },
  {
    fill: 'var(--fig-group-bg-2, rgba(244, 248, 252, 0.72))',
    stroke: 'var(--fig-group-border, rgba(23, 36, 48, 0.11))',
    title: 'var(--fig-role-blue-text, #1e3a8a)',
    badge: 'var(--fig-role-blue-bar, #2563eb)',
    hexFill: '#F7FAFC',
    hexStroke: '#CAD7E2',
    hexTitle: '#1E3A5F'
  },
  {
    fill: 'var(--fig-group-bg-3, rgba(248, 245, 252, 0.72))',
    stroke: 'var(--fig-group-border, rgba(23, 36, 48, 0.11))',
    title: 'var(--fig-role-violet-text, #4c1d95)',
    badge: 'var(--fig-role-violet-bar, #7c3aed)',
    hexFill: '#FAF8FC',
    hexStroke: '#D8CEE5',
    hexTitle: '#4C1D95'
  },
  {
    fill: 'var(--fig-group-bg-4, rgba(243, 250, 248, 0.72))',
    stroke: 'var(--fig-group-border, rgba(23, 36, 48, 0.11))',
    title: 'var(--fig-role-teal-text, #115e59)',
    badge: 'var(--fig-role-teal-bar, #0d8f8c)',
    hexFill: '#F5FAF8',
    hexStroke: '#C5DDD8',
    hexTitle: '#115E59'
  }
];

var SERIES_TOKENS = [
  'var(--fig-series-1, #ea580c)',
  'var(--fig-series-2, #0d8f8c)',
  'var(--fig-series-3, #2563eb)',
  'var(--fig-series-4, #7c3aed)',
  'var(--fig-series-5, #d97706)',
  'var(--fig-series-6, #e11d48)'
];

var STANDALONE_STYLE_BLOCK = [
  '<style>',
  ':root{--fig-canvas-bg:#fcf8f2;--fig-group-bg-1:rgba(255,250,244,0.88);--fig-group-bg-2:rgba(244,248,252,0.88);--fig-group-bg-3:rgba(248,245,252,0.88);--fig-group-bg-4:rgba(243,250,248,0.88);--fig-group-border:rgba(23,36,48,0.12);--fig-group-divider:rgba(23,36,48,0.08);--fig-group-header-bg:rgba(23,36,48,0.03);--fig-node-bg:rgba(255,255,255,0.95);--fig-node-border:rgba(23,36,48,0.14);--fig-node-top-glow:rgba(255,255,255,0.9);--fig-text-strong:#172430;--fig-text-muted:#52616d;--fig-text-subtle:#64748b;--fig-edge-stroke:#5b6b7c;--fig-edge-muted:#8292a2;--fig-edge-label-bg:rgba(252,247,240,0.95);--fig-edge-label-border:rgba(23,36,48,0.12);--fig-port-fill:#ffffff;--fig-grid-line:rgba(23,36,48,0.09);--fig-axis-line:rgba(23,36,48,0.24);--fig-quadrant-tint:rgba(13,143,140,0.05);}',
  '@media (prefers-color-scheme: dark){:root{--fig-canvas-bg:#121820;--fig-group-bg-1:rgba(25,34,46,0.82);--fig-group-bg-2:rgba(21,30,42,0.82);--fig-group-bg-3:rgba(27,31,46,0.82);--fig-group-bg-4:rgba(20,34,39,0.82);--fig-group-border:rgba(255,255,255,0.11);--fig-group-divider:rgba(255,255,255,0.07);--fig-group-header-bg:rgba(255,255,255,0.03);--fig-node-bg:rgba(28,38,50,0.92);--fig-node-border:rgba(255,255,255,0.14);--fig-node-top-glow:rgba(255,255,255,0.18);--fig-text-strong:#f1f5f9;--fig-text-muted:#cbd5e1;--fig-text-subtle:#94a3b8;--fig-edge-stroke:#94a3b8;--fig-edge-muted:#64748b;--fig-edge-label-bg:rgba(15,21,29,0.94);--fig-edge-label-border:rgba(255,255,255,0.14);--fig-port-fill:#0f172a;--fig-grid-line:rgba(255,255,255,0.08);--fig-axis-line:rgba(255,255,255,0.24);--fig-quadrant-tint:rgba(45,212,191,0.07);--fig-role-accent-fill:rgba(255,122,0,0.15);--fig-role-accent-stroke:rgba(251,146,60,0.52);--fig-role-accent-bar:#fb923c;--fig-role-accent-text:#fed7aa;--fig-role-teal-fill:rgba(20,184,166,0.15);--fig-role-teal-stroke:rgba(45,212,191,0.5);--fig-role-teal-bar:#2dd4bf;--fig-role-teal-text:#99f6e4;--fig-role-blue-fill:rgba(59,130,246,0.15);--fig-role-blue-stroke:rgba(96,165,250,0.48);--fig-role-blue-bar:#60a5fa;--fig-role-blue-text:#bfdbfe;--fig-role-violet-fill:rgba(139,92,246,0.16);--fig-role-violet-stroke:rgba(167,139,250,0.48);--fig-role-violet-bar:#a78bfa;--fig-role-violet-text:#ddd6fe;--fig-role-amber-fill:rgba(245,158,11,0.15);--fig-role-amber-stroke:rgba(251,191,36,0.48);--fig-role-amber-bar:#fbbf24;--fig-role-amber-text:#fde68a;--fig-role-rose-fill:rgba(244,63,94,0.16);--fig-role-rose-stroke:rgba(251,113,133,0.54);--fig-role-rose-bar:#fb7185;--fig-role-rose-text:#fecdd3;--fig-role-slate-fill:rgba(148,163,184,0.12);--fig-role-slate-stroke:rgba(148,163,184,0.38);--fig-role-slate-bar:#94a3b8;--fig-role-slate-text:#e2e8f0;--fig-series-1:#fb923c;--fig-series-2:#2dd4bf;--fig-series-3:#60a5fa;--fig-series-4:#a78bfa;--fig-series-5:#fbbf24;--fig-series-6:#fb7185;}}',
  '</style>'
].join('');

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseBilingualValue(value, context) {
  if (value == null || value === '') {
    return { zh: '', en: '' };
  }
  if (typeof value === 'string') {
    var idx = value.indexOf('||');
    if (idx !== -1) {
      var zhPart = value.slice(0, idx).trim();
      var enPart = value.slice(idx + 2).trim();
      return { zh: zhPart, en: enPart || zhPart };
    }
    var trimmed = value.trim();
    return { zh: trimmed, en: trimmed };
  }
  if (typeof value === 'object') {
    var zh = typeof value.zh === 'string' ? value.zh.trim() : '';
    var en = typeof value.en === 'string' ? value.en.trim() : '';
    if (!zh && !en && context) {
      throw new Error('Missing localized text for ' + context);
    }
    return { zh: zh || en, en: en || zh };
  }
  var str = String(value);
  return { zh: str, en: str };
}

function localized(value, lang, context) {
  var pair = parseBilingualValue(value, context);
  var target = lang === 'en' ? pair.en : pair.zh;
  if (!target && context) {
    throw new Error('Missing ' + lang + ' text for ' + context);
  }
  return target;
}

var WIDE_CHAR = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/;
var BREAK_AFTER = ' /、，；：·|-';

function charWidth(ch, fontSize) {
  if (WIDE_CHAR.test(ch)) return fontSize * 1.01;
  if (ch === ' ') return fontSize * 0.28;
  if ('iljt.,;:!\'`|'.indexOf(ch) >= 0) return fontSize * 0.31;
  if ('fr()[]{}'.indexOf(ch) >= 0) return fontSize * 0.40;
  if ('mwMW'.indexOf(ch) >= 0) return fontSize * 0.85;
  if (ch >= 'A' && ch <= 'Z') return fontSize * 0.67;
  if (ch >= '0' && ch <= '9') return fontSize * 0.58;
  return fontSize * 0.55;
}

function measureText(text, fontSize) {
  var s = String(text == null ? '' : text);
  var total = 0;
  for (var i = 0; i < s.length; i += 1) total += charWidth(s.charAt(i), fontSize);
  return total;
}

function wrapText(text, maxWidth, fontSize) {
  var value = String(text == null ? '' : text).trim();
  if (!value) return [];
  if (maxWidth <= 0 || measureText(value, fontSize) <= maxWidth) return [value];
  var lines = [];
  var current = '';
  var breakAt = 0;
  for (var i = 0; i < value.length; i += 1) {
    var ch = value.charAt(i);
    if (measureText(current + ch, fontSize) > maxWidth && current) {
      var cut = WIDE_CHAR.test(ch) || breakAt === 0 ? current.length : breakAt;
      lines.push(current.slice(0, cut).replace(/\s+$/, ''));
      current = current.slice(cut).replace(/^\s+/, '');
      breakAt = 0;
    }
    current += ch;
    if (BREAK_AFTER.indexOf(ch) >= 0) breakAt = current.length;
  }
  if (current.replace(/\s+$/, '')) lines.push(current.replace(/\s+$/, ''));
  return lines;
}

function renderMultilineText(lines, x, firstBaseline, lineHeight, attrs) {
  if (!lines || !lines.length) return '';
  var tspans = lines.map(function (line, idx) {
    return '<tspan x="' + x + '" y="' + Math.round((firstBaseline + idx * lineHeight) * 10) / 10 + '">' + escapeXml(line) + '</tspan>';
  }).join('');
  return '<text x="' + x + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + tspans + '</text>';
}

// Emits single-language <text> if lang is 'zh' or 'en', or dual `.sr-zh` + `.sr-en` nodes when lang === 'bilingual'
function renderLangText(value, x, y, attrs, lang) {
  var pair = parseBilingualValue(value);
  if (!pair.zh && !pair.en) return '';
  if (lang === 'zh') {
    return '<text x="' + x + '" y="' + y + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + escapeXml(pair.zh) + '</text>';
  }
  if (lang === 'en') {
    return '<text x="' + x + '" y="' + y + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + escapeXml(pair.en) + '</text>';
  }
  if (pair.zh === pair.en) {
    return '<text x="' + x + '" y="' + y + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + escapeXml(pair.zh) + '</text>';
  }
  return [
    '<text class="sr-zh" x="' + x + '" y="' + y + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + escapeXml(pair.zh) + '</text>',
    '<text class="sr-en" x="' + x + '" y="' + y + '" font-family="' + FONT_STACK + '" ' + attrs + '>' + escapeXml(pair.en) + '</text>'
  ].join('');
}

// Renders pill-backed label that sizes properly in zh, en, or bilingual mode
function renderPillLabel(value, x, y, anchor, lang, extraAttrs) {
  var pair = parseBilingualValue(value);
  if (!pair.zh && !pair.en) return '';
  var fontSize = 12;

  function onePill(text, cls) {
    if (!text) return '';
    var w = Math.round(Math.max(48, measureText(text, fontSize) + 18));
    var h = 22;
    var rx = anchor === 'start' ? x - 8 : anchor === 'end' ? x - w + 8 : Math.round(x - w / 2);
    var ry = Math.round(y - 15);
    var tx = anchor === 'start' ? rx + Math.round(w / 2) : anchor === 'end' ? rx + Math.round(w / 2) : x;
    var gClass = cls ? ' class="' + cls + '"' : '';
    return '<g' + gClass + (extraAttrs ? ' ' + extraAttrs : '') + '>' +
      '<rect x="' + rx + '" y="' + ry + '" width="' + w + '" height="' + h + '" rx="7" fill="var(--fig-edge-label-bg, rgba(252, 247, 240, 0.95))" stroke="var(--fig-edge-label-border, rgba(23, 36, 48, 0.12))" stroke-width="1"/>' +
      '<text x="' + tx + '" y="' + y + '" text-anchor="middle" font-family="' + FONT_STACK + '" font-size="' + fontSize + '" font-weight="600" fill="var(--fig-text-muted, #52616d)">' + escapeXml(text) + '</text>' +
      '</g>';
  }

  if (lang === 'zh') return onePill(pair.zh, '');
  if (lang === 'en') return onePill(pair.en, '');
  if (pair.zh === pair.en) return onePill(pair.zh, '');
  return onePill(pair.zh, 'sr-zh') + onePill(pair.en, 'sr-en');
}

function getRoleStyle(role) {
  return ROLE_TOKEN_MAP[role] || ROLE_TOKEN_MAP.service;
}

function getSeriesColor(index, explicitRoleOrColor) {
  if (explicitRoleOrColor && ROLE_TOKEN_MAP[explicitRoleOrColor]) {
    return ROLE_TOKEN_MAP[explicitRoleOrColor].bar;
  }
  if (explicitRoleOrColor && String(explicitRoleOrColor).indexOf('var(') === 0) {
    return explicitRoleOrColor;
  }
  return SERIES_TOKENS[index % SERIES_TOKENS.length];
}

module.exports = {
  FONT_STACK: FONT_STACK,
  ROLE_TOKEN_MAP: ROLE_TOKEN_MAP,
  GROUP_TOKEN_STYLES: GROUP_TOKEN_STYLES,
  SERIES_TOKENS: SERIES_TOKENS,
  STANDALONE_STYLE_BLOCK: STANDALONE_STYLE_BLOCK,
  escapeXml: escapeXml,
  parseBilingualValue: parseBilingualValue,
  localized: localized,
  measureText: measureText,
  wrapText: wrapText,
  renderMultilineText: renderMultilineText,
  renderLangText: renderLangText,
  renderPillLabel: renderPillLabel,
  getRoleStyle: getRoleStyle,
  getSeriesColor: getSeriesColor
};

'use strict';

// Study Room Figure Engine v2 — Topology SVG & Draw.io Serializer
// Renders architecture swimlanes, flowcharts, hierarchies, and sequence diagrams
// with native CSS custom properties, bilingual text layers, and pill label backdrops.

var tk = require('./tokens');
var layout = require('./topology-layout');

function renderNodeCardText(node, style, lang) {
  var innerWidth = node.width - 32;
  var centerX = Math.round(node.x + 4 + (node.width - 4) / 2);

  function buildForOneLang(labelText, detailText, cls) {
    var lLines = tk.wrapText(labelText, innerWidth, 14.5);
    var dLines = detailText ? tk.wrapText(detailText, innerWidth, 11.5) : [];
    var lLead = 18;
    var dLead = 14.5;
    var totalH = lLines.length * lLead + (dLines.length ? 5 + dLines.length * dLead : 0);
    var lBase = Math.round(node.y + (node.height - totalH) / 2 + 13.5);
    var dBase = lBase + lLines.length * lLead + 3;
    var wrapStart = cls ? '<g class="' + cls + '">' : '';
    var wrapEnd = cls ? '</g>' : '';
    return wrapStart +
      tk.renderMultilineText(lLines, centerX, lBase, lLead, 'text-anchor="middle" font-size="14.5" font-weight="700" fill="' + style.text + '"') +
      tk.renderMultilineText(dLines, centerX, dBase, dLead, 'text-anchor="middle" font-size="11.5" font-weight="500" fill="var(--fig-text-muted, #52616d)"') +
      wrapEnd;
  }

  var labelPair = tk.parseBilingualValue(node.rawLabel);
  var detailPair = tk.parseBilingualValue(node.rawDetail);
  if (lang === 'zh') return buildForOneLang(labelPair.zh, detailPair.zh, '');
  if (lang === 'en') return buildForOneLang(labelPair.en, detailPair.en, '');
  if (labelPair.zh === labelPair.en && detailPair.zh === detailPair.en) {
    return buildForOneLang(labelPair.zh, detailPair.zh, '');
  }
  return buildForOneLang(labelPair.zh, detailPair.zh, 'sr-zh') + buildForOneLang(labelPair.en, detailPair.en, 'sr-en');
}

function renderSequenceSvg(model, lang, standalone, uid) {
  var parts = [];
  var lifelineBottom = model.height - 32;
  parts.push('<svg class="sr-figure-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + model.width + ' ' + model.height + '" role="img" aria-labelledby="' + uid + '-title ' + uid + '-desc">');
  parts.push('<title id="' + uid + '-title">' + tk.escapeXml(model.title) + '</title>');
  parts.push('<desc id="' + uid + '-desc">Sequence diagram with ' + model.participants.length + ' participants and ' + model.messages.length + ' messages</desc>');
  if (standalone) parts.push(tk.STANDALONE_STYLE_BLOCK);
  parts.push('<defs><marker id="' + uid + '-seq-arrow" markerWidth="10" markerHeight="10" refX="8.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">' +
    '<path d="M1,1 L8.5,4 L1,7" fill="none" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>');
  if (model.showCanvas || standalone) {
    parts.push('<rect width="100%" height="100%" rx="20" fill="var(--fig-canvas-bg, rgba(255, 255, 255, 0.56))"/>');
  }
  if (model.showTitle) {
    parts.push(tk.renderLangText(model.titleRaw, Math.round(model.width / 2), 34, 'text-anchor="middle" font-size="20" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
  }

  model.participants.forEach(function (p) {
    var style = tk.getRoleStyle(p.role);
    parts.push('<line x1="' + p.centerX + '" y1="' + (p.y + p.height) + '" x2="' + p.centerX + '" y2="' + lifelineBottom + '" stroke="var(--fig-axis-line, rgba(23,36,48,0.24))" stroke-width="1.5" stroke-dasharray="6 6"/>');
    parts.push('<rect x="' + p.x + '" y="' + p.y + '" width="' + p.width + '" height="' + p.height + '" rx="12" fill="var(--fig-node-bg, rgba(255,255,255,0.94))"/>');
    parts.push('<rect x="' + p.x + '" y="' + p.y + '" width="' + p.width + '" height="' + p.height + '" rx="12" fill="' + style.fill + '" stroke="' + style.stroke + '" stroke-width="1.4"/>');
    parts.push(tk.renderLangText(p.rawLabel, p.centerX, p.y + 34, 'text-anchor="middle" font-size="14" font-weight="700" fill="' + style.text + '"', lang));
  });

  model.messages.forEach(function (msg) {
    var dash = msg.kind === 'response' ? ' stroke-dasharray="6 4"' : '';
    if (msg.from === msg.to) {
      var selfPath = layout.pointsToRoundedPath([[msg.fromX, msg.y], [msg.fromX + 68, msg.y], [msg.fromX + 68, msg.y + 32], [msg.toX + 4, msg.y + 32]], 8);
      parts.push('<path d="' + selfPath + '" fill="none" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.8"' + dash + ' marker-end="url(#' + uid + '-seq-arrow)"/>');
      parts.push(tk.renderPillLabel(msg.rawLabel, msg.fromX + 76, msg.y + 19, 'start', lang));
    } else {
      parts.push('<line x1="' + msg.fromX + '" y1="' + msg.y + '" x2="' + msg.toX + '" y2="' + msg.y + '" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.8"' + dash + ' marker-end="url(#' + uid + '-seq-arrow)"/>');
      parts.push('<circle cx="' + msg.fromX + '" cy="' + msg.y + '" r="3" fill="var(--fig-port-fill, #ffffff)" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.5"/>');
      parts.push(tk.renderPillLabel(msg.rawLabel, Math.round((msg.fromX + msg.toX) / 2), msg.y - 10, 'middle', lang));
    }
  });

  parts.push('</svg>');
  return parts.join('');
}

function renderTopologySvg(model, options) {
  var opts = options || {};
  var lang = opts.lang || 'bilingual';
  var standalone = !!opts.standalone;
  var uid = opts.idPrefix || 'fig';

  if (model.type === 'sequence') {
    return renderSequenceSvg(model, lang, standalone, uid);
  }

  var byId = Object.create(null);
  model.nodes.forEach(function (n) { byId[n.id] = n; });
  var parts = [];
  parts.push('<svg class="sr-figure-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + model.width + ' ' + model.height + '" role="img" aria-labelledby="' + uid + '-title ' + uid + '-desc">');
  parts.push('<title id="' + uid + '-title">' + tk.escapeXml(model.title) + '</title>');
  parts.push('<desc id="' + uid + '-desc">' + tk.escapeXml(model.type + ' topology with ' + model.nodes.length + ' nodes and ' + model.edges.length + ' edges') + '</desc>');
  if (standalone) parts.push(tk.STANDALONE_STYLE_BLOCK);
  parts.push('<defs><marker id="' + uid + '-arrow" markerWidth="10" markerHeight="10" refX="8.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">' +
    '<path d="M1,1 L8.5,4 L1,7" fill="none" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>');

  if (model.showCanvas || standalone) {
    parts.push('<rect width="100%" height="100%" rx="20" fill="var(--fig-canvas-bg, rgba(255, 255, 255, 0.56))"/>');
  }
  if (model.showTitle) {
    parts.push(tk.renderLangText(model.titleRaw, Math.round(model.width / 2), 34, 'text-anchor="middle" font-size="20" font-weight="700" fill="var(--fig-text-strong, #172430)"', lang));
  }

  model.groups.forEach(function (group) {
    var gStyle = tk.GROUP_TOKEN_STYLES[group.styleIndex];
    parts.push('<g data-group-id="' + tk.escapeXml(group.id) + '">' +
      '<rect x="' + group.x + '" y="' + group.y + '" width="' + group.width + '" height="' + group.height + '" rx="16" fill="' + gStyle.fill + '" stroke="' + gStyle.stroke + '" stroke-width="1.25"/>' +
      '<path d="M ' + (group.x + 16) + ' ' + (group.y + 1) + ' H ' + (group.x + group.width - 16) + '" stroke="var(--fig-node-top-glow, rgba(255,255,255,0.6))" stroke-width="1"/>' +
      '<line x1="' + group.x + '" y1="' + (group.y + 46) + '" x2="' + (group.x + group.width) + '" y2="' + (group.y + 46) + '" stroke="var(--fig-group-divider, rgba(23,36,48,0.08))" stroke-width="1"/>' +
      '<circle cx="' + (group.x + 22) + '" cy="' + (group.y + 24) + '" r="4.5" fill="' + gStyle.badge + '"/>' +
      tk.renderLangText(group.rawLabel, group.x + 34, group.y + 29, 'font-size="14.5" font-weight="700" fill="' + gStyle.title + '"', lang) +
      '</g>');
  });

  var edgeLabelLayer = [];
  model.edges.forEach(function (edge, idx) {
    var route = layout.routeEdge(model, byId[edge.from], byId[edge.to], idx);
    var dashAttr = edge.dashed ? ' stroke-dasharray="6 5"' : '';
    parts.push('<g data-edge-id="' + tk.escapeXml(edge.id) + '">' +
      '<path d="' + route.d + '" fill="none" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"' + dashAttr + ' marker-end="url(#' + uid + '-arrow)"/>' +
      '<circle cx="' + route.startX + '" cy="' + route.startY + '" r="3.2" fill="var(--fig-port-fill, #ffffff)" stroke="var(--fig-edge-stroke, #5b6b7c)" stroke-width="1.6"/>' +
      '</g>');
    if (edge.rawLabel) {
      edgeLabelLayer.push(tk.renderPillLabel(edge.rawLabel, route.labelX, route.labelY, route.labelAnchor, lang));
    }
  });

  model.nodes.forEach(function (node) {
    var style = tk.getRoleStyle(node.role);
    var clipId = uid + '-clip-' + node.id.replace(/[^a-zA-Z0-9_-]/g, '');
    parts.push('<g data-node-id="' + tk.escapeXml(node.id) + '">' +
      '<defs><clipPath id="' + clipId + '"><rect x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" rx="13"/></clipPath></defs>' +
      '<rect x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" rx="13" fill="var(--fig-node-bg, rgba(255,255,255,0.94))"/>' +
      '<rect x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" rx="13" fill="' + style.fill + '" stroke="' + style.stroke + '" stroke-width="1.35"/>' +
      '<rect x="' + node.x + '" y="' + node.y + '" width="4.5" height="' + node.height + '" fill="' + style.bar + '" clip-path="url(#' + clipId + ')"/>' +
      '<line x1="' + (node.x + 12) + '" y1="' + (node.y + 1) + '" x2="' + (node.x + node.width - 12) + '" y2="' + (node.y + 1) + '" stroke="var(--fig-node-top-glow, rgba(255,255,255,0.85))" stroke-width="1"/>' +
      renderNodeCardText(node, style, lang) +
      '</g>');
  });

  if (edgeLabelLayer.length) {
    parts.push('<g class="sr-edge-labels">' + edgeLabelLayer.join('') + '</g>');
  }

  parts.push('</svg>');
  return parts.join('');
}

function renderTopologyDrawio(model) {
  var cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  if (model.type === 'sequence') {
    var bottom = model.height - 32;
    model.participants.forEach(function (p) {
      var gStyle = tk.GROUP_TOKEN_STYLES[p.styleIndex];
      cells.push('<mxCell id="participant-' + tk.escapeXml(p.id) + '" value="' + tk.escapeXml(p.label) + '" style="rounded=1;arcSize=12;whiteSpace=wrap;html=1;fillColor=' + gStyle.hexFill + ';strokeColor=' + gStyle.hexStroke + ';strokeWidth=2;fontColor=' + gStyle.hexTitle + ';fontSize=14;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="' + p.x + '" y="' + p.y + '" width="' + p.width + '" height="' + p.height + '" as="geometry"/></mxCell>');
      cells.push('<mxCell id="lifeline-' + tk.escapeXml(p.id) + '" value="" style="endArrow=none;dashed=1;dashPattern=6 6;strokeColor=#94A3B8;strokeWidth=1.5;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="' + p.centerX + '" y="' + (p.y + p.height) + '" as="sourcePoint"/><mxPoint x="' + p.centerX + '" y="' + bottom + '" as="targetPoint"/></mxGeometry></mxCell>');
    });
    model.messages.forEach(function (m) {
      var dashed = m.kind === 'response' ? 'dashed=1;dashPattern=6 4;' : '';
      cells.push('<mxCell id="' + tk.escapeXml(m.id) + '" value="' + tk.escapeXml(m.label) + '" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=1;strokeColor=#475569;strokeWidth=2;fontSize=12;fontColor=#334155;labelBackgroundColor=#FCF8F2;' + dashed + '" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="' + m.fromX + '" y="' + m.y + '" as="sourcePoint"/><mxPoint x="' + m.toX + '" y="' + m.y + '" as="targetPoint"/></mxGeometry></mxCell>');
    });
    return '<mxfile host="Study-Room-Figure-Engine" version="2"><diagram id="page-1" name="' + tk.escapeXml(model.title) + '"><mxGraphModel grid="1" gridSize="10" guides="1" page="0" background="#FFFFFF"><root>' + cells.join('') + '</root></mxGraphModel></diagram></mxfile>\n';
  }

  model.groups.forEach(function (g) {
    var gs = tk.GROUP_TOKEN_STYLES[g.styleIndex];
    cells.push('<mxCell id="group-' + tk.escapeXml(g.id) + '" value="' + tk.escapeXml(g.label) + '" style="swimlane;html=1;rounded=1;arcSize=10;horizontal=1;startSize=44;fillColor=' + gs.hexFill + ';strokeColor=' + gs.hexStroke + ';fontColor=' + gs.hexTitle + ';fontSize=15;fontStyle=1;collapsible=0;container=0;" vertex="1" parent="1"><mxGeometry x="' + g.x + '" y="' + g.y + '" width="' + g.width + '" height="' + g.height + '" as="geometry"/></mxCell>');
  });
  model.nodes.forEach(function (n) {
    var ns = tk.getRoleStyle(n.role);
    var val = '<b>' + tk.escapeXml(n.label) + '</b>' + (n.detail ? '<br><font color="#64748B">' + tk.escapeXml(n.detail) + '</font>' : '');
    cells.push('<mxCell id="' + tk.escapeXml(n.id) + '" value="' + tk.escapeXml(val) + '" style="rounded=1;arcSize=14;whiteSpace=wrap;html=1;fillColor=' + ns.hexFill + ';strokeColor=' + ns.hexStroke + ';strokeWidth=2;fontColor=' + ns.hexText + ';fontSize=14;spacing=10;" vertex="1" parent="1"><mxGeometry x="' + n.x + '" y="' + n.y + '" width="' + n.width + '" height="' + n.height + '" as="geometry"/></mxCell>');
  });
  model.edges.forEach(function (e) {
    cells.push('<mxCell id="' + tk.escapeXml(e.id) + '" value="' + tk.escapeXml(e.label) + '" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=#64748B;strokeWidth=2;fontSize=12;fontColor=#475569;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="' + tk.escapeXml(e.from) + '" target="' + tk.escapeXml(e.to) + '"><mxGeometry relative="1" as="geometry"/></mxCell>');
  });
  return '<mxfile host="Study-Room-Figure-Engine" version="2"><diagram id="page-1" name="' + tk.escapeXml(model.title) + '"><mxGraphModel grid="1" gridSize="10" guides="1" page="0" background="#FFFFFF"><root>' + cells.join('') + '</root></mxGraphModel></diagram></mxfile>\n';
}

module.exports = {
  normalizeTopologyType: layout.normalizeTopologyType,
  validateTopologySpec: layout.validateTopologySpec,
  layoutTopology: layout.layoutTopology,
  findOverlaps: layout.findOverlaps,
  pointsToRoundedPath: layout.pointsToRoundedPath,
  renderTopologySvg: renderTopologySvg,
  renderTopologyDrawio: renderTopologyDrawio
};

'use strict';

// Study Room Figure Engine v2 — Topology Layout & Orthogonal SmoothStep Router
// Supports: architecture (layered swimlanes), flowchart/flow, sequence, hierarchy/tree.

var tk = require('./tokens');

var DEFAULTS = {
  width: 1200,
  marginX: 44,
  marginY: 40,
  columnGap: 88,
  rowGap: 32,
  nodeWidth: 236,
  nodeHeight: 88
};

function pointsToRoundedPath(pts, radius) {
  if (!pts || pts.length < 2) return '';
  var r = radius || 10;
  var clean = [pts[0]];
  for (var i = 1; i < pts.length; i++) {
    var prev = clean[clean.length - 1];
    if (Math.abs(pts[i][0] - prev[0]) > 0.5 || Math.abs(pts[i][1] - prev[1]) > 0.5) {
      clean.push(pts[i]);
    }
  }
  if (clean.length === 2) {
    return 'M ' + clean[0][0] + ' ' + clean[0][1] + ' L ' + clean[1][0] + ' ' + clean[1][1];
  }
  var parts = ['M ' + clean[0][0] + ' ' + clean[0][1]];
  for (var j = 1; j < clean.length - 1; j++) {
    var p0 = clean[j - 1];
    var p1 = clean[j];
    var p2 = clean[j + 1];
    var dx1 = p1[0] - p0[0];
    var dy1 = p1[1] - p0[1];
    var len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    var dx2 = p2[0] - p1[0];
    var dy2 = p2[1] - p1[1];
    var len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    var cr = Math.min(r, len1 * 0.45, len2 * 0.45);
    if (cr < 1.5) {
      parts.push('L ' + p1[0] + ' ' + p1[1]);
    } else {
      var sx = Math.round((p1[0] - (dx1 / len1) * cr) * 10) / 10;
      var sy = Math.round((p1[1] - (dy1 / len1) * cr) * 10) / 10;
      var ex = Math.round((p1[0] + (dx2 / len2) * cr) * 10) / 10;
      var ey = Math.round((p1[1] + (dy2 / len2) * cr) * 10) / 10;
      parts.push('L ' + sx + ' ' + sy + ' Q ' + p1[0] + ' ' + p1[1] + ' ' + ex + ' ' + ey);
    }
  }
  var last = clean[clean.length - 1];
  parts.push('L ' + last[0] + ' ' + last[1]);
  return parts.join(' ');
}

function findOverlaps(nodes) {
  var overlaps = [];
  nodes.forEach(function (node, index) {
    nodes.slice(index + 1).forEach(function (other) {
      if (node.x < other.x + other.width && node.x + node.width > other.x &&
          node.y < other.y + other.height && node.y + node.height > other.y) {
        overlaps.push([node.id, other.id]);
      }
    });
  });
  return overlaps;
}

function normalizeTopologyType(type) {
  var t = String(type || 'flowchart').toLowerCase();
  if (t === 'flow' || t === 'state') return 'flowchart';
  if (t === 'topology') return 'architecture';
  if (t === 'tree' || t === 'hierarchy') return 'hierarchy';
  return t;
}

function validateTopologySpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('FigureSpec must be an object');
  var type = normalizeTopologyType(spec.type);
  if (spec.version != null && spec.version !== 1 && spec.version !== 2) {
    throw new Error('FigureSpec version must be 1 or 2');
  }
  tk.localized(spec.title || { zh: '架构图解', en: 'Architecture Diagram' }, 'zh', 'diagram title');

  if (type === 'sequence') {
    var pIds = Object.create(null);
    if (!Array.isArray(spec.participants) || spec.participants.length < 2) {
      throw new Error('Sequence FigureSpec requires at least two participants');
    }
    spec.participants.forEach(function (p) {
      if (!p.id || pIds[p.id]) throw new Error('Participant ids must be unique: ' + p.id);
      tk.localized(p.label, 'zh', 'participant ' + p.id);
      pIds[p.id] = true;
    });
    if (!Array.isArray(spec.messages) || spec.messages.length < 1) {
      throw new Error('Sequence FigureSpec requires messages');
    }
    spec.messages.forEach(function (m, idx) {
      if (!pIds[m.from] || !pIds[m.to]) throw new Error('Message ' + idx + ' references unknown participant');
      tk.localized(m.label, 'zh', 'message ' + idx);
    });
    return;
  }

  if (type !== 'architecture' && type !== 'flowchart' && type !== 'hierarchy') {
    throw new Error('Unsupported topology type: ' + spec.type);
  }
  if (type === 'architecture' && (!Array.isArray(spec.groups) || spec.groups.length < 2)) {
    throw new Error('Architecture FigureSpec requires at least two groups');
  }
  if (!Array.isArray(spec.nodes) || spec.nodes.length < 2) {
    throw new Error('Topology FigureSpec requires at least two nodes');
  }

  var groupIds = Object.create(null);
  if (spec.groups) {
    spec.groups.forEach(function (g, idx) {
      if (!g.id || groupIds[g.id]) throw new Error('Duplicate group id: ' + g.id);
      if (g.order == null) g.order = idx;
      tk.localized(g.label, 'zh', 'group ' + g.id);
      groupIds[g.id] = true;
    });
  }

  var ids = Object.create(null);
  spec.nodes.forEach(function (node) {
    if (!node.id || ids[node.id]) throw new Error('Node ids must be unique: ' + node.id);
    if (spec.groups && !groupIds[node.group]) throw new Error('Node references unknown group: ' + node.id);
    tk.localized(node.label, 'zh', 'node ' + node.id);
    ids[node.id] = true;
  });

  (spec.edges || []).forEach(function (edge, idx) {
    if (!ids[edge.from] || !ids[edge.to]) throw new Error('Edge ' + idx + ' references unknown node');
    if (edge.from === edge.to) throw new Error('Self edges are not supported: ' + edge.from);
  });
}

function autoAssignLayers(spec, type) {
  if (!spec.nodes.some(function (n) { return !Number.isInteger(n.layer); })) return;
  var indeg = Object.create(null);
  var adj = Object.create(null);
  spec.nodes.forEach(function (n) { indeg[n.id] = 0; adj[n.id] = []; });
  (spec.edges || []).forEach(function (e) {
    if (adj[e.from]) { adj[e.from].push(e.to); indeg[e.to] = (indeg[e.to] || 0) + 1; }
  });
  var depth = Object.create(null);
  var queue = [];
  spec.nodes.forEach(function (n) {
    if (Number.isInteger(n.layer)) depth[n.id] = n.layer;
    else if (indeg[n.id] === 0) { depth[n.id] = 0; queue.push(n.id); }
  });
  while (queue.length > 0) {
    var cur = queue.shift();
    (adj[cur] || []).forEach(function (nxt) {
      depth[nxt] = Math.max(depth[nxt] || 0, (depth[cur] || 0) + 1);
      if (--indeg[nxt] <= 0) queue.push(nxt);
    });
  }
  spec.nodes.forEach(function (n, idx) {
    if (!Number.isInteger(n.layer)) {
      n.layer = depth[n.id] != null ? depth[n.id] : (type === 'hierarchy' ? 0 : idx);
    }
  });
}

function layoutSequence(spec, lang) {
  validateTopologySpec(spec);
  var options = Object.assign({
    width: 1280,
    marginX: 84,
    marginY: 44,
    participantWidth: 196,
    participantHeight: 58,
    messageStartY: 148,
    messageGap: 68
  }, spec.layout || {});
  if (options.showTitle) { options.marginY += 28; options.messageStartY += 28; }
  var usableWidth = options.width - options.marginX * 2;
  var spacing = spec.participants.length === 1 ? 0 : usableWidth / (spec.participants.length - 1);
  var byId = Object.create(null);
  var participants = spec.participants.map(function (p, index) {
    var cx = Math.round(options.marginX + index * spacing);
    var item = {
      id: p.id,
      rawLabel: p.label,
      label: tk.localized(p.label, lang === 'en' ? 'en' : 'zh'),
      role: p.role || (index === 0 ? 'actor' : index % 2 === 1 ? 'interface' : 'service'),
      centerX: cx,
      x: Math.round(cx - options.participantWidth / 2),
      y: options.marginY,
      width: options.participantWidth,
      height: options.participantHeight,
      styleIndex: index % tk.GROUP_TOKEN_STYLES.length
    };
    byId[item.id] = item;
    return item;
  });

  return {
    titleRaw: spec.title || { zh: '交互时序图', en: 'Sequence Diagram' },
    title: tk.localized(spec.title || { zh: '交互时序图', en: 'Sequence Diagram' }, lang === 'en' ? 'en' : 'zh'),
    type: 'sequence',
    direction: 'sequence',
    width: options.width,
    height: Math.max((spec.layout && spec.layout.height) || 0, options.messageStartY + spec.messages.length * options.messageGap + 56),
    showTitle: !!(spec.layout && spec.layout.showTitle === true),
    showCanvas: !!(spec.layout && spec.layout.showCanvas === true),
    participants: participants,
    messages: spec.messages.map(function (m, index) {
      return {
        id: m.id || 'message-' + (index + 1),
        from: m.from,
        to: m.to,
        fromX: byId[m.from].centerX,
        toX: byId[m.to].centerX,
        y: options.messageStartY + index * options.messageGap,
        rawLabel: m.label,
        label: tk.localized(m.label, lang === 'en' ? 'en' : 'zh'),
        kind: m.kind || 'call'
      };
    }),
    groups: [],
    nodes: [],
    edges: []
  };
}

function layoutTopology(spec, lang) {
  var type = normalizeTopologyType(spec.type);
  if (type === 'sequence') return layoutSequence(spec, lang);
  validateTopologySpec(spec);
  autoAssignLayers(spec, type);

  var options = Object.assign({}, DEFAULTS, spec.layout || {});
  var direction = options.direction === 'down' || type === 'hierarchy' ? 'down' : 'right';
  var startY = options.marginY + (options.showTitle ? 36 : 0);
  var layers = [];
  var maxLayer = 0;

  spec.nodes.forEach(function (node) {
    maxLayer = Math.max(maxLayer, node.layer);
    if (!layers[node.layer]) layers[node.layer] = [];
    layers[node.layer].push(node);
  });
  layers.forEach(function (layer) {
    layer.sort(function (a, b) { return (a.order || 0) - (b.order || 0) || String(a.id).localeCompare(String(b.id)); });
  });

  var groups = [];
  var groupGap = options.groupGap || 38;
  var groupPadding = options.groupPadding || 24;
  var groupTitleHeight = options.groupTitleHeight || 48;

  if (spec.groups) {
    var sortedGroups = spec.groups.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0) || String(a.id).localeCompare(String(b.id)); });
    if (direction === 'down') {
      var bandWidth = options.width - options.marginX * 2;
      var innerWidth = bandWidth - groupPadding * 2;
      var minColumnGap = options.minColumnGap || 72;
      var fitColumns = Math.max(1, Math.floor((innerWidth + minColumnGap) / (options.nodeWidth + minColumnGap)));
      var cursorY = startY;
      groups = sortedGroups.map(function (g, index) {
        var members = spec.nodes.filter(function (n) { return n.group === g.id; });
        var cols = g.columns ? Math.max(1, Math.min(g.columns, members.length)) : Math.min(members.length, fitColumns);
        if (!g.columns && cols > 2 && members.length > cols && members.length % cols === 1) cols -= 1;
        var rows = Math.max(1, Math.ceil(members.length / cols));
        members.forEach(function (m) { if (Number.isInteger(m.gridRow)) rows = Math.max(rows, m.gridRow + 1); });
        var height = groupTitleHeight + groupPadding * 2 + rows * options.nodeHeight + Math.max(0, rows - 1) * options.rowGap;
        var band = {
          id: g.id,
          rawLabel: g.label,
          label: tk.localized(g.label, lang === 'en' ? 'en' : 'zh'),
          x: options.marginX,
          y: Math.round(cursorY),
          width: bandWidth,
          height: height,
          columns: cols,
          rows: rows,
          styleIndex: index % tk.GROUP_TOKEN_STYLES.length
        };
        cursorY += height + groupGap;
        return band;
      });
      options.height = Math.max((spec.layout && spec.layout.height) || 0, Math.round(cursorY - groupGap + options.marginY));
    } else {
      var gWidth = Math.floor((options.width - options.marginX * 2 - groupGap * (sortedGroups.length - 1)) / sortedGroups.length);
      var maxMembers = sortedGroups.reduce(function (m, g) { return Math.max(m, spec.nodes.filter(function (n) { return n.group === g.id; }).length); }, 1);
      var gHeight = groupTitleHeight + groupPadding * 2 + maxMembers * options.nodeHeight + Math.max(0, maxMembers - 1) * options.rowGap;
      options.height = Math.max((spec.layout && spec.layout.height) || 0, startY + gHeight + options.marginY);
      groups = sortedGroups.map(function (g, index) {
        return {
          id: g.id,
          rawLabel: g.label,
          label: tk.localized(g.label, lang === 'en' ? 'en' : 'zh'),
          x: Math.round(options.marginX + index * (gWidth + groupGap)),
          y: startY,
          width: gWidth,
          height: gHeight,
          styleIndex: index % tk.GROUP_TOKEN_STYLES.length
        };
      });
    }
  } else if (direction === 'down') {
    var vGap = options.layerGap || options.columnGap;
    options.height = Math.max((spec.layout && spec.layout.height) || 0, startY + (maxLayer + 1) * options.nodeHeight + maxLayer * vGap + options.marginY);
  } else {
    var contentHeight = layers.reduce(function (max, l) {
      var cnt = l ? l.length : 0;
      return Math.max(max, cnt * options.nodeHeight + Math.max(0, cnt - 1) * options.rowGap);
    }, options.nodeHeight);
    options.height = Math.max((spec.layout && spec.layout.height) || 0, startY + contentHeight + options.marginY);
  }

  var columnWidth = maxLayer === 0 ? 0 : (options.width - options.marginX * 2 - options.nodeWidth) / maxLayer;
  var nodes = spec.nodes.map(function (node) {
    var layer = layers[node.layer] || [node];
    var idx = layer.indexOf(node);
    var nw = node.width || options.nodeWidth;
    var nh = node.height || options.nodeHeight;
    var hGap = options.nodeGap || options.rowGap;
    var vGap = options.layerGap || options.columnGap;
    var layerHeight = layer.length * nh + Math.max(0, layer.length - 1) * options.rowGap;
    var layerWidth = layer.length * nw + Math.max(0, layer.length - 1) * hGap;
    var group = spec.groups ? groups.find(function (c) { return c.id === node.group; }) : null;
    var x;
    var y;
    if (group) {
      var members = spec.nodes.filter(function (c) { return c.group === node.group; }).sort(function (a, b) {
        return (a.order || 0) - (b.order || 0) || String(a.id).localeCompare(String(b.id));
      });
      var gIdx = members.indexOf(node);
      if (direction === 'down') {
        var slotW = (group.width - groupPadding * 2) / group.columns;
        var gCol = Number.isInteger(node.gridColumn) ? node.gridColumn : gIdx % group.columns;
        var gRow = Number.isInteger(node.gridRow) ? node.gridRow : Math.floor(gIdx / group.columns);
        x = group.x + groupPadding + gCol * slotW + (slotW - nw) / 2;
        y = group.y + groupTitleHeight + groupPadding + gRow * (options.nodeHeight + options.rowGap);
      } else {
        x = group.x + (group.width - nw) / 2;
        y = group.y + groupTitleHeight + groupPadding + gIdx * (options.nodeHeight + options.rowGap);
      }
    } else if (direction === 'down') {
      x = (options.width - layerWidth) / 2 + idx * (nw + hGap);
      y = startY + node.layer * (options.nodeHeight + vGap);
    } else {
      x = options.marginX + node.layer * columnWidth;
      y = startY + (options.height - startY - options.marginY - layerHeight) / 2 + idx * (nh + options.rowGap);
    }

    return {
      id: node.id,
      role: node.role || 'service',
      rawLabel: node.label,
      rawDetail: node.detail || '',
      label: tk.localized(node.label, lang === 'en' ? 'en' : 'zh'),
      detail: node.detail ? tk.localized(node.detail, lang === 'en' ? 'en' : 'zh') : '',
      x: Math.round(x + (node.offsetX || 0)),
      y: Math.round(y),
      width: nw,
      height: nh,
      layer: node.layer,
      group: node.group || ''
    };
  });

  var overlaps = findOverlaps(nodes);
  if (overlaps.length) {
    throw new Error('Layout contains overlapping nodes: ' + overlaps.map(function (p) { return p.join('/'); }).join(', '));
  }

  return {
    titleRaw: spec.title || { zh: '系统架构图', en: 'Architecture Diagram' },
    title: tk.localized(spec.title || { zh: '系统架构图', en: 'Architecture Diagram' }, lang === 'en' ? 'en' : 'zh'),
    type: type,
    direction: direction,
    width: options.width,
    height: options.height,
    rowGap: options.rowGap,
    showTitle: !!(spec.layout && spec.layout.showTitle === true),
    showCanvas: !!(spec.layout && spec.layout.showCanvas === true),
    groups: groups,
    nodes: nodes,
    edges: (spec.edges || []).map(function (edge, index) {
      return {
        id: edge.id || 'edge-' + (index + 1),
        from: edge.from,
        to: edge.to,
        dashed: !!edge.dashed || edge.style === 'dashed',
        sourcePortOffset: edge.sourcePortOffset,
        targetPortOffset: edge.targetPortOffset,
        laneOffset: edge.laneOffset,
        labelX: edge.labelX,
        labelOffsetX: edge.labelOffsetX,
        labelOffsetY: edge.labelOffsetY,
        rawLabel: edge.label || '',
        label: edge.label ? tk.localized(edge.label, lang === 'en' ? 'en' : 'zh') : ''
      };
    })
  };
}

function blocksHorizontalRun(model, source, target) {
  var left = Math.min(source.x + source.width, target.x + target.width);
  var right = Math.max(source.x, target.x);
  return model.nodes.some(function (node) {
    if (node.id === source.id || node.id === target.id || node.group !== source.group) return false;
    return Math.abs(node.y - source.y) <= 4 && node.x < right && node.x + node.width > left;
  });
}

function blocksVerticalDrop(model, source, x) {
  return model.nodes.some(function (node) {
    if (node.id === source.id || node.group !== source.group || node.y <= source.y) return false;
    return node.x - 8 < x && node.x + node.width + 8 > x;
  });
}

function offsetDownwardPorts(model, source, target, sx, tx, edgeMeta) {
  if (Number.isFinite(edgeMeta.sourcePortOffset)) {
    sx = Math.round(sx + edgeMeta.sourcePortOffset);
  }
  if (Number.isFinite(edgeMeta.targetPortOffset)) {
    tx = Math.round(tx + edgeMeta.targetPortOffset);
  }
  return { sx: sx, tx: tx };
}

function computeBendLaneShift(model, source, target, sx, tx, downward, edgeIdx, edgeMeta) {
  if (Number.isFinite(edgeMeta.laneOffset)) return edgeMeta.laneOffset;
  if (!downward) return (edgeIdx % 2 === 0 ? -1 : 1) * 4;
  return 0;
}

function routeEdge(model, source, target, edgeIdx) {
  var sx = Math.round(source.x + source.width / 2);
  var tx = Math.round(target.x + target.width / 2);
  var sameGroup = model.type === 'architecture' && source.group && source.group === target.group;
  var sameRow = Math.abs(source.y - target.y) <= 4;

  if (sameGroup && sameRow) {
    var goingRight = target.x > source.x;
    var ey = Math.round(source.y + source.height / 2);
    if (!blocksHorizontalRun(model, source, target)) {
      var x1 = goingRight ? source.x + source.width : source.x;
      var x2 = goingRight ? target.x : target.x + target.width;
      return {
        d: pointsToRoundedPath([[x1, ey], [x2, ey]], 10),
        startX: x1, startY: ey,
        labelX: Math.round((x1 + x2) / 2), labelY: ey - 12, labelAnchor: 'middle'
      };
    }
    var gutterY = Math.round(source.y + source.height + Math.max(14, (model.rowGap || 28) / 2));
    return {
      d: pointsToRoundedPath([[sx, source.y + source.height], [sx, gutterY], [tx, gutterY], [tx, target.y + target.height]], 10),
      startX: sx, startY: source.y + source.height,
      labelX: Math.round((sx + tx) / 2), labelY: gutterY + 4, labelAnchor: 'middle'
    };
  }

  if (sameGroup) {
    var downInGroup = target.y > source.y;
    var iy1 = downInGroup ? source.y + source.height : source.y;
    var iy2 = downInGroup ? target.y : target.y + target.height;
    var imy = Math.round((iy1 + iy2) / 2);
    var ptsGroup = Math.abs(sx - tx) <= 2 ? [[sx, iy1], [sx, iy2]] : [[sx, iy1], [sx, imy], [tx, imy], [tx, iy2]];
    return {
      d: pointsToRoundedPath(ptsGroup, 10),
      startX: sx, startY: iy1,
      labelX: Math.round((sx + tx) / 2), labelY: imy + 4, labelAnchor: 'middle'
    };
  }

  if (model.direction === 'down') {
    var sGroup = model.groups.find(function (g) { return g.id === source.group; }) || null;
    var tGroup = model.groups.find(function (g) { return g.id === target.group; }) || null;
    var downward = target.y >= source.y;
    var y1 = downward ? source.y + source.height : source.y;
    var y2 = downward ? target.y : target.y + target.height;
    var sIdx = sGroup ? model.groups.indexOf(sGroup) : -1;
    var tIdx = tGroup ? model.groups.indexOf(tGroup) : -1;
    var spansIntermediateGroup = sIdx !== -1 && tIdx !== -1 && Math.abs(tIdx - sIdx) > 1;
    var gapAtSource = null;
    var gapAtTarget = null;
    if (sGroup && tGroup) {
      if (downward && sIdx + 1 < model.groups.length) {
        gapAtSource = Math.round((sGroup.y + sGroup.height + model.groups[sIdx + 1].y) / 2);
      } else if (!downward && sIdx > 0) {
        gapAtSource = Math.round((model.groups[sIdx - 1].y + model.groups[sIdx - 1].height + sGroup.y) / 2);
      }
      if (downward && tIdx > 0) {
        gapAtTarget = Math.round((model.groups[tIdx - 1].y + model.groups[tIdx - 1].height + tGroup.y) / 2);
      } else if (!downward && tIdx + 1 < model.groups.length) {
        gapAtTarget = Math.round((tGroup.y + tGroup.height + model.groups[tIdx + 1].y) / 2);
      }
    }
    var edgeMeta = (model.edges && model.edges[edgeIdx]) || {};
    if (downward) {
      var ports = offsetDownwardPorts(model, source, target, sx, tx, edgeMeta);
      sx = ports.sx;
      tx = ports.tx;
    } else {
      if (Number.isFinite(edgeMeta.sourcePortOffset)) sx = Math.round(sx + edgeMeta.sourcePortOffset);
      if (Number.isFinite(edgeMeta.targetPortOffset)) tx = Math.round(tx + edgeMeta.targetPortOffset);
    }
    var midY = gapAtTarget || (sGroup && tGroup
      ? (downward ? Math.round((sGroup.y + sGroup.height + tGroup.y) / 2) : Math.round((tGroup.y + tGroup.height + sGroup.y) / 2))
      : Math.round((y1 + y2) / 2));

    var ptsDown;
    var startX = sx;
    var startY = y1;
    var labelX = Math.abs(sx - tx) <= 2 ? sx : Math.round(sx * 0.35 + tx * 0.65);
    var labelY = midY + 4;

    if (spansIntermediateGroup) {
      var minY = Math.min(source.y, target.y);
      var maxY = Math.max(source.y, target.y);
      var hitsMiddleNode = model.nodes.some(function (n) {
        if (n.id === source.id || n.id === target.id) return false;
        return n.y > minY && n.y < maxY &&
          ((n.x - 10 < sx && n.x + n.width + 10 > sx) || (n.x - 10 < tx && n.x + n.width + 10 > tx));
      });
      if (hitsMiddleNode) {
        var useLeftGutter = ((sx + tx) / 2) <= model.width / 2;
        var gutterX = useLeftGutter
          ? Math.max(16, (sGroup ? sGroup.x : source.x) - 18)
          : Math.min(model.width - 16, (sGroup ? sGroup.x + sGroup.width : source.x + source.width) + 18);
        var gySrc = gapAtSource || (downward ? y1 + 14 : y1 - 14);
        var gyTgt = gapAtTarget || (downward ? y2 - 14 : y2 + 14);
        ptsDown = [[sx, y1], [sx, gySrc], [gutterX, gySrc], [gutterX, gyTgt], [tx, gyTgt], [tx, y2]];
        labelX = Math.round((gutterX + tx) / 2);
        labelY = gyTgt + 4;
      } else {
        ptsDown = Math.abs(sx - tx) <= 2 ? [[sx, y1], [sx, y2]] : [[sx, y1], [sx, midY], [tx, midY], [tx, y2]];
        labelY = midY + 4;
      }
    } else if (downward && blocksVerticalDrop(model, source, sx)) {
      var sideX = source.x + source.width + 22;
      if (blocksVerticalDrop(model, source, sideX)) sideX = source.x - 22;
      startX = sideX > sx ? source.x + source.width : source.x;
      startY = Math.round(source.y + source.height / 2);
      ptsDown = [[startX, startY], [sideX, startY], [sideX, midY], [tx, midY], [tx, y2]];
    } else if (Math.abs(sx - tx) <= 2) {
      ptsDown = [[sx, y1], [sx, y2]];
    } else {
      var laneShift = computeBendLaneShift(model, source, target, sx, tx, downward, edgeIdx, edgeMeta);
      ptsDown = [[sx, y1], [sx, midY + laneShift], [tx, midY + laneShift], [tx, y2]];
      labelY = midY + laneShift + 4;
    }
    if (Number.isFinite(edgeMeta.labelX)) labelX = edgeMeta.labelX;
    if (Number.isFinite(edgeMeta.labelOffsetX)) labelX += edgeMeta.labelOffsetX;
    if (Number.isFinite(edgeMeta.labelOffsetY)) labelY += edgeMeta.labelOffsetY;

    return {
      d: pointsToRoundedPath(ptsDown, 10),
      startX: startX, startY: startY,
      labelX: labelX,
      labelY: labelY, labelAnchor: 'middle'
    };
  }

  var rx1 = source.x + source.width;
  var rx2 = target.x;
  var ry1 = Math.round(source.y + source.height / 2);
  var ry2 = Math.round(target.y + target.height / 2);
  var mx = Math.round((rx1 + rx2) / 2);
  var ptsRight = Math.abs(ry1 - ry2) <= 2 ? [[rx1, ry1], [rx2, ry2]] : [[rx1, ry1], [mx, ry1], [mx, ry2], [rx2, ry2]];
  return {
    d: pointsToRoundedPath(ptsRight, 10),
    startX: rx1, startY: ry1,
    labelX: mx, labelY: Math.round((ry1 + ry2) / 2) - (Math.abs(ry1 - ry2) <= 2 ? 12 : 0),
    labelAnchor: 'middle'
  };
}

module.exports = {
  normalizeTopologyType: normalizeTopologyType,
  validateTopologySpec: validateTopologySpec,
  layoutTopology: layoutTopology,
  routeEdge: routeEdge,
  findOverlaps: findOverlaps,
  pointsToRoundedPath: pointsToRoundedPath
};

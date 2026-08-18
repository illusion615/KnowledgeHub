#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

var DEFAULTS = {
  width: 1200,
  marginX: 56,
  marginY: 72,
  columnGap: 92,
  rowGap: 34,
  nodeWidth: 210,
  nodeHeight: 82
};

var ROLE_STYLES = {
  required: { fill: '#FFF1F2', stroke: '#E11D48', text: '#9F1239' },
  actor: { fill: '#FFF7EF', stroke: '#E9B37D', text: '#7C2D12' },
  interface: { fill: '#EFF9F7', stroke: '#78BDB5', text: '#115E59' },
  service: { fill: '#F2F7FB', stroke: '#8FB5D2', text: '#1E3A5F' },
  data: { fill: '#F8F4FC', stroke: '#B9A3D5', text: '#4C1D95' },
  control: { fill: '#FFF9E8', stroke: '#D4B266', text: '#713F12' },
  artifact: { fill: '#F7F8F9', stroke: '#AAB4C0', text: '#334155' }
};

var GROUP_STYLES = [
  { fill: '#FFF9F3', stroke: '#DED2C3', title: '#7C2D12' },
  { fill: '#F7FAFC', stroke: '#CAD7E2', title: '#1E3A5F' },
  { fill: '#FAF8FC', stroke: '#D8CEE5', title: '#4C1D95' },
  { fill: '#F5FAF8', stroke: '#C5DDD8', title: '#115E59' }
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function localized(value, lang, context) {
  if (typeof value === 'string') return value;
  if (!value || typeof value[lang] !== 'string' || !value[lang].trim()) {
    throw new Error('Missing ' + lang + ' text for ' + context);
  }
  return value[lang].trim();
}

var WIDE_CHAR = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/;
var BREAK_AFTER = ' /、，；：·|';

// Noto Sans advance-width approximation; the compiler has no font metrics at build time.
function charWidth(ch, fontSize) {
  if (WIDE_CHAR.test(ch)) return fontSize;
  if (ch === ' ') return fontSize * 0.28;
  if ('iljt.,;:!\'`|'.indexOf(ch) >= 0) return fontSize * 0.31;
  if ('fr()[]{}-'.indexOf(ch) >= 0) return fontSize * 0.4;
  if ('mwMW'.indexOf(ch) >= 0) return fontSize * 0.86;
  if (ch >= 'A' && ch <= 'Z') return fontSize * 0.68;
  return fontSize * 0.55;
}

function measureText(text, fontSize) {
  var total = 0;
  for (var i = 0; i < text.length; i += 1) total += charWidth(text.charAt(i), fontSize);
  return total;
}

function wrapText(text, maxWidth, fontSize) {
  var value = String(text == null ? '' : text);
  if (!value) return [];
  if (maxWidth <= 0 || measureText(value, fontSize) <= maxWidth) return [value];
  var lines = [];
  var current = '';
  var breakAt = 0;
  for (var i = 0; i < value.length; i += 1) {
    var ch = value.charAt(i);
    if (measureText(current + ch, fontSize) > maxWidth && current) {
      // Latin words stay intact; wide scripts may break between any two glyphs.
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

function renderTextBlock(lines, x, firstBaseline, lineHeight, attributes) {
  if (!lines.length) return '';
  var spans = lines.map(function (line, index) {
    return '<tspan x="' + x + '" y="' + (firstBaseline + index * lineHeight) + '">' + escapeXml(line) + '</tspan>';
  }).join('');
  return '<text x="' + x + '" text-anchor="middle" font-family="Noto Sans SC, sans-serif" ' + attributes + '>' + spans + '</text>';
}

function blocksHorizontalRun(model, source, target) {
  var left = Math.min(source.x + source.width, target.x + target.width);
  var right = Math.max(source.x, target.x);
  return model.nodes.some(function (node) {
    if (node.id === source.id || node.id === target.id) return false;
    if (node.group !== source.group) return false;
    if (Math.abs(node.y - source.y) > 2) return false;
    return node.x < right && node.x + node.width > left;
  });
}

function blocksVerticalDrop(model, source, x) {
  return model.nodes.some(function (node) {
    if (node.id === source.id) return false;
    if (node.group !== source.group) return false;
    if (node.y <= source.y) return false;
    return node.x - 8 < x && node.x + node.width + 8 > x;
  });
}

function groupById(model, id) {
  return model.groups.filter(function (group) { return group.id === id; })[0] || null;
}

function routeEdge(model, source, target) {
  var sourceCenterX = Math.round(source.x + source.width / 2);
  var targetCenterX = Math.round(target.x + target.width / 2);
  var sameGroup = model.type === 'architecture' && source.group && source.group === target.group;
  var sameRow = Math.abs(source.y - target.y) <= 2;

  if (sameGroup && sameRow) {
    var goingRight = target.x > source.x;
    var edgeY = Math.round(source.y + source.height / 2);
    if (!blocksHorizontalRun(model, source, target)) {
      var startX = goingRight ? source.x + source.width : source.x;
      var endX = goingRight ? target.x : target.x + target.width;
      return {
        d: 'M ' + startX + ' ' + edgeY + ' H ' + endX,
        labelX: Math.round((startX + endX) / 2),
        labelY: edgeY - 8,
        labelAnchor: 'middle'
      };
    }
    // Siblings sit between the pair, so dip into the gutter under the row.
    var gutterY = Math.round(source.y + source.height + Math.max(12, (model.rowGap || 28) / 2));
    return {
      d: 'M ' + sourceCenterX + ' ' + (source.y + source.height)
        + ' V ' + gutterY + ' H ' + targetCenterX + ' V ' + (target.y + target.height),
      labelX: Math.round((sourceCenterX + targetCenterX) / 2),
      labelY: gutterY - 6,
      labelAnchor: 'middle'
    };
  }

  if (sameGroup) {
    var downwardInGroup = target.y > source.y;
    var innerExitY = downwardInGroup ? source.y + source.height : source.y;
    var innerEntryY = downwardInGroup ? target.y : target.y + target.height;
    var innerMiddleY = Math.round((innerExitY + innerEntryY) / 2);
    if (Math.abs(sourceCenterX - targetCenterX) <= 2) {
      return {
        d: 'M ' + sourceCenterX + ' ' + innerExitY + ' V ' + innerEntryY,
        labelX: sourceCenterX + 14,
        labelY: innerMiddleY + 4,
        labelAnchor: 'start'
      };
    }
    return {
      d: 'M ' + sourceCenterX + ' ' + innerExitY + ' V ' + innerMiddleY + ' H ' + targetCenterX + ' V ' + innerEntryY,
      labelX: Math.round((sourceCenterX + targetCenterX) / 2),
      labelY: innerMiddleY - 6,
      labelAnchor: 'middle'
    };
  }

  if (model.direction === 'down') {
    var sourceGroup = groupById(model, source.group);
    var targetGroup = groupById(model, target.group);
    var downward = target.y >= source.y;
    var exitY = downward ? source.y + source.height : source.y;
    var entryY = downward ? target.y : target.y + target.height;
    // Leave the owning group before travelling sideways, otherwise the run crosses sibling nodes.
    var middleY = sourceGroup && targetGroup && downward
      ? Math.round((sourceGroup.y + sourceGroup.height + targetGroup.y) / 2)
      : Math.round((exitY + entryY) / 2);
    var runX = sourceCenterX;
    var detour = '';
    if (downward && blocksVerticalDrop(model, source, sourceCenterX)) {
      var sideX = source.x + source.width + 24;
      if (blocksVerticalDrop(model, source, sideX)) sideX = source.x - 24;
      runX = Math.round(sideX);
      exitY = Math.round(source.y + source.height / 2);
      detour = 'M ' + (runX > sourceCenterX ? source.x + source.width : source.x) + ' ' + exitY + ' H ' + runX + ' V ' + middleY;
    }
    var d = detour
      ? detour + ' H ' + targetCenterX + ' V ' + entryY
      : 'M ' + runX + ' ' + exitY + ' V ' + middleY + ' H ' + targetCenterX + ' V ' + entryY;
    return {
      d: d,
      labelX: targetCenterX + 14,
      labelY: middleY - 8,
      labelAnchor: 'start'
    };
  }

  var rightStartX = source.x + source.width;
  var rightEndX = target.x;
  var rightStartY = Math.round(source.y + source.height / 2);
  var rightEndY = Math.round(target.y + target.height / 2);
  var middleX = Math.round((rightStartX + rightEndX) / 2);
  return {
    d: 'M ' + rightStartX + ' ' + rightStartY + ' H ' + middleX + ' V ' + rightEndY + ' H ' + rightEndX,
    labelX: middleX,
    labelY: Math.min(rightStartY, rightEndY) - 8,
    labelAnchor: 'middle'
  };
}

function validateSpec(spec) {
  var ids = Object.create(null);
  var groupIds = Object.create(null);
  var adjacency = Object.create(null);
  var visiting = Object.create(null);
  var visited = Object.create(null);
  var direction = spec && spec.layout && spec.layout.direction;
  if (!spec || spec.version !== 1) throw new Error('DiagramSpec version must be 1');
  if (spec.type === 'sequence') {
    var participantIds = Object.create(null);
    if (!Array.isArray(spec.participants) || spec.participants.length < 2) {
      throw new Error('Sequence DiagramSpec requires at least two participants');
    }
    spec.participants.forEach(function (participant) {
      if (!participant.id || participantIds[participant.id]) throw new Error('Participant ids must be present and unique: ' + participant.id);
      localized(participant.label, 'zh', 'participant ' + participant.id);
      localized(participant.label, 'en', 'participant ' + participant.id);
      participantIds[participant.id] = true;
    });
    if (!Array.isArray(spec.messages) || spec.messages.length < 1) throw new Error('Sequence DiagramSpec requires messages');
    spec.messages.forEach(function (message, index) {
      if (!participantIds[message.from] || !participantIds[message.to]) throw new Error('Message ' + index + ' references an unknown participant');
      if (message.kind && message.kind !== 'call' && message.kind !== 'response') throw new Error('Unknown sequence message kind: ' + message.kind);
      localized(message.label, 'zh', 'message ' + index);
      localized(message.label, 'en', 'message ' + index);
    });
    localized(spec.title, 'zh', 'diagram title');
    localized(spec.title, 'en', 'diagram title');
    return;
  }
  if (spec.type !== 'architecture' && spec.type !== 'flowchart') {
    throw new Error('DiagramSpec type must be architecture, flowchart, or sequence');
  }
  if (spec.type === 'architecture' && (!Array.isArray(spec.groups) || spec.groups.length < 2)) {
    throw new Error('Architecture DiagramSpec requires at least two groups');
  }
  if (direction && direction !== 'right' && direction !== 'down') {
    throw new Error('Layout direction must be right or down');
  }
  if (!Array.isArray(spec.nodes) || spec.nodes.length < 2) {
    throw new Error('DiagramSpec requires at least two nodes');
  }
  if (spec.groups) {
    if (spec.type !== 'architecture' || !Array.isArray(spec.groups) || spec.groups.length < 2) {
      throw new Error('Groups require an architecture DiagramSpec with at least two groups');
    }
    spec.groups.forEach(function (group) {
      if (!group.id || groupIds[group.id]) throw new Error('Group ids must be present and unique: ' + group.id);
      if (!Number.isInteger(group.order) || group.order < 0) throw new Error('Group order must be a non-negative integer: ' + group.id);
      localized(group.label, 'zh', 'group ' + group.id);
      localized(group.label, 'en', 'group ' + group.id);
      groupIds[group.id] = true;
    });
  }
  spec.nodes.forEach(function (node) {
    if (!node.id || ids[node.id]) throw new Error('Node ids must be present and unique: ' + node.id);
    if (!Number.isInteger(node.layer) || node.layer < 0) throw new Error('Node layer must be a non-negative integer: ' + node.id);
    if (!ROLE_STYLES[node.role]) throw new Error('Unknown node role: ' + node.role);
    if (spec.groups && !groupIds[node.group]) throw new Error('Node references an unknown group: ' + node.id);
    localized(node.label, 'zh', 'node ' + node.id);
    localized(node.label, 'en', 'node ' + node.id);
    ids[node.id] = true;
    adjacency[node.id] = [];
  });
  (spec.edges || []).forEach(function (edge, index) {
    if (!ids[edge.from] || !ids[edge.to]) throw new Error('Edge ' + index + ' references an unknown node');
    if (edge.from === edge.to) throw new Error('Self edges are not supported in v1: ' + edge.from);
    adjacency[edge.from].push(edge.to);
    if (edge.label) {
      localized(edge.label, 'zh', 'edge ' + index);
      localized(edge.label, 'en', 'edge ' + index);
    }
  });

  function visit(nodeId) {
    if (visiting[nodeId]) throw new Error('Cycles are not supported in v1: ' + nodeId);
    if (visited[nodeId]) return;
    visiting[nodeId] = true;
    adjacency[nodeId].forEach(visit);
    visiting[nodeId] = false;
    visited[nodeId] = true;
  }
  Object.keys(ids).forEach(visit);
}

function layoutSequence(spec, lang) {
  var options = Object.assign({
    width: 1500,
    marginX: 90,
    marginY: 72,
    participantWidth: 190,
    participantHeight: 58,
    messageStartY: 180,
    messageGap: 70
  }, spec.layout || {});
  var usableWidth;
  var spacing;
  var participants;
  var byId = Object.create(null);

  validateSpec(spec);
  usableWidth = options.width - options.marginX * 2;
  spacing = spec.participants.length === 1 ? 0 : usableWidth / (spec.participants.length - 1);
  participants = spec.participants.map(function (participant, index) {
    var centerX = options.marginX + index * spacing;
    var model = {
      id: participant.id,
      label: localized(participant.label, lang, 'participant ' + participant.id),
      centerX: Math.round(centerX),
      x: Math.round(centerX - options.participantWidth / 2),
      y: options.marginY,
      width: options.participantWidth,
      height: options.participantHeight,
      styleIndex: index % GROUP_STYLES.length
    };
    byId[model.id] = model;
    return model;
  });

  return {
    title: localized(spec.title, lang, 'diagram title'),
    type: 'sequence',
    direction: 'sequence',
    width: options.width,
    height: Math.max(spec.layout && spec.layout.height || 0, options.messageStartY + spec.messages.length * options.messageGap + 80),
    showTitle: !!(spec.layout && spec.layout.showTitle === true),
    showCanvas: !!(spec.layout && spec.layout.showCanvas === true),
    participants: participants,
    messages: spec.messages.map(function (message, index) {
      return {
        id: message.id || 'message-' + (index + 1),
        from: message.from,
        to: message.to,
        fromX: byId[message.from].centerX,
        toX: byId[message.to].centerX,
        y: options.messageStartY + index * options.messageGap,
        label: localized(message.label, lang, 'message ' + index),
        kind: message.kind || 'call'
      };
    }),
    groups: [],
    nodes: [],
    edges: []
  };
}

function findOverlaps(nodes) {
  var overlaps = [];
  nodes.forEach(function (node, index) {
    nodes.slice(index + 1).forEach(function (other) {
      var intersects = node.x < other.x + other.width &&
        node.x + node.width > other.x &&
        node.y < other.y + other.height &&
        node.y + node.height > other.y;
      if (intersects) overlaps.push([node.id, other.id]);
    });
  });
  return overlaps;
}

function layoutSpec(spec, lang) {
  var options = Object.assign({}, DEFAULTS, spec.layout || {});
  var direction = options.direction === 'down' ? 'down' : 'right';
  var layers = [];
  var maxLayer = 0;
  var contentHeight;
  var columnWidth;
  var nodes;
  var groups = [];

  validateSpec(spec);
  spec.nodes.forEach(function (node) {
    maxLayer = Math.max(maxLayer, node.layer);
    if (!layers[node.layer]) layers[node.layer] = [];
    layers[node.layer].push(node);
  });
  layers.forEach(function (layer) {
    layer.sort(function (a, b) {
      return (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id);
    });
  });

  if (spec.groups) {
    var sortedGroups = spec.groups.slice().sort(function (a, b) { return a.order - b.order || a.id.localeCompare(b.id); });
    var groupGap = options.groupGap || 28;
    var groupPadding = options.groupPadding || 22;
    var groupTitleHeight = options.groupTitleHeight || 48;
    if (direction === 'down') {
      var bandWidth = options.width - options.marginX * 2;
      var innerWidth = bandWidth - groupPadding * 2;
      // Reserve enough horizontal room between siblings for an edge label to stay legible.
      var minColumnGap = options.minColumnGap || 84;
      var fitColumns = Math.max(1, Math.floor((innerWidth + minColumnGap) / (options.nodeWidth + minColumnGap)));
      var cursorY = options.marginY;
      groups = sortedGroups.map(function (group, index) {
        var members = spec.nodes.filter(function (node) { return node.group === group.id; });
        var columns = group.columns
          ? Math.max(1, Math.min(group.columns, members.length))
          : Math.min(members.length, fitColumns);
        if (!group.columns && columns > 2 && members.length > columns && members.length % columns === 1) columns -= 1;
        var explicitRows = members.filter(function (node) { return Number.isInteger(node.gridRow); });
        var rows = Math.ceil(members.length / columns);
        explicitRows.forEach(function (node) { rows = Math.max(rows, node.gridRow + 1); });
        var height = groupTitleHeight + groupPadding * 2 + rows * options.nodeHeight
          + Math.max(0, rows - 1) * options.rowGap;
        var band = {
          id: group.id,
          label: localized(group.label, lang, 'group ' + group.id),
          x: options.marginX,
          y: Math.round(cursorY),
          width: bandWidth,
          height: height,
          columns: columns,
          rows: rows,
          styleIndex: index % GROUP_STYLES.length
        };
        cursorY += height + groupGap;
        return band;
      });
      options.height = Math.max(spec.layout && spec.layout.height || 0, Math.round(cursorY - groupGap + options.marginY));
    } else {
      var groupWidth = Math.floor((options.width - options.marginX * 2 - groupGap * (sortedGroups.length - 1)) / sortedGroups.length);
      var maxMembers = sortedGroups.reduce(function (max, group) {
        return Math.max(max, spec.nodes.filter(function (node) { return node.group === group.id; }).length);
      }, 1);
      var groupHeight = groupTitleHeight + groupPadding * 2 + maxMembers * options.nodeHeight + Math.max(0, maxMembers - 1) * options.rowGap;
      options.height = Math.max(spec.layout && spec.layout.height || 0, options.marginY * 2 + groupHeight);
      groups = sortedGroups.map(function (group, index) {
        return {
          id: group.id,
          label: localized(group.label, lang, 'group ' + group.id),
          x: Math.round(options.marginX + index * (groupWidth + groupGap)),
          y: options.marginY,
          width: groupWidth,
          height: groupHeight,
          styleIndex: index % GROUP_STYLES.length
        };
      });
    }
  } else if (direction === 'down') {
    options.height = Math.max(
      spec.layout && spec.layout.height || 0,
      options.marginY * 2 + (maxLayer + 1) * options.nodeHeight + maxLayer * options.columnGap
    );
  } else {
    contentHeight = layers.reduce(function (max, layer) {
      var count = layer ? layer.length : 0;
      return Math.max(max, count * options.nodeHeight + Math.max(0, count - 1) * options.rowGap);
    }, options.nodeHeight);
    options.height = Math.max(spec.layout && spec.layout.height || 0, contentHeight + options.marginY * 2);
    columnWidth = maxLayer === 0 ? 0 : (options.width - options.marginX * 2 - options.nodeWidth) / maxLayer;
  }

  nodes = spec.nodes.map(function (node) {
    var layer = layers[node.layer];
    var index = layer.indexOf(node);
    var layerHeight = layer.length * options.nodeHeight + Math.max(0, layer.length - 1) * options.rowGap;
    var layerWidth = layer.length * options.nodeWidth + Math.max(0, layer.length - 1) * options.rowGap;
    var group = spec.groups ? groups.find(function (candidate) { return candidate.id === node.group; }) : null;
    var groupMembers = spec.groups ? spec.nodes.filter(function (candidate) { return candidate.group === node.group; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id); }) : null;
    var groupIndex = groupMembers ? groupMembers.indexOf(node) : -1;
    var groupColumn = 0;
    var groupRow = 0;
    var groupSlotWidth = 0;
    if (group && direction === 'down') {
      groupSlotWidth = (group.width - groupPadding * 2) / group.columns;
      groupColumn = Number.isInteger(node.gridColumn) ? node.gridColumn : groupIndex % group.columns;
      groupRow = Number.isInteger(node.gridRow) ? node.gridRow : Math.floor(groupIndex / group.columns);
    }
    var x = group
      ? direction === 'down'
        ? group.x + groupPadding + groupColumn * groupSlotWidth + (groupSlotWidth - (node.width || options.nodeWidth)) / 2
        : group.x + (group.width - (node.width || options.nodeWidth)) / 2
      : direction === 'down'
        ? (options.width - layerWidth) / 2 + index * (options.nodeWidth + options.rowGap)
        : options.marginX + node.layer * columnWidth;
    var y = group
      ? direction === 'down'
        ? group.y + (options.groupTitleHeight || 48) + (options.groupPadding || 22) + groupRow * (options.nodeHeight + options.rowGap)
        : group.y + (options.groupTitleHeight || 48) + (options.groupPadding || 22) + groupIndex * (options.nodeHeight + options.rowGap)
      : direction === 'down'
        ? options.marginY + node.layer * (options.nodeHeight + options.columnGap)
        : (options.height - layerHeight) / 2 + index * (options.nodeHeight + options.rowGap);
    return {
      id: node.id,
      role: node.role,
      label: localized(node.label, lang, 'node ' + node.id),
      detail: node.detail ? localized(node.detail, lang, 'node detail ' + node.id) : '',
      x: Math.round(x + (node.offsetX || 0)),
      y: Math.round(y),
      width: node.width || options.nodeWidth,
      height: node.height || options.nodeHeight,
      layer: node.layer,
      group: node.group || ''
    };
  });

  var overlaps = findOverlaps(nodes);
  if (overlaps.length) {
    throw new Error('Layout contains overlapping nodes: ' + overlaps.map(function (pair) { return pair.join('/'); }).join(', '));
  }

  if (groups.length) {
    nodes.forEach(function (node) {
      var group = groups.find(function (candidate) { return candidate.id === node.group; });
      if (node.x < group.x || node.x + node.width > group.x + group.width) {
        throw new Error('Node ' + node.id + ' falls outside group ' + node.group);
      }
    });
  }

  return {
    title: localized(spec.title, lang, 'diagram title'),
    type: spec.type,
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
        label: edge.label ? localized(edge.label, lang, 'edge ' + index) : ''
      };
    })
  };
}

function renderDrawio(model) {
  if (model.type === 'sequence') return renderSequenceDrawio(model);
  var cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  model.groups.forEach(function (group) {
    var style = GROUP_STYLES[group.styleIndex];
    cells.push('<mxCell id="group-' + escapeXml(group.id) + '" value="' + escapeXml(group.label) + '" style="swimlane;html=1;rounded=1;arcSize=10;horizontal=1;startSize=44;fillColor=' + style.fill + ';strokeColor=' + style.stroke + ';fontColor=' + style.title + ';fontSize=16;fontStyle=1;collapsible=0;container=0;" vertex="1" parent="1"><mxGeometry x="' + group.x + '" y="' + group.y + '" width="' + group.width + '" height="' + group.height + '" as="geometry"/></mxCell>');
  });
  model.nodes.forEach(function (node) {
    var style = ROLE_STYLES[node.role] || ROLE_STYLES.service;
    var value = '<b>' + escapeXml(node.label) + '</b>' + (node.detail ? '<br><font color="#64748B">' + escapeXml(node.detail) + '</font>' : '');
    cells.push('<mxCell id="' + escapeXml(node.id) + '" value="' + escapeXml(value) + '" style="rounded=1;arcSize=14;whiteSpace=wrap;html=1;fillColor=' + style.fill + ';strokeColor=' + style.stroke + ';strokeWidth=2;fontColor=' + style.text + ';fontSize=15;spacing=10;" vertex="1" parent="1"><mxGeometry x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" as="geometry"/></mxCell>');
  });
  model.edges.forEach(function (edge) {
    cells.push('<mxCell id="' + escapeXml(edge.id) + '" value="' + escapeXml(edge.label) + '" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=#64748B;strokeWidth=2;fontSize=13;fontColor=#475569;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="' + escapeXml(edge.from) + '" target="' + escapeXml(edge.to) + '"><mxGeometry relative="1" as="geometry"/></mxCell>');
  });
  return '<mxfile host="Study-Room-Diagram-Engine" version="1"><diagram id="page-1" name="' + escapeXml(model.title) + '"><mxGraphModel grid="1" gridSize="10" guides="1" page="0" background="#FFFFFF"><root>' + cells.join('') + '</root></mxGraphModel></diagram></mxfile>\n';
}

function renderSequenceDrawio(model) {
  var cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  var lifelineBottom = model.height - 42;
  model.participants.forEach(function (participant) {
    var style = GROUP_STYLES[participant.styleIndex];
    cells.push('<mxCell id="participant-' + escapeXml(participant.id) + '" value="' + escapeXml(participant.label) + '" style="rounded=1;arcSize=12;whiteSpace=wrap;html=1;fillColor=' + style.fill + ';strokeColor=' + style.stroke + ';strokeWidth=2;fontColor=' + style.title + ';fontSize=15;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="' + participant.x + '" y="' + participant.y + '" width="' + participant.width + '" height="' + participant.height + '" as="geometry"/></mxCell>');
    cells.push('<mxCell id="lifeline-' + escapeXml(participant.id) + '" value="" style="endArrow=none;dashed=1;dashPattern=6 6;strokeColor=#94A3B8;strokeWidth=1.5;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="' + participant.centerX + '" y="' + (participant.y + participant.height) + '" as="sourcePoint"/><mxPoint x="' + participant.centerX + '" y="' + lifelineBottom + '" as="targetPoint"/></mxGeometry></mxCell>');
  });
  model.messages.forEach(function (message) {
    var dashed = message.kind === 'response' ? 'dashed=1;dashPattern=6 4;' : '';
    var geometry;
    if (message.from === message.to) {
      geometry = '<mxGeometry relative="1" as="geometry"><mxPoint x="' + message.fromX + '" y="' + message.y + '" as="sourcePoint"/><mxPoint x="' + message.toX + '" y="' + (message.y + 34) + '" as="targetPoint"/><Array as="points"><mxPoint x="' + (message.fromX + 72) + '" y="' + message.y + '"/><mxPoint x="' + (message.fromX + 72) + '" y="' + (message.y + 34) + '"/></Array></mxGeometry>';
    } else {
      geometry = '<mxGeometry relative="1" as="geometry"><mxPoint x="' + message.fromX + '" y="' + message.y + '" as="sourcePoint"/><mxPoint x="' + message.toX + '" y="' + message.y + '" as="targetPoint"/></mxGeometry>';
    }
    cells.push('<mxCell id="' + escapeXml(message.id) + '" value="' + escapeXml(message.label) + '" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;endFill=1;strokeColor=#475569;strokeWidth=2;fontSize=13;fontColor=#334155;labelBackgroundColor=#FCF8F2;' + dashed + '" edge="1" parent="1">' + geometry + '</mxCell>');
  });
  return '<mxfile host="Study-Room-Diagram-Engine" version="1"><diagram id="page-1" name="' + escapeXml(model.title) + '"><mxGraphModel grid="1" gridSize="10" guides="1" page="0" background="#FFFFFF"><root>' + cells.join('') + '</root></mxGraphModel></diagram></mxfile>\n';
}

function renderSvg(model) {
  if (model.type === 'sequence') return renderSequenceSvg(model);
  var byId = Object.create(null);
  var parts = [];
  model.nodes.forEach(function (node) { byId[node.id] = node; });
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + model.width + ' ' + model.height + '" role="img" aria-labelledby="diagram-title diagram-desc">');
  parts.push('<title id="diagram-title">' + escapeXml(model.title) + '</title>');
  parts.push('<desc id="diagram-desc">' + escapeXml(model.type + ' diagram with ' + model.nodes.length + ' nodes and ' + model.edges.length + ' connections') + '</desc>');
  parts.push('<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#64748B"/></marker><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#0F172A" flood-opacity="0.12"/></filter></defs>');
  if (model.showCanvas) parts.push('<rect width="100%" height="100%" rx="24" fill="#FCF8F2"/>');
  if (model.showTitle) parts.push('<text x="' + model.width / 2 + '" y="38" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="700" fill="#172430">' + escapeXml(model.title) + '</text>');

  model.groups.forEach(function (group) {
    var style = GROUP_STYLES[group.styleIndex];
    parts.push('<g data-group-id="' + escapeXml(group.id) + '"><rect x="' + group.x + '" y="' + group.y + '" width="' + group.width + '" height="' + group.height + '" rx="18" fill="' + style.fill + '" stroke="' + style.stroke + '" stroke-width="2"/><line x1="' + group.x + '" y1="' + (group.y + 48) + '" x2="' + (group.x + group.width) + '" y2="' + (group.y + 48) + '" stroke="' + style.stroke + '" stroke-width="1.5"/><text x="' + (group.x + 18) + '" y="' + (group.y + 31) + '" font-family="Noto Sans SC, sans-serif" font-size="16" font-weight="700" fill="' + style.title + '">' + escapeXml(group.label) + '</text></g>');
  });

  model.edges.forEach(function (edge) {
    var source = byId[edge.from];
    var target = byId[edge.to];
    var route = routeEdge(model, source, target);
    parts.push('<path d="' + route.d + '" fill="none" stroke="#64748B" stroke-width="2" marker-end="url(#arrow)"/>');
    if (edge.label) parts.push('<text x="' + route.labelX + '" y="' + route.labelY + '" text-anchor="' + route.labelAnchor + '" font-family="Noto Sans SC, sans-serif" font-size="12" fill="#475569">' + escapeXml(edge.label) + '</text>');
  });

  model.nodes.forEach(function (node) {
    var style = ROLE_STYLES[node.role] || ROLE_STYLES.service;
    var centerX = node.x + node.width / 2;
    var innerWidth = node.width - 28;
    var labelLines = wrapText(node.label, innerWidth, 16);
    var detailLines = node.detail ? wrapText(node.detail, innerWidth, 12) : [];
    var labelLead = 20;
    var detailLead = 15;
    var labelBaseline;
    var detailBaseline;
    if (labelLines.length <= 1 && detailLines.length <= 1) {
      labelBaseline = node.y + (node.detail ? 33 : 48);
      detailBaseline = node.y + 58;
    } else {
      var blockHeight = labelLines.length * labelLead
        + (detailLines.length ? 6 + detailLines.length * detailLead : 0);
      labelBaseline = node.y + (node.height - blockHeight) / 2 + 15;
      detailBaseline = labelBaseline + (labelLines.length - 1) * labelLead + labelLead + 1;
    }
    parts.push('<g data-node-id="' + escapeXml(node.id) + '"><rect x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" rx="12" fill="' + style.fill + '" stroke="' + style.stroke + '" stroke-width="1.5"/>');
    parts.push(renderTextBlock(labelLines, centerX, labelBaseline, labelLead, 'font-size="16" font-weight="700" fill="' + style.text + '"'));
    parts.push(renderTextBlock(detailLines, centerX, detailBaseline, detailLead, 'font-size="12" fill="#64748B"'));
    parts.push('</g>');
  });
  parts.push('</svg>\n');
  return parts.join('');
}

function renderSequenceSvg(model) {
  var parts = [];
  var lifelineBottom = model.height - 42;
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + model.width + ' ' + model.height + '" role="img" aria-labelledby="diagram-title diagram-desc">');
  parts.push('<title id="diagram-title">' + escapeXml(model.title) + '</title><desc id="diagram-desc">Sequence diagram with ' + model.participants.length + ' participants and ' + model.messages.length + ' messages</desc>');
  parts.push('<defs><marker id="sequence-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#475569"/></marker><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.1"/></filter></defs>');
  if (model.showCanvas) parts.push('<rect width="100%" height="100%" rx="24" fill="#FCF8F2"/>');
  if (model.showTitle) parts.push('<text x="' + model.width / 2 + '" y="38" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="700" fill="#172430">' + escapeXml(model.title) + '</text>');
  model.participants.forEach(function (participant) {
    var style = GROUP_STYLES[participant.styleIndex];
    parts.push('<line x1="' + participant.centerX + '" y1="' + (participant.y + participant.height) + '" x2="' + participant.centerX + '" y2="' + lifelineBottom + '" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="7 7"/>');
    parts.push('<rect x="' + participant.x + '" y="' + participant.y + '" width="' + participant.width + '" height="' + participant.height + '" rx="12" fill="' + style.fill + '" stroke="' + style.stroke + '" stroke-width="1.5"/><text x="' + participant.centerX + '" y="' + (participant.y + 36) + '" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="700" fill="' + style.title + '">' + escapeXml(participant.label) + '</text>');
  });
  model.messages.forEach(function (message, index) {
    var dash = message.kind === 'response' ? ' stroke-dasharray="7 5"' : '';
    var labelX;
    var labelY = message.y - 10;
    if (message.from === message.to) {
      parts.push('<path d="M ' + message.fromX + ' ' + message.y + ' H ' + (message.fromX + 72) + ' V ' + (message.y + 34) + ' H ' + (message.toX + 8) + '" fill="none" stroke="#475569" stroke-width="2" marker-end="url(#sequence-arrow)"' + dash + '/>');
      labelX = message.fromX + 38;
    } else {
      parts.push('<line x1="' + message.fromX + '" y1="' + message.y + '" x2="' + message.toX + '" y2="' + message.y + '" stroke="#475569" stroke-width="2" marker-end="url(#sequence-arrow)"' + dash + '/>');
      labelX = (message.fromX + message.toX) / 2;
    }
    parts.push('<rect x="' + (labelX - Math.min(180, Math.max(70, message.label.length * 7)) / 2) + '" y="' + (labelY - 17) + '" width="' + Math.min(180, Math.max(70, message.label.length * 7)) + '" height="22" rx="5" fill="#FCF8F2"/><text x="' + labelX + '" y="' + labelY + '" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="13" fill="#334155">' + escapeXml(message.label) + '</text>');
  });
  parts.push('</svg>\n');
  return parts.join('');
}

function compileSpec(spec, lang) {
  var model = spec.type === 'sequence' ? layoutSequence(spec, lang) : layoutSpec(spec, lang);
  return { model: model, drawio: renderDrawio(model), svg: renderSvg(model) };
}

function writeOutputs(specPath, outDir, name) {
  var spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  ['zh', 'en'].forEach(function (lang) {
    var result = compileSpec(spec, lang);
    fs.writeFileSync(path.join(outDir, name + '.' + lang + '.svg'), result.svg);
  });
  fs.writeFileSync(path.join(outDir, name + '.drawio'), compileSpec(spec, 'zh').drawio);
}

if (require.main === module) {
  if (process.argv.length !== 5) {
    console.error('Usage: node compiler.js <spec.json> <output-dir> <name>');
    process.exit(1);
  }
  writeOutputs(path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4]);
}

module.exports = {
  compileSpec: compileSpec,
  findOverlaps: findOverlaps,
  layoutSequence: layoutSequence,
  layoutSpec: layoutSpec,
  measureText: measureText,
  validateSpec: validateSpec,
  wrapText: wrapText
};
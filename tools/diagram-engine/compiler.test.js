'use strict';

var assert = require('assert');
var compiler = require('./compiler.js');

var spec = {
  version: 1,
  type: 'flowchart',
  title: { zh: '测试架构', en: 'Test Architecture' },
  nodes: [
    { id: 'author', layer: 0, role: 'actor', label: { zh: '作者', en: 'Author' } },
    { id: 'spec', layer: 1, role: 'artifact', label: { zh: '图表规格', en: 'Diagram Spec' } },
    { id: 'compiler', layer: 2, role: 'service', label: { zh: '编译器', en: 'Compiler' } },
    { id: 'svg', layer: 3, role: 'artifact', label: { zh: '发布图像', en: 'Published SVG' } }
  ],
  edges: [
    { from: 'author', to: 'spec' },
    { from: 'spec', to: 'compiler' },
    { from: 'compiler', to: 'svg' }
  ]
};

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

var first = compiler.compileSpec(spec, 'zh');
var second = compiler.compileSpec(spec, 'zh');
var english = compiler.compileSpec(spec, 'en');
var required = compiler.compileSpec(Object.assign({}, spec, {
  nodes: spec.nodes.map(function (node) {
    return node.id === 'compiler' ? Object.assign({}, node, { role: 'required' }) : node;
  })
}), 'zh');

assert.strictEqual(first.svg, second.svg, 'compilation must be deterministic');
assert.ok(first.drawio.indexOf('<mxfile') === 0, 'drawio output must be an mxfile');
assert.ok(first.drawio.indexOf('source="author" target="spec"') !== -1, 'edge references must be preserved');
assert.ok(first.svg.indexOf('测试架构') !== -1, 'Chinese output must contain Chinese labels');
assert.ok(english.svg.indexOf('Test Architecture') !== -1, 'English output must contain English labels');
assert.ok(first.svg.indexOf('<rect width="100%"') === -1, 'article diagrams must default to a transparent root surface');
assert.ok(first.svg.indexOf('filter="url(#shadow)"') === -1, 'article diagram nodes must not render duplicate shadow surfaces');
assert.ok(required.svg.indexOf('#FFF1F2') !== -1 && required.svg.indexOf('#E11D48') !== -1, 'required nodes must use the red requirement style');
first.model.nodes.forEach(function (node, index) {
  first.model.nodes.slice(index + 1).forEach(function (other) {
    assert.ok(!overlaps(node, other), node.id + ' overlaps ' + other.id);
  });
});

var vertical = compiler.compileSpec(Object.assign({}, spec, {
  type: 'flowchart',
  layout: { direction: 'down' }
}), 'zh');
assert.strictEqual(vertical.model.direction, 'down');
assert.ok(vertical.model.nodes[1].y > vertical.model.nodes[0].y, 'vertical layers must progress downward');
assert.ok(vertical.svg.indexOf(' V ') !== -1, 'vertical edges must contain vertical segments');

var grouped = compiler.compileSpec(Object.assign({}, spec, {
  type: 'architecture',
  groups: [
    { id: 'input', order: 0, label: { zh: '输入域', en: 'Input Domain' } },
    { id: 'engine', order: 1, label: { zh: '引擎域', en: 'Engine Domain' } }
  ],
  nodes: spec.nodes.map(function (node, index) {
    return Object.assign({}, node, { group: index < 2 ? 'input' : 'engine', order: index % 2 });
  }),
  layout: { width: 900, nodeWidth: 210, nodeHeight: 82 }
}), 'zh');
assert.strictEqual(grouped.model.groups.length, 2, 'architecture groups must be laid out');
assert.ok(grouped.svg.indexOf('data-group-id="input"') !== -1, 'SVG must render architecture boundaries');
assert.ok(grouped.drawio.indexOf('style="swimlane;') !== -1, 'Draw.io must render editable architecture boundaries');
grouped.model.nodes.forEach(function (node) {
  var group = grouped.model.groups.find(function (candidate) { return candidate.id === node.group; });
  assert.ok(node.x >= group.x && node.x + node.width <= group.x + group.width, node.id + ' must stay inside its group');
  assert.ok(node.y >= group.y + 48 && node.y + node.height <= group.y + group.height, node.id + ' must stay inside its group');
});

var layeredArchitecture = compiler.compileSpec(Object.assign({}, grouped.model, {
  version: 1,
  type: 'architecture',
  title: { zh: '分层架构', en: 'Layered Architecture' },
  groups: [
    { id: 'input', order: 0, label: { zh: '输入域', en: 'Input Domain' } },
    { id: 'engine', order: 1, label: { zh: '引擎域', en: 'Engine Domain' } }
  ],
  nodes: spec.nodes.map(function (node, index) {
    return Object.assign({}, node, { group: index < 2 ? 'input' : 'engine', order: index % 2 });
  }),
  edges: spec.edges,
  layout: { direction: 'down', width: 900, nodeWidth: 210, nodeHeight: 82, showTitle: false }
}), 'zh');
assert.ok(layeredArchitecture.model.groups[1].y > layeredArchitecture.model.groups[0].y, 'architecture groups must progress downward');
assert.ok(layeredArchitecture.svg.indexOf('>分层架构</text>') === -1, 'embedded architecture title must be optional');

var offsetArchitecture = compiler.compileSpec(Object.assign({}, grouped.model, {
  version: 1,
  type: 'architecture',
  title: { zh: '偏移架构', en: 'Offset Architecture' },
  groups: [
    { id: 'input', order: 0, label: { zh: '输入域', en: 'Input Domain' } },
    { id: 'engine', order: 1, label: { zh: '引擎域', en: 'Engine Domain' } }
  ],
  nodes: spec.nodes.map(function (node, index) {
    return Object.assign({}, node, { group: index < 2 ? 'input' : 'engine', order: index % 2, offsetX: index === 0 ? -40 : 0 });
  }),
  layout: { width: 900, nodeWidth: 210, nodeHeight: 82 }
}), 'zh');
assert.strictEqual(offsetArchitecture.model.nodes[0].x, grouped.model.nodes[0].x - 40, 'architecture nodes must support explicit horizontal offsets');

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, { type: 'architecture' }), 'zh');
}, /requires at least two groups/);

var sequence = compiler.compileSpec({
  version: 1,
  type: 'sequence',
  title: { zh: '编译时序', en: 'Compilation Sequence' },
  participants: [
    { id: 'agent', label: { zh: '内容 Agent', en: 'Content Agent' } },
    { id: 'engine', label: { zh: '图表引擎', en: 'Diagram Engine' } },
    { id: 'store', label: { zh: '资产仓库', en: 'Artifact Store' } }
  ],
  messages: [
    { from: 'agent', to: 'engine', label: { zh: '提交规格', en: 'Submit Spec' } },
    { from: 'engine', to: 'engine', label: { zh: '校验与布局', en: 'Validate and Layout' } },
    { from: 'engine', to: 'store', label: { zh: '写入资产', en: 'Write Assets' } },
    { from: 'store', to: 'agent', kind: 'response', label: { zh: '返回路径', en: 'Return Paths' } }
  ]
}, 'zh');
assert.strictEqual(sequence.model.participants.length, 3, 'sequence participants must be laid out');
assert.strictEqual(sequence.model.messages.length, 4, 'sequence messages must preserve order');
assert.ok(sequence.svg.indexOf('stroke-dasharray="7 7"') !== -1, 'SVG must render participant lifelines');
assert.ok(sequence.drawio.indexOf('lifeline-agent') !== -1, 'Draw.io must render editable lifelines');
assert.ok(sequence.svg.indexOf('>编译时序</text>') === -1, 'sequence diagrams must not repeat the article title by default');
assert.ok(sequence.svg.indexOf('filter="url(#shadow)"') === -1, 'sequence participants must use the same shadow-free article style');

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, { edges: [{ from: 'missing', to: 'svg' }] }), 'zh');
}, /unknown node/);

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, { layout: { direction: 'diagonal' } }), 'zh');
}, /direction/);

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, {
    edges: [{ from: 'author', to: 'spec' }, { from: 'spec', to: 'author' }]
  }), 'zh');
}, /Cycles/);

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, {
    nodes: spec.nodes.map(function (node) {
      return node.id === 'author' ? Object.assign({}, node, { role: 'unknown' }) : node;
    })
  }), 'zh');
}, /role/);

assert.throws(function () {
  compiler.compileSpec(Object.assign({}, spec, {
    layout: { width: 400, nodeWidth: 210 }
  }), 'zh');
}, /overlapping nodes/);

var shortLine = compiler.wrapText('Compiler', 252, 12);
assert.deepStrictEqual(shortLine, ['Compiler'], 'text that fits must stay on one line');

var latinWrapped = compiler.wrapText('Access Control, Limits, Cancel; Two Output Modes and More', 160, 12);
assert.ok(latinWrapped.length > 1, 'long latin text must wrap');
latinWrapped.forEach(function (line) {
  assert.ok(compiler.measureText(line, 12) <= 160, 'every wrapped latin line must fit: ' + line);
  assert.ok(line === line.trim(), 'wrapped lines must not keep edge whitespace: ' + line);
});
assert.strictEqual(latinWrapped.join(' ').replace(/\s+/g, ' '), 'Access Control, Limits, Cancel; Two Output Modes and More', 'wrapping must preserve latin content');

var cjkWrapped = compiler.wrapText('专用用户账号与加密 MSAL cache 保存在网关本机的 mode 600 文件中', 160, 12);
assert.ok(cjkWrapped.length > 1, 'long CJK text must wrap');
cjkWrapped.forEach(function (line) {
  assert.ok(compiler.measureText(line, 12) <= 160, 'every wrapped CJK line must fit: ' + line);
});
assert.strictEqual(cjkWrapped.join('').replace(/\s/g, ''), '专用用户账号与加密MSALcache保存在网关本机的mode600文件中', 'wrapping must preserve CJK content');

var wrappingSpec = {
  version: 1,
  type: 'flowchart',
  title: { zh: '换行测试', en: 'Wrapping Test' },
  nodes: [
    { id: 'a', layer: 0, role: 'service', label: { zh: '短标题', en: 'Short' } },
    {
      id: 'b', layer: 1, role: 'required',
      label: { zh: '专用 delegated 身份', en: 'Dedicated Delegated Identity' },
      detail: { zh: '专用用户账号与加密 MSAL cache 保存为本机 mode 600 文件', en: 'Dedicated user account and encrypted MSAL cache stored as a local mode 600 file' }
    }
  ],
  edges: [{ from: 'a', to: 'b' }]
};
var wrapped = compiler.compileSpec(wrappingSpec, 'en');
assert.ok(wrapped.svg.indexOf('<tspan') !== -1, 'overflowing detail must render as tspan lines');
assert.ok(wrapped.svg.indexOf('Dedicated user account and encrypted MSAL cache stored as a local mode 600 file') === -1, 'overflowing detail must not render as a single run');

console.log('diagram-engine compiler tests passed');
'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');

var figureEngine = require('../tools/figure-engine');
var mdCompiler = require('../tools/markdown-compiler');

var ROOT = path.resolve(__dirname, '..');

test('Figure Engine v2 compiles architecture, flowchart, sequence, and hierarchy topologies with CSS tokens and bilingual layers', function () {
  var archSpec = {
    version: 2,
    type: 'architecture',
    title: { zh: '双模分层架构', en: 'Dual-Mode Layered Architecture' },
    layout: { direction: 'down', width: 960 },
    groups: [
      { id: 'entry', order: 0, columns: 2, label: { zh: '入口层', en: 'Entry Layer' } },
      { id: 'core', order: 1, columns: 2, label: { zh: '内核层', en: 'Core Layer' } }
    ],
    nodes: [
      { id: 'ui', layer: 0, group: 'entry', role: 'interface', label: { zh: '界面选择器', en: 'UI Picker' }, detail: { zh: '顶栏上下文', en: 'Topbar context' } },
      { id: 'cli', layer: 0, group: 'entry', role: 'actor', label: { zh: '命令行入口', en: 'CLI Entry' } },
      { id: 'router', layer: 1, group: 'core', role: 'control', label: { zh: '路由控制面', en: 'Routing Plane' } },
      { id: 'store', layer: 1, group: 'core', role: 'data', label: { zh: '存储平面', en: 'Storage Plane' } }
    ],
    edges: [
      { from: 'ui', to: 'router', label: { zh: '解析上下文', en: 'Resolve Context' } },
      { from: 'cli', to: 'store', label: { zh: '显式落盘', en: 'Explicit Target' } }
    ]
  };

  var res = figureEngine.compileFigure(archSpec, { lang: 'bilingual', standalone: false, idPrefix: 'test-arch' });
  assert.equal(res.kind, 'topology');
  assert.equal(res.type, 'architecture');
  assert.match(res.svg, /class="sr-figure-svg"/);
  assert.match(res.svg, /var\(--fig-group-bg-1/);
  assert.match(res.svg, /var\(--fig-node-bg/);
  assert.match(res.svg, /var\(--fig-edge-label-bg/);
  assert.match(res.svg, /class="sr-zh"/);
  assert.match(res.svg, /class="sr-en"/);
  assert.match(res.svg, / Q /); // SmoothStep rounded corner
  assert.ok(res.drawio && res.drawio.indexOf('<mxfile') === 0);

  // Ensure zero legacy static white surface fills (#FCF8F2 / #FFF9F3) inside inline SVG
  assert.equal(res.svg.indexOf('fill="#FCF8F2"'), -1);
  assert.equal(res.svg.indexOf('fill="#FFF9F3"'), -1);

  var seqSpec = {
    version: 1,
    type: 'sequence',
    title: { zh: '鉴权握手时序', en: 'Auth Handshake Sequence' },
    participants: [
      { id: 'maker', label: { zh: '创作者', en: 'Maker' } },
      { id: 'bap', label: { zh: '平台接口', en: 'BAP API' } }
    ],
    messages: [
      { from: 'maker', to: 'bap', label: { zh: '提交令牌', en: 'Submit Token' } },
      { from: 'bap', to: 'maker', kind: 'response', label: { zh: '返回环境槽位', en: 'Return Slot' } }
    ]
  };
  var seqRes = figureEngine.compileFigure(seqSpec, { lang: 'bilingual' });
  assert.equal(seqRes.type, 'sequence');
  assert.match(seqRes.svg, /提交令牌/);
  assert.match(seqRes.svg, /Submit Token/);

  var treeSpec = {
    version: 2,
    type: 'hierarchy',
    title: { zh: '组件树', en: 'Component Tree' },
    nodes: [
      { id: 'root', role: 'actor', label: { zh: '根节点', en: 'Root' } },
      { id: 'childA', role: 'service', label: { zh: '子节点 A', en: 'Child A' } },
      { id: 'childB', role: 'interface', label: { zh: '子节点 B', en: 'Child B' } }
    ],
    edges: [
      { from: 'root', to: 'childA' },
      { from: 'root', to: 'childB' }
    ]
  };
  var treeRes = figureEngine.compileFigure(treeSpec);
  assert.equal(treeRes.type, 'hierarchy');
  assert.ok(treeRes.model.nodes[1].y > treeRes.model.nodes[0].y);
});

test('Figure Engine v2 compiles all quantitative chart families (bar, line/area, quadrant, radar, funnel)', function () {
  var barRes = figureEngine.compileFigure({
    version: 2,
    type: 'bar',
    orientation: 'horizontal',
    scale: 'log',
    unit: ' Cr',
    categories: [{ zh: '接口调用', en: 'API Call' }, { zh: '复合任务', en: 'Agent Task' }],
    series: [{ name: { zh: '消耗', en: 'Credits' }, values: [0.1, 300], roles: ['teal', 'accent'] }]
  });
  assert.equal(barRes.kind, 'chart');
  assert.match(barRes.svg, /sr-figure-num/);
  assert.match(barRes.svg, /var\(--fig-grid-line/);

  var areaRes = figureEngine.compileFigure({
    version: 2,
    type: 'area',
    unit: '%',
    xLabels: [{ zh: '阶段一', en: 'Stage 1' }, { zh: '阶段二', en: 'Stage 2' }, { zh: '阶段三', en: 'Stage 3' }],
    series: [{ name: { zh: '达标率', en: 'Pass Rate' }, role: 'teal', values: [40, 75, 100] }]
  });
  assert.match(areaRes.svg, /linearGradient/);
  assert.match(areaRes.svg, / C /); // Catmull-Rom cubic Bezier curve

  var quadRes = figureEngine.compileFigure({
    version: 2,
    type: 'quadrant',
    xAxis: { zh: '自动化成熟度', en: 'Automation Maturity' },
    yAxis: { zh: '治理可控性', en: 'Governance Control' },
    points: [
      { id: 'p1', x: 20, y: 25, role: 'rose', label: { zh: '个人沙盒', en: 'Personal Silo' } },
      { id: 'p2', x: 85, y: 88, role: 'teal', label: { zh: '生产目标态', en: 'Production Target' } }
    ]
  });
  assert.match(quadRes.svg, /data-point-id="p2"/);
  assert.match(quadRes.svg, /var\(--fig-quadrant-tint/);

  var radarRes = figureEngine.compileFigure({
    version: 2,
    type: 'radar',
    axes: [{ zh: '融合度', en: 'Cohesion' }, { zh: '性能', en: 'Speed' }, { zh: '双语', en: 'i18n' }],
    series: [{ name: { zh: '引擎 v2', en: 'Engine v2' }, values: [98, 100, 100] }]
  });
  assert.match(radarRes.svg, /<polygon /);

  var funnelRes = figureEngine.compileFigure({
    version: 2,
    type: 'funnel',
    stages: [
      { label: { zh: '原型创建', en: 'Prototype' }, value: 100 },
      { label: { zh: '评测门禁', en: 'Eval Gate' }, value: 64 },
      { label: { zh: '生产上线', en: 'Production' }, value: 42 }
    ]
  });
  assert.match(funnelRes.svg, /原型创建/);
  assert.match(funnelRes.svg, /Production/);
});

test('Markdown :::figure and upgraded :::diagram directives emit inline bilingual SVG and pass all HTML contracts', function () {
  var md = [
    '---',
    'title: 统一图表测试 || Unified Figure Test',
    'strict_i18n: true',
    'strict_density: true',
    '---',
    '',
    '## #charts 01 / Charts :: 图表指令测试 || Figure Directive Test',
    '',
    '测试内联图表与外部规格自动升级 [1]。 || Test inline figure and external spec upgrade [1].',
    '',
    ':::figure { title: "内联柱状图 || Inline Bar Chart", caption: "图 1：内联声明式图表 [1]。 || Figure 1: Inline declarative chart [1]." }',
    '{',
    '  "version": 2,',
    '  "type": "bar",',
    '  "categories": [{ "zh": "指标 A", "en": "Metric A" }, { "zh": "指标 B", "en": "Metric B" }],',
    '  "series": [{ "name": { "zh": "得分", "en": "Score" }, "values": [72, 96] }]',
    '}',
    ':::',
    '',
    '## #references 02 / References :: 参考资料 || References',
    '',
    '- [1] Figure Spec Docs — https://example.com/spec | 规范文档 || Spec documentation'
  ].join('\n');

  var compiled = mdCompiler.compileMarkdownToHtml(md);
  assert.match(compiled.html, /article-figure\.css/);
  assert.match(compiled.html, /<figure class="sr-figure generated-diagram is-inline-svg"/);
  assert.match(compiled.html, /<svg class="sr-figure-svg"/);
  assert.equal(mdCompiler.verifyCompiledHtmlContract(compiled.html).ok, true);

  // Verify shared dual-mode CSS token stylesheet contains both :root and [data-theme="dark"]
  var figureCss = fs.readFileSync(path.join(ROOT, 'assets', 'article-figure.css'), 'utf8');
  assert.match(figureCss, /:root\s*\{[\s\S]*--fig-node-bg:/);
  assert.match(figureCss, /\[data-theme="dark"\]\s*\{[\s\S]*--fig-node-bg:/);
  assert.match(figureCss, /html\[lang="en"\]\s*\.sr-zh/);
});

test('Figure Engine v2 separates multi-edge ports and overlapping horizontal lanes without crossings or NaN offsets', function () {
  var fanSpec = {
    version: 2,
    type: 'architecture',
    title: { zh: '多边端口分流验证', en: 'Multi-Edge Port Separation Test' },
    layout: { direction: 'down', width: 1200 },
    groups: [
      { id: 'top', order: 0, columns: 3, label: { zh: '上层', en: 'Top Plane' } },
      { id: 'mid', order: 1, columns: 3, label: { zh: '下层', en: 'Bottom Plane' } }
    ],
    nodes: [
      { id: 'n1', layer: 0, order: 0, group: 'top', role: 'required', label: { zh: '左源', en: 'Left Src' } },
      { id: 'n2', layer: 0, order: 1, group: 'top', role: 'actor', label: { zh: '中源', en: 'Mid Src' } },
      { id: 'n3', layer: 0, order: 2, group: 'top', role: 'control', label: { zh: '右源', en: 'Right Src' } },
      { id: 't1', layer: 1, order: 0, group: 'mid', role: 'service', label: { zh: '左宿', en: 'Left Dst' } },
      { id: 't2', layer: 1, order: 1, group: 'mid', role: 'data', label: { zh: '中宿', en: 'Mid Dst' } },
      { id: 't3', layer: 1, order: 2, group: 'mid', role: 'service', label: { zh: '右宿', en: 'Right Dst' } }
    ],
    edges: [
      { from: 'n1', to: 't1', sourcePortOffset: -40, label: { zh: '主干', en: 'Trunk' } },
      { from: 'n2', to: 't1', sourcePortOffset: -40, targetPortOffset: 40, laneOffset: -6, labelX: 420, label: { zh: '汇聚', en: 'Converge' } },
      { from: 'n2', to: 't2', sourcePortOffset: 40, targetPortOffset: 40, label: { zh: '直连', en: 'Bind' } },
      { from: 'n3', to: 't1', laneOffset: 6, labelOffsetY: NaN, label: { zh: '跨列回流', en: 'Cross Lane' } }
    ]
  };

  var res = figureEngine.compileFigure(fanSpec, { lang: 'bilingual', idPrefix: 'fan-test' });
  var byId = Object.fromEntries(res.model.nodes.map(function (n) { return [n.id, n]; }));
  var r0 = figureEngine.topology.layoutTopology ? require('../tools/figure-engine/topology-layout').routeEdge(res.model, byId.n1, byId.t1, 0) : null;
  var r1 = require('../tools/figure-engine/topology-layout').routeEdge(res.model, byId.n2, byId.t1, 1);
  var r2 = require('../tools/figure-engine/topology-layout').routeEdge(res.model, byId.n2, byId.t2, 2);
  var r3 = require('../tools/figure-engine/topology-layout').routeEdge(res.model, byId.n3, byId.t1, 3);

  assert.notEqual(r1.startX, r2.startX, 'Fan-out edges from n2 must use distinct exit ports');
  assert.notEqual(r0.startX, Number(r1.d.split(' ').slice(-2, -1)[0]), 'Fan-in edges into t1 must land on distinct entry ports');
  assert.equal(r1.labelX, 420, 'Explicit labelX override should apply cleanly');
  assert.notEqual(r1.labelY, r3.labelY, 'Overlapping cross-column bends should automatically separate onto distinct horizontal lanes');
  assert.equal(res.svg.includes('NaN'), false, 'Invalid/undefined numeric offsets must never emit NaN in SVG');
  assert.match(res.drawio, /exitX=/, 'Draw.io export should preserve explicit port coordinates');
});

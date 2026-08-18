const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const POST_DIR = path.join(ROOT, 'posts', 'copilot-studio-innovation-activation-program');
const MEDIA_DIR = path.join(POST_DIR, 'media');
const OUTPUT_FILE = path.join(POST_DIR, 'copilot-studio-customer-enablement-program-bilingual.pptx');

const COLORS = {
  navy: '071A2F',
  navy2: '0B3047',
  teal: '0D8F8C',
  mint: '32C7B4',
  coral: 'EF6A4C',
  amber: 'F2B84B',
  blue: '2F80ED',
  ink: '172430',
  muted: '5D6A73',
  paper: 'F7F3EA',
  white: 'FFFFFF',
  line: 'D6D9D6',
  softTeal: 'E4F4F1',
  softBlue: 'E7F0FA',
  softCoral: 'FBEAE4',
  softAmber: 'FFF2D8'
};

const W = 13.333;
const H = 7.5;
const HEADER_FONT = 'Avenir Next';
const BODY_FONT = 'Helvetica Neue';

function loadPptxGenJS() {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    Buffer,
    Blob
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'assets', 'pptxgen.bundle.js'), 'utf8'),
    sandbox,
    { filename: 'pptxgen.bundle.js' }
  );
  return sandbox.PptxGenJS;
}

function imageData(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const mime = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

function addText(slide, text, options) {
  slide.addText(text, Object.assign({
    margin: 0,
    fontFace: BODY_FONT,
    color: COLORS.ink,
    breakLine: false,
    fit: 'shrink'
  }, options));
}

function addBilingualTitle(slide, zh, en, number, dark) {
  const primary = dark ? COLORS.white : COLORS.ink;
  const secondary = dark ? 'C8D5DA' : COLORS.muted;
  addText(slide, number, {
    x: 0.55, y: 0.44, w: 0.52, h: 0.34,
    fontSize: 11, bold: true, color: dark ? '86FFF0' : COLORS.teal,
    charSpacing: 1.2
  });
  addText(slide, zh, {
    x: 1.08, y: 0.35, w: 11.7, h: 0.56,
    fontFace: HEADER_FONT, fontSize: 29, bold: true, color: primary
  });
  addText(slide, en, {
    x: 1.1, y: 0.91, w: 11.6, h: 0.28,
    fontSize: 10.5, bold: true, color: secondary, charSpacing: 0.35
  });
}

function addFooter(slide, page, dark, source) {
  const color = dark ? 'A9BAC2' : '7C858A';
  if (source) {
    addText(slide, source, {
      x: 0.55, y: 6.91, w: 11.7, h: 0.16,
      fontSize: 6.8, color
    });
  }
  addText(slide, String(page).padStart(2, '0'), {
    x: 12.3, y: 6.87, w: 0.48, h: 0.2,
    fontSize: 8, bold: true, color, align: 'right'
  });
}

function addPill(slide, text, x, y, w, fill, color) {
  slide.addShape('roundRect', {
    x, y, w, h: 0.34,
    rectRadius: 0.06,
    fill: { color: fill },
    line: { color: fill }
  });
  addText(slide, text, {
    x: x + 0.08, y: y + 0.065, w: w - 0.16, h: 0.18,
    fontSize: 8.4, bold: true, color, align: 'center', valign: 'mid'
  });
}

function addCard(slide, x, y, w, h, fill, line, radius) {
  slide.addShape(radius ? 'roundRect' : 'rect', {
    x, y, w, h,
    rectRadius: radius || 0,
    fill: { color: fill },
    line: { color: line || fill, width: 0.8 }
  });
}

function addBilingualBlock(slide, zh, en, x, y, w, h, options) {
  const settings = options || {};
  const zhHeight = settings.zhHeight || h * 0.48;
  addText(slide, zh, {
    x, y, w, h: zhHeight,
    fontFace: settings.header ? HEADER_FONT : BODY_FONT,
    fontSize: settings.zhSize || 16,
    bold: settings.bold !== false,
    color: settings.color || COLORS.ink,
    align: settings.align || 'left',
    valign: settings.valign || 'top'
  });
  addText(slide, en, {
    x, y: y + zhHeight + (settings.gap || 0.06), w, h: h - zhHeight - (settings.gap || 0.06),
    fontSize: settings.enSize || 8.5,
    bold: Boolean(settings.enBold),
    color: settings.enColor || COLORS.muted,
    align: settings.align || 'left',
    valign: settings.valign || 'top'
  });
}

function createCover(pptx, coverData) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addImage({ data: coverData, x: 0, y: 0, w: W, h: H });
  slide.addShape('rect', {
    x: 0, y: 0, w: 7.25, h: H,
    fill: { color: COLORS.navy, transparency: 18 },
    line: { color: COLORS.navy, transparency: 100 }
  });
  addPill(slide, 'INTERNAL PROGRAM DESIGN · 内部计划设计', 0.72, 0.62, 3.15, COLORS.teal, COLORS.white);
  addText(slide, 'Copilot Studio', {
    x: 0.72, y: 1.44, w: 5.8, h: 0.58,
    fontFace: 'Avenir Next', fontSize: 31, bold: true, color: '86FFF0'
  });
  addText(slide, '客户创新落地计划', {
    x: 0.72, y: 2.02, w: 6.25, h: 1.02,
    fontFace: 'PingFang SC', fontSize: 43, bold: true, color: COLORS.white
  });
  addText(slide, 'Customer Enablement Program', {
    x: 0.75, y: 3.16, w: 6.1, h: 0.54,
    fontFace: 'Avenir Next', fontSize: 21, bold: true, color: 'D9E6E8'
  });
  addText(slide, '从 Agentic Harness 认知、场景启发与三个优先场景，\n到动手 Workshop 和客户自驱的持续创新', {
    x: 0.75, y: 4.03, w: 5.95, h: 0.86,
    fontFace: 'PingFang SC', fontSize: 16.5, color: COLORS.white, bold: true, breakLine: true,
    lineSpacingMultiple: 1.08
  });
  addText(slide, 'From agentic harness awareness and scenario inspiration to three priority scenarios, hands-on building, and a customer-led innovation motion.', {
    x: 0.75, y: 5.05, w: 5.9, h: 0.65,
    fontSize: 10.5, color: 'C5D4D8', lineSpacingMultiple: 1.05
  });
  addText(slide, 'Microsoft · Customer IT · Business Teams', {
    x: 0.75, y: 6.44, w: 5.7, h: 0.28,
    fontSize: 9.5, bold: true, color: '86FFF0', charSpacing: 0.45
  });
  addFooter(slide, 1, true, 'Copilot Studio Customer Enablement Program · 2026');
}

function createChallenge(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.paper };
  addBilingualTitle(slide, 'AI 预算增长快于价值兑现能力', 'AI Investment Is Growing Faster than Value Realization', '01', false);

  addCard(slide, 0.62, 1.38, 4.32, 4.98, COLORS.softCoral, 'F2C7BB', 0.06);
  addPill(slide, 'VALUE GAP · 价值落差', 0.92, 1.72, 1.75, COLORS.coral, COLORS.white);
  addText(slide, '74%', {
    x: 0.88, y: 2.2, w: 3.3, h: 1.3,
    fontFace: HEADER_FONT, fontSize: 68, bold: true, color: COLORS.coral
  });
  addBilingualBlock(slide,
    '尚未从 AI 中展现有形价值',
    'had yet to show tangible value from AI',
    0.94, 3.58, 3.52, 0.95,
    { zhSize: 21, enSize: 10.5, zhHeight: 0.52 }
  );
  addText(slide, 'BCG 调查：1,000 名 CxO 与高管\n59 个国家 · 20 多个行业 · 30 项能力', {
    x: 0.94, y: 5.15, w: 3.45, h: 0.74,
    fontSize: 10.5, color: COLORS.muted, breakLine: true
  });
  addText(slide, 'BCG survey: 1,000 executives · 59 countries · 20+ sectors · 30 capabilities', {
    x: 0.94, y: 5.9, w: 3.45, h: 0.32,
    fontSize: 7.4, color: '7C858A'
  });

  addCard(slide, 5.23, 1.38, 3.0, 4.98, COLORS.white, COLORS.line, 0.06);
  addText(slide, '工具可用', {
    x: 5.58, y: 1.82, w: 2.3, h: 0.35,
    fontSize: 15, bold: true, color: COLORS.ink, align: 'center'
  });
  addText(slide, 'Access', {
    x: 5.58, y: 2.18, w: 2.3, h: 0.2,
    fontSize: 8.5, color: COLORS.muted, align: 'center'
  });
  slide.addShape('chevron', { x: 6.19, y: 2.62, w: 1.1, h: 0.5, fill: { color: 'CCD6D7' }, line: { color: 'CCD6D7' } });
  addText(slide, 'Demo / Pilot', {
    x: 5.58, y: 3.27, w: 2.3, h: 0.35,
    fontSize: 15, bold: true, color: COLORS.ink, align: 'center'
  });
  addText(slide, '演示 / 试点', {
    x: 5.58, y: 3.64, w: 2.3, h: 0.2,
    fontSize: 8.5, color: COLORS.muted, align: 'center'
  });
  slide.addShape('chevron', { x: 6.19, y: 4.08, w: 1.1, h: 0.5, fill: { color: COLORS.amber }, line: { color: COLORS.amber } });
  addText(slide, '可重复业务成效', {
    x: 5.52, y: 4.76, w: 2.4, h: 0.48,
    fontSize: 15, bold: true, color: COLORS.teal, align: 'center'
  });
  addText(slide, 'Repeatable business outcomes', {
    x: 5.45, y: 5.27, w: 2.55, h: 0.3,
    fontSize: 8, bold: true, color: COLORS.teal, align: 'center'
  });
  addText(slide, '组织能力决定最后一段路', {
    x: 5.48, y: 5.76, w: 2.5, h: 0.28,
    fontSize: 9, color: COLORS.coral, bold: true, align: 'center'
  });

  addCard(slide, 8.52, 1.38, 4.18, 4.98, COLORS.softTeal, 'BFDCD7', 0.06);
  addPill(slide, 'VALUE REALIZED · 已兑现价值', 8.84, 1.72, 2.42, COLORS.teal, COLORS.white);
  addText(slide, '17%', {
    x: 8.82, y: 2.22, w: 2.85, h: 1.2,
    fontFace: HEADER_FONT, fontSize: 62, bold: true, color: COLORS.teal
  });
  addBilingualBlock(slide,
    '将至少 5% EBIT 归因于\n生成式 AI',
    'attributed at least 5% of EBIT to generative AI',
    8.88, 3.52, 3.25, 1.06,
    { zhSize: 18.5, enSize: 9.5, zhHeight: 0.58 }
  );
  addText(slide, 'McKinsey 调查：1,491 名参与者\n101 个国家 · 2024 年 7 月', {
    x: 8.9, y: 5.14, w: 3.18, h: 0.66,
    fontSize: 10.5, color: COLORS.muted, breakLine: true
  });
  addText(slide, 'McKinsey survey: 1,491 participants · 101 countries · July 2024', {
    x: 8.9, y: 5.82, w: 3.15, h: 0.35,
    fontSize: 7.4, color: '7C858A'
  });

  addText(slide, 'Program 设计结论：每个优先场景必须同时具备业务 owner、可观察基线和客户 IT 可接续的运营路径。', {
    x: 0.72, y: 6.34, w: 11.9, h: 0.27,
    fontSize: 12.5, bold: true, color: COLORS.ink, align: 'center'
  });
  addText(slide, 'Program implication: every priority scenario needs a business owner, an observable baseline, and an operating path Customer IT can sustain.', {
    x: 0.78, y: 6.63, w: 11.8, h: 0.15,
    fontSize: 7.6, color: COLORS.muted, align: 'center'
  });
  addFooter(slide, 2, false, 'Sources: BCG, 24 Oct 2024; McKinsey, 12 Mar 2025. Findings are survey-based and do not represent audited project failure rates.');
}

function createOverview(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addBilingualTitle(slide, '六阶段计划交付三个可验证结果', 'Six Phases Deliver Three Verifiable Outcomes', '02', false);

  addCard(slide, 0.65, 1.35, 12.03, 0.88, COLORS.navy, COLORS.navy, 0.05);
  addText(slide, '目标：让客户从听懂 Copilot Studio，推进到能用自己的场景构建、衡量试点并组织下一批创新。', {
    x: 0.92, y: 1.55, w: 11.5, h: 0.3,
    fontSize: 15.5, bold: true, color: COLORS.white, align: 'center'
  });
  addText(slide, 'Goal: move the customer from product understanding to building with its own scenarios, measuring pilots, and organizing the next innovation wave.', {
    x: 1.05, y: 1.88, w: 11.2, h: 0.2,
    fontSize: 7.8, color: 'C9D6DA', align: 'center'
  });

  const phases = [
    ['01', '对齐与启发', 'Align & inspire', '0–1'],
    ['02', '内部场景征集', 'Discover scenarios', '2–3'],
    ['03', '选择三个场景', 'Select three', '4'],
    ['04', '共创实验方案', 'Co-design labs', '5'],
    ['05', '动手 Workshop', 'Hands-on workshop', '6'],
    ['06', '试点衡量决策', 'Pilot & decide', '7–12']
  ];
  const phaseX = 0.68;
  const phaseY = 2.65;
  const phaseW = 1.93;
  const phaseGap = 0.09;
  phases.forEach((phase, index) => {
    const x = phaseX + index * (phaseW + phaseGap);
    const fill = index < 2 ? COLORS.softBlue : index < 4 ? COLORS.softAmber : COLORS.softTeal;
    const accent = index < 2 ? COLORS.blue : index < 4 ? COLORS.coral : COLORS.teal;
    addCard(slide, x, phaseY, phaseW, 1.55, fill, 'D3D9D8', 0.04);
    addText(slide, phase[0], {
      x: x + 0.13, y: phaseY + 0.13, w: 0.4, h: 0.25,
      fontSize: 10, bold: true, color: accent
    });
    addText(slide, `第 ${phase[3]} 周`, {
      x: x + 0.83, y: phaseY + 0.14, w: 0.88, h: 0.2,
      fontSize: 7.2, bold: true, color: COLORS.muted, align: 'right'
    });
    addText(slide, phase[1], {
      x: x + 0.13, y: phaseY + 0.55, w: phaseW - 0.26, h: 0.35,
      fontSize: 12.5, bold: true, color: COLORS.ink, align: 'center'
    });
    addText(slide, phase[2], {
      x: x + 0.13, y: phaseY + 1.0, w: phaseW - 0.26, h: 0.25,
      fontSize: 7.4, color: COLORS.muted, align: 'center'
    });
    if (index < phases.length - 1) {
      slide.addShape('chevron', {
        x: x + phaseW - 0.02, y: phaseY + 0.63, w: 0.16, h: 0.32,
        fill: { color: accent }, line: { color: accent }
      });
    }
  });

  const outcomes = [
    {
      number: '01', fill: COLORS.softCoral, accent: COLORS.coral,
      zh: '三个有 owner 的优先场景', en: 'Three owned priority scenarios',
      noteZh: '场景简报含基线、数据与验收', noteEn: 'Briefs include baselines, data, and acceptance'
    },
    {
      number: '02', fill: COLORS.softBlue, accent: COLORS.blue,
      zh: '三个可演示、可测试的原型', en: 'Three demonstrable, testable prototypes',
      noteZh: '业务用户完成关键路径', noteEn: 'Business users build the critical path'
    },
    {
      number: '03', fill: COLORS.softTeal, accent: COLORS.teal,
      zh: '一套客户可继续运转的机制', en: 'A customer-led operating motion',
      noteZh: 'Backlog、maker 社群与试点决策', noteEn: 'Backlog, maker community, and pilot decisions'
    }
  ];
  outcomes.forEach((item, index) => {
    const x = 0.68 + index * 4.05;
    addCard(slide, x, 4.66, 3.87, 1.6, item.fill, 'D3D9D8', 0.05);
    addText(slide, item.number, {
      x: x + 0.2, y: 4.88, w: 0.45, h: 0.25,
      fontSize: 10, bold: true, color: item.accent
    });
    addBilingualBlock(slide, item.zh, item.en, x + 0.72, 4.82, 2.85, 0.7, {
      zhSize: 14, enSize: 8, zhHeight: 0.38, bold: true
    });
    addText(slide, item.noteZh, {
      x: x + 0.22, y: 5.68, w: 3.35, h: 0.22,
      fontSize: 9.4, bold: true, color: COLORS.ink, align: 'center'
    });
    addText(slide, item.noteEn, {
      x: x + 0.22, y: 5.94, w: 3.35, h: 0.16,
      fontSize: 6.8, color: COLORS.muted, align: 'center'
    });
  });

  addText(slide, '12 周是参考节奏；每个 readiness gate 通过后才进入下一阶段。', {
    x: 0.8, y: 6.37, w: 11.7, h: 0.22,
    fontSize: 10, bold: true, color: COLORS.coral, align: 'center'
  });
  addText(slide, 'Twelve weeks is illustrative; each readiness gate controls progression.', {
    x: 0.8, y: 6.61, w: 11.7, h: 0.14,
    fontSize: 7, color: COLORS.muted, align: 'center'
  });
  addFooter(slide, 3, false, 'Program timing is illustrative and depends on sponsor, scenario owner, data access, and platform readiness.');
}

function createEngagement(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.paper };
  addBilingualTitle(slide, '按工作难度与业务影响选择参与深度', 'Choose Engagement Depth by Work Complexity and Business Impact', '03', false);
  addText(slide, '本计划的参与模型 · Internal program engagement model', {
    x: 0.72, y: 1.22, w: 5.2, h: 0.24,
    fontSize: 9.5, bold: true, color: COLORS.teal
  });
  addText(slide, '人主导 → AI 主导 · Human-driven → AI-driven', {
    x: 9.7, y: 1.2, w: 2.85, h: 0.26,
    fontSize: 9, bold: true, color: COLORS.muted, align: 'right'
  });

  const tiers = [
    {
      x: 0.65, title: 'Chat', subtitle: '对话 · Conversations', fill: COLORS.softBlue, accent: COLORS.blue,
      complexityZh: '低', complexityEn: 'Low', impactZh: '个人 / 团队效率', impactEn: 'Individual / team productivity',
      audienceZh: '广泛业务用户', audienceEn: 'Broad business users',
      exampleZh: '知识问答 · 摘要 · 草稿', exampleEn: 'Q&A · summaries · drafts',
      buildZh: 'Agent + 企业知识', buildEn: 'Agent + enterprise knowledge'
    },
    {
      x: 4.68, title: 'Cowork', subtitle: '任务 · Tasks', fill: COLORS.softAmber, accent: COLORS.coral,
      complexityZh: '中', complexityEn: 'Medium', impactZh: '任务周期与质量', impactEn: 'Task cycle time and quality',
      audienceZh: 'Power Users / 流程 owner', audienceEn: 'Power users / process owners',
      exampleZh: '合同审阅 · 报告生成', exampleEn: 'Contract review · report generation',
      buildZh: 'Agent + Workflow 组合', buildEn: 'Agent + workflow'
    },
    {
      x: 8.71, title: 'Worker', subtitle: '业务流程 · Business Process', fill: COLORS.softTeal, accent: COLORS.teal,
      complexityZh: '高', complexityEn: 'High', impactZh: '跨团队流程结果', impactEn: 'Cross-team process outcomes',
      audienceZh: '业务 owner + IT + 运营', audienceEn: 'Business owners + IT + operations',
      exampleZh: '发票 · 销售运营 · 服务工单', exampleEn: 'Invoices · sales ops · service cases',
      buildZh: 'Agent + Workflow + 配套 App', buildEn: 'Agent + workflow + Power Apps'
    }
  ];

  tiers.forEach((tier, index) => {
    addCard(slide, tier.x, 1.62, 3.72, 4.68, tier.fill, 'CDD6D6', 0.06);
    addText(slide, tier.title, {
      x: tier.x + 0.28, y: 1.92, w: 2.45, h: 0.48,
      fontFace: HEADER_FONT, fontSize: 26, bold: true, color: tier.accent
    });
    addText(slide, tier.subtitle, {
      x: tier.x + 0.28, y: 2.39, w: 2.95, h: 0.25,
      fontSize: 9, bold: true, color: COLORS.muted
    });
    addPill(slide, `难度${tier.complexityZh} · ${tier.complexityEn}`, tier.x + 2.34, 1.9, 1.08, tier.accent, COLORS.white);

    const rows = [
      ['业务影响', 'Business impact', tier.impactZh, tier.impactEn],
      ['目标受众', 'Audience', tier.audienceZh, tier.audienceEn],
      ['场景示例', 'Examples', tier.exampleZh, tier.exampleEn]
    ];
    rows.forEach((row, rowIndex) => {
      const y = 2.93 + rowIndex * 0.87;
      addText(slide, row[0], {
        x: tier.x + 0.28, y, w: 0.9, h: 0.22,
        fontSize: 8.6, bold: true, color: tier.accent
      });
      addText(slide, row[1], {
        x: tier.x + 0.28, y: y + 0.22, w: 1.0, h: 0.17,
        fontSize: 6.4, color: COLORS.muted
      });
      addText(slide, row[2], {
        x: tier.x + 1.2, y: y - 0.02, w: 2.15, h: 0.25,
        fontSize: 10.5, bold: true, color: COLORS.ink, align: 'right'
      });
      addText(slide, row[3], {
        x: tier.x + 1.12, y: y + 0.27, w: 2.23, h: 0.18,
        fontSize: 6.7, color: COLORS.muted, align: 'right'
      });
    });

    addCard(slide, tier.x + 0.25, 5.48, 3.22, 0.63, COLORS.white, tier.accent, 0.04);
    addText(slide, tier.buildZh, {
      x: tier.x + 0.4, y: 5.61, w: 2.92, h: 0.22,
      fontSize: index === 2 ? 9.3 : 10.5, bold: true, color: tier.accent, align: 'center'
    });
    addText(slide, tier.buildEn, {
      x: tier.x + 0.4, y: 5.86, w: 2.92, h: 0.16,
      fontSize: index === 2 ? 6.2 : 6.8, color: COLORS.muted, align: 'center'
    });
  });

  addText(slide, '参与层级不是产品 SKU，也不是默认升级路径；场景按价值、owner、数据、可构建性与运营 readiness 选择。', {
    x: 0.72, y: 6.36, w: 11.85, h: 0.24,
    fontSize: 10.3, bold: true, color: COLORS.ink, align: 'center'
  });
  addText(slide, 'The tiers are neither product SKUs nor a default maturity path; scenario selection uses value, ownership, data, buildability, and operating readiness.', {
    x: 0.8, y: 6.62, w: 11.7, h: 0.14,
    fontSize: 6.8, color: COLORS.muted, align: 'center'
  });
  addFooter(slide, 4, false, 'Product terminology: Microsoft Learn, Copilot Studio harnesses overview and workflows overview, accessed August 2026.');
}

function createProcess(pptx, flowSpec) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addBilingualTitle(slide, '三方在六阶段共同推进、分别负责', 'Three Teams Advance Six Stages with Clear Accountability', '04', false);
  addText(slide, '微软提供方法与教练；客户 IT 负责平台和运营；业务负责场景事实、验收与采用。客户 sponsor 负责优先级与规模化决策。', {
    x: 0.72, y: 1.16, w: 11.9, h: 0.26,
    fontSize: 10.8, bold: true, color: COLORS.ink, align: 'center'
  });
  addText(slide, 'Microsoft coaches. Customer IT owns platform readiness and operations. Business owns scenario facts, acceptance, and adoption. The sponsor owns priority and scale decisions.', {
    x: 0.76, y: 1.45, w: 11.8, h: 0.19,
    fontSize: 6.9, color: COLORS.muted, align: 'center'
  });

  const roleNodes = flowSpec.nodes.filter((node) => node.layer === 0).sort((a, b) => a.order - b.order);
  const phaseLayers = [1, 2, 3, 4, 5, 6];
  const phaseHeaders = [
    ['对齐与启发', 'Align & inspire', '0–1'],
    ['内部场景征集', 'Discover', '2–3'],
    ['选择三个场景', 'Select three', '4'],
    ['共创实验方案', 'Co-design', '5'],
    ['动手 Workshop', 'Hands-on', '6'],
    ['试点衡量决策', 'Pilot & decide', '7–12']
  ];
  const roleStyles = [
    { fill: COLORS.softTeal, accent: COLORS.teal },
    { fill: COLORS.softBlue, accent: COLORS.blue },
    { fill: COLORS.softCoral, accent: COLORS.coral }
  ];
  const gridX = 1.86;
  const gridY = 2.23;
  const colW = 1.815;
  const rowH = 1.18;

  phaseHeaders.forEach((phase, index) => {
    const x = gridX + index * colW;
    const headerFill = index < 2 ? 'EAF0F6' : index < 4 ? 'F7EEDB' : 'E5F2EF';
    addCard(slide, x, 1.73, colW - 0.035, 0.46, headerFill, COLORS.line, 0.025);
    addText(slide, `${String(index + 1).padStart(2, '0')}  ${phase[0]}`, {
      x: x + 0.08, y: 1.81, w: colW - 0.2, h: 0.2,
      fontSize: 8.5, bold: true, color: COLORS.ink, align: 'center'
    });
    addText(slide, `${phase[1]} · W${phase[2]}`, {
      x: x + 0.08, y: 2.02, w: colW - 0.2, h: 0.13,
      fontSize: 5.6, color: COLORS.muted, align: 'center'
    });
  });

  roleNodes.forEach((role, roleIndex) => {
    const y = gridY + roleIndex * rowH;
    const style = roleStyles[roleIndex];
    addCard(slide, 0.55, y, 1.22, rowH - 0.04, style.accent, style.accent, 0.04);
    addText(slide, role.label.zh, {
      x: 0.65, y: y + 0.24, w: 1.02, h: 0.27,
      fontSize: 12.5, bold: true, color: COLORS.white, align: 'center'
    });
    addText(slide, role.label.en, {
      x: 0.65, y: y + 0.56, w: 1.02, h: 0.2,
      fontSize: 7.2, bold: true, color: COLORS.white, align: 'center'
    });
    addText(slide, role.detail.zh, {
      x: 0.62, y: y + 0.82, w: 1.08, h: 0.18,
      fontSize: 5.8, color: COLORS.white, align: 'center'
    });

    phaseLayers.forEach((layer, phaseIndex) => {
      const node = flowSpec.nodes.find((item) => item.layer === layer && item.order === role.order);
      const x = gridX + phaseIndex * colW;
      addCard(slide, x, y, colW - 0.035, rowH - 0.04, style.fill, 'D8DEDD', 0.025);
      addText(slide, node.short.zh, {
        x: x + 0.09, y: y + 0.17, w: colW - 0.22, h: 0.32,
        fontSize: 9.4, bold: true, color: COLORS.ink, align: 'center', valign: 'mid'
      });
      addText(slide, node.short.en, {
        x: x + 0.09, y: y + 0.59, w: colW - 0.22, h: 0.28,
        fontSize: 6.9, color: COLORS.muted, align: 'center', valign: 'mid'
      });
    });
  });

  addText(slide, '阶段产物 / Phase Deliverables', {
    x: 0.47, y: 5.9, w: 1.3, h: 0.45,
    fontSize: 7.7, bold: true, color: COLORS.teal, align: 'center', valign: 'mid'
  });
  const deliverables = [
    ['Program charter', 'Program charter'],
    ['合格场景池', 'Qualified backlog'],
    ['三份场景简报', 'Three briefs'],
    ['实验计划', 'Lab plan'],
    ['原型与待办', 'Prototypes + backlog'],
    ['评分卡与决策', 'Scorecard + decision']
  ];
  deliverables.forEach((item, index) => {
    const x = gridX + index * colW;
    addCard(slide, x, 5.85, colW - 0.035, 0.57, index === 5 ? COLORS.navy : 'F2F1EC', COLORS.line, 0.025);
    addText(slide, item[0], {
      x: x + 0.08, y: 5.96, w: colW - 0.2, h: 0.18,
      fontSize: 7.7, bold: true, color: index === 5 ? COLORS.white : COLORS.ink, align: 'center'
    });
    addText(slide, item[1], {
      x: x + 0.08, y: 6.17, w: colW - 0.2, h: 0.13,
      fontSize: 5.5, color: index === 5 ? 'C8D5DA' : COLORS.muted, align: 'center'
    });
  });

  addPill(slide, 'G1 · 批准三个场景', gridX + 2 * colW + 0.08, 6.55, colW - 0.2, COLORS.coral, COLORS.white);
  addPill(slide, 'G2 · 批准试点', gridX + 4 * colW + 0.08, 6.55, colW - 0.2, COLORS.teal, COLORS.white);
  addPill(slide, 'G3 · 迭代 / 运营 / 停止', gridX + 5 * colW + 0.08, 6.55, colW - 0.2, COLORS.navy, COLORS.white);
  addFooter(slide, 5, false, 'Illustrative 12-week cadence. Microsoft advises and coaches; the customer owns business outcomes, platform operations, and scale decisions.');
}

async function main() {
  const PptxGenJS = loadPptxGenJS();
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Study Room';
  pptx.company = 'Microsoft';
  pptx.subject = 'Copilot Studio Customer Enablement Program';
  pptx.title = 'Copilot Studio Customer Enablement Program | Copilot Studio 客户创新落地计划';
  pptx.lang = 'zh-CN';
  pptx.theme = {
    headFontFace: HEADER_FONT,
    bodyFontFace: BODY_FONT,
    lang: 'zh-CN'
  };

  const coverData = imageData(path.join(MEDIA_DIR, 'program-cover.png'));
  const flowSpec = JSON.parse(fs.readFileSync(path.join(MEDIA_DIR, 'program-flow.diagram.json'), 'utf8'));

  createCover(pptx, coverData);
  createChallenge(pptx);
  createOverview(pptx);
  createEngagement(pptx);
  createProcess(pptx, flowSpec);

  if (pptx._slides.length !== 5) {
    throw new Error(`Expected exactly 5 slides, found ${pptx._slides.length}`);
  }

  const data = await pptx.write('nodebuffer');
  const output = Buffer.isBuffer(data) ? data : Buffer.from(data);
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`Slides: ${pptx._slides.length}`);
  console.log(`Bytes: ${output.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
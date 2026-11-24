(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KHVideoGenerator = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var upstreamInfo = { repository: 'zaz8848/Video-Generator', version: '0.2.0', upstreamRepository: 'adunext/adu-motion-video', upstreamRelease: '3.12.0', upstreamFiles: 1042, license: 'MIT' };
  var visualThemes = [
    {
      id: 'professional',
      name: ['专业 (Professional)', 'Professional'],
      shortName: ['🏛️ 专业', '🏛️ Professional'],
      defaultPack: '01-A',
      defaultMusic: 'ambient-tech',
      summary: ['深邃蓝灰/暖米学术多色平滑渐变网格底 + 精密呼吸网格线、几何坐标标尺与稳重卡片', 'Refined slate/ivory gradient mesh + breathing coordinate grid and structured cards'],
      palette: { background: '#0F172A', surface: '#1E293B', ink: '#F8FAFC', accent: '#38BDF8', secondary: '#94A3B8', darkBg: '#090D16' }
    },
    {
      id: 'vibrant',
      name: ['活泼 (Vibrant)', 'Vibrant'],
      shortName: ['✨ 活泼', '✨ Vibrant'],
      defaultPack: '05-A',
      defaultMusic: 'upbeat-pulse',
      summary: ['明快珊瑚橙/青柠撞色流体渐变 + 漂浮跃动的有机圆润光斑气泡与轻盈弹性卡片', 'Coral/mint fluid gradient mesh + floating organic living bubbles and bouncy cards'],
      palette: { background: '#FFFDF9', surface: '#FFFFFF', ink: '#0F172A', accent: '#F97316', secondary: '#0D9488', darkBg: '#18181B' }
    },
    {
      id: 'dynamic',
      name: ['动态 (Dynamic)', 'Dynamic'],
      shortName: ['⚡ 动态', '⚡ Dynamic'],
      defaultPack: '04-A',
      defaultMusic: 'dynamic-drive',
      summary: ['高能量深空霓虹渐变底 + 实时流动的能量光线轨迹、底部时间驱动律动声谱条与张力推拉', 'High-energy neon space gradient + flowing light trails and time-driven waveform pulse bars'],
      palette: { background: '#090D16', surface: '#131C2E', ink: '#F1F5F9', accent: '#38BDF8', secondary: '#818CF8', darkBg: '#060911' }
    },
    {
      id: 'elegant',
      name: ['优雅 (Elegant)', 'Elegant'],
      shortName: ['🌿 优雅', '🌿 Elegant'],
      defaultPack: '01-D',
      defaultMusic: 'elegant-minimal',
      summary: ['丝绸感暖金/暮紫柔光多层径向渐变 + 如生命呼吸般缓慢舒展的有机光晕微粒与细腻转场', 'Warm gold/twilight violet silk gradient + breathing bioluminescent bokeh particles'],
      palette: { background: '#171226', surface: '#241C38', ink: '#FAF8FF', accent: '#F59E0B', secondary: '#C084FC', darkBg: '#110D1D' }
    }
  ];

  var briefTemplates = [
    { id: 'solution', name: ['方案讲解', 'Solution Explainer'], seconds: 180, music: 'ambient-tech', visualTheme: 'professional', description: ['3 分钟 · 挑战、方案、获益与落地', '3 min · Challenge, solution, benefits and rollout'],
      audience: ['需要快速理解方案价值的一线业务用户与业务决策者', 'Frontline users and business decision-makers evaluating a solution'],
      goal: ['讲清业务挑战、方案如何运转、谁能获得什么，以及成本与实施边界；引导观众阅读原文。', 'Explain the challenge, how the solution works, who benefits, and the cost and implementation boundaries; invite viewers to read the article.'],
      style: ['根据方案的信息关系选择表达方式，用简洁的文字、图形、对象动画、运镜或必要的图像讲清机制与价值，不默认每镜生图。', 'Choose text, graphics, object animation, camera movement or imagery according to the information being explained. Make the mechanism and value clear; do not default to an image per shot.'] },
    { id: 'technical', name: ['技术拆解', 'Technical Breakdown'], seconds: 240, music: 'ambient-tech', visualTheme: 'dynamic', description: ['4 分钟 · 架构、流程、取舍与边界', '4 min · Architecture, flows, trade-offs and limits'],
      audience: ['具备基础领域知识的技术负责人、架构师与开发者', 'Technical leads, architects and developers with basic domain knowledge'],
      goal: ['让观众理解核心机制、组件分工与关键流程，能够说明方案取舍、适用条件和失败边界，不把设计目标当成实测结果。', 'Explain the core mechanism, component responsibilities and critical flows, including trade-offs, prerequisites and failure boundaries. Distinguish design targets from measured results.'],
      style: ['以理解技术机制为目标，自主选择图形关系、动态流程、文字强调、运镜或图像；把关键路径、取舍和异常解释清楚，不预设画面类型。', 'Choose relationships, animated flows, typographic emphasis, camera moves or images to explain the mechanism, critical paths, trade-offs and failures. No prescribed visual format.'] },
    { id: 'education', name: ['知识科普', 'Knowledge Explainer'], seconds: 180, music: 'upbeat-pulse', visualTheme: 'vibrant', description: ['3 分钟 · 问题、概念、案例与误区', '3 min · Question, concept, example and misconceptions'],
      audience: ['第一次接触这个主题、希望快速建立理解的普通读者', 'General readers encountering the topic for the first time'],
      goal: ['从一个具体问题解释核心概念，用一个例子讲清原理，再指出常见误区和观众可以采取的下一步；保留事实与适用条件。', 'Start with a concrete question, explain the core concept through one example, then address misconceptions and a practical next step while preserving facts and conditions.'],
      style: ['用观众容易理解的可视化解释概念，让文字、运动、图形或图像按需要承担不同任务；清楚、简洁，避免装饰性堆砌。', 'Explain concepts with accessible visuals. Let text, motion, graphics or images serve the explanation as needed; keep it clear and concise rather than decorative.'] },
    { id: 'promo', name: ['短视频宣发', 'Short-form Promotion'], seconds: 60, music: 'dynamic-drive', visualTheme: 'elegant', description: ['1 分钟 · 痛点、核心价值与阅读引导', '1 min · Pain point, key value and reading invitation'],
      audience: ['尚未读过原文、需要迅速判断是否值得深入了解的潜在读者', 'Potential readers deciding whether to explore the full article'],
      goal: ['用一个具体痛点吸引注意，只讲一个核心价值和一个有来源的例子，最后引导阅读原文；不承诺未经验证的效果，不试图覆盖全部细节。', 'Hook viewers with one concrete pain point, present one core value and one sourced example, then invite them to read the article. Do not promise unverified outcomes or cover every detail.'],
      style: ['自主选择最能抓住核心价值的表达手段，用节奏、构图、短句和必要的视觉变化推进，不强制人物故事或图像背景，避免信息过载。', 'Choose the clearest way to convey the core value through pacing, composition, concise copy and purposeful visual change. Character stories and image backgrounds are not mandatory.'] }
  ];
  var scenarios = [
    { id: 'presenter', name: ['真人口播 / 知识讲解', 'Presenter & Knowledge Talk'], badge: ['Adu 0.2 · 口播主线', 'Adu 0.2 · Presenter'],
      summary: ['面向人物口播、观点拆解、教程交接与方法分享，保留原声/TTS 节奏强调、分屏舞台与九类镜头编舞。', 'Built for presenter talks, breakdowns, tutorials, and method sharing with rhythmic typography, split stage, and 9 scene choreographies.'],
      defaultStylePack: '01-A', defaultTemplate: 'education' },
    { id: 'product', name: ['纯产品介绍 / 实测演示', 'Product Walkthrough & Demo'], badge: ['Adu 0.2 · 无人物产品线', 'Adu 0.2 · Product'],
      summary: ['无需真人出镜，面向软件录屏、界面静帧、操作定格恢复与架构图解，强调完整边框（contain）与底部独立字幕带。', 'No presenter video required; built for screen captures, UI stills, freeze-and-resume inspection, and architecture diagrams with safe contain bounds.'],
      defaultStylePack: '03-A', defaultTemplate: 'technical' }
  ];
  var stylePacks = [
    { id: '01-A', family: '01', familyTitle: ['现代图文口播', 'Modern Editorial Talk'], title: ['01-A · 原片节奏', '01-A · Classic Rhythm'],
      selection: 'classic-performance@1.0.0', portraitSelection: 'classic-performance@1.1.1-candidate', status: 'released', scenario: 'presenter',
      palette: { background: '#F7F4EF', surface: '#FFFFFF', ink: '#121316', accent: '#2462EA', secondary: '#5C5C5C', darkBg: '#0E1117' },
      summary: ['清爽白底、科技蓝强调与右侧口播/重点卡，适合知识讲解与方案拆解。', 'Crisp paper background, electric blue accents, and structured cards for clear explanations.'],
      stylePrompt: 'Adu 01-A 原片节奏风格（classic-performance@1.0.0）：清爽纸白底（#F7F4EF）与深墨黑大字（#121316），科技蓝（#2462EA）重点高亮，镜头间采用开场大标题、逐词论点卡、数据滚动与横向步骤交替推进。' },
    { id: '01-B', family: '01', familyTitle: ['现代图文口播', 'Modern Editorial Talk'], title: ['01-B · 连续形变', '01-B · Continuous Morph'],
      selection: 'continuous-performance@1.0.0', portraitSelection: 'continuous-performance@1.1.1-candidate', status: 'released', scenario: 'presenter',
      palette: { background: '#F4F6FA', surface: '#FFFFFF', ink: '#141824', accent: '#2563EB', secondary: '#64748B', darkBg: '#0F172A' },
      summary: ['强调概念拆解与收束形变，适合架构演进与因果链条说明。', 'Continuous morphing transitions for architecture evolution and causal breakdowns.'],
      stylePrompt: 'Adu 01-B 连续形变风格（continuous-performance@1.0.0）：冷白画布配深蓝几何演进图形，通过连续位移与缩放表现概念拆解与收束。' },
    { id: '01-C', family: '01', familyTitle: ['现代图文口播', 'Modern Editorial Talk'], title: ['01-C · 纵深舞台', '01-C · Depth Stage'],
      selection: 'stage-performance@1.0.0', portraitSelection: 'stage-performance@1.1.1-candidate', status: 'released', scenario: 'presenter',
      palette: { background: '#11141C', surface: '#1E2433', ink: '#F8FAFC', accent: '#3B82F6', secondary: '#94A3B8', darkBg: '#090B10' },
      summary: ['前后景层次与舞台聚光，适合观点交锋、证据举证与核心结论。', 'Layered stage depth and spotlight framing for claim-and-evidence narratives.'],
      stylePrompt: 'Adu 01-C 纵深舞台风格（stage-performance@1.0.0）：深灰蓝纵深舞台背景，前景高对比卡片与镜头推拉，突出核心证据与焦点。' },
    { id: '01-D', family: '01', familyTitle: ['现代图文口播', 'Modern Editorial Talk'], title: ['01-D · 杂志分屏', '01-D · Editorial Split'],
      selection: 'editorial-performance@1.2.0-candidate', portraitSelection: 'editorial-performance@1.2.1-candidate', status: 'candidate', scenario: 'presenter',
      palette: { background: '#FAF7F2', surface: '#FFFFFF', ink: '#18181B', accent: '#B11F4B', secondary: '#71717A', darkBg: '#18181B' },
      summary: ['黄金比例杂志分屏、时间线演进与手册收束，适合深度研究报告。', 'Magazine split-screen layouts, evolving timelines, and handbook takeaways.'],
      stylePrompt: 'Adu 01-D 杂志分屏风格（editorial-performance@1.2.0-candidate）：暖白杂志排版配胭脂红（#B11F4B）强调色，左右分屏对照阐述论据与结论。' },
    { id: '01-E', family: '01', familyTitle: ['现代图文口播', 'Modern Editorial Talk'], title: ['01-E · 节拍字效', '01-E · Kinetic Typography'],
      selection: 'kinetic-performance@1.2.0-candidate', portraitSelection: 'kinetic-performance@1.2.1-candidate', status: 'candidate', scenario: 'presenter',
      palette: { background: '#0A0A0A', surface: '#171717', ink: '#FFFFFF', accent: '#38BDF8', secondary: '#A3A3A3', darkBg: '#0A0A0A' },
      summary: ['高对比节拍大字砸入与三项归一编舞，适合痛点冲击与金句传播。', 'High-impact kinetic typography and three-item consolidation for punchy insights.'],
      stylePrompt: 'Adu 01-E 节拍字效风格（kinetic-performance@1.2.0-candidate）：纯黑底高反差大字冲击、节拍推进与三项合并动效，少图多字、节奏鲜明。' },
    { id: '02-A', family: '02', familyTitle: ['纸面透视讲解', 'Paper Perspective'], title: ['02-A · 纸面天平', '02-A · Paper Balance'],
      selection: 'paper-balance@1.0.0', portraitSelection: 'paper-balance@1.1.1-candidate', status: 'released', scenario: 'presenter',
      palette: { background: '#F5EFE6', surface: '#FFFDF9', ink: '#231F20', accent: '#D9534F', secondary: '#7A7267', darkBg: '#1E1B18' },
      summary: ['纸张肌理与天平权衡图解，适合方案取舍、成本收益对比与选型决策。', 'Tactile paper aesthetic and balance metaphors for trade-offs and decision analysis.'],
      stylePrompt: 'Adu 02-A 纸面天平风格（paper-balance@1.0.0）：温润米黄纸面质感，以左右天平与正反对比卡片呈现方案取舍与价值平衡。' },
    { id: '02-B', family: '02', familyTitle: ['纸面透视讲解', 'Paper Perspective'], title: ['02-B · 纸面聚合', '02-B · Paper Network'],
      selection: 'paper-ball-performance@1.0.0', portraitSelection: 'paper-ball-performance@1.1.1-candidate', status: 'released', scenario: 'presenter',
      palette: { background: '#F2ECE1', surface: '#FFFFFF', ink: '#1C1917', accent: '#0D8F8C', secondary: '#78716C', darkBg: '#1C1917' },
      summary: ['透视卡片汇聚成信息网络与交付日历，适合多模块协同与项目复盘。', 'Perspective cards converging into an information network and delivery calendar.'],
      stylePrompt: 'Adu 02-B 纸面聚合风格（paper-ball-performance@1.0.0）：透视卡片与连接线网络，把分散知识点聚合为可执行的交付步骤。' },
    { id: '03-A', family: '03', familyTitle: ['深色 3D', 'Dark 3D Showcase'], title: ['03-A · 多屏展陈', '03-A · Multi-Screen Stage'],
      selection: 'anim4-showcase-macro@1.3.1-candidate', portraitSelection: 'anim4-showcase-macro@1.3.2-candidate', status: 'candidate', scenario: 'product',
      palette: { background: '#0B0F19', surface: '#161F33', ink: '#F1F5F9', accent: '#60A5FA', secondary: '#94A3B8', darkBg: '#070A12' },
      summary: ['暗色舞台、macOS 窗口展陈与镜头推进，突出产品细节、界面评测与成果对照。', 'Dark 3D stage, framed application windows, and camera pushes for software demos and reviews.'],
      stylePrompt: 'Adu 03-A 深色 3D 多屏展陈风格（anim4-showcase-macro@1.3.1-candidate）：深邃暗色舞台（#0B0F19）、立体应用窗口与右侧核验清单，突出真实产品界面与架构层次。' },
    { id: '04-A', family: '04', familyTitle: ['深色科技控制台', 'Dark Tech Console'], title: ['04-A · 仪器台演示', '04-A · Instrument Console'],
      selection: 'doubao-console-performance@0.3.0-candidate', portraitSelection: 'doubao-console-performance@0.3.1-candidate', status: 'candidate', scenario: 'product',
      palette: { background: '#090D16', surface: '#131C2E', ink: '#E2E8F0', accent: '#38BDF8', secondary: '#64748B', darkBg: '#05080F' },
      summary: ['粒子仪器台、玻璃面板与数据流，配合输入融合、步骤展开和手册交付。', 'Instrument console, glass panels, and data flows for technical pipelines and automation tests.'],
      stylePrompt: 'Adu 04-A 深色科技控制台风格（doubao-console-performance@0.3.0-candidate）：暗黑玻璃仪器台面板配青蓝数据流（#38BDF8），呈现输入融合、分步执行与结果交付。' },
    { id: '05-A', family: '05', familyTitle: ['鲜色角色叙事', 'Vivid Sticker Narrative'], title: ['05-A · 角色与物件接力', '05-A · Sticker Relay'],
      selection: 'vivid-sticker-performance@0.2.0-candidate', portraitSelection: 'vivid-sticker-performance@0.2.1-candidate', status: 'candidate', scenario: 'presenter',
      palette: { background: '#FFFDF7', surface: '#FEF3C7', ink: '#1E293B', accent: '#F97316', secondary: '#64748B', darkBg: '#1E293B' },
      summary: ['鲜色便签、贴纸物件接力与光环强调，把关键词、成果和反馈串成连贯故事。', 'Vibrant sticky notes, relay objects, and halo highlights connecting keywords to outcomes.'],
      stylePrompt: 'Adu 05-A 鲜色角色叙事风格（vivid-sticker-performance@0.2.0-candidate）：明快暖白画布配活力橙（#F97316）便签贴纸与接力箭头，适合实操教程与经验复用。' },
    { id: '06-A', family: '06', familyTitle: ['活力色彩', 'Vibrant Color'], title: ['06-A · 活力高反差', '06-A · High-Contrast Pop'],
      selection: 'vibrant-color-performance@0.1.0-candidate', portraitSelection: 'vibrant-color-performance@0.1.1-candidate', status: 'candidate', scenario: 'presenter',
      palette: { background: '#F8FAFC', surface: '#EFF6FF', ink: '#0F172A', accent: '#EF4444', secondary: '#2563EB', darkBg: '#0F172A' },
      summary: ['纸白、鲜红与科技蓝碰撞，搭配回声大标题、步骤归一与成本定论。', 'Paper white, crimson, and cobalt blue with echo headlines and cost-to-verdict blocks.'],
      stylePrompt: 'Adu 06-A 活力色彩风格（vibrant-color-performance@0.1.0-candidate）：纸白、鲜红（#EF4444）与深蓝高反差色块，大字回声标题与结论盖章。' }
  ];

  var scenePresets = [
    { id: 'hero', code: 'TPL.hero', name: ['01 开场大标题', '01 Hero Opener'], summary: ['核心命题大字砸入 + 副标题递进 + 右侧重点视觉区', 'High-impact title slam + subtitle reveal + right visual card'] },
    { id: 'point', code: 'TPL.point', name: ['02 逐词论点卡', '02 Key Points'], summary: ['顶部核心论点 + 三张横向递进编号要点卡片', 'Top thesis headline + three numbered horizontal point cards'] },
    { id: 'number', code: 'TPL.number', name: ['03 数据指标滚动', '03 Metric Counter'], summary: ['超大关键数字指标 + 进度条填满 + 证据边界说明', 'Oversized metric counter + progress bar fill + evidence note'] },
    { id: 'compare', code: 'TPL.compare', name: ['04 前后对比盖章', '04 Before / After Compare'], summary: ['左侧旧做法划除盖章 + 右侧新方案高亮对照', 'Left legacy approach crossed out + right solution highlighted'] },
    { id: 'steps', code: 'TPL.steps', name: ['05 横向步骤时间线', '05 Step Timeline'], summary: ['水平连线轴逐段点亮 + 编号圆章与动作说明', 'Horizontal timeline axis with numbered step nodes'] },
    { id: 'quote', code: 'TPL.quote', name: ['06 全屏金句强调', '06 Fullscreen Quote'], summary: ['高饱和主色背景 + 居中大字核心结论慢推', 'Full-bleed accent background + centered thesis zoom'] },
    { id: 'demo', code: 'TPL.demo', name: ['07 产品窗口演示', '07 App Window Demo'], summary: ['左侧 macOS 窗口完整取景（contain）+ 右侧功能打勾卡', 'Left macOS window frame + right feature check cards'] },
    { id: 'checklist', code: 'TPL.checklist', name: ['08 要点核验清单', '08 Verification Checklist'], summary: ['结构化核验条目逐行滑入并弹簧打勾', 'Structured verification rows sliding in with checkmarks'] },
    { id: 'outro', code: 'TPL.outro', name: ['09 终端片尾总结', '09 Terminal Outro'], summary: ['深色终端命令框逐字打出下一步行动与原文入口', 'Dark terminal window typing out next steps and article link'] }
  ];

  function getStylePack(id) {
    var i;
    for (i = 0; i < stylePacks.length; i++) {
      if (stylePacks[i].id === id) return stylePacks[i];
    }
    return stylePacks[0];
  }

  function getVisualTheme(id) {
    var i;
    for (i = 0; i < visualThemes.length; i++) {
      if (visualThemes[i].id === id) return visualThemes[i];
    }
    return visualThemes[0];
  }

  function getScenario(id) {
    return id === 'product' ? scenarios[1] : scenarios[0];
  }

  function splitFragments(text, count) {
    var raw = String(text || '').replace(/\s+/g, ' ').trim();
    var parts = raw.split(/[。！？；!?;，,、·—]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var out = [], i;
    for (i = 0; i < count; i++) {
      out.push((parts[i] || parts[parts.length - 1] || ('要点 ' + (i + 1))).slice(0, 32));
    }
    return out;
  }

  function extractMetric(text) {
    var match = /(\d+(?:\.\d+)?)\s*(%|倍|x|X|ms|s|秒|分钟|小时|天|个|项|条|篇|步|GB|MB|KB|元|万)?/.exec(String(text || ''));
    if (match) return { number: match[1], unit: match[2] || '' };
    return { number: '100', unit: '%' };
  }

  function detectScenePreset(scene, index, total) {
    var comp = scene && scene.composition;
    var layers = comp && Array.isArray(comp.layers) ? comp.layers : [];
    var i, text;
    for (i = 0; i < layers.length; i++) {
      text = String(layers[i].text || '');
      if (text.indexOf('// 02 —') === 0) return 'point';
      if (text.indexOf('// 03 —') === 0) return 'number';
      if (text.indexOf('// 04 —') === 0) return 'compare';
      if (text.indexOf('// 05 —') === 0) return 'steps';
      if (text.indexOf('// 07 —') === 0) return 'demo';
      if (text.indexOf('// 08 —') === 0) return 'checklist';
      if (text.indexOf('// 09 —') === 0) return 'outro';
      if (text.indexOf('STUDY ROOM ·') === 0) return 'hero';
    }
    var intent = String(scene && scene.intent || '');
    var presetMatch = /\b(hero|point|number|compare|steps|quote|demo|checklist|outro)\b/.exec(intent);
    if (presetMatch) return presetMatch[1];
    if (scene && scene.id === 'auto-hero') return 'hero';
    if (scene && scene.id === 'auto-outro') return 'outro';
    if (index === 0) return 'hero';
    if (total > 1 && index === total - 1) return 'outro';
    return 'point';
  }

  function applyVisualThemeToScenes(scenes, visualThemeId, packId) {
    var vTheme = getVisualTheme(visualThemeId || 'professional');
    var targetPackId = packId || vTheme.defaultPack || '01-A';
    var list = Array.isArray(scenes) ? scenes : [];
    return list.map(function (scene, idx) {
      var preset = detectScenePreset(scene, idx, list.length);
      var rebuilt = buildTemplateComposition(preset, scene, targetPackId, vTheme.id);
      return Object.assign({}, scene, {
        composition: rebuilt
      });
    });
  }

  function buildTemplateComposition(presetId, scene, packId, visualThemeId) {
    var pack = getStylePack(packId || '01-A');
    var vTheme = getVisualTheme(visualThemeId || (scene && scene.visualTheme) || 'professional');
    var p = visualThemeId ? vTheme.palette : pack.palette;
    var title = String(scene && scene.title || '核心观点').slice(0, 48);
    var narration = String(scene && scene.narration || '先核对事实，再确认下一步行动。');
    var hasVisual = Boolean(scene && scene.visual && String(scene.visual).trim());
    var points = splitFragments(narration, 3);
    var metric = extractMetric((scene && scene.screenText || '') + ' ' + narration);
    var layers = [];
    var background = p.background;
    var camera = { x: 0.5, y: 0.5, scale: 1, keyframes: [{ at: 0, scale: 1, x: 0.5, y: 0.5 }, { at: 1, scale: 1.035, x: 0.5, y: 0.5 }] };

    if (presetId === 'hero') {
      layers.push({ type: 'rect', x: 0.22, y: 0.13, width: 0.28, height: 0.062, radius: 0.5, fill: p.surface, stroke: p.accent, strokeWidth: 2 });
      layers.push({ type: 'text', x: 0.22, y: 0.13, width: 0.25, height: 0.05, text: 'STUDY ROOM · ' + vTheme.name[0].split(' ')[0] + ' · ' + pack.id, fontSize: 26, weight: 700, fill: p.accent, align: 'center' });
      layers.push({
        type: 'rect', x: 0.34, y: 0.46, width: 0.56, height: 0.52, radius: 0.04, fill: p.surface, stroke: p.accent, strokeWidth: 3,
        keyframes: [{ at: 0, opacity: 0, y: 0.51 }, { at: 0.2, opacity: 0.94, y: 0.46 }]
      });
      layers.push({
        type: 'text', bind: 'screenText', x: 0.34, y: 0.39, width: 0.50, height: 0.28,
        text: scene && scene.screenText || title, fontSize: 72, weight: 800, fill: p.ink, align: 'left',
        keyframes: [{ at: 0, opacity: 0, scale: 1.12, y: 0.44 }, { at: 0.22, opacity: 1, scale: 1, y: 0.39 }]
      });
      layers.push({
        type: 'text', x: 0.34, y: 0.61, width: 0.50, height: 0.14,
        text: points[0] + ' · ' + points[1], fontSize: 34, weight: 600, fill: p.accent, align: 'left',
        keyframes: [{ at: 0, opacity: 0, y: 0.65 }, { at: 0.32, opacity: 1, y: 0.61 }]
      });
      if (hasVisual) {
        layers.push({
          type: 'rect', x: 0.80, y: 0.46, width: 0.30, height: 0.56, radius: 0.04, fill: p.surface, stroke: p.accent, strokeWidth: 3,
          keyframes: [{ at: 0, opacity: 0, scale: 0.92 }, { at: 0.28, opacity: 1, scale: 1 }]
        });
        layers.push({
          type: 'image', x: 0.80, y: 0.46, width: 0.28, height: 0.52, fit: 'cover',
          keyframes: [{ at: 0, opacity: 0, scale: 0.94 }, { at: 0.3, opacity: 1, scale: 1 }]
        });
      } else {
        layers.push({
          type: 'group', x: 0.80, y: 0.46, width: 0.30, height: 0.52,
          keyframes: [{ at: 0, opacity: 0, scale: 0.9 }, { at: 0.28, opacity: 1, scale: 1 }],
          children: [
            { type: 'rect', x: 0.5, y: 0.5, width: 0.96, height: 0.96, radius: 0.06, fill: p.surface, stroke: p.accent, strokeWidth: 3 },
            { type: 'ellipse', x: 0.5, y: 0.32, width: 0.36, height: 0.32, fill: p.accent, opacity: 0.22 },
            { type: 'text', x: 0.5, y: 0.32, width: 0.8, height: 0.2, text: metric.number + metric.unit, fontSize: 64, weight: 800, fill: p.accent, align: 'center' },
            { type: 'text', x: 0.5, y: 0.68, width: 0.84, height: 0.32, text: points[2] || title, fontSize: 32, weight: 600, fill: p.ink, align: 'center' }
          ]
        });
      }
    } else if (presetId === 'point') {
      background = p.darkBg;
      layers.push({ type: 'text', x: 0.26, y: 0.11, width: 0.4, height: 0.06, text: '// 02 — 核心论点与架构拆解', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({
        type: 'text', bind: 'screenText', x: 0.5, y: 0.24, width: 0.88, height: 0.18,
        text: scene && scene.screenText || title, fontSize: 68, weight: 800, fill: '#FFFFFF', align: 'left',
        keyframes: [{ at: 0, opacity: 0, y: 0.29 }, { at: 0.2, opacity: 1, y: 0.24 }]
      });
      points.forEach(function (pt, idx) {
        var cx = 0.21 + idx * 0.29;
        layers.push({
          type: 'group', x: cx, y: 0.58, width: 0.27, height: 0.38,
          keyframes: [{ at: 0, opacity: 0, y: 0.65 }, { at: 0.16 + idx * 0.12, opacity: 1, y: 0.58 }],
          children: [
            { type: 'rect', x: 0.5, y: 0.5, width: 0.96, height: 0.94, radius: 0.06, fill: '#1E293B', stroke: p.accent, strokeWidth: 3 },
            { type: 'rect', x: 0.24, y: 0.20, width: 0.34, height: 0.14, radius: 0.3, fill: p.accent },
            { type: 'text', x: 0.24, y: 0.20, width: 0.30, height: 0.12, text: '0' + (idx + 1), fontSize: 28, weight: 800, fill: '#0F172A', align: 'center' },
            { type: 'text', x: 0.5, y: 0.60, width: 0.86, height: 0.54, text: pt, fontSize: 36, weight: 700, fill: '#F8FAFC', align: 'left' }
          ]
        });
      });
    } else if (presetId === 'number') {
      background = p.darkBg;
      layers.push({ type: 'text', x: 0.28, y: 0.12, width: 0.44, height: 0.06, text: '// 03 — 关键量化指标与实测边界', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({
        type: 'rect', x: 0.5, y: 0.48, width: 0.86, height: 0.58, radius: 0.04, fill: '#162033', stroke: p.accent, strokeWidth: 3
      });
      layers.push({ type: 'text', x: 0.5, y: 0.26, width: 0.78, height: 0.1, text: title, fontSize: 44, weight: 700, fill: '#E2E8F0', align: 'left' });
      layers.push({
        type: 'text', x: 0.5, y: 0.46, width: 0.78, height: 0.26, text: metric.number + (metric.unit ? ' ' + metric.unit : ''),
        fontSize: 138, weight: 800, fill: p.accent, align: 'left',
        keyframes: [{ at: 0, opacity: 0, scale: 0.86, y: 0.51 }, { at: 0.25, opacity: 1, scale: 1, y: 0.46 }]
      });
      layers.push({ type: 'rect', x: 0.46, y: 0.63, width: 0.70, height: 0.022, radius: 0.5, fill: '#334155' });
      layers.push({
        type: 'rect', x: 0.46, y: 0.63, width: 0.70, height: 0.022, radius: 0.5, fill: p.accent,
        keyframes: [{ at: 0, scale: 0.08, opacity: 0.6 }, { at: 0.45, scale: 1, opacity: 1 }]
      });
      layers.push({
        type: 'text', bind: 'screenText', x: 0.5, y: 0.72, width: 0.78, height: 0.12,
        text: scene && scene.screenText || points[0], fontSize: 38, weight: 600, fill: '#F8FAFC', align: 'left'
      });
    } else if (presetId === 'compare') {
      layers.push({ type: 'text', x: 0.26, y: 0.10, width: 0.4, height: 0.06, text: '// 04 — 方案前后对比', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({
        type: 'group', x: 0.27, y: 0.49, width: 0.40, height: 0.62,
        keyframes: [{ at: 0, opacity: 0, x: 0.21 }, { at: 0.22, opacity: 1, x: 0.27 }],
        children: [
          { type: 'rect', x: 0.5, y: 0.5, width: 0.96, height: 0.94, radius: 0.04, fill: p.surface, stroke: '#64748B', strokeWidth: 3 },
          { type: 'text', x: 0.5, y: 0.16, width: 0.86, height: 0.1, text: 'BEFORE · 传统做法与痛点', fontSize: 28, weight: 800, fill: '#EF4444', align: 'left' },
          { type: 'text', x: 0.5, y: 0.52, width: 0.86, height: 0.48, text: '• ' + points[0] + '\n• 人工核对耗时长且易出错', fontSize: 38, weight: 600, fill: p.ink, align: 'left' },
          { type: 'path', x: 0.5, y: 0.54, width: 0.82, height: 0.24, fill: '#00000000', stroke: '#EF4444', strokeWidth: 10, path: 'M40 760 L960 240', keyframes: [{ at: 0.25, reveal: 0 }, { at: 0.5, reveal: 1 }] }
        ]
      });
      layers.push({
        type: 'group', x: 0.73, y: 0.49, width: 0.40, height: 0.62,
        keyframes: [{ at: 0, opacity: 0, x: 0.79 }, { at: 0.3, opacity: 1, x: 0.73 }],
        children: [
          { type: 'rect', x: 0.5, y: 0.5, width: 0.96, height: 0.94, radius: 0.04, fill: '#1E293B', stroke: p.accent, strokeWidth: 4 },
          { type: 'text', x: 0.5, y: 0.16, width: 0.86, height: 0.1, text: 'AFTER · 升级架构与收益', fontSize: 28, weight: 800, fill: p.accent, align: 'left' },
          { type: 'text', bind: 'screenText', x: 0.5, y: 0.54, width: 0.86, height: 0.52, text: scene && scene.screenText || ('✓ ' + points[1] + '\n✓ ' + points[2]), fontSize: 40, weight: 700, fill: '#FFFFFF', align: 'left' }
        ]
      });
    } else if (presetId === 'steps') {
      layers.push({ type: 'text', x: 0.26, y: 0.10, width: 0.4, height: 0.06, text: '// 05 — 关键执行步骤时间线', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({ type: 'text', bind: 'screenText', x: 0.5, y: 0.22, width: 0.88, height: 0.12, text: scene && scene.screenText || title, fontSize: 60, weight: 800, fill: p.ink, align: 'left' });
      layers.push({
        type: 'path', x: 0.5, y: 0.46, width: 0.78, height: 0.08, fill: '#00000000', stroke: p.accent, strokeWidth: 8,
        path: 'M50 500 H950', keyframes: [{ at: 0, reveal: 0 }, { at: 0.55, reveal: 1 }]
      });
      points.forEach(function (pt, idx) {
        var nx = 0.21 + idx * 0.29;
        layers.push({
          type: 'group', x: nx, y: 0.58, width: 0.27, height: 0.40,
          keyframes: [{ at: 0, opacity: 0, scale: 0.82 }, { at: 0.16 + idx * 0.15, opacity: 1, scale: 1 }],
          children: [
            { type: 'rect', x: 0.5, y: 0.58, width: 0.96, height: 0.74, radius: 0.06, fill: p.surface, stroke: p.accent, strokeWidth: 3 },
            { type: 'ellipse', x: 0.5, y: 0.18, width: 0.24, height: 0.24, fill: p.accent },
            { type: 'text', x: 0.5, y: 0.18, width: 0.22, height: 0.18, text: String(idx + 1), fontSize: 36, weight: 800, fill: '#0F172A', align: 'center' },
            { type: 'text', x: 0.5, y: 0.62, width: 0.88, height: 0.48, text: pt, fontSize: 34, weight: 700, fill: p.ink, align: 'center' }
          ]
        });
      });
    } else if (presetId === 'quote') {
      background = p.darkBg;
      camera = { x: 0.5, y: 0.5, scale: 1, keyframes: [{ at: 0, scale: 0.96, x: 0.5, y: 0.5 }, { at: 1, scale: 1.05, x: 0.5, y: 0.5 }] };
      layers.push({ type: 'rect', x: 0.5, y: 0.46, width: 0.86, height: 0.54, radius: 0.05, fill: '#1E293B', stroke: p.accent, strokeWidth: 4 });
      layers.push({
        type: 'text', bind: 'screenText', x: 0.5, y: 0.42, width: 0.78, height: 0.34,
        text: scene && scene.screenText || title, fontSize: 78, weight: 800, fill: '#FFFFFF', align: 'center',
        keyframes: [{ at: 0, opacity: 0, scale: 1.15 }, { at: 0.24, opacity: 1, scale: 1 }]
      });
      layers.push({
        type: 'text', x: 0.5, y: 0.66, width: 0.74, height: 0.1, text: '— ' + title, fontSize: 34, weight: 600, fill: p.accent, align: 'center',
        keyframes: [{ at: 0, opacity: 0, y: 0.70 }, { at: 0.38, opacity: 1, y: 0.66 }]
      });
    } else if (presetId === 'demo') {
      background = p.darkBg;
      layers.push({ type: 'text', x: 0.28, y: 0.10, width: 0.44, height: 0.06, text: '// 07 — 产品界面与架构演示', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({
        type: 'rect', x: 0.34, y: 0.49, width: 0.54, height: 0.60, radius: 0.03, fill: '#161F33', stroke: p.accent, strokeWidth: 3,
        keyframes: [{ at: 0, opacity: 0, scale: 0.94 }, { at: 0.22, opacity: 1, scale: 1 }]
      });
      if (hasVisual) {
        layers.push({
          type: 'image', x: 0.34, y: 0.50, width: 0.51, height: 0.54, fit: 'contain',
          keyframes: [{ at: 0, opacity: 0 }, { at: 0.25, opacity: 1 }]
        });
      } else {
        layers.push({
          type: 'text', bind: 'screenText', x: 0.34, y: 0.49, width: 0.48, height: 0.44,
          text: scene && scene.screenText || title, fontSize: 58, weight: 800, fill: '#F8FAFC', align: 'center'
        });
      }
      points.forEach(function (pt, idx) {
        var ry = 0.29 + idx * 0.20;
        layers.push({
          type: 'group', x: 0.80, y: ry, width: 0.32, height: 0.16,
          keyframes: [{ at: 0, opacity: 0, x: 0.85 }, { at: 0.2 + idx * 0.14, opacity: 1, x: 0.80 }],
          children: [
            { type: 'rect', x: 0.5, y: 0.5, width: 0.96, height: 0.92, radius: 0.06, fill: '#1E293B', stroke: p.accent, strokeWidth: 3 },
            { type: 'text', x: 0.5, y: 0.52, width: 0.88, height: 0.72, text: '✓ ' + pt, fontSize: 34, weight: 700, fill: '#FFFFFF', align: 'left' }
          ]
        });
      });
    } else if (presetId === 'checklist') {
      layers.push({ type: 'text', x: 0.26, y: 0.10, width: 0.4, height: 0.06, text: '// 08 — 要点核验清单', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({ type: 'text', bind: 'screenText', x: 0.5, y: 0.21, width: 0.86, height: 0.11, text: scene && scene.screenText || title, fontSize: 58, weight: 800, fill: p.ink, align: 'left' });
      points.forEach(function (pt, idx) {
        var cy = 0.38 + idx * 0.17;
        layers.push({
          type: 'group', x: 0.5, y: cy, width: 0.86, height: 0.14,
          keyframes: [{ at: 0, opacity: 0, x: 0.44 }, { at: 0.16 + idx * 0.14, opacity: 1, x: 0.5 }],
          children: [
            { type: 'rect', x: 0.5, y: 0.5, width: 0.98, height: 0.90, radius: 0.04, fill: p.surface, stroke: p.accent, strokeWidth: 3 },
            { type: 'text', x: 0.5, y: 0.52, width: 0.92, height: 0.68, text: '✓  ' + pt, fontSize: 38, weight: 700, fill: p.ink, align: 'left' }
          ]
        });
      });
    } else {
      background = p.darkBg;
      layers.push({ type: 'text', x: 0.26, y: 0.11, width: 0.42, height: 0.06, text: '// 09 — 总结与行动指引', fontSize: 28, weight: 700, fill: p.accent, align: 'left' });
      layers.push({ type: 'text', bind: 'screenText', x: 0.5, y: 0.25, width: 0.86, height: 0.14, text: scene && scene.screenText || title, fontSize: 64, weight: 800, fill: '#FFFFFF', align: 'left' });
      layers.push({
        type: 'rect', x: 0.5, y: 0.56, width: 0.86, height: 0.36, radius: 0.04, fill: '#111827', stroke: p.accent, strokeWidth: 3,
        keyframes: [{ at: 0, opacity: 0, y: 0.61 }, { at: 0.22, opacity: 1, y: 0.56 }]
      });
      layers.push({
        type: 'text', x: 0.5, y: 0.56, width: 0.80, height: 0.26,
        text: '$ ' + points.join('  →  ') + ' ▍', fontSize: 38, weight: 700, fill: '#93C5FD', align: 'left',
        keyframes: [{ at: 0.15, opacity: 0 }, { at: 0.4, opacity: 1 }]
      });
    }

    layers.push({ type: 'captions', x: 0.5, y: 0.91, width: 0.86, height: 0.12, fontSize: 40, weight: 700, fill: '#FFFFFF', align: 'center' });
    return { background: background, visualTheme: vTheme.id, camera: camera, layers: layers };
  }

  function containBounds(sourceWidth, sourceHeight, plan) {
    var band = plan.captionBand || 0;
    var areaWidth = plan.width - 2 * plan.inset;
    var areaHeight = plan.height - 2 * plan.inset - band;
    if (areaWidth < 2 || areaHeight < 2) throw new Error('安全留白或字幕带超出可用画幅。');
    var ratio = Math.min(1, areaWidth / sourceWidth, areaHeight / sourceHeight);
    var drawWidth = Math.max(2, Math.floor(sourceWidth * ratio / 2) * 2);
    var drawHeight = Math.max(2, Math.floor(sourceHeight * ratio / 2) * 2);
    return {
      width: drawWidth,
      height: drawHeight,
      x: Math.floor((plan.width - drawWidth) / 2),
      y: Math.floor((plan.height - band - drawHeight) / 2),
      ratio: ratio,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
      captionBand: band
    };
  }

  function toManifest(project) {
    var scenario = project && project.brief && project.brief.scenario === 'product' ? 'product' : 'presenter';
    var stylePack = getStylePack(project && project.brief && project.brief.stylePack || (scenario === 'product' ? '03-A' : '01-A'));
    var vTheme = getVisualTheme(project && project.brief && project.brief.visualTheme || 'professional');
    var musicId = project && project.brief && project.brief.music || 'none';
    var width = 1920, height = 1080, fps = 30, inset = 24;
    var clips = [], narration = [], captions = [], cursor = 0;
    var scenes = (project && Array.isArray(project.scenes)) ? project.scenes : [];
    var hasCaptions = scenes.some(function (sc) {
      return sc.artifacts && sc.artifacts.voice && Array.isArray(sc.artifacts.voice.cues) && sc.artifacts.voice.cues.length > 0;
    });
    var captionBand = hasCaptions ? Math.max(64, Math.ceil(height * 0.1)) : 0;

    scenes.forEach(function (scene, idx) {
      var voice = scene.artifacts && scene.artifacts.voice;
      var image = scene.artifacts && scene.artifacts.image;
      var clipArtifact = scene.artifacts && scene.artifacts.clip;
      var rawDuration = voice && Number.isFinite(voice.duration) ? voice.duration : Math.max(3, String(scene.narration || '').length / 5 + 1);
      var duration = Math.ceil(rawDuration * fps) / fps;
      var mode = clipArtifact ? 'play' : 'image';
      var source = clipArtifact ? ('cache/' + clipArtifact.file) : image ? ('cache/' + image.file) : ('assets/scene-' + String(idx + 1).padStart(2, '0') + '.png');
      var srcW = image && image.width || 1536, srcH = image && image.height || 864;
      var bounds = containBounds(srcW, srcH, { width: width, height: height, inset: inset, captionBand: captionBand });
      clips.push({
        id: scene.id,
        title: scene.title,
        mode: mode,
        source: source,
        in: 0,
        duration: duration,
        bounds: bounds
      });
      if (voice) {
        narration.push({
          sceneId: scene.id,
          source: 'cache/' + voice.file,
          at: Number(cursor.toFixed(3)),
          duration: voice.duration,
          sha256: voice.sha256 || null
        });
        (voice.cues || []).forEach(function (cue) {
          captions.push({
            sceneId: scene.id,
            text: cue.text,
            start: Number((cursor + cue.start).toFixed(3)),
            end: Number((cursor + cue.start + cue.duration).toFixed(3))
          });
        });
      }
      cursor += duration;
    });

    return {
      schema: 'video-generator-bridge/v0.2',
      version: 1,
      name: (project && project.source && project.source.title) || 'Study Room Video',
      scenario: scenario,
      visualTheme: vTheme.id,
      stylePack: {
        id: stylePack.id,
        title: stylePack.title[0],
        selection: stylePack.selection,
        portraitSelection: stylePack.portraitSelection,
        status: stylePack.status
      },
      upstream: upstreamInfo,
      width: width,
      height: height,
      fps: fps,
      inset: inset,
      background: vTheme.palette.background,
      output: 'deliverables/' + ((project && project.source && project.source.slug) || 'video') + '-v1.mp4',
      duration: Number(cursor.toFixed(3)),
      frames: Math.round(cursor * fps),
      clips: clips,
      narration: narration,
      captions: captions,
      music: musicId && musicId !== 'none' ? {
        mode: 'local-synthesized-' + musicId,
        style: musicId,
        gain: 0.55,
        sidechainDucking: true
      } : null
    };
  }

  function cleanSpoken(raw, max) {
    var text = String(raw || '')
      .replace(/<\/?[a-z][a-z0-9-]*(?:\s[^<>]*)?>/gi, ' ')
      .replace(/<\s*\/?\s*(?:code|strong|em|span|b|i|a|p|div|br|ul|ol|li|pre|sub|sup)\b>?/gi, ' ')
      .replace(/:::?[a-z-]+(?:\s*\{[^}]*\})?/gi, ' ')
      .replace(/\|\|/g, ' · ')
      .replace(/\[\d+\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*#`_~>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return '';
    if (max && text.length > max) text = text.slice(0, max).replace(/[，,、；;：:\s]+$/, '');
    if (!/[。！？；]$/.test(text)) text = text.replace(/[.!?]+$/, '') + '。';
    var clauses = text.match(/[^。！？；]+[。！？；]?/g) || [text];
    var safe = [];
    clauses.forEach(function (clause) {
      var remain = clause.trim();
      while (remain.length > 56) {
        var cut = -1, seps = ['，', ',', '：', ':', '、', '—', ' '], k;
        for (k = 0; k < seps.length; k++) {
          var pos = remain.lastIndexOf(seps[k], 52);
          if (pos >= 16 && pos > cut) cut = pos;
        }
        if (cut < 16) cut = 48;
        var head = remain.slice(0, cut).replace(/[，,、；;：:\s]+$/, '') + '。';
        safe.push(head);
        remain = remain.slice(cut).replace(/^[，,、；;：:\s—]+/, '');
      }
      if (remain) {
        if (!/[。！？；]$/.test(remain)) remain += '。';
        safe.push(remain);
      }
    });
    return safe.join('');
  }

  function cleanTitle(raw, fallback) {
    var s = String(raw || '').split('||')[0]
      .replace(/:::?[a-z-]+(?:\s*\{[^}]*\})?/gi, ' ')
      .replace(/#[a-z0-9_-]+/gi, ' ')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/^(?:\d+[\.\s、/-]*)+/, '')
      .replace(/[*`_~>]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[。！？：:;；,，、·—-]+$/, '')
      .trim();
    return (s || fallback || '核心要点').slice(0, 32);
  }

  function buildAutoDraftFromSource(source, options) {
    var opts = options || {};
    var scenario = opts.scenario === 'product' ? 'product' : 'presenter';
    var vTheme = getVisualTheme(opts.visualTheme || 'professional');
    var packId = opts.stylePack || vTheme.defaultPack || (scenario === 'product' ? '03-A' : '01-A');
    var pack = getStylePack(packId);
    var title = cleanTitle(source && source.title, '核心研究与方案拆解');
    var anchors = (source && Array.isArray(source.anchors) && source.anchors.length) ? source.anchors : ['overview'];
    var rawLines = String(source && source.text || '').split(/\n+/).map(function (line) {
      return line.split('||')[0].replace(/:::?[a-z-]+(?:\s*\{[^}]*\})?/gi, ' ').replace(/#[a-z0-9_-]+/gi, ' ').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
    }).filter(function (line) {
      return line.length >= 6 && !/^(←|Study Room|Knowledge Hub|目录|参考|References|下载|阅读核心|点击|切换|--[a-z])/i.test(line) && line !== title;
    });
    var customSections = Array.isArray(opts.sections) && opts.sections.length ? opts.sections :
      (source && Array.isArray(source.sections) && source.sections.length ? source.sections : null);
    var blocks = [];
    var scenes = [];
    var idx;

    if (customSections) {
      blocks = customSections.slice(0, 6);
    } else {
      var chunkSize = Math.max(2, Math.ceil(rawLines.length / 5));
      for (idx = 0; idx < rawLines.length && blocks.length < 5; idx += chunkSize) {
        var slice = rawLines.slice(idx, idx + chunkSize);
        var heading = cleanTitle(slice[0], '核心要点 ' + (blocks.length + 1));
        var body = slice.slice(1).join('。') || slice[0];
        var anchor = anchors[Math.min(blocks.length, anchors.length - 1)];
        blocks.push({ id: anchor, title: heading, body: body, hasCompare: /对比|vs|传统|方案|区别/i.test(body), hasSteps: /步骤|阶段|流程|第一|1\./.test(body), hasMetric: /\d+(?:\.\d+)?\s*(%|倍|ms|秒|天|类|项|个)/.test(body) });
      }
    }

    if (!blocks.length) {
      blocks.push({ id: anchors[0], title: title.slice(0, 28), body: title + '的核心机制、关键指标与落地路径。', hasMetric: true });
    }

    var leadSummary = cleanSpoken(opts.lead || (blocks[0] && blocks[0].body) || title, 180);
    var heroNarration = cleanSpoken('本视频围绕「' + title + '」展开核心拆解。' + leadSummary, 240);
    var heroScreen = title.slice(0, 42);
    var heroScene = {
      id: 'auto-hero', title: '开场导览：' + title.slice(0, 22), narration: heroNarration, visual: '', screenText: heroScreen,
      camera: 'push', anchors: [anchors[0]], intent: '通过 TPL.hero 开场大标题与流体渐变视觉快速建立核心命题。', cinematography: '大字标题砸入配合副标题递进，聚焦核心价值。'
    };
    heroScene.composition = buildTemplateComposition('hero', heroScene, pack.id, vTheme.id);
    scenes.push(heroScene);

    blocks.slice(0, 4).forEach(function (blk, i) {
      var preset = blk.preset || (blk.hasCompare ? 'compare' : blk.hasSteps ? 'steps' : blk.hasMetric ? 'number' : (scenario === 'product' && i === 1 ? 'demo' : 'point'));
      var rawTitle = cleanTitle(blk.title, '核心要点 ' + (i + 1)), spoken = cleanSpoken(blk.narration || blk.body || rawTitle, 260);
      var screen = String(blk.screenText || rawTitle).slice(0, 56), validAnchor = anchors.indexOf(blk.id) >= 0 ? blk.id : anchors[Math.min(i, anchors.length - 1)];
      var sc = {
        id: 'auto-sec-' + (i + 1), title: rawTitle, narration: spoken, visual: '', screenText: screen, camera: i % 2 === 0 ? 'push' : 'static',
        anchors: [validAnchor], intent: '结合 ' + preset + ' 场景编舞提炼章节「' + rawTitle + '」的关键论据。', cinematography: '采用 ' + vTheme.name[0] + ' 视觉风格与 Adu ' + pack.id + ' 色板动态推进。'
      };
      sc.composition = buildTemplateComposition(preset, sc, pack.id, vTheme.id);
      scenes.push(sc);
    });

    var outroNarration = cleanSpoken('以上是「' + title + '」的核心脉络与关键证据。你可以直接在右侧检视器微调每段口播文案、切换视觉与配乐风格，或一键合成导出成片。', 220);
    var outroScene = {
      id: 'auto-outro', title: '总结与行动指引', narration: outroNarration, visual: '', screenText: '核心要点复盘 · 深入阅读原文',
      camera: 'pull', anchors: [anchors[anchors.length - 1]], intent: '通过 TPL.outro 终端总结收束全片，引导观众核验细节并阅读原文。', cinematography: '深色终端命令框逐项汇聚核心结论。'
    };
    outroScene.composition = buildTemplateComposition('outro', outroScene, pack.id, vTheme.id);
    scenes.push(outroScene);

    return {
      creativeDirection: '基于当前文章章节结构、' + vTheme.name[0] + ' 视觉风格与 Video-Generator (' + pack.id + ' · ' + pack.selection + ') 自动生成的口播与分镜初稿：开场（TPL.hero）→ 章节核心论据（TPL.point / number / compare / steps）→ 片尾总结（TPL.outro）。可直接逐镜微调口播台词或调用 Copilot 深度润色。',
      scenes: scenes
    };
  }

  return {
    upstreamInfo: upstreamInfo, visualThemes: visualThemes, briefTemplates: briefTemplates, scenarios: scenarios, stylePacks: stylePacks, scenePresets: scenePresets,
    getStylePack: getStylePack, getVisualTheme: getVisualTheme, getScenario: getScenario, cleanTitle: cleanTitle, cleanSpoken: cleanSpoken,
    detectScenePreset: detectScenePreset, applyVisualThemeToScenes: applyVisualThemeToScenes, buildTemplateComposition: buildTemplateComposition,
    buildAutoDraftFromSource: buildAutoDraftFromSource, containBounds: containBounds, toManifest: toManifest
  };
}));

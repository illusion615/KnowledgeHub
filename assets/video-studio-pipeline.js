(function (root) {
  'use strict';

  function createPipeline(ctx) {
    var briefTemplates = root.KHVideoGenerator ? root.KHVideoGenerator.briefTemplates : [];
    var visualThemes = root.KHVideoGenerator && root.KHVideoGenerator.visualThemes ? root.KHVideoGenerator.visualThemes : [];
    var bgmStyles = root.KHVideoBgm && root.KHVideoBgm.bgmStyles ? root.KHVideoBgm.bgmStyles : [];
    function t(zh, en) { return ctx.t(zh, en); }
    function esc(value) { return ctx.esc(value); }

    function button(label, action, scene, primary, disabled) {
      return '<button type="button" data-action="' + action + '"' + (scene ? ' data-scene="' + esc(scene) + '"' : '') +
        (primary ? ' class="studio-primary"' : '') + (disabled ? ' disabled' : '') + '>' + esc(label) + '</button>';
    }
    function field(label, key, value, area, max) {
      return '<label><span>' + esc(label) + '</span><' + (area ? 'textarea' : 'input') + ' data-field="' + key + '"' +
        (max ? ' maxlength="' + max + '"' : '') + (area ? '>' + esc(value) + '</textarea>' : ' value="' + esc(value) + '">') + '</label>';
    }
    function select(label, key, value, options) {
      return '<label><span>' + esc(label) + '</span><select data-field="' + key + '">' + options.map(function (entry) {
        return '<option value="' + esc(entry[0]) + '"' + (entry[0] === value ? ' selected' : '') + '>' + esc(entry[1]) + '</option>';
      }).join('') + '</select></label>';
    }
    function cleanDisplayTitle(raw) {
      return String(raw || '').split('||')[0]
        .replace(/:::?[a-z-]+(?:\s*\{[^}]*\})?/gi, ' ')
        .replace(/#[a-z0-9_-]+/gi, ' ')
        .replace(/^(?:\d+[\.\s、/-]*)+/, '')
        .replace(/\s+/g, ' ').trim() || String(raw || '');
    }
    function shotHeading(scene, index) { return '<h3>' + (index + 1) + '. ' + esc(cleanDisplayTitle(scene.title)) + '</h3>'; }

    function computeState() {
      var project = ctx.getProject();
      var vg = root.KHVideoGenerator;
      var bgm = root.KHVideoBgm;
      if (!project) return { nodes: [], activeJob: null, allDone: false, percent: null, quickScenario: 'presenter', quickSeconds: 180, packLabel: '01-A', visualTheme: 'professional', musicStyle: 'ambient-tech', musicEnabled: true };
      var scenes = project.scenes || [], total = scenes.length, jobs = project.jobs || [];
      var activeJob = jobs.find(function (job) { return job.status === 'queued' || job.status === 'running'; }) || null;
      var planRunning = !!(activeJob && activeJob.kind === 'plan');
      var directRunning = !!(activeJob && activeJob.kind === 'direct');
      var voiceCount = scenes.filter(function (s) { return !!(s.artifacts && s.artifacts.voice); }).length;
      var clipCount = scenes.filter(function (s) { return !!(s.artifacts && s.artifacts.clip); }).length;
      var imageScenes = scenes.filter(function (s) { return s.imageRequired !== false; });
      var imageReadyCount = imageScenes.filter(function (s) { return !!(s.artifacts && s.artifacts.image); }).length;
      var composedCount = scenes.filter(function (s) { return !!s.composition; }).length;
      var packId = (project.brief && project.brief.stylePack) || '01-A';
      var pack = vg && vg.getStylePack ? vg.getStylePack(packId) : null;
      var packTitle = pack ? t(pack.title[0], pack.title[1]) : packId;
      var visualTheme = (project.brief && project.brief.visualTheme) || 'professional';
      var vThemeObj = vg && vg.getVisualTheme ? vg.getVisualTheme(visualTheme) : null;
      var vThemeLabel = vThemeObj ? t(vThemeObj.name[0], vThemeObj.name[1]) : visualTheme;
      var rawMusic = (project.brief && project.brief.music) || 'ambient-tech';
      var normMusic = bgm && bgm.normalizeStyle ? bgm.normalizeStyle(rawMusic) : (rawMusic === 'none' ? 'none' : 'ambient-tech');
      var musicEnabled = normMusic !== 'none';
      var scenarioId = (project.brief && project.brief.scenario) || 'presenter';
      var exported = !!project.currentExport;
      var prog = activeJob && activeJob.progress;
      var progKind = prog && prog.kind;
      var percent = prog && prog.total ? Math.round(prog.completed / prog.total * 100) : null;
      var step1Running = planRunning;
      var step2Running = directRunning || (activeJob && (activeJob.kind === 'image' || (activeJob.kind === 'assets' && (!progKind || progKind === 'image')) || (activeJob.kind === 'produce' && progKind === 'image')));
      var step3Running = activeJob && (activeJob.kind === 'voice' || (activeJob.kind === 'assets' && progKind === 'voice') || (activeJob.kind === 'produce' && progKind === 'voice'));
      var step4Running = activeJob && (activeJob.kind === 'clip' || activeJob.kind === 'clips' || activeJob.kind === 'export' || (activeJob.kind === 'produce' && (progKind === 'clip' || progKind === 'export')));
      var step1Ready = total > 0 && !step1Running;
      var step2Ready = total > 0 && (imageScenes.length === 0 ? composedCount === total : imageReadyCount === imageScenes.length) && !step2Running;
      var step3Ready = total > 0 && voiceCount === total && !step3Running;
      var step4Ready = exported && !step4Running;

      var nodes = [
        { step: 1, icon: step1Running ? '◐' : step1Ready ? '✓' : '○', title: t('1.脚本', '1.Script'), state: step1Running ? 'running' : step1Ready ? 'done' : 'pending',
          badge: '',
          detail: total > 0 ? t(total + ' 镜口播 · ' + vThemeLabel, total + ' scenes · ' + vThemeLabel) : t('点击一键生成提取分镜 · ' + vThemeLabel, 'One-click to extract scenes · ' + vThemeLabel) },
        { step: 2, icon: step2Running ? '◐' : step2Ready ? '✓' : '○', title: t('2.画面', '2.Visual'), state: step2Running ? 'running' : step2Ready ? 'done' : 'pending',
          badge: total > 0 && !step2Ready ? composedCount + '/' + total : '',
          detail: total === 0 ? t('流体渐变与生命感粒子待装载', 'Gradient & living motion ready') : imageScenes.length === 0 ? t('流体渐变 + 9 类编舞 (' + composedCount + '/' + total + ' 镜)', 'Fluid gradient + choreography (' + composedCount + '/' + total + ')') : t('插图与画面就绪 (' + imageReadyCount + '/' + imageScenes.length + ' 镜)', 'Artwork ready (' + imageReadyCount + '/' + imageScenes.length + ')') },
        { step: 3, icon: step3Running ? '◐' : step3Ready ? '✓' : '○', title: t('3.配音', '3.Voice'), state: step3Running ? 'running' : step3Ready ? 'done' : 'pending',
          badge: total > 0 ? (voiceCount + '/' + total) : '',
          detail: total > 0 && voiceCount === total ? t('配音已就绪 · ' + (musicEnabled ? '含动态代码配乐' : '纯人声无配乐'), 'Voice ready · ' + (musicEnabled ? 'Synth BGM ON' : 'Voice only')) : t('已合成 ' + voiceCount + '/' + (total || 6) + ' 镜配音 · ' + (musicEnabled ? '配乐开启' : '配乐关闭'), 'Voice ' + voiceCount + '/' + (total || 6) + ' · ' + (musicEnabled ? 'BGM ON' : 'BGM OFF')) },
        { step: 4, icon: step4Running ? '◐' : step4Ready ? '✓' : '○', title: t('4.成片', '4.Export'), state: step4Running ? 'running' : step4Ready ? 'done' : 'pending',
          badge: step4Ready ? 'MP4' : (clipCount > 0 ? (clipCount + '/' + total) : ''),
          detail: step4Ready ? t('MP4 整片已合成完毕 · 可直接在线播放或下载', 'Full MP4 film assembled · play or download now') : clipCount > 0 ? t('已渲染 ' + clipCount + '/' + total + ' 镜 · 待合成整片 MP4', 'Rendered ' + clipCount + '/' + total + ' clips · pending MP4 export') : t('待渲染动态镜头并混音合成 MP4', 'Pending scene render and MP4 audio mix') }
      ];

      return { nodes: nodes, activeJob: activeJob, allDone: step4Ready, percent: percent, quickScenario: scenarioId, quickSeconds: (project.brief && project.brief.seconds) || 180, packLabel: packTitle, visualTheme: visualTheme, musicStyle: normMusic === 'none' ? 'ambient-tech' : normMusic, musicEnabled: musicEnabled };
    }

    function renderStepper(currentStep) {
      var st = computeState();
      if (!st.nodes.length) return '';
      var stepsHtml = st.nodes.map(function (node, idx) {
        var isCurrent = currentStep === node.step;
        var arrow = idx < st.nodes.length - 1 ? '<span class="studio-step-arrow" aria-hidden="true">➔</span>' : '';
        return '<button type="button" class="studio-step-card" data-step="' + node.step + '" data-status="' + esc(node.state) + '"' +
          (isCurrent ? ' aria-current="step"' : '') + ' title="' + esc(node.detail) + '">' +
          '<span class="studio-step-icon" aria-hidden="true">' + esc(node.icon) + '</span>' +
          '<span class="studio-step-title">' + esc(node.title) + '</span>' +
          (node.badge ? '<span class="studio-step-badge" data-badge-state="' + esc(node.state) + '">' + esc(node.badge) + '</span>' : '') +
          '<span class="studio-visually-hidden">' + esc(node.step + ' · ' + ctx.stepNames[idx][ctx.lang() === 'en' ? 1 : 0]) + '</span></button>' + arrow;
      }).join('');
      var bannerState = st.activeJob ? 'running' : st.allDone ? 'done' : 'pending';
      var lineStyle = st.activeJob ? (' style="--studio-progress:' + (st.percent !== null ? st.percent : 18) + '%"') : '';
      return '<div class="studio-pipeline-bar" data-pipeline-state="' + bannerState + '"' + lineStyle + '>' +
        '<div class="studio-pipeline-nodes" role="list">' + stepsHtml + '</div></div>';
    }

    function renderHeaderCta(busy) {
      var project = ctx.getProject();
      if (!project) return '';
      var st = computeState(), dirty = ctx.isDirty(), exported = project.currentExport;
      if (st.activeJob) {
        var pct = st.percent !== null ? st.percent + '%' : '…';
        var fillPct = st.percent !== null ? st.percent : 18;
        return '<button type="button" class="studio-primary studio-oneclick-btn is-running" data-action="cancel" data-scene="' + esc(st.activeJob.id) + '" style="--studio-btn-fill:' + fillPct + '%" title="' + esc(st.activeJob.message || '') + '">' +
          '<span>' + esc(t('⏳ 生成中 ' + pct + ' · 点击取消', '⏳ Generating ' + pct + ' · Cancel')) + '</span></button>';
      }
      var primaryLabel = exported && !dirty ? t('⚡ 重新生成视频', '⚡ Rebuild Video') :
        dirty ? t('⚡ 保存并一键生成', '⚡ Save & Generate') : t('⚡ 一键生成视频', '⚡ Generate Video');
      return (exported ? '<button type="button" class="studio-success-btn" data-action="download" data-scene="' + esc(exported.key) + '">' + t('⬇ 下载 MP4', '⬇ MP4') + '</button>' : '') +
        '<button type="button" class="studio-primary studio-oneclick-btn" data-action="one-click-produce"' + (busy ? ' disabled' : '') + '>' + esc(primaryLabel) + '</button>';
    }

    function renderOneClickHero(busy, extraToolbarHtml) {
      var project = ctx.getProject();
      if (!project) return '';
      var st = computeState(), scenario = st.quickScenario;
      var isShort = (Number(st.quickSeconds) || 180) <= 90, exported = project.currentExport;

      var visualPills = visualThemes.map(function (vt) {
        return '<button type="button" class="studio-pill" data-action="quick-visual-theme" data-visual-theme="' + esc(vt.id) + '" aria-pressed="' + String(st.visualTheme === vt.id) + '"' + (busy ? ' disabled' : '') + ' title="' + esc(t(vt.summary[0], vt.summary[1])) + '">' + esc(t(vt.shortName[0], vt.shortName[1])) + '</button>';
      }).join('');

      var bgmOptions = bgmStyles.map(function (bs) {
        return '<option value="' + esc(bs.id) + '"' + (st.musicStyle === bs.id ? ' selected' : '') + '>' + esc(t(bs.name[0], bs.name[1])) + '</option>';
      }).join('');

      return '<section class="studio-oneclick-bar" aria-label="' + t('视频风格与配乐快速切换栏', 'Quick Style & BGM Bar') + '">' +
        '<div class="studio-oneclick-main">' +
        '<div class="studio-oneclick-pills" role="group" aria-label="' + t('视觉风格、背景音乐与模式选择', 'Visual Theme, BGM & Mode Controls') + '">' +
        '<div class="studio-pill-group"><span class="studio-pill-label">' + t('风格', 'Style') + '</span>' + visualPills + '</div>' +
        '<div class="studio-pill-group studio-bgm-group"><span class="studio-pill-label">' + t('配乐', 'BGM') + '</span>' +
        '<button type="button" class="studio-pill studio-bgm-toggle" data-action="quick-bgm-toggle" aria-pressed="' + String(st.musicEnabled) + '"' + (busy ? ' disabled' : '') + '>' +
        (st.musicEnabled ? t('🎵 开启', '🎵 ON') : t('🔇 静音', '🔇 OFF')) + '</button>' +
        '<select class="studio-bgm-select" data-action="quick-bgm-style" aria-label="' + t('选择动态合成背景音乐风格', 'Select Procedural BGM Style') + '"' + (busy || !st.musicEnabled ? ' disabled' : '') + '>' + bgmOptions + '</select></div>' +
        '<div class="studio-pill-group"><span class="studio-pill-label">' + t('模式', 'Mode') + '</span>' +
        '<button type="button" class="studio-pill" data-action="quick-scenario" data-vg-scenario="presenter" aria-pressed="' + String(scenario !== 'product') + '"' + (busy ? ' disabled' : '') + '>' + t('🎙️ 口播', '🎙️ Talk') + '</button>' +
        '<button type="button" class="studio-pill" data-action="quick-scenario" data-vg-scenario="product" aria-pressed="' + String(scenario === 'product') + '"' + (busy ? ' disabled' : '') + '>' + t('💻 演示', '💻 Demo') + '</button>' +
        '<button type="button" class="studio-pill" data-action="quick-duration" data-seconds="60" aria-pressed="' + String(isShort) + '"' + (busy ? ' disabled' : '') + '>60s</button>' +
        '<button type="button" class="studio-pill" data-action="quick-duration" data-seconds="180" aria-pressed="' + String(!isShort) + '"' + (busy ? ' disabled' : '') + '>180s</button></div></div>' +
        '<div class="studio-oneclick-cta">' +
        (exported && ctx.getStep() !== 4 ? '<button type="button" data-action="view-export">' + t('🎬 播放成片', '🎬 Watch Film') + '</button>' : '') +
        (extraToolbarHtml || '') +
        '</div></div></section>';
    }

    function renderBriefStep(busy, matchesTemplate, vgBriefCatalogSection) {
      var project = ctx.getProject();
      var musicSelectOptions = [
        ['ambient-tech', t('知性科技 (Ambient Tech · 代码合成)', 'Ambient Tech (Procedural Synth)')],
        ['upbeat-pulse', t('轻快律动 (Upbeat Pulse · 代码合成)', 'Upbeat Pulse (Procedural Synth)')],
        ['dynamic-drive', t('动感节奏 (Dynamic Drive · 代码合成)', 'Dynamic Drive (Procedural Synth)')],
        ['elegant-minimal', t('优雅极简 (Elegant Minimal · 代码合成)', 'Elegant Minimal (Procedural Synth)')],
        ['none', t('无背景音乐 (No Music)', 'No Background Music')]
      ];
      var visualSelectOptions = visualThemes.map(function (vt) {
        return [vt.id, t(vt.name[0], vt.name[1])];
      });
      var currentMusic = project.brief.music === 'bright' ? 'upbeat-pulse' : (project.brief.music || 'ambient-tech');
      var currentVisual = project.brief.visualTheme || 'professional';

      return '<p class="studio-muted">' + t('系统已预置最佳口播、流体渐变视觉与动态合成配乐参数，无需填表即可点击右上角「⚡ 一键生成视频」直接出片。', 'Optimal defaults are pre-configured—click "⚡ Generate Video" at top-right to produce immediately.') + '</p>' +
        '<section class="studio-templates" aria-label="' + t('视频需求模板', 'Video Brief Templates') + '"><h3>' +
        t('快捷场景模板（一键切换）', 'Quick Brief Templates') + '</h3><div class="studio-grid">' +
        briefTemplates.map(function (template) {
          return '<button type="button" class="studio-template" data-action="template" data-template="' + template.id +
            '" aria-pressed="' + String(matchesTemplate(project.brief, template)) + '"' + (busy ? ' disabled' : '') + '><strong>' +
            esc(t(template.name[0], template.name[1])) + '</strong><small>' +
            esc(t(template.description[0], template.description[1])) + '</small></button>';
        }).join('') + '</div>' + vgBriefCatalogSection(busy) + '</section>' +
        '<div class="studio-grid">' + field(t('目标时长（秒，30–600）', 'Target Duration (Seconds, 30–600)'), 'seconds', project.brief.seconds) +
        field(t('语速（150–300）', 'Voice Rate (150–300)'), 'voiceRate', project.brief.voiceRate) +
        select(t('本机 / 官方 TTS 声音', 'Local / Volcengine Voice'), 'voice', project.brief.voice, [
          ['Yue (Premium)', '月 / Yue Premium (macOS)'],
          ['Lili (Premium)', '莉莉 / Lili Premium (macOS)'],
          ['Tingting', '婷婷 / Tingting (macOS)'],
          ['zh_female_cancan_uranus_bigtts', t('灿灿 · 字节 Seed-TTS 2.0', 'Cancan · Volcengine Seed-TTS 2.0')],
          ['zh_male_chunhou_uranus_bigtts', t('醇厚 · 字节 Seed-TTS 2.0', 'Chunhou · Volcengine Seed-TTS 2.0')]
        ]) +
        select(t('代码动态合成背景音乐', 'Procedural Synthesized BGM'), 'music', currentMusic, musicSelectOptions) +
        select(t('整体视觉美学风格', 'Visual Aesthetic Style'), 'visualTheme', currentVisual, visualSelectOptions) + '</div>' +
        '<details class="studio-brief-advanced"><summary>' + t('⚙️ 高级受众、叙事目标与自定义创意指令（可选）', '⚙️ Advanced Audience, Goal & Custom Creative Prompt (Optional)') + '</summary>' +
        field(t('你的创意想法', 'Your Creative Idea'), 'idea', project.brief.idea || '', true, 4000) +
        field(t('目标受众', 'Audience'), 'audience', project.brief.audience, false, 300) +
        field(t('希望观众理解或采取什么行动', 'Viewer Goal'), 'goal', project.brief.goal, true, 500) +
        field(t('视觉与叙事方向', 'Visual and Narrative Direction'), 'style', project.brief.style, true, 1200) + '</details>' +
        '<details><summary>' + t('查看发送给 Copilot 的全文来源', 'Inspect Full Article Context') + '</summary><pre>' + esc(project.source.text) + '</pre></details>';
    }

    function renderSceneEditor(scene, index, busy, vgScenePresetSection) {
      var project = ctx.getProject(), dirty = ctx.isDirty();
      var artifacts = scene.artifacts || {}, voice = artifacts.voice;
      var legacy = project.legacyComposition ? '<div class="studio-warning" data-legacy-upgrade>' +
        t('项目含旧版图片式分镜。', 'This project includes legacy image-based scenes. ') +
        button(t('更新分镜设计', 'Update Scene Design'), 'direct', null, false, busy || dirty) +
        '<small>' + t('保留旁白和已有素材；如需重写故事，使用上方“重新生成分镜”。', 'Keeps narration and existing assets. To rewrite the story, use Regenerate Storyboard above.') + '</small></div>' : '';
      return '<div class="studio-gallery-editor" aria-label="' + t('镜头检视器', 'Scene Inspector') + '"><header class="studio-panel-heading"><strong>' +
        t('镜头口播与编舞', 'Scene Inspector') + '</strong><span>' + (index + 1) + ' / ' + project.scenes.length + '</span></header>' +
        '<div class="studio-inspector-content">' + legacy + shotHeading(scene, index) +
        field(t('讲解文案（口播台词）', 'Narration Script'), 'narration', scene.narration, true, 1600) +
        field(t('画面主文案（可留空）', 'On-Screen Headline'), 'screenText', scene.screenText, false, 160) +
        field(t('镜头标题', 'Scene Title'), 'title', cleanDisplayTitle(scene.title), false, 100) +
        (voice ? '<audio controls class="studio-gallery-audio" data-media="' + voice.key + '"></audio>' : '') +
        vgScenePresetSection(busy) +
        '<details class="studio-visual-adjustment"><summary>' + t('🎨 让 AI 调整画面与图层文字', '🎨 Ask AI to Adjust Visuals & Layers') + '</summary>' +
        (scene.intent || scene.cinematography ? '<p class="studio-muted">' + esc(scene.intent || '') + ' ' + esc(scene.cinematography || '') + '</p>' : '') +
        (scene.composition ? root.KHVideoComposition.nodes(scene.composition).map(function (layer, layerIndex) {
          return layer.type === 'text' && !layer.bind ? '<label><span>' + t('图层文字 ', 'Layer Text ') + (layerIndex + 1) +
            '</span><textarea data-layer-text="' + layerIndex + '" maxlength="500">' + esc(layer.text) + '</textarea></label>' : '';
        }).join('') : select(t('运镜', 'Camera'), 'camera', scene.camera, [['push', 'Push'], ['pull', 'Pull'], ['pan-left', 'Pan Left'], ['pan-right', 'Pan Right'], ['static', 'Static']])) +
        '<label><span>' + t('描述你希望怎么改画面；保留旁白和已有素材。', 'Describe the visual changes you want; narration and existing assets are retained.') +
        '</span><textarea data-director-note maxlength="2000">' + esc(localStorage.getItem('kh-video-direction-' + project.id) || '') + '</textarea></label>' +
        button(t('按要求调整画面', 'Apply Visual Changes'), 'direct', null, false, busy || dirty) + '</details>' +
        '<details class="studio-advanced-tools"><summary>' + t('高级工具（单镜修补与排序）', 'Advanced Scene Tools') + '</summary>' +
        button(project.planApproved && !dirty ? t('方案已确认', 'Storyboard Approved') : t('仅确认方案', 'Approve Storyboard Only'),
          'approve-plan', null, false, busy || dirty || project.planApproved) +
        '<h4>' + t('当前镜头素材', 'Current Scene Assets') + '</h4><div class="studio-actions">' +
        (scene.imageRequired === false ? '<span class="studio-muted">' + t('纯文字 / 图形镜头，无需生图。', 'Typography / graphics scene; no generated image needed.') + '</span>' :
          button(t('生成 / 复用图片', 'Generate / Reuse Image'), 'image', scene.id, false, busy || dirty || !project.planApproved)) +
        button(t('生成 / 复用配音', 'Generate / Reuse Voice'), 'voice', scene.id, false, busy || dirty || !project.planApproved) + '</div>' +
        '<details><summary>' + t('素材与依据', 'Assets and Sources') + '</summary>' +
        (scene.imageRequired === false ? '<p>' + t('此镜头原生绘制文字与图形，不依赖图片素材。', 'This scene draws text and graphics natively; no image asset is needed.') + '</p>' :
          field(t('图像素材提示词', 'Image Asset Prompt'), 'visual', scene.visual, true, 4000)) +
        field(t('依据章节（逗号分隔）', 'Source Anchors (Comma-separated)'), 'anchors', scene.anchors.join(', ')) + '</details>' +
        '<h4>' + t('全片素材维护', 'Film-wide Asset Maintenance') + '</h4><div class="studio-actions">' +
        button(t('补齐全片素材', 'Fill Missing Assets'), 'batch-assets', null, false, busy || dirty || !project.planApproved) +
        button(t('仅补齐图片', 'Images Only'), 'batch-images', null, false, busy || dirty || !project.planApproved ||
          !project.scenes.some(function (item) { return item.imageRequired !== false; })) +
        button(t('仅补齐配音', 'Voices Only'), 'batch-voices', null, false, busy || dirty || !project.planApproved) + '</div>' +
        '<h4>' + t('镜头顺序管理', 'Scene Order') + '</h4><div class="studio-actions">' +
        button(t('前移', 'Move Up'), 'up', scene.id, false, busy || index === 0) +
        button(t('后移', 'Move Down'), 'down', scene.id, false, busy || index === project.scenes.length - 1) +
        button(t('删除镜头', 'Remove Scene'), 'remove', scene.id, false, busy || project.scenes.length < 2) +
        button(t('+ 新增镜头', '+ Add Scene'), 'add', null, false, busy || project.scenes.length >= 24) + '</div></details></div></div>';
    }

    return {
      button: button,
      field: field,
      select: select,
      cleanDisplayTitle: cleanDisplayTitle,
      shotHeading: shotHeading,
      computeState: computeState,
      renderStepper: renderStepper,
      renderHeaderCta: renderHeaderCta,
      renderOneClickHero: renderOneClickHero,
      renderBriefStep: renderBriefStep,
      renderSceneEditor: renderSceneEditor
    };
  }

  root.KHVideoStudioPipeline = { createPipeline: createPipeline };
}(typeof globalThis === 'object' ? globalThis : this));

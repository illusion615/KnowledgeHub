document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var project = null, step = 1, dirty = false, poll = null, pending = false;
  var language = localStorage.getItem('lang') || 'zh';
  var urls = {}, mediaRequests = {}, params = new URLSearchParams(location.search), article = params.get('article');
  var embedMode = params.get('embed') === '1', autoDraftParam = params.get('autoDraft') === '1', localOffline = false;
  var localMode = (location.protocol === 'http:' && (location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.hostname === '[::1]')) || location.origin === 'https://illusion615.github.io';
  var galleryId = null, customCompositionOverrides = {};
  var simulation = { playing: false, paused: false, loading: false, token: 0, elapsed: 0, duration: 0, started: 0, frame: null, audio: null };
  var stage = document.getElementById('studio-stage');
  var message = document.getElementById('studio-message');
  var workspace = document.getElementById('studio-workspace');
  var vg = window.KHVideoGenerator;
  var steps = [['需求确认', 'Brief'], ['镜头工作台', 'Scene Workbench'], ['镜头渲染', 'Scene Rendering'], ['整片导出', 'Export']];
  var kinds = { plan: ['生成分镜', 'Storyboard'], direct: ['AI重新设计画面', 'AI Visual Redesign'], produce: ['制作完整视频', 'Produce Full Video'], image: ['本地生图', 'Local image'], voice: ['本机配音', 'Local voice'], clip: ['镜头渲染', 'Scene render'], export: ['拼接导出', 'Export'], assets: ['批量准备素材', 'Batch Assets'], clips: ['渲染全部镜头', 'Render All Scenes'] };
  var briefTemplates = vg ? vg.briefTemplates : [];
  function t(zh, en) { return language === 'en' ? en : zh; }
  function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function say(value, error) { message.textContent = value; message.className = error ? 'studio-error' : ''; }
  function applyLanguage() {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(function (node) { node.textContent = node.getAttribute(language === 'en' ? 'data-en' : 'data-zh'); });
    document.getElementById('studio-lang').textContent = language === 'en' ? '中文' : 'EN';
  }
  function active() { return project && project.jobs.some(function (job) { return job.status === 'queued' || job.status === 'running'; }); }
  var client = window.KHVideoStudioClient.createStudioClient({
    stage: stage, localMode: localMode, t: t, esc: esc, say: say, active: active,
    isDirty: function () { return dirty; },
    isPending: function () { return pending; },
    getProject: function () { return project; },
    productionLabel: function () { return productionLabel(); },
    assetPreparationLabel: function () { return assetPreparationLabel(); }
  });
  var request = client.request, updateCopilotUI = client.updateUI, detectCopilot = client.detect;
  var playback = window.KHVideoStudioPlayback.createPlayback({
    stage: stage, simulation: simulation, urls: urls, mediaRequests: mediaRequests,
    t: t, esc: esc, say: say, request: request, active: active,
    isDirty: function () { return dirty; },
    getProject: function () { return project; },
    getGalleryId: function () { return galleryId; },
    setGalleryId: function (id) { galleryId = id; }
  });
  var media = playback.media, hydrate = playback.hydrate, pauseStageMedia = playback.pauseStageMedia;
  var galleryScene = playback.galleryScene, sceneDuration = playback.sceneDuration, timeLabel = playback.timeLabel;
  var paintComposition = playback.paintComposition, selectGallery = playback.selectGallery, syncSequence = playback.syncSequence;
  var simulationStatus = playback.simulationStatus, simulationControls = playback.simulationControls;
  var stopSimulation = playback.stopSimulation, playSimulation = playback.playSimulation, pauseSimulation = playback.pauseSimulation;
  var monitorVideo = playback.monitorVideo, vgBriefCatalogSection = playback.vgBriefCatalogSection, vgScenePresetSection = playback.vgScenePresetSection;
  var sceneBin = playback.sceneBin, sequence = playback.sequence;
  function monitorContent(scene) { return playback.monitorContent(scene, step); }
  function batchMeter(job) { return playback.batchMeter(job, kinds); }

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
  function value(key, parent) {
    var el = (parent || stage).querySelector('[data-field="' + key + '"]');
    return el ? el.value : '';
  }
  function collectScenes() {
    return Array.prototype.map.call(stage.querySelectorAll('[data-shot]'), function (node) {
      var id = node.getAttribute('data-shot');
      var saved = project.scenes.find(function (scene) { return scene.id === id; });
      var baseComp = customCompositionOverrides[id] || saved.composition;
      var composition = baseComp && JSON.parse(JSON.stringify(baseComp));
      if (composition) node.querySelectorAll('[data-layer-text]').forEach(function (field) {
        var targetLayer = window.KHVideoComposition.nodes(composition)[Number(field.getAttribute('data-layer-text'))];
        if (targetLayer) targetLayer.text = field.value;
      });
      return { id: id, title: value('title', node), narration: value('narration', node),
        visual: node.querySelector('[data-field="visual"]') ? value('visual', node) : saved.visual, screenText: value('screenText', node),
        camera: node.querySelector('[data-field="camera"]') ? value('camera', node) : saved.camera,
        composition: composition, imagePromptVersion: saved.imagePromptVersion, intent: saved.intent, cinematography: saved.cinematography,
        anchors: value('anchors', node).split(',').map(function (anchor) { return anchor.trim().replace(/^#/, ''); }).filter(Boolean) };
    });
  }
  function brief() {
    var out = { audience: value('audience'), goal: value('goal'), style: value('style'), seconds: Number(value('seconds')),
      voice: value('voice'), voiceRate: Number(value('voiceRate')), music: value('music'), idea: value('idea') };
    var scenarioVal = value('scenario') || (project && project.brief && project.brief.scenario);
    var packVal = value('stylePack') || (project && project.brief && project.brief.stylePack);
    if (scenarioVal) out.scenario = scenarioVal;
    if (packVal) out.stylePack = packVal;
    return out;
  }
  function matchesTemplate(current, template) {
    return ['audience', 'goal', 'style'].every(function (key) {
      return template[key].indexOf(current[key]) >= 0;
    }) && current.seconds === template.seconds && current.music === template.music;
  }
  function syncTemplates() {
    var current = brief();
    stage.querySelectorAll('[data-template]').forEach(function (node) {
      var template = briefTemplates.find(function (item) { return item.id === node.getAttribute('data-template'); });
      node.setAttribute('aria-pressed', String(matchesTemplate(current, template)));
    });
  }
  function applyTemplate(id) {
    var template = briefTemplates.find(function (item) { return item.id === id; });
    var current = brief(), isTemplate;
    if (!template) throw new Error(t('需求模板不存在。', 'Brief template not found.'));
    if (matchesTemplate(current, template)) return;
    isTemplate = briefTemplates.some(function (item) { return matchesTemplate(current, item); });
    if (!isTemplate && (dirty || project.revision > 1) && !window.confirm(t(
      '应用模板将替换当前受众、目标、视觉方向、时长和配乐，保留声音与语速。继续？',
      'Replace the current audience, goal, visual direction, duration and music? Your voice and speech rate will be preserved.'
    ))) return;
    ['audience', 'goal', 'style'].forEach(function (key) {
      stage.querySelector('[data-field="' + key + '"]').value = t(template[key][0], template[key][1]);
    });
    stage.querySelector('[data-field="seconds"]').value = template.seconds;
    stage.querySelector('[data-field="music"]').value = template.music;
    dirty = true;
    syncTemplates();
    say(t('已应用「', 'Applied “') + t(template.name[0], template.name[1]) +
      t('」。可继续修改；尚未保存，也未触发生成。', '”. You can edit it further. Nothing has been saved or generated.'));
  }
  function applyVGStylePack(packId) {
    var pack = vg && vg.getStylePack(packId), sf = stage.querySelector('[data-field="style"]'), pf = stage.querySelector('[data-field="stylePack"]'), scf = stage.querySelector('[data-field="scenario"]');
    if (!pack) return;
    if (pf) pf.value = pack.id;
    if (scf) scf.value = pack.scenario;
    if (sf) sf.value = pack.stylePrompt;
    stage.querySelectorAll('[data-vg-pack]').forEach(function (n) { n.setAttribute('aria-pressed', String(n.getAttribute('data-vg-pack') === pack.id)); });
    stage.querySelectorAll('[data-vg-scenario]').forEach(function (n) { n.setAttribute('aria-pressed', String(n.getAttribute('data-vg-scenario') === pack.scenario)); });
    dirty = true; syncTemplates();
    say(t('已切换至 Video-Generator 风格包「', 'Switched to Video-Generator style pack “') + t(pack.title[0], pack.title[1]) + t('」（' + pack.selection + '）。保存需求后生效。', '” (' + pack.selection + '). Save brief to persist.'));
  }
  function applyVGScenario(scenarioId) {
    var sc = vg && vg.getScenario(scenarioId), scf = stage.querySelector('[data-field="scenario"]');
    if (!sc) return;
    if (scf) scf.value = sc.id;
    stage.querySelectorAll('[data-vg-scenario]').forEach(function (n) { n.setAttribute('aria-pressed', String(n.getAttribute('data-vg-scenario') === sc.id)); });
    applyVGStylePack(sc.defaultStylePack);
  }
  function applyScenePreset(presetId) {
    var scene = galleryScene(), slide, draftScene, validated, presetInfo;
    if (!scene || !vg) return;
    slide = stage.querySelector('[data-gallery-slide="' + scene.id + '"]');
    draftScene = { id: scene.id, title: slide ? value('title', slide) : scene.title, narration: slide ? value('narration', slide) : scene.narration, screenText: slide ? value('screenText', slide) : scene.screenText, visual: scene.visual };
    validated = window.KHVideoComposition.validate(vg.buildTemplateComposition(presetId, draftScene, (project.brief && project.brief.stylePack) || '01-A'));
    customCompositionOverrides[scene.id] = validated; scene.composition = validated; dirty = true; paintComposition(scene, 0);
    presetInfo = vg.scenePresets.find(function (item) { return item.id === presetId; });
    say(t('已将当前镜头切换为「', 'Applied scene preset “') + (presetInfo ? t(presetInfo.name[0], presetInfo.name[1]) : presetId) + t('」编排，已在中央监看器实时更新；点击“保存修改”或“保存并制作视频”即可持久化。', '” in the live monitor. Save or produce to persist.'));
  }
  async function save(confirmBrief) {
    project = await request(project.id + '/draft', {
      revision: project.revision, brief: step === 1 ? brief() : project.brief,
      scenes: step === 2 ? collectScenes() : project.scenes, confirmBrief: confirmBrief === true
    });
    customCompositionOverrides = {};
    dirty = false;
    say(t('已保存。没有触发生成或渲染。', 'Saved. No generation or rendering was triggered.'));
  }
  async function navigate(next) {
    if (dirty && !window.confirm(t('还有未保存编辑。放弃这些编辑并切换步骤？', 'Discard unsaved edits and change steps?'))) return;
    project = await request(project.id + '/cursor', { step: [1, 2, 4, 5][next - 1] });
    customCompositionOverrides = {};
    dirty = false; step = next; render();
  }
  function restoredStep(cursor) {
    return cursor === 5 ? 4 : cursor === 4 ? 3 : cursor === 2 || cursor === 3 ? 2 : 1;
  }
  function jobs() {
    var node = document.getElementById('studio-jobs'), recent, batch, progress;
    if (!project) return;
    recent = project.jobs.slice(-8).reverse();
    node.innerHTML = recent.length ? recent.map(function (job) {
      var label = kinds[job.kind] || [job.kind, job.kind];
      return '<div class="studio-job"><strong>' + esc(t(label[0], label[1])) + (job.sceneId ? ' · ' + esc(job.sceneId) : '') +
        '</strong><small>' + esc(job.status + ' · ' + job.createdAt) + '</small><p>' + esc(job.message) + '</p>' +
        (job.kind === 'assets' || job.kind === 'clips' || job.kind === 'produce' ? batchMeter(job) : '') +
        (job.status === 'queued' || job.status === 'running' ? button(t('取消本步骤', 'Cancel Step'), 'cancel', job.id) : '') + '</div>';
    }).join('') : '<p class="studio-muted">' + t('还没有执行生成。', 'No generation has run.') + '</p>';
    batch = project.jobs.filter(function (job) { return job.kind === 'produce' || job.kind === (step === 3 ? 'clips' : 'assets'); }).slice(-1)[0];
    progress = document.getElementById('studio-batch-progress');
    if (progress) {
      progress.hidden = !batch;
      progress.innerHTML = batch ? batchMeter(batch) : '';
    }
    updateCopilotUI();
  }
  function shotHeading(scene, index) { return '<h3>' + (index + 1) + '. ' + esc(scene.title) + '</h3>'; }
  function productionLabel() {
    return dirty ? t('保存并制作视频', 'Save & Produce Video') :
      project.planApproved ? t('制作完整视频', 'Produce Full Video') : t('确认方案并制作视频', 'Confirm & Produce Video');
  }
  function assetPreparationLabel() {
    if (hasCurrentAssets()) return dirty ? t('保存并重新生成素材', 'Save & Regenerate Assets') : t('重新生成素材', 'Regenerate Assets');
    return dirty ? t('保存并生成素材', 'Save & Generate Assets') :
      project.planApproved ? t('生成素材', 'Generate Assets') : t('确认并生成素材', 'Confirm & Generate Assets');
  }
  function hasCurrentAssets() {
    return project.scenes.some(function (scene) {
      var artifacts = scene.artifacts || {};
      return !!artifacts.voice || (scene.imageRequired !== false && !!artifacts.image);
    });
  }
  function legacyUpgrade(busy) {
    if (!project.legacyComposition) return '';
    return '<div class="studio-warning" data-legacy-upgrade>' +
      t('项目含旧版图片式分镜。', 'This project includes legacy image-based scenes. ') +
      button(t('更新分镜设计', 'Update Scene Design'), 'direct', null, false, busy || dirty) +
      '<small>' + t('保留旁白和已有素材；如需重写故事，使用上方“重新生成分镜”。', 'Keeps narration and existing assets. To rewrite the story, use Regenerate Storyboard above.') + '</small></div>';
  }
  function batchControls(busy) {
    return '<h4>' + t('全片素材维护', 'Film-wide Asset Maintenance') + '</h4><div class="studio-actions">' +
      button(t('补齐全片素材', 'Fill Missing Assets'), 'batch-assets', null, false, busy || dirty || !project.planApproved) +
      button(t('补齐全片图片', 'Fill Missing Images'), 'batch-images', null, false, busy || dirty || !project.planApproved) +
      button(t('补齐全片配音', 'Fill Missing Voice'), 'batch-voices', null, false, busy || dirty || !project.planApproved) + '</div>';
  }
  function productionProgress() {
    var html = '<div id="studio-batch-progress" role="status" aria-live="polite" hidden></div>';
    project.jobs.filter(function (job) { return ['assets', 'produce'].indexOf(job.kind) >= 0 && ['queued', 'running'].indexOf(job.status) >= 0; }).forEach(function (job) {
      html += button(job.kind === 'produce' ? t('停止制作', 'Stop Production') : t('停止批量生成', 'Stop Batch'), 'cancel', job.id);
    });
    return html;
  }
  function inspectorPanel(content) {
    return '<aside class="studio-gallery-editor" aria-label="' + t('流程属性', 'Workflow Inspector') +
      '"><header class="studio-panel-heading"><strong>' + esc(t(steps[step - 1][0], steps[step - 1][1])) +
      '</strong><span>' + step + ' / 4</span></header><div class="studio-inspector-content">' + content + '</div></aside>';
  }
  function workflowToolbar(busy) {
    var html = '<div class="studio-workbench-header"><strong class="studio-workspace-phase">' + esc(t(steps[step - 1][0], steps[step - 1][1])) + '</strong>';
    var missing = project.scenes.some(function (scene) { return !scene.assetsReady; });
    if (step === 1) html += button(t('保存并确认需求 →', 'Save and Confirm Brief →'), 'brief', null, true, busy);
    if (step === 3) html += button(t('渲染全部镜头', 'Render All Scenes'), 'clips', null, true,
      busy || dirty || !project.planApproved || !project.scenes.length || missing) +
      button(t('返回镜头工作台', 'Back to Scene Workbench'), 'workbench') + button(t('整片导出 →', 'Export Film →'), 'next', null, false, busy);
    if (step === 4) {
      html += button(t('主动导出 / 复用整片', 'Export / Reuse Full Film'), 'export', null, true, busy || !project.canExport);
      if (project.currentExport) html += button(t('下载 MP4', 'Download MP4'), 'download', project.currentExport.key, true);
      html += button(t('导出 Video-Generator 清单', 'Export VG Manifest'), 'export-manifest', null, false, !project.scenes.length);
    }
    return html + '<div class="studio-actions studio-workbench-end">' + button(t('作业记录', 'Jobs'), 'toggle-jobs') + '</div></div>';
  }
  function gallery(busy, inspector) {
    var saved = galleryId || localStorage.getItem('kh-video-gallery-' + project.id);
    var selected = project.scenes.findIndex(function (scene) { return scene.id === saved; });
    var html;
    if (selected < 0) selected = 0;
    galleryId = project.scenes.length ? project.scenes[selected].id : null;
    html = '<section class="studio-gallery" aria-roledescription="' + t('视频编辑工作区', 'video editor') + '" aria-label="' + t('镜头工作台', 'Scene Workbench') + '">' +
      sceneBin() + '<div class="studio-gallery-transport"><div class="studio-monitor-heading"><strong>' +
      (step === 4 ? t('成片监看器', 'Film Monitor') : step === 3 ? t('渲染监看器', 'Render Monitor') : t('预演监看器', 'Preview Monitor')) +
      '</strong><span>16:9 · 1920 × 1080</span></div><div class="studio-transport-row"><div class="studio-gallery-nav">' +
      button(t('← 上一镜', '← Previous'), 'gallery-prev', null, false, !project.scenes.length || selected === 0) +
      '<strong id="studio-gallery-position">' + (project.scenes.length ? selected + 1 : 0) + ' / ' + project.scenes.length + '</strong>' +
      button(t('下一镜 →', 'Next →'), 'gallery-next', null, false, !project.scenes.length || selected === project.scenes.length - 1) + '</div>' +
      '<div class="studio-actions">' + button(t('播放预演', 'Play'), 'simulate-toggle', null, true, busy || dirty || !project.scenes.length) +
      button(t('停止', 'Stop'), 'simulate-stop', null, false, true) + '</div></div>' +
      '<div class="studio-simulation-timing" aria-live="off"><progress id="studio-simulation-progress" max="1" value="0" aria-label="' +
      t('当前镜头预演进度', 'Current Scene Simulation Progress') + '"></progress><span id="studio-simulation-time">0:00</span></div>' +
      '<p id="studio-simulation-status" role="status" aria-live="polite">' +
      (step === 4 && !project.currentExport ? t('成片尚未导出，当前可预演已有镜头。', 'No exported film yet; preview available scenes.') :
        t('已有配音优先；缺配音时静音估算，不含最终配乐，不触发生成。', 'Existing narration or silent estimated timing; no final music or generation.')) +
      '</p><audio id="studio-simulation-audio" preload="auto" hidden></audio></div>';
    html += project.scenes.map(function (scene, index) {
      var artifacts = scene.artifacts || {}, voice = artifacts.voice;
      return '<article class="studio-gallery-slide"' + (inspector ? '' : ' data-shot="' + esc(scene.id) + '"') + ' data-gallery-slide="' + esc(scene.id) + '"' +
        (index === selected ? '' : ' hidden') + ' aria-roledescription="slide" aria-label="' + (index + 1) + ' / ' + project.scenes.length + '">' +
        '<div class="studio-gallery-layout">' + monitorContent(scene) +
        (inspector ? '' : '<div class="studio-gallery-editor" aria-label="' + t('镜头检视器', 'Scene Inspector') + '"><header class="studio-panel-heading"><strong>' +
        t('镜头检视器', 'Scene Inspector') + '</strong><span>' + (index + 1) + ' / ' + project.scenes.length + '</span></header>' +
        '<div class="studio-inspector-content">' + legacyUpgrade(busy) + shotHeading(scene, index) +
        '<p class="studio-muted">' + t('分镜设计 → 生成素材并预演 → 制作视频', 'Storyboard → Generate and preview assets → Produce video') + '</p>' +
        field(t('标题', 'Title'), 'title', scene.title, false, 100) +
        field(t('讲解文案', 'Narration'), 'narration', scene.narration, true, 1600) +
        (scene.intent || scene.cinematography ? '<details><summary>' + t('叙事与摄影设计', 'Story and Cinematography') + '</summary><p>' +
          esc(scene.intent || '') + '</p><p>' + esc(scene.cinematography || '') + '</p></details>' : '') +
        field(t('主视觉文案（可留空）', 'Main Visual Copy (Optional)'), 'screenText', scene.screenText, true, 160) +
        (scene.composition ? '<p class="studio-muted">' + t('构图、文字层级与运动由AI逐镜头设计，预演与渲染使用同一编排。', 'AI designs composition, typography and motion per scene. Preview and render share the same composition.') + '</p>' +
          window.KHVideoComposition.nodes(scene.composition).map(function (layer, layerIndex) {
            return layer.type === 'text' && !layer.bind ? '<label><span>' + t('图层文字 ', 'Layer Text ') + (layerIndex + 1) +
              '</span><textarea data-layer-text="' + layerIndex + '" maxlength="500">' + esc(layer.text) + '</textarea></label>' : '';
          }).join('') :
          select(t('运镜', 'Camera'), 'camera', scene.camera, [['push', 'Push'], ['pull', 'Pull'], ['pan-left', 'Pan Left'], ['pan-right', 'Pan Right'], ['static', 'Static']])) +
        vgScenePresetSection(busy) +
        '<details class="studio-visual-adjustment"><summary>' + t('让AI调整画面', 'Ask AI to Adjust Visuals') + '</summary><label><span>' +
        t('描述你希望怎么改画面；保留旁白和已有素材。', 'Describe the visual changes you want; narration and existing assets are retained.') +
        '</span><textarea data-director-note maxlength="2000">' + esc(localStorage.getItem('kh-video-direction-' + project.id) || '') + '</textarea></label>' +
        button(t('按要求调整画面', 'Apply Visual Changes'), 'direct', null, false, busy || dirty) +
        '<p class="studio-muted">' + t('此操作使用Copilot云端，可能消耗额度；完成后点击制作视频即可。', 'Uses Copilot cloud and may use credits. Produce the video after reviewing the changes.') + '</p></details>' +
        '<h4>' + t('配音与素材', 'Voice and Assets') + '</h4>' +
        (voice ? '<audio controls class="studio-gallery-audio" data-media="' + voice.key + '"></audio>' :
          '<p class="studio-muted">' + t('配音将在制作视频时自动生成，目前可静音预演。', 'Voice is generated automatically during production. Silent preview is available now.') + '</p>') +
        '<details class="studio-advanced-tools"><summary>' + t('高级工具（通常无需使用）', 'Advanced Tools (Usually Not Needed)') + '</summary>' +
        '<p class="studio-muted">' + t('仅用于单独修补素材或手工排查；正常制作会自动准备所需素材、渲染和导出。', 'For individual asset repairs or manual troubleshooting. Normal production prepares required assets, renders and exports automatically.') + '</p>' +
        button(project.planApproved && !dirty ? t('方案已确认', 'Storyboard Approved') : t('仅确认方案', 'Approve Storyboard Only'),
          'approve-plan', null, false, busy || dirty || project.planApproved) +
        '<h4>' + t('当前镜头素材', 'Current Scene Assets') + '</h4>' +
        '<div class="studio-actions">' +
        (scene.imageRequired === false ? '<span class="studio-muted">' + t('纯文字 / 图形镜头，无需生图。', 'Typography / graphics scene; no generated image needed.') + '</span>' :
          button(t('生成 / 复用图片', 'Generate / Reuse Image'), 'image', scene.id, false, busy || dirty || !project.planApproved)) +
        button(t('生成 / 复用配音', 'Generate / Reuse Voice'), 'voice', scene.id, false, busy || dirty || !project.planApproved) + '</div>' +
        '<details><summary>' + t('素材与依据', 'Assets and Sources') + '</summary>' +
        (scene.imageRequired === false ? '<p>' + t('此镜头原生绘制文字与图形，不依赖图片素材。', 'This scene draws text and graphics natively; no image asset is needed.') + '</p>' :
          field(t('图像素材提示词', 'Image Asset Prompt'), 'visual', scene.visual, true, 4000)) +
        field(t('依据章节（逗号分隔）', 'Source Anchors (Comma-separated)'), 'anchors', scene.anchors.join(', ')) + '</details>' +
        batchControls(busy) +
        '<div class="studio-actions">' + button(t('前移', 'Move Earlier'), 'up', scene.id, false, busy || index === 0) +
        button(t('后移', 'Move Later'), 'down', scene.id, false, busy || index === project.scenes.length - 1) +
        button(t('移除镜头', 'Remove Scene'), 'remove', scene.id, false, busy) +
        button(t('添加镜头', 'Add Scene'), 'add', null, false, busy) + '</div></details></div></div>') + '</div></article>';
    }).join('');
    if (!project.scenes.length) html += monitorContent(null);
    if (inspector || !project.scenes.length) html += inspectorPanel(inspector || '<p>' +
      t('在上方选择模型并生成分镜。画面、旁白和镜头属性会在这里出现。', 'Select a model above and generate the storyboard. Scene, narration and camera properties will appear here.') + '</p>');
    html += sequence() + '</section>';
    return html;
  }
  function render() {
    var html = '', busy = active(), duration, planning, missing;
    var advancedOpen = !!stage.querySelector('.studio-gallery-slide:not([hidden]) .studio-advanced-tools[open]');
    var adjustmentOpen = !!stage.querySelector('.studio-gallery-slide:not([hidden]) .studio-visual-adjustment[open]');
    var presetsOpen = !!stage.querySelector('.studio-gallery-slide:not([hidden]) .studio-vg-presets[open]');
    if (!project) return;
    stopSimulation();
    pauseStageMedia();
    document.body.classList.add('studio-is-editing');
    document.getElementById('studio-article').textContent = project.source.title;
    document.getElementById('studio-steps').innerHTML = steps.map(function (label, index) {
      return '<button type="button" data-step="' + (index + 1) + '"' + (step === index + 1 ? ' aria-current="step"' : '') + '>' +
        (index + 1) + ' · ' + esc(t(label[0], label[1])) + '</button>';
    }).join('');
    if (project.stale) html += '<div class="studio-warning">' + t('文章已更新。旧作业仍保留，请刷新来源并重新审阅分镜；不会自动重做素材。', 'The article changed. Your work is preserved. Refresh the source and review the storyboard; assets are not regenerated automatically.') +
      button(t('刷新文章来源', 'Refresh Article Source'), 'source') + '</div>';
    html += '<h2>' + step + ' / ' + steps.length + ' · ' + esc(t(steps[step - 1][0], steps[step - 1][1])) + '</h2>';
    if (step === 1) {
      html += '<p>' + t('确认目标后再生成。需求、草稿、确认和素材保存在本机，不进入 Git。', 'Confirm the brief before generating. Projects, approvals and assets persist locally outside Git.') + '</p>' +
        field(t('你的创意想法', 'Your Creative Idea'), 'idea', project.brief.idea || '', true, 4000) +
        '<p class="studio-muted">' + t('描述你想要的故事、情绪、节奏或参考方向。智能体承担导演、编剧和摄影指导；下面的需求模板只是可选起点，不是视频版式。', 'Describe your story, mood, pace or references. The agent directs, writes and designs the cinematography. Brief presets below are optional starting points, not video layouts.') + '</p>' +
        '<section class="studio-templates" aria-label="' + t('视频需求模板', 'Video Brief Templates') + '"><h3>' +
        t('先选一个模板，也可以直接填写', 'Choose a Starting Template or Fill in Your Own') + '</h3><div class="studio-grid">' +
        briefTemplates.map(function (template) {
          return '<button type="button" class="studio-template" data-action="template" data-template="' + template.id +
            '" aria-pressed="' + String(matchesTemplate(project.brief, template)) + '"' + (busy ? ' disabled' : '') + '><strong>' +
            esc(t(template.name[0], template.name[1])) + '</strong><small>' +
            esc(t(template.description[0], template.description[1])) + '</small></button>';
        }).join('') + '</div><p class="studio-muted">' +
        t('模板预填受众、目标、视觉、时长和配乐，保留已选声音与语速。不会自动保存或生成。', 'Templates prefill audience, goal, visuals, duration and music, preserving voice and rate. They never save or generate automatically.') + '</p>' +
        vgBriefCatalogSection(busy) + '</section>' +
        field(t('目标受众', 'Audience'), 'audience', project.brief.audience, false, 300) +
        field(t('希望观众理解或采取什么行动', 'Viewer Goal'), 'goal', project.brief.goal, true, 500) +
        field(t('视觉与叙事方向', 'Visual and Narrative Direction'), 'style', project.brief.style, true, 1200) +
        '<div class="studio-grid">' + field(t('目标时长（秒，30–600）', 'Target Duration (Seconds, 30–600)'), 'seconds', project.brief.seconds) +
        field(t('语速（150–300）', 'Voice Rate (150–300)'), 'voiceRate', project.brief.voiceRate) +
        select(t('本机 / 官方 TTS 声音', 'Local / Volcengine Voice'), 'voice', project.brief.voice, [
          ['Yue (Premium)', '月 / Yue Premium (macOS)'],
          ['Lili (Premium)', '莉莉 / Lili Premium (macOS)'],
          ['Tingting', '婷婷 / Tingting (macOS)'],
          ['zh_female_cancan_uranus_bigtts', t('灿灿 · 字节 Seed-TTS 2.0', 'Cancan · Volcengine Seed-TTS 2.0')],
          ['zh_male_chunhou_uranus_bigtts', t('醇厚 · 字节 Seed-TTS 2.0', 'Chunhou · Volcengine Seed-TTS 2.0')]
        ]) +
        select(t('原创配乐', 'Original Music'), 'music', project.brief.music, [['bright', t('轻快器乐', 'Bright Instrumental')], ['none', t('无配乐', 'No Music')]]) + '</div>' +
        '<details><summary>' + t('查看发送给 Copilot 的全文来源', 'Inspect Full Article Context') + '</summary><pre>' + esc(project.source.text) + '</pre></details>';
    } else if (step === 2) {
      planning = project.jobs.some(function (job) { return job.kind === 'plan' && ['queued', 'running'].indexOf(job.status) >= 0; });
      html += '<div class="studio-workbench-header">' +
        button(t('自动生成口播分镜', 'Auto-Generate Narration'), 'auto-narration', null, false, busy) +
        button(planning ? t('分镜生成中…', 'Generating Storyboard…') : project.scenes.length ? t('重新生成分镜', 'Regenerate Storyboard') : t('生成分镜', 'Generate Storyboard'), 'plan', null, !project.scenes.length, busy || dirty) +
        (project.scenes.length ? button(assetPreparationLabel(), 'prepare-assets', null, false, busy) : '') +
        (project.scenes.length ? button(productionLabel(), 'produce', null, true, busy) : '') +
        (project.currentExport ? button(t('预览 / 下载成片', 'Preview / Download Film'), 'view-export') : '') +
        '<small class="studio-generation-note">' +
        t('自动生成口播免额度秒级就绪；Copilot 分镜设计可能消耗云端额度。', 'Auto-narration is instant & free; Copilot storyboard design may use cloud credits.') + '</small>';
      html += '<div class="studio-actions">' + button(t('保存修改', 'Save'), 'save', null, false, busy) + '</div>' +
        '<div class="studio-actions studio-workbench-end">' + button(t('作业记录', 'Jobs'), 'toggle-jobs') + '</div>';
      if (project.scenes.length) html += productionProgress();
      html += '</div>';
      if (project.creativeDirection) html += '<details class="studio-creative-direction"><summary>' + t('创作方案', 'Creative Direction') +
        '</summary><p>' + esc(project.creativeDirection) + '</p></details>';
      html += gallery(busy);
    } else if (step === 3) {
      html += '<p>' + t('仅执行你点击的步骤。未变化的输入直接复用缓存；改文案不重做图片，改运镜不重做配音。', 'Only explicit actions run. Unchanged inputs reuse cache; narration edits keep images, camera edits keep audio.') + '</p>';
      if (!project.planApproved) html += '<div class="studio-warning">' + t('当前分镜未确认，请先回到步骤2。', 'Approve the current storyboard in step 2 first.') + '</div>';
      missing = project.scenes.filter(function (scene) { return !scene.assetsReady; }).length;
      html += '<p class="' + (missing ? 'studio-warning' : 'studio-muted') + '">' +
        (missing ? t(missing + ' 个镜头缺少图片或配音，请返回工作台批量生成。', missing + ' scenes need images or voice. Generate assets in the workbench first.') :
          t('素材已齐备，可直接渲染，无需逐镜头确认。只渲染缺失或变更的片段。', 'Assets are ready. Render directly without per-scene approval; unchanged clips reuse cache.')) + '</p>' +
        '<div id="studio-batch-progress" role="status" aria-live="polite" hidden></div>';
      project.jobs.filter(function (job) { return job.kind === 'clips' && ['queued', 'running'].indexOf(job.status) >= 0; }).forEach(function (job) {
        html += button(t('停止渲染', 'Stop Rendering'), 'cancel', job.id);
      });
      html += project.scenes.map(function (scene, index) {
        var clip = scene.artifacts.clip;
        var content = '<article class="studio-shot" data-render-inspector="' + esc(scene.id) + '"' +
          (scene.id === galleryId ? '' : ' hidden') + '>' + shotHeading(scene, index) +
          '<p>' + esc(scene.narration) + '</p><small>' + esc(scene.anchors.map(function (anchor) { return '#' + anchor; }).join(' · ')) + '</small>';
        content += '<p>' + (clip ? t('片段已缓存，输入未变化。', 'Scene cached with matching inputs.') : t('仅本镜头需要渲染。', 'Only this scene needs rendering.')) + '</p>' +
            button(clip ? t('复用此镜头', 'Reuse Scene') : t('渲染此镜头', 'Render Scene'), 'clip', scene.id, true, busy || dirty || !project.planApproved || !scene.assetsReady);
        return content + '</article>';
      }).join('');
    } else {
      duration = project.scenes.reduce(function (sum, scene) { return sum + (scene.artifacts.voice ? scene.artifacts.voice.duration : 0); }, 0);
      html += '<p>' + t('目标 / 当前片长：', 'Target / Current Duration: ') + project.brief.seconds + 's / ' + Math.round(duration * 10) / 10 + 's</p>' +
        '<p>' + t('所有镜头渲染完成后，复制拼接已有视频流并混合音频；不重新生成画面或重渲染所有镜头。配乐或排序变更只使整片导出失效。', 'After scene rendering, existing video streams are joined and audio is mixed. No full frame re-render. Music/order changes invalidate only the assembled export.') + '</p>' +
        '<p>' + t('成片在中央监看器播放，使用上方工具栏导出或下载，也可导出兼容 Video-Generator 0.2 的工程清单 JSON。', 'Play the film in the central monitor; export or download from the toolbar above, or export a Video-Generator 0.2 manifest JSON.') + '</p>';
      if (!project.canExport) html += '<p class="studio-warning">' + t('请先完成所有变更镜头的渲染。', 'Render all changed scenes first.') + '</p>';
    }
    if (step !== 2) html = workflowToolbar(busy) + gallery(busy, html);
    stage.innerHTML = html;
    if (advancedOpen) stage.querySelectorAll('.studio-advanced-tools').forEach(function (node) { node.open = true; });
    if (adjustmentOpen) stage.querySelectorAll('.studio-visual-adjustment').forEach(function (node) { node.open = true; });
    if (presetsOpen) stage.querySelectorAll('.studio-vg-presets').forEach(function (node) { node.open = true; });
    stage.querySelectorAll('[data-render-inspector]').forEach(function (node) { node.hidden = node.getAttribute('data-render-inspector') !== galleryId; });
    stage.querySelectorAll('[data-action="toggle-jobs"]').forEach(function (node) {
      node.setAttribute('aria-controls', 'studio-job-drawer');
      node.setAttribute('aria-expanded', String(document.body.classList.contains('studio-jobs-open')));
    });
    if (busy) stage.querySelectorAll('input, textarea, select').forEach(function (node) { node.disabled = true; });
    syncSequence(0);
    if (project.scenes.length) paintComposition(galleryScene(), 0);
    jobs(); hydrate().catch(function (error) { say(error.message, true); });
    if (poll) clearInterval(poll);
    if (busy) poll = setInterval(refresh, 3000);
  }
  async function refresh() {
    var wasActive = active();
    var previousJob = project.jobs.find(function (job) { return job.status === 'queued' || job.status === 'running'; });
    var completed = previousJob && previousJob.progress ? previousJob.progress.completed : 0;
    var currentJob, replaced;
    try {
      project = await request(project.id);
      jobs();
      currentJob = previousJob && project.jobs.find(function (job) { return job.id === previousJob.id; });
      replaced = currentJob && currentJob.force && currentJob.progress && currentJob.progress.completed !== completed;
      if (!dirty && wasActive && (!active() || replaced)) render();
    } catch (error) { if (poll) clearInterval(poll); say(error.message + t(' 已保留本机状态，请主动重新载入。', ' Saved local state is preserved; reload explicitly.'), true); }
  }
  function toggleJobs(open) {
    var toggle = stage.querySelector('[data-action="toggle-jobs"]');
    document.body.classList.toggle('studio-jobs-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('studio-close-jobs').focus();
    else if (toggle) toggle.focus();
  }
  async function action(name, id) {
    var model, item, index, temporary, anchor, file, assetKinds, drafts, video, jobBody, progress, manifestData, blobUrl;
    if (name === 'toggle-jobs' || name === 'close-jobs') {
      toggleJobs(name === 'toggle-jobs' && !document.body.classList.contains('studio-jobs-open')); return;
    }
    if (name === 'simulate-toggle') {
      video = monitorVideo();
      if (video) {
        if (!dirty && !active()) {
          if (video.paused) await video.play();
          else video.pause();
        }
      } else if (simulation.playing) pauseSimulation();
      else if (!dirty && !active()) await playSimulation(simulation.paused);
      return;
    }
    if (name === 'gallery-select' || name === 'gallery-prev' || name === 'gallery-next') {
      index = project.scenes.findIndex(function (scene) { return scene.id === galleryId; });
      selectGallery(name === 'gallery-select' ? id : project.scenes[index + (name === 'gallery-prev' ? -1 : 1)].id); return;
    }
    stopSimulation(); pauseStageMedia();
    if (name === 'template') { applyTemplate(id); return; }
    if (name === 'vg-scenario') { applyVGScenario(id); return; }
    if (name === 'vg-pack') { applyVGStylePack(id); return; }
    if (name === 'vg-scene-preset') { applyScenePreset(id); return; }
    if (name === 'auto-narration') {
      if (localOffline) {
        var offlineDraft = vg.buildAutoDraftFromSource(project.source, { scenario: project.brief.scenario || 'presenter', stylePack: project.brief.stylePack || '01-A' });
        project.scenes = offlineDraft.scenes.map(function (sc) { return Object.assign({}, sc, { artifacts: {}, imageRequired: false, assetsReady: false }); });
        project.creativeDirection = offlineDraft.creativeDirection;
      } else {
        project = await request(project.id + '/auto-narration', { revision: project.revision, brief: step === 1 ? brief() : project.brief });
      }
      customCompositionOverrides = {}; dirty = false; step = 2; render();
      say(t('已结合当前文章与 Video-Generator 规范自动生成口播与分镜草稿，可直接微调文案或合成配音。', 'Auto-generated narration and storyboard draft using Video-Generator templates. Fine-tune copy or synthesize voice directly.'));
      return;
    }
    if (localOffline) {
      if (['brief', 'save', 'next', 'workbench', 'approve-plan'].indexOf(name) >= 0) {
        if (name === 'brief') { project.brief = Object.assign({}, project.brief, brief()); step = 2; }
        else if (name === 'save') { if (step === 1) project.brief = Object.assign({}, project.brief, brief()); else if (step === 2) project.scenes = collectScenes().map(function (s) { return Object.assign({}, s, { artifacts: {}, imageRequired: false, assetsReady: false }); }); }
        else if (name === 'next') step = Math.min(4, step + 1);
        else if (name === 'workbench') step = 2;
        else if (name === 'approve-plan') project.planApproved = true;
        customCompositionOverrides = {}; dirty = false; render();
        say(t('已在当前浏览器会话更新草稿；如需本机语音合成与 MP4 渲染，请启动 node scripts/serve-knowledge-hub.mjs。', 'Updated draft in browser session; start node scripts/serve-knowledge-hub.mjs for local voice synthesis and MP4 rendering.'));
        return;
      }
      if (['produce', 'prepare-assets', 'plan', 'direct', 'image', 'voice', 'clip', 'clips', 'export', 'batch-assets', 'batch-images', 'batch-voices'].indexOf(name) >= 0) {
        document.getElementById('studio-local').hidden = false;
        say(t('语音合成与视频渲染需要本机服务，请运行 node scripts/serve-knowledge-hub.mjs。', 'Voice synthesis and video rendering require the local server: run node scripts/serve-knowledge-hub.mjs.'), true);
        return;
      }
    }
    if (name === 'export-manifest') {
      manifestData = await request(project.id + '/manifest');
      blobUrl = URL.createObjectURL(new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' }));
      anchor = document.createElement('a'); anchor.href = blobUrl;
      anchor.download = project.source.slug + '-video-generator.json'; anchor.click();
      setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 2000);
      say(t('已导出兼容 Video-Generator 0.2 的工程清单 JSON。', 'Exported Video-Generator 0.2 compatible project manifest JSON.'));
      return;
    }
    if (name === 'brief') { await save(true); await navigate(2); return; }
    if (name === 'save') { await save(false); render(); return; }
    if (name === 'next') { await navigate(step + 1); return; }
    if (name === 'workbench') { await navigate(2); return; }
    if (name === 'view-export') { await navigate(4); return; }
    if (name === 'source') { project = await request(project.id + '/source', { revision: project.revision }); render(); return; }
    if (name === 'cancel') { project = await request(project.id + '/cancel', { jobId: id }); render(); return; }
    if (name === 'approve-plan') {
      project = await request(project.id + '/approve', { revision: project.revision, stage: 'plan' });
      render(); return;
    }
    if (name === 'produce' || name === 'prepare-assets') {
      if (name === 'prepare-assets') {
        if (hasCurrentAssets() && !window.confirm(t(
          '将重新生成全片所需的图片和配音，替换对应的已有素材；相关视频片段和成片需要重新制作。\n每项成功后才替换，失败项仍保留原素材。确定继续？',
          'Regenerate all required images and voice for this film, replacing current assets? Affected clips and the film will need rebuilding.\nEach item is replaced only after successful generation; failed items retain their previous assets.'
        ))) { say(t('已取消重新生成，现有素材未改变。', 'Regeneration cancelled. Existing assets are unchanged.')); return; }
        progress = document.getElementById('studio-batch-progress');
        progress.hidden = false;
        progress.innerHTML = '<div class="studio-batch-meter"><p>' + t('正在提交素材生成任务…', 'Submitting asset generation…') +
          '</p><progress max="1" aria-label="' + t('提交素材生成请求', 'Submitting Asset Generation') + '"></progress></div>';
      }
      if (dirty) await save(false);
      if (!project.planApproved) project = await request(project.id + '/approve', { revision: project.revision, stage: 'plan' });
      jobBody = { revision: project.revision, kind: name === 'prepare-assets' ? 'assets' : 'produce' };
      if (name === 'prepare-assets') { jobBody.assetKinds = ['image', 'voice']; jobBody.force = true; }
      project = await request(project.id + '/jobs', jobBody);
      say(name === 'prepare-assets' ? t('素材生成已提交，将重新执行生成而不复用已有结果；完成后可试听和预演，不会自动制作视频。', 'Asset generation submitted without reusing existing results. Preview when ready; video production will not start automatically.') :
        t('视频制作已提交，可查看进度和作业记录。', 'Video production submitted. Follow progress and job history.'));
      render(); return;
    }
    if (['batch-assets', 'batch-images', 'batch-voices'].indexOf(name) >= 0) {
      assetKinds = name === 'batch-assets' ? ['image', 'voice'] : [name === 'batch-images' ? 'image' : 'voice'];
      project = await request(project.id + '/jobs', { revision: project.revision, kind: 'assets', assetKinds: assetKinds });
      render(); return;
    }
    if (['plan', 'direct', 'image', 'voice', 'clip', 'clips', 'export'].indexOf(name) >= 0) {
      if (dirty) throw new Error(t('请先保存编辑。', 'Save edits first.'));
      if (name === 'plan' || name === 'direct') {
        model = client.requireModel();
      }
      project = await request(project.id + '/jobs', { revision: project.revision, kind: name, sceneId: id, model: model,
        direction: name === 'direct' ? localStorage.getItem('kh-video-direction-' + project.id) || '' : undefined,
        consent: name === 'plan' || name === 'direct' });
      render(); return;
    }
    if (name === 'download') {
      file = await media(id); anchor = document.createElement('a'); anchor.href = file;
      anchor.download = project.source.slug + '.mp4'; anchor.click(); return;
    }
    if (['add', 'up', 'down', 'remove'].indexOf(name) >= 0) {
      drafts = collectScenes();
      project.scenes = drafts.map(function (draft) {
        var saved = project.scenes.find(function (scene) { return scene.id === draft.id; });
        return Object.assign({}, saved, draft);
      });
      index = project.scenes.findIndex(function (scene) { return scene.id === id; });
      if (name === 'add') {
        galleryId = 'shot-' + Date.now();
        project.scenes.push({ id: galleryId, title: t('新镜头', 'New Scene'), narration: '', visual: '', screenText: '', camera: 'push', anchors: [project.source.anchors[0]], artifacts: {}, assetsReady: false });
      }
      else if (name === 'remove') project.scenes.splice(index, 1);
      else {
        item = name === 'up' ? index - 1 : index + 1;
        temporary = project.scenes[index]; project.scenes[index] = project.scenes[item]; project.scenes[item] = temporary;
      }
      dirty = true; render();
    }
  }
  async function invoke(name, id) {
    if (pending) return;
    pending = true; updateCopilotUI();
    try { await action(name, id); }
    catch (error) { if (name === 'prepare-assets') jobs(); say(error.message, true); }
    finally { pending = false; updateCopilotUI(); }
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-action]'), nav = event.target.closest('[data-step]');
    if (target && target.getAttribute('data-action') === 'simulate-stop') {
      if (monitorVideo()) { monitorVideo().pause(); monitorVideo().currentTime = 0; simulationControls(); }
      else { stopSimulation(); simulationStatus(t('预演已停止。', 'Simulation stopped.')); }
      return;
    }
    if (target && !target.disabled) invoke(target.getAttribute('data-action'),
      target.getAttribute('data-scene') || target.getAttribute('data-template') ||
      target.getAttribute('data-vg-scenario') || target.getAttribute('data-vg-pack') || target.getAttribute('data-preset'));
    if (nav) navigate(Number(nav.getAttribute('data-step'))).catch(function (error) { say(error.message, true); });
  });
  stage.addEventListener('input', function (event) {
    if (event.target.matches('[data-director-note]')) {
      localStorage.setItem('kh-video-direction-' + project.id, event.target.value);
      stage.querySelectorAll('[data-director-note]').forEach(function (node) { if (node !== event.target) node.value = event.target.value; });
      return;
    }
    if (event.target.matches('[data-field], [data-layer-text]') && event.target.getAttribute('data-field') !== 'model') {
      stopSimulation();
      dirty = true; say(t('有未保存编辑；保存不会触发生成。已有素材对应上次保存的版本。', 'Unsaved edits. Saving does not generate. Existing assets represent the last saved version.'));
      if (step === 1) syncTemplates();
      stage.querySelectorAll('[data-action="approve-plan"], [data-action="plan"], [data-action="direct"], [data-action^="batch-"], [data-action="image"], [data-action="voice"], [data-action="simulate-toggle"]').forEach(function (node) { node.disabled = true; });
      stage.querySelectorAll('[data-action="produce"]').forEach(function (node) { node.textContent = productionLabel(); });
      stage.querySelectorAll('[data-action="prepare-assets"]').forEach(function (node) { node.textContent = assetPreparationLabel(); });
    }
  });
  document.addEventListener('keydown', function (event) {
    var index;
    if (event.key === 'Escape' && document.body.classList.contains('studio-jobs-open')) {
      event.preventDefault(); toggleJobs(false); return;
    }
    if (!project || !project.scenes.length || document.body.classList.contains('studio-jobs-open') || event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Escape') {
      if (simulation.playing || simulation.paused) { stopSimulation(); simulationStatus(t('预演已停止。', 'Simulation stopped.')); return; }
      if (embedMode && window.parent !== window) { window.parent.postMessage({ type: 'kh-studio-close-modal' }, location.origin); return; }
      stopSimulation(); simulationStatus(t('预演已停止。', 'Simulation stopped.')); return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    index = project.scenes.findIndex(function (scene) { return scene.id === galleryId; }) + (event.key === 'ArrowLeft' ? -1 : 1);
    if (index >= 0 && index < project.scenes.length) { event.preventDefault(); selectGallery(project.scenes[index].id); }
  });
  document.getElementById('studio-reload').addEventListener('click', function () {
    if (dirty && !window.confirm(t('放弃未保存编辑并载入保存状态？', 'Discard unsaved edits and reload saved state?'))) return;
    request(project.id).then(function (saved) { project = saved; customCompositionOverrides = {}; dirty = false; step = restoredStep(project.cursor); render(); }).catch(function (error) { say(error.message, true); });
  });
  document.getElementById('studio-lang').addEventListener('click', function () {
    if (dirty) { say(t('请先保存编辑，再切换语言。', 'Save edits before changing language.'), true); return; }
    language = language === 'en' ? 'zh' : 'en'; localStorage.setItem('lang', language); applyLanguage(); render();
  });
  document.getElementById('studio-copilot-status').addEventListener('click', function () { detectCopilot(); });
  document.getElementById('studio-copilot-model').addEventListener('change', function (event) { client.selectModel(event.target.value); });
  document.getElementById('studio-theme').addEventListener('click', function () {
    var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme);
  });
  document.getElementById('studio-open-local').addEventListener('click', function () {
    var port = Number(document.getElementById('studio-port').value);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) { say(t('本机端口无效。', 'Invalid local port.'), true); return; }
    location.href = 'http://127.0.0.1:' + port + '/video-studio.html?article=' + encodeURIComponent(article || '');
  });
  window.addEventListener('beforeunload', function (event) { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('pagehide', function () { stopSimulation(); pauseStageMedia(); if (poll) clearInterval(poll); Object.keys(urls).forEach(function (key) { URL.revokeObjectURL(urls[key]); }); });
  if (localStorage.getItem('theme')) document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
  if (embedMode) {
    var embedClose = document.getElementById('studio-embed-close'), homeLink = document.getElementById('studio-home-link');
    var closeEmbed = function (ev) { if (ev) ev.preventDefault(); stopSimulation(); pauseStageMedia(); if (window.parent !== window) window.parent.postMessage({ type: 'kh-studio-close-modal' }, location.origin); };
    if (embedClose) { embedClose.hidden = false; embedClose.addEventListener('click', closeEmbed); }
    if (homeLink && window.parent !== window) homeLink.addEventListener('click', closeEmbed);
  }
  applyLanguage();
  function bootOfflineDraft(sourceData) {
    var src = sourceData || { slug: article || 'article', title: article || '当前文章', anchors: ['overview'], text: '' };
    var draft = vg.buildAutoDraftFromSource(src, { scenario: 'presenter', stylePack: '01-A', sections: src.sections });
    localOffline = true;
    project = { id: 'p-local-preview', revision: 1, stale: false, cursor: 2, planApproved: true, canExport: false, currentExport: null,
      source: { slug: src.slug, title: src.title, anchors: src.anchors && src.anchors.length ? src.anchors : ['overview'], text: src.text || src.title },
      brief: { audience: '希望快速掌握文章核心价值的读者', goal: '提炼关键论点、数据指标与落地步骤', style: vg.getStylePack('01-A').stylePrompt, seconds: 180, voice: 'Yue (Premium)', voiceRate: 235, music: 'bright', idea: '', scenario: 'presenter', stylePack: '01-A' },
      creativeDirection: draft.creativeDirection, scenes: draft.scenes.map(function (sc) { return Object.assign({}, sc, { artifacts: {}, imageRequired: false, assetsReady: false }); }), jobs: [] };
    step = 2; workspace.hidden = false; render(); client.setLocalOnly();
    say(t('已基于当前文章自动生成口播词与动态分镜预演；启动本机服务即可一键合成语音与导出 MP4。', 'Auto-generated narration and animated storyboard preview from the article; start the local server to synthesize voice and export MP4.'));
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || !event.data || event.data.type !== 'kh-article-context') return;
    if (localOffline && event.data.source) bootOfflineDraft(event.data.source);
  });
  if (!localMode) {
    if (embedMode || autoDraftParam) { bootOfflineDraft(); if (window.parent !== window) window.parent.postMessage({ type: 'kh-studio-request-context' }, location.origin); return; }
    client.setLocalOnly(); return;
  }
  if (!article || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(article)) { say(t('请从文章顶部的视频工作室入口打开。', 'Open Video Studio from an article toolbar.'), true); detectCopilot(); return; }
  Promise.all([request('open', { article: article, autoDraft: embedMode || autoDraftParam }), request('capabilities')]).then(function (results) {
    var capability = results[1];
    project = results[0]; step = restoredStep(project.cursor); workspace.hidden = false;
    document.getElementById('studio-capabilities').textContent = t('本地生图 / 配音 / 渲染：', 'Local Image / Voice / Renderer: ') +
      [capability.image, capability.voice, capability.renderer].map(function (ready) { return ready ? t('就绪', 'Ready') : t('需准备', 'Setup Needed'); }).join(' / ');
    render();
    if ((embedMode || autoDraftParam) && project.scenes.length) say(t('已结合当前文章自动生成口播与分镜初稿，可直接在右侧调整口播台词、切换风格或合成配音。', 'Auto-generated narration and storyboard draft for this article. Fine-tune narration, switch styles, or synthesize voice directly.'));
    detectCopilot();
  }).catch(function (error) {
    if (error && (error.code === 'BRIDGE_NOT_FOUND' || error.code === 'BRIDGE_OFFLINE')) {
      if (embedMode || autoDraftParam) { bootOfflineDraft(); if (window.parent !== window) window.parent.postMessage({ type: 'kh-studio-request-context' }, location.origin); return; }
      say('', false); client.setLocalOnly(); return;
    }
    say(error.message, true); document.getElementById('studio-local').hidden = false; detectCopilot();
  });
});

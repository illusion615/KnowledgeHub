document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var project = null, step = 1, dirty = false, poll = null, pending = false;
  var language = localStorage.getItem('lang') || 'zh';
  var models = [], urls = {}, mediaRequests = {}, session = null, article = new URLSearchParams(location.search).get('article');
  var selectedModel = localStorage.getItem('kh-video-model') || '';
  var copilotState = 'checking', copilotError = '', copilotCheck = null;
  var localMode = location.protocol === 'http:' && location.hostname === '127.0.0.1';
  var galleryId = null;
  var simulation = { playing: false, paused: false, loading: false, token: 0, elapsed: 0, duration: 0, started: 0, frame: null, audio: null };
  var stage = document.getElementById('studio-stage');
  var message = document.getElementById('studio-message');
  var workspace = document.getElementById('studio-workspace');
  var steps = [['需求确认', 'Brief'], ['镜头工作台', 'Scene Workbench'], ['镜头渲染', 'Scene Rendering'], ['整片导出', 'Export']];
  var kinds = { plan: ['生成分镜', 'Storyboard'], direct: ['AI重新设计画面', 'AI Visual Redesign'], produce: ['制作完整视频', 'Produce Full Video'], image: ['本地生图', 'Local image'], voice: ['本机配音', 'Local voice'], clip: ['镜头渲染', 'Scene render'], export: ['拼接导出', 'Export'], assets: ['批量准备素材', 'Batch Assets'], clips: ['渲染全部镜头', 'Render All Scenes'] };
  var briefTemplates = [
    {
      id: 'solution', name: ['方案讲解', 'Solution Explainer'], seconds: 180, music: 'bright',
      description: ['3 分钟 · 挑战、方案、获益与落地', '3 min · Challenge, solution, benefits and rollout'],
      audience: ['需要快速理解方案价值的一线业务用户与业务决策者', 'Frontline users and business decision-makers evaluating a solution'],
      goal: ['讲清业务挑战、方案如何运转、谁能获得什么，以及成本与实施边界；引导观众阅读原文。', 'Explain the challenge, how the solution works, who benefits, and the cost and implementation boundaries; invite viewers to read the article.'],
      style: ['根据方案的信息关系选择表达方式，用简洁的文字、图形、对象动画、运镜或必要的图像讲清机制与价值，不默认每镜生图。', 'Choose text, graphics, object animation, camera movement or imagery according to the information being explained. Make the mechanism and value clear; do not default to an image per shot.']
    },
    {
      id: 'technical', name: ['技术拆解', 'Technical Breakdown'], seconds: 240, music: 'none',
      description: ['4 分钟 · 架构、流程、取舍与边界', '4 min · Architecture, flows, trade-offs and limits'],
      audience: ['具备基础领域知识的技术负责人、架构师与开发者', 'Technical leads, architects and developers with basic domain knowledge'],
      goal: ['让观众理解核心机制、组件分工与关键流程，能够说明方案取舍、适用条件和失败边界，不把设计目标当成实测结果。', 'Explain the core mechanism, component responsibilities and critical flows, including trade-offs, prerequisites and failure boundaries. Distinguish design targets from measured results.'],
      style: ['以理解技术机制为目标，自主选择图形关系、动态流程、文字强调、运镜或图像；把关键路径、取舍和异常解释清楚，不预设画面类型。', 'Choose relationships, animated flows, typographic emphasis, camera moves or images to explain the mechanism, critical paths, trade-offs and failures. No prescribed visual format.']
    },
    {
      id: 'education', name: ['知识科普', 'Knowledge Explainer'], seconds: 180, music: 'bright',
      description: ['3 分钟 · 问题、概念、案例与误区', '3 min · Question, concept, example and misconceptions'],
      audience: ['第一次接触这个主题、希望快速建立理解的普通读者', 'General readers encountering the topic for the first time'],
      goal: ['从一个具体问题解释核心概念，用一个例子讲清原理，再指出常见误区和观众可以采取的下一步；保留事实与适用条件。', 'Start with a concrete question, explain the core concept through one example, then address misconceptions and a practical next step while preserving facts and conditions.'],
      style: ['用观众容易理解的可视化解释概念，让文字、运动、图形或图像按需要承担不同任务；清楚、简洁，避免装饰性堆砌。', 'Explain concepts with accessible visuals. Let text, motion, graphics or images serve the explanation as needed; keep it clear and concise rather than decorative.']
    },
    {
      id: 'promo', name: ['短视频宣发', 'Short-form Promotion'], seconds: 60, music: 'bright',
      description: ['1 分钟 · 痛点、核心价值与阅读引导', '1 min · Pain point, key value and reading invitation'],
      audience: ['尚未读过原文、需要迅速判断是否值得深入了解的潜在读者', 'Potential readers deciding whether to explore the full article'],
      goal: ['用一个具体痛点吸引注意，只讲一个核心价值和一个有来源的例子，最后引导阅读原文；不承诺未经验证的效果，不试图覆盖全部细节。', 'Hook viewers with one concrete pain point, present one core value and one sourced example, then invite them to read the article. Do not promise unverified outcomes or cover every detail.'],
      style: ['自主选择最能抓住核心价值的表达手段，用节奏、构图、短句和必要的视觉变化推进，不强制人物故事或图像背景，避免信息过载。', 'Choose the clearest way to convey the core value through pacing, composition, concise copy and purposeful visual change. Character stories and image backgrounds are not mandatory.']
    }
  ];
  function t(zh, en) { return language === 'en' ? en : zh; }
  function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function say(value, error) { message.textContent = value; message.className = error ? 'studio-error' : ''; }
  function applyLanguage() {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach(function (node) { node.textContent = node.getAttribute(language === 'en' ? 'data-en' : 'data-zh'); });
    document.getElementById('studio-lang').textContent = language === 'en' ? '中文' : 'EN';
  }
  function active() { return project && project.jobs.some(function (job) { return job.status === 'queued' || job.status === 'running'; }); }
  function updateCopilotUI() {
    var status = document.getElementById('studio-copilot-status');
    var select = document.getElementById('studio-copilot-model');
    var error = document.getElementById('studio-copilot-error');
    var labels = {
      checking: ['检测中', 'Checking'], connected: ['已连接', 'Connected'],
      'signed-out': ['未登录', 'Not Signed In'], 'no-models': ['暂无模型', 'No Models'],
      error: ['连接失败', 'Unavailable'], 'local-only': ['仅本机可用', 'Local Only']
    };
    var available = copilotState === 'connected' && models.some(function (model) { return model.id === selectedModel; });
    var placeholder = copilotState === 'checking' ? t('正在读取模型…', 'Loading Models…') :
      selectedModel && models.length && !available ? t('原模型不可用，请重选', 'Previous Model Unavailable') : t('选择 Copilot 模型', 'Select Copilot Model');
    status.textContent = 'Copilot · ' + t(labels[copilotState][0], labels[copilotState][1]);
    status.setAttribute('data-state', copilotState);
    status.title = copilotError || t('重新检测已有登录与模型；不发送文章或提问。', 'Recheck existing login and models without sending an article or prompt.');
    status.setAttribute('aria-label', status.textContent + ' · ' + status.title);
    status.disabled = !localMode || copilotState === 'checking' || !!active() || pending;
    select.innerHTML = '<option value="">' + esc(placeholder) + '</option>' + models.map(function (model) {
      return '<option value="' + esc(model.id) + '"' + (model.id === selectedModel ? ' selected' : '') + '>' + esc(model.name || model.id) + '</option>';
    }).join('');
    select.disabled = copilotState !== 'connected' || !models.length || !!active() || pending;
    error.textContent = copilotError;
    error.hidden = !copilotError;
    stage.querySelectorAll('[data-action="plan"]').forEach(function (node) { node.disabled = !available || dirty || !!active() || pending; });
    stage.querySelectorAll('[data-action="direct"]').forEach(function (node) { node.disabled = !available || dirty || !!active() || pending || !project.scenes.length; });
    stage.querySelectorAll('[data-action="produce"]').forEach(function (node) {
      node.textContent = productionLabel();
      node.disabled = !!active() || pending || !project.scenes.length;
    });
    stage.querySelectorAll('[data-action="prepare-assets"]').forEach(function (node) {
      node.textContent = assetPreparationLabel();
      node.disabled = !!active() || pending || !project.scenes.length;
    });
  }
  function detectCopilot() {
    if (!localMode || copilotCheck) return copilotCheck;
    copilotState = 'checking'; copilotError = ''; updateCopilotUI();
    copilotCheck = Promise.resolve().then(async function () {
      var result;
      try {
        if (!window.KHCopilot) throw new Error(t('Copilot 组件未加载，请刷新页面。', 'The Copilot component did not load. Refresh the page.'));
        result = await window.KHCopilot.status();
        if (!result.authenticated) {
          models = []; copilotState = 'signed-out';
          copilotError = t('未检测到有效的官方 Copilot 登录。不会自动切换账号；已有登录恢复后可点击右上角状态重新检测。', 'No valid official Copilot login was found. Accounts are never switched automatically. Click the status to recheck after restoring your existing login.');
        } else {
          if (!Array.isArray(result.models) || result.models.some(function (model) { return !model || typeof model.id !== 'string' || !model.id; }))
            throw new Error(t('Copilot 模型目录格式异常，请重新检测。', 'Invalid Copilot model catalog. Please recheck.'));
          models = result.models; copilotState = models.length ? 'connected' : 'no-models';
          if (!models.length) copilotError = t('登录有效，但没有返回可用模型，请检查 Copilot 权限或组织策略。', 'Login is valid, but no models were returned. Check Copilot access or organization policy.');
        }
      } catch (error) {
        models = []; copilotState = 'error'; copilotError = error.message;
      } finally { copilotCheck = null; updateCopilotUI(); }
    });
    return copilotCheck;
  }
  async function response(result) {
    var data;
    if (!result.ok) {
      try { data = await result.json(); } catch (_) { throw new Error('HTTP ' + result.status); }
      throw new Error(data.error && data.error.message || 'HTTP ' + result.status);
    }
    return result;
  }
  async function request(path, body, binary) {
    var csrf, result;
    if (!session) {
      session = (async function () {
        var boot = await response(await fetch('/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' }, credentials: 'same-origin' }));
        return (await boot.json()).csrf;
      })().catch(function (error) { session = null; throw error; });
    }
    csrf = await session;
    result = await fetch('/api/copilot/studio/' + path, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin',
      headers: { 'X-KH-CSRF': csrf, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (result.status === 403) session = null;
    await response(result);
    return binary ? result.blob() : result.json();
  }
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
  function value(key, parent) { return (parent || stage).querySelector('[data-field="' + key + '"]').value; }
  function collectScenes() {
    return Array.prototype.map.call(stage.querySelectorAll('[data-shot]'), function (node) {
      var saved = project.scenes.find(function (scene) { return scene.id === node.getAttribute('data-shot'); });
      var composition = saved.composition && JSON.parse(JSON.stringify(saved.composition));
      if (composition) node.querySelectorAll('[data-layer-text]').forEach(function (field) {
        window.KHVideoComposition.nodes(composition)[Number(field.getAttribute('data-layer-text'))].text = field.value;
      });
      return { id: node.getAttribute('data-shot'), title: value('title', node), narration: value('narration', node),
        visual: node.querySelector('[data-field="visual"]') ? value('visual', node) : saved.visual, screenText: value('screenText', node),
        camera: node.querySelector('[data-field="camera"]') ? value('camera', node) : saved.camera,
        composition: composition, imagePromptVersion: saved.imagePromptVersion, intent: saved.intent, cinematography: saved.cinematography,
        anchors: value('anchors', node).split(',').map(function (anchor) { return anchor.trim().replace(/^#/, ''); }).filter(Boolean) };
    });
  }
  function brief() {
    return { audience: value('audience'), goal: value('goal'), style: value('style'), seconds: Number(value('seconds')),
      voice: value('voice'), voiceRate: Number(value('voiceRate')), music: value('music'), idea: value('idea') };
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
  async function save(confirmBrief) {
    project = await request(project.id + '/draft', {
      revision: project.revision, brief: step === 1 ? brief() : project.brief,
      scenes: step === 2 ? collectScenes() : project.scenes, confirmBrief: confirmBrief === true
    });
    dirty = false;
    say(t('已保存。没有触发生成或渲染。', 'Saved. No generation or rendering was triggered.'));
  }
  async function navigate(next) {
    if (dirty && !window.confirm(t('还有未保存编辑。放弃这些编辑并切换步骤？', 'Discard unsaved edits and change steps?'))) return;
    project = await request(project.id + '/cursor', { step: [1, 2, 4, 5][next - 1] });
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
  function batchMeter(job) {
    var progress = job.progress;
    var percent = progress ? Math.round(progress.completed / progress.total * 100) : null;
    var statuses = {
      queued: ['排队中', 'Queued'], running: ['生成中', 'Generating'], done: ['已完成', 'Completed'],
      failed: ['生成失败', 'Failed'], cancelled: ['已取消', 'Cancelled'], interrupted: ['服务中断', 'Interrupted']
    };
    var status = statuses[job.status];
    if (job.status === 'running' && job.kind === 'produce') status = ['制作中', 'Producing'];
    if (job.status === 'running' && job.kind === 'clips') status = ['渲染中', 'Rendering'];
    var summary = batchProgress(job);
    var label = job.kind === 'produce' ? t('视频制作进度', 'Video Production Progress') :
      job.kind === 'clips' ? t('镜头渲染进度', 'Scene Rendering Progress') : t('批量素材生成进度', 'Batch Media Generation Progress');
    return '<div class="studio-batch-meter" data-state="' + esc(job.status) + '">' +
      '<div class="studio-progress-heading"><span>' + esc(t(status[0], status[1])) + '</span>' +
      '<strong class="studio-progress-percent">' + (percent === null ? '…' : percent + '%') + '</strong></div>' +
      '<progress aria-label="' + esc(label) + '" aria-valuetext="' + esc(t(status[0], status[1]) + ' · ' + summary) + '"' +
      (progress ? ' max="' + progress.total + '" value="' + progress.completed + '"' : ' max="1"') + '>' +
      (percent === null ? esc(t('等待进度', 'Waiting for Progress')) : percent + '%') +
      '</progress><p class="studio-muted">' + esc(summary) + '</p></div>';
  }
  function batchProgress(job) {
    var progress = job.progress, result, label;
    if (!progress) return t('批量任务已排队。', 'Batch queued.');
    result = t('完成 ', 'Completed ') + progress.completed + ' / ' + progress.total +
      t(' · 新生成 ', ' · Generated ') + progress.generated + t(' · 复用 ', ' · Reused ') + progress.reused;
    if (job.status === 'running' && progress.completed < progress.total) {
      label = kinds[progress.kind];
      result += ' · ' + progress.title + ' / ' + t(label[0], label[1]);
    }
    return result;
  }
  function shotHeading(scene, index) {
    return '<h3>' + (index + 1) + '. ' + esc(scene.title) + '</h3>';
  }
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
  function sceneDuration(scene) {
    var voice = scene.artifacts && scene.artifacts.voice;
    return voice ? voice.duration : Math.max(3, scene.narration.length / (5 * project.brief.voiceRate / 235) + 1);
  }
  function sceneBin() {
    return '<aside class="studio-scene-bin" aria-label="' + t('镜头列表', 'Scene Bin') + '"><header class="studio-panel-heading"><strong>' +
      t('素材 / 镜头', 'Media / Scenes') + '</strong><span>' + project.scenes.length + '</span></header>' +
      '<div class="studio-project-source"><small>' + t('文章来源', 'Article Source') + '</small><strong>' + esc(project.source.title) +
      '</strong><a href="posts/' + esc(project.source.slug) + '/" target="_blank" rel="noopener">' + t('查看原文 ↗', 'Open Article ↗') + '</a></div><div class="studio-scene-list">' +
      project.scenes.map(function (scene, index) {
        var image = scene.artifacts && scene.artifacts.image, voice = scene.artifacts && scene.artifacts.voice;
        return '<button type="button" class="studio-bin-scene" data-action="gallery-select" data-scene="' + esc(scene.id) + '"' +
          (scene.id === galleryId ? ' aria-current="true"' : '') + '><span class="studio-bin-number">' + String(index + 1).padStart(2, '0') + '</span>' +
          (image ? '<img alt="" data-media="' + image.key + '">' : '<span class="studio-bin-placeholder">—</span>') +
          '<span class="studio-bin-info"><strong>' + esc(scene.title) + '</strong><small>' +
          (scene.imageRequired === false ? t('图形画面', 'Graphics') : image ? t('图就绪', 'Image ready') : t('缺图片', 'No image')) + ' · ' +
          (voice ? t('音就绪', 'Voice ready') : t('缺配音', 'No voice')) + '</small></span></button>';
      }).join('') + '</div></aside>';
  }
  function sequence() {
    var total = project.scenes.reduce(function (sum, scene) { return sum + sceneDuration(scene); }, 0);
    var scale = 16, ruler = '', video = '', audio = '', seconds;
    for (seconds = 0; seconds < total; seconds += 10) {
      ruler += '<span style="left:' + (seconds * scale) + 'px">' + timeLabel(seconds) + '</span>';
    }
    project.scenes.forEach(function (scene, index) {
      var artifacts = scene.artifacts || {}, duration = sceneDuration(scene), width = duration * scale;
      var attributes = ' data-action="gallery-select" data-scene="' + esc(scene.id) + '"' +
        (scene.id === galleryId ? ' aria-current="true"' : '') + ' style="width:' + width + 'px"';
      video += '<button type="button" class="studio-gallery-thumb"' + attributes + ' aria-label="' +
        esc((index + 1) + '. ' + scene.title) + '">' +
        (artifacts.image ? '<img alt="" data-media="' + artifacts.image.key + '">' : '<span class="studio-thumb-placeholder">' + (index + 1) + '</span>') +
        '<span>' + esc((index + 1) + '. ' + scene.title) + '</span></button>';
      audio += '<button type="button" class="studio-audio-clip' + (artifacts.voice ? ' is-ready' : '') + '"' + attributes +
        ' aria-label="' + esc(t('配音：', 'Voice: ') + scene.title) + '">' +
        (artifacts.voice ? t('配音 ', 'Voice ') : t('估算 ', 'Est. ')) + duration.toFixed(1) + 's</button>';
    });
    return '<section class="studio-sequence" aria-label="' + t('镜头序列', 'Scene Sequence') + '"><header class="studio-panel-heading"><strong>' +
      t('镜头序列', 'Scene Sequence') + '</strong><span class="studio-sequence-hint">' +
      t('点击选择；排序使用检视器前移/后移', 'Click to select; reorder in the Inspector') + '</span><span id="studio-sequence-time" aria-live="off">0:00 / ' +
      timeLabel(total) + '</span></header><div class="studio-sequence-body"><div class="studio-track-labels" aria-hidden="true"><span></span><strong>V1</strong><strong>A1</strong></div>' +
      '<div class="studio-sequence-scroll"><div class="studio-sequence-content" style="width:' + Math.max(total * scale, 1) + 'px" data-sequence-scale="' + scale + '">' +
      '<div class="studio-sequence-ruler" aria-hidden="true">' + ruler + '</div>' +
      (!project.scenes.length ? '<p class="studio-sequence-empty">' + t('时间线为空 · 生成分镜后显示画面与配音轨道', 'Empty timeline · storyboard scenes will populate the image and voice tracks') + '</p>' : '') +
      '<div class="studio-filmstrip" aria-label="' + t('画面轨道', 'Image Track') + '">' + video + '</div>' +
      '<div class="studio-audio-track" aria-label="' + t('配音轨道；虚线表示待生成、时长估算', 'Voice Track; dashed clips are ungenerated and estimated') + '">' + audio + '</div>' +
      '<div class="studio-sequence-playhead" aria-hidden="true"></div></div></div></div></section>';
  }
  function monitorContent(scene) {
    var artifacts = scene && scene.artifacts || {}, image = artifacts.image, voice = artifacts.voice;
    var clip = step === 4 ? project.currentExport : step === 3 && voice ? artifacts.clip : null;
    var content;
    if (clip) content = '<video controls preload="metadata" data-monitor' +
      (step === 4 ? ' data-film' : ' data-voice="' + voice.key + '"') + ' data-media="' + clip.key + '"></video>';
    else if (!scene) content = '<div class="studio-source-preview"><small>' + t('文章来源预览', 'Article Source Preview') +
      '</small><h3>' + esc(project.source.title) + '</h3><p>' + t('原文开头摘录 · 生成分镜后可在此预演', 'Opening excerpt · scene previews appear here after storyboarding') +
      '</p><blockquote>' + esc(project.source.text.slice(0, 600)) + '</blockquote></div>';
    else if (scene.composition) content = '<canvas class="studio-composition-canvas" width="1920" height="1080" role="img" aria-label="' + esc(scene.title) + '"></canvas>' +
      (image && scene.imageRequired ? '<img class="studio-composition-art" alt="" data-media="' + image.key + '">' : '');
    else content = (image ? '<img alt="' + esc(scene.title) + '" data-media="' + image.key + '">' :
      '<div class="studio-gallery-placeholder">' + t('图片将在制作视频时自动生成', 'Artwork is generated automatically during video production') + '</div>') +
      '<div class="studio-gallery-copy">' + esc(scene.screenText || scene.title) + '</div><p class="studio-gallery-caption" data-gallery-caption aria-live="off"></p>';
    return '<div class="studio-gallery-media" aria-label="' + t('监看器画面', 'Monitor Viewer') + '"><div class="studio-gallery-visual"' +
      (scene ? ' data-camera="' + esc(scene.camera) + '"' : '') + '><div class="studio-gallery-frame">' + content + '</div></div></div>';
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
      var artifacts = scene.artifacts || {}, image = artifacts.image, voice = artifacts.voice;
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
        t('模板预填受众、目标、视觉、时长和配乐，保留已选声音与语速。不会自动保存或生成。', 'Templates prefill audience, goal, visuals, duration and music, preserving voice and rate. They never save or generate automatically.') + '</p></section>' +
        field(t('目标受众', 'Audience'), 'audience', project.brief.audience, false, 300) +
        field(t('希望观众理解或采取什么行动', 'Viewer Goal'), 'goal', project.brief.goal, true, 500) +
        field(t('视觉与叙事方向', 'Visual and Narrative Direction'), 'style', project.brief.style, true, 1200) +
        '<div class="studio-grid">' + field(t('目标时长（秒，30–600）', 'Target Duration (Seconds, 30–600)'), 'seconds', project.brief.seconds) +
        field(t('语速（150–300）', 'Voice Rate (150–300)'), 'voiceRate', project.brief.voiceRate) +
        select(t('本机声音', 'Local Voice'), 'voice', project.brief.voice, [['Yue (Premium)', '月 / Yue Premium'], ['Lili (Premium)', '莉莉 / Lili Premium'], ['Tingting', '婷婷 / Tingting']]) +
        select(t('原创配乐', 'Original Music'), 'music', project.brief.music, [['bright', t('轻快器乐', 'Bright Instrumental')], ['none', t('无配乐', 'No Music')]]) + '</div>' +
        '<details><summary>' + t('查看发送给 Copilot 的全文来源', 'Inspect Full Article Context') + '</summary><pre>' + esc(project.source.text) + '</pre></details>';
    } else if (step === 2) {
      planning = project.jobs.some(function (job) { return job.kind === 'plan' && ['queued', 'running'].indexOf(job.status) >= 0; });
      html += '<div class="studio-workbench-header">' +
        button(planning ? t('分镜生成中…', 'Generating Storyboard…') : project.scenes.length ? t('重新生成分镜', 'Regenerate Storyboard') : t('生成分镜', 'Generate Storyboard'), 'plan', null, !project.scenes.length, busy || dirty) +
        (project.scenes.length ? button(assetPreparationLabel(), 'prepare-assets', null, false, busy) : '') +
        (project.scenes.length ? button(productionLabel(), 'produce', null, true, busy) : '') +
        (project.currentExport ? button(t('预览 / 下载成片', 'Preview / Download Film'), 'view-export') : '') +
        '<small class="studio-generation-note">' +
        t('分镜设计使用Copilot云端，可能消耗额度。', 'Storyboard design uses Copilot cloud; credits may apply.') + '</small>';
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
        var voice = scene.artifacts.voice, clip = scene.artifacts.clip;
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
        '<p>' + t('成片在中央监看器播放，使用上方工具栏导出或下载。', 'Play the film in the central monitor; export or download from the toolbar above.') + '</p>';
      if (!project.canExport) html += '<p class="studio-warning">' + t('请先完成所有变更镜头的渲染。', 'Render all changed scenes first.') + '</p>';
    }
    if (step !== 2) html = workflowToolbar(busy) + gallery(busy, html);
    stage.innerHTML = html;
    if (advancedOpen) stage.querySelectorAll('.studio-advanced-tools').forEach(function (node) { node.open = true; });
    if (adjustmentOpen) stage.querySelectorAll('.studio-visual-adjustment').forEach(function (node) { node.open = true; });
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
  async function media(key) {
    if (urls[key]) return urls[key];
    if (!mediaRequests[key]) {
      mediaRequests[key] = request(project.id + '/media?key=' + key, null, true).then(function (blob) {
        urls[key] = URL.createObjectURL(blob); return urls[key];
      }).finally(function () { delete mediaRequests[key]; });
    }
    return mediaRequests[key];
  }
  async function hydrate() {
    var nodes = stage.querySelectorAll('[data-media]'), i, node, audio, source;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (node.closest('[hidden]') || node.hasAttribute('data-hydrated')) continue;
      source = await media(node.getAttribute('data-media'));
      if (!node.isConnected || node.closest('[hidden]') || node.hasAttribute('data-hydrated')) continue;
      node.src = source;
      node.setAttribute('data-hydrated', '');
      if (node.classList.contains('studio-composition-art')) {
        await node.decode();
        if (node.isConnected && !node.closest('[hidden]')) paintComposition(galleryScene(), simulation.duration ? simulation.elapsed / simulation.duration : 0);
      } else if (node.tagName === 'AUDIO') {
        node.addEventListener('play', function () { stopSimulation(); });
      } else if (node.tagName === 'VIDEO' && node.hasAttribute('data-voice')) {
        audio = new Audio(await media(node.getAttribute('data-voice')));
        bindPreview(node, audio);
      }
      if (node.tagName === 'VIDEO' && node.hasAttribute('data-monitor')) bindMonitor(node);
    }
  }
  function pauseStageMedia() {
    stage.querySelectorAll('audio, video').forEach(function (node) { node.pause(); });
  }
  function galleryScene() {
    return project.scenes.find(function (scene) { return scene.id === galleryId; });
  }
  function paintComposition(scene, progress) {
    var slide, canvas, image, context;
    if (!scene || !scene.composition) return;
    slide = stage.querySelector('[data-gallery-slide="' + scene.id + '"]');
    if (!slide || slide.hidden) return;
    canvas = slide.querySelector('.studio-composition-canvas');
    if (!canvas) return;
    context = canvas.getContext('2d');
    if (!context) throw new Error(t('浏览器无法创建画面预览。', 'The browser could not create the composition preview.'));
    image = slide.querySelector('.studio-composition-art');
    window.KHVideoComposition.draw(context, scene, progress, image, scene.artifacts.voice ? scene.artifacts.voice.cues : [], sceneDuration(scene));
  }
  function selectGallery(id, keepSimulation) {
    var index = project.scenes.findIndex(function (scene) { return scene.id === id; });
    var strip, thumb;
    if (index < 0) return;
    if (!keepSimulation) { stopSimulation(); pauseStageMedia(); }
    galleryId = id;
    localStorage.setItem('kh-video-gallery-' + project.id, id);
    stage.querySelectorAll('[data-gallery-slide]').forEach(function (node) { node.hidden = node.getAttribute('data-gallery-slide') !== id; });
    stage.querySelectorAll('[data-render-inspector]').forEach(function (node) { node.hidden = node.getAttribute('data-render-inspector') !== id; });
    stage.querySelectorAll('[data-action="gallery-select"]').forEach(function (node) {
      if (node.getAttribute('data-scene') === id) node.setAttribute('aria-current', 'true');
      else node.removeAttribute('aria-current');
    });
    document.getElementById('studio-gallery-position').textContent = (index + 1) + ' / ' + project.scenes.length;
    stage.querySelector('[data-action="gallery-prev"]').disabled = index === 0;
    stage.querySelector('[data-action="gallery-next"]').disabled = index === project.scenes.length - 1;
    strip = stage.querySelector('.studio-sequence-scroll');
    thumb = strip.querySelector('[aria-current]');
    strip.scrollLeft = thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
    syncSequence(0);
    paintComposition(galleryScene(), 0);
    simulationControls();
    hydrate().catch(function (error) { say(error.message, true); });
  }
  function syncSequence(elapsed, entireFilm) {
    var content = stage.querySelector('.studio-sequence-content'), before = 0, total = 0, found = false;
    var readout, label;
    if (!content) return;
    project.scenes.forEach(function (scene) {
      var duration = sceneDuration(scene);
      if (scene.id === galleryId) found = true;
      if (!found && !entireFilm) before += duration;
      total += duration;
    });
    content.querySelector('.studio-sequence-playhead').style.left = (before + elapsed) * Number(content.getAttribute('data-sequence-scale')) + 'px';
    readout = document.getElementById('studio-sequence-time');
    label = timeLabel(before + elapsed) + ' / ' + timeLabel(total);
    if (readout.textContent !== label) readout.textContent = label;
  }
  function timeLabel(seconds) {
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds) % 60).padStart(2, '0');
  }
  function simulationStatus(value) {
    var node = document.getElementById('studio-simulation-status');
    if (node) { node.textContent = value; node.title = value; }
  }
  function simulationControls() {
    var toggle = stage.querySelector('[data-action="simulate-toggle"]');
    var stop = stage.querySelector('[data-action="simulate-stop"]');
    var meter = document.getElementById('studio-simulation-progress');
    var elapsed = document.getElementById('studio-simulation-time'), label, video = monitorVideo();
    if (!toggle) return;
    if (video) {
      label = video.paused ? t('播放', 'Play') : t('暂停', 'Pause');
      toggle.textContent = label;
      toggle.disabled = active() || dirty || video.readyState === 0;
      stop.disabled = video.paused && video.currentTime === 0;
      meter.max = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      meter.value = Math.min(video.currentTime, meter.max);
      elapsed.textContent = timeLabel(video.currentTime) + ' / ' + timeLabel(meter.max);
      syncSequence(video.currentTime, video.hasAttribute('data-film'));
      simulationStatus(video.hasAttribute('data-film') ? t('成片播放 · 含最终混音', 'Film playback · final audio mix') : t('渲染片段播放 · 同步当前镜头配音', 'Rendered scene playback · synchronized narration'));
      return;
    }
    label = simulation.loading ? t('准备中…', 'Loading…') :
      simulation.playing ? t('暂停', 'Pause') :
      simulation.paused ? t('继续', 'Resume') : t('播放预演', 'Play');
    if (toggle.textContent !== label) toggle.textContent = label;
    toggle.disabled = active() || dirty || simulation.loading || !project || !project.scenes.length;
    stop.disabled = !simulation.playing && !simulation.paused && !simulation.loading;
    meter.max = simulation.duration || 1;
    meter.value = Math.min(simulation.elapsed, simulation.duration);
    elapsed.textContent = timeLabel(simulation.elapsed) + ' / ' + timeLabel(simulation.duration);
    syncSequence(simulation.elapsed);
  }
  function stopSimulation() {
    simulation.token++;
    simulation.playing = false; simulation.paused = false; simulation.loading = false;
    if (simulation.frame) cancelAnimationFrame(simulation.frame);
    if (simulation.audio) simulation.audio.pause();
    simulation.frame = null; simulation.audio = null; simulation.elapsed = 0; simulation.duration = 0;
    stage.querySelectorAll('.is-simulating, .is-simulation-paused').forEach(function (node) {
      node.classList.remove('is-simulating', 'is-simulation-paused');
    });
    stage.querySelectorAll('[data-gallery-caption]').forEach(function (node) { node.textContent = ''; });
    try { if (project) paintComposition(galleryScene(), 0); }
    catch (error) { say(error.message, true); }
    simulationStatus(t('预演已停止。', 'Simulation stopped.'));
    simulationControls();
  }
  function simulationError(error, token) {
    if (token !== simulation.token) return;
    stopSimulation();
    simulationStatus(t('预演已停止：', 'Simulation stopped: ') + error.message);
    say(error.message, true);
  }
  async function advanceSimulation(token) {
    var index;
    if (token !== simulation.token || !simulation.playing) return;
    simulation.playing = false;
    if (simulation.frame) cancelAnimationFrame(simulation.frame);
    if (simulation.audio) simulation.audio.pause();
    index = project.scenes.findIndex(function (scene) { return scene.id === galleryId; });
    if (index === project.scenes.length - 1) {
      stopSimulation(); simulationStatus(t('预演完成；没有生成素材或渲染视频。', 'Simulation complete. No media was generated or rendered.')); return;
    }
    selectGallery(project.scenes[index + 1].id, true);
    await playSimulation(false);
  }
  function simulationFrame(token, scene, slide) {
    var caption = slide.querySelector('[data-gallery-caption]'), cue;
    if (token !== simulation.token || !simulation.playing) return;
    simulation.elapsed = simulation.audio ? simulation.audio.currentTime : (performance.now() - simulation.started) / 1000;
    if (simulation.audio && caption) {
      cue = scene.artifacts.voice.cues.find(function (entry) {
        return simulation.elapsed >= entry.start && simulation.elapsed < entry.start + entry.duration;
      });
      if (caption.textContent !== (cue ? cue.text : '')) caption.textContent = cue ? cue.text : '';
    }
    try { paintComposition(scene, Math.min(1, simulation.elapsed / simulation.duration)); }
    catch (error) { simulationError(error, token); return; }
    simulationControls();
    if (!simulation.audio && simulation.elapsed >= simulation.duration) {
      advanceSimulation(token).catch(function (error) { simulationError(error, simulation.token); }); return;
    }
    simulation.frame = requestAnimationFrame(function () { simulationFrame(token, scene, slide); });
  }
  async function playSimulation(resume) {
    var scene = galleryScene(), voice = scene.artifacts && scene.artifacts.voice;
    var slide = stage.querySelector('[data-gallery-slide="' + scene.id + '"]');
    var token = ++simulation.token, elapsed = resume ? simulation.elapsed : 0, audio, source;
    pauseStageMedia();
    simulation.playing = false; simulation.paused = false; simulation.loading = true;
    simulation.elapsed = elapsed;
    simulation.duration = sceneDuration(scene);
    simulationControls(); simulationStatus(t('正在准备预演；不会触发生成。', 'Preparing simulation without generation.'));
    try {
      await hydrate();
      if (token !== simulation.token) return;
      if (voice) {
        source = await media(voice.key);
        if (token !== simulation.token) return;
        audio = document.getElementById('studio-simulation-audio');
        audio.src = source; audio.currentTime = elapsed;
        simulation.audio = audio;
        audio.onended = function () { advanceSimulation(token).catch(function (error) { simulationError(error, simulation.token); }); };
        audio.onerror = function () { simulationError(new Error(t('已有配音无法播放，请检查素材。', 'Existing narration could not be played. Check the asset.')), token); };
        await audio.play();
        if (token !== simulation.token) { audio.pause(); return; }
      } else simulation.audio = null;
      simulation.loading = false; simulation.playing = true;
      simulation.started = performance.now() - elapsed * 1000;
      slide.style.setProperty('--studio-shot-duration', simulation.duration + 's');
      slide.classList.add('is-simulating');
      slide.classList.remove('is-simulation-paused');
      simulationStatus(voice ? t('预演中：使用已有配音，不含最终配乐。', 'Simulating with existing narration; final music is excluded.') :
        t('静音预演：配音未就绪，时长为估算；未生成或朗读旁白。', 'Silent simulation: narration is unavailable and timing is estimated. No speech is generated.'));
      simulationFrame(token, scene, slide);
    } catch (error) { simulationError(error, token); }
  }
  function pauseSimulation() {
    simulation.elapsed = simulation.audio ? simulation.audio.currentTime : (performance.now() - simulation.started) / 1000;
    simulation.playing = false; simulation.paused = true;
    if (simulation.frame) cancelAnimationFrame(simulation.frame);
    if (simulation.audio) simulation.audio.pause();
    stage.querySelector('[data-gallery-slide="' + galleryId + '"]').classList.add('is-simulation-paused');
    simulationStatus(t('预演已暂停。', 'Simulation paused.')); simulationControls();
  }
  function bindPreview(video, audio) {
    video.addEventListener('play', function () {
      audio.currentTime = video.currentTime;
      audio.play().catch(function (error) { video.pause(); say(error.message, true); });
    });
    video.addEventListener('pause', function () { audio.pause(); });
    video.addEventListener('seeked', function () { audio.currentTime = video.currentTime; });
    video.addEventListener('ended', function () { audio.pause(); });
    video.addEventListener('ratechange', function () { audio.playbackRate = video.playbackRate; });
  }
  function monitorVideo() {
    return stage.querySelector('[data-gallery-slide]:not([hidden]) video[data-monitor]');
  }
  function bindMonitor(video) {
    function update() { if (video === monitorVideo()) simulationControls(); }
    function ready() {
      var before = 0;
      if (video.hasAttribute('data-film')) {
        project.scenes.some(function (scene) {
          if (scene.id === video.closest('[data-gallery-slide]').getAttribute('data-gallery-slide')) return true;
          before += sceneDuration(scene); return false;
        });
        video.currentTime = Math.min(before, video.duration);
      }
      update();
    }
    ['timeupdate', 'play', 'pause', 'ended', 'loadeddata'].forEach(function (event) { video.addEventListener(event, update); });
    video.addEventListener('loadedmetadata', ready);
    if (video.readyState >= 1) ready();
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
    var model, item, index, temporary, anchor, file, assetKinds, drafts, video, jobBody, progress;
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
        model = selectedModel;
        if (copilotState !== 'connected' || !models.some(function (entry) { return entry.id === model; }))
          throw new Error(t('请在右上角选择可用的 Copilot 模型。', 'Select an available Copilot model at the top right.'));
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
    if (target && !target.disabled) invoke(target.getAttribute('data-action'), target.getAttribute('data-scene') || target.getAttribute('data-template'));
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
    if (event.key === 'Escape') { stopSimulation(); simulationStatus(t('预演已停止。', 'Simulation stopped.')); return; }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    index = project.scenes.findIndex(function (scene) { return scene.id === galleryId; }) + (event.key === 'ArrowLeft' ? -1 : 1);
    if (index >= 0 && index < project.scenes.length) { event.preventDefault(); selectGallery(project.scenes[index].id); }
  });
  document.getElementById('studio-reload').addEventListener('click', function () {
    if (dirty && !window.confirm(t('放弃未保存编辑并载入保存状态？', 'Discard unsaved edits and reload saved state?'))) return;
    request(project.id).then(function (saved) { project = saved; dirty = false; step = restoredStep(project.cursor); render(); }).catch(function (error) { say(error.message, true); });
  });
  document.getElementById('studio-lang').addEventListener('click', function () {
    if (dirty) { say(t('请先保存编辑，再切换语言。', 'Save edits before changing language.'), true); return; }
    language = language === 'en' ? 'zh' : 'en'; localStorage.setItem('lang', language); applyLanguage(); render();
  });
  document.getElementById('studio-copilot-status').addEventListener('click', function () { detectCopilot(); });
  document.getElementById('studio-copilot-model').addEventListener('change', function (event) {
    var id = event.target.value;
    if (copilotState !== 'connected' || !models.some(function (model) { return model.id === id; })) {
      say(t('请选择目录中的可用模型。', 'Select an available model from the catalog.'), true); updateCopilotUI(); return;
    }
    selectedModel = id; localStorage.setItem('kh-video-model', id); updateCopilotUI();
  });
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
  applyLanguage();
  if (!localMode) { copilotState = 'local-only'; updateCopilotUI(); document.getElementById('studio-local').hidden = false; return; }
  if (!article || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(article)) { say(t('请从文章顶部的视频工作室入口打开。', 'Open Video Studio from an article toolbar.'), true); detectCopilot(); return; }
  Promise.all([request('open', { article: article }), request('capabilities')]).then(function (results) {
    var capability = results[1];
    project = results[0]; step = restoredStep(project.cursor); workspace.hidden = false;
    document.getElementById('studio-capabilities').textContent =
      t('本地生图 / 配音 / 渲染：', 'Local Image / Voice / Renderer: ') +
      [capability.image, capability.voice, capability.renderer].map(function (ready) { return ready ? t('就绪', 'Ready') : t('需准备', 'Setup Needed'); }).join(' / ');
    render();
    detectCopilot();
  }).catch(function (error) { say(error.message, true); document.getElementById('studio-local').hidden = false; detectCopilot(); });
});

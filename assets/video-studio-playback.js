(function (root) {
  'use strict';

  function createPlayback(ctx) {
    var simulation = ctx.simulation;

    function t(zh, en) { return ctx.t(zh, en); }
    function say(value, error) { ctx.say(value, error); }

    async function media(key) {
      var urls = ctx.urls, mediaRequests = ctx.mediaRequests, project = ctx.getProject();
      if (urls[key]) return urls[key];
      if (!mediaRequests[key]) {
        mediaRequests[key] = ctx.request(project.id + '/media?key=' + key, null, true).then(function (blob) {
          urls[key] = URL.createObjectURL(blob);
          return urls[key];
        }).finally(function () {
          delete mediaRequests[key];
        });
      }
      return mediaRequests[key];
    }

    function pauseStageMedia() {
      ctx.stage.querySelectorAll('audio, video').forEach(function (node) { node.pause(); });
    }

    function galleryScene() {
      var project = ctx.getProject(), galleryId = ctx.getGalleryId();
      return project && project.scenes.find(function (scene) { return scene.id === galleryId; });
    }

    function sceneDuration(scene) {
      var project = ctx.getProject();
      var voice = scene.artifacts && scene.artifacts.voice;
      return voice ? voice.duration : Math.max(3, scene.narration.length / (5 * project.brief.voiceRate / 235) + 1);
    }

    function timeLabel(seconds) {
      return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds) % 60).padStart(2, '0');
    }

    function paintComposition(scene, progress) {
      var slide, canvas, image, context;
      if (!scene || !scene.composition) return;
      slide = ctx.stage.querySelector('[data-gallery-slide="' + scene.id + '"]');
      if (!slide || slide.hidden) return;
      canvas = slide.querySelector('.studio-composition-canvas');
      if (!canvas) return;
      context = canvas.getContext('2d');
      if (!context) throw new Error(t('浏览器无法创建画面预览。', 'The browser could not create the composition preview.'));
      image = slide.querySelector('.studio-composition-art');
      root.KHVideoComposition.draw(context, scene, progress, image, scene.artifacts.voice ? scene.artifacts.voice.cues : [], sceneDuration(scene));
    }

    function syncSequence(elapsed, entireFilm) {
      var project = ctx.getProject(), galleryId = ctx.getGalleryId();
      var content = ctx.stage.querySelector('.studio-sequence-content'), before = 0, total = 0, found = false;
      var readout, label;
      if (!content || !project) return;
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

    function simulationStatus(value) {
      var node = document.getElementById('studio-simulation-status');
      if (node) { node.textContent = value; node.title = value; }
    }

    function monitorVideo() {
      return ctx.stage.querySelector('[data-gallery-slide]:not([hidden]) video[data-monitor]');
    }

    function simulationControls() {
      var project = ctx.getProject();
      var toggle = ctx.stage.querySelector('[data-action="simulate-toggle"]');
      var stop = ctx.stage.querySelector('[data-action="simulate-stop"]');
      var meter = document.getElementById('studio-simulation-progress');
      var elapsed = document.getElementById('studio-simulation-time'), label, video = monitorVideo();
      if (!toggle) return;
      if (video) {
        label = video.paused ? t('播放', 'Play') : t('暂停', 'Pause');
        toggle.textContent = label;
        toggle.disabled = ctx.active() || ctx.isDirty() || video.readyState === 0;
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
      toggle.disabled = ctx.active() || ctx.isDirty() || simulation.loading || !project || !project.scenes.length;
      stop.disabled = !simulation.playing && !simulation.paused && !simulation.loading;
      meter.max = simulation.duration || 1;
      meter.value = Math.min(simulation.elapsed, simulation.duration);
      elapsed.textContent = timeLabel(simulation.elapsed) + ' / ' + timeLabel(simulation.duration);
      syncSequence(simulation.elapsed);
    }

    function stopSimulation() {
      var project = ctx.getProject();
      simulation.token++;
      simulation.playing = false; simulation.paused = false; simulation.loading = false;
      if (simulation.frame) cancelAnimationFrame(simulation.frame);
      if (simulation.audio) simulation.audio.pause();
      if (root.KHVideoBgm && root.KHVideoBgm.stopPreviewBgm) root.KHVideoBgm.stopPreviewBgm();
      simulation.frame = null; simulation.audio = null; simulation.elapsed = 0; simulation.duration = 0;
      ctx.stage.querySelectorAll('.is-simulating, .is-simulation-paused').forEach(function (node) {
        node.classList.remove('is-simulating', 'is-simulation-paused');
      });
      ctx.stage.querySelectorAll('[data-gallery-caption]').forEach(function (node) { node.textContent = ''; });
      try { if (project) paintComposition(galleryScene(), 0.5); }
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

    function selectGallery(id, keepSimulation) {
      var project = ctx.getProject();
      var index = project.scenes.findIndex(function (scene) { return scene.id === id; });
      var strip, thumb;
      if (index < 0) return;
      if (!keepSimulation) { stopSimulation(); pauseStageMedia(); }
      ctx.setGalleryId(id);
      localStorage.setItem('kh-video-gallery-' + project.id, id);
      ctx.stage.querySelectorAll('[data-gallery-slide]').forEach(function (node) { node.hidden = node.getAttribute('data-gallery-slide') !== id; });
      ctx.stage.querySelectorAll('[data-render-inspector]').forEach(function (node) { node.hidden = node.getAttribute('data-render-inspector') !== id; });
      ctx.stage.querySelectorAll('[data-action="gallery-select"]').forEach(function (node) {
        if (node.getAttribute('data-scene') === id) node.setAttribute('aria-current', 'true');
        else node.removeAttribute('aria-current');
      });
      document.getElementById('studio-gallery-position').textContent = (index + 1) + ' / ' + project.scenes.length;
      ctx.stage.querySelector('[data-action="gallery-prev"]').disabled = index === 0;
      ctx.stage.querySelector('[data-action="gallery-next"]').disabled = index === project.scenes.length - 1;
      strip = ctx.stage.querySelector('.studio-sequence-scroll');
      thumb = strip.querySelector('[aria-current]');
      strip.scrollLeft = thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
      syncSequence(0);
      paintComposition(galleryScene(), 0.5);
      simulationControls();
      hydrate().catch(function (error) { say(error.message, true); });
    }

    async function advanceSimulation(token) {
      var project = ctx.getProject(), galleryId = ctx.getGalleryId(), index;
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
      var slide = ctx.stage.querySelector('[data-gallery-slide="' + scene.id + '"]');
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
        var projectRef = ctx.getProject();
        var musicSetting = projectRef && projectRef.brief && projectRef.brief.music;
        if (root.KHVideoBgm && root.KHVideoBgm.startPreviewBgm && musicSetting && musicSetting !== 'none') {
          await root.KHVideoBgm.startPreviewBgm(musicSetting, !!voice);
          if (token !== simulation.token) {
            if (root.KHVideoBgm && root.KHVideoBgm.stopPreviewBgm) root.KHVideoBgm.stopPreviewBgm();
            return;
          }
        }
        simulationStatus(voice ? t('预演中：使用已有配音' + (musicSetting && musicSetting !== 'none' ? ' + 实时合成配乐' : '') + '。', 'Simulating with existing narration' + (musicSetting && musicSetting !== 'none' ? ' + live synth BGM' : '') + '.') :
          t('预演中：画布动态渲染' + (musicSetting && musicSetting !== 'none' ? ' + 实时合成背景配乐' : '（静音预演）') + '。', 'Simulating canvas motion' + (musicSetting && musicSetting !== 'none' ? ' + live synth BGM' : ' (silent)') + '.'));
        simulationFrame(token, scene, slide);
      } catch (error) { simulationError(error, token); }
    }

    function pauseSimulation() {
      var galleryId = ctx.getGalleryId();
      simulation.elapsed = simulation.audio ? simulation.audio.currentTime : (performance.now() - simulation.started) / 1000;
      simulation.playing = false; simulation.paused = true;
      if (simulation.frame) cancelAnimationFrame(simulation.frame);
      if (simulation.audio) simulation.audio.pause();
      if (root.KHVideoBgm && root.KHVideoBgm.stopPreviewBgm) root.KHVideoBgm.stopPreviewBgm();
      ctx.stage.querySelector('[data-gallery-slide="' + galleryId + '"]').classList.add('is-simulation-paused');
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

    function bindMonitor(video) {
      function update() { if (video === monitorVideo()) simulationControls(); }
      function ready() {
        var project = ctx.getProject(), before = 0;
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

    async function hydrate() {
      var nodes = ctx.stage.querySelectorAll('[data-media]'), i, node, audio, source;
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

    function vgBriefCatalogSection(busy) {
      var vg = root.KHVideoGenerator, project = ctx.getProject();
      if (!vg || !project) return '';
      var currentScenario = project.brief.scenario || 'presenter';
      var currentPack = project.brief.stylePack || (currentScenario === 'product' ? '03-A' : '01-A');
      var esc = ctx.esc;
      return '<input type="hidden" data-field="scenario" value="' + esc(currentScenario) + '">' +
        '<input type="hidden" data-field="stylePack" value="' + esc(currentPack) + '">' +
        '<details class="studio-vg-catalog"><summary>' +
        t('Video-Generator 0.2 双路线与 Adu/MotionGit 风格目录（11 款）', 'Video-Generator 0.2 Dual Scenarios & Adu/MotionGit Style Catalog (11 Packs)') +
        '</summary><p class="studio-muted">' +
        t('集成自 zaz8848/Video-Generator：统一真人口播与无人物产品介绍双路线，点击即可将对应风格包与构图规范注入当前视频需求。', 'Integrated from zaz8848/Video-Generator: unified presenter & product workflows with 11 Adu/MotionGit style packs.') +
        '</p><div class="studio-grid">' + vg.scenarios.map(function (sc) {
          return '<button type="button" class="studio-vg-card" data-action="vg-scenario" data-vg-scenario="' + esc(sc.id) +
            '" aria-pressed="' + String(currentScenario === sc.id) + '"' + (busy ? ' disabled' : '') + '><span class="studio-vg-badge">' +
            esc(t(sc.badge[0], sc.badge[1])) + '</span><strong>' + esc(t(sc.name[0], sc.name[1])) + '</strong><small>' +
            esc(t(sc.summary[0], sc.summary[1])) + '</small></button>';
        }).join('') + '</div><div class="studio-vg-pack-grid">' + vg.stylePacks.map(function (pack) {
          return '<button type="button" class="studio-vg-pack" data-action="vg-pack" data-vg-pack="' + esc(pack.id) +
            '" aria-pressed="' + String(currentPack === pack.id) + '"' + (busy ? ' disabled' : '') + '>' +
            '<span class="studio-vg-swatch" style="background:' + esc(pack.palette.background) + ';border-color:' + esc(pack.palette.accent) + '"><i style="background:' + esc(pack.palette.accent) + '"></i></span>' +
            '<strong>' + esc(t(pack.title[0], pack.title[1])) + '</strong><code>' + esc(pack.selection) + '</code><small>' +
            esc(t(pack.summary[0], pack.summary[1])) + '</small></button>';
        }).join('') + '</div></details>';
    }

    function vgScenePresetSection(busy) {
      var vg = root.KHVideoGenerator, esc = ctx.esc;
      if (!vg) return '';
      var currentScene = galleryScene();
      var project = ctx.getProject();
      var scenes = project && project.scenes ? project.scenes : [];
      var idx = currentScene ? scenes.indexOf(currentScene) : 0;
      var activePreset = currentScene && vg.detectScenePreset ? vg.detectScenePreset(currentScene, Math.max(0, idx), scenes.length) : '';
      return '<div class="studio-vg-presets" role="group" aria-label="' + t('TPL 镜头编舞模板快捷切换', 'TPL Scene Choreography Presets') + '">' +
        '<div class="studio-preset-heading"><span class="studio-pill-label">' + t('9 类 TPL 镜头编舞模板（一键实时套用）', '9 TPL Choreography Presets') + '</span></div>' +
        '<div class="studio-vg-preset-pills">' + vg.scenePresets.map(function (preset) {
          var shortLabel = t(preset.name[0], preset.name[1]).replace(/\s*\(TPL\.[a-z]+\)/i, '');
          return '<button type="button" class="studio-vg-preset-btn" data-action="vg-scene-preset" data-preset="' + esc(preset.id) + '"' +
            ' aria-pressed="' + String(activePreset === preset.id) + '" title="' + esc(t(preset.summary[0], preset.summary[1])) + '"' +
            (busy ? ' disabled' : '') + '>' + esc(shortLabel) + '</button>';
        }).join('') + '</div></div>';
    }

    function cleanDisplayTitle(raw) {
      return String(raw || '').split('||')[0]
        .replace(/:::?[a-z-]+(?:\s*\{[^}]*\})?/gi, ' ')
        .replace(/#[a-z0-9_-]+/gi, ' ')
        .replace(/^(?:\d+[\.\s、/-]*)+/, '')
        .replace(/\s+/g, ' ').trim() || String(raw || '');
    }

    function sceneBin() {
      var project = ctx.getProject(), galleryId = ctx.getGalleryId(), esc = ctx.esc;
      return '<aside class="studio-scene-bin" aria-label="' + t('镜头列表', 'Scene Bin') + '"><header class="studio-panel-heading"><strong>' +
        t('素材 / 镜头', 'Media / Scenes') + '</strong><span>' + project.scenes.length + '</span></header>' +
        '<div class="studio-project-source"><small>' + t('文章来源', 'Article Source') + '</small><strong>' + esc(project.source.title) +
        '</strong><a href="posts/' + esc(project.source.slug) + '/" target="_blank" rel="noopener">' + t('查看原文 ↗', 'Open Article ↗') + '</a></div><div class="studio-scene-list">' +
        project.scenes.map(function (scene, index) {
          var image = scene.artifacts && scene.artifacts.image, voice = scene.artifacts && scene.artifacts.voice;
          var dispTitle = cleanDisplayTitle(scene.title);
          return '<button type="button" class="studio-bin-scene" data-action="gallery-select" data-scene="' + esc(scene.id) + '"' +
            (scene.id === galleryId ? ' aria-current="true"' : '') + '><span class="studio-bin-number">' + String(index + 1).padStart(2, '0') + '</span>' +
            (image ? '<img alt="" data-media="' + image.key + '">' : '<span class="studio-bin-placeholder">—</span>') +
            '<span class="studio-bin-info"><strong>' + esc(dispTitle) + '</strong><small>' +
            (scene.imageRequired === false ? t('图形画面', 'Graphics') : image ? t('图就绪', 'Image ready') : t('缺图片', 'No image')) + ' · ' +
            (voice ? t('音就绪', 'Voice ready') : t('缺配音', 'No voice')) + '</small></span></button>';
        }).join('') + '</div></aside>';
    }

    function sequence() {
      var project = ctx.getProject(), galleryId = ctx.getGalleryId(), esc = ctx.esc;
      var total = project.scenes.reduce(function (sum, scene) { return sum + sceneDuration(scene); }, 0);
      var scale = 16, ruler = '', video = '', audio = '', seconds;
      for (seconds = 0; seconds < total; seconds += 10) {
        ruler += '<span style="left:' + (seconds * scale) + 'px">' + timeLabel(seconds) + '</span>';
      }
      project.scenes.forEach(function (scene, index) {
        var artifacts = scene.artifacts || {}, duration = sceneDuration(scene), width = duration * scale;
        var dispTitle = cleanDisplayTitle(scene.title);
        var attributes = ' data-action="gallery-select" data-scene="' + esc(scene.id) + '"' +
          (scene.id === galleryId ? ' aria-current="true"' : '') + ' style="width:' + width + 'px"';
        video += '<button type="button" class="studio-gallery-thumb"' + attributes + ' aria-label="' +
          esc((index + 1) + '. ' + dispTitle) + '">' +
          (artifacts.image ? '<img alt="" data-media="' + artifacts.image.key + '">' : '<span class="studio-thumb-placeholder">' + (index + 1) + '</span>') +
          '<span>' + esc((index + 1) + '. ' + dispTitle) + '</span></button>';
        audio += '<button type="button" class="studio-audio-clip' + (artifacts.voice ? ' is-ready' : '') + '"' + attributes +
          ' aria-label="' + esc(t('配音：', 'Voice: ') + dispTitle) + '">' +
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

    function monitorContent(scene, step) {
      var project = ctx.getProject(), esc = ctx.esc;
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

    function batchMeter(job, kinds) {
      var progress = job.progress, esc = ctx.esc;
      var percent = progress ? Math.round(progress.completed / progress.total * 100) : null;
      var statuses = {
        queued: ['排队中', 'Queued'], running: ['生成中', 'Generating'], done: ['已完成', 'Completed'],
        failed: ['生成失败', 'Failed'], cancelled: ['已取消', 'Cancelled'], interrupted: ['服务中断', 'Interrupted']
      };
      var status = statuses[job.status];
      if (job.status === 'running' && job.kind === 'produce') status = ['制作中', 'Producing'];
      if (job.status === 'running' && job.kind === 'clips') status = ['渲染中', 'Rendering'];
      var summary = batchProgress(job, kinds);
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

    function batchProgress(job, kinds) {
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

    return {
      media: media,
      hydrate: hydrate,
      pauseStageMedia: pauseStageMedia,
      galleryScene: galleryScene,
      sceneDuration: sceneDuration,
      timeLabel: timeLabel,
      paintComposition: paintComposition,
      selectGallery: selectGallery,
      syncSequence: syncSequence,
      simulationStatus: simulationStatus,
      simulationControls: simulationControls,
      stopSimulation: stopSimulation,
      playSimulation: playSimulation,
      pauseSimulation: pauseSimulation,
      monitorVideo: monitorVideo,
      vgBriefCatalogSection: vgBriefCatalogSection,
      vgScenePresetSection: vgScenePresetSection,
      sceneBin: sceneBin,
      sequence: sequence,
      monitorContent: monitorContent,
      batchMeter: batchMeter
    };
  }

  root.KHVideoStudioPlayback = { createPlayback: createPlayback };
}(typeof globalThis === 'object' ? globalThis : this));

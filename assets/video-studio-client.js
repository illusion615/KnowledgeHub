(function (root) {
  'use strict';

  function createStudioClient(ctx) {
    var session = null, models = [], copilotState = 'checking', copilotError = '', copilotCheck = null;
    var selectedModel = localStorage.getItem('kh-video-model') || '';

    function t(zh, en) { return ctx.t(zh, en); }
    function esc(value) { return ctx.esc(value); }

    async function response(result) {
      var data, err;
      if (!result.ok) {
        try { data = await result.json(); } catch (_) { data = null; }
        if (result.status === 404 && (!data || !data.error)) {
          err = new Error(t('当前端口未启用本机视频工作室服务。', 'Local Video Studio service is not enabled on this port.'));
          err.code = 'BRIDGE_NOT_FOUND';
          throw err;
        }
        err = new Error(data && data.error && data.error.message || 'HTTP ' + result.status);
        err.code = data && data.error && data.error.code || 'HTTP_' + result.status;
        throw err;
      }
      return result;
    }

    async function ensureSession() {
      if (!session) {
        session = (async function () {
          if (root.KHCopilot && typeof root.KHCopilot.bootstrapInfo === 'function') {
            return root.KHCopilot.bootstrapInfo();
          }
          var boot = await response(await fetch('/api/copilot/bootstrap', { headers: { 'X-KH-Bootstrap': '1' }, credentials: 'same-origin' }));
          var data = await boot.json();
          return { csrf: data.csrf, base: '', session: data.session || null };
        })().catch(function (error) { session = null; throw error; });
      }
      return session;
    }

    async function request(path, body, binary) {
      var info = await ensureSession(), headers = { 'X-KH-CSRF': info.csrf, 'Content-Type': 'application/json' }, result;
      if (info.session) headers['X-KH-Session'] = info.session;
      result = await fetch((info.base || '') + '/api/copilot/studio/' + path, {
        method: body ? 'POST' : 'GET',
        credentials: info.base ? 'include' : 'same-origin',
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
      });
      if (result.status === 403) session = null;
      await response(result);
      return binary ? result.blob() : result.json();
    }

    function isAvailable() {
      return copilotState === 'connected' && models.some(function (model) { return model.id === selectedModel; });
    }

    function updateUI() {
      var status = document.getElementById('studio-copilot-status');
      var select = document.getElementById('studio-copilot-model');
      var error = document.getElementById('studio-copilot-error');
      var stage = ctx.stage;
      var labels = {
        checking: ['检测中', 'Checking'], connected: ['已连接', 'Connected'],
        'signed-out': ['未登录', 'Not Signed In'], 'no-models': ['暂无模型', 'No Models'],
        error: ['连接失败', 'Unavailable'], 'local-only': ['仅本机可用', 'Local Only']
      };
      var available = isAvailable(), busy = !!ctx.active(), pending = ctx.isPending(), dirty = ctx.isDirty(), project = ctx.getProject();
      var placeholder = copilotState === 'checking' ? t('正在读取模型…', 'Loading Models…') :
        selectedModel && models.length && !available ? t('原模型不可用，请重选', 'Previous Model Unavailable') : t('选择 Copilot 模型', 'Select Copilot Model');
      status.textContent = 'Copilot · ' + t(labels[copilotState][0], labels[copilotState][1]);
      status.setAttribute('data-state', copilotState);
      status.title = copilotError || t('重新检测已有登录与模型；不发送文章或提问。', 'Recheck existing login and models without sending an article or prompt.');
      status.setAttribute('aria-label', status.textContent + ' · ' + status.title);
      status.disabled = !ctx.localMode || copilotState === 'checking' || busy || pending;
      select.innerHTML = '<option value="">' + esc(placeholder) + '</option>' + models.map(function (model) {
        return '<option value="' + esc(model.id) + '"' + (model.id === selectedModel ? ' selected' : '') + '>' + esc(model.name || model.id) + '</option>';
      }).join('');
      select.disabled = copilotState !== 'connected' || !models.length || busy || pending;
      error.textContent = copilotError;
      error.hidden = !copilotError;
      stage.querySelectorAll('[data-action="plan"]').forEach(function (node) { node.disabled = !available || dirty || busy || pending; });
      stage.querySelectorAll('[data-action="direct"]').forEach(function (node) { node.disabled = !available || dirty || busy || pending || !project || !project.scenes.length; });
      stage.querySelectorAll('[data-action="produce"]').forEach(function (node) {
        node.textContent = ctx.productionLabel();
        node.disabled = busy || pending || !project || !project.scenes.length;
      });
      stage.querySelectorAll('[data-action="prepare-assets"]').forEach(function (node) {
        node.textContent = ctx.assetPreparationLabel();
        node.disabled = busy || pending || !project || !project.scenes.length;
      });
    }

    function detect() {
      if (!ctx.localMode || copilotCheck) return copilotCheck;
      copilotState = 'checking'; copilotError = ''; updateUI();
      copilotCheck = Promise.resolve().then(async function () {
        var result, localPanel;
        try {
          if (!root.KHCopilot) throw new Error(t('Copilot 组件未加载，请刷新页面。', 'The Copilot component did not load. Refresh the page.'));
          result = await root.KHCopilot.status();
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
          models = [];
          localPanel = document.getElementById('studio-local');
          if ((error && (error.code === 'BRIDGE_NOT_FOUND' || error.code === 'BRIDGE_OFFLINE')) || (localPanel && !localPanel.hidden && !ctx.getProject())) {
            copilotState = 'local-only';
            copilotError = '';
            if (localPanel) localPanel.hidden = false;
          } else {
            copilotState = 'error';
            copilotError = error.message;
          }
        } finally { copilotCheck = null; updateUI(); }
      });
      return copilotCheck;
    }

    function selectModel(id) {
      if (copilotState !== 'connected' || !models.some(function (model) { return model.id === id; })) {
        ctx.say(t('请选择目录中的可用模型。', 'Select an available model from the catalog.'), true);
        updateUI();
        return;
      }
      selectedModel = id;
      localStorage.setItem('kh-video-model', id);
      updateUI();
    }

    function requireModel() {
      if (!isAvailable()) throw new Error(t('请在右上角选择可用的 Copilot 模型。', 'Select an available Copilot model at the top right.'));
      return selectedModel;
    }

    function setLocalOnly() {
      copilotState = 'local-only';
      copilotError = '';
      updateUI();
      document.getElementById('studio-local').hidden = false;
    }

    return {
      request: request,
      updateUI: updateUI,
      detect: detect,
      selectModel: selectModel,
      requireModel: requireModel,
      setLocalOnly: setLocalOnly
    };
  }

  root.KHVideoStudioClient = { createStudioClient: createStudioClient };
}(typeof globalThis === 'object' ? globalThis : this));

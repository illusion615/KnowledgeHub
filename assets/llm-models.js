/* Shared, read-only model discovery for settings and the article assistant.
 * No inference, login, model download, provider fallback, or settings mutation.
 */
(function () {
  'use strict';
  function uniqueNames(items, pick) {
    if (!Array.isArray(items)) throw new Error('模型列表格式不受支持，请检查服务接口。');
    return Array.from(new Set(items.map(pick).filter(function (id) {
      return typeof id === 'string' && id.length > 0 && id.length <= 256 && !/[\u0000-\u001f\u007f]/.test(id);
    })));
  }
  var azureBoundary = 'Azure模型目录不等于可调用的部署列表；此处不提供部署切换，请在连接设置中手填已有部署名称。';
  window.KHModels = {
    // checkAzure is used only by the existing settings connection test. The
    // assistant never treats Azure catalog IDs as deployment IDs.
    load: async function (settings, options) {
      options = options || {};
      if (settings.provider === 'azure-openai' && !options.checkAzure)
        return { models: [], notice: azureBoundary, unsupported: true };
      var controller = new AbortController();
      var expired = false;
      var timer = setTimeout(function () { expired = true; controller.abort(); }, 30000);
      function abort() { controller.abort(); }
      if (options.signal) {
        options.signal.addEventListener('abort', abort, { once: true });
        if (options.signal.aborted) abort();
      }
      try {
        if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (settings.provider === 'github-copilot') {
          if (!window.KHCopilot) throw new Error('Copilot组件未加载，请刷新测试站。');
          var status = await window.KHCopilot.status(controller.signal);
          if (!status.authenticated) throw new Error('未登录：官方组件未找到可用的gh或专用身份。请先用 gh auth status 核查已有登录；需要新授权时可运行 node scripts/copilot-login.mjs。不会自动登录或发问。');
          return { models: uniqueNames(status.models, function (m) { return m && m.id; }),
            authSource: status.authSource,
            notice: (status.authSource === 'gh-cli' ? '已由官方组件复用GitHub CLI身份。' : '') + '列表来自官方Copilot接口；不代表已验证全部模型权限或额度。切换不发送问题。' };
        }
        var endpoint = (settings.endpoint || '').replace(/\/+$/, '');
        if (!endpoint) throw new Error('请先在连接设置中填写端点。');
        var headers = { 'Content-Type': 'application/json' }, url;
        if (settings.provider === 'ollama') url = endpoint + '/api/tags';
        else if (settings.provider === 'openai-compat') {
          url = endpoint + '/models';
          if (settings.apikey) headers.Authorization = 'Bearer ' + settings.apikey;
        } else if (settings.provider === 'azure-openai') {
          url = endpoint + '/openai/models?api-version=' + encodeURIComponent(settings.apiVersion || '2024-12-01-preview');
          if (settings.azureAuthType === 'bearer') {
            if (!settings.bearerToken) throw new Error('请填写Bearer Token。');
            headers.Authorization = 'Bearer ' + settings.bearerToken;
          } else if (settings.apikey) headers['api-key'] = settings.apikey;
        } else return { models: [], unsupported: true, notice: '此provider没有受支持的模型列表接口，请在连接设置中填写模型。' };
        var res = await fetch(url, { method: 'GET', headers: headers, signal: controller.signal });
        if (!res.ok) throw new Error('读取模型列表失败：HTTP ' + res.status + (res.status === 401 || res.status === 403 ? '，请检查连接认证/权限。' : '，请检查模型列表接口；未切换或重试。'));
        var data;
        try { data = await res.json(); } catch (_) { throw new Error('模型列表不是有效JSON，请检查服务接口；当前模型不变。'); }
        if (settings.provider === 'azure-openai') return { models: [], unsupported: true, notice: '连接检查成功。' + azureBoundary };
        return { models: settings.provider === 'ollama'
          ? uniqueNames(data.models, function (m) { return m && (m.name || m.model); })
          : uniqueNames(data.data, function (m) { return m && m.id; }),
          notice: '列表来自当前provider的模型接口；切换只影响下一条主动发送的请求。' };
      } catch (error) {
        if (expired) throw new Error('读取模型列表超时，请手动重试；当前模型不变。');
        if (error.name === 'TypeError') throw new Error('无法读取模型列表，请检查服务、网络及CORS；当前模型不变。');
        throw error;
      } finally {
        clearTimeout(timer);
        if (options.signal) options.signal.removeEventListener('abort', abort);
      }
    }
  };
})();

/* Live evaluation via a same-origin, loopback backend. No API keys or input persistence. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  window.setTimeout(function () {
    var core = window.JevPlayground;
    var root = document.getElementById('playground');
    var fixtures, selected, origin = 'pending', response = null, message = '', error = '';
    var connection = null, connectionFailed = false, connectionSequence = 0, providerTouched = false;
    var isLocal = function (provider) { return provider === 'nanojev-4bit' || provider === 'nanojev-fp32'; };
    var busy = false, revision = 0, controller = null, liveRecord = null;
    var runState = 'idle', runError = '';
    var cloudApprovals = Object.create(null); // This page only; no persistent consent.
    var checkBusy = false, checkSequence = 0, checkController = null, errorDiagnostic = null;
    var $ = function (id) { return document.getElementById('jev-' + id); };
    var en = function () { return document.documentElement.lang.indexOf('en') === 0; };
    var pick = function (zh, english) { return en() ? english : zh; };
    var text = function (id, value) { $(id).textContent = value; };
    var number = function (v) { return v == null ? pick('未返回', 'Not Returned') : v.toFixed(3); };
    var percent = function (v) { return v == null ? pick('不适用', 'N/A') : (v * 100).toFixed(1) + '%'; };
    var teamLabel = function (v) { return { billing: pick('账务', 'Billing'), technical: pick('技术', 'Technical'), other: pick('其他 / 不确定', 'Other / Unclear') }[v]; };
    var providerName = function () { return { vercel: 'Vercel AI Gateway → TypeSafe', typesafe: 'TypeSafe API', 'nanojev-4bit': 'NanoJev · MLX 4-bit · Local', 'nanojev-fp32': 'NanoJev · MLX FP32 · Local' }[$('provider').value] || 'Unknown'; };
    var scenarioNames = {
      'clear-tech': ['部署后的 HTTP 500', 'HTTP 500 after Deployment'],
      'clear-billing': ['同一发票重复扣费', 'Duplicate Invoice Charge'],
      'unclear': ['信息不明确的求助', 'Unclear Request'],
      'confident-error': ['账单页面 JavaScript 异常', 'Billing Page JavaScript Error'],
      'out-of-scope': ['求职咨询', 'Job Inquiry'],
      'moderate': ['导出按钮无响应', 'Unresponsive Export Button'],
      'low-info': ['发票还是报价单', 'Invoice or Quote'],
      'very-clear': ['订阅取消后仍扣费', 'Charge after Cancellation']
    };
    var errors = {
      state: ['输入不能为空，最多 12,000 个字符。', 'Provide 1–12,000 characters.'],
      invalid_input: ['输入或请求格式无效。', 'Invalid input or request.'],
      size: ['响应 JSON 最多 65,536 个字符。', 'Response JSON is limited to 65,536 characters.'],
      json: ['JSON 语法无效。', 'Invalid JSON syntax.'],
      shape: ['需要 model 和 answers.team / enough_info / severity。', 'Provide model and answers.team / enough_info / severity.'],
      choice: ['Choice 的类型、候选或 confidence 无效。', 'Invalid Choice type, option, or confidence.'],
      distribution: ['分布必须使用模板候选键和 0–1 的有限数。', 'Distributions need the template keys and finite numbers in [0,1].'],
      sum: ['概率总和超出允许的舍入容差，不会自动归一化。', 'Probability sum exceeds the rounding tolerance; no normalization is applied.'],
      winner: ['choice 必须对应最高概率候选。', 'choice must be a highest-probability option.'],
      noul: ['Noul 概率或类型无效。', 'Invalid Noul probability or type.'],
      score: ['Score 的值、类型或 confidence 无效。', 'Invalid Score value, type, or confidence.'],
      legend: ['Score 等级必须与本页固定模板一致。', 'Score levels must match this template.'],
      expectation: ['Score 与其分布不一致。', 'Score is inconsistent with its distribution.'],
      usage: ['Token 用量必须是非负整数，缺失时不要编造。', 'Token usage must be non-negative integers; leave unknown values absent.'],
      rounding: ['舍入精度元数据无效。', 'Invalid rounding metadata.'],
      threshold: ['阈值无效。', 'Invalid thresholds.'],
      match: ['请确认导入响应对应当前输入及固定模板。', 'Confirm the imported response matches this input and template.'],
      local_service_unavailable: ['本地 MLX 服务未就绪，请启动对应权重的服务并刷新连接；不需要云 API key。', 'The local MLX service is not ready. Start its weight profile and refresh; no cloud API key is needed.'],
      local_connection_invalid: ['本地服务身份或私有令牌不匹配，请重新启动本地服务；不要把令牌贴到网页。', 'Local service identity or private token mismatch. Restart the service; never paste its token into the page.'],
      local_invalid_response: ['本地模型响应未通过契约检查，没有生成替代答案。', 'Local model response failed contract checks; no substitute answer was created.'],
      local_input_limit: ['本地输入超出限制或契约不符：当前每条候选路径最多 512 tokens；请缩短输入，不会自动截断。', 'Local input limit/contract failure: each candidate path is limited to 512 tokens. Shorten input; it is never silently truncated.'],
      local_inference_failed: ['本地 MLX 推理失败；检查服务日志，不会回退到云端或教学结果。', 'Local MLX inference failed. Check the service log; no cloud or teaching fallback is used.'],
      backend_unavailable: ['没有可用的本地推理后端，请按下方说明启动 Node 服务。', 'No local inference backend. Start the Node server described below.'],
      key_missing: ['后端尚未配置此渠道的 API key；请用 --prompt-key 在终端隐藏输入。', 'No provider key. Use --prompt-key for hidden terminal input.'],
      key_command: ['密钥位置疑似填入了 shell 命令、变量赋值或 Bearer 前缀。请用 --prompt-key 重新输入密钥本身。', 'The key appears to contain a shell command, assignment, or Bearer prefix. Re-enter only the key with --prompt-key.'],
      key_quotes: ['密钥包含外层引号；隐藏提示中只需粘贴密钥本身，不要带引号。', 'The key has surrounding quotes. Paste only the key at the hidden prompt.'],
      key_whitespace: ['密钥包含空白字符，请用隐藏提示重新输入。', 'The key contains whitespace. Re-enter it at the hidden prompt.'],
      key_placeholder: ['当前值看起来是示例占位符或变量名，不是 API key。', 'The current value appears to be a placeholder or variable name, not an API key.'],
      check_unavailable: ['旧后端不支持认证检查，请在原终端重启更新后的 Node 服务。', 'This older backend lacks authentication checks. Restart the updated Node server in its original terminal.'],
      sdk_unavailable: ['后端缺少兼容的 AI SDK；需要支持 evaluate 的 7.0.105+ 版本。', 'The backend needs an AI SDK supporting evaluate (7.0.105+).'],
      consent_required: ['需要确认本次数据外发和可能的费用。', 'Confirm data transmission and possible charges.'],
      invalid_origin: ['本地会话已变化或来源校验失败，请刷新连接后重试。', 'The local session or origin check failed. Refresh the connection.'],
      upstream_auth: ['旧后端合并了 401 / 403 错误。请重启后端后运行只读认证检查，暂不能认定是密钥无效。', 'The older backend merges 401 and 403. Restart and run the read-only authentication check; this does not yet prove the key is invalid.'],
      upstream_auth_401: ['上游 HTTP 401：该接口未接受认证。请检查是否为 AI Gateway API key、是否失效，并运行只读认证检查。', 'Upstream HTTP 401: this endpoint did not accept authentication. Check the Gateway key and run the read-only authentication check.'],
      upstream_forbidden_403: ['上游 HTTP 403：请求被禁止，不等于密钥错误。可能涉及账户、模型权限或网络策略，请先检查只读认证。', 'Upstream HTTP 403: the request is forbidden, not necessarily an invalid key. Check read-only authentication to distinguish account, model, or network restrictions.'],
      upstream_payment: ['供应商额度或计费尚未就绪。', 'Provider credits or billing are not ready.'],
      upstream_payment_method_required: ['Vercel 明确要求账户具备有效信用卡后才能调用模型。请在这枚 API key 所属团队的 Billing → Payment Method 完成支付方式验证；不是 SDK 安装或密钥输入错误。免费促销也不豁免账户验证。', 'Vercel explicitly requires a valid credit card on file before model calls. Check Billing → Payment Method in the team that owns this API key. This is not an SDK installation or key-entry problem; a free promotion does not waive account verification.'],
      upstream_rate_limit: ['供应商限流或过载；不会自动重试。', 'Provider rate limit or overload; no automatic retry.'],
      upstream_timeout: ['上游调用超时，未生成替代答案。', 'Upstream call timed out; no substitute answer was generated.'],
      upstream_error: ['上游调用失败，请检查服务或网络；不会回退到合成答案。', 'Upstream call failed. Check service/network; no synthetic fallback is used.'],
      invalid_upstream: ['供应商响应未通过契约检查，未显示为有效结果。', 'The provider response failed contract checks and is not shown as a valid result.'],
      busy: ['本地后端正在处理另一请求，请稍后手动重试。', 'The local backend is busy. Retry manually later.'],
      local_rate_limit: ['已达到本地每分钟请求上限，请稍后再试。', 'Local per-minute limit reached. Try later.'],
      client_timeout: ['浏览器等待超时；计算可能仍在进行，云端请求仍可能计费。', 'Browser wait timed out; computation may continue, and cloud requests may still be charged.'],
      cancelled: ['已取消等待并丢弃结果；计算可能仍在进行，云端请求仍可能计费。', 'Waiting cancelled and result discarded; computation may continue, and cloud requests may still be charged.'],
      unknown: ['无法处理响应；未使用合成结果替代。', 'Unable to process the response; no synthetic replacement was used.']
    };
    if (!root || !core) return;
    fixtures = core.fixtures(); selected = fixtures[0];
    function ownError(code) { return Object.prototype.hasOwnProperty.call(errors, code) ? code : 'unknown'; }
    function hasRunApproval() { return isLocal($('provider').value) || $('consent').checked; }
    function thresholds() {
      return { confidence: Number($('confidence').value), sufficiency: Number($('sufficiency').value), severity: Number($('severity-threshold').value), basis: $('basis').value };
    }
    function currentRequest() {
      var req = core.buildRequest($('state').value);
      if (isLocal($('provider').value)) {
        req.questions.enough_info.type = 'boolean';
        return { states: [{ id: 'playground', state: req.state.request, questions: req.questions }] };
      }
      if ($('provider').value === 'vercel') {
        req.model = 'typesafe-ai/jev'; req.questions.enough_info.type = 'boolean';
        req.providerOptions = { gateway: { zeroDataRetention: true } };
      }
      return req;
    }
    function cell(row, value) { var td = document.createElement('td'); td.textContent = value; row.appendChild(td); return td; }
    function reasonLabel(code) {
      return {
        other: pick('候选为 other', 'Option is other'),
        confidence: pick('confidence 低于门槛', 'Confidence is below gate'),
        probability: pick('候选概率低于门槛', 'Choice probability is below gate'),
        confidence_unavailable: pick('未返回独立 confidence；可显式改选概率门槛', 'No independent confidence returned; explicitly select probability gating if appropriate'),
        probability_unavailable: pick('未返回候选概率，不能应用概率门槛', 'No choice probabilities returned for probability gating'),
        sufficiency: pick('信息充足度低于门槛', 'Sufficiency is below gate')
      }[code];
    }
    function actionLabel(decision) {
      return decision.action === 'review' ? pick('转人工复核 / 澄清', 'Request Review / Clarification') : pick('建议转', 'Suggest ') + teamLabel(decision.action.replace('suggest_', '')) + pick('队列（不执行）', ' Queue (Not Executed)');
    }
    function renderConnection(valid) {
      var p = connection && connection.providers[$('provider').value], detail, local = isLocal($('provider').value);
      $('local-note').hidden = !local;
      $('consent-field').hidden = local;
      text('consent-label', pick('我同意本页中手动发起的调用将输入发送到所选云端渠道，并承担可能产生的费用；刷新页面后重新确认。', 'I approve sending inputs to this cloud route for calls I manually start on this page and accept possible charges. Approval resets on reload.'));
      text('route-note', local ? pick('本机路径：浏览器 → 本地网站后端 → 独立 MLX 决策服务。直接加载已下载权重，不依赖 Vercel 绑卡或云端 key；没有修改 oMLX 聊天引擎。', 'Local path: browser → local website backend → standalone MLX decision service. It loads downloaded weights without Vercel billing or cloud keys; the oMLX chat engine is unchanged.') : pick('Gateway 路径向 Vercel / TypeSafe 发送输入并请求 ZDR；直连遵循 TypeSafe 账户条款。不要发送未经批准的敏感数据。', 'Gateway sends input to Vercel/TypeSafe with ZDR requested; direct calls follow TypeSafe terms. Do not send unapproved sensitive data.'));
      Array.prototype.forEach.call($('provider').options, function (option) { if (isLocal(option.value)) option.disabled = Boolean(connection && !connection.providers[option.value]); });
      if (!connection) detail = connectionFailed ? pick('未连接本地后端：静态服务器不能执行模型调用。', 'Local backend unavailable: a static server cannot call models.') : pick('正在检查本地后端配置…', 'Checking local backend configuration…');
      else if (!p) detail = pick('当前后端版本没有这个渠道，请打开更新后的本地网站或重启后端。', 'This backend version lacks the selected route. Use the updated website or restart the backend.');
      else if (local) detail = p.ready ? pick('本地模型已加载，可运行真实推理；没有云 API 调用费。模型业务质量仍需单独验证。', 'Local weights are loaded for real inference with no cloud API charge. Business quality still requires separate validation.') + ' ' + p.model : pick.apply(null, errors[p.local_error] || errors.local_service_unavailable);
      else if (!p.configured) detail = pick('缺少后端环境变量 ', 'Missing server environment variable ') + ($('provider').value === 'vercel' ? 'AI_GATEWAY_API_KEY' : 'TYPESAFE_API_KEY') + pick('。配置并重启后端，再刷新连接。', '. Configure it, restart the backend, then refresh the connection.');
      else if (p.credential_issue) detail = pick.apply(null, errors[p.credential_issue] || errors.unknown);
      else if (!p.sdk_ready) detail = pick('已配置密钥，但缺少兼容的 AI SDK。', 'Key configured, but a compatible AI SDK is missing.');
      else detail = pick('已配置，可尝试真实调用；密钥权限和上游可用性尚需请求验证。', 'Configured for a live attempt; credentials and upstream availability still need a request to verify.');
      if (p && $('provider').value === 'vercel' && p.sdk_ready && p.sdk_versions) detail += pick(' SDK 已就绪：', ' SDK ready: ') + p.sdk_versions.ai;
      if (p && p.readiness) {
        if (!local && p.readiness.authentication === 'verified') detail += pick(' 只读认证已通过，但这不证明 Jev 评估权限。', ' Read-only authentication passed; Jev evaluation access is not established.');
        else if (p.readiness.code && errors[p.readiness.code]) detail += ' ' + pick.apply(null, errors[p.readiness.code]);
      }
      if (connection && (!connection.capabilities || !connection.capabilities.authentication_check)) detail += pick(' 当前进程是旧后端，请重启以启用诊断。', ' This is an older backend process; restart to enable diagnostics.');
      text('connection', detail);
      text('run-label', busy ? pick('正在运行…', 'Running…') : pick('运行并查看输出', 'Run and View Output'));
      $('run').disabled = busy || checkBusy || !valid || !p || !p.ready || !hasRunApproval();
      $('check-auth').disabled = busy || checkBusy || !p || !p.configured || !connection.capabilities || !connection.capabilities.authentication_check;
      text('check-label', checkBusy ? pick('正在检查连接…', 'Checking Connection…') : local ? pick('检查本地服务（不推理）', 'Check Local Service (No Inference)') : pick('检查认证（不运行模型）', 'Check Authentication (No Inference)'));
      $('cancel').disabled = !busy;
      $('result-values').setAttribute('aria-busy', busy ? 'true' : 'false');
    }
    function renderResult(valid) {
      var phase = response ? (origin === 'live' ? 'completed' : origin) : runState;
      var status = {
        idle: ['尚未运行 · 当前输入还没有模型结果', 'Not Run · No Model Result for This Input'],
        running: ['正在运行 · 等待模型返回', 'Running · Waiting for the Model'],
        completed: ['运行完成 · 已收到真实模型结果', 'Complete · Real Model Result Received'],
        failed: ['本次运行失败 · 没有可显示的模型结果', 'Run Failed · No Model Result to Display'],
        cancelled: ['已取消等待 · 不显示本次结果', 'Wait Cancelled · Result Discarded'],
        invalidated: ['输入或模型已改变 · 旧结果已清除，请重新运行', 'Input or Model Changed · Previous Result Cleared; Run Again'],
        demo: ['教学示例 · 没有运行模型', 'Teaching Example · No Model Was Run'],
        imported: ['导入的结果 · 未验证模型是否运行', 'Imported Result · Model Execution Unverified']
      };
      $('result-panel').setAttribute('data-run-state', phase);
      text('run-status', pick.apply(null, status[phase] || status.idle));
      $('result-values').hidden = !response;
      text('result-json', response ? JSON.stringify(response, null, 2) : '');
      ['result-team', 'result-sufficiency', 'result-severity', 'result-receipt'].forEach(function (id) { text(id, ''); });
      if (!response) {
        var p = connection && connection.providers[$('provider').value];
        text('result-note', phase === 'failed' || phase === 'cancelled' ? pick.apply(null, errors[runError] || errors.unknown) : phase === 'running' ? pick('请求已发送。这里等待真实响应，不预填答案，也不以教学示例替代。', 'Request sent. Waiting for a real response; no prefilled answer or teaching fallback.') : !valid ? pick.apply(null, errors.state) : connection && (!p || !p.ready) ? pick('所选渠道尚未就绪。请检查上方连接状态；当前输入尚无结果。', 'This route is not ready. Check the connection above; there is no result for this input.') : pick('点击「运行并查看输出」后，部门、信息充足概率和严重程度会显示在这里。检查连接不会运行模型。', 'Run to see the team, probability of sufficient information, and severity here. Checking the connection does not run the model.'));
        return;
      }
      var a = response.answers;
      text('result-team', a.team.choice + ' · ' + teamLabel(a.team.choice) + (a.team.probabilities ? ' · ' + pick('候选概率 ', 'Option probability ') + percent(a.team.probabilities[a.team.choice]) : ''));
      text('result-sufficiency', pick('回答「是」的概率：', 'Probability of yes: ') + percent(a.enough_info.noul));
      text('result-severity', number(a.severity.score) + ' / 2');
      text('result-receipt', pick('模型：', 'Model: ') + response.model + (origin === 'live' && liveRecord ? ' · ' + pick('后端往返 ', 'Backend round trip ') + liveRecord.latency_ms + ' ms' : ''));
      text('result-note', origin === 'live' ? pick('以下是这次调用返回的判断，不是程序的分流建议。运行完成不代表判断正确；JSON 中输出 Token 为 0 也不代表没有结果。', 'These judgments came from this call, not the page policy. Completion does not prove correctness; zero output tokens does not mean an empty result.') : origin === 'demo' ? pick('以下数据由人工编写，仅用于教学；不能证明模型运行过。', 'These authored values are for teaching only; they do not prove model execution.') : pick('以下为你导入的数据，只通过了格式校验，不是真实调用凭证。', 'These imported values passed format checks only; they are not a live-call receipt.'));
    }
    function renderBatch(t) {
      var aggregate, body, fragment;
      $('batch').hidden = origin !== 'demo';
      if (origin !== 'demo') return;
      aggregate = core.aggregate(fixtures, t);
      text('coverage', percent(aggregate.coverage) + ' (' + aggregate.accepted + '/' + aggregate.total + ')');
      text('review-count', aggregate.reviewed + '/' + aggregate.total);
      text('error-rate', percent(aggregate.errorRate) + ' (' + aggregate.errors + '/' + aggregate.accepted + ')');
      body = $('batch-rows'); fragment = document.createDocumentFragment();
      fixtures.forEach(function (f) {
        var tr = document.createElement('tr'), d = core.policy(f.response, t);
        cell(tr, en() ? f.en : f.zh); cell(tr, teamLabel(f.gold)); cell(tr, teamLabel(f.response.answers.team.choice));
        cell(tr, number(f.response.answers.team.confidence) + ' / ' + number(f.response.answers.enough_info.noul));
        cell(tr, d.action === 'review' ? pick('复核', 'Review') : (f.gold === f.response.answers.team.choice ? pick('自动建议 · 正确', 'Auto Suggestion · Correct') : pick('自动建议 · 错误', 'Auto Suggestion · Wrong')));
        fragment.appendChild(tr);
      });
      body.replaceChildren(fragment);
    }
    function render() {
      var t = thresholds(), valid = true, decision, a, body, fragment, expected, cost, usage;
      Array.prototype.forEach.call($('scenario').options, function (option, i) { option.textContent = pick.apply(null, scenarioNames[fixtures[i].id]); });
      text('confidence-value', t.confidence.toFixed(2)); text('sufficiency-value', t.sufficiency.toFixed(2)); text('severity-value', t.severity.toFixed(2));
      text('basis-label', t.basis === 'confidence' ? pick('独立 confidence 门槛', 'Independent Confidence Gate') : pick('最高候选概率门槛（不是 confidence）', 'Top-Choice Probability Gate (Not Confidence)'));
      try { $('request').value = JSON.stringify(currentRequest(), null, 2); } catch (e) { valid = false; $('request').value = ''; }
      $('download-request').disabled = !valid;
      renderConnection(valid);
      renderResult(valid);
      text('source', origin === 'live' ? pick('真实 API 响应 · ', 'Live API Response · ') + providerName() : origin === 'demo' ? pick('合成教学数据 · 不是 Jev 实测', 'Synthetic Teaching Data · Not Jev Measurements') : origin === 'imported' ? pick('用户提供 JSON · 来源与耗时未验证', 'User-Provided JSON · Source and Timing Unverified') : busy ? pick('正在调用真实模型 · 尚无结果', 'Calling the Live Model · No Result Yet') : pick('等待真实评估 · 当前没有模型响应', 'Ready for Live Evaluation · No Model Response Yet'));
      text('feedback', error ? pick.apply(null, errors[error] || errors.unknown) + diagnosticText(errorDiagnostic) : message === 'auth_checked' ? (isLocal($('provider').value) ? pick('本地服务身份与令牌检查通过，模型已加载；这次检查没有执行推理。', 'Local service identity and token verified; weights are loaded. This check did not run inference.') : pick('只读认证检查通过；未运行模型，不展示或保存余额。Jev 访问仍需实际评估验证。', 'Read-only authentication passed; no model ran and no balance is displayed. Jev access still requires evaluation.')) + diagnosticText(errorDiagnostic) : message === 'download' ? pick('已生成本地下载。', 'Local download prepared.') : message === 'live' ? pick('API 调用完成；这不证明判断正确，也不验证底层模型修订号。', 'API call completed; this does not establish correctness or the underlying model revision.') : message === 'imported' ? pick('格式校验通过；未验证模型身份或请求关联。', 'Format checks passed; model identity and request association remain unverified.') : '');
      $('feedback').setAttribute('role', error ? 'alert' : 'status');
      $('billing-help').hidden = error !== 'upstream_payment_method_required';
      $('output').hidden = !response; $('download-report').disabled = !response;
      $('live-metrics').hidden = origin !== 'live' || !liveRecord;
      if (!response) {
        text('decision', busy ? pick('等待模型返回', 'Waiting for the Model') : pick('配置后端并点击「运行真实评估」', 'Configure the Backend and Run a Live Evaluation'));
        text('decision-reasons', pick('编辑输入、切换渠道或请求失败时，旧结果会失效；不自动回退到示例。', 'Edits, provider changes, and failures invalidate old results; there is no automatic demo fallback.'));
        text('priority', '—');
      } else {
        decision = core.policy(response, t); a = response.answers;
        text('decision', actionLabel(decision));
        text('decision-reasons', decision.reasons.length ? decision.reasons.map(reasonLabel).join(pick('；', '; ')) : pick('显式门槛通过；只是分派建议，不等于正确或已获授权。', 'Explicit gates passed; this is a suggestion, not correctness or authorization.'));
        text('priority', pick('优先级：', 'Priority: ') + (decision.priority === 'high' ? pick('高', 'High') : pick('普通', 'Normal')));
        text('model', response.model); text('choice', teamLabel(a.team.choice));
        text('choice-confidence', number(a.team.confidence)); text('noul', number(a.enough_info.noul)); $('noul-meter').value = a.enough_info.noul;
        text('score', number(a.severity.score)); text('score-confidence', number(a.severity.confidence));
        expected = a.severity.probabilities;
        text('score-formula', expected ? '0 × ' + number(expected['0']) + ' + 1 × ' + number(expected['1']) + ' + 2 × ' + number(expected['2']) + ' ≈ ' + number(a.severity.score) : pick('供应商未返回等级分布；不合成概率。', 'The provider did not return a level distribution; none is synthesized.'));
        body = $('probabilities'); fragment = document.createDocumentFragment();
        core.teams.forEach(function (team) {
          var row = document.createElement('tr'), meter, td;
          cell(row, teamLabel(team)); cell(row, a.team.probabilities ? percent(a.team.probabilities[team]) : pick('未返回', 'Not Returned'));
          td = cell(row, '');
          if (a.team.probabilities) { meter = document.createElement('progress'); meter.max = 1; meter.value = a.team.probabilities[team]; meter.setAttribute('aria-label', teamLabel(team)); td.appendChild(meter); }
          fragment.appendChild(row);
        });
        body.replaceChildren(fragment);
        text('truth', origin === 'demo' ? pick('教学案例人工标签：', 'Authored Teaching Label: ') + teamLabel(selected.gold) + (selected.gold === a.team.choice ? pick(' · Choice 正确', ' · Choice Matches') : pick(' · Choice 错误', ' · Choice Is Wrong')) : pick('本次响应未对照独立标注集，不报告准确率，也不混入教学数据统计。', 'This response was not evaluated against an independent labeled set; no accuracy is reported or mixed with teaching statistics.'));
        cost = (origin === 'demo' || ['jev-1.13.0', 'typesafe-ai/jev', 'jev-latest', 'jev-preview'].includes(response.model)) && response.usage && typeof response.usage.input_tokens === 'number' ? '$' + (response.usage.input_tokens / 1000000 * 0.042).toFixed(6) : null;
        text('cost', origin === 'live' ? (isLocal(liveRecord.provider) ? pick('本次没有外部模型 API 调用费；设备、电力和维护成本不包含在内。Token 数为候选路径的实际编码总数，包含重复前缀，不是云端计费 Token。', 'No external model API charge. Hardware, electricity, and maintenance are excluded. Tokens count encoded candidate paths including repeated prefixes, not cloud-billed tokens.') : pick('费用以供应商账单为准；本页不把促销价或目录估算冒充实际扣费。', 'Billing is determined by the provider; promotions and catalog estimates are not presented as actual charges.')) : cost ? pick('按提供用量和 $0.042/M 估算：', 'Estimate at $0.042/M from supplied usage: ') + cost + pick('；不是核实的账单。', '; not a verified bill.') : pick('费用未知：没有可核实的适用定价与计费用量。', 'Cost unknown: applicable pricing and billed usage are unverified.'));
        if (origin === 'live' && liveRecord) {
          usage = response.usage || {};
          text('latency', liveRecord.latency_ms + ' ms');
          text('input-tokens', usage.input_tokens == null ? pick('未返回', 'Not Returned') : String(usage.input_tokens));
          text('output-tokens', usage.output_tokens == null ? pick('未返回', 'Not Returned') : String(usage.output_tokens));
          text('live-detail', pick('浏览器往返 ', 'Browser round trip ') + liveRecord.client_roundtrip_ms + ' ms · ' + liveRecord.transport + ' · ' + liveRecord.request_id);
          text('measurement-note', isLocal(liveRecord.provider) ? pick('本地输入 Token 含候选复制；输出 0 表示没有自回归解码，不表示 JSON 响应为空。计时包含本地服务与传输，完整执行信息和权重 SHA 在下载记录中。', 'Local input tokens include candidate duplication. Output 0 means no autoregressive decoding, not an empty JSON response. Timing includes local service/transport; execution details and weight SHA are in the download.') : pick('耗时包含网络和服务处理，不是纯模型推理时间；model 标识不证明底层权重修订号。缺失用量或 confidence 不补造。', 'Latency includes networking and service processing, not just model compute; model IDs do not verify underlying weight revisions. Missing usage or confidence is not synthesized.'));
        }
      }
      renderBatch(t);
    }
    function diagnosticText(d) {
      if (!d || typeof d.upstream_status !== 'number') return '';
      return ' · HTTP ' + d.upstream_status + (['json', 'html', 'other'].indexOf(d.response_format) >= 0 ? ' · ' + d.response_format : '');
    }
    function cancelCheck() {
      checkSequence += 1; checkBusy = false;
      if (checkController) checkController.abort();
      checkController = null;
    }
    function invalidate() {
      if (response || busy || runState !== 'idle') runState = 'invalidated';
      runError = '';
      cancelCheck(); errorDiagnostic = null;
      revision += 1;
      if (controller) controller.abort();
      controller = null; busy = false; response = null; liveRecord = null;
      origin = 'pending'; error = ''; message = '';
      $('consent').checked = cloudApprovals[$('provider').value] === true;
    }
    function reset(id, useDemo) {
      invalidate(); selected = fixtures.filter(function (f) { return f.id === id; })[0] || fixtures[0];
      $('scenario').value = selected.id; $('state').value = selected.state;
      if (useDemo) { origin = 'demo'; response = core.validateResponse(selected.response); }
      $('response').value = response ? JSON.stringify(response, null, 2) : '';
      $('matches').checked = false; render();
    }
    function refreshConnection() {
      cancelCheck();
      var sequence = ++connectionSequence;
      connection = null; connectionFailed = false; render();
      fetch('/api/jev/status', { cache: 'no-store', credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('backend_unavailable'); return r.json();
      }).then(function (data) {
        if (sequence !== connectionSequence) return;
        if (data.backend !== 'study-room-jev-live-v1' || typeof data.csrf !== 'string' || !/^[a-f0-9]{64}$/.test(data.csrf) || !data.providers || !data.providers.vercel || !data.providers.typesafe) throw new Error('backend_unavailable');
        connection = data;
        if (!providerTouched && origin === 'pending' && !busy) {
          if (data.providers['nanojev-fp32'] && data.providers['nanojev-fp32'].ready) $('provider').value = 'nanojev-fp32';
          else if (data.providers['nanojev-4bit'] && data.providers['nanojev-4bit'].ready) $('provider').value = 'nanojev-4bit';
        }
        render();
      }).catch(function () { if (sequence === connectionSequence) { connectionFailed = true; render(); } });
    }
    function checkAuthentication() {
      var provider = $('provider').value, sequence, timer;
      if (busy || checkBusy || !connection || !connection.capabilities || !connection.capabilities.authentication_check) return;
      sequence = ++checkSequence; checkBusy = true; error = ''; message = ''; errorDiagnostic = null;
      checkController = new AbortController(); render();
      timer = window.setTimeout(function () { if (sequence === checkSequence && checkController) checkController.abort(); }, 15000);
      fetch('/api/jev/check', {
        method: 'POST', credentials: 'same-origin', signal: checkController.signal,
        headers: { 'Content-Type': 'application/json', 'X-Jev-Csrf': connection.csrf },
        body: JSON.stringify({ provider: provider })
      }).then(function (r) { return r.json().then(function (data) { if (!r.ok) throw new Error(data.error && data.error.code || 'check_unavailable'); return data; }); }).then(function (data) {
        if (sequence !== checkSequence || provider !== $('provider').value) return;
        if (!data.check || data.check.provider !== provider || data.check.model_inference_performed !== false || !data.providers) throw new Error('invalid_upstream');
        connection.providers = data.providers; errorDiagnostic = data.check.diagnostic || null;
        if (data.check.authentication === 'verified') message = 'auth_checked';
        else error = ownError(data.check.code);
      }).catch(function (e) { if (sequence === checkSequence) error = e.name === 'AbortError' ? 'upstream_timeout' : ownError(e.message); }).finally(function () {
        window.clearTimeout(timer);
        if (sequence === checkSequence) { checkBusy = false; checkController = null; render(); }
      });
    }
    function runLive() {
      var provider = $('provider').value, state = $('state').value, sequence, started, timer, timedOut = false, signal;
      if (busy || checkBusy || !hasRunApproval() || !connection || !connection.providers[provider] || !connection.providers[provider].ready) return;
      try { core.buildRequest(state); } catch (e) { error = 'state'; render(); return; }
      sequence = ++revision; controller = new AbortController(); signal = controller.signal;
      busy = true; runState = 'running'; runError = '';
      response = null; liveRecord = null; origin = 'pending'; error = ''; errorDiagnostic = null; message = ''; $('response').value = '';
      started = performance.now(); render();
      if (window.matchMedia('(max-width: 760px)').matches) $('result-panel').scrollIntoView({ block: 'start', behavior: 'instant' });
      timer = window.setTimeout(function () { if (revision === sequence && controller) { timedOut = true; controller.abort(); } }, 45000);
      fetch('/api/jev/evaluate', {
        method: 'POST', credentials: 'same-origin', signal: signal,
        headers: { 'Content-Type': 'application/json', 'X-Jev-Csrf': connection.csrf },
        body: JSON.stringify({ provider: provider, state: state, consent: true })
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) { var failure = new Error(data.error && data.error.code || 'upstream_error'); failure.diagnostic = data.error && data.error.diagnostic; throw failure; }
          return data;
        });
      }).then(function (data) {
        if (sequence !== revision) return;
        var returnedState = isLocal(provider) ? data.request && data.request.states && data.request.states.length === 1 && data.request.states[0].id === 'playground' && data.request.states[0].state : data.request && data.request.state && data.request.state.request;
        if (data.mode !== 'live' || data.provider !== provider || returnedState !== state || typeof data.latency_ms !== 'number' || !isFinite(data.latency_ms) || data.latency_ms < 0) throw new Error('invalid_upstream');
        response = core.validateResponse(data.response); liveRecord = data;
        liveRecord.client_roundtrip_ms = Math.round(performance.now() - started);
        runState = 'completed'; origin = 'live'; message = 'live'; $('response').value = JSON.stringify(response, null, 2);
      }).catch(function (e) {
        if (sequence !== revision) return;
        response = null; liveRecord = null; origin = 'pending'; errorDiagnostic = e.diagnostic || null; error = timedOut ? 'client_timeout' : ownError(e.message);
        runState = 'failed'; runError = error;
      }).finally(function () {
        window.clearTimeout(timer);
        if (sequence === revision) { busy = false; controller = null; render(); }
      });
    }
    function download(value, filename) {
      var blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      message = 'download'; error = ''; render();
    }
    fixtures.forEach(function (f) { var option = document.createElement('option'); option.value = f.id; $('scenario').appendChild(option); });
    $('scenario').addEventListener('change', function () { reset(this.value, false); });
    $('reset').addEventListener('click', function () { $('basis').value = 'confidence'; $('confidence').value = '0.85'; $('sufficiency').value = '0.90'; $('severity-threshold').value = '1.40'; reset($('scenario').value, false); });
    $('demo').addEventListener('click', function () { reset($('scenario').value, true); });
    ['confidence', 'sufficiency', 'severity-threshold', 'basis'].forEach(function (id) { $(id).addEventListener('input', render); });
    $('consent').addEventListener('change', function () {
      if (!isLocal($('provider').value)) cloudApprovals[$('provider').value] = this.checked;
      render();
    });
    $('provider').addEventListener('change', function () { providerTouched = true; invalidate(); $('response').value = ''; render(); });
    $('refresh').addEventListener('click', refreshConnection);
    $('check-auth').addEventListener('click', checkAuthentication);
    $('run').addEventListener('click', runLive);
    $('cancel').addEventListener('click', function () { invalidate(); runState = 'cancelled'; runError = 'cancelled'; error = 'cancelled'; render(); });
    $('state').addEventListener('input', function () { invalidate(); $('matches').checked = false; $('response').value = ''; render(); });
    $('import').addEventListener('click', function () {
      invalidate();
      try {
        core.buildRequest($('state').value); if (!$('matches').checked) throw new Error('match');
        response = core.parseResponse($('response').value); origin = 'imported'; message = 'imported';
      } catch (e) { error = ownError(e.message); }
      render();
    });
    $('download-request').addEventListener('click', function () { try { download(currentRequest(), 'jev-evaluation-input.json'); } catch (e) { error = ownError(e.message); render(); } });
    $('download-report').addEventListener('click', function () {
      var value;
      if (!response) return;
      value = { schema: 'study-room.jev-inspection.v1', source: origin === 'live' ? 'live-backend' : origin === 'demo' ? 'synthetic-not-inference' : 'user-json-unverified', request: origin === 'live' ? liveRecord.request : currentRequest(), response: response, thresholds: thresholds(), decision: core.policy(response, thresholds()), measured_latency_ms: origin === 'live' ? liveRecord.latency_ms : null, underlying_model_revision_verified: false, accuracy: null };
      if (origin === 'live') value.live_receipt = liveRecord;
      if (origin === 'demo') { value.synthetic_ground_truth = selected.gold; value.synthetic_batch = core.aggregate(fixtures, thresholds()); }
      download(value, 'jev-inspection.json');
    });
    document.addEventListener('langChanged', render);
    reset(selected.id, false); refreshConnection();
  }, 0);
});

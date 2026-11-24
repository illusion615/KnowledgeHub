const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdtemp, copyFile, rm, readFile, readdir, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
(async function () {
  const { createBridge } = await import('../scripts/copilot-bridge-server.mjs');
  const { createMediaEngine } = await import('../scripts/video-studio-media.mjs');
  const { BridgeError } = await import('../scripts/copilot-runtime.mjs');
  const { planKey } = await import('../scripts/video-studio-model.mjs');
  const dataRoot = await mkdtemp(join(tmpdir(), 'kh-studio-browser-'));
  const calls = { plan: 0, direct: 0, image: 0, voice: 0, clip: 0, export: 0 };
  const composition = { background: '#182b36', layers: [
    { type: 'image', x: .28, y: .5, width: .56, height: 1, fit: 'cover' },
    { type: 'text', bind: 'screenText', x: .78, y: .4, width: .36, height: .6, fontSize: 64, fill: '#ffffff',
      keyframes: [{ at: 0, x: .84, opacity: 0 }, { at: .15, x: .78, opacity: 1 }] },
    { type: 'captions', x: .5, y: .92, width: .9, height: .14, fontSize: 32, fill: '#ffffff', align: 'center' }
  ] };
  const closingComposition = { background: '#f5eedf', layers: [
    { type: 'image', x: .5, y: .5, width: 1, height: 1, opacity: .3 },
    { type: 'text', bind: 'screenText', x: .5, y: .45, width: .85, height: .5, fontSize: 110, fill: '#182b36', align: 'center' }
  ] };
  const actual = createMediaEngine();
  let authMode = 'connected', statusGate = null, releaseStatus, voiceGate = null;
  const scene = { id: 'opening', title: '现场拜访', narration: '先核对事实，再确认下一步。', visual: 'Refined paper collage sales scene.',
    screenText: '先核对，再行动', camera: 'push', anchors: ['challenge'] };
  const server = createBridge({ runtimeFactory: async () => ({
    status: async () => {
      calls.status = (calls.status || 0) + 1;
      if (statusGate) await statusGate;
      if (authMode === 'error') throw new BridgeError(503, 'FIXTURE_CONNECTION', '固定夹具连接失败，请重试。');
      if (authMode === 'signed-out') return { authenticated: false, models: [] };
      return { authenticated: true, models: [{ id: authMode === 'other-model' ? 'other-model' : 'fixture-model', name: 'Fixture model' }] };
    },
    chat: async (body, emit) => {
      const request = JSON.parse(body.messages[1].content);
      if (request.scenes) calls.direct++; else calls.plan++;
      emit({ choices: [{ delta: { content: JSON.stringify({
        creativeDirection: '从具体行动展开叙事，开场用左右景别对照，结尾改为全画幅文字。',
        scenes: request.scenes ? request.scenes.map(item => ({ id: item.id, composition: item.id === 'closing' ?
          { background: '#182b36', camera: { keyframes: [{ at: 0, scale: 1 }, { at: 1, scale: 1.08, x: .54 }] }, layers: [
            { type: 'group', x: .5, y: .5, width: .85, height: .85, children: [
              { type: 'path', x: .25, y: .5, width: .3, height: .3, fill: '#00000000', stroke: '#b95232', strokeWidth: 12,
                path: 'M0 500 H900 M700 300 L900 500 L700 700', keyframes: [{ at: 0, reveal: 0 }, { at: .4, reveal: 1 }] },
              { type: 'text', bind: 'screenText', x: .68, y: .5, width: .56, height: .6, fontSize: 96, fill: '#ffffff' }
            ] }
          ] } : { ...composition, background: '#30463c' } })) :
          [{ ...scene, composition }, { ...scene, id: 'closing', title: '收尾镜头', screenText: '下一步由你确认', camera: 'pull', composition: closingComposition }]
      }) } }] });
    },
    close: async () => {}
  }), studioOptions: { dataRoot, engine: {
    status: () => actual.status(),
    run: async (kind, input) => {
      calls[kind]++;
      if (kind === 'voice' && voiceGate) await voiceGate;
      if (kind === 'image') {
        assert.ok(process.env.KH_STUDIO_TEST_IMAGE, 'Set KH_STUDIO_TEST_IMAGE to a user-owned local test PNG; test never calls an image model');
        await copyFile(process.env.KH_STUDIO_TEST_IMAGE, input.output);
        return { width: 1536, height: 864 };
      }
      return actual.run(kind, input);
    }
  } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const click = action => page.locator('[data-action="' + action + '"]:visible').first().click();
  const currentSlide = () => page.locator('.studio-gallery-slide:not([hidden])');
  const openAdvanced = async () => {
    const tools = currentSlide().locator('.studio-advanced-tools');
    if (await tools.getAttribute('open') === null) await tools.locator('summary').first().click();
  };
  const checkWorkbench = async label => {
    const originalTheme = await page.locator('html').getAttribute('data-theme'), originalViewport = page.viewportSize();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
        await page.setViewportSize(viewport);
        const bin = await page.locator('.studio-scene-bin').boundingBox();
        const viewer = await page.locator('.studio-gallery-media:visible').boundingBox();
        const inspector = await page.locator('.studio-gallery-editor:visible').boundingBox();
        const transport = await page.locator('.studio-gallery-transport').boundingBox();
        const timeline = await page.locator('.studio-sequence').boundingBox();
        const frame = await page.locator('.studio-gallery-frame:visible').boundingBox();
        assert.ok(bin.x + bin.width <= viewer.x + 2, label + ': bin remains left');
        assert.ok(viewer.x + viewer.width <= inspector.x + 2, label + ': inspector remains right');
        assert.ok(timeline.y >= transport.y + transport.height - 2, label + ': timeline remains below transport');
        assert.ok(timeline.y + timeline.height <= viewport.height + 1, label + ': timeline fits viewport');
        assert.ok(frame.width >= 320 && frame.height >= 180, label + ': useful monitor area');
        assert.ok(Math.abs(frame.width / frame.height - 16 / 9) < .02, label + ': monitor aspect ratio');
        assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), true, label + ': no desktop page scrolling');
        if (process.env.KH_STUDIO_QA_DIR && theme === 'light' && viewport.width === 1440)
          await page.screenshot({ path: join(process.env.KH_STUDIO_QA_DIR, 'studio-workspace-' + label + '.png') });
      }
    }
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), originalTheme);
    await page.setViewportSize(originalViewport);
  };
  const done = async count => {
    await page.waitForFunction(count => document.querySelectorAll('#studio-jobs .studio-job').length >= count &&
      !/queued|running/.test(document.getElementById('studio-jobs').textContent), count, { timeout: 120000 });
    assert.doesNotMatch(await page.locator('#studio-jobs').textContent(), /\bfailed\b/);
  };
  try {
    await page.goto(base + '/posts/agentic-sales-mobile-proposal/');
    await page.waitForSelector('[data-video-studio]');
    assert.equal(await page.locator('[data-video-studio]').getAttribute('data-video-studio'), 'agentic-sales-mobile-proposal');
    assert.equal(await page.locator('[data-video-studio]').getAttribute('href'), null);
    for (const mode of [{ lang: 'zh', theme: 'light' }, { lang: 'en', theme: 'dark' }]) {
      await page.evaluate(mode => { localStorage.setItem('lang', mode.lang); localStorage.setItem('theme', mode.theme); }, mode);
      await page.reload(); await page.waitForSelector('[data-video-studio]');
      const count = await page.locator('main section').count();
      assert.ok(count > 0);
      for (let i = 0; i < count; i++) {
        await page.locator('main section').nth(i).scrollIntoViewIfNeeded();
        assert.ok((await page.locator('main section').nth(i).boundingBox()).height > 0);
      }
      await page.evaluate(() => {
        document.querySelector('[data-presentation-toggle]').click();
        document.querySelector('.launch-play-btn').click();
      });
      await page.waitForFunction(() => document.querySelector('[data-present-counter]').textContent.includes('/'));
      const total = await page.locator('[data-present-counter]').textContent().then(value => Number(value.split('/')[1].trim()));
      for (let i = 0; i < total; i++) {
        const counter = await page.locator('[data-present-counter]').textContent();
        assert.equal(Number(counter.split('/')[0].trim()), i + 1);
        assert.ok(await page.locator('[data-present-step].is-active').count());
        if (i < total - 1) await page.evaluate(() => document.querySelector('[data-present-next]').click());
      }
      await page.evaluate(() => document.querySelector('[data-present-exit]').click());
      console.log('PASS article matrix:', mode.lang, mode.theme, count, 'sections,', total, 'presentation steps');
    }
    await page.evaluate(() => { localStorage.setItem('lang', 'zh'); localStorage.setItem('theme', 'light'); });
    await page.goto(base + '/video-studio.html?article=agentic-sales-mobile-proposal');
    await page.waitForSelector('[data-action="brief"]', { timeout: 10000 }).catch(async error => {
      throw new Error(error.message + '\nStudio state: ' + await page.locator('body').innerText() + '\nPage errors: ' + JSON.stringify(errors));
    });
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    await checkWorkbench('1-brief-empty');
    assert.equal(await page.locator('.studio-sequence-empty').isVisible(), true);
    assert.equal(await page.locator('[data-action="simulate-toggle"]').isDisabled(), true);
    assert.equal(await page.locator('.studio-source-preview').isVisible(), true);
    for (const mode of [2, 3, 4]) {
      await page.locator('[data-step="' + mode + '"]').click();
      await page.waitForFunction(value => document.querySelector('[aria-current="step"]')?.getAttribute('data-step') === String(value), mode);
      await checkWorkbench(mode + '-empty');
      assert.equal(calls.plan, 0, 'empty workspace navigation never generates');
    }
    await page.locator('[data-step="1"]').click();
    await page.waitForSelector('[data-action="brief"]');
    assert.ok(calls.status > 0, 'login is checked automatically');
    assert.equal(calls.plan, 0, 'opening Studio must not invoke Copilot');
    assert.equal(await page.locator('[data-action="connect"], #studio-consent').count(), 0, 'no manual connection or consent checkbox');
    assert.equal(await page.locator('[data-template]').count(), 4);
    await page.locator('#studio-lang').click();
    assert.match(await page.locator('[data-template="technical"]').textContent(), /Technical Breakdown/);
    await page.locator('#studio-theme').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.locator('#studio-lang').click();
    await page.locator('#studio-theme').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    statusGate = new Promise(resolve => { releaseStatus = resolve; });
    try {
      await page.locator('#studio-copilot-status').click();
      await page.waitForSelector('#studio-copilot-status[data-state="checking"]');
      await page.locator('[data-field="goal"]').fill('检测期间的草稿不能丢失');
    } finally { releaseStatus(); statusGate = null; }
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    assert.equal(await page.locator('[data-field="goal"]').inputValue(), '检测期间的草稿不能丢失');
    await page.locator('[data-field="voice"]').selectOption('Lili (Premium)');
    await page.locator('[data-field="voiceRate"]').fill('245');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-template="technical"]').click();
    assert.equal(await page.locator('[data-field="seconds"]').inputValue(), '240');
    assert.equal(await page.locator('[data-field="music"]').inputValue(), 'none');
    assert.equal(await page.locator('[data-field="voice"]').inputValue(), 'Lili (Premium)');
    assert.equal(await page.locator('[data-field="voiceRate"]').inputValue(), '245');
    const projectDirectory = (await readdir(dataRoot)).find(name => name.startsWith('p-'));
    const storedBeforeSave = JSON.parse(await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8'));
    assert.equal(storedBeforeSave.brief.seconds, 180, 'applying a template does not save');
    assert.equal(storedBeforeSave.jobs.length, 0, 'applying a template never queues generation');
    await page.locator('[data-template="education"]').click();
    assert.equal(await page.locator('[data-field="seconds"]').inputValue(), '180');
    assert.match(await page.locator('[data-field="audience"]').inputValue(), /第一次接触/);
    await page.locator('[data-template="promo"]').click();
    assert.equal(await page.locator('[data-field="seconds"]').inputValue(), '60');
    await page.locator('[data-field="goal"]').fill('保留我的自定义需求');
    assert.equal(await page.locator('[data-template][aria-pressed="true"]').count(), 0);
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('[data-template="solution"]').click();
    assert.equal(await page.locator('[data-field="goal"]').inputValue(), '保留我的自定义需求');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-template="solution"]').click();
    await click('brief');
    await page.waitForSelector('[data-action="plan"]');
    await page.reload(); await page.waitForSelector('[data-action="plan"]');
    await page.locator('[data-step="1"]').click();
    await page.waitForSelector('[data-action="brief"]');
    assert.equal(await page.locator('[data-template="solution"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-field="voiceRate"]').inputValue(), '245');
    assert.equal(calls.plan, 0, 'templates, confirmation and reload do not invoke Copilot');
    await page.locator('[data-field="goal"]').fill('理解方案并确认下一步');
    await click('brief');
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    await page.locator('#studio-copilot-model').selectOption('fixture-model');
    for (const mode of ['signed-out', 'error']) {
      authMode = mode;
      await page.locator('#studio-copilot-status').click();
      await page.waitForSelector('#studio-copilot-status[data-state="' + mode + '"]');
      assert.equal(await page.locator('#studio-copilot-model').isDisabled(), true);
      assert.equal(await page.locator('#studio-copilot-error').isVisible(), true);
      assert.equal(calls.plan, 0, 'auth failures never submit an article');
    }
    authMode = 'other-model';
    await page.locator('#studio-copilot-status').click();
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    assert.equal(await page.locator('#studio-copilot-model').inputValue(), '', 'unavailable preference is not silently replaced');
    assert.equal(await page.evaluate(() => localStorage.getItem('kh-video-model')), 'fixture-model');
    assert.equal(await page.locator('[data-action="plan"]').isDisabled(), true);
    authMode = 'connected';
    await page.locator('#studio-copilot-status').click();
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    assert.equal(await page.locator('#studio-copilot-model').inputValue(), 'fixture-model');
    const generateStoryboard = page.getByRole('button', { name: '生成分镜', exact: true });
    assert.equal(await generateStoryboard.isVisible(), true);
    assert.equal(await generateStoryboard.locator('xpath=ancestor::details').count(), 0, 'generation is not hidden in a disclosure');
    assert.equal(await page.locator('[data-director-controls]').count(), 0);
    await generateStoryboard.click(); await done(1);
    assert.equal(calls.plan, 1);
    assert.equal(await page.getByRole('button', { name: '重新生成分镜', exact: true }).isVisible(), true);
    for (const action of ['direct', 'approve-plan', 'batch-assets', 'batch-images', 'batch-voices'])
      assert.equal(await page.locator('.studio-workbench-header [data-action="' + action + '"]').count(), 0, 'implementation tools are not primary workflow actions');
    assert.match(await page.locator('[data-action="produce"]').textContent(), /确认方案并制作/);
    assert.equal(await page.locator('[data-action="produce"]').isEnabled(), true, 'reviewing the storyboard and producing it is one explicit action');
    assert.equal(await page.locator('.studio-workbench-header [data-action="prepare-assets"]').isVisible(), true);
    assert.equal(await page.locator('[data-action="prepare-assets"]').locator('xpath=ancestor::details').count(), 0, 'asset generation is a visible phase, not an expert repair tool');
    assert.equal(await currentSlide().locator('[data-action="batch-images"]').isVisible(), false, 'manual asset tools start collapsed');
    assert.equal(await page.locator('#studio-steps button').count(), 4);
    assert.equal(await page.locator('[aria-current="step"]').textContent(), '2 · 镜头工作台');
    assert.equal(await page.locator('[data-gallery-slide]').count(), 2);
    await checkWorkbench('2-storyboard');
    assert.ok(await currentSlide().locator('.studio-inspector-content').evaluate(node => node.scrollHeight > node.clientHeight), 'long properties scroll independently');
    await page.setViewportSize({ width: 1440, height: 1000 });
    const viewerBeforeDrawer = await currentSlide().locator('.studio-gallery-media').boundingBox();
    await click('toggle-jobs');
    assert.equal(await page.locator('#studio-job-drawer').isVisible(), true);
    assert.equal(await page.locator('[data-action="toggle-jobs"]').getAttribute('aria-expanded'), 'true');
    assert.equal((await currentSlide().locator('.studio-gallery-media').boundingBox()).width, viewerBeforeDrawer.width);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#studio-job-drawer').isHidden(), true);
    assert.equal(await page.locator('.studio-gallery-thumb').count(), 2);
    assert.equal(await page.locator('.studio-audio-clip').count(), 2);
    assert.match(await page.locator('.studio-audio-clip').first().textContent(), /估算/);
    await currentSlide().locator('[data-field="title"]').fill('编辑后的开场');
    await click('gallery-next');
    await currentSlide().locator('[data-field="title"]').fill('编辑后的收尾');
    await click('gallery-prev');
    assert.equal(await currentSlide().locator('[data-field="title"]').inputValue(), '编辑后的开场', 'scene switching preserves unsaved fields');
    await page.keyboard.press('ArrowRight');
    assert.equal(await currentSlide().getAttribute('data-shot'), 'closing');
    assert.equal(await page.locator('.studio-bin-scene[aria-current]').getAttribute('data-scene'), 'closing');
    assert.equal(await page.locator('.studio-audio-clip[aria-current]').getAttribute('data-scene'), 'closing');
    await currentSlide().locator('[data-field="narration"]').focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await currentSlide().getAttribute('data-shot'), 'closing', 'arrow keys in an editor do not switch scenes');
    await click('save'); assert.equal(calls.plan, 1);
    await page.waitForFunction(() => document.getElementById('studio-message').textContent.includes('已保存'));
    const savedGallery = JSON.parse(await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8'));
    assert.deepEqual(savedGallery.scenes.map(item => item.title), ['编辑后的开场', '编辑后的收尾']);
    savedGallery.cursor = 3;
    await writeFile(join(dataRoot, projectDirectory, 'project.json'), JSON.stringify(savedGallery));
    await page.reload(); await page.waitForSelector('.studio-gallery-slide:not([hidden])');
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    assert.equal(await page.locator('#studio-copilot-model').inputValue(), 'fixture-model', 'header restores selected model automatically');
    assert.equal(await page.locator('[aria-current="step"]').textContent(), '2 · 镜头工作台', 'old assets cursor maps to the consolidated workbench');
    assert.equal(await currentSlide().getAttribute('data-shot'), 'closing', 'selected scene survives reload');
    await click('gallery-prev');
    await click('simulate-toggle');
    await page.waitForFunction(() => document.getElementById('studio-simulation-status').textContent.includes('静音预演'));
    await page.waitForFunction(() => document.getElementById('studio-simulation-progress').value > .2);
    await click('simulate-toggle');
    const pausedAt = await page.locator('#studio-simulation-progress').evaluate(node => node.value);
    await page.waitForTimeout(200);
    assert.equal(await page.locator('#studio-simulation-progress').evaluate(node => node.value), pausedAt);
    await click('simulate-toggle');
    await page.waitForFunction(() => document.querySelector('.studio-gallery-slide:not([hidden])').dataset.shot === 'closing', null, { timeout: 15000 });
    await page.waitForFunction(() => document.getElementById('studio-simulation-status').textContent.includes('预演完成'), null, { timeout: 15000 });
    assert.equal(calls.image, 0); assert.equal(calls.voice, 0); assert.equal(calls.clip, 0, 'simulation does not generate or render');
    await page.reload(); await page.waitForSelector('.studio-gallery-slide:not([hidden])');
    assert.equal(await currentSlide().getAttribute('data-shot'), 'closing');
    await click('prepare-assets'); await done(2);
    assert.equal(calls.image, 2); assert.equal(calls.voice, 2);
    assert.equal(calls.clip, 0); assert.equal(calls.export, 0, 'asset generation stops for review before rendering or export');
    const prepared = JSON.parse(await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8'));
    assert.equal(prepared.planApproval, planKey(prepared), 'the visible asset action confirms the reviewed storyboard');
    await openAdvanced(); await click('batch-images'); await done(3);
    await openAdvanced();
    await click('batch-assets'); await done(4);
    assert.equal(calls.image, 2); assert.equal(calls.voice, 2, 'advanced fill-missing reuses both existing asset kinds');
    assert.match(await page.locator('#studio-batch-progress').textContent(), /复用 4/);
    const meter = page.locator('#studio-batch-progress progress');
    assert.equal(await meter.getAttribute('value'), '4');
    assert.equal(await meter.getAttribute('max'), '4');
    assert.equal(await page.locator('#studio-batch-progress .studio-progress-percent').textContent(), '100%');
    const snapshotRoute = /\/api\/copilot\/studio\/(?:open|p-[a-f0-9]{24})$/;
    let progressSnapshot = { status: 'running', progress: { total: 4, completed: 2, generated: 2, reused: 0,
      title: '当前镜头', kind: 'voice', sceneId: 'opening' } };
    await page.route(snapshotRoute, async route => {
      const response = await route.fetch();
      const data = await response.json();
      const job = data.jobs.filter(item => item.kind === 'assets').at(-1);
      job.status = progressSnapshot.status;
      if (progressSnapshot.progress) job.progress = { ...progressSnapshot.progress };
      else delete job.progress;
      await route.fulfill({ response, json: data });
    });
    await page.reload(); await page.waitForSelector('#studio-batch-progress progress');
    await page.waitForSelector('#studio-copilot-status[data-state="connected"]');
    assert.equal(await page.locator('#studio-copilot-model').isDisabled(), true, 'model cannot change during a running job');
    assert.equal(await page.locator('.studio-workbench-header #studio-batch-progress').isVisible(), true, 'progress is visible outside collapsed advanced tools');
    assert.equal(await meter.getAttribute('value'), '2');
    assert.equal(await meter.getAttribute('max'), '4');
    assert.match(await meter.getAttribute('aria-valuetext'), /当前镜头/);
    assert.equal(await page.locator('#studio-batch-progress .studio-progress-percent').textContent(), '50%');
    assert.equal(await page.locator('#studio-jobs .studio-batch-meter').first().getAttribute('data-state'), 'running');
    await page.locator('#studio-lang').click();
    assert.equal(await meter.getAttribute('aria-label'), 'Batch Media Generation Progress');
    await page.locator('#studio-theme').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.locator('#studio-lang').click(); await page.locator('#studio-theme').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    progressSnapshot = { status: 'done', progress: { total: 4, completed: 4, generated: 4, reused: 0 } };
    await page.waitForFunction(() => document.querySelector('#studio-batch-progress .studio-progress-percent')?.textContent === '100%');
    for (const status of ['failed', 'cancelled', 'interrupted']) {
      progressSnapshot = { status, progress: { total: 4, completed: 2, generated: 2, reused: 0 } };
      await page.reload(); await page.waitForSelector('#studio-batch-progress progress');
      assert.equal(await meter.getAttribute('value'), '2', status + ' retains completed work');
      assert.equal(await page.locator('#studio-batch-progress .studio-progress-percent').textContent(), '50%');
      assert.equal(await page.locator('#studio-batch-progress .studio-batch-meter').getAttribute('data-state'), status);
    }
    progressSnapshot = { status: 'queued' };
    await page.reload(); await page.waitForSelector('#studio-batch-progress progress');
    assert.equal(await meter.getAttribute('value'), null, 'queued work has no fabricated percentage');
    await page.unroute(snapshotRoute);
    await page.reload(); await page.waitForSelector('#studio-batch-progress progress');
    assert.equal(await meter.getAttribute('value'), '4', 'reload restores persisted real progress');
    assert.equal(calls.image, 2); assert.equal(calls.voice, 2, 'progress rendering never regenerates media');
    await page.waitForFunction(() => document.querySelector('.studio-gallery-slide:not([hidden]) img')?.naturalWidth > 0);
    const playheadAtStart = await page.locator('.studio-sequence-playhead').evaluate(node => parseFloat(node.style.left));
    await click('simulate-toggle');
    await page.waitForFunction(() => !document.getElementById('studio-simulation-audio').paused && document.getElementById('studio-simulation-audio').currentTime > .2);
    await page.waitForFunction(start => parseFloat(document.querySelector('.studio-sequence-playhead').style.left) > start + 1, playheadAtStart);
    assert.equal(await currentSlide().locator('.studio-composition-canvas').count(), 1);
    assert.equal(await currentSlide().locator('.studio-gallery-copy').count(), 0, 'directed scenes do not add a fixed headline card');
    await click('simulate-toggle');
    const audioPausedAt = await page.locator('#studio-simulation-audio').evaluate(node => node.currentTime);
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#studio-simulation-audio').evaluate(node => node.currentTime), audioPausedAt);
    await click('simulate-toggle');
    await page.waitForFunction(time => document.getElementById('studio-simulation-audio').currentTime > time + .15, audioPausedAt);
    await click('gallery-prev');
    assert.equal(await page.locator('#studio-simulation-audio').evaluate(node => node.paused), true, 'switching scenes stops the previous narration');
    await click('simulate-toggle');
    await page.waitForFunction(() => document.querySelector('.studio-gallery-slide:not([hidden])').dataset.shot === 'closing' &&
      !document.getElementById('studio-simulation-audio').paused, null, { timeout: 15000 });
    await click('simulate-stop');
    assert.equal(await page.locator('#studio-simulation-audio').evaluate(node => node.paused), true);
    assert.equal(calls.voice, 2); assert.equal(calls.clip, 0);
    await click('gallery-prev');
    assert.equal(await page.locator('[data-action="approve-assets"]').count(), 0, 'no per-scene approval controls');
    await page.locator('[data-step="3"]').click();
    await page.waitForSelector('[data-action="clips"]');
    assert.equal(await page.locator('[data-action="clip"]').first().isEnabled(), true, 'ready assets render without approval');
    assert.match(await page.locator('#studio-stage').textContent(), /无需逐镜头确认/);
    await click('clips'); await done(5);
    assert.equal(calls.clip, 2, 'one action renders both scenes');
    assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('value'), '2');
    assert.equal(await page.locator('#studio-batch-progress .studio-progress-percent').textContent(), '100%');
    await page.waitForSelector('video[data-monitor]:visible');
    await checkWorkbench('3-render');
    await click('simulate-toggle');
    await page.waitForFunction(() => document.querySelector('[data-gallery-slide]:not([hidden]) video').currentTime > .2);
    await page.waitForFunction(() => document.getElementById('studio-simulation-progress').value > .1);
    await click('simulate-toggle');
    assert.equal(await page.locator('video[data-monitor]:visible').evaluate(video => video.paused), true);
    await click('simulate-stop');
    await page.reload(); await page.waitForSelector('[data-action="clip"]');
    assert.equal(await page.locator('[aria-current="step"]').textContent(), '3 · 镜头渲染');
    assert.equal(calls.clip, 2, 'reload must not render');
    await click('clips'); await done(6); assert.equal(calls.clip, 2, 'unchanged scenes are cached');
    await click('next'); await page.waitForSelector('[data-action="export"]'); await click('export'); await done(7);
    await page.waitForSelector('[data-action="download"]');
    await checkWorkbench('4-export');
    await page.waitForFunction(() => document.querySelector('[data-gallery-slide]:not([hidden]) video')?.readyState >= 2);
    await page.locator('video[data-monitor]:visible').evaluate(async video => {
      video.muted = true; await video.play();
      await new Promise(resolve => setTimeout(resolve, 600));
      if (video.currentTime < .3 || video.error) throw new Error('Export playback did not advance');
      video.pause();
    });
    assert.equal(calls.export, 1);
    await page.locator('[data-step="1"]').click();
    await page.waitForSelector('[data-field="goal"]');
    await page.locator('[data-field="goal"]').fill('切换素材时保留需求草稿');
    await page.locator('.studio-bin-scene').first().click();
    assert.equal(await page.locator('[data-field="goal"]').inputValue(), '切换素材时保留需求草稿');
    assert.equal(calls.plan, 1);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-step="4"]').click();
    await page.reload(); await page.waitForSelector('[data-action="download"]');
    assert.equal(await page.locator('[aria-current="step"]').textContent(), '4 · 整片导出');
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    }
    await page.locator('#studio-lang').click();
    assert.match(await page.locator('[aria-current="step"]').textContent(), /Export/);
    await page.locator('#studio-theme').click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
    await page.locator('[data-step="2"]').click();
    await page.waitForSelector('.studio-visual-adjustment:visible');
    await currentSlide().locator('details').filter({ has: page.locator('[data-director-note]') }).locator('summary').click();
    await currentSlide().locator('[data-director-note]').fill('减少卡片，让文字参与构图');
    assert.equal(await currentSlide().locator('[data-action="direct"]').isEnabled(), true, 'director notes do not create unsaved content edits');
    await click('direct'); await done(8);
    assert.equal(calls.direct, 1); assert.equal(calls.image, 2); assert.equal(calls.voice, 2);
    assert.equal(await currentSlide().locator('[data-action="approve-plan"]').isDisabled(), true, 'visual redesign preserves narrative approval');
    const editedScene = await currentSlide().getAttribute('data-shot');
    await currentSlide().locator('[data-field="title"]').fill('保存并制作验证');
    assert.equal(await page.locator('[data-action="produce"]').isEnabled(), true, 'production can save current edits without an extra save/approve round');
    assert.match(await page.locator('[data-action="produce"]').textContent(), /Save & Produce/);
    const unsafeFollowups = [];
    const trackFollowups = request => {
      if (/\/(?:approve|jobs)$/.test(new URL(request.url()).pathname)) unsafeFollowups.push(request.url());
    };
    const draftRoute = '**/api/copilot/studio/*/draft';
    await page.route(draftRoute, route => route.fulfill({ status: 409, contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'REVISION', message: '固定夹具：保存失败，未制作。' } }) }));
    page.on('request', trackFollowups);
    for (const action of ['prepare-assets', 'produce']) {
      const failedSave = page.waitForResponse(response => response.url().endsWith('/draft') && response.status() === 409);
      if (action === 'prepare-assets') page.once('dialog', dialog => dialog.accept());
      await click(action);
      await failedSave;
      await page.waitForFunction(() => document.getElementById('studio-message').textContent.includes('固定夹具：保存失败') &&
        !document.querySelector('[data-action="produce"]').disabled);
    }
    page.off('request', trackFollowups);
    assert.deepEqual(unsafeFollowups, [], 'failed saves must not confirm or produce an older proposal');
    assert.equal(await currentSlide().locator('[data-field="title"]').inputValue(), '保存并制作验证');
    await page.unroute(draftRoute);
    await click('produce');
    await page.waitForFunction(() => /制作完整视频|Produce Full Video/.test(document.querySelector('#studio-jobs .studio-job strong')?.textContent || ''));
    await done(8);
    assert.equal(calls.clip, 4, 'both new compositions render, including a graphics-only scene without an image');
    assert.equal(calls.export, 2);
    assert.equal(calls.image, 2); assert.equal(calls.voice, 2, 'full production reuses existing image and voice');
    const produced = JSON.parse(await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8'));
    assert.equal(produced.scenes.find(item => item.id === editedScene).title, '保存并制作验证');
    assert.equal(produced.planApproval, planKey(produced), 'explicit production confirms the newly saved proposal');
    await click('view-export');
    let legacyPreview = true;
    await page.route(snapshotRoute, async route => {
      const response = await route.fetch(), data = await response.json();
      if (legacyPreview) {
        data.legacyComposition = true;
        data.scenes.forEach(scene => { delete scene.composition; });
      }
      await route.fulfill({ response, json: data });
    });
    await page.locator('[data-step="2"]').click();
    await page.waitForSelector('.studio-visual-adjustment:visible');
    await page.reload();
    await page.waitForSelector('[data-gallery-slide]:not([hidden]) [data-legacy-upgrade] [data-action="direct"]');
    await checkWorkbench('2-legacy');
    assert.equal(await currentSlide().locator('[data-legacy-upgrade] [data-action="direct"]').isVisible(), true, 'legacy warning contains a direct update action');
    const designRequest = page.waitForRequest(request => request.url().endsWith('/jobs') && request.postDataJSON().kind === 'direct');
    await currentSlide().locator('[data-legacy-upgrade] [data-action="direct"]').click();
    await designRequest;
    legacyPreview = false;
    await page.waitForFunction(() => /AI重新设计画面|AI Visual Redesign/.test(document.querySelector('#studio-jobs .studio-job strong')?.textContent || ''));
    await done(8);
    assert.equal(calls.direct, 2, 'one click on the legacy prompt submits a real design job');
    assert.equal(await page.locator('[data-legacy-upgrade]').count(), 0);
    assert.equal(calls.image, 2); assert.equal(calls.voice, 2, 'updating legacy design does not regenerate media');
    await page.unroute(snapshotRoute);
    await page.locator('.studio-bin-scene').first().click();
    await currentSlide().locator('[data-field="title"]').fill('取消覆盖时保留草稿');
    const beforeRegeneration = await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8');
    const previousImage = await currentSlide().locator('.studio-composition-art').getAttribute('data-media');
    page.once('dialog', async dialog => {
      assert.match(dialog.message(), /替换|replac/i);
      await dialog.dismiss();
    });
    await click('prepare-assets');
    await page.waitForFunction(() => /已取消重新生成|Regeneration cancelled/.test(document.getElementById('studio-message').textContent));
    assert.equal(await readFile(join(dataRoot, projectDirectory, 'project.json'), 'utf8'), beforeRegeneration);
    assert.equal(await currentSlide().locator('[data-field="title"]').inputValue(), '取消覆盖时保留草稿');
    let releaseRegeneration;
    const regenerationGate = new Promise(resolve => { releaseRegeneration = resolve; });
    let releaseVoice;
    voiceGate = new Promise(resolve => { releaseVoice = resolve; });
    const jobRoute = '**/api/copilot/studio/*/jobs';
    await page.route(jobRoute, async route => { await regenerationGate; await route.continue(); });
    try {
      page.once('dialog', dialog => dialog.accept());
      const request = page.waitForRequest(request => request.url().endsWith('/jobs') && request.postDataJSON().kind === 'assets');
      await click('prepare-assets');
      const submitted = await request;
      assert.equal(submitted.postDataJSON().force, true);
      assert.equal(await page.locator('#studio-batch-progress').isVisible(), true);
      assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('value'), null, 'submission is immediately visible and indeterminate, not the previous completed job');
      assert.equal(calls.image, 2); assert.equal(calls.voice, 2);
      releaseRegeneration();
      await page.waitForFunction(() => document.getElementById('studio-batch-progress').querySelector('progress').value === 1);
      await page.waitForFunction(key => {
        const image = document.querySelector('.studio-gallery-slide:not([hidden]) .studio-composition-art');
        return image?.dataset.media !== key && image?.naturalWidth > 0;
      }, previousImage);
      assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('max'), '3');
    } finally { releaseRegeneration(); releaseVoice(); voiceGate = null; }
    await page.waitForFunction(() => /批量准备素材|Batch Assets/.test(document.querySelector('#studio-jobs .studio-job strong')?.textContent || ''));
    await done(8);
    await page.unroute(jobRoute);
    assert.equal(calls.image, 3); assert.equal(calls.voice, 4, 'confirmed regeneration reruns every required asset, skipping the graphics-only image');
    assert.equal(calls.clip, 4); assert.equal(calls.export, 2, 'regeneration does not automatically rebuild video');
    assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('value'), '3');
    assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('max'), '3');
    assert.match(await page.locator('#studio-batch-progress').textContent(), /复用 0|Reused 0/);
    assert.equal(await page.locator('[data-action="view-export"]').count(), 0, 'old film is not presented as current after material replacement');
    await page.reload(); await page.waitForSelector('#studio-batch-progress progress');
    assert.equal(await page.locator('#studio-batch-progress progress').getAttribute('value'), '3', 'regeneration progress survives reload');
    assert.equal(calls.image, 3); assert.equal(calls.voice, 4);
    assert.deepEqual(errors, []);
    console.log('PASS Studio browser: automatic login check, header model restore, no checkbox/inference on load, auth error states, no model fallback, unsaved draft preservation, editor geometry, gallery simulation, cached local media/export, mobile, English, dark mode.');
    console.log(JSON.stringify(calls));
  } finally {
    await context.close(); await browser.close();
    await new Promise(resolve => {server.close(resolve); server.closeAllConnections();});
    await rm(dataRoot, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

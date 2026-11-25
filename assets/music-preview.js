(() => {
  const FALLBACK_CATALOG = [
    { slug: 'showcase-pop', order: 1, genreIcon: '🎵', genreBadge: { zh: '都市流行', en: 'City Pop' }, title: { zh: '霓虹晚风 · 现代都市流行', en: 'Neon Evening Breeze · City Pop' }, bpm: 112, key: 'A major' },
    { slug: 'showcase-ballad', order: 2, genreIcon: '🎹', genreBadge: { zh: '深情抒情', en: 'Piano Ballad' }, title: { zh: '旧站台微光 · 电影感钢琴抒情', en: 'Platform Glow · Piano Ballad' }, bpm: 72, key: 'Eb major' },
    { slug: 'showcase-guofeng', order: 3, genreIcon: '🪈', genreBadge: { zh: '东方国风', en: 'Guofeng' }, title: { zh: '烟雨姑苏行 · 东方戏腔竹笛国风', en: 'Misty Suzhou · Guofeng Fusion' }, bpm: 96, key: 'D minor' },
    { slug: 'showcase-rap', order: 4, genreIcon: '🎤', genreBadge: { zh: '硬核说唱', en: 'Hard Boom-Bap' }, title: { zh: 'Ignite 黄金律动 · 硬核切分说唱', en: 'Ignite V2 Pocket · Hard Boom-Bap' }, bpm: 94, key: 'F# minor' },
    { slug: 'showcase-rock', order: 5, genreIcon: '🎸', genreBadge: { zh: '高燃摇滚', en: 'Arena Rock' }, title: { zh: '逆风破晓 · 高燃体育馆摇滚', en: 'Into the Dawn · Arena Rock' }, bpm: 132, key: 'E minor' },
    { slug: 'copilot-studio-ignite-rap', order: 6, isBaseline: true, genreIcon: '📊', genreBadge: { zh: '原曲对照', en: 'Baseline' }, title: { zh: 'Ignite 原曲对照（未调优基线）', en: 'Ignite Original Baseline' }, bpm: 100, key: 'A minor' },
  ];

  const SHORT_LABELS = {
    'showcase-pop': { zh: '都市流行', en: 'City Pop' },
    'showcase-ballad': { zh: '深情抒情', en: 'Piano Ballad' },
    'showcase-guofeng': { zh: '东方国风', en: 'Guofeng' },
    'showcase-rap': { zh: '硬核说唱', en: 'Boom-Bap Rap' },
    'showcase-rock': { zh: '高燃摇滚', en: 'Arena Rock' },
    'copilot-studio-ignite-rap': { zh: 'Ignite 原曲对照', en: 'Ignite Baseline' },
  };

  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') === 'en' ? 'en' : 'zh';
  let currentSlug = (params.get('track') || 'showcase-pop').replace(/[^a-z0-9_-]/gi, '');
  let catalog = [...FALLBACK_CATALOG];
  let meta = null, cues = [], actx = null, analyser = null, freq = null, activeIdx = -1, reqToken = 0;

  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('play-btn');
  const seek = document.getElementById('seek');
  const curEl = document.getElementById('cur-time');
  const totEl = document.getElementById('tot-time');
  const stripEl = document.getElementById('track-strip');
  const listEl = document.getElementById('lyrics-list');
  const noteEl = document.getElementById('sync-note');
  const canvas = document.getElementById('spectrum');
  const ctx2d = canvas.getContext('2d');

  const fmt = s => !Number.isFinite(s) || s < 0 ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const esc = str => String(str ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function renderStrip() {
    stripEl.innerHTML = catalog.map(item => {
      const active = item.slug === currentSlug ? ' active' : '';
      const baseCls = item.isBaseline ? ' baseline' : '';
      const label = SHORT_LABELS[item.slug]?.[lang] || item.genreBadge?.[lang] || item.slug;
      const badgeTxt = item.isBaseline
        ? (lang === 'en' ? 'A/B Baseline' : 'A/B 对照')
        : (item.prosodyAudit?.warnings === 0 ? (lang === 'en' ? '0-Warn Master' : '-14 LUFS 精调') : 'MLX');
      const durTxt = item.durationSeconds ? fmt(item.durationSeconds) : '--:--';
      const subMeta = `${item.bpm || '--'} BPM · ${durTxt}`;
      return `<button type="button" class="track-tab${active}${baseCls}" data-slug="${esc(item.slug)}" aria-pressed="${item.slug === currentSlug}">
        <span class="tab-head"><span>${esc(item.genreIcon || '🎵')} ${esc(label)}</span><span class="tab-tag">${esc(badgeTxt)}</span></span>
        <span class="tab-name">${esc(item.title?.[lang] || item.slug)}</span>
        <span class="tab-meta">${esc(subMeta)}</span>
      </button>`;
    }).join('');
    stripEl.querySelectorAll('.track-tab').forEach(btn => {
      btn.onclick = () => selectTrack(btn.dataset.slug, true);
    });
  }

  function renderMeta() {
    if (!meta) return;
    document.getElementById('track-title').textContent = meta.title?.[lang] || meta.slug;
    document.getElementById('track-sub').textContent = meta.subtitle?.[lang] || '';
    const genreBadge = document.getElementById('genre-badge');
    genreBadge.textContent = `${meta.genreIcon || '🎵'} ${meta.genreBadge?.[lang] || meta.slug}`;
    const modeBadge = document.getElementById('mode-badge');
    if (meta.isBaseline) {
      modeBadge.className = 'badge warn';
      modeBadge.textContent = lang === 'en' ? 'Pre-Optimization Baseline (4 Lint Warnings)' : '优化前平淡基线（4 项静态告警）';
    } else {
      modeBadge.className = 'badge secondary';
      modeBadge.textContent = lang === 'en' ? '3-Part Prompt · 0 Warnings · -14 LUFS Master' : '三段式聚焦 · 0 警告 · -14 LUFS 母带唤醒';
    }

    const specs = [];
    if (meta.durationSeconds) specs.push(fmt(meta.durationSeconds));
    if (meta.bpm) specs.push(`${meta.bpm} BPM`);
    if (meta.key) specs.push(meta.key);
    if (meta.sampleRate) specs.push(`${(meta.sampleRate / 1000).toFixed(1)} kHz Stereo`);
    specs.push('MiniMax-Music3 mxfp8');
    document.getElementById('track-specs').innerHTML = specs.map(s => `<span class="spec">${esc(s)}</span>`).join('');

    const lufs = meta.integratedLufs != null ? `${meta.integratedLufs} LUFS` : `${meta.rmsDbfs ?? '--'} dBFS`;
    const lift = meta.chorusVsVerseDb != null ? `${meta.chorusVsVerseDb >= 0 ? '+' : ''}${meta.chorusVsVerseDb} dB` : '--';
    const syl = meta.prosodyAudit
      ? `${meta.prosodyAudit.verseAvgSyllables ?? '--'} → ${meta.prosodyAudit.chorusAvgSyllables ?? '--'}`
      : '--';
    const metrics = [
      { k: lang === 'en' ? 'Integrated Loudness' : '母带响度 (LUFS)', v: lufs },
      { k: lang === 'en' ? 'Chorus Dynamic Lift' : '主副歌动态抬升', v: lift },
      { k: lang === 'en' ? 'Verse → Chorus Syllables' : '主→副歌句均音节', v: syl },
    ];
    document.getElementById('track-metrics').innerHTML = metrics.map(m =>
      `<div class="metric-box"><span class="metric-label">${esc(m.k)}</span><span class="metric-val">${esc(m.v)}</span></div>`
    ).join('');

    const motifEl = document.getElementById('motif-box');
    const motifTxt = meta.motifSummary?.[lang];
    if (motifTxt) {
      motifEl.hidden = false;
      document.getElementById('motif-text').textContent = motifTxt;
    } else {
      motifEl.hidden = true;
    }

    const hp = meta.hyperparams || {};
    const pills = [
      hp.temperature != null ? `temp=${hp.temperature}` : null,
      hp.arCfgScale != null ? `ar_cfg=${hp.arCfgScale}` : null,
      hp.arTopK != null ? `top_k=${hp.arTopK}` : null,
      hp.ditCfgScale != null ? `dit_cfg=${hp.ditCfgScale}` : null,
      hp.steps != null ? `steps=${hp.steps}` : null,
      hp.seed != null ? `seed=${hp.seed}` : null,
    ].filter(Boolean);
    document.getElementById('param-pills').innerHTML = pills.map(p => `<span class="param-pill">${esc(p)}</span>`).join('');
    document.getElementById('prompt-text').textContent = meta.prompt || '';
  }

  function applyLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.getElementById('lang-btn').textContent = lang === 'en' ? '中文' : 'EN';
    document.querySelectorAll('[data-zh]').forEach(el => { el.textContent = el.getAttribute(`data-${lang}`); });
    if (!audio.paused) noteEl.textContent = lang === 'en' ? 'Playing' : '播放中';
    else if (audio.currentTime > 0) noteEl.textContent = lang === 'en' ? 'Paused' : '已暂停';
    else noteEl.textContent = lang === 'en' ? 'Ready' : '就绪';
    renderStrip();
    renderMeta();
  }

  function buildCues(dur) {
    if (!meta?.sections?.length || !Number.isFinite(dur) || dur <= 0) return;
    const totalW = meta.sections.reduce((s, x) => s + (x.weight || x.lines.length), 0) || 1;
    let acc = 0;
    cues = meta.sections.map((sec, idx) => {
      const start = sec.startSeconds ?? (dur * acc / totalW);
      acc += (sec.weight || sec.lines.length);
      const end = sec.endSeconds ?? (dur * acc / totalW);
      const stamp = document.getElementById(`stamp-${idx}`);
      if (stamp) stamp.textContent = fmt(start);
      return { start, end, idx };
    });
  }

  function updateActiveSection(t) {
    const found = cues.findIndex(c => t >= c.start && t < c.end);
    const idx = found === -1 && cues.length && t >= cues[cues.length - 1].start ? cues.length - 1 : found;
    if (idx !== activeIdx) {
      activeIdx = idx;
      listEl.querySelectorAll('.sec-card').forEach((el, i) => el.classList.toggle('active', i === idx));
      const card = listEl.children[idx];
      if (card && !audio.paused) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function ensureWebAudio() {
    if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    actx = new AC();
    analyser = actx.createAnalyser();
    analyser.fftSize = 128;
    actx.createMediaElementSource(audio).connect(analyser);
    analyser.connect(actx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
  }

  function draw() {
    requestAnimationFrame(draw);
    const w = canvas.width, h = canvas.height, styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent').trim(), idle = styles.getPropertyValue('--bar-idle').trim();
    ctx2d.clearRect(0, 0, w, h);
    const bars = 46, gap = 5, bw = (w - gap * (bars + 1)) / bars;
    if (analyser && !audio.paused) analyser.getByteFrequencyData(freq);
    for (let i = 0; i < bars; i++) {
      const v = (analyser && !audio.paused) ? freq[i % freq.length] / 255 : (0.14 + 0.08 * Math.sin(i * 0.45));
      const bh = Math.max(8, v * (h - 24)), x = gap + i * (bw + gap), y = h - bh - 10;
      ctx2d.fillStyle = !audio.paused ? accent : idle;
      ctx2d.beginPath(); ctx2d.roundRect(x, y, bw, bh, 5); ctx2d.fill();
    }
  }

  async function selectTrack(slug, autoPlay = false) {
    currentSlug = slug;
    const token = ++reqToken;
    const url = new URL(location.href);
    url.searchParams.set('track', slug);
    history.replaceState(null, '', url);
    renderStrip();

    audio.pause();
    playBtn.textContent = '▶';
    curEl.textContent = '0:00';
    totEl.textContent = '--:--';
    seek.value = '0';
    activeIdx = -1;
    cues = [];

    const base = `/api/local-music/tracks/${slug}`;
    document.getElementById('dl-wav').href = `${base}.wav?download=1`;
    document.getElementById('dl-m4a').href = `${base}.m4a?download=1`;
    audio.src = `${base}.m4a`;
    audio.onerror = () => { if (!audio.src.endsWith('.wav')) audio.src = `${base}.wav`; };

    try {
      const res = await fetch(`${base}.meta.json`);
      if (!res.ok) throw new Error('missing');
      const data = await res.json();
      if (token !== reqToken) return;
      meta = data;
      renderMeta();
      listEl.innerHTML = (data.sections || []).map((sec, idx) =>
        `<div class="sec-card" data-idx="${idx}"><div class="sec-tag"><span>${esc(sec.tag)}</span><span id="stamp-${idx}">--:--</span></div>${sec.lines.map(l => `<p class="sec-line">${esc(l)}</p>`).join('')}</div>`
      ).join('');
      listEl.querySelectorAll('.sec-card').forEach(el => {
        el.onclick = () => {
          const c = cues[Number(el.dataset.idx)];
          if (c) { ensureWebAudio(); audio.currentTime = c.start; audio.play().catch(() => {}); }
        };
      });
      buildCues(audio.duration || data.durationSeconds);
      noteEl.textContent = lang === 'en' ? 'Ready' : '就绪';
      if (autoPlay) {
        ensureWebAudio();
        audio.play().catch(() => {});
      }
    } catch {
      if (token !== reqToken) return;
      noteEl.textContent = lang === 'en' ? 'Rendering track on M4 Max…' : '本机 M4 Max 正在渲染该曲目…';
    }
  }

  document.getElementById('lang-btn').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; applyLang(); };
  document.getElementById('theme-btn').onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kh_music_theme', next);
  };
  playBtn.onclick = () => { ensureWebAudio(); audio.paused ? audio.play() : audio.pause(); };
  audio.onplay = () => { playBtn.textContent = '⏸'; noteEl.textContent = lang === 'en' ? 'Playing' : '播放中'; };
  audio.onpause = () => { playBtn.textContent = '▶'; noteEl.textContent = lang === 'en' ? 'Paused' : '已暂停'; };
  audio.onloadedmetadata = () => { totEl.textContent = fmt(audio.duration); buildCues(audio.duration); };
  audio.ontimeupdate = () => {
    if (audio.duration) seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    curEl.textContent = fmt(audio.currentTime);
    updateActiveSection(audio.currentTime);
  };
  seek.oninput = () => { if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration; };

  fetch('/api/local-music/tracks')
    .then(r => r.ok ? r.json() : null)
    .then(payload => {
      if (payload?.tracks?.length) {
        const bySlug = new Map(payload.tracks.map(t => [t.slug, t]));
        catalog = FALLBACK_CATALOG.map(fb => bySlug.get(fb.slug) || fb);
        for (const extra of payload.tracks) {
          if (!catalog.some(c => c.slug === extra.slug)) catalog.push(extra);
        }
        if (!bySlug.has(currentSlug)) currentSlug = payload.tracks[0].slug;
      }
    })
    .catch(() => {})
    .finally(() => {
      applyLang();
      selectTrack(currentSlug, false);
    });

  draw();
})();

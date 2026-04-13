// ============================================================
// Cell Game — Canvas shooter mini-game for Cell layout
// ============================================================
// Auto-initializes on DOMContentLoaded.
// Requires: #cell-game-btn, #cell-game-canvas, #cell-game-hud,
//           #cell-game-over, #cell-game-final-score, #cell-game-restart
// Uses global: currentLayout (from index.html)
// ============================================================

(function () {
  var gameBtn = document.getElementById('cell-game-btn');
  var canvas = document.getElementById('cell-game-canvas');
  var ctx = canvas.getContext('2d');
  var hudEl = document.getElementById('cell-game-hud');
  var overEl = document.getElementById('cell-game-over');
  var finalScoreEl = document.getElementById('cell-game-final-score');
  var restartBtn = document.getElementById('cell-game-restart');
  var nextBtn = document.getElementById('cell-game-next');
  var quitBtn = document.getElementById('cell-game-quit');
  var titleEl = document.getElementById('cell-game-title');
  var roundInfoEl = document.getElementById('cell-game-round-info');

  var gameActive = false;
  var gameFrame = null;
  var score = 0;
  var round = 1;
  var totalScore = 0;

  // Ship state
  var ship = { x: 0, y: 0, r: 14, angle: 0, vx: 0, vy: 0 };
  var keys = { w: false, a: false, s: false, d: false };
  var mouse = { x: 0, y: 0 };
  var bullets = [];
  var missiles = [];
  var smokes = [];
  var debris = [];
  var targets = [];
  var enemyBullets = [];
  var powerups = [];

  // Weapon system
  var weaponMode = 0; // 0=rapid, 1=shotgun, 2=homing
  var weaponNames = ['RAPID', 'SHOTGUN', 'HOMING'];
  var weaponColors = ['#ffdd44', '#ff8844', '#44ffaa'];
  var wpnLevel = { speed: 0, spread: 0, count: 0 }; // 0-4 each
  var missileCooldown = 0;
  var MISSILE_CD = 120; // frames between Macross salvos

  // Powerup types
  var POWERUP_TYPES = [
    { id: 'wp_rapid',   label: 'R', color: '#ffdd44', desc: 'Rapid Fire' },
    { id: 'wp_shotgun', label: 'S', color: '#ff8844', desc: 'Shotgun' },
    { id: 'wp_homing',  label: 'H', color: '#44ffaa', desc: 'Homing' },
    { id: 'up_speed',   label: '\u2191', color: '#00ddff', desc: 'Speed+' },
    { id: 'up_spread',  label: '\u25C7', color: '#ff66cc', desc: 'Spread+' },
    { id: 'up_count',   label: '+', color: '#ffaa00', desc: 'Count+' },
    { id: 'up_hp',      label: '\u2665', color: '#ff4444', desc: 'HP+1' }
  ];
  var knowledgeLabels = [
    'AI','LLM','GPU','API','RAG','MLP','GAN','NLP','CNN','RNN',
    'BERT','GPT','LoRA','RLHF','SFT','DPO','MoE','KV$','FP16',
    'INT4','CUDA','VRAM','FLOP','Adam','Loss','Grad','Attn',
    'FFN','Emb','BPE','CoT','ToT','ReAct','MCTS','GRPO'
  ];
  var gameTimer = 0;

  // ── Audio (Web Audio API, no external files) ──
  var audioCtx = null;
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playTone(freq, dur, type, vol, detune) {
    try {
      var a = getAudio();
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      if (detune) o.detune.value = detune;
      g.gain.setValueAtTime(vol || 0.08, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      o.connect(g);
      g.connect(a.destination);
      o.start(a.currentTime);
      o.stop(a.currentTime + dur);
    } catch (e) { /* audio not available */ }
  }
  function playNoise(dur, vol) {
    try {
      var a = getAudio();
      var bufSize = Math.floor(a.sampleRate * dur);
      var buf = a.createBuffer(1, bufSize, a.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      var src = a.createBufferSource();
      src.buffer = buf;
      var g = a.createGain();
      g.gain.setValueAtTime(vol || 0.06, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      src.connect(g);
      g.connect(a.destination);
      src.start(a.currentTime);
    } catch (e) {}
  }
  var sfx = {
    shoot: function () { playTone(880, 0.08, 'square', 0.06); },
    missile: function () {
      try {
        var a = getAudio();
        var dur = 0.35;
        var bufSize = Math.floor(a.sampleRate * dur);
        var buf = a.createBuffer(1, bufSize, a.sampleRate);
        var data = buf.getChannelData(0);
        // Whoosh: filtered noise with rising pitch sweep
        for (var i = 0; i < bufSize; i++) {
          var t = i / a.sampleRate;
          var freq = 800 + t * 3000; // rising sweep
          var sine = Math.sin(2 * Math.PI * freq * t);
          var noise = Math.random() * 2 - 1;
          data[i] = (sine * 0.3 + noise * 0.7) * Math.exp(-t * 6);
        }
        var src = a.createBufferSource();
        src.buffer = buf;
        var g = a.createGain();
        g.gain.setValueAtTime(0.1, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
        var filt = a.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(1200, a.currentTime);
        filt.frequency.linearRampToValueAtTime(4000, a.currentTime + dur);
        filt.Q.value = 2;
        src.connect(filt);
        filt.connect(g);
        g.connect(a.destination);
        src.start(a.currentTime);
      } catch (e) {}
    },
    hit: function () { playTone(400 + Math.random() * 200, 0.1, 'square', 0.05); playNoise(0.05, 0.04); },
    destroy: function () { playNoise(0.3, 0.1); playTone(160, 0.3, 'sawtooth', 0.08); playTone(80, 0.4, 'sine', 0.06); },
    shipHit: function () { playNoise(0.15, 0.12); playTone(200, 0.2, 'square', 0.1); playTone(100, 0.3, 'sawtooth', 0.08); },
    intercept: function () { playTone(1200, 0.06, 'sine', 0.04); playTone(1600, 0.04, 'sine', 0.03); },
    pickup: function () { playTone(1047, 0.08, 'square', 0.06); playTone(1319, 0.08, 'square', 0.05); },
    weaponSwitch: function () { playTone(660, 0.06, 'triangle', 0.05); playTone(880, 0.06, 'triangle', 0.04); },
    gameOver: function () {
      playTone(300, 0.3, 'sawtooth', 0.1);
      setTimeout(function () { playTone(200, 0.3, 'sawtooth', 0.1); }, 200);
      setTimeout(function () { playTone(100, 0.6, 'sawtooth', 0.12); }, 400);
    },
    victory: function () {
      playTone(523, 0.15, 'square', 0.08);
      setTimeout(function () { playTone(659, 0.15, 'square', 0.08); }, 120);
      setTimeout(function () { playTone(784, 0.15, 'square', 0.08); }, 240);
      setTimeout(function () { playTone(1047, 0.3, 'square', 0.1); }, 360);
    }
  };

  // Game icon SVGs
  var playIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>';
  var exitIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildTargets() {
    targets = [];
    var cellArticles = document.querySelectorAll('#cell-view .cell-article');
    cellArticles.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var r = Math.max(rect.width, rect.height) / 2;
      if (r < 4) return;
      var bgStyle = el.style.background || '';
      var diff = getDifficulty();
      targets.push({
        x: cx, y: cy, r: r, origR: r,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rawColor: extractColorFromBg(bgStyle),
        hp: diff.articleHp, maxHp: diff.articleHp, alive: true, el: el
      });
    });
    var cellBubbles = document.querySelectorAll('#cell-view .cell-bubble');
    cellBubbles.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var r = Math.max(rect.width, rect.height) / 2.5;
      if (r < 10) return;
      var diff = getDifficulty();
      targets.push({
        x: cx, y: cy, r: r, origR: r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        rawColor: '#5588aa',
        hp: diff.bubbleHp, maxHp: diff.bubbleHp, alive: true, el: el
      });
    });
  }

  function syncTargetPositions() {
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (!t.alive || !t.el) continue;
      var rect = t.el.getBoundingClientRect();
      t.x = rect.left + rect.width / 2;
      t.y = rect.top + rect.height / 2;
      t.r = Math.max(rect.width, rect.height) / 2;
    }
  }

  function extractColorFromBg(bg) {
    var m = bg.match(/#[0-9a-fA-F]{3,8}/);
    return m ? m[0] : '#888';
  }

  function getDifficulty() {
    return {
      articleHp: 3 + round,
      bubbleHp: 6 + round * 2,
      enemySpeed: Math.min(4.5, 2.2 + round * 0.3),
      fireInterval: Math.max(15, 90 - round * 12),
      shipHp: 3
    };
  }

  function startGame() {
    score = 0;
    resizeCanvas();
    canvas.classList.add('active');
    hudEl.classList.add('active');
    overEl.classList.remove('active');
    document.body.classList.add('cell-game-on');
    gameBtn.innerHTML = exitIcon;
    var diff = getDifficulty();
    hudEl.textContent = 'R' + round + '  SCORE: 0  HP: ' + diff.shipHp;

    ship.x = 100;
    ship.y = canvas.height - 100;
    ship.vx = 0; ship.vy = 0;
    ship.hp = diff.shipHp;
    bullets = [];
    missiles = [];
    smokes = [];
    debris = [];
    enemyBullets = [];
    powerups = [];
    gameTimer = 0;
    weaponMode = 0;
    wpnLevel = { speed: 0, spread: 0, count: 0 };
    missileCooldown = 0;
    buildTargets();

    window._cellGameActive = true;
    window.addEventListener('resize', resizeCanvas);

    // Intro sequence: BGM + countdown, then combat
    playIntroBGM();
    runCountdown(function () {
      gameActive = true;
      window.addEventListener('keydown', onGameKeyDown);
      window.addEventListener('keyup', onGameKeyUp);
      canvas.addEventListener('mousemove', onGameMouseMove);
      canvas.addEventListener('mousedown', onGameMouseDown);
      canvas.addEventListener('contextmenu', onGameContextMenu);
      gameFrame = requestAnimationFrame(gameLoop);
    });
  }

  function playIntroBGM() {
    try {
      var a = getAudio();
      var now = a.currentTime;
      // 8-bit style intro jingle — ascending arpeggio with beat
      var notes = [
        [262, 0.12], [330, 0.12], [392, 0.12], [523, 0.18],
        [392, 0.10], [523, 0.14], [659, 0.22],
        [523, 0.10], [659, 0.14], [784, 0.30]
      ];
      var t = now;
      for (var i = 0; i < notes.length; i++) {
        var o = a.createOscillator();
        var g = a.createGain();
        o.type = 'square';
        o.frequency.value = notes[i][0];
        g.gain.setValueAtTime(0.07, t);
        g.gain.setValueAtTime(0.07, t + notes[i][1] * 0.7);
        g.gain.exponentialRampToValueAtTime(0.001, t + notes[i][1]);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + notes[i][1]);
        t += notes[i][1] + 0.02;
      }
      // Bass drum hits
      var beats = [0, 0.26, 0.52, 0.78, 1.04];
      for (var b = 0; b < beats.length; b++) {
        var bo = a.createOscillator();
        var bg = a.createGain();
        bo.type = 'sine';
        bo.frequency.setValueAtTime(150, now + beats[b]);
        bo.frequency.exponentialRampToValueAtTime(40, now + beats[b] + 0.12);
        bg.gain.setValueAtTime(0.12, now + beats[b]);
        bg.gain.exponentialRampToValueAtTime(0.001, now + beats[b] + 0.15);
        bo.connect(bg);
        bg.connect(a.destination);
        bo.start(now + beats[b]);
        bo.stop(now + beats[b] + 0.15);
      }
    } catch (e) {}
  }

  var countdownFrame = null;
  function runCountdown(onReady) {
    var W = canvas.width, H = canvas.height;
    var countStart = Date.now();
    var totalMs = 2000; // 2 seconds countdown
    var labels = ['READY', 'R' + round, 'GO!'];

    function drawCountdown() {
      var elapsed = Date.now() - countStart;
      ctx.clearRect(0, 0, W, H);

      // Draw targets in background (static)
      // dim background
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, W, H);

      var phase = Math.min(2, Math.floor(elapsed / (totalMs / 3)));
      var phaseProgress = (elapsed % (totalMs / 3)) / (totalMs / 3);
      var label = labels[Math.min(phase, labels.length - 1)];

      // Scale animation
      var scale = 1 + (1 - phaseProgress) * 0.5;
      var alpha = phase === 2 ? Math.max(0, 1 - phaseProgress * 2) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold ' + Math.floor(72 * scale) + 'px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = phase === 2 ? '#00ff88' : '#00ddff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.fillText(label, W / 2, H / 2);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Round info subtitle
      if (phase < 2) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.font = '18px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        var diff = getDifficulty();
        ctx.fillText('Target HP: ' + diff.articleHp + '  Enemy Speed: ' + diff.enemySpeed.toFixed(1), W / 2, H / 2 + 60);
        ctx.restore();
      }

      if (elapsed < totalMs) {
        countdownFrame = requestAnimationFrame(drawCountdown);
      } else {
        ctx.clearRect(0, 0, W, H);
        onReady();
      }
    }
    countdownFrame = requestAnimationFrame(drawCountdown);
  }

  function restoreTargets() {
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (!t.el) continue;
      t.el.style.opacity = '';
      t.el.style.transform = '';
      t.el.style.transition = '';
    }
  }

  function stopGame() {
    gameActive = false;
    if (gameFrame) cancelAnimationFrame(gameFrame);
    if (countdownFrame) { cancelAnimationFrame(countdownFrame); countdownFrame = null; }
    canvas.classList.remove('active');
    hudEl.classList.remove('active');
    overEl.classList.remove('active');
    document.body.classList.remove('cell-game-on');
    gameBtn.innerHTML = playIcon;
    keys.w = keys.a = keys.s = keys.d = false;

    restoreTargets();

    window._cellGameActive = false;

    window.removeEventListener('keydown', onGameKeyDown);
    window.removeEventListener('keyup', onGameKeyUp);
    canvas.removeEventListener('mousemove', onGameMouseMove);
    canvas.removeEventListener('mousedown', onGameMouseDown);
    canvas.removeEventListener('contextmenu', onGameContextMenu);
    window.removeEventListener('resize', resizeCanvas);
  }

  function gameWin() {
    gameActive = false;
    if (gameFrame) cancelAnimationFrame(gameFrame);
    totalScore += score;
    titleEl.textContent = '🎉 VICTORY!';
    titleEl.className = 'win-title';
    finalScoreEl.textContent = '本轮得分: ' + score + '  |  总分: ' + totalScore;
    roundInfoEl.style.display = '';
    roundInfoEl.textContent = '第 ' + round + ' 轮通关！下一轮难度将提升';
    restartBtn.style.display = 'none';
    nextBtn.style.display = '';
    overEl.classList.add('active');

    window.removeEventListener('keydown', onGameKeyDown);
    window.removeEventListener('keyup', onGameKeyUp);
    canvas.removeEventListener('mousemove', onGameMouseMove);
    canvas.removeEventListener('mousedown', onGameMouseDown);
    canvas.removeEventListener('contextmenu', onGameContextMenu);
  }

  function gameOver() {
    gameActive = false;
    if (gameFrame) cancelAnimationFrame(gameFrame);
    totalScore += score;
    titleEl.textContent = 'GAME OVER';
    titleEl.className = 'lose-title';
    finalScoreEl.textContent = '本轮得分: ' + score + '  |  总分: ' + totalScore;
    roundInfoEl.style.display = '';
    roundInfoEl.textContent = '在第 ' + round + ' 轮阵亡';
    restartBtn.style.display = '';
    nextBtn.style.display = 'none';
    overEl.classList.add('active');

    window.removeEventListener('keydown', onGameKeyDown);
    window.removeEventListener('keyup', onGameKeyUp);
    canvas.removeEventListener('mousemove', onGameMouseMove);
    canvas.removeEventListener('mousedown', onGameMouseDown);
    canvas.removeEventListener('contextmenu', onGameContextMenu);
  }

  function onGameKeyDown(e) {
    var k = e.key.toLowerCase();
    if (k === 'escape') { stopGame(); return; }
    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;
    if (k === '1') { weaponMode = 0; sfx.weaponSwitch(); }
    if (k === '2') { weaponMode = 1; sfx.weaponSwitch(); }
    if (k === '3') { weaponMode = 2; sfx.weaponSwitch(); }
    if (k === 'q') { weaponMode = (weaponMode + 2) % 3; sfx.weaponSwitch(); }
    if (k === 'e') { weaponMode = (weaponMode + 1) % 3; sfx.weaponSwitch(); }
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].indexOf(k) !== -1) e.preventDefault();
  }

  function onGameKeyUp(e) {
    var k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = false;
    if (k === 'a' || k === 'arrowleft') keys.a = false;
    if (k === 's' || k === 'arrowdown') keys.s = false;
    if (k === 'd' || k === 'arrowright') keys.d = false;
  }

  function onGameMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function fireWeapon() {
    var angle = Math.atan2(mouse.y - ship.y, mouse.x - ship.x);
    var baseSpeed = 7 + wpnLevel.speed * 1.5;
    var baseCount = 1 + wpnLevel.count;
    var baseSpread = 0.15 + wpnLevel.spread * 0.08;

    if (weaponMode === 0) {
      // Rapid: fast single/multi bullets
      for (var ri = 0; ri < baseCount; ri++) {
        var rOff = (ri - (baseCount - 1) / 2) * baseSpread * 0.4;
        bullets.push({
          x: ship.x + Math.cos(angle + rOff) * (ship.r + 4),
          y: ship.y + Math.sin(angle + rOff) * (ship.r + 4),
          vx: Math.cos(angle + rOff) * baseSpeed,
          vy: Math.sin(angle + rOff) * baseSpeed,
          life: 70, homing: false
        });
      }
    } else if (weaponMode === 1) {
      // Shotgun: spread of pellets
      var pellets = 3 + baseCount * 2;
      var totalSpread = baseSpread * 3;
      for (var si = 0; si < pellets; si++) {
        var sOff = (si - (pellets - 1) / 2) * (totalSpread / pellets);
        var spd = (baseSpeed * 0.7) + Math.random() * 2;
        bullets.push({
          x: ship.x + Math.cos(angle + sOff) * (ship.r + 4),
          y: ship.y + Math.sin(angle + sOff) * (ship.r + 4),
          vx: Math.cos(angle + sOff) * spd,
          vy: Math.sin(angle + sOff) * spd,
          life: 55 + Math.floor(Math.random() * 20), homing: false
        });
      }
    } else {
      // Homing: slower but tracks targets
      for (var hi = 0; hi < baseCount; hi++) {
        var hOff = (hi - (baseCount - 1) / 2) * baseSpread;
        bullets.push({
          x: ship.x + Math.cos(angle + hOff) * (ship.r + 4),
          y: ship.y + Math.sin(angle + hOff) * (ship.r + 4),
          vx: Math.cos(angle + hOff) * (baseSpeed * 0.6),
          vy: Math.sin(angle + hOff) * (baseSpeed * 0.6),
          life: 120, homing: true,
          angle: angle + hOff,
          speed: baseSpeed * 0.6
        });
      }
    }
    sfx.shoot();
  }

  function fireMacrossMissiles() {
    if (missileCooldown > 0) return;
    missileCooldown = MISSILE_CD;
    // Collect alive targets
    var alive = [];
    for (var ti = 0; ti < targets.length; ti++) {
      if (targets[ti].alive) alive.push(targets[ti]);
    }
    if (alive.length === 0) return;
    var count = Math.min(10, Math.max(4, alive.length));
    var backAngle = ship.angle + Math.PI; // behind ship
    sfx.missile();
    for (var mi = 0; mi < count; mi++) {
      var spread = (mi - (count - 1) / 2) * 0.25;
      var launchAngle = backAngle + spread;
      var tgt = alive[mi % alive.length];
      missiles.push({
        x: ship.x + Math.cos(launchAngle) * (ship.r + 8),
        y: ship.y + Math.sin(launchAngle) * (ship.r + 8),
        vx: Math.cos(launchAngle) * 4,
        vy: Math.sin(launchAngle) * 4,
        angle: launchAngle,
        speed: 3,
        life: 200,
        trail: [],
        phase: 0, // 0=spread, 1=turn to target
        phaseTimer: 15 + mi * 3,
        targetIdx: mi % alive.length
      });
    }
  }

  function spawnPowerup(x, y) {
    if (Math.random() > 0.35) return; // 35% drop chance
    var type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    powerups.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: 10,
      life: 600, // 10 seconds at 60fps
      type: type
    });
  }

  function collectPowerup(p) {
    var id = p.type.id;
    if (id === 'wp_rapid') { weaponMode = 0; }
    else if (id === 'wp_shotgun') { weaponMode = 1; }
    else if (id === 'wp_homing') { weaponMode = 2; }
    else if (id === 'up_speed') { wpnLevel.speed = Math.min(4, wpnLevel.speed + 1); }
    else if (id === 'up_spread') { wpnLevel.spread = Math.min(4, wpnLevel.spread + 1); }
    else if (id === 'up_count') { wpnLevel.count = Math.min(4, wpnLevel.count + 1); }
    else if (id === 'up_hp') { ship.hp = Math.min(getDifficulty().shipHp + 2, ship.hp + 1); }
    sfx.pickup();
  }

  function onGameMouseDown(e) {
    if (!gameActive) return;
    if (e.button === 0) {
      fireWeapon();
    }
  }

  function onGameContextMenu(e) {
    e.preventDefault();
    if (!gameActive) return;
    fireMacrossMissiles();
  }

  function gameLoop() {
    if (!gameActive) return;
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var accel = 0.35;
    var friction = 0.94;
    if (keys.w) ship.vy -= accel;
    if (keys.s) ship.vy += accel;
    if (keys.a) ship.vx -= accel;
    if (keys.d) ship.vx += accel;
    ship.vx *= friction;
    ship.vy *= friction;
    ship.x += ship.vx;
    ship.y += ship.vy;
    ship.x = Math.max(ship.r, Math.min(W - ship.r, ship.x));
    ship.y = Math.max(ship.r, Math.min(H - ship.r, ship.y));
    ship.angle = Math.atan2(mouse.y - ship.y, mouse.x - ship.x);

    var i, j;
    // Update bullets (including homing)
    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      if (b.homing) {
        // Find nearest alive target
        var nearBT = null, nearBD = Infinity;
        for (j = 0; j < targets.length; j++) {
          if (!targets[j].alive) continue;
          var bdx = targets[j].x - b.x, bdy = targets[j].y - b.y;
          var bd = bdx * bdx + bdy * bdy;
          if (bd < nearBD) { nearBD = bd; nearBT = targets[j]; }
        }
        if (nearBT) {
          var desA = Math.atan2(nearBT.y - b.y, nearBT.x - b.x);
          var curA = Math.atan2(b.vy, b.vx);
          var diff2 = desA - curA;
          while (diff2 > Math.PI) diff2 -= Math.PI * 2;
          while (diff2 < -Math.PI) diff2 += Math.PI * 2;
          curA += diff2 * 0.08;
          b.vx = Math.cos(curA) * b.speed;
          b.vy = Math.sin(curA) * b.speed;
        }
      }
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
        bullets.splice(i, 1);
      }
    }

    if (missileCooldown > 0) missileCooldown--;

    syncTargetPositions();

    // Enemy fire: each alive target shoots periodically
    gameTimer++;
    var aliveCount = 0;
    for (i = 0; i < targets.length; i++) {
      if (targets[i].alive) aliveCount++;
    }
    // Win check: all targets dead
    var aliveAny = false;
    for (i = 0; i < targets.length; i++) {
      if (targets[i].alive) { aliveAny = true; break; }
    }
    if (!aliveAny && targets.length > 0) {
      gameWin();
      sfx.victory();
      drawGame(W, H);
      return;
    }

    var diff = getDifficulty();
    var fireInterval = Math.max(15, diff.fireInterval - aliveCount);
    for (i = 0; i < targets.length; i++) {
      var et = targets[i];
      if (!et.alive) continue;
      if (!et.shootTimer) et.shootTimer = Math.floor(Math.random() * fireInterval);
      et.shootTimer--;
      if (et.shootTimer <= 0) {
        et.shootTimer = fireInterval + Math.floor(Math.random() * 40);
        var ea = Math.atan2(ship.y - et.y, ship.x - et.x);
        var espd = diff.enemySpeed + Math.random() * 1.0;
        var spreadAngle = (Math.random() - 0.5) * 0.3;
        ea += spreadAngle;
        enemyBullets.push({
          x: et.x, y: et.y,
          vx: Math.cos(ea) * espd,
          vy: Math.sin(ea) * espd,
          r: 5,
          life: 240,
          color: et.rawColor,
          label: knowledgeLabels[Math.floor(Math.random() * knowledgeLabels.length)]
        });
      }
    }

    // Update & cull enemy bullets
    for (i = enemyBullets.length - 1; i >= 0; i--) {
      var eb = enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;
      eb.life--;
      if (eb.life <= 0 || eb.x < -20 || eb.x > W + 20 || eb.y < -20 || eb.y > H + 20) {
        enemyBullets.splice(i, 1);
      }
    }

    // Enemy bullet vs ship collision
    for (i = enemyBullets.length - 1; i >= 0; i--) {
      var eb = enemyBullets[i];
      var ehx = eb.x - ship.x, ehy = eb.y - ship.y;
      if (ehx * ehx + ehy * ehy < (ship.r + eb.r) * (ship.r + eb.r)) {
        enemyBullets.splice(i, 1);
        ship.hp--;
        sfx.shipHit();
        // hit spark
        for (var ek = 0; ek < 8; ek++) {
          var eka = Math.random() * Math.PI * 2;
          var eks = 2 + Math.random() * 3;
          debris.push({ x: ship.x, y: ship.y, vx: Math.cos(eka) * eks, vy: Math.sin(eka) * eks, r: 2 + Math.random() * 3, life: 30 + Math.floor(Math.random() * 20), color: eb.color });
        }
        if (ship.hp <= 0) {
          gameOver();
          sfx.gameOver();
          for (var ek2 = 0; ek2 < 15; ek2++) {
            var eka2 = Math.random() * Math.PI * 2;
            var eks2 = 2 + Math.random() * 5;
            debris.push({ x: ship.x, y: ship.y, vx: Math.cos(eka2) * eks2, vy: Math.sin(eka2) * eks2, r: 2 + Math.random() * 4, life: 40 + Math.floor(Math.random() * 30), color: '#ff4444' });
          }
          drawGame(W, H);
          return;
        }
      }
    }

    // Player bullet vs enemy bullet (shoot down knowledge points for bonus)
    for (i = bullets.length - 1; i >= 0; i--) {
      var pb = bullets[i];
      for (j = enemyBullets.length - 1; j >= 0; j--) {
        var eb2 = enemyBullets[j];
        var pdx = pb.x - eb2.x, pdy = pb.y - eb2.y;
        if (pdx * pdx + pdy * pdy < (3 + eb2.r) * (3 + eb2.r)) {
          score += 2;
          sfx.intercept();
          hudEl.textContent = 'R' + round + '  SCORE: ' + score + '  HP: ' + ship.hp;
          for (var pk = 0; pk < 4; pk++) {
            var pka = Math.random() * Math.PI * 2;
            debris.push({ x: eb2.x, y: eb2.y, vx: Math.cos(pka) * 2, vy: Math.sin(pka) * 2, r: 2, life: 25, color: eb2.color });
          }
          enemyBullets.splice(j, 1);
          bullets.splice(i, 1);
          break;
        }
      }
    }

    for (i = missiles.length - 1; i >= 0; i--) {
      var m = missiles[i];
      // Macross phase: spread then turn
      if (m.phase === 0) {
        m.phaseTimer--;
        if (m.phaseTimer <= 0) m.phase = 1;
      }
      if (m.phase === 1) {
        // Find assigned target (or nearest alive)
        var mTgt = null;
        if (typeof m.targetIdx === 'number') {
          var alive2 = [];
          for (j = 0; j < targets.length; j++) {
            if (targets[j].alive) alive2.push(targets[j]);
          }
          if (alive2.length > 0) mTgt = alive2[m.targetIdx % alive2.length];
        }
        if (!mTgt) {
          var nearT = null, nearD = Infinity;
          for (j = 0; j < targets.length; j++) {
            if (!targets[j].alive) continue;
            var mdx = targets[j].x - m.x, mdy = targets[j].y - m.y;
            var md = mdx * mdx + mdy * mdy;
            if (md < nearD) { nearD = md; nearT = targets[j]; }
          }
          mTgt = nearT;
        }
        if (mTgt) {
          var desiredAngle = Math.atan2(mTgt.y - m.y, mTgt.x - m.x);
          var angleDiff = desiredAngle - m.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          m.angle += angleDiff * 0.08;
        }
      }
      m.speed = Math.min(7, m.speed + 0.04);
      m.vx = Math.cos(m.angle) * m.speed;
      m.vy = Math.sin(m.angle) * m.speed;
      m.x += m.vx;
      m.y += m.vy;
      m.life--;
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 30) m.trail.shift();
      if (Math.random() < 0.6) {
        smokes.push({
          x: m.x - m.vx * 0.5 + (Math.random() - 0.5) * 4,
          y: m.y - m.vy * 0.5 + (Math.random() - 0.5) * 4,
          r: 3 + Math.random() * 3,
          life: 30 + Math.floor(Math.random() * 20),
          maxLife: 50
        });
      }
      if (m.life <= 0 || m.x < -20 || m.x > W + 20 || m.y < -20 || m.y > H + 20) {
        missiles.splice(i, 1);
        continue;
      }
      var missileHit = false;
      for (j = 0; j < targets.length; j++) {
        var t = targets[j];
        if (!t.alive) continue;
        var mdx2 = m.x - t.x, mdy2 = m.y - t.y;
        if (mdx2 * mdx2 + mdy2 * mdy2 < (t.r + 6) * (t.r + 6)) {
          missileHit = true;
          t.hp -= 3;
          score += 3;
          sfx.hit();
          for (var km = 0; km < 15; km++) {
            var eda = Math.random() * Math.PI * 2;
            var esp = 2 + Math.random() * 5;
            debris.push({ x: m.x, y: m.y, vx: Math.cos(eda) * esp, vy: Math.sin(eda) * esp, r: 2 + Math.random() * 4, life: 50 + Math.floor(Math.random() * 40), color: t.rawColor });
          }
          for (var ks = 0; ks < 8; ks++) {
            smokes.push({ x: m.x + (Math.random() - 0.5) * 20, y: m.y + (Math.random() - 0.5) * 20, r: 6 + Math.random() * 8, life: 40 + Math.floor(Math.random() * 25), maxLife: 65 });
          }
          if (t.el) {
            var sc = Math.max(0.1, t.hp / t.maxHp);
            t.el.style.transform = 'translate(-50%, -50%) scale(' + sc + ')';
          }
          if (t.hp <= 0) {
            t.alive = false;
            score += 7;
            sfx.destroy();
            spawnPowerup(t.x, t.y);
            if (t.el) {
              t.el.style.transition = 'opacity 0.3s, transform 0.3s';
              t.el.style.opacity = '0';
              t.el.style.transform = 'translate(-50%, -50%) scale(0)';
            }
            for (var ka = 0; ka < 12; ka++) {
              var ada = Math.random() * Math.PI * 2;
              var asp = 2 + Math.random() * 5;
              debris.push({ x: t.x, y: t.y, vx: Math.cos(ada) * asp, vy: Math.sin(ada) * asp, r: 3 + Math.random() * 5, life: 60 + Math.floor(Math.random() * 50), color: t.rawColor });
            }
          }
          hudEl.textContent = 'R' + round + '  SCORE: ' + score + '  HP: ' + ship.hp;
          break;
        }
      }
      if (missileHit) { missiles.splice(i, 1); }
    }

    for (i = smokes.length - 1; i >= 0; i--) {
      var sm = smokes[i];
      sm.r += 0.15;
      sm.life--;
      if (sm.life <= 0) smokes.splice(i, 1);
    }

    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      for (j = 0; j < targets.length; j++) {
        var t = targets[j];
        if (!t.alive) continue;
        var dx = b.x - t.x, dy = b.y - t.y;
        if (dx * dx + dy * dy < t.r * t.r) {
          bullets.splice(i, 1);
          t.hp--;
          score += 1;
          sfx.hit();
          var debrisCount = 3 + Math.floor(Math.random() * 3);
          for (var k = 0; k < debrisCount; k++) {
            var da = Math.random() * Math.PI * 2;
            var dsp = 1.5 + Math.random() * 3;
            debris.push({ x: b.x, y: b.y, vx: Math.cos(da) * dsp, vy: Math.sin(da) * dsp, r: 2 + Math.random() * 3, life: 50 + Math.floor(Math.random() * 40), color: t.rawColor });
          }
          if (t.el) {
            var scale = Math.max(0.2, t.hp / t.maxHp);
            t.el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
          }
          if (t.hp <= 0) {
            t.alive = false;
            score += 9;
            sfx.destroy();
            spawnPowerup(t.x, t.y);
            if (t.el) {
              t.el.style.transition = 'opacity 0.3s, transform 0.3s';
              t.el.style.opacity = '0';
              t.el.style.transform = 'translate(-50%, -50%) scale(0)';
            }
            for (var k2 = 0; k2 < 10; k2++) {
              var da2 = Math.random() * Math.PI * 2;
              var dsp2 = 2 + Math.random() * 4;
              debris.push({ x: t.x, y: t.y, vx: Math.cos(da2) * dsp2, vy: Math.sin(da2) * dsp2, r: 2 + Math.random() * 4, life: 60 + Math.floor(Math.random() * 50), color: t.rawColor });
            }
          }
          hudEl.textContent = 'R' + round + '  SCORE: ' + score + '  HP: ' + ship.hp;
          break;
        }
      }
    }

    for (i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (!t.alive) continue;
      var dx = ship.x - t.x, dy = ship.y - t.y;
      if (dx * dx + dy * dy < (ship.r + t.r) * (ship.r + t.r)) {
        ship.hp--;
        sfx.shipHit();
        // bounce away from target
        var bAngle = Math.atan2(dy, dx);
        ship.vx = Math.cos(bAngle) * 8;
        ship.vy = Math.sin(bAngle) * 8;
        ship.x += ship.vx * 3;
        ship.y += ship.vy * 3;
        for (var k3 = 0; k3 < 10; k3++) {
          var da3 = Math.random() * Math.PI * 2;
          var dsp3 = 2 + Math.random() * 4;
          debris.push({ x: ship.x, y: ship.y, vx: Math.cos(da3) * dsp3, vy: Math.sin(da3) * dsp3, r: 2 + Math.random() * 3, life: 30 + Math.floor(Math.random() * 20), color: '#ff4444' });
        }
        hudEl.textContent = 'R' + round + '  SCORE: ' + score + '  HP: ' + ship.hp;
        if (ship.hp <= 0) {
          gameOver();
          sfx.gameOver();
          for (var k4 = 0; k4 < 15; k4++) {
            var da4 = Math.random() * Math.PI * 2;
            var dsp4 = 2 + Math.random() * 5;
            debris.push({ x: ship.x, y: ship.y, vx: Math.cos(da4) * dsp4, vy: Math.sin(da4) * dsp4, r: 2 + Math.random() * 4, life: 40 + Math.floor(Math.random() * 30), color: '#ff4444' });
          }
          drawGame(W, H);
          return;
        }
      }
    }

    for (i = debris.length - 1; i >= 0; i--) {
      var d = debris[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vx *= 0.98;
      d.vy *= 0.98;
      d.life--;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      if (d.life <= 0) debris.splice(i, 1);
    }

    // Update & collect powerups
    for (i = powerups.length - 1; i >= 0; i--) {
      var pu = powerups[i];
      pu.vy += 0.03; // gravity
      pu.x += pu.vx;
      pu.y += pu.vy;
      pu.vx *= 0.99;
      pu.vy *= 0.99;
      pu.life--;
      if (pu.x < pu.r) { pu.x = pu.r; pu.vx *= -1; }
      if (pu.x > W - pu.r) { pu.x = W - pu.r; pu.vx *= -1; }
      if (pu.y < pu.r) { pu.y = pu.r; pu.vy *= -1; }
      if (pu.y > H - pu.r) { pu.y = H - pu.r; pu.vy *= -1; }
      if (pu.life <= 0) { powerups.splice(i, 1); continue; }
      var pdx2 = pu.x - ship.x, pdy2 = pu.y - ship.y;
      if (pdx2 * pdx2 + pdy2 * pdy2 < (pu.r + ship.r) * (pu.r + ship.r)) {
        collectPowerup(pu);
        powerups.splice(i, 1);
      }
    }

    updateHud();
    drawGame(W, H);
    gameFrame = requestAnimationFrame(gameLoop);
  }

  function updateHud() {
    hudEl.textContent = 'R' + round + '  ' + weaponNames[weaponMode] + '  SCORE: ' + score + '  HP: ' + ship.hp + (missileCooldown > 0 ? '  MSL: ' + Math.ceil(missileCooldown / 60) + 's' : '  MSL: RDY');
  }

  function drawGame(W, H) {
    var i;
    for (i = 0; i < debris.length; i++) {
      var d = debris[i];
      ctx.globalAlpha = Math.min(1, d.life / 20);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (i = 0; i < smokes.length; i++) {
      var sm = smokes[i];
      var smAlpha = (sm.life / (sm.maxLife || 50)) * 0.35;
      ctx.globalAlpha = smAlpha;
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2);
      ctx.fillStyle = '#aaa';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (i = 0; i < missiles.length; i++) {
      var m = missiles[i];
      if (m.trail.length > 1) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for (var ti = 1; ti < m.trail.length; ti++) {
          var tAlpha = ti / m.trail.length;
          ctx.globalAlpha = tAlpha * 0.6;
          ctx.strokeStyle = '#ff6622';
          ctx.beginPath();
          ctx.moveTo(m.trail[ti - 1].x, m.trail[ti - 1].y);
          ctx.lineTo(m.trail[ti].x, m.trail[ti].y);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -4);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fillStyle = '#ff4400';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(-10 - Math.random() * 6, 0);
      ctx.lineTo(-4, 2);
      ctx.fillStyle = 'rgba(255,' + Math.floor(180 + Math.random() * 75) + ',0,0.8)';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    for (i = 0; i < bullets.length; i++) {
      var b = bullets[i];
      var bColor = b.homing ? weaponColors[2] : weaponColors[weaponMode];
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.homing ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = bColor;
      ctx.shadowColor = bColor;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw enemy bullets (knowledge points)
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < enemyBullets.length; i++) {
      var eb = enemyBullets[i];
      var ebAlpha = Math.min(1, eb.life / 30);
      ctx.globalAlpha = ebAlpha;
      // glow
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r + 3, 0, Math.PI * 2);
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = ebAlpha * 0.3;
      ctx.fill();
      // core
      ctx.globalAlpha = ebAlpha;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fillStyle = eb.color;
      ctx.fill();
      // label
      ctx.fillStyle = '#fff';
      ctx.fillText(eb.label, eb.x, eb.y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw powerups
    for (i = 0; i < powerups.length; i++) {
      var pu = powerups[i];
      var puBlink = pu.life < 120 ? (Math.floor(pu.life / 8) % 2 === 0 ? 0.3 : 1) : 1;
      ctx.save();
      ctx.globalAlpha = puBlink;
      // outer glow
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, pu.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = pu.type.color;
      ctx.shadowColor = pu.type.color;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = puBlink * 0.25;
      ctx.fill();
      // core
      ctx.globalAlpha = puBlink * 0.85;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, pu.r, 0, Math.PI * 2);
      ctx.fillStyle = pu.type.color;
      ctx.fill();
      // border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.type.label, pu.x, pu.y);
      ctx.restore();
    }

    if (gameActive) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.beginPath();
      ctx.moveTo(ship.r + 4, 0);
      ctx.lineTo(-ship.r, -ship.r * 0.7);
      ctx.lineTo(-ship.r * 0.5, 0);
      ctx.lineTo(-ship.r, ship.r * 0.7);
      ctx.closePath();
      ctx.fillStyle = '#00ddff';
      ctx.shadowColor = '#00ddff';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      // HP indicator
      if (ship.hp < 3) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        for (var hi = 0; hi < 3; hi++) {
          ctx.beginPath();
          ctx.arc(ship.x - 12 + hi * 12, ship.y - ship.r - 10, 3, 0, Math.PI * 2);
          ctx.fillStyle = hi < ship.hp ? '#00ff88' : '#ff2244';
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mouse.x - 18, mouse.y);
      ctx.lineTo(mouse.x - 8, mouse.y);
      ctx.moveTo(mouse.x + 8, mouse.y);
      ctx.lineTo(mouse.x + 18, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 18);
      ctx.lineTo(mouse.x, mouse.y - 8);
      ctx.moveTo(mouse.x, mouse.y + 8);
      ctx.lineTo(mouse.x, mouse.y + 18);
      ctx.stroke();
      ctx.restore();
    }

    // Weapon mode HUD (top-left)
    if (gameActive) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.font = 'bold 13px "Space Grotesk", monospace';
      var hudY = 70;
      for (var wi = 0; wi < 3; wi++) {
        var isActive = wi === weaponMode;
        ctx.fillStyle = isActive ? weaponColors[wi] : '#555';
        ctx.fillText((wi + 1) + ' ' + weaponNames[wi], 20, hudY + wi * 20);
        if (isActive) {
          ctx.fillStyle = '#888';
          var lvlText = 'SPD:' + wpnLevel.speed + ' SPR:' + wpnLevel.spread + ' CNT:' + (1 + wpnLevel.count);
          ctx.fillText(lvlText, 110, hudY + wi * 20);
        }
      }
      // Missile cooldown bar
      var barX = 20, barY = hudY + 65, barW = 80, barH = 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      var cdPct = missileCooldown > 0 ? 1 - missileCooldown / MISSILE_CD : 1;
      ctx.fillStyle = cdPct >= 1 ? '#00ff88' : '#ff8844';
      ctx.fillRect(barX, barY, barW * cdPct, barH);
      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.fillText('MSL ' + (cdPct >= 1 ? 'READY' : Math.ceil(missileCooldown / 60) + 's'), barX, barY - 4);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (gameActive && (keys.w || keys.a || keys.s || keys.d)) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.beginPath();
      ctx.moveTo(-ship.r * 0.5, -ship.r * 0.25);
      ctx.lineTo(-ship.r - 6 - Math.random() * 6, 0);
      ctx.lineTo(-ship.r * 0.5, ship.r * 0.25);
      ctx.fillStyle = 'rgba(255,' + Math.floor(120 + Math.random() * 80) + ',0,0.7)';
      ctx.fill();
      ctx.restore();
    }
  }

  gameBtn.addEventListener('click', function () {
    if (gameActive) {
      stopGame();
    } else {
      restoreTargets();
      overEl.classList.remove('active');
      round = 1;
      totalScore = 0;
      if (document.body.getAttribute('data-layout') === 'cell') startGame();
    }
  });

  restartBtn.addEventListener('click', function () {
    overEl.classList.remove('active');
    gameBtn.innerHTML = playIcon;
    keys.w = keys.a = keys.s = keys.d = false;
    restoreTargets();
    round = 1;
    totalScore = 0;
    window.removeEventListener('resize', resizeCanvas);
    startGame();
  });

  nextBtn.addEventListener('click', function () {
    overEl.classList.remove('active');
    keys.w = keys.a = keys.s = keys.d = false;
    restoreTargets();
    round++;
    window.removeEventListener('resize', resizeCanvas);
    startGame();
  });

  quitBtn.addEventListener('click', function () {
    restoreTargets();
    stopGame();
  });
})();

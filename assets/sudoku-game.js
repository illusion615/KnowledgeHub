// ============================================================
// Sudoku — classic 9x9 logic puzzle for the game launcher
// ============================================================
// Self-contained. Exposes window.SudokuGame { start, stop, isActive }.
// Generates a full solution, digs holes while keeping a unique
// solution, then drives a DOM board with input/notes/hints.
// Vanilla JS, no arrow functions (project convention).
// ============================================================

(function () {
  var overlay = document.getElementById('sudoku-overlay');
  if (!overlay) return;
  var boardEl = document.getElementById('sudoku-board');
  var padEl = document.getElementById('sudoku-pad');
  var timerEl = document.getElementById('sudoku-timer');
  var mistakesEl = document.getElementById('sudoku-mistakes');
  var diffLabelEl = document.getElementById('sudoku-diff-label');
  var diffPickerEl = document.getElementById('sudoku-diff');
  var diffListEl = document.getElementById('sudoku-diff-list');
  var closeBtn = document.getElementById('sudoku-close');
  var eraseBtn = document.getElementById('sudoku-erase');
  var notesBtn = document.getElementById('sudoku-notes');
  var hintBtn = document.getElementById('sudoku-hint');
  var newBtn = document.getElementById('sudoku-new');
  var winEl = document.getElementById('sudoku-win');
  var winTitleEl = document.getElementById('sudoku-win-title');
  var winInfoEl = document.getElementById('sudoku-win-info');
  var winNewBtn = document.getElementById('sudoku-win-new');
  var winQuitBtn = document.getElementById('sudoku-win-quit');
  var confettiCanvas = document.getElementById('sudoku-confetti');
  var gameBtn = document.getElementById('cell-game-btn');

  var playIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>';
  var exitIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // difficulty: clues left on the board (lower = harder)
  var DIFFS = [
    { id: 'easy',   zh: '\u7B80\u5355', en: 'Easy',   clues: 44 },
    { id: 'medium', zh: '\u4E2D\u7B49', en: 'Medium', clues: 36 },
    { id: 'hard',   zh: '\u56F0\u96BE', en: 'Hard',   clues: 30 }
  ];
  var diffIdx = 0;

  // state
  var solution = [];   // 81 ints, the full answer
  var puzzle = [];     // 81 ints, 0 = blank (givens fixed)
  var grid = [];       // 81 ints, current player values
  var notes = [];      // 81 arrays of pencil marks
  var given = [];      // 81 bools
  var sel = -1;        // selected cell index
  var notesMode = false;
  var mistakes = 0;
  var startTime = 0;
  var elapsed = 0;
  var tick = null;
  var solved = false;
  var cells = [];      // cell DOM nodes

  function L(zh, en) { return (localStorage.getItem('lang') === 'en') ? en : zh; }

  // ── Audio (tiny, shared style with other games) ──
  var audioCtx = null;
  function tone(freq, dur, type, vol) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.05, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }
  var sfx = {
    place: function () { tone(620, 0.07, 'square', 0.04); },
    err: function () { tone(180, 0.18, 'sawtooth', 0.06); },
    win: function () { tone(523, 0.12, 'square', 0.06); tone(659, 0.14, 'square', 0.06); tone(784, 0.22, 'square', 0.06); }
  };

  // ── Confetti (win celebration) — gentle drifting fall, multiple bursts ──
  var confCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  var confetti = [];
  var confFrame = null;
  var confLastT = 0;
  var confBurstTimers = [];
  var confColors = ['#ff6b6b', '#ffd43b', '#74c0fc', '#63e6be', '#da77f2', '#ffa94d', '#ff8cc8', '#a9e34b'];

  function addBurst(originX, originY, count, radial) {
    var i;
    for (i = 0; i < count; i++) {
      // radial firework: explode in all directions (360°) from the burst point
      var ang = Math.random() * Math.PI * 2;
      var sp = 220 + Math.random() * 520; // wide spread of speeds → big bloom
      confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 60, // slight upward bias so it rains down after
        w: 6 + Math.random() * 8,
        h: 9 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 4,
        sway: 0.6 + Math.random() * 1.4,        // sway frequency
        swayAmp: 18 + Math.random() * 36,       // sway amplitude (px/sec)
        phase: Math.random() * Math.PI * 2,
        flutter: Math.random() * Math.PI * 2,   // thickness oscillation
        color: confColors[(Math.random() * confColors.length) | 0],
        born: 0, ttl: 4.5 + Math.random() * 2.8 // long life so it drifts down slowly
      });
    }
  }

  function launchConfetti() {
    if (!confCtx) return;
    confettiCanvas.width = confettiCanvas.offsetWidth || window.innerWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight || window.innerHeight;
    var W = confettiCanvas.width, H = confettiCanvas.height;
    confetti = [];
    clearBurstTimers();
    // a sequence of full-screen firework explosions ("不止一次爆竹"),
    // burst points spread across the whole width and upper/middle height
    var shots = [
      { t: 0,    x: W * 0.50, y: H * 0.34, n: 130 },
      { t: 450,  x: W * 0.20, y: H * 0.28, n: 100 },
      { t: 750,  x: W * 0.80, y: H * 0.30, n: 100 },
      { t: 1250, x: W * 0.35, y: H * 0.20, n: 110 },
      { t: 1550, x: W * 0.65, y: H * 0.22, n: 110 },
      { t: 2150, x: W * 0.50, y: H * 0.40, n: 120 },
      { t: 2600, x: W * 0.15, y: H * 0.40, n: 90 },
      { t: 2850, x: W * 0.85, y: H * 0.40, n: 90 }
    ];
    var i;
    for (i = 0; i < shots.length; i++) {
      (function (shot) {
        var id = setTimeout(function () {
          if (!winEl.classList.contains('active')) return;
          addBurst(shot.x, shot.y, shot.n);
          popSound();
        }, shot.t);
        confBurstTimers.push(id);
      })(shots[i]);
    }
    confLastT = 0;
    if (confFrame) cancelAnimationFrame(confFrame);
    confFrame = requestAnimationFrame(stepConfetti);
  }

  function popSound() {
    tone(740 + Math.random() * 240, 0.09, 'square', 0.05);
    tone(1180 + Math.random() * 200, 0.12, 'square', 0.04);
  }

  function stepConfetti(ts) {
    if (!confCtx) return;
    if (!confLastT) confLastT = ts;
    var dt = Math.min(0.05, (ts - confLastT) / 1000);
    confLastT = ts;
    var W = confettiCanvas.width, H = confettiCanvas.height;
    confCtx.clearRect(0, 0, W, H);
    var alive = 0, i;
    for (i = 0; i < confetti.length; i++) {
      var p = confetti[i];
      p.born += dt;
      if (p.born > p.ttl || p.y > H + 30) continue;
      // let the radial explosion bloom wide first, then settle into a slow drift
      p.vx *= 0.965;             // gentle horizontal drag → big bloom
      p.vy += 230 * dt;          // mild gravity
      if (p.vy > 0) p.vy *= 0.95; // cap fall speed once descending (drifting)
      // horizontal sway like a real falling leaf
      var swayV = Math.sin(p.born * p.sway + p.phase) * p.swayAmp;
      p.x += (p.vx + swayV) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flutter += dt * 6;
      alive++;
      // fade only in the last second
      var fade = p.born > p.ttl - 1 ? Math.max(0, p.ttl - p.born) : 1;
      confCtx.save();
      confCtx.globalAlpha = fade;
      confCtx.translate(p.x, p.y);
      confCtx.rotate(p.rot);
      // flutter: scale width to fake a paper flip
      var sx = Math.cos(p.flutter);
      confCtx.scale(sx, 1);
      confCtx.fillStyle = p.color;
      confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confCtx.restore();
    }
    if ((alive > 0 || confBurstTimers.length) && winEl.classList.contains('active')) {
      confFrame = requestAnimationFrame(stepConfetti);
    } else {
      confCtx.clearRect(0, 0, W, H);
      confFrame = null;
    }
  }
  function clearBurstTimers() {
    for (var i = 0; i < confBurstTimers.length; i++) clearTimeout(confBurstTimers[i]);
    confBurstTimers = [];
  }
  function stopConfetti() {
    clearBurstTimers();
    if (confFrame) { cancelAnimationFrame(confFrame); confFrame = null; }
    confetti = [];
    if (confCtx) confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  // ── Generation ──
  function shuffled() {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9], i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function canPlace(g, idx, v) {
    var r = (idx / 9) | 0, c = idx % 9, i;
    for (i = 0; i < 9; i++) {
      if (g[r * 9 + i] === v) return false;
      if (g[i * 9 + c] === v) return false;
    }
    var br = r - (r % 3), bc = c - (c % 3), rr, cc;
    for (rr = 0; rr < 3; rr++) {
      for (cc = 0; cc < 3; cc++) {
        if (g[(br + rr) * 9 + (bc + cc)] === v) return false;
      }
    }
    return true;
  }
  // fill a complete valid grid via randomized backtracking
  function fillGrid(g, pos) {
    if (pos >= 81) return true;
    if (g[pos] !== 0) return fillGrid(g, pos + 1);
    var nums = shuffled(), i;
    for (i = 0; i < 9; i++) {
      if (canPlace(g, pos, nums[i])) {
        g[pos] = nums[i];
        if (fillGrid(g, pos + 1)) return true;
        g[pos] = 0;
      }
    }
    return false;
  }
  // count solutions up to `limit` (for uniqueness check)
  function countSolutions(g, limit) {
    var pos = -1, i;
    for (i = 0; i < 81; i++) { if (g[i] === 0) { pos = i; break; } }
    if (pos === -1) return 1;
    var total = 0, v;
    for (v = 1; v <= 9; v++) {
      if (canPlace(g, pos, v)) {
        g[pos] = v;
        total += countSolutions(g, limit - total);
        g[pos] = 0;
        if (total >= limit) return total;
      }
    }
    return total;
  }
  function generate(targetClues) {
    var full = new Array(81); var i;
    for (i = 0; i < 81; i++) full[i] = 0;
    fillGrid(full, 0);
    solution = full.slice();
    var pz = full.slice();
    // dig holes in random order while keeping a unique solution
    var order = [];
    for (i = 0; i < 81; i++) order.push(i);
    for (i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }
    var clues = 81;
    for (i = 0; i < order.length && clues > targetClues; i++) {
      var idx = order[i];
      var bak = pz[idx];
      if (bak === 0) continue;
      pz[idx] = 0;
      var test = pz.slice();
      if (countSolutions(test, 2) !== 1) {
        pz[idx] = bak; // restore — removing breaks uniqueness
      } else {
        clues--;
      }
    }
    puzzle = pz;
  }

  // ── Board build / render ──
  function buildBoard() {
    boardEl.innerHTML = '';
    cells = [];
    var i;
    for (i = 0; i < 81; i++) {
      var c = (i % 9), r = (i / 9) | 0;
      var el = document.createElement('div');
      el.className = 'sudoku-cell';
      if (c === 2 || c === 5) el.className += ' bx-right';
      if (r === 2 || r === 5) el.className += ' bx-bottom';
      el.setAttribute('data-i', i);
      boardEl.appendChild(el);
      cells.push(el);
    }
  }
  function buildPad() {
    padEl.innerHTML = '';
    var v;
    for (v = 1; v <= 9; v++) {
      var b = document.createElement('button');
      b.className = 'sudoku-num';
      b.textContent = String(v);
      b.setAttribute('data-v', v);
      padEl.appendChild(b);
    }
  }
  function countPlaced(v) {
    var n = 0, i;
    for (i = 0; i < 81; i++) if (grid[i] === v) n++;
    return n;
  }
  function renderCell(i) {
    var el = cells[i];
    var v = grid[i];
    el.className = 'sudoku-cell';
    var c = (i % 9), r = (i / 9) | 0;
    if (c === 2 || c === 5) el.className += ' bx-right';
    if (r === 2 || r === 5) el.className += ' bx-bottom';
    if (given[i]) el.className += ' given';
    // selection + peers + same-number highlight
    if (sel >= 0) {
      var sr = (sel / 9) | 0, sc = sel % 9;
      if (i === sel) el.className += ' sel';
      else if (r === sr || c === sc || (((r / 3) | 0) === ((sr / 3) | 0) && ((c / 3) | 0) === ((sc / 3) | 0))) el.className += ' peer';
      if (grid[sel] && v === grid[sel] && i !== sel) el.className += ' same';
    }
    if (v !== 0 && !given[i] && v !== solution[i]) el.className += ' err';
    if (v !== 0) {
      el.textContent = String(v);
    } else if (notes[i] && notes[i].length) {
      var html = '<div class="sk-notes">';
      var k;
      for (k = 1; k <= 9; k++) html += '<span>' + (notes[i].indexOf(k) !== -1 ? k : '') + '</span>';
      html += '</div>';
      el.innerHTML = html;
    } else {
      el.textContent = '';
    }
  }
  function renderAll() {
    var i;
    for (i = 0; i < 81; i++) renderCell(i);
    var v;
    var nums = padEl.querySelectorAll('.sudoku-num');
    for (v = 0; v < nums.length; v++) {
      var val = parseInt(nums[v].getAttribute('data-v'), 10);
      if (countPlaced(val) >= 9) nums[v].classList.add('done');
      else nums[v].classList.remove('done');
    }
    mistakesEl.textContent = String(mistakes);
  }

  // ── Input ──
  function select(i) {
    sel = i;
    renderAll();
  }
  function placeValue(v) {
    if (sel < 0 || given[sel]) return;
    if (notesMode && v !== 0) {
      var arr = notes[sel] || (notes[sel] = []);
      var p = arr.indexOf(v);
      if (p === -1) arr.push(v); else arr.splice(p, 1);
      renderCell(sel);
      sfx.place();
      return;
    }
    if (v === 0) {
      grid[sel] = 0;
      notes[sel] = [];
      renderAll();
      return;
    }
    grid[sel] = v;
    notes[sel] = [];
    if (v !== solution[sel]) {
      mistakes++;
      sfx.err();
    } else {
      sfx.place();
    }
    renderAll();
    checkWin();
  }
  function giveHint() {
    if (sel < 0 || given[sel] || grid[sel] === solution[sel]) {
      // pick first empty/wrong cell
      var i;
      for (i = 0; i < 81; i++) {
        if (!given[i] && grid[i] !== solution[i]) { sel = i; break; }
      }
    }
    if (sel < 0) return;
    grid[sel] = solution[sel];
    notes[sel] = [];
    given[sel] = true; // lock the revealed cell
    sfx.place();
    renderAll();
    checkWin();
  }
  function checkWin() {
    var i;
    for (i = 0; i < 81; i++) if (grid[i] !== solution[i]) return;
    solved = true;
    stopTimer();
    sfx.win();
    winInfoEl.textContent = L('\u7528\u65F6 ', 'Time ') + fmtTime(elapsed) +
      ' \u00B7 ' + L('\u9519\u8BEF ', 'Mistakes ') + mistakes;
    winEl.classList.add('active');
    launchConfetti();
  }

  // ── Timer ──
  function fmtTime(s) {
    var m = (s / 60) | 0, ss = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function startTimer() {
    startTime = Date.now();
    elapsed = 0;
    if (tick) clearInterval(tick);
    tick = setInterval(function () {
      elapsed = ((Date.now() - startTime) / 1000) | 0;
      timerEl.textContent = fmtTime(elapsed);
    }, 1000);
  }
  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }

  // ── New game ──
  function newGame() {
    var d = DIFFS[diffIdx];
    diffLabelEl.textContent = L(d.zh, d.en);
    generate(d.clues);
    grid = puzzle.slice();
    given = [];
    notes = [];
    var i;
    for (i = 0; i < 81; i++) { given[i] = puzzle[i] !== 0; notes[i] = []; }
    sel = -1;
    mistakes = 0;
    solved = false;
    notesMode = false;
    notesBtn.classList.remove('on');
    winEl.classList.remove('active');
    hideDiffPicker();
    stopConfetti();
    renderAll();
    startTimer();
  }
  // ── Difficulty picker ──
  function buildDiffPicker() {
    if (!diffListEl) return;
    var html = '', i;
    for (i = 0; i < DIFFS.length; i++) {
      var d = DIFFS[i];
      var dots = (i === 0 ? '\u25CF\u25CB\u25CB' : i === 1 ? '\u25CF\u25CF\u25CB' : '\u25CF\u25CF\u25CF');
      html += '<button class="sudoku-diff-btn" data-d="' + i + '">' +
        '<span>' + L(d.zh, d.en) + '</span>' +
        '<span class="sd-dots">' + dots + '</span>' +
        '</button>';
    }
    diffListEl.innerHTML = html;
    var btns = diffListEl.querySelectorAll('[data-d]');
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener('click', function () {
        diffIdx = parseInt(this.getAttribute('data-d'), 10);
        hideDiffPicker();
        newGame();
      });
    }
  }
  function showDiffPicker() {
    buildDiffPicker();
    stopConfetti();
    winEl.classList.remove('active');
    stopTimer();
    if (diffPickerEl) diffPickerEl.classList.add('active');
  }
  function hideDiffPicker() {
    if (diffPickerEl) diffPickerEl.classList.remove('active');
  }

  // ── Event handlers ──
  function onBoardClick(e) {
    var t = e.target;
    while (t && t !== boardEl && !t.hasAttribute('data-i')) t = t.parentNode;
    if (t && t.hasAttribute('data-i')) select(parseInt(t.getAttribute('data-i'), 10));
  }
  function onPadClick(e) {
    var t = e.target;
    if (t && t.hasAttribute('data-v')) placeValue(parseInt(t.getAttribute('data-v'), 10));
  }
  function onKey(e) {
    if (!isActive()) return;
    var k = e.key;
    if (k === 'Escape') {
      if (diffPickerEl && diffPickerEl.classList.contains('active')) { hideDiffPicker(); return; }
      stopGame(); return;
    }
    if (k >= '1' && k <= '9') { placeValue(parseInt(k, 10)); e.preventDefault(); return; }
    if (k === 'Backspace' || k === 'Delete' || k === '0') { placeValue(0); e.preventDefault(); return; }
    if (k === 'n' || k === 'N') { toggleNotes(); return; }
    var sr, sc;
    if (sel < 0) sel = 40;
    sr = (sel / 9) | 0; sc = sel % 9;
    if (k === 'ArrowUp') { sel = ((sr + 8) % 9) * 9 + sc; renderAll(); e.preventDefault(); }
    else if (k === 'ArrowDown') { sel = ((sr + 1) % 9) * 9 + sc; renderAll(); e.preventDefault(); }
    else if (k === 'ArrowLeft') { sel = sr * 9 + ((sc + 8) % 9); renderAll(); e.preventDefault(); }
    else if (k === 'ArrowRight') { sel = sr * 9 + ((sc + 1) % 9); renderAll(); e.preventDefault(); }
  }
  function toggleNotes() {
    notesMode = !notesMode;
    notesBtn.classList.toggle('on', notesMode);
  }

  // ── Lifecycle ──
  function startGame() {
    overlay.classList.add('active');
    document.body.classList.add('cell-game-on');
    if (gameBtn) gameBtn.innerHTML = exitIcon;
    if (!cells.length) { buildBoard(); buildPad(); }
    boardEl.addEventListener('click', onBoardClick);
    padEl.addEventListener('click', onPadClick);
    window.addEventListener('keydown', onKey);
    showDiffPicker(); // pick difficulty before the first board
  }
  function stopGame() {
    stopTimer();
    stopConfetti();
    overlay.classList.remove('active');
    winEl.classList.remove('active');
    hideDiffPicker();
    document.body.classList.remove('cell-game-on');
    if (gameBtn) gameBtn.innerHTML = playIcon;
    boardEl.removeEventListener('click', onBoardClick);
    padEl.removeEventListener('click', onPadClick);
    window.removeEventListener('keydown', onKey);
  }
  function isActive() { return overlay.classList.contains('active'); }

  // ── Wire controls ──
  closeBtn.addEventListener('click', stopGame);
  eraseBtn.addEventListener('click', function () { placeValue(0); });
  notesBtn.addEventListener('click', toggleNotes);
  hintBtn.addEventListener('click', giveHint);
  newBtn.addEventListener('click', showDiffPicker);
  if (diffLabelEl) diffLabelEl.addEventListener('click', showDiffPicker);
  winNewBtn.addEventListener('click', showDiffPicker);
  winQuitBtn.addEventListener('click', stopGame);
  if (winTitleEl) {
    winTitleEl.style.cursor = 'pointer';
    winTitleEl.title = '\uD83C\uDF89';
    winTitleEl.addEventListener('click', function () {
      if (winEl.classList.contains('active')) {
        winTitleEl.style.animation = 'none';
        void winTitleEl.offsetWidth; // restart pop animation
        winTitleEl.style.animation = '';
        launchConfetti();
      }
    });
  }
  overlay.addEventListener('click', function (e) { if (e.target === overlay) stopGame(); });

  // ── Public API ──
  window.SudokuGame = {
    start: function () {
      if (document.body.getAttribute('data-layout') === 'cell') startGame();
    },
    stop: stopGame,
    isActive: isActive
  };
})();

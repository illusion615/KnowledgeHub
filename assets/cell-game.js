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

  var gameActive = false;
  var gameFrame = null;
  var score = 0;

  // Ship state
  var ship = { x: 0, y: 0, r: 14, angle: 0, vx: 0, vy: 0 };
  var keys = { w: false, a: false, s: false, d: false };
  var mouse = { x: 0, y: 0 };
  var bullets = [];
  var missiles = [];
  var smokes = [];
  var debris = [];
  var targets = [];

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
      targets.push({
        x: cx, y: cy, r: r, origR: r,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rawColor: extractColorFromBg(bgStyle),
        hp: 3, alive: true, el: el
      });
    });
    var cellBubbles = document.querySelectorAll('#cell-view .cell-bubble');
    cellBubbles.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var r = Math.max(rect.width, rect.height) / 2.5;
      if (r < 10) return;
      targets.push({
        x: cx, y: cy, r: r, origR: r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        rawColor: '#5588aa',
        hp: 6, alive: true, el: el
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

  function startGame() {
    gameActive = true;
    score = 0;
    resizeCanvas();
    canvas.classList.add('active');
    hudEl.classList.add('active');
    overEl.classList.remove('active');
    document.body.classList.add('cell-game-on');
    gameBtn.innerHTML = exitIcon;
    hudEl.textContent = 'SCORE: 0';

    ship.x = 100;
    ship.y = canvas.height - 100;
    ship.vx = 0; ship.vy = 0;
    bullets = [];
    missiles = [];
    smokes = [];
    debris = [];
    buildTargets();

    window._cellGameActive = true;

    window.addEventListener('keydown', onGameKeyDown);
    window.addEventListener('keyup', onGameKeyUp);
    canvas.addEventListener('mousemove', onGameMouseMove);
    canvas.addEventListener('mousedown', onGameMouseDown);
    canvas.addEventListener('contextmenu', onGameContextMenu);
    window.addEventListener('resize', resizeCanvas);

    gameFrame = requestAnimationFrame(gameLoop);
  }

  function stopGame() {
    gameActive = false;
    if (gameFrame) cancelAnimationFrame(gameFrame);
    canvas.classList.remove('active');
    hudEl.classList.remove('active');
    overEl.classList.remove('active');
    document.body.classList.remove('cell-game-on');
    gameBtn.innerHTML = playIcon;
    keys.w = keys.a = keys.s = keys.d = false;

    window._cellGameActive = false;

    window.removeEventListener('keydown', onGameKeyDown);
    window.removeEventListener('keyup', onGameKeyUp);
    canvas.removeEventListener('mousemove', onGameMouseMove);
    canvas.removeEventListener('mousedown', onGameMouseDown);
    canvas.removeEventListener('contextmenu', onGameContextMenu);
    window.removeEventListener('resize', resizeCanvas);
  }

  function gameOver() {
    gameActive = false;
    if (gameFrame) cancelAnimationFrame(gameFrame);
    finalScoreEl.textContent = 'SCORE: ' + score;
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

  function onGameMouseDown(e) {
    if (!gameActive) return;
    if (e.button === 0) {
      var angle = Math.atan2(mouse.y - ship.y, mouse.x - ship.x);
      bullets.push({
        x: ship.x + Math.cos(angle) * (ship.r + 4),
        y: ship.y + Math.sin(angle) * (ship.r + 4),
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 7,
        life: 90
      });
    }
  }

  function onGameContextMenu(e) {
    e.preventDefault();
    if (!gameActive) return;
    var angle = Math.atan2(mouse.y - ship.y, mouse.x - ship.x);
    missiles.push({
      x: ship.x + Math.cos(angle) * (ship.r + 6),
      y: ship.y + Math.sin(angle) * (ship.r + 6),
      vx: Math.cos(angle) * 3.5,
      vy: Math.sin(angle) * 3.5,
      angle: angle,
      speed: 3.5,
      life: 180,
      trail: []
    });
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
    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
        bullets.splice(i, 1);
      }
    }

    syncTargetPositions();

    for (i = missiles.length - 1; i >= 0; i--) {
      var m = missiles[i];
      var nearT = null, nearD = Infinity;
      for (j = 0; j < targets.length; j++) {
        if (!targets[j].alive) continue;
        var mdx = targets[j].x - m.x, mdy = targets[j].y - m.y;
        var md = mdx * mdx + mdy * mdy;
        if (md < nearD) { nearD = md; nearT = targets[j]; }
      }
      if (nearT) {
        var desiredAngle = Math.atan2(nearT.y - m.y, nearT.x - m.x);
        var angleDiff = desiredAngle - m.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        m.angle += angleDiff * 0.04;
      }
      m.speed = Math.min(6, m.speed + 0.02);
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
          for (var km = 0; km < 15; km++) {
            var eda = Math.random() * Math.PI * 2;
            var esp = 2 + Math.random() * 5;
            debris.push({ x: m.x, y: m.y, vx: Math.cos(eda) * esp, vy: Math.sin(eda) * esp, r: 2 + Math.random() * 4, life: 50 + Math.floor(Math.random() * 40), color: t.rawColor });
          }
          for (var ks = 0; ks < 8; ks++) {
            smokes.push({ x: m.x + (Math.random() - 0.5) * 20, y: m.y + (Math.random() - 0.5) * 20, r: 6 + Math.random() * 8, life: 40 + Math.floor(Math.random() * 25), maxLife: 65 });
          }
          if (t.el) {
            var sc = Math.max(0.1, t.hp / 3);
            t.el.style.transform = 'translate(-50%, -50%) scale(' + sc + ')';
          }
          if (t.hp <= 0) {
            t.alive = false;
            score += 7;
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
          hudEl.textContent = 'SCORE: ' + score;
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
          var debrisCount = 3 + Math.floor(Math.random() * 3);
          for (var k = 0; k < debrisCount; k++) {
            var da = Math.random() * Math.PI * 2;
            var dsp = 1.5 + Math.random() * 3;
            debris.push({ x: b.x, y: b.y, vx: Math.cos(da) * dsp, vy: Math.sin(da) * dsp, r: 2 + Math.random() * 3, life: 50 + Math.floor(Math.random() * 40), color: t.rawColor });
          }
          if (t.el) {
            var scale = Math.max(0.2, t.hp / 3);
            t.el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
          }
          if (t.hp <= 0) {
            t.alive = false;
            score += 9;
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
          hudEl.textContent = 'SCORE: ' + score;
          break;
        }
      }
    }

    for (i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (!t.alive) continue;
      var dx = ship.x - t.x, dy = ship.y - t.y;
      if (dx * dx + dy * dy < (ship.r + t.r) * (ship.r + t.r)) {
        gameOver();
        for (var k3 = 0; k3 < 15; k3++) {
          var da3 = Math.random() * Math.PI * 2;
          var dsp3 = 2 + Math.random() * 5;
          debris.push({ x: ship.x, y: ship.y, vx: Math.cos(da3) * dsp3, vy: Math.sin(da3) * dsp3, r: 2 + Math.random() * 4, life: 40 + Math.floor(Math.random() * 30), color: '#ff4444' });
        }
        drawGame(W, H);
        return;
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

    drawGame(W, H);
    gameFrame = requestAnimationFrame(gameLoop);
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
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffdd44';
      ctx.shadowColor = '#ffdd44';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
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
      if (document.body.getAttribute('data-layout') === 'cell') startGame();
    }
  });

  restartBtn.addEventListener('click', function () {
    overEl.classList.remove('active');
    gameBtn.innerHTML = playIcon;
    keys.w = keys.a = keys.s = keys.d = false;
    window.removeEventListener('resize', resizeCanvas);
    startGame();
  });
})();

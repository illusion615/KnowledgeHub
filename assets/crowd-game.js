// ============================================================
// Crowd Game — "Knowledge Run" pseudo-3D crowd runner
// ============================================================
// A Count-Masters style lane runner skinned for the Knowledge Hub.
// Steer a crowd of learners down a perspective road, pass gates
// that add / multiply / subtract / divide the crowd, dodge
// obstacles, then trample the boss if the crowd is big enough.
//
// Auto-initializes on load. Exposes window.CrowdGame { start, stop, isActive }.
// Reuses overlay shells: #crowd-game-canvas / #crowd-game-hud /
// #crowd-game-over (+ title/final/round-info/restart/next/quit).
// ============================================================

(function () {
  var canvas = document.getElementById('crowd-game-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var hudEl = document.getElementById('crowd-game-hud');
  var overEl = document.getElementById('crowd-game-over');
  var titleEl = document.getElementById('crowd-game-title');
  var finalEl = document.getElementById('crowd-game-final-score');
  var roundInfoEl = document.getElementById('crowd-game-round-info');
  var restartBtn = document.getElementById('crowd-game-restart');
  var nextBtn = document.getElementById('crowd-game-next');
  var quitBtn = document.getElementById('crowd-game-quit');
  var gameBtn = document.getElementById('cell-game-btn');

  var playIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>';
  var exitIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // ── Geometry / projection ──
  var W = 0, H = 0;
  var horizonY = 0, groundY = 0, roadHalfBottom = 0, cx = 0;
  var FOCAL = 6;            // perspective focal depth
  var CROWD_DEPTH = 0.55;   // crowd stands slightly ahead of camera
  var FAR = 26;             // spawn / draw depth
  var LANE_CLAMP = 0.82;    // crowd can roam within +/- this lateral

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    horizonY = H * 0.30;
    groundY = H * 0.92;
    roadHalfBottom = Math.min(W * 0.46, 540);
    cx = W / 2;
  }

  function project(d, lateral) {
    var s = FOCAL / (FOCAL + Math.max(d, -FOCAL * 0.85));
    var y = horizonY + (groundY - horizonY) * s;
    var halfW = roadHalfBottom * s;
    return { x: cx + lateral * halfW, y: y, s: s, halfW: halfW };
  }

  // ── State ──
  var gameActive = false;
  var frame = null;
  var lastT = 0;
  var round = 1;
  var bestCount = 0;

  var crowd = { count: 10, lateral: 0, target: 0, power: 1 };
  var displayCount = 10;   // animated rolling number for juice
  var gates = [];
  var obstacles = [];
  var boss = null;
  var floaters = [];
  var particles = [];      // burst particles for juice
  var dots = [];           // persistent crowd dot offsets
  var scroll = 0;
  var speed = 5;
  var distance = 0;        // depth travelled this round
  var goalDistance = 0;    // when boss appears
  var bossSpawned = false;
  var nextGateAt = 0;      // distance marker for next gate
  var plannedGates = [];   // pre-generated ops for the whole round (for boss calibration)
  var nextGateIdx = 0;     // index into plannedGates streamed into view
  var roundBossHp = 100;   // boss HP (in STRENGTH units) calibrated to this round
  var countdown = 0;       // intro countdown timer (seconds)
  var resolving = false;   // boss clash in progress
  var clash = null;        // boss collision finale state
  var shake = 0;           // screen-shake magnitude (px)
  var tier = 0;            // cognitive evolution tier (index into TIERS)
  var evoBanner = 0;       // evolution banner timer (seconds)
  var runInsight = 0;      // insight earned this run (rare currency)
  var keyL = false, keyR = false;

  var COUNT_CAP = 9999999;
  var DOT_CAP = 170;       // visual dots cap; mass scales beyond this

  // ── Cognitive evolution tiers (B) — crowd evolves as it grows ──
  // strength = count * power; tier is driven by count thresholds.
  var TIERS = [
    { min: 0,    zh: '\u5C0F\u5B66\u751F', en: 'Pupil',      body: '#1c7ed6', head: '#a5d8ff' },
    { min: 60,   zh: '\u4E2D\u5B66\u751F', en: 'Student',    body: '#2b8a3e', head: '#b2f2bb' },
    { min: 250,  zh: '\u5927\u5B66\u751F', en: 'Undergrad',  body: '#9c36b5', head: '#eebefa' },
    { min: 1200, zh: '\u7814\u7A76\u5458', en: 'Researcher', body: '#e8590c', head: '#ffd8a8' },
    { min: 6000, zh: '\u6559\u6388',       en: 'Professor',  body: '#c9a227', head: '#fff3bf' }
  ];
  function tierForCount(c) {
    var t = 0;
    for (var i = 0; i < TIERS.length; i++) if (c >= TIERS[i].min) t = i;
    return t;
  }


  // ── Meta-progression (localStorage) ──
  var SAVE_KEY = 'crowdGameSave_v1';
  var save = { coins: 0, insight: 0, up: { start: 0, reward: 0, steer: 0, weapon: 0, talent: 0 } };
  function loadSave() {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && s.up) {
        save.coins = s.coins || 0;
        save.insight = s.insight || 0;
        save.up.start = s.up.start || 0;
        save.up.reward = s.up.reward || 0;
        save.up.steer = s.up.steer || 0;
        save.up.weapon = s.up.weapon || 0;
        save.up.talent = s.up.talent || 0;
      }
    } catch (e) {}
  }
  function persistSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
  var UPGRADES = [
    { id: 'start',  zh: '\u521D\u59CB\u4EBA\u6570', en: 'Start Crowd', base: 30, cur: 'coins' },
    { id: 'weapon', zh: '\u521D\u59CB\u6218\u529B', en: 'Start Power', base: 45, cur: 'coins' },
    { id: 'reward', zh: '\u91D1\u5E01\u52A0\u6210', en: 'Coin Bonus',  base: 40, cur: 'coins' },
    { id: 'steer',  zh: '\u8F6C\u5411\u7075\u654F', en: 'Steering',    base: 35, cur: 'coins' },
    { id: 'talent', zh: '\u5929\u8D4B\uFF08\u7075\u611F\uFF09', en: 'Talent (Insight)', base: 2, cur: 'insight' }
  ];
  function upDef(id) {
    for (var i = 0; i < UPGRADES.length; i++) if (UPGRADES[i].id === id) return UPGRADES[i];
    return null;
  }
  function upCost(id) {
    var def = upDef(id);
    var lv = save.up[id] || 0;
    if (def.cur === 'insight') return def.base + lv; // gentle linear for rare currency
    return Math.round(def.base * Math.pow(1.7, lv));
  }
  function upEffectLabel(id) {
    var lv = save.up[id] || 0;
    if (id === 'start') return '+' + (lv * 4);
    if (id === 'weapon') return '+' + lv;
    if (id === 'reward') return '\u00D7' + (1 + lv * 0.15).toFixed(2);
    if (id === 'steer') return '+' + (lv * 12) + '%';
    return '+' + (lv * 5) + '%'; // talent: global strength bonus
  }

  function L(zh, en) { return (localStorage.getItem('lang') === 'en') ? en : zh; }
  // abbreviate big counts: 1635→1.6K, 20274→20K, 1.2M
  function fmt(n) {
    n = Math.round(n);
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + 'M';
    if (n >= 10000) return Math.round(n / 1000) + 'K';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }
  // permanent global strength bonus from the Talent upgrade
  function talentMult() { return 1 + (save.up.talent || 0) * 0.05; }
  // total combat strength = people × per-person power × talent
  function strengthOf(count, power) { return count * power * talentMult(); }
  function crowdStrength() { return strengthOf(crowd.count, crowd.power); }

  // ── Audio (Web Audio, no external files) ──
  var audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    return audioCtx;
  }
  function tone(freq, dur, type, vol) {
    var a = getAudio();
    if (!a) return;
    try {
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.08, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + dur);
    } catch (e) {}
  }
  var sfx = {
    good: function (mag) { var f = 520 + Math.min(8, mag || 1) * 70; tone(f, 0.10, 'square', 0.07); tone(f * 1.5, 0.14, 'square', 0.05); },
    gold: function () { tone(784, 0.10, 'square', 0.08); tone(1047, 0.12, 'square', 0.07); tone(1319, 0.18, 'square', 0.06); },
    bad: function () { tone(180, 0.18, 'sawtooth', 0.08); },
    hit: function () { tone(120, 0.2, 'sawtooth', 0.09); },
    clash: function () { tone(90, 0.06, 'sawtooth', 0.06); },
    weapon: function () { tone(220, 0.05, 'square', 0.06); tone(330, 0.08, 'sawtooth', 0.06); tone(180, 0.12, 'square', 0.05); },
    evolve: function () { tone(523, 0.10, 'square', 0.08); tone(784, 0.12, 'square', 0.07); tone(1047, 0.20, 'square', 0.07); },
    win: function () { tone(523, 0.14, 'square', 0.07); tone(659, 0.16, 'square', 0.07); tone(784, 0.24, 'square', 0.07); },
    lose: function () { tone(330, 0.2, 'sawtooth', 0.08); tone(180, 0.4, 'sawtooth', 0.07); },
    coin: function () { tone(880, 0.06, 'square', 0.06); tone(1320, 0.08, 'square', 0.05); },
    blip: function () { tone(440, 0.08, 'square', 0.05); }
  };

  // ── Difficulty ──
  function difficulty() {
    return {
      speed: 5.4 + round * 0.5,
      gateCount: 9 + Math.min(8, round),
      obstacleChance: Math.min(0.55, 0.22 + round * 0.05),
      // boss = this fraction of a flawless run. Rises with round.
      // Low early (forgiving), higher late (must play near-perfect).
      bossFactor: Math.min(0.80, 0.45 + round * 0.04)
    };
  }

  // ── Gate operations ──
  // Pure value function so the round planner and live play stay identical.
  // Operates on a { count, power } state. Number ops change count;
  // weapon ops (wadd/wmul) change per-person power — the second axis.
  function applyOpState(op, st) {
    var c = st.count, p = st.power;
    if (op.kind === 'add') c += op.val;
    else if (op.kind === 'mul') c *= op.val;
    else if (op.kind === 'sub') c -= op.val;
    else if (op.kind === 'div') c = Math.floor(c / op.val);
    else if (op.kind === 'wadd') p += op.val;
    else if (op.kind === 'wmul') p *= op.val;
    c = Math.max(0, Math.min(COUNT_CAP, Math.round(c)));
    p = Math.max(1, Math.min(999, p));
    return { count: c, power: p };
  }
  // strength a side would yield from the current crowd state (for AI/planner)
  function sideStrength(op, st) {
    var r = applyOpState(op, st);
    return r.count * r.power;
  }
  function isWeapon(op) { return op.kind === 'wadd' || op.kind === 'wmul'; }
  function opLabel(op) {
    if (op.kind === 'wadd') return '\u2694+' + op.val;
    if (op.kind === 'wmul') return '\u2694\u00D7' + op.val;
    if (op.kind === 'add') return '+' + op.val;
    if (op.kind === 'mul') return '\u00D7' + op.val;
    if (op.kind === 'sub') return '-' + op.val;
    return '\u00F7' + op.val;
  }
  function opColor(op) {
    if (op.gold) return '#f59f00';
    if (isWeapon(op)) return '#ae3ec9';
    if (op.kind === 'add') return '#2f9e44';
    if (op.kind === 'mul') return '#1c7ed6';
    if (op.kind === 'sub') return '#e03131';
    return '#e8590c';
  }
  function applyOp(op) {
    var before = crowd.count, beforeP = crowd.power;
    var r = applyOpState(op, { count: crowd.count, power: crowd.power });
    crowd.count = r.count; crowd.power = r.power;
    return { dCount: crowd.count - before, dPower: crowd.power - beforeP };
  }

  // Individual op generators.
  function goodAdd() { return { kind: 'add', val: 12 + Math.floor(Math.random() * 34), good: true }; }
  function goodMul() { return { kind: 'mul', val: Math.random() < 0.82 ? 2 : 3, good: true }; }
  function goldMul() { return { kind: 'mul', val: 3, good: true, gold: true }; }
  function wpnAdd() { return { kind: 'wadd', val: 1 + (Math.random() < 0.3 ? 1 : 0), good: true }; }
  function wpnMul() { return { kind: 'wmul', val: 2, good: true }; }
  function badSub(p) { return { kind: 'sub', val: 14 + Math.floor((20 + p * 40) * Math.random()), good: false }; }
  function badDiv(p) { return { kind: 'div', val: (p > 0.6 && Math.random() < 0.4) ? 3 : 2, good: false }; }
  function badOp(p) { return Math.random() < 0.5 ? badSub(p) : badDiv(p); }

  // Build one gate pair for progress p (0=start, 1=just before boss).
  // Archetypes create genuine decisions, with risk rising as p grows.
  function makePlannedGate(p) {
    var penalty = 0.05 + 0.42 * p;
    var a, b, gold = false;
    var r = Math.random();
    if (r < penalty) {
      // good vs bad — wrong pick hurts
      a = Math.random() < 0.25 ? goodMul() : goodAdd();
      b = badOp(p);
    } else if (r < penalty + 0.22) {
      // quantity vs quality — people add vs weapon upgrade (real tradeoff)
      a = goodAdd();
      b = Math.random() < 0.4 ? wpnMul() : wpnAdd();
    } else if (r < penalty + 0.50 * (1 - p * 0.3)) {
      // mul vs add — optimal choice depends on current count (skill check)
      a = goodMul();
      b = goodAdd();
    } else if (Math.random() < 0.10 + 0.12 * p) {
      // rare contested gold: huge mul vs a solid add
      a = goldMul(); b = goodAdd(); gold = true;
    } else {
      // two adds — easy: pick bigger
      a = goodAdd(); b = goodAdd();
    }
    if (Math.random() < 0.5) { var t = a; a = b; b = t; }
    return { left: a, right: b, gold: gold };
  }

  function makeObstacle(lateral) {
    return {
      d: FAR,
      lateral: lateral,
      half: 0.24,
      // mild, low-variance % damage: a tax for greed, not a coinflip
      damageFrac: 0.07 + Math.random() * 0.05,
      damageMin: 3,
      passed: false
    };
  }

  // Pre-generate the round and calibrate boss HP (in STRENGTH units) to a
  // flawless run. Guarantees the boss is a "just barely" wall on both axes.
  function planRound(startCount, startPower) {
    var diff = difficulty();
    plannedGates = [];
    nextGateIdx = 0;
    var i;
    for (i = 0; i < diff.gateCount; i++) {
      plannedGates[i] = makePlannedGate(i / (diff.gateCount - 1 || 1));
    }
    // simulate a flawless player: always picks the higher-strength lane
    var st = { count: startCount, power: startPower };
    for (i = 0; i < plannedGates.length; i++) {
      var g = plannedGates[i];
      var sl = sideStrength(g.left, st), sr = sideStrength(g.right, st);
      st = applyOpState(sl >= sr ? g.left : g.right, st);
    }
    var optimal = st.count * st.power * talentMult();
    roundBossHp = Math.max(startCount * startPower + 10, Math.round(optimal * diff.bossFactor));
  }



  // ── Crowd dot offsets (stable blob) ──
  function rebuildDots() {
    var n = Math.min(crowd.count, DOT_CAP);
    var golden = 2.399963;
    // grow / shrink without fully reshuffling, so the mass feels continuous
    while (dots.length < n) {
      dots.push({ ox: 0, oy: 0, ph: Math.random() * Math.PI * 2 });
    }
    if (dots.length > n) dots.length = n;
    for (var k = 0; k < dots.length; k++) {
      var rr = Math.sqrt((k + 0.5) / Math.max(1, n));
      var ang = k * golden;
      dots[k].ox = Math.cos(ang) * rr;
      dots[k].oy = Math.sin(ang) * rr;
    }
  }

  function addShake(mag) { shake = Math.min(28, shake + mag); }
  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 60 + Math.random() * 220;
      particles.push({
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
        life: 0.5 + Math.random() * 0.4, max: 0.9,
        size: 2 + Math.random() * 3, color: color
      });
    }
  }

  // ── Spawning ──
  function spawnTrack() {
    var diff = difficulty();
    // stream pre-planned gates into view as the track scrolls
    while (nextGateIdx < plannedGates.length && nextGateAt < distance + FAR && nextGateAt < goalDistance - 3) {
      var pg = plannedGates[nextGateIdx];
      var g = { d: nextGateAt - distance, left: pg.left, right: pg.right, gold: pg.gold, passed: false };
      gates.push(g);
      if (Math.random() < diff.obstacleChance) {
        // bias the obstacle toward the better-looking lane → greed vs safety
        var st = { count: Math.max(1, Math.round(crowd.count)), power: crowd.power };
        var betterLeft = sideStrength(pg.left, st) >= sideStrength(pg.right, st);
        var lane = betterLeft ? -1 : 1;
        if (Math.random() < 0.35) lane = -lane; // sometimes block the safe lane instead
        var ob = makeObstacle(lane * (0.40 + Math.random() * 0.12));
        ob.d = (nextGateAt - distance) - 2.6;
        if (ob.d > 0.8) obstacles.push(ob);
      }
      nextGateIdx++;
      nextGateAt += 5.5;
    }
    if (!bossSpawned && (goalDistance - distance) <= FAR) {
      boss = { d: goalDistance - distance, hp: roundBossHp, clashed: false, shake: 0 };
      bossSpawned = true;
    }
  }

  // ── Floating score text ──
  function addFloater(text, color, lateral, d) {
    var p = project(d, lateral);
    floaters.push({ x: p.x, y: p.y - 60 * p.s, text: text, color: color, life: 1 });
  }

  // ── Update ──
  function update(dt) {
    if (countdown > 0) { countdown -= dt; return; }
    var diff = difficulty();
    speed = diff.speed;
    var dz = speed * dt;
    distance += dz;
    scroll = (scroll + dz) % 2;

    // steering
    var steerRate = 1.4 + (save.up.steer || 0) * 0.22;
    var t = crowd.target;
    if (keyL) t -= steerRate * dt;
    if (keyR) t += steerRate * dt;
    crowd.target = Math.max(-LANE_CLAMP, Math.min(LANE_CLAMP, t));
    crowd.lateral += (crowd.target - crowd.lateral) * Math.min(1, dt * 10);

    var i;
    var crowdScreen = project(CROWD_DEPTH, crowd.lateral);
    // gates
    for (i = 0; i < gates.length; i++) {
      var g = gates[i];
      g.d -= dz;
      if (!g.passed && g.d <= CROWD_DEPTH) {
        g.passed = true;
        var op = crowd.lateral < 0 ? g.left : g.right;
        var d = applyOp(op);
        var lat = crowd.lateral < 0 ? -0.5 : 0.5;
        if (isWeapon(op)) {
          // weapon gate → power up (second axis)
          addFloater('\u2694 ' + opLabel(op).replace('\u2694', ''), '#ae3ec9', lat, CROWD_DEPTH);
          sfx.weapon(); addShake(10);
          burst(crowdScreen.x, crowdScreen.y, '#da77f2', 16);
        } else {
          addFloater((d.dCount >= 0 ? '+' : '-') + fmt(Math.abs(d.dCount)), opColor(op), lat, CROWD_DEPTH);
          if (op.gold) { sfx.gold(); addShake(16); burst(crowdScreen.x, crowdScreen.y, '#ffe066', 26); }
          else if (op.good) { sfx.good(op.kind === 'mul' ? op.val * 2 : 2); addShake(op.kind === 'mul' ? 9 : 5); burst(crowdScreen.x, crowdScreen.y, '#74c0fc', op.kind === 'mul' ? 16 : 8); }
          else { sfx.bad(); addShake(7); burst(crowdScreen.x, crowdScreen.y, '#ff8787', 8); }
        }
        checkEvolution(crowdScreen);
        rebuildDots();
        if (crowd.count <= 0) { lose(); return; }
      }
    }
    // obstacles
    for (i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      o.d -= dz;
      if (!o.passed && o.d <= CROWD_DEPTH) {
        o.passed = true;
        if (Math.abs(crowd.lateral - o.lateral) < o.half + 0.12) {
          var dmg = Math.max(o.damageMin, Math.round(crowd.count * o.damageFrac));
          crowd.count = Math.max(0, crowd.count - dmg);
          addFloater('-' + fmt(dmg), '#e03131', o.lateral, CROWD_DEPTH);
          sfx.hit(); addShake(12);
          burst(crowdScreen.x, crowdScreen.y, '#ff6b6b', 10);
          tier = tierForCount(crowd.count); // may demote silently
          rebuildDots();
          if (crowd.count <= 0) { lose(); return; }
        }
      }
    }
    // boss → trigger collision finale (compared in STRENGTH units)
    if (boss) {
      boss.d -= dz;
      if (!boss.clashed && boss.d <= CROWD_DEPTH + 0.5) {
        boss.clashed = true;
        resolving = true;
        var myStr = crowdStrength();
        // clash lasts ~0.85s: the smaller side is depleted over that window
        clash = { rate: Math.max(10, Math.min(myStr, boss.hp) / 0.85), str: myStr };
        sfx.blip();
        return;
      }
    }

    // cleanup
    gates = gates.filter(function (x) { return x.d > -2; });
    obstacles = obstacles.filter(function (x) { return x.d > -2; });
    for (i = floaters.length - 1; i >= 0; i--) {
      floaters[i].y -= 40 * dt;
      floaters[i].life -= dt * 1.2;
      if (floaters[i].life <= 0) floaters.splice(i, 1);
    }
    stepParticles(dt);
    if (shake > 0) shake = Math.max(0, shake - 60 * dt);
    if (evoBanner > 0) evoBanner = Math.max(0, evoBanner - dt);

    if (crowd.count > bestCount) bestCount = crowd.count;
    spawnTrack();
    updateHud();
  }

  function stepParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ── Evolution (B): crowd ascends a cognitive rank as it grows ──
  function checkEvolution(screen) {
    var nt = tierForCount(crowd.count);
    if (nt > tier) {
      tier = nt;
      evoBanner = 1.6;
      addShake(20);
      sfx.evolve();
      var pos = screen || project(CROWD_DEPTH, crowd.lateral);
      var col = TIERS[tier].body;
      burst(pos.x, pos.y - 20, '#ffe066', 30);
      burst(pos.x, pos.y - 20, col, 18);
    } else if (nt < tier) {
      tier = nt; // silent demotion after losses
    }
  }

  // ── Boss collision finale (compared in STRENGTH units) ──
  function updateClash(dt) {
    if (!clash) return;
    stepParticles(dt);
    if (shake > 0) shake = Math.max(0, shake - 40 * dt);
    var r = clash.rate * dt;
    clash.str = Math.max(0, clash.str - r);
    boss.hp = Math.max(0, boss.hp - r);
    boss.shake = 1;
    // reflect shrinking strength back onto the visible people count
    crowd.count = Math.max(0, clash.str / (crowd.power * talentMult()));
    if (Math.random() < 0.6) {
      var p = project(CROWD_DEPTH + 0.3, 0);
      burst(p.x + (Math.random() - 0.5) * 80, p.y - 30, Math.random() < 0.5 ? '#74c0fc' : '#ff8787', 3);
      sfx.clash();
    }
    if (boss.hp <= 0) {
      crowd.count = Math.round(crowd.count);
      var p2 = project(CROWD_DEPTH + 0.3, 0);
      burst(p2.x, p2.y - 40, '#ffe066', 40);
      addShake(24); sfx.win();
      win(); return;
    }
    if (clash.str <= 0) {
      crowd.count = 0;
      addShake(18); sfx.lose();
      lose(); return;
    }
    updateHud();
  }

  function updateHud() {
    var pw = crowd.power > 1 ? '  \u2694\u00D7' + crowd.power : '';
    var bossTxt = boss ? '   \uD83D\uDC79 ' + fmt(boss.hp) : '';
    hudEl.textContent = L('R', 'R') + round + '  ' + TIERS[tier][localStorage.getItem('lang') === 'en' ? 'en' : 'zh'] +
      ' ' + fmt(crowd.count) + pw + bossTxt + '   \u00A4 ' + save.coins;
  }

  // ── Render ──
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground() {
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a2540');
    grad.addColorStop(0.45, '#0e3a5c');
    grad.addColorStop(1, '#08243b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawRoad() {
    var bl = project(0, -1.05), br = project(0, 1.05);
    var tl = project(FAR, -1.05), tr = project(FAR, 1.05);
    // road slab
    ctx.fillStyle = '#d7dbe0';
    ctx.beginPath();
    ctx.moveTo(bl.x, bl.y); ctx.lineTo(br.x, br.y);
    ctx.lineTo(tr.x, tr.y); ctx.lineTo(tl.x, tl.y);
    ctx.closePath(); ctx.fill();
    // side rails
    drawRail(-1.05, '#9aa3ad');
    drawRail(1.05, '#9aa3ad');
    // moving rungs (sense of speed)
    var d = -scroll;
    while (d < FAR) {
      if (d > 0.1) {
        var a = project(d, -1.0), b = project(d, 1.0);
        ctx.strokeStyle = 'rgba(120,130,140,' + (0.10 + 0.18 * a.s) + ')';
        ctx.lineWidth = Math.max(1, 2 * a.s);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      d += 2;
    }
    // centre divider
    var c0 = project(0, 0), c1 = project(FAR, 0);
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = 'rgba(80,90,100,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawRail(lateral, color) {
    var b = project(0, lateral), t = project(FAR, lateral);
    var wB = 10, wT = wB * t.s;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(b.x - wB, b.y); ctx.lineTo(b.x, b.y - wB * 1.4);
    ctx.lineTo(t.x, t.y - wT * 1.4); ctx.lineTo(t.x - wT, t.y);
    ctx.closePath(); ctx.fill();
  }

  function drawGate(g) {
    drawGateHalf(g.d, -1.0, -0.05, g.left);
    drawGateHalf(g.d, 0.05, 1.0, g.right);
  }
  function drawGateHalf(d, latA, latB, op) {
    var a = project(d, latA), b = project(d, latB);
    var s = a.s;
    var h = 82 * s;
    var topY = a.y - h;
    var x = a.x, w = b.x - a.x;
    var col = opColor(op);
    var wpn = isWeapon(op);
    // ground shadow for a sense of a physical object
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse((a.x + b.x) / 2, a.y + 3 * s, w * 0.5, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // side posts (metal frame)
    ctx.fillStyle = '#495057';
    var post = Math.max(3, 7 * s);
    ctx.fillRect(x - post * 0.4, topY - 6 * s, post, h + 6 * s);
    ctx.fillRect(b.x - post * 0.6, topY - 6 * s, post, h + 6 * s);
    // panel face with vertical gradient (volume), semi-transparent
    var grad = ctx.createLinearGradient(0, topY, 0, topY + h);
    grad.addColorStop(0, col);
    grad.addColorStop(1, shade(col, -40));
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = grad;
    roundRect(x, topY, w, h, 6 * s); ctx.fill();
    ctx.globalAlpha = 1;
    // glossy top band
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    roundRect(x + 2 * s, topY + 3 * s, w - 4 * s, Math.max(2, 7 * s), 3 * s); ctx.fill();
    // weapon gates: a small chevron mark to signal "power, not people"
    if (wpn) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(1.5, 3 * s);
      var cxG = (a.x + b.x) / 2, cyG = topY + h * 0.26;
      ctx.beginPath();
      ctx.moveTo(cxG - 10 * s, cyG + 6 * s); ctx.lineTo(cxG, cyG - 6 * s); ctx.lineTo(cxG + 10 * s, cyG + 6 * s);
      ctx.stroke();
    }
    // label
    var fs = Math.max(11, 38 * s);
    ctx.fillStyle = '#fff';
    ctx.font = '800 ' + fs + 'px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3 * s;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    var ly = topY + h * (wpn ? 0.62 : 0.5);
    ctx.strokeText(opLabel(op), (a.x + b.x) / 2, ly);
    ctx.fillText(opLabel(op), (a.x + b.x) / 2, ly);
  }
  // lighten/darken a hex color by amt (-255..255)
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function drawObstacle(o) {
    var a = project(o.d, o.lateral - o.half), b = project(o.d, o.lateral + o.half);
    var s = a.s;
    var h = 46 * s;
    var topY = a.y - h;
    ctx.fillStyle = '#495057';
    ctx.fillRect(a.x, topY, b.x - a.x, h);
    ctx.fillStyle = '#ced4da';
    var stripeW = (b.x - a.x) / 6;
    for (var i = 0; i < 6; i += 2) {
      ctx.fillRect(a.x + i * stripeW, topY, stripeW, h);
    }
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = Math.max(1, 3 * s);
    ctx.strokeRect(a.x, topY, b.x - a.x, h);
  }

  function drawBoss() {
    if (!boss) return;
    var p = project(boss.d, 0);
    var s = p.s;
    var shk = boss.shake > 0 ? (Math.random() - 0.5) * 14 * boss.shake : 0;
    var bw = 150 * s, bh = 200 * s;
    var x = p.x + shk, baseY = p.y;
    // body
    ctx.fillStyle = '#c92a2a';
    roundRect(x - bw / 2, baseY - bh, bw, bh * 0.7, 16 * s); ctx.fill();
    // head
    ctx.fillStyle = '#ffd8a8';
    ctx.beginPath();
    ctx.arc(x, baseY - bh + bh * 0.05, bw * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // hp banner
    var fs = Math.max(16, 46 * s);
    ctx.fillStyle = '#fff';
    ctx.font = '800 ' + fs + 'px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeText(fmt(boss.hp), x, baseY - bh * 0.5);
    ctx.fillText(fmt(boss.hp), x, baseY - bh * 0.5);
  }

  function drawCrowd() {
    var base = project(CROWD_DEPTH, crowd.lateral);
    var s = base.s;
    // mass grows with crowd size so the snowball is visible
    var massF = Math.min(3.4, 0.75 + Math.sqrt(crowd.count) / 9);
    var spread = 46 * s * massF;
    var rDot = Math.max(2.5, 7 * s);
    var t = performance.now() / 1000;
    // shadow blob
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(base.x, base.y + 6, spread * 1.1, spread * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    for (var i = 0; i < dots.length; i++) {
      var dd = dots[i];
      var bob = Math.sin(t * 9 + dd.ph) * 3 * s;
      var px = base.x + dd.ox * spread;
      var py = base.y + dd.oy * spread * 0.5 - bob;
      // mixed units (D): tier color, with a fraction shown as the next tier (elites)
      var useTier = tier;
      if (tier < TIERS.length - 1 && (dd.elite || (i % 7 === 0))) useTier = tier + 1;
      var body = TIERS[useTier].body, head = TIERS[useTier].head;
      var er = useTier > tier ? rDot * 1.18 : rDot; // elites a touch bigger
      // body
      ctx.fillStyle = body;
      roundRect(px - er * 0.7, py - er * 1.6, er * 1.4, er * 1.8, er * 0.5);
      ctx.fill();
      // head
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(px, py - er * 1.9, er * 0.62, 0, Math.PI * 2);
      ctx.fill();
      // weapon marker when powered up
      if (crowd.power > 1 && (i % 5 === 0)) {
        ctx.strokeStyle = '#f3d9fa';
        ctx.lineWidth = Math.max(1, er * 0.28);
        ctx.beginPath();
        ctx.moveTo(px + er * 0.7, py - er * 1.4);
        ctx.lineTo(px + er * 1.3, py - er * 2.0);
        ctx.stroke();
      }
    }
    // rolling count badge (animated for juice)
    var shown = Math.round(displayCount);
    var pop = Math.abs(crowd.count - displayCount) > 0.5 ? 1.12 : 1;
    var fs = Math.max(22, (30 + Math.min(crowd.count, 400) * 0.05) * pop);
    ctx.font = '800 ' + fs + 'px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var by = base.y - spread - 24;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(fmt(shown), base.x, by);
    ctx.fillStyle = '#fff';
    ctx.fillText(fmt(shown), base.x, by);
    // power badge under the count
    if (crowd.power > 1) {
      ctx.font = '800 ' + Math.max(13, fs * 0.5) + 'px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#e599f7';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeText('\u2694\u00D7' + crowd.power, base.x, by + fs * 0.7);
      ctx.fillText('\u2694\u00D7' + crowd.power, base.x, by + fs * 0.7);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloaters() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < floaters.length; i++) {
      var f = floaters[i];
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.font = '800 26px "Space Grotesk", sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawCountdown() {
    if (countdown <= 0) return;
    var n = Math.ceil(countdown);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = '800 120px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n > 0 ? String(n) : 'GO', cx, H / 2);
  }

  function render() {
    var sx = 0, sy = 0;
    if (shake > 0) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; }
    ctx.save();
    ctx.translate(sx, sy);
    drawBackground();
    drawRoad();
    // far to near: collect drawables
    var items = [];
    var i;
    for (i = 0; i < gates.length; i++) items.push({ d: gates[i].d, t: 'g', o: gates[i] });
    for (i = 0; i < obstacles.length; i++) items.push({ d: obstacles[i].d, t: 'o', o: obstacles[i] });
    if (boss) items.push({ d: boss.d, t: 'b', o: boss });
    items.sort(function (a, b) { return b.d - a.d; });
    for (i = 0; i < items.length; i++) {
      if (items[i].t === 'g') drawGate(items[i].o);
      else if (items[i].t === 'o') drawObstacle(items[i].o);
      else drawBoss();
    }
    drawCrowd();
    drawParticles();
    drawFloaters();
    ctx.restore();
    drawEvoBanner();
    drawCountdown();
  }

  function drawEvoBanner() {
    if (evoBanner <= 0) return;
    var k = evoBanner / 1.6;            // 1→0
    var a = Math.min(1, k * 2);         // fade out at the end
    var pop = 1 + (1 - k) * 0.3;
    var y = H * 0.34;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // sub-glow bar
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, y - 44 * pop, W, 88 * pop);
    var tname = TIERS[tier][localStorage.getItem('lang') === 'en' ? 'en' : 'zh'];
    ctx.font = '800 ' + (22 * pop) + 'px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffe066';
    ctx.fillText(L('\u8FDB\u5316\uFF01', 'EVOLVED!'), cx, y - 22 * pop);
    ctx.font = '800 ' + (40 * pop) + 'px "Space Grotesk", sans-serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeText(tname, cx, y + 16 * pop);
    ctx.fillStyle = TIERS[tier].head;
    ctx.fillText(tname, cx, y + 16 * pop);
    ctx.restore();
  }

  function loop(ts) {
    if (!gameActive) return;
    if (!lastT) lastT = ts;
    var dt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;
    if (resolving) updateClash(dt);
    else update(dt);
    // rolling number toward the true count
    displayCount += (crowd.count - displayCount) * Math.min(1, dt * 12);
    if (Math.abs(crowd.count - displayCount) < 0.6) displayCount = crowd.count;
    render();
    frame = requestAnimationFrame(loop);
  }

  // ── Lifecycle ──
  function resetRound() {
    var diff = difficulty();
    crowd.count = 12 + (round - 1) * 4 + (save.up.start || 0) * 4;
    crowd.power = 1 + (save.up.weapon || 0);
    crowd.lateral = 0;
    crowd.target = 0;
    displayCount = crowd.count;
    tier = tierForCount(crowd.count);
    evoBanner = 0;
    gates = [];
    obstacles = [];
    particles = [];
    boss = null;
    clash = null;
    shake = 0;
    floaters = [];
    scroll = 0;
    distance = 0;
    bossSpawned = false;
    resolving = false;
    nextGateAt = 8;
    nextGateIdx = 0;
    planRound(crowd.count, crowd.power);
    goalDistance = 8 + plannedGates.length * 5.5 + 8;
    bestCount = crowd.count;
    dots = [];
    rebuildDots();
    spawnTrack();
    updateHud();
  }

  function startGame() {
    loadSave();
    buildUpgradePanel();
    resizeCanvas();
    canvas.classList.add('active');
    hudEl.classList.add('active');
    overEl.classList.remove('active');
    document.body.classList.add('cell-game-on');
    if (gameBtn) gameBtn.innerHTML = exitIcon;
    resetRound();
    countdown = 3;
    lastT = 0;
    gameActive = true;
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mousedown', onPointerMove);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    getAudio();
    frame = requestAnimationFrame(loop);
  }

  function detach() {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('mousemove', onPointerMove);
    canvas.removeEventListener('mousedown', onPointerMove);
    canvas.removeEventListener('touchstart', onTouch);
    canvas.removeEventListener('touchmove', onTouch);
  }

  function stopGame() {
    gameActive = false;
    if (frame) cancelAnimationFrame(frame);
    canvas.classList.remove('active');
    hudEl.classList.remove('active');
    overEl.classList.remove('active');
    document.body.classList.remove('cell-game-on');
    if (gameBtn) gameBtn.innerHTML = playIcon;
    keyL = keyR = false;
    detach();
  }

  function awardRewards(didWin) {
    var mult = 1 + (save.up.reward || 0) * 0.15;
    var coins = Math.round((Math.sqrt(bestCount) + round * 3) * mult);
    if (didWin) coins = Math.round(coins * 1.6);
    var insight = 0;
    if (didWin) insight = 1 + Math.floor(round / 3);
    else if (Math.random() < 0.2) insight = 1;
    save.coins += coins;
    save.insight += insight;
    persistSave();
    var items = [{ icon: '\u00A4', amt: coins, cls: 'coin' }];
    if (insight > 0) items.push({ icon: '\uD83D\uDCA1', amt: insight, cls: 'insight' });
    if (didWin) items.push({ icon: '\uD83C\uDFC6', amt: null, cls: 'trophy' });
    if (tier >= 3) items.push({ icon: tier >= 4 ? '\uD83E\uDDE0' : '\uD83D\uDD2C', amt: null, cls: 'relic' });
    runInsight = insight;
    return { coins: coins, insight: insight, items: items };
  }

  function win() {
    gameActive = false;
    if (frame) cancelAnimationFrame(frame);
    var rw = awardRewards(true);
    titleEl.textContent = '\uD83C\uDF89 ' + L('\u901A\u5173\uFF01', 'VICTORY!');
    titleEl.className = 'win-title';
    finalEl.textContent = L('\u6700\u9AD8 ', 'Reached ') + TIERS[tier][localStorage.getItem('lang') === 'en' ? 'en' : 'zh'] +
      ' \u00B7 ' + fmt(bestCount) + (crowd.power > 1 ? ' \u2694\u00D7' + crowd.power : '');
    roundInfoEl.style.display = '';
    roundInfoEl.textContent = L('\u7B2C ' + round + ' \u5173\u901A\u8FC7\uFF01\u4E0B\u4E00\u5173\u66F4\u96BE', 'Round ' + round + ' cleared! Next is harder');
    showRewards(rw.items);
    restartBtn.style.display = 'none';
    nextBtn.style.display = '';
    refreshUpgradePanel();
    overEl.classList.add('active');
    detach();
  }

  function lose() {
    gameActive = false;
    if (frame) cancelAnimationFrame(frame);
    var rw = awardRewards(false);
    titleEl.textContent = 'GAME OVER';
    titleEl.className = 'lose-title';
    finalEl.textContent = L('\u5CF0\u503C\u4EBA\u7FA4', 'Peak Crowd') + ' ' + fmt(bestCount) + (crowd.power > 1 ? ' \u2694\u00D7' + crowd.power : '');
    roundInfoEl.style.display = '';
    roundInfoEl.textContent = L('\u5728\u7B2C ' + round + ' \u5173\u8017\u5C3D \u00B7 \u7528\u91D1\u5E01\u5347\u7EA7\u518D\u51B2', 'Wiped on round ' + round + ' \u00B7 spend coins to power up');
    showRewards(rw.items);
    restartBtn.style.display = '';
    nextBtn.style.display = 'none';
    refreshUpgradePanel();
    overEl.classList.add('active');
    detach();
  }

  // ── Reward ceremony (C): chips pop in one by one ──
  var rewardRow = null;
  function showRewards(items) {
    if (!rewardRow) {
      rewardRow = document.createElement('div');
      rewardRow.className = 'crowd-reward-row';
      overEl.insertBefore(rewardRow, finalEl.nextSibling);
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += '<span class="crowd-reward-chip ' + it.cls + '" style="animation-delay:' + (i * 0.12) + 's">' +
        '<span class="cr-ic">' + it.icon + '</span>' +
        (it.amt != null ? '<span class="cr-amt">+' + it.amt + '</span>' : '') +
        '</span>';
    }
    rewardRow.innerHTML = html;
  }

  // ── Upgrade panel (meta-progression) ──
  var upPanel = null;
  function buildUpgradePanel() {
    if (upPanel) { refreshUpgradePanel(); return; }
    upPanel = document.createElement('div');
    upPanel.className = 'crowd-up-panel';
    var actions = overEl.querySelector('.cell-game-actions');
    overEl.insertBefore(upPanel, actions);
    refreshUpgradePanel();
  }
  function refreshUpgradePanel() {
    if (!upPanel) return;
    var html = '<div class="crowd-up-coins">\u00A4 ' + save.coins +
      '<span class="crowd-up-insight">\uD83D\uDCA1 ' + save.insight + '</span></div><div class="crowd-up-grid">';
    for (var i = 0; i < UPGRADES.length; i++) {
      var u = UPGRADES[i];
      var lv = save.up[u.id] || 0;
      var cost = upCost(u.id);
      var isIns = u.cur === 'insight';
      var bal = isIns ? save.insight : save.coins;
      var afford = bal >= cost;
      var sym = isIns ? '\uD83D\uDCA1' : '\u00A4';
      html += '<button class="crowd-up-btn' + (isIns ? ' premium' : '') + '" data-up="' + u.id + '"' + (afford ? '' : ' disabled') + '>' +
        '<span class="cu-name">' + L(u.zh, u.en) + ' <em>Lv.' + lv + '</em></span>' +
        '<span class="cu-eff">' + upEffectLabel(u.id) + '</span>' +
        '<span class="cu-cost">' + sym + ' ' + cost + '</span>' +
        '</button>';
    }
    html += '</div>';
    upPanel.innerHTML = html;
    var btns = upPanel.querySelectorAll('[data-up]');
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener('click', function () {
        var id = this.getAttribute('data-up');
        var def = upDef(id);
        var c = upCost(id);
        var bal = def.cur === 'insight' ? save.insight : save.coins;
        if (bal >= c) {
          if (def.cur === 'insight') save.insight -= c; else save.coins -= c;
          save.up[id] = (save.up[id] || 0) + 1;
          persistSave();
          sfx.coin();
          refreshUpgradePanel();
        }
      });
    }
  }

  // ── Controls ──
  function setTargetFromX(clientX) {
    var hw = roadHalfBottom * (FOCAL / (FOCAL + CROWD_DEPTH));
    var lat = (clientX - cx) / hw;
    crowd.target = Math.max(-LANE_CLAMP, Math.min(LANE_CLAMP, lat));
  }
  function onPointerMove(e) {
    if (e.buttons === 0 && e.type === 'mousemove') { setTargetFromX(e.clientX); return; }
    setTargetFromX(e.clientX);
  }
  function onTouch(e) {
    if (e.touches && e.touches.length) {
      e.preventDefault();
      setTargetFromX(e.touches[0].clientX);
    }
  }
  function onKeyDown(e) {
    var k = e.key.toLowerCase();
    if (k === 'escape') { stopGame(); return; }
    if (k === 'a' || k === 'arrowleft') { keyL = true; e.preventDefault(); }
    if (k === 'd' || k === 'arrowright') { keyR = true; e.preventDefault(); }
  }
  function onKeyUp(e) {
    var k = e.key.toLowerCase();
    if (k === 'a' || k === 'arrowleft') keyL = false;
    if (k === 'd' || k === 'arrowright') keyR = false;
  }

  // ── Over-panel buttons ──
  restartBtn.addEventListener('click', function () {
    overEl.classList.remove('active');
    round = 1;
    detach();
    startGame();
  });
  nextBtn.addEventListener('click', function () {
    overEl.classList.remove('active');
    round++;
    detach();
    startGame();
  });
  quitBtn.addEventListener('click', function () {
    stopGame();
  });

  // ── Public API ──
  window.CrowdGame = {
    start: function () {
      round = 1;
      if (document.body.getAttribute('data-layout') === 'cell') startGame();
    },
    stop: stopGame,
    isActive: function () {
      return canvas.classList.contains('active') || overEl.classList.contains('active');
    }
  };
})();

// ============================================================
// Game Launcher — chooser menu for Cell layout mini-games
// ============================================================
// Owns the #cell-game-btn. If a game is running, the button
// exits it; otherwise it opens a chooser to pick a game.
// Each game exposes window.<Game>.{ start, stop, isActive }.
// ============================================================

(function () {
  var btn = document.getElementById('cell-game-btn');
  var chooser = document.getElementById('game-chooser');
  if (!btn || !chooser) return;
  var closeBtn = document.getElementById('game-chooser-close');
  var cards = chooser.querySelectorAll('[data-game]');

  function games() {
    return [window.CellGame, window.CrowdGame, window.SudokuGame];
  }
  function anyActive() {
    var g = games();
    for (var i = 0; i < g.length; i++) {
      if (g[i] && g[i].isActive && g[i].isActive()) return true;
    }
    return false;
  }
  function stopAll() {
    var g = games();
    for (var i = 0; i < g.length; i++) {
      if (g[i] && g[i].isActive && g[i].isActive()) g[i].stop();
    }
  }
  function openChooser() {
    if (document.body.getAttribute('data-layout') !== 'cell') return;
    chooser.classList.add('active');
  }
  function closeChooser() {
    chooser.classList.remove('active');
  }

  btn.addEventListener('click', function () {
    if (anyActive()) { stopAll(); return; }
    if (chooser.classList.contains('active')) { closeChooser(); return; }
    openChooser();
  });

  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function () {
      var which = this.getAttribute('data-game');
      closeChooser();
      if (which === 'cell' && window.CellGame) window.CellGame.start();
      else if (which === 'crowd' && window.CrowdGame) window.CrowdGame.start();
      else if (which === 'sudoku' && window.SudokuGame) window.SudokuGame.start();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeChooser);
  chooser.addEventListener('click', function (e) {
    if (e.target === chooser) closeChooser();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chooser.classList.contains('active')) closeChooser();
  });
})();

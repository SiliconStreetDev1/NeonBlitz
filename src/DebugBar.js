// @ts-check

/**
 * Initializes the debug bar UI for testing purposes.
 * @param {import('./engine.js').GameEngine} game
 * @param {import('./types.js').UIComponents} ui
 */
export function initDebugBar(game, ui) {
  const debugContainer = document.createElement('div');
  debugContainer.style.position = 'fixed';
  debugContainer.style.bottom = '10px';
  debugContainer.style.left = '10px';
  debugContainer.style.background = 'rgba(0, 0, 0, 0.8)';
  debugContainer.style.padding = '10px 15px';
  debugContainer.style.borderRadius = '8px';
  debugContainer.style.color = '#fff';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.fontFamily = 'sans-serif';
  debugContainer.style.display = 'flex';
  debugContainer.style.display = 'none'; // Hidden by default
  debugContainer.style.alignItems = 'center'; 
  debugContainer.style.gap = '15px';

  const debugLabel = document.createElement('label');
  debugLabel.textContent = 'Debug Level: 1';

  const debugSlider = document.createElement('input');
  debugSlider.type = 'range';
  debugSlider.min = '1';
  debugSlider.max = game.progression.milestones.bossLevel.toString(); 
  debugSlider.value = '1';

  debugSlider.addEventListener('input', (e) => {
    if (!e.target) return;
    debugLabel.textContent = `Debug Level: ${/** @type {HTMLInputElement} */ (e.target).value}`;
  });

  debugSlider.addEventListener('change', (e) => {
    if (!e.target) return;
    game.level = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
    game.hud.updateLevelDisplay(game.level);
    
    game.timeRemaining = game.config.tuning.GAME_SETTINGS.STARTING_TIME_MS;
    
    game.screens.hideAllScreens();
    game.initLevel();
  });

  debugContainer.appendChild(debugLabel);
  debugContainer.appendChild(debugSlider);

  const trackSelect = document.createElement('select');
  trackSelect.style.background = '#1f2833';
  trackSelect.style.color = '#fff';
  trackSelect.style.border = '1px solid #45a29e';
  trackSelect.style.padding = '4px';
  trackSelect.style.borderRadius = '4px';
  trackSelect.style.cursor = 'pointer';

  const autoOpt = document.createElement('option');
  autoOpt.value = 'auto';
  autoOpt.textContent = '🎵 Auto Music';
  trackSelect.appendChild(autoOpt);

  const allTracks = [...game.config.audio.tracks];
  if (game.config.audio.bossTrack) allTracks.push(game.config.audio.bossTrack);
  allTracks.sort((a, b) => parseInt(a) - parseInt(b)); // Sort naturally (1, 2, 15, 20)

  allTracks.forEach(track => {
    const opt = document.createElement('option');
    opt.value = track;
    opt.textContent = `Track: ${track}`;
    trackSelect.appendChild(opt);
  });

  trackSelect.addEventListener('change', (e) => {
    if (!e.target) return;
    const val = /** @type {HTMLSelectElement} */ (e.target).value;
    if (val === 'auto') {
      game.audio.debugTrackOverride = null;
      if (game.isPlaying) game.audio.startLevelMusic(game.level, game.checkpointManager.getRunSeed(), game.progression.milestones.bossLevel);
    } else {
      game.audio.debugTrackOverride = val.replace('.json', '');
      if (game.isPlaying) game.audio.forceTrack(val);
    }
  });
  
  debugContainer.appendChild(trackSelect);

  const clearDataBtn = document.createElement('button');
  clearDataBtn.textContent = '🗑️ Wipe Saves';
  clearDataBtn.style.background = '#ff3366';
  clearDataBtn.style.color = '#0b0c10';
  clearDataBtn.style.border = 'none';
  clearDataBtn.style.padding = '6px 12px';
  clearDataBtn.style.borderRadius = '4px';
  clearDataBtn.style.cursor = 'pointer';
  clearDataBtn.style.fontWeight = 'bold';
  clearDataBtn.addEventListener('click', () => {
    game.checkpointManager.clearAllData();
    game.settings.settings = game.settings.load();

    if (game.isPlaying) game.audio?.startLevelMusic?.(game.level);
    else game.audio?.startMenuMusic?.();
    
    game.menuController.updateSettingsUI();
    game.screens.updateMenuUI();
    game.popups.showPopup('ALL DATA WIPED!', ui.canvas.width / 2, ui.canvas.height / 2, '#ff3366');
  });
  
  debugContainer.appendChild(clearDataBtn);
  document.body.appendChild(debugContainer);

  window.addEventListener('keydown', (e) => {
    if ((e.key === 'd' || e.key === 'D') && e.ctrlKey) {
      e.preventDefault(); 
      debugContainer.style.display = debugContainer.style.display === 'none' ? 'flex' : 'none';
    }
  });
}
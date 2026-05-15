// @ts-check

export class ScreenManager {
  /**
   * @param {import('../types.js').UIComponents} ui 
   * @param {import('../CheckpointManager.js').CheckpointManager} checkpointManager 
   * @param {any} config 
   */
  constructor(ui, checkpointManager, config) {
    /** @type {import('../types.js').UIComponents} */
    this.ui = ui;
    /** @type {import('../CheckpointManager.js').CheckpointManager} */
    this.checkpointManager = checkpointManager;
    /** @type {any} */
    this.config = config;
  }

  /** @returns {void} */
  hideAllScreens() {
    this.ui.startScreen.classList.add('hidden');
    this.ui.gameOverScreen.classList.add('hidden');
    this.ui.bestTimesScreen.classList.add('hidden');
    this.ui.milestoneScreen.classList.add('hidden');
    this.ui.settingsScreen.classList.add('hidden');
  }

  /** @returns {void} */
  showBestTimesScreen() {
    this.ui.startScreen.classList.add('hidden');
    this.ui.bestTimesScreen.classList.remove('hidden');
  }

  /** @returns {void} */
  showMilestoneScreen() {
    this.ui.startScreen.classList.add('hidden');
    this.ui.milestoneScreen.classList.remove('hidden');
  }

  /** @returns {void} */
  showSettingsScreen() {
    this.ui.startScreen.classList.add('hidden');
    this.ui.settingsScreen.classList.remove('hidden');
  }

  /**
   * @param {boolean} isVisible 
   */
  toggleGameVisibility(isVisible) {
    this.ui.hud.style.display = isVisible ? '' : 'none';
    this.ui.gameArea.style.display = isVisible ? '' : 'none';
  }

  /** @returns {void} */
  resizeCanvas() {
    const rect = this.ui.gridContainer.getBoundingClientRect();
    this.ui.canvas.width = rect.width;
    this.ui.canvas.height = rect.height;
  }

  /** @returns {void} */
  updateMenuUI() {
    const milestones = this.checkpointManager.getMilestones();
    const highestMilestone = Math.max(...Object.keys(milestones).map(Number), 1);
    this.ui.loadCheckpointBtn.classList.remove('hidden');
    this.ui.selectLevelBtn.classList.remove('hidden');
    if (highestMilestone > 1) {
      this.ui.loadCheckpointBtn.textContent = `▶ CONTINUE (LVL ${highestMilestone})`;
      this.ui.loadCheckpointBtn.style.opacity = '1';
      this.ui.loadCheckpointBtn.style.pointerEvents = 'auto'; 
      this.ui.selectLevelBtn.style.opacity = '1';
      this.ui.selectLevelBtn.style.pointerEvents = 'auto'; 
    } else {
      this.ui.loadCheckpointBtn.textContent = `▶ CONTINUE (LOCKED)`; 
      this.ui.loadCheckpointBtn.style.opacity = '0.5'; 
      this.ui.loadCheckpointBtn.style.pointerEvents = 'none'; 
      this.ui.selectLevelBtn.style.opacity = '0.5'; 
      this.ui.selectLevelBtn.style.pointerEvents = 'none'; 
    }
  }

  /**
   * @param {number} currentLevel 
   */
  showRewindBtn(currentLevel) {
    const milestones = this.checkpointManager.getMilestones();
    const bank = milestones[currentLevel] || this.config.tuning.GAME_SETTINGS.STARTING_TIME_MS;
    this.ui.rewindBtn.classList.remove('hidden');
    if (currentLevel > 1) {
      this.ui.rewindBtn.textContent = `⏪ RETRY LVL ${currentLevel} (${(bank / 1000).toFixed(1)}s)`;
    } else {
      this.ui.rewindBtn.textContent = `⏪ RESTART GAME`;
    }
  }

  /**
   * @param {Record<number, number>} bestTimes 
   */
  renderBestTimes(bestTimes) {
    this.ui.bestTimesList.innerHTML = '';
    const levels = Object.keys(bestTimes).map(Number).sort((a, b) => a - b);
    if (levels.length === 0) {
        this.ui.bestTimesList.innerHTML = '<div style="color: #888; text-align: center;">No records yet!</div>';
    } else {
        const fragment = document.createDocumentFragment();
        levels.forEach((/** @type {number} */ lvl) => {
            const item = document.createElement('div');
            item.className = 'best-time-item';
            item.innerHTML = `<span>Level ${lvl}</span><span style="color:#66fcf1">${(bestTimes[lvl] / 1000).toFixed(1)}s</span>`;
            fragment.appendChild(item);
        });
        this.ui.bestTimesList.appendChild(fragment);
    }
  }

  /**
   * @param {Record<number, number>} milestones 
   * @param {(lvl: number) => void} onSelect 
   */
  renderMilestones(milestones, onSelect) {
    this.ui.milestoneList.innerHTML = '';
    const levels = Object.keys(milestones).map(Number).sort((a, b) => b - a);
    if (levels.length === 0) {
        this.ui.milestoneList.innerHTML = '<div style="color: #888; text-align: center;">No milestones yet!</div>';
    } else {
        const fragment = document.createDocumentFragment();
        levels.forEach((/** @type {number} */ lvl) => {
            const item = document.createElement('div');
            item.className = 'best-time-item';
            item.style.cursor = 'pointer';
            item.innerHTML = `<span>Level ${lvl}</span><span style="color:#f1c40f">Bank: ${(milestones[lvl] / 1000).toFixed(1)}s</span>`;
            item.addEventListener('click', () => onSelect(lvl));
            fragment.appendChild(item);
        });
        this.ui.milestoneList.appendChild(fragment);
    }
  }

  /**
   * @param {import('../SettingsManager.js').SettingsManager} settings 
   */
  updateSettingsUI(settings) {
    this.ui.toggleMusicBtn.textContent = `🎵 MUSIC: ${settings.musicEnabled ? 'ON' : 'OFF'}`;
    this.ui.toggleSfxBtn.textContent = `🔊 SFX: ${settings.sfxEnabled ? 'ON' : 'OFF'}`;
    this.ui.musicVolumeSlider.value = settings.musicVolume.toString();
    this.ui.sfxVolumeSlider.value = settings.sfxVolume.toString();
  }
}
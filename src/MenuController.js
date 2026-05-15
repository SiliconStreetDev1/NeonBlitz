// @ts-check

/**
 * Handles all menu-related logic for the GameEngine.
 * Extracts UI toggles and list generations into a distinct class.
 */
export class MenuController {
  /**
   * @param {import('./engine.js').GameEngine} engine - The main game engine context.
   */
  constructor(engine) {
    /** @type {import('./engine.js').GameEngine} */
    this.engine = engine;
  }

  /**
   * Activates the main menu overlay and resets interaction state.
   */
  showStartMenu() {
    this.engine.resetState();
    this.engine.screens.hideAllScreens();
    
    this.engine.ui.startScreen.classList.remove('hidden');
    this.engine.screens.toggleGameVisibility(false);
    this.engine.screens.updateMenuUI();
    this.engine.audio?.startMenuMusic?.();
  }

  /**
   * Activates the Game Over overlay and provides retry options.
   */
  showGameOverScreen() {
    this.engine.screens.hideAllScreens();
    this.engine.screens.toggleGameVisibility(false);
    this.engine.ui.gameOverScreen.classList.remove('hidden');
    this.engine.screens.showRewindBtn(this.engine.level);
  }

  /**
   * Activates the Best Times leaderboard overlay.
   */
  showBestTimes() {
    this.engine.screens.showBestTimesScreen();
    this.engine.screens.renderBestTimes(this.engine.checkpointManager.getBestTimes());
  }

  /**
   * Activates the Milestone Selector overlay.
   */
  showMilestoneSelector() {
    this.engine.screens.showMilestoneScreen();
    this.engine.screens.renderMilestones(
        this.engine.checkpointManager.getMilestones(),
        (lvl) => this.engine.loadCheckpointGame(lvl)
    );
  }

  /**
   * Activates the Settings overlay.
   */
  showSettings() {
    this.engine.screens.showSettingsScreen();
    this.updateSettingsUI();
  }

  /**
   * Synchronizes the UI sliders, toggles, and dropdowns with the current settings state.
   */
  updateSettingsUI() {
    this.engine.screens.updateSettingsUI(this.engine.settings);
  }

  /**
   * Toggles the global music state and handles immediately starting/stopping the track.
   */
  toggleMusic() {
    this.engine.settings.musicEnabled = !this.engine.settings.musicEnabled;
    if (this.engine.settings.musicEnabled) {
      this.engine.audio?.startMenuMusic?.();
    } else {
      this.engine.audio?.stopMusic?.();
    }
    this.updateSettingsUI();
  }

  /**
   * Toggles the global sound effects state.
   */
  toggleSfx() {
    this.engine.settings.sfxEnabled = !this.engine.settings.sfxEnabled;
    if (this.engine.settings.sfxEnabled) this.engine.audio?.playSelect?.();
    this.updateSettingsUI();
  }

  /**
   * Restores settings to their default values and applies them immediately.
   */
  restoreDefaults() {
    this.engine.settings.restoreDefaults();
    this.updateSettingsUI();
    
    // Instantly apply the restored music state and volume
    if (this.engine.settings.musicEnabled) {
      if (!this.engine.audio?.getCurrentMusicTrack()) {
        this.engine.audio?.startMenuMusic?.();
      }
      this.engine.audio?.setMusicVolume?.(this.engine.settings.musicVolume);
    } else {
      this.engine.audio?.stopMusic?.();
    }
    if (this.engine.settings.sfxEnabled) this.engine.audio?.playSelect?.();
  }

  /**
   * Sets the master music volume.
   * @param {number} vol - Value between 0.0 and 1.0.
   */
  setMusicVolume(vol) {
    this.engine.settings.musicVolume = vol;
    if (this.engine.settings.musicEnabled) this.engine.audio?.setMusicVolume?.(vol);
  }

  /**
   * Sets the master sound effects volume.
   * @param {number} vol - Value between 0.0 and 1.0.
   */
  setSfxVolume(vol) {
    this.engine.settings.sfxVolume = vol;
  }
}
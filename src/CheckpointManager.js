// @ts-check

/**
 * @fileoverview Manages all game progress data stored in localStorage,
 * including player milestones and best times. Provides robust, safe access.
 */
export class CheckpointManager {
  /**
   * @param {any} storageConfig 
   */
  constructor(storageConfig) {
    /** @type {any} */
    this.storageConfig = storageConfig;
    // Ensure localStorage is accessible (e.g., in some privacy modes, it's not)
    /** @type {boolean} */
    this.isStorageAvailable = this._checkStorageAvailability();
  }

  /**
   * Checks if localStorage is available and writable.
   * @returns {boolean}
   */
  _checkStorageAvailability() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("localStorage is not available or writable. Progress will not be saved.", e);
      return false;
    }
  }

  /**
   * Retrieves all saved milestones.
   * @returns {{[key: number]: number}} A map of level to banked time.
   */
  getMilestones() {
    if (!this.isStorageAvailable) return {};
    try {
      return JSON.parse(localStorage.getItem(this.storageConfig.MILESTONES) || '{}');
    } catch (e) {
      console.error("Failed to parse milestones from localStorage, returning empty object:", e);
      return {};
    }
  }

  /**
   * Saves a milestone for a given level with the current banked time.
   * Only saves if the new banked time is better than the existing one.
   * @param {number} level - The level to save.
   * @param {number} bankedTime - The time remaining when reaching this level.
   * @returns {boolean} True if a new/better milestone was saved.
   */
  saveMilestone(level, bankedTime) {
    if (!this.isStorageAvailable) return false;
    const milestones = this.getMilestones();
    const existingBank = milestones[level] || 0;
    if (bankedTime > existingBank) {
      milestones[level] = bankedTime;
      localStorage.setItem(this.storageConfig.MILESTONES, JSON.stringify(milestones));
      return true;
    }
    return false;
  }

  /**
   * Retrieves all best times for each level.
   * @returns {{[key: number]: number}} A map of level to best time spent.
   */
  getBestTimes() {
    if (!this.isStorageAvailable) return {};
    try {
      return JSON.parse(localStorage.getItem(this.storageConfig.BEST_TIMES) || '{}');
    } catch (e) {
      console.error("Failed to parse best times from localStorage, returning empty object:", e);
      return {};
    }
  }

  /**
   * Saves a new best time for a level if the new time is faster.
   * @param {number} level - The level to save the time for.
   * @param {number} timeSpent - The time spent to complete the level.
   * @returns {boolean} True if a new best time was set.
   */
  saveBestTime(level, timeSpent) {
    if (!this.isStorageAvailable) return false;
    const bestTimes = this.getBestTimes();
    const prevBest = bestTimes[level];
    if (!prevBest || timeSpent < prevBest) {
      bestTimes[level] = timeSpent;
      localStorage.setItem(this.storageConfig.BEST_TIMES, JSON.stringify(bestTimes));
      return true;
    }
    return false;
  }

  /**
   * Retrieves the current run's deterministic seed.
   * @returns {number}
   */
  getRunSeed() {
    if (!this.isStorageAvailable) return 12345;
    try {
      const seed = localStorage.getItem(this.storageConfig.SETTINGS + '_seed');
      return seed ? parseInt(seed, 10) : 12345;
    } catch (e) {
      return 12345;
    }
  }

  /**
   * Saves the deterministic seed for the current run.
   * @param {number} seed 
   */
  saveRunSeed(seed) {
    if (!this.isStorageAvailable) return;
    try { localStorage.setItem(this.storageConfig.SETTINGS + '_seed', seed.toString()); } 
    catch (e) { /* Ignore privacy mode errors */ }
  }

  /**
   * Clears all saved game data (milestones and best times).
   */
  clearAllData() {
    if (!this.isStorageAvailable) return;
    localStorage.removeItem(this.storageConfig.MILESTONES);
    localStorage.removeItem(this.storageConfig.BEST_TIMES);
    localStorage.removeItem(this.storageConfig.SETTINGS);
    localStorage.removeItem(this.storageConfig.SETTINGS + '_seed');
    console.log("All game data cleared from localStorage.");
  }
}
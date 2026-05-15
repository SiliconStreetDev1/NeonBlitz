// @ts-check
import { isTouchDevice } from './device.js';

/**
 * @fileoverview Manages user preferences and settings, persisting them to localStorage.
 */

/**
 * @typedef {Object} GameSettings
 * @property {boolean} musicEnabled
 * @property {boolean} sfxEnabled
 * @property {number} musicVolume
 * @property {number} sfxVolume
 */

export class SettingsManager {
  /** @type {GameSettings} */
  settings;

  /**
   * @param {any} storageConfig 
   */
  constructor(storageConfig) {
    /** @type {any} */
    this.storageConfig = storageConfig;
    this.settings = this.load();
  }

  /**
   * Loads settings from localStorage or returns defaults.
   * @returns {GameSettings}
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageConfig.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          // Merge with defaults to gracefully handle missing values from older saves
          return {
            musicEnabled: parsed.musicEnabled ?? true,
            sfxEnabled: parsed.sfxEnabled ?? true,
            musicVolume: parsed.musicVolume ?? 1.0,
            sfxVolume: parsed.sfxVolume ?? 1.0
          };
        }
      }
    } catch (e) {
      console.warn("Could not load settings, using defaults", e);
    }
    return { musicEnabled: true, sfxEnabled: true, musicVolume: 1.0, sfxVolume: 1.0 };
  }

  /**
   * Saves the current settings state to localStorage.
   */
  save() {
    try {
      localStorage.setItem(this.storageConfig.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Could not save settings", e);
    }
  }

  get musicEnabled() { return this.settings.musicEnabled; }
  /** @param {boolean} val */
  set musicEnabled(val) { this.settings.musicEnabled = val; this.save(); }

  get sfxEnabled() { return this.settings.sfxEnabled; }
  /** @param {boolean} val */
  set sfxEnabled(val) { this.settings.sfxEnabled = val; this.save(); }

  get musicVolume() { return this.settings.musicVolume; }
  /** @param {number} val */
  set musicVolume(val) { this.settings.musicVolume = val; this.save(); }

  get sfxVolume() { return this.settings.sfxVolume; }
  /** @param {number} val */
  set sfxVolume(val) { this.settings.sfxVolume = val; this.save(); }
}
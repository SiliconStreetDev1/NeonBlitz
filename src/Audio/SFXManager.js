// @ts-check

/**
 * Handles all procedural sound effect generation using the RLO Audio Engine.
 */
export class SFXManager {
  /**
   * @param {import('rlo-engine').RLOGameEngine} rloEngine 
   * @param {import('../SettingsManager.js').SettingsManager} settings 
   */
  constructor(rloEngine, settings) {
    /** @type {import('rlo-engine').RLOGameEngine} */
    this.engine = rloEngine;
    /** @type {import('../SettingsManager.js').SettingsManager} */
    this.settings = settings;
  }

  /**
   * @param {number} id 
   * @param {number | string} freq 
   * @param {number} duration 
   * @param {number} velocity 
   * @param {number} [timeOffset=0] 
   */
  playSFX(id, freq, duration, velocity, timeOffset = 0) {
    if (!this.settings.sfxEnabled) return;
    // Pass settings down using the new Options Object API
    this.engine.playSFX(id, freq, duration, {
      velocity: velocity * this.settings.sfxVolume * 1.2,
      timeOffset: timeOffset
    });
  }

  /** @returns {void} */
  playSelect() {
    this.playSFX(9, "A5", 0.1, 0.45);
  }

  playDeselect() {
    this.playSFX(9, "A4", 0.1, 0.3);
  }

  playError() {
    // Heavy Overdriven Error Buzzer
    // Switching to the Electric Guitar synth (ID 27) and stacking an octave 
    // forces the compressor to violently distort the sound, making it MUCH louder.
    this.playSFX(27, "A2", 0.4, 1.0);
    this.playSFX(27, "A#2", 0.4, 1.0);
    this.playSFX(27, "A3", 0.4, 1.0);
  }

  playSuccess() {
    // Epic, bright arcade arpeggio using the Lead Synth (ID 83)
    // Velocity pushed to 1.0, with a stacked lower root note for extra body
    this.playSFX(83, "C4", 0.1, 1.0);
    this.playSFX(83, "C3", 0.4, 1.0); // Stacked lower octave for weight
    this.playSFX(83, "E4", 0.1, 1.0, 0.05);
    this.playSFX(83, "G4", 0.2, 1.0, 0.1);
    this.playSFX(83, "C5", 0.4, 1.0, 0.15); // Bright top note to cut through
  }

  playLevelComplete() {
    // ID 83: Lead Synth victorious chime 
    // Velocity pumped to 1.0 and an extra octave stacked on the final hit for a grander impact
    this.playSFX(83, "A4", 0.5, 1.0);
    this.playSFX(83, "E5", 0.5, 1.0, 0.15);
    this.playSFX(83, "A5", 0.8, 1.0, 0.3);
    this.playSFX(83, "A3", 0.8, 1.0, 0.3); // Stacked lower octave for depth
  }

  playGameOver() {
    // EPIC CYBERPUNK SYSTEM FAILURE
    // 1. Sharp, dissonant warning alarm
    this.playSFX(83, "B4", 0.1, 1.0);
    this.playSFX(83, "F5", 0.15, 1.0, 0.05);
    
    // 2. Rapidly cascading glitch/error notes
    this.playSFX(83, "F4", 0.05, 1.0, 0.15);
    this.playSFX(83, "D4", 0.05, 1.0, 0.20);
    this.playSFX(83, "B3", 0.05, 1.0, 0.25);
    this.playSFX(83, "G#3", 0.05, 1.0, 0.30);
    this.playSFX(83, "F3", 0.05, 1.0, 0.35);

    // 3. Massive Power-Down Bass Explosion (Syncs perfectly with the visual red flash)
    this.playSFX(38, "C1", 2.5, 1.0, 0.40); // Deep synth bass crash
    this.playSFX(32, "C1", 2.5, 1.0, 0.40); // Acoustic bass stack for physical punch
    this.playSFX(127, "C2", 2.0, 1.0, 0.40); // Gunshot / explosion hit

    // 4. Sizzling digital corruption and static fading out
    this.playSFX(120, "G2", 1.5, 0.8, 0.45); // Static sizzle
    this.playSFX(120, "C3", 2.5, 0.6, 0.60); // Trailing noise
  }
}

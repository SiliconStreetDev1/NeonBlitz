// @ts-check
import { 
  RLOGameEngine,
  createInstrumentMap,
  PianoSynth,
  ChromaticPercussionSynth,
  OrganSynth,
  GuitarSynth,
  ElectricGuitarSynth,
  BassSynth,
  StringSynth,
  BrassSynth,
  WoodwindSynth,
  LeadSynth,
  PadSynth,
  EthnicSynth,
  DrumSynth,
  SoundEffectsSynth
} from 'rlo-engine';
import { SFXManager } from './SFXManager.js';
import { MusicManager } from './MusicManager.js';
import { seededRandom } from '../utils.js';

/**
 * Master controller for all game audio.
 * Initializes the Web Audio API and routes requests to specific sub-managers.
 */
export class AudioManager {
  /**
   * @param {import('../SettingsManager.js').SettingsManager} settings 
   * @param {any} audioConfig 
   */
  constructor(settings, audioConfig) {
    /** @type {import('../SettingsManager.js').SettingsManager} */
    this.settings = settings;
    /** @type {any} */
    this.audioConfig = audioConfig;
    /** @type {boolean} */
    this.isInitialized = false;
    /** @type {boolean} */
    this._iosUnlocked = false;
    /** @type {string | null} */
    this.debugTrackOverride = null;
    
    /** @type {AudioContext | null} */
    this.ctx = null;
    /** @type {RLOGameEngine | null} */
    this.rloEngine = null;
    
    /** @type {SFXManager | null} */
    this.sfx = null;
    /** @type {MusicManager | null} */
    this.music = null;
  }

  /** @returns {void} */
  init() {
    if (this.isInitialized) return;
    
    // Browsers require a user interaction before an AudioContext can play sound!
    const AudioContext = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    this.ctx = new AudioContext();

    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // Create a static registry so the Vite bundler doesn't drop the classes during minification
    /** @type {Record<string, new () => any>} */
    const synthRegistry = {
      PianoSynth,
      ChromaticPercussionSynth,
      OrganSynth,
      GuitarSynth,
      ElectricGuitarSynth,
      BassSynth,
      StringSynth,
      BrassSynth,
      WoodwindSynth,
      LeadSynth,
      PadSynth,
      EthnicSynth,
      DrumSynth,
      SoundEffectsSynth
    };

    // Dynamically build instrument map from JSON
    const customMap = createInstrumentMap(
      this.audioConfig.instruments.map((/** @type {{synth: string, start: number, end: number}} */ inst) => ({
        synth: new synthRegistry[inst.synth](),
        start: inst.start,
        end: inst.end
      }))
    );

    this.rloEngine = new RLOGameEngine(this.ctx, customMap);

    // Boot up our modular sub-systems
    this.sfx = new SFXManager(this.rloEngine, this.settings);
    this.music = new MusicManager(this.rloEngine, this.settings, this.ctx);

    this.isInitialized = true;
    console.log("🎵 AudioManager: Core RLO Engine Initialized!");
  }

  /**
   * Explicitly attempts to resume the AudioContext to satisfy strict autoplay policies.
   */
  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((/** @type {any} */ e) => console.warn("🎵 AudioManager: Failed to resume context:", e));
      console.log("🎵 AudioManager: AudioContext Resumed!");
    }

    // iOS Safari Web Audio Unlocker:
    // Play a silent oscillator synchronously during the user interaction.
    // This allows future async audio calls (like fetching track JSON) to play without being blocked.
    if (this.ctx && !this._iosUnlocked) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.001);
      this._iosUnlocked = true;
    }
  }

  // --- PROXY METHODS (Safely passes UI and Game Loop triggers to sub-managers) ---
  /**
   * @param {number} id 
   * @param {number | string} freq 
   * @param {number} duration 
   * @param {number} velocity 
   * @param {number} [timeOffset=0]
   */
  playSFX(id, freq, duration, velocity, timeOffset = 0) { this.sfx?.playSFX(id, freq, duration, velocity, timeOffset); }
  /** @returns {void} */
  playSelect() { this.sfx?.playSelect(); }
  /** @returns {void} */
  playError() { this.sfx?.playError(); }
  /** @returns {void} */
  playSuccess() { this.sfx?.playSuccess(); }
  /** @returns {void} */
  playDeselect() { this.sfx?.playDeselect(); }
  /** @returns {void} */
  playLevelComplete() { this.sfx?.playLevelComplete(); }
  /** @returns {void} */
  playGameOver() { this.sfx?.playGameOver(); }

  /** @returns {void} */
  startMenuMusic() { this.music?.startMenuMusic(); }
  
  /**
   * @param {number} level 
   * @param {number} [runSeed=12345] 
   * @param {number} [bossLevel=60] 
   */
  startLevelMusic(level, runSeed = 12345, bossLevel = 60) { 
    if (!this.music) return;
    
    if (this.debugTrackOverride) {
      this.music.startLevelMusic(this.debugTrackOverride);
      return;
    }

    let trackId = level.toString();
    
    if (this.audioConfig.tracks && this.audioConfig.tracks.length > 0) {
      if (level === bossLevel && this.audioConfig.bossTrack) {
        trackId = this.audioConfig.bossTrack.replace('.json', '');
      } else {
        /** @type {string[]} */
        const tracks = [...this.audioConfig.tracks];
        const rng = seededRandom(runSeed);
        
        // Enterprise-grade Fisher-Yates Shuffle for a mathematically fair playlist
        for (let j = tracks.length - 1; j > 0; j--) {
          const k = Math.floor(rng() * (j + 1));
          [tracks[j], tracks[k]] = [tracks[k], tracks[j]];
        }
        
        const mappedIndex = (level - 1) % tracks.length;
        trackId = tracks[mappedIndex].replace('.json', '');
      }
    }
    
    this.music.startLevelMusic(trackId); 
  }

  /** @param {string} trackId */
  forceTrack(trackId) {
    if (!this.music) return;
    this.music.startLevelMusic(trackId.replace('.json', ''));
  }
  
  /** @returns {void} */
  stopMusic() { this.music?.stopMusic(); }
  /** @param {number} vol */
  setMusicVolume(vol) { this.music?.setVolume(vol); }

  /**
   * @returns {number} The current beat intensity (0.0 to 1.0)
   */
  getBeatPulse() { return this.music?.getBeatPulse?.() || 0; }

  /**
   * @returns {string | null} The currently playing music track filename.
   */
  getCurrentMusicTrack() {
    return this.music?.currentTrackName || null;
  }
}

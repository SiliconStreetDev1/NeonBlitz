// @ts-check
import vfxManifest from './vfx-manifest.json';

/**
 * Master manager for track-specific visual effects plugins.
 * Handles the rendering loop, canvas composition, and global masks (like Spotlight).
 */
export class VisualEffectsManager {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {import('./engine.js').GameEngine} game 
   */
  constructor(canvas, ctx, game) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.game = game;
    
    /** @type {Record<string, import('./types.js').VFXPlugin[]>} */
    this.plugins = {};
    /** @type {import('./types.js').VFXPlugin[]} */
    this.allPlugins = [];
    /** @type {Record<string, new (game: import('./engine.js').GameEngine) => import('./types.js').VFXPlugin>} */
    this.pluginRegistry = {};

    /** @type {number} */
    this.lastTime = performance.now();
    /** @type {string | null} */
    this.lastTrackName = null;
    /** @type {boolean} */
    this.isCanvasClear = true;

    // Ensure the canvas matches the display size
    this.resize = this.resize.bind(this);
    /** @type {number | null} */
    this._resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = window.setTimeout(this.resize, 150);
    });
    this.resize();

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  /**
   * Resizes the effect canvas to exactly match its parent container.
   */
  resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  }

  /**
   * Fetches the central VFX manifest and provisions the plugins.
   */
  async loadManifest() {
    try {
      const manifest = vfxManifest;
      
      // Dynamically load all unique plugins referenced in the manifest
      const uniqueEffects = new Set();
      for (const track in manifest.mappings) {
        for (const effect of manifest.mappings[track].effects) {
          uniqueEffects.add(effect);
        }
      }
      const promises = Array.from(uniqueEffects).map(async (effect) => {
        const filename = effect === 'BloodDrips' ? 'BloodParticleSystem' : `${effect}Plugin`;
        const module = await import(`./Plugins/${filename}.js`);
        this.pluginRegistry[effect] = Object.values(module)[0];
      });
      await Promise.all(promises);
      
      this.applyManifest(manifest);
    } catch (e) {
      console.error("⚠️ VisualEffectsManager: Error loading vfx-manifest.json", e);
    }
  }

  /**
   * Parses the loaded JSON manifest and registers plugin instances to specific tracks.
   * @param {any} manifest - The parsed VFX configuration object.
   */
  applyManifest(manifest) {
    const mappings = manifest.mappings || {};
    for (const trackName in mappings) {
      const effects = mappings[trackName].effects || [];
      for (const effectName of effects) {
        const PluginClass = this.pluginRegistry[effectName];
        if (PluginClass) {
          this.registerPlugin(trackName, PluginClass);
        } else {
          console.warn(`⚠️ VisualEffectsManager: Plugin '${effectName}' not found in registry.`);
        }
      }
    }
  }

  /**
   * Registers an effect plugin to activate when a specific track plays.
   * @param {string} trackName - The file name of the track (e.g. '21.json')
   * @param {new (game: import('./engine.js').GameEngine) => import('./types.js').VFXPlugin} PluginClass - The class to instantiate
   */
  registerPlugin(trackName, PluginClass) {
    if (!this.plugins[trackName]) {
      this.plugins[trackName] = [];
    }
    const pluginInstance = new PluginClass(this.game);
    this.plugins[trackName].push(pluginInstance);
    this.allPlugins.push(pluginInstance);
  }

  /**
   * The main render loop for visual effects, heavily optimized for performance.
   * @param {number} time - High-resolution timestamp provided by requestAnimationFrame.
   */
  loop(time) {
    requestAnimationFrame(this.loop);
    // Cap dt to 100ms to prevent math explosions when returning from a backgrounded tab
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    const rawTrack = this.game.getCurrentMusicTrack();
    const currentTrack = rawTrack ? (rawTrack.endsWith('.json') ? rawTrack : rawTrack + '.json') : null;

    // Instantly wipe all particles when the track changes to prevent bleed-over
    if (this.lastTrackName !== currentTrack) {
      for (const plugin of this.allPlugins) {
        if (typeof plugin.clear === 'function') {
          plugin.clear();
        }
      }
      this.lastTrackName = currentTrack;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.isCanvasClear = true;
    }

    let needsRender = false;

    // Fetch framework-level state for visual plugins to optionally sync with
    const baseSpeed = this.game.getSpeedMultiplier ? this.game.getSpeedMultiplier() : 1.0;
    const beatPulse = this.game.getBeatPulse ? this.game.getBeatPulse() : 0;
    const effectState = {
      baseSpeed: baseSpeed,
      beatPulse: beatPulse,
      speedMultiplier: baseSpeed + (beatPulse * 2.5) // Kept for backwards compatibility
    };

    // Iterate backwards so we can safely remove crashing plugins without skipping indices
    for (let i = this.allPlugins.length - 1; i >= 0; i--) {
      const plugin = this.allPlugins[i];
      const isTriggered = (this.plugins[currentTrack] || []).includes(plugin) && this.game.isPlaying;
      
      try {
        plugin.update(dt, isTriggered, this.canvas, effectState);
        if (plugin.hasActiveParticles()) {
          needsRender = true;
        }
      } catch (err) {
        console.error("⚠️ VisualEffectsManager: Plugin crashed during update() and has been disabled.", err);
        this.allPlugins.splice(i, 1); // Quarantine the broken plugin
      }
    }

    // Optimization: If no plugins have active particles, clear canvas and skip render phase
    if (!needsRender) {
      if (!this.isCanvasClear) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isCanvasClear = true;
      }
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isCanvasClear = false;

    // --- GLOBAL SPOTLIGHT CLIPPING ---
    // We handle the global clipping mask here so plugins don't have to duplicate the logic.
    const fog = this.game.hazards?.getPlugin('fog');
    const isSpotlight = fog && fog.isActive;

    if (isSpotlight) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(fog.currentX, fog.currentY, fog.currentRadius, 0, Math.PI * 2);
      this.ctx.clip();
    }

    // Render all active plugins
    for (const plugin of this.allPlugins) {
      try {
        if (plugin.hasActiveParticles()) {
          plugin.render(this.ctx, this.canvas);
        }
      } catch (err) {
        console.error("⚠️ VisualEffectsManager: Plugin crashed during render() and has been disabled.", err);
        this.allPlugins.splice(this.allPlugins.indexOf(plugin), 1);
      }
    }

    if (isSpotlight) {
      this.ctx.restore();
    }
  }
}
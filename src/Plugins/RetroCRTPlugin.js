// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Overlays scanlines and occasional vertical jitters.
 * @implements {VFXPlugin}
 */
export class RetroCRTPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {number} */
    this.time = 0;
    /** @type {boolean} */
    this.isActive = false;
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.isActive; }
  
  /** @returns {void} */
  clear() { this.isActive = false; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    this.isActive = isTriggered;
    if (isTriggered) this.time += dt;
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
    // 2% chance per frame for a screen jitter tear
    if (Math.random() > 0.98) {
      const shift = Math.random() * 10 - 5;
      ctx.drawImage(canvas, 0, shift);
    }
  }
}
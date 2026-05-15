// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Occasional stark white/purple flashes of lightning.
 * @implements {VFXPlugin}
 */
export class ThunderstormFlashesPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {number} */
    this.flashTimer = 0;
    /** @type {number} */
    this.nextFlash = Math.random() * 5 + 3;
    /** @type {number} */
    this.opacity = 0;
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.opacity > 0; }
  /** @returns {void} */
  clear() { this.opacity = 0; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered) {
      this.flashTimer += dt;
      if (this.flashTimer > this.nextFlash) {
        this.opacity = 0.8;
        this.flashTimer = 0;
        this.nextFlash = Math.random() * 5 + 2;
      }
    }
    if (this.opacity > 0) {
      this.opacity -= dt * 2.0;
      if (this.opacity < 0) this.opacity = 0;
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (this.opacity > 0) {
      ctx.fillStyle = `rgba(220, 200, 255, ${this.opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}
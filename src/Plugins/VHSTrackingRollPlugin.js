// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class VHSTrackingRollPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {number} */
    this.y = -100; 
    /** @type {boolean} */
    this.isActive = false; 
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.isActive; }
  /** @returns {void} */
  clear() { this.isActive = false; this.y = -100; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    this.isActive = isTriggered;
    if (isTriggered) {
      this.y += dt * 150;
      if (this.y > canvas.height + 100 && Math.random() > 0.95) this.y = -100;
    }
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (this.y > -50 && this.y < canvas.height + 50) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(0, this.y + i * 4 + (Math.random() * 4 - 2), canvas.width, 2);
      }
      if (Math.random() > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.fillStyle = 'rgba(255,0,255,0.1)';
        ctx.fillRect(0, this.y - 20, canvas.width, 60);
        ctx.restore();
      }
    }
  }
}
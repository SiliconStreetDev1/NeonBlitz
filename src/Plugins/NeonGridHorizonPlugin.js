// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Draws a scrolling 3D wireframe perspective floor.
 * @implements {VFXPlugin}
 */
export class NeonGridHorizonPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {number} */
    this.offset = 0;
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
   */
  update(dt, isTriggered, canvas) {
    this.isActive = isTriggered;
    if (isTriggered) {
      this.offset += dt * 100;
      if (this.offset > 40) this.offset -= 40;
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';

    const horizonY = canvas.height * 0.7;
    
    for (let i = 0; i < 10; i++) {
      const y = horizonY + Math.pow(i, 1.5) * 5 + this.offset;
      if (y < canvas.height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    const centerX = canvas.width / 2;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * 20, horizonY);
      ctx.lineTo(centerX + i * 150, canvas.height);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}
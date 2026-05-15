// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class HeatMiragePlugin {
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
   */
  update(dt, isTriggered) { 
    this.isActive = isTriggered; 
    if (isTriggered) this.time += dt * 3; 
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 150, 50, 0.05)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
      ctx.lineTo(x, canvas.height * 0.8 + Math.sin(x * 0.05 + this.time) * 15);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
    ctx.restore();
  }
}
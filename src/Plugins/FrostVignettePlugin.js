// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class FrostVignettePlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
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
  update(dt, isTriggered, canvas, effectState) { this.isActive = isTriggered; }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width/4, canvas.width/2, canvas.height/2, canvas.height);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(200,240,255,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}
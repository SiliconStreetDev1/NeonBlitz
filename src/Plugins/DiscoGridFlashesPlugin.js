// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class DiscoGridFlashesPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {number} */
    this.flashTimer = 0; 
    /** @type {number} */
    this.opacity = 0; 
    /** @type {string} */
    this.color = '#fff'; 
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.opacity > 0; }
  
  /** @returns {void} */
  clear() { this.opacity = 0; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (isTriggered) {
      this.flashTimer += dt;
      if (this.flashTimer > 0.45) { // syncs well with upbeat EDM
        this.flashTimer = 0; this.opacity = 0.5;
        this.color = ['#ff3366', '#33ccff', '#cc33ff', '#33cc66'][Math.floor(Math.random() * 4)];
      }
    }
    if (this.opacity > 0) {
      this.opacity -= dt * 1.5;
      if (this.opacity < 0) this.opacity = 0;
    }
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.height);
    grad.addColorStop(0, this.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = this.opacity; ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}
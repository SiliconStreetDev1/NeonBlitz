// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class RetroSunPlugin {
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
   */
  update(dt, isTriggered) {
    this.isActive = isTriggered;
    if (isTriggered) {
      this.offset += dt * 30;
      if (this.offset > 30) this.offset -= 30;
    }
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.65;
    const radius = Math.min(canvas.width * 0.4, 200);

    ctx.save();
    const grad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
    grad.addColorStop(0, '#ff00ff');
    grad.addColorStop(1, '#ffaa00');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    for (let i = 0; i < 7; i++) {
      const y = cy + (i * 30) - this.offset;
      if (y > cy - radius * 0.2) {
        const h = 4 + (i * 1.5);
        ctx.fillRect(cx - radius, y, radius * 2, h);
      }
    }
    ctx.restore();
  }
}
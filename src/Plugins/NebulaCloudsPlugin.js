// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class NebulaCloudsPlugin {
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
  update(dt, isTriggered) { this.isActive = isTriggered; if (isTriggered) this.time += dt * 0.2; }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} color 
     */
    const drawCloud = (x, y, color) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, canvas.width * 0.8);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    drawCloud(canvas.width/2 + Math.sin(this.time)*100, canvas.height/2 + Math.cos(this.time)*100, 'rgba(150, 0, 255, 0.1)');
    drawCloud(canvas.width/2 + Math.cos(this.time*1.2)*120, canvas.height/2 + Math.sin(this.time*1.2)*120, 'rgba(0, 100, 255, 0.1)');
    ctx.restore();
  }
}
// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Renders a low-hanging, thick, rolling fog at the bottom of the screen.
 * @implements {VFXPlugin}
 */
export class GraveyardMistPlugin {
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
    if (isTriggered) this.time += dt * 0.4; // Slow rolling mist
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    
    ctx.globalCompositeOperation = 'screen';

    // We stretch the context horizontally to make the radial gradients flat and wide (mist-like)
    ctx.scale(2.0, 1.0);
    
    const w = canvas.width / 2.0; // Adjust coordinates for the 2x scale
    const h = canvas.height;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {string} color 
     */
    const drawMistBlob = (x, y, radius, color) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    // Deep purple base fog (brightened & expanded)
    drawMistBlob(w * 0.5 + Math.sin(this.time) * w * 0.4, h, h * 0.6, 'rgba(150, 50, 255, 0.4)');
    // Sickly green toxic mist (brightened & expanded)
    drawMistBlob(w * 0.3 + Math.cos(this.time * 0.8) * w * 0.5, h - 20, h * 0.5, 'rgba(50, 255, 100, 0.25)');
    // Dark greyish-blue mist (brightened & expanded)
    drawMistBlob(w * 0.8 + Math.sin(this.time * 1.2) * w * 0.3, h + 10, h * 0.6, 'rgba(100, 150, 200, 0.3)');
    
    ctx.restore();
  }
}
// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Slow panning anamorphic lens flares on the edges of the screen.
 * @implements {VFXPlugin}
 */
export class CinematicLightLeaksPlugin {
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
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const x1 = Math.sin(this.time * 0.5) * canvas.width * 0.5 + canvas.width / 2;
    const y1 = canvas.height * 0.1;
    const gradient1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, 300);
    gradient1.addColorStop(0, 'rgba(255, 100, 0, 0.15)');
    gradient1.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x2 = Math.cos(this.time * 0.3) * canvas.width * 0.5 + canvas.width / 2;
    const y2 = canvas.height * 0.9;
    const gradient2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, 300);
    gradient2.addColorStop(0, 'rgba(255, 0, 255, 0.15)');
    gradient2.addColorStop(1, 'rgba(255, 0, 255, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
  }
}
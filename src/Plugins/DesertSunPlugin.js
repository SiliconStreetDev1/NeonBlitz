// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class DesertSunPlugin {
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
    
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.3; // High in the sky
    
    // Pulse the radius slightly to simulate intense radiating heat
    const pulse = Math.sin(this.time * 1.5) * 10;
    const radius = Math.min(canvas.width * 0.35, 180) + pulse;

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, 'rgba(255, 240, 200, 0.8)'); // Hot white-yellow core
    grad.addColorStop(0.3, 'rgba(255, 180, 40, 0.4)'); // Bright orange-yellow
    grad.addColorStop(1, 'rgba(255, 100, 0, 0)'); // Fades into the transparent haze

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
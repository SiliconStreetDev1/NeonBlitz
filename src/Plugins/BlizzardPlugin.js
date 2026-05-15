// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class BlizzardPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {Array<{x: number, y: number, vx: number, vy: number, length: number, alpha: number}>} */
    this.particles = []; 
    /** @type {boolean} */
    this.hasActive = false; 
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  /** @returns {void} */
  clear() { this.particles.length = 0; this.hasActive = false; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (isTriggered) {
      this.hasActive = true;
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: Math.random() * canvas.width * 1.5,
          y: -20,
          vx: -(Math.random() * 150 + 100),
          vy: Math.random() * 200 + 200,
          length: Math.random() * 15 + 5,
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    }
    let alive = false;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > canvas.height || p.x < 0) {
        const last = this.particles.pop();
        if (i < this.particles.length && last !== undefined) this.particles[i] = last;
      } else {
        alive = true;
      }
    }
    if (!isTriggered && !alive) this.hasActive = false;
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const p of this.particles) { ctx.globalAlpha = p.alpha; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
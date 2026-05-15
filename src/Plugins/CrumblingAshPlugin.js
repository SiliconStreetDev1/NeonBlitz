// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns dark grey and smoldering red flakes that drift downwards.
 * @implements {VFXPlugin}
 */
export class CrumblingAshPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, size: number, life: number, isEmber: boolean}>} */
    this.particles = [];
    /** @type {number} */
    this.spawnTimer = 0;
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.particles.length > 0; }
  
  /** @returns {void} */
  clear() { this.particles.length = 0; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (isTriggered) {
      this.spawnTimer += dt;
      if (this.spawnTimer > 0.1) {
        this.spawnTimer = 0;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: Math.random() * 20 - 10,
          vy: Math.random() * 30 + 20,
          size: Math.random() * 3 + 1,
          life: 1.0,
          isEmber: Math.random() > 0.8
        });
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += (p.vx + Math.sin(p.y * 0.05) * 10) * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.2;
      if (p.y > canvas.height || p.life <= 0) {
        const last = this.particles.pop();
        if (i < this.particles.length && last !== undefined) this.particles[i] = last;
      }
    }
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.isEmber ? `rgba(255, 50, 0, ${p.life})` : `rgba(100, 100, 100, ${p.life})`;
      ctx.fill();
    }
  }
}
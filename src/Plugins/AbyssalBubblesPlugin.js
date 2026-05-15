// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Cyan bubbles that wobble and accelerate upwards.
 * @implements {VFXPlugin}
 */
export class AbyssalBubblesPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    this.game = game;
    /** @type {Array<{x: number, y: number, vy: number, size: number, wobble: number, wobbleSpeed: number, life: number}>} */
    this.particles = [];
    /** @type {number} */
    this.spawnTimer = 0;
  }

  /**
   * @returns {boolean}
   */
  hasActiveParticles() { return this.particles.length > 0; }

  /**
   * @returns {void}
   */
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
      if (this.spawnTimer > 0.2) {
        this.spawnTimer = 0;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 20,
          vy: -(Math.random() * 30 + 20),
          size: Math.random() * 6 + 2,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 3 + 1,
          life: 1.0
        });
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.wobble += p.wobbleSpeed * dt;
      p.x += Math.sin(p.wobble) * 30 * dt;
      p.y += p.vy * dt;
      p.vy -= dt * 15; // accelerate upwards
      if (p.y < canvas.height / 2) p.life -= dt * 0.5;
      if (p.y < -20 || p.life <= 0) {
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
      ctx.strokeStyle = `rgba(0, 255, 255, ${p.life})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
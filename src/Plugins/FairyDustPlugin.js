// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns magical, glowing cyan orbs that slowly drift and fade in/out like fireflies.
 * Best paired with Acoustic or Fantasy tracks.
 * @implements {VFXPlugin}
 */
export class FairyDustPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, radius: number, life: number, maxLife: number, fadeState: number}>} */
    this.particles = [];
    /** @type {number} */
    this.spawnTimer = 0;
  }

  /** @returns {boolean} */
  hasActiveParticles() { return this.particles.length > 0; }

  /** @returns {void} */
  clear() {
    this.particles.length = 0;
  }

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
          y: Math.random() * canvas.height, // Spawn anywhere on screen
          vx: Math.random() * 30 - 15,
          vy: Math.random() * 30 - 15,
          radius: Math.random() * 2 + 1,
          life: 0.0, // Start invisible
          maxLife: Math.random() * 0.5 + 0.3,
          fadeState: 1 // 1 = fading in, -1 = fading out
        });
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      if (p.fadeState === 1) {
        p.life += dt * 0.5; // Fade in
        if (p.life >= p.maxLife) p.fadeState = -1; // Switch to fade out
      } else {
        p.life -= dt * 0.3; // Fade out slowly
      }
      
      if (p.life <= 0 && p.fadeState === -1) {
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
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(102, 252, 241, ${p.life})`; // Neon cyan
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#66fcf1';
      ctx.fill();
    }
    ctx.shadowBlur = 0; // Reset shadow for other plugins
  }
}
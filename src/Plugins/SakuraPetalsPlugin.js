// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns elegant pink sakura petals that sway and flutter as they fall.
 * Best paired with Classical or Piano tracks.
 * @implements {VFXPlugin}
 */
export class SakuraPetalsPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, size: number, angle: number, spin: number, wobble: number, wobbleSpeed: number, life: number}>} */
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
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered) {
      this.spawnTimer += dt;
      if (this.spawnTimer > 0.2) { // Spawn rate
        this.spawnTimer = 0;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: -20, // Start above screen
          vx: Math.random() * 30 - 15, // Initial wind drift
          vy: Math.random() * 40 + 30, // Fall speed
          size: Math.random() * 4 + 3,
          angle: Math.random() * Math.PI * 2,
          spin: Math.random() * 2 - 1, // Rotation speed
          wobble: Math.random() * Math.PI * 2, // Phase for the sine wave swaying
          wobbleSpeed: Math.random() * 2 + 1,
          life: 1.0
        });
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.wobble += p.wobbleSpeed * dt;
      p.x += (p.vx + Math.sin(p.wobble) * 20) * dt; // Sway left and right
      p.y += p.vy * dt;
      p.angle += p.spin * dt; // Rotate while falling
      
      if (p.y > canvas.height - 40) p.life -= dt * 1.5; // Fade out near bottom
      if (p.y > canvas.height + 20 || p.life <= 0) {
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
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size / 2.5, 0, 0, Math.PI * 2); // Oval petal shape
      ctx.fillStyle = `rgba(255, 183, 197, ${p.life})`; // Pastel pink
      ctx.fill();
      ctx.restore();
    }
  }
}
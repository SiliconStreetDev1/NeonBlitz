// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns fast-moving, glowing orange embers shooting upwards from the floor.
 * @implements {VFXPlugin}
 */
export class RisingEmbersPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, radius: number, life: number}>} */
    this.particles = [];
    /** @type {boolean} */
    this.hasActive = false;
    /** @type {number} */
    this.spawnTimer = 0;
  }

  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }

  /** @returns {void} */
  clear() {
    this.particles.length = 0;
    this.hasActive = false;
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered) {
      this.hasActive = true;
      this.spawnTimer += dt;
      if (this.spawnTimer > 0.05) { // Spawn extremely fast
        this.spawnTimer = 0;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 50, // Erratic horizontal spread
          vy: -(Math.random() * 150 + 100), // Shoot upwards quickly
          radius: Math.random() * 2.5 + 1.0,
          life: 1.0 // Start at full opacity
        });
      }
    }
    
    let alive = false;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.6; // Fade out as they fly up
      
      if (p.life <= 0 || p.y < -10) {
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
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, ${Math.floor(p.life * 150)}, 0, ${p.life})`; // Transitions from yellow to deep orange/red
      ctx.shadowBlur = 12 * p.life;
      ctx.shadowColor = '#ff3300';
      ctx.fill();
    }
    ctx.shadowBlur = 0; // Reset for other plugins
  }
}
// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns gentle, golden dust motes that float slowly upwards.
 * @implements {VFXPlugin}
 */
export class FloatingDustPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vy: number, radius: number, alpha: number, wobble: number, wobbleSpeed: number}>} */
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
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (isTriggered) {
      this.hasActive = true;
      this.spawnTimer += dt;
      if (this.spawnTimer > 0.15) { // Spawn relatively slowly
        this.spawnTimer = 0;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 20, // Spawn just below the screen
          vy: -(Math.random() * 15 + 10), // Float upwards slowly
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
          wobble: Math.random() * Math.PI * 2, // Random starting wave phase
          wobbleSpeed: Math.random() * 1.5 + 0.5
        });
      }
    }
    
    let alive = false;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.y += p.vy * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.x += Math.sin(p.wobble) * 0.3; // Gentle horizontal drifting
      
      if (p.y < -10) {
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
      ctx.fillStyle = `rgba(255, 235, 160, ${p.alpha})`; // Warm, glowing gold
      ctx.fill();
    }
  }
}
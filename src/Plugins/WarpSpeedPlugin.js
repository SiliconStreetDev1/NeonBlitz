// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns cyan and magenta stars radiating from the center to simulate hyperspace.
 * Best paired with fast, heavy synthwave tracks.
 * @implements {VFXPlugin}
 */
export class WarpSpeedPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, z: number, color: string}>} */
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
      if (this.spawnTimer > 0.015) { // High spawn rate for intense effect
        this.spawnTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 20; // Base outward speed
        this.particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          z: 0.1, // Depth/Acceleration multiplier
          color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff' // Cyan or Magenta
        });
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.z += dt * 3.0; // Rapidly accelerate outward
      p.x += p.vx * p.z * dt;
      p.y += p.vy * p.z * dt;
      
      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
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
      ctx.moveTo(p.x, p.y);
      // Draw a line backwards along the velocity vector to create a motion blur "streak"
      const tailLength = p.z * 0.08;
      ctx.lineTo(p.x - (p.vx * tailLength), p.y - (p.vy * tailLength));
      
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.min(5, p.z * 1.5);
      ctx.lineCap = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.stroke();
    }
    ctx.shadowBlur = 0; // Reset
  }
}
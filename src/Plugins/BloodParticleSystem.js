// @ts-check

/**
 * @typedef {Object} BloodParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vy Velocity Y
 * @property {number} radius
 * @property {number} alpha
 */

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Spawns and animates blood drip particles falling from active blocks.
 * @implements {VFXPlugin}
 */
export class BloodParticlePlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {BloodParticle[]} */
    this.particles = [];
    /** @type {number} */
    this.spawnTimer = 0;
  }

  /**
   * Informs the manager if this plugin has elements that need rendering.
   * @returns {boolean}
   */
  hasActiveParticles() {
    return this.particles.length > 0;
  }

  /**
   * Instantly clears all particles from the screen.
   */
  clear() {
    this.particles.length = 0;
  }

  /**
   * Applies physics and handles spawning logic.
   * @param {number} dt Delta time in seconds
   * @param {boolean} isTriggered True if the trigger conditions (like the song) are met
   * @param {HTMLCanvasElement} canvas The target canvas
   * @param {import('../types.js').EffectState} [effectState]
   */
  update(dt, isTriggered, canvas, effectState) {
    // Only spawn new drips if the song is playing
    if (isTriggered) {
      this.spawnTimer += dt;
      if (this.spawnTimer > Math.random() * 0.7 + 0.3) {
        this.spawnTimer = 0;
        this.spawnDrip(canvas);
      }
    }

    // Always update existing particles so they fall out of frame naturally when the song stops
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.vy * dt; // Apply gravity

      // Fade out near the bottom
      if (p.y > canvas.height - 50) {
        p.alpha -= dt * 2;
      }

      // Remove dead particles
      if (p.y > canvas.height + 10 || p.alpha <= 0) {
        const last = this.particles.pop();
        if (i < this.particles.length && last !== undefined) this.particles[i] = last;
      }
    }
  }

  /**
   * Locates an active block on the grid and spawns a droplet from its bottom edge.
   * @param {HTMLCanvasElement} canvas 
   */
  spawnDrip(canvas) {
    const activeBlocks = document.querySelectorAll('.block:not(.empty)');
    if (activeBlocks.length === 0) return;

    const block = activeBlocks[Math.floor(Math.random() * activeBlocks.length)];
    const blockRect = block.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();

    const x = (blockRect.left - containerRect.left) + (Math.random() * blockRect.width);
    const y = (blockRect.bottom - containerRect.top) - 5; 

    this.particles.push({
      x: x,
      y: y,
      vy: Math.random() * 20 + 30, 
      radius: Math.random() * 2 + 2,
      alpha: 1.0
    });
  }

  /**
   * Draws the particles to the canvas context.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    for (const p of this.particles) {
      ctx.beginPath();
      // Stretch droplets vertically as they fall
      ctx.ellipse(p.x, p.y, p.radius * 0.8, p.radius * 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 0, 0, ${p.alpha})`; // Deep blood red
      ctx.fill();
    }
  }
}
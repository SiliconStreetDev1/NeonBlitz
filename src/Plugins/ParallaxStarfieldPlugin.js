// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Draws a classic 8-bit scrolling space background.
 * @implements {VFXPlugin}
 */
export class ParallaxStarfieldPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, speed: number, size: number}>} */
    this.stars = [];
    /** @type {boolean} */
    this.initialized = false;
    /** @type {boolean} */
    this.hasActive = false;
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  /** @returns {void} */
  clear() { 
    this.stars.length = 0; 
    this.hasActive = false;
    this.initialized = false;
  }
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered && !this.initialized) {
      for(let i=0; i<100; i++) {
        this.stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 50 + 10,
          size: Math.random() * 2 + 0.5
        });
      }
      this.initialized = true;
      this.hasActive = true;
    }
    if (this.hasActive) {
      let alive = false;
      for (let star of this.stars) {
        star.y += star.speed * dt;
        if (isTriggered && star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        if (star.y <= canvas.height) alive = true;
      }
      if (!isTriggered && !alive) this.clear();
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.fillStyle = '#fff';
    for (const star of this.stars) {
      ctx.globalAlpha = star.size / 2.5;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1.0;
  }
}
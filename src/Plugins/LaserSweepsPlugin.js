// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class LaserSweepsPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {Array<{y: number, angle: number, color: string, life: number, speed: number}>} */
    this.lasers = []; 
    /** @type {boolean} */
    this.hasActive = false; 
    /** @type {number} */
    this.timer = 0; 
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  /** @returns {void} */
  clear() { this.lasers.length = 0; this.hasActive = false; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered) {
      this.hasActive = true;
      this.timer += dt;
      if (this.timer > 0.5) {
        this.timer = 0;
        if (Math.random() > 0.5) {
          this.lasers.push({
            y: Math.random() * canvas.height,
            angle: (Math.random() - 0.5) * 0.5,
            color: ['#ff00ff', '#00ffff', '#33ff33'][Math.floor(Math.random() * 3)],
            life: 1.0, speed: Math.random() * 2 + 1
          });
        }
      }
    }
    let alive = false;
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      let l = this.lasers[i];
      l.y += Math.sin(l.angle) * 100 * dt; l.life -= dt * l.speed;
      if (l.life <= 0) {
        const last = this.lasers.pop();
        if (i < this.lasers.length && last !== undefined) this.lasers[i] = last;
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
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const l of this.lasers) {
      ctx.beginPath(); ctx.moveTo(0, l.y); ctx.lineTo(canvas.width, l.y + Math.tan(l.angle) * canvas.width);
      ctx.strokeStyle = l.color; ctx.lineWidth = 15 * l.life; ctx.globalAlpha = l.life; ctx.stroke();
      ctx.lineWidth = 5 * l.life; ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    ctx.restore();
  }
}
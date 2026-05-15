// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class ConstellationsPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {Array<{x: number, y: number, vx: number, vy: number}>} */
    this.stars = []; 
    /** @type {Array<{s1: {x: number, y: number, vx: number, vy: number}, s2: {x: number, y: number, vx: number, vy: number}, life: number}>} */
    this.lines = []; 
    /** @type {boolean} */
    this.hasActive = false; 
    /** @type {boolean} */
    this.initialized = false; 
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  
  /** @returns {void} */
  clear() { this.stars.length = 0; this.lines.length = 0; this.hasActive = false; this.initialized = false; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (isTriggered && !this.initialized) {
      for(let i=0; i<40; i++) this.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 });
      this.initialized = true; this.hasActive = true;
    }
    if (this.hasActive) {
      for (let s of this.stars) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
        if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
      }
      if (isTriggered && Math.random() > 0.95) {
        const s1 = this.stars[Math.floor(Math.random() * this.stars.length)];
        const s2 = this.stars[Math.floor(Math.random() * this.stars.length)];
        if (Math.hypot(s1.x - s2.x, s1.y - s2.y) < 150) this.lines.push({ s1, s2, life: 1.0 });
      }
      for (let i = this.lines.length - 1; i >= 0; i--) {
        this.lines[i].life -= dt * 0.5;
        if (this.lines[i].life <= 0) {
          const last = this.lines.pop();
          if (i < this.lines.length && last !== undefined) this.lines[i] = last;
        }
      }
      if (!isTriggered) this.clear();
    }
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.fillStyle = '#fff';
    for (const s of this.stars) { ctx.beginPath(); ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.lineWidth = 1;
    for (const l of this.lines) {
      ctx.strokeStyle = `rgba(100, 200, 255, ${l.life})`;
      ctx.beginPath(); ctx.moveTo(l.s1.x, l.s1.y); ctx.lineTo(l.s2.x, l.s2.y); ctx.stroke();
    }
  }
}
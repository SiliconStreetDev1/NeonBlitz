// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @implements {VFXPlugin}
 */
export class BlowingSandPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {Array<{x: number, y: number, vx: number, vy: number, length: number, size: number, alpha: number, isDust: boolean, wobbleSpeed: number, wobbleOffset: number}>} */
    this.particles = []; 
    /** @type {boolean} */
    this.hasActive = false; 
    /** @type {number} */
    this.time = 0;
    /** @type {number} */
    this.gustTimer = 0;
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  /** @returns {void} */
  clear() { this.particles.length = 0; this.hasActive = false; }
  
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {number} yPos 
   */
  createParticle(canvas, yPos) {
    const isDust = Math.random() > 0.6; // 40% chance to be a soft dust cloud
    return {
      x: canvas.width + Math.random() * 100 + 50,
      y: yPos,
      vx: -(Math.random() * 150 + 100),
      vy: (Math.random() - 0.5) * 20, // Slight vertical drift
      length: Math.random() * 40 + 10,
      size: Math.random() * 10 + 5, // Smaller, tighter dust clouds
      alpha: Math.random() * 0.25 + 0.05,
      isDust: isDust,
      wobbleSpeed: Math.random() * 3 + 1,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    this.time += dt;
    if (isTriggered) {
      this.hasActive = true;
      this.gustTimer -= dt;

      // Gather active blocks to ensure sand only spawns where there is structure
      let activeBlocks = [];
      if (this.game?.ui?.gridContainer) {
        const children = this.game.ui.gridContainer.children;
        for (let i = 0; i < children.length; i++) {
          if (/** @type {HTMLElement} */ (children[i]).dataset.colorClass !== 'empty') {
            activeBlocks.push(/** @type {HTMLElement} */ (children[i]));
          }
        }
      }

      if (activeBlocks.length > 0) {
        // Occasional heavy gusts/puffs
        if (this.gustTimer <= 0) {
          this.gustTimer = Math.random() * 3 + 1.5; // Next gust in 1.5 to 4.5 seconds
          const randomBlock = activeBlocks[Math.floor(Math.random() * activeBlocks.length)];
          const puffY = randomBlock.offsetTop + (randomBlock.offsetHeight / 2);
          const puffCount = Math.floor(Math.random() * 10) + 8; // Burst of 8 to 17 particles

          for (let i = 0; i < puffCount; i++) {
            this.particles.push(this.createParticle(canvas, puffY + (Math.random() * 80 - 40)));
          }
        }

        // Ambient light sand
        if (Math.random() > 0.5) {
          const randomBlock = activeBlocks[Math.floor(Math.random() * activeBlocks.length)];
          const ambientY = randomBlock.offsetTop + (randomBlock.offsetHeight / 2);
          this.particles.push(this.createParticle(canvas, ambientY + (Math.random() * 40 - 20)));
        }
      }
    }

    let alive = false;
    // The global wind speed fluctuates using a sine wave
    const globalWind = Math.sin(this.time * 1.5) * 50;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += (p.vx + globalWind) * dt;
      p.y += (p.vy + Math.sin(this.time * p.wobbleSpeed + p.wobbleOffset) * 15) * dt; // Turbulence

      if (p.x < -150) {
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
    ctx.lineCap = 'round';
    ctx.fillStyle = '#e6c280';
    ctx.strokeStyle = '#e6c280';
    for (const p of this.particles) { 
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      if (p.isDust) { ctx.ellipse(p.x, p.y, p.size * 2, p.size, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.lineWidth = 1.5; ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.length, p.y); ctx.stroke(); }
    }
    ctx.globalAlpha = 1.0;
  }
}
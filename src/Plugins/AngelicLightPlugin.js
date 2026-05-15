// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @fileoverview Angelic Light VFX Plugin.
 * Renders divine "God Rays" shining from above, slowly ascending golden sparks (like souls or feathers),
 * and gently expanding halos to create a serene, heavenly atmosphere.
 * @implements {VFXPlugin}
 */
export class AngelicLightPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, size: number, alpha: number, wobbleSpeed: number, wobbleOffset: number}>} */
    this.sparks = [];
    /** @type {Array<{x: number, width: number, angle: number, phase: number, speed: number, maxAlpha: number}>} */
    this.rays = [];
    /** @type {Array<{x: number, y: number, radius: number, life: number, expandSpeed: number}>} */
    this.halos = [];
    /** @type {boolean} */
    this.hasActive = false;
    /** @type {number} */
    this.time = 0;
    /** @type {boolean} */
    this.initialized = false;
    /** @type {number} */
    this.haloTimer = 0;
  }

  /** @returns {boolean} */
  hasActiveParticles() { 
    return this.hasActive; 
  }
  
  /** @returns {void} */
  clear() { 
    this.sparks.length = 0;
    this.rays.length = 0;
    this.halos.length = 0;
    this.hasActive = false; 
    this.initialized = false; 
  }

  /**
   * Initializes the static God Rays and prepares the scene.
   * @param {HTMLCanvasElement} canvas 
   * @returns {void}
   */
  init(canvas) {
    this.initialized = true;
    
    // Create 5 to 7 majestic light beams shining down
    const numRays = Math.floor(Math.random() * 3) + 5;
    const spacing = canvas.width / numRays;
    
    for(let i = 0; i < numRays; i++) {
      this.rays.push({
        x: spacing * i + (Math.random() * spacing * 0.5),
        width: Math.random() * 80 + 60,
        angle: (Math.random() - 0.5) * 0.2, // Slight tilt
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        maxAlpha: Math.random() * 0.15 + 0.1
      });
    }
  }

  /**
   * @param {HTMLCanvasElement} canvas 
   * @returns {void}
   */
  spawnSpark(canvas) {
    this.sparks.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 10,
      vy: -(Math.random() * 25 + 15), // Slow ascent
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.5 + 0.5,
      wobbleSpeed: Math.random() * 2 + 1,
      wobbleOffset: Math.random() * Math.PI * 2
    });
  }

  /**
   * @param {HTMLCanvasElement} canvas 
   * @returns {void}
   */
  spawnHalo(canvas) {
    this.halos.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.7), // Favor upper portion
      radius: 10,
      life: 1.0,
      expandSpeed: Math.random() * 20 + 10
    });
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (!isTriggered && this.sparks.length === 0 && this.halos.length === 0) {
      this.hasActive = false;
      return;
    }

    this.hasActive = true;
    this.time += dt;

    if (isTriggered && !this.initialized) {
      this.init(canvas);
    }

    if (isTriggered) {
      // Ambient ascending sparks
      if (Math.random() > 0.6) {
        this.spawnSpark(canvas);
      }

      // Occasional expanding halos
      this.haloTimer -= dt;
      if (this.haloTimer <= 0) {
        this.spawnHalo(canvas);
        this.haloTimer = Math.random() * 4 + 3; // Every 3-7 seconds
      }
    }

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.x += (p.vx + Math.sin(this.time * p.wobbleSpeed + p.wobbleOffset) * 20) * dt; // Gentle swaying
      p.y += p.vy * dt;
      if (p.y < -50) {
        const last = this.sparks.pop();
        if (i < this.sparks.length && last !== undefined) this.sparks[i] = last;
      }
    }

    // Update Halos
    for (let i = this.halos.length - 1; i >= 0; i--) {
      const h = this.halos[i];
      h.radius += h.expandSpeed * dt;
      h.life -= dt * 0.3; // Slow fade
      if (h.life <= 0) {
        const last = this.halos.pop();
        if (i < this.halos.length && last !== undefined) this.halos[i] = last;
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (!this.hasActive) return;
    
    // 1. Render God Rays (Background)
    ctx.globalCompositeOperation = 'screen';
    for (const ray of this.rays) {
      const currentAlpha = Math.max(0, Math.sin(this.time * ray.speed + ray.phase)) * ray.maxAlpha;
      if (currentAlpha <= 0.01) continue;

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, `rgba(255, 255, 230, ${currentAlpha})`); // Warm golden-white top
      grad.addColorStop(1, `rgba(255, 255, 230, 0)`); // Fades out at the bottom

      ctx.save();
      ctx.translate(ray.x, 0);
      ctx.rotate(ray.angle);
      ctx.fillStyle = grad;
      // Draw wide, soft pillar
      ctx.fillRect(-ray.width / 2, 0, ray.width, canvas.height * 1.2);
      ctx.restore();
    }

    // 2. Render Halos (Midground)
    ctx.lineWidth = 2;
    for (const h of this.halos) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 240, 180, ${h.life * 0.4})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fff0b4';
      ctx.stroke();
    }

    // 3. Render Sparks/Feathers (Foreground)
    for (const p of this.sparks) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      // Spark fades in at bottom and out at top
      const fade = Math.min(1, Math.min(p.y / 100, (canvas.height - p.y) / 100)); 
      ctx.fillStyle = `rgba(255, 250, 220, ${p.alpha * fade})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over'; // Reset
    ctx.shadowBlur = 0;
  }
}
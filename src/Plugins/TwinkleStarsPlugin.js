// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * @fileoverview Twinkle Little Star VFX Plugin.
 * Renders a parallax starfield with sine-wave luminescence (twinkling),
 * four-point hero glints, and interactive shooting stars triggered by player combos.
 * @implements {VFXPlugin}
 */
export class TwinkleStarsPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, baseAlpha: number, phase: number, speed: number, isHero: boolean, layer: number, size: number}>} */
    this.stars = [];
    /** @type {Array<{x: number, y: number, vx: number, vy: number, life: number, isCombo: boolean}>} */
    this.shootingStars = [];
    /** @type {boolean} */
    this.hasActive = false;
    /** @type {number} */
    this.time = 0;
    /** @type {boolean} */
    this.initialized = false;
    /** @type {number} */
    this.shootingStarTimer = 0;
    /** @type {number} */
    this.lastCombo = 1;
  }

  /** @returns {boolean} */
  hasActiveParticles() { 
    return this.hasActive; 
  }
  
  /** @returns {void} */
  clear() { 
    this.stars.length = 0; 
    this.shootingStars.length = 0; 
    this.hasActive = false; 
    this.initialized = false; 
  }

  /**
   * Procedurally generates the starfield based on the canvas size.
   * @param {HTMLCanvasElement} canvas 
   */
  init(canvas) {
    this.initialized = true;
    const numStars = Math.floor((canvas.width * canvas.height) / 8000); // Responsive density
    
    for(let i = 0; i < numStars; i++) {
      const isHero = Math.random() > 0.85; // 15% chance to be a glowing 4-point star
      const layer = Math.random() > 0.6 ? 1 : 0; // 40% foreground, 60% background
      
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseAlpha: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 0.5,
        isHero: isHero,
        layer: layer,
        size: isHero ? (Math.random() * 1.5 + 1.5) : (Math.random() * 1 + 0.5)
      });
    }
  }

  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {boolean} [isCombo=false] 
   */
  spawnShootingStar(canvas, isCombo = false) {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * (canvas.height / 2); // Always spawn in upper half
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: (Math.random() * 200 + 400) * direction, // Fast horizontal sweep
      vy: Math.random() * 100 + 200,               // Downward arc
      life: 1.0,
      isCombo: isCombo
    });
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    if (!isTriggered && this.stars.length === 0 && this.shootingStars.length === 0) {
      this.hasActive = false;
      return;
    }

    this.hasActive = true;
    this.time += dt;

    if (isTriggered && !this.initialized) {
      this.init(canvas);
    }

    if (isTriggered) {
      // 1. Ambient random shooting stars
      this.shootingStarTimer -= dt;
      if (this.shootingStarTimer <= 0) {
        this.spawnShootingStar(canvas);
        this.shootingStarTimer = Math.random() * 5 + 5; // Every 5-10 seconds
      }

      // 2. Interactive "Juice": Spawn golden shooting stars when the player scores combos!
      if (this.game && this.game.combo > this.lastCombo && this.game.combo >= 3) {
        this.spawnShootingStar(canvas, true);
      }
      this.lastCombo = this.game ? this.game.combo : 1;
    }

    // Update foreground stars (Subtle Parallax Drift)
    for (const star of this.stars) {
      if (star.layer === 1) {
        star.x -= 5 * dt;
        if (star.x < 0) star.x = canvas.width;
      }
    }

    // Update shooting stars physics
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.life -= dt * 0.8;
      if (ss.life <= 0 || ss.y > canvas.height || ss.x < 0 || ss.x > canvas.width) {
        const last = this.shootingStars.pop();
        if (i < this.shootingStars.length && last !== undefined) this.shootingStars[i] = last;
      }
    }

    if (!isTriggered && this.shootingStars.length === 0) {
      this.clear(); // Instantly wipe background stars when the track ends
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (!this.hasActive) return;
    ctx.lineCap = 'round';
    
    // 1. Render Ambient Starfield
    for (const star of this.stars) {
      // Procedural sine-wave luminescence
      const twinkle = Math.sin(this.time * star.speed + star.phase);
      const alpha = Math.max(0.1, star.baseAlpha + twinkle * 0.3);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      if (star.isHero) {
        // Render glowing 4-point glint
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff'; // Cyan glow
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 3, star.y);
        ctx.lineTo(star.x + star.size * 3, star.y);
        ctx.moveTo(star.x, star.y - star.size * 3);
        ctx.lineTo(star.x, star.y + star.size * 3);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Render standard distant dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Render Shooting Stars
    for (const ss of this.shootingStars) {
      const tailLength = 60;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      
      // Calculate trail vector based on velocity
      const normX = ss.vx / Math.hypot(ss.vx, ss.vy);
      const normY = ss.vy / Math.hypot(ss.vx, ss.vy);
      ctx.lineTo(ss.x - normX * tailLength, ss.y - normY * tailLength);
      
      // Gradient tail fade
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - normX * tailLength, ss.y - normY * tailLength);
      const color = ss.isCombo ? '255, 204, 0' : '102, 252, 241'; // Gold for combos, Cyan for ambient
      grad.addColorStop(0, `rgba(${color}, ${ss.life})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = ss.isCombo ? 3 : 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ss.isCombo ? '#ffcc00' : '#66fcf1';
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Render bright head of the shooting star
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, ss.isCombo ? 2 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
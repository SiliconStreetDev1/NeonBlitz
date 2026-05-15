// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Extremely aggressive, split-second bursts of heavy television static, 
 * chromatic aberration, and inverted colors.
 * @implements {VFXPlugin}
 */
export class SubliminalGlitchPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {boolean} */
    this.isActive = false;
    /** @type {number} */
    this.glitchTimer = 0;
    /** @type {number} */
    this.glitchDuration = 0;
    /** @type {number} */
    this.nextGlitchIn = Math.random() * 5 + 2; // Random time until next glitch
  }

  /** @returns {boolean} */
  hasActiveParticles() { return this.isActive; }
  
  /** @returns {void} */
  clear() { 
    this.isActive = false; 
    this.glitchDuration = 0;
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    if (isTriggered) {
      this.nextGlitchIn -= dt;
      if (this.nextGlitchIn <= 0) {
        this.isActive = true;
        this.glitchDuration = Math.random() * 0.1 + 0.05; // 50ms - 150ms duration
        this.nextGlitchIn = Math.random() * 8 + 3; // 3s - 11s between glitches
      }

      if (this.isActive) {
        this.glitchDuration -= dt;
        if (this.glitchDuration <= 0) {
          this.isActive = false;
        }
      }
    } else {
      this.isActive = false;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (!this.isActive) return;

    ctx.save();
    
    // 1. Harsh color overlay (simulating color inversion/corruption)
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Chromatic Aberration / Screen Tearing
    ctx.globalCompositeOperation = 'screen';
    const shiftX = (Math.random() - 0.5) * 60;
    const shiftY = (Math.random() - 0.5) * 30;
    ctx.drawImage(canvas, shiftX, shiftY);
    
    // 3. Heavy Static/Noise bands
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.3})`;
    for (let i = 0; i < 20; i++) {
      const h = Math.random() * 15 + 2;
      const y = Math.random() * canvas.height;
      ctx.fillRect(0, y, canvas.width, h);
    }
    
    // 4. Black out chunks
    ctx.fillStyle = '#000';
    for (let i = 0; i < 8; i++) {
      const h = Math.random() * 60 + 10;
      const y = Math.random() * canvas.height;
      ctx.fillRect(0, y, canvas.width, h);
    }

    ctx.restore();
  }
}
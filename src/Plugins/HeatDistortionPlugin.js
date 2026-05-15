// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Creates a "melting" heat haze by offsetting the canvas over itself and adding a fiery glow.
 * @implements {VFXPlugin}
 */
export class HeatDistortionPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) { 
    /** @type {import('../engine.js').GameEngine} */
    this.game = game; 
    /** @type {number} */
    this.time = 0; 
    /** @type {boolean} */
    this.isActive = false; 
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.isActive; }
  
  /** @returns {void} */
  clear() { this.isActive = false; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) { 
    this.isActive = isTriggered; 
    if (isTriggered) this.time += dt; 
  }
  
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    if (!this.isActive) return;
    ctx.save();
    
    // Smear the canvas slightly on a sine wave to simulate wavy heat distortion
    const wobbleX = Math.sin(this.time * 8) * 2;
    const wobbleY = Math.cos(this.time * 6) * 3;
    
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(canvas, wobbleX, wobbleY);
    
    // Add a rising fiery gradient from the bottom half of the screen
    const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.4);
    grad.addColorStop(0, 'rgba(255, 50, 0, 0.4)');
    grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
    
    ctx.restore();
  }
}
// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Fakes an audio-reactive EQ bar at the bottom of the screen.
 * @implements {VFXPlugin}
 */
export class AudioEqualizerPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {number[]} */
    this.bars = Array(8).fill(0);
    /** @type {boolean} */
    this.isActive = false;
  }
  /** @returns {boolean} */
  hasActiveParticles() { return this.isActive; }
  /** @returns {void} */
  clear() { this.isActive = false; this.bars.fill(0); }
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState) {
    this.isActive = isTriggered || this.bars.some(b => b > 0.01);
    if (this.isActive) {
      for (let i = 0; i < this.bars.length; i++) {
        if (isTriggered && Math.random() > 0.8) {
          this.bars[i] = Math.max(this.bars[i], Math.random() * 0.8 + 0.2);
        }
        this.bars[i] -= dt * 1.5;
        if (this.bars[i] < 0) this.bars[i] = 0;
      }
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    const barWidth = canvas.width / 10;
    const gap = (canvas.width - barWidth * 8) / 9;
    for (let i = 0; i < 8; i++) {
      const h = this.bars[i] * 150;
      const x = gap + i * (barWidth + gap);
      const y = canvas.height - h;
      ctx.fillStyle = `rgba(0, 255, 255, 0.5)`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.fillRect(x, y, barWidth, h);
    }
    ctx.shadowBlur = 0;
  }
}
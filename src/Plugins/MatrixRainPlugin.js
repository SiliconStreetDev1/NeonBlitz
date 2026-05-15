// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Renders falling "Matrix" digital rain for Cyberpunk tracks.
 * @implements {VFXPlugin}
 */
export class MatrixRainPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, speed: number}>} */
    this.columns = [];
    /** @type {number} */
    this.fontSize = 20;
    /** @type {boolean} */
    this.initialized = false;
    /** @type {boolean} */
    this.hasActive = false;
  }

  /** @returns {boolean} */
  hasActiveParticles() {
    return this.hasActive;
  }

  /** @returns {void} */
  clear() {
    this.columns.length = 0;
    this.hasActive = false;
    this.initialized = false;
  }

  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   */
  update(dt, isTriggered, canvas) {
    // Initialize the columns only when the effect is first triggered
    if (isTriggered && !this.initialized) {
      const colCount = Math.floor(canvas.width / this.fontSize);
      this.columns = [];
      for (let i = 0; i < colCount; i++) {
        this.columns[i] = {
          x: i * this.fontSize,
          y: Math.random() * -canvas.height * 2, // Stagger the starting heights
          speed: Math.random() * 200 + 150, // Fall speed between 150 and 350
        };
      }
      this.initialized = true;
      this.hasActive = true;
    }

    if (this.hasActive) {
      let allDead = true;
      for (let col of this.columns) {
        col.y += col.speed * dt;
        
        if (isTriggered) {
          allDead = false;
          // Wrap around to the top when the full trail falls off screen
          if (col.y - (15 * this.fontSize) > canvas.height) {
            col.y = Math.random() * -100;
          }
        } else {
          // If the song stopped, let the trails gracefully fall completely off screen
          if (col.y - (15 * this.fontSize) <= canvas.height) {
            allDead = false;
          }
        }
      }
      
      if (!isTriggered && allDead) {
        this.hasActive = false;
        this.initialized = false;
        this.columns.length = 0; // Free memory immediately
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.font = `bold ${this.fontSize}px monospace`;
    ctx.textAlign = 'center';
    
    for (let col of this.columns) {
      for (let i = 0; i < 15; i++) {
        const yPos = col.y - (i * this.fontSize);
        if (yPos > 0 && yPos - this.fontSize < canvas.height) {
          const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)); // Katakana
          ctx.fillStyle = i === 0 ? '#ffffff' : `rgba(0, 255, 65, ${1 - (i / 15)})`; // White tip, green tail
          ctx.fillText(char, col.x + this.fontSize / 2, yPos);
        }
      }
    }
  }
}
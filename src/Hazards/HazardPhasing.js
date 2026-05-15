// @ts-check

/**
 * @fileoverview Phasing / Quantum Blocks Hazard.
 * Causes specific target blocks to fade in and out of reality, requiring timing to connect.
 */
export class HazardPhasing {
  /**
   * @param {import('../engine.js').GameEngine} engine
   */
  constructor(engine) {
    /** @type {import('../engine.js').GameEngine} */
    this.engine = engine;
    /** @type {number} */
    this.time = 0;
    /** @type {boolean} */
    this.isActive = false;
  }

  /**
   * @returns {void}
   */
  reset() {
    this.time = 0;
    this.isActive = false;
  }

  /**
   * @param {() => number} rng 
   * @param {import('./HazardManager.js').HazardManager} manager 
   */
  init(rng, manager) {
    this.reset();
    if (this.engine.level >= this.engine.progression.hazards.phasing.unlockLevel) {
      this.isActive = true;
      this.engine.grid.assignPhasingOffsets(rng, this.engine.level, this.engine.progression);
    }
  }

  /**
   * @param {number} dt 
   * @param {number} timestamp 
   */
  update(dt, timestamp) {
    if (!this.isActive) return;
    this.time += dt;

    const blocks = this.engine.grid.getPhasingBlocks();
    const opacities = [];
    for (const b of blocks) {
       // 2000ms cycle for a full fade in and out
       const phase = (this.time / 2000) * Math.PI * 2 + b.offset;
       const opacity = 0.5 + Math.sin(phase) * 0.5; // Sine wave from 0.0 to 1.0
       opacities.push({ index: b.index, opacity: Math.max(0.1, opacity) });
    }
    this.engine.grid.applyOpacities(opacities);
  }

  /**
   * @param {number} timestamp 
   */
  draw(timestamp) {
    if (!this.isActive) return;
    const ui = this.engine.ui;
    const blocks = this.engine.grid.getPhasingBlocks();
    for (const b of blocks) {
       const phase = (this.time / 2000) * Math.PI * 2 + b.offset;
       const opacity = 0.5 + Math.sin(phase) * 0.5;
       if (opacity < 0.4) {
         const center = this.engine.grid.getBlockCenter(b.index);
         if (center) {
            // Draw a jittering quantum box where the block is supposed to be
            ui.ctx.strokeStyle = `rgba(102, 252, 241, ${0.6 - opacity})`; // Cyan glitch
            ui.ctx.lineWidth = 1;
            const jitterX = Math.sin(timestamp * 0.05 + b.index * 12.3) * 4;
            const jitterY = Math.cos(timestamp * 0.04 + b.index * 7.8) * 4;
            ui.ctx.strokeRect(center.x - 20 + jitterX, center.y - 20 + jitterY, 40, 40);
         }
       }
    }
  }

  /**
   * @param {number} index 
   * @returns {boolean}
   */
  isPhasedOut(index) {
    if (!this.isActive) return false;
    const data = this.engine.grid.getBlockData(index);
    if (!data || data.phaseOffset === null) return false;
    const phase = (this.time / 2000) * Math.PI * 2 + data.phaseOffset;
    const opacity = 0.5 + Math.sin(phase) * 0.5;
    return opacity < 0.4; // The threshold where it becomes "too transparent to touch"
  }
}
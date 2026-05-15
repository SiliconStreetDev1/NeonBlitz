// @ts-check

/**
 * @fileoverview Encrypted Nodes (Speed Bump) Hazard.
 * Places digital locks on specific target blocks that require the player to hold
 * their trace over them for 0.5 seconds to "decrypt" them before proceeding.
 */
export class HazardEncryptedNodes {
  /**
   * @param {import('../engine.js').GameEngine} engine 
   */
  constructor(engine) {
    /** @type {import('../engine.js').GameEngine} */
    this.engine = engine;
    /** @type {boolean} */
    this.isActive = false;
    /** @type {number} */
    this.decryptTimer = 0;
    /** @type {number} */
    this.requiredTime = 500;
  }

  /**
   * @returns {void}
   */
  reset() {
    this.isActive = false;
    this.decryptTimer = 0;
  }

  /**
   * @param {() => number} rng 
   * @param {import('./HazardManager.js').HazardManager} manager 
   */
  init(rng, manager) {
    this.reset();
    const config = this.engine.progression.hazards.encryptedNodes;
    if (this.engine.level >= config.unlockLevel) {
      // Ensure no conflicting hazards have already activated on this level
      if (manager.hasExclusiveConflict('encryptedNodes')) return; 

      this.isActive = true;
      this.engine.grid.assignEncryptedNodes(rng, this.engine.level, this.engine.progression);
    }
  }

  /**
   * @param {number} dt 
   * @param {number} timestamp 
   */
  update(dt, timestamp) {
    if (!this.isActive) return;

    if (this.engine.isDragging && this.engine.selectedBlocks.length > 0) {
      const tipIndex = this.engine.selectedBlocks[this.engine.selectedBlocks.length - 1];
      if (this.engine.grid.isBlockEncrypted(tipIndex)) {
        this.decryptTimer += dt;
        if (this.decryptTimer >= this.requiredTime) {
          this.engine.grid.setBlockDecrypted(tipIndex);
          this.decryptTimer = 0;
          const center = this.engine.grid.getBlockCenter(tipIndex);
          if (center) this.engine.particles.spawn(center.x, center.y, '#ffffff', 10, 8);
          this.engine.audio?.playSelect?.(); // Tactile "click" sound
          if (navigator.vibrate) navigator.vibrate(this.engine.config.tuning.VIBRATION.SELECT);
        }
      } else {
        this.decryptTimer = 0;
      }
    } else {
      this.decryptTimer = 0;
    }
  }

  /**
   * @param {number} timestamp 
   */
  draw(timestamp) {
    if (!this.isActive) return;
    const ui = this.engine.ui;
    const encryptedIndices = this.engine.grid.getEncryptedBlocks();
    
    for (let idx of encryptedIndices) {
      const c = this.engine.grid.getBlockCenter(idx);
      if (!c) continue;
      
      // Draw the digital lock icon
      ui.ctx.strokeStyle = '#fff';
      ui.ctx.lineWidth = 3;
      ui.ctx.shadowBlur = 10;
      ui.ctx.shadowColor = '#fff';
      
      // Lock Body
      ui.ctx.strokeRect(c.x - 12, c.y - 4, 24, 18);
      // Lock Shackle
      ui.ctx.beginPath();
      ui.ctx.arc(c.x, c.y - 4, 8, Math.PI, 0);
      ui.ctx.stroke();
      
      // If the player is currently resting on this specific node, draw the progress ring
      if (this.engine.isDragging && this.engine.selectedBlocks.length > 0) {
        const tipIndex = this.engine.selectedBlocks[this.engine.selectedBlocks.length - 1];
        if (tipIndex === idx && this.decryptTimer > 0) {
          const progress = Math.min(1, this.decryptTimer / this.requiredTime);
          ui.ctx.beginPath();
          ui.ctx.arc(c.x, c.y, 35, -Math.PI / 2, -Math.PI / 2 + (progress * Math.PI * 2));
          ui.ctx.strokeStyle = '#00ff00';
          ui.ctx.shadowColor = '#00ff00';
          ui.ctx.lineWidth = 4;
          ui.ctx.stroke();
        }
      }
    }
    ui.ctx.shadowBlur = 0;
  }
}
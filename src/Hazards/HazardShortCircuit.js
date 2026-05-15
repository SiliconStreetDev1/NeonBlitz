// @ts-check

/**
 * @fileoverview Short Circuit (Overload) Hazard.
 * Rapidly decays the player's swipe line if they trace too slowly.
 */
export class HazardShortCircuit {
  /**
   * @param {import('../engine.js').GameEngine} engine
   */
  constructor(engine) {
    /** @type {import('../engine.js').GameEngine} */
    this.engine = engine;
    /** @type {number} */
    this.timer = 0;
  }

  /**
   * Resets the hazard state.
   */
  reset() {
    this.timer = 0;
    this.engine.grid.setWarningShake(this.engine.selectedBlocks, false);
  }

  /**
   * Updates the overload timer and handles line destruction.
   * @param {number} dt - Delta time since last frame.
   */
  update(dt) {
    const config = this.engine.progression.hazards.shortCircuit;
    if (this.engine.level >= config.unlockLevel && this.engine.isDragging && this.engine.selectedBlocks.length > 0) {
      this.timer += dt;
      
      const currentTarget = this.engine.targetQueue[this.engine.currentTargetIndex];
      const targetSize = currentTarget ? currentTarget.size : 0;
      
      // Intensity Ramp-Up (Levels 50-60)
      // Drops the timers smoothly by up to 500ms for the final stretch
      let intensityDrop = 0;
      if (this.engine.level >= 50) {
        const scale = Math.min(10, this.engine.level - 50); // Scales 0 to 10
        intensityDrop = 50 + (scale * 45); // Maxes out at exactly 500ms at Level 60
      }
      
      const warningTime = 2000 + (targetSize * 100) - intensityDrop;
      const destructTime = 3000 + (targetSize * 100) - intensityDrop;
      
      if (this.timer > warningTime) {
        this.engine.grid.setWarningShake(this.engine.selectedBlocks, true);
      } else {
        this.engine.grid.setWarningShake(this.engine.selectedBlocks, false);
      }
      
      if (this.timer > destructTime) {
        this.timer = 0;
        this.engine.dispatch('SET_DRAGGING', false);
        this.engine.grid.setWarningShake(this.engine.selectedBlocks, false);
        this.engine.inputHandler.resetSelection(); // Destroys the whole line!
      }
    } else {
      this.reset();
    }
  }
}
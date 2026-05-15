// @ts-check

/**
 * @fileoverview Memory Leak (Blackout) Hazard.
 * Instantly obscures the colors of all blocks on the grid the moment the player
 * touches the screen, forcing them to memorize their routing path beforehand.
 */
export class HazardMemoryLeak {
  /**
   * @param {import('../engine.js').GameEngine} engine 
   */
  constructor(engine) {
    /** @type {import('../engine.js').GameEngine} */
    this.engine = engine;
    /** @type {boolean} */
    this.isActive = false;
    /** @type {boolean} */
    this.isLeaking = false;
  }

  /**
   * Resets the hazard state and clears any visual blackout on the grid.
   */
  reset() {
    this.isActive = false;
    this.isLeaking = false;
    this.engine.grid.setMemoryLeakState(false);
  }

  /**
   * Initializes the hazard, adhering to JSON progression constraints.
   * @param {() => number} rng 
   * @param {import('./HazardManager.js').HazardManager} manager 
   */
  init(rng, manager) {
    this.reset();
    const config = this.engine.progression.hazards.memoryLeak;
    if (this.engine.level >= config.unlockLevel) {
      if (manager.hasExclusiveConflict('memoryLeak')) return; 
      this.isActive = true;
    }
  }

  /**
   * Monitors the player's interaction state and orchestrates the blackout.
   * @param {number} dt 
   * @param {number} timestamp 
   */
  update(dt, timestamp) {
    if (!this.isActive) return;
    
    // The memory leak triggers the instant the player begins dragging their finger
    const shouldLeak = this.engine.isDragging;
    
    // Only dispatch commands to the View layer when the state actually changes
    if (shouldLeak !== this.isLeaking) {
      this.isLeaking = shouldLeak;
      this.engine.grid.setMemoryLeakState(this.isLeaking);
    }
  }
}
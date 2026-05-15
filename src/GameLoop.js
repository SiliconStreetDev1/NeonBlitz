// @ts-check

/**
 * Manages the main game loop, delta time calculations, and state updates.
 */
export class GameLoop {
  /**
   * @param {import('./engine.js').GameEngine} engine 
   */
  constructor(engine) {
    /** @type {import('./engine.js').GameEngine} */
    this.engine = engine;
    this.loop = this.loop.bind(this);
  }

  /**
   * Starts or resumes the game loop.
   */
  start() {
    if (this.engine.animId) cancelAnimationFrame(this.engine.animId);
    this.engine.lastTime = performance.now();
    this.engine.animId = requestAnimationFrame(this.loop);
  }

  /**
   * The core loop logic, ticking forward state and triggering renders.
   * @param {number} timestamp 
   */
  loop(timestamp) {
    // Cap dt to 100ms to prevent massive state jumps when the tab is backgrounded
    const dt = Math.min(timestamp - this.engine.lastTime, 100);
    this.engine.lastTime = timestamp;
    
    if (this.engine.isPlaying) {
      this.engine.levelTimeSpent += dt;
      this.engine.dispatch('SUBTRACT_TIME', dt);
      if (this.engine.timeRemaining <= 0) {
        this.engine.gameOver();
      }
    }
    
    const percent = this.engine.hud.updateTimerDisplay(this.engine.timeRemaining, this.engine.maxTime, this.engine.levelTimeSpent);
    
    this.engine.hud.updateDangerState(percent, this.engine.level);
    this.engine.hazards.update(dt, timestamp);

    this.engine.renderer.draw(timestamp, dt); // Passing dt to normalize canvas physics
    
    if (!this.engine.isPlaying && !this.engine.particles.hasActiveParticles() && this.engine.timeRemaining <= 0) return;
    
    this.engine.animId = requestAnimationFrame(this.loop);
  }
}
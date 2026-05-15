// @ts-check

/** @typedef {import('../types.js').VFXPlugin} VFXPlugin */

/**
 * Modular plugin for the VisualEffectsManager.
 * Renders massive, bright orange meteors raining diagonally across the screen.
 * @implements {VFXPlugin}
 */
export class MeteorShowerPlugin {
  /**
   * @param {import('../engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('../engine.js').GameEngine} */
    this.game = game;
    /** @type {Array<{x: number, y: number, vx: number, vy: number, size: number, color: string}>} */
    this.meteors = [];
    /** @type {boolean} */
    this.hasActive = false;
    /** @type {number} */
    this.lastBeatPulse = 0;
  }
  
  /** @returns {boolean} */
  hasActiveParticles() { return this.hasActive; }
  
  /** @returns {void} */
  clear() { this.meteors.length = 0; this.hasActive = false; this.lastBeatPulse = 0; }
  
  /**
   * @param {number} dt 
   * @param {boolean} isTriggered 
   * @param {HTMLCanvasElement} canvas 
   * @param {import('../types.js').EffectState} [effectState] 
   */
  update(dt, isTriggered, canvas, effectState = { baseSpeed: 1, beatPulse: 0, speedMultiplier: 1 }) {
    if (isTriggered) {
      this.hasActive = true;
      
      // EDGE TRIGGER: Spawn just a few punchy meteors exactly on the beat
      if (effectState.beatPulse > 0.1 && effectState.beatPulse > this.lastBeatPulse) {
        const surgeCount = Math.floor(Math.random() * 3) + 1; // Only 1 to 3 meteors!
        const spawnSurge = 1.0 + (effectState.beatPulse * 2.5); 

        for (let i = 0; i < surgeCount; i++) {
          this.meteors.push({
            x: Math.random() * canvas.width * 1.5,
            y: -50,
            vx: -(Math.random() * 70 + 90) * effectState.baseSpeed * spawnSurge,
            vy: (Math.random() * 50 + 70) * effectState.baseSpeed * spawnSurge,
            size: Math.random() * 4 + 3, // Big, but scaled back slightly
            color: Math.random() > 0.5 ? '#ff6600' : '#ff3300'
          });
        }
      }
      
      // Save the pulse state so we can detect when the next beat rises
      this.lastBeatPulse = effectState.beatPulse;
    }
    
    let alive = false;
    const currentSpeed = effectState.baseSpeed; // Drift speed scales with game danger, but no beat jitter

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      let m = this.meteors[i];
      m.x += m.vx * dt * currentSpeed; 
      m.y += m.vy * dt * currentSpeed;
      if (m.y > canvas.height + 100 || m.x < -100) {
        const last = this.meteors.pop();
        if (i < this.meteors.length && last !== undefined) this.meteors[i] = last;
      } else {
        alive = true;
      }
    }
    if (!isTriggered && !alive) this.hasActive = false;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {HTMLCanvasElement} canvas 
   */
  render(ctx, canvas) {
    ctx.save();
    
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'screen';
    for (const m of this.meteors) {
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 0.15, m.y - m.vy * 0.15);
      ctx.strokeStyle = m.color; ctx.lineWidth = m.size; ctx.shadowBlur = 15; ctx.shadowColor = m.color; ctx.stroke();
      ctx.beginPath(); ctx.arc(m.x, m.y, m.size * 0.8, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); // White hot core
    }
    ctx.restore();
  }
}
// @ts-check

/**
 * @typedef {Object} EMPData
 * @property {number} x
 * @property {number} y
 * @property {number} size
 */

/**
 * @fileoverview EMP Shockwave Hazard.
 * Periodically fires a cross-shaped beam that short-circuits the player's line.
 */
export class HazardEMP {
  /**
   * @param {import('../engine.js').GameEngine} engine
   */
  constructor(engine) {
    /** @type {import('../engine.js').GameEngine} */
    this.engine = engine;
    /** @type {EMPData[]} */
    this.emps = [];
    /** @type {number} */
    this.empTimer = 0;
  }

  /**
   * Initializes the EMP hazard for the current level.
   * @param {() => number} rng - Seeded random number generator.
   * @param {import('./HazardManager.js').HazardManager} manager - The parent hazard manager.
   * @returns {void}
   */
  init(rng, manager) {
    this.emps = [];
    this.empTimer = 0;
    
    // Decoupled state check via the plugin manager
    const fog = manager.getPlugin('fog');
    const isFogOfWar = fog && fog.isActive;

    const config = this.engine.progression.hazards.emp;
    /** @type {string[]} */
    const exclusions = Array.isArray(config.exclusiveWith) ? config.exclusiveWith : [];

    // Dynamically yield to conflicting hazards to guarantee fair puzzle conditions
    const isYielding = exclusions.some(key => this.engine.level >= (this.engine.progression.hazards[key]?.unlockLevel || Infinity) && rng() > 0.5);
    if (isYielding) return;

    if (this.engine.level >= config.unlockLevel && (!isFogOfWar || this.engine.level >= config.overrideFogLevel)) {
      const empSize = Math.min(5, 1 + Math.floor((this.engine.level - config.unlockLevel) / 8));
      const numEmps = this.engine.level >= config.doubleEmpLevel ? 2 : 1;
      for (let i = 0; i < numEmps; i++) {
        this.emps.push({
          x: Math.floor(rng() * this.engine.config.level.GRID_COLS),
          y: Math.floor(rng() * this.engine.config.level.GRID_ROWS),
          size: empSize
        });
      }
    }
  }

  /**
   * Updates the EMP timer and handles collision logic.
   * @param {number} dt - Delta time since last frame.
   */
  update(dt) {
    if (this.emps.length === 0) return;
    
    this.empTimer += dt;
    const EMP_CYCLE = 4000;
    const EMP_FIRE_DURATION = 500;
    
    if (this.empTimer > EMP_CYCLE + EMP_FIRE_DURATION) {
      this.empTimer = 0;
    }
    
    const isEmpFiring = this.empTimer > EMP_CYCLE;
    const fireProgress = isEmpFiring ? (this.empTimer - EMP_CYCLE) / EMP_FIRE_DURATION : 0;
    const maxWaveDist = Math.max(this.engine.ui.canvas.width, this.engine.ui.canvas.height);
    const currentWaveDist = fireProgress * maxWaveDist;
    
    if (isEmpFiring && this.engine.selectedBlocks.length > 0) {
      let hit = false;
      for (let idx of this.engine.selectedBlocks) {
        const bx = idx % this.engine.config.level.GRID_COLS;
        const by = Math.floor(idx / this.engine.config.level.GRID_COLS);
        const bc = this.engine.grid.getBlockCenter(idx);
        
        if (!bc) continue;

        for (let emp of this.emps) {
          if (bx === emp.x || by === emp.y) {
            const cellIdx = emp.y * this.engine.config.level.GRID_COLS + emp.x;
            const ec = this.engine.grid.getBlockCenter(cellIdx);
            if (ec) {
              const dist = bx === emp.x ? Math.abs(bc.y - ec.y) : Math.abs(bc.x - ec.x);
              if (dist <= currentWaveDist) {
                hit = true; break;
              }
            }
          }
        }
        if (hit) break;
      }
      if (hit) {
        this.engine.dispatch('SET_DRAGGING', false);
        this.engine.inputHandler.resetSelection();
        if (navigator.vibrate) navigator.vibrate(this.engine.config.tuning.VIBRATION.ERROR);
      }
    }
  }

  /**
   * Renders the visual electrical arcs for the EMP hazard.
   */
  draw() {
    if (this.emps.length === 0) return;
    
    const EMP_CYCLE = 4000;
    const EMP_FIRE_DURATION = 500;
    const isEmpFiring = this.empTimer > EMP_CYCLE;
    const fireProgress = isEmpFiring ? (this.empTimer - EMP_CYCLE) / EMP_FIRE_DURATION : 0;
    const maxWaveDist = Math.max(this.engine.ui.canvas.width, this.engine.ui.canvas.height);
    const currentWaveDist = fireProgress * maxWaveDist;

    const ui = this.engine.ui;
    this.emps.forEach(emp => {
      const cellIdx = emp.y * this.engine.config.level.GRID_COLS + emp.x;
      const c = this.engine.grid.getBlockCenter(cellIdx);
      if (!c) return;
      const chargeRatio = Math.min(1, this.empTimer / EMP_CYCLE);
      
      if (isEmpFiring) {
        ui.ctx.strokeStyle = '#0ff';
        ui.ctx.shadowColor = '#0ff';
        ui.ctx.shadowBlur = 15;
        ui.ctx.lineWidth = 3 + emp.size; // Electric arc thickness
        
        /** @type {Array<[number, number]>} */
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        
        // Draw chaotic, crackling electrical waves
        dirs.forEach(([dx, dy]) => {
          ui.ctx.beginPath();
          ui.ctx.moveTo(c.x, c.y);
          for (let d = 0; d <= currentWaveDist; d += 8) {
            const timeOffset = this.empTimer * 0.02;
            const mainWave = Math.sin(d * 0.08 - timeOffset) * (6 + emp.size * 2);
            const secondaryWave = Math.cos(d * 0.15 + timeOffset * 1.5) * (3 + emp.size);
            const offset = mainWave + secondaryWave;
            
            const px = c.x + (d * dx) + (dy !== 0 ? offset : 0);
            const py = c.y + (d * dy) + (dx !== 0 ? offset : 0);
            ui.ctx.lineTo(px, py);
          }
          ui.ctx.stroke();
        });
        
        // Add a brighter "wave front" energy ball
        ui.ctx.fillStyle = '#fff';
        ui.ctx.shadowBlur = 20;
        const headRadius = 6 + emp.size * 2;
        dirs.forEach(([dx, dy]) => {
          ui.ctx.beginPath();
          ui.ctx.arc(c.x + currentWaveDist * dx, c.y + currentWaveDist * dy, headRadius, 0, Math.PI * 2);
          ui.ctx.fill();
        });

        ui.ctx.shadowBlur = 0;
      }

      const baseRadius = 4 + emp.size * 1.5;

      // Concentric wave animation pulsing outward
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        const phase = (this.empTimer + i * (1500 / waveCount)) % 1500;
        const waveProgress = phase / 1500;
        const waveRadius = baseRadius + waveProgress * 25;
        const waveAlpha = (1 - waveProgress) * 0.8;
        
        ui.ctx.beginPath();
        ui.ctx.arc(c.x, c.y, waveRadius, 0, Math.PI * 2);
        ui.ctx.strokeStyle = isEmpFiring ? '#0ff' : `rgba(0, 255, 255, ${waveAlpha * (0.2 + chargeRatio * 0.8)})`;
        ui.ctx.lineWidth = 2;
        ui.ctx.stroke();
      }
      
      // Translucent, smaller backdrop so block color is highly visible
      ui.ctx.beginPath();
      ui.ctx.arc(c.x, c.y, baseRadius + 2, 0, Math.PI * 2);
      ui.ctx.fillStyle = 'rgba(11, 12, 16, 0.6)';
      ui.ctx.fill();
      
      // Inner glowing core
      ui.ctx.beginPath();
      ui.ctx.arc(c.x, c.y, baseRadius, 0, Math.PI * 2);
      ui.ctx.fillStyle = isEmpFiring ? '#fff' : `rgba(0, 255, 255, ${0.4 + chargeRatio * 0.6})`;
      ui.ctx.shadowColor = '#0ff';
      ui.ctx.shadowBlur = isEmpFiring ? 20 : 10;
      ui.ctx.fill();
      ui.ctx.shadowBlur = 0;
    });
  }
}
// @ts-check

/**
 * Handles rendering logic for the main game canvas.
 */
export class GameRenderer {
  /**
   * @param {import('./engine.js').GameEngine} engine 
   */
  constructor(engine) {
    /** @type {import('./engine.js').GameEngine} */
    this.engine = engine;
  }

  /**
   * Clears the main game canvas.
   */
  clear() {
    this.engine.ui.ctx.clearRect(0, 0, this.engine.ui.canvas.width, this.engine.ui.canvas.height);
  }

  /**
   * Renders the current frame.
   * @param {number} timestamp 
   * @param {number} dt
   */
  draw(timestamp, dt) {
    this.engine.ui.ctx.clearRect(0, 0, this.engine.ui.canvas.width, this.engine.ui.canvas.height);
    
    this.engine.hazards.draw(timestamp);

    if (this.engine.selectedBlocks.length > 0 && this.engine.currentDragColorHex) {
      this.engine.ui.ctx.beginPath();
      
      if (this.engine.isPointerInvalid) {
        this.engine.ui.ctx.strokeStyle = '#8b0000'; // Dark red for invalid trace
        this.engine.ui.ctx.shadowColor = '#8b0000';
      } else if (this.engine.isPointerDeadEnd) {
        this.engine.ui.ctx.strokeStyle = '#ff8c00'; // Orange for dead ends
        this.engine.ui.ctx.shadowColor = '#ff8c00';
      } else if (this.engine.isPointerComplete) {
        this.engine.ui.ctx.strokeStyle = '#006400'; // Dark green for completed
        this.engine.ui.ctx.shadowColor = '#006400';
      } else {
        this.engine.ui.ctx.strokeStyle = this.engine.config.tuning.STYLING.LINE_COLOR; 
        this.engine.ui.ctx.shadowColor = this.engine.currentDragColorHex; 
      }
      
      this.engine.ui.ctx.lineWidth = this.engine.config.tuning.STYLING.LINE_WIDTH; 
      this.engine.ui.ctx.lineCap = 'round'; 
      this.engine.ui.ctx.lineJoin = 'round';
      this.engine.ui.ctx.shadowBlur = this.engine.config.tuning.STYLING.SHADOW_BLUR;
      
      const start = this.engine.grid.getBlockCenter(this.engine.selectedBlocks[0]);
      if (start) this.engine.ui.ctx.moveTo(start.x, start.y);
      for (let i = 1; i < this.engine.selectedBlocks.length; i++) {
        const nextCenter = this.engine.grid.getBlockCenter(this.engine.selectedBlocks[i]);
        if (nextCenter) this.engine.ui.ctx.lineTo(nextCenter.x, nextCenter.y);
      }
      if (this.engine.isDragging && !this.engine.isPointerComplete) {
        const lastCenter = this.engine.grid.getBlockCenter(this.engine.selectedBlocks[this.engine.selectedBlocks.length - 1]);
        if (lastCenter) {
          const dist = Math.hypot(this.engine.pointerPos.x - lastCenter.x, this.engine.pointerPos.y - lastCenter.y);
          if (dist > 24) {
            this.engine.ui.ctx.lineTo(this.engine.pointerPos.x, this.engine.pointerPos.y);
          }
        }
      }
      this.engine.ui.ctx.stroke();
    }
    
    this.engine.particles.updateAndDraw(dt);
  }
}
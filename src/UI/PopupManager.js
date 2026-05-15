// @ts-check

export class PopupManager {
  /**
   * @param {import('../types.js').UIComponents} ui 
   */
  constructor(ui) {
    /** @type {import('../types.js').UIComponents} */
    this.ui = ui;
  }

  /**
   * @param {string} text 
   * @param {number} x 
   * @param {number} y 
   * @param {string} colorHex 
   * @returns {Promise<Animation>}
   */
  showPopup(text, x, y, colorHex) {
    const popup = document.createElement('div');
    popup.textContent = text;
    popup.style.position = 'absolute';
    popup.style.left = x + 'px';
    popup.style.top = (y - 20) + 'px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.color = '#fff';
    popup.style.fontWeight = 'bold';
    popup.style.fontSize = '24px';
    popup.style.textShadow = '0 0 10px ' + colorHex;
    popup.style.pointerEvents = 'none'; 
    popup.style.zIndex = '100';
    if (this.ui.gridContainer) this.ui.gridContainer.appendChild(popup);
    
    const animation = popup.animate([
      { transform: 'translateX(-50%) translateY(0px)', opacity: 1 },
      { transform: 'translateX(-50%) translateY(-60px)', opacity: 0 }
    ], { duration: 1000, easing: 'ease-out' });
    animation.onfinish = () => popup.remove();
    return animation.finished;
  }

  /**
   * @param {number | null} [errorIndex=null] 
   */
  triggerErrorFlash(errorIndex = null) {
    if (errorIndex !== null) {
      const errorEl = this.ui.gridContainer.children[errorIndex];
      if (errorEl) {
        errorEl.animate([
          { transform: 'scale(1.2)', filter: 'brightness(2)' },
          { transform: 'scale(1)', filter: 'brightness(1)' }
        ], { duration: 300, easing: 'ease-out' });
      }
    }
    this.ui.gameArea.animate([
      { transform: 'translateX(0)', boxShadow: 'inset 0 0 0px 0px rgba(255, 51, 102, 0)' },
      { transform: 'translateX(-10px)', boxShadow: 'inset 0 0 50px 10px rgba(255, 51, 102, 0.8)' },
      { transform: 'translateX(10px)', boxShadow: 'inset 0 0 50px 10px rgba(255, 51, 102, 0.8)' },
      { transform: 'translateX(-10px)', boxShadow: 'inset 0 0 50px 10px rgba(255, 51, 102, 0.5)' },
      { transform: 'translateX(10px)', boxShadow: 'inset 0 0 50px 10px rgba(255, 51, 102, 0.2)' },
      { transform: 'translateX(0)', boxShadow: 'inset 0 0 0px 0px rgba(255, 51, 102, 0)' }
    ], { duration: 400, easing: 'ease-in-out' });
  }

  /**
   * @param {number} addedMs 
   * @param {number} carriedMs 
   * @returns {Promise<Animation>}
   */
  showLevelBonus(addedMs, carriedMs) {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div style="font-size: 1.2rem; color: #45a29e; margin-bottom: 5px;">LEVEL CLEARED!</div>
        <div style="font-size: 1rem; color: #888;">TIME CARRIED OVER: ${(carriedMs / 1000).toFixed(1)}s</div>
        <div style="font-size: 2.2rem; font-weight: bold; color: #66fcf1; text-shadow: 0 0 15px #66fcf1; margin-top: 5px;">+ ${(addedMs / 1000).toFixed(1)}s</div>
    `;
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%) scale(0.5)';
    popup.style.textAlign = 'center';
    popup.style.background = 'rgba(11, 12, 16, 0.95)';
    popup.style.padding = '20px 30px';
    popup.style.borderRadius = '12px';
    popup.style.border = '2px solid #45a29e';
    popup.style.boxShadow = '0 0 20px rgba(69, 162, 158, 0.5)';
    popup.style.zIndex = '200';
    popup.style.pointerEvents = 'none'; 
    this.ui.gameArea.appendChild(popup);
    
    const animation = popup.animate([
        { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.15 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.85 },
        { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0 }
    ], { duration: 2500, easing: 'ease-out' });
    animation.onfinish = () => popup.remove();
    return animation.finished;
  }

  /**
   * @param {() => void} transitionToGameOverScreen 
   */
  async showGameOverSequence(transitionToGameOverScreen) {
    // 1. Trigger an immediate, massive red screen flash to sync with the audio bass drop!
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.backgroundColor = '#ff0000';
    flash.style.zIndex = '99999';
    flash.style.pointerEvents = 'none';
    flash.style.mixBlendMode = 'overlay';
    document.body.appendChild(flash);
    
    flash.animate([
      { opacity: 1, filter: 'contrast(2) brightness(2)' },
      { opacity: 0, filter: 'contrast(1) brightness(1)' }
    ], { duration: 800, easing: 'ease-out', delay: 350 }).onfinish = () => flash.remove();

    // 2. Show the floating popup text
    await this.showPopup('GAME OVER!', this.ui.canvas.width / 2, this.ui.canvas.height / 2, '#ff3366');
    transitionToGameOverScreen(); // Menu appears immediately after "GAME OVER!" popup animation finishes.
  }

  /**
   * @param {() => void} transitionToMenu 
   */
  async showBossVictorySequence(transitionToMenu) {
    await this.showPopup('CORE MINED! YOU WIN!', this.ui.canvas.width / 2, this.ui.canvas.height / 2, '#33ccff');
    setTimeout(transitionToMenu, 3000); 
  }
}
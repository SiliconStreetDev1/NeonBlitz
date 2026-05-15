// @ts-check

export class HUDManager {
  /**
   * @param {import('../types.js').UIComponents} ui 
   * @param {any} config 
   */
  constructor(ui, config) {
    this.ui = ui;
    this.config = config;
  }

  /**
   * @returns {import('../types.js').Point | null}
   */
  getHUDOrbCenter() {
    const orbEl = this.ui.targetColorName.querySelector('.current-orb');
    if (!orbEl) return null;
    const rect = orbEl.getBoundingClientRect();
    const canvasRect = this.ui.canvas.getBoundingClientRect();
    return {
      x: rect.left - canvasRect.left + rect.width / 2,
      y: rect.top - canvasRect.top + rect.height / 2
    };
  }

  /**
   * @param {number} timeRemaining 
   * @param {number} maxTime 
   * @param {number} levelTimeSpent 
   * @returns {number}
   */
  updateTimerDisplay(timeRemaining, maxTime, levelTimeSpent) {
    this.ui.timeSpentDisplay.textContent = (levelTimeSpent / 1000).toFixed(1) + 's';
    const percent = Math.max(0, (timeRemaining / maxTime) * 100);
    this.ui.timerBar.style.width = `${percent}%`;
    return percent;
  }

  /**
   * @param {number} level 
   */
  updateLevelDisplay(level) { this.ui.levelDisplay.textContent = level.toString(); }
  
  /**
   * @param {number | null} bestTimeMs 
   */
  updateBestTimeDisplay(bestTimeMs) { this.ui.bestTimeDisplay.textContent = bestTimeMs ? (bestTimeMs / 1000).toFixed(1) + 's' : '--'; }
  
  /**
   * @param {number} percent 
   * @param {number} level 
   */
  updateDangerState(percent, level) {
    if (percent < this.config.tuning.GAME_SETTINGS.DANGER_PERCENT) {
      this.ui.timerBar.classList.add('danger');
      if (level >= 15 && !this.ui.gridContainer.classList.contains('fading')) {
        this.ui.gridContainer.classList.add('fading');
        this.ui.gridContainer.style.transition = 'filter 2s';
        this.ui.gridContainer.style.filter = 'grayscale(0.9) brightness(0.6)';
      }
    } else {
      this.ui.timerBar.classList.remove('danger');
      if (this.ui.gridContainer.classList.contains('fading')) {
        this.ui.gridContainer.classList.remove('fading');
        this.ui.gridContainer.style.filter = 'none';
      }
    }
  }

  /**
   * @param {import('../types.js').TargetQueue} targetQueue 
   * @param {number} currentTargetIndex 
   * @param {number} [targetDifficulty=0] 
   * @param {number} [combo=1] 
   */
  updateTargetUI(targetQueue, currentTargetIndex, targetDifficulty = 0, combo = 1) {
    if (currentTargetIndex >= targetQueue.length) return;
    
    const currentInfo = targetQueue[currentTargetIndex].colorInfo;
    let targetText = currentInfo.name;
    let targetColor = currentInfo.hex;
    let textShadow = `0 0 10px ${currentInfo.hex}`;
    let orbHtml = `<div class="current-orb" data-color-class="${currentInfo.class}" style="background-color: ${currentInfo.hex}; box-shadow: 0 0 12px ${currentInfo.hex};"></div>`;

    if (targetDifficulty >= 2) {
      targetColor = '#888888';
      textShadow = 'none';
      orbHtml = ''; 
      if (targetDifficulty === 3) targetText = currentInfo.name.charAt(0) + '.'.repeat(currentInfo.name.length - 1);
    }

    let upcomingHtml = '';
    if (targetDifficulty === 0) {
      const nextItems = targetQueue.slice(currentTargetIndex + 1, currentTargetIndex + 4);
      if (nextItems.length > 0) {
        const orbsHtml = nextItems.map(t => `<div class="upcoming-orb" data-color-class="${t.colorInfo.class}" style="background-color: ${t.colorInfo.hex}; box-shadow: 0 0 5px ${t.colorInfo.hex};"></div>`).join('');
        upcomingHtml = `<div class="upcoming-orbs">${orbsHtml}</div>`;
      }
    }
    
    let comboHtml = combo > 1 ? `<div class="combo-meter">x${combo} 🔥</div>` : '';

    this.ui.targetColorName.innerHTML = `
      <div class="unified-queue">
        <div class="current-target-container">
          ${orbHtml}
          <span style="color: ${targetColor}; text-shadow: ${textShadow}; font-size: 1.1rem; font-weight: bold; letter-spacing: 1px;">${targetText}</span>
        </div>
        ${upcomingHtml}
        ${comboHtml}
      </div>
    `;
    
    this.ui.nextQueueDisplay.innerHTML = '';
    
    const queueEl = this.ui.targetColorName.querySelector('.unified-queue');
    if (queueEl) {
      queueEl.animate([
        { transform: 'translateX(20px)', opacity: 0.5 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: 250, easing: 'ease-out' });
    }
  }
}
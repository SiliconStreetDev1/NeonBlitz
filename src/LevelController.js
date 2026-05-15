// @ts-check
import { generateLevelData } from './board.js';
import { seededRandom } from './utils.js';

/**
 * Handles level initialization, transitions, and queue advancement.
 */
export class LevelController {
  /**
   * @param {import('./engine.js').GameEngine} engine 
   */
  constructor(engine) {
    /** @type {import('./engine.js').GameEngine} */
    this.engine = engine;
  }

  /**
   * Starts a completely fresh run from Level 1.
   */
  startNewGame() {
    this.engine.checkpointManager.saveRunSeed(Math.floor(Math.random() * 1000000));
    this.engine.level = this.engine.config.tuning.GAME_SETTINGS.STARTING_LEVEL;
    this.engine.dispatch('SET_COMBO', 1);
    this.engine.levelTimeSpent = 0;
    this.engine.dispatch('SET_TIME', this.engine.config.tuning.GAME_SETTINGS.STARTING_TIME_MS);
    
    this.engine.screens.hideAllScreens();
    this.engine.hud.updateLevelDisplay(this.engine.level);
    this.engine.screens.toggleGameVisibility(true);
    this.initLevel();
  }

  /**
   * Bypasses early levels and starts directly at the user's highest saved checkpoint.
   * @param {number|null} targetLevel - Optional specific level to load.
   */
  loadCheckpointGame(targetLevel = null) {
    const milestones = this.engine.checkpointManager.getMilestones(); 
    const keys = Object.keys(milestones).map(Number);
    const highestMilestone = keys.length > 0 ? Math.max(...keys) : 1;
    
    if (highestMilestone <= 1 && !targetLevel) return;
    
    this.engine.level = targetLevel || highestMilestone;
    this.engine.dispatch('SET_COMBO', 1);
    this.engine.levelTimeSpent = 0;
    this.engine.dispatch('SET_TIME', milestones[this.engine.level] || this.engine.config.tuning.GAME_SETTINGS.STARTING_TIME_MS);
    this.engine.isResumingFromCheckpoint = true;
    
    this.engine.screens.hideAllScreens();
    this.engine.screens.toggleGameVisibility(true);
    this.engine.hud.updateLevelDisplay(this.engine.level);
    this.initLevel();
  }

  /**
   * Rewinds the player to their most recent milestone after dying.
   */
  rewindToMilestone() {
    const milestones = this.engine.checkpointManager.getMilestones();
    this.engine.dispatch('SET_TIME', milestones[this.engine.level] || this.engine.config.tuning.GAME_SETTINGS.STARTING_TIME_MS);
    this.engine.dispatch('SET_COMBO', 1);
    this.engine.isResumingFromCheckpoint = true;
    this.engine.levelTimeSpent = 0;
    
    this.engine.screens.hideAllScreens();
    this.engine.screens.toggleGameVisibility(true);
    this.engine.hud.updateLevelDisplay(this.engine.level);
    this.initLevel();
  }

  /**
   * Initializes and resets state for the current level, generating new targets and grids.
   */
  initLevel() {
    this.engine.grid.setupGridDimensions(this.engine.config.level.GRID_COLS, this.engine.config.level.GRID_ROWS);

    const runSeed = this.engine.checkpointManager.getRunSeed();
    this.engine.audio?.startLevelMusic?.(this.engine.level, runSeed, this.engine.progression.milestones.bossLevel);

    const rng = seededRandom(this.engine.level);
    this.engine.targetQueue = generateLevelData(this.engine.level, rng, this.engine.config);
    this.engine.currentTargetIndex = 0;
    this.engine.targetDifficulty = this.engine.targetQueue.length > 0 ? this.engine.targetQueue[0].difficulty : 0;

    this.engine.levelTimeSpent = 0;
    let bestTimes = this.engine.checkpointManager.getBestTimes();
    const best = bestTimes[this.engine.level];
    this.engine.hud.updateBestTimeDisplay(best);

    let timeReward = 0;
    let carriedTime = 0;
    
    const gs = this.engine.config.tuning.GAME_SETTINGS;
    if (this.engine.level === gs.STARTING_LEVEL) {
      if (this.engine.timeRemaining <= 0) this.engine.dispatch('SET_TIME', gs.STARTING_TIME_MS);
      this.engine.levelStartCarriedTime = 0;
    } else {
      if (this.engine.isResumingFromCheckpoint) {
        carriedTime = this.engine.timeRemaining;
        this.engine.levelStartCarriedTime = carriedTime;
        timeReward = 0;
        this.engine.isResumingFromCheckpoint = false;
      } else {
        carriedTime = this.engine.timeRemaining;
        this.engine.levelStartCarriedTime = carriedTime;
        timeReward = Math.max(gs.MIN_TIME_ADD_MS, gs.BASE_TIME_ADD_MS * Math.pow(gs.TIME_DECAY_RATE, this.engine.level - 1));
        this.engine.dispatch('ADD_TIME', timeReward);
      }
    }
    
    // Auto-save checkpoint for every level reached
    let milestones = this.engine.checkpointManager.getMilestones();
    const existingBank = milestones[this.engine.level] || 0;
    const shouldSaveNewMilestone = this.engine.timeRemaining > existingBank;
    if (shouldSaveNewMilestone) this.engine.checkpointManager.saveMilestone(this.engine.level, this.engine.timeRemaining);

    this.engine.particles.clear();
    this.engine.isPointerInvalid = false;
    this.engine.isPointerComplete = false;
    this.engine.isPointerDeadEnd = false;
    this.engine.resetState();
    
    this.engine.grid.initGrid(this.engine.targetQueue, this.engine.level, rng, this.engine.config);
    
    // Hazards MUST initialize after the grid is built so they can read/modify the new DOM blocks
    this.engine.hazards.init(rng);
    
    this.advanceQueue();
    this.engine.resizeCanvas();
    
    this.engine.lastTime = performance.now();
    this.engine.dispatch('SET_PLAYING', true);
    
    this.engine.gameLoopController.start();
    
    if (this.engine.level > this.engine.config.tuning.GAME_SETTINGS.STARTING_LEVEL) {
      // Chain the animations cleanly using Promises instead of hacky setTimeouts
      this.engine.popups.showLevelBonus(timeReward, carriedTime).then(() => {
        // Only show "Checkpoint Saved" popup AFTER the Level Bonus finishes
        if (shouldSaveNewMilestone && timeReward > 0 && this.engine.isPlaying) {
          this.engine.popups.showPopup('CHECKPOINT SAVED!', this.engine.ui.canvas.width / 2, this.engine.ui.canvas.height / 2, '#33cc66');
        }
      });
    }
  }

  /**
   * Checks remaining blocks and advances the target queue if the current target is fully cleared.
   */
  advanceQueue() {
    this.engine.hud.updateTargetUI(this.engine.targetQueue, this.engine.currentTargetIndex, this.engine.targetDifficulty, this.engine.combo);
    const currentTarget = this.engine.targetQueue[this.engine.currentTargetIndex];
    const remaining = currentTarget ? this.engine.grid.highlightActiveBlocks(currentTarget.colorInfo.class, this.engine.targetDifficulty) : 0;
    const allBlocks = this.engine.ui.gridContainer.children;
    if (remaining === 0 && allBlocks.length > 0 && this.engine.currentTargetIndex < this.engine.targetQueue.length) {
      this.engine.currentTargetIndex++;
      if (this.engine.currentTargetIndex >= this.engine.targetQueue.length) {
        this.levelComplete();
      } else {
        this.engine.targetDifficulty = this.engine.targetQueue[this.engine.currentTargetIndex].difficulty;
        this.advanceQueue();
      }
    }
  }

  /**
   * Triggers end-of-level animations, calculates bonuses, and transitions to the next stage.
   */
  levelComplete() {
    this.engine.dispatch('SET_PLAYING', false);
    
    let bestTimes = this.engine.checkpointManager.getBestTimes();
    const prevBest = bestTimes[this.engine.level];
    let isNewBest = false;
    
    if (!prevBest || this.engine.levelTimeSpent < prevBest) {
      this.engine.checkpointManager.saveBestTime(this.engine.level, this.engine.levelTimeSpent);
      isNewBest = true;
    }

    if (navigator.vibrate) navigator.vibrate(this.engine.config.tuning.VIBRATION.LEVEL_COMPLETE);
    this.engine.audio?.playLevelComplete?.();
    this.engine.particles.confetti();
    
    // Boss Fight Victory
    if (this.engine.level === this.engine.progression.milestones.bossLevel) {
       this.engine.particles.confetti();
       this.engine.popups.showBossVictorySequence(() => this.engine.showStartMenu());
       return;
    }

    if (isNewBest) {
      this.engine.popups.showPopup('NEW BEST TIME!', this.engine.ui.canvas.width / 2, this.engine.ui.canvas.height / 2, '#f1c40f');
    }

    this.engine.level++;
    setTimeout(() => {
      this.engine.hud.updateLevelDisplay(this.engine.level);
      this.initLevel();
    }, this.engine.config.tuning.GAME_SETTINGS.LEVEL_TRANSITION_DELAY_MS);
  }
}
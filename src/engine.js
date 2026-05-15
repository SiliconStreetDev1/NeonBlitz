// @ts-check
import { ParticleSystem } from './particles.js';
import { GridManager, HUDManager, ScreenManager, PopupManager } from './UIManager.js';
import { InputHandler } from './InputHandler.js';
import { CheckpointManager } from './CheckpointManager.js';
import { MenuController } from './MenuController.js';
import { LevelController } from './LevelController.js';
import { SettingsManager } from './SettingsManager.js';
import { GameRenderer } from './GameRenderer.js';
import { GameLoop } from './GameLoop.js';
import { AudioManager } from './Audio/AudioManager.js';
import { HazardManager } from './Hazards/HazardManager.js';

/**
 * @typedef {import('./types.js').UIComponents} UIComponents
 * @typedef {import('./types.js').Point} Point
 * @typedef {import('./types.js').TargetQueue} TargetQueue
 */

/**
 * --- MAIN GAME CONTROLLER ---
 * Enterprise orchestrator managing game state, timer loops, and external delegates.
 */
export class GameEngine {
  /**
   * Initializes the GameEngine with required UI components.
   * @param {UIComponents} ui - Dictionary of DOM elements.
   * @param {any} config - The master data-driven JSON configuration.
   */
  constructor(ui, config) {
    /** @type {UIComponents} */
    this.ui = ui;
    /** @type {any} */
    this.config = config;
    /** @type {any} */
    this.progression = config.progression; // Quick reference
    /** @type {SettingsManager} */
    this.settings = new SettingsManager(this.config.tuning.STORAGE);
    /** @type {AudioManager} */
    this.audio = new AudioManager(this.settings, this.config.audio);
    /** @type {CheckpointManager} */
    this.checkpointManager = new CheckpointManager(this.config.tuning.STORAGE);
    /** @type {InputHandler} */
    this.inputHandler = new InputHandler(this);
    /** @type {ParticleSystem} */
    this.particles = new ParticleSystem(this.ui.ctx, this.ui.canvas, this.audio);
    
    /** @type {GridManager} */
    this.grid = new GridManager(this.ui, this.config);
    /** @type {HUDManager} */
    this.hud = new HUDManager(this.ui, this.config);
    /** @type {ScreenManager} */
    this.screens = new ScreenManager(this.ui, this.checkpointManager, this.config);
    /** @type {PopupManager} */
    this.popups = new PopupManager(this.ui);
    
    /** @type {HazardManager} */
    this.hazards = new HazardManager(this);

    /** @type {MenuController} */
    this.menuController = new MenuController(this);
    /** @type {LevelController} */
    this.levelController = new LevelController(this);
    /** @type {GameRenderer} */
    this.renderer = new GameRenderer(this);
    /** @type {GameLoop} */
    this.gameLoopController = new GameLoop(this);

    // Core State
    /** @type {number} */
    this.level = this.config.tuning.GAME_SETTINGS.STARTING_LEVEL;
    /** @type {number} */
    this.combo = 1;
    /** @type {number} */
    this.maxTime = this.config.tuning.GAME_SETTINGS.STARTING_TIME_MS;
    /** @type {number} */
    this.timeRemaining = this.maxTime;

    /** @type {number} */
    this.levelStartCarriedTime = 0;
    /** @type {number} */
    this.levelTimeSpent = 0;
    /** @type {boolean} */
    this.isResumingFromCheckpoint = false;
    /** @type {boolean} */
    this.isRandomMode = false;
    /** @type {number} */
    this.randomStagesCleared = 0;

    /** @type {TargetQueue} */ 
    this.targetQueue = [];
    /** @type {number} */
    this.currentTargetIndex = 0;
    
    // Input & Interaction State
    /** @type {boolean} */
    this.isPlaying = false;
    /** @type {boolean} */
    this.isDragging = false;
    /** @type {number[]} */ this.selectedBlocks = [];
    /** @type {string | null} */ this.currentDragColorClass = null;
    /** @type {string | null} */ this.currentDragColorHex = null;
    /** @type {Point} */ this.pointerPos = { x: 0, y: 0 };
    /** @type {boolean} */
    this.isPointerInvalid = false;
    /** @type {boolean} */
    this.isPointerComplete = false;
    /** @type {boolean} */
    this.isPointerDeadEnd = false;
    
    /** @type {number} */
    this.lastTime = 0;
    /** @type {number | null} */ this.animId = null;
    /** @type {number} */
    this.targetDifficulty = 0; // 0 = Normal, 1 = Unhinted (gray text), 2 = Unknown

    // Bind legacy loop method for external compatibility
    /** @type {(timestamp: number) => void} */
    this.gameLoop = this.gameLoopController.loop;
  }

  /**
   * Dynamically loads hazard plugins based on JSON configuration.
   */
  async initPlugins() {
    const hazardKeys = Object.keys(this.progression.hazards);
    await Promise.all(hazardKeys.map(async (key) => {
      let capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === 'emp') capitalizedKey = 'EMP'; // Fix for acronym capitalization mismatch
      try {
        const module = await import(`./Hazards/Hazard${capitalizedKey}.js`);
        this.hazards.registerPlugin(key, module[`Hazard${capitalizedKey}`]);
      } catch (err) {
        console.warn(`⚠️ GameEngine: Failed to load hazard plugin '${key}'. Skipping to prevent crash.`, err);
      }
    }));
  }

  /** Resizes the internal canvas to strictly match the DOM container. */
  resizeCanvas() { 
    this.screens.resizeCanvas(); 
    this.grid.cacheBlockCenters();
  }
  
  /** Activates the main menu screen and stops gameplay. */
  showStartMenu() { this.menuController.showStartMenu(); }
  
  /** Activates the best times leaderboard screen. */
  showBestTimes() { this.menuController.showBestTimes(); }
  
  /** Activates the level checkpoint selection screen. */
  showMilestoneSelector() { this.menuController.showMilestoneSelector(); }
  
  /** 
   * Starts a completely new game run from Level 1. 
   * @returns {void}
   */
  startNewGame() { this.levelController.startNewGame(); }

  /** 
   * Starts a randomized arcade run. 
   * @returns {void}
   */
  startRandomGame() { this.levelController.startRandomGame(); }

  /**
   * Loads the game at the specified checkpoint level.
   * @param {number | null} [targetLevel=null]
   */
  loadCheckpointGame(targetLevel = null) { this.levelController.loadCheckpointGame(targetLevel); }
  
  /**
   * Safely returns the currently playing music track name, preventing Law of Demeter violations.
   * @returns {string | null}
   */
  getCurrentMusicTrack() {
    return this.audio?.getCurrentMusicTrack() || null;
  }

  /**
   * Unidirectional Data Flow: Centralized state mutation (Redux-lite)
   * Prevents race conditions from managers mutating state simultaneously.
   * @param {string} actionType 
   * @param {any} [payload] 
   */
  dispatch(actionType, payload = null) {
    switch(actionType) {
      case 'SET_TIME':
        this.timeRemaining = payload;
        this.maxTime = payload; // Reset max time so the visual timer bar starts at 100%
        break;
      case 'ADD_TIME':
        this.timeRemaining += payload;
        this.maxTime = Math.max(this.maxTime, this.timeRemaining);
        break;
      case 'SUBTRACT_TIME':
        this.timeRemaining -= payload;
        break;
      case 'SET_COMBO':
        this.combo = payload;
        break;
      case 'INCREMENT_COMBO':
        this.combo++;
        break;
      case 'SET_PLAYING':
        this.isPlaying = payload;
        break;
      case 'SET_DRAGGING':
        this.isDragging = payload;
        break;
      default:
        console.warn(`⚠️ GameEngine: Unknown action type dispatched: ${actionType}`);
    }
  }

  /**
   * Calculates a generic speed multiplier.
   * @returns {number} Speed multiplier
   */
  getSpeedMultiplier() {
    return 1.0;
  }

  /**
   * @returns {number} The current audio beat intensity (0.0 to 1.0).
   */
  getBeatPulse() { return this.audio?.getBeatPulse?.() || 0; }

  /**
   * Resets all ephemeral game and input states.
   */
  resetState() {
    this.dispatch('SET_PLAYING', false);
    this.dispatch('SET_DRAGGING', false);
    this.grid.clearBlockStates(this.selectedBlocks);
    this.selectedBlocks = [];
    this.renderer?.clear();
  }

  /**
   * Orchestrates the game over sequence, delegating to UI and Audio managers.
   */
  gameOver() {
    this.dispatch('SET_PLAYING', false);
    if (navigator.vibrate) navigator.vibrate(this.config.tuning.VIBRATION.GAME_OVER);
    this.audio?.stopMusic?.();
    this.audio?.playGameOver?.();
    
    this.popups.showGameOverSequence(() => {
      this.menuController.showGameOverScreen();
      if (!this.isPlaying) this.audio?.startMenuMusic?.();
    });
  }

  /** Rewinds the game to the current level's start state after death. */
  rewindToMilestone() { this.levelController.rewindToMilestone(); }
  
  /** Initializes the board and generates targets for the current level. */
  initLevel() { this.levelController.initLevel(); }
  
  /** Evaluates if the queue can advance and triggers it. */
  advanceQueue() { this.levelController.advanceQueue(); }
  
  /** Handles the visual and logical state transition when a level is cleared. */
  levelComplete() { this.levelController.levelComplete(); }

  /**
   * Delegates the pointer down event to the InputHandler.
   * @param {number} index - The block index touched.
   * @param {number} x - Pointer X coordinate.
   * @param {number} y - Pointer Y coordinate.
   */
  handlePointerDown(index, x, y) { this.inputHandler.handlePointerDown(index, x, y); }
  
  /**
   * Delegates the pointer move event to the InputHandler.
   * @param {number} index - The block index dragged over.
   * @param {number} x - Pointer X coordinate.
   * @param {number} y - Pointer Y coordinate.
   */
  handlePointerMove(index, x, y) { this.inputHandler.handlePointerMove(index, x, y); }
  
  /**
   * Delegates the pointer up event to the InputHandler.
   */
  handlePointerUp() { this.inputHandler.handlePointerUp(); }
}
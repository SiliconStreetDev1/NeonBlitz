// @ts-check
import { GameEngine } from './engine.js';
import { AppController } from './AppController.js';
import { VisualEffectsManager } from './VisualEffectsManager.js';
import prog from './progression-manifest.json';
import tuning from './engine-tuning.json';
import level from './level-config.json';
import audio from './audio-manifest.json';
import './style.css';

/**
 * @fileoverview Main entry point and bootstrap for the Neon Blitz game.
 */

// --- BOOTSTRAP & INPUT DELEGATION ---
/** @type {import('./types.js').UIComponents} */
const ui = {
  gridContainer: /** @type {HTMLElement} */ (document.getElementById('gridContainer')),
  canvas: /** @type {HTMLCanvasElement} */ (document.getElementById('lineCanvas')),
  ctx: /** @type {CanvasRenderingContext2D} */ (/** @type {HTMLCanvasElement} */ (document.getElementById('lineCanvas')).getContext('2d')),
  particleCanvas: /** @type {HTMLCanvasElement} */ (document.getElementById('particleCanvas')),
  particleCtx: /** @type {CanvasRenderingContext2D} */ (/** @type {HTMLCanvasElement} */ (document.getElementById('particleCanvas')).getContext('2d')),
  timerBar: /** @type {HTMLElement} */ (document.getElementById('timerBar')),
  levelDisplay: /** @type {HTMLElement} */ (document.getElementById('levelDisplay')),
  timeSpentDisplay: /** @type {HTMLElement} */ (document.getElementById('timeSpentDisplay')),
  bestTimeDisplay: /** @type {HTMLElement} */ (document.getElementById('bestTimeDisplay')),
  quitBtn: /** @type {HTMLElement} */ (document.getElementById('quitBtn')),
  gameOverScreen: /** @type {HTMLElement} */ (document.getElementById('gameOverScreen')),
  targetColorName: /** @type {HTMLElement} */ (document.getElementById('targetColorName')),
  nextQueueDisplay: /** @type {HTMLElement} */ (document.getElementById('nextQueueDisplay')),
  gameArea: /** @type {HTMLElement} */ (document.querySelector('.game-area')),
  startScreen: /** @type {HTMLElement} */ (document.getElementById('startScreen')),
  startNewBtn: /** @type {HTMLElement} */ (document.getElementById('startNewBtn')),
  loadCheckpointBtn: /** @type {HTMLElement} */ (document.getElementById('loadCheckpointBtn')),
  randomModeBtn: /** @type {HTMLElement} */ (document.getElementById('randomModeBtn')),
  selectLevelBtn: /** @type {HTMLElement} */ (document.getElementById('selectLevelBtn')),
  rewindBtn: /** @type {HTMLElement} */ (document.getElementById('rewindBtn')),
  restartBtn: /** @type {HTMLElement} */ (document.getElementById('restartBtn')),
  bestTimesBtn: /** @type {HTMLElement} */ (document.getElementById('bestTimesBtn')),
  bestTimesScreen: /** @type {HTMLElement} */ (document.getElementById('bestTimesScreen')),
  bestTimesList: /** @type {HTMLElement} */ (document.getElementById('bestTimesList')),
  shareTwitterBtn: /** @type {HTMLElement} */ (document.getElementById('shareTwitterBtn')),
  closeBestTimesBtn: /** @type {HTMLElement} */ (document.getElementById('closeBestTimesBtn')),
  milestoneScreen: /** @type {HTMLElement} */ (document.getElementById('milestoneScreen')),
  milestoneList: /** @type {HTMLElement} */ (document.getElementById('milestoneList')),
  closeMilestoneBtn: /** @type {HTMLElement} */ (document.getElementById('closeMilestoneBtn')),
  hud: /** @type {HTMLElement} */ (document.querySelector('.hud')),
  settingsBtn: /** @type {HTMLElement} */ (document.getElementById('settingsBtn')),
  settingsScreen: /** @type {HTMLElement} */ (document.getElementById('settingsScreen')),
  toggleMusicBtn: /** @type {HTMLElement} */ (document.getElementById('toggleMusicBtn')),
  toggleSfxBtn: /** @type {HTMLElement} */ (document.getElementById('toggleSfxBtn')),
  musicVolumeSlider: /** @type {HTMLInputElement} */ (document.getElementById('musicVolumeSlider')),
  sfxVolumeSlider: /** @type {HTMLInputElement} */ (document.getElementById('sfxVolumeSlider')),
  resetSettingsBtn: /** @type {HTMLElement} */ (document.getElementById('resetSettingsBtn')),
  closeSettingsBtn: /** @type {HTMLElement} */ (document.getElementById('closeSettingsBtn')),
  installBtn: document.getElementById('installBtn') ? /** @type {HTMLElement} */ (document.getElementById('installBtn')) : undefined
};

const config = {
  progression: prog,
  tuning: tuning,
  level: level,
  audio: audio
};

const game = new GameEngine(ui, config);
const vfxManager = new VisualEffectsManager(ui.particleCanvas, ui.particleCtx, game);

await Promise.all([
  game.initPlugins(),
  vfxManager.loadManifest()
]);

const app = new AppController(game, ui);
app.init();

// Now that the heavy audio plugins and VFX chunks are downloaded, allow the user to click
const initText = document.getElementById('initText');
if (initText) initText.textContent = '[ TAP TO INITIALIZE ]';
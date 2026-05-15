// @ts-check
import { getBlockFromPoint } from './utils.js';
import { preventIOSZoom } from './device.js';
import { initDebugBar } from './DebugBar.js';

export class OrientationOverlay {
  /**
   * @param {import('./engine.js').GameEngine} game 
   */
  constructor(game) {
    /** @type {import('./engine.js').GameEngine} */
    this.game = game;
    /** @type {HTMLElement} */
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100vw';
    this.overlay.style.height = '100vh';
    this.overlay.style.backgroundColor = '#0b0c10';
    this.overlay.style.color = '#66fcf1';
    this.overlay.style.display = 'none';
    this.overlay.style.flexDirection = 'column';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.zIndex = '10000';
    this.overlay.style.fontFamily = 'sans-serif';
    this.overlay.style.fontSize = '1.5rem';
    this.overlay.style.textAlign = 'center';
    this.overlay.style.padding = '20px';
    this.overlay.style.boxSizing = 'border-box';
    this.overlay.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 20px;">📱⤾</div>
      <div style="font-weight: bold;">Please rotate your device to portrait mode.</div>
    `;
    document.body.appendChild(this.overlay);

    /** @type {number | undefined} */
    this._resizeTimer = undefined;
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
    this.handleResize(); // Initial check on load
  }

  handleResize() {
    // Debounce the resize event to prevent brutal layout thrashing
    clearTimeout(this._resizeTimer);
    this._resizeTimer = window.setTimeout(() => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      // Only block landscape if the vertical space is actually too cramped (e.g., phones).
      // This allows touch-screen laptops, dual monitors, and tablets to play perfectly!
      const isCramped = window.innerHeight < 600;
      
      this.overlay.style.display = (isMobile && isLandscape && isCramped) ? 'flex' : 'none';
      
      // Wait for DOM reflow before resizing canvas
      this.game.resizeCanvas();
    }, 150);
  }
}

/**
 * @class HUDModernizer
 * Enterprise UI Theme Injector. Handles dynamic CSS generation for HUD modernization
 * and colorblind accessibility geometric patterns to keep HTML templates clean.
 */
export class HUDModernizer {
  /**
   * @param {import('./types.js').UIComponents} ui 
   */
  static init(ui) {
    if (document.getElementById('hud-modernizer-styles')) return; // Prevent duplicate injection on resets

    const hudUxStyles = document.createElement('style');
    hudUxStyles.id = 'hud-modernizer-styles';
    hudUxStyles.textContent = `
      .hud.hud-modern {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        padding: 8px 10px;
        gap: 10px;
        background: rgba(11, 12, 16, 0.95);
        border-bottom: 2px solid #1f2833;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 100;
      }
      .hud.hud-modern .stats-row {
        width: 100%;
        margin-bottom: 8px;
        padding: 0 5px; /* Keeps it slightly off the extreme edges */
      }
      #startScreen, #bestTimesScreen, #milestoneScreen, #settingsScreen {
        background-color: #0b0c10;
      }
      .best-time-item:hover {
        background-color: rgba(69, 162, 158, 0.2) !important;
      }
      .hud.hud-modern > * {
        margin: 0;
        font-size: 0.9rem;
      }
      .hud.hud-modern #targetColorName, .hud.hud-modern #nextQueueDisplay { margin: 0; padding: 0; }
      .unified-queue {
        display: flex; align-items: center; gap: 12px;
        background: rgba(255, 255, 255, 0.08);
        padding: 6px 16px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .current-target-container { display: flex; align-items: center; gap: 8px; }
      .current-orb {
        width: 16px; height: 16px; border-radius: 50%;
        animation: pulse-orb 1s infinite alternate;
      }
      .upcoming-orbs {
        display: flex; align-items: center; gap: 8px;
        border-left: 2px solid rgba(255, 255, 255, 0.15);
        padding-left: 12px;
      }
      .upcoming-orb { width: 12px; height: 12px; border-radius: 50%; opacity: 0.6; }
      .combo-meter {
        font-weight: 900; font-size: 1.1rem; color: #ffcc00; font-style: italic;
        text-shadow: 0 0 10px #ffcc00; margin-left: auto;
        animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .block.encrypted-node {
        filter: saturate(0.5) brightness(0.6);
      }
      @keyframes pulse-orb {
        from { transform: scale(0.95); filter: brightness(0.9); }
        to { transform: scale(1.15); filter: brightness(1.3); }
      }
      @keyframes pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      /* --- MEMORY LEAK HAZARD --- */
      .grid .block { transition: background-color 0.15s ease-out, filter 0.15s ease-out; }
      .grid.memory-leak-active .block:not(.empty) {
        background-color: #1a1a24 !important;
        background-image: none !important;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.9) !important;
        border: 1px solid #111 !important;
        filter: grayscale(1) !important;
        transition: background-color 0.05s ease-in, filter 0.05s ease-in;
      }
      
      .timer-track-modern {
        position: fixed !important;
        top: 0 !important; 
        left: 0 !important;
        width: 100vw !important;
        height: 3px !important; 
        z-index: 1000 !important;
        margin: 0 !important;
        background: rgba(255, 255, 255, 0.1) !important;
      }
      .timer-bar-modern {
        height: 100% !important;
        border-radius: 0 !important; 
        margin: 0 !important;
      }
    `;
    document.head.appendChild(hudUxStyles);

    ui.hud.classList.add('hud-modern');

    if (ui.timerBar) {
      ui.timerBar.classList.add('timer-bar-modern');
      const timerTrack = ui.timerBar.parentElement;
      // Instead of tearing the DOM apart, we gracefully style the parent container 
      // to become the fixed track, keeping the HTML component hierarchy completely intact.
      if (timerTrack && timerTrack !== ui.hud && timerTrack !== document.body) {
        timerTrack.classList.add('timer-track-modern');
      } else {
        // Fallback if there is no track container
        ui.timerBar.classList.add('timer-track-modern');
      }
    }
  }
}

export class AppController {
  /**
   * @param {import('./engine.js').GameEngine} game 
   * @param {import('./types.js').UIComponents} ui 
   */
  constructor(game, ui) {
    /** @type {import('./engine.js').GameEngine} */
    this.game = game;
    /** @type {import('./types.js').UIComponents} */
    this.ui = ui;
    /** @type {{x: number, y: number}} */
    this.pointerDownPos = { x: 0, y: 0 };
    /** @type {number} */
    this.lastSfxPlayTime = 0;
    /** @type {OrientationOverlay | undefined} */
    this.orientation = undefined;
  }

  init() {
    this.orientation = new OrientationOverlay(this.game);
    HUDModernizer.init(this.ui);
    preventIOSZoom();
    this.bindInputEvents();
    this.bindUIEvents();
    initDebugBar(this.game, this.ui);
    this.registerServiceWorker();
    this.start();
  }

  /**
   * Registers the PWA Service Worker for offline playback caching.
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Use relative path so it correctly registers when hosted in a subdirectory (like GitHub Pages)
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('✅ PWA Service Worker Registered!', reg.scope))
          .catch(err => console.error('⚠️ PWA Service Worker Failed:', err));
      });
    }
  }

  /**
   * Binds global pointer events to the game engine's input handler.
   */
  bindInputEvents() {
    window.addEventListener('pointerdown', /** @param {PointerEvent} e */ (e) => {
      this.game.audio?.init?.(); 
      this.game.audio?.resumeContext?.();
      const target = /** @type {HTMLElement} */ (e.target);
      if (!this.game.isPlaying || !target || target.closest('button')) return;
      
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      let el = getBlockFromPoint(e.clientX, e.clientY, this.ui.gridContainer);
      let idx = el ? parseInt(el.dataset.index || "-1", 10) : -1;
      let rect = this.ui.canvas.getBoundingClientRect();
      this.game.handlePointerDown(idx, e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('pointermove', /** @param {PointerEvent} e */ (e) => {
      if (!this.game.isPlaying || !this.game.isDragging) return;
      let rect = this.ui.canvas.getBoundingClientRect();
      let el = getBlockFromPoint(e.clientX, e.clientY, this.ui.gridContainer);
      let idx = el ? parseInt(el.dataset.index || "-1", 10) : -1;
      this.game.handlePointerMove(idx, e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('pointerup', /** @param {PointerEvent} e */ (e) => {
      this.game.handlePointerUp();
    });

    // Safety fallback for system interruptions (like iOS text message alerts)
    window.addEventListener('pointercancel', /** @param {PointerEvent} e */ (e) => {
      this.game.handlePointerUp();
    });
  }

  /**
   * Connects DOM buttons to their corresponding GameEngine and MenuController actions.
   */
  bindUIEvents() {
    this.ui.startNewBtn.addEventListener('click', () => this.game.startNewGame());
    this.ui.randomModeBtn.addEventListener('click', () => this.game.startRandomGame());
    this.ui.loadCheckpointBtn.addEventListener('click', () => this.game.loadCheckpointGame());
    this.ui.selectLevelBtn.addEventListener('click', () => this.game.showMilestoneSelector());
    this.ui.rewindBtn.addEventListener('click', () => this.game.rewindToMilestone());
    this.ui.restartBtn.addEventListener('click', () => this.game.showStartMenu());
    this.ui.bestTimesBtn.addEventListener('click', () => this.game.showBestTimes());
    this.ui.quitBtn.addEventListener('click', () => this.game.showStartMenu());
    
    this.ui.closeBestTimesBtn.addEventListener('click', () => {
      this.ui.bestTimesScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
    });
    
    this.ui.shareTwitterBtn.addEventListener('click', () => {
      const bestTimes = this.game.checkpointManager.getBestTimes();
      const levels = Object.keys(bestTimes).map(Number);
      const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;
      const text = maxLevel > 0 
        ? `I just hacked my way to Level ${maxLevel} in Neon Blitz! ⚡ Think you can beat my time?`
        : `I'm playing Neon Blitz, an awesome cyberpunk hacking puzzle game! ⚡`;
      const url = window.location.href;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    });

    this.ui.closeMilestoneBtn.addEventListener('click', () => {
      this.ui.milestoneScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
    });
    
    this.ui.settingsBtn.addEventListener('click', () => this.game.menuController.showSettings());
    this.ui.closeSettingsBtn.addEventListener('click', () => {
      this.ui.settingsScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
    });
    
    this.ui.toggleMusicBtn.addEventListener('click', () => this.game.menuController.toggleMusic());
    this.ui.toggleSfxBtn.addEventListener('click', () => this.game.menuController.toggleSfx());
    this.ui.resetSettingsBtn.addEventListener('click', () => this.game.menuController.restoreDefaults());

    this.ui.musicVolumeSlider.addEventListener('input', /** @param {Event} e */ (e) => {
      this.game.menuController.setMusicVolume(parseFloat(/** @type {HTMLInputElement} */ (e.target).value));
    });

    this.ui.sfxVolumeSlider.addEventListener('input', /** @param {Event} e */ (e) => {
      this.game.menuController.setSfxVolume(parseFloat(/** @type {HTMLInputElement} */ (e.target).value));
      if (Date.now() - this.lastSfxPlayTime > 150) {
        if (this.game.settings.sfxEnabled) this.game.audio?.playSelect?.();
        this.lastSfxPlayTime = Date.now();
      }
    });
  }

  /**
   * Handles the initial boot sequence and interaction required to unlock the AudioContext.
   */
  start() {
    const initScreen = document.getElementById('initScreen');
    if (initScreen) {
      // iOS MUST use 'click' or 'touchend' to unlock Web Audio. 'pointerdown' is often blocked!
      initScreen.addEventListener('click', (e) => {
        // If the user double-taps rapidly, swallow the second tap so it doesn't bleed through
        // to the "Best Times" menu button underneath!
        if (initScreen.dataset.clicked === 'true') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        initScreen.dataset.clicked = 'true';

        this.game.audio?.init?.();
        this.game.audio?.resumeContext?.();
        
        // Setup the main menu behind the boot screen BEFORE it starts fading out
        this.game.showStartMenu();

        // Smooth fade out. Keeps the overlay active for 300ms as a physical shield against rapid taps.
        initScreen.style.opacity = '0';
        setTimeout(() => {
          initScreen.style.display = 'none';
        }, 300);
      });
    } else {
      this.game.showStartMenu();
    }
  }
}
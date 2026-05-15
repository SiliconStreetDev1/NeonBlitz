// @ts-check
/**
 * @fileoverview Core type definitions for the Neon Blitz game.
 */

/**
 * @typedef {Object} UIComponents
 * @property {HTMLElement} gridContainer
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} ctx
 * @property {HTMLElement} timerBar
 * @property {HTMLElement} levelDisplay
 * @property {HTMLElement} timeSpentDisplay
 * @property {HTMLElement} bestTimeDisplay
 * @property {HTMLElement} quitBtn
 * @property {HTMLElement} gameOverScreen
 * @property {HTMLElement} targetColorName
 * @property {HTMLElement} nextQueueDisplay
 * @property {HTMLElement} gameArea
 * @property {HTMLElement} startScreen
 * @property {HTMLElement} startNewBtn
 * @property {HTMLElement} loadCheckpointBtn
 * @property {HTMLElement} selectLevelBtn
 * @property {HTMLElement} rewindBtn
 * @property {HTMLElement} restartBtn
 * @property {HTMLElement} bestTimesBtn
 * @property {HTMLElement} bestTimesScreen
 * @property {HTMLElement} bestTimesList
 * @property {HTMLElement} shareTwitterBtn
 * @property {HTMLElement} closeBestTimesBtn
 * @property {HTMLElement} milestoneScreen
 * @property {HTMLElement} milestoneList
 * @property {HTMLElement} closeMilestoneBtn
 * @property {HTMLElement} hud
 * @property {HTMLElement} settingsBtn
 * @property {HTMLElement} settingsScreen
 * @property {HTMLElement} toggleMusicBtn
 * @property {HTMLElement} toggleSfxBtn
 * @property {HTMLInputElement} musicVolumeSlider
 * @property {HTMLInputElement} sfxVolumeSlider
 * @property {HTMLElement} resetSettingsBtn
 * @property {HTMLElement} closeSettingsBtn
 */

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} ColorInfo
 * @property {string} class
 * @property {string} name
 * @property {string} hex
 */

/**
 * @typedef {Object} TargetQueueItem
 * @property {ColorInfo} colorInfo
 * @property {Point[]} cells
 * @property {number} size
 * @property {number} difficulty
 */

/**
 * @typedef {TargetQueueItem[]} TargetQueue
 */

/**
 * @typedef {Object} EffectState
 * @property {number} baseSpeed
 * @property {number} beatPulse
 * @property {number} speedMultiplier
 */

/**
 * @typedef {Object} VFXPlugin
 * @property {function(): boolean} hasActiveParticles
 * @property {function(): void} clear
 * @property {function(number, boolean, HTMLCanvasElement, EffectState=): void} update
 * @property {function(CanvasRenderingContext2D, HTMLCanvasElement): void} render
 */

export default {};
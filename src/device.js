// @ts-check

/**
 * @fileoverview Device and input detection library.
 */

/**
 * Determines if the given pointer event was triggered by a physical mouse.
 * @param {PointerEvent} e - The pointer event.
 * @returns {boolean} True if the input device is a mouse.
 */
export function isMouse(e) {
  return e.pointerType === 'mouse';
}

/**
 * Determines if the current device has touch capabilities.
 * @returns {boolean} True if the device supports touch.
 */
export function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

/**
 * Attaches event listeners to prevent iOS Safari from zooming on double-tap or pinch.
 */
export function preventIOSZoom() {
  document.body.style.touchAction = 'none';

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      const target = /** @type {HTMLElement} */ (e.target);
      // Allow double taps on buttons/inputs to process normally (CSS touch-action handles zoom here)
      if (target && !target.closest('button') && !target.closest('input')) {
        e.preventDefault(); 
      }
    }
    lastTouchEnd = now;
  }, { passive: false });

  let lastTouchStart = 0;
  document.addEventListener('touchstart', (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const isFormElement = target && (target.closest('button') || target.closest('input'));

    if (e.touches && e.touches.length > 1) {
      if (!isFormElement) {
        e.preventDefault(); 
      }
    }
    const now = (new Date()).getTime();
    if (now - lastTouchStart <= 300) {
      if (!isFormElement) {
        e.preventDefault(); 
      }
    }
    lastTouchStart = now;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
}
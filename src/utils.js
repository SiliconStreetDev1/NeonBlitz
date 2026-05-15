// @ts-check

/**
 * Simple seeded PRNG (Mulberry32).
 * @param {number} seed - Seed value
 * @returns {() => number} A function that returns a pseudo-random number between 0 and 1.
 */
export function seededRandom(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Calculates the exact pixel center of a DOM element for drawing the canvas line.
 * @param {HTMLElement} el - The block element.
 * @returns {import('./types.js').Point} The precise X and Y center coordinate.
 */
export function getCenter(el) {
  return {
    x: el.offsetLeft + el.offsetWidth / 2,
    y: el.offsetTop + el.offsetHeight / 2
  };
}

/**
 * Forgiving Circular Hitbox: Finds the nearest block to your finger within a 24px radius.
 * This allows buttery-smooth diagonal swiping without accidentally hitting corners!
 * @param {number} x - The pointer X coordinate.
 * @param {number} y - The pointer Y coordinate.
 * @param {HTMLElement} [container=document.body] - The DOM container to scope the query.
 * @returns {HTMLElement | null} The closest block element, or null if none is close enough.
 */

/** @type {Array<{el: HTMLElement, cx: number, cy: number, minDim: number}> | null} */
let hitCache = null;
/** @type {number} */
let lastCacheTime = 0;

export function getBlockFromPoint(x, y, container = document.body) {
  const now = performance.now();
  // Invalidate cache every 50ms to allow layout changes to propagate while drastically reducing thrashing
  if (!hitCache || now - lastCacheTime > 50) {
    const nodes = container.querySelectorAll('.block:not(.empty)');
    hitCache = Array.from(nodes).map(node => {
      const el = /** @type {HTMLElement} */ (node);
      const rect = el.getBoundingClientRect();
      return { el, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, minDim: Math.min(rect.width, rect.height) };
    });
    lastCacheTime = now;
  }
  
  /** @type {HTMLElement | null} */
  let closest = null;
  let minDist = Infinity;
  
  let minBlockDimension = Infinity; // To store the smallest dimension of the closest block
  for (let i = 0; i < hitCache.length; i++) {
    const { el, cx, cy, minDim } = hitCache[i];
    let dist = Math.hypot(x - cx, y - cy);
    if (dist < minDist) {
      minDist = dist;
      closest = el;
      minBlockDimension = minDim;
    }
  }
  
  // To make connection easier and scale with block size:
  // If the pointer is within half the smallest dimension of the closest block from its center,
  // consider it a hit. This effectively means the pointer is "within" the block itself.
  if (closest && minDist < minBlockDimension / 2) {
    return closest;
  }
  return null;
}

/**
 * Checks if two blocks are immediately adjacent (Horizontal, Vertical, OR Diagonal).
 * @param {number} idx1 - The first block index.
 * @param {number} idx2 - The second block index.
 * @param {number} cols - The number of columns in the grid.
 * @returns {boolean} True if the blocks are adjacent to each other.
 */
export function isAdjacent(idx1, idx2, cols) {
  let x1 = idx1 % cols, y1 = Math.floor(idx1 / cols);
  let x2 = idx2 % cols, y2 = Math.floor(idx2 / cols);
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}
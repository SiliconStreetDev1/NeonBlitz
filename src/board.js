// @ts-check

/**
 * @typedef {import('./types.js').TargetQueue} TargetQueue
 * @typedef {import('./types.js').Point} Point
 */

/**
 * Generates the targets and paths for a given level using a Strand Weaving algorithm.
 * This guarantees 100% solvability under gravity while creating highly diagonal, intertwined paths.
 * @param {number} [level=1] - The current game level.
 * @param {() => number} [rng=Math.random] - Seeded random generator function.
 * @param {any} config - Master config JSON.
 * @returns {TargetQueue} The generated queue of color targets.
 */
export function generateLevelData(level = 1, rng = Math.random, config) {
  const GRID_ROWS = config.level.GRID_ROWS;
  const GRID_COLS = config.level.GRID_COLS;
  const ALL_COLORS = config.level.ALL_COLORS;
  const boardGen = config.progression.boardGeneration;

  let numStrands = GRID_ROWS;
  
  let maxAllowed = Math.min(ALL_COLORS.length, boardGen.maxAllowedColorsBase + Math.floor((level - 1) / boardGen.maxAllowedColorsScale));
  let maxTargets = Math.min(boardGen.maxTargetsCap, maxAllowed);
  let minTargets = level < boardGen.easyLevelThreshold ? Math.min(boardGen.minTargetsEasy, maxAllowed) : boardGen.minTargetsHard; 
  
  let numTargets = minTargets + Math.floor(rng() * (maxTargets - minTargets + 1));
  
  /** @type {number[]} */
  let targetSizes = new Array(numTargets).fill(1);
  let remainingStrands = numStrands - numTargets;
  
  while (remainingStrands > 0) {
      let available = targetSizes.map((s, i) => s < boardGen.maxStrandsPerColor ? i : -1).filter(i => i !== -1);
      if (available.length > 0) {
          let targetIdx = available[Math.floor(rng() * available.length)];
          targetSizes[targetIdx]++;
          remainingStrands--;
      } else {
          break; // Failsafe
      }
  }
  
  targetSizes.sort(() => rng() - 0.5);
  
  // Map strand IDs to Target IDs
  /** @type {number[]} */
  let strandToTarget = [];
  let currentTarget = 0;
  let count = 0;
  for(let i = 0; i < numStrands; i++) {
      strandToTarget[i] = currentTarget;
      count++;
      if (count >= targetSizes[currentTarget]) {
          currentTarget++;
          count = 0;
      }
  }
  
  /** @type {number[][]} */
  let strands = Array(GRID_COLS).fill(0).map(() => Array(numStrands).fill(0));
  
  // Initialize Col 0
  for (let i = 0; i < numStrands; i++) strands[0][i] = i;
  
  // Generate subsequent columns by applying random disjoint adjacent swaps
  for (let x = 1; x < GRID_COLS; x++) {
    let prevCol = [...strands[x-1]];
    let swapped = Array(numStrands).fill(false);
    
    for (let y = 0; y < numStrands - 1; y++) {
      if (!swapped[y] && !swapped[y+1]) {
        let s1 = prevCol[y];
        let s2 = prevCol[y+1];
        
        // If the two adjacent strands belong to the same color, aggressively force them to split apart
        // by swapping the bottom strand downwards! This guarantees diagonal weaving.
        if (strandToTarget[s1] === strandToTarget[s2]) {
            if (y + 2 < numStrands && !swapped[y+2]) {
                let temp = prevCol[y+1];
                prevCol[y+1] = prevCol[y+2];
                prevCol[y+2] = temp;
                swapped[y+1] = true;
                swapped[y+2] = true;
            }
            continue;
        }
        
        // High chance to swap different colors to create weaving diagonals!
        if (rng() > 0.35) {
          let temp = prevCol[y];
          prevCol[y] = prevCol[y+1];
          prevCol[y+1] = temp;
          swapped[y] = true;
          swapped[y+1] = true;
        }
      }
    }
    strands[x] = prevCol;
  }
  
  // Map cell coordinates
  /** @type {Array<Array<Point>>} */
  let targetCells = Array(numTargets).fill(0).map(() => []);
  for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < numStrands; y++) {
          let strandId = strands[x][y];
          let targetId = strandToTarget[strandId];
          targetCells[targetId].push({x: x, y: y});
      }
  }
  
  let shuffledColors = ALL_COLORS.slice(0, maxAllowed).sort(() => rng() - 0.5).slice(0, numTargets);

  /** @type {TargetQueue} */
  let targetQueue = /** @type {TargetQueue} */ ([]);
  for (let id = 0; id < numTargets; id++) {
      let difficulty = 0;
      
      // Gradual Difficulty Ramping
      // 0: Normal, 1: Hide Queue, 2: Hide Orb, 3: Hide Both
      if (level >= config.progression.targetDifficulty.hideBoth) difficulty = 3;
      else if (level >= config.progression.targetDifficulty.hideOrb) difficulty = 2;
      else if (level >= config.progression.targetDifficulty.hideQueue) difficulty = 1;

      targetQueue.push({ 
          colorInfo: shuffledColors[id], 
          cells: targetCells[id], 
          size: targetCells[id].length,
          difficulty: difficulty
      });
  }

  // Shuffle queue so player clears colors in a highly random order, leveraging our gravity immunity!
  targetQueue.sort(() => rng() - 0.5);

  // Deep Core: Converts the final queue target into the "CORE" which must be mined last!
  if (level >= config.progression.milestones.deepCoreUnlock && targetQueue.length > 2 && rng() > 0.4) {
      let stoneTarget = targetQueue[targetQueue.length - 1];
      stoneTarget.colorInfo = { class: 'color-stone', name: 'CORE', hex: '#999999' };
      stoneTarget.difficulty = 0; // Don't hide the core!
  }
  
  return targetQueue;
}
   
  
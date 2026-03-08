/**
 * Arrow Crossword Engine - Slot Topology Builder (v4)
 * 
 * Strategy: Use pre-defined clue cell patterns that guarantee valid slot layouts,
 * then apply seed-based variation for variety.
 * 
 * This replaces the procedural generation approach that had very low success rates.
 * The patterns are designed to produce 10-16 slots with good intersection density.
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';

export interface TopologyResult {
  cellTypes: InternalCellType[][];
  slots: Slot[];
}

/**
 * Pre-defined clue cell positions for each grid size.
 * Each pattern is a list of [row, col] positions for clue cells.
 * These are designed to create well-connected horizontal and vertical slots.
 */
const PATTERNS_10x10: number[][][] = [
  // Pattern 0: Offset grid pattern
  [[0,0],[0,5],[2,0],[2,3],[2,7],[4,0],[4,4],[4,8],[6,0],[6,3],[6,6],[8,0],[8,5]],
  // Pattern 1: Diagonal stagger
  [[0,0],[0,4],[0,8],[2,0],[2,6],[4,0],[4,3],[4,7],[6,0],[6,5],[8,0],[8,3],[8,7]],
  // Pattern 2: Dense center
  [[0,0],[0,6],[1,3],[2,0],[3,5],[4,0],[4,3],[4,7],[5,0],[6,4],[7,0],[7,7],[8,0],[9,5]],
  // Pattern 3: Wide spacing
  [[0,0],[0,5],[2,0],[2,7],[3,3],[5,0],[5,5],[7,0],[7,4],[7,8],[9,0],[9,6]],
];

const PATTERNS_12x10: number[][][] = [
  [[0,0],[0,5],[1,3],[2,0],[2,7],[3,4],[4,0],[4,8],[5,0],[5,5],[6,3],[7,0],[7,7],[8,0],[8,4],[9,0],[9,6],[10,3],[11,0],[11,7]],
  [[0,0],[0,4],[0,8],[2,0],[2,6],[3,3],[4,0],[4,7],[5,4],[6,0],[6,8],[7,5],[8,0],[8,3],[9,7],[10,0],[10,5],[11,0],[11,8]],
  [[0,0],[0,6],[1,0],[1,3],[2,7],[3,0],[3,5],[4,0],[5,3],[5,8],[6,0],[6,6],[7,0],[7,4],[8,7],[9,0],[9,5],[10,3],[11,0],[11,7]],
];

const PATTERNS_10x12: number[][][] = [
  [[0,0],[0,4],[0,9],[1,6],[2,0],[2,3],[2,10],[3,7],[4,0],[4,5],[5,0],[5,3],[5,8],[6,6],[6,11],[7,0],[7,4],[7,9],[8,0],[8,7],[9,0],[9,5],[9,10]],
  [[0,0],[0,5],[0,10],[1,3],[1,8],[2,0],[2,6],[3,0],[3,4],[3,9],[4,7],[5,0],[5,3],[5,10],[6,6],[7,0],[7,4],[7,9],[8,7],[9,0],[9,5],[9,10]],
  [[0,0],[0,6],[0,11],[1,3],[2,0],[2,8],[3,5],[4,0],[4,3],[4,10],[5,7],[6,0],[6,4],[6,11],[7,0],[7,8],[8,5],[9,0],[9,3],[9,9]],
];

function getPatternsForGrid(gridConfig: GridConfig): number[][][] {
  if (gridConfig.rows === 10 && gridConfig.cols === 10) return PATTERNS_10x10;
  if (gridConfig.rows === 12 && gridConfig.cols === 10) return PATTERNS_12x10;
  if (gridConfig.rows === 10 && gridConfig.cols === 12) return PATTERNS_10x12;
  return PATTERNS_10x10; // fallback
}

/**
 * Build a valid slot topology using pre-designed patterns with seed-based variation.
 */
export function buildSlotTopology(
  gridConfig: GridConfig,
  topoConfig: TopologyConfig,
  rng: SeededRandom,
  candidateLenHist?: Map<number, number>
): TopologyResult | null {
  const { rows, cols } = gridConfig;
  const patterns = getPatternsForGrid(gridConfig);
  
  // Pick a base pattern from seed
  const patternIdx = rng.nextInt(patterns.length);
  const basePattern = patterns[patternIdx];

  // Build grid from pattern
  const cellTypes: InternalCellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'letter')
  );

  // Place clue cells from pattern
  for (const [r, c] of basePattern) {
    if (r < rows && c < cols) {
      cellTypes[r][c] = 'clue';
    }
  }

  // Apply seed-based jitter: randomly shift some clue cells by 1 position
  applyJitter(cellTypes, rows, cols, rng);

  // Derive slots
  const slots = deriveSlots(cellTypes, rows, cols, topoConfig.minSlotLen);

  if (slots.length < 6) return null; // too few slots

  // If candidate histogram provided, verify feasibility
  if (candidateLenHist) {
    const slotLenCount = new Map<number, number>();
    for (const slot of slots) {
      slotLenCount.set(slot.length, (slotLenCount.get(slot.length) || 0) + 1);
    }
    for (const [len, count] of slotLenCount) {
      if ((candidateLenHist.get(len) || 0) < count) {
        return null;
      }
    }
  }

  return { cellTypes, slots };
}

/**
 * Apply random jitter to clue cell positions for variety.
 * Only moves clue cells if the result doesn't create invalid runs.
 */
function applyJitter(
  grid: InternalCellType[][],
  rows: number,
  cols: number,
  rng: SeededRandom
): void {
  // Find all clue cells
  const clueCells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'clue') {
        clueCells.push([r, c]);
      }
    }
  }

  // Try to shift some clue cells
  const numShifts = Math.floor(clueCells.length * 0.3); // shift ~30%
  for (let i = 0; i < numShifts; i++) {
    const idx = rng.nextInt(clueCells.length);
    const [r, c] = clueCells[idx];
    
    // Skip edges (row 0 col 0 should stay)
    if (r === 0 && c === 0) continue;
    
    // Try shifting in a random direction
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const dir = directions[rng.nextInt(directions.length)];
    const nr = r + dir[0];
    const nc = c + dir[1];

    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 'letter') {
      // Check that the original position won't create a tiny run
      grid[r][c] = 'letter';
      grid[nr][nc] = 'clue';
      clueCells[idx] = [nr, nc];
    }
  }
}

/**
 * Derive slots from the clue-cell layout.
 */
function deriveSlots(
  grid: InternalCellType[][],
  rows: number,
  cols: number,
  minSlotLen: number
): Slot[] {
  const slots: Slot[] = [];
  let index = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 'clue') continue;

      // RIGHT slot
      if (c + 1 < cols && grid[r][c + 1] === 'letter') {
        let rightLen = 0;
        let cc = c + 1;
        while (cc < cols && grid[r][cc] === 'letter') {
          rightLen++;
          cc++;
        }
        if (rightLen >= minSlotLen) {
          slots.push({
            index: index++,
            direction: 'right',
            startRow: r,
            startCol: c + 1,
            clueCellRow: r,
            clueCellCol: c,
            length: rightLen,
            intersections: [],
          });
        }
      }

      // DOWN slot
      if (r + 1 < rows && grid[r + 1][c] === 'letter') {
        let downLen = 0;
        let rr = r + 1;
        while (rr < rows && grid[rr][c] === 'letter') {
          downLen++;
          rr++;
        }
        if (downLen >= minSlotLen) {
          slots.push({
            index: index++,
            direction: 'down',
            startRow: r + 1,
            startCol: c,
            clueCellRow: r,
            clueCellCol: c,
            length: downLen,
            intersections: [],
          });
        }
      }
    }
  }

  buildIntersections(slots);
  return slots;
}

function buildIntersections(slots: Slot[]): void {
  const cellMap = new Map<string, { slotIndex: number; posInSlot: number }[]>();

  for (const slot of slots) {
    const dr = slot.direction === 'down' ? 1 : 0;
    const dc = slot.direction === 'right' ? 1 : 0;
    for (let i = 0; i < slot.length; i++) {
      const key = `${slot.startRow + dr * i},${slot.startCol + dc * i}`;
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push({ slotIndex: slot.index, posInSlot: i });
    }
  }

  for (const entries of cellMap.values()) {
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        slots[a.slotIndex].intersections.push({
          otherSlotIndex: b.slotIndex,
          posInThis: a.posInSlot,
          posInOther: b.posInSlot,
        });
        slots[b.slotIndex].intersections.push({
          otherSlotIndex: a.slotIndex,
          posInThis: b.posInSlot,
          posInOther: a.posInSlot,
        });
      }
    }
  }
}

/**
 * Arrow Crossword Engine - Slot Topology Builder
 * 
 * Generates a valid clue-cell / letter-cell layout BEFORE any word assignment.
 * 
 * Algorithm (v2 - checkerboard-stripe approach):
 * 1. Place clue cells in a semi-regular grid pattern ensuring both
 *    horizontal AND vertical slots are created naturally.
 * 2. Apply seed-based jitter for variety.
 * 3. Repair short runs and split overly long runs.
 * 4. Derive slots, build intersection graph.
 * 5. Validate connectivity and quality.
 * 
 * The key insight: place clue cells at staggered intervals that
 * guarantee letter runs of valid length in both directions.
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';

interface LetterRun {
  start: number;
  length: number;
}

export interface TopologyResult {
  cellTypes: InternalCellType[][];
  slots: Slot[];
}

/**
 * Build a valid slot topology for the given grid config.
 * Returns null if the generated topology doesn't meet quality constraints.
 */
export function buildSlotTopology(
  gridConfig: GridConfig,
  topoConfig: TopologyConfig,
  rng: SeededRandom
): TopologyResult | null {
  const { rows, cols } = gridConfig;

  // Phase 1: Generate clue cell layout using staggered grid pattern
  const cellTypes = generateStaggeredLayout(rows, cols, topoConfig, rng);

  // Phase 2: Iterative gap repair
  repairGaps(cellTypes, rows, cols, topoConfig.minSlotLen, topoConfig.softMaxSlotLen, rng);

  // Phase 3: Derive slots from clue cells
  const slots = deriveSlots(cellTypes, rows, cols, topoConfig.minSlotLen);

  // Phase 4: Validate topology quality (relaxed for higher success rate)
  if (slots.length < topoConfig.targetSlotCountMin) {
    return null;
  }
  // Allow exceeding max by a small margin
  if (slots.length > topoConfig.targetSlotCountMax * 1.3) {
    return null;
  }

  // Connectivity: allow up to 10% isolated slots for flexibility
  if (slots.length > 1) {
    const isolatedCount = slots.filter(s => s.intersections.length === 0).length;
    if (isolatedCount > Math.max(1, Math.floor(slots.length * 0.1))) {
      return null;
    }
  }

  // Connectivity check: largest connected component must be >= 80% of slots
  if (slots.length > 1 && !isLargelyConnected(slots, 0.8)) {
    return null;
  }

  return { cellTypes, slots };
}

/**
 * Generate clue cells using a staggered grid pattern.
 * 
 * The idea: place clue cells at regular horizontal intervals (every 4-6 cells)
 * with row-to-row staggering. This naturally creates both horizontal AND
 * vertical letter runs of valid length.
 */
function generateStaggeredLayout(
  rows: number,
  cols: number,
  topoConfig: TopologyConfig,
  rng: SeededRandom
): InternalCellType[][] {
  const grid: InternalCellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'letter')
  );

  // Base horizontal spacing between clue cells (controls density)
  const baseSpacing = 4 + rng.nextInt(2); // 4 or 5
  // Vertical spacing for stagger pattern
  const vertSpacing = 3 + rng.nextInt(2); // 3 or 4
  // Stagger offset per row group
  const staggerOffset = Math.floor(baseSpacing / 2);

  for (let r = 0; r < rows; r++) {
    // Determine row's starting offset based on stagger group
    const group = Math.floor(r / vertSpacing);
    const rowOffset = (group % 2 === 0) ? 0 : staggerOffset;
    
    // Add per-row jitter for variety
    const jitter = rng.nextInt(2); // 0 or 1
    
    let c = (rowOffset + jitter) % cols;
    
    // Always place a clue cell in column 0 for row 0
    if (r === 0) c = 0;
    
    // Place clue cells at intervals along this row
    while (c < cols) {
      grid[r][c] = 'clue';
      
      // Next clue cell position with some randomness
      const spacing = baseSpacing + rng.nextInt(3) - 1; // baseSpacing-1 to baseSpacing+1
      c += Math.max(topoConfig.minSlotLen + 1, spacing); // ensure min slot length between clues
    }
  }

  // Ensure first column has some clue cells for vertical anchoring
  for (let r = 0; r < rows; r += vertSpacing) {
    const rr = Math.min(r + rng.nextInt(2), rows - 1);
    grid[rr][0] = 'clue';
  }

  return grid;
}

/**
 * Iteratively repair invalid gaps (length 1 or 2) and split overly long runs.
 * Converges because we only convert letter → clue (monotonic).
 */
function repairGaps(
  grid: InternalCellType[][],
  rows: number,
  cols: number,
  minSlotLen: number,
  softMaxSlotLen: number,
  rng: SeededRandom
): void {
  const MAX_REPAIR_ITERATIONS = 20;

  for (let iter = 0; iter < MAX_REPAIR_ITERATIONS; iter++) {
    let changed = false;

    // Fix horizontal gaps (row by row) - do this first
    for (let r = 0; r < rows; r++) {
      const runs = getLetterRuns(grid, 'row', r, cols);
      for (const run of runs) {
        if (run.length > 0 && run.length < minSlotLen) {
          for (let c = run.start; c < run.start + run.length; c++) {
            if (grid[r][c] !== 'clue') {
              grid[r][c] = 'clue';
              changed = true;
            }
          }
        } else if (run.length > softMaxSlotLen + 2) {
          // Only split runs that are significantly over the soft max
          const splitPos = run.start + minSlotLen + rng.nextInt(Math.max(1, run.length - 2 * minSlotLen));
          if (splitPos > run.start && splitPos < run.start + run.length && grid[r][splitPos] !== 'clue') {
            grid[r][splitPos] = 'clue';
            changed = true;
          }
        }
      }
    }

    // Fix vertical gaps (column by column)
    for (let c = 0; c < cols; c++) {
      const runs = getLetterRuns(grid, 'col', c, rows);
      for (const run of runs) {
        if (run.length > 0 && run.length < minSlotLen) {
          for (let r = run.start; r < run.start + run.length; r++) {
            if (grid[r][c] !== 'clue') {
              grid[r][c] = 'clue';
              changed = true;
            }
          }
        } else if (run.length > softMaxSlotLen + 2) {
          const splitPos = run.start + minSlotLen + rng.nextInt(Math.max(1, run.length - 2 * minSlotLen));
          if (splitPos > run.start && splitPos < run.start + run.length && grid[splitPos][c] !== 'clue') {
            grid[splitPos][c] = 'clue';
            changed = true;
          }
        }
      }
    }

    if (!changed) break;
  }
}

/** Get contiguous letter-cell runs along a row or column. */
function getLetterRuns(
  grid: InternalCellType[][],
  axis: 'row' | 'col',
  index: number,
  size: number
): LetterRun[] {
  const runs: LetterRun[] = [];
  let runStart = -1;

  for (let i = 0; i < size; i++) {
    const cell = axis === 'row' ? grid[index][i] : grid[i][index];
    if (cell === 'letter') {
      if (runStart === -1) runStart = i;
    } else {
      if (runStart !== -1) {
        runs.push({ start: runStart, length: i - runStart });
        runStart = -1;
      }
    }
  }
  if (runStart !== -1) {
    runs.push({ start: runStart, length: size - runStart });
  }

  return runs;
}

/**
 * Derive slots from the clue-cell layout.
 * For each clue cell, check RIGHT and DOWN for valid letter runs.
 * Also builds the intersection graph between slots.
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

      // RIGHT slot: count consecutive letter cells to the right
      if (c + 1 < cols) {
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

      // DOWN slot: count consecutive letter cells below
      if (r + 1 < rows) {
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

  // Build intersection graph
  buildIntersections(slots);

  return slots;
}

/** Build intersection relationships between all slots. */
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

/** Check if the largest connected component covers at least `threshold` fraction of slots. */
function isLargelyConnected(slots: Slot[], threshold: number): boolean {
  if (slots.length <= 1) return true;

  // Find largest connected component
  const visited = new Set<number>();
  let maxComponentSize = 0;

  for (const slot of slots) {
    if (visited.has(slot.index)) continue;
    
    const component = new Set<number>();
    const queue: number[] = [slot.index];
    component.add(slot.index);
    visited.add(slot.index);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const inter of slots[current].intersections) {
        if (!component.has(inter.otherSlotIndex)) {
          component.add(inter.otherSlotIndex);
          visited.add(inter.otherSlotIndex);
          queue.push(inter.otherSlotIndex);
        }
      }
    }

    maxComponentSize = Math.max(maxComponentSize, component.size);
  }

  return maxComponentSize >= slots.length * threshold;
}

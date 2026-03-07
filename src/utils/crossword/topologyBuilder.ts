/**
 * Arrow Crossword Engine - Slot Topology Builder
 * 
 * Generates a valid clue-cell / letter-cell layout BEFORE any word assignment.
 * This is the core differentiator from standard crossword generators:
 * slots are intentionally designed, not derived from placed words.
 * 
 * Algorithm:
 * 1. Row-by-row clue cell placement with seed-based variation
 * 2. Iterative gap repair (no runs of length 1 or 2; split overly long runs)
 * 3. Slot derivation from clue cells (RIGHT and DOWN)
 * 4. Intersection graph construction
 * 5. Connectivity and quality validation
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';
import { SLOT_LEN_MIN, SLOT_LEN_RANGE } from './config';

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

  // Phase 1: Generate initial cell layout (row-by-row clue placement)
  const cellTypes = generateCellLayout(rows, cols, topoConfig, rng);

  // Phase 2: Iterative gap repair
  repairGaps(cellTypes, rows, cols, topoConfig.minSlotLen, topoConfig.softMaxSlotLen, rng);

  // Phase 3: Derive slots from clue cells
  const slots = deriveSlots(cellTypes, rows, cols, topoConfig.minSlotLen);

  // Phase 4: Validate topology quality
  if (slots.length < topoConfig.targetSlotCountMin || slots.length > topoConfig.targetSlotCountMax) {
    return null;
  }

  if (slots.length > 1 && !isConnected(slots)) {
    return null;
  }

  // Reject if any slot is isolated (no intersections) when multiple slots exist
  if (slots.length > 1 && slots.some(s => s.intersections.length === 0)) {
    return null;
  }

  // Reject if orphan letter cells exist (letter not in any slot)
  if (hasOrphanLetterCells(cellTypes, slots, rows, cols)) {
    return null;
  }

  return { cellTypes, slots };
}

/**
 * Place clue cells row by row with seed-based offset variation.
 * Each row is partitioned into segments: [clue, letters..., clue, letters..., ...]
 */
function generateCellLayout(
  rows: number,
  cols: number,
  topoConfig: TopologyConfig,
  rng: SeededRandom
): InternalCellType[][] {
  const grid: InternalCellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'letter')
  );

  for (let r = 0; r < rows; r++) {
    // Row 0: always start at col 0 to anchor the puzzle
    // Other rows: offset 0-2 for variation (creates vertical slot opportunities)
    let offset = 0;
    if (r > 0 && rng.next() < 0.35) {
      offset = 1 + rng.nextInt(2); // 1 or 2
    }

    let c = Math.min(offset, cols - 1);
    grid[r][c] = 'clue';
    c++;

    while (c < cols) {
      const slotLen = SLOT_LEN_MIN + rng.nextInt(SLOT_LEN_RANGE); // 3..7
      const nextClue = c + slotLen;

      if (nextClue >= cols) {
        // Check remaining space
        const remaining = cols - c;
        if (remaining > 0 && remaining < topoConfig.minSlotLen) {
          // Too short for a valid slot → convert to clue cells
          for (let i = c; i < cols; i++) {
            grid[r][i] = 'clue';
          }
        }
        // else: remaining cells form a valid slot to the edge
        break;
      }

      grid[r][nextClue] = 'clue';
      c = nextClue + 1;
    }
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
  const MAX_REPAIR_ITERATIONS = 30;

  for (let iter = 0; iter < MAX_REPAIR_ITERATIONS; iter++) {
    let changed = false;

    // Fix vertical gaps (column by column)
    for (let c = 0; c < cols; c++) {
      const runs = getLetterRuns(grid, 'col', c, rows);
      for (const run of runs) {
        if (run.length > 0 && run.length < minSlotLen) {
          // Invalid short gap → convert all to clue
          for (let r = run.start; r < run.start + run.length; r++) {
            if (grid[r][c] !== 'clue') {
              grid[r][c] = 'clue';
              changed = true;
            }
          }
        } else if (run.length > softMaxSlotLen) {
          // Split long run to control slot length
          const splitMin = run.start + minSlotLen;
          const splitMax = run.start + run.length - minSlotLen;
          if (splitMax >= splitMin) {
            const splitPos = splitMin + rng.nextInt(Math.max(1, splitMax - splitMin + 1));
            if (grid[splitPos][c] !== 'clue') {
              grid[splitPos][c] = 'clue';
              changed = true;
            }
          }
        }
      }
    }

    // Fix horizontal gaps (row by row)
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
        } else if (run.length > softMaxSlotLen) {
          const splitMin = run.start + minSlotLen;
          const splitMax = run.start + run.length - minSlotLen;
          if (splitMax >= splitMin) {
            const splitPos = splitMin + rng.nextInt(Math.max(1, splitMax - splitMin + 1));
            if (grid[r][splitPos] !== 'clue') {
              grid[r][splitPos] = 'clue';
              changed = true;
            }
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

      // DOWN slot: count consecutive letter cells below
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

  // Build intersection graph
  buildIntersections(slots);

  return slots;
}

/** Build intersection relationships between all slots. */
function buildIntersections(slots: Slot[]): void {
  // Map each (row, col) to the slots passing through it
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

  // For each cell shared by multiple slots, create intersection links
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

/** Check if all slots form a connected graph via intersections. */
function isConnected(slots: Slot[]): boolean {
  if (slots.length <= 1) return true;

  const visited = new Set<number>();
  const queue: number[] = [slots[0].index];
  visited.add(slots[0].index);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const inter of slots[current].intersections) {
      if (!visited.has(inter.otherSlotIndex)) {
        visited.add(inter.otherSlotIndex);
        queue.push(inter.otherSlotIndex);
      }
    }
  }

  return visited.size === slots.length;
}

/** Check for letter cells not belonging to any slot. */
function hasOrphanLetterCells(
  cellTypes: InternalCellType[][],
  slots: Slot[],
  rows: number,
  cols: number
): boolean {
  const slotCells = new Set<string>();
  for (const slot of slots) {
    const dr = slot.direction === 'down' ? 1 : 0;
    const dc = slot.direction === 'right' ? 1 : 0;
    for (let i = 0; i < slot.length; i++) {
      slotCells.add(`${slot.startRow + dr * i},${slot.startCol + dc * i}`);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cellTypes[r][c] === 'letter' && !slotCells.has(`${r},${c}`)) {
        return true;
      }
    }
  }
  return false;
}

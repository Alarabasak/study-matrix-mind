/**
 * Arrow Crossword Engine - Slot Topology Builder (v5)
 * 
 * Uses simple row-based patterns that create mostly horizontal slots
 * with controlled vertical crossings. Optimized for small candidate pools (50-150 words).
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';

export interface TopologyResult {
  cellTypes: InternalCellType[][];
  slots: Slot[];
}

/**
 * Build a valid slot topology for the given grid config.
 */
export function buildSlotTopology(
  gridConfig: GridConfig,
  topoConfig: TopologyConfig,
  rng: SeededRandom,
  candidateLenHist?: Map<number, number>
): TopologyResult | null {
  const { rows, cols } = gridConfig;

  // Start with all letter cells
  const grid: InternalCellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'letter')
  );

  // Get available word lengths
  const availLens = candidateLenHist
    ? [...candidateLenHist.entries()].filter(([l, c]) => l >= 3 && c > 0).map(([l]) => l).sort((a, b) => a - b)
    : [3, 4, 5, 6, 7];

  if (availLens.length === 0) return null;

  // Phase 1: Place horizontal slots on alternating rows
  const hSlots: { row: number; clueCol: number; len: number }[] = [];
  const rowStep = 2; // every other row gets horizontal slots

  for (let r = 0; r < rows; r += rowStep) {
    let c = 0;
    while (c < cols) {
      // Place clue cell
      grid[r][c] = 'clue';

      // Pick a length that fits and has candidates
      const maxFit = Math.min(cols - c - 1, Math.max(...availLens));
      const validLens = availLens.filter(l => l <= maxFit);
      if (validLens.length === 0) { c++; continue; }

      const len = validLens[rng.nextInt(validLens.length)];

      // Ensure letter cells for this slot
      for (let i = 1; i <= len; i++) {
        if (c + i < cols) grid[r][c + i] = 'letter';
      }

      hSlots.push({ row: r, clueCol: c, len });
      c += len + 1;
    }
  }

  // Phase 2: Add a few vertical slots by placing clue cells on non-slot rows
  const vCols = rng.shuffle([...Array(cols).keys()]);
  let vCount = 0;
  const maxVertical = Math.min(4 + rng.nextInt(3), Math.floor(hSlots.length * 0.5));

  for (const vc of vCols) {
    if (vCount >= maxVertical) break;

    // Find a row where we can place a clue cell for a downward slot
    for (let tryR = 0; tryR < rows - 3; tryR++) {
      if (grid[tryR][vc] !== 'letter') {
        // This cell is already a clue - can it anchor a down slot?
        if (grid[tryR][vc] === 'clue') {
          let downLen = 0;
          let rr = tryR + 1;
          while (rr < rows && grid[rr][vc] === 'letter') { downLen++; rr++; }

          if (downLen >= 3 && availLens.includes(downLen)) {
            vCount++;
            break;
          }
          // Try trimming to a valid length
          const validDown = availLens.filter(l => l <= downLen);
          if (validDown.length > 0) {
            const chosenLen = validDown[rng.nextInt(validDown.length)];
            // Add a clue cell to terminate the slot at the right length
            if (tryR + 1 + chosenLen < rows) {
              grid[tryR + 1 + chosenLen][vc] = 'clue';
            }
            vCount++;
            break;
          }
        }
        continue;
      }

      // This is a letter cell - turn it into a clue for a vertical slot
      let downLen = 0;
      let rr = tryR + 1;
      while (rr < rows && grid[rr][vc] === 'letter') { downLen++; rr++; }

      if (downLen < 3) continue;

      const validDown = availLens.filter(l => l <= downLen);
      if (validDown.length === 0) continue;

      grid[tryR][vc] = 'clue';
      const chosenLen = validDown[rng.nextInt(validDown.length)];
      if (tryR + 1 + chosenLen < rows && grid[tryR + 1 + chosenLen][vc] === 'letter') {
        grid[tryR + 1 + chosenLen][vc] = 'clue';
      }
      vCount++;
      break;
    }
  }

  // Phase 3: Convert remaining unused cells to clue (cells not part of any slot)
  // Don't touch cells that are part of horizontal slots

  // Derive slots
  const slots = deriveSlots(grid, rows, cols, topoConfig.minSlotLen);

  if (slots.length < 6) return null;
  if (slots.length > topoConfig.targetSlotCountMax * 2) return null;

  // Feasibility check
  if (candidateLenHist) {
    const slotLenCount = new Map<number, number>();
    for (const slot of slots) {
      slotLenCount.set(slot.length, (slotLenCount.get(slot.length) || 0) + 1);
    }
    for (const [len, count] of slotLenCount) {
      if ((candidateLenHist.get(len) || 0) < count) return null;
    }
  }

  return { cellTypes: grid, slots };
}

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
        let len = 0;
        let cc = c + 1;
        while (cc < cols && grid[r][cc] === 'letter') { len++; cc++; }
        if (len >= minSlotLen) {
          slots.push({
            index: index++, direction: 'right',
            startRow: r, startCol: c + 1,
            clueCellRow: r, clueCellCol: c,
            length: len, intersections: [],
          });
        }
      }

      // DOWN slot
      if (r + 1 < rows && grid[r + 1][c] === 'letter') {
        let len = 0;
        let rr = r + 1;
        while (rr < rows && grid[rr][c] === 'letter') { len++; rr++; }
        if (len >= minSlotLen) {
          slots.push({
            index: index++, direction: 'down',
            startRow: r + 1, startCol: c,
            clueCellRow: r, clueCellCol: c,
            length: len, intersections: [],
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
          otherSlotIndex: b.slotIndex, posInThis: a.posInSlot, posInOther: b.posInSlot,
        });
        slots[b.slotIndex].intersections.push({
          otherSlotIndex: a.slotIndex, posInThis: b.posInSlot, posInOther: a.posInSlot,
        });
      }
    }
  }
}

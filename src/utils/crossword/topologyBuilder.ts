/**
 * Arrow Crossword Engine - Slot Topology Builder (v3)
 * 
 * Candidate-aware topology generation:
 * 1. Sample target slot lengths from the actual candidate length histogram
 * 2. Place horizontal slots row-by-row with clue cells as anchors
 * 3. Derive vertical slots from the resulting column structure
 * 4. Build intersection graph
 * 5. Validate connectivity
 * 
 * This ensures the generated topology always matches the available word pool.
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';

export interface TopologyResult {
  cellTypes: InternalCellType[][];
  slots: Slot[];
}

/**
 * Build a valid slot topology for the given grid config.
 * candidateLenHist maps word-length → count of available candidates.
 */
export function buildSlotTopology(
  gridConfig: GridConfig,
  topoConfig: TopologyConfig,
  rng: SeededRandom,
  candidateLenHist?: Map<number, number>
): TopologyResult | null {
  const { rows, cols } = gridConfig;

  // Phase 1: Build grid by placing horizontal slots with known-good lengths
  const cellTypes = createEmptyGrid(rows, cols);
  
  // Determine what slot lengths are available
  const availableLengths = getAvailableLengths(topoConfig, candidateLenHist);
  if (availableLengths.length === 0) return null;

  // Phase 2: Place horizontal slots row by row
  placeHorizontalSlots(cellTypes, rows, cols, availableLengths, topoConfig, rng);

  // Phase 3: Ensure some vertical anchoring by adding clue cells in strategic column positions
  addVerticalAnchors(cellTypes, rows, cols, topoConfig.minSlotLen, rng);

  // Phase 4: Convert remaining 'empty' cells to 'clue' (unused space becomes clue/block)
  finalizeGrid(cellTypes, rows, cols);

  // Phase 5: Derive slots from clue cells
  const slots = deriveSlots(cellTypes, rows, cols, topoConfig.minSlotLen);

  // Phase 6: Validate
  if (slots.length < topoConfig.targetSlotCountMin) return null;
  if (slots.length > topoConfig.targetSlotCountMax * 1.5) return null;

  // Filter out slots with no candidates (if histogram provided)
  if (candidateLenHist) {
    for (const slot of slots) {
      if (!candidateLenHist.has(slot.length) || candidateLenHist.get(slot.length)! === 0) {
        return null; // This topology has an unsatisfiable slot
      }
    }
  }

  // Connectivity: allow some isolated slots
  if (slots.length > 1) {
    const isolatedCount = slots.filter(s => s.intersections.length === 0).length;
    if (isolatedCount > Math.max(2, Math.floor(slots.length * 0.2))) {
      return null;
    }
  }

  if (slots.length > 2 && !isLargelyConnected(slots, 0.6)) {
    return null;
  }

  return { cellTypes, slots };
}

function createEmptyGrid(rows: number, cols: number): InternalCellType[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'empty')
  );
}

/**
 * Get available slot lengths from candidate histogram, 
 * filtered by topology config constraints.
 */
function getAvailableLengths(
  topoConfig: TopologyConfig,
  hist?: Map<number, number>
): number[] {
  if (!hist) {
    // Fallback: allow all lengths in range
    const lengths: number[] = [];
    for (let l = topoConfig.minSlotLen; l <= topoConfig.softMaxSlotLen; l++) {
      lengths.push(l);
    }
    return lengths;
  }

  const lengths: number[] = [];
  for (const [len, count] of hist) {
    if (len >= topoConfig.minSlotLen && len <= 15 && count > 0) {
      lengths.push(len);
    }
  }
  return lengths.sort((a, b) => a - b);
}

/**
 * Place horizontal slots row by row.
 * Each row gets 1-3 horizontal slots with clue cells as anchors.
 */
function placeHorizontalSlots(
  grid: InternalCellType[][],
  rows: number,
  cols: number,
  availableLengths: number[],
  topoConfig: TopologyConfig,
  rng: SeededRandom
): void {
  // Skip some rows to leave room for vertical slots
  const rowStep = 2 + rng.nextInt(2); // 2 or 3 rows apart

  for (let r = 0; r < rows; r += rowStep) {
    let c = 0;

    while (c < cols - topoConfig.minSlotLen) {
      // Place a clue cell
      grid[r][c] = 'clue';

      // Pick a slot length that fits and has candidates
      const maxLen = Math.min(cols - c - 1, topoConfig.softMaxSlotLen);
      const validLengths = availableLengths.filter(l => l >= topoConfig.minSlotLen && l <= maxLen);
      
      if (validLengths.length === 0) {
        c++;
        continue;
      }

      const slotLen = validLengths[rng.nextInt(validLengths.length)];

      // Place letter cells for this slot
      for (let i = 1; i <= slotLen; i++) {
        if (c + i < cols) {
          grid[r][c + i] = 'letter';
        }
      }

      // Move past this slot + leave gap or add another clue
      c += slotLen + 1;
    }

    // Fill remaining cells in row as clue cells
    while (c < cols) {
      if (grid[r][c] === 'empty') grid[r][c] = 'clue';
      c++;
    }
  }
}

/**
 * Add vertical anchor clue cells to enable vertical slots.
 * Places clue cells at strategic positions in "off" rows.
 */
function addVerticalAnchors(
  grid: InternalCellType[][],
  rows: number,
  cols: number,
  minSlotLen: number,
  rng: SeededRandom
): void {
  // For each column, find places where we can create vertical slots
  const colStep = 2 + rng.nextInt(3); // every 2-4 columns

  for (let c = 0; c < cols; c += colStep) {
    // Look for vertical runs of empty/letter cells and add clue anchors
    let r = 0;
    while (r < rows - minSlotLen) {
      // If this cell is already a clue, the cells below might form a vertical slot
      if (grid[r][c] === 'clue') {
        r++;
        continue;
      }
      
      // If cell is empty, make it a clue cell to anchor a vertical slot
      if (grid[r][c] === 'empty') {
        grid[r][c] = 'clue';
        // Mark cells below as letter cells if they're empty
        let downLen = 0;
        for (let rr = r + 1; rr < rows && downLen < minSlotLen + rng.nextInt(4); rr++) {
          if (grid[rr][c] === 'empty') {
            grid[rr][c] = 'letter';
            downLen++;
          } else if (grid[rr][c] === 'letter') {
            downLen++;
          } else {
            break; // hit a clue cell
          }
        }
      }

      r += minSlotLen + 1 + rng.nextInt(2);
    }
  }
}

/**
 * Convert remaining empty cells to clue cells.
 */
function finalizeGrid(
  grid: InternalCellType[][],
  rows: number,
  cols: number
): void {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'empty') {
        grid[r][c] = 'clue';
      }
    }
  }
}

/**
 * Derive slots from the clue-cell layout.
 * For each clue cell, check RIGHT and DOWN for valid letter runs.
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

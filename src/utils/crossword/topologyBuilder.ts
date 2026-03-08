/**
 * Arrow Crossword Engine - Slot Topology Builder (v6)
 * 
 * Dataset-aware topology generation:
 * - Slot lengths are weighted by candidate supply (abundant lengths preferred)
 * - Slot count is controlled (8-12 target for ~137 word datasets)
 * - Intersections are built structurally via grid overlap
 * - Every slot must intersect at least one other slot
 * 
 * Strategy: place horizontal slots first with weighted lengths,
 * then add vertical slots at crossing columns.
 */

import { InternalCellType, Slot, SlotIntersection, GridConfig, TopologyConfig } from './types';
import { SeededRandom } from './seededRandom';

export interface TopologyResult {
  cellTypes: InternalCellType[][];
  slots: Slot[];
}

/**
 * Pick a slot length using weighted random selection based on candidate supply.
 * Lengths with more candidates are proportionally more likely to be chosen.
 */
function weightedLengthPick(
  availLens: number[],
  candidateLenHist: Map<number, number>,
  maxLen: number,
  rng: SeededRandom
): number {
  const validLens = availLens.filter(l => l <= maxLen);
  if (validLens.length === 0) return -1;

  // Build weighted distribution
  const weights: number[] = validLens.map(l => {
    const count = candidateLenHist.get(l) || 0;
    // Quadratic weighting: strongly favors abundant lengths
    // len5=32→1024, len7=35→1225, len3=7→49, len9=6→36
    return count * count;
  });

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return validLens[0];

  let r = rng.next() * totalWeight;
  for (let i = 0; i < validLens.length; i++) {
    r -= weights[i];
    if (r <= 0) return validLens[i];
  }
  return validLens[validLens.length - 1];
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

  // Get available word lengths sorted
  const availLens = candidateLenHist
    ? [...candidateLenHist.entries()]
        .filter(([l, c]) => l >= topoConfig.minSlotLen && c > 0)
        .map(([l]) => l)
        .sort((a, b) => a - b)
    : [3, 4, 5, 6, 7];

  if (availLens.length === 0) return null;

  // Build a budget tracker: how many of each length we can still use
  const lengthBudget = new Map<number, number>();
  if (candidateLenHist) {
    for (const [len, count] of candidateLenHist) {
      if (len >= topoConfig.minSlotLen) {
        // Reserve at most 80% of candidates for any length
        lengthBudget.set(len, Math.max(2, Math.floor(count * 0.8)));
      }
    }
  }

  // Initialize grid - all cells start as 'letter'
  const grid: InternalCellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): InternalCellType => 'letter')
  );

  // Track placed slots for budget management
  const placedSlots: { row: number; col: number; len: number; dir: 'right' | 'down' }[] = [];

  function consumeBudget(len: number): boolean {
    const remaining = lengthBudget.get(len);
    if (remaining === undefined || remaining <= 0) return false;
    lengthBudget.set(len, remaining - 1);
    return true;
  }

  function hasBudget(len: number): boolean {
    return (lengthBudget.get(len) || 0) > 0;
  }

  // Determine target slot count based on available candidates
  const totalCandidates = candidateLenHist
    ? [...candidateLenHist.values()].reduce((s, c) => s + c, 0)
    : 50;
  // Target: 8-10 slots for ~137 candidates. Less is more for solver success.
  const targetSlots = Math.max(7, Math.min(10, Math.floor(totalCandidates * 0.065)));

  // ─── PHASE 1: Place horizontal slots on selected rows ───
  // Use every 3rd row to leave room for vertical slots
  const rowStep = Math.max(2, Math.floor(rows / (Math.ceil(targetSlots * 0.6 / 1.5))));
  const hRows: number[] = [];
  for (let r = 0; r < rows; r += rowStep) {
    hRows.push(r);
  }
  // Limit to avoid overproduction
  const maxHRows = Math.min(hRows.length, Math.ceil(targetSlots * 0.7));

  let totalPlaced = 0;

  for (let ri = 0; ri < maxHRows && totalPlaced < targetSlots; ri++) {
    const r = hRows[ri];
    let c = 0;

    while (c < cols - topoConfig.minSlotLen && totalPlaced < targetSlots) {
      // Place clue cell
      grid[r][c] = 'clue';

      // Pick weighted length that fits and has budget
      const maxFit = cols - c - 1;
      const budgetedLens = availLens.filter(l => l <= maxFit && hasBudget(l));
      if (budgetedLens.length === 0) { c++; continue; }

      const len = weightedLengthPick(budgetedLens, candidateLenHist!, maxFit, rng);
      if (len <= 0) { c++; continue; }

      // Mark letter cells
      for (let i = 1; i <= len; i++) {
        if (c + i < cols) grid[r][c + i] = 'letter';
      }

      consumeBudget(len);
      placedSlots.push({ row: r, col: c + 1, len, dir: 'right' });
      totalPlaced++;

      c += len + 1; // Move past this slot + gap
    }
  }

  if (totalPlaced < 4) return null; // Need minimum slots

  // ─── PHASE 2: Add vertical slots at columns that cross horizontal slots ───
  // This ensures intersections
  const maxVertical = Math.min(
    Math.floor(targetSlots * 0.4),
    targetSlots - totalPlaced
  );

  // Find columns where letter cells exist on horizontal slot rows
  const candidateCols = rng.shuffle([...Array(cols).keys()]);
  let vCount = 0;

  for (const vc of candidateCols) {
    if (vCount >= maxVertical) break;

    // Find the best starting row for a vertical slot in this column
    for (let startR = 0; startR < rows - topoConfig.minSlotLen; startR++) {
      // Need a clue cell position - either already a clue or can be made one
      // Check if this position can host a downward clue
      const canBeClue = grid[startR][vc] === 'clue' || grid[startR][vc] === 'letter';
      if (!canBeClue) continue;

      // Count available letter cells below
      let downLen = 0;
      for (let rr = startR + 1; rr < rows; rr++) {
        if (grid[rr][vc] === 'letter') {
          downLen++;
        } else {
          break;
        }
      }

      if (downLen < topoConfig.minSlotLen) continue;

      // Pick a valid length from budget
      const validDown = availLens.filter(l => l <= downLen && hasBudget(l));
      if (validDown.length === 0) continue;

      const chosenLen = weightedLengthPick(validDown, candidateLenHist!, downLen, rng);
      if (chosenLen <= 0) continue;

      // Check that this vertical slot actually crosses at least one horizontal slot
      let crossesH = false;
      for (let i = 0; i < chosenLen; i++) {
        const checkRow = startR + 1 + i;
        // A letter cell that's also part of a horizontal slot = intersection
        for (const hs of placedSlots) {
          if (hs.dir === 'right' && hs.row === checkRow &&
              vc >= hs.col && vc < hs.col + hs.len) {
            crossesH = true;
            break;
          }
        }
        if (crossesH) break;
      }

      if (!crossesH) continue;

      // Place the vertical slot
      grid[startR][vc] = 'clue';

      // Terminate at the chosen length if needed
      if (startR + 1 + chosenLen < rows && grid[startR + 1 + chosenLen][vc] === 'letter') {
        grid[startR + 1 + chosenLen][vc] = 'clue';
      }

      consumeBudget(chosenLen);
      placedSlots.push({ row: startR + 1, col: vc, len: chosenLen, dir: 'down' });
      totalPlaced++;
      vCount++;
      break; // Move to next column
    }
  }

  // ─── PHASE 3: Derive formal slots from grid ───
  const slots = deriveSlots(grid, rows, cols, topoConfig.minSlotLen);

  if (slots.length < 6) return null;
  if (slots.length > topoConfig.targetSlotCountMax * 2) return null;

  // Feasibility check against candidate pool
  if (candidateLenHist) {
    const slotLenCount = new Map<number, number>();
    for (const slot of slots) {
      slotLenCount.set(slot.length, (slotLenCount.get(slot.length) || 0) + 1);
    }
    for (const [len, count] of slotLenCount) {
      if ((candidateLenHist.get(len) || 0) < count) return null;
    }
  }

  // Connectivity check: every slot must intersect at least one other
  const isolated = slots.filter(s => s.intersections.length === 0);
  if (isolated.length > slots.length * 0.15) return null;

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

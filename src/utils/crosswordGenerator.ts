/**
 * Backward-compatible wrapper around the new Arrow Crossword Engine.
 * 
 * Converts the new PuzzleResult format to the legacy GenerationResult
 * expected by Game.tsx and CrosswordGrid.tsx.
 * 
 * The old "place words first, derive clue structure later" approach
 * has been replaced by a slot-topology-first CSP engine.
 */

import { Cell, ClueCell, LetterCell, PlacedWord, WordItem, Direction, ClueEntry, PuzzleAnalytics } from '@/types/crossword';
import { generatePuzzle, normalizeAnswer } from './crossword';
import { PuzzleResult, Slot, AnswerCandidate } from './crossword/types';

// Re-export normalizeWord for any external consumers
export { normalizeAnswer as normalizeWord } from './crossword';

export interface GenerationResult {
  grid: Cell[][];
  placedWords: PlacedWord[];
  gridSize: string;
  analytics: PuzzleAnalytics;
  seed: number;
}

/**
 * Main entry point — backward compatible with the old API.
 * Internally delegates to the new clue-cell-driven engine.
 */
export function generateCrossword(
  words: WordItem[],
  seed: number
): GenerationResult {
  const result = generatePuzzle(words, seed);
  return convertToLegacy(result);
}

/**
 * Convert new PuzzleResult to legacy GenerationResult format.
 * Preserves full compatibility with CrosswordGrid, ClueList, and Game components.
 */
function convertToLegacy(result: PuzzleResult): GenerationResult {
  const { gridWidth, gridHeight, cellTypes, slots, assignments, analytics } = result;

  // Build assignment lookup: slotIndex → candidate
  const assignMap = new Map<number, AnswerCandidate>();
  for (const a of assignments) {
    assignMap.set(a.slotIndex, a.candidate);
  }

  // Build position lookup: "row,col" → [{ slotIndex, posInSlot }]
  const posMap = new Map<string, { slotIndex: number; posInSlot: number }[]>();
  for (const slot of slots) {
    const dr = slot.direction === 'down' ? 1 : 0;
    const dc = slot.direction === 'right' ? 1 : 0;
    for (let i = 0; i < slot.length; i++) {
      const key = `${slot.startRow + dr * i},${slot.startCol + dc * i}`;
      if (!posMap.has(key)) posMap.set(key, []);
      posMap.get(key)!.push({ slotIndex: slot.index, posInSlot: i });
    }
  }

  // Build grid
  const grid: Cell[][] = [];
  for (let r = 0; r < gridHeight; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < gridWidth; c++) {
      const cellType = cellTypes[r][c];

      if (cellType === 'clue' || cellType === 'empty') {
        // Build clue entries for slots originating from this clue cell
        const clueEntries: ClueEntry[] = [];
        for (const slot of slots) {
          if (slot.clueCellRow === r && slot.clueCellCol === c) {
            const candidate = assignMap.get(slot.index);
            if (candidate) {
              clueEntries.push({
                text: candidate.clueText,
                direction: slot.direction as Direction,
                wordIndex: slot.index,
              });
            }
          }
        }
        row.push({ type: 'clue', clues: clueEntries } as ClueCell);
      } else {
        // Letter cell
        const entries = posMap.get(`${r},${c}`) || [];
        const wordIndices = entries.map(e => e.slotIndex);
        let expectedLetter = '';

        for (const e of entries) {
          const candidate = assignMap.get(e.slotIndex);
          if (candidate) {
            expectedLetter = candidate.normalizedAnswer[e.posInSlot];
            break;
          }
        }

        row.push({
          type: 'letter',
          expectedLetter,
          userLetter: '',
          wordIndices,
          isRevealed: false,
        } as LetterCell);
      }
    }
    grid.push(row);
  }

  // Build placedWords
  const placedWords: PlacedWord[] = slots.map(slot => {
    const candidate = assignMap.get(slot.index)!;
    return {
      word: candidate.normalizedAnswer,
      clue: candidate.clueText,
      startRow: slot.startRow,
      startCol: slot.startCol,
      clueRow: slot.clueCellRow,
      clueCol: slot.clueCellCol,
      direction: slot.direction as Direction,
      index: slot.index,
      category: candidate.category,
      difficulty: candidate.difficulty,
    };
  });

  const gridSize = `${gridWidth}x${gridHeight}`;

  return {
    grid,
    placedWords,
    gridSize,
    analytics: {
      generation_time_ms: analytics.generation_time_ms,
      slot_count: analytics.slot_count,
      avg_word_length: analytics.avg_word_length,
      avg_intersection_count: analytics.avg_intersection_count,
      backtrack_count: analytics.backtrack_count,
      puzzle_score: analytics.puzzle_score,
      seed: result.seed,
      gridSize,
    },
    seed: result.seed,
  };
}

/**
 * Gameplay Validation — Pure functions for checking, revealing, and completing puzzles.
 * 
 * No generator dependencies. Operates on PuzzleDefinition + user state only.
 * Solution data comes from PuzzleDefinition.solution / clues[].answer.
 */

import { PuzzleDefinition, ClueDefinition } from '@/types/puzzle';
import { SolutionMap, CellRelationMap, coordKey } from '@/types/gameplayState';

// ─── Cell-level validation ──────────────────────────────────────────────────────

export interface CellCheckResult {
  x: number;
  y: number;
  correct: boolean;
  expected: string;
  actual: string;
}

/** Check a single cell against the solution. */
export function checkCell(
  x: number,
  y: number,
  userEntries: Map<string, string>,
  solutionMap: SolutionMap
): CellCheckResult {
  const key = coordKey(x, y);
  const expected = solutionMap.get(key) || '';
  const actual = userEntries.get(key) || '';
  return {
    x, y,
    correct: actual !== '' && actual === expected,
    expected,
    actual,
  };
}

// ─── Clue-level validation ──────────────────────────────────────────────────────

export interface ClueCheckResult {
  clueId: string;
  allFilled: boolean;
  allCorrect: boolean;
  incorrectCells: { x: number; y: number; expected: string; actual: string }[];
}

/** Check all cells of a specific clue. */
export function checkClue(
  clue: ClueDefinition,
  userEntries: Map<string, string>,
  pendingEntry?: { x: number; y: number; letter: string }
): ClueCheckResult {
  let allFilled = true;
  let allCorrect = true;
  const incorrectCells: { x: number; y: number; expected: string; actual: string }[] = [];

  for (let i = 0; i < clue.cells.length; i++) {
    const key = coordKey(clue.cells[i].x, clue.cells[i].y);
    let letter: string;

    if (pendingEntry && pendingEntry.x === clue.cells[i].x && pendingEntry.y === clue.cells[i].y) {
      letter = pendingEntry.letter;
    } else {
      letter = userEntries.get(key) || '';
    }

    const expected = clue.answer[i];

    if (!letter) {
      allFilled = false;
      allCorrect = false;
    } else if (letter !== expected) {
      allCorrect = false;
      incorrectCells.push({ x: clue.cells[i].x, y: clue.cells[i].y, expected, actual: letter });
    }
  }

  return { clueId: clue.id, allFilled, allCorrect, incorrectCells };
}

// ─── Puzzle-level validation ────────────────────────────────────────────────────

export interface PuzzleCheckResult {
  totalClues: number;
  correctClues: number;
  incorrectClues: number;
  unfilledClues: number;
  isComplete: boolean;
  incorrectCells: { x: number; y: number; expected: string; actual: string }[];
}

/** Check entire puzzle state. */
export function checkPuzzle(
  puzzle: PuzzleDefinition,
  userEntries: Map<string, string>
): PuzzleCheckResult {
  let correctClues = 0;
  let incorrectClues = 0;
  let unfilledClues = 0;
  const allIncorrectCells: { x: number; y: number; expected: string; actual: string }[] = [];

  for (const clue of puzzle.clues) {
    const result = checkClue(clue, userEntries);
    if (!result.allFilled) {
      unfilledClues++;
    } else if (result.allCorrect) {
      correctClues++;
    } else {
      incorrectClues++;
      allIncorrectCells.push(...result.incorrectCells);
    }
  }

  return {
    totalClues: puzzle.clues.length,
    correctClues,
    incorrectClues,
    unfilledClues,
    isComplete: correctClues === puzzle.clues.length,
    incorrectCells: allIncorrectCells,
  };
}

/** Check if puzzle is fully completed (all clues correct). */
export function isPuzzleFullyComplete(
  puzzle: PuzzleDefinition,
  completedClueIds: Set<string>
): boolean {
  return puzzle.clues.every(c => completedClueIds.has(c.id));
}

// ─── Find incorrect cells ───────────────────────────────────────────────────────

/** Find all cells where user entry doesn't match solution. */
export function findIncorrectCells(
  userEntries: Map<string, string>,
  solutionMap: SolutionMap
): CellCheckResult[] {
  const incorrect: CellCheckResult[] = [];
  for (const [key, expected] of solutionMap) {
    const actual = userEntries.get(key) || '';
    if (actual && actual !== expected) {
      const [x, y] = key.split(',').map(Number);
      incorrect.push({ x, y, correct: false, expected, actual });
    }
  }
  return incorrect;
}

// ─── Reveal functions ───────────────────────────────────────────────────────────

export interface RevealResult {
  cellKey: string;
  x: number;
  y: number;
  letter: string;
}

/** Reveal a single cell — returns the correct letter. */
export function revealCell(
  x: number,
  y: number,
  solutionMap: SolutionMap
): RevealResult | null {
  const key = coordKey(x, y);
  const letter = solutionMap.get(key);
  if (!letter) return null;
  return { cellKey: key, x, y, letter };
}

/** Reveal all cells of a clue — returns list of revealed cells. */
export function revealClue(
  clue: ClueDefinition
): RevealResult[] {
  return clue.cells.map((c, i) => ({
    cellKey: coordKey(c.x, c.y),
    x: c.x,
    y: c.y,
    letter: clue.answer[i],
  }));
}

/** Find the next empty/incorrect cell for hint system. */
export function findNextHintTarget(
  puzzle: PuzzleDefinition,
  userEntries: Map<string, string>,
  completedClueIds: Set<string>,
  revealedCells: Set<string>
): { clue: ClueDefinition; cellIndex: number } | null {
  for (const clue of puzzle.clues) {
    if (completedClueIds.has(clue.id)) continue;
    for (let i = 0; i < clue.cells.length; i++) {
      const key = coordKey(clue.cells[i].x, clue.cells[i].y);
      if (!userEntries.get(key) && !revealedCells.has(key)) {
        return { clue, cellIndex: i };
      }
    }
  }
  return null;
}

// ─── Completion metrics ─────────────────────────────────────────────────────────

export interface CompletionMetrics {
  completionStatus: 'incomplete' | 'complete' | 'perfect';
  totalClues: number;
  completedClues: number;
  hintsUsed: number;
  elapsedSeconds: number;
  score: number;
  wrongChecks: number;
}

export function buildCompletionMetrics(
  puzzle: PuzzleDefinition,
  completedClueIds: Set<string>,
  hintsUsed: number,
  startTime: number,
  score: number,
  wrongChecks: number
): CompletionMetrics {
  const completedClues = completedClueIds.size;
  const totalClues = puzzle.clues.length;
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  let completionStatus: 'incomplete' | 'complete' | 'perfect';
  if (completedClues < totalClues) {
    completionStatus = 'incomplete';
  } else if (hintsUsed === 0 && wrongChecks === 0) {
    completionStatus = 'perfect';
  } else {
    completionStatus = 'complete';
  }

  return {
    completionStatus,
    totalClues,
    completedClues,
    hintsUsed,
    elapsedSeconds,
    score,
    wrongChecks,
  };
}

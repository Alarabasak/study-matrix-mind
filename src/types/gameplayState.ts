/**
 * Gameplay State — Runtime state model for arrow crossword gameplay.
 * 
 * Separated from puzzle content (PuzzleDefinition = data, GameplayState = runtime).
 * No generator/solver/topology dependencies.
 */

import { PuzzleDefinition, ClueDefinition, ArrowDirection } from '@/types/puzzle';

// ─── Runtime state ──────────────────────────────────────────────────────────────

export interface CellCoord {
  x: number;
  y: number;
}

export interface GameplayState {
  puzzle: PuzzleDefinition;
  /** User entries: key = "x,y", value = uppercase letter or '' */
  userEntries: Map<string, string>;
  /** Currently selected cell */
  activeCell: CellCoord | null;
  /** Currently active clue */
  activeClueId: string | null;
  /** Active typing direction */
  activeDirection: ArrowDirection;
  /** Set of completed (correctly answered) clue IDs */
  completedClueIds: Set<string>;
  /** Set of revealed (hint-given) cell keys "x,y" */
  revealedCells: Set<string>;
  /** Is the entire puzzle completed? */
  isCompleted: boolean;
  /** Current score */
  score: number;
  /** Game start timestamp */
  startTime: number;
  /** Number of ad hints used */
  adHintsUsed: number;
}

// ─── Cell relation model ────────────────────────────────────────────────────────

export interface CellClueRelation {
  clueId: string;
  direction: ArrowDirection;
  /** Position of this cell within the clue's answer (0-indexed) */
  positionInAnswer: number;
  /** Total length of the answer */
  answerLength: number;
}

/** Pre-computed lookup: "x,y" → list of clue relations */
export type CellRelationMap = Map<string, CellClueRelation[]>;

/** Pre-computed solution lookup: "x,y" → correct letter */
export type SolutionMap = Map<string, string>;

// ─── Initializers ───────────────────────────────────────────────────────────────

export function coordKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function buildCellRelationMap(puzzle: PuzzleDefinition): CellRelationMap {
  const map: CellRelationMap = new Map();
  for (const clue of puzzle.clues) {
    for (let i = 0; i < clue.cells.length; i++) {
      const key = coordKey(clue.cells[i].x, clue.cells[i].y);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        clueId: clue.id,
        direction: clue.direction,
        positionInAnswer: i,
        answerLength: clue.answer.length,
      });
    }
  }
  return map;
}

export function buildSolutionMap(puzzle: PuzzleDefinition): SolutionMap {
  const map: SolutionMap = new Map();
  for (const sc of puzzle.solution) {
    map.set(coordKey(sc.x, sc.y), sc.letter);
  }
  return map;
}

export function createInitialGameplayState(puzzle: PuzzleDefinition): GameplayState {
  return {
    puzzle,
    userEntries: new Map(),
    activeCell: null,
    activeClueId: null,
    activeDirection: 'right',
    completedClueIds: new Set(),
    revealedCells: new Set(),
    isCompleted: false,
    score: 0,
    startTime: Date.now(),
    adHintsUsed: 0,
  };
}

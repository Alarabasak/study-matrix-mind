/**
 * Gameplay Utilities — Pure functions for arrow crossword interaction.
 * 
 * No React dependencies. No generator dependencies.
 * All functions operate on PuzzleDefinition + GameplayState.
 */

import { PuzzleDefinition, ClueDefinition, ArrowDirection } from '@/types/puzzle';
import {
  CellCoord,
  CellRelationMap,
  SolutionMap,
  coordKey,
} from '@/types/gameplayState';

// ─── Clue lookup ────────────────────────────────────────────────────────────────

export function getClueById(puzzle: PuzzleDefinition, clueId: string): ClueDefinition | undefined {
  return puzzle.clues.find(c => c.id === clueId);
}

export function getCluesForCell(
  cellRelations: CellRelationMap,
  x: number,
  y: number
): string[] {
  return (cellRelations.get(coordKey(x, y)) || []).map(r => r.clueId);
}

// ─── Active clue selection ──────────────────────────────────────────────────────

/**
 * When a letter cell is tapped, determine which clue should become active.
 * If already on the same cell, toggle to next clue.
 */
export function selectClueForCell(
  cellRelations: CellRelationMap,
  x: number,
  y: number,
  currentClueId: string | null,
  currentCell: CellCoord | null
): { clueId: string; direction: ArrowDirection } | null {
  const relations = cellRelations.get(coordKey(x, y));
  if (!relations || relations.length === 0) return null;

  // If tapping the same cell, toggle to next clue
  if (currentCell && currentCell.x === x && currentCell.y === y && relations.length > 1) {
    const currentIdx = relations.findIndex(r => r.clueId === currentClueId);
    const nextIdx = (currentIdx + 1) % relations.length;
    return { clueId: relations[nextIdx].clueId, direction: relations[nextIdx].direction };
  }

  // Prefer same direction as current if available
  if (currentClueId) {
    const currentRelation = relations.find(r => r.direction === (relations[0]?.direction));
    // Try to find one matching current direction preference
    const currentDir = relations.find(r => {
      const rel = cellRelations.get(coordKey(x, y));
      return rel?.some(rr => rr.clueId === currentClueId && rr.direction === r.direction);
    });
  }

  // Default: pick first relation
  return { clueId: relations[0].clueId, direction: relations[0].direction };
}

/**
 * Get all cell coordinates for the active clue's answer.
 */
export function getActiveClueCells(
  puzzle: PuzzleDefinition,
  clueId: string | null
): CellCoord[] {
  if (!clueId) return [];
  const clue = getClueById(puzzle, clueId);
  if (!clue) return [];
  return clue.cells.map(c => ({ x: c.x, y: c.y }));
}

/**
 * Get highlighted cell keys for the active clue.
 */
export function getHighlightedCellKeys(
  puzzle: PuzzleDefinition,
  clueId: string | null
): Set<string> {
  const cells = getActiveClueCells(puzzle, clueId);
  return new Set(cells.map(c => coordKey(c.x, c.y)));
}

// ─── Navigation ─────────────────────────────────────────────────────────────────

/**
 * Move to the next cell in the active clue's direction.
 * Skips revealed/completed cells.
 */
export function getNextCell(
  puzzle: PuzzleDefinition,
  clueId: string | null,
  currentCell: CellCoord,
  revealedCells: Set<string>,
  completedClueIds: Set<string>
): CellCoord | null {
  if (!clueId) return null;
  const clue = getClueById(puzzle, clueId);
  if (!clue) return null;

  const currentIdx = clue.cells.findIndex(c => c.x === currentCell.x && c.y === currentCell.y);
  if (currentIdx === -1) return null;

  // Find next non-revealed cell
  for (let i = currentIdx + 1; i < clue.cells.length; i++) {
    const key = coordKey(clue.cells[i].x, clue.cells[i].y);
    if (!revealedCells.has(key)) {
      return { x: clue.cells[i].x, y: clue.cells[i].y };
    }
  }

  return null;
}

/**
 * Move to the previous cell in the active clue's direction.
 * Skips revealed/completed cells.
 */
export function getPrevCell(
  puzzle: PuzzleDefinition,
  clueId: string | null,
  currentCell: CellCoord,
  revealedCells: Set<string>
): CellCoord | null {
  if (!clueId) return null;
  const clue = getClueById(puzzle, clueId);
  if (!clue) return null;

  const currentIdx = clue.cells.findIndex(c => c.x === currentCell.x && c.y === currentCell.y);
  if (currentIdx === -1) return null;

  for (let i = currentIdx - 1; i >= 0; i--) {
    const key = coordKey(clue.cells[i].x, clue.cells[i].y);
    if (!revealedCells.has(key)) {
      return { x: clue.cells[i].x, y: clue.cells[i].y };
    }
  }

  return null;
}

// Answer checking, puzzle completion, and hint functions
// have been moved to src/utils/gameplayValidation.ts
// Use: checkClue, isPuzzleFullyComplete, findNextHintTarget from there.

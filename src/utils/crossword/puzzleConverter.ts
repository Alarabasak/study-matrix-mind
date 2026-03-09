/**
 * Converts internal PuzzleResult to the canonical PuzzleDefinition format.
 */

import { PuzzleResult, SlotAssignment, AnswerCandidate } from './types';
import {
  PuzzleDefinition,
  GridCellDef,
  ClueCellDef,
  ClueDefinition,
  SolutionCell,
} from '@/types/puzzle';

/**
 * Convert a PuzzleResult (engine internal) to PuzzleDefinition (canonical).
 */
export function puzzleResultToDefinition(
  result: PuzzleResult,
  meta: { category: string; topic: string; title?: string }
): PuzzleDefinition {
  const { gridWidth, gridHeight, cellTypes, slots, assignments, analytics, seed } = result;

  // Build assignment lookup
  const assignMap = new Map<number, AnswerCandidate>();
  for (const a of assignments) {
    assignMap.set(a.slotIndex, a.candidate);
  }

  // Build cells grid
  const cells: GridCellDef[][] = [];
  // Track which clue cells have which arrows (built from slots)
  const clueCellArrows = new Map<string, ClueCellDef>();

  // Pre-build clue cell data from slots
  for (const slot of slots) {
    const key = `${slot.clueCellCol},${slot.clueCellRow}`;
    const candidate = assignMap.get(slot.index);
    if (!clueCellArrows.has(key)) {
      clueCellArrows.set(key, {
        type: 'clue',
        clueText: '',
        arrows: [],
      });
    }
    const clueCell = clueCellArrows.get(key)!;
    if (candidate) {
      clueCell.arrows.push({
        direction: slot.direction as 'right' | 'down',
        clueId: `clue_${slot.index}`,
      });
    }
  }

  for (let y = 0; y < gridHeight; y++) {
    const row: GridCellDef[] = [];
    for (let x = 0; x < gridWidth; x++) {
      const ct = cellTypes[y][x];
      const key = `${x},${y}`;

      if (ct === 'clue' || ct === 'empty') {
        const clueData = clueCellArrows.get(key);
        if (clueData) {
          row.push(clueData);
        } else {
          row.push({ type: 'clue', arrows: [] });
        }
      } else {
        row.push({ type: 'letter' });
      }
    }
    cells.push(row);
  }

  // Build clue definitions
  const clues: ClueDefinition[] = [];
  for (const slot of slots) {
    const candidate = assignMap.get(slot.index);
    if (!candidate) continue;

    const dr = slot.direction === 'down' ? 1 : 0;
    const dc = slot.direction === 'right' ? 1 : 0;
    const cellCoords = Array.from({ length: slot.length }, (_, i) => ({
      x: slot.startCol + dc * i,
      y: slot.startRow + dr * i,
    }));

    clues.push({
      id: `clue_${slot.index}`,
      text: candidate.clueText,
      startCell: { x: slot.clueCellCol, y: slot.clueCellRow },
      direction: slot.direction as 'right' | 'down',
      answer: candidate.normalizedAnswer,
      cells: cellCoords,
    });
  }

  // Build solution
  const solution: SolutionCell[] = [];
  const solutionMap = new Map<string, string>();
  for (const clue of clues) {
    for (let i = 0; i < clue.answer.length; i++) {
      const key = `${clue.cells[i].x},${clue.cells[i].y}`;
      if (!solutionMap.has(key)) {
        solutionMap.set(key, clue.answer[i]);
        solution.push({ x: clue.cells[i].x, y: clue.cells[i].y, letter: clue.answer[i] });
      }
    }
  }

  return {
    id: `puzzle_${seed}`,
    title: meta.title || `${meta.category} - ${meta.topic}`,
    category: meta.category,
    topic: meta.topic,
    difficulty: Math.round(
      clues.reduce((s, c) => s + (assignMap.get(parseInt(c.id.split('_')[1]))?.difficulty || 3), 0) / clues.length
    ),
    estimatedMinutes: Math.max(3, Math.round(clues.length * 0.8)),
    gridWidth,
    gridHeight,
    cells,
    clues,
    solution,
    metadata: {
      seed,
      generatorVersion: '2.0',
      createdAt: new Date().toISOString(),
      analytics: {
        generation_time_ms: analytics.generation_time_ms,
        slot_count: analytics.slot_count,
        avg_word_length: analytics.avg_word_length,
        avg_intersection_count: analytics.avg_intersection_count,
        backtrack_count: analytics.backtrack_count,
        puzzle_score: analytics.puzzle_score,
        topology_attempts: analytics.topology_attempts,
        solver_attempts: analytics.solver_attempts,
      },
    },
  };
}

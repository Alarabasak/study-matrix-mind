/**
 * Arrow Crossword Engine - Puzzle Analytics
 * 
 * Computes quality metrics and scoring for generated puzzles.
 * These analytics support the difficulty model and quality filtering.
 */

import { Slot, SlotAssignment, PuzzleAnalyticsData, GridConfig } from './types';

export function computeAnalytics(
  slots: Slot[],
  assignments: SlotAssignment[],
  generationTimeMs: number,
  backtrackCount: number,
  seed: number,
  gridConfig: GridConfig,
  topologyAttempts: number,
  solverAttempts: number
): PuzzleAnalyticsData {
  const slotCount = slots.length;

  // Average word length
  const avgWordLength = slotCount > 0
    ? slots.reduce((sum, s) => sum + s.length, 0) / slotCount
    : 0;

  // Average intersections per slot
  const avgIntersectionCount = slotCount > 0
    ? slots.reduce((sum, s) => sum + s.intersections.length, 0) / slotCount
    : 0;

  // Average difficulty from assigned words
  const avgDifficulty = assignments.length > 0
    ? assignments.reduce((sum, a) => sum + a.candidate.difficulty, 0) / assignments.length
    : 0;

  // Composite puzzle score (higher = harder/more complex)
  const puzzleScore = Math.round(
    (avgWordLength * 1.5 + avgIntersectionCount * 2 + avgDifficulty * 3) * 10
  ) / 10;

  const gridSize = `${gridConfig.cols}x${gridConfig.rows}`;

  return {
    generation_time_ms: Math.round(generationTimeMs),
    slot_count: slotCount,
    avg_word_length: Math.round(avgWordLength * 10) / 10,
    avg_intersection_count: Math.round(avgIntersectionCount * 10) / 10,
    backtrack_count: backtrackCount,
    puzzle_score: puzzleScore,
    seed,
    gridSize,
    topology_attempts: topologyAttempts,
    solver_attempts: solverAttempts,
  };
}

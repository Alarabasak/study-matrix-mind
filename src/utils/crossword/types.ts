/**
 * Arrow Crossword (Çengel Bulmaca) Engine - Domain Types
 * 
 * Core domain model for a clue-cell-driven arrow crossword generator.
 * Slots are defined by clue cells and directions, NOT by placed words.
 */

export type ClueDirection = 'right' | 'down';

/** Reference to a clue within a clue cell. Future-ready for image clues. */
export interface ClueRef {
  clueId: string;
  direction: ClueDirection;
  text: string;
  type: 'text' | 'image';
  lang?: string;
  assetUrl?: string;
}

/** Data stored in a clue cell: up to one RIGHT and one DOWN clue. */
export interface ClueCellData {
  right?: ClueRef;
  down?: ClueRef;
}

/** Internal cell type during topology generation. */
export type InternalCellType = 'empty' | 'clue' | 'letter';

/** Describes how two slots intersect at a shared letter cell. */
export interface SlotIntersection {
  otherSlotIndex: number;
  posInThis: number;
  posInOther: number;
}

/** A slot is a contiguous sequence of letter cells anchored by a clue cell. */
export interface Slot {
  index: number;
  direction: ClueDirection;
  startRow: number;
  startCol: number;
  clueCellRow: number;
  clueCellCol: number;
  length: number;
  intersections: SlotIntersection[];
}

/** A word candidate prepared for the CSP solver. */
export interface AnswerCandidate {
  id: string;
  rawAnswer: string;
  normalizedAnswer: string;
  clueText: string;
  clueType: 'text' | 'image';
  category: string;
  topic: string;
  difficulty: number;
  frequencyScore: number;
}

/** Assignment of a candidate answer to a slot. */
export interface SlotAssignment {
  slotIndex: number;
  candidate: AnswerCandidate;
}

/** Analytics data for a generated puzzle. */
export interface PuzzleAnalyticsData {
  generation_time_ms: number;
  slot_count: number;
  avg_word_length: number;
  avg_intersection_count: number;
  backtrack_count: number;
  puzzle_score: number;
  seed: number;
  gridSize: string;
  topology_attempts: number;
  solver_attempts: number;
}

/** Complete generated puzzle result. */
export interface PuzzleResult {
  seed: number;
  gridWidth: number;
  gridHeight: number;
  cellTypes: InternalCellType[][];
  slots: Slot[];
  assignments: SlotAssignment[];
  analytics: PuzzleAnalyticsData;
}

/** Grid size configuration. */
export interface GridConfig {
  rows: number;
  cols: number;
  label: string;
}

/** Topology generation configuration. */
export interface TopologyConfig {
  minSlotLen: number;
  softMaxSlotLen: number;
  targetSlotCountMin: number;
  targetSlotCountMax: number;
}

/** CSP solver configuration. */
export interface SolverConfig {
  maxBacktracks: number;
}

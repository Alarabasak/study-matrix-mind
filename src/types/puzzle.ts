/**
 * PuzzleDefinition — Canonical data model for Arrow Crossword (Çengel Bulmaca).
 *
 * This is the single source of truth for puzzle data.
 * The game engine renders directly from this structure.
 * Legacy Cell[][]/PlacedWord[] adapters exist only for backward compatibility.
 */

// ─── Grid dimensions ───────────────────────────────────────────────────────────

/** Supported grid dimension pairs. Only these are valid. */
export const SUPPORTED_GRID_SIZES = [
  { width: 12, height: 12 },
  { width: 16, height: 12 },
  { width: 12, height: 16 },
] as const;

export type SupportedGridSize = typeof SUPPORTED_GRID_SIZES[number];

export function isValidGridSize(width: number, height: number): boolean {
  return SUPPORTED_GRID_SIZES.some(s => s.width === width && s.height === height);
}

export function getGridSizeLabel(width: number, height: number): string {
  return `${width}x${height}`;
}

// ─── Arrow direction ────────────────────────────────────────────────────────────

/**
 * Arrow directions for clue cells.
 * MVP: 'right' and 'down'.
 * Future: 'down-right', 'down-left', 'right-down', etc.
 */
export type ArrowDirection = 'right' | 'down';

// ─── Grid cells ─────────────────────────────────────────────────────────────────

export interface BlockCell {
  type: 'block';
}

export interface LetterCellDef {
  type: 'letter';
  /** Optional label (e.g. cell number) */
  label?: string;
}

export interface ClueCellArrow {
  direction: ArrowDirection;
  clueId: string;
}

export interface ClueCellDef {
  type: 'clue';
  /** Clue text shown inside the clue cell (short form) */
  clueText?: string;
  /** Up to 2 arrows: one right, one down */
  arrows: ClueCellArrow[];
}

export type GridCellDef = BlockCell | LetterCellDef | ClueCellDef;

export interface GridCell {
  x: number;
  y: number;
  cell: GridCellDef;
}

// ─── Clue definitions ───────────────────────────────────────────────────────────

export interface ClueDefinition {
  id: string;
  text: string;
  /** The clue cell position that anchors this clue */
  startCell: { x: number; y: number };
  direction: ArrowDirection;
  /** The correct answer (normalized uppercase) */
  answer: string;
  /** Ordered coordinates of letter cells this answer occupies */
  cells: { x: number; y: number }[];
}

// ─── Solution ───────────────────────────────────────────────────────────────────

export interface SolutionCell {
  x: number;
  y: number;
  letter: string;
}

// ─── Puzzle metadata ────────────────────────────────────────────────────────────

export interface PuzzleMetadata {
  author?: string;
  createdAt?: string;
  generatorVersion?: string;
  seed?: number;
  /** Generation analytics */
  analytics?: {
    generation_time_ms: number;
    slot_count: number;
    avg_word_length: number;
    avg_intersection_count: number;
    backtrack_count: number;
    puzzle_score: number;
    topology_attempts?: number;
    solver_attempts?: number;
  };
}

// ─── PuzzleDefinition ───────────────────────────────────────────────────────────

export interface PuzzleDefinition {
  id: string;
  title: string;
  category: string;
  topic: string;
  difficulty: number;
  estimatedMinutes: number;
  gridWidth: number;
  gridHeight: number;
  /** Row-major grid: cells[y][x] */
  cells: GridCellDef[][];
  clues: ClueDefinition[];
  solution: SolutionCell[];
  metadata: PuzzleMetadata;
}

// ─── Validation ─────────────────────────────────────────────────────────────────

export interface PuzzleValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePuzzleDefinition(puzzle: PuzzleDefinition): PuzzleValidationResult {
  const errors: string[] = [];

  // Grid size validation
  if (!isValidGridSize(puzzle.gridWidth, puzzle.gridHeight)) {
    errors.push(
      `Invalid grid size ${puzzle.gridWidth}x${puzzle.gridHeight}. ` +
      `Supported: ${SUPPORTED_GRID_SIZES.map(s => `${s.width}x${s.height}`).join(', ')}`
    );
  }

  // Cell grid dimensions
  if (puzzle.cells.length !== puzzle.gridHeight) {
    errors.push(`cells row count ${puzzle.cells.length} != gridHeight ${puzzle.gridHeight}`);
  }
  for (let y = 0; y < puzzle.cells.length; y++) {
    if (puzzle.cells[y].length !== puzzle.gridWidth) {
      errors.push(`cells row ${y} col count ${puzzle.cells[y].length} != gridWidth ${puzzle.gridWidth}`);
    }
  }

  // Clue validation
  for (const clue of puzzle.clues) {
    if (clue.answer.length !== clue.cells.length) {
      errors.push(`Clue "${clue.id}": answer length ${clue.answer.length} != cells count ${clue.cells.length}`);
    }
    // Check cells are within bounds
    for (const c of clue.cells) {
      if (c.x < 0 || c.x >= puzzle.gridWidth || c.y < 0 || c.y >= puzzle.gridHeight) {
        errors.push(`Clue "${clue.id}": cell (${c.x},${c.y}) out of bounds`);
      }
    }
  }

  // Solution validation
  for (const sc of puzzle.solution) {
    if (sc.x < 0 || sc.x >= puzzle.gridWidth || sc.y < 0 || sc.y >= puzzle.gridHeight) {
      errors.push(`Solution cell (${sc.x},${sc.y}) out of bounds`);
    }
  }

  return { valid: errors.length === 0, errors };
}

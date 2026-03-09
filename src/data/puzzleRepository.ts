/**
 * PuzzleRepository — Content loading interface for arrow crossword puzzles.
 * 
 * Runtime gameplay uses ONLY this interface to access puzzles.
 * No generator, solver, topology, or word database dependencies.
 * 
 * Implementations:
 * - StaticPuzzleRepository: loads from bundled JSON / static data (runtime default)
 * - GeneratedPuzzleRepository: (experimental) generates puzzles at load-time
 */

import { PuzzleDefinition, validatePuzzleDefinition } from '@/types/puzzle';

// ─── Repository types ───────────────────────────────────────────────────────────

export interface PuzzlePack {
  packId: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  topic: string;
  difficulty: number;
  levelCount: number;
}

export interface PuzzleLevelInfo {
  levelId: string;
  packId: string;
  title: string;
  difficulty: number;
  gridSize: string;
  clueCount: number;
  estimatedMinutes: number;
}

// ─── Repository interface ───────────────────────────────────────────────────────

export interface PuzzleRepository {
  /** List available puzzle packs */
  getPacks(): Promise<PuzzlePack[]>;

  /** List levels within a pack */
  getPackLevels(packId: string): Promise<PuzzleLevelInfo[]>;

  /** Load a specific puzzle by ID */
  getPuzzleById(puzzleId: string): Promise<PuzzleDefinition | null>;

  /** Load puzzles by category */
  getPuzzlesByCategory(category: string): Promise<PuzzleDefinition[]>;

  /** Load a puzzle by pack and level */
  getPuzzleByPackLevel(packId: string, levelId: string): Promise<PuzzleDefinition | null>;

  /** Get a random puzzle from a category (for quick play) */
  getRandomPuzzle(category: string, seed?: number): Promise<PuzzleDefinition | null>;
}

// ─── Validation wrapper ─────────────────────────────────────────────────────────

export function validateAndReturn(puzzle: PuzzleDefinition): PuzzleDefinition {
  const result = validatePuzzleDefinition(puzzle);
  if (!result.valid) {
    console.error('[PuzzleRepository] Validation failed:', result.errors);
    throw new Error(`Invalid puzzle "${puzzle.id}": ${result.errors.join(', ')}`);
  }
  return puzzle;
}

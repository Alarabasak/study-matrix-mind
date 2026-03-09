/**
 * Puzzle Loader — Content-driven puzzle loading.
 * 
 * This is the single entry point for loading puzzles into the game.
 * It delegates to the StaticPuzzleRepository.
 * 
 * Runtime gameplay NEVER touches generator internals through this file.
 * No WordItem[], no generator pipeline, no topology/CSP solver.
 * 
 * Data flow:
 *   Pack/Level selection → loadPuzzleByPackLevel() → PuzzleDefinition
 *   Quick play → loadPuzzleByCategory() → PuzzleDefinition
 *   Direct ID → loadPuzzleById() → PuzzleDefinition
 */

import { PuzzleDefinition } from '@/types/puzzle';
import { staticPuzzleRepository } from '@/data/staticPuzzleRepository';
import { PuzzlePack, PuzzleLevelInfo } from '@/data/puzzleRepository';

const repo = staticPuzzleRepository;

// ─── Primary loading functions ──────────────────────────────────────────────────

/** Load a puzzle by pack ID and level index */
export async function loadPuzzleByPackLevel(
  packId: string,
  levelId: string
): Promise<PuzzleDefinition | null> {
  return repo.getPuzzleByPackLevel(packId, levelId);
}

/** Load a puzzle by its unique ID */
export async function loadPuzzleById(
  puzzleId: string
): Promise<PuzzleDefinition | null> {
  return repo.getPuzzleById(puzzleId);
}

/** Load a random puzzle from a category (for quick play) */
export async function loadPuzzleByCategory(
  category: string
): Promise<PuzzleDefinition | null> {
  return repo.getRandomPuzzle(category);
}

// ─── Content discovery ──────────────────────────────────────────────────────────

/** List all available packs */
export async function listPacks(): Promise<PuzzlePack[]> {
  return repo.getPacks();
}

/** List levels within a pack */
export async function listPackLevels(packId: string): Promise<PuzzleLevelInfo[]> {
  return repo.getPackLevels(packId);
}

// ─── Legacy compatibility (deprecated) ──────────────────────────────────────────

/**
 * @deprecated Use loadPuzzleByPackLevel or loadPuzzleByCategory instead.
 * Kept temporarily for backward compatibility during migration.
 */
export async function loadPuzzleForGameplay(
  category: string,
  _seed?: number,
  _difficulty?: string
): Promise<PuzzleDefinition | null> {
  console.warn('[PuzzleLoader] loadPuzzleForGameplay is deprecated. Use loadPuzzleByPackLevel or loadPuzzleByCategory.');
  return loadPuzzleByCategory(category);
}

/**
 * Puzzle Loader — Content-driven puzzle loading.
 * 
 * This is the single entry point for loading puzzles into the game.
 * It delegates to the PuzzleRepository interface.
 * Runtime gameplay NEVER touches generator internals through this file.
 */

import { PuzzleDefinition } from '@/types/puzzle';
import { DifficultyLevel } from '@/types/crossword';
import { loadPuzzle as loadFromGeneratedRepo } from '@/data/generatedPuzzleRepository';

/**
 * Load a puzzle for gameplay.
 * 
 * Currently backed by GeneratedPuzzleRepository (generates + caches).
 * Will be replaced by static/API content in the future.
 */
export async function loadPuzzleForGameplay(
  category: string,
  seed: number,
  difficulty: DifficultyLevel = 'all'
): Promise<PuzzleDefinition | null> {
  return loadFromGeneratedRepo(category, seed, difficulty);
}

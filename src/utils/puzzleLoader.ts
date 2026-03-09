/**
 * Puzzle Loader — Generation-time adapter.
 * 
 * This is the ONLY place where the generator pipeline is called.
 * It produces a PuzzleDefinition from WordItems.
 * Runtime gameplay never touches generator internals.
 */

import { WordItem } from '@/types/crossword';
import { PuzzleDefinition, validatePuzzleDefinition } from '@/types/puzzle';
import { generatePuzzleDefinition } from '@/utils/crossword';

/**
 * Generate a PuzzleDefinition from word items.
 * This wraps the generator pipeline and returns the canonical format.
 */
export function loadGeneratedPuzzle(
  words: WordItem[],
  seed: number,
  category: string,
  categoryName: string,
  topic: string = 'general'
): PuzzleDefinition {
  const puzzle = generatePuzzleDefinition(words, seed, {
    category,
    topic,
    title: `${categoryName} Bulmaca`,
  });

  const validation = validatePuzzleDefinition(puzzle);
  if (!validation.valid) {
    console.warn('[PuzzleLoader] Validation warnings:', validation.errors);
  }

  return puzzle;
}

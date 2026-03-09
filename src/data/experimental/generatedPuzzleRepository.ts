/**
 * Generated Puzzle Repository
 * 
 * Generates puzzles from word database ON DEMAND at load-time,
 * then caches them as PuzzleDefinition objects.
 * 
 * This is a LOADER — not a gameplay dependency.
 * Game.tsx receives a PuzzleDefinition from this repository
 * and never touches the generator pipeline.
 * 
 * Generation is isolated behind the PuzzleRepository interface.
 */

import { PuzzleDefinition } from '@/types/puzzle';
import { WordItem, DifficultyLevel } from '@/types/crossword';
import {
  PuzzleRepository,
  PuzzlePack,
  PuzzleLevelInfo,
  validateAndReturn,
} from '../puzzleRepository';
import { categories } from '../questions';
import { getWordsForDifficulty } from '@/utils/wordDatabase';
import { generatePuzzleDefinition } from '@/utils/crossword';

// ─── Cache ──────────────────────────────────────────────────────────────────────

const puzzleCache = new Map<string, PuzzleDefinition>();

function getCacheKey(category: string, seed: number): string {
  return `gen_${category}_${seed}`;
}

// ─── Implementation ─────────────────────────────────────────────────────────────

async function generateAndCache(
  category: string,
  categoryName: string,
  seed: number,
  difficulty: DifficultyLevel = 'all'
): Promise<PuzzleDefinition> {
  const cacheKey = getCacheKey(category, seed);

  // Return cached if available
  const cached = puzzleCache.get(cacheKey);
  if (cached) return cached;

  // Generate: this is the ONLY place generator is called
  const words = await getWordsForDifficulty(category, difficulty, seed);
  if (words.length < 8) {
    throw new Error(`Insufficient words for category "${category}": ${words.length}`);
  }

  const puzzle = generatePuzzleDefinition(words, seed, {
    category,
    topic: 'generated',
    title: `${categoryName} Bulmaca`,
  });

  // Override ID to include seed for uniqueness
  puzzle.id = cacheKey;

  // Validate and cache
  const validated = validateAndReturn(puzzle);
  puzzleCache.set(cacheKey, validated);

  return validated;
}

// ─── PuzzleRepository implementation ────────────────────────────────────────────

export const generatedPuzzleRepository: PuzzleRepository = {
  async getPacks(): Promise<PuzzlePack[]> {
    return categories.map(cat => ({
      packId: cat.id,
      category: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      topic: cat.description,
      difficulty: 3,
      levelCount: -1, // unlimited for generated
    }));
  },

  async getPackLevels(packId: string): Promise<PuzzleLevelInfo[]> {
    // Generated puzzles don't have fixed levels
    return [];
  },

  async getPuzzleById(puzzleId: string): Promise<PuzzleDefinition | null> {
    return puzzleCache.get(puzzleId) || null;
  },

  async getPuzzlesByCategory(category: string): Promise<PuzzleDefinition[]> {
    const results: PuzzleDefinition[] = [];
    for (const [key, puzzle] of puzzleCache) {
      if (puzzle.category === category) results.push(puzzle);
    }
    return results;
  },

  async getPuzzleByPackLevel(packId: string, levelId: string): Promise<PuzzleDefinition | null> {
    const key = `gen_${packId}_${levelId}`;
    return puzzleCache.get(key) || null;
  },

  async getRandomPuzzle(category: string, seed?: number): Promise<PuzzleDefinition | null> {
    const actualSeed = seed ?? Date.now();
    const cat = categories.find(c => c.id === category);
    if (!cat) return null;

    try {
      return await generateAndCache(category, cat.name, actualSeed);
    } catch (e) {
      console.error('[GeneratedPuzzleRepo] Failed:', e);
      return null;
    }
  },
};

/**
 * Direct load function for Game.tsx — clean API.
 * Returns a PuzzleDefinition or null.
 */
export async function loadPuzzle(
  category: string,
  seed: number,
  difficulty: DifficultyLevel = 'all'
): Promise<PuzzleDefinition | null> {
  const cat = categories.find(c => c.id === category);
  if (!cat) {
    // Handle shuffle mode
    if (category === 'shuffle') {
      try {
        return await generateAndCacheForShuffle(seed, difficulty);
      } catch (e) {
        console.error('[PuzzleLoader] Shuffle failed:', e);
        return null;
      }
    }
    return null;
  }

  try {
    return await generateAndCache(category, cat.name, seed, difficulty);
  } catch (e) {
    console.error('[PuzzleLoader] Failed:', e);
    return null;
  }
}

async function generateAndCacheForShuffle(
  seed: number,
  difficulty: DifficultyLevel
): Promise<PuzzleDefinition> {
  const cacheKey = getCacheKey('shuffle', seed);
  const cached = puzzleCache.get(cacheKey);
  if (cached) return cached;

  const words = await getWordsForDifficulty('shuffle', difficulty, seed);
  if (words.length < 8) {
    throw new Error(`Insufficient words for shuffle mode: ${words.length}`);
  }

  const puzzle = generatePuzzleDefinition(words, seed, {
    category: 'shuffle',
    topic: 'mixed',
    title: 'Karışık Bulmaca',
  });

  puzzle.id = cacheKey;
  const validated = validateAndReturn(puzzle);
  puzzleCache.set(cacheKey, validated);
  return validated;
}

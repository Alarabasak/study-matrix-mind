/**
 * Static Puzzle Repository — Content-driven puzzle loading.
 * 
 * Runtime gameplay loads ONLY from prebuilt PuzzleDefinition records.
 * No generator, solver, topology, or word database dependencies.
 * 
 * Content is organized as: Category → Pack → Level → PuzzleDefinition
 */

import { PuzzleDefinition } from '@/types/puzzle';
import {
  PuzzleRepository,
  PuzzlePack,
  PuzzleLevelInfo,
  validateAndReturn,
} from './puzzleRepository';

// ─── Static content imports ─────────────────────────────────────────────────────

import puzzle12x12 from '@/data/examples/puzzle-12x12-example.json';
import puzzle16x12 from '@/data/examples/puzzle-16x12-example.json';

// ─── Content Registry ───────────────────────────────────────────────────────────

export interface ContentPack {
  packId: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  topic: string;
  difficulty: number;
  levels: PuzzleDefinition[];
}

/** All prebuilt content, organized by pack */
const CONTENT_PACKS: ContentPack[] = [
  {
    packId: 'tyt-mat-temel',
    category: 'tyt-mat',
    categoryName: 'TYT Matematik',
    categoryIcon: '∑',
    topic: 'Temel Kavramlar',
    difficulty: 3,
    levels: [puzzle12x12 as unknown as PuzzleDefinition],
  },
  {
    packId: 'tyt-mat-cebir',
    category: 'tyt-mat',
    categoryName: 'TYT Matematik',
    categoryIcon: '∑',
    topic: 'Cebir',
    difficulty: 4,
    levels: [puzzle12x12 as unknown as PuzzleDefinition], // placeholder — same puzzle for now
  },
  {
    packId: 'ayt-fiz-kuvvet',
    category: 'ayt-fiz',
    categoryName: 'AYT Fizik',
    categoryIcon: '⚡',
    topic: 'Kuvvet ve Hareket',
    difficulty: 4,
    levels: [puzzle16x12 as unknown as PuzzleDefinition],
  },
];

// ─── Index maps (built once) ────────────────────────────────────────────────────

const packMap = new Map<string, ContentPack>();
const puzzleByIdMap = new Map<string, PuzzleDefinition>();
const packsByCategory = new Map<string, ContentPack[]>();

function ensureIndexed() {
  if (packMap.size > 0) return;

  for (const pack of CONTENT_PACKS) {
    packMap.set(pack.packId, pack);

    // Category index
    const list = packsByCategory.get(pack.category) || [];
    list.push(pack);
    packsByCategory.set(pack.category, list);

    // Puzzle ID index
    for (const puzzle of pack.levels) {
      puzzleByIdMap.set(puzzle.id, puzzle);
    }
  }
}

// ─── Repository implementation ──────────────────────────────────────────────────

export const staticPuzzleRepository: PuzzleRepository = {
  async getPacks(): Promise<PuzzlePack[]> {
    ensureIndexed();
    return CONTENT_PACKS.map(pack => ({
      packId: pack.packId,
      category: pack.category,
      categoryName: pack.categoryName,
      categoryIcon: pack.categoryIcon,
      topic: pack.topic,
      difficulty: pack.difficulty,
      levelCount: pack.levels.length,
    }));
  },

  async getPackLevels(packId: string): Promise<PuzzleLevelInfo[]> {
    ensureIndexed();
    const pack = packMap.get(packId);
    if (!pack) return [];

    return pack.levels.map((puzzle, index) => ({
      levelId: `${index}`,
      packId: pack.packId,
      title: puzzle.title || `Level ${index + 1}`,
      difficulty: puzzle.difficulty,
      gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
      clueCount: puzzle.clues.length,
      estimatedMinutes: puzzle.estimatedMinutes || 5,
    }));
  },

  async getPuzzleById(puzzleId: string): Promise<PuzzleDefinition | null> {
    ensureIndexed();
    const puzzle = puzzleByIdMap.get(puzzleId);
    if (!puzzle) return null;
    return validateAndReturn(puzzle);
  },

  async getPuzzlesByCategory(category: string): Promise<PuzzleDefinition[]> {
    ensureIndexed();
    const packs = packsByCategory.get(category) || [];
    return packs.flatMap(p => p.levels);
  },

  async getPuzzleByPackLevel(packId: string, levelId: string): Promise<PuzzleDefinition | null> {
    ensureIndexed();
    const pack = packMap.get(packId);
    if (!pack) return null;

    const levelIndex = parseInt(levelId, 10);
    if (isNaN(levelIndex) || levelIndex < 0 || levelIndex >= pack.levels.length) return null;

    return validateAndReturn(pack.levels[levelIndex]);
  },

  async getRandomPuzzle(category: string): Promise<PuzzleDefinition | null> {
    ensureIndexed();
    const packs = packsByCategory.get(category) || [];
    const allPuzzles = packs.flatMap(p => p.levels);
    if (allPuzzles.length === 0) return null;

    const index = Math.floor(Math.random() * allPuzzles.length);
    return validateAndReturn(allPuzzles[index]);
  },
};

// ─── Convenience functions ──────────────────────────────────────────────────────

/** Get all available categories that have content */
export function getAvailableCategories(): string[] {
  ensureIndexed();
  return Array.from(packsByCategory.keys());
}

/** Get packs for a specific category */
export function getPacksForCategory(category: string): ContentPack[] {
  ensureIndexed();
  return packsByCategory.get(category) || [];
}
